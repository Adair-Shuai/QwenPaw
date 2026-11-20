import React, { useEffect, useId, useRef, useState } from "react";
import { RunValue } from "./RunInspector";
import type { AuthoringSession, NodeReference } from "./useAuthoringSession";
import { ToolbarIcon } from "./ToolbarIcon";
import type { WorkflowTranslate } from "./i18n";
import { LegacyAuthoringPanel } from "./LegacyAuthoringPanel";

function NodeReferences({
  references,
  onLocate,
  onRemove,
  t,
}: {
  references: NodeReference[];
  onLocate: (id: string) => void;
  onRemove?: (id: string) => void;
  t: WorkflowTranslate;
}) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const collapsible = references.length > 2;
  const showAll = collapsible && expanded;
  const visible = collapsible && !showAll ? references.slice(0, 2) : references;
  if (!references.length) return null;
  return (
    <div
      className="ff-assistant-references"
      data-collapsible={collapsible}
      data-expanded={showAll}
      role="group"
      aria-label={
        onRemove
          ? t("消息引用", "Message references")
          : t("消息中的引用", "Sent references")
      }
    >
      <div id={listId} className="ff-assistant-reference-list">
        {visible.map((reference) => (
          <span className="ff-assistant-reference" key={reference.id}>
            <button
              type="button"
              title={reference.label}
              aria-label={t(
                "定位引用节点 {label}",
                "Locate referenced node {label}",
                { label: reference.label },
              )}
              onClick={() => onLocate(reference.id)}
            >
              <ToolbarIcon name="quote" />
              <span>{reference.label}</span>
            </button>
            {onRemove && (
              <button
                type="button"
                aria-label={t("移除引用 {label}", "Remove reference {label}", {
                  label: reference.label,
                })}
                onClick={() => onRemove(reference.id)}
              >
                <ToolbarIcon name="close" />
              </button>
            )}
          </span>
        ))}
      </div>
      {collapsible && (
        <button
          type="button"
          className="ff-assistant-reference-more"
          aria-expanded={showAll}
          aria-controls={listId}
          onClick={() => setExpanded(!showAll)}
        >
          {showAll
            ? t("收起引用", "Collapse references")
            : t("还有 {count} 个", "{count} more", {
                count: references.length - 2,
              })}
        </button>
      )}
    </div>
  );
}

export function AuthoringPanel({
  session,
  antd,
  t,
  selectedIds,
  hasNodes,
  onSelection,
  onLocate,
  onLocateReference,
}: {
  session: AuthoringSession;
  antd: any;
  t: WorkflowTranslate;
  selectedIds: string[];
  hasNodes: boolean;
  onSelection: () => void;
  onLocate: (id: string) => void;
  onLocateReference: (id: string) => void;
}) {
  const { Button, Input, Tag, Alert, Select } = antd;
  const [tab, setTab] = useState("chat");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [width, setWidth] = useState(400);
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<any>(null);
  const host = (window as any).QwenPaw?.host;
  const Markdown = host?.ReactMarkdown;
  const references = session.selectionOnly ? session.selectionNodes : [];
  useEffect(() => {
    if (session.open && tab === "experience") void session.refreshExperience();
  }, [tab, session.open]);
  useEffect(() => {
    log.current?.scrollTo?.({ top: log.current.scrollHeight });
  }, [session.chat?.id, session.chat?.messages.length]);
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
        <div className="ff-assistant-title">
          <ToolbarIcon name="ai" />
          <strong>{t("工作流助手", "Workflow assistant")}</strong>
        </div>
        <div className="ff-assistant-actions">
          <button
            type="button"
            className="ff-assistant-icon"
            title={t("收起助手", "Close assistant")}
            aria-label={t("收起助手", "Close assistant")}
            onClick={() => session.setOpen(false)}
          >
            <ToolbarIcon name="close" />
          </button>
        </div>
      </header>
      <nav
        className="ff-assistant-tabs"
        aria-label={t("助手内容", "Assistant content")}
      >
        <button
          type="button"
          aria-pressed={tab === "chat" && !historyOpen}
          onClick={() => {
            setTab("chat");
            setHistoryOpen(false);
          }}
        >
          {t("对话", "Chat")}
        </button>
        <button
          type="button"
          aria-pressed={tab === "experience" && !historyOpen}
          onClick={() => {
            setTab("experience");
            setHistoryOpen(false);
          }}
        >
          {t("经验", "Experience")}
        </button>
      </nav>
      {historyOpen ? (
        <div
          className="ff-assistant-log ff-assistant-history"
          aria-label={t("会话历史", "History")}
        >
          {session.phase === "load" && (
            <p role="status">{t("正在恢复会话…", "Restoring conversation…")}</p>
          )}
          {session.history.map((item) => (
            <Button
              key={item.id}
              type="text"
              aria-current={item.id === session.chat?.id ? "true" : undefined}
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
          {session.chat &&
            !session.chat.messages.length &&
            session.phase !== "load" && (
              <div className="ff-assistant-empty">
                <ToolbarIcon name="ai" />
                <h3>
                  {t("想调整哪一步？", "What would you like to work on?")}
                </h3>
                <div className="ff-assistant-suggestions">
                  {[
                    t("解释这个工作流", "Explain this workflow"),
                    t("检查潜在问题", "Check for potential issues"),
                  ].map((text) => (
                    <button
                      type="button"
                      key={text}
                      onClick={() => {
                        session.setPrompt(text);
                        input.current?.focus();
                      }}
                    >
                      {text}
                    </button>
                  ))}
                </div>
              </div>
            )}
          {session.chat?.messages.map((turn) => (
            <article key={turn.id} className="ff-assistant-turn">
              <div className="ff-assistant-user">
                <NodeReferences
                  references={
                    turn.references ||
                    (turn.proposal?.selected_node_ids || []).map((id) => ({
                      id,
                      label: turn.base_flow?.nodes[id]?.label || id,
                    }))
                  }
                  onLocate={onLocateReference}
                  t={t}
                />
                <p>{turn.prompt}</p>
              </div>
              {turn.reply && (
                <div className="ff-assistant-reply">
                  {Markdown ? (
                    <Markdown
                      remarkPlugins={host.remarkGfm ? [host.remarkGfm] : []}
                    >
                      {turn.reply}
                    </Markdown>
                  ) : (
                    <p className="ff-assistant-plain">{turn.reply}</p>
                  )}
                </div>
              )}
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
                          session.applying ||
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
          {(session.phase === "generate" || session.phase === "verify") && (
            <p role="status" className="ff-assistant-progress">
              <span aria-hidden="true" />
              {session.phase === "verify"
                ? t("正在验证修复…", "Verifying the repair…")
                : t(
                    "正在读取当前流程并生成答复…",
                    "Reading the current workflow…",
                  )}
            </p>
          )}
        </div>
      )}
      {session.error && <Alert type="error" message={session.error} closable />}
      <div className="ff-assistant-sessionbar">
        <div
          className="ff-assistant-session-tabs"
          role="tablist"
          aria-label={t("工作流会话", "Workflow conversations")}
        >
          {session.tabs.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-label={t("会话 {number}", "Conversation {number}", {
                number: item.number,
              })}
              aria-selected={item.active}
              aria-busy={item.busy}
              title={item.title}
              tabIndex={item.active ? 0 : -1}
              data-state={
                item.busy
                  ? "running"
                  : item.error
                  ? "error"
                  : item.unread
                  ? "ready"
                  : "idle"
              }
              onClick={() => {
                setTab("chat");
                setHistoryOpen(false);
                void session.load(item.id);
              }}
              onKeyDown={(event) => {
                let next = index;
                if (event.key === "ArrowRight")
                  next = (index + 1) % session.tabs.length;
                else if (event.key === "ArrowLeft")
                  next =
                    (index + session.tabs.length - 1) % session.tabs.length;
                else if (event.key === "Home") next = 0;
                else if (event.key === "End") next = session.tabs.length - 1;
                else return;
                event.preventDefault();
                setTab("chat");
                setHistoryOpen(false);
                void session.load(session.tabs[next].id);
                event.currentTarget.parentElement
                  ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
                  [next]?.focus();
              }}
            >
              {item.number}
              {(item.busy || item.unread || item.error) && (
                <span
                  aria-hidden="true"
                  className="ff-assistant-session-status"
                />
              )}
            </button>
          ))}
        </div>
        <div className="ff-assistant-actions">
          <button
            type="button"
            className="ff-assistant-icon"
            disabled={session.navigating}
            aria-label={t("新对话", "New conversation")}
            title={t("新对话", "New conversation")}
            onClick={() => {
              setTab("chat");
              setHistoryOpen(false);
              void session.reset();
            }}
          >
            <ToolbarIcon name="plus" />
          </button>
          <button
            type="button"
            className="ff-assistant-icon"
            aria-label={t("会话历史", "History")}
            title={t("会话历史", "History")}
            aria-expanded={historyOpen}
            onClick={() => {
              setTab("chat");
              setHistoryOpen(!historyOpen);
              void session.refreshHistory();
            }}
          >
            <ToolbarIcon name="history" />
          </button>
        </div>
      </div>
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
          <div className="ff-assistant-input">
            <NodeReferences
              key={session.chat?.id}
              references={references}
              onLocate={onLocateReference}
              onRemove={session.removeReference}
              t={t}
            />
            <Input.TextArea
              ref={input}
              id="ff-prompt"
              aria-label={t("消息", "Message")}
              disabled={session.phase === "load"}
              value={session.prompt}
              maxLength={20000}
              autoSize={{ minRows: 3, maxRows: 8 }}
              placeholder={
                references.length
                  ? t(
                      "对引用节点提问，或描述修改…",
                      "Ask about the referenced nodes or describe a change…",
                    )
                  : t(
                      "询问流程，或描述想做的修改…",
                      "Ask about the workflow or describe a change…",
                    )
              }
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
            <div className="ff-assistant-compose-tools">
              <Select
                aria-label={t("工作方式", "Mode")}
                value={session.mode}
                variant="borderless"
                size="small"
                onChange={session.setMode}
                options={[
                  { value: "auto", label: t("自动", "Auto") },
                  { value: "ask", label: t("仅讨论", "Discuss") },
                ]}
              />
              <button
                type="button"
                className="ff-assistant-attach"
                disabled={!selectedIds.length || session.phase === "load"}
                aria-label={t("引用当前选区", "Quote current selection")}
                title={t("引用当前选区", "Quote current selection")}
                onClick={() => {
                  onSelection();
                  input.current?.focus();
                }}
              >
                <ToolbarIcon name="quote" />
                <span>{t("引用选区", "Quote selection")}</span>
              </button>
              <Button
                className="ff-assistant-send"
                type="primary"
                aria-label={t("发送", "Send")}
                title={t("发送", "Send")}
                icon={<ToolbarIcon name="send" />}
                loading={session.busy}
                disabled={!session.prompt.trim() || session.busy}
                onClick={session.generate}
              />
            </div>
          </div>
        </footer>
      )}
    </aside>
  );
}
