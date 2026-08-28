# -*- coding: utf-8 -*-
r"""ASCII / LaTeX-ish → Unicode math for traceable worksheets.

The GenUI Markdown node renders through ``react-markdown`` with only GFM
(no KaTeX/math plugin), so ``\frac`` and ``$$...$$`` would show up as literal
text.  ``to_unicode`` converts a plain-ASCII expression into Unicode math
(·, −, ², ³, subscripts, ½, ∂, Δ, …) so it reads correctly in any text node,
and ``latex_fragment`` renders a small self-contained LaTeX fragment (a single
``\frac{a}{b}`` or ``\dfrac{a}{b}``) into a ``/`` fractional form.

The conversions stay deterministic and dependency-free; unknown LaTeX is left
as-is rather than mangled.
"""

from __future__ import annotations

import re

# Superscript / subscript digits for rendering common powers and indexes.
_SUP = str.maketrans("0123456789+-=()", "⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾")
_SUB = str.maketrans("0123456789+-=()", "₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎")

# Subscript letters common in petroleum notation (the *_i / *_p pattern).
_SUBSCRIPT_LETTERS = {
    "a": "ₐ", "e": "ₑ", "i": "ᵢ", "j": "ⱼ", "k": "ₖ", "m": "ₘ",
    "n": "ₙ", "o": "ₒ", "p": "ₚ", "r": "ᵣ", "s": "ₛ", "t": "ₜ",
    "u": "ᵤ", "v": "ᵥ", "w": "w", "x": "ₓ", "y": "y", "z": "z",
}
_SUBSCRIPT_LETTERS = {k: v for k, v in _SUBSCRIPT_LETTERS.items() if v != k}

# Token-level replacements applied to symbol names / single letters.
_OPERATOR_REPL = {
    "*": "·",
    "**": "^",
    "->": "→",
    "<=": "≤",
    ">=": "≥",
    "!=": "≠",
    "==": "=",
    "sqrt": "√",
    "pi": "π",
}

_FRACTION_RE = re.compile(r"\\(?:dfrac|frac)\{([^{}]*)\}\{([^{}]*)\}")
_SCRIPT_RE = re.compile(r"\\?[_^]\{([^{}]*)\}")
_SUB_RE = re.compile(r"\b([A-Za-z])_([a-z])\b")
_SUP_RE = re.compile(r"\b([A-Za-z0-9])\^(-?\d+)\b")
_POW_RE = re.compile(r"\b([A-Za-z0-9])\^\{?(-?\d+)\}?\b")


def _script_body(body: str, kind: str) -> str:
    """Translate a LaTeX script body (``_i`` / ``^{2}``) to Unicode."""
    table = _SUP if kind == "sup" else _SUB
    if len(body) == 1 and (body.isalnum() or body in "+-=()"):
        if kind == "sub" and body in _SUBSCRIPT_LETTERS:
            return _SUBSCRIPT_LETTERS[body]
        return body.translate(table)
    # Multi-char script: render each char, then collapse to a run.
    return "".join(
        _SUBSCRIPT_LETTERS.get(ch, ch.translate(table))
        for ch in body
    )


def _render_script(expression: str) -> str:
    """Apply LaTeX-style scripts (``p_i``, ``G_p``, ``p^{2}``) to Unicode."""

    def handle_sub(match: re.Match) -> str:
        body = _script_body(match.group(2).strip(), "sub")
        # A single-element run is a true syllable suffix; otherwise wrap.
        return body

    # ``x_i`` (word boundary letter followed by _letter) — most common.
    expression = _SUB_RE.sub(lambda m: m.group(1) + _SUBSCRIPT_LETTERS.get(m.group(2), m.group(2)), expression)
    # ``x^{2}`` or ``x^2`` superscripts.
    expression = _POW_RE.sub(lambda m: m.group(1) + m.group(2).translate(_SUP), expression)
    # Braced scripts: ``x_{i}`` / ``x^{2}``.
    def braced(match: re.Match) -> str:
        prefix, body, kind = match.group(0)[0], match.group(1), "sub" if match.group(0)[0] == "_" else "sup"
        return _script_body(body, kind)
    expression = _SCRIPT_RE.sub(braced, expression)
    # Any remaining bare ``_`` followed by a token becomes a subscript run.
    expression = re.sub(r"_\{([^{}]*)\}", lambda m: _script_body(m.group(1), "sub"), expression)
    return expression


def _apply_operators(expression: str) -> str:
    # Longest tokens first so ``**`` is never treated as two multiplications.
    for token in sorted(_OPERATOR_REPL, key=len, reverse=True):
        replacement = _OPERATOR_REPL[token]
        if token.isalpha():
            expression = re.sub(rf"\b{re.escape(token)}\b", replacement, expression)
        else:
            expression = expression.replace(token, replacement)
    return expression


def _fraction(part: str) -> str:
    """Render a single ``\frac{a}{b}`` fragment as ``a / b``."""
    def repl(match: re.Match) -> str:
        num, den = match.group(1).strip(), match.group(2).strip()
        den = f"({den})" if re.search(r"[+\-·]", den) and not den.startswith("(") else den
        return f"{num} / {den}"
    previous = None
    rendered = part
    while rendered != previous:
        previous = rendered
        rendered = _FRACTION_RE.sub(repl, rendered)
    return rendered


def to_unicode(expression: str) -> str:
    """Convert an ASCII / LaTeX-ish expression to readable Unicode math."""
    if not expression:
        return ""
    text = str(expression)
    # Collapse LaTeX math delimiters and control whitespace.
    text = re.sub(r"\$\$?\s*|\s*\\?\;|\s*\\?\,", "", text)
    text = text.replace("\\left(", "(").replace("\\right)", ")")
    text = text.replace("\\left[", "[").replace("\\right]", "]")
    text = text.replace("\\text{", "").replace("\\mathrm{", "")
    # Standalone fractions (the common derive case).
    text = _fraction(text)
    # Consume braced powers before generic operators/scripts so no closing
    # brace leaks into the rendered text.
    text = re.sub(
        r"([A-Za-z0-9])\^\{([^{}]+)\}",
        lambda m: m.group(1) + _script_body(m.group(2), "sup"),
        text,
    )
    # Apply operators, then scripts last so ``^2`` etc. shrink correctly.
    text = _apply_operators(text)
    text = _render_script(text)
    # Collapse surrounding whitespace into single spaces.
    text = re.sub(r"\s+", " ", text).strip()
    return text


def latex_fragment(latex: str) -> str:
    r"""Turn a small self-contained LaTeX fragment into Unicode math.

    Handles the shapes the trace formulas emit: ``\dfrac{a}{b}``,
    ``\frac{a}{b}``, ``x_i``, ``p^{2}``, and mixed ``G_p(1 - …)``.
    Nested fractions (a fraction inside a denominator) are not expanded here;
    they fall back to a readable slash form rather than being mangled.
    """
    if not latex:
        return ""
    text = str(latex)
    # A bare fractional expression (single \frac/\dfrac, no braces inside).
    if not re.search(r"\\\w+\{[^{}]*\{", text):
        text = _fraction(text)
    return to_unicode(text)


__all__ = ["latex_fragment", "to_unicode"]
