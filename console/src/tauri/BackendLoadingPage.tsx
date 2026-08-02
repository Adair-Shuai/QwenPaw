import { Progress } from "antd";
import { type CSSProperties } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import styles from "./BackendLoadingPage.module.less";
import {
  type BackendReadyStatus,
  type StartupProgress,
} from "./useBackendReadyPolling";

const BRAND_COLOR = "#0072f5";
const ERROR_COLOR = "#ff4d4f";

interface BackendLoadingPageProps {
  status: BackendReadyStatus;
  elapsed: number;
  totalSec: number;
  errorMessage?: string;
  startup?: StartupProgress | null;
  onRetry?: () => void;
}

export default function BackendLoadingPage({
  status,
  elapsed,
  totalSec,
  errorMessage,
  startup,
  onRetry,
}: BackendLoadingPageProps) {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const hasFailed = status === "timeout" || status === "error";
  const failureText =
    status === "error"
      ? t("startup.error", "Backend failed to start.")
      : t("startup.timeout", {
          seconds: elapsed,
          defaultValue: "Backend failed to start within {{seconds}} seconds.",
        });
  const statusText = hasFailed
    ? startup?.message || failureText
    : startup?.message ||
      (status === "checking"
        ? elapsed === 0
          ? t("startup.starting", "Starting backend...")
          : t("startup.checking", "Connecting to backend...")
        : t("startup.timeout", {
            seconds: elapsed,
            defaultValue: "Backend failed to start within {{seconds}} seconds.",
          }));

  const percent = hasFailed
    ? Math.min(Math.round((elapsed / totalSec) * 100), 100)
    : startup?.progress ?? Math.min(Math.round((elapsed / totalSec) * 100), 95);
  const style = {
    "--qwenpaw-brand-color": BRAND_COLOR,
    "--qwenpaw-error-color": ERROR_COLOR,
  } as CSSProperties;

  return (
    <div
      className={`${styles.page} ${
        isDark ? styles.pageDark : styles.pageLight
      }`}
      style={style}
    >
      <div className={styles.card}>
        <img src="/qwenpaw.png" alt="UGSci" className={styles.logo} />

        <Progress
          type="dashboard"
          percent={percent}
          status={hasFailed ? "exception" : "active"}
          strokeColor={BRAND_COLOR}
          trailColor={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}
          gapPosition="bottom"
          format={() => (
            <div className={styles.progressLabel}>{`${percent}%`}</div>
          )}
          size={160}
          strokeWidth={8}
        />

        <p
          className={`${styles.statusText} ${
            hasFailed ? styles.failedText : ""
          }`}
        >
          {statusText}
        </p>

        {!hasFailed && (
          <div className={styles.progressMeta}>
            {startup?.first_run && (
              <span>{t("startup.firstRun", "首次启动正在准备完整资料")}</span>
            )}
            {startup?.current != null && startup?.total != null && (
              <span>{`${startup.current}/${startup.total}`}</span>
            )}
            <span>
              {t("startup.elapsed", {
                seconds: elapsed,
                defaultValue: "已用 {{seconds}} 秒",
              })}
            </span>
          </div>
        )}

        {!hasFailed && startup?.detail && (
          <p className={styles.detail}>{startup.detail}</p>
        )}

        {hasFailed && (
          <>
            <p className={styles.hint}>
              {status === "error"
                ? t(
                    "startup.errorHint",
                    "The backend process could not be launched. Check application logs for details.",
                  )
                : t(
                    "startup.timeoutHint",
                    "Backend failed to start. Please retry, or check application logs for details.",
                  )}
            </p>
            {errorMessage && (
              <details className={styles.details}>
                <summary className={styles.summary}>
                  {t("startup.errorDetails", "Show error details")}
                </summary>
                <pre className={styles.errorDetails}>{errorMessage}</pre>
              </details>
            )}
            <button
              className={styles.retryButton}
              onClick={onRetry}
              type="button"
            >
              {t("startup.retry", "Retry")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
