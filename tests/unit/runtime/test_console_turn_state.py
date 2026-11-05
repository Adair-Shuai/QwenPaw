# -*- coding: utf-8 -*-
"""Regression coverage for damaged history image repair."""

from unittest.mock import MagicMock
from copy import deepcopy
from types import SimpleNamespace
import nturl2path

import pytest
from PIL import Image

from qwenpaw.runtime import console_turn_state

pytestmark = [pytest.mark.unit, pytest.mark.p1]


def _history(*urls):
    return {
        "state": {
            "context": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {"media_type": "image/png", "url": url},
                        }
                        for url in urls
                    ],
                },
            ],
        },
    }


def test_repair_preserves_valid_remote_and_missing_images(tmp_path):
    # Literal percent escapes must not be decoded twice.
    damaged = tmp_path / "broken %20 图片.png"
    damaged.write_bytes(b"not an image")
    valid = tmp_path / "valid.png"
    Image.new("RGB", (1, 1)).save(valid)
    data = _history(
        damaged.as_uri(),
        valid.as_uri(),
        "https://example.com/image.png",
        (tmp_path / "missing.png").as_uri(),
    )
    message = data["state"]["context"][0]
    original = list(message["content"])

    console_turn_state.repair_invalid_history_images(data)
    console_turn_state.repair_invalid_history_images(data)

    assert message["content"][0]["type"] == "text"
    assert message["content"][1:] == original[1:]
    assert message["metadata"]["qwenpaw_invalid_images"] == original[:1]
    assert damaged.read_bytes() == b"not an image"


@pytest.mark.parametrize(
    ("url", "expected"),
    [
        ("file:///C:/tmp/a.png", "C:\\tmp\\a.png"),
        ("file://localhost/C:/tmp/a.png", "C:\\tmp\\a.png"),
        ("file://server/share/a.png", "\\\\server\\share\\a.png"),
        ("file:////server/share/a.png", "\\\\server\\share\\a.png"),
        ("file:///C:/tmp/a%20b%2520.png", "C:\\tmp\\a b%20.png"),
        ("file:///C:/tmp/%E5%9B%BE.png", "C:\\tmp\\图.png"),
    ],
)
def test_windows_file_uri_reaches_image_validation(monkeypatch, url, expected):
    # Exercise the Windows stdlib converter even on POSIX test hosts.
    monkeypatch.setattr(
        console_turn_state,
        "url2pathname",
        nturl2path.url2pathname,
    )
    path_factory = MagicMock()
    path_factory.return_value.is_file.return_value = True
    monkeypatch.setattr(console_turn_state, "Path", path_factory)
    image_open = MagicMock(side_effect=OSError("damaged image"))
    monkeypatch.setattr(Image, "open", image_open)
    data = _history(url)

    console_turn_state.repair_invalid_history_images(data)

    path_factory.assert_called_once_with(expected)
    image_open.assert_called_once_with(path_factory.return_value)
    message = data["state"]["context"][0]
    assert message["content"][0]["type"] == "text"
    assert message["metadata"]["qwenpaw_invalid_images"][0]["source"]["url"] == url


def _regeneration_request(target):
    return SimpleNamespace(
        channel="console",
        request_context={console_turn_state.REGENERATE_FROM: target},
    )


def _steered_turn():
    return {
        "state": {
            "context": [
                {"id": "earlier", "role": "user", "content": "earlier"},
                {"id": "earlier-answer", "role": "assistant", "content": "ok"},
                {
                    "id": "root",
                    "role": "user",
                    "content": [{"type": "text", "text": "original task"}],
                    "metadata": {console_turn_state.CLIENT_ID: "root-client"},
                },
                {"id": "first-step", "role": "assistant", "content": "working"},
                {
                    "id": "supplement",
                    "role": "user",
                    "content": "check completeness first",
                    "metadata": {
                        console_turn_state.CLIENT_ID: "supplement-client",
                        console_turn_state.STEERING: {
                            "request_id": "steering-request",
                            "run_id": "active-run",
                        },
                    },
                },
                {"id": "answer", "role": "assistant", "content": "done"},
            ],
        },
        "scroll": {"summary": "original response and supplement"},
    }


@pytest.mark.parametrize("target", ["root-client", {"message_id": "root"}])
def test_regeneration_rewinds_entire_steered_turn_from_original_user(target):
    data = _steered_turn()
    earlier = deepcopy(data["state"]["context"][:2])

    console_turn_state.prepare_console_regeneration(
        data,
        _regeneration_request(target),
    )

    assert data["state"]["context"] == earlier
    assert "scroll" not in data


@pytest.mark.parametrize(
    "target",
    ["supplement-client", {"message_id": "supplement"}],
)
def test_regeneration_cannot_target_only_in_flight_supplement(target):
    data = _steered_turn()
    original = deepcopy(data)

    with pytest.raises(ValueError, match="no longer the last turn"):
        console_turn_state.prepare_console_regeneration(
            data,
            _regeneration_request(target),
        )

    assert data == original


@pytest.mark.parametrize(
    "marker",
    [None, True, {}, {"run_id": "active-run"}, {"request_id": "r", "run_id": " "}],
)
def test_regeneration_never_skips_ordinary_or_malformed_later_user(marker):
    data = _steered_turn()
    data["state"]["context"][4]["metadata"][console_turn_state.STEERING] = marker
    original = deepcopy(data)

    with pytest.raises(ValueError, match="no longer the last turn"):
        console_turn_state.prepare_console_regeneration(
            data,
            _regeneration_request("root-client"),
        )

    assert data == original


def test_regeneration_cannot_rewind_steered_turn_after_new_user_turn():
    data = _steered_turn()
    data["state"]["context"].append(
        {
            "id": "next-user",
            "role": "user",
            "metadata": {console_turn_state.CLIENT_ID: "next-client"},
            "content": "next task",
        },
    )
    original = deepcopy(data)

    with pytest.raises(ValueError, match="no longer the last turn"):
        console_turn_state.prepare_console_regeneration(
            data,
            _regeneration_request("root-client"),
        )

    assert data == original


def test_terminal_stamp_stays_on_original_user_after_in_flight_supplement():
    data = _steered_turn()
    request = SimpleNamespace(
        channel="console",
        input=[SimpleNamespace(metadata={console_turn_state.CLIENT_ID: "root-client"})],
    )

    console_turn_state.stamp_console_turn(
        data,
        request,
        "completed",
        response_id="same-response",
    )

    assert data["state"]["context"][2]["metadata"][console_turn_state.TURN_STATE] == {
        "status": "completed",
        "response_id": "same-response",
    }
    assert console_turn_state.TURN_STATE not in data["state"]["context"][4]["metadata"]
