#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Check upstream repo's recent CI runs."""
import json
import urllib.request

REPO = "agentscope-ai/QwenPaw"


def get_json(url: str) -> dict:
    req = urllib.request.Request(url)
    req.add_header("User-Agent", "Python")
    resp = urllib.request.urlopen(req)
    return json.loads(resp.read())


# Get recent completed test runs from upstream
url = (
    f"https://api.github.com/repos/{REPO}/actions/workflows/"
    "tests.yml/runs?per_page=3&status=completed"
)
data = get_json(url)
for run in data.get("workflow_runs", []):
    print(f"Run #{run['run_number']}: {run['conclusion']} - {run['display_title'][:80]}")
    print(f"  SHA: {run['head_sha'][:12]}  Created: {run['created_at']}")

    # Get jobs for this run
    jobs_url = f"https://api.github.com/repos/{REPO}/actions/runs/{run['id']}/jobs?per_page=30"
    jobs_data = get_json(jobs_url)
    for j in jobs_data.get("jobs", []):
        conclusion = j.get("conclusion", "—")
        marker = (
            "FAIL" if conclusion == "failure"
            else "OK" if conclusion == "success"
            else "SKIP"
        )
        print(f"  {marker} {j['name']}")
    print()

# Also check pre-commit
print("=== Pre-commit Checks ===")
url2 = (
    f"https://api.github.com/repos/{REPO}/actions/workflows/"
    "pre-commit.yml/runs?per_page=3&status=completed"
)
data2 = get_json(url2)
for run in data2.get("workflow_runs", []):
    print(f"Run #{run['run_number']}: {run['conclusion']} - {run['display_title'][:80]}")
    print(f"  SHA: {run['head_sha'][:12]}  Created: {run['created_at']}")
