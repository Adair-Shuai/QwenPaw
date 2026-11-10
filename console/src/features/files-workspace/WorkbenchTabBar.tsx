import { useEffect, useRef, useState, type ReactNode } from "react";
import { Dropdown, Tooltip } from "antd";
import { ChevronDown, GitCompareArrows, Plus, Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { WorkbenchTab } from "./workbenchTabsStore";
import { WorkbenchIcon } from "./WorkbenchExtensions";
import styles from "./WorkbenchTabs.module.less";

export function ContentIcon({ tab }: { tab: WorkbenchTab }) {
  return <WorkbenchIcon mode={tab.kind === "graph" ? "files" : tab.kind} />;
}

export function ContentDescription({ tab }: { tab: WorkbenchTab }) {
  const { t } = useTranslation();
  const description =
    tab.target?.path ||
    tab.browser?.input ||
    t(`workbench.activity.${tab.kind === "graph" ? "files" : tab.kind}`);
  return description === tab.title ? null : <small>{description}</small>;
}

export default function WorkbenchTabBar({
  tabs,
  idPrefix,
  activeId,
  dirtyPaths,
  changedPaths,
  onSelect,
  onClose,
  onCloseOthers,
  onCloseAll,
  onNew,
  actions,
}: {
  tabs: WorkbenchTab[];
  idPrefix: string;
  activeId: string;
  dirtyPaths: Set<string>;
  changedPaths: Set<string>;
  onSelect: (tab: WorkbenchTab) => void;
  onClose: (tab: WorkbenchTab) => void;
  onCloseOthers: (tab: WorkbenchTab) => void;
  onCloseAll: () => void;
  onNew: () => void;
  actions: ReactNode;
}) {
  const { t } = useTranslation();
  const [listOpen, setListOpen] = useState(false);
  const [query, setQuery] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const listButton = useRef<HTMLButtonElement>(null);
  const elements = useRef(new Map<string, HTMLDivElement>());
  useEffect(() => {
    elements.current
      .get(activeId)
      ?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  }, [activeId]);
  useEffect(() => {
    if (!listOpen) return;
    const close = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !listRef.current?.contains(event.target) &&
        !listButton.current?.contains(event.target)
      )
        setListOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [listOpen]);
  useEffect(() => {
    if (!tabs.length) setListOpen(false);
  }, [tabs.length]);
  const closeLabel = t("workbench.tabs.close", "关闭内容");
  const closeOthersLabel = t("workbench.tabs.closeOthers", "关闭其他内容");
  const closeAllLabel = t("workbench.tabs.closeAll", "关闭全部内容");
  const active = tabs.find((tab) => tab.id === activeId);
  const filtered = tabs.filter((tab) =>
    `${tab.title} ${tab.target?.path ?? ""} ${tab.browser?.input ?? ""} ${
      tab.kind
    }`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );

  return (
    <header className={styles.tabBar}>
      {tabs.length ? (
        <div
          className={styles.tabViewport}
          role="tablist"
          aria-label={t("workbench.tabs.label", "工作区内容")}
        >
          {tabs.map((tab, index) => (
            <Dropdown
              key={tab.id}
              trigger={["contextMenu"]}
              menu={{
                items: [
                  { key: "close", label: closeLabel },
                  {
                    key: "others",
                    label: closeOthersLabel,
                    disabled: tabs.length < 2,
                  },
                  { key: "all", label: closeAllLabel },
                ],
                onClick: ({ key }) => {
                  if (key === "close") onClose(tab);
                  if (key === "others") onCloseOthers(tab);
                  if (key === "all") onCloseAll();
                },
              }}
            >
              <div
                ref={(element) => {
                  if (element) elements.current.set(tab.id, element);
                  else elements.current.delete(tab.id);
                }}
                role="tab"
                id={`${idPrefix}-tab-${encodeURIComponent(tab.id)}`}
                aria-controls={
                  tab.kind === "files" || tab.kind === "graph"
                    ? `${idPrefix}-files`
                    : `${idPrefix}-panel-${encodeURIComponent(tab.id)}`
                }
                aria-selected={tab.id === activeId}
                tabIndex={
                  tab.id === activeId || (!activeId && index === 0) ? 0 : -1
                }
                className={`${styles.tab} ${
                  tab.id === activeId ? styles.activeTab : ""
                }`}
                title={tab.target?.path ?? tab.title}
                onClick={() => onSelect(tab)}
                onAuxClick={(event) => {
                  if (event.button === 1) {
                    event.preventDefault();
                    onClose(tab);
                  }
                }}
                onKeyDown={(event) => {
                  if (event.target !== event.currentTarget) return;
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(tab);
                  }
                  let next = index;
                  if (event.key === "ArrowRight")
                    next = (index + 1) % tabs.length;
                  else if (event.key === "ArrowLeft")
                    next = (index + tabs.length - 1) % tabs.length;
                  else if (event.key === "Home") next = 0;
                  else if (event.key === "End") next = tabs.length - 1;
                  else return;
                  event.preventDefault();
                  onSelect(tabs[next]);
                  elements.current.get(tabs[next].id)?.focus();
                }}
              >
                <ContentIcon tab={tab} />
                <span className={styles.tabTitle}>{tab.title}</span>
                {tab.filePath && changedPaths.has(tab.filePath) && (
                  <GitCompareArrows
                    size={13}
                    aria-label={t("files.agentChangedFile")}
                  />
                )}
                {tab.filePath && dirtyPaths.has(tab.filePath) && (
                  <span
                    className={styles.dirty}
                    aria-label={t("files.unsaved", "未保存")}
                  />
                )}
                <button
                  type="button"
                  tabIndex={
                    tab.id === activeId || (!activeId && index === 0) ? 0 : -1
                  }
                  aria-label={`${closeLabel} ${tab.title}`}
                  className={styles.closeTab}
                  onClick={(event) => {
                    event.stopPropagation();
                    onClose(tab);
                  }}
                >
                  <X size={13} aria-hidden="true" />
                </button>
              </div>
            </Dropdown>
          ))}
        </div>
      ) : (
        <span className={styles.emptyTitle}>
          {t("workbench.tabs.workspace", "工作区")}
        </span>
      )}
      <div className={styles.actions}>
        <Tooltip title={t("workbench.tabs.addTab")}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={onNew}
            aria-label={t("workbench.tabs.addTab")}
          >
            <Plus size={17} />
          </button>
        </Tooltip>
        <Tooltip title={t("workbench.tabs.all", "全部内容")}>
          <button
            ref={listButton}
            type="button"
            className={styles.iconButton}
            disabled={!tabs.length}
            aria-label={t("workbench.tabs.all", "全部内容")}
            aria-haspopup="dialog"
            aria-expanded={listOpen}
            onClick={() => {
              setQuery("");
              setListOpen((value) => !value);
            }}
          >
            <ChevronDown size={17} />
          </button>
        </Tooltip>
        {actions}
      </div>
      {listOpen && (
        <div
          ref={listRef}
          className={styles.contentList}
          role="dialog"
          aria-label={t("workbench.tabs.all", "全部内容")}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              setListOpen(false);
              listButton.current?.focus();
            }
          }}
        >
          <label className={styles.search}>
            <Search size={16} />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("workbench.tabs.search", "搜索已打开的内容")}
              aria-label={t("workbench.tabs.search", "搜索已打开的内容")}
            />
          </label>
          <div className={styles.listItems}>
            {filtered.map((tab) => (
              <div key={tab.id} className={styles.listRow}>
                <button
                  type="button"
                  aria-current={tab.id === activeId ? "page" : undefined}
                  onClick={() => {
                    onSelect(tab);
                    setListOpen(false);
                  }}
                >
                  <ContentIcon tab={tab} />
                  <span>
                    <strong>{tab.title}</strong>
                    <ContentDescription tab={tab} />
                  </span>
                </button>
                <button
                  type="button"
                  className={styles.iconButton}
                  aria-label={`${closeLabel} ${tab.title}`}
                  onClick={() => onClose(tab)}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {!filtered.length && (
              <p className={styles.noResults}>
                {t("workbench.tabs.noResults", "没有匹配的内容")}
              </p>
            )}
          </div>
          <footer className={styles.listFooter}>
            <button
              type="button"
              disabled={tabs.length < 2 || !active}
              onClick={() => {
                if (active) onCloseOthers(active);
                setListOpen(false);
              }}
            >
              {closeOthersLabel}
            </button>
            <button
              type="button"
              onClick={() => {
                onCloseAll();
                setListOpen(false);
              }}
            >
              {closeAllLabel}
            </button>
          </footer>
        </div>
      )}
    </header>
  );
}
