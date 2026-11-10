import React, {
  createContext,
  useContext,
  useDeferredValue,
  useMemo,
  useRef,
} from "react";
import { Markdown } from "@agentscope-ai/chat";
import { useEffectiveFontSize } from "../../contexts/FontSizeContext";
import { renderableCodeComponents } from "../../components/RenderableCodeBlock";
import { RenderableCodeBlock } from "../../components/RenderableCodeBlock/RenderableCodeBlock";
import { useChatListSnapshot } from "../../plugins/registry/useChatExtensions";
import { PluginSlotBoundary } from "../../plugins/registry/PluginSlotBoundary";
import {
  useHostCurrentSession,
  useHostSelectedAgent,
} from "../../plugins/hostSdk/hooks";
import type { ChatListSnapshot } from "../../plugins/registry/chatExtensions";
import { resolveLanguage } from "../../components/RenderableCodeBlock/language";
import { CodeBlockSlot, StableCodeBlocks } from "./StableCodeBlocks";
import {
  AssistantFileLink,
  AssistantFileReferenceScope,
} from "./AssistantFileLink";
import { useTurnFilesScope } from "../../features/files-workspace/TurnFilesScope";
import { prepareFileReferenceMarkdown } from "./fileReferenceMarkdown";

import type { ComponentProps } from "@ant-design/x-markdown";

type MarkdownNode = NonNullable<NonNullable<ComponentProps["domNode"]>["next"]>;
const blockKeys = new WeakMap<MarkdownNode, string>();

/** Footnotes move after the body and can reorder as references resolve. Index
 * code blocks within the body or their stable footnote ID, not display order.
 * Reuse the vendor's parsed tree without parsing or splitting Markdown again.
 */
function getCodeBlockKey(node: MarkdownNode): string | undefined {
  if (!blockKeys.has(node)) {
    let root = node;
    while (root.parent) root = root.parent;
    while (root.prev) root = root.prev;
    const ordinals = new Map<string, number>();
    const visit = (current: MarkdownNode, scope = "body") => {
      const section = current.parent?.parent;
      if (
        "attribs" in current &&
        current.name === "li" &&
        current.attribs.id &&
        section &&
        "attribs" in section &&
        "data-footnotes" in section.attribs
      ) {
        scope = current.attribs.id;
      }
      if (
        "attribs" in current &&
        current.name === "code" &&
        current.attribs["data-block"] === "true"
      ) {
        const ordinal = ordinals.get(scope) ?? 0;
        blockKeys.set(current, `${scope}:${ordinal}`);
        ordinals.set(scope, ordinal + 1);
      }
      if ("children" in current)
        current.children.forEach((child) => visit(child, scope));
    };
    for (
      let current: MarkdownNode | null = root;
      current;
      current = current.next
    ) {
      visit(current);
    }
  }
  return blockKeys.get(node);
}

interface BlockContext {
  entries: ChatListSnapshot["response.codeBlocks"];
  streaming: boolean;
  messageId: string;
  agentId: string;
  sessionId: string;
}
const CodeBlockContext = createContext<BlockContext | null>(null);

function AssistantCodeBlock(
  props: React.ComponentProps<typeof RenderableCodeBlock>,
) {
  const ctx = useContext(CodeBlockContext);
  const language = resolveLanguage(props.lang, props.className);
  const entry =
    props.block === true
      ? ctx?.entries
          .slice()
          .reverse()
          .find((e) => e.item.language === language)
      : undefined;
  const fallback = () => <RenderableCodeBlock {...props} />;
  if (!entry || !ctx || typeof props.children !== "string" || !props.domNode)
    return fallback();
  const blockKey = getCodeBlockKey(props.domNode);
  if (blockKey === undefined) return fallback();
  const blockId = `${ctx.messageId}:code:${blockKey}`;
  const Component = entry.item.render;
  return (
    <CodeBlockSlot id={blockId}>
      <PluginSlotBoundary
        key={entry.registrationId}
        slot="response.codeBlocks"
        pluginId={entry.pluginId}
        fallback={fallback()}
      >
        <Component
          source={props.children}
          language={language}
          isStreaming={ctx.streaming && props.streamStatus !== "done"}
          messageId={ctx.messageId}
          blockId={blockId}
          agentId={ctx.agentId}
          sessionId={ctx.sessionId}
          fallback={fallback}
        />
      </PluginSlotBoundary>
    </CodeBlockSlot>
  );
}

// Keep the adapter type stable; portals also survive Markdown ancestor replacement.
const assistantCodeComponents = {
  code: AssistantCodeBlock,
  a: AssistantFileLink,
};
const assistantMarkdownComponents = {
  ...renderableCodeComponents,
  a: AssistantFileLink,
};

const MemoizedAssistantMarkdown = React.memo(function AssistantMarkdown({
  content,
  cursor,
  isStreaming = cursor,
  messageId,
}: {
  content: string;
  cursor: boolean;
  isStreaming?: boolean;
  messageId: string;
}) {
  const deferredContent = useDeferredValue(content);
  const markdownContent = useMemo(
    () => prepareFileReferenceMarkdown(deferredContent),
    [deferredContent],
  );
  const baseFontSize = useEffectiveFontSize();
  const entries = useChatListSnapshot()["response.codeBlocks"];
  const agent = useHostSelectedAgent();
  const session = useHostCurrentSession();
  const turnScope = useTurnFilesScope();
  const scope = useRef({
    agentId: turnScope?.agentId ?? agent.id,
    sessionId: turnScope?.sessionId ?? session?.id ?? "",
    chatId: turnScope?.chatId,
  });
  // The SDK may allocate the session after the first render of a new response.
  const allocatedSessionId = turnScope?.sessionId || session?.id;
  if (
    (!scope.current.sessionId || scope.current.sessionId === "new") &&
    agent.id === scope.current.agentId &&
    allocatedSessionId &&
    allocatedSessionId !== "new"
  ) {
    scope.current.sessionId = allocatedSessionId;
  }
  if (
    turnScope?.agentId === scope.current.agentId &&
    turnScope.sessionId === scope.current.sessionId
  ) {
    scope.current.chatId ??= turnScope.chatId;
  }
  const { agentId, sessionId, chatId } = scope.current;
  const referenceScope = useMemo(
    () => ({ agentId, sessionId: sessionId || "new", chatId }),
    [agentId, sessionId, chatId],
  );
  const blockContext = useMemo(
    () => ({
      entries,
      // Completion must not finalize a block against an older deferred delta.
      streaming: isStreaming || deferredContent !== content,
      messageId,
      agentId,
      sessionId,
    }),
    [
      entries,
      isStreaming,
      deferredContent,
      content,
      messageId,
      agentId,
      sessionId,
    ],
  );
  const extended = entries.length > 0;
  if (!extended) {
    return (
      <AssistantFileReferenceScope.Provider value={referenceScope}>
        <Markdown
          baseFontSize={baseFontSize}
          components={assistantMarkdownComponents}
          content={markdownContent}
          cursor={cursor}
        />
      </AssistantFileReferenceScope.Provider>
    );
  }
  return (
    <AssistantFileReferenceScope.Provider value={referenceScope}>
      <CodeBlockContext.Provider value={blockContext}>
        <StableCodeBlocks key={messageId}>
          <Markdown
            baseFontSize={baseFontSize}
            components={assistantCodeComponents}
            content={markdownContent}
            // The vendor cursor appends a literal token, which corrupts unfinished DSL.
            cursor={false}
          />
        </StableCodeBlocks>
      </CodeBlockContext.Provider>
    </AssistantFileReferenceScope.Provider>
  );
});

// Keep the host's callable export while isolating the expensive Markdown tree
// from unrelated parent updates.
export function AssistantMarkdown(
  props: React.ComponentProps<typeof MemoizedAssistantMarkdown>,
) {
  return <MemoizedAssistantMarkdown {...props} />;
}
