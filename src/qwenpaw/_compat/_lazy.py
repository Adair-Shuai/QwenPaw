# -*- coding: utf-8 -*-
"""Apply narrow SDK compatibility patches after normal module execution."""

from __future__ import annotations

import importlib.util
import sys


class _PatchedLoader:
    """Delegate module construction and preserve the original class objects."""

    def __init__(self, loader, patch):
        self._loader = loader
        self._patch = patch

    def create_module(self, spec):
        create = getattr(self._loader, "create_module", None)
        return create(spec) if create is not None else None

    def exec_module(self, module):
        self._loader.exec_module(module)
        self._patch(module)

    def __getattr__(self, name):
        return getattr(self._loader, name)


class _LegacyPatchedLoader:
    """Retain Python 3.11 compatibility with legacy custom finders."""

    def __init__(self, loader, patch):
        self._loader = loader
        self._patch = patch

    def load_module(self, fullname):
        module = self._loader.load_module(fullname)
        self._patch(module)
        return module

    def __getattr__(self, name):
        return getattr(self._loader, name)


class _PatchFinder:
    """Use the existing finder chain, including frozen and custom loaders."""

    _qwenpaw_agentscope_compat = True

    def __init__(self, names, patch):
        self.names = frozenset(names)
        self.patch = patch

    def find_spec(self, fullname, path=None, target=None):
        if fullname not in self.names:
            return None
        for finder in tuple(sys.meta_path):
            if finder is self:
                continue
            find_spec = getattr(finder, "find_spec", None)
            if find_spec is not None:
                spec = find_spec(fullname, path, target)
            else:
                find_module = getattr(finder, "find_module", None)
                loader = (
                    finder.find_module(fullname, path)
                    if callable(find_module)
                    else None
                )
                spec = (
                    importlib.util.spec_from_loader(fullname, loader)
                    if loader is not None
                    else None
                )
            if spec is not None:
                if spec.loader is not None:
                    loader_type = (
                        _PatchedLoader
                        if hasattr(spec.loader, "exec_module")
                        else _LegacyPatchedLoader
                    )
                    spec.loader = loader_type(spec.loader, self.patch)
                return spec
        return None


def install_import_patches(names, patch):
    """Patch loaded modules and watch only the declared future SDK imports."""
    finder = next(
        (
            item
            for item in sys.meta_path
            if getattr(item, "_qwenpaw_agentscope_compat", False)
        ),
        None,
    )
    if finder is None:
        finder = _PatchFinder(names, patch)
        sys.meta_path.insert(0, finder)
    for name in names:
        if (module := sys.modules.get(name)) is not None:
            patch(module)
