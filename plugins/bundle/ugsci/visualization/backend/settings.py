# -*- coding: utf-8 -*-
"""Plugin configuration settings.

All paths and limits are configurable. In production, these can be
overridden via environment variables.
"""

from __future__ import annotations

import os
from pathlib import Path
from pydantic import BaseModel


class PluginSettings(BaseModel):
    """Configuration for the UGSci visualization capability."""

    # Upload limits
    max_upload_size: int = 500 * 1024 * 1024  # 500 MB
    max_zip_file_count: int = 10_000
    max_uncompressed_size: int = 2 * 1024 * 1024 * 1024  # 2 GB

    # Cache
    cache_enabled: bool = True
    cache_max_age_days: int = 30

    # Jobs
    max_concurrent_imports: int = 2
    job_timeout_minutes: int = 30

    # API
    api_prefix: str = "/ugsci/visualization"

    # Performance
    chunk_target_triangles: int = 500_000
    coordinate_origin_mode: str = "auto"  # auto | origin | centroid

    @classmethod
    def from_env(cls) -> "PluginSettings":
        """Load settings from environment variables."""
        return cls(
            max_upload_size=int(
                os.environ.get("OILGAS_MAX_UPLOAD", 500 * 1024 * 1024)
            ),
            max_concurrent_imports=int(
                os.environ.get("OILGAS_MAX_IMPORTS", 2)
            ),
            chunk_target_triangles=int(
                os.environ.get("OILGAS_CHUNK_TRIANGLES", 500_000)
            ),
            coordinate_origin_mode=os.environ.get(
                "OILGAS_COORD_ORIGIN", "auto"
            ),
        )


# Singleton
settings = PluginSettings.from_env()
