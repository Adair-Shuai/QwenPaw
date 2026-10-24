import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DEFAULTS, calculate, sample, frictionFactor, pythonRound } from '../src/model.mjs';
const fixtures=JSON.parse(fs.readFileSync(new URL('./reference.json',import.meta.url),'utf8'));
for(const c of fixtures.cases) test(`Python parity: ${c.model}, depth=${c.params.depth}, angle=${c.params.angle}, rate=${c.params.rate}`,()=>{
  const actual=calculate(c.params,c.model); assert.equal(actual.steps,c.steps);
  for(const kind of ['rows','samples']) {
    assert.equal(actual[kind].length,c[kind].length);
    actual[kind].forEach((row,i)=>row.forEach((v,j)=>assert.ok(Math.abs(v-c[kind][i][j])<=1e-10*Math.max(1,Math.abs(c[kind][i][j])),`${kind}[${i}][${j}] ${v} != ${c[kind][i][j]}`)));
  }
});
test('pressure rise equals integrated gravity + friction',()=>{
  for(const model of ['Orkiszewski','Beggs-Brill']) { const r=calculate(DEFAULTS,model); assert.ok(Math.abs(r.bottom-DEFAULTS.pressure-r.gravity-r.friction)<1e-11); assert.ok(r.rows.every((x,i)=>!i||x[1]>r.rows[i-1][1])); }
});
test('horizontal well has no gravity contribution and models coincide',()=>{
  const p={...DEFAULTS,angle:0},a=calculate(p),b=calculate(p,'Beggs-Brill'); assert.equal(a.gravity,0); assert.equal(a.bottom,b.bottom);
});
test('higher flow raises friction and bottom pressure',()=>{const a=calculate(DEFAULTS),b=calculate({...DEFAULTS,rate:100000});assert.ok(b.bottom>a.bottom);assert.ok(b.friction>a.friction);});
test('non-multiple depth includes exact bottom once',()=>{const r=calculate({...DEFAULTS,depth:357});assert.deepEqual(r.samples.map(x=>x[0]),[0,100,200,300,357]);});
test('1000 / 2000 / 4000 cell grid converges',()=>{const a=calculate(DEFAULTS,'Orkiszewski',1000).bottom,b=calculate(DEFAULTS,'Orkiszewski',2000).bottom,c=calculate(DEFAULTS,'Orkiszewski',4000).bottom;assert.ok(Math.abs(c-b)<Math.abs(b-a));assert.ok(Math.abs(c-a)/c<0.0001);});
test('laminar friction and ties-to-even rounding',()=>{assert.equal(frictionFactor(100,1e-5,.08),.64);assert.equal(pythonRound(300.5),300);assert.equal(pythonRound(301.5),302);});
test('invalid values rejected rather than coerced',()=>{
  for(const [key,value] of [['pressure',0],['temperature',NaN],['rate',-1],['angle',91],['depth',Infinity],['z',0],['diameter',''],['roughness',null],['pressure','8']])assert.throws(()=>calculate({...DEFAULTS,[key]:value}));
  assert.throws(()=>calculate({...DEFAULTS,diameter:.001,roughness:.01}));assert.throws(()=>calculate(DEFAULTS,'fake'));assert.throws(()=>calculate(DEFAULTS,'Orkiszewski',0));assert.throws(()=>sample([],0));
});
