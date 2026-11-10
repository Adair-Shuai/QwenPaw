# -*- coding: utf-8 -*-
"""Bilingual scripts through real workers, HTTP runs and durable storage."""

import asyncio
import copy
import importlib
import time
from types import SimpleNamespace

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

TEXT_STATS_SOURCE = r"""
import re
import string
import unicodedata

story = text if isinstance(text, str) else str(text)
punct_breakdown = {}
for ch in story:
    if unicodedata.category(ch).startswith("P") or ch in string.punctuation:
        punct_breakdown[ch] = punct_breakdown.get(ch, 0) + 1

whitespace = sum(ch.isspace() for ch in story)
# Commas continue a sentence. A decimal point between digits also continues it.
sentences = re.split(r"[。！？!?]+|(?<!\d)\.|\.(?!\d)", story)
result = {
    "text": story,
    "statistics": {
        "total_chars": len(story),
        "chars_without_whitespace": len(story) - whitespace,
        "chinese_chars": sum(
            unicodedata.name(ch, "").startswith(
                ("CJK UNIFIED IDEOGRAPH", "CJK COMPATIBILITY IDEOGRAPH")
            ) for ch in story
        ),
        "latin_letters": sum(
            ch.isalpha() and unicodedata.name(ch, "").startswith("LATIN ")
            for ch in story
        ),
        "digits": sum(ch.isdigit() for ch in story),
        "whitespace_chars": whitespace,
        "punctuation_total": sum(punct_breakdown.values()),
        "punctuation_breakdown": punct_breakdown,
        "sentence_count": len([s for s in sentences if s.strip()]),
        "paragraph_count": len([
            p for p in re.split(r"\r\n|[\r\n]", story) if p.strip()
        ]),
    },
}
""".strip()


@pytest.fixture(
    name="package",
    params=["qwenpaw.plugins_bundle", "plugins.bundle"],
)
def _package(request):
    return f"{request.param}.flowforge"


@pytest.mark.parametrize(
    "source",
    [
        "result = re.findall(r'[A-Za-z]+', text)",
        "import re\nresult = re.findall(r'[A-Za-z]+', text)",
        "import re as regex\nresult = regex.findall(r'[A-Za-z]+', text)",
        "from re import findall\nresult = findall(r'[A-Za-z]+', text)",
        'import json\nresult = json.loads(\'["Hello", "world"]\')',
    ],
)
def test_preloaded_and_standard_imports_share_worker_contract(package, source):
    sandbox = importlib.import_module(f"{package}.engine.adapter.sandbox")
    result = asyncio.run(
        sandbox.execute_script(
            source,
            inputs={"text": "你好，Hello world！"},
            allow_modules=["re"],
        ),
    )
    assert result.result == ["Hello", "world"]


@pytest.mark.parametrize(
    "text",
    ["Hello, world!", "春天 老屋 灯火。", "中文 café 🙂\r\nEnglish 123！"],
)
def test_worker_utf8_round_trip_preserves_text_stdout_and_errors(
    package,
    text,
):
    sandbox = importlib.import_module(f"{package}.engine.adapter.sandbox")
    result = asyncio.run(
        sandbox.execute_script(
            "print(text)\nresult = {'text': text, 'length': len(text)}",
            inputs={"text": text},
        ),
    )
    assert result.result == {"text": text, "length": len(text)}
    assert result.stdout == text + "\n"
    with pytest.raises(sandbox.ScriptExecutionError, match=text.split()[0]):
        asyncio.run(
            sandbox.execute_script(
                "raise ValueError(text)",
                inputs={"text": text},
            ),
        )


@pytest.mark.parametrize(
    "source",
    [
        "import os",
        "from pathlib import Path",
        "from . import re",
        "result = __import__('os')",
    ],
)
def test_worker_rejects_imports_outside_standard_module_list(package, source):
    sandbox = importlib.import_module(f"{package}.engine.adapter.sandbox")
    with pytest.raises(
        sandbox.ScriptExecutionError,
        match="module is not permitted",
    ):
        asyncio.run(sandbox.execute_script(source))


@pytest.mark.parametrize(
    "source",
    ["import os", "from . import re", "if True", "return 1"],
)
def test_script_validation_reports_source_errors_before_execution(
    package,
    tmp_path,
    source,
):
    service_module = importlib.import_module(f"{package}.service")
    with_service = service_module.WorkflowService(flows_dir=tmp_path)
    try:
        result = with_service.validate_flow(
            {
                "id": "invalid-script",
                "nodes": {
                    "stats": {
                        "class_type": "ScriptNode",
                        "inputs": {"source": source},
                    },
                },
            },
        )
        assert not result["ok"]
        assert any(
            item["code"] == "SCRIPT_SOURCE_INVALID"
            and item["node_id"] == "stats"
            and item["field"] == "inputs.source"
            for item in result["diagnostics"]
        )
    finally:
        with_service.close(timeout=3)


@pytest.mark.parametrize(
    "text,expected",
    [
        (
            "你好，世界。",
            {
                "total_chars": 6,
                "chinese_chars": 4,
                "latin_letters": 0,
                "punctuation_total": 2,
                "sentence_count": 1,
            },
        ),
        (
            "Hello, world.",
            {
                "total_chars": 13,
                "chinese_chars": 0,
                "latin_letters": 10,
                "punctuation_total": 2,
                "sentence_count": 1,
            },
        ),
        (
            "Hello, world. It costs 1.5 dollars!",
            {"sentence_count": 2, "digits": 2, "punctuation_total": 4},
        ),
        (
            "春天，Hello café 123！🙂\r\n第二段。",
            {
                "chinese_chars": 5,
                "latin_letters": 9,
                "digits": 3,
                "punctuation_total": 3,
                "sentence_count": 2,
                "paragraph_count": 2,
            },
        ),
        (
            "𠮷，A！",
            {
                "total_chars": 4,
                "chinese_chars": 1,
                "latin_letters": 1,
                "punctuation_total": 2,
                "sentence_count": 1,
            },
        ),
        ("", {"total_chars": 0, "sentence_count": 0, "paragraph_count": 0}),
    ],
)
def test_bilingual_statistics_through_http_and_restart(
    package,
    tmp_path,
    text,
    expected,
):
    service_module = importlib.import_module(f"{package}.service")
    router_module = importlib.import_module(f"{package}.router")
    calls = []

    async def complete(**kwargs):
        calls.append([message.to_dict() for message in kwargs["messages"]])
        return SimpleNamespace(content=text)

    service = service_module.WorkflowService(flows_dir=tmp_path)
    service.executor.llm_service = SimpleNamespace(complete=complete)
    flow = {
        "id": "bilingual-story",
        "inputs": [
            {"name": "keywords", "type": "string", "default": "春天 Hello"},
        ],
        "nodes": {
            "input": {
                "class_type": "InputNode",
                "inputs": {"name": "keywords"},
            },
            "story": {
                "class_type": "LLMCallNode",
                "inputs": {
                    "system": "写故事 Write a story about ${inputs.keywords}",
                    "prompt": ["input", 0],
                },
            },
            "stats": {
                "class_type": "ScriptNode",
                "inputs": {
                    "source": TEXT_STATS_SOURCE,
                    "inputs": {"text": ["story", 0]},
                },
            },
            "output": {
                "class_type": "OutputNode",
                "inputs": {"value": ["stats", 0]},
            },
        },
        "edges": [
            {
                "source": "input",
                "target": "story",
                "target_handle": "prompt",
                "source_slot": 0,
            },
            {"source": "story", "target": "stats", "source_slot": 0},
            {
                "source": "stats",
                "target": "output",
                "target_handle": "value",
                "source_slot": 0,
            },
        ],
        "outputs": ["output"],
    }
    app = FastAPI()
    app.include_router(router_module.build_router(service))
    try:
        with TestClient(app) as client:
            validation = client.post("/flows/validate", json=flow)
            assert validation.status_code == 200
            assert validation.json()["ok"], validation.json()
            saved = client.post("/flows", json=flow)
            assert saved.status_code == 200, saved.text
            started = client.post("/flows/bilingual-story/run", json={})
            assert started.status_code == 200, started.text
            run_id = started.json()["run_id"]
            deadline = time.monotonic() + 8
            while time.monotonic() < deadline:
                record = client.get(f"/runs/{run_id}").json()
                if record["status"] in {"completed", "failed"}:
                    break
                time.sleep(0.01)
            assert record["status"] == "completed", record
            result = record["outputs"]["output"]
            assert result["text"] == text
            for key, value in expected.items():
                assert result["statistics"][key] == value, (key, result)
            assert calls == [
                [
                    {
                        "role": "system",
                        "name": "system",
                        "content": "写故事 Write a story about 春天 Hello",
                    },
                    {"role": "user", "name": "user", "content": "春天 Hello"},
                ],
            ]
            assert record["errors"] == []
    finally:
        service.close(timeout=3)
    reopened = service_module.WorkflowService(flows_dir=tmp_path)
    try:
        persisted = reopened.get_run_record(run_id)
        assert persisted["status"] == "completed"
        assert persisted["outputs"]["output"] == result
    finally:
        reopened.close(timeout=3)


def test_legacy_llm_without_system_and_unknown_input_diagnostics(
    package,
    tmp_path,
):
    service_module = importlib.import_module(f"{package}.service")
    service = service_module.WorkflowService(flows_dir=tmp_path)
    calls = []

    async def complete(**kwargs):
        calls.append(kwargs["messages"])
        return SimpleNamespace(content="Hello 你好")

    service.executor.llm_service = SimpleNamespace(complete=complete)
    flow = {
        "id": "legacy",
        "nodes": {
            "llm": {
                "class_type": "LLMCallNode",
                "inputs": {"prompt": "Hello", "typo": "visible warning"},
            },
        },
    }
    try:
        before = copy.deepcopy(flow)
        validation = service.validate_flow(flow)
        assert flow == before
        assert validation["ok"]
        assert any(
            item["code"] == "INPUT_UNKNOWN" and item["field"] == "inputs.typo"
            for item in validation["diagnostics"]
        )
        engine = importlib.import_module(f"{package}.engine")
        result = asyncio.run(service.executor.execute(engine.load(flow), {}))
        assert result.status.value == "completed"
        assert [(m.role, m.content) for m in calls[0]] == [("user", "Hello")]
    finally:
        service.close(timeout=3)
