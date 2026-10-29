# -*- coding: utf-8 -*-
"""Standardized node definition system.

Publishes :class:`WorkflowNode`, the :class:`NodeRegistry`, the
:class:`NodeExtension` packaging contract, the filesystem/entrypoint
loader, the hot-reload watcher, and the node-replacement registry.

Each submodule import is wrapped in try/except so a single broken
module (e.g. one depending on leagent runtime) doesn't prevent the
entire package from loading.
"""

from __future__ import annotations

from .base import WorkflowNode
from .builtin.core import (
    AgentNode,
    CodeNode,
    ConditionNode,
    InputNode,
    LLMNode,
    OutputNode,
    ToolNode,
)

__all__ = ["WorkflowNode"]

# Registry
try:
    from .registry import (
        NodeRegistry,
        reset_registry,
    )

    __all__ += ["NodeRegistry", "get_registry", "reset_registry"]
except ImportError:  # pragma: no cover
    pass

# Loader
_bootstrap_sync = None
try:
    from .loader import (
        bootstrap_sync,
        load_builtins,
        load_directory,
        load_entrypoints,
    )

    _bootstrap_sync = bootstrap_sync
    __all__ += [
        "bootstrap_sync",
        "load_builtins",
        "load_directory",
        "load_entrypoints",
    ]
except ImportError:  # pragma: no cover
    pass


def bootstrap():
    """Synchronously register schema-native builtin nodes.

    Dynamic/entrypoint discovery remains available through ``loader`` but is
    deliberately not run here: executor construction may occur inside an
    active event loop (for example a SubworkflowNode), where a sync wrapper
    around an async loader is unsafe.
    """
    try:
        from .registry import get_registry as registry_get

        reg = registry_get()
    except ImportError:
        return None

    try:
        from .builtin import BUILTIN_NODES

        for node_cls in BUILTIN_NODES:
            try:
                reg.register(node_cls)
            except Exception:
                pass
    except ImportError:
        pass
    return reg


__all__ += ["bootstrap"]

# Extension
try:
    from .extension import NodeExtension

    __all__ += ["NodeExtension"]
except ImportError:  # pragma: no cover
    pass

# Hot reload
try:
    from .hot_reload import HotReloader

    __all__ += ["HotReloader"]
except ImportError:  # pragma: no cover
    pass

# ── Replacement ──────────────────────────────────────────────────────────────
try:
    from .replacement import (
        NodeReplaceRegistry,
        NodeReplacement,
        get_replace_registry,
        reset_replace_registry,
    )

    __all__ += [
        "NodeReplaceRegistry",
        "NodeReplacement",
        "get_replace_registry",
        "reset_replace_registry",
    ]
except ImportError:  # pragma: no cover
    pass

# ── Tool factory ─────────────────────────────────────────────────────────────
try:
    from .tool_factory import (
        build_node_class,
        clear_factory_cache,
        register_tool_nodes,
    )

    __all__ += [
        "build_node_class",
        "clear_factory_cache",
        "register_tool_nodes",
    ]
except ImportError:  # pragma: no cover
    pass


_fallback_registry = None


def get_registry():
    """Get or create the singleton NodeRegistry."""
    global _fallback_registry
    try:
        from .registry import get_registry as _get

        return _get()
    except ImportError:
        from .registry import NodeRegistry as registry_class

        if _fallback_registry is None:
            _fallback_registry = registry_class()
        return _fallback_registry


# Schema-native authoring nodes retain their established class ids.
__all__ += [
    "AgentNode",
    "CodeNode",
    "ConditionNode",
    "InputNode",
    "LLMNode",
    "OutputNode",
    "ToolNode",
]
