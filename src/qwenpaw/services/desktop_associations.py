# -*- coding: utf-8 -*-
"""System file associations for the local browser console."""

from __future__ import annotations

import base64
import io
import ctypes as ct
import os
import subprocess
import sys
import uuid
from contextlib import contextmanager
from pathlib import Path

BLOCKED_EXTENSIONS = frozenset(
    "exe com bat cmd ps1 psm1 psd1 vbs vbe js jse wsf wsh msi msp scr cpl "
    "hta lnk url reg sh command desktop app jar py pyw".split(),
)
SCRIPT_EDITOR_EXTENSIONS = frozenset(
    ".bat .cmd .ps1 .psm1 .psd1 .vbs .vbe .js .jse .wsf .wsh "
    ".sh .command .py .pyw".split(),
)
# These editors receive the staged file as a single argument, without
# consulting its Shell verb or accepting an executable from the caller.
WINDOWS_SCRIPT_EDITORS = (
    ("editor:vscode", "Visual Studio Code", "Microsoft VS Code", "Code.exe"),
    ("editor:cursor", "Cursor", "cursor", "Cursor.exe"),
    ("editor:notepad", "Notepad", None, "notepad.exe"),
)


def _windows_editor_path(folder: str | None, executable: str) -> Path | None:
    if folder is None:
        roots = [("SystemRoot", Path("System32"))]
    else:
        roots = [
            ("LOCALAPPDATA", Path("Programs", folder)),
            ("ProgramFiles", Path(folder)),
            ("ProgramFiles(x86)", Path(folder)),
            ("ProgramW6432", Path(folder)),
        ]
    for variable, directory in roots:
        root = os.environ.get(variable)
        if root and Path(root).is_absolute():
            candidate = Path(root) / directory / executable
            if candidate.is_file():
                return candidate
    return None


def _script_editors():
    if sys.platform == "win32":
        for editor_id, name, folder, executable in WINDOWS_SCRIPT_EDITORS:
            path = _windows_editor_path(folder, executable)
            if path is not None:
                yield editor_id, name, path


def file_extension(name: str) -> str:
    suffix = Path(name).suffix.lower()
    if not suffix or suffix[1:] in BLOCKED_EXTENSIONS:
        raise ValueError("This file type must be previewed or saved")
    return suffix


def _guid(value: str):
    return (ct.c_ubyte * 16).from_buffer_copy(uuid.UUID(value).bytes_le)


def _method(pointer, index: int, *types):
    table = ct.cast(pointer, ct.POINTER(ct.POINTER(ct.c_void_p))).contents
    return ct.WINFUNCTYPE(ct.c_long, ct.c_void_p, *types)(table[index])


def _check(result: int) -> None:
    if result < 0:
        raise OSError(f"Windows Shell error 0x{result & 0xffffffff:08x}")


@contextmanager
def _apartment():
    ole = ct.OleDLL("ole32")
    _check(ole.CoInitializeEx(None, 2))
    try:
        yield
    finally:
        ole.CoUninitialize()


def _release(pointer) -> None:
    if pointer:
        _method(pointer, 2)(pointer)


def _string(pointer, index: int) -> str:
    value = ct.c_void_p()
    _check(
        _method(pointer, index, ct.POINTER(ct.c_void_p))(
            pointer,
            ct.byref(value),
        ),
    )
    try:
        return ct.wstring_at(value) if value else ""
    finally:
        ct.OleDLL("ole32").CoTaskMemFree(value)


@contextmanager
def _handlers(extension: str):
    shell = ct.WinDLL("shell32")
    enumerator = ct.c_void_p()
    shell.SHAssocEnumHandlers.argtypes = [
        ct.c_wchar_p,
        ct.c_uint,
        ct.POINTER(ct.c_void_p),
    ]
    _check(shell.SHAssocEnumHandlers(extension, 0, ct.byref(enumerator)))
    handlers = []
    try:
        while len(handlers) < 100:
            item, fetched = ct.c_void_p(), ct.c_uint()
            _check(
                _method(
                    enumerator,
                    3,
                    ct.c_uint,
                    ct.POINTER(ct.c_void_p),
                    ct.POINTER(ct.c_uint),
                )(
                    enumerator,
                    1,
                    ct.byref(item),
                    ct.byref(fetched),
                ),
            )
            if not fetched.value:
                break
            handlers.append(item)
        yield handlers
    finally:
        for handler in handlers:
            _release(handler)
        _release(enumerator)


def _association(extension: str, kind: int) -> str:
    query = ct.WinDLL("shlwapi").AssocQueryStringW
    query.argtypes = [
        ct.c_uint,
        ct.c_int,
        ct.c_wchar_p,
        ct.c_wchar_p,
        ct.c_wchar_p,
        ct.POINTER(ct.c_uint),
    ]
    length = ct.c_uint()
    query(1280, kind, extension, None, None, ct.byref(length))
    if not 0 < length.value <= 32768:
        return ""
    value = ct.create_unicode_buffer(length.value)
    result = query(1280, kind, extension, None, value, ct.byref(length))
    return value.value if result == 0 else ""


def _icon(handler) -> str | None:
    """Extract the Shell-provided icon without executing its application."""
    location, index = ct.c_void_p(), ct.c_int()
    try:
        _check(
            _method(handler, 5, ct.POINTER(ct.c_void_p), ct.POINTER(ct.c_int))(
                handler,
                ct.byref(location),
                ct.byref(index),
            ),
        )
        source = ct.wstring_at(location) if location else ""
    except OSError:
        return None
    finally:
        ct.OleDLL("ole32").CoTaskMemFree(location)
    return _icon_from_file(source, index.value)


def _icon_from_file(source: str, index: int = 0) -> str | None:
    try:
        import pywintypes
        import win32gui
        import win32ui
        from PIL import Image
    except ImportError:
        return None
    large, small = [], []
    screen = memory = bitmap = None
    previous = None
    dc = None
    try:
        large, small = win32gui.ExtractIconEx(
            os.path.expandvars(source),
            index,
            1,
        )
        icon = (large or small)[0]
        dc = win32gui.GetDC(0)
        screen = win32ui.CreateDCFromHandle(dc)
        memory = screen.CreateCompatibleDC()
        bitmap = win32ui.CreateBitmap()
        bitmap.CreateCompatibleBitmap(screen, 32, 32)
        previous = memory.SelectObject(bitmap)
        memory.FillSolidRect((0, 0, 32, 32), 0xFFFFFF)
        win32gui.DrawIconEx(
            memory.GetSafeHdc(),
            0,
            0,
            icon,
            32,
            32,
            0,
            None,
            3,
        )
        image = Image.frombuffer(
            "RGB",
            (32, 32),
            bitmap.GetBitmapBits(True),
            "raw",
            "BGRX",
            0,
            1,
        )
        output = io.BytesIO()
        image.save(output, format="PNG")
        return "data:image/png;base64," + base64.b64encode(
            output.getvalue(),
        ).decode(
            "ascii",
        )
    except (OSError, RuntimeError, IndexError, ValueError, pywintypes.error):
        return None
    finally:
        if memory and previous:
            memory.SelectObject(previous)
        if bitmap:
            win32gui.DeleteObject(bitmap.GetHandle())
        if memory:
            memory.DeleteDC()
        if screen:
            screen.DeleteDC()
        if dc:
            win32gui.ReleaseDC(0, dc)
        for icon in large + small:
            win32gui.DestroyIcon(icon)


def _windows_applications(extension: str) -> dict:
    with _apartment():
        default_path = _association(extension, 2)
        default_name = _association(extension, 4)
        applications = []
        with _handlers(extension) as handlers:
            for handler in handlers:
                try:
                    identifier = _string(handler, 3)
                except OSError:
                    continue
                if not identifier or any(
                    app["id"].casefold() == identifier.casefold()
                    for app in applications
                ):
                    continue
                try:
                    name = _string(handler, 4)
                except OSError:
                    name = Path(identifier).stem
                applications.append(
                    {
                        "id": identifier,
                        "name": name or Path(identifier).stem,
                        "isDefault": identifier.casefold()
                        == default_path.casefold(),
                        "iconDataUrl": _icon(handler),
                    },
                )
        if default_path and not any(app["isDefault"] for app in applications):
            applications.insert(
                0,
                {
                    "id": "system-default",
                    "name": default_name or Path(default_path).stem,
                    "isDefault": True,
                },
            )
        return {
            "applications": applications,
            "canOpenDefault": bool(default_path),
            "canChooseApplication": True,
        }


def list_applications(name: str) -> dict:
    suffix = Path(name).suffix.lower()
    if suffix in SCRIPT_EDITOR_EXTENSIONS:
        editors = list(_script_editors())
        default_path = None
        if editors:
            try:
                with _apartment():
                    default_path = Path(_association(suffix, 2))
            except OSError:
                pass
        applications = [
            {
                "id": editor_id,
                "name": label,
                "isDefault": path == default_path,
                "iconDataUrl": _icon_from_file(str(path)),
            }
            for editor_id, label, path in editors
        ]
        return {
            "applications": applications,
            "canOpenDefault": False,
            "canChooseApplication": bool(applications),
            "editorOnly": True,
        }
    try:
        extension = file_extension(name)
    except ValueError:
        return {
            "applications": [],
            "canOpenDefault": False,
            "canChooseApplication": False,
        }
    if sys.platform == "win32":
        return _windows_applications(extension)
    return {
        "applications": [],
        "canOpenDefault": True,
        "canChooseApplication": False,
    }


def _windows_open(path: Path, application_id: str) -> None:
    with _apartment(), _handlers(file_extension(path.name)) as handlers:
        handler = next(
            (item for item in handlers if _string(item, 3) == application_id),
            None,
        )
        if not handler:
            raise ValueError(
                "The application is no longer associated with this file",
            )
        identifier = _string(handler, 3)
        executable = Path(identifier)
        if (
            executable.is_absolute()
            and executable.suffix.lower() == ".exe"
            and executable.is_file()
        ):
            # Shell DDE callbacks need a GUI message loop. The HTTP worker has
            # none, so start the executable resolved from this Shell handler.
            # pylint: disable-next=consider-using-with
            subprocess.Popen([str(executable), str(path)], close_fds=True)
            return
        shell = ct.WinDLL("shell32")
        item, data = ct.c_void_p(), ct.c_void_p()
        shell.SHCreateItemFromParsingName.argtypes = [
            ct.c_wchar_p,
            ct.c_void_p,
            ct.c_void_p,
            ct.POINTER(ct.c_void_p),
        ]
        _check(
            shell.SHCreateItemFromParsingName(
                str(path),
                None,
                ct.byref(_guid("43826d1e-e718-42ee-bc55-a1e261c37bfe")),
                ct.byref(item),
            ),
        )
        try:
            _check(
                _method(
                    item,
                    3,
                    ct.c_void_p,
                    ct.c_void_p,
                    ct.c_void_p,
                    ct.POINTER(ct.c_void_p),
                )(
                    item,
                    None,
                    ct.byref(_guid("b8c0bd9f-ed24-455c-83e6-d5390c4fe8c4")),
                    ct.byref(_guid("0000010e-0000-0000-c000-000000000046")),
                    ct.byref(data),
                ),
            )
            _check(_method(handler, 8, ct.c_void_p)(handler, data))
        finally:
            _release(data)
            _release(item)


def _windows_default_open(path: Path) -> None:
    with _apartment():
        executable = _association(file_extension(path.name), 2)
    if not executable:
        raise ValueError("No default application is associated with this file")
    target = Path(executable)
    if (
        not target.is_absolute()
        or not target.is_file()
        or target.suffix.lower() != ".exe"
    ):
        raise ValueError("The default application executable is unavailable")
    # pylint: disable-next=consider-using-with
    subprocess.Popen([str(target), str(path)], close_fds=True)


def open_file(path: Path, application_id: str | None = None) -> None:
    if path.suffix.lower() in SCRIPT_EDITOR_EXTENSIONS:
        for editor_id, _, executable in _script_editors():
            if editor_id == application_id:
                # pylint: disable-next=consider-using-with
                subprocess.Popen([str(executable), str(path)], close_fds=True)
                return
        raise ValueError("Choose an available editor to open this script")
    file_extension(path.name)
    if sys.platform == "win32":
        if application_id and application_id != "system-default":
            _windows_open(path, application_id)
        else:
            _windows_default_open(path)
    elif sys.platform == "darwin":
        if application_id:
            raise ValueError("Application selection is unavailable")
        # pylint: disable-next=consider-using-with
        subprocess.Popen(["open", str(path)], close_fds=True)
    else:
        if application_id:
            raise ValueError("Application selection is unavailable")
        # pylint: disable-next=consider-using-with
        subprocess.Popen(["xdg-open", str(path)], close_fds=True)
