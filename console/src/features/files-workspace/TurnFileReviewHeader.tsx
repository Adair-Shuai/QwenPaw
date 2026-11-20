import { Dropdown } from "antd";
import {
  Check,
  ChevronDown,
  Columns2,
  PanelRightOpen,
  Rows2,
  WrapText,
} from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import type {
  SessionFilesScope,
  TurnFileEntry,
  TurnFileManifest,
} from "../../api/modules/turnFiles";
import { isDeliveryNativeAvailable } from "./deliveryFileNative";
import DeliveryFileActions from "./DeliveryFileActions";
import { openFilePreview } from "./openFilePreview";
import { turnFileTarget } from "./turnFileTarget";
import styles from "./TurnFileReviewHeader.module.less";

export default function TurnFileReviewHeader({
  scope,
  turn,
  file,
  onSelect,
  split,
  onSplit,
  wrap,
  onWrap,
}: {
  scope: SessionFilesScope;
  turn: TurnFileManifest;
  file: TurnFileEntry;
  onSelect: (file: TurnFileEntry) => void;
  split: boolean;
  onSplit: (split: boolean) => void;
  wrap: boolean;
  onWrap: (wrap: boolean) => void;
}) {
  const { t } = useTranslation();
  const selector = useRef<HTMLButtonElement>(null);
  const target = turnFileTarget(scope, turn, file);
  const available =
    file.status === "deleted" ? file.before_available : file.after_available;
  return (
    <div className={styles.header}>
      <Dropdown
        trigger={["click"]}
        autoFocus
        destroyOnHidden
        placement="bottomLeft"
        overlayClassName={styles.menu}
        overlayStyle={{
          width: "max-content",
          minWidth: 200,
          maxWidth: "min(480px, calc(100vw - 24px))",
        }}
        menu={{
          selectable: true,
          selectedKeys: [file.id],
          items: turn.files.map((item) => ({
            key: item.id,
            label: (
              <span
                className={styles.option}
                title={`${item.root}/${item.path}`}
              >
                <span className={styles.path}>{item.path}</span>
                {!item.binary &&
                  (item.additions != null || item.deletions != null) && (
                    <span className={styles.counts}>
                      <span>+{item.additions ?? 0}</span>
                      <span>−{item.deletions ?? 0}</span>
                    </span>
                  )}
                <Check
                  size={14}
                  aria-hidden="true"
                  style={{
                    visibility: item.id === file.id ? "visible" : "hidden",
                  }}
                />
              </span>
            ),
            onClick: () => {
              onSelect(item);
              selector.current?.focus();
            },
          })),
          onKeyDown: (event) => {
            if (event.key === "Escape") selector.current?.focus();
          },
        }}
      >
        <button
          ref={selector}
          type="button"
          className={styles.selector}
          aria-label={`${t("turnFiles.selectFile")} ${file.name}`}
          title={file.path}
          aria-haspopup="menu"
        >
          <span>{file.path}</span>
          <ChevronDown size={12} />
        </button>
      </Dropdown>
      <div className={styles.tools}>
        <button
          type="button"
          title={t("turnFiles.diffSplit")}
          aria-label={t("turnFiles.diffSplit")}
          aria-pressed={split}
          onClick={() => onSplit(true)}
        >
          <Columns2 size={14} />
        </button>
        <button
          type="button"
          title={t("turnFiles.diffUnified")}
          aria-label={t("turnFiles.diffUnified")}
          aria-pressed={!split}
          onClick={() => onSplit(false)}
        >
          <Rows2 size={14} />
        </button>
        <button
          type="button"
          title={t("turnFiles.diffWrap")}
          aria-label={t("turnFiles.diffWrap")}
          aria-pressed={wrap}
          onClick={() => onWrap(!wrap)}
        >
          <WrapText size={14} />
        </button>
        <button
          type="button"
          title={t("delivery.preview")}
          aria-label={t("delivery.preview")}
          disabled={!available}
          onClick={(event) =>
            openFilePreview(target, event.currentTarget, scope)
          }
        >
          <PanelRightOpen size={14} />
        </button>
        {isDeliveryNativeAvailable() && (
          <DeliveryFileActions
            compact
            name={file.name}
            scope={scope}
            target={target}
            disabled={!available}
            onPreview={(trigger, presentation) =>
              openFilePreview(target, trigger, scope, presentation)
            }
          />
        )}
      </div>
    </div>
  );
}
