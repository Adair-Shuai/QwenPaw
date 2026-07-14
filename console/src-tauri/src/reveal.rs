//! Tauri command for revealing a file in the system file manager.
//!
//! Platform-specific behavior:
//! - macOS: `open -R <path>` — reveals the file in Finder
//! - Windows: `explorer /select,<path>` — selects the file in Explorer
//! - Linux: `xdg-open <parent_dir>` — opens the parent directory

use std::path::Path;
use tauri_plugin_shell::process::CommandEvent;
use tauri_plugin_shell::ShellExt;

/// Reveal a file in the system file manager (Finder / Explorer / xdg-open).
///
/// Accepts an absolute file path. If the file does not exist, attempts to
/// open the parent directory instead.
#[tauri::command]
pub(crate) async fn reveal_in_file_manager(
    app: tauri::AppHandle,
    path: String,
) -> Result<(), String> {
    let file_path = Path::new(&path);

    // Determine the target: if the file exists, reveal it; otherwise try
    // to open its parent directory.
    let (target_path, is_file) = if file_path.exists() {
        (path.clone(), file_path.is_file())
    } else if file_path.parent().map_or(false, |p| p.exists()) {
        (
            file_path
                .parent()
                .unwrap()
                .to_string_lossy()
                .to_string(),
            false,
        )
    } else {
        return Err(format!("Path does not exist: {}", path));
    };

    #[cfg(target_os = "macos")]
    {
        let cmd = if is_file {
            app.shell()
                .command("open")
                .args(["-R", &target_path])
        } else {
            app.shell().command("open").args([&target_path])
        };
        let (mut rx, _child) = cmd.spawn().map_err(|e| e.to_string())?;
        while let Some(event) = rx.recv().await {
            if let CommandEvent::Error(err) = event {
                log::warn!("[reveal] open -R failed: {}", err);
            }
        }
        Ok(())
    }

    #[cfg(target_os = "windows")]
    {
        let arg = if is_file {
            format!("/select,{}", target_path)
        } else {
            target_path
        };
        let (mut rx, _child) = app
            .shell()
            .command("explorer")
            .args([&arg])
            .spawn()
            .map_err(|e| e.to_string())?;
        while let Some(event) = rx.recv().await {
            if let CommandEvent::Error(err) = event {
                log::warn!(
                    "[reveal] explorer failed: {}",
                    err
                );
            }
        }
        Ok(())
    }

    #[cfg(target_os = "linux")]
    {
        let dir = if is_file {
            file_path
                .parent()
                .map_or(target_path.clone(), |p| p.to_string_lossy().to_string())
        } else {
            target_path
        };
        let (mut rx, _child) = app
            .shell()
            .command("xdg-open")
            .args([&dir])
            .spawn()
            .map_err(|e| e.to_string())?;
        while let Some(event) = rx.recv().await {
            if let CommandEvent::Error(err) = event {
                log::warn!(
                    "[reveal] xdg-open failed: {}",
                    err
                );
            }
        }
        Ok(())
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
    {
        let _ = target_path;
        Err("reveal_in_file_manager is not supported on this platform".into())
    }
}
