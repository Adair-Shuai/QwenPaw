import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS, calculate } from '../src/model.mjs';
import { calculateStructured, normalizeStructure, uniformStructure, verticalDepth, parseStructure, structureCSV, sampleStructured } from '../src/structure.mjs';
import { computeScenario, encodeScenario, decodeScenario } from '../src/scenario.mjs';
const uniform=uniformStructure(DEFAULTS)[0];
const sections=[{...uniform,end:300,name:'上段'},{...uniform,end:700,diameter:.06,angle:60,name:'中段'},{...uniform,diameter:.04,angle:30,name:'下段'}];

test('single-segment extension preserves every original solver value',()=>{
  for(const model of ['Orkiszewski','Beggs-Brill']) {
    assert.deepEqual(calculateStructured(DEFAULTS,model,1000).rows,calculate(DEFAULTS,model).rows);
    assert.deepEqual(calculateStructured(DEFAULTS,model,1000,[uniform]).rows,calculate(DEFAULTS,model).rows);
  }
});
test('uniform geometry split at mesh nodes reproduces unsplit result',()=>{
  const split=[{...uniform,end:300},{...uniform,end:700},uniform];
  const a=calculateStructured(DEFAULTS,'Orkiszewski',1000,split),b=calculate(DEFAULTS);
  assert.equal(a.steps,1000);
  assert.ok(Math.abs(a.bottom-b.bottom)<1e-12);
});
test('segment boundaries are unique exact grid nodes and pressure remains continuous',()=>{
  const r=calculateStructured(DEFAULTS,'Orkiszewski',1000,sections);
  for(const end of [300,700,1000]) assert.equal(r.rows.filter(x=>x[0]===end).length,1);
  assert.ok(r.rows.every((row,i)=>!i||row[0]>r.rows[i-1][0]));
  const at=r.rows.findIndex(x=>x[0]===300);
  const previous=r.rows[at-1],node=r.rows[at];
  const expected=previous[1]+(previous[5]+previous[6])*(node[0]-previous[0])/1000;
  assert.ok(Math.abs(node[1]-expected)<1e-12);
  assert.ok(node[4]>previous[4]*1.7);
});
test('segmented pressure rise equals gravity plus friction',()=>{
  for(const model of ['Orkiszewski','Beggs-Brill']) {
    const r=calculateStructured(DEFAULTS,model,1000,sections);
    assert.ok(Math.abs(r.bottom-DEFAULTS.pressure-r.gravity-r.friction)<1e-11);
  }
});
test('narrower lower section increases friction at identical well angles',()=>{
  const a=calculateStructured(DEFAULTS,'Orkiszewski',1000,[{...uniform,end:500},uniform]);
  const b=calculateStructured(DEFAULTS,'Orkiszewski',1000,[{...uniform,end:500},{...uniform,diameter:.04}]);
  assert.ok(b.bottom>a.bottom); assert.ok(b.friction>a.friction);
});
test('invalid coverage, order, units, empty values and excessive segments are rejected',()=>{
  for(const list of [[],[{...uniform,end:999}],[{...uniform,end:700},{...uniform,end:600}],[{...uniform,diameter:80}],[{...uniform,angle:91}],[{...uniform,roughness:.08}],[{...uniform,end:''}],Array(31).fill(uniform)]) assert.throws(()=>normalizeStructure(list,1000));
});
test('CSV mm conversion round-trips quoted commas, quotes and newlines in names',()=>{
  const list=sections.map((s,i)=>({...s,name:i===0?'井段,"A"\n名称':s.name}));
  assert.deepEqual(parseStructure(structureCSV(list),1000),normalizeStructure(list,1000));
  assert.throws(()=>parseStructure('终点井深_m,内径_mm,夹角_deg,粗糙度_mm,井段名称\n1000,,90,0.01,井段',1000));
  assert.throws(()=>parseStructure('end,diameter,angle,roughness,name\n1000,80,90,0.01,a',1000));
});
test('JSON structure and v3 scenario preserve sections; v2 remains readable',()=>{
  assert.deepEqual(parseStructure(JSON.stringify({segments:sections}),1000),sections);
  const s=computeScenario(DEFAULTS,'Beggs-Brill',2,sections);
  const saved=encodeScenario(s,50),decoded=decodeScenario(JSON.parse(JSON.stringify(saved)));
  assert.deepEqual(decoded.structure,sections);
  assert.equal(computeScenario(decoded.parameters,decoded.model,decoded.gridFactor,decoded.structure).result.bottom,s.result.bottom);
  assert.equal(decodeScenario({...saved,version:2}).structure,undefined);
});
test('derived vertical depth sums each section inclination',()=>{
  assert.ok(Math.abs(verticalDepth(sections)-(300+400*Math.sin(Math.PI/3)+300*.5))<1e-10);
});
test('sampling does not smear velocity jumps across section boundary',()=>{
  const list=[{...uniform,end:333.5},{...uniform,diameter:.04}];
  const r=calculateStructured(DEFAULTS,'Orkiszewski',1000,list);
  const samples=sampleStructured(r.rows,list,.5);
  assert.ok(samples.find(x=>x[0]===333.5)[4]>samples.find(x=>x[0]===333)[4]*3.9);
  assert.equal(samples.at(-1)[1],r.bottom);
});
test('mesh refinement with noninteger segment endpoints converges',()=>{
  const list=[{...uniform,end:333.3},{...uniform,diameter:.04}];
  const a=calculateStructured(DEFAULTS,'Orkiszewski',1000,list),b=calculateStructured(DEFAULTS,'Orkiszewski',2000,list),c=calculateStructured(DEFAULTS,'Orkiszewski',4000,list);
  assert.ok(Math.abs(c.bottom-b.bottom)<Math.abs(b.bottom-a.bottom));
});
test('low-flow segmented hydrostatics matches independent closed-form solution',()=>{
  const p={...DEFAULTS,rate:1};
  const r=calculateStructured(p,'Orkiszewski',4000,sections);
  let analytic=p.pressure,start=0;
  for(const s of sections) {
    const exponent=.018*9.81*Math.sin(s.angle*Math.PI/180)/(p.z*8.314*.025);
    analytic*=((p.temperature+.025*s.end)/(p.temperature+.025*start))**exponent;
    start=s.end;
  }
  assert.ok(Math.abs(r.bottom-analytic)/analytic<1e-5);
});
