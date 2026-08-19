//! Tauri command for revealing a file in the system file manager.
//!
//! Platform-specific behavior:
//! - macOS: `open -R <path>` — reveals the file in Finder
//! - Windows: `explorer /select, <path>` — selects the file in Explorer
//! - Linux: `xdg-open <parent_dir>` — opens the parent directory
//!
//! Frontend workspace/chat UI should prefer the backend `/workspace/reveal`
//! endpoint, which resolves project-relative paths. This command remains for
//! callers that already have an absolute host path.

use std::path::{Path, PathBuf};
use std::process::Command;

/// Reveal a file in the system file manager (Finder / Explorer / xdg-open).
///
/// Accepts an absolute file path. Relative paths are rejected so the app
/// working directory cannot be mistaken for a project folder. If the file
/// does not exist, attempts to open the parent directory instead.
#[tauri::command]
pub(crate) async fn reveal_in_file_manager(path: String) -> Result<(), String> {
    let file_path = PathBuf::from(&path);
    if !file_path.is_absolute() {
        return Err(format!("Path must be absolute: {}", path));
    }

    let (target_path, is_file) = if file_path.exists() {
        (file_path.clone(), file_path.is_file())
    } else if let Some(parent) = file_path.parent().filter(|parent| parent.exists()) {
        (parent.to_path_buf(), false)
    } else {
        return Err(format!("Path does not exist: {}", path));
    };

    reveal_existing(&target_path, is_file)
}

fn reveal_existing(target_path: &Path, is_file: bool) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        let mut cmd = Command::new("open");
        if is_file {
            cmd.args(["-R", &target_path.to_string_lossy()]);
        } else {
            cmd.arg(target_path);
        }
        cmd.spawn().map_err(|err| err.to_string())?;
        Ok(())
    }

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x0800_0000;
        let normalized = target_path.to_string_lossy().replace('/', "\\");
        let mut cmd = Command::new("explorer");
        if is_file {
            cmd.arg("/select,").arg(&normalized);
        } else {
            cmd.arg(&normalized);
        }
        cmd.creation_flags(CREATE_NO_WINDOW);
        cmd.spawn().map_err(|err| err.to_string())?;
        Ok(())
    }

    #[cfg(target_os = "linux")]
    {
        let dir = if is_file {
            target_path
                .parent()
                .map_or_else(|| target_path.to_path_buf(), Path::to_path_buf)
        } else {
            target_path.to_path_buf()
        };
        Command::new("xdg-open")
            .arg(&dir)
            .spawn()
            .map_err(|err| err.to_string())?;
        Ok(())
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
    {
        let _ = (target_path, is_file);
        Err("reveal_in_file_manager is not supported on this platform".into())
    }
}
