param(
  [Parameter(Mandatory = $true)] [string]$PortableRoot,
  [Parameter(Mandatory = $true)] [string]$ZipPath,
  [Parameter(Mandatory = $true)] [string]$Version
)

$ErrorActionPreference = "Stop"
$PortableRoot = (Resolve-Path -LiteralPath $PortableRoot).Path
$PayloadRoot = Join-Path $PortableRoot "payload"
$installPs1 = Join-Path $PortableRoot "install.ps1"
$setupExe = Join-Path $PortableRoot "Setup.exe"
$versionManifest = Join-Path $PortableRoot "version.json"
$checksumManifest = Join-Path $PortableRoot "checksums.sha256"
$uninstallPs1 = Join-Path $PayloadRoot "uninstall.ps1"
$uninstallCleanupPs1 = Join-Path $PayloadRoot "uninstall-cleanup.ps1"
$pathHelper = Join-Path $PayloadRoot "update-qwenpaw-path.ps1"

if (-not (Test-Path -LiteralPath $PayloadRoot -PathType Container)) {
  throw "Portable package payload directory not found: $PayloadRoot"
}

foreach ($required in @(
  "UGSci.exe",
  "binaries\state\active.json",
  "binaries\cli\qwenpaw.exe",
  "binaries\update-assistant\UGSciUpdateAssistant.exe"
)) {
  if (-not (Test-Path -LiteralPath (Join-Path $PayloadRoot $required))) {
    throw "Portable installer payload is incomplete: $required"
  }
}

$activeLayoutPath = Join-Path $PayloadRoot "binaries\state\active.json"
$activeLayout = Get-Content -LiteralPath $activeLayoutPath -Raw -Encoding UTF8 |
  ConvertFrom-Json
$backendComponent = $activeLayout.components.backend
$backendRelative = if ($backendComponent) {
  ([string]$backendComponent.path).Replace('/', '\')
} else {
  ""
}
if (-not $backendRelative.StartsWith("binaries\", [StringComparison]::OrdinalIgnoreCase) -or
    [IO.Path]::IsPathRooted($backendRelative) -or
    $backendRelative.Split('\') -contains '..') {
  throw "Portable installer backend component is invalid"
}
$backendLayer = [IO.Path]::GetFullPath((Join-Path $PayloadRoot $backendRelative))
$payloadPrefix = [IO.Path]::GetFullPath($PayloadRoot).TrimEnd('\') + '\'
if (-not $backendLayer.StartsWith($payloadPrefix, [StringComparison]::OrdinalIgnoreCase) -or
    -not (Test-Path -LiteralPath $backendLayer -PathType Container)) {
  throw "Portable installer backend component escapes or is missing"
}

# The frozen backend is the source of truth for bundled managed plugins.  A
# portable package without this tree can start the shell but cannot populate
# FlowForge/UGSci and the other built-in plugin UIs on first launch.  Fail the
# build rather than publishing a deceptively usable-looking package.
$bundledPluginRoot = Join-Path $backendLayer "qwenpaw\plugins_bundle"
if (-not (Test-Path -LiteralPath $bundledPluginRoot -PathType Container)) {
  throw "Portable installer payload is missing layered bundled plugins: $bundledPluginRoot"
}
$requiredPluginIds = @("flowforge", "ugsci", "ugsci_research")
foreach ($pluginId in $requiredPluginIds) {
  $manifest = Join-Path $bundledPluginRoot "$pluginId\plugin.json"
  if (-not (Test-Path -LiteralPath $manifest -PathType Leaf)) {
    throw "Portable installer payload is missing bundled plugin manifest: $pluginId"
  }
}

Copy-Item -LiteralPath (Join-Path $PSScriptRoot "..\..\console\src-tauri\nsis\update-qwenpaw-path.ps1") `
  -Destination $pathHelper -Force

@'
param(
  [switch]$Silent,
  [switch]$NoCliPath,
  [switch]$NoDesktopShortcut,
  [switch]$DeferredCommit,
  [string]$TransactionFile,
  [string]$InstallDir
)
$ErrorActionPreference = "Stop"
$utf8Encoding = New-Object Text.UTF8Encoding($false)
[Console]::InputEncoding = $utf8Encoding
[Console]::OutputEncoding = $utf8Encoding
$OutputEncoding = $utf8Encoding
$sourceRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$payloadRoot = Join-Path $sourceRoot "payload"
$checksumManifest = Join-Path $sourceRoot "checksums.sha256"
$versionManifest = Join-Path $sourceRoot "version.json"

function Get-NormalizedDirectoryPath([string]$Path) {
  $full = [IO.Path]::GetFullPath($Path)
  $volumeRoot = [IO.Path]::GetPathRoot($full)
  if ($full.Equals($volumeRoot, [StringComparison]::OrdinalIgnoreCase)) {
    return $volumeRoot
  }
  return $full.TrimEnd('\')
}

$activeLayout = Get-Content -LiteralPath (Join-Path $PayloadRoot "binaries\state\active.json") `
  -Raw -Encoding UTF8 | ConvertFrom-Json
if ($activeLayout.schemaVersion -ne 1 -or -not $activeLayout.components) {
  throw "Portable installer active runtime layout is invalid"
}
function Resolve-PayloadComponent([string]$Id) {
  $component = $activeLayout.components.$Id
  $relative = if ($component) { ([string]$component.path).Replace('/', '\') } else { "" }
  if (-not $relative.StartsWith("binaries\", [StringComparison]::OrdinalIgnoreCase) -or
      [IO.Path]::IsPathRooted($relative) -or $relative.Split('\') -contains '..') {
    throw "Portable installer active component is invalid: $Id"
  }
  $candidate = [IO.Path]::GetFullPath((Join-Path $PayloadRoot $relative))
  $prefix = [IO.Path]::GetFullPath($PayloadRoot).TrimEnd('\') + '\'
  if (-not $candidate.StartsWith($prefix, [StringComparison]::OrdinalIgnoreCase) -or
      -not (Test-Path -LiteralPath $candidate -PathType Container)) {
    throw "Portable installer active component escapes or is missing: $Id"
  }
  return $candidate
}
$backendLayer = Resolve-PayloadComponent "backend"
$pythonLayer = Resolve-PayloadComponent "python-runtime"
if (-not (Test-Path -LiteralPath (Join-Path $pythonLayer "python\python.exe") -PathType Leaf)) {
  throw "Portable installer layered Python runtime is incomplete"
}
if (-not (Test-Path -LiteralPath (Join-Path $backendLayer "qwenpaw\tauri\entry.py") -PathType Leaf)) {
  throw "Portable installer layered backend is incomplete"
}

function Get-DirectoryPrefix([string]$Path) {
  $normalized = Get-NormalizedDirectoryPath -Path $Path
  if ($normalized.EndsWith('\')) { return $normalized }
  return $normalized + '\'
}

function Get-Sha256Hex([string]$Path) {
  $ioPath = if ($Path.Length -lt 248) { $Path } elseif ($Path.StartsWith('\\')) {
    '\\?\UNC\' + $Path.Substring(2)
  } else { '\\?\' + $Path }
  $stream = [IO.File]::OpenRead($ioPath)
  try {
    $sha = [Security.Cryptography.SHA256]::Create()
    try {
      return ([BitConverter]::ToString($sha.ComputeHash($stream))).Replace("-", "").ToLowerInvariant()
    } finally {
      $sha.Dispose()
    }
  } finally {
    $stream.Dispose()
  }
}

function Test-PackageIntegrity {
  if (-not (Test-Path -LiteralPath $checksumManifest -PathType Leaf)) {
    throw "Package checksum manifest is missing"
  }
  $root = Get-NormalizedDirectoryPath -Path $sourceRoot
  $rootPrefix = Get-DirectoryPrefix -Path $root
  $expected = New-Object 'Collections.Generic.HashSet[string]' ([StringComparer]::OrdinalIgnoreCase)
  foreach ($line in Get-Content -LiteralPath $checksumManifest -Encoding UTF8) {
    if (-not $line.Trim()) { continue }
    if ($line -notmatch '^([0-9a-fA-F]{64})  (.+)$') {
      throw "Invalid checksum manifest entry: $line"
    }
    $expectedHash = $Matches[1].ToLowerInvariant()
    $relative = $Matches[2].Replace('/', '\')
    if ([IO.Path]::IsPathRooted($relative) -or $relative.Split('\') -contains '..') {
      throw "Unsafe checksum path: $relative"
    }
    $fullPath = Join-Path $root $relative
    if (-not $fullPath.StartsWith($rootPrefix, [StringComparison]::OrdinalIgnoreCase)) {
      throw "Checksum path escapes package root: $relative"
    }
    if (-not $expected.Add($relative)) { throw "Duplicate checksum entry: $relative" }
    $ioPath = if ($fullPath.Length -lt 248) { $fullPath } elseif ($fullPath.StartsWith('\\')) {
      '\\?\UNC\' + $fullPath.Substring(2)
    } else { '\\?\' + $fullPath }
    if (-not [IO.File]::Exists($ioPath)) {
      throw "Package file is missing: $relative"
    }
    $actualHash = Get-Sha256Hex -Path $fullPath
    if ($actualHash -ne $expectedHash) { throw "Package checksum mismatch: $relative" }
  }
  $rootIo = if ($root.StartsWith('\\')) { '\\?\UNC\' + $root.Substring(2) } else { '\\?\' + $root }
  foreach ($file in [IO.Directory]::EnumerateFiles($rootIo, '*', [IO.SearchOption]::AllDirectories)) {
    $normalFile = if ($file.StartsWith('\\?\UNC\')) { '\\' + $file.Substring(8) } elseif ($file.StartsWith('\\?\')) { $file.Substring(4) } else { $file }
    if ($normalFile -eq $checksumManifest) { continue }
    $relative = $normalFile.Substring($rootPrefix.Length)
    if (-not $expected.Contains($relative)) { throw "Unchecked package file: $relative" }
  }
  foreach ($required in @(
      "Setup.exe", "install.ps1", "version.json", "payload\Setup.exe", "payload\Uninstall.exe",
      "payload\UGSci.exe", "payload\binaries\state\active.json",
      "payload\binaries\cli\qwenpaw.exe",
      "payload\binaries\update-assistant\UGSciUpdateAssistant.exe"
    )) {
    if (-not $expected.Contains($required)) { throw "Required checksum entry is missing: $required" }
  }
}

Test-PackageIntegrity
$packageVersion = Get-Content -LiteralPath $versionManifest -Raw -Encoding UTF8 | ConvertFrom-Json
if ($packageVersion.schema -ne 1 -or $packageVersion.product -ne "UGSci Desktop" -or
    $packageVersion.payload -ne "payload" -or -not $packageVersion.version) {
  throw "version.json is invalid"
}

function Resolve-InstalledComponent([string]$Root, [string]$Id) {
  $activePath = Join-Path $Root "binaries\state\active.json"
  if (-not (Test-Path -LiteralPath $activePath -PathType Leaf)) {
    throw "Installed active runtime layout is missing"
  }
  $layout = Get-Content -LiteralPath $activePath -Raw -Encoding UTF8 | ConvertFrom-Json
  if ($layout.schemaVersion -ne 1 -or -not $layout.components.$Id.path) {
    throw "Installed active component is invalid: $Id"
  }
  $relative = ([string]$layout.components.$Id.path).Replace('/', '\')
  if ([IO.Path]::IsPathRooted($relative) -or $relative.Split('\') -contains '..') {
    throw "Installed active component path is unsafe: $Id"
  }
  $rootFull = [IO.Path]::GetFullPath($Root).TrimEnd('\')
  $candidate = [IO.Path]::GetFullPath((Join-Path $rootFull $relative))
  if (-not $candidate.StartsWith($rootFull + '\', [StringComparison]::OrdinalIgnoreCase) -or
      -not (Test-Path -LiteralPath $candidate -PathType Container)) {
    throw "Installed active component escapes or is missing: $Id"
  }
  return $candidate
}

function Test-ExistingUGSciInstall {
  param([Parameter(Mandatory = $true)] [string]$Root)
  if (-not (Test-Path -LiteralPath $Root -PathType Container)) { return $false }
  $desktopExists = (Test-Path -LiteralPath (Join-Path $Root "UGSci.exe") -PathType Leaf) -or
    (Test-Path -LiteralPath (Join-Path $Root "qwenpaw-desktop.exe") -PathType Leaf)
  $backendExists = Test-Path -LiteralPath (Join-Path $Root "binaries\qwenpaw-backend\qwenpaw-backend.exe") -PathType Leaf
  $layeredExists = Test-Path -LiteralPath (Join-Path $Root "binaries\state\active.json") -PathType Leaf
  if ($desktopExists -and ($backendExists -or $layeredExists)) { return $true }

  $versionPath = Join-Path $Root "version.json"
  if (-not (Test-Path -LiteralPath $versionPath -PathType Leaf)) { return $false }
  try {
    $installedVersion = Get-Content -LiteralPath $versionPath -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($installedVersion.product -ne "UGSci Desktop") { return $false }
  } catch { return $false }
  foreach ($marker in @("UGSci.exe", "qwenpaw-desktop.exe", "binaries", "Uninstall.exe", "uninstall.ps1")) {
    if (Test-Path -LiteralPath (Join-Path $Root $marker)) { return $true }
  }
  return $false
}

function Get-UnrelatedInstallEntries {
  param([Parameter(Mandatory = $true)] [string]$Root)
  $ownedFiles = @(
    "UGSci.exe", "qwenpaw-desktop.exe", "qwenpaw-desktop-debug.cmd", "qwenpaw-desktop-debug.ps1",
    "version.json", "Setup.exe", "Uninstall.exe", "uninstall.ps1", "uninstall-cleanup.ps1",
    "update-qwenpaw-path.ps1", "cli-path.txt"
  )
  $ownedDirectories = @(
    "binaries", "execution-runtime", "optional-components", "engines", "data", "state",
    "user-data", "workspace", "models", "logs"
  )
  $unrelated = @()
  foreach ($entry in Get-ChildItem -LiteralPath $Root -Force -ErrorAction Stop) {
    if ($entry.PSIsContainer) {
      if ($ownedDirectories -notcontains $entry.Name) { $unrelated += $entry.Name }
    } elseif ($ownedFiles -notcontains $entry.Name) {
      $unrelated += $entry.Name
    }
  }
  return @($unrelated)
}

$defaultInstallDir = Join-Path $env:LOCALAPPDATA "UGSci Desktop"
$existingInstallDir = $null
$legacyUninstallKey = $null
$legacyUninstallKeyPath = $null
Get-ChildItem "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall" -ErrorAction SilentlyContinue |
  ForEach-Object {
    $entry = Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue
    $hasDesktopExe = $entry.InstallLocation -and (Test-ExistingUGSciInstall -Root ([string]$entry.InstallLocation))
    if (-not $existingInstallDir -and $entry.DisplayName -match "QwenPaw|UGSci Desktop" -and
        $hasDesktopExe) {
      $candidate = [IO.Path]::GetFullPath([string]$entry.InstallLocation).TrimEnd('\')
      # The user may have selected any writable volume in the installer UI,
      # not only %LOCALAPPDATA%.  The per-user uninstall hive plus a matching
      # UGSci executable is the trust boundary for discovering that location.
      $existingInstallDir = $candidate
      $legacyUninstallKey = $_.PSPath
      $legacyUninstallKeyPath = "Software\Microsoft\Windows\CurrentVersion\Uninstall\$($_.PSChildName)"
    }
  }
$requestedInstallDir = if ($InstallDir) {
  if (-not [IO.Path]::IsPathRooted($InstallDir.Trim())) {
    throw "The installation folder must be an absolute path"
  }
  Get-NormalizedDirectoryPath -Path $InstallDir.Trim()
} else { $null }
if ($DeferredCommit -and (-not $TransactionFile -or -not [IO.Path]::IsPathRooted($TransactionFile))) {
  throw "Deferred update commit requires an absolute transaction file path"
}
if ($existingInstallDir -and $requestedInstallDir -and
    -not $requestedInstallDir.Equals($existingInstallDir, [StringComparison]::OrdinalIgnoreCase)) {
  throw "UGSci Desktop is already installed at $existingInstallDir. Uninstall it before choosing a different location."
}
$installDir = if ($requestedInstallDir) { $requestedInstallDir } elseif ($existingInstallDir) { $existingInstallDir } else { $defaultInstallDir }
$installDir = Get-NormalizedDirectoryPath -Path $installDir
$installRoot = Get-NormalizedDirectoryPath -Path ([IO.Path]::GetPathRoot($installDir))
if ($installDir.Equals($installRoot, [StringComparison]::OrdinalIgnoreCase)) {
  throw "UGSci Desktop cannot be installed directly into a drive root"
}
$sourceFull = Get-NormalizedDirectoryPath -Path $sourceRoot
$sourcePrefix = Get-DirectoryPrefix -Path $sourceFull
$installPrefix = $installDir + '\'
if ($installDir.Equals($sourceFull, [StringComparison]::OrdinalIgnoreCase) -or
    $installPrefix.StartsWith($sourcePrefix, [StringComparison]::OrdinalIgnoreCase) -or
    $sourcePrefix.StartsWith($installPrefix, [StringComparison]::OrdinalIgnoreCase)) {
  throw "The installation folder must be separate from the extracted setup package"
}
if (Test-Path -LiteralPath $installDir -PathType Leaf) {
  throw "The selected installation path is an existing file. Choose a folder."
}
if ((Test-Path -LiteralPath $installDir -PathType Container) -and
    @(Get-ChildItem -LiteralPath $installDir -Force -ErrorAction Stop).Count -gt 0) {
  if (-not (Test-ExistingUGSciInstall -Root $installDir)) {
    throw "The selected installation folder is not empty and is not a recognized UGSci Desktop installation. Choose an empty folder."
  }
  $unrelatedEntries = @(Get-UnrelatedInstallEntries -Root $installDir)
  if ($unrelatedEntries.Count -gt 0) {
    $preview = ($unrelatedEntries | Select-Object -First 5) -join ", "
    if ($unrelatedEntries.Count -gt 5) { $preview += ", ..." }
    throw "The existing UGSci Desktop folder also contains unrelated files or folders ($preview). Setup will not delete them; choose another folder."
  }
  if (-not $existingInstallDir) { $existingInstallDir = $installDir }
}
$installParent = Split-Path -Parent $installDir
if (-not $installParent -or -not [IO.Path]::IsPathRooted($installParent)) {
  throw "The installation folder has an invalid parent path"
}
# A first-level destination such as C:\UGSci has C:\ as its parent.  Some
# Windows PowerShell / filesystem-provider combinations reject directory
# already existing volume root with CreateDirectoryArgumentError.  Never ask
# the provider to recreate an existing root (or any existing parent).
if (-not (Test-Path -LiteralPath $installParent -PathType Container)) {
  [IO.Directory]::CreateDirectory($installParent) | Out-Null
}
if (-not (Test-Path -LiteralPath $installParent -PathType Container)) {
  throw "The installation folder parent could not be created: $installParent"
}
$appExe = Join-Path $installDir "UGSci.exe"
$transactionId = [Guid]::NewGuid().ToString("N")
$stagingDir = Join-Path $installParent ".ug-i-$transactionId"
$backupDir = Join-Path $installParent ".ug-b-$transactionId"
$mutex = New-Object Threading.Mutex($false, "Local\UGSciDesktopPortableInstaller")
$mutexAcquired = $false
try {
try {
  $mutexAcquired = $mutex.WaitOne(0)
} catch [Threading.AbandonedMutexException] {
  # The previous installer process died; Windows has transferred ownership.
  $mutexAcquired = $true
}
if (-not $mutexAcquired) { throw "Another UGSci Desktop installation is already running" }
$previousUserPath = [Environment]::GetEnvironmentVariable("Path", "User")
$uninstallKey = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\UGSci Desktop"
$canonicalUninstallKeyPath = "Software\Microsoft\Windows\CurrentVersion\Uninstall\UGSci Desktop"
$previousUninstall = if (Test-Path -LiteralPath $uninstallKey) {
  Get-ItemProperty -LiteralPath $uninstallKey -ErrorAction SilentlyContinue
} else { $null }
$startMenuShortcutPath = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs\UGSci Desktop.lnk"
$desktopShortcutPath = Join-Path ([Environment]::GetFolderPath("Desktop")) "UGSci Desktop.lnk"
$previousStartMenuShortcut = if (Test-Path -LiteralPath $startMenuShortcutPath -PathType Leaf) {
  [IO.File]::ReadAllBytes($startMenuShortcutPath)
} else { $null }
$previousDesktopShortcut = if (Test-Path -LiteralPath $desktopShortcutPath -PathType Leaf) {
  [IO.File]::ReadAllBytes($desktopShortcutPath)
} else { $null }

function Get-UninstallRegistrySnapshot {
  param([string]$KeyPath)
  if (-not $KeyPath) { return @() }
  $key = [Microsoft.Win32.Registry]::CurrentUser.OpenSubKey($KeyPath)
  if (-not $key) { return @() }
  try {
    return @($key.GetValueNames() | ForEach-Object {
      $name = $_
      $kind = $key.GetValueKind($name).ToString()
      $value = $key.GetValue($name, $null, [Microsoft.Win32.RegistryValueOptions]::DoNotExpandEnvironmentNames)
      [ordered]@{ name = $name; kind = $kind; value = $value }
    })
  } finally { $key.Dispose() }
}

$previousUninstallKeyPath = if ($legacyUninstallKeyPath) { $legacyUninstallKeyPath } elseif (Test-Path -LiteralPath $uninstallKey) { $canonicalUninstallKeyPath } else { $null }
$previousUninstallValues = @(Get-UninstallRegistrySnapshot -KeyPath $previousUninstallKeyPath)
$canonicalUninstallPreviouslyExisted = Test-Path -LiteralPath $uninstallKey

function Write-InstallTransaction {
  param([Parameter(Mandatory = $true)] [string]$Stage)
  if (-not $DeferredCommit) { return }
  $transactionParent = Split-Path -Parent ([IO.Path]::GetFullPath($TransactionFile))
  New-Item -ItemType Directory -Path $transactionParent -Force | Out-Null
  $temporary = "$TransactionFile.$PID.tmp"
  $transactionState.stage = $Stage
  $transactionState.updated_at = (Get-Date).ToUniversalTime().ToString("o")
  $transactionState | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $temporary -Encoding UTF8
  Move-Item -LiteralPath $temporary -Destination $TransactionFile -Force
}

function Stop-ScopedApplication {
  param([string]$Root)
  $prefix = [IO.Path]::GetFullPath($Root).TrimEnd('\') + '\'
  $processes = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
    $_.ExecutablePath -and $_.ExecutablePath.StartsWith($prefix, [StringComparison]::OrdinalIgnoreCase)
  }
  foreach ($process in $processes) {
    Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
  }
  if ($processes) { Wait-Process -Id @($processes.ProcessId) -Timeout 8 -ErrorAction SilentlyContinue }
}

function Resolve-UserPath {
  param([string]$Value)
  if (-not $Value) { return $null }
  $expanded = [Environment]::ExpandEnvironmentVariables($Value.Trim())
  if ($expanded -eq "~") { $expanded = $env:USERPROFILE }
  elseif ($expanded.StartsWith("~\") -or $expanded.StartsWith("~/")) {
    $expanded = Join-Path $env:USERPROFILE $expanded.Substring(2)
  }
  return [IO.Path]::GetFullPath($expanded)
}

function New-UpdateDataBackup {
  param([string]$ReleaseVersion, [string]$InstallDir)
  $configuredWorkingDir = if ($env:QWENPAW_WORKING_DIR) {
    $env:QWENPAW_WORKING_DIR
  } elseif ($env:COPAW_WORKING_DIR) {
    $env:COPAW_WORKING_DIR
  } else { $null }
  $workingDir = if ($configuredWorkingDir) {
    Resolve-UserPath $configuredWorkingDir
  } elseif (Test-Path (Join-Path $env:USERPROFILE ".copaw")) {
    Join-Path $env:USERPROFILE ".copaw"
  } else {
    Join-Path $env:USERPROFILE ".qwenpaw"
  }
  $secretDir = if ($env:QWENPAW_SECRET_DIR) {
    Resolve-UserPath $env:QWENPAW_SECRET_DIR
  } elseif ($env:COPAW_SECRET_DIR) {
    Resolve-UserPath $env:COPAW_SECRET_DIR
  } else { "$workingDir.secret" }

  function Test-BackupPathInside([string]$Candidate, [string]$Parent) {
    if (-not $Parent) { return $false }
    $candidateFull = [IO.Path]::GetFullPath($Candidate).TrimEnd('\')
    $parentFull = [IO.Path]::GetFullPath($Parent).TrimEnd('\')
    return $candidateFull.Equals($parentFull, [StringComparison]::OrdinalIgnoreCase) -or
      $candidateFull.StartsWith($parentFull + '\', [StringComparison]::OrdinalIgnoreCase)
  }

  $stamp = Get-Date -Format "yyyyMMdd-HHmmss-fff"
  $safeReleaseVersion = [regex]::Replace([string]$ReleaseVersion, '[^0-9A-Za-z._-]', '_')
  if (-not $safeReleaseVersion) { $safeReleaseVersion = "unknown" }
  $backupName = "$stamp-$PID-$safeReleaseVersion"
  $backupRoot = $null
  foreach ($backupBase in @(
      (Join-Path $env:LOCALAPPDATA "UGSci\update-backups"),
      (Join-Path $env:LOCALAPPDATA "UGSci-backups\update-backups"),
      (Join-Path $env:USERPROFILE "UGSci Backups\update-backups")
    )) {
    $candidate = Join-Path $backupBase $backupName
    if (-not (Test-BackupPathInside -Candidate $candidate -Parent $InstallDir) -and
        -not (Test-BackupPathInside -Candidate $candidate -Parent $workingDir) -and
        -not (Test-BackupPathInside -Candidate $candidate -Parent $secretDir)) {
      $backupRoot = $candidate
      break
    }
  }
  if (-not $backupRoot) {
    throw "No safe update backup location is available outside the installation and user data directories"
  }
  New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
  $backedUpAnything = $false
  if ($workingDir -and (Test-Path -LiteralPath $workingDir -PathType Container)) {
    & robocopy.exe $workingDir (Join-Path $backupRoot "working-dir") /E /COPY:DAT /DCOPY:DAT /XJ /R:2 /W:1 /NFL /NDL /NP | Out-Null
    if ($LASTEXITCODE -gt 7) { throw "User data backup failed (robocopy exit $LASTEXITCODE)" }
    $backedUpAnything = $true
  }
  if (Test-Path -LiteralPath $secretDir) {
    & robocopy.exe $secretDir (Join-Path $backupRoot "secret-dir") /E /COPY:DAT /DCOPY:DAT /XJ /R:2 /W:1 /NFL /NDL /NP | Out-Null
    if ($LASTEXITCODE -gt 7) { throw "Secret data backup failed (robocopy exit $LASTEXITCODE)" }
    $backedUpAnything = $true
  }
  $installLocalRoot = Join-Path $backupRoot "install-local"
  foreach ($preserved in @("execution-runtime", "optional-components", "engines", "data", "state", "user-data", "workspace", "models")) {
    $oldPath = Join-Path $InstallDir $preserved
    if (Test-Path -LiteralPath $oldPath -PathType Container) {
      & robocopy.exe $oldPath (Join-Path $installLocalRoot $preserved) /E /COPY:DAT /DCOPY:DAT /XJ /R:2 /W:1 /NFL /NDL /NP | Out-Null
      if ($LASTEXITCODE -gt 7) { throw "Installed user data backup failed for $preserved (robocopy exit $LASTEXITCODE)" }
      $backedUpAnything = $true
    }
  }
  [ordered]@{
    version = $ReleaseVersion
    created_at = (Get-Date).ToUniversalTime().ToString("o")
    working_dir = $workingDir
    secret_dir = $secretDir
    install_dir = $InstallDir
    install_local = @("execution-runtime", "optional-components", "engines", "data", "state", "user-data", "workspace", "models")
  } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $backupRoot "backup.json") -Encoding UTF8
  if ($backedUpAnything) { return $backupRoot }
  Remove-Item -LiteralPath $backupRoot -Recurse -Force -ErrorAction SilentlyContinue
  return $null
}

function Ensure-WebView2 {
  param([string]$DestinationDir)
  $clients = @(
    "HKLM:\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}",
    "HKLM:\SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}",
    "HKCU:\Software\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}"
  )
  foreach ($client in $clients) {
    $version = (Get-ItemProperty -LiteralPath $client -Name pv -ErrorAction SilentlyContinue).pv
    if ($version -and $version -ne "0.0.0.0") { return }
  }
  $bootstrapper = Join-Path $env:TEMP "MicrosoftEdgeWebview2Setup-$PID.exe"
  Invoke-WebRequest -Uri "https://go.microsoft.com/fwlink/p/?LinkId=2124703" -OutFile $bootstrapper -UseBasicParsing -TimeoutSec 120
  $signature = Get-AuthenticodeSignature -FilePath $bootstrapper
  if ($signature.Status -ne "Valid" -or $signature.SignerCertificate.Subject -notmatch "Microsoft Corporation") {
    Remove-Item -LiteralPath $bootstrapper -Force -ErrorAction SilentlyContinue
    throw "Downloaded WebView2 bootstrapper does not have a valid Microsoft signature"
  }
  $process = Start-Process -FilePath $bootstrapper -ArgumentList "/silent", "/install" -PassThru
  if (-not $process.WaitForExit(300000)) {
    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
    throw "WebView2 installation timed out"
  }
  if ($process.ExitCode -ne 0) { throw "WebView2 installation failed (exit $($process.ExitCode))" }
  if ($DestinationDir -and (Test-Path -LiteralPath $DestinationDir -PathType Container)) {
    Copy-Item -LiteralPath $bootstrapper -Destination (Join-Path $DestinationDir "MicrosoftEdgeWebview2Setup.exe") -Force
  }
  Remove-Item -LiteralPath $bootstrapper -Force -ErrorAction SilentlyContinue
}

if (-not (Test-Path $payloadRoot)) { throw "Portable package payload directory not found" }
if (-not (Test-Path -LiteralPath (Join-Path $payloadRoot "UGSci.exe"))) {
  throw "Portable package is missing UGSci.exe"
}
$payloadBackend = Resolve-InstalledComponent -Root $payloadRoot -Id "backend"
$payloadPython = Resolve-InstalledComponent -Root $payloadRoot -Id "python-runtime"
if (-not (Test-Path -LiteralPath (Join-Path $payloadBackend "qwenpaw\tauri\entry.py") -PathType Leaf)) {
  throw "Portable package is missing the layered Python backend"
}

function Move-DirectoryWithRetry {
  param(
    [Parameter(Mandatory = $true)] [string]$Source,
    [Parameter(Mandatory = $true)] [string]$Destination,
    [int]$Attempts = 30,
    [int]$DelayMilliseconds = 500
  )
  $lastError = $null
  for ($attempt = 1; $attempt -le $Attempts; $attempt++) {
    try {
      Move-Item -LiteralPath $Source -Destination $Destination -Force -ErrorAction Stop
      return
    } catch {
      $lastError = $_
      if ($attempt -lt $Attempts) { Start-Sleep -Milliseconds $DelayMilliseconds }
    }
  }
  throw "Cannot move the existing UGSci Desktop installation after $Attempts attempts. A process is still using its files. $lastError"
}

function ConvertTo-LongIoPath {
  param([Parameter(Mandatory = $true)] [string]$Path)
  $full = [IO.Path]::GetFullPath($Path)
  if ($full.StartsWith('\\?\', [StringComparison]::Ordinal)) { return $full }
  if ($full.StartsWith('\\', [StringComparison]::Ordinal)) {
    return '\\?\UNC\' + $full.Substring(2)
  }
  return '\\?\' + $full
}

function Copy-DirectoryLongPathSafe {
  param(
    [Parameter(Mandatory = $true)] [string]$Source,
    [Parameter(Mandatory = $true)] [string]$Destination
  )
  $sourceIo = ConvertTo-LongIoPath $Source
  $destinationIo = ConvertTo-LongIoPath $Destination
  [IO.Directory]::CreateDirectory($destinationIo) | Out-Null
  foreach ($directory in [IO.Directory]::EnumerateDirectories($sourceIo, '*', [IO.SearchOption]::AllDirectories)) {
    $relative = $directory.Substring($sourceIo.TrimEnd('\').Length).TrimStart('\')
    [IO.Directory]::CreateDirectory([IO.Path]::Combine($destinationIo, $relative)) | Out-Null
  }
  foreach ($file in [IO.Directory]::EnumerateFiles($sourceIo, '*', [IO.SearchOption]::AllDirectories)) {
    $relative = $file.Substring($sourceIo.TrimEnd('\').Length).TrimStart('\')
    $target = [IO.Path]::Combine($destinationIo, $relative)
    [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($target)) | Out-Null
    [IO.File]::Copy($file, $target, $true)
  }
}

function Remove-DirectoryLongPathSafe {
  param([Parameter(Mandatory = $true)] [string]$Path)
  $ioPath = ConvertTo-LongIoPath $Path
  if ([IO.Directory]::Exists($ioPath)) { [IO.Directory]::Delete($ioPath, $true) }
}
if (-not (Test-Path -LiteralPath (Join-Path $payloadPython "python\python.exe") -PathType Leaf)) {
  throw "Portable package is missing the layered Python runtime"
}
Stop-ScopedApplication -Root $installDir
Start-Sleep -Milliseconds 500

# GUID-scoped transaction directories are never pre-deleted.  An existing path
# indicates corruption or an impossible collision; it may be recovery material
# from an interrupted update and must not be destroyed.
if ((Test-Path -LiteralPath $stagingDir) -or (Test-Path -LiteralPath $backupDir)) {
  throw "A unique installer transaction path already exists; setup will not overwrite recovery data"
}
New-Item -ItemType Directory -Path $stagingDir -Force | Out-Null
Copy-DirectoryLongPathSafe -Source $payloadRoot -Destination $stagingDir
Copy-Item -LiteralPath $versionManifest -Destination (Join-Path $stagingDir "version.json") -Force

$releaseVersion = [string]$packageVersion.version
$hasExistingUserData = $env:QWENPAW_WORKING_DIR -or $env:COPAW_WORKING_DIR -or
  (Test-Path -LiteralPath (Join-Path $env:USERPROFILE ".copaw")) -or
  (Test-Path -LiteralPath (Join-Path $env:USERPROFILE ".qwenpaw"))
$dataBackup = if ($existingInstallDir -or $hasExistingUserData) {
  New-UpdateDataBackup -ReleaseVersion $releaseVersion -InstallDir $installDir
} else { $null }
if ($dataBackup) { Write-Host "User data backed up to $dataBackup" }
Ensure-WebView2 -DestinationDir $stagingDir

$previousVersion = if ($previousUninstall -and $previousUninstall.DisplayVersion) {
  [string]$previousUninstall.DisplayVersion
} elseif (Test-Path -LiteralPath (Join-Path $installDir "version.json") -PathType Leaf) {
  try { [string](Get-Content -LiteralPath (Join-Path $installDir "version.json") -Raw -Encoding UTF8 | ConvertFrom-Json).version } catch { "" }
} else { "" }
$transactionState = [ordered]@{
  schema_version = 2
  stage = "prepared"
  install_dir = $installDir
  backup_dir = $backupDir
  staging_dir = $stagingDir
  target_version = $releaseVersion
  previous_version = $previousVersion
  previous_user_path = $previousUserPath
  previous_uninstall_key_path = $previousUninstallKeyPath
  previous_uninstall_values = $previousUninstallValues
  canonical_uninstall_previously_existed = [bool]$canonicalUninstallPreviouslyExisted
  start_menu_shortcut_path = $startMenuShortcutPath
  start_menu_shortcut_base64 = if ($previousStartMenuShortcut) { [Convert]::ToBase64String($previousStartMenuShortcut) } else { "" }
  desktop_shortcut_path = $desktopShortcutPath
  desktop_shortcut_base64 = if ($previousDesktopShortcut) { [Convert]::ToBase64String($previousDesktopShortcut) } else { "" }
  created_at = (Get-Date).ToUniversalTime().ToString("o")
  updated_at = (Get-Date).ToUniversalTime().ToString("o")
}
if ($DeferredCommit) { Write-InstallTransaction -Stage "prepared" }

$previousTreeMoved = $false
$newTreeActivated = $false
try {
  # Moving the previous tree is the first destructive mutation and therefore
  # must be covered by the rollback handler below.
  if (Test-Path $installDir) {
    Move-DirectoryWithRetry -Source $installDir -Destination $backupDir
    $previousTreeMoved = $true
    if ($DeferredCommit) { Write-InstallTransaction -Stage "old-moved" }
  }
  Move-Item -LiteralPath $stagingDir -Destination $installDir -Force
  $newTreeActivated = $true
  if ($DeferredCommit) { Write-InstallTransaction -Stage "new-activated" }
  $installedBackend = Resolve-InstalledComponent -Root $installDir -Id "backend"
  $installedPython = Resolve-InstalledComponent -Root $installDir -Id "python-runtime"
  if (-not (Test-Path -LiteralPath $appExe) -or
      -not (Test-Path -LiteralPath (Join-Path $installedBackend "qwenpaw\tauri\entry.py")) -or
      -not (Test-Path -LiteralPath (Join-Path $installedPython "python\python.exe"))) {
    throw "Installed application payload failed validation"
  }

  if (Test-Path $backupDir) {
    foreach ($preserved in @("execution-runtime", "optional-components", "engines", "data", "state", "user-data", "workspace", "models")) {
      $oldPath = Join-Path $backupDir $preserved
      $newPath = Join-Path $installDir $preserved
      if (Test-Path $oldPath) {
        if (Test-Path $newPath) { Remove-DirectoryLongPathSafe -Path $newPath }
        Copy-DirectoryLongPathSafe -Source $oldPath -Destination $newPath
      }
    }
  }

  $runtimeDir = Join-Path $installDir "execution-runtime"
  New-Item -ItemType Directory -Path $runtimeDir -Force | Out-Null
  if (-not (Test-Path (Join-Path $runtimeDir "selection.txt"))) {
    Set-Content -LiteralPath (Join-Path $runtimeDir "selection.txt") -Value "builtin" -Encoding UTF8
  }
  $cliScripts = Join-Path $installDir "binaries\cli"
  $legacyCliScripts = Join-Path $installDir "binaries\python-runtime\python\Scripts"
  & (Join-Path $installDir "update-qwenpaw-path.ps1") -Action Remove -Path $legacyCliScripts
  $enableCliPath = -not $NoCliPath
  if (-not $Silent -and -not $NoCliPath) {
    $answer = Read-Host "Add the QwenPaw CLI to your user PATH? [Y/n]"
    $enableCliPath = -not ($answer -match "^(n|no)$")
  }
  if ($enableCliPath -and (Test-Path -LiteralPath (Join-Path $cliScripts "qwenpaw.exe"))) {
    & (Join-Path $installDir "update-qwenpaw-path.ps1") -Action Add -Path $cliScripts
    Set-Content -LiteralPath (Join-Path $installDir "cli-path.txt") -Value $cliScripts -Encoding UTF8
  } else {
    & (Join-Path $installDir "update-qwenpaw-path.ps1") -Action Remove -Path $cliScripts
    Remove-Item -LiteralPath (Join-Path $installDir "cli-path.txt") -Force -ErrorAction SilentlyContinue
  }

  $version = [string]$packageVersion.version
  New-Item -Path $uninstallKey -Force | Out-Null
  New-ItemProperty -Path $uninstallKey -Name DisplayName -Value "UGSci Desktop" -PropertyType String -Force | Out-Null
  New-ItemProperty -Path $uninstallKey -Name DisplayVersion -Value $version -PropertyType String -Force | Out-Null
  New-ItemProperty -Path $uninstallKey -Name Publisher -Value "UGSci" -PropertyType String -Force | Out-Null
  New-ItemProperty -Path $uninstallKey -Name InstallLocation -Value $installDir -PropertyType String -Force | Out-Null
  New-ItemProperty -Path $uninstallKey -Name DisplayIcon -Value "`"$appExe`",0" -PropertyType String -Force | Out-Null
  $uninstallLauncher = Join-Path $installDir "Uninstall.exe"
  New-ItemProperty -Path $uninstallKey -Name UninstallString -Value "`"$uninstallLauncher`" --uninstall" -PropertyType String -Force | Out-Null
  New-ItemProperty -Path $uninstallKey -Name QuietUninstallString -Value "`"$uninstallLauncher`" --uninstall --silent" -PropertyType String -Force | Out-Null
  New-ItemProperty -Path $uninstallKey -Name NoModify -Value 1 -PropertyType DWord -Force | Out-Null
  New-ItemProperty -Path $uninstallKey -Name NoRepair -Value 1 -PropertyType DWord -Force | Out-Null
  $shell = New-Object -ComObject WScript.Shell
  $shortcut = $shell.CreateShortcut($startMenuShortcutPath)
  $shortcut.TargetPath = $appExe
  $shortcut.WorkingDirectory = $installDir
  $shortcut.Save()
  $createDesktopShortcut = (-not $NoDesktopShortcut) -and
    ((-not $DeferredCommit) -or (-not $existingInstallDir) -or ($null -ne $previousDesktopShortcut))
  if ($createDesktopShortcut) {
    $desktopShortcut = $shell.CreateShortcut($desktopShortcutPath)
    $desktopShortcut.TargetPath = $appExe
    $desktopShortcut.WorkingDirectory = $installDir
    $desktopShortcut.Save()
  } else {
    Remove-Item -LiteralPath $desktopShortcutPath -Force -ErrorAction SilentlyContinue
  }

  if ($DeferredCommit) {
    if (-not $previousTreeMoved -or -not (Test-Path -LiteralPath $backupDir -PathType Container)) {
      throw "Deferred update commit requires a recoverable previous installation"
    }
    Write-InstallTransaction -Stage "registered"
  } elseif (Test-Path $backupDir) {
    try { Remove-DirectoryLongPathSafe -Path $backupDir } catch { }
  }
  if ($legacyUninstallKey -and $legacyUninstallKey -ne (Get-Item -LiteralPath $uninstallKey).PSPath) {
    # This is cleanup after the new install has fully committed. A stale legacy
    # entry is harmless, so cleanup failure must not roll back healthy files.
    Remove-Item -LiteralPath $legacyUninstallKey -Recurse -Force -ErrorAction SilentlyContinue
  }
} catch {
  $installError = $_
  [Environment]::SetEnvironmentVariable("Path", $previousUserPath, "User")
  Remove-Item -LiteralPath $uninstallKey -Recurse -Force -ErrorAction SilentlyContinue
  if ($previousUninstall) {
    New-Item -Path $uninstallKey -Force | Out-Null
    foreach ($name in @("DisplayName", "DisplayVersion", "Publisher", "InstallLocation", "DisplayIcon", "UninstallString", "QuietUninstallString", "NoModify", "NoRepair")) {
      if ($null -ne $previousUninstall.$name) {
        $kind = if ($name -in @("NoModify", "NoRepair")) { "DWord" } else { "String" }
        New-ItemProperty -Path $uninstallKey -Name $name -Value $previousUninstall.$name -PropertyType $kind -Force | Out-Null
      }
    }
  }
  # Never delete the original tree when the initial old -> backup rename
  # failed.  That was the b6 rollback bug: a locked UGSci.exe made Move-Item
  # fail, then the catch block removed the still-original installation and
  # incorrectly claimed it had restored it.
  $rollbackError = $null
  try {
    if ($newTreeActivated -and (Test-Path -LiteralPath $installDir)) {
      Remove-DirectoryLongPathSafe -Path $installDir
      $newTreeActivated = $false
    }
    if ($previousTreeMoved) {
      if (-not (Test-Path -LiteralPath $backupDir -PathType Container)) {
        throw "rollback cannot find the previous installation at $backupDir"
      }
      Move-Item -LiteralPath $backupDir -Destination $installDir -Force
      $previousTreeMoved = $false
      if (-not (Test-Path -LiteralPath (Join-Path $installDir "UGSci.exe") -PathType Leaf)) {
        throw "rollback restored an invalid application tree"
      }
    }
  } catch {
    $rollbackError = $_
  }
  try {
    if ($previousStartMenuShortcut) {
      [IO.File]::WriteAllBytes($startMenuShortcutPath, $previousStartMenuShortcut)
    } else {
      Remove-Item -LiteralPath $startMenuShortcutPath -Force -ErrorAction SilentlyContinue
    }
    if ($previousDesktopShortcut) {
      [IO.File]::WriteAllBytes($desktopShortcutPath, $previousDesktopShortcut)
    } else {
      Remove-Item -LiteralPath $desktopShortcutPath -Force -ErrorAction SilentlyContinue
    }
  } catch {
    # Shortcut restoration is best effort; the application files, registry,
    # and PATH restoration above remain the rollback source of truth.
  }
  $rollbackState = if ($rollbackError) {
    "rollback failed: $rollbackError"
  } elseif (Test-Path -LiteralPath (Join-Path $installDir "UGSci.exe") -PathType Leaf) {
    "the previous installation is available"
  } elseif ($previousTreeMoved) {
    "the previous installation could not be restored"
  } else {
    "the original installation was not modified"
  }
  if (-not $rollbackError -and $DeferredCommit) {
    Remove-Item -LiteralPath $TransactionFile -Force -ErrorAction SilentlyContinue
  }
  throw "Portable installation failed; $rollbackState. $installError"
}
} finally {
  try { Remove-DirectoryLongPathSafe -Path $stagingDir } catch { }
  if ($mutexAcquired) { $mutex.ReleaseMutex() }
  $mutex.Dispose()
}

Write-Host "UGSci Desktop $version installed to $installDir"
if (-not $Silent) { Write-Host "You can launch it from the Start menu or desktop shortcut." }
# Native tools such as robocopy use successful non-zero status codes.  Do not
# let PowerShell propagate the last native status and make Setup.exe report a
# false installation failure after the transaction committed successfully.
exit 0
'@ | Set-Content -LiteralPath $installPs1 -Encoding UTF8

@'
param(
  [Parameter(Mandatory = $true)] [string]$InstallDir,
  [string]$CleanupScript,
  [int]$LauncherPid
)
$ErrorActionPreference = "Stop"
$installDir = [IO.Path]::GetFullPath($InstallDir).TrimEnd('\')
$installRoot = [IO.Path]::GetPathRoot($installDir).TrimEnd('\')
if ($installDir.Equals($installRoot, [StringComparison]::OrdinalIgnoreCase)) {
  throw "Refusing to uninstall a drive root"
}
$versionPath = Join-Path $installDir "version.json"
if (-not (Test-Path -LiteralPath $versionPath -PathType Leaf)) {
  throw "UGSci Desktop version marker is missing"
}
$installedVersion = Get-Content -LiteralPath $versionPath -Raw -Encoding UTF8 | ConvertFrom-Json
if ($installedVersion.product -ne "UGSci Desktop") {
  throw "The selected folder is not a recognized UGSci Desktop installation"
}
if (-not (Test-Path -LiteralPath (Join-Path $installDir "UGSci.exe") -PathType Leaf) -and
    -not (Test-Path -LiteralPath (Join-Path $installDir "qwenpaw-desktop.exe") -PathType Leaf) -and
    -not (Test-Path -LiteralPath (Join-Path $installDir "Uninstall.exe") -PathType Leaf)) {
  throw "UGSci Desktop application markers are missing"
}
$prefix = $installDir + '\'
$waitPids = @()
if ($LauncherPid -gt 0) { $waitPids += $LauncherPid }
$launcherProcess = Get-CimInstance Win32_Process -Filter "ProcessId=$LauncherPid" -ErrorAction SilentlyContinue
if ($launcherProcess -and $launcherProcess.ParentProcessId) {
  $launcherParent = Get-CimInstance Win32_Process -Filter "ProcessId=$($launcherProcess.ParentProcessId)" -ErrorAction SilentlyContinue
  if ($launcherParent.ExecutablePath -and
      $launcherParent.ExecutablePath.StartsWith($prefix, [StringComparison]::OrdinalIgnoreCase)) {
    $waitPids += [int]$launcherParent.ProcessId
  }
}
Get-CimInstance Win32_Process | Where-Object {
  $_.ExecutablePath -and
  $_.ExecutablePath.StartsWith($prefix, [StringComparison]::OrdinalIgnoreCase) -and
  ($waitPids -notcontains [int]$_.ProcessId)
} | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
$cliPathFile = Join-Path $installDir "cli-path.txt"
if (Test-Path -LiteralPath $cliPathFile) {
  $cliPath = (Get-Content -LiteralPath $cliPathFile -Raw).Trim()
  & (Join-Path $installDir "update-qwenpaw-path.ps1") -Action Remove -Path $cliPath
}
Remove-Item -LiteralPath "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\UGSci Desktop" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath (Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs\UGSci Desktop.lnk") -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath (Join-Path ([Environment]::GetFolderPath("Desktop")) "UGSci Desktop.lnk") -Force -ErrorAction SilentlyContinue
& (Join-Path $installDir "update-qwenpaw-path.ps1") -Action Remove -Path (Join-Path $installDir "binaries\python-runtime\python\Scripts")
$cleanupScript = if ($CleanupScript) { $CleanupScript } else { Join-Path $installDir "uninstall-cleanup.ps1" }
if (Test-Path -LiteralPath $cleanupScript) {
  $waitPidValue = ($waitPids | Select-Object -Unique) -join ","
  $cleanupProcess = Start-Process powershell.exe -ArgumentList @(
    "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "`"$cleanupScript`"",
    "-InstallDir", "`"$installDir`"", "-WaitPids", "`"$waitPidValue`""
  ) -WindowStyle Hidden -PassThru
  if (-not $cleanupProcess) { throw "UGSci Desktop cleanup process did not start" }
} else {
  throw "UGSci Desktop cleanup script is missing"
}
'@ | Set-Content -LiteralPath $uninstallPs1 -Encoding UTF8

@'
param(
  [Parameter(Mandatory = $true)] [string]$InstallDir,
  [string]$WaitPids
)
$installDir = [IO.Path]::GetFullPath($InstallDir).TrimEnd('\')
$installRoot = [IO.Path]::GetPathRoot($installDir).TrimEnd('\')
if ($installDir.Equals($installRoot, [StringComparison]::OrdinalIgnoreCase)) { exit 2 }
$versionPath = Join-Path $installDir "version.json"
try {
  $installedVersion = Get-Content -LiteralPath $versionPath -Raw -Encoding UTF8 | ConvertFrom-Json
  if ($installedVersion.product -ne "UGSci Desktop") { exit 2 }
} catch { exit 2 }
if (-not (Test-Path -LiteralPath (Join-Path $installDir "UGSci.exe") -PathType Leaf) -and
    -not (Test-Path -LiteralPath (Join-Path $installDir "qwenpaw-desktop.exe") -PathType Leaf) -and
    -not (Test-Path -LiteralPath (Join-Path $installDir "Uninstall.exe") -PathType Leaf)) { exit 2 }
foreach ($pidText in @($WaitPids -split ',')) {
  $waitPid = 0
  if ([int]::TryParse($pidText, [ref]$waitPid) -and $waitPid -gt 0) {
    Wait-Process -Id $waitPid -ErrorAction SilentlyContinue
  }
}
for ($attempt = 0; $attempt -lt 5 -and (Test-Path -LiteralPath $installDir); $attempt++) {
  try {
    $ioPath = if ($installDir.StartsWith('\\')) {
      '\\?\UNC\' + $installDir.Substring(2)
    } else { '\\?\' + $installDir }
    if ([IO.Directory]::Exists($ioPath)) { [IO.Directory]::Delete($ioPath, $true) }
  } catch { }
  if (Test-Path -LiteralPath $installDir) { Start-Sleep -Seconds 1 }
}
Remove-Item -LiteralPath $MyInvocation.MyCommand.Path -Force -ErrorAction SilentlyContinue
'@ | Set-Content -LiteralPath $uninstallCleanupPs1 -Encoding UTF8

[ordered]@{
  schema = 1
  product = "UGSci Desktop"
  version = $Version
  platform = "windows-x86_64"
  entrypoint = "Setup.exe"
  payload = "payload"
} | ConvertTo-Json | Set-Content -LiteralPath $versionManifest -Encoding UTF8

$bootstrapSource = Join-Path $PSScriptRoot "windows_portable_bootstrap.cs"
if (-not (Test-Path -LiteralPath $bootstrapSource -PathType Leaf)) {
  throw "Portable Setup bootstrap source not found: $bootstrapSource"
}
Remove-Item -LiteralPath $setupExe -Force -ErrorAction SilentlyContinue
$frameworkCompilers = @(
  (Join-Path $env:WINDIR "Microsoft.NET\Framework64\v4.0.30319\csc.exe"),
  (Join-Path $env:WINDIR "Microsoft.NET\Framework\v4.0.30319\csc.exe")
)
$csc = $frameworkCompilers | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } | Select-Object -First 1
if (-not $csc) { throw "Windows .NET Framework C# compiler was not found" }
$iconPath = Join-Path $PSScriptRoot "..\pack\assets\icon.ico"
if (-not (Test-Path -LiteralPath $iconPath -PathType Leaf)) {
  throw "Setup icon was not found: $iconPath"
}
& $csc /nologo /target:winexe /optimize+ "/out:$setupExe" `
  "/win32icon:$iconPath" `
  /reference:System.dll /reference:System.Core.dll /reference:System.Drawing.dll /reference:System.Windows.Forms.dll `
  $bootstrapSource
if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $setupExe -PathType Leaf)) {
  throw "Portable Setup bootstrap compilation failed (exit $LASTEXITCODE)"
}
Copy-Item -LiteralPath $setupExe -Destination (Join-Path $PayloadRoot "Setup.exe") -Force
$uninstallLauncher = Join-Path $PayloadRoot "Uninstall.exe"
$temporaryRoot = if ($env:RUNNER_TEMP) { $env:RUNNER_TEMP } else { $env:TEMP }
$uninstallLauncherSource = Join-Path $temporaryRoot "qwenpaw-portable-uninstall-bootstrap.cs"
@'
using System;
using System.Diagnostics;
using System.IO;

internal static class PortableUninstallBootstrap
{
    private static int Main(string[] args)
    {
        string setup = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Setup.exe");
        if (!File.Exists(setup)) return 3;
        bool silent = false;
        foreach (string arg in args)
            if (string.Equals(arg, "--silent", StringComparison.OrdinalIgnoreCase)) silent = true;
        var start = new ProcessStartInfo {
            FileName = setup,
            Arguments = "--uninstall" + (silent ? " --silent" : ""),
            WorkingDirectory = AppDomain.CurrentDomain.BaseDirectory,
            UseShellExecute = false,
            CreateNoWindow = true,
            WindowStyle = ProcessWindowStyle.Hidden
        };
        using (Process process = Process.Start(start)) {
            if (process == null) return 3;
            process.WaitForExit();
            return process.ExitCode;
        }
    }
}
'@ | Set-Content -LiteralPath $uninstallLauncherSource -Encoding UTF8
try {
  & $csc /nologo /target:winexe /optimize+ "/out:$uninstallLauncher" `
    "/win32icon:$iconPath" /reference:System.dll /reference:System.Core.dll `
    $uninstallLauncherSource
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $uninstallLauncher -PathType Leaf)) {
    throw "Portable uninstall bootstrap compilation failed (exit $LASTEXITCODE)"
  }
} finally {
  Remove-Item -LiteralPath $uninstallLauncherSource -Force -ErrorAction SilentlyContinue
}

# Python bytecode caches are machine-local, reproducible and unnecessary in
# the installer. Compress-Archive can silently omit sufficiently deep .pyc
# paths while leaving them in the checksum manifest, producing a ZIP that is
# guaranteed to fail Setup verification. Remove them before hashing and use a
# ZIP builder that verifies the final member set and CRCs.
python (Join-Path $PSScriptRoot "prepare_windows_portable_tree.py") `
  --root $PortableRoot --manifest $checksumManifest
if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $checksumManifest -PathType Leaf)) {
  throw "Portable tree preparation and checksum generation failed (exit $LASTEXITCODE)"
}

$ZipPath = [IO.Path]::GetFullPath($ZipPath)
$zipParent = Split-Path -Parent $ZipPath
New-Item -ItemType Directory -Path $zipParent -Force | Out-Null
if (Test-Path $ZipPath) { Remove-Item -LiteralPath $ZipPath -Force }
$zipBuilder = Join-Path $PSScriptRoot "build_windows_portable_zip.py"
if (-not (Test-Path -LiteralPath $zipBuilder -PathType Leaf)) {
  throw "Verified portable ZIP builder was not found: $zipBuilder"
}
& python $zipBuilder --root $PortableRoot --output $ZipPath
if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $ZipPath -PathType Leaf)) {
  throw "Verified portable ZIP creation failed (exit $LASTEXITCODE)"
}
Write-Host "Portable Windows installer created: $ZipPath"
