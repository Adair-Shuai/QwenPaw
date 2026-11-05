# -*- coding: utf-8 -*-
"""Real directory aliases for filesystem identity tests on all platforms."""

import os
from pathlib import Path


def directory_alias(source: Path, alias: Path) -> None:
    """Create a symlink, or a real Windows junction without admin privilege.

    Junctions exercise directory alias identity, not file-symlink semantics.
    Creation failures remain test failures; no copy or mocked fallback exists.
    """
    try:
        alias.symlink_to(source, target_is_directory=True)
    except OSError as exc:
        if os.name != "nt" or getattr(exc, "winerror", None) != 1314:
            raise
        import _winapi  # pylint: disable=import-outside-toplevel

        _winapi.CreateJunction(str(source), str(alias))
    assert alias.samefile(source)
    assert alias.resolve(strict=True) == source.resolve(strict=True)
