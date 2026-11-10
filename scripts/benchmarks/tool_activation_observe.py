# -*- coding: utf-8 -*-
"""Extract nested batch counts and error summaries from owned test sessions."""

from __future__ import annotations

import argparse
import json
import time
from pathlib import Path


def collect(root, output, observed, modified):
    # pylint: disable=too-many-branches,too-many-nested-blocks,too-many-statements
    for kind in ["native", "mcp"]:
        directory = root / kind / "workspace" / "sessions" / "console"
        for path in directory.glob("*.json"):
            try:
                version = path.stat().st_mtime_ns
                if modified.get(str(path)) == version:
                    continue
                state = json.loads(path.read_text(encoding="utf-8"))["agent"][
                    "state"
                ]
                modified[str(path)] = version
            except (OSError, KeyError, ValueError):
                continue
            case_id = None
            for message in state.get("context", []):
                if message.get("role") == "user":
                    marker = (message.get("metadata") or {}).get(
                        "qwenpaw_client_message_id",
                        "",
                    )
                    case_id = marker if marker.startswith("bench") else None
                if not case_id:
                    continue
                observation = observed.setdefault(
                    case_id,
                    {"tools": {}, "final_text_chars": 0},
                )
                for block in message.get("content", []):
                    if (
                        block.get("type") == "tool_call"
                        and block.get("name") == "run_tool_batch"
                    ):
                        try:
                            arguments = json.loads(block.get("input", "{}"))
                            actions = arguments.get("actions", [])
                            if isinstance(actions, str):
                                actions = json.loads(actions)
                            names = [
                                action.get("tool_name", "")
                                for action in actions
                                if isinstance(action, dict)
                            ]
                            observation.setdefault("batch_inputs", {})[
                                block["id"]
                            ] = names
                        except (ValueError, TypeError):
                            pass
                    if block.get("type") == "tool_result":
                        entry = {
                            "name": block.get("name"),
                            "state": block.get("state"),
                            "nested_calls": [],
                        }
                        texts = [
                            part.get("text", "")
                            for part in block.get("output", [])
                            if part.get("type") == "text"
                        ]
                        entry["output_chars"] = sum(
                            len(text) for text in texts
                        )
                        for text in texts:
                            try:
                                value = json.loads(text)
                            except ValueError:
                                value = None
                            if isinstance(value, dict):
                                if (
                                    block.get("name") == "run_tool_batch"
                                    and "completed" in value
                                ):
                                    entry["batch_reported_total"] = value.get(
                                        "total",
                                    )
                                    entry["batch_reported_completed"] = value[
                                        "completed"
                                    ]
                                if value.get("ok") is False:
                                    entry["structured_error"] = str(
                                        value.get("error", "ok=false"),
                                    )[:300]
                                for step in value.get("results", []):
                                    if isinstance(step, dict) and step.get(
                                        "tool_name",
                                    ):
                                        entry["nested_calls"].append(
                                            {
                                                "name": step["tool_name"],
                                                "ok": step.get("ok"),
                                            },
                                        )
                                last = value.get("last_step_result")
                                if isinstance(last, dict) and last.get(
                                    "tool_name",
                                ):
                                    entry["nested_calls"].append(
                                        {
                                            "name": last["tool_name"],
                                            "ok": last.get("ok"),
                                        },
                                    )
                            if block.get(
                                "state",
                            ) != "success" or text.lstrip().startswith(
                                "Error:",
                            ):
                                entry["error_preview"] = text[:500]
                        names = observation.get("batch_inputs", {}).get(
                            block["id"],
                            [],
                        )
                        if names and entry.get(
                            "batch_reported_completed",
                        ) == entry.get("batch_reported_total") == len(names):
                            entry["nested_calls"] = [
                                {"name": name, "ok": True} for name in names
                            ]
                        observation["tools"][block["id"]] = entry
                assistant_text = sum(
                    len(block.get("text", ""))
                    for block in message.get("content", [])
                    if block.get("type") == "text"
                    and message.get("role") == "assistant"
                )
                if assistant_text:
                    observation["final_text_chars"] = assistant_text
    (output / "supplemental-observations.json").write_text(
        json.dumps(observed, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--follow", action="store_true")
    args = parser.parse_args()
    root = Path(args.root).resolve()
    if not root.name.startswith("qwenpaw-activation-"):
        raise ValueError("Only dedicated benchmark roots are accepted")
    output = Path(args.output).resolve()
    observed = {}
    modified = {}
    started = time.monotonic()
    while True:
        collect(root, output, observed, modified)
        if (
            not args.follow
            or (output / "summary.json").exists()
            or time.monotonic() - started > 3600
        ):
            break
        time.sleep(10)
    print(
        json.dumps(
            {
                "observed_cases": len(observed),
                "nested_calls": sum(
                    len(t["nested_calls"])
                    for o in observed.values()
                    for t in o["tools"].values()
                ),
            },
        ),
    )


if __name__ == "__main__":
    main()
