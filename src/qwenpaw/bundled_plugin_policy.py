# -*- coding: utf-8 -*-
"""The small, explicit plugin set shipped with every core distribution.

Keep this module dependency-free: setuptools and release tools read it without
importing the application. Other plugins and all apps use the market channel.
"""

BUNDLED_PLUGIN_IDS = frozenset(
    {
        "ugsci",
        "ugsci_research",
        "flowforge",
        "qwenpaw-openui",
        "qwenpaw-run-center",
    },
)
