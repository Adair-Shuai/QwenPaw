"""Scoped durable cases, immutable calculations, original evidence and exports."""
from __future__ import annotations

import asyncio
import copy
import hashlib
import json
import re
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote

from fastapi import Depends, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel, Field

from qwenpaw.constant import WORKING_DIR
from qwenpaw.pawapp import get_scoped_ctx

from .catalog import catalog, new_case, new_unit, normalize_case
from .intake import extract, map_table, MAPPING_FIELDS, MAX_FILE
from .workbench import assess, expert_prompt, fingerprint
from . import reports

ROOT = Path(WORKING_DIR)/'apps'/'storage-capacity'
LOCK = threading.RLock()


def scope(request: Request):
    user=str(getattr(request.state,'user',None) or 'default')
    agent=request.headers.get('X-Agent-Id') or request.query_params.get('agent_id','default')
    if not re.fullmatch(r'[\w.-]{1,128}',agent):
        raise HTTPException(400,'Agent 标识无效')
    return ROOT/hashlib.sha256(f'{user}\0{agent}'.encode()).hexdigest()[:32]


def folder(root,identifier):
    if not re.fullmatch(r'[a-f0-9]{32}',identifier):
        raise HTTPException(404,'评估记录不存在')
    return root/identifier


def read(path):
    if not path.is_file():
        raise HTTPException(404,'记录不存在')
    return json.loads(path.read_text(encoding='utf-8'))


def write(path,value):
    path.parent.mkdir(parents=True,exist_ok=True)
    temp=path.with_name(path.name+'.'+uuid.uuid4().hex+'.tmp')
    temp.write_text(json.dumps(value,ensure_ascii=False,indent=2,allow_nan=False),encoding='utf-8')
    temp.replace(path)


def now():
    return datetime.now(timezone.utc).isoformat()


def validate_case(case):
    if not isinstance(case,dict) or case.get('schema_version')!=2:
        raise HTTPException(400,'请使用第 2 版评估数据格式')
    try:
        if len(json.dumps(case,ensure_ascii=False,allow_nan=False))>5_000_000:
            raise ValueError('评估数据过大')
        if not isinstance(case.get('units'),list) or len(case['units'])>100 or any(not isinstance(u,dict) for u in case['units']):
            raise ValueError('评估单元格式无效')
    except (ValueError,TypeError) as exc:
        raise HTTPException(400,str(exc)) from exc


class SaveBody(BaseModel):
    revision: int = Field(ge=1)
    case: dict


class RevisionBody(BaseModel):
    revision: int = Field(ge=1)


def current(root,case_id,revision=None):
    record=read(folder(root,case_id)/'draft.json')
    if revision is not None and revision!=record['revision']:
        raise HTTPException(409,'评估记录已更新，请重新载入后再保存')
    return record


def fresh_run(root,case_id):
    record=current(root,case_id)
    if not record.get('latest_run'):
        raise HTTPException(409,'请先运行计算')
    run=read(folder(root,case_id)/'runs'/f"{record['latest_run']}.json")
    if run['fingerprint']!=fingerprint(record['case']):
        raise HTTPException(409,'参数或资料已改变，请重新计算后生成报告')
    return record,run


def register(router):
    @router.get('/catalog')
    def get_catalog():
        return {**catalog(),'mapping_fields':MAPPING_FIELDS,'unit_template':new_unit()}

    @router.get('/cases')
    def list_cases(root=Depends(scope)):
        result=[]
        if root.exists():
            for path in root.glob('*/draft.json'):
                record=read(path)
                result.append({k:record[k] for k in ('id','revision','updated_at')}|{'name':record['case'].get('case_name','未命名'),'cycle':record['case'].get('cycle_id','')})
        return {'cases':sorted(result,key=lambda r:r['updated_at'],reverse=True)}

    @router.post('/cases')
    def create_case(root=Depends(scope)):
        record={'id':uuid.uuid4().hex,'revision':1,'case':new_case(),'latest_run':None,'updated_at':now()}
        write(folder(root,record['id'])/'draft.json',record)
        return record

    @router.get('/cases/{case_id}')
    def get_case(case_id:str,root=Depends(scope)):
        record=current(root,case_id)
        if record.get('latest_run'):
            record['evaluation']=read(folder(root,case_id)/'runs'/f"{record['latest_run']}.json")
            record['stale']=record['evaluation']['fingerprint']!=fingerprint(record['case'])
            review_path=folder(root,case_id)/'runs'/f"{record['latest_run']}.review.json"
            record['review']=read(review_path) if review_path.is_file() else None
        return record

    @router.put('/cases/{case_id}')
    def save_case(case_id:str,body:SaveBody,root=Depends(scope)):
        validate_case(body.case)
        try:
            body.case = normalize_case(body.case)
        except ValueError as exc:
            raise HTTPException(400,str(exc)) from exc
        with LOCK:
            record=current(root,case_id,body.revision)
            # Original-evidence index is controlled by the server, not by a JSON import.
            body.case['documents']=record['case'].get('documents',[])
            record.update(case=body.case,revision=record['revision']+1,updated_at=now())
            write(folder(root,case_id)/'draft.json',record)
        return record

    @router.post('/cases/{case_id}/documents')
    async def upload(case_id:str,revision:int=Form(...),files:list[UploadFile]=File(...),root=Depends(scope)):
        if not 1<=len(files)<=20:
            raise HTTPException(400,'每次上传 1–20 份资料')
        current(root,case_id,revision)
        docs=[]; total=0
        for f in files:
            raw=await f.read(MAX_FILE+1); total+=len(raw)
            if total>100*1024*1024:
                raise HTTPException(413,'本批资料总量超过 100 MB')
            try:
                document=await asyncio.to_thread(extract,f.filename or '资料',raw)
            except Exception as exc:
                raise HTTPException(400,f"{f.filename} 读取失败：{exc}") from exc
            docs.append((document,raw))
        with LOCK:
            record=current(root,case_id,revision)
            existing={d['id'] for d in record['case'].get('documents',[])}
            for d,raw in docs:
                if d['id'] in existing:
                    continue
                directory=folder(root,case_id)/'documents'; directory.mkdir(parents=True,exist_ok=True)
                (directory/(d['id']+'.bin')).write_bytes(raw)
                write(directory/(d['id']+'.json'),d)
                summary={k:v for k,v in d.items() if k not in {'tables','pages','case_candidate'}}
                summary.update(tables=[{'label':t['label'],'id':t['id'],'row_count':len(t['rows'])} for t in d['tables']],pages=[{'label':p['label']} for p in d['pages']])
                record['case'].setdefault('documents',[]).append(summary); existing.add(d['id'])
            record.update(revision=record['revision']+1,updated_at=now())
            write(folder(root,case_id)/'draft.json',record)
        return record

    def evidence(root,case_id,doc_id):
        record=current(root,case_id)
        if doc_id not in {d['id'] for d in record['case'].get('documents',[])}:
            raise HTTPException(404,'资料不存在')
        return read(folder(root,case_id)/'documents'/(doc_id+'.json'))

    @router.get('/cases/{case_id}/documents/{doc_id}')
    def get_document(case_id:str,doc_id:str,root=Depends(scope)):
        return evidence(root,case_id,doc_id)

    @router.get('/cases/{case_id}/documents/{doc_id}/original')
    def get_original(case_id:str,doc_id:str,root=Depends(scope)):
        doc=evidence(root,case_id,doc_id)
        return FileResponse(folder(root,case_id)/'documents'/(doc_id+'.bin'),filename=doc['name'],media_type='application/octet-stream')

    @router.post('/cases/{case_id}/documents/{doc_id}/map')
    def mapping(case_id:str,doc_id:str,body:dict,root=Depends(scope)):
        try:
            return map_table(evidence(root,case_id,doc_id),body)
        except (ValueError,TypeError) as exc:
            raise HTTPException(400,str(exc)) from exc

    @router.post('/cases/{case_id}/evaluate')
    def evaluate(case_id:str,body:RevisionBody,root=Depends(scope)):
        with LOCK:
            record=current(root,case_id,body.revision)
            try:
                run=assess(record['case'])
            except (ValueError,TypeError,KeyError,OverflowError) as exc:
                raise HTTPException(400,str(exc)) from exc
            run_id=uuid.uuid4().hex
            run.update(run_id=run_id,revision=record['revision'])
            write(folder(root,case_id)/'runs'/(run_id+'.json'),run)
            record['latest_run']=run_id; record['updated_at']=now()
            write(folder(root,case_id)/'draft.json',record)
        return run

    @router.post('/cases/{case_id}/review')
    async def review(case_id:str,body:RevisionBody,root=Depends(scope),ctx=Depends(get_scoped_ctx)):
        with LOCK:
            current(root,case_id,body.revision)
            record,run=fresh_run(root,case_id)
        task_ctx=copy.copy(ctx)
        # Reference the user's existing UGSci specialist. No fictional expert execution.
        task_ctx.agent_id='Inventory-agent'; task_ctx.app_id='storage-capacity'
        try:
            reply=await asyncio.wait_for(task_ctx.chat(expert_prompt(run),session_id=f"pawapp:storage-capacity:{ctx.user_id}:{case_id}:{run['run_id']}:review"),timeout=90)
            text=getattr(reply,'text','').strip()
            if not text or text.startswith('[PawApp ctx.chat fallback]'):
                raise RuntimeError('未取得有效审查意见')
        except Exception as exc:
            raise HTTPException(503,'库存评价智能体未完成审查；计算结果仍可使用。请检查 Inventory-agent 和模型配置。') from exc
        with LOCK:
            latest=current(root,case_id,body.revision)
            if latest.get('latest_run')!=run['run_id']:
                raise HTTPException(409,'计算已更新，旧审查意见不写入当前结果')
            review={'status':'completed','agent_id':'Inventory-agent','text':text,'fingerprint':run['fingerprint'],'created_at':now()}
            write(folder(root,case_id)/'runs'/(run['run_id']+'.review.json'),review)
        return review

    @router.get('/cases/{case_id}/report')
    def report(case_id:str,format:str='html',root=Depends(scope)):
        with LOCK:
            record,run=fresh_run(root,case_id)
            review_path=folder(root,case_id)/'runs'/(run['run_id']+'.review.json')
            review=read(review_path) if review_path.is_file() else None
        if format not in {'html','docx','md','json','zip'}:
            raise HTTPException(400,'不支持的报告格式')
        if format=='json':
            content=json.dumps(run,ensure_ascii=False,indent=2); mime='application/json'
        elif format=='docx':
            try:
                content=reports.docx_report(run,review)
            except ImportError as exc:
                raise HTTPException(503,'Word 导出需要宿主的 python-docx 依赖，请使用 HTML 或复算包') from exc
            mime='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        elif format=='zip':
            content=reports.bundle(run,review); mime='application/zip'
        elif format=='md':
            content=reports.markdown(run,review); mime='text/markdown'
        else:
            content=reports.html_report(run,review); mime='text/html'
        name=re.sub(r'[<>:"/\\|?*\x00-\x1f]','_',record['case'].get('case_name','储气库'))[:80]+'-库容评估报告.'+format
        return Response(content,media_type=mime,headers={'Content-Disposition':"attachment; filename*=UTF-8''"+quote(name),'X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'"})
