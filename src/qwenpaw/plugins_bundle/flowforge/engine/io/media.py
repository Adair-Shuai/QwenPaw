# -*- coding: utf-8 -*-
"""``MediaRef`` — the value object travelling across typed media sockets.

A :class:`MediaRef` is a storage-agnostic, *by-reference* handle to a
generated game-art asset (image, video, 3D mesh). It carries the managed
file id plus a preview URL so downstream nodes and the GenUI rendering
layer can display the asset without ever moving base64 bytes through the
graph (the canonical convention is ``/api/v1/files/{id}/preview``).

The wire form is a plain ``dict`` (``to_dict()``) so it serializes into
node outputs / workflow state cleanly; :meth:`from_dict` rehydrates it.
:meth:`from_artifact` builds one straight from the attachment dict
returned by :func:`leagent.file.tool_output.register_tool_artifact`.
"""

from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass, field
from typing import Any, Literal

MediaKind = Literal["image", "video", "model3d", "audio", "vfx"]

#: ``io_type`` of the typed socket each media kind flows through. A VFX asset
#: is delivered as a sprite-sheet / flipbook image, so it rides the IMAGE
#: socket and composes with image consumers (export, preview, conditioning).
KIND_TO_IO_TYPE: dict[str, str] = {
    "image": "IMAGE",
    "video": "VIDEO",
    "model3d": "MESH3D",
    "audio": "AUDIO",
    "vfx": "IMAGE",
}

#: GenUI component ``kind`` used to render each media kind on the canvas /
#: in chat. UGSci ``validate_ui_tree`` has no Video/Model3D kinds, so those
#: preview as ``Image`` (typically a still / thumbnail).
KIND_TO_GENUI: dict[str, str] = {
    "image": "Image",
    "video": "Image",
    "model3d": "Image",
    "audio": "Image",
    "vfx": "Image",
}


@dataclass
class MediaRef:
    """Reference to one managed media asset produced by a workflow node."""

    kind: MediaKind = "image"
    file_id: str | None = None
    preview_url: str | None = None
    download_url: str | None = None
    mime: str = ""
    filename: str = ""
    width: int | None = None
    height: int | None = None
    meta: dict[str, Any] = field(default_factory=dict)

    @property
    def src(self) -> str | None:
        """Best display URL for the asset."""
        if self.preview_url:
            return self.preview_url
        if self.file_id:
            return f"/api/v1/files/{self.file_id}/preview"
        return None

    @property
    def io_type(self) -> str:
        return KIND_TO_IO_TYPE.get(self.kind, "*")

    def to_dict(self) -> dict[str, Any]:
        out: dict[str, Any] = {
            "kind": self.kind,
            "file_id": self.file_id,
            "preview_url": self.preview_url,
            "download_url": self.download_url,
            "mime": self.mime,
            "filename": self.filename,
            "src": self.src,
        }
        if self.width is not None:
            out["width"] = self.width
        if self.height is not None:
            out["height"] = self.height
        if self.meta:
            out["meta"] = dict(self.meta)
        return out

    @classmethod
    def from_dict(cls, raw: Any) -> "MediaRef | None":
        """Rehydrate a MediaRef from its wire dict (tolerant of partials)."""
        if isinstance(raw, MediaRef):
            return raw
        if not isinstance(raw, dict):
            return None
        kind = str(raw.get("kind") or "image")
        return cls(
            kind=kind if kind in KIND_TO_IO_TYPE else "image",  # type: ignore[arg-type]
            file_id=raw.get("file_id"),
            preview_url=raw.get("preview_url") or raw.get("src"),
            download_url=raw.get("download_url"),
            mime=str(raw.get("mime") or ""),
            filename=str(raw.get("filename") or ""),
            width=raw.get("width"),
            height=raw.get("height"),
            meta=dict(raw.get("meta") or {}),
        )

    @classmethod
    def from_artifact(
        cls,
        attachment: dict[str, Any] | None,
        *,
        kind: MediaKind,
        mime: str = "",
        meta: dict[str, Any] | None = None,
    ) -> "MediaRef | None":
        """Build a MediaRef from a ``register_tool_artifact`` attachment dict."""
        if not isinstance(attachment, dict):
            return None
        file_id = str(attachment.get("id") or "") or None
        preview = attachment.get("preview_url") or attachment.get("preview_path")
        if not preview and file_id:
            preview = f"/api/v1/files/{file_id}/preview"
        return cls(
            kind=kind,
            file_id=file_id,
            preview_url=preview,
            download_url=attachment.get("download_url"),
            mime=mime or str(attachment.get("content_type") or ""),
            filename=str(attachment.get("filename") or attachment.get("name") or ""),
            meta=dict(meta or {}),
        )

    def gen_ui_node(self, *, caption: str | None = None) -> dict[str, Any]:
        """Render this asset as a GenUI component node (image/video/3D)."""
        comp = KIND_TO_GENUI.get(self.kind, "Image")
        props: dict[str, Any] = {"src": self.src or ""}
        if self.file_id:
            props["fileId"] = self.file_id
        cap = caption
        if self.width and self.height:
            dim = f"{self.width}\u00d7{self.height}"
            cap = f"{cap} · {dim}" if cap else dim
        if self.kind == "video" and not cap:
            cap = self.filename or "Video preview"
        elif self.kind == "model3d" and not cap:
            cap = self.filename or "3D mesh preview"
        if cap:
            props["caption"] = cap
        if self.filename and not cap:
            props["alt"] = self.filename
        if comp == "Image":
            props.setdefault("rounded", True)
            props.setdefault("maxHeight", 320)
            props.setdefault("fit", "contain")
            if self.width and self.height:
                props["aspect"] = f"{self.width}:{self.height}"
                props["width"] = self.width
                props["height"] = self.height
        return {"kind": comp, "props": props}


def _validate_gen_ui_tree(tree: dict[str, Any]) -> dict[str, Any]:
    """Run UGSci schema validation.

    If the UGSci package is missing (standalone FlowForge), keep the raw tree.
    Validation failures propagate so callers do not publish illegal kinds.
    """
    try:
        from qwenpaw.plugins_bundle.ugsci.genui.schema import validate_ui_tree
    except ImportError:
        return tree
    return validate_ui_tree(tree)


def _flowforge_ui_id(*parts: str | None) -> str:
    """Build a UGSci ``ui_id`` (``ui_`` + 4–80 safe chars) unique per payload."""
    raw = "_".join(str(part or "").strip() for part in parts if str(part or "").strip())
    digest = hashlib.sha1(raw.encode("utf-8")).hexdigest()[:10]
    head = re.sub(r"[^a-zA-Z0-9]+", "_", raw.lower()).strip("_")[:48]
    body = f"ff_{head}_{digest}" if head else f"ff_{digest}"
    return f"ui_{body[:80]}"


def publish_gen_ui(tree: dict[str, Any], *, ui_id: str = "") -> dict[str, Any]:
    """Validate with UGSci and store a chat snapshot when a session exists.

    Returns a ``NodeOutput.ui`` payload: ``gen_ui`` is the validated tree for
    the canvas; ``genui`` is the UGSci envelope used by chat inline cards.
    """
    normalized = _validate_gen_ui_tree(tree)
    ui: dict[str, Any] = {"gen_ui": normalized}
    try:
        from qwenpaw.plugins_bundle.ugsci.genui.emit_core import get_session_id, store_validated_tree

        if get_session_id():
            envelope = store_validated_tree(normalized, ui_id=ui_id or _flowforge_ui_id("asset"))
            ui["genui"] = envelope
    except Exception:
        pass
    return ui


def to_gen_ui_tree(refs: list[MediaRef], *, title: str | None = None) -> dict[str, Any]:
    """Wrap one or more MediaRefs into a UGSci-validated GenUI asset tree."""
    children = [r.gen_ui_node() for r in refs if r.src]
    root_children: list[dict[str, Any]] = []
    if title:
        root_children.append({"kind": "SectionHeader", "props": {"title": title}})
    if len(children) > 1:
        root_children.append({"kind": "Grid", "props": {"columns": 2}, "children": children})
    else:
        root_children.extend(children)
    return _validate_gen_ui_tree({"schemaVersion": "1", "root": {"kind": "Stack", "children": root_children}})


def to_gen_ui_ui(refs: list[MediaRef], *, title: str | None = None) -> dict[str, Any]:
    """NodeOutput.ui payload: validated tree plus UGSci envelope when possible."""
    extra = ""
    if refs:
        extra = str(refs[0].file_id or refs[0].src or "")
    return publish_gen_ui(to_gen_ui_tree(refs, title=title), ui_id=_flowforge_ui_id(title, extra))


def flowforge_gen_ui_id(*parts: str | None) -> str:
    """Stable, distinct chat card id for a FlowForge media payload."""
    return _flowforge_ui_id(*parts)


__all__ = [
    "KIND_TO_GENUI",
    "KIND_TO_IO_TYPE",
    "MediaKind",
    "MediaRef",
    "flowforge_gen_ui_id",
    "publish_gen_ui",
    "to_gen_ui_tree",
    "to_gen_ui_ui",
]
