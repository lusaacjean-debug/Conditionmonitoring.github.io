/* CM Inspect — assets/js/app.js
   Application: categories, home page, forms, health score, remaining life, QR scan, drafts, print, PDF report, Pronto deep links.
   Loaded as a classic script; shares global scope with the other files
   (load order is defined in index.html). © Lotus Africa — internal use only. */
'use strict';

  /* =====================================================================
     CATEGORIES — top-level groupings shown on the Home page
     ===================================================================== */


  /* =====================================================================
     DOCUMENT CONTROL & PRESENTATION HELPERS
     - DOC_REGISTER: frozen document number + revision per checklist.
       New checklists: add an entry here (next free number) — never renumber.
     - cleanTitle / numberedSections: one numbering scheme everywhere
       (screen, print, PDF): section N, item N.n, independent of how the
       source data was typed ("Section 3 —", "A. MOTOR", "Coupling — B." …).
     ===================================================================== */
  const APP_VERSION = '1.1.1', APP_RELEASE = '2026-10-05';
  // DOC_REGISTER is loaded from data/document-register.js
  function docOf(eq){ const r = DOC_REGISTER[eq.id]; return r ? { no: r[0], rev: r[1] } : { no: 'CMI-DRAFT', rev: '0' }; }
  const KEEP_UPPER = new Set(['VSD','MCC','PSV','HPP','HV','LV','HME','UPS','DC','AC','GET','ROPS','FOPS','IR','PI','NER','PFC','MEWP','TC','HT','LT','BMS','SIS','CML','UT','NDT','OEM','CW','RIP','SAG','PM','WO','WR','HFO','LO','AVR','PPE','LOTO','JSA','PDF','ISO','API','SO2','DE','NDE','RPM','CIP','LMI','RCI','PTO','ATS','PCB','PLC','DCS','VFD','II','III','IV','HPU','MOV','RTD','SMU','TLB','ADT','LHD','KSB','GSW']);
  const KEEP_LOWER = new Set(['and','or','of','the','for','to','in','on','with','at','by','a','an','per','vs']);
  function smartCase(t){
    return t.toLowerCase().split(/(\s+|\/|-|\(|\))/).map((w, i) => {
      const U = w.toUpperCase();
      if (KEEP_UPPER.has(U)) return U;
      if (i > 0 && KEEP_LOWER.has(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    }).join('');
  }
  function cleanTitle(t){
    t = String(t || '').replace(/^Section\s+\d+\s*[—-]\s*/, '').replace(/^Coupling\s+—\s+[A-Z]\.\s*/, 'Coupling — ').replace(/^[A-Z]\.\s+/, '').trim();
    if (/[A-Z]{3}/.test(t) && t === t.toUpperCase()) t = smartCase(t);
    return t;
  }
  function numberedSections(eq){
    const out = []; let n = 0;
    for (const sec of eq.sections){
      const items = visibleItems(sec);
      if (sec.title.indexOf('Coupling — ') === 0 && items.length === 0) continue;
      n++;
      out.push({ sec, num: n, title: cleanTitle(sec.title), items: items.map((it, i) => ({ it, ref: n + '.' + (i + 1) })) });
    }
    return out;
  }
  /* Prestart go / no-go: CRITICAL check points (acceptance starts with
     "CRITICAL") outside the declaration section decide the result. */
  function goNoGo(eq, st){
    st = st || state;
    const ns = numberedSections(eq);
    const crit = [];
    ns.forEach(s => { if (/go \/ no-go/i.test(s.title)) return;
      s.items.forEach(x => { if (x.it.detailed && /^CRITICAL/.test(x.it.acceptance || '')) crit.push(x); }); });
    if (!crit.length) return null;
    const nok = crit.filter(x => st.items[x.it.id] === 'notok').map(x => x.ref);
    const open = crit.filter(x => !st.items[x.it.id]).map(x => x.ref);
    const decision = nok.length ? 'NO-GO' : open.length ? 'INCOMPLETE' : 'GO';
    return { decision, nok, open, total: crit.length };
  }
  function readingNoteText(note){
    if (/^rating key/i.test(note)) return note;
    return (/°C|mm\/s|%|bar|<|>|≤|≥|max|min|zone/i.test(note) ? 'Target: ' : 'Reference: ') + note;
  }

  const CATEGORIES = [
    { id:'static',   title:'Static Equipment',   desc:'Structures, tanks, piping, pressure vessels & heat exchangers, PSVs, sulphur furnace & boiler, converter & acid towers, dust collectors and valves.' },
    { id:'rotating',  title:'Rotating Equipment', desc:'Motors, pumps, conveyors, gearboxes, mills, agitators, filters, the calciner kiln and cooling towers.' },
    { id:'lube',      title:'Lubrication',        desc:'Greasing and motor re-greasing routes, grease pots, auto-greasing, oil sampling and oil change procedures to ICML 55.' },
    { id:'ei',        title:'Electrical & Instrumentation', desc:'Instrument calibration & loop checks (transmitters, switches, analysers, flowmeters, belt scales), transformers, switchgear / MCC / VSD, UPS, gas detection and SIS proof testing.' },
    { id:'routes',    title:'Area Inspection Routes', desc:'Trade routes for every plant area — mechanical, electrical, instrumentation, boilermaker and process operator — matching the Pronto weekly / daily area PM tasks.' },
    { id:'safety',    title:'Safety & Statutory Systems',   desc:'Overhead cranes and lifting equipment, safety showers and eyewash stations, and fire protection systems.' },
    { id:'genset',    title:'Gen Set',            desc:'Hyundai HiMSEN 9H21/32 power plant gensets (001–006) — full site PM package from shift rounds to 24,000 h overhaul — plus turbocharger fire-risk and standby diesel gen set checks.' },
    { id:'mcrusher',  title:'Mobile Crusher',     desc:'Mobile Crushing Plant MCR001 PM routes R01–R17 — jaw, cone, screen, conveyors CV01–CV07, electrical container and plant generator.' },
    { id:'hme',       title:'Heavy Mobile Equipment', desc:'Surface and underground mining fleet — dozers, loaders, excavators, trucks, graders, compactors, drills, chargers, bolters, cranes and support equipment.' },
    { id:'prestart',  title:'Prestart LV & HME', desc:'Operator go / no-go prestart checks every shift — light vehicles, buses and every heavy mobile equipment type. Any NOT OK on a CRITICAL item means do not operate.' }
  ];

  /* =====================================================================
     APP STATE / VIEW HANDLING
     ===================================================================== */

  let currentEquipment = null;
  let currentCategory = null;
  let state = { header:{}, items:{}, readings:{}, comments:{}, photos:{}, findings:{}, corrective:{} };
  const STATE_DEFAULTS = { header:{}, items:{}, readings:{}, comments:{}, photos:{}, findings:{}, corrective:{} };
  let saveTimer = null;

  const hubView = document.getElementById('hubView');
  const catView = document.getElementById('catView');
  const formView = document.getElementById('formView');
  const hubGrid = document.getElementById('hubGrid');
  const catGrid = document.getElementById('catGrid');

  function draftKey(eq){ return 'draft:' + eq.id; }

  function hasDraft(eq){
    try{ return !!window.localStorage.getItem(draftKey(eq)); } catch(e){ return false; }
  }

  function getDraftHealth(eq){
    try{
      const raw = window.localStorage.getItem(draftKey(eq));
      if (!raw) return null;
      const saved = JSON.parse(raw);
      return saved.healthScore || null;
    } catch(e){ return null; }
  }

  function getDraftRUL(eq){
    try{
      const raw = window.localStorage.getItem(draftKey(eq));
      if (!raw) return null;
      const saved = JSON.parse(raw);
      return saved.worstRUL || null;
    } catch(e){ return null; }
  }

  const CAT_ICONS = {
    static:'<path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M5 9h14M5 15h14M9 21v-2M15 21v-2"/>',
    rotating:'<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M2.5 12h3M18.5 12h3M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1"/>',
    lube:'<path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z"/><path d="M9.5 15a2.5 2.5 0 0 0 2.5 2.5"/>',
    ei:'<path d="M13 2L4.5 13.5H11L10 22l8.5-11.5H12z"/>',
    safety:'<path d="M12 3l7.5 3v5.5c0 4.8-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.7-7.5-9.5V6z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
    genset:'<rect x="2.5" y="7" width="14" height="10" rx="1.5"/><path d="M16.5 10H19l2.5-2v8L19 14h-2.5M6.5 7V4.5h6V7M9.5 10.5l-1.5 3h3l-1.5 3"/>',
    mcrusher:'<path d="M3 4l6 14M21 4l-6 14M6 21h12M9 18h6M10 4h4"/>',
    hme:'<path d="M2.5 15.5V9h8l3 4h7.5v2.5"/><path d="M13.5 9V6h3l2 7"/><circle cx="7" cy="17" r="2.2"/><circle cx="17" cy="17" r="2.2"/>',
    routes:'<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    prestart:'<rect x="5.5" y="4" width="13" height="17" rx="2"/><path d="M9 4V2.8h6V4M9 12.5l2 2 4-4"/>'
  };
  function catIcon(id){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + (CAT_ICONS[id] || CAT_ICONS.static) + '</svg>'; }
  function catById(id){ return CATEGORIES.find(c => c.id === id) || { title:'' }; }
  function countChecks(eq){ return eq.sections.reduce((n, s) => n + (s.items || []).filter(i => !i.applicableDriveTypes).length, 0); }
  function stdLine(eq){
    const d = String(eq.dept || ''); const i = d.indexOf(' — ');
    const t = i >= 0 ? d.slice(i + 3) : d;
    if (!/\d/.test(t)) return '';
    return t.length > 110 ? t.slice(0, 107) + '…' : t;
  }
  function readDraft(eq){
    try{ const raw = window.localStorage.getItem(draftKey(eq)); return raw ? JSON.parse(raw) : null; } catch(e){ return null; }
  }
  function timeAgo(ts){
    if (!ts) return 'Saved earlier';
    const m = Math.round((Date.now() - ts) / 60000);
    if (m < 1) return 'Saved just now';
    if (m < 60) return 'Saved ' + m + ' min ago';
    const h = Math.round(m / 60); if (h < 24) return 'Saved ' + h + ' h ago';
    const d = Math.round(h / 24); return 'Saved ' + d + ' day' + (d > 1 ? 's' : '') + ' ago';
  }

  function equipmentCard(eq, showCat){
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'eq-card';
    const health = getDraftHealth(eq);
    const rul = getDraftRUL(eq);
    let chips = '';
    if (health) chips += `<span class="chip ${health.band}">Health ${health.score}% · ${health.label}</span>`;
    else if (hasDraft(eq)) chips += '<span class="chip draft">Draft in progress</span>';
    if (rul){
      const lifeText = rul.remainingLife === Infinity ? 'Stable' : rul.remainingLife.toFixed(1) + ' yrs';
      chips += `<span class="chip ${rul.band}">RUL ${lifeText}</span>`;
    }
    const n = countChecks(eq);
    card.innerHTML = `
      ${showCat ? `<span class="eq-cat">${esc(catById(eq.category).title)}</span>` : ''}
      <span class="eq-title">${esc(eq.title)}</span>
      ${stdLine(eq) ? `<span class="eq-std">${esc(stdLine(eq))}</span>` : ''}
      <span class="eq-meta">${eq.sections.filter(sc => !(sc.items || []).length || (sc.items || []).some(i => !i.applicableDriveTypes)).length} sections · ${n} check points</span>
      ${chips ? `<span class="dc-chips">${chips}</span>` : ''}`;
    card.addEventListener('click', () => openEquipment(eq));
    return card;
  }

  /* ---------------- Home ---------------- */
  function renderHub(){
    const av = document.getElementById('appVersion'); if (av) av.textContent = 'v' + APP_VERSION + ' (' + APP_RELEASE + ')';
    // facts
    const totalChecks = EQUIPMENT.reduce((n, e) => n + countChecks(e), 0);
    document.getElementById('hubFacts').innerHTML =
      `<span><b>${EQUIPMENT.length}</b> checklists</span><span><b>${totalChecks.toLocaleString()}</b> check points</span><span><b>${CATEGORIES.length}</b> disciplines</span><span>Works on phone, tablet and PC</span>`;

    // disciplines
    hubGrid.innerHTML = '';
    CATEGORIES.forEach(cat => {
      const list = EQUIPMENT.filter(eq => eq.category === cat.id);
      const drafts = list.filter(hasDraft).length;
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'disc-card';
      card.innerHTML = `
        <span class="disc-top"><span class="disc-icon">${catIcon(cat.id)}</span><span class="disc-count">${list.length} checklist${list.length !== 1 ? 's' : ''}</span></span>
        <span class="disc-name">${esc(cat.title)}</span>
        <span class="disc-desc">${esc(cat.desc || '')}</span>
        ${drafts ? `<span class="disc-drafts">${drafts} draft${drafts > 1 ? 's' : ''} in progress</span>` : ''}`;
      card.addEventListener('click', () => openCategory(cat));
      hubGrid.appendChild(card);
    });

    // drafts in progress
    const drafts = EQUIPMENT.map(eq => ({ eq, d: readDraft(eq) })).filter(x => x.d)
      .sort((a, b) => (b.d.savedAt || 0) - (a.d.savedAt || 0)).slice(0, 6);
    const dl = document.getElementById('draftList');
    dl.innerHTML = '';
    document.getElementById('draftSection').style.display = drafts.length ? 'block' : 'none';
    drafts.forEach(({ eq, d }) => {
      const dt = d.header && d.header.f_drivetype;
      const vis = i => (!i.applicableDriveTypes && !i.isGeneral) || (dt && (i.isGeneral ? TRUE_COUPLING_TYPES.indexOf(dt) !== -1 : i.applicableDriveTypes.indexOf(dt) !== -1));
      const visIds = new Set(); eq.sections.forEach(s => (s.items || []).filter(vis).forEach(i => visIds.add(i.id)));
      const total = visIds.size || 1;
      const done = Object.keys(d.items || {}).filter(k => visIds.has(k)).length;
      const pct = Math.min(100, Math.round(done / total * 100));
      const notok = Object.values(d.items || {}).filter(v => v === 'notok').length;
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'draft-card';
      btn.innerHTML = `
        <span class="dc-title">${esc(eq.title)}</span>
        <span class="dc-meta">${esc(catById(eq.category).title)}${d.header && d.header.f_tag ? ' · Tag ' + esc(d.header.f_tag) : ''}</span>
        <span class="dc-bar"><span style="width:${pct}%"></span></span>
        <span class="dc-meta">${pct}% recorded · ${timeAgo(d.savedAt)}</span>
        <span class="dc-chips">${notok ? `<span class="chip critical">${notok} NOT OK</span>` : ''}${d.healthScore ? `<span class="chip ${d.healthScore.band}">Health ${d.healthScore.score}%</span>` : ''}</span>`;
      btn.addEventListener('click', () => { currentCategory = null; openEquipment(eq); });
      dl.appendChild(btn);
    });

    runHubSearch();
  }

  function norm(s){ return String(s || '').toLowerCase(); }
  function runHubSearch(){
    const inp = document.getElementById('hubSearch');
    const q = norm(inp.value).trim();
    document.getElementById('hubSearchClear').classList.toggle('show', !!q);
    const res = document.getElementById('searchSection');
    const home = document.getElementById('homeContent');
    if (!q){ res.style.display = 'none'; home.style.display = 'block'; return; }
    const words = q.split(/\s+/);
    const hits = EQUIPMENT.filter(eq => {
      const hay = norm(eq.title + ' ' + eq.dept + ' ' + catById(eq.category).title + ' ' + (eq.tagPlaceholder || ''));
      return words.every(w => hay.indexOf(w) !== -1);
    });
    res.style.display = 'block'; home.style.display = 'none';
    document.getElementById('searchTitle').textContent = hits.length + ' checklist' + (hits.length !== 1 ? 's' : '') + ' found';
    document.getElementById('searchSub').textContent = 'Matching “' + inp.value.trim() + '”';
    const grid = document.getElementById('searchResults');
    grid.innerHTML = '';
    if (!hits.length){
      grid.innerHTML = '<div class="empty-note">No checklist matches that search. Try the equipment type (for example “pump”, “conveyor”, “truck”) or browse a discipline below after clearing the search.</div>';
      return;
    }
    hits.forEach(eq => grid.appendChild(equipmentCard(eq, true)));
  }
  document.getElementById('hubSearch').addEventListener('input', runHubSearch);
  document.getElementById('hubSearchClear').addEventListener('click', () => {
    const inp = document.getElementById('hubSearch'); inp.value = ''; runHubSearch(); inp.focus();
  });

  /* ---------------- Category page ---------------- */
  function renderCatList(){
    const cat = currentCategory; if (!cat) return;
    const q = norm(document.getElementById('catFilter').value).trim();
    const list = EQUIPMENT.filter(eq => eq.category === cat.id)
      .filter(eq => !q || q.split(/\s+/).every(w => norm(eq.title + ' ' + eq.dept).indexOf(w) !== -1));
    catGrid.innerHTML = '';
    list.forEach(eq => catGrid.appendChild(equipmentCard(eq)));
    const total = EQUIPMENT.filter(eq => eq.category === cat.id).length;
    document.getElementById('catCount').textContent = q ? list.length + ' of ' + total + ' checklists' : total + ' checklists';
    if (!list.length) catGrid.innerHTML = '<div class="empty-note">No checklist in this discipline matches the filter.</div>';
  }
  document.getElementById('catFilter').addEventListener('input', renderCatList);

  function openCategory(cat){
    currentCategory = cat;
    document.getElementById('catTitle').textContent = cat.title;
    document.getElementById('catDesc').textContent = cat.desc || '';
    document.getElementById('catIcon').innerHTML = catIcon(cat.id);
    document.getElementById('catFilter').value = '';
    renderCatList();
    hubView.style.display = 'none';
    formView.style.display = 'none';
    catView.style.display = 'block';
    window.scrollTo(0,0);
  }

  function closeCategory(){
    catView.style.display = 'none';
    hubView.style.display = 'block';
    currentCategory = null;
    renderHub();
    window.scrollTo(0,0);
  }

  document.getElementById('btnCatBack').addEventListener('click', closeCategory);

  function openEquipment(eq){
    currentEquipment = eq;
    state = Object.assign({}, STATE_DEFAULTS, { header:{}, items:{}, readings:{}, comments:{}, photos:{}, findings:{}, corrective:{} });

    document.getElementById('formTitle').textContent = eq.title;
    { const dc = docOf(eq); document.getElementById('formDocNo').textContent = dc.no + '  ·  Rev ' + dc.rev; }
    document.getElementById('formEyebrow').textContent = catById(eq.category).title || 'Condition Monitoring';
    document.getElementById('f_tag').placeholder = eq.tagPlaceholder || 'Equipment tag';
    document.getElementById('tagPill').textContent = 'Set tag #';
    document.getElementById('f_date').value = new Date().toISOString().slice(0,10);
    document.getElementById('f_wo').value = '';
    document.getElementById('f_checkby').value = '';
    document.getElementById('f_reviewby').value = '';
    document.getElementById('f_tag').value = '';
    document.getElementById('f_visual').checked = !!eq.defaultVisual;
    document.getElementById('f_vibration').checked = !!eq.defaultVibration;
    state.header.f_date = document.getElementById('f_date').value;
    state.header.f_visual = !!eq.defaultVisual;
    state.header.f_vibration = !!eq.defaultVibration;
    state.header.f_drivetype = '';

    buildSections(eq);
    document.getElementById('actionbar').classList.add('show');
    document.getElementById('saveNoteWrap').classList.add('show');
    hubView.style.display = 'none';
    catView.style.display = 'none';
    formView.style.display = 'block';
    window.scrollTo(0,0);

    loadDraft();
    refreshProgress();
  }

  function closeEquipment(){
    closeQrScanner();
    formView.style.display = 'none';
    document.getElementById('actionbar').classList.remove('show');
    document.getElementById('saveNoteWrap').classList.remove('show');
    currentEquipment = null;
    if (currentCategory){
      openCategory(currentCategory); // return to the category page, refreshing draft chips
    } else {
      hubView.style.display = 'block';
      renderHub();
    }
    window.scrollTo(0,0);
  }

  document.getElementById('btnBack').addEventListener('click', closeEquipment);

  /* ---------------- Build sections DOM for current equipment ---------------- */
  function buildDriveTypeSelector(eq){
    const wrap = document.createElement('div');
    wrap.className = 'card drivetype-card';
    const options = eq.driveTypeOptions || DRIVE_COUPLING_TYPES;
    wrap.innerHTML = `
      <label class="small-label" for="f_drivetype">Drive / Coupling Type</label>
      <select id="f_drivetype">
        <option value="">Select drive/coupling type…</option>
        ${options.map(t => `<option value="${esc(t)}">${esc(t)}</option>`).join('')}
      </select>`;
    const sel = wrap.querySelector('#f_drivetype');
    sel.value = state.header.f_drivetype || '';
    sel.addEventListener('change', (e) => {
      state.header.f_drivetype = e.target.value;
      // Rebuild so hidden/shown inspection points match the new selection.
      // Values already entered stay in `state` (items/findings/corrective/readings)
      // even while their row is hidden — nothing already recorded is lost.
      buildSections(currentEquipment);
      syncSectionsUI();
      scheduleSave();
    });
    return wrap;
  }

  function buildSections(eq){
    const root = document.getElementById('sectionsRoot');
    const openIds = Array.from(root.querySelectorAll('.section.open')).map(el => el.id);
    root.innerHTML = '';

    let renderedIdx = 0;
    for (const sec of eq.sections){
      if (eq.driveCouplingField && sec.title.indexOf('Coupling — A.') === 0){
        root.appendChild(buildDriveTypeSelector(eq));
      }

      const shownItems = visibleItems(sec);

      // Coupling-type sub-sections that don't apply to the selected type simply
      // don't render at all — only the chosen coupling's own section (plus the
      // shared General section, when relevant) shows up.
      if (sec.title.indexOf('Coupling — ') === 0 && shownItems.length === 0){
        continue;
      }

      const idx = renderedIdx++;

      const secEl = document.createElement('div');
      secEl.className = 'section';
      secEl.id = 'sec_' + sec.id;

      const head = document.createElement('div');
      head.className = 'section-head';
      const badgeInitial = shownItems.length ? 'Pending' : 'Data';
      head.innerHTML = `
        <div class="section-head-left">
          <span class="section-index">${String(idx+1).padStart(2,'0')}</span>
          <span class="section-title">${esc(cleanTitle(sec.title))}</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="section-status pending" id="status_${sec.id}">${badgeInitial}</span>
          <svg class="chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>
        </div>`;
      head.addEventListener('click', () => secEl.classList.toggle('open'));

      const body = document.createElement('div');
      body.className = 'section-body';

      shownItems.forEach((item, k) => {
        const ref = (idx + 1) + '.' + (k + 1);
        const row = document.createElement('div');
        row.className = item.detailed ? 'item-row detailed' : 'item-row';

        const labelHtml = item.detailed
          ? `<span class="item-label"><span class="item-no">${ref}</span>${item.component ? `<span class="item-component">${esc(item.component)}</span> — ` : ''}${esc(item.checkpoint)}</span>`
          : `<span class="item-label"><span class="item-no">${ref}</span>${item.label}</span>`;

        row.innerHTML = `
          <div class="item-top">
            ${labelHtml}
            <div class="segmented" data-item="${item.id}">
              <button type="button" class="seg-btn" data-v="ok">OK</button>
              <button type="button" class="seg-btn" data-v="notok">NOT OK</button>
              <button type="button" class="seg-btn" data-v="na">N/A</button>
            </div>
          </div>
          ${item.detailed ? `
          <div class="item-meta">${item.freq ? `<span class="freq-chip">${esc(item.freq)}</span>` : ''}${item.acceptance ? `Acceptance: ${esc(item.acceptance)}` : ''}</div>
          <div class="item-detail-grid">
            <div class="item-detail-field">
              <label>Findings / Measured Value</label>
              <input type="text" data-finding="${item.id}" placeholder="Enter finding or measured value">
            </div>
            <div class="item-detail-field">
              <label>Corrective Action Required</label>
              <input type="text" data-corrective="${item.id}" placeholder="Required if NOT OK">
            </div>
          </div>` : ''}`;

        row.querySelectorAll('.seg-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            row.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.items[item.id] = btn.dataset.v;
            refreshSection(sec);
            refreshProgress();
            refreshItemValidation(row, item);
            scheduleSave();
          });
        });

        if (item.detailed){
          const findingInp = row.querySelector(`input[data-finding="${item.id}"]`);
          const correctiveInp = row.querySelector(`input[data-corrective="${item.id}"]`);
          findingInp.addEventListener('input', () => { state.findings[item.id] = findingInp.value; refreshItemValidation(row, item); scheduleSave(); });
          correctiveInp.addEventListener('input', () => { state.corrective[item.id] = correctiveInp.value; refreshItemValidation(row, item); scheduleSave(); });
        }

        body.appendChild(row);
      });

      if (sec.readings && sec.readings.length){
        const plainReadings = sec.readings.filter(r => r.unit !== 'mm');
        const thicknessReadings = sec.readings.filter(r => r.unit === 'mm');

        if (plainReadings.length){
          const rb = document.createElement('div');
          rb.className = 'reading-block';
          rb.innerHTML = (sec.readingNote ? `<div class="reading-note">${esc(readingNoteText(sec.readingNote))}</div>` : '') +
            `<div class="reading-grid">${plainReadings.map(r => `
              <div class="reading-field">
                <label>${r.label} (${r.unit})</label>
                <input type="text" inputmode="decimal" data-reading="${r.id}" placeholder="—">
              </div>`).join('')}</div>`;
          body.appendChild(rb);
          rb.querySelectorAll('input[data-reading]').forEach(inp => {
            inp.addEventListener('input', () => { state.readings[inp.dataset.reading] = inp.value; scheduleSave(); });
          });
        }

        if (thicknessReadings.length){
          const tb = document.createElement('div');
          tb.className = 'reading-block';
          tb.innerHTML = (sec.readingNote ? `<div class="reading-note">${sec.readingNote}</div>` : '') +
            `<div class="thickness-list">${thicknessReadings.map(r => `
              <div class="thickness-point" data-point="${r.id}">
                <div class="thickness-point-head">${r.label} (mm)</div>
                <div class="thickness-grid">
                  <div class="reading-field">
                    <label>Current reading</label>
                    <input type="text" inputmode="decimal" data-tk="${r.id}" data-field="current" placeholder="—">
                  </div>
                  <div class="reading-field">
                    <label>Previous reading</label>
                    <input type="text" inputmode="decimal" data-tk="${r.id}" data-field="previous" placeholder="—">
                  </div>
                  <div class="reading-field">
                    <label>Previous reading date</label>
                    <input type="date" data-tk="${r.id}" data-field="previousDate">
                  </div>
                  <div class="reading-field">
                    <label>Min. allowable (mm)</label>
                    <input type="text" inputmode="decimal" data-tk="${r.id}" data-field="minAllowable" placeholder="—">
                  </div>
                </div>
                <div class="thickness-result pending" data-tk-result="${r.id}">Enter current, previous, previous date and minimum allowable to calculate corrosion rate and remaining life.</div>
              </div>`).join('')}</div>`;
          body.appendChild(tb);
          tb.querySelectorAll('input[data-tk]').forEach(inp => {
            inp.addEventListener('input', () => {
              const id = inp.dataset.tk, field = inp.dataset.field;
              state.readings[id] = state.readings[id] || {};
              if (typeof state.readings[id] === 'string'){ state.readings[id] = { current: state.readings[id] }; }
              state.readings[id][field] = inp.value;
              refreshThicknessPoint(id);
              refreshProgress();
              scheduleSave();
            });
          });
        }
      }

      const cb = document.createElement('div');
      cb.className = 'comment-block';
      cb.innerHTML = `<label class="small-label">Observations / Comments</label>
        <textarea placeholder="Note any abnormal readings, wear, leaks, or actions taken…" data-comment="${sec.id}"></textarea>`;
      cb.querySelector('textarea').addEventListener('input', (e) => {
        state.comments[sec.id] = e.target.value; scheduleSave();
      });
      body.appendChild(cb);

      const pb = document.createElement('div');
      pb.className = 'photo-block';
      pb.innerHTML = `<label class="small-label">Photos</label>
        <div class="photo-strip" id="strip_${sec.id}">
          <label class="photo-add">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h3l2-2h6l2 2h3v12H4z"/><circle cx="12" cy="13" r="3.2"/></svg>
            Add
            <input type="file" accept="image/*" capture="environment" multiple style="display:none" data-photo="${sec.id}">
          </label>
        </div>`;
      body.appendChild(pb);
      const fileInput = pb.querySelector('input[data-photo]');
      fileInput.addEventListener('change', (e) => handlePhotos(sec.id, e.target.files, e.target));

      secEl.appendChild(head);
      secEl.appendChild(body);
      root.appendChild(secEl);
    }

    if (openIds.length){
      openIds.forEach(id => { const el = document.getElementById(id); if (el) el.classList.add('open'); });
    } else if (eq.sections.length){
      document.getElementById('sec_' + eq.sections[0].id).classList.add('open');
    }
  }

  function refreshItemValidation(row, item){
    if (!item.detailed) return;
    const status = state.items[item.id];
    const findingInp = row.querySelector(`input[data-finding="${item.id}"]`);
    const correctiveInp = row.querySelector(`input[data-corrective="${item.id}"]`);
    const requireFilled = status === 'notok';
    if (findingInp) findingInp.classList.toggle('missing-required', requireFilled && !findingInp.value.trim());
    if (correctiveInp) correctiveInp.classList.toggle('missing-required', requireFilled && !correctiveInp.value.trim());
  }

  function refreshSection(sec){
    const badge = document.getElementById('status_' + sec.id);
    if (!badge) return;
    const items = visibleItems(sec);
    if (items.length === 0){ badge.textContent = 'Data'; badge.className = 'section-status pending'; return; }
    const vals = items.map(i => state.items[i.id]).filter(Boolean);
    if (vals.length === 0){ badge.textContent = 'Pending'; badge.className = 'section-status pending'; return; }
    if (vals.includes('notok')){ badge.textContent = 'Attention'; badge.className = 'section-status notok'; return; }
    if (vals.length === items.length){ badge.textContent = 'OK'; badge.className = 'section-status ok'; return; }
    badge.textContent = vals.length + '/' + items.length; badge.className = 'section-status pending';
  }

  function refreshProgress(){
    if (!currentEquipment) return;
    const allVisible = currentEquipment.sections.reduce((arr,s) => arr.concat(visibleItems(s)), []);
    const totalItems = allVisible.length;
    const done = allVisible.filter(i => !!state.items[i.id]).length;
    const pct = totalItems ? Math.round(done/totalItems*100) : 0;
    document.getElementById('progressFill').style.width = pct + '%';
    document.getElementById('progressText').textContent = done + ' of ' + totalItems + ' checks recorded';
    document.getElementById('progressPct').textContent = pct + '%';

    const notOkItems = [];
    currentEquipment.sections.forEach(sec => sec.items.forEach(i => {
      if (state.items[i.id] === 'notok') notOkItems.push(cleanTitle(sec.title) + ': ' + (i.label || ''));
    }));
    const banner = document.getElementById('flagBanner');
    if (notOkItems.length){
      banner.classList.add('show');
      document.getElementById('flagText').textContent =
        notOkItems.length + ' item' + (notOkItems.length>1?'s':'') + ' flagged Not OK — see section comments';
    } else {
      banner.classList.remove('show');
    }

    updateHealthPill();
    updateRULPill();
  }

  /* =====================================================================
     RELIABILITY — PHASE 1: EQUIPMENT HEALTH SCORE
     Converts the current inspection's answers into a single 0-100
     condition score, weighted by how safety/integrity-critical each
     section is. Purely computed from data already on the form — no
     backend or extra fields required.
     ===================================================================== */

  // Section classification: procedural/safety sections are excluded from
  // the health score (they measure compliance, not equipment condition).
  // Everything else is weighted by how directly it reflects asset integrity.
  const HEALTH_EXCLUDE_SECONDARY = ['access', 'isolation', 'preparation', 'requirement', 'entry'];
  const HEALTH_CRITICAL_KEYWORDS = [
    'weld', 'bolt', 'connection', 'foundation', 'bottom plate', 'shell',
    'trunnion', 'bearing', 'wheel', 'axle', 'thickness', 'ndt', 'leak',
    'containment', 'pressure', 'relief', 'liner', 'wear', 'metering',
    'injector', 'valve', 'strainer', 'reservoir', 'pump unit', 'roof',
    'structural frame', 'undercarriage', 'structural members',
    'motor', 'gearbox', 'coupling', 'pump', 'agitator', 'sizer', 'mill',
    'pinion', 'gear', 'cylinder', 'cooling system', 'drive unit',
    'drive motor', 'lubricator', 'rake', 'hydraulic drive', 'oil film',
    'brake', 'steering', 'rops', 'fire suppression', 'engine', 'powertrain',
    'turbocharger', 'tyres', 'boom', 'protection devices',
    'hot surfaces', 'lifting system', 'explosives', 'alternator'
  ];
  const HEALTH_MAJOR_KEYWORDS = [
    'corrosion', 'coating', 'documentation', 'operating envelope',
    'alignment', 'support', 'platform', 'handrail', 'dust', 'enclosure',
    'access door', 'guarding', 'lubrication point', 'distribution line',
    'nozzle', 'appurten', 'controller', 'timer', 'positioning', 'retraction',
    'screen panel', 'lab submission', 'record keeping'
  ];

  function classifySection(sec){
    const t = (sec.title || '').toLowerCase();
    // A section with only a condition-rating table (no checklist items) is
    // the engineer's own holistic judgment call — always weighted highest.
    if ((!sec.items || sec.items.length === 0) && sec.readings && sec.readings.length){
      return { weight: 3, exclude: false, kind: 'rating' };
    }
    // Procedural/safety sections (JSA, PPE, LOTO, permits, access) measure
    // task compliance, not equipment condition — excluded from the score.
    if (t.includes('safety') && HEALTH_EXCLUDE_SECONDARY.some(k => t.includes(k))){
      return { weight: 0, exclude: true, kind: 'procedural' };
    }
    if (HEALTH_CRITICAL_KEYWORDS.some(k => t.includes(k))) return { weight: 3, exclude: false, kind: 'critical' };
    if (HEALTH_MAJOR_KEYWORDS.some(k => t.includes(k))) return { weight: 2, exclude: false, kind: 'major' };
    return { weight: 1, exclude: false, kind: 'minor' };
  }

  function computeHealthScore(eq, st){
    if (!eq || eq.healthScoreApplicable === false) return null;
    let weightedSum = 0, weightTotal = 0, anyData = false;

    eq.sections.forEach(sec => {
      const cls = classifySection(sec);
      if (cls.exclude) return;
      let secScore = null;

      if (cls.kind === 'rating'){
        const vals = sec.readings
          .map(r => parseFloat(st.readings[r.id]))
          .filter(v => !isNaN(v) && v >= 1 && v <= 5);
        if (vals.length){
          const avgRating = vals.reduce((a,b) => a+b, 0) / vals.length;
          secScore = Math.max(0, Math.min(100, (6 - avgRating) / 5 * 100));
        }
      } else if (sec.items && sec.items.length){
        const vals = visibleItems(sec).map(i => st.items[i.id]).filter(v => v === 'ok' || v === 'notok');
        if (vals.length){
          const okCount = vals.filter(v => v === 'ok').length;
          secScore = okCount / vals.length * 100;
        }
      }

      if (secScore !== null){
        anyData = true;
        weightedSum += secScore * cls.weight;
        weightTotal += cls.weight;
      }
    });

    if (!anyData || weightTotal === 0) return null;
    const score = Math.round(weightedSum / weightTotal);
    let band, label;
    if (score >= 80){ band = 'good'; label = 'Good'; }
    else if (score >= 60){ band = 'fair'; label = 'Fair — Monitor'; }
    else if (score >= 40){ band = 'poor'; label = 'Poor — Plan Repair'; }
    else { band = 'critical'; label = 'Critical — Urgent'; }
    return { score, band, label };
  }

  function updateHealthPill(){
    if (!currentEquipment) return;
    const pill = document.getElementById('healthPill');
    if (!pill) return;
    if (currentEquipment.healthScoreApplicable === false){
      const g = goNoGo(currentEquipment);
      if (!g){ pill.style.display = 'none'; return; }
      pill.style.display = 'inline-flex';
      pill.textContent = g.decision === 'GO' ? 'GO · fit to operate' : g.decision === 'NO-GO' ? 'NO-GO · ' + g.nok.length + ' critical defect' + (g.nok.length > 1 ? 's' : '') : 'Incomplete · ' + g.open.length + ' critical open';
      pill.className = 'health-pill ' + (g.decision === 'GO' ? 'good' : g.decision === 'NO-GO' ? 'critical' : '');
      return;
    }
    pill.style.display = 'inline-flex';
    const health = computeHealthScore(currentEquipment, state);
    state.healthScore = health; // carried into the saved draft for the hub/category card chip
    if (health){
      pill.textContent = 'Health ' + health.score + '% · ' + health.label;
      pill.className = 'health-pill ' + health.band;
    } else {
      pill.textContent = 'Health —';
      pill.className = 'health-pill pending';
    }
  }

  /* =====================================================================
     RELIABILITY — PHASE 2: REMAINING USEFUL LIFE (RUL) / CORROSION RATE
     Standard API 570 / API 653 methodology, applied to any reading field
     tagged unit:'mm'. Purely a calculator — the inspector supplies the
     previous reading, its date, and the minimum allowable thickness each
     time (there is no shared backend yet to carry this forward automatically —
     see the Phase 3 roadmap).
       Corrosion rate (mm/yr) = (previous - current) / years between readings
       Remaining life (yrs)   = (current - minimum allowable) / corrosion rate
     ===================================================================== */

  function computeRUL(entry, curDateStr){
    if (!entry || typeof entry !== 'object') return null;
    const cur = parseFloat(entry.current);
    const prev = parseFloat(entry.previous);
    const minT = parseFloat(entry.minAllowable);
    const prevDateStr = entry.previousDate;
    if (isNaN(cur) || isNaN(prev) || isNaN(minT) || !prevDateStr || !curDateStr) return null;

    const curDate = new Date(curDateStr), prevDate = new Date(prevDateStr);
    const years = (curDate - prevDate) / (365.25 * 24 * 3600 * 1000);
    if (!(years > 0)){
      return { error: 'Previous reading date must be before the current inspection date.' };
    }

    const loss = prev - cur;
    if (loss <= 0){
      return {
        rate: 0, remainingLife: Infinity, band: 'good',
        text: 'No measurable thickness loss since last reading — corrosion rate \u2248 0 mm/yr.'
      };
    }

    const rate = loss / years;
    if (cur <= minT){
      return {
        rate, remainingLife: 0, band: 'critical',
        text: `Corrosion rate ${rate.toFixed(3)} mm/yr — current reading is AT or BELOW minimum allowable thickness. Immediate engineering assessment required.`
      };
    }

    const remainingLife = (cur - minT) / rate;
    let band;
    if (remainingLife >= 5) band = 'good';
    else if (remainingLife >= 2) band = 'fair';
    else if (remainingLife >= 1) band = 'poor';
    else band = 'critical';

    return {
      rate, remainingLife, band,
      text: `Corrosion rate: ${rate.toFixed(3)} mm/yr — Estimated remaining life: ${remainingLife.toFixed(1)} yrs`
    };
  }

  function refreshThicknessPoint(id){
    const el = document.querySelector(`[data-tk-result="${id}"]`);
    if (!el) return;
    const result = computeRUL(state.readings[id], state.header.f_date);
    if (!result){
      el.className = 'thickness-result pending';
      el.textContent = 'Enter current, previous, previous date and minimum allowable to calculate corrosion rate and remaining life.';
      return;
    }
    if (result.error){
      el.className = 'thickness-result poor';
      el.textContent = result.error;
      return;
    }
    el.className = 'thickness-result ' + result.band;
    el.textContent = result.text;
  }

  function equipmentHasThicknessFields(eq){
    return !!eq && eq.sections.some(s => (s.readings || []).some(r => r.unit === 'mm'));
  }

  function computeEquipmentRUL(eq, st){
    if (!eq) return null;
    let worst = null;
    eq.sections.forEach(sec => {
      (sec.readings || []).forEach(r => {
        if (r.unit !== 'mm') return;
        const result = computeRUL(st.readings[r.id], st.header.f_date);
        if (!result || result.error || result.remainingLife === undefined) return;
        if (worst === null || result.remainingLife < worst.remainingLife){
          worst = Object.assign({ pointLabel: r.label }, result);
        }
      });
    });
    return worst;
  }

  function updateRULPill(){
    if (!currentEquipment) return;
    const pill = document.getElementById('rulPill');
    if (!pill) return;
    if (!equipmentHasThicknessFields(currentEquipment)){
      pill.style.display = 'none';
      return;
    }
    pill.style.display = 'inline-flex';
    const worst = computeEquipmentRUL(currentEquipment, state);
    state.worstRUL = worst || null; // carried into the saved draft for the hub/category card chip
    if (!worst){
      pill.textContent = 'RUL —';
      pill.className = 'health-pill pending';
      return;
    }
    const lifeText = worst.remainingLife === Infinity ? 'Stable' : worst.remainingLife.toFixed(1) + ' yrs';
    pill.textContent = 'RUL ' + lifeText + ' (' + worst.pointLabel + ')';
    pill.className = 'health-pill ' + worst.band;
  }

  /* ---------------- Photos ---------------- */
  function handlePhotos(secId, files, inputEl){
    if (!files || !files.length) return;
    state.photos[secId] = state.photos[secId] || [];
    Array.from(files).forEach(file => {
      compressImage(file, 900, 0.72).then(dataUrl => {
        state.photos[secId].push(dataUrl);
        renderPhotoStrip(secId);
        scheduleSave();
      }).catch(() => { showToast('Could not read that photo'); });
    });
    inputEl.value = '';
  }

  function compressImage(file, maxDim, quality){
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          let w = img.width, h = img.height;
          if (w > maxDim || h > maxDim){
            const scale = maxDim / Math.max(w,h);
            w = Math.round(w*scale); h = Math.round(h*scale);
          }
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function renderPhotoStrip(secId){
    const strip = document.getElementById('strip_' + secId);
    if (!strip) return;
    const addBtn = strip.querySelector('.photo-add');
    strip.querySelectorAll('.photo-thumb').forEach(el => el.remove());
    (state.photos[secId] || []).forEach((src, idx) => {
      const thumb = document.createElement('div');
      thumb.className = 'photo-thumb';
      thumb.innerHTML = `<img src="${src}" alt="Inspection photo"><button type="button" aria-label="Remove photo">✕</button>`;
      thumb.querySelector('button').addEventListener('click', () => {
        state.photos[secId].splice(idx,1);
        renderPhotoStrip(secId);
        scheduleSave();
      });
      strip.insertBefore(thumb, addBtn);
    });
  }

  /* ---------------- Header fields ---------------- */
  const headerIds = ['f_date','f_wo','f_checkby','f_reviewby','f_tag'];
  headerIds.forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('input', () => {
      state.header[id] = el.value; scheduleSave();
      if (id === 'f_tag') document.getElementById('tagPill').textContent = el.value || 'Set tag #';
    });
  });
  ['f_visual','f_vibration'].forEach(id => {
    document.getElementById(id).addEventListener('change', (e) => {
      state.header[id] = e.target.checked; scheduleSave();
    });
  });

  /* ---------------- QR code scanner (Work Order #) ---------------- */
  let qrStream = null;
  let qrScanRAF = null;
  let qrCanvas = null;
  let qrCanvasCtx = null;

  function openQrScanner(){
    const modal = document.getElementById('qrModal');
    const video = document.getElementById('qrVideo');
    const statusEl = document.getElementById('qrModalStatus');
    if (typeof jsQR === 'undefined'){
      showToast('QR scanner library failed to load — check your connection');
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
      showToast('Camera access is not available in this browser');
      return;
    }
    statusEl.textContent = 'Point the camera at a QR code';
    modal.classList.add('show');
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        qrStream = stream;
        video.srcObject = stream;
        video.setAttribute('playsinline', true);
        video.play();
        qrCanvas = qrCanvas || document.createElement('canvas');
        qrCanvasCtx = qrCanvas.getContext('2d', { willReadFrequently: true });
        qrScanRAF = requestAnimationFrame(scanQrFrame);
      })
      .catch(err => {
        statusEl.textContent = 'Camera unavailable: ' + (err && err.message ? err.message : 'permission denied');
      });
  }

  function scanQrFrame(){
    const video = document.getElementById('qrVideo');
    if (!video || video.readyState !== video.HAVE_ENOUGH_DATA){
      qrScanRAF = requestAnimationFrame(scanQrFrame);
      return;
    }
    qrCanvas.width = video.videoWidth;
    qrCanvas.height = video.videoHeight;
    qrCanvasCtx.drawImage(video, 0, 0, qrCanvas.width, qrCanvas.height);
    let code = null;
    try{
      const imageData = qrCanvasCtx.getImageData(0, 0, qrCanvas.width, qrCanvas.height);
      code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
    } catch(err){ /* frame not ready / decode error — keep scanning */ }

    if (code && code.data){
      document.getElementById('qrModalStatus').textContent = 'Found: ' + code.data;
      const woInput = document.getElementById('f_wo');
      woInput.value = code.data;
      state.header.f_wo = code.data;
      scheduleSave();
      showToast('Work order # captured from QR code');
      closeQrScanner();
      return;
    }
    qrScanRAF = requestAnimationFrame(scanQrFrame);
  }

  function closeQrScanner(){
    if (qrScanRAF) cancelAnimationFrame(qrScanRAF);
    qrScanRAF = null;
    if (qrStream){
      qrStream.getTracks().forEach(t => t.stop());
      qrStream = null;
    }
    document.getElementById('qrModal').classList.remove('show');
  }

  document.getElementById('btnQrScan').addEventListener('click', openQrScanner);
  document.getElementById('qrModalClose').addEventListener('click', closeQrScanner);
  document.getElementById('qrModal').addEventListener('click', (e) => {
    if (e.target.id === 'qrModal') closeQrScanner();
  });

  /* ---------------- Save / load draft (browser localStorage, per equipment) ---------------- */
  function scheduleSave(){
    clearTimeout(saveTimer);
    document.getElementById('saveNote').textContent = 'Unsaved changes…';
    saveTimer = setTimeout(() => saveDraft(false), 900);
  }

  function saveDraft(showMsg){
    if (!currentEquipment) return;
    try{
      state.savedAt = Date.now();
      window.localStorage.setItem(draftKey(currentEquipment), JSON.stringify(state));
      const t = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
      document.getElementById('saveNote').textContent = 'Saved ' + t;
      if (showMsg) showToast('Draft saved');
    } catch(err){
      document.getElementById('saveNote').textContent = 'Save unavailable in this browser';
    }
  }

  function loadDraft(){
    if (!currentEquipment) return;
    try{
      const raw = window.localStorage.getItem(draftKey(currentEquipment));
      if (raw){
        applyState(JSON.parse(raw));
        showToast('Restored your last draft');
      }
    } catch(err){ /* no draft yet, start fresh */ }
  }

  function applyState(saved){
    state = Object.assign({}, STATE_DEFAULTS, saved, {
      header: Object.assign({}, saved.header||{}),
      items: Object.assign({}, saved.items||{}),
      readings: Object.assign({}, saved.readings||{}),
      comments: Object.assign({}, saved.comments||{}),
      photos: Object.assign({}, saved.photos||{}),
      findings: Object.assign({}, saved.findings||{}),
      corrective: Object.assign({}, saved.corrective||{})
    });
    headerIds.forEach(id => { if (state.header[id] !== undefined) document.getElementById(id).value = state.header[id]; });
    document.getElementById('f_visual').checked = !!state.header.f_visual;
    document.getElementById('f_vibration').checked = !!state.header.f_vibration;
    document.getElementById('tagPill').textContent = state.header.f_tag || 'Set tag #';

    if (currentEquipment.driveCouplingField){
      buildSections(currentEquipment); // re-render so the restored drive/coupling type's points (and its selector) exist before syncing values
    }

    syncSectionsUI();
  }

  // Reapplies everything already in `state` onto the current sections DOM —
  // used both after loading a saved draft and after a Drive/Coupling Type
  // change rebuilds the visible item set, so nothing entered is ever lost.
  function syncSectionsUI(){
    if (!currentEquipment) return;
    currentEquipment.sections.forEach(sec => {
      visibleItems(sec).forEach(item => {
        const v = state.items[item.id];
        const seg = document.querySelector(`.segmented[data-item="${item.id}"]`);
        if (seg && v) seg.querySelectorAll('.seg-btn').forEach(b => b.classList.toggle('active', b.dataset.v === v));
        if (item.detailed){
          const findingInp = document.querySelector(`input[data-finding="${item.id}"]`);
          const correctiveInp = document.querySelector(`input[data-corrective="${item.id}"]`);
          if (findingInp && state.findings[item.id] !== undefined) findingInp.value = state.findings[item.id];
          if (correctiveInp && state.corrective[item.id] !== undefined) correctiveInp.value = state.corrective[item.id];
          const rowEl = seg ? seg.closest('.item-row') : null;
          if (rowEl) refreshItemValidation(rowEl, item);
        }
      });
      (sec.readings||[]).forEach(r => {
        if (r.unit === 'mm'){
          let entry = state.readings[r.id];
          if (typeof entry === 'string'){ entry = { current: entry }; state.readings[r.id] = entry; } // migrate old plain-value drafts
          if (entry && typeof entry === 'object'){
            ['current','previous','previousDate','minAllowable'].forEach(field => {
              const inp = document.querySelector(`input[data-tk="${r.id}"][data-field="${field}"]`);
              if (inp && entry[field] !== undefined) inp.value = entry[field];
            });
          }
          refreshThicknessPoint(r.id);
        } else {
          const inp = document.querySelector(`input[data-reading="${r.id}"]`);
          if (inp && state.readings[r.id] !== undefined) inp.value = state.readings[r.id];
        }
      });
      const ta = document.querySelector(`textarea[data-comment="${sec.id}"]`);
      if (ta && state.comments[sec.id]) ta.value = state.comments[sec.id];
      renderPhotoStrip(sec.id);
      refreshSection(sec);
    });
    refreshProgress();
  }

  document.getElementById('btnSave').addEventListener('click', () => saveDraft(true));

  document.getElementById('btnClear').addEventListener('click', () => {
    if (!currentEquipment) return;
    if (!confirm('Clear all entries on this inspection form? This cannot be undone.')) return;
    const eq = currentEquipment;
    state = Object.assign({}, STATE_DEFAULTS, { header:{}, items:{}, readings:{}, comments:{}, photos:{}, findings:{}, corrective:{} });
    document.querySelectorAll('.seg-btn.active').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('input[type=text], input[data-reading], input[data-tk]').forEach(i => { i.value = ''; i.classList.remove('missing-required'); });
    document.querySelectorAll('textarea').forEach(t => t.value = '');
    document.getElementById('f_date').value = new Date().toISOString().slice(0,10);
    document.getElementById('f_wo').value = '';
    document.getElementById('f_checkby').value = '';
    document.getElementById('f_reviewby').value = '';
    document.getElementById('f_tag').value = '';
    document.getElementById('f_visual').checked = !!eq.defaultVisual;
    document.getElementById('f_vibration').checked = !!eq.defaultVibration;
    document.getElementById('tagPill').textContent = 'Set tag #';
    state.header.f_date = document.getElementById('f_date').value;
    state.header.f_visual = !!eq.defaultVisual;
    state.header.f_vibration = !!eq.defaultVibration;
    if (eq.driveCouplingField){
      state.header.f_drivetype = '';
      buildSections(eq); // collapse back to the un-filtered (no type selected) view
    }
    eq.sections.forEach(sec => {
      const strip = document.getElementById('strip_'+sec.id);
      if (strip) strip.querySelectorAll('.photo-thumb').forEach(el=>el.remove());
      (sec.readings || []).forEach(r => { if (r.unit === 'mm') refreshThicknessPoint(r.id); });
      refreshSection(sec);
    });
    refreshProgress();
    saveDraft(false);
    showToast('Form cleared');
  });

  /* ---------------- Toast ---------------- */
  let toastTimer = null;
  function showToast(msg){
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }

  /* ---------------- PDF export ---------------- */
  function statusLabel(v){
    if (v === 'ok') return {text:'OK', cls:'ok'};
    if (v === 'notok') return {text:'NOT OK', cls:'notok'};
    if (v === 'na') return {text:'N/A', cls:'na'};
    return {text:'—', cls:'na'};
  }

  function esc(str){
    return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // Native jsPDF report (no screenshots → no canvas size limits on long checklists).
  function pdfTxt(v){
    return String(v == null ? '' : v)
      .replace(/≤/g,'<=').replace(/≥/g,'>=').replace(/Δ/g,'d').replace(/→/g,'->').replace(/≈/g,'~')
      .replace(/Ω/g,'ohm').replace(/−/g,'-').replace(/✓/g,'OK').replace(/✕/g,'x').replace(/⚠/g,'!')
      .replace(/[\u2080-\u2089]/g, c => String(c.charCodeAt(0) - 0x2080))
      .replace(/[\u00B2]/g,'2')
      .replace(/[^\x00-\xFF\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u2026]/g,'');
  }
  const RATING_WORD = {1:'Good',2:'Fair',3:'Poor',4:'Critical',5:'Unsafe'};

  function generatePdfDoc(){
    const eq = currentEquipment, h = state.header || {};
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p','pt','a4');
    const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
    const M = 36, CW = W - M*2, BOTTOM = H - 44;
    const C = { navy:[27,54,72], deep:[15,35,48], amber:[224,151,44], ok:[47,125,92], nok:[180,67,47], na:[138,151,161],
                ink:[19,35,48], soft:[75,92,104], line:[215,221,226], light:[238,241,243], okbg:[228,243,236], nokbg:[251,232,228], amberbg:[253,241,224] };
    const cat = (CATEGORIES.find(c => c.id === eq.category) || {}).title || 'Condition Monitoring';
    let y = 0;

    const font = (style, size, color) => { doc.setFont('helvetica', style); doc.setFontSize(size); doc.setTextColor.apply(doc, color || C.ink); };
    const wrap = (t, w) => doc.splitTextToSize(pdfTxt(t), w);
    function newPage(){ doc.addPage(); y = 50; }
    const DOC = docOf(eq);
    const NS = numberedSections(eq);
    const REF = {}; NS.forEach(s => s.items.forEach(x => { REF[x.it.id] = x.ref; }));
    function need(hgt){ if (y + hgt > BOTTOM){ newPage(); return true; } return false; }

    // ---------- Title band ----------
    doc.setFillColor.apply(doc, C.deep); doc.rect(0, 0, W, 78, 'F');
    doc.setFillColor.apply(doc, C.amber); doc.rect(0, 78, W, 3, 'F');
    font('normal', 8.5, [185,203,214]); doc.text(pdfTxt('Lotus Africa Uranium Plant  ·  Engineering Department  ·  ' + cat), M, 24);
    font('bold', 17, [255,255,255]); doc.text(wrap(eq.title, CW - 130)[0], M, 46);
    font('normal', 9, [201,216,225]); doc.text('Inspection report', M, 64);
    font('normal', 8, [185,203,214]); doc.text(pdfTxt(DOC.no + '  ·  Rev ' + DOC.rev), W - M, 24, { align:'right' });
    font('bold', 9, [255,255,255]); doc.text(pdfTxt('Tag: ' + (h.f_tag || '—')), W - M, 46, { align:'right' });
    font('normal', 8.5, [201,216,225]); doc.text(pdfTxt('Date: ' + (h.f_date || '—')), W - M, 62, { align:'right' });
    y = 96;
    font('normal', 7.8, C.soft);
    wrap(eq.dept || '', CW).forEach(l => { doc.text(l, M, y); y += 10; });
    y += 4;

    // ---------- Details grid ----------
    const method = [h.f_visual ? 'Visual' : '', h.f_vibration ? 'Vibration' : ''].filter(Boolean).join(' + ') || '—';
    const fields = [['Equipment tag', h.f_tag], ['Inspection date', h.f_date], ['Work order', h.f_wo],
                    ['Inspected by', h.f_checkby], ['Reviewed by', h.f_reviewby], [eq.driveCouplingField ? 'Drive / coupling' : 'Method', eq.driveCouplingField ? (h.f_drivetype || '—') + ' · ' + method : method]];
    const fw = CW / 3, fh = 30;
    fields.forEach((f, i) => {
      const x = M + (i % 3) * fw, yy = y + Math.floor(i / 3) * fh;
      doc.setDrawColor.apply(doc, C.line); doc.setLineWidth(0.6); doc.rect(x, yy, fw, fh);
      font('normal', 7, C.soft); doc.text(f[0], x + 6, yy + 10);
      font('bold', 9.5, C.ink); doc.text(wrap(f[1] || '—', fw - 12)[0], x + 6, yy + 23);
    });
    y += fh * 2 + 12;

    // ---------- Summary tiles ----------
    const allVisible = eq.sections.reduce((a, s) => a.concat(visibleItems(s)), []);
    const vals = allVisible.map(i => state.items[i.id]);
    const ok = vals.filter(v => v === 'ok').length, nok = vals.filter(v => v === 'notok').length, na = vals.filter(v => v === 'na').length;
    const health = computeHealthScore(eq, state), rul = computeEquipmentRUL(eq, state);
    const bandCol = b => b === 'good' ? [C.okbg, C.ok] : b === 'fair' ? [C.amberbg, [154,97,19]] : b ? [C.nokbg, C.nok] : [C.light, C.soft];
    const tiles = [
      ['Checks recorded', (ok + nok + na) + ' / ' + allVisible.length, [C.light, C.ink]],
      ['OK', String(ok), [C.okbg, C.ok]],
      ['NOT OK', String(nok), nok ? [C.nokbg, C.nok] : [C.light, C.ink]],
      ['N/A', String(na), [C.light, C.ink]],
      ['Health score', health ? health.score + '%' : '—', bandCol(health && health.band)],
      ['Remaining life', rul ? (rul.remainingLife === Infinity ? 'Stable' : rul.remainingLife.toFixed(1) + ' yrs') : '—', bandCol(rul && rul.band)]
    ];
    const GNG = eq.healthScoreApplicable === false ? goNoGo(eq) : null;
    if (GNG){
      const col = GNG.decision === 'GO' ? [C.okbg, C.ok] : GNG.decision === 'NO-GO' ? [C.nokbg, C.nok] : [C.amberbg, [154,97,19]];
      tiles[4] = ['Critical NOT OK', String(GNG.nok.length) + ' / ' + GNG.total, GNG.nok.length ? [C.nokbg, C.nok] : [C.light, C.ink]];
      tiles[5] = ['Decision', GNG.decision, col];
    }
    const tg = 6, tw = (CW - tg * 5) / 6, th = 42;
    tiles.forEach((t, i) => {
      const x = M + i * (tw + tg);
      doc.setFillColor.apply(doc, t[2][0]); doc.roundedRect(x, y, tw, th, 4, 4, 'F');
      font('normal', 7, C.soft); doc.text(t[0], x + 7, y + 12);
      let fs = 14; font('bold', fs, t[2][1]); while (doc.getTextWidth(pdfTxt(t[1])) > tw - 12 && fs > 8){ fs--; doc.setFontSize(fs); }
      doc.text(pdfTxt(t[1]), x + 7, y + 32);
    });
    y += th + 10;
    let verdict = nok ? nok + ' defect' + (nok > 1 ? 's' : '') + ' recorded — raise each as a work request in Pronto before closing the WO.'
                        : (ok + nok + na) ? 'No defects recorded.' : 'No checks recorded yet.';
    let bad = !!nok;
    if (GNG){
      if (GNG.decision === 'NO-GO'){ verdict = 'NO-GO — critical defect at item ' + GNG.nok.join(', ') + '. Do not operate: tag out, report, raise a work request.'; bad = true; }
      else if (GNG.decision === 'INCOMPLETE'){ verdict = 'INCOMPLETE — critical check ' + GNG.open.join(', ') + ' not recorded. Not cleared to operate.'; bad = true; }
      else verdict = 'GO — all ' + GNG.total + ' critical checks OK' + (nok ? '; ' + nok + ' non-critical defect' + (nok > 1 ? 's' : '') + ' to report.' : '.');
    }
    doc.setFontSize(9); const VL = wrap('Result: ' + verdict + (health ? '  Condition: ' + health.label + '.' : ''), CW - 16);
    const vh = 8 + VL.length * 11;
    doc.setFillColor.apply(doc, bad ? C.nokbg : C.okbg); doc.rect(M, y, CW, vh, 'F');
    doc.setFillColor.apply(doc, bad ? C.nok : C.ok); doc.rect(M, y, 3, vh, 'F');
    font('bold', 9, bad ? C.nok : C.ok); doc.text(VL, M + 10, y + 13);
    y += vh + 12;

    const shortTitle = t => String(t).replace(/^Section \d+\s*—\s*/,'');

    // ---------- Defects & actions ----------
    const defects = [];
    eq.sections.forEach(sec => visibleItems(sec).forEach(it => { if (state.items[it.id] === 'notok') defects.push({ sec, it }); }));
    function tableHead(cols){
      doc.setFillColor.apply(doc, C.navy); doc.rect(M, y, CW, 16, 'F');
      font('bold', 7.8, [255,255,255]); let x = M;
      cols.forEach(c => { doc.text(c[0], x + 5, y + 11); x += c[1]; });
      y += 16;
    }
    font('bold', 12, C.ink); need(40); doc.text('Defects & corrective actions', M, y); y += 8;
    const dcols = [['Ref', 30], ['Section', 96], ['Check point', 190], ['Finding / corrective action', CW - 316]];
    if (!defects.length){
      y += 6; font('normal', 9, C.soft); doc.text('No NOT OK items in this inspection.', M, y + 8); y += 22;
    } else {
      y += 4; tableHead(dcols);
      defects.forEach((d, k) => {
        const label = d.it.detailed ? ((d.it.component ? d.it.component + ' — ' : '') + d.it.checkpoint) : d.it.label;
        const fc = [];
        if (state.findings[d.it.id]) fc.push('Finding: ' + state.findings[d.it.id]);
        if (state.corrective[d.it.id]) fc.push('Action: ' + state.corrective[d.it.id]);
        if (!fc.length) fc.push('No finding entered');
        doc.setFontSize(8);
        const c2 = wrap(cleanTitle(d.sec.title), dcols[1][1] - 10), c3 = wrap(label, dcols[2][1] - 10), c4 = wrap(fc.join('\n'), dcols[3][1] - 10);
        const rh = Math.max(c2.length, c3.length, c4.length) * 10 + 8;
        if (need(rh)) tableHead(dcols);
        if (k % 2) { doc.setFillColor(248,249,250); doc.rect(M, y, CW, rh, 'F'); }
        let x = M;
        font('bold', 8, C.nok); doc.text(REF[d.it.id] || String(k + 1), x + 5, y + 11); x += dcols[0][1];
        font('normal', 8, C.soft); doc.text(c2, x + 5, y + 11); x += dcols[1][1];
        font('normal', 8, C.ink); doc.text(c3, x + 5, y + 11); x += dcols[2][1];
        font('normal', 8, C.ink); doc.text(c4, x + 5, y + 11);
        doc.setDrawColor.apply(doc, C.line); doc.line(M, y + rh, M + CW, y + rh);
        y += rh;
      });
      y += 14;
    }

    // ---------- Detailed results ----------
    need(60); font('bold', 12, C.ink); doc.text('Detailed results', M, y); y += 10;
    function secBar(sec, cont){
      const NSx = NS.find(s => s.sec === sec);
      const its = visibleItems(sec), v = its.map(i => state.items[i.id]);
      const sum = its.length ? (v.filter(x => x === 'ok').length + ' OK  ·  ' + v.filter(x => x === 'notok').length + ' NOT OK  ·  ' + v.filter(x => x === 'na').length + ' N/A  ·  ' + v.filter(x => !x).length + ' open') : '';
      doc.setFillColor.apply(doc, C.navy); doc.rect(M, y, CW, 17, 'F');
      font('bold', 9, [255,255,255]); doc.text(wrap((NSx ? NSx.num + '   ' + NSx.title : cleanTitle(sec.title)) + (cont ? '  (continued)' : ''), CW - 170)[0], M + 6, y + 12);
      font('normal', 7.5, [201,216,225]); doc.text(sum, M + CW - 6, y + 12, { align:'right' });
      y += 20;
    }
    function pill(text, col, x, yy){
      doc.setFillColor.apply(doc, col); doc.roundedRect(x, yy - 8.5, 44, 12, 6, 6, 'F');
      font('bold', 7, [255,255,255]); doc.text(text, x + 22, yy, { align:'center' });
    }
    let running = 0;
    eq.sections.forEach(sec => {
      const its = visibleItems(sec);
      const hasRead = sec.readings && sec.readings.length;
      if (sec.title.indexOf('Coupling — ') === 0 && !its.length) return;
      if (!its.length && !hasRead && !state.comments[sec.id] && !(state.photos[sec.id] || []).length) return;
      need(50); secBar(sec, false);
      its.forEach(it => {
        running++;
        const v = state.items[it.id];
        const label = it.detailed ? ((it.component ? it.component + ' — ' : '') + it.checkpoint) : it.label;
        doc.setFontSize(8.6); const L = wrap(label, CW - 80);
        doc.setFontSize(7.2); const A = it.detailed && (it.acceptance || it.freq) ? wrap((it.freq ? '[' + it.freq + ']  ' : '') + (it.acceptance ? 'Acceptance: ' + it.acceptance : ''), CW - 80) : [];
        const notes = [];
        if (it.detailed && state.findings[it.id]) notes.push('Finding: ' + state.findings[it.id]);
        if (it.detailed && state.corrective[it.id]) notes.push('Action: ' + state.corrective[it.id]);
        doc.setFontSize(7.8); const N = notes.length ? wrap(notes.join('   '), CW - 80) : [];
        const rh = L.length * 10.5 + A.length * 8.8 + N.length * 9.5 + 7;
        if (need(rh)) secBar(sec, true);
        if (v === 'notok'){ doc.setFillColor.apply(doc, C.nokbg); doc.rect(M, y, CW, rh, 'F'); }
        let yy = y + 10;
        font('bold', 7.5, C.soft); doc.text(REF[it.id] || String(running), M + 4, yy);
        font('normal', 8.6, C.ink); doc.text(L, M + 30, yy); yy += L.length * 10.5;
        if (A.length){ font('normal', 7.2, C.soft); doc.text(A, M + 30, yy - 2); yy += A.length * 8.8; }
        if (N.length){ font('bold', 7.8, C.nok); doc.text(N, M + 30, yy - 1); }
        const s = v === 'ok' ? ['OK', C.ok] : v === 'notok' ? ['NOT OK', C.nok] : v === 'na' ? ['N/A', C.na] : ['—', [200,206,211]];
        pill(s[0], s[1], M + CW - 48, y + 10);
        doc.setDrawColor.apply(doc, C.line); doc.setLineWidth(0.5); doc.line(M, y + rh, M + CW, y + rh);
        y += rh;
      });

      if (hasRead){
        const plain = sec.readings.filter(r => r.unit !== 'mm'), thick = sec.readings.filter(r => r.unit === 'mm');
        if (plain.length){
          const isRating = plain.every(r => r.unit === 'rating');
          const cols = 3, cw = CW / cols, rows = Math.ceil(plain.length / cols);
          const boxH = 14 + rows * 13 + 4;
          if (need(boxH)) secBar(sec, true);
          doc.setFillColor.apply(doc, C.light); doc.rect(M, y + 2, CW, boxH, 'F');
          font('bold', 7.5, [154,97,19]); doc.text(pdfTxt((isRating ? 'Condition rating' : 'Readings') + (sec.readingNote ? '  ·  ' + (isRating ? sec.readingNote.replace(/^Rating key\s*—\s*/,'') : readingNoteText(sec.readingNote)) : '')).slice(0, 150), M + 6, y + 12);
          plain.forEach((r, i) => {
            const x = M + 6 + (i % cols) * cw, yy = y + 26 + Math.floor(i / cols) * 13;
            const raw = state.readings[r.id];
            let val = (raw === undefined || raw === '') ? '—' : String(raw);
            if (r.unit === 'rating' && RATING_WORD[parseInt(val, 10)]) val = val + ' — ' + RATING_WORD[parseInt(val, 10)];
            else if (val !== '—' && r.unit !== 'rating') val = val + ' ' + r.unit;
            font('normal', 7.8, C.soft); const lab = wrap(r.label + ':', cw * 0.58)[0];
            doc.text(lab, x, yy);
            font('bold', 8, C.ink); doc.text(pdfTxt(val), x + cw * 0.6, yy);
          });
          y += boxH + 6;
        }
        thick.forEach(r => {
          const e = (state.readings[r.id] && typeof state.readings[r.id] === 'object') ? state.readings[r.id] : {};
          const res = computeRUL(e, h.f_date);
          const line = r.label + ':  current ' + (e.current || '—') + ' mm  ·  previous ' + (e.previous || '—') + ' mm (' + (e.previousDate || '—') + ')  ·  t-min ' + (e.minAllowable || '—') + ' mm  —  ' + (res ? (res.error || res.text) : 'no thickness data');
          doc.setFontSize(7.8); const Lx = wrap(line, CW - 12);
          if (need(Lx.length * 10 + 4)) secBar(sec, true);
          font('normal', 7.8, C.ink); doc.text(Lx, M + 6, y + 9); y += Lx.length * 10 + 3;
        });
      }

      const comment = state.comments[sec.id];
      if (comment){
        doc.setFontSize(8); const Lc = wrap('Comments: ' + comment, CW - 12);
        if (need(Lc.length * 10 + 6)) secBar(sec, true);
        font('italic', 8, C.ink); doc.text(Lc, M + 6, y + 10); y += Lc.length * 10 + 6;
      }
      const photos = state.photos[sec.id] || [];
      if (photos.length){
        const s = 86, g = 8; let x = M;
        need(s + 10);
        photos.forEach(src => {
          if (x + s > M + CW){ x = M; y += s + g; need(s + 10); }
          try { doc.addImage(src, 'JPEG', x, y + 4, s, s); } catch(e){}
          x += s + g;
        });
        y += s + 12;
      }
      y += 8;
    });

    // ---------- Sign-off ----------
    if (y + 120 > BOTTOM) newPage();
    y += 6; font('bold', 12, C.ink); doc.text('Sign-off', M, y); y += 8;
    const bw = (CW - 12) / 2;
    [['Inspected by', h.f_checkby], ['Reviewed by', h.f_reviewby]].forEach((r, i) => {
      const x = M + i * (bw + 12);
      doc.setDrawColor.apply(doc, C.line); doc.setLineWidth(0.8); doc.rect(x, y, bw, 82);
      font('normal', 7.5, C.soft); doc.text(r[0], x + 8, y + 13);
      font('bold', 10, C.ink); doc.text(pdfTxt(r[1] || ''), x + 8, y + 28);
      font('normal', 7.5, C.soft); doc.text('Signature', x + 8, y + 64); doc.text('Date', x + bw * 0.62, y + 64);
      doc.setDrawColor(160,170,178); doc.line(x + 8, y + 56, x + bw * 0.55, y + 56); doc.line(x + bw * 0.62, y + 56, x + bw - 8, y + 56);
      if (i === 0 && h.f_date){ font('normal', 9, C.ink); doc.text(pdfTxt(h.f_date), x + bw * 0.62, y + 52); }
    });
    y += 94;
    font('normal', 7.5, C.soft);
    doc.text(wrap('Acceptance criteria are taken from the referenced codes and OEM manuals. Items not checked are shown as "—". This report was generated from CM Inspect; drafts are stored on the inspector\u2019s device. \u00A9 Lotus Africa \u2014 internal use only, not for distribution.', CW), M, y);

    // ---------- Footer on every page ----------
    const n = doc.getNumberOfPages(), stamp = new Date().toLocaleString();
    for (let i = 1; i <= n; i++){
      doc.setPage(i);
      if (i > 1){
        font('bold', 8, C.ink); doc.text(wrap(eq.title, CW * 0.6)[0], M, 26);
        font('normal', 7.5, C.soft); doc.text(pdfTxt((h.f_tag ? 'Tag ' + h.f_tag : '') + (h.f_wo ? '   ·   WO ' + h.f_wo : '') + (h.f_date ? '   ·   ' + h.f_date : '')), W - M, 26, { align:'right' });
        doc.setDrawColor.apply(doc, C.amber); doc.setLineWidth(1.2); doc.line(M, 32, W - M, 32);
      }
      doc.setDrawColor.apply(doc, C.line); doc.setLineWidth(0.6); doc.line(M, H - 32, W - M, H - 32);
      font('bold', 7.2, C.ink); doc.text(pdfTxt(DOC.no + '  Rev ' + DOC.rev), M, H - 21);
      font('normal', 7.2, C.soft); doc.text(pdfTxt('  ·  ' + eq.title).slice(0, 80), M + doc.getTextWidth(pdfTxt(DOC.no + '  Rev ' + DOC.rev)) + 1, H - 21);
      font('bold', 7.2, C.ink); doc.text('Page ' + i + ' of ' + n, W - M, H - 21, { align:'right' });
      font('normal', 6.5, [138,151,161]); doc.text(pdfTxt('Uncontrolled when printed  ·  © Lotus Africa — internal use only  ·  Generated ' + stamp + '  ·  CM Inspect v' + APP_VERSION), W / 2, H - 11, { align:'center' });
    }
    return doc;
  }

  document.getElementById('btnPdf').addEventListener('click', async () => {
    if (!currentEquipment) return;
    const hh = state.header || {}, missing = [];
    if (!hh.f_tag) missing.push('equipment tag'); if (!hh.f_checkby) missing.push('inspected by'); if (!hh.f_date) missing.push('date');
    const warn = [];
    if (missing.length) warn.push('Missing: ' + missing.join(', ') + ' — the report will not be traceable.');
    const g = currentEquipment.healthScoreApplicable === false ? goNoGo(currentEquipment) : null;
    if (g && g.decision !== 'GO'){
      const decl = numberedSections(currentEquipment).flatMap(s => s.items).find(x => /^Critical items/.test(x.it.component || ''));
      if (decl && state.items[decl.it.id] === 'ok') warn.push('Item ' + decl.ref + ' declares all critical items OK, but the result is ' + g.decision + ' (' + (g.nok.length ? 'NOT OK: ' + g.nok.join(', ') : 'not recorded: ' + g.open.join(', ')) + ').');
    }
    if (warn.length && !confirm(warn.join('\n\n') + '\n\nDownload the PDF anyway?')) return;
    const btn = document.getElementById('btnPdf');
    btn.disabled = true; btn.textContent = 'Building PDF…';
    try{
      const doc = generatePdfDoc();
      const tag = (state.header.f_tag || currentEquipment.id).replace(/[^a-z0-9\-]/gi,'_');
      const date = state.header.f_date || new Date().toISOString().slice(0,10);
      const wo = (state.header.f_wo || '').replace(/[^a-z0-9\-]/gi,'_');
      doc.save(`${wo ? wo + '_' : ''}${tag}_${currentEquipment.id}_${date}.pdf`);
      showToast('PDF downloaded');
    } catch(err){
      showToast('PDF export failed — try again');
      console.error(err);
    } finally {
      btn.disabled = false; btn.textContent = 'Download PDF';
    }
  });


  /* ---------------- Browser print (Ctrl+P / Print button) ---------------- */
  function preparePrint(){
    if (!currentEquipment) return;
    const h = state.header || {};
    const allVisible = currentEquipment.sections.reduce((a, s) => a.concat(visibleItems(s)), []);
    const v = allVisible.map(i => state.items[i.id]);
    const ok = v.filter(x => x === 'ok').length, nok = v.filter(x => x === 'notok').length, na = v.filter(x => x === 'na').length;
    const health = computeHealthScore(currentEquipment, state);
    document.getElementById('printSignoff').innerHTML = `
      <h3>Inspection result &amp; sign-off</h3>
      <table>
        <tr><th>Checks recorded</th><th>OK</th><th>NOT OK</th><th>N/A</th><th>Health score</th></tr>
        <tr><td>${ok + nok + na} of ${allVisible.length}</td><td>${ok}</td><td>${nok}</td><td>${na}</td><td>${health ? health.score + '% — ' + esc(health.label) : '—'}</td></tr>
      </table>
      <table style="margin-top:8px">
        <tr><th style="width:22%">Role</th><th style="width:30%">Name</th><th>Signature</th><th style="width:18%">Date</th></tr>
        <tr><td>Inspected by</td><td>${esc(h.f_checkby || '')}</td><td class="sig"></td><td>${esc(h.f_date || '')}</td></tr>
        <tr><td>Reviewed by</td><td>${esc(h.f_reviewby || '')}</td><td class="sig"></td><td></td></tr>
      </table>
      <div class="print-foot"><b>${esc(docOf(currentEquipment).no)} Rev ${esc(docOf(currentEquipment).rev)}</b> · Uncontrolled when printed · © Lotus Africa — internal use only. Every NOT OK item must be raised as a work request in Pronto. Printed ${new Date().toLocaleString()} · CM Inspect · ${esc(currentEquipment.title)}${h.f_tag ? ' · Tag ' + esc(h.f_tag) : ''}${h.f_wo ? ' · WO ' + esc(h.f_wo) : ''}</div>`;
  }
  window.addEventListener('beforeprint', preparePrint);
  document.getElementById('btnPrint').addEventListener('click', () => { preparePrint(); window.print(); });

  /* ---------------- Init ---------------- */
  renderHub();

  /* ---------------- Deep links from Pronto ----------------
     ?c=<checklist id>&tag=<asset no>&wo=<work order no>[&by=<inspector>]
     Opens the checklist directly with the header pre-filled. Used by the
     link / QR code printed on Pronto work orders. */
  /* Pronto PM task number → checklist (generated from the PM task export; edit with the link-load workbook) */
  // PM_TASK_CHECKLIST is loaded from data/pm-task-map.js
  (function deepLink(){
    let p; try { p = new URLSearchParams(window.location.search); } catch(e){ return; }
    // Short Pronto form: ?pm=<PM task number>&t=<plant item>&w=<work order>
    const pm = (p.get('pm') || '').trim();
    let id = p.get('c') || p.get('checklist');
    if (!id && pm){
      id = PM_TASK_CHECKLIST[pm];
      if (!id){ showToast('PM task ' + pm + ' has no CM Inspect checklist yet — choose it from the list'); return; }
    }
    if (!id) return;
    const eq = EQUIPMENT.find(e => e.id === id);
    if (!eq){ showToast('Checklist "' + id + '" not found — choose it from the list'); return; }
    const tag = (p.get('tag') || p.get('t') || '').trim(), wo = (p.get('wo') || p.get('w') || '').trim(), by = (p.get('by') || '').trim();
    const d = readDraft(eq);
    if (d && wo && d.header && d.header.f_wo && d.header.f_wo !== wo){
      const fresh = confirm('This device has an unfinished draft of this checklist for WO ' + d.header.f_wo +
        '.\n\nOK = start a NEW inspection for WO ' + wo + ' (the old draft is discarded — download its PDF first if needed).\nCancel = open the old draft for WO ' + d.header.f_wo + '.');
      if (fresh){ try { window.localStorage.removeItem(draftKey(eq)); } catch(e){} }
      else { currentCategory = null; openEquipment(eq); return; }
    }
    currentCategory = null;
    openEquipment(eq);
    const setField = (fid, val) => {
      if (!val) return;
      const el = document.getElementById(fid);
      if (el.value && el.value === val) return;
      el.value = val; el.dispatchEvent(new Event('input', { bubbles:true })); el.dispatchEvent(new Event('change', { bubbles:true }));
    };
    setField('f_tag', tag); setField('f_wo', wo); setField('f_checkby', by);
    if (tag || wo) showToast('Opened from work order' + (wo ? ' ' + wo : ''));
  })();

