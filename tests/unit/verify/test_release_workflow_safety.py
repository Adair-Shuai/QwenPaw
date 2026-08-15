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

    assert 'source_path="$(jq -r .path' in release
    assert (
        'if [ "$source_path" != ".github/workflows/release.yml" ]' in release
    )
    assert 'if [ "$source_sha" != "$sha" ]' in release
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
    assert release.count("was not built from release commit $sha") >= 3
    assert "grep -qx 'tauri-updater-meta-windows'" in release
    assert "grep -qx 'tauri-updater-meta-macos'" in release
    assert "Replacement artifact run IDs require artifacts_run_id" in release
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
    assert 'release="$(gh release view "$TAG"' in release
    assert 'case "$is_draft" in' in release
    assert 'gh release edit "$TAG" --repo "$REPO" --draft=false' in release
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
        "find promotion/plugins -type f -name 'index.json'"
        in promotion_block
    )
    assert "metadata/plugins/index.json" in promotion_block
    assert "metadata/index.json" in promotion_block
    assert "metadata/components/stable/$base" in promotion_block
    assert "rollback_metadata" in promotion_block
    assert (
        "needs: [resolve, finalize, promote-release-metadata]" in release
    )
    assert release.count("group: oss-production-metadata") == 1

    for workflow in (
        "component-release.yml",
        "creator-release.yml",
        "desktop-promote.yml",
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

    # Promotion downloads only desktop artifacts instead of the whole run.
    assert "- name: Download desktop artifacts" in promote
    assert "pattern: UGSci-Desktop-Tauri-*|tauri-updater-meta-*" in promote

    # Prerelease detection covers PEP 440 short tags and the dead no-op block
    # is gone.
    assert "[-.])b[0-9]" in release
    assert "component artifacts are checked below" not in release
