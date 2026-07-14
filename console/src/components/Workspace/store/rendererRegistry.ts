/**
 * RendererRegistry — 渲染器注册中心
 *
 * 设计灵感：
 * - TipTap 的 Extension 注册机制：每个扩展声明自己的 parseHTML/renderHTML
 * - LibreChat 的 artifacts.ts 文件分类逻辑：通过 MIME type + extension 匹配渲染器
 *
 * 核心机制：
 * 1. 插件/宿主通过 registerRenderer() 注册渲染器
 * 2. 通过 matchRenderer(artifact) 匹配最佳渲染器
 * 3. 支持优先级、MIME 类型、扩展名、来源类型多维度匹配
 * 4. 注册返回 Disposable，支持插件卸载时自动注销
 */
import type { Disposable } from "../../../plugins/registry/types";
import type {
  RendererMatch,
  RendererRegistration,
  WorkspaceArtifact,
} from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// Registry
// ─────────────────────────────────────────────────────────────────────────────

class RendererRegistryImpl {
  private renderers = new Map<string, RendererRegistration>();
  private listeners = new Set<() => void>();

  /**
   * 注册一个渲染器
   * @returns Disposable，调用 dispose() 注销
   */
  register(reg: RendererRegistration): Disposable {
    if (this.renderers.has(reg.id)) {
      console.warn(
        `[Workspace] Renderer "${reg.id}" already registered, overwriting.`,
      );
    }
    this.renderers.set(reg.id, reg);
    this.notify();

    return {
      dispose: () => {
        this.renderers.delete(reg.id);
        this.notify();
      },
    };
  }

  /**
   * 批量注册渲染器
   */
  registerAll(regs: RendererRegistration[]): Disposable {
    const disposables = regs.map((r) => this.register(r));
    return {
      dispose: () => disposables.forEach((d) => d.dispose()),
    };
  }

  /**
   * 获取所有已注册的渲染器
   */
  getAll(): RendererRegistration[] {
    return Array.from(this.renderers.values());
  }

  /**
   * 按 ID 获取渲染器
   */
  get(id: string): RendererRegistration | undefined {
    return this.renderers.get(id);
  }

  /**
   * 匹配最佳渲染器
   *
   * 匹配优先级：
   * 1. mimeType 精确匹配 → 取 priority 最高的
   * 2. extension 匹配 → 取 priority 最高的
   * 3. source 匹配 → 取 priority 最高的
   * 4. fallback 到通用渲染器（id="fallback"）
   */
  match(artifact: WorkspaceArtifact): RendererMatch | null {
    const all = this.getAll();

    // 1. MIME type 精确匹配
    const mimeMatches = all
      .filter(
        (r) =>
          r.mimeTypes?.includes(artifact.mimeType) &&
          (!r.sources || r.sources.includes(artifact.source)),
      )
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

    if (mimeMatches.length > 0) {
      return { renderer: mimeMatches[0], matchedBy: "mimeType" };
    }

    // 2. Extension 匹配
    if (artifact.extension) {
      const extMatches = all
        .filter(
          (r) =>
            r.extensions?.includes(artifact.extension!.toLowerCase()) &&
            (!r.sources || r.sources.includes(artifact.source)),
        )
        .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

      if (extMatches.length > 0) {
        return { renderer: extMatches[0], matchedBy: "extension" };
      }
    }

    // 3. Source 匹配
    const sourceMatches = all
      .filter(
        (r) =>
          r.sources?.includes(artifact.source) && !r.mimeTypes && !r.extensions,
      )
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

    if (sourceMatches.length > 0) {
      return { renderer: sourceMatches[0], matchedBy: "source" };
    }

    // 4. Fallback
    const fallback = all.find((r) => r.id === "fallback");
    if (fallback) {
      return { renderer: fallback, matchedBy: "fallback" };
    }

    return null;
  }

  /**
   * 检查是否有渲染器支持指定 MIME type
   */
  supports(mimeType: string, extension?: string): boolean {
    return this.getAll().some(
      (r) =>
        r.mimeTypes?.includes(mimeType) ||
        (extension && r.extensions?.includes(extension.toLowerCase())),
    );
  }

  /** 订阅注册变化 */
  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.warn("[Workspace RendererRegistry] listener error:", err);
      }
    });
  }

  /** Test-only reset */
  __resetForTests(): void {
    this.renderers.clear();
    this.listeners.clear();
  }
}

export const rendererRegistry = new RendererRegistryImpl();

// ─────────────────────────────────────────────────────────────────────────────
// Built-in MIME type 常量（参考 LibreChat artifacts.ts 的分类逻辑）
// ─────────────────────────────────────────────────────────────────────────────

export const MimeTypes = {
  // 文本类
  MARKDOWN: "text/markdown",
  HTML: "text/html",
  PLAIN: "text/plain",
  CSV: "text/csv",
  JSON: "application/json",
  XML: "application/xml",
  YAML: "application/x-yaml",

  // 代码类
  JAVASCRIPT: "text/javascript",
  TYPESCRIPT: "text/typescript",
  PYTHON: "text/x-python",
  REACT: "text/jsx",
  VUE: "text/x-vue",
  CSS: "text/css",
  SHELL: "application/x-sh",

  // 图片类
  PNG: "image/png",
  JPEG: "image/jpeg",
  GIF: "image/gif",
  SVG: "image/svg+xml",
  WEBP: "image/webp",

  // 文档类
  PDF: "application/pdf",
  DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  XLSX: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  PPTX: "application/vnd.openxmlformats-officedocument.presentationml.presentation",

  // 媒体类
  MP4: "video/mp4",
  WEBM: "video/webm",
  MP3: "audio/mpeg",
  WAV: "audio/wav",

  // 科学数据类（未来扩展）
  LAS: "application/x-las", // 测井曲线 ASCII 格式
  DLIS: "application/x-dlis", // 测井曲线二进制格式
  OBJ: "model/obj", // 三维网格
  STL: "model/stl", // 三维打印
  VTK: "application/x-vtk", // VTK 可视化
  GLTF: "model/gltf+json", // glTF 三维场景

  // 特殊类型
  REACT_COMPONENT: "application/x-react-component", // 可执行 React 代码
  MERMAID: "text/x-mermaid", // Mermaid 图表
  LATEX: "application/x-latex", // LaTeX 文档
} as const;

export type MimeType = (typeof MimeTypes)[keyof typeof MimeTypes];
