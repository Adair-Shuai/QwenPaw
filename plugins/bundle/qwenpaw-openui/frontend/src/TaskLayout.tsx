import {
  Component,
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  defineComponent,
  Renderer,
  type OpenUIError,
} from "@openuidev/react-lang";
import { ThemeProvider } from "@openuidev/react-ui";
import { z } from "zod/v4";
import { getHost } from "./host";
import { streamingLibrary } from "./library";
import { useOpenUIStyles } from "./styles";
import { useOpenUITheme } from "./theme";

export interface TaskLayoutPlan {
  title?: string;
  objective?: string;
  layout: "stack" | "tabs" | "dashboard";
  panels: Array<{ id: string; title?: string; description?: string }>;
}

export interface TaskLayoutProps {
  scopeKey: string;
  plan: TaskLayoutPlan;
  panels: Record<string, ReactNode>;
  compact?: boolean;
}

const planSchema = z
  .object({
    title: z.string().max(2000).optional(),
    objective: z.string().max(6000).optional(),
    layout: z.enum(["stack", "tabs", "dashboard"]),
    panels: z
      .array(
        z
          .object({
            id: z.string().min(1).max(160),
            title: z.string().max(2000).optional(),
            description: z.string().max(6000).optional(),
          })
          .strict(),
      )
      .min(1)
      .max(64),
  })
  .strict();

interface PanelContextValue {
  panels: Record<string, ReactNode>;
  plan: TaskLayoutPlan;
  active: string;
  setActive: (id: string) => void;
  compact: boolean;
  zh: boolean;
}
const PanelContext = createContext<PanelContextValue | null>(null);

class PanelBoundary extends Component<
  {
    children: ReactNode;
    fallback: ReactNode;
    resetKey: unknown;
  },
  { failed: boolean; resetKey: unknown }
> {
  state = { failed: false, resetKey: this.props.resetKey };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  static getDerivedStateFromProps(
    props: { resetKey: unknown },
    state: { resetKey: unknown },
  ) {
    return props.resetKey !== state.resetKey
      ? { failed: false, resetKey: props.resetKey }
      : null;
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function TaskPanelContent({ id }: { id: string }) {
  const context = useContext(PanelContext);
  if (!context) return null;
  const { plan, panels, active, compact, zh } = context;
  const order = plan.panels.findIndex((panel) => panel.id === id);
  const metadata = plan.panels[order];
  const visible = order >= 0 && (plan.layout !== "tabs" || active === id);
  return (
    <section
      data-openui-task-panel={id}
      hidden={!visible}
      aria-label={metadata?.title || id}
      style={{
        order,
        minWidth: 0,
        maxWidth: "100%",
        flex: plan.layout === "dashboard" ? "1 1 min(100%, 320px)" : "1 1 100%",
        padding: compact ? 8 : 14,
        border:
          "1px solid var(--app-border, var(--ant-color-border-secondary, #ddd))",
        borderRadius: 8,
      }}
    >
      <h3 style={{ margin: "0 0 8px", fontSize: "1em" }}>
        {metadata?.title || id}
      </h3>
      {metadata?.description && (
        <p style={{ margin: "0 0 10px", opacity: 0.75 }}>
          {metadata.description}
        </p>
      )}
      <PanelBoundary
        resetKey={panels[id]}
        fallback={
          <p role="alert">
            {zh
              ? "此面板暂时无法显示；其他结果仍可查看。"
              : "This panel could not be displayed; other results remain available."}
          </p>
        }
      >
        {panels[id]}
      </PanelBoundary>
    </section>
  );
}

function TaskNavigationContent() {
  const context = useContext(PanelContext);
  if (!context || context.plan.layout !== "tabs") return null;
  return (
    <div
      role="tablist"
      aria-label={context.zh ? "任务结果面板" : "Task result panels"}
      style={{
        flex: "1 1 100%",
        order: -1,
        display: "flex",
        gap: 6,
        flexWrap: "wrap",
      }}
    >
      {context.plan.panels.map((panel) => (
        <button
          key={panel.id}
          type="button"
          role="tab"
          aria-selected={context.active === panel.id}
          onClick={() => context.setActive(panel.id)}
          style={{
            padding: "6px 12px",
            cursor: "pointer",
            borderRadius: 6,
            color: "inherit",
            background:
              context.active === panel.id
                ? "var(--app-active, var(--ant-color-primary-bg, #e6f4ff))"
                : "transparent",
            border:
              "1px solid var(--app-border, var(--ant-color-border-secondary, #ddd))",
          }}
        >
          {panel.title || panel.id}
        </button>
      ))}
    </div>
  );
}

// This library is private to task surfaces. Chat keeps the official catalog.
const taskLibrary = streamingLibrary.extend({
  components: {
    add: [
      defineComponent({
        name: "TaskPanel",
        props: z.object({ id: z.string() }),
        description: "Read-only host result panel identified by a supplied ID.",
        component: ({ props }) => <TaskPanelContent id={props.id} />,
      }),
      defineComponent({
        name: "TaskNavigation",
        props: z.object({}),
        description: "Local navigation between persistent task panels.",
        component: TaskNavigationContent,
      }),
    ],
  },
});

/** IDs alone enter the language; no source, actions, URLs or data are executed. */
function taskSource(ids: string[]): string {
  const names = ids.map((_, index) => `task_panel_${index}`);
  return (
    `root = Stack([task_navigation${
      names.length ? ", " + names.join(", ") : ""
    }], "row", "m", "stretch", "start", true)\n` +
    "task_navigation = TaskNavigation()\n" +
    ids
      .map((id, index) => `${names[index]} = TaskPanel(${JSON.stringify(id)})`)
      .join("\n")
  );
}

function ScopedTaskLayout({
  scopeKey,
  plan,
  panels,
  compact = false,
}: TaskLayoutProps) {
  const host = getHost();
  const mode = host.host.useTheme();
  const zh = host.host.useLocale().startsWith("zh");
  const themes = useOpenUITheme();
  useOpenUIStyles();
  // Preserve already mounted host viewers, including while a plan hides them.
  const retained = useRef(new Map<string, ReactNode>());
  for (const [id, panel] of Object.entries(panels))
    retained.current.set(id, panel);
  const ids = [...retained.current.keys()];
  const source = taskSource(ids);
  const [active, setActive] = useState("");
  const [failedSource, setFailedSource] = useState("");
  const parsed = planSchema.safeParse(plan);
  const invalid =
    !parsed.success ||
    new Set(parsed.data.panels.map((panel) => panel.id)).size !==
      parsed.data.panels.length ||
    parsed.data.panels.some((panel) => !retained.current.has(panel.id));
  const effectivePlan: TaskLayoutPlan =
    invalid || failedSource === source
      ? { layout: "stack", panels: ids.map((id) => ({ id })) }
      : parsed.data!;
  const selected = effectivePlan.panels.some((panel) => panel.id === active)
    ? active
    : effectivePlan.panels[0]?.id || "";
  const values = Object.fromEntries(retained.current);
  const context: PanelContextValue = {
    panels: values,
    plan: effectivePlan,
    active: selected,
    setActive,
    compact,
    zh,
  };
  const onError = (errors: OpenUIError[]) => {
    if (errors.some((error) => error.severity !== "warning"))
      setFailedSource(source);
  };
  const fallback = (
    <PanelContext.Provider
      value={{
        ...context,
        plan: { layout: "stack", panels: ids.map((id) => ({ id })) },
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {ids.map((id) => (
          <TaskPanelContent key={id} id={id} />
        ))}
      </div>
    </PanelContext.Provider>
  );
  return (
    <section className="qwenpaw-openui" data-openui-task-scope={scopeKey}>
      <ThemeProvider mode={mode} {...themes} cssSelector=".qwenpaw-openui">
        <PanelContext.Provider value={context}>
          {effectivePlan.title && (
            <h2 style={{ margin: "0 0 8px", fontSize: "1.15em" }}>
              {effectivePlan.title}
            </h2>
          )}
          {effectivePlan.objective && (
            <p style={{ margin: "0 0 12px" }}>{effectivePlan.objective}</p>
          )}
          {(invalid || failedSource === source) && (
            <p role="alert">
              {zh
                ? "任务布局无效，已显示全部可用结果。"
                : "The task layout is invalid. All available results are shown."}
            </p>
          )}
          <PanelBoundary
            resetKey={source}
            fallback={
              <>
                <p role="alert">
                  {zh
                    ? "任务布局无法显示，已恢复全部可用结果。"
                    : "The task layout could not be displayed. All available results are shown."}
                </p>
                {fallback}
              </>
            }
          >
            {failedSource === source ? (
              fallback
            ) : (
              <Renderer
                response={source}
                library={taskLibrary}
                isStreaming={false}
                onError={onError}
                toolProvider={null}
                publishObservability={false}
              />
            )}
          </PanelBoundary>
        </PanelContext.Provider>
      </ThemeProvider>
    </section>
  );
}

export function TaskLayout(props: TaskLayoutProps) {
  return <ScopedTaskLayout key={props.scopeKey} {...props} />;
}
