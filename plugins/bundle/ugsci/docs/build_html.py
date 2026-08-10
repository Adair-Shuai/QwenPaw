#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Convert UGSci Markdown docs to styled HTML.

Usage: python3 build_html.py
Run from the docs/ directory.
"""
import json
import os
import re
import shutil
import markdown
from pathlib import Path

DOCS_DIR = Path(__file__).parent
PLUGIN_DIR = DOCS_DIR.parent
RUNTIME_DOCS_DIR = PLUGIN_DIR / "static" / "docs"


def _metadata() -> dict[str, object]:
    """Read the canonical manifest so generated docs never carry old versions."""
    manifest = json.loads((PLUGIN_DIR / "plugin.json").read_text(encoding="utf-8"))
    skills = sorted((PLUGIN_DIR / "skills").glob("*/SKILL.md"))
    min_qwenpaw = manifest.get("qwenpaw_version", {}).get("min", "unknown")
    return {
        "version": manifest.get("version", "unknown"),
        "min_qwenpaw": min_qwenpaw,
        "skill_count": len(skills),
    }


METADATA = _metadata()

# ── Page metadata ──────────────────────────────────────────────────────────

PAGES = [
    ("index",        "UGSci 文档",          ""),
    ("user-manual",  "零基础使用手册（推荐）",  ""),
    ("user-guide",   "使用指南",              ""),
    ("architecture", "架构设计",              ""),
    ("frontend",     "前端开发指南",           ""),
    ("backend",      "后端开发指南",           ""),
    ("skills",       "技能列表",              ""),
    ("software-detection", "本地软件检测",      ""),
    ("expert-teams", "专家团",                ""),
]

# ── Shared CSS ────────────────────────────────────────────────────────────

CSS = r"""
:root {
  --bg: #ffffff;
  --bg-soft: #f8f9fa;
  --bg-code: #f1f3f5;
  --border: #e0e0e0;
  --text: #1a1a2e;
  --text-soft: #555;
  --primary: #1677ff;
  --primary-soft: #e6f4ff;
  --green: #52c41a;
  --orange: #fa8c16;
  --purple: #722ed1;
  --red: #ff4d4f;
  --sidebar-w: 260px;
  --max-content: 860px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
    "Noto Sans SC", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 15px;
  line-height: 1.7;
  color: var(--text);
  background: var(--bg);
}

/* ── Sidebar ─────────────────────────────────────────────────────────── */

#sidebar {
  position: fixed;
  top: 0; left: 0;
  width: var(--sidebar-w);
  height: 100vh;
  background: var(--bg-soft);
  border-right: 1px solid var(--border);
  overflow-y: auto;
  padding: 0;
  z-index: 100;
}

#sidebar .logo {
  padding: 20px 24px 16px;
  font-size: 20px;
  font-weight: 700;
  color: var(--primary);
  border-bottom: 1px solid var(--border);
}
#sidebar .logo small {
  display: block;
  font-size: 12px;
  font-weight: 400;
  color: var(--text-soft);
  margin-top: 4px;
}

#sidebar nav { padding: 12px 0; }
#sidebar nav a {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 24px;
  font-size: 14px;
  color: var(--text-soft);
  text-decoration: none;
  transition: all .15s;
  border-left: 3px solid transparent;
}
#sidebar nav a:hover {
  background: var(--primary-soft);
  color: var(--primary);
}
#sidebar nav a.active {
  color: var(--primary);
  font-weight: 600;
  border-left-color: var(--primary);
  background: var(--primary-soft);
}
#sidebar nav a .icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

/* ── Main ─────────────────────────────────────────────────────────────── */

#main {
  margin-left: var(--sidebar-w);
  padding: 40px 48px 80px;
  max-width: 1220px;
}

#main > *:first-child { margin-top: 0; }

/* ── Typography ───────────────────────────────────────────────────────── */

h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 40px 0 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--primary);
  color: var(--text);
}
h1:first-child { margin-top: 0; }

h2 {
  font-size: 22px;
  font-weight: 600;
  margin: 32px 0 16px;
  color: var(--text);
}

h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 24px 0 12px;
  color: var(--text);
}

h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 20px 0 10px;
  color: var(--text-soft);
}

p { margin: 12px 0; }
strong { font-weight: 600; color: var(--text); }
em { font-style: italic; color: var(--text-soft); }

a {
  color: var(--primary);
  text-decoration: none;
}
a:hover { text-decoration: underline; }

ul, ol {
  margin: 12px 0;
  padding-left: 24px;
}
li { margin: 4px 0; }

hr {
  border: none;
  border-top: 1px solid var(--border);
  margin: 32px 0;
}

blockquote {
  margin: 16px 0;
  padding: 12px 20px;
  border-left: 4px solid var(--primary);
  background: var(--primary-soft);
  border-radius: 0 8px 8px 0;
  color: var(--text-soft);
}
blockquote p { margin: 4px 0; }

/* ── Code ─────────────────────────────────────────────────────────────── */

code {
  font-family: "SFMono-Regular", "SF Mono", Consolas, "Liberation Mono", Menlo,
    monospace;
  font-size: 0.875em;
}

p > code, li > code, td > code {
  background: var(--bg-code);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--red);
}

pre {
  margin: 16px 0;
  padding: 16px 20px;
  background: #282c34;
  border-radius: 10px;
  overflow-x: auto;
  line-height: 1.5;
}
pre code {
  color: #abb2bf;
  font-size: 13px;
  background: none;
  padding: 0;
}

/* Syntax highlight (minimal — Pygments handles the heavy lifting) */
.code-block {
  margin: 16px 0;
  border-radius: 10px;
  overflow: hidden;
}
.code-block pre { margin: 0; border-radius: 10px; }

/* ── Tables ────────────────────────────────────────────────────────────── */

table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  font-size: 14px;
}
th, td {
  padding: 10px 14px;
  text-align: left;
  border: 1px solid var(--border);
}
th {
  background: var(--bg-soft);
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
}
tbody tr:nth-child(even) {
  background: var(--bg-soft);
}

/* ── Index page cards ──────────────────────────────────────────────────── */

.doc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  margin: 32px 0;
}
.doc-card {
  display: block;
  padding: 24px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  text-decoration: none;
  transition: all .2s;
  color: var(--text);
}
.doc-card:hover {
  border-color: var(--primary);
  box-shadow: 0 4px 20px rgba(22, 119, 255, 0.12);
  transform: translateY(-2px);
}
.doc-card .card-icon {
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: var(--primary);
  background: var(--primary-soft);
  border-radius: 6px;
  margin-bottom: 12px;
}
.doc-card .card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--text);
}
.doc-card .card-desc {
  font-size: 13px;
  color: var(--text-soft);
  line-height: 1.6;
}

/* ── Badge ─────────────────────────────────────────────────────────────── */

.badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 4px;
  vertical-align: middle;
}
.badge-blue { background: var(--primary-soft); color: var(--primary); }
.badge-green { background: #f6ffed; color: var(--green); }
.badge-orange { background: #fff7e6; color: var(--orange); }
.badge-purple { background: #f9f0ff; color: var(--purple); }

/* ── Manual table of contents ────────────────────────────────────────── */

.manual-shell {
  display: grid;
  grid-template-columns: minmax(0, 860px) 220px;
  gap: 40px;
  align-items: start;
}
.manual-content { min-width: 0; }
.manual-toc {
  position: sticky;
  top: 24px;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  border-left: 1px solid var(--border);
  padding-left: 16px;
}
.manual-toc-title {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}
.manual-toc a {
  display: block;
  padding: 4px 0;
  font-size: 13px;
  line-height: 1.45;
  color: var(--text-soft);
}
.manual-toc a:hover { color: var(--primary); }
.manual-toc a.level-3 {
  padding-left: 12px;
  font-size: 12px;
}

/* ── Mobile ────────────────────────────────────────────────────────────── */

@media (max-width: 768px) {
  #sidebar {
    width: 100%;
    height: auto;
    position: relative;
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
  #sidebar nav a { padding: 10px 24px; }
  #main { margin-left: 0; padding: 24px 20px 60px; }
}

@media (max-width: 1100px) {
  .manual-shell { display: block; }
  .manual-toc { display: none; }
}
"""

# ── Sidebar HTML ────────────────────────────────────────────────────────

def sidebar_html(active_id: str = "") -> str:
    items = []
    for pid, label, icon in PAGES:
        href = f"{pid}.html" if pid != "index" else "index.html"
        cls = "active" if pid == active_id else ""
        icon_html = f'<span class="icon">{icon}</span>' if icon else ''
        items.append(f'<a href="{href}" class="{cls}">{icon_html}{label}</a>')
    return f"""
<aside id="sidebar">
  <div class="logo">
    UGSci 文档
    <small>v{METADATA['version']} · 石油领域 QwenPaw 插件</small>
  </div>
  <nav>
    {''.join(items)}
  </nav>
</aside>"""


def page_html(title: str, active_id: str, body_html: str) -> str:
    if active_id == "user-manual":
        headings = re.findall(r'<h([23])(?:\s+id="([^"]+)")?>(.*?)</h\1>', body_html, flags=re.S)
        toc_items = []
        for level, heading_id, raw_title in headings:
            if not heading_id:
                continue
            label = re.sub(r"<[^>]+>", "", raw_title)
            toc_items.append(
                f'<a class="level-{level}" href="#{heading_id}">{label}</a>',
            )
        toc_html = "".join(toc_items) or '<p class="manual-toc-empty">本页暂无章节目录</p>'
        body_html = (
            '<div class="manual-shell">'
            f'<article class="manual-content">{body_html}</article>'
            f'<aside class="manual-toc"><div class="manual-toc-title">本页内容</div>{toc_html}</aside>'
            '</div>'
        )
    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} — UGSci 文档</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
{sidebar_html(active_id)}
<div id="main">
{body_html}
</div>
</body>
</html>"""


# ── Convert markdown to HTML ────────────────────────────────────────────

def convert_md(md_text: str) -> str:
    """Convert markdown to HTML with extensions."""
    # Pygments-based code highlighting
    html = markdown.markdown(
        md_text,
        extensions=[
            "fenced_code",
            "codehilite",
            "tables",
            "toc",
            "nl2br",
            "sane_lists",
        ],
        extension_configs={
            "codehilite": {
                "guess_lang": False,
                "noclasses": True,
                "pygments_style": "one-dark",
            },
        },
    )
    # Replace pygments <div class="codehilite"> with our wrapper
    html = html.replace(
        '<div class="codehilite">',
        '<div class="codehilite code-block">',
    )
    return html


# ── Index page ──────────────────────────────────────────────────────────

INDEX_BODY = """
<h1>UGSci 文档</h1>

<blockquote>
<p>面向石油领域的 QwenPaw 增强插件。将 Agent 转化为领域专家，以 <strong>能力</strong>、<strong>技能</strong>、<strong>专家</strong> 三大模块重新组织界面，降低使用门槛。</p>
</blockquote>

<h2>文档导航</h2>

<div class="doc-grid">

<a class="doc-card" href="user-manual.html">
  <div class="card-icon">01</div>
  <div class="card-title">零基础使用手册（推荐）</div>
  <div class="card-desc">结合官方文档与真实界面截图，从第一次启动到专家团、技能、市场和专业示例一步一步学习。</div>
</a>

<a class="doc-card" href="user-guide.html">
  <div class="card-icon">02</div>
  <div class="card-title">使用指南</div>
  <div class="card-desc">从安装到日常使用的完整指南，适合初次使用的用户快速上手。</div>
</a>

<a class="doc-card" href="architecture.html">
  <div class="card-icon">03</div>
  <div class="card-title">架构设计</div>
  <div class="card-desc">插件整体架构、数据流、前端注册机制和构建系统。</div>
</a>

<a class="doc-card" href="frontend.html">
  <div class="card-icon">04</div>
  <div class="card-title">前端开发指南</div>
  <div class="card-desc">页面组件、API 调用、构建流程和调试技巧。</div>
</a>

<a class="doc-card" href="backend.html">
  <div class="card-icon">05</div>
  <div class="card-title">后端开发指南</div>
  <div class="card-desc">技能池同步、HTTP API、扩展指南和日志配置。</div>
</a>

<a class="doc-card" href="skills.html">
  <div class="card-icon">06</div>
  <div class="card-title">技能列表</div>
<div class="card-desc">从源码自动统计并展示当前内置技能，避免文档与实际目录漂移。</div>
</a>

<a class="doc-card" href="software-detection.html">
  <div class="card-icon">07</div>
  <div class="card-title">本地软件检测</div>
  <div class="card-desc">检测引擎工作原理、已知软件清单和扩展方法。</div>
</a>

<a class="doc-card" href="expert-teams.html">
  <div class="card-icon">08</div>
  <div class="card-title">专家团</div>
  <div class="card-desc">多智能体协同模式、预设团队和自定义团队。</div>
</a>

</div>

<h2>快速开始</h2>

<ol>
<li><p>安装插件：</p>
<pre><code>cp -r plugins/bundle/ugsci ~/.qwenpaw/plugins/</code></pre></li>
<li><p>重启 QwenPaw 后端</p></li>
<li><p>切换到极简模式：</p>
<pre><code>localStorage.setItem("qwenpaw_sidebar_mode", "simple");</code></pre></li>
<li><p>刷新页面，开始使用专家中心、能力中心、技能中心和市场</p></li>
</ol>

<h2>核心模块</h2>

<table>
<thead>
<tr><th>模块</th><th>路由</th><th>说明</th></tr>
</thead>
<tbody>
<tr><td>专家中心</td><td>左侧“专家·协作”</td><td>Agent 转化为专家卡片，支持创建专家和专家团协同</td></tr>
<tr><td>能力中心</td><td>“工具·技能 → 引擎”</td><td>MCP 客户端展示 + 本地油气软件检测</td></tr>
<tr><td>技能中心</td><td>“工具·技能 → 技能”</td><td>技能池浏览、详情查看和安装状态</td></tr>
<tr><td>市场</td><td>左侧“市场”</td><td>远程技能搜索安装 + 专家模板创建</td></tr>
</tbody>
</table>
"""


def main():
    css_dir = DOCS_DIR / "css"
    css_dir.mkdir(exist_ok=True)

    # Markdown files are the only editable documentation source. Remove
    # generated HTML pages that are not part of the declared page catalogue so
    # retired documents cannot remain as a second, stale source of truth.
    expected_html = {f"{page_id}.html" for page_id, _title, _icon in PAGES}
    for stale_page in sorted(DOCS_DIR.glob("*.html")):
        if stale_page.name not in expected_html:
            stale_page.unlink()
            print(f"[cleanup] removed retired page → {stale_page.name}")

    # Write CSS
    (css_dir / "style.css").write_text(CSS, encoding="utf-8")
    print("[1/3] CSS written → css/style.css")

    # Convert all markdown pages
    for pid, title, _icon in PAGES:
        if pid == "index":
            body = INDEX_BODY
        else:
            md_file = DOCS_DIR / f"{pid}.md"
            if not md_file.exists():
                raise FileNotFoundError(
                    f"Canonical documentation source is missing: {md_file}",
                )
            md_text = md_file.read_text(encoding="utf-8")
            body = convert_md(md_text)
            body = body.replace("{{UGSCI_VERSION}}", str(METADATA["version"]))
            body = body.replace("{{QWENPAW_MIN_VERSION}}", str(METADATA["min_qwenpaw"]))
            body = body.replace("{{SKILL_COUNT}}", str(METADATA["skill_count"]))

        out_file = DOCS_DIR / f"{pid}.html"
        out_file.write_text(page_html(title, pid, body), encoding="utf-8")
        print(f"[2/3] {pid}.html written")

    # Runtime documentation is a self-contained static site served by the
    # UGSci backend. Keep Markdown as the source of truth, but publish only
    # generated HTML/CSS and screenshots in the package data path.
    RUNTIME_DOCS_DIR.mkdir(parents=True, exist_ok=True)
    # ``static/docs`` is generated output. Remove prior generated files so a
    # deleted Markdown source can never leave a stale HTML page in the wheel.
    for stale_file in sorted(
        (path for path in RUNTIME_DOCS_DIR.rglob("*") if path.is_file()),
        reverse=True,
    ):
        stale_file.unlink()
    for generated_page in sorted(DOCS_DIR.glob("*.html")):
        shutil.copy2(generated_page, RUNTIME_DOCS_DIR / generated_page.name)
    # The app entry point opens the approachable manual directly; the other
    # generated pages remain available from its sidebar for developers.
    shutil.copy2(DOCS_DIR / "user-manual.html", RUNTIME_DOCS_DIR / "index.html")
    runtime_css = RUNTIME_DOCS_DIR / "css"
    runtime_css.mkdir(parents=True, exist_ok=True)
    shutil.copy2(css_dir / "style.css", runtime_css / "style.css")
    runtime_assets = RUNTIME_DOCS_DIR / "assets" / "screenshots"
    runtime_assets.mkdir(parents=True, exist_ok=True)
    for image_file in sorted((DOCS_DIR / "assets" / "screenshots").glob("*.png")):
        shutil.copy2(image_file, runtime_assets / image_file.name)
    print(f"[3/3] runtime docs written → {RUNTIME_DOCS_DIR}")
    print("Done! Open index.html in a browser.")


if __name__ == "__main__":
    main()
