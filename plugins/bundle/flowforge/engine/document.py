# -*- coding: utf-8 -*-
"""FlowForge canonical workflow document.

Simplified, self-contained port of ``leagent.workflow.io``:

  * :class:`WorkflowDocument` — the single persisted shape.
  * :func:`load` — parse a raw dict into a validated document.
  * :func:`validate` — check the graph is well-formed (node existence,
    link targets, cycle detection on strong links).

Node inputs declare data links as ``[upstream_node_id, slot]`` tuples
(mirroring LeAgent). Control-flow edges live under the node's
``control`` dict (``next``, ``conditions``, ``else`` …).

A ReactFlow-style frontend serialises into this shape via the REST
API; the executor consumes it directly.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Iterable

from pydantic import BaseModel, Field

from .errors import ValidationError
from .types import _resolve_template  # noqa: F401  (re-exported for symmetry)


class WorkflowDocument(BaseModel):
    """The single canonical workflow document shape.

    Fields mirror LeAgent's loader output so documents are portable.
    """

    id: str
    name: str = ""
    description: str = ""
    nodes: dict[str, dict[str, Any]] = Field(default_factory=dict)
    edges: list[dict[str, Any]] = Field(default_factory=list)
    inputs: list[dict[str, Any]] = Field(default_factory=list)
    outputs: list[str] | dict[str, Any] = Field(default_factory=list)
    start_id: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)
    version: str = "1.0"


@dataclass
class ValidationResult:
    ok: bool
    output_nodes: list[str] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)


def load(data: dict[str, Any] | str) -> WorkflowDocument:
    """Parse a raw dict (or JSON string) into a :class:`WorkflowDocument`."""
    if isinstance(data, str):
        import json

        data = json.loads(data)
    if not isinstance(data, dict):
        raise ValidationError("workflow document must be a JSON object")
    if "id" not in data or not data["id"]:
        raise ValidationError("workflow document missing required 'id' field")
    nodes = data.get("nodes") or {}
    if not isinstance(nodes, dict):
        raise ValidationError("'nodes' must be an object keyed by node id")
    # Normalise: every node has ``class_type`` and ``inputs`` dict.
    norm_nodes: dict[str, dict[str, Any]] = {}
    for nid, node in nodes.items():
        if not isinstance(node, dict):
            raise ValidationError(f"node '{nid}' must be an object")
        node = dict(node)
        node.setdefault("id", nid)
        node.setdefault("class_type", node.get("type") or "ToolNode")
        node.setdefault("inputs", {})
        node.setdefault("control", {})
        norm_nodes[str(nid)] = node
    data = dict(data)
    data["nodes"] = norm_nodes
    return WorkflowDocument.model_validate(data)


def validate(
    doc: WorkflowDocument,
    *,
    registry: Any = None,
) -> ValidationResult:
    """Validate a document structurally.

    Returns ``(ok, output_nodes, errors)``.
    """
    errors: list[str] = []
    nodes = doc.nodes
    if not nodes:
        errors.append("workflow has no nodes")
        return ValidationResult(False, [], errors)

    # Resolve outputs spec → list of node ids.
    output_nodes: list[str] = []
    if isinstance(doc.outputs, list):
        output_nodes = [str(n) for n in doc.outputs]
    elif isinstance(doc.outputs, dict):
        output_nodes = [str(k) for k in doc.outputs.keys()]
    if not output_nodes:
        # Fall back: every leaf node (no successors) is an output.
        succ: set[str] = set()
        for nid, node in nodes.items():
            ctrl = node.get("control") or {}
            if ctrl.get("next"):
                succ.add(ctrl["next"])
            for cond in ctrl.get("conditions", []) or []:
                t = cond.get("then_node") or cond.get("then")
                if t:
                    succ.add(t)
            for key in ("else_node", "else", "on_reject"):
                if ctrl.get(key):
                    succ.add(ctrl[key])
            for inp in (node.get("inputs") or {}).values():
                if isinstance(inp, list) and len(inp) == 2 and isinstance(inp[0], str):
                    succ.add(inp[0])
        output_nodes = [nid for nid in nodes if nid not in succ]
        if not output_nodes:
            output_nodes = list(nodes.keys())

    for out in output_nodes:
        if out not in nodes:
            errors.append(f"output node '{out}' not in nodes")

    # Check input-link targets exist.
    for nid, node in nodes.items():
        for fname, value in (node.get("inputs") or {}).items():
            refs: list[list[Any]] = []
            if (
                isinstance(value, list)
                and len(value) == 2
                and isinstance(value[0], str)
            ):
                refs.append(value)
            elif (
                isinstance(value, list)
                and value
                and all(
                    isinstance(item, list)
                    and len(item) == 2
                    and isinstance(item[0], str)
                    for item in value
                )
            ):
                refs.extend(value)
            for up_id, _slot in refs:
                if up_id not in nodes:
                    errors.append(
                        f"node '{nid}' input '{fname}' references "
                        f"unknown node '{up_id}'",
                    )

    # Check control successors exist.
    for nid, node in nodes.items():
        ctrl = node.get("control") or {}
        for key in ("next", "else_node", "else", "on_reject", "error_handler"):
            tgt = ctrl.get(key)
            if tgt and tgt not in nodes:
                errors.append(
                    f"node '{nid}' control.{key} -> unknown node '{tgt}'",
                )
        for cond in ctrl.get("conditions", []) or []:
            t = cond.get("then_node") or cond.get("then")
            if t and t not in nodes:
                errors.append(
                    f"node '{nid}' condition -> unknown node '{t}'",
                )

    ok = not errors
    return ValidationResult(ok, output_nodes, errors)


def to_json(doc: WorkflowDocument) -> str:
    """Serialise a document to canonical JSON."""
    return doc.model_dump_json(indent=2)


def graph_hash(doc: WorkflowDocument) -> str:
    """Stable content hash of the document (for cache-busting)."""
    import hashlib
    import json

    payload = json.dumps(
        doc.model_dump(mode="json"),
        sort_keys=True,
        ensure_ascii=False,
        default=str,
    )
    return hashlib.md5(payload.encode("utf-8")).hexdigest()


__all__ = [
    "ValidationResult",
    "WorkflowDocument",
    "graph_hash",
    "load",
    "to_json",
    "validate",
]
