# -*- coding: utf-8 -*-
"""Real FlowForge HTTP + execution acceptance host, with explicit LLM fixture.

No UI/HTTP/executor methods are mocked. This fixture tests integration behavior,
not the quality or availability of a live language model or host MCP service.
"""
from __future__ import annotations

import copy
import json
import os
from pathlib import Path
from types import SimpleNamespace

from fastapi import FastAPI
from fastapi.responses import FileResponse, HTMLResponse

from qwenpaw.plugins_bundle.flowforge.router import build_router
from qwenpaw.plugins_bundle.flowforge.service import WorkflowService

ROOT = Path(__file__).resolve().parents[2]
ARTIFACTS = Path(os.environ["FLOWFORGE_QA_ARTIFACTS"])
DATA = Path(os.environ["FLOWFORGE_QA_DATA"])


def seeded_workflow():
    return {
        "id": "inventory-review",
        "name": "库存偏差复核",
        "version": "1.0",
        "description": "浏览器验收合成数据：偏差超过阈值触发人工复核。",
        "inputs": [
            {
                "name": "deviation",
                "label": "库存偏差（%）",
                "type": "number",
                "required": True,
                "default": 2,
            },
        ],
        "start_id": "input",
        "outputs": ["normal", "approved", "rejected"],
        "nodes": {
            "input": {
                "class_type": "InputNode",
                "label": "库存偏差",
                "inputs": {"name": "deviation"},
            },
            "gate": {
                "class_type": "ConditionNode",
                "label": "偏差阈值判断",
                "inputs": {"__flow_dependencies": [["input", 0]]},
                "control": {
                    "conditions": [
                        {
                            "if": {
                                "left": "inputs.deviation",
                                "operator": "gt",
                                "right": 3,
                            },
                            "then_node": "review",
                        },
                    ],
                    "else_node": "normal",
                },
            },
            "normal": {
                "class_type": "OutputNode",
                "label": "正常盘库结果",
                "inputs": {"value": "正常，无需复核"},
            },
            "review": {
                "class_type": "HumanReviewNode",
                "label": "工程师复核",
                "inputs": {
                    "reviewer": "储气库工程师",
                    "review_prompt": "库存偏差超过阈值，请核验压力与注采数据。",
                },
                "control": {"next": "approved", "on_reject": "rejected"},
            },
            "approved": {
                "class_type": "OutputNode",
                "label": "审核通过",
                "inputs": {"value": "人工复核通过"},
            },
            "rejected": {
                "class_type": "OutputNode",
                "label": "退回核查",
                "inputs": {"value": "人工复核退回"},
            },
        },
        "metadata": {
            "positions": {
                "input": {"x": 30, "y": 160},
                "gate": {"x": 300, "y": 160},
                "normal": {"x": 600, "y": 300},
                "review": {"x": 600, "y": 20},
                "approved": {"x": 900, "y": 0},
                "rejected": {"x": 900, "y": 150},
            },
        },
    }


class ExplicitFixtureModel:
    async def complete(self, *, messages, **_kwargs):
        request = json.loads(messages[-1].content)
        if (
            "离线" in request["instruction"]
            or "offline" in request["instruction"]
        ):
            raise ConnectionError(
                "Explicit browser acceptance offline fixture",
            )
        flow = copy.deepcopy(request.get("current_flow"))
        if not flow or not flow.get("nodes"):
            flow = seeded_workflow()
            flow["id"] = request["flow_id"]
            flow["name"] = request.get("name") or "自然语言新建库存复核"
        else:
            flow["nodes"]["gate"]["control"]["conditions"][0]["if"][
                "right"
            ] = 5
        return SimpleNamespace(
            content=json.dumps(
                {"flow": flow, "warnings": ["验收使用固定模型响应，未测试在线模型能力。"]},
                ensure_ascii=False,
            ),
        )


service = WorkflowService(flows_dir=DATA)
service.executor.llm_service = ExplicitFixtureModel()
service.save_flow("inventory-review", seeded_workflow())
app = FastAPI()
app.include_router(build_router(service), prefix="/api/flowforge")


@app.get("/host.js")
def host_js():
    return FileResponse(
        ARTIFACTS / "host.js",
        media_type="application/javascript",
    )


@app.get("/host.css")
def host_css():
    return FileResponse(ARTIFACTS / "host.css", media_type="text/css")


@app.get("/plugin.js")
def plugin_js():
    return FileResponse(
        ARTIFACTS / "plugin.js",
        media_type="application/javascript",
        headers={"Cache-Control": "no-store"},
    )


@app.get("/{path:path}")
# pylint: disable-next=W0613
def host(path: str):
    return HTMLResponse(
        (
            '<!doctype html><html lang="zh-CN"><head><meta char'
            'set="utf-8"><meta name="viewport" content="width=d'
            'evice-width,initial-scale=1"><title>FlowForge 浏览器验'
            '收</title><link rel="stylesheet" href="/host.css"><'
            "style>html,body,#root,.ant-app{margin:0;height:100"
            "%;width:100%;font-family:system-ui,sans-serif}*{bo"
            'x-sizing:border-box}</style></head><body><div id="'
            'root"></div><script src="/host.js"></script></body'
            "></html>"
        ),
    )
