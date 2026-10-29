# -*- coding: utf-8 -*-
"""Namespace linting must keep file coverage and diagnostic exit bits."""

import sys
from types import ModuleType, SimpleNamespace

import pytest

from scripts import pylint_namespace


def write_source(root, name, source="value = 1\n"):
    path = root / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(source, encoding="utf-8")
    return path


def test_namespace_plugin_modules_keep_distinct_qualified_names(tmp_path):
    names = [
        "plugins/apps/first/backend/store.py",
        "plugins/apps/second/backend/store.py",
        "plugins/bundle/example/engine/tools.py",
        "src/qwenpaw/plugins_bundle/example/engine/tools.py",
        "plugins/apps/dashed-name/backend/store.py",
        "plugins/apps/first/backend/__init__.py",
        "plugins/apps/second/backend/__init__.py",
        "src/qwenpaw/plugins_bundle/example/engine/__init__.py",
    ]
    for name in names:
        write_source(tmp_path, name)
    targets = [
        pylint_namespace.module_target(name, tmp_path) for name in names
    ]
    assert targets == [
        "plugins.apps.first.backend.store",
        "plugins.apps.second.backend.store",
        "plugins.bundle.example.engine.tools",
        "qwenpaw.plugins_bundle.example.engine.tools",
        "plugins.apps.dashed-name.backend.store",
        "plugins.apps.first.backend.__init__",
        "plugins.apps.second.backend.__init__",
        "qwenpaw.plugins_bundle.example.engine.__init__",
    ]
    assert len(set(targets)) == len(names)
    for name, target in zip(names, targets):
        assert (
            pylint_namespace.module_origin(
                target,
                (tmp_path / "src", tmp_path),
            )
            == tmp_path / name
        )


def test_module_resolution_never_executes_package_initializers(tmp_path):
    write_source(
        tmp_path,
        "isolated_pkg/__init__.py",
        "raise RuntimeError()\n",
    )
    target = write_source(tmp_path, "isolated_pkg/child/check.py")
    assert (
        pylint_namespace.module_target(
            "isolated_pkg/child/check.py",
            tmp_path,
        )
        == "isolated_pkg.child.check"
    )
    assert (
        pylint_namespace.module_origin("isolated_pkg.child.check", (tmp_path,))
        == target
    )
    assert (
        pylint_namespace.module_target("isolated_pkg/__init__.py", tmp_path)
        == "isolated_pkg.__init__"
    )


@pytest.mark.parametrize(
    "name",
    [".local_probe.py", "tool.pyw", "plain"],
)
def test_non_module_inputs_are_forwarded_as_original_files(tmp_path, name):
    write_source(tmp_path, name)
    assert pylint_namespace.module_target(name, tmp_path) == name


def test_shadowed_namespace_is_forwarded_without_dropping_file(tmp_path):
    write_source(tmp_path, "shadow.py")
    write_source(tmp_path, "shadow/child.py")
    assert (
        pylint_namespace.module_target(
            "shadow/child.py",
            tmp_path,
        )
        == "shadow/child.py"
    )
    outside = tmp_path.parent / "outside.py"
    assert pylint_namespace.module_target(str(outside), tmp_path) == str(
        outside,
    )


def test_initializer_does_not_select_package_or_unrequested_children(tmp_path):
    write_source(tmp_path, "package/__init__.py", "raise RuntimeError()\n")
    write_source(tmp_path, "package/unselected.py", "raise RuntimeError()\n")
    target = pylint_namespace.module_target("package/__init__.py", tmp_path)
    assert target == "package.__init__"
    assert (
        pylint_namespace.module_origin(target, (tmp_path,))
        == tmp_path / "package/__init__.py"
    )


@pytest.mark.parametrize("status", [0, 2, 4, 8, 16, 30, 32])
def test_cli_preserves_all_arguments_files_and_exit_bits(
    tmp_path,
    monkeypatch,
    status,
):
    script = write_source(tmp_path, "scripts/pylint_namespace.py")
    monkeypatch.setattr(pylint_namespace, "__file__", str(script))
    write_source(tmp_path, "plugins/first/backend/store.py")
    write_source(tmp_path, "plugins/second/backend/store.py")
    write_source(tmp_path, "plugins/first/backend/__init__.py")
    write_source(tmp_path, ".local_probe.py")
    calls = []

    def run(arguments, **settings):
        calls.append((arguments, settings["exit"]))
        assert sys.path[:2] == [str(tmp_path / "src"), str(tmp_path)]
        return SimpleNamespace(linter=SimpleNamespace(msg_status=status))

    package = ModuleType("pylint")
    lint = ModuleType("pylint.lint")
    lint.Run = run
    monkeypatch.setitem(sys.modules, "pylint", package)
    monkeypatch.setitem(sys.modules, "pylint.lint", lint)
    original_path = sys.path[:]
    options = ["--enable=all", "--disable=W0511", "--msg-template={symbol}"]
    result = pylint_namespace.main(
        [
            *options,
            "--",
            "plugins/first/backend/store.py",
            "plugins/second/backend/store.py",
            "plugins/first/backend/__init__.py",
            ".local_probe.py",
        ],
    )
    assert result == status
    assert calls == [
        (
            [
                *options,
                "--",
                "plugins.first.backend.store",
                "plugins.second.backend.store",
                "plugins.first.backend.__init__",
                ".local_probe.py",
            ],
            False,
        ),
    ]
    assert sys.path == original_path


def test_cli_requires_explicit_option_boundary(capsys):
    assert pylint_namespace.main(["--enable=all"]) == 2
    assert "Separate Pylint options" in capsys.readouterr().err


@pytest.mark.parametrize("relative", pylint_namespace.PROJECT_ROOTS)
def test_standalone_project_keeps_own_src_and_scripts_names(
    tmp_path,
    relative,
):
    project = tmp_path / relative
    for name in ("src/utils.py", "scripts/runner.py"):
        target = write_source(project, name)
        write_source(tmp_path, name, "raise RuntimeError()\n")
        qualified = pylint_namespace.module_target(
            str(target),
            project,
            search_roots=(project, tmp_path / "src", tmp_path),
            source_layout=False,
        )
        assert qualified == name.removesuffix(".py").replace("/", ".")
        assert (
            pylint_namespace.module_origin(
                qualified,
                (project, tmp_path / "src", tmp_path),
            )
            == target
        )
        assert pylint_namespace.project_root(str(target), tmp_path) == project


def test_mixed_projects_use_fresh_processes_and_preserve_exit_bits(
    tmp_path,
    monkeypatch,
):
    script = write_source(tmp_path, "scripts/pylint_namespace.py")
    monkeypatch.setattr(pylint_namespace, "__file__", str(script))
    files = [
        "src/qwenpaw/example.py",
        str(pylint_namespace.PROJECT_ROOTS[0] / "src/utils.py"),
        str(pylint_namespace.PROJECT_ROOTS[1] / "scripts/runner.py"),
        "tests/unit/example.py",
    ]
    for name in files:
        write_source(tmp_path, name)
    calls = []
    statuses = iter((2, 4, 16))

    def run(arguments, **settings):
        calls.append((arguments, settings))
        return SimpleNamespace(returncode=next(statuses))

    monkeypatch.setattr(pylint_namespace.subprocess, "run", run)
    options = ["--enable=all", "--msg-template={symbol}"]
    assert pylint_namespace.main([*options, "--", *files]) == 22
    contexts = [
        tmp_path,
        *(tmp_path / p for p in pylint_namespace.PROJECT_ROOTS),
    ]
    selected = [[files[0], files[3]], [files[1]], [files[2]]]
    assert calls == [
        (
            [
                sys.executable,
                str(script),
                f"--project-root={context}",
                *options,
                "--",
                *names,
            ],
            {"check": False},
        )
        for context, names in zip(contexts, selected)
    ]


def test_child_context_resolves_selected_files_relative_to_repository(
    tmp_path,
    monkeypatch,
):
    script = write_source(tmp_path, "scripts/pylint_namespace.py")
    monkeypatch.setattr(pylint_namespace, "__file__", str(script))
    project = tmp_path / pylint_namespace.PROJECT_ROOTS[0]
    filename = str(pylint_namespace.PROJECT_ROOTS[0] / "src/utils.py")
    write_source(tmp_path, filename)
    calls = []

    def run(arguments, **settings):
        calls.append((arguments, settings))
        assert sys.path[:3] == [
            str(project),
            str(tmp_path / "src"),
            str(tmp_path),
        ]
        return SimpleNamespace(linter=SimpleNamespace(msg_status=4))

    lint = ModuleType("pylint.lint")
    lint.Run = run
    monkeypatch.setitem(sys.modules, "pylint", ModuleType("pylint"))
    monkeypatch.setitem(sys.modules, "pylint.lint", lint)
    original_path = sys.path[:]
    assert (
        pylint_namespace.main(
            [f"--project-root={project}", "--enable=all", "--", filename],
        )
        == 4
    )
    assert calls == [(["--enable=all", "--", "src.utils"], {"exit": False})]
    assert sys.path == original_path


def test_unknown_project_context_is_rejected(tmp_path, capsys):
    assert pylint_namespace.main([f"--project-root={tmp_path}", "--"]) == 2
    assert "Unknown project import context" in capsys.readouterr().err
