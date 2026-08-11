# -*- coding: utf-8 -*-
"""Unit tests for console upload filename and storage handling."""

import hashlib
import unicodedata

from qwenpaw.app.upload_storage import (
    _safe_filename,
    _store_console_upload,
)


def test_safe_filename_normalizes_unicode_to_nfc() -> None:
    decomposed = "呼图壁_re\u0301sume\u0301.xlsx"

    result = _safe_filename(decomposed)

    assert result == unicodedata.normalize("NFC", decomposed)


def test_safe_filename_removes_nested_internal_upload_prefixes() -> None:
    uuid_prefix = "a" * 32
    digest_prefix = "b" * 64

    result = _safe_filename(
        f"{uuid_prefix}_{digest_prefix}_呼图壁储气库一库一表.xlsx",
    )

    assert result == "呼图壁储气库一库一表.xlsx"


def test_store_console_upload_uses_sha256_name(tmp_path) -> None:
    data = b"ugsci-upload"
    digest = hashlib.sha256(data).hexdigest()

    path, actual_digest, deduplicated = _store_console_upload(
        tmp_path,
        data,
        "呼图壁.xlsx",
    )

    assert actual_digest == digest
    assert path.name == f"{digest}_呼图壁.xlsx"
    assert path.read_bytes() == data
    assert deduplicated is False


def test_store_console_upload_deduplicates_same_content(tmp_path) -> None:
    data = b"same-content"
    first_path, _, first_deduplicated = _store_console_upload(
        tmp_path,
        data,
        "first.xlsx",
    )

    second_path, _, second_deduplicated = _store_console_upload(
        tmp_path,
        data,
        "second.xlsx",
    )

    assert first_path == second_path
    assert first_deduplicated is False
    assert second_deduplicated is True
    assert len(list(tmp_path.iterdir())) == 1


def test_store_console_upload_limits_name_and_preserves_extension(
    tmp_path,
) -> None:
    path, _, _ = _store_console_upload(
        tmp_path,
        b"long-name",
        f"{'呼' * 200}.xlsx",
    )

    stored_display_name = path.name.split("_", 1)[1]
    assert len(str(path)) <= 240
    assert len(stored_display_name) <= 120
    assert stored_display_name.endswith(".xlsx")
