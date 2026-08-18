# -*- coding: utf-8 -*-
"""UGSci distribution endpoints - the fork's single source of truth.

This module is **fork-owned** (it has no upstream QwenPaw counterpart), so
it never conflicts on upstream merges.  Every UGSci-specific download or
update endpoint lives here; upstream files reference these values through a
single import line, keeping their diff against upstream minimal.

Upstream files wired to this module (keep each diff to 1-2 lines):

* ``src/qwenpaw/plugins/download_catalog.py``   -> ``PLUGIN_DOWNLOAD_CDN``
* ``src/qwenpaw/components/service.py``         -> ``COMPONENT_BASE_URL``,
  ``COMPONENT_PUBLIC_KEY``
* ``src/qwenpaw/app/_app.py``
  -> ``DESKTOP_UPDATE_MANIFEST_URL``
* ``src/qwenpaw/local_models/manager.py``
  -> ``LLAMA_CPP_DOWNLOAD_BASE_URL``
* ``src/qwenpaw/cli/update_cmd.py``             -> ``PYPI_JSON_URL``,
  ``PYPI_PACKAGE_NAME``, ``PIP_INDEX_URL``
* ``src/qwenpaw/app/routers/plugins.py``
  -> ``EXTERNAL_PLUGIN_UPGRADE_HOSTS``

The console mirror of this module is ``console/src/distribution.ts``.

This module must stay dependency-free (stdlib only) so it can be imported
from anywhere without creating import cycles.
"""

from __future__ import annotations

import os
from urllib.parse import urlparse

_DEFAULT_DOWNLOAD_BASE_URL = (
    "https://ugsci-download.oss-cn-beijing.aliyuncs.com"
)


def _env(*keys: str, default: str = "") -> str:
    """Return the first non-empty environment value among *keys*."""
    for key in keys:
        value = os.environ.get(key, "").strip()
        if value:
            return value
    return default


# -- UGSci-download OSS -----------------------------------------------------

#: Root of the UGSci-download OSS bucket.  Override for staging/self-hosted
#: mirrors without code changes.
DOWNLOAD_BASE_URL = _env(
    "QWENPAW_DOWNLOAD_BASE_URL",
    "UGSCI_DOWNLOAD_BASE_URL",
    default=_DEFAULT_DOWNLOAD_BASE_URL,
).rstrip("/")

#: Plugin/app catalog CDN proxied by ``GET /api/plugins/catalog``.
PLUGIN_DOWNLOAD_CDN = DOWNLOAD_BASE_URL

#: Base URL for the signed component manifest and artifacts
#: (``metadata/components/stable/<target>.current.json``).  A full manifest
#: URL can still be overridden with ``QWENPAW_COMPONENT_MANIFEST_URL``.
COMPONENT_BASE_URL = DOWNLOAD_BASE_URL

#: Ed25519 public key verifying signed component manifests/artifacts.  The
#: private key lives only in GitHub Actions secrets.  Runtime override:
#: ``QWENPAW_COMPONENT_PUBLIC_KEY`` (read in ``components/service.py``).
COMPONENT_PUBLIC_KEY = "T0VO6V4iNHzSxU3eV68N4nifjq2CqtDfMO0QPtH72mw="

#: Desktop (Tauri) promoted-release manifest.
DESKTOP_UPDATE_MANIFEST_URL = (
    f"{DOWNLOAD_BASE_URL}/metadata/qwenpaw-tauri-latest.json"
)

#: Core / pip / source version advertisement.  Separate from the desktop
#: Tauri manifest so web and CLI users are never compared against an NSIS/dmg
#: build number.  Override with ``QWENPAW_CORE_UPDATE_MANIFEST_URL``.
CORE_UPDATE_MANIFEST_URL = _env(
    "QWENPAW_CORE_UPDATE_MANIFEST_URL",
    default=f"{DOWNLOAD_BASE_URL}/metadata/ugsci-core-latest.json",
)

#: Mirror of llama.cpp release binaries for local model runtimes.
LLAMA_CPP_DOWNLOAD_BASE_URL = f"{DOWNLOAD_BASE_URL}/files/models/llama_cpp"


# -- Core package (``qwenpaw update`` CLI) ----------------------------------

#: Package name used for the pip/uv upgrade spec.
PYPI_PACKAGE_NAME = _env("QWENPAW_PYPI_PACKAGE_NAME", default="qwenpaw")

#: JSON release-metadata endpoint used for a *self-hosted* version check.
#: Empty by default: public ``pypi.org/pypi/qwenpaw`` is the upstream project
#: and must never be the implicit install source for this fork.
PYPI_JSON_URL = _env("QWENPAW_PYPI_JSON_URL")

#: Optional custom package index passed to pip/uv (``--index-url``).  Empty
#: means no pip core upgrade is allowed (public PyPI would overwrite the fork).
PIP_INDEX_URL = _env("QWENPAW_PIP_INDEX_URL")

_PUBLIC_PYPI_HOSTS = frozenset({"pypi.org", "pypi.python.org"})
_UPSTREAM_PYPI_PACKAGE = "qwenpaw"


# -- Upstream QwenPaw compatibility ------------------------------------------

#: Upstream official catalog CDN.  Kept so upstream plugins/apps remain
#: installable and upgradable next to the UGSci catalog.
UPSTREAM_PLUGIN_CDN = "https://download.qwenpaw.agentscope.io"

_UPSTREAM_PLUGIN_UPGRADE_HOSTS = frozenset(
    {
        "download.qwenpaw.agentscope.io",
        "platform.agentscope.io",
    },
)

_DOWNLOAD_HOST = (urlparse(DOWNLOAD_BASE_URL).hostname or "").strip().lower()

#: Hosts approved for the sha256-verified ``POST /api/plugins/replace``
#: upgrade path.  Includes the upstream catalogs (compatibility) plus the
#: UGSci-download OSS host, which serves as the fallback when a plugin is
#: not (yet) covered by the signed component manifest.
EXTERNAL_PLUGIN_UPGRADE_HOSTS = frozenset(
    _UPSTREAM_PLUGIN_UPGRADE_HOSTS
    | ({_DOWNLOAD_HOST} if _DOWNLOAD_HOST else set()),
)


def _hostname(url: str) -> str:
    return (urlparse(url).hostname or "").strip().lower()


def is_public_pypi_host(url: str) -> bool:
    """Return True when *url* points at public PyPI."""
    return _hostname(url) in _PUBLIC_PYPI_HOSTS


def is_unsafe_upstream_core_update(
    *,
    package_name: str | None = None,
    json_url: str | None = None,
    index_url: str | None = None,
) -> bool:
    """Return True when a pip upgrade would install upstream ``qwenpaw``.

    The fork is not published to public PyPI under that name.  Installing
    ``qwenpaw`` from ``pypi.org`` (or with no custom index) overwrites UGSci
    with the upstream project.
    """
    name = package_name if package_name is not None else PYPI_PACKAGE_NAME
    name = name.strip().lower()
    json_source = json_url if json_url is not None else PYPI_JSON_URL
    index_source = index_url if index_url is not None else PIP_INDEX_URL
    if name != _UPSTREAM_PYPI_PACKAGE:
        return False
    if index_source and not is_public_pypi_host(index_source):
        if json_source and not is_public_pypi_host(json_source):
            return False
        return True
    return True


def is_ugsci_catalog_plugin(
    *,
    plugin_id: str = "",
    author: str = "",
    channel: str = "",
) -> bool:
    """Return True when a catalog entry belongs to the UGSci channel.

    Prefer an explicit ``channel`` field, then the author string.  An
    explicit ``community`` channel wins over an author that happens to
    contain ``ugsci``.  Plugin IDs are not hardcoded so a newly published
    UGSci plugin appears without a console rebuild.
    """
    del plugin_id  # reserved for callers that already extracted the id
    explicit = str(channel).strip().lower()
    if explicit == "community":
        return False
    if explicit == "ugsci":
        return True
    return "ugsci" in str(author).lower()


def upgrade_source_requires_digest(source: str) -> bool:
    """UGSci OSS hosts must send a sha256; upstream catalogs stay optional."""
    host = _hostname(source)
    if not host:
        return False
    if host in _UPSTREAM_PLUGIN_UPGRADE_HOSTS:
        return False
    return host == _DOWNLOAD_HOST or host in EXTERNAL_PLUGIN_UPGRADE_HOSTS
