#!/usr/bin/env bash
# Build QwenPaw backend with PyInstaller for Tauri sidecar
# Creates an onedir backend bundle with embedded Python runtime
#
# Usage:
#   ./scripts/pack-tauri/build_pyinstaller.sh
#
# Prerequisites:
#   - Python 3.10+ on PATH (used only to bootstrap the bundled runtime)
#   - PyInstaller 6.0+ (will be installed if not present)

set -e

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"

DIST="${DIST:-dist}"
BINARIES_DIR="${REPO_ROOT}/console/src-tauri/binaries"
PYTHON_RUNTIME_DIR="${BINARIES_DIR}/python-runtime"
RUNTIME_PYTHON_DIR="${PYTHON_RUNTIME_DIR}/python"
NATIVE_HOST_PYTHON="${RUNTIME_PYTHON_DIR}/bin/python3"
BUILD_VENV="${DIST}/pyinstaller-venv"
PYTHON_BIN="${BUILD_VENV}/bin/python"
VERSION=$(sed -n 's/^__version__[[:space:]]*=[[:space:]]*"\([^"]*\)".*/\1/p' src/qwenpaw/__version__.py)
LAYERED_DESKTOP=false
if [[ "${QWENPAW_LAYERED_DESKTOP:-}" =~ ^(1|true|yes)$ ]]; then
    LAYERED_DESKTOP=true
fi

echo "========================================="
echo "QwenPaw PyInstaller Build"
echo "========================================="
echo "Version: ${VERSION}"
echo "Repository: ${REPO_ROOT}"
echo ""

# Check prerequisites
echo "== Checking prerequisites =="

if command -v python3 >/dev/null 2>&1; then
    BOOTSTRAP_PYTHON=$(command -v python3)
elif command -v python >/dev/null 2>&1; then
    BOOTSTRAP_PYTHON=$(command -v python)
else
    echo "ERROR: Python not found on PATH; it is required to stage the bundled runtime"
    exit 1
fi

mkdir -p "${BINARIES_DIR}"

# The staged python-build-standalone runtime is the canonical source for both
# the helper interpreter and the PyInstaller build environment. The PATH
# Python only selects the X.Y version to download and runs the staging script.
echo "== Staging canonical Python runtime =="
"$BOOTSTRAP_PYTHON" "${REPO_ROOT}/scripts/pack-tauri/stage_python_runtime.py" \
    --dest "${PYTHON_RUNTIME_DIR}"
if [ ! -f "$NATIVE_HOST_PYTHON" ]; then
    echo "ERROR: Bundled Python interpreter not found at ${NATIVE_HOST_PYTHON}"
    exit 1
fi

echo "== Creating PyInstaller build environment =="
"$NATIVE_HOST_PYTHON" -m venv --clear "$BUILD_VENV"

echo "Python: $("$PYTHON_BIN" --version)"
echo ""

install_python_packages() {
    if command -v uv &>/dev/null; then
        uv pip install --python "$PYTHON_BIN" "$@"
    else
        "$PYTHON_BIN" -m pip install "$@"
    fi
}

uninstall_python_package() {
    if command -v uv &>/dev/null; then
        uv pip uninstall --python "$PYTHON_BIN" -y "$1" >/dev/null 2>&1 || true
    else
        "$PYTHON_BIN" -m pip uninstall -y "$1" >/dev/null 2>&1 || true
    fi
}

if [ "$LAYERED_DESKTOP" = false ]; then
# Install PyInstaller if not present
echo "== Installing PyInstaller =="
if ! "$PYTHON_BIN" -c "import PyInstaller" 2> /dev/null; then
    echo "Installing PyInstaller..."
    install_python_packages "pyinstaller>=6.0.0"
fi
echo "PyInstaller installed"

# Install project dependencies (ensures ALL runtime deps are importable)
echo "== Installing project dependencies =="
# Pin setuptools <82: lark-oapi still calls pkg_resources.declare_namespace
# at import time. A *fresh* install of setuptools >= 82 removes pkg_resources
# wholesale, so lark-oapi's except-ImportError fallback (pkgutil.extend_path)
# kicks in and the import works. The proven failure mode is an *in-place*
# upgrade of a legacy setuptools (seen on the macOS CI runners, and possible
# in any environment upgrading an existing install): it can leave a
# half-removed pkg_resources (module present, declare_namespace gone), which
# raises an AttributeError the fallback does not catch — crashing the Feishu
# channel. The pin keeps every environment in the known-good state.
install_python_packages -e ".[full]" "setuptools<82"
echo "Project dependencies installed with full extras"

# Fix agent-client-protocol namespace collision
# PyPI has an empty 'acp' stub that shadows the real package
if ! "$PYTHON_BIN" -c "from acp import Agent" 2> /dev/null; then
    echo "Fixing agent-client-protocol namespace..."
    uninstall_python_package acp
    install_python_packages "agent-client-protocol>=0.9.0,<0.11.0"
fi
echo ""

# Run PyInstaller
echo "== Running PyInstaller =="
echo "Building onedir backend bundle..."

SPEC_FILE="${REPO_ROOT}/scripts/pack-tauri/qwenpaw.spec"
if [ ! -f "$SPEC_FILE" ]; then
    echo "ERROR: Spec file not found at ${SPEC_FILE}"
    exit 1
fi

"$PYTHON_BIN" -m PyInstaller "$SPEC_FILE" \
    --distpath "${DIST}/pyinstaller" \
    --workpath "${DIST}/pyinstaller-build" \
    --clean \
    --noconfirm

echo "PyInstaller build complete"
echo ""

# Verify output
BACKEND_DIR="${DIST}/pyinstaller/qwenpaw-backend"
BACKEND_EXE="${BACKEND_DIR}/qwenpaw-backend"
CLI_EXE="${BACKEND_DIR}/qwenpaw"
if [ ! -d "${BACKEND_DIR}" ]; then
    echo "ERROR: Backend bundle directory not found at ${BACKEND_DIR}"
    exit 1
fi
if [ ! -f "${BACKEND_EXE}" ]; then
    echo "ERROR: Backend executable not found at ${BACKEND_EXE}"
    exit 1
fi
if [ ! -f "${CLI_EXE}" ]; then
    echo "ERROR: CLI executable not found at ${CLI_EXE}"
    exit 1
fi
"$PYTHON_BIN" "${REPO_ROOT}/scripts/pack-tauri/verify_model_catalog.py" \
    "${BACKEND_DIR}/_internal/qwenpaw/providers/data"

echo "== Pruning build-only files from backend bundle =="
"$PYTHON_BIN" "${REPO_ROOT}/scripts/pack-tauri/prune_desktop_bundle.py" \
    "${BACKEND_DIR}" \
    --max-size-mb "${QWENPAW_MAX_BACKEND_MB:-1800}"

echo "Backend bundle created: ${BACKEND_DIR}"

# Get size
SIZE=$(du -sh "${BACKEND_DIR}" | cut -f1)
echo "Bundle size: ${SIZE}"
echo ""

# Copy to Tauri resources directory
echo "== Copying to Tauri binaries directory =="
DEST="${BINARIES_DIR}/qwenpaw-backend"
rm -rf "${DEST}"
mkdir -p "${DEST}"
cp -R "${BACKEND_DIR}/." "${DEST}/"
chmod +x "${DEST}/qwenpaw-backend"
chmod +x "${DEST}/qwenpaw"
echo "Copied to: ${DEST}"
echo ""
else
    echo "== Layered desktop mode: skipping PyInstaller and legacy dependency install =="
    DEST="${BINARIES_DIR}/qwenpaw-backend"
fi

# The Chrome Native Messaging host runs under this standalone interpreter,
# outside the PyInstaller backend, so its dependencies must be installed here.
echo "== Installing bundled Python helper dependencies =="
if [ "$LAYERED_DESKTOP" = false ]; then
"$NATIVE_HOST_PYTHON" -m pip install \
    --disable-pip-version-check \
    --no-input \
    --no-deps \
    --only-binary=:all: \
    -r "${REPO_ROOT}/scripts/pack-tauri/native-host-requirements.txt"
"$NATIVE_HOST_PYTHON" \
    "${REPO_ROOT}/plugins/bundle/chrome/assets/scripts/nm_host.py" \
    --check-runtime
fi
echo ""

if [ "$LAYERED_DESKTOP" = false ]; then
    echo "== Installing common + petroleum domain packages into bundled runtime =="
    PIP_INDEX_URL="${PIP_INDEX_URL:-https://pypi.tuna.tsinghua.edu.cn/simple/}"
    PIP_EXTRA_INDEX_URL="${PIP_EXTRA_INDEX_URL:-https://pypi.org/simple/}"
    "$NATIVE_HOST_PYTHON" -m pip install \
        --disable-pip-version-check \
        --no-input \
        --index-url "$PIP_INDEX_URL" \
        --extra-index-url "$PIP_EXTRA_INDEX_URL" \
        numpy pandas scipy matplotlib requests openpyxl python-docx python-pptx Pillow \
        lasio welly bruges simpeg dlisio xtgeo pvtlib
fi
echo ""

echo "== Staging bundled Node runtime =="
"$PYTHON_BIN" "${REPO_ROOT}/scripts/pack-tauri/stage_node_runtime.py" \
    --dest "${BINARIES_DIR}/node-runtime" \
    --sha256 "${QWENPAW_NODE_SHA256:-}"
echo ""

echo "== Staging bundled OfficeCLI =="
OFFICECLI_DOC_PLUGIN_ARGS=()
if [ -n "${QWENPAW_OFFICECLI_DOC_PLUGIN:-}" ]; then
    OFFICECLI_DOC_PLUGIN_ARGS=(--doc-plugin "$QWENPAW_OFFICECLI_DOC_PLUGIN")
fi
"$PYTHON_BIN" "${REPO_ROOT}/scripts/pack-tauri/stage_officecli.py" \
    --dest "${BINARIES_DIR}/officecli" \
    "${OFFICECLI_DOC_PLUGIN_ARGS[@]}"
echo ""

echo "== Staging bundled Java runtime (NeqSim MCP Server) =="
"$PYTHON_BIN" "${REPO_ROOT}/scripts/pack-tauri/stage_jre.py" \
    --dest "${BINARIES_DIR}/java-runtime" \
    --sha256 "${QWENPAW_JRE_SHA256:-}" \
    --java-release "${QWENPAW_JAVA_RELEASE:-}"
echo ""

echo "== Staging bundled NeqSim MCP Server JAR =="
"$PYTHON_BIN" "${REPO_ROOT}/scripts/pack-tauri/stage_neqsim.py" \
    --dest "${BINARIES_DIR}/neqsim" \
    --sha256 "${QWENPAW_NEQSIM_SHA256:-}"
echo ""

echo "== Verifying bundled NeqSim MCP Server =="
"$PYTHON_BIN" "${REPO_ROOT}/scripts/pack-tauri/smoke_neqsim.py" \
    --resource-dir "${BINARIES_DIR}"
echo ""

echo "== Building Computer Use helper =="
if ! command -v cargo >/dev/null 2>&1 || ! command -v rustc >/dev/null 2>&1; then
    echo "ERROR: Rust toolchain is required to build qwenpaw-computer-use-helper" >&2
    exit 1
fi
cargo build --manifest-path "${REPO_ROOT}/console/src-tauri/Cargo.toml" \
    --release --bin qwenpaw-computer-use-helper
CARGO_TARGET_ROOT="${CARGO_TARGET_DIR:-${REPO_ROOT}/console/src-tauri/target}"
if [[ "${CARGO_TARGET_ROOT}" != /* ]]; then
    CARGO_TARGET_ROOT="${REPO_ROOT}/${CARGO_TARGET_ROOT}"
fi
COMPUTER_USE_HELPER="${CARGO_TARGET_ROOT}/release/qwenpaw-computer-use-helper"
if [ ! -x "${COMPUTER_USE_HELPER}" ]; then
    echo "ERROR: Computer Use helper executable not found at ${COMPUTER_USE_HELPER}" >&2
    exit 1
fi
if [ "$LAYERED_DESKTOP" = true ]; then
    COMPUTER_USE_DEST="${BINARIES_DIR}/tools/computer-use/${VERSION}/qwenpaw-computer-use-helper"
else
    RUST_TARGET_TRIPLE=$(rustc --print host-tuple)
    case "${RUST_TARGET_TRIPLE}" in
        *-apple-darwin)
            COMPUTER_USE_DEST="${BINARIES_DIR}/qwenpaw-computer-use-helper-${RUST_TARGET_TRIPLE}"
            ;;
        *-windows-*)
            COMPUTER_USE_DEST="${BINARIES_DIR}/qwenpaw-computer-use-helper-${RUST_TARGET_TRIPLE}.exe"
            ;;
        *)
            echo "ERROR: unsupported desktop helper target ${RUST_TARGET_TRIPLE}" >&2
            exit 1
            ;;
    esac
    # Tauri's externalBin convention consumes the target-suffixed source and
    # installs it next to the desktop executable without the suffix.
fi
mkdir -p "$(dirname "${COMPUTER_USE_DEST}")"
cp "${COMPUTER_USE_HELPER}" "${COMPUTER_USE_DEST}"
chmod +x "${COMPUTER_USE_DEST}"
echo "Computer Use helper staged: ${COMPUTER_USE_DEST}"
echo ""

if [ "$LAYERED_DESKTOP" = true ]; then
    echo "== Assembling independently versioned desktop layers =="
    install_python_packages \
        "build>=1.2,<2" "setuptools>=42" "wheel>=0.46,<1"
    "$PYTHON_BIN" "${REPO_ROOT}/scripts/pack-tauri/build_python_layers.py" \
        --repo "${REPO_ROOT}" \
        --host-python "${PYTHON_BIN}" \
        --runtime-python "${NATIVE_HOST_PYTHON}" \
        --output "${BINARIES_DIR}" \
        --version "${VERSION}"

    rm -rf "${BINARIES_DIR}/qwenpaw-backend"
    "$PYTHON_BIN" "${REPO_ROOT}/scripts/pack-tauri/assemble_desktop_layout.py" \
        --binaries "${BINARIES_DIR}" \
        --version "${VERSION}" \
        --target macos-aarch64
    DEPENDENCY_PATH=$("$PYTHON_BIN" -c 'import json,sys; print(json.load(open(sys.argv[1], encoding="utf-8"))["components"]["python-packages"]["path"])' "${BINARIES_DIR}/state/active.json")
    RUNTIME_PATH=$("$PYTHON_BIN" -c 'import json,sys; print(json.load(open(sys.argv[1], encoding="utf-8"))["components"]["python-runtime"]["path"])' "${BINARIES_DIR}/state/active.json")
    case "$DEPENDENCY_PATH:$RUNTIME_PATH" in
        binaries/*:binaries/*) ;;
        *) echo "ERROR: invalid layered Python component paths" >&2; exit 1 ;;
    esac
    PYTHONPATH="${REPO_ROOT}/console/src-tauri/${DEPENDENCY_PATH}" \
        "${REPO_ROOT}/console/src-tauri/${RUNTIME_PATH}/python/bin/python3" \
        "${REPO_ROOT}/plugins/bundle/chrome/assets/scripts/nm_host.py" \
        --check-runtime
    echo "Layered desktop layout assembled"
    echo ""
fi

echo "========================================="
echo "Desktop Backend Build Complete!"
echo "========================================="
echo "Output:"
if [ "$LAYERED_DESKTOP" = true ]; then
    echo "  Layered resources: ${BINARIES_DIR}"
else
    echo "  Bundle: ${BACKEND_DIR}"
    echo "  Tauri resource: ${DEST}"
fi
echo ""
