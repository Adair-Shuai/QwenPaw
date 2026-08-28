# UGSci Freeform Derivation Mode — Detailed Design

> Status: **Draft for review** · Version 0.1 · Scope: `plugins/bundle/ugsci/domain/trace`
> Companion: [domain-compute-engine-architecture.md](domain-compute-engine-architecture.md)

## 1. Problem statement

The curated library (`domain/trace/library/`) covers a fixed, vetted set of
petroleum/UGS formulas. That is the trustworthy path, but it cannot express an
engineer's *ad-hoc* question:

- "What's OGIP if the z-factor is a function of pressure, and I use the
  Standing correlation for Bo instead of a table?"
- "Derive Cv (cycled working-gas capacity) from the cushion fraction and the
  deliverability back-pressure exponent — but with my own exponent."
- "Show me the algebra that turns `G_p = OGIP*(1 - (p/z)/(p_i/z_i))` into
  `OGIP = ...`, and then plug in my numbers."

The curated path answers "run this known formula." Freeform mode answers
**"the agent builds the formula (or transforms a given one), and the engine
traces every symbolic step and every numeric substitution so the result is
auditable."**

Freeform is the *complimentary* mode: it trades curated trust for generality,
and must therefore isolate the unverified boundary as explicitly as the curated
path is trusted.

## 2. Goals & non-goals

### Goals

1. **Author arbitrary expressions** — an agent may submit a single expression,
   a sequence of expressions (a mini-worksheet), or a request to transform a
   known equation.
2. **Observe symbolic manipulation** — show each algebraic step (rearrange,
   substitute, simplify, solve) as it happens, rendered in Unicode math.
3. **Observe numeric substitution** — every variable bind, every numeric
   evaluation with its units, and every guard assertion.
4. **Reuse the existing worksheet** — freeform emits the *same* `TracedResult`
   + `build_trace_tree` card as curated mode, so the UI, live-edit form, and
   export all work unchanged.
5. **Be safe by default** — expressions are never `eval()`'d; they are parsed
   with SymPy under a lock-down that the tool layer can verify, and freeform is
   **opt-in** (disabled by default).

### Non-goals

- **Not** a CAS replacement (no indefinite symbolic integration by default, no
  `simplify` blow-up rescue beyond a hard cap).
- **Not** an execution sandbox for arbitrary Python — only symbolic math + the
  UGSci unit system.
- **Not** a second solver engine for full reservoir simulation.

## 3. Why freeform needs its own security model

Curated formulas are authored, reviewed code. Freeform expressions are
**untrusted input produced by a model**. The existing `_validate_inputs` in
`domain/trace/tools.py` already rejects non-dict inputs, unknown keys, and
non-finite values for curated formulas. Freeform adds a much bigger surface:

- Symbolic expressions can reference arbitrary names, attributes, functions.
- SymPy itself has the same hazards as `eval` when given an unrestricted
  parse — `sympy.sympify` / `parse_expr` can reach arbitrary Python through
  the `locals` dict or through a **transformation whitelist** that is too
  permissive.
- Output size is unbounded (expanded polynomials, huge simplifications).

So freeform is governed by a **four-layer gate**:

```
Layer 1  Expression contract (agent-facing)     — grammar, symbol list, caps
Layer 2  Parsing sandbox                        — sympy.parse_expr with an
                                                 explicit, minimal locals table
                                                 and transformation allowlist
Layer 3  Evaluation sandbox                     — safe substitution on sympy
                                                 expressions, never eval()
Layer 4  Resource guards                        — size/depth/time/node caps
```

Freeform is **disabled by default**; it is enabled by a per-session or
per-agent setting, analogous to the existing GenUI `allow_html`/`allow_actions`
gates.

## 4. Architecture

```
model / agent
   │  ugsci_derive_formula(request)          ugsci_evaluate_formula(request)
   │  ugsci_transform_formula(request)       ugsci_formula_preview(request)
   ▼
─────────────────────────────────────────────
freeform/
  request.py      pydantic request models (validate shape BEFORE sympy)
  parser.py       Layer 2 — sympy.parse_expr under lockdown
  symbols.py      symbol allowlist derivation + unit inference
  transform.py    rearrange / substitute / simplify / solve wrappers → TraceSteps
  evaluate.py     Layer 3 — numeric substitution, unit propagation, guards
  guards.py       Layer 4 — size/depth/iteration/fraction caps
  errors.py       FreeformError → DomainErrorCode mapping
─────────────────────────────────────────────
   │  produces TracedResult (same as curated)
   ▼
trace/models.py    TraceStep / VariableBinding / DerivationTrace
trace/recorder.py  TraceRecorder
genui/domain_cards.py   build_trace_tree  (unchanged — freeform reuses it)
```

The `source` field on `DerivationTrace` distinguishes the two modes:

- `"curated"` → human-reviewed formula, `provenance.curated=True`
- `"freeform"` → model-authored, `provenance.curated=False`, and a
  `provenance.freeform_engine` + `provenance.parser_hash` recorded.

## 5. Request models (`freeform/request.py`)

Three tools, one request grammar each.

### `ugsci_derive_formula`

The agent provides a **target statement** (what to prove/derive) and the known
constraints. The engine does minimal symbolic rearrangement and traces it.

```
{
  "expression": "G_p = OGIP * (1 - (p/z) / (p_i/z_i))",
  "solve_for": "OGIP",
  "symbols": {                       # symbol -> unit (optional but recommended)
      "G_p": "scf", "OGIP": "sm3",
      "p": "psi", "z": "", "p_i": "psi", "z_i": ""
  },
  "assumptions": ["volumetric dry gas", "no water influx"],
  "max_steps": 20,                   # Layer 4
  "idempotent": true                 # whether simplify is allowed (default false)
}
```

### `ugsci_evaluate_formula`

Plug in numbers and trace the numeric substitution.

```
{
  "expression": "OGIP = G_p / (1 - (p/z) / (p_i/z_i))",
  "inputs": {
      "G_p": 1e9, "p_i": 3000, "z_i": 0.85,
      "p": 2000, "z": 0.88
  },
  "units": { "G_p": "scf", "p": "psi", "OGIP": "sm3" },
  "output_symbol": "OGIP",
  "tolerance": 1e-8
}
```

### `ugsci_transform_formula`

Rename / rearrange a *given* equation, returning the transformed form as a
trace. Useful for "show me the steps to isolate Cv from that equation."

### `ugsci_formula_preview`

Dry-run: parse + validate + return the first symbolic step (or an error) without
computing. Lets the agent (or the human) *see* that an expression is parseable
before committing to a full derivation. This is the safety valve for "I'm not
sure this is valid syntax."

> All four tools return the same `ToolChunk` envelope as curated tools
> (`emit_tool_chunk`), so the existing health/gateway paths apply.

## 6. Parsing sandbox (`freeform/parser.py`) — the critical piece

### 6.1 `eval` is never used

`evaluate`/`subs` operate on **SymPy expression objects**, not on Python
strings. The only place a string is turned into code is the single
`parse_expr` call in the parser.

### 6.2 `parse_expr` lockdown

`sympy.parse_expr(s, local_dict=ALLOWED, transformations=TRANSFORMS)`:

- **`ALLOWED` locals table** is a hand-built dict, *not* `sympy.__dict__` and
  *not* a module namespace. It contains only:
  - Math ops & constants: `pi`, `E`, `I`, `Integer`, `Rational`, `Float`,
    `Symbol`, `sqrt`, `exp`, `log`, `sin`, `cos`, `tan`, `atan`, `Min`, `Max`,
    `Abs`.
  - Petroleum helper names that are safe and meaningful: `psia`, `scf`,
    `stb`, `m3`, `kPa`, `psi`, `sm3`, `d`, `h`, `y`, `wk` **only as units**,
    not as free variables (units are handled by `evaluate.py`, not parsed).
  - **No** `exec`, `eval`, `open`, `__import__`, `__builtins__`, `os`, `sys`,
    `getattr`, `lambda`, `Function`, `solve` (top-level).
- **`TRANSFORMS`** is the small, explicit list:
  `standard_transformations + (auto_number,)^(`. It is *not*
  `implicit_multiplication` + `split_symbols` alone — we explicitly opt out of
  `convert_xor`, `sqrt`-shorthand ambiguity, and any transform that would let a
  bare token become a function call.

### 6.3 Post-parse structural validation

SymPy gives back an expression tree; we walk it **before** doing anything else:

- Every `Symbol` name must be in the symbol allowlist (either the request
  `symbols` keys, or a safe auto-derived set, §7).
- No `Function` node with a name outside the allowlist; no `AssumptionObject`,
  no `Derivative`, no `Integral`, no `Piecewise`, no nested `Tuple`.
- Expression **size cap**: `count_ops()` ≤ a constant (`MAX_SYMPY_OPS`, e.g.
  200), and free-symbol count ≤ `MAX_SYMBOLS` (e.g. 32).
- Depth cap via a quick recursive walk.

If any check fails, return a **`DomainError(UNSUPPORTED_OPERATION)`** with a
`details` list naming the violating node — so the model can correct itself.

## 7. Symbol allowlist and unit inference (`symbols.py`)

- Symbols are **explicit** when the agent supplies them (the `symbols` /
  `inputs` dicts). This is the preferred, deterministic path.
- When a symbol is *not* supplied, the engine **infers** a unit by name lookup
  in a small built-in table (`p`/`pres`/`pressure`→`psi`, `q`→`stb/d`,
  `G_p`→`scf`, `V`→`m3`, etc.) and records the inference in `provenance`.
  Unknown-name symbols carry unit `""` and are marked `unit_unknown`.
- Auto-generated symbols (like the dummy variable for `solve_for`) are
  validated against the allowlist too.

## 8. Transformation engine (`transform.py`)

Each operation maps to the same `TraceStep` kinds the curated path uses, so the
worksheet renders identically:

| Freeform op | SymPy call | TraceStep emitted |
|---|---|---|
| `substitute` | `expr.subs({old: new})` | `kind=symbolic, operation=substitute, group=substitute` |
| `rearrange` | `solve(expr, target)` | `kind=symbolic, operation=solve, group=solve` |
| `simplify` | `sp.simplify` (only if `idempotent`) | `kind=symbolic, operation=simplify` |
| `expand` | `sp.expand` | `kind=symbolic, operation=simplify` |
| `collect` | `sp.collect` | `kind=symbolic, operation=simplify` |
| `solve_for` | `sp.solve(expr, target)` | `kind=symbolic, operation=solve` |

Each transform is bounded by `max_steps` and by a **result-size check** after
each transform (a `simplify` that inflates `count_ops` beyond the cap is
rejected and the step is recorded as a warning, not a silent failure).

`rearrange` is built on `sp.solve`, so it returns a list of solutions; the
engine selects the real-valued one (or the one with the fewest `I` if complex)
and records `note` explaining the choice.

## 9. Numeric evaluation & units (`evaluate.py`)

`evaluate` does **not** call `sympy` functions; it substitutes floats via
`expr.subs(symbol, value)` and then evaluates a **pre-validated** `.evalf()` or
a manual top-down numeric walk for unit propagation.

- **Unit propagation** reuses the existing `domain/deterministic/units.py`
  (`normalize_unit`, `convert`, `require_unit`). The engine assigns a
  dimension to each symbol from the `units` dict, and after evaluating a
  sub-expression it checks the result's unit dimension is compatible with the
  expected output unit. A mismatch raises `DomainError(INVALID_INPUT)` with a
  message naming the offending symbol — so the agent can fix the unit.
- **Finite check** on every intermediate result. `nan`/`inf` → `DomainError`.
- **Guards**: the engine auto-emits `assert_true` steps for the same sorts of
  validity checks the curated path does (denominator away from zero, finite
  result, monotonicity when relevant), with `group="verify"`.

`evaluate` never touches `eval` or `sympify` on a user string.

## 10. Resource guards (`guards.py`)

Hard caps, all constants centralised so tests can lock them:

| Cap | Constant | Default |
|---|---|---|
| Max expression ops | `MAX_SYMPY_OPS` | 200 |
| Max distinct symbols | `MAX_SYMBOLS` | 32 |
| Max derivation steps | `MAX_TRACE_STEPS` | 25 |
| Max numeric substitution count | `MAX_SUBS` | 1,000 |
| Max single value magnitude | `MAX_MAGNITUDE` | 1e15 |
| Max transform wall time | `MAX_TRANSFORM_SECONDS` | 5.0 |
| Simplify allowed? | `ALLOW_SIMPLIFY` | false (opt-in) |

When a cap is hit, the engine stops, emits a **warning** step, and returns the
partial trace *plus* a `warnings` entry — it never hangs and never silently
truncates. A thrown guard is a `DomainError(NON_CONVERGENT)` (retryable) with a
`details` message.

## 11. Trust boundaries — how the worksheet discloses provenance

The freeform card carries an explicit **unverified badge** so the human knows
this came from a model, not a reviewed formula. `build_trace_tree` reads the
`provenance` block:

- `source == "freeform"` → show a warning `Alert` at the top:
  "自由公式推断，未经审校" and a `Badge` "AI-推导 / 未审校".
- `provenance.unit_unknown` → list any symbol whose unit was inferred.
- `provenance.parser_hash` → a hash of the locked-down parser config, so a
  future change to the sandbox is auditable per-result.

Live-edit re-submission in freeform mode **re-runs the same tool** with the new
values; the `ui_id` is stable, so the card updates in place (identical to the
curated live-edit loop already shipped).

## 12. Settings / gating

Freeform is **off by default**, surfaced as a GenUI-style setting in
`genui/settings.py` or a dedicated `trace` settings block:

```
tags: ["domain_engineering"]
ugsci.trace.freeform_enabled     = false      # master switch
ugsci.trace.freeform_max_steps   = 25
ugsci.trace.freeform_simplify    = false
```

Two ways to enable:
- **Per-agent** (recommended default): the agent profile opts in, so only
  trusted agents expose freeform tools.
- **Per-session / channel**: a channel config flag, guarded by the same
  `get_current_channel()` logic used for GenUI.

When disabled, `ugsci_derive_formula` / `_evaluate_` / `_transform_` /
`_preview_` return the stable "feature_unavailable" `ToolChunk` (reusing the
GenUI `genui_unavailable()` pattern), and the tools are **not** registered into
the manifest (so they don't even appear in the agent's tool list).

## 13. Dependency strategy

- `sympy` is already in `requirements-optional.txt` and only imported inside
  `parser.py` / `transform.py` at call time. If sympy is absent, the tools
  return `DomainError(DEPENDENCY_UNAVAILABLE)`. Curated mode works without it.
- No new runtime dependency. `asciimath.py` stays pure-Python.
- Tests that need sympy are marked `@pytest.mark.slow` / gated by
  `pytest.importorskip("sympy")` so CI without optional deps stays green.

## 14. Tool registration

Four tools added to `plugin.json` `meta.tools` under a new `"group":
"freeform"` (mirrors the existing `derivation` group), and registered in
`plugin.py` via a `_register_freeform_tools()` method. `tool_manifest.py`
`_VALID_GROUPS` gains `"freeform"`.

## 15. Error handling

All freeform failures are `DomainError` subclasses mapped to `DomainErrorCode`:

| Condition | Code | Retryable |
|---|---|---|
| sympy missing | `dependency_unavailable` | no |
| Parse fails / invalid syntax | `invalid_input` | yes (agent can rephrase) |
| Symbol not in allowlist | `unsupported_operation` | yes |
| Unit mismatch | `invalid_input` | yes |
| Non-finite intermediate result | `invalid_result` | yes |
| Exceeded op/symbol/depth cap | `non_convergent` | yes |
| Transform timed out | `non_convergent` | yes |
| Solve produced no real root | `calculation_failed` | yes |

`details` carries a *list of offending node names* / symbol / unit, so the
model can self-correct in the next turn.

## 16. Test plan

`tests/unit/plugins/ugsci/test_domain_trace_freeform.py`

| Layer | Cases |
|---|---|
| Parser | safe expression parses; `__import__`/`eval`/`os`/`getattr`/`lambda` rejected; symbol outside allowlist rejected; nested-func cap hit → `unsupported_operation` |
| Transform | `solve_for` isolates the target; `substitute` emits correct `reads/writes`; simplify only when `idempotent`; result-size inflate → warning step |
| Evaluate | numeric result matches SymPy `evalf`; unit mismatch raises; nan/inf raises; guard asserts emitted; magnitude cap |
| Provenance | `source=="freeform"`, `curated=False`, `parser_hash` present; unit-unknown symbols listed |
| GenUI | `build_trace_tree` emits the unverified `Alert` + `Badge` + warning; `validate_ui_tree` passes; live-edit form renders & re-invoke template correct |
| Gating | disabled → `feature_unavailable`; enabled → tools register |
| Contract | `_VALID_GROUPS` includes `freeform`; manifest bindings match |

Plus a **golden end-to-end** test: freeform derivation of the same p/z result as
the curated formula (same inputs → the SAME OGIP), proving the two modes agree
when the agent authors the canonical equation.

## 17. Risks & open questions

1. **`sp.solve` is slow / can hang** on some inputs — `max_steps` + timeout
   guard is required; decide whether the timeout is a hard kill or a
   best-effort result. (Recommendation: best-effort with a non-convergent
   warning, never a hard crash.)
2. **`implicit_multiplication` transform** enables guessable-but-risky
   expansions. We therefore **exclude** it by default; if we want
   "`2x` = `2*x`" convenience, gate it behind `allow_implicit_multiplication`
   and validate the resulting parse carefully.
3. **Freeform + live-edit**: a user could edit a freeform card's inputs and
   re-submit; the re-run is safe (same sandbox) but each new value is a new
   untrusted expression. Acceptable because the sandbox bounds it.
4. **Unit inference correctness** is the single biggest *scientific* risk. The
   built-in name→unit table must be reviewed by a reservoir engineer; a wrong
   inference is worse than a "unit unknown" flag. Recommendation: **never
   infer silently** — always emit a warning when a unit is inferred, default to
   `unit_unknown` in prose.
5. **How much of the derivation to show**: some requests are "derive A from B"
   (chemistry-style) that require genuinely large algebra. We set
   `MAX_TRACE_STEPS=25` and `MAX_SYMPY_OPS=200`, and when we know the derivation
   is open-ended we **delegate to the agent's own reasoning** and only *trace*
   the final rearrangement the engine can verify — the agent narrates, the
   engine confirms.

## 18. Phase plan

| Phase | Deliverable | Test gate |
|---|---|---|
| 1 (this doc's core) | `freeform/{request,parser,symbols,transform,evaluate,guards,errors}.py` + 4 tools + registration + settings | freeform parser/transform/evaluate tests pass; curated suite still green |
| 2 | Worksheet provenance badge (`Alert`/`Badge`), unit-unknown warnings, live-edit re-run | GenUI contract tests |
| 3 | Golden equivalence test (freeform == curated for p/z) + full regression | full UGSci suite |

## 19. Conclusion

Freeform mode closes the gap between "use a curated formula" and "ask a
question the library can't answer." It does so by reusing the auditable trace
model built for curated derivations, while isolating the one new risk — model-
authored symbolic code — behind a four-layer gate and an explicit, user-visible
trust boundary. The worksheet, live-edit loop, and export path are unchanged;
only the *authoring source* differs, and the UI says so.

---

## 中文要点摘要

**背景**：curated 库只覆盖审定公式，无法回答工程师的临时问题（如"z 因子随压力变化怎么算 OGIP"）。freeform 模式让 agent 自由构建/变换公式，但同样可追踪每一步符号操作和数值代入。

**核心设计**：复用现有 `TracedResult` + `build_trace_tree` 工作表（UI、实时编辑、导出完全不变），区别仅在 `provenance.source == "freeform"`，界面上明确标注"AI-推导/未审校"。

**四个工具**：
- `ugsci_derive_formula` — 推导目标表达式（求解/重组某个变量）
- `ugsci_evaluate_formula` — 代入数值，追踪数值代换
- `ugsci_transform_formula` — 变换给定方程（重命名/重组）
- `ugsci_formula_preview` — 干跑：只解析+验证，不计算（安全阀）

**四层安全门（最关键）**：
1. 请求模型校验（形状/符号/上限）
2. 解析沙箱 — `sympy.parse_expr` 用白名单 `local_dict`（不含 `eval`/`os`/`__import__`/`getattr`）+ 显式变换列表；解析后遍历语法树，校验符号、函数、`count_ops`、深度
3. 求值沙箱 — 只对 sympy 表达式对象做 `subs`/`evalf`，**永不 eval**
4. 资源上限 — ops≤200、符号≤32、步≤25、数值≤1e15、每次变换≤5s

**单位处理**：复用了 `domain/deterministic/units.py` 的 `convert`/`require_unit`。符号单位显式传入最稳；未传时按内置查表推断并**必须**给出警告，推断不出标为 `unit_unknown` —— 绝不静默推断。

**默认关闭**：由 per-agent / per-channel 设置开启；关闭时工具不注册、调用返回 `feature_unavailable`。SymPy 仍为可选依赖，仅 freeform 需要。

**风险重点**：`sp.solve` 可能慢/挂起（需超时保护）、`implicit_multiplication` 变换默认排除、单位推断是最大的科学性风险（推荐"宁标未知、不静默推断"）。

**下一步建议**：先做 Phase 1（四个工具 + 沙箱 + 注册 + 设置），再补 GenUI 信任徽章，最后加"freeform 与 curated 在 p/z 上数值一致"的黄金校验测试。

文档已写入 `plugins/bundle/ugsci/docs/domain-trace-freeform-design.md`。要我现在开始落地 Phase 1 吗？
