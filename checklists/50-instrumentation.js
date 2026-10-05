/* CM Inspect — checklists/50-instrumentation.js
   Instrument calibration, switch function tests, analysers, flowmeters and weighing.
   Loaded as a classic script; shares global scope with the other files
   (load order is defined in index.html). © Lotus Africa — internal use only. */
'use strict';
  /* =====================================================================
     INSTRUMENTATION — CALIBRATION, FUNCTION TEST & LOOP CHECK
     IEC 61298 (test methods) / IEC 60770 (transmitters) / ISO 10012
     (measurement management) / IEC 62382 (loop check) / NAMUR NE 43 /
     IEC 61511 (SIS loops) / ISA-5.1 (tagging) / ISO/IEC 17025 (traceability)
     ===================================================================== */
  const INST_SAFETY = [
    'Inform the control room operator; obtain agreement to put the loop in MANUAL / bypass (SIS bypass only under the bypass procedure)',
    'Identify every interlock, trip and alarm driven by this instrument (loop / cause-and-effect drawing) before disconnecting anything',
    'Process isolation: close root / manifold valves, vent and drain impulse lines to a safe place; confirm zero pressure before breaking connections',
    'Hazardous area: confirm Ex classification; use only certified test equipment and intrinsically safe practice; hot-work permit for non-IS tools',
    'Radioactive (nuclear) gauges: Radiation Safety Officer informed, source shutter CLOSED and locked before any work near the beam'
  ];
  const INST_RESTORE = [
    ['Process restoration','Manifold / root valves returned to service position; vents and drains closed; no leaks at connections','No leaks; valves in service position','Each cal.'],
    ['Loop restoration','Wiring re-terminated and tight; covers and O-rings refitted; loop returned to AUTO; bypass / force removed','Normal operation confirmed by operator','Each cal.'],
    ['Calibration label','Label fitted: date, as-left status, next due date, technician','Label legible','Each cal.'],
    ['Out-of-tolerance (OOT)','If as-found was outside tolerance: raise OOT report — impact on product, control and safety since last calibration (ISO 10012)','OOT report raised or N/A','Each cal.'],
    ['Records','Calibration certificate (as-found / as-left) filed and Pronto updated with next due date','Filed, Pronto updated','Each cal.']
  ];
  const INST_CAL_ROWS = (what) => [
    ['Test points',`Apply 0, 25, 50, 75 and 100 % ${what} rising, then 75, 50, 25, 0 % falling; record output at each point`,'5-point up / down completed','Each cal.'],
    ['Accuracy','Error at every point within tolerance (datasheet, or ±0.5 % of span for control loops, ±0.25 % for SIS / custody)','All points within tolerance','Each cal.'],
    ['Hysteresis & repeatability','Difference between rising and falling readings; repeat zero','Within manufacturer specification','Each cal.']
  ];
  const PCT = ['0 %','25 %','50 %','75 %','100 %'];

  function instrumentChecklists(){
    const L = [];

    /* 1 — Transmitters, converters, elements & gauges ------------------- */
    (function(){ const p='itx', b=cmBuilder(p);
      L.push({ id:'inst-transmitter-loop', title:'Instrument Calibration & Loop Check — Transmitters, Elements & Gauges',
        dept:'Instrumentation — IEC 61298-2 / IEC 60770 / IEC 62382 / NAMUR NE 43 / ISO 10012 / ISO/IEC 17025 / ISA-5.1 / IEC 61511 (SIS loops)',
        category:'ei', tagPlaceholder:'e.g. 780-PT-012', defaultVisual:true, defaultVibration:false, sections:[
        plantSafety(p, INST_SAFETY.concat([ACID_PPE])),
        b.sec('doc','Identification, Data & Reference Standard', [
          ['Tag & P&ID','Tag matches P&ID, loop drawing and Pronto plant item (ISA-5.1)','Tag plate fitted and correct','Each cal.'],
          ['Datasheet','Range (LRV / URV), units, output, damping, fail direction and accuracy class known','Datasheet available','Each cal.'],
          ['Loop function','Function recorded: indication / control / alarm / trip / SIS (SIL)','Function and criticality recorded','Each cal.'],
          ['Calibration interval','Last calibration date and interval (risk-based: SIS per SRS, control 12 months, indication 24 months)','Not overdue','Each cal.'],
          ['Reference standard','Calibrator / reference gauge with valid certificate traceable to national standards (ISO/IEC 17025)','Certificate in date; accuracy ratio ≥ 4 : 1','Each cal.']
        ], { readingNote:'datasheet values', readings:[['Lower range value (LRV)','eng. unit'],['Upper range value (URV)','eng. unit'],['Reference standard accuracy','% span']] }),
        b.sec('vis','Visual & Installation Inspection', [
          ['Housing & covers','Enclosure, display window, covers and O-rings intact; IP rating maintained','No damage, covers tight','6M'],
          ['Cable & gland','Cable glands sealed, cable supported, shield earthed at one end only','Sealed, earthed correctly','6M'],
          ['Ex integrity','Ex-rated equipment: certification label, no modifications, gaps and fasteners (IEC 60079-17)','Ex integrity maintained','A'],
          ['Impulse lines','Impulse lines / capillaries: leaks, blockage, slope, heat tracing and insulation','No leaks or plugging; correct slope','6M'],
          ['Manifold & process connection','Manifold valves operate, equalising valve closed in service; process connection tight','Functional, no passing','6M'],
          ['Diaphragm seals','Remote seals and capillaries undamaged, not kinked (acid / slurry duty)','No damage','6M'],
          ['Mounting','Bracket secure, no vibration, sunshade fitted where exposed','Secure','6M'],
          ['Local gauge','Local pressure / temperature gauge readable, not damaged, needle returns to zero at rest','Readable, zero OK','6M']
        ]),
        b.sec('pre','Electrical & Configuration Checks (before calibration)', [
          ['Loop supply','Loop supply voltage at transmitter terminals','Within datasheet range (typ. 12–30 V DC)','Each cal.'],
          ['HART communication','Communicator connects; device diagnostics show no faults','No active diagnostics','Each cal.'],
          ['Configuration','Range, units, damping, transfer function (linear / √) and tag match the datasheet','Matches datasheet','Each cal.'],
          ['Fail-safe direction','Alarm / saturation levels per NAMUR NE 43 (≤ 3.6 mA or ≥ 21 mA) and correct direction','Set per datasheet','Each cal.']
        ], { readingNote:'datasheet', readings:[['Loop supply voltage','V DC'],['Loop current at rest','mA']] }),
        b.sec('asf','As-Found Calibration (5-point, before any adjustment)', INST_CAL_ROWS('of input (pressure, DP, level, temperature or simulated signal)'),
          { readingNote:'record measured output; expected 4 / 8 / 12 / 16 / 20 mA for a 4–20 mA loop', readings: PCT.map(x => ['As-found output at ' + x + ' input','mA']).concat([['As-found worst error','% span']]) }),
        b.sec('adj','Adjustment & As-Left Calibration', [
          ['Sensor / zero trim','Zero and sensor trim performed only if as-found outside tolerance (record reason)','Adjustment recorded or not required','Each cal.'],
          ['As-left check','Repeat 5-point up / down after adjustment','All points within tolerance','Each cal.'],
          ['Position effect','Zero re-checked in installed position after mounting','Within tolerance','Each cal.']
        ], { readingNote:'expected 4 / 8 / 12 / 16 / 20 mA', readings: PCT.map(x => ['As-left output at ' + x + ' input','mA']).concat([['As-left worst error','% span']]) }),
        b.sec('elem','Primary Element Checks (where fitted)', [
          ['RTD element','Resistance at ambient / ice point vs table (IEC 60751); insulation to sheath','Within class tolerance; insulation ≥ 100 MΩ','A'],
          ['Thermocouple','Continuity, polarity, compensating cable type; comparison with reference probe','Within IEC 60584 class','A'],
          ['Thermowell','Thermowell erosion / corrosion (slurry, acid), insertion length','Sound; replace if worn','2Y'],
          ['Orifice / DP element','Orifice plate edge, bore, orientation; flow direction arrow (at shutdown)','Sharp edge; correct orientation','2Y'],
          ['Radar / ultrasonic level','Echo curve / signal quality, false echo mapping, antenna build-up','Strong echo; no build-up','6M'],
          ['Nuclear level / density gauge','Source shutter operation, warning signs, radiation survey, leak (wipe) test date','Shutter OK; leak test in date','6M']
        ], { readingNote:'element tables / reference probe', readings:[['Element resistance / mV','Ω / mV'],['Reference temperature','°C']] }),
        b.sec('loop','Loop Check — Field to Control System (IEC 62382)', [
          ['DCS / PLC indication','Inject 0, 50, 100 %; control system displays the matching engineering value','Within ±0.5 % of span','Each cal.'],
          ['Alarms','LL / L / H / HH alarms activate at their set points and annunciate in the control room','At set point ± tolerance','Each cal.'],
          ['Trips & interlocks','Trip / interlock acts on the correct final element (with permit, SIS per proof-test procedure)','Correct action','Each cal.'],
          ['Fail response','Simulate under-range / over-range (NE 43) — control system shows BAD / fault and loop goes to safe state','Correct fault handling','Each cal.'],
          ['Control loop','Controller output and final element respond in the correct direction','Correct direction','Each cal.']
        ], { readingNote:'compare field value vs control system', readings:[['DCS value at 0 %','eng. unit'],['DCS value at 50 %','eng. unit'],['DCS value at 100 %','eng. unit']] }),
        b.sec('rest','Restoration & Records', INST_RESTORE),
        b.sec('rel','Release, Reporting & Sign-off', RELEASE_ROWS),
        b.rating(['Installation & Condition','As-Found Accuracy','As-Left Accuracy','Loop & Alarm Function','Overall Instrument Condition'])
      ]}); })();

    /* 2 — Switches (process, position, conveyor protection) ------------- */
    (function(){ const p='isw', b=cmBuilder(p);
      L.push({ id:'inst-switch-test', title:'Instrument Function Test — Process, Position & Conveyor Protection Switches',
        dept:'Instrumentation — IEC 61298 / IEC 60947-5 / IEC 62382 / IEC 61511 (SIS) / AS 4024 & ISO 13850 (emergency stop) / ISO 10012',
        category:'ei', tagPlaceholder:'e.g. 110-ZS-113', defaultVisual:true, defaultVibration:false, sections:[
        plantSafety(p, INST_SAFETY.concat(['Conveyor protection tests: conveyor isolated except when the live trip test is done with the area clear and operator in attendance'])),
        b.sec('doc','Identification & Set Point Data', [
          ['Tag & function','Tag matches P&ID / loop drawing; function (alarm, trip, permissive, feedback) known','Correct','Each test'],
          ['Set point','Trip set point, direction (rising / falling) and reset / deadband from the alarm & trip register','Set point recorded','Each test'],
          ['Test interval','Last test date and interval (SIS per SRS; others 6–12 months)','Not overdue','Each test']
        ], { readingNote:'alarm & trip register', readings:[['Required set point','eng. unit']] }),
        b.sec('vis','Visual & Installation', [
          ['Enclosure & cable','Housing, cover, gland, cable and conduit; Ex integrity where applicable','Intact, sealed','6M'],
          ['Sensing element','Float, probe, paddle, bellows, bulb or target — build-up, damage, free movement','Clean, free','6M'],
          ['Mounting & actuator','Bracket, cam, striker or target secure and aligned','Secure, aligned','6M']
        ]),
        b.sec('proc','Process Switch Set-Point Test (level, pressure, DP, flow, temperature, speed)', [
          ['As-found trip','Apply input slowly in trip direction; record actual trip value','Within ±2 % of span of set point (or register tolerance)','Each test'],
          ['Reset','Reverse the input; record reset value and deadband','Deadband per datasheet','Each test'],
          ['Adjustment','Adjust only if outside tolerance; repeat test for as-left','As-left within tolerance','Each test'],
          ['Contacts','Contact state (NO / NC) and fail-safe: de-energise-to-trip where specified','Correct contact action','Each test'],
          ['Speed switch','Zero-speed / under-speed switch trips at set speed and stops the drive','Trips correctly','6M']
        ], { readingNote:'set point ± tolerance', readings:[['As-found trip value','eng. unit'],['As-found reset value','eng. unit'],['As-left trip value','eng. unit']] }),
        b.sec('pos','Position / Limit Switches (valves, gates, chutes, guards)', [
          ['Open / closed feedback','Stroke the valve / gate; OPEN and CLOSED feedback change at the correct position','Feedback correct at both ends','6M'],
          ['Travel alarm','Travel-time / discrepancy alarm in the control system','Alarms when expected','A'],
          ['Guard interlock','Guard / door interlock prevents start and stops the machine when opened','Stops machine','6M']
        ]),
        b.sec('conv','Conveyor Protection Devices (live trip test)', [
          ['Pull-wire switches','Every pull-wire station trips the conveyor and must be manually reset (ISO 13850)','All stations trip and latch','M'],
          ['Belt drift / misalignment','First stage alarms, second stage trips','Correct action','6M'],
          ['Belt tear / rip detector','Detector trip test (test loop / simulation per OEM)','Trips conveyor','6M'],
          ['Blocked chute','Blocked-chute switch trips feed and conveyor','Trips','6M'],
          ['Wire tension','Pull-wire tension, eye bolts, wire condition','Correct tension, no damage','M']
        ]),
        b.sec('loop','Loop Check to Control System', [
          ['Indication','Switch status shows correctly in DCS / PLC / SCADA','Correct','Each test'],
          ['Alarm / trip action','Alarm annunciates; trip acts on the correct equipment','Correct action','Each test'],
          ['Wiring fault','Open-circuit / line-monitoring fault detected where fitted','Fault alarm generated','A']
        ]),
        b.sec('rest','Restoration & Records', INST_RESTORE),
        b.sec('rel','Release, Reporting & Sign-off', RELEASE_ROWS),
        b.rating(['Installation & Condition','Set-Point Accuracy','Trip / Alarm Function','Overall Switch Condition'])
      ]}); })();

    /* 3 — Process analysers & densimeters --------------------------------- */
    (function(){ const p='ian', b=cmBuilder(p);
      L.push({ id:'inst-analyser-cal', title:'Instrument Calibration — Process Analysers & Densimeters',
        dept:'Instrumentation — IEC 60746 (pH / conductivity analysers) / IEC 61298 / ISO 10012 / ISO/IEC 17025 / radiation licence conditions (nuclear density gauges)',
        category:'ei', tagPlaceholder:'e.g. 220-AT-234', defaultVisual:true, defaultVibration:false, sections:[
        plantSafety(p, INST_SAFETY.concat([ACID_PPE,'Buffers / standards: in date, handled per SDS; spent solutions disposed to the process drain, not the storm drain'])),
        b.sec('doc','Identification & Data', [
          ['Tag & measurement','Tag, measured parameter (pH, ORP, conductivity, density, O2, other) and range','Recorded','Each cal.'],
          ['Calibration interval','Last calibration and interval; verification frequency against lab','Not overdue','Each cal.'],
          ['Standards','Buffers / calibration standards in date with certificates','In date','Each cal.']
        ]),
        b.sec('smp','Sample System & Installation', [
          ['Sample line','Sample flow, pressure, temperature; no blockage or air entrainment','Within OEM range','M'],
          ['Filters & drains','Sample filters, strainers and drain clear','Clean','M'],
          ['Sensor housing','Flow cell / retraction assembly / insertion fitting — leaks, scaling','No leaks','M'],
          ['Cleaning system','Automatic wash / cleaning sprays working','Working','M']
        ]),
        b.sec('sens','Sensor Condition', [
          ['Sensor cleaning','Sensor cleaned (acid / slurry fouling, gypsum or uranium scale)','Clean','Each cal.'],
          ['pH electrode','Glass undamaged, reference junction not blocked, electrolyte level (refillable types)','Serviceable','Each cal.'],
          ['Sensor age','Sensor age vs replacement interval; slope / impedance diagnostics','Within life','Each cal.']
        ]),
        b.sec('cal','Calibration (as-found / as-left)', [
          ['pH two/three-point','Calibrate with pH 4 / 7 (/ 10) buffers at buffer temperature','Slope 95–102 %, offset ±30 mV (or OEM)','Each cal.'],
          ['Conductivity','Check with conductivity standard; cell constant','Within ±2 % of standard','Each cal.'],
          ['Densimeter','Zero on water / reference; compare with lab density of a grab sample','Within ±1 % (or OEM)','Each cal.'],
          ['Other analysers','Zero and span with certified standards / gas per OEM','Within OEM tolerance','Each cal.'],
          ['Lab comparison','Online value vs laboratory result on the same grab sample','Within agreed tolerance','M']
        ], { readingNote:'record as-found then as-left', readings:[['As-found reading in standard 1','eng. unit'],['As-found reading in standard 2','eng. unit'],['Slope','%'],['Offset','mV'],['As-left reading in standard 1','eng. unit'],['As-left reading in standard 2','eng. unit'],['Online value','eng. unit'],['Lab value','eng. unit']] }),
        b.sec('nuc','Nuclear Density Gauge (where fitted)', [
          ['Source & shutter','Source holder, shutter mechanism and lock operate; warning signs and barriers in place','Functional, signed','6M'],
          ['Radiation survey','Dose-rate survey around the gauge recorded','Within licence limits','6M'],
          ['Leak (wipe) test','Wipe test done by authorised person; result on file','In date, pass','per licence'],
          ['Register','Source in the radioactive source register; licence current','Current','A']
        ], { readingNote:'licence limits', readings:[['Dose rate at 1 m','µSv/h']] }),
        b.sec('loop','Loop Check to Control System', [
          ['Indication','Control system value matches transmitter at two points','Within ±0.5 % of span','Each cal.'],
          ['Alarms & control','Alarms and dosing / control action respond correctly','Correct','Each cal.']
        ]),
        b.sec('rest','Restoration & Records', INST_RESTORE),
        b.sec('rel','Release, Reporting & Sign-off', RELEASE_ROWS),
        b.rating(['Sample System','Sensor Condition','Calibration Result','Loop Function','Overall Analyser Condition'])
      ]}); })();

    /* 4 — Flowmeters & weighing ------------------------------------------ */
    (function(){ const p='ifw', b=cmBuilder(p);
      L.push({ id:'inst-flow-weigh', title:'Instrument Verification — Flowmeters, Belt Scales & Load Cells',
        dept:'Instrumentation — ISO 20456 (electromagnetic flowmeters) / OIML R 50 (belt weighers) / OIML R 60 (load cells) / ISO 10012 / IEC 62382',
        category:'ei', tagPlaceholder:'e.g. 120-FT-005 / 110-WC-119', defaultVisual:true, defaultVibration:false, sections:[
        plantSafety(p, INST_SAFETY.concat(['Belt scale test: conveyor isolated to fit test weights / chain; live run only with area clear'])),
        b.sec('doc','Identification & Data', [
          ['Tag & type','Tag, meter type (magnetic, ultrasonic, Coriolis, belt scale, load cell) and range','Recorded','Each cal.'],
          ['Use','Use: control, mass balance / metallurgical accounting, custody','Recorded','Each cal.'],
          ['Interval','Last verification and interval','Not overdue','Each cal.']
        ]),
        b.sec('mag','Flowmeters (magnetic / ultrasonic / Coriolis)', [
          ['Installation','Straight run, full pipe, flow direction arrow, no air at the meter','Per OEM','A'],
          ['Grounding','Grounding rings / electrodes bonded (essential on lined pipe)','Bonded','A'],
          ['Liner & electrodes','Liner wear and electrode coating (slurry / acid), at shutdown','No wear-through; electrodes clean','2Y'],
          ['Electronic verification','Built-in verification / simulator test of the converter and coils','Pass','Each cal.'],
          ['Zero (Coriolis / ultrasonic)','Zero check with full, stationary pipe','Within OEM','Each cal.'],
          ['Comparison','Totaliser vs tank level change or reference meter','Within ±2 % (or agreed)','A']
        ], { readingNote:'OEM verification report', readings:[['Verification result','pass/fail'],['Reference volume','m³'],['Meter volume','m³'],['Error','%']] }),
        b.sec('bel','Belt Scales / Weightometers', [
          ['Mechanical','Weigh idlers aligned (string line), no build-up, belt tracking central','Aligned, clean','M'],
          ['Zero test','Run empty belt for full belt revolutions; record zero','Within OEM (typ. ±0.25 %)','M'],
          ['Span test','Test weights or calibration chain; record span error','Within ±0.5 % (or OEM)','3M'],
          ['Material test','Weigh a known quantity (truck / bin) against the totaliser','Within ±1 % (or agreed)','6M'],
          ['Speed sensor','Speed sensor wheel / encoder clean and turning','Correct speed','M']
        ], { readingNote:'OEM / OIML R 50', readings:[['Zero error','%'],['Span error','%'],['Material test error','%']] }),
        b.sec('load','Load Cells & Weighing Indicators', [
          ['Load cells','Mounting, overload stops, cable, no binding of the weighed vessel','Free-floating','6M'],
          ['Zero & span','Zero with empty vessel; span with test weights or known mass','Within ±0.5 % (or OEM)','A'],
          ['Corner / linearity','Corner-load and linearity check','Within OEM','A']
        ], { readingNote:'OEM', readings:[['Zero reading','kg'],['Test mass','kg'],['Indicated mass','kg']] }),
        b.sec('loop','Loop Check to Control System', [
          ['Indication & totaliser','Control system rate and totaliser match the instrument','Agree','Each cal.'],
          ['Alarms & control','Low / high flow alarms and feed-rate control respond correctly','Correct','Each cal.']
        ]),
        b.sec('rest','Restoration & Records', INST_RESTORE),
        b.sec('rel','Release, Reporting & Sign-off', RELEASE_ROWS),
        b.rating(['Installation & Condition','Verification Result','Loop Function','Overall Meter Condition'])
      ]}); })();

    return L;
  }
  instrumentChecklists().forEach(e => EQUIPMENT.push(e));

