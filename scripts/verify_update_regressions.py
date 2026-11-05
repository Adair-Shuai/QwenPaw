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
    "tests/unit/app/routers/test_plugins_router.py",
    "tests/unit/plugins/test_download_catalog.py",
    "tests/unit/plugins/test_plugin_config_update.py",
    "tests/unit/plugins/test_plugin_update_transactions.py",
    "tests/unit/plugins/test_pawapp_listing.py",
    "tests/unit/pawapp/test_app_contract.py",
    "tests/unit/plugins/test_pawapp_service_lifecycle.py",
    "tests/unit/plugins/test_bundled_startup_safety.py",
    "tests/unit/app/routers/test_healthz.py",
    "tests/unit/app/test_plugin_startup_order.py",
)
REQUIRED_CASES = {
    "tests/unit/app/test_plugin_startup_order.py": {
        "test_registry_and_runtime_readiness_are_distinct",
        "test_bundled_candidates_are_health_checked_before_agent_startup",
    },
    "tests/unit/app/routers/test_healthz.py": {
        "test_core_startup_failure_is_terminal_without_private_diagnostics",
        "test_optional_plugin_failure_does_not_fail_core_readiness",
        "test_startup_receipt_is_atomic_per_launch_and_contains_only_outcome",
    },
    "tests/unit/plugins/test_bundled_startup_safety.py": {
        "test_disabled_candidate_drains_retained_ledger_before_commit",
        "test_startup_recovery_waits_for_real_lifecycle_teardown",
        "test_disabled_startup_candidate_commits_without_importing_code",
        "test_healthy_candidate_cleanup_failure_never_rolls_back_live_code",
        "test_invalid_manifest_recovery_drains_orphan_ledger_before_restore",
        "test_disabled_descriptor_channel_commits_without_starting_worker",
        "test_disabled_candidate_invalid_entry_restores_without_import",
    },
    "tests/unit/plugins/test_plugin_update_transactions.py": {
        "test_replace_disabled_plugin_commits_without_activation",
        "test_replace_disabled_plugin_rejects_incompatible_candidate",
        "test_failed_replace_cannot_reinstall_over_concurrent_success",
        "test_concurrent_replacements_back_up_committed_predecessor",
        "test_replace_preserves_structured_dependency_confirmation",
        "test_replace_reports_post_commit_cleanup_restart",
        "test_stale_concurrent_update_does_not_downgrade_newer_version",
    },
    "tests/unit/plugins/test_pawapp_listing.py": {
        "test_app_listing_merges_failed_disabled_pending_and_active",
        "test_app_listing_excludes_backups_removed_and_malformed_manifests",
    },
    "tests/unit/pawapp/test_app_contract.py": {
        "test_managed_service_recovers_after_process_exit",
        "test_managed_service_is_not_ready_until_health_succeeds",
    },
    "tests/unit/plugins/test_plugin_config_update.py": {
        "test_failed_startup_preserves_explicit_enable_intent",
    },
    "tests/unit/app/routers/test_plugins_router.py": {
        "test_replace_installed_plugin_full_isolated_lifecycle",
        "test_replace_bundled_plugin_rejects_untrusted_or_mismatched_source",
    },
    "tests/unit/tauri/test_desktop_workflows.py": {
        "test_desktop_update_commands_are_allowed_by_main_window_acl",
        "test_artifact_selection_retains_fork_brand_and_newest_id",
        "test_fork_beta_promotion_retains_checked_desktop_manifest",
    },
    "tests/unit/tauri/test_backend_guard.py": {
        "test_runtime_lock_rejects_a_second_owner",
        "test_runtime_lock_is_released_after_process_death",
        "test_runtime_discovery_binds_component_host_identity",
    },
    "tests/unit/tauri/test_component_service.py": {
        "test_startup_ack_preserves_requests_queued_during_install",
        "test_startup_consumer_lock_does_not_block_queue_admission",
        "test_pending_queue_serializes_independent_process_writers",
        "test_runtime_cleanup_is_once_per_boot_and_retries_next_boot",
    },
    "tests/unit/tauri/test_component_updater.py": {
        "test_directory_candidate_snapshot_is_isolated",
    },
    "tests/unit/verify/test_release_workflow_safety.py": {
        "test_clean_release_and_frontend_checks_build_openui_runtime",
        "test_reusable_plugin_build_matches_release_artifact_scope",
    },
    "tests/unit/tauri/test_stage_officecli.py": {
        "test_reviewed_pin_does_not_query_latest",
        "test_matching_marker_cannot_bypass_cached_binary_validation",
        "test_failed_upgrade_preserves_existing_engine_and_marker",
        "test_binary_verification_disables_engine_self_updates",
        "test_binary_verification_rejects_mutation_during_probe",
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
        "test_runtime_bundle_install_excludes_samples_and_keeps_user_imports",
        "test_runtime_hash_matches_legacy_without_entering_excluded_trees",
        "test_runtime_copy_uses_manifest_identity_and_ignores_pack_exclude",
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
