//! Tauri desktop entry point and plugin/command registration.

mod backend;
mod backend_download;
#[cfg(all(target_os = "macos", not(debug_assertions)))]
mod computer_use_helper;
mod computer_use_protocol;
mod computer_use_runtime;
mod external_link;
mod reveal;
mod runtime_env;
mod runtime_layout;
mod tray;
mod ui_verification;
mod updates;
#[cfg(windows)]
mod webview_recovery;

use tauri::{Manager, RunEvent, WebviewWindow, WindowEvent};

/// Opens the WebView DevTools. Gated by the hidden 8-click logo gesture in the
/// frontend so end users cannot open DevTools via the default context menu or
/// keyboard shortcuts in production builds.
#[tauri::command]
fn open_devtools(window: WebviewWindow) {
    window.open_devtools();
}

fn build_desktop() -> tauri::Result<tauri::App> {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_updater::Builder::new()
                .default_version_comparator(updates::is_remote_update_newer)
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            open_devtools,
            backend_download::download_backend_file,
            backend_download::read_workspace_binary_file,
            backend::backend_port,
            backend::backend_startup_error,
            backend::restart_backend,
            external_link::open_external_link,
            reveal::reveal_in_file_manager,
            external_link::open_workspace_html,
            updates::check_desktop_update,
            updates::install_desktop_update,
            updates::download_desktop_update,
            updates::install_downloaded_update,
            updates::check_cached_update,
            updates::restart_for_component_updates,
            tray::minimize_to_tray,
            tray::quit_app,
            tray::set_tray_labels,
            tray::ack_close,
            ui_verification::report_ui_verification,
        ])
        .manage(backend::BackendState::default())
        .manage(computer_use_runtime::ComputerUseRuntimeState::default())
        .manage(tray::TrayState::default())
        .setup(|app| {
            backend::setup(app)?;
            tray::setup(app)?;
            #[cfg(windows)]
            if let Some(window) = app.get_webview_window("main") {
                if let Err(err) = webview_recovery::install(&window) {
                    log::error!("[webview] failed to install browser-process recovery: {err}");
                }
            }
            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                tray::request_close(window.app_handle());
            }
        })
        .build(tauri::generate_context!())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
/// Build the desktop app, wire native plugins/commands, and stop the backend on exit.
pub fn run() {
    let mut build_result = build_desktop();
    #[cfg(windows)]
    if build_result
        .as_ref()
        .err()
        .is_some_and(is_webview2_startup_error)
        && try_install_bundled_webview2()
    {
        build_result = build_desktop();
    }

    match build_result {
        Ok(app) => {
            app.run(|app_handle, event| match event {
                // `code` is `None` only for OS-initiated quits (e.g. macOS
                // Cmd+Q / app menu Quit). On macOS we route those through the
                // same close prompt as the window's red button, so the choice
                // (minimize-to-tray vs. quit) stays consistent with Windows
                // Alt+F4. Programmatic exits from `quit_app` carry a `code` and
                // fall through to the normal shutdown path below.
                RunEvent::ExitRequested { api, code, .. } => {
                    #[cfg(windows)]
                    if code.is_none() && webview_recovery::is_active() {
                        api.prevent_exit();
                        log::warn!(
                            "[webview] keeping the app alive while the main window recovers"
                        );
                        return;
                    }
                    #[cfg(target_os = "macos")]
                    if code.is_none() {
                        api.prevent_exit();
                        // The window may be hidden in the tray; bring it back so
                        // the close prompt is actually visible before asking.
                        tray::show_main_window(app_handle);
                        tray::request_close(app_handle);
                        return;
                    }
                    #[cfg(not(target_os = "macos"))]
                    let _ = (&api, &code);
                    if let Err(err) =
                        tauri::async_runtime::block_on(backend::stop_and_wait(app_handle))
                    {
                        log::warn!("[backend] graceful shutdown did not complete: {err}");
                    }
                    computer_use_runtime::stop(app_handle);
                }
                // macOS emits this when the user clicks the Dock icon. Without
                // it, a window hidden via "minimize to tray" can only be
                // restored from the menu-bar icon, leaving a dead Dock icon.
                #[cfg(target_os = "macos")]
                RunEvent::Reopen { .. } => {
                    tray::show_main_window(app_handle);
                }
                _ => {}
            });
        }
        Err(err) => {
            eprintln!("[UGSci Desktop] Fatal startup error: {err}");
            #[cfg(windows)]
            {
                if is_webview2_startup_error(&err) {
                    notify_desktop_window_unavailable(&err);
                    std::process::exit(0);
                }
                notify_fatal_startup_error(&err);
            }
            std::process::exit(1);
        }
    }
}

#[cfg(windows)]
fn is_webview2_startup_error(err: &tauri::Error) -> bool {
    let msg = err.to_string().to_ascii_lowercase();
    msg.contains("webview") || msg.contains("cocreateinstance")
}

#[cfg(windows)]
fn try_install_bundled_webview2() -> bool {
    let Ok(exe) = std::env::current_exe() else {
        return false;
    };
    let Some(dir) = exe.parent() else {
        return false;
    };
    let candidates = [
        dir.join("MicrosoftEdgeWebView2RuntimeInstallerX64.exe"),
        dir.join("MicrosoftEdgeWebview2Setup.exe"),
    ];
    for installer in candidates {
        if !installer.is_file() {
            continue;
        }
        eprintln!(
            "[UGSci Desktop] Installing Microsoft WebView2 Runtime from {}",
            installer.display()
        );
        match std::process::Command::new(&installer)
            .args(["/silent", "/install"])
            .status()
        {
            Ok(status) if status.success() => return true,
            Ok(status) => {
                eprintln!("[UGSci Desktop] WebView2 installer exited with {status}");
            }
            Err(err) => {
                eprintln!("[UGSci Desktop] WebView2 installer failed to start: {err}");
            }
        }
    }
    false
}

#[cfg(windows)]
fn notify_desktop_window_unavailable(err: &tauri::Error) {
    let text = format!(
        "UGSci Desktop could not open the application window because Microsoft WebView2 Runtime is missing or failed to start.\n\nThe desktop window and visualization stay unavailable until WebView2 is installed. QwenPaw command-line tools in the install folder still work.\n\nDetails:\n{err}"
    );
    show_windows_message("UGSci Desktop", &text);
}

#[cfg(windows)]
fn notify_fatal_startup_error(err: &tauri::Error) {
    show_windows_message(
        "UGSci Desktop",
        &format!("UGSci Desktop could not start.\n\n{err}"),
    );
}

#[cfg(windows)]
fn show_windows_message(title: &str, text: &str) {
    use windows::core::HSTRING;
    use windows::Win32::UI::WindowsAndMessaging::{MessageBoxW, MB_ICONWARNING, MB_OK};
    let title = HSTRING::from(title);
    let text = HSTRING::from(text);
    unsafe {
        let _ = MessageBoxW(None, &text, &title, MB_OK | MB_ICONWARNING);
    }
}
