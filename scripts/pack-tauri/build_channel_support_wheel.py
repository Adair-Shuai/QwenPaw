#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Derive a fully recorded channel host wheel without backend-owned plugins.

The public host wheel is immutable input. Every original member, including
excluded plugin bundles, must match its original RECORD before derivation.
The internal build-tagged wheel retains all other payload/METADATA bytes and
owns a new WHEEL and RECORD; third-party wheels are never transformed.
"""

from __future__ import annotations

import argparse
import base64
import csv
from email.parser import BytesParser
from email import policy
import hashlib
import io
from pathlib import Path, PurePosixPath
import stat
import zipfile

from packaging.utils import canonicalize_name, parse_wheel_filename
from packaging.tags import parse_tag
from packaging.version import Version

BUILD_TAG = "1channelsupport"
_MAX_MEMBERS = 100_000
_MAX_BYTES = 1024**3
_MAX_MEMBER_BYTES = 256 * 1024**2


def _safe_member(name: str) -> None:
    path = PurePosixPath(name)
    if (
        not name
        or path.is_absolute()
        or ".." in path.parts
        or any(character in name for character in "\\:\x00")
        or path.as_posix() != name
    ):
        raise ValueError(f"Unsafe host wheel member: {name}")


def _read_members(path: Path) -> tuple[dict[str, bytes], dict[str, int]]:
    payload, modes = {}, {}
    with zipfile.ZipFile(path) as archive:
        entries = archive.infolist()
        if (
            len(entries) > _MAX_MEMBERS
            or sum(entry.file_size for entry in entries) > _MAX_BYTES
            or any(entry.file_size > _MAX_MEMBER_BYTES for entry in entries)
        ):
            raise ValueError("Host wheel exceeds payload limits")
        seen = set()
        for entry in entries:
            name = (
                entry.filename.rstrip("/")
                if entry.is_dir()
                else entry.filename
            )
            _safe_member(name)
            mode = entry.external_attr >> 16
            if name in seen or stat.S_IFMT(mode) not in (
                0,
                stat.S_IFREG,
                stat.S_IFDIR,
            ):
                raise ValueError("Duplicate or linked host wheel member")
            seen.add(name)
            if entry.is_dir():
                continue
            if stat.S_IFMT(mode) == stat.S_IFDIR:
                raise ValueError("Invalid host wheel file mode")
            payload[name] = archive.read(entry)
            modes[name] = stat.S_IMODE(mode) or 0o644
    return payload, modes


def _verify_record(payload: dict[str, bytes], record: str) -> None:
    try:
        rows = list(csv.reader(io.StringIO(payload[record].decode("utf-8"))))
    except (KeyError, UnicodeError, csv.Error) as exc:
        raise ValueError("Host wheel RECORD is missing or invalid") from exc
    seen = set()
    for row in rows:
        if len(row) != 3 or row[0] in seen or row[0] not in payload:
            raise ValueError("Host wheel RECORD inventory differs")
        name, encoded, size = row
        _safe_member(name)
        seen.add(name)
        if name == record:
            if encoded or size:
                raise ValueError("Host wheel RECORD must not hash itself")
            continue
        algorithm, separator, value = encoded.partition("=")
        if not separator or algorithm not in {"sha256", "sha384", "sha512"}:
            raise ValueError(f"Host wheel RECORD digest is invalid: {name}")
        try:
            expected = base64.b64decode(
                value + "=" * (-len(value) % 4),
                altchars=b"-_",
                validate=True,
            )
            matches = int(size) == len(payload[name])
        except (ValueError, TypeError) as exc:
            raise ValueError(
                f"Host wheel RECORD identity is invalid: {name}",
            ) from exc
        if (
            not matches
            or hashlib.new(algorithm, payload[name]).digest() != expected
        ):
            raise ValueError(f"Host wheel RECORD payload differs: {name}")
    if seen != set(payload):
        raise ValueError("Host wheel RECORD inventory differs")


def _metadata_root(source: Path, payload: dict[str, bytes]) -> str:
    name, version, _build, tags = parse_wheel_filename(source.name)
    roots = {
        path.split("/")[0]
        for path in payload
        if path.endswith(".dist-info/METADATA")
        and len(PurePosixPath(path).parts) == 2
    }
    if name != "qwenpaw" or len(roots) != 1:
        raise ValueError("Expected one qwenpaw host wheel distribution")
    root = roots.pop()
    metadata = BytesParser().parsebytes(payload[root + "/METADATA"])
    wheel = BytesParser().parsebytes(payload.get(root + "/WHEEL", b""))
    if (
        metadata.get_all("Name") != ["qwenpaw"]
        or len(metadata.get_all("Version", [])) != 1
        or Version(metadata["Version"]) != version
        or canonicalize_name(metadata["Name"]) != name
        or root != f"qwenpaw-{version}.dist-info"
    ):
        raise ValueError(
            "Host wheel distribution metadata identity is invalid",
        )
    if (
        wheel.get_all("Wheel-Version") != ["1.0"]
        or wheel.get("Root-Is-Purelib") not in {"true", "false"}
        or {
            tag
            for value in wheel.get_all("Tag", [])
            for tag in parse_tag(value)
        }
        != tags
        or wheel.get("Qwenpaw-Channel-Support") is not None
    ):
        raise ValueError("Host wheel metadata identity is invalid")
    if any(root + "/RECORD." in path for path in payload):
        raise ValueError(
            "Signed source wheels require a separate derivation policy",
        )
    return root


def _backend_owned(name: str) -> bool:
    parts = PurePosixPath(name).parts
    if (
        len(parts) >= 3
        and parts[0].endswith(".data")
        and parts[1] in {"purelib", "platlib"}
    ):
        parts = parts[2:]
    return len(parts) >= 2 and tuple(
        part.casefold() for part in parts[:2]
    ) == (
        "qwenpaw",
        "plugins_bundle",
    )


def _derived_wheel_metadata(original: bytes, source_digest: str) -> bytes:
    metadata = BytesParser().parsebytes(original)
    del metadata["Build"]
    metadata["Build"] = BUILD_TAG
    metadata["Qwenpaw-Channel-Support"] = "backend-plugins-excluded"
    metadata["Qwenpaw-Source-Wheel-SHA256"] = source_digest
    return metadata.as_bytes(
        policy=policy.compat32.clone(max_line_length=0, linesep="\n"),
    )


def _record_bytes(payload: dict[str, bytes], record: str) -> bytes:
    output = io.StringIO(newline="")
    writer = csv.writer(output, lineterminator="\n")
    for name, content in sorted(payload.items()):
        encoded = base64.urlsafe_b64encode(hashlib.sha256(content).digest())
        writer.writerow(
            (name, "sha256=" + encoded.decode().rstrip("="), len(content)),
        )
    writer.writerow((record, "", ""))
    return output.getvalue().encode("utf-8")


def _write_wheel(output, payload, modes, record) -> Path:
    if output.exists():
        raise ValueError("Channel support wheel destination must be new")
    created = False
    try:
        with zipfile.ZipFile(output, "x", zipfile.ZIP_DEFLATED) as archive:
            created = True
            for name, content in sorted(payload.items()):
                entry = zipfile.ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
                entry.create_system = 3
                entry.external_attr = (
                    stat.S_IFREG | modes.get(name, 0o644)
                ) << 16
                entry.compress_type = zipfile.ZIP_DEFLATED
                archive.writestr(entry, content)
        actual, _modes = _read_members(output)
        _verify_record(actual, record)
        return output
    except Exception:
        if created:
            output.unlink(missing_ok=True)
        raise


def build_channel_support_wheel(source: Path, destination: Path) -> Path:
    """Return a new canonical internal wheel after authenticating its source."""
    source = source.resolve(strict=True)
    payload, modes = _read_members(source)
    root = _metadata_root(source, payload)
    record = root + "/RECORD"
    _verify_record(payload, record)
    source_digest = hashlib.sha256(source.read_bytes()).hexdigest()
    retained = {
        name: content
        for name, content in payload.items()
        if not _backend_owned(name) and name != record
    }
    retained[root + "/WHEEL"] = _derived_wheel_metadata(
        retained[root + "/WHEEL"],
        source_digest,
    )
    retained[record] = _record_bytes(retained, record)
    _verify_record(retained, record)
    _name, version, _build, _tags = parse_wheel_filename(source.name)
    tag_suffix = source.name.rsplit("-", 3)[1:]
    filename = f"qwenpaw-{version}-{BUILD_TAG}-" + "-".join(tag_suffix)
    destination.mkdir(parents=True, exist_ok=True)
    output = destination / filename
    if output.resolve() == source:
        raise ValueError("Channel support wheel destination must be new")
    return _write_wheel(output, retained, modes, record)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--destination", type=Path, required=True)
    args = parser.parse_args()
    print(build_channel_support_wheel(args.source, args.destination))


if __name__ == "__main__":
    main()
