import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Button, Progress } from "antd";
import { CheckOutlined, ExclamationOutlined } from "@ant-design/icons";
import { useTheme } from "../../contexts/ThemeContext";
import type { BackendReadyStatus } from "../../tauri/useBackendReadyPolling";
import styles from "./OptimizedSplash.module.less";

const BRAND = "#0072f5";
const ERROR = "#ff4d4f";

interface SplashStage {
  key: string;
  label: string;
  weight: number;
}

/**
 * 启动流程按阶段拆解（权重决定进度占比）：
 * 阶段结束共 90%，剩余 10% 留给“启动完成”成功态。
 */
const STAGES: SplashStage[] = [
  { key: "proc", label: "启动后端进程", weight: 35 },
  { key: "runtime", label: "初始化运行时", weight: 20 },
  { key: "deps", label: "检查端口与依赖", weight: 20 },
  { key: "connect", label: "建立连接", weight: 15 },
];

/** 各阶段在时间比例上的边界（ratio = elapsed / totalSec） */
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

export interface OptimizedSplashProps {
  status: BackendReadyStatus;
  elapsed: number;
  totalSec: number;
  errorMessage?: string;
  onRetry?: () => void;
  /** 就绪态淡出完成后的回调（模拟“跳转到主界面”） */
  onDone?: () => void;
}

/**
 * 启动动画优化版（独立演示组件，未改动生产代码 BackendLoadingPage）
 *
 * 相比原版：
 * 1. 阶段化加权进度（缓动曲线），告别线性假进度
 * 2. 步骤列表显示当前卡在哪个阶段
 * 3. 就绪后绿色成功态 + 整体淡出过渡（避免跳转闪白）
 * 4. Logo 呼吸、渐变背景流动、进度环光晕
 * 5. 失败时标注卡住的阶段 + 错误详情
 * 6. 尊重 prefers-reduced-motion
 */
export default function OptimizedSplash({
  status,
  elapsed,
  totalSec,
  errorMessage,
  onRetry,
  onDone,
}: OptimizedSplashProps) {
  const { isDark } = useTheme();
  const [fading, setFading] = useState(false);

  // 注入组件作用域内的主题 CSS 变量（原组件通过 inline style 注入，此处独立自足）
  const themeVars = {
    "--qwenpaw-brand-color": BRAND,
    "--qwenpaw-error-color": ERROR,
  } as CSSProperties;

  const hasFailed = status === "timeout" || status === "error";
  const isReady = status === "ready";
  const ratio = totalSec > 0 ? Math.min(elapsed / totalSec, 1) : 0;

  const percent = useMemo(() => {
    if (isReady) return 100;
    return Math.round(stagedPercent(ratio));
  }, [isReady, ratio]);

  const stageIdx = useMemo(() => {
    if (hasFailed) return stageIndexFor(ratio);
    if (isReady) return STAGES.length;
    return stageIndexFor(ratio);
  }, [hasFailed, isReady, ratio]);

  // 就绪：先展示成功态，再整体淡出，最后触发 onDone
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
      } ${fading ? styles.fadeOut : ""}`}
      style={themeVars}
    >
      <div className={styles.card}>
        <img src="/qwenpaw.png" alt="QwenPaw" className={styles.logo} />

        <div className={styles.progressWrap}>
          <Progress
            type="dashboard"
            percent={percent}
            size={160}
            strokeWidth={8}
            strokeColor={hasFailed ? ERROR : BRAND}
            trailColor={isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)"}
            gapPosition="bottom"
            format={() =>
              hasFailed ? (
                <ExclamationOutlined style={{ fontSize: 26, color: ERROR }} />
              ) : (
                <span className={styles.progressLabel}>
                  {isReady ? "100%" : `${percent}%`}
                </span>
              )
            }
          />
        </div>

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
            <div
              className={`${styles.statusText} ${
                hasFailed ? styles.failedText : ""
              }`}
            >
              {mainText()}
            </div>

            {/* 阶段步骤列表 */}
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
