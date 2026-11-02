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
    let root = backend
        .map(|backend| backend.join("channel-runtime"))
        .unwrap_or_else(|| resource_dir.join("binaries/channel-runtime"));
    let site = root.join("site").to_string_lossy().to_string();
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
}
