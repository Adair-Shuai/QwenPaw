# -*- coding: utf-8 -*-
from __future__ import annotations
from pathlib import Path

ROOT = Path(__file__).parents[4]
UI = ROOT / "plugins" / "bundle" / "ugsci" / "ui" / "src" / "derivation"


def test_workbench_frontend_contract_is_wired():
    panel = (UI / "UgsciDerivationPanel.tsx").read_text(encoding="utf-8")
    summary = (UI / "DerivationSummary.tsx").read_text(encoding="utf-8")
    store = (UI / "useDerivationStore.ts").read_text(encoding="utf-8")
    graph = (UI / "FlowGraph.tsx").read_text(encoding="utf-8")
    timeline = (UI / "Timeline.tsx").read_text(encoding="utf-8")
    inline = (
        ROOT
        / "plugins"
        / "bundle"
        / "ugsci"
        / "ui"
        / "src"
        / "genui"
        / "components"
        / "GenUiInline.tsx"
    ).read_text(encoding="utf-8")
    assert all(
        label in panel
        for label in ('"summary"', '"derivation"', '"evidence"', '"logs"')
    )
    assert 'React.useState("summary")' in panel
    assert all(
        label in summary
        for label in (
            "你最需要知道的",
            "边界与提醒",
            "公式身份",
            "参数来源",
            "单位审计",
            "显示原始日志",
            "复现计算",
        )
    )
    assert "buildDerivationPresentation" in summary
    assert "MAX_RECORDS = 128" in store
    assert (
        "sessionId" in store and ".slice(" in store and "MAX_RECORDS" in store
    )
    assert "replayDerivation" in store and "replayId" in store
    assert "records.some((item) => item.uiId === selected?.uiId)" in panel
    assert "可复现" in panel and "版本已变化" in panel
    assert "step.reads" in graph and "step.writes" in graph
    assert 'step.kind === "assert"' in timeline
    assert "只看关键步骤" in timeline
    assert "extractDerivations(output)" in inline
    assert 'snap.uiId.startsWith("ui_trc_")' in inline
    assert "traceTreePresentation" in inline
    assert 'node.kind === "MetricCard"' in inline
    assert 'cells[3] === "derived"' in inline
    assert "qwenpaw-derivation-inline" in inline
    assert "React.createElement(DerivationSummary" in inline
    assert "qwenpaw:open-compute-workbench" in inline


def test_host_has_dedicated_compute_slot_and_open_event():
    panels = (
        ROOT
        / "console"
        / "src"
        / "features"
        / "files-workspace"
        / "WorkbenchPanels.tsx"
    ).read_text(encoding="utf-8")
    drawer = (
        ROOT
        / "console"
        / "src"
        / "features"
        / "files-workspace"
        / "FilesDrawer.tsx"
    ).read_text(encoding="utf-8")
    chat = (
        ROOT / "console" / "src" / "pages" / "Chat" / "index.tsx"
    ).read_text(encoding="utf-8")
    genui = (
        ROOT
        / "plugins"
        / "bundle"
        / "ugsci"
        / "ui"
        / "src"
        / "genui"
        / "index.ts"
    ).read_text(encoding="utf-8")
    assert "chat.workbench.compute" in panels
    assert "suppressChildrenWhenFilled" in panels
    assert 'QP.slot.fill(PLUGIN_ID, "chat.workbench.compute"' in genui
    assert '"compute"' in drawer and "WorkbenchComputePanel" in drawer
    assert "qwenpaw:open-compute-workbench" in chat


def test_packaged_frontend_sources_match_bundle():
    bundled = (
        ROOT / "plugins" / "bundle" / "ugsci" / "ui" / "src" / "derivation"
    )
    packaged = (
        ROOT
        / "src"
        / "qwenpaw"
        / "plugins_bundle"
        / "ugsci"
        / "ui"
        / "src"
        / "derivation"
    )
    assert {p.name: p.read_bytes() for p in bundled.iterdir()} == {
        p.name: p.read_bytes() for p in packaged.iterdir()
    }
