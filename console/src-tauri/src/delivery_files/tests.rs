use super::*;

fn request(name: &str, bytes: &[u8]) -> StageDeliveryFileRequest {
    StageDeliveryFileRequest {
        file_name: name.into(),
        content_base64: STANDARD.encode(bytes),
    }
}

#[test]
fn staging_retains_exact_archive_bytes_and_reuses_only_intact_copies() {
    let mut store = DeliveryStore::default();
    let original = b"well,rate\nA,120\n";
    let first = store.stage(request("产量.csv", original)).unwrap();
    assert_eq!(std::fs::read(&first.path).unwrap(), original);
    assert!(std::fs::metadata(&first.path)
        .unwrap()
        .permissions()
        .readonly());
    assert_eq!(
        store.resolve(&first.token).unwrap(),
        PathBuf::from(&first.path)
    );
    let second = store.stage(request("产量.csv", original)).unwrap();
    assert_eq!(first.token, second.token);
    let different = store
        .stage(request("产量.csv", b"well,rate\nA,125\n"))
        .unwrap();
    assert_ne!(first.token, different.token);
    assert_eq!(std::fs::read(&first.path).unwrap(), original);
    let directory = Path::new(&first.path).parent().unwrap().to_path_buf();
    drop(store);
    assert!(
        !directory.exists(),
        "normal shutdown removes the private readonly copy"
    );
}

#[test]
fn missing_or_modified_copies_fail_instead_of_falling_back_to_workspace() {
    let mut store = DeliveryStore::default();
    let original = store.stage(request("report.txt", b"archive")).unwrap();
    let file = store.files.get_mut(&original.token).unwrap();
    let mut permissions = std::fs::metadata(&file.path).unwrap().permissions();
    #[cfg(windows)]
    permissions.set_readonly(false);
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        permissions.set_mode(0o600);
    }
    std::fs::set_permissions(&file.path, permissions).unwrap();
    std::fs::write(&file.path, b"changed").unwrap();
    assert!(store
        .resolve(&original.token)
        .unwrap_err()
        .contains("modified externally"));
    let replacement = store.stage(request("report.txt", b"archive")).unwrap();
    assert_ne!(replacement.token, original.token);
    std::fs::remove_file(&original.path).unwrap();
    assert!(store
        .resolve(&original.token)
        .unwrap_err()
        .contains("unavailable"));
    assert_eq!(std::fs::read(&replacement.path).unwrap(), b"archive");
}

#[test]
fn tokens_are_session_scoped_and_paths_cannot_be_used_as_tokens() {
    let mut first = DeliveryStore::default();
    let staged = first.stage(request("report.txt", b"archive")).unwrap();
    let second = DeliveryStore::default();
    assert!(second.resolve(&staged.token).is_err());
    assert!(first.resolve(&staged.path).is_err());
    assert!(first.resolve("../report.txt").is_err());
}

#[test]
fn rejects_path_traversal_reserved_names_and_unlaunchable_extensions() {
    for name in [
        "../report.txt",
        "..\\report.txt",
        "C:\\report.txt",
        "report.txt:payload",
        "CON.txt",
        "lpt1.txt",
        "report.txt ",
        "report\0.txt",
        ".",
        "",
    ] {
        assert!(validate_file_name(name).is_err(), "accepted {name:?}");
    }
    for name in [
        "run.EXE",
        "run.cmd",
        "run.ps1",
        "run.py",
        "shortcut.lnk",
        "web.url",
        "install.desktop",
    ] {
        assert!(file_extension(name).is_err(), "allowed launch {name}");
    }
    assert_eq!(file_extension("分析报告.DOCX").unwrap(), ".docx");
    assert_eq!(file_extension("产量.HTML").unwrap(), ".html");
}

#[test]
fn invalid_content_and_session_limits_fail_without_evicting_open_files() {
    let mut store = DeliveryStore::default();
    assert!(store
        .stage(StageDeliveryFileRequest {
            file_name: "report.txt".into(),
            content_base64: "not base64!".into()
        })
        .is_err());
    assert!(store.files.is_empty());
    let retained = store.stage(request("report.txt", b"retained")).unwrap();
    store.bytes = MAX_SESSION_BYTES;
    assert!(store
        .stage(request("second.txt", b"new"))
        .unwrap_err()
        .contains("cache is full"));
    assert_eq!(
        std::fs::read(store.resolve(&retained.token).unwrap()).unwrap(),
        b"retained"
    );
    assert!(store
        .stage(StageDeliveryFileRequest {
            file_name: "large.txt".into(),
            content_base64: "A".repeat(MAX_FILE_BYTES.div_ceil(3) * 4 + 1)
        })
        .unwrap_err()
        .contains("32 MiB"));
}

#[cfg(any(windows, unix))]
#[test]
fn replaced_staging_directory_is_rejected_even_with_identical_bytes() {
    let mut store = DeliveryStore::default();
    let staged = store.stage(request("report.txt", b"archive")).unwrap();
    let root = Path::new(&staged.path).parent().unwrap();
    let displaced = tempfile::tempdir().unwrap();
    let held = displaced.path().join("original");
    let outside = tempfile::tempdir().unwrap();
    std::fs::write(outside.path().join("report.txt"), b"archive").unwrap();
    std::fs::rename(root, &held).unwrap();
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        let output = std::process::Command::new("cmd")
            .args(["/d", "/c", "mklink", "/J"])
            .arg(root)
            .arg(outside.path())
            .creation_flags(0x0800_0000)
            .output()
            .unwrap();
        assert!(
            output.status.success(),
            "junction fixture failed: {}",
            String::from_utf8_lossy(&output.stderr)
        );
    }
    #[cfg(unix)]
    std::os::unix::fs::symlink(outside.path(), root).unwrap();
    let rejected = store.resolve(&staged.token).unwrap_err();
    assert!(rejected.contains("directory"), "{rejected}");
    #[cfg(windows)]
    std::fs::remove_dir(root).unwrap();
    #[cfg(unix)]
    std::fs::remove_file(root).unwrap();
    std::fs::rename(&held, root).unwrap();
    assert_eq!(
        std::fs::read(store.resolve(&staged.token).unwrap()).unwrap(),
        b"archive"
    );
    assert_eq!(
        std::fs::read(outside.path().join("report.txt")).unwrap(),
        b"archive"
    );
}
