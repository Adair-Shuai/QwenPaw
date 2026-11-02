# -*- coding: utf-8 -*-
"""Exercise the actual macOS payload guard using portable Mach-O fixtures."""

from importlib.util import module_from_spec, spec_from_file_location
import json
from pathlib import Path
import struct
import subprocess
import sys

import pytest


SCRIPT = (
    Path(__file__).resolve().parents[3]
    / "scripts/pack-tauri/verify_macos_compatibility.py"
)
SPEC = spec_from_file_location("macos_compatibility", SCRIPT)
assert SPEC and SPEC.loader
GUARD = module_from_spec(SPEC)
SPEC.loader.exec_module(GUARD)
ARM64 = 0x0100000C
X86_64 = 0x01000007


def _thin(
    version=(15, 0, 0),
    *,
    endian="<",
    cpu=ARM64,
    legacy=False,
    bits=64,
    commands=None,
):
    encoded = version[0] << 16 | version[1] << 8 | version[2]
    if commands is None:
        if legacy:
            commands = struct.pack(endian + "IIII", 0x24, 16, encoded, 0)
        else:
            commands = struct.pack(
                endian + "IIIIII",
                0x32,
                24,
                1,
                encoded,
                26 << 16,
                0,
            )
    header = [0xFEEDFACF if bits == 64 else 0xFEEDFACE, cpu, 0, 2, 1]
    header += [len(commands), 0]
    if bits == 64:
        header.append(0)
    return struct.pack(endian + "I" * len(header), *header) + commands


def _fat(slices, *, endian=">", bits=32):
    entry_size = 32 if bits == 64 else 20
    cursor = 8 + len(slices) * entry_size
    entries = []
    payload = b""
    for cpu, binary in slices:
        entry = [cpu, 0, cursor, len(binary), 0]
        if bits == 64:
            entry.append(0)
        entries.append(
            struct.pack(
                endian + ("IIQQII" if bits == 64 else "IIIII"),
                *entry,
            ),
        )
        payload += binary
        cursor += len(binary)
    return (
        struct.pack(
            endian + "II",
            0xCAFEBABF if bits == 64 else 0xCAFEBABE,
            len(slices),
        )
        + b"".join(entries)
        + payload
    )


def _payload(tmp_path, binary=None):
    root = tmp_path / "payload"
    root.mkdir()
    (root / "app").write_bytes(_thin() if binary is None else binary)
    return root


def _wheel(root, tags):
    path = root / "provider-1.dist-info" / "WHEEL"
    path.parent.mkdir()
    path.write_text(
        "Wheel-Version: 1.0\nRoot-Is-Purelib: false\n"
        + "".join(f"Tag: {tag}\n" for tag in tags),
        encoding="utf-8",
    )
    return path


@pytest.mark.parametrize("endian", ["<", ">"])
@pytest.mark.parametrize("legacy", [False, True])
@pytest.mark.parametrize(
    ("version", "ok"),
    [
        ((14, 0, 0), True),
        ((15, 0, 0), True),
        ((15, 0, 1), False),
        ((15, 1, 0), False),
        ((26, 0, 0), False),
    ],
)
def test_thin_arm64_deployment_target_is_checked(
    tmp_path,
    endian,
    legacy,
    version,
    ok,
):
    root = _payload(tmp_path, _thin(version, endian=endian, legacy=legacy))
    report = GUARD.verify_payload(root)
    assert report["ok"] is ok
    assert report["arm64_slices"] == 1
    assert report["max_macos"] == ".".join(map(str, version))
    if not ok:
        assert "requires macOS" in report["offenders"][0]["reason"]


@pytest.mark.parametrize("endian", ["<", ">"])
@pytest.mark.parametrize("bits", [32, 64])
def test_fat_checks_every_arm64_slice(tmp_path, endian, bits):
    root = _payload(
        tmp_path,
        _fat(
            [
                (X86_64, _thin((26, 0, 0), cpu=X86_64)),
                (ARM64, _thin((14, 0, 0))),
                (ARM64, _thin((16, 0, 0))),
            ],
            endian=endian,
            bits=bits,
        ),
    )
    report = GUARD.verify_payload(root)
    assert not report["ok"]
    assert report["arm64_slices"] == 2
    assert report["max_macos"] == "16.0.0"


def test_fat_ignores_non_arm_deployment_target(tmp_path):
    root = _payload(
        tmp_path,
        _fat([(X86_64, _thin((26, 0, 0), cpu=X86_64)), (ARM64, _thin())]),
    )
    assert GUARD.verify_payload(root)["ok"]


def _overwrite(data, offset, value, *, endian="<"):
    return (
        data[:offset] + struct.pack(endian + "I", value) + data[offset + 4 :]
    )


@pytest.mark.parametrize(
    "binary",
    [
        b"\xcf\xfa\xed\xfe",
        _thin()[:-1],
        _overwrite(_thin(), 16, 2),
        _overwrite(_thin(), 20, 25),
        _overwrite(_thin(), 36, 0),
        _overwrite(_thin(), 36, 16),
        _overwrite(_thin(), 36, 32),
        _overwrite(_thin(), 40, 2),
        _overwrite(_thin(), 52, 1),
        _thin((0, 0, 0)),
        _thin(bits=32),
        _thin(commands=struct.pack("<II", 0x1, 8)),
        struct.pack(">II", 0xCAFEBABE, 0),
        struct.pack(">II", 0xCAFEBABE, 0xFFFFFFFF),
        _fat([(ARM64, _thin())])[:-1],
        _overwrite(_fat([(ARM64, _thin())]), 16, 0, endian=">"),
        _overwrite(_fat([(ARM64, _thin())]), 20, 0xFFFFFFFF, endian=">"),
        _overwrite(_fat([(ARM64, _thin())]), 24, 64, endian=">"),
        _fat([(X86_64, _thin())]),
        _overwrite(
            _fat([(ARM64, _thin())], bits=64),
            36,
            1,
            endian=">",
        ),
        _overwrite(
            _fat([(ARM64, _thin()), (ARM64, _thin())]),
            36,
            48,
            endian=">",
        ),
    ],
)
def test_malformed_macho_is_rejected(tmp_path, binary):
    report = GUARD.verify_payload(_payload(tmp_path, binary))
    assert not report["ok"]
    assert report["offenders"][0]["path"] == "app"


@pytest.mark.parametrize("bits", [32, 64])
def test_non_arm_thin_macho_is_not_arm_evidence(tmp_path, bits):
    root = _payload(
        tmp_path,
        _thin(cpu=7 if bits == 32 else X86_64, bits=bits),
    )
    report = GUARD.verify_payload(root)
    assert not report["ok"]
    assert report["macho_files"] == 1
    assert report["arm64_slices"] == 0


@pytest.mark.parametrize(
    ("tags", "ok", "maximum"),
    [
        (["cp311-cp311-macosx_15_0_arm64"], True, "15.0.0"),
        (["cp311-cp311-macosx_26_0_arm64"], False, "26.0.0"),
        (["cp311-cp311-macosx_16_0_universal2"], False, "16.0.0"),
        (
            ["cp311-cp311-macosx_26_0_arm64.macosx_11_0_universal2"],
            True,
            "15.0.0",
        ),
        (
            ["cp311-cp311-macosx_26_0_arm64", "cp311-cp311-macosx_14_0_arm64"],
            True,
            "15.0.0",
        ),
        (["py3-none-any"], True, "15.0.0"),
        (["cp311-cp311-macosx_26_0_x86_64"], True, "15.0.0"),
        (["cp311-cp311-macosx_bad_0_arm64"], False, "15.0.0"),
        (["invalid"], False, "15.0.0"),
        ([], False, "15.0.0"),
    ],
)
def test_wheel_arm64_minimum_is_checked(tmp_path, tags, ok, maximum):
    root = _payload(tmp_path)
    _wheel(root, tags)
    report = GUARD.verify_payload(root)
    assert report["ok"] is ok
    assert report["wheel_metadata"] == 1
    assert report["max_macos"] == maximum


def test_payload_requires_arm64_binary(tmp_path):
    root = _payload(tmp_path, b"ordinary data; no Mach-O header")
    _wheel(root, ["py3-none-any"])
    (root / "not-an-executable.dylib").write_bytes(b"just sample data")
    report = GUARD.verify_payload(root)
    assert not report["ok"]
    assert report["macho_files"] == 0
    assert report["offenders"] == [
        {"path": ".", "reason": "payload contains no ARM64 Mach-O binary"},
    ]


def test_payload_paths_cannot_escape_root(tmp_path, monkeypatch):
    root = _payload(tmp_path)
    outside = tmp_path / "outside"
    outside.write_bytes(_thin((26, 0, 0)))
    alias = root / "framework-link"
    alias.write_text("link placeholder", encoding="utf-8")
    original = Path.resolve

    def resolve(path, *args, **kwargs):
        if path == alias:
            return outside
        return original(path, *args, **kwargs)

    monkeypatch.setattr(Path, "resolve", resolve)
    with pytest.raises(ValueError, match="escapes root"):
        GUARD.verify_payload(root)


def test_internal_framework_alias_is_scanned_once(tmp_path, monkeypatch):
    root = _payload(tmp_path)
    alias = root / "framework-link"
    alias.write_text("not the target bytes", encoding="utf-8")
    original = Path.resolve

    def resolve(path, *args, **kwargs):
        if path == alias:
            return root / "app"
        return original(path, *args, **kwargs)

    monkeypatch.setattr(Path, "resolve", resolve)
    report = GUARD.verify_payload(root)
    assert report["ok"]
    assert report["files_checked"] == 1
    assert report["arm64_slices"] == 1


@pytest.mark.parametrize("minimum", [14, 26])
def test_wheel_internal_alias_cannot_hide_minimum(
    tmp_path,
    monkeypatch,
    minimum,
):
    root = _payload(tmp_path)
    metadata = root / "metadata.txt"
    metadata.write_text(
        f"Wheel-Version: 1.0\nTag: cp311-cp311-macosx_{minimum}_0_arm64\n",
        encoding="utf-8",
    )
    alias = _wheel(root, ["py3-none-any"])
    original = Path.resolve

    def resolve(path, *args, **kwargs):
        if path == alias:
            return metadata
        return original(path, *args, **kwargs)

    monkeypatch.setattr(Path, "resolve", resolve)
    report = GUARD.verify_payload(root)
    assert report["ok"] is (minimum <= 15)
    assert report["wheel_metadata"] == 1
    assert report["files_checked"] == 2
    if minimum > 15:
        assert report["offenders"][0]["path"].endswith(".dist-info/WHEEL")


def _java_class():
    pool = (
        b"\x01\x00\x06Sample\x07\x00\x01"
        b"\x01\x00\x10java/lang/Object\x07\x00\x03"
    )
    return (
        struct.pack(">IHHH", 0xCAFEBABE, 0, 65, 5)
        + pool
        + struct.pack(">HHHHHHH", 0x21, 2, 4, 0, 0, 0, 0)
    )


def test_java_class_is_not_misidentified_as_fat_macho(tmp_path):
    root = _payload(tmp_path)
    (root / "Sample.class").write_bytes(_java_class())
    report = GUARD.verify_payload(root)
    assert report["ok"]
    assert report["files_checked"] == 2
    assert report["macho_files"] == report["arm64_slices"] == 1


@pytest.mark.parametrize(
    "binary",
    [
        _java_class()[:-1],
        _java_class() + b"trailing bytes",
        _thin((26, 0, 0)),
        _fat([(ARM64, _thin((26, 0, 0)))]),
    ],
)
def test_class_suffix_does_not_bypass_binary_validation(tmp_path, binary):
    root = _payload(tmp_path)
    (root / "Sample.class").write_bytes(binary)
    report = GUARD.verify_payload(root)
    assert not report["ok"]
    assert report["offenders"][0]["path"] == "Sample.class"


@pytest.mark.parametrize("version", [(15, 0, 0), (26, 0, 0)])
def test_cli_checks_real_payload_and_writes_report(tmp_path, version):
    root = _payload(tmp_path, _thin(version))
    binary_before = (root / "app").read_bytes()
    report_path = tmp_path / "audit.json"
    process = subprocess.run(
        [
            sys.executable,
            "-I",
            str(SCRIPT),
            "--root",
            str(root),
            "--report",
            str(report_path),
        ],
        capture_output=True,
        text=True,
        check=False,
    )
    report = json.loads(report_path.read_text(encoding="utf-8"))
    assert json.loads(process.stdout) == report
    assert report["ok"] is (version == (15, 0, 0))
    assert process.returncode == (0 if report["ok"] else 1)
    assert (root / "app").read_bytes() == binary_before
    assert list(root.iterdir()) == [root / "app"]


def test_cli_rejects_report_inside_payload(tmp_path):
    root = _payload(tmp_path)
    report_path = root / "must-not-write.json"
    process = subprocess.run(
        [
            sys.executable,
            "-I",
            str(SCRIPT),
            "--root",
            str(root),
            "--report",
            str(report_path),
        ],
        capture_output=True,
        text=True,
        check=False,
    )
    assert process.returncode == 1
    assert "outside the read-only payload" in process.stdout
    assert not report_path.exists()
