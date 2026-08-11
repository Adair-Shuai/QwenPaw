---
name: reservoir-production
description: Guide AI agents through reservoir management and production optimization using UGSci domain tools.
---

# Skill: Reservoir & Production Pipeline

Guide AI agents through reservoir management and production optimization using UGSci domain tools.

## Purpose

Support reservoir and production engineers in managing hydrocarbon extraction and optimizing well performance. Uses stable UGSci tools for decline curve analysis instead of direct scipy calls.

Use the UGSci deterministic petroleum tools for auditable calculations. Do not recreate material-balance, PVT, IPR, nodal-analysis, unit-conversion, or conservation formulas in ad-hoc Python when the matching tool is available.

## Roles

- **Reservoir Engineer** - Reservoir modeling, forecasting, depletion strategy
- **Production Engineer** - Well performance, artificial lift, well intervention
- **Well Intervention Engineer** - Workovers, stimulation, completions

## Data Types

| Data | Source | Frequency |
|------|--------|-----------|
| Oil/gas/water rates | SCADA/Metering | Daily/Real-time |
| Pressure (BHP, THP) | Downhole gauges | Real-time |
| Temperature | Downhole gauges | Real-time |
| Reservoir models | Eclipse, CMG, tNavigator | Updated annually |
| Well tests | Separators/MPFM | Monthly |

## Workflow

### Phase 1: Reservoir Characterization

1. Integrate seismic, logs, core data
2. Build geological model
3. Upscale to simulation model
4. History match to production data
5. Validate model

### Phase 2: Production Forecasting

1. Define development scenarios
2. Run reservoir simulation
3. Generate production forecast
4. Estimate reserves (P10/P50/P90)
5. Economic evaluation

### Phase 3: Well Optimization

1. Analyze well performance (inflow performance, vertical lift)
2. Identify production bottlenecks
3. Optimize artificial lift (gas lift, ESP, rod pump)
4. Plan well interventions
5. Monitor results

### Phase 4: Reservoir Monitoring

1. Track production vs. forecast
2. Monitor pressure trends
3. Analyze well interference
4. Update model as needed
5. Optimize depletion strategy

## Domain Tasks

These tasks are handled by this skill:

- Decline curve analysis
- Inflow performance relationship (IPR)
- Nodal analysis
- Material balance
- Reserves estimation

## Deterministic Tool Routing

Prefer these stable tools:

| Task | Tool |
|------|------|
| Unit conversion | `ugsci_convert_units` |
| Volumetric OOIP | `ugsci_volumetric_oil_in_place` |
| Oil material balance | `ugsci_oil_material_balance` |
| Gas p/z material balance | `ugsci_gas_material_balance` |
| Local black-oil screening PVT | `ugsci_black_oil_pvt` |
| Vogel IPR | `ugsci_vogel_ipr` |
| Screening nodal analysis | `ugsci_nodal_analysis` |
| Conservation/sanity check | `ugsci_conservation_check` |

For every result, preserve `units`, `metrics`, `assumptions`, `warnings`, `tolerances`, `applicability`, and `provenance`. Treat PyMC and pymoo as stochastic workflow Providers, not deterministic facts. Use NeqSim only when compositional thermodynamics or a higher-fidelity external Provider is required.

The direct Python equations later in this document are background references only. Do not prefer them over the registered UGSci tools.

## Software Tasks

These tasks invoke `petropowers:oil-gas-delegation`:

- Production allocation system
- Reservoir monitoring dashboard
- Automated well testing workflow
- Production database

## Example Workflows

### Decline Curve Analysis

**Default workflow — use UGSci tools:**

1. **Check data quality**: Verify time, rate, and units are correct before fitting.

2. **Fit decline curve** — use `ugsci_decline_fit` tool:

```
ugsci_decline_fit(
    time=[0, 3, 6, 9, 12, ...],
    rate=[1000, 834, 708, 609, 530, ...],
    time_unit="month",
    rate_unit="bbl/d",
    model="auto"
)
```

3. **Compare all candidates**: For `model="auto"`, review all successful fits (exponential, harmonic, hyperbolic), not just the recommended model. Each candidate includes RMSE, MAE, R², and AIC.

4. **Forecast production** — use `ugsci_decline_forecast` tool:

```
ugsci_decline_forecast(
    model="hyperbolic",
    qi=1000.0,
    di=0.12,
    b=0.6,
    forecast_time=[0, 1, 2, ..., 60],
    time_unit="month",
    rate_unit="bbl/d"
)
```

5. **Estimate EUR** — use `ugsci_decline_eur` tool:

```
ugsci_decline_eur(
    model="hyperbolic",
    qi=1000.0,
    di=0.12,
    b=0.6,
    time_unit="month",
    rate_unit="bbl/d",
    economic_limit=10.0
)
```

6. **Report results**: Include fit metrics, assumptions, uncertainty, and warnings from the UGSci output.

**When tools are not enabled**, instruct the user to enable them in **工具·技能 → 工具 → 平台内置**.

**Advanced reference** (direct scipy — only when stable tools are insufficient):

```python
import numpy as np
from scipy.optimize import curve_fit

def arps_decline(t, qi, di, b):
    """Arps decline equation"""
    return qi / (1 + b * di * t)**(1/b)

# Example production data
months = np.arange(1, 61)
actual_rate = 1000 / (1 + 0.1 * months)**(1/0.5)

# Fit decline curve
popt, _ = curve_fit(arps_decline, months, actual_rate, p0=[1000, 0.1, 0.5])

qi, di, b = popt
print(f"Initial rate (qi): {qi:.0f} bpd")
print(f"Initial decline (di): {di:.2f}")
print(f"Arps exponent (b): {b:.2f}")
```

### Inflow Performance (IPR)

```python
def vogel_ipr(p_res, p_wf, q_test):
    """Vogel IPR equation for undersaturated oil"""
    
    # Calculate productivity index
    pi = q_test / (p_res - p_wf)
    
    # Vogel equation: q/q_max = 1 - 0.2*(p_wf/p_res) - 0.8*(p_wf/p_res)^2
    q_max = q_test / (1 - 0.2*(p_wf/p_res) - 0.8*(p_wf/p_res)**2)
    
    def rate_at_pressure(pwf):
        return q_max * (1 - 0.2*(pwf/p_res) - 0.8*(pwf/p_res)**2)
    
    return rate_at_pressure

# Example: Reservoir pressure 3000 psi, tested at 2000 psi flowing
p_res = 3000
p_wf = 2000
q_test = 500  # bpd

ipr = vogel_ipr(p_res, p_wf, q_test)

# Calculate rate at different flowing pressures
for pwf in [2500, 2000, 1500, 1000]:
    rate = ipr(pwf)
    print(f"Pwf = {pwf} psi: Rate = {rate:.0f} bpd")
```

### Nodal Analysis

```python
def vlp_gas_lift(q, thp, depth, gl_rate, pipe_id=2.992):
    """Simplified vertical lift performance with gas lift"""
    # Simplified: gradient decreases with gas lift
    # rho = f(oil_rate, gas_lift_rate)
    
    # Approximate gradient (psi/ft)
    liquid_rate = q / 24  # bpd to bpm
    glr = gl_rate / liquid_rate if liquid_rate > 0 else 0
    
    # Gradient decreases with GLR
    gradient = 0.35 - 0.001 * glr
    gradient = max(gradient, 0.15)  # minimum gradient
    
    # Calculate BHP
    bhp = thp + gradient * depth
    
    return bhp

# Example: Optimize gas lift
thp = 150  # psi
depth = 8000  # ft
q = 500  # bpd

print("Gas Lift Rate | BHP Required")
print("-" * 30)

for gl_rate in [0, 1, 2, 3, 4]:
    bhp = vlp_gas_lift(q, thp, depth, gl_rate)
    print(f"{gl_rate:.0f} MMscfd | {bhp:.0f} psi")
```

### Material Balance

```python
def material_balance_oil(p, N, pi, bob, ce, cf):
    """Simplified material balance for undersaturated oil reservoir"""
    
    # F = N * (Eo + Ef)
    # F = Np * Bob  (production)
    # Eo = Bob - Boi (oil expansion)
    # Ef = (1-N) * (pi - p) * (ce + cf) / Bob
    
    # Simplified: assume constant Bo
    # Np = N * (pi - p) * ce / Bob
    
    expansion = (pi - p) * ce / bob
    Np = N * expansion
    
    return Np

# Example: 100 MMbbl reservoir
N = 100  # MMbbl
pi = 4000  # psi
p = 3500  # psi current pressure
bob = 1.2  # rb/stb
ce = 15e-6  # 1/psi (compressibility)
cf = 3e-6  # 1/psi (formation compressibility)

Np = material_balance_oil(p, N, pi, bob, ce, cf)
print(f"Cumulative production: {Np:.1f} MMbbl")
print(f"Recovery factor: {Np/N*100:.1f}%")
```

## Performance Indicators

| KPI | Units | Target |
|-----|-------|--------|
| Uptime | % | >95% |
| Water cut | % | Varies |
| Gas/oil ratio | scf/stb | Varies |
| Drawdown | psi | Optimized |
| Artificial lift efficiency | % | >80% |

## Quality Checklist

- [ ] Production data validated
- [ ] Well tests recent (< 3 months)
- [ ] Pressure data calibrated
- [ ] Reservoir model history matched
- [ ] Forecast assumptions documented

## References

- Craft & Hawkins (1991), "Applied Petroleum Reservoir Engineering"
- Arps (1945), "Analysis of Decline Curves"
- Vogel (1968), "Inflow Performance Relationships"
- SPE Reservoir Evaluation & Engineering
