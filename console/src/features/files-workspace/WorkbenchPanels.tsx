import {
  FormEvent,
  createElement,
  useEffect,
  useCallback,
  useMemo,
  useState,
  useRef,
  useSyncExternalStore,
  type ComponentType,
  type ReactNode,
} from "react";
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
import FilePreview from "../../pages/Coding/FilePreview";
import type { WorkspaceArtifact } from "../../components/Workspace/types";
import { mimeFromExtension } from "../../utils/mimeForPreview";
import { fileExtension, openVisualizationCenter } from "./fileOpenModes";
import { registerBuiltinRenderers } from "../../components/Workspace/store/builtinRenderers";
import { rendererRegistry } from "../../components/Workspace/store/rendererRegistry";
import AgentCollaborationPanel from "./AgentCollaborationPanel";
import {
  filesWorkspaceScopeKey,
  type FilesWorkspaceScope,
} from "./filesWorkspaceScope";
import {
  useCodingTabsStore,
  type EditorTab,
} from "../../stores/codingTabsStore";
import { fileTabTarget } from "./fileIdentity";
import { openHtmlFile } from "../../utils/openHtmlFile";
import type { FileTarget, WorkbenchBrowserFile } from "./types";
import styles from "./FilesWorkspace.module.less";

import type { BrowserPage, BrowserSession } from "./workbenchTabsStore";

const BROWSER_URL_STORAGE_KEY = "qwenpaw-workbench-browser-url";

export type { WorkbenchMode } from "./types";

const subscribeRendererRegistry = (listener: () => void) =>
  rendererRegistry.subscribe(listener);
const getRendererRegistrySnapshot = () => rendererRegistry.getSnapshot();

export type WorkbenchBrowserStartContent =
  | ReactNode
  | ((focusAddress: () => void) => ReactNode);

interface WorkbenchBrowserPanelProps {
  browserStartContent?: WorkbenchBrowserStartContent;
  active: boolean;
  scope: Extract<FilesWorkspaceScope, { kind: "session" }>;
  browserFile?: WorkbenchBrowserFile;
  browserSession?: BrowserSession;
  onBrowserSessionChange?: (session: BrowserSession) => void;
  onOpenFiles: () => void;
}

function browserArtifact(
  tab: EditorTab,
  scope: WorkbenchBrowserPanelProps["scope"],
): WorkspaceArtifact {
  const target = fileTabTarget(tab);
  return {
    ...tab.artifact,
    id:
      tab.artifact?.id ??
      `browser:${filesWorkspaceScopeKey(scope)}:${tab.path}`,
    title:
      tab.artifact?.title ??
      target.path.replace(/\\/g, "/").split("/").pop() ??
      target.path,
    source: tab.artifact?.source ?? "link",
    mimeType: "text/html",
    textContent: tab.content,
    workspacePath:
      tab.artifact?.workspacePath ??
      (target.source === "workspace" ? target.path : undefined),
    workspaceRoot: tab.artifact?.workspaceRoot ?? target.root,
    chatId: tab.artifact?.chatId ?? scope.chatId,
    agentId: tab.artifact?.agentId ?? scope.agentId,
    sessionId: tab.artifact?.sessionId ?? scope.sessionId,
    projectDirOverride:
      tab.artifact?.projectDirOverride ?? scope.projectDirOverride,
  };
}

export function WorkbenchBrowserPanel({
  browserStartContent,
  active,
  scope,
  browserFile,
  browserSession,
  onBrowserSessionChange,
  onOpenFiles,
}: WorkbenchBrowserPanelProps) {
  const { t } = useTranslation();
  const addressRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState(browserSession?.input ?? "");
  const [navigation, setNavigation] = useState<{
    pages: BrowserPage[];
    index: number;
  }>(() => {
    if (browserSession) return browserSession;
    const stored = localStorage.getItem(BROWSER_URL_STORAGE_KEY);
    return {
      pages: stored ? [{ kind: "url", url: stored }] : [],
      index: stored ? 0 : -1,
    };
  });
  const { pages, index } = navigation;
  const current = pages[index];
  const scopeKey = filesWorkspaceScopeKey(scope);
  const fileTab = useCodingTabsStore((state) =>
    current?.kind === "file"
      ? state.tabsByAgent[scopeKey]?.find((tab) => tab.path === current.tabPath)
      : undefined,
  );
  const artifact = useMemo(
    () => (fileTab ? browserArtifact(fileTab, scope) : undefined),
    [fileTab, scope],
  );
  const [reloadKey, setReloadKey] = useState(0);
  const currentAddress =
    current?.kind === "url"
      ? current.url
      : fileTab
      ? fileTab.displayPath ?? fileTab.path
      : "";
  const pushPage = useCallback((page: BrowserPage) => {
    setNavigation((previous) => {
      const next = [...previous.pages.slice(0, previous.index + 1), page];
      return { pages: next, index: next.length - 1 };
    });
  }, []);
  useEffect(() => {
    if (browserFile) pushPage({ kind: "file", tabPath: browserFile.tabPath });
  }, [browserFile, pushPage]);
  const addressInitialized = useRef(false);
  const initializedWithSession = useRef(browserSession !== undefined);
  useEffect(() => {
    if (!addressInitialized.current) {
      addressInitialized.current = true;
      if (initializedWithSession.current) return;
    }
    setInput(currentAddress);
  }, [current, currentAddress]);
  useEffect(() => {
    onBrowserSessionChange?.({ pages, index, input });
  }, [pages, index, input, onBrowserSessionChange]);

  const embedsThisConsole = (() => {
    if (current?.kind !== "url") return false;
    try {
      const url = new URL(current.url);
      return (
        url.origin === window.location.origin &&
        (url.pathname === "/" || url.pathname.startsWith("/chat"))
      );
    } catch {
      return false;
    }
  })();
  const navigate = (rawValue: string) => {
    const value = rawValue.trim();
    if (!value) return;
    if (current?.kind === "file" && value === currentAddress) {
      setReloadKey((key) => key + 1);
      return;
    }
    let nextUrl = value;
    if (!/^[a-z][a-z\d+.-]*:/i.test(nextUrl)) nextUrl = `https://${nextUrl}`;
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
    pushPage({ kind: "url", url: nextUrl });
    if (!browserSession) localStorage.setItem(BROWSER_URL_STORAGE_KEY, nextUrl);
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    navigate(input);
  };

  return (
    <div
      className={`${styles.workbenchPanel} ${
        browserStartContent ? styles.browserWorkspace : ""
      }`}
      aria-hidden={!active}
    >
      <form className={styles.browserToolbar} onSubmit={submit}>
        <button
          type="button"
          aria-label={t("common.back", "后退")}
          disabled={index <= 0}
          onClick={() =>
            setNavigation((previous) => ({
              ...previous,
              index: Math.max(0, previous.index - 1),
            }))
          }
        >
          <ArrowLeft size={15} />
        </button>
        <button
          type="button"
          aria-label={t("common.forward", "前进")}
          disabled={index < 0 || index >= pages.length - 1}
          onClick={() =>
            setNavigation((previous) => ({
              ...previous,
              index: Math.min(previous.pages.length - 1, previous.index + 1),
            }))
          }
        >
          <ArrowRight size={15} />
        </button>
        <button
          type="button"
          aria-label={t("common.refresh", "刷新")}
          disabled={!current}
          onClick={() => setReloadKey((key) => key + 1)}
        >
          <RefreshCw size={14} />
        </button>
        <label className={styles.browserAddress}>
          <Search size={14} />
          <input
            ref={addressRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                navigate(input);
              }
            }}
            placeholder={t(
              "workbench.browser.placeholder",
              "输入 URL，预览本地应用或网页",
            )}
            aria-label={t("workbench.browser.address", "浏览器地址")}
          />
        </label>
        {current?.kind === "file" && (
          <button
            type="button"
            onClick={() => {
              if (fileTab)
                useCodingTabsStore
                  .getState()
                  .setActiveTab(scopeKey, fileTab.path);
              onOpenFiles();
            }}
            aria-label={t("workbench.browser.showFile", "查看文件")}
            title={t("workbench.browser.showFile", "查看文件")}
          >
            <FileText size={14} />
          </button>
        )}
        <button
          type="button"
          aria-label={t("workbench.browser.openExternal", "在新窗口打开")}
          disabled={!current || (current.kind === "file" && !fileTab)}
          onClick={() => {
            if (current?.kind === "url")
              window.open(current.url, "_blank", "noopener,noreferrer");
            else if (fileTab && artifact)
              openHtmlFile({
                content: fileTab.content,
                filePath:
                  artifact.workspacePath ?? fileTab.displayPath ?? fileTab.path,
                chatId: artifact.chatId,
                projectDirOverride: artifact.projectDirOverride,
                root: artifact.workspaceRoot,
                workspaceBacked: fileTab.source === "workspace",
                artifact,
              });
          }}
        >
          <ExternalLink size={14} />
        </button>
      </form>
      {current?.kind === "file" ? (
        <div className={styles.browserFrameWrap}>
          {fileTab && artifact ? (
            <FilePreview
              key={`${fileTab.path}:${reloadKey}`}
              filePath={fileTab.displayPath ?? fileTab.path}
              content={fileTab.content}
              artifact={artifact}
              chatId={artifact.chatId}
              root={artifact.workspaceRoot}
              projectDirOverride={artifact.projectDirOverride}
              workspaceBacked={fileTab.source === "workspace"}
              listenForArtifactUpdates={false}
              showHtmlOpenButton={false}
            />
          ) : (
            <div role="status" className={styles.workbenchEmptyState}>
              {t(
                "workbench.browser.fileClosed",
                "网页文件已关闭，请从文件中重新打开。",
              )}
            </div>
          )}
        </div>
      ) : embedsThisConsole ? (
        <div className={styles.workbenchEmptyState}>
          <span className={styles.workbenchEmptyIcon}>
            <Globe2 size={28} />
          </span>
          <strong>当前控制台不能嵌入自身</strong>
          <p>请输入其他网页地址，或使用右上角按钮在新窗口打开。</p>
        </div>
      ) : current?.kind === "url" ? (
        <div className={styles.browserFrameWrap}>
          <iframe
            key={`${current.url}:${reloadKey}`}
            className={styles.browserFrame}
            src={current.url}
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
      ) : browserStartContent ? (
        typeof browserStartContent === "function" ? (
          browserStartContent(() => addressRef.current?.focus())
        ) : (
          browserStartContent
        )
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
          sessionId={runtimeSessionId ?? scope.sessionId}
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
            <strong>{t("files.preview")}</strong>
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
          <FilePreview
            filePath={target.path}
            content={target.artifact?.textContent ?? ""}
            artifact={artifact}
            chatId={scope.chatId}
            root={target.root}
            projectDirOverride={scope.projectDirOverride}
            workspaceBacked={target.source === "workspace"}
          />
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

export function WorkbenchComputePanel() {
  return (
    <div className={`${styles.workbenchPanel} ${styles.genUiPanel}`}>
      <Slot
        name="chat.workbench.compute"
        kind="fill"
        suppressChildrenWhenFilled
      >
        <div className={styles.empty}>
          暂无推导记录。运行 UGSci 公式后可在此查看。
        </div>
      </Slot>
    </div>
  );
}

/** The runtime plugin owns monitoring; this surface only supplies session scope. */
export function WorkbenchSimulationPanel({
  runId,
  scope,
}: {
  runId?: string;
  scope: Extract<FilesWorkspaceScope, { kind: "session" }>;
}) {
  const [, setVersion] = useState(0);
  useEffect(() => {
    const changed = () => setVersion((version) => version + 1);
    window.addEventListener("qwenpaw:simulation-monitor-ready", changed);
    return () =>
      window.removeEventListener("qwenpaw:simulation-monitor-ready", changed);
  }, []);
  const Monitor = (
    window as unknown as {
      QwenPaw?: {
        runCenter?: {
          SimulationMonitor?: ComponentType<{
            runId: string;
            scope: { agentId: string; chatId: string };
          }>;
        };
      };
    }
  ).QwenPaw?.runCenter?.SimulationMonitor;
  return (
    <div className={`${styles.workbenchPanel} ${styles.genUiPanel}`}>
      {!runId ? (
        <p>从聊天中的模拟任务卡片选择“在侧栏监测”，即可持续查看曲线和场图。</p>
      ) : !Monitor ? (
        <p role="status">运行中心监测组件尚未加载，请启用运行中心插件。</p>
      ) : (
        createElement(Monitor, {
          key: `${scope.agentId}:${scope.sessionId}:${runId}`,
          runId,
          scope: {
            agentId: scope.agentId,
            chatId: scope.chatId || scope.sessionId,
          },
        })
      )}
    </div>
  );
}
