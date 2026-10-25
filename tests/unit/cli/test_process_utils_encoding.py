# -*- coding: utf-8 -*-
"""Windows process discovery must retain PIDs beside Unicode command lines."""

import json
import subprocess
import sys

from qwenpaw.cli import process_utils
from qwenpaw.cli.process_utils import _windows_process_snapshot


def test_windows_snapshot_decodes_real_utf8_subprocess_output(monkeypatch):
    row = {
        "ProcessId": 4321,
        "ParentProcessId": 1234,
        "Name": "python.exe",
        "CommandLine": "python -m qwenpaw app --name 科研助手 🐾",
    }
    payload = json.dumps([row], ensure_ascii=False).encode("utf-8")
    run = subprocess.run

    def powershell_output(command, **kwargs):
        assert command[0] == "powershell"
        assert "[Console]::OutputEncoding" in command[-1]
        return run(
            [
                sys.executable,
                "-c",
                f"import sys; sys.stdout.buffer.write({payload!r})",
            ],
            check=kwargs.pop("check"),
            **kwargs,
        )

    monkeypatch.setattr(process_utils.subprocess, "run", powershell_output)
    assert _windows_process_snapshot() == {
        4321: (1234, "python.exe", row["CommandLine"]),
    }
