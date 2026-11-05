import { useId, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Check,
  ChevronDown,
  CircleAlert,
  LoaderCircle,
  Square,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  AgentScopeRuntimeMessageType,
  type IAgentScopeRuntimeMessage,
} from "@agentscope-ai/chat";
import { useToolCallTurnEnded } from "@/components/Chat/ToolCards/shared/ToolCallTurnContext";
import type { CollapsedStepPresentation } from "../messageDisplay";
import ExecutionSteps from "./ExecutionSteps";
import { describeExecutionStep } from "./executionStepModel";
import styles from "./ExecutionSteps.module.less";

export default function ExecutionProcess({
  messages,
  status,
  defaultOpen,
  renderMessage,
}: {
  messages: IAgentScopeRuntimeMessage[];
  status: CollapsedStepPresentation["status"];
  defaultOpen: boolean;
  renderMessage: (message: IAgentScopeRuntimeMessage) => ReactNode;
}) {
  const { t } = useTranslation();
  const turnEnded = useToolCallTurnEnded();
  const [open, setOpen] = useState(defaultOpen);
  const [focusedStep, setFocusedStep] = useState<string | null>(null);
  const headerRef = useRef<HTMLButtonElement>(null);
  const anchor = useRef<{ top: number; scroller: HTMLElement } | null>(null);
  const panelId = useId();
  const headerId = useId();
  const steps = messages
    .filter((message) => message.type !== AgentScopeRuntimeMessageType.MESSAGE)
    .map((message) => describeExecutionStep(message, turnEnded));
  const failures = steps.filter((step) => step.state === "failed");
  const interrupted = steps.filter((step) => step.state === "interrupted");
  const completed = steps.filter((step) =>
    ["returned", "ended"].includes(step.state),
  ).length;
  const active = [...steps]
    .reverse()
    .find((step) => ["preparing", "running", "thinking"].includes(step.state));
  const activeLabel = active
    ? active.labelKey
      ? t(active.labelKey)
      : active.toolName
    : "";
  const title =
    status === "generating"
      ? activeLabel
        ? t("chat.execution.active", { action: activeLabel })
        : t("chat.execution.running")
      : status === "error"
      ? t("chat.execution.failed")
      : status === "interrupted"
      ? t("chat.execution.interrupted")
      : t("chat.execution.complete");
  const Icon =
    status === "generating"
      ? LoaderCircle
      : status === "error"
      ? CircleAlert
      : status === "interrupted"
      ? Square
      : Check;

  // SDK bubbles anchor to the bottom. Keep the clicked header in place when
  // lazily adding/removing the process instead of jumping through the thread.
  useLayoutEffect(() => {
    const pending = anchor.current;
    anchor.current = null;
    if (!pending || !headerRef.current) return;
    const delta = headerRef.current.getBoundingClientRect().top - pending.top;
    if (Math.abs(delta) > 0.5) pending.scroller.scrollTop += delta;
  }, [open]);

  const changeOpen = (next: boolean) => {
    const header = headerRef.current;
    const scroller = header?.closest<HTMLElement>(
      '[class*="chat-anywhere-message-list-bubble-scroll"]',
    );
    if (header && scroller) {
      anchor.current = { top: header.getBoundingClientRect().top, scroller };
    }
    setOpen(next);
  };
  const issue = failures[0] ?? interrupted[0];
  const countLabel = t(
    status === "generating"
      ? "chat.execution.completedCount"
      : "chat.execution.stepCount",
    { count: status === "generating" ? completed : steps.length },
  );

  return (
    <div className={styles.process} data-execution-process={status}>
      <button
        ref={headerRef}
        id={headerId}
        className={styles.summary}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`${title} ${countLabel}`}
        onClick={() => changeOpen(!open)}
      >
        <Icon className={styles.summaryIcon} aria-hidden="true" />
        <span className={styles.summaryTitle} data-execution-chrome>
          {title}
        </span>
        <span className={styles.meta} data-execution-chrome>
          {countLabel}
        </span>
        <ChevronDown className={styles.chevron} aria-hidden="true" />
      </button>
      {!open && issue && (
        <button
          type="button"
          className={styles.issue}
          onClick={() => {
            setFocusedStep(issue.message.id);
            changeOpen(true);
          }}
        >
          <CircleAlert aria-hidden="true" />
          {t(
            failures.length
              ? "chat.execution.failedCount"
              : "chat.execution.interruptedCount",
            { count: failures.length || interrupted.length },
          )}
        </button>
      )}
      <div id={panelId} role="region" aria-labelledby={headerId} hidden={!open}>
        {open && (
          <ExecutionSteps
            messages={messages}
            renderMessage={renderMessage}
            focusedStep={focusedStep}
          />
        )}
      </div>
    </div>
  );
}
