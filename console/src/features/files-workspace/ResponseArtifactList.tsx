import { ChevronDown, ChevronUp, FolderOpen } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { chatApi } from "../../api/modules/chat";
import FileGlyph from "./FileGlyph";
import DeliveryFileActions from "./DeliveryFileActions";
import type { FileTarget } from "./types";
import {
  responseArtifactIdentity,
  setResponseArtifactGroup,
  type ResponseArtifactScope,
} from "./responseArtifactRegistry";
import styles from "./ResponseArtifactList.module.less";

interface ResponseArtifactListProps {
  messages: unknown;
  scope?: ResponseArtifactScope;
}

type ArtifactChange = "written" | "modified" | "sent";
interface ResponseArtifact {
  id: string;
  name: string;
  path: string;
  target: FileTarget;
  toolName: string;
}

const COLLAPSED_FILES = 2;
const FILE_IO_TOOLS = new Set(["appendfile", "editfile", "writefile"]);
const TOOL_INPUT_TYPES = new Set([
  "tool_call",
  "plugin_call",
  "function_call",
  "mcp_call",
  "component_call",
]);
const SEND_FILE_TOOL = "sendfiletouser";
const TOOL_OUTPUT_TYPES = new Set([
  "tool_call_output",
  "plugin_call_output",
  "function_call_output",
  "mcp_call_output",
  "component_call_output",
]);
const FAILED_STATES = new Set([
  "cancelled",
  "canceled",
  "denied",
  "error",
  "failed",
  "interrupted",
  "rejected",
]);
const COMPLETED_STATES = new Set(["success", "succeeded", "completed", "done"]);

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function parsedRecord(value: unknown): Record<string, unknown> | null {
  const direct = record(value);
  if (direct) return direct;
  if (typeof value !== "string") return null;
  try {
    return record(JSON.parse(value));
  } catch {
    return null;
  }
}

function firstString(
  value: Record<string, unknown>,
  keys: readonly string[],
): string {
  for (const key of keys) {
    const candidate = value[key];
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }
  return "";
}

function contentData(
  item: Record<string, unknown>,
  index: number,
): Record<string, unknown> {
  const content = Array.isArray(item.content) ? item.content : [];
  return record(record(content[index])?.data) ?? {};
}

function mergeArtifactToolMessages(messages: unknown): unknown[] {
  if (!Array.isArray(messages)) return [];

  const merged: unknown[] = [];
  const pendingInputs = new Map<string, number[]>();
  for (const value of messages) {
    const item = record(value);
    if (!item) {
      merged.push(value);
      continue;
    }
    const type = firstString(item, ["type"]);
    const key = firstString(contentData(item, 0), ["call_id", "name"]);
    if (TOOL_INPUT_TYPES.has(type) && key) {
      const indexes = pendingInputs.get(key) ?? [];
      indexes.push(merged.length);
      pendingInputs.set(key, indexes);
      merged.push(item);
      continue;
    }
    if (TOOL_OUTPUT_TYPES.has(type) && key) {
      const indexes = pendingInputs.get(key);
      const inputIndex = indexes?.shift();
      if (inputIndex !== undefined) {
        const input = record(merged[inputIndex]);
        const inputContent = Array.isArray(input?.content) ? input.content : [];
        const outputContent = Array.isArray(item.content) ? item.content : [];
        merged[inputIndex] = {
          ...item,
          content: [...inputContent, ...outputContent.slice(0, 1)],
        };
        if (indexes?.length === 0) pendingInputs.delete(key);
        continue;
      }
    }
    merged.push(item);
  }
  return merged;
}

function normalizedToolName(name: string): string {
  return name.replace(/[^a-z\d]/gi, "").toLowerCase();
}

function targetForPath(path: string): FileTarget | null {
  const normalized = path.trim().replace(/\\/g, "/");
  // Absolute, `~` and Windows drive paths are resolved by the preview
  // endpoint, which expanduser()s and resolves them (app/routers/files.py).
  if (
    normalized.startsWith("/") ||
    normalized.startsWith("~") ||
    /^[a-z]:\//i.test(normalized)
  ) {
    return {
      source: "attachment",
      path: normalized,
      artifactUrl: chatApi.filePreviewUrl(normalized),
    };
  }

  // Anything else is a project-relative *filesystem* path. Tool paths are not
  // Markdown hrefs, so parseInternalFileLink must not be used here: it splits
  // on `#`, which drops ordinary names such as "Report #3.pdf" and retargets
  // `report#L12` onto a different file. The traversal guard it provided is
  // preserved below.
  const relative = normalized.replace(/^(?:\.\/)+/, "");
  if (
    !relative ||
    /^[a-z]:/i.test(relative) ||
    relative
      .split("/")
      .some((segment) => !segment || segment === "." || segment === "..")
  ) {
    return null;
  }
  return { source: "workspace", path: relative, root: "project" };
}

/**
 * Whether a ``send_file_to_user`` result actually delivered a file.
 *
 * The backend returns ``[DataBlock, TextBlock]`` on success and
 * ``[TextBlock("Error: …")]`` on failure — both with ``state=success``, so
 * the DataBlock's presence is the only reliable success signal.
 *
 * The DataBlock source shape varies with the delivery path: text files
 * arrive as ``{type: "url", url: "file://…"}`` while images are inlined as
 * ``{type: "base64", data: …}``. Keying on the block type rather than the
 * source shape keeps both covered.
 *
 * Tool results can carry a block array. Chat history carries the same blocks
 * as a JSON string. Both forms use the DataBlock success signal.
 */
function hasDeliveredFile(output: unknown): boolean {
  let blocks = output;
  if (typeof blocks === "string") {
    try {
      blocks = JSON.parse(blocks);
    } catch {
      return false;
    }
  }
  if (!Array.isArray(blocks)) return false;
  return blocks.some((block) => record(block)?.type === "data");
}

/** Some historical tool results wrap an Error TextBlock in a success event. */
function hasErrorOutput(output: unknown): boolean {
  if (typeof output === "string") {
    try {
      return hasErrorOutput(JSON.parse(output));
    } catch {
      return /^\s*(?:error|failed|failure)\s*:/i.test(output);
    }
  }
  if (Array.isArray(output)) return output.some(hasErrorOutput);
  const value = record(output);
  if (!value) return false;
  if (value.is_error === true || value.isError === true) return true;
  if (
    FAILED_STATES.has(firstString(value, ["state", "status"]).toLowerCase())
  ) {
    return true;
  }
  return typeof value.text === "string" && hasErrorOutput(value.text);
}

function extractResponseArtifacts(messages: unknown): ResponseArtifact[] {
  const artifacts = new Map<string, ResponseArtifact>();
  for (const value of mergeArtifactToolMessages(messages)) {
    const item = record(value);
    if (!item) continue;
    const type = firstString(item, ["type"]);
    if (!TOOL_OUTPUT_TYPES.has(type)) continue;

    // mergeToolMessages uses [call content, result content] for a completed
    // tool entry. Reusing that shape keeps artifacts in sync with ResponseTool.
    const callData = contentData(item, 0);
    const resultData = contentData(item, 1);
    if (Object.keys(resultData).length === 0) continue;
    const state = (
      firstString(resultData, ["state", "status"]) ||
      firstString(item, ["state", "status"])
    ).toLowerCase();
    if (
      resultData.is_error === true ||
      item.is_error === true ||
      FAILED_STATES.has(firstString(item, ["state", "status"]).toLowerCase()) ||
      !COMPLETED_STATES.has(state) ||
      hasErrorOutput(resultData.output)
    ) {
      continue;
    }

    const toolName =
      firstString(callData, ["name"]) || firstString(item, ["name"]);
    const normalized = normalizedToolName(toolName);

    if (normalized === SEND_FILE_TOOL) {
      if (!hasDeliveredFile(resultData.output)) continue;
    } else if (!FILE_IO_TOOLS.has(normalized)) {
      continue;
    }

    const params =
      parsedRecord(callData.arguments) ??
      parsedRecord(item.params) ??
      parsedRecord(item.arguments) ??
      {};
    const path = firstString(params, ["file_path"]);
    const target = targetForPath(path);
    if (!target) continue;
    const name = path.replace(/\\/g, "/").split("/").pop() || "file";
    const id = responseArtifactIdentity(target);
    artifacts.delete(id);
    artifacts.set(id, {
      id,
      name,
      path,
      target,
      toolName,
    });
  }
  return Array.from(artifacts.values()).reverse();
}

const CHANGE_LABEL_KEY: Record<ArtifactChange, string> = {
  written: "files.artifactWritten",
  modified: "files.artifactModified",
  sent: "files.artifactSent",
};

function artifactChange(toolName?: string): ArtifactChange {
  const normalized = normalizedToolName(toolName ?? "");
  if (normalized === SEND_FILE_TOOL) return "sent";
  // Legacy tool output cannot distinguish creating a file from overwriting it.
  return normalized === "writefile" ? "written" : "modified";
}

export default function ResponseArtifactList({
  messages,
  scope,
}: ResponseArtifactListProps) {
  const { t } = useTranslation();
  const groupId = useId();
  // This bubble re-renders on every streamed token, so keep the extraction
  // (which walks every tool output and parses each call's arguments) bound to
  // message changes rather than to render count.
  const artifacts = useMemo(
    () => extractResponseArtifacts(messages),
    [messages],
  );
  const scopeAgentId = scope?.agentId;
  const scopeSessionId = scope?.sessionId;
  useEffect(
    () =>
      setResponseArtifactGroup(
        groupId,
        artifacts.map((item) => item.target),
        scopeAgentId !== undefined && scopeSessionId !== undefined
          ? {
              kind: "session",
              agentId: scopeAgentId,
              sessionId: scopeSessionId,
            }
          : undefined,
      ),
    [artifacts, groupId, scopeAgentId, scopeSessionId],
  );
  const [expanded, setExpanded] = useState(false);

  if (artifacts.length === 0) return null;

  const hasOverflow = artifacts.length > COLLAPSED_FILES;
  const hiddenCount = Math.max(0, artifacts.length - COLLAPSED_FILES);
  const visibleArtifacts = expanded
    ? artifacts
    : artifacts.slice(0, COLLAPSED_FILES);

  return (
    <div className={styles.list} data-testid="response-artifacts">
      <div className={styles.grid}>
        {visibleArtifacts.map((artifact) => {
          const change = artifactChange(artifact.toolName);
          const extension = artifact.name.includes(".")
            ? artifact.name.split(".").pop()?.toUpperCase()
            : undefined;
          const preview = (trigger: HTMLElement) => {
            window.dispatchEvent(
              new CustomEvent("qwenpaw:open-file-preview", {
                detail: {
                  target: artifact.target,
                  trigger,
                  ...(scope && {
                    agentId: scope.agentId,
                    sessionId: scope.sessionId,
                    chatId: scope.chatId,
                  }),
                },
              }),
            );
          };
          return (
            <div key={artifact.id} className={styles.file}>
              <button
                key={artifact.id}
                type="button"
                className={styles.previewButton}
                title={artifact.path}
                aria-label={`${artifact.name} ${artifact.path}`}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  preview(event.currentTarget);
                }}
              >
                <i className={styles.icon} aria-hidden="true">
                  <FileGlyph name={artifact.name} size={27} />
                </i>
                <span className={styles.details}>
                  <strong>{artifact.name}</strong>
                  <span className={styles.meta}>
                    <small className={styles.status} data-change={change}>
                      {t(CHANGE_LABEL_KEY[change])}
                    </small>
                    {extension && (
                      <small className={styles.fileType}>{extension}</small>
                    )}
                    <small className={styles.path} title={artifact.path}>
                      {artifact.path}
                    </small>
                  </span>
                </span>
              </button>
              <div className={styles.actions}>
                <DeliveryFileActions
                  name={artifact.name}
                  target={artifact.target}
                  scope={scope}
                  onPreview={preview}
                  moreActions={[
                    {
                      key: "legacy-location",
                      label: t(
                        "workspace.revealInFileManager",
                        "在文件夹中打开",
                      ),
                      icon: <FolderOpen size={15} aria-hidden="true" />,
                      onSelect: () => {
                        window.dispatchEvent(
                          new CustomEvent("qwenpaw:reveal-file", {
                            detail: {
                              target: artifact.target,
                              ...(scope && {
                                agentId: scope.agentId,
                                sessionId: scope.sessionId,
                                chatId: scope.chatId,
                              }),
                            },
                          }),
                        );
                      },
                    },
                  ]}
                />
              </div>
            </div>
          );
        })}
      </div>
      {hasOverflow && (
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? (
            <>
              {t("files.artifactsCollapse")}
              <ChevronUp size={14} />
            </>
          ) : (
            <>
              {t("files.artifactsExpand", { count: hiddenCount })}
              <ChevronDown size={14} />
            </>
          )}
        </button>
      )}
    </div>
  );
}
