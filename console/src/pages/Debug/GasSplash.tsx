import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Button } from "antd";
import { CheckOutlined, ExclamationOutlined } from "@ant-design/icons";
import { useTheme } from "../../contexts/ThemeContext";
import type { BackendReadyStatus } from "../../tauri/useBackendReadyPolling";
import styles from "./GasSplash.module.less";

const BRAND = "#0072f5";
const ERROR = "#ff4d4f";

interface SplashStage {
  key: string;
  label: string;
  weight: number;
}

/** 采气流程四环节（对应阶段化进度） */
const STAGES: SplashStage[] = [
  { key: "reserve", label: "确认储库储量", weight: 25 },
  { key: "well", label: "开启采气井口", weight: 25 },
  { key: "pipeline", label: "管线集输与净化", weight: 30 },
  { key: "network", label: "调压计量进入管网", weight: 20 },
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

export interface GasSplashProps {
  status: BackendReadyStatus;
  elapsed: number;
  totalSec: number;
  errorMessage?: string;
  onRetry?: () => void;
  onDone?: () => void;
}

/** 明暗主题配色 */
const PALETTE = {
  light: {
    sky: "#dcecff",
    ground: "#b7c4d8",
    soil: "#c9b391",
    caprock: "#8a7352",
    reservoir: "#e6d8b8",
    deep: "#a98d63",
    cavity: "#20303f",
    cavityStroke: "#3d5268",
    brine: "#2f8f9b",
    pipe: "#7d8ca3",
    gas: "#0072f5",
    gasSoft: "#4f9dff",
    wellhead: "#7d8ca3",
    plant: "#4b5a74",
    plantRoof: "#3a465e",
    lamp: "#ff9f43",
  },
  dark: {
    sky: "#141a30",
    ground: "#39405e",
    soil: "#3a3d32",
    caprock: "#4a4233",
    reservoir: "#57503c",
    deep: "#2c2a26",
    cavity: "#0e1620",
    cavityStroke: "#243748",
    brine: "#1f6f79",
    pipe: "#8a93b5",
    gas: "#5aa2ff",
    gasSoft: "#3d7fd6",
    wellhead: "#8a93b5",
    plant: "#aab6d2",
    plantRoof: "#8896bd",
    lamp: "#ffc069",
  },
};

type Palette = (typeof PALETTE)["light"];

/** 盐穴内储气气泡（x, y, 半径, 动画延迟秒） */
const BUBBLES = [
  { x: 108, y: 244, r: 4, d: 0 },
  { x: 132, y: 262, r: 5, d: 0.4 },
  { x: 156, y: 240, r: 3.5, d: 0.8 },
  { x: 178, y: 258, r: 4.5, d: 1.2 },
  { x: 196, y: 244, r: 3, d: 1.6 },
  { x: 118, y: 272, r: 3, d: 2 },
  { x: 166, y: 272, r: 3.5, d: 2.4 },
  { x: 142, y: 284, r: 4, d: 1 },
];

/**
 * 地下储气库采气流程剖面动画：
 * 盐穴储气 → 井筒采出 → 地面管线 → 处理厂净化 → 调压并网
 */
function GasArt({ c }: { c: Palette }) {
  return (
    <div className={styles.scene}>
      <svg viewBox="0 0 460 320" xmlns="http://www.w3.org/2000/svg">
        {/* 天空 */}
        <rect x="0" y="0" width="460" height="150" fill={c.sky} />

        {/* 地下地层剖面 */}
        <rect x="0" y="150" width="460" height="4" fill={c.ground} />
        <rect x="0" y="154" width="460" height="42" fill={c.soil} />
        <rect x="0" y="196" width="460" height="20" fill={c.caprock} />
        <rect x="0" y="216" width="460" height="84" fill={c.reservoir} />
        <rect x="0" y="300" width="460" height="20" fill={c.deep} />

        {/* 盐穴腔体 + 底部水垫 */}
        <ellipse
          cx="150"
          cy="258"
          rx="72"
          ry="36"
          fill={c.cavity}
          stroke={c.cavityStroke}
          strokeWidth="2"
        />
        <ellipse
          cx="150"
          cy="280"
          rx="54"
          ry="12"
          fill={c.brine}
          opacity="0.55"
        />

        {/* 储气气泡（缓慢浮动） */}
        {BUBBLES.map((b, i) => (
          <circle
            key={i}
            className={styles.bubble}
            cx={b.x}
            cy={b.y}
            r={b.r}
            fill={c.gas}
            opacity="0.6"
            style={{ animationDelay: `${b.d}s` }}
          />
        ))}

        {/* 井筒（套管）+ 井筒内气流 */}
        <rect x="146" y="156" width="12" height="76" rx="2" fill={c.pipe} />
        <line
          x1="146"
          y1="180"
          x2="158"
          y2="180"
          stroke={c.wellhead}
          strokeWidth="1.5"
          opacity="0.6"
        />
        <line
          x1="146"
          y1="206"
          x2="158"
          y2="206"
          stroke={c.wellhead}
          strokeWidth="1.5"
          opacity="0.6"
        />
        <line
          className={styles.gasWell}
          x1="152"
          y1="228"
          x2="152"
          y2="160"
          stroke={c.gas}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="10 6"
        />

        {/* 井口采气树 */}
        <g>
          <rect
            x="136"
            y="144"
            width="32"
            height="12"
            rx="2"
            fill={c.wellhead}
          />
          <rect x="150" y="118" width="8" height="38" fill={c.wellhead} />
          <rect x="146" y="126" width="16" height="12" rx="2" fill={c.pipe} />
          <circle cx="154" cy="132" r="3" fill={c.plantRoof} />
          <rect
            x="158"
            y="122"
            width="16"
            height="7"
            rx="2"
            fill={c.wellhead}
          />
          {/* 井口冒气脉冲 */}
          <circle
            className={styles.pulse}
            cx="154"
            cy="110"
            r="5"
            fill={c.gasSoft}
            style={{ animationDelay: "0.3s" }}
          />
        </g>

        {/* 地面管线（出站后向右输送） */}
        <line
          x1="174"
          y1="127"
          x2="316"
          y2="127"
          stroke={c.pipe}
          strokeWidth="8"
          strokeLinecap="round"
        />
        <line
          className={styles.gasPipe}
          x1="174"
          y1="127"
          x2="316"
          y2="127"
          stroke={c.gas}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="9 7"
        />
        <line
          x1="206"
          y1="135"
          x2="206"
          y2="156"
          stroke={c.pipe}
          strokeWidth="3"
        />
        <line
          x1="270"
          y1="135"
          x2="270"
          y2="156"
          stroke={c.pipe}
          strokeWidth="3"
        />

        {/* 处理厂（净化、调压） */}
        <g>
          <rect
            x="316"
            y="84"
            width="126"
            height="10"
            rx="4"
            fill={c.plantRoof}
          />
          <rect x="318" y="90" width="122" height="62" rx="6" fill={c.plant} />
          <rect x="332" y="66" width="14" height="26" fill={c.pipe} />
          <rect x="330" y="60" width="18" height="8" rx="2" fill={c.pipe} />
          <rect x="356" y="66" width="14" height="26" fill={c.pipe} />
          <rect x="354" y="60" width="18" height="8" rx="2" fill={c.pipe} />
          <circle
            className={styles.lamp}
            cx="330"
            cy="100"
            r="3.5"
            fill={c.lamp}
          />
          <circle
            className={styles.lamp}
            cx="408"
            cy="100"
            r="3.5"
            fill={c.lamp}
            style={{ animationDelay: "0.7s" }}
          />
          <line
            x1="330"
            y1="118"
            x2="420"
            y2="118"
            stroke={c.plantRoof}
            strokeWidth="2"
            opacity="0.5"
          />
          <line
            x1="330"
            y1="132"
            x2="420"
            y2="132"
            stroke={c.plantRoof}
            strokeWidth="2"
            opacity="0.5"
          />
        </g>

        {/* 并网输出（箭头 + 脉冲） */}
        <line
          x1="440"
          y1="127"
          x2="456"
          y2="127"
          stroke={c.pipe}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path d="M 456 119 L 456 135 L 468 127 Z" fill={c.gas} />
        <circle className={styles.pulse} cx="452" cy="127" r="6" fill={c.gas} />
        <circle
          className={styles.pulse}
          cx="458"
          cy="127"
          r="6"
          fill={c.gas}
          style={{ animationDelay: "0.6s" }}
        />
      </svg>
    </div>
  );
}

export default function GasSplash({
  status,
  elapsed,
  totalSec,
  errorMessage,
  onRetry,
  onDone,
}: GasSplashProps) {
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
    if (status === "error") return "采气流程中断（后端启动失败）";
    if (status === "timeout") return `采气超时（超过 ${totalSec}s）`;
    if (elapsed === 0) return "正在确认储库储量...";
    return `正在采气（${Math.round(ratio * 100)}%）...`;
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

        <GasArt c={c} />

        {isReady ? (
          <div className={styles.readyBox}>
            <span className={styles.readyCheck}>
              <CheckOutlined />
            </span>
            <span className={styles.readyText}>
              采气成功，正在进入主界面...
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
