#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Run a deterministic, disjoint part of the ordinary pytest collection."""

from __future__ import annotations

import argparse
import hashlib
import sys
from pathlib import Path

import pytest


class UnitShard:
    """Partition collected node IDs without changing their tests or fixtures."""

    def __init__(self, index: int, count: int) -> None:
        self.index = index
        self.count = count

    @pytest.hookimpl(trylast=True)
    def pytest_collection_modifyitems(self, config, items) -> None:
        selected, deselected = [], []
        for item in items:
            owner = (
                int.from_bytes(
                    hashlib.sha256(item.nodeid.encode("utf-8")).digest()[:8],
                    "big",
                )
                % self.count
            )
            (selected if owner == self.index else deselected).append(item)
        config.hook.pytest_deselected(items=deselected)
        items[:] = selected


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--shard-index", type=int, required=True)
    parser.add_argument("--shard-count", type=int, required=True)
    args, pytest_args = parser.parse_known_args()
    if not 0 <= args.shard_index < args.shard_count:
        parser.error("Require 0 <= shard-index < shard-count")
    # Match `python -m pytest` when executed from the repository root.
    sys.path.insert(0, str(Path.cwd()))
    return int(
        pytest.main(
            pytest_args,
            plugins=[UnitShard(args.shard_index, args.shard_count)],
        ),
    )


if __name__ == "__main__":
    raise SystemExit(main())
