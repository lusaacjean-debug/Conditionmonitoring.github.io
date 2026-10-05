/* CM Inspect — checklists/40-process-plant.js
   Process plant: pressure equipment, acid plant, kiln, filters, valves, electrical, safety systems.
   Loaded as a classic script; shares global scope with the other files
   (load order is defined in index.html). © Lotus Africa — internal use only. */
'use strict';
  /* =====================================================================
     PROCESS PLANT — ADDITIONAL CHECKLISTS
     Pressure equipment, acid plant, kiln, filters, valves, dust control,
     cooling towers, electrical & instrumentation, lifting and emergency
     systems. Same detailed format (component / checkpoint / acceptance /
     frequency + Findings & Corrective Action). Thickness CMLs use the
     built-in corrosion-rate / remaining-life calculator.
     ===================================================================== */

  function plantSafety(prefix, extras){
    const lines = [
      'Conduct JSA / Take 5; obtain the permit to work required for the task (cold work, hot work, confined space, electrical)',
      'Notify the control room / area supervisor before starting the inspection',
      'Apply LOTO and verify zero energy for any hands-on or internal inspection (electrical, mechanical, process isolation)',
      'PPE: hard hat, safety glasses, gloves, safety boots, hi-vis, hearing protection in high-noise areas',
      'Safe access confirmed: scaffold tagged, fall protection above 1.8 m, exclusion zone below the work area',
      'Confined space: gas test (O2, SO2, LEL, toxic) and standby person before entry, where applicable',
      'Know the location of the nearest safety shower / eyewash, fire extinguisher and emergency assembly point'
    ];
    (extras || []).forEach(l => lines.push(l));
    return plainSafety(prefix, 'Section 1 — Pre-Inspection Safety, Isolation & Access', lines);
  }
  const ACID_PPE = 'Acid service: acid-resistant suit, face shield, gauntlets and boots when within reach of acid lines / flanges; line drained, flushed and neutralised before opening';
  const HV_PPE = 'Electrical: only authorised persons; arc-flash PPE to the incident-energy label; approach boundaries observed (NFPA 70E / IEEE 1584); test before touch';
  const RAD_PPE = 'Radiation / uranium dust: follow the Radiation Management Plan — personal dosimeter, P3 respirator for dust tasks, contamination survey before leaving the area';
  const DRIVE_TYPES_ALL = ['Belt Drive'].concat(TRUE_COUPLING_TYPES).concat(['Direct Drive','Not Applicable']);

  function plantChecklists(){
    const L = [];

    /* 1 — Pressure vessel & heat exchanger --------------------------- */
    (function(){ const p='pvhx', b=cmBuilder(p);
      L.push({ id:'pressure-vessel-hx', title:'Pressure Vessel & Heat Exchanger Inspection',
        dept:'Static — API 510 / API 572 / ASME VIII Div.1 / TEMA / API 579-1 FFS / statutory pressure equipment regulations',
        category:'static', tagPlaceholder:'e.g. V-101 / E-201', defaultVisual:true, defaultVibration:false, sections:[
        plantSafety(p,[ACID_PPE,'Vessel depressurised, drained, purged and positively isolated (blinds / spades) before any internal inspection']),
        b.sec('doc','Registration, Design Data & Inspection Plan', [
          ['Registration','Vessel registered with the authority; certificate of inspection current','Valid certificate on file','A'],
          ['Nameplate','Nameplate legible: MAWP, design temperature, MDMT, year, code stamp, serial','Legible, matches data book','A'],
          ['Data book','Design calculations, materials, corrosion allowance, drawings available','Complete','A'],
          ['Inspection plan','Inspection interval (internal / external / on-stream) and RBI assessment current','Within interval; plan approved','A'],
          ['Damage mechanisms','Credible damage mechanisms identified for the service (API 571: e.g. sulphuric acid corrosion, hydrogen grooving, CUI, erosion)','Documented','A'],
          ['Repairs & alterations','All repairs / re-ratings approved by the inspector and recorded (R-stamp or equivalent)','Documented','A'],
          ['Operating envelope','Operating pressure and temperature within design; no excursions since last inspection','Within envelope','6M']
        ]),
        b.sec('ext','External Shell, Heads, Supports & Foundation', [
          ['Shell & heads','General corrosion, pitting, bulging, dents, weld cracking','No defects outside FFS limits','6M'],
          ['Welds','Visible weld seams and nozzle welds — cracking, undercut, leaks','No cracks','6M'],
          ['Supports','Saddles, legs, skirt, lugs — corrosion, cracking, sliding saddle free','Sound; sliding end free','A'],
          ['Foundation & anchor bolts','Concrete cracking, grout, anchor bolt corrosion / looseness','Sound, tight','A'],
          ['Insulation & CUI','Jacketing damage, water ingress, wet insulation; CUI-prone locations (supports, nozzles, 0–175°C band)','Intact; suspect areas opened / NDT','A'],
          ['Coating','Paint / lining breakdown','Rated ≤ Ri 2','A'],
          ['Earthing','Earth bonding connection','Intact','A']
        ]),
        b.sec('noz','Nozzles, Flanges, Bolting & Small-Bore', [
          ['Flanged joints','Leaks, gasket extrusion, flange face corrosion','No leaks','M'],
          ['Bolting','Bolt corrosion, full thread engagement, correct grade','≥ flush engagement; no wastage','A'],
          ['Small-bore connections','Vents, drains, instrument tappings — vibration, support, corrosion','Supported, no fatigue signs','6M'],
          ['Manways','Manway covers, davits, gaskets','Sound','A'],
          ['Acid service nozzles','Inlet nozzles / impingement areas in acid service — localised thinning, hydrogen grooving','UT within t-min','A']
        ]),
        b.sec('prot','Overpressure Protection & Instruments', [
          ['PSV fitted','PSV fitted, set ≤ MAWP, sized for the governing case, test current','Compliant; see PSV checklist','6M'],
          ['Isolation valves','Valves under / downstream of PSV car-sealed or locked open (CSO / LO)','Sealed open, registered','M'],
          ['Pressure gauge','Pressure gauge fitted, readable, calibrated, MAWP marked red','In calibration','A'],
          ['Temperature & level','Temperature and level indication working','Functional','6M'],
          ['Vacuum protection','Vacuum breaker / design for full vacuum where steam-out or cooling can occur','Fitted or by design','A']
        ], { readingNote:'design data / nameplate', readings:[['Operating pressure','bar'],['MAWP','bar'],['Operating temperature','°C']] }),
        b.sec('hx','Heat Exchanger Performance & Leaks', [
          ['Tube leaks','No cross-contamination — check cooling water pH / conductivity / acid ingress, product contamination','No leak indication','W'],
          ['Thermal performance','Inlet / outlet temperatures and approach vs. clean design (fouling)','Within 10% of design duty','M'],
          ['Pressure drop','Shell and tube side ΔP vs. design','Within design','M'],
          ['Plate heat exchangers','Plate pack tightening dimension, frame bolts, gasket weeps','Within OEM A-dimension; no weeps','M'],
          ['Channel & covers','Channel head, floating head, cover bolting','No leaks','6M']
        ], { readingNote:'design data sheet', readings:[['Hot in','°C'],['Hot out','°C'],['Cold in','°C'],['Cold out','°C'],['Shell ΔP','bar'],['Tube ΔP','bar']] }),
        b.sec('int','Internal Inspection (when opened)', [
          ['Shell internals','Corrosion, pitting, cracking, erosion, lining / cladding condition','Within FFS limits','Each opening'],
          ['Internals','Baffles, trays, distributors, supports, demisters','Secure, intact','Each opening'],
          ['Tube bundle','Tube OD/ID condition, eddy-current / IRIS results, tube-sheet ligaments','Wall loss within limit','Each opening'],
          ['Tube plugging','Number / % of plugged tubes','Below design margin (typ. < 10%)','Each opening'],
          ['Wet fluorescent MT / PT','Crack detection at welds where cracking mechanism is credible','No linear indications','Each opening']
        ]),
        b.thick('cml','UT Thickness — Condition Monitoring Locations', ['CML-1 Shell top','CML-2 Shell bottom','CML-3 Head 1','CML-4 Head 2','CML-5 Inlet nozzle','CML-6 Outlet nozzle']),
        b.sec('test','Pressure Test & Fitness for Service', [
          ['Pressure test','Hydrostatic / pneumatic test after repair per code (procedure, test pressure, hold time)','Passed, witnessed','Event'],
          ['Fitness for service','Any defect outside code assessed per API 579-1 / ASME FFS-1','Assessment approved','Event'],
          ['Next inspection date','Next internal / external inspection date set from corrosion rate (≤ half remaining life)','Set and recorded in CMMS','Each insp.']
        ]),
        b.sec('rel','Release, Reporting & Sign-off', RELEASE_ROWS),
        b.rating(['Shell & Heads','Nozzles & Bolting','Supports & Foundation','Overpressure Protection','Heat Exchanger Performance','Internals','Overall Vessel Condition'])
      ]}); })();

    /* 2 — Pressure safety valves -------------------------------------- */
    (function(){ const p='psv', b=cmBuilder(p);
      L.push({ id:'psv-inspection', title:'Pressure Safety Valve (PSV) Inspection & Test',
        dept:'Static — API 576 / API 520 / API 521 / API 527 / ISO 4126 / ASME VIII UG-125',
        category:'static', tagPlaceholder:'e.g. PSV-101', defaultVisual:true, defaultVibration:false, sections:[
        plantSafety(p,['Protected equipment safe before removing a PSV (shut down and depressurised, or alternate PSV in service)', ACID_PPE]),
        b.sec('reg','Register & Documentation', [
          ['Register entry','PSV in register: tag, protected equipment, set pressure, capacity, size, orifice','Complete','A'],
          ['Set pressure','Set pressure ≤ MAWP of protected equipment (accumulation per code)','Compliant','A'],
          ['Sizing basis','Relief case and sizing calculation on file (API 520 / 521)','On file','A'],
          ['Test interval','Last test date and interval (risk-based, typ. ≤ 24–36 months)','Not overdue','M'],
          ['Tag & seal','Metal tag with set pressure and test date; lead seal on bonnet / adjustments','Present, intact','M']
        ], { readingNote:'register data', readings:[['Set pressure','bar'],['MAWP of protected equipment','bar']] }),
        b.sec('inst','Installation (in service)', [
          ['Inlet isolation','Inlet / outlet block valves car-sealed or locked open','Sealed open','M'],
          ['Inlet line','Inlet pressure drop < 3% of set (by design); no pocketing','Compliant','A'],
          ['Discharge','Discharge to safe location; tailpipe supported; rain cap; drain / weep hole clear','Safe, clear','6M'],
          ['Bellows vent','Bellows bonnet vent open (balanced bellows valves)','Open, not plugged','6M'],
          ['Rupture disc','Disc burst indicator / tell-tale gauge between disc and PSV reads zero','Zero, no leak','M'],
          ['Lever','Lift lever (where fitted) free and secured','Free','6M']
        ]),
        b.sec('cond','In-Service Condition', [
          ['Leakage / simmer','Valve passing or simmering — acoustic / IR check of outlet','No passing','M'],
          ['External corrosion','Body, bonnet, spring, bolting corrosion','Sound','6M'],
          ['Process fouling','Signs of product deposition (acid, sulphur, slurry) at inlet','Clear','Each test'],
          ['Vibration / chatter history','Operator reports of chatter or frequent lifting','None','M']
        ]),
        b.sec('bench','Bench Test & Overhaul', [
          ['As-received test','Pop test before cleaning — record as-received lift pressure','Within ±3% of set (or code tolerance)','Each test'],
          ['Internals','Disc, nozzle, seat, guide, spring, bellows — erosion, corrosion, deposits','Serviceable or replaced','Each test'],
          ['Seat lapping','Seats lapped; spring correct for set range','Done','Each test'],
          ['Set pressure test','Final set pressure test (3 consistent pops)','Within ±3% (≥ 0.15 bar below 5 bar)','Each test'],
          ['Seat tightness','Seat tightness test per API 527','Within allowable bubbles/min','Each test'],
          ['Certificate','Test certificate issued; register and CMMS updated','Issued','Each test']
        ], { readingNote:'API 527 / ISO 4126', readings:[['As-received pop','bar'],['Final set pressure','bar'],['Reseat / blowdown','bar']] }),
        b.sec('rel','Release, Reporting & Sign-off', RELEASE_ROWS),
        b.rating(['Installation','In-Service Condition','Bench Test Result','Overall PSV Condition'])
      ]}); })();

    /* 3 — Sulphur furnace & waste heat boiler ------------------------- */
    (function(){ const p='sfb', b=cmBuilder(p);
      L.push({ id:'sulphur-furnace-whb', title:'Sulphur Furnace & Waste Heat Boiler',
        dept:'Static — ASME I / statutory boiler regulations / NFPA 85 (BMS) / API 936 (refractory) / API 573 / site boiler water treatment program',
        category:'static', tagPlaceholder:'e.g. Acid Plant SF-01 / WHB-01', defaultVisual:true, defaultVibration:false, sections:[
        plantSafety(p,['SO2 / SO3 exposure: personal SO2 monitor worn; escape respirator carried in the acid plant','Molten sulphur (~140°C) and steam lines: burn PPE; no contact with jackets; H2S may accumulate in sulphur pits — gas test']),
        b.sec('doc','Statutory & Documentation', [
          ['Boiler certificate','Boiler registration and certificate of inspection current','Valid','A'],
          ['Boiler operator','Boiler attended by certificated / competent operator; log sheets complete','Compliant','D'],
          ['Water treatment','Water treatment program and lab results available','Current','W'],
          ['Previous findings','Previous internal inspection / refractory survey findings tracked','Closed or tracked','A']
        ]),
        b.sec('bms','Sulphur Burner & Burner Management System (BMS)', [
          ['Sulphur gun / atomisation','Sulphur gun spray pattern, atomising air / steam, no dripping','Fine spray, stable flame','D'],
          ['Combustion air','Main blower running, air flow vs. sulphur rate (O2 / SO2 strength)','Within operating window','D'],
          ['Flame supervision','Flame scanner / furnace temperature permissive healthy','No faults','W'],
          ['Pre-heat burner','Diesel / LPG preheat burner, ignition, valves (for start-up)','Functional, isolated when not used','M'],
          ['Trips','BMS trips: low air flow, low furnace temp, high pressure, sulphur pump fail — function tested','Trip at set point','6M'],
          ['Sulphur supply','Steam-jacketed lines / valves hot, no freezing or leaks; sulphur pump and filter','Sulphur flowing, no leaks','D']
        ], { readingNote:'operating manual', readings:[['Furnace outlet gas temp','°C'],['SO2 strength','%'],['Sulphur flow','t/h']] }),
        b.sec('shell','Furnace Shell & Refractory', [
          ['Shell hot spots','IR scan of furnace shell, ends and burner front — hot spots indicate refractory failure','No hot spot above design (record max)','W'],
          ['Gas leaks','SO2 leaks at flanges, manholes, sight glasses (detector / smell)','No leaks','D'],
          ['Shell condition','Corrosion (acid dew-point on cold areas), bulging, coating','Sound','M'],
          ['Expansion & supports','Sliding supports, expansion joints, shell rain protection','Free, intact','6M'],
          ['Refractory (internal)','Brick / castable: spalling, cracks, erosion, checker wall / baffles','Within OEM limits','A']
        ], { readingNote:'design shell temperature', readings:[['Shell max temp','°C'],['Burner front max','°C']] }),
        b.sec('whb','Waste Heat Boiler — Pressure Parts & Controls', [
          ['Drum level','Gauge glasses clear, both agree with transmitter; blow-down of gauge glass','Agree within ±25 mm','D'],
          ['Low-level trip','Low-low drum level trip / water column test','Trips','W'],
          ['Safety valves','Boiler safety valves sealed, tested within interval; lift test where required','Current','A'],
          ['Feedwater pumps','Duty / standby pumps, auto-changeover, seals, vibration','Healthy','W'],
          ['Blowdown','Continuous and intermittent blowdown working','Per schedule','D'],
          ['Tube leaks','No tube leak indicators (rising make-up, steam in gas side, wet ash)','None','D'],
          ['Superheater / economiser','Inlet / outlet temperatures, ΔT, leaks','Within design','D'],
          ['Steam pressure control','Pressure control and steam vent / dump','Stable','D']
        ], { readingNote:'boiler operating limits', readings:[['Drum pressure','bar'],['Drum level','%'],['Feedwater flow','t/h'],['Steam flow','t/h']] }),
        b.sec('wc','Boiler Water Chemistry', [
          ['Feedwater','Feedwater pH, dissolved O2, hardness','Within treatment limits','D'],
          ['Boiler water','Boiler water pH, conductivity, phosphate / alkalinity, silica','Within treatment limits','D'],
          ['Deaerator','Deaerator pressure / temperature, vent','Within design','D'],
          ['Chemical dosing','Dosing pumps and tanks','Running, stocked','D']
        ], { readingNote:'water treatment program', readings:[['Boiler water pH','pH'],['Conductivity','µS/cm'],['Feedwater O2','ppb']] }),
        b.thick('cml','UT Thickness — Drum, Headers & Shell CMLs', ['Steam drum','Mud drum / lower header','Furnace shell — burner end','Furnace shell — outlet end','Boiler outlet duct']),
        b.sec('rel','Release, Reporting & Sign-off', RELEASE_ROWS),
        b.rating(['Burner & BMS','Furnace Shell & Refractory','Boiler Pressure Parts','Boiler Controls & Safety Valves','Water Chemistry','Overall Furnace & Boiler'])
      ]}); })();

    /* 4 — Converter, towers & acid coolers ---------------------------- */
    (function(){ const p='cta', b=cmBuilder(p);
      L.push({ id:'converter-towers-acid-coolers', title:'Converter, Drying / Absorption Towers & Acid Coolers',
        dept:'Static — NACE SP0294 / MECS & Chemetics practice / API 510 / ASME VIII / anodic protection OEM / API 579-1',
        category:'static', tagPlaceholder:'e.g. CNV-01 / IPAT-01 / AC-01', defaultVisual:true, defaultVibration:false, sections:[
        plantSafety(p,[ACID_PPE,'SO2 / SO3 / acid mist: personal SO2 monitor and escape respirator; never stand in line with acid flanges under pressure']),
        b.sec('conv','Converter (Catalyst Beds)', [
          ['Pass temperatures','Inlet / outlet temperature each pass vs. design; ΔT per bed','Within design window','D'],
          ['Bed pressure drop','ΔP across each bed (dust / catalyst fouling)','Below screening trigger','W'],
          ['Shell hot spots','IR scan of shell, posts, nozzles — hot spots / insulation loss','No hot spot (record max)','M'],
          ['Gas leaks','SO2 leaks at manholes, flanges, expansion joints','None','D'],
          ['Expansion joints','Bellows condition, tie rods, distortion','Sound','6M'],
          ['Catalyst screening','Catalyst screening / top-up at shutdown; ignition behaviour','Per plan','A']
        ], { readingNote:'design pass temperatures', readings:[['Pass 1 in','°C'],['Pass 1 out','°C'],['Pass 2 in','°C'],['Pass 2 out','°C'],['Pass 3 in','°C'],['Pass 3 out','°C'],['Pass 4 in','°C'],['Pass 4 out','°C']] }),
        b.sec('tow','Drying & Absorption Towers', [
          ['Acid strength','Circulating acid strength (drying ~93–96%, absorption ~98.5%)','Within operating window','D'],
          ['Acid temperature','Acid inlet / outlet temperatures','Within design','D'],
          ['Tower ΔP','Packing pressure drop','Below trigger (fouling / collapse)','W'],
          ['Mist eliminators','Candle filter ΔP; visible stack mist / plume','ΔP within range; no visible mist','D'],
          ['Shell seepage','Acid weeping / staining on shell (brick lining failure)','No seepage','W'],
          ['Distributor & packing','Distributor troughs, packing support, brick lining (internal)','Intact, level','A'],
          ['Pump tanks','Pump tank level, vertical acid pumps (see Acid Vertical Pump checklist)','Normal','D']
        ], { readingNote:'operating manual', readings:[['Drying acid strength','%'],['Absorption acid strength','%'],['Drying tower ΔP','mbar'],['Absorption tower ΔP','mbar'],['Mist eliminator ΔP','mbar']] }),
        b.sec('ac','Acid Coolers & Anodic Protection', [
          ['Anodic protection','Potential within protection band; rectifier current normal; alarms healthy','Within band (record mV)','D'],
          ['Reference electrodes','Reference electrode readings agree; cable connections','Agree','M'],
          ['Cooling water acid ingress','Cooling water pH / conductivity downstream of coolers (tube leak detection)','No drop in pH / rise in conductivity','D'],
          ['Cooler performance','Acid in / out and water in / out temperatures; approach','Within design','W'],
          ['Leaks','Flanges, channel, tube-sheet','No leaks','D']
        ], { readingNote:'anodic protection OEM', readings:[['AP potential','mV'],['AP current','A'],['CW outlet pH','pH'],['Acid in','°C'],['Acid out','°C']] }),
        b.sec('stk','Emissions & Acid Piping', [
          ['Stack SO2','Stack SO2 concentration / conversion efficiency','Within permit limit','D'],
          ['Acid piping','Acid lines: leaks, staining, supports, hydrogen grooving at elbows (UT)','No leaks; UT within t-min','M'],
          ['Product acid','Product acid strength and storage tank level','Within spec','D']
        ], { readingNote:'environmental permit', readings:[['Stack SO2','ppm'],['Conversion','%']] }),
        b.thick('cml','UT Thickness — Shells, Coolers & Acid Piping', ['Drying tower shell','Absorption tower shell','Acid cooler shell','Acid line elbow 1','Acid line elbow 2']),
        b.sec('rel','Release, Reporting & Sign-off', RELEASE_ROWS),
        b.rating(['Converter','Drying Tower','Absorption Tower','Acid Coolers & Anodic Protection','Acid Piping','Overall Acid Plant Section'])
      ]}); })();

    /* 5 — Dust collectors, baghouses & scrubbers ---------------------- */
    (function(){ const p='dcs', b=cmBuilder(p);
      L.push({ id:'dust-collector-scrubber', title:'Dust Collector, Baghouse & Wet Scrubber',
        dept:'Static — ACGIH Industrial Ventilation / ISO 16890 / environmental permit / Radiation Management Plan / OEM',
        category:'static', tagPlaceholder:'e.g. DC-01 / SCR-01', defaultVisual:true, defaultVibration:false, sections:[
        plantSafety(p,[RAD_PPE,'Bag changes: collector isolated, fan locked out, hopper emptied; confined-space rules for plenum entry']),
        b.sec('perf','Performance & Emissions', [
          ['Differential pressure','ΔP across bags / cartridges','Within OEM band (typ. 1–1.5 kPa)','D'],
          ['Stack emissions','Opacity / particulate monitor; no visible plume','Within permit','D'],
          ['Broken bag detector','Triboelectric detector reading and alarm','No alarm','D'],
          ['Hood capture','Extraction at pick-up points (no dust escape at hoods)','Capture effective','W'],
          ['Duct velocity','Duct velocity / static pressure (no settling)','Per design','6M']
        ], { readingNote:'OEM / permit', readings:[['Baghouse ΔP','kPa'],['Fan current','A'],['Stack particulate','mg/Nm³']] }),
        b.sec('pulse','Pulse-Jet Cleaning System', [
          ['Header pressure','Compressed air header pressure; air dryer / drain','Per OEM (typ. 5–6 bar)','D'],
          ['Solenoids & diaphragms','All valves fire in sequence; no leaking diaphragms','All firing','W'],
          ['Controller','Cleaning sequence, on-demand ΔP settings','Correct','M'],
          ['Blowpipes','Alignment with bag centres','Aligned','A']
        ], { readingNote:'OEM', readings:[['Pulse header pressure','bar']] }),
        b.sec('bags','Bags, Cages & Housing', [
          ['Bags / cartridges','Holes, wear at cuff, blinding, moisture / caking','No holes; replace at life','6M'],
          ['Cages','Corrosion, bent wires','Serviceable','Each change'],
          ['Tube sheet & seals','Tube-sheet leaks (dust in clean plenum)','Clean plenum','6M'],
          ['Housing','Doors, seals, corrosion, explosion vent (if fitted)','Sealed, sound','M'],
          ['Hopper & discharge','Hopper level, rotary valve / screw, bridging, heaters','Discharging freely','D']
        ]),
        b.sec('scr','Wet Scrubber (where fitted)', [
          ['Liquor flow','Recirculation flow and nozzle pattern','Per design','D'],
          ['Liquor chemistry','pH / density of scrubbing liquor (e.g. caustic for SO2)','Within control range','D'],
          ['Mist eliminator','Mist eliminator ΔP and wash','Within range','W'],
          ['Recirc pump','Pump, seal, vibration','Healthy','W'],
          ['Packing / internals','Packing fouling, distributor (internal)','Clean','A']
        ], { readingNote:'design', readings:[['Liquor pH','pH'],['Liquor flow','m³/h'],['Scrubber ΔP','mbar']] }),
        b.sec('fan','Exhaust Fan & Ducting', [
          ['Fan','Vibration, bearing temperature, belt / coupling (see Centrifugal Fan checklist)','ISO 20816 zone A/B','M'],
          ['Ducting','Holes, wear at bends, build-up, dampers','Sound, dampers free','6M']
        ], { readingNote:'ISO 20816', readings:[['Fan DE vibration','mm/s'],['Fan NDE vibration','mm/s']] }),
        b.sec('rad','Radiation & Contamination Control (uranium product areas)', [
          ['Area survey','Radiation / contamination survey after opening the collector','Within RMP limits','Each opening'],
          ['Waste bags','Spent bags bagged, labelled and disposed per RMP','Compliant','Each change'],
          ['Air monitoring','Workplace air sampling result for the area','Below action level','M']
        ]),
        b.sec('rel','Release, Reporting & Sign-off', RELEASE_ROWS),
        b.rating(['Filtration Performance','Pulse Cleaning','Bags & Housing','Scrubber','Fan & Ducting','Overall Dust Control'])
      ]}); })();

    /* 6 — Valves ------------------------------------------------------ */
    (function(){ const p='vlv', b=cmBuilder(p);
      L.push({ id:'valve-inspection', title:'Valve Inspection — Slurry, Isolation & Control Valves',
        dept:'Static — API 598 / IEC 60534 / ISA-75 / MSS SP-81 (knife gate) / IEC 61511 (SIS valves) / OEM',
        category:'static', tagPlaceholder:'e.g. XV-201 / FCV-301', defaultVisual:true, defaultVibration:false, sections:[
        plantSafety(p,[ACID_PPE,'Pneumatic / hydraulic actuators: supply isolated and vented; spring-return actuators have stored energy']),
        b.sec('id','Identification & Position', [
          ['Tag & ID','Valve tag, line number and flow direction marked','Legible','A'],
          ['Position indication','Local indicator matches actual and DCS / SCADA position','Agree','M'],
          ['Lockability','Isolation valves can be locked for LOTO','Lockable','A']
        ]),
        b.sec('body','Body, Bonnet & Packing', [
          ['Body / bonnet leaks','External leakage at body, bonnet, flanges','None','M'],
          ['Packing gland','Packing leakage; gland follower adjustment remaining','No leak; adjustment available','M'],
          ['Corrosion / erosion','External corrosion, erosion holes (slurry)','Sound','6M'],
          ['Bolting','Body and flange bolting','Tight, not corroded','A']
        ]),
        b.sec('slurry','Slurry Valves (Knife Gate / Pinch)', [
          ['Knife gate','Gate travel, gland (transverse seal) leakage, scraper','Full travel; no leak','M'],
          ['Seat / sleeve wear','Seat / elastomer sleeve wear and passing','Within OEM limit','6M'],
          ['Pinch sleeve','Pinch sleeve cracking, bulging','Sound','M'],
          ['Flushing','Flush ports / water connected and working','Working','M']
        ]),
        b.sec('act','Actuator & Accessories', [
          ['Air supply','Supply pressure, filter-regulator drained, tubing leaks','Per spec; no leaks','M'],
          ['Solenoid valve','Solenoid operates; coil temperature','Functional','6M'],
          ['Limit switches','Open / closed limit switches set and signalled','Correct','6M'],
          ['Electric actuator (MOV)','Torque / limit settings, handwheel, heater, cover seals','Correct','A'],
          ['Manual override','Handwheel / override operates and is declutched','Functional','A']
        ], { readingNote:'valve data sheet', readings:[['Supply pressure','bar'],['Stroke time open','s'],['Stroke time close','s']] }),
        b.sec('ctrl','Control Valve Performance', [
          ['Stroke test','Full stroke test — no sticking or hunting','Smooth','6M'],
          ['Step response','Positioner step response / diagnostic signature','Within baseline','A'],
          ['Positioner calibration','Positioner calibrated 0–100%','±1% of span','A'],
          ['Partial stroke (SIS)','Partial stroke test for SIS valves; full stroke at proof test','Pass','per SRS']
        ]),
        b.sec('pass','Seat Leakage / Passing', [
          ['Passing check','Downstream pressure / temperature / acoustic check for passing when closed','No passing','6M'],
          ['Bench seat test','Seat test per API 598 / IEC 60534-4 class after overhaul','Meets class','Each overhaul']
        ]),
        b.sec('rel','Release, Reporting & Sign-off', RELEASE_ROWS),
        b.rating(['Body & Packing','Seat / Sleeve','Actuator','Control Performance','Overall Valve Condition'])
      ]}); })();

    /* 7 — Horizontal belt filter (rotating) --------------------------- */
    (function(){ const p='hbf', b=cmBuilder(p, { plain:true });
      L.push({ id:'horizontal-belt-filter', title:'Horizontal Vacuum Belt Filter',
        dept:'Rotating — OEM manual / ISO 20816 / AS 4024.1 (guarding) / CEMA',
        category:'rotating', driveCouplingField:true, driveTypeOptions: DRIVE_TYPES_ALL,
        tagPlaceholder:'e.g. BF-01', defaultVisual:true, defaultVibration:true,
        sections:[plantSafety(p,[ACID_PPE])].concat(buildMotorSections(p+'_mtr'), buildCouplingSections(p+'_cpl'), [
          b.sec('belt','C. Rubber Carrier Belt & Wear Belts', [
            ['Carrier belt','Carcass, drainage grooves, edges, splice','No cracks or tears','W'],
            ['Wear belts','Wear belt thickness and lubrication water','Within wear limit','W'],
            ['Vacuum box seal','Vacuum box, wear strips, seal water','No air leaks','W'],
            ['Belt tracking','Carrier belt tracking and skirts','Central','D']
          ]),
          b.sec('cloth','D. Filter Cloth', [
            ['Cloth condition','Holes, blinding, tears, seam','No holes; permeability OK','D'],
            ['Cloth tracking','Auto-tracking sensor and actuator','Tracks central','D'],
            ['Cloth tension','Tensioner (pneumatic / weight)','Correct','W'],
            ['Cloth wash','Wash sprays nozzles and pressure','All nozzles spraying','D']
          ]),
          b.sec('vac','E. Vacuum System & Filtrate', [
            ['Vacuum level','Vacuum at box','Within design','D'],
            ['Vacuum pump','Liquid-ring pump: seal water, vibration, bearing temp','Healthy','W'],
            ['Filtrate receiver','Level control, filtrate pump, drop leg seal','Not flooding','D'],
            ['Vacuum lines','Leaks at hoses and joints','None','W']
          ], { readingNote:'design', readings:[['Vacuum','kPa(a)'],['Seal water flow','L/min'],['Cake moisture','%']] }),
          b.sec('drive','F. Drive Drum, Rollers & Discharge', [
            ['Drive drum','Lagging, bearings temp, alignment','Sound','M'],
            ['Rollers & idlers','Free rotation, scraping','Free','W'],
            ['Cake discharge','Discharge roller / scraper, chute','Clean discharge','D'],
            ['Feed box','Feed distributor and weir','Even distribution','D']
          ]),
          b.sec('safe','G. Guarding & Emergency Stops', [
            ['Guards','Nip-point guards on drums and rollers (AS 4024.1)','Fitted','W'],
            ['Pull-wires & E-stops','Pull-wire and E-stop trip test','Stops filter','M']
          ]),
          b.sec('rel','H. Release, Reporting & Sign-off', RELEASE_ROWS),
          b.rating(['Motor & Drive','Carrier Belt','Filter Cloth','Vacuum System','Guarding','Overall Filter Condition'])
        ])}); })();

    /* 8 — Filter press ------------------------------------------------- */
    (function(){ const p='fpr', b=cmBuilder(p);
      L.push({ id:'filter-press', title:'Filter Press (Plate & Frame / Membrane)',
        dept:'Rotating — OEM manual / ISO 4413 (hydraulics) / ISO 13849 & AS 4024 (safeguarding)',
        category:'rotating', tagPlaceholder:'e.g. FP-01', defaultVisual:true, defaultVibration:false, sections:[
        plantSafety(p,[ACID_PPE,'Hydraulic closing system: press opened and hydraulic pressure released before working between plates; never reach past light curtain']),
        b.sec('hyd','Hydraulic Closing System', [
          ['Closing pressure','Closing pressure reached and held through the cycle','Per OEM','D'],
          ['Hydraulic pack','Oil level, temperature, filter, leaks','Normal','W'],
          ['Cylinder & ram','Ram rod, seals, mechanical lock nut','No leaks','M'],
          ['Pressure relief','Relief valve setting','Per OEM','A']
        ], { readingNote:'OEM', readings:[['Closing pressure','bar'],['Hydraulic oil temp','°C']] }),
        b.sec('pl','Plates, Membranes & Cloths', [
          ['Plates','Cracks, sealing faces, handles, porting','No cracks','Each cycle visual / W'],
          ['Membranes','Squeeze membrane leaks / tears','Intact','W'],
          ['Cloths','Holes, blinding, seating on sealing faces','Sealed','D'],
          ['Cloth wash','Wash bar / high-pressure wash','Working','W']
        ]),
        b.sec('frame','Frame, Side Bars & Plate Shifter', [
          ['Side bars','Side bar wear strips, alignment','Within limit','M'],
          ['Head & tail stock','Cracks, fixings','Sound','A'],
          ['Plate shifter','Chain / shuttle drive operation','Smooth','W']
        ]),
        b.sec('feed','Feed, Squeeze & Core Blow', [
          ['Feed pressure','Feed pump pressure profile','Per cycle design','D'],
          ['Squeeze system','Squeeze water / air pressure','Per design','D'],
          ['Core blow','Core blow air and valves','Working','D'],
          ['Drip trays / bomb doors','Drip trays open / close; seals','Functional','D']
        ], { readingNote:'cycle design', readings:[['Feed pressure','bar'],['Squeeze pressure','bar'],['Cycle time','min'],['Cake moisture','%']] }),
        b.sec('safe','Safeguarding', [
          ['Light curtain','Light curtain / safety bar stops plate movement (ISO 13849)','Stops movement','W'],
          ['E-stops & interlocks','E-stops and gate interlocks','Functional','M'],
          ['Splash guards','Splash curtains fitted (acid filtrate)','Fitted','D']
        ]),
        b.sec('rel','Release, Reporting & Sign-off', RELEASE_ROWS),
        b.rating(['Hydraulic System','Plates & Cloths','Frame & Shifter','Feed & Squeeze','Safeguarding','Overall Filter Press'])
      ]}); })();

    /* 9 — Rotary kiln / calciner mechanical --------------------------- */
    (function(){ const p='kln', b=cmBuilder(p, { plain:true });
      L.push({ id:'rotary-kiln-calciner', title:'Rotary Kiln / Calciner — Mechanical & Heating Zones',
        dept:'Rotating — OEM manual / AGMA 6014 (open gearing on shell-supported equipment) / ISO 20816 / ISO 18434-1 (thermography)',
        category:'rotating', driveCouplingField:true, driveTypeOptions: DRIVE_TYPES_ALL,
        tagPlaceholder:'e.g. 1080 Calciner', defaultVisual:true, defaultVibration:true,
        sections:[plantSafety(p,[RAD_PPE,'Hot shell: no contact; inching only with auxiliary drive under permit; kiln rotation locked before entering guards'])].concat(buildMotorSections(p+'_mtr'), buildCouplingSections(p+'_cpl'), [
          b.sec('gear','C. Girth Gear, Pinion & Main Gearbox', [
            ['Gear mesh','Tooth contact pattern, pitting, scuffing; noise','≥ 80% contact; no progressive pitting','M'],
            ['Backlash & root clearance','Backlash and root clearance','Per OEM','A'],
            ['Girth gear temperature','IR temperature profile across the face (misalignment)','ΔT across face < 10°C','M'],
            ['Lubrication','Spray lube system / bath level, lubricant film on teeth','Full coverage','D'],
            ['Girth gear fixings','Spring plates / bolts, run-out','No cracks; run-out per OEM','6M'],
            ['Main gearbox','Oil level, temp, vibration, leaks (see Gearbox checklist)','Within limits','M']
          ], { readingNote:'AGMA 6014 / OEM', readings:[['Gear face temp — left','°C'],['Gear face temp — centre','°C'],['Gear face temp — right','°C'],['Pinion bearing DE','°C'],['Pinion bearing NDE','°C']] }),
          b.sec('tyre','D. Tyres (Riding Rings) & Support Rollers', [
            ['Tyre creep / migration','Relative movement tyre to shell per revolution','Within OEM band','W'],
            ['Tyre & roller faces','Surface wear, cracking, spalling, contact','Full-width contact, no cracks','M'],
            ['Roller skew','Roller adjustment / thrust direction (axial position)','Rollers floating, not on thrust collar','W'],
            ['Roller bearings','Bearing temperature, oil level, cooling water','Within limit','D'],
            ['Thrust roller','Thrust roller load / temperature, hydraulic thrust (if fitted)','Kiln floating between limits','D'],
            ['Shell ovality','Shell ovality at tyres (shell tester)','Within OEM limit','A']
          ], { readingNote:'OEM', readings:[['Tyre creep (pier 1)','mm/rev'],['Tyre creep (pier 2)','mm/rev'],['Roller bearing max temp','°C'],['Kiln speed','rpm']] }),
          b.sec('shell','E. Shell, Seals & Auxiliary Drive', [
            ['Shell scan','IR shell scanner / manual scan — hot spots, refractory loss','No hot spot above alarm','D'],
            ['Shell cracks','Cracks at welds, tyre seats, around manholes','No cracks','A'],
            ['Inlet / outlet seals','Seal leakage of gas / product','No leakage','W'],
            ['Auxiliary drive','Inching drive start and clutch / overrunning coupling','Starts and runs','M'],
            ['Kiln alignment','Hot alignment survey','Within OEM','2Y']
          ], { readingNote:'OEM shell temperature limit', readings:[['Shell max temp','°C']] }),
          b.sec('heat','F. Electrically Heated Zones (TPF / electric calciner, where fitted)', [
            ['Zone temperatures','Each heating zone at set point; controller healthy','Within ±10°C of set point','D'],
            ['Zone power','Power / current per zone balanced','Within expected band','D'],
            ['Element connections','IR scan of element terminals, busbars and thyristor stacks','No hot spot','M'],
            ['Insulation & casing','Furnace casing hot spots, insulation','No hot spot','M'],
            ['Over-temperature protection','Independent over-temperature trip tested','Trips at set point','6M']
          ], { readingNote:'OEM set points', readings:[['Zone 1','°C'],['Zone 2','°C'],['Zone 3','°C'],['Zone 4','°C']] }),
          b.sec('rel','G. Release, Reporting & Sign-off', RELEASE_ROWS),
          b.rating(['Motor & Main Drive','Girth Gear & Pinion','Tyres & Rollers','Shell & Seals','Heating Zones','Overall Kiln Condition'])
        ])}); })();

    /* 10 — Cooling tower (rotating) ----------------------------------- */
    (function(){ const p='ctw', b=cmBuilder(p, { plain:true });
      L.push({ id:'cooling-tower', title:'Cooling Tower — Fan, Structure & Water Treatment',
        dept:'Rotating — CTI guidelines / ASHRAE 188 (Legionella) / ISO 20816 / AGMA / OEM',
        category:'rotating', driveCouplingField:true, driveTypeOptions: DRIVE_TYPES_ALL,
        tagPlaceholder:'e.g. CT-01', defaultVisual:true, defaultVibration:true,
        sections:[plantSafety(p,['Fan stopped and locked out at the local isolator AND MCC; fan blades secured against wind-milling before entering the fan stack','Legionella: P2/P3 respirator inside the tower; disinfect before entry if counts are high'])].concat(buildMotorSections(p+'_mtr'), buildCouplingSections(p+'_cpl'), [
          b.sec('fan','C. Fan, Gearbox & Drive Shaft', [
            ['Fan blades','Cracks, erosion, pitch angle equal on all blades','Pitch within ±0.5°','6M'],
            ['Tip clearance','Blade tip to stack clearance','Per OEM','6M'],
            ['Hub & fixings','Hub bolts torque, U-bolts','Tight','6M'],
            ['Gearbox','Oil level, leaks, oil temp, vibration; oil sample','Normal; sample trended','M'],
            ['Drive shaft','Composite shaft, flexible elements, guards','No cracks','M'],
            ['Vibration cut-out switch','Vibration switch trip test','Trips fan','6M']
          ], { readingNote:'ISO 20816 / OEM', readings:[['Gearbox vibration','mm/s'],['Gearbox oil temp','°C']] }),
          b.sec('str','D. Structure, Fill & Distribution', [
            ['Structure','Timber / FRP / concrete — rot, cracks, loose fixings','Sound','A'],
            ['Fill','Fouling, scale, collapse','Clean, intact','6M'],
            ['Drift eliminators','Gaps, damage, fouling','Intact','6M'],
            ['Distribution','Nozzles / basins clear; even water distribution','Even','M'],
            ['Basin & screens','Sludge, screens, make-up valve, level control','Clean','M'],
            ['Access & stairs','Stairs, handrails, fan deck','Secure','A']
          ]),
          b.sec('wt','E. Water Treatment & Legionella Control', [
            ['Biocide dosing','Biocide / oxidant dosing and residual','Within program','W'],
            ['Legionella testing','Legionella sample result','< 10 CFU/mL (action per risk plan)','M'],
            ['Cycles & blowdown','Conductivity / cycles of concentration; blowdown','Within program','W'],
            ['Corrosion / scale','Corrosion coupons / inhibitor','Within program','3M'],
            ['Performance','Cold water temperature and approach vs. wet bulb','Within design','W']
          ], { readingNote:'water treatment program', readings:[['Hot water','°C'],['Cold water','°C'],['Conductivity','µS/cm'],['Legionella','CFU/mL']] }),
          b.sec('rel','F. Release, Reporting & Sign-off', RELEASE_ROWS),
          b.rating(['Motor & Drive','Fan & Gearbox','Structure & Fill','Water Treatment','Overall Cooling Tower'])
        ])}); })();

    /* 11 — Transformer & substation (E&I) ----------------------------- */
    (function(){ const p='trf', b=cmBuilder(p);
      L.push({ id:'transformer-substation', title:'Power Transformer & Substation',
        dept:'Electrical — IEC 60076 / IEC 60422 / IEC 60599 & IEEE C57.104 (DGA) / IEEE C57.152 / NFPA 70B / NFPA 70E',
        category:'ei', tagPlaceholder:'e.g. TX-01 / SS-AP', defaultVisual:true, defaultVibration:false, sections:[
        plantSafety(p,[HV_PPE,'Transformer de-energised, earthed and locked out at both HV and LV before any contact work; observe minimum approach distances to live parts']),
        b.sec('ss','Substation Building / Yard', [
          ['Access control','Doors / gates locked; authorised access only; signage','Secure','W'],
          ['Single-line diagram','Up-to-date single-line diagram displayed','Current','A'],
          ['Safety equipment','Rubber mats, HV gloves (tested), earthing sticks, CO2 extinguisher, first aid','Present, in date','M'],
          ['Building condition','Roof leaks, ventilation / A-C, vermin proofing, cable trench covers','Dry, sealed','M'],
          ['Earth grid','Earth connections, earth resistance test','Within design (typ. < 1 Ω)','A'],
          ['Lighting & emergency lighting','Lighting and emergency lights','Working','M'],
          ['Housekeeping','No storage of combustibles; oil bund clean and drain closed','Clean','M']
        ]),
        b.sec('ext','Transformer External Condition', [
          ['Oil level','Conservator oil level vs. temperature','Correct for temperature','W'],
          ['Leaks','Oil leaks at gaskets, valves, radiators','None','W'],
          ['Breather','Silica gel colour / dehydrating breather status; oil cup level','< 2/3 discoloured','W'],
          ['Buchholz relay','No gas collected; relay healthy','No gas','W'],
          ['Pressure relief device','PRD not operated; indicator reset','Normal','M'],
          ['Bushings','Cracks, chips, tracking, oil level (OIP bushings)','Clean, no tracking','M'],
          ['Cooling','Radiators clean; fans / pumps auto-start','Working','M'],
          ['Tap changer','Position, counter, OLTC compartment oil / breather','Normal','M'],
          ['Earthing & NER','Tank earth, neutral earthing / NER connection','Intact','A']
        ], { readingNote:'nameplate / alarm settings', readings:[['Oil temp (OTI)','°C'],['Winding temp (WTI)','°C'],['Load current','A'],['Tap position','pos']] }),
        b.sec('oil','Insulating Oil Analysis', [
          ['DGA','Dissolved gas analysis (H2, CH4, C2H2, C2H4, C2H6, CO, CO2)','Normal per IEEE C57.104 / IEC 60599','A'],
          ['Moisture & BDV','Water content and breakdown voltage','Within IEC 60422 limits','A'],
          ['Acidity & IFT','Acidity, interfacial tension, colour','Within IEC 60422 limits','A'],
          ['Furans','Furan analysis (paper ageing) for older units','Trend acceptable','2Y']
        ]),
        b.sec('tst','Electrical Testing (outage)', [
          ['Insulation resistance','IR / PI HV-LV, HV-E, LV-E','Within acceptance; PI ≥ 2','2Y'],
          ['Winding resistance','Winding resistance all taps','Within 2% between phases','2Y'],
          ['Turns ratio','TTR on all taps','Within ±0.5% of nameplate','2Y'],
          ['Power factor / tan δ','Insulation power factor / capacitance (bushings & windings)','Within limits / trend','2Y'],
          ['SFRA','Sweep frequency response (after faults or transport)','Matches baseline','Event'],
          ['Protection','Transformer protection (differential, REF, overcurrent, Buchholz / temp trips) injection tested','Trips correctly','2Y']
        ]),
        b.sec('ir','Thermography', [
          ['IR scan','IR scan of bushings, cable terminations, tap changer, radiators under load (ISO 18434-1)','No hot spots (ΔT vs. similar < 10°C)','6M']
        ], { readingNote:'NETA MTS ΔT criteria', readings:[['HV bushing max','°C'],['LV bushing max','°C'],['Cable termination max','°C']] }),
        b.sec('rel','Release, Reporting & Sign-off', RELEASE_ROWS),
        b.rating(['Substation Building & Safety','Transformer External','Insulating Oil','Electrical Tests','Thermography','Overall Transformer & Substation'])
      ]}); })();

    /* 12 — Switchgear, MCC & VSD -------------------------------------- */
    (function(){ const p='swg', b=cmBuilder(p);
      L.push({ id:'switchgear-mcc-vsd', title:'Switchgear, MCC & Variable Speed Drives',
        dept:'Electrical — IEC 62271 / IEC 61439 / IEC 61800 / NFPA 70B / NFPA 70E / IEEE 1584',
        category:'ei', tagPlaceholder:'e.g. MCC-AP-01 / VSD-201', defaultVisual:true, defaultVibration:false, sections:[
        plantSafety(p,[HV_PPE,'VSDs: wait the DC-bus discharge time on the label and verify < 50 V DC before opening']),
        b.sec('room','Electrical Room', [
          ['Room temperature','Room temperature and A-C / ventilation','≤ 35°C (or equipment rating)','W'],
          ['Dust & water ingress','Dust, moisture, roof leaks, cable entry seals','Clean, sealed','M'],
          ['Arc-flash labels','Incident energy / PPE labels on equipment','Present, current','A'],
          ['Clearances','Working space in front of panels clear; doors not blocked','Clear','W']
        ], { readingNote:'design', readings:[['Room temperature','°C']] }),
        b.sec('swg','MV / LV Switchgear', [
          ['Breaker status','Breaker positions, spring charged indicators, operation counter','Normal','W'],
          ['Protection relays','Relays healthy, no flags; event log reviewed','No unacknowledged events','W'],
          ['Trip circuit supervision','Trip circuit healthy lamps','Healthy','W'],
          ['Partial discharge','TEV / ultrasonic PD survey of MV panels','Below alarm level / stable','6M'],
          ['Interlocks','Mechanical / key interlocks, racking, earthing switch','Functional','A'],
          ['Breaker servicing','Breaker contact resistance, timing, mechanism lubrication','Within OEM','per OEM']
        ], { readingNote:'PD survey limits (OEM)', readings:[['TEV max','dBmV'],['Ultrasonic max','dBµV']] }),
        b.sec('mcc','Motor Control Centre', [
          ['Bucket condition','Indication lamps, door interlocks, overload settings','Correct','M'],
          ['Isolators','Isolators lockable and operate','Lockable','A'],
          ['Busbar & connections','IR scan of incomers, busbars, bucket connections under load','No hot spot','6M'],
          ['Contactors','Contactor chatter / burning smell','None','M'],
          ['Earth leakage','Earth leakage relays tested','Trip within setting','6M']
        ], { readingNote:'NETA MTS ΔT', readings:[['Incomer max','°C'],['Worst bucket','°C']] }),
        b.sec('vsd','Variable Speed Drives', [
          ['Cooling fans & filters','Fans running, filters clean','Clean','M'],
          ['Heatsink temperature','Heatsink / IGBT temperature','Within OEM','M'],
          ['Fault log','Drive fault / alarm history reviewed','No repeating faults','M'],
          ['DC bus capacitors','Capacitor age, bulging, ripple','Within life','A'],
          ['Connections','Power and control terminations torque / IR scan','Tight, no hot spot','6M'],
          ['Harmonics & EMC','Harmonic filters / reactors, cable shields earthed','Healthy','A'],
          ['Parameter backup','Drive parameters backed up','Current backup','A']
        ], { readingNote:'OEM', readings:[['Heatsink temp','°C'],['DC bus voltage','V']] }),
        b.sec('rel','Release, Reporting & Sign-off', RELEASE_ROWS),
        b.rating(['Electrical Room','Switchgear','MCC','VSDs','Overall Electrical Distribution'])
      ]}); })();

    /* 13 — UPS & battery banks ---------------------------------------- */
    (function(){ const p='ups', b=cmBuilder(p);
      L.push({ id:'ups-battery-bank', title:'UPS, DC Systems & Battery Banks',
        dept:'Electrical — IEEE 450 (VLA) / IEEE 1188 (VRLA) / IEEE 1106 (NiCd) / IEC 62040 / IEC 62485-2',
        category:'ei', tagPlaceholder:'e.g. UPS-CR-01 / BAT-110V', defaultVisual:true, defaultVibration:false, sections:[
        plantSafety(p,[HV_PPE,'Batteries: face shield and acid / alkali gloves; insulated tools; no rings or watches; hydrogen — no ignition sources']),
        b.sec('room','Battery Room / Enclosure', [
          ['Ventilation','Ventilation running (hydrogen dilution, IEC 62485-2)','Running','W'],
          ['Temperature','Room temperature (life halves every +10°C above 25°C)','20–25°C','W'],
          ['Eyewash','Eyewash / shower available (vented batteries)','Available, tested','W'],
          ['Signage & no ignition','No smoking / naked flame signage; no ignition sources','Compliant','M']
        ], { readingNote:'IEEE 450 / 1188', readings:[['Room temperature','°C']] }),
        b.sec('bat','Battery Visual & Float Readings', [
          ['Cases & covers','Cracks, swelling, leaks, terminal corrosion','None','M'],
          ['Connections','Inter-cell connector torque and corrosion','Torqued, clean','6M'],
          ['Float voltage','String float voltage','Per manufacturer','M'],
          ['Cell voltages','Individual cell / block voltages','Within ±0.05 V/cell of average','3M'],
          ['Electrolyte (VLA)','Electrolyte level and specific gravity (pilot cells)','Between marks; SG per OEM','M'],
          ['Ohmic test','Internal resistance / conductance','< 20–30% change from baseline','3M'],
          ['Ripple current','AC ripple on DC bus','Within OEM','6M']
        ], { readingNote:'manufacturer', readings:[['String float voltage','V'],['Lowest cell','V'],['Highest cell','V'],['Float current','A'],['Ohmic change (worst)','%']] }),
        b.sec('ups','UPS / Charger', [
          ['Alarms','UPS / charger alarms and event log','No active alarms','W'],
          ['Fans & filters','Fans running, filters clean','Clean','M'],
          ['Capacitors','AC / DC capacitor age and condition','Within life','A'],
          ['Bypass','Static and maintenance bypass operation','Transfers without break','A'],
          ['DC earth fault','DC system earth fault monitor','No earth fault','W'],
          ['Load','UPS load %','< 80% of rating','M']
        ], { readingNote:'UPS rating', readings:[['UPS load','%'],['Output voltage','V']] }),
        b.sec('cap','Capacity Test', [
          ['Discharge test','Capacity discharge test at rated rate (IEEE 450 / 1188)','≥ 80% capacity (replace below)','A / 2Y'],
          ['Autonomy','Autonomy meets design back-up time','Meets design','A']
        ], { readingNote:'IEEE 450', readings:[['Measured capacity','%'],['Autonomy','min']] }),
        b.sec('rel','Release, Reporting & Sign-off', RELEASE_ROWS),
        b.rating(['Battery Room','Battery Condition','UPS / Charger','Capacity','Overall UPS & DC System'])
      ]}); })();

    /* 14 — Gas detection & SIS proof test ----------------------------- */
    (function(){ const p='gds', b=cmBuilder(p);
      L.push({ id:'gas-detection-sis', title:'Gas Detection & Safety Instrumented System (SIS) Proof Test',
        dept:'Instrumentation — IEC 61511 / IEC 61508 / ISA-84 / IEC 60079-29-2 / site alarm & trip register',
        category:'ei', tagPlaceholder:'e.g. AT-SO2-01 / SIF-101', defaultVisual:true, defaultVibration:false, sections:[
        plantSafety(p,['SIS bypass / override authorised under the bypass procedure; operations informed; compensating measures in place during the test','Calibration gas cylinders secured; SO2 test gas handled per SDS']),
        b.sec('gd','Fixed Gas Detectors (SO2, O2, LEL, toxic)', [
          ['Detector head','Head clean, sinter / weather cap clear, mounting height correct for the gas','Clean, correct','M'],
          ['Bump test','Bump test with test gas — alarm activates','Responds','M'],
          ['Calibration','Zero and span calibration with certified gas','Within ±10% of span gas','3M'],
          ['Response time','T90 response time','Within OEM','3M'],
          ['Set points','Alarm set points match the alarm register (e.g. SO2 TWA / STEL based)','Correct','6M'],
          ['Beacons & sirens','Local beacons / sirens and control room alarm','Working','M'],
          ['Sensor life','Sensor age vs. replacement interval','Within life','6M']
        ], { readingNote:'certified test gas', readings:[['Zero reading','ppm'],['Span gas concentration','ppm'],['Reading at span','ppm'],['T90 response','s']] }),
        b.sec('port','Portable Gas Monitors', [
          ['Bump station','Daily bump test records of personal monitors','100% bumped before use','D'],
          ['Calibration','Portable monitor calibration due dates','Not overdue','M']
        ]),
        b.sec('sis','SIS Proof Test (per SIF)', [
          ['SRS & procedure','Safety requirements specification and proof test procedure available for the SIF','Available','per SRS'],
          ['As-found','As-found sensor reading / trip point recorded before adjustment','Recorded','per SRS'],
          ['Sensor test','Sensor injected / process-simulated to trip point','Trips at set point ± tolerance','per SRS'],
          ['Logic solver','Logic executes; voting and alarms correct','Correct','per SRS'],
          ['Final element','Final element (valve / breaker) moves to safe state; stroke time recorded','Within required response time','per SRS'],
          ['End-to-end','Complete loop tested sensor → logic → final element','Pass','per SRS'],
          ['As-left & reset','As-left recorded; bypass removed; system returned to normal','Bypass removed','per SRS'],
          ['Demand / failure log','Spurious trips, real demands and dangerous failures recorded for PFD verification','Recorded','per SRS']
        ], { readingNote:'SRS', readings:[['Trip set point','eng. unit'],['As-found trip','eng. unit'],['Final element stroke time','s']] }),
        b.sec('alm','Alarm & Trip Management', [
          ['Standing alarms','No standing / shelved alarms without authorisation','None unauthorised','W'],
          ['Bypass register','Active bypasses / overrides reviewed and time-limited','All authorised','W'],
          ['SCADA vs field','SCADA value agrees with local reading for critical instruments','Agree','M']
        ]),
        b.sec('rel','Release, Reporting & Sign-off', RELEASE_ROWS),
        b.rating(['Fixed Gas Detection','Portable Monitors','SIS Proof Test','Alarm Management','Overall Detection & Protection'])
      ]}); })();

    /* 15 — Overhead crane & lifting gear ------------------------------ */
    (function(){ const p='ohc', b=cmBuilder(p);
      L.push({ id:'overhead-crane-lifting', title:'Overhead Crane, Hoist & Lifting Equipment',
        dept:'Safety & Statutory — ISO 9927-1 / ISO 4309 / ASME B30.2, B30.9, B30.10, B30.16, B30.26 / AS 2550 / statutory lifting regulations',
        category:'safety', tagPlaceholder:'e.g. OHC-01 / Sling register', defaultVisual:true, defaultVibration:false, sections:[
        plantSafety(p,['Crane isolated at the main isolator and locked; hook block lowered; rail stops / barriers in place when working on runway']),
        b.sec('doc','Documentation & Marking', [
          ['SWL marking','SWL marked on bridge (both sides), hoist and hook block','Visible','M'],
          ['Certificate','Thorough examination / load test certificate current','Current (≤ 12 months)','A'],
          ['Register','Crane and lifting accessories register','Current','M'],
          ['Operator','Operator / rigger competency','Current','M']
        ]),
        b.sec('str','Structure, Runway & Travel', [
          ['Bridge girders','Cracks, deflection, corrosion, welds','Sound','A'],
          ['End carriages & wheels','Wheel flange / tread wear, bearings','Within limit','6M'],
          ['Runway rails','Alignment, clips, splices, end stops','Secure','A'],
          ['Buffers','Buffers at end stops and on crane','Fitted','6M'],
          ['Travel brakes','Long / cross travel brakes stop smoothly','Effective','M'],
          ['Power supply','Festoon / conductor bar, collectors','Sound','6M']
        ]),
        b.sec('hst','Hoist, Rope / Chain & Hook', [
          ['Wire rope','Broken wires, diameter reduction, corrosion, kinks, birdcaging (ISO 4309)','Within discard criteria','M'],
          ['Load chain','Chain elongation, nicks, gouges (chain hoists)','< 2% elongation (or OEM)','M'],
          ['Drum & sheaves','Grooves, rope spooling, anchor, minimum 2 dead wraps','Correct','6M'],
          ['Hook','Throat opening, twist, cracks (MPI at exam), latch, swivel','Within 5% opening increase','M'],
          ['Hoist brake','Holds rated load; lining wear','Holds','M'],
          ['Upper / lower limits','Upper (and lower) limit switches','Stop hoist','D'],
          ['Overload device','Overload limiter tested','Cuts at ≤ 110% SWL','A']
        ], { readingNote:'ISO 4309 / ASME B30.10', readings:[['Rope diameter reduction','%'],['Hook throat increase','%'],['Chain elongation','%']] }),
        b.sec('ctl','Controls & Warning Devices', [
          ['Pendant / remote','Buttons labelled, return to off; strain relief','Functional','D'],
          ['Emergency stop','E-stop on pendant / remote','Stops all motion','D'],
          ['Warning horn / light','Travel warning horn and light','Working','D'],
          ['Isolator','Main isolator lockable and labelled','Lockable','A']
        ]),
        b.sec('acc','Lifting Accessories (slings, shackles, chains, beams)', [
          ['Identification','WLL tag and colour code / inspection tag current','Tagged, in date','3M'],
          ['Wire rope slings','Broken wires, kinks, crushing, ferrules','Within discard','Before use'],
          ['Synthetic slings','Cuts, burns, chemical (acid) damage, stitching','No damage','Before use'],
          ['Chain slings','Elongation, nicks, master link, hooks & latches','Within limit','Before use'],
          ['Shackles','Pin thread, bent body, correct pin','Serviceable','Before use'],
          ['Lifting beams','SWL marked, cracks, certificate','Certified','A'],
          ['Quarantine','Defective gear tagged and removed from service','Quarantined','Each insp.']
        ]),
        b.sec('rel','Release, Reporting & Sign-off', RELEASE_ROWS),
        b.rating(['Structure & Runway','Hoist & Rope / Chain','Hook & Block','Controls & Limits','Lifting Accessories','Overall Lifting Equipment'])
      ]}); })();

    /* 16 — Safety showers & eyewash ----------------------------------- */
    (function(){ const p='ssw', b=cmBuilder(p);
      L.push({ id:'safety-shower-eyewash', title:'Safety Shower & Eyewash Station',
        dept:'Safety & Statutory — ANSI/ISEA Z358.1 / EN 15154 / site chemical safety standard',
        category:'safety', tagPlaceholder:'e.g. SS-AP-01', defaultVisual:true, defaultVibration:false, sections:[
        plantSafety(p,['Activation test: area barricaded for wet floor; drain / bucket in place']),
        b.sec('loc','Location & Access', [
          ['Travel distance','Within 10 seconds (~17 m) of the hazard, same level, unobstructed path','Compliant','M'],
          ['Obstruction','No obstruction, locked doors or stored materials','Clear','W'],
          ['Signage & lighting','Highly visible sign; well lit','Visible','M'],
          ['Alarm','Activation alarm / flow switch to control room (where fitted)','Alarms','W']
        ]),
        b.sec('wk','Weekly Activation', [
          ['Shower activation','Activate shower — flushes line, clear water','Clear water within seconds','W'],
          ['Eyewash activation','Activate eyewash — both heads, dust covers flip off','Even flow from both heads','W'],
          ['Hand-free operation','Valves stay open without use of hands','Stays open','W'],
          ['Leaks','No leaks at valves or connections','None','W']
        ]),
        b.sec('ann','Annual Performance Test (Z358.1)', [
          ['Shower flow','Shower flow rate','≥ 75.7 L/min for 15 min','A'],
          ['Shower pattern','Spray pattern 508 mm diameter at 1,524 mm above floor; head 2,083–2,438 mm high','Compliant','A'],
          ['Eyewash flow','Eyewash flow rate','≥ 1.5 L/min for 15 min','A'],
          ['Water temperature','Tepid flushing fluid (16–38°C) — critical in hot ambient: check sun-exposed pipes / tank','16–38°C','A'],
          ['Valve activation','Valve opens in ≤ 1 s','≤ 1 s','A'],
          ['Water quality','Potable / clean water; no rust or sediment','Clean','A']
        ], { readingNote:'ANSI/ISEA Z358.1', readings:[['Shower flow','L/min'],['Eyewash flow','L/min'],['Water temperature','°C']] }),
        b.sec('rel','Release, Reporting & Sign-off', RELEASE_ROWS),
        b.rating(['Location & Access','Shower','Eyewash','Water Temperature & Quality','Overall Station'])
      ]}); })();

    /* 17 — Fire protection systems ------------------------------------ */
    (function(){ const p='fps', b=cmBuilder(p);
      L.push({ id:'fire-protection-system', title:'Fire Protection Systems',
        dept:'Safety & Statutory — NFPA 25 / NFPA 20 / NFPA 10 / NFPA 72 / NFPA 2001 / NFPA 11 (foam)',
        category:'safety', tagPlaceholder:'e.g. FP-PLANT / FWP-01', defaultVisual:true, defaultVibration:false, sections:[
        plantSafety(p,['Impairment: any system taken out of service registered under the fire impairment procedure; fire watch / compensating measures in place']),
        b.sec('pump','Fire Water Pumps & Tank (NFPA 20 / 25)', [
          ['Fire water tank','Tank level, make-up, heaters / covers','Full','W'],
          ['Jockey pump','Jockey pump maintains system pressure; start / stop settings','Maintains pressure','W'],
          ['Electric fire pump','Weekly / monthly churn test run','Starts on pressure drop; runs normally','M'],
          ['Diesel fire pump','Weekly churn test 30 min: start on pressure drop, oil, coolant, battery, fuel tank ≥ 2/3','Runs 30 min, all normal','W'],
          ['Pump controller','Controller in AUTO; alarms healthy','AUTO','W'],
          ['Annual flow test','Annual pump performance flow test vs. curve','≥ 95% of rated curve','A']
        ], { readingNote:'NFPA 20 / 25', readings:[['Tank level','%'],['System pressure','bar'],['Pump suction','bar'],['Pump discharge (churn)','bar'],['Diesel run time','min']] }),
        b.sec('net','Hydrants, Hose Reels & Monitors', [
          ['Hydrants','Hydrants accessible, caps, outlets, valves operate','Operable','6M'],
          ['Hose reels','Hose condition, nozzle, valve, reel rotates','Serviceable','6M'],
          ['Monitors','Fire monitors rotate and lock','Operable','6M'],
          ['Ring main valves','Sectional valves open and secured / supervised','Open','M']
        ]),
        b.sec('spr','Sprinkler, Deluge & Foam Systems', [
          ['Control valves','Main control valves open, sealed / supervised','Open, sealed','W'],
          ['Gauges','System and supply gauge pressures normal','Normal','M'],
          ['Sprinkler heads','No paint, damage, corrosion, obstruction (450 mm clearance)','Clear','A'],
          ['Deluge valve','Deluge valve trip test (transformers / conveyors)','Trips, water delivered','A'],
          ['Foam system','Foam concentrate level and quality (solvent extraction / fuel areas)','Within spec','A'],
          ['Alarm devices','Water-motor gong / pressure switch alarm','Alarms','3M']
        ]),
        b.sec('det','Fire Detection & Alarm (NFPA 72)', [
          ['Fire panel','Panel normal; no faults or disablements','Normal','D'],
          ['Detectors','Detector test (rotating % per year)','100% tested annually','3M'],
          ['Manual call points','Call points tested','Alarm','3M'],
          ['Sounders & strobes','Audible and visual alarms','Audible everywhere','6M'],
          ['Batteries','Panel standby batteries','Per NFPA 72','6M']
        ]),
        b.sec('gas','Gaseous Suppression (substations, control & server rooms)', [
          ['Cylinder pressure / weight','Cylinder pressure or weight','≥ 95% (per NFPA 2001)','6M'],
          ['Room integrity','Room sealed (doors close, penetrations sealed)','Sealed','A'],
          ['Abort / manual release','Abort and manual release labelled and accessible','Accessible','6M'],
          ['Warning signs','Warning signs at entrances','Present','A']
        ]),
        b.sec('ext','Portable Extinguishers & Emergency Egress', [
          ['Extinguishers','Present, correct type, charged, pin and seal, tag current, mounted','Compliant','M'],
          ['Emergency lighting & exits','Exit signs and emergency lighting; escape routes clear','Working, clear','M'],
          ['Fire doors','Fire doors close and latch','Close and latch','6M']
        ]),
        b.sec('rel','Release, Reporting & Sign-off', RELEASE_ROWS),
        b.rating(['Fire Water Supply & Pumps','Hydrants & Hose Reels','Sprinkler / Deluge / Foam','Detection & Alarm','Gaseous Suppression','Extinguishers & Egress','Overall Fire Protection'])
      ]}); })();

    return L;
  }

  plantChecklists().forEach(e => EQUIPMENT.push(e));

