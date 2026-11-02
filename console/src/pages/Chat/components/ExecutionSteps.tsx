import { useId, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Check,
  ChevronRight,
  CircleAlert,
  CircleDashed,
  LoaderCircle,
  Square,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  AgentScopeRuntimeMessageType,
  type IAgentScopeRuntimeMessage,
} from "@agentscope-ai/chat";
import { useToolCallTurnEnded } from "@/components/Chat/ToolCards/shared/ToolCallTurnContext";
import {
  describeExecutionStep,
  type ExecutionStep,
} from "./executionStepModel";
import styles from "./ExecutionSteps.module.less";

function Step({
  step,
  open,
  onToggle,
  renderMessage,
  focus,
}: {
  step: ExecutionStep;
  open: boolean;
  onToggle: () => void;
  renderMessage: (message: IAgentScopeRuntimeMessage) => ReactNode;
  focus: boolean;
}) {
  const { t } = useTranslation();
  const detailId = useId();
  const buttonId = useId();
  const [showRecord, setShowRecord] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    if (focus) buttonRef.current?.focus({ preventScroll: true });
  }, [focus]);
  const { state, message, kind } = step;
  const Icon =
    state === "returned" || state === "ended"
      ? Check
      : state === "failed"
      ? CircleAlert
      : state === "interrupted"
      ? Square
      : state === "preparing"
      ? CircleDashed
      : LoaderCircle;
  const finished = state === "returned" || state === "ended";
  const label = step.labelKey ? t(step.labelKey) : step.toolName;
  const statusLabel = t(`chat.execution.${finished ? kind : state}`);
  return (
    <li className={styles.step} data-execution-state={state}>
      <span className={styles.marker} data-execution-chrome>
        <Icon aria-hidden="true" />
      </span>
      <button
        ref={buttonRef}
        type="button"
        id={buttonId}
        className={styles.stepHeader}
        aria-expanded={open}
        aria-controls={detailId}
        aria-label={`${label} ${statusLabel}`}
        onClick={onToggle}
      >
        <span className={styles.stepLabel} data-execution-chrome>
          {label}
        </span>
        <span className={styles.status} data-execution-chrome>
          {statusLabel}
        </span>
        <ChevronRight className={styles.stepChevron} aria-hidden="true" />
      </button>
      <div
        id={detailId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
      >
        {open && (
          <div className={styles.detail}>
            <p data-execution-chrome>{t(`chat.execution.${state}`)}</p>
            <details
              className={styles.rawRecord}
              open={showRecord}
              onToggle={(event) => setShowRecord(event.currentTarget.open)}
            >
              <summary>
                {t(
                  kind === "reasoning"
                    ? "chat.execution.viewThinking"
                    : "chat.execution.viewRecord",
                )}
              </summary>
              {/* Native cards retain plugin results, permission controls and file actions. */}
              {showRecord && (
                <div className={styles.recordBody}>
                  {renderMessage(message)}
                </div>
              )}
            </details>
          </div>
        )}
      </div>
    </li>
  );
}

export default function ExecutionSteps({
  messages,
  renderMessage,
  focusedStep = null,
}: {
  messages: IAgentScopeRuntimeMessage[];
  renderMessage: (message: IAgentScopeRuntimeMessage) => ReactNode;
  focusedStep?: string | null;
}) {
  const { t } = useTranslation();
  const turnEnded = useToolCallTurnEnded();
  const [selectedStep, setSelectedStep] = useState<string | null>(focusedStep);
  return (
    <ol className={styles.steps} aria-label={t("chat.execution.title")}>
      {messages.map((message) =>
        message.type === AgentScopeRuntimeMessageType.MESSAGE ? (
          <li key={message.id} className={styles.intermediateMessage}>
            {renderMessage(message)}
          </li>
        ) : (
          <Step
            key={message.id}
            step={describeExecutionStep(message, turnEnded)}
            open={selectedStep === message.id}
            onToggle={() =>
              setSelectedStep((current) =>
                current === message.id ? null : message.id,
              )
            }
            renderMessage={renderMessage}
            focus={focusedStep === message.id}
          />
        ),
      )}
    </ol>
  );
}
