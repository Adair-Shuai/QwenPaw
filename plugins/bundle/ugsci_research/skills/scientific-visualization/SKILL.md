---
name: scientific-visualization
description: "Generate publication-quality scientific visualizations using matplotlib, plotly, and seaborn. Includes figure design principles, color palettes, and statistical plot types."
metadata:
  builtin_skill_version: "1.0"
  qwenpaw:
    emoji: "📈"
    requires: {}
---

# Scientific Visualization

Generate publication-quality figures for scientific research.

## Principles

1. **Data-driven** — Every figure must be generated from actual data, never
   AI-generated placeholders.
2. **Self-describing** — Axis labels, units, legend, and caption must be
   present and accurate.
3. **Colorblind-safe** — Use viridis, cividis, or colorblind-safe palettes.
4. **Reproducible** — Save the script that generates each figure.

## Common Plot Types

### Statistical
- `boxplot` / `violinplot` — distribution comparison
- `barplot` with error bars — group comparison
- `scatter` with regression line — correlation
- `heatmap` with dendrogram — clustering

### Time Series / Signals
- `line` with confidence band — temporal trends
- `spectrogram` — frequency analysis
- `phase portrait` — dynamical systems

### Scientific
- `contour` / `pcolormesh` — 2D fields
- `quiver` — vector fields
- `3D surface` — spatial data

## Code Template

```python
import matplotlib.pyplot as plt
import numpy as np

fig, ax = plt.subplots(figsize=(8, 5), dpi=150)
# ... plotting code ...
ax.set_xlabel("X (units)")
ax.set_ylabel("Y (units)")
ax.set_title("Figure Title")
plt.tight_layout()
fig.savefig("figure_name.png", bbox_inches="tight", dpi=300)
plt.close()
```

## File Naming

Save figures with descriptive names:
- `fig01_volcano_analysis.png`
- `fig02_training_curves.png`
- `fig03_phase_portrait.png`
