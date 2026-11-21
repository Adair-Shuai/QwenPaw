//! Tauri desktop entry point and plugin/command registration.

mod backend;
mod backend_download;
mod channel_runtime;
#[cfg(all(target_os = "macos", not(debug_assertions)))]
mod computer_use_helper;
mod computer_use_protocol;
mod computer_use_runtime;
mod delivery_files;
mod desktop_icons;
mod external_link;
#[cfg(all(target_os = "macos", debug_assertions))]
mod macos_dev_bundle;
mod notification_delivery;
mod notifications;
mod reveal;
mod runtime_env;
mod runtime_layout;
mod startup_diagnostics;
#[cfg(test)]
mod test_support;
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
/// Build the desktop app, wire native plugins/commands, and attach to the shared runtime.
pub fn run() {
    startup_diagnostics::init(startup_diagnostics::Mode::Desktop);
    startup_diagnostics::record("Load desktop context", "started");
    let mut context = tauri::generate_context!();
    context.set_default_window_icon(Some(desktop_icons::window_icon()));
    startup_diagnostics::set_desktop_version(&context.package_info().version.to_string());
    #[cfg(all(target_os = "macos", debug_assertions))]
    if let Err(error) = macos_dev_bundle::relaunch_if_needed(
        &context.config().identifier,
        context
            .config()
            .product_name
            .as_deref()
            .unwrap_or("UGSci"),
        env!("CARGO_PKG_VERSION"),
    ) {
        startup_diagnostics::report_fatal("Prepare macOS development bundle", &error);
        std::process::exit(1);
    }
    startup_diagnostics::record("Register desktop window", "started");
    let registration = match updates::coordination::register_desktop(&context.config().identifier) {
        Ok(Some(registration)) => registration,
        Ok(None) => {
            startup_diagnostics::record("Update deferred", "Desktop start deferred while updating");
            startup_diagnostics::show_update_in_progress();
            return;
        }
        Err(error) => {
            startup_diagnostics::report_fatal("Register desktop window", &error);
            std::process::exit(1);
        }
    };
    startup_diagnostics::record("Build desktop application", "started");
    let build_result = tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_updater::Builder::new()
                .default_version_comparator(updates::is_remote_update_newer)
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            open_devtools,
            notifications::start_console_polling,
            notifications::stop_console_polling,
            notifications::configure_approval_notifications,
            notifications::get_notification_permission,
            notifications::request_notification_permission,
            notifications::configure_system_notifications,
            notifications::open_notification_settings,
            notification_delivery::take_notification_target,
            backend_download::download_backend_file,
            backend_download::read_workspace_binary_file,
            backend::agent_host_state,
            backend::backend_port,
            backend::backend_startup_error,
            backend::restart_backend,
            external_link::open_external_link,
            delivery_files::stage_delivery_file,
            delivery_files::list_delivery_file_applications,
            delivery_files::open_delivery_file,
            delivery_files::reveal_delivery_file,
            reveal::reveal_in_file_manager,
            external_link::open_workspace_html,
            updates::coordination::confirm_desktop_update,
            updates::check_desktop_update,
            updates::install_desktop_update,
            updates::download_desktop_update,
            updates::install_downloaded_update,
            updates::check_cached_update,
            updates::restart_for_component_updates,
            tray::minimize_to_tray,
            tray::quit_app,
            tray::stop_service,
            tray::set_close_action,
            tray::get_close_action,
            tray::set_tray_labels,
            tray::ack_close,
            ui_verification::report_ui_verification,
        ])
        .manage(registration)
        .manage(updates::coordination::Confirmation::default())
        .manage(backend::BackendState::default())
        .manage(delivery_files::DeliveryFileState::default())
        .manage(computer_use_runtime::ComputerUseRuntimeState::default())
        .manage(tray::TrayState::default())
        .manage(notifications::NotificationState::default())
        .manage(notification_delivery::ActivationState::default())
        .setup(|app| {
            // Tauri runs setup inside the event loop and panics on errors, which
            // release builds never show. Report and exit here instead.
            if let Err(error) = setup_desktop(app) {
                startup_diagnostics::report_fatal(
                    &startup_diagnostics::current_stage(),
                    &startup_diagnostics::error_chain(error.as_ref()),
                );
                std::process::exit(1);
            }
            Ok(())
        })
        .on_window_event(|window, event| {
            desktop_icons::on_window_event(window, event);
            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                tray::request_close(window.app_handle());
            }
        })
        .build(context);

    match build_result {
        Ok(app) => {
            startup_diagnostics::record(
                "Desktop application built",
                "Setup runs when the event loop starts",
            );
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
                    if code.is_none() && !tray::is_quitting(app_handle) {
                        api.prevent_exit();
                        // The window may be hidden in the tray; bring it back so
                        // the close prompt is actually visible before asking.
                        tray::show_main_window(app_handle);
                        tray::request_close(app_handle);
                        return;
                    }
                    #[cfg(not(target_os = "macos"))]
                    let _ = (&api, &code);
                    backend::detach(app_handle);
                    if let Err(error) = computer_use_runtime::stop(app_handle) {
                        log::warn!("[computer-use] helper shutdown failed: {error}");
                    }
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
            startup_diagnostics::report_fatal(
                &startup_diagnostics::current_stage(),
                &startup_diagnostics::error_chain(&err),
            );
            std::process::exit(1);
        }
    }
}

/// Initialize coordination, logging, backend attachment and the tray.
fn setup_desktop(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    // Automatic windows are created before our setup callback. Build the main
    // window here so WebView initialization errors reach report_fatal too.
    startup_diagnostics::record("Create main window", "label=main");
    let config = app
        .config()
        .app
        .windows
        .iter()
        .find(|config| config.label == "main")
        .ok_or("Main window configuration is missing")?;
    let create_window = || tauri::WebviewWindowBuilder::from_config(app.handle(), config)?.build();
    let window = create_window();
    #[cfg(windows)]
    let window = match window {
        Err(err) if is_webview2_startup_error(&err) && try_install_bundled_webview2() => {
            create_window()
        }
        other => other,
    };
    #[cfg(windows)]
    if let Err(err) = &window {
        if is_webview2_startup_error(err) {
            startup_diagnostics::record("WebView2 unavailable", err.to_string());
            notify_desktop_window_unavailable(err);
            std::process::exit(0);
        }
    }
    window?;
    startup_diagnostics::record("Initialize installation coordination", "started");
    updates::coordination::setup(app.handle())?;
    startup_diagnostics::record(
        "Initialize desktop logging and backend attachment",
        "started",
    );
    backend::setup(app)?;
    startup_diagnostics::record("Initialize system tray", "started");
    tray::setup(app)?;
    #[cfg(windows)]
    if let Err(error) = notification_delivery::setup(app.handle()) {
        log::error!("Could not register desktop notification activation: {error}");
    }
    #[cfg(windows)]
    if let Some(window) = app.get_webview_window("main") {
        if let Err(err) = webview_recovery::install(&window) {
            log::error!("[webview] failed to install browser-process recovery: {err}");
        }
    }
    startup_diagnostics::record("Desktop ready", "Desktop setup completed");
    Ok(())
}

/// Run the detached desktop supervisor without constructing a WebView.
pub fn run_agent_host() -> Result<(), String> {
    startup_diagnostics::init(startup_diagnostics::Mode::AgentHost);
    startup_diagnostics::record("Start background supervisor", "started");
    backend::daemon::run().inspect_err(|error| {
        startup_diagnostics::report_fatal("Start background supervisor", error);
    })
}

#[cfg(test)]
mod tests {
    #[test]
    fn main_window_is_created_only_by_our_setup() {
        let config: tauri::Config =
            serde_json::from_str(include_str!("../tauri.conf.json")).unwrap();
        let main: Vec<_> = config
            .app
            .windows
            .iter()
            .filter(|w| w.label == "main")
            .collect();
        assert_eq!(main.len(), 1);
        assert!(
            !main[0].create,
            "Automatic creation bypasses startup diagnostics"
        );
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
            "[UGSci] Installing Microsoft WebView2 Runtime from {}",
            installer.display()
        );
        match std::process::Command::new(&installer)
            .args(["/silent", "/install"])
            .status()
        {
            Ok(status) if status.success() => return true,
            Ok(status) => {
                eprintln!("[UGSci] WebView2 installer exited with {status}");
            }
            Err(err) => {
                eprintln!("[UGSci] WebView2 installer failed to start: {err}");
            }
        }
    }
    false
}

#[cfg(windows)]
fn notify_desktop_window_unavailable(err: &tauri::Error) {
    let text = format!(
        "UGSci could not open the application window because Microsoft WebView2 Runtime is missing or failed to start.\n\nThe desktop window and visualization stay unavailable until WebView2 is installed. QwenPaw command-line tools in the install folder still work.\n\nDetails:\n{err}"
    );
    show_windows_message("UGSci", &text);
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
