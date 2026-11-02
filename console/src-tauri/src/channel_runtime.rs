//! Trusted readable channel support paths for the packaged Python backend.

#[cfg(any(not(debug_assertions), test))]
use std::path::Path;
/// Apply support paths from the same captured backend used to build the command.
/// Every daemon restart reconstructs these overrides, including frozen fallback.
#[cfg(any(not(debug_assertions), test))]
pub(crate) fn apply_backend_environment(
    command: &mut std::process::Command,
    resource_dir: &Path,
    backend: Option<&Path>,
) {
    for key in [
        "QWENPAW_CHANNEL_RUNTIME_MANIFEST",
        "QWENPAW_CHANNEL_SUPPORT_ROOT",
        "QWENPAW_CHANNEL_DEPENDENCY_PATHS",
        "QWENPAW_CHANNEL_RESOURCE_DIR",
    ] {
        command.env_remove(key);
    }
    for (key, value) in environment_for_backend(resource_dir, backend) {
        command.env(key, value);
    }
}

#[cfg(test)]
pub(crate) fn selected_backend_environment(resource_dir: &Path) -> Vec<(String, String)> {
    let backend = crate::runtime_layout::resolve_component(resource_dir, "backend")
        .filter(|component| component.kind.as_deref() == Some("python"));
    environment_for_backend(
        resource_dir,
        backend.as_ref().map(|component| component.root.as_path()),
    )
}

#[cfg(any(not(debug_assertions), test))]
fn environment_for_backend(resource_dir: &Path, backend: Option<&Path>) -> Vec<(String, String)> {
    // Support and its host-version manifest are owned by the selected signed
    // backend component, so activation and rollback select the same code set.
    // The frozen fallback retains its original fixed resource layout.
    let (root, site_name) = match backend {
        Some(backend) => {
            // The compact layout keeps complete dependency paths within the
            // Windows portable archive limit. Once present, a broken compact
            // layer must fail validation rather than select stale support.
            let compact = backend.join("c");
            let compact_present = compact.symlink_metadata().map_or_else(
                |error| error.kind() != std::io::ErrorKind::NotFound,
                |_| true,
            );
            if compact_present {
                (compact, "s")
            } else {
                (backend.join("channel-runtime"), "site")
            }
        }
        None => (resource_dir.join("binaries/channel-runtime"), "site"),
    };
    let site = root.join(site_name).to_string_lossy().to_string();
    let mut environment = vec![
        (
            "QWENPAW_CHANNEL_RUNTIME_MANIFEST".into(),
            root.join("runtime.json").to_string_lossy().to_string(),
        ),
        ("QWENPAW_CHANNEL_SUPPORT_ROOT".into(), site.clone()),
        (
            "QWENPAW_CHANNEL_DEPENDENCY_PATHS".into(),
            serde_json::json!([site]).to_string(),
        ),
    ];
    if let Some(backend) = backend {
        environment.push((
            "QWENPAW_CHANNEL_RESOURCE_DIR".into(),
            backend.to_string_lossy().to_string(),
        ));
    }
    environment
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    #[test]
    fn layered_support_follows_selected_backend_outside_installer_resources() {
        let temp = tempfile::tempdir().unwrap();
        let resources = temp.path().join("Resources");
        let backend = temp
            .path()
            .join("working/components/managed/backend/2.3.0b4");
        let environment: HashMap<_, _> = environment_for_backend(&resources, Some(&backend))
            .into_iter()
            .collect();
        assert_eq!(
            environment["QWENPAW_CHANNEL_RESOURCE_DIR"],
            backend.to_string_lossy()
        );
        assert_eq!(
            environment["QWENPAW_CHANNEL_RUNTIME_MANIFEST"],
            backend
                .join("channel-runtime")
                .join("runtime.json")
                .to_string_lossy()
        );
        assert_eq!(
            environment["QWENPAW_CHANNEL_SUPPORT_ROOT"],
            backend
                .join("channel-runtime")
                .join("site")
                .to_string_lossy()
        );
        assert!(!environment.contains_key("QWENPAW_TAURI_RESOURCE_DIR"));
    }

    #[test]
    fn frozen_support_keeps_original_resource_root_contract() {
        let temp = tempfile::tempdir().unwrap();
        let environment: HashMap<_, _> = environment_for_backend(temp.path(), None)
            .into_iter()
            .collect();
        assert!(!environment.contains_key("QWENPAW_CHANNEL_RESOURCE_DIR"));
        assert_eq!(
            environment["QWENPAW_CHANNEL_RUNTIME_MANIFEST"],
            temp.path()
                .join("binaries/channel-runtime")
                .join("runtime.json")
                .to_string_lossy()
        );
    }

    #[test]
    fn compact_support_prefers_the_same_selected_backend_over_legacy_files() {
        let temp = tempfile::tempdir().unwrap();
        let backend = temp.path().join("managed/backend/2.3.0b3");
        std::fs::create_dir_all(backend.join("c/s")).unwrap();
        std::fs::create_dir_all(backend.join("channel-runtime/site")).unwrap();
        for directory in ["c", "channel-runtime"] {
            std::fs::write(backend.join(directory).join("runtime.json"), "{}").unwrap();
        }
        let environment: HashMap<_, _> =
            environment_for_backend(&temp.path().join("Resources"), Some(&backend))
                .into_iter()
                .collect();
        assert_eq!(
            environment["QWENPAW_CHANNEL_RUNTIME_MANIFEST"],
            backend.join("c").join("runtime.json").to_string_lossy()
        );
        assert_eq!(
            environment["QWENPAW_CHANNEL_SUPPORT_ROOT"],
            backend.join("c").join("s").to_string_lossy()
        );
        assert_eq!(
            serde_json::from_str::<Vec<String>>(&environment["QWENPAW_CHANNEL_DEPENDENCY_PATHS"])
                .unwrap(),
            vec![backend.join("c").join("s").to_string_lossy().into_owned()]
        );
        assert_eq!(
            environment["QWENPAW_CHANNEL_RESOURCE_DIR"],
            backend.to_string_lossy()
        );
    }

    #[test]
    fn compact_support_missing_manifest_does_not_fall_back_to_legacy_files() {
        let temp = tempfile::tempdir().unwrap();
        let backend = temp.path().join("managed/backend/2.3.0b3");
        std::fs::create_dir_all(backend.join("c/s")).unwrap();
        std::fs::create_dir_all(backend.join("channel-runtime/site")).unwrap();
        std::fs::write(backend.join("channel-runtime/runtime.json"), "{}").unwrap();
        let environment: HashMap<_, _> = environment_for_backend(temp.path(), Some(&backend))
            .into_iter()
            .collect();
        let manifest = std::path::PathBuf::from(&environment["QWENPAW_CHANNEL_RUNTIME_MANIFEST"]);
        assert_eq!(manifest, backend.join("c").join("runtime.json"));
        assert!(!manifest.exists());
        assert_eq!(
            environment["QWENPAW_CHANNEL_SUPPORT_ROOT"],
            backend.join("c").join("s").to_string_lossy()
        );
    }
}
