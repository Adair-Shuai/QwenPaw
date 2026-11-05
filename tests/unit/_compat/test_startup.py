# -*- coding: utf-8 -*-
"""Cold process checks of deferred real AgentScope compatibility patches."""

import os
from pathlib import Path
import subprocess
import sys

import pytest


def _run(code, tmp_path):
    env = os.environ.copy()
    env.update(
        QWENPAW_WORKING_DIR=str(tmp_path / "working"),
        QWENPAW_SECRET_DIR=str(tmp_path / "secrets"),
        QWENPAW_DEPENDENCY_STATE_DIR=str(tmp_path / "state"),
    )
    result = subprocess.run(
        [sys.executable, "-X", "utf8", "-c", code],
        cwd=Path(__file__).resolve().parents[3],
        env=env,
        capture_output=True,
        text=True,
        timeout=30,
        check=False,
    )
    assert result.returncode == 0, result.stdout + result.stderr


def test_config_import_does_not_eagerly_import_agentscope(tmp_path):
    _run(
        "import sys; import qwenpaw.constant; "
        "assert not any(name == 'agentscope' or "
        "name.startswith('agentscope.') for name in sys.modules); "
        "assert 'qwenpaw.backup.orchestration' not in sys.modules; "
        "assert 'qwenpaw.backup.manager' not in sys.modules",
        tmp_path,
    )


@pytest.mark.parametrize("sdk_first", [False, True])
def test_real_sdk_keeps_legacy_messages_and_tool_annotations(
    tmp_path,
    sdk_first,
):
    _run(
        ("import agentscope.message, agentscope.tool\n" if sdk_first else "")
        + """
import importlib
import typing
import qwenpaw
from agentscope.message import Msg, UserMsg
from agentscope.message._base import Msg as OriginalMsg
assert Msg is OriginalMsg
message = UserMsg(name="user", content="legacy text")
legacy = message.to_dict()
restored = Msg.from_dict(legacy)
assert restored.content[0].text == "legacy text"
assert restored.timestamp == str(restored.created_at).replace("T", " ")
modules = [importlib.import_module(name) for name in (
    "agentscope.tool._utils", "agentscope.tool._toolkit",
    "agentscope.tool._builtin._meta",
)]
for module in modules:
    for name in ("Optional", "List", "Dict", "Union", "Sequence"):
        assert getattr(module, name) is getattr(typing, name)
# Unresolved function globals exercise Pydantic's module-level fallback.
namespace = {}
exec("def probe(value: 'Optional[List[str]]' = None): pass", namespace)
schema = modules[0]._extract_input_schema(namespace["probe"])
assert schema["properties"]["value"]["anyOf"][0]["type"] == "array"
# Reload also passes through the original loader and receives the patches.
reloaded = importlib.reload(modules[0])
assert reloaded is modules[0]
assert reloaded.Optional is typing.Optional
assert reloaded._extract_input_schema(namespace["probe"]) == schema
""",
        tmp_path,
    )


def test_concurrent_real_sdk_imports_are_patched_before_return(tmp_path):
    _run(
        """
from concurrent.futures import ThreadPoolExecutor
import importlib
import qwenpaw
import typing
names = ("agentscope.message", "agentscope.tool",
         "agentscope.message", "agentscope.tool")
def load(name):
    module = importlib.import_module(name)
    if name.endswith("message"):
        assert hasattr(module.Msg, "from_dict")
        assert hasattr(module.Msg, "timestamp")
    else:
        utils = importlib.import_module("agentscope.tool._utils")
        assert utils.Optional is typing.Optional
    return module
with ThreadPoolExecutor(max_workers=4) as executor:
    modules = list(executor.map(load, names))
for name, module in zip(names, modules):
    assert module is importlib.import_module(name)
""",
        tmp_path,
    )


def test_backup_public_exports_keep_original_objects():
    import importlib

    from qwenpaw import backup

    expected = {
        "BackupManager": "manager",
        "BackupOperationConflict": "manager",
        "list_backups": "_ops.storage",
        "get_backup": "_ops.storage",
        "delete_backups": "_ops.storage",
        "export_backup": "_ops.storage",
        "import_backup": "_ops.storage",
        "execute_restore": "orchestration",
    }
    for name, suffix in expected.items():
        module = importlib.import_module("qwenpaw.backup." + suffix)
        assert getattr(backup, name) is getattr(module, name)
        assert name in dir(backup)
    assert set(backup.__all__) == set(expected)
    with pytest.raises(AttributeError, match="no attribute"):
        getattr(backup, "unknown_backup_api")


@pytest.mark.parametrize("legacy", [False, True])
def test_import_patches_preserve_original_custom_loader(monkeypatch, legacy):
    import importlib
    import importlib.machinery
    from types import ModuleType

    from qwenpaw._compat._lazy import _PatchFinder

    module_name = "_qwenpaw_compat_loader_probe"
    original_class = type("OriginalClass", (), {})
    patched = []

    class Loader:
        marker = "original-loader"

        def create_module(self, spec):
            assert spec.name == module_name
            return ModuleType(spec.name)

        def exec_module(self, module):
            module.original_class = original_class

    class LegacyLoader:
        marker = "original-loader"

        def load_module(self, fullname):
            module = sys.modules.setdefault(fullname, ModuleType(fullname))
            module.original_class = original_class
            return module

    class Finder:
        def find_spec(self, fullname, _path=None, _target=None):
            if fullname == module_name:
                return importlib.machinery.ModuleSpec(fullname, Loader())
            return None

    class LegacyFinder:
        def find_module(self, fullname, _path=None):
            return LegacyLoader() if fullname == module_name else None

    def patch_module(module):
        module.compatibility_applied = True
        patched.append(module)

    finder = LegacyFinder() if legacy else Finder()
    monkeypatch.setattr(
        sys,
        "meta_path",
        [_PatchFinder((module_name,), patch_module), finder, *sys.meta_path],
    )
    try:
        module = importlib.import_module(module_name)
        assert module.original_class is original_class
        assert module.compatibility_applied
        assert module.__spec__.loader.marker == "original-loader"
        assert importlib.import_module(module_name) is module
        assert patched == [module]
        assert importlib.reload(module) is module
        assert module.original_class is original_class
        assert patched == [module, module]
    finally:
        sys.modules.pop(module_name, None)
