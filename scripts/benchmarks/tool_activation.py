# -*- coding: utf-8 -*-
"""Measure native chat, lazy tool activation and MCP through the running app.

Run with the repository virtualenv. All mutable fixtures belong to this run.
The default provider is read only to configure an optional in-memory relay.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import html
import json
import os
import shutil
import socket
import statistics
import subprocess
import sys
import tempfile
import time
import uuid
import zipfile
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import httpx

from tool_activation_server import BenchServer, Upstream


def dump(path, value):
    path.write_text(
        json.dumps(value, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def fingerprint(root):
    return {
        str(p.relative_to(root)): hashlib.sha256(p.read_bytes()).hexdigest()
        for p in root.rglob("*")
        if p.is_file()
    }


def percentile(values, percent):
    values = sorted(values)
    position = (len(values) - 1) * percent / 100
    lower = int(position)
    upper = min(lower + 1, len(values) - 1)
    return values[lower] + (values[upper] - values[lower]) * (position - lower)


class Benchmark:
    def __init__(self, args):
        self.args = args
        self.run_id = "bench" + uuid.uuid4().hex[:8]
        self.output = Path(args.output).resolve()
        self.output.mkdir(parents=True, exist_ok=True)
        if (self.output / "trials.jsonl").exists():
            raise ValueError("Choose a fresh output directory for each run")
        self.root = Path(tempfile.mkdtemp(prefix="qwenpaw-activation-"))
        self.client = httpx.Client(
            base_url=args.base_url,
            timeout=180,
            trust_env=False,
        )
        self.agents = []
        self.providers = []
        self.chats = []
        self.records = []
        self.checks = []
        self.cleanup = []
        self.server = None
        self.catalog = []
        self.model_info = {}
        self.enabled_tools = []
        self.app_process = None
        self.app_log = None

    def api(self, method, path, agent=None, **kwargs):
        headers = kwargs.pop("headers", {})
        if agent:
            headers["X-Agent-Id"] = agent
        attempts = 3 if method == "GET" else 1
        for attempt in range(attempts):
            try:
                response = self.client.request(
                    method,
                    "/api" + path,
                    headers=headers,
                    **kwargs,
                )
                break
            except httpx.TransportError as exc:
                self.checks.append(
                    {
                        "check": "api_transport_retry",
                        "method": method,
                        "path": path,
                        "attempt": attempt + 1,
                        "error": type(exc).__name__,
                        "passed": attempt + 1 < attempts,
                    },
                )
                if attempt + 1 == attempts:
                    raise
                time.sleep(0.25 * (attempt + 1))
        if response.is_error:
            raise RuntimeError(
                f"{method} {path} HTTP {response.status_code}: {response.text[:300]}",
            )
        return response.json() if response.content else None

    def setup(self):
        # pylint: disable=line-too-long,too-many-branches,too-many-statements
        self.catalog = self.api("GET", "/mcp/tools/kdocs")
        dump(self.output / "catalog.json", self.catalog)
        active = self.api("GET", "/models/active")
        source_profile = self.api("GET", "/agents/default")
        source_tools = self.api("GET", "/tools")
        dump(self.output / "source-native-tool-inventory.json", source_tools)
        self.source_plugins = self.api("GET", "/plugins")
        dump(self.output / "source-plugin-status.json", self.source_plugins)
        slot = active["active_llm"]
        self.model_info = {
            "provider_id": slot["provider_id"],
            "model": slot["model"],
        }
        upstream = None
        if self.args.live_repeats:
            from qwenpaw.providers import ProviderManager
            from qwenpaw.config import load_config
            from qwenpaw.utils.http import (
                apply_network_config,
                build_httpx_proxy_kwargs,
            )

            apply_network_config(load_config().network)

            provider = ProviderManager.get_instance().get_provider(
                slot["provider_id"],
            )
            adapter = provider.chat_model
            if adapter != "OpenAIChatModel":
                raise RuntimeError(
                    f"Live relay requires OpenAIChatModel, got {adapter}",
                )
            upstream = Upstream(
                provider.base_url or provider.default_base_url,
                provider.api_key,
                slot["model"],
                adapter,
                provider.get_effective_generate_kwargs(slot["model"]),
                build_httpx_proxy_kwargs(
                    provider.base_url or provider.default_base_url,
                ),
            )
        if self.args.isolated_app:
            from qwenpaw.constant import PLUGINS_DIR

            isolated_plugins = self.root / "app-state" / "plugins"

            def skip_fixture_data(directory, names):
                skipped = {
                    "node_modules",
                    ".venv",
                    "__pycache__",
                    ".git",
                } & set(names)
                if Path(directory).name == "visualization" and "data" in names:
                    skipped.add("data")
                return skipped

            shutil.copytree(
                PLUGINS_DIR,
                isolated_plugins,
                ignore=skip_fixture_data,
            )
            with socket.socket() as listener:
                listener.bind(("127.0.0.1", 0))
                port = listener.getsockname()[1]
            env = dict(os.environ)
            env["QWENPAW_WORKING_DIR"] = str(self.root / "app-state")
            # Windows registry proxies otherwise route loopback requests off-host.
            env["NO_PROXY"] = "127.0.0.1,localhost,::1"
            env["PYTHONUTF8"] = "1"
            env["PYTHONIOENCODING"] = "utf-8"
            # Owned by this session and closed in its cleanup routine.
            # pylint: disable-next=consider-using-with
            self.app_log = (self.output / "isolated-app.log").open(
                "w",
                encoding="utf-8",
            )
            # Session teardown owns this long-lived server process.
            # pylint: disable-next=consider-using-with
            self.app_process = subprocess.Popen(
                [
                    sys.executable,
                    "-m",
                    "qwenpaw",
                    "app",
                    "--port",
                    str(port),
                    "--log-level",
                    "warning",
                ],
                env=env,
                stdout=self.app_log,
                stderr=subprocess.STDOUT,
                creationflags=subprocess.CREATE_NO_WINDOW
                if os.name == "nt"
                else 0,
            )
            self.client.close()
            self.client = httpx.Client(
                base_url=f"http://127.0.0.1:{port}",
                timeout=180,
                trust_env=False,
            )
            for attempt in range(90):
                try:
                    self.api("GET", "/agents")
                    break
                except (httpx.HTTPError, RuntimeError) as exc:
                    if self.app_process.poll() is not None or attempt == 89:
                        raise RuntimeError(
                            "Isolated app startup failed, inspect isolated-app.log",
                        ) from exc
                    time.sleep(1)
        self.server = BenchServer(self.root, self.catalog, upstream)
        self.server.start()
        for mode in (
            ["controlled", "live"]
            if self.args.live_repeats
            else ["controlled"]
        ):
            provider_id = self.run_id + "-" + mode
            self.api(
                "POST",
                "/models/custom-providers",
                json={
                    "id": provider_id,
                    "name": "Activation benchmark " + mode,
                    "default_base_url": self.server.url + "/" + mode + "/v1",
                    "api_key": "test-key-benchmark",
                    "chat_model": "OpenAIChatModel",
                    "models": [
                        {
                            "id": slot["model"]
                            if mode == "live"
                            else "bench-model",
                            "name": "Benchmark",
                            "context_size": 1000000,
                        },
                    ],
                },
            )
            self.providers.append(provider_id)
            self.api(
                "PUT",
                f"/models/{provider_id}/config",
                json={"auto_discover": False},
            )
        for kind in ["native", "mcp"]:
            agent = self.run_id + "-" + kind
            self.api(
                "POST",
                "/agents",
                json={
                    "id": agent,
                    "name": "工具激活基准 " + kind,
                    "description": "Temporary isolated benchmark agent",
                    "workspace_dir": str(self.root / kind / "workspace"),
                    "language": "zh",
                    "skill_names": [],
                    "active_model": {
                        "provider_id": self.providers[0],
                        "model": "bench-model",
                    },
                },
            )
            self.agents.append(agent)
        deadline = time.perf_counter() + 180
        while time.perf_counter() < deadline:
            statuses = {
                a["id"]: a["startup_status"]
                for a in self.api("GET", "/agents")["agents"]
            }
            if all(statuses.get(agent) == "running" for agent in self.agents):
                break
            time.sleep(1)
        else:
            raise RuntimeError("Benchmark agents did not reach ready state")
        for agent in self.agents:
            self.api(
                "PUT",
                "/agents/" + agent,
                json={
                    "id": agent,
                    "name": "工具激活基准",
                    "tools": source_profile["tools"],
                    "running": source_profile["running"],
                },
            )
        time.sleep(5)
        readiness_started = time.perf_counter()
        for attempt in range(180):
            tools_now = self.api("GET", "/tools", self.agents[0])
            names_now = {item["name"] for item in tools_now}
            plugin_status = self.api("GET", "/plugins", self.agents[0])
            plugin_loaded = any(
                item["id"] == "ugsci"
                and item.get("loaded")
                and item.get("status") == "active"
                for item in plugin_status
            )
            if (
                plugin_loaded
                and {
                    "ugsci_convert_units",
                    "list_ui_components",
                    "ugsci_trace_calculation",
                }
                <= names_now
            ):
                break
            time.sleep(1)
        self.checks.append(
            {
                "check": "plugin_tool_registration_ready",
                "passed": plugin_loaded
                and {"ugsci_convert_units", "list_ui_components"} <= names_now,
                "tools": len(names_now),
                "wait_s": time.perf_counter() - readiness_started,
            },
        )
        dump(
            self.output / "isolated-plugin-status.json",
            self.api("GET", "/plugins", self.agents[0]),
        )
        self.enabled_tools = self.api("GET", "/tools", self.agents[0])
        if isinstance(self.enabled_tools, dict):
            self.enabled_tools = self.enabled_tools.get("tools", [])
        dump(self.output / "native-tool-inventory.json", self.enabled_tools)
        for agent in self.agents:
            self.api(
                "POST",
                "/skills",
                agent,
                json={
                    "name": "benchmark-fixture",
                    "enable": True,
                    "content": "---\nname: benchmark-fixture\ndescription: Dedicated benchmark instruction, read only when requested.\n---\n\nThe benchmark code word is BENCH_SKILL_42.\n",
                },
            )
        time.sleep(5)
        for attempt in range(90):
            statuses = {
                a["id"]: a["startup_status"]
                for a in self.api("GET", "/agents")["agents"]
            }
            if all(statuses.get(agent) == "running" for agent in self.agents):
                break
            time.sleep(1)
        for agent in self.agents:
            for item in self.api("GET", "/mcp", agent):
                self.api("DELETE", "/mcp/" + item["key"], agent)
        self.api(
            "POST",
            "/mcp",
            self.agents[1],
            json={
                "client_key": "benchdocs",
                "client": {
                    "name": "benchdocs",
                    "enabled": True,
                    "transport": "streamable_http",
                    "url": self.server.url + "/mcp/" + self.agents[1],
                    "http_timeout": 8,
                },
            },
        )
        started = time.perf_counter()
        for attempt in range(30):
            try:
                catalog = self.api(
                    "GET",
                    "/mcp/tools/benchdocs",
                    self.agents[1],
                )
                break
            except RuntimeError:
                if attempt == 29:
                    print(
                        self.api("GET", "/mcp/benchdocs", self.agents[1]),
                        flush=True,
                    )
                    raise
                time.sleep(1)
        self.checks.append(
            {
                "check": "mcp_initial_catalog",
                "passed": len(catalog) == len(self.catalog) + 3,
                "tool_count": len(catalog),
                "seconds": time.perf_counter() - started,
            },
        )
        print(
            json.dumps(
                {
                    "setup": "ready",
                    "run_id": self.run_id,
                    "catalog_count": len(catalog),
                    "output": str(self.output),
                },
            ),
            flush=True,
        )

    def chat(self, agent, project, session=None):
        if session:
            return session
        session = self.run_id + "-" + uuid.uuid4().hex[:12]
        chat = self.api(
            "POST",
            "/chats",
            agent,
            json={
                "name": "工具激活测试 " + session,
                "session_id": session,
                "user_id": self.run_id,
                "channel": "console",
            },
        )
        self.chats.append((agent, chat["id"]))
        self.api(
            "PUT",
            f"/chats/{chat['id']}/project-dirs",
            agent,
            json={
                "project_dirs": [{"path": str(project), "label": "benchmark"}],
            },
        )
        return session

    def trial(self, scenario, repeat, backend="controlled", session=None):
        # pylint: disable=too-many-branches,too-many-statements
        case_id = self.run_id + "-" + uuid.uuid4().hex[:12]
        project = self.root / "projects" / case_id
        project.mkdir(parents=True)
        (project / "sample.txt").write_text(
            "BENCH_LOCAL_READ_42\nalpha=7\nbeta=9\n",
            encoding="utf-8",
        )
        (project / "edit.txt").write_text("OLD_VALUE\n", encoding="utf-8")
        (project / "nested").mkdir()
        (project / "nested" / "data.json").write_text(
            '{"answer":42}',
            encoding="utf-8",
        )
        if scenario.get("size_fixture"):
            count, size = scenario["size_fixture"]
            bulk = project / "bulk"
            bulk.mkdir()
            for index in range(count):
                (bulk / f"file-{index:04d}.txt").write_bytes(b"x" * size)
        before = fingerprint(project)
        before_bytes = sum(
            path.stat().st_size
            for path in project.rglob("*")
            if path.is_file()
        )
        agent = self.agents[1 if scenario.get("mcp") else 0]
        if scenario.get("default_agent"):
            agent = "default"
        session = self.chat(agent, project, session)
        mcp_state = self.api("GET", "/mcp", agent)
        actions = scenario.get("actions", [])
        replacements = {
            "ROOT": str(project),
            "URL": self.server.url,
            "OUT": str(project / "out.txt"),
            "ID": case_id.replace("-", "_"),
        }

        def substitute(value):
            if isinstance(value, str):
                for key, replacement in replacements.items():
                    value = value.replace("{" + key + "}", replacement)
                return value
            if isinstance(value, list):
                return [substitute(item) for item in value]
            if isinstance(value, dict):
                return {key: substitute(item) for key, item in value.items()}
            return value

        case = {"backend": backend, "actions": substitute(actions)}
        case["discovery_only"] = scenario.get("discovery_only", False)
        prompt = substitute(scenario["prompt"])
        case["prompt"] = prompt
        self.server.cases[case_id] = case
        self.server.active_case_id = case_id
        if self.args.visible_marker:
            prompt += f"\nBENCH_CASE={case_id}"
        request = {
            "session_id": session,
            "user_id": self.run_id,
            "channel": "console",
            "input": [
                {
                    "role": "user",
                    "type": "message",
                    "content": [{"type": "text", "text": prompt}],
                    "metadata": {"qwenpaw_client_message_id": case_id},
                },
            ],
            "request_context": {
                "approval_level": "off",
                "session_project_dirs": [
                    {"path": str(project), "label": "benchmark"},
                ],
                "model_slot_override": {
                    "provider_id": self.run_id + "-" + backend,
                    "model": (
                        self.model_info["model"]
                        if backend == "live"
                        else "bench-model"
                    ),
                },
            },
        }
        request["request_context"].update(scenario.get("request_context", {}))
        started = time.perf_counter()
        first_event = first_response = first_text = first_thinking = None
        tool_calls = {}
        tool_results = {}
        errors = []
        final_text = []
        event_count = 0
        terminal = False
        terminal_status = None
        response_completed = None
        sample_events = []
        message_types = {}
        try:
            with self.client.stream(
                "POST",
                "/api/console/chat",
                json=request,
                headers={"X-Agent-Id": agent},
                timeout=180,
            ) as response:
                response.raise_for_status()
                for line in response.iter_lines():
                    if (
                        not line.startswith("data:")
                        or line[5:].strip() == "[DONE]"
                    ):
                        continue
                    now = time.perf_counter()
                    try:
                        event = json.loads(line[5:])
                    except ValueError:
                        continue
                    event_count += 1
                    first_event = first_event or now
                    if len(sample_events) < 20 and self.args.smoke:
                        sample_events.append(event)
                    if event.get("object") == "response":
                        first_response = first_response or now
                        if event.get("status") in {
                            "completed",
                            "failed",
                            "cancelled",
                        }:
                            terminal = True
                            terminal_status = event["status"]
                            response_completed = now
                        if event.get("error"):
                            errors.append(event["error"])
                    if event.get("object") == "message":
                        message_types[event.get("id")] = event.get("type")
                    if event.get("type") == "text" and event.get("text"):
                        if (
                            message_types.get(event.get("msg_id"))
                            == "reasoning"
                        ):
                            first_thinking = first_thinking or now
                        else:
                            first_text = first_text or now
                            final_text.append(event["text"])
                    data = event.get("data")
                    if isinstance(data, dict):
                        call_id = data.get("call_id")
                        if data.get("name") and "arguments" in data:
                            entry = tool_calls.setdefault(
                                call_id,
                                {"name": data["name"], "start": now},
                            )
                            if data.get("arguments"):
                                entry["arguments"] = data["arguments"]
                        elif call_id and ("output" in data or "state" in data):
                            tool_results[call_id] = data
                            if call_id in tool_calls:
                                tool_calls[call_id]["end"] = now
                    if (
                        event.get("error")
                        and event.get("object") != "response"
                    ):
                        errors.append(event["error"])
                    if time.perf_counter() - started > 150:
                        errors.append("benchmark_time_limit")
                        break
        except Exception as exc:
            errors.append(type(exc).__name__ + ": " + str(exc)[:200])
        ended = time.perf_counter()
        relay_client = self.server.relay_clients.pop(case_id, None)
        if relay_client:
            relay_client.close()
        after = fingerprint(project)
        changes = {
            "created": sorted(after.keys() - before.keys()),
            "deleted": sorted(before.keys() - after.keys()),
            "modified": sorted(
                k
                for k in before.keys() & after.keys()
                if before[k] != after[k]
            ),
        }
        models = [
            dict(item)
            for item in self.server.model_calls
            if item["case_id"] == case_id
        ]
        # Some SDK versions only emit completed messages instead of standalone data chunks.
        model_tool_names = [
            name for item in models for name in item["response_tools"]
        ]
        actual_names = [item["name"] for item in tool_calls.values()]
        text = "".join(final_text)
        failures = list(errors)
        if terminal_status != "completed":
            failures.append("terminal_status:" + str(terminal_status))
        if not models:
            failures.append("missing_model_request")
        result_text = "\n".join(
            str(value.get("output", "")) for value in tool_results.values()
        )
        if "BENCH_UNAVAILABLE" in text:
            failures.append("unavailable_tool")
        if any(m.get("error") for m in models):
            failures.extend(m["error"] for m in models if m.get("error"))
        expected = scenario.get(
            "expect_tools",
            [a["name"] for a in actions if a["name"] != "@skill"],
        )
        for expected_name in expected:
            if expected_name not in actual_names:
                failures.append("missing_tool:" + expected_name)
        for forbidden in scenario.get("forbidden_tools", []):
            if forbidden in actual_names:
                failures.append("unexpected_tool:" + forbidden)
        if scenario.get("no_tools") and actual_names:
            failures.append("unexpected_tools")
        for relative, content in scenario.get("expect_files", {}).items():
            path = project / relative
            if not path.exists() or content not in path.read_text(
                encoding="utf-8",
                errors="replace",
            ):
                failures.append("file_assertion:" + relative)
        if scenario.get("expect_office"):
            path = project / "result.docx"
            try:
                with zipfile.ZipFile(path) as archive:
                    if b"BENCH_OFFICE_42" not in archive.read(
                        "word/document.xml",
                    ):
                        failures.append("office_content_assertion")
            except (OSError, zipfile.BadZipFile, KeyError):
                failures.append("office_document_assertion")
        if scenario.get("expect_text") and scenario["expect_text"] not in text:
            failures.append("text_assertion")
        for call_id, result in tool_results.items():
            if str(result.get("state", "")).lower() in {
                "error",
                "failed",
                "denied",
            }:
                failures.append(
                    "tool_error:"
                    + tool_calls.get(call_id, {}).get("name", call_id),
                )
        if (
            scenario.get("expect_result")
            and scenario["expect_result"] not in result_text
        ):
            failures.append("tool_result_assertion")
        if scenario.get("expected_activation"):
            expected_activation = scenario["expected_activation"]
            activated = any(
                expected_activation in m["tool_names"] for m in models[1:]
            )
            if not activated:
                failures.append("activation_assertion:" + expected_activation)
        for unavailable in scenario.get("expected_absent", []):
            if any(unavailable in model["tool_names"] for model in models):
                failures.append("unexpected_available_tool:" + unavailable)
        if "expected_discovery" in scenario:
            discovered_names = []
            for call_id, result in tool_results.items():
                if "search_tools" not in tool_calls.get(call_id, {}).get(
                    "name",
                    "",
                ):
                    continue
                try:
                    payload = json.loads(result.get("output", ""))
                    discovered_names.extend(
                        item["name"] for item in payload["tools"]
                    )
                except (ValueError, TypeError, KeyError):
                    failures.append("invalid_discovery_result")
            if discovered_names != scenario["expected_discovery"]:
                failures.append("discovery_identity_assertion")
        if scenario.get("file_intent") == "mcp_write":
            cloud_file = self.root / "cloud" / (replacements["ID"] + ".txt")
            if (
                not cloud_file.exists()
                or cloud_file.read_text(encoding="utf-8")
                != "BENCH_CLOUD_WRITE_42"
            ):
                failures.append("mcp_file_assertion")
        if not terminal:
            failures.append("missing_terminal_event")
        record = {
            "case_id": case_id,
            "scenario": scenario["name"],
            "repeat": repeat,
            "backend": backend,
            "session_id": session,
            "visible_case_marker": self.args.visible_marker,
            "measurement_protocol_version": 2,
            "mcp_configured": bool(mcp_state),
            "mcp_enabled": any(item["enabled"] for item in mcp_state),
            "catalog_state": scenario.get(
                "catalog_state",
                "warm" if scenario.get("mcp") else "absent",
            ),
            "session_reused": bool(scenario.get("session_reused")),
            "file_intent": scenario.get("file_intent", "none"),
            "passed": not failures,
            "project_size_fixture": scenario.get("size_fixture"),
            "project_files": len(before),
            "project_bytes": before_bytes,
            "failures": failures,
            "total_s": ended - started,
            "response_completed_s": (
                response_completed - started if response_completed else None
            ),
            "terminal_status": terminal_status,
            "first_event_s": first_event - started if first_event else None,
            "response_created_s": first_response - started
            if first_response
            else None,
            "first_text_s": first_text - started if first_text else None,
            "first_thinking_s": first_thinking - started
            if first_thinking
            else None,
            "model_requests": len(models),
            "tool_calls": len(actual_names),
            "first_model_request_s": models[0]["start"] - started
            if models
            else None,
            "model_wall_s": sum(
                m.get("end", ended) - m["start"] for m in models
            ),
            "prompt_tokens": sum(
                m.get("usage", {}).get("prompt_tokens", 0) for m in models
            ),
            "completion_tokens": sum(
                m.get("usage", {}).get("completion_tokens", 0) for m in models
            ),
            "catalog_rpc_count": sum(
                m["method"] == "tools/list"
                and m["owner"] == agent
                and started <= m["start"] <= ended
                for m in self.server.mcp_calls
            ),
            "search_calls": sum(
                "search_tools" in name for name in actual_names
            ),
            "mcp_calls": sum(
                name.startswith(("benchdocs__", "kdocs__"))
                for name in actual_names
            ),
            "native_calls": sum(
                not name.startswith(("benchdocs__", "kdocs__"))
                and "search_tools" not in name
                for name in actual_names
            ),
            "tool_names": actual_names,
            "model_tool_names": model_tool_names,
            "initial_tools": models[0]["tools_count"] if models else None,
            "max_tools": max(
                (item["tools_count"] for item in models),
                default=None,
            ),
            "initial_schema_bytes": models[0]["schema_bytes"]
            if models
            else None,
            "max_schema_bytes": max(
                (item["schema_bytes"] for item in models),
                default=None,
            ),
            "mcp_initial_visible": len(models[0]["mcp_names"])
            if models
            else None,
            "mcp_max_visible": max(
                (len(item["mcp_names"]) for item in models),
                default=0,
            ),
            "file_read_calls": sum(
                name in {"read_file", "office_view_document"}
                for name in actual_names
            ),
            "file_mutation_calls": sum(
                name
                in {
                    "write_file",
                    "edit_file",
                    "office_create_document",
                    "office_add_element",
                }
                for name in actual_names
            ),
            "file_changes": changes,
            "event_count": event_count,
            "terminal": terminal,
            "tool_durations_s": [
                {
                    "name": item["name"],
                    "seconds": item.get("end", ended) - item["start"],
                }
                for item in tool_calls.values()
            ],
            "tool_results": [
                {
                    "name": tool_calls.get(key, {}).get("name", ""),
                    "state": value.get("state"),
                    "output_chars": len(str(value.get("output", ""))),
                    "discovered": (
                        self.discovered(value)
                        if "search_tools"
                        in tool_calls.get(key, {}).get("name", "")
                        else None
                    ),
                }
                for key, value in tool_results.items()
            ],
            "model_details": models,
        }
        self.records.append(record)
        with (self.output / "trials.jsonl").open(
            "a",
            encoding="utf-8",
        ) as handle:
            handle.write(json.dumps(record, ensure_ascii=False) + "\n")
        if self.args.smoke:
            dump(
                self.output / ("events-" + scenario["name"] + ".json"),
                sample_events,
            )
        print(
            json.dumps(
                {
                    key: record[key]
                    for key in [
                        "scenario",
                        "backend",
                        "repeat",
                        "passed",
                        "total_s",
                        "tool_names",
                        "failures",
                    ]
                },
                ensure_ascii=False,
            ),
            flush=True,
        )
        return session

    @staticmethod
    def discovered(result):
        try:
            value = json.loads(result.get("output", ""))
            return [
                {"name": item["name"], "activated": item["activated"]}
                for item in value.get("tools", [])
            ]
        except (ValueError, TypeError):
            return []

    def scenarios(self):
        # pylint: disable=line-too-long
        def action(name, **arguments):
            return {"name": name, "arguments": arguments}

        return [
            {
                "name": "greeting_native",
                "prompt": "你好，只回复你好，不需要调用工具。",
                "no_tools": True,
            },
            {
                "name": "reasoning_native",
                "prompt": "心算 17 乘以 23，只回复结果，不调用工具。",
                "no_tools": True,
            },
            {
                "name": "read_native",
                "prompt": "读取 {ROOT}/sample.txt 并报告内容。",
                "file_intent": "read",
                "actions": [
                    action("read_file", file_path="{ROOT}/sample.txt"),
                ],
                "expect_result": "BENCH_LOCAL_READ_42",
            },
            {
                "name": "write_native",
                "prompt": "创建 {OUT}，内容为 BENCH_WRITE_42。",
                "file_intent": "write",
                "actions": [
                    action(
                        "write_file",
                        file_path="{OUT}",
                        content="BENCH_WRITE_42",
                    ),
                ],
                "expect_files": {"out.txt": "BENCH_WRITE_42"},
            },
            {
                "name": "edit_native",
                "prompt": "将 {ROOT}/edit.txt 中 OLD_VALUE 替换为 NEW_VALUE。",
                "file_intent": "edit",
                "actions": [
                    action(
                        "edit_file",
                        file_path="{ROOT}/edit.txt",
                        old_text="OLD_VALUE",
                        new_text="NEW_VALUE",
                    ),
                ],
                "expect_files": {"edit.txt": "NEW_VALUE"},
            },
            {
                "name": "grep_native",
                "prompt": "在 {ROOT} 中搜索包含 alpha=7 的文件，报告位置。",
                "file_intent": "search",
                "actions": [
                    action("grep_search", pattern="alpha=7", path="{ROOT}"),
                ],
            },
            {
                "name": "glob_native",
                "prompt": "列出 {ROOT} 下所有 JSON 文件。",
                "file_intent": "search",
                "actions": [
                    action("glob_search", pattern="**/*.json", path="{ROOT}"),
                ],
            },
            {
                "name": "read_write_native",
                "prompt": "读取 {ROOT}/sample.txt，将其中 alpha 的数值写入 {OUT}。",
                "file_intent": "read_write",
                "actions": [
                    action("read_file", file_path="{ROOT}/sample.txt"),
                    action("write_file", file_path="{OUT}", content="7"),
                ],
                "expect_files": {"out.txt": "7"},
            },
            {
                "name": "shell_read",
                "prompt": "用终端显示 {ROOT}/sample.txt 的内容。",
                "file_intent": "shell_read",
                "actions": [
                    action(
                        "execute_shell_command",
                        command="Get-Content -LiteralPath '{ROOT}/sample.txt'",
                    ),
                ],
            },
            {
                "name": "units_domain",
                "prompt": "使用 UGSci 的单位换算工具，将 1 MPa 换算为 kPa。",
                "actions": [
                    action(
                        "ugsci_convert_units",
                        value=1,
                        from_unit="MPa",
                        to_unit="kPa",
                    ),
                ],
            },
            {
                "name": "oil_in_place",
                "prompt": "使用 UGSci 地质储量工具计算，面积 640 acre、净厚度 50 ft、孔隙度 0.2、含水饱和度 0.25、原油体积系数 1.2，输出 stb。",
                "actions": [
                    action(
                        "ugsci_volumetric_oil_in_place",
                        area=640,
                        net_pay=50,
                        porosity=0.2,
                        water_saturation=0.25,
                        oil_fvf=1.2,
                    ),
                ],
            },
            {
                "name": "genui_catalog",
                "prompt": "调用 GenUI 的组件目录工具，列出可用 UI 组件。",
                "actions": [action("list_ui_components")],
            },
            {
                "name": "genui_guide",
                "prompt": "调用 GenUI 的使用指南工具获取交互界面生成规范。",
                "actions": [action("get_genui_guide")],
            },
            {
                "name": "skill_loading",
                "prompt": "读取 benchmark-fixture 技能，并报告其中的 code word。",
                "actions": [action("Skill", skill="benchmark-fixture")],
                "expect_result": "BENCH_SKILL_42",
                "file_intent": "skill_read",
            },
            {
                "name": "office_document",
                "prompt": "使用 Office 工具创建 {ROOT}/result.docx，添加正文段落 BENCH_OFFICE_42，再读取文档大纲确认内容。",
                "actions": [
                    action(
                        "office_create_document",
                        file_path="{ROOT}/result.docx",
                    ),
                    action(
                        "office_add_element",
                        file_path="{ROOT}/result.docx",
                        parent_path="/body",
                        element_type="paragraph",
                        props={"text": "BENCH_OFFICE_42"},
                    ),
                    action(
                        "office_view_document",
                        file_path="{ROOT}/result.docx",
                    ),
                ],
                "file_intent": "office_read_write",
                "expect_office": True,
            },
            {
                "name": "batch_read_write",
                "prompt": "使用 run_tool_batch 顺序读取 {ROOT}/sample.txt，再把 BENCH_BATCH_42 写入 {OUT}。",
                "actions": [
                    action(
                        "run_tool_batch",
                        actions=[
                            {
                                "tool_name": "read_file",
                                "arguments": {
                                    "file_path": "{ROOT}/sample.txt",
                                },
                            },
                            {
                                "tool_name": "write_file",
                                "arguments": {
                                    "file_path": "{OUT}",
                                    "content": "BENCH_BATCH_42",
                                },
                            },
                        ],
                    ),
                ],
                "file_intent": "batch_read_write",
                "expect_files": {"out.txt": "BENCH_BATCH_42"},
            },
            {
                "name": "agent_listing",
                "prompt": "使用工具列出当前可用专家。",
                "actions": [action("list_agents")],
            },
            {
                "name": "time_lookup",
                "prompt": "使用时间工具查询当前时间。",
                "actions": [action("get_current_time")],
            },
            {
                "name": "web_fetch",
                "prompt": "读取这个网页并报告页面标记 {URL}/fixture/page",
                "file_intent": "network_read",
                "actions": [action("web_fetch", url="{URL}/fixture/page")],
            },
            {
                "name": "mcp_greeting",
                "mcp": True,
                "prompt": "你好，只回复你好，不调用工具。",
                "no_tools": True,
            },
            {
                "name": "mcp_local_read",
                "mcp": True,
                "prompt": "读取本地文件 {ROOT}/sample.txt。",
                "file_intent": "read",
                "actions": [
                    action("read_file", file_path="{ROOT}/sample.txt"),
                ],
            },
            {
                "name": "mcp_cloud_read",
                "mcp": True,
                "prompt": "从 benchdocs 的专用基准测试文档服务读取 doc_id 为 sample 的文档正文。",
                "file_intent": "mcp_read",
                "actions": [
                    action("benchdocs__bench_read_document", doc_id="sample"),
                ],
                "expect_result": "BENCH_CLOUD_READ_20261110",
            },
            {
                "name": "mcp_cloud_write",
                "mcp": True,
                "prompt": "在 benchdocs 的专用基准测试文档服务创建文档，doc_id 为 {ID}，内容为 BENCH_CLOUD_WRITE_42。",
                "file_intent": "mcp_write",
                "actions": [
                    action(
                        "benchdocs__bench_write_document",
                        doc_id="{ID}",
                        content="BENCH_CLOUD_WRITE_42",
                    ),
                ],
            },
            {
                "name": "mcp_mixed",
                "mcp": True,
                "prompt": "读取 benchdocs 的基准测试文档 sample，并把正文保存到本地文件 {OUT}。",
                "file_intent": "mcp_read_local_write",
                "actions": [
                    action("benchdocs__bench_read_document", doc_id="sample"),
                    action(
                        "write_file",
                        file_path="{OUT}",
                        content="BENCH_CLOUD_READ_20261110",
                    ),
                ],
                "expect_files": {"out.txt": "BENCH_CLOUD_READ_20261110"},
            },
        ]

    def run(self):
        self.setup()
        scenarios = self.scenarios()
        if self.args.scenarios:
            selected = set(self.args.scenarios.split(","))
            unknown = selected - {scenario["name"] for scenario in scenarios}
            if unknown:
                raise ValueError(
                    "Unknown benchmark scenarios: "
                    + ", ".join(sorted(unknown)),
                )
            scenarios = [s for s in scenarios if s["name"] in selected]
        if self.args.smoke:
            scenarios = [scenarios[0], scenarios[2], scenarios[-3]]
        for repeat in range(self.args.repeats):
            for scenario in scenarios:
                self.trial(scenario, repeat)
        for repeat in range(self.args.live_repeats):
            for scenario in scenarios:
                self.trial(scenario, repeat, "live")
        if not self.args.smoke and not self.args.skip_extended:
            self.session_matrix()
            self.native_activation_audit()
            self.lifecycle_checks()

    def session_matrix(self):
        scenarios = self.scenarios()
        read = next(s for s in scenarios if s["name"] == "mcp_cloud_read")
        greeting = next(s for s in scenarios if s["name"] == "mcp_greeting")
        for repeat in range(self.args.repeats):
            session = self.trial(
                {**read, "name": "mcp_session_activate"},
                repeat,
            )
            self.trial(
                {**read, "name": "mcp_session_reuse", "session_reused": True},
                repeat,
                session=session,
            )
            self.trial(
                {
                    **greeting,
                    "name": "mcp_session_unrelated",
                    "session_reused": True,
                },
                repeat,
                session=session,
            )
            self.trial(
                {**greeting, "name": "mcp_other_session_isolation"},
                repeat,
            )
        self.api("PATCH", "/mcp/toggle/benchdocs", self.agents[1])
        time.sleep(1)
        for repeat in range(self.args.repeats):
            self.trial(
                {
                    **greeting,
                    "name": "mcp_configured_disabled",
                    "disabled": True,
                    "catalog_state": "disabled",
                },
                repeat,
            )
        self.api("PATCH", "/mcp/toggle/benchdocs", self.agents[1])
        for _attempt in range(30):
            try:
                if self.api("GET", "/mcp/tools/benchdocs", self.agents[1]):
                    break
            except RuntimeError:
                pass
            time.sleep(1)
        for repeat in range(self.args.repeats):
            for mcp in [False, True]:
                self.trial(
                    {
                        "name": "large_project_mcp"
                        if mcp
                        else "large_project_native",
                        "mcp": mcp,
                        "prompt": "你好，只回复你好，不调用工具。",
                        "no_tools": True,
                        "size_fixture": [640, 209715],
                        "file_intent": "none",
                    },
                    repeat,
                )

    def native_activation_audit(self):
        for item in self.enabled_tools:
            if not item.get("enabled"):
                continue
            target = item["name"]
            self.trial(
                {
                    "name": "activate_native_" + target,
                    "prompt": "发现并激活工具 " + target + "，无需执行该工具。",
                    "actions": [
                        {
                            "name": "search_tools",
                            "arguments": {"query": target, "limit": 1},
                        },
                    ],
                    "discovery_only": True,
                    "expected_activation": target,
                },
                0,
            )

    def lifecycle_checks(self):
        owner = self.agents[1]
        durations = []
        before = len(self.server.mcp_calls)
        for _ in range(10):
            started = time.perf_counter()
            tools = self.api("GET", "/mcp/tools/benchdocs", owner)
            durations.append(time.perf_counter() - started)
        rpc = self.server.mcp_calls[before:]
        self.checks.append(
            {
                "check": "warm_catalog_10_requests",
                "passed": all(len(tools) >= 633 for _ in [0]),
                "seconds": durations,
                "list_rpc": sum(r["method"] == "tools/list" for r in rpc),
            },
        )
        self.server.catalog_version = 2
        self.server.list_delay = 2
        before = len(self.server.mcp_calls)
        listeners = self.server.notify(owner)
        started = time.perf_counter()
        time.sleep(0.1)
        with ThreadPoolExecutor(max_workers=8) as pool:

            def fetch(_index):
                call_started = time.perf_counter()
                result = self.api("GET", "/mcp/tools/benchdocs", owner)
                return {
                    "seconds": time.perf_counter() - call_started,
                    "count": len(result),
                }

            concurrent = list(pool.map(fetch, range(16)))
        changed_at = None
        for _attempt in range(60):
            tools = self.api("GET", "/mcp/tools/benchdocs", owner)
            if any(t["name"] == "bench_new_capability" for t in tools):
                changed_at = time.perf_counter() - started
                break
            time.sleep(0.1)
        rpc = self.server.mcp_calls[before:]
        self.checks.append(
            {
                "check": "notification_slow_refresh_concurrent_read",
                "passed": changed_at is not None
                and max(r["seconds"] for r in concurrent) < 2,
                "listeners": listeners,
                "change_visible_s": changed_at,
                "concurrent_reads": concurrent,
                "list_rpc_pages": sum(
                    r["method"] == "tools/list" for r in rpc
                ),
            },
        )
        self.server.list_delay = 0
        self.server.offline = True
        self.server.notify(owner)
        time.sleep(0.3)
        started = time.perf_counter()
        try:
            tools = self.api("GET", "/mcp/tools/benchdocs", owner)
            retained = any(t["name"] == "bench_new_capability" for t in tools)
        except RuntimeError:
            retained = False
        self.checks.append(
            {
                "check": "failed_refresh_preserves_catalog",
                "passed": retained,
                "seconds": time.perf_counter() - started,
            },
        )
        self.server.offline = False
        self.server.notify(owner)
        time.sleep(1)
        before = len(self.server.mcp_calls)
        started = time.perf_counter()
        while time.perf_counter() - started < 35:
            if any(
                r["method"] == "tools/list"
                for r in self.server.mcp_calls[before:]
            ):
                break
            time.sleep(0.5)
        refreshed = [
            r
            for r in self.server.mcp_calls[before:]
            if r["method"] == "tools/list"
        ]
        self.checks.append(
            {
                "check": "periodic_catalog_refresh",
                "passed": bool(refreshed),
                "wait_s": time.perf_counter() - started,
                "rpc_pages": len(refreshed),
            },
        )
        dump(self.output / "lifecycle-checks.json", self.checks)

    def finish(self):
        for agent, chat_id in reversed(self.chats):
            try:
                self.api("DELETE", "/chats/" + chat_id, agent)
            except Exception as exc:
                self.cleanup.append(
                    {
                        "resource": "chat",
                        "id": chat_id,
                        "error": type(exc).__name__,
                    },
                )
        for agent in reversed(self.agents):
            try:
                self.api("DELETE", "/agents/" + agent)
            except Exception as exc:
                self.cleanup.append(
                    {
                        "resource": "agent",
                        "id": agent,
                        "error": type(exc).__name__,
                    },
                )
        for provider in reversed(self.providers):
            try:
                self.api("DELETE", "/models/custom-providers/" + provider)
            except Exception as exc:
                self.cleanup.append(
                    {
                        "resource": "provider",
                        "id": provider,
                        "error": type(exc).__name__,
                    },
                )
        if self.server:
            dump(self.output / "mcp-rpc.json", self.server.mcp_calls)
            dump(self.output / "mcp-events.json", self.server.events)
            self.server.close()
        if self.app_process:
            import psutil

            process = psutil.Process(self.app_process.pid)
            children = process.children(recursive=True)
            self.app_process.terminate()
            try:
                self.app_process.wait(timeout=20)
            except subprocess.TimeoutExpired:
                self.app_process.kill()
                self.app_process.wait(timeout=10)
            for child in children:
                try:
                    child.terminate()
                except psutil.NoSuchProcess:
                    pass
            psutil.wait_procs(children, timeout=10)
            self.app_log.close()
        self.client.close()
        self.report()

    def report(self):
        # pylint: disable=line-too-long
        groups = defaultdict(list)
        for record in self.records:
            groups[(record["backend"], record["scenario"])].append(record)
        summary = []
        for (backend, scenario), records in groups.items():
            row = {
                "backend": backend,
                "scenario": scenario,
                "n": len(records),
                "passed": sum(r["passed"] for r in records),
            }
            for metric in [
                "total_s",
                "response_created_s",
                "first_text_s",
                "tool_calls",
                "search_calls",
                "mcp_calls",
                "initial_schema_bytes",
                "max_schema_bytes",
            ]:
                values = [r[metric] for r in records if r[metric] is not None]
                if values:
                    row.update(
                        {
                            metric + "_p50": statistics.median(values),
                            metric + "_p95": percentile(values, 95),
                            metric + "_max": max(values),
                        },
                    )
            summary.append(row)
        dump(
            self.output / "summary.json",
            {
                "run_id": self.run_id,
                "model": self.model_info,
                "fixture_root": str(self.root),
                "checks": self.checks,
                "cleanup_failures": self.cleanup,
                "summary": summary,
            },
        )
        for name, rows in [
            ("summary.csv", summary),
            ("trials.csv", self.records),
        ]:
            if rows:
                keys = list(dict.fromkeys(key for row in rows for key in row))
                with (self.output / name).open(
                    "w",
                    newline="",
                    encoding="utf-8-sig",
                ) as handle:
                    writer = csv.DictWriter(handle, fieldnames=keys)
                    writer.writeheader()
                    for row in rows:
                        writer.writerow(
                            {
                                key: (
                                    json.dumps(value, ensure_ascii=False)
                                    if isinstance(value, (dict, list))
                                    else value
                                )
                                for key, value in row.items()
                            },
                        )
        columns = [
            "backend",
            "scenario",
            "n",
            "passed",
            "total_s_p50",
            "total_s_p95",
            "response_created_s_p50",
            "first_text_s_p50",
            "tool_calls_p50",
            "search_calls_p50",
            "mcp_calls_p50",
            "initial_schema_bytes_p50",
            "max_schema_bytes_p50",
        ]
        table = (
            "<tr>"
            + "".join("<th>" + html.escape(key) + "</th>" for key in columns)
            + "</tr>"
        )
        for row in summary:
            table += (
                "<tr>"
                + "".join(
                    "<td>"
                    + html.escape(
                        str(
                            round(row[key], 3)
                            if isinstance(row.get(key), float)
                            else row.get(key, ""),
                        ),
                    )
                    + "</td>"
                    for key in columns
                )
                + "</tr>"
            )
        failures = [r for r in self.records if not r["passed"]]
        content = """<!doctype html><html lang="zh"><meta charset="utf-8"><title>工具激活与耗时测试</title>
<style>body{font:14px system-ui;margin:32px;color:#222}table{border-collapse:collapse}td,th{border:1px solid #ddd;padding:7px}th{position:sticky;top:0;background:#eee}pre{white-space:pre-wrap}h1{font-size:26px}</style>
<h1>工具激活与耗时测试</h1><p>受控模型与真实模型分别统计。单位为秒。p95 使用线性插值，小样本只描述本次观测。首事件、response.created、首正文与总耗时分别计量。630 项真实 MCP 定义只用于目录和发现，基准服务的读写工具只操作测试数据。</p>"""
        content += (
            "<p>"
            + html.escape(json.dumps(self.model_info, ensure_ascii=False))
            + "</p><table>"
            + table
            + "</table>"
        )
        content += (
            "<h2>检查与失败明细</h2><pre>"
            + html.escape(
                json.dumps(
                    {
                        "checks": self.checks,
                        "failures": [
                            {
                                "scenario": r["scenario"],
                                "backend": r["backend"],
                                "repeat": r["repeat"],
                                "failures": r["failures"],
                            }
                            for r in failures
                        ],
                        "cleanup": self.cleanup,
                    },
                    ensure_ascii=False,
                    indent=2,
                ),
            )
            + "</pre>"
        )
        content += "<p>原始数据见 trials.jsonl、trials.csv、summary.json、mcp-rpc.json。文件读取统计按工具调用计数，未将目录扫描等同为内容读取。服务端日志与浏览器渲染耗时未纳入。</p></html>"
        (self.output / "report.html").write_text(content, encoding="utf-8")


def network_probe(args):
    from urllib.parse import urlsplit
    from qwenpaw.providers import ProviderManager

    with httpx.Client(base_url=args.base_url, trust_env=False) as client:
        slot = client.get("/api/models/active").json()["active_llm"]
    provider = ProviderManager.get_instance().get_provider(slot["provider_id"])
    url = (provider.base_url or provider.default_base_url).rstrip(
        "/",
    ) + "/models"
    host = urlsplit(url).hostname

    def probe(trust):
        started = time.perf_counter()
        row = {"trust_env": trust, "host": host}
        try:
            with httpx.Client(timeout=15, trust_env=trust) as client:
                row["status"] = client.get(
                    url,
                    headers={"Authorization": "Bearer " + provider.api_key},
                ).status_code
        except Exception as exc:
            row["error"] = type(exc).__name__
            row["detail"] = str(exc).replace(provider.api_key, "[REDACTED]")[
                :500
            ]
        row["seconds"] = time.perf_counter() - started
        return row

    with ThreadPoolExecutor(2) as pool:
        rows = list(pool.map(probe, [True, False]))
    output = Path(args.output).resolve()
    output.mkdir(parents=True, exist_ok=True)
    dump(output / "network-diagnostics.json", rows)
    print(json.dumps(rows, ensure_ascii=False))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="http://127.0.0.1:8088")
    parser.add_argument("--output", required=True)
    parser.add_argument("--repeats", type=int, default=3)
    parser.add_argument("--live-repeats", type=int, default=0)
    parser.add_argument("--smoke", action="store_true")
    parser.add_argument(
        "--isolated-app",
        action=argparse.BooleanOptionalAction,
        default=True,
    )
    parser.add_argument("--scenarios", help="Comma-separated scenario names")
    parser.add_argument("--skip-extended", action="store_true")
    parser.add_argument(
        "--visible-marker",
        action="store_true",
        help="Include the case marker in model-visible input, for comparison",
    )
    parser.add_argument("--network-probe", action="store_true")
    args = parser.parse_args()
    if args.network_probe:
        network_probe(args)
        return
    benchmark = Benchmark(args)
    try:
        benchmark.run()
    finally:
        benchmark.finish()


if __name__ == "__main__":
    main()
