/**
 * pages/Chat/HostBubbles.tsx — host-side wrappers around the vendor's
 * AgentScopeRuntime{Request,Response}Card components.
 *
 * Why wrappers:
 * - Plugin extensions (chat.request.render / prepend / append and the
 *   response equivalents) need a render seam SDK doesn't expose.
 * - We register HostRequestCard / HostResponseCard into options.cards so the
 *   SDK Cards dispatcher invokes them instead of the vendor defaults.
 * - The wrapper itself subscribes to the chat extension registry via hooks,
 *   so it re-renders when plugins register/dispose — no need to rebuild the
 *   parent useMemo (and avoid re-mounting bubbles on every plugin change).
 *
 * Vendor response primitives are deep-imported because they're not in the
 * package's top-level exports. If the SDK reorganizes its internal paths,
 * update the imports below.
 */
import React, {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import { Avatar, Flex } from "antd";
import {
  CheckCircleOutlined,
  LoadingOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { SparkCopyLine, SparkReplaceLine } from "@agentscope-ai/icons";
import { Tooltip } from "@agentscope-ai/design";
import { Bubble, Markdown } from "@agentscope-ai/chat";
import { useTranslation } from "react-i18next";
import VendorRequestCardOriginal from "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/AgentScopeRuntime/Request/Card";
import AgentScopeRuntimeResponseBuilder from "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/AgentScopeRuntime/Response/Builder";
import VendorTool from "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/AgentScopeRuntime/Response/Tool";
import VendorReasoning from "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/AgentScopeRuntime/Response/Reasoning";
import VendorError from "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/AgentScopeRuntime/Response/Error";
import { useChatAnywhereOptions } from "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/Context/ChatAnywhereOptionsContext";
import { copy } from "@agentscope-ai/chat/lib/Util/copy";
import { emit } from "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/Context/useChatAnywhereEventEmitter";
import {
  AgentScopeRuntimeContentType,
  AgentScopeRuntimeMessageType,
  AgentScopeRuntimeRunStatus,
  type IAgentScopeRuntimeMessage,
} from "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/AgentScopeRuntime/types";
import Images from "@agentscope-ai/chat/lib/DefaultCards/Images";
import Videos from "@agentscope-ai/chat/lib/DefaultCards/Videos";
import Files from "@agentscope-ai/chat/lib/DefaultCards/Files";
import { renderableCodeComponents } from "../../components/RenderableCodeBlock";
// Vendor `.d.ts` doesn't yet describe the contentPrepend/contentAppend
// slots we added in the patched .js (Response/Card.js + Request/Card.js).
// Loosen the prop type so TS doesn't reject the passthrough; runtime
// behaviour is unchanged.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const VendorRequestCard = VendorRequestCardOriginal as React.ComponentType<any>;
import {
  useChatScalarSnapshot,
  useChatListSnapshot,
} from "../../plugins/registry/useChatExtensions";
import { ChatScalar, ChatList } from "../../plugins/registry/slotKeys";
import { PluginSlotBoundary } from "../../plugins/registry/PluginSlotBoundary";
import type {
  ChatRequestData,
  ChatResponseData,
} from "../../plugins/registry/types";
import { FileSummaryCards } from "../../components/Chat/ToolCards/shared";
import { groupResponseMessages } from "./responseMessageGrouping";
import { resolveWorkspaceSessionScope } from "../../features/files-workspace/workspaceSessionScope";
import { useAgentStore } from "../../stores/agentStore";
import { DownloadableAudios } from "../../components/Chat/MediaDownload";
import ResponseArtifactList from "../../features/files-workspace/ResponseArtifactList";
import {
  isRenderableActionNode,
  normalizeChatActions,
  type SafeChatAction,
} from "./chatActionSafety";

function sortByOrder<T extends { item: { order?: number } }>(arr: T[]): T[] {
  return arr
    .slice()
    .sort((a, b) => (a.item.order ?? 100) - (b.item.order ?? 100));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyCardProps = any;

function SafeResponseActions(props: {
  data: ChatResponseData;
  isLast?: boolean;
}) {
  const { t } = useTranslation();
  const rawActions = useChatAnywhereOptions(
    (options) => options.actions?.list,
  );
  const actions = normalizeChatActions(rawActions);
  const actionItems =
    rawActions == null
      ? [
          {
            icon: <SparkCopyLine />,
            onClick: () => void copy(JSON.stringify(props.data)),
          },
        ]
      : actions;
  const replace = useChatAnywhereOptions(
    (options) => options.actions?.replace,
  );
  const rightOption = useChatAnywhereOptions(
    (options) => options.actions?.right,
  );

  const buildAction = (item: SafeChatAction, context: unknown) => {
    const action = { ...item } as Record<string, unknown>;
    delete action.render;
    if (!isRenderableActionNode(action.icon)) delete action.icon;
    if (item.render) {
      try {
        const rendered = item.render({ data: context });
        action.children = isRenderableActionNode(rendered)
          ? rendered
          : undefined;
      } catch (error) {
        console.error("[chat] action render failed:", error);
        action.children = null;
      }
    }
    action.onClick = () => {
      try {
        item.onClick?.({ data: context });
      } catch (error) {
        console.error("[chat] action click failed:", error);
      }
    };
    return action;
  };

  const actionData = [
    ...actionItems.map((item) => buildAction(item, props)),
    ...(replace && props.isLast
      ? [
          {
            icon: (
              <Tooltip
                title={t("actions.regenerate", "重新生成")}
                children={<SparkReplaceLine />}
              />
            ),
            onClick: () => emit({ type: "handleReplace", data: props }),
          },
        ]
      : []),
  ];

  let rightNode: React.ReactElement | undefined;
  if (rightOption === false || (Array.isArray(rightOption) && rightOption.length === 0)) {
    rightNode = undefined;
  } else if (Array.isArray(rightOption)) {
    rightNode = (
      <Bubble.Footer.Actions
        data={normalizeChatActions(rightOption).map((item) =>
          buildAction(item, props.data),
        ) as any}
      />
    );
  } else {
    const usage = props.data as AnyCardProps;
    rightNode = usage.usage?.input_tokens && usage.usage?.output_tokens ? (
      <Bubble.Footer.Count
        data={[
          ["Input", usage.usage.input_tokens],
          ["Output", usage.usage.output_tokens],
        ]}
      />
    ) : undefined;
  }

  if (!AgentScopeRuntimeResponseBuilder.maybeDone(props.data as AnyCardProps)) {
    return null;
  }
  return (
    <Bubble.Footer
      left={<Bubble.Footer.Actions data={actionData as any} />}
      right={rightNode}
    />
  );
}

function DeferredMarkdown({
  content,
  cursor,
}: {
  content: string;
  cursor: boolean;
}) {
  // Parsing Markdown, code fences, and diagrams is substantially more
  // expensive than appending stream text. A deferred value lets React skip
  // obsolete intermediate parses while keeping input and scrolling responsive.
  const deferredContent = useDeferredValue(content);

  return (
    <Markdown
      components={renderableCodeComponents}
      content={deferredContent}
      cursor={cursor}
    />
  );
}

const HostMessage = React.memo(function HostMessage({
  data,
}: {
  data: IAgentScopeRuntimeMessage;
}) {
  const replaceMediaURL = useChatAnywhereOptions(
    (options) => options.api?.replaceMediaURL,
  );
  const onFileCardClick = useChatAnywhereOptions(
    (options) => options.api?.onFileCardClick,
  );
  const formatMediaURL = (url?: string) =>
    url ? replaceMediaURL?.(url) || url : url;

  if (!data.content?.length) return null;

  return (
    <>
      {(Array.isArray(data.content) ? data.content : [data.content]).map(
        (item, index) => {
          if (!item || typeof item !== "object") {
            return <span key={index}>{String(item ?? "")}</span>;
          }
        switch (item.type) {
          case AgentScopeRuntimeContentType.TEXT:
            return (
              <DeferredMarkdown
                key={index}
                content={item.text}
                cursor={item.status === AgentScopeRuntimeRunStatus.InProgress}
              />
            );
          case AgentScopeRuntimeContentType.REFUSAL:
            return <Markdown key={index} content={item.refusal} raw />;
          case AgentScopeRuntimeContentType.IMAGE:
            return (
              <Images
                key={index}
                data={[{ url: formatMediaURL(item.image_url) }]}
              />
            );
          case AgentScopeRuntimeContentType.VIDEO:
            return (
              <Videos
                key={index}
                data={[
                  {
                    poster: formatMediaURL(item.video_poster),
                    src: formatMediaURL(item.video_url) || "",
                  },
                ]}
              />
            );
          case AgentScopeRuntimeContentType.FILE:
            return (
              <Files
                key={index}
                data={[
                  {
                    name: item.file_name || item.fileName || item.file_id,
                    size: item.file_size,
                    url: formatMediaURL(item.file_url),
                  },
                ]}
                onClick={onFileCardClick}
              />
            );
          case AgentScopeRuntimeContentType.AUDIO:
            return (
              <DownloadableAudios
                key={index}
                data={[
                  { src: formatMediaURL(item.audio_url || item.data) || "" },
                ]}
              />
            );
          default:
            return <div key={index}>{JSON.stringify(item)}</div>;
        }
        },
      )}
    </>
  );
});

function ToolExecutionGroup({ items }: { items: IAgentScopeRuntimeMessage[] }) {
  const { t } = useTranslation();
  const hasRunningTool = items.some(
    (item) => item.status === AgentScopeRuntimeRunStatus.InProgress,
  );
  const [open, setOpen] = useState(hasRunningTool);

  useEffect(() => {
    if (hasRunningTool) {
      setOpen(true);
      return;
    }
    const timer = window.setTimeout(() => setOpen(false), 600);
    return () => window.clearTimeout(timer);
  }, [hasRunningTool]);

  return (
    <details
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      style={{
        margin: "4px 0",
        borderRadius: 6,
        background: open
          ? "var(--ant-color-fill-quaternary, rgba(0,0,0,0.02))"
          : "transparent",
      }}
    >
      <summary
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          minHeight: 28,
          padding: "0 8px",
          borderRadius: 6,
          cursor: "pointer",
          listStyle: "none",
          color: "var(--ant-color-text-secondary, rgba(0,0,0,0.65))",
          fontSize: 12,
          userSelect: "none",
        }}
      >
        {hasRunningTool ? (
          <LoadingOutlined spin style={{ color: "#1677ff" }} />
        ) : (
          <CheckCircleOutlined style={{ color: "#52c41a" }} />
        )}
        <span style={{ flex: 1, minWidth: 0 }}>
          {hasRunningTool
            ? t("tool.executionRunning", "正在执行工具")
            : t("tool.executionHistory", "工具执行记录")}
          （{items.length}）
        </span>
        <ToolOutlined
          style={{
            color: "var(--ant-color-text-quaternary, rgba(0,0,0,0.25))",
          }}
        />
      </summary>
      <div style={{ padding: "2px 8px 6px 8px" }}>
        {items.map((item) => (
          <VendorTool key={item.id} data={item} />
        ))}
      </div>
    </details>
  );
}

function HostDefaultResponseCard(props: {
  data: ChatResponseData;
  isLast?: boolean;
  contentPrepend?: React.ReactNode;
  contentAppend?: React.ReactNode;
}) {
  const avatar = useChatAnywhereOptions((options) => options.welcome?.avatar);
  const nick = useChatAnywhereOptions((options) => options.welcome?.nick);
  const messages = useMemo(
    () =>
      AgentScopeRuntimeResponseBuilder.mergeToolMessages(
        props.data.output as IAgentScopeRuntimeMessage[],
      ),
    [props.data.output],
  );
  const groups = useMemo(() => groupResponseMessages(messages), [messages]);

  if (
    messages.length === 0 &&
    AgentScopeRuntimeResponseBuilder.maybeGenerating(props.data as AnyCardProps)
  ) {
    return <Bubble.Spin />;
  }

  return (
    <>
      {avatar ? (
        <Flex align="center" gap={8} style={{ marginBottom: 8 }}>
          <Avatar src={avatar} />
          {nick ? <span>{nick}</span> : null}
        </Flex>
      ) : null}
      {props.contentPrepend}
      {groups.map((group) => {
        if (group.kind === "tools") {
          return <ToolExecutionGroup key={group.key} items={group.items} />;
        }
        const item = group.item;
        switch (item.type) {
          case AgentScopeRuntimeMessageType.MESSAGE:
            return <HostMessage key={item.id} data={item} />;
          case AgentScopeRuntimeMessageType.MCP_APPROVAL_REQUEST:
            return <VendorTool key={item.id} data={item} isApproval />;
          case AgentScopeRuntimeMessageType.REASONING:
            return <VendorReasoning key={item.id} data={item} />;
          case AgentScopeRuntimeMessageType.ERROR:
            return <VendorError key={item.id} data={item} />;
          case AgentScopeRuntimeMessageType.HEARTBEAT:
            return null;
          default:
            return null;
        }
      })}
      {props.data.error ? (
        <VendorError data={props.data.error as IAgentScopeRuntimeMessage} />
      ) : null}
      {props.contentAppend}
      {AgentScopeRuntimeResponseBuilder.maybeDone(props.data as AnyCardProps) ? (
        <ResponseArtifactList messages={messages} />
      ) : null}
      <SafeResponseActions data={props.data} isLast={props.isLast} />
    </>
  );
}

function HostRequestCardContent(props: { data: ChatRequestData }) {
  const extScalar = useChatScalarSnapshot();
  const extLists = useChatListSnapshot();

  const renderEntry = extScalar[ChatScalar.requestRender];
  const renderFn = renderEntry?.value;
  const prependList = sortByOrder(extLists[ChatList.requestPrepend]);
  const appendList = sortByOrder(extLists[ChatList.requestAppend]);

  // prepend/append routed through vendor's contentPrepend/contentAppend
  // slot so actions stay last. Mirrors HostResponseCard.
  const contentPrepend =
    prependList.length === 0 ? null : (
      <>
        {prependList.map((e) => (
          <PluginSlotBoundary
            key={e.item.id}
            slot={ChatList.requestPrepend}
            pluginId={e.pluginId}
          >
            {e.item.render({ data: props.data })}
          </PluginSlotBoundary>
        ))}
      </>
    );
  const contentAppend =
    appendList.length === 0 ? null : (
      <>
        {appendList.map((e) => (
          <PluginSlotBoundary
            key={e.item.id}
            slot={ChatList.requestAppend}
            pluginId={e.pluginId}
          >
            {e.item.render({ data: props.data })}
          </PluginSlotBoundary>
        ))}
      </>
    );

  const fallback = () => (
    <VendorRequestCard
      data={props.data as AnyCardProps}
      contentPrepend={contentPrepend as AnyCardProps}
      contentAppend={contentAppend as AnyCardProps}
    />
  );

  if (renderFn) {
    return (
      <PluginSlotBoundary
        slot={ChatScalar.requestRender}
        pluginId={renderEntry!.pluginId}
        fallback={fallback()}
      >
        {renderFn({ data: props.data, fallback })}
      </PluginSlotBoundary>
    );
  }
  return fallback();
}

const MemoizedHostRequestCard = React.memo(HostRequestCardContent);

export function HostRequestCard(props: { data: ChatRequestData }) {
  return <MemoizedHostRequestCard {...props} />;
}

function HostResponseCardContent(props: {
  data: ChatResponseData;
  isLast?: boolean;
}) {
  const location = useLocation();
  const selectedAgent = useAgentStore((state) => state.selectedAgent);
  const { chatId, projectDirOverride } = resolveWorkspaceSessionScope({
    pathname: location.pathname,
    selectedAgent,
  });
  const extScalar = useChatScalarSnapshot();
  const extLists = useChatListSnapshot();

  const renderEntry = extScalar[ChatScalar.responseRender];
  const renderFn = renderEntry?.value;
  const prependList = sortByOrder(extLists[ChatList.responsePrepend]);
  const appendList = sortByOrder(extLists[ChatList.responseAppend]);

  // prepend/append are routed through vendor's contentPrepend/contentAppend
  // slot so they land BETWEEN messages and Actions — actions always last.
  // Vendor change: see Response/Card.js DefaultResponseRender, which now
  // reads props.contentPrepend / props.contentAppend.
  const contentPrepend =
    prependList.length === 0 ? null : (
      <>
        {prependList.map((e) => (
          <PluginSlotBoundary
            key={e.item.id}
            slot={ChatList.responsePrepend}
            pluginId={e.pluginId}
          >
            {e.item.render({ data: props.data, isLast: props.isLast })}
          </PluginSlotBoundary>
        ))}
      </>
    );
  // Host-side file summary cards: scan output for file-related tool calls
  // and render small cards at the end of the response.
  // FileSummaryCards returns null when no file-related tools are found, so
  // it's safe to always include it in contentAppend.
  const fileSummary = (
    <FileSummaryCards
      data={props.data as Record<string, unknown>}
      chatId={chatId}
      projectDirOverride={projectDirOverride}
    />
  );

  const contentAppend =
    appendList.length === 0 ? (
      fileSummary
    ) : (
      <>
        {fileSummary}
        {appendList.map((e) => (
          <PluginSlotBoundary
            key={e.item.id}
            slot={ChatList.responseAppend}
            pluginId={e.pluginId}
          >
            {e.item.render({ data: props.data, isLast: props.isLast })}
          </PluginSlotBoundary>
        ))}
      </>
    );

  const fallback = () => (
    <HostDefaultResponseCard
      data={props.data}
      isLast={props.isLast}
      contentPrepend={contentPrepend}
      contentAppend={contentAppend}
    />
  );

  if (renderFn) {
    return (
      <PluginSlotBoundary
        slot={ChatScalar.responseRender}
        pluginId={renderEntry!.pluginId}
        fallback={fallback()}
      >
        {renderFn({
          data: props.data,
          isLast: props.isLast,
          fallback,
        })}
      </PluginSlotBoundary>
    );
  }
  return fallback();
}

const MemoizedHostResponseCard = React.memo(HostResponseCardContent);

export function HostResponseCard(props: {
  data: ChatResponseData;
  isLast?: boolean;
}) {
  return <MemoizedHostResponseCard {...props} />;
}
