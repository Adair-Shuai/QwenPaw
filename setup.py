# -*- coding: utf-8 -*-
"""Setuptools hooks for the dormant official channel resources."""

from pathlib import Path
import json
import runpy
import shutil

from setuptools import find_namespace_packages, setup
from setuptools.command.build_py import build_py
from setuptools.command.sdist import sdist


def application_payload_names(directory):
    """Identify application mirrors without changing installed data."""
    root = Path(__file__).resolve().parent
    sources = list((root / "plugins/apps").glob("*/plugin.json"))
    names = {path.parent.name for path in sources}
    identifiers = {
        json.loads(path.read_text(encoding="utf-8"))["id"] for path in sources
    }
    for manifest in directory.glob("*/plugin.json"):
        data = json.loads(manifest.read_text(encoding="utf-8"))
        if data.get("type") == "app" or data.get("id") in identifiers:
            names.add(manifest.parent.name)
    return names


def exclude_application_payloads(directory):
    """Remove application copies only from a builder-owned artifact tree."""
    root = directory.resolve()
    source = (
        Path(__file__).resolve().parent / "src/qwenpaw/plugins_bundle"
    ).resolve()
    if root == source:
        raise ValueError("application filtering cannot modify source mirrors")
    for name in application_payload_names(directory):
        target = directory / name
        if not target.exists():
            continue
        if target.is_symlink() or not target.resolve().is_relative_to(root):
            raise ValueError(
                "application artifact path escapes its build tree",
            )
        shutil.rmtree(target)


def bundle(destination, version):
    root = Path(__file__).resolve().parent
    builder = runpy.run_path(
        str(root / "scripts/pack/generate_plugin_metadata.py"),
    )["build_official_channel_bundle"]
    builder(root, Path(destination), host_version=version)


class BuildPy(build_py):
    """Generate resources where the installed package resolves them."""

    def find_data_files(self, package, src_dir):
        paths = super().find_data_files(package, src_dir)
        mirrors = Path(self.get_package_dir("qwenpaw")) / "plugins_bundle"
        applications = application_payload_names(mirrors)
        selected = []
        for path in paths:
            try:
                relative = Path(path).resolve().relative_to(mirrors.resolve())
            except ValueError:
                selected.append(path)
                continue
            if relative.parts[0] not in applications:
                selected.append(path)
        return selected

    def run(self):
        super().run()
        package_dir = (
            Path(self.get_package_dir("qwenpaw"))
            if getattr(self, "editable_mode", False)
            else Path(self.build_lib) / "qwenpaw"
        )
        if not getattr(self, "editable_mode", False):
            exclude_application_payloads(package_dir / "plugins_bundle")
        bundle(
            package_dir / "official_channels",
            self.distribution.get_version(),
        )

    def get_outputs(self, include_bytecode=1):
        outputs = super().get_outputs(include_bytecode)
        directory = Path(self.build_lib) / "qwenpaw/official_channels"
        return sorted(
            set(outputs) | {str(path) for path in directory.glob("*")},
        )

    def get_output_mapping(self):
        mapping = super().get_output_mapping()
        if getattr(self, "editable_mode", False):
            directory = (
                Path(self.get_package_dir("qwenpaw")) / "official_channels"
            )
            build_directory = (
                Path(self.build_lib) / "qwenpaw/official_channels"
            )
            # Metadata prepared before generation may list an older archive.
            for output in list(mapping):
                if Path(output).parent == build_directory:
                    del mapping[output]
            # Strict editable installs link build paths to these source files.
            mapping.update(
                {
                    str(build_directory / path.name): str(path)
                    for path in directory.glob("*")
                },
            )
        return mapping


class SDist(sdist):
    """Ship both private resources and their reproducible source inputs."""

    def make_release_tree(self, base_dir, files):
        super().make_release_tree(base_dir, files)
        exclude_application_payloads(
            Path(base_dir) / "src/qwenpaw/plugins_bundle",
        )
        root = Path(__file__).resolve().parent
        builder = runpy.run_path(
            str(root / "scripts/pack/generate_plugin_metadata.py"),
        )
        inventory = runpy.run_path(
            str(root / "src/qwenpaw/plugins/official_channel_catalog.py"),
        )["OFFICIAL_CHANNELS"]
        bundle(
            Path(base_dir) / "src/qwenpaw/official_channels",
            self.distribution.get_version(),
        )
        # A wheel rebuilt from sdist uses exactly the same delivered inputs.
        # Unmigrated plugins remain outside this official source distribution.
        for row in inventory:
            relative = Path("plugins/channel") / row["source_dir"]
            shutil.copytree(
                root / relative,
                Path(base_dir) / relative,
                dirs_exist_ok=True,
                ignore=shutil.ignore_patterns(*builder["EXCLUDE_PATTERNS"]),
            )


# Keep fork plugin bundles and the upstream Hub templates in installed builds.
# Explicit discovery excludes frontend dependencies and Python caches.
packages = find_namespace_packages(
    "src",
    exclude=(
        "*.node_modules",
        "*.node_modules.*",
        "*.__pycache__",
        "*.__pycache__.*",
        "qwenpaw.plugins_bundle.ugsci.visualization.data",
        "qwenpaw.plugins_bundle.ugsci.visualization.data.*",
        *(
            pattern
            for name in application_payload_names(
                Path(__file__).resolve().parent / "src/qwenpaw/plugins_bundle",
            )
            for pattern in (
                f"qwenpaw.plugins_bundle.{name}",
                f"qwenpaw.plugins_bundle.{name}.*",
            )
        ),
    ),
)
packages += find_namespace_packages("packages/qwenpawmail-mcp/src")
packages += ["qwenpaw.plugins.bundled.hub"]
packages += [
    f"qwenpaw.plugins.bundled.hub.{name}"
    for name in find_namespace_packages(
        "plugins/hub",
        exclude=("*.__pycache__",),
    )
]
setup(packages=packages, cmdclass={"build_py": BuildPy, "sdist": SDist})
