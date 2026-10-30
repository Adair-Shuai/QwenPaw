# -*- coding: utf-8 -*-
"""Real plugin storage preserves boundaries beyond Windows MAX_PATH."""

from pathlib import Path

import pytest

from qwenpaw.plugins._apps import CapabilityStorage
from qwenpaw.plugins.errors import SDKError
from qwenpaw.plugins.storage import MediaStore, PluginStorage


@pytest.mark.asyncio
async def test_long_paths_keep_storage_keys_media_and_access_boundary(
    tmp_path,
):
    root = tmp_path / ("a" * 90) / ("b" * 90) / ("c" * 90)
    storage = PluginStorage(root, lambda: None)
    key = str(Path("nested") / "文书.json")
    await storage.awrite_json(key, {"revision": 1})
    assert await storage.aread_json(key) == {"revision": 1}
    assert await CapabilityStorage(storage).keys() == [key]
    await storage.awrite_json(key, {"revision": 2})
    assert await storage.aread_json(key) == {"revision": 2}
    media = await MediaStore(storage, "/preview").awrite("image.bin", b"media")
    assert media.url == (root / "image.bin").as_uri()
    assert await storage.aread_bytes("image.bin") == b"media"
    with pytest.raises(SDKError, match="inside this plugin"):
        storage.write_json("../outside.json", {})
    await storage.adelete(key)
    assert await storage.aread_json(key) is None
    assert await CapabilityStorage(storage).keys() == ["image.bin"]
