param(
    [switch]$Apply,
    [string]$PushedCommit
)

$ErrorActionPreference = 'Stop'
$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..')).TrimEnd('\')
$planFile = Join-Path $PSScriptRoot 'cleanup-plan.json'
$resultFile = Join-Path $PSScriptRoot 'cleanup-result.json'
$candidates = @(
    @{ path = 'console/src-tauri/target'; reason = 'Local Rust compilation and desktop package outputs'; family = 'desktop-build' },
    @{ path = 'console/src-tauri/binaries'; reason = 'Generated desktop packaging runtimes and staging'; family = 'desktop-build' },
    @{ path = 'build'; reason = 'Generated Python wheel/sdist staging'; family = 'python-build' },
    @{ path = 'dist'; reason = 'Local plugin and release package outputs'; family = 'package-output' },
    @{ path = 'console/dist'; reason = 'Generated console production assets'; family = 'frontend-build' },
    @{ path = 'console/dist-tauri'; reason = 'Generated desktop bootstrap assets'; family = 'frontend-build' },
    @{ path = 'website/dist'; reason = 'Generated website assets'; family = 'frontend-build' },
    @{ path = '.mypy_cache'; reason = 'Regenerable mypy cache'; family = 'tool-cache' },
    @{ path = '.ruff_cache'; reason = 'Regenerable Ruff cache'; family = 'tool-cache' },
    @{ path = 'tmp/ci-node22'; reason = 'Old isolated CI Node installation'; family = 'test-environment' },
    @{ path = '.codex-tmp/document-forms/ci-env'; reason = 'Old isolated document-forms test dependencies'; family = 'test-environment' },
    @{ path = '.codex-tmp/release-beta4-windows-bm25-42145710955/desktop-lock-env'; reason = 'Old isolated desktop dependency verification environment'; family = 'test-environment' },
    @{ path = '.codex-tmp/release-beta4-windows-bm25-42145710955/installed-backend'; reason = 'Old wheel install verification output'; family = 'test-environment' },
    @{ path = '.codex-tmp/release-beta4-windows-bm25-42145710955/exact-runtime'; reason = 'Old extracted runtime for package verification'; family = 'test-environment' },
    @{ path = '.codex-tmp/ugsci-size-bvix35t6/candidate'; reason = 'Old temporary plugin packaging candidate; canonical local data retained'; family = 'package-output' },
    @{ path = '.codex-tmp/ugsci-size-bvix35t6/candidate-full.zip'; reason = 'Old package size experiment archive'; family = 'package-output' },
    @{ path = '.codex-tmp/ugsci-size-bvix35t6/candidate-delta-estimate.zip'; reason = 'Old package size experiment archive'; family = 'package-output' },
    @{ path = '.codex-tmp/ugsci-size-8gstqytb/candidate'; reason = 'Old temporary plugin packaging candidate; canonical local data retained'; family = 'package-output' },
    @{ path = '.codex-tmp/ugsci-size-8gstqytb/candidate-full.zip'; reason = 'Old package size experiment archive'; family = 'package-output' },
    @{ path = '.codex-tmp/ugsci-size-8gstqytb/candidate-delta-estimate.zip'; reason = 'Old package size experiment archive'; family = 'package-output' },
    @{ path = '.codex-tmp/current-component/artifacts'; reason = 'Old local component package experiment cache; metadata retained'; family = 'package-output' },
    @{ path = '.codex-tmp/prev-component/artifacts'; reason = 'Old local component package experiment cache; metadata retained'; family = 'package-output' },
    @{ path = 'deliverables/release-beta3/postpublish-cache/desktop'; reason = 'Local installer download cache; user explicitly requested removal of local packages'; family = 'package-output' },
    @{ path = 'deliverables/release-beta3/postpublish-cache/cdn/artifacts'; reason = 'Local component archive download cache; release audit metadata retained'; family = 'package-output' }
)

function Assert-WorkspacePath([string]$Relative) {
    $absolute = [IO.Path]::GetFullPath((Join-Path $repoRoot $Relative))
    if (-not $absolute.StartsWith($repoRoot + '\', [StringComparison]::OrdinalIgnoreCase)) {
        throw "Target outside repository: $Relative"
    }
    $cursor = $absolute
    while ($cursor -and $cursor -ne $repoRoot) {
        if (Test-Path -LiteralPath $cursor) {
            if ((Get-Item -LiteralPath $cursor -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) {
                throw "Reparse point in target ancestry: $Relative"
            }
        }
        $cursor = [IO.Path]::GetDirectoryName($cursor)
    }
    return $absolute
}

function Get-TreeSummary([string]$Absolute) {
    $stack = [Collections.Generic.Stack[IO.FileSystemInfo]]::new()
    $stack.Push((Get-Item -LiteralPath $Absolute -Force))
    $records = [Collections.Generic.List[string]]::new()
    [long]$bytes = 0
    [long]$files = 0
    while ($stack.Count) {
        $entry = $stack.Pop()
        if ($entry.Attributes -band [IO.FileAttributes]::ReparsePoint) {
            throw "Linked entry in target: $($entry.FullName)"
        }
        if ($entry.Name -eq '.git') { throw "Nested Git content: $($entry.FullName)" }
        if ($entry -is [IO.DirectoryInfo]) {
            foreach ($child in $entry.EnumerateFileSystemInfos()) { $stack.Push($child) }
        } else {
            $files++
            $bytes += $entry.Length
            $relative = $entry.FullName.Substring($Absolute.Length).Replace('\', '/')
            $records.Add("$relative`t$($entry.Length)`t$($entry.LastWriteTimeUtc.Ticks)")
        }
    }
    $records.Sort([StringComparer]::Ordinal)
    $data = [Text.Encoding]::UTF8.GetBytes([string]::Join("`n", $records))
    $digest = [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($data)).ToLowerInvariant()
    return [ordered]@{ bytes = $bytes; files = $files; metadata_sha256 = $digest }
}

Set-Location -LiteralPath $repoRoot
$tracked = @(& git -c core.quotepath=false ls-files)
if ($LASTEXITCODE -ne 0) { throw 'Unable to inspect Git index' }
$worktrees = @(& git worktree list --porcelain | Where-Object { $_.StartsWith('worktree ') } | ForEach-Object { $_.Substring(9).Replace('/', '\') })
if ($LASTEXITCODE -ne 0) { throw 'Unable to inspect Git worktrees' }

function Assert-UntrackedTarget([string]$Relative, [string]$Absolute) {
    foreach ($file in $tracked) {
        if ($file -eq $Relative -or $file.StartsWith($Relative + '/', [StringComparison]::OrdinalIgnoreCase)) {
            throw "Tracked content in cleanup target: $Relative"
        }
    }
    foreach ($worktree in $worktrees) {
        if ($worktree -eq $Absolute -or $worktree.StartsWith($Absolute + '\', [StringComparison]::OrdinalIgnoreCase)) {
            throw "Registered worktree in cleanup target: $Relative"
        }
    }
}

if (-not $Apply) {
    $rows = @()
    $skipped = @()
    foreach ($candidate in $candidates) {
        $absolute = Assert-WorkspacePath $candidate.path
        if (-not (Test-Path -LiteralPath $absolute)) { continue }
        Assert-UntrackedTarget $candidate.path $absolute
        try {
            $summary = Get-TreeSummary $absolute
            $rows += [ordered]@{
                path = $candidate.path
                reason = $candidate.reason
                family = $candidate.family
                bytes = $summary.bytes
                files = $summary.files
                metadata_sha256 = $summary.metadata_sha256
            }
            Write-Output "Inventoried $($candidate.path): $($summary.bytes) bytes"
        } catch {
            $skipped += @{ path = $candidate.path; reason = $_.Exception.Message }
            Write-Output "Retained $($candidate.path): $($_.Exception.Message)"
        }
    }
    [long]$plannedBytes = 0
    foreach ($row in $rows) { $plannedBytes += $row.bytes }
    [ordered]@{
        created_at = [DateTimeOffset]::Now.ToString('o')
        base_commit = (& git rev-parse HEAD)
        deletion_requires = 'Local HEAD and the remote branch must equal PushedCommit; unchanged tree metadata; no tracked files, links, nested Git repositories, or active executable images under the target; no active desktop compilers.'
        planned_bytes = $plannedBytes
        targets = $rows
        skipped = $skipped
    } | ConvertTo-Json -Depth 7 | Set-Content -LiteralPath $planFile -Encoding utf8NoBOM
    exit 0
}

if ($PushedCommit -notmatch '^[0-9a-f]{40}$') { throw 'A verified full pushed commit SHA is required' }
$head = (& git rev-parse HEAD).Trim()
$branch = (& git branch --show-current).Trim()
$remoteLine = @(& git ls-remote --exit-code origin "refs/heads/$branch")
if ($LASTEXITCODE -ne 0 -or $remoteLine.Count -ne 1) { throw 'Unable to verify remote branch' }
$remoteCommit = ($remoteLine[0] -split '\s+')[0]
if ($head -ne $PushedCommit -or $remoteCommit -ne $PushedCommit) {
    throw 'Deletion blocked: local HEAD and pushed remote commit do not match'
}
$plan = Get-Content -LiteralPath $planFile -Raw | ConvertFrom-Json
$beforeFree = [IO.DriveInfo]::new($repoRoot).AvailableFreeSpace
$results = @()
foreach ($row in $plan.targets) {
    $absolute = Assert-WorkspacePath $row.path
    Assert-UntrackedTarget $row.path $absolute
    $timer = [Diagnostics.Stopwatch]::StartNew()
    try {
        if (-not ($candidates | Where-Object { $_.path -eq $row.path })) { throw 'Target absent from reviewed allowlist' }
        # WMI process queries are unreliable on this host ("call cancelled").
        # Query live executable images directly; preserve running service assets,
        # reject changed trees, and let locked-file errors retain affected files.
        $live = @([Diagnostics.Process]::GetProcesses() | ForEach-Object {
            try {
                [pscustomobject]@{
                    ProcessId = $_.Id
                    Name = $_.ProcessName + '.exe'
                    ExecutablePath = $_.MainModule.FileName
                }
            } catch {
                # Exited/protected system processes have no inspectable image.
            }
        })
        $used = @($live | Where-Object {
                ($_.ExecutablePath -and ($_.ExecutablePath -eq $absolute -or $_.ExecutablePath.StartsWith($absolute + '\', [StringComparison]::OrdinalIgnoreCase))) -or
                ($row.family -eq 'desktop-build' -and $_.Name -in @('cargo.exe', 'rustc.exe', 'qwenpaw-desktop.exe', 'qwenpaw-computer-use-helper.exe')) -or
                ($row.path -eq '.mypy_cache' -and $_.Name -eq 'mypy.exe') -or
                ($row.path -eq '.ruff_cache' -and $_.Name -eq 'ruff.exe')
        })
        if ($used.Count) { throw "Active process references target: $([string]::Join(',', @($used.ProcessId)))" }
        $fresh = Get-TreeSummary $absolute
        if ($fresh.metadata_sha256 -ne $row.metadata_sha256) { throw 'Target changed after inventory; retained for reinspection' }
        Remove-Item -LiteralPath $absolute -Recurse -Force
        if (Test-Path -LiteralPath $absolute) { throw 'Target still exists after removal' }
        $results += [ordered]@{ path = $row.path; family = $row.family; bytes = $row.bytes; files = $row.files; removed = $true; seconds = $timer.Elapsed.TotalSeconds }
        Write-Output "Removed $($row.path): $($row.bytes) bytes"
    } catch {
        $results += [ordered]@{ path = $row.path; removed = $false; reason = $_.Exception.Message }
        Write-Output "Retained/incomplete $($row.path): $($_.Exception.Message)"
    }
    [ordered]@{
        executed_at = [DateTimeOffset]::Now.ToString('o')
        pushed_commit = $PushedCommit
        remote_verified_before_deletion = $remoteCommit
        before_free_bytes = $beforeFree
        after_free_bytes = [IO.DriveInfo]::new($repoRoot).AvailableFreeSpace
        results = $results
    } | ConvertTo-Json -Depth 7 | Set-Content -LiteralPath $resultFile -Encoding utf8NoBOM
}
