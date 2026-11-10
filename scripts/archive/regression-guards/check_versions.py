# -*- coding: utf-8 -*-
# flake8: noqa
# pylint: skip-file
import json
import re

v = open("src/qwenpaw/__version__.py", encoding="utf-8").read()
print("core:", re.search(r'__version__ = "([^"]+)"', v).group(1))
print(
    "console:",
    json.load(open("console/package.json", encoding="utf-8"))["version"],
)
t = json.load(open("console/src-tauri/tauri.conf.json", encoding="utf-8"))
print("tauri:", t.get("version"))
