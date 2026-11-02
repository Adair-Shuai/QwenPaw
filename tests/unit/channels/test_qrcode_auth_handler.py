# -*- coding: utf-8 -*-
"""Device Flow through the extracted plugins' real management hooks."""
from __future__ import annotations

import base64
from functools import partial
import importlib
import json
from pathlib import Path
import sys
from unittest.mock import AsyncMock, MagicMock, patch
from urllib.parse import parse_qs
from uuid import uuid4

import httpx
import pytest

from qwenpaw.channel_protocol.errors import ProtocolValidationError
from qwenpaw.channel_protocol.management import ManagementRequest

CHANNELS = Path(__file__).resolve().parents[3] / "plugins" / "channel"


def _load_management(channel):
    # Packages have no driver imports; relative transport helpers remain real.
    with patch("sys.path", [str(CHANNELS / channel), *sys.path]):
        return importlib.import_module(
            f"qwenpaw_channel_{channel}.management",
        ).manage


@pytest.fixture(name="feishu_handler")
def _feishu_handler():
    return _load_management("feishu")


@pytest.fixture(name="dingtalk_handler")
def _dingtalk_handler():
    return _load_management("dingtalk")


def _request(channel, operation="qrcode.poll", **parameters):
    payload = {"config": {}}
    if operation == "qrcode.poll":
        payload["continuation"] = (
            base64.urlsafe_b64encode(
                json.dumps(
                    {"device_code": "device_123", "domain": "feishu"},
                ).encode(),
            ).decode("ascii")
            if channel == "feishu"
            else "device_123"
        )
    payload.update(parameters)
    return ManagementRequest(
        request_id=str(uuid4()),
        plugin_id=channel,
        channel_key=channel,
        workspace_id="test-workspace",
        instance_id="test-instance",
        generation=1,
        source_revision="a" * 64,
        operation=operation,
        timeout_ms=1000,
        parameters=payload,
    )


@pytest.fixture(name="mock_httpx_client")
def _mock_httpx_client():
    """Mock network transport while retaining real protocol validation."""

    def create(responses):
        client = MagicMock()
        client.post = AsyncMock(
            side_effect=responses if isinstance(responses, list) else None,
            return_value=responses,
        )
        factory = MagicMock()
        factory.return_value.__aenter__ = AsyncMock(return_value=client)
        factory.return_value.__aexit__ = AsyncMock(return_value=None)
        return factory

    return create


def _mock_response(json_data):
    response = MagicMock()
    response.json.return_value = json_data
    return response


class TestFeishuQRCodeAuthHandler:
    """Preserve former host-handler coverage at the actual worker boundary."""

    @pytest.mark.asyncio
    async def test_get_domain_default_feishu(
        self,
        feishu_handler,
        mock_httpx_client,
    ):
        response = _mock_response({"supported_auth_methods": []})
        factory = mock_httpx_client(response)
        with patch("httpx.AsyncClient", factory):
            await feishu_handler(_request("feishu", "qrcode.fetch"))
        client = factory.return_value.__aenter__.return_value
        assert client.post.call_args.args[0].startswith(
            "https://accounts.feishu.cn/",
        )

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "domain,origin",
        [
            ("feishu", "https://accounts.feishu.cn"),
            ("lark", "https://accounts.larksuite.com"),
        ],
    )
    async def test_get_accounts_domain(
        self,
        feishu_handler,
        mock_httpx_client,
        domain,
        origin,
    ):
        factory = mock_httpx_client(_mock_response({"error": "slow_down"}))
        continuation = base64.urlsafe_b64encode(
            json.dumps(
                {
                    "device_code": "device_123",
                    "domain": domain,
                },
            ).encode(),
        ).decode("ascii")
        with patch("httpx.AsyncClient", factory):
            await feishu_handler(_request("feishu", continuation=continuation))
        client = factory.return_value.__aenter__.return_value
        assert client.post.call_args.args[0].startswith(origin + "/")

    @pytest.mark.asyncio
    async def test_fetch_qrcode_success(
        self,
        feishu_handler,
        mock_httpx_client,
    ):
        factory = mock_httpx_client(
            [
                _mock_response({"supported_auth_methods": ["client_secret"]}),
                _mock_response(
                    {
                        "device_code": "device_123",
                        "verification_uri_complete": "https://x/?code=abc",
                    },
                ),
            ],
        )
        with patch("httpx.AsyncClient", factory):
            result = await feishu_handler(_request("feishu", "qrcode.fetch"))
        assert result.outcome == "ok"
        assert "source=QwenPaw" in result.result["scan_url"]
        assert "code=abc" in result.result["scan_url"]
        continuation = json.loads(
            base64.urlsafe_b64decode(
                result.result["continuation"],
            ),
        )
        assert continuation == {
            "device_code": "device_123",
            "domain": "feishu",
        }
        client = factory.return_value.__aenter__.return_value
        assert [
            parse_qs(call.kwargs["content"])["action"]
            for call in client.post.call_args_list
        ] == [["init"], ["begin"]]

    @pytest.mark.asyncio
    async def test_fetch_qrcode_unsupported_auth_method(
        self,
        feishu_handler,
        mock_httpx_client,
    ):
        response = _mock_response({"supported_auth_methods": ["other_method"]})
        with patch("httpx.AsyncClient", mock_httpx_client(response)):
            result = await feishu_handler(_request("feishu", "qrcode.fetch"))
        assert result.outcome == "failed"
        assert result.reason_code == "PLATFORM_REJECTED"

    @pytest.mark.asyncio
    async def test_fetch_qrcode_missing_device_code(
        self,
        feishu_handler,
        mock_httpx_client,
    ):
        factory = mock_httpx_client(
            [
                _mock_response({"supported_auth_methods": ["client_secret"]}),
                _mock_response(
                    {"verification_uri_complete": "https://example.com"},
                ),
            ],
        )
        with patch("httpx.AsyncClient", factory):
            with pytest.raises(ProtocolValidationError) as exc:
                await feishu_handler(_request("feishu", "qrcode.fetch"))
        assert exc.value.reason_code == "PLATFORM_RESULT_UNKNOWN"

    @pytest.mark.asyncio
    async def test_poll_status_success(
        self,
        feishu_handler,
        mock_httpx_client,
    ):
        response = _mock_response(
            {
                "client_id": "cli_abc123",
                "client_secret": "secret_xyz789",
                "user_info": {
                    "open_id": "ou_user123",
                    "tenant_brand": "feishu",
                },
            },
        )
        with patch("httpx.AsyncClient", mock_httpx_client(response)):
            result = await feishu_handler(_request("feishu"))
        assert result.result == {
            "status": "success",
            "credentials": {
                "app_id": "cli_abc123",
                "app_secret": "secret_xyz789",
            },
            "metadata": {"open_id": "ou_user123", "tenant_brand": "feishu"},
        }

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "error,expected_status",
        [
            ("authorization_pending", "waiting"),
            ("slow_down", "waiting"),
            ("expired_token", "expired"),
            ("invalid_grant", "expired"),
            ("access_denied", "fail"),
        ],
    )
    async def test_poll_status_errors(
        self,
        feishu_handler,
        mock_httpx_client,
        error,
        expected_status,
    ):
        with patch(
            "httpx.AsyncClient",
            mock_httpx_client(
                _mock_response({"error": error}),
            ),
        ):
            result = await feishu_handler(_request("feishu"))
        assert result.result["status"] == expected_status

    @pytest.mark.asyncio
    async def test_poll_status_network_error(
        self,
        feishu_handler,
        mock_httpx_client,
    ):
        factory = mock_httpx_client([])
        client = factory.return_value.__aenter__.return_value
        client.post.side_effect = httpx.ConnectError("Network error")
        with patch("httpx.AsyncClient", factory):
            with pytest.raises(ProtocolValidationError) as exc:
                await feishu_handler(_request("feishu"))
        assert exc.value.reason_code == "PLATFORM_RESULT_UNKNOWN"

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "continuation",
        [
            "not-base64!",
            "e30=",
            "bnVsbA==",
            base64.urlsafe_b64encode(
                json.dumps(
                    {
                        "device_code": "device",
                        "domain": "https://untrusted.invalid",
                    },
                ).encode(),
            ).decode("ascii"),
        ],
    )
    async def test_invalid_continuation_never_contacts_platform(
        self,
        feishu_handler,
        continuation,
    ):
        with patch("httpx.AsyncClient") as client:
            result = await feishu_handler(
                _request(
                    "feishu",
                    continuation=continuation,
                ),
            )
        assert result.reason_code == "MANAGEMENT_INVALID_REQUEST"
        client.assert_not_called()

    @pytest.mark.asyncio
    async def test_lark_option_is_carried_into_poll_continuation(
        self,
        feishu_handler,
    ):
        calls = []

        def respond(request):
            calls.append(request)
            assert request.url.host == "accounts.larksuite.com"
            action = parse_qs(request.content.decode())["action"][0]
            values = {
                "init": {"supported_auth_methods": ["client_secret"]},
                "begin": {
                    "device_code": "lark-code",
                    "verification_uri_complete": "https://example.com/lark",
                },
                "poll": {"error": "authorization_pending"},
            }
            return httpx.Response(200, json=values[action])

        factory = partial(
            httpx.AsyncClient,
            transport=httpx.MockTransport(respond),
        )
        with patch("httpx.AsyncClient", factory):
            fetched = await feishu_handler(
                _request(
                    "feishu",
                    "qrcode.fetch",
                    config={"domain": "feishu"},
                    options={"domain": "lark"},
                ),
            )
            polled = await feishu_handler(
                _request(
                    "feishu",
                    continuation=fetched.result["continuation"],
                ),
            )
        assert polled.result["status"] == "waiting"
        assert len(calls) == 3


class TestDingtalkQRCodeAuthHandler:
    @pytest.mark.asyncio
    async def test_fetch_qrcode_retains_init_cookie_and_nonce(
        self,
        dingtalk_handler,
    ):
        calls = []

        def respond(request):
            calls.append(request)
            if request.url.path.endswith("/init"):
                assert json.loads(request.content) == {"source": "QWENPAW"}
                return httpx.Response(
                    200,
                    json={"errcode": 0, "nonce": "n1"},
                    headers={"set-cookie": "session=auth; Path=/"},
                )
            assert request.url.path.endswith("/begin")
            assert request.headers["cookie"] == "session=auth"
            assert json.loads(request.content) == {"nonce": "n1"}
            return httpx.Response(
                200,
                json={
                    "errcode": 0,
                    "device_code": "ding-device",
                    "verification_uri_complete": "https://example.com/ding",
                },
            )

        factory = partial(
            httpx.AsyncClient,
            transport=httpx.MockTransport(respond),
        )
        with patch("httpx.AsyncClient", factory):
            result = await dingtalk_handler(
                _request("dingtalk", "qrcode.fetch"),
            )
        assert result.result == {
            "scan_url": "https://example.com/ding",
            "continuation": "ding-device",
            "expires_in_seconds": 7200,
        }
        assert len(calls) == 2

    @pytest.mark.asyncio
    @pytest.mark.parametrize("status", ["APPROVING", "SUCCESS"])
    async def test_poll_status_returns_credentials_once_issued(
        self,
        dingtalk_handler,
        mock_httpx_client,
        status,
    ):
        response = _mock_response(
            {
                "errcode": 0,
                "errmsg": "ok",
                "status": status,
                "client_id": "ding6qfjtrjlehq3rmee",
                "client_secret": "secret-value",
                "robot_code": "ding6qfjtrjlehq3rmee",
                "mode": "STREAM",
            },
        )
        with patch("httpx.AsyncClient", mock_httpx_client(response)):
            result = await dingtalk_handler(_request("dingtalk"))
        assert result.result == {
            "status": "success",
            "credentials": {
                "client_id": "ding6qfjtrjlehq3rmee",
                "client_secret": "secret-value",
            },
        }

    @pytest.mark.asyncio
    @pytest.mark.parametrize("status", ["WAITING", "BRAND_NEW"])
    async def test_poll_status_without_credentials_keeps_waiting(
        self,
        dingtalk_handler,
        mock_httpx_client,
        status,
    ):
        with patch(
            "httpx.AsyncClient",
            mock_httpx_client(
                _mock_response(
                    {"errcode": 0, "errmsg": "ok", "status": status},
                ),
            ),
        ):
            result = await dingtalk_handler(_request("dingtalk"))
        assert result.result == {"status": "waiting", "credentials": {}}

    @pytest.mark.asyncio
    async def test_poll_status_null_credentials_keeps_waiting(
        self,
        dingtalk_handler,
        mock_httpx_client,
    ):
        response = _mock_response(
            {
                "errcode": 0,
                "status": "WAITING",
                "client_id": None,
                "client_secret": None,
            },
        )
        with patch("httpx.AsyncClient", mock_httpx_client(response)):
            result = await dingtalk_handler(_request("dingtalk"))
        assert result.result == {"status": "waiting", "credentials": {}}

    @pytest.mark.asyncio
    async def test_poll_status_partial_credentials_keeps_waiting(
        self,
        dingtalk_handler,
        mock_httpx_client,
    ):
        response = _mock_response(
            {
                "errcode": 0,
                "status": "SUCCESS",
                "client_id": "ding6qfjtrjlehq3rmee",
                "client_secret": "",
            },
        )
        with patch("httpx.AsyncClient", mock_httpx_client(response)):
            result = await dingtalk_handler(_request("dingtalk"))
        assert result.result == {"status": "waiting", "credentials": {}}

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "status,expected_status",
        [
            ("FAIL", "fail"),
            ("EXPIRED", "expired"),
        ],
    )
    async def test_poll_status_terminal_failures(
        self,
        dingtalk_handler,
        mock_httpx_client,
        status,
        expected_status,
    ):
        response = _mock_response(
            {
                "errcode": 0,
                "status": status,
                "fail_reason": "user denied",
            },
        )
        with patch("httpx.AsyncClient", mock_httpx_client(response)):
            result = await dingtalk_handler(_request("dingtalk"))
        assert result.result == {
            "status": expected_status,
            "credentials": {
                "fail_reason": "user denied",
            },
        }


class TestQRCodeAuthHandlerRegistry:
    """Static QR support declarations and isolated executable hooks."""

    def test_registry_contains_all_channels(self):
        supported = set()
        for path in CHANNELS.glob("*/channel.json"):
            descriptor = json.loads(path.read_text(encoding="utf-8"))
            if "channel.management.qrcode.v1" in descriptor["capabilities"]:
                supported.add(descriptor["channel_key"])
        assert supported == {"wechat", "wecom", "dingtalk", "feishu", "qq"}

    def test_registry_handlers_are_correct_type(self):
        for channel in ("wechat", "wecom", "dingtalk", "feishu", "qq"):
            assert callable(_load_management(channel))
