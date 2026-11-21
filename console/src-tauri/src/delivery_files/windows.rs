//! Windows Shell associations. No command-line templates or registry writes.

use std::{
    mem::size_of,
    path::{Path, PathBuf},
    process::Command,
};

use base64::{engine::general_purpose::STANDARD, Engine};
use windows::core::{w, HSTRING, PCWSTR, PWSTR};
use windows::Win32::{
    Graphics::Gdi::{
        DeleteObject, GetDC, GetDIBits, GetObjectW, ReleaseDC, BITMAP, BITMAPINFO,
        BITMAPINFOHEADER, DIB_RGB_COLORS,
    },
    System::Com::{
        CoInitializeEx, CoTaskMemFree, CoUninitialize, IDataObject, COINIT_APARTMENTTHREADED,
    },
    UI::{
        Shell::{
            AssocQueryStringW, BHID_DataObject, IAssocHandler, IShellItem, SHAssocEnumHandlers,
            SHCreateItemFromParsingName, SHDefExtractIconW, SHOpenFolderAndSelectItems,
            SHParseDisplayName, ShellExecuteExW, ASSOCF_INIT_IGNOREUNKNOWN, ASSOCF_NOFIXUPS,
            ASSOCSTR, ASSOCSTR_DEFAULTICON, ASSOCSTR_EXECUTABLE, ASSOCSTR_FRIENDLYAPPNAME,
            ASSOCSTR_PROGID, ASSOC_FILTER_NONE, SEE_MASK_FLAG_NO_UI, SEE_MASK_NOASYNC,
            SHELLEXECUTEINFOW,
        },
        WindowsAndMessaging::{DestroyIcon, GetIconInfo, HICON, ICONINFO, SW_SHOWNORMAL},
    },
};

use super::{DeliveryApplication, DeliveryApplications};

const SYSTEM_DEFAULT: &str = "system-default";
type ScriptEditor = (
    &'static str,
    &'static str,
    Option<&'static str>,
    &'static str,
);
const SCRIPT_EDITORS: [ScriptEditor; 3] = [
    (
        "editor:vscode",
        "Visual Studio Code",
        Some("Microsoft VS Code"),
        "Code.exe",
    ),
    ("editor:cursor", "Cursor", Some("cursor"), "Cursor.exe"),
    ("editor:notepad", "Notepad", None, "notepad.exe"),
];

fn script_editor_path(folder: Option<&str>, executable: &str) -> Option<PathBuf> {
    let roots = match folder {
        Some(folder) => vec![
            ("LOCALAPPDATA", Path::new("Programs").join(folder)),
            ("ProgramFiles", PathBuf::from(folder)),
            ("ProgramFiles(x86)", PathBuf::from(folder)),
            ("ProgramW6432", PathBuf::from(folder)),
        ],
        None => vec![("SystemRoot", PathBuf::from("System32"))],
    };
    roots.into_iter().find_map(|(variable, directory)| {
        let root = PathBuf::from(std::env::var_os(variable)?);
        if !root.is_absolute() {
            return None;
        }
        let candidate = root.join(directory).join(executable);
        candidate.is_file().then_some(candidate)
    })
}

pub(super) fn script_editor_applications(extension: &str) -> Vec<DeliveryApplication> {
    let extension = extension.to_owned();
    let default_executable =
        on_shell_thread(move || Ok(association(&extension, ASSOCSTR_EXECUTABLE)))
            .ok()
            .flatten();
    SCRIPT_EDITORS
        .iter()
        .filter_map(|&(id, name, folder, executable)| {
            let path = script_editor_path(folder, executable)?;
            Some(DeliveryApplication {
                id: id.into(),
                name: name.into(),
                icon_data_url: path.to_str().and_then(|path| icon_data_url(path, 0)),
                is_default: default_executable
                    .as_ref()
                    .is_some_and(|default| default.eq_ignore_ascii_case(&path.to_string_lossy())),
            })
        })
        .collect()
}

pub(super) fn open_script_in_editor(path: &Path, application_id: &str) -> Result<(), String> {
    let executable = SCRIPT_EDITORS
        .iter()
        .find(|editor| editor.0 == application_id)
        .and_then(|&(_, _, folder, executable)| script_editor_path(folder, executable))
        .ok_or("The selected script editor is unavailable")?;
    Command::new(executable)
        .arg(path)
        .spawn()
        .map(|_| ())
        .map_err(|err| format!("The selected editor could not open this file: {err}"))
}

struct ComApartment;
impl ComApartment {
    fn new() -> Result<Self, String> {
        unsafe { CoInitializeEx(None, COINIT_APARTMENTTHREADED).ok() }
            .map_err(|err| format!("Could not initialize desktop application discovery: {err}"))?;
        Ok(Self)
    }
}
impl Drop for ComApartment {
    fn drop(&mut self) {
        unsafe { CoUninitialize() };
    }
}

fn on_shell_thread<T: Send + 'static>(
    action: impl FnOnce() -> Result<T, String> + Send + 'static,
) -> Result<T, String> {
    // Tokio blocking workers may already have an MTA/WinRT apartment from
    // another desktop feature. Keep Shell handlers in a dedicated STA.
    std::thread::Builder::new()
        .name("delivery-shell".into())
        .spawn(move || {
            let _com = ComApartment::new()?;
            action()
        })
        .map_err(|err| format!("Could not start desktop application access: {err}"))?
        .join()
        .map_err(|_| "Desktop application access ended unexpectedly".to_string())?
}

fn owned_shell_string(value: PWSTR) -> Result<String, String> {
    if value.is_null() {
        return Err("The desktop application returned an empty name".into());
    }
    let result = unsafe { value.to_string() }.map_err(|err| err.to_string());
    unsafe { CoTaskMemFree(Some(value.0.cast())) };
    result
}

fn association(extension: &str, kind: ASSOCSTR) -> Option<String> {
    let extension = HSTRING::from(extension);
    let mut length = 0;
    // Unknown types otherwise resolve to Windows' Open With picker. That is
    // not an installed default application; queries also must not fix registry entries.
    unsafe {
        let _ = AssocQueryStringW(
            ASSOCF_INIT_IGNOREUNKNOWN | ASSOCF_NOFIXUPS,
            kind,
            &extension,
            PCWSTR::null(),
            None,
            &mut length,
        );
    };
    if length == 0 || length > 32768 {
        return None;
    }
    let mut buffer = vec![0u16; length as usize];
    unsafe {
        AssocQueryStringW(
            ASSOCF_INIT_IGNOREUNKNOWN | ASSOCF_NOFIXUPS,
            kind,
            &extension,
            PCWSTR::null(),
            Some(PWSTR(buffer.as_mut_ptr())),
            &mut length,
        )
        .ok()
    }
    .ok()?;
    let end = buffer
        .iter()
        .position(|ch| *ch == 0)
        .unwrap_or(buffer.len());
    String::from_utf16(&buffer[..end])
        .ok()
        .filter(|value| !value.is_empty())
}

fn handlers(extension: &str) -> Result<Vec<IAssocHandler>, String> {
    let enumerator =
        match unsafe { SHAssocEnumHandlers(&HSTRING::from(extension), ASSOC_FILTER_NONE) } {
            Ok(value) => value,
            Err(err) if [0x80070483u32, 0x80070002u32].contains(&(err.code().0 as u32)) => {
                return Ok(vec![])
            }
            Err(err) => return Err(format!("Could not list applications for this file: {err}")),
        };
    let mut result = Vec::new();
    loop {
        let mut next = [None];
        let mut fetched = 0;
        unsafe { enumerator.Next(&mut next, Some(&mut fetched)) }
            .map_err(|err| format!("Could not read the application list: {err}"))?;
        if fetched == 0 {
            break;
        }
        if let Some(handler) = next[0].take() {
            result.push(handler);
        }
        if result.len() >= 100 {
            break;
        }
    }
    Ok(result)
}

pub(super) fn applications(extension: &str) -> Result<DeliveryApplications, String> {
    let extension = extension.to_owned();
    on_shell_thread(move || applications_in_apartment(&extension))
}

fn applications_in_apartment(extension: &str) -> Result<DeliveryApplications, String> {
    let default_executable = association(extension, ASSOCSTR_EXECUTABLE);
    let default_name = association(extension, ASSOCSTR_FRIENDLYAPPNAME);
    let can_open_default =
        default_executable.is_some() || association(extension, ASSOCSTR_PROGID).is_some();
    let mut applications: Vec<DeliveryApplication> = vec![];
    for handler in handlers(extension)? {
        let Some(id) = handler_id(&handler) else {
            continue;
        };
        if applications
            .iter()
            .any(|app| app.id.eq_ignore_ascii_case(&id))
        {
            continue;
        }
        let name = unsafe { handler.GetUIName() }
            .map_err(|err| err.to_string())
            .and_then(owned_shell_string)
            .unwrap_or_else(|_| {
                Path::new(&id)
                    .file_name()
                    .map(|name| name.to_string_lossy().into_owned())
                    .unwrap_or_else(|| id.clone())
            });
        let is_default = !applications.iter().any(|app| app.is_default)
            && default_executable.as_ref().map_or_else(
                || {
                    default_name
                        .as_ref()
                        .is_some_and(|value| value.eq_ignore_ascii_case(&name))
                },
                |value| value.eq_ignore_ascii_case(&id),
            );
        let mut icon_path = PWSTR::null();
        let mut icon_index = 0;
        let icon_data_url =
            if unsafe { handler.GetIconLocation(&mut icon_path, &mut icon_index) }.is_ok() {
                owned_shell_string(icon_path)
                    .ok()
                    .and_then(|path| icon_data_url(&path, icon_index))
            } else {
                None
            };
        applications.push(DeliveryApplication {
            id,
            name,
            icon_data_url,
            is_default,
        });
    }
    if can_open_default && !applications.iter().any(|app| app.is_default) {
        let icon_data_url = association(extension, ASSOCSTR_DEFAULTICON).and_then(|location| {
            let (path, index) = location
                .rsplit_once(',')
                .map(|(path, index)| (path.trim_matches('"'), index.parse().unwrap_or(0)))
                .unwrap_or((location.trim_matches('"'), 0));
            icon_data_url(path, index)
        });
        applications.push(DeliveryApplication {
            id: SYSTEM_DEFAULT.into(),
            name: default_name.unwrap_or_else(|| "System default application".into()),
            icon_data_url,
            is_default: true,
        });
    }
    applications.sort_by(|left, right| {
        right
            .is_default
            .cmp(&left.is_default)
            .then_with(|| left.name.to_lowercase().cmp(&right.name.to_lowercase()))
    });
    Ok(DeliveryApplications {
        applications,
        can_open_default,
        can_choose_application: true,
        editor_only: false,
    })
}

pub(super) fn open(
    path: &Path,
    extension: &str,
    application_id: Option<&str>,
) -> Result<(), String> {
    let path = path.to_owned();
    let extension = extension.to_owned();
    let application_id = application_id.map(str::to_owned);
    on_shell_thread(move || open_in_apartment(&path, &extension, application_id.as_deref()))
}

fn handler_id(handler: &IAssocHandler) -> Option<String> {
    unsafe { handler.GetName() }
        .ok()
        .and_then(|name| owned_shell_string(name).ok())
        .filter(|name| !name.is_empty())
}

fn open_in_apartment(
    path: &Path,
    extension: &str,
    application_id: Option<&str>,
) -> Result<(), String> {
    if let Some(application_id) = application_id.filter(|id| *id != SYSTEM_DEFAULT) {
        // Re-enumerate before invocation: arbitrary paths/commands supplied by
        // a webview cannot be used as application ids, and uninstall races fail.
        for handler in handlers(extension)? {
            if handler_id(&handler).as_deref() == Some(application_id) {
                let item: IShellItem =
                    unsafe { SHCreateItemFromParsingName(&HSTRING::from(path.as_os_str()), None) }
                        .map_err(|err| {
                            format!(
                                "Could not prepare the delivery file for this application: {err}"
                            )
                        })?;
                let data: IDataObject = unsafe { item.BindToHandler(None, &BHID_DataObject) }
                    .map_err(|err| {
                        format!("Could not prepare the delivery file for this application: {err}")
                    })?;
                return unsafe { handler.Invoke(&data) }.map_err(|err| {
                    format!("The selected application could not open this file: {err}")
                });
            }
        }
        return Err("The selected application is no longer available for this file type".into());
    }
    if association(extension, ASSOCSTR_EXECUTABLE).is_none()
        && association(extension, ASSOCSTR_PROGID).is_none()
    {
        return Err("No default application is configured for this file type".into());
    }
    let file = HSTRING::from(path.as_os_str());
    let mut info = SHELLEXECUTEINFOW {
        cbSize: size_of::<SHELLEXECUTEINFOW>() as u32,
        fMask: SEE_MASK_FLAG_NO_UI | SEE_MASK_NOASYNC,
        lpVerb: w!("open"),
        lpFile: PCWSTR(file.as_ptr()),
        nShow: SW_SHOWNORMAL.0,
        ..Default::default()
    };
    unsafe { ShellExecuteExW(&mut info) }
        .map_err(|err| format!("The default application could not open this file: {err}"))
}

pub(super) fn reveal(path: &Path) -> Result<(), String> {
    let path = path.to_owned();
    on_shell_thread(move || reveal_in_apartment(&path))
}

fn reveal_in_apartment(path: &Path) -> Result<(), String> {
    let mut item = std::ptr::null_mut();
    unsafe { SHParseDisplayName(&HSTRING::from(path.as_os_str()), None, &mut item, 0, None) }
        .map_err(|err| format!("Could not locate the delivery file: {err}"))?;
    let result = unsafe { SHOpenFolderAndSelectItems(item, None, 0) }
        .map_err(|err| format!("Could not show the delivery file in Explorer: {err}"));
    unsafe { CoTaskMemFree(Some(item.cast())) };
    result
}

struct Icon(HICON);
impl Drop for Icon {
    fn drop(&mut self) {
        unsafe {
            let _ = DestroyIcon(self.0);
        }
    }
}
struct IconBitmaps(ICONINFO);
impl Drop for IconBitmaps {
    fn drop(&mut self) {
        unsafe {
            let _ = DeleteObject(self.0.hbmColor.into());
            let _ = DeleteObject(self.0.hbmMask.into());
        }
    }
}

fn icon_data_url(path: &str, index: i32) -> Option<String> {
    // Do not expose filesystem URLs or fetch remote icon resources. The
    // returned data URL is a bounded ICO generated from a local Shell icon.
    if !Path::new(path).is_absolute() || !Path::new(path).is_file() {
        return None;
    }
    let mut handle = HICON::default();
    unsafe { SHDefExtractIconW(&HSTRING::from(path), index, 0, Some(&mut handle), None, 32).ok() }
        .ok()?;
    if handle.0.is_null() {
        return None;
    }
    let icon = Icon(handle);
    let mut info = ICONINFO::default();
    unsafe { GetIconInfo(icon.0, &mut info) }.ok()?;
    let bitmaps = IconBitmaps(info);
    let mut bitmap = BITMAP::default();
    if unsafe {
        GetObjectW(
            bitmaps.0.hbmColor.into(),
            size_of::<BITMAP>() as i32,
            Some((&mut bitmap as *mut BITMAP).cast()),
        )
    } == 0
    {
        return None;
    }
    let width = bitmap.bmWidth;
    let height = bitmap.bmHeight;
    if width <= 0 || height <= 0 || width > 256 || height > 256 {
        return None;
    }
    let mut pixels = vec![0u8; width as usize * height as usize * 4];
    let mut dib = BITMAPINFO {
        bmiHeader: BITMAPINFOHEADER {
            biSize: size_of::<BITMAPINFOHEADER>() as u32,
            biWidth: width,
            biHeight: height,
            biPlanes: 1,
            biBitCount: 32,
            ..Default::default()
        },
        ..Default::default()
    };
    let dc = unsafe { GetDC(None) };
    if dc.0.is_null() {
        return None;
    }
    let lines = unsafe {
        GetDIBits(
            dc,
            bitmaps.0.hbmColor,
            0,
            height as u32,
            Some(pixels.as_mut_ptr().cast()),
            &mut dib,
            DIB_RGB_COLORS,
        )
    };
    unsafe { ReleaseDC(None, dc) };
    if lines != height {
        return None;
    }
    let ico = encode_icon(width as u32, height as u32, &pixels)?;
    Some(format!("data:image/x-icon;base64,{}", STANDARD.encode(ico)))
}

fn encode_icon(width: u32, height: u32, pixels: &[u8]) -> Option<Vec<u8>> {
    if width == 0
        || height == 0
        || width > 256
        || height > 256
        || pixels.len() != (width * height * 4) as usize
    {
        return None;
    }
    let mask_bytes = width.div_ceil(32) * 4 * height;
    let image_bytes = 40 + pixels.len() as u32 + mask_bytes;
    let mut result = vec![
        0,
        0,
        1,
        0,
        1,
        0,
        width as u8,
        height as u8,
        0,
        0,
        1,
        0,
        32,
        0,
    ];
    result.extend_from_slice(&image_bytes.to_le_bytes());
    result.extend_from_slice(&22u32.to_le_bytes());
    result.extend_from_slice(&40u32.to_le_bytes());
    result.extend_from_slice(&width.to_le_bytes());
    result.extend_from_slice(&(height * 2).to_le_bytes());
    result.extend_from_slice(&[1, 0, 32, 0]);
    result.extend_from_slice(&[0; 24]);
    result.extend_from_slice(pixels);
    result.resize(result.len() + mask_bytes as usize, 0);
    Some(result)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn icons_are_bounded_real_ico_data() {
        let icon = encode_icon(2, 2, &[255; 16]).unwrap();
        assert_eq!(&icon[..6], &[0, 0, 1, 0, 1, 0]);
        assert_eq!(u32::from_le_bytes(icon[18..22].try_into().unwrap()), 22);
        assert_eq!(icon.len(), 22 + 40 + 16 + 8);
        assert!(encode_icon(300, 300, &[]).is_none());
        assert!(icon_data_url("https://example.com/icon.ico", 0).is_none());
    }

    #[test]
    fn system_associations_are_real_and_unknown_app_ids_are_rejected() {
        let result = applications(".txt").unwrap();
        assert!(result.can_choose_application);
        assert!(result
            .applications
            .iter()
            .all(|app| !app.name.is_empty() && !app.id.is_empty()));
        assert!(
            result
                .applications
                .iter()
                .filter(|app| app.is_default)
                .count()
                <= 1
        );
        for app in &result.applications {
            if let Some(icon) = &app.icon_data_url {
                assert!(icon.starts_with("data:image/x-icon;base64,"));
            }
        }
        let error = open(
            Path::new("C:\\not-used.txt"),
            ".txt",
            Some("not-a-registered-application"),
        )
        .unwrap_err();
        assert!(error.contains("no longer available"), "{error}");
        let unknown = applications(".ugsci-no-association-test-6eec15").unwrap();
        assert!(!unknown.can_open_default);
        assert!(open(
            Path::new("C:\\not-used.ugsci-no-association-test-6eec15"),
            ".ugsci-no-association-test-6eec15",
            None
        )
        .unwrap_err()
        .contains("No default application"));
    }
}
