# -*- coding: utf-8 -*-
"""Loopback model/MCP endpoints used by the activation benchmark.

Only the external model is scripted in controlled mode. QwenPaw's HTTP
entrypoint, discovery, permissions, tools and file tracking execute normally.
The optional live relay keeps the existing provider credential in memory.
"""

from __future__ import annotations

import json
import queue
import re
import threading
import time
import uuid
from dataclasses import dataclass, field
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

import httpx

CASE_PATTERN = re.compile(r"BENCH_CASE=([A-Za-z0-9_-]+)")


def message_text(message):
    content = message.get("content", "")
    if isinstance(content, str):
        return content
    return "\n".join(
        part.get("text", "")
        for part in content or []
        if isinstance(part, dict)
    )


@dataclass
class Upstream:
    url: str
    key: str
    model: str
    adapter: str
    parameters: dict
    httpx_options: dict = field(default_factory=dict)


class BenchServer(ThreadingHTTPServer):
    daemon_threads = True
    request_queue_size = 128

    def __init__(self, root: Path, catalog: list, upstream=None):
        super().__init__(("127.0.0.1", 0), BenchHandler)
        self.root = root
        self.catalog = catalog
        self.upstream = upstream
        self.cases: dict[str, dict] = {}
        self.model_calls: list[dict] = []
        self.active_case_id = None
        self.relay_clients = {}
        self.mcp_calls: list[dict] = []
        self.events: list[dict] = []
        self.listeners: dict[str, list[queue.Queue]] = {}
        self.list_delay = 0.0
        self.offline = False
        self.offline_owners = set()
        self.catalog_version = 1
        self.lock = threading.RLock()
        self.stopping = threading.Event()
        self.thread = threading.Thread(target=self.serve_forever, daemon=True)
        (root / "cloud").mkdir(parents=True, exist_ok=True)
        (root / "cloud" / "sample.txt").write_text(
            "BENCH_CLOUD_READ_20261110",
            encoding="utf-8",
        )

    @property
    def url(self):
        return f"http://127.0.0.1:{self.server_address[1]}"

    def start(self):
        self.thread.start()

    def close(self):
        self.stopping.set()
        for client in self.relay_clients.values():
            client.close()
        self.shutdown()
        self.server_close()
        self.thread.join(timeout=3)

    def handle_error(self, request, client_address):
        # A client closing a keepalive socket during teardown is expected.
        self.events.append(
            {"event": "client_connection_closed", "at": time.perf_counter()},
        )

    def notify(self, owner):
        with self.lock:
            listeners = list(self.listeners.get(owner, []))
        for listener in listeners:
            listener.put(
                {
                    "jsonrpc": "2.0",
                    "method": "notifications/tools/list_changed",
                },
            )
        return len(listeners)

    def definitions(self):
        # pylint: disable=line-too-long
        tools = [
            {
                "name": item["name"],
                "description": item["description"],
                "inputSchema": item["input_schema"],
            }
            for item in self.catalog
            if item.get("enabled", True)
        ]
        tools.extend(
            [
                {
                    "name": "bench_read_document",
                    "description": "读取专用基准测试文档服务中的文档正文。Use doc_id=sample for the seeded test document.",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "doc_id": {
                                "type": "string",
                                "pattern": "^[a-zA-Z0-9_-]+$",
                            },
                        },
                        "required": ["doc_id"],
                    },
                },
                {
                    "name": "bench_write_document",
                    "description": "在专用基准测试文档服务中创建或更新测试文档。Writes only benchmark-owned documents.",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "doc_id": {
                                "type": "string",
                                "pattern": "^[a-zA-Z0-9_-]+$",
                            },
                            "content": {"type": "string"},
                        },
                        "required": ["doc_id", "content"],
                    },
                },
                {
                    "name": "bench_probe",
                    "description": "查询基准测试 MCP 服务状态，不读取文档。",
                    "inputSchema": {"type": "object", "properties": {}},
                },
            ],
        )
        if self.catalog_version > 1:
            tools.append(
                {
                    "name": "bench_new_capability",
                    "description": "新增的基准测试目录变更探针。",
                    "inputSchema": {"type": "object", "properties": {}},
                },
            )
        return tools


class BenchHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, *_args):
        return None

    def _json(self, payload, status=200, headers=None):
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        for key, value in (headers or {}).items():
            self.send_header(key, value)
        self.end_headers()
        self.wfile.write(data)

    def do_DELETE(self):
        self._json({})

    def do_GET(self):
        if self.path.startswith("/mcp/"):
            self._events()
        elif self.path.endswith("/models"):
            self._json({"object": "list", "data": []})
        elif self.path == "/fixture/page":
            data = b"<html><title>Benchmark</title><p>BENCH_WEB_42</p></html>"
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        else:
            self._json({"error": "not_found"}, 404)

    def _events(self):
        owner = urlparse(self.path).path.rsplit("/", 1)[-1]
        listener = queue.Queue()
        with self.server.lock:
            self.server.listeners.setdefault(owner, []).append(listener)
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        try:
            while not self.server.stopping.is_set():
                try:
                    event = listener.get(timeout=0.5)
                    text = "data: " + json.dumps(event) + "\n\n"
                except queue.Empty:
                    text = ": benchmark heartbeat\n\n"
                self.wfile.write(text.encode())
                self.wfile.flush()
        except (ConnectionError, OSError):
            pass
        finally:
            with self.server.lock:
                self.server.listeners[owner].remove(listener)

    def do_POST(self):
        try:
            body = json.loads(
                self.rfile.read(int(self.headers["Content-Length"])),
            )
            if self.path.startswith("/mcp/"):
                self._mcp(body)
            elif self.path.endswith("/chat/completions"):
                self._model(body)
            else:
                self._json({"error": "not_found"}, 404)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def _mcp(self, body):
        method = body.get("method", "")
        request_id = body.get("id")
        owner = urlparse(self.path).path.rsplit("/", 1)[-1]
        self.server.events.append(
            {"method": method, "owner": owner, "at": time.perf_counter()},
        )
        if request_id is None:
            self.send_response(202)
            self.send_header("Content-Length", "0")
            self.end_headers()
            return
        if method == "server/discover":
            self._json(
                {
                    "jsonrpc": "2.0",
                    "id": request_id,
                    "error": {
                        "code": -32601,
                        "message": "Use handshake protocol",
                    },
                },
            )
            return
        if method == "initialize":
            self._json(
                {
                    "jsonrpc": "2.0",
                    "id": request_id,
                    "result": {
                        "protocolVersion": "2025-11-25",
                        "capabilities": {"tools": {"listChanged": True}},
                        "serverInfo": {
                            "name": "benchmark-owned-mcp",
                            "version": "1",
                        },
                    },
                },
                headers={"Mcp-Session-Id": "bench-" + owner},
            )
            return
        if method == "ping":
            self._json({"jsonrpc": "2.0", "id": request_id, "result": {}})
            return
        record = {
            "method": method,
            "owner": owner,
            "start": time.perf_counter(),
        }
        with self.server.lock:
            self.server.mcp_calls.append(record)
        try:
            if self.server.offline or owner in self.server.offline_owners:
                self._json({"error": "benchmark_offline"}, 503)
                record["error"] = "offline"
                return
            params = body.get("params", {})
            if method == "tools/list":
                offset = int(params.get("cursor") or 0)
                if offset == 0:
                    time.sleep(self.server.list_delay)
                tools = self.server.definitions()
                result = {"tools": tools[offset : offset + 250]}
                if offset + 250 < len(tools):
                    result["nextCursor"] = str(offset + 250)
                record["tool_count"] = len(result["tools"])
            elif method == "tools/call":
                name = params["name"]
                arguments = params.get("arguments", {})
                record["tool"] = name
                result = self._execute_fixture(name, arguments, record)
            else:
                self._json(
                    {
                        "jsonrpc": "2.0",
                        "id": request_id,
                        "error": {"code": -32601, "message": "unknown method"},
                    },
                )
                return
            self._json({"jsonrpc": "2.0", "id": request_id, "result": result})
        finally:
            record["end"] = time.perf_counter()

    def _execute_fixture(self, name, arguments, record):
        # pylint: disable=line-too-long
        if name in {"bench_probe", "bench_new_capability"}:
            value = {
                "ok": True,
                "catalog_version": self.server.catalog_version,
            }
        elif name in {"bench_read_document", "bench_write_document"}:
            doc_id = arguments.get("doc_id", "")
            if not re.fullmatch(r"[a-zA-Z0-9_-]{1,80}", doc_id):
                return {
                    "isError": True,
                    "content": [{"type": "text", "text": "invalid doc_id"}],
                }
            path = self.server.root / "cloud" / (doc_id + ".txt")
            if name == "bench_write_document":
                path.write_text(arguments["content"], encoding="utf-8")
                record["file_write_bytes"] = path.stat().st_size
                value = {"ok": True, "doc_id": doc_id}
            else:
                value = {
                    "doc_id": doc_id,
                    "content": path.read_text(encoding="utf-8"),
                }
                record["file_read_bytes"] = path.stat().st_size
        else:
            return {
                "isError": True,
                "content": [
                    {
                        "type": "text",
                        "text": "catalog_only_fixture: this definition is tested for discovery, not business execution",
                    },
                ],
            }
        return {
            "content": [
                {
                    "type": "text",
                    "text": json.dumps(value, ensure_ascii=False),
                },
            ],
        }

    def _model(self, body):
        # pylint: disable=too-many-branches
        messages = body.get("messages", [])
        case_id = None
        last_user = 0
        for index, message in enumerate(messages):
            if message.get("role") == "user":
                last_user = index
        current = self.server.cases.get(self.server.active_case_id)
        if current and current.get("prompt"):
            for index, message in enumerate(messages):
                if message.get("role") == "user" and current[
                    "prompt"
                ] in message_text(
                    message,
                ):
                    case_id = self.server.active_case_id
                    last_user = index
        for index, message in enumerate(messages):
            if message.get("role") == "user":
                match = CASE_PATTERN.search(message_text(message))
                if match:
                    case_id, last_user = match.group(1), index
        case = self.server.cases.get(case_id)
        if case is None:
            self._stream([{"content": "Benchmark helper response"}])
            return
        tools = body.get("tools", [])
        names = [tool["function"]["name"] for tool in tools]
        record = {
            "case_id": case_id,
            "start": time.perf_counter(),
            "tools_count": len(tools),
            "tool_names": names,
            "schema_bytes": len(
                json.dumps(tools, ensure_ascii=False).encode(),
            ),
            "mcp_names": [
                name
                for name in names
                if name.startswith(("benchdocs__", "kdocs__"))
            ],
            "backend": case.get("backend", "controlled"),
            "response_tools": [],
        }
        record["input_message_bytes"] = len(
            json.dumps(messages, ensure_ascii=False).encode(),
        )
        with self.server.lock:
            self.server.model_calls.append(record)
        try:
            if case.get("backend") == "live":
                calls = sum(
                    item["case_id"] == case_id
                    for item in self.server.model_calls
                )
                if calls > 8:
                    record["error"] = "benchmark_model_request_limit"
                    self._stream([{"content": "BENCH_REQUEST_LIMIT"}])
                else:
                    self._relay(body, record)
            else:
                self._controlled(messages[last_user:], tools, case, record)
        except Exception as exc:
            record["error"] = "relay_" + type(exc).__name__
            record["exception_chain"] = []
            current = exc
            while current is not None:
                record["exception_chain"].append(
                    {
                        "type": type(current).__name__,
                        "errno": getattr(current, "errno", None),
                        "winerror": getattr(current, "winerror", None),
                    },
                )
                current = current.__cause__ or current.__context__
            if not record.get("downstream_headers_sent"):
                self._json({"error": {"message": record["error"]}}, 502)
            else:
                raise
        finally:
            record["end"] = time.perf_counter()

    def _controlled(self, messages, tools, case, record):
        # pylint: disable=too-many-branches
        calls = {}
        results = []
        for message in messages:
            for call in message.get("tool_calls", []):
                calls[call["id"]] = call["function"]["name"]
            if message.get("role") == "tool":
                results.append(calls.get(message.get("tool_call_id"), ""))
        actions = case.get("actions", [])
        completed = [name for name in results if "search_tools" not in name]
        if case.get("discovery_only"):
            completed = results
        if len(completed) >= len(actions):
            self._stream([{"content": case.get("reply", "BENCH_DONE")}])
            return
        action = actions[len(completed)]
        name = action["name"]
        if name == "@skill":
            name = next(
                (
                    t["function"]["name"]
                    for t in tools
                    if "skill"
                    in t["function"]["parameters"].get("properties", {})
                    and "search_tools" not in t["function"]["name"]
                ),
                "view_skill",
            )
        if name == "@schema":
            target = action["target"]
            schema = next(
                (
                    t["function"]
                    for t in tools
                    if t["function"]["name"] == target
                ),
                None,
            )
            if schema is not None:
                self._stream(
                    [{"content": json.dumps(schema, ensure_ascii=False)}],
                )
                return
            name = target
        names = {tool["function"]["name"] for tool in tools}
        if name not in names:
            trailing_searches = 0
            for previous in reversed(results):
                if "search_tools" not in previous:
                    break
                trailing_searches += 1
            if trailing_searches >= 2:
                self._stream([{"content": "BENCH_UNAVAILABLE"}])
                return
            name = next(
                (item for item in names if item.endswith("search_tools")),
                "search_tools",
            )
            arguments = {
                "query": action.get("query", action["name"]),
                "limit": 1,
            }
        else:
            arguments = action.get("arguments", {})
        record["response_tools"].append(name)
        call = {
            "index": 0,
            "id": "call_" + uuid.uuid4().hex[:12],
            "type": "function",
            "function": {
                "name": name,
                "arguments": json.dumps(arguments, ensure_ascii=False),
            },
        }
        self._stream([{"tool_calls": [call]}], finish="tool_calls")

    def _stream(self, deltas, finish="stop"):
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Connection", "close")
        self.end_headers()
        for delta in [{"role": "assistant"}, *deltas]:
            packet = {
                "id": "chatcmpl-bench",
                "object": "chat.completion.chunk",
                "created": int(time.time()),
                "model": "bench-controlled",
                "choices": [
                    {"index": 0, "delta": delta, "finish_reason": None},
                ],
            }
            self.wfile.write(
                (
                    "data: " + json.dumps(packet, ensure_ascii=False) + "\n\n"
                ).encode(),
            )
            self.wfile.flush()
        packet["choices"] = [
            {"index": 0, "delta": {}, "finish_reason": finish},
        ]
        self.wfile.write(
            ("data: " + json.dumps(packet) + "\n\ndata: [DONE]\n\n").encode(),
        )
        self.wfile.flush()
        self.close_connection = True

    def _relay(self, body, record):
        # pylint: disable=too-many-branches,too-many-nested-blocks
        upstream = self.server.upstream
        if upstream is None:
            self._json({"error": "live relay is not configured"}, 503)
            return
        payload = dict(body)
        for name, value in upstream.parameters.items():
            payload.setdefault(name, value)
        payload["model"] = upstream.model
        payload["max_tokens"] = 2048
        client = self.server.relay_clients.get(record["case_id"])
        if client is None:
            client = httpx.Client(timeout=120, **upstream.httpx_options)
            self.server.relay_clients[record["case_id"]] = client
        with client.stream(
            "POST",
            upstream.url.rstrip("/") + "/chat/completions",
            headers={"Authorization": "Bearer " + upstream.key},
            json=payload,
        ) as response:
            record["upstream_status"] = response.status_code
            if response.status_code != 200:
                record["error"] = "upstream_http_" + str(response.status_code)
                self._json(
                    {"error": {"message": record["error"]}},
                    response.status_code,
                )
                return
            else:
                self.send_response(200)
                self.send_header("Content-Type", "text/event-stream")
                self.send_header("Connection", "close")
                self.end_headers()
                record["downstream_headers_sent"] = True
                for line in response.iter_lines():
                    if (
                        line.startswith("data:")
                        and line[5:].strip() != "[DONE]"
                    ):
                        try:
                            packet = json.loads(line[5:])
                            if packet.get("usage"):
                                record["usage"] = packet["usage"]
                            for choice in packet.get("choices", []):
                                delta = choice.get("delta", {})
                                if delta.get("reasoning_content"):
                                    record.setdefault(
                                        "first_thinking",
                                        time.perf_counter(),
                                    )
                                if delta.get("content"):
                                    record.setdefault(
                                        "first_text",
                                        time.perf_counter(),
                                    )
                                for call in delta.get("tool_calls", []):
                                    name = call.get("function", {}).get("name")
                                    if name:
                                        record["response_tools"].append(name)
                                if choice.get("finish_reason"):
                                    record["finish_reason"] = choice[
                                        "finish_reason"
                                    ]
                        except (ValueError, TypeError):
                            pass
                    self.wfile.write((line + "\n").encode())
                    self.wfile.flush()
        if not record.get("finish_reason") and not record.get("error"):
            record["error"] = "upstream_missing_finish_reason"
        self.close_connection = True
