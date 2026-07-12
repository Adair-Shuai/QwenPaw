#!/usr/bin/env bash
# Build a full wheel package including the latest console frontend.
# Run from repo root: bash scripts/wheel_build.sh
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

CONSOLE_DIR="$REPO_ROOT/console"
CONSOLE_DEST="$REPO_ROOT/src/qwenpaw/console"

echo "[wheel_build] Building console frontend..."
(cd "$CONSOLE_DIR" && npm ci)
(cd "$CONSOLE_DIR" && npm run build)

echo "[wheel_build] Copying console/dist/* -> src/qwenpaw/console/..."
rm -rf "$CONSOLE_DEST"/*

mkdir -p "$CONSOLE_DEST"
cp -R "$CONSOLE_DIR/dist/"* "$CONSOLE_DEST/"

echo "[wheel_build] Syncing bundled plugins -> src/qwenpaw/plugins_bundle/"
BUNDLE_SRC="$REPO_ROOT/plugins/bundle"
BUNDLE_DEST="$REPO_ROOT/src/qwenpaw/plugins_bundle"
if [[ -d "$BUNDLE_SRC" ]]; then
  for plugin_dir in "$BUNDLE_SRC"/*/; do
    plugin_name=$(basename "$plugin_dir")
    if [[ -f "$plugin_dir/plugin.json" ]]; then
      rm -rf "$BUNDLE_DEST/$plugin_name"
      mkdir -p "$BUNDLE_DEST/$plugin_name"
      cp -R "$plugin_dir"* "$BUNDLE_DEST/$plugin_name/"
      echo "  - Synced: $plugin_name"
    fi
  done
fi

echo "[wheel_build] Bundling website docs into package..."
DOCS_SRC="$REPO_ROOT/website/public/docs"
DOCS_DEST="$REPO_ROOT/src/qwenpaw/docs"
rm -rf "$DOCS_DEST"
mkdir -p "$DOCS_DEST"
cp "$DOCS_SRC/"*.md "$DOCS_DEST/"

echo "[wheel_build] Building wheel + sdist..."
python3 -m pip install --quiet build
rm -rf dist/*
python3 -m build --outdir dist .

echo "[wheel_build] Done. Wheel(s) in: $REPO_ROOT/dist/"
