// Run: node tests/engine.test.js
const assert = require('assert');
const E = require('../js/engine.js');
const demo = require('../sample-data/demo-belt.json').belts[0];
let passed = 0;
function test(name, fn) { fn(); passed++; console.log('  ok  ' + name); }

test('linear regression slope', () => {
  const r = E.linreg([0, 1, 2, 3], [6, 5, 4, 3]);
  assert.strictEqual(r.slope, -1); assert.strictEqual(r.r2, 1);
});
test('T1 from drive power (Euler-Eytelwein)', () => {
  const t = E.estimateT1({ power_kW: 55, eff: 0.9, loadFactor: 0.8, wrapDeg: 210, mu: 0.35 }, 2);
  assert(Math.abs(t.Te - 19.8) < 1e-9); assert(t.T1 > t.Te);
});
test('demo belt assessment runs and picks a governing clock', () => {
  const r = E.assess(demo, '2026-10-10');
  assert(['ok', 'watch', 'critical'].includes(r.verdict));
  assert(r.governing); assert(r.healthIndex >= 0 && r.healthIndex <= 100);
  assert(r.recommendations.length > 0);
});
test('cover at minimum is critical', () => {
  const b = JSON.parse(JSON.stringify(demo));
  b.thickness.push({ date: '2026-10-09', p: [3, 2, 1.4, 2, 3] });
  assert.strictEqual(E.assess(b, '2026-10-10').verdict, 'critical');
});
test('safety factor below minimum is critical', () => {
  const b = JSON.parse(JSON.stringify(demo));
  b.tension = { mode: 'direct', T1_kN: 120 };
  const r = E.assess(b, '2026-10-10');
  assert.strictEqual(r.clocks.find(c => c.key === 'strength').status, 'critical');
});
test('empty belt returns nodata without throwing', () => {
  const r = E.assess({ id: 'X' }, '2026-10-10');
  assert.strictEqual(r.verdict, 'nodata');
});
console.log(passed + ' tests passed');
