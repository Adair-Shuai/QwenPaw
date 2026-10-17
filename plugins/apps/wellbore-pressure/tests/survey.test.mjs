import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS, calculate } from '../src/model.mjs';
import { uniformStructure } from '../src/structure.mjs';
import { normalizeSurvey,parseSurvey,surveyCSV,surveyFromRows,buildTrajectory,trajectoryAt,EXAMPLE_SURVEY } from '../src/survey.mjs';
import { computeScenario,encodeScenario,decodeScenario } from '../src/scenario.mjs';
const close=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
const vertical=[{md:0,inc:0,azi:0},{md:1000,inc:0,azi:0}];
test('vertical trajectory has zero offsets and TVD equals MD',()=>{
  const trajectory=buildTrajectory(vertical),p=trajectoryAt(trajectory,1000);
  close(p.tvd,1000);close(p.north,0);close(p.east,0);close(p.inc,0);
});
test('constant inclination and azimuth match analytic straight line',()=>{
  const p=trajectoryAt(buildTrajectory([{md:0,inc:60,azi:90},{md:1000,inc:60,azi:90}]),1000);
  close(p.tvd,500);close(p.east,1000*Math.sin(Math.PI/3));close(p.north,0);
});
test('quarter-circle buildup endpoints and midpoint match radius geometry',()=>{
  const R=1000,L=Math.PI/2*R;
  const trajectory=buildTrajectory([{md:0,inc:0,azi:0},{md:L,inc:90,azi:0}]);
  const end=trajectoryAt(trajectory,L),half=trajectoryAt(trajectory,L/2);
  close(end.north,R);close(end.tvd,R);close(half.north,R*(1-Math.cos(Math.PI/4)));close(half.tvd,R*Math.sin(Math.PI/4));close(half.inc,45);
});
test('azimuth 350 to 10 takes short arc through north rather than 180',()=>{
  const trajectory=buildTrajectory([{md:0,inc:90,azi:350},{md:1000,inc:90,azi:10}]);
  const end=trajectoryAt(trajectory,1000),half=trajectoryAt(trajectory,500);
  close(end.east,0);close(end.tvd,0);close(end.north,1000*Math.sin(Math.PI/18)/(Math.PI/18));
  assert.ok(half.azi<1e-8||Math.abs(half.azi-360)<1e-8);
});
test('CSV aliases, reordered columns, TSV and JSON all load same stations',()=>{
  assert.deepEqual(parseSurvey(surveyCSV(EXAMPLE_SURVEY)),EXAMPLE_SURVEY);
  const aliases='方位角(°),备注,测深(m),井斜角(°)\n0,a,0,0\n90,b,1000,60';
  assert.deepEqual(parseSurvey(aliases),[{md:0,inc:0,azi:0},{md:1000,inc:60,azi:90}]);
  assert.deepEqual(parseSurvey('MD\tInc\tAzi\n0\t0\t0\n1000\t60\t90'),parseSurvey(aliases));
  assert.deepEqual(parseSurvey(JSON.stringify({stations:EXAMPLE_SURVEY})),EXAMPLE_SURVEY);
});
test('empty, wrong-unit, missing, duplicated columns and ambiguous numbers are rejected',()=>{
  for(const text of ['MD_ft,Inc_deg,Azi_deg\n0,0,0\n1000,60,90','MD,Inc\n0,0\n1000,60','MD,Inc,Azi,MD\n0,0,0,0\n1000,60,90,1000','MD,Inc,Azi\n0,0,0\n1000,,90','MD,Inc,Azi\n0,0,0\n0x100,60,90'])assert.throws(()=>parseSurvey(text));
  assert.throws(()=>surveyFromRows([['MD','Inc','Azi'],[0,0,0],[1000,'=30+30',90]]));
});
test('formulas in unused Excel columns are ignored, selected columns require values',()=>{
  const rows=[['MD','Inc','Azi','DLS'],[0,0,0,{formula:true}],[1000,60,90,{formula:true}]];
  assert.equal(surveyFromRows(rows).length,2);
  rows[2][1]={formula:true};assert.throws(()=>surveyFromRows(rows),/公式/);
});
test('upward interval uses signed gravity while conserving pressure contributions',()=>{
  const survey=[{md:0,inc:60,azi:0},{md:500,inc:60,azi:0},{md:1000,inc:120,azi:0}];
  const s=computeScenario(DEFAULTS,'Orkiszewski',2,null,survey);
  assert.ok(s.result.rows.some(r=>r[6]<0));
  close(s.result.bottom-DEFAULTS.pressure-s.result.gravity-s.result.friction,0,1e-10);
  assert.ok(s.result.rows.every(r=>r[1]>0));
});
test('survey coverage, order, bounds and antipodal tangents are checked',()=>{
  for(const list of [[{md:10,inc:0,azi:0},{md:1000,inc:0,azi:0}],[{md:0,inc:0,azi:0},{md:0,inc:0,azi:0}],[{md:0,inc:0,azi:0},{md:1000,inc:181,azi:0}],[{md:0,inc:0,azi:0},{md:1000,inc:30,azi:361}]])assert.throws(()=>normalizeSurvey(list));
  assert.throws(()=>buildTrajectory([{md:0,inc:0,azi:0},{md:1000,inc:180,azi:0}]));
  assert.throws(()=>trajectoryAt(buildTrajectory(vertical),1001));
  assert.throws(()=>computeScenario({...DEFAULTS,depth:900},'Orkiszewski',1,null,vertical));
});
test('vertical survey reproduces original pressure values',()=>{
  for(const model of ['Orkiszewski','Beggs-Brill']) {
    const old=calculate(DEFAULTS,model),s=computeScenario(DEFAULTS,model,1,null,vertical);
    close(s.result.bottom,old.bottom,1e-10);close(s.result.gravity,old.gravity,1e-10);close(s.result.friction,old.friction,1e-10);
  }
});
test('survey gravity uses TVD while friction uses measured length',()=>{
  const survey=[{md:0,inc:90,azi:90},{md:1000,inc:90,azi:90}];
  const s=computeScenario(DEFAULTS,'Orkiszewski',1,null,survey);
  close(s.result.gravity,0);assert.ok(s.result.friction>0);close(s.result.rows.at(-1)[2],300);
  const legacy=computeScenario(DEFAULTS,'Orkiszewski',1,null,survey,'md');close(legacy.result.rows.at(-1)[2],325);
});
test('buildup gravity and temperature match independent low-flow analytic hydrostatics',()=>{
  const survey=[{md:0,inc:0,azi:0},{md:1000,inc:60,azi:0}],p={...DEFAULTS,rate:1};
  const s=computeScenario(p,'Orkiszewski',2,null,survey),tvd=1000*Math.sin(Math.PI/3)/(Math.PI/3);
  const exponent=.018*9.81/(p.z*8.314*.025),expected=p.pressure*((p.temperature+.025*tvd)/p.temperature)**exponent;
  close(s.result.stations.at(-1).tvd,tvd);close(s.result.rows.at(-1)[2],p.temperature+.025*tvd);
  assert.ok(Math.abs(s.result.bottom-expected)/expected<1e-5);
});
test('survey and geometry boundaries are preserved and pressure contributions conserve',()=>{
  const first=uniformStructure(DEFAULTS)[0],structure=[{...first,end:345.7},{...first,diameter:.04}];
  const survey=[{md:0,inc:0,azi:0},{md:234.5,inc:30,azi:20},{md:1000,inc:60,azi:80}];
  const s=computeScenario(DEFAULTS,'Beggs-Brill',1,structure,survey);
  for(const d of [234.5,345.7,1000]){assert.equal(s.result.rows.filter(r=>Math.abs(r[0]-d)<1e-8).length,1);assert.ok(s.result.trajectory.some(p=>Math.abs(p.md-d)<1e-8));}
  close(s.result.bottom-s.result.params.pressure-s.result.gravity-s.result.friction,0,1e-10);
  assert.ok(s.result.friction>computeScenario(DEFAULTS,'Beggs-Brill',1,null,survey).result.friction);
});
test('v4 scenario restores survey, geometry, thermal basis and calculation',()=>{
  const s=computeScenario(DEFAULTS,'Beggs-Brill',2,null,EXAMPLE_SURVEY,'tvd');
  const saved=encodeScenario(s,50),decoded=decodeScenario(JSON.parse(JSON.stringify(saved)));
  assert.equal(saved.version,4);assert.deepEqual(decoded.survey,EXAMPLE_SURVEY);assert.equal(decoded.temperatureBasis,'tvd');
  close(computeScenario(decoded.parameters,decoded.model,decoded.gridFactor,decoded.structure,decoded.survey,decoded.temperatureBasis).result.bottom,s.result.bottom);
  for(const version of [1,2,3])assert.equal(decodeScenario({...saved,version}).survey,undefined);
  assert.throws(()=>decodeScenario({...saved,survey:[{md:0,inc:0,azi:0},{md:900,inc:20,azi:90}]}));
});
