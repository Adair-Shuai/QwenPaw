# UGSci 工作区文件预览模块核查报告

> 初次核查日期：2026-07-31  
> 最近复核日期：2026-07-31  
> 文档性质：当前未解决缺陷与可执行优化清单  
> 清理规则：已经修复、已经不存在或被测试覆盖确认关闭的问题不再保留在本文

## 1. 核查范围

UGSci 的文件查看能力涉及三条链路：

1. **UGSci 工作区文档界面**：列出、读取、编辑根工作区 Markdown，并维护 `system_prompt_files`；
2. **Coding Mode 文件预览**：文件树、文本读取、Markdown/CSV/图片/PDF 预览和 SSE 文件监听；
3. **Chat Workspace Artifact 面板**：从工具结果创建 Artifact，通过 Renderer 预览 Markdown、PDF、Office、图片和媒体。

本次复核的主要代码边界：

- `plugins/bundle/ugsci/ui/src/expert/expertTabs.ts`
- `plugins/bundle/ugsci/ui/src/expert/expertApi.ts`
- `console/src/pages/Coding/`
- `console/src/components/Workspace/`
- `console/src/components/Chat/ToolCards/shared/FileSummaryCards.tsx`
- `console/src/hooks/useAuthenticatedWorkspaceBlob.ts`
- `console/src/api/modules/workspace.ts`
- `src/qwenpaw/app/routers/workspace.py`
- `src/qwenpaw/agents/memory/agent_md_manager.py`

## 2. 当前结论

复核后保留 2 个可确认缺陷和 6 个优化项。

| 分类 | 数量 | 当前重点 |
| --- | ---: | --- |
| P2 缺陷 | 2 | 二进制重复读取、失败预览空白 |
| 优化项 | 6 | 领域 Renderer、统一预览架构、版本冲突控制、大工作区扩展性等 |

当前主要风险转为 Coding 打开链路：二进制文件仍会先经过文本接口，认证 Blob 加载失败时 Coding 预览也缺少完整错误状态。

## 3. P2 中优先级缺陷

### PREVIEW-005：选择二进制文件时仍先按文本读取并缓存

**严重度：P2**  
**类型：性能 / 内容处理错误**

#### 问题位置

- `console/src/pages/Coding/FileTree.tsx`
- `console/src/pages/Coding/TabbedEditor.tsx`
- `console/src/api/modules/workspace.ts`
- `src/qwenpaw/app/routers/workspace.py`

#### 当前实现

`FileTree.handleSelect()` 对所有文件调用 `workspaceApi.loadCodeFile()`。后端文本接口对图片、PDF 等内容执行带 `errors="replace"` 的 UTF-8 解码；进入预览模式后，图片或 PDF 又通过 binary endpoint 读取原始字节。

小于 5 MB 的二进制文件因此被重复读取并产生无意义文本，大文件则先触发 413，再打开带占位内容的预览标签。

#### 可操作修复

1. FileTree 在读取内容前根据扩展名和 MIME 决定打开方式；
2. 图片、PDF 和其他二进制预览文件直接创建 preview tab，不调用文本接口；
3. 后端文本读取接口检测明显二进制内容并返回 415 或仅返回元数据；
4. 二进制内容不得进入 `codeFileCacheStore`。

### PREVIEW-006：Coding 二进制预览失败时仍显示空白区域

**严重度：P2**  
**类型：错误状态 / 用户体验**

#### 问题位置

- `console/src/hooks/useAuthenticatedWorkspaceBlob.ts`
- `console/src/pages/Coding/FilePreview.tsx`

#### 当前实现

`useAuthenticatedWorkspaceBlob()` 只返回 `string | null`。`null` 同时表示加载中、请求失败、文件不存在和认证失败。`ImagePreview`、`PdfPreview` 以及 Markdown 相对图片在 URL 为空时直接返回 `null`。

#### 可操作修复

Hook 应返回：

```typescript
type BinaryResourceState =
  | { status: "idle" | "loading" }
  | { status: "ready"; url: string }
  | { status: "error"; error: Error; retry: () => void };
```

预览器提供稳定尺寸的 loading、错误详情、重试和下载入口。HTTP 错误应保留状态码和后端详情。

## 4. 可操作优化项

### OPT-001：为 UGSci 注册石油与科学数据 Renderer

宿主已预留 LAS、DLIS、SEG-Y、VTK、HDF5、NetCDF 等扩展点，但当前 UGSci 模块未调用 `window.QwenPaw.workspace.registerRenderer()` 注册领域 Renderer。

建议先实现纯文本 LAS：解析曲线头、深度列、NULL 值和多轨道折线。第二阶段实现 SEG-Y 元数据和缩略剖面；HDF5/NetCDF 通过后端提取结构与低分辨率切片，避免前端加载完整文件。

### OPT-002：统一 Coding Preview 和 Workspace Renderer

Coding `FilePreview` 与 Workspace Renderer 分别维护图片、PDF、Markdown、CSV、认证加载和错误状态，能力已经分叉。

建议将 Coding 文件转换为 `WorkspaceArtifact`，编辑模式保留 Monaco，预览模式交给统一 Registry。这样 PREVIEW-005、PREVIEW-006 的加载和错误处理只需维护一套。

### OPT-003：增加保存前差异确认和版本恢复

源码/预览切换、字符数、估算 token、挂载状态、空内容校验和 1 MB 上限已经实现，不再作为缺口保留。

当前剩余能力：

- 保存前展示相对磁盘版本的 diff；
- 为 AGENTS.md、SOUL.md、PROFILE.md 等高影响文件提供二次确认；
- 提供上一版本、checkpoint 或恢复入口；
- 与 OPT-004 的冲突处理共用差异视图。

### OPT-004：引入 ETag/If-Match 防止并发覆盖

UGSci Markdown 写入和 Coding 文件保存都没有乐观并发控制。文件在编辑期间若被 Agent、外部编辑器或另一浏览器标签修改，当前保存会直接覆盖新内容。

建议读取返回 ETag，保存携带 `If-Match`。版本不一致返回 409 或 412，并提供重新加载、查看 diff 和强制覆盖。

### OPT-005：大工作区采用分页、增量树和虚拟列表

后端仍会递归扫描并 stat 工作区文件，前端一次性构建完整树。科研项目可能包含大量数据文件。

建议后端按目录懒加载 children，文件树使用虚拟滚动，SSE 增量更新节点，并支持可配置忽略规则。

### OPT-006：完成工作文档与长期记忆的术语清理

UGSci 主界面已经使用“工作区文档”“Markdown 文档”和“挂载到系统提示”等更准确文案，原问题已大幅收敛。

当前仍有残余文案把根工作区文档称为“记忆文件”，例如启用/停用成功提示。应统一为：

- **系统提示文件**：已加入 `system_prompt_files` 的 Markdown；
- **工作区文档**：普通报告和知识材料；
- **长期记忆**：由 `/workspace/memory` 和记忆系统管理的内容。

## 5. 其他观察

### 5.1 Renderer dirty 标记语义不准确

`workspaceStore.updateArtifact()` 在 `patch.isStreaming` 为 false 或未提供时会把标签标为 dirty。后端加载完成这类只读更新也可能触发 dirty，容易让用户误以为有未保存修改。

建议由调用方显式传入 `dirty`，不要从 streaming 状态推断编辑状态。

### 5.2 文件列表错误被静默处理

Coding FileTree 的 `load()` catch 仍直接忽略错误并保留旧节点。网络错误或 Agent 不可用时，用户可能把旧文件树误认为当前状态。

建议保留旧数据时显示 stale 状态、错误详情和重试入口；Agent 或项目切换失败时尤其不能静默。

## 6. 推荐修复顺序

| 顺序 | 项目 | 目标 |
| ---: | --- | --- |
| 1 | PREVIEW-006 | 为 Coding 二进制预览补齐 loading、error、retry、download |
| 2 | PREVIEW-005 | 避免二进制文件进入文本读取和缓存链路 |
| 3 | OPT-002、OPT-004 | 统一预览架构并增加并发保存保护 |
| 4 | OPT-001 | 建立 LAS、SEG-Y 等 UGSci 领域预览能力 |
| 5 | OPT-003、OPT-005、OPT-006 | 完善编辑安全、规模化和产品语义 |

## 7. 建议新增测试

### 前端单元测试

- `FileTree.binaryOpen.test.tsx`：二进制预览文件不调用文本接口；
- `FilePreview.binaryStates.test.tsx`：loading、401、404、413、重试和下载；
- `workspaceStore.dirty.test.ts`：只读更新不产生 dirty；
- `FileTree.errorState.test.tsx`：列表失败显示 stale 和重试状态。

### 后端单元测试

- `If-Match` 成功、冲突和强制覆盖；
- 超大目录分页、忽略规则和稳定排序。

### E2E 场景

1. 文本与二进制文件交替打开，确认二进制内容不进入文本缓存；
2. 两个浏览器标签同时编辑 Markdown，确认冲突不会静默覆盖。

## 8. 建议的数据模型

建议所有文件链路统一使用资源身份：

```typescript
interface WorkspaceResourceIdentity {
  agentId: string;
  projectRootId: string;
  relativePath: string;
  version?: string;
}

interface WorkspaceArtifact {
  id: string;
  sessionId: string;
  resource?: WorkspaceResourceIdentity;
  title: string;
  mimeType: string;
  extension?: string;
  textContent?: string;
  binaryUrl?: string;
}
```

缓存、SSE、Renderer、下载和保存都应从同一个 resource identity 派生，避免各层重新猜测当前 Agent 或项目。

## 9. 完成标准

- 二进制文件不经过文本读取和文本缓存；
- 失败预览始终有 loading、error、retry 和 download；
- Markdown 保存具备版本冲突检测和差异确认；
- UGSci 至少实现 LAS Renderer，或提供结构化摘要与转换入口。

## 10. 总结

当前 Markdown 相对资源、作用域隔离、事务保存、文件名规范化、内容保真、源码预览和请求竞态问题已经关闭，因此不再出现在本文的问题清单中。

现阶段最需要处理的是 PREVIEW-006：为 Coding 图片和 PDF 预览补齐可见的加载、错误、重试和下载状态。随后应解决 PREVIEW-005，避免二进制文件进入文本读取和缓存链路。
