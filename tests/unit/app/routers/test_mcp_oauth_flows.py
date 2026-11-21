# -*- coding: utf-8 -*-
"""Behavioural tests for the MCP OAuth router flows.

Covers the module-level helpers and the four endpoints of
``qwenpaw.app.routers.mcp_oauth`` that previously had no coverage:
metadata discovery (RFC 9728 / RFC 8414), dynamic client registration
(RFC 7591), the authorization-code exchange, token persistence into the
real per-workspace credential store, and the start / callback / status /
revoke endpoints.

Network legs are stubbed with ``httpx.MockTransport`` so every test is
deterministic and never leaves the machine; persistence legs run against
a real temporary workspace so the assertions read back what was actually
written to disk.
"""

# pylint: disable=protected-access,redefined-outer-name,unused-argument
from __future__ import annotations

import json
import logging
import time
from pathlib import Path
from types import SimpleNamespace
from typing import Any, Callable, Optional
from unittest.mock import AsyncMock

import httpx
import pytest
from fastapi import HTTPException

from plugins.protocol.mcp import oauth as plugin_oauth, oauth_helpers
from qwenpaw.app.driver_config_service import DriverConfigService
from qwenpaw.app.routers.mcp_oauth import router as oauth_router
from qwenpaw.drivers.adapters.mcp_console import (
    OAUTH_CREDENTIAL_ALIAS,
    mcp_oauth_credential_ref,
)
from qwenpaw.drivers.constants import PROTOCOL_MCP
from qwenpaw.drivers.contracts import DriverCard
from qwenpaw.drivers.credentials.store import AsyncCredentialStore
from qwenpaw.drivers.credentials.types import CredentialRecord
from qwenpaw.drivers.errors import CredentialNotFoundError
from qwenpaw.drivers.storage import dump_card

MCP_URL = "https://mcp.example.com/coop/mcp"
AS_URL = "https://as.example.com"


# ---------------------------------------------------------------------------
# Shared building blocks
# ---------------------------------------------------------------------------


class WorkspaceStub:
    """Minimal workspace: a real temp dir and no driver manager.

    ``driver_manager = None`` matters: ``DriverConfigService`` would
    otherwise take the mock's auto-created ``credential_store`` attribute
    and every persistence assertion would be vacuous.
    """

    def __init__(self, root: Path, agent_id: str = "agent-1") -> None:
        self.workspace_dir = root
        self.driver_manager = None
        self.agent_id = agent_id


def _mock_client_factory(
    handler: Callable[[httpx.Request], httpx.Response],
) -> Callable[..., httpx.AsyncClient]:
    """Return an ``httpx.AsyncClient`` stand-in bound to *handler*."""
    real_client = httpx.AsyncClient

    def factory(*args: Any, **kwargs: Any) -> httpx.AsyncClient:
        kwargs.setdefault("transport", httpx.MockTransport(handler))
        return real_client(*args, **kwargs)

    return factory


def _patch_httpx(
    monkeypatch: pytest.MonkeyPatch,
    handler: Callable[[httpx.Request], httpx.Response],
) -> None:
    """Stub the plugin HTTP clients without changing the host transport."""
    monkeypatch.setattr(
        plugin_oauth,
        "httpx",
        SimpleNamespace(AsyncClient=_mock_client_factory(handler)),
    )
    monkeypatch.setattr(oauth_helpers, "httpx", plugin_oauth.httpx)


def _json_response(payload: dict, status: int = 200) -> httpx.Response:
    return httpx.Response(status, json=payload)


def _session(**overrides: Any) -> plugin_oauth.OAuthSession:
    kwargs: dict = {
        "workspace_id": "agent-1",
        "workspace_instance_id": "instance",
        "source_revision": 1,
        "client_key": "k1",
        "code_verifier": "verifier-abc",
        "client_id": "client-1",
        "auth_endpoint": "https://as.example.com/authorize",
        "token_endpoint": "https://as.example.com/token",
        "redirect_uri": "http://testserver/api/mcp/oauth/callback",
        "scope": "read write",
    }
    kwargs.update(overrides)
    return plugin_oauth.OAuthSession(**kwargs)


@pytest.fixture(autouse=True)
def _no_managed_callback(monkeypatch: pytest.MonkeyPatch) -> None:
    """Keep the Hub-injected callback header out of the way by default."""
    monkeypatch.delenv("QWENPAW_RUNTIME_INTERNAL_TOKEN", raising=False)


@pytest.fixture
def workspace(tmp_path: Path) -> WorkspaceStub:
    return WorkspaceStub(tmp_path)


@pytest.fixture
def saved_card(workspace: WorkspaceStub) -> DriverCard:
    """Persist one real MCP DriverCard into the temp workspace.

    ``dump_card`` is used (not the async ``card_store.save``) because a
    sync fixture cannot await; dumping writes the same YAML the router
    later reads back through ``load_card``.
    """
    card = DriverCard(
        name="k1",
        protocol=PROTOCOL_MCP,
        endpoint={"url": MCP_URL, "transport": "sse"},
    )
    svc = DriverConfigService(workspace)
    dump_card(card, svc.card_path("k1", protocol=PROTOCOL_MCP))
    return card


def _seed_credential(
    workspace: WorkspaceStub,
    *,
    client_key: str = "k1",
    public: Optional[dict] = None,
    secrets: Optional[dict] = None,
) -> None:
    store = DriverConfigService(workspace).credential_store
    record = CredentialRecord(
        ref=mcp_oauth_credential_ref(client_key),
        kind="oauth2_auth_code",
        public=dict(public or {}),
        secrets=dict(secrets or {}),
        meta={},
    )
    store.put_sync(record)


def test_mcp_card_path_points_at_protocol_scoped_yaml(
    workspace: WorkspaceStub,
) -> None:
    path = DriverConfigService(workspace).card_path("k1", protocol="mcp")
    assert path == workspace.workspace_dir / "drivers" / "mcp" / "k1.yaml"


class TestFetchJson:
    async def test_returns_payload_on_200(self) -> None:
        def handler(request: httpx.Request) -> httpx.Response:
            return _json_response({"a": 1})

        async with httpx.AsyncClient(
            transport=httpx.MockTransport(handler),
        ) as http_client:
            assert await oauth_helpers._fetch_json(
                http_client,
                MCP_URL,
                logger=logging.getLogger(__name__),
            ) == {"a": 1}

    async def test_returns_none_on_error_status(self) -> None:
        def handler(request: httpx.Request) -> httpx.Response:
            return httpx.Response(404, text="nope")

        async with httpx.AsyncClient(
            transport=httpx.MockTransport(handler),
        ) as http_client:
            assert (
                await oauth_helpers._fetch_json(
                    http_client,
                    MCP_URL,
                    logger=logging.getLogger(__name__),
                )
                is None
            )

    async def test_swallows_transport_errors(self) -> None:
        def handler(request: httpx.Request) -> httpx.Response:
            raise httpx.ConnectError("boom")

        async with httpx.AsyncClient(
            transport=httpx.MockTransport(handler),
        ) as http_client:
            assert (
                await oauth_helpers._fetch_json(
                    http_client,
                    MCP_URL,
                    logger=logging.getLogger(__name__),
                )
                is None
            )


# ---------------------------------------------------------------------------
# _probe_resource_metadata_url
# ---------------------------------------------------------------------------


class TestProbeResourceMetadata:
    async def test_ignores_non_401(self) -> None:
        def handler(request: httpx.Request) -> httpx.Response:
            return httpx.Response(
                200,
                headers={"www-authenticate": 'Bearer resource_metadata="u"'},
            )

        async with httpx.AsyncClient(
            transport=httpx.MockTransport(handler),
        ) as http_client:
            assert (
                await oauth_helpers._probe_resource_metadata_url(
                    http_client,
                    MCP_URL,
                    logger=logging.getLogger(__name__),
                )
                is None
            )

    async def test_extracts_url_from_401_header(self) -> None:
        def handler(request: httpx.Request) -> httpx.Response:
            return httpx.Response(
                401,
                headers={
                    "www-authenticate": (
                        'Bearer error="invalid_token", '
                        'Resource_Metadata="https://prm.example.com/meta"'
                    ),
                },
            )

        async with httpx.AsyncClient(
            transport=httpx.MockTransport(handler),
        ) as http_client:
            assert (
                await oauth_helpers._probe_resource_metadata_url(
                    http_client,
                    MCP_URL,
                    logger=logging.getLogger(__name__),
                )
                == "https://prm.example.com/meta"
            )

    async def test_returns_none_when_header_absent(self) -> None:
        def handler(request: httpx.Request) -> httpx.Response:
            return httpx.Response(401, headers={"www-authenticate": "Bearer"})

        async with httpx.AsyncClient(
            transport=httpx.MockTransport(handler),
        ) as http_client:
            assert (
                await oauth_helpers._probe_resource_metadata_url(
                    http_client,
                    MCP_URL,
                    logger=logging.getLogger(__name__),
                )
                is None
            )

    async def test_swallows_transport_errors(self) -> None:
        def handler(request: httpx.Request) -> httpx.Response:
            raise httpx.ConnectError("boom")

        async with httpx.AsyncClient(
            transport=httpx.MockTransport(handler),
        ) as http_client:
            assert (
                await oauth_helpers._probe_resource_metadata_url(
                    http_client,
                    MCP_URL,
                    logger=logging.getLogger(__name__),
                )
                is None
            )


# ---------------------------------------------------------------------------
# _resolve_auth_server_url
# ---------------------------------------------------------------------------


def _prm(as_urls: list) -> dict:
    return {"resource": MCP_URL, "authorization_servers": as_urls}


class TestResolveAuthServerUrl:
    async def test_uses_401_header_metadata(self) -> None:
        def handler(request: httpx.Request) -> httpx.Response:
            if str(request.url) == MCP_URL:
                return httpx.Response(
                    401,
                    headers={
                        "www-authenticate": (
                            "Bearer resource_metadata="
                            '"https://prm.example.com/m"'
                        ),
                    },
                )
            if str(request.url) == "https://prm.example.com/m":
                return _json_response(_prm([AS_URL]))
            return httpx.Response(404)

        async with httpx.AsyncClient(
            transport=httpx.MockTransport(handler),
        ) as http_client:
            assert (
                await oauth_helpers._resolve_auth_server_url(
                    http_client,
                    MCP_URL,
                    logger=logging.getLogger(__name__),
                )
                == AS_URL
            )

    async def test_falls_back_to_path_aware_well_known(self) -> None:
        requested: list = []

        def handler(request: httpx.Request) -> httpx.Response:
            requested.append(str(request.url))
            if request.url.path == (
                "/.well-known/oauth-protected-resource/coop/mcp"
            ):
                return _json_response(_prm([AS_URL]))
            return httpx.Response(404)

        async with httpx.AsyncClient(
            transport=httpx.MockTransport(handler),
        ) as http_client:
            assert (
                await oauth_helpers._resolve_auth_server_url(
                    http_client,
                    MCP_URL,
                    logger=logging.getLogger(__name__),
                )
                == AS_URL
            )
        assert MCP_URL in requested

    async def test_root_url_skips_path_candidate(self) -> None:
        requested: list = []

        def handler(request: httpx.Request) -> httpx.Response:
            requested.append(str(request.url))
            if request.url.path == "/.well-known/oauth-protected-resource":
                return _json_response(_prm([AS_URL]))
            return httpx.Response(404)

        async with httpx.AsyncClient(
            transport=httpx.MockTransport(handler),
        ) as http_client:
            assert (
                await oauth_helpers._resolve_auth_server_url(
                    http_client,
                    "https://mcp.example.com/",
                    logger=logging.getLogger(__name__),
                )
                == AS_URL
            )
        # The probe hit the MCP URL verbatim first (404, so no
        # WWW-Authenticate); with an empty path suffix only the root
        # well-known is tried, never the path-aware candidate.
        assert requested == [
            "https://mcp.example.com/",
            "https://mcp.example.com/.well-known/oauth-protected-resource",
        ]

    async def test_returns_none_when_nothing_advertises(self) -> None:
        def handler(request: httpx.Request) -> httpx.Response:
            if str(request.url) == MCP_URL:
                return httpx.Response(401)
            return _json_response({"resource": MCP_URL})

        async with httpx.AsyncClient(
            transport=httpx.MockTransport(handler),
        ) as http_client:
            assert (
                await oauth_helpers._resolve_auth_server_url(
                    http_client,
                    MCP_URL,
                    logger=logging.getLogger(__name__),
                )
                is None
            )


# ---------------------------------------------------------------------------
# _fetch_as_metadata
# ---------------------------------------------------------------------------


class TestFetchAsMetadata:
    async def test_root_server_tries_rfc8414_then_oidc(self) -> None:
        requested: list = []

        def handler(request: httpx.Request) -> httpx.Response:
            requested.append(str(request.url))
            if request.url.path == "/.well-known/openid-configuration":
                return _json_response(
                    {
                        "authorization_endpoint": f"{AS_URL}/authorize",
                        "token_endpoint": f"{AS_URL}/token",
                    },
                )
            return httpx.Response(404)

        async with httpx.AsyncClient(
            transport=httpx.MockTransport(handler),
        ) as http_client:
            meta = await oauth_helpers._fetch_as_metadata(
                http_client,
                AS_URL,
                logger=logging.getLogger(__name__),
            )

        assert meta is not None
        assert meta["token_endpoint"] == f"{AS_URL}/token"
        assert requested == [
            f"{AS_URL}/.well-known/oauth-authorization-server",
            f"{AS_URL}/.well-known/openid-configuration",
        ]

    async def test_path_server_tries_three_candidates(self) -> None:
        requested: list = []
        scoped = f"{AS_URL}/tenant"

        def handler(request: httpx.Request) -> httpx.Response:
            requested.append(str(request.url))
            if request.url.path == "/tenant/.well-known/openid-configuration":
                return _json_response({"authorization_endpoint": "https://a"})
            return httpx.Response(404)

        async with httpx.AsyncClient(
            transport=httpx.MockTransport(handler),
        ) as http_client:
            meta = await oauth_helpers._fetch_as_metadata(
                http_client,
                scoped,
                logger=logging.getLogger(__name__),
            )

        assert meta == {"authorization_endpoint": "https://a"}
        assert requested == [
            f"{AS_URL}/.well-known/oauth-authorization-server/tenant",
            f"{AS_URL}/.well-known/openid-configuration/tenant",
            f"{scoped}/.well-known/openid-configuration",
        ]

    async def test_metadata_without_authorization_endpoint_rejected(
        self,
    ) -> None:
        def handler(request: httpx.Request) -> httpx.Response:
            return _json_response({"token_endpoint": f"{AS_URL}/token"})

        async with httpx.AsyncClient(
            transport=httpx.MockTransport(handler),
        ) as http_client:
            assert (
                await oauth_helpers._fetch_as_metadata(
                    http_client,
                    AS_URL,
                    logger=logging.getLogger(__name__),
                )
                is None
            )


# ---------------------------------------------------------------------------
# _discover_oauth_metadata
# ---------------------------------------------------------------------------


def _full_as_metadata(**extra: Any) -> dict:
    payload = {
        "authorization_endpoint": f"{AS_URL}/authorize",
        "token_endpoint": f"{AS_URL}/token",
    }
    payload.update(extra)
    return payload


class TestDiscoverOauthMetadata:
    async def test_success_returns_all_three_endpoints(
        self,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        def handler(request: httpx.Request) -> httpx.Response:
            if str(request.url) == MCP_URL:
                return httpx.Response(
                    401,
                    headers={
                        "www-authenticate": (
                            "Bearer resource_metadata="
                            '"https://prm.example.com/m"'
                        ),
                    },
                )
            if str(request.url) == "https://prm.example.com/m":
                return _json_response(_prm([AS_URL]))
            if request.url.path == "/.well-known/oauth-authorization-server":
                return _json_response(
                    _full_as_metadata(registration_endpoint=f"{AS_URL}/reg"),
                )
            return httpx.Response(404)

        _patch_httpx(monkeypatch, handler)

        assert await oauth_helpers._discover_oauth_metadata(
            MCP_URL,
            logger=logging.getLogger(__name__),
        ) == (
            f"{AS_URL}/authorize",
            f"{AS_URL}/token",
            f"{AS_URL}/reg",
        )

    async def test_missing_registration_endpoint_is_none(
        self,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        def handler(request: httpx.Request) -> httpx.Response:
            if str(request.url) == MCP_URL:
                return httpx.Response(
                    401,
                    headers={
                        "www-authenticate": (
                            "Bearer resource_metadata="
                            '"https://prm.example.com/m"'
                        ),
                    },
                )
            if str(request.url) == "https://prm.example.com/m":
                return _json_response(_prm([AS_URL]))
            return _json_response(_full_as_metadata())

        _patch_httpx(monkeypatch, handler)

        auth_ep, token_ep, reg = await oauth_helpers._discover_oauth_metadata(
            MCP_URL,
            logger=logging.getLogger(__name__),
        )
        assert (auth_ep, token_ep, reg) == (
            f"{AS_URL}/authorize",
            f"{AS_URL}/token",
            None,
        )

    async def test_undiscoverable_server_raises_400(
        self,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        def handler(request: httpx.Request) -> httpx.Response:
            return httpx.Response(500)

        _patch_httpx(monkeypatch, handler)

        with pytest.raises(oauth_helpers.OAuthError) as excinfo:
            await oauth_helpers._discover_oauth_metadata(
                MCP_URL,
                logger=logging.getLogger(__name__),
            )
        assert excinfo.value.status == 400
        assert "RFC 9728" in str(str(excinfo.value))

    async def test_metadata_without_endpoints_raises_400(
        self,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        def handler(request: httpx.Request) -> httpx.Response:
            if str(request.url) == MCP_URL:
                return httpx.Response(
                    401,
                    headers={
                        "www-authenticate": (
                            "Bearer resource_metadata="
                            '"https://prm.example.com/m"'
                        ),
                    },
                )
            if str(request.url) == "https://prm.example.com/m":
                return _json_response(_prm([AS_URL]))
            return httpx.Response(404)

        _patch_httpx(monkeypatch, handler)

        with pytest.raises(oauth_helpers.OAuthError) as excinfo:
            await oauth_helpers._discover_oauth_metadata(
                MCP_URL,
                logger=logging.getLogger(__name__),
            )
        assert excinfo.value.status == 400
        assert AS_URL in str(str(excinfo.value))

    async def test_metadata_missing_token_endpoint_raises_400(
        self,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        def handler(request: httpx.Request) -> httpx.Response:
            if str(request.url) == MCP_URL:
                return httpx.Response(
                    401,
                    headers={
                        "www-authenticate": (
                            "Bearer resource_metadata="
                            '"https://prm.example.com/m"'
                        ),
                    },
                )
            if str(request.url) == "https://prm.example.com/m":
                return _json_response(_prm([AS_URL]))
            return _json_response(
                {"authorization_endpoint": f"{AS_URL}/authorize"},
            )

        _patch_httpx(monkeypatch, handler)

        with pytest.raises(oauth_helpers.OAuthError) as excinfo:
            await oauth_helpers._discover_oauth_metadata(
                MCP_URL,
                logger=logging.getLogger(__name__),
            )
        assert excinfo.value.status == 400
        assert "token_endpoint" in str(str(excinfo.value))


# ---------------------------------------------------------------------------
# _dynamic_register
# ---------------------------------------------------------------------------


class TestDynamicRegister:
    @pytest.mark.parametrize("status", [200, 201])
    async def test_returns_client_id(
        self,
        monkeypatch: pytest.MonkeyPatch,
        status: int,
    ) -> None:
        seen: dict = {}

        def handler(request: httpx.Request) -> httpx.Response:
            seen["json"] = json.loads(request.content.decode("utf-8"))
            return _json_response({"client_id": "dyn-1"}, status=status)

        _patch_httpx(monkeypatch, handler)

        assert (
            await oauth_helpers._dynamic_register(
                f"{AS_URL}/reg",
                "https://cb",
                logger=logging.getLogger(__name__),
            )
            == "dyn-1"
        )
        assert seen["json"]["redirect_uris"] == ["https://cb"]
        assert seen["json"]["grant_types"] == [
            "authorization_code",
            "refresh_token",
        ]
        assert seen["json"]["token_endpoint_auth_method"] == "none"

    async def test_error_status_returns_none(
        self,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        def handler(request: httpx.Request) -> httpx.Response:
            return httpx.Response(400, text="bad request")

        _patch_httpx(monkeypatch, handler)

        assert (
            await oauth_helpers._dynamic_register(
                f"{AS_URL}/reg",
                "https://cb",
                logger=logging.getLogger(__name__),
            )
            is None
        )

    async def test_transport_error_returns_none(
        self,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        def handler(request: httpx.Request) -> httpx.Response:
            raise httpx.ConnectError("boom")

        _patch_httpx(monkeypatch, handler)

        assert (
            await oauth_helpers._dynamic_register(
                f"{AS_URL}/reg",
                "https://cb",
                logger=logging.getLogger(__name__),
            )
            is None
        )


# ---------------------------------------------------------------------------
# _exchange_code_for_tokens
# ---------------------------------------------------------------------------


class TestExchangeCodeForTokens:
    async def test_posts_pkce_form_and_returns_tokens(
        self,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        seen: dict = {}

        def handler(request: httpx.Request) -> httpx.Response:
            seen["url"] = str(request.url)
            seen["form"] = request.content.decode("utf-8")
            return _json_response(
                {"access_token": "AT", "expires_in": 60, "scope": "read"},
            )

        _patch_httpx(monkeypatch, handler)

        tokens = await plugin_oauth._exchange_code_for_tokens(
            _session(),
            "code-1",
        )

        assert tokens["access_token"] == "AT"
        assert seen["url"] == f"{AS_URL}/token"
        assert "grant_type=authorization_code" in seen["form"]
        assert "code=code-1" in seen["form"]
        assert "code_verifier=verifier-abc" in seen["form"]
        assert "client_id=client-1" in seen["form"]

    async def test_omits_client_id_for_public_client(
        self,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        seen: dict = {}

        def handler(request: httpx.Request) -> httpx.Response:
            seen["form"] = request.content.decode("utf-8")
            return _json_response({"access_token": "AT"})

        _patch_httpx(monkeypatch, handler)

        await plugin_oauth._exchange_code_for_tokens(
            _session(client_id=""),
            "code-1",
        )
        assert "client_id" not in seen["form"]

    async def test_error_status_does_not_echo_provider_credentials(
        self,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        # Provider error bodies can echo access tokens or authorization codes.
        long_body = "access_token=provider-secret&code=authorization-secret"

        def handler(request: httpx.Request) -> httpx.Response:
            return httpx.Response(400, text=long_body)

        _patch_httpx(monkeypatch, handler)

        with pytest.raises(ValueError) as excinfo:
            await plugin_oauth._exchange_code_for_tokens(_session(), "code-1")
        message = str(excinfo.value)
        assert message.startswith("Token exchange failed (HTTP 400): ")
        assert "provider-secret" not in message
        assert "authorization-secret" not in message

    async def test_transport_error_raises_value_error(
        self,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        def handler(request: httpx.Request) -> httpx.Response:
            raise httpx.ConnectError("boom")

        _patch_httpx(monkeypatch, handler)

        with pytest.raises(ValueError) as excinfo:
            await plugin_oauth._exchange_code_for_tokens(_session(), "code-1")
        assert "Token exchange request failed" in str(excinfo.value)


# ---------------------------------------------------------------------------
# Credential / card loading helpers
# ---------------------------------------------------------------------------


class TestLoadHelpers:
    async def test_workspace_card_and_credential_storage(
        self,
        workspace,
        saved_card,
    ):
        service = DriverConfigService(workspace)
        assert isinstance(service.credential_store, AsyncCredentialStore)
        assert (
            service.credential_store
            is DriverConfigService(workspace).credential_store
        )
        card = await service.load_card("k1", protocol="mcp")
        assert card.name == "k1" and card.endpoint["url"] == MCP_URL
        with pytest.raises(HTTPException) as missing:
            await service.load_card("ghost", protocol="mcp")
        assert missing.value.status_code == 404
        assert "ghost" in missing.value.detail
        ref = mcp_oauth_credential_ref("k1")
        assert await service.load_optional_credential(ref) is None
        _seed_credential(
            workspace,
            public={"client_id": "existing"},
            secrets={"access_token": "AT"},
        )
        record = await service.load_optional_credential(ref)
        assert record.public["client_id"] == "existing"
        assert record.secrets["access_token"] == "AT"
        assert CredentialNotFoundError(ref).ref == ref
        await service.reload_driver_best_effort("k1")


@pytest.fixture
async def provider():
    from aiohttp import web

    state = SimpleNamespace(
        tokens={"access_token": "first", "refresh_token": "refresh"},
        registration=201,
        seen=[],
    )

    async def respond(request):
        state.seen.append(request.path)
        base = state.base
        if request.path == "/mcp":
            return web.Response(
                status=401,
                headers={
                    "WWW-Authenticate": (
                        f'Bearer resource_metadata="{base}/metadata"'
                    ),
                },
            )
        if request.path == "/metadata":
            return web.json_response({"authorization_servers": [base]})
        if request.path.startswith("/.well-known/"):
            return web.json_response(
                {
                    "authorization_endpoint": base + "/authorize",
                    "token_endpoint": base + "/token",
                    "registration_endpoint": base + "/register",
                },
            )
        if request.path == "/register":
            return web.json_response(
                {"client_id": "dynamic"},
                status=state.registration,
            )
        if request.path == "/token":
            return web.json_response(state.tokens)
        return web.Response(status=404)

    app = web.Application()
    app.router.add_route("*", "/{path:.*}", respond)
    runner = web.AppRunner(app)
    await runner.setup()
    try:
        site = web.TCPSite(runner, "127.0.0.1", 0)
        await site.start()
        state.base = f"http://127.0.0.1:{runner.addresses[0][1]}"
        yield state
    finally:
        await runner.cleanup()


def market_service(marketplace):
    return DriverConfigService(marketplace.host._workspaces["test"])


async def provider_start(
    marketplace,
    provider,
    *,
    explicit=True,
    key="k1",
    **fields,
):
    from urllib.parse import parse_qs, urlsplit

    body = {"url": provider.base + "/mcp", "scope": "read"}
    if explicit:
        body.update(
            auth_endpoint=provider.base + "/authorize",
            token_endpoint=provider.base + "/token",
        )
    response = await marketplace.api(
        "POST",
        f"/oauth/start/{key}",
        json={**body, **fields},
    )
    result = response.json()
    params = parse_qs(urlsplit(result["auth_url"]).query)
    assert params["state"] == [result["session_id"]]
    assert (
        params["code_challenge_method"] == ["S256"]
        and params["code_challenge"][0]
    )
    return result["session_id"], params


class TestOauthStartEndpoint:
    @pytest.mark.parametrize(
        "registration,expected",
        [(201, ["dynamic"]), (400, [])],
    )
    async def test_saved_url_discovery_and_dynamic_registration(
        self,
        marketplace,
        provider,
        registration,
        expected,
    ):
        await marketplace.api(
            "POST",
            "",
            201,
            json={
                "client_key": "discover",
                "client": {
                    "name": "Discover",
                    "transport": "streamable_http",
                    "url": provider.base + "/mcp",
                    "enabled": False,
                },
            },
        )
        provider.registration = registration
        _, params = await provider_start(
            marketplace,
            provider,
            key="discover",
            explicit=False,
            url="http://127.0.0.1:1/unused",
        )
        assert params.get("client_id", []) == expected
        assert "/register" in provider.seen

    async def test_explicit_endpoints_skip_discovery_and_use_managed_redirect(
        self,
        marketplace,
        provider,
        monkeypatch,
    ):
        from urllib.parse import parse_qs, urlsplit

        monkeypatch.setenv("QWENPAW_RUNTIME_INTERNAL_TOKEN", "internal")
        response = await marketplace.host.request(
            "POST",
            "/api/mcp/oauth/start/k1",
            user_id="alice",
            headers={
                "X-Agent-Id": "test",
                "x-qwenpaw-hub-oauth-callback-url": "https://hub/cb",
            },
            json={
                "url": "",
                "auth_endpoint": provider.base + "/authorize",
                "token_endpoint": provider.base + "/token",
            },
        )
        assert response.status == 200, response.text
        assert parse_qs(urlsplit(response.json()["auth_url"]).query)[
            "redirect_uri"
        ] == ["https://hub/cb"]
        assert provider.seen == []

    async def test_missing_url_raises_400(self, marketplace):
        await marketplace.api(
            "POST",
            "",
            201,
            json={
                "client_key": "local",
                "client": {
                    "name": "Local",
                    "enabled": False,
                    "transport": "stdio",
                    "command": "python",
                    "args": ["-V"],
                },
            },
        )
        await marketplace.api(
            "POST",
            "/oauth/start/local",
            400,
            json={"url": ""},
        )

    async def test_unknown_client_is_rejected_by_management_routes(
        self,
        marketplace,
    ):
        await marketplace.api(
            "POST",
            "/oauth/start/ghost",
            404,
            json={"url": ""},
        )
        await marketplace.api("GET", "/oauth/status/ghost", 404)
        await marketplace.api("DELETE", "/oauth/ghost", 404)


class TestPersistTokens:
    async def test_writes_public_fields_secrets_and_card_binding(
        self,
        marketplace,
        provider,
    ):
        service = market_service(marketplace)
        before = time.time()
        state, _ = await provider_start(
            marketplace,
            provider,
            client_id="existing",
        )
        await marketplace.complete(state)
        card = await service.load_card("k1", protocol="mcp")
        ref = card.credentials[OAUTH_CREDENTIAL_ALIAS].ref
        record = await service.credential_store.get(ref)
        assert record.kind == "oauth2_auth_code"
        assert record.secrets == provider.tokens
        assert record.public["client_id"] == "existing"
        assert record.public["scope"] == "read"
        assert record.public["auth_endpoint"] == provider.base + "/authorize"
        assert record.public["token_endpoint"] == provider.base + "/token"
        assert (
            before + 3600 <= record.public["expires_at"] <= time.time() + 3600
        )
        assert (
            card.endpoint["headers"]["Authorization"]["field"]
            == "access_token"
        )
        record.public["custom"] = "preserved"
        record.meta["custom"] = "preserved"
        await service.credential_store.put(record)
        provider.tokens = {
            "access_token": "second",
            "expires_in": 120,
            "scope": "granted",
        }
        state, params = await provider_start(marketplace, provider)
        assert params["client_id"] == ["existing"]
        before = time.time()
        await marketplace.complete(state)
        card = await service.load_card("k1", protocol="mcp")
        record = await service.credential_store.get(
            card.credentials[OAUTH_CREDENTIAL_ALIAS].ref,
        )
        assert record.public["custom"] == record.meta["custom"] == "preserved"
        assert record.public["scope"] == "granted"
        assert before + 120 <= record.public["expires_at"] <= time.time() + 120
        assert record.secrets == {
            "access_token": "second",
            "refresh_token": "refresh",
        }

    async def test_missing_access_token_cannot_publish_or_replay(
        self,
        marketplace,
        provider,
    ):
        provider.tokens = {"refresh_token": "redacted"}
        state, _ = await provider_start(marketplace, provider)
        result = await marketplace.complete(state, 400)
        assert "redacted" not in result.text
        assert not (await marketplace.api("GET", "/oauth/status/k1")).json()[
            "authorized"
        ]
        await marketplace.complete(state, 400)
        assert (await marketplace.status(state)).json()[
            "attempt_status"
        ] == "failed"

    async def test_persistence_failure_preserves_saved_account(
        self,
        marketplace,
        monkeypatch,
    ):
        from qwenpaw.app.mcp import oauth_bridge

        await marketplace.complete(await marketplace.start())
        service = market_service(marketplace)
        card = await service.load_card("k1", protocol="mcp")
        ref = card.credentials[OAUTH_CREDENTIAL_ALIAS].ref
        previous = await service.credential_store.get(ref)
        state = await marketplace.start()
        monkeypatch.setattr(
            oauth_bridge,
            "commit_credential_binding",
            AsyncMock(side_effect=OSError("disk full")),
        )
        result = await marketplace.complete(state, 400)
        assert "OAuth credentials could not be saved" in result.text
        assert (
            await service.load_card("k1", protocol="mcp")
        ).credentials == card.credentials
        current = await service.credential_store.get(ref)
        assert current.secrets == previous.secrets
        assert (await marketplace.status(state)).json()["phase"] == "failed"

    async def test_changed_card_rejects_pending_exchange(
        self,
        marketplace,
        provider,
    ):
        state, _ = await provider_start(marketplace, provider)
        await marketplace.api("PUT", "/k1", json={"name": "Changed"})
        await marketplace.complete(state, 400)
        assert not (await marketplace.api("GET", "/oauth/status/k1")).json()[
            "authorized"
        ]


class TestOauthCallbackEndpoint:
    @pytest.mark.parametrize(
        "query",
        [
            "",
            "?state=unknown&code=a",
            "?error=access_denied",
            "?error=access_denied&error_description=denied",
        ],
    )
    async def test_invalid_callback_renders_error_page(
        self,
        marketplace,
        query,
    ):
        response = await marketplace.api("GET", "/oauth/callback" + query, 400)
        assert "Authorization failed" in response.text

    async def test_exchange_failure_and_expiry_cannot_authorize(
        self,
        marketplace,
    ):
        state = await marketplace.start()
        result = await marketplace.api(
            "GET",
            f"/oauth/callback?state={state}&code=bad",
            400,
        )
        assert "Authorization failed" in result.text
        state = await marketplace.start()
        marketplace.host._http_app.state.mcp_oauth_attempts[
            state
        ].overlay.expires_at -= 601
        await marketplace.complete(state, 400)
        assert not (await marketplace.status(state)).json()["authorized"]


class TestOauthStatusEndpoint:
    async def test_token_expiry_status_and_revoke(self, marketplace):
        service = market_service(marketplace)
        assert not (await marketplace.api("GET", "/oauth/status/k1")).json()[
            "authorized"
        ]
        await marketplace.api("DELETE", "/oauth/k1")
        await marketplace.complete(await marketplace.start())
        card = await service.load_card("k1", protocol="mcp")
        ref = card.credentials[OAUTH_CREDENTIAL_ALIAS].ref
        record = await service.credential_store.get(ref)
        for expiry, token, authorized in [
            (0, "", False),
            (time.time() - 10, "token", False),
            (time.time() + 360, "token", True),
            (0, "token", True),
        ]:
            record.public["expires_at"] = expiry
            record.secrets["access_token"] = token
            await service.credential_store.put(record)
            response = await marketplace.api("GET", "/oauth/status/k1")
            assert response.json()["authorized"] is authorized
            assert response.json()["expires_at"] == (expiry if token else 0)
            assert "access_token" not in response.text
        await marketplace.api("DELETE", "/oauth/k1")
        assert not (await marketplace.api("GET", "/oauth/status/k1")).json()[
            "authorized"
        ]
        card = await service.load_card("k1", protocol="mcp")
        assert OAUTH_CREDENTIAL_ALIAS not in card.credentials
        remaining = await service.load_optional_credential(ref)
        assert remaining is None or "access_token" not in remaining.secrets


@pytest.fixture
async def marketplace(tmp_path, monkeypatch):
    from tests.integration.test_mcp_plugin import PLUGIN
    from aiohttp import web
    from qwenpaw.app.routers import mcp
    from qwenpaw.plugins.testing import PluginTestHost

    monkeypatch.setenv("NO_PROXY", "localhost,127.0.0.1")
    evidence = tmp_path / "oauth.json"

    async def token(request):
        form = await request.post()
        if (
            not form.get("code_verifier")
            or form.get("code") != "controlled-code"
        ):
            return web.json_response({"error": "invalid_grant"}, status=400)
        evidence.write_text("exchanged", encoding="utf-8")
        return web.json_response(
            {"access_token": "market-test-token", "scope": "read"},
        )

    peer = web.Application()
    peer.router.add_post("/oauth/token", token)
    runner = web.AppRunner(peer)
    await runner.setup()
    try:
        site = web.TCPSite(runner, "127.0.0.1", 0)
        await site.start()
        port = runner.addresses[0][1]
        endpoint = {
            "url": f"http://127.0.0.1:{port}/mcp",
            "transport": "streamable_http",
        }
        async with PluginTestHost(tmp_path / "host") as host:
            await host.install(PLUGIN)
            host._http_app.state.plugin_loader = host._loader
            host._http_app.include_router(oauth_router, prefix="/api")
            host._http_app.include_router(mcp.router, prefix="/api")

            async def api(method, path, expected=200, agent="test", **kwargs):
                response = await host.request(
                    method,
                    "/api/mcp" + path,
                    user_id="alice",
                    headers={"X-Agent-Id": agent},
                    **kwargs,
                )
                assert response.status == expected, response.text
                return response

            async def create(agent):
                await api(
                    "POST",
                    "",
                    201,
                    agent,
                    json={
                        "client_key": "k1",
                        "client": {
                            "name": "Peer",
                            **endpoint,
                            "enabled": False,
                        },
                    },
                )

            await create("test")
            base = endpoint["url"].removesuffix("/mcp")

            async def start():
                result = await api(
                    "POST",
                    "/oauth/start/k1",
                    json={
                        "url": "",
                        "client_id": "controlled-client",
                        "scope": "read",
                        "auth_endpoint": base + "/oauth/authorize",
                        "token_endpoint": base + "/oauth/token",
                    },
                )
                return result.json()["session_id"]

            async def status(state, **kwargs):
                return await api(
                    "GET",
                    f"/oauth/status/k1?session_id={state}",
                    **kwargs,
                )

            async def complete(state, expected=200):
                return await api(
                    "GET",
                    f"/oauth/callback?state={state}&code=controlled-code",
                    expected,
                )

            yield SimpleNamespace(
                start=start,
                status=status,
                complete=complete,
                api=api,
                host=host,
                create=create,
                evidence=tmp_path / "oauth.json",
            )

    finally:
        await runner.cleanup()


class TestMarketplaceOAuthSessions:
    async def test_cancel_waits_for_credential_publication(
        self,
        marketplace,
        monkeypatch,
    ):
        import asyncio
        import threading
        from contextlib import asynccontextmanager
        from qwenpaw.app.mcp import oauth_bridge
        from qwenpaw.drivers import credential_commit

        state = await marketplace.start()
        writing = threading.Event()
        release = threading.Event()
        cancel_waiting = asyncio.Event()
        original_write = credential_commit.dump_card
        original_lock = oauth_bridge._workspace_commit_lock

        def gated_write(*args, **kwargs):
            writing.set()
            assert release.wait(timeout=15)
            return original_write(*args, **kwargs)

        @asynccontextmanager
        async def observed_lock(manager):
            if writing.is_set():
                cancel_waiting.set()
            async with original_lock(manager):
                yield

        monkeypatch.setattr(credential_commit, "dump_card", gated_write)
        monkeypatch.setattr(
            oauth_bridge,
            "_workspace_commit_lock",
            observed_lock,
        )
        callback = asyncio.create_task(marketplace.complete(state))
        try:
            assert await asyncio.to_thread(writing.wait, 15)
            cancel = asyncio.create_task(
                marketplace.api(
                    "DELETE",
                    f"/oauth/session/k1?session_id={state}",
                ),
            )
            await asyncio.wait_for(cancel_waiting.wait(), 10)
            assert not cancel.done()
        finally:
            release.set()
        await asyncio.gather(callback, cancel)
        assert (await marketplace.status(state)).json()[
            "phase"
        ] == "authorized"
        assert (await marketplace.api("GET", "/oauth/status/k1")).json()[
            "authorized"
        ]

    @pytest.mark.parametrize("action", ["cancel", "retry"])
    async def test_cancel_during_exchange_prevents_publication(
        self,
        marketplace,
        monkeypatch,
        action,
    ):
        import asyncio
        from qwenpaw.app.mcp import oauth_bridge

        state = await marketplace.start()
        exchanged, release = asyncio.Event(), asyncio.Event()
        call = oauth_bridge._call

        async def gating_call(dispatcher, identity, method, path, **kwargs):
            result = await call(dispatcher, identity, method, path, **kwargs)
            if path == "/oauth/callback":
                exchanged.set()
                await release.wait()
            return result

        monkeypatch.setattr(oauth_bridge, "_call", gating_call)
        callback = asyncio.create_task(marketplace.complete(state, 400))
        try:
            await asyncio.wait_for(exchanged.wait(), 15)
            if action == "cancel":
                await marketplace.api(
                    "DELETE",
                    f"/oauth/session/k1?session_id={state}",
                )
            else:
                new_state = await marketplace.start()
                assert (await marketplace.status(new_state)).json()[
                    "phase"
                ] == "pending"
        finally:
            release.set()
        await callback
        assert (await marketplace.status(state)).json()["phase"] == "cancelled"
        assert not (await marketplace.api("GET", "/oauth/status/k1")).json()[
            "authorized"
        ]

    async def test_session_status_does_not_mistake_old_tokens_for_new_authorization(  # noqa: E501
        self,
        marketplace,
    ):
        await marketplace.complete(await marketplace.start())
        state = await marketplace.start()
        pending = (await marketplace.status(state)).json()
        assert pending["phase"] == pending["attempt_status"] == "pending"
        assert pending["authorized"] is False
        assert pending["expires_at"] == 0 and pending["scope"] == ""
        assert (await marketplace.api("GET", "/oauth/status/k1")).json()[
            "authorized"
        ]

    async def test_denied_authorization_is_reported_without_provider_error_secrets(  # noqa: E501
        self,
        marketplace,
    ):
        state = await marketplace.start()
        await marketplace.api(
            "GET",
            f"/oauth/callback?state={state}&error=access_denied"
            "&error_description=provider-sensitive-details",
            400,
        )
        result = await marketplace.status(state)
        assert result.json()["phase"] == "denied"
        assert result.json()["authorized"] is False
        assert "provider-sensitive-details" not in result.text

    async def test_cancelling_session_blocks_late_callback_without_revoking_account(  # noqa: E501
        self,
        marketplace,
    ):
        await marketplace.complete(await marketplace.start())
        state = await marketplace.start()
        marketplace.evidence.unlink()
        await marketplace.api(
            "DELETE",
            f"/oauth/session/k1?session_id={state}",
        )
        await marketplace.complete(state, 400)
        assert not marketplace.evidence.exists()
        assert (await marketplace.status(state)).json()["phase"] == "cancelled"
        assert (await marketplace.api("GET", "/oauth/status/k1")).json()[
            "authorized"
        ]

    async def test_retry_supersedes_previous_session_and_enforces_agent_scope(
        self,
        marketplace,
    ):
        first = await marketplace.start()
        second = await marketplace.start()
        assert first != second
        assert (await marketplace.status(first)).json()["phase"] == "cancelled"
        await marketplace.complete(first, 400)
        await marketplace.host._workspace("another")
        await marketplace.create("another")
        await marketplace.status(second, expected=404, agent="another")
        await marketplace.api(
            "DELETE",
            f"/oauth/session/k1?session_id={second}",
            404,
            "another",
        )
        assert (await marketplace.status(second)).json()["phase"] == "pending"

    async def test_success_reports_current_session_and_keeps_disabled_until_connect(  # noqa: E501
        self,
        marketplace,
    ):
        state = await marketplace.start()
        await marketplace.complete(state)
        response = await marketplace.status(state)
        assert response.json()["phase"] == "authorized"
        assert response.json()["authorized"] is True
        assert "access_token" not in response.text
        assert (await marketplace.api("GET", "/k1")).json()["enabled"] is False

    async def test_expired_session_returns_actionable_state(self, marketplace):
        state = await marketplace.start()
        ledger = marketplace.host._http_app.state.mcp_oauth_attempts
        ledger[state].overlay.expires_at -= 601
        result = (await marketplace.status(state)).json()
        assert result["phase"] == "expired" and result["authorized"] is False
