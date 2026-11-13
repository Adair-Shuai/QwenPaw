import React, { useEffect, useRef, useState } from "react";
import { RunValue } from "./RunInspector";
import type { AuthoringSession } from "./useAuthoringSession";
import type { WorkflowTranslate } from "./i18n";
import { LegacyAuthoringPanel } from "./LegacyAuthoringPanel";

export function AuthoringPanel({
  session,
  antd,
  t,
  selectedIds,
  hasNodes,
  onSelection,
  onLocate,
}: {
  session: AuthoringSession;
  antd: any;
  t: WorkflowTranslate;
  selectedIds: string[];
  hasNodes: boolean;
  onSelection: () => void;
  onLocate: (id: string) => void;
}) {
  const { Button, Input, Tag, Alert, Select } = antd;
  const [tab, setTab] = useState("chat");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [width, setWidth] = useState(400);
  const log = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (session.open && tab === "experience") void session.refreshExperience();
  }, [tab, session.open]);
  useEffect(() => {
    log.current?.scrollTo?.({ top: log.current.scrollHeight });
  }, [session.chat?.messages.length]);
  if (session.legacy)
    return (
      <LegacyAuthoringPanel
        session={session.legacy}
        antd={antd}
        t={t}
        selectedIds={selectedIds}
        hasNodes={hasNodes}
        onSelection={onSelection}
        onLocate={onLocate}
      />
    );
  if (!session.open) return null;
  const active = session.rounds[session.roundIndex];
  const proposal = session.proposal;
  return (
    <aside
      className="ff-assistant"
      aria-label={t("工作流助手", "Workflow assistant")}
      style={{ width }}
    >
      <div
        className="ff-assistant-resize"
        role="separator"
        aria-label={t("调整助手宽度", "Resize assistant")}
        aria-orientation="vertical"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") setWidth(Math.min(560, width + 20));
          if (event.key === "ArrowRight") setWidth(Math.max(320, width - 20));
        }}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            setWidth(
              Math.max(
                320,
                Math.min(
                  560,
                  event.currentTarget.parentElement!.getBoundingClientRect()
                    .right - event.clientX,
                ),
              ),
            );
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId);
        }}
      />
      <header className="ff-assistant-head">
        <strong>{t("工作流助手", "Workflow assistant")}</strong>
        <div className="ff-assistant-actions">
          <Button
            size="small"
            onClick={() => {
              setHistoryOpen(!historyOpen);
              void session.load(session.chat?.id);
            }}
          >
            {t("会话历史", "History")}
          </Button>
          <Button
            size="small"
            disabled={session.busy}
            onClick={() => {
              setHistoryOpen(false);
              void session.reset();
            }}
          >
            {t("新对话", "New conversation")}
          </Button>
          <Button
            size="small"
            aria-label={t("收起助手", "Close assistant")}
            onClick={() => session.setOpen(false)}
          >
            ×
          </Button>
        </div>
        <small>
          flowforge_assistant · {t("执行专家", "Execution expert")}{" "}
          {session.agentId}
        </small>
      </header>
      <nav
        className="ff-assistant-tabs"
        aria-label={t("助手内容", "Assistant content")}
      >
        <Button
          type="text"
          aria-pressed={tab === "chat"}
          onClick={() => setTab("chat")}
        >
          {t("对话", "Chat")}
        </Button>
        <Button
          type="text"
          aria-pressed={tab === "experience"}
          onClick={() => setTab("experience")}
        >
          {t("经验", "Experience")}
        </Button>
      </nav>
      {historyOpen ? (
        <div className="ff-assistant-log">
          {session.history.map((item) => (
            <Button
              key={item.id}
              block
              onClick={() => {
                setHistoryOpen(false);
                void session.load(item.id);
              }}
            >
              {item.title}
            </Button>
          ))}
        </div>
      ) : tab === "experience" ? (
        <div className="ff-assistant-log">
          {!session.experience.length && (
            <p>
              {t(
                "调试时发现的问题和尝试会保存在这里。",
                "Debugging observations and attempts appear here.",
              )}
            </p>
          )}
          {session.experience.map((record) => (
            <article className="ff-assistant-card" key={record.id}>
              <Tag>
                {record.status === "verified"
                  ? t("已验证", "Verified")
                  : record.status === "invalidated"
                  ? t("已失效", "Invalidated")
                  : t("待验证", "Unverified")}
              </Tag>
              <p>{record.summary}</p>
              <details>
                <summary>
                  {t("错误与验证记录", "Error and verification records")}
                </summary>
                <RunValue value={record.evidence} />
                {record.fixes?.map((fix) => (
                  <section key={fix.proposal_id}>
                    <p>{fix.summary}</p>
                    <RunValue value={fix.changes} />
                  </section>
                ))}
                {record.attempts.map((attempt) => (
                  <p key={attempt.run_id}>
                    r{attempt.revision} · {attempt.status} · {attempt.run_id}
                  </p>
                ))}
              </details>
              <details>
                <summary>{t("编辑经验", "Edit experience")}</summary>
                <Input.TextArea
                  defaultValue={record.summary}
                  onBlur={(event: React.FocusEvent<HTMLTextAreaElement>) => {
                    if (
                      event.target.value.trim() &&
                      event.target.value !== record.summary
                    )
                      void session.saveExperience(record, event.target.value);
                  }}
                />
                <Button
                  onClick={() =>
                    void session.saveExperience(record, record.summary, true)
                  }
                >
                  {t("标记失效", "Invalidate")}
                </Button>
              </details>
            </article>
          ))}
        </div>
      ) : (
        <div
          className="ff-assistant-log"
          ref={log}
          role="log"
          aria-label={t("AI 编辑对话", "AI editing conversation")}
        >
          {session.phase === "load" && (
            <p role="status">{t("正在恢复会话…", "Restoring conversation…")}</p>
          )}
          {session.chat?.messages.map((turn) => (
            <article key={turn.id} className="ff-assistant-turn">
              <p className="ff-assistant-user">{turn.prompt}</p>
              {turn.reply && <p className="ff-assistant-reply">{turn.reply}</p>}
              {turn.error && <Alert type="error" message={turn.error} />}
              {turn.status === "running" && (
                <p role="status">
                  {t(
                    "正在处理，可稍后从历史恢复",
                    "Processing. Reopen from history to refresh.",
                  )}
                </p>
              )}
              {turn.proposal && (
                <section className="ff-assistant-card">
                  <strong>
                    {t("{count} 项变更", "{count} changes", {
                      count: turn.proposal.changes.length,
                    })}
                  </strong>
                  {turn.applied && (
                    <Tag color="success">
                      {t("已应用", "Applied")} · r{turn.applied.revision}
                    </Tag>
                  )}
                  <details>
                    <summary>{t("查看具体修改", "View changes")}</summary>
                    {turn.proposal.changes.map((change, index) => (
                      <div className="ff-change" key={index}>
                        {change.node_id && (
                          <Button
                            type="link"
                            onClick={() => onLocate(change.node_id!)}
                          >
                            {change.node_id}
                          </Button>
                        )}
                        <p>{change.description}</p>
                        <RunValue value={change.details} />
                      </div>
                    ))}
                  </details>
                  {!turn.proposal.validation.ok && (
                    <Alert
                      type="error"
                      message={t("方案未通过验证，不能应用")}
                      description={turn.proposal.validation.errors.join("\n")}
                    />
                  )}
                  {turn.proposal.warnings?.map((warning, index) => (
                    <small key={index}>{warning}</small>
                  ))}
                  {turn.applied &&
                    turn.proposal.repair_context &&
                    !turn.verification && (
                      <details>
                        <summary>
                          {t("用本次输入验证", "Verify with recorded input")}
                        </summary>
                        <p>
                          {t(
                            "执行当前保存修订的节点，复用原运行的业务输入。",
                            "Execute the saved node with recorded business inputs.",
                          )}
                        </p>
                        <RunValue value={turn.proposal.repair_context.inputs} />
                        <Button
                          disabled={session.busy}
                          onClick={() => void session.verify(turn)}
                        >
                          {t("开始验证", "Start verification")}
                        </Button>
                      </details>
                    )}
                  {turn.verification && (
                    <p role="status">
                      {t("验证结果", "Verification")} · r
                      {turn.verification.revision} · {turn.verification.status}{" "}
                      <code>{turn.verification.run_id}</code>
                    </p>
                  )}
                  {!turn.applied && (
                    <div className="ff-assistant-actions">
                      <Button
                        disabled={session.busy}
                        onClick={() => {
                          const index = session.rounds.findIndex(
                            (round) => round.id === turn.id,
                          );
                          session.selectRound(index);
                        }}
                      >
                        {t("预览变更", "Preview changes")}
                      </Button>
                      <Button
                        type="primary"
                        disabled={
                          session.busy ||
                          active?.id !== turn.id ||
                          session.stale ||
                          !turn.proposal.validation.ok
                        }
                        onClick={session.apply}
                      >
                        {t("应用并保存")}
                      </Button>
                    </div>
                  )}
                </section>
              )}
            </article>
          ))}
          {session.phase === "generate" && (
            <p role="status">
              {t(
                "正在读取当前流程并生成答复…",
                "Reading the current workflow…",
              )}
            </p>
          )}
        </div>
      )}
      {session.error && <Alert type="error" message={session.error} closable />}
      {tab === "chat" && !historyOpen && (
        <footer className="ff-assistant-compose">
          {session.stale && proposal && !active?.applied && (
            <small>
              {t(
                "画布已有修改，继续发送要求可按最新草稿生成方案。",
                "The canvas changed. Send a message to update the proposal.",
              )}
            </small>
          )}
          <div className="ff-assistant-actions">
            <Button
              size="small"
              aria-pressed={!session.selectionOnly}
              onClick={() => session.setScope(false)}
            >
              {t("整个工作流", "Entire workflow")}
            </Button>
            <Button
              size="small"
              disabled={!selectedIds.length}
              aria-pressed={session.selectionOnly}
              onClick={onSelection}
            >
              {t("当前选区 ({count})", "Current selection ({count})", {
                count: selectedIds.length,
              })}
            </Button>
          </div>
          {session.selectionOnly && (
            <small>
              {session.selectionNodes.map((item) => item.label).join("、")}
            </small>
          )}
          <label htmlFor="ff-prompt">{t("消息", "Message")}</label>
          <Input.TextArea
            id="ff-prompt"
            disabled={session.phase === "load"}
            value={session.prompt}
            maxLength={20000}
            autoSize={{ minRows: 2, maxRows: 8 }}
            placeholder={t(
              "询问流程，或描述想做的修改…",
              "Ask about the workflow or describe a change…",
            )}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
              session.setPrompt(event.target.value)
            }
            onKeyDown={(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault();
                void session.generate();
              }
            }}
          />
          <div className="ff-assistant-actions">
            <Select
              aria-label={t("工作方式", "Mode")}
              value={session.mode}
              onChange={session.setMode}
              options={[
                { value: "auto", label: t("自动", "Auto") },
                { value: "ask", label: t("仅讨论", "Discuss") },
              ]}
            />
            <Button
              type="primary"
              aria-label={t("发送", "Send")}
              loading={session.busy}
              disabled={!session.prompt.trim() || session.busy}
              onClick={session.generate}
            >
              {t("发送", "Send")}
            </Button>
          </div>
        </footer>
      )}
    </aside>
  );
}
