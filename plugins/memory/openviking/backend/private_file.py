# -*- coding: utf-8 -*-
"""Private installation-state permissions on POSIX and Windows."""

from __future__ import annotations

import os
from pathlib import Path


def _windows_api():
    """Bind Win32 signatures only when Windows needs private state."""
    import ctypes
    from ctypes import wintypes

    security = ctypes.WinDLL("advapi32", use_last_error=True)
    kernel = ctypes.WinDLL("kernel32", use_last_error=True)
    pointer = ctypes.c_void_p
    security.OpenProcessToken.argtypes = (
        wintypes.HANDLE,
        wintypes.DWORD,
        ctypes.POINTER(wintypes.HANDLE),
    )
    security.OpenProcessToken.restype = wintypes.BOOL
    security.GetTokenInformation.argtypes = (
        wintypes.HANDLE,
        ctypes.c_int,
        pointer,
        wintypes.DWORD,
        ctypes.POINTER(wintypes.DWORD),
    )
    security.GetTokenInformation.restype = wintypes.BOOL
    security.ConvertSidToStringSidW.argtypes = (
        pointer,
        ctypes.POINTER(wintypes.LPWSTR),
    )
    security.ConvertSidToStringSidW.restype = wintypes.BOOL
    security.ConvertStringSecurityDescriptorToSecurityDescriptorW.argtypes = (
        wintypes.LPCWSTR,
        wintypes.DWORD,
        ctypes.POINTER(pointer),
        pointer,
    )
    security.ConvertStringSecurityDescriptorToSecurityDescriptorW.restype = (
        wintypes.BOOL
    )
    security.SetFileSecurityW.argtypes = (
        wintypes.LPCWSTR,
        wintypes.DWORD,
        pointer,
    )
    security.SetFileSecurityW.restype = wintypes.BOOL
    kernel.GetCurrentProcess.restype = wintypes.HANDLE
    kernel.CloseHandle.argtypes = (wintypes.HANDLE,)
    kernel.CloseHandle.restype = wintypes.BOOL
    kernel.LocalFree.argtypes = (pointer,)
    kernel.LocalFree.restype = pointer

    return security, kernel


def _current_user_sid(security, kernel):
    """Read the process account SID without invoking a shell."""
    import ctypes
    from ctypes import wintypes

    pointer = ctypes.c_void_p
    token = wintypes.HANDLE()
    if not security.OpenProcessToken(
        kernel.GetCurrentProcess(),
        0x0008,
        ctypes.byref(token),
    ):
        raise ctypes.WinError(ctypes.get_last_error())
    try:
        required = wintypes.DWORD()
        security.GetTokenInformation(
            token,
            1,
            None,
            0,
            ctypes.byref(required),
        )
        if not required.value:
            raise ctypes.WinError(ctypes.get_last_error())
        user = ctypes.create_string_buffer(required.value)
        if not security.GetTokenInformation(
            token,
            1,
            user,
            required,
            ctypes.byref(required),
        ):
            raise ctypes.WinError(ctypes.get_last_error())
        # TOKEN_USER starts with SID_AND_ATTRIBUTES, whose first field is PSID.
        sid = ctypes.cast(user, ctypes.POINTER(pointer))[0]
        sid_text = wintypes.LPWSTR()
        if not security.ConvertSidToStringSidW(sid, ctypes.byref(sid_text)):
            raise ctypes.WinError(ctypes.get_last_error())
        try:
            return sid_text.value
        finally:
            kernel.LocalFree(sid_text)
    finally:
        kernel.CloseHandle(token)


def restrict_private_file(path: Path) -> None:
    """Restrict a file before writing or reusing private state.

    Windows chmod only changes the read-only attribute. A protected DACL
    grants only the current account access; permission failures propagate.
    """
    if os.name != "nt":
        path.chmod(0o600)
        return
    import ctypes

    security, kernel = _windows_api()
    pointer = ctypes.c_void_p
    sddl = f"D:P(A;;FA;;;{_current_user_sid(security, kernel)})"
    descriptor = pointer()
    if not security.ConvertStringSecurityDescriptorToSecurityDescriptorW(
        sddl,
        1,
        ctypes.byref(descriptor),
        None,
    ):
        raise ctypes.WinError(ctypes.get_last_error())
    try:
        # DACL_SECURITY_INFORMATION | PROTECTED_DACL_SECURITY_INFORMATION.
        if not security.SetFileSecurityW(str(path), 0x80000004, descriptor):
            raise ctypes.WinError(ctypes.get_last_error())
    finally:
        kernel.LocalFree(descriptor)
