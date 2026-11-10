import React, {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useOverlayVisibility } from "@/contexts/OverlayVisibilityContext";
import { Popover } from "antd";
import { useTranslation } from "react-i18next";
import { Gauge } from "lucide-react";
import { formatCompact } from "../../../../utils/formatNumber";
import { cacheHitRate, formatPercent } from "../../../../utils/cacheUsage";
import { useTurnUsageStore } from "../../turnUsageStore";
import type { ContextUsage, TurnUsage } from "../../turnUsage";
import { ContextInspectorPanel } from "./ContextInspectorPanel";
import type { ContextInspectorProps } from "./types";
import styles from "./ContextUsageIndicator.module.less";

export type {
  ContextInspectorDetails,
  ContextInspectorProps,
  ContextInspectorSource,
} from "./types";

const DIAL_SIZE = 24;
const DIAL_CENTER = DIAL_SIZE / 2;
const CONTEXT_RADIUS = 10.5;
const CONTEXT_CIRCUMFERENCE = 2 * Math.PI * CONTEXT_RADIUS;

function contextRingColor(ratio: number): string {
  if (ratio >= 90) return "var(--app-error-text, #cf1322)";
  if (ratio >= 75) return "var(--app-warning-text, #d48806)";
  return "var(--app-text-secondary, #66756d)";
}

function cacheDialColors(rate: number | null): {
  fill: string;
  text: string;
} {
  if (rate === null || rate <= 0) {
    return {
      fill: "var(--app-surface-sunken, rgba(102, 117, 109, 0.10))",
      text: "var(--app-text-secondary, #7f8983)",
    };
  }
  return {
    fill: "var(--app-success-bg, rgba(39, 139, 89, 0.12))",
    text: "var(--app-success-text, #278b59)",
  };
}

function cacheDialText(rate: number | null): string {
  if (rate === null) return "–";
  if (rate >= 100) return "100";
  return `${Math.floor(Math.max(rate, 0))}`;
}

function cacheRateFromUsage(usage: TurnUsage | null): number | null {
  if (!usage?.session_cache_observed) return null;
  return (
    usage.session_cache_hit_rate ??
    cacheHitRate(
      usage.session_cache_read_tokens || 0,
      usage.session_cache_eligible_input_tokens || 0,
    )
  );
}

function FusionUsageDial({
  contextRate,
  cacheRate,
}: {
  contextRate: number;
  cacheRate: number | null;
}) {
  const context = Math.max(0, Math.min(contextRate, 100));
  const cacheColors = cacheDialColors(cacheRate);
  const cacheText = cacheDialText(cacheRate);
  return (
    <svg
      width={DIAL_SIZE}
      height={DIAL_SIZE}
      viewBox={`0 0 ${DIAL_SIZE} ${DIAL_SIZE}`}
      aria-hidden
    >
      <circle
        cx={DIAL_CENTER}
        cy={DIAL_CENTER}
        r={CONTEXT_RADIUS}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.14}
        strokeWidth={2}
      />
      <circle
        cx={DIAL_CENTER}
        cy={DIAL_CENTER}
        r={CONTEXT_RADIUS}
        fill="none"
        stroke={contextRingColor(context)}
        strokeWidth={2}
        strokeDasharray={`${CONTEXT_CIRCUMFERENCE} ${CONTEXT_CIRCUMFERENCE}`}
        strokeDashoffset={CONTEXT_CIRCUMFERENCE * (1 - context / 100)}
        strokeLinecap="round"
        transform={`rotate(-90 ${DIAL_CENTER} ${DIAL_CENTER})`}
      />
      <circle
        cx={DIAL_CENTER}
        cy={DIAL_CENTER}
        r={6.5}
        fill={cacheColors.fill}
      />
      <text
        x={DIAL_CENTER}
        y={DIAL_CENTER}
        dy="0.32em"
        fill={cacheColors.text}
        fontSize={cacheText.length > 2 ? 6.2 : 7.4}
        fontWeight={700}
        textAnchor="middle"
      >
        {cacheText}
      </text>
    </svg>
  );
}

function MetricRow({
  name,
  position,
  detail,
  value,
  valueColor,
}: {
  name: string;
  position: string;
  detail: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className={styles.metric}>
      <div>
        <div style={{ fontWeight: 600 }}>{name}</div>
        <div className={styles.metricDetail}>
          {position} · {detail}
        </div>
      </div>
      <div className={styles.metricValue} style={{ color: valueColor }}>
        {value}
      </div>
    </div>
  );
}

function UsageMetrics({
  usage,
  context,
}: {
  usage: TurnUsage | null;
  context: ContextUsage;
}) {
  const { t } = useTranslation();
  const contextRate = Math.max(
    0,
    Math.min(Number(context.context_usage_ratio) || 0, 100),
  );
  const cacheRate = cacheRateFromUsage(usage);
  return (
    <>
      {context.max_input_length ? (
        <>
          <MetricRow
            name={t("chat.turnUsagePopover.contextLabel")}
            position={t("chat.turnUsagePopover.outerRing")}
            detail={`${formatCompact(
              context.estimated_tokens,
            )} / ${formatCompact(context.max_input_length)}`}
            value={formatPercent(contextRate)}
            valueColor={contextRingColor(contextRate)}
          />
          <div
            className={styles.meter}
            role="progressbar"
            aria-label={t("chat.turnUsagePopover.contextLabel")}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={contextRate}
          >
            <div
              style={{
                width: `${contextRate}%`,
                background: contextRingColor(contextRate),
              }}
            />
          </div>
        </>
      ) : (
        <p className={styles.muted}>{t("chat.composer.contextUnavailable")}</p>
      )}
      <div className={styles.muted}>{t("chat.contextInspector.usageHint")}</div>
      <details className={styles.cacheDetails}>
        <summary>{t("chat.contextInspector.usageDetails")}</summary>
        <MetricRow
          name={t("chat.turnUsagePopover.cacheLabel")}
          position={t("chat.turnUsagePopover.centerValue")}
          detail={
            usage?.session_cache_observed
              ? t("chat.turnUsagePopover.cacheTokens", {
                  readTok: formatCompact(usage.session_cache_read_tokens || 0),
                  inputTok: formatCompact(
                    usage.session_cache_eligible_input_tokens || 0,
                  ),
                })
              : t("chat.turnUsagePopover.cacheNotReported")
          }
          value={formatPercent(cacheRate)}
          valueColor={
            cacheRate !== null && cacheRate > 0
              ? "var(--app-success-text, #278b59)"
              : undefined
          }
        />
      </details>
    </>
  );
}

const ContextUsageIndicator: React.FC<
  ContextInspectorProps & {
    onCompact: () => void;
    onNew: () => void;
    showValue?: boolean;
  }
> = ({ onCompact, onNew, showValue = false, ...inspector }) => {
  const { t } = useTranslation();
  const snapshot = useTurnUsageStore((state) => state.snapshot);
  const [open, setOpen] = useState(false);
  const [availableHeight, setAvailableHeight] = useState<number>();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inspectRef = useRef(inspector.onInspect);
  inspectRef.current = inspector.onInspect;
  const openChangeRef = useRef(inspector.onOpenChange);
  openChangeRef.current = inspector.onOpenChange;
  const dialogId = useId();
  const overlayVisible = useOverlayVisibility();
  useEffect(() => {
    if (!overlayVisible) setOpen(false);
  }, [overlayVisible]);
  useEffect(() => {
    setOpen(false);
  }, [inspector.scopeKey]);
  useLayoutEffect(() => {
    if (!open) return;
    const measure = () => {
      const bounds = triggerRef.current?.getBoundingClientRect();
      if (!bounds) return;
      const viewport = window.visualViewport;
      const height = viewport?.height ?? window.innerHeight;
      const top = viewport?.offsetTop ?? 0;
      const above = Math.max(0, Math.min(height, bounds.top - top));
      const below = Math.max(0, Math.min(height, top + height - bounds.bottom));
      setAvailableHeight(Math.max(0, Math.max(above, below) - 24));
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    window.visualViewport?.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("scroll", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
      window.visualViewport?.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("scroll", measure);
    };
  }, [open]);
  useEffect(() => {
    openChangeRef.current?.(open);
    if (!open) return;
    inspectRef.current?.();
    const frame = requestAnimationFrame(() => dialogRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);
  const closeAndFocus = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const activeMax = useTurnUsageStore((state) => state.activeMaxInputLength);
  const maxInputLength = activeMax ?? snapshot?.context_usage?.max_input_length;
  if (!maxInputLength && !showValue) return null;
  const estimatedTokens = snapshot?.context_usage?.estimated_tokens ?? 0;
  const context = {
    estimated_tokens: estimatedTokens,
    max_input_length: maxInputLength ?? 0,
    context_usage_ratio: Math.min(
      100,
      maxInputLength ? (estimatedTokens / maxInputLength) * 100 : 0,
    ),
  };

  const contextRate = Math.max(
    0,
    Math.min(Number(context.context_usage_ratio) || 0, 100),
  );
  const cacheRate = cacheRateFromUsage(snapshot?.usage ?? null);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger="click"
      placement="top"
      autoAdjustOverflow
      destroyOnHidden
      overlayClassName={styles.popover}
      content={
        <div
          ref={dialogRef}
          id={dialogId}
          className={styles.dialog}
          style={
            availableHeight !== undefined
              ? ({
                  "--context-panel-max-height": `${availableHeight}px`,
                } as React.CSSProperties)
              : undefined
          }
          role="dialog"
          aria-label={t("chat.contextInspector.title")}
          tabIndex={-1}
          onKeyDown={(event) => {
            if (event.key !== "Escape" || event.nativeEvent.isComposing) return;
            event.preventDefault();
            event.stopPropagation();
            closeAndFocus();
          }}
        >
          <ContextInspectorPanel
            key={inspector.scopeKey}
            {...inspector}
            metrics={
              <UsageMetrics usage={snapshot?.usage ?? null} context={context} />
            }
            onClose={closeAndFocus}
            onCompact={() => {
              closeAndFocus();
              onCompact();
            }}
            onNew={() => {
              closeAndFocus();
              onNew();
            }}
          />
        </div>
      }
    >
      <button
        type="button"
        ref={triggerRef}
        className={styles.trigger}
        data-show-value={showValue}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
        aria-label={
          !maxInputLength
            ? t("chat.composer.contextUnavailable")
            : t("chat.turnUsagePopover.ariaLabel", {
                contextRate: formatPercent(contextRate),
                cacheRate: formatPercent(cacheRate),
              })
        }
      >
        {maxInputLength ? (
          <FusionUsageDial contextRate={contextRate} cacheRate={cacheRate} />
        ) : (
          <Gauge size={16} strokeWidth={1.6} />
        )}
        {showValue && (
          <span>{maxInputLength ? formatPercent(contextRate) : "—"}</span>
        )}
      </button>
    </Popover>
  );
};

export default ContextUsageIndicator;
