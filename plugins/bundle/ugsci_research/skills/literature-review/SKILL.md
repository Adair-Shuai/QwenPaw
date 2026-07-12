---
name: literature-review
description: "Systematic literature review using PRISMA methodology. Searches multiple databases, screens results, and produces a structured synthesis with verified citations."
metadata:
  builtin_skill_version: "1.0"
  qwenpaw:
    emoji: "📚"
    requires: {}
---

# Literature Review (PRISMA)

Perform a systematic literature review following the PRISMA framework.

## Workflow

### 1. Search Strategy
- Decompose the research question into 3-5 facets
- For each facet, search: OpenAlex, arXiv, Crossref
- Use the `literature_search` tool with appropriate queries

### 2. Screening
- **Title/Abstract screening**: Remove duplicates, then screen by relevance
- **Full-text screening**: Read promising papers, assess methodology quality
- Record exclusion reasons

### 3. Data Extraction
For each included paper:
- Citation (BibTeX format)
- Study type (experimental, theoretical, review)
- Key findings
- Methodology
- Limitations

### 4. Synthesis
Write `literature-review.md`:

```markdown
# Literature Review: [Topic]

## Summary
[2-3 paragraph synthesis across all facets]

## Key Findings by Facet
### [Facet 1]
- [Finding with citation]

## Identified Gaps & Opportunities
- [Gap 1]
- [Gap 2]

## Complete References
[BibTeX entries]
```

## Critical Rules

- **Verify every citation is real** — use `literature_search` to confirm
- **Never fabricate papers, authors, or DOIs**
- If a database returns no results, note it and try another
- Include the search query and database in the methods section
