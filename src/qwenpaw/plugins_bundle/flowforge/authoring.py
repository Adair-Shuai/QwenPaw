# -*- coding: utf-8 -*-
"""Model-backed, agent-scoped workflow proposals. Generation never executes."""
from __future__ import annotations

import asyncio
import copy
import json
import re
import time
from typing import Any
from uuid import uuid4

from .engine.adapter.chat_message import ChatMessage
from .flow_repository import RevisionConflict


class AuthoringUnavailable(RuntimeError):
    """A usable model is not available; do not substitute a fake workflow."""


SYSTEM_PROMPT = (
    "你是 QwenPaw 工作流编译器。只返回JSON对象 {flow:完整工作流,warnings:字符串数组}。\n"
    "使用当前专家可用的 available_nodes 和 available_agents；不虚构工具、专家或输出，不调用"
    "任何工具。\n"
    "修改current_flow时保留无关节点的ID、配置、位置和连线，禁止改变流程id。参数、阈值和单位不可擅改。\n"
    "文档格式：id,name,description,nodes:{节点id:{class_type,label,input"
    "s,control}},inputs:[{name,type,required,default}],outputs:[输"
    "出节点id],start_id,metadata:{positions:{节点id:{x,y}}},version:'1.0'。\n"
    "引用输出使用 [上游ID,槽位整数]，允许嵌套于ToolNode.inputs.args；优先使用typed "
    "Tool.<name>节点。\n"
    "若提供edges，必须与引用和控制字段完全一致：数据边{source,target,kind:'data',source"
    "_slot:0,target_handle:'真实输入字段'}；控制边{source,target,kind:'cont"
    "rol',source_handle:'next或condition:0或else_node'}。\n"
    "嵌套参数引用的数据边不写覆盖整个args的target_handle。无法准确描述edges时省略该字段，由系统推导；不"
    "能用edges:[]隐藏实际引用。\n"
    "并行使用多个节点共享同一上游，汇合节点引用各分支结果，禁止使用未接入的ParallelNode。互斥条件分支不能互相等待。\n"
    "ConditionNode.control.conditions:[{if:{left:'inputs.amount',"
    "operator:'gt',right:100},then_node:'review'}]，并配置else_node。\n"
    "条件运算符eq,ne,gt,ge,lt,le,in,contains,is_null,and,or,not，不使用Pyt"
    "hon表达式。\n"
    "HumanReviewNode使用next通过、on_reject拒绝，不能省略拒绝处理。QualityGateNode"
    "提供真实score和pass_node/fail_node。\n"
    "IterativeRefineNode需retry_node、exhausted_node两个不同目标和1–20整数ma"
    "x_iterations；只有其有界重试控制边允许回边。\n"
    "重试control.max_retries为0–10整数，retry_delay_sec为0–60，副作用工具默认不重试"
    "。timeout_sec须为正数。\n"
    "SubworkflowNode只引用available_workflows真实ID，禁止递归调用当前工作流。\n"
    "AgentNode.agent_id只能使用available_agents稳定ID。不能以泛化AgentNode替代确"
    "定性分支、计算、审核。\n"
    "保留__credential_ref_开头的凭据占位引用，不输出或推测密钥。缺少必要能力时在warnings说明，并返回"
    "待配置的方案，不能假装能力可用。\n"
)


def _secret_key(key: str) -> bool:
    normalized = re.sub(r"([a-z])([A-Z])", r"\1_\2", key).replace("-", "_")
    return bool(
        re.search(
            "password|secret|token|api_key|authorization|acce"
            "ss_key|private_key|cookie",
            normalized,
            re.I,
        ),
    )


def redact_credentials(value: Any, secrets: dict[str, str]) -> Any:
    if isinstance(value, dict):
        result = {}
        for key, item in value.items():
            if _secret_key(str(key)) and isinstance(item, str) and item:
                marker = f"__credential_ref_{uuid4().hex}__"
                secrets[marker] = item
                result[key] = marker
            else:
                result[key] = redact_credentials(item, secrets)
        return result
    if isinstance(value, list):
        return [redact_credentials(item, secrets) for item in value]
    return value


def restore_credentials(value: Any, secrets: dict[str, str]) -> Any:
    if isinstance(value, dict):
        return {
            key: restore_credentials(item, secrets)
            for key, item in value.items()
        }
    if isinstance(value, list):
        return [restore_credentials(item, secrets) for item in value]
    return secrets.get(value, value) if isinstance(value, str) else value


def _preview(value):
    references = {}
    clean = redact_credentials(value, references)
    clean = restore_credentials(
        clean,
        {marker: "[凭据已隐藏]" for marker in references},
    )
    return (
        clean[:800] + "…"
        if isinstance(clean, str) and len(clean) > 800
        else clean
    )


def _details(before, after, path=""):
    if before == after:
        return []
    if isinstance(before, dict) and isinstance(after, dict):
        return [
            detail
            for key in sorted(set(before) | set(after))
            if key not in {"id", "__flow_dependencies"}
            for detail in _details(
                before.get(key),
                after.get(key),
                f"{path}.{key}".strip("."),
            )
        ][:100]
    if (
        isinstance(before, list)
        and isinstance(after, list)
        and len(before) == len(after)
    ):
        return [
            detail
            for index, (old, new) in enumerate(zip(before, after))
            for detail in _details(old, new, f"{path}[{index}]")
        ][:100]
    if _secret_key(path):
        before = after = "[凭据已隐藏]"
    return [
        {"path": path, "before": _preview(before), "after": _preview(after)},
    ]


def workflow_diff(before, after):
    old, new = (before or {}).get("nodes", {}), after.get("nodes", {})
    changes = []
    for node_id in sorted(set(old) | set(new)):
        kind = (
            "added"
            if node_id not in old
            else "removed"
            if node_id not in new
            else "modified"
        )
        if kind == "modified" and old[node_id] == new[node_id]:
            continue
        details = _details(old.get(node_id), new.get(node_id))
        description = (
            f"{ {'added': '新增', 'removed': '删除', 'modified': '修改'}[kind]}"
            f"节点："
            f"{node_id}"
        )
        if kind == "modified" and details:
            description += (
                "（"
                + "；".join(
                    f"{d['path']}"
                    f": "
                    f"{json.dumps(d['before'], ensure_ascii=False)}"
                    f" → "
                    f"{json.dumps(d['after'], ensure_ascii=False)}"
                    for d in details[:3]
                )[:600]
                + "）"
            )
        changes.append(
            {
                "kind": kind,
                "node_id": node_id,
                "description": description,
                "details": details,
            },
        )
    for field, label in [
        ("edges", "连接关系"),
        ("inputs", "业务输入"),
        ("outputs", "业务输出"),
        ("name", "名称"),
        ("description", "说明"),
        ("metadata", "布局或运行设置"),
    ]:
        if (before or {}).get(field) != after.get(field):
            changes.append(
                {
                    "kind": "modified",
                    "field": field,
                    "description": f"更新{label}",
                    "details": _details(
                        (before or {}).get(field),
                        after.get(field),
                        field,
                    ),
                },
            )
    return changes


async def propose(
    service,
    prompt,
    *,
    flow=None,
    name="",
    agent_id="default",
    scope_agent_id=None,
):
    prompt = prompt.strip()
    if not prompt or len(prompt) > 20000:
        raise ValueError("请提供1–20000字的工作流需求或修改要求。")
    base = copy.deepcopy(flow)
    if base is not None:
        if (
            not isinstance(base, dict)
            or not isinstance(base.get("nodes"), dict)
            or len(base["nodes"]) > 200
        ):
            raise ValueError("工作流草稿必须包含nodes对象，且不超过200个节点。")
        for node in base["nodes"].values():
            if not isinstance(node, dict) or not isinstance(
                node.get("inputs", {}),
                dict,
            ):
                raise ValueError("当前草稿含格式错误的节点或输入。")
        if "id" in base and not isinstance(base["id"], str):
            raise ValueError("工作流ID必须为字符串。")
    revision = (base or {}).get("revision")
    revision = 0 if revision is None else revision
    if (
        not isinstance(revision, int)
        or isinstance(revision, bool)
        or revision < 0
    ):
        raise ValueError("revision必须为非负整数。")
    flow_id = (base or {}).get("id") or f"flow-{uuid4().hex[:12]}"
    saved = service.get_flow(flow_id)
    if saved and saved["revision"] != revision:
        raise RevisionConflict("草稿版本已过期，请重新载入后生成修改建议。")
    scope_id, executor = await service.authoring_executor(
        scope_agent_id or agent_id,
    )
    llm = executor.llm_service
    if llm is None:
        raise AuthoringUnavailable("尚未连接可用模型。请先配置并启用模型，再使用AI搭建。")
    available_agents = await service.authoring_agents(scope_id)
    schemas = service.node_types(executor=executor)
    secrets = {}
    request = {
        "instruction": prompt,
        "name": name,
        "flow_id": flow_id,
        "current_flow": redact_credentials(base, secrets),
        "selected_agent_id": agent_id,
        "available_nodes": [
            item for item in schemas if item.get("available", True)
        ],
        "available_tools": service.available_tool_names(executor),
        "available_agents": available_agents,
        "available_workflows": [
            {"id": item["id"], "name": item.get("name", "")}
            for item in service.list_flows()
            if item["id"] != flow_id
        ],
    }
    encoded = json.dumps(request, ensure_ascii=False, allow_nan=False)
    if len(encoded) > 1200000:
        raise ValueError("工作流及节点目录过大，请缩小本次编辑范围。")
    try:
        response = await asyncio.wait_for(
            llm.complete(
                messages=[
                    ChatMessage.system(SYSTEM_PROMPT),
                    ChatMessage.user(encoded),
                ],
                temperature=0.1,
                max_tokens=12000,
            ),
            timeout=90,
        )
    except TimeoutError as exc:
        raise AuthoringUnavailable("模型生成超时，当前草稿未修改，请重试。") from exc
    except Exception as exc:
        raise AuthoringUnavailable("模型服务暂不可用，当前草稿未修改。请检查模型连接。") from exc
    text = getattr(response, "content", None)
    if not isinstance(text, str) or len(text) > 1000000:
        raise ValueError("模型未返回有效工作流JSON；当前草稿未修改。")
    try:
        text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip())
        data = json.loads(
            text,
            parse_constant=lambda value: (_ for _ in ()).throw(
                ValueError(value),
            ),
        )
    except (ValueError, TypeError) as exc:
        raise ValueError("模型返回的JSON无法解析；当前草稿未修改。") from exc
    candidate = data.get("flow", data) if isinstance(data, dict) else None
    if (
        not isinstance(candidate, dict)
        or not isinstance(candidate.get("nodes"), dict)
        or not 1 <= len(candidate["nodes"]) <= 200
        or any(not isinstance(n, dict) for n in candidate["nodes"].values())
    ):
        raise ValueError("模型生成的工作流必须包含1–200个合法节点对象。")
    candidate = restore_credentials(candidate, secrets)
    candidate.update(id=flow_id, revision=revision)
    candidate.setdefault("name", name or "AI工作流")
    if not isinstance(candidate.setdefault("metadata", {}), dict):
        raise ValueError("metadata必须为对象。")
    candidate["metadata"].update(
        source="model-proposal",
        authoring_prompt=prompt,
    )
    validation = service.validate_flow(candidate, executor=executor)
    known_agents = {item["id"] for item in available_agents}
    for node_id, node in candidate["nodes"].items():
        values = node.get("inputs") or {}
        if node.get("class_type") == "AgentNode" and isinstance(values, dict):
            selected = values.get("agent_id", "default")
            if not isinstance(selected, str) or selected not in known_agents:
                validation["errors"].append(
                    f"节点 {node_id} 引用了未启用或不可用于通用调用的专家ID。",
                )
    validation["ok"] = not validation["errors"]
    warnings = data.get("warnings", [])
    warnings = (
        [str(w)[:500] for w in warnings[:20]]
        if isinstance(warnings, list)
        else []
    )
    if any(
        n.get("class_type")
        in {"CodeNode", "ScriptNode", "ScriptAgentNode", "CodingAgentNode"}
        for n in candidate["nodes"].values()
    ):
        warnings.append("方案包含代码执行节点，请核对代码和执行边界后运行。")
    proposal = {
        "proposal_id": uuid4().hex,
        "flow": candidate,
        "base_revision": revision,
        "scope_agent_id": scope_id,
        "changes": workflow_diff(base, candidate),
        "validation": validation,
        "warnings": warnings,
        "expires_at": time.time() + 3600,
    }
    service.store_proposal(proposal)
    return proposal
