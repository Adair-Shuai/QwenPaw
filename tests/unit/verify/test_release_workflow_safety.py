# -*- coding: utf-8 -*-
"""Regression guards for safe release artifact resume and replacement."""

from __future__ import annotations

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]


def _workflow(name: str) -> str:
    return (REPO_ROOT / ".github" / "workflows" / name).read_text(
        encoding="utf-8",
    )


def test_resumed_artifacts_must_match_release_commit_and_metadata() -> None:
    release = _workflow("release.yml")
    components = _workflow("component-release.yml")

    assert 'source_path="$(jq -r .path' in release
    assert (
        'if [ "$source_path" != ".github/workflows/release.yml" ]' in release
    )
    assert 'if [ "$source_sha" != "$sha" ]' in release
    assert "validate_artifact_reuse_diff" in release
    assert "Cannot reuse artifacts across product change" in release
    assert 'require_source_job_success "build-wheel"' in release
    assert 'require_source_gate_prefix "verify-web / "' in release
    assert (
        'require_source_job_success "build-desktop / build-tauri-windows"'
        in release
    )
    assert (
        'require_source_job_success "build-desktop / build-tauri-macos"'
        in release
    )
    assert 'if [ "$source_conclusion" != "success" ]' not in release
    assert "verify_cleanup_only_failure" in release
    assert "only Stop server cleanup was incomplete" in release
    assert 'validate_artifact_reuse_diff "$windows_sha" "$sha"' in release
    assert 'validate_artifact_reuse_diff "$plugins_sha" "$sha"' in release
    assert 'validate_artifact_reuse_diff "$replacement_sha" "$sha"' in release
    assert "grep -qx 'tauri-updater-meta-windows'" in release
    assert "grep -qx 'tauri-updater-meta-macos'" in release
    assert "Replacement artifact run IDs require artifacts_run_id" in release
    assert (
        "Desktop layout changes require Windows, macOS, and component "
        "replacement artifacts" in release
    )
    assert "scripts/pack-tauri/assemble_desktop_layout.py" in release
    assert release.count('[ -z "$WINDOWS_ARTIFACTS_RUN_ID" ]') >= 1
    assert release.count('[ -z "$MACOS_ARTIFACTS_RUN_ID" ]') >= 1
    assert release.count('[ -z "$COMPONENTS_ARTIFACTS_RUN_ID" ]') >= 1
    assert release.count(".github/workflows/desktop-build.yml") >= 2
    assert ".github/workflows/plugins-build.yml" in release
    assert ".github/workflows/component-release.yml" in release
    assert 'grep -Fqx "build-tauri-windows"$\'\\t\'"success"' in release
    assert 'grep -Fqx "build-tauri-macos"$\'\\t\'"success"' in release
    assert 'grep -Fqx "build-plugins"$\'\\t\'"success"' in release
    assert "build-components (windows-x86_64)" in release
    assert "build-components (macos-aarch64)" in release
    assert "component-release-windows-x86_64" in release
    assert "component-release-macos-aarch64" in release
    desktop_publish = _workflow("desktop-publish.yml")
    assert "release_id:" in desktop_publish
    assert "RELEASE_ID: ${{ inputs.release_id }}" in desktop_publish
    assert "releases/$release_id/assets?per_page=100" in desktop_publish
    assert "releases/$release_id/assets?name=$name" in desktop_publish
    assert "releases/assets/$asset_id" in desktop_publish
    assert (
        ".github/workflows/desktop-build.yml|.github/workflows/release.yml"
        in components
    )
    assert "Desktop artifacts cannot cross product change" in components
    assert 'expected_job="build-desktop / ${expected_job}"' in components


def test_published_release_resume_is_attested_and_has_no_duty_issue() -> None:
    release = _workflow("release.yml")

    assert "allow_published_resume:" in release
    assert (
        "ALLOW_PUBLISHED_RESUME: ${{ inputs.allow_published_resume }}"
        in release
    )
    assert '"$ALLOW_PUBLISHED_RESUME" != "true"' in release
    assert '"$ARTIFACTS_RUN_ID"' in release
    assert "was_draft: ${{ steps.pick.outputs.was_draft }}" in release
    assert 'echo "was_draft=$isDraft"' in release
    assert (
        'release="$(gh api --paginate "repos/$REPO/releases?per_page=100"'
        in release
    )
    assert 'case "$is_draft" in' in release
    assert (
        'gh api --method PATCH "repos/$REPO/releases/$RELEASE_ID" '
        "-F draft=false" in release
    )
    assert "--draft=false --target" not in release
    assert "already published; verifying instead of mutating it" in release
    assert 'test "$target_sha" = "$SHA"' in release
    assert 'test "$published_is_draft" = "false"' in release
    assert 'test "$published_sha" = "$SHA"' in release
    assert "uses: ./.github/workflows/release-duty.yml" not in release
    assert "issues: write" not in release


def test_replacement_desktop_runs_overlay_pair() -> None:
    publish = _workflow("desktop-publish.yml")
    promote = _workflow("desktop-promote.yml")

    assert "UGSci-Desktop-Tauri-*|tauri-updater-meta-*" not in promote
    assert "pattern: UGSci-Desktop-Tauri-*" in promote
    assert "pattern: tauri-updater-meta-*" in promote

    # desktop-publish has separate GitHub Release and OSS jobs.
    assert publish.count("Download replacement Windows updater metadata") == 2
    assert publish.count("Download replacement macOS updater metadata") == 2
    assert (
        publish.count(
            "rm -rf UGSci-Desktop-Tauri-Windows-* tauri-updater-meta-windows",
        )
        == 2
    )
    assert (
        publish.count(
            "rm -rf UGSci-Desktop-Tauri-macOS-* tauri-updater-meta-macos",
        )
        == 2
    )

    assert "Overlay replacement Windows updater metadata" in promote
    assert "Overlay replacement macOS updater metadata" in promote
    assert "cp -a replacement-windows/tauri-updater-meta-windows ." in promote
    assert "cp -a replacement-macos/tauri-updater-meta-macos ." in promote


def test_final_macos_archives_are_reverified_before_publish_and_promote() -> (
    None
):
    publish = _workflow("desktop-publish.yml")
    promote = _workflow("desktop-promote.yml")
    verifier = "scripts/pack-tauri/verify_frozen_plugins.py --archive"

    # Each publish job verifies both the first-install ZIP and updater archive.
    assert publish.count(verifier) == 4
    # Pointer promotion repeats both checks after any replacement overlay.
    assert promote.count(verifier) == 2


def test_windows_native_ui_verification_survives_missing_cdp() -> None:
    action = (
        REPO_ROOT
        / ".github"
        / "actions"
        / "verify-tauri-windows"
        / "action.yml"
    ).read_text(encoding="utf-8")
    launcher = (
        REPO_ROOT / "scripts" / "verify" / "launch_tauri_windows.ps1"
    ).read_text(encoding="utf-8")

    assert "if ($env:CDP_URL) {" in action
    assert '$verifyArgs += @("--cdp-url", $env:CDP_URL)' in action
    assert 'throw "CDP is required' not in launcher
    assert '$cdpUrl = ""' in launcher


def test_component_release_stages_plugins_and_versioned_desktop_layers() -> (
    None
):
    component_release = _workflow("component-release.yml")

    assert "--plugin-roots bundle apps" in component_release
    assert "stage_bundled_plugins.py" in component_release
    assert "stage_desktop_components.py" in component_release
    assert "desktop-components-${{ matrix.target }}" in component_release
    assert "windows_desktop_artifacts_run_id:" in component_release
    assert "macos_desktop_artifacts_run_id:" in component_release
    assert "include_desktop_components:" in component_release
    assert "default: true" in component_release
    assert (
        "run-id: ${{ steps.desktop-source.outputs.run_id }}"
        in component_release
    )
    assert "github-token: ${{ secrets.GITHUB_TOKEN }}" in component_release
    assert ".github/workflows/desktop-build.yml" in component_release
    assert "expected_job='build-tauri-windows'" in component_release
    assert "expected_job='build-tauri-macos'" in component_release

    release = _workflow("release.yml")
    assert (
        "windows_desktop_artifacts_run_id: "
        "${{ format('{0}', github.run_id) }}" in release
    )
    assert (
        "macos_desktop_artifacts_run_id: "
        "${{ format('{0}', github.run_id) }}" in release
    )


def test_mutable_release_metadata_is_promoted_only_after_finalize() -> None:
    release = _workflow("release.yml")
    publish_plugins = release.index("  publish-plugins:")
    publish_components = release.index("  publish-components:")
    finalize = release.index("  finalize:")
    promote = release.index("  promote-release-metadata:")
    desktop_promote = release.index("  promote-desktop:")

    assert publish_plugins < finalize < promote < desktop_promote
    assert publish_components < finalize < promote
    assert "name: plugin-promotion-metadata" in release
    assert "name: component-promotion-metadata" in release
    assert (
        "needs: [resolve, publish-plugins, publish-components, finalize]"
        in release
    )
    pre_finalize = release[:finalize]
    assert "metadata/plugins/.staging" not in pre_finalize
    assert "metadata/.staging" not in pre_finalize
    assert "Phase 2: switch all platform pointers" not in pre_finalize
    promotion_block = release[promote:desktop_promote]
    assert (
        "find promotion/plugins -type f -name 'index.json'" in promotion_block
    )
    assert "metadata/plugins/index.json" in promotion_block
    assert "metadata/index.json" in promotion_block
    assert "metadata/ugsci-core-latest.json" in promotion_block
    assert "metadata/components/stable/$base" in promotion_block
    assert "rollback_metadata" in promotion_block
    assert "needs: [resolve, finalize, promote-release-metadata]" in release
    assert release.count("group: oss-production-metadata") == 1

    for workflow in (
        "component-release.yml",
        "creator-release.yml",
        "desktop-promote.yml",
        "uproject-release.yml",
    ):
        assert "oss-production-metadata" in _workflow(workflow)


def test_windows_b5_migration_uses_signed_visible_bridge() -> None:
    build = _workflow("desktop-build.yml")
    publish = _workflow("desktop-publish.yml")
    promote = _workflow("desktop-promote.yml")

    assert "UGSci-Desktop-migration.exe" in build
    assert "Windows-updater.exe.sig" in build
    assert "Windows-portable.zip" in publish
    assert "Windows-updater.exe" in publish
    assert "Windows-updater.exe" in promote
    assert "Windows-setup.exe" not in promote


def test_desktop_verification_has_production_startup_budget() -> None:
    desktop_build = _workflow("desktop-build.yml")

    assert desktop_build.count("timeout-minutes: 25") >= 2


def test_desktop_build_pins_and_smoke_tests_neqsim() -> None:
    desktop_build = _workflow("desktop-build.yml")
    windows = (
        REPO_ROOT / "scripts" / "pack-tauri" / "build_pyinstaller.ps1"
    ).read_text(encoding="utf-8")
    macos = (
        REPO_ROOT / "scripts" / "pack-tauri" / "build_pyinstaller.sh"
    ).read_text(encoding="utf-8")

    assert desktop_build.count("QWENPAW_NEQSIM_SHA256") >= 4
    assert "smoke_neqsim.py" in windows
    assert "smoke_neqsim.py" in macos


def test_windows_layered_build_allows_discovered_runtime_hashes() -> None:
    windows = (
        REPO_ROOT / "scripts" / "pack-tauri" / "build_pyinstaller.ps1"
    ).read_text(encoding="utf-8")
    launcher = (
        REPO_ROOT / "scripts" / "pack-tauri" / "build_win_pyinstaller.ps1"
    ).read_text(encoding="utf-8")
    plugin_ui_builder = (
        REPO_ROOT / "scripts" / "pack-tauri" / "build_plugin_uis.ps1"
    ).read_text(encoding="utf-8")

    assert '$NODE_RUNTIME_ARGS += @("--sha256"' in windows
    assert '$JRE_ARGS += @("--sha256"' in windows
    assert '$NEQSIM_ARGS += @("--sha256"' in windows
    assert "[SKIP] makensis (not used by layered desktop builds)" in launcher
    assert "Tauri icons are current; skipping regeneration" in launcher
    assert "function Sync-ChangedFiles" in plugin_ui_builder


def test_windows_release_avoids_legacy_long_path_archive_commands() -> None:
    desktop_build = _workflow("desktop-build.yml")
    verifier = (
        REPO_ROOT / "scripts" / "verify" / "launch_tauri_windows.ps1"
    ).read_text(encoding="utf-8")
    launcher = (
        REPO_ROOT / "scripts" / "pack-tauri" / "build_win_pyinstaller.ps1"
    ).read_text(encoding="utf-8")

    assert "extract_windows_zip.py" in desktop_build
    assert "Expand-Archive" not in desktop_build
    assert "extract_windows_zip.py" in verifier
    assert "Expand-Archive" not in verifier
    assert "copy_windows_tree.py" in launcher


def test_macos_updater_metadata_latest_and_prerelease_hardening() -> None:
    publish = _workflow("desktop-publish.yml")
    promote = _workflow("desktop-promote.yml")
    release = _workflow("release.yml")

    # macOS updater archive gets a versioned metadata JSON next to its binary.
    assert "mac-tauri-updater-metadata.json" in publish
    assert "UGSci-Tauri-${VERSION}-macOS.app.tar.gz.json" in publish
    assert "generate_oss_metadata.py" in publish

    # macOS updater archive gets a latest pointer and participates in rollback.
    assert "UGSci-Tauri-latest-macOS.app.tar.gz" in promote
    assert (
        "metadata/apps/desktop/mac-tauri/"
        "UGSci-Tauri-latest-macOS.app.tar.gz.json"
    ) in promote
    assert '"tauri-updater-meta-macos"' in promote
    assert (
        '"mac-tauri-updater-metadata.json"' in promote
        and '"UGSci-Tauri-*-macOS.app.tar.gz"' in promote
    )

    # Promotion downloads only desktop artifacts instead of the whole run.
    assert "- name: Download desktop application artifacts" in promote
    assert "- name: Download desktop updater metadata" in promote
    assert "pattern: UGSci-Desktop-Tauri-*" in promote
    assert "pattern: tauri-updater-meta-*" in promote

    # Prerelease detection covers PEP 440 short tags and the dead no-op block
    # is gone.
    assert "[-.])b[0-9]" in release
    assert "component artifacts are checked below" not in release


def test_workflow_bash_blocks_have_no_dangling_merge_residue() -> None:
    """Guard: no bash keyword may be followed by a bare token on same line.

    Catches incomplete cleanup from workflow edits (e.g. the
    desktop-publish.yml macOS updater step, where a stale ``fi`` line kept
    ``echo``/``exit 0`` and a duplicated upload block after it -- a hard bash
    syntax error that fails the publish step whenever it runs).
    """
    import re

    # Only ``fi`` and ``done`` terminate a compound command; a bare token
    # after them on the same line is a syntax error. Redirects (``<``, ``>``,
    # ``2>``), separators (``;``, ``&``) and comments (``#``) are legitimate.
    # ``then``/``else``/``do`` may legally be followed by a command, so they
    # are intentionally not checked.
    pattern = re.compile(r"^\s*(?:fi|done)\s+[^;#<>&\s]")
    for workflow in sorted(
        (REPO_ROOT / ".github" / "workflows").glob("*.yml"),
    ):
        lines = workflow.read_text(encoding="utf-8").splitlines()
        in_run_block = False
        run_indent = 0
        for lineno, line in enumerate(lines, 1):
            run_match = re.match(r"^(\s+)run:\s*\|", line)
            if run_match:
                in_run_block = True
                run_indent = len(run_match.group(1))
                continue
            if in_run_block:
                stripped = line.strip()
                if stripped:
                    indent = len(line) - len(line.lstrip())
                    if indent <= run_indent:
                        in_run_block = False
                        continue
                    assert not pattern.match(line), (
                        f"{workflow.name}:{lineno} has a bash keyword "
                        f"followed by a same-line token (merge residue): "
                        f"{line!r}"
                    )


def test_macos_updater_step_has_single_upload_block() -> None:
    """Guard: the macOS updater step must not contain a duplicated upload."""
    publish = _workflow("desktop-publish.yml")
    assert publish.count("Immutable macOS updater artifact differs") == 1
    assert publish.count("Remote macOS updater verification failed") == 1
    assert (
        publish.count(
            'echo "Verified existing immutable macOS updater artifact"',
        )
        == 1
    )
    assert (
        'ossutil cp mac-tauri-updater-metadata.json "$metadata_uri"' in publish
    )
    assert (
        'ossutil cp mac-tauri-updater-metadata.json "$metadata_tmp"'
        not in publish
    )


def test_unpublished_desktop_cleanup_is_draft_guarded_and_exact() -> None:
    """An abandoned build purge must never broaden into release cleanup."""
    cleanup = _workflow("oss-cleanup.yml")
    assert "mode=purge-unpublished" in cleanup
    assert "contents: write" in cleanup
    assert 'gh release view "$tag" --repo "$REPOSITORY"' in cleanup
    assert 'if [ "$is_draft" != "true" ]' in cleanup
    assert (
        "latest"
        not in cleanup.split(
            "- name: Purge abandoned unpublished desktop version",
            1,
        )[1].split("- name: List remaining desktop files", 1)[0]
    )
    for suffix in (
        "Windows-portable.zip",
        "Windows-updater.exe",
        "macOS.zip",
        "macOS.app.tar.gz",
    ):
        assert f"UGSci-Tauri-${{VERSION}}-{suffix}" in cleanup
    assert cleanup.count('ossutil rm "$uri" --force') == 1


def test_python_runtime_release_pin_is_consistent_across_builds() -> None:
    """Guard: the python-build-standalone pin must stay in sync everywhere.

    The staged runtime is pinned in three places: the script default
    (``stage_python_runtime.py``) and the Windows/macOS job env in
    ``desktop-build.yml``. Upgrading one without the others silently desyncs
    the bundled runtime from the frozen interpreter, or points the hash
    check at the wrong archive.
    """
    import re

    script = (
        REPO_ROOT / "scripts" / "pack-tauri" / "stage_python_runtime.py"
    ).read_text(encoding="utf-8")
    build = _workflow("desktop-build.yml")

    default_match = re.search(
        r'^DEFAULT_RELEASE\s*=\s*"(\d{8})"$',
        script,
        re.MULTILINE,
    )
    assert (
        default_match
    ), "DEFAULT_RELEASE pin not found in stage_python_runtime.py"
    default_release = default_match.group(1)

    workflow_pins = re.findall(
        r'QWENPAW_PYTHON_BUILD_STANDALONE_RELEASE:\s*"(\d{8})"',
        build,
    )
    assert len(workflow_pins) == 2, (
        "expected exactly 2 runtime release pins (Windows + macOS) in "
        f"desktop-build.yml, found {len(workflow_pins)}"
    )
    assert set(workflow_pins) == {default_release}, (
        f"workflow runtime pins {workflow_pins} diverge from the script "
        f"default {default_release!r}"
    )

    raw_hashes = re.findall(
        r'QWENPAW_PYTHON_RUNTIME_SHA256:\s*"([^"]+)"',
        build,
    )
    assert len(raw_hashes) == 2, (
        "both desktop jobs must pin a runtime SHA256, found "
        f"{len(raw_hashes)}"
    )
    for digest in raw_hashes:
        assert re.fullmatch(r"[0-9a-f]{64}", digest), (
            "runtime SHA256 must be a 64-char lowercase hex digest, "
            f"got {digest!r}"
        )
    assert raw_hashes[0] != raw_hashes[1], (
        "Windows and macOS runtime hashes must differ (different archives); "
        "an identical value means one job pins the wrong platform's hash"
    )


def test_pointer_post_check_is_polarity_aware() -> None:
    """Claim 3: post-promotion readback must not false-alarm on newer wins.

    A concurrent NEWER run legitimately winning the race must be accepted
    (warning), only an OLDER run clobbering our pointer is an error. The
    check therefore runs check_component_pointer_promotion with roles
    swapped (local=live, remote=ours) as the acceptance test.
    """
    release = _workflow("component-release.yml")
    assert 'cmp -s "$pointer" "$verify_file"' in release
    assert '--local "$verify_file" --remote "$pointer"' in release, (
        "post-promotion readback must accept a strictly-newer live pointer "
        "via the role-swapped monotonic check instead of cmp-only equality"
    )
    assert "newer concurrent promotion superseded" in release


def test_creator_release_uses_parameterized_oss_bucket() -> None:
    creator = _workflow("creator-release.yml")
    assert "OSS_BUCKET: ${{ vars.OSS_BUCKET || 'ugsci-download' }}" in creator
    assert "oss://${OSS_BUCKET}/" in creator
    assert "oss://ugsci-download/" not in creator


def test_uproject_release_uses_parameterized_oss_bucket() -> None:
    workflow = _workflow("uproject-release.yml")
    assert "OSS_BUCKET: ${{ vars.OSS_BUCKET || 'ugsci-download' }}" in workflow
    assert "oss://${OSS_BUCKET}/" in workflow
    assert "oss://ugsci-download/" not in workflow
    assert '--only "${PLUGIN_ID}"' in workflow
    assert "ui/index.js" in workflow
    assert "ui/dist/index.js" not in workflow
    assert "setup-node" not in workflow
    assert "npm --prefix" not in workflow
