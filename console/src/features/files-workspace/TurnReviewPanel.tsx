import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  turnFilesApi,
  TURN_FILES_UPDATED_EVENT,
  type SessionFilesScope,
  type TurnFileManifest,
} from "../../api/modules/turnFiles";
import { TurnFileDetails } from "./TurnFileSummary";
import styles from "./WorkbenchTabs.module.less";

export default function TurnReviewPanel({
  scope,
  active,
  reviewState,
  onReviewStateChange,
}: {
  scope: SessionFilesScope;
  active: boolean;
  reviewState?: { offset: number; turnId: string };
  onReviewStateChange?: (state: { offset: number; turnId: string }) => void;
}) {
  const { t } = useTranslation();
  const { agentId, sessionId, chatId } = scope;
  const archiveScope = useMemo(
    () => ({ kind: "session" as const, agentId, sessionId, chatId }),
    [agentId, sessionId, chatId],
  );
  const [turns, setTurns] = useState<TurnFileManifest[]>([]);
  const [selected, setSelected] = useState(reviewState?.turnId ?? "");
  const [offset, setOffset] = useState(reviewState?.offset ?? 0);
  const [more, setMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const refresh = () => setRevision((value) => value + 1);
    window.addEventListener(TURN_FILES_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(TURN_FILES_UPDATED_EVENT, refresh);
  }, []);
  useEffect(() => {
    if (!active) return;
    if (archiveScope.sessionId === "new" && !archiveScope.chatId) {
      setTurns([]);
      setSelected("");
      setMore(false);
      setError(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(false);
    void turnFilesApi
      .list(archiveScope, { offset, limit: 20, refresh: true })
      .then((result) => {
        if (cancelled) return;
        setTurns(result.turns);
        setMore(Boolean(result.has_more));
        setSelected((current) =>
          result.turns.some((turn) => turn.id === current)
            ? current
            : result.turns[0]?.id ?? "",
        );
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [archiveScope, active, offset, revision]);
  useEffect(() => {
    if (!loading && !error) onReviewStateChange?.({ offset, turnId: selected });
  }, [offset, selected, loading, error, onReviewStateChange]);
  if (!active) return null;
  const turn = turns.find((item) => item.id === selected);
  return (
    <section
      className={styles.review}
      aria-label={t("workbench.activity.review")}
    >
      <div className={styles.reviewToolbar}>
        <button
          type="button"
          onClick={() => setRevision((value) => value + 1)}
          disabled={loading}
        >
          {t("common.refresh")}
        </button>
        <button
          type="button"
          disabled={!offset || loading}
          onClick={() => setOffset((value) => Math.max(0, value - 20))}
        >
          {t("workbench.review.newer")}
        </button>
        <button
          type="button"
          disabled={!more || loading}
          onClick={() => setOffset((value) => value + 20)}
        >
          {t("workbench.review.older")}
        </button>
      </div>
      {loading ? (
        <p role="status">{t("common.loading")}</p>
      ) : error ? (
        <div role="alert">{t("workbench.review.loadFailed")}</div>
      ) : !turns.length ? (
        <p>{t("workbench.review.empty")}</p>
      ) : (
        <>
          <label>
            {t("workbench.review.turn")}
            <select
              aria-label={t("workbench.review.turn")}
              value={selected}
              onChange={(event) => setSelected(event.target.value)}
            >
              {turns.map((item) => (
                <option key={item.id} value={item.id}>
                  {new Date(item.started_at).toLocaleString()} ·{" "}
                  {item.files.length} {t("workbench.activityShort.files")}
                  {item.incomplete
                    ? ` · ${t("workbench.review.incomplete")}`
                    : ""}
                </option>
              ))}
            </select>
          </label>
          {turn && <TurnFileDetails key={turn.id} scope={scope} turn={turn} />}
        </>
      )}
    </section>
  );
}
