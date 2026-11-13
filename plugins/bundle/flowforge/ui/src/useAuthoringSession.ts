import { useEffect, useRef, useState } from "react";
import { fingerprint, type Api, type FlowDocument } from "./model";
import type { Proposal, RepairSource } from "./authoringModel";
import type { WorkflowTranslate } from "./i18n";
import { useLegacyAuthoringSession } from "./useLegacyAuthoringSession";

export type ChatTurn = {
  id: string;
  prompt: string;
  reply?: string;
  error?: string;
  status: string;
  proposal?: Proposal;
  base_flow?: FlowDocument;
  execution_agent_id?: string;
  applied?: FlowDocument;
  verification?: { run_id?: string; status: string; revision: number };
};
type Chat = { id: string; title: string; messages: ChatTurn[] };
export type Experience = {
  fixes?: { proposal_id: string; summary: string; changes: unknown[] }[];
  id: string;
  summary: string;
  status: string;
  evidence: { run_id: string; node_id: string; error?: unknown };
  attempts: { run_id: string; status: string; revision: number }[];
};

export function useAuthoringSession({
  current,
  api,
  flowId,
  agentId,
  userId,
  onApplied,
  t,
}: {
  current: FlowDocument | null;
  api: Api;
  flowId: string;
  agentId: string;
  userId: string;
  onApplied: (flow: FlowDocument) => void;
  t: WorkflowTranslate;
}) {
  const legacy = useLegacyAuthoringSession({
    current,
    api,
    flowId,
    agentId,
    userId,
    onApplied,
    t,
  });
  const [legacyMode, setLegacyMode] = useState(false);
  const [open, setOpen] = useState(false);
  const [prompt, updatePrompt] = useState("");
  const [chat, setChat] = useState<Chat | null>(null);
  const [history, setHistory] = useState<{ id: string; title: string }[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [roundIndex, setRoundIndex] = useState(-1);
  const [selection, setSelection] = useState<string[]>([]);
  const [selectionOnly, setSelectionOnly] = useState(false);
  const [repairSource, setRepairSource] = useState<RepairSource | null>(null);
  const [phase, setPhase] = useState<"generate" | "apply" | "load" | null>(
    null,
  );
  const [mode, setMode] = useState<"auto" | "ask">("auto");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);
  const version = useRef(0);
  const promptRef = useRef(prompt);
  promptRef.current = prompt;
  const latest = useRef(current);
  latest.current = current;
  const identity = `${userId}:${flowId}`;
  const scope = useRef(`${identity}:${agentId}`);
  scope.current = `${identity}:${agentId}`;
  const headers = { "X-Agent-Id": agentId };
  const rounds = (chat?.messages || []).filter(
    (item): item is ChatTurn & { proposal: Proposal } => !!item.proposal,
  );
  const round = rounds[roundIndex];
  const proposal = round?.proposal || null;
  const base = round?.base_flow || null;
  const stale =
    !!proposal &&
    (!base ||
      !current ||
      round.execution_agent_id !== agentId ||
      fingerprint(base) !== fingerprint(current) ||
      base.revision !== current.revision);
  const key = (id: string) => `flowforge-chat-draft:${identity}:${id}`;
  const setPrompt = (text: string) => {
    updatePrompt(text);
    if (chat)
      try {
        localStorage.setItem(key(chat.id), text);
      } catch {
        /* Storage may be unavailable. */
      }
  };
  const installChat = (next: Chat) => {
    setChat(next);
    setRoundIndex(next.messages.filter((item) => !!item.proposal).length - 1);
    setPreview(false);
    try {
      localStorage.setItem(`flowforge-chat-active:${identity}`, next.id);
      updatePrompt(localStorage.getItem(key(next.id)) || "");
    } catch {
      updatePrompt("");
    }
  };
  const load = async (id?: string, fresh = false) => {
    const visit = scope.current;
    const token = ++version.current;
    setPhase("load");
    setError("");
    try {
      const list = await api<{ id: string; title: string }[]>(
        `/flowforge/flows/${encodeURIComponent(flowId)}/conversations`,
        { headers },
      );
      if (!Array.isArray(list)) {
        if (scope.current === visit && version.current === token) {
          setLegacyMode(true);
          legacy.show(selection, selectionOnly);
        }
        return;
      }
      let remembered = "";
      try {
        remembered =
          localStorage.getItem(`flowforge-chat-active:${identity}`) || "";
      } catch {
        /* Optional local preferences. */
      }
      const selected =
        id ||
        (!fresh &&
          (list.find((item) => item.id === remembered)?.id || list[0]?.id));
      const next = selected
        ? await api<Chat>(
            `/flowforge/authoring/conversations/${encodeURIComponent(
              selected,
            )}`,
            { headers },
          )
        : await api<Chat>(
            `/flowforge/flows/${encodeURIComponent(flowId)}/conversations`,
            { method: "POST", headers },
          );
      if (scope.current !== visit || version.current !== token) return;
      setHistory(list);
      installChat(next);
    } catch (failure: any) {
      if (scope.current === visit && version.current === token) {
        if ([404, 405].includes(failure.status)) {
          setLegacyMode(true);
          legacy.show(selection, selectionOnly);
        } else setError(failure.message);
      }
    } finally {
      if (scope.current === visit && version.current === token) setPhase(null);
    }
  };
  useEffect(() => {
    ++version.current;
    setChat(null);
    updatePrompt("");
    setHistory([]);
    setExperience([]);
    setOpen(false);
    setPreview(false);
    setRepairSource(null);
    setPhase(null);
    setError("");
    setSelection([]);
    setSelectionOnly(false);
    return () => {
      ++version.current;
    };
  }, [identity]);
  useEffect(() => {
    if (open && !chat && !phase) void load();
  }, [open, identity]);
  useEffect(() => {
    ++version.current;
    setPhase(null);
    setPreview(false);
  }, [agentId]);
  // Older installed backends retain the proposal-only editor until updated.
  useEffect(() => {
    let cancelled = false;
    void api<unknown>(
      `/flowforge/flows/${encodeURIComponent(flowId)}/conversations`,
      { headers },
    )
      .then((value) => {
        if (!cancelled) setLegacyMode(!Array.isArray(value));
      })
      .catch((failure) => {
        if (!cancelled && [404, 405].includes(failure.status))
          setLegacyMode(true);
      });
    return () => {
      cancelled = true;
    };
  }, [identity]);
  const refreshExperience = async () => {
    const visit = scope.current;
    try {
      const records = await api<Experience[]>(
        `/flowforge/flows/${encodeURIComponent(flowId)}/experience`,
        { headers },
      );
      if (scope.current === visit) setExperience(records);
    } catch (failure: any) {
      if (scope.current === visit) setError(failure.message);
    }
  };
  const show = (ids: string[], forceSelection = false) => {
    setOpen(true);
    if (forceSelection || !chat) {
      setSelection([...ids].sort());
      setSelectionOnly(ids.length > 0);
    }
  };
  const generate = async (source?: RepairSource) => {
    if (!latest.current || phase) return;
    const text = source
      ? t("分析节点 {id} 的运行失败并修复", "Diagnose and repair node {id}", {
          id: source.nodeId,
        })
      : prompt.trim();
    if (!text) return;
    const visit = scope.current;
    const token = ++version.current;
    const draft = structuredClone(latest.current);
    setOpen(true);
    setPhase("generate");
    setError("");
    setPreview(false);
    if (source) {
      setRepairSource(source);
      setSelection([source.nodeId]);
      setSelectionOnly(true);
    }
    try {
      if (!chat) {
        const available = await api<unknown>(
          `/flowforge/flows/${encodeURIComponent(flowId)}/conversations`,
          { headers },
        );
        if (!Array.isArray(available)) {
          if (scope.current === visit && version.current === token) {
            setLegacyMode(true);
            if (source) void legacy.repairNode(source);
            else legacy.show(selection, selectionOnly);
          }
          return;
        }
      }
      const active =
        chat ||
        (await api<Chat>(
          `/flowforge/flows/${encodeURIComponent(flowId)}/conversations`,
          { method: "POST", headers },
        ));
      if (scope.current === visit && version.current === token && !chat)
        setChat(active);
      const next = await api<Chat>(
        `/flowforge/authoring/conversations/${active.id}/messages`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            request_id: crypto.randomUUID(),
            prompt: text,
            flow: draft,
            mode,
            selected_node_ids: source
              ? [source.nodeId]
              : selectionOnly
              ? selection
              : null,
            ...(source
              ? { repair_run_id: source.runId, repair_node_id: source.nodeId }
              : {}),
          }),
        },
      );
      if (scope.current !== visit || version.current !== token) return;
      setChat(next);
      setRoundIndex(next.messages.filter((item) => !!item.proposal).length - 1);
      if (promptRef.current.trim() === text) {
        updatePrompt("");
        try {
          localStorage.removeItem(key(active.id));
        } catch {
          /* Optional local draft. */
        }
      }
      void refreshExperience();
    } catch (failure: any) {
      if (scope.current === visit && version.current === token) {
        if ([404, 405].includes(failure.status)) {
          setLegacyMode(true);
          if (source) void legacy.repairNode(source);
          else legacy.show(selection, selectionOnly);
        } else setError(failure.message);
      }
    } finally {
      if (scope.current === visit && version.current === token) setPhase(null);
    }
  };
  const apply = async () => {
    const turn = rounds[roundIndex];
    if (
      !chat ||
      !turn ||
      stale ||
      phase ||
      turn.applied ||
      !proposal?.validation.ok
    )
      return;
    const visit = scope.current;
    const token = ++version.current;
    const applyingBase = base;
    setPhase("apply");
    setError("");
    try {
      const applied = await api<FlowDocument>(
        `/flowforge/authoring/conversations/${chat.id}/messages/${turn.id}/apply`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ expected_revision: proposal.base_revision }),
        },
      );
      if (scope.current !== visit || version.current !== token) return;
      setChat(
        (previous) =>
          previous && {
            ...previous,
            messages: previous.messages.map((item) =>
              item.id === turn.id ? { ...item, applied } : item,
            ),
          },
      );
      setPreview(false);
      if (
        latest.current &&
        applyingBase &&
        latest.current.revision === applyingBase.revision &&
        fingerprint(latest.current) === fingerprint(applyingBase)
      )
        onApplied(applied);
      else
        setError(
          t(
            "修改已保存，画布有后续编辑，请核对最新版本。",
            "Saved. Review the newer canvas edits.",
          ),
        );
    } catch (failure: any) {
      if (scope.current === visit && version.current === token)
        setError(failure.message);
    } finally {
      if (scope.current === visit && version.current === token) setPhase(null);
    }
  };
  const verify = async (turn: ChatTurn) => {
    if (!chat || !current || phase) return;
    const visit = scope.current;
    setPhase("generate");
    setError("");
    try {
      const next = await api<Chat>(
        `/flowforge/authoring/conversations/${chat.id}/messages/${turn.id}/verify`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ expected_revision: current.revision }),
        },
      );
      if (scope.current === visit) setChat(next);
    } catch (failure: any) {
      if (scope.current === visit) setError(failure.message);
    } finally {
      if (scope.current === visit) setPhase(null);
    }
  };
  useEffect(() => {
    if (
      !open ||
      !chat?.messages.some(
        (turn) =>
          turn.verification &&
          ["running", "pending"].includes(turn.verification.status),
      )
    )
      return;
    const visit = scope.current;
    const timer = window.setInterval(async () => {
      try {
        const next = await api<Chat>(
          `/flowforge/authoring/conversations/${chat.id}`,
          { headers },
        );
        if (scope.current === visit) {
          setChat(next);
          void refreshExperience();
        }
      } catch {
        /* A later poll can restore a temporary connection failure. */
      }
    }, 2000);
    return () => window.clearInterval(timer);
  }, [
    open,
    chat?.id,
    JSON.stringify(chat?.messages.map((turn) => turn.verification?.status)),
  ]);
  const saveExperience = async (
    record: Experience,
    summary: string,
    invalidated = false,
  ) => {
    const visit = scope.current;
    try {
      await api(
        `/flowforge/flows/${encodeURIComponent(
          flowId,
        )}/experience/${encodeURIComponent(record.id)}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({
            summary,
            status: invalidated ? "invalidated" : "observed",
          }),
        },
      );
      if (scope.current === visit) await refreshExperience();
    } catch (failure: any) {
      if (scope.current === visit) setError(failure.message);
    }
  };
  return {
    open,
    setOpen,
    show,
    prompt,
    setPrompt,
    rounds,
    roundIndex,
    selectRound: (index: number) => {
      setRoundIndex(index);
      setPreview(true);
    },
    selection,
    selectionNodes: selection.map((id) => ({
      id,
      label: current?.nodes[id]?.label || id,
    })),
    selectionOnly,
    setScope: setSelectionOnly,
    busy: phase !== null,
    phase,
    error,
    proposal,
    stale,
    preview,
    setPreview,
    base,
    generate: () => generate(),
    repairNode: (source: RepairSource) => generate(source),
    repairSource,
    apply,
    reset: () => load(undefined, true),
    history,
    load,
    chat,
    experience,
    refreshExperience,
    saveExperience,
    mode,
    setMode,
    agentId,
    verify,
    legacy: legacyMode ? legacy : null,
    ...(legacyMode
      ? {
          open: legacy.open,
          setOpen: legacy.setOpen,
          show: legacy.show,
          busy: legacy.busy,
          phase: legacy.phase,
          proposal: legacy.proposal,
          stale: legacy.stale,
          preview: legacy.preview,
          setPreview: legacy.setPreview,
          base: legacy.base,
          repairNode: legacy.repairNode,
          apply: legacy.apply,
        }
      : {}),
  };
}
export type AuthoringSession = ReturnType<typeof useAuthoringSession>;
