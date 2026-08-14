param([string]$BinariesDir)

$ErrorActionPreference = "Stop"
if (-not $BinariesDir) { throw "BinariesDir is required" }
$output = Join-Path ([IO.Path]::GetFullPath($BinariesDir)) "cli"
New-Item -ItemType Directory -Path $output -Force | Out-Null
$source = Join-Path $PSScriptRoot "windows_qwenpaw_cli_launcher.cs"
$compiler = @(
  (Join-Path $env:WINDIR "Microsoft.NET\Framework64\v4.0.30319\csc.exe"),
  (Join-Path $env:WINDIR "Microsoft.NET\Framework\v4.0.30319\csc.exe")
) | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } | Select-Object -First 1
if (-not $compiler) { throw "Windows .NET Framework C# compiler was not found" }
$qwenpaw = Join-Path $output "qwenpaw.exe"
& $compiler /nologo /target:exe /optimize+ "/out:$qwenpaw" `
  /reference:System.dll /reference:System.Core.dll /reference:System.Web.Extensions.dll $source
if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $qwenpaw -PathType Leaf)) {
  throw "QwenPaw CLI launcher compilation failed (exit $LASTEXITCODE)"
}
Copy-Item -LiteralPath $qwenpaw -Destination (Join-Path $output "copaw.exe") -Force
Write-Host "Windows QwenPaw CLI launchers built: $output"
