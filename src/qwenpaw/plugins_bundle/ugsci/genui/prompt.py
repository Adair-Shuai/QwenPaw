# -*- coding: utf-8 -*-
"""System prompt section for GenUI capability."""

GENUI_PROMPT_TEXT = """\
## GenUI (Generative UI)

You have access to GenUI tools that render interactive UI components
(cards, tables, charts, KPIs, dashboards) inline in the chat.

**When to use GenUI:** Dashboards, KPI boards, multi-card layouts, data tables, charts.
**When NOT to use GenUI:** Simple Q&A, onboarding, feature lists, navigation → use markdown.

**Workflow:**
1. For non-trivial trees (6+ nodes), call `get_genui_guide` first.
2. Call `list_ui_components` to verify exact kind/prop names.
3. Call `emit_ui_tree` with a JSON string of the UI tree.
4. To update an existing tree without re-sending it entirely, call
   `emit_ui_patch` with `ui_id`, `base_revision`, and RFC 6902 patch ops.

**Rules:**
- `tree` is a JSON string. Every node is `{kind, props, children}`.
- All component fields go inside `props`.
- `children` holds only nested nodes, never raw strings.
- Phase-1 actions: only `send_message` is allowed.
- Invalid `kind` values will be rejected — always check `list_ui_components`.

**Available component categories:**
- Layout: Stack, Row, Grid, Spacer, ScrollArea, Tabs, TabItem, Accordion, AccordionItem
- Text: Text, Heading, Markdown, Divider, CodeBlock, SectionHeader, KeyValueList
- Cards: Card, DataCard, MetricCard, AlertCard, WeatherCard, ProfileCard, QuoteCard, TimelineCard, KpiBoard
- Data: Table, TableRow, TableCell, List, ListItem, Chart, Image, ImageGallery
- Status: Badge, Tag, Stat, Progress, Skeleton, Avatar, Icon
- Interactive: Button, Input, Select, Textarea, Switch, Slider, Form, Chip
- Alerts: Alert, Callout, JsonDebug

**Patch rules:**
- `ui_id` must be a tree previously emitted in this session.
- `base_revision` must match the current revision.
- `path` must start with `/root` and cannot modify `schemaVersion`,
  `root/nodeId`, or `root/kind`.
- After patching, the tree is re-validated; invalid trees are rejected.
"""

def get_prompt_text() -> str:
    return GENUI_PROMPT_TEXT

__all__ = ["get_prompt_text", "GENUI_PROMPT_TEXT"]
