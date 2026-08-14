param(
  [string]$OutputPath = ""
)

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
if (-not $OutputPath) {
  $OutputPath = Join-Path $repoRoot "console\src-tauri\binaries\update-assistant\UGSciUpdateAssistant.exe"
}
$OutputPath = [IO.Path]::GetFullPath($OutputPath)
$source = Join-Path $PSScriptRoot "windows_update_assistant.cs"
$icon = Join-Path $repoRoot "scripts\pack\assets\icon.ico"
$compiler = @(
  (Join-Path $env:WINDIR "Microsoft.NET\Framework64\v4.0.30319\csc.exe"),
  (Join-Path $env:WINDIR "Microsoft.NET\Framework\v4.0.30319\csc.exe")
) | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } | Select-Object -First 1
if (-not $compiler) { throw "Windows .NET Framework C# compiler was not found" }
if (-not (Test-Path -LiteralPath $source -PathType Leaf)) { throw "Update assistant source is missing: $source" }
if (-not (Test-Path -LiteralPath $icon -PathType Leaf)) { throw "Update assistant icon is missing: $icon" }
New-Item -ItemType Directory -Path (Split-Path -Parent $OutputPath) -Force | Out-Null
Remove-Item -LiteralPath $OutputPath -Force -ErrorAction SilentlyContinue
& $compiler /nologo /target:winexe /optimize+ "/out:$OutputPath" "/win32icon:$icon" `
  /reference:System.dll /reference:System.Core.dll /reference:System.Drawing.dll `
  /reference:System.Windows.Forms.dll /reference:System.IO.Compression.dll `
  /reference:System.IO.Compression.FileSystem.dll /reference:System.Web.Extensions.dll $source
if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $OutputPath -PathType Leaf)) {
  throw "Windows update assistant compilation failed (exit $LASTEXITCODE)"
}
Write-Host "Windows update assistant built: $OutputPath"
