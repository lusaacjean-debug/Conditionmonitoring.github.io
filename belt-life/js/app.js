/* CM Belt Life — user interface. Depends on js/engine.js (window.BeltEngine). */
(function () {
  'use strict';
  var E = window.BeltEngine;
  var STORE = 'cmBeltLife.v1';
  var RATING = [['', '—'], ['1', '1 Good'], ['2', '2 Minor'], ['3', '3 Moderate'], ['4', '4 Severe'], ['5', '5 Critical']];
  var state = { belts: [], current: null, asOf: today() };

  // ---------- utilities ----------
  function today() { return new Date().toISOString().slice(0, 10); }
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function uid() { return 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function get(o, path) { return path.split('.').reduce(function (a, k) { return a === undefined || a === null ? undefined : a[k]; }, o); }
  function set(o, path, v) {
    var ks = path.split('.'), last = ks.pop();
    var t = ks.reduce(function (a, k, i) { if (a[k] === undefined || a[k] === null) a[k] = /^\d+$/.test(ks[i + 1] || last) ? [] : {}; return a[k]; }, o);
    t[last] = v;
  }
  function cur() { return state.belts.find(function (b) { return b.uid === state.current; }); }
  function round(v, dp) { var p = Math.pow(10, dp || 0); return Math.round(v * p) / p; }

  function blankBelt() {
    return {
      uid: uid(), id: 'CV-', name: '', area: '', type: 'EP', rating: '', plies: '', width_mm: '', length_m: '', speed: '', tph: '', hoursPerDay: '',
      installDate: '', topCoverNew: '', bottomCoverNew: '', minCover: '',
      tension: { mode: 'estimate', T1_kN: '', power_kW: '', eff: 0.9, loadFactor: 0.8, wrapDeg: 200, mu: 0.35 },
      strengthLossPct: 0, sfMin: '', thickness: [{ date: today(), tonnes: '', p: ['', '', '', '', ''] }],
      takeup: { travel_mm: '', readings: [] }, splices: [{ id: 'S1', type: 'Hot vulcanised', rating: '', lengthChange_mm: '', deltaT: '', note: '' }],
      condition: {}, inspector: '', notes: ''
    };
  }

  // ---------- persistence ----------
  function save() { try { localStorage.setItem(STORE, JSON.stringify({ belts: state.belts, current: state.current, asOf: state.asOf })); } catch (e) { /* storage unavailable */ } }
  function load(cb) {
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORE) || 'null'); } catch (e) { saved = null; }
    if (saved && saved.belts && saved.belts.length) { state.belts = saved.belts; state.current = saved.current; state.asOf = saved.asOf || today(); return cb(); }
    fetch('sample-data/demo-belt.json').then(function (r) { return r.json(); })
      .then(function (d) { state.belts = d.belts; }).catch(function () { state.belts = [blankBelt()]; })
      .then(function () { state.current = state.belts[0].uid; save(); cb(); });
  }
  function download(name, text, type) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: type }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  // ---------- form schema ----------
  var SECTIONS = [
    { title: 'Belt identification', hint: 'Design data from the belt specification', fields: [
      ['id', 'Belt tag', 'text'], ['name', 'Description', 'text'], ['area', 'Plant area', 'text'],
      ['type', 'Belt type', 'select', [['EP', 'Fabric (EP)'], ['ST', 'Steel cord (ST)']]],
      ['rating', 'Belt rating', 'number', 'kN/m', 'e.g. 630 for EP630/4'], ['plies', 'Plies', 'number'],
      ['width_mm', 'Width', 'number', 'mm'], ['length_m', 'Centre distance', 'number', 'm'],
      ['speed', 'Belt speed', 'number', 'm/s'], ['tph', 'Throughput', 'number', 't/h'],
      ['hoursPerDay', 'Running hours', 'number', 'h/day'], ['installDate', 'Installed', 'date']
    ] },
    { title: 'Covers', hint: 'Original and allowable thickness', fields: [
      ['topCoverNew', 'Top cover new', 'number', 'mm'], ['bottomCoverNew', 'Bottom cover new', 'number', 'mm'],
      ['minCover', 'Minimum allowable cover', 'number', 'mm', 'Replacement trigger, from manufacturer'],
      ['condition.bottomNow', 'Bottom cover now', 'number', 'mm']
    ] },
    { title: 'Tension and strength', hint: 'Carcass safety factor', tension: true }
  ];
  var CONDITION = { title: 'Condition and ageing', hint: 'Ratings 1 (good) to 5 (critical)', fields: [
    ['condition.shoreNew', 'Hardness new', 'number', 'Shore A'], ['condition.shoreNow', 'Hardness now', 'number', 'Shore A'],
    ['condition.rips', 'Longitudinal rips', 'number', 'count'], ['condition.gouges', 'Gouges / punctures', 'number', 'count'],
    ['condition.repairsPct', 'Repaired length', 'number', '%'],
    ['condition.edgeDamage', 'Edge damage', 'rating'], ['condition.cracking', 'Cracking / ageing', 'rating'],
    ['condition.chemical', 'Chemical / acid attack', 'rating'], ['condition.tracking', 'Mistracking', 'rating'],
    ['condition.cleaners', 'Cleaners & skirts', 'rating']
  ] };
  var TENSION_EST = [
    ['tension.power_kW', 'Drive motor power', 'number', 'kW'], ['tension.eff', 'Drive efficiency', 'number', '0–1'],
    ['tension.loadFactor', 'Motor load factor', 'number', '0–1', 'Absorbed / installed power'],
    ['tension.wrapDeg', 'Wrap angle', 'number', '°'], ['tension.mu', 'Pulley friction μ', 'number', '', '0.35 lagged, 0.25 bare']
  ];

  function fieldHtml(b, f) {
    var path = f[0], label = f[1], type = f[2], v = get(b, path);
    var unit = type === 'select' || type === 'rating' ? '' : (f[3] || '');
    var help = type === 'select' ? '' : (f[4] || '');
    var input;
    if (type === 'select' || type === 'rating') {
      var opts = type === 'rating' ? RATING : f[3];
      input = '<select data-path="' + path + '">' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (String(v) === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>';
    } else {
      input = '<input type="' + type + '" data-path="' + path + '" value="' + esc(v) + '"' + (type === 'number' ? ' step="any" inputmode="decimal"' : '') + '>';
    }
    return '<label class="field"><span>' + esc(label) + (unit ? ' <span class="unit">(' + esc(unit) + ')</span>' : '') + '</span>' + input + (help ? '<span class="help">' + esc(help) + '</span>' : '') + '</label>';
  }
  function card(title, hint, body) {
    return '<details class="card" open><summary><h3>' + esc(title) + '</h3><span class="hint">' + esc(hint) + '</span></summary>' + body + '</details>';
  }

  function renderForm() {
    var b = cur(), html = '';
    if (!b) { $('form').innerHTML = '<div class="card empty">Add a belt to begin.</div>'; return; }
    SECTIONS.forEach(function (s) {
      var body;
      if (s.tension) {
        var t = b.tension || {}, f = [['tension.mode', 'Tension input', 'select', [['estimate', 'Estimate from drive power'], ['direct', 'Enter T1 directly']]]];
        f = f.concat(t.mode === 'direct' ? [['tension.T1_kN', 'Max tight-side tension T1', 'number', 'kN', 'From design calculation']] : TENSION_EST);
        f.push(['strengthLossPct', 'Estimated strength loss', 'number', '%', 'From inspection or cord scan']);
        f.push(['sfMin', 'Minimum safety factor', 'number', '', 'Blank = ' + E.LIMITS.sfMin.EP + ' (EP) / ' + E.LIMITS.sfMin.ST + ' (ST)']);
        body = '<div class="grid">' + f.map(function (x) { return fieldHtml(b, x); }).join('') + '</div>';
      } else body = '<div class="grid">' + s.fields.map(function (x) { return fieldHtml(b, x); }).join('') + '</div>';
      html += card(s.title, s.hint, body);
    });

    // thickness surveys
    var th = (b.thickness || []).map(function (r, i) {
      return '<tr><td><input type="date" data-path="thickness.' + i + '.date" value="' + esc(r.date) + '"></td>' +
        E.POSITIONS.map(function (p, j) { return '<td><input type="number" step="any" inputmode="decimal" aria-label="' + p + '" data-path="thickness.' + i + '.p.' + j + '" value="' + esc((r.p || [])[j]) + '"></td>'; }).join('') +
        '<td><button type="button" class="del" data-del="thickness.' + i + '" aria-label="Delete survey">×</button></td></tr>';
    }).join('');
    html += card('Top cover thickness surveys', 'Ultrasonic, mm, same marked points each time',
      '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Date</th>' + E.POSITIONS.map(function (p) { return '<th>' + p + '</th>'; }).join('') + '<th></th></tr></thead><tbody>' + th + '</tbody></table></div>' +
      '<div class="row-actions"><button type="button" class="btn ghost small" data-add="thickness">Add survey</button></div>');

    // take-up
    var tu = (b.takeup && b.takeup.readings || []).map(function (r, i) {
      return '<tr><td><input type="date" data-path="takeup.readings.' + i + '.date" value="' + esc(r.date) + '"></td><td><input type="number" step="any" data-path="takeup.readings.' + i + '.pos_mm" value="' + esc(r.pos_mm) + '"></td>' +
        '<td><button type="button" class="del" data-del="takeup.readings.' + i + '" aria-label="Delete reading">×</button></td></tr>';
    }).join('');
    html += card('Take-up position', 'Belt elongation trend',
      '<div class="grid">' + fieldHtml(b, ['takeup.travel_mm', 'Total take-up travel', 'number', 'mm']) + '</div>' +
      '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Date</th><th>Position from start (mm)</th><th></th></tr></thead><tbody>' + tu + '</tbody></table></div>' +
      '<div class="row-actions"><button type="button" class="btn ghost small" data-add="takeup.readings">Add reading</button></div>');

    // splices
    var types = ['Hot vulcanised', 'Cold bonded', 'Mechanical fastener'];
    var sp = (b.splices || []).map(function (s, i) {
      return '<tr><td><input type="text" data-path="splices.' + i + '.id" value="' + esc(s.id) + '"></td>' +
        '<td><select data-path="splices.' + i + '.type">' + types.map(function (t) { return '<option' + (s.type === t ? ' selected' : '') + '>' + t + '</option>'; }).join('') + '</select></td>' +
        '<td><select data-path="splices.' + i + '.rating">' + RATING.map(function (o) { return '<option value="' + o[0] + '"' + (String(s.rating) === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></td>' +
        '<td><input type="number" step="any" data-path="splices.' + i + '.lengthChange_mm" value="' + esc(s.lengthChange_mm) + '"></td>' +
        '<td><input type="number" step="any" data-path="splices.' + i + '.deltaT" value="' + esc(s.deltaT) + '"></td>' +
        '<td><input type="text" data-path="splices.' + i + '.note" value="' + esc(s.note) + '"></td>' +
        '<td><button type="button" class="del" data-del="splices.' + i + '" aria-label="Delete splice">×</button></td></tr>';
    }).join('');
    html += card('Splices', 'Condition, length change (steel cord), IR ΔT above belt body',
      '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>ID</th><th>Type</th><th>Condition</th><th>Length change (mm)</th><th>ΔT (°C)</th><th>Note</th><th></th></tr></thead><tbody>' + sp + '</tbody></table></div>' +
      '<div class="row-actions"><button type="button" class="btn ghost small" data-add="splices">Add splice</button></div>');

    html += card(CONDITION.title, CONDITION.hint, '<div class="grid">' + CONDITION.fields.map(function (x) { return fieldHtml(b, x); }).join('') + '</div>');
    html += card('Inspection record', 'Appears on the printed report', '<div class="grid">' + fieldHtml(b, ['inspector', 'Assessed by', 'text']) +
      '<label class="field wide">Notes<textarea rows="3" data-path="notes">' + esc(b.notes) + '</textarea></label></div>');
    $('form').innerHTML = html;
  }

  // ---------- report ----------
  function lifeBig(r) {
    if (r.remainingDays === null) return '<span class="big">—</span>';
    if (r.remainingDays === Infinity) return '<span class="big">No limit</span>';
    if (r.remainingDays < 60) return '<span class="big">' + Math.round(r.remainingDays) + '<small>days</small></span>';
    return '<span class="big">' + round(r.remainingMonths, 1) + '<small>months</small></span>';
  }
  function clockDays(c) {
    if (c.status === 'nodata') return 'No data';
    if (c.days === null) return 'Condition-based';
    if (c.days === Infinity) return 'Not limiting';
    return E.fmtLife(c.days);
  }

  function profileSvg(b, r) {
    var w = r.clocks[0], tNew = parseFloat(b.topCoverNew), tMin = parseFloat(b.minCover);
    if (w.status === 'nodata' || !tNew) return '<p class="empty">Enter cover data and a thickness survey to draw the belt cross-section.</p>';
    var W = 560, x0 = 40, x1 = 520, base = 130, s = 90 / tNew;
    var xs = [60, 175, 280, 385, 500];
    function y(t) { return base - t * s; }
    var surveys = (b.thickness || []).filter(function (t) { return t.date; }).slice().sort(function (a, c) { return new Date(a.date) - new Date(c.date); });
    var prev = surveys.length > 1 ? surveys[surveys.length - 2] : null;
    var prof = w.data.profile;
    function path(p) {
      var pts = p.map(function (v, i) { var n = parseFloat(v); return [xs[i], y(isFinite(n) ? n : tNew)]; });
      return 'M' + x0 + ' ' + base + ' L' + x0 + ' ' + pts[0][1] + ' ' + pts.map(function (q) { return 'L' + q[0] + ' ' + q[1]; }).join(' ') + ' L' + x1 + ' ' + pts[4][1] + ' L' + x1 + ' ' + base + ' Z';
    }
    var plies = Math.max(1, Math.min(8, parseInt(b.plies, 10) || 3)), ply = '';
    for (var i = 1; i < plies; i++) ply += '<line x1="' + x0 + '" x2="' + x1 + '" y1="' + (base + i * 18 / plies) + '" y2="' + (base + i * 18 / plies) + '" stroke="#8C979F" stroke-width="1"/>';
    var bot = parseFloat(get(b, 'condition.bottomNow')) || parseFloat(b.bottomCoverNew) || 0;
    var minIdx = prof.indexOf(w.data.current);
    var labels = prof.map(function (v, i) {
      var n = parseFloat(v); if (!isFinite(n)) return '';
      var crit = n <= tMin ? 'var(--crit)' : i === minIdx ? 'var(--watch)' : 'var(--ink)';
      return '<text x="' + xs[i] + '" y="' + (y(n) - 8) + '" text-anchor="middle" font-size="14" font-weight="600" fill="' + crit + '">' + n + '</text>' +
        '<text x="' + xs[i] + '" y="' + (base + 18 + bot * s + 18) + '" text-anchor="middle" font-size="12" fill="var(--muted)">' + E.POSITIONS[i] + '</text>';
    }).join('');
    return '<svg viewBox="0 0 ' + W + ' ' + (base + 18 + bot * s + 28) + '" role="img" aria-label="Belt cross-section with measured top cover thickness">' +
      '<line x1="' + x0 + '" x2="' + x1 + '" y1="' + y(tNew) + '" y2="' + y(tNew) + '" stroke="var(--muted)" stroke-dasharray="4 4"/>' +
      '<text x="' + (x1 + 4) + '" y="' + (y(tNew) + 4) + '" font-size="11" fill="var(--muted)">new ' + tNew + '</text>' +
      (prev ? '<path d="' + path(prev.p || []) + '" fill="none" stroke="#9AA5AD" stroke-dasharray="2 3"/>' : '') +
      '<path d="' + path(prof) + '" fill="var(--rubber)"/>' +
      '<rect x="' + x0 + '" y="' + base + '" width="' + (x1 - x0) + '" height="18" fill="#C9B98F"/>' + ply +
      '<rect x="' + x0 + '" y="' + (base + 18) + '" width="' + (x1 - x0) + '" height="' + (bot * s) + '" fill="var(--rubber)" opacity=".75"/>' +
      (isFinite(tMin) ? '<line x1="' + x0 + '" x2="' + x1 + '" y1="' + y(tMin) + '" y2="' + y(tMin) + '" stroke="var(--crit)" stroke-width="1.5" stroke-dasharray="6 4"/>' +
        '<text x="' + (x1 + 4) + '" y="' + (y(tMin) + 4) + '" font-size="11" fill="var(--crit)">min ' + tMin + '</text>' : '') +
      labels + '</svg>' +
      '<p class="empty" style="font-size:12px;margin:4px 0 0">Top cover in mm, survey ' + esc(w.data.lastDate) + (prev ? '; dotted line = previous survey ' + esc(prev.date) : '') + '. Tan band = carcass.</p>';
  }

  function renderReport() {
    var b = cur(); if (!b) { $('report').innerHTML = ''; return; }
    var r = E.assess(b, state.asOf);
    var w = r.clocks[0].data, st = r.clocks[1].data;
    var metrics = [];
    if (w.ratePerDay > 0) metrics.push(['Wear rate', round(w.ratePerDay * 365, 2) + ' mm/yr']);
    if (w.per1000h) metrics.push(['Per 1000 h', round(w.per1000h, 3) + ' mm']);
    if (w.perMt) metrics.push(['Per Mt conveyed', round(w.perMt, 3) + ' mm']);
    if (st.sf) metrics.push(['Safety factor', round(st.sf, 1) + ' (min ' + st.sfMin + ')']);
    if (st.T1) metrics.push(['Tension T1', round(st.T1, 1) + ' kN']);

    $('report').innerHTML =
      '<div class="r-head"><div><h2>' + esc(b.id) + ' ' + esc(b.name) + '</h2><div class="meta" style="text-align:left">' + esc(b.area) + (b.rating ? ' · ' + esc(b.type) + esc(b.rating) + (b.plies ? '/' + esc(b.plies) : '') : '') + (b.width_mm ? ' × ' + esc(b.width_mm) + ' mm' : '') + '</div></div>' +
      '<div class="meta">Assessed ' + esc(r.asOf) + '<br>Engine v' + E.VERSION + '</div></div>' +
      '<div class="verdict"><div>' + lifeBig(r) + '<div class="label">Estimated remaining life</div></div>' +
      '<div><span class="pill ' + r.verdict + '">' + esc(E.VERDICT_TEXT[r.verdict]) + '</span>' +
      '<div class="kv"><div><b>' + r.healthIndex + '/100</b><span>Health index</span></div>' +
      '<div><b>' + (r.replaceBy || '—') + '</b><span>Replace by</span></div>' +
      '<div><b>' + esc(r.governingName || '—') + '</b><span>Governing</span></div></div></div></div>' +
      '<h3 class="section-title">Cover profile</h3><div class="profile">' + profileSvg(b, r) + '</div>' +
      '<h3 class="section-title">Life clocks</h3><div class="clocks">' + r.clocks.map(function (c) {
        return '<div class="clock"><span class="name' + (c.key === r.governing ? ' gov' : '') + '">' + esc(c.name) + '</span><span class="days">' + clockDays(c) + '</span>' +
          '<span class="bar"><i class="' + c.status + '" style="width:' + Math.round(c.consumed * 100) + '%"></i></span><span class="detail">' + esc(c.detail) + '</span></div>';
      }).join('') +
      '<div class="clock"><span class="name">Condition &amp; ageing</span><span class="days">×' + r.condition.factor + '</span><span class="bar"><i class="' + (r.condition.score >= 0.55 ? 'critical' : r.condition.score >= 0.3 ? 'watch' : 'ok') + '" style="width:' + Math.round(r.condition.score * 100) + '%"></i></span>' +
      '<span class="detail">Severity ' + Math.round(r.condition.score * 100) + '%' + (r.condition.hardnessRise !== null ? '; hardness +' + r.condition.hardnessRise + ' Shore A' : '') + (r.condition.flags.length ? '; ' + esc(r.condition.flags.join(', ')) : '') + '. Life factor applied to the governing clock.</span></div></div>' +
      (metrics.length ? '<div class="kv" style="margin-top:14px">' + metrics.map(function (m) { return '<div><b>' + esc(m[1]) + '</b><span>' + esc(m[0]) + '</span></div>'; }).join('') + '</div>' : '') +
      '<h3 class="section-title">Assessment</h3><p class="summary">' + esc(r.summary) + '</p>' +
      '<h3 class="section-title">Recommendations</h3><ul class="recs">' + r.recommendations.map(function (x) { return '<li><span class="prio ' + x.priority + '">' + x.priority + '</span><span>' + esc(x.text) + '</span></li>'; }).join('') + '</ul>' +
      (b.notes ? '<h3 class="section-title">Notes</h3><p class="summary">' + esc(b.notes) + '</p>' : '') +
      '<div class="signoff"><div>Assessed by: ' + esc(b.inspector) + '</div><div>Reviewed by:</div></div>';
  }

  function renderList() {
    $('beltList').innerHTML = state.belts.map(function (b) {
      var r = E.assess(b, state.asOf);
      var life = r.remainingDays === null ? '—' : r.remainingDays === Infinity ? '∞' : r.remainingDays < 60 ? Math.round(r.remainingDays) + ' d' : round(r.remainingMonths, 1) + ' mo';
      return '<li><button type="button" data-uid="' + b.uid + '" aria-current="' + (b.uid === state.current) + '"><span class="dot ' + r.verdict + '"></span><span><span class="tag">' + esc(b.id || '(no tag)') + '</span><span class="sub">' + esc(b.name || b.area || '') + '</span></span><span class="life">' + life + '</span></button></li>';
    }).join('');
  }
  function refresh(full) { if (full) renderForm(); renderList(); renderReport(); save(); }

  // ---------- events ----------
  function onInput(e) {
    var el = e.target, path = el.getAttribute('data-path'); if (!path) return;
    var v = el.value;
    if (el.type === 'number') { var n = parseFloat(v); v = isFinite(n) ? n : ''; }
    set(cur(), path, v);
    refresh(path === 'tension.mode');
  }
  function onClick(e) {
    var add = e.target.getAttribute('data-add'), del = e.target.getAttribute('data-del'), b = cur();
    if (add) {
      var arr = get(b, add); if (!arr) { set(b, add, []); arr = get(b, add); }
      if (add === 'thickness') arr.push({ date: state.asOf, tonnes: '', p: ['', '', '', '', ''] });
      else if (add === 'splices') arr.push({ id: 'S' + (arr.length + 1), type: 'Hot vulcanised', rating: '', lengthChange_mm: '', deltaT: '', note: '' });
      else arr.push({ date: state.asOf, pos_mm: '' });
      refresh(true);
    } else if (del) {
      var parts = del.split('.'), idx = +parts.pop();
      get(b, parts.join('.')).splice(idx, 1); refresh(true);
    }
  }

  function init() {
    $('ver').textContent = 'v' + E.VERSION;
    $('asOf').value = state.asOf;
    $('asOf').addEventListener('change', function (e) { state.asOf = e.target.value || today(); refresh(false); });
    $('form').addEventListener('input', onInput);
    $('form').addEventListener('click', onClick);
    $('beltList').addEventListener('click', function (e) { var btn = e.target.closest('button[data-uid]'); if (btn) { state.current = btn.getAttribute('data-uid'); refresh(true); } });
    $('btnAdd').addEventListener('click', function () { var b = blankBelt(); state.belts.push(b); state.current = b.uid; refresh(true); });
    $('btnDuplicate').addEventListener('click', function () { var b = JSON.parse(JSON.stringify(cur())); b.uid = uid(); b.id += ' (copy)'; state.belts.push(b); state.current = b.uid; refresh(true); });
    $('btnDelete').addEventListener('click', function () {
      var b = cur(); if (!b || !confirm('Delete ' + (b.id || 'this belt') + ' and all its readings? Export first if you need a copy.')) return;
      state.belts = state.belts.filter(function (x) { return x.uid !== b.uid; });
      state.current = state.belts.length ? state.belts[0].uid : null; refresh(true);
    });
    $('btnExport').addEventListener('click', function () {
      download('belt-life-data-' + today() + '.json', JSON.stringify({ app: 'CM Belt Life', schema: 1, exported: new Date().toISOString(), belts: state.belts }, null, 2), 'application/json');
    });
    $('fileImport').addEventListener('change', function (e) {
      var f = e.target.files[0]; if (!f) return;
      f.text().then(function (t) {
        var d = JSON.parse(t); if (!d.belts || !Array.isArray(d.belts)) throw new Error('File has no belts list.');
        d.belts.forEach(function (nb) { if (!nb.uid) nb.uid = uid(); var i = state.belts.findIndex(function (x) { return x.uid === nb.uid; }); if (i >= 0) state.belts[i] = nb; else state.belts.push(nb); });
        state.current = d.belts[0].uid; refresh(true); alert('Imported ' + d.belts.length + ' belt(s).');
      }).catch(function (err) { alert('Import failed: ' + err.message + ' Use a file exported from CM Belt Life.'); });
      e.target.value = '';
    });
    $('btnCsv').addEventListener('click', function () {
      var rows = [['Tag', 'Description', 'Area', 'Type', 'Verdict', 'Health index', 'Remaining months', 'Replace by', 'Governing', 'Assessed']];
      state.belts.forEach(function (b) {
        var r = E.assess(b, state.asOf);
        rows.push([b.id, b.name, b.area, b.type, E.VERDICT_TEXT[r.verdict], r.healthIndex, r.remainingMonths === null ? '' : r.remainingMonths === Infinity ? 'no limit' : round(r.remainingMonths, 1), r.replaceBy || '', r.governingName || '', r.asOf]);
      });
      download('belt-register-' + today() + '.csv', rows.map(function (r) { return r.map(function (c) { return '"' + String(c === undefined ? '' : c).replace(/"/g, '""') + '"'; }).join(','); }).join('\r\n'), 'text/csv');
    });
    $('btnPrint').addEventListener('click', function () { window.print(); });
    refresh(true);
  }

  load(init);
})();
