import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { isTauriRuntime } from "./backendRuntime";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Copy, Minus, PanelLeft, Square, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import styles from "./DesktopWindowFrame.module.less";

type SidebarAction = { expanded: boolean; toggle: () => void };
const FrameContext = createContext<{
  setSidebar: (action: SidebarAction | null) => void;
} | null>(null);

export function ConversationToggle({ expanded, toggle }: SidebarAction) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className={styles.sidebarToggle}
      aria-label={t(
        expanded
          ? "sidebar.dualSidebar.collapse"
          : "sidebar.dualSidebar.expand",
        expanded ? "Collapse conversation pane" : "Expand conversation pane",
      )}
      title={t(
        expanded
          ? "sidebar.dualSidebar.collapse"
          : "sidebar.dualSidebar.expand",
        expanded ? "Collapse conversation pane" : "Expand conversation pane",
      )}
      aria-expanded={expanded}
      aria-controls="ugsci-sidebar-conversations"
      onClick={toggle}
    >
      <PanelLeft size={17} aria-hidden />
    </button>
  );
}

export function useWindowSidebar(action: SidebarAction | null) {
  const frame = useContext(FrameContext);
  const toggle = action?.toggle;
  const expanded = action?.expanded;
  useEffect(() => {
    frame?.setSidebar(toggle ? { toggle, expanded: !!expanded } : null);
    return () => frame?.setSidebar(null);
  }, [frame, toggle, expanded]);
  return !!frame;
}

/** Shared by the bootstrap and Console: only the outer frame owns native controls. */
export default function DesktopWindowFrame({
  children,
}: {
  children: ReactNode;
}) {
  const parent = useContext(FrameContext);
  return parent ? <>{children}</> : <WindowFrame>{children}</WindowFrame>;
}

function WindowFrame({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const native = isTauriRuntime();
  // Preview affects layout only; browser controls never invoke native commands.
  const [preview] = useState(() =>
    new URLSearchParams(window.location.search).get("desktopPreview"),
  );
  const mac = native ? /Mac/i.test(navigator.platform) : preview === "macos";
  const [sidebar, setSidebar] = useState<SidebarAction | null>(null);
  const context = useRef({ setSidebar }).current;
  const [maximized, setMaximized] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [failure, setFailure] = useState(false);
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  useEffect(() => {
    if (!native) return;
    let disposed = false;
    let revision = 0;
    let unlisten: (() => void) | undefined;
    const win = getCurrentWindow();
    const sync = async () => {
      const current = ++revision;
      try {
        const [max, full] = await Promise.all([
          win.isMaximized(),
          win.isFullscreen(),
        ]);
        if (!disposed && current === revision) {
          setMaximized(max);
          setFullscreen(full);
        }
      } catch {
        /* A closing window may no longer answer queries. */
      }
    };
    void sync();
    void win
      .onResized(() => void sync())
      .then((stop) => {
        if (disposed) stop();
        else unlisten = stop;
      })
      .catch(() => setFailure(true));
    return () => {
      disposed = true;
      unlisten?.();
    };
  }, [native]);
  const act = async (command: "minimize" | "toggleMaximize" | "close") => {
    if (!native || inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setFailure(false);
    try {
      const win = getCurrentWindow();
      await win[command]();
      if (command === "toggleMaximize") setMaximized(await win.isMaximized());
    } catch {
      setFailure(true);
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };
  return (
    <FrameContext.Provider value={context}>
      <div
        className={styles.frame}
        data-window-platform={mac ? "macos" : "windows"}
        data-window-fullscreen={fullscreen || undefined}
      >
        <header className={styles.titlebar} data-tauri-drag-region>
          {mac ? (
            !native && (
              <span className={styles.trafficLights} aria-hidden>
                <i />
                <i />
                <i />
              </span>
            )
          ) : (
            <span className={styles.brand} data-tauri-drag-region>
              <img
                src={`${import.meta.env.BASE_URL}ugsci-mono/brand/mark.svg`}
                alt=""
              />
              UGSci
            </span>
          )}
          {sidebar && <ConversationToggle {...sidebar} />}
          {!mac && (native || preview === "windows") && (
            <div className={styles.controls}>
              <button
                type="button"
                disabled={!native || busy}
                aria-label={t("desktop.window.minimize", "Minimize window")}
                onClick={() => void act("minimize")}
              >
                <Minus size={15} />
              </button>
              <button
                type="button"
                disabled={!native || busy}
                aria-label={t(
                  maximized
                    ? "desktop.window.restore"
                    : "desktop.window.maximize",
                  maximized ? "Restore window" : "Maximize window",
                )}
                onClick={() => void act("toggleMaximize")}
              >
                {maximized ? <Copy size={13} /> : <Square size={13} />}
              </button>
              <button
                type="button"
                className={styles.close}
                disabled={!native || busy}
                aria-label={t("desktop.window.close", "Close window")}
                onClick={() => void act("close")}
              >
                <X size={17} />
              </button>
            </div>
          )}
        </header>
        {failure && (
          <div className={styles.error} role="alert">
            {t(
              "desktop.window.failed",
              "Window action failed. Please try again.",
            )}
          </div>
        )}
        <div className={styles.content}>{children}</div>
      </div>
    </FrameContext.Provider>
  );
}
