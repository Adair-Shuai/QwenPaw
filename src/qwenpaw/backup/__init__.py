# -*- coding: utf-8 -*-
"""Backup public API, without loading application services during bootstrap."""

from importlib import import_module
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from ._ops.storage import (
        delete_backups,
        export_backup,
        get_backup,
        import_backup,
        list_backups,
    )
    from .manager import BackupManager, BackupOperationConflict
    from .orchestration import execute_restore

_EXPORTS = {
    "BackupManager": "manager",
    "BackupOperationConflict": "manager",
    "list_backups": "_ops.storage",
    "get_backup": "_ops.storage",
    "delete_backups": "_ops.storage",
    "export_backup": "_ops.storage",
    "import_backup": "_ops.storage",
    "execute_restore": "orchestration",
}
__all__ = list(_EXPORTS)


def __getattr__(name):
    module = _EXPORTS.get(name)
    if module is None:
        raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
    value = getattr(import_module(f"{__name__}.{module}"), name)
    globals()[name] = value
    return value


def __dir__():
    return sorted(set(globals()) | set(__all__))
