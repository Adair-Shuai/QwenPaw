# -*- coding: utf-8 -*-
"""Prune upstream test payloads while exercising real offline capabilities."""
# pylint: disable=protected-access

import importlib.util
import os
from pathlib import Path
import shutil
import subprocess
import sys
import textwrap

import pytest

ROOT = Path(__file__).resolve().parents[3]
PACK = ROOT / "scripts/pack-tauri"
sys.path.insert(0, str(PACK))


def _helper():
    spec = importlib.util.spec_from_file_location(
        "scientific_pruning_builder",
        PACK / "build_python_layers.py",
    )
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _link_or_copy(source, destination):
    # The pruner only unlinks entries; imports run with bytecode disabled.
    # Share read-only bytes when possible so this regression does not itself
    # rewrite hundreds of MB through antivirus on every Windows test run.
    try:
        os.link(source, destination)
    except OSError:
        shutil.copy2(source, destination)
    return destination


def test_scientific_pruning_only_removes_audited_test_trees(tmp_path):
    helper = _helper()
    removed = [
        "numpy/_core/tests/test_numeric.py",
        "sympy/physics/quantum/tests/test_spin.py",
        "pandas/tests/io/data/sample.parquet",
    ]
    retained = [
        "numpy/testing/__init__.py",
        "sympy/testing/pytest.py",
        "pandas/_testing/__init__.py",
        "scipy/datasets/sample.dat",
        "numpy/_core/include/numpy/arrayobject.h",
        "unknown_package/tests/runtime.py",
        "modelscope/models/test_fixture.json",
        "tokenizers/tokenizers.pyd",
    ]
    for relative in removed + retained:
        path = tmp_path / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(relative.encode())

    assert helper.prune_python_packages(tmp_path) == [
        "numpy/_core/tests",
        "pandas/tests",
        "sympy/physics/quantum/tests",
    ]
    assert all(not (tmp_path / name).exists() for name in removed)
    for name in retained:
        assert (tmp_path / name).read_bytes() == name.encode()


def test_scientific_pruning_changes_component_identity(tmp_path):
    helper = _helper()
    from stage_desktop_components import describe_component

    test_file = tmp_path / "numpy/tests/test_fixture.py"
    test_file.parent.mkdir(parents=True)
    test_file.write_bytes(b"upstream test fixture")
    (tmp_path / "numpy/__init__.py").write_bytes(b"runtime")
    entry = {"version": "0+sha.lock", "path": "binaries/python-packages"}
    before = describe_component(tmp_path, "python-packages", entry, "2.2.2b9")
    helper.prune_python_packages(tmp_path)
    after = describe_component(tmp_path, "python-packages", entry, "2.2.2b9")
    assert after["version"] != before["version"]
    assert after == describe_component(
        tmp_path,
        "python-packages",
        entry,
        "2.2.2b9",
    )


def test_scientific_pruning_rejects_paths_outside_staging(tmp_path):
    helper = _helper()
    staging = tmp_path / "staging"
    source = tmp_path / "source"
    staging.mkdir()
    source.mkdir()
    preserved = source / "fixture.py"
    preserved.write_bytes(b"source fixture")
    with pytest.raises(ValueError, match="escapes its layer"):
        helper._remove_dependency_tree(staging.resolve(), source)
    assert preserved.read_bytes() == b"source fixture"


def test_pruned_real_scientific_packages_keep_offline_operations(tmp_path):
    """Use copies of installed packages, with their actual tests removed."""
    helper = _helper()
    layer = tmp_path / "python-packages"
    layer.mkdir()
    sources = []
    for name in sorted(helper._TEST_SUITE_PACKAGES):
        spec = importlib.util.find_spec(name)
        assert spec and spec.origin, f"required desktop package absent: {name}"
        source = Path(spec.origin).parent
        sources.append(source)
        shutil.copytree(
            source,
            layer / name,
            ignore=shutil.ignore_patterns("__pycache__", "*.pyc", "*.pyo"),
            copy_function=_link_or_copy,
        )
        native_libraries = source.with_name(f"{name}.libs")
        if native_libraries.is_dir():
            shutil.copytree(
                native_libraries,
                layer / native_libraries.name,
                copy_function=_link_or_copy,
            )
    source_tests = [
        path for source in sources for path in source.rglob("tests")
    ]
    removed = helper.prune_python_packages(layer)
    assert removed
    assert not list(layer.rglob("tests"))
    assert all(path.is_dir() for path in source_tests)

    script = textwrap.dedent(
        """
        import importlib
        import io
        import json
        from pathlib import Path
        import sys

        layer = Path(sys.argv[1]).resolve()
        sys.path.insert(0, str(layer))
        names = sys.argv[2].split(',')
        for name in names:
            module = importlib.import_module(name)
            assert Path(module.__file__).resolve().is_relative_to(layer)

        import numpy as np
        from numpy.testing import assert_allclose
        from scipy import integrate, linalg, optimize, sparse, stats
        assert_allclose(linalg.solve([[2, 0], [0, 4]], [4, 8]), [2, 2])
        assert_allclose(sparse.csr_matrix(np.eye(2)).toarray(), np.eye(2))
        assert abs(integrate.quad(lambda x: x*x, 0, 1)[0] - 1/3) < 1e-9
        assert abs(optimize.brentq(lambda x: x*x-2, 1, 2) - 2**0.5) < 1e-9
        assert abs(stats.norm.cdf(0) - 0.5) < 1e-9

        import sympy as sp
        from sympy.testing.pytest import raises
        x = sp.Symbol('x')
        assert sp.simplify((x*x - 1)/(x - 1)) == x + 1
        assert sp.integrate(x*x, (x, 0, 1)) == sp.Rational(1, 3)
        assert sp.solve(x*x-4, x) == [-2, 2]
        assert callable(raises)

        import pandas as pd
        from pandas.testing import assert_frame_equal
        frame = pd.DataFrame({'well': ['A', 'B'], 'pressure': [12.5, 15.0]})
        stream = io.BytesIO()
        frame.to_parquet(stream, engine='pyarrow')
        stream.seek(0)
        assert_frame_equal(pd.read_parquet(stream), frame)

        import h5py
        stream = io.BytesIO()
        with h5py.File(stream, 'w') as handle:
            handle.create_dataset('pressure', data=[12.5, 15.0])
        stream.seek(0)
        with h5py.File(stream, 'r') as handle:
            assert_allclose(handle['pressure'][:], [12.5, 15.0])

        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt
        figure, axes = plt.subplots()
        axes.plot([1, 2], [12.5, 15])
        png = io.BytesIO()
        figure.savefig(png, format='png')
        plt.close(figure)
        assert png.getvalue().startswith(b'\\x89PNG')

        import mpmath
        from shapely.geometry import Point
        assert abs(mpmath.sqrt(4) - 2) < 1e-12
        assert abs(Point(0, 0).buffer(1).area - 3.14) < 0.02
        from tokenizers import Tokenizer
        tokenizer = Tokenizer.from_file(sys.argv[3])
        text = 'UGSci storage pressure 123'
        tokens = tokenizer.encode(text, add_special_tokens=False)
        assert tokenizer.decode(tokens.ids) == text
        from modelscope.hub.api import HubApi
        from modelscope.hub.snapshot_download import snapshot_download
        assert callable(HubApi) and callable(snapshot_download)
        print(json.dumps({'packages': names, 'offline_operations': 'passed'}))
        """,
    )
    result = subprocess.run(
        [
            sys.executable,
            "-B",
            "-c",
            script,
            str(layer),
            ",".join(sorted(helper._TEST_SUITE_PACKAGES)),
            str(ROOT / "src/qwenpaw/tokenizer/tokenizer.json"),
        ],
        cwd=tmp_path,
        env={
            **os.environ,
            "PYTHONDONTWRITEBYTECODE": "1",
            "MPLCONFIGDIR": str(tmp_path / "matplotlib-cache"),
        },
        capture_output=True,
        text=True,
        encoding="utf-8",
        timeout=120,
        check=False,
    )
    assert result.returncode == 0, result.stdout + result.stderr
    assert '"offline_operations": "passed"' in result.stdout
    assert not list(layer.rglob("__pycache__"))
