//! Native icon representations and Windows display-scale changes.

use tauri::image::Image;

pub const TRAY_ID: &str = "ugsci-main-tray";

pub fn window_icon() -> Image<'static> {
    // Explicit PNG input avoids Tauri's first-ICO-entry decoding behavior.
    tauri::include_image!("icons/runtime-window.png")
}

#[cfg(any(windows, test))]
const WINDOWS_TRAY_ICONS: &[Image<'static>] = &[
    tauri::include_image!("icons/tray/16.png"),
    tauri::include_image!("icons/tray/20.png"),
    tauri::include_image!("icons/tray/24.png"),
    tauri::include_image!("icons/tray/28.png"),
    tauri::include_image!("icons/tray/30.png"),
    tauri::include_image!("icons/tray/32.png"),
    tauri::include_image!("icons/tray/36.png"),
    tauri::include_image!("icons/tray/40.png"),
    tauri::include_image!("icons/tray/44.png"),
    tauri::include_image!("icons/tray/48.png"),
    tauri::include_image!("icons/tray/56.png"),
    tauri::include_image!("icons/tray/60.png"),
    tauri::include_image!("icons/tray/64.png"),
    tauri::include_image!("icons/tray/72.png"),
    tauri::include_image!("icons/tray/80.png"),
    tauri::include_image!("icons/tray/96.png"),
    tauri::include_image!("icons/tray/128.png"),
    tauri::include_image!("icons/tray/160.png"),
    tauri::include_image!("icons/tray/192.png"),
    tauri::include_image!("icons/tray/256.png"),
];

#[cfg(any(windows, test))]
fn windows_tray_icon(pixels: u32) -> Image<'static> {
    WINDOWS_TRAY_ICONS
        .iter()
        .find(|icon| icon.width() >= pixels)
        .unwrap_or(&WINDOWS_TRAY_ICONS[WINDOWS_TRAY_ICONS.len() - 1])
        .clone()
}

pub fn tray_icon() -> Image<'static> {
    #[cfg(windows)]
    return windows_tray_icon(windows_icons::system_icon_pixels());
    #[cfg(target_os = "macos")]
    return tauri::include_image!("icons/tray/template.png");
    #[cfg(not(any(windows, target_os = "macos")))]
    return tauri::include_image!("icons/tray/256.png");
}

pub fn setup(app: &tauri::App) {
    #[cfg(windows)]
    windows_icons::setup(app);
    #[cfg(not(windows))]
    let _ = app;
}

pub fn refresh(app: &tauri::AppHandle) {
    #[cfg(windows)]
    windows_icons::queue_refresh(app);
    #[cfg(not(windows))]
    let _ = app;
}

pub fn on_window_event(window: &tauri::Window, event: &tauri::WindowEvent) {
    #[cfg(windows)]
    windows_icons::on_window_event(window, event);
    #[cfg(not(windows))]
    let _ = (window, event);
}

#[cfg(windows)]
mod windows_icons {
    use super::{windows_tray_icon, TRAY_ID};
    use std::cell::RefCell;
    use std::sync::{
        atomic::{AtomicBool, AtomicU32, Ordering},
        OnceLock,
    };
    use tauri::Manager;
    use windows::{
        core::{w, PCWSTR},
        Win32::{
            Foundation::{HINSTANCE, HWND, LPARAM, LRESULT, POINT, WPARAM},
            Graphics::Gdi::{MonitorFromPoint, MONITOR_DEFAULTTONEAREST},
            System::LibraryLoader::GetModuleHandleW,
            UI::{
                HiDpi::{
                    GetDpiForMonitor, GetDpiForSystem, GetDpiForWindow, GetSystemMetricsForDpi,
                    MDT_EFFECTIVE_DPI,
                },
                Shell::{
                    DefSubclassProc, GetWindowSubclass, RemoveWindowSubclass, SetWindowSubclass,
                },
                WindowsAndMessaging::{
                    DestroyIcon, LoadImageW, RegisterWindowMessageW, SendMessageW, HICON, ICON_BIG,
                    ICON_SMALL, IMAGE_ICON, LR_DEFAULTCOLOR, SM_CXICON, SM_CXSMICON,
                    WM_DISPLAYCHANGE, WM_DPICHANGED, WM_NCDESTROY, WM_SETICON, WM_SETTINGCHANGE,
                },
            },
        },
    };

    const SUBCLASS_ID: usize = 0x5547_4943;

    #[derive(Default)]
    struct IconState {
        pixels: AtomicU32,
        pending: AtomicBool,
    }

    struct OwnedIcon(HICON);

    impl OwnedIcon {
        fn load(pixels: i32) -> windows::core::Result<Self> {
            let module = unsafe { GetModuleHandleW(None)? };
            Self::load_from(HINSTANCE(module.0), pixels)
        }

        fn load_from(module: HINSTANCE, pixels: i32) -> windows::core::Result<Self> {
            // LoadImage selects a native representation from this executable's
            // verified icon group. Each window owns its scaled handles.
            let image = unsafe {
                LoadImageW(
                    Some(module),
                    PCWSTR(32512usize as *const u16),
                    IMAGE_ICON,
                    pixels,
                    pixels,
                    LR_DEFAULTCOLOR,
                )?
            };
            Ok(Self(HICON(image.0)))
        }
    }

    impl Drop for OwnedIcon {
        fn drop(&mut self) {
            let _ = unsafe { DestroyIcon(self.0) };
        }
    }

    #[derive(Default)]
    struct WindowIcons {
        dpi: u32,
        small: Option<OwnedIcon>,
        large: Option<OwnedIcon>,
    }

    impl WindowIcons {
        fn refresh(&mut self, hwnd: HWND) -> windows::core::Result<()> {
            let dpi = unsafe { GetDpiForWindow(hwnd) }.max(96);
            if self.dpi == dpi {
                return Ok(());
            }
            let small = OwnedIcon::load(unsafe { GetSystemMetricsForDpi(SM_CXSMICON, dpi) })?;
            let large = OwnedIcon::load(unsafe { GetSystemMetricsForDpi(SM_CXICON, dpi) })?;
            unsafe {
                SendMessageW(
                    hwnd,
                    WM_SETICON,
                    Some(WPARAM(ICON_SMALL as usize)),
                    Some(LPARAM(small.0 .0 as isize)),
                );
                SendMessageW(
                    hwnd,
                    WM_SETICON,
                    Some(WPARAM(ICON_BIG as usize)),
                    Some(LPARAM(large.0 .0 as isize)),
                );
            }
            self.small = Some(small);
            self.large = Some(large);
            self.dpi = dpi;
            Ok(())
        }
    }

    struct DisplayListener {
        app: tauri::AppHandle,
        icons: RefCell<WindowIcons>,
    }

    impl DisplayListener {
        fn refresh_window(&self, hwnd: HWND) {
            // WM_SETICON can synchronously re-enter the window procedure.
            if let Ok(mut icons) = self.icons.try_borrow_mut() {
                if let Err(error) = icons.refresh(hwnd) {
                    log::warn!("[icons] native window icon refresh failed: {error}");
                }
            }
        }
    }

    pub fn system_icon_pixels() -> u32 {
        // The fallback also works before Explorer has placed the tray item.
        unsafe { icon_pixels(GetDpiForSystem()) }
    }

    pub(super) unsafe fn icon_pixels(dpi: u32) -> u32 {
        GetSystemMetricsForDpi(SM_CXSMICON, dpi.max(96)).max(16) as u32
    }

    fn tray_icon_pixels(app: &tauri::AppHandle) -> u32 {
        let rect = app
            .tray_by_id(TRAY_ID)
            .and_then(|tray| tray.rect().ok().flatten());
        if let Some(tauri::Rect {
            position: tauri::Position::Physical(position),
            ..
        }) = rect
        {
            // Read the tray's monitor, which may differ from the app window's.
            let monitor = unsafe {
                MonitorFromPoint(
                    POINT {
                        x: position.x,
                        y: position.y,
                    },
                    MONITOR_DEFAULTTONEAREST,
                )
            };
            let (mut x, mut y) = (0, 0);
            if unsafe { GetDpiForMonitor(monitor, MDT_EFFECTIVE_DPI, &mut x, &mut y) }.is_ok() {
                return unsafe { icon_pixels(x) };
            }
        }
        system_icon_pixels()
    }

    pub fn queue_refresh(app: &tauri::AppHandle) {
        let Some(state) = app.try_state::<IconState>() else {
            return;
        };
        if state.pending.swap(true, Ordering::AcqRel) {
            return;
        }
        let handle = app.clone();
        if let Err(error) = app.run_on_main_thread(move || {
            let state = handle.state::<IconState>();
            state.pending.store(false, Ordering::Release);
            let pixels = tray_icon_pixels(&handle);
            let image = windows_tray_icon(pixels);
            if state.pixels.load(Ordering::Acquire) == image.width() {
                return;
            }
            if let Some(tray) = handle.tray_by_id(TRAY_ID) {
                match tray.set_icon(Some(image.clone())) {
                    Ok(()) => state.pixels.store(image.width(), Ordering::Release),
                    Err(error) => log::warn!("[icons] tray refresh failed: {error}"),
                }
            }
        }) {
            state.pending.store(false, Ordering::Release);
            log::warn!("[icons] could not schedule tray refresh: {error}");
        }
    }

    fn taskbar_created_message() -> u32 {
        static MESSAGE: OnceLock<u32> = OnceLock::new();
        *MESSAGE.get_or_init(|| unsafe { RegisterWindowMessageW(w!("TaskbarCreated")) })
    }

    unsafe extern "system" fn display_change(
        hwnd: HWND,
        message: u32,
        wparam: WPARAM,
        lparam: LPARAM,
        id: usize,
        data: usize,
    ) -> LRESULT {
        if message == WM_NCDESTROY {
            let _ = RemoveWindowSubclass(hwnd, Some(display_change), id);
            let result = DefSubclassProc(hwnd, message, wparam, lparam);
            // Release owned HICONs after the native window finishes destruction.
            drop(Box::from_raw(data as *mut DisplayListener));
            return result;
        } else if matches!(message, WM_DISPLAYCHANGE | WM_DPICHANGED | WM_SETTINGCHANGE)
            || (message != 0 && message == taskbar_created_message())
        {
            let listener = &*(data as *const DisplayListener);
            listener.refresh_window(hwnd);
            queue_refresh(&listener.app);
        }
        DefSubclassProc(hwnd, message, wparam, lparam)
    }

    fn install_display_listener(window: &tauri::Window) -> tauri::Result<()> {
        let hwnd = HWND(window.hwnd()?.0);
        let mut existing = 0;
        if unsafe {
            GetWindowSubclass(hwnd, Some(display_change), SUBCLASS_ID, Some(&mut existing))
        }
        .as_bool()
        {
            unsafe { &*(existing as *const DisplayListener) }.refresh_window(hwnd);
            return Ok(());
        }
        let handle = Box::into_raw(Box::new(DisplayListener {
            app: window.app_handle().clone(),
            icons: RefCell::new(WindowIcons::default()),
        }));
        if !unsafe { SetWindowSubclass(hwnd, Some(display_change), SUBCLASS_ID, handle as usize) }
            .as_bool()
        {
            unsafe {
                drop(Box::from_raw(handle));
            }
            return Err(std::io::Error::last_os_error().into());
        }
        unsafe { &*handle }.refresh_window(hwnd);
        Ok(())
    }

    pub fn setup(app: &tauri::App) {
        app.manage(IconState::default());
        if let Some(window) = app.get_webview_window("main") {
            if let Err(error) = install_display_listener(&window.as_ref().window()) {
                log::warn!("[icons] could not observe display changes: {error}");
            }
        }
        queue_refresh(app.handle());
    }

    pub fn on_window_event(window: &tauri::Window, event: &tauri::WindowEvent) {
        if matches!(
            event,
            tauri::WindowEvent::Focused(true) | tauri::WindowEvent::ScaleFactorChanged { .. }
        ) {
            // A recovered WebView may own a newly created native window.
            if let Err(error) = install_display_listener(window) {
                log::warn!("[icons] could not observe recovered window: {error}");
            }
        }
        if matches!(
            event,
            tauri::WindowEvent::ScaleFactorChanged { .. }
                | tauri::WindowEvent::Moved(_)
                | tauri::WindowEvent::Focused(true)
        ) {
            queue_refresh(window.app_handle());
        }
    }

    #[cfg(test)]
    mod native_tests {
        use super::*;
        use std::mem::size_of;
        use std::os::windows::ffi::OsStrExt;
        use std::path::Path;
        use std::process::Command;
        use windows::Win32::{
            Foundation::{FreeLibrary, HMODULE},
            Graphics::Gdi::{DeleteObject, GetObjectW, BITMAP, HGDIOBJ},
            System::LibraryLoader::{
                LoadLibraryExW, LOAD_LIBRARY_AS_DATAFILE, LOAD_LIBRARY_AS_IMAGE_RESOURCE,
            },
            UI::WindowsAndMessaging::{GetIconInfo, ICONINFO},
        };

        struct IconModule(HMODULE);

        impl Drop for IconModule {
            fn drop(&mut self) {
                let _ = unsafe { FreeLibrary(self.0) };
            }
        }

        #[test]
        fn compiled_resources_load_native_icon_handles_at_each_dpi_size() {
            // Rust library test executables do not carry the app's resources.
            // Compile a real PE fixture from the same approved ICO instead.
            let directory = tempfile::tempdir().unwrap();
            let source = directory.path().join("Icons.cs");
            let program = directory.path().join("Icons.exe");
            std::fs::write(&source, "class Icons { static void Main() {} }").unwrap();
            let compiler = Path::new("C:/Windows/Microsoft.NET/Framework64/v4.0.30319/csc.exe");
            let icon =
                Path::new(env!("CARGO_MANIFEST_DIR")).join("../../scripts/pack/assets/icon.ico");
            let output = Command::new(compiler)
                .arg("/nologo")
                .arg(format!("/out:{}", program.display()))
                .arg(format!("/win32icon:{}", icon.display()))
                .arg(source)
                .output()
                .expect("Windows .NET compiler");
            assert!(
                output.status.success(),
                "{}",
                String::from_utf8_lossy(&output.stdout)
            );
            let filename: Vec<u16> = program.as_os_str().encode_wide().chain(Some(0)).collect();
            let module = IconModule(
                unsafe {
                    LoadLibraryExW(
                        PCWSTR(filename.as_ptr()),
                        None,
                        LOAD_LIBRARY_AS_DATAFILE | LOAD_LIBRARY_AS_IMAGE_RESOURCE,
                    )
                }
                .unwrap(),
            );
            for pixels in [
                16, 17, 20, 22, 24, 28, 30, 32, 36, 37, 40, 44, 48, 56, 60, 64, 72, 80, 96, 100,
                128, 160, 192, 200, 256,
            ] {
                let icon = OwnedIcon::load_from(HINSTANCE(module.0 .0), pixels)
                    .expect("compiled icon group");
                let mut info = ICONINFO::default();
                unsafe { GetIconInfo(icon.0, &mut info) }.unwrap();
                let mut bitmap = BITMAP::default();
                let copied = unsafe {
                    GetObjectW(
                        HGDIOBJ(info.hbmColor.0),
                        size_of::<BITMAP>() as i32,
                        Some((&mut bitmap as *mut BITMAP).cast()),
                    )
                };
                let _ = unsafe { DeleteObject(HGDIOBJ(info.hbmColor.0)) };
                let _ = unsafe { DeleteObject(HGDIOBJ(info.hbmMask.0)) };
                assert!(copied > 0);
                assert_eq!((bitmap.bmWidth, bitmap.bmHeight), (pixels, pixels));
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn window_uses_full_resolution_rgba() {
        let icon = window_icon();
        assert_eq!((icon.width(), icon.height()), (256, 256));
        assert_eq!(icon.rgba().len(), 256 * 256 * 4);
    }

    #[cfg(windows)]
    #[test]
    fn native_windows_metrics_have_exact_frames_for_standard_scale_factors() {
        for dpi in [
            96, 120, 144, 168, 180, 192, 216, 240, 264, 288, 336, 360, 384, 432, 480, 576, 768,
            960, 1152, 1536,
        ] {
            let pixels = unsafe { windows_icons::icon_pixels(dpi) };
            assert_eq!(windows_tray_icon(pixels).width(), pixels, "DPI {dpi}");
        }
    }

    #[test]
    fn tray_selects_exact_common_dpi_sizes_and_larger_intermediate_frames() {
        for icon in WINDOWS_TRAY_ICONS {
            let selected = windows_tray_icon(icon.width());
            assert_eq!(selected.width(), icon.width());
            assert_eq!(
                selected.rgba().len(),
                (icon.width() * icon.height() * 4) as usize
            );
        }
        assert_eq!(windows_tray_icon(17).width(), 20);
        assert_eq!(windows_tray_icon(22).width(), 24);
        assert_eq!(windows_tray_icon(100).width(), 128);
        assert_eq!(windows_tray_icon(0).width(), 16);
        assert_eq!(windows_tray_icon(512).width(), 256);
    }

    #[test]
    fn macos_template_has_transparency_and_opaque_glyph_pixels() {
        let icon = tauri::include_image!("icons/tray/template.png");
        assert_eq!((icon.width(), icon.height()), (72, 72));
        assert!(icon.rgba().chunks_exact(4).any(|pixel| pixel[3] == 0));
        assert!(icon
            .rgba()
            .chunks_exact(4)
            .any(|pixel| pixel[3] == 255 && pixel[..3] == [0, 0, 0]));
        assert!(icon
            .rgba()
            .chunks_exact(4)
            .filter(|pixel| pixel[3] > 0)
            .all(|pixel| pixel[..3] == [0, 0, 0]));
    }
}
