# GenUI Module — UGSci Plugin

Declarative generative UI for QwenPaw, ported from LeAgent (Apache-2.0).

## Overview

The model emits a JSON UI tree (`emit_ui_tree`) or a JSON Patch against an
existing tree (`emit_ui_patch`). The backend repairs, normalizes, and validates
the tree against `_COMPONENT_CATALOG` in `schema.py`, then stores a snapshot.
The frontend renders the live tree through `GenUiRegistry` and can export a
standalone HTML document (plus PNG/PDF helpers).

Allowed `kind` values come from **one catalog**: `schema.py` `_COMPONENT_CATALOG`.
`list_ui_components`, `get_genui_guide.allowed_kinds`, and JSON Schema all derive
from that list. Registry / HTML walker coverage is locked by
`tests/unit/plugins/ugsci/test_genui_catalog_contract.py`.

## Architecture

```
emit_ui_tree / emit_ui_patch
  → json_repair (tree) → normalize → validate → SQLite snapshot store
  → standard ToolChunk JSON (no custom SSE)
  → AgentScope SSE → SDK → ToolCard
  → response.append → GenUiInline → GenUiTreeView (Registry)

HTML export walks the same tree via genUiHtmlRender + genUiModel
(offline binder; live charts stay on the React SVG painter).
```

Snapshots are keyed by `session_id` + `ui_id`, persisted in SQLite WAL
(`WORKING_DIR/state/genui.sqlite3`, in-memory under pytest), with a 1024-entry
LRU eviction. Deleting a chat session clears that session's rows.

## Tools

| Tool | Role |
|------|------|
| `list_ui_components` | Catalog: kinds + prop hints |
| `get_genui_guide` | Layout / action / patch guide + `allowed_kinds` |
| `emit_ui_tree` | Create or replace a tree (`ui_id` to replace) |
| `emit_ui_patch` | RFC 6902 subset patch (`replace` / `add` / `remove`) |

## Backend Files

| File | Responsibility |
|------|----------------|
| `schema.py` | Catalog, JSON Schema, normalize / validate / patch apply |
| `tools.py` | The four tools above |
| `emit_core.py` | Shared validate-and-store path (tools + domain adapters) |
| `domain_cards.py` | Domain-result → GenUI card adapters |
| `json_repair.py` | Recover malformed JSON from LLM output |
| `state.py` | SQLite WAL snapshot store (`session_id`, `ui_id`, revision) |
| `prompt.py` | Short system-prompt router (details stay on-demand) |
| `guide.py` | On-demand design guide; `allowed_kinds` from the catalog |
| `settings.py` / `api.py` | Persisted enable switch + HTTP config |
| `registration.py` | Tool + prompt registration; session-delete cleanup |

## Frontend Files

| File | Responsibility |
|------|----------------|
| `types/genUi.ts` | TypeScript types |
| `stores/genUi.tsx` | React snapshot store |
| `lib/genUiModel.ts` | Shared view-model (fields, buttons, chart paint) |
| `lib/genUiHtmlRender.ts` | Standalone HTML document walker |
| `lib/genUiExport.ts` | HTML / PNG / PDF export entry |
| `lib/genUiActionBus.ts` | Button action dispatch (`send_message` / `submit_form`) |
| `lib/genUiMedia.ts` | Media URL helpers |
| `components/GenUiRegistry.tsx` | Live tree renderer + Chart SVG |
| `components/GenUiInline.tsx` | Inline renderer in `response.append` |
| `components/GenUiToolCall.tsx` | ToolCard for emit calls |
| `components/GenUiInteraction.tsx` | Form / field / button widgets |
| `components/GenUiCatalogCard.tsx` | Catalog tool result card |
| `index.ts` | Frontend registration entry |

## Configuration

GenUI is enabled by default. Set `GENUI_ENABLED=false` to hide the tools from
model requests. The same switch is also persisted at
`<WORKING_DIR>/ugsci/genui.json`.

## Dual tree

Edit `src/qwenpaw/plugins_bundle/ugsci/` first, then copy the matching files to
`plugins/bundle/ugsci/`.

## License

Source: LeAgent (Apache-2.0) — see `LICENSES/LEAGENT-APACHE-2.0.txt`.
