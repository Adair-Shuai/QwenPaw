#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Check latest CI runs for the fork."""
import json
import urllib.request

REPO = "Adair-Shuai/QwenPaw"


def get_json(url: str) -> dict:
    req = urllib.request.Request(url)
    req.add_header("User-Agent", "Python")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


runs_url = (
    f"https://api.github.com/repos/{REPO}/actions/runs?"
    "per_page=8&branch=lobehub-style"
)
data = get_json(runs_url)
for r in data.get("workflow_runs", [])[:8]:
    print(
        f"Run {r['id']}: {r['name']:<45s} "
        f"{r['status']:<12s} {r.get('conclusion', '—')}",
    )
