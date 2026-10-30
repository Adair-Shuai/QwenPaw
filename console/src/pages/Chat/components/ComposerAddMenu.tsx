import { useEffect, useRef, useState, type ReactNode } from "react";
import { Popover } from "antd";
import {
  Archive,
  ArrowLeft,
  ArrowRight,
  Blocks,
  ListChecks,
  Paperclip,
  Plus,
  SquarePen,
  Target,
  UserRound,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/useIsMobile";
import { setTextareaValue } from "../utils";
import styles from "./ComposerAddMenu.module.less";

export interface ComposerCommand {
  command: string;
  value: string;
  description?: string;
}

/** Uses the SDK's upload trigger and mention/command input paths. Never submits. */
export default function ComposerAddMenu({
  commands,
  allowAgent = false,
  uploadEnabled = false,
  attachmentTooltip,
  disabled = false,
}: {
  commands: ComposerCommand[];
  allowAgent?: boolean;
  uploadEnabled?: boolean;
  attachmentTooltip?: string;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [allCommands, setAllCommands] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const upload = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(
      () => panel.current?.querySelector<HTMLButtonElement>("button")?.focus(),
    );
    return () => cancelAnimationFrame(frame);
  }, [open, allCommands]);

  const close = (restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) trigger.current?.focus({ preventScroll: true });
  };
  const insert = (value: string) => {
    const sender = trigger.current?.closest(".qwenpaw-sender, .ant-sender");
    const textarea = sender?.querySelector("textarea");
    if (!(textarea instanceof HTMLTextAreaElement)) return;
    const original = textarea.value;
    const next =
      value === "@"
        ? `${original}${original && !/\s$/.test(original) ? " " : ""}@`
        : `${value} ${original.replace(/^\/[\w-]*(?:\s+|$)/, "")}`;
    close();
    setTextareaValue(textarea, next);
    (
      sender?.querySelector<HTMLElement>('[contenteditable="true"]') ?? textarea
    ).focus({ preventScroll: true });
  };

  const preferred = ["/new", "/compact", "/skills", "/goal"];
  const common = preferred.flatMap((name) =>
    commands.filter((command) => command.command === name),
  );
  const visibleCommands = allCommands
    ? commands
    : common.length
    ? common
    : commands.slice(0, 4);
  const hints: Record<string, { label: string; icon: ReactNode }> = {
    "/new": {
      label: t("chat.composer.commandHints.new"),
      icon: <SquarePen size={16} />,
    },
    "/compact": {
      label: t("chat.composer.commandHints.compact"),
      icon: <Archive size={16} />,
    },
    "/skills": {
      label: t("chat.composer.commandHints.skills"),
      icon: <Blocks size={16} />,
    },
    "/goal": {
      label: t("chat.composer.commandHints.goal"),
      icon: <Target size={16} />,
    },
  };

  const content = (
    <div
      ref={panel}
      className={styles.panel}
      role="dialog"
      aria-label={t(
        allCommands ? "chat.composer.allCommands" : "chat.composer.addContent",
      )}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        // Portal events must not reach the SDK Upload or sender shortcuts.
        event.stopPropagation();
        if (event.key === "Escape") {
          event.preventDefault();
          close(true);
        }
      }}
    >
      <div className={styles.heading}>
        {allCommands ? (
          <button
            type="button"
            className={styles.icon}
            aria-label={t("common.back")}
            onClick={() => setAllCommands(false)}
          >
            <ArrowLeft size={16} />
          </button>
        ) : null}
        <span>
          {t(
            allCommands
              ? "chat.composer.allCommands"
              : "chat.composer.addContent",
          )}
        </span>
        <button
          type="button"
          className={styles.icon}
          aria-label={t("common.close")}
          onClick={() => close(true)}
        >
          <X size={16} />
        </button>
      </div>
      <div className={styles.items}>
        {!allCommands && uploadEnabled && (
          <button
            type="button"
            className={styles.item}
            aria-label={t("chat.composer.attach")}
            title={attachmentTooltip}
            onClick={() => {
              // The hidden trigger remains inside the original SDK Upload.
              // Its native click preserves validation, upload state and file headers.
              upload.current?.click();
              close();
            }}
          >
            <Paperclip size={16} />
            <span className={styles.name}>{t("chat.composer.addFile")}</span>
            <small>{t("chat.composer.fileHint")}</small>
          </button>
        )}
        {!allCommands && allowAgent && (
          <button
            type="button"
            className={styles.item}
            aria-label={t("chat.assignAgent")}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => insert("@")}
          >
            <UserRound size={16} />
            <span className={styles.name}>{t("chat.composer.agent")}</span>
            <small>{t("chat.composer.agentHint")}</small>
          </button>
        )}
        {!allCommands && visibleCommands.length > 0 && (
          <div className={styles.groupLabel}>
            {t("chat.composer.commonCommands")}
          </div>
        )}
        {visibleCommands.map((command) => (
          <button
            key={command.value}
            type="button"
            className={styles.item}
            aria-label={command.command}
            title={command.description}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => insert(command.command)}
          >
            {hints[command.command]?.icon ?? <ListChecks size={16} />}
            <span className={styles.name}>{command.command}</span>
            <small>
              {hints[command.command]?.label ?? command.description}
            </small>
          </button>
        ))}
        {!allCommands && commands.length > 0 && (
          <button
            type="button"
            className={styles.item}
            onClick={() => setAllCommands(true)}
          >
            <ArrowRight size={16} />
            <span className={styles.name}>
              {t("chat.composer.allCommands")}
            </span>
            <small>{t("chat.composer.allCommandsHint")}</small>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Popover
        arrow={false}
        placement={isMobile ? "top" : "topLeft"}
        trigger="click"
        open={open && !disabled}
        onOpenChange={(next) => {
          if (disabled) return;
          setOpen(next);
          if (next) setAllCommands(false);
        }}
        content={content}
        classNames={{ root: styles.overlay }}
        autoAdjustOverflow
      >
        <button
          ref={trigger}
          type="button"
          className={styles.trigger}
          aria-label={t("chat.composer.addContent")}
          aria-haspopup="dialog"
          aria-expanded={open && !disabled}
          disabled={disabled}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <Plus size={18} />
        </button>
      </Popover>
      {uploadEnabled && (
        <button
          ref={upload}
          type="button"
          hidden
          style={{ display: "none" }}
          aria-hidden="true"
          tabIndex={-1}
          data-composer-upload-proxy
        />
      )}
    </>
  );
}
