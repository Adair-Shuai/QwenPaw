# -*- coding: utf-8 -*-
"""edit_simulation_deck — structured editing of simulator input files.

Supports section/keyword-level editing for Eclipse .DATA files and
basic line-level editing for CMG / COMSOL input files.
"""
from __future__ import annotations

import os
import tempfile
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
            When provided, the search is limited to lines within that
            section, preventing accidental edits in other sections.
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
    deck_path = deck_path.expanduser().resolve()

    # BUG-001: Verify deck file is within the workspace boundary.
    from .launcher import _ensure_path_in_workspace
    _ensure_path_in_workspace(deck_path)

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

    # ── Determine section boundaries ─────────────────────────────────
    # BUG-013: When section is specified, limit the keyword search to
    # lines within that section rather than scanning the entire file.
    search_start = 0
    search_end = len(lines)
    if section:
        section_upper = section.upper().strip()
        section_start = None
        section_end = None
        for i, line in enumerate(lines):
            stripped = line.strip().upper()
            # BUG-013: Use exact token matching for section headers too,
            # not startswith — same principle as keyword matching above.
            first_token = stripped.split()[0] if stripped.split() else ""
            if first_token == section_upper:
                if section_start is None:
                    section_start = i
            elif section_start is not None:
                # Detect end of section (next top-level keyword that is
                # not a continuation of data lines)
                if (
                    stripped
                    and not stripped.startswith("--")
                    and stripped.split()[0].isupper()
                    and stripped.split()[0] != section_upper
                ):
                    section_end = i
                    break
        if section_start is not None:
            search_start = section_start
            search_end = section_end if section_end is not None else len(lines)
        # If section not found, fall back to full-file search with a warning
        else:
            _logger.warning(
                "Section '%s' not found in %s; searching entire file",
                section_upper,
                deck_path.name,
            )

    # ── Locate keyword block ─────────────────────────────────────────
    # BUG-013: Use exact token matching instead of startswith() to avoid
    # matching PERMX when searching for PERM, or PERMX2 when searching
    # for PERMX.
    start_idx = None
    end_idx = None

    for i in range(search_start, search_end):
        line = lines[i]
        stripped = line.strip().upper()
        if not stripped or stripped.startswith("--"):
            continue

        # Exact match: the first token equals the keyword (allowing
        # trailing comments or whitespace)
        first_token = stripped.split()[0] if stripped.split() else ""
        if first_token == keyword_upper:
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
                and next_stripped.split()
                and next_stripped.split()[0].isupper()
                and next_stripped.split()[0] != keyword_upper
            ):
                end_idx = i

    if start_idx is None:
        return ToolChunk(
            is_last=True,
            state=ToolResultState.ERROR,
            content=[
                TextBlock(
                    type="text",
                    text=(
                        f"Error: Keyword '{keyword}' not found"
                        + (f" in section '{section}'" if section else "")
                        + f" in {deck_path.name}."
                    ),
                ),
            ],
        )

    if end_idx is None:
        end_idx = len(lines) if search_end == len(lines) else search_end

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

    # ── Write file atomically ────────────────────────────────────────
    # BUG-013: Use a temporary file + os.replace() so an interrupted
    # write does not leave a partially-written (and potentially corrupt)
    # deck file.
    new_text = "".join(new_lines)
    try:
        dir_path = deck_path.parent
        fd, tmp_path = tempfile.mkstemp(
            dir=str(dir_path),
            prefix=deck_path.stem + ".",
            suffix=".tmp",
        )
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as tmp_file:
                tmp_file.write(new_text)
            os.replace(tmp_path, deck_path)
        except Exception:
            # Clean up the temp file if the write or replace failed
            try:
                os.unlink(tmp_path)
            except OSError:
                pass
            raise
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
