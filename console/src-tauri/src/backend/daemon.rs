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
        let receipt = directory.join(format!("startup-{}.json", uuid::Uuid::new_v4()));
        command.env("QWENPAW_STARTUP_RECEIPT", &receipt);
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
        let (status, _ready, restart_requested) =
            watch_backend_child(&mut child, &receipt, started, || {
                startup_outcome(&receipt).unwrap_or_else(|| {
                    backend_startup_state(&directory, previous_instance.as_deref())
                })
            })?;
        let _ = std::fs::remove_file(&receipt);
        if stop_request.exists() {
            return Ok(());
        }
        if restart_requested {
            failures = 0;
            continue;
        }
        #[cfg(not(debug_assertions))]
        if !_ready && selection.has_managed_components() {
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

fn watch_backend_child(
    child: &mut std::process::Child,
    receipt: &std::path::Path,
    started: Instant,
    mut probe: impl FnMut() -> StartupOutcome,
) -> Result<(std::process::ExitStatus, bool, bool), String> {
    let mut ready = false;
    let mut restart_requested = false;
    let mut initializing = false;
    let status = loop {
        let outcome = probe();
        ready |= outcome == StartupOutcome::Ready;
        restart_requested |= outcome == StartupOutcome::Restart;
        initializing |= outcome == StartupOutcome::Starting;
        if !ready && outcome == StartupOutcome::Failed {
            terminate_owned_child(child.id())?;
            break child.wait().map_err(|err| err.to_string())?;
        }
        if ready {
            // Readiness is terminal for this launch. Once confirmed, only
            // process exit can trigger recovery; the OS wait avoids reopening
            // the same receipt (or legacy health socket) ten times a second.
            // Explicit shutdown still terminates the child through its API.
            break child.wait().map_err(|err| err.to_string())?;
        }
        if let Some(status) = child.try_wait().map_err(|err| err.to_string())? {
            break status;
        }
        let timeout = if initializing { 30 * 60 } else { 60 };
        if started.elapsed() >= Duration::from_secs(timeout) {
            // A live startup may prepare offline packages for several minutes.
            // Bound hung initialization, but do not confuse it with no endpoint.
            // Kill only this owned child before switching component roots.
            terminate_owned_child(child.id())?;
            break child.wait().map_err(|err| err.to_string())?;
        }
        std::thread::sleep(Duration::from_millis(100));
    };
    // A fast apply-and-restart may happen between startup polls or while the
    // ready process is in the OS wait. Its committed pointers must survive.
    restart_requested |= startup_outcome(receipt) == Some(StartupOutcome::Restart);
    Ok((status, ready, restart_requested))
}

fn published_instance(directory: &std::path::Path) -> Option<String> {
    let bytes = std::fs::read(directory.join("runtime.json")).ok()?;
    let value: serde_json::Value = serde_json::from_slice(&bytes).ok()?;
    value.get("instance")?.as_str().map(str::to_owned)
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum StartupOutcome {
    Unavailable,
    Starting,
    Ready,
    Failed,
    Restart,
}

fn startup_outcome(receipt: &std::path::Path) -> Option<StartupOutcome> {
    let bytes = std::fs::read(receipt).ok()?;
    let value: serde_json::Value = serde_json::from_slice(&bytes).ok()?;
    Some(match value.get("status")?.as_str()? {
        "starting" => StartupOutcome::Starting,
        "ready" => StartupOutcome::Ready,
        "failed" => StartupOutcome::Failed,
        "restart" => StartupOutcome::Restart,
        _ => return None,
    })
}

fn http_status(port: u16, path: &str) -> Option<u16> {
    use std::io::{Read, Write};
    let address = std::net::SocketAddr::from(([127, 0, 0, 1], port));
    let timeout = Duration::from_millis(250);
    let mut stream = std::net::TcpStream::connect_timeout(&address, timeout).ok()?;
    stream.set_read_timeout(Some(timeout)).ok()?;
    stream.set_write_timeout(Some(timeout)).ok()?;
    stream
        .write_all(
            format!("GET {path} HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n")
                .as_bytes(),
        )
        .ok()?;
    let mut status = [0u8; 12];
    stream.read_exact(&mut status).ok()?;
    if !status.starts_with(b"HTTP/1.1 ") && !status.starts_with(b"HTTP/1.0 ") {
        return None;
    }
    std::str::from_utf8(&status[9..12]).ok()?.parse().ok()
}

fn backend_startup_state(directory: &std::path::Path, previous: Option<&str>) -> StartupOutcome {
    let probe = || -> Option<StartupOutcome> {
        let bytes = std::fs::read(directory.join("runtime.json")).ok()?;
        let value: serde_json::Value = serde_json::from_slice(&bytes).ok()?;
        if value.get("instance")?.as_str()? == previous.unwrap_or_default() {
            return None;
        }
        let port = u16::try_from(value.get("port")?.as_u64()?).ok()?;
        Some(match http_status(port, "/api/healthz")? {
            200 => StartupOutcome::Ready,
            503 => StartupOutcome::Starting,
            500 => StartupOutcome::Failed,
            // Old runtimes without readiness support retain their original
            // version probe. Never fall back when a readiness probe says no.
            404 if http_status(port, "/api/version") == Some(200) => StartupOutcome::Ready,
            _ => StartupOutcome::Unavailable,
        })
    };
    probe().unwrap_or(StartupOutcome::Unavailable)
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

    // Run this test executable as a real backend substitute. It never opens
    // the user's application or configuration and exits on a private signal.
    #[test]
    fn supervised_process_fixture() {
        let Some(root) = std::env::var_os("QWENPAW_DAEMON_TEST_ROOT") else {
            return;
        };
        let root = PathBuf::from(root);
        let mode = std::env::var("QWENPAW_DAEMON_TEST_MODE").unwrap();
        if mode != "unavailable" {
            let status = if mode == "ready_crash" {
                "ready"
            } else {
                &mode
            };
            std::fs::write(
                root.join("receipt.json"),
                serde_json::json!({"status": status}).to_string(),
            )
            .unwrap();
        }
        std::fs::write(root.join("alive"), "1").unwrap();
        let started = Instant::now();
        while !root.join("release").exists() {
            assert!(started.elapsed() < Duration::from_secs(10));
            std::thread::sleep(Duration::from_millis(5));
        }
        if mode == "ready_crash" {
            std::process::exit(7);
        }
        std::fs::write(
            root.join("receipt.json"),
            serde_json::json!({"status": "restart"}).to_string(),
        )
        .unwrap();
    }

    struct OwnedFixtureChild(std::process::Child);

    impl Drop for OwnedFixtureChild {
        fn drop(&mut self) {
            // Assertion failures must not leave an isolated test process alive.
            let _ = self.0.kill();
            let _ = self.0.wait();
        }
    }

    fn fixture_child(root: &std::path::Path, mode: &str) -> OwnedFixtureChild {
        let mut command = Command::new(std::env::current_exe().unwrap());
        command
            .args([
                "--exact",
                "backend::daemon::tests::supervised_process_fixture",
                "--nocapture",
            ])
            .env("QWENPAW_DAEMON_TEST_ROOT", root)
            .env("QWENPAW_DAEMON_TEST_MODE", mode)
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::null());
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
        let mut child = OwnedFixtureChild(command.spawn().unwrap());
        let deadline = Instant::now();
        while !root.join("alive").exists() {
            assert!(child.0.try_wait().unwrap().is_none());
            assert!(deadline.elapsed() < Duration::from_secs(10));
            std::thread::sleep(Duration::from_millis(5));
        }
        child
    }

    #[test]
    fn ready_backend_waits_without_repolling_and_preserves_restart_receipt() {
        let root = tempfile::tempdir().unwrap();
        let mut child = fixture_child(root.path(), "ready");
        let receipt = root.path().join("receipt.json");
        let release = root.path().join("release");
        let releaser = std::thread::spawn(move || {
            std::thread::sleep(Duration::from_millis(650));
            let released = Instant::now();
            std::fs::write(release, "1").unwrap();
            released
        });
        let mut probes = 0usize;
        let started = Instant::now();
        let (status, ready, restart) = watch_backend_child(&mut child.0, &receipt, started, || {
            probes += 1;
            startup_outcome(&receipt).unwrap_or(StartupOutcome::Unavailable)
        })
        .unwrap();
        let observed_exit = Instant::now();
        let released = releaser.join().unwrap();
        assert!(status.success());
        assert!(ready);
        assert!(
            restart,
            "An update receipt written during wait must survive"
        );
        assert_eq!(probes, 1, "Readiness is terminal for startup probing");
        assert!(child.0.try_wait().unwrap().is_some());
        eprintln!(
            "native_wait_measurement: held_ms={} probes={} release_to_exit_ms={}",
            started.elapsed().as_millis(),
            probes,
            observed_exit.duration_since(released).as_millis(),
        );
    }

    #[test]
    fn failed_and_unavailable_startup_still_terminate_only_owned_child() {
        for (mode, elapsed_seconds) in [("failed", 0), ("unavailable", 61), ("starting", 1801)] {
            let root = tempfile::tempdir().unwrap();
            let mut child = fixture_child(root.path(), mode);
            let receipt = root.path().join("receipt.json");
            let started = Instant::now() - Duration::from_secs(elapsed_seconds);
            let (status, ready, restart) =
                watch_backend_child(&mut child.0, &receipt, started, || {
                    startup_outcome(&receipt).unwrap_or(StartupOutcome::Unavailable)
                })
                .unwrap();
            assert!(
                !status.success(),
                "A failed or timed-out child must be stopped"
            );
            assert!(!ready);
            assert!(!restart);
            assert!(child.0.try_wait().unwrap().is_some());
        }
    }

    #[test]
    fn ready_backend_crash_preserves_status_without_becoming_startup_failure() {
        let root = tempfile::tempdir().unwrap();
        let mut child = fixture_child(root.path(), "ready_crash");
        let receipt = root.path().join("receipt.json");
        let release = root.path().join("release");
        let (status, ready, restart) =
            watch_backend_child(&mut child.0, &receipt, Instant::now(), || {
                let outcome = startup_outcome(&receipt).unwrap_or(StartupOutcome::Unavailable);
                if outcome == StartupOutcome::Ready {
                    std::fs::write(&release, "1").unwrap();
                }
                outcome
            })
            .unwrap();
        assert_eq!(status.code(), Some(7));
        assert!(
            ready,
            "A later crash must not roll back a healthy component"
        );
        assert!(
            !restart,
            "An unrequested crash retains normal failure backoff"
        );
        assert!(child.0.try_wait().unwrap().is_some());
    }

    #[test]
    fn initializing_backend_keeps_extended_deadline_and_fast_restart_intent() {
        let root = tempfile::tempdir().unwrap();
        let mut child = fixture_child(root.path(), "starting");
        let receipt = root.path().join("receipt.json");
        let release = root.path().join("release");
        let mut probes = 0;
        let (status, ready, restart) = watch_backend_child(
            &mut child.0,
            &receipt,
            Instant::now() - Duration::from_secs(61),
            || {
                probes += 1;
                let outcome = startup_outcome(&receipt).unwrap_or(StartupOutcome::Unavailable);
                if outcome == StartupOutcome::Starting {
                    std::fs::write(&release, "1").unwrap();
                }
                outcome
            },
        )
        .unwrap();
        assert!(
            status.success(),
            "Starting receives the existing 30-minute budget"
        );
        assert!(!ready, "A requested restart is not core readiness");
        assert!(restart);
        assert!(probes >= 1);
        assert!(child.0.try_wait().unwrap().is_some());
    }

    #[test]
    fn already_exited_child_still_preserves_restart_between_polls() {
        let root = tempfile::tempdir().unwrap();
        let mut child = fixture_child(root.path(), "starting");
        let receipt = root.path().join("receipt.json");
        std::fs::write(root.path().join("release"), "1").unwrap();
        assert!(child.0.wait().unwrap().success());
        let (status, ready, restart) =
            watch_backend_child(&mut child.0, &receipt, Instant::now(), || {
                // A startup observation can be older than the process exit.
                StartupOutcome::Starting
            })
            .unwrap();
        assert!(status.success());
        assert!(!ready);
        assert!(restart, "Always reread this launch's receipt after exit");
    }

    #[test]
    fn published_record_requires_a_new_healthy_backend() {
        for (status, expected) in [
            ("200 OK", StartupOutcome::Ready),
            ("503 Unavailable", StartupOutcome::Starting),
            ("500 Error", StartupOutcome::Failed),
        ] {
            let root = tempfile::tempdir().unwrap();
            let listener = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
            let port = listener.local_addr().unwrap().port();
            std::fs::write(
                root.path().join("runtime.json"),
                serde_json::json!({"instance": "new", "port": port}).to_string(),
            )
            .unwrap();
            assert_eq!(
                backend_startup_state(root.path(), Some("new")),
                StartupOutcome::Unavailable
            );
            let server = std::thread::spawn(move || {
                let (mut socket, _) = listener.accept().unwrap();
                let mut request = [0u8; 256];
                socket.read(&mut request).unwrap();
                socket
                    .write_all(format!("HTTP/1.1 {status}\r\nContent-Length: 0\r\n\r\n").as_bytes())
                    .unwrap();
            });
            assert_eq!(backend_startup_state(root.path(), Some("old")), expected);
            server.join().unwrap();
        }
    }

    #[test]
    fn missing_or_corrupt_discovery_does_not_confirm_startup() {
        let root = tempfile::tempdir().unwrap();
        assert_eq!(
            backend_startup_state(root.path(), None),
            StartupOutcome::Unavailable
        );
        std::fs::write(root.path().join("runtime.json"), b"incomplete").unwrap();
        assert_eq!(
            backend_startup_state(root.path(), None),
            StartupOutcome::Unavailable
        );
    }

    #[test]
    fn launch_receipt_distinguishes_slow_failure_and_requested_restart() {
        let root = tempfile::tempdir().unwrap();
        let receipt = root.path().join("this-launch.json");
        assert_eq!(startup_outcome(&receipt), None);
        for (status, expected) in [
            ("starting", StartupOutcome::Starting),
            ("ready", StartupOutcome::Ready),
            ("failed", StartupOutcome::Failed),
            ("restart", StartupOutcome::Restart),
        ] {
            std::fs::write(&receipt, serde_json::json!({"status": status}).to_string()).unwrap();
            assert_eq!(startup_outcome(&receipt), Some(expected));
        }
        assert_eq!(startup_outcome(&root.path().join("next-launch.json")), None);
    }

    #[test]
    fn only_absent_legacy_health_endpoint_falls_back_to_version() {
        let root = tempfile::tempdir().unwrap();
        let listener = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
        let port = listener.local_addr().unwrap().port();
        std::fs::write(
            root.path().join("runtime.json"),
            serde_json::json!({"instance": "old-runtime", "port": port}).to_string(),
        )
        .unwrap();
        let server = std::thread::spawn(move || {
            for (path, status) in [
                ("/api/healthz", "404 Not Found"),
                ("/api/version", "200 OK"),
            ] {
                let (mut socket, _) = listener.accept().unwrap();
                let mut request = [0u8; 256];
                let size = socket.read(&mut request).unwrap();
                assert!(
                    String::from_utf8_lossy(&request[..size]).starts_with(&format!("GET {path} "))
                );
                socket
                    .write_all(format!("HTTP/1.1 {status}\r\nContent-Length: 0\r\n\r\n").as_bytes())
                    .unwrap();
            }
        });
        assert_eq!(
            backend_startup_state(root.path(), None),
            StartupOutcome::Ready
        );
        server.join().unwrap();
    }
}
