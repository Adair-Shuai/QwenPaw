# Stage the self-contained Python backend for Tauri (Windows).
#
# Windows deliberately runs QwenPaw from the bundled standalone CPython
# instead of freezing a second copy of Python and all dependencies with
# PyInstaller. This keeps the desktop app zero-install while avoiding two
# copies of large packages such as numpy, Pillow and python-docx.
#
# Usage:
#   powershell ./scripts/pack-tauri/build_pyinstaller.ps1
#
# Prerequisites:
#   - Python 3.11+ with a virtual environment (used to stage the runtime)

param()

$ErrorActionPreference = "Stop"
$REPO_ROOT = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $REPO_ROOT

$DIST = if ($env:DIST) { $env:DIST } else { "dist" }
if (-not [System.IO.Path]::IsPathRooted($DIST)) {
    $DIST = Join-Path $REPO_ROOT $DIST
}
$VERSION_FILE = "src\qwenpaw\__version__.py"

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
Write-Host "UGSci Bundled Python Build - Windows" -ForegroundColor Cyan
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

function Assert-LastExit {
    param([string]$Message)
    if ($LASTEXITCODE -ne 0) { throw $Message }
}

# Tauri's shared macOS/Windows config still declares qwenpaw-backend as a
# resource. Keep only a tiny marker on Windows so a stale PyInstaller bundle
# can never be included accidentally.
$BINARIES_DIR = Join-Path $REPO_ROOT "console\src-tauri\binaries"
New-Item -ItemType Directory -Force -Path $BINARIES_DIR | Out-Null
$DEST = Join-Path $BINARIES_DIR "qwenpaw-backend"
New-Item -ItemType Directory -Force -Path $DEST | Out-Null
Get-ChildItem -LiteralPath $DEST -Force | Remove-Item -Recurse -Force
Set-Content -Path (Join-Path $DEST "README.txt") -Encoding UTF8 `
    -Value "Windows backend runs from binaries/python-runtime; no frozen duplicate."

# Stage a standalone CPython matching this build interpreter's X.Y/architecture.
# It runs the backend and can install third-party plugin dependencies at runtime.
Write-Host "== Staging bundled Python runtime ==" -ForegroundColor Yellow
$PYTHON_RUNTIME_DIR = Join-Path $BINARIES_DIR "python-runtime"
if (Test-Path $PYTHON_RUNTIME_DIR) {
    # A cached runtime may contain packages left by the former dual-runtime
    # layout. Recreate it so every release is reproducible and contains only
    # the dependency set installed below.
    Remove-Item -Recurse -Force $PYTHON_RUNTIME_DIR
}
& $PYTHON_BIN (Join-Path $REPO_ROOT "scripts\pack-tauri\stage_python_runtime.py") `
    --dest $PYTHON_RUNTIME_DIR
Assert-LastExit "Failed to stage bundled Python runtime"
Write-Host ""

# Install QwenPaw and the common data/document stack into this one interpreter.
# Passing the repository path (without -e) builds a normal wheel, so the
# installed app is self-contained and does not reference the checkout.
Write-Host "== Installing QwenPaw and common packages into bundled runtime ==" -ForegroundColor Yellow
$PyRuntimeBin = Join-Path $BINARIES_DIR "python-runtime\python\python.exe"
if (-not (Test-Path $PyRuntimeBin)) {
    throw "Bundled Python executable not found at $PyRuntimeBin"
}
$PipIndexUrl = if ($env:PIP_INDEX_URL) { $env:PIP_INDEX_URL } else { "https://pypi.tuna.tsinghua.edu.cn/simple/" }
$PipExtraIndexUrl = if ($env:PIP_EXTRA_INDEX_URL) { $env:PIP_EXTRA_INDEX_URL } else { "https://pypi.org/simple/" }
Write-Host "Using PyPI mirror: $PipIndexUrl (extra: $PipExtraIndexUrl)"
& $PyRuntimeBin -m pip install `
    --disable-pip-version-check `
    --no-input `
    --upgrade `
    --index-url $PipIndexUrl `
    --extra-index-url $PipExtraIndexUrl `
    ".[full]" `
    numpy pandas scipy matplotlib requests openpyxl python-pptx
Assert-LastExit "Failed to install QwenPaw into bundled Python"

# PyPI also contains an empty package named "acp"; it must not shadow
# agent-client-protocol's real acp namespace.
& $PyRuntimeBin -m pip uninstall -y acp *> $null
& $PyRuntimeBin -c "from acp import Agent; import qwenpaw, numpy, pandas, scipy, matplotlib, openpyxl, docx, pptx, PIL"
Assert-LastExit "Bundled Python import verification failed"

$ConsoleDist = Join-Path $REPO_ROOT "console\dist"
$InstalledPackage = (& $PyRuntimeBin -c "import pathlib, qwenpaw; print(pathlib.Path(qwenpaw.__file__).resolve().parent)").Trim()
Assert-LastExit "Failed to locate installed QwenPaw package"

# The source wheel's broad plugins_bundle/** package-data rule also picks up
# frontend node_modules. They are build inputs (and contain build-host native
# binaries), not runtime assets. Keep only each plugin's compiled ui/dist.
$InstalledPlugins = Join-Path $InstalledPackage "plugins_bundle"
if (-not (Test-Path $InstalledPlugins)) {
    throw "Bundled plugins are missing from installed QwenPaw package"
}
Get-ChildItem -LiteralPath $InstalledPlugins -Directory | ForEach-Object {
    $PluginUi = Join-Path $_.FullName "ui"
    if (Test-Path $PluginUi) {
        if (-not (Test-Path (Join-Path $PluginUi "dist\index.js"))) {
            throw "Compiled plugin UI is missing for $($_.Name)"
        }
        foreach ($BuildOnlyDir in @("node_modules", "src")) {
            $BuildOnlyPath = Join-Path $PluginUi $BuildOnlyDir
            if (Test-Path $BuildOnlyPath) {
                Remove-Item -Recurse -Force $BuildOnlyPath
            }
        }
    }
}
if (Get-ChildItem -LiteralPath $InstalledPlugins -Directory -Recurse |
    Where-Object { $_.Name -eq "node_modules" }) {
    throw "Build-only plugin node_modules remain in bundled Python"
}

if (-not (Test-Path (Join-Path $ConsoleDist "index.html"))) {
    throw "Console build output not found at $ConsoleDist"
}
$InstalledConsole = Join-Path $InstalledPackage "console"
if (Test-Path $InstalledConsole) {
    Remove-Item -Recurse -Force $InstalledConsole
}
Copy-Item -Recurse -Force $ConsoleDist $InstalledConsole
if (-not (Test-Path (Join-Path $InstalledConsole "index.html"))) {
    throw "Failed to stage console assets into bundled QwenPaw package"
}

$RuntimeScripts = Join-Path $BINARIES_DIR "python-runtime\python\Scripts"
$CliExe = Join-Path $RuntimeScripts "qwenpaw.exe"
if (-not (Test-Path $CliExe)) {
    throw "Bundled QwenPaw CLI not found at $CliExe"
}
$bundleSize = (Get-ChildItem (Join-Path $BINARIES_DIR "python-runtime") -Recurse -File |
    Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "Bundled Python is ready: $([math]::Round($bundleSize, 2)) MB" -ForegroundColor Green
Write-Host ""

Write-Host "== Staging bundled Node runtime ==" -ForegroundColor Yellow
& $PYTHON_BIN (Join-Path $REPO_ROOT "scripts\pack-tauri\stage_node_runtime.py") `
    --dest (Join-Path $BINARIES_DIR "node-runtime")
Assert-LastExit "Failed to stage bundled Node runtime"
Write-Host ""

Write-Host "== Staging bundled OfficeCLI ==" -ForegroundColor Yellow
& $PYTHON_BIN (Join-Path $REPO_ROOT "scripts\pack-tauri\stage_officecli.py") `
    --dest (Join-Path $BINARIES_DIR "officecli")
Assert-LastExit "Failed to stage bundled OfficeCLI"
Write-Host ""

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Bundled Python Build Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Output:"
Write-Host "  Python backend: $PyRuntimeBin -m qwenpaw.tauri.entry"
Write-Host "  CLI: $CliExe"
Write-Host ""
