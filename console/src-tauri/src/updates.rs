//! Tauri commands for desktop auto-updates via tauri-plugin-updater.

mod cache;
mod events;
mod guard;
mod remote;
mod signature;
mod version;

use serde::Serialize;
use tauri::AppHandle;
#[cfg(target_os = "macos")]
use tauri::Manager;

use crate::backend;

use cache::{
    cached_artifact_path, cached_update_dir, ensure_current_platform, has_cached_update_meta,
    persist_cached_update, read_cached_update_meta, remove_cached_update, supports_cached_updates,
};
use events::{
    classify_updater_error, emit, emit_error, emit_updater_error, emit_updater_error_message,
};
use guard::begin_update;
use remote::{check_and_download, check_installable_update};
use signature::verify_cached_update;
use version::version_lte;

pub(crate) use version::is_remote_update_newer;

#[tauri::command]
pub(crate) async fn restart_for_component_updates(app: AppHandle) -> Result<(), String> {
    backend::stop_and_wait(&app).await?;
    app.restart();
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct DesktopUpdate {
    version: String,
    body: Option<String>,
    supports_later_install: bool,
}

#[tauri::command]
pub(crate) async fn check_desktop_update(app: AppHandle) -> Result<Option<DesktopUpdate>, String> {
    let update = check_installable_update(&app)
        .await
        .map_err(|e| e.to_string())?;

    Ok(update.map(|u| DesktopUpdate {
        version: u.version,
        body: u.body,
        supports_later_install: supports_cached_updates(),
    }))
}

#[tauri::command]
pub(crate) fn install_desktop_update(app: AppHandle) -> Result<(), String> {
    let guard = begin_update()?;
    tauri::async_runtime::spawn(async move {
        let _guard = guard;
        run_install(app).await;
    });
    Ok(())
}

async fn run_install(app: AppHandle) {
    let Some((update, bytes)) = check_and_download(&app).await else {
        return;
    };

    log::info!(
        "[updates] installing desktop update version={}",
        update.version
    );
    emit(&app, "update:install-start", &serde_json::json!({}));

    if let Err(err) = ensure_macos_update_location(&app) {
        return emit_error(&app, "install", &err);
    }

    if let Err(err) = backend::stop_and_wait(&app).await {
        return emit_error(&app, "install", &err);
    }

    if cfg!(windows) {
        let Some(cache_dir) = cached_update_dir(&app) else {
            return emit_install_error_with_backend_recovery(
                &app,
                "cannot determine app data directory".to_string(),
            )
            .await;
        };
        if let Err(err) = persist_cached_update(&app, &update, &bytes) {
            return emit_install_error_with_backend_recovery(&app, err).await;
        }
        let Ok(meta) = read_cached_update_meta(&cache_dir) else {
            return emit_install_error_with_backend_recovery(
                &app,
                "cannot prepare portable Windows update".to_string(),
            )
            .await;
        };
        let artifact_path = cached_artifact_path(&cache_dir, &meta);
        if let Err(err) = install_cached_windows(&app, &artifact_path, &meta) {
            let _ = backend::restart_backend(app.clone()).await;
            emit_error(&app, "install", &err);
        }
    } else {
        if let Err(err) = update.install(bytes) {
            let install_error = err.to_string();
            let install_kind = classify_updater_error(&err);
            let recovery_error = backend::restart_backend(app.clone()).await.err();
            if let Some(recovery_error) = recovery_error {
                emit_error(
                    &app,
                    "install",
                    &format!("{install_error}; backend recovery failed: {recovery_error}"),
                );
            } else {
                emit_updater_error_message(&app, "install", install_kind, &install_error);
            }
            return;
        }
        app.restart();
    }
}

/// Installation is attempted only after the sidecar has been stopped. Every
/// failure after that point must restart it, otherwise the WebView remains on
/// the startup gate and eventually reports `Load failed` even though the
/// original app is still intact.
async fn emit_install_error_with_backend_recovery(app: &AppHandle, err: String) {
    let recovery_error = backend::restart_backend(app.clone()).await.err();
    if let Some(recovery_error) = recovery_error {
        emit_error(
            app,
            "install",
            &format!("{err}; backend recovery failed: {recovery_error}"),
        );
    } else {
        emit_error(app, "install", &err);
    }
}

#[tauri::command]
pub(crate) fn download_desktop_update(app: AppHandle) -> Result<(), String> {
    if !supports_cached_updates() {
        return Err("background update download is not supported on this platform".into());
    }

    let guard = begin_update()?;
    tauri::async_runtime::spawn(async move {
        let _guard = guard;
        run_background_download(app).await;
    });
    Ok(())
}

async fn run_background_download(app: AppHandle) {
    let Some((update, bytes)) = check_and_download(&app).await else {
        return;
    };

    if let Err(err) = persist_cached_update(&app, &update, &bytes) {
        return emit_error(&app, "download", &err);
    }

    log::info!(
        "[updates] background download ready: version={}",
        update.version
    );
    emit(
        &app,
        "update:download-done",
        &serde_json::json!({ "version": update.version }),
    );
}

#[tauri::command]
pub(crate) fn install_downloaded_update(app: AppHandle) -> Result<(), String> {
    if !supports_cached_updates() {
        return Err("cached updates are not supported on this platform".into());
    }

    let guard = begin_update()?;
    tauri::async_runtime::spawn(async move {
        let _guard = guard;
        run_cached_install(app).await;
    });
    Ok(())
}

async fn run_cached_install(app: AppHandle) {
    let Some(cache_dir) = cached_update_dir(&app) else {
        return emit_error(&app, "install", &"cannot determine app data directory");
    };

    let meta = match read_cached_update_meta(&cache_dir) {
        Ok(meta) => meta,
        Err(err) => {
            remove_cached_update(&cache_dir);
            return emit_error(&app, "install", &err);
        }
    };

    if let Err(err) = ensure_current_platform(&meta) {
        remove_cached_update(&cache_dir);
        return emit_error(&app, "install", &err);
    }

    let artifact_path = cached_artifact_path(&cache_dir, &meta);
    if !artifact_path.is_file() {
        remove_cached_update(&cache_dir);
        return emit_error(
            &app,
            "install",
            &"cached update artifact not found - please download again",
        );
    }

    // The cache lives in a user-writable directory, so "verified at download
    // time" is not enough. Re-verify the on-disk bytes against the configured
    // updater public key right before install.
    let bytes = match std::fs::read(&artifact_path) {
        Ok(bytes) => bytes,
        Err(err) => {
            remove_cached_update(&cache_dir);
            return emit_error(
                &app,
                "install",
                &format!("cannot read cached update: {err}"),
            );
        }
    };
    if let Err(err) = verify_cached_update(&app, &meta, &bytes) {
        remove_cached_update(&cache_dir);
        return emit_error(&app, "install", &err);
    }

    log::info!(
        "[updates] installing cached update version={} artifact={}",
        meta.version,
        artifact_path.display()
    );
    emit(&app, "update:install-start", &serde_json::json!({}));

    if let Err(err) = ensure_macos_update_location(&app) {
        return emit_error(&app, "install", &err);
    }

    match meta.platform.as_str() {
        "windows" => {
            if let Err(err) = backend::stop_and_wait(&app).await {
                return emit_error(&app, "install", &err);
            }
            if let Err(err) = install_cached_windows(&app, &artifact_path, &meta) {
                let _ = backend::restart_backend(app.clone()).await;
                emit_error(&app, "install", &err);
            }
        }
        "macos" => install_cached_macos(&app, &cache_dir, &meta, bytes).await,
        _ => {
            remove_cached_update(&cache_dir);
            emit_error(&app, "install", &"cached update platform is unsupported");
        }
    }
}

/// The macOS updater replaces the running `.app` by renaming it and moving a
/// staged bundle into its place. When the app is launched directly from a DMG
/// or another read-only mount, that operation can only fail with errno 30.
/// Check the bundle's parent before stopping the backend so a failed update
/// does not strand the current app in the startup gate.
fn ensure_macos_update_location(app: &AppHandle) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        let resource_dir = app
            .path()
            .resource_dir()
            .map_err(|err| format!("cannot determine macOS app location: {err}"))?;
        let app_bundle = resource_dir
            .parent()
            .and_then(std::path::Path::parent)
            .ok_or("cannot determine macOS app bundle location")?;
        let install_parent = app_bundle
            .parent()
            .ok_or("cannot determine macOS app install location")?;

        let probe = match tempfile::Builder::new()
            .prefix(".qwenpaw-update-probe-")
            .tempfile_in(install_parent)
        {
            Ok(file) => file,
            Err(err) if err.raw_os_error() == Some(30) => {
                return Err(format!(
                    "QwenPaw is running from a read-only macOS location ({err}). Move QwenPaw.app to the Applications folder, launch it from there, then try updating again."
                ));
            }
            // PermissionDenied can be recoverable by the updater's existing
            // administrator authorization flow, so do not reject it here.
            Err(_) => return Ok(()),
        };
        drop(probe);
    }

    #[cfg(not(target_os = "macos"))]
    let _ = app;

    Ok(())
}

fn install_cached_windows(
    app: &AppHandle,
    artifact_path: &std::path::Path,
    meta: &cache::UpdateMeta,
) -> Result<(), String> {
    // Both signed NSIS executables and portable ZIPs use the same cached
    // extension so the cache metadata cannot be used as a type discriminator.
    // Inspect the magic bytes immediately before launching anything.
    let is_zip = std::fs::File::open(artifact_path)
        .and_then(|mut file| {
            use std::io::Read;
            let mut magic = [0u8; 4];
            file.read_exact(&mut magic)?;
            Ok(magic[0..2] == *b"PK")
        })
        .unwrap_or(false);
    let result = if is_zip {
        launch_windows_update_assistant(app, artifact_path, meta)
    } else {
        std::process::Command::new(artifact_path)
            .args(["/P", "/R", "/UPDATE", "/NO_QWENPAW_PATH"])
            .spawn()
            .map(|_| ())
            .map_err(|err| format!("failed to launch Windows updater: {err}"))
    };
    result?;
    // Mirrors tauri-plugin-updater's Windows path: after NSIS is launched the
    // current process must exit so the installer can replace locked files.
    app.cleanup_before_exit();
    std::process::exit(0);
}

#[cfg(windows)]
fn launch_windows_update_assistant(
    app: &AppHandle,
    artifact_path: &std::path::Path,
    meta: &cache::UpdateMeta,
) -> Result<(), String> {
    use std::time::{Duration, Instant};
    use tauri::Manager;

    if meta.sha256.len() != 64 {
        return Err("cached update has no valid SHA-256 for the update assistant".into());
    }
    let resource_dir = app
        .path()
        .resource_dir()
        .map_err(|err| format!("failed to resolve resource directory: {err}"))?;
    let assistant = resource_dir
        .join("binaries")
        .join("update-assistant")
        .join("UGSciUpdateAssistant.exe");
    if !assistant.is_file() {
        return Err(format!(
            "Windows update assistant is missing at {}",
            assistant.display()
        ));
    }
    let ready_file =
        artifact_path.with_file_name(format!(".update-assistant-ready-{}", uuid::Uuid::new_v4()));
    let _ = std::fs::remove_file(&ready_file);
    let mut child = std::process::Command::new(&assistant)
        .arg("--package")
        .arg(artifact_path)
        .arg("--sha256")
        .arg(&meta.sha256)
        .arg("--version")
        .arg(&meta.version)
        .arg("--parent-pid")
        .arg(std::process::id().to_string())
        .arg("--ready-file")
        .arg(&ready_file)
        .spawn()
        .map_err(|err| format!("failed to launch Windows update assistant: {err}"))?;

    let deadline = Instant::now() + Duration::from_secs(10);
    while Instant::now() < deadline {
        if ready_file.is_file() {
            let _ = std::fs::remove_file(&ready_file);
            log::info!(
                "[updates] Windows update assistant ready pid={} version={}",
                child.id(),
                meta.version
            );
            return Ok(());
        }
        if let Some(status) = child
            .try_wait()
            .map_err(|err| format!("cannot query Windows update assistant: {err}"))?
        {
            return Err(format!(
                "Windows update assistant exited before showing its window ({status})"
            ));
        }
        std::thread::sleep(Duration::from_millis(100));
    }
    let _ = child.kill();
    let _ = std::fs::remove_file(&ready_file);
    Err("Windows update assistant did not show its window in time".into())
}

#[cfg(not(windows))]
fn launch_windows_update_assistant(
    _app: &AppHandle,
    _artifact_path: &std::path::Path,
    _meta: &cache::UpdateMeta,
) -> Result<(), String> {
    Err("Windows update assistant is unavailable on this platform".into())
}

async fn install_cached_macos(
    app: &AppHandle,
    cache_dir: &std::path::Path,
    meta: &cache::UpdateMeta,
    bytes: Vec<u8>,
) {
    let update = match check_installable_update(app).await {
        Ok(Some(update)) => update,
        Ok(None) => {
            remove_cached_update(cache_dir);
            return emit_error(
                app,
                "install",
                &"cached update is no longer available - please download again",
            );
        }
        Err(err) => return emit_updater_error(app, "check", &err),
    };

    if update.version != meta.version
        || update.target != meta.target
        || update.signature != meta.signature
    {
        remove_cached_update(cache_dir);
        return emit_error(
            app,
            "install",
            &"cached update no longer matches the latest release - please download again",
        );
    }

    if let Err(err) = backend::stop_and_wait(app).await {
        return emit_error(app, "install", &err);
    }

    if let Err(err) = update.install(bytes) {
        let install_error = err.to_string();
        let install_kind = classify_updater_error(&err);
        let recovery_error = backend::restart_backend(app.clone()).await.err();
        if let Some(recovery_error) = recovery_error {
            emit_error(
                app,
                "install",
                &format!("{install_error}; backend recovery failed: {recovery_error}"),
            );
        } else {
            emit_updater_error_message(app, "install", install_kind, &install_error);
        }
        return;
    }
    app.restart();
}

#[tauri::command]
pub(crate) async fn check_cached_update(app: AppHandle) -> Result<Option<String>, String> {
    if !supports_cached_updates() {
        return Ok(None);
    }

    let Some(cache_dir) = cached_update_dir(&app) else {
        return Ok(None);
    };

    if !has_cached_update_meta(&cache_dir) {
        return Ok(None);
    }

    let Ok(meta) = read_cached_update_meta(&cache_dir) else {
        remove_cached_update(&cache_dir);
        return Ok(None);
    };

    if ensure_current_platform(&meta).is_err() {
        remove_cached_update(&cache_dir);
        return Ok(None);
    }

    // Compare with current app version. If cached version <= current, it's stale.
    let current_version = app.config().version.clone().unwrap_or_default();

    if version_lte(&meta.version, &current_version) {
        log::info!(
            "[updates] cleaning stale cached update: cached={} current={}",
            meta.version,
            current_version
        );
        remove_cached_update(&cache_dir);
        return Ok(None);
    }

    if !cached_artifact_path(&cache_dir, &meta).is_file() {
        remove_cached_update(&cache_dir);
        return Ok(None);
    }

    Ok(Some(meta.version))
}
