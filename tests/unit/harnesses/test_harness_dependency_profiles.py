# -*- coding: utf-8 -*-
"""Keep optional Harness installations independent of core verification."""

from pathlib import Path
import tomllib
import re

from packaging.requirements import Requirement
from packaging.utils import canonicalize_name
import yaml

ROOT = Path(__file__).resolve().parents[3]
VENDOR_PACKAGES = {"openai-codex", "openai-codex-cli-bin", "qoder-agent-sdk"}


def test_desktop_profile_excludes_vendor_runtimes_and_keeps_scientific_tools():
    source = (ROOT / "requirements-desktop.in").read_text("utf-8")
    extras = set()
    for line in source.splitlines():
        if line.startswith(".["):
            extras.update(line[2:-1].split(","))
    assert not extras & {"codex", "qoder"}
    pins = set(
        re.findall(
            r"^([a-z0-9-]+)==",
            (ROOT / "requirements-desktop.lock").read_text("utf-8"),
            re.MULTILINE,
        ),
    )
    assert not pins & VENDOR_PACKAGES
    assert {
        "sympy",
        "tokenizers",
        "numpy",
        "pandas",
        "scipy",
        "xtgeo",
        "python-docx",
        "python-pptx",
        "openpyxl",
        "pymupdf",
    } <= pins


def test_core_profiles_keep_vendor_sdks_in_optional_harnesses():
    project = tomllib.loads((ROOT / "pyproject.toml").read_text("utf-8"))[
        "project"
    ]
    optional = project["optional-dependencies"]
    base = {
        canonicalize_name(Requirement(p).name) for p in project["dependencies"]
    }
    assert not base & VENDOR_PACKAGES
    for profile in ("test", "full"):
        pending, visited, packages = [profile], set(), set(base)
        while pending:
            name = pending.pop()
            if name in visited:
                continue
            visited.add(name)
            for declaration in optional[name]:
                requirement = Requirement(declaration)
                if canonicalize_name(requirement.name) == "qwenpaw":
                    pending.extend(requirement.extras)
                else:
                    packages.add(canonicalize_name(requirement.name))
        assert not packages & VENDOR_PACKAGES, (
            profile,
            packages & VENDOR_PACKAGES,
        )
    for vendor in ("codex", "qoder"):
        requirements = ROOT / "plugins/harness" / vendor / "requirements.txt"
        assert set(requirements.read_text("utf-8").splitlines()) == set(
            optional[vendor],
        )


def test_harness_workflow_verifies_isolated_vendors_on_fork_branch():
    workflow = yaml.load(
        (ROOT / ".github/workflows/harness-plugin-tests.yml").read_text(
            "utf-8",
        ),
        Loader=yaml.BaseLoader,
    )
    assert "lobehub-style" in workflow["on"]["push"]["branches"]
    jobs = workflow["jobs"]
    assert set(jobs["vendor-plugin"]["strategy"]["matrix"]["vendor"]) == {
        "codex",
        "qoder",
    }
    core_install = next(
        step["run"]
        for step in jobs["core-sdk"]["steps"]
        if step.get("name") == "Install core without vendor SDKs"
    )
    assert 'pip install -e ".[test]"' in core_install
    assert "assert all(find_spec(name) is None" in core_install
    for module in ("openai_codex", "codex_cli_bin", "qoder_agent_sdk"):
        assert module in core_install
    install_vendor = next(
        step["run"]
        for step in jobs["vendor-plugin"]["steps"]
        if step.get("name") == "Install only this plugin's pinned SDK"
    )
    assert (
        "plugins/harness/${HARNESS_VENDOR}/requirements-test.txt"
        in install_vendor
    )
