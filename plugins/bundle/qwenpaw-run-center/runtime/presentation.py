# -*- coding: utf-8 -*-
"""Bounded, declarative views over existing Run data; never an execution \
plan."""
from __future__ import annotations

import json
import math
import re
import sqlite3
from typing import Any

from fastapi import Request
from agentscope.tool import ToolChunk

from .models import TERMINAL_STATUSES
from .repository import RunRepository, _now

TASK_TYPES = (
    "auto",
    "simulation",
    "comparison",
    "analysis",
    "workflow",
    "report",
    "data_import",
)
PANEL_KINDS = (
    "overview",
    "metrics",
    "curves",
    "fields",
    "stages",
    "table",
    "artifacts",
    "provenance",
)
MAX_CONTEXT_BYTES = 256 * 1024
PANEL_CATALOG = [
    {"kind": kind, "data_source": source, "options": options}
    for kind, source, options in (
        ("overview", "run lifecycle and verified task metadata", []),
        (
            "metrics",
            "verified Run/stage/result metrics and collected "
            "simulation metrics",
            ["metric_ids"],
        ),
        (
            "curves",
            "verified structured result series and collected "
            "simulation series",
            ["series_ids"],
        ),
        ("fields", "published simulation field datasets", ["property"]),
        ("stages", "persisted run stages", []),
        ("table", "registered structured results", []),
        ("artifacts", "registered run artifacts", []),
        ("provenance", "persisted run provenance", []),
    )
]
PROMPT = (
    "Run Center presentation: when a task benefits from a "
    "tailored live view, call\n"
    "get_run_presentation(run_id), then "
    "set_run_presentation(run_id, plan, expected_revision).\n"
    "Choose panels and selectors from its catalog and available "
    "bindings according to the\n"
    "user's task. The plan selects how existing run data is "
    "displayed; it contains no\n"
    "numerical results, URLs, commands, code, or executable "
    "expressions. Never invent\n"
    "results or units. Missing data stays pending. Keep the "
    "user's focus in title/objective,\n"
    "and prefer a few relevant panels. This updates presentation "
    "only, never starts,\n"
    "resumes, cancels, or modifies a calculation. Do not call "
    "repeatedly for data updates;\n"
    "the runtime refreshes bound data independently. OpenUI can "
    "present the saved view.\n"
)


class RevisionConflict(ValueError):
    pass


def _object(value: Any, keys: set[str], name: str) -> dict[str, Any]:
    if not isinstance(value, dict) or set(value) - keys:
        raise ValueError(
            f"{name}"
            f" must be an object containing only "
            f"{', '.join(sorted(keys))}",
        )
    return value


def _text(
    value: Any,
    name: str,
    maximum: int,
    *,
    identifier: bool = False,
) -> str:
    if not isinstance(value, str) or not value.strip() or len(value) > maximum:
        raise ValueError(
            f"{name} must be nonempty text of at most {maximum} characters",
        )
    value = value.strip()
    if any(ord(char) < 32 for char in value) or re.search(
        r"[<>`]|(?:https?|file|javascript|data):|://",
        value,
        re.I,
    ):
        raise ValueError(
            f"{name} must be plain text, without markup, URLs, or code",
        )
    if identifier and not re.fullmatch(r"[\w.:-]+", value, re.UNICODE):
        raise ValueError(
            f"{name} must be an identifier, not a path or expression",
        )
    return value


def _normalize_panel_options(kind: str, raw_options: Any) -> dict[str, Any]:
    """Validate panel selections without permitting expression fields."""
    allowed = {
        "curves": {"series_ids"},
        "metrics": {"metric_ids"},
        "fields": {"property"},
    }.get(kind, set())
    options = _object(raw_options, allowed, "panel.options")
    normalized_options: dict[str, Any] = {}
    for key, selection in options.items():
        if key == "property":
            normalized_options[key] = _text(selection, key, 160)
        else:
            if (
                not isinstance(selection, list)
                or not 1 <= len(selection) <= 32
            ):
                raise ValueError(f"{key} must contain 1 to 32 IDs")
            entries = [_text(entry, key, 160) for entry in selection]
            if len(set(entries)) != len(entries):
                raise ValueError(f"{key} must contain unique IDs")
            normalized_options[key] = entries
    return normalized_options


def validate_plan(value: Any) -> dict[str, Any]:
    value = _object(
        value,
        {"version", "task_type", "title", "objective", "layout", "panels"},
        "plan",
    )
    if type(value.get("version")) is not int or value["version"] != 1:
        raise ValueError("plan.version must be 1")
    if value.get("task_type") not in TASK_TYPES or value.get("layout") not in (
        "stack",
        "tabs",
        "dashboard",
    ):
        raise ValueError("Unknown task_type or layout")
    panels = value.get("panels")
    if not isinstance(panels, list) or not 1 <= len(panels) <= len(
        PANEL_KINDS,
    ):
        raise ValueError("plan.panels must contain 1 to 8 panels")
    result = {key: value[key] for key in ("version", "task_type", "layout")}
    for key, maximum in (("title", 160), ("objective", 1000)):
        if key in value:
            result[key] = _text(value[key], key, maximum)
    normalized = []
    ids: set[str] = set()
    kinds: set[str] = set()
    for item in panels:
        item = _object(
            item,
            {"id", "kind", "title", "description", "options"},
            "panel",
        )
        panel_id = _text(item.get("id"), "panel.id", 80, identifier=True)
        kind = item.get("kind")
        if kind not in PANEL_KINDS or kind in kinds or panel_id in ids:
            raise ValueError("Panel kinds and IDs must be valid and unique")
        ids.add(panel_id)
        kinds.add(kind)
        panel = {"id": panel_id, "kind": kind}
        for key, maximum in (("title", 160), ("description", 600)):
            if key in item:
                panel[key] = _text(item[key], key, maximum)
        if "options" in item:
            panel["options"] = _normalize_panel_options(kind, item["options"])
        normalized.append(panel)
    result["panels"] = normalized
    return result


def _source_id(run: dict[str, Any]) -> str:
    payload = run.get("payload") or {}
    return str(
        payload.get("source_run_id")
        or run.get("source_run_id")
        or run["run_id"],
    ).removeprefix("ugsci:")


def _read_job(repository: RunRepository, run_id: str) -> dict[str, Any]:
    """Fixed legacy database only; no client/provider-supplied filesystem \
paths."""
    database = repository.legacy_job_database()
    if not database.is_file():
        return {}
    try:
        with sqlite3.connect(
            database.resolve().as_uri() + "?mode=ro",
            uri=True,
        ) as conn:
            row = conn.execute(
                "SELECT payload FROM jobs WHERE job_id=?",
                (run_id.removeprefix("ugsci:"),),
            ).fetchone()
        value = json.loads(row[0]) if row else {}
        return value if isinstance(value, dict) else {}
    except (sqlite3.Error, ValueError):
        return {}


def owned_run(
    repository: RunRepository,
    run_id: str,
    agent_id: str,
    *,
    session_id: str = "",
    user_id: str = "",
) -> dict[str, Any]:
    # Historical callers pass a session; ownership remains Agent/user scoped.
    del session_id
    if not isinstance(run_id, str) or not re.fullmatch(
        r"(?:ugsci:)?[\w.-]{1,160}",
        run_id,
    ):
        raise KeyError("Run not found")
    # Historical chat references prefix simulator IDs with ugsci:, including
    # IDs later backed by native Runs. Resolve native first, legacy otherwise,
    # so every entry point shares the same authorized presentation identity.
    run = repository.get_run(run_id.removeprefix("ugsci:"))
    if run is None:
        raise KeyError("Run not found")
    payload = run.get("payload") or {}
    # Native simulation bridges historically persisted scope in the job store.
    # Check every explicit owner instead of allowing conflicting scope to win.
    sources = [
        item
        for item in (
            payload,
            payload.get("input_snapshot"),
            payload.get("metadata"),
        )
        if isinstance(item, dict)
    ]
    if run.get("operation") == "simulation.run" or run["run_id"].startswith(
        "ugsci:",
    ):
        sources.append(_read_job(repository, _source_id(run)))
    owners = {
        str(item["agent_id"]) for item in sources if item.get("agent_id")
    }
    if (owners or {"default"}) != {agent_id}:
        raise KeyError("Run not found")
    for item in sources:
        # Session is deliberately not an access boundary: the same Agent may
        # tailor its historical Run from a new conversation.
        if user_id and item.get("user_id") and item["user_id"] != user_id:
            raise KeyError("Run not found")
    return run


def _decode_context_object(value: Any) -> dict[str, Any]:
    """Decode only bounded JSON objects; retain the original empty fallback."""
    if isinstance(value, str):
        if len(value.encode("utf-8")) > MAX_CONTEXT_BYTES:
            return {}
        try:
            value = json.loads(value)
        except (ValueError, RecursionError):
            return {}
    if not isinstance(value, dict):
        return {}
    return value


def _bounded_object(value: Any) -> dict[str, Any]:
    """Bound metadata inspected from provider outputs, including malformed \
JSON."""
    value = _decode_context_object(value)
    pending = [(value, 0)]
    count = 0
    characters = 0
    while pending:
        item, depth = pending.pop()
        count += 1
        if count > 5000 or depth > 12:
            return {}
        if isinstance(item, dict):
            if len(item) > 5000:
                return {}
            pending.extend((child, depth + 1) for child in item.values())
            characters += sum(len(str(key)) for key in item)
        elif isinstance(item, list):
            if len(item) > 5000:
                return {}
            pending.extend((child, depth + 1) for child in item)
        elif isinstance(item, str):
            characters += len(item)
        if characters > MAX_CONTEXT_BYTES:
            return {}
    return value


def _metadata_text(value: Any) -> str | None:
    try:
        return _text(value, "metadata", 160)
    except ValueError:
        return None


def _metric_bindings(value: Any, prefix: str = "") -> list[dict[str, Any]]:
    if isinstance(value, dict):
        items = list(value.items())[:128]
    elif isinstance(value, list):
        items = [
            (item.get("id"), item)
            for item in value[:128]
            if isinstance(item, dict)
        ]
    else:
        return []
    result = []
    for key, metric in items:
        key = _metadata_text(key)
        if not key or metric is None or isinstance(metric, (bool, list, str)):
            continue
        if not isinstance(metric, (int, float, dict)):
            continue
        info = metric if isinstance(metric, dict) else {}
        measured = info.get("value") if isinstance(metric, dict) else metric
        if (
            isinstance(measured, bool)
            or not isinstance(measured, (int, float))
            or not math.isfinite(measured)
        ):
            continue
        result.append(
            {
                "id": prefix + key,
                "label": _metadata_text(info.get("label")) or key,
                "unit": _metadata_text(info.get("unit")),
            },
        )
    return result


def _result_bindings(value: Any, bindings: dict[str, Any]) -> None:
    outer = _bounded_object(value)
    if not outer:
        return
    # Match the renderer's envelope contract: result.ready keeps its complete
    # envelope, whose metadata takes precedence over the nested result body.
    result = outer.get("result", outer)
    body = result if isinstance(result, dict) else {}
    bindings["available"] = True
    raw_metrics = (
        outer.get("metrics")
        if outer.get("metrics") is not None
        else body.get("metrics")
    )
    units = (
        outer["units"]
        if isinstance(outer.get("units"), dict)
        else body.get("units", {})
    )
    units = units if isinstance(units, dict) else {}
    for metric in _metric_bindings(raw_metrics):
        if metric["unit"] is None:
            metric["unit"] = _metadata_text(units.get(metric["id"]))
        bindings["metrics"].append(metric)
    outer_series = outer.get("series")
    series = (
        outer_series
        if isinstance(outer_series, (list, dict)) or outer_series
        else body.get("series")
    )
    if isinstance(series, list):
        for item in series[:128]:
            if (
                not isinstance(item, dict)
                or not _metadata_text(item.get("id"))
                or not isinstance(item.get("points"), list)
            ):
                continue
            bindings["series"].append(
                {
                    "id": item["id"],
                    "label": _metadata_text(item.get("label")) or item["id"],
                    "unit": _metadata_text(item.get("unit")),
                    "time_unit": _metadata_text(item.get("time_unit")),
                },
            )
    tables_source = outer if "tables" in outer or "table" in outer else body
    tables = tables_source.get(
        "tables",
        [tables_source["table"]]
        if isinstance(tables_source.get("table"), dict)
        else [],
    )
    if isinstance(tables, list):
        for index, table in enumerate(tables[:16]):
            if not isinstance(table, dict) or not isinstance(
                table.get("columns"),
                list,
            ):
                continue
            columns = []
            for column in table["columns"][:64]:
                raw_key = (
                    column
                    if isinstance(column, str)
                    else (column.get("key") or column.get("id"))
                    if isinstance(column, dict)
                    else None
                )
                key = _metadata_text(raw_key)
                if key:
                    label = (
                        _metadata_text(column.get("label"))
                        if isinstance(column, dict)
                        else None
                    )
                    columns.append({"key": key, "label": label or key})
            if columns:
                bindings["tables"].append(
                    {
                        "id": _metadata_text(table.get("id"))
                        or f"table-{index}",
                        "columns": columns,
                    },
                )


class PresentationStore:
    def __init__(self, repository: RunRepository):
        self.repository = repository

    def _context(self, run: dict[str, Any]) -> dict[str, Any]:
        context = {
            key: run.get(key)
            for key in (
                "operation",
                "status",
                "provider_id",
                "phase",
                "project_id",
            )
        }
        context["stages"] = [
            {
                key: stage.get(key)
                for key in ("stage_id", "operation", "status")
            }
            for stage in run.get("stages", [])[:32]
        ]
        context["stage_metrics"] = [
            {
                "stage_id": stage.get("stage_id"),
                "keys": list(stage["metrics"])[:64],
            }
            for stage in run.get("stages", [])[:32]
            if isinstance(stage.get("metrics"), dict) and stage["metrics"]
        ]
        context["artifacts"] = [
            {key: ref.get(key) for key in ("ref_id", "kind", "media_type")}
            for ref in run.get("artifacts", [])[:64]
        ]
        bindings: dict[str, Any] = {
            "available": False,
            "series": [],
            "metrics": [],
            "properties": [],
            "tables": [],
        }
        context["bindings"] = bindings
        for stage in run.get("stages", [])[:32]:
            stage_id = (
                stage.get("stage_id")
                or stage.get("name")
                or stage.get("operation")
                or "stage"
            )
            if _metadata_text(stage_id):
                bindings["metrics"].extend(
                    _metric_bindings(
                        stage.get("metrics"),
                        f"stage:{stage_id}:",
                    ),
                )
        if bindings["metrics"]:
            bindings["available"] = True
        latest = None
        with self.repository.connection() as conn:
            rows = conn.execute(
                "SELECT event_type, CASE WHEN "
                "length(CAST(payload AS BLOB))<=? THEN "
                "payload ELSE NULL END "
                "FROM run_events WHERE run_id=? "
                "AND event_type IN ('result.ready','run.status_changed') "
                "ORDER BY sequence DESC LIMIT 8",
                (MAX_CONTEXT_BYTES, run["run_id"]),
            ).fetchall()
        for event_type, raw in rows:
            if raw is None:
                latest = {}
                context["binding_warnings"] = [
                    "Latest structured result exceeds the "
                    "metadata inspection limit.",
                ]
                break
            data = _bounded_object(raw)
            if event_type == "result.ready" or "result" in data:
                latest = (
                    data
                    if event_type == "result.ready"
                    else data.get("result", {})
                )
                break
        if latest is None:
            latest = (run.get("payload") or {}).get("result")
        _result_bindings(latest, bindings)
        for name in ("metrics", "series"):
            bindings[name] = list(
                {item["id"]: item for item in bindings[name]}.values(),
            )[:256]
        if run.get("operation") == "simulation.run":
            self._simulation_bindings(run, bindings)
        return context

    def _simulation_bindings(
        self,
        run: dict[str, Any],
        bindings: dict[str, Any],
    ) -> None:
        """Read numerical result metadata from the fixed read-only store."""
        # SQLite JSON selection avoids reading full numerical arrays into model
        # context. This is a read-only projection of already collected results.
        database = (
            self.repository.legacy_job_database().parent
            / "simulation-results"
            / "results.sqlite3"
        )
        if not database.is_file():
            return
        try:
            with sqlite3.connect(
                database.resolve().as_uri() + "?mode=ro",
                uri=True,
            ) as conn:
                source_id = _source_id(run)
                exists = conn.execute(
                    "SELECT revision FROM results WHERE run_id=?",
                    (source_id,),
                ).fetchone()
                if exists is None:
                    return
                bindings["available"] = True
                bindings["data_revision"] = exists[0]
                for name in ("series", "metrics"):
                    rows = conn.execute(
                        "SELECT json_extract(item.value,'$.id"
                        "'), json_extract(item.value,'$.label'), "
                        "json_extract(item.value,'$.unit'), "
                        "json_extract(item.value,'$.well') "
                        "FROM results, json_each(results.payl"
                        "oad, ?) AS item WHERE run_id=? LIMIT 256",
                        (f"$.{name}", source_id),
                    ).fetchall()
                    collected = [
                        {
                            "id": row[0],
                            "label": _metadata_text(row[1]) or row[0],
                            "unit": _metadata_text(row[2]),
                            "well": _metadata_text(row[3]),
                        }
                        for row in rows
                        if _metadata_text(row[0])
                    ]
                    bindings[name] = list(
                        {
                            item["id"]: item
                            for item in [*bindings[name], *collected]
                        }.values(),
                    )[:256]
                rows = conn.execute(
                    "SELECT DISTINCT property.value FROM "
                    "results, json_each(results.payload,'$.fi"
                    "elds.datasets') AS dataset, "
                    "json_each(dataset.value,'$.properties') "
                    "AS property WHERE run_id=? LIMIT 256",
                    (source_id,),
                ).fetchall()
                bindings["properties"] = [
                    row[0] for row in rows if _metadata_text(row[0])
                ]
        except sqlite3.Error:
            bindings["available"] = False
        return

    def get(self, run: dict[str, Any]) -> dict[str, Any]:
        with self.repository.connection() as conn:
            row = conn.execute(
                "SELECT revision, plan, updated_at FROM "
                "run_presentations WHERE run_id=?",
                (run["run_id"],),
            ).fetchone()
        return {
            "run_id": run["run_id"],
            "revision": row[0] if row else 0,
            "plan": json.loads(row[1]) if row else None,
            "updated_at": row[2] if row else None,
            "catalog": PANEL_CATALOG,
            "task_types": list(TASK_TYPES),
            "context": self._context(run),
        }

    def put(
        self,
        run: dict[str, Any],
        plan: Any,
        *,
        expected_revision: int | None = None,
        agent_id: str,
    ) -> dict[str, Any]:
        plan = validate_plan(plan)
        if expected_revision is not None and (
            type(expected_revision) is not int or expected_revision < 0
        ):
            raise ValueError("expected_revision must be a nonnegative integer")
        run_id = run["run_id"]
        now = _now()
        with self.repository.connection(write=True) as conn:
            row = conn.execute(
                "SELECT revision FROM run_presentations WHERE run_id=?",
                (run_id,),
            ).fetchone()
            revision = row[0] if row else 0
            if expected_revision is not None and expected_revision != revision:
                raise RevisionConflict(
                    f"Presentation revision conflict: expected "
                    f"{expected_revision}"
                    f", current "
                    f"{revision}",
                )
            revision += 1
            conn.execute(
                "INSERT INTO run_presentations VALUES (?, ?, "
                "?, ?, ?) ON CONFLICT(run_id) DO UPDATE SET "
                "revision=excluded.revision,plan=excluded.pla"
                "n,agent_id=excluded.agent_id,updated_at=excl"
                "uded.updated_at",
                (
                    run_id,
                    revision,
                    json.dumps(plan, ensure_ascii=False),
                    agent_id,
                    now,
                ),
            )
            event = {
                "run_id": run_id,
                "revision": revision,
                "type": "run.presentation.updated",
                "created_at": now,
            }
            conn.execute(
                "INSERT INTO run_presentation_events VALUES (?, ?, ?, ?, ?)",
                (run_id, revision, json.dumps(event), agent_id, now),
            )
            # Presentation events are independently durable even after solver
            # completion. Existing immutable terminal execution streams stay
            # so.
            native = conn.execute(
                "SELECT status FROM runs WHERE run_id=?",
                (run_id,),
            ).fetchone()
            if native and native[0] not in TERMINAL_STATUSES:
                self.repository.append_event_in_transaction(
                    conn,
                    run_id,
                    event["type"],
                    {"revision": revision},
                )
        return {
            "run_id": run_id,
            "revision": revision,
            "plan": plan,
            "updated_at": now,
            "event": event,
        }


def build_presentation_router(repository: RunRepository):
    from fastapi import APIRouter, Body, HTTPException

    router = APIRouter()
    store = PresentationStore(repository)

    async def resolve(run_id: str, request: Request):
        from qwenpaw.app.agent_context import (
            get_agent_for_request,
            get_current_session_id,
            get_current_user_id,
        )

        workspace = await get_agent_for_request(request)
        try:
            run = owned_run(
                repository,
                run_id,
                workspace.agent_id,
                session_id=get_current_session_id() or "",
                user_id=get_current_user_id() or "",
            )
        except KeyError:
            raise HTTPException(
                status_code=404,
                detail="Run not found",
            ) from None
        return run, workspace.agent_id

    @router.get("/runs/{run_id}/presentation")
    async def get_presentation(run_id: str, request: Request):
        run, _ = await resolve(run_id, request)
        return store.get(run)

    @router.put("/runs/{run_id}/presentation")
    async def put_presentation(
        run_id: str,
        request: Request,
        payload: dict[str, Any] = Body(...),
    ):
        run, agent = await resolve(run_id, request)
        try:
            _object(payload, {"plan", "expected_revision"}, "request")
            return store.put(
                run,
                payload.get("plan"),
                expected_revision=payload.get("expected_revision"),
                agent_id=agent,
            )
        except RevisionConflict as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from None
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from None

    return router


def register_presentation_tools(api: Any, repository: RunRepository) -> None:
    from agentscope.message import TextBlock, ToolResultState

    store = PresentationStore(repository)

    def resolve(run_id: str):
        from qwenpaw.app.agent_context import (
            get_current_agent_id,
            get_current_session_id,
            get_current_user_id,
        )
        from qwenpaw.config.utils import load_config

        agent = get_current_agent_id()
        config = load_config()
        profile = config.agents.profiles.get(agent)
        if profile is None or not getattr(profile, "enabled", True):
            raise KeyError("Run not found")
        return (
            owned_run(
                repository,
                run_id,
                agent,
                session_id=get_current_session_id() or "",
                user_id=get_current_user_id() or "",
            ),
            agent,
        )

    def result(action):
        try:
            payload = {"ok": True, "kind": "run_presentation", **action()}
        except (KeyError, ValueError) as exc:
            payload = {
                "ok": False,
                "kind": "run_presentation",
                "error": "Run not found"
                if isinstance(exc, KeyError)
                else str(exc),
            }
        return ToolChunk(
            is_last=True,
            state=ToolResultState.SUCCESS
            if payload["ok"]
            else ToolResultState.ERROR,
            content=[
                TextBlock(
                    type="text",
                    text=json.dumps(payload, ensure_ascii=False),
                ),
            ],
        )

    def get_run_presentation(run_id: str) -> ToolChunk:
        """Read a Run's saved view, panel catalog and available data \
binding IDs.

        Call before tailoring a run's live display. Returns \
verified task metadata,
        series/metric IDs and units without numerical arrays. \
Never runs a solver.
        Args:
            run_id: Existing Run Center ID, including ugsci: \
legacy IDs.
        """
        return result(lambda: store.get(resolve(run_id)[0]))

    def set_run_presentation(
        run_id: str,
        plan: dict[str, Any],
        expected_revision: int | None = None,
    ) -> ToolChunk:
        """Save a declarative live view for an existing Run; never change its \
execution.

        Read get_run_presentation first. Plan: version=1, task_type \
from returned
        task_types, layout=stack|tabs|dashboard, optional \
title/objective, panels
        with unique id and kind from catalog, optional \
title/description/options.
        Use only catalog options and actual binding IDs. Supply no \
numeric results,
        URLs, paths, code or expressions. Data updates independently \
of this plan.
        Args:
            run_id: Existing Run Center ID, including ugsci: legacy \
IDs.
            plan: Bounded declarative presentation object described \
above.
            expected_revision: Revision returned by \
get_run_presentation to prevent overwriting concurrent edits.
        """

        def save():
            run, agent = resolve(run_id)
            return store.put(
                run,
                plan,
                expected_revision=expected_revision,
                agent_id=agent,
            )

        return result(save)

    register = getattr(api, "register_tool", None)
    if callable(register):
        for tool in (get_run_presentation, set_run_presentation):
            register(
                tool_name=tool.__name__,
                tool_func=tool,
                description=tool.__doc__,
                enabled=True,
                tool_type="internal",
                icon="📊",
            )
    register_prompt = getattr(api, "register_prompt_section", None)
    if callable(register_prompt):
        register_prompt(
            name="qwenpaw-run-center.presentation",
            after="workspace",
            provider=lambda _agent: PROMPT,
            priority=91,
        )
