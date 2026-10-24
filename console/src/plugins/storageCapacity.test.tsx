import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { cleanup, render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const blank = () => ({schema_version:2,case_name:'新建库容评估',cycle_id:'',purpose:'cycle',storage_type:'depleted_gas',rock_type:'sandstone',pressure_basis:'',standard:{temperature:null,pressure:null,z:null,source:''},start_state:'',end_state:'',book_inventory:null,book_state:'start',sources:{},ledger:{},design:{},units:[],documents:[],history:[],comparison_tolerance_percent:5,review_notes:''});
const unit={name:'评估单元 1',source:'',method:'pz',parameters:{},conditions:{water_drive:'unknown',fluid:'unknown',interference:'unknown',pressure_representative:false,closed_during_segment:false},series:[],pvt:[],wells:[],schedule:[],external:{}};
const catalog={storage_types:[{value:'depleted_gas',label:'枯竭气藏'},{value:'salt_cavern',label:'盐穴'}],standards:[],terms:[{key:'effective_inventory',name:'有效库存量',definition:'现有井网可动用库存'}],fields:{produced_gas:{label:'阶段采气量 Qp',unit:'亿m³'}},methods:[{id:'pz',name:'两点 p/Z 物质平衡',mode:'calculation',fields:['produced_gas'],required:['produced_gas'],condition:'近似定容',formula:'Grm = Qp × Pin/Zin / Δ(p/Z)',reference:'方法依据'},{id:'volumetric',name:'体积与压力窗口计算',mode:'calculation',fields:[],required:[],condition:'绝压与净腔体积',formula:'状态方程',reference:'方法依据'}],mapping_fields:{units:['name','produced_gas']},unit_template:unit};

describe('storage capacity packaged workbench',()=>{
  let Component:React.ComponentType;
  let record:any;
  let result:any;
  const hostFetch=vi.fn();
  beforeEach(()=>{
    record={id:'a'.repeat(32),revision:1,case:blank(),latest_run:null};result=null;
    hostFetch.mockReset().mockImplementation(async(url:string,init?:RequestInit)=>{
      const body=typeof init?.body==='string'?JSON.parse(init.body):null;
      let data:any={};
      if(url.endsWith('/catalog'))data=catalog;
      else if(url.endsWith('/cases')&&init?.method==='POST')data=record;
      else if(url.endsWith('/cases'))data={cases:[]};
      else if(url.endsWith('/evaluate')){
        result={case:structuredClone(record.case),fingerprint:'f'.repeat(64),run_id:'r',status:'calculated',summary:'计算建议值，待复核。',metrics:[{key:'effective_inventory',label:'有效库存量',value:100,unit:'亿m³',source:'分单元计算'}],checks:[],units:[],created_at:'2026-10-24T00:00:00Z',engine_version:'2.0.0',duration_ms:1};data=result;
      }else if(url.endsWith('/review'))return new Response(JSON.stringify({detail:'库存评价智能体未完成审查；计算结果仍可使用。'}),{status:503});
      else if(url.includes('/report?format=html'))return new Response('<h1>库容评估报告</h1><p>待复核</p>',{headers:{'Content-Type':'text/html'}});
      else if(url.endsWith('/documents')&&init?.method==='POST'){
        record={...record,revision:record.revision+1,case:{...record.case,documents:[{id:'d1',name:'input.csv',tables:[{id:'0'}],pages:[],status:'extracted'}]}};data=record;
      }else if(url.endsWith('/documents/d1'))data={id:'d1',name:'input.csv',tables:[{id:'0',label:'input.csv',rows:[['层名','Qp'],['A','25']],locations:['行1','行2']}],pages:[],warnings:[]};
      else if(url.endsWith('/documents/d1/map'))data={kind:'units',records:[{...unit,name:'A',source:'input.csv R2',parameters:{produced_gas:25}}],errors:[]};
      else if(init?.method==='PUT'){record={...record,revision:record.revision+1,case:body.case};data=record;}
      else data={...record,evaluation:result};
      return new Response(JSON.stringify(data),{headers:{'Content-Type':'application/json'}});
    });
    Object.defineProperty(window,'QwenPaw',{configurable:true,value:{host:{React,fetch:hostFetch},registerRoutes:(_id:string,routes:any[])=>{Component=routes[0].component;}}});
    new Function(fs.readFileSync(path.resolve(process.cwd(),'../plugins/apps/storage-capacity/ui/index.js'),'utf8'))();
  });
  afterEach(()=>{cleanup();Reflect.deleteProperty(window,'QwenPaw');document.getElementById('storage-capacity-styles')?.remove();vi.restoreAllMocks();});
  async function create(){render(<Component/>);await waitFor(()=>expect(screen.getAllByRole('button',{name:'新建评估'})[0]).toBeEnabled());await userEvent.click(screen.getAllByRole('button',{name:'新建评估'})[0]);await screen.findByLabelText('储气库／项目名称');}

  it('runs the mounted page from editable parameters to report and invalidates stale exports',async()=>{
    await create();await userEvent.clear(screen.getByLabelText('储气库／项目名称'));await userEvent.type(screen.getByLabelText('储气库／项目名称'),'合成项目');
    await userEvent.click(screen.getByRole('button',{name:'添加单元'}));
    await userEvent.click(screen.getByRole('tab',{name:'3. 方法与计算'}));
    await userEvent.type(screen.getByLabelText('阶段采气量 Qp（亿m³） *'),'25');
    await userEvent.click(screen.getByRole('button',{name:'运行计算'}));
    await screen.findByRole('heading',{name:'计算结果'});
    const save=hostFetch.mock.calls.find(([,i])=>i?.method==='PUT');expect(JSON.parse(save![1].body).case.units[0].parameters.produced_gas).toBe(25);
    expect(hostFetch.mock.calls.some(([u])=>u.endsWith('/review'))).toBe(false);
    await userEvent.click(screen.getByRole('tab',{name:'5. 评估报告'}));
    expect(screen.getByRole('button',{name:'导出 Word'})).toBeEnabled();
    await userEvent.click(screen.getByRole('button',{name:'预览报告'}));
    expect(await screen.findByTitle('库容评估报告预览')).toHaveAttribute('sandbox','');
    await userEvent.type(screen.getByLabelText('项目复核意见'),'补充依据');
    expect(screen.getByRole('button',{name:'导出 Word'})).toBeDisabled();
    expect(screen.queryByTitle('库容评估报告预览')).not.toBeInTheDocument();
  });

  it('maps uploaded evidence into real unit inputs without overwriting existing units',async()=>{
    await create();await userEvent.click(screen.getByRole('tab',{name:'2. 资料与参数'}));
    fireEvent.change(screen.getByLabelText('上传评估资料'),{target:{files:[new File(['层名,Qp\nA,25'],'input.csv',{type:'text/csv'})]}});
    await userEvent.click(await screen.findByRole('button',{name:'查看与映射'}));
    await userEvent.selectOptions(await screen.findByLabelText('单元／井名'),'0');
    await userEvent.selectOptions(screen.getByLabelText('阶段采气量 Qp'),'1');
    await userEvent.click(screen.getByRole('button',{name:'导入所选字段'}));
    await userEvent.click(screen.getByRole('tab',{name:'3. 方法与计算'}));
    expect(screen.getByLabelText('阶段采气量 Qp（亿m³） *')).toHaveValue(25);
    expect(screen.getByLabelText('参数与适用性依据')).toHaveValue('input.csv R2');
  });

  it('keeps deterministic results available when optional agent review fails',async()=>{
    await create();await userEvent.click(screen.getByRole('button',{name:'运行计算'}));
    await userEvent.click(await screen.findByRole('button',{name:'方法审查'}));
    expect(await screen.findByRole('alert')).toHaveTextContent('库存评价智能体未完成审查');
    expect(screen.getByRole('heading',{name:'计算结果'})).toBeVisible();
    await userEvent.click(screen.getByRole('tab',{name:'5. 评估报告'}));
    expect(screen.getByRole('button',{name:'导出 Word'})).toBeEnabled();
  });
});
