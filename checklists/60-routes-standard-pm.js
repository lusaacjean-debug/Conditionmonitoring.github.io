/* CM Inspect — checklists/60-routes-standard-pm.js
   Area inspection routes and standard checklists created for Pronto PM tasks.
   Loaded as a classic script; shares global scope with the other files
   (load order is defined in index.html). © Lotus Africa — internal use only. */
'use strict';
  /* =====================================================================
     STANDARD CHECKLISTS FOR PRONTO PM TASKS NOT YET COVERED
     Area inspection routes per trade, electrical standards, fleet services,
     lifting/fall protection, containment, lubrication routes, trommel.
     ===================================================================== */
  function stdChecklist(cfg){
    const p = cfg.prefix, b = cmBuilder(p, cfg.plain ? { plain:true } : undefined);
    const pre = cfg.pre ? cfg.pre(p) : [];
    const secs = [plantSafety(p, cfg.safety || [])].concat(pre, cfg.sections(b), [b.sec('rel','Release, Reporting & Sign-off', RELEASE_ROWS), b.rating(cfg.ratings)]);
    const out = { id: cfg.id, title: cfg.title, dept: cfg.dept, category: cfg.category, tagPlaceholder: cfg.tag,
      defaultVisual: true, defaultVibration: !!cfg.vib, sections: secs };
    if (cfg.drive){ out.driveCouplingField = true; out.driveTypeOptions = DRIVE_TYPES_ALL; }
    return out;
  }
  const ROUTE_NOTE = 'Route checklist: tag = the plant area / section (e.g. 780 Strong Acid, 310 RIP). Record each defect with its plant item number in Findings and raise a Pronto work request.';

  function standardPmChecklists(){
    const L = [];

    /* ---------------- AREA INSPECTION ROUTES (one per trade) ---------------- */
    L.push(stdChecklist({ id:'route-mechanical', prefix:'rmec', category:'routes', tag:'e.g. 310 RIP / 780 Strong Acid',
      title:'Area Inspection Route — Mechanical (Fitter)',
      dept:'Area Route — fitter daily / weekly / monthly area inspection · ISO 17359 (condition monitoring) / ISO 20816 / OEM · ' + ROUTE_NOTE,
      ratings:['Rotating Equipment','Leaks & Seals','Guarding & Safety','Lubrication','Overall Area Condition'],
      safety:[ACID_PPE,'Running-plant route: no guard removal, no reaching into machines; offline tasks need isolation & LOTO'],
      sections: b => [
        b.sec('pump','Pumps & Agitators (running)', [
          ['Noise & vibration','Listen / feel each running pump, agitator and fan; abnormal noise, vibration or cavitation','Normal; report changes','D'],
          ['Bearing temperature','Touch-safe / IR check of bearing housings','< 80°C or no rise vs. last route','W'],
          ['Mechanical seals & glands','Seal leakage, gland drip rate, flush water flowing','Within allowance; flush on','D'],
          ['Couplings & belts','Coupling guard, belt slap / squeal, belt dust under guard','No abnormal sign','W'],
          ['Standby equipment','Standby pumps available, not seized (rotate if procedure allows)','Available','W']
        ]),
        b.sec('conv','Conveyors, Feeders & Screens', [
          ['Belt tracking & spillage','Belt tracking, spillage at transfers, skirt seals','Tracking central; no build-up','D'],
          ['Idlers & pulleys','Seized / noisy idlers, pulley lagging','None seized','W'],
          ['Screens & feeders','Screen deck, springs, exciter noise; feeder liners','Normal','W'],
          ['Pull-wires & guards','Pull-wire tension, guards fitted','Fitted, tensioned','W']
        ]),
        b.sec('leak','Leaks, Piping & Valves', [
          ['Process leaks','Leaks at flanges, valves, pump casings, tanks (acid, slurry, steam, oil)','No active leaks','D'],
          ['Valve condition','Valves operable, handwheels fitted, no passing on standby lines','Operable','W'],
          ['Hoses','Flexible hoses — bulging, abrasion, clamps','Serviceable','W'],
          ['Flange bolting','Pipeline flange bolts — corrosion, missing bolts, spray shields (acid)','Complete, shields fitted','M']
        ]),
        b.sec('lub','Lubrication & Oil Levels', [
          ['Oil levels','Gearbox / bearing housing / hydraulic oil levels and sight glasses','Within marks','W'],
          ['Grease points','Auto-lube / grease pots working; dry points reported','Lubricated','W'],
          ['Breathers','Desiccant breathers colour','Within life','M']
        ]),
        b.sec('gen','Guards, Access & Housekeeping', [
          ['Guarding','All rotating parts guarded','Fitted','D'],
          ['Access','Walkways, handrails, ladders, grating','Safe, secure','W'],
          ['Housekeeping','Spillage, scrap, tools, oil on floor','Clean','D']
        ])
      ]}));

    L.push(stdChecklist({ id:'route-electrical', prefix:'rele', category:'routes', tag:'e.g. 780 Steam Gen & Demin',
      title:'Area Inspection Route — Electrical',
      dept:'Area Route — electrician daily / weekly / monthly area inspection · IEC 60364-6 / IEC 60079-17 / NFPA 70B · ' + ROUTE_NOTE,
      ratings:['Motors','Panels & Distribution','Lighting','Cables & Earthing','Overall Area Condition'],
      safety:[HV_PPE,'Visual route only — no covers opened on live equipment without permit and arc-flash PPE'],
      sections: b => [
        b.sec('mot','Motors (visual, running)', [
          ['Motor condition','Abnormal noise, vibration, smell; fan cowl clear','Normal','W'],
          ['Motor temperature','Frame temperature (IR / touch-safe)','No hot spots; no rise vs. last route','W'],
          ['Terminal box & glands','Terminal box cover, gland sealing, cable strain','Sealed, secure','M'],
          ['Motor cleaning','Dust / product build-up on frame and fins (cleaned monthly)','Clean','M']
        ]),
        b.sec('pnl','Panels, MCCs, VSDs & Local Control Stations', [
          ['Panel condition','Doors closed and locked, gaskets, no water / dust ingress','Closed, sealed','W'],
          ['Indications','Indication lamps, meters, VSD display — no unacknowledged faults','No active faults','W'],
          ['Local stop stations','Local stop / start stations labelled, lockable, E-stops intact','Intact','W'],
          ['Cooling','Panel / VSD fans running, filters clean, room A/C working','Running, clean','M']
        ]),
        b.sec('lgt','Lighting', [
          ['Area lighting','Area and walkway lights working (night check)','≥ 95% working','2W'],
          ['Emergency lighting','Emergency / exit lights healthy','Working','M']
        ]),
        b.sec('cab','Cables, Trays & Earthing', [
          ['Cables & trays','Cable damage, trays and supports, covers','No damage','M'],
          ['Earthing','Equipment earth bonds, earth bars','Connected, no corrosion','M'],
          ['Ex equipment','Hazardous-area equipment integrity (visual)','Intact','M']
        ]),
        b.sec('tool','Electrical Hand Tools & Portable Equipment', [
          ['Test tags','Portable tools and leads carry a current test tag','Tagged, in date','M'],
          ['Condition','Leads, plugs, housings undamaged','Serviceable','M']
        ])
      ]}));

    L.push(stdChecklist({ id:'route-instrumentation', prefix:'rins', category:'routes', tag:'e.g. 320 Elution',
      title:'Area Inspection Route — Instrumentation',
      dept:'Area Route — instrument technician weekly / monthly area inspection · IEC 61298 / IEC 60079-17 / ISA-5.1 · ' + ROUTE_NOTE,
      ratings:['Field Instruments','Analysers & Samplers','Valves & Actuators','Instrument Air','Overall Area Condition'],
      safety:[ACID_PPE],
      sections: b => [
        b.sec('fld','Field Instruments (visual)', [
          ['Readings sensible','Local display agrees with control room value and process conditions','Agree','W'],
          ['Housings & covers','Covers fitted, windows readable, no water ingress','Intact','W'],
          ['Impulse lines','Impulse lines / manifolds — leaks, plugging, heat tracing','No leaks or plugging','W'],
          ['Tags','Instrument tag plates present','Present','M']
        ]),
        b.sec('ana','Analysers, Densimeters & Samplers', [
          ['Sample flow','Analyser sample flow and drains','Flowing','W'],
          ['Sensor cleaning','pH / conductivity sensors cleaned per schedule','Clean','W'],
          ['Nuclear gauges','Radioactive gauge signs, barriers and shutter position (visual)','Correct','M']
        ]),
        b.sec('vlv','Control Valves & Actuators', [
          ['Positioner','Valve position follows controller output; no hunting','Stable','W'],
          ['Air supply','Air sets drained, tubing leaks','No leaks','W'],
          ['Limit switches','Open / closed feedback correct','Correct','M']
        ]),
        b.sec('air','Instrument Air & Panels', [
          ['Air header pressure','Instrument air pressure and dew point indication','Within design','W'],
          ['Junction boxes','JB covers, glands, labelling','Sealed','M'],
          ['Control panels','PLC / RIO panel status LEDs, fans, cleanliness','No faults','M']
        ])
      ]}));

    L.push(stdChecklist({ id:'route-boilermaker', prefix:'rbmk', category:'routes', tag:'e.g. 110 Feed Preparation',
      title:'Area Inspection Route — Boilermaker (Structures, Chutes, Tanks & Pipelines)',
      dept:'Area Route — boilermaker daily / weekly / monthly area inspection · AS 4100 / API 653 (visual) / API 570 (visual) / AS 1657 · ' + ROUTE_NOTE,
      ratings:['Structures & Access','Chutes, Bins & Liners','Tanks & Vessels','Pipelines & Flanges','Overall Area Condition'],
      safety:[ACID_PPE,'Hot work only under hot-work permit; gas test in acid / sulphur areas'],
      sections: b => [
        b.sec('str','Structures, Platforms & Access', [
          ['Steelwork','Corrosion, cracks, distortion, missing members','No structural defect','M'],
          ['Grating & handrails','Grating clips, handrails, toe boards, ladders and cages (AS 1657)','Complete, secure','W'],
          ['Foundations & holding-down','Base plates, grout, anchor bolts','Sound','M']
        ]),
        b.sec('cht','Chutes, Bins, Hoppers & Liners', [
          ['Chute wear','Wear-through, holes, liner wear, spillage','No holes; liners within limit','W'],
          ['Inspection doors','Doors close and seal, interlocks','Sealed','W'],
          ['Bins & hoppers','Build-up, grizzly bars, structure','Sound','M']
        ]),
        b.sec('tnk','Tanks, Vessels & Bunds', [
          ['Shell & roof','Leaks, corrosion, staining, bulging','No leaks','W'],
          ['Nozzles & manways','Nozzle leaks, manway bolting','Tight','M'],
          ['Bunds','Bund integrity, drain valve closed, no accumulation','Intact, dry','W']
        ]),
        b.sec('pip','Pipelines, Flanges & Supports', [
          ['Pipeline leaks','Leaks, pinholes, weeping welds (acid, steam, slurry)','No leaks','D'],
          ['Wear points','Slurry bends / tees — wear, thinning (UT where due)','Within t-min','M'],
          ['Flanges & spray shields','Flange bolting, gaskets, acid spray shields','Complete','W'],
          ['Supports','Pipe supports, shoes, guides, hangers','Secure','M']
        ])
      ]}));

    L.push(stdChecklist({ id:'route-operator', prefix:'ropr', category:'routes', tag:'e.g. 780 Sulphur Feed & Melting',
      title:'Area Inspection Round — Process Operator',
      dept:'Area Route — operator daily round · site operating procedures · ' + ROUTE_NOTE,
      ratings:['Process Conditions','Equipment Running Condition','Leaks & Emissions','Safety Equipment','Overall Area Condition'],
      safety:[ACID_PPE,'SO2 / acid mist areas: personal SO2 monitor and escape respirator carried'],
      sections: b => [
        b.sec('prc','Process Conditions', [
          ['Field readings','Field gauges / levels agree with control room','Agree','Shift'],
          ['Operating window','Temperatures, pressures, flows, levels within operating limits','Within limits','Shift'],
          ['Alarms','Local alarms / annunciators','None standing','Shift']
        ], { readingNote:'record key values for the area', readings:[['Key value 1','eng. unit'],['Key value 2','eng. unit'],['Key value 3','eng. unit']] }),
        b.sec('eqp','Equipment Running Condition', [
          ['Running equipment','Pumps, fans, agitators, conveyors — noise, vibration, smell, heat','Normal','Shift'],
          ['Standby equipment','Standby units ready, valves lined up','Ready','Shift'],
          ['Seal water / cooling','Seal water and cooling water flowing','Flowing','Shift']
        ]),
        b.sec('lek','Leaks, Spills & Emissions', [
          ['Leaks','Acid, sulphur, steam, slurry, oil leaks','None','Shift'],
          ['Emissions','Visible stack plume, SO2 smell, dust','None abnormal','Shift'],
          ['Spills','Spills cleaned / reported; sumps working','Clean','Shift']
        ]),
        b.sec('sfe','Safety Equipment', [
          ['Safety showers & baths','Showers, eyewash and acid baths clear and working','Working','Shift'],
          ['Fire equipment','Extinguishers / hose reels in place','In place','Shift'],
          ['Access & housekeeping','Walkways clear, lighting working','Clear','Shift']
        ])
      ]}));

    /* ---------------- ELECTRICAL STANDARDS ---------------- */
    L.push(stdChecklist({ id:'electric-motor', prefix:'emot', category:'ei', tag:'e.g. 780-PC-970 M1', vib:true,
      title:'Electric Motor Inspection & Electrical Testing',
      dept:'Electrical — IEC 60034 / IEEE 43 (insulation) / IEC 60079-17 (Ex) / ISO 20816 / NFPA 70B',
      ratings:['Mechanical Condition','Electrical Tests','Terminal Box & Cabling','Cooling & Cleanliness','Overall Motor Condition'],
      safety:[HV_PPE,'Offline tests: motor isolated at MCC / switchgear, locked, tested dead and earthed; discharge windings after IR test'],
      sections: b => [
        b.sec('vis','Visual & Running Checks', [
          ['Nameplate','Nameplate legible; kW, V, A, rpm, IP, Ex class match duty','Legible, correct','A'],
          ['Frame & feet','Cracks, soft foot, holding-down bolts','Tight, no cracks','6M'],
          ['Cooling','Fan, cowl and fins clean; no product build-up (cleaned monthly)','Clean','M'],
          ['Noise & vibration','Bearing noise; vibration velocity DE / NDE','ISO 20816 zone A/B','M'],
          ['Temperature','Frame and bearing temperature / IR','No hot spots','M'],
          ['Lubrication','Bearing re-greasing per schedule (correct grease, quantity)','Per schedule','per lube plan']
        ], { readingNote:'ISO 20816 / site baseline', readings:[['DE vibration','mm/s'],['NDE vibration','mm/s'],['Frame temperature','°C'],['Running current','A']] }),
        b.sec('tb','Terminal Box, Cables & Earthing', [
          ['Terminal box','Gasket, cover bolts, moisture, tracking, lug tightness','Dry, tight','6M'],
          ['Cable & gland','Cable damage, gland seal, strain relief','Sealed','6M'],
          ['Earth','Frame earth connection','Connected','6M'],
          ['Anti-condensation heater','Heater operates when stopped (where fitted)','Working','6M']
        ]),
        b.sec('tst','Offline Electrical Tests', [
          ['Insulation resistance','IR at 500 V / 1000 V (LV) or 2.5–5 kV (MV), 1 min, temperature-corrected (IEEE 43)','≥ 100 MΩ (LV) / per IEEE 43','A'],
          ['Polarisation index','PI = IR10 / IR1 (MV and critical LV motors)','≥ 2.0','A'],
          ['Winding resistance','Phase-to-phase resistance balance','Within 2–3 % between phases','A'],
          ['Current balance','Running current each phase vs. nameplate','Imbalance < 10 %','6M'],
          ['Protection','Overload / motor protection relay setting vs. FLA','Correct','A']
        ], { readingNote:'IEEE 43 / OEM', readings:[['IR U-E','MΩ'],['IR V-E','MΩ'],['IR W-E','MΩ'],['PI','ratio'],['Winding R U-V','Ω'],['Winding R V-W','Ω'],['Winding R W-U','Ω']] })
      ]}));

    L.push(stdChecklist({ id:'earthing-system', prefix:'erth', category:'ei', tag:'e.g. Plant earth grid / NER-01',
      title:'Earthing System, Earth Resistance & NER Test',
      dept:'Electrical — IEC 60364-5-54 / IEEE 80 / IEEE 81 (earth resistance) / IEC 62305 (lightning) / statutory electrical regulations',
      ratings:['Earth Electrodes','Bonding & Conductors','Neutral Earthing Resistor','Lightning Protection','Overall Earthing System'],
      safety:[HV_PPE,'Never disconnect an earth electrode from a live system; NER tests only with the transformer de-energised'],
      sections: b => [
        b.sec('ele','Earth Electrodes & Pits', [
          ['Earth pits','Pit covers, labels, connections, corrosion','Accessible, tight','A'],
          ['Electrode resistance','Fall-of-potential / clamp test of each electrode or grid (IEEE 81)','Within design (typ. ≤ 1 Ω substation, ≤ 10 Ω equipment)','A']
        ], { readingNote:'design values', readings:[['Main grid resistance','Ω'],['Electrode 1','Ω'],['Electrode 2','Ω'],['Electrode 3','Ω']] }),
        b.sec('bnd','Bonding & Earth Conductors', [
          ['Equipotential bonding','Structures, tanks, pipe racks, cable trays bonded','Continuous','A'],
          ['Continuity','Continuity of protective conductors to main earth bar','< 0.5 Ω (or design)','A'],
          ['Static earthing','Static earthing at flammable / sulphur areas','Continuous','A']
        ]),
        b.sec('ner','Neutral Earthing Resistor (NER)', [
          ['NER condition','Enclosure, resistor elements, connections, ventilation','Sound','A'],
          ['NER resistance','Measured resistance vs. nameplate','Within ±10 %','A'],
          ['Earth-fault protection','Earth-fault relay associated with the NER tested','Trips correctly','A']
        ], { readingNote:'nameplate', readings:[['NER resistance','Ω']] }),
        b.sec('lpl','Lightning Protection', [
          ['Air terminals & down conductors','Condition and fixings','Intact','A'],
          ['Test joints','Test-joint resistance','Within design','A']
        ])
      ]}));

    L.push(stdChecklist({ id:'pfc-capacitor-bank', prefix:'pfc', category:'ei', tag:'e.g. 860-JS-001-MV-8',
      title:'Power Factor Correction Capacitor Bank',
      dept:'Electrical — IEC 60831 / IEC 60871 / IEC 61921 / NFPA 70B',
      ratings:['Capacitors','Switching & Protection','Cooling','Overall PFC Bank'],
      safety:[HV_PPE,'Capacitors hold charge: wait the discharge time and earth each capacitor before contact'],
      sections: b => [
        b.sec('cap','Capacitors & Reactors', [
          ['Capacitor cans','Bulging, leaks, discolouration','None','6M'],
          ['Capacitance','Capacitance per step vs. nameplate','Within −5 / +10 %','A'],
          ['Detuning reactors','Reactor temperature, noise','Normal','6M']
        ], { readingNote:'nameplate', readings:[['Step 1 capacitance','µF'],['Step 2 capacitance','µF'],['Step 3 capacitance','µF']] }),
        b.sec('sw','Switching, Protection & Controller', [
          ['Contactors','Contactor contacts, discharge resistors','Serviceable','A'],
          ['Fuses & protection','Fuses, protection relay','Healthy','A'],
          ['Controller','PF controller target and steps switching','Achieves target PF','6M']
        ], { readingNote:'site target', readings:[['Power factor','PF']] }),
        b.sec('cool','Cooling & Thermography', [
          ['Ventilation','Fans and filters','Running, clean','6M'],
          ['IR scan','Thermography of connections and cans','No hot spot','6M']
        ])
      ]}));

    L.push(stdChecklist({ id:'lighting-distribution', prefix:'ldb', category:'ei', tag:'e.g. LDB-780-01',
      title:'Lighting, Distribution Boards & Emergency Lighting',
      dept:'Electrical — IEC 60364-6 / IEC 61439-3 / IEC 60598 / IEC 60364-5-56 & BS 5266 (emergency lighting) / IEC 61008 (RCD)',
      ratings:['Distribution Boards','Luminaires','Emergency Lighting','Overall Lighting System'],
      safety:[HV_PPE],
      sections: b => [
        b.sec('db','Lighting Distribution Boards', [
          ['Enclosure','Door, lock, gasket, labelling, circuit schedule','Complete','6M'],
          ['Connections','Terminal tightness, IR scan of breakers','No hot spots','6M'],
          ['RCD test','Earth-leakage / RCD trip test (push button and timed)','Trips ≤ 300 ms at IΔn','6M'],
          ['Insulation','Insulation resistance of circuits','≥ 1 MΩ','A']
        ], { readingNote:'IEC 61008', readings:[['RCD trip time','ms']] }),
        b.sec('lum','Luminaires & Fixtures', [
          ['Luminaires','Lamps working, diffusers, fixings, water ingress','Working, secure','2W'],
          ['Ex luminaires','Ex luminaire integrity in hazardous areas','Intact','A'],
          ['Illuminance','Illuminance at critical areas (stairs, control panels)','Per site standard','A']
        ], { readingNote:'site lighting standard', readings:[['Illuminance','lux']] }),
        b.sec('em','Emergency & Exit Lighting', [
          ['Function test','Monthly short function test','All operate','M'],
          ['Duration test','Annual full-duration test','≥ rated duration','A']
        ])
      ]}));

    L.push(stdChecklist({ id:'liquid-resistance-starter', prefix:'lrs', category:'ei', tag:'e.g. 120-JH-131',
      title:'Liquid Resistance Starter (Mill Motor)',
      dept:'Electrical — OEM manual / IEC 60947-4 / NFPA 70B',
      ratings:['Electrolyte','Electrodes & Mechanism','Cooling System','Controls & Protection','Overall Starter Condition'],
      safety:[HV_PPE,'Slip-ring motor and starter isolated and earthed; electrolyte (sodium carbonate) — gloves and goggles'],
      sections: b => [
        b.sec('elc','Electrolyte', [
          ['Level','Electrolyte level in tank','Within marks','3M'],
          ['Concentration','Conductivity / specific gravity of electrolyte','Per OEM','3M'],
          ['Temperature','Electrolyte temperature after start','Within OEM','3M']
        ], { readingNote:'OEM', readings:[['Electrolyte conductivity','mS/cm'],['Electrolyte temperature','°C']] }),
        b.sec('elm','Electrodes & Drive Mechanism', [
          ['Electrodes','Electrode erosion, scaling','Within limit','A'],
          ['Drive','Electrode drive motor, gearbox, limit switches','Full travel, limits correct','3M'],
          ['Shorting contactor','Shorting contactor contacts','Serviceable','A']
        ]),
        b.sec('clg','Cooling (heat exchanger, pump, fan)', [
          ['Cooling pump & fans','Running, no leaks (see cooling tower checklist for the LRS tower)','Running','3M'],
          ['Heat exchanger','Leaks, fouling','Clean','A']
        ]),
        b.sec('ctl','Controls & Protection', [
          ['Start sequence','Start time and current profile recorded','Within OEM','3M'],
          ['Interlocks','Electrode position / temperature / level interlocks','Functional','A']
        ], { readingNote:'OEM', readings:[['Start time','s'],['Peak start current','A']] })
      ]}));

    L.push(stdChecklist({ id:'portable-electrical-tools', prefix:'pat', category:'ei', tag:'e.g. Acid Plant tool store',
      title:'Portable Electrical Equipment & Hand Tools (Test & Tag)',
      dept:'Electrical — AS/NZS 3760 / IEC 62638 / IEC 60900 (insulated tools)',
      ratings:['Visual Condition','Electrical Tests','Insulated Tools','Overall Tool Condition'],
      sections: b => [
        b.sec('vis','Visual Inspection', [
          ['Plug & lead','Plug pins, cord grip, sheath damage, joins','No damage','Each test'],
          ['Housing','Cracks, missing screws, guards','Intact','Each test'],
          ['Tag','Previous tag removed; register updated','Register current','Each test']
        ]),
        b.sec('tst','Electrical Tests (Class I / Class II)', [
          ['Earth continuity','Class I: earth continuity','≤ 1 Ω','Each test'],
          ['Insulation resistance','Insulation at 500 V DC','≥ 1 MΩ','Each test'],
          ['RCD','Portable RCD trip time','≤ 30 ms at 30 mA','Each test']
        ], { readingNote:'AS/NZS 3760', readings:[['Earth continuity','Ω'],['Insulation resistance','MΩ'],['RCD trip time','ms']] }),
        b.sec('ins','Insulated Hand Tools', [
          ['Insulation','IEC 60900 marking, insulation undamaged','No cuts or exposed metal','M'],
          ['Test equipment','Voltage testers proved on a known source; leads CAT-rated','Functional','Each use']
        ])
      ]}));

    L.push(stdChecklist({ id:'ir-thermography-survey', prefix:'irs', category:'ei', tag:'e.g. MCC-AP-01 / Route 780',
      title:'Infrared Thermography Survey (Electrical & Mechanical)',
      dept:'Condition Monitoring — ISO 18434-1 / ISO 18436-7 / NFPA 70B / NETA MTS (ΔT severity) / ASTM E1934',
      ratings:['Electrical Connections','Rotating Equipment','Refractory & Process','Overall Thermal Condition'],
      safety:[HV_PPE,'Panel doors opened only by an authorised electrician in arc-flash PPE; use IR windows where fitted'],
      sections: b => [
        b.sec('set','Survey Set-Up', [
          ['Camera','Camera calibration in date; emissivity / reflected temperature set','Set and recorded','Each survey'],
          ['Load','Equipment at ≥ 40 % load (record load current)','Load recorded','Each survey'],
          ['Route','Route list and previous images available for comparison','Available','Each survey']
        ], { readingNote:'record conditions', readings:[['Ambient temperature','°C'],['Load current','A'],['Emissivity','ε']] }),
        b.sec('ele','Electrical Connections', [
          ['Connections','Breakers, busbars, lugs, fuses, contactors — compare similar components','ΔT < 10°C (NETA: 1–3 °C minor … > 15 °C critical)','M'],
          ['Cables','Cable terminations and glands','No hot spot','M'],
          ['Transformers','Bushings, tap changer, radiators','No hot spot','6M']
        ], { readingNote:'NETA MTS ΔT criteria', readings:[['Hottest spot','°C'],['Reference (similar component)','°C'],['ΔT','°C']] }),
        b.sec('mec','Mechanical & Process', [
          ['Bearings & couplings','Bearing housings, couplings, belts','ΔT vs. similar < 15°C','M'],
          ['Refractory','Furnace, kiln, converter shells — hot spots','Below shell limit','M'],
          ['Steam & process','Steam traps, valves passing, blocked lines','As expected','M']
        ]),
        b.sec('rep','Reporting', [
          ['Images','IR and visual images saved with tag, date, load, emissivity','Saved','Each survey'],
          ['Severity & action','Each anomaly ranked and a work request raised','WR raised','Each survey']
        ])
      ]}));

    L.push(stdChecklist({ id:'hvac-air-conditioning', prefix:'hvac', category:'ei', tag:'e.g. 510-AC-526',
      title:'HVAC / Air-Conditioning Unit (Electrical Rooms & Control Rooms)',
      dept:'Electrical — ASHRAE 180 / EN 378 (refrigerants) / OEM',
      ratings:['Cooling Performance','Indoor Unit','Outdoor Unit','Electrical','Overall HVAC Condition'],
      sections: b => [
        b.sec('perf','Performance', [
          ['Room temperature','Room temperature at set point (electrical rooms ≤ 25–30°C)','At set point','M'],
          ['Supply air','Supply / return air temperature difference','ΔT 8–12°C typical','M']
        ], { readingNote:'design', readings:[['Room temperature','°C'],['Supply air','°C'],['Return air','°C']] }),
        b.sec('ind','Indoor Unit', [
          ['Filters','Filters cleaned / replaced (dust areas monthly)','Clean','M'],
          ['Coil & drain','Evaporator coil, drain pan and condensate drain clear','Clean, draining','M'],
          ['Fan','Fan operation, noise','Normal','M']
        ]),
        b.sec('out','Outdoor Unit', [
          ['Condenser coil','Coil clean, fins straight, no corrosion (acid fumes)','Clean','M'],
          ['Compressor','Noise, vibration, cycling','Normal','M'],
          ['Refrigerant','Pressures / leak check (competent person)','No leak','6M']
        ]),
        b.sec('ele','Electrical', [
          ['Connections','Terminals, contactor, isolator','Tight','6M'],
          ['Current','Compressor running current vs. nameplate','Within rating','6M']
        ])
      ]}));

    /* ---------------- FLEET: SERVICES, GET, MEWP ---------------- */
    L.push(stdChecklist({ id:'diesel-engine-pm-service', prefix:'dsv', category:'hme', tag:'e.g. DZ-01 / GEN05 / LP-03',
      title:'Diesel Equipment PM Service — 250 / 500 / 1000 / 2000 h (HME, Gensets, Lighting Plants, Pumps)',
      dept:'Heavy Mobile Equipment — OEM service schedule / ISO 4406 / site oil analysis program · do the sections up to the service due (A = 250 h, B = 500 h, C = 1000 h, D = 2000 h)',
      ratings:['Engine','Filtration','Fluids & Samples','Drivetrain & Hydraulics','Overall Service Quality'],
      safety:['Machine parked, implements down, park brake on, isolated and locked (LOTO); hot oil and coolant — allow to cool'],
      sections: b => [
        b.sec('a','Service A — every 250 h (all services)', [
          ['SMU & history','Record hour meter; review previous service and open defects','Recorded','250h'],
          ['Engine oil & filter','Drain engine oil (hot), replace oil filter(s), refill with specified grade','Correct grade and level','250h'],
          ['Oil samples','Take engine oil sample before drain (and hydraulic / transmission per schedule)','Sampled, labelled','250h'],
          ['Air filter','Clean pre-cleaner; check restriction; replace primary element if indicated','Within limit','250h'],
          ['Fuel water separator','Drain water separator','No water','250h'],
          ['Greasing','Grease all lube points; check auto-lube reservoir','All points greased','250h'],
          ['Belts & hoses','Belts, coolant and hydraulic hoses','Serviceable','250h'],
          ['Battery & electrics','Battery terminals, electrolyte, lights','Serviceable','250h'],
          ['Leaks & walk-around','Leaks, loose bolts, damage','None','250h']
        ], { readingNote:'record at service', readings:[['SMU','h'],['Engine oil added','L']] }),
        b.sec('b','Service B — every 500 h (add to A)', [
          ['Fuel filters','Replace primary and secondary fuel filters; bleed system','Replaced, no air','500h'],
          ['Hydraulic return filter','Replace hydraulic return / pilot filters (per OEM)','Replaced','500h'],
          ['Coolant','Coolant concentration and SCA test','Within spec','500h'],
          ['Final drives & axles','Check oil levels; magnetic plugs','At level, no debris','500h'],
          ['Valve lash / injectors','Per OEM interval (record)','As required','500h']
        ]),
        b.sec('c','Service C — every 1000 h (add to A + B)', [
          ['Transmission oil & filter','Replace transmission filter (oil per OEM)','Replaced','1000h'],
          ['Air filter elements','Replace primary and secondary air elements','Replaced','1000h'],
          ['Breathers','Replace tank / housing breathers','Replaced','1000h'],
          ['Alternator / genset','Gensets: alternator terminals, AVR, bearings; lighting plant mast and winch','Serviceable','1000h']
        ]),
        b.sec('d','Service D — every 2000 h (add to A + B + C)', [
          ['Hydraulic oil','Replace hydraulic oil (or by oil analysis) and suction strainer','Replaced / extended by analysis','2000h'],
          ['Final drive & axle oils','Replace final drive, differential and axle oils','Replaced','2000h'],
          ['Coolant','Replace coolant (or extend by test)','Replaced / tested','2000h'],
          ['Engine adjustments','Valve lash, engine mounts, turbo check','Within OEM','2000h']
        ]),
        b.sec('fin','Completion', [
          ['Test run','Run to operating temperature; check for leaks and warnings','No leaks or codes','Each service'],
          ['Service sticker','Next service hours written on sticker in cab','Fitted','Each service'],
          ['Records','Filters / oils used recorded on the WO; samples dispatched','Recorded','Each service']
        ])
      ]}));

    L.push(stdChecklist({ id:'lv-km-service', prefix:'lvs', category:'prestart', tag:'e.g. LV-12 / BUS-03',
      title:'Light Vehicle & Bus Service — 5,000 km Interval (A / B / C)',
      dept:'Light Vehicles — OEM service schedule / site LV standard · 5,000 & 15,000 km = A · 10,000 km = A + B · 20,000 km = A + B + C',
      ratings:['Engine & Fluids','Brakes & Steering','Tyres & Suspension','Safety Equipment','Overall Vehicle Condition'],
      safety:['Vehicle on level ground / hoist with stands, wheels chocked, keys removed'],
      sections: b => [
        b.sec('a','Service A — every 5,000 km', [
          ['Engine oil & filter','Replace engine oil and filter','Correct grade and level','5,000 km'],
          ['Fluids','Coolant, brake, clutch, power steering, washer levels','At level','5,000 km'],
          ['Air filter','Clean / check (dusty site)','Clean','5,000 km'],
          ['Brakes','Pad / shoe thickness, discs, lines','Above minimum','5,000 km'],
          ['Tyres','Pressure, tread depth, rotation','≥ legal / site minimum','5,000 km'],
          ['Lights & horn','All lights, horn, beacon, reverse alarm','Working','5,000 km'],
          ['Underbody','Leaks, steering joints, suspension, exhaust, propshaft','No defects','5,000 km']
        ], { readingNote:'record at service', readings:[['Odometer','km'],['Front pad thickness','mm-pad']] }),
        b.sec('b','Service B — every 10,000 km (add to A)', [
          ['Fuel filter','Replace fuel filter; drain water separator','Replaced','10,000 km'],
          ['Air filter','Replace air filter element','Replaced','10,000 km'],
          ['Wheel alignment & balance','Check alignment / balance','Within spec','10,000 km'],
          ['4WD system','Transfer case and differential oil levels; 4WD engagement','At level, engages','10,000 km']
        ]),
        b.sec('c','Service C — every 20,000 km (add to A + B)', [
          ['Gearbox & differentials','Replace gearbox, transfer case and differential oils (per OEM)','Replaced','20,000 km'],
          ['Coolant & brake fluid','Replace / test coolant and brake fluid','Within spec','20,000 km'],
          ['Wheel bearings','Wheel bearing play / repack','No play','20,000 km'],
          ['Drive belts','Replace / check drive belts','Serviceable','20,000 km']
        ]),
        b.sec('sfe','Mine-Site Safety Equipment', [
          ['Safety equipment','Fire extinguisher, first aid, triangles, buggy whip, radio, IVMS','Present, working','5,000 km'],
          ['ROPS & seatbelts','Internal ROPS, seatbelts','Serviceable','5,000 km'],
          ['Road test','Brakes, steering, noises; service sticker updated','Satisfactory','5,000 km']
        ])
      ]}));

    L.push(stdChecklist({ id:'hme-get-boilermaker', prefix:'get', category:'hme', tag:'e.g. EX-02 bucket / DZ-01 blade',
      title:'Boilermaker Inspection & Repair — Buckets, Blades, Load Bins & GET (250 h)',
      dept:'Heavy Mobile Equipment — OEM wear guides / AS 1554 (welding) / site hot-work procedure',
      ratings:['Structure & Cracks','Wear Packages','GET','Repairs','Overall Attachment Condition'],
      safety:['Attachment lowered to ground / body propped; machine isolated (LOTO); hot-work permit, fire watch and extinguisher for welding'],
      sections: b => [
        b.sec('str','Structure & Cracks', [
          ['Shell / body','Cracks at welds, corners, hinge bosses, pivot area (MPI where suspect)','No cracks','250h'],
          ['Hinge & pivot bosses','Bore wear, boss cracks','Within limit','250h'],
          ['Previous repairs','Re-cracking at repair welds','None','250h']
        ]),
        b.sec('wear','Wear Packages & Liners', [
          ['Wear plates / liners','Thickness, wear-through, missing plates','Above minimum','250h'],
          ['Lip, cutting edges, end bits','Wear vs. OEM gauge; flip / replace','Within limit','250h'],
          ['Heel / side shrouds','Present, worn evenly','Present','250h']
        ], { readingNote:'OEM wear limits', readings:[['Floor / liner remaining','%'],['Cutting edge remaining','%']] }),
        b.sec('get','Ground Engaging Tools', [
          ['Teeth & adapters','Tooth wear, adapter nose wear, locking pins','None missing; replace at limit','Shift'],
          ['Ripper tips & shanks','Tip and protector wear','Within limit','250h']
        ]),
        b.sec('rep','Repairs', [
          ['Weld procedure','Repairs to approved procedure, pre-heat, qualified welder','Compliant','Each repair'],
          ['Hard-facing','Hard-facing pattern applied where specified','Applied','Each repair'],
          ['Final check','Crack-test repaired areas after cooling','No indications','Each repair']
        ])
      ]}));

    L.push(stdChecklist({ id:'mewp-man-lift', prefix:'mewp', category:'hme', tag:'e.g. ML01 / Cherry picker',
      title:'MEWP / Man Lift / Cherry Picker — Inspection & Statutory Check',
      dept:'Heavy Mobile Equipment — ISO 18893 / ISO 16368 / AS 2550.10 / AS 1418.10 / statutory lifting regulations',
      ratings:['Platform & Controls','Boom & Structure','Safety Devices','Chassis & Power','Overall MEWP Condition'],
      sections: b => [
        b.sec('doc','Documentation', [
          ['Logbook & manual','Logbook, operator manual and load chart on machine','Present','Each insp.'],
          ['Certificate','Annual / major inspection certificate current','Current','A'],
          ['Operator','Operator licensed / VOC current','Current','Each insp.']
        ], { readingNote:'record', readings:[['Hour meter','h']] }),
        b.sec('plt','Platform & Controls', [
          ['Platform','Guardrails, gate (self-closing), floor, toe boards','Intact','Each insp.'],
          ['Anchor points','Harness anchor points rated and undamaged','Serviceable','Each insp.'],
          ['Controls','Platform and ground controls, dead-man / enable','Functional','Each insp.'],
          ['E-stops','Emergency stops at platform and ground','Stop all motion','Each insp.']
        ]),
        b.sec('boom','Boom, Scissor & Structure', [
          ['Boom / scissor','Cracks, deformation, pins and retainers, wear pads','No defects','3M'],
          ['Cylinders & hoses','Leaks, rod damage, hose condition','No leaks','3M'],
          ['Slew','Slew bearing bolts and brake','Secure','3M']
        ]),
        b.sec('sd','Safety Devices', [
          ['Overload','Platform overload cut-out test','Cuts out at SWL','3M'],
          ['Tilt alarm','Tilt sensor / alarm test','Alarms and limits','3M'],
          ['Emergency lowering','Emergency / auxiliary lowering','Lowers platform','3M'],
          ['Travel interlocks','Drive cut-out when elevated (where required)','Functional','3M']
        ]),
        b.sec('chs','Chassis & Power', [
          ['Tyres / outriggers','Tyres, outriggers and interlocks','Serviceable','Each insp.'],
          ['Engine / batteries','Engine fluids or battery charge and charger','Serviceable','Each insp.']
        ])
      ]}));

    /* ---------------- SAFETY & STATUTORY ADDITIONS ---------------- */
    L.push(stdChecklist({ id:'fall-protection-equipment', prefix:'fpe', category:'safety', tag:'e.g. HARNESS 16 / FA-03',
      title:'Fall Protection Equipment — Harnesses, Lanyards & Fall Arresters',
      dept:'Safety & Statutory — ISO 10333 / EN 361, EN 355, EN 360 / AS/NZS 1891.4 · 3-monthly inspection, annual certification',
      ratings:['Webbing & Stitching','Hardware','Fall Arrester','Overall Equipment Condition'],
      sections: b => [
        b.sec('id','Identification', [
          ['Label & ID','Manufacturer label legible; serial / ID matches register; manufacture date within service life','Legible, in life','3M'],
          ['Inspection tag','Previous inspection colour tag / record','Current','3M'],
          ['Fall history','Equipment that arrested a fall is withdrawn','None arrested','3M']
        ]),
        b.sec('web','Webbing, Ropes & Stitching', [
          ['Webbing','Cuts, fraying, burns, chemical (acid) damage, UV fading','No damage','3M'],
          ['Stitching','Broken / pulled stitches, fall indicator deployed','Intact','3M'],
          ['Energy absorber','Pack intact, not extended','Intact','3M']
        ]),
        b.sec('hw','Hardware', [
          ['Connectors & hooks','Gate closes and locks, no deformation, corrosion','Functional','3M'],
          ['D-rings & buckles','Distortion, cracks, sharp edges','Sound','3M']
        ]),
        b.sec('fa','Fall Arrester / Inertia Reel (where applicable)', [
          ['Lock-off test','Sharp pull locks the device','Locks','3M'],
          ['Retraction','Line retracts fully, no damage','Retracts','3M'],
          ['Annual service','Manufacturer / competent person service','Current','A']
        ])
      ]}));

    L.push(stdChecklist({ id:'bund-containment', prefix:'bund', category:'safety', tag:'e.g. 780 acid tank bund',
      title:'Bund Wall & Secondary Containment Inspection',
      dept:'Safety & Statutory — AS 1940 / AS 3780 / API 2610 / environmental licence conditions',
      ratings:['Bund Structure','Lining & Joints','Drainage & Capacity','Overall Containment'],
      safety:[ACID_PPE],
      sections: b => [
        b.sec('str','Bund Structure', [
          ['Walls & floor','Cracks, spalling, acid attack of concrete','No cracks through wall','3M'],
          ['Penetrations','Pipe penetrations sealed','Sealed','3M']
        ]),
        b.sec('lin','Lining & Joints', [
          ['Acid-resistant lining','Lining / coating intact (acid areas)','Intact','3M'],
          ['Expansion joints','Joint sealant intact','Sealed','3M']
        ]),
        b.sec('drn','Drainage & Capacity', [
          ['Drain valve','Bund drain valve closed and locked','Closed, locked','W'],
          ['Accumulation','Rainwater / product accumulation removed and recorded','Dry','W'],
          ['Capacity','Bund capacity ≥ 110 % of largest tank (or licence)','Adequate','A']
        ])
      ]}));

    /* ---------------- LUBRICATION ROUTE ---------------- */
    L.push(stdChecklist({ id:'lube-greasing-route', prefix:'lgr', category:'lube', tag:'e.g. 120 Milling route',
      title:'Lubrication Route — Greasing & Motor Bearing Re-greasing',
      dept:'Lubrication — ISO 18436-4 (lubrication technician) / ICML 55.1 / OEM lube schedule · daily / weekly greasing, 8-weekly motor re-greasing',
      ratings:['Route Completion','Lubricant Control','Lube Point Condition','Overall Route'],
      sections: b => [
        b.sec('prep','Preparation & Lubricant Control', [
          ['Lube schedule','Route list with points, lubricant, quantity and frequency','Available','Each route'],
          ['Correct lubricant','Grease gun / tins labelled and colour-coded; correct product per point','Correct','Each route'],
          ['Clean transfer','Grease nipples and gun nozzle wiped before greasing','Clean','Each route'],
          ['Gun calibration','Grams per stroke of each grease gun known','Calibrated','6M']
        ], { readingNote:'record', readings:[['Grams per stroke','g']] }),
        b.sec('grs','Greasing', [
          ['All points','All points on the route greased with the specified quantity','100 % completed','Each route'],
          ['Blocked points','Blocked / broken nipples and lines reported','Reported','Each route'],
          ['Purge','Old grease purged; no over-greasing of seals','Correct','Each route']
        ]),
        b.sec('mot','Electric Motor Bearing Re-greasing', [
          ['Quantity & interval','Grease quantity per OEM nameplate / formula (G = 0.005 × D × B)','Per calculation','8W'],
          ['Relief / drain','Drain plug removed while running to relieve excess, then refitted','Relieved','8W'],
          ['Temperature after','Bearing temperature normal 30 min after greasing','No rise','8W']
        ]),
        b.sec('lvl','Oil Levels & Auto-Lube Units', [
          ['Oil levels','Gearbox / bearing oil levels topped up with correct oil','At level','W'],
          ['Auto-lube units','Grease pots / auto-lube cartridges level and discharging','Working','W'],
          ['Records','Quantities and exceptions recorded on WO','Recorded','Each route']
        ])
      ]}));

    /* ---------------- TROMMEL / ROTARY SCREEN ---------------- */
    L.push(stdChecklist({ id:'trommel-rotary-screen', prefix:'trm', category:'rotating', tag:'e.g. 120-GS-146', vib:true, drive:true, plain:true,
      title:'Trommel / Rotary Screen',
      dept:'Rotating — OEM manual / ISO 20816 / AS 4024',
      ratings:['Motor & Drive','Screen Panels','Shell & Tyres','Rollers & Thrust','Overall Trommel Condition'],
      pre: p => buildMotorSections(p+'_mtr').concat(buildCouplingSections(p+'_cpl')),
      sections: b => [
        b.sec('pan','C. Screen Panels & Spray Bars', [
          ['Screen panels','Holes, blinding, missing / loose panels and fixings','No holes','W'],
          ['Spray bars','Nozzles clear, pressure','All spraying','W'],
          ['Oversize discharge','Oversize chute, trash removal','Clear','W']
        ]),
        b.sec('shl','D. Shell, Tyres & Drive Ring', [
          ['Shell','Cracks at welds and flanges','No cracks','3M'],
          ['Tyres / drive ring','Wear, run-out, chain / girth gear condition','Within limit','3M']
        ]),
        b.sec('rol','E. Support & Thrust Rollers', [
          ['Support rollers','Wear, bearing temperature, alignment','Within limit','M'],
          ['Thrust rollers','Wear, axial float','Within limit','M']
        ], { readingNote:'OEM', readings:[['Roller bearing temp','°C']] })
      ]}));

    return L;
  }
  standardPmChecklists().forEach(e => EQUIPMENT.push(e));
