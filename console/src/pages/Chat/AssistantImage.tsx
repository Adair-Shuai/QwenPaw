import { useContext } from "react";
import type { ComponentProps } from "@ant-design/x-markdown";
import MarkdownMedia from "@agentscope-ai/chat/lib/Markdown/core/components/Media";
import { getApiUrl } from "../../api/config";
import InlineFileImage from "../../features/files-workspace/InlineFileImage";
import { parseInternalFileLink } from "../../features/files-workspace/internalFileLinks";
import { AssistantFileReferenceScope } from "./AssistantFileLink";
import {
  FILE_REFERENCE_HREF_PREFIX,
  IMAGE_REFERENCE_HREF_PREFIX,
} from "./fileReferenceMarkdown";

export function AssistantImage(props: ComponentProps) {
  const scope = useContext(AssistantFileReferenceScope);
  let src = typeof props.src === "string" ? props.src : "";
  const prefix = [IMAGE_REFERENCE_HREF_PREFIX, FILE_REFERENCE_HREF_PREFIX].find(
    (value) => src.startsWith(value),
  );
  if (prefix) {
    try {
      src = decodeURIComponent(src.slice(prefix.length));
    } catch {
      src = "";
    }
  }
  if (/^https?:\/\//i.test(src) && /\.(?:mp4|mp3|wav)(?:[?#]|$)/i.test(src))
    return <MarkdownMedia {...props} />;
  if (src.startsWith("/api/")) src = getApiUrl(src.slice(4));
  const apiUrl = src.startsWith(getApiUrl("/"));
  const target = apiUrl
    ? { source: "attachment" as const, path: src, artifactUrl: src }
    : parseInternalFileLink(src.replace(/^(?:\.\/)+/, ""), true);
  const remote = /^(?:https?:|blob:|data:image\/)/i.test(src);
  return (
    <InlineFileImage
      target={target ?? undefined}
      src={remote || apiUrl ? src : undefined}
      scope={scope}
      alt={typeof props.alt === "string" ? props.alt : ""}
      title={typeof props.title === "string" ? props.title : undefined}
    />
  );
}
