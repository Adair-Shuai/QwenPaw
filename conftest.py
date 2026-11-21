# -*- coding: utf-8 -*-
"""Keep repository pytest processes and their application children isolated."""

import os
from pathlib import Path
from tempfile import TemporaryDirectory


# QwenPaw claims dependency leases at package import. Nested conftest modules
# import QwenPaw during collection, before session or function fixtures run.
# Each pytest worker and simultaneous test run receives a distinct root.
# Released after application shutdown releases its OS file leases.
# pylint: disable-next=consider-using-with
_test_home = TemporaryDirectory(prefix="qp-", ignore_cleanup_errors=True)
_root = Path(_test_home.name).resolve()
for _key, _directory in (
    ("QWENPAW_DEPENDENCY_STATE_DIR", "deps"),
    ("QWENPAW_WORKING_DIR", "work"),
    ("QWENPAW_SECRET_DIR", "secret"),
):
    os.environ[_key] = str(_root / _directory)
