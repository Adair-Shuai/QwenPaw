# -*- coding: utf-8 -*-
"""Signed, self-contained replay tokens for deterministic UGSci results."""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import secrets
import threading
from pathlib import Path
from typing import Any

MAX_TOKEN_LENGTH = 32_768
TOKEN_PREFIX = "ugsci:replay:v1"
_KEY_BYTES = 32
_KEY_LOCK = threading.Lock()
_cached_key: bytes | None = None


def _key_path() -> Path:
    from qwenpaw.constant import SECRET_DIR

    return SECRET_DIR / "ugsci-replay.key"


def _persisted_key() -> bytes:
    global _cached_key
    if _cached_key is not None:
        return _cached_key
    with _KEY_LOCK:
        if _cached_key is not None:
            return _cached_key
        path = _key_path()
        path.parent.mkdir(parents=True, exist_ok=True)
        try:
            raw = path.read_text(encoding="ascii").strip()
            key = bytes.fromhex(raw)
            if len(key) != _KEY_BYTES or path.is_symlink():
                raise ValueError("invalid replay signing key")
        except FileNotFoundError:
            key = secrets.token_bytes(_KEY_BYTES)
            flags = os.O_CREAT | os.O_EXCL | os.O_WRONLY | getattr(os, "O_NOFOLLOW", 0)
            try:
                fd = os.open(path, flags, 0o600)
            except FileExistsError:
                raw = path.read_text(encoding="ascii").strip()
                key = bytes.fromhex(raw)
            else:
                with os.fdopen(fd, "w", encoding="ascii") as handle:
                    handle.write(key.hex() + "\n")
                try:
                    os.chmod(path, 0o600)
                except OSError:
                    pass
        _cached_key = key
        return key


def _key() -> bytes:
    raw = os.environ.get("QWENPAW_UGSCI_REPLAY_SECRET", "")
    if raw:
        return hashlib.sha256(raw.encode("utf-8")).digest()
    try:
        return _persisted_key()
    except (ImportError, OSError):
        # A process fallback keeps restricted/read-only environments usable.
        if not hasattr(_key, "_fallback"):
            _key._fallback = secrets.token_bytes(32)  # type: ignore[attr-defined]
        return _key._fallback  # type: ignore[attr-defined]


def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("ascii").rstrip("=")


def _unb64(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def encode_replay_token(payload: dict[str, Any]) -> str:
    body = json.dumps(payload, ensure_ascii=True, sort_keys=True, separators=(",", ":")).encode()
    encoded = _b64(body)
    signature = hmac.new(_key(), encoded.encode("ascii"), hashlib.sha256).hexdigest()
    token = f"{TOKEN_PREFIX}:{encoded}:{signature}"
    if len(token) > MAX_TOKEN_LENGTH:
        raise ValueError("replay payload is too large")
    return token


def verify_replay_token(token: str) -> dict[str, Any]:
    if not isinstance(token, str) or len(token) > MAX_TOKEN_LENGTH:
        raise ValueError("invalid replay token")
    parts = token.split(":")
    if len(parts) != 5 or ":".join(parts[:3]) != TOKEN_PREFIX:
        raise ValueError("invalid replay token format")
    encoded, supplied = parts[3], parts[4]
    if len(supplied) != 64 or any(ch not in "0123456789abcdef" for ch in supplied.lower()):
        raise ValueError("invalid replay token signature")
    expected = hmac.new(_key(), encoded.encode("ascii"), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(supplied, expected):
        raise ValueError("replay token signature mismatch")
    try:
        payload = json.loads(_unb64(encoded))
    except (ValueError, TypeError, json.JSONDecodeError) as exc:
        raise ValueError("invalid replay token payload") from exc
    if not isinstance(payload, dict) or payload.get("kind") != "curated":
        raise ValueError("unsupported replay payload")
    return payload


__all__ = ["encode_replay_token", "verify_replay_token"]
