import { createContext, useContext, useId } from "react";
import type { ComponentProps } from "@ant-design/x-markdown";
import MarkdownLink from "@agentscope-ai/chat/lib/Markdown/core/components/Link";
import { Code2, FileText, FolderOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { parseInternalFileLink } from "../../features/files-workspace/internalFileLinks";
import {
  openFilePreview,
  type FilePreviewScope,
} from "../../features/files-workspace/openFilePreview";
import styles from "./AssistantFileLink.module.less";
import {
  DIRECTORY_REFERENCE_HREF_PREFIX,
  FILE_REFERENCE_HREF_PREFIX,
  directoryReferenceFromText,
} from "./fileReferenceMarkdown";
import { isDefaultWorkspaceMarkdown } from "../../features/files-workspace/defaultWorkspaceMarkdown";

export const AssistantFileReferenceScope = createContext<FilePreviewScope>({});

/** Keep the original Markdown destination in history and decorate file links. */
export function AssistantFileLink(props: ComponentProps) {
  const scope = useContext(AssistantFileReferenceScope);
  const { t } = useTranslation();
  const id = useId();
  let href = typeof props.href === "string" ? props.href : "";
  const prefix = [
    FILE_REFERENCE_HREF_PREFIX,
    DIRECTORY_REFERENCE_HREF_PREFIX,
  ].find((candidate) => href.startsWith(candidate));
  const inferred = Boolean(prefix);
  if (prefix) {
    try {
      href = decodeURIComponent(href.slice(prefix.length));
    } catch {
      href = "";
    }
  }
  const directory =
    prefix === DIRECTORY_REFERENCE_HREF_PREFIX || /[\\/]$/.test(href)
      ? directoryReferenceFromText(href)
      : null;
  const parsed = parseInternalFileLink(
    href.replace(/^\.\/(?=[^/])/, ""),
    true,
    Boolean(directory),
  );
  const target =
    inferred &&
    !directory &&
    parsed &&
    !href.startsWith("./") &&
    isDefaultWorkspaceMarkdown(parsed.path)
      ? { ...parsed, source: "profile" as const }
      : parsed;
  if (
    !target ||
    props["data-footnote-ref"] !== undefined ||
    props["data-footnote-backref"] !== undefined
  ) {
    const { domNode, streamStatus, ...linkProps } = props;
    void domNode;
    void streamStatus;
    return <MarkdownLink {...linkProps} />;
  }
  const filename = target.path.split("/").pop() || target.path;
  const label =
    !directory && (props.children === href || props.children === target.path)
      ? filename
      : props.children || filename;
  const location = target.line
    ? `L${target.line}${target.endLine ? `–${target.endLine}` : ""}${
        target.column ? ` C${target.column}` : ""
      }`
    : "";
  const FileIcon =
    /\.(?:[cm]?[jt]sx?|py|rs|go|c|cpp|h|java|css|less|sh)$/i.test(filename)
      ? Code2
      : FileText;
  const Icon = directory ? FolderOpen : FileIcon;
  return (
    <a
      href={href}
      className={styles.reference}
      title={
        directory
          ? `${t("workspace.revealInFileManager", "在文件夹中打开")} · ${
              target.path
            }`
          : `${
              target.source === "profile"
                ? `${t("files.agentWorkspace")} / `
                : ""
            }${target.path}${location ? ` · ${location}` : ""}`
      }
      aria-labelledby={`${id}-label${location ? ` ${id}-location` : ""}`}
      data-file-reference={target.path}
      data-directory-reference={directory ? target.path : undefined}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (directory) {
          window.dispatchEvent(
            new CustomEvent("qwenpaw:reveal-file", {
              detail: { ...scope, target },
            }),
          );
          return;
        }
        openFilePreview(
          { ...target, ...(target.line && { preferredView: "text" }) },
          event.currentTarget,
          scope,
        );
      }}
    >
      <Icon size={14} role="presentation" />
      <span id={`${id}-label`} className={styles.label}>
        {label}
      </span>
      {location && (
        <>
          {" "}
          <span id={`${id}-location`} className={styles.location}>
            {location}
          </span>
        </>
      )}
    </a>
  );
}
