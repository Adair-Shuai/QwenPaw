# -*- coding: utf-8 -*-
"""Agent tools sharing the same engine as the production analysis workbench."""

from __future__ import annotations

import json
import uuid
from typing import Any

from ..common.tool_chunk import emit_tool_chunk
from .analysis import analyze, markdown_report
from .store import DatasetStore


def save_report(store: DatasetStore, result: dict) -> dict:
    root = store.path(result["dataset_id"]) / "reports" / uuid.uuid4().hex
    root.mkdir(parents=True, exist_ok=False)
    text = markdown_report(result)
    (root / "analysis.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2, allow_nan=False),
        encoding="utf-8",
    )
    (root / "report.md").write_text(text, encoding="utf-8")
    return {
        "report_id": root.name,
        "report_path": str(root / "report.md"),
        "analysis_path": str(root / "analysis.json"),
        "markdown": text,
    }


async def ugsci_storage_history_import(input_path: str) -> Any:
    """导入本地储气库注采气 XLS/XLSX/UTF-8 CSV 文件或目录，保留原件并检查缺测、重复、单位及 XLS 截断。

    Args:
        input_path: 用户提供的原始文件或目录绝对路径。
    """
    import asyncio

    try:
        manifest = await asyncio.to_thread(
            DatasetStore().import_path,
            input_path,
        )
        return emit_tool_chunk(
            {
                "ok": True,
                "dataset_id": manifest["id"],
                "records": manifest["records"],
                "facilities": manifest["facilities"],
                "quality_counts": manifest["quality_counts"],
                "quality_examples": manifest["quality_examples"][:20],
                "source_columns": manifest["sources"],
                "reused": manifest["reused"],
            },
        )
    except (ValueError, OSError) as exc:
        return emit_tool_chunk({"ok": False, "error": str(exc)}, error=True)


async def ugsci_storage_dynamics_analyze(
    dataset_id: str,
    facility: str = "",
    well: str = "",
    start: str = "",
    end: str = "",
    cycle_start_month: int = 4,
    drop_threshold_pct: float = 30,
) -> Any:
    """分析导入数据的注采动态、气年度、压力响应、异常与同工况短期基线，并保存可追溯报告。

    Args:
        dataset_id: 导入工具返回的数据集 ID。
        facility: 储气库原名，空表示全部。
        well: 井号原名，空表示全部，不自动合并别名。
        start: 起始日期 YYYY-MM-DD，空表示最早记录。
        end: 截止日期 YYYY-MM-DD，空表示最新记录。
        cycle_start_month: 气年度起始月份 1 至 12，默认 4，仅为分组参数。
        drop_threshold_pct: 同阶段末 7 日与前 7 日折算量下降筛查阈值百分比，默认 30。
    """
    import asyncio

    def run():
        store = DatasetStore()
        result = analyze(
            store,
            dataset_id,
            facility,
            well,
            start,
            end,
            cycle_start_month,
            drop_threshold_pct,
        )
        files = save_report(store, result)
        # Keep model context bounded; complete results are persisted
        # as artifacts.
        return {
            "ok": True,
            "summary": result["summary"],
            "coverage": result["coverage"],
            "cycles_recent": sorted(
                result["cycles"],
                key=lambda c: (c["gas_year"], c["facility"]),
            )[-20:],
            "anomalies": result["anomalies"][:20],
            "forecast_wells": [r for r in result["wells"] if r["forecast"]][
                :30
            ],
            "warnings": result["warnings"],
            "parameters": result["parameters"],
            "quality_counts": result["quality"]["import_counts"],
            "quality_examples": result["quality"]["examples"][:20],
            "report_path": files["report_path"],
            "analysis_path": files["analysis_path"],
        }

    try:
        return emit_tool_chunk(await asyncio.to_thread(run))
    except (ValueError, OSError) as exc:
        return emit_tool_chunk({"ok": False, "error": str(exc)}, error=True)


async def ugsci_storage_history_list() -> Any:
    """列出已导入的储气库历史数据集，返回数据集 ID、库井数量与日期覆盖。"""
    return emit_tool_chunk(
        {
            "ok": True,
            "datasets": [
                {
                    **{
                        k: m[k]
                        for k in (
                            "id",
                            "name",
                            "records",
                            "facilities",
                            "quality_counts",
                        )
                    },
                    "quality_examples": m["quality_examples"][:20],
                }
                for m in DatasetStore().list()
            ],
            "quality_code_meaning": {
                "invalid_range": "数值超出合法范围；具体字段、原值与原表位置见 quality_examples",
                "invalid_identity": "无效日期或库井标识",
                "xls_row_limit": "达到 XLS 行上限，疑似导出截断",
            },
        },
    )
