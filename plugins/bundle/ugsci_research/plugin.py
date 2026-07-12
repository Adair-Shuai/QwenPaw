# -*- coding: utf-8 -*-
"""UGSci Research plugin backend for QwenPaw.

Registers a *Research Mode* (``AgentMode``) that runs parallel to
Coding Mode.  When active, the agent receives a scientific-research
system prompt, gets access to research-oriented tools (web search,
literature search, data analysis), and a set of scientific skills.

The mode is toggled per-agent via the ``research_mode`` field stored
in ``agent.json``.  Because ``AgentProfileConfig`` (Pydantic) ignores
unknown fields, we read the raw JSON directly — see
:func:`_read_research_mode_config`.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Dict, Optional

logger = logging.getLogger("qwenpaw").getChild("plugin.ugsci_research")

PLUGIN_ID = "ugsci_research"
PLUGIN_DIR = Path(__file__).parent


# ---------------------------------------------------------------------------
# Config helpers — read research_mode from agent.json (bypassing Pydantic)
# ---------------------------------------------------------------------------

def _read_research_mode_config(agent_id: str) -> Dict[str, Any]:
    """Read the ``research_mode`` section from an agent's ``agent.json``.

    ``AgentProfileConfig`` (Pydantic v2, default ``extra="ignore"``)
    silently drops the ``research_mode`` key on load.  We therefore
    read the raw JSON file directly so plugin-defined config survives
    a round-trip.
    """
    try:
        from ...config.utils import load_config

        config = load_config()
        if agent_id not in config.agents.profiles:
            return {"enabled": False, "domain": "general"}
        workspace_dir = Path(
            config.agents.profiles[agent_id].workspace_dir,
        ).expanduser()
        agent_json = workspace_dir / "agent.json"
        if not agent_json.exists():
            return {"enabled": False, "domain": "general"}
        with open(agent_json, encoding="utf-8") as f:
            data = json.load(f)
        rm = data.get("research_mode")
        if isinstance(rm, dict):
            return rm
        return {"enabled": False, "domain": "general"}
    except Exception as exc:
        logger.debug("Failed to read research_mode config: %s", exc)
        return {"enabled": False, "domain": "general"}


def _write_research_mode_config(
    agent_id: str,
    rm_config: Dict[str, Any],
) -> None:
    """Write the ``research_mode`` section back to ``agent.json``."""
    try:
        from ...config.utils import load_config

        config = load_config()
        if agent_id not in config.agents.profiles:
            return
        workspace_dir = Path(
            config.agents.profiles[agent_id].workspace_dir,
        ).expanduser()
        agent_json = workspace_dir / "agent.json"
        data: dict = {}
        if agent_json.exists():
            with open(agent_json, encoding="utf-8") as f:
                data = json.load(f)
        data["research_mode"] = rm_config
        with open(agent_json, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        # Invalidate the config cache so subsequent loads pick up the change.
        try:
            from ...config.utils import _agent_config_cache, _agent_config_lock

            with _agent_config_lock:
                _agent_config_cache.pop(agent_id, None)
        except Exception:
            pass
    except Exception as exc:
        logger.error("Failed to write research_mode config: %s", exc)


# ---------------------------------------------------------------------------
# Prompt templates
# ---------------------------------------------------------------------------

def _load_prompt(name: str) -> str:
    """Load a prompt file from the plugin's ``prompts/`` directory."""
    path = PLUGIN_DIR / "prompts" / f"{name}.txt"
    if not path.exists():
        logger.warning("Prompt file not found: %s", path)
        return ""
    return path.read_text(encoding="utf-8").strip()


_DOMAIN_PROMPTS = {
    "general": "research.txt",
    "physics": "physics.txt",
    "biology": "biology.txt",
    "ml": "ml.txt",
}


def _get_research_prompt(domain: str) -> str:
    filename = _DOMAIN_PROMPTS.get(domain, _DOMAIN_PROMPTS["general"])
    return _load_prompt(filename.replace(".txt", ""))


# ---------------------------------------------------------------------------
# Research Mode — AgentMode implementation
# ---------------------------------------------------------------------------

# Import here to avoid circular imports at module load time.


def _register_research_mode(api) -> None:
    """Build and register the ResearchMode via the plugin API."""

    from ...modes.base import AgentMode, ModeGatedHook
    from ...runtime.hooks import HookContext, HookResult
    from ...runtime.phases import Phase
    from ...runtime.prompt_manager import SyncPromptContributor

    class ResearchModeContributor(SyncPromptContributor):
        """Inject the research system prompt when Research Mode is active."""

        name = "research_mode"
        priority = 84  # Just before CodingModeContributor (85)

        def contribute_sync(self, ctx: HookContext) -> str | None:
            agent_id = getattr(ctx, "agent_id", None) or "default"
            rm = _read_research_mode_config(agent_id)
            if not rm.get("enabled", False):
                return None
            domain = rm.get("domain", "general")
            prompt = _get_research_prompt(domain)
            if not prompt:
                return None
            workspace_dir = str(
                getattr(ctx, "workspace_dir", "") or "(unknown)",
            )
            return prompt.format(
                workspace_dir=workspace_dir,
                domain=domain,
            )

    class ResearchContextHook(ModeGatedHook):
        """Stash research context into ``ctx.mode_state['research']``."""

        phase = Phase.PRE_AGENT_BUILD
        name = "research_mode_context"
        priority = 25

        async def _run(self, ctx: HookContext) -> HookResult:
            agent_id = getattr(ctx, "agent_id", None) or "default"
            rm = _read_research_mode_config(agent_id)
            ctx.mode_state.setdefault("research", {}).update(
                {
                    "domain": rm.get("domain", "general"),
                    "enabled": True,
                },
            )
            # Inject a context reminder for the agent.
            domain = rm.get("domain", "general")
            ctx.inject_context(
                f"Research Mode is ACTIVE (domain: {domain}). "
                f"Follow the 8-stage research workflow. "
                f"Use research tools when appropriate. "
                f"Always cite real sources — never fabricate data.",
                priority=10,
                source="research_mode",
            )
            return HookResult()

    class ResearchMode(AgentMode):
        """Research Mode — scientific research workflow bundle."""

        name = "research"

        def hooks(self):
            return [ResearchContextHook(owner_mode=self)]

        def prompt_contributors(self):
            return [ResearchModeContributor()]

        def is_active(self, ctx: HookContext) -> bool:
            agent_id = getattr(ctx, "agent_id", None) or "default"
            rm = _read_research_mode_config(agent_id)
            return rm.get("enabled", False)

    api.register_mode(ResearchMode)


# ---------------------------------------------------------------------------
# Tools
# ---------------------------------------------------------------------------

async def _web_search(query: str, max_results: int = 10) -> str:
    """Search the web for scientific information.

    Uses the agent's built-in shell to call web search utilities.
    Returns structured JSON with titles, URLs, and snippets.
    """
    import json as _json

    results: list[dict] = []

    # Try to use the built-in browser_use or websearch capability
    # by delegating to the shell. This keeps the tool self-contained
    # without external API dependencies.
    try:
        import asyncio

        proc = await asyncio.create_subprocess_exec(
            "python3",
            "-c",
            f"""
import json, urllib.request, urllib.parse
q = {query!r}
url = "https://api.duckduckgo.com/?q=" + urllib.parse.quote(q) + "&format=json&no_html=1"
try:
    req = urllib.request.Request(url, headers={{"User-Agent": "UGSci-Research/1.0"}})
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode())
        results = []
        for topic in (data.get("RelatedTopics") or [])[:{max_results}]:
            if isinstance(topic, dict) and "Text" in topic:
                results.append({{
                    "title": topic.get("Text", "")[:200],
                    "url": topic.get("FirstURL", ""),
                    "snippet": topic.get("Text", ""),
                }})
        # Also check abstract
        if data.get("AbstractText"):
            results.insert(0, {{
                "title": data.get("Heading", ""),
                "url": data.get("AbstractURL", ""),
                "snippet": data.get("AbstractText", ""),
            }})
        print(json.dumps(results, ensure_ascii=False))
except Exception as e:
    print(json.dumps([{{"error": str(e)}}], ensure_ascii=False))
""",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, _ = await proc.communicate()
        results = _json.loads(stdout.decode().strip() or "[]")
    except Exception as exc:
        results = [{"error": f"Web search failed: {exc}"}]

    return _json.dumps(results, ensure_ascii=False, indent=2)


async def _literature_search(
    query: str,
    source: str = "all",
    max_results: int = 20,
) -> str:
    """Search scientific literature databases.

    Searches OpenAlex, arXiv, and Crossref for academic papers.

    Args:
        query: Search query (title, author, keywords).
        source: Database to search — "openalex", "arxiv", "crossref", or "all".
        max_results: Maximum number of results to return.
    """
    import asyncio
    import json as _json
    import urllib.parse
    import urllib.request

    async def _search_openalex(q: str, limit: int) -> list[dict]:
        url = (
            "https://api.openalex.org/works?"
            + urllib.parse.urlencode(
                {
                    "search": q,
                    "per-page": str(limit),
                    "mailto": "research@ugsci.local",
                },
            )
        )
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "UGSci-Research/1.0"},
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = _json.loads(resp.read().decode())
            return [
                {
                    "title": w.get("title", ""),
                    "doi": w.get("doi", ""),
                    "year": w.get("publication_year"),
                    "authors": [
                        a.get("author", {}).get("display_name", "")
                        for a in (w.get("authorships") or [])[:5]
                    ],
                    "cited_by": w.get("cited_by_count", 0),
                    "url": w.get("id", ""),
                    "abstract": _reconstruct_abstract(
                        w.get("abstract_inverted_index"),
                    ),
                    "source": "openalex",
                }
                for w in (data.get("results") or [])[:limit]
            ]
        except Exception as exc:
            return [{"error": f"OpenAlex search failed: {exc}"}]

    async def _search_arxiv(q: str, limit: int) -> list[dict]:
        url = (
            "http://export.arxiv.org/api/query?"
            + urllib.parse.urlencode(
                {
                    "search_query": f"all:{q}",
                    "max_results": str(limit),
                    "sortBy": "relevance",
                },
            )
        )
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "UGSci-Research/1.0"},
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                raw = resp.read().decode()
            # Parse Atom XML
            import xml.etree.ElementTree as ET

            root = ET.fromstring(raw)
            ns = {"atom": "http://www.w3.org/2005/Atom"}
            entries = []
            for entry in root.findall("atom:entry", ns)[:limit]:
                entries.append(
                    {
                        "title": (
                            entry.find("atom:title", ns).text or ""
                        ).strip(),
                        "arxiv_id": (
                            entry.find("atom:id", ns).text or ""
                        ).split("/")[-1],
                        "authors": [
                            (
                                a.find("atom:name", ns).text or ""
                            )
                            for a in entry.findall("atom:author", ns)
                        ],
                        "abstract": (
                            entry.find("atom:summary", ns).text or ""
                        ).strip(),
                        "url": entry.find("atom:id", ns).text or "",
                        "source": "arxiv",
                    },
                )
            return entries
        except Exception as exc:
            return [{"error": f"arXiv search failed: {exc}"}]

    async def _search_crossref(q: str, limit: int) -> list[dict]:
        url = (
            "https://api.crossref.org/works?"
            + urllib.parse.urlencode(
                {"query": q, "rows": str(limit)},
            )
        )
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "UGSci-Research/1.0"},
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = _json.loads(resp.read().decode())
            return [
                {
                    "title": (item.get("title") or [""])[0],
                    "doi": item.get("DOI", ""),
                    "year": (
                        item.get("published", {}).get("date-parts", [[None]])[
                            0
                        ][0]
                    ),
                    "authors": [
                        f"{a.get('given','')} {a.get('family','')}".strip()
                        for a in (item.get("author") or [])[:5]
                    ],
                    "url": item.get("URL", ""),
                    "source": "crossref",
                }
                for item in (data.get("message", {}).get("items") or [])[
                    :limit
                ]
            ]
        except Exception as exc:
            return [{"error": f"Crossref search failed: {exc}"}]

    def _reconstruct_abstract(inverted_index) -> str:
        if not inverted_index:
            return ""
        positions: list[tuple[int, str]] = []
        for word, idxs in inverted_index.items():
            for idx in idxs:
                positions.append((idx, word))
        positions.sort()
        return " ".join(w for _, w in positions)

    all_results: list[dict] = []

    tasks = []
    if source in ("all", "openalex"):
        tasks.append(_search_openalex(query, max_results))
    if source in ("all", "arxiv"):
        tasks.append(_search_arxiv(query, max_results))
    if source in ("all", "crossref"):
        tasks.append(_search_crossref(query, max_results))

    for task_result in await asyncio.gather(*tasks):
        all_results.extend(task_result)

    if not all_results:
        return _json.dumps(
            {"message": "No results found", "query": query},
            ensure_ascii=False,
            indent=2,
        )

    return _json.dumps(
        {
            "query": query,
            "source": source,
            "count": len(all_results),
            "results": all_results[:max_results],
        },
        ensure_ascii=False,
        indent=2,
    )


async def _data_analysis(
    data_path: str,
    operation: str = "summary",
    **kwargs,
) -> str:
    """Perform data analysis on a file.

    Supports CSV, JSON, and LAS (well log) files.

    Args:
        data_path: Path to the data file.
        operation: Analysis type — "summary", "statistics",
            "correlation", "plot", "las_curves".
        **kwargs: Additional parameters (column name, plot type, etc.).
    """
    import os

    if not os.path.exists(data_path):
        return f'{{"error": "File not found: {data_path}"}}'

    ext = os.path.splitext(data_path)[1].lower()

    if ext == ".las":
        return await _analyze_las(data_path, operation, **kwargs)

    import json as _json

    try:
        if ext == ".csv":
            import csv

            with open(data_path, encoding="utf-8") as f:
                reader = csv.DictReader(f)
                rows = list(reader)
        elif ext == ".json":
            with open(data_path, encoding="utf-8") as f:
                data = _json.load(f)
                rows = data if isinstance(data, list) else [data]
        else:
            return f'{{"error": "Unsupported file type: {ext}"}}'

        if operation == "summary":
            result = {
                "file": data_path,
                "rows": len(rows),
                "columns": list(rows[0].keys()) if rows else [],
                "sample": rows[:3] if rows else [],
            }
        elif operation == "statistics":
            import statistics as stats

            numeric_cols: dict[str, list[float]] = {}
            for row in rows:
                for k, v in row.items():
                    try:
                        numeric_cols.setdefault(k, []).append(float(v))
                    except (ValueError, TypeError):
                        pass
            result = {
                col: {
                    "count": len(vals),
                    "mean": stats.mean(vals) if vals else None,
                    "min": min(vals) if vals else None,
                    "max": max(vals) if vals else None,
                    "stdev": stats.stdev(vals) if len(vals) > 1 else 0,
                }
                for col, vals in numeric_cols.items()
            }
        else:
            result = {"error": f"Unknown operation: {operation}"}

        return _json.dumps(result, ensure_ascii=False, indent=2)
    except Exception as exc:
        return f'{{"error": "Analysis failed: {exc}"}}'


async def _analyze_las(
    las_path: str,
    operation: str,
    **kwargs,
) -> str:
    """Analyze a LAS (well log) file.

    Operations:
    - "las_curves": List available curves and their ranges.
    - "summary": Basic file info + curve statistics.
    """
    import json as _json
    import re

    try:
        with open(las_path, encoding="utf-8", errors="replace") as f:
            content = f.read()

        # Parse LAS header sections
        version = re.search(r"VERS\.\s*(\S+)", content)
        well_name = re.search(r"WELL\.\s*(.+)", content)
        start_depth = re.search(r"STRT\.\s*\S+\s+(\S+)", content)
        stop_depth = re.search(r"STOP\.\s*\S+\s+(\S+)", content)
        step = re.search(r"STEP\.\s*\S+\s+(\S+)", content)

        # Parse curve definitions
        curves = []
        in_curve_section = False
        for line in content.split("\n"):
            if line.startswith("~C"):
                in_curve_section = True
                continue
            if line.startswith("~") and in_curve_section:
                break
            if in_curve_section and line.strip() and not line.startswith("#"):
                parts = line.split()
                if len(parts) >= 2:
                    curves.append(
                        {
                            "mnemonic": parts[0],
                            "unit": parts[1] if len(parts) > 1 else "",
                            "description": " ".join(parts[3:])
                            if len(parts) > 3
                            else "",
                        },
                    )

        result = {
            "file": las_path,
            "version": version.group(1) if version else "unknown",
            "well_name": well_name.group(1).strip()
            if well_name
            else "unknown",
            "depth_range": {
                "start": start_depth.group(1) if start_depth else None,
                "stop": stop_depth.group(1) if stop_depth else None,
                "step": step.group(1) if step else None,
            },
            "curves": curves,
            "curve_count": len(curves),
        }

        if operation == "las_curves":
            return _json.dumps(result, ensure_ascii=False, indent=2)
        elif operation == "summary":
            result["note"] = (
                "Use operation='las_curves' for detailed curve info. "
                "Future versions will support curve plotting and "
                "cross-plot analysis."
            )
            return _json.dumps(result, ensure_ascii=False, indent=2)
        else:
            return _json.dumps(
                {"error": f"Unknown LAS operation: {operation}"},
                ensure_ascii=False,
                indent=2,
            )
    except Exception as exc:
        return f'{{"error": "LAS analysis failed: {exc}"}}'


# ---------------------------------------------------------------------------
# Plugin entry point
# ---------------------------------------------------------------------------

class UGSciResearchPlugin:
    """UGSci Research plugin backend entry point."""

    def register(self, api) -> None:
        """Register all plugin components."""
        logger.info(
            "[%s] Plugin registering — Research Mode", PLUGIN_ID,
        )

        # 1. Register Research Mode (AgentMode + PromptContributor + Hooks)
        try:
            _register_research_mode(api)
        except Exception as exc:
            logger.error("Failed to register ResearchMode: %s", exc)

        # 2. Register tools
        try:
            api.register_tool(
                tool_name="web_search",
                tool_func=_web_search,
                description="Search the web for scientific information",
                icon="🔍",
                enabled=False,
            )
            api.register_tool(
                tool_name="literature_search",
                tool_func=_literature_search,
                description=(
                    "Search academic databases (OpenAlex, arXiv, Crossref) "
                    "for scientific papers"
                ),
                icon="📚",
                enabled=False,
            )
            api.register_tool(
                tool_name="data_analysis",
                tool_func=_data_analysis,
                description=(
                    "Analyze data files (CSV, JSON, LAS well logs) "
                    "with summary statistics and curve information"
                ),
                icon="📊",
                enabled=False,
            )
        except Exception as exc:
            logger.error("Failed to register tools: %s", exc)

        # 3. Register skills
        try:
            skills_dir = PLUGIN_DIR / "skills"
            if skills_dir.exists():
                api.register_skill_provider(
                    skills_dir=skills_dir,
                    enabled_by_default=True,
                    channels=["all"],
                )
                logger.info(
                    "[%s] Skill provider registered: %s",
                    PLUGIN_ID,
                    skills_dir,
                )
        except Exception as exc:
            logger.error("Failed to register skills: %s", exc)

        # 4. Register slash command for toggling research mode
        try:
            api.register_slash_command(
                name="research",
                handler=self._handle_research_command,
                aliases=("research_mode", "rm"),
                category="plugin",
                help_text=(
                    "Toggle Research Mode. Usage: /research [on|off|status] "
                    "[domain:general|physics|biology|ml]"
                ),
            )
        except Exception as exc:
            logger.error("Failed to register slash command: %s", exc)

        # 5. Register startup hook
        try:
            api.register_startup_hook(
                hook_name="ugsci_research_init",
                callback=self._on_startup,
                priority=50,
            )
        except Exception:
            pass

    async def _on_startup(self) -> None:
        """Called when QwenPaw starts."""
        logger.info("[%s] Research Mode plugin started", PLUGIN_ID)

    async def _handle_research_command(
        self,
        ctx: Any,
        args: str,
    ) -> Any:
        """Handle ``/research`` slash command.

        Usage:
            /research              — toggle on/off
            /research on           — enable
            /research off          — disable
            /research status       — show current status
            /research on physics   — enable with physics domain
        """
        from ...schemas import Msg, Role

        agent_id = getattr(ctx, "agent_id", None) or "default"
        parts = args.strip().split()
        action = parts[0].lower() if parts else "toggle"
        domain = "general"

        if len(parts) > 1:
            for p in parts[1:]:
                if p.startswith("domain:"):
                    domain = p.split(":", 1)[1]
                elif p in ("general", "physics", "biology", "ml"):
                    domain = p

        current = _read_research_mode_config(agent_id)
        currently_enabled = current.get("enabled", False)

        if action == "on":
            new_enabled = True
        elif action == "off":
            new_enabled = False
        elif action == "status":
            status_text = (
                f"Research Mode: {'ENABLED' if currently_enabled else 'DISABLED'}"
                f"\nDomain: {current.get('domain', 'general')}"
            )
            return Msg(role=Role.ASSISTANT, content=status_text)
        else:  # toggle
            new_enabled = not currently_enabled

        new_config = {
            "enabled": new_enabled,
            "domain": domain if new_enabled else current.get("domain", "general"),
        }
        _write_research_mode_config(agent_id, new_config)

        status = "ENABLED" if new_enabled else "DISABLED"
        text = (
            f"🔬 Research Mode is now **{status}**\n"
            f"Domain: {new_config['domain']}\n"
        )
        if new_enabled:
            text += (
                "\nThe agent will follow the 8-stage research workflow:\n"
                "1. SCOPE — Define the research question\n"
                "2. LITERATURE — Search and review existing work\n"
                "3. REASON — Deliberate on findings\n"
                "4. METHODOLOGY — Design the approach\n"
                "5. COMPUTE — Execute computations\n"
                "6. ANALYZE — Process and analyze results\n"
                "7. SYNTHESIZE — Interpret in context\n"
                "8. WRITE — Produce the deliverable\n"
                "\nUse /research off to disable."
            )

        return Msg(role=Role.ASSISTANT, content=text)


# Module-level plugin object — required by the QwenPaw plugin loader.
plugin = UGSciResearchPlugin()
