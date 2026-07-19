"""Built-in node classes.

``BUILTIN_NODES`` is the curated list the loader registers on startup.
Each import is wrapped in try/except so a node depending on unavailable
``leagent.*`` modules doesn't prevent the rest from loading.
"""

from __future__ import annotations

from ..base import WorkflowNode

BUILTIN_NODES: list[type[WorkflowNode]] = []

# ── Core control flow (always available) ─────────────────────────────────────
try:
    from .start import StartNode
    BUILTIN_NODES.append(StartNode)
except Exception:  # pragma: no cover
    pass

try:
    from .end import EndNode
    BUILTIN_NODES.append(EndNode)
except Exception:  # pragma: no cover
    pass

try:
    from .condition import ConditionNode
    BUILTIN_NODES.append(ConditionNode)
except Exception:  # pragma: no cover
    pass

try:
    from .tool_call import ToolCallNode
    BUILTIN_NODES.append(ToolCallNode)
except Exception:  # pragma: no cover
    pass

try:
    from .llm_call import LLMCallNode
    BUILTIN_NODES.append(LLMCallNode)
except Exception:  # pragma: no cover
    pass

try:
    from .script import ScriptNode
    BUILTIN_NODES.append(ScriptNode)
except Exception:  # pragma: no cover
    pass

try:
    from .parallel import ParallelNode
    BUILTIN_NODES.append(ParallelNode)
except Exception:  # pragma: no cover
    pass

try:
    from .wait import WaitNode
    BUILTIN_NODES.append(WaitNode)
except Exception:  # pragma: no cover
    pass

try:
    from .transform import TransformNode
    BUILTIN_NODES.append(TransformNode)
except Exception:  # pragma: no cover
    pass

try:
    from .error_handler import ErrorHandlerNode
    BUILTIN_NODES.append(ErrorHandlerNode)
except Exception:  # pragma: no cover
    pass

try:
    from .human_review import HumanReviewNode
    BUILTIN_NODES.append(HumanReviewNode)
except Exception:  # pragma: no cover
    pass

try:
    from .subworkflow import SubworkflowNode
    BUILTIN_NODES.append(SubworkflowNode)
except Exception:  # pragma: no cover
    pass

try:
    from .quality_gate import QualityGateNode
    BUILTIN_NODES.append(QualityGateNode)
except Exception:  # pragma: no cover
    pass

try:
    from .iterative_refine import IterativeRefineNode
    BUILTIN_NODES.append(IterativeRefineNode)
except Exception:  # pragma: no cover
    pass

try:
    from .preview import PreviewNode
    BUILTIN_NODES.append(PreviewNode)
except Exception:  # pragma: no cover
    pass

# ── Agent / media nodes (may depend on leagent runtime — optional) ───────────
try:
    from .control_agent import ControlAgentNode
    BUILTIN_NODES.append(ControlAgentNode)
except Exception:  # pragma: no cover
    pass

try:
    from .script_agent import ScriptAgentNode
    BUILTIN_NODES.append(ScriptAgentNode)
except Exception:  # pragma: no cover
    pass

try:
    from .coding_agent import CodingAgentNode
    BUILTIN_NODES.append(CodingAgentNode)
except Exception:  # pragma: no cover
    pass

try:
    from .load_image import LoadImageNode
    BUILTIN_NODES.append(LoadImageNode)
except Exception:  # pragma: no cover
    pass

try:
    from .load_mesh3d import LoadMesh3DNode
    BUILTIN_NODES.append(LoadMesh3DNode)
except Exception:  # pragma: no cover
    pass

try:
    from .asset_export import AssetExportNode
    BUILTIN_NODES.append(AssetExportNode)
except Exception:  # pragma: no cover
    pass

try:
    from .export_profiles import ExportProfilesNode
    BUILTIN_NODES.append(ExportProfilesNode)
except Exception:  # pragma: no cover
    pass

__all__ = ["BUILTIN_NODES"] + [cls.__name__ for cls in BUILTIN_NODES]
