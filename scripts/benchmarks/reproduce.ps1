param(
    [Parameter(Mandatory = $true)]
    [string]$OutputDirectory,
    [ValidateRange(1, 10)]
    [int]$Repeats = 3,
    [ValidateRange(0, 5)]
    [int]$LiveRepeats = 0
)

$ErrorActionPreference = 'Stop'
$benchmarkRepository = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$benchmarkPython = Join-Path $benchmarkRepository '.venv/Scripts/python.exe'
$benchmarkOutput = [System.IO.Path]::GetFullPath($OutputDirectory)
if (Test-Path -LiteralPath $benchmarkOutput) {
    throw 'Choose a new output directory for each benchmark run.'
}
$benchmarkPreviousUtf8 = $env:PYTHONUTF8
Push-Location -LiteralPath $benchmarkRepository
try {
    $env:PYTHONUTF8 = '1'
    & $benchmarkPython -m pytest scripts/benchmarks/test_tool_activation_server.py -q -p no:cacheprovider
    if ($LASTEXITCODE -ne 0) { throw 'Benchmark driver regression checks failed.' }

    & $benchmarkPython scripts/benchmarks/tool_activation.py --output $benchmarkOutput --repeats $Repeats --live-repeats $LiveRepeats
    if ($LASTEXITCODE -ne 0) { throw 'Application benchmark setup or execution failed.' }

    $benchmarkCatalog = Join-Path $benchmarkOutput 'catalog.json'
    & $benchmarkPython scripts/benchmarks/tool_activation_micro.py --catalog $benchmarkCatalog --output $benchmarkOutput
    if ($LASTEXITCODE -ne 0) { throw 'Catalog or file-scan benchmark failed.' }

    & $benchmarkPython scripts/benchmarks/tool_activation_micro.py --catalog $benchmarkCatalog --output $benchmarkOutput --exposure-only
    if ($LASTEXITCODE -ne 0) { throw 'Schema exposure benchmark failed.' }

    & $benchmarkPython scripts/benchmarks/tool_activation_transport.py --catalog $benchmarkCatalog --output $benchmarkOutput
    if ($LASTEXITCODE -ne 0) { throw 'MCP transport benchmark failed.' }

    & $benchmarkPython scripts/benchmarks/tool_activation_transport.py --catalog $benchmarkCatalog --output $benchmarkOutput --periodic-only
    if ($LASTEXITCODE -ne 0) { throw 'Periodic refresh benchmark failed.' }

    $benchmarkSummary = Get-Content -LiteralPath (Join-Path $benchmarkOutput 'summary.json') -Raw | ConvertFrom-Json
    & $benchmarkPython scripts/benchmarks/tool_activation_observe.py --root $benchmarkSummary.fixture_root --output $benchmarkOutput
    if ($LASTEXITCODE -ne 0) { throw 'Session observation export failed.' }

    & $benchmarkPython scripts/benchmarks/tool_activation_report.py --output $benchmarkOutput
    if ($LASTEXITCODE -ne 0) { throw 'Report generation failed.' }
}
finally {
    $env:PYTHONUTF8 = $benchmarkPreviousUtf8
    Pop-Location
}
