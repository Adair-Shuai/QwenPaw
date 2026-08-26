import { FormEvent, useEffect, useState, useSyncExternalStore } from "react";
import { message } from "antd";
import {
  ArrowLeft,
  ArrowRight,
  Blocks,
  Box,
  ChartNoAxesCombined,
  ExternalLink,
  FileAxis3D,
  FileText,
  Globe2,
  Network,
  RefreshCw,
  Search,
  Waves,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Slot } from "../../plugins/registry/Slot";
import ArtifactPreview from "../../components/Workspace/ArtifactPreview";
import type { WorkspaceArtifact } from "../../components/Workspace/types";
import { mimeFromExtension } from "../../utils/mimeForPreview";
import { fileExtension, openVisualizationCenter } from "./fileOpenModes";
import { registerBuiltinRenderers } from "../../components/Workspace/store/builtinRenderers";
import { rendererRegistry } from "../../components/Workspace/store/rendererRegistry";
import AgentCollaborationPanel from "./AgentCollaborationPanel";
import type { FilesWorkspaceScope } from "./filesWorkspaceScope";
import type { FileTarget } from "./types";
import styles from "./FilesWorkspace.module.less";

const BROWSER_URL_STORAGE_KEY = "qwenpaw-workbench-browser-url";

export type WorkbenchMode = "files" | "browser" | "agents" | "genui";

const subscribeRendererRegistry = (listener: () => void) =>
  rendererRegistry.subscribe(listener);
const getRendererRegistrySnapshot = () => rendererRegistry.getSnapshot();

interface WorkbenchBrowserPanelProps {
  active: boolean;
}

export function WorkbenchBrowserPanel({ active }: WorkbenchBrowserPanelProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>(() => {
    const stored = localStorage.getItem(BROWSER_URL_STORAGE_KEY);
    return stored ? [stored] : [];
  });
  const [historyIndex, setHistoryIndex] = useState(() =>
    localStorage.getItem(BROWSER_URL_STORAGE_KEY) ? 0 : -1,
  );
  const [reloadKey, setReloadKey] = useState(0);
  const currentUrl = historyIndex >= 0 ? history[historyIndex] : "";

  useEffect(() => {
    if (active) setInput(currentUrl);
  }, [active, currentUrl]);

  const navigate = (rawValue: string) => {
    const value = rawValue.trim();
    if (!value) return;
    let nextUrl = value;
    if (!/^[a-z][a-z\d+.-]*:/i.test(nextUrl)) {
      nextUrl = `https://${nextUrl}`;
    }
    try {
      const parsed = new URL(nextUrl);
      if (!["http:", "https:"].includes(parsed.protocol)) throw new Error();
      nextUrl = parsed.toString();
    } catch {
      message.warning(
        t("workbench.browser.invalidUrl", "请输入有效的 HTTP 或 HTTPS 地址"),
      );
      return;
    }

    const nextHistory = [...history.slice(0, historyIndex + 1), nextUrl];
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
    setInput(nextUrl);
    localStorage.setItem(BROWSER_URL_STORAGE_KEY, nextUrl);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    navigate(input);
  };

  return (
    <div className={styles.workbenchPanel}>
      <form className={styles.browserToolbar} onSubmit={submit}>
        <button
          type="button"
          aria-label={t("common.back", "后退")}
          disabled={historyIndex <= 0}
          onClick={() => setHistoryIndex((index) => Math.max(0, index - 1))}
        >
          <ArrowLeft size={15} />
        </button>
        <button
          type="button"
          aria-label={t("common.forward", "前进")}
          disabled={historyIndex < 0 || historyIndex >= history.length - 1}
          onClick={() =>
            setHistoryIndex((index) => Math.min(history.length - 1, index + 1))
          }
        >
          <ArrowRight size={15} />
        </button>
        <button
          type="button"
          aria-label={t("common.refresh", "刷新")}
          disabled={!currentUrl}
          onClick={() => setReloadKey((key) => key + 1)}
        >
          <RefreshCw size={14} />
        </button>
        <label className={styles.browserAddress}>
          <Search size={14} />
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              navigate(input);
            }}
            placeholder={t(
              "workbench.browser.placeholder",
              "输入 URL，预览本地应用或网页",
            )}
            aria-label={t("workbench.browser.address", "浏览器地址")}
          />
        </label>
        <button
          type="button"
          aria-label={t("workbench.browser.openExternal", "在新窗口打开")}
          disabled={!currentUrl}
          onClick={() =>
            currentUrl &&
            window.open(currentUrl, "_blank", "noopener,noreferrer")
          }
        >
          <ExternalLink size={14} />
        </button>
      </form>

      {currentUrl ? (
        <div className={styles.browserFrameWrap}>
          <iframe
            key={`${currentUrl}:${reloadKey}`}
            className={styles.browserFrame}
            src={currentUrl}
            title={t("workbench.browser.title", "工作台浏览器")}
            sandbox="allow-downloads allow-forms allow-modals allow-popups allow-same-origin allow-scripts"
            referrerPolicy="no-referrer"
          />
          <div className={styles.browserEmbedHint}>
            {t(
              "workbench.browser.embedHint",
              "部分站点会禁止内嵌显示，可使用右上角按钮在新窗口打开。",
            )}
          </div>
        </div>
      ) : (
        <div className={styles.workbenchEmptyState}>
          <span className={styles.workbenchEmptyIcon}>
            <Globe2 size={28} />
          </span>
          <strong>
            {t("workbench.browser.emptyTitle", "浏览器与 Web 预览")}
          </strong>
          <p>
            {t(
              "workbench.browser.emptyDescription",
              "用于查看本地开发服务、工具生成的网页、仪表盘和交互式 HTML。",
            )}
          </p>
          <div className={styles.browserFeatureGrid}>
            <span>localhost / 内网应用</span>
            <span>HTML / Dashboard</span>
            <span>交互式 GenUI</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface WorkbenchAgentPanelProps {
  scope: Extract<FilesWorkspaceScope, { kind: "session" }>;
  runtimeSessionId?: string;
}

export function WorkbenchAgentPanel({
  scope,
  runtimeSessionId,
}: WorkbenchAgentPanelProps) {
  const { t } = useTranslation();

  return (
    <div className={`${styles.workbenchPanel} ${styles.agentProcessPanel}`}>
      <div className={styles.reusedAgentPanel}>
        <AgentCollaborationPanel
          sessionId={runtimeSessionId || scope.sessionId}
          emptyState={
            <div className={styles.workbenchEmptyState}>
              <span className={styles.workbenchEmptyIcon}>
                <Network size={28} />
              </span>
              <strong>
                {t("workbench.agents.emptyTitle", "暂无智能体运行记录")}
              </strong>
              <p>
                {t(
                  "workbench.agents.emptyDescription",
                  "后台工具、子任务和长时间运行过程会在这里形成可追踪的时间线。",
                )}
              </p>
            </div>
          }
        />
      </div>
    </div>
  );
}

interface GenUiCapability {
  id: string;
  icon: typeof Waves;
  title: string;
  description: string;
  extensions: string[];
  accent: string;
}

const GENUI_CAPABILITIES: GenUiCapability[] = [
  {
    id: "well-log",
    icon: Waves,
    title: "测井曲线",
    description: "LAS / DLIS 多曲线、深度轨迹、分层与解释成果联动。",
    extensions: ["las", "las3", "dlis"],
    accent: "#7c3aed",
  },
  {
    id: "reservoir-grid",
    icon: Box,
    title: "油藏网格",
    description: "EGRID / GRDECL / ROFF / SR3 三维网格、属性和时步浏览。",
    extensions: ["egrid", "grdecl", "roff", "sr3"],
    accent: "#0891b2",
  },
  {
    id: "scientific-mesh",
    icon: FileAxis3D,
    title: "科学网格",
    description: "VTK / VTU / XDMF 曲面、体网格和工程计算结果。",
    extensions: ["vtk", "vtu", "xdmf"],
    accent: "#2563eb",
  },
  {
    id: "data-insight",
    icon: ChartNoAxesCombined,
    title: "数据洞察",
    description: "CSV / JSON / Arrow / Parquet 表格、图表和交互式分析。",
    extensions: ["csv", "json", "arrow", "parquet"],
    accent: "#059669",
  },
  {
    id: "interactive-app",
    icon: Blocks,
    title: "交互式 GenUI",
    description: "HTML、React、Mermaid 和工具生成的可操作界面。",
    extensions: ["html", "tsx", "mmd", "mermaid"],
    accent: "#ea580c",
  },
  {
    id: "documents",
    icon: FileText,
    title: "高级文档",
    description: "PDF、Office、Markdown、媒体与代码的统一预览。",
    extensions: ["pdf", "docx", "xlsx", "pptx", "md"],
    accent: "#475569",
  },
];

interface WorkbenchGenUiPanelProps {
  onOpenFiles: () => void;
  onClearTarget?: () => void;
  target?: FileTarget;
  scope?: Extract<FilesWorkspaceScope, { kind: "session" }>;
}

export function WorkbenchGenUiPanel({
  onOpenFiles,
  onClearTarget,
  target,
  scope,
}: WorkbenchGenUiPanelProps) {
  const { t } = useTranslation();
  useEffect(() => {
    registerBuiltinRenderers();
  }, []);
  useSyncExternalStore(
    subscribeRendererRegistry,
    getRendererRegistrySnapshot,
    getRendererRegistrySnapshot,
  );
  const renderers = rendererRegistry.getAll();

  if (target && scope) {
    const extension = fileExtension(target.path);
    const fileName =
      target.path.replace(/\\/g, "/").split("/").pop() || target.path;
    const artifact: WorkspaceArtifact = {
      ...(target.artifact ?? {}),
      id:
        target.artifact?.id ??
        `genui:${target.root ?? "project"}:${target.path}`,
      title: target.artifact?.title ?? fileName,
      source:
        target.artifact?.source ??
        (target.artifactUrl ? "file_upload" : "link"),
      mimeType:
        target.artifact?.mimeType ??
        mimeFromExtension(target.path) ??
        "application/octet-stream",
      extension: target.artifact?.extension ?? extension,
      binaryUrl: target.artifact?.binaryUrl ?? target.artifactUrl,
      workspacePath: target.artifact?.workspacePath ?? target.path,
      workspaceRoot: target.artifact?.workspaceRoot ?? target.root ?? "project",
      agentId: target.artifact?.agentId ?? scope.agentId,
      chatId: target.artifact?.chatId ?? scope.chatId,
      projectDirOverride:
        target.artifact?.projectDirOverride ?? scope.projectDirOverride,
    };

    return (
      <div className={`${styles.workbenchPanel} ${styles.genUiPanel}`}>
        <div className={styles.genUiPreviewHeader}>
          <button type="button" onClick={onClearTarget}>
            <ArrowLeft size={14} />
            能力中心
          </button>
          <div>
            <strong>三维网格预览</strong>
            <span>{fileName}</span>
          </div>
          <button
            type="button"
            onClick={() =>
              openVisualizationCenter(target, {
                agentId: scope.agentId,
                chatId: scope.chatId,
                projectDirOverride: scope.projectDirOverride,
              })
            }
          >
            <ExternalLink size={14} />
            可视化中心
          </button>
        </div>
        <div className={styles.genUiPreviewSurface}>
          <ArtifactPreview artifact={artifact} readOnly hostControls />
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.workbenchPanel} ${styles.genUiPanel}`}>
      <div className={styles.genUiHero}>
        <span className={styles.genUiHeroIcon}>
          <Blocks size={22} />
        </span>
        <div>
          <strong>{t("workbench.genui.title", "GenUI 能力中心")}</strong>
          <p>
            {t(
              "workbench.genui.description",
              "统一承载文件渲染器、专业可视化和插件提供的交互式界面。",
            )}
          </p>
        </div>
        <span className={styles.genUiCount}>{renderers.length} renderers</span>
      </div>

      <div className={styles.genUiGrid}>
        {GENUI_CAPABILITIES.map((capability) => {
          const available = capability.extensions.some((extension) =>
            rendererRegistry.supports("", extension),
          );
          const Icon = capability.icon;
          return (
            <button
              type="button"
              key={capability.id}
              className={styles.genUiCard}
              style={
                { "--genui-accent": capability.accent } as React.CSSProperties
              }
              onClick={onOpenFiles}
            >
              <span className={styles.genUiCardIcon}>
                <Icon size={19} />
              </span>
              <span className={styles.genUiCardCopy}>
                <strong>{capability.title}</strong>
                <small>{capability.description}</small>
                <em>{capability.extensions.slice(0, 5).join(" · ")}</em>
              </span>
              <span
                className={`${styles.genUiAvailability} ${
                  available ? styles.genUiAvailable : ""
                }`}
              >
                {available
                  ? t("workbench.genui.available", "可用")
                  : t("workbench.genui.pluginRequired", "需插件")}
              </span>
            </button>
          );
        })}
      </div>

      <section className={styles.genUiExtensions}>
        <header>
          <Network size={15} />
          <span>{t("workbench.genui.extensions", "插件扩展")}</span>
        </header>
        <Slot name="chat.workbench.genui" kind="fill">
          <p>
            {t(
              "workbench.genui.extensionHint",
              "插件可以在此注入实时监控、流程图、参数控制台和领域专用 GenUI。",
            )}
          </p>
        </Slot>
      </section>
    </div>
  );
}
