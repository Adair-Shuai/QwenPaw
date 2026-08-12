//! Backend command construction for development and packaged builds.

use std::path::{Path, PathBuf};
#[cfg(debug_assertions)]
use std::process::{Command as StdCommand, Stdio};

#[cfg(not(debug_assertions))]
use tauri::Manager;
use tauri_plugin_shell::{process::Command, ShellExt};

/// Which backend executable to launch on Windows.
///
/// On macOS/Linux the frozen PyInstaller executable is always used and Python
/// fallback is disabled. On Windows the mode is resolved from the
/// `QWENPAW_BACKEND_LAUNCHER`
/// environment variable (default: `auto`).
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub(super) enum LauncherMode {
    /// Prefer the frozen PyInstaller executable; fall back to `python.exe -m`
    /// when the frozen binary is missing or crashes before ready.
    Auto,
    /// Force the frozen PyInstaller executable (`qwenpaw-backend.exe`).
    Frozen,
    /// Force the bundled standalone CPython (`python.exe -m qwenpaw.tauri.entry`).
    Python,
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub(super) struct LauncherSelection {
    pub(super) requested: LauncherMode,
    pub(super) actual: LauncherMode,
}

impl LauncherSelection {
    fn new(requested: LauncherMode, actual: LauncherMode) -> Self {
        Self { requested, actual }
    }

    pub(super) fn allows_python_fallback(self) -> bool {
        allows_python_fallback_impl(
            cfg!(windows),
            self.requested,
            self.actual,
        )
    }
}

fn allows_python_fallback_impl(
    is_windows: bool,
    requested: LauncherMode,
    actual: LauncherMode,
) -> bool {
    is_windows && requested == LauncherMode::Auto && actual == LauncherMode::Frozen
}

/// Reads `QWENPAW_BACKEND_LAUNCHER` to determine the launch mode.
#[cfg(not(debug_assertions))]
fn resolve_launcher_mode() -> LauncherMode {
    match std::env::var("QWENPAW_BACKEND_LAUNCHER")
        .unwrap_or_default()
        .to_ascii_lowercase()
        .as_str()
    {
        "frozen" => LauncherMode::Frozen,
        "python" => LauncherMode::Python,
        _ => LauncherMode::Auto,
    }
}

/// Builds the command used to start the Python backend sidecar.
#[cfg(debug_assertions)]
pub(super) fn create(app: &tauri::AppHandle) -> Result<(Command, LauncherSelection), String> {
    let repo_root = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..");
    let source_path = repo_root.join("src");
    let command = if command_exists("uv") {
        log::info!(
            "[backend] dev command: uv run python -m qwenpaw.tauri.entry cwd={}",
            repo_root.display(),
        );
        app.shell()
            .command("uv")
            .args(["run", "python", "-m", "qwenpaw.tauri.entry"])
            .current_dir(repo_root)
        .env("PYTHONPATH", source_path.display().to_string())
        // [PROXY-BYPASS] Ensure loopback traffic never goes through proxy.
        // See: src/qwenpaw/docs/proxy-bypass-design.md
        .env("NO_PROXY", "localhost,127.0.0.1,::1,0.0.0.0")
    } else {
        let (python, prefix_args) = python_command(&repo_root);
        let mut args = prefix_args;
        args.extend(["-m", "qwenpaw.tauri.entry"]);
        log::info!(
            "[backend] dev command: {} {} cwd={}",
            python,
            args.join(" "),
            repo_root.display(),
        );
        app.shell()
            .command(python)
            .args(args)
            .current_dir(repo_root)
        .env("PYTHONPATH", source_path.display().to_string())
        // [PROXY-BYPASS] Ensure loopback traffic never goes through proxy.
        // See: src/qwenpaw/docs/proxy-bypass-design.md
        .env("NO_PROXY", "localhost,127.0.0.1,::1,0.0.0.0")
    };
    Ok((
        apply_contributed_environment(app, command),
        LauncherSelection::new(LauncherMode::Python, LauncherMode::Python),
    ))
}

/// Force a specific launcher mode (debug always uses Python).
#[cfg(debug_assertions)]
pub(super) fn create_with_mode(
    app: &tauri::AppHandle,
    _mode: LauncherMode,
) -> Result<(Command, LauncherSelection), String> {
    create(app)
}

/// Builds the command used to start the packaged Python backend sidecar.
///
/// Returns the command along with the [`LauncherMode`] that was actually
/// used.  In `Auto` mode (default) the frozen PyInstaller executable is
/// preferred; if it is missing the bundled standalone CPython is used
/// instead.  Use [`create_with_mode`] to force a specific launcher.
#[cfg(not(debug_assertions))]
pub(super) fn create(app: &tauri::AppHandle) -> Result<(Command, LauncherSelection), String> {
    let mode = resolve_launcher_mode();
    create_with_mode(app, mode)
}

/// Builds a backend command forcing a specific launcher mode.
#[cfg(not(debug_assertions))]
pub(super) fn create_with_mode(
    app: &tauri::AppHandle,
    mode: LauncherMode,
) -> Result<(Command, LauncherSelection), String> {
    let bundled_python = packaged_python_runtime(app);
    let resource_dir = app
        .path()
        .resource_dir()
        .map_err(|err| format!("failed to resolve resource directory: {err}"))?;
    let (backend, backend_args, used_mode) = resolve_backend(app, &bundled_python, mode)?;
    let backend_dir = backend
        .parent()
        .ok_or_else(|| format!("backend executable has no parent: {}", backend.display()))?
        .to_path_buf();
    log::info!(
        "[backend] packaged command: {} {} cwd={}",
        backend.display(),
        backend_args.join(" "),
        backend_dir.display(),
    );
    // Resolve the bundled officecli directory (if present) so it can be
    // prepended to PATH — this makes `shutil.which("officecli")` find
    // the bundled binary inside the desktop app.
    let officecli_dir = packaged_officecli_dir(app);
    if let Some(ref dir) = officecli_dir {
        log::info!("[backend] bundled officecli: {}", dir.display());
    } else {
        log::warn!("[backend] bundled officecli not found");
    }
    let mut command = app
        .shell()
        .command(backend)
        .args(backend_args)
        .current_dir(&backend_dir)
        .env(
            path_env_key(),
            packaged_path(app, &backend_dir, officecli_dir.as_deref())?,
        )
        .env(
            "QWENPAW_TAURI_RESOURCE_DIR",
            resource_dir.to_string_lossy().to_string(),
        )
        // [PROXY-BYPASS] Ensure loopback traffic never goes through proxy.
        // See: src/qwenpaw/docs/proxy-bypass-design.md
        .env("NO_PROXY", "localhost,127.0.0.1,::1,0.0.0.0");
    if cfg!(windows) {
        // Mark this as a desktop backend regardless of frozen vs python mode.
        // PYTHONNOUSERSITE keeps the python.exe path reproducible; harmless
        // for the frozen executable which has its own import system.
        command = command
            .env("QWENPAW_DESKTOP_APP", "1")
            .env("PYTHONNOUSERSITE", "1");
    }
    // Default PyPI mirror for runtime pip installs (plugin deps, optional
    // packages).  Mirrors the build-script defaults (build_pyinstaller.sh /
    // build_pyinstaller.ps1).  Only set when the user has not already
    // configured their own mirror or proxy.
    if std::env::var_os("PIP_INDEX_URL").is_none() {
        command = command.env(
            "PIP_INDEX_URL",
            "https://pypi.tuna.tsinghua.edu.cn/simple/",
        );
    }
    if std::env::var_os("PIP_EXTRA_INDEX_URL").is_none() {
        command = command.env("PIP_EXTRA_INDEX_URL", "https://pypi.org/simple/");
    }

    let mut command = apply_contributed_environment(app, command);
    // A complete Playwright Chromium payload exceeds the practical NSIS
    // installer mapping limit on Windows. The sidecar downloads the exact
    // driver-matched revision into the user's QwenPaw data directory instead.
    if cfg!(windows) {
        command = command.env("QWENPAW_DESKTOP_MANAGED_PLAYWRIGHT", "1");
    }
    // Bundled standalone Python used by the backend to install third-party
    // plugin dependencies (sys.executable is the frozen backend, not Python).
    if let Some(python) = packaged_python_runtime(app) {
        log::info!("[backend] bundled python runtime: {}", python.display());
        command = command.env(
            "QWENPAW_DESKTOP_PY_RUNTIME",
            python.to_string_lossy().to_string(),
        );
    } else {
        log::warn!(
            "[backend] bundled python runtime not found; plugin dependency \
             installation will be unavailable"
        );
    }
    if let Some(node_runtime) = packaged_node_runtime(app) {
        log::info!("[backend] bundled node runtime: {}", node_runtime.display());
        command = command.env(
            "QWENPAW_DESKTOP_NODE_RUNTIME",
            node_runtime.to_string_lossy().to_string(),
        );
    } else {
        log::warn!("[backend] bundled node runtime not found");
    }
    // Also expose the officecli directory as an env var so the Python
    // backend can locate the binary directly (not just via PATH).
    if let Some(ref dir) = officecli_dir {
        command = command.env(
            "QWENPAW_DESKTOP_OFFICECLI_DIR",
            dir.to_string_lossy().to_string(),
        );
    }
    // Expose the bundled Java runtime root so the Python backend can
    // launch the NeqSim MCP Server as a stdio subprocess.  When the JRE
    // or JAR is absent (non-desktop or stripped build), the backend
    // simply skips NeqSim auto-registration.
    if let Some(java_home) = packaged_java_runtime(app) {
        log::info!("[backend] bundled java runtime: {}", java_home.display());
        command = command.env(
            "QWENPAW_DESKTOP_JAVA_HOME",
            java_home.to_string_lossy().to_string(),
        );
    } else {
        log::debug!("[backend] bundled java runtime not found");
    }
    if let Some(jar) = packaged_neqsim_jar(app) {
        log::info!("[backend] bundled neqsim jar: {}", jar.display());
        command = command.env(
            "QWENPAW_DESKTOP_NEQSIM_JAR",
            jar.to_string_lossy().to_string(),
        );
    } else {
        log::debug!("[backend] bundled neqsim jar not found");
    }
    Ok((command, LauncherSelection::new(mode, used_mode)))
}

/// Resolves the backend executable, arguments, and actual mode used.
///
/// On non-Windows platforms the frozen executable is always returned. Python
/// fallback is intentionally not available there, so a frozen startup failure
/// is surfaced to the UI instead of being retried recursively.
/// On Windows the behaviour depends on `mode`:
/// * `Frozen` — frozen executable only (error if missing).
/// * `Python` — `python.exe -m` only.
/// * `Auto`   — frozen first, fall back to `python.exe -m` if missing.
#[cfg(not(debug_assertions))]
fn resolve_backend(
    app: &tauri::AppHandle,
    bundled_python: &Option<PathBuf>,
    mode: LauncherMode,
) -> Result<(PathBuf, Vec<&'static str>, LauncherMode), String> {
    if !cfg!(windows) {
        // macOS/Linux: always use the frozen executable.
        return Ok((packaged_backend_executable(app)?, Vec::new(), LauncherMode::Frozen));
    }
    match mode {
        LauncherMode::Frozen => {
            let exe = packaged_backend_executable(app)?;
            Ok((exe, Vec::new(), LauncherMode::Frozen))
        }
        LauncherMode::Python => {
            let python = bundled_python
                .clone()
                .ok_or_else(|| "bundled Python runtime not found; reinstall QwenPaw".to_string())?;
            Ok((python, vec!["-m", "qwenpaw.tauri.entry"], LauncherMode::Python))
        }
        LauncherMode::Auto => {
            // Prefer the frozen PyInstaller backend; fall back to python.exe -m
            // when the frozen executable is missing (e.g. partial install).
            match packaged_backend_executable(app) {
                Ok(exe) => Ok((exe, Vec::new(), LauncherMode::Frozen)),
                Err(reason) => {
                    log::warn!(
                        "[backend] frozen backend unavailable ({}); falling back to python.exe",
                        reason
                    );
                    let python = bundled_python.clone().ok_or_else(|| {
                        "bundled Python runtime not found; reinstall QwenPaw".to_string()
                    })?;
                    Ok((python, vec!["-m", "qwenpaw.tauri.entry"], LauncherMode::Python))
                }
            }
        }
    }
}

#[cfg(not(debug_assertions))]
fn packaged_python_runtime(app: &tauri::AppHandle) -> Option<PathBuf> {
    let base = app
        .path()
        .resource_dir()
        .ok()?
        .join("binaries")
        .join("python-runtime")
        .join("python");
    let candidates = if cfg!(windows) {
        vec![base.join("python.exe")]
    } else {
        vec![
            base.join("bin").join("python3"),
            base.join("bin").join("python"),
        ]
    };
    candidates.into_iter().find(|path| path.is_file())
}

#[cfg(not(debug_assertions))]
fn packaged_java_runtime(app: &tauri::AppHandle) -> Option<PathBuf> {
    // The JRE root is <resource_dir>/binaries/java-runtime.  The Python
    // side (_bundled_java_exe in neqsim.py) handles both the flat layout
    // (bin/java) and the macOS bundle layout (Contents/Home/bin/java),
    // so we always return the root directory when a java binary can be
    // found in either location.
    let root = app
        .path()
        .resource_dir()
        .ok()?
        .join("binaries")
        .join("java-runtime");
    // Flat layout: <root>/bin/java (Windows, Linux, flattened macOS)
    let java = if cfg!(windows) {
        root.join("bin").join("java.exe")
    } else {
        root.join("bin").join("java")
    };
    if java.is_file() {
        return Some(root);
    }
    // macOS bundle layout: <root>/Contents/Home/bin/java
    #[cfg(target_os = "macos")]
    {
        let mac_candidate = root.join("Contents").join("Home").join("bin").join("java");
        if mac_candidate.is_file() {
            return Some(root);
        }
    }
    None
}

#[cfg(not(debug_assertions))]
fn packaged_neqsim_jar(app: &tauri::AppHandle) -> Option<PathBuf> {
    let jar = app
        .path()
        .resource_dir()
        .ok()?
        .join("binaries")
        .join("neqsim")
        .join("neqsim-mcp-server.jar");
    jar.is_file().then_some(jar)
}

/// Add the variables desktop features contribute to the backend's environment.
///
/// The set comes from [`crate::runtime_env`], so this stays independent of which
/// feature needs what.
fn apply_contributed_environment(app: &tauri::AppHandle, mut command: Command) -> Command {
    for (key, value) in crate::runtime_env::collect(app) {
        command = command.env(key, value);
    }
    command
}

#[cfg(not(debug_assertions))]
fn packaged_node_runtime(app: &tauri::AppHandle) -> Option<PathBuf> {
    let root = app
        .path()
        .resource_dir()
        .ok()?
        .join("binaries")
        .join("node-runtime");
    let node = if cfg!(windows) {
        root.join("node.exe")
    } else {
        root.join("bin").join("node")
    };
    node.is_file().then_some(root)
}

#[cfg(not(debug_assertions))]
fn packaged_officecli_dir(app: &tauri::AppHandle) -> Option<PathBuf> {
    let dir = app
        .path()
        .resource_dir()
        .ok()?
        .join("binaries")
        .join("officecli");
    let binary = if cfg!(windows) {
        dir.join("officecli.exe")
    } else {
        dir.join("officecli")
    };
    binary.is_file().then_some(dir)
}

#[cfg(not(debug_assertions))]
fn packaged_backend_executable(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let executable_name = if cfg!(windows) {
        "qwenpaw-backend.exe"
    } else {
        "qwenpaw-backend"
    };
    let path = app
        .path()
        .resource_dir()
        .map_err(|err| format!("failed to resolve resource directory: {err}"))?
        .join("binaries")
        .join("qwenpaw-backend")
        .join(executable_name);

    if path.is_file() {
        Ok(path)
    } else {
        Err(format!(
            "backend executable not found at {}",
            path.display()
        ))
    }
}

#[cfg(not(debug_assertions))]
fn packaged_path(
    app: &tauri::AppHandle,
    backend_dir: &Path,
    officecli_dir: Option<&Path>,
) -> Result<String, String> {
    let mut paths = Vec::new();
    if cfg!(windows) {
        if let Some(python) = packaged_python_runtime(app) {
            if let Some(dir) = python.parent() {
                paths.push(dir.to_path_buf());
                paths.push(dir.join("Scripts"));
            }
        }
    }
    if let Some(oc_dir) = officecli_dir {
        paths.push(oc_dir.to_path_buf());
    }
    paths.push(backend_dir.to_path_buf());
    if let Some(existing) = std::env::var_os(path_env_key()) {
        paths.extend(std::env::split_paths(&existing));
    }
    std::env::join_paths(paths)
        .map_err(|err| format!("failed to join packaged PATH entries: {err}"))?
        .into_string()
        .map_err(|_| "packaged PATH contains non-Unicode data".to_string())
}

#[cfg(all(not(debug_assertions), windows))]
fn path_env_key() -> &'static str {
    "Path"
}

#[cfg(all(not(debug_assertions), not(windows)))]
fn path_env_key() -> &'static str {
    "PATH"
}

#[cfg(debug_assertions)]
fn command_exists(command: &str) -> bool {
    StdCommand::new(command)
        .arg("--version")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .is_ok_and(|status| status.success())
}

#[cfg(debug_assertions)]
fn local_python(repo_root: &Path) -> Option<String> {
    let candidates = if cfg!(windows) {
        vec![
            repo_root.join(".venv/Scripts/python.exe"),
            repo_root.join("venv/Scripts/python.exe"),
        ]
    } else {
        vec![
            repo_root.join(".venv/bin/python"),
            repo_root.join("venv/bin/python"),
        ]
    };

    candidates
        .into_iter()
        .find(|path| path.is_file())
        .map(|path| path.display().to_string())
}

#[cfg(debug_assertions)]
fn python_command(repo_root: &Path) -> (String, Vec<&'static str>) {
    if let Some(local) = local_python(repo_root) {
        return (local, vec![]);
    }
    #[cfg(windows)]
    {
        if command_exists("py") {
            return ("py".to_string(), vec!["-3"]);
        }
    }
    if command_exists("python3") {
        ("python3".to_string(), vec![])
    } else {
        ("python".to_string(), vec![])
    }
}

#[cfg(test)]
mod tests {
    use super::{allows_python_fallback_impl, LauncherMode};

    #[test]
    fn fallback_requires_windows_auto_frozen_selection() {
        assert!(allows_python_fallback_impl(
            true,
            LauncherMode::Auto,
            LauncherMode::Frozen
        ));
        assert!(!allows_python_fallback_impl(
            true,
            LauncherMode::Frozen,
            LauncherMode::Frozen
        ));
        assert!(!allows_python_fallback_impl(
            true,
            LauncherMode::Auto,
            LauncherMode::Python
        ));
        assert!(!allows_python_fallback_impl(
            false,
            LauncherMode::Auto,
            LauncherMode::Frozen
        ));
    }
}
