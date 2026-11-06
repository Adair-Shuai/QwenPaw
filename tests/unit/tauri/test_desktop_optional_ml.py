# -*- coding: utf-8 -*-
"""Keep the desktop usable when optional inference packages are absent."""

import os
from pathlib import Path
import re
import subprocess
import sys
import textwrap
import tomllib

from packaging.requirements import Requirement
from packaging.utils import canonicalize_name

ROOT = Path(__file__).resolve().parents[3]
REMOVED = {
    "coloredlogs",
    "flatbuffers",
    "humanfriendly",
    "onnxruntime",
    "pyreadline3",
    "regex",
    "safetensors",
    "transformers",
}


def test_inference_is_optional_and_full_retains_it():
    project = tomllib.loads((ROOT / "pyproject.toml").read_text("utf-8"))[
        "project"
    ]
    base = {
        canonicalize_name(Requirement(value).name)
        for value in project["dependencies"]
    }
    assert not base & REMOVED
    assert {"sympy", "tokenizers"} <= base
    optional = project["optional-dependencies"]
    assert set(optional["ml"]) == {
        "transformers>=4.30.0",
        "onnxruntime<1.24",
    }
    full_extras = set().union(
        *(Requirement(value).extras for value in optional["full"]),
    )
    assert "ml" in full_extras
    pins = set(
        re.findall(
            r"^([a-z0-9-]+)==",
            (ROOT / "requirements-desktop.lock").read_text("utf-8"),
            re.MULTILINE,
        ),
    )
    assert not pins & REMOVED
    assert {"sympy", "tokenizers", "openpyxl", "modelscope"} <= pins


def test_real_core_and_ugsci_behaviors_without_inference_imports(tmp_path):
    """Fail imports in a fresh process, then run real existing behavior tests.

    This is an absence simulation, not a clean installer acceptance test.
    No ML module or protected behavior is replaced with a fake implementation.
    """
    script = textwrap.dedent(
        """
        import importlib.abc
        import sys
        from pathlib import Path

        removed = set(sys.argv[1].split(','))
        class MissingInference(importlib.abc.MetaPathFinder):
            def find_spec(self, fullname, path=None, target=None):
                if fullname.split('.')[0] in removed:
                    raise ModuleNotFoundError(
                        f'Optional dependency unavailable: {fullname}',
                        name=fullname,
                    )
                return None
        assert not removed.intersection(sys.modules)
        sys.meta_path.insert(0, MissingInference())

        from tokenizers import Tokenizer
        tokenizer = Tokenizer.from_file(
            'src/qwenpaw/tokenizer/tokenizer.json'
        )
        message = 'UGSci storage pressure 123'
        encoded = tokenizer.encode(message, add_special_tokens=False)
        assert encoded.ids
        assert tokenizer.decode(encoded.ids) == message

        from modelscope.hub.api import HubApi
        from modelscope.hub.snapshot_download import snapshot_download
        assert callable(HubApi) and callable(snapshot_download)

        import openpyxl
        from qwenpaw.plugins_bundle.ugsci.domain.storage_dynamics.reader \
            import read_file
        workbook = openpyxl.Workbook()
        workbook.active.append([
            '储气库', '井号', '日期', '生产时间(小时)',
            '日采气量(万方)', '油压(兆帕)', '日产水量(吨)', '备注',
        ])
        workbook.active.append([
            '库A', '井1', '2026-01-01', 12, 10, 15, 2, '',
        ])
        path = Path(sys.argv[2]) / 'daily.xlsx'
        workbook.save(path)
        workbook.close()
        issues, sources = [], []
        records = list(read_file(path, issues, sources))
        assert len(records) == 1 and records[0].gas == 10
        assert records[0].pressure == 15 and not issues

        import pytest
        code = pytest.main([
            '-q', '-p', 'no:cacheprovider', '-p', 'pytest_asyncio.plugin',
            'tests/unit/agents/utils/test_estimate_token_counter.py',
            'tests/unit/agents/context/visual_compression/runtime/'
            'test_recall_tool.py::TestSearchSources',
            'tests/unit/providers/test_typesafe_evaluation.py',
            'tests/unit/security/'
            'test_decision_model.py::test_typed_request_and_response',
            'tests/unit/plugins/ugsci/test_domain_trace_freeform.py',
            'tests/unit/plugins/ugsci/test_storage_dynamics.py',
        ])
        assert not removed.intersection(sys.modules)
        raise SystemExit(code)
        """,
    )
    environment = {
        **os.environ,
        "PYTEST_DISABLE_PLUGIN_AUTOLOAD": "1",
        "PYTHONDONTWRITEBYTECODE": "1",
        "PYTHONUTF8": "1",
    }
    # Preserve child evidence beside the pytest temporary fixture on failure.
    result = subprocess.run(
        [
            sys.executable,
            "-c",
            script,
            ",".join(sorted(REMOVED)),
            str(tmp_path),
        ],
        cwd=ROOT,
        env=environment,
        capture_output=True,
        text=True,
        encoding="utf-8",
        timeout=240,
        check=False,
    )
    (tmp_path / "without-inference.log").write_text(
        result.stdout + result.stderr,
        encoding="utf-8",
    )
    assert result.returncode == 0, result.stdout + result.stderr
    assert " skipped" not in result.stdout
