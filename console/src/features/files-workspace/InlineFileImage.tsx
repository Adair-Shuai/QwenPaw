import { useState } from "react";
import { ImageOff, LoaderCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getApiUrl } from "../../api/config";
import { useAuthenticatedWorkspaceBlob } from "../../hooks/useAuthenticatedWorkspaceBlob";
import { openFilePreview, type FilePreviewScope } from "./openFilePreview";
import type { FileTarget } from "./types";
import ZoomableChatImage from "./ZoomableChatImage";
import styles from "./InlineFileImage.module.less";

interface InlineFileImageProps {
  target?: FileTarget;
  src?: string;
  alt: string;
  title?: string;
  scope?: FilePreviewScope;
  thumbnail?: boolean;
}

/** Markdown, tool deliveries and archive cards share the same image loading UI. */
export default function InlineFileImage(props: InlineFileImageProps) {
  const { target, scope, src } = props;
  return <FileImage key={JSON.stringify([target, src, scope])} {...props} />;
}

function FileImage({
  target,
  scope,
  src,
  alt,
  title,
  thumbnail,
}: InlineFileImageProps) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);
  const explicitUrl = src || target?.artifactUrl;
  let backendUrl: string | undefined;
  if (explicitUrl) {
    try {
      const backend = new URL(getApiUrl("/"), window.location.href);
      const url = new URL(explicitUrl, window.location.href);
      if (
        url.origin === backend.origin &&
        url.pathname.startsWith(backend.pathname)
      )
        backendUrl = explicitUrl;
    } catch {
      // Invalid URLs use the visible error state below.
    }
  }
  const local = Boolean(target && (!explicitUrl || backendUrl));
  const resource = useAuthenticatedWorkspaceBlob(local ? target!.path : null, {
    ...scope,
    root: target?.root ?? "project",
    url: backendUrl,
  });
  const url = local ? resource.url : explicitUrl;
  const error = failed || resource.status === "error" || (!local && !url);
  const preview = (trigger: HTMLElement) => {
    if (target) openFilePreview(target, trigger, scope);
  };

  if (error) {
    if (thumbnail)
      return (
        <button
          type="button"
          className={styles.thumbnailFeedback}
          aria-label={`${alt} · ${t("turnFiles.imagePreviewFailed")} · ${t(
            "workspace.retry",
            "重试",
          )}`}
          title={`${t("turnFiles.imagePreviewFailed")} · ${t(
            "workspace.retry",
            "重试",
          )}`}
          onClick={() => {
            setFailed(false);
            resource.retry();
          }}
        >
          <ImageOff size={20} aria-hidden="true" />
        </button>
      );
    return (
      <span className={styles.feedback} role="status">
        <span>
          {alt} · {t("turnFiles.imagePreviewFailed")}
        </span>
        <button
          type="button"
          onClick={() => {
            setFailed(false);
            resource.retry();
          }}
        >
          {t("workspace.retry", "重试")}
        </button>
        {target && (
          <button
            type="button"
            onClick={(event) => preview(event.currentTarget)}
          >
            {t("files.preview")}
          </button>
        )}
      </span>
    );
  }
  if (!url && thumbnail)
    return (
      <span
        className={styles.thumbnailFeedback}
        role="status"
        aria-label={t("workspace.loading", "正在加载文件")}
      >
        <LoaderCircle size={20} aria-hidden="true" />
      </span>
    );
  if (!url)
    return (
      <span className={styles.feedback} role="status">
        {t("workspace.loading", "正在加载文件")}
      </span>
    );

  return (
    <span
      className={`${styles.image}${thumbnail ? ` ${styles.thumbnail}` : ""}`}
    >
      <ZoomableChatImage
        className={styles.preview}
        src={url}
        alt={alt}
        title={title}
        onError={() => setFailed(true)}
      />
    </span>
  );
}
