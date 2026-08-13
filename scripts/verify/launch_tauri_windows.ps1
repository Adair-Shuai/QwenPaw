# Install Tauri via NSIS, launch the shell, and wait for the backend.
# Outputs BASE_URL to $env:GITHUB_ENV for subsequent steps.
$ErrorActionPreference = "Stop"

# 1. Install the preferred NSIS installer. If NSIS cannot package the large
# bundled runtime, use the verified-build portable fallback, whose installer
# script performs the same per-user registration and shortcut setup.
$installer = Get-ChildItem dist/UGSci-Tauri-*-Windows-setup.exe -ErrorAction SilentlyContinue |
  Select-Object -First 1
if ($installer) {
  Write-Host "Installing $($installer.Name) silently..."
  $proc = Start-Process -FilePath $installer.FullName -ArgumentList "/S" `
    -Wait -PassThru -NoNewWindow
  Write-Host "Installer exited with code $($proc.ExitCode)"
  if ($proc.ExitCode -ne 0) { throw "NSIS installer failed (exit $($proc.ExitCode))" }
} else {
  $portable = Get-ChildItem dist/UGSci-Tauri-*-Windows-portable.zip -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if (-not $portable) { throw "Neither NSIS setup.exe nor portable Windows installer found in dist/" }
  $portableRoot = Join-Path $env:RUNNER_TEMP "qwenpaw-portable-install"
  if (Test-Path $portableRoot) { Remove-Item -LiteralPath $portableRoot -Recurse -Force }
  Expand-Archive -LiteralPath $portable.FullName -DestinationPath $portableRoot -Force
  $installScript = Get-ChildItem -LiteralPath $portableRoot -Filter install.ps1 -Recurse |
    Select-Object -First 1
  if (-not $installScript) { throw "Portable package is missing install.ps1" }
  Write-Host "Installing portable Windows package $($portable.Name)..."
  & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $installScript.FullName -Silent
  if ($LASTEXITCODE -ne 0) { throw "Portable Windows installer failed (exit $LASTEXITCODE)" }
}
# Tauri NSIS spawns elevated child + finishes immediately; allow time for
# files to settle.
Start-Sleep -Seconds 5

# 2. Locate the installed Tauri exe.
#    Priority: registry InstallLocation (canonical) → known candidate dirs.
$tauriExe = $null

# Try registry first — Tauri NSIS always writes InstallLocation.
foreach ($hive in @("HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall",
                    "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall",
                    "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall")) {
  $reg = Get-ChildItem $hive -ErrorAction SilentlyContinue |
    Where-Object { (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DisplayName -match "QwenPaw|UGSci" } |
    Select-Object -First 1
  if ($reg) {
    $loc = (Get-ItemProperty $reg.PSPath).InstallLocation
    if ($loc -and (Test-Path $loc)) {
      $found = Get-ChildItem -Path $loc -File -Recurse -Depth 3 -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -in @("UGSci.exe", "qwenpaw-desktop.exe") } |
        Sort-Object @{ Expression = { if ($_.Name -eq "UGSci.exe") { 0 } else { 1 } } } |
        Select-Object -First 1
      if ($found) { $tauriExe = $found.FullName; break }
    }
  }
}

# Fallback: search known install candidate directories.
if (-not $tauriExe) {
  $candidateRoots = @(
    (Join-Path $env:LOCALAPPDATA "UGSci Desktop"),
    (Join-Path $env:LOCALAPPDATA "Programs\UGSci Desktop"),
    (Join-Path $env:ProgramFiles "UGSci Desktop"),
    (Join-Path ${env:ProgramFiles(x86)} "UGSci Desktop"),
    (Join-Path $env:LOCALAPPDATA "QwenPaw Desktop"),
    (Join-Path $env:LOCALAPPDATA "Programs\QwenPaw Desktop"),
    (Join-Path $env:ProgramFiles "QwenPaw Desktop"),
    (Join-Path ${env:ProgramFiles(x86)} "QwenPaw Desktop")
  )
  foreach ($root in $candidateRoots) {
    if (Test-Path $root) {
      $found = Get-ChildItem -Path $root -File -Recurse -Depth 3 -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -in @("UGSci.exe", "qwenpaw-desktop.exe") } |
        Sort-Object @{ Expression = { if ($_.Name -eq "UGSci.exe") { 0 } else { 1 } } } |
        Select-Object -First 1
      if ($found) { $tauriExe = $found.FullName; break }
    }
  }
}

if (-not $tauriExe) {
  Write-Host "=== DEBUG: install location not found ==="
  Write-Host "Registry entries matching QwenPaw or UGSci:"
  foreach ($hive in @("HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall",
                      "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall")) {
    Get-ChildItem $hive -ErrorAction SilentlyContinue |
      Where-Object { (Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue).DisplayName -match "QwenPaw|UGSci" } |
      ForEach-Object { Write-Host "  $((Get-ItemProperty $_.PSPath).InstallLocation)" }
  }
  throw "Tauri exe not found after NSIS install"
}
Write-Host "Installed at: $tauriExe"

# Portable packages must expose the product-facing executable name. Keep the
# legacy name accepted above because this verifier also covers successful NSIS
# builds whose Cargo binary is still named qwenpaw-desktop.exe.
$portable = Get-ChildItem dist/UGSci-Tauri-*-Windows-portable.zip -ErrorAction SilentlyContinue |
  Select-Object -First 1
if ($portable -and (Split-Path $tauriExe -Leaf) -ne "UGSci.exe") {
  throw "Portable Windows package installed an unexpected executable name: $(Split-Path $tauriExe -Leaf)"
}

# 2b. Verify WebView2 bootstrapper is bundled in the install.
$installRoot = Split-Path $tauriExe -Parent
$uninstallEntry = Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\UGSci Desktop" -ErrorAction SilentlyContinue
if ($portable) {
  if (-not $uninstallEntry) { throw "Portable install did not register an uninstall entry" }
  if ([IO.Path]::GetFullPath($uninstallEntry.InstallLocation) -ne [IO.Path]::GetFullPath($installRoot)) {
    throw "Portable uninstall registration points at the wrong install location"
  }
  if (-not $uninstallEntry.DisplayIcon -or $uninstallEntry.DisplayIcon -notmatch "UGSci\.exe") {
    throw "Portable uninstall registration is missing the UGSci.exe display icon"
  }
  if (-not $uninstallEntry.UninstallString -or $uninstallEntry.UninstallString -notmatch "uninstall\.ps1") {
    throw "Portable uninstall registration is missing its uninstall command"
  }
}
$runtimeSelection = Join-Path $installRoot "execution-runtime\selection.txt"
if (-not (Test-Path $runtimeSelection)) {
  throw "Execution runtime selection was not written by the installer"
}
$runtimeMode = (Get-Content $runtimeSelection -ErrorAction Stop |
  Select-Object -First 1).Trim()
if ($runtimeMode -ne "builtin") {
  throw "Silent install must select bundled Python, got '$runtimeMode'"
}
Write-Host "Execution runtime selection: $runtimeMode"

# A silent install matches NSIS and registers the bundled qwenpaw CLI in the
# user PATH. Read the persisted user value because this runner process does not
# inherit the environment-change broadcast.
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
$cliScripts = Join-Path $installRoot "binaries\qwenpaw-backend"
$cliEntries = @($userPath -split ';' | ForEach-Object { $_.Trim().TrimEnd('\') })
if ($cliScripts.TrimEnd('\') -notin $cliEntries) {
  throw "Silent portable install did not register the bundled QwenPaw CLI in user PATH"
}
if (-not (Test-Path -LiteralPath (Join-Path $cliScripts "qwenpaw.exe"))) {
  throw "Registered QwenPaw CLI executable is missing"
}
$cliVersion = & (Join-Path $cliScripts "qwenpaw.exe") --version 2>&1
if ($LASTEXITCODE -ne 0 -or -not $cliVersion) {
  throw "Registered QwenPaw CLI did not execute successfully"
}
Write-Host "QwenPaw CLI verified: $cliVersion"

$wv2Files = Get-ChildItem -Path $installRoot -Filter "*WebView2*" `
  -Recurse -Depth 3 -ErrorAction SilentlyContinue
if ($wv2Files) {
  Write-Host "WebView2 bootstrapper present: $($wv2Files[0].Name)"
} else {
  Write-Host "::warning::WebView2 bootstrapper not found in install dir"
}

# 3. Launch the full Tauri shell with CDP debugging enabled.
#    This makes WebView2 expose a Chrome DevTools Protocol port so
#    Playwright can connect_over_cdp() to the real embedded webview.
$cdpPort = 9222
$env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS = "--remote-debugging-port=$cdpPort"
$portFile = Join-Path $env:USERPROFILE ".qwenpaw\desktop_port"
if (Test-Path -LiteralPath $portFile) {
  Remove-Item -LiteralPath $portFile -Force
}
Start-Process -FilePath $tauriExe

# 4. Wait for the sidecar to write the port file and respond.
#    The sidecar writes desktop_port at WORKING_DIR root (~/.qwenpaw),
#    not inside the workspace dir.
$port = $null
$backendReady = $false
$deadline = (Get-Date).AddSeconds(120)
while ((Get-Date) -lt $deadline) {
  if (Test-Path $portFile) {
    $port = (Get-Content $portFile -ErrorAction SilentlyContinue).Trim()
    if ($port) {
      try {
        $r = Invoke-WebRequest -Uri "http://127.0.0.1:$port/api/version" `
          -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        if ($r.StatusCode -eq 200) {
          Write-Host "Tauri app ready on port $port"
          $backendReady = $true
          break
        }
      } catch {}
    }
  }
  Start-Sleep -Seconds 2
}
if (-not $backendReady) {
  Write-Host "::error::Tauri app did not start within 120s"
  exit 1
}

# 5. Auto-init creates BOOTSTRAP.md during startup. Remove it afterwards so
#    the verifier can drive the agent in normal QA mode.
$bootstrapMd = Join-Path $env:USERPROFILE ".qwenpaw\workspaces\default\BOOTSTRAP.md"
if (Test-Path $bootstrapMd) { Remove-Item -Force $bootstrapMd }

# 6. Wait for CDP endpoint to become available.
$cdpUrl = "http://127.0.0.1:$cdpPort"
$cdpReady = $false
for ($i = 1; $i -le 30; $i++) {
  try {
    $r = Invoke-WebRequest -Uri "$cdpUrl/json/version" `
      -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    if ($r.StatusCode -eq 200) {
      Write-Host "CDP ready at $cdpUrl"
      $cdpReady = $true
      break
    }
  } catch { Start-Sleep -Seconds 2 }
}
if (-not $cdpReady) {
  Write-Host "::warning::CDP not available, falling back to standalone browser"
  $cdpUrl = ""
}

$baseUrl = "http://127.0.0.1:$port"
$env:BASE_URL = $baseUrl
$env:CDP_URL = $cdpUrl
"BASE_URL=$baseUrl" | Out-File -FilePath $env:GITHUB_ENV -Encoding utf8 -Append
"CDP_URL=$cdpUrl" | Out-File -FilePath $env:GITHUB_ENV -Encoding utf8 -Append
Write-Host "BASE_URL=$baseUrl"
Write-Host "CDP_URL=$cdpUrl"
