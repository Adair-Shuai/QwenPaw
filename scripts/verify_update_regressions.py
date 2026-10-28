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
)
REQUIRED_CASES = {
    "tests/unit/tauri/test_backend_guard.py": {
        "test_runtime_lock_rejects_a_second_owner",
        "test_runtime_lock_is_released_after_process_death",
        "test_runtime_discovery_binds_component_host_identity",
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
