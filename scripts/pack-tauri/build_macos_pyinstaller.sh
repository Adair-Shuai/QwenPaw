#!/usr/bin/env bash
# Build UGSci with Tauri for macOS (PyInstaller backend)
# Creates a self-contained desktop app with bundled Python backend
#
# Usage:
#   ./scripts/pack-tauri/build_macos_pyinstaller.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"

VERSION=$(sed -n 's/^__version__[[:space:]]*=[[:space:]]*"\([^"]*\)".*/\1/p' src/qwenpaw/__version__.py)

echo "========================================="
echo "UGSci Tauri Build - macOS (PyInstaller)"
echo "========================================="
echo "Version: ${VERSION}"
echo ""

SIGN_MACOS_BUNDLE="${REPO_ROOT}/scripts/pack-tauri/sign_macos_bundle.sh"

# Step 0: Prerequisites
echo "== Step 0: Checking Prerequisites =="
missing=()

if command -v pnpm &>/dev/null; then
    echo "  [OK] pnpm ($(pnpm --version))"
else
    echo "  [MISSING] pnpm"
    echo "    Install Node.js + pnpm: https://pnpm.io/installation"
    missing+=("pnpm")
fi

if command -v rustc &>/dev/null; then
    echo "  [OK] rustc ($(rustc --version))"
else
    echo "  [MISSING] rustc (Rust)"
    echo "    Install: https://rustup.rs"
    missing+=("rustc")
fi

if command -v uv &>/dev/null; then
    echo "  [OK] uv ($(uv --version))"
else
    echo "  [MISSING] uv"
    echo "    Install: https://docs.astral.sh/uv/getting-started/installation/"
    missing+=("uv")
fi

if [ ${#missing[@]} -gt 0 ]; then
    echo ""
    echo "Missing prerequisites: ${missing[*]}"
    echo "Install the missing tools and re-run this script."
    exit 1
fi
echo ""

if [ ! -f "${SIGN_MACOS_BUNDLE}" ]; then
    echo "ERROR: macOS signing helper not found at ${SIGN_MACOS_BUNDLE}"
    exit 1
fi

if [ -z "${APPLE_SIGNING_IDENTITY:-}" ]; then
    # The Tauri app and PyInstaller sidecar are native Mach-O executables.
    # Keep their signature state consistent with ad-hoc signatures when no
    # Developer ID certificate is configured. This matches the legacy desktop
    # package behavior: signed enough for local loading, not notarized.
    export APPLE_SIGNING_IDENTITY="-"
    echo "Using ad-hoc macOS code signing"
    if [ -n "${APPLE_CERTIFICATE:-}" ]; then
        echo "warning: APPLE_CERTIFICATE is set without APPLE_SIGNING_IDENTITY; nested runtimes will use ad-hoc signing"
    fi
fi
if { [[ "${QWENPAW_REQUIRE_PLATFORM_SIGNING:-}" =~ ^(1|true|yes)$ ]] || \
     [[ "${QWENPAW_REQUIRE_NOTARIZATION:-}" =~ ^(1|true|yes)$ ]]; } && \
   [ "${APPLE_SIGNING_IDENTITY}" = "-" ]; then
    echo "ERROR: release signing is required, but APPLE_SIGNING_IDENTITY is not configured"
    exit 1
fi
if [ -z "${PYINSTALLER_CODESIGN_IDENTITY:-}" ]; then
    # PyInstaller uses the same identity as the final app for bundled Mach-O
    # files; "-" means ad-hoc signing on macOS.
    export PYINSTALLER_CODESIGN_IDENTITY="${APPLE_SIGNING_IDENTITY:-}"
fi
echo ""

# Step 1: Build console static assets
echo "== Step 1: Building Console Static Assets =="
cd console
pnpm install --frozen-lockfile
echo "Generating Tauri icons..."
pnpm exec tauri icon ../scripts/pack/assets/icon.svg
echo "Syncing Tauri version..."
node ../scripts/pack-tauri/sync_tauri_version.mjs
echo "Building console frontend..."
pnpm run build:prod
cd ..
echo "Console static assets built"
echo ""

# Step 1b: Build plugin frontend bundles
# This ensures plugin JS bundles (e.g. ugsci/ui/dist/index.js) are present
# before PyInstaller bundles them. Without this, plugins appear "loaded"
# in the backend but their custom UI silently fails to render.
echo "== Step 1b: Building Plugin Frontend Bundles =="
bash scripts/pack-tauri/build_plugin_uis.sh
echo ""

# Step 1c: Verify build assets
echo "== Step 1c: Verifying Build Assets =="
python scripts/pack-tauri/verify_build_assets.py --strict
echo ""

# Step 2: Build PyInstaller backend
echo "== Step 2: Building PyInstaller Backend =="
bash scripts/pack-tauri/build_pyinstaller.sh
echo "PyInstaller backend built"
echo ""

echo "== Step 2a: Verifying Bundled Plugins in Backend =="
if [[ "${QWENPAW_LAYERED_DESKTOP:-}" =~ ^(1|true|yes)$ ]]; then
    BUNDLED_PLUGIN_ROOT="${REPO_ROOT}/console/src-tauri/binaries/app/backend/${VERSION}/qwenpaw/plugins_bundle"
else
    BUNDLED_PLUGIN_ROOT="${REPO_ROOT}/console/src-tauri/binaries/qwenpaw-backend/_internal/qwenpaw/plugins_bundle"
fi
if [ ! -d "${BUNDLED_PLUGIN_ROOT}" ]; then
    echo "ERROR: Frozen backend is missing bundled plugins: ${BUNDLED_PLUGIN_ROOT}"
    exit 1
fi
python scripts/pack-tauri/verify_frozen_plugins.py "${BUNDLED_PLUGIN_ROOT}"
echo "Bundled plugin payload verified"
echo ""

echo "== Step 2b: Signing PyInstaller Backend =="
if [[ "${QWENPAW_LAYERED_DESKTOP:-}" =~ ^(1|true|yes)$ ]]; then
    bash "${SIGN_MACOS_BUNDLE}" \
        "${REPO_ROOT}/console/src-tauri/binaries" \
        "${APPLE_SIGNING_IDENTITY}"
    echo "Versioned runtime and tool layers signed"
else
    bash "${SIGN_MACOS_BUNDLE}" \
        "${REPO_ROOT}/console/src-tauri/binaries/qwenpaw-backend" \
        "${APPLE_SIGNING_IDENTITY}"
    echo "PyInstaller backend signed"
    echo ""
    echo "== Step 2c: Signing Bundled OfficeCLI =="
    bash "${SIGN_MACOS_BUNDLE}" \
        "${REPO_ROOT}/console/src-tauri/binaries/officecli" \
        "${APPLE_SIGNING_IDENTITY}"
    echo "Bundled OfficeCLI signed"
fi
echo ""

# Step 3: Build Tauri app
echo "== Step 3: Building Tauri App =="
BUNDLE_DIR="${REPO_ROOT}/console/src-tauri/target/release/bundle"
rm -rf "${BUNDLE_DIR}/dmg" "${BUNDLE_DIR}/macos"
cd console
echo "Building for macOS..."
pnpm exec tauri build \
    --config src-tauri/tauri.version.conf.json \
    --bundles app
cd ..
echo "Tauri app built"
echo ""

# Dynamically find the built .app bundle (product name may differ from "UGSci Desktop")
APP_PATH=""
for app in "${BUNDLE_DIR}/macos/"*.app; do
    if [ -d "$app" ]; then
        APP_PATH="$app"
        break
    fi
done
if [ -z "${APP_PATH}" ] || [ ! -d "${APP_PATH}" ]; then
    echo "ERROR: No Tauri macOS app found in ${BUNDLE_DIR}/macos/"
    ls -la "${BUNDLE_DIR}/macos/" 2>/dev/null || true
    exit 1
fi
echo "Found app bundle: ${APP_PATH}"
if [[ "${QWENPAW_LAYERED_DESKTOP:-}" =~ ^(1|true|yes)$ ]]; then
    HELPER_PATH="${APP_PATH}/Contents/Resources/binaries/tools/computer-use/${VERSION}/qwenpaw-computer-use-helper"
    APP_PLUGIN_ROOT="${APP_PATH}/Contents/Resources/binaries/app/backend/${VERSION}/qwenpaw/plugins_bundle"
else
    HELPER_PATH="${APP_PATH}/Contents/MacOS/qwenpaw-computer-use-helper"
    APP_PLUGIN_ROOT="${APP_PATH}/Contents/Resources/binaries/qwenpaw-backend/_internal/qwenpaw/plugins_bundle"
fi
if [ ! -x "${HELPER_PATH}" ]; then
    echo "ERROR: Computer Use helper was not bundled at ${HELPER_PATH}"
    exit 1
fi
if [ ! -d "${APP_PLUGIN_ROOT}" ]; then
    echo "ERROR: Final macOS app is missing bundled plugins: ${APP_PLUGIN_ROOT}"
    exit 1
fi
python scripts/pack-tauri/verify_frozen_plugins.py "${APP_PLUGIN_ROOT}"
echo "Final macOS app bundled plugin tree verified at ${APP_PLUGIN_ROOT}"

echo "== Step 3b: Verifying Final macOS App Signature =="
# Tauri signs the outer .app after embedding the pre-signed native resources.
# Re-signing here would make the first-install ZIP differ from the updater
# archive that Tauri generated during the build and can invalidate notarization.
codesign --verify --deep --strict --verbose=2 "${APP_PATH}"
if [ "${APPLE_SIGNING_IDENTITY}" != "-" ]; then
    if ! spctl --assess --type execute --verbose=2 "${APP_PATH}"; then
        if [[ "${QWENPAW_REQUIRE_PLATFORM_SIGNING:-}" =~ ^(1|true|yes)$ ]]; then
            echo "ERROR: Gatekeeper rejected the signed macOS app"
            exit 1
        fi
        echo "warning: Gatekeeper assessment did not pass; configure notarization before release"
    fi
fi
if [[ "${QWENPAW_REQUIRE_NOTARIZATION:-}" =~ ^(1|true|yes)$ ]]; then
    xcrun stapler validate "${APP_PATH}"
fi
echo "Final macOS app signature verified"
echo ""

# Step 4: Collect distribution artifacts
echo "== Step 4: Collecting Distribution Artifacts =="
DIST="${DIST:-dist}"
if [[ "${DIST}" = /* ]]; then
    DIST_ROOT="${DIST}"
else
    DIST_ROOT="${REPO_ROOT}/${DIST}"
fi
DIST_DIR="${DIST_ROOT}/tauri-macos"
rm -rf "${DIST_DIR}"
mkdir -p "${DIST_DIR}"

# Match the legacy macOS package shape: one zip containing one .app bundle.
cp -R "${APP_PATH}" "${DIST_DIR}/"
STAGED_APP_PATH="${DIST_DIR}/$(basename "${APP_PATH}")"
echo ".app copied to ${STAGED_APP_PATH}"

# Create ZIP archive
ZIP_NAME="${DIST_ROOT}/UGSci-Tauri-${VERSION}-macOS.zip"
if [ -f "${ZIP_NAME}" ]; then
    rm -f "${ZIP_NAME}"
fi
if command -v ditto &>/dev/null; then
    ditto -c -k --sequesterRsrc --keepParent "${STAGED_APP_PATH}" "${ZIP_NAME}"
else
    cd "${DIST_DIR}"
    zip -r "${ZIP_NAME}" "$(basename "${STAGED_APP_PATH}")"
    cd "${REPO_ROOT}"
fi

if [ -f "${ZIP_NAME}" ]; then
    SIZE=$(du -sh "${ZIP_NAME}" | cut -f1)
    echo "Created ${ZIP_NAME} (${SIZE})"
else
    echo "ERROR: Failed to create ZIP archive"
    exit 1
fi

echo "== Step 4a: Verifying Plugins in Final macOS ZIP =="
unzip -tq "${ZIP_NAME}" >/dev/null
python "${REPO_ROOT}/scripts/pack-tauri/verify_frozen_plugins.py" \
    --archive "${ZIP_NAME}"
echo "Final macOS ZIP contains valid bundled plugin manifests and entries"
echo ""

UPDATER_NAME="${DIST_ROOT}/UGSci-Tauri-${VERSION}-macOS.app.tar.gz"
case "$(uname -m)" in
    arm64 | aarch64) UPDATER_TARGET="darwin-aarch64" ;;
    *) UPDATER_TARGET="darwin-x86_64" ;;
esac
# The updater archive (.app.tar.gz) is only generated when Tauri has a signing
# key configured. Skip staging gracefully when it's absent (e.g., fork builds
# without TAURI_SIGNING_PRIVATE_KEY).
if ls "${BUNDLE_DIR}/macos/"*.app.tar.gz >/dev/null 2>&1; then
    python "${REPO_ROOT}/scripts/pack-tauri/generate_update_manifest.py" stage \
        --bundle-dir "${BUNDLE_DIR}/macos" \
        --pattern '*.app.tar.gz' \
        --target "${UPDATER_TARGET}" \
        --output "${UPDATER_NAME}" \
        --pubkey-config "${REPO_ROOT}/console/src-tauri/tauri.version.conf.json"
    echo "== Verifying Plugins in Final macOS Updater Archive =="
    tar -tzf "${UPDATER_NAME}" >/dev/null
    python "${REPO_ROOT}/scripts/pack-tauri/verify_frozen_plugins.py" \
        --archive "${UPDATER_NAME}"
    echo "Final macOS updater archive contains valid bundled plugin manifests and entries"
else
    if [[ -n "${TAURI_SIGNING_PRIVATE_KEY:-}" ]]; then
        echo "ERROR: TAURI_SIGNING_PRIVATE_KEY is set, but no .app.tar.gz updater archive was produced"
        echo "The macOS release must not continue without a signed updater artifact."
        exit 1
    fi
    echo "warning: no .app.tar.gz updater archive found; skipping updater staging"
    echo "(This is expected when building without TAURI_SIGNING_PRIVATE_KEY)"
    UPDATER_NAME="(skipped - no signing key)"
fi

echo ""
echo "========================================="
echo "Build Complete!"
echo "========================================="
echo "App:          ${APP_PATH}"
echo "Distribution: ${DIST_DIR}"
echo "Archive:      ${ZIP_NAME}"
echo "Updater:      ${UPDATER_RESULT}"
echo ""
echo "Test: open \"${STAGED_APP_PATH}\""
echo ""
