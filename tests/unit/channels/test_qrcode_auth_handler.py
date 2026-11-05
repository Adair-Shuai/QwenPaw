# -*- coding: utf-8 -*-
"""QR authorization through plugin Drivers and closed management RPC."""

# pylint: disable=redefined-outer-name
from __future__ import annotations

import base64
import importlib
import inspect
import json
from pathlib import Path
from urllib.parse import parse_qs, urlsplit
from uuid import uuid4

import httpx
import pytest

from qwenpaw.channel_protocol.errors import ProtocolValidationError
from qwenpaw.channel_protocol.management import (
    MANAGEMENT_CAPABILITIES,
    ManagementRequest,
)
from qwenpaw.channel_protocol.shared import SharedChannelDescriptor
from qwenpaw.plugins.official_channel_catalog import OFFICIAL_CHANNELS

ROOT = Path(__file__).resolve().parents[3]
FEISHU = "https://accounts.feishu.cn/oauth/v1/app/registration"
DINGTALK = "https://oapi.dingtalk.com/app/registration"


def _driver(channel, monkeypatch):
    row = next(
        row for row in OFFICIAL_CHANNELS if row["channel_key"] == channel
    )
    source = ROOT / "plugins/channel" / row["source_dir"]
    descriptor = SharedChannelDescriptor.load(source / "channel.json")
    monkeypatch.syspath_prepend(str(source))
    module = importlib.import_module(descriptor.entrypoint.module)
    driver = module
    for part in descriptor.entrypoint.qualname.split("."):
        driver = getattr(driver, part)
    return descriptor, driver


@pytest.fixture
def feishu_handler(monkeypatch):
    return _driver("feishu", monkeypatch)[1].manage


@pytest.fixture
def dingtalk_handler(monkeypatch):
    return _driver("dingtalk", monkeypatch)[1].manage


def _request(channel, operation="qrcode.poll", **parameters):
    parameters.setdefault("config", {})
    if operation == "qrcode.poll":
        continuation = (
            base64.urlsafe_b64encode(
                json.dumps(
                    {"device_code": "device_123", "domain": "feishu"},
                ).encode(),
            ).decode()
            if channel == "feishu"
            else "device_123"
        )
        parameters.setdefault("continuation", continuation)
    return ManagementRequest.from_mapping(
        {
            "request_id": str(uuid4()),
            "plugin_id": channel,
            "workspace_id": "authorization-test",
            "channel_key": channel,
            "instance_id": "authorization-instance",
            "generation": 1,
            "source_revision": "a" * 64,
            "operation": operation,
            "timeout_ms": 2000,
            "parameters": parameters,
        },
    )


def _fetch_route(respx_mock, endpoint=FEISHU):
    return respx_mock.post(endpoint).mock(
        side_effect=[
            httpx.Response(
                200,
                json={
                    "supported_auth_methods": ["client_secret"],
                },
            ),
            httpx.Response(
                200,
                json={
                    "device_code": "device_123",
                    "verification_uri_complete": (
                        "https://example.test/" "qr?code=abc"
                    ),
                },
            ),
        ],
    )


class TestFeishuQRCodeAuthHandler:
    """Exercise the real descriptor-selected Feishu static management hook."""

    @pytest.mark.asyncio
    async def test_get_domain_default_feishu(self, feishu_handler, respx_mock):
        route = _fetch_route(respx_mock)
        result = await feishu_handler(_request("feishu", "qrcode.fetch"))
        assert result.outcome == "ok"
        assert route.call_count == 2
        assert all(str(call.request.url) == FEISHU for call in route.calls)

    @pytest.mark.asyncio
    @pytest.mark.parametrize("domain", ["feishu", "lark"])
    async def test_get_accounts_domain(
        self,
        feishu_handler,
        respx_mock,
        domain,
    ):
        host = "feishu.cn" if domain == "feishu" else "larksuite.com"
        route = _fetch_route(
            respx_mock,
            f"https://accounts.{host}/oauth/v1/app/registration",
        )
        result = await feishu_handler(
            _request(
                "feishu",
                "qrcode.fetch",
                options={"domain": domain},
            ),
        )
        assert result.outcome == "ok" and route.call_count == 2
        state = json.loads(
            base64.urlsafe_b64decode(
                result.result["continuation"],
            ),
        )
        assert state == {"device_code": "device_123", "domain": domain}

    @pytest.mark.asyncio
    async def test_fetch_qrcode_success(self, feishu_handler, respx_mock):
        _fetch_route(respx_mock)
        request = _request("feishu", "qrcode.fetch")
        result = await feishu_handler(request)
        result.validate_for(request, credential_keys=())
        assert result.outcome == "ok"
        query = parse_qs(urlsplit(result.result["scan_url"]).query)
        from qwenpaw.constant import PROJECT_NAME

        assert query["source"] == [PROJECT_NAME]
        assert query["code"] == ["abc"]
        assert (
            json.loads(
                base64.urlsafe_b64decode(
                    result.result["continuation"],
                ),
            )["device_code"]
            == "device_123"
        )

    @pytest.mark.asyncio
    async def test_fetch_qrcode_unsupported_auth_method(
        self,
        feishu_handler,
        respx_mock,
    ):
        route = respx_mock.post(FEISHU).respond(
            200,
            json={
                "supported_auth_methods": ["other_method"],
            },
        )
        result = await feishu_handler(_request("feishu", "qrcode.fetch"))
        assert result.outcome == "failed"
        assert result.reason_code == "PLATFORM_REJECTED"
        assert result.result is None and route.call_count == 1

    @pytest.mark.asyncio
    async def test_fetch_qrcode_missing_device_code(
        self,
        feishu_handler,
        respx_mock,
    ):
        respx_mock.post(FEISHU).mock(
            side_effect=[
                httpx.Response(
                    200,
                    json={
                        "supported_auth_methods": ["client_secret"],
                    },
                ),
                httpx.Response(
                    200,
                    json={
                        "verification_uri_complete": "https://example.test/qr",
                    },
                ),
            ],
        )
        with pytest.raises(ProtocolValidationError) as caught:
            await feishu_handler(_request("feishu", "qrcode.fetch"))
        assert caught.value.reason_code == "PLATFORM_RESULT_UNKNOWN"

    @pytest.mark.asyncio
    async def test_poll_status_success(self, feishu_handler, respx_mock):
        route = respx_mock.post(FEISHU).respond(
            200,
            json={
                "client_id": "cli_abc123",
                "client_secret": "secret_xyz789",
                "user_info": {
                    "open_id": "ou_user123",
                    "tenant_brand": "feishu",
                },
            },
        )
        request = _request("feishu")
        result = await feishu_handler(request)
        result.validate_for(request, credential_keys={"app_id", "app_secret"})
        assert result.result["status"] == "success"
        assert result.result["credentials"] == {
            "app_id": "cli_abc123",
            "app_secret": "secret_xyz789",
        }
        assert result.result["metadata"] == {
            "open_id": "ou_user123",
            "tenant_brand": "feishu",
        }
        assert parse_qs(route.calls[0].request.content.decode()) == {
            "action": ["poll"],
            "device_code": ["device_123"],
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
        respx_mock,
        error,
        expected_status,
    ):
        # OAuth400 payloads still carry authoritative pending/denied states.
        respx_mock.post(FEISHU).respond(400, json={"error": error})
        result = await feishu_handler(_request("feishu"))
        assert result.outcome == "ok"
        assert result.result["status"] == expected_status

    @pytest.mark.asyncio
    async def test_poll_status_network_error(self, feishu_handler, respx_mock):
        respx_mock.post(FEISHU).mock(side_effect=httpx.ConnectError("offline"))
        with pytest.raises(ProtocolValidationError) as caught:
            await feishu_handler(_request("feishu"))
        assert caught.value.reason_code == "PLATFORM_RESULT_UNKNOWN"


class TestDingtalkQRCodeAuthHandler:
    """Credentials are accepted by the delivered DingTalk management hook."""

    @pytest.mark.asyncio
    @pytest.mark.parametrize("status", ["APPROVING", "SUCCESS"])
    async def test_poll_status_returns_credentials_once_issued(
        self,
        dingtalk_handler,
        respx_mock,
        status,
    ):
        respx_mock.post(DINGTALK + "/poll").respond(
            200,
            json={
                "errcode": 0,
                "errmsg": "ok",
                "status": status,
                "client_id": "ding6qfjtrjlehq3rmee",
                "client_secret": "secret-value",
                "robot_code": "ding6qfjtrjlehq3rmee",
                "mode": "STREAM",
            },
        )
        request = _request("dingtalk")
        result = await dingtalk_handler(request)
        result.validate_for(
            request,
            credential_keys={
                "client_id",
                "client_secret",
            },
        )
        assert result.result["status"] == "success"
        assert result.result["credentials"] == {
            "client_id": "ding6qfjtrjlehq3rmee",
            "client_secret": "secret-value",
        }

    @pytest.mark.asyncio
    @pytest.mark.parametrize("status", ["WAITING", "BRAND_NEW"])
    async def test_poll_status_without_credentials_keeps_waiting(
        self,
        dingtalk_handler,
        respx_mock,
        status,
    ):
        respx_mock.post(DINGTALK + "/poll").respond(
            200,
            json={
                "errcode": 0,
                "errmsg": "ok",
                "status": status,
            },
        )
        result = await dingtalk_handler(_request("dingtalk"))
        assert result.result == {"status": "waiting", "credentials": {}}

    @pytest.mark.asyncio
    async def test_poll_status_null_credentials_keeps_waiting(
        self,
        dingtalk_handler,
        respx_mock,
    ):
        respx_mock.post(DINGTALK + "/poll").respond(
            200,
            json={
                "errcode": 0,
                "errmsg": "ok",
                "status": "WAITING",
                "client_id": None,
                "client_secret": None,
            },
        )
        result = await dingtalk_handler(_request("dingtalk"))
        assert result.result == {"status": "waiting", "credentials": {}}

    @pytest.mark.asyncio
    async def test_poll_status_partial_credentials_keeps_waiting(
        self,
        dingtalk_handler,
        respx_mock,
    ):
        respx_mock.post(DINGTALK + "/poll").respond(
            200,
            json={
                "errcode": 0,
                "errmsg": "ok",
                "status": "SUCCESS",
                "client_id": "ding6qfjtrjlehq3rmee",
                "client_secret": "",
            },
        )
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
        respx_mock,
        status,
        expected_status,
    ):
        respx_mock.post(DINGTALK + "/poll").respond(
            200,
            json={
                "errcode": 0,
                "errmsg": "ok",
                "status": status,
                "fail_reason": "user denied",
            },
        )
        result = await dingtalk_handler(_request("dingtalk"))
        assert result.result == {
            "status": expected_status,
            "credentials": {"fail_reason": "user denied"},
        }


class TestQRCodeAuthHandlerRegistry:
    """The real delivered descriptors replace the retired core registry."""

    def test_registry_contains_all_channels(self):
        qr_channels = {
            row["channel_key"]
            for row in OFFICIAL_CHANNELS
            if MANAGEMENT_CAPABILITIES["qrcode.fetch"]
            in SharedChannelDescriptor.load(
                ROOT / "plugins/channel" / row["source_dir"] / "channel.json",
            ).capabilities
        }
        assert qr_channels == {"wechat", "wecom", "dingtalk", "feishu", "qq"}

    def test_registry_handlers_are_correct_type(self, monkeypatch):
        for channel in ("wechat", "wecom", "dingtalk", "feishu", "qq"):
            descriptor, driver = _driver(channel, monkeypatch)
            assert descriptor.channel_key == channel
            assert MANAGEMENT_CAPABILITIES["qrcode.fetch"] in (
                descriptor.capabilities
            )
            method = inspect.getattr_static(driver, "manage")
            assert isinstance(method, staticmethod)
            assert inspect.iscoroutinefunction(method.__func__)
