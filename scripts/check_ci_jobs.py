#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Quick CI job status checker."""
import json
import sys
import urllib.request

REPO = "Adair-Shuai/QwenPaw"


def get_json(url: str) -> dict:
    req = urllib.request.Request(url)
    req.add_header("User-Agent", "Python")
    resp = urllib.request.urlopen(req)
    return json.loads(resp.read())


def list_run_jobs(run_id: int) -> None:
    url = f"https://api.github.com/repos/{REPO}/actions/runs/{run_id}/jobs?per_page=30"
    data = get_json(url)
    jobs = data.get("jobs", [])
    print(f"Total jobs: {len(jobs)}")
    print(f"{'Job Name':<55} {'Status':<12} {'Conclusion'}")
    print("-" * 80)
    for j in jobs:
        name = j["name"]
        status = j["status"]
        conclusion = j.get("conclusion", "—")
        marker = "FAIL" if conclusion == "failure" else "OK" if conclusion == "success" else "SKIP"
        print(f"{marker} {name:<53} {status:<12} {conclusion}")


if __name__ == "__main__":
    run_id = int(sys.argv[1]) if len(sys.argv) > 1 else 29815658189
    list_run_jobs(run_id)
