import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { WorkbenchMode } from "./types";
import type { WorkbenchTab } from "./workbenchTabsStore";
import { WorkbenchIcon, WorkbenchTitle } from "./WorkbenchExtensions";
import { ContentDescription, ContentIcon } from "./WorkbenchTabBar";
import styles from "./WorkbenchTabs.module.less";

const TOOLS: WorkbenchMode[] = [
  "files",
  "browser",
  "terminal",
  "review",
  "interactions",
  "agents",
];
const COMMON_VIEWS: WorkbenchMode[] = ["genui", "compute", "simulation"];

export default function WorkbenchStartPage({
  recent,
  onOpen,
  onReopen,
  background,
  empty = false,
}: {
  recent: WorkbenchTab[];
  onOpen: (kind: WorkbenchMode) => void;
  onReopen: (tab: WorkbenchTab) => void;
  background?: ReactNode;
  empty?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <section
      className={styles.startPage}
      aria-label={
        empty ? t("workbench.empty.label") : t("workbench.tabs.newTab")
      }
    >
      <div className={styles.startBody}>
        <section
          className={styles.startSection}
          aria-label={t("workbench.start.tools")}
        >
          <h2>{t("workbench.start.tools")}</h2>
          <div className={styles.toolGrid}>
            {TOOLS.map((kind) => (
              <button
                key={kind}
                type="button"
                className={styles.toolButton}
                aria-label={
                  kind === "files" || kind === "browser"
                    ? undefined
                    : t("workbench.start.openView", {
                        name: t(`workbench.activity.${kind}`),
                      })
                }
                onClick={() => onOpen(kind)}
              >
                <WorkbenchIcon mode={kind} />
                <span>
                  {kind === "files" ? (
                    t("workbench.tabs.openFile")
                  ) : kind === "browser" ? (
                    t("workbench.tabs.newBrowser")
                  ) : (
                    <WorkbenchTitle mode={kind} />
                  )}
                </span>
                <ArrowUpRight
                  size={13}
                  className={styles.launchArrow}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        </section>
        <section
          className={styles.startSection}
          aria-label={t("workbench.start.common")}
        >
          <h2>{t("workbench.start.common")}</h2>
          <div className={styles.commonGrid}>
            {COMMON_VIEWS.map((kind) => (
              <button
                key={kind}
                type="button"
                className={styles.commonButton}
                aria-label={t("workbench.start.openView", {
                  name: t(`workbench.activity.${kind}`),
                })}
                onClick={() => onOpen(kind)}
              >
                <span className={styles.commonIcon}>
                  <WorkbenchIcon mode={kind} />
                </span>
                <span>
                  <WorkbenchTitle mode={kind} />
                </span>
              </button>
            ))}
          </div>
        </section>
        {background && (
          <section
            className={styles.startSection}
            aria-label={t("workbench.empty.backgroundTitle")}
          >
            <h2>{t("workbench.empty.backgroundTitle")}</h2>
            {background}
          </section>
        )}
        <section
          className={styles.startSection}
          aria-label={t("workbench.empty.recent")}
        >
          <h2>{t("workbench.empty.recent")}</h2>
          <div className={styles.emptyRows}>
            {recent.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={styles.emptyRow}
                onClick={() => onReopen(tab)}
              >
                <ContentIcon tab={tab} />
                <span>
                  <strong>{tab.title}</strong>
                  <ContentDescription tab={tab} />
                </span>
                <ArrowUpRight size={14} aria-hidden="true" />
              </button>
            ))}
            {!recent.length && (
              <p className={styles.startHint}>
                {t("workbench.start.noRecent")}
              </p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
