//! Versioned desktop runtime layout selection.
//!
//! b5/b6 place every runtime below `<resource_dir>/binaries`.  b7 can install
//! independently versioned components and atomically switch `state/active.json`.
//! Every lookup remains optional so an old installation keeps using its
//! bundled paths until the migration has passed its health checks.

use std::collections::HashMap;
use std::path::{Component, Path, PathBuf};

use serde::Deserialize;
use serde_json::Value;

#[cfg(windows)]
fn replace_file(source: &Path, destination: &Path) -> Result<(), String> {
    use std::os::windows::ffi::OsStrExt;
    use windows::core::PCWSTR;
    use windows::Win32::Storage::FileSystem::{
        MoveFileExW, MOVEFILE_REPLACE_EXISTING, MOVEFILE_WRITE_THROUGH,
    };

    let source_wide = source
        .as_os_str()
        .encode_wide()
        .chain(std::iter::once(0))
        .collect::<Vec<_>>();
    let destination_wide = destination
        .as_os_str()
        .encode_wide()
        .chain(std::iter::once(0))
        .collect::<Vec<_>>();
    unsafe {
        MoveFileExW(
            PCWSTR(source_wide.as_ptr()),
            PCWSTR(destination_wide.as_ptr()),
            MOVEFILE_REPLACE_EXISTING | MOVEFILE_WRITE_THROUGH,
        )
        .map_err(|err| format!("failed to replace active pointer: {err}"))
    }
}

#[cfg(not(windows))]
fn replace_file(source: &Path, destination: &Path) -> Result<(), String> {
    std::fs::rename(source, destination)
        .map_err(|err| format!("failed to replace active pointer: {err}"))
}

const ACTIVE_SCHEMA_VERSION: u32 = 1;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ActiveLayout {
    #[serde(alias = "schema_version")]
    schema_version: u32,
    components: HashMap<String, ActiveComponent>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ActiveComponent {
    version: String,
    path: String,
    #[serde(default)]
    kind: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct ResolvedComponent {
    pub(crate) version: String,
    pub(crate) root: PathBuf,
    pub(crate) kind: Option<String>,
}

pub(crate) fn active_manifest_path(resource_dir: &Path) -> PathBuf {
    let promoted = resource_dir.join("state").join("active.json");
    if promoted.is_file() {
        promoted
    } else {
        resource_dir
            .join("binaries")
            .join("state")
            .join("active.json")
    }
}

/// Resolve a component selected by the atomically committed desktop pointer.
///
/// Invalid, incomplete, linked, or out-of-root selections are ignored.  This
/// is deliberate: startup must fall back to the b5/b6 bundled layout instead
/// of bricking the application because a migration was interrupted.
pub(crate) fn resolve_component(resource_dir: &Path, id: &str) -> Option<ResolvedComponent> {
    if let Some(selected) = resolve_managed_component(id) {
        return Some(selected);
    }
    let manifest_path = active_manifest_path(resource_dir);
    let raw = std::fs::read_to_string(&manifest_path).ok()?;
    let layout: ActiveLayout = serde_json::from_str(&raw).ok()?;
    if layout.schema_version != ACTIVE_SCHEMA_VERSION {
        log::warn!(
            "[runtime] ignoring unsupported active layout schema={} path={}",
            layout.schema_version,
            manifest_path.display()
        );
        return None;
    }
    let selected = layout.components.get(id)?;
    if selected.version.trim().is_empty() {
        return None;
    }
    let relative = safe_relative_path(&selected.path)?;
    let candidate = resource_dir.join(relative);
    if !candidate.is_dir() || contains_link(resource_dir, &candidate) {
        return None;
    }
    Some(ResolvedComponent {
        version: selected.version.trim().to_string(),
        root: candidate,
        kind: selected
            .kind
            .as_deref()
            .map(str::trim)
            .filter(|value| !value.is_empty())
            .map(str::to_string),
    })
}

fn managed_components_root() -> Option<PathBuf> {
    let working_dir = std::env::var_os("QWENPAW_WORKING_DIR")
        .or_else(|| std::env::var_os("COPAW_WORKING_DIR"))
        .filter(|value| !value.is_empty())
        .map(PathBuf::from)
        .or_else(|| {
            let home = dirs::home_dir()?;
            let legacy = home.join(".copaw");
            Some(if legacy.exists() { legacy } else { home.join(".qwenpaw") })
        })?;
    let working_dir = if working_dir.is_absolute() {
        working_dir
    } else {
        std::env::current_dir().ok()?.join(working_dir)
    };
    Some(working_dir.join("components"))
}

fn resolve_managed_component(id: &str) -> Option<ResolvedComponent> {
    if id.is_empty()
        || id == "."
        || id == ".."
        || id.chars().any(|value| matches!(value, '/' | '\\' | '\0'))
    {
        return None;
    }
    let components_root = managed_components_root()?;
    let manifest_path = components_root.join("active.json");
    let raw = std::fs::read_to_string(&manifest_path).ok()?;
    let layout: ActiveLayout = serde_json::from_str(&raw).ok()?;
    if layout.schema_version != ACTIVE_SCHEMA_VERSION {
        return None;
    }
    let selected = layout.components.get(id)?;
    let version = selected.version.trim();
    if version.is_empty()
        || version == "."
        || version == ".."
        || version
            .chars()
            .any(|value| matches!(value, '/' | '\\' | '\0'))
    {
        return None;
    }
    let expected = components_root.join("managed").join(id).join(version);
    let recorded = PathBuf::from(selected.path.trim());
    if !recorded.is_absolute() || recorded != expected || !expected.is_dir() {
        return None;
    }
    if contains_link(&components_root, &expected) {
        return None;
    }
    Some(ResolvedComponent {
        version: version.to_string(),
        root: expected,
        kind: selected
            .kind
            .as_deref()
            .map(str::trim)
            .filter(|value| !value.is_empty())
            .map(str::to_string),
    })
}

/// Remove a failed managed selection so the next launch uses the bundled
/// last-known-good component. The versioned tree remains for diagnostics.
pub(crate) fn disable_managed_component(id: &str) -> Result<(), String> {
    if id.is_empty()
        || id == "."
        || id == ".."
        || id.chars().any(|value| matches!(value, '/' | '\\' | '\0'))
    {
        return Err("unsafe managed component id".to_string());
    }
    let components_root = managed_components_root()
        .ok_or_else(|| "failed to resolve managed components root".to_string())?;
    let manifest_path = components_root.join("active.json");
    if std::fs::symlink_metadata(&components_root)
        .is_ok_and(|metadata| metadata.file_type().is_symlink())
        || !manifest_path.is_file()
        || contains_link(&components_root, &manifest_path)
    {
        return Err("managed active pointer is missing or unsafe".to_string());
    }
    let raw = std::fs::read_to_string(&manifest_path)
        .map_err(|err| format!("failed to read managed active pointer: {err}"))?;
    let mut payload: Value = serde_json::from_str(&raw)
        .map_err(|err| format!("invalid managed active pointer: {err}"))?;
    let components = payload
        .get_mut("components")
        .and_then(Value::as_object_mut)
        .ok_or_else(|| "managed active pointer has no components".to_string())?;
    let removed = components
        .remove(id)
        .ok_or_else(|| format!("managed component is not active: {id}"))?;
    let version = removed
        .get("version")
        .and_then(Value::as_str)
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .ok_or_else(|| "managed component version is invalid".to_string())?;
    if version == "."
        || version == ".."
        || version
            .chars()
            .any(|value| matches!(value, '/' | '\\' | '\0'))
    {
        return Err("managed component version is unsafe".to_string());
    }
    let marker = components_root
        .join("managed")
        .join(id)
        .join(format!(".{version}.activation.json"));
    let temporary = manifest_path.with_file_name(format!(
        ".active.json.{}.staging",
        std::process::id(),
    ));
    let encoded = serde_json::to_vec(&payload)
        .map_err(|err| format!("failed to encode managed active pointer: {err}"))?;
    std::fs::write(&temporary, encoded)
        .map_err(|err| format!("failed to stage managed active pointer: {err}"))?;
    replace_file(&temporary, &manifest_path)?;
    if marker.is_file() {
        let _ = std::fs::remove_file(marker);
    }
    Ok(())
}

fn safe_relative_path(value: &str) -> Option<PathBuf> {
    let path = Path::new(value.trim());
    if path.as_os_str().is_empty() || path.is_absolute() {
        return None;
    }
    let mut safe = PathBuf::new();
    for component in path.components() {
        match component {
            Component::Normal(part) => safe.push(part),
            _ => return None,
        }
    }
    (!safe.as_os_str().is_empty()).then_some(safe)
}

fn contains_link(root: &Path, candidate: &Path) -> bool {
    let Ok(relative) = candidate.strip_prefix(root) else {
        return true;
    };
    let mut current = root.to_path_buf();
    for part in relative.components() {
        let Component::Normal(part) = part else {
            return true;
        };
        current.push(part);
        match std::fs::symlink_metadata(&current) {
            Ok(metadata) if metadata.file_type().is_symlink() => return true,
            Ok(_) => {}
            Err(_) => return true,
        }
    }
    false
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Mutex;

    static ENV_LOCK: Mutex<()> = Mutex::new(());

    fn write_layout(root: &Path, json: &str) {
        std::fs::create_dir_all(root.join("state")).unwrap();
        std::fs::write(root.join("state/active.json"), json).unwrap();
    }

    #[test]
    fn managed_pointer_takes_precedence_and_is_confined_to_working_dir() {
        let _guard = ENV_LOCK.lock().unwrap();
        let temp = tempfile::tempdir().unwrap();
        let working = temp.path().join("working");
        let selected = working
            .join("components/managed/backend/2.1.1b7");
        std::fs::create_dir_all(&selected).unwrap();
        std::fs::create_dir_all(working.join("components")).unwrap();
        std::fs::write(
            working.join("components/active.json"),
            serde_json::json!({
                "schema_version": 1,
                "target": "windows-x86_64",
                "components": {
                    "backend": {
                        "version": "2.1.1b7",
                        "path": selected.to_string_lossy(),
                        "kind": "python"
                    }
                }
            })
            .to_string(),
        )
        .unwrap();
        let previous = std::env::var_os("QWENPAW_WORKING_DIR");
        std::env::set_var("QWENPAW_WORKING_DIR", &working);
        let resolved = resolve_component(temp.path(), "backend").unwrap();
        match previous {
            Some(value) => std::env::set_var("QWENPAW_WORKING_DIR", value),
            None => std::env::remove_var("QWENPAW_WORKING_DIR"),
        }
        assert_eq!(resolved.root, selected);
        assert_eq!(resolved.kind.as_deref(), Some("python"));
    }

    #[test]
    fn failed_managed_backend_is_disabled_without_touching_other_components() {
        let _guard = ENV_LOCK.lock().unwrap();
        let temp = tempfile::tempdir().unwrap();
        let working = temp.path().join("working");
        let components = working.join("components");
        let backend = components.join("managed/backend/2.1.1b7");
        std::fs::create_dir_all(&backend).unwrap();
        let marker = backend
            .parent()
            .unwrap()
            .join(".2.1.1b7.activation.json");
        std::fs::write(&marker, "{}").unwrap();
        std::fs::write(
            components.join("active.json"),
            serde_json::json!({
                "schema_version": 1,
                "target": "windows-x86_64",
                "components": {
                    "backend": {
                        "version": "2.1.1b7",
                        "path": backend.to_string_lossy(),
                        "kind": "python"
                    },
                    "node-runtime": {
                        "version": "22.0.0",
                        "path": components.join("managed/node-runtime/22.0.0").to_string_lossy()
                    }
                }
            })
            .to_string(),
        )
        .unwrap();
        let previous = std::env::var_os("QWENPAW_WORKING_DIR");
        std::env::set_var("QWENPAW_WORKING_DIR", &working);
        disable_managed_component("backend").unwrap();
        match previous {
            Some(value) => std::env::set_var("QWENPAW_WORKING_DIR", value),
            None => std::env::remove_var("QWENPAW_WORKING_DIR"),
        }
        let payload: Value = serde_json::from_str(
            &std::fs::read_to_string(components.join("active.json")).unwrap(),
        )
        .unwrap();
        assert!(payload["components"].get("backend").is_none());
        assert!(payload["components"].get("node-runtime").is_some());
        assert!(!marker.exists());
        assert!(backend.is_dir());
    }

    #[test]
    fn resolves_the_bundled_b7_manifest_before_installer_promotion() {
        let temp = tempfile::tempdir().unwrap();
        let root = temp.path();
        std::fs::create_dir_all(root.join("binaries/state")).unwrap();
        std::fs::create_dir_all(root.join("binaries/runtimes/node/22.17.0")).unwrap();
        std::fs::write(
            root.join("binaries/state/active.json"),
            r#"{
              "schemaVersion": 1,
              "components": {
                "node-runtime": {
                  "version": "22.17.0",
                  "path": "binaries/runtimes/node/22.17.0"
                }
              }
            }"#,
        )
        .unwrap();
        let selected = resolve_component(root, "node-runtime").unwrap();
        assert_eq!(selected.root, root.join("binaries/runtimes/node/22.17.0"));
    }

    #[test]
    fn resolves_a_versioned_component() {
        let temp = tempfile::tempdir().unwrap();
        let root = temp.path();
        std::fs::create_dir_all(root.join("runtimes/python/3.12.10")).unwrap();
        write_layout(
            root,
            r#"{
              "schemaVersion": 1,
              "components": {
                "python-runtime": {
                  "version": "3.12.10+20260623",
                  "path": "runtimes/python/3.12.10",
                  "kind": "runtime"
                }
              }
            }"#,
        );
        let selected = resolve_component(root, "python-runtime").unwrap();
        assert_eq!(selected.version, "3.12.10+20260623");
        assert_eq!(selected.root, root.join("runtimes/python/3.12.10"));
        assert_eq!(selected.kind.as_deref(), Some("runtime"));
    }

    #[test]
    fn rejects_paths_outside_the_install_root() {
        let temp = tempfile::tempdir().unwrap();
        let root = temp.path();
        write_layout(
            root,
            r#"{
              "schemaVersion": 1,
              "components": {
                "backend": {"version": "b7", "path": "../outside"}
              }
            }"#,
        );
        assert!(resolve_component(root, "backend").is_none());
    }

    #[test]
    fn ignores_unknown_schema_for_legacy_fallback() {
        let temp = tempfile::tempdir().unwrap();
        let root = temp.path();
        std::fs::create_dir_all(root.join("app/b7/backend")).unwrap();
        write_layout(
            root,
            r#"{
              "schemaVersion": 2,
              "components": {
                "backend": {"version": "b7", "path": "app/b7/backend"}
              }
            }"#,
        );
        assert!(resolve_component(root, "backend").is_none());
    }

    #[cfg(unix)]
    #[test]
    fn rejects_a_component_reached_through_a_symlink() {
        use std::os::unix::fs::symlink;

        let temp = tempfile::tempdir().unwrap();
        let outside = tempfile::tempdir().unwrap();
        let root = temp.path();
        std::fs::create_dir_all(root.join("runtimes")).unwrap();
        symlink(outside.path(), root.join("runtimes/python")).unwrap();
        write_layout(
            root,
            r#"{
              "schemaVersion": 1,
              "components": {
                "python-runtime": {"version": "3.12", "path": "runtimes/python"}
              }
            }"#,
        );
        assert!(resolve_component(root, "python-runtime").is_none());
    }
}
