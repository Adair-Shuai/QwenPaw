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
