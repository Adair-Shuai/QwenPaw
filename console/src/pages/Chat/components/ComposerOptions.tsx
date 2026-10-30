import { useEffect, useRef, useState, type ReactNode } from "react";
import { MoreHorizontal, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import styles from "./ComposerOptions.module.less";
import { OverlayVisibilityProvider } from "@/contexts/OverlayVisibilityContext";

/** Keep the real controls mounted when opening the menu or switching layouts. */
export function ComposerOptions({
  enabled,
  persistent = false,
  children,
}: {
  enabled: boolean;
  persistent?: boolean;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!enabled || !open) return;
    const frame = requestAnimationFrame(() => panel.current?.focus());
    const dismiss = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;
      // A directory/model/approval picker may render through a portal.
      if (
        event.target.closest(
          '.ant-popover, .qwenpaw-popover, .ant-dropdown, .qwenpaw-dropdown, [role="dialog"], [role="listbox"]',
        )
      )
        return;
      if (!root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", dismiss);
    };
  }, [enabled, open]);
  useEffect(() => {
    if (!enabled) setOpen(false);
  }, [enabled]);
  return (
    <OverlayVisibilityProvider value={!enabled || open}>
      <div
        ref={root}
        className={styles.root}
        data-composer-options={
          persistent ? "persistent" : enabled ? "menu" : "inline"
        }
      >
        {enabled && (
          <button
            ref={trigger}
            type="button"
            className={styles.trigger}
            aria-label={t("chat.composer.options", "Chat options")}
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <MoreHorizontal size={18} />
          </button>
        )}
        <div
          ref={panel}
          hidden={enabled && !open}
          className={styles.panel}
          role={enabled ? "dialog" : undefined}
          tabIndex={enabled ? -1 : undefined}
          aria-label={
            enabled ? t("chat.composer.options", "Chat options") : undefined
          }
          onKeyDown={(event) => {
            if (enabled && event.key === "Escape" && !event.defaultPrevented) {
              event.preventDefault();
              event.stopPropagation();
              setOpen(false);
              trigger.current?.focus();
            }
          }}
        >
          <div className={styles.heading}>
            <span>{t("chat.composer.options", "Chat options")}</span>
            <button
              type="button"
              aria-label={t("common.close", "Close")}
              onClick={() => {
                setOpen(false);
                trigger.current?.focus();
              }}
            >
              <X size={15} />
            </button>
          </div>
          {children}
        </div>
      </div>
    </OverlayVisibilityProvider>
  );
}

export function ComposerOptionRow({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.row}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.control}>{children}</div>
    </div>
  );
}
