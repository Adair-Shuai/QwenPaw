/**
 * Welcome prompts injector — injects agent-specific welcome prompts.
 */

import { getHost, clearAgentCache } from "./core/runtime";
import { fetchAgentSkills } from "./core/api";
import { extractPromptFromSkills } from "./expert/expertApi";

// ─── Welcome Prompts Injector ─────────────────────────────────────────────────
//
// A hidden React component registered via QP.chat.rightHeader.add() that
// stays mounted for the lifetime of the chat page.  It uses the host hook
// useSelectedAgent() to react to agent switches, fetches the agent's skills,
// and calls QP.chat.welcome.set() to:
//   1. Always set the UGSci-branded description.
//   2. When the agent has skills, inject { label, value } prompts derived
//      from those skills.
//   3. When the agent has no skills (or fetch fails), fall back to the
//      default prompt "能告诉我你都能做点什么吗".

/** Detect the current UI language (zh / en / ja / ru / vi / id). */
export function detectLocale(): string {
  try {
    const stored = localStorage.getItem("language") || "";
    if (stored) return stored.split("-")[0];
  } catch {}
  const nav = (typeof navigator !== "undefined" ? navigator.language : "") || "";
  return nav.split("-")[0] || "en";
}

/** UGSci welcome description per locale. */
export const UGSCI_DESCRIPTIONS: Record<string, string> = {
  zh: "您好，UGSci 智能助手在线。无论是油气藏分析、数值模拟还是工程决策，描述您的场景，我来交付结果。",
  en: "UGSci AI assistant is online. From reservoir analysis to numerical simulation and engineering decisions — describe your scenario and I'll deliver results.",
  ja: "UGSci AIアシスタントがオンラインです。油層解析、数値シミュレーション、エンジニアリングの意思決定など、シナリオを描写してください。結果をお届けします。",
  ru: "UGSci AI-ассистент онлайн. От анализа пласта до численного моделирования и инженерных решений — опишите свой сценарий, и я предоставлю результат.",
  vi: "Trợ lý AI UGSci đang trực tuyến. Từ phân tích mỏ, mô phỏng số đến ra quyết định kỹ thuật — mô tả kịch bản của bạn, tôi sẽ giao kết quả.",
  id: "Asisten AI UGSci sedang online. Dari analisis reservoir, simulasi numerik hingga keputusan engineering — jelaskan skenario Anda, saya akan memberikan hasilnya.",
};

/** Default prompt per locale (shown when agent has no skills). */
export const UGSCI_DEFAULT_PROMPT: Record<string, { label: string; value: string }> = {
  zh: { label: "能告诉我你都能做点什么吗？", value: "能告诉我你都能做点什么吗" },
  en: { label: "Can you tell me what you can do?", value: "Can you tell me what you can do?" },
  ja: { label: "あなたができることを教えてください", value: "あなたができることを教えてください" },
  ru: { label: "Расскажи, что ты умеешь делать?", value: "Расскажи, что ты умеешь делать?" },
  vi: { label: "Bạn có thể cho tôi biết bạn làm được gì không?", value: "Bạn có thể cho tôi biết bạn làm được gì không?" },
  id: { label: "Bisa cerita apa saja yang bisa Anda lakukan?", value: "Bisa cerita apa saja yang bisa Anda lakukan?" },
};

export function WelcomePromptsInjector() {
  const host = getHost();
  const React = host.React;
  const { useEffect, useRef } = React;

  // useSelectedAgent() is a host hook that returns { id: string }.
  // It re-renders this component whenever the selected agent changes.
  const agentInfo = host.useSelectedAgent ? host.useSelectedAgent() : { id: "default" };
  const agentId = agentInfo?.id || "default";

  // Keep track of the last injected agent so we don't re-fetch unnecessarily.
  const lastInjectedRef = useRef<string | null>(null);
  // Keep the disposable returned by welcome.set() so we can clean up.
  const disposableRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (lastInjectedRef.current === agentId) return;
    lastInjectedRef.current = agentId;

    // Clear all agent-scoped cache entries when the selected agent changes.
    // This prevents stale data from the previous agent from being served
    // within the TTL window after a switch.
    clearAgentCache();

    const locale = detectLocale();
    const description = UGSCI_DESCRIPTIONS[locale] || UGSCI_DESCRIPTIONS.en;
    const defaultPrompt = UGSCI_DEFAULT_PROMPT[locale] || UGSCI_DEFAULT_PROMPT.en;

    let cancelled = false;

    (async () => {
      try {
        const skills = await fetchAgentSkills(agentId);
        if (cancelled) return;

        const promptItems = extractPromptFromSkills(skills);

        // Dispose the previous registration before setting a new one.
        if (disposableRef.current) {
          try { disposableRef.current(); } catch {}
          disposableRef.current = null;
        }

        const QP = (window as any).QwenPaw;
        if (QP?.chat?.welcome) {
          if (promptItems.length > 0) {
            // Agent has skills — inject skill-derived prompts + UGSci description.
            disposableRef.current = QP.chat.welcome.set("ugsci", {
              description,
              prompts: promptItems,
            });
            console.info(
              `[ugsci] Injected ${promptItems.length} welcome prompts for agent "${agentId}"`,
            );
          } else {
            // No skills — use default prompt + UGSci description.
            disposableRef.current = QP.chat.welcome.set("ugsci", {
              description,
              prompts: [defaultPrompt],
            });
            console.info(
              `[ugsci] No skills for agent "${agentId}" — using default prompt`,
            );
          }
        }
      } catch (err) {
        console.warn(
          `[ugsci] Failed to inject welcome prompts for agent "${agentId}":`,
          err,
        );
        // On error, still set the description + default prompt.
        const QP = (window as any).QwenPaw;
        if (QP?.chat?.welcome && !cancelled) {
          if (disposableRef.current) {
            try { disposableRef.current(); } catch {}
            disposableRef.current = null;
          }
          disposableRef.current = QP.chat.welcome.set("ugsci", {
            description,
            prompts: [defaultPrompt],
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [agentId]);

  // Render nothing — this component exists only for its side effect.
  return null;
}

