import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Button } from "antd";
import { CheckOutlined, ExclamationOutlined } from "@ant-design/icons";
import { useTheme } from "../../contexts/ThemeContext";
import type { BackendReadyStatus } from "../../tauri/useBackendReadyPolling";
import styles from "./PumpjackSplash.module.less";

const BRAND = "#0072f5";
const ERROR = "#ff4d4f";

interface SplashStage {
  key: string;
  label: string;
  weight: number;
}

const STAGES: SplashStage[] = [
  { key: "proc", label: "启动后端进程", weight: 35 },
  { key: "runtime", label: "初始化运行时", weight: 20 },
  { key: "deps", label: "检查端口与依赖", weight: 20 },
  { key: "connect", label: "建立连接", weight: 15 },
];

const STAGE_BOUNDS = [0, 0.15, 0.4, 0.7, 1.0];

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

function stageIndexFor(ratio: number): number {
  for (let i = 0; i < STAGES.length; i += 1) {
    if (ratio < STAGE_BOUNDS[i + 1]) return i;
  }
  return STAGES.length - 1;
}

/** 阶段化加权进度（0-90），就绪时由调用方置为 100 */
function stagedPercent(ratio: number): number {
  if (ratio >= 1) return 90;
  const idx = stageIndexFor(ratio);
  const base = STAGES.slice(0, idx).reduce((s, st) => s + st.weight, 0);
  const span = STAGE_BOUNDS[idx + 1] - STAGE_BOUNDS[idx];
  const local = span === 0 ? 0 : (ratio - STAGE_BOUNDS[idx]) / span;
  return base + STAGES[idx].weight * easeOutCubic(local);
}

export interface PumpjackSplashProps {
  status: BackendReadyStatus;
  elapsed: number;
  totalSec: number;
  errorMessage?: string;
  onRetry?: () => void;
  onDone?: () => void;
}

const PALETTE = {
  light: {
    ground: "#c9d6e6",
    wellhead: "#7d8ca3",
    beam: "#4b5a74",
    horse: "#4b5a74",
    pivot: "#2f3b52",
    counterweight: "#5c6c88",
    crankDisc: "#e8eef6",
    crankStroke: "#8fa0ba",
    crankWeight: "#5c6c88",
    pitman: "#6b7b96",
    rod: "#39465f",
    bubble: "#4f9dff",
  },
  dark: {
    ground: "#232a44",
    wellhead: "#8a93b5",
    beam: "#aab6d2",
    horse: "#aab6d2",
    pivot: "#7d88ab",
    counterweight: "#8f9abd",
    crankDisc: "#2a3150",
    crankStroke: "#5c6a90",
    crankWeight: "#6e7ca5",
    pitman: "#8f9abd",
    rod: "#c3cce4",
    bubble: "#5aa2ff",
  },
};

type Palette = (typeof PALETTE)["light"];

function PumpjackArt({ c }: { c: Palette }) {
  return (
    <div className={styles.pumpjack}>
      <svg viewBox="0 0 460 320" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="298" width="460" height="22" fill={c.ground} />
        <ellipse
          cx="150"
          cy="298"
          rx="36"
          ry="5"
          fill={c.wellhead}
          opacity="0.35"
        />
        {/* 井口采油树 */}
        <g>
          <rect
            x="126"
            y="290"
            width="48"
            height="8"
            rx="2"
            fill={c.wellhead}
          />
          <line
            x1="136"
            y1="290"
            x2="138"
            y2="254"
            stroke={c.wellhead}
            strokeWidth="5"
          />
          <line
            x1="164"
            y1="290"
            x2="162"
            y2="254"
            stroke={c.wellhead}
            strokeWidth="5"
          />
          <line
            x1="138"
            y1="268"
            x2="162"
            y2="266"
            stroke={c.wellhead}
            strokeWidth="4"
          />
          <rect
            x="140"
            y="246"
            width="20"
            height="8"
            rx="2"
            fill={c.wellhead}
          />
          <rect x="146" y="254" width="8" height="40" fill={c.wellhead} />
        </g>
        {/* 油花上涌 */}
        <g>
          <circle
            className={styles.oilBubble}
            cx="150"
            cy="242"
            r="4"
            fill={c.bubble}
            opacity="0"
          />
          <circle
            className={styles.oilBubble}
            cx="158"
            cy="240"
            r="3"
            fill={c.bubble}
            opacity="0"
            style={{ animationDelay: "0.8s" }}
          />
          <circle
            className={styles.oilBubble}
            cx="143"
            cy="238"
            r="2.5"
            fill={c.bubble}
            opacity="0"
            style={{ animationDelay: "1.6s" }}
          />
        </g>
        {/* 抽油杆（垂直往复） */}
        <g className={styles.rod}>
          <rect x="142" y="174" width="16" height="10" rx="2" fill={c.rod} />
          <line
            x1="150"
            y1="184"
            x2="150"
            y2="300"
            stroke={c.rod}
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>
        {/* 游梁总成（摆动）：驴头 + 游梁 + 配重 */}
        <g className={styles.beam}>
          <path
            d="M 68 152 A 42 42 0 0 1 118 170 A 44 44 0 0 0 70 157 Z"
            fill={c.horse}
          />
          <rect x="70" y="154" width="335" height="12" rx="6" fill={c.beam} />
          <circle cx="300" cy="160" r="8" fill={c.pivot} />
          <circle cx="300" cy="160" r="3.5" fill={c.crankDisc} />
          <circle cx="405" cy="160" r="7" fill={c.pivot} />
          <rect
            x="363"
            y="168"
            width="42"
            height="40"
            rx="3"
            fill={c.counterweight}
          />
          <line
            x1="384"
            y1="170"
            x2="384"
            y2="206"
            stroke={c.pivot}
            strokeWidth="2"
          />
        </g>
        {/* 连杆 */}
        <g className={styles.pitman}>
          <line
            x1="390"
            y1="204"
            x2="404"
            y2="252"
            stroke={c.pitman}
            strokeWidth="6"
            strokeLinecap="round"
          />
          <circle cx="390" cy="204" r="7" fill={c.pivot} />
        </g>
        {/* 曲柄（匀速旋转） */}
        <g className={styles.crank}>
          <g transform="translate(392 250)">
            <circle
              r="28"
              fill={c.crankDisc}
              stroke={c.crankStroke}
              strokeWidth="2.5"
            />
            <path
              d="M -28 0 A 28 28 0 0 1 28 0 L 16 10 A 20 20 0 0 0 -16 10 Z"
              fill={c.crankWeight}
            />
            <line
              x1="-14"
              y1="0"
              x2="14"
              y2="0"
              stroke={c.crankStroke}
              strokeWidth="2"
            />
            <circle r="7" fill={c.pivot} />
            <circle cx="24" cy="0" r="5" fill={c.pivot} />
            <circle cx="24" cy="0" r="2" fill={c.crankDisc} />
          </g>
        </g>
      </svg>
    </div>
  );
}

export default function PumpjackSplash({
  status,
  elapsed,
  totalSec,
  errorMessage,
  onRetry,
  onDone,
}: PumpjackSplashProps) {
  const { isDark } = useTheme();
  const [fading, setFading] = useState(false);
  const c = PALETTE[isDark ? "dark" : "light"];

  const themeVars = {
    "--qwenpaw-brand-color": BRAND,
    "--qwenpaw-error-color": ERROR,
  } as CSSProperties;

  const hasFailed = status === "timeout" || status === "error";
  const isReady = status === "ready";
  const ratio = totalSec > 0 ? Math.min(elapsed / totalSec, 1) : 0;

  const percent = useMemo(
    () => (isReady ? 100 : Math.round(stagedPercent(ratio))),
    [isReady, ratio],
  );

  const stageIdx = useMemo(() => {
    if (hasFailed) return stageIndexFor(ratio);
    if (isReady) return STAGES.length;
    return stageIndexFor(ratio);
  }, [hasFailed, isReady, ratio]);

  useEffect(() => {
    if (!isReady) {
      setFading(false);
      return undefined;
    }
    const t1 = window.setTimeout(() => setFading(true), 700);
    const t2 = window.setTimeout(() => onDone?.(), 1400);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [isReady, onDone]);

  const mainText = () => {
    if (isReady) return "";
    if (status === "error") return "后端服务启动失败";
    if (status === "timeout") return `启动超时（超过 ${totalSec}s）`;
    if (elapsed === 0) return "正在启动后端服务...";
    return `正在建立连接（${Math.round(ratio * 100)}%）...`;
  };

  return (
    <div
      className={`${styles.page} ${
        isDark ? styles.pageDark : styles.pageLight
      } ${fading ? styles.fadeOut : ""} ${isReady ? styles.ready : ""}`}
      style={themeVars}
    >
      <div className={styles.card}>
        <img src="/qwenpaw.png" alt="QwenPaw" className={styles.logo} />

        <PumpjackArt c={c} />

        {isReady ? (
          <div className={styles.readyBox}>
            <span className={styles.readyCheck}>
              <CheckOutlined />
            </span>
            <span className={styles.readyText}>
              启动完成，正在进入主界面...
            </span>
          </div>
        ) : (
          <>
            <div className={styles.progressMeta}>
              <span
                className={styles.percentLabel}
                style={hasFailed ? { color: ERROR } : undefined}
              >
                {hasFailed ? (
                  <ExclamationOutlined style={{ fontSize: 20 }} />
                ) : (
                  `${percent}%`
                )}
              </span>
              <span className={styles.elapsedLabel}>
                {elapsed}s / {totalSec}s
              </span>
            </div>

            <div
              className={`${styles.statusText} ${
                hasFailed ? styles.failedText : ""
              }`}
            >
              {mainText()}
            </div>

            <div className={styles.steps}>
              {STAGES.map((stage, i) => {
                const done = stageIdx > i || isReady;
                const active = stageIdx === i && !hasFailed;
                const failed = stageIdx === i && hasFailed;
                return (
                  <div
                    key={stage.key}
                    className={`${styles.step} ${
                      done
                        ? styles.stepDone
                        : active
                        ? styles.stepActive
                        : failed
                        ? styles.stepFailed
                        : ""
                    }`}
                  >
                    <span
                      className={`${styles.stepDot} ${
                        done
                          ? styles.stepDotDone
                          : active
                          ? styles.stepDotActive
                          : failed
                          ? styles.stepDotFailed
                          : styles.stepDotPending
                      }`}
                    >
                      {done ? <CheckOutlined /> : failed ? "!" : ""}
                    </span>
                    {stage.label}
                  </div>
                );
              })}
            </div>

            {hasFailed ? (
              <>
                <details className={styles.details}>
                  <summary className={styles.summary}>查看错误详情</summary>
                  <pre className={styles.errorDetails}>
                    {errorMessage || "（无错误信息）"}
                  </pre>
                </details>
                <Button
                  type="primary"
                  size="large"
                  onClick={onRetry}
                  style={{ background: BRAND, borderColor: BRAND }}
                >
                  重试
                </Button>
              </>
            ) : (
              <p className={styles.hint}>首次启动可能需要几十秒，请稍候</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
