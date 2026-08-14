//! CI-only reporting for plugin capabilities registered in the real Tauri webview.
//!
//! The command is inert for normal users.  Release verification enables it by
//! providing both environment variables below, then the frontend reports the
//! serialisable menu/route/slot registry snapshot after loading plugins.

use serde::{Deserialize, Serialize};
use std::{
    env, fs,
    path::{Path, PathBuf},
};

const NONCE_ENV: &str = "QWENPAW_UI_VERIFY_NONCE";
const REPORT_PATH_ENV: &str = "QWENPAW_UI_VERIFY_REPORT_PATH";
const REQUIRED_MENUS: [&str; 3] = ["ugsci.experts", "ugsci.tools-skills", "ugsci.market"];
const REQUIRED_ROUTE: &str = "/flowforge";
const REQUIRED_SLOT_SOURCE: &str = "ugsci_research";
const REQUIRED_SLOT_ID: &str = "research-mode-toggle";

#[derive(Debug, Deserialize, Serialize)]
pub struct UiMenuSnapshot {
    pub id: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct UiRouteSnapshot {
    pub id: String,
    pub path: String,
    pub source: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct UiSlotSnapshot {
    pub name: String,
    pub kind: String,
    pub source: String,
    pub id: Option<String>,
    pub order: Option<f64>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct UiVerificationSnapshot {
    pub menus: Vec<UiMenuSnapshot>,
    pub routes: Vec<UiRouteSnapshot>,
    pub slots: Vec<UiSlotSnapshot>,
}

#[derive(Debug, Serialize)]
struct UiVerificationReport<'a> {
    schema_version: u8,
    nonce: &'a str,
    pid: u32,
    complete: bool,
    missing_menus: Vec<&'static str>,
    missing_route: Option<&'static str>,
    missing_slot: Option<String>,
    menus: &'a [UiMenuSnapshot],
    routes: &'a [UiRouteSnapshot],
    slots: &'a [UiSlotSnapshot],
}

fn verification_target() -> Result<Option<(String, PathBuf)>, String> {
    let nonce = env::var(NONCE_ENV).ok().filter(|value| !value.is_empty());
    let report_path = env::var(REPORT_PATH_ENV)
        .ok()
        .filter(|value| !value.is_empty())
        .map(PathBuf::from);

    match (nonce, report_path) {
        (None, None) => Ok(None),
        (Some(nonce), Some(report_path)) => Ok(Some((nonce, report_path))),
        _ => Err(format!(
            "{NONCE_ENV} and {REPORT_PATH_ENV} must be configured together"
        )),
    }
}

fn write_report(path: &Path, nonce: &str, snapshot: &UiVerificationSnapshot) -> Result<(), String> {
    let missing_menus = REQUIRED_MENUS
        .iter()
        .copied()
        .filter(|required| !snapshot.menus.iter().any(|menu| menu.id == *required))
        .collect::<Vec<_>>();
    let missing_route = (!snapshot
        .routes
        .iter()
        .any(|route| route.path == REQUIRED_ROUTE))
    .then_some(REQUIRED_ROUTE);
    let missing_slot = (!snapshot.slots.iter().any(|slot| {
        slot.source == REQUIRED_SLOT_SOURCE && slot.id.as_deref() == Some(REQUIRED_SLOT_ID)
    }))
    .then(|| format!("{REQUIRED_SLOT_SOURCE}:{REQUIRED_SLOT_ID}"));
    let complete = missing_menus.is_empty() && missing_route.is_none() && missing_slot.is_none();

    let report = UiVerificationReport {
        schema_version: 1,
        nonce,
        pid: std::process::id(),
        complete,
        missing_menus,
        missing_route,
        missing_slot,
        menus: &snapshot.menus,
        routes: &snapshot.routes,
        slots: &snapshot.slots,
    };
    let bytes = serde_json::to_vec_pretty(&report)
        .map_err(|err| format!("failed to serialise UI verification report: {err}"))?;

    let parent = path
        .parent()
        .ok_or_else(|| format!("UI verification report has no parent: {}", path.display()))?;
    fs::create_dir_all(parent).map_err(|err| {
        format!(
            "failed to create UI verification report directory {}: {err}",
            parent.display()
        )
    })?;
    let temporary = parent.join(format!(
        ".{}.{}.tmp",
        path.file_name()
            .and_then(|name| name.to_str())
            .unwrap_or("ui-verification"),
        std::process::id()
    ));
    fs::write(&temporary, bytes).map_err(|err| {
        format!(
            "failed to write temporary UI verification report {}: {err}",
            temporary.display()
        )
    })?;
    if let Err(first_err) = fs::rename(&temporary, path) {
        // Windows does not replace an existing destination with rename().
        // The verifier tolerates this tiny replacement window and retries
        // invalid/missing JSON until the final report is visible.
        if path.exists() {
            fs::remove_file(path).map_err(|err| {
                format!(
                    "failed to replace UI verification report {} after {first_err}: {err}",
                    path.display()
                )
            })?;
            fs::rename(&temporary, path).map_err(|err| {
                format!(
                    "failed to promote UI verification report {}: {err}",
                    path.display()
                )
            })?;
        } else {
            return Err(format!(
                "failed to promote UI verification report {}: {first_err}",
                path.display()
            ));
        }
    }
    Ok(())
}

#[tauri::command]
pub fn report_ui_verification(snapshot: UiVerificationSnapshot) -> Result<(), String> {
    let Some((nonce, report_path)) = verification_target()? else {
        return Ok(());
    };
    match write_report(&report_path, &nonce, &snapshot) {
        Ok(()) => {
            log::info!(
                "[ui-verification] wrote native plugin report: menus={}, routes={}, slots={}",
                snapshot.menus.len(),
                snapshot.routes.len(),
                snapshot.slots.len(),
            );
            Ok(())
        }
        Err(err) => {
            log::error!("[ui-verification] failed to write native plugin report: {err}");
            Err(err)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn complete_snapshot() -> UiVerificationSnapshot {
        UiVerificationSnapshot {
            menus: REQUIRED_MENUS
                .iter()
                .map(|id| UiMenuSnapshot { id: id.to_string() })
                .collect(),
            routes: vec![UiRouteSnapshot {
                id: "flowforge".to_string(),
                path: REQUIRED_ROUTE.to_string(),
                source: "flowforge".to_string(),
            }],
            slots: vec![UiSlotSnapshot {
                name: "header.left".to_string(),
                kind: "fill".to_string(),
                source: REQUIRED_SLOT_SOURCE.to_string(),
                id: Some(REQUIRED_SLOT_ID.to_string()),
                order: Some(10.0),
            }],
        }
    }

    #[test]
    fn writes_nonce_and_complete_capabilities() {
        let temp = tempfile::tempdir().expect("tempdir");
        let report_path = temp.path().join("report.json");
        write_report(&report_path, "ci-nonce", &complete_snapshot()).expect("write report");
        let payload: serde_json::Value =
            serde_json::from_slice(&fs::read(report_path).expect("read report"))
                .expect("parse report");
        assert_eq!(payload["nonce"], "ci-nonce");
        assert_eq!(payload["complete"], true);
        assert_eq!(payload["missing_menus"], serde_json::json!([]));
    }

    #[test]
    fn records_missing_capabilities_without_claiming_success() {
        let temp = tempfile::tempdir().expect("tempdir");
        let report_path = temp.path().join("report.json");
        let empty = UiVerificationSnapshot {
            menus: vec![],
            routes: vec![],
            slots: vec![],
        };
        write_report(&report_path, "ci-nonce", &empty).expect("write report");
        let payload: serde_json::Value =
            serde_json::from_slice(&fs::read(report_path).expect("read report"))
                .expect("parse report");
        assert_eq!(payload["complete"], false);
        assert_eq!(payload["missing_route"], REQUIRED_ROUTE);
        assert_eq!(
            payload["missing_slot"],
            "ugsci_research:research-mode-toggle"
        );
    }
}
