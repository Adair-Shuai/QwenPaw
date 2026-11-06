//! Reusable Python bytecode outside immutable desktop components.

use std::{fs, io, path::Path, path::PathBuf, process::Command};

/// `user_cache` must come from the platform's per-user cache resolver. Do not
/// accept an arbitrary working directory or an inherited Python cache setting.
pub(super) fn prepare(user_cache: &Path) -> io::Result<PathBuf> {
    if !user_cache.is_absolute() {
        return Err(io::Error::other("User cache path must be absolute"));
    }
    // OS cache roots may legitimately be relocated. Resolve that trusted root
    // once, then refuse redirection anywhere within our app-owned subtree.
    fs::create_dir_all(user_cache)?;
    let mut directory = user_cache.canonicalize()?;
    for name in ["qwenpaw", "python-bytecode-v1"] {
        directory.push(name);
        #[allow(unused_mut)]
        let mut builder = fs::DirBuilder::new();
        #[cfg(unix)]
        {
            use std::os::unix::fs::DirBuilderExt;
            builder.mode(0o700);
        }
        match builder.create(&directory) {
            Ok(()) => {}
            Err(error) if error.kind() == io::ErrorKind::AlreadyExists => {}
            Err(error) => return Err(error),
        }
        let metadata = fs::symlink_metadata(&directory)?;
        if !metadata.is_dir() || metadata.file_type().is_symlink() {
            return Err(io::Error::other("Python cache must be a real directory"));
        }
        #[cfg(windows)]
        {
            use std::os::windows::fs::MetadataExt;
            // Also reject NTFS junctions, which are not always symlinks.
            if metadata.file_attributes() & 0x400 != 0 {
                return Err(io::Error::other("Python cache cannot be a reparse point"));
            }
        }
        #[cfg(unix)]
        {
            use std::os::unix::fs::MetadataExt;
            extern "C" {
                fn geteuid() -> u32;
            }
            // Never reuse executable cache bytes another user could replace.
            if metadata.uid() != unsafe { geteuid() } || metadata.mode() & 0o077 != 0 {
                return Err(io::Error::other(
                    "Python cache must be private to the current user",
                ));
            }
        }
    }
    Ok(directory)
}

pub(super) fn apply(mut command: Command, cache: Option<&Path>) -> Command {
    match cache {
        Some(directory) => {
            command.env("PYTHONPYCACHEPREFIX", directory);
        }
        None => {
            // Cache failures must not make startup fail or let Python fall
            // back to writing __pycache__ inside signed component roots.
            command.env_remove("PYTHONPYCACHEPREFIX");
            command.env("PYTHONDONTWRITEBYTECODE", "1");
        }
    }
    command
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::{collections::BTreeMap, ffi::OsString, time::SystemTime};

    struct Fixture(PathBuf);

    impl Fixture {
        fn new() -> Self {
            let unique = SystemTime::now()
                .duration_since(SystemTime::UNIX_EPOCH)
                .unwrap()
                .as_nanos();
            let directory = std::env::temp_dir().join(format!(
                "qwenpaw-python-cache-test-{}-{unique}",
                std::process::id()
            ));
            fs::create_dir(&directory).unwrap();
            Self(directory)
        }
    }

    impl Drop for Fixture {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.0);
        }
    }

    fn python() -> OsString {
        if let Some(executable) = std::env::var_os("QWENPAW_TEST_PYTHON") {
            return executable;
        }
        if let Some(manifest) = option_env!("CARGO_MANIFEST_DIR") {
            let repo = Path::new(manifest).join("../..");
            let local = repo.join(if cfg!(windows) {
                ".venv/Scripts/python.exe"
            } else {
                ".venv/bin/python"
            });
            if local.is_file() {
                return local.into_os_string();
            }
        }
        if cfg!(windows) { "python" } else { "python3" }.into()
    }

    fn snapshot(root: &Path) -> BTreeMap<PathBuf, (Vec<u8>, SystemTime)> {
        let mut result = BTreeMap::new();
        for entry in fs::read_dir(root).unwrap() {
            let path = entry.unwrap().path();
            if path.is_dir() {
                result.extend(snapshot(&path));
            } else {
                result.insert(
                    path.clone(),
                    (
                        fs::read(&path).unwrap(),
                        path.metadata().unwrap().modified().unwrap(),
                    ),
                );
            }
        }
        result
    }

    fn import_command(source: &Path) -> Command {
        let mut command = Command::new(python());
        command
            .args(["-c", "import sample; assert sample.ANSWER == 42"])
            .env("PYTHONPATH", source)
            .env_remove("PYTHONDONTWRITEBYTECODE")
            .current_dir(source);
        command
    }

    fn source_fixture(fixture: &Fixture) -> PathBuf {
        let source = fixture.0.join("signed-layer");
        fs::create_dir(&source).unwrap();
        fs::write(source.join("sample.py"), "ANSWER = 6 * 7\n").unwrap();
        source
    }

    #[test]
    fn real_import_preserves_component_bytes_and_reuses_cache() {
        let fixture = Fixture::new();
        let source = source_fixture(&fixture);
        let before = snapshot(&source);
        let cache = prepare(&fixture.0.join("user-cache")).unwrap();
        let mut command = import_command(&source);
        command.env("PYTHONPYCACHEPREFIX", &source);
        let first = apply(command, Some(&cache)).output().unwrap();
        assert!(
            first.status.success(),
            "{}",
            String::from_utf8_lossy(&first.stderr)
        );
        let compiled = snapshot(&cache);
        assert!(compiled
            .keys()
            .any(|path| path.to_string_lossy().contains("sample.cpython-")));
        let second = apply(import_command(&source), Some(&cache))
            .output()
            .unwrap();
        assert!(
            second.status.success(),
            "{}",
            String::from_utf8_lossy(&second.stderr)
        );
        assert_eq!(before, snapshot(&source));
        assert_eq!(
            compiled,
            snapshot(&cache),
            "A second import must reuse the cached bytecode"
        );
        assert_eq!(cache, prepare(&fixture.0.join("user-cache")).unwrap());
    }

    #[test]
    fn cache_failure_disables_writes_and_removes_ambient_prefix() {
        let fixture = Fixture::new();
        let source = source_fixture(&fixture);
        let before = snapshot(&source);
        let mut command = import_command(&source);
        command.env("PYTHONPYCACHEPREFIX", &source);
        let output = apply(command, None).output().unwrap();
        assert!(
            output.status.success(),
            "{}",
            String::from_utf8_lossy(&output.stderr)
        );
        assert_eq!(before, snapshot(&source));
    }

    #[test]
    fn child_python_inherits_cache_without_changing_signed_layer() {
        let fixture = Fixture::new();
        let source = source_fixture(&fixture);
        let before = snapshot(&source);
        let cache = prepare(&fixture.0.join("user-cache")).unwrap();
        let mut command = Command::new(python());
        command
            .args([
                "-c",
                "import subprocess, sys; subprocess.run([sys.executable, '-c', 'import sample; assert sample.ANSWER == 42'], check=True)",
            ])
            .env("PYTHONPATH", &source)
            .env_remove("PYTHONDONTWRITEBYTECODE")
            .current_dir(&source);
        let output = apply(command, Some(&cache)).output().unwrap();
        assert!(
            output.status.success(),
            "{}",
            String::from_utf8_lossy(&output.stderr)
        );
        assert_eq!(before, snapshot(&source));
        assert!(snapshot(&cache)
            .keys()
            .any(|path| path.to_string_lossy().contains("sample.cpython-")));
    }

    #[test]
    fn cache_rejects_relative_roots_and_non_directories() {
        assert!(prepare(Path::new("relative-cache")).is_err());
        let fixture = Fixture::new();
        fs::write(fixture.0.join("qwenpaw"), "not a directory").unwrap();
        assert!(prepare(&fixture.0).is_err());
    }

    #[cfg(windows)]
    #[test]
    fn cache_rejects_ntfs_junctions() {
        let fixture = Fixture::new();
        let other = fixture.0.join("other-cache");
        fs::create_dir(&other).unwrap();
        let link = fixture.0.join("qwenpaw");
        let output = Command::new("cmd")
            .args(["/D", "/C", "mklink", "/J"])
            .arg(&link)
            .arg(&other)
            .output()
            .unwrap();
        assert!(
            output.status.success(),
            "{}",
            String::from_utf8_lossy(&output.stderr)
        );
        assert!(prepare(&fixture.0).is_err());
        fs::remove_dir(link).unwrap();
        assert!(snapshot(&other).is_empty());
    }

    #[cfg(unix)]
    #[test]
    fn cache_rejects_symlinks_and_shared_permissions() {
        use std::os::unix::fs::{symlink, PermissionsExt};
        let fixture = Fixture::new();
        let other = fixture.0.join("other-cache");
        fs::create_dir(&other).unwrap();
        let link = fixture.0.join("qwenpaw");
        symlink(&other, &link).unwrap();
        assert!(prepare(&fixture.0).is_err());
        fs::remove_file(&link).unwrap();
        fs::create_dir(&link).unwrap();
        fs::set_permissions(&link, fs::Permissions::from_mode(0o755)).unwrap();
        assert!(prepare(&fixture.0).is_err());
    }
}
