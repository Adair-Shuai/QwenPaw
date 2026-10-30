import { useTranslation } from "react-i18next";
import { setTextareaValue } from "../utils";
import styles from "../index.module.less";

/** Opens the existing mention controller; it does not send or assign a task. */
export default function ComposerAgentButton() {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className={styles.pageAgentControl}
      aria-label={t("chat.assignAgent", "Assign Agent")}
      onMouseDown={(event) => event.preventDefault()}
      onClick={(event) => {
        const sender = event.currentTarget.closest(
          ".qwenpaw-sender, .ant-sender",
        );
        const textarea = sender?.querySelector("textarea");
        if (!(textarea instanceof HTMLTextAreaElement)) return;
        const separator =
          textarea.value && !/\s$/.test(textarea.value) ? " " : "";
        setTextareaValue(textarea, `${textarea.value}${separator}@`);
        const editor = sender?.querySelector<HTMLElement>(
          '[contenteditable="true"]',
        );
        (editor ?? textarea).focus();
      }}
    >
      @<span> Agent</span>
    </button>
  );
}
