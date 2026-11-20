import { useRef, useState } from "react";
import { Dropdown } from "antd";
import {
  Copy,
  Download,
  Ellipsis,
  PanelRight,
  PanelsTopLeft,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { SessionFilesScope } from "../../api/modules/turnFiles";
import { useAppMessage } from "../../hooks/useAppMessage";
import type { EditorTab } from "../../stores/codingTabsStore";
import { copyText } from "../../utils/clipboard";
import { DownloadCancelledError } from "../../utils/downloadFileFromUrl";
import { mimeFromExtension } from "../../utils/mimeForPreview";
import DeliveryFileActions from "./DeliveryFileActions";
import { downloadDeliveryContent } from "./deliveryFileContent";
import { fileTabTarget } from "./fileIdentity";
import { openFilePreview } from "./openFilePreview";
import type { FileTarget } from "./types";
import menuStyles from "./DeliveryFileActions.module.less";
import styles from "./WorkbenchTabs.module.less";

function WorkbenchFileMore({
  target,
  scope,
  disabled,
  floating,
  onTogglePresentation,
}: {
  target: FileTarget;
  scope: SessionFilesScope;
  disabled: boolean;
  floating: boolean;
  onTogglePresentation: () => void;
}) {
  const { t } = useTranslation();
  const { message } = useAppMessage();
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const archive = target.artifact?.meta;
  const downloadLabel = archive?.turnFileArchive
    ? archive.version === "before"
      ? archive.status === "deleted"
        ? "turnFiles.downloadBefore"
        : "turnFiles.downloadPrevious"
      : "turnFiles.download"
    : "delivery.download";
  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  const download = async () => {
    setDownloading(true);
    try {
      await downloadDeliveryContent(target, scope);
    } catch (error) {
      if (!(error instanceof DownloadCancelledError))
        message.error(t("turnFiles.downloadFailed"));
    } finally {
      setDownloading(false);
    }
  };
  return (
    <Dropdown
      autoFocus
      destroyOnHidden
      trigger={["click"]}
      placement="bottomRight"
      open={open}
      onOpenChange={setOpen}
      overlayClassName={menuStyles.menu}
      menu={{
        items: [
          {
            key: "presentation",
            icon: floating ? (
              <PanelRight size={14} />
            ) : (
              <PanelsTopLeft size={14} />
            ),
            label: t(floating ? "delivery.dock" : "delivery.floatPreview"),
            onClick: onTogglePresentation,
          },
          { type: "divider" },
          {
            key: "copy",
            icon: <Copy size={14} />,
            label: t("delivery.copyPath"),
            onClick: () => {
              void copyText(target.path).then(
                () => message.success(t("delivery.copied")),
                () => message.error(t("delivery.copyFailed")),
              );
            },
          },
          {
            key: "download",
            icon: <Download size={14} />,
            label: t(downloadLabel),
            disabled: disabled || downloading,
            onClick: () => void download(),
          },
        ],
        onClick: close,
        onKeyDown: (event) => {
          if (event.key !== "Escape") return;
          event.preventDefault();
          event.stopPropagation();
          close();
        },
      }}
    >
      <button
        ref={trigger}
        type="button"
        className={styles.iconButton}
        aria-label={t("delivery.fileMenu")}
        aria-haspopup="menu"
        aria-expanded={open}
        title={t("delivery.fileMenu")}
        onKeyDown={(event) => {
          if (event.key !== "Escape" || !open) return;
          event.preventDefault();
          event.stopPropagation();
          close();
        }}
      >
        <Ellipsis size={16} aria-hidden="true" />
      </button>
    </Dropdown>
  );
}

/** The active editor tab owns the file, archive version, and unsaved buffer. */
export default function WorkbenchFileActions({
  file,
  scope,
  runtimeSessionId,
  floating,
  onTogglePresentation,
}: {
  file: EditorTab;
  scope: SessionFilesScope;
  runtimeSessionId?: string;
  floating: boolean;
  onTogglePresentation: () => void;
}) {
  const target = fileTabTarget(file);
  const name = target.path.replace(/\\/g, "/").split("/").pop() || target.path;
  const artifactSession = target.artifact?.sessionId;
  const prefix = `${scope.agentId}:`;
  const sessionId = artifactSession?.startsWith(prefix)
    ? artifactSession.slice(prefix.length)
    : artifactSession || runtimeSessionId || scope.sessionId;
  const nativeScope = { ...scope, sessionId };
  const useBuffer =
    file.dirty ||
    ["profile", "memory", "daily", "digest"].includes(target.source);
  const nativeTarget = useBuffer
    ? {
        ...target,
        source: "artifact" as const,
        artifactUrl: undefined,
        artifact: {
          id: `editor:${file.path}`,
          title: name,
          source: "generated" as const,
          mimeType: mimeFromExtension(name) ?? "text/plain",
          textContent: file.content,
          agentId: scope.agentId,
          sessionId,
          chatId: scope.chatId,
        },
      }
    : {
        ...target,
        ...(target.artifact && {
          artifact: { ...target.artifact, title: name, sessionId },
        }),
      };
  const awaitingContent = useBuffer && !file.dirty && file.size === undefined;
  return (
    <span className={styles.fileActions} data-workbench-file-actions>
      <DeliveryFileActions
        compact
        disabled={awaitingContent}
        name={name}
        target={nativeTarget}
        scope={nativeScope}
        onPreview={(trigger, presentation) =>
          openFilePreview(target, trigger, scope, presentation)
        }
      />
      <WorkbenchFileMore
        key={file.path}
        target={nativeTarget}
        scope={nativeScope}
        disabled={awaitingContent}
        floating={floating}
        onTogglePresentation={onTogglePresentation}
      />
    </span>
  );
}
