# 工作区文件预览融合方案

## 目标

在不影响现有 PDF、OfficeCLI 和其他专用渲染器的前提下，让 Markdown 与代码文件复用上游 QwenPaw Files Workspace 的显示能力和交互风格。

融合原则：

1. 文件导航、多标签、编辑、Diff、保存与文件监听继续以上游 `FilesWorkspace` / `TabbedEditor` 为主。
2. Markdown 使用上游工作区的排版、GFM、Front Matter 和代码块样式。
3. 普通代码和配置文件使用上游 Monaco，不再使用自定义正则高亮和 textarea 编辑器。
4. JSON 默认保留树形预览，切换到源码时使用上游 Monaco。
5. Markdown 中的 Mermaid fenced code block 使用上游 `MermaidCodeBlock`。
6. 独立 `.mmd` / `.mermaid` 文件继续使用现有 `MermaidRenderer`。
7. PDF 与 Office 文件保持当前专用链路，不进入本次改造。

## 能力分工

| 文件类型                     | 默认显示                  | 源码/编辑                           | 保留能力                                                 |
| ---------------------------- | ------------------------- | ----------------------------------- | -------------------------------------------------------- |
| `.md` / `.mdx` / `.markdown` | 上游工作区 Markdown 样式  | 上游 Monaco（在完整工作区编辑模式） | 鉴权相对图片、内部文件链接、Front Matter、Mermaid 代码块 |
| 普通代码与配置文件           | 上游 Monaco 只读预览      | 上游 `TabbedEditor` Monaco 编辑     | 行号、折叠、语法高亮、Diff、保存、复制到聊天             |
| `.json` / `.jsonc`           | 现有 JSON 树形预览        | 上游 Monaco                         | 搜索、折叠、格式化和源码编辑                             |
| `.mmd` / `.mermaid`          | 现有独立 Mermaid 图形预览 | 不在本次增加编辑器切换              | 严格安全级别、重载、下载                                 |
| PDF                          | 现有 `PdfRenderer`        | 不变                                | Lightweight PDF Viewer                                   |
| Office                       | 现有 `OfficeDocRenderer`  | 不变                                | OfficeCLI 转换链路                                       |
| 其他专用格式                 | 现有 RendererRegistry     | 不变                                | CSV、图片、媒体等现有能力                                |

## 路由设计

`rendererRegistry` 继续负责文件类型识别，但 Markdown 和 Code 注册项只作为上游工作区组件的适配入口，不再维护独立的渲染实现。

```text
FilesDrawer / FilesWorkspace
        |
        v
FilePreview -> ArtifactPreview -> rendererRegistry
        |                           |
        |                           +-- Markdown -> 上游样式 + 上游代码块渲染
        |                           +-- Code -> Monaco
        |                           +-- JSON -> Tree / Monaco
        |                           +-- Mermaid -> MermaidRenderer
        |                           +-- PDF -> PdfRenderer
        |                           +-- Office -> OfficeDocRenderer / OfficeCLI
        |                           +-- Other -> 现有专用 renderer
        |
        +-- 完整工作区编辑 -> TabbedEditor / Monaco / Diff
```

## 实施步骤

- [x] MarkdownRenderer 改为上游工作区排版和 fenced code block 渲染。
- [x] 保留 Markdown 相对资源鉴权、内部链接和安全外链能力。
- [x] Markdown Mermaid 代码块接入上游 `MermaidCodeBlock`。
- [x] CodeRenderer 改为 Monaco 适配器，使用上游语言映射和编辑器选项。
- [x] 扩充 Monaco 语言映射，覆盖 RendererRegistry 已声明的代码与配置扩展名。
- [x] JSON 树形模式不变，Raw 模式自动使用新的 Monaco CodeRenderer。
- [x] `.mmd` / `.mermaid` 纳入工作区文本文件识别，但继续匹配 MermaidRenderer。
- [x] 确认 PDF 和 Office 注册项及组件没有改变。
- [x] 添加 Markdown、Monaco、JSON/Mermaid 边界回归测试。

## 验收清单

- [x] Markdown 标题、表格、引用、链接、图片和代码块保持上游工作区视觉样式。
- [x] Markdown 中的 `mermaid` 代码块渲染为图，而不是普通代码文本。
- [x] Markdown 相对图片仍通过带鉴权的 workspace Blob 加载。
- [x] Markdown 相对文件链接仍能在 Files Workspace 内打开。
- [x] `.ts`、`.py`、`.json`、`.yaml` 等源码由 Monaco 显示。
- [x] JSON 默认仍为树形视图，Raw 模式为 Monaco。
- [x] `.mmd` / `.mermaid` 独立文件仍由 MermaidRenderer 渲染。
- [x] PDF 仍匹配 PdfRenderer。
- [x] DOCX/XLSX/PPTX 仍匹配 OfficeDocRenderer，并继续使用 OfficeCLI。
- [x] TypeScript、相关前端测试、后端工作区测试、ESLint 和 diff 检查通过。
