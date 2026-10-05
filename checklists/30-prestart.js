/* CM Inspect — checklists/30-prestart.js
   Prestart go / no-go checklists — light vehicles and heavy mobile equipment.
   Loaded as a classic script; shares global scope with the other files
   (load order is defined in index.html). © Lotus Africa — internal use only. */
'use strict';
  /* =====================================================================
     PRESTART — LIGHT VEHICLES (LV) & HEAVY MOBILE EQUIPMENT (HME)
     Operator go / no-go checks done at the start of every shift, before the
     vehicle or machine moves. Based on the site PRESTAT-CHECKLIST content,
     extended per equipment type. Any NOT OK on a CRITICAL item = DO NOT
     OPERATE: tag out, report to supervisor and raise a defect in Pronto.
     Row format: [component, check, acceptance, critical(bool)]
     ===================================================================== */

  function psBuilder(prefix){
    let n = 0, s = 1;
    return {
      sec(key, title, rows, extra){
        s++;
        const items = rows.map((r, i) => checklistPoint(prefix+'_'+key+'_'+(i+1), String(++n), r[0], r[1],
          (r[3] ? 'CRITICAL (no-go if NOT OK) — ' : '') + (r[2] || 'Serviceable'), 'Shift'));
        const out = { id: prefix+'_'+key, title: 'Section '+s+' — '+title, items };
        if (extra && extra.readings){
          out.readingNote = extra.readingNote || 'record at start of shift';
          out.readings = extra.readings.map((rd, i) => ({ id: prefix+'_'+key+'_rd'+(i+1), label: rd[0], unit: rd[1] }));
        }
        return out;
      }
    };
  }

  function psSafety(prefix, lv){
    return plainSafety(prefix, 'Section 1 — Pre-Inspection Safety, Isolation & Access', [
      'Take 5 completed for the prestart',
      lv ? 'Vehicle parked in the designated prestart / parking bay on level ground, clear of traffic'
         : 'Machine parked in the designated go-line / parking area on level ground, clear of traffic and edges',
      lv ? 'Engine off, key removed, park brake applied, wheel chocks fitted where required by site'
         : 'Engine off, implements lowered to ground, park brake applied, wheel chocks fitted where required',
      'Walk-around done with engine OFF; no one under raised bodies, buckets or booms',
      'Three points of contact on steps and ladders; no climbing on wet or oily surfaces',
      'PPE worn: hard hat, safety glasses, hi-vis, safety boots, gloves',
      'Hot components (exhaust, turbo, radiator) not touched; radiator cap not removed when hot'
    ]);
  }

  const GO_NOGO_ROWS = [
    ['Critical items','All CRITICAL items checked OK — vehicle / machine fit to operate','All critical items OK',true],
    ['Defect reporting','Every NOT OK item described in Findings and reported to the supervisor','Reported before operation',false],
    ['Tag out','If any CRITICAL item is NOT OK: Out of Service / Danger tag fitted, keys removed, maintenance notified','Tagged out; not operated',true],
    ['Defect register','Defects raised in the defect register / Pronto work request (WR number recorded)','WR number recorded',false],
    ['Operator declaration','Operator declares the inspection was done personally and honestly, and they are fit for work (not fatigued, not impaired)','Declared',true]
  ];

  /* ------------------------------- LV ------------------------------- */
  function psLV(cfg){
    const p = cfg.prefix, b = psBuilder(p);
    const s = [psSafety(p, true),
      b.sec('doc','Documentation, Licence & Compliance', [
        ['Registration / licence disc','Vehicle registration and roadworthy / licence disc current and displayed','Current',false],
        ['Driver authorisation','Driver holds a valid licence for the vehicle class, site LV permit and induction','Valid',true],
        ['Journey management','Journey management plan / driving permit valid for this trip (off-site travel)','Approved where required',false],
        ['Previous prestart','Log book / previous prestart reviewed — no outstanding critical defect','No open critical defect',true],
        ['Service due','Service sticker: next service km / date not exceeded','Not overdue',false]
      ], { readings:[['Odometer','km'],['Fuel level','%']] }),
      b.sec('ext','Exterior, Body & Visibility', [
        ['Body','Body free of damage that affects safe operation','No sharp edges or loose panels',false],
        ['Windscreen','Free of cracks or chips in the driver\u2019s field of view','Clear view',true],
        ['Wipers & washers','Wipers and washers operate; washer fluid filled','Clear sweep',false],
        ['Mirrors','Side and interior mirrors present, secure, undamaged','Secure, adjustable',true],
        ['Windows','All windows intact and operate','Intact',false],
        ['Plates & fleet number','Number plates and fleet number clearly visible','Visible',false],
        ['Hi-vis markings','Reflective tape / high-visibility markings intact','Intact',false],
        ['Buggy whip & flag','Whip antenna with flag and light fitted (mine-site LV)','Fitted, light working',true],
        ['Tray, canopy & tow hitch','Tray, canopy, tie-down points, bull bar and tow hitch secure','Secure',false]
      ]),
      b.sec('light','Lighting, Electrical & Warning Devices', [
        ['Headlights','High and low beam','Working',true],
        ['Tail & brake lights','Tail lights and brake lights','Working',true],
        ['Indicators & hazards','Front / rear indicators and hazard lights','Working',true],
        ['Reverse light & alarm','Reverse lights and reverse alarm','Working, audible',true],
        ['Beacon','Rotating / flashing beacon','Working',true],
        ['Horn','Horn','Audible',true],
        ['IVMS / dash camera','In-vehicle monitoring, speed limiter and camera (if fitted)','No fault',false]
      ]),
      b.sec('tyre','Tyres & Wheels', [
        ['Tread & casing','No excessive wear, cuts, bulges or exposed cords','Tread above legal / site minimum',true],
        ['Pressures','Tyre pressures look correct (check with gauge if low)','Per door placard',false],
        ['Wheel nuts','None missing or loose; nut indicators aligned','Secure',true],
        ['Spare & tools','Serviceable spare tyre, jack and wheel brace present','Present',false]
      ]),
      b.sec('eng','Under Bonnet', [
        ['Engine oil','Level on dipstick','Between marks',false],
        ['Coolant','Level in reservoir (engine cold)','At mark',false],
        ['Brake fluid','Level in reservoir','At mark',true],
        ['Power steering fluid','Level (if hydraulic)','At mark',false],
        ['Battery','Secure; terminals clean and tight','Secure',false],
        ['Drive belts','Serviceable, no cracks or fraying','Serviceable',false],
        ['Leaks','No oil, fuel or coolant leaks under bonnet or vehicle','None',true],
        ['Air filter','Restriction indicator (mine LV)','Not in red',false]
      ]),
      b.sec('cab','Cabin & Controls', [
        ['Seatbelts','All seat belts in good condition, retract and lock','All serviceable',true],
        ['Seats','Seats secure and adjustable','Secure',false],
        ['Internal ROPS','Internal roll-over protection intact (if fitted)','No damage or modification',true],
        ['Doors','Doors open, close, latch and lock','Latch correctly',false],
        ['Instruments','Gauges and warning lights working; no active fault lights','No warning lights',true],
        ['A/C & demister','Air conditioning and demister','Working',false]
      ]),
      b.sec('emerg','Safety & Emergency Equipment', [
        ['Fire extinguisher','Present, charged, pin and seal intact, tag current','Charged, tagged',true],
        ['First aid kit','Present and stocked','Stocked',false],
        ['Warning triangles','Triangles / witch\u2019s hats carried','Present',false],
        ['Two-way radio','UHF / two-way radio on correct site channel; radio check done','Clear radio check',true],
        ['Collision avoidance / GPS','Proximity detection or tracking device working','No fault',true],
        ['Wheel chocks','Carried (if required by site)','Present',false],
        ['Spill kit','Carried (if required by site)','Present',false]
      ]),
      b.sec('func','Function Test (engine running, before leaving the bay)', [
        ['Starting','Starts normally; all warning lights go out','No warnings',true],
        ['Service brakes','Brake test at low speed — firm pedal, stops straight','Effective',true],
        ['Park brake','Holds the vehicle in gear on the slope / against light throttle','Holds',true],
        ['Steering','Smooth, no excessive free play, no noise','Normal',true],
        ['4WD / transmission','4WD engages (mine LV); smooth gear changes','Normal',false],
        ['Abnormal noise','No unusual noise, vibration or smell','None',false]
      ]),
      b.sec('hk','General Housekeeping', [
        ['Cab interior','Clean, no loose objects that could jam pedals','Clean',true],
        ['Load','Load in tray restrained; within payload','Restrained',true],
        ['Fuel','Enough fuel for the shift / journey','Sufficient',false]
      ])
    ];
    if (cfg.specific) cfg.specific(b).forEach(x => s.push(x));
    s.push(b.sec('go','Go / No-Go Decision & Declaration', GO_NOGO_ROWS));
    return { id: cfg.id, title: cfg.title,
      dept: 'Prestart — Light Vehicle · site LV standard / ISO 6683 / UN ECE vehicle requirements · complete every shift before driving',
      category: 'prestart', tagPlaceholder: cfg.tag, defaultVisual: true, defaultVibration: false,
      healthScoreApplicable: false, sections: s };
  }

  /* ------------------------------- HME ------------------------------ */
  function psHME(cfg){
    const p = cfg.prefix, b = psBuilder(p);
    const tyreOrTrack = cfg.tracked
      ? ['Tracks','Track tension, shoes, missing / loose bolts, pins and links; rollers not leaking','No missing parts; tension normal',true]
      : ['Tyres','Condition and pressure; no cuts to cords, bulges or rocks between duals','No exposed cords; pressure normal',true];
    const s = [psSafety(p, false),
      b.sec('doc','Documentation, Isolation & Competency', [
        ['Take 5 / JSA','Take 5 / JSA completed for the task','Completed',false],
        ['Isolation tags','No isolation, lockout, Danger or Out of Service tags on the machine','No tags present',true],
        ['Defect register','Previous prestart / defect register reviewed — no outstanding critical defect','No open critical defect',true],
        ['Competency','Operator holds current VOC / licence for this machine','VOC current',true],
        ['Service due','Service hour meter: next PM not overdue','Not overdue',false]
      ], { readings:[['Hour meter (SMU)','h'],['Fuel level','%']] }),
      b.sec('walk','Ground-Level Walk-around', [
        tyreOrTrack,
        [cfg.tracked ? 'Sprockets & idlers' : 'Wheel nuts & rims', cfg.tracked ? 'Sprocket segments, idlers and track guards' : 'Wheel nuts tight, none missing; rims and lock rings not cracked','Secure, no cracks',true],
        ['GET','Teeth, cutting edges, ripper tips secure and within wear limits (if fitted)','Secure, none missing',false],
        ['Structure','No visible cracks on chassis, frame, booms, body or articulation joints','No cracks',true],
        ['Guards & covers','Belt, driveline, fan guards and engine covers fitted and secure','Fitted',true],
        ['Access system','Ladders, steps, handrails, walkways secure, clean and clear','Secure, clean',true],
        ['Leaks','No leaks — engine oil, hydraulic oil, fuel, coolant, transmission','None',true],
        ['Pins, bushes & rams','Attachment pins and keepers fitted; no excessive play; cylinders not leaking','Keepers fitted',false],
        ['Articulation lock','Articulation / steering lock removed and stowed for operation (if applicable)','Stowed',true],
        ['Counterweight','Counterweight secure (if applicable)','Secure',false],
        ['Combustibles','No build-up of dust, grass, oil or rags around engine, turbo and exhaust','Clean',true],
        ['Hoses','No chafed, bulging or leaking hydraulic hoses','Serviceable',true]
      ]),
      b.sec('fluid','Engine Bay & Fluids', [
        ['Engine oil','Level on dipstick / sight glass','Between marks',false],
        ['Coolant','Level in sight glass / expansion tank','At level',false],
        ['Hydraulic oil','Level in sight glass','Within marks',false],
        ['Transmission / final drives','Oil levels / sight glasses (per OEM daily list)','At level',false],
        ['Fuel system','Fuel level adequate; water separator drained; no leaks','No water / leaks',false],
        ['Air filter','Restriction indicator within normal range; pre-cleaner clear','Not in red',false],
        ['Belts & hoses','Fan / alternator belts and radiator hoses serviceable','Serviceable',false],
        ['Battery isolator','Isolator and battery terminals secure','Secure',false],
        ['Fire suppression','Gauge in service range, actuator pins intact, inspection tag current','Gauge in green, tag current',true],
        ['Auto-lube','Grease reservoir level; system operating','Above minimum',false]
      ]),
      b.sec('cab','Cab & Operator Controls', [
        ['Seatbelt','Seatbelt condition; latches and retracts','Serviceable',true],
        ['Seat','Seat and suspension adjust and lock','Functional',false],
        ['ROPS / FOPS','Cab / canopy ROPS-FOPS undamaged, not modified','No damage',true],
        ['Mirrors & cameras','Clean and correctly adjusted','Clear view of blind spots',true],
        ['Glass, wipers & washers','Glass intact; wipers and washers work','Clear view',true],
        ['Horn','Horn','Audible',true],
        ['Reverse / travel alarm','Reverse or travel alarm','Audible',true],
        ['Beacons & strobes','Rotating beacon / strobe lights','Working',true],
        ['Lights','Head, tail, work and brake lights (critical for night shift)','Working',true],
        ['Instruments','Instrument cluster and monitoring display — no active fault codes','No active faults',true],
        ['Hydraulic lockout','Implement lockout lever disables hydraulics','Locks out',true],
        ['Emergency stop','Emergency stop / engine shutdown switch','Stops engine',true],
        ['Fire extinguisher','In-cab extinguisher present, charged and tagged','Charged, tagged',true],
        ['Radio & collision avoidance','Two-way radio check; proximity detection / collision-avoidance system self-test','Working, no fault',true],
        ['Cab cleanliness','No loose objects; door closes and latches','Clean, latches',false]
      ]),
      b.sec('att','Attachment / Bucket / Blade', [
        ['Attachment','Attachment correctly pinned and secured; quick coupler locked (if fitted)','Locked, pinned',true],
        ['Hoses & cylinders','No leaks or damage on attachment hoses and cylinders','No leaks',false],
        ['Cutting edge / teeth','Within wear limits; none missing','Within limits',false]
      ]),
      b.sec('func','Function Test (engine running, in a safe location)', [
        ['Start-up','Starts normally; gauges reach normal; warning lights extinguish','Normal',true],
        ['Hydraulic functions','All functions operate smoothly with no unusual noise or drift','Normal',false],
        ['Steering','Responds correctly in both directions','Normal',true],
        ['Service brake','Service brake test — stops and holds','Effective',true],
        ['Park brake','Park brake holds against light tractive effort per OEM test','Holds',true],
        ['Secondary / emergency brake','Secondary brake / retarder check where OEM requires daily','Functional',true],
        ['Warning devices','Horn, alarms and beacons confirmed with engine running','Working',true],
        ['Noise, vibration, smell','No unusual noise, vibration, smoke or smell','None',false]
      ])
    ];
    if (cfg.specific) s.push(b.sec('spec', cfg.title + ' — Machine-Specific Checks', cfg.specific));
    s.push(b.sec('go','Go / No-Go Decision & Declaration', GO_NOGO_ROWS));
    return { id: cfg.id, title: cfg.title + ' — Prestart',
      dept: 'Prestart — Heavy Mobile Equipment · ISO 20474 / ISO 3450 / ISO 5010 / ISO 6683 / ISO 9533 / AS 5062 / MDG 15 · complete every shift before operating',
      category: 'prestart', tagPlaceholder: cfg.tag, defaultVisual: true, defaultVibration: false,
      healthScoreApplicable: false, sections: s };
  }

  function prestartFleet(){
    return [
      psLV({ id:'ps-lv', title:'Light Vehicle (LV) — Prestart', prefix:'pslv', tag:'e.g. LV-01' }),
      psLV({ id:'ps-bus', title:'Personnel Carrier / Bus — Prestart', prefix:'psbus', tag:'e.g. BUS-01',
        specific: b => [ b.sec('pax','Passenger Safety', [
          ['Passenger seatbelts','Every passenger seat belt latches and retracts','All serviceable',true],
          ['Emergency exits','Emergency doors / windows open; glass hammers present; exit signs visible','Operable, marked',true],
          ['Door interlock','Doors close and lock; door-open interlock / alarm works','Functional',true],
          ['Capacity','Passenger capacity sign displayed; not exceeded','Within capacity',true],
          ['Handrails & steps','Grab handles, steps and interior lights','Secure, working',false]
        ]) ] }),

      psHME({ id:'ps-haul-truck', title:'Rigid Dump / Haul Truck', prefix:'psrht', tag:'e.g. DT-01', specific:[
        ['Dump body','Body fully down and seated on pads; no material hanging over the edges','Seated, clean',true],
        ['Body-up safety','Body safety cable / pin present and stowed','Present',true],
        ['Rock ejectors','Rock ejectors between rear duals present','Present',false],
        ['Suspension','Strut heights visually even; no oil leaks from struts','Even, no leaks',false],
        ['Retarder','Retarder / engine brake check','Functional',true],
        ['Secondary steering','Steering accumulator / secondary steering warning test (per OEM)','No warning',true],
        ['Payload system','Payload display and lights working','Working',false]
      ]}),
      psHME({ id:'ps-adt', title:'Articulated Dump Truck (ADT)', prefix:'psadt', tag:'e.g. ADT-01', specific:[
        ['Articulation lock','Lock removed and stowed','Stowed',true],
        ['Dump body & tailgate','Body down; tailgate / ejector linkage','Secure',true],
        ['Body prop','Body prop present and stowed','Present',true],
        ['Diff locks','Diff locks engage and release','Functional',false],
        ['Hitch','Oscillation hitch — no knocking or visible play','Normal',true]
      ]}),
      psHME({ id:'ps-excavator', title:'Excavator / Mining Shovel', prefix:'psexc', tag:'e.g. EX-01', tracked:true, specific:[
        ['Quick hitch','Coupler locked; secondary lock / pin engaged; test by crowding bucket against the ground','Locked, test passed',true],
        ['Swing brake','Swing park brake holds the upper structure','Holds',true],
        ['Boom & stick','No cracks at boom foot, stick nose and cylinder bosses','No cracks',true],
        ['Slew ring','Slew ring greased; no unusual noise in swing','Normal',false],
        ['Travel alarm','Travel alarm and straight tracking','Working',true],
        ['Lifting duty','If lifting: hose-burst valves fitted, overload alarm working, SWL marked','Compliant or not lifting',true]
      ]}),
      psHME({ id:'ps-dozer', title:'Track-Type Dozer', prefix:'psdoz', tag:'e.g. DZ-01', tracked:true, specific:[
        ['Blade','Cutting edges, end bits, moldboard and push arms — cracks, missing bolts','Secure',false],
        ['Ripper','Ripper tips, shank pin and protectors','Secure',false],
        ['Equalizer bar','Equalizer bar pins — no knocking','Normal',false],
        ['Steering & decelerator','Steering both directions and decelerator pedal','Normal',true],
        ['Belly guards','Belly guards fitted, no packed material','Fitted, clean',true]
      ]}),
      psHME({ id:'ps-wheel-loader', title:'Wheel Loader', prefix:'pswld', tag:'e.g. WL-01', specific:[
        ['Articulation lock','Lock removed and stowed','Stowed',true],
        ['Quick coupler','Coupler locked; indicator shows locked','Locked',true],
        ['Linkage','Lift arm, Z-bar and tilt linkage pins — keepers fitted, no cracks','Secure',false],
        ['Ride control & kickouts','Ride control and lift / bucket kickouts','Functional',false]
      ]}),
      psHME({ id:'ps-grader', title:'Motor Grader', prefix:'psgrd', tag:'e.g. GR-01', specific:[
        ['Articulation lock','Lock removed and stowed','Stowed',true],
        ['Moldboard','Cutting edges, end bits and moldboard','Secure',false],
        ['Circle & drawbar','Circle turns; no knocking at drawbar ball','Normal',false],
        ['Tandems','Tandem housings — no leaks','No leaks',false],
        ['Wheel lean','Wheel lean and front steering','Normal',true]
      ]}),
      psHME({ id:'ps-compactor', title:'Compactor / Roller', prefix:'pscmp', tag:'e.g. CP-01', specific:[
        ['Articulation lock','Lock removed and stowed','Stowed',true],
        ['Drum & scrapers','Drum shell / pads and scrapers','Serviceable',false],
        ['Drum mounts','Rubber isolation mounts — none cracked or missing','Intact',false],
        ['Vibration control','Vibration on/off and auto-off when travel stops','Functional',true]
      ]}),
      psHME({ id:'ps-drill-rig', title:'Surface Drill Rig', prefix:'psdrl', tag:'e.g. DR-01', tracked:true, specific:[
        ['Mast lock pins','Mast lock pins engaged; mast secured for tramming','Engaged',true],
        ['Deck E-stops & guarding','Deck emergency stops and rotating-rod guard / interlock','Functional',true],
        ['Rod handling','Carousel, breakout wrench and rod handling','Functional',false],
        ['Compressor','Compressor oil level; no air leaks','Normal',false],
        ['Dust collector','Dust collector and skirt; water injection','Working',false],
        ['Jacks','Levelling jacks retract fully before tramming','Retracted',true]
      ]}),
      psHME({ id:'ps-water-cart', title:'Water Cart', prefix:'pswtr', tag:'e.g. WC-01', specific:[
        ['Spray system','Spray heads and controls work; no blocked nozzles','Working',false],
        ['Water cannon','Cannon / monitor operation','Working',false],
        ['Tank & ladder','Tank secure, no leaks; ladder and hatch secure','Secure',false],
        ['Speed with partial load','Operator aware of slosh — reduced speed with partial load','Acknowledged',true]
      ]}),
      psHME({ id:'ps-fuel-lube-truck', title:'Fuel & Lube Service Truck', prefix:'psflt', tag:'e.g. FT-01', specific:[
        ['Emergency shut-off','Emergency fuel shut-off and E-stop','Functional',true],
        ['Static bonding','Bonding / earthing reel and clamp','Serviceable',true],
        ['Nozzles & hoses','Hose reels and nozzles — no leaks or damage','No leaks',true],
        ['Extinguishers','Minimum two extinguishers charged and tagged','Present, tagged',true],
        ['Placards & spill kit','Dangerous goods placards displayed; spill kit stocked','Present',true]
      ]}),
      psHME({ id:'ps-mobile-crane', title:'Mobile Crane', prefix:'pscrn', tag:'e.g. CR-01', specific:[
        ['Load moment indicator','RCI / LMI self-test; configuration set for the duty','Correct, no fault',true],
        ['Anti-two-block','Anti-two-block cut-out test','Cuts out',true],
        ['Wire rope','Visual: no broken wires, kinks, birdcaging, crushing','No damage',true],
        ['Hook','Safety latch works; no deformation','Serviceable',true],
        ['Outriggers & pads','Outriggers, pads and holding valves','Serviceable',true],
        ['Load chart & certificate','Load chart in cab; crane certificate current','Present, current',true]
      ]}),
      psHME({ id:'ps-forklift-telehandler', title:'Forklift / Telehandler', prefix:'psflk', tag:'e.g. FL-01', specific:[
        ['Forks','No cracks at heel; locking pins fitted; forks not bent','Serviceable',true],
        ['Mast / boom & chains','Mast channels or boom sections; lift chains lubricated, no damage','Serviceable',true],
        ['Overhead guard','Overhead guard undamaged','No damage',true],
        ['Load indicator','Load moment indicator (telehandler) / capacity plate matches attachment','Correct',true],
        ['Operator restraint','Seat belt / seat switch interlock','Functional',true]
      ]}),
      psHME({ id:'ps-backhoe-tlb', title:'Backhoe Loader (TLB)', prefix:'pstlb', tag:'e.g. TLB-01', specific:[
        ['Stabilisers','Stabilisers raise, lower and hold','Hold',true],
        ['Boom & swing locks','Transport locks removed for work / fitted for travel','Correct position',true],
        ['Quick hitch','Coupler locked; pin fitted','Locked',true],
        ['Backhoe & loader','Boom, dipper, loader arms — no cracks; keepers fitted','Secure',false]
      ]}),
      psHME({ id:'ps-ug-loader-truck', title:'Underground LHD / Haul Truck', prefix:'psugl', tag:'e.g. LHD-01', specific:[
        ['SAHR brake test','Spring-applied brakes apply on engine stop / brake test per OEM','Holds',true],
        ['Canopy / FOPS','Canopy and cab free of rock-fall damage','No damage',true],
        ['Gas monitor','Machine / personal gas monitor bump-tested and on','Working',true],
        ['Tele-remote','Tele-remote E-stop and loss-of-signal stop (if fitted)','Stops machine',true],
        ['Tag-board / tracking','Personnel / vehicle tracking tag working','Working',false],
        ['Articulation lock','Lock removed and stowed','Stowed',true]
      ]}),
      psHME({ id:'ps-explosives-charger', title:'Explosives Charger', prefix:'pschg', tag:'e.g. CH-01', specific:[
        ['Basket controls','Basket and ground controls, dead-man and E-stops','Functional',true],
        ['Emergency lowering','Emergency / auxiliary lowering','Functional',true],
        ['Static earthing','Earthing strap / chain and loading-hose condition','Serviceable',true],
        ['Emulsion pump cut-outs','Dry-run, high-temperature and high-pressure cut-outs','Functional',true],
        ['Detonator box','Locked and segregated from bulk product','Locked',true],
        ['Placards & beacon','Explosives placards and beacon displayed','Displayed',true]
      ]}),
      psHME({ id:'ps-hme-other', title:'Other Mobile Plant (generic)', prefix:'psoth', tag:'e.g. Asset No.' })
    ];
  }

  prestartFleet().forEach(e => EQUIPMENT.push(e));

