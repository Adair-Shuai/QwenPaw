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
    "tests/unit/app/test_console_static_security.py",
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
    "tests/unit/tauri/test_plugin_payload_completeness.py",
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
    "tests/unit/tauri/test_desktop_dependency_lock.py",
    "tests/unit/tauri/test_layered_channel_build.py",
    "tests/unit/pack/test_measure_desktop_footprint.py",
    "tests/unit/tauri/test_desktop_optional_ml.py",
    "tests/unit/tauri/test_desktop_python_cache.py",
    "tests/unit/tauri/test_component_compression.py",
    "tests/unit/tauri/test_windows_portable_installer_contract.py",
    "tests/unit/plugins/test_bundle_marker_scan.py",
    "tests/unit/plugins/test_plugin_startup_perf.py",
    "tests/unit/tauri/test_windows_update_extraction.py",
    "tests/unit/tauri/test_windows_installer_io.py",
    "tests/unit/tauri/test_windows_setup_progress.py",
    "tests/unit/tauri/test_windows_webview_install.py",
    "tests/unit/tauri/test_desktop_scientific_pruning.py",
    "tests/unit/tauri/test_stage_python_runtime.py",
    "tests/unit/plugins/test_dependency_source_sync.py",
)
REQUIRED_CASES = {
    "tests/unit/app/test_console_static_security.py": {
        "test_console_static_symlinks_stay_within_build",
        "test_console_brand_assets_revalidate_after_upgrade",
    },
    "tests/unit/plugins/test_dependency_source_sync.py": {
        "test_source_backup_and_restore_flush_exact_bytes_and_modes",
        "test_source_sync_failure_preserves_original_read_only_mode",
    },
    "tests/unit/tauri/test_windows_installer_io.py": {
        "test_installer_replaces_legacy_shortcut_icons_on_upgrade",
        "test_installer_compiled_verification_counts_payload_and_rechecks_changes",
        "test_installer_compiled_verification_rejects_unsafe_or_incomplete_package",
        "test_installer_compiled_copy_and_size_preserve_deep_and_empty_trees",
        "test_installer_compiled_io_refuses_package_and_destination_junctions",
        "test_installer_embeds_and_executes_compiled_helper_with_windows_powershell",
        "test_installer_streams_child_log_before_exit_and_preserves_failure_status",
        "test_installer_compiled_copy_accepts_redirected_ancestors_but_not_overlap",
        "test_installer_compiled_preserves_user_root_junction_without_link_escape",
        "test_installer_compiled_copy_rejects_dangling_destination_root_junction",
    },
    "tests/unit/tauri/test_windows_setup_progress.py": {
        "test_setup_streams_stages_and_failure_log_before_process_exit",
    },
    "tests/unit/tauri/test_windows_webview_install.py": {
        "test_webview_existing_runtime_skips_copy_launch_download_and_clears_marker",
        "test_webview_offline_success_uses_one_copy_and_never_downloads",
        "test_webview_offline_failure_attempts_only_one_online_fallback",
        "test_webview_shared_timeout_prevents_retry_and_rechecks_registration",
        "test_webview_registration_polling_uses_remaining_shared_budget",
        "test_webview_rejects_invalid_microsoft_signature_before_launch",
        "test_webview_failure_is_visible_and_preserves_missing_marker",
        "test_webview_download_and_signature_share_budget_without_extra_attempts",
        "test_webview_real_budget_clock_decreases_and_expiry_clamps_to_zero",
        "test_webview_real_download_cancels_slow_body_without_launching_installer",
        "test_fresh_install_without_existing_data_does_not_enter_backup_phase",
    },
    "tests/unit/tauri/test_desktop_scientific_pruning.py": {
        "test_scientific_pruning_only_removes_audited_test_trees",
        "test_scientific_pruning_changes_component_identity",
        "test_scientific_pruning_rejects_paths_outside_staging",
        "test_pruned_real_scientific_packages_keep_offline_operations",
    },
    "tests/unit/tauri/test_stage_python_runtime.py": {
        "test_prunes_python_native_symbols_but_keeps_runtime_and_build_support",
        "test_cached_python_runtime_is_pruned_without_download",
        "test_pruned_python_runtime_gets_new_component_identity",
    },
    "tests/unit/tauri/test_plugin_payload_completeness.py": {
        "test_desktop_plugins_reuse_complete_payloads_in_real_signed_zips",
        "test_signed_component_gate_rejects_missing_declared_payload",
        "test_desktop_plugin_reuse_rejects_foreign_or_incomplete_sources",
        "test_desktop_archive_requires_manifest_declared_auxiliary_files",
        "test_data_context_vendoring_runs_script_and_restores_router",
        "test_component_workflow_reuses_complete_desktop_plugins",
        "test_desktop_builds_vendor_data_context_before_plugin_bundle",
    },
    "tests/unit/plugins/test_bundle_marker_scan.py": {
        "test_bundle_marker_checks_all_files_with_one_scan_per_directory",
        "test_bundle_marker_rejects_unsafe_or_malformed_files",
        "test_bundle_marker_resolves_directory_links_before_enumeration",
        "test_bundle_marker_retains_case_and_permission_fallback",
        "test_bundle_marker_does_not_merge_differently_cased_directories",
    },
    "tests/unit/plugins/test_plugin_startup_perf.py": {
        "test_startup_ranks_only_current_unloaded_plugin_candidates",
        "test_startup_metadata_probe_keeps_event_loop_responsive",
    },
    "tests/unit/tauri/test_windows_update_extraction.py": {
        "test_extractor_reuses_buffer_and_limits_progress_for_many_files",
        "test_extractor_keeps_unsafe_path_rejection",
        "test_extractor_rejects_links_and_preserves_existing_files",
        "test_extractor_does_not_report_success_before_later_invalid_entry",
    },
    "tests/unit/tauri/test_desktop_optional_ml.py": {
        "test_inference_is_optional_and_full_retains_it",
        "test_real_core_and_ugsci_behaviors_without_inference_imports",
    },
    "tests/unit/tauri/test_desktop_python_cache.py": {
        "test_real_import_cache_keeps_delta_baseline_valid",
        "test_desktop_factories_pin_cache_after_extension_environment",
        "test_cli_python_descendants_cannot_write_into_components",
    },
    "tests/unit/tauri/test_component_compression.py": {
        "test_component_archives_use_best_deflate_and_are_deterministic",
        "test_best_deflate_archives_pass_signed_runtime_installation",
    },
    "tests/unit/tauri/test_windows_portable_installer_contract.py": {
        "test_cli_launcher_uses_python_module_entry_point",
        "test_installer_verifies_in_elevated_process_before_any_mutation",
        "test_installer_parallel_user_backup_keeps_complete_copy_and_failure_gate",
    },
    "tests/unit/tauri/test_desktop_dependency_lock.py": {
        "test_desktop_lock_satisfies_every_selected_direct_dependency",
    },
    "tests/unit/tauri/test_layered_channel_build.py": {
        "test_channel_runtime_excludes_bundled_plugins_with_record_integrity",
        "test_channel_runtime_checks_unsafe_bundled_member_before_filtering",
        "test_layered_channel_wheels_resolve_real_offline_dependency_closure",
        "test_layered_channel_missing_dependency_stops_build",
        "test_desktop_build_wires_independent_layered_channel_pool",
    },
    "tests/unit/tauri/test_desktop_layer_layout.py": {
        "test_backend_plugin_staging_rejects_incomplete_canonical_payload",
        "test_python_layers_real_installs_stay_stable_after_import_validation",
    },
    "tests/unit/pack/test_measure_desktop_footprint.py": {
        "test_real_startup_rss_and_owned_tree_cleanup",
        "test_failed_launch_writes_report_and_reaps_descendants",
        "test_preexisting_listener_is_not_used_or_terminated",
    },
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
        "test_windows_build_creates_portable_package_once_and_keeps_signing",
        "test_windows_failure_logs_include_shared_backend_diagnostics",
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
        "test_plugin_pack_jobs_install_channel_contract_dependencies",
        "test_resumed_wheel_validates_contracts_and_stages_tested_openui",
        "test_plugin_publish_jobs_upload_indexed_azure_and_hub_artifacts",
        "test_plugin_upload_conflict_blocks_every_new_object",
        "test_plugin_upload_rejects_incomplete_local_artifacts",
        "test_plugin_upload_transport_failures_do_not_pass",
    },
    "tests/unit/tauri/test_stage_officecli.py": {
        "test_reviewed_pin_does_not_query_latest",
        "test_matching_marker_cannot_bypass_cached_binary_validation",
        "test_failed_upgrade_preserves_existing_engine_and_marker",
        "test_binary_verification_disables_engine_self_updates",
        "test_binary_verification_rejects_mutation_during_probe",
    },
    "tests/unit/tauri/test_update_release_contract.py": {
        "test_publication_gate_verifies_full_fallback_and_all_deltas",
        "test_publication_gate_blocks_broken_but_present_artifacts",
        "test_current_updater_preserves_data_across_future_release_routes",
        "test_update_release_gates_cannot_be_bypassed_by_publication",
    },
    "tests/unit/tauri/test_component_release.py": {
        "test_builds_ten_direct_deltas_and_binds_signed_history",
    },
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
