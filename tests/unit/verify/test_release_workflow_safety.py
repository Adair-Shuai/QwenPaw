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
    assert '--draft=false --target' not in release
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


def test_component_release_stages_plugins_and_versioned_desktop_layers(
) -> None:
    component_release = _workflow("component-release.yml")

    assert "--plugin-roots bundle apps" in component_release
    assert "stage_bundled_plugins.py" in component_release
    assert "stage_desktop_components.py" in component_release
    assert "desktop-components-${{ matrix.target }}" in component_release


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
