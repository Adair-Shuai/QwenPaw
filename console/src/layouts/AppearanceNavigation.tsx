import { useEffect, useRef, useState, type ReactNode } from "react";
import { Popover } from "antd";
import { Clock3, FolderOpen, Grid2X2, MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { FlatMenuEntry } from "./registry/adapter";
import styles from "./appearanceNavigation.module.less";

export default function AppearanceNavigation({
  entries,
  shortcuts,
  selectedKey,
  onNavigate,
  onWorkspace,
  renderEntry,
}: {
  entries: FlatMenuEntry[];
  shortcuts: FlatMenuEntry[];
  selectedKey: string;
  onNavigate: (entry: FlatMenuEntry) => void;
  onWorkspace?: (trigger: HTMLElement) => void;
  renderEntry: (entry: FlatMenuEntry) => ReactNode;
}) {
  const { t } = useTranslation();
  const [moreOpen, setMoreOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!moreOpen) return;
    const frame = requestAnimationFrame(
      () => panel.current?.querySelector<HTMLButtonElement>("button")?.focus(),
    );
    return () => cancelAnimationFrame(frame);
  }, [moreOpen]);
  const extraEntries = shortcuts.filter(
    (entry) =>
      !["core.app-center", "core.cron-jobs", "core.chat"].includes(entry.key),
  );
  const workKeys = new Set(["core.files", "core.workspace", "core.inbox"]);
  const groups = [
    {
      label: t("sidebar.moreGroups.work", "Work & notifications"),
      entries: extraEntries.filter((entry) => workKeys.has(entry.key)),
    },
    {
      label: t("sidebar.moreGroups.configuration", "Configuration"),
      entries: extraEntries.filter(
        (entry) => entry.key.startsWith("core.") && !workKeys.has(entry.key),
      ),
    },
    {
      label: t("sidebar.moreGroups.extensions", "Extensions"),
      entries: extraEntries.filter((entry) => !entry.key.startsWith("core.")),
    },
  ];
  const apps = entries.find((entry) => entry.key === "core.app-center");
  const automation = entries.find((entry) => entry.key === "core.cron-jobs");
  const mainEntry = (
    entry: FlatMenuEntry | undefined,
    icon: ReactNode,
    label: string,
  ) =>
    entry && (
      <button
        type="button"
        aria-current={selectedKey === entry.key ? "page" : undefined}
        onClick={() => onNavigate(entry)}
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  return (
    <nav
      className={styles.navigation}
      aria-label={t("sidebar.pageNavigation", "Main navigation")}
    >
      {mainEntry(apps, <Grid2X2 size={17} />, t("nav.apps", "Apps"))}
      {mainEntry(
        automation,
        <Clock3 size={17} />,
        t("sidebar.automation", "Automation"),
      )}
      {onWorkspace && (
        <button
          type="button"
          onClick={(event) => onWorkspace(event.currentTarget)}
        >
          <FolderOpen size={17} />
          <span>{t("sidebar.pageWorkspace", "Workspace")}</span>
        </button>
      )}
      <Popover
        open={moreOpen}
        onOpenChange={setMoreOpen}
        trigger="click"
        placement="rightTop"
        arrow={false}
        classNames={{ root: styles.popover }}
        content={
          <div
            ref={panel}
            className={styles.morePanel}
            role="dialog"
            aria-label={t("sidebar.moreFeatures", "More")}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                setMoreOpen(false);
                trigger.current?.focus();
              }
            }}
          >
            {groups
              .filter((group) => group.entries.length > 0)
              .map((group) => (
                <section
                  key={group.label}
                  className={styles.group}
                  aria-label={group.label}
                >
                  <div className={styles.groupHeading}>{group.label}</div>
                  <div
                    className={styles.entryGrid}
                    onClick={() => setMoreOpen(false)}
                  >
                    {group.entries.map(renderEntry)}
                  </div>
                </section>
              ))}
          </div>
        }
      >
        <button
          ref={trigger}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={moreOpen}
        >
          <MoreHorizontal size={17} />
          <span>{t("sidebar.moreFeatures", "More")}</span>
        </button>
      </Popover>
    </nav>
  );
}
