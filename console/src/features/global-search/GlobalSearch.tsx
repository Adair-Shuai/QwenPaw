import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Button,
  Checkbox,
  Input,
  Modal,
  Select,
  Spin,
  Tabs,
  message,
} from "antd";
import type { InputRef } from "antd";
import {
  Search,
  MessageSquare,
  FileText,
  Package,
  ArrowUpRight,
  CalendarDays,
  SlidersHorizontal,
  CornerDownRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useAgentStore } from "../../stores/agentStore";
import { getSessionIdFromPath } from "../../utils/sessionRoute";
import { OPEN_SEARCH_EVENT } from "./SearchTrigger";
import {
  excerpt,
  searchWorkspace,
  type SearchKind,
  type SearchResult,
  type SearchSnapshot,
} from "./search";
import styles from "./Search.module.less";

const EMPTY: SearchSnapshot = {
  results: [],
  scanned: 0,
  total: 0,
  failed: 0,
  limited: false,
};
const KINDS: SearchKind[] = ["all", "chat", "message", "file", "artifact"];
function ResultIcon({ kind, size = 18 }: { kind: SearchKind; size?: number }) {
  const Icon =
    kind === "artifact" ? Package : kind === "file" ? FileText : MessageSquare;
  return <Icon size={size} aria-hidden="true" />;
}
function Highlight({ text, query }: { text: string; query: string }) {
  const at = query
    ? text.toLocaleLowerCase().indexOf(query.toLocaleLowerCase())
    : -1;
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <mark className={styles.highlight}>
        {text.slice(at, at + query.length)}
      </mark>
      {text.slice(at + query.length)}
    </>
  );
}

export default function GlobalSearch() {
  const { t } = useTranslation();
  const selectedAgent = useAgentStore((s) => s.selectedAgent);
  const agents = useAgentStore((s) => s.agents);
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [agentId, setAgentId] = useState(selectedAgent);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<SearchKind>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [archived, setArchived] = useState(false);
  const [days, setDays] = useState(0);
  const [limit, setLimit] = useState(100);
  const [recent, setRecent] = useState<string[]>([]);
  const [snapshot, setSnapshot] = useState<SearchSnapshot>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [index, setIndex] = useState(0);
  const [sort, setSort] = useState("relevance");
  const input = useRef<InputRef>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const restoreFocus = useRef(true);
  const sequence = useRef(0);
  const trimmed = query.trim();

  useEffect(() => {
    const show = () => {
      if (open) {
        input.current?.focus();
        return;
      }
      restoreFocus.current = true;
      trigger.current = document.activeElement as HTMLElement;
      setOpen(true);
    };
    const key = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k" &&
        !event.altKey &&
        !event.isComposing
      ) {
        event.preventDefault();
        if (!event.repeat) show();
      }
    };
    window.addEventListener(OPEN_SEARCH_EVENT, show);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener(OPEN_SEARCH_EVENT, show);
      window.removeEventListener("keydown", key);
    };
  }, [open]);
  useEffect(() => {
    setAgentId(selectedAgent);
    setSnapshot(EMPTY);
  }, [selectedAgent]);
  useEffect(() => {
    setLimit(100);
  }, [query, kind, days, archived, agentId]);
  useEffect(() => {
    const controller = new AbortController();
    const seq = ++sequence.current;
    setSnapshot(EMPTY);
    setIndex(0);
    setError(false);
    if (!open) {
      setLoading(false);
      return () => controller.abort();
    }
    setLoading(true);
    const timer = setTimeout(
      () => {
        void searchWorkspace({
          query: trimmed,
          agentId,
          kind,
          archived,
          days,
          limit,
          signal: controller.signal,
          onProgress: (next) => {
            if (seq === sequence.current) setSnapshot(next);
          },
        })
          .catch(() => {
            if (!controller.signal.aborted && seq === sequence.current)
              setError(true);
          })
          .finally(() => {
            if (!controller.signal.aborted && seq === sequence.current)
              setLoading(false);
          });
      },
      trimmed ? 280 : 0,
    );
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [open, trimmed, agentId, kind, archived, days, limit, retry]);

  const results = useMemo(
    () =>
      [...snapshot.results].sort((a, b) => {
        if (sort === "relevance" && trimmed) {
          const score = (r: SearchResult) =>
            Number(
              r.title.toLocaleLowerCase() === trimmed.toLocaleLowerCase(),
            ) *
              2 +
            Number(r.kind === "chat");
          const difference = score(b) - score(a);
          if (difference) return difference;
        }
        return (
          b.timestamp.localeCompare(a.timestamp) || a.key.localeCompare(b.key)
        );
      }),
    [snapshot.results, sort, trimmed],
  );
  const active = results[Math.min(index, Math.max(0, results.length - 1))];
  const close = () => setOpen(false);
  const openResult = (result: SearchResult) => {
    restoreFocus.current = false;
    if (trimmed)
      setRecent((items) =>
        [trimmed, ...items.filter((item) => item !== trimmed)].slice(0, 6),
      );
    close();
    const params = new URLSearchParams({ agent: result.agentId });
    if (result.messageId) params.set("searchMessage", result.messageId);
    navigate(`/chat/${encodeURIComponent(result.chatId)}?${params}`);
  };

  // Wait for asynchronously loaded history, then focus only an exact message ID.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("searchMessage");
    if (
      !id ||
      !location.pathname.startsWith("/chat/") ||
      params.get("agent") !== selectedAgent
    )
      return;
    let highlighted: HTMLElement | undefined;
    const find = () => {
      const root = Array.from(
        document.querySelectorAll<HTMLElement>("[data-global-search-chat]"),
      ).find(
        (node) =>
          node.dataset.globalSearchChat ===
            getSessionIdFromPath(location.pathname) &&
          node.dataset.globalSearchAgent === selectedAgent,
      );
      if (!root) return false;
      const target = Array.from(
        root.querySelectorAll<HTMLElement>(
          "[data-global-search-message], [data-role][id]",
        ),
      ).find((node) => (node.dataset.globalSearchMessage || node.id) === id);
      if (!target) return false;
      highlighted = target;
      target.dataset.globalSearchHighlight = "true";
      target.scrollIntoView?.({ block: "center", behavior: "auto" });
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      return true;
    };
    const observer = new MutationObserver(() => {
      if (find()) observer.disconnect();
    });
    if (!find())
      observer.observe(
        document.getElementById("main-content") || document.body,
        {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: [
            "data-global-search-chat",
            "data-global-search-agent",
          ],
        },
      );
    const timeout = setTimeout(() => {
      observer.disconnect();
      if (!highlighted) void message.info(t("globalSearch.locateUnavailable"));
      else delete highlighted.dataset.globalSearchHighlight;
    }, 12000);
    return () => {
      clearTimeout(timeout);
      observer.disconnect();
      if (highlighted) delete highlighted.dataset.globalSearchHighlight;
    };
  }, [location.key, location.pathname, location.search, selectedAgent, t]);

  return (
    <Modal
      open={open}
      onCancel={close}
      footer={null}
      width={850}
      className={styles.modal}
      title={
        <div className={styles.heading}>
          <span>{t("globalSearch.title")}</span>
        </div>
      }
      styles={{
        content: {
          padding: 0,
          overflow: "hidden",
          background: "var(--app-surface)",
          borderRadius: "var(--app-radius-panel, 16px)",
          border: "1px solid var(--app-border)",
        },
        header: {
          padding: "20px 24px 0",
          margin: 0,
          background: "transparent",
        },
        body: { padding: 0 },
      }}
      focusTriggerAfterClose={false}
      afterOpenChange={(visible) => {
        if (visible) input.current?.focus();
        else if (restoreFocus.current && trigger.current?.isConnected)
          trigger.current.focus();
      }}
    >
      <div className={styles.search}>
        <Input
          ref={input}
          value={query}
          allowClear
          size="large"
          variant="borderless"
          className={styles.queryInput}
          prefix={<Search size={18} />}
          placeholder={t("globalSearch.placeholder")}
          aria-label={t("globalSearch.placeholder")}
          role="combobox"
          aria-expanded={true}
          aria-controls="global-search-results"
          aria-autocomplete="list"
          aria-activedescendant={
            active ? `global-search-result-${index}` : undefined
          }
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing) return;
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              const next = Math.max(
                0,
                Math.min(
                  results.length - 1,
                  index + (event.key === "ArrowDown" ? 1 : -1),
                ),
              );
              setIndex(next);
              document
                .getElementById(`global-search-result-${next}`)
                ?.scrollIntoView?.({ block: "nearest" });
            }
            if (event.key === "Enter" && active) {
              event.preventDefault();
              openResult(active);
            }
          }}
        />
      </div>
      <Tabs
        className={styles.tabs}
        activeKey={kind}
        onChange={(value) => setKind(value as SearchKind)}
        items={KINDS.map((key) => ({ key, label: t(`globalSearch.${key}`) }))}
      />
      <div className={styles.filters}>
        <Select
          variant="borderless"
          aria-label={t("globalSearch.agent")}
          value={agentId}
          style={{ minWidth: 130, maxWidth: 220 }}
          onChange={setAgentId}
          options={(agents.some((a) => a.id === agentId)
            ? agents
            : [{ id: agentId, name: agentId }, ...agents]
          )
            .filter(
              (a) =>
                !("available_in_chat" in a) || a.available_in_chat !== false,
            )
            .map((a) => ({ value: a.id, label: a.name }))}
        />
        <Select
          variant="borderless"
          aria-label={t("globalSearch.time")}
          value={days}
          onChange={setDays}
          style={{ minWidth: 110 }}
          options={[0, 7, 30].map((value) => ({
            value,
            label: t(`globalSearch.days${value}`),
          }))}
        />
        <Button
          type="text"
          className={styles.moreFilters}
          aria-expanded={filtersOpen}
          onClick={() => setFiltersOpen((value) => !value)}
        >
          <SlidersHorizontal size={14} />
          {t("globalSearch.filters")}
          {archived ? " · 1" : ""}
        </Button>
      </div>
      {filtersOpen && (
        <div className={styles.extraFilters}>
          <Checkbox
            checked={archived}
            onChange={(event) => setArchived(event.target.checked)}
          >
            {t("globalSearch.archived")}
          </Checkbox>
        </div>
      )}
      {!trimmed && recent.length > 0 && (
        <div className={styles.recent}>
          {t("globalSearch.recentSearches")}
          {recent.map((item) => (
            <Button size="small" key={item} onClick={() => setQuery(item)}>
              {item}
            </Button>
          ))}
          <Button size="small" type="text" onClick={() => setRecent([])}>
            {t("globalSearch.clear")}
          </Button>
        </div>
      )}
      {error && (
        <Alert
          type="error"
          message={t("globalSearch.error")}
          action={
            <Button onClick={() => setRetry((v) => v + 1)}>
              {t("globalSearch.retry")}
            </Button>
          }
        />
      )}
      <div className={styles.body}>
        <div className={styles.resultsPane}>
          <div className={styles.resultSummary}>
            <span>
              {t("globalSearch.resultCount", { count: results.length })}
            </span>{" "}
            <Select
              variant="borderless"
              aria-label={t("globalSearch.sort")}
              value={sort}
              onChange={(value) => {
                setSort(value);
                setIndex(0);
              }}
              style={{ minWidth: 110 }}
              options={["relevance", "recent"].map((value) => ({
                value,
                label: t(`globalSearch.${value}`),
              }))}
            />
          </div>
          <div
            id="global-search-results"
            role="listbox"
            aria-label={t("globalSearch.results")}
            className={styles.list}
            aria-busy={loading}
          >
            {results.map((result, i) => (
              <button
                type="button"
                role="option"
                aria-selected={active?.key === result.key}
                id={`global-search-result-${i}`}
                key={result.key}
                className={styles.result}
                onClick={() => setIndex(i)}
                onDoubleClick={() => openResult(result)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    openResult(result);
                  }
                }}
              >
                <span className={styles.resultIcon}>
                  <ResultIcon kind={result.kind} />
                </span>
                <span className={styles.resultContent}>
                  <strong
                    className={
                      result.kind === "message"
                        ? styles.messageTitle
                        : undefined
                    }
                  >
                    <Highlight text={result.title} query={trimmed} />
                  </strong>
                  {result.text && result.kind !== "message" && (
                    <p>
                      <Highlight
                        text={excerpt(result.text, trimmed)}
                        query={trimmed}
                      />
                    </p>
                  )}
                  <small>
                    {result.kind === "message"
                      ? `${t(`globalSearch.${result.role || "assistant"}`)} · ${
                          result.chatName
                        }`
                      : t(`globalSearch.${result.kind}`)}{" "}
                    · {result.timestamp.slice(0, 10)}
                    {result.archived
                      ? ` · ${t("globalSearch.isArchived")}`
                      : ""}
                  </small>
                </span>
                <ArrowUpRight
                  size={15}
                  className={styles.resultArrow}
                  aria-hidden="true"
                />
              </button>
            ))}
            {!results.length && (
              <div className={styles.empty}>
                {loading ? (
                  <Spin />
                ) : (
                  t(trimmed ? "globalSearch.empty" : "globalSearch.noRecent")
                )}
                {!loading && (days > 0 || kind !== "all") && (
                  <p>
                    <Button
                      onClick={() => {
                        setDays(0);
                        setKind("all");
                      }}
                    >
                      {t("globalSearch.reset")}
                    </Button>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        <aside
          className={styles.preview}
          aria-label={t("globalSearch.preview")}
        >
          {active ? (
            <>
              <div className={styles.previewTop}>
                <span className={styles.previewIcon}>
                  <ResultIcon kind={active.kind} size={15} />
                </span>
                <span>{t(`globalSearch.${active.kind}`)}</span>
              </div>
              <h3>
                {active.kind === "message" ? (
                  t(`globalSearch.${active.role || "assistant"}`)
                ) : (
                  <Highlight text={active.title} query={trimmed} />
                )}
              </h3>
              <div className={styles.previewMeta}>
                <CalendarDays size={13} aria-hidden="true" />
                {active.timestamp.slice(0, 10)}
                {active.archived && (
                  <span> · {t("globalSearch.isArchived")}</span>
                )}
              </div>
              <div className={styles.previewContent}>
                <p>
                  <Highlight
                    text={active.text || t("globalSearch.chatPreviewHint")}
                    query={active.text ? trimmed : ""}
                  />
                </p>
              </div>
              <div className={styles.source}>
                <CornerDownRight size={13} aria-hidden="true" />
                <span>
                  {agents.find((agent) => agent.id === active.agentId)?.name ||
                    active.agentId}{" "}
                  / {active.chatName}
                </span>
              </div>
              <div className={styles.previewAction}>
                <Button type="primary" onClick={() => openResult(active)}>
                  {t(
                    active.messageId
                      ? "globalSearch.locate"
                      : "globalSearch.open",
                  )}
                  <ArrowUpRight size={15} />
                </Button>
              </div>
            </>
          ) : (
            <p>{t("globalSearch.previewHint")}</p>
          )}
        </aside>
      </div>
      <div className={styles.status} role="status" aria-live="polite">
        {loading && <Spin size="small" />}
        <span>
          {t("globalSearch.progress", {
            count: results.length,
            scanned: snapshot.scanned,
            total: snapshot.total,
          })}
        </span>
        {snapshot.failed > 0 && (
          <span>{t("globalSearch.partial", { count: snapshot.failed })}</span>
        )}
        {snapshot.limited && <span>{t("globalSearch.limited")}</span>}
        {!loading &&
          snapshot.total > limit &&
          (trimmed || kind !== "all") &&
          kind !== "chat" && (
            <Button size="small" onClick={() => setLimit((v) => v + 100)}>
              {t("globalSearch.more")}
            </Button>
          )}
        {active && (
          <Button
            className={styles.mobileOpen}
            size="small"
            onClick={() => openResult(active)}
          >
            {t("globalSearch.open")}
          </Button>
        )}
      </div>
      <div className={styles.hint}>
        <span title={t("globalSearch.scope")}>
          {t("globalSearch.scopeShort")}
        </span>
        <span>{t("globalSearch.keys")}</span>
      </div>
    </Modal>
  );
}
