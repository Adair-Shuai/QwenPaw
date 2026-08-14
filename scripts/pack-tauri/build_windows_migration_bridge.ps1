param(
  [Parameter(Mandatory = $true)] [string]$PackagePath,
  [Parameter(Mandatory = $true)] [string]$Version,
  [Parameter(Mandatory = $true)] [string]$OutputPath
)

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$source = Join-Path $PSScriptRoot "windows_migration_bridge.cs"
$icon = Join-Path $repoRoot "scripts\pack\assets\icon.ico"
$PackagePath = (Resolve-Path -LiteralPath $PackagePath).Path
$OutputPath = [IO.Path]::GetFullPath($OutputPath)
if ($Version -notmatch '^[0-9A-Za-z][0-9A-Za-z.+-]{0,63}$') { throw "Unsafe migration version" }
$compiler = @(
  (Join-Path $env:WINDIR "Microsoft.NET\Framework64\v4.0.30319\csc.exe"),
  (Join-Path $env:WINDIR "Microsoft.NET\Framework\v4.0.30319\csc.exe")
) | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } | Select-Object -First 1
if (-not $compiler) { throw "Windows .NET Framework C# compiler was not found" }
$temporaryRoot = Join-Path $env:TEMP ("ugsci-bridge-build-" + [Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $temporaryRoot | Out-Null
try {
  $generatedSource = Join-Path $temporaryRoot "windows_migration_bridge.cs"
  $compiled = Join-Path $temporaryRoot "UGSciMigrationBridge.exe"
  $sourceText = [IO.File]::ReadAllText($source, [Text.Encoding]::UTF8).Replace("__UGSCI_VERSION__", $Version)
  [IO.File]::WriteAllText($generatedSource, $sourceText, (New-Object Text.UTF8Encoding($false)))
  & $compiler /nologo /target:winexe /optimize+ "/out:$compiled" "/win32icon:$icon" `
    /reference:System.dll /reference:System.Core.dll /reference:System.Windows.Forms.dll `
    /reference:System.IO.Compression.dll /reference:System.IO.Compression.FileSystem.dll $generatedSource
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $compiled -PathType Leaf)) {
    throw "Windows migration bridge compilation failed (exit $LASTEXITCODE)"
  }
  New-Item -ItemType Directory -Path (Split-Path -Parent $OutputPath) -Force | Out-Null
  if (Test-Path -LiteralPath $OutputPath) { Remove-Item -LiteralPath $OutputPath -Force }
  $output = [IO.File]::Open($OutputPath, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
  try {
    foreach ($inputPath in @($compiled, $PackagePath)) {
      $input = [IO.File]::OpenRead($inputPath)
      try { $input.CopyTo($output) } finally { $input.Dispose() }
    }
    $hash = [Security.Cryptography.SHA256]::Create()
    try {
      $packageStream = [IO.File]::OpenRead($PackagePath)
      try { $digest = $hash.ComputeHash($packageStream) } finally { $packageStream.Dispose() }
    } finally { $hash.Dispose() }
    $writer = New-Object IO.BinaryWriter($output, [Text.Encoding]::ASCII, $true)
    try {
      $writer.Write([int64](Get-Item -LiteralPath $PackagePath).Length)
      $writer.Write([byte[]]$digest)
      $writer.Write([Text.Encoding]::ASCII.GetBytes("UGSCIBRIDGEV1!!!"))
      $writer.Flush()
    } finally { $writer.Dispose() }
  } finally { $output.Dispose() }
  Write-Host "Windows b5-to-b7 migration bridge built: $OutputPath"
} finally {
  Remove-Item -LiteralPath $temporaryRoot -Recurse -Force -ErrorAction SilentlyContinue
}
