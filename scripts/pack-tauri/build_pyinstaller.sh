#!/usr/bin/env bash
# Build UGSci backend with PyInstaller for Tauri sidecar
# Creates an onedir backend bundle with embedded Python runtime
#
# Usage:
#   ./scripts/pack-tauri/build_pyinstaller.sh
#
# Prerequisites:
#   - Python 3.10+ with virtual environment
#   - PyInstaller 6.0+ (will be installed if not present)

set -e

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"

DIST="${DIST:-dist}"
VERSION=$(sed -n 's/^__version__[[:space:]]*=[[:space:]]*"\([^"]*\)".*/\1/p' src/qwenpaw/__version__.py)
LAYERED_DESKTOP=false
if [[ "${QWENPAW_LAYERED_DESKTOP:-}" =~ ^(1|true|yes)$ ]]; then
    LAYERED_DESKTOP=true
fi

echo "========================================="
echo "UGSci PyInstaller Build"
echo "========================================="
echo "Version: ${VERSION}"
echo "Repository: ${REPO_ROOT}"
echo ""

# Check prerequisites
echo "== Checking prerequisites =="

# Create venv if missing (prefer uv if available)
PYTHON_BIN="${REPO_ROOT}/.venv/bin/python"
if [ ! -f "$PYTHON_BIN" ]; then
    if command -v uv &>/dev/null; then
        echo "Creating virtual environment with uv..."
        uv venv "${REPO_ROOT}/.venv"
    else
        echo "ERROR: Python not found in .venv"
        echo "Please create virtual environment first: python -m venv .venv"
        exit 1
    fi
fi

echo "Python: $("$PYTHON_BIN" --version)"

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

# Install the default desktop dependency set. Whisper/Torch is an optional
# component and is installed into the user-writable runtime on demand. Set
# QWENPAW_INCLUDE_WHISPER=1 for an offline/full build.
echo "== Installing project dependencies =="
if [[ "${QWENPAW_INCLUDE_WHISPER:-}" =~ ^(1|true|yes)$ ]]; then
    install_python_packages -e ".[full]"
    echo "Project dependencies installed with Whisper/Torch"
else
    install_python_packages -e ".[local,codex,qoder]"
    echo "Project dependencies installed without optional Whisper/Torch"
fi

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

echo "== Pruning build-only files from backend bundle =="
python3 "${REPO_ROOT}/scripts/pack-tauri/prune_desktop_bundle.py" \
    "${BACKEND_DIR}" \
    --max-size-mb "${QWENPAW_MAX_BACKEND_MB:-1800}"

echo "Backend bundle created: ${BACKEND_DIR}"

# Get size
SIZE=$(du -sh "${BACKEND_DIR}" | cut -f1)
echo "Bundle size: ${SIZE}"
echo ""

# Copy to Tauri resources directory
echo "== Copying to Tauri binaries directory =="
BINARIES_DIR="${REPO_ROOT}/console/src-tauri/binaries"
mkdir -p "${BINARIES_DIR}"

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
    BINARIES_DIR="${REPO_ROOT}/console/src-tauri/binaries"
    DEST="${BINARIES_DIR}/qwenpaw-backend"
    mkdir -p "${BINARIES_DIR}"
fi

# Stage a standalone CPython (same X.Y/arch as this build's interpreter) so the
# frozen backend can install third-party plugin dependencies at runtime.
echo "== Staging bundled Python runtime =="
"$PYTHON_BIN" "${REPO_ROOT}/scripts/pack-tauri/stage_python_runtime.py" \
    --dest "${BINARIES_DIR}/python-runtime"

# The Chrome Native Messaging host runs under this standalone interpreter,
# outside the PyInstaller backend, so its dependencies must be installed here.
NATIVE_HOST_PYTHON="${BINARIES_DIR}/python-runtime/python/bin/python3"
if [ ! -x "$NATIVE_HOST_PYTHON" ]; then
    NATIVE_HOST_PYTHON="${BINARIES_DIR}/python-runtime/python/bin/python"
fi
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

# Pre-install common Python libraries into the bundled runtime so users on
# machines without Python can handle files (Excel/Word/PPT/images/data
# processing) without waiting for a pip download on first use.
PY_RUNTIME_BIN="${BINARIES_DIR}/python-runtime/python/bin/python3"
if [ ! -f "$PY_RUNTIME_BIN" ]; then
    PY_RUNTIME_BIN="${BINARIES_DIR}/python-runtime/python/bin/python"
fi
if [ "$LAYERED_DESKTOP" = false ]; then
    echo "== Installing common Python packages into bundled runtime =="
    PIP_INDEX_URL="${PIP_INDEX_URL:-https://pypi.tuna.tsinghua.edu.cn/simple/}"
    PIP_EXTRA_INDEX_URL="${PIP_EXTRA_INDEX_URL:-https://pypi.org/simple/}"
    echo "Using PyPI mirror: ${PIP_INDEX_URL} (extra: ${PIP_EXTRA_INDEX_URL})"
    "$PY_RUNTIME_BIN" -m pip install \
        --disable-pip-version-check \
        --no-input \
        --index-url "$PIP_INDEX_URL" \
        --extra-index-url "$PIP_EXTRA_INDEX_URL" \
        numpy pandas scipy matplotlib requests openpyxl python-docx python-pptx Pillow \
        lasio welly bruges simpeg dlisio xtgeo pvtlib
    echo "Common + petroleum domain packages installed"
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
    --dest "${BINARIES_DIR}/neqsim"
echo ""

if [ "$LAYERED_DESKTOP" = true ]; then
    echo "== Assembling independently versioned desktop layers =="
    install_python_packages "build>=1.2,<2"
    RUNTIME_PYTHON="${BINARIES_DIR}/python-runtime/python/bin/python3"
    if [ ! -x "${RUNTIME_PYTHON}" ]; then
        RUNTIME_PYTHON="${BINARIES_DIR}/python-runtime/python/bin/python"
    fi
    "$PYTHON_BIN" "${REPO_ROOT}/scripts/pack-tauri/build_python_layers.py" \
        --repo "${REPO_ROOT}" \
        --host-python "${PYTHON_BIN}" \
        --runtime-python "${RUNTIME_PYTHON}" \
        --output "${BINARIES_DIR}" \
        --version "${VERSION}"

    echo "Building versioned Computer Use helper..."
    cargo build --manifest-path "${REPO_ROOT}/console/src-tauri/Cargo.toml" \
        --release --bin qwenpaw-computer-use-helper
    COMPUTER_USE_LAYER="${BINARIES_DIR}/tools/computer-use/${VERSION}"
    mkdir -p "${COMPUTER_USE_LAYER}"
    cp "${REPO_ROOT}/console/src-tauri/target/release/qwenpaw-computer-use-helper" \
        "${COMPUTER_USE_LAYER}/qwenpaw-computer-use-helper"
    chmod +x "${COMPUTER_USE_LAYER}/qwenpaw-computer-use-helper"

    # Layered builds never create the legacy frozen backend. Remove a stale
    # tree left by an earlier local build so it cannot leak into the package.
    rm -rf "${BINARIES_DIR}/qwenpaw-backend"
    "$PYTHON_BIN" "${REPO_ROOT}/scripts/pack-tauri/assemble_desktop_layout.py" \
        --binaries "${BINARIES_DIR}" \
        --version "${VERSION}"
    DEPENDENCY_PATH=$("$PYTHON_BIN" -c 'import json,sys; print(json.load(open(sys.argv[1], encoding="utf-8"))["components"]["python-packages"]["path"])' "${BINARIES_DIR}/state/active.json")
    case "$DEPENDENCY_PATH" in
        binaries/*) ;;
        *) echo "ERROR: invalid layered Python dependency path: ${DEPENDENCY_PATH}" >&2; exit 1 ;;
    esac
    PYTHONPATH="${REPO_ROOT}/console/src-tauri/${DEPENDENCY_PATH}" \
        "$NATIVE_HOST_PYTHON" \
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
