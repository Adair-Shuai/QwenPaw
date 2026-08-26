import { useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock3,
  ExternalLink,
  GitBranch,
  Layers3,
  LoaderCircle,
  Network,
  RotateCcw,
  ScrollText,
} from "lucide-react";
import BackgroundTaskPanel from "../../pages/Chat/components/BackgroundTaskPanel";
import {
  selectTasksForSession,
  useBackgroundTasksStore,
  type BackgroundTask,
} from "../../stores/backgroundTasksStore";
import {
  buildCollaborationStages,
  buildAgentTimeline,
  deriveAgentCollaboration,
  type CollaborationKind,
  type CollaborationNode,
  type CollaborationRelation,
  type TimelinePlacement,
} from "./agentCollaboration";
import styles from "./FilesWorkspace.module.less";

type AgentView = "flow" | "timeline" | "logs";

interface AgentCollaborationPanelProps {
  sessionId: string;
  emptyState: ReactNode;
}

const KIND_LABELS: Record<CollaborationKind, string> = {
  direct: "直接协作",
  delegation: "任务分派",
  parallel: "并行协作",
  supervisor: "主管协调",
  handoff: "任务移交",
  retry: "失败重试",
};

const RELATION_LABELS: Record<CollaborationRelation, string> = {
  dispatch: "已分派",
  sequence: "顺序执行",
  parallel: "并行分支",
  dependency: "依赖前序",
  handoff: "执行权移交",
  retry: "失败重试",
};

function statusLabel(task: BackgroundTask): string {
  if (task.status === "running") return "运行中";
  if (task.status === "done") return "已完成";
  if (task.status === "cancelled") return "已取消";
  return "执行失败";
}

function durationLabel(task: BackgroundTask): string {
  const seconds = Math.max(
    0,
    Math.floor(((task.endTime ?? Date.now()) - task.startTime) / 1000),
  );
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

function taskDescription(task: BackgroundTask): string {
  return (
    task.taskSummary ||
    task.liveOutput.replace(/^任务[：:]\s*/, "").trim() ||
    "正在执行智能体任务"
  );
}

function resultSummary(task: BackgroundTask): string {
  const result = task.result || task.liveOutput;
  if (!result) return "暂无输出";
  return result
    .replace(/\[(?:SESSION|TASK_ID|STATUS):[^\]]+\]/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

function taskOutput(task: BackgroundTask): string {
  const result = task.result || task.liveOutput;
  if (!result) return "暂无输出";
  return result
    .replace(/\[(?:SESSION|TASK_ID|STATUS):[^\]]+\]/gi, "")
    .trim()
    .slice(0, 1200);
}

function elapsedLabel(milliseconds: number): string {
  const seconds = Math.max(0, Math.round(milliseconds / 1000));
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

function clockLabel(timestamp: number | null): string | null {
  if (!timestamp) return null;
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function predecessorLabel(
  node: CollaborationNode,
  nodes: CollaborationNode[],
): string | null {
  const explicitIds = node.task.dependsOn?.length
    ? node.task.dependsOn
    : node.task.retryOf
    ? [node.task.retryOf]
    : [];
  const explicit = explicitIds
    .map((id) => nodes.find((candidate) => candidate.task.toolCallId === id))
    .filter(Boolean)
    .map((candidate) => candidate?.task.agentId || candidate?.task.toolName);
  if (explicit.length) return explicit.join("、");
  const index = nodes.findIndex(
    (candidate) => candidate.task.toolCallId === node.task.toolCallId,
  );
  if (node.relation === "sequence" && index > 0) {
    return nodes[index - 1].task.agentId || nodes[index - 1].task.toolName;
  }
  return null;
}

function AgentStatusIcon({ task }: { task: BackgroundTask }) {
  if (task.status === "running") {
    return <LoaderCircle className={styles.agentSpin} size={14} />;
  }
  if (task.status === "done") return <CheckCircle2 size={14} />;
  if (task.status === "error") return <AlertCircle size={14} />;
  return <Clock3 size={14} />;
}

function FlowNode({
  node,
  selected,
  onSelect,
}: {
  node: CollaborationNode;
  selected: boolean;
  onSelect: () => void;
}) {
  const { task, relation, relationInferred } = node;
  return (
    <div
      className={styles.agentFlowNode}
      data-status={task.status}
      data-relation={relation}
      data-inferred={relationInferred || undefined}
    >
      <span className={styles.agentFlowConnector} aria-hidden />
      <span className={styles.agentNodeIcon}>
        {relation === "retry" ? <RotateCcw size={15} /> : <Bot size={15} />}
      </span>
      <button
        type="button"
        className={styles.agentNodeCard}
        aria-pressed={selected}
        onClick={onSelect}
      >
        <div className={styles.agentNodeHeading}>
          <strong>{task.agentId || task.toolName}</strong>
          <span className={styles.agentNodeStatus} data-status={task.status}>
            <AgentStatusIcon task={task} />
            {statusLabel(task)}
          </span>
        </div>
        <p>{taskDescription(task)}</p>
        <div className={styles.agentNodeMeta}>
          <span className={styles.agentRelationTag} data-relation={relation}>
            {RELATION_LABELS[relation]}
            {relationInferred ? " · 推测" : ""}
          </span>
          <span>{durationLabel(task)}</span>
        </div>
        {task.status === "error" && (
          <div className={styles.agentNodeResult} data-status="error">
            {resultSummary(task)}
          </div>
        )}
      </button>
    </div>
  );
}

function AgentTaskDetail({
  node,
  nodes,
  timing,
}: {
  node: CollaborationNode;
  nodes: CollaborationNode[];
  timing?: TimelinePlacement;
}) {
  const { task, relation, relationInferred } = node;
  const predecessor = predecessorLabel(node, nodes);
  const startLabel = clockLabel(timing?.startAt ?? null);
  const endLabel = clockLabel(timing?.endAt ?? null);
  return (
    <section
      className={styles.agentTaskDetail}
      aria-label="选中的智能体任务详情"
    >
      <div className={styles.agentTaskDetailHeading}>
        <div>
          <span className={styles.agentTaskDetailEyebrow}>当前任务</span>
          <strong>{task.agentId || task.toolName}</strong>
        </div>
        <span className={styles.agentNodeStatus} data-status={task.status}>
          <AgentStatusIcon task={task} />
          {statusLabel(task)}
        </span>
      </div>
      <p className={styles.agentTaskDetailPrompt}>{taskDescription(task)}</p>
      <div className={styles.agentTaskDetailFacts}>
        <span>{RELATION_LABELS[relation]}</span>
        <span>
          执行 {timing ? elapsedLabel(timing.executionMs) : durationLabel(task)}
        </span>
        {timing && timing.waitingMs > 0 && (
          <span data-waiting="true">等待 {elapsedLabel(timing.waitingMs)}</span>
        )}
        {task.sourceTool && <span>{task.sourceTool}</span>}
        {relationInferred && <span data-inferred="true">关系为推测</span>}
      </div>
      {(predecessor || startLabel || endLabel) && (
        <div className={styles.agentTaskDependency}>
          <GitBranch size={12} />
          {predecessor ? `前置：${predecessor}` : "时间记录"}
          {startLabel && ` · ${startLabel}`}
          {endLabel && ` → ${endLabel}`}
        </div>
      )}
      <details
        className={styles.agentTaskOutput}
        open={task.status === "error"}
      >
        <summary>
          <ExternalLink size={12} />
          {task.status === "error" ? "失败原因与原始输出" : "查看原始输出"}
        </summary>
        <pre>{taskOutput(task)}</pre>
      </details>
    </section>
  );
}

export default function AgentCollaborationPanel({
  sessionId,
  emptyState,
}: AgentCollaborationPanelProps) {
  const { t } = useTranslation();
  const tasks = useBackgroundTasksStore((state) => state.tasks);
  const [view, setView] = useState<AgentView>("flow");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const agentTasks = useMemo(
    () =>
      selectTasksForSession(tasks, sessionId).filter(
        (task) => task.kind === "agent",
      ),
    [sessionId, tasks],
  );
  const model = useMemo(
    () => deriveAgentCollaboration(agentTasks),
    [agentTasks],
  );
  const timeline = useMemo(
    () => buildAgentTimeline(model.nodes),
    [model.nodes],
  );
  const stages = useMemo(
    () => buildCollaborationStages(model.nodes),
    [model.nodes],
  );
  const selectedNode =
    model.nodes.find((node) => node.task.toolCallId === selectedTaskId) ||
    model.nodes.find((node) => node.task.status === "running") ||
    model.nodes[0];
  const selectedTiming = selectedNode
    ? timeline.find(
        (placement) =>
          placement.task.toolCallId === selectedNode.task.toolCallId,
      )
    : undefined;
  const laneNames = useMemo(
    () =>
      Array.from(
        new Set(
          timeline.map(
            (placement) => placement.task.agentId || placement.task.toolName,
          ),
        ),
      ),
    [timeline],
  );

  if (agentTasks.length === 0) return <>{emptyState}</>;

  const finished = model.completed + model.failed;
  const progress = model.total ? Math.round((finished / model.total) * 100) : 0;
  const kindLabel = KIND_LABELS[model.kind];

  return (
    <div className={styles.agentCollaboration}>
      <div className={styles.agentCollaborationSummary}>
        <div className={styles.agentSummaryCopy}>
          <span className={styles.agentSummaryIcon}>
            {model.hasParallel ? (
              <GitBranch size={17} />
            ) : (
              <Network size={17} />
            )}
          </span>
          <div>
            <strong>{kindLabel}</strong>
            <span>
              {finished} / {model.total} 已结束
              {model.running > 0 ? ` · ${model.running} 个运行中` : ""}
            </span>
          </div>
        </div>
        <div
          className={styles.agentProgress}
          role="progressbar"
          aria-label={t("workbench.agents.progress", "智能体协作进度")}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className={styles.agentSummaryTags}>
          {model.hasParallel && <span>并行</span>}
          {model.hasRetries && <span>含重试</span>}
          {model.inferred && <span data-inferred="true">含推测关系</span>}
        </div>
      </div>

      <div className={styles.agentViewTabs} role="tablist">
        {(
          [
            ["flow", Network, "流程"],
            ["timeline", Layers3, "时间线"],
            ["logs", ScrollText, "日志"],
          ] as const
        ).map(([key, Icon, label]) => (
          <button
            type="button"
            role="tab"
            key={key}
            aria-selected={view === key}
            className={view === key ? styles.agentViewTabActive : ""}
            onClick={() => setView(key)}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {view === "flow" && (
        <div className={styles.agentFlow}>
          <div className={styles.agentCoordinatorNode}>
            <span className={styles.agentCoordinatorIcon}>
              <Network size={16} />
            </span>
            <div>
              <strong>协调 Agent</strong>
              <span>
                {kindLabel} · 已派发 {model.total} 个任务
              </span>
            </div>
          </div>
          <div className={styles.agentFlowNodes}>
            {stages.map((stage) =>
              stage.kind === "parallel" ? (
                <div className={styles.agentParallelStage} key={stage.id}>
                  <div className={styles.agentParallelHeading}>
                    <GitBranch size={13} />
                    <strong>并行批次</strong>
                    <span>{stage.nodes.length} 路同时执行</span>
                  </div>
                  <div className={styles.agentParallelNodes}>
                    {stage.nodes.map((node) => (
                      <FlowNode
                        key={node.task.toolCallId}
                        node={node}
                        selected={
                          selectedNode?.task.toolCallId === node.task.toolCallId
                        }
                        onSelect={() => setSelectedTaskId(node.task.toolCallId)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <FlowNode
                  key={stage.id}
                  node={stage.nodes[0]}
                  selected={
                    selectedNode?.task.toolCallId ===
                    stage.nodes[0].task.toolCallId
                  }
                  onSelect={() =>
                    setSelectedTaskId(stage.nodes[0].task.toolCallId)
                  }
                />
              ),
            )}
          </div>
          {selectedNode && (
            <AgentTaskDetail
              node={selectedNode}
              nodes={model.nodes}
              timing={selectedTiming}
            />
          )}
        </div>
      )}

      {view === "timeline" && (
        <div className={styles.agentTimeline}>
          <div className={styles.agentTimelineAxis}>
            <span>{clockLabel(timeline[0]?.startAt ?? null) || "开始"}</span>
            <span>执行过程</span>
            <span>
              {clockLabel(
                timeline.reduce<number | null>(
                  (latest, placement) =>
                    placement.endAt && (!latest || placement.endAt > latest)
                      ? placement.endAt
                      : latest,
                  null,
                ),
              ) || "当前"}
            </span>
          </div>
          {laneNames.map((laneName, lane) => (
            <div className={styles.agentTimelineLane} key={laneName}>
              <span className={styles.agentTimelineLabel}>{laneName}</span>
              <div className={styles.agentTimelineTrack}>
                {timeline
                  .filter((placement) => placement.lane === lane)
                  .map((placement) => (
                    <span key={placement.task.toolCallId}>
                      {placement.waitWidth > 0 && (
                        <span
                          className={styles.agentTimelineWait}
                          style={{
                            left: `${placement.waitLeft}%`,
                            width: `${placement.waitWidth}%`,
                          }}
                          title={`等待 ${elapsedLabel(placement.waitingMs)}`}
                        />
                      )}
                      <button
                        type="button"
                        className={styles.agentTimelineBar}
                        data-status={placement.task.status}
                        aria-pressed={
                          selectedNode?.task.toolCallId ===
                          placement.task.toolCallId
                        }
                        onClick={() =>
                          setSelectedTaskId(placement.task.toolCallId)
                        }
                        style={{
                          left: `${placement.left}%`,
                          width: `${Math.min(
                            placement.width,
                            100 - placement.left,
                          )}%`,
                        }}
                        title={`${taskDescription(
                          placement.task,
                        )} · ${statusLabel(
                          placement.task,
                        )} · 执行 ${elapsedLabel(placement.executionMs)}`}
                      >
                        <span>{elapsedLabel(placement.executionMs)}</span>
                      </button>
                    </span>
                  ))}
              </div>
            </div>
          ))}
          <div className={styles.agentTimelineLegend}>
            <span>
              <i className={styles.agentTimelineLegendExecution} />
              执行
            </span>
            <span>
              <i className={styles.agentTimelineLegendWaiting} />
              等待
            </span>
          </div>
          <div className={styles.agentTimelineHint}>
            <ArrowRight size={12} />
            {timeline.some((placement) => placement.isLogical)
              ? "历史记录缺少可用时间戳，会根据调用顺序重建逻辑时间线。"
              : "时间轴使用实际开始/结束时间；等待段表示前置任务完成后的间隔。"}
          </div>
          {selectedNode && (
            <AgentTaskDetail
              node={selectedNode}
              nodes={model.nodes}
              timing={selectedTiming}
            />
          )}
        </div>
      )}

      {view === "logs" && (
        <div className={styles.agentLogPanel}>
          <BackgroundTaskPanel
            sessionId={sessionId}
            embedded
            showFinished
            listMaxHeight="none"
            kindFilter="agent"
            selectedTaskId={selectedTaskId}
            onTaskSelect={(task) => {
              setSelectedTaskId(task.toolCallId);
              setView("timeline");
            }}
          />
        </div>
      )}
    </div>
  );
}
