//! Lightweight native supervisor; desktop windows are clients, never owners.

use fs2::FileExt;
use std::{
    fs::File,
    path::PathBuf,
    process::{Command, Stdio},
    time::{Duration, Instant},
};

pub(crate) fn run() -> Result<(), String> {
    let directory = PathBuf::from(
        std::env::var_os("QWENPAW_DESKTOP_DAEMON_DIR").ok_or("Missing daemon directory")?,
    );
    let mut arguments = std::env::args_os().skip(2);
    let program = arguments.next().ok_or("Missing backend executable")?;
    let arguments: Vec<_> = arguments.collect();
    let lock = File::options()
        .read(true)
        .write(true)
        .create(true)
        .truncate(false)
        .open(directory.join("daemon.lock"))
        .map_err(|err| err.to_string())?;
    match lock.try_lock_exclusive() {
        Ok(()) => {}
        Err(err) if err.raw_os_error() == fs2::lock_contended_error().raw_os_error() => {
            return Ok(())
        }
        Err(err) => return Err(err.to_string()),
    }
    let stop_request = directory.join("stop-request");
    if stop_request.exists() {
        std::fs::remove_file(&stop_request).map_err(|err| err.to_string())?;
    }
    let installation = PathBuf::from(
        std::env::var_os("QWENPAW_DESKTOP_INSTALLATION_DIR")
            .ok_or("Missing desktop installation directory")?,
    );
    let _registration =
        crate::updates::coordination::register(&installation, directory.clone(), true)?;
    #[cfg(not(debug_assertions))]
    {
        if let Some(path) = std::env::var_os("QWENPAW_DAEMON_BASE_PATH") {
            std::env::set_var("PATH", path);
        }
        match std::env::var_os("QWENPAW_DAEMON_BASE_PYTHONPATH").filter(|value| !value.is_empty()) {
            Some(path) => std::env::set_var("PYTHONPATH", path),
            None => std::env::remove_var("PYTHONPATH"),
        }
        for key in [
            "QWENPAW_DESKTOP_PY_RUNTIME",
            "QWENPAW_DESKTOP_NODE_RUNTIME",
            "QWENPAW_DESKTOP_OFFICECLI_DIR",
            "QWENPAW_DESKTOP_JAVA_HOME",
            "QWENPAW_DESKTOP_NEQSIM_JAR",
        ] {
            std::env::remove_var(key);
        }
    }
    let mut failures = 0u32;
    loop {
        while crate::updates::coordination::maintenance(&installation)? {
            if stop_request.exists() {
                return Ok(());
            }
            std::thread::sleep(Duration::from_millis(100));
        }
        let started = Instant::now();
        // Resolve active components again on every restart, including updates
        // and rollback. A daemon must never keep a stale executable/PYTHONPATH.
        #[cfg(not(debug_assertions))]
        let (mut command, selection) = super::command::create_packaged(&PathBuf::from(
            std::env::var_os("QWENPAW_TAURI_RESOURCE_DIR").ok_or("Missing desktop resources")?,
        ))?;
        #[cfg(debug_assertions)]
        let mut command = {
            let mut command = Command::new(&program);
            command.args(&arguments);
            command
        };
        command.stdin(Stdio::null());
        let previous_instance = published_instance(&directory);
        #[cfg(unix)]
        {
            use std::os::unix::process::CommandExt;
            command.process_group(0);
        }
        #[cfg(windows)]
        {
            use std::os::windows::process::CommandExt;
            command.creation_flags(0x08000000 | 0x00000200);
        }
        let mut child = match command.spawn() {
            Ok(child) => child,
            Err(error) => {
                #[cfg(not(debug_assertions))]
                if selection.has_managed_components() {
                    super::command::rollback_managed_launcher(selection)?;
                    eprintln!(
                        "[agent-host] managed launch failed; restored previous runtime: {error}"
                    );
                    continue;
                }
                return Err(error.to_string());
            }
        };
        let mut ready = false;
        let status = loop {
            ready |= backend_is_ready(&directory, previous_instance.as_deref());
            if let Some(status) = child.try_wait().map_err(|err| err.to_string())? {
                break status;
            }
            if !ready && started.elapsed() >= Duration::from_secs(60) {
                // Startup has not published an endpoint. Kill only this owned
                // child and its descendants before switching component roots.
                terminate_owned_child(child.id())?;
                break child.wait().map_err(|err| err.to_string())?;
            }
            std::thread::sleep(Duration::from_millis(100));
        };
        if stop_request.exists() {
            return Ok(());
        }
        #[cfg(not(debug_assertions))]
        if !ready && selection.has_managed_components() {
            super::command::rollback_managed_launcher(selection)?;
            eprintln!("[agent-host] managed startup failed; restored previous runtime");
            continue;
        }
        // Do not turn a broken installation into an endless restart loop.
        failures = if started.elapsed() >= Duration::from_secs(60) {
            1
        } else {
            failures + 1
        };
        if failures >= 5 {
            return Err(format!(
                "Backend repeatedly exited ({status}); automatic restart stopped"
            ));
        }
        eprintln!("[agent-host] backend exited ({status}); restarting, attempt {failures}");
        std::thread::sleep(Duration::from_secs(1 << (failures - 1)));
        if stop_request.exists() {
            return Ok(());
        }
    }
}

fn published_instance(directory: &std::path::Path) -> Option<String> {
    let bytes = std::fs::read(directory.join("runtime.json")).ok()?;
    let value: serde_json::Value = serde_json::from_slice(&bytes).ok()?;
    value.get("instance")?.as_str().map(str::to_owned)
}

fn backend_is_ready(directory: &std::path::Path, previous: Option<&str>) -> bool {
    use std::io::{Read, Write};
    let probe = || -> Option<bool> {
        let bytes = std::fs::read(directory.join("runtime.json")).ok()?;
        let value: serde_json::Value = serde_json::from_slice(&bytes).ok()?;
        if value.get("instance")?.as_str()? == previous.unwrap_or_default() {
            return Some(false);
        }
        let port = u16::try_from(value.get("port")?.as_u64()?).ok()?;
        let address = std::net::SocketAddr::from(([127, 0, 0, 1], port));
        let timeout = Duration::from_millis(250);
        let mut stream = std::net::TcpStream::connect_timeout(&address, timeout).ok()?;
        stream.set_read_timeout(Some(timeout)).ok()?;
        stream.set_write_timeout(Some(timeout)).ok()?;
        stream
            .write_all(b"GET /api/version HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n")
            .ok()?;
        let mut status = [0u8; 12];
        stream.read_exact(&mut status).ok()?;
        Some(status.starts_with(b"HTTP/1.1 200") || status.starts_with(b"HTTP/1.0 200"))
    };
    probe().unwrap_or(false)
}

fn terminate_owned_child(pid: u32) -> Result<(), String> {
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        let status = Command::new("taskkill")
            .args(["/PID", &pid.to_string(), "/T", "/F"])
            .creation_flags(0x08000000)
            .status()
            .map_err(|err| err.to_string())?;
        if !status.success() {
            return Err(format!("Cannot stop owned startup process {pid}: {status}"));
        }
    }
    #[cfg(unix)]
    {
        // Children are launched into their own process group above.
        if unsafe { libc::kill(-(pid as i32), libc::SIGKILL) } != 0 {
            return Err(std::io::Error::last_os_error().to_string());
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::{Read, Write};

    #[test]
    fn published_record_requires_a_new_healthy_backend() {
        for (status, expected) in [("200 OK", true), ("503 Unavailable", false)] {
            let root = tempfile::tempdir().unwrap();
            let listener = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
            let port = listener.local_addr().unwrap().port();
            std::fs::write(
                root.path().join("runtime.json"),
                serde_json::json!({"instance": "new", "port": port}).to_string(),
            )
            .unwrap();
            assert!(!backend_is_ready(root.path(), Some("new")));
            let server = std::thread::spawn(move || {
                let (mut socket, _) = listener.accept().unwrap();
                let mut request = [0u8; 256];
                socket.read(&mut request).unwrap();
                socket
                    .write_all(format!("HTTP/1.1 {status}\r\nContent-Length: 0\r\n\r\n").as_bytes())
                    .unwrap();
            });
            assert_eq!(backend_is_ready(root.path(), Some("old")), expected);
            server.join().unwrap();
        }
    }

    #[test]
    fn missing_or_corrupt_discovery_does_not_confirm_startup() {
        let root = tempfile::tempdir().unwrap();
        assert!(!backend_is_ready(root.path(), None));
        std::fs::write(root.path().join("runtime.json"), b"incomplete").unwrap();
        assert!(!backend_is_ready(root.path(), None));
    }
}
