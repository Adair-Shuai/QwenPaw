#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Test script: walk through the full UGSci simulation tool chain.

1. launch_simulation  — start Eclipse E300 with a test deck
2. check_simulation_status — monitor progress
3. read_simulation_results — read summary vectors
4. analyze_simulation — convergence + performance analysis
5. edit_simulation_deck — modify the deck (demonstration)

This script calls the actual tool functions registered by the UGSci plugin.
"""

import asyncio
import json
import sys
import os
from pathlib import Path

# Add src/ to path so we can import qwenpaw + plugin tools
repo_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(repo_root / "src"))

# The plugin modules live at src/qwenpaw/plugins_bundle/ugsci/
# and are imported as qwenpaw.plugins_bundle.ugsci.engine.tools.*


async def main():
    print("=" * 70)
    print("UGSci Simulation Tool Chain Test")
    print("=" * 70)

    deck_file = str(repo_root / "eclipse_test" / "SMOKE.DATA")
    working_dir = str(repo_root / "eclipse_test")

    # ── Step 1: Launch simulation ──────────────────────────────────
    print("\n[Step 1] launch_simulation")
    print(f"   simulator: eclipse")
    print(f"   deck_file: {deck_file}")
    print(f"   working_dir: {working_dir}")

    from qwenpaw.plugins_bundle.ugsci.engine.tools.launcher import launch_simulation

    result = await launch_simulation(
        simulator="eclipse",
        deck_file=deck_file,
        working_dir=working_dir,
        timeout=300,  # 5 min max
    )

    # Extract text from ToolChunk
    text = ""
    for block in result.content:
        if hasattr(block, "text"):
            text += block.text
    print(text)

    if result.state.value != "success":
        print("\n❌ Launch failed. Aborting.")
        return

    # Extract job_id from the text
    import re
    m = re.search(r"Job ID:\s+(\S+)", text)
    if not m:
        print("❌ Could not extract job_id from response.")
        return
    job_id = m.group(1)
    print(f"\n   → Extracted job_id: {job_id}")

    # ── Step 2: Wait and check status ──────────────────────────────
    print("\n[Step 2] Waiting for simulation to progress...")
    await asyncio.sleep(5)

    print("\n[Step 2] check_simulation_status")
    from qwenpaw.plugins_bundle.ugsci.engine.tools.monitor import (
        check_simulation_status,
    )

    result = await check_simulation_status(
        job_id=job_id,
        detail_level="convergence",
    )
    text = ""
    for block in result.content:
        if hasattr(block, "text"):
            text += block.text
    print(text)

    # Wait for completion (check every 5 seconds, max 120 seconds)
    print("\nWaiting for completion...")
    for i in range(24):
        await asyncio.sleep(5)
        result = await check_simulation_status(
            job_id=job_id,
            detail_level="summary",
        )
        text = ""
        for block in result.content:
            if hasattr(block, "text"):
                text += block.text
        status_line = [l for l in text.splitlines() if "Status:" in l]
        if status_line:
            print(f"   [{(i+1)*5}s] {status_line[0].strip()}")

        if "completed" in text.lower() or "failed" in text.lower():
            break

    # ── Step 3: Read simulation results ────────────────────────────
    print("\n[Step 3] read_simulation_results")
    from qwenpaw.plugins_bundle.ugsci.engine.tools.result_reader import (
        read_simulation_results,
    )

    result = await read_simulation_results(
        job_id=job_id,
        data_type="summary",
    )
    text = ""
    for block in result.content:
        if hasattr(block, "text"):
            text += block.text
    print(text)

    # Also read report
    print("\n[Step 3b] read_simulation_results (report)")
    result = await read_simulation_results(
        job_id=job_id,
        data_type="report",
    )
    text = ""
    for block in result.content:
        if hasattr(block, "text"):
            text += block.text
    # Print last 30 lines of report
    lines = text.splitlines()
    if len(lines) > 35:
        print("\n".join(lines[:5]) + "\n  ...")
        print("\n".join(lines[-30:]))
    else:
        print(text)

    # ── Step 4: Analyze simulation ─────────────────────────────────
    print("\n[Step 4a] analyze_simulation (convergence)")
    from qwenpaw.plugins_bundle.ugsci.engine.tools.analyzer import (
        analyze_simulation,
    )

    result = await analyze_simulation(
        job_id=job_id,
        analysis_type="convergence",
    )
    text = ""
    for block in result.content:
        if hasattr(block, "text"):
            text += block.text
    print(text)

    print("\n[Step 4b] analyze_simulation (performance)")
    result = await analyze_simulation(
        job_id=job_id,
        analysis_type="performance",
    )
    text = ""
    for block in result.content:
        if hasattr(block, "text"):
            text += block.text
    print(text)

    print("\n[Step 4c] analyze_simulation (balance)")
    result = await analyze_simulation(
        job_id=job_id,
        analysis_type="balance",
    )
    text = ""
    for block in result.content:
        if hasattr(block, "text"):
            text += block.text
    print(text)

    # ── Step 5: Edit deck (demonstration) ──────────────────────────
    print("\n[Step 5] edit_simulation_deck (change BHP limit)")
    from qwenpaw.plugins_bundle.ugsci.engine.tools.deck_editor import (
        edit_simulation_deck,
    )

    result = await edit_simulation_deck(
        deck_file=deck_file,
        keyword="WCONPROD",
        action="replace",
        content=(
            "WCONPROD\n"
            " 'PROD1' 'OPEN' 'BHP' 1000 10000 10000 10000 10000 3000 /\n"
            "/"
        ),
        working_dir=working_dir,
    )
    text = ""
    for block in result.content:
        if hasattr(block, "text"):
            text += block.text
    print(text)

    print("\n" + "=" * 70)
    print("[DONE] Full simulation tool chain test completed!")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(main())
