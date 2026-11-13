import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { Dropdown } from "antd";
import { GripHorizontal, GripVertical } from "lucide-react";
import { useTranslation } from "react-i18next";
import styles from "./navigationDock.module.less";

export type NavigationEdge = "left" | "right" | "bottom" | "floating";
type Placement = { edge: NavigationEdge; x: number; y: number };
const KEY = "ugsci_navigation_dock_v1";
const EDGES: NavigationEdge[] = ["left", "right", "bottom", "floating"];
const DEFAULT: Placement = { edge: "left", x: 120, y: 80 };
function readPlacement(): Placement {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (
      value &&
      EDGES.includes(value.edge) &&
      Number.isFinite(value.x) &&
      Number.isFinite(value.y)
    )
      return value;
  } catch {
    /* Storage may be unavailable in private browsing. */
  }
  return DEFAULT;
}
function bound(value: number, size: number, extent: number) {
  return Math.max(8, Math.min(value, Math.max(8, extent - size - 8)));
}

/** The feature rail has one owner, including while its orientation changes. */
export default function NavigationDock({
  children,
}: {
  children: (handle: ReactNode) => ReactNode;
}) {
  const { t } = useTranslation();
  const [placement, setPlacement] = useState(readPlacement);
  const [drag, setDrag] = useState<{
    x: number;
    y: number;
    target: NavigationEdge;
  } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const anchor = useRef<HTMLDivElement>(null);
  const dock = useRef<HTMLDivElement>(null);
  const handle = useRef<HTMLButtonElement>(null);
  const suppressClick = useRef(0);
  const gesture = useRef<{
    id: number;
    startX: number;
    startY: number;
    dx: number;
    dy: number;
    moved: boolean;
    x: number;
    y: number;
    target: NavigationEdge;
  } | null>(null);
  const commit = useCallback((next: Placement) => {
    setPlacement(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* Keep this session usable. */
    }
  }, []);
  const finish = useCallback(
    (cancel: boolean) => {
      const current = gesture.current;
      if (!current) return;
      gesture.current = null;
      if (current.moved) {
        suppressClick.current = Date.now() + 300;
        if (!cancel) {
          const host = anchor.current?.parentElement?.getBoundingClientRect();
          commit({
            edge: current.target,
            x: current.x - (host?.left ?? 0),
            y: current.y - (host?.top ?? 0),
          });
        }
      }
      setDrag(null);
      if (handle.current?.hasPointerCapture?.(current.id))
        handle.current.releasePointerCapture(current.id);
    },
    [commit],
  );
  useEffect(() => {
    const cancel = () => finish(true);
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && gesture.current) {
        event.preventDefault();
        cancel();
      }
    };
    const storage = (event: StorageEvent) => {
      if (event.key === KEY && !gesture.current) setPlacement(readPlacement());
    };
    window.addEventListener("blur", cancel);
    window.addEventListener("keydown", escape);
    window.addEventListener("storage", storage);
    return () => {
      window.removeEventListener("blur", cancel);
      window.removeEventListener("keydown", escape);
      window.removeEventListener("storage", storage);
      const current = gesture.current;
      gesture.current = null;
      if (current && handle.current?.hasPointerCapture?.(current.id))
        handle.current.releasePointerCapture(current.id);
    };
  }, [finish]);
  useEffect(() => {
    if (placement.edge !== "floating") return;
    const constrain = () => {
      if (gesture.current || !dock.current || !anchor.current?.parentElement)
        return;
      const host = anchor.current.parentElement.getBoundingClientRect();
      const rect = dock.current.getBoundingClientRect();
      const next = {
        ...placement,
        x: bound(placement.x, rect.width, host.width),
        y: bound(placement.y, rect.height, host.height),
      };
      if (next.x !== placement.x || next.y !== placement.y) setPlacement(next);
    };
    constrain();
    const observer = new ResizeObserver(constrain);
    if (anchor.current?.parentElement)
      observer.observe(anchor.current.parentElement);
    if (dock.current) observer.observe(dock.current);
    return () => observer.disconnect();
  }, [placement]);
  const down = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || gesture.current || !dock.current) return;
    const rect = dock.current.getBoundingClientRect();
    gesture.current = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      dx: event.clientX - rect.left,
      dy: event.clientY - rect.top,
      moved: false,
      x: rect.left,
      y: rect.top,
      target: placement.edge,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const move = (event: PointerEvent<HTMLButtonElement>) => {
    const current = gesture.current;
    const host = anchor.current?.parentElement?.getBoundingClientRect();
    if (!current || current.id !== event.pointerId || !host || !dock.current)
      return;
    if (
      !current.moved &&
      Math.hypot(
        event.clientX - current.startX,
        event.clientY - current.startY,
      ) < 6
    )
      return;
    event.preventDefault();
    current.moved = true;
    setMenuOpen(false);
    const rect = dock.current.getBoundingClientRect();
    current.x =
      host.left +
      bound(event.clientX - current.dx - host.left, rect.width, host.width);
    current.y =
      host.top +
      bound(event.clientY - current.dy - host.top, rect.height, host.height);
    const distances = [
      ["left", Math.abs(event.clientX - host.left)],
      ["right", Math.abs(event.clientX - host.right)],
      ["bottom", Math.abs(event.clientY - host.bottom)],
    ] as Array<[NavigationEdge, number]>;
    distances.sort((a, b) => a[1] - b[1]);
    current.target =
      distances[0][1] <= Math.min(64, host.width * 0.2, host.height * 0.2)
        ? distances[0][0]
        : "floating";
    setDrag({ x: current.x, y: current.y, target: current.target });
  };
  const horizontal = placement.edge === "bottom";
  const floatingStyle: CSSProperties | undefined = drag
    ? {
        position: "fixed",
        left: drag.x,
        top: drag.y,
        right: "auto",
        bottom: "auto",
        transform: "none",
      }
    : placement.edge === "floating"
    ? { left: placement.x, top: placement.y }
    : undefined;
  return (
    <div
      ref={anchor}
      className={styles.anchor}
      data-navigation-dock={placement.edge}
    >
      <div
        ref={dock}
        className={`${styles.dock} ${drag ? styles.dragging : ""}`}
        data-navigation-orientation={horizontal ? "horizontal" : "vertical"}
        style={floatingStyle}
      >
        {children(
          <Dropdown
            trigger={["click"]}
            open={menuOpen}
            onOpenChange={(open) => {
              if (
                Date.now() >= suppressClick.current &&
                !gesture.current?.moved
              )
                setMenuOpen(open);
            }}
            menu={{
              selectable: true,
              selectedKeys: [placement.edge],
              items: EDGES.map((edge) => ({
                key: edge,
                label: t(`sidebar.dock.${edge}`),
              })),
              onClick: ({ key }) => {
                finish(true);
                commit({ ...placement, edge: key as NavigationEdge });
                setMenuOpen(false);
              },
            }}
          >
            <button
              ref={handle}
              type="button"
              className={styles.handle}
              data-navigation-drag-handle
              aria-label={t("sidebar.dock.handle")}
              title={t("sidebar.dock.handle")}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onPointerDown={down}
              onPointerMove={move}
              onPointerUp={(event) => {
                if (gesture.current?.id === event.pointerId) finish(false);
              }}
              onPointerCancel={(event) => {
                if (gesture.current?.id === event.pointerId) finish(true);
              }}
              onLostPointerCapture={(event) => {
                if (gesture.current?.id === event.pointerId) finish(true);
              }}
              onClickCapture={(event) => {
                if (Date.now() < suppressClick.current) {
                  event.preventDefault();
                  event.stopPropagation();
                }
              }}
            >
              {horizontal ? (
                <GripVertical size={18} />
              ) : (
                <GripHorizontal size={18} />
              )}
            </button>
          </Dropdown>,
        )}
      </div>
      {drag && (
        <div className={styles.targets} aria-hidden>
          {EDGES.filter((edge) => edge !== "floating").map((edge) => (
            <div
              key={edge}
              data-dock-target={edge}
              data-active={drag.target === edge || undefined}
            >
              {t(`sidebar.dock.${edge}`)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
