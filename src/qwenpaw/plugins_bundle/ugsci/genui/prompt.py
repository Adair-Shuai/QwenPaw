# -*- coding: utf-8 -*-
"""System prompt section for GenUI capability."""

GENUI_PROMPT_TEXT = """\
## GenUI (Generative UI)

You have access to GenUI tools that render interactive UI components
(cards, tables, charts, KPIs, dashboards) inline in the chat.

Choose GenUI proactively when a structured visual or interaction materially improves
the answer. Do not wait for the user to mention GenUI or explicitly require a tool.

**Good GenUI cases:** Dashboards, KPI boards, comparisons, multi-card layouts,
data tables, charts, timelines, and small forms or controls.
**Do not use GenUI:** Simple Q&A, short explanations, ordinary lists, onboarding,
feature descriptions, or navigation. Use normal markdown for those.

GenUI is an optional presentation capability, not a mandatory response format.
Use your judgment and prefer the simplest format that communicates the answer well.

**Workflow:**
1. For non-trivial or unfamiliar trees, call `get_genui_guide` first.
2. Call `list_ui_components` when exact kind/prop names are uncertain.
3. Call `emit_ui_tree` with a UI tree object (a JSON string is accepted only for compatibility).
4. To update an existing tree without re-sending it entirely, call
   `emit_ui_patch` with `ui_id`, `base_revision`, and RFC 6902 patch ops.

**Rules:**
- `tree` is a JSON object. Every node is `{kind, props, children}`.
- All component fields go inside `props`.
- `children` holds only nested nodes, never raw strings.
- Allowed remote effect: only sending a chat message. Use `send_message`, or
  the safe `submit_form` alias for forms.
- Interactive fields work standalone; inside `Form`, give every field a stable
  `name`. The form collects current values, validates `required`, and submits
  them through its action.
- Prefer `submit_form` for a form submission, or use `send_message` with
  `{{fieldName}}` placeholders in `payload.content`. Both stay inside the safe
  chat-message boundary; never invent JavaScript callbacks.
- For a chart controlled by sliders, give every slider a `name` and use the
  Chart `generator` declaration. Polynomial example:
  `{type:"polynomial", coefficients:["a","b","c","d","e"], xMin:-3,
  xMax:3, samples:81}`. Moving a named slider then recomputes the chart locally;
  do not emit a static series and claim it is interactive.
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
