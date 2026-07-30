# -*- coding: utf-8 -*-
"""FlowForge workflow engine package.

Full architecture ported from ``leagent.workflow``:

  * :mod:`flowforge.engine.io`            — typed IO primitives, Schema, HiddenHolder, NodeOutput, contract hooks.
  * :mod:`flowforge.engine.types`         — runtime models (status, condition, state, results).
  * :mod:`flowforge.engine.errors`         — error taxonomy.
  * :mod:`flowforge.engine.document`       — canonical WorkflowDocument + load/validate.
  * :mod:`flowforge.engine.progress`       — progress events + handler registry.
  * :mod:`flowforge.engine.graph`          — DynamicPrompt / TopologicalSort / ExecutionList.
  * :mod:`flowforge.engine.caching`        — multi-level cache (Null/Basic/LRU/RAM/Hierarchical + CacheKeySet).
  * :mod:`flowforge.engine.cache_provider` — pluggable cache provider interface.
  * :mod:`flowforge.engine.runner`         — NodeRunner (cache lookup → input resolve → validate → execute → retry → cache writeback).
  * :mod:`flowforge.engine.nodes`          — WorkflowNode base + NodeRegistry + 23 builtin nodes + loader + hot_reload.
  * :mod:`flowforge.engine.state_store`    — durable state persistence (JSON / in-memory).
  * :mod:`flowforge.engine.executor`       — async batched WorkflowExecutor.

The flat re-exports below let consumers ``from flowforge.engine import X``
without knowing the submodule layout.
"""

from __future__ import annotations

# ── IO layer (contract / schema / types) ────────────────────────────────────
from .io import (
    Hidden,
    HiddenHolder,
    IO,
    Input,
    InputBase,
    NodeOutput,
    OutputBase,
    Schema,
    WidgetInput,
    socket_color,
    types_compatible,
    widget_kind,
)
from .io.contract import (
    NOT_CACHEABLE,
    Contract,
    default_check_lazy_status,
    default_fingerprint_inputs,
)

# ── Types / errors / document ────────────────────────────────────────────────
from .types import (
    ConditionExpression,
    ConditionOperator,
    NodeExecutionResult,
    WorkflowResult,
    WorkflowState,
    WorkflowStatus,
)
from .errors import (
    BlockedError,
    DependencyCycleError,
    NodeExecutionError,
    ValidationError,
    WorkflowEngineError,
)
from .document import (
    WorkflowDocument,
    canonicalize,
    graph_hash,
    load,
    to_json,
    validate,
)

# ── Graph / progress / state ─────────────────────────────────────────────────
from .graph import (
    DynamicPrompt,
    ExecutionList,
    ExecutionState,
    ExpandFrame,
    TopologicalSort,
)
from .progress import (
    NodeStatus,
    ProgressEvent,
    ProgressHandler,
    ProgressRegistry,
)
from .state_store import (
    InMemoryWorkflowStateStore,
    JsonWorkflowStateStore,
    WorkflowRunSnapshot,
    WorkflowStateStore,
    build_workflow_state_store,
)

# ── Nodes (before runner to avoid circular import) ───────────────────────────
from .nodes import (
    NodeRegistry,
    WorkflowNode,
    bootstrap,
    get_registry,
)

# ── Caching / runner ──────────────────────────────────────────────────────────
from .caching import (
    BaseCache,
    BasicCache,
    CacheEntry,
    CacheKeySet,
    CacheKeySetID,
    CacheKeySetInputSignature,
    CacheSet,
    HierarchicalCache,
    LRUCache,
    NullCache,
    RAMPressureCache,
    build_cache_set,
    hash_signature,
)
from .cache_provider import (
    CacheProvider,
    NullCacheProvider,
)
from .runner import NodeRunner, NodeRunResult

# ── Executor ──────────────────────────────────────────────────────────────────
from .executor import WorkflowExecutor

__all__ = [
    # io
    "Hidden", "HiddenHolder", "IO", "Input", "InputBase", "NodeOutput",
    "OutputBase", "Schema", "WidgetInput",
    "socket_color", "types_compatible", "widget_kind",
    "NOT_CACHEABLE", "Contract",
    "default_check_lazy_status", "default_fingerprint_inputs",
    # types
    "ConditionExpression", "ConditionOperator", "NodeExecutionResult",
    "WorkflowResult", "WorkflowState", "WorkflowStatus",
    # errors
    "BlockedError", "DependencyCycleError", "NodeExecutionError",
    "ValidationError", "WorkflowEngineError",
    # document
    "WorkflowDocument", "canonicalize", "graph_hash", "load", "to_json", "validate",
    # graph
    "DynamicPrompt", "ExecutionList", "ExecutionState", "ExpandFrame",
    "TopologicalSort",
    # progress
    "NodeStatus", "ProgressEvent", "ProgressHandler", "ProgressRegistry",
    # state store
    "InMemoryWorkflowStateStore", "JsonWorkflowStateStore",
    "WorkflowRunSnapshot", "WorkflowStateStore", "build_workflow_state_store",
    # caching
    "BaseCache", "BasicCache", "CacheEntry", "CacheKeySet", "CacheKeySetID",
    "CacheKeySetInputSignature", "CacheSet", "HierarchicalCache", "LRUCache",
    "NullCache", "RAMPressureCache", "build_cache_set", "hash_signature",
    # cache provider
    "CacheProvider", "NullCacheProvider",
    # runner
    "NodeRunner",
    # nodes
    "NodeRegistry", "WorkflowNode", "bootstrap", "get_registry",
    # executor
    "WorkflowExecutor",
]
