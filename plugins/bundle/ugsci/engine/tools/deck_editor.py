# -*- coding: utf-8 -*-
"""edit_simulation_deck — structured editing of simulator input files.

Supports section/keyword-level editing for Eclipse .DATA files and
basic line-level editing for CMG / COMSOL input files.
"""
from __future__ import annotations

from pathlib import Path
from typing import Any

import logging
_logger = logging.getLogger("qwenpaw.plugin.ugsci.sim")


async def edit_simulation_deck(
    deck_file: str,
    keyword: str,
    action: str = "replace",
    content: str = "",
    section: str = "",
    working_dir: str = "",
) -> Any:
    """Edit a simulator input file at the keyword level.

    For Eclipse ``.DATA`` files, this locates the keyword (e.g.
    ``WELSPECS``, ``WCONPROD``, ``PERMX``) and performs the requested
    action.  For other file types, a simpler find-and-replace is used.

    Args:
        deck_file (`str`):
            Path to the input file.  Relative paths resolve from the
            agent workspace.
        keyword (`str`):
            The keyword to locate (e.g. ``"WCONPROD"``, ``"PERMX"``).
        action (`str`):
            One of:
            - ``"replace"``: Replace the keyword block with *content*.
            - ``"append"``: Append *content* after the keyword block.
            - ``"insert"``: Insert *content* before the keyword block.
            - ``"remove"``: Remove the keyword block entirely.
        content (`str`):
            New content for the keyword block (used by replace/append/insert).
        section (`str`):
            Optional section hint (e.g. ``"SCHEDULE"``, ``"PROPS"``).
            Used for validation only — the editor searches the whole file.
        working_dir (`str`):
            Working directory for resolving relative paths.

    Returns:
        ``ToolChunk``: Confirmation of the edit with a summary.
    """
    from agentscope.message import TextBlock, ToolResultState
    from agentscope.tool import ToolChunk

    # ── Resolve file path ────────────────────────────────────────────
    deck_path = Path(deck_file)
    if not deck_path.is_absolute():
        if working_dir:
            deck_path = Path(working_dir) / deck_file
        else:
            try:
                from qwenpaw.config.context import get_current_workspace_dir
                deck_path = get_current_workspace_dir() / deck_file
            except Exception:
                deck_path = Path(deck_file)

    if not deck_path.exists():
        return ToolChunk(
            is_last=True,
            state=ToolResultState.ERROR,
            content=[
                TextBlock(
                    type="text",
                    text=f"Error: File not found: {deck_path}",
                ),
            ],
        )

    # ── Read file ────────────────────────────────────────────────────
    try:
        text = deck_path.read_text(encoding="utf-8", errors="replace")
    except Exception as exc:
        return ToolChunk(
            is_last=True,
            state=ToolResultState.ERROR,
            content=[
                TextBlock(
                    type="text",
                    text=f"Error: Failed to read file: {exc}",
                ),
            ],
        )

    lines = text.splitlines(keepends=True)
    keyword_upper = keyword.upper().strip()

    # ── Locate keyword block ─────────────────────────────────────────
    start_idx = None
    end_idx = None

    for i, line in enumerate(lines):
        stripped = line.strip().upper()
        if stripped == keyword_upper or stripped.startswith(keyword_upper):
            start_idx = i
            continue
        if start_idx is not None and end_idx is None:
            # End of block: next keyword or "/" on its own line
            next_stripped = line.strip()
            if next_stripped == "/":
                end_idx = i + 1
            elif (
                next_stripped
                and not next_stripped.startswith("--")
                and next_stripped.split()[0].isupper()
                and next_stripped.upper() != keyword_upper
            ):
                end_idx = i

    if start_idx is None:
        return ToolChunk(
            is_last=True,
            state=ToolResultState.ERROR,
            content=[
                TextBlock(
                    type="text",
                    text=f"Error: Keyword '{keyword}' not found in {deck_path.name}.",
                ),
            ],
        )

    if end_idx is None:
        end_idx = len(lines)

    # ── Perform action ───────────────────────────────────────────────
    block_lines = lines[start_idx:end_idx]
    original_block = "".join(block_lines).strip()

    new_content_lines = content.splitlines(keepends=True) if content else []
    # Ensure trailing newline
    if new_content_lines and not new_content_lines[-1].endswith("\n"):
        new_content_lines[-1] += "\n"

    if action == "replace":
        new_lines = lines[:start_idx] + new_content_lines + lines[end_idx:]
    elif action == "append":
        new_lines = lines[:end_idx] + new_content_lines + lines[end_idx:]
    elif action == "insert":
        new_lines = lines[:start_idx] + new_content_lines + lines[start_idx:]
    elif action == "remove":
        new_lines = lines[:start_idx] + lines[end_idx:]
    else:
        return ToolChunk(
            is_last=True,
            state=ToolResultState.ERROR,
            content=[
                TextBlock(
                    type="text",
                    text=f"Error: Unknown action '{action}'. Use replace/append/insert/remove.",
                ),
            ],
        )

    # ── Write file ───────────────────────────────────────────────────
    new_text = "".join(new_lines)
    try:
        deck_path.write_text(new_text, encoding="utf-8")
    except Exception as exc:
        return ToolChunk(
            is_last=True,
            state=ToolResultState.ERROR,
            content=[
                TextBlock(
                    type="text",
                    text=f"Error: Failed to write file: {exc}",
                ),
            ],
        )

    # ── Build response ───────────────────────────────────────────────
    lines_changed = abs(len(new_lines) - len(lines))

    summary_parts = [
        f"Deck file edited: {deck_path.name}",
        f"  Keyword:  {keyword}",
        f"  Action:   {action}",
        f"  Lines changed: {lines_changed}",
    ]

    if action == "replace":
        summary_parts.append(f"  Original block ({len(block_lines)} lines):")
        for line in original_block.splitlines()[:5]:
            summary_parts.append(f"    - {line}")
        if len(block_lines) > 5:
            summary_parts.append(f"    ... ({len(block_lines) - 5} more lines)")
        summary_parts.append(f"  New content ({len(new_content_lines)} lines):")
        for line in content.splitlines()[:5]:
            summary_parts.append(f"    + {line}")
        if len(new_content_lines) > 5:
            summary_parts.append(f"    ... ({len(new_content_lines) - 5} more lines)")
    elif action == "remove":
        summary_parts.append(f"  Removed {len(block_lines)} lines.")
    else:
        summary_parts.append(f"  Added {len(new_content_lines)} lines.")

    return ToolChunk(
        is_last=True,
        state=ToolResultState.SUCCESS,
        content=[TextBlock(type="text", text="\n".join(summary_parts))],
    )
