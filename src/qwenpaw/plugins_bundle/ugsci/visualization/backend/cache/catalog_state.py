# -*- coding: utf-8 -*-
"""User catalog overlay: hide built-in examples without deleting package files."""

from __future__ import annotations

import json
import logging
import os
import tempfile
import threading
from pathlib import Path
from typing import Any

logger = logging.getLogger("qwenpaw").getChild("plugin.oilgas_vis.cache.catalog")


class CatalogState:
    """Persists hidden dataset ids next to the converted cache."""

    def __init__(self, data_dir: Path) -> None:
        self.data_dir = data_dir
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.path = data_dir / "catalog_state.json"
        self._lock = threading.RLock()

    def read(self) -> dict[str, Any]:
        with self._lock:
            try:
                if self.path.exists():
                    payload = json.loads(self.path.read_text(encoding="utf-8"))
                    if isinstance(payload, dict):
                        hidden = payload.get("hidden") or []
                        if isinstance(hidden, list):
                            return {
                                "hidden": [
                                    str(item) for item in hidden if str(item).strip()
                                ],
                            }
            except (json.JSONDecodeError, OSError):
                logger.warning("Catalog state unreadable, starting fresh")
            return {"hidden": []}

    def hidden_ids(self) -> set[str]:
        return set(self.read().get("hidden") or [])

    def hide(self, dataset_ids: list[str]) -> list[str]:
        """Add ids to the hidden list. Returns the ids that were newly hidden."""
        wanted = [item for item in dict.fromkeys(dataset_ids) if item]
        if not wanted:
            return []
        with self._lock:
            payload = self.read()
            hidden = list(payload.get("hidden") or [])
            existing = set(hidden)
            added = [item for item in wanted if item not in existing]
            if added:
                hidden.extend(added)
                self._atomic_write({"hidden": hidden})
            return added

    def restore_all(self) -> list[str]:
        """Clear the hidden list and return the previous ids."""
        with self._lock:
            previous = list(self.read().get("hidden") or [])
            if previous:
                self._atomic_write({"hidden": []})
            elif self.path.exists():
                try:
                    self.path.unlink()
                except OSError:
                    self._atomic_write({"hidden": []})
            return previous

    def _atomic_write(self, data: dict[str, Any]) -> None:
        content = json.dumps(data, indent=2, ensure_ascii=False)
        tmp_path: Path | None = None
        try:
            with tempfile.NamedTemporaryFile(
                mode="w",
                dir=self.data_dir,
                prefix=".catalog_state_",
                suffix=".tmp",
                delete=False,
                encoding="utf-8",
            ) as tmp:
                tmp.write(content)
                tmp_path = Path(tmp.name)
            os.replace(tmp_path, self.path)
        except Exception as exc:
            logger.error("Atomic catalog state write failed: %s", exc)
            if tmp_path is not None and tmp_path.exists():
                tmp_path.unlink(missing_ok=True)
            raise
