#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Inject ReactFlow CSS into dist/index.js as inline style tag."""
import os

ui_dir = os.path.dirname(os.path.abspath(__file__))
css_path = os.path.join(ui_dir, "dist", "style.css")
js_path = os.path.join(ui_dir, "dist", "index.js")

css = open(css_path, encoding="utf-8").read()
js = open(js_path, encoding="utf-8").read()

# Inject CSS as a style tag after the banner shim
inject = 'var __ff_css=document.createElement("style");__ff_css.textContent=' + repr(css) + ';document.head.appendChild(__ff_css);'

marker = 'window.ReactDOM=__h.ReactDOM;'
pos = js.find(marker)
if pos >= 0:
    pos += len(marker)
    js = js[:pos] + '\n' + inject + js[pos:]
else:
    # Fallback: inject at the very start
    js = inject + '\n' + js

open(js_path, 'w', encoding='utf-8').write(js)
print(f'CSS injected: {len(css)} bytes -> dist/index.js total: {len(js)} bytes')
