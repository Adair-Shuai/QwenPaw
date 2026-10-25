# -*- coding: utf-8 -*-
"""FlowForge service layer — flow persistence + run management.

Sits between the REST router and the :class:`WorkflowExecutor`. Owns:
  * JSON-file flow persistence under ``~/.qwenpaw/flowforge/flows/``.
  * Live run registry (run_id → run handle) with async result futures.
  * Progress event collectors for SSE / WebSocket replay.
"""

from __future__ import annotations

import asyncio
import logging
import os
import threading
import time
import re
from concurrent.futures import Future
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any
from uuid import UUID

from .execution_repository import ExecutionRepository
from .flow_repository import FlowRepository, RevisionConflict
from .engine.errors import ValidationError as WorkflowValidationError
from .lifecycle import RunLifecycleMixin
from .engine import (
    ProgressRegistry,
    WorkflowExecutor,
    WorkflowResult,
    WorkflowStatus,
    build_workflow_state_store,
    canonicalize,
    load,
    validate,
)

logger = logging.getLogger(__name__)

DEFAULT_FLOWS_DIR_NAME = "flows"
# Keep the run-list response useful for the run center without allowing a
# verbose progress stream to make every polling response unbounded.
RUN_SUMMARY_EVENT_LIMIT = 100


def _materialize_edge_dependencies(payload: dict[str, Any]) -> dict[str, Any]:
    """Backward-compatible alias for the canonical graph normalizer."""
    return canonicalize(payload)


@dataclass
class RunHandle:
    """Live handle for an in-progress or completed workflow run."""

    run_id: str
    flow_id: str
    state_id: UUID
    progress: ProgressRegistry
    task: asyncio.Task | None = None
    future: Future | None = None  # concurrent.futures.Future from background loop
    result: WorkflowResult | None = None
    error: str | None = None
    cancel_requested: bool = False
    started_at: float = field(default_factory=time.time)
    finished_at: float | None = None
    # A future can become done just before its callback persists the terminal
    # record.  Keep the public handle non-terminal until that write finishes,
    # so callers that observe ``is_done`` can safely restart and read the
    # durable state immediately.
    finalized: bool = False
    metadata: dict[str, Any] = field(default_factory=dict)

    @property
    def status(self) -> WorkflowStatus:
        if self.cancel_requested:
            return WorkflowStatus.CANCELLED
        if self.result is not None:
            return self.result.status
        if self.error is not None:
            return WorkflowStatus.FAILED
        return WorkflowStatus.RUNNING

    @property
    def is_done(self) -> bool:
        return self.finalized

    def to_dict(self) -> dict[str, Any]:
        history = self.progress.history()
        return {
            **self.metadata,
            "run_id": self.run_id,
            "flow_id": self.flow_id,
            "state_id": str(self.state_id),
            "status": self.status.value,
            "started_at": self.started_at,
            "finished_at": self.finished_at,
            "error": self.error,
            "node_statuses": self.progress.node_statuses(),
            "outputs": self.result.outputs if self.result else {},
            "errors": self.result.errors if self.result else [],
            "duration_ms": self.result.duration_ms if self.result else 0,
            "events": [event.to_dict() for event in history[-RUN_SUMMARY_EVENT_LIMIT:]],
        }


class WorkflowService(RunLifecycleMixin):
    """Top-level service: flow CRUD + run lifecycle + progress routing.

    Runs workflows on a dedicated background event-loop thread so that
    run lifetime is decoupled from any single HTTP request (FastAPI's
    TestClient tears down its per-request loop, which would otherwise
    cancel any ``asyncio.ensure_future`` task).
    """

    def __init__(
        self,
        *,
        flows_dir: Path | str,
        executor: WorkflowExecutor | None = None,
    ) -> None:
        self._flows_dir = Path(flows_dir)
        self._flows_dir.mkdir(parents=True, exist_ok=True)
        self._flow_repository = FlowRepository(self._flows_dir)
        self._execution_repository = ExecutionRepository(self._flows_dir)
        recovered = self._execution_repository.recover_incomplete(
            active_owner_pid=os.getpid(),
        )
        if recovered:
            logger.warning("recovered %d interrupted FlowForge run(s)", recovered)
        self._executor = executor or WorkflowExecutor(
            state_store=build_workflow_state_store(self._flows_dir),
        )
        self._runs: dict[str, RunHandle] = {}
        self._lifecycle_lock = threading.RLock()
        self._executor.workflow_service = self
        self.node_catalog = None
        # Background event loop so runs outlive any single HTTP request.
        self._loop = asyncio.new_event_loop()
        self._loop_thread = threading.Thread(
            target=self._loop.run_forever,
            name="flowforge-loop",
            daemon=True,
        )
        self._loop_thread.start()

    def __del__(self) -> None:  # pragma: no cover — best-effort cleanup
        try:
            self._loop.call_soon_threadsafe(self._loop.stop)
        except Exception:
            pass

    # ------------------------------------------------------------------
    # Properties for the router to introspect.
    # ------------------------------------------------------------------
    @property
    def executor(self) -> WorkflowExecutor:
        return self._executor

    @property
    def flows_dir(self) -> Path:
        return self._flows_dir

    # ------------------------------------------------------------------
    # Flow CRUD
    # ------------------------------------------------------------------
    def list_flows(self) -> list[dict[str, Any]]:
        return [
            {
                "id": data["id"],
                "name": data.get("name", data["id"]),
                "description": data.get("description", ""),
                "version": data.get("version", "1.0"),
                "revision": data["revision"],
                "node_count": len(data.get("nodes", {})),
                "updated_at": data["updated_at"],
            }
            for data in self._flow_repository.list()
        ]

    def get_flow(self, flow_id: str) -> dict[str, Any] | None:
        return self._flow_repository.get(flow_id)

    def save_flow(
        self,
        flow_id: str,
        payload: dict[str, Any],
        *,
        expected_revision: int | None = None,
        proposal_id: str | None = None,
    ) -> dict[str, Any]:
        if not flow_id or len(flow_id) > 200:
            raise ValueError("工作流ID必须为1–200字符。")
        if expected_revision is None:
            expected_revision = payload.get("revision")
        payload = _materialize_edge_dependencies(payload)
        payload["id"] = flow_id
        for node in (payload.get("nodes") or {}).values():
            if isinstance(node, dict):
                node.pop("func", None)
        # Drafts may be incomplete. Their shape is normalized, while execution
        # and proposal application use the selected agent's current catalogue.
        normalized = load(payload).model_dump(mode="json")
        return self._flow_repository.save(
            flow_id, normalized, expected_revision, proposal_id=proposal_id
        )

    def delete_flow(self, flow_id: str) -> bool:
        return self._flow_repository.delete(flow_id)

    @staticmethod
    def available_tool_names(executor) -> list[str]:
        names = {
            str(cls.get_schema().metadata["tool_name"])
            for _, cls in executor.node_registry.items()
            if cls.get_schema().metadata.get("auto_generated")
            and cls.get_schema().metadata.get("tool_name")
        }
        registry = executor.tool_registry
        if registry is not None:
            if hasattr(registry, "names"):
                names.update(registry.names())
            elif isinstance(registry, dict):
                names.update(registry)
        return sorted(names)

    def validate_flow(
        self,
        payload: dict[str, Any],
        *,
        node_registry=None,
        executor=None,
        resuming=False,
    ) -> dict[str, Any]:
        executor = executor or self._executor
        try:
            doc = load(_materialize_edge_dependencies(payload))
            result = validate(doc, registry=node_registry or executor.node_registry)
            unavailable = {
                item["class_type"]: item["unavailable_reason"]
                for item in self.node_types(executor=executor)
                if not item.get("available", True)
            }
            tools = self.available_tool_names(executor)
            for node_id, node in doc.nodes.items():
                kind = node.get("class_type")
                if kind in unavailable:
                    result.errors.append(f"节点 {node_id} 当前不可用：{unavailable[kind]}")
                values = node.get("inputs") or {}
                if not isinstance(values, dict):
                    continue
                if kind in {"ToolNode", "ToolCallNode"}:
                    tool = (
                        values.get("tool_name")
                        if kind == "ToolNode"
                        else values.get("tool")
                    )
                    if not isinstance(tool, str) or tool not in tools:
                        result.errors.append(f"节点 {node_id} 引用了当前专家未启用的工具：{tool}")
                if kind == "SubworkflowNode" and not resuming:
                    target = values.get("subworkflow_id")
                    if isinstance(target, str) and not self.get_flow(target):
                        result.errors.append(f"节点 {node_id} 引用了不存在的子工作流：{target}")
            return {
                "ok": not result.errors,
                "errors": result.errors,
                "output_nodes": result.output_nodes,
            }
        except (
            ValueError,
            TypeError,
            AttributeError,
            KeyError,
            WorkflowValidationError,
        ) as exc:
            return {"ok": False, "errors": [str(exc)], "output_nodes": []}

    async def authoring_executor(self, agent_id: str | None = None):
        from qwenpaw.app.agent_context import get_current_agent_id

        scope = agent_id or get_current_agent_id() or "default"
        if self.node_catalog is None:
            return scope, self._executor
        try:
            return scope, await self.node_catalog.prepare(self._executor, scope, {})
        except RuntimeError as exc:
            from .authoring import AuthoringUnavailable

            raise AuthoringUnavailable("专家能力目录暂不可用，请检查宿主服务后重试。") from exc

    async def authoring_agents(self, scope_id: str) -> list[dict[str, str]]:
        if self.node_catalog is None:
            return [{"id": scope_id, "name": scope_id}]
        from qwenpaw.config.utils import load_config
        from qwenpaw.config.config import load_agent_config

        config = await asyncio.to_thread(load_config)
        result = []
        for agent_id, profile in config.agents.profiles.items():
            if not getattr(profile, "enabled", True):
                continue
            try:
                settings = await asyncio.to_thread(load_agent_config, agent_id)
                if str(getattr(settings, "template_id", "") or "").startswith(
                    "pawapp:"
                ):
                    continue
                if getattr(settings, "available_in_chat", True) is False or getattr(
                    settings, "managed_by_app", None
                ):
                    continue
                result.append(
                    {
                        "id": agent_id,
                        "name": str(getattr(settings, "name", agent_id)),
                        "description": str(getattr(settings, "description", "") or "")[
                            :500
                        ],
                    }
                )
            except Exception:
                # Missing agent configuration is not evidence of availability.
                continue
        return result

    async def validate_flow_for_agent(
        self, payload: dict[str, Any], agent_id: str | None = None
    ) -> dict[str, Any]:
        _, executor = await self.authoring_executor(agent_id)
        return self.validate_flow(payload, executor=executor)

    async def create_proposal(
        self,
        prompt: str,
        *,
        flow=None,
        name="",
        agent_id="default",
        scope_agent_id=None,
    ):
        from .authoring import propose

        return await propose(
            self,
            prompt,
            flow=flow,
            name=name,
            agent_id=agent_id,
            scope_agent_id=scope_agent_id,
        )

    def _proposal_to_apply(self, proposal_id, expected_revision):
        proposal = self._flow_repository.proposal(proposal_id)
        if proposal is None:
            raise RevisionConflict("修改建议已应用或已过期，请重新生成。")
        if expected_revision != proposal["base_revision"]:
            raise RevisionConflict("修改建议基础版本不匹配。")
        if not proposal["validation"]["ok"]:
            raise ValueError("修改建议未通过校验，不能应用。")
        return proposal

    def apply_proposal(self, proposal_id: str, expected_revision: int):
        if self.node_catalog is not None:
            raise ValueError("动态专家目录需通过异步apply_proposal_for_agent复核。")
        proposal = self._proposal_to_apply(proposal_id, expected_revision)
        return self._apply_validated_proposal(
            proposal, expected_revision, self._executor
        )

    def _apply_validated_proposal(self, proposal, expected_revision, executor):
        flow = proposal["flow"]
        validation = self.validate_flow(flow, executor=executor)
        if not validation["ok"]:
            raise ValueError("修改建议已失效：" + "; ".join(validation["errors"]))
        return self.save_flow(
            flow["id"],
            flow,
            expected_revision=expected_revision,
            proposal_id=proposal["proposal_id"],
        )

    async def apply_proposal_for_agent(
        self, proposal_id: str, expected_revision: int, agent_id: str | None = None
    ):
        proposal = self._proposal_to_apply(proposal_id, expected_revision)
        scope = proposal["scope_agent_id"]
        if agent_id and agent_id != scope:
            raise RevisionConflict("修改建议属于其他专家范围，请切换至原专家或重新生成。")
        _, executor = await self.authoring_executor(scope)
        agents = {item["id"] for item in await self.authoring_agents(scope)}
        for node in proposal["flow"]["nodes"].values():
            if (
                node.get("class_type") == "AgentNode"
                and node.get("inputs", {}).get("agent_id", "default") not in agents
            ):
                raise ValueError("修改建议中的专家已禁用或不允许通用调用。")
        return self._apply_validated_proposal(proposal, expected_revision, executor)

    def flow_versions(self, flow_id: str):
        return self._flow_repository.versions(flow_id)

    def restore_version(self, flow_id: str, revision: int, expected_revision: int):
        flow = self._flow_repository.version(flow_id, revision)
        if flow is None:
            raise FileNotFoundError("工作流历史版本不存在。")
        return self.save_flow(flow_id, flow, expected_revision=expected_revision)

    def generate_flow(
        self,
        prompt: str,
        *,
        name: str = "",
        agent_id: str = "default",
    ) -> dict[str, Any]:
        """Turn a plain-language SOP into a portable, editable draft."""
        prompt = (prompt or "").strip()
        if not prompt:
            raise ValueError("prompt must not be empty")
        raw_steps = re.split(r"(?:\n+|[。；;]+|\s*(?:->|→)\s*)", prompt)
        steps = []
        for item in raw_steps:
            item = re.sub(
                r"^\s*(?:第?[一二三四五六七八九十\d]+[步、.：:]?|\d+[.)、])\s*", "", item
            ).strip()
            if item and item not in steps:
                steps.append(item)
        if len(steps) == 1:
            chunks = re.split(r"[，,]\s*(?:然后|再|并且|最后)?", steps[0])
            steps = [chunk.strip() for chunk in chunks if chunk.strip()]
        steps = steps[:12] or [prompt]

        flow_id = (
            re.sub(r"[^a-zA-Z0-9_-]+", "-", name or steps[0])[:40].strip("-").lower()
        )
        flow_id = flow_id or f"sop-{int(time.time())}"
        nodes: dict[str, dict[str, Any]] = {
            "input": {
                "id": "input",
                "class_type": "InputNode",
                "inputs": {"name": "request"},
                "control": {"next": "step_1"},
                "label": "业务输入",
            },
        }
        positions: dict[str, dict[str, int]] = {"input": {"x": 80, "y": 180}}
        edges: list[dict[str, Any]] = []
        previous = "input"
        for index, step in enumerate(steps, start=1):
            node_id = f"step_{index}"
            next_id = f"step_{index + 1}" if index < len(steps) else "output"
            nodes[node_id] = {
                "id": node_id,
                "class_type": "AgentNode",
                "label": f"步骤 {index}",
                "inputs": {
                    # Bind by the runtime's stable agent identifier. Display
                    # names are mutable and may not be accepted by the agent
                    # runtime (for example CloudPaw-Master is commonly stored
                    # as ``cloud-orchestrator``).
                    "agent_id": agent_id.strip() or "default",
                    "query": f"请严格执行以下 SOP 步骤：{step}",
                    "context": [previous, 0],
                    "__flow_dependencies": [[previous, 0]],
                },
                "control": {"next": next_id},
            }
            positions[node_id] = {"x": 360 + (index - 1) * 300, "y": 180}
            edges.append(
                {"id": f"e-{previous}-{node_id}", "source": previous, "target": node_id}
            )
            previous = node_id
        nodes["output"] = {
            "id": "output",
            "class_type": "OutputNode",
            "label": "流程结果",
            "inputs": {"value": [previous, 0]},
            "control": {},
        }
        positions["output"] = {"x": 360 + len(steps) * 300, "y": 180}
        edges.append(
            {"id": f"e-{previous}-output", "source": previous, "target": "output"}
        )
        return {
            "id": flow_id,
            "name": name.strip() or f"{steps[0][:20]} SOP",
            "description": prompt[:240],
            "nodes": nodes,
            "edges": edges,
            "inputs": [
                {
                    "name": "request",
                    "type": "string",
                    "required": False,
                    "default": "",
                    "label": "业务输入",
                }
            ],
            "outputs": ["output"],
            "start_id": "input",
            "metadata": {
                "positions": positions,
                "source": "sequential-template",
                "sop": prompt,
            },
            "version": "1.0",
        }

    # ------------------------------------------------------------------
    # Run lifecycle
    # ------------------------------------------------------------------
    def node_types(self, *, executor=None) -> list[dict[str, Any]]:
        executor = executor or self._executor
        catalog = executor.node_registry.all_types()
        for item in catalog:
            reason = None
            if item["class_type"] == "ParallelNode":
                reason = "内嵌分支执行器未接入，请使用独立DAG分支与下游汇合。"
            elif (
                item["class_type"] == "SubworkflowNode"
                and getattr(executor, "workflow_service", None) is None
            ):
                reason = "工作流服务未接入，无法运行子工作流。"
            item["available"] = reason is None
            if reason:
                item["unavailable_reason"] = reason
        return catalog

    async def refresh_node_types(
        self, agent_id: str | None = None
    ) -> list[dict[str, Any]]:
        _, executor = await self.authoring_executor(agent_id)
        return self.node_types(executor=executor)

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------
    def _flow_path(self, flow_id: str) -> Path:
        safe = "".join(c if c.isalnum() or c in "-_." else "_" for c in flow_id)
        return self._flows_dir / f"{safe}.json"


def default_flows_dir() -> Path:
    """Return the default flows directory under the QwenPaw working dir."""
    try:
        from qwenpaw.constant import WORKING_DIR

        root = Path(WORKING_DIR) / "flowforge"
    except Exception:
        # Tests / standalone: use a temp-ish dir under the user home.
        root = Path.home() / ".qwenpaw" / "flowforge"
    (root / DEFAULT_FLOWS_DIR_NAME).mkdir(parents=True, exist_ok=True)
    return root / DEFAULT_FLOWS_DIR_NAME


def build_service(
    *,
    flows_dir: Path | str | None = None,
    executor: WorkflowExecutor | None = None,
) -> WorkflowService:
    """Build a :class:`WorkflowService` with sensible defaults."""
    root = Path(flows_dir) if flows_dir is not None else default_flows_dir()
    return WorkflowService(flows_dir=root, executor=executor)


__all__ = [
    "DEFAULT_FLOWS_DIR_NAME",
    "RunHandle",
    "WorkflowService",
    "build_service",
    "default_flows_dir",
]
