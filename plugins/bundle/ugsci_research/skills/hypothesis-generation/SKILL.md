---
name: hypothesis-generation
description: "Systematic hypothesis generation and evaluation. Helps structure research questions, generate testable hypotheses, and assess feasibility before committing to experiments."
metadata:
  builtin_skill_version: "1.0"
  qwenpaw:
    emoji: "💡"
    requires: {}
---

# Hypothesis Generation

Systematically generate and evaluate research hypotheses.

## Process

### 1. Knowledge Consolidation
- Summarize what is known from literature
- Identify established facts vs. contested claims
- Map the boundary of current knowledge

### 2. Gap Identification
- What questions remain unanswered?
- What contradictions exist in the literature?
- What new data/techniques are now available?

### 3. Hypothesis Generation
For each candidate hypothesis, state:
- **Formal statement** (H1: "X causes Y because...")
- **Null hypothesis** (H0: "X has no effect on Y")
- **Required evidence** to confirm/reject
- **Feasibility** (high/medium/low — why?)
- **Novelty** (does this extend beyond existing work?)
- **Significance** (what would confirmation mean?)

### 4. Structured Deliberation

| Hypothesis | Strengths | Weaknesses | Key Uncertainty | Info Gain |
|------------|-----------|------------|-----------------|-----------|
| H1 | ... | ... | ... | ... |
| H2 | ... | ... | ... | ... |

### 5. Selection
- Choose the hypothesis with best feasibility × significance
- Pre-specify success criteria BEFORE any analysis
- Define a fallback plan if the primary hypothesis fails

## Output

Write `reasoning.md` with the full deliberation process.
