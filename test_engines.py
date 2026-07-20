#!/usr/bin/env python3
"""Test if runtime engine JSON files can be parsed."""
import sys
import json
import os
from pathlib import Path
from dataclasses import dataclass, field, asdict
from typing import Any, Dict, List, Optional

# Minimal EngineInfo replica matching the updated manager.py
@dataclass
class EngineInfo:
    id: str
    name: str
    vendor: str = ""
    version: str = ""
    executable_path: str = ""
    install_dir: str = ""
    category: str = ""
    description: str = ""
    invocation_hint: str = ""
    license_server: str = ""
    extra_paths: List[str] = field(default_factory=list)
    status: str = "configured"
    is_default: bool = False
    is_custom: bool = False
    modules: List[str] = field(default_factory=list)
    module_paths: Dict[str, str] = field(default_factory=dict)
    arch: str = ""
    build: str = ""
    license_status: str = ""
    lmutil_path: str = ""
    extra_info: Dict[str, Any] = field(default_factory=dict)

runtime_engines = Path(r"C:\Users\shuai\.qwenpaw\plugins\ugsci\engines")
print(f"Engines dir: {runtime_engines}")
print(f"Exists: {runtime_engines.exists()}")
print()

for f in sorted(runtime_engines.glob("*.json")):
    try:
        data = json.loads(f.read_text(encoding="utf-8"))
        engine = EngineInfo(**data)
        print(f"OK: {engine.id} | status={engine.status} | name={engine.name}")
    except Exception as exc:
        print(f"FAIL: {f.name} | error: {exc}")
        # Try to show what fields are in the JSON
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
            print(f"  JSON keys: {list(data.keys())}")
        except:
            print("  (JSON parse also failed)")
