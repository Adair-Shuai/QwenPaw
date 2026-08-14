//! Backend sidecar lifecycle for the Tauri desktop app.

use std::{
    process::Command,
    sync::{
        atomic::{AtomicU64, Ordering},
        Mutex,
    },
    time::Duration,
};

use tauri::Manager;
use tauri_plugin_log::{Target, TargetKind};
use tauri_plugin_shell::process::CommandChild;
use tokio::sync::watch;
use uuid::Uuid;

mod command;
mod events;

/// Path of the desktop-only graceful shutdown endpoint on the backend.
const DESKTOP_SHUTDOWN_PATH: &str = "/api/desktop/shutdown";
const DESKTOP_SHUTDOWN_TOKEN_ENV: &str = "QWENPAW_DESKTOP_SHUTDOWN_TOKEN";
const DESKTOP_SHUTDOWN_TOKEN_HEADER: &str = "X-QwenPaw-Desktop-Shutdown-Token";
/// Upper bound for the shutdown HTTP request. The endpoint just flips
/// uvicorn's `should_exit` and returns immediately, so the request is
/// milliseconds in the happy path; this is only a fallback so a wedged
/// backend never blocks quit. uvicorn's own `timeout_graceful_shutdown`
/// bounds the sidecar's internal drain independently.
const GRACEFUL_SHUTDOWN_TIMEOUT: Duration = Duration::from_secs(2);
// Uvicorn is configured with a five-second graceful-drain budget. Give it a
// small margin, then terminate the owned sidecar so quitting never leaves the
// desktop host lingering for a minute.
const GRACEFUL_SHUTDOWN_EXIT_TIMEOUT: Duration = Duration::from_secs(7);
const FORCED_SHUTDOWN_EXIT_TIMEOUT: Duration = Duration::from_secs(2);
const BACKEND_STARTUP_SLOW_WARNING: Duration = Duration::from_secs(15);
const BACKEND_STARTUP_TIMEOUT: Duration = Duration::from_secs(60);

/// Shared sidecar process state managed by Tauri.
#[derive(Default)]
pub(crate) struct BackendState {
    inner: Mutex<BackendInner>,
    generation: AtomicU64,
}

#[derive(Default)]
struct BackendInner {
    child: Option<CommandChild>,
    port: Option<u16>,
    shutdown_token: Option<String>,
    terminated: Option<watch::Receiver<bool>>,
    stopping: bool,
    error: Option<String>,
    launcher: Option<command::LauncherSelection>,
}

enum StopPlan {
    NoProcess,
    Wait(watch::Receiver<bool>),
    Request {
        pid: u32,
        port: Option<u16>,
        shutdown_token: Option<String>,
        terminated: watch::Receiver<bool>,
    },
}

impl BackendState {
    fn with_inner<R>(&self, f: impl FnOnce(&mut BackendInner) -> R) -> R {
        let mut inner = self.inner.lock().expect("backend state poisoned");
        f(&mut inner)
    }

    fn next_generation(&self) -> u64 {
        self.generation.fetch_add(1, Ordering::SeqCst) + 1
    }

    fn is_current(&self, generation: u64) -> bool {
        self.generation.load(Ordering::SeqCst) == generation
    }

    fn port(&self) -> Option<u16> {
        self.with_inner(|inner| inner.port)
    }

    fn error(&self) -> Option<String> {
        self.with_inner(|inner| inner.error.clone())
    }

    fn set_error(&self, message: String) {
        self.with_inner(|inner| {
            inner.error = Some(message);
        });
    }

    fn set_error_if_current(&self, generation: u64, message: String) {
        if self.is_current(generation) {
            self.set_error(message);
        }
    }

    fn set_port_if_current(&self, generation: u64, port: u16) {
        if self.is_current(generation) {
            self.with_inner(|inner| {
                inner.port = Some(port);
                inner.error = None;
            });
        }
    }

    fn is_starting_if_current(&self, generation: u64) -> bool {
        self.with_inner(|inner| {
            self.is_current(generation)
                && !inner.stopping
                && inner.port.is_none()
                && inner.child.is_some()
        })
    }

    fn launcher_if_starting(&self, generation: u64) -> Option<command::LauncherSelection> {
        self.with_inner(|inner| {
            (self.is_current(generation)
                && !inner.stopping
                && inner.port.is_none()
                && inner.child.is_some())
            .then_some(inner.launcher)
            .flatten()
        })
    }

    fn clear_startup_state(&self) {
        self.with_inner(|inner| {
            inner.port = None;
            inner.shutdown_token = None;
            inner.terminated = None;
            inner.stopping = false;
            inner.error = None;
            inner.launcher = None;
        });
    }

    fn clear_child_if_current(&self, generation: u64) {
        if self.is_current(generation) {
            self.with_inner(|inner| {
                inner.child.take();
                inner.shutdown_token = None;
                inner.terminated = None;
                inner.stopping = false;
                inner.launcher = None;
            });
        }
    }

    fn begin_stop(&self) -> StopPlan {
        self.with_inner(|inner| {
            let Some(terminated) = &inner.terminated else {
                return StopPlan::NoProcess;
            };
            if *terminated.borrow() {
                inner.child.take();
                inner.port = None;
                inner.shutdown_token = None;
                inner.terminated = None;
                inner.stopping = false;
                inner.launcher = None;
                return StopPlan::NoProcess;
            }

            let terminated = terminated.clone();
            if inner.stopping {
                return StopPlan::Wait(terminated);
            }
            let Some(child) = &inner.child else {
                return StopPlan::Wait(terminated);
            };

            self.next_generation();
            inner.stopping = true;
            StopPlan::Request {
                pid: child.pid(),
                port: inner.port,
                shutdown_token: inner.shutdown_token.clone(),
                terminated,
            }
        })
    }

    fn force_kill(&self) {
        let pid = self.with_inner(|inner| inner.child.as_ref().map(|child| child.pid()));
        let Some(pid) = pid else {
            return;
        };
        if let Err(err) = kill_process_tree(pid) {
            log::warn!("[backend] failed to stop process tree pid={pid}: {err}");
        }
    }

    fn finish_stop(&self) {
        self.with_inner(|inner| {
            inner.child.take();
            inner.port = None;
            inner.shutdown_token = None;
            inner.terminated = None;
            inner.stopping = false;
            inner.launcher = None;
        });
    }

    async fn request_stop(&self, pid: u32, port: Option<u16>, shutdown_token: Option<String>) {
        log::info!("[backend] stopping process pid={pid}");

        if let (Some(port), Some(shutdown_token)) = (port, shutdown_token) {
            match request_graceful_shutdown(port, &shutdown_token).await {
                Ok(()) => {
                    log::info!("[backend] graceful shutdown requested pid={pid}");
                    return;
                }
                Err(err) => {
                    log::warn!(
                        "[backend] graceful shutdown failed pid={pid}: {err}; killing process"
                    );
                }
            }
        } else {
            log::warn!("[backend] no shutdown credentials for pid={pid}; killing process");
        }

        self.force_kill();
    }

    async fn stop_and_wait(&self) -> Result<(), String> {
        let terminated = match self.begin_stop() {
            StopPlan::NoProcess => return Ok(()),
            StopPlan::Wait(terminated) => terminated,
            StopPlan::Request {
                pid,
                port,
                shutdown_token,
                terminated,
            } => {
                self.request_stop(pid, port, shutdown_token).await;
                terminated
            }
        };

        match wait_for_termination(terminated.clone(), GRACEFUL_SHUTDOWN_EXIT_TIMEOUT).await {
            Ok(()) => {
                self.finish_stop();
                Ok(())
            }
            Err(err) => {
                log::warn!("[backend] {err}; forcing sidecar termination");
                self.force_kill();
                match wait_for_termination(terminated, FORCED_SHUTDOWN_EXIT_TIMEOUT).await {
                    Ok(()) => {
                        log::warn!(
                            "[backend] sidecar force-terminated after graceful shutdown failure"
                        );
                        self.finish_stop();
                        Ok(())
                    }
                    Err(force_err) => Err(format!(
                        "{err}; failed to confirm forced backend termination: {force_err}"
                    )),
                }
            }
        }
    }
}

#[cfg(windows)]
fn kill_process_tree(pid: u32) -> Result<(), String> {
    use std::os::windows::process::CommandExt;

    const CREATE_NO_WINDOW: u32 = 0x08000000;
    let status = Command::new("taskkill")
        .args(["/PID", &pid.to_string(), "/T", "/F"])
        .creation_flags(CREATE_NO_WINDOW)
        .status()
        .map_err(|err| format!("failed to launch taskkill: {err}"))?;
    if status.success() {
        Ok(())
    } else {
        Err(format!("taskkill exited with status {status}"))
    }
}

#[cfg(not(windows))]
fn kill_process_tree(pid: u32) -> Result<(), String> {
    fn descendants(pid: u32, output: &mut Vec<u32>) {
        let Ok(result) = Command::new("pgrep")
            .args(["-P", &pid.to_string()])
            .output()
        else {
            return;
        };
        for line in String::from_utf8_lossy(&result.stdout).lines() {
            if let Ok(child) = line.trim().parse::<u32>() {
                descendants(child, output);
                output.push(child);
            }
        }
    }

    let mut targets = Vec::new();
    descendants(pid, &mut targets);
    targets.push(pid);
    let mut failed = Vec::new();
    for target in targets {
        match Command::new("kill")
            .args(["-KILL", &target.to_string()])
            .status()
        {
            Ok(status) if status.success() => {}
            Ok(status) => failed.push(format!("{target}:{status}")),
            Err(err) => failed.push(format!("{target}:{err}")),
        }
    }
    if failed.is_empty() {
        Ok(())
    } else {
        Err(format!("kill failures: {}", failed.join(", ")))
    }
}

/// Requests a graceful shutdown from the desktop-only backend endpoint.
///
/// The endpoint sets uvicorn's `should_exit`, letting the sidecar run its
/// normal lifespan shutdown instead of being force-killed.
async fn request_graceful_shutdown(port: u16, shutdown_token: &str) -> Result<(), String> {
    let url = format!("http://127.0.0.1:{port}{DESKTOP_SHUTDOWN_PATH}");
    let client = reqwest::Client::builder()
        .timeout(GRACEFUL_SHUTDOWN_TIMEOUT)
        .build()
        .map_err(|err| format!("failed to create shutdown HTTP client: {err}"))?;

    let response = client
        .post(url)
        .header(DESKTOP_SHUTDOWN_TOKEN_HEADER, shutdown_token)
        .send()
        .await
        .map_err(|err| format!("shutdown endpoint request failed: {err}"))?;
    let status = response.status();
    if !status.is_success() {
        return Err(format!("shutdown endpoint returned HTTP {status}"));
    }

    Ok(())
}

async fn wait_for_termination(
    mut terminated: watch::Receiver<bool>,
    timeout: Duration,
) -> Result<(), String> {
    if *terminated.borrow() {
        return Ok(());
    }
    match tokio::time::timeout(timeout, terminated.changed()).await {
        Ok(Ok(())) if *terminated.borrow() => Ok(()),
        Ok(Ok(())) => Err("backend termination signal was not set".into()),
        Ok(Err(_)) => Err("backend process ended without a termination event".into()),
        Err(_) => Err(format!(
            "timed out waiting {} seconds for backend graceful shutdown",
            timeout.as_secs()
        )),
    }
}

#[tauri::command]
pub(crate) fn backend_port(state: tauri::State<'_, BackendState>) -> Option<u16> {
    state.port()
}

/// Returns startup failures consumed by the bootstrap gate.
///
/// This is not a long-lived backend health signal after the WebView navigates to
/// the backend-hosted console.
#[tauri::command]
pub(crate) fn backend_startup_error(state: tauri::State<'_, BackendState>) -> Option<String> {
    state.error()
}

/// Stops the current sidecar, starts a fresh one, and returns its API port.
#[tauri::command]
pub(crate) async fn restart_backend(app: tauri::AppHandle) -> Result<(), String> {
    stop_and_wait(&app).await?;
    start(&app);

    let state = app.state::<BackendState>();
    match state.error() {
        Some(err) => Err(err),
        None => Ok(()),
    }
}

/// Installs backend-related plugins and starts the sidecar during app setup.
pub(crate) fn setup(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    app.handle().plugin(
        tauri_plugin_log::Builder::default()
            .clear_targets()
            .targets([
                Target::new(TargetKind::Stdout),
                Target::new(TargetKind::LogDir {
                    file_name: Some("qwenpaw-desktop".into()),
                }),
            ])
            .level(desktop_log_level())
            .build(),
    )?;

    if let Err(err) = crate::computer_use_runtime::prepare(app.handle()) {
        log::warn!("[computer-use] control endpoint unavailable: {err}");
    }

    start(app.handle());
    Ok(())
}

/// Gracefully stops the current sidecar and waits for its process to exit.
pub(crate) async fn stop_and_wait(app: &tauri::AppHandle) -> Result<(), String> {
    app.state::<BackendState>().stop_and_wait().await
}

fn desktop_log_level() -> log::LevelFilter {
    if std::env::var("QWENPAW_DESKTOP_DEBUG").is_ok_and(|value| {
        matches!(
            value.to_ascii_lowercase().as_str(),
            "1" | "true" | "yes" | "on"
        )
    }) {
        log::LevelFilter::Debug
    } else {
        log::LevelFilter::Info
    }
}

/// Starts the sidecar and records startup failures for the frontend retry UI.
fn start(app: &tauri::AppHandle) {
    start_internal(app);
}

fn start_internal(app: &tauri::AppHandle) {
    let state = app.state::<BackendState>();
    let generation = state.next_generation();
    state.clear_startup_state();
    let shutdown_token = Uuid::new_v4().to_string();

    let (command, launcher) = match command::create(app) {
        Ok((cmd, used)) => (cmd, used),
        Err(message) => {
            state.set_error(message);
            return;
        }
    };
    let command = command
        .env("PYTHONUTF8", "1")
        .env("PYTHONIOENCODING", "utf-8")
        .env("PYTHONUNBUFFERED", "1")
        .env("PYTHONFAULTHANDLER", "1")
        .env("QWENPAW_DESKTOP_APP", "1")
        .env(DESKTOP_SHUTDOWN_TOKEN_ENV, &shutdown_token);

    log::info!(
        "[backend] starting generation={generation} packaged={}",
        launcher.packaged
    );

    let (rx, child) = match command.spawn() {
        Ok(child) => child,
        Err(err) => {
            if launcher.has_managed_components() {
                match rollback_managed_launcher(launcher) {
                    Ok(()) => {
                        log::error!(
                            "[backend] managed Python stack failed to spawn: {err}; rolled back to bundled backend"
                        );
                        start_internal(app);
                        return;
                    }
                    Err(rollback_err) => {
                        state.set_error(format!(
                            "failed to spawn managed backend: {err}; rollback failed: {rollback_err}"
                        ));
                        return;
                    }
                }
            }
            state.set_error(format!("failed to spawn backend: {err}"));
            return;
        }
    };

    let child_pid = child.pid();
    log::info!(
        "[backend] spawned generation={generation} pid={child_pid} packaged={}",
        launcher.packaged
    );
    let (terminated_sender, terminated_receiver) = watch::channel(false);
    state.with_inner(|inner| {
        inner.child = Some(child);
        inner.shutdown_token = Some(shutdown_token);
        inner.terminated = Some(terminated_receiver);
        inner.launcher = Some(launcher);
        inner.stopping = false;
    });
    events::watch(app.clone(), generation, rx, terminated_sender);
    watch_slow_startup(app.clone(), generation);
}

fn watch_slow_startup(app: tauri::AppHandle, generation: u64) {
    tauri::async_runtime::spawn(async move {
        tokio::time::sleep(BACKEND_STARTUP_SLOW_WARNING).await;
        if app
            .state::<BackendState>()
            .is_starting_if_current(generation)
        {
            log::warn!(
                "[backend:{generation}] frozen backend has not reported ready after {} seconds; continuing to wait",
                BACKEND_STARTUP_SLOW_WARNING.as_secs()
            );
        }
        tokio::time::sleep(BACKEND_STARTUP_TIMEOUT.saturating_sub(BACKEND_STARTUP_SLOW_WARNING))
            .await;
        let state = app.state::<BackendState>();
        let Some(launcher) = state.launcher_if_starting(generation) else {
            return;
        };
        log::error!(
            "[backend:{generation}] backend did not report ready within {} seconds",
            BACKEND_STARTUP_TIMEOUT.as_secs()
        );
        if let Err(err) = state.stop_and_wait().await {
            state.set_error(format!(
                "backend startup timed out and could not be stopped: {err}"
            ));
            return;
        }
        if launcher.has_managed_components() {
            match rollback_managed_launcher(launcher) {
                Ok(()) => {
                    log::error!(
                        "[backend:{generation}] rolled back timed-out managed Python stack"
                    );
                    start_internal(&app);
                }
                Err(err) => state.set_error(format!(
                    "backend startup timed out; managed rollback failed: {err}"
                )),
            }
        } else {
            state.set_error(format!(
                "bundled backend did not report ready within {} seconds",
                BACKEND_STARTUP_TIMEOUT.as_secs()
            ));
        }
    });
}

fn rollback_managed_launcher(launcher: command::LauncherSelection) -> Result<(), String> {
    let selected = [
        ("backend", launcher.managed_backend),
        ("python-packages", launcher.managed_python_packages),
        ("python-runtime", launcher.managed_python_runtime),
    ];
    let mut failures = Vec::new();
    for (component, managed) in selected {
        if !managed {
            continue;
        }
        if let Err(err) = crate::runtime_layout::disable_managed_component(component) {
            failures.push(format!("{component}: {err}"));
        }
    }
    if failures.is_empty() {
        Ok(())
    } else {
        Err(failures.join("; "))
    }
}
