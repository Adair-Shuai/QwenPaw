---
name: office-documents
description: "Create, read, and modify Word/Excel/PowerPoint documents using officecli tools. Triggered when creating .docx/.xlsx/.pptx files, editing document content, taking document screenshots, validating format, or merging templates. Includes: creating presentations/reports/spreadsheets from scratch; modifying element properties in existing documents; screenshotting rendered output; validating document format correctness."
license: Proprietary. LICENSE.txt has complete terms
metadata:
  builtin_skill_version: "1.0"
  qwenpaw:
    emoji: "📄"
---

# Office Document Operations (OfficeCLI)

## Prerequisites

- **officecli**: AI-native Office processing tool supporting Word/Excel/PPT creation, modification, and high-fidelity rendering
- Install: https://github.com/iOfficeAI/OfficeCLI/releases
- If officecli is not installed, all office_* tools return a friendly error message

## Tool List

### Default Tools (enabled by default)

| Tool | Purpose | Write |
|------|---------|-------|
| `office_create_document` | Create blank document | Yes |
| `office_add_element` | Add elements (slides/shapes/paragraphs/sheets) | Yes |
| `office_set_properties` | Set element properties | Yes |
| `office_get_element` | Get element details | No |
| `office_query_elements` | Query elements (CSS selector) | No |
| `office_remove_element` | Remove elements | Yes |
| `office_view_document` | View document (outline/html/issues) | No |
| `office_view_screenshot` | Screenshot rendered output | No |
| `office_validate_document` | Validate document format | No |
| `office_merge_template` | Merge data into templates | Yes |
| `office_batch_operations` | Batch operations | Yes |

### Advanced Tools (opt-in, `enabled_by_default=False`)

These tools are not loaded by default to reduce tool-selection overhead. Enable them when you need fine-grained control.

| Tool | Purpose | Write |
|------|---------|-------|
| `office_move_element` | Move/reorder elements within document | Yes |
| `office_swap_elements` | Swap two elements' positions | Yes |
| `office_get_text` | Extract plain text from document | No |
| `office_get_stats` | Get document statistics (pages, words, shapes) | No |
| `office_import_data` | Import CSV/JSON data into Excel | Yes |
| `office_refresh_fields` | Refresh TOC/page numbers/cross-refs (docx) | Yes |
| `office_raw_get` | Read raw OOXML part (50KB truncated) | No |
| `office_raw_set` | Modify raw OOXML via XPath | Yes |

> **Tip:** For the full CLI reference (L1→L2→L3 strategy, all element types, property formats), load the `officecli-reference` skill. For format-specific deep schemas, load `officecli-docx`, `officecli-pptx`, or `officecli-xlsx`.

## Standard Workflow

### Create a Document

```
1. office_create_document("report.pptx")
2. office_add_element("report.pptx", "/", "slide", {"title": "Title Page"})
3. office_add_element("report.pptx", "/slide[1]", "shape", {"type": "text", "content": "Content"})
4. office_view_screenshot("report.pptx", 1)  → check rendering
5. If issues → office_set_properties to fix → screenshot again
6. office_validate_document("report.pptx")  → validate format
```

### Modify Existing Document

```
1. office_view_document("existing.docx", "outline")  → view structure
2. office_get_element("existing.docx", "/", 2)  → inspect root and children
3. office_set_properties("existing.docx", "/paragraph[3]", {"text": "New content"})
4. office_view_screenshot("existing.docx", 1)  → confirm changes
```

### Template Merge

```
1. office_merge_template("template.docx", "output.docx", {"name": "John", "date": "2024-01-01"})
2. office_view_screenshot("output.docx", 1)  → check merged result
```

## Property Formats

| Type | Format | Examples |
|------|--------|----------|
| Size | number+unit | `2cm`, `1in`, `72pt`, `96px` |
| Color | hex/name/RGB | `FF0000`, `red`, `rgb(255,0,0)`, `accent1` |
| Font size | number+unit | `14`, `14pt`, `10.5pt` |
| Boolean | true/false | `true`, `false` |

## CJK / Chinese Paper Format Quick Reference

When creating Chinese academic papers, reports, or other CJK documents, set
formatting properties directly in `office_add_element`'s `props` — no need
for a separate `office_set_properties` call.

### Chinese Font Size Chart

| Chinese name | pt | prop value | Common use |
|---|---|---|---|
| 初号 | 42pt | `"42pt"` | Large title |
| 二号 | 22pt | `"22pt"` | Paper title |
| 三号 | 16pt | `"16pt"` | Chapter heading |
| 四号 | 14pt | `"14pt"` | Section heading |
| 小四 | 12pt | `"12pt"` | **Body text (most common)** |
| 五号 | 10.5pt | `"10.5pt"` | Abstract, captions |
| 小五 | 9pt | `"9pt"` | Headers/footers, footnotes |

### Body Paragraph (SimSun 12pt)

```python
office_add_element("paper.docx", "/body", "paragraph", {
    "text": "Body text content...",
    "font": {"eastAsia": "宋体", "ascii": "Times New Roman"},
    "size": "12pt",
    "align": "justify",          # justified
    "firstLineIndent": "480",    # 2-char indent (12pt × 2 × 20 twips/pt = 480)
    "lineSpacing": "1.5x",       # 1.5× line spacing
})
```

> **Note:** `firstLineIndent` uses **twips**, not CSS units. 1 pt = 20 twips.
> 2 × 12pt CJK chars = 2 × 12 × 20 = 480 twips. Do NOT use `"2em"` or `"2char"`.

### Headings

```python
# Paper title: SimHei 22pt centered
office_add_element("paper.docx", "/body", "paragraph", {
    "text": "Reservoir Evaluation Based on Well Logging Data",
    "font": {"eastAsia": "黑体"},
    "size": "22pt",
    "bold": True,
    "align": "center",
    "spaceAfter": "12pt",
})

# H1: SimHei 16pt
office_add_element("paper.docx", "/body", "paragraph", {
    "text": "1 Introduction",
    "style": "Heading1",
    "font": {"eastAsia": "黑体"},
    "size": "16pt",
    "bold": True,
})

# H2: SimHei 14pt
office_add_element("paper.docx", "/body", "paragraph", {
    "text": "3.1 Log Normalization",
    "style": "Heading2",
    "font": {"eastAsia": "黑体"},
    "size": "14pt",
    "bold": True,
})
```

### Three-Line Table (三线表)

```python
# Create table, then style as three-line table
office_add_element("paper.docx", "/body", "table", {
    "rows": 5, "cols": 4, "width": "100%"
})
# Header row
office_set_properties("paper.docx", "/body/tbl[1]/tr[1]", {
    "header": True,
    "c1": "Layer", "c2": "Depth(m)", "c3": "Porosity(%)", "c4": "Result",
})
# Three-line borders: thick top, thin under header, thick bottom
office_set_properties("paper.docx", "/body/tbl[1]/tr[1]/tc[1]/p[1]", {
    "pbdr.top": "single;12;000000",      # thick top border
    "pbdr.bottom": "single;6;000000",    # thin header-bottom border
})
office_set_properties("paper.docx", "/body/tbl[1]/tr[5]/tc[1]/p[1]", {
    "pbdr.bottom": "single;12;000000",   # thick bottom border
})
```

### Image Insertion

```python
office_add_element("paper.docx", "/body/p[5]", "image", {
    "src": "figure.png",
    "width": "13cm",
    "alt": "Fig.1 Well log curves",
})
# Caption (SimSun 10.5pt bold centered)
office_add_element("paper.docx", "/body", "paragraph", {
    "text": "Fig.1 Well log composite plot (2150–2300m)",
    "font": {"eastAsia": "宋体"},
    "size": "10.5pt",
    "bold": True,
    "align": "center",
})
```

### Headers, Footers & Page Numbers

```python
# Header
office_add_element("paper.docx", "/", "header", {
    "type": "default",
    "text": "Well Logging Research",
    "font": {"eastAsia": "宋体"},
    "size": "9pt",
    "align": "center",
})
# Footer with live page-number field
office_add_element("paper.docx", "/", "footer", {
    "type": "default",
    "text": "Page ",
    "field": "page",
    "size": "9pt",
    "align": "center",
})
```

### Common Mistakes vs Correct Usage

| Wrong | Correct | Why |
|---|---|---|
| `{"font_eastAsia": "宋体"}` | `{"font.eastAsia": "宋体"}` or `{"font": {"eastAsia": "宋体"}}` | Use dot or nested dict |
| `{"firstLineIndent": "2em"}` | `{"firstLineIndent": "480"}` | Twips, not CSS units |
| `{"lineSpacing": "1.5"}` | `{"lineSpacing": "1.5x"}` | Needs `x` suffix |
| `{"size": 12}` | `{"size": "12pt"}` | String with unit |

## Nested Props Auto-Flattening

`office_add_element` and `office_set_properties` support **nested dict props**,
automatically flattened to dotted-key format:

| Input | CLI argument |
|---|---|
| `{"font": {"eastAsia": "宋体"}}` | `--prop font.eastAsia=宋体` |
| `{"font": {"eastAsia": "宋体", "ascii": "Times New Roman"}}` | `--prop font.eastAsia=宋体 --prop font.ascii=Times New Roman` |
| `{"font.eastAsia": "宋体"}` | `--prop font.eastAsia=宋体` (passthrough) |
| `{"bold": True}` | `--prop bold=true` (bool auto-converted) |

Both forms are equivalent — use whichever you prefer.

## Batch Operations (office_batch_operations)

The field name for batch operations is `command` (also accepts `op` as an
alias). Legacy `action` is auto-mapped to `command` for backward
compatibility, but **new code should use `command`**.

```python
# Correct usage
office_batch_operations("paper.docx", [
    {"command": "add", "parent": "/body", "type": "paragraph",
     "props": {"text": "First paragraph", "size": "12pt"}},
    {"command": "add", "parent": "/body", "type": "paragraph",
     "props": {"text": "Second paragraph", "size": "12pt"}},
    {"command": "set", "path": "/body/p[1]",
     "props": {"font": {"eastAsia": "宋体"}, "align": "justify"}},
])
```

> **Note:** Nested dict props in batch commands are also auto-flattened.

## Element Paths

Paths use XPath-like syntax:

| Path | Meaning |
|------|---------|
| `/` | Document root |
| `/slide[1]` | First slide |
| `/slide[1]/shape[2]` | Second shape on first slide |
| `/sheet[1]/row[3]/cell[2]` | Row 3, cell 2 on first worksheet |
| `/paragraph[1]` | First paragraph |

## Visual Inspection (Important)

**After creating or modifying a document, always use `office_view_screenshot` to check the rendered output.**

Check for:
- Overlapping elements
- Text overflow
- Color contrast
- Layout spacing
- Leftover placeholder text

If issues are found, use `office_set_properties` to fix, then screenshot again to confirm, repeating until satisfied.

## Related Skills

For deeper knowledge, load these companion skills:

| Skill | When to Load |
|-------|-------------|
| `officecli-reference` | Need full CLI command reference, L1→L2→L3 strategy, or common pitfalls |
| `officecli-docx` | Working with .docx and need full element schema (styles, TOC, tracked changes, fields) |
| `officecli-pptx` | Working with .pptx and need full element schema (animations, transitions, charts, connectors) |
| `officecli-xlsx` | Working with .xlsx and need full element schema (pivot tables, conditional formatting, validations) |
