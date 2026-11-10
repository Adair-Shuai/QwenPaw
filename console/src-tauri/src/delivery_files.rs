//! Open immutable delivery snapshots through the user's desktop applications.
//!
//! The web frontend obtains the authorized archive bytes. This module never
//! resolves a workspace path or accepts a caller-provided executable. Native
//! actions accept only an opaque token minted when those bytes are staged.

use std::{
    collections::HashMap,
    path::{Path, PathBuf},
    sync::{Arc, Mutex},
};

use base64::{engine::general_purpose::STANDARD, Engine};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

#[cfg(windows)]
mod windows;

const MAX_FILE_BYTES: usize = 32 * 1024 * 1024;
const MAX_SESSION_BYTES: usize = 512 * 1024 * 1024;
const MAX_SESSION_FILES: usize = 128;

#[derive(Default)]
pub(crate) struct DeliveryFileState(Arc<Mutex<DeliveryStore>>);

#[derive(Default)]
struct DeliveryStore {
    files: HashMap<String, StagedDelivery>,
    bytes: usize,
}

struct StagedDelivery {
    directory: tempfile::TempDir,
    canonical_directory: PathBuf,
    path: PathBuf,
    digest: [u8; 32],
}

impl Drop for StagedDelivery {
    fn drop(&mut self) {
        // Windows cannot remove a read-only file. Only change the exact file
        // owned by this entry; TempDir then removes its private directory.
        if self.verify_directory().is_err() {
            return;
        }
        if let Ok(metadata) = std::fs::symlink_metadata(&self.path) {
            if metadata.is_file() && !metadata.file_type().is_symlink() {
                let mut permissions = metadata.permissions();
                #[cfg(windows)]
                permissions.set_readonly(false);
                #[cfg(unix)]
                {
                    use std::os::unix::fs::PermissionsExt;
                    permissions.set_mode(0o600);
                }
                let _ = std::fs::set_permissions(&self.path, permissions);
            }
        }
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct StageDeliveryFileRequest {
    file_name: String,
    content_base64: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct StagedDeliveryFile {
    token: String,
    file_name: String,
    path: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct DeliveryApplication {
    id: String,
    name: String,
    icon_data_url: Option<String>,
    is_default: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct DeliveryApplications {
    applications: Vec<DeliveryApplication>,
    can_open_default: bool,
    can_choose_application: bool,
}

fn validate_file_name(name: &str) -> Result<(), String> {
    if name.is_empty()
        || name.len() > 240
        || name.trim() != name
        || name.ends_with('.')
        || name
            .chars()
            .any(|ch| ch.is_control() || "\\/:*?\"<>|".contains(ch))
        || name == "."
        || name == ".."
    {
        return Err("Delivery file name must be a single ordinary file name".into());
    }
    let stem = name
        .split('.')
        .next()
        .unwrap_or_default()
        .to_ascii_uppercase();
    if ["CON", "PRN", "AUX", "NUL", "CONIN$", "CONOUT$"].contains(&stem.as_str())
        || (stem.len() == 4
            && (stem.starts_with("COM") || stem.starts_with("LPT"))
            && stem.as_bytes()[3].is_ascii_digit())
    {
        return Err("Delivery file name is reserved by the operating system".into());
    }
    Ok(())
}

fn file_extension(name: &str) -> Result<String, String> {
    validate_file_name(name)?;
    let extension = Path::new(name)
        .extension()
        .and_then(|ext| ext.to_str())
        .filter(|ext| !ext.is_empty())
        .ok_or("The file has no application association extension")?;
    // Default shell verbs for these types can run programs rather than open
    // a document. They remain previewable/downloadable in the frontend.
    if [
        "exe", "com", "bat", "cmd", "ps1", "psm1", "psd1", "vbs", "vbe", "js", "jse", "wsf", "wsh",
        "msi", "msp", "scr", "cpl", "hta", "lnk", "url", "reg", "sh", "command", "desktop", "app",
        "jar", "py", "pyw",
    ]
    .contains(&extension.to_ascii_lowercase().as_str())
    {
        return Err(
            "Executable and script deliveries must be previewed or saved, not launched".into(),
        );
    }
    Ok(format!(".{}", extension.to_ascii_lowercase()))
}

impl DeliveryStore {
    fn stage(&mut self, request: StageDeliveryFileRequest) -> Result<StagedDeliveryFile, String> {
        validate_file_name(&request.file_name)?;
        if request.content_base64.len() > MAX_FILE_BYTES.div_ceil(3) * 4 {
            return Err("Delivery file exceeds the 32 MiB opening limit".into());
        }
        let bytes = STANDARD
            .decode(&request.content_base64)
            .map_err(|_| "Delivery content is not valid base64".to_string())?;
        if bytes.len() > MAX_FILE_BYTES {
            return Err("Delivery file exceeds the 32 MiB opening limit".into());
        }
        let digest: [u8; 32] = Sha256::digest(&bytes).into();
        // Repeated opens do not consume the session allowance. A changed or
        // removed external copy is never reused as the archived version.
        for (token, file) in &self.files {
            if file.path.file_name().and_then(|name| name.to_str()) == Some(&request.file_name)
                && file.digest == digest
                && file.verified_path().is_ok()
            {
                return Ok(StagedDeliveryFile {
                    token: token.clone(),
                    file_name: request.file_name,
                    path: file.path.to_string_lossy().into_owned(),
                });
            }
        }
        if self.files.len() >= MAX_SESSION_FILES || self.bytes + bytes.len() > MAX_SESSION_BYTES {
            return Err("Delivery opening cache is full (128 files / 512 MiB); save the file instead or restart the desktop app".into());
        }
        let directory = tempfile::Builder::new()
            .prefix("ugsci-delivery-")
            .tempdir()
            .map_err(|err| format!("Could not prepare the delivery directory: {err}"))?;
        let canonical_directory = directory
            .path()
            .canonicalize()
            .map_err(|err| format!("Could not resolve the delivery directory: {err}"))?;
        let path = directory.path().join(&request.file_name);
        std::fs::write(&path, &bytes)
            .map_err(|err| format!("Could not stage delivery content: {err}"))?;
        let mut permissions = std::fs::metadata(&path)
            .map_err(|err| err.to_string())?
            .permissions();
        permissions.set_readonly(true);
        std::fs::set_permissions(&path, permissions)
            .map_err(|err| format!("Could not protect the delivery copy: {err}"))?;
        let token = uuid::Uuid::new_v4().to_string();
        let result = StagedDeliveryFile {
            token: token.clone(),
            file_name: request.file_name,
            path: path.to_string_lossy().into_owned(),
        };
        self.files.insert(
            token,
            StagedDelivery {
                directory,
                canonical_directory,
                path,
                digest,
            },
        );
        self.bytes += bytes.len();
        Ok(result)
    }

    fn resolve(&self, token: &str) -> Result<PathBuf, String> {
        self.files
            .get(token)
            .ok_or("Delivery copy is no longer available; reopen the archived file")?
            .verified_path()
    }
}

impl StagedDelivery {
    fn verify_directory(&self) -> Result<(), String> {
        let metadata = std::fs::symlink_metadata(self.directory.path())
            .map_err(|err| format!("Delivery directory is unavailable: {err}"))?;
        if !metadata.is_dir() || metadata.file_type().is_symlink() {
            return Err("Delivery directory is no longer an ordinary directory".into());
        }
        #[cfg(windows)]
        {
            use std::os::windows::fs::MetadataExt;
            if metadata.file_attributes() & 0x400 != 0 {
                return Err("Delivery directory cannot be a reparse point".into());
            }
        }
        if self
            .directory
            .path()
            .canonicalize()
            .map_err(|err| err.to_string())?
            != self.canonical_directory
        {
            return Err("Delivery directory no longer matches its original location".into());
        }
        Ok(())
    }

    fn verified_path(&self) -> Result<PathBuf, String> {
        self.verify_directory()?;
        let metadata = std::fs::symlink_metadata(&self.path)
            .map_err(|err| format!("Delivery copy is unavailable: {err}"))?;
        if !metadata.is_file()
            || metadata.file_type().is_symlink()
            || metadata.len() > MAX_FILE_BYTES as u64
        {
            return Err("Delivery copy is no longer an ordinary file".into());
        }
        #[cfg(windows)]
        {
            use std::os::windows::fs::MetadataExt;
            if metadata.file_attributes() & 0x400 != 0 {
                return Err("Delivery copy cannot be a reparse point".into());
            }
        }
        let parent = self
            .path
            .parent()
            .ok_or("Delivery directory is unavailable")?;
        if parent.canonicalize().map_err(|err| err.to_string())? != self.canonical_directory {
            return Err("Delivery copy is outside its staging directory".into());
        }
        let bytes = std::fs::read(&self.path)
            .map_err(|err| format!("Could not verify delivery copy: {err}"))?;
        let digest: [u8; 32] = Sha256::digest(&bytes).into();
        if digest != self.digest {
            return Err("Delivery copy was modified externally; reopen the archived file".into());
        }
        Ok(self.path.clone())
    }
}

#[tauri::command]
pub(crate) async fn stage_delivery_file(
    state: tauri::State<'_, DeliveryFileState>,
    request: StageDeliveryFileRequest,
) -> Result<StagedDeliveryFile, String> {
    let store = state.0.clone();
    tauri::async_runtime::spawn_blocking(move || {
        store
            .lock()
            .map_err(|_| "Delivery cache is unavailable".to_string())?
            .stage(request)
    })
    .await
    .map_err(|err| err.to_string())?
}

#[tauri::command]
pub(crate) async fn list_delivery_file_applications(
    file_name: String,
) -> Result<DeliveryApplications, String> {
    let extension = match file_extension(&file_name) {
        Ok(extension) => extension,
        Err(_) => {
            validate_file_name(&file_name)?;
            return Ok(DeliveryApplications {
                applications: vec![],
                can_open_default: false,
                can_choose_application: false,
            });
        }
    };
    tauri::async_runtime::spawn_blocking(move || platform_applications(&extension))
        .await
        .map_err(|err| err.to_string())?
}

#[tauri::command]
pub(crate) async fn open_delivery_file(
    state: tauri::State<'_, DeliveryFileState>,
    token: String,
    application_id: Option<String>,
) -> Result<(), String> {
    let store = state.0.clone();
    tauri::async_runtime::spawn_blocking(move || {
        let path = store
            .lock()
            .map_err(|_| "Delivery cache is unavailable".to_string())?
            .resolve(&token)?;
        let extension = file_extension(
            path.file_name()
                .and_then(|name| name.to_str())
                .ok_or("Invalid delivery file name")?,
        )?;
        platform_open(&path, &extension, application_id.as_deref())
    })
    .await
    .map_err(|err| err.to_string())?
}

#[tauri::command]
pub(crate) async fn reveal_delivery_file(
    state: tauri::State<'_, DeliveryFileState>,
    token: String,
) -> Result<(), String> {
    let store = state.0.clone();
    tauri::async_runtime::spawn_blocking(move || {
        let path = store
            .lock()
            .map_err(|_| "Delivery cache is unavailable".to_string())?
            .resolve(&token)?;
        platform_reveal(&path)
    })
    .await
    .map_err(|err| err.to_string())?
}

#[cfg(windows)]
fn platform_applications(extension: &str) -> Result<DeliveryApplications, String> {
    windows::applications(extension)
}
#[cfg(windows)]
fn platform_open(path: &Path, extension: &str, application_id: Option<&str>) -> Result<(), String> {
    windows::open(path, extension, application_id)
}
#[cfg(windows)]
fn platform_reveal(path: &Path) -> Result<(), String> {
    windows::reveal(path)
}

#[cfg(not(windows))]
fn platform_applications(_extension: &str) -> Result<DeliveryApplications, String> {
    Ok(DeliveryApplications {
        applications: vec![],
        can_open_default: cfg!(any(target_os = "macos", target_os = "linux")),
        can_choose_application: false,
    })
}

#[cfg(not(windows))]
fn platform_open(
    path: &Path,
    _extension: &str,
    application_id: Option<&str>,
) -> Result<(), String> {
    if application_id.is_some() {
        return Err("Choosing a delivery application is not supported on this platform".into());
    }
    #[cfg(target_os = "macos")]
    return run_desktop_command("open", &[path.as_os_str()]);
    #[cfg(target_os = "linux")]
    return run_desktop_command("xdg-open", &[path.as_os_str()]);
    #[cfg(not(any(target_os = "macos", target_os = "linux")))]
    {
        let _ = path;
        Err("Opening delivery files is not supported on this platform".into())
    }
}

#[cfg(not(windows))]
fn platform_reveal(path: &Path) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    return run_desktop_command("open", &[std::ffi::OsStr::new("-R"), path.as_os_str()]);
    #[cfg(target_os = "linux")]
    return run_desktop_command(
        "xdg-open",
        &[path
            .parent()
            .ok_or("Delivery directory is unavailable")?
            .as_os_str()],
    );
    #[cfg(not(any(target_os = "macos", target_os = "linux")))]
    {
        let _ = path;
        Err("Revealing delivery files is not supported on this platform".into())
    }
}

#[cfg(any(target_os = "macos", target_os = "linux"))]
fn run_desktop_command(program: &str, args: &[&std::ffi::OsStr]) -> Result<(), String> {
    let output = std::process::Command::new(program)
        .args(args)
        .output()
        .map_err(|err| format!("Could not start the desktop application: {err}"))?;
    if !output.status.success() {
        return Err(format!(
            "Desktop application returned {}: {}",
            output.status,
            String::from_utf8_lossy(&output.stderr).trim()
        ));
    }
    Ok(())
}

#[cfg(test)]
mod tests;
