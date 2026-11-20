# -*- coding: utf-8 -*-
"""Small stdio MCP demonstration backed by the locked packaging library."""

import json
import sys

from packaging.version import Version

TOOL = {
    "name": "compare_versions",
    "description": "Compare PEP 440 versions using the packaging library",
    "inputSchema": {
        "type": "object",
        "properties": {
            "left": {"type": "string"},
            "right": {"type": "string"},
        },
        "required": ["left", "right"],
        "additionalProperties": False,
    },
    "outputSchema": {
        "type": "object",
        "properties": {"comparison": {"type": "integer"}},
        "required": ["comparison"],
    },
}

for line in sys.stdin:
    request = {}
    try:
        request = json.loads(line)
        if "id" not in request:
            continue
        method = request.get("method")
        if method == "initialize":
            result = {
                "protocolVersion": request["params"]["protocolVersion"],
                "capabilities": {"tools": {}},
                "serverInfo": {"name": "version-demo", "version": "0.1.0"},
            }
        elif method == "tools/list":
            result = {"tools": [TOOL]}
        elif method == "ping":
            result = {}
        elif method == "tools/call":
            if request["params"]["name"] != TOOL["name"]:
                raise ValueError("Unknown tool")
            arguments = request["params"]["arguments"]
            left, right = Version(arguments["left"]), Version(
                arguments["right"],
            )
            value = {"comparison": (left > right) - (left < right)}
            result = {
                "structuredContent": value,
                "content": [{"type": "text", "text": json.dumps(value)}],
                "isError": False,
            }
        else:
            print(
                json.dumps(
                    {
                        "jsonrpc": "2.0",
                        "id": request["id"],
                        "error": {
                            "code": -32601,
                            "message": "Method not found",
                        },
                    },
                ),
                flush=True,
            )
            continue
        response = {"jsonrpc": "2.0", "id": request["id"], "result": result}
    except (ValueError, KeyError, TypeError):
        response = {
            "jsonrpc": "2.0",
            "id": request.get("id") if isinstance(request, dict) else None,
            "error": {"code": -32602, "message": "Invalid request or version"},
        }
    print(json.dumps(response), flush=True)
