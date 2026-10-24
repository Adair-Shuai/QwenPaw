"""URL query tokens are stored and resolved like header credentials."""

from types import SimpleNamespace
from urllib.parse import parse_qs, urlsplit

import pytest

from qwenpaw.drivers.adapters.mcp_card_builder import (
    build_mcp_credential_record,
    build_mcp_driver_card,
    build_mcp_client_info_payload,
)
from qwenpaw.drivers.adapters.mcp_url import (
    merge_query_credentials,
    split_query_credentials,
)
from qwenpaw.drivers.credentials.bindings import resolve_binding
from qwenpaw.drivers.credentials.types import ResolvedCredential


def test_query_tokens_are_masked_and_survive_console_roundtrip():
    client = SimpleNamespace(
        name="patsnap",
        transport="streamable_http",
        url="https://example.com/mcp?company_from=lab&apikey=a%2Bb%26c",
        headers={},
        env={},
    )
    record = build_mcp_credential_record("patsnap", client)
    card = build_mcp_driver_card(
        "patsnap", vars(client), record.ref, credential_record=record
    )
    assert "a+b&c" not in str(card.endpoint)
    assert card.endpoint["url"] == "https://example.com/mcp?company_from=lab"
    response = build_mcp_client_info_payload(card, record)
    assert "a+b&c" not in response["url"]
    assert "apikey=" in response["url"]
    saved = build_mcp_credential_record("patsnap", response, existing=record)
    assert saved.secrets == record.secrets
    values = resolve_binding(
        card.endpoint["query"], {"static": ResolvedCredential(secrets=record.secrets)}
    )
    assert parse_qs(
        urlsplit(merge_query_credentials(card.endpoint["url"], values)).query
    )["apikey"] == ["a+b&c"]


def test_query_credentials_do_not_follow_changed_endpoint():
    client = {
        "name": "lab",
        "transport": "sse",
        "url": "https://one.example/mcp?access_token=secret",
        "headers": {},
    }
    record = build_mcp_credential_record("lab", client)
    card = build_mcp_driver_card("lab", client, record.ref, credential_record=record)
    updated = build_mcp_driver_card(
        "lab",
        {**client, "url": "https://two.example/mcp"},
        record.ref,
        credential_record=record,
        existing=card,
    )
    assert not updated.endpoint.get("query")


def test_duplicate_query_credentials_rejected_and_public_query_preserved():
    with pytest.raises(ValueError, match="Duplicate"):
        split_query_credentials("https://example.com?token=a&token=b")
    url, secrets = split_query_credentials(
        "https://example.com?company_from=lab&preset=knowledge&token=secret"
    )
    assert secrets == {"token": "secret"}
    assert parse_qs(urlsplit(url).query) == {
        "company_from": ["lab"],
        "preset": ["knowledge"],
    }


@pytest.mark.asyncio
async def test_http_handler_rebuilds_query_from_saved_credential(monkeypatch):
    from qwenpaw.drivers.handlers import mcp as handlers
    from qwenpaw.drivers.credentials.providers import NoneProvider

    client = {"name": "patsnap", "transport": "streamable_http", "url": "https://example.com/mcp?apikey=a%2Bb%26c"}
    record = build_mcp_credential_record("patsnap", client)
    card = build_mcp_driver_card("patsnap", client, record.ref, credential_record=record)
    captured = {}

    class FakeClient:
        def __init__(self, **kwargs):
            captured.update(kwargs)

        async def connect(self, **kwargs):
            pass

        async def close(self, **kwargs):
            pass

    handler = handlers.MCPDriverHandler(card, NoneProvider())

    async def credentials():
        return {"static": ResolvedCredential(secrets=record.secrets)}

    monkeypatch.setattr(handler, "_resolve_credentials", credentials)
    monkeypatch.setattr(handlers, "HttpAutoClient", FakeClient)
    await handler._setup()
    assert parse_qs(urlsplit(captured["url"]).query)["apikey"] == ["a+b&c"]
    assert "a+b&c" not in str(card.endpoint)
    await handler._teardown()
