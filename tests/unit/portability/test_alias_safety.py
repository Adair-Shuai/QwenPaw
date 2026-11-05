# -*- coding: utf-8 -*-
"""Reject real import-source aliases without elevated Windows privileges."""
# pylint: disable=protected-access

from pathlib import Path

import pytest

from qwenpaw.portability.import_support import _prepare_memory_payloads
from qwenpaw.portability.models import SourceMemoryFile, SourceMemoryProject
from qwenpaw.portability.providers import external_state
from qwenpaw.portability.skill_transfer import read_bounded_skill_tree
from tests.fs_alias_support import directory_alias


@pytest.mark.parametrize("layout", ["root", "child"])
def test_memory_snapshot_rejects_directory_alias(
    tmp_path: Path,
    layout,
) -> None:
    secret = tmp_path / "private"
    secret.mkdir()
    (secret / "fact.md").write_text("do not import", encoding="utf-8")
    source = tmp_path / "source-memory"
    source.mkdir()
    directory_alias(secret, source / "linked")
    relative = Path("fact.md") if layout == "root" else Path("linked/fact.md")
    project = SourceMemoryProject(
        source_id="project-a",
        project_key="Project A",
        files=[
            SourceMemoryFile(
                source_path=source / "linked/fact.md",
                relative_path=relative,
            ),
        ],
    )

    with pytest.raises(ValueError, match="Memory source is unavailable"):
        _prepare_memory_payloads("codex", [project])
    assert (secret / "fact.md").read_text(encoding="utf-8") == "do not import"


def test_skill_snapshot_rejects_directory_alias(tmp_path: Path) -> None:
    secret = tmp_path / "private"
    secret.mkdir()
    skill = secret / "SKILL.md"
    skill.write_text("---\nname: linked\n---\n", encoding="utf-8")
    directory_alias(secret, tmp_path / "alias")

    with pytest.raises(ValueError, match="link"):
        list(read_bounded_skill_tree(tmp_path / "alias"))
    assert skill.read_text(encoding="utf-8") == "---\nname: linked\n---\n"


def _snapshot_file(path, relative=Path("fact.md")):
    return SourceMemoryProject(
        source_id="project-a",
        project_key="Project A",
        files=[SourceMemoryFile(source_path=path, relative_path=relative)],
    )


def test_memory_snapshot_reads_normal_source(tmp_path: Path) -> None:
    source = tmp_path / "source/fact.md"
    source.parent.mkdir()
    source.write_text("allowed", encoding="utf-8")
    payloads, _ = _prepare_memory_payloads("codex", [_snapshot_file(source)])
    assert payloads["project-a"][Path("fact.md")] == b"allowed"


@pytest.mark.parametrize(
    "relative",
    [Path("../fact.md"), "absolute", "anchored", "drive-relative"],
)
def test_memory_snapshot_rejects_unsafe_relative_root(tmp_path, relative):
    source = tmp_path / "fact.md"
    source.write_text("do not import", encoding="utf-8")
    relative = source if relative == "absolute" else relative
    if relative == "anchored":
        relative = Path("/fact.md")
    elif relative == "drive-relative":
        relative = Path(f"{source.drive}fact.md") if source.drive else source
    with pytest.raises(ValueError, match="Unsafe external memory path"):
        _prepare_memory_payloads("codex", [_snapshot_file(source, relative)])


def test_memory_snapshot_allows_alias_above_declared_root(tmp_path):
    actual = tmp_path / "actual"
    (actual / "source").mkdir(parents=True)
    (actual / "source/fact.md").write_text("allowed", encoding="utf-8")
    directory_alias(actual, tmp_path / "system-alias")
    source = tmp_path / "system-alias/source/fact.md"
    payloads, _ = _prepare_memory_payloads("codex", [_snapshot_file(source)])
    assert payloads["project-a"][Path("fact.md")] == b"allowed"


def _write(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def _assert_discovered_bytes(projects, expected):
    payloads, _ = _prepare_memory_payloads("test", projects)
    actual = sorted(
        value
        for bucket in payloads.values()
        for path, value in bucket.items()
        if path.suffix == ".md"
    )
    assert actual == expected


@pytest.mark.parametrize("layout", ["memories", "resources", "project"])
def test_codex_memory_discovery_rejects_directory_alias(tmp_path, layout):
    home = tmp_path / "codex"
    secret = tmp_path / "private"
    if layout == "memories":
        alias = home / "memories"
        _write(secret / "MEMORY.md", "do not import")
    else:
        base = home / "memories/extensions/linked/resources"
        alias = base if layout == "resources" else base / "project"
        relative = "project/fact.md" if layout == "resources" else "fact.md"
        _write(secret / relative, "do not import")
        _write(
            home / "memories/extensions/safe/resources/project/fact.md",
            "allowed",
        )
    alias.parent.mkdir(parents=True, exist_ok=True)
    directory_alias(secret, alias)
    projects = external_state.discover_codex_memory(home)
    _assert_discovered_bytes(
        projects,
        [] if layout == "memories" else [b"allowed"],
    )
    if layout == "memories":
        assert external_state.codex_memory_status(home)["state"] == "empty"


@pytest.mark.parametrize(
    "layout",
    ["memories", "account", "global", "projects", "project"],
)
def test_qoder_memory_discovery_rejects_directory_alias(tmp_path, layout):
    home = tmp_path / "qoder"
    secret = tmp_path / "private"
    paths = {
        "memories": ("memories", "account/global/fact.md"),
        "account": ("memories/account", "global/fact.md"),
        "global": ("memories/account/global", "fact.md"),
        "projects": ("memories/account/projects", "project/fact.md"),
        "project": ("memories/account/projects/project", "fact.md"),
    }
    alias_path, fact = paths[layout]
    _write(secret / fact, "do not import")
    if layout != "memories":
        _write(home / "memories/safe/global/fact.md", "allowed")
    alias = home / alias_path
    alias.parent.mkdir(parents=True, exist_ok=True)
    directory_alias(secret, alias)
    _assert_discovered_bytes(
        external_state.discover_qoder_memory(home),
        [] if layout == "memories" else [b"allowed"],
    )


@pytest.mark.parametrize("layout", ["projects", "project", "memory"])
def test_project_memory_discovery_rejects_directory_alias(tmp_path, layout):
    home = tmp_path / "agent"
    secret = tmp_path / "private"
    paths = {
        "projects": ("projects", "project/memory/fact.md"),
        "project": ("projects/project", "memory/fact.md"),
        "memory": ("projects/project/memory", "fact.md"),
    }
    alias_path, fact = paths[layout]
    _write(secret / fact, "do not import")
    if layout != "projects":
        _write(home / "projects/safe/memory/fact.md", "allowed")
    alias = home / alias_path
    alias.parent.mkdir(parents=True, exist_ok=True)
    directory_alias(secret, alias)
    _assert_discovered_bytes(
        external_state.discover_project_memory(home),
        [] if layout == "projects" else [b"allowed"],
    )


@pytest.mark.parametrize("provider", ["codex", "qoder", "project"])
def test_memory_discovery_allows_alias_above_trusted_home(tmp_path, provider):
    actual = tmp_path / "actual"
    actual.mkdir()
    directory_alias(actual, tmp_path / "system-alias")
    home = tmp_path / "system-alias/home"
    layout, discover = {
        "codex": ("memories/MEMORY.md", external_state.discover_codex_memory),
        "qoder": (
            "memories/account/global/fact.md",
            external_state.discover_qoder_memory,
        ),
        "project": (
            "projects/project/memory/fact.md",
            external_state.discover_project_memory,
        ),
    }[provider]
    _write(home / layout, "allowed")
    _assert_discovered_bytes(discover(home), [b"allowed"])


@pytest.mark.parametrize("layout", ["skills", "skill"])
def test_qoder_skill_discovery_rejects_directory_alias(tmp_path, layout):
    home = tmp_path / "qoder"
    secret = tmp_path / "private"
    _write(secret / "SKILL.md", "---\nname: linked\n---\n")
    alias = home / "skills" if layout == "skills" else home / "skills/linked"
    alias.parent.mkdir(parents=True, exist_ok=True)
    directory_alias(secret, alias)
    if layout == "skill":
        _write(home / "skills/safe/SKILL.md", "---\nname: safe\n---\n")
    skills = external_state.discover_qoder_skills(home)
    assert [skill.name for skill in skills] == (
        [] if layout == "skills" else ["safe"]
    )


def _schedule_source(home, store):
    import json
    import sqlite3

    home.mkdir(parents=True, exist_ok=True)
    if store == "toml":
        path = home / "automations/task/automation.toml"
        _write(path, '[automation]\nid = "private-task"\nprompt = "private"\n')
    elif store == "sqlite":
        path = home / "sqlite/automations.db"
        path.parent.mkdir()
        with sqlite3.connect(path) as connection:
            connection.execute(
                "CREATE TABLE automations (id TEXT, prompt TEXT)",
            )
            connection.execute(
                "INSERT INTO automations VALUES ('private-task', 'private')",
            )
    else:
        path = home / ".codex-global-state.json"
        _write(
            path,
            json.dumps(
                {
                    "local-projects": {
                        "private-task": {
                            "id": "private-task",
                            "rootPaths": [str(home)],
                        },
                    },
                },
            ),
        )
    return path


def _read_schedule_source(home, store):
    from qwenpaw.portability.providers import codex_schedule_reader as reader

    warnings = []
    if store == "toml":
        return reader._read_toml_candidates(home, warnings)[0]
    if store == "sqlite":
        return reader._read_sqlite_candidates(home, warnings)[0]
    return reader._read_project_roots(home, warnings)


@pytest.mark.parametrize(
    "store,layout",
    [
        ("toml", "home"),
        ("toml", "root"),
        ("toml", "entry"),
        ("sqlite", "home"),
        ("sqlite", "root"),
        ("state", "home"),
    ],
)
def test_codex_schedule_reader_rejects_directory_alias(
    tmp_path,
    store,
    layout,
):
    private = tmp_path / "private-home"
    source = _schedule_source(private, store)
    original_bytes = source.read_bytes()
    home = tmp_path / "codex-home"
    if layout == "home":
        directory_alias(private, home)
    else:
        home.mkdir()
        folder = "automations" if store == "toml" else "sqlite"
        if layout == "root":
            directory_alias(private / folder, home / folder)
        else:
            (home / folder).mkdir()
            directory_alias(private / folder / "task", home / folder / "task")

    records = _read_schedule_source(home, store)
    assert isinstance(records, dict)
    assert not records
    assert source.read_bytes() == original_bytes


@pytest.mark.parametrize("store", ["toml", "sqlite", "state"])
@pytest.mark.parametrize("layout", ["normal", "alias-above-home"])
def test_codex_schedule_reader_preserves_normal_sources(
    tmp_path,
    store,
    layout,
):
    home = tmp_path / "actual/codex-home"
    source = _schedule_source(home, store)
    original_bytes = source.read_bytes()
    if layout == "alias-above-home":
        directory_alias(tmp_path / "actual", tmp_path / "system-alias")
        home = tmp_path / "system-alias/codex-home"

    records = _read_schedule_source(home, store)
    assert set(records) == {"private-task"}
    if store != "state":
        assert records["private-task"][0]["prompt"] == "private"
    assert source.read_bytes() == original_bytes
