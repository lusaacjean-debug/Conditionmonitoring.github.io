/*!
 * CM Belt Life — calculation engine
 * Conveyor belt remaining-life assessment using independent "life clocks".
 * Pure functions, no DOM. Works in the browser (window.BeltEngine) and Node (module.exports).
 * See docs/METHODOLOGY.md for the method, formulas and default limits.
 */
(function (root) {
  'use strict';

  var VERSION = '1.0.0';
  var DAY_MS = 86400000;

  /** Default limits. Override per site in belt.limits; always check against the belt manufacturer's data. */
  var LIMITS = {
    sfMin: { EP: 8.0, ST: 6.7 },          // minimum working safety factor (DIN 22101 / CEMA practice)
    sfWatchMargin: 1.15,                  // SF within 15 % of the minimum -> watch
    takeupCritical: 0.90,                 // fraction of take-up travel used
    takeupWatch: 0.75,
    lifeCriticalDays: 90,                 // remaining life below this -> critical
    lifeWatchDays: 365,                   // remaining life below this -> plan replacement
    spliceGrowthWatch: 5,                 // mm splice length change (steel cord)
    spliceGrowthCritical: 10,
    spliceDeltaTWatch: 10,                // degC splice above belt body (IR)
    spliceDeltaTCritical: 20,
    hardnessRiseWatch: 10,                // Shore A rise from new
    hardnessRiseCritical: 15,
    centreWearRatio: 1.5,                 // centre wear vs edge wear -> loading-zone wear
    asymmetryMm: 1.0                      // left vs right wear difference -> off-centre load / mistracking
  };

  var POSITIONS = ['L edge', 'L mid', 'Centre', 'R mid', 'R edge'];
  var WEIGHTS = { wear: 0.35, strength: 0.25, splices: 0.15, takeup: 0.10, condition: 0.15 };

  // ---------- helpers ----------
  function num(v) { var n = parseFloat(v); return isFinite(n) ? n : null; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function daysBetween(a, b) { return (new Date(b) - new Date(a)) / DAY_MS; }
  function addDays(d, n) { var x = new Date(d); x.setTime(x.getTime() + n * DAY_MS); return x; }
  function isoDate(d) { return new Date(d).toISOString().slice(0, 10); }
  function validDate(d) { return d && !isNaN(new Date(d).getTime()); }
  function round(v, dp) { var p = Math.pow(10, dp || 0); return Math.round(v * p) / p; }

  function linreg(xs, ys) {
    var n = xs.length; if (n < 2) return null;
    var mx = 0, my = 0, i;
    for (i = 0; i < n; i++) { mx += xs[i]; my += ys[i]; }
    mx /= n; my /= n;
    var sxx = 0, sxy = 0, syy = 0;
    for (i = 0; i < n; i++) { sxx += (xs[i] - mx) * (xs[i] - mx); sxy += (xs[i] - mx) * (ys[i] - my); syy += (ys[i] - my) * (ys[i] - my); }
    if (sxx === 0) return null;
    var slope = sxy / sxx;
    var r2 = syy === 0 ? 1 : (sxy * sxy) / (sxx * syy);
    return { slope: slope, intercept: my - slope * mx, r2: r2, n: n };
  }

  function statusFromDays(d, L) {
    if (d === null || d === Infinity) return 'ok';
    if (d <= L.lifeCriticalDays) return 'critical';
    if (d <= L.lifeWatchDays) return 'watch';
    return 'ok';
  }

  /** Tight-side tension T1 (kN) estimated from drive power using the Euler-Eytelwein relation. */
  function estimateT1(t, speed) {
    var P = num(t.power_kW), v = num(speed), eff = num(t.eff) || 0.9, lf = num(t.loadFactor) || 0.8;
    var wrap = num(t.wrapDeg) || 200, mu = num(t.mu) || 0.35;
    if (!P || !v) return null;
    var Te = P * eff * lf / v;                         // effective tension kN (kW / m/s)
    var k = Math.exp(mu * wrap * Math.PI / 180);
    return { Te: Te, T1: Te * (1 + 1 / (k - 1)), k: k };
  }

  // ---------- life clocks ----------
  function wearClock(b, asOf, L) {
    var c = { key: 'wear', name: 'Top cover wear', days: null, status: 'nodata', consumed: 0, detail: '', data: {} };
    var tNew = num(b.topCoverNew), tMin = num(b.minCover);
    var rd = (b.thickness || []).filter(function (r) { return validDate(r.date); }).map(function (r) {
      var p = (r.p || []).map(num);
      var vals = p.filter(function (x) { return x !== null; });
      return { date: r.date, p: p, min: vals.length ? Math.min.apply(null, vals) : null, tonnes: num(r.tonnes) };
    }).filter(function (r) { return r.min !== null; }).sort(function (a, b) { return new Date(a.date) - new Date(b.date); });

    if (!rd.length || tNew === null || tMin === null) { c.detail = 'Enter original cover, minimum allowable cover and at least one thickness survey.'; return c; }

    var last = rd[rd.length - 1];
    var pts = rd.map(function (r) { return { d: r.date, y: r.min }; });
    var method = 'regression of surveys';
    if (rd.length < 3 && validDate(b.installDate)) { pts.unshift({ d: b.installDate, y: tNew }); method = 'from installation baseline'; }
    var x0 = pts[0].d;
    var reg = linreg(pts.map(function (p) { return daysBetween(x0, p.d); }), pts.map(function (p) { return p.y; }));
    var rate = reg ? -reg.slope : null;                // mm/day (positive = wearing)

    var usable = tNew - tMin;
    c.consumed = usable > 0 ? clamp((tNew - last.min) / usable, 0, 1) : 1;
    c.data = { current: last.min, lastDate: last.date, ratePerDay: rate, method: method, r2: reg ? reg.r2 : null, profile: last.p, positions: POSITIONS };

    var hpd = num(b.hoursPerDay), tph = num(b.tph);
    if (rate && rate > 0) {
      if (hpd) c.data.per1000h = rate / hpd * 1000;
      if (hpd && tph) c.data.perMt = rate / (tph * hpd / 1e6);
      var sinceSurvey = daysBetween(last.date, asOf);
      c.days = Math.max(0, (last.min - tMin) / rate - Math.max(0, sinceSurvey));
    } else {
      c.days = Infinity;
    }
    c.status = last.min <= tMin ? 'critical' : statusFromDays(c.days, L);
    c.detail = 'Thinnest point ' + round(last.min, 1) + ' mm (' + POSITIONS[last.p.indexOf(last.min)] + ') vs ' + tMin + ' mm limit' +
      (rate > 0 ? '; wear ' + round(rate * 365, 2) + ' mm/yr (' + method + ')' : '; no measurable wear trend yet');

    // profile diagnostics
    var w = last.p.map(function (v) { return v === null ? null : tNew - v; });
    if (w.every(function (v) { return v !== null; })) {
      var edge = (w[0] + w[4]) / 2;
      c.data.centreLoaded = w[2] > 0.5 && w[2] > L.centreWearRatio * Math.max(edge, 0.1);
      c.data.asymmetry = round(((w[0] + w[1]) - (w[3] + w[4])) / 2, 2);   // + = left side wearing faster
    }
    return c;
  }

  function strengthClock(b, asOf, L) {
    var c = { key: 'strength', name: 'Carcass strength / safety factor', days: null, status: 'nodata', consumed: 0, detail: '', data: {} };
    var rating = num(b.rating), width = num(b.width_mm), loss = num(b.strengthLossPct) || 0;
    var t = b.tension || {};
    var T1 = null, est = null;
    if (t.mode === 'estimate') { est = estimateT1(t, b.speed); T1 = est ? est.T1 : null; }
    else T1 = num(t.T1_kN);
    var sfMin = num(b.sfMin) || L.sfMin[b.type === 'ST' ? 'ST' : 'EP'];
    if (!rating || !width || !T1) { c.detail = 'Enter belt rating, width and operating tension (direct or from drive power).'; return c; }

    var ratedTotal = rating * width / 1000;            // kN
    var remaining = ratedTotal * (1 - loss / 100);
    var sf = remaining / T1, sfNew = ratedTotal / T1;
    var allowLossPct = (1 - sfMin * T1 / ratedTotal) * 100;
    c.data = { T1: T1, Te: est ? est.Te : null, ratedTotal: ratedTotal, sf: sf, sfNew: sfNew, sfMin: sfMin, allowLossPct: allowLossPct, lossPct: loss };
    c.consumed = allowLossPct > 0 ? clamp(loss / allowLossPct, 0, 1) : 1;

    var age = validDate(b.installDate) ? daysBetween(b.installDate, asOf) : null;
    if (allowLossPct <= 0) c.days = 0;
    else if (loss > 0 && age > 0) c.days = Math.max(0, (allowLossPct - loss) / (loss / age));
    else c.days = Infinity;

    if (sf < sfMin) c.status = 'critical';
    else if (sf < sfMin * L.sfWatchMargin) c.status = 'watch';
    else c.status = statusFromDays(c.days, L);
    c.detail = 'Residual SF ' + round(sf, 1) + ' vs minimum ' + sfMin + ' (new ' + round(sfNew, 1) + '); strength loss ' + loss + '% of ' + round(allowLossPct, 0) + '% allowable';
    return c;
  }

  function takeupClock(b, asOf, L) {
    var c = { key: 'takeup', name: 'Take-up travel (elongation)', days: null, status: 'nodata', consumed: 0, detail: '', data: {} };
    var tu = b.takeup || {}, travel = num(tu.travel_mm);
    var rd = (tu.readings || []).filter(function (r) { return validDate(r.date) && num(r.pos_mm) !== null; })
      .map(function (r) { return { date: r.date, pos: num(r.pos_mm) }; })
      .sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
    if (!travel || !rd.length) { c.detail = 'Enter total take-up travel and position readings.'; return c; }
    var last = rd[rd.length - 1];
    c.consumed = clamp(last.pos / travel, 0, 1);
    // Recent rate (last two readings): excludes the initial constructional stretch of a new belt.
    var prev = rd.length >= 2 ? rd[rd.length - 2] : null;
    var span = prev ? daysBetween(prev.date, last.date) : 0;
    var rate = prev && span > 0 ? (last.pos - prev.pos) / span : null;
    var limit = travel * L.takeupCritical;
    c.days = rate && rate > 0 ? Math.max(0, (limit - last.pos) / rate - Math.max(0, daysBetween(last.date, asOf))) : Infinity;
    c.data = { used: c.consumed, ratePerDay: rate, pos: last.pos, travel: travel };
    if (c.consumed >= L.takeupCritical) c.status = 'critical';
    else if (c.consumed >= L.takeupWatch) c.status = 'watch';
    else c.status = statusFromDays(c.days, L);
    c.detail = round(c.consumed * 100, 0) + '% of travel used (' + last.pos + ' of ' + travel + ' mm)' + (rate > 0 ? '; stretching ' + round(rate * 30, 1) + ' mm/month' : '');
    return c;
  }

  function spliceClock(b, asOf, L) {
    var c = { key: 'splices', name: 'Splices', days: null, status: 'nodata', consumed: 0, detail: '', data: { items: [] } };
    var sp = (b.splices || []).filter(function (s) { return s && (s.id || num(s.rating)); });
    if (!sp.length) { c.detail = 'Record each splice with a condition rating.'; return c; }
    var worst = 'ok', worstSev = 0, issues = [];
    sp.forEach(function (s) {
      var r = num(s.rating) || 1, g = num(s.lengthChange_mm), dT = num(s.deltaT);
      var st = r >= 5 ? 'critical' : r >= 4 ? 'watch' : 'ok';
      if (g !== null && b.type === 'ST') { if (g >= L.spliceGrowthCritical) st = 'critical'; else if (g >= L.spliceGrowthWatch && st === 'ok') st = 'watch'; }
      if (dT !== null) { if (dT >= L.spliceDeltaTCritical) st = 'critical'; else if (dT >= L.spliceDeltaTWatch && st === 'ok') st = 'watch'; }
      var sev = (r - 1) / 4;
      if (st === 'critical') sev = Math.max(sev, 1); else if (st === 'watch') sev = Math.max(sev, 0.6);
      worstSev = Math.max(worstSev, sev);
      if (st === 'critical') worst = 'critical'; else if (st === 'watch' && worst !== 'critical') worst = 'watch';
      if (st !== 'ok') issues.push((s.id || 'Splice') + ' (' + st + ')');
      c.data.items.push({ id: s.id, type: s.type, status: st });
    });
    c.status = worst; c.consumed = worstSev;
    c.days = worst === 'critical' ? 0 : null;       // condition-based, not time-based
    c.detail = sp.length + ' splice(s); ' + (issues.length ? 'attention: ' + issues.join(', ') : 'all in acceptable condition');
    return c;
  }

  function conditionAssess(b, L) {
    var k = b.condition || {}, parts = [], flags = [];
    function rate(v) { var n = num(v); return n === null ? null : (clamp(n, 1, 5) - 1) / 4; }
    var ratings = { edgeDamage: 'Edge damage', cracking: 'Cover cracking / ageing', chemical: 'Chemical / acid attack', tracking: 'Mistracking', cleaners: 'Cleaner & skirt condition' };
    Object.keys(ratings).forEach(function (key) { var r = rate(k[key]); if (r !== null) { parts.push(r); if (r >= 0.75) flags.push(ratings[key]); } });
    var hRise = (num(k.shoreNow) !== null && num(k.shoreNew) !== null) ? num(k.shoreNow) - num(k.shoreNew) : null;
    if (hRise !== null) { parts.push(clamp(hRise / 20, 0, 1)); }
    var rep = num(k.repairsPct); if (rep !== null) parts.push(clamp(rep / 20, 0, 1));
    var rips = num(k.rips) || 0, gouges = num(k.gouges) || 0;
    if (rips || gouges) parts.push(clamp((rips * 2 + gouges) / 10, 0, 1));
    var bottomLow = num(k.bottomNow) !== null && num(b.minCover) !== null && num(k.bottomNow) <= num(b.minCover);
    if (bottomLow) parts.push(1);
    var score = parts.length ? parts.reduce(function (a, v) { return a + v; }, 0) / parts.length : 0;
    var maxPart = parts.length ? Math.max.apply(null, parts) : 0;
    score = Math.max(score, maxPart * 0.7);             // one severe defect must not be averaged away
    var factor = score < 0.3 ? 1.0 : score < 0.55 ? 0.85 : 0.7;
    return { score: score, factor: factor, hardnessRise: hRise, rips: rips, gouges: gouges, bottomLow: bottomLow, flags: flags, rated: parts.length };
  }

  // ---------- assessment ----------
  function assess(belt, asOfIn) {
    var L = Object.assign({}, LIMITS, belt.limits || {});
    var asOf = validDate(asOfIn) ? new Date(asOfIn) : new Date();
    var wear = wearClock(belt, asOf, L), str = strengthClock(belt, asOf, L), tu = takeupClock(belt, asOf, L), sp = spliceClock(belt, asOf, L);
    var cond = conditionAssess(belt, L);
    var clocks = [wear, str, tu, sp];

    // governing (time-based) clock
    var timed = clocks.filter(function (c) { return typeof c.days === 'number' && c.status !== 'nodata'; });
    var gov = null;
    timed.forEach(function (c) { if (!gov || c.days < gov.days) gov = c; });
    var rawDays = gov ? gov.days : null;
    var adjDays = rawDays === null ? null : (rawDays === Infinity ? Infinity : rawDays * cond.factor);

    var anyCritical = clocks.some(function (c) { return c.status === 'critical'; }) || cond.bottomLow;
    var anyWatch = clocks.some(function (c) { return c.status === 'watch'; }) || cond.score >= 0.55;
    var verdict;
    if (anyCritical || (adjDays !== null && adjDays <= L.lifeCriticalDays)) verdict = 'critical';
    else if (anyWatch || (adjDays !== null && adjDays <= L.lifeWatchDays)) verdict = 'watch';
    else if (wear.status === 'nodata' && str.status === 'nodata') verdict = 'nodata';
    else verdict = 'ok';

    // health index 0-100
    function sev(c) { return c.status === 'nodata' ? 0 : c.consumed; }
    var deterioration = WEIGHTS.wear * sev(wear) + WEIGHTS.strength * sev(str) + WEIGHTS.splices * sev(sp) + WEIGHTS.takeup * sev(tu) + WEIGHTS.condition * cond.score;
    var hi = Math.round(clamp(100 * (1 - deterioration), 0, 100));

    var res = {
      version: VERSION, asOf: isoDate(asOf), belt: { id: belt.id, name: belt.name, area: belt.area, type: belt.type },
      clocks: clocks, condition: cond, governing: gov ? gov.key : null, governingName: gov ? gov.name : null,
      rawDays: rawDays, remainingDays: adjDays, remainingMonths: adjDays === null || adjDays === Infinity ? adjDays : adjDays / 30.44,
      replaceBy: adjDays !== null && adjDays !== Infinity ? isoDate(addDays(asOf, adjDays)) : null,
      verdict: verdict, healthIndex: hi, limits: L
    };
    res.summary = summary(belt, res);
    res.recommendations = recommend(belt, res);
    return res;
  }

  var VERDICT_TEXT = { ok: 'Serviceable', watch: 'Plan replacement / corrective work', critical: 'Critical — act now', nodata: 'Insufficient data' };

  function fmtLife(d) {
    if (d === null) return 'not determined';
    if (d === Infinity) return 'not limited by current trends';
    if (d < 60) return Math.round(d) + ' days';
    if (d > 3652) return '> 10 years';
    return round(d / 30.44, 1) + ' months';
  }

  function summary(b, r) {
    var s = [];
    var tag = (b.id || 'The belt') + (b.name ? ' (' + b.name + ')' : '');
    if (r.verdict === 'nodata') return tag + ' cannot be assessed yet: at minimum a cover thickness survey or the strength data is required.';
    s.push(tag + ' is assessed as "' + VERDICT_TEXT[r.verdict] + '" with a health index of ' + r.healthIndex + '/100.');
    if (r.governing) {
      s.push('Estimated remaining life is ' + fmtLife(r.remainingDays) + (r.replaceBy ? ', with replacement required by ' + r.replaceBy : '') + '. The governing mechanism is ' + r.governingName.toLowerCase() + '.');
      if (r.condition.factor < 1) s.push('The calculated life of ' + fmtLife(r.rawDays) + ' has been reduced by ' + Math.round((1 - r.condition.factor) * 100) + '% to account for the observed damage and ageing.');
    }
    var crit = r.clocks.filter(function (c) { return c.status === 'critical'; }).map(function (c) { return c.name.toLowerCase(); });
    if (crit.length) s.push('Critical findings: ' + crit.join(', ') + '.');
    return s.join(' ');
  }

  function recommend(b, r) {
    var out = [];
    function add(priority, text) { out.push({ priority: priority, text: text }); }
    var c = {}; r.clocks.forEach(function (k) { c[k.key] = k; });
    var w = c.wear, st = c.strength, tu = c.takeup, sp = c.splices, cond = r.condition, L = r.limits;

    if (r.verdict === 'critical') add('P1', 'Raise a work order in the CMMS for belt replacement or repair now; confirm a spare belt of the correct specification is on site or on order.');
    else if (r.verdict === 'watch' && r.replaceBy) add('P2', 'Schedule belt replacement before ' + r.replaceBy + ' in the shutdown plan and confirm spare belt lead time against that date.');

    if (w.status === 'critical') add('P1', 'Top cover is at or near the minimum allowable thickness — risk of carcass exposure and rapid failure.');
    if (w.data.centreLoaded) add('P2', 'Wear is concentrated in the centre: inspect the loading chute, impact bed and material drop height; consider a rock box or spoon chute to reduce impact and abrasion.');
    if (w.data.asymmetry !== undefined && Math.abs(w.data.asymmetry) >= L.asymmetryMm) add('P2', 'Uneven wear across the width (' + (w.data.asymmetry > 0 ? 'left' : 'right') + ' side wearing faster): check for off-centre loading and belt tracking.');
    if (w.status !== 'nodata' && w.data.r2 !== null && w.data.r2 < 0.7 && w.data.method === 'regression of surveys') add('P3', 'The wear trend is scattered (R² ' + round(w.data.r2, 2) + '): measure at the same marked locations relative to Splice 1 every survey.');
    if (w.status === 'nodata') add('P2', 'Start an ultrasonic cover thickness survey at 5 fixed points across the width, repeated every 3 months.');

    if (st.status === 'critical') add('P1', 'Residual safety factor is below the minimum — reduce load or replace the belt; do not run at full tonnage.');
    else if (st.status === 'watch') add('P2', 'Safety factor is close to the minimum: verify actual operating tension (drive current at full load) and the strength-loss estimate.');
    if (st.status !== 'nodata' && st.data.sfNew < st.data.sfMin) add('P2', 'The belt class gives a safety factor below the recommended minimum even when new — review the belt rating for the next replacement.');
    if (b.type === 'ST') add('P3', 'For steel cord belts, run a magnetic cord scan (e.g. CBM) at least annually to quantify cord damage and corrosion.');

    if (tu.status === 'critical') add('P1', 'Take-up is almost at the end of its travel: plan a re-splice to shorten the belt before tension is lost and slip occurs.');
    else if (tu.status === 'watch') add('P2', 'Take-up travel above ' + Math.round(L.takeupWatch * 100) + '%: plan a re-splice at the next shutdown.');
    if (tu.data.ratePerDay && tu.data.ratePerDay * 30 > 10) add('P2', 'Elongation is still increasing quickly — check splice integrity and carcass for internal damage.');

    sp.data.items.forEach(function (s) {
      if (s.status === 'critical') add('P1', (s.id || 'A splice') + ' is critical: remake the splice before returning to normal duty.');
      else if (s.status === 'watch') add('P2', (s.id || 'A splice') + ' needs attention: include an IR scan and visual check at every inspection until remade.');
    });
    if (sp.data.items.some(function (s) { return /mech/i.test(s.type || ''); })) add('P3', 'Mechanical fasteners are a temporary repair: replace them with a vulcanised splice at the next opportunity.');

    if (cond.hardnessRise !== null && cond.hardnessRise >= L.hardnessRiseCritical) add('P2', 'Cover has hardened ' + cond.hardnessRise + ' Shore A points since new: rubber has lost elasticity and is prone to cracking.');
    else if (cond.hardnessRise !== null && cond.hardnessRise >= L.hardnessRiseWatch) add('P3', 'Cover hardness has risen ' + cond.hardnessRise + ' Shore A points: monitor for cracking each inspection.');
    if (cond.bottomLow) add('P1', 'Bottom cover is worn to the minimum: check idlers and pulleys for seized rolls and lagging damage.');
    cond.flags.forEach(function (f) {
      if (/chemical/i.test(f)) add('P2', 'Severe chemical/acid attack: specify an acid-resistant cover grade at replacement and eliminate spillage at the source.');
      else if (/mistrack/i.test(f)) add('P2', 'Correct belt tracking: check idler alignment, training idlers and carry-back build-up.');
      else if (/cleaner/i.test(f)) add('P2', 'Repair belt cleaners and skirts — they are directly accelerating cover and edge wear.');
      else if (/edge/i.test(f)) add('P2', 'Severe edge damage: correct tracking and check structure clearances before the edge tears.');
      else if (/crack/i.test(f)) add('P2', 'Advanced cover cracking: belt is near the end of its ageing life regardless of thickness.');
    });
    if (cond.rips > 0) add('P1', 'Longitudinal rip(s) recorded: repair and consider a rip detection system at the loading zone.');

    add('P3', 'Repeat this assessment every ' + (r.verdict === 'critical' ? 'month' : r.verdict === 'watch' ? '3 months' : '6 months') + ' and after any belt damage event.');
    var order = { P1: 1, P2: 2, P3: 3 };
    var seen = {};
    return out.filter(function (x) { if (seen[x.text]) return false; seen[x.text] = 1; return true; })
      .sort(function (a, b) { return order[a.priority] - order[b.priority]; });
  }

  var api = { VERSION: VERSION, LIMITS: LIMITS, POSITIONS: POSITIONS, WEIGHTS: WEIGHTS, assess: assess, estimateT1: estimateT1, linreg: linreg, fmtLife: fmtLife, VERDICT_TEXT: VERDICT_TEXT };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BeltEngine = api;
})(this);
