import React from "react";
import { RunValue } from "./RunInspector";
import type { LegacyAuthoringSession } from "./useLegacyAuthoringSession";
import type { WorkflowTranslate } from "./i18n";

export function LegacyAuthoringPanel({
  session,
  antd,
  t,
  selectedIds,
  hasNodes,
  onSelection,
  onLocate,
}: {
  session: LegacyAuthoringSession;
  antd: any;
  t: WorkflowTranslate;
  selectedIds: string[];
  hasNodes: boolean;
  onSelection: () => void;
  onLocate: (nodeId: string) => void;
}) {
  const { Button, Input, Tag, Alert, Drawer, Space, Tabs } = antd;
  const { proposal } = session;
  const canApply = !!proposal?.validation.ok && !session.stale && !session.busy;
  return (
    <Drawer
      title={
        session.repairSource
          ? t("AI 修复失败节点", "Repair failed node")
          : hasNodes
          ? t("用自然语言修改工作流")
          : t("用自然语言搭建工作流")
      }
      open={session.open}
      width={580}
      mask={false}
      closable={!session.busy}
      onClose={() => session.setOpen(false)}
      rootClassName="ff-ai-panel"
      footer={
        <Space wrap>
          <Button
            disabled={session.busy}
            onClick={() => session.setOpen(false)}
          >
            {t("取消")}
          </Button>
          {proposal && (
            <Button
              onClick={() => {
                session.setPreview(true);
                session.setOpen(false);
              }}
            >
              {t("查看画布", "View canvas")}
            </Button>
          )}
          {proposal && (
            <Button
              type="primary"
              aria-label={t("应用并保存")}
              loading={session.phase === "apply"}
              disabled={!canApply}
              onClick={session.apply}
            >
              {t("应用并保存")}
            </Button>
          )}
        </Space>
      }
    >
      <div
        className="ff-ai-scope"
        role="group"
        aria-label={t("AI 编辑范围", "AI editing scope")}
      >
        <Button
          aria-pressed={!session.selectionOnly}
          disabled={session.busy}
          onClick={() => session.setScope(false)}
        >
          {t("整个工作流", "Entire workflow")}
        </Button>
        <Button
          aria-pressed={session.selectionOnly}
          disabled={!selectedIds.length || session.busy}
          onClick={onSelection}
        >
          {t("当前选区 ({count})", "Current selection ({count})", {
            count: selectedIds.length,
          })}
        </Button>
        <Button type="text" disabled={session.busy} onClick={session.reset}>
          {t("新对话", "New conversation")}
        </Button>
      </div>
      {session.selectionOnly && (
        <div
          className="ff-ai-selection"
          aria-label={t("本次编辑的节点", "Nodes in this edit")}
        >
          {session.selectionNodes.map(({ id, label }) => (
            <Tag key={id} title={id}>
              {label}
            </Tag>
          ))}
        </div>
      )}
      {session.repairSource && (
        <section
          className="ff-ai-repair-source"
          aria-label={t("失败节点修复上下文", "Failure repair context")}
        >
          <strong>
            {t("失败运行", "Failed run")}{" "}
            <code>{session.repairSource.runId}</code>
          </strong>
          {proposal?.repair_context && (
            <details>
              <summary>
                {t(
                  "查看运行修订 {revision} 的错误与实际数据",
                  "View error and recorded data from revision {revision}",
                  {
                    revision:
                      proposal.repair_context.flow_revision ??
                      t("未记录", "Not recorded"),
                  },
                )}
              </summary>
              <h4>{t("节点错误", "Node error")}</h4>
              {proposal.repair_context.error != null ? (
                <RunValue value={proposal.repair_context.error} />
              ) : (
                <p>{t("未记录", "Not recorded")}</p>
              )}
              <h4>{t("运行时节点配置", "Node configuration at execution")}</h4>
              {proposal.repair_context.configuration_available ? (
                <RunValue value={proposal.repair_context.configuration} />
              ) : (
                <p>{t("未记录", "Not recorded")}</p>
              )}
              <h4>{t("实际输入", "Actual inputs")}</h4>
              {proposal.repair_context.inputs_available ? (
                <RunValue value={proposal.repair_context.inputs} />
              ) : (
                <p>{t("未记录", "Not recorded")}</p>
              )}
              <h4>{t("实际输出", "Actual outputs")}</h4>
              {proposal.repair_context.outputs_available ? (
                <RunValue value={proposal.repair_context.outputs} />
              ) : (
                <p>{t("未记录", "Not recorded")}</p>
              )}
              <details>
                <summary>{t("节点事件", "Node events")}</summary>
                <RunValue value={proposal.repair_context.events} />
              </details>
            </details>
          )}
        </section>
      )}
      {!!session.rounds.length && (
        <div
          className="ff-ai-turns"
          role="log"
          aria-label={t("AI 编辑对话", "AI editing conversation")}
        >
          {session.rounds.map((round, index) => (
            <article
              key={round.proposal.proposal_id}
              className={`ff-ai-turn ${
                index === session.roundIndex ? "ff-ai-turn-current" : ""
              }`}
            >
              <p>{round.prompt}</p>
              <div>
                <span>
                  {t("{count} 项变更", "{count} changes", {
                    count: round.proposal.changes.length,
                  })}
                </span>
                <Button
                  type="text"
                  size="small"
                  disabled={session.busy}
                  aria-pressed={index === session.roundIndex}
                  onClick={() => session.selectRound(index)}
                >
                  {t("查看第 {round} 轮方案", "View round {round}", {
                    round: index + 1,
                  })}
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
      <label className="ff-field-label" htmlFor="ff-prompt">
        {t("业务目标与修改要求")}
      </label>
      <Input.TextArea
        id="ff-prompt"
        value={session.prompt}
        disabled={session.busy}
        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
          session.setPrompt(event.target.value)
        }
        autoSize={{ minRows: 3, maxRows: 10 }}
        placeholder={
          session.rounds.length
            ? t("继续描述本轮需要调整的内容", "Describe the next change")
            : t(
                "例如：检查生产数据，并行计算库存和注采能力；异常转人工审核，通过后生成报告。失败重试 2 次。",
              )
        }
      />
      {!session.rounds.length && (
        <div className="ff-example-row">
          {[
            t("增加人工审核，通过后再继续"),
            t("失败重试 2 次，并设置超时"),
            t("独立分析并行执行后汇总"),
          ].map((example) => (
            <Button
              key={example}
              size="small"
              disabled={session.busy}
              onClick={() => session.setPrompt(example)}
            >
              {example}
            </Button>
          ))}
        </div>
      )}
      <Button
        className="ff-spaced"
        type="primary"
        aria-label={
          proposal ? t("继续修改", "Continue editing") : t("生成变更预览")
        }
        loading={session.phase === "generate"}
        disabled={!session.prompt.trim() || session.stale}
        onClick={session.generate}
      >
        {proposal ? t("继续修改", "Continue editing") : t("生成变更预览")}
      </Button>
      {session.error && (
        <Alert
          className="ff-spaced"
          type="error"
          message={t("方案未应用")}
          description={session.error}
        />
      )}
      {session.stale && (
        <Alert
          className="ff-spaced"
          type="warning"
          message={t(
            "草稿已变化，请开始新对话",
            "The draft changed. Start a new conversation.",
          )}
        />
      )}
      {proposal && (
        <div className="ff-spaced">
          {proposal.validation.ok ? (
            <Tag color="success">
              {t("结构验证通过", "Structure validated")}
            </Tag>
          ) : (
            <Alert
              type="error"
              message={t("方案未通过验证，不能应用")}
              description={
                <ul className="ff-errors">
                  {proposal.validation.errors.map((error, index) => (
                    <li key={index}>
                      {typeof error === "string"
                        ? error
                        : JSON.stringify(error)}
                    </li>
                  ))}
                </ul>
              }
            />
          )}
          {proposal.warnings?.map((warning, index) => (
            <Alert
              type="warning"
              key={index}
              message={warning}
              className="ff-spaced"
            />
          ))}
          {proposal.explanation && (
            <section
              className="ff-ai-repair-explanation"
              aria-label={t("修复说明", "Repair explanation")}
            >
              <p>{proposal.explanation}</p>
            </section>
          )}
          <Tabs
            items={[
              {
                key: "changes",
                label: t("变更明细 ({value0})", {
                  value0: proposal.changes.length,
                }),
                children: (
                  <div>
                    {proposal.changes.map((change, index) => (
                      <div className="ff-change" key={index}>
                        <Tag
                          color={
                            change.kind === "removed"
                              ? "red"
                              : change.kind === "added"
                              ? "green"
                              : "blue"
                          }
                        >
                          {t(
                            change.kind === "removed"
                              ? "删除"
                              : change.kind === "added"
                              ? "新增"
                              : "修改",
                            change.kind === "removed"
                              ? "Removed"
                              : change.kind === "added"
                              ? "Added"
                              : "Modified",
                          )}
                        </Tag>
                        <div>
                          {change.node_id ? (
                            <Button
                              type="link"
                              size="small"
                              onClick={() => onLocate(change.node_id!)}
                              aria-label={t(
                                "定位变更节点 {id}",
                                "Locate changed node {id}",
                                { id: change.node_id },
                              )}
                            >
                              {change.node_id}
                            </Button>
                          ) : (
                            <strong>{t("工作流")}</strong>
                          )}
                          <p>{change.description}</p>
                          {!!change.details?.length && (
                            <table className="ff-diff-table">
                              <thead>
                                <tr>
                                  <th>{t("参数")}</th>
                                  <th>{t("修改前")}</th>
                                  <th>{t("修改后")}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {change.details.map((detail, i) => (
                                  <tr key={i}>
                                    <td>{detail.path}</td>
                                    <td>
                                      {typeof detail.before === "string"
                                        ? detail.before
                                        : JSON.stringify(detail.before) ??
                                          t("未设置")}
                                    </td>
                                    <td>
                                      {typeof detail.after === "string"
                                        ? detail.after
                                        : JSON.stringify(detail.after) ??
                                          t("未设置")}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                key: "document",
                label: t("完整工作流"),
                children: (
                  <pre className="ff-code">
                    {JSON.stringify(proposal.flow, null, 2)}
                  </pre>
                ),
              },
            ]}
          />
        </div>
      )}
    </Drawer>
  );
}
