# -*- coding: utf-8 -*-
"""Avatar fetching, caching, composition, and HTTP routes for UGSci."""

from __future__ import annotations

import hashlib
import logging
import math
from io import BytesIO
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, Response

logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci.avatar")

CANVAS_SIZE = 256
BACKGROUND_COLOR = (240, 240, 240, 255)


class AvatarService:
    """Own avatar storage paths and all avatar-related operations."""

    def __init__(self, plugin_id: str, plugin_dir: Path) -> None:
        self.plugin_id = plugin_id
        self.plugin_dir = plugin_dir

    def resource_dir(self) -> Path:
        """Return the shared avatar cache directory."""
        directory = Path.home() / ".qwenpaw" / "workspaces" / "default" / "resource"
        directory.mkdir(parents=True, exist_ok=True)
        return directory

    def default_avatar_path(self) -> Path:
        """Return the bundled fallback image."""
        return self.plugin_dir / "ui" / "Default.png"

    @staticmethod
    def seed_to_filename(seed: str) -> str:
        """Convert an arbitrary avatar seed to a safe cache filename."""
        digest = hashlib.md5(seed.encode("utf-8")).hexdigest()[:12]
        safe = "".join(
            character if character.isalnum() or character in "._-" else "_"
            for character in seed
        )[:20]
        return f"Avatar_{safe}_{digest}.png"

    def cached_avatar_path(self, seed: str) -> Path:
        """Return the cache path for one avatar seed."""
        return self.resource_dir() / self.seed_to_filename(seed)

    @staticmethod
    def fetch_avatar_png_online(seed: str) -> bytes:
        """Fetch a DiceBear PNG for one seed."""
        import httpx

        response = httpx.get(
            "https://api.dicebear.com/9.x/notionists/png",
            params={"seed": seed},
            timeout=5,
        )
        response.raise_for_status()
        return response.content

    def get_or_fetch_avatar_png(self, seed: str) -> Path:
        """Resolve an avatar from cache, network, or bundled fallback."""
        cached = self.cached_avatar_path(seed)
        if cached.is_file():
            return cached
        try:
            cached.write_bytes(self.fetch_avatar_png_online(seed))
            logger.info(
                "[%s] Fetched and cached avatar for seed '%s'",
                self.plugin_id,
                seed,
            )
            return cached
        except Exception as exc:
            logger.warning(
                "[%s] Failed to fetch avatar for seed '%s': %s",
                self.plugin_id,
                seed,
                exc,
            )
            default = self.default_avatar_path()
            if default.is_file():
                return default
            raise

    @staticmethod
    def preset_avatar_data() -> tuple[set[str], list[list[str]]]:
        """Derive warm-up inputs from the canonical team presets."""
        from .team.presets import PRESET_UGSCI_TEAMS

        teams = [
            [str(member["name"]) for member in team["members"]]
            for team in PRESET_UGSCI_TEAMS
        ]
        return {name for members in teams for name in members}, teams

    def collect_agent_names(self) -> list[str]:
        """Collect configured Agent display names."""
        names: list[str] = []
        try:
            from qwenpaw.config.config import load_agent_config
            from qwenpaw.config.utils import load_config

            config = load_config()
            for agent_id in config.agents.profiles:
                try:
                    agent_config = load_agent_config(agent_id)
                    if agent_config.name:
                        names.append(agent_config.name)
                except Exception:
                    continue
        except Exception as exc:
            logger.debug(
                "[%s] Could not collect agent names: %s",
                self.plugin_id,
                exc,
            )
        return names

    def prewarm_cache(self) -> None:
        """Warm individual and preset-team avatars in a background thread."""
        try:
            all_names, preset_teams = self.preset_avatar_data()
            all_names.update(self.collect_agent_names())
            logger.info(
                "[%s] Pre-warming %d avatar(s) in background...",
                self.plugin_id,
                len(all_names),
            )

            fetched = 0
            for name in all_names:
                try:
                    if self.get_or_fetch_avatar_png(name).is_file():
                        fetched += 1
                except Exception:
                    continue

            team_count = 0
            for members in preset_teams:
                try:
                    team_cache = self.team_cache_path(members)
                    if team_cache.is_file():
                        continue
                    team_cache.write_bytes(self.compose_team_avatar(members))
                    team_count += 1
                except Exception:
                    continue

            logger.info(
                "[%s] Avatar pre-warm complete: %d individual, %d teams",
                self.plugin_id,
                fetched,
                team_count,
            )
        except Exception as exc:
            logger.warning(
                "[%s] Avatar pre-warm failed: %s",
                self.plugin_id,
                exc,
            )

    @staticmethod
    def circle_mask(size: int):
        """Return a circular Pillow mask."""
        from PIL import Image, ImageDraw

        mask = Image.new("L", (size, size), 0)
        ImageDraw.Draw(mask).ellipse(
            (0, 0, size - 1, size - 1),
            fill=255,
        )
        return mask

    @classmethod
    def apply_circle_clip(
        cls,
        image,
        background_color=BACKGROUND_COLOR,
    ):
        """Crop an image into a circle."""
        from PIL import Image

        width, height = image.size
        size = min(width, height)
        result = Image.new("RGBA", (size, size), background_color)
        cropped = image.crop(
            (
                (width - size) // 2,
                (height - size) // 2,
                (width + size) // 2,
                (height + size) // 2,
            ),
        )
        result.paste(cropped, (0, 0), cls.circle_mask(size))
        return result

    @staticmethod
    def team_positions(
        count: int,
        radius: float,
        center_x: float,
        center_y: float,
    ) -> list[tuple[float, float]]:
        """Return evenly distributed avatar positions."""
        start = -math.pi / 2
        return [
            (
                center_x + radius * math.cos(start + 2 * math.pi * index / count),
                center_y + radius * math.sin(start + 2 * math.pi * index / count),
            )
            for index in range(count)
        ]

    def compose_team_avatar(self, seeds: list[str]) -> bytes:
        """Compose two to five member avatars into one PNG."""
        from PIL import Image, ImageDraw

        if not seeds:
            raise ValueError("at least one avatar seed is required")
        if len(seeds) == 1:
            return self.get_or_fetch_avatar_png(seeds[0]).read_bytes()
        seeds = seeds[:5]
        count = len(seeds)
        canvas = Image.new(
            "RGBA",
            (CANVAS_SIZE, CANVAS_SIZE),
            BACKGROUND_COLOR,
        )
        circle_radius = CANVAS_SIZE * 0.27
        icon_size = int(CANVAS_SIZE * 0.40)
        center = CANVAS_SIZE / 2
        positions = self.team_positions(
            count,
            circle_radius,
            center,
            center,
        )
        avatar_mask = self.circle_mask(icon_size)
        avatars: list[Any] = []
        for seed in seeds:
            image = Image.open(
                self.get_or_fetch_avatar_png(seed),
            ).convert("RGBA")
            image = image.resize((icon_size, icon_size), Image.LANCZOS)
            tile = Image.new("RGBA", (icon_size, icon_size))
            tile.paste(image, (0, 0), avatar_mask)
            ImageDraw.Draw(tile).ellipse(
                (0, 0, icon_size - 1, icon_size - 1),
                outline=(255, 255, 255, 220),
                width=5,
            )
            avatars.append(tile)

        for position, avatar in zip(positions, avatars):
            x = int(position[0] - icon_size / 2)
            y = int(position[1] - icon_size / 2)
            canvas.paste(avatar, (x, y), avatar)

        draw = ImageDraw.Draw(canvas)
        for first in range(count):
            for second in range(first + 1, count):
                draw.line(
                    [positions[first], positions[second]],
                    fill=(180, 190, 200, 60),
                    width=2,
                )

        buffer = BytesIO()
        self.apply_circle_clip(canvas).save(buffer, format="PNG")
        return buffer.getvalue()

    def team_cache_path(self, seeds: list[str]) -> Path:
        """Return the deterministic cache path for a team composition."""
        digest = hashlib.md5(
            ",".join(seeds).encode("utf-8"),
        ).hexdigest()[:12]
        return self.resource_dir() / f"TeamAvatar_{digest}.png"

    def build_router(self) -> APIRouter:
        """Build avatar and team-avatar HTTP routes."""
        router = APIRouter()

        @router.get("/{seed}")
        def get_avatar(seed: str) -> Response:
            try:
                path = self.get_or_fetch_avatar_png(seed)
            except Exception as exc:
                logger.error(
                    "[%s] Avatar serving failed for seed '%s': %s",
                    self.plugin_id,
                    seed,
                    exc,
                )
                path = self.default_avatar_path()
                if not path.is_file():
                    raise HTTPException(
                        status_code=500,
                        detail="Avatar unavailable",
                    ) from exc
            return FileResponse(
                str(path),
                media_type="image/png",
                headers={"Cache-Control": "public, max-age=3600"},
            )

        @router.get("/team/{team_id}")
        def get_team_avatar(team_id: str) -> Response:
            seeds = [seed.strip() for seed in team_id.split(",") if seed.strip()]
            if not seeds:
                raise HTTPException(
                    status_code=400,
                    detail="No seeds provided",
                )
            team_cache = self.team_cache_path(seeds)
            if team_cache.is_file():
                return FileResponse(
                    str(team_cache),
                    media_type="image/png",
                    headers={"Cache-Control": "public, max-age=3600"},
                )
            try:
                content = self.compose_team_avatar(seeds)
                team_cache.write_bytes(content)
                return Response(
                    content=content,
                    media_type="image/png",
                    headers={"Cache-Control": "public, max-age=3600"},
                )
            except Exception as exc:
                logger.error(
                    "[%s] Team avatar failed for seeds %s: %s",
                    self.plugin_id,
                    seeds,
                    exc,
                )
                try:
                    path = self.get_or_fetch_avatar_png(seeds[0])
                except Exception:
                    path = self.default_avatar_path()
                    if not path.is_file():
                        raise HTTPException(
                            status_code=500,
                            detail="Avatar unavailable",
                        ) from exc
                return FileResponse(
                    str(path),
                    media_type="image/png",
                    headers={"Cache-Control": "public, max-age=3600"},
                )

        return router


__all__ = ["AvatarService"]
