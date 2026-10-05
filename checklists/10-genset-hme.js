/* CM Inspect — checklists/10-genset-hme.js
   Gen set (turbo fire-risk, standby), heavy mobile equipment fleet, shared route helpers.
   Loaded as a classic script; shares global scope with the other files
   (load order is defined in index.html). © Lotus Africa — internal use only. */
'use strict';
  /* =====================================================================
     GEN SET · MOBILE CRUSHER · HEAVY MOBILE EQUIPMENT
     Added as three new top-level categories. Every point uses the same
     detailed format as the rotating-equipment library (component /
     checkpoint / acceptance / frequency + Findings & Corrective Action).
     Frequency codes: Shift = pre-start / every shift · D daily · W weekly ·
     M monthly · 250h/500h/1000h/2000h = service-meter-hour PM interval ·
     6M six-monthly · A annual · Each insp. = every inspection.
     ===================================================================== */

  const RATING_KEY_TXT = 'Rating key — 1 Good · 2 Fair · 3 Poor · 4 Critical · 5 Unsafe';

  // Section builder: numbers sections ("Section N — ...") and checkpoints
  // continuously, generates stable ids from prefix + section key + row index.
  function cmBuilder(prefix, opts){
    opts = opts || {};
    let n = 0, s = 1;               // Section 1 is always the safety section
    const T = (t) => opts.plain ? t : 'Section '+s+' — '+t;
    return {
      thick(key, title, labels, note){
        s++;
        return { id: prefix+'_'+key, title: T(title), items: [],
          readingNote: note || 'Record UT thickness at each condition monitoring location (CML); enter previous reading, date and minimum allowable thickness (t-min) to calculate corrosion rate and remaining life',
          readings: labels.map((l, i) => ({ id: prefix+'_'+key+'_cml'+(i+1), label: l, unit: 'mm' })) };
      },
      sec(key, title, rows, extra){
        s++;
        const items = rows.map((r, i) => checklistPoint(prefix+'_'+key+'_'+(i+1), String(++n), r[0], r[1], r[2] || '', r[3] || ''));
        const out = { id: prefix+'_'+key, title: T(title), items };
        if (extra){
          if (extra.readingNote) out.readingNote = extra.readingNote;
          if (extra.readings) out.readings = extra.readings.map((rd, i) => ({ id: prefix+'_'+key+'_rd'+(i+1), label: rd[0], unit: rd[1] }));
        }
        return out;
      },
      rating(labels){
        s++;
        return { id: prefix+'_rating', title: T('Condition Assessment Summary'), readingNote: RATING_KEY_TXT, items: [],
          readings: labels.map((l, i) => ({ id: prefix+'_rating_'+(i+1), label: l, unit: 'rating' })) };
      }
    };
  }

  function plainSafety(prefix, title, lines){
    return { id: prefix+'_safety1', title: title, items: lines.map((l, i) => ({ id: prefix+'_saf_'+(i+1), label: l })) };
  }

  const RELEASE_ROWS = [
    ['Critical defects','All safety-critical defects rectified, or asset tagged Out of Service and reported','No unresolved critical defect in service','Each insp.'],
    ['Work requests','Every NOT OK item raised as a work request in the CMMS (Pronto) with priority','WR/WO numbers recorded in findings','Each insp.'],
    ['Oil samples','Oil samples labelled (asset, compartment, SMU, oil hours) and dispatched','Dispatched with chain of custody','Each insp.'],
    ['Reinstatement','Tools removed, guards and covers refitted, isolations removed by their owners','Complete','Each insp.'],
    ['Handover','Supervisor / operator briefed on asset status, restrictions and follow-up actions','Briefed and recorded','Each insp.']
  ];

  /* ------------------------------------------------------------------ */
  /*                               GEN SET                               */
  /* ------------------------------------------------------------------ */

  function gensetSafety(prefix){
    return plainSafety(prefix, 'Section 1 — Pre-Inspection Safety, Isolation & Access', [
      'Conduct JSA / Take 5; obtain permit to work from the power plant control room',
      'Hearing protection worn in engine hall (noise typically > 85 dB(A)); hard hat, glasses, gloves, safety boots',
      'Identify hot surfaces (exhaust, turbocharger, HFO lines) — no contact; use IR camera / contact thermometer only',
      'For any work beyond running observation: engine stopped, start air isolated and vented, turning gear engaged, LOTO applied',
      'Do not open crankcase doors until the OEM cooling period has elapsed after stop (crankcase explosion risk)',
      'Generator breaker open, racked out and earthed before any alternator terminal-box access (electrical permit)',
      'Confirm fire detection/suppression in engine hall is healthy; know the location of the nearest extinguisher and E-stop',
      'Keep clear of rotating flywheel, turning gear, couplings and alternator fan openings',
      'Use fixed walkways/platforms; fall protection above 1.8 m; check housekeeping (oil on floor, slip hazards)'
    ]);
  }

  function gensetTurboFire(){
    const p = 'gtf', b = cmBuilder(p);
    return { id:'genset-turbo-exhaust-fire', title:'Gen Set Turbocharger & Exhaust Fire-Risk Inspection',
      dept:'Gen Set — SOLAS II-2/4.2.2.6 surface-temperature principle (220°C) / NFPA 37 / ISO 8528 / OEM',
      category:'genset', tagPlaceholder:'e.g. GEN-01 TC', defaultVisual:true, defaultVibration:false,
      sections:[
        gensetSafety(p),
        b.sec('ign','Ignition Sources — Hot Surfaces', [
          ['Insulation coverage','All exhaust and turbine surfaces above 220°C insulated/shielded — no exposed gaps','100% coverage, no gaps','W'],
          ['Insulation condition','Blankets/cladding torn, loose, missing pins/straps, or saturated with oil/fuel','Intact, dry, secured','W'],
          ['IR survey','IR scan of turbine casing, gas inlet, manifold, bellows and cladding surface','Hot spots recorded; none > 220°C on accessible surfaces','W'],
          ['Visible glow','Night/low-light visual check for red-hot surfaces on TC or manifold','No glow','D'],
          ['Exhaust leaks','Gas leaks at TC inlet flange, bellows and manifold joints (soot tracks)','No leaks','D']
        ], { readingNote:'record hottest point per zone', readings:[['TC turbine casing (max)','°C'],['TC gas inlet duct (max)','°C'],['Exhaust manifold (max)','°C'],['Bellows / expansion joint (max)','°C'],['Insulation surface (max)','°C']] }),
        b.sec('fuel','Fuel Sources — Oil & Fuel Leaks Near Hot Zone', [
          ['TC lube oil lines','TC oil supply/drain pipes, fittings, O-rings — no weeps','Dry','D'],
          ['Fuel lines near hot zone','HP fuel, leak-off and trace-heated HFO lines near manifold/TC — screens/spray shields fitted','Shields fitted, dry','W'],
          ['Spray shields / tape','Anti-spray tape or shields on flanges and fittings within reach of hot surfaces','Fitted, undamaged','M'],
          ['Drainage','Oil collection trays/gutters under TC drain freely','Clear, empty','W']
        ]),
        b.sec('tc','Turbocharger Mechanical Condition', [
          ['Bearing condition','Noise / vibration trend; rotor play at overhaul','Stable trend; play within OEM','M'],
          ['Speed vs. load','TC speed and charge-air pressure vs. load curve','Within ±5% of baseline','D'],
          ['Turbine & compressor efficiency','Exhaust TC inlet/outlet ΔT and charge pressure trend (fouling indicator)','Within baseline','W'],
          ['Washing records','Turbine and compressor wash records','Per OEM','M'],
          ['Casing cracks','Turbine/gas outlet casing cracks (visual / DPI at shutdown)','No cracks','A']
        ]),
        b.sec('det','Detection & Suppression Around the Engine', [
          ['Fire detectors','Flame/heat detectors above engines healthy and not obstructed','Healthy','M'],
          ['Suppression system','Fixed suppression/water mist status and isolation valves','In service, valves open','W'],
          ['Extinguishers & hoses','Extinguishers (CO2/foam) at engine; fire hose reach','Charged, tagged','M'],
          ['Emergency fuel shut-off','Remote fuel quick-closing valves and engine E-stop access','Accessible, tested','6M']
        ]),
        b.sec('rel','Release, Reporting & Sign-off', RELEASE_ROWS),
        b.rating(['Hot-Surface Protection','Oil/Fuel Containment','Turbocharger Mechanical','Detection & Suppression','Overall Fire Risk'])
      ]};
  }

  function gensetStandby(){
    const p = 'gsb', b = cmBuilder(p);
    return { id:'genset-standby-diesel', title:'Standby / Emergency Diesel Gen Set',
      dept:'Gen Set — ISO 8528 / NFPA 110 / IEC 60034 / OEM',
      category:'genset', tagPlaceholder:'e.g. EDG-01', defaultVisual:true, defaultVibration:false,
      sections:[
        gensetSafety(p),
        b.sec('doc','Documentation & Readiness', [
          ['Control mode','Controller in AUTO; ATS in auto; no alarms on panel','Ready for auto start','W'],
          ['Test records','Weekly no-load and monthly on-load test records','Up to date','W'],
          ['Service history','Running hours vs. service interval / annual service','Within schedule','M']
        ], { readingNote:'record at time of inspection', readings:[['Running hours','h'],['Fuel tank level','%']] }),
        b.sec('enc','Enclosure, Base Frame & Day Tank', [
          ['Canopy / enclosure','Doors, locks, acoustic lining, ventilation louvres clear','Secure, louvres unobstructed','W'],
          ['Base frame & mounts','Anti-vibration mounts, base frame, holding-down bolts','No cracks, tight','M'],
          ['Base / day tank','Tank leaks, bund, water drain, level gauge, vent','No leaks; water drained','W'],
          ['Housekeeping','No combustibles stored in enclosure; drip tray clean','Clean','W']
        ]),
        b.sec('eng','Engine, Lubrication & Cooling', [
          ['Engine oil','Level and condition','Between marks','W'],
          ['Coolant','Radiator/expansion level; antifreeze/inhibitor concentration','At level; concentration in range','W'],
          ['Jacket water heater','Pre-heater working (block warm in standby)','Operating','W'],
          ['Belts & hoses','Fan/alternator belts, coolant and fuel hoses','No cracks, correct tension','M'],
          ['Radiator','Core clean, fan guard, no leaks','Clean, no leaks','M'],
          ['Leaks','Oil, fuel, coolant leaks','None','W']
        ]),
        b.sec('air','Air Intake & Exhaust', [
          ['Air filter','Restriction indicator','Below limit','M'],
          ['Exhaust','Silencer, flex, rain cap, lagging; no leaks','Secure, lagged','M'],
          ['Turbocharger','Oil leaks, noise','None','M']
        ]),
        b.sec('bat','Starting Batteries & Charger', [
          ['Batteries','Terminals, electrolyte, hold-downs, case','Clean, tight, no swelling','W'],
          ['Battery charger','Charger healthy, float voltage','Within float range','W'],
          ['Starter','Cranking performance on test','Starts within 10 s','W']
        ], { readingNote:'typ. 26.4–27.6 V float on 24 V system', readings:[['Battery voltage','V'],['Charger current','A']] }),
        b.sec('alt','Alternator, Control Panel & ATS', [
          ['Alternator','Air inlet/outlet clear, terminal box, bearing noise','Clean, no noise','M'],
          ['Control panel','Controller display, alarms, meters','No faults','W'],
          ['ATS','Transfer switch operation on mains-fail test','Transfers within design time','M'],
          ['Breaker & cabling','Output breaker, cable terminations (IR scan on load)','No hot spots','6M']
        ]),
        b.sec('test','Test Run & Protection Functions', [
          ['Start & run-up','Start on test; voltage & frequency build-up','Stable within 10 s','W'],
          ['Load test','On-load test (≥ 30% rated, or load bank annually)','Carries load, no derate','M'],
          ['Protection shutdowns','Low oil pressure, high coolant temp, overspeed, E-stop','Shut down at set point','6M']
        ], { readingNote:'rated values / OEM', readings:[['Voltage L-L','V'],['Frequency','Hz'],['Load','kW'],['Oil pressure','bar'],['Coolant temp','°C']] }),
        b.sec('rel','Release, Reporting & Sign-off', RELEASE_ROWS),
        b.rating(['Engine & Cooling','Fuel System','Batteries & Starting','Alternator & Controls','Overall Readiness'])
      ]};
  }

  /* ------------------------------------------------------------------ */
  /*                     HEAVY MOBILE EQUIPMENT BLOCKS                    */
  /* ------------------------------------------------------------------ */

  function hmeSafety(prefix, o){
    const lines = [
      'Conduct JSA / Take 5; review machine-specific hazards (pinch points, articulation, stored energy, hot surfaces)',
      'Park on firm level ground clear of edges, overhead power lines and traffic; set up exclusion zone and signage',
      'Lower all implements (blade, bucket, body, boom) to ground, or mechanically prop with OEM safety pins/props',
      'Apply park brake; chock wheels both sides (wheeled) — fit articulation steering lock on articulated machines',
      'Isolate at battery / master isolator, apply personal lock & Danger tag (LOTO); verify zero energy by test-start',
      'Relieve residual hydraulic, accumulator, air and spring pressure per OEM; confirm gauges at zero',
      'Allow engine, turbo, exhaust, brakes and hydraulic oil to cool; never open a hot pressurised radiator',
      'Use three points of contact on access systems; fall protection above 1.8 m (truck decks, shovels, masts)',
      'PPE: hard hat, safety glasses, gloves, safety boots, hi-vis, hearing protection',
      'Notify supervisor / dispatch by radio that the machine is under inspection; tag in fleet management system',
      'Tyre zone: never stand in the rim / lock-ring trajectory; deflate before any rim work'
    ];
    if (o.underground) lines.push('Underground: check ventilation and gas monitor, ground conditions / scaling, and refuge chamber location');
    if (o.extraSafety) o.extraSafety.forEach(l => lines.push(l));
    return plainSafety(prefix, 'Section 1 — Pre-Inspection Safety, Isolation & Access', lines);
  }

  const HME = {
    docs(b, o){
      const rd = [['SMU / hour meter','h']];
      if (o.wheeled) rd.push(['Odometer','km']);
      if (o.engine !== false) rd.push(['Fuel level','%']);
      return b.sec('doc','Machine Identification, Documentation & History', [
        ['Asset identity','Fleet number, serial number and model match the asset register and CMMS (Pronto)','Matches, ID plate legible','Each insp.'],
        ['Operator pre-start','Pre-start checklists for current/previous shifts completed; defects reported','Completed each shift, defects logged','Shift'],
        ['Open defects & backlog','Outstanding work orders, deferred defects and backlog reviewed','No overdue safety-critical defect','W'],
        ['PM history','Last PM (type / SMU) and next PM due','Within schedule (≤ 10% overrun)','250h'],
        ['Oil analysis history','Latest oil analysis for all compartments reviewed; alerts actioned','No unactioned abnormal/critical result','250h'],
        ['Component life','Major component hours vs. planned change-out (engine, transmission, final drives, etc.)','Within life or replacement planned','M'],
        ['Modifications','Modifications approved through MOC with OEM / engineering sign-off','Approved MOC on file','A'],
        ['Compliance tags','ROPS/FOPS plate, fire suppression and extinguisher tags, lifting/pressure certificates current','All current','M'],
        ['Manuals & decals','Operator manual in cab; safety decals, load charts and warnings legible (ISO 9244)','Present and legible','M']
      ], { readingNote:'record at time of inspection', readings: rd });
    },
    walk(b){
      return b.sec('walk','General Walk-around, Leaks & Housekeeping', [
        ['Fluid leaks','Ground under machine and all compartments — oil, fuel, coolant leaks','No active leaks; weeps recorded','Shift'],
        ['Combustible build-up','Engine bay, belly pans, turbo/exhaust area free of dust, coal, grass and oil','No combustible build-up','Shift'],
        ['Guards & covers','Guards, belly guards, engine doors and panels fitted and latched','Fitted, secure','W'],
        ['Access system','Steps, ladders, handrails, walkways, platforms; non-slip surfaces (ISO 2867)','No damage, secure, clean','Shift'],
        ['Glass & mirrors','Windows, mirrors and camera lenses clean and undamaged','No cracks in operator sight line','Shift'],
        ['Lighting','Head, work, tail, brake, indicator lights and beacon/strobe','All operational','Shift'],
        ['General damage','Impact damage, missing fasteners, loose components','None','W']
      ]);
    },
    structure(b, o){
      const rows = [
        ['Main frame','Inspect for cracks at high-stress areas — '+(o.frameAreas || 'frame rails, cross members, mounting brackets'),'No cracks; any crack measured, marked and reported','250h'],
        ['Weld repairs','Previous weld repairs re-checked for re-cracking; repairs documented','No re-cracking','250h'],
        ['Mounting bolts','Engine, transmission, cab, counterweight and guard mounting bolts','No loose / missing bolts','500h'],
        ['Pins & bosses','Structural pins, bosses, retainers and keepers — play and wear','Within OEM wear limit; keepers fitted','250h'],
        ['Isolation mounts','Engine / cab / radiator rubber mounts','No cracking or separation','500h'],
        ['Corrosion','Corrosion and coating breakdown on structural members','Superficial only','A']
      ];
      if (o.articulated) rows.push(['Articulation hitch','Upper/lower hitch pins, bearings, retention; steering lock stowed in run position','No play beyond OEM limit','250h']);
      return b.sec('str','Structural Frame, Chassis & Welds', rows);
    },
    cab(b, o){
      const rows = [
        ['ROPS / FOPS structure','Cracks, deformation, corrosion, unauthorised drilling or welding (ISO 3471 / ISO 3449)','No damage or modification; certification plate fitted','M'],
        ['ROPS mounting','ROPS mounting bolts and isolators','Torqued to spec, no looseness','500h'],
        ['Seat & seat belt','Webbing, buckle, retractor, anchorage; belt interlock where fitted (ISO 6683)','No fraying; latches and retracts','Shift'],
        ['Seat suspension','Operator seat adjustment and suspension; trainer seat & belt','Functional, locks in position','M'],
        ['Door & emergency exit','Door latches, hinges, gas struts; emergency exit / glass hammer','Opens from inside and outside','W'],
        ['Wipers & washers','Blades, motors, washer fluid','Clear sweep, reservoir filled','Shift'],
        ['HVAC & pressurisation','Air-conditioning, cab pressurisation, fresh/recirculation filters','Positive pressure, filters clean','250h'],
        ['Controls','Joysticks/levers return to neutral; hydraulic lockout disables implements','Positive return, lockout effective','Shift'],
        ['Instruments & alarms','Gauges, warning lights, monitoring display; no active warnings','All functional','Shift'],
        ['Emergency shutdown','Engine emergency stop switch(es) — cab and ground level','Engine stops','W'],
        ['Cab equipment','Fire extinguisher, two-way radio, first-aid kit','Present and serviceable','Shift'],
        ['Noise & vibration','Door/window seals and sound insulation intact; no abnormal vibration at seat','Intact','A']
      ];
      if (o.canopy) rows[0] = ['ROPS / FOPS canopy','Canopy / cab structure for rock-fall damage, cracks and modification (ISO 3449 Level II)','No damage; certification plate fitted','Shift'];
      return b.sec('cab','Cab, ROPS / FOPS & Operator Controls', rows);
    },
    fire(b){
      return b.sec('fire','Fire Suppression & Fire Risk Controls', [
        ['Fire suppression system','System armed; cylinder pressure gauge in operating range','Gauge in green, armed','Shift'],
        ['Actuators','Manual actuators in cab and at ground level accessible, pins/seals intact','Accessible, sealed','W'],
        ['Nozzles & piping','Nozzles capped and aimed at risk zones (turbo, manifold, pumps); piping clipped','Caps intact, aimed, secured','M'],
        ['Detection','Linear/thermal detection over hot zones; control module healthy','No damage, no faults','M'],
        ['Service record','Suppression system service tag current (6-monthly, AS 5062 risk-based)','Within date','M'],
        ['Extinguishers','Portable extinguishers charged, pin and seal intact, tagged, bracket secure','Charged, tagged','Shift'],
        ['Hot-surface protection','Turbo / exhaust heat shields and lagging intact, not oil- or fuel-soaked','Intact, dry','W'],
        ['Hose & harness routing','Fuel/oil hoses and wiring clear of hot surfaces; fire sleeve fitted near turbo/exhaust','Clearance maintained','M'],
        ['Fire shutdown interlock','Suppression discharge shuts down engine / fuel (where fitted) — tested at service','Function verified','6M']
      ]);
    },
    warning(b){
      return b.sec('warn','Warning, Visibility & Collision Avoidance Devices', [
        ['Horn','Horn audible above ambient','Audible','Shift'],
        ['Travel / reverse alarm','Reverse or travel alarm (ISO 9533)','Audible when travelling/reversing','Shift'],
        ['Cameras & mirrors','Reverse/side cameras and monitor; mirror adjustment (ISO 5006)','Clear image, blind spots covered','Shift'],
        ['Proximity detection','Collision avoidance / proximity detection system self-test (ISO 16001 / ISO 21815)','No faults','Shift'],
        ['Flag / buggy whip','Flag with light where required (large machines interacting with LVs)','Fitted, light working','Shift'],
        ['Fatigue monitoring','Operator fatigue / distraction system (if fitted)','No faults','W'],
        ['Telemetry & speed limiter','Fleet management unit, speed limiter, data reporting','Reporting, no faults','W']
      ]);
    },
    engine(b){
      return b.sec('eng','Engine (Diesel Power Unit)', [
        ['Engine oil','Level and condition; no fuel or coolant dilution','Between marks, normal appearance','Shift'],
        ['Coolant level','Expansion tank level (engine cold)','At level mark','Shift'],
        ['Leaks','Oil, fuel and coolant leaks from gaskets, seals, lines','No active leaks','Shift'],
        ['Drive belts','Fan / alternator / A-C belts — tension, cracks, glazing; tensioner','Correct tension, no cracks','250h'],
        ['Engine mounts','Mounts and brackets','No cracks or separation','500h'],
        ['Turbocharger','Oil and exhaust leaks, abnormal noise; shaft play at service','No leaks; play within OEM','250h'],
        ['Exhaust smoke','Smoke colour at start and under load','No excessive black / blue / white smoke','W'],
        ['Crankcase blow-by','Blow-by at breather / crankcase pressure','Within OEM','500h'],
        ['Noise','Knocking, valve-train noise, misfire','Smooth running','W'],
        ['ECM fault codes','Active and logged engine codes downloaded and reviewed','No active codes; logged codes actioned','250h'],
        ['Oil sample','Engine oil sample from live sampling valve','Taken and trended','250h']
      ], { readingNote:'per OEM specification', readings:[['Low idle speed','rpm'],['High idle speed','rpm'],['Oil pressure @ low idle','kPa'],['Oil pressure @ high idle','kPa'],['Coolant temp','°C'],['Boost pressure','kPa']] });
    },
    cooling(b){
      return b.sec('cool','Cooling System', [
        ['Radiator core','Core blockage (dust/mud), fin damage, leaks','Clean, no leaks','W'],
        ['Coolant condition','Glycol concentration and inhibitor/SCA level','Within OEM range','250h'],
        ['Hoses & clamps','Coolant hoses cracks, swelling, clamps','No cracks, clamps tight','250h'],
        ['Fan & shroud','Fan blades, shroud, fan guard; hydraulic fan drive leaks','No damage, no leaks','W'],
        ['Aftercooler','Air-to-air aftercooler core clean, ducting sealed','Clean, sealed','250h'],
        ['Oil coolers','Transmission / hydraulic / brake oil cooler cores','Clean, no leaks','250h'],
        ['Pressure cap','Radiator pressure cap seal (test at PM)','Holds rated pressure','1000h']
      ], { readingNote:'per OEM coolant specification', readings:[['Glycol concentration','%'],['Freeze / boil protection','°C']] });
    },
    airfuel(b){
      return b.sec('afx','Air Intake, Fuel & Exhaust / Aftertreatment', [
        ['Pre-cleaner','Pre-cleaner / dust ejector valve clear','Clear','Shift'],
        ['Air filter restriction','Restriction indicator / ECM inlet restriction','Below service limit','Shift'],
        ['Intake ducting','Ducts, hoses and clamps from filter to turbo — no dust ingress path','Sealed, clamps tight','250h'],
        ['Fuel water separator','Drain water separator, inspect bowl','No water / contamination','Shift'],
        ['Fuel tank & breather','Tank mounts, cap seal, breather / desiccant filter','Secure, breather within life','250h'],
        ['Fuel lines','Chafing, clamps, leaks','No chafing or leaks','250h'],
        ['Fuel cleanliness','Fuel sample particle count and water (tank and bulk)','ISO 4406 per OEM (e.g. 18/16/13), no free water','M'],
        ['Exhaust system','Manifold, pipes, flex joints, clamps — soot tracks','No leaks, secure','W'],
        ['Aftertreatment','DPF / DOC / SCR condition and DEF level (where fitted)','No warnings, DEF filled','Shift']
      ]);
    },
    electrical(b){
      return b.sec('elec','Electrical, Batteries & Monitoring System', [
        ['Batteries','Hold-downs, terminals, case swelling/leaks, covers','Secure, clean, no damage','W'],
        ['Battery isolator','Master isolator isolates all circuits and is lockable','Isolates, lockable','W'],
        ['Charging system','Alternator charging voltage','Within OEM range (e.g. 27.5–28.5 V on 24 V)','250h'],
        ['Starting','Cranking speed; no prolonged cranking','Normal start','Shift'],
        ['Wiring harness','Chafing, heat damage, loose connectors; routed clear of hot or moving parts','Secure, protected','250h'],
        ['Fuses & relays','Panel condition, correct ratings, no bypasses','Correct, no bypass','500h'],
        ['Health monitoring','Machine monitoring system data download (e.g. VIMS / VHMS / KOMTRAX) and event review','Downloaded, events actioned','250h'],
        ['Earthing','Earth straps and chassis earth points','Secure, no corrosion','500h']
      ], { readingNote:'24 V system typical', readings:[['Battery voltage (engine off)','V'],['Charging voltage','V']] });
    },
    powertrain(b, o){
      const rows = [];
      if (o.drive === 'hydrostatic'){
        rows.push(['Hydrostatic drive','Drive pumps/motors — case-drain leaks, charge pressure, smooth travel','No leaks; charge pressure in range','500h']);
      } else if (o.drive === 'electric'){
        rows.push(['Electric drive system','Traction alternator, wheel motors, retarding grid box, blower motor — connections and cooling','No faults; blower and grids clear','500h']);
      } else {
        rows.push(['Transmission oil','Level and condition','At level, no burnt smell or debris','W']);
        rows.push(['Shift quality','Engagement in all gears forward and reverse; no slip or harsh shifts','Smooth, no slip','W']);
        rows.push(['Torque converter','Stall test and converter outlet temperature','Within OEM stall speed and temperature','1000h']);
        rows.push(['Filters & screens','Filter bypass indicators; magnetic screens at service','No bypass; no abnormal debris','500h']);
      }
      if (o.tracked){
        rows.push(['Steering system (tracked)','Steering clutches / differential steer response both directions; no drift','Correct response, tracks straight','W']);
      } else {
        rows.push(['Drive shafts & U-joints','U-joints, slip yokes, bolts and guards','No play, guards fitted','250h']);
        rows.push(['Differentials & axles','Oil level, leaks, breathers, abnormal noise','At level, no leaks','500h']);
        rows.push(['Wheel hubs & bearings','Hub temperature after operation; bearing play','No overheating, no play','500h']);
      }
      rows.push(['Final drives','Oil level, leaks, magnetic plug debris, duo-cone seal weep','No metal flakes, no seal leak','250h']);
      rows.push(['Powertrain oil samples','Transmission, differential and final drive samples','Taken and trended','500h']);
      const rd = [['Transmission oil temp','°C']];
      if (!o.drive || o.drive === 'mech') rd.push(['Torque converter outlet temp','°C'], ['Stall speed','rpm']);
      return b.sec('ptn','Powertrain — Transmission, Axles & Final Drives', rows, { readingNote:'per OEM specification', readings: rd });
    },
    brakes(b, o){
      if (o.tracked){
        return b.sec('brk','Brakes', [
          ['Service brake','Service brake holds against stall / on grade (ISO 10265)','Holds','W'],
          ['Park brake','Applies with lever / lockout and holds machine','Holds','Shift'],
          ['Brake oil','Brake / steering oil temperature and condition','Normal','W'],
          ['Brake warning','Brake low-pressure / applied warning indicators','Functional','W']
        ]);
      }
      const rows = [
        ['Service brakes','Brake test — stops straight with good pedal feel','Stops effectively, no pull','Shift'],
        ['Park brake','Static holding test per OEM / site procedure (ISO 3450)','Holds without creep','Shift'],
        ['Secondary / emergency brake','Secondary brake application test','Applies and holds','W'],
        ['Retarder / engine brake','Retarder or engine brake operation (where fitted)','Effective','W'],
        ['Brake wear','Wear indicator pin / wet-disc wear measurement','Within OEM limit','500h'],
        ['Brake cooling oil','Wet-brake cooling oil level, temperature and condition','Normal temperature, clean','W'],
        ['Accumulators & warning','Brake accumulator pre-charge; low-pressure warning activates','Pre-charge per OEM, alarm functional','1000h'],
        ['Brake lines','Brake hoses and pipes — leaks, chafing','No leaks','250h']
      ];
      if (o.underground) rows.push(['SAHR brakes','Spring-applied hydraulic-release brakes apply on engine stop / pressure loss','Apply automatically','Shift']);
      return b.sec('brk','Brakes & Retarder', rows);
    },
    steering(b){
      return b.sec('steer','Steering', [
        ['Steering response','Full lock left and right; free play; response delay','Smooth and responsive','Shift'],
        ['Secondary steering','Emergency / secondary steering test (ISO 5010)','Steers with primary supply lost','M'],
        ['Steering cylinders','Rods, seals, pins and mounting','No leaks, no play','250h'],
        ['Linkage / kingpins','Tie rods, ball joints, kingpins (non-articulated)','No play','250h'],
        ['Steering stops','Stops intact; no frame-to-frame contact','Intact','500h']
      ]);
    },
    hydraulic(b){
      return b.sec('hyd','Hydraulic System, Hoses & Cylinders', [
        ['Oil level','Sight-glass level with implements in service position','Within marks','Shift'],
        ['Oil condition','Colour, aeration/foaming, water','Clear, no foam or milkiness','W'],
        ['Oil temperature','Operating temperature','Within OEM range (typ. < 85°C)','W'],
        ['Filters & breather','Filter bypass/restriction indicators; tank breather / desiccant','No bypass','250h'],
        ['Hoses','Abrasion, cracking, bulging, leaks, kinks, twist, ferrule movement, age (MDG 41)','No damage; within service life','W'],
        ['Hose routing & clamps','Clamps fitted, no rubbing; burst sleeving near operator and hot zones','Secured and protected','250h'],
        ['Cylinders','Rod chrome scoring / pitting, rod-seal leaks, drift test','No scoring; drift within OEM','250h'],
        ['Pumps & valves','Main pump and valve bank leaks, cavitation noise, case drain','No leaks or cavitation','500h'],
        ['Accumulators','Pilot / ride-control accumulators pre-charge and mounting','Per OEM','1000h'],
        ['Contamination','Hydraulic oil sample — particle count and water','ISO 4406 per OEM (e.g. 18/16/13)','500h']
      ], { readingNote:'per OEM specification', readings:[['Hydraulic oil temp','°C'],['Main relief pressure','bar']] });
    },
    tyres(b, o){
      const rd = o.tyrePos.map(t => [t+' pressure','kPa']).concat(o.tyrePos.map(t => [t+' tread remaining','%']));
      return b.sec('tyre','Tyres, Rims & Wheels', [
        ['Inflation pressure','Cold inflation pressure each tyre (nitrogen where specified)','Within ±5% of tyre specification','W'],
        ['Tread & casing','Cuts, cuts to ply, bulges, separations, tread depth','No exposed cords; wear within limit','Shift'],
        ['Sidewalls & duals','Sidewall cuts and impact damage; rocks between duals','No damage, no rock entrapment','Shift'],
        ['Rims & lock rings','Rim, flange, bead seat band, lock ring — cracks, seating, corrosion','Correctly seated, no cracks','W'],
        ['Wheel nuts','Nuts tight, nut indicators aligned; re-torque after wheel change','No loose or missing nuts','Shift'],
        ['Valve stems','Valve caps fitted, extensions secured','Fitted','W'],
        ['Heat / overload','Tyre temperature after shift, TKPH vs. haul profile, heat separation signs','No overheating','M'],
        ['Tyre records','Serials and hours current in tyre management system','Current','M']
      ], { readingNote:'record cold pressures; tread as % of new', readings: rd });
    },
    undercarriage(b){
      return b.sec('uc','Undercarriage (Tracks)', [
        ['Track links & pitch','Link height wear and pitch extension (UC measurement)','Plan replacement at 70–80% worn','500h'],
        ['Pins & bushings','Bushing wear, cracked/turned bushings, loose pins','Within limit','500h'],
        ['Track shoes','Grouser height, cracks, bent shoes, loose shoe bolts','No loose bolts; grouser within limit','250h'],
        ['Track rollers','Leaks, flat spots, tread and flange wear','No leaking or seized rollers','250h'],
        ['Carrier rollers','Rotation, leaks, wear','Rotate freely, no leaks','250h'],
        ['Idlers','Tread / flange wear, leaks, guides','Within limit','500h'],
        ['Sprockets','Tooth wear (hooking), segment bolts','Within limit; bolts tight','250h'],
        ['Track tension','Sag measurement; recoil spring and adjuster leaks','Sag within OEM','W'],
        ['Track frame & guards','Track frame cracks, roller and guiding guards','No cracks, guards fitted','500h'],
        ['Packing','Material packed in undercarriage cleaned out','Clean','Shift']
      ], { readingNote:'OEM undercarriage handbook', readings:[['Track sag LH','cm'],['Track sag RH','cm'],['Link wear LH','% worn'],['Link wear RH','% worn'],['Sprocket wear','% worn']] });
    },
    underground(b){
      return b.sec('ug','Underground Requirements', [
        ['Exhaust emissions','Undiluted exhaust CO / NOx test per site diesel emissions program','Within site / statutory limits','M'],
        ['DPF / exhaust conditioner','Diesel particulate filter or scrubber condition','No warnings, regenerated','250h'],
        ['Gas detector','Machine-mounted gas detector calibrated and bump-tested','Calibrated, alarms working','W'],
        ['Tele-remote / automation','Remote / automation system: E-stop and loss-of-comms stop verified (ISO 15817)','Stops safely','Shift'],
        ['Personnel tracking tag','Vehicle tag / tracking and tag-board system','Functional','W'],
        ['High-intensity lights','Headlights and work lights for underground visibility','Functional, aimed','Shift']
      ], { readingNote:'site diesel emissions limits', readings:[['CO (undiluted)','ppm'],['NOx (undiluted)','ppm']] });
    },
    lube(b){
      return b.sec('lub','Lubrication & Greasing', [
        ['Auto-lube reservoir','Reservoir level, refill coupler clean and capped','Above minimum','Shift'],
        ['Auto-lube pump & controller','Pump cycles, no fault alarms, timer settings','Cycles per setting','W'],
        ['Distribution & injectors','Lines intact, injectors delivering — fresh grease visible at pins','All points greased','W'],
        ['Manual grease points','Manual points greased (drive shaft, fan, hitch, etc.)','Greased per schedule','Shift'],
        ['Breathers','Compartment breathers clean / desiccant colour','Clean, within life','250h']
      ]);
    },
    operation(b, o){
      const rd = [['Final drive LH','°C'],['Final drive RH','°C'],['Transmission case','°C'],['Hydraulic pump','°C']];
      if (!o.tracked) rd.push(['Wheel hub / brake LH','°C'],['Wheel hub / brake RH','°C']);
      return b.sec('op','Operational Function Test & Condition Monitoring', [
        ['Start-up','Start without excessive cranking; warning lights extinguish','Normal start','Each insp.'],
        ['Implement functions','All implement functions through full stroke; no drift or jerking','Smooth, no drift','W'],
        ['Travel','Forward / reverse through all ranges; tracking straight','Normal','W'],
        ['Noise & vibration','Abnormal noise or vibration in powertrain and implements','None','W'],
        ['Thermal scan','IR thermography after operation: final drives, hubs/brakes, transmission, pumps; compare LH vs RH','ΔT between sides < 15°C; no hot spots','M'],
        ['Post-test leaks','Re-check for leaks after function test','No leaks','Each insp.']
      ], { readingNote:'compare LH vs RH and against previous scan', readings: rd });
    },
    release(b){ return b.sec('rel','Release to Service, Reporting & Sign-off', RELEASE_ROWS); }
  };

  /* Composer — builds a full HME checklist from shared blocks + specific
     sections. o.specific(b) returns the equipment-specific sections; they
     are placed after the hydraulics/tyres blocks. */
  function hme(cfg){
    const p = cfg.prefix, b = cmBuilder(p), o = cfg;
    const s = [hmeSafety(p, o)];
    s.push(HME.docs(b, o), HME.walk(b), HME.structure(b, o), HME.cab(b, o), HME.fire(b), HME.warning(b));
    if (o.engine !== false) s.push(HME.engine(b), HME.cooling(b), HME.airfuel(b));
    s.push(HME.electrical(b));
    if (o.powertrain !== false) s.push(HME.powertrain(b, o));
    if (o.brakes !== false) s.push(HME.brakes(b, o));
    if (o.wheeled) s.push(HME.steering(b));
    if (o.hydraulics !== false) s.push(HME.hydraulic(b));
    if (o.wheeled && o.tyrePos) s.push(HME.tyres(b, o));
    if (o.tracked) s.push(HME.undercarriage(b));
    if (o.specific) o.specific(b).forEach(x => s.push(x));
    if (o.underground) s.push(HME.underground(b));
    s.push(HME.lube(b), HME.operation(b, o), HME.release(b));
    const base = [];
    if (o.engine !== false) base.push('Engine, Cooling & Fuel');
    if (o.powertrain !== false) base.push('Powertrain & Final Drives');
    base.push(o.wheeled ? 'Brakes & Steering' : 'Brakes');
    if (o.hydraulics !== false) base.push('Hydraulic System');
    base.push('Structure & Frame');
    if (o.wheeled) base.push('Tyres & Rims');
    if (o.tracked) base.push('Undercarriage');
    base.push('Cab, ROPS/FOPS & Safety Devices','Fire Protection');
    (o.ratings || []).forEach(r => base.push(r));
    base.push('Overall Machine Condition');
    s.push(b.rating(base));
    return { id: cfg.id, title: cfg.title,
      dept: 'Heavy Mobile Equipment — ' + (cfg.std || 'ISO 20474 / ISO 3471 / ISO 3449 / ISO 3450 / ISO 5010 / ISO 6683 / ISO 9533 / AS 5062 / MDG 15 / MDG 41'),
      category: 'hme', tagPlaceholder: cfg.tag, defaultVisual: true, defaultVibration: false, sections: s };
  }

  // Reusable specific-section row sets
  const GET_ROWS = [
    ['Ground engaging tools (GET)','Teeth / tips, adapters, locking pins — wear and missing parts','None missing; replaced at wear limit','Shift'],
    ['Lip, shrouds & wear plates','Lip shrouds, side cutters, wear plates, heel shrouds','No wear-through','W'],
    ['Bucket structure','Cracks in shell, side plates, hinge bosses','No cracks','250h']
  ];
  const COUPLER_ROW = ['Quick coupler','Locking mechanism, safety pin / secondary lock and alarm (ISO 13031)','Locks positively; secondary lock engaged','Shift'];
  const BODY_ROWS = [
    ['Dump body','Floor and side liners wear; cracks in canopy, ribs and pivot area','No cracks; liners within limit','W'],
    ['Body pads','Body pads present and worn evenly','All present','W'],
    ['Body pivot pins','Pins, bushings and retainers','No play','500h'],
    ['Hoist cylinders','Leaks, rods, mounts','No leaks','250h'],
    ['Body-up safety','Body safety pin / cable for raised-body work; body-up alarm / interlock','Present and functional','Shift']
  ];

  function hmeFleet(){
    return [
      hme({ id:'hme-track-dozer', title:'Track-Type Dozer', prefix:'tdz', tag:'e.g. DZ-01', tracked:true,
        frameAreas:'main case, track roller frames, equalizer bar saddle, ripper mounting, push-arm trunnions',
        ratings:['Blade & Ripper'],
        specific: b => [
          b.sec('blade','Blade, Cutting Edge Wear & Push Arms', [
            ['Cutting edges & end bits','Wear, cracks, bolts','Within wear limit; bolts tight','Shift'],
            ['Moldboard','Cracks, wear-through, wear plates','No cracks','250h'],
            ['Push arms / C-frame','Cracks; trunnion and ball-joint play','No cracks, no play','250h'],
            ['Tilt / pitch braces','Braces, pins, tilt cylinder','No play','250h'],
            ['Lift & tilt cylinders','Leaks, rod damage, mountings','No leaks or scoring','250h'],
            ['Blade drift','Blade holds raised position (drift test)','Within OEM drift','500h']
          ]),
          b.sec('rip','Ripper & Ripper Tip Wear', [
            ['Tips & shank protectors','Wear and retention pins','Tip replaced before shank wear','Shift'],
            ['Shank','Cracks, wear, shank pin','No cracks','250h'],
            ['Ripper frame & linkage','Cracks, pins, bushings','No play','250h'],
            ['Ripper cylinders','Leaks, rods','No leaks','250h'],
            ['Pin puller','Pin puller operation','Functional','W']
          ]),
          b.sec('piv','Pivot Shaft, Equalizer Bar Bearings & Guards', [
            ['Equalizer bar','Centre pin, end pins/bushings, cracks','No play, no cracks','250h'],
            ['Pivot shaft','Pivot shaft seals and oil level','No leaks','500h'],
            ['Belly & rock guards','Crankcase and transmission guards, hinges','Secure','W']
          ])
        ]}),

      hme({ id:'hme-wheel-dozer', title:'Wheel Dozer', prefix:'wdz', tag:'e.g. WD-01', wheeled:true, articulated:true,
        frameAreas:'front/rear frames, articulation hitch, blade push-arm mounts',
        tyrePos:['LF','RF','LR','RR'], ratings:['Blade'],
        specific: b => [ b.sec('blade','Blade, Cutting Edge Wear & Push Arms', [
          ['Cutting edges & end bits','Wear, cracks, bolts','Within wear limit','Shift'],
          ['Moldboard','Cracks, wear-through','No cracks','250h'],
          ['Push arms & trunnions','Cracks, pin play','No cracks, no play','250h'],
          ['Lift & tilt cylinders','Leaks, rods','No leaks','250h']
        ]) ]}),

      hme({ id:'hme-excavator', title:'Hydraulic Excavator / Mining Shovel', prefix:'hex', tag:'e.g. EX-01', tracked:true, powertrain:false,
        frameAreas:'upper frame, boom foot mounting, car body, track frames, counterweight brackets',
        ratings:['Boom, Stick & Bucket','Swing System'],
        specific: b => [
          b.sec('front','Boom, Stick & Linkage', [
            ['Boom','Cracks at boom foot, cylinder bosses, boom nose; weld seams','No cracks','250h'],
            ['Stick (arm)','Cracks at stick nose and cylinder bosses','No cracks','250h'],
            ['Linkage pins & bushings','Boom foot, boom-stick, stick-bucket, H-link and dogbone pins — play','Within limit; keepers fitted','250h'],
            ['Implement cylinders','Boom, stick, bucket cylinders — leaks, rods, drift','No leaks; drift within OEM','250h']
          ]),
          b.sec('bkt','Bucket & Ground Engaging Tool Wear', GET_ROWS.concat([COUPLER_ROW])),
          b.sec('swing','Swing Bearing, Travel & Counterweight', [
            ['Slew ring bearing','Bolts (none loose/cracked), seal, rocking-test play','Play within OEM; bolts intact','500h'],
            ['Swing drives & gearbox','Oil level, leaks, noise','No leaks','250h'],
            ['Swing park brake','Swing brake holds upper structure','Holds','W'],
            ['Swing motors','Leaks, case drain','No leaks','500h'],
            ['Centre (rotary) joint','Leaks at swivel','No leaks','500h'],
            ['Travel motors & final drives','Oil level, leaks, noise','No leaks','250h'],
            ['Counterweight','Mounting bolts, cracks','Secure','500h'],
            ['Lifting duty','Hose-burst / load-holding valves and overload warning when used for lifting; SWL marked','Fitted and functional','M']
          ])
        ]}),

      hme({ id:'hme-rope-shovel', title:'Electric Rope Shovel', prefix:'ers', tag:'e.g. SH-01', tracked:true, engine:false, powertrain:false, brakes:false,
        std:'ISO 20474 / ISO 4309 / IEC 60204 / AS/NZS 4871 / AS 5062 / MDG 15',
        frameAreas:'revolving frame, car body, boom foot, gantry and A-frame connections',
        extraSafety:['HV isolation: trailing cable de-energised at substation with HV permit; earth applied and tested before any electrical access'],
        ratings:['HV Power & Motors','Hoist & Crowd','Dipper','Boom & Swing'],
        specific: b => [
          b.sec('hv','Trailing Cable, HV Power & Motors', [
            ['Trailing cable','Jacket damage, splices, coupler locking; cable not run over','No damage; couplers locked','Shift'],
            ['Collector rings & HV cabinet','Collector rings/brushes; HV doors interlocked','Interlocks functional, no tracking','M'],
            ['Earth / ground fault','Ground-fault and earth continuity test','Pass','M'],
            ['Motors','Hoist, crowd, swing, propel motors — temperature, vibration, brushes/commutator (DC)','Within limits','M'],
            ['Drive cabinets','Cooling fans, filters, fault log','No faults; filters clean','M']
          ], { readingNote:'ISO 20816 / site baseline', readings:[['Hoist motor vibration','mm/s'],['Crowd motor vibration','mm/s'],['Swing motor vibration','mm/s']] }),
          b.sec('hoist','Hoist, Crowd & Brakes', [
            ['Hoist ropes','Broken wires, diameter reduction, corrosion, kinks (ISO 4309)','Within discard criteria','W'],
            ['Hoist drum & sheaves','Drum grooves, rope spooling, boom-point sheaves','No damage','M'],
            ['Crowd system','Crowd ropes or rack & pinion, shipper shaft, saddle blocks','Within wear limit','W'],
            ['Gear cases','Hoist / crowd / swing / propel gearcase oil level, temperature, samples','No leaks; samples trended','250h'],
            ['Brakes','Hoist, crowd, swing, propel brake hold test and lining wear','Hold; within wear','W']
          ]),
          b.sec('dip','Dipper & Tooth Wear', [
            ['Teeth & adapters','Wear and missing teeth','None missing','Shift'],
            ['Door & latch','Door latch, trip mechanism, snubbers','Latches and trips correctly','Shift'],
            ['Dipper structure','Cracks in lip, walls, wear packages','No cracks','W']
          ]),
          b.sec('boom','Boom, Gantry, Swing & Propel', [
            ['Boom','Cracks; suspension ropes / pendants; boom foot pins','No cracks; pendants OK','W'],
            ['Gantry / A-frame','Cracks and pins','No cracks','M'],
            ['Swing system','Swing rack, roller circle, centre pin','Within wear','M'],
            ['Propel','Crawler shoes, tumblers, propel gearcases','Within wear','W']
          ])
        ]}),

      hme({ id:'hme-wheel-loader', title:'Wheel Loader', prefix:'wld', tag:'e.g. WL-01', wheeled:true, articulated:true,
        frameAreas:'front frame loader tower, lift-arm mounts, articulation hitch, rear axle trunnion',
        tyrePos:['LF','RF','LR','RR'], ratings:['Bucket & Loader Linkage'],
        specific: b => [
          b.sec('bkt','Bucket & Ground Engaging Tool Wear', GET_ROWS.concat([COUPLER_ROW])),
          b.sec('link','Loader Linkage, Pins & Cylinders', [
            ['Lift arms','Cracks at lift arms and cross tube','No cracks','250h'],
            ['Z-bar / tilt linkage','Bellcrank, tilt link, pins and bushings — play','Within limit','250h'],
            ['Lift & tilt cylinders','Leaks, rods, mounts','No leaks','250h'],
            ['Ride control','Ride control function and accumulator','Functional','500h'],
            ['Kickouts','Lift kickout and return-to-dig settings','Functional','M'],
            ['Rear axle oscillation','Oscillation trunnion bearings and pins','No play','500h'],
            ['Counterweight','Bolts and mounting','Secure','500h']
          ])
        ]}),

      hme({ id:'hme-rigid-haul-truck', title:'Rigid Dump / Haul Truck', prefix:'rht', tag:'e.g. DT-01', wheeled:true,
        frameAreas:'frame rails at hoist cylinder and body pivot mounts, front cross member, rear axle mounting',
        tyrePos:['LF','RF','LRO','LRI','RRI','RRO'], ratings:['Body & Hoist','Suspension'],
        specific: b => [
          b.sec('body','Dump Body, Liners, Hoist Cylinders & Payload', BODY_ROWS.concat([
            ['Rock ejectors','Rock ejector bars between rear duals','Present, undamaged','Shift'],
            ['Payload system','Payload / TPMS calibration and display','Calibrated (± 5%)','M'],
            ['Electric drive (if fitted)','Traction alternator, wheel motors, grid box and blower','No faults','500h']
          ])),
          b.sec('susp','Suspension, Front Spindles & Rear Axle', [
            ['Suspension struts','Strut oil / nitrogen charge — ride heights','Within OEM charge height','W'],
            ['Strut leaks & seals','Leaks, rod damage, boots','No leaks','W'],
            ['A-frame & spindles','Front A-frame, spindles, kingpins','No cracks, no play','500h'],
            ['Rear axle housing','Cracks, mounting, panhard rod / links','No cracks','500h']
          ], { readingNote:'OEM strut charge height', readings:[['Strut height LF','cm'],['Strut height RF','cm'],['Strut height LR','cm'],['Strut height RR','cm']] })
        ]}),

      hme({ id:'hme-adt', title:'Articulated Dump Truck (ADT)', prefix:'adt', tag:'e.g. ADT-01', wheeled:true, articulated:true,
        frameAreas:'front frame, articulation / oscillation hitch, bogie mounts, body pivot',
        tyrePos:['LF','RF','L-mid','R-mid','LR','RR'], ratings:['Body & Hoist','Hitch & Bogie'],
        specific: b => [
          b.sec('body','Dump Body, Liners & Hoist Cylinders', BODY_ROWS.concat([['Tailgate / ejector','Tailgate linkage or ejector plate','Functional','W']])),
          b.sec('hitch','Articulation Hitch Bearing, Bogie & Diff Locks', [
            ['Oscillation hitch','Hitch bearing play, oscillation ring, retaining bolts','No play','250h'],
            ['Bogie / tandem','Bogie beam pivots, rear axle links','No play','500h'],
            ['Diff locks','Inter-axle and cross-axle diff locks engage and release','Functional','W'],
            ['Front suspension','Struts / levelling','Level, no leaks','W']
          ])
        ]}),

      hme({ id:'hme-motor-grader', title:'Motor Grader', prefix:'mgr', tag:'e.g. GR-01', wheeled:true, articulated:true,
        frameAreas:'front frame (gooseneck), drawbar mount, articulation, rear frame',
        tyrePos:['LF','RF','L-front tandem','L-rear tandem','R-front tandem','R-rear tandem'], ratings:['Moldboard, Circle & Drawbar'],
        specific: b => [ b.sec('mold','Moldboard, Circle & Drawbar Wear, Tandems', [
          ['Moldboard & cutting edges','Edge / end bit wear, bolts, moldboard cracks','Within limit','Shift'],
          ['Circle','Circle teeth, wear inserts/strips, pinion, circle drive','Within clearance','500h'],
          ['Drawbar & ball','Drawbar ball socket wear','No play','500h'],
          ['Saddle & sideshift','Saddle, link bar, sideshift cylinder and rails','No play','500h'],
          ['Blade lift cylinders','Leaks, ball joints','No leaks','250h'],
          ['Front axle & wheel lean','Wheel-lean bar, kingpins, spindles','No play','250h'],
          ['Tandem drives','Tandem oil level, chain tension / wear, leaks','At level, no leaks','500h'],
          ['Ripper / scarifier','Shanks, teeth, frame','Within wear','250h']
        ]) ]}),

      hme({ id:'hme-compactor', title:'Compactor / Vibratory Roller (Smooth Drum & Padfoot)', prefix:'cmp', tag:'e.g. CP-01', wheeled:true, articulated:true, drive:'hydrostatic',
        frameAreas:'drum yoke / frame, articulation hitch, rear frame',
        tyrePos:['LR','RR'], ratings:['Drum & Vibratory System'],
        specific: b => [ b.sec('drum','Drum Wear & Vibratory System', [
          ['Drum shell','Shell wear, cracks; padfoot pads / tips wear','Within limit','W'],
          ['Drum scrapers','Scraper blades set and worn evenly','Set and effective','Shift'],
          ['Drum isolation mounts','Rubber shock mounts — cracks, separation, missing','None cracked or missing','W'],
          ['Vibratory system','Eccentric housing oil, vibration motor, amplitude / frequency selector','Functional, oil at level','250h'],
          ['Drum drive','Drum drive motor / planetary leaks','No leaks','250h'],
          ['Vibration auto-off','Vibration stops when travel stops','Stops automatically','W'],
          ['Compaction meter','CMV / intelligent compaction system calibrated (where fitted)','Calibrated','M']
        ], { readingNote:'per OEM specification', readings:[['Vibration frequency','Hz'],['Amplitude setting','H/L']] }) ]}),

      hme({ id:'hme-scraper', title:'Wheel Tractor Scraper', prefix:'wts', tag:'e.g. SC-01', wheeled:true,
        frameAreas:'gooseneck, draft arms, bowl side plates, push block',
        tyrePos:['LF','RF','LR','RR'], ratings:['Bowl, Apron & Ejector'],
        specific: b => [ b.sec('bowl','Bowl, Cutting Edge Wear, Apron, Ejector & Hitch', [
          ['Bowl','Bowl floor and side wear, cracks','No cracks','W'],
          ['Cutting edge & router bits','Wear and bolts','Within limit','Shift'],
          ['Apron','Apron arms, cylinders, operation','Functional','250h'],
          ['Ejector','Ejector rollers / rails and cylinder','Smooth travel','250h'],
          ['Gooseneck & hitch','Cracks, hitch pins, cushion hitch','No cracks','250h'],
          ['Push block','Push block plate','Sound','W'],
          ['Elevator (if fitted)','Flights, chains, drive','Within wear','W']
        ]) ]}),

      hme({ id:'hme-water-truck', title:'Water Truck / Water Cart', prefix:'wtr', tag:'e.g. WC-01', wheeled:true,
        frameAreas:'frame rails at tank mounting, rear spring hangers, pump drive mounts',
        tyrePos:['LF','RF','LRO','LRI','RRI','RRO'], ratings:['Tank & Spray System'],
        specific: b => [ b.sec('tank','Water Tank, Pump & Spray System', [
          ['Water tank','Shell, baffles, mounts, leaks, corrosion','No leaks; mounts secure','W'],
          ['Tank-top access','Fill hatch, ladder, handrail / fall protection','Secure','W'],
          ['Water pump & drive','PTO / hydraulic pump drive, pump seal and bearings','No leaks or noise','250h'],
          ['Spray heads & valves','Spray heads, nozzles, valves and cab controls','All heads operate','Shift'],
          ['Water cannon','Monitor rotation and control','Functional','W'],
          ['Fire-fighting connection','Hose reel / fire-fighting connection (if fitted)','Functional','M'],
          ['Load stability','Slosh baffles intact; partial-load speed limits displayed','Intact','A']
        ]) ]}),

      hme({ id:'hme-fuel-lube-truck', title:'Fuel & Lube Service Truck', prefix:'flt', tag:'e.g. FT-01', wheeled:true,
        std:'ISO 20474 / AS 1940 / ADG Code / ISO 3450 / AS 5062 / MDG 15',
        frameAreas:'frame rails at tank / module mounts',
        tyrePos:['LF','RF','LRO','LRI','RRI','RRO'], ratings:['Fuel & Lube Module'],
        specific: b => [ b.sec('fuel','Fuel & Lube Dispensing Module & Leak Controls', [
          ['Fuel tank','Shell, mounts, baffles, leaks','No leaks','W'],
          ['Dangerous goods signage','Hazchem placards and labels','Correct and legible','M'],
          ['Emergency shut-off','Emergency stop / fuel shut-off valves','Functional','W'],
          ['Static bonding','Bonding / earthing reel and clamp continuity','Continuity confirmed','W'],
          ['Hose reels & nozzles','Hoses, reels, dry-break / fast-fill nozzles, swivels','No leaks or damage','Shift'],
          ['Meters','Fuel and lube meter calibration','Within tolerance','A'],
          ['Lube tanks & pumps','Oil, grease and coolant tanks, air pumps, filters','No leaks','W'],
          ['Waste oil tank','Level and vent','Not overfull','W'],
          ['Compressor & receiver','Compressor, receiver drain, safety valve, certificate','Drained; cert current','W'],
          ['Spill kit & extinguishers','Spill kit stocked; minimum two extinguishers','Present','Shift']
        ]) ]}),

      hme({ id:'hme-surface-drill', title:'Surface Drill Rig (Blasthole / DTH / Top Hammer)', prefix:'sdr', tag:'e.g. DR-01', tracked:true, powertrain:false,
        frameAreas:'main frame, mast pivot and raise-cylinder mounts, jack mounts',
        ratings:['Mast, Feed & Rotary Head','Compressor & Dust Collection'],
        specific: b => [
          b.sec('mast','Mast, Feed, Rotary Head Bearings & Drill String', [
            ['Mast structure','Cracks, welds, bent members','No cracks','W'],
            ['Mast pivot & raise cylinders','Pins, cylinders, mast lock pins','Locked, no leaks','W'],
            ['Feed system','Feed chains / cables / cylinder — tension and sheaves','Correct tension','Shift'],
            ['Rotary head','Leaks, gearbox oil, bearings, noise','No leaks','250h'],
            ['Drill pipe & bits','Thread condition, straightness, bit wear','Within limit','Shift'],
            ['Rod changer / carousel','Rod handling and breakout wrench','Functional','W'],
            ['Drill guide / centraliser','Bushing wear','Within limit','W'],
            ['Levelling jacks','Jacks, pads, holding valves','Hold, no drift','W'],
            ['Mast E-stops & guarding','Emergency stops at deck; rotating rod guarding / interlock','Functional','Shift']
          ]),
          b.sec('comp','Compressor & Dust Collection', [
            ['Compressor','Oil level, leaks, separator differential pressure','Within OEM','Shift'],
            ['Discharge temperature','Air-end discharge temperature','Within OEM (typ. < 110°C)','Shift'],
            ['Safety valve & receiver','Safety valve and pressure vessel certificate','Current','A'],
            ['Dust collector','Filters, pulse cleaning, suction hose, deck skirt','No visible dust emission','Shift'],
            ['Water injection','Dust suppression water injection','Functional','Shift']
          ], { readingNote:'per OEM specification', readings:[['Discharge temp','°C'],['Air pressure','bar'],['Rotation pressure','bar'],['Feed pressure','bar']] })
        ]}),

      hme({ id:'hme-ug-lhd', title:'Underground Loader (LHD)', prefix:'lhd', tag:'e.g. LHD-01', wheeled:true, articulated:true, underground:true, canopy:true,
        std:'ISO 20474 / ISO 3449 / ISO 3450 / ISO 15817 / AS 5062 / MDG 15 / MDG 41',
        frameAreas:'front frame loader tower, articulation hitch, rear frame and engine mounts',
        tyrePos:['LF','RF','LR','RR'], ratings:['Bucket & Boom','Underground Systems'],
        specific: b => [
          b.sec('bkt','Bucket & Ground Engaging Tool Wear', GET_ROWS),
          b.sec('boom','Boom & Implements', [
            ['Boom arms','Cracks at boom and cross tube','No cracks','250h'],
            ['Tilt linkage','Pins and bushings play','Within limit','250h'],
            ['Boom & tilt cylinders','Leaks, rods, mounts','No leaks','250h'],
            ['Bucket stops','Stops and dump-cushioning','Intact','250h']
          ])
        ]}),

      hme({ id:'hme-ug-truck', title:'Underground Haul Truck', prefix:'ugt', tag:'e.g. UT-01', wheeled:true, articulated:true, underground:true, canopy:true,
        std:'ISO 20474 / ISO 3449 / ISO 3450 / AS 5062 / MDG 15 / MDG 41',
        frameAreas:'front and rear frames, articulation hitch, body pivot and hoist mounts',
        tyrePos:['LF','RF','LR','RR'], ratings:['Body & Hoist','Underground Systems'],
        specific: b => [ b.sec('body','Dump Body, Liners & Hoist Cylinders', BODY_ROWS.concat([['Ejector / tailgate','Ejector or tailgate operation','Functional','W']])) ]}),

      hme({ id:'hme-ug-jumbo', title:'Underground Development Drill Jumbo', prefix:'jmb', tag:'e.g. JB-01', wheeled:true, articulated:true, underground:true, canopy:true,
        std:'ISO 20474 / ISO 3449 / ISO 11148 / IEC 60204-1 / MDG 15 / MDG 41',
        frameAreas:'boom mounting brackets, front frame, articulation hitch',
        tyrePos:['LF','RF','LR','RR'], ratings:['Booms, Feeds & Rock Drills','Electrical Power Pack'],
        extraSafety:['Electrical: trailing cable isolated at the DB / substation and locked before working on the power pack'],
        specific: b => [
          b.sec('boom','Booms, Feeds & Rock Drills', [
            ['Booms','Structure, extension, rotation, pins','No cracks or play','W'],
            ['Feeds','Feed beam, centralisers, hose guides, cradle wear','Within limit','W'],
            ['Rock drills','Accumulator pre-charge, shank adapter, side bolts, flushing seal','Per OEM; no leaks','Shift'],
            ['Drill steels & bits','Thread wear and bit grinding','Within limit','Shift'],
            ['Stabiliser jacks','Jacks and holding valves','Hold','W']
          ]),
          b.sec('pp','Electric Motor Power Pack, Cable Reel & Water System', [
            ['Electric motors','Main motor(s) — temperature, vibration, starter','Within limits','W'],
            ['Trailing cable & reel','Cable jacket, plug, reel tension and slip ring','No damage','Shift'],
            ['Earth leakage & insulation','Earth leakage protection test and cable insulation test','Pass','M'],
            ['Water booster pump','Pump, pressure, strainer','Pressure in range','W'],
            ['Air compressor','Compressor for flushing / lubrication','Functional','W']
          ], { readingNote:'IEC 60204-1 / site electrical standard', readings:[['Insulation resistance','MΩ'],['Water pressure','bar']] })
        ]}),

      hme({ id:'hme-explosives-charger', title:'Explosives Charger (Charge-up Unit / Emulsion Charger)', prefix:'chg', tag:'e.g. CH-01', wheeled:true, underground:true, canopy:true,
        std:'AS 2187.2 / ISO 16368 (MEWP) / ISO 20474 / AS 5062 / site explosives regulations',
        frameAreas:'chassis, boom pedestal, product module mounts',
        tyrePos:['LF','RF','LR','RR'], ratings:['Basket & Boom (MEWP)','Explosives Delivery System'],
        extraSafety:['Explosives: unit empty of product or in a designated parking area; no hot work, smoking or ignition sources near the unit',
                     'Only licensed / authorised shotfirer to handle product; detonators kept segregated'],
        specific: b => [
          b.sec('ewp','Charging Basket & Boom (MEWP)', [
            ['Basket / platform','Guardrails, toe boards, gate, floor','Intact','Shift'],
            ['Harness anchor points','Anchorage condition and rating','Rated, undamaged','Shift'],
            ['Platform controls','Controls, dead-man, E-stops at basket and ground','Functional','Shift'],
            ['Emergency lowering','Emergency descent / auxiliary lowering','Functional','W'],
            ['Overload & tilt alarm','SWL plate, overload cut-out and tilt alarm (ISO 16368)','Functional','W'],
            ['Boom structure & pins','Cracks, pins, wear pads, slew','No cracks or play','W'],
            ['Periodic MEWP inspection','Major / annual inspection certificate','Current','A']
          ]),
          b.sec('exp','Explosives Delivery System', [
            ['Emulsion pump','Pump condition; dry-run, high-temperature and high-pressure cut-outs tested','Cut-outs functional','Shift'],
            ['ANFO pot (pressure vessel)','Vessel, lid seal, relief valve, registration','Cert current; relief valve OK','M'],
            ['Loading hoses','Semi-conductive / antistatic hose — damage, kinks, resistance','Resistance within spec','W'],
            ['Static earthing','Machine earthing strap / chain and bonding','Continuity confirmed','Shift'],
            ['Product hoppers','Emulsion / ANFO hoppers clean, lids sealed, no contamination','Clean and sealed','Shift'],
            ['Detonator container','Lockable, lined and segregated detonator box','Locked and segregated','Shift'],
            ['Wash-down & spill kit','Wash-down water and product spill clean-up kit','Present','Shift'],
            ['Placards & beacon','Explosives placards, flag / beacon displayed','Displayed','Shift']
          ])
        ]}),

      hme({ id:'hme-rock-bolter', title:'Rock Bolter / Cable Bolter', prefix:'rbt', tag:'e.g. RB-01', wheeled:true, articulated:true, underground:true, canopy:true,
        std:'ISO 20474 / ISO 3449 / ISO 11148 / MDG 15 / MDG 41',
        frameAreas:'boom mounting, front frame, articulation hitch',
        tyrePos:['LF','RF','LR','RR'], ratings:['Bolting Rig'],
        specific: b => [ b.sec('bolt','Bolting Boom, Feed & Magazine', [
          ['Bolting boom','Structure, pins, extension','No cracks','W'],
          ['Feed & rock drill','Feed, rock drill, centralisers','Functional','Shift'],
          ['Bolt magazine / carousel','Indexing and clamps','Functional','Shift'],
          ['Resin / grout system','Resin injector or cement pump, hoses','Clean, no blockage','Shift'],
          ['Mesh handler','Arms and grippers','Functional','W'],
          ['Stabiliser jacks','Jacks and holding valves','Hold','W']
        ]) ]}),

      hme({ id:'hme-scaler-breaker', title:'Mechanical Scaler / Rock Breaker Carrier', prefix:'scl', tag:'e.g. SCL-01', wheeled:true, articulated:true, underground:true, canopy:true,
        frameAreas:'boom mounting, front frame, articulation hitch',
        tyrePos:['LF','RF','LR','RR'], ratings:['Boom & Hammer / Pick'],
        specific: b => [ b.sec('hammer','Scaling Boom, Hammer & Pick', [
          ['Boom','Structure and pins','No cracks','W'],
          ['Hydraulic hammer','Tool wear, bushings, retaining pins, through-bolts, nitrogen charge','Within limit','Shift'],
          ['Scaling pick','Pick tip wear and retention','Within limit','Shift'],
          ['Cab front guard','Front mesh / guard and FOPS','Intact','Shift'],
          ['Hammer hoses','Hoses and couplers','No leaks','Shift']
        ]) ]}),

      hme({ id:'hme-shotcrete', title:'Shotcrete Sprayer / Agitator Truck', prefix:'sht', tag:'e.g. SP-01', wheeled:true, articulated:true, underground:true, canopy:true,
        frameAreas:'pump and boom mounts, agitator drum supports, articulation hitch',
        tyrePos:['LF','RF','LR','RR'], ratings:['Pump, Boom & Agitator'],
        specific: b => [ b.sec('spray','Concrete Pump, Spray Boom & Agitator', [
          ['Concrete pump','Pistons, S-valve / swing tube, wear ring, cutting ring','Within wear','Shift'],
          ['Spray boom & nozzle','Boom, nozzle, hoses, rotation','Functional','Shift'],
          ['Accelerator dosing','Accelerator pump, tank, lines','Calibrated','W'],
          ['Agitator drum','Drum shell, rollers, drive motor, fins','No cracks','W'],
          ['Hopper grate interlock','Hopper grate and interlock','Interlock functional','Shift'],
          ['Wash-out system','Wash-out pump and water supply','Functional','Shift']
        ]) ]}),

      hme({ id:'hme-backhoe-loader', title:'Backhoe Loader (TLB)', prefix:'tlb', tag:'e.g. TLB-01', wheeled:true,
        frameAreas:'loader tower, backhoe swing frame mount, stabiliser mounts',
        tyrePos:['LF','RF','LR','RR'], ratings:['Loader & Backhoe'],
        specific: b => [ b.sec('bh','Loader & Backhoe Implements, Pins & Cylinders', [
          ['Loader arms & bucket','Cracks, pins, bucket edge','No cracks','250h'],
          ['Backhoe boom & dipper','Cracks, pins and bushings','No cracks or play','250h'],
          ['Swing frame & cylinders','Swing pins and cylinders','No play','250h'],
          ['Stabilisers','Legs, pads and holding valves','Hold, no drift','Shift'],
          ['Transport locks','Boom and swing transport locks','Engage','Shift'],
          COUPLER_ROW
        ]) ]}),

      hme({ id:'hme-mobile-crane', title:'Mobile Crane (Rough / All-Terrain)', prefix:'mcr', tag:'e.g. CR-01', wheeled:true,
        std:'ISO 9927-1 / ISO 4309 / AS 2550 / AS 1418.5 / ISO 20474',
        frameAreas:'carrier frame, outrigger boxes, slew ring mounting, boom foot',
        tyrePos:['LF','RF','LR','RR'], ratings:['Lifting System & Safety Devices','Wire Rope & Hook'],
        specific: b => [ b.sec('lift','Lifting System & Safety Devices', [
          ['Load moment indicator (RCI)','Function test; configuration matches duty; overload cut-out','Correct and functional','Shift'],
          ['Anti-two-block','Switch and weight','Cuts out hoist-up / telescope-out','Shift'],
          ['Wire rope','Broken wires, diameter reduction, kinks, birdcaging, corrosion (ISO 4309)','Within discard criteria','Shift'],
          ['Hook block','Throat opening, safety latch, swivel, sheaves','No deformation; latch works','Shift'],
          ['Sheaves & drum','Sheave grooves, bearings, drum spooling','Spooling correctly','W'],
          ['Boom','Telescopic sections, wear pads, cracks, pins','No cracks','W'],
          ['Outriggers & pads','Beams, jacks, holding valves, pads','Hold, no drift','Shift'],
          ['Slew ring & brake','Slew bearing bolts, slew brake','Secure, holds','W'],
          ['Hoist brake','Hoist brake holds rated load','Holds','W'],
          ['Load charts & SWL','Load chart in cab; SWL markings','Present','Shift'],
          ['Major inspection','Crane certificate / periodic major inspection','Current','A']
        ], { readingNote:'ISO 4309 discard criteria', readings:[['Rope diameter reduction','%'],['Broken wires (worst lay)','no.']] }) ]}),

      hme({ id:'hme-telehandler', title:'Telehandler', prefix:'tlh', tag:'e.g. TH-01', wheeled:true,
        std:'ISO 10896 / ISO 20474 / ISO 3471 / AS 1418.19',
        frameAreas:'chassis, boom pivot, stabiliser mounts',
        tyrePos:['LF','RF','LR','RR'], ratings:['Boom & Attachments'],
        specific: b => [ b.sec('boom','Boom, Attachments & Stability', [
          ['Boom','Sections, wear pads, cracks','No cracks','W'],
          ['Forks / attachment','Fork cracks, heel wear, locking pins','No cracks; heel wear < 10%','Shift'],
          ['Carriage & coupler','Attachment locking','Locked','Shift'],
          ['Load moment indicator','LMI function test','Alarm and cut-out function','Shift'],
          ['Stabilisers','Stabilisers and holding valves','Hold','Shift'],
          ['Frame levelling','Levelling and tilt indicator','Functional','W'],
          ['Extension chains / cylinders','Chain wear, cylinder leaks','Within limit','M']
        ]) ]}),

      hme({ id:'hme-forklift', title:'Heavy Forklift', prefix:'flk', tag:'e.g. FL-01', wheeled:true,
        std:'ISO 3691-1 / ISO 5057 / AS 2359 / ISO 6055',
        frameAreas:'chassis, mast mounts, counterweight',
        tyrePos:['LF','RF','LR','RR'], ratings:['Mast, Forks & Chains'],
        specific: b => [ b.sec('mast','Mast, Forks & Lift Chain Wear', [
          ['Forks','Heel cracks, heel thickness wear, blade straightness, locking pins (ISO 5057)','No cracks; heel wear < 10%','Shift'],
          ['Mast','Channels, rollers, wear','No cracks','W'],
          ['Lift chains','Elongation, cracks, lubrication, anchor pins','Elongation < 3%','M'],
          ['Carriage & backrest','Load backrest and carriage','Secure','W'],
          ['Overhead guard','Guard structure','No damage','Shift'],
          ['Lift & tilt cylinders','Leaks and drift','No drift','W'],
          ['Capacity plate','Data plate matches attachment','Fitted, correct','Shift']
        ], { readingNote:'ISO 5057 / chain gauge', readings:[['Fork heel wear','%'],['Chain elongation','%']] }) ]}),

      hme({ id:'hme-tyre-handler', title:'Tyre Handler', prefix:'tyh', tag:'e.g. TYH-01', wheeled:true,
        frameAreas:'chassis, carriage / attachment mount',
        tyrePos:['LF','RF','LR','RR'], ratings:['Tyre Handling Attachment'],
        specific: b => [ b.sec('att','Tyre Handling Attachment & Load-Holding Valves', [
          ['Clamp arms & pads','Arms, pads, cracks','No cracks','Shift'],
          ['Rotation & tilt','Rotation drive and tilt','Smooth','W'],
          ['Load-holding valves','Pilot-operated checks hold clamp on hose failure','Holds','W'],
          ['Clamping pressure','Clamp force / pressure setting','Per OEM','M'],
          ['Attachment mounting','Quick coupler / carriage locking','Locked','Shift']
        ]) ]}),

      hme({ id:'hme-prime-mover-lowbed', title:'Prime Mover & Low-bed Trailer', prefix:'plb', tag:'e.g. PM-01', wheeled:true,
        std:'ISO 3450 / ADR / AS 4177 / load restraint guide / OEM',
        frameAreas:'prime mover chassis, fifth wheel mount, trailer gooseneck and main beams',
        tyrePos:['Steer LF','Steer RF','Drive LH','Drive RH','Trailer avg'], ratings:['Trailer & Coupling'],
        specific: b => [ b.sec('trl','Coupling, Trailer, Ramps & Load Restraint', [
          ['Fifth wheel / gooseneck','Jaws, kingpin, locking, wear','Locked, within wear','Shift'],
          ['Trailer air brakes','Air couplings, brake chambers, slack adjusters','No leaks; adjusted','Shift'],
          ['Air tanks','Drain tanks; pressure build-up time','Drained; builds within limit','Shift'],
          ['Trailer structure','Deck, main beams, cross members — cracks','No cracks','W'],
          ['Ramps','Ramps, pins, hydraulics','Functional','W'],
          ['Tie-downs','Lashing points, chains, binders — rated and undamaged','Rated, no damage','Each load'],
          ['Landing legs','Legs and crank','Functional','W'],
          ['Trailer lights & signage','Lights, reflectors, abnormal-load signage','Functional','Shift']
        ]) ]}),

      hme({ id:'hme-skid-steer', title:'Skid Steer / Compact Track Loader', prefix:'sks', tag:'e.g. SSL-01', wheeled:true, drive:'hydrostatic',
        std:'ISO 20474-3 / ISO 3471 / ISO 3449 / ISO 6683',
        frameAreas:'main frame, lift-arm towers',
        tyrePos:['LF','RF','LR','RR'], ratings:['Loader Arms & Attachment'],
        specific: b => [ b.sec('arm','Loader Arms, Attachment & Interlocks', [
          ['Lift arms','Cracks, pins','No cracks','250h'],
          ['Attachment & coupler','Coupler wedges / pins locking','Locked','Shift'],
          ['Seat bar & interlocks','Seat bar / seat switch locks lift and travel functions','Interlocks functional','Shift'],
          ['Side screens & door','Side screens and front door fitted','Fitted','Shift'],
          ['Chain cases','Drive chain oil level and tension','Correct','500h']
        ]) ]})
    ];
  }


