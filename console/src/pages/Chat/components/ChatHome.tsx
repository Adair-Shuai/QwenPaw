import { useMemo, useRef, type ComponentProps } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowUpRight,
  FileCheck,
  Files,
  FilePenLine,
  History,
  LoaderCircle,
  Shield,
} from "lucide-react";
import { Tooltip } from "antd";
import { ChatWelcome } from "./ChatWelcome";
import { useSessionListStore } from "@/stores/sessionListStore";
import { useApprovalContext } from "@/contexts/ApprovalContext";
import { useSessionAttention } from "@/hooks/useSessionAttention";
import { buildChatPath } from "@/utils/sessionRoute";
import { setTextareaValue } from "../utils";
import styles from "./ChatHome.module.less";

type Props = ComponentProps<typeof ChatWelcome> & {
  agentId: string;
  currentSessionId?: string;
  customGreeting?: boolean;
};

/** Mounted only through ReadyChatWelcome, after the SDK resolves its history. */
export default function ChatHome({
  agentId,
  currentSessionId,
  customGreeting,
  ...welcome
}: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const root = useRef<HTMLElement>(null);
  // The shared store is cleared synchronously when the selected agent changes.
  const sessions = useSessionListStore((s) => s.sessions);
  const { approvals } = useApprovalContext();
  const unseen = useSessionAttention(agentId, sessions, currentSessionId);
  const recent = useMemo(
    () =>
      sessions
        .filter(
          (s) =>
            !s.archived &&
            !s.archivedAt &&
            s.source !== "cron" &&
            s.source !== "subagent" &&
            s.id !== currentSessionId &&
            !!s.name,
        )
        .slice()
        .sort(
          (a, b) =>
            (Date.parse(b.updatedAt || b.createdAt || "") || 0) -
            (Date.parse(a.updatedAt || a.createdAt || "") || 0),
        )
        .slice(0, 2),
    [sessions, currentSessionId],
  );

  const insert = (query: string) => {
    const host = root.current?.closest("[data-chat-home-host]");
    const input = host?.querySelector<HTMLTextAreaElement>(
      ".qwenpaw-sender textarea, .ant-sender textarea",
    );
    if (!input || input.disabled) return;
    setTextareaValue(
      input,
      `${input.value}${input.value.trim() ? "\n" : ""}${query}`,
    );
    (
      host?.querySelector<HTMLElement>(
        '.qwenpaw-sender [contenteditable="true"]',
      ) ?? input
    ).focus({ preventScroll: true });
  };
  const actions = [
    { id: "check", icon: FileCheck },
    { id: "compare", icon: Files },
    { id: "report", icon: FilePenLine },
  ];
  const prompts = welcome.prompts?.map((item) => {
    const prompt = typeof item === "string" ? { value: item } : item;
    // Preserve registered commands and custom labels; localize only known raw capability IDs.
    const label = prompt.label || prompt.value;
    return {
      ...prompt,
      label:
        label === "computer_use"
          ? t("chat.home.desktop")
          : label === "omp-roles"
          ? t("chat.home.experts")
          : label,
    };
  });

  return (
    <section
      ref={root}
      className={styles.home}
      aria-label={t("chat.home.title")}
    >
      <div className={styles.intro}>
        {typeof welcome.avatar === "string" ? (
          <img src={welcome.avatar} alt="" />
        ) : (
          welcome.avatar
        )}
        <h2>{customGreeting ? welcome.greeting : t("chat.home.title")}</h2>
        <p>{welcome.description || t("chat.home.description")}</p>
      </div>
      {!currentSessionId && recent.length > 0 && (
        <section className={styles.recent} aria-label={t("chat.home.resume")}>
          <h3>{t("chat.home.resume")}</h3>
          <div className={styles.recentGrid}>
            {recent.map((session) => {
              const pending = approvals.some(
                (a) =>
                  (a.owner_agent_id || a.agent_id) === agentId &&
                  !!session.sessionId &&
                  (a.root_session_id || a.session_id) === session.sessionId,
              );
              const running =
                session.status === "running" || session.generating;
              const status = pending
                ? "approval"
                : running
                ? "running"
                : unseen.has(session.id)
                ? "updated"
                : "recent";
              const Icon = pending
                ? Shield
                : running
                ? LoaderCircle
                : unseen.has(session.id)
                ? FileCheck
                : History;
              return (
                <button
                  key={session.id}
                  type="button"
                  className={styles.resumeCard}
                  data-status={status}
                  onClick={() =>
                    navigate(buildChatPath(session.realId || session.id))
                  }
                >
                  <span className={styles.status}>
                    <Icon size={14} aria-hidden="true" />
                    {t(`chat.home.status.${status}`)}
                  </span>
                  <Tooltip title={session.name}>
                    <strong>{session.name}</strong>
                  </Tooltip>
                  <span className={styles.resumeAction}>
                    {t("chat.home.continue")}
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}
      <section className={styles.common} aria-label={t("chat.home.common")}>
        <h3>{t("chat.home.common")}</h3>
        <div className={styles.actions}>
          {actions.map(({ id, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => insert(t(`chat.home.prompts.${id}`))}
            >
              <Icon size={16} aria-hidden="true" />
              {t(`chat.home.actions.${id}`)}
            </button>
          ))}
        </div>
        <span className={styles.hint}>{t("chat.home.draftHint")}</span>
      </section>
      {!!prompts?.length && (
        <section
          className={styles.capabilities}
          aria-label={t("chat.home.capabilities")}
        >
          <h3>{t("chat.home.capabilities")}</h3>
          <ChatWelcome prompts={prompts} onSubmit={welcome.onSubmit} />
        </section>
      )}
    </section>
  );
}
