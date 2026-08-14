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
PLUGIN_STAGE_SCRIPT="$REPO_ROOT/scripts/pack-tauri/stage_bundled_plugins.py"

if [ ! -f "$PLUGIN_STAGE_SCRIPT" ]; then
    echo "[build_plugin_uis] Plugin discovery script is missing; skipping."
    exit 0
fi

echo "[build_plugin_uis] Building plugin frontend bundles..."

built=0
skipped=0

python_cmd="python3"
command -v "$python_cmd" >/dev/null 2>&1 || python_cmd="python"
while IFS= read -r plugin_dir; do
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
        if ! npm ci --prefix "$ui_dir"; then
            if [ "${QWENPAW_ALLOW_NPM_INSTALL_FALLBACK:-false}" = "true" ]; then
                echo "  - $plugin_name: npm ci failed; using explicitly enabled npm install fallback"
                npm install --prefix "$ui_dir"
            else
                echo "  - $plugin_name: ERROR - npm ci failed; fix the lockfile or set QWENPAW_ALLOW_NPM_INSTALL_FALLBACK=true for a non-production local build"
                exit 1
            fi
        fi
        npm run build --prefix "$ui_dir"
    )

    # Verify the output exists
    dist_js="$ui_dir/dist/index.js"
    if [ ! -f "$dist_js" ]; then
        echo "  - $plugin_name: ERROR - dist/index.js not found after build!"
        exit 1
    fi

    size=$(du -h "$dist_js" | cut -f1)
    echo "  - $plugin_name: [OK] built ($size)"
    built=$((built + 1))

    # Sync dist/ to src/qwenpaw/plugins_bundle/ (PyInstaller bundles from
    # both locations; the src/ copy must also have the dist files).
    src_mirror="$REPO_ROOT/src/qwenpaw/plugins_bundle/$plugin_name/ui/dist"
    if [ -d "$src_mirror" ] || [ -d "$REPO_ROOT/src/qwenpaw/plugins_bundle/$plugin_name/ui" ]; then
        mkdir -p "$src_mirror"
        cp -R "$ui_dir/dist/"* "$src_mirror/"
    fi
done < <("$python_cmd" "$PLUGIN_STAGE_SCRIPT" --repo "$REPO_ROOT" --list-sources)

echo "[build_plugin_uis] Done: $built built, $skipped skipped."
