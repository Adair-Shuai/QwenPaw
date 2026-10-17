import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS, calculate, sample, parameterErrors } from '../src/model.mjs';
import { computeScenario, sampledScenario, encodeScenario, decodeScenario, changedFields, INTERVALS } from '../src/scenario.mjs';

test('legacy files retain original grid and 100 m sampling', () => {
  const decoded = decodeScenario({app:'wellbore-pressure',version:1,model:'Orkiszewski',parameters:DEFAULTS});
  assert.equal(decoded.gridFactor,1); assert.equal(decoded.interval,100);
  assert.equal(computeScenario(decoded.parameters,decoded.model).result.bottom,calculate(DEFAULTS).bottom);
});
test('new files round-trip model, parameters, mesh and sampling', () => {
  const p={...DEFAULTS,depth:357,rate:70000};
  const s=computeScenario(p,'Beggs-Brill',2);
  assert.deepEqual(decodeScenario(JSON.parse(JSON.stringify(encodeScenario(s,25)))),{parameters:p,model:'Beggs-Brill',gridFactor:2,interval:25,structure:null,survey:null,temperatureBasis:'md'});
});
test('bad imports reject schema, types and unsupported settings', () => {
  const valid=encodeScenario(computeScenario(DEFAULTS,'Orkiszewski'),100);
  for (const patch of [{version:5},{model:'other'},{interval:0},{gridFactor:3},{parameters:{...DEFAULTS,pressure:'8'}}]) assert.throws(()=>decodeScenario({...valid,...patch}));
  assert.throws(()=>decodeScenario(null));
});
test('all sample intervals align both models and include exact bottom once', () => {
  const s=computeScenario({...DEFAULTS,depth:357},'Orkiszewski');
  for(const interval of INTERVALS) {
    const d=sampledScenario(s,interval);
    assert.deepEqual(d.result.samples.map(r=>r[0]),d.comparison.samples.map(r=>r[0]));
    assert.equal(d.result.samples.at(-1)[0],357);
    assert.equal(d.result.samples.filter(r=>r[0]===357).length,1);
    assert.equal(d.result.samples.at(-1)[1],s.result.bottom);
  }
  assert.equal(s.result.samples.length,5);
});
test('sampling rejects unbounded work and avoids almost-duplicate endpoint', () => {
  const r=calculate({...DEFAULTS,depth:100+1e-12});
  assert.equal(sample(r.rows,100).length,2);
  for(const interval of [0,-1,NaN,1e-10]) assert.throws(()=>sample(r.rows,interval));
});
test('refinement diagnostic equals independent finer calculation', () => {
  const s=computeScenario(DEFAULTS,'Orkiszewski',2);
  const fine=calculate(DEFAULTS,'Orkiszewski',4000);
  assert.equal(s.result.steps,2000); assert.equal(s.quality.refinedBottom,fine.bottom);
  assert.equal(s.quality.difference,Math.abs(fine.bottom-s.result.bottom));
  assert.ok(s.quality.relativePercent<0.1);
});
test('maximum supported well length works with refined mesh', () => {
  const s=computeScenario({...DEFAULTS,depth:10000},'Beggs-Brill',2);
  assert.equal(s.result.steps,20000); assert.equal(s.quality.refinedSteps,40000);
  assert.ok(Number.isFinite(s.quality.relativePercent));
});
test('field errors report all invalid entries and roughness relation', () => {
  const errors=parameterErrors({...DEFAULTS,pressure:0,rate:NaN,diameter:0.001,roughness:0.01});
  assert.deepEqual(Object.keys(errors).sort(),['pressure','rate','roughness']);
  assert.equal(Object.keys(parameterErrors(undefined)).length,8);
});
test('baseline remains unchanged and lists only modified parameters', () => {
  const s=computeScenario(DEFAULTS,'Orkiszewski');
  const p={...DEFAULTS,rate:100000}; const next=computeScenario(p,'Orkiszewski');
  assert.equal(s.result.params.rate,50000); assert.ok(next.result.bottom>s.result.bottom);
  assert.deepEqual(changedFields(s.result.params,p).map(v=>v.key),['rate']);
});
