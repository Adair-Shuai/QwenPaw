# Build QwenPaw backend with PyInstaller for Tauri sidecar (Windows)
# Creates an onedir backend bundle with embedded Python runtime
#
# Usage:
#   powershell ./scripts/pack-tauri/build_pyinstaller.ps1
#
# Prerequisites:
#   - Python 3.10+ with virtual environment
#   - PyInstaller 6.0+ (will be installed if not present)

param()

$ErrorActionPreference = "Stop"
$REPO_ROOT = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $REPO_ROOT

$DIST = if ($env:DIST) { $env:DIST } else { "dist" }
if (-not [System.IO.Path]::IsPathRooted($DIST)) {
    $DIST = Join-Path $REPO_ROOT $DIST
}
$VERSION_FILE = "src\qwenpaw\__version__.py"
$LAYERED_DESKTOP = $env:QWENPAW_LAYERED_DESKTOP -match "^(1|true|yes)$"

# Extract version
if (Test-Path $VERSION_FILE) {
    $content = Get-Content $VERSION_FILE -Raw
    if ($content -match '__version__\s*=\s*"([^"]+)"') {
        $VERSION = $Matches[1]
    } else {
        throw "Failed to extract version from $VERSION_FILE"
    }
} else {
    throw "Version file not found: $VERSION_FILE"
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "QwenPaw PyInstaller Build - Windows" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Version: $VERSION"
Write-Host "Repository: $REPO_ROOT"
Write-Host ""

# Check prerequisites
Write-Host "== Checking prerequisites ==" -ForegroundColor Yellow

$UV_BIN = (Get-Command uv -ErrorAction SilentlyContinue).Source
$PYTHON_BIN = Join-Path $REPO_ROOT ".venv\Scripts\python.exe"
if (-not (Test-Path $PYTHON_BIN)) {
    if ($UV_BIN) {
        Write-Host ".venv not found, creating virtual environment with uv" -ForegroundColor Yellow
        & $UV_BIN venv "$REPO_ROOT\.venv"
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to create virtual environment with uv"
        }
    } else {
        Write-Host ".venv not found, using system Python" -ForegroundColor Yellow
        $PYTHON_BIN = (Get-Command python -ErrorAction SilentlyContinue).Source
    }
    if (-not $PYTHON_BIN -or -not (Test-Path $PYTHON_BIN)) {
        Write-Host "ERROR: Python not found in .venv or PATH" -ForegroundColor Red
        Write-Host "Please create virtual environment first: python -m venv .venv"
        exit 1
    }
}

$pythonVersion = & $PYTHON_BIN --version
Write-Host "Python: $pythonVersion" -ForegroundColor Green

function Test-PythonImport {
    param([string]$Statement)
    $previousErrorActionPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = "Continue"
        & $PYTHON_BIN -c $Statement *> $null
        return $LASTEXITCODE -eq 0
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }
}

function Assert-LastExit {
    param([string]$Message)
    if ($LASTEXITCODE -ne 0) { throw $Message }
}

function Install-PythonPackages {
    param([string[]]$Packages)
    if ($UV_BIN) {
        & $UV_BIN pip install --python $PYTHON_BIN @Packages
    } else {
        & $PYTHON_BIN -m pip install @Packages
    }
    Assert-LastExit "Failed to install Python packages: $($Packages -join ', ')"
}

function Uninstall-PythonPackage {
    param([string]$Package)
    $previousErrorActionPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = "Continue"
        if ($UV_BIN) {
            & $UV_BIN pip uninstall --python $PYTHON_BIN -y $Package *> $null
        } else {
            & $PYTHON_BIN -m pip uninstall -y $Package *> $null
        }
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }
}

if (-not $LAYERED_DESKTOP) {
# Install PyInstaller if not present
Write-Host "== Installing PyInstaller ==" -ForegroundColor Yellow
if (Test-PythonImport "import PyInstaller") {
    Write-Host "PyInstaller already installed" -ForegroundColor Green
} else {
    Write-Host "Installing PyInstaller..."
    Install-PythonPackages -Packages @("pyinstaller>=6.0.0")
    Write-Host "PyInstaller installed" -ForegroundColor Green
}

# Install python-dotenv if not present (required by PyInstaller collect_submodules)
if (Test-PythonImport "import dotenv") {
    Write-Host "python-dotenv already installed" -ForegroundColor Green
} else {
    Write-Host "Installing python-dotenv..."
    Install-PythonPackages -Packages @("python-dotenv")
    Write-Host "python-dotenv installed" -ForegroundColor Green
}

Write-Host ""

# Install the default desktop dependency set. Whisper/Torch is an optional
# component and is installed into the user-writable runtime on demand. Set
# QWENPAW_INCLUDE_WHISPER=1 for an offline/full build.
Write-Host "== Installing project dependencies ==" -ForegroundColor Yellow
# Pin setuptools <82: lark-oapi still calls pkg_resources.declare_namespace
# at import time. A *fresh* install of setuptools >= 82 removes pkg_resources
# wholesale, so lark-oapi's except-ImportError fallback (pkgutil.extend_path)
# kicks in and the import works. The proven failure mode is an *in-place*
# upgrade of a legacy setuptools (seen on the macOS CI runners, and possible
# in any environment upgrading an existing install): it can leave a
# half-removed pkg_resources (module present, declare_namespace gone), which
# raises an AttributeError the fallback does not catch — crashing the Feishu
# channel. The pin keeps every environment in the known-good state.
if ($env:QWENPAW_INCLUDE_WHISPER -match "^(1|true|yes)$") {
    Install-PythonPackages -Packages @("-e", ".[full]", "setuptools<82")
    Write-Host "Project dependencies installed with Whisper/Torch" -ForegroundColor Green
} else {
    Install-PythonPackages -Packages @("-e", ".[local,codex,qoder]", "setuptools<82")
    Write-Host "Project dependencies installed without optional Whisper/Torch" -ForegroundColor Green
}

# Fix agent-client-protocol namespace collision
# PyPI has an empty 'acp' stub that shadows the real package
if (-not (Test-PythonImport "from acp import Agent")) {
    Write-Host "Fixing agent-client-protocol namespace..."
    Uninstall-PythonPackage "acp"
    Install-PythonPackages -Packages @("agent-client-protocol>=0.9.0,<0.11.0")
    Write-Host "agent-client-protocol installed" -ForegroundColor Green
}

# Run PyInstaller
Write-Host "== Running PyInstaller ==" -ForegroundColor Yellow
Write-Host "Building onedir backend bundle..."

$SPEC_FILE = Join-Path $REPO_ROOT "scripts\pack-tauri\qwenpaw.spec"
if (-not (Test-Path $SPEC_FILE)) {
    Write-Host "ERROR: Spec file not found at $SPEC_FILE" -ForegroundColor Red
    exit 1
}

& $PYTHON_BIN -m PyInstaller $SPEC_FILE `
    --distpath "${DIST}\pyinstaller" `
    --workpath "${DIST}\pyinstaller-build" `
    --clean `
    --noconfirm

if ($LASTEXITCODE -ne 0) {
    throw "PyInstaller build failed"
}

Write-Host "PyInstaller build complete" -ForegroundColor Green
Write-Host ""

# Verify output
$BACKEND_DIR = Join-Path $DIST "pyinstaller\qwenpaw-backend"
$BACKEND_EXE = Join-Path $BACKEND_DIR "qwenpaw-backend.exe"
$CLI_EXE = Join-Path $BACKEND_DIR "qwenpaw.exe"
$MODEL_CATALOG = Join-Path $BACKEND_DIR `
    "_internal\qwenpaw\providers\data\model_catalog.json"
if (-not (Test-Path $BACKEND_DIR)) {
    Write-Host "ERROR: Backend bundle directory not found at $BACKEND_DIR" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path $BACKEND_EXE)) {
    Write-Host "ERROR: Backend executable not found at $BACKEND_EXE" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path $CLI_EXE)) {
    Write-Host "ERROR: CLI executable not found at $CLI_EXE" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path $MODEL_CATALOG)) {
    Write-Host "ERROR: Model catalog not found at $MODEL_CATALOG" `
        -ForegroundColor Red
    exit 1
}

Write-Host "== Pruning build-only files from backend bundle ==" -ForegroundColor Yellow
$MAX_BACKEND_MB = if ($env:QWENPAW_MAX_BACKEND_MB) { $env:QWENPAW_MAX_BACKEND_MB } else { "1800" }
& $PYTHON_BIN (Join-Path $REPO_ROOT "scripts\pack-tauri\prune_desktop_bundle.py") `
    $BACKEND_DIR `
    --max-size-mb $MAX_BACKEND_MB
Assert-LastExit "Failed to prune or validate backend bundle"

Write-Host "Backend bundle created: $BACKEND_DIR" -ForegroundColor Green

# Get size
$bundleSize = (Get-ChildItem $BACKEND_DIR -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "Bundle size: $([math]::Round($bundleSize, 2)) MB"
Write-Host ""

# Copy to Tauri resources directory
Write-Host "== Copying to Tauri binaries directory ==" -ForegroundColor Yellow
$BINARIES_DIR = Join-Path $REPO_ROOT "console\src-tauri\binaries"
New-Item -ItemType Directory -Force -Path $BINARIES_DIR | Out-Null

$DEST = Join-Path $BINARIES_DIR "qwenpaw-backend"
New-Item -ItemType Directory -Force -Path $DEST | Out-Null
Get-ChildItem -LiteralPath $DEST -Force | Remove-Item -Recurse -Force
& $PYTHON_BIN (Join-Path $REPO_ROOT "scripts\pack-tauri\copy_windows_tree.py") `
    --source $BACKEND_DIR --destination $DEST
Assert-LastExit "Failed to copy layered backend into Tauri resources"
Write-Host "Copied to: $DEST" -ForegroundColor Green
Write-Host ""
} else {
    Write-Host "== Layered desktop mode: skipping PyInstaller and legacy dependency install ==" -ForegroundColor Yellow
    $BINARIES_DIR = Join-Path $REPO_ROOT "console\src-tauri\binaries"
    $DEST = Join-Path $BINARIES_DIR "qwenpaw-backend"
    New-Item -ItemType Directory -Force -Path $BINARIES_DIR | Out-Null
}

# Stage a standalone CPython (same X.Y/arch as this build's interpreter) so the
# frozen backend can install third-party plugin dependencies at runtime.
Write-Host "== Staging bundled Python runtime ==" -ForegroundColor Yellow
& $PYTHON_BIN (Join-Path $REPO_ROOT "scripts\pack-tauri\stage_python_runtime.py") `
    --dest (Join-Path $BINARIES_DIR "python-runtime")
Assert-LastExit "Failed to stage bundled Python runtime"

# The Chrome Native Messaging host runs under this standalone interpreter,
# outside the PyInstaller backend, so its dependencies must be installed here.
$NATIVE_HOST_PYTHON = Join-Path $BINARIES_DIR "python-runtime\python\python.exe"
if (-not $LAYERED_DESKTOP) {
    $NATIVE_HOST_REQUIREMENTS = Join-Path $REPO_ROOT "scripts\pack-tauri\native-host-requirements.txt"
    & $NATIVE_HOST_PYTHON -m pip install `
        --disable-pip-version-check `
        --no-input `
        --no-deps `
        --only-binary=:all: `
        -r $NATIVE_HOST_REQUIREMENTS
    Assert-LastExit "Failed to install Chrome Native Messaging host dependencies"
    & $NATIVE_HOST_PYTHON `
        (Join-Path $REPO_ROOT "plugins\bundle\chrome\assets\scripts\nm_host.py") `
        --check-runtime
    Assert-LastExit "Bundled Python runtime cannot run the Native Messaging host"
}
Write-Host ""

# Pre-install common + petroleum domain Python libraries into the bundled
# runtime so users without Python can handle files and domain calculations
# without waiting for a pip download on first use.
$PY_RUNTIME_BIN = Join-Path $BINARIES_DIR "python-runtime\python\python.exe"
if (-not $LAYERED_DESKTOP) {
    Write-Host "== Installing common + petroleum domain packages into bundled runtime ==" -ForegroundColor Yellow
    & $PY_RUNTIME_BIN -m pip install `
        --disable-pip-version-check `
        --no-input `
        numpy pandas scipy matplotlib requests openpyxl python-docx python-pptx Pillow `
        lasio welly bruges simpeg dlisio xtgeo pvtlib
    Assert-LastExit "Failed to install common + petroleum domain packages"
    Write-Host "Common + petroleum domain packages installed" -ForegroundColor Green
}
Write-Host ""

Write-Host "== Staging bundled Node runtime ==" -ForegroundColor Yellow
$NODE_RUNTIME_ARGS = @(
    "--dest", (Join-Path $BINARIES_DIR "node-runtime")
)
if ($env:QWENPAW_NODE_SHA256) {
    $NODE_RUNTIME_ARGS += @("--sha256", $env:QWENPAW_NODE_SHA256)
}
& $PYTHON_BIN (Join-Path $REPO_ROOT "scripts\pack-tauri\stage_node_runtime.py") `
    @NODE_RUNTIME_ARGS
Assert-LastExit "Failed to stage bundled Node runtime"
Write-Host ""

Write-Host "== Staging bundled OfficeCLI ==" -ForegroundColor Yellow
$OFFICECLI_DOC_PLUGIN_ARG = @()
if ($env:QWENPAW_OFFICECLI_DOC_PLUGIN) {
    $OFFICECLI_DOC_PLUGIN_ARG = @("--doc-plugin", $env:QWENPAW_OFFICECLI_DOC_PLUGIN)
}
& $PYTHON_BIN (Join-Path $REPO_ROOT "scripts\pack-tauri\stage_officecli.py") `
    --dest (Join-Path $BINARIES_DIR "officecli") `
    @OFFICECLI_DOC_PLUGIN_ARG
Assert-LastExit "Failed to stage bundled OfficeCLI"
Write-Host ""

Write-Host "== Staging bundled Java runtime (NeqSim MCP Server) ==" -ForegroundColor Yellow
$JRE_ARGS = @(
    "--dest", (Join-Path $BINARIES_DIR "java-runtime")
)
if ($env:QWENPAW_JRE_SHA256) {
    $JRE_ARGS += @("--sha256", $env:QWENPAW_JRE_SHA256)
}
if ($env:QWENPAW_JAVA_RELEASE) {
    $JRE_ARGS += @("--java-release", $env:QWENPAW_JAVA_RELEASE)
}
& $PYTHON_BIN (Join-Path $REPO_ROOT "scripts\pack-tauri\stage_jre.py") `
    @JRE_ARGS
Assert-LastExit "Failed to stage bundled Java runtime"
Write-Host ""

Write-Host "== Staging bundled NeqSim MCP Server JAR ==" -ForegroundColor Yellow
$NEQSIM_ARGS = @(
    "--dest", (Join-Path $BINARIES_DIR "neqsim")
)
if ($env:QWENPAW_NEQSIM_SHA256) {
    $NEQSIM_ARGS += @("--sha256", $env:QWENPAW_NEQSIM_SHA256)
}
& $PYTHON_BIN (Join-Path $REPO_ROOT "scripts\pack-tauri\stage_neqsim.py") `
    @NEQSIM_ARGS
Assert-LastExit "Failed to stage NeqSim MCP Server JAR"
Write-Host ""

Write-Host "== Verifying bundled NeqSim MCP Server ==" -ForegroundColor Yellow
& $PYTHON_BIN (Join-Path $REPO_ROOT "scripts\pack-tauri\smoke_neqsim.py") `
    --resource-dir $BINARIES_DIR
Assert-LastExit "Bundled NeqSim MCP Server smoke test failed"
Write-Host ""

Write-Host "== Building Computer Use helper ==" -ForegroundColor Yellow
$CARGO_BIN = (Get-Command cargo -ErrorAction SilentlyContinue).Source
if (-not $CARGO_BIN) {
    throw "cargo not found; Rust toolchain is required to build qwenpaw-computer-use-helper"
}
$TAURI_DIR = Join-Path $REPO_ROOT "console\src-tauri"
Push-Location $TAURI_DIR
try {
    & $CARGO_BIN build --release --bin qwenpaw-computer-use-helper
    Assert-LastExit "Failed to build qwenpaw-computer-use-helper"
} finally {
    Pop-Location
}
$TARGET_DIR = if ($env:CARGO_TARGET_DIR) { $env:CARGO_TARGET_DIR } else { Join-Path $TAURI_DIR "target" }
if (-not [System.IO.Path]::IsPathRooted($TARGET_DIR)) {
    $TARGET_DIR = Join-Path $TAURI_DIR $TARGET_DIR
}
$COMPUTER_USE_HELPER_EXE = Join-Path $TARGET_DIR "release\qwenpaw-computer-use-helper.exe"
if (-not (Test-Path $COMPUTER_USE_HELPER_EXE)) {
    throw "Computer Use helper executable not found at $COMPUTER_USE_HELPER_EXE"
}
$COMPUTER_USE_HELPER_DEST = if ($LAYERED_DESKTOP) {
    $computerUseLayer = Join-Path $BINARIES_DIR "tools\computer-use\$VERSION"
    New-Item -ItemType Directory -Path $computerUseLayer -Force | Out-Null
    Join-Path $computerUseLayer "qwenpaw-computer-use-helper.exe"
} else {
    Join-Path $DEST "qwenpaw-computer-use-helper.exe"
}
Copy-Item -Force $COMPUTER_USE_HELPER_EXE $COMPUTER_USE_HELPER_DEST
Write-Host "Computer Use helper staged: $COMPUTER_USE_HELPER_DEST" -ForegroundColor Green
Write-Host ""

if ($LAYERED_DESKTOP) {
    Write-Host "== Building versioned Python backend and dependency layers ==" -ForegroundColor Yellow
    Install-PythonPackages -Packages @(
        "build>=1.2,<2",
        "setuptools>=42",
        "wheel>=0.46,<1"
    )
    & $PYTHON_BIN (Join-Path $REPO_ROOT "scripts\pack-tauri\build_python_layers.py") `
        --repo $REPO_ROOT `
        --host-python $PYTHON_BIN `
        --runtime-python $PY_RUNTIME_BIN `
        --output $BINARIES_DIR `
        --version $VERSION
    Assert-LastExit "Failed to build layered Python backend"

    # Layered builds never create the legacy frozen backend. Remove a stale
    # tree left by an earlier local build so it cannot leak into the package.
    if (Test-Path -LiteralPath $DEST) {
        Remove-Item -LiteralPath $DEST -Recurse -Force
    }
    & (Join-Path $REPO_ROOT "scripts\pack-tauri\build_windows_cli_launcher.ps1") `
        -BinariesDir $BINARIES_DIR
    Assert-LastExit "Failed to build QwenPaw CLI launchers"
    & $PYTHON_BIN (Join-Path $REPO_ROOT "scripts\pack-tauri\assemble_desktop_layout.py") `
        --binaries $BINARIES_DIR `
        --version $VERSION `
        --target windows-x86_64
    Assert-LastExit "Failed to assemble versioned desktop runtime layout"
    $previousPythonPath = $env:PYTHONPATH
    try {
        $activeLayout = Get-Content (Join-Path $BINARIES_DIR 'state\active.json') -Raw | ConvertFrom-Json
        $dependencyRelativePath = $activeLayout.components.'python-packages'.path
        $runtimeRelativePath = $activeLayout.components.'python-runtime'.path
        foreach ($relativePath in @($dependencyRelativePath, $runtimeRelativePath)) {
            if (-not $relativePath -or [System.IO.Path]::IsPathRooted($relativePath)) {
                throw "Layered Python component path is invalid: $relativePath"
            }
        }
        $tauriResourceRoot = Join-Path $REPO_ROOT 'console\src-tauri'
        $env:PYTHONPATH = Join-Path $tauriResourceRoot $dependencyRelativePath
        $layeredPython = Join-Path `
            (Join-Path $tauriResourceRoot $runtimeRelativePath) `
            'python\python.exe'
        & $layeredPython `
            (Join-Path $REPO_ROOT "plugins\bundle\chrome\assets\scripts\nm_host.py") `
            --check-runtime
        Assert-LastExit "Layered Python dependencies cannot run the Native Messaging host"
    } finally {
        $env:PYTHONPATH = $previousPythonPath
    }
    Write-Host "Layered desktop runtime assembled; frozen backend removed from shipping resources" -ForegroundColor Green
    Write-Host ""
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Desktop Backend Build Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Output:"
if ($LAYERED_DESKTOP) {
    Write-Host "  Layered resources: $BINARIES_DIR"
} else {
    Write-Host "  Bundle: $BACKEND_DIR"
    Write-Host "  Tauri resource: $DEST"
}
Write-Host ""
