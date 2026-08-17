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
$PLUGIN_STAGE_SCRIPT = Join-Path $PSScriptRoot "stage_bundled_plugins.py"

if (-not (Test-Path $PLUGIN_STAGE_SCRIPT)) {
    Write-Host "[build_plugin_uis] Plugin discovery script is missing; skipping."
    exit 0
}

Write-Host "[build_plugin_uis] Building plugin frontend bundles..."

function Sync-ChangedFiles {
    param(
        [Parameter(Mandatory = $true)][string]$Source,
        [Parameter(Mandatory = $true)][string]$Destination
    )

    foreach ($sourceFile in Get-ChildItem -LiteralPath $Source -Recurse -File) {
        $relative = [System.IO.Path]::GetRelativePath($Source, $sourceFile.FullName)
        $targetFile = Join-Path $Destination $relative
        $targetDir = Split-Path -Parent $targetFile
        if (-not (Test-Path -LiteralPath $targetDir -PathType Container)) {
            New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
        }
        if (Test-Path -LiteralPath $targetFile -PathType Leaf) {
            $target = Get-Item -LiteralPath $targetFile
            if ($target.Length -eq $sourceFile.Length -and
                (Get-FileHash -Algorithm SHA256 -LiteralPath $targetFile).Hash -eq
                (Get-FileHash -Algorithm SHA256 -LiteralPath $sourceFile.FullName).Hash) {
                continue
            }
        }
        Copy-Item -LiteralPath $sourceFile.FullName -Destination $targetFile -Force
    }
}

$built = 0
$skipped = 0

$pluginSources = python $PLUGIN_STAGE_SCRIPT --repo $REPO_ROOT --list-sources
if ($LASTEXITCODE -ne 0) {
    throw "Failed to discover bundled plugins"
}
$pluginSources | ForEach-Object {
    $pluginDir = Get-Item -LiteralPath $_
    $pluginName = $pluginDir.Name
    $uiDir = Join-Path $pluginDir.FullName "ui"

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
        Sync-ChangedFiles -Source (Join-Path $uiDir "dist") -Destination $srcDistDir
    }
}

Write-Host "[build_plugin_uis] Done: $built built, $skipped skipped."
