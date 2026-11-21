import { createContext } from "react";
import type { IAgentScopeRuntimeMessage } from "@agentscope-ai/chat";
import { isHttpExternalUrl } from "../../utils/openExternalLink";

export interface WebSource {
  url: string;
  title: string;
  number: number;
  host: string;
}

export const WebSourceContext = createContext<ReadonlyMap<string, WebSource>>(
  new Map(),
);

export function sourceUrl(value: string): URL | undefined {
  if (!isHttpExternalUrl(value)) return;
  const url = new URL(value);
  if (!url.username && !url.password) return url;
}

// Live outputs are text. Replayed tool outputs can be serialized TextBlock[].
function outputText(output: unknown): string {
  let blocks: unknown = output;
  if (typeof output === "string") {
    if (!output.trimStart().startsWith("[{")) return output;
    try {
      blocks = JSON.parse(output);
    } catch {
      return "";
    }
  }
  return Array.isArray(blocks)
    ? blocks
        .filter((b) => b?.type === "text" && typeof b.text === "string")
        .map((b) => b.text)
        .join("\n")
    : "";
}

export function collectWebSources(messages: IAgentScopeRuntimeMessage[]) {
  const sources = new Map<string, WebSource>();
  for (const message of messages) {
    if (
      !message.type.endsWith("_call_output") ||
      message.status !== "completed"
    )
      continue;
    const first = message.content?.[0];
    const callName =
      first?.type === "data" && typeof first.data === "object"
        ? first.data?.name
        : undefined;
    for (const block of message.content ?? []) {
      if (
        block.type !== "data" ||
        !block.data ||
        typeof block.data !== "object"
      )
        continue;
      const { name, state, output } = block.data;
      const tool = name || callName;
      if (tool !== "web_search" || (state && state !== "success")) continue;
      const text = outputText(output);
      // The formatter indents all excerpt lines. Only a result heading
      // followed by its URL field identifies a source.
      for (const match of text.matchAll(
        /^\[\d+\] ([^\r\n]*)\r?\n {4}URL: (\S+)[ \t]*\r?$/gm,
      )) {
        const url = sourceUrl(match[2]);
        if (url && !sources.has(url.href)) {
          sources.set(url.href, {
            url: url.href,
            title: match[1].trim() || url.hostname,
            host: url.hostname,
            number: sources.size + 1,
          });
        }
      }
    }
  }
  return sources;
}
