#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Quick import and smoke test for the GenUI backend module."""
# flake8: noqa: E402
# pylint: disable=wrong-import-position,unused-import
import sys

sys.path.insert(0, "src")

from qwenpaw.plugins_bundle.ugsci.genui.guide import (
    get_genui_guide,
)  # noqa: E402
from qwenpaw.plugins_bundle.ugsci.genui.json_repair import (  # noqa: E402
    try_parse_json_object,
)
from qwenpaw.plugins_bundle.ugsci.genui.prompt import (
    get_prompt_text,
)  # noqa: E402
from qwenpaw.plugins_bundle.ugsci.genui.registration import (  # noqa: E402
    register_genui,
)
from qwenpaw.plugins_bundle.ugsci.genui.schema import (  # noqa: E402
    list_component_catalog,
    normalize_ui_tree,
    validate_ui_tree,
)
from qwenpaw.plugins_bundle.ugsci.genui.state import (
    get_state_store,
)  # noqa: E402

# Test schema import
print(f"OK schema.py: {len(list_component_catalog())} components in catalog")

# Test JSON repair
print("OK json_repair.py: imported")

# Test guide
guide = get_genui_guide()
print(f"OK guide.py: {len(guide)} sections")

# Test state
store = get_state_store()
snap = store.create(
    session_id="test",
    tree={"schemaVersion": "1", "root": {"nodeId": "root", "kind": "Stack"}},
)
print(f"OK state.py: created snapshot ui_id={snap.ui_id[:20]}...")

# Test prompt
print(f"OK prompt.py: {len(get_prompt_text())} chars")

# Test registration
print("OK registration.py: imported")

# Test normalize_ui_tree with a bare root
tree = normalize_ui_tree(
    {
        "kind": "Stack",
        "children": [{"kind": "Text", "props": {"value": "hello"}}],
    },
)
assert tree["schemaVersion"] == "1"
assert tree["root"]["kind"] == "Stack"
assert tree["root"]["nodeId"]  # auto-generated
assert tree["root"]["children"][0]["nodeId"]  # auto-generated
print("OK normalize_ui_tree: bare root wrapped, nodeIds generated")

# Test validate_ui_tree with alias normalization
valid_tree = {
    "schemaVersion": "1",
    "root": {
        "nodeId": "root",
        "kind": "Stack",
        "props": {"gap": 12},
        "children": [
            {
                "nodeId": "t1",
                "kind": "Heading",
                "props": {"text": "Title", "level": 2},
            },
            {
                "nodeId": "t2",
                "kind": "Text",
                "props": {"value": "Hello world"},
            },
        ],
    },
}
result = validate_ui_tree(valid_tree)
# Heading 'text' should be aliased to 'value'
assert result["root"]["children"][0]["props"].get("value") == "Title"
print("OK validate_ui_tree: Heading text->value alias works")

# Test JSON repair with trailing comma
repaired = try_parse_json_object('{"kind": "Stack", "children": [],}')
assert repaired is not None and repaired.get("kind") == "Stack"
print("OK try_parse_json_object: trailing comma repaired")

# Test JSON repair with code fence
repaired2 = try_parse_json_object('```json\n{"root": {"kind": "Stack"}}\n```')
assert repaired2 is not None
print("OK try_parse_json_object: code fence stripped")

print()
print("All backend imports and basic tests passed!")
