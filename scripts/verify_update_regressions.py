#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Stable regression entry point for the fork's desktop update capability."""

import argparse
import ast
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
SUITES = (
    "tests/unit/tauri/test_update_release_contract.py",
    "tests/unit/tauri/test_incremental_update_regressions.py",
    "tests/unit/tauri/test_component_release.py",
    "tests/unit/tauri/test_component_updater.py",
    "tests/unit/tauri/test_component_client.py",
    "tests/unit/tauri/test_component_service.py",
    "tests/unit/tauri/test_component_artifacts.py",
    "tests/unit/tauri/test_component_manifest_validation.py",
    "tests/unit/tauri/test_windows_update_assistant_contract.py",
    "tests/unit/tauri/test_desktop_workflows.py",
    "tests/unit/tauri/test_desktop_layer_layout.py",
    "tests/unit/tauri/test_stage_desktop_components.py",
    "tests/unit/app/test_desktop_update_manifest.py",
    "tests/unit/verify/test_release_workflow_safety.py",
    "tests/unit/tauri/test_stage_officecli.py",
    "tests/unit/tauri/test_ugsci_release_data.py",
    "tests/unit/tauri/test_storage_capacity_publication.py",
    "tests/unit/tauri/test_backend_guard.py",
    "tests/unit/tauri/test_desktop_channel_build.py",
    "tests/unit/tauri/test_channel_runtime_layout.py",
    "tests/unit/tauri/test_layered_channel_bootstrap.py",
    "tests/unit/tauri/test_channel_runtime_component_updates.py",
    "tests/unit/tauri/test_channel_runtime_portable.py",
    "tests/unit/tauri/test_channel_support_wheel.py",
    "tests/unit/scripts/test_macos_packaging.py",
    "tests/unit/tauri/test_desktop_dependency_lock.py",
    "tests/unit/tauri/test_backend_archive_capacity.py",
    "tests/unit/pack/test_generate_plugin_metadata.py",
    "tests/unit/tauri/test_stage_bundled_plugins.py",
)
REQUIRED_CASES = {
    "tests/unit/tauri/test_stage_bundled_plugins.py": {
        "test_software_staging_excludes_apps_and_preserves_explicit_app_release",
        "test_python_distributions_exclude_source_and_stale_application_mirrors",
        "test_desktop_content_gate_rejects_bundled_application_payload",
    },
    "tests/unit/pack/test_generate_plugin_metadata.py": {
        "test_cli_category_scope_preserves_independent_app_publication",
        "test_cli_dry_run_uses_the_same_app_category_scope",
        "test_scoped_release_merge_retains_independent_app_versions",
    },
    "tests/unit/tauri/test_backend_archive_capacity.py": {
        "test_backend_archive_capacity_contract_is_consistent",
        "test_large_backend_signed_full_delta_and_rollback",
        "test_backend_archive_capacity_rejects_above_budget",
        "test_backend_archive_capacity_does_not_relax_plugin_limit",
        "test_large_backend_rejects_tampering_and_inventory_changes",
        "test_backend_capacity_keeps_path_and_inventory_guards",
        "test_large_backend_manifest_rejects_older_host_before_download",
    },
    "tests/unit/tauri/test_desktop_dependency_lock.py": {
        "test_desktop_lock_satisfies_project_and_selected_extras",
        "test_desktop_lock_rejects_stale_reme_contract",
        "test_desktop_lock_reads_new_selected_extras",
        "test_layer_build_rejects_stale_lock_before_install_or_cleanup",
        "test_installed_layer_cannot_use_host_distribution_to_hide_missing_provider",
        "test_isolated_target_validator_rejects_stale_and_accepts_matching_metadata",
        "test_installed_layer_checks_wheel_extra_requirements",
        "test_layer_build_checks_installed_wheel_before_smoke_or_descriptors",
    },
    "tests/unit/scripts/test_macos_packaging.py": {
        "test_signing_skips_debug_symbols_and_keeps_native_signatures",
        "test_launcher_uses_real_top_level_app",
    },
    "tests/unit/tauri/test_channel_support_wheel.py": {
        "test_channel_support_wheel_preserves_recorded_host_and_official_resources",
        "test_channel_support_derivation_rejects_changed_source_record",
        "test_channel_support_derivation_rejects_unrecorded_source_payload",
        "test_derived_channel_runtime_keeps_final_plugin_archive_single_owner",
    },
    "tests/unit/tauri/test_channel_runtime_portable.py": {
        "test_compact_channel_payload_passes_real_portable_path_guard",
        "test_compact_manifest_missing_never_falls_back",
        "test_refresh_preserves_legacy_layered_channel_paths",
    },
    "tests/unit/tauri/test_desktop_workflows.py": {
        "test_shared_daemon_keeps_channel_runtime_environment",
    },
    "tests/unit/tauri/test_channel_runtime_component_updates.py": {
        "test_signed_backend_update_switches_channel_support_atomically",
        "test_signed_backend_gate_rejects_changed_channel_support",
        "test_channel_launcher_changes_host_fingerprint_and_blocks_old_desktop",
    },
    "tests/unit/tauri/test_channel_runtime_layout.py": {
        "test_assembled_channel_runtime_matches_launcher_and_runs",
    },
    "tests/unit/tauri/test_layered_channel_bootstrap.py": {
        "test_layered_channel_bootstrap_uses_authenticated_manifest",
        "test_layered_official_sources_use_authenticated_runtime",
        "test_layered_channel_bootstrap_rejects_manifest_drift",
        "test_source_channel_bootstrap_keeps_development_runtime",
    },
    "tests/unit/tauri/test_desktop_channel_build.py": {
        "test_channel_contract_dependencies_install_before_layout_branch",
        "test_layered_channel_wheels_are_prepared_before_runtime_resolution",
        "test_desktop_channel_gate_rejects_retained_model_drift",
    },
    "tests/unit/tauri/test_backend_guard.py": {
        "test_runtime_lock_rejects_a_second_owner",
        "test_runtime_lock_is_released_after_process_death",
        "test_runtime_discovery_binds_component_host_identity",
    },
    "tests/unit/tauri/test_component_service.py": {
        "test_runtime_cleanup_is_once_per_boot_and_retries_next_boot",
    },
    "tests/unit/tauri/test_component_updater.py": {
        "test_directory_candidate_snapshot_is_isolated",
    },
    "tests/unit/verify/test_release_workflow_safety.py": {
        "test_unified_release_excludes_apps_and_uploads_every_selected_kind",
        "test_release_install_scope_preserves_full_test_gate",
        "test_clean_release_and_frontend_checks_build_openui_runtime",
        "test_reusable_plugin_build_matches_release_artifact_scope",
        "test_plugin_pack_job_installs_channel_contract_dependencies",
    },
    "tests/unit/tauri/test_stage_officecli.py": {
        "test_reviewed_pin_does_not_query_latest",
        "test_matching_marker_cannot_bypass_cached_binary_validation",
        "test_failed_upgrade_preserves_existing_engine_and_marker",
    },
    SUITES[0]: {
        "test_publication_gate_verifies_full_fallback_and_all_deltas",
        "test_publication_gate_blocks_broken_but_present_artifacts",
        "test_current_updater_preserves_data_across_future_release_routes",
        "test_update_release_gates_cannot_be_bypassed_by_publication",
    },
    SUITES[2]: {"test_builds_ten_direct_deltas_and_binds_signed_history"},
    "tests/unit/tauri/test_ugsci_release_data.py": {
        "test_release_staging_and_market_zip_exclude_local_visualization_data",
        "test_python_wheel_and_sdist_exclude_visualization_test_data",
        "test_signed_component_gate_rejects_visualization_test_payload",
        "test_packaged_visualization_imports_user_data_without_shipped_examples",
        "test_updates_preserve_user_imports_without_shipping_visualization_data",
    },
    "tests/unit/tauri/test_storage_capacity_publication.py": {
        "test_manifest_rejects_hosts_without_scoped_app_sdk",
        "test_actual_app_archive_rejects_private_extra_files_and_modified_bytes",
        "test_promotion_restores_prior_objects_on_partial_write_failure",
        "test_signed_application_release_preserves_other_components_and_host_policy",
    },
}


def verify_inventory() -> None:
    for name in SUITES:
        path = ROOT / name
        if not path.is_file():
            raise ValueError(
                f"required update regression suite missing: {name}",
            )
        cases = {
            node.name: node
            for node in ast.walk(
                ast.parse(path.read_text(encoding="utf-8-sig")),
            )
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))
        }
        for case in REQUIRED_CASES.get(name, ()):
            if case not in cases:
                raise ValueError(
                    f"required update regression case missing: {case}",
                )
            if any(
                ".skip" in ast.unparse(decorator)
                or ".xfail" in ast.unparse(decorator)
                for decorator in cases[case].decorator_list
            ):
                raise ValueError(
                    f"required update regression cannot be skipped: {case}",
                )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check",
        action="store_true",
        help="check inventory before the existing full pytest run",
    )
    args = parser.parse_args()
    verify_inventory()
    print(
        f"Update regression inventory verified: {len(SUITES)} suites.",
        flush=True,
    )
    if args.check:
        return 0
    return subprocess.call(
        [
            sys.executable,
            "-m",
            "pytest",
            *SUITES,
            "-q",
            "-p",
            "no:cacheprovider",
        ],
        cwd=ROOT,
    )


if __name__ == "__main__":
    raise SystemExit(main())
