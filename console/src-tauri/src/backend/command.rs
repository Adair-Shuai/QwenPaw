//! Backend command construction for development and packaged builds.

use std::path::{Path, PathBuf};
#[cfg(debug_assertions)]
use std::process::{Command as StdCommand, Stdio};

#[cfg(not(debug_assertions))]
use tauri::Manager;
use tauri_plugin_shell::{process::Command, ShellExt};

/// Builds the command used to start the Python backend sidecar.
#[cfg(debug_assertions)]
pub(super) fn create(app: &tauri::AppHandle) -> Result<Command, String> {
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
    Ok(command)
}

/// Builds the command used to start the packaged Python backend sidecar.
#[cfg(not(debug_assertions))]
pub(super) fn create(app: &tauri::AppHandle) -> Result<Command, String> {
    let bundled_python = packaged_python_runtime(app);
    let (backend, backend_args) = if cfg!(windows) {
        let python = bundled_python
            .clone()
            .ok_or_else(|| "bundled Python runtime not found; reinstall QwenPaw".to_string())?;
        (python, vec!["-m", "qwenpaw.tauri.entry"])
    } else {
        (packaged_backend_executable(app)?, Vec::new())
    };
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
        // [PROXY-BYPASS] Ensure loopback traffic never goes through proxy.
        // See: src/qwenpaw/docs/proxy-bypass-design.md
        .env("NO_PROXY", "localhost,127.0.0.1,::1,0.0.0.0");
    if cfg!(windows) {
        // The non-frozen Windows backend needs the explicit desktop marker.
        // Ignore user-site packages so execution is reproducible and always
        // prefers the dependencies shipped in the bundled interpreter.
        command = command
            .env("QWENPAW_DESKTOP_APP", "1")
            .env("PYTHONNOUSERSITE", "1");
    }
    // Bundled standalone Python is the Windows backend interpreter and is also
    // used to install third-party plugin dependencies on every platform.
    if let Some(python) = bundled_python {
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
    Ok(command)
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
        vec![base.join("bin").join("python3"), base.join("bin").join("python")]
    };
    candidates.into_iter().find(|path| path.is_file())
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
