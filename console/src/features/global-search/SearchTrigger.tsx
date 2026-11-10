import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import styles from "./Search.module.less";

export const OPEN_SEARCH_EVENT = "qwenpaw:open-global-search";
export function SearchTrigger({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  const shortcut = /Mac|iPhone|iPad/.test(navigator.platform)
    ? "⌘ K"
    : "Ctrl K";
  return (
    <button
      type="button"
      className={`${styles.trigger} ${compact ? styles.compact : ""}`}
      title={`${t("globalSearch.title")} · ${shortcut}`}
      aria-label={t("globalSearch.title")}
      onClick={() => window.dispatchEvent(new Event(OPEN_SEARCH_EVENT))}
    >
      <Search size={17} aria-hidden="true" />
      {!compact && (
        <>
          <span>{t("globalSearch.title")}</span>
          <kbd>{shortcut}</kbd>
        </>
      )}
    </button>
  );
}
