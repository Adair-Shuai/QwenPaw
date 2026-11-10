import { memo, useEffect, useRef, useState, useSyncExternalStore } from "react";
import startup from "../../assets/ugsci-motion/startup.svg?url&no-inline";
import startupStatic from "../../assets/ugsci-motion/startup-static.svg?url&no-inline";
import page from "../../assets/ugsci-motion/page.svg?url&no-inline";
import pageStatic from "../../assets/ugsci-motion/page-static.svg?url&no-inline";
import content from "../../assets/ugsci-motion/content.svg?url&no-inline";
import contentStatic from "../../assets/ugsci-motion/content-static.svg?url&no-inline";
import model from "../../assets/ugsci-motion/model.svg?url&no-inline";
import modelStatic from "../../assets/ugsci-motion/model-static.svg?url&no-inline";
import files from "../../assets/ugsci-motion/files.svg?url&no-inline";
import filesStatic from "../../assets/ugsci-motion/files-static.svg?url&no-inline";
import button from "../../assets/ugsci-motion/button.svg?url&no-inline";
import buttonStatic from "../../assets/ugsci-motion/button-static.svg?url&no-inline";
import styles from "./index.module.less";

const assets = {
  startup: [startupStatic, startup],
  page: [pageStatic, page],
  content: [contentStatic, content],
  model: [modelStatic, model],
  files: [filesStatic, files],
  button: [buttonStatic, button],
} as const;

export type UgsciMotionVariant = keyof typeof assets;

const listeners = new Set<() => void>();
let preference: MediaQueryList | undefined;
const getPreference = () =>
  (preference ??= window.matchMedia("(prefers-reduced-motion: reduce)"));
const canAnimate = () => !document.hidden && !getPreference().matches;
const serverSnapshot = () => false;
function notifyActivity() {
  listeners.forEach((listener) => listener());
}
function subscribeActivity(listener: () => void) {
  if (!listeners.size) {
    getPreference().addEventListener("change", notifyActivity);
    document.addEventListener("visibilitychange", notifyActivity);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      preference?.removeEventListener("change", notifyActivity);
      document.removeEventListener("visibilitychange", notifyActivity);
      preference = undefined;
    }
  };
}

const targets = new Map<Element, (visible: boolean) => void>();
let observer: IntersectionObserver | undefined;
function observe(element: Element, onChange: (visible: boolean) => void) {
  if (typeof IntersectionObserver === "undefined") {
    onChange(true);
    return;
  }
  observer ??= new IntersectionObserver((entries) => {
    entries.forEach(
      (entry) => targets.get(entry.target)?.(entry.isIntersecting),
    );
  });
  targets.set(element, onChange);
  observer.observe(element);
  return () => {
    observer?.unobserve(element);
    targets.delete(element);
    if (!targets.size) {
      observer?.disconnect();
      observer = undefined;
    }
  };
}

/** Shared, browser-cached SVG files. No frame loop or per-instance timer. */
export const UgsciMotion = memo(function UgsciMotion({
  variant,
  size = 64,
  active = true,
  label,
  className,
  theme,
}: {
  variant: UgsciMotionVariant;
  size?: number;
  active?: boolean;
  label?: string;
  className?: string;
  theme?: "light" | "dark";
}) {
  const image = useRef<HTMLImageElement>(null);
  const [visible, setVisible] = useState(false);
  const enabled = useSyncExternalStore(
    subscribeActivity,
    canAnimate,
    serverSnapshot,
  );
  useEffect(() => {
    if (image.current) return observe(image.current, setVisible);
  }, []);
  const running = active && visible && enabled;
  const height =
    variant === "content"
      ? Math.round((size * 103) / 202)
      : variant === "page"
      ? Math.round((size * 106) / 226)
      : size;
  return (
    <img
      ref={image}
      src={assets[variant][running ? 1 : 0]}
      alt={label ?? ""}
      aria-hidden={label ? undefined : true}
      draggable={false}
      width={size}
      height={height}
      className={`${styles.visual} ${className ?? ""}`.trim()}
      data-ugsci-motion={variant}
      data-motion-running={running}
      data-motion-theme={theme}
      style={{ width: size, height }}
    />
  );
});

/** Stable loading configuration shared by native busy buttons. */
export const UGSCI_BUTTON_LOADING = {
  icon: <UgsciMotion variant="button" size={16} />,
};

export function UgsciLoading({
  variant = "content",
  label,
}: {
  variant?: UgsciMotionVariant;
  label: string;
}) {
  return (
    <div
      className={styles.loading}
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      <UgsciMotion
        variant={variant}
        size={variant === "content" || variant === "page" ? 176 : 80}
      />
      {variant !== "startup" && <span>{label}</span>}
    </div>
  );
}
