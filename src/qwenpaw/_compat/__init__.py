# -*- coding: utf-8 -*-
"""Compatibility shims for agentscope 1.x APIs.

Remaining contents:
- ``Msg.to_dict`` / ``Msg.from_dict`` / ``Msg.timestamp`` monkey-patches
  (session files on disk still use the 1.x shape, and a couple of call
  sites — e.g. ``/load_history`` — read them via ``Msg.from_dict``).
- ``message.py``: legacy block coercion driven by ``msg_from_dict`` for
  1.x session restore.  No live code constructs the legacy block names
  directly anymore.
"""
from __future__ import annotations


def _install_msg_dict_shim() -> None:
    try:
        from agentscope.message import Msg
    except Exception:
        return

    if not hasattr(Msg, "to_dict"):

        def _to_dict(self):
            return self.model_dump()

        Msg.to_dict = _to_dict

    if not hasattr(Msg, "from_dict"):

        def _from_dict(cls, data):  # pylint: disable=unused-argument
            from .message import msg_from_dict

            return msg_from_dict(data)

        Msg.from_dict = classmethod(_from_dict)

    # ``Msg.timestamp`` (1.x format ``"YYYY-mm-dd HH:MM:SS.fff"``) was
    # renamed to ``Msg.created_at`` (ISO-8601 ``"YYYY-mm-ddTHH:MM:SS.fff"``)
    # in 2.0.  Keep a read-only alias so legacy call sites (notably the
    # context store which does ``msg.timestamp.split()[0]``) keep working.
    if not hasattr(Msg, "timestamp"):

        def _timestamp(self):
            value = getattr(self, "created_at", None)
            if not value:
                return ""
            return str(value).replace("T", " ")

        Msg.timestamp = property(_timestamp)


_install_msg_dict_shim()


def _install_agentscope_tool_utils_optional_fix() -> None:
    """Ensure ``Optional`` is resolvable in agentscope.tool._utils.

    agentscope's ``_utils.py`` creates a Pydantic model named
    ``_StructuredOutputDynamicClass`` via ``create_model()`` from function
    parameter annotations.  When a parameter uses ``Optional[...]`` and the
    annotation is a string forward reference (``from __future__ import
    annotations``), Pydantic looks up ``Optional`` in the module's global
    namespace — but agentscope.tool._utils does not import it, causing
    ``PydanticUserError: _StructuredOutputDynamicClass is not fully defined``.

    This shim injects ``Optional`` into that module's namespace so the
    forward reference resolves correctly.
    """
    try:
        import typing
        import agentscope.tool._utils as _utils_mod

        if not hasattr(_utils_mod, "Optional"):
            _utils_mod.Optional = typing.Optional
    except Exception:
        pass


_install_agentscope_tool_utils_optional_fix()
