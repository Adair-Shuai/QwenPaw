# GenUI Module — UGSci Plugin

Declarative generative UI for QwenPaw, ported from LeAgent (Apache-2.0).

## Overview

GenUI allows the AI model to emit structured UI trees (cards, tables, charts,
KPIs, dashboards) that render inline in the chat response. The model calls
`emit_ui_tree` with a JSON tree; the backend validates and normalizes it;
the frontend renders it via a component registry.

## Architecture

```
emit_ui_tree (tool call)
  → backend: JSON repair → normalize → validate → state store
  → standard ToolChunk result (JSON text)
  → AgentScope SSE → SDK → ToolCard renderer
  → response.append slot → GenUiInline → GenUiTreeView
```

No custom SSE events are used. The entire pipeline flows through QwenPaw's
standard tool result mechanism.

## Backend Files

| File | Responsibility |
|------|---------------|
| `schema.py` | JSON Schema, component catalog, normalize/validate |
| `tools.py` | `emit_ui_tree`, `list_ui_components`, `get_genui_guide` |
| `json_repair.py` | Recover malformed JSON from LLM output |
| `state.py` | In-process LRU state store (ui_id, revision) |
| `prompt.py` | System prompt section |
| `guide.py` | On-demand design guide payload |
| `registration.py` | Tool + prompt registration with conflict detection |

## Frontend Files

| File | Responsibility |
|------|---------------|
| `types/genUi.ts` | TypeScript type definitions |
| `stores/genUi.tsx` | React context store (snapshots, hydrate, clear) |
| `components/GenUiRegistry.tsx` | Tree node renderer + Chart (SVG) |
| `components/GenUiInline.tsx` | Inline renderer in response.append slot |
| `components/GenUiToolCall.tsx` | ToolCard for emit_ui_tree calls |
| `lib/genUiActionBus.ts` | Button action dispatch (send_message only) |
| `index.ts` | Frontend registration entry |

## Configuration

Tools are registered as `enabled=False` by default. Users must opt-in
through agent configuration to activate GenUI.

## License

Source: LeAgent (Apache-2.0) — see `LICENSES/LEAGENT-APACHE-2.0.txt`.
