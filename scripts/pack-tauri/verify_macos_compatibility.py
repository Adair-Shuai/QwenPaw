#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Check actual ARM64 payload deployment targets against macOS 15.0."""

from __future__ import annotations

import argparse
from email.parser import Parser
import json
import os
from pathlib import Path
import re
import stat
import struct
from typing import BinaryIO


LIMIT = (15, 0, 0)
ARM64 = 0x0100000C
THIN = {
    b"\xce\xfa\xed\xfe": ("<", False),
    b"\xfe\xed\xfa\xce": (">", False),
    b"\xcf\xfa\xed\xfe": ("<", True),
    b"\xfe\xed\xfa\xcf": (">", True),
}
FAT = {
    b"\xca\xfe\xba\xbe": (">", False),
    b"\xbe\xba\xfe\xca": ("<", False),
    b"\xca\xfe\xba\xbf": (">", True),
    b"\xbf\xba\xfe\xca": ("<", True),
}
MACOS_TAG = re.compile(r"macosx_(\d+)_(\d+)_(arm64|universal2)\Z")


def _read(stream: BinaryIO, offset: int, size: int, end: int) -> bytes:
    if offset < 0 or size < 0 or offset + size > end:
        raise ValueError("Mach-O range exceeds its slice")
    stream.seek(offset)
    data = stream.read(size)
    if len(data) != size:
        raise ValueError("truncated Mach-O")
    return data


def _version(encoded: int) -> tuple[int, int, int]:
    result = (encoded >> 16, (encoded >> 8) & 255, encoded & 255)
    if result[0] == 0:
        raise ValueError("invalid zero macOS deployment target")
    return result


def _command_version(
    stream: BinaryIO,
    offset: int,
    size: int,
    command: int,
    endian: str,
) -> tuple[int, int, int] | None:
    end = offset + size
    if command == 0x24:  # LC_VERSION_MIN_MACOSX
        if size != 16:
            raise ValueError("invalid LC_VERSION_MIN_MACOSX size")
        return _version(
            struct.unpack(endian + "I", _read(stream, offset + 8, 4, end))[0],
        )
    if command == 0x32:  # LC_BUILD_VERSION
        platform, minimum, _, tools = struct.unpack(
            endian + "IIII",
            _read(stream, offset + 8, 16, end),
        )
        if size != 24 + tools * 8:
            raise ValueError("invalid LC_BUILD_VERSION tool table")
        if platform != 1:  # PLATFORM_MACOS
            raise ValueError("ARM64 binary has a non-macOS build platform")
        return _version(minimum)
    return None


def _thin_versions(
    stream: BinaryIO,
    offset: int,
    size: int,
    expected_cpu: int | None = None,
) -> list[tuple[int, int, int]]:
    end = offset + size
    magic = _read(stream, offset, 4, end)
    if magic not in THIN:
        raise ValueError("fat architecture is not a thin Mach-O")
    endian, is_64 = THIN[magic]
    header_size = 32 if is_64 else 28
    header = struct.unpack(
        endian + ("IIIIIIII" if is_64 else "IIIIIII"),
        _read(stream, offset, header_size, end),
    )
    cpu, command_count, command_bytes = header[1], header[4], header[5]
    if expected_cpu is not None and cpu != expected_cpu:
        raise ValueError("fat architecture CPU disagrees with its Mach-O")
    if cpu == ARM64 and not is_64:
        raise ValueError("ARM64 binary has a 32-bit Mach-O header")
    cursor = offset + header_size
    command_end = cursor + command_bytes
    if command_end > end or command_count > command_bytes // 8:
        raise ValueError("Mach-O load command table exceeds its slice")
    versions = []
    for _ in range(command_count):
        command, length = struct.unpack(
            endian + "II",
            _read(stream, cursor, 8, command_end),
        )
        if length < 8 or length % (8 if is_64 else 4):
            raise ValueError("invalid Mach-O load command size")
        if cursor + length > command_end:
            raise ValueError("Mach-O load command exceeds its table")
        if cpu == ARM64:
            version = _command_version(stream, cursor, length, command, endian)
            if version is not None:
                versions.append(version)
        cursor += length
    if cursor != command_end:
        raise ValueError("Mach-O load command count/size mismatch")
    if cpu == ARM64 and not versions:
        raise ValueError("ARM64 binary has no macOS deployment target")
    # A slice is one executable contract, even with two deployment commands.
    return [max(versions)] if versions else []


def _fat_slices(
    stream: BinaryIO,
    size: int,
    magic: bytes,
) -> list[tuple[int, int, int]]:
    endian, is_64 = FAT[magic]
    count = struct.unpack(endian + "I", _read(stream, 4, 4, size))[0]
    entry_size = 32 if is_64 else 20
    table_end = 8 + count * entry_size
    if not count or table_end > size:
        raise ValueError("invalid fat Mach-O architecture table")
    slices = []
    for index in range(count):
        entry = struct.unpack(
            endian + ("IIQQII" if is_64 else "IIIII"),
            _read(stream, 8 + index * entry_size, entry_size, table_end),
        )
        cpu, _, offset, length, alignment = entry[:5]
        if offset < table_end or length < 4 or offset + length > size:
            raise ValueError("invalid fat Mach-O slice bounds")
        if alignment >= 64 or offset % (1 << alignment):
            raise ValueError("invalid fat Mach-O slice alignment")
        if is_64 and entry[5] != 0:
            raise ValueError("invalid fat Mach-O reserved field")
        slices.append((offset, length, cpu))
    slices.sort()
    for previous, current in zip(slices, slices[1:]):
        if previous[0] + previous[1] > current[0]:
            raise ValueError("overlapping fat Mach-O slices")
    return slices


def _java_attributes(
    stream: BinaryIO,
    cursor: int,
    count: int,
    end: int,
) -> int:
    for _ in range(count):
        _, length = struct.unpack(
            ">HI",
            _read(stream, cursor, 6, end),
        )
        cursor += 6 + length
        if cursor > end:
            raise ValueError("truncated Java attribute")
    return cursor


def _java_members(stream: BinaryIO, cursor: int, end: int) -> int:
    count = struct.unpack(">H", _read(stream, cursor, 2, end))[0]
    cursor += 2
    for _ in range(count):
        attributes = struct.unpack(">HHHH", _read(stream, cursor, 8, end))[3]
        cursor = _java_attributes(stream, cursor + 8, attributes, end)
    return cursor


def _is_java_class(stream: BinaryIO, size: int) -> bool:
    """Disambiguate CAFEBABE only for a structurally complete Java class."""
    try:
        _, major, count = struct.unpack(">HHH", _read(stream, 4, 6, size))
        if major < 45 or count < 1:
            return False
        cursor, index = 10, 1
        fixed = {
            3: 4,
            4: 4,
            5: 8,
            6: 8,
            7: 2,
            8: 2,
            9: 4,
            10: 4,
            11: 4,
            12: 4,
            15: 3,
            16: 2,
            17: 4,
            18: 4,
            19: 2,
            20: 2,
        }
        while index < count:
            tag = _read(stream, cursor, 1, size)[0]
            cursor += 1
            if tag == 1:
                length = struct.unpack(">H", _read(stream, cursor, 2, size))[0]
                cursor += 2
            else:
                length = fixed.get(tag)
                if length is None:
                    return False
            _read(stream, cursor, length, size)
            cursor += length
            index += 2 if tag in (5, 6) else 1
        if index != count:
            return False
        interfaces = struct.unpack(">HHHH", _read(stream, cursor, 8, size))[3]
        cursor += 8 + interfaces * 2
        cursor = _java_members(stream, cursor, size)
        cursor = _java_members(stream, cursor, size)
        attributes = struct.unpack(">H", _read(stream, cursor, 2, size))[0]
        return _java_attributes(stream, cursor + 2, attributes, size) == size
    except ValueError:
        return False


def _macho_versions(path: Path) -> tuple[bool, list[tuple[int, int, int]]]:
    with path.open("rb") as stream:
        size = os.fstat(stream.fileno()).st_size
        magic = stream.read(4)
        if magic in THIN:
            return True, _thin_versions(stream, 0, size)
        if magic in FAT:
            if (
                magic == b"\xca\xfe\xba\xbe"
                and path.suffix == ".class"
                and _is_java_class(stream, size)
            ):
                return False, []
            versions = []
            for offset, length, cpu in _fat_slices(stream, size, magic):
                versions.extend(_thin_versions(stream, offset, length, cpu))
            return True, versions
    return False, []


def _wheel_version(path: Path) -> tuple[int, int, int] | None:
    metadata = Parser().parsestr(path.read_text(encoding="utf-8"))
    tags = metadata.get_all("Tag", [])
    if not tags:
        raise ValueError("WHEEL metadata has no compatibility tags")
    versions = []
    for tag in tags:
        fields = tag.strip().split("-")
        if len(fields) != 3 or not all(fields):
            raise ValueError("invalid WHEEL compatibility tag")
        for platform in fields[2].split("."):
            match = MACOS_TAG.fullmatch(platform)
            if match:
                versions.append((int(match[1]), int(match[2]), 0))
            elif platform.startswith("macosx_") and platform.endswith(
                ("_arm64", "_universal2"),
            ):
                raise ValueError("invalid ARM64 macOS WHEEL tag")
    # Wheel tags are alternatives; the lowest usable ARM64 tag is sufficient.
    return min(versions) if versions else None


def _checked_path(root: Path, path: Path) -> Path:
    resolved = path.resolve(strict=True)
    if not resolved.is_relative_to(root):
        raise ValueError(f"payload path escapes root: {path}")
    return resolved


def _walk_error(error: OSError) -> None:
    raise error


def _payload_files(root: Path):
    for directory, directories, files in os.walk(
        root,
        followlinks=False,
        onerror=_walk_error,
    ):
        for name in directories:
            logical = Path(directory) / name
            _checked_path(root, logical)
            if name.endswith(".dist-info") and logical.is_symlink():
                wheel = logical / "WHEEL"
                yield wheel, _checked_path(root, wheel)
        for name in files:
            logical = Path(directory) / name
            resolved = _checked_path(root, logical)
            if not stat.S_ISREG(resolved.stat().st_mode):
                raise ValueError(
                    f"payload contains a non-regular file: {name}",
                )
            yield logical, resolved


def _display(version: tuple[int, int, int]) -> str:
    return ".".join(str(part) for part in version)


def verify_payload(root: Path) -> dict:
    """Read every real payload file; collect all incompatibilities."""
    root = root.resolve(strict=True)
    if not root.is_dir():
        raise ValueError("payload root must be a directory")
    report: dict = {
        "limit_macos": _display(LIMIT),
        "files_checked": 0,
        "macho_files": 0,
        "arm64_slices": 0,
        "wheel_metadata": 0,
        "max_macos": None,
        "offenders": [],
    }
    maximum = None
    seen = set()
    for logical, path in _payload_files(root):
        is_wheel = logical.name == "WHEEL" and logical.parent.name.endswith(
            ".dist-info",
        )
        if path in seen and not is_wheel:
            continue
        try:
            versions = []
            if path not in seen:
                seen.add(path)
                report["files_checked"] += 1
                is_macho, versions = _macho_versions(path)
                report["macho_files"] += int(is_macho)
                report["arm64_slices"] += len(versions)
            if is_wheel:
                report["wheel_metadata"] += 1
                wheel_version = _wheel_version(path)
                if wheel_version is not None:
                    versions.append(wheel_version)
            if versions:
                required = max(versions)
                maximum = max(maximum or required, required)
                if required > LIMIT:
                    raise ValueError(
                        f"requires macOS {_display(required)} > {_display(LIMIT)}",
                    )
        except (OSError, UnicodeError, ValueError) as error:
            report["offenders"].append(
                {
                    "path": logical.relative_to(root).as_posix(),
                    "reason": str(error),
                },
            )
    if not report["arm64_slices"]:
        report["offenders"].append(
            {"path": ".", "reason": "payload contains no ARM64 Mach-O binary"},
        )
    report["max_macos"] = _display(maximum) if maximum else None
    report["ok"] = not report["offenders"]
    return report


def main() -> int:
    """Validate a payload without changing it; optionally save JSON externally."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", required=True, type=Path)
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()
    try:
        if args.report and args.report.resolve().is_relative_to(
            args.root.resolve(),
        ):
            raise ValueError(
                "report must be outside the read-only payload root",
            )
        report = verify_payload(args.root)
    except (OSError, ValueError) as error:
        report = {
            "ok": False,
            "offenders": [{"path": ".", "reason": str(error)}],
        }
    serialized = json.dumps(report, sort_keys=True, indent=2) + "\n"
    if args.report:
        if args.report.resolve().is_relative_to(args.root.resolve()):
            print(serialized, end="")
            return 1
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(serialized, encoding="utf-8")
    print(serialized, end="")
    return 0 if report["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
