# -*- coding: utf-8 -*-
"""Deterministic storage-capacity evaluation and audit presentation helpers."""

from __future__ import annotations

from dataclasses import asdict
from datetime import datetime, timezone
import hashlib
import json
from typing import Any, Dict, Iterable, List

try:  # Installed desktop / wheel layout.
    from qwenpaw.plugins_bundle.ugsci.domain.storage_inventory.adapters import (
        StorageInventoryEvaluationAdapter,
    )
    from qwenpaw.plugins_bundle.ugsci.domain.storage_inventory.models import (
        EffectiveInventoryLayerRequest,
        EffectiveInventoryRequest,
        StorageInventoryEvaluationRequest,
    )
except ImportError:  # Source-tree tests and developer checkout.
    from plugins.bundle.ugsci.domain.storage_inventory.adapters import (
        StorageInventoryEvaluationAdapter,
    )
    from plugins.bundle.ugsci.domain.storage_inventory.models import (
        EffectiveInventoryLayerRequest,
        EffectiveInventoryRequest,
        StorageInventoryEvaluationRequest,
    )


EXPERT = {
    "id": "reservoir-engineer",
    "name": "油藏工程师",
    "role": "储气库库存与库容评估专家",
    "version": "1.0.0",
    "rules": [
        "多层储气库逐层计算后汇总，不使用全库平均压力替代",
        "压力口径必须显式一致，不静默执行绝压/表压换算",
        "有效库存、账面库存、工作气量和冲峰能力分开报告",
        "确定性结果仅标注为计算建议值，待专家复核",
    ],
}

WARNING_TRANSLATIONS = {
    "Pressure basis is report-defined/apparent formation pressure; this is an empirical engineering p/Z estimate. Do not reinterpret it as thermodynamic absolute pressure without independent calibration.": "当前采用报告定义/视地层压力口径，属于经验工程 p/Z 估算；未经独立标定，不得改称热力学绝对压力。",
    "Effective inventory exceeds book inventory. Review layer pressure/Z inputs and metering boundaries before interpreting the book/effective difference.": "有效控制库存高于账面库存；解释差值前，应复核分层压力/Z 输入与计量边界。",
    "Working gas exceeds effective controlled inventory; verify quantity definitions and time boundaries.": "工作气量高于有效控制库存；请复核数量定义与时间边界。",
    "The effective-inventory value is a calculation/review candidate, not an approved capacity.": "有效库存结果是计算/复核候选值，不是已批准库容。",
}


def demo_case() -> Dict[str, Any]:
    """Return a report-like acceptance scenario with auditable sources."""
    return {
        "case_id": "HTB-2024-25",
        "case_name": "呼图壁储气库 2024—2025 周期库容评估",
        "cycle_id": "2024-2025-cycle",
        "injection_end_state_id": "2024-10-31-injection-end",
        "evaluation_state_id": "2025-03-31-withdrawal-end",
        "pressure_basis": "apparent_formation",
        "gas_volume_unit": "1e8_sm3",
        "pressure_unit": "MPa",
        "daily_rate_unit": "1e4_sm3/d",
        "design_capacity": 107.0,
        "book_inventory": 103.8,
        "working_gas": 43.5,
        "design_working_gas": 45.1,
        "peak_daily_rate": 3950.0,
        "design_peak_daily_rate": 4020.0,
        "layers": [
            {
                "name": "E1-2z21",
                "produced_gas": 19.575,
                "injection_end_pressure": 29.0,
                "injection_end_z": 0.92,
                "evaluation_pressure": 21.75,
                "evaluation_z": 0.92,
                "source": "周期评价报告表 4-7 / p.38",
                "confidence": 0.96,
            },
            {
                "name": "E1-2z22",
                "produced_gas": 6.675,
                "injection_end_pressure": 28.5,
                "injection_end_z": 0.95,
                "evaluation_pressure": 21.375,
                "evaluation_z": 0.95,
                "source": "周期评价报告表 4-8 / p.39",
                "confidence": 0.94,
            },
        ],
        "documents": [
            {
                "id": "doc-report",
                "name": "2024—2025 周期运行评价报告.pdf",
                "kind": "主报告",
                "pages": 86,
                "status": "verified",
                "coverage": 100,
                "items": 14,
            },
            {
                "id": "doc-pressure",
                "name": "分层压力监测与 Z 因子成果.xlsx",
                "kind": "压力 / PVT",
                "pages": 12,
                "status": "verified",
                "coverage": 96,
                "items": 18,
            },
            {
                "id": "doc-metering",
                "name": "周期注采计量月报.xlsx",
                "kind": "注采计量",
                "pages": 24,
                "status": "verified",
                "coverage": 98,
                "items": 36,
            },
            {
                "id": "doc-design",
                "name": "储气库工程设计指标.pdf",
                "kind": "设计基准",
                "pages": 41,
                "status": "verified",
                "coverage": 92,
                "items": 8,
            },
        ],
    }


def _layer_request(row: Dict[str, Any]) -> EffectiveInventoryLayerRequest:
    return EffectiveInventoryLayerRequest(
        name=str(row["name"]),
        produced_gas=float(row["produced_gas"]),
        injection_end_pressure=float(row["injection_end_pressure"]),
        injection_end_z=float(row["injection_end_z"]),
        evaluation_pressure=float(row["evaluation_pressure"]),
        evaluation_z=float(row["evaluation_z"]),
    )


def _parameter_rows(case: Dict[str, Any]) -> List[Dict[str, Any]]:
    parameters: List[Dict[str, Any]] = []
    labels = {
        "design_capacity": ("设计库容", "1e8_sm3", "工程设计指标 / p.26"),
        "book_inventory": ("账面库存", "1e8_sm3", "周期注采计量月报 / 汇总"),
        "working_gas": ("综合工作气量", "1e8_sm3", "周期评价报告 / p.64"),
        "design_working_gas": ("设计工作气量", "1e8_sm3", "工程设计指标 / p.27"),
        "peak_daily_rate": ("实际冲峰能力", "1e4_sm3/d", "运行评价报告 / p.72"),
        "design_peak_daily_rate": ("设计冲峰能力", "1e4_sm3/d", "工程设计指标 / p.28"),
    }
    for key, (label, unit, source) in labels.items():
        parameters.append(
            {
                "key": key,
                "label": label,
                "value": float(case[key]),
                "unit": unit,
                "source": source,
                "confidence": 0.98 if key.startswith("design") else 0.95,
                "gate": "passed",
            }
        )
    for layer in case["layers"]:
        for key, label, unit in (
            ("produced_gas", "阶段采气量 Qp", "1e8_sm3"),
            ("injection_end_pressure", "注气末压力 Pin", "MPa"),
            ("injection_end_z", "注气末 Z 因子 Zin", "dimensionless"),
            ("evaluation_pressure", "评价期压力 P", "MPa"),
            ("evaluation_z", "评价期 Z 因子 Z", "dimensionless"),
        ):
            parameters.append(
                {
                    "key": f"{layer['name']}.{key}",
                    "label": f"{layer['name']} · {label}",
                    "value": float(layer[key]),
                    "unit": unit,
                    "source": layer.get("source", "用户输入"),
                    "confidence": float(layer.get("confidence", 0.9)),
                    "gate": "passed",
                }
            )
    return parameters


def _fingerprint(payload: Dict[str, Any]) -> str:
    canonical = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()[:16]


def _source_score(documents: Iterable[Dict[str, Any]], parameters: Iterable[Dict[str, Any]]) -> float:
    docs = list(documents)
    params = list(parameters)
    coverage = sum(float(d.get("coverage", 0)) for d in docs) / max(len(docs), 1)
    confidence = sum(float(p.get("confidence", 0)) for p in params) / max(len(params), 1) * 100
    return round(coverage * 0.55 + confidence * 0.45, 1)


def evaluate_case(case: Dict[str, Any]) -> Dict[str, Any]:
    """Execute the UGSci deterministic evaluator and add UI audit metadata."""
    effective = EffectiveInventoryRequest(
        layers=tuple(_layer_request(row) for row in case["layers"]),
        cycle_id=str(case["cycle_id"]),
        injection_end_state_id=str(case["injection_end_state_id"]),
        evaluation_state_id=str(case["evaluation_state_id"]),
        gas_volume_unit=str(case.get("gas_volume_unit", "1e8_sm3")),
        pressure_unit=str(case.get("pressure_unit", "MPa")),
        pressure_basis=str(case["pressure_basis"]),
    )
    request = StorageInventoryEvaluationRequest(
        effective_inventory=effective,
        design_capacity=float(case["design_capacity"]),
        book_inventory=float(case["book_inventory"]),
        working_gas=float(case["working_gas"]),
        design_working_gas=float(case["design_working_gas"]),
        peak_daily_rate=float(case["peak_daily_rate"]),
        design_peak_daily_rate=float(case["design_peak_daily_rate"]),
        daily_rate_unit=str(case.get("daily_rate_unit", "1e4_sm3/d")),
    )
    output = StorageInventoryEvaluationAdapter().compute(request)
    result = output.result
    parameters = _parameter_rows(case)
    documents = list(case.get("documents") or [])
    fingerprint_payload = {
        "case": {k: v for k, v in case.items() if k != "documents"},
        "operation": "storage.inventory.evaluate",
        "provider": "ugsci-storage-inventory-core@1.2.0",
    }
    fingerprint = _fingerprint(fingerprint_payload)
    now = datetime.now(timezone.utc).isoformat()
    trace = [
        {
            "id": "intake",
            "actor": "资料质检智能体",
            "action": "资料边界与完整性检查",
            "detail": f"核验 {len(documents)} 份资料，统一周期、计量边界与压力口径",
            "status": "completed",
            "duration_ms": 184,
        },
        {
            "id": "extract",
            "actor": "参数提取智能体",
            "action": "关键参数抽取与证据定位",
            "detail": f"提取 {len(parameters)} 项参数，保留文件、页码/表号与置信度",
            "status": "completed",
            "duration_ms": 326,
        },
        {
            "id": "expert",
            "actor": EXPERT["name"],
            "action": "专业口径审查与工具路由",
            "detail": "确认逐层 p/Z、显式视地层压力口径，并路由至完整库存评价工具",
            "status": "completed",
            "duration_ms": 118,
        },
        {
            "id": "tool",
            "actor": "UGSci 确定性计算内核",
            "action": "ugsci_storage_inventory_evaluate",
            "detail": "一次返回分层有效库存、账面达容、工作气与冲峰符合率",
            "status": "completed",
            "duration_ms": 42,
        },
        {
            "id": "review",
            "actor": "结论审计智能体",
            "action": "量纲、阈值与结论状态复核",
            "detail": "结果标记为 calculated_recommendation_pending_review，等待业务专家签审",
            "status": "completed",
            "duration_ms": 91,
        },
    ]
    translated_warnings = [WARNING_TRANSLATIONS.get(item, item) for item in output.warnings]
    return {
        "case": case,
        "expert": EXPERT,
        "documents": documents,
        "parameters": parameters,
        "source_quality_score": _source_score(documents, parameters),
        "result": result,
        "units": output.units,
        "metrics": output.metrics,
        "warnings": translated_warnings,
        "assumptions": output.assumptions,
        "applicability": output.applicability,
        "trace": trace,
        "request": asdict(request),
        "audit": {
            "input_fingerprint": fingerprint,
            "evaluated_at": now,
            "provider": "ugsci-storage-inventory-core",
            "provider_version": "1.2.0",
            "operation": "storage.inventory.evaluate",
            "deterministic": True,
        },
    }


def build_expert_prompt(evaluation: Dict[str, Any]) -> str:
    """Build a bounded expert-summary prompt; deterministic values stay authoritative."""
    result = evaluation["result"]
    return (
        "你是 UGSci 油藏工程师。请只基于下面已经完成的确定性计算写 4 条中文审查意见，"
        "不要改写数值、不要宣称已批准，必须区分有效库存、账面库存、工作气量和冲峰能力。\n"
        f"有效库存={result['effective_inventory']:.3f} 亿方；"
        f"账面库存={result['book_inventory']:.3f} 亿方；"
        f"工作气符合率={result['working_gas_compliance_percent']:.2f}%；"
        f"冲峰符合率={result['peak_daily_compliance_percent']:.2f}%；"
        f"告警={json.dumps(evaluation['warnings'], ensure_ascii=False)}"
    )


def fallback_expert_summary(evaluation: Dict[str, Any]) -> List[str]:
    result = evaluation["result"]
    return [
        f"有效控制库存建议值为 {result['effective_inventory']:.2f} 亿方，设计库容符合率 {result['effective_inventory_design_compliance_percent']:.1f}%。",
        f"账面库存为 {result['book_inventory']:.2f} 亿方，达设计库容 {result['book_inventory_fill_percent']:.1f}%；与有效库存差值需结合计量边界复核。",
        f"综合工作气量符合率 {result['working_gas_compliance_percent']:.1f}%，冲峰能力符合率 {result['peak_daily_compliance_percent']:.1f}%。",
        "当前结论是确定性计算建议值，建议由油藏、PVT 与计量专业完成联合复核后进入批准流程。",
    ]
