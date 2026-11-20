# -*- coding: utf-8 -*-
"""Validate sealed release, preflight and publish through the existing service."""

import argparse
import json
import os
from pathlib import Path
from urllib.parse import urlsplit

import httpx

from qwenpaw.expert_packages.publication import (
    public_key,
    validate_publication,
)


def endpoint():
    url = os.environ["UGSCI_PUBLISH_SERVICE_URL"].rstrip("/")
    parsed = urlsplit(url)
    if (
        parsed.scheme != "https"
        or not parsed.hostname
        or parsed.username
        or parsed.query
        or parsed.fragment
    ):
        raise ValueError("Publication service requires a fixed HTTPS base URL")
    return url


def post(path, payload):
    with httpx.Client(timeout=600, follow_redirects=False) as client:
        result = client.post(
            endpoint() + path,
            json=payload,
            headers={
                "Authorization": "Bearer " + os.environ["UGSCI_PUBLISH_TOKEN"],
            },
        )
        # Avoid printing request headers, signed URLs, or arbitrary server bodies.
        if result.status_code != 200:
            raise ValueError(
                f"Publication failed with HTTP {result.status_code}. "
                "Inspect the service receipt before retrying.",
            )
        return result.json()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--preflight", action="store_true")
    parser.add_argument(
        "--templates",
        action="store_true",
        help="Merge legacy Awsome-tools catalog metadata",
    )
    args = parser.parse_args()
    payload = json.loads(args.input.read_text(encoding="utf-8"))
    if args.templates:
        if args.preflight:
            raise ValueError("Template import does not support preflight")
        result = post("/v1/expert-catalog/import", {"catalog": payload})
    else:
        validate_publication(payload, public_key())
        result = post("/v1/expert-packages/releases/inspect", payload)
        if not args.preflight:
            result = post("/v1/expert-packages/releases", payload)
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
