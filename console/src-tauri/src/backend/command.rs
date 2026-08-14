//! Backend command construction for development and packaged builds.

use std::path::{Path, PathBuf};
#[cfg(debug_assertions)]
use std::process::{Command as StdCommand, Stdio};

#[cfg(not(debug_assertions))]
use tauri::Manager;
use tauri_plugin_shell::{process::Command, ShellExt};

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub(super) struct LauncherSelection {
    pub(super) packaged: bool,
    pub(super) managed_backend: bool,
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
        LauncherSelection {
            packaged: false,
            managed_backend: false,
        },
    ))
}

/// Builds the command used to start the packaged Python backend sidecar.
///
/// b5/b6 launch the frozen PyInstaller executable. b7 can atomically select a
/// Python backend layer plus independent interpreter/dependency layers through
/// `state/active.json`. An invalid or incomplete selection falls back to the
/// frozen executable so a failed migration cannot brick startup.
#[cfg(not(debug_assertions))]
pub(super) fn create(app: &tauri::AppHandle) -> Result<(Command, LauncherSelection), String> {
    let resource_dir = app
        .path()
        .resource_dir()
        .map_err(|err| format!("failed to resolve resource directory: {err}"))?;
    let launch = packaged_backend_launch(app)?;
    let backend = launch.executable;
    let backend_args = launch.args;
    let backend_dir = launch.working_directory;
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
    if !launch.python_paths.is_empty() {
        let python_path = std::env::join_paths(&launch.python_paths)
            .map_err(|err| format!("failed to join packaged PYTHONPATH entries: {err}"))?
            .into_string()
            .map_err(|_| "packaged PYTHONPATH contains non-Unicode data".to_string())?;
        command = command.env("PYTHONPATH", python_path);
    }
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
        command = command.env("PIP_INDEX_URL", "https://pypi.tuna.tsinghua.edu.cn/simple/");
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
    Ok((
        command,
        LauncherSelection {
            packaged: true,
            managed_backend: launch.managed_backend,
        },
    ))
}

#[cfg(not(debug_assertions))]
fn packaged_python_runtime(app: &tauri::AppHandle) -> Option<PathBuf> {
    let resource_dir = app.path().resource_dir().ok()?;
    let base = crate::runtime_layout::resolve_component(&resource_dir, "python-runtime")
        .map(|selected| {
            log::info!(
                "[backend] active python runtime version={} root={}",
                selected.version,
                selected.root.display()
            );
            selected.root
        })
        .unwrap_or_else(|| resource_dir.join("binaries").join("python-runtime"))
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
    let resource_dir = app.path().resource_dir().ok()?;
    let root = crate::runtime_layout::resolve_component(&resource_dir, "java-runtime")
        .map(|selected| selected.root)
        .unwrap_or_else(|| resource_dir.join("binaries").join("java-runtime"));
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
    let resource_dir = app.path().resource_dir().ok()?;
    let root = crate::runtime_layout::resolve_component(&resource_dir, "neqsim")
        .map(|selected| selected.root)
        .unwrap_or_else(|| resource_dir.join("binaries").join("neqsim"));
    let jar = root.join("neqsim-mcp-server.jar");
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
    let resource_dir = app.path().resource_dir().ok()?;
    let root = crate::runtime_layout::resolve_component(&resource_dir, "node-runtime")
        .map(|selected| selected.root)
        .unwrap_or_else(|| resource_dir.join("binaries").join("node-runtime"));
    let node = if cfg!(windows) {
        root.join("node.exe")
    } else {
        root.join("bin").join("node")
    };
    node.is_file().then_some(root)
}

#[cfg(not(debug_assertions))]
fn packaged_officecli_dir(app: &tauri::AppHandle) -> Option<PathBuf> {
    let resource_dir = app.path().resource_dir().ok()?;
    let dir = crate::runtime_layout::resolve_component(&resource_dir, "officecli")
        .map(|selected| selected.root)
        .unwrap_or_else(|| resource_dir.join("binaries").join("officecli"));
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
    let resource_dir = app
        .path()
        .resource_dir()
        .map_err(|err| format!("failed to resolve resource directory: {err}"))?;
    let root = crate::runtime_layout::resolve_component(&resource_dir, "backend")
        .filter(|selected| selected.kind.as_deref() != Some("python"))
        .map(|selected| {
            log::info!(
                "[backend] active backend version={} kind={} root={}",
                selected.version,
                selected.kind.as_deref().unwrap_or("frozen"),
                selected.root.display()
            );
            selected.root
        })
        .unwrap_or_else(|| resource_dir.join("binaries").join("qwenpaw-backend"));
    let path = root.join(executable_name);

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
struct PackagedBackendLaunch {
    executable: PathBuf,
    args: Vec<String>,
    working_directory: PathBuf,
    python_paths: Vec<PathBuf>,
    managed_backend: bool,
}

#[cfg(not(debug_assertions))]
fn packaged_backend_launch(app: &tauri::AppHandle) -> Result<PackagedBackendLaunch, String> {
    let resource_dir = app
        .path()
        .resource_dir()
        .map_err(|err| format!("failed to resolve resource directory: {err}"))?;
    if let Some(backend) = crate::runtime_layout::resolve_component(&resource_dir, "backend") {
        if backend.kind.as_deref() == Some("python") {
            let package = backend.root.join("qwenpaw");
            if package.is_dir() {
                let python = packaged_python_runtime(app).ok_or_else(|| {
                    "active Python backend requires an active or bundled Python runtime".to_string()
                })?;
                let mut python_paths = vec![backend.root.clone()];
                if let Some(dependencies) =
                    crate::runtime_layout::resolve_component(&resource_dir, "python-packages")
                {
                    python_paths.push(dependencies.root);
                }
                log::info!(
                    "[backend] selected layered Python backend version={} root={}",
                    backend.version,
                    backend.root.display()
                );
                return Ok(PackagedBackendLaunch {
                    executable: python,
                    args: vec!["-m".to_string(), "qwenpaw.tauri.entry".to_string()],
                    working_directory: backend.root,
                    python_paths,
                    managed_backend: true,
                });
            }
            log::warn!(
                "[backend] active Python backend is incomplete at {}; falling back to frozen backend",
                backend.root.display()
            );
        }
    }
    let executable = packaged_backend_executable(app)?;
    let working_directory = executable
        .parent()
        .ok_or_else(|| format!("backend executable has no parent: {}", executable.display()))?
        .to_path_buf();
    Ok(PackagedBackendLaunch {
        executable,
        args: Vec::new(),
        working_directory,
        python_paths: Vec::new(),
        managed_backend: false,
    })
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
