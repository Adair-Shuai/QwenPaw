# -*- coding: utf-8 -*-
# [PROXY-BYPASS] Network proxy bypass / custom proxy configuration.
# See: src/qwenpaw/docs/proxy-bypass-design.md
#
# This module is the single source of truth for proxy behaviour.
# All providers call should_use_custom_http_client() and
# build_httpx_proxy_kwargs() to decide whether to inject a custom
# httpx client into their SDK clients.
from __future__ import annotations

import ipaddress
import logging
import os
from typing import Any, Optional
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

_LOOPBACK_HOSTNAMES = {"localhost"}

# [PROXY-BYPASS] Module-level cache of the network config. Updated by
# ``apply_network_config()`` at startup and whenever the user
# changes proxy settings via the API.
_network_config: Any = None

# [PROXY-BYPASS] Bug1 fix: Snapshot of the *original* proxy-related env
# vars captured before the first call to ``apply_network_config()``.
# We need these so we can restore them when the user switches back to
# ``auto`` mode after having been in ``custom`` or ``disabled`` mode.
# Without this, switching custom→auto would leak the old proxy URL.
_PROXY_ENV_KEYS = (
    "HTTP_PROXY",
    "HTTPS_PROXY",
    "http_proxy",
    "https_proxy",
)
_original_proxy_env: dict[str, str] | None = None


def _snapshot_original_env() -> None:
    """Capture the original proxy env vars on first call.

    Subsequent calls are no-ops so the snapshot always reflects the
    state *before* QwenPaw touched anything.
    """
    global _original_proxy_env
    if _original_proxy_env is not None:
        return
    _original_proxy_env = {}
    for key in _PROXY_ENV_KEYS:
        val = os.environ.get(key)
        if val is not None:
            _original_proxy_env[key] = val


def _restore_original_proxy_env() -> None:
    """Restore proxy env vars to their pre-QwenPaw state.

    Keys that were absent originally are deleted; keys that were
    present are restored to their original value.
    """
    if _original_proxy_env is None:
        return
    for key in _PROXY_ENV_KEYS:
        if key in _original_proxy_env:
            os.environ[key] = _original_proxy_env[key]
        else:
            os.environ.pop(key, None)


def _clear_proxy_env() -> None:
    """Remove all proxy env vars so httpx/requests connect directly."""
    for key in _PROXY_ENV_KEYS:
        os.environ.pop(key, None)


def _set_proxy_env(proxy_url: str) -> None:
    """Set all four proxy env vars to *proxy_url*."""
    for key in _PROXY_ENV_KEYS:
        os.environ[key] = proxy_url


def apply_network_config(cfg: Any) -> None:
    """Cache the network config and patch process-level env vars.

    Also patches ``os.environ`` so that libraries which read
    ``HTTP_PROXY`` / ``HTTPS_PROXY`` / ``NO_PROXY`` directly
    (e.g. ``httpx`` with ``trust_env=True``) honour the user's
    choice.

    Modes:
    - ``auto``: restore original system proxy env vars.
    - ``disabled``: clear all proxy env vars.
    - ``custom``: override with ``custom_proxy_url`` (or clear if empty).
    """
    global _network_config
    _network_config = cfg

    _snapshot_original_env()

    mode = getattr(cfg, "proxy_mode", "auto")

    if mode == "disabled":
        _clear_proxy_env()
    elif mode == "custom":
        proxy_url = (getattr(cfg, "custom_proxy_url", "") or "").strip()
        if proxy_url:
            _set_proxy_env(proxy_url)
        else:
            # [PROXY-BYPASS] Bug3 fix: Empty URL in custom mode → behave
            # as "disabled" so the user doesn't silently fall through to
            # system proxy.
            _clear_proxy_env()
    else:
        # auto: restore original system proxy env vars.
        _restore_original_proxy_env()

    # Always ensure NO_PROXY includes the configured no_proxy_hosts
    # plus loopback addresses.
    no_proxy_hosts = list(getattr(cfg, "no_proxy_hosts", []) or [])
    for lb in ("localhost", "127.0.0.1", "::1"):
        if lb not in no_proxy_hosts:
            no_proxy_hosts.append(lb)

    # Merge with original NO_PROXY (if any) rather than overwriting,
    # so user-configured system NO_PROXY entries are preserved.
    original_no_proxy = (
        _original_proxy_env.get("NO_PROXY", "")
        if _original_proxy_env
        else os.environ.get("NO_PROXY", "")
    )
    all_hosts = set(
        h.strip() for h in original_no_proxy.split(",") if h.strip()
    )
    all_hosts.update(no_proxy_hosts)
    no_proxy_str = ",".join(sorted(all_hosts))
    os.environ["NO_PROXY"] = no_proxy_str
    os.environ["no_proxy"] = no_proxy_str

    logger.info(
        "Network config applied: mode=%s, NO_PROXY=%s",
        mode,
        no_proxy_str,
    )


def is_loopback_host(host: str) -> bool:
    """Return True when *host* is localhost or a loopback IP address."""
    normalized = host.strip().strip("[]").lower().rstrip(".")
    if normalized in _LOOPBACK_HOSTNAMES:
        return True
    try:
        return ipaddress.ip_address(normalized).is_loopback
    except ValueError:
        return False


def is_loopback_url(url: str) -> bool:
    """Return True when *url* targets a localhost or loopback address."""
    return is_loopback_host(urlparse(url).hostname or "")


def trust_env_for_url(url: str) -> bool:
    """Return whether httpx should trust proxy/cert env vars for *url*.

    When the network config is set to ``disabled``, returns ``False``
    for *all* URLs so that httpx never uses a proxy.
    """
    if _network_config is not None:
        mode = getattr(_network_config, "proxy_mode", "auto")
        if mode == "disabled":
            return False
        # custom with empty URL also behaves as disabled.
        if mode == "custom":
            proxy_url = (
                getattr(_network_config, "custom_proxy_url", "") or ""
            ).strip()
            if not proxy_url:
                return False
    return not is_loopback_url(url)


def resolve_proxy_for_url(url: str) -> Optional[str]:
    """Return the proxy URL to use for *url*, or ``None`` for direct.

    Resolution order:
    1. If the URL targets loopback → ``None`` (always direct).
    2. If network config mode is ``disabled`` → ``None``.
    3. If network config mode is ``custom`` with non-empty URL → that URL.
    4. Otherwise (``auto``) → ``None`` (let httpx read env vars itself).
    """
    if is_loopback_url(url):
        return None

    if _network_config is not None:
        mode = getattr(_network_config, "proxy_mode", "auto")
        if mode == "disabled":
            return None
        if mode == "custom":
            proxy_url = (
                getattr(_network_config, "custom_proxy_url", "") or ""
            ).strip()
            return proxy_url or None

    # auto: let httpx handle it via trust_env
    return None


# [PROXY-BYPASS] All Provider _client() methods call this to decide
# whether to inject a custom httpx client.  See proxy-bypass-design.md
# section 2 (third layer) for why this is necessary.
def should_use_custom_http_client() -> bool:
    """Return True when a custom httpx client must be injected into
    SDK clients (OpenAI, Anthropic, etc.) to enforce proxy settings.

    This is needed because the OpenAI / Anthropic SDKs create their
    own internal httpx clients and do NOT consult ``trust_env``
    per-request — the proxy must be set on the client itself.
    """
    if _network_config is None:
        return False
    mode = getattr(_network_config, "proxy_mode", "auto")
    if mode == "disabled":
        return True
    if mode == "custom":
        proxy_url = (
            getattr(_network_config, "custom_proxy_url", "") or ""
        ).strip()
        return bool(proxy_url)
    return False


def build_httpx_proxy_kwargs(base_url: str) -> dict:
    """Build kwargs for httpx.AsyncClient / httpx.Client that enforce
    the configured proxy policy for the given *base_url*.

    Returns a dict with ``trust_env`` and optionally ``proxy`` keys
    suitable for spreading into ``httpx.AsyncClient(**kwargs)``.

    Note: an empty dict means "don't override anything — let the SDK
    create its default client".  This happens in ``auto`` mode where
    we want httpx to read system env vars normally.
    """
    if _network_config is None:
        # No config loaded yet — preserve historical behaviour.
        return {"trust_env": not is_loopback_url(base_url)}

    mode = getattr(_network_config, "proxy_mode", "auto")

    if mode == "disabled":
        return {"trust_env": False}

    if mode == "custom":
        proxy_url = (
            getattr(_network_config, "custom_proxy_url", "") or ""
        ).strip()
        if proxy_url and not is_loopback_url(base_url):
            return {"proxy": proxy_url, "trust_env": False}
        # Empty URL or loopback target → direct connection.
        return {"trust_env": False}

    # auto: let httpx read env vars, but still bypass for loopback.
    return {"trust_env": not is_loopback_url(base_url)}
