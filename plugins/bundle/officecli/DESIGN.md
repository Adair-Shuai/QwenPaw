# OfficeCLI 融合改造方案（v2 — 核心集成）

> **状态**：待审核  
> **日期**：2026-07-24  
> **作者**：CatPaw  
> **涉及范围**：核心代码改造（无独立插件），重构 Office 预览渲染器

---

## 目录

1. [改造目标](#1-改造目标)
2. [整体架构](#2-整体架构)
3. [后端改造：workspace.py 预览重构](#3-后端改造)
4. [后端改造：Agent 工具注册](#4-agent-工具注册)
5. [前端改造：渲染器重构](#5-前端改造)
6. [技能与提示词](#6-技能与提示词)
7. [文件清单与工作量估算](#7-文件清单与工作量估算)
8. [渐进式迁移策略](#8-渐进式迁移策略)
9. [回退与降级策略](#9-回退与降级策略)
10. [测试计划](#10-测试计划)

---

## 1. 改造目标

| # | 目标 | 衡量标准 |
|---|------|---------|
| G1 | Agent 可通过结构化工具创建/读取/修改 Office 文档 | `office_create_document` 等工具注册到内置工具 registry |
| G2 | Agent 可截图查看文档并自我修正 | `office_view_screenshot` 返回 PNG ImageBlock |
| G3 | 工作区 Office 预览从"文本提取"升级为"高保真渲染" | PPTX 预览可见形状/配色/布局，非纯文本 |
| G4 | 预览重构不破坏现有 fallback 链 | officecli 不可用时自动回退到 mammoth/openpyxl |
| G5 | 零插件依赖——全部改动在核心代码中 | 无 `plugin.json`，无插件入口 |

---

## 2. 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      QwenPaw 核心                            │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Agent 内置工具 (src/qwenpaw/agents/tools/)           │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐│   │
│  │  │office_create │ │office_view_  │ │office_set_   ││   │
│  │  │_document     │ │screenshot    │ │properties    ││   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘│   │
│  │  ... 共 11 个工具，@tool_descriptor 自动注册          │   │
│  └────────────────────┬────────────────────────────────┘   │
│                       │ subprocess                          │
│                       ▼                                     │
│              ┌────────────────┐                             │
│              │  officecli 二进制 │  (32MB, self-contained)   │
│              └────────────────┘                             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  workspace.py 后端路由                                 │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │ POST /convert-office (重构)                    │   │   │
│  │  │   优先: officecli view html → 高保真 HTML       │   │   │
│  │  │   fallback: mammoth/openpyxl/python-pptx       │   │   │
│  │  ├──────────────────────────────────────────────┤   │   │
│  │  │ POST /office-screenshot (新增)                 │   │   │
│  │  │   officecli view screenshot → PNG             │   │   │
│  │  ├──────────────────────────────────────────────┤   │   │
│  │  │ POST /office-outline (新增)                    │   │   │
│  │  │   officecli view outline → JSON               │   │   │
│  │  ├──────────────────────────────────────────────┤   │   │
│  │  │ POST /office-issues (新增)                     │   │   │
│  │  │   officecli view issues → JSON                │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  前端 Workspace 渲染器                                 │   │
│  │  (console/src/components/Workspace/)                 │   │
│  │  ┌────────────────────┐  ┌────────────────────────┐│   │
│  │  │OfficeDocRenderer   │  │OfficeScreenshotRenderer ││   │
│  │  │(重构)               │  │(新增)                   ││   │
│  │  │调用 /convert-office │  │调用 /office-screenshot  ││   │
│  │  └────────────────────┘  └────────────────────────┘│   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**与 v1 方案的区别**：不创建独立插件，所有代码直接放在核心模块中。

| 组件 | v1 方案（独立插件） | v2 方案（核心集成） |
|------|-------------------|-------------------|
| Agent 工具 | `plugins/bundle/officecli/tools/` | `src/qwenpaw/agents/tools/office_tools.py` |
| 工具注册 | `api.register_tool()` | `@tool_descriptor` 自动注册 |
| HTTP 路由 | `api.register_http_router()` | 直接在 `workspace.py` 中添加 |
| 技能 | `api.register_skill_provider()` | 放入 `src/qwenpaw/agents/skills/` |
| 系统提示词 | `api.register_prompt_section()` | 注入到现有提示词系统 |
| 前端渲染器 | 插件 UI 贡献 | 直接在 `builtinRenderers.ts` 中注册 |

---

## 3. 后端改造

### 3.1 改造文件

`src/qwenpaw/app/routers/workspace.py`

### 3.2 改造 `_convert_docx_to_html` — 插入 officecli 优先路径

在函数 **最前面** 插入 officecli 检测和调用，现有 mammoth/openpyxl/python-pptx 逻辑原封不动保留为 fallback：

```python
import shutil
import subprocess

def _is_officecli_available() -> bool:
    """Check if officecli binary is on PATH."""
    return shutil.which("officecli") is not None


def _convert_with_officecli(file_path: str) -> str | None:
    """High-fidelity conversion via officecli view html.

    Returns HTML string on success, None on failure (caller falls back).
    """
    try:
        result = subprocess.run(
            ["officecli", "view", file_path, "html", "--json"],
            capture_output=True, text=True, timeout=30,
        )
        if result.returncode != 0:
            return None
        data = json.loads(result.stdout)
        # officecli --json 返回 {"html": "..."} 或 {"data": {"html": "..."}}
        return data.get("html") or data.get("data", {}).get("html")
    except (FileNotFoundError, subprocess.TimeoutExpired, json.JSONDecodeError):
        return None


def _convert_docx_to_html(file_path: str) -> str:
    """Convert a .docx/.xlsx/.pptx file to HTML for preview.

    Priority: officecli (high fidelity) → existing libs (fallback)
    """
    # ── 优先路径：officecli 高保真渲染 ──
    if _is_officecli_available():
        html = _convert_with_officecli(file_path)
        if html:
            return html
        # officecli 失败，继续走 fallback

    # ── Fallback：现有 mammoth / openpyxl / python-pptx 逻辑 ──
    ext = Path(file_path).suffix.lstrip(".").lower()
    if ext == "docx":
        # ... 现有 mammoth 代码不变 ...
    if ext == "xlsx":
        # ... 现有 openpyxl 代码不变 ...
    if ext == "pptx":
        # ... 现有 python-pptx 代码不变 ...
```

### 3.3 改造 `convert_office` 端点 — 返回渲染引擎标识

```python
@router.post("/convert-office", summary="Convert an Office document to HTML")
async def convert_office(request: Request, body: ConvertOfficeRequest) -> dict:
    # ... 现有文件路径解析逻辑不变 ...

    def _convert():
        if _is_officecli_available():
            html = _convert_with_officecli(str(target))
            if html:
                return html, "officecli"
        # fallback
        return _convert_docx_to_html(str(target)), "legacy"

    try:
        html, engine = await asyncio.to_thread(_convert)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return {"html": html, "engine": engine}
```

### 3.4 新增端点

在 `convert_office` 端点后面新增 3 个端点：

```python
class OfficeViewRequest(BaseModel):
    url: str
    page: int = 1  # 仅截图用


@router.post("/office-screenshot", summary="Render Office document page as PNG")
async def office_screenshot(request: Request, body: OfficeViewRequest) -> Response:
    """officecli view <file> screenshot --page N -o /tmp/xxx.png → PNG"""
    if not _is_officecli_available():
        raise HTTPException(404, "officecli not installed")

    workspace = await get_agent_for_request(request)
    coding_dir = get_coding_dir(workspace)
    file_path = _resolve_file_path(body.url, coding_dir)

    tmp_path = tempfile.mktemp(suffix=".png")
    result = await asyncio.to_thread(
        subprocess.run,
        ["officecli", "view", file_path, "screenshot",
         "--page", str(body.page), "-o", tmp_path],
        capture_output=True, timeout=60,
    )
    if result.returncode != 0 or not Path(tmp_path).exists():
        raise HTTPException(500, f"officecli: {result.stderr.decode()}")

    return FileResponse(tmp_path, media_type="image/png")


@router.post("/office-outline", summary="Get document outline")
async def office_outline(request: Request, body: ConvertOfficeRequest) -> dict:
    """officecli view <file> outline --json"""
    if not _is_officecli_available():
        raise HTTPException(404, "officecli not installed")
    # ... 解析路径 + 调用 officecli ...


@router.post("/office-issues", summary="Detect document issues")
async def office_issues(request: Request, body: ConvertOfficeRequest) -> dict:
    """officecli view <file> issues --json"""
    if not _is_officecli_available():
        raise HTTPException(404, "officecli not installed")
    # ... 解析路径 + 调用 officecli ...
```

---

## 4. Agent 工具注册

### 4.1 新增文件

`src/qwenpaw/agents/tools/office_tools.py`

参照现有 `shell.py`、`file_io.py` 等工具的 `@tool_descriptor` 模式，将 officecli 的 CLI 命令封装为结构化 Agent 工具。

### 4.2 工具清单（11 个工具）

| 工具名 | 对应 CLI | 参数 | 返回 | governance |
|--------|---------|------|------|-----------|
| `office_create_document` | `create` | `file_path: str` | JSON | `file_write` |
| `office_add_element` | `add` | `file_path, parent_path, element_type, props: dict` | JSON | `file_write` |
| `office_set_properties` | `set` | `file_path, path, props: dict` | JSON | `file_write` |
| `office_get_element` | `get` | `file_path, path, depth: int` | JSON | `file_read` |
| `office_query_elements` | `query` | `file_path, selector: str` | JSON | `file_read` |
| `office_remove_element` | `remove` | `file_path, path` | JSON | `file_write` |
| `office_view_document` | `view` | `file_path, mode: str` | 文本/JSON | `file_read` |
| `office_view_screenshot` | `view screenshot` | `file_path, page: int` | **PNG ImageBlock** | `file_read` |
| `office_validate_document` | `validate` | `file_path` | JSON | `file_read` |
| `office_merge_template` | `merge` | `template_path, output_path, data: dict` | JSON | `file_write` |
| `office_batch_operations` | `batch` | `file_path, commands: list` | JSON | `file_write` |

### 4.3 工具函数示例

```python
# src/qwenpaw/agents/tools/office_tools.py

import asyncio
import base64
import json
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Any

from agentscope.message import TextBlock, ToolResultState
from agentscope.tool import ToolChunk

from ...runtime.tool_registry import tool_descriptor
from ...config.context import get_current_workspace_dir


def _officecli_available() -> bool:
    return shutil.which("officecli") is not None


async def _run_officecli(*args: str, timeout: float = 60) -> dict:
    """Run officecli command and return parsed JSON output."""
    if not _officecli_available():
        return {"success": False, "error": "officecli is not installed. "
                "Install from: https://github.com/iOfficeAI/OfficeCLI/releases"}

    proc = await asyncio.create_subprocess_exec(
        "officecli", *args, "--json",
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    try:
        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=timeout)
    except asyncio.TimeoutError:
        proc.kill()
        return {"success": False, "error": "officecli command timed out"}

    if proc.returncode != 0:
        return {"success": False, "error": stderr.decode()}

    try:
        return json.loads(stdout.decode())
    except json.JSONDecodeError:
        return {"success": False, "error": "Invalid JSON output",
                "raw": stdout.decode()[:500]}


@tool_descriptor(
    requires_sandbox=("file_write",),
    async_execution=True,
    tool_type="file",
    target_param="file_path",
    policy_name="OfficeCreate",
    ui_description="Create Office documents (Word/Excel/PowerPoint)",
    ui_icon="📄",
)
async def office_create_document(file_path: str) -> Any:
    """Create a blank Office document (.docx, .xlsx, or .pptx).

    The document type is determined by the file extension.

    Args:
        file_path: Path for the new document. Must end with .docx, .xlsx, or .pptx.
    """
    result = await _run_officecli("create", file_path)
    return ToolChunk(
        is_last=True,
        state=ToolResultState.SUCCESS,
        content=[TextBlock(type="text",
            text=json.dumps(result, ensure_ascii=False, indent=2))],
    )


@tool_descriptor(
    requires_sandbox=("file_write",),
    async_execution=True,
    tool_type="file",
    target_param="file_path",
    policy_name="OfficeAddElement",
    ui_description="Add elements to Office documents",
    ui_icon="➕",
)
async def office_add_element(
    file_path: str,
    parent_path: str,
    element_type: str,
    props: dict[str, Any] | None = None,
) -> Any:
    """Add an element to an Office document.

    Args:
        file_path: Document path.
        parent_path: Parent element path (e.g. "/" for root, "/slide[1]" for slide 1).
        element_type: Element type (slide, shape, paragraph, sheet, etc.).
        props: Element properties (e.g. {"title": "Hello", "background": "1A1A2E"}).
    """
    args = ["add", file_path, parent_path, "--type", element_type]
    for key, value in (props or {}).items():
        args.extend(["--prop", f"{key}={value}"])
    result = await _run_officecli(*args)
    return ToolChunk(
        is_last=True,
        state=ToolResultState.SUCCESS,
        content=[TextBlock(type="text",
            text=json.dumps(result, ensure_ascii=False, indent=2))],
    )


@tool_descriptor(
    requires_sandbox=("file_read",),
    async_execution=True,
    tool_type="file",
    target_param="file_path",
    policy_name="OfficeScreenshot",
    ui_description="Screenshot Office document pages as PNG",
    ui_icon="📸",
)
async def office_view_screenshot(
    file_path: str,
    page: int = 1,
) -> Any:
    """Take a PNG screenshot of an Office document page.

    Used for AI visual inspection — see the rendered document and fix issues.

    Args:
        file_path: Document path (.docx/.xlsx/.pptx).
        page: Page/slide number (1-based).
    """
    if not _officecli_available():
        return ToolChunk(
            is_last=True,
            state=ToolResultState.SUCCESS,
            content=[TextBlock(type="text",
                text="Error: officecli is not installed.")],
        )

    tmp_path = tempfile.mktemp(suffix=".png")
    proc = await asyncio.create_subprocess_exec(
        "officecli", "view", file_path, "screenshot",
        "--page", str(page), "-o", tmp_path,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    await asyncio.wait_for(proc.communicate(), timeout=60)

    if proc.returncode != 0 or not Path(tmp_path).exists():
        return ToolChunk(
            is_last=True,
            state=ToolResultState.SUCCESS,
            content=[TextBlock(type="text",
                text=f"Screenshot failed for {file_path} page {page}")],
        )

    with open(tmp_path, "rb") as f:
        png_b64 = base64.b64encode(f.read()).decode()
    Path(tmp_path).unlink(missing_ok=True)

    return ToolChunk(
        is_last=True,
        state=ToolResultState.SUCCESS,
        content=[
            TextBlock(type="text",
                text=f"Screenshot of {file_path} page {page}:"),
            {"type": "image", "source": {
                "type": "base64",
                "media_type": "image/png",
                "data": png_b64,
            }},
        ],
    )


# ... 其余 8 个工具同理：office_set_properties, office_get_element,
#     office_query_elements, office_remove_element, office_view_document,
#     office_validate_document, office_merge_template, office_batch_operations
```

### 4.4 注册到工具模块

在 `src/qwenpaw/agents/tools/__init__.py` 中添加一行 import：

```python
# 在现有 import 列表末尾添加
from .office_tools import (
    office_create_document,
    office_add_element,
    office_set_properties,
    office_get_element,
    office_query_elements,
    office_remove_element,
    office_view_document,
    office_view_screenshot,
    office_validate_document,
    office_merge_template,
    office_batch_operations,
)
```

`@tool_descriptor` 装饰器会在 import 时自动注册到全局 registry，`__all__` 也会自动生成。无需其他手动注册。

---

## 5. 前端改造

### 5.1 改造文件清单

| 文件 | 改动类型 |
|------|---------|
| `console/src/components/Workspace/renderers/OfficeDocRenderer.tsx` | 修改 |
| `console/src/components/Workspace/renderers/OfficeScreenshotRenderer.tsx` | **新增** |
| `console/src/components/Workspace/store/builtinRenderers.ts` | 修改 |
| `console/src/locales/zh.json` | 修改 |
| `console/src/locales/en.json` | 修改 |

### 5.2 `OfficeDocRenderer.tsx` 改造

改动点：
1. 后端 `/convert-office` 返回值新增 `engine` 字段
2. 前端显示渲染引擎标识标签

```typescript
// 新增状态
const [rendererEngine, setRendererEngine] = useState<"officecli" | "legacy">("legacy");

// convertDocument 中解析 engine
const data = await res.json();
setHtmlContent(styledHtml);
setRendererEngine(data.engine === "officecli" ? "officecli" : "legacy");

// 工具栏新增标签
{rendererEngine === "officecli" && (
  <Tag color="green" style={{ fontSize: 10 }}>OfficeCLI 高保真渲染</Tag>
)}
{rendererEngine === "legacy" && (
  <Tag color="orange" style={{ fontSize: 10 }}>基础渲染</Tag>
)}
```

### 5.3 新增 `OfficeScreenshotRenderer.tsx`

```typescript
/**
 * OfficeScreenshotRenderer — Office 文档截图预览
 *
 * 使用 officecli view screenshot 生成 PNG，以图片方式展示。
 * 当 officecli 不可用时（404），自动降级到 OfficeDocRenderer。
 */
const OfficeScreenshotRenderer: React.FC<RendererContext> = ({
  artifact, theme, workspace,
}) => {
  const [screenshotUrl, setScreenshotUrl] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileUrl = artifact.binaryUrl ?? "";

  const fetchScreenshot = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/office-screenshot`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...buildAuthHeaders() },
        body: JSON.stringify({ url: fileUrl, page }),
      });
      if (!res.ok) {
        setError(res.status === 404 ? "officecli 未安装" : `HTTP ${res.status}`);
        setLoading(false);
        return;
      }
      const blob = await res.blob();
      setScreenshotUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [fileUrl]);

  useEffect(() => { fetchScreenshot(currentPage); }, [fetchScreenshot, currentPage]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* 工具栏：翻页 + 下载 */}
      <div style={{ /* 工具栏样式 */ }}>
        <Space>
          <FilePptOutlined />
          <Tag color="green">截图预览</Tag>
          <Button size="small" type="text" icon={<LeftOutlined />}
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))} />
          <span style={{ fontSize: 11, color: "#999" }}>
            {currentPage} / {pageCount}
          </span>
          <Button size="small" type="text" icon={<RightOutlined />}
            onClick={() => setCurrentPage(p => p + 1)} />
        </Space>
      </div>
      {/* 图片 */}
      <div style={{ flex: 1, overflow: "auto", display: "flex",
                     justifyContent: "center", alignItems: "flex-start",
                     background: theme === "dark" ? "#1e1e1e" : "#f5f5f5" }}>
        {loading ? <Spin size="large" /> :
         error ? <Alert type="warning" message={error} /> :
         <img src={screenshotUrl} alt={artifact.title}
              style={{ maxWidth: "100%", height: "auto" }} />}
      </div>
    </div>
  );
};
```

### 5.4 `builtinRenderers.ts` 改动

```typescript
import OfficeScreenshotRenderer from "../renderers/OfficeScreenshotRenderer";

// 在 office-doc 渲染器后新增
{
  id: "office-screenshot",
  name: "Office Screenshot",
  component: OfficeScreenshotRenderer,
  mimeTypes: [MimeTypes.DOCX, MimeTypes.XLSX, MimeTypes.PPTX],
  extensions: ["docx", "xlsx", "pptx"],
  priority: 15,  // 高于 office-doc (10)
  description: "Office 文档截图预览（officecli 渲染引擎）",
},
```

---

## 6. 技能与提示词

### 6.1 技能文件

放在 `src/qwenpaw/agents/skills/office-documents/SKILL.md`，由 QwenPaw 技能系统自动发现：

```markdown
---
name: office-documents
description: "使用 office 工具创建、读取、修改 Word/Excel/PowerPoint 文档。"
metadata:
  builtin_skill_version: "1.0"
  qwenpaw:
    emoji: "📄"
---

# Office 文档操作

## 工作流
1. `office_create_document` 创建空白文档
2. `office_add_element` 添加内容
3. `office_view_screenshot` 截图查看效果
4. `office_view_document` 查看大纲/问题
5. `office_set_properties` 修正属性
6. `office_validate_document` 验证格式
7. 重复 3-6 直到满意

## 属性格式
| 类型 | 示例 |
|------|------|
| 尺寸 | 2cm, 1in, 72pt, 96px |
| 颜色 | FF0000, red, rgb(255,0,0), accent1 |
| 字号 | 14, 14pt, 10.5pt |
```

### 6.2 系统提示词

通过现有提示词注入机制，在 workspace 上下文中添加 Office 文档能力描述。具体注入点参照 `src/qwenpaw/agents/` 中现有的 prompt section 模式。

---

## 7. 文件清单与工作量估算

### 7.1 新增文件

| 文件 | 说明 | 估时 |
|------|------|------|
| `src/qwenpaw/agents/tools/office_tools.py` | 11 个 Agent 工具函数 | 8h |
| `src/qwenpaw/agents/skills/office-documents/SKILL.md` | 技能文件 | 2h |
| `console/src/components/Workspace/renderers/OfficeScreenshotRenderer.tsx` | 截图预览组件 | 3h |
| **小计** | | **13h** |

### 7.2 修改文件

| 文件 | 改动 | 估时 |
|------|------|------|
| `src/qwenpaw/agents/tools/__init__.py` | 添加 office_tools import | 0.5h |
| `src/qwenpaw/app/routers/workspace.py` | `_convert_docx_to_html` 插入 officecli 优先路径 + 新增 3 个端点 | 4h |
| `console/src/components/Workspace/renderers/OfficeDocRenderer.tsx` | 增加渲染引擎标识 | 1.5h |
| `console/src/components/Workspace/store/builtinRenderers.ts` | 注册截图渲染器 | 0.5h |
| `console/src/locales/zh.json` | i18n | 0.5h |
| `console/src/locales/en.json` | i18n | 0.5h |
| **小计** | | **7.5h** |

### 7.3 测试

| 测试项 | 估时 |
|--------|------|
| 工具函数单元测试 | 4h |
| 后端端点集成测试 | 2h |
| 前端渲染器测试 | 2h |
| 端到端：Agent 创建 PPT → 截图 → 修正 | 2h |
| **小计** | **10h** |

### 7.4 总计

| 阶段 | 估时 |
|------|------|
| 新增文件 | 13h |
| 修改文件 | 7.5h |
| 测试 | 10h |
| **合计** | **~30.5h ≈ 4 个工作日** |

> **对比 v1 方案（6 天）节省 2 天**——省去了插件骨架、plugin.json、plugin.py、HTTP 路由注册、前端 UI 构建配置等插件框架开销。

---

## 8. 渐进式迁移策略

### 阶段 1：后端预览升级（1 天）

只改 `workspace.py` 中的 `_convert_docx_to_html`：
- 插入 officecli 优先路径
- 现有 mammoth/openpyxl/python-pptx 保留为 fallback
- **前端零改动**，用户立即感受到 PPTX 预览质量提升

### 阶段 2：Agent 工具（2 天）

- 新增 `office_tools.py`，11 个 `@tool_descriptor` 工具
- 在 `__init__.py` 中添加 import
- 新增技能 SKILL.md
- Agent 可以创建/修改/截图文档

### 阶段 3：前端渲染器增强（1 天）

- 新增 `OfficeScreenshotRenderer` 截图预览组件
- `OfficeDocRenderer` 增加渲染引擎标识
- 注册到 `builtinRenderers.ts`

---

## 9. 回退与降级策略

```
用户打开 Office 文档
    │
    ▼
OfficeScreenshotRenderer (priority=15)
    │ 调用 /api/workspace/office-screenshot
    ├── 成功 → 显示 PNG 截图 ✅
    └── 失败（404 officecli 未安装）
        │
        ▼  降级
        │
OfficeDocRenderer (priority=10)
    │ 调用 /api/workspace/convert-office
    ├── 后端优先 officecli view html → 高保真 HTML ✅
    ├── officecli 失败 → mammoth/openpyxl/python-pptx → 基础 HTML ✅
    └── 后端完全失败
        │
        ▼  降级
        │
OfficeOoxmlPreview (前端解析, 不改动)
    ├── mammoth.js (DOCX) ✅
    ├── read-excel-file (XLSX) ✅
    ├── JSZip (PPTX) ✅
    └── 全部失败 → 下载按钮 ✅
```

**关键原则：officecli 不可用时，行为与改造前完全一致。**

---

## 10. 测试计划

### 10.1 后端测试

| 用例 | 预期 |
|------|------|
| officecli 已安装，预览 DOCX | 返回高保真 HTML，`engine="officecli"` |
| officecli 已安装，预览 PPTX | 返回高保真 HTML（含形状/配色/布局） |
| officecli 未安装，预览 DOCX | Fallback 到 mammoth，`engine="legacy"` |
| officecli 进程超时 | Fallback 到 mammoth |
| 截图端点，officecli 已安装 | 返回 PNG |
| 截图端点，officecli 未安装 | 返回 404 |

### 10.2 工具函数测试

| 用例 | 预期 |
|------|------|
| `office_create_document("test.pptx")` | 文件创建成功 |
| `office_add_element("test.pptx", "/", "slide", {"title": "Hello"})` | 幻灯片添加成功 |
| `office_view_screenshot("test.pptx", 1)` | 返回 ImageBlock (PNG) |
| `office_validate_document("test.pptx")` | 返回验证结果 |
| officecli 未安装时调用任意工具 | 返回友好错误提示 |

### 10.3 前端测试

| 用例 | 预期 |
|------|------|
| 打开 PPTX，officecli 可用 | 截图预览或高保真 HTML |
| 打开 PPTX，officecli 不可用 | 基础 HTML (fallback) |
| 截图预览翻页 | 正确显示对应页 |
| 渲染引擎标签 | "OfficeCLI 高保真渲染" / "基础渲染" |

### 10.4 端到端测试

```
用户: "帮我做一个关于石油勘探的 5 页 PPT"
    ↓
Agent: office_create_document("petroleum.pptx")
Agent: office_add_element × 5
Agent: office_view_screenshot("petroleum.pptx", 1)
    ↓ Agent 看到截图
Agent: "标题字号太大" → office_set_properties 修正
Agent: office_view_screenshot 再次确认
Agent: office_validate_document 验证格式
    ↓
展示最终 PPT + 截图
```
