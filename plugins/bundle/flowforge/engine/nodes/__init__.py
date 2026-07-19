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

__all__ = ["WorkflowNode"]

# ── Registry ──────────────────────────────────────────────────────────────────
try:
    from .registry import (
        NodeRegistry,
        get_registry,
        reset_registry,
    )
    __all__ += ["NodeRegistry", "get_registry", "reset_registry"]
except ImportError:  # pragma: no cover
    pass

# ── Loader ────────────────────────────────────────────────────────────────────
_bootstrap_sync = None
try:
    from .loader import (
        bootstrap_sync,
        load_builtins,
        load_directory,
        load_entrypoints,
    )
    _bootstrap_sync = bootstrap_sync
    __all__ += ["bootstrap_sync", "load_builtins", "load_directory", "load_entrypoints"]
except ImportError:  # pragma: no cover
    pass


def bootstrap():
    """Synchronous bootstrap: register builtin nodes into the registry.

    Tries the loader's ``bootstrap_sync`` first; falls back to manually
    registering builtin nodes if the loader is unavailable.
    """
    try:
        from .registry import get_registry
        reg = get_registry()
    except ImportError:
        return None

    # Try loader's sync bootstrap
    if _bootstrap_sync is not None:
        try:
            _bootstrap_sync()
            return reg
        except Exception:
            pass

    # Fallback: manually register builtin nodes
    try:
        from .builtin import BUILTIN_NODES
        for node_cls in BUILTIN_NODES:
            try:
                if hasattr(reg, 'register'):
                    reg.register(node_cls)
                elif hasattr(reg, 'register_class'):
                    reg.register_class(node_cls)
            except Exception:
                pass
    except ImportError:
        pass
    return reg


__all__ += ["bootstrap"]

# ── Extension ─────────────────────────────────────────────────────────────────
try:
    from .extension import NodeExtension
    __all__ += ["NodeExtension"]
except ImportError:  # pragma: no cover
    pass

# ── Hot reload ────────────────────────────────────────────────────────────────
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
    __all__ += ["NodeReplaceRegistry", "NodeReplacement", "get_replace_registry", "reset_replace_registry"]
except ImportError:  # pragma: no cover
    pass

# ── Tool factory ─────────────────────────────────────────────────────────────
try:
    from .tool_factory import (
        build_node_class,
        clear_factory_cache,
        register_tool_nodes,
    )
    __all__ += ["build_node_class", "clear_factory_cache", "register_tool_nodes"]
except ImportError:  # pragma: no cover
    pass


def get_registry():
    """Get or create the singleton NodeRegistry."""
    try:
        from .registry import get_registry as _get
        return _get()
    except ImportError:
        from .registry import NodeRegistry
        if not hasattr(get_registry, '_instance'):
            get_registry._instance = NodeRegistry()
        return get_registry._instance


# ── Compat layer: old simplified node API ────────────────────────────────────
# Re-export the old node classes + old NodeRegistry/NodeRunner so that
# executor.py, service.py, router.py and tests keep working unchanged.
from .compat import (
    AgentNode,
    CodeNode,
    ConditionNode,
    HiddenHolder,
    InputNode,
    LLMNode,
    NodeOutput,
    NodeRegistry,
    OutputNode,
    ToolNode,
    NodeRunner,
    NodeRunResult,
    bootstrap as _compat_bootstrap,
    get_registry as _compat_get_registry,
)

# Use compat bootstrap/get_registry as default (they use the old simplified API)
bootstrap = _compat_bootstrap
get_registry = _compat_get_registry

__all__ += [
    "AgentNode", "CodeNode", "ConditionNode", "InputNode", "LLMNode",
    "OutputNode", "ToolNode", "NodeRunner", "NodeRunResult",
]
