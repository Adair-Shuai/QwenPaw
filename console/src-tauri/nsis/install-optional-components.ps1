param(
    [Parameter(Mandatory = $true)]
    [string]$PythonPath,

    [Parameter(Mandatory = $true)]
    [string]$InstallDir,

    [Parameter(Mandatory = $true)]
    [ValidateSet("science", "whisper")]
    [string]$Component
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
$indexUrl = if ($env:PIP_INDEX_URL) {
    $env:PIP_INDEX_URL
} else {
    "https://pypi.tuna.tsinghua.edu.cn/simple/"
}
$extraIndexUrl = if ($env:PIP_EXTRA_INDEX_URL) {
    $env:PIP_EXTRA_INDEX_URL
} else {
    "https://mirrors.aliyun.com/pypi/simple/"
}

if (-not (Test-Path -LiteralPath $PythonPath -PathType Leaf)) {
    throw "Bundled Python was not found: $PythonPath"
}

$packages = switch ($Component) {
    "science" { @("pandas", "scipy", "matplotlib") }
    "whisper" { @("openai-whisper>=20231117", "imageio-ffmpeg>=0.6.0") }
}

Write-Output "Installing optional component '$Component' from $indexUrl"
& $PythonPath -m pip install `
    --disable-pip-version-check `
    --no-input `
    --upgrade `
    --prefer-binary `
    --index-url $indexUrl `
    --extra-index-url $extraIndexUrl `
    @packages

if ($LASTEXITCODE -ne 0) {
    throw "pip failed with exit code $LASTEXITCODE"
}

if ($Component -eq "whisper") {
    $ffmpegSource = (& $PythonPath -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())").Trim()
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $ffmpegSource -PathType Leaf)) {
        throw "imageio-ffmpeg did not provide a usable ffmpeg executable"
    }
    $scriptsDir = Join-Path (Split-Path -Parent $PythonPath) "Scripts"
    New-Item -ItemType Directory -Force -Path $scriptsDir | Out-Null
    Copy-Item -LiteralPath $ffmpegSource -Destination (Join-Path $scriptsDir "ffmpeg.exe") -Force
}

$stateDir = Join-Path $InstallDir "optional-components"
New-Item -ItemType Directory -Force -Path $stateDir | Out-Null
Set-Content `
    -LiteralPath (Join-Path $stateDir "$Component.installed") `
    -Value (Get-Date -Format "o") `
    -Encoding ASCII
Write-Output "Optional component '$Component' installed successfully."
