# -*- coding: utf-8 -*-
from setuptools import find_namespace_packages, setup

# Keep fork plugin bundles and the upstream Hub templates in installed builds.
# Explicit discovery excludes frontend dependencies and Python caches.
packages = find_namespace_packages(
    "src",
    exclude=(
        "*.node_modules",
        "*.node_modules.*",
        "*.__pycache__",
        "*.__pycache__.*",
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
setup(packages=packages)
