# Build frontend bundles for all bundled plugins that have a ui/ directory.
#
# This MUST run before PyInstaller packaging so that plugin JS bundles
# (e.g. plugins/bundle/ugsci/ui/dist/index.js) are present in the
# final desktop app. Without them, plugins appear "loaded" in the
# backend but their custom UI (expert center, skill center, etc.)
# silently fails to render.
#
# Usage:
#   powershell ./scripts/pack-tauri/build_plugin_uis.ps1

$ErrorActionPreference = "Stop"
$REPO_ROOT = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$BUNDLE_DIR = Join-Path $REPO_ROOT "plugins\bundle"

if (-not (Test-Path $BUNDLE_DIR)) {
    Write-Host "[build_plugin_uis] No plugins/bundle/ directory found; skipping."
    exit 0
}

Write-Host "[build_plugin_uis] Building plugin frontend bundles..."

$built = 0
$skipped = 0

Get-ChildItem -Path $BUNDLE_DIR -Directory | ForEach-Object {
    $pluginName = $_.Name
    $uiDir = Join-Path $_.FullName "ui"

    # Skip if no ui/ directory
    if (-not (Test-Path $uiDir)) {
        return
    }

    # Skip if no package.json
    $pkgJson = Join-Path $uiDir "package.json"
    if (-not (Test-Path $pkgJson)) {
        Write-Host "  - ${pluginName}: no ui/package.json, skipping"
        $script:skipped++
        return
    }

    Write-Host "  - ${pluginName}: building..."
    Push-Location $uiDir
    try {
        npm ci 2>$null
        if ($LASTEXITCODE -ne 0) {
            npm install
        }
        npm run build
        if ($LASTEXITCODE -ne 0) {
            throw "Build failed for $pluginName"
        }
    }
    finally {
        Pop-Location
    }

    # Verify the output exists
    $distJs = Join-Path $uiDir "dist\index.js"
    if (-not (Test-Path $distJs)) {
        Write-Host "  - ${pluginName}: ERROR - dist/index.js not found after build!"
        exit 1
    }

    $size = (Get-Item $distJs).Length / 1KB
    Write-Host "  - ${pluginName}: built ($([math]::Round($size, 1)) KB)"
    $script:built++

    # Sync dist/ to src/qwenpaw/plugins_bundle/ (PyInstaller bundles from
    # both locations; the src/ copy must also have the dist files).
    $srcUiDir = Join-Path $REPO_ROOT "src\qwenpaw\plugins_bundle\$pluginName\ui"
    if (Test-Path $srcUiDir) {
        $srcDistDir = Join-Path $srcUiDir "dist"
        if (-not (Test-Path $srcDistDir)) {
            New-Item -ItemType Directory -Force -Path $srcDistDir | Out-Null
        }
        Copy-Item -Path (Join-Path $uiDir "dist\*") -Destination $srcDistDir -Recurse -Force
    }
}

Write-Host "[build_plugin_uis] Done: $built built, $skipped skipped."
