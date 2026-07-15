#!/usr/bin/env bash
# Build frontend bundles for all bundled plugins that have a ui/ directory.
#
# This MUST run before PyInstaller packaging so that plugin JS bundles
# (e.g. plugins/bundle/ugsci/ui/dist/index.js) are present in the
# final desktop app. Without them, plugins appear "loaded" in the
# backend but their custom UI (expert center, skill center, etc.)
# silently fails to render.
#
# Usage:
#   bash scripts/pack-tauri/build_plugin_uis.sh

set -e

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BUNDLE_DIR="$REPO_ROOT/plugins/bundle"

if [ ! -d "$BUNDLE_DIR" ]; then
    echo "[build_plugin_uis] No plugins/bundle/ directory found; skipping."
    exit 0
fi

echo "[build_plugin_uis] Building plugin frontend bundles..."

built=0
skipped=0

for plugin_dir in "$BUNDLE_DIR"/*/; do
    plugin_name=$(basename "$plugin_dir")
    ui_dir="$plugin_dir/ui"

    # Skip if no ui/ directory
    if [ ! -d "$ui_dir" ]; then
        continue
    fi

    # Skip if no package.json
    if [ ! -f "$ui_dir/package.json" ]; then
        echo "  - $plugin_name: no ui/package.json, skipping"
        skipped=$((skipped + 1))
        continue
    fi

    echo "  - $plugin_name: building..."
    (
        cd "$ui_dir"
        npm ci --prefix "$ui_dir" 2>/dev/null || npm install --prefix "$ui_dir"
        npm run build --prefix "$ui_dir"
    )

    # Verify the output exists
    dist_js="$ui_dir/dist/index.js"
    if [ ! -f "$dist_js" ]; then
        echo "  - $plugin_name: ERROR - dist/index.js not found after build!"
        exit 1
    fi

    size=$(du -h "$dist_js" | cut -f1)
    echo "  - $plugin_name: ✅ built ($size)"
    built=$((built + 1))

    # Sync dist/ to src/qwenpaw/plugins_bundle/ (PyInstaller bundles from
    # both locations; the src/ copy must also have the dist files).
    src_mirror="$REPO_ROOT/src/qwenpaw/plugins_bundle/$plugin_name/ui/dist"
    if [ -d "$src_mirror" ] || [ -d "$REPO_ROOT/src/qwenpaw/plugins_bundle/$plugin_name/ui" ]; then
        mkdir -p "$src_mirror"
        cp -R "$ui_dir/dist/"* "$src_mirror/"
    fi
done

echo "[build_plugin_uis] Done: $built built, $skipped skipped."
