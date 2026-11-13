import { useEffect, useRef, useState } from "react";
import { fingerprint, type Api, type FlowDocument } from "./model";
import type { Proposal, RepairSource } from "./authoringModel";
import type { WorkflowTranslate } from "./i18n";
import { useLegacyAuthoringSession } from "./useLegacyAuthoringSession";

export type NodeReference = { id: string; label: string };

export type ChatTurn = {
  references?: NodeReference[];
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

const MAX_OPEN_CONVERSATIONS = 10;

type Phase = "generate" | "apply" | "verify" | null;
type SessionState = {
  chat: Chat | null;
  prompt: string;
  selection: string[];
  selectionOnly: boolean;
  mode: "auto" | "ask";
  roundIndex: number;
  preview: boolean;
  repairSource: RepairSource | null;
  phase: Phase;
  error: string;
  unread: boolean;
  needsRefresh: boolean;
};
function emptySession(chat: Chat | null = null): SessionState {
  return {
    chat,
    prompt: "",
    selection: [],
    selectionOnly: false,
    mode: "auto",
    roundIndex:
      (chat?.messages.filter((item) => !!item.proposal).length || 0) - 1,
    preview: false,
    repairSource: null,
    phase: null,
    error: "",
    unread: false,
    needsRefresh: false,
  };
}

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
  const legacyDetected = useRef(false);
  const setCompatibility = (value: boolean) => {
    legacyDetected.current = value;
    setLegacyMode(value);
  };
  const [open, setOpen] = useState(false);
  const [sessions, setSessions] = useState<Record<string, SessionState>>({
    "": emptySession(),
  });
  const records = useRef(sessions);
  const [activeId, setActiveId] = useState("");
  const activeIdRef = useRef(activeId);
  const [tabIds, setTabIds] = useState<string[]>([]);
  const tabs = useRef(tabIds);
  const [history, setHistory] = useState<{ id: string; title: string }[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [navigating, setNavigating] = useState(false);
  const navigationBusy = useRef(false);
  const navigation = useRef(0);
  const [navigationError, setNavigationError] = useState("");
  const [applying, setApplying] = useState(false);
  const applyLock = useRef(false);
  const operations = useRef<Record<string, number>>({});
  const latest = useRef(current);
  latest.current = current;
  const identity = `${userId}:${flowId}`;
  const visit = useRef({ key: `${identity}:${agentId}`, epoch: 0 });
  if (visit.current.key !== `${identity}:${agentId}`)
    visit.current = {
      key: `${identity}:${agentId}`,
      epoch: visit.current.epoch + 1,
    };
  const isCurrent = (epoch: number) => visit.current.epoch === epoch;
  const headers = { "X-Agent-Id": agentId };
  const state = sessions[activeId] || sessions[""] || emptySession();
  const {
    chat,
    prompt,
    selection,
    selectionOnly,
    mode,
    roundIndex,
    preview,
    repairSource,
  } = state;
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
  const serverGenerating = !!chat?.messages.some(
    (turn) => turn.status === "running",
  );
  const phase = navigating
    ? "load"
    : state.phase || (serverGenerating ? "generate" : null);
  const storageKey = (kind: string, id: string) =>
    `flowforge-chat-${kind}:${identity}:${id}`;
  const persist = (kind: string, id: string, value: string) => {
    try {
      localStorage.setItem(storageKey(kind, id), value);
    } catch {
      /* Optional local preferences. */
    }
  };
  const replaceSessions = (next: Record<string, SessionState>) => {
    records.current = next;
    setSessions(next);
  };
  const update = (id: string, change: Partial<SessionState>) => {
    if (records.current[id])
      replaceSessions({
        ...records.current,
        [id]: { ...records.current[id], ...change },
      });
  };
  const rememberTabs = (ids: string[]) => {
    const next = ids.slice(0, MAX_OPEN_CONVERSATIONS);
    tabs.current = next;
    setTabIds(next);
    try {
      localStorage.setItem(
        `flowforge-chat-tabs:${identity}`,
        JSON.stringify(next),
      );
    } catch {
      /* Optional local preferences. */
    }
  };
  const includeTab = (id: string) => {
    if (!tabs.current.includes(id)) rememberTabs([...tabs.current, id]);
  };
  const activate = (id: string) => {
    ++navigation.current;
    navigationBusy.current = false;
    setNavigating(false);
    setNavigationError("");
    activeIdRef.current = id;
    setActiveId(id);
    update(id, { unread: false });
    try {
      localStorage.setItem(`flowforge-chat-active:${identity}`, id);
    } catch {
      /* Optional local preferences. */
    }
  };
  const install = (next: Chat, initial: SessionState = emptySession()) => {
    const previous = records.current[next.id];
    if (previous) return;
    const restored = {
      ...emptySession(next),
      prompt: initial.prompt,
      selection: initial.selection,
      selectionOnly: initial.selectionOnly,
      mode: initial.mode,
    };
    try {
      restored.prompt =
        localStorage.getItem(storageKey("draft", next.id)) ?? initial.prompt;
      const savedMode = localStorage.getItem(storageKey("mode", next.id));
      if (savedMode === "auto" || savedMode === "ask")
        restored.mode = savedMode;
    } catch {
      /* Keep the in-memory draft. */
    }
    try {
      const saved = localStorage.getItem(storageKey("references", next.id));
      if (saved) {
        const ids: unknown = JSON.parse(saved);
        if (Array.isArray(ids))
          restored.selection = [
            ...new Set(
              ids.filter((id): id is string => typeof id === "string"),
            ),
          ].slice(0, 200);
      }
    } catch {
      /* A damaged context cache must not discard the message draft. */
    }
    restored.selectionOnly = restored.selection.length > 0;
    replaceSessions({ ...records.current, [next.id]: restored });
    setHistory((items) =>
      items.some((item) => item.id === next.id)
        ? items
        : [...items, { id: next.id, title: next.title }],
    );
  };
  const receive = (id: string, next: Chat, selectLatest = false) => {
    const previous = records.current[id];
    if (!previous) return;
    const changed =
      JSON.stringify(previous.chat?.messages) !== JSON.stringify(next.messages);
    const lastRound =
      next.messages.filter((item) => !!item.proposal).length - 1;
    const resumed = next.messages.find(
      (item) =>
        item.status === "completed" &&
        previous.chat?.messages.some(
          (old) => old.id === item.id && old.status === "running",
        ),
    );
    const clearDraft =
      !!resumed && previous.prompt.trim() === resumed.prompt.trim();
    update(id, {
      prompt: clearDraft ? "" : previous.prompt,
      chat: next,
      needsRefresh: false,
      roundIndex:
        selectLatest || previous.roundIndex < 0
          ? lastRound
          : Math.min(previous.roundIndex, lastRound),
      unread: previous.unread || (changed && activeIdRef.current !== id),
    });
    if (clearDraft) persist("draft", id, "");
    setHistory((items) =>
      items.map((item) => (item.id === id ? { id, title: next.title } : item)),
    );
  };
  const setPrompt = (text: string) => {
    const id = activeIdRef.current;
    update(id, { prompt: text });
    if (id) persist("draft", id, text);
  };
  const setReferences = (ids: string[], id = activeIdRef.current) => {
    update(id, { selection: ids, selectionOnly: ids.length > 0 });
    if (id) persist("references", id, JSON.stringify(ids));
  };
  const setMode = (value: "auto" | "ask") => {
    const id = activeIdRef.current;
    update(id, { mode: value });
    if (id) persist("mode", id, value);
  };
  const fallback = (initial = records.current[activeIdRef.current]) => {
    setCompatibility(true);
    legacy.show(initial?.selection || [], !!initial?.selectionOnly);
  };
  const load = async (id?: string, fresh = false): Promise<Chat | null> => {
    if (
      (fresh || (id && !tabs.current.includes(id))) &&
      tabs.current.length >= MAX_OPEN_CONVERSATIONS
    ) {
      setNavigationError(
        t(
          "最多打开 {count} 个会话，请切换已有会话。",
          "You can open up to {count} conversations. Switch to an existing conversation.",
          { count: MAX_OPEN_CONVERSATIONS },
        ),
      );
      return null;
    }
    if (id && records.current[id]?.chat) {
      const epoch = visit.current.epoch;
      const token = operations.current[id];
      const cached = records.current[id];
      includeTab(id);
      activate(id);
      if (!cached.phase) {
        try {
          const next = await api<Chat>(
            `/flowforge/authoring/conversations/${encodeURIComponent(id)}`,
            { headers },
          );
          if (
            isCurrent(epoch) &&
            operations.current[id] === token &&
            !records.current[id]?.phase
          ) {
            receive(id, next);
            update(id, { error: "" });
          }
        } catch (failure: any) {
          if (isCurrent(epoch) && operations.current[id] === token)
            update(id, { error: failure.message });
        }
      }
      return cached.chat;
    }
    if (navigationBusy.current) return null;
    const epoch = visit.current.epoch;
    const token = ++navigation.current;
    navigationBusy.current = true;
    setNavigating(true);
    setNavigationError("");
    try {
      const list = await api<{ id: string; title: string }[]>(
        `/flowforge/flows/${encodeURIComponent(flowId)}/conversations`,
        { headers },
      );
      if (!isCurrent(epoch)) return null;
      if (!Array.isArray(list)) {
        fallback();
        return null;
      }
      setHistory(list);
      let remembered = "";
      let rememberedTabs: unknown = [];
      try {
        remembered =
          localStorage.getItem(`flowforge-chat-active:${identity}`) || "";
        rememberedTabs = JSON.parse(
          localStorage.getItem(`flowforge-chat-tabs:${identity}`) || "[]",
        );
      } catch {
        /* Optional local preferences. */
      }
      const selected =
        id ||
        (!fresh &&
          (list.find((item) => item.id === remembered)?.id || list[0]?.id));
      const wanted =
        !tabs.current.length && !fresh && Array.isArray(rememberedTabs)
          ? [
              ...new Set(
                rememberedTabs.filter(
                  (item): item is string =>
                    typeof item === "string" &&
                    list.some((entry) => entry.id === item),
                ),
              ),
            ]
          : [...tabs.current];
      wanted.splice(MAX_OPEN_CONVERSATIONS);
      if (selected && !wanted.includes(selected)) {
        if (wanted.length === MAX_OPEN_CONVERSATIONS) wanted.pop();
        wanted.push(selected);
      }
      const initial =
        !fresh && !activeIdRef.current ? records.current[""] : emptySession();
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
      if (!isCurrent(epoch)) return null;
      install(next, initial);
      if (!wanted.includes(next.id)) wanted.push(next.id);
      rememberTabs([...new Set([...tabs.current, ...wanted])]);
      if (navigation.current === token) activate(next.id);
      // Restore the other open conversations so their pending work can be polled.
      const missing = wanted.filter(
        (item) => item !== next.id && !records.current[item],
      );
      await Promise.allSettled(
        missing.map(async (item) => {
          const restored = await api<Chat>(
            `/flowforge/authoring/conversations/${encodeURIComponent(item)}`,
            { headers },
          );
          if (isCurrent(epoch)) install(restored);
        }),
      );
      return next;
    } catch (failure: any) {
      if (isCurrent(epoch) && navigation.current === token) {
        if ([404, 405].includes(failure.status)) fallback();
        else setNavigationError(failure.message);
      }
      return null;
    } finally {
      if (isCurrent(epoch) && navigation.current === token) {
        navigationBusy.current = false;
        setNavigating(false);
      }
    }
  };
  const reset = () => {
    const lastId = tabs.current[tabs.current.length - 1];
    const last = records.current[lastId];
    if (
      lastId &&
      (!last?.chat || (!last.phase && last.chat.messages.length === 0))
    )
      return load(lastId);
    return load(undefined, true);
  };
  const refreshHistory = async () => {
    const epoch = visit.current.epoch;
    try {
      const list = await api<{ id: string; title: string }[]>(
        `/flowforge/flows/${encodeURIComponent(flowId)}/conversations`,
        { headers },
      );
      if (isCurrent(epoch) && Array.isArray(list)) setHistory(list);
    } catch (failure: any) {
      if (isCurrent(epoch)) setNavigationError(failure.message);
    }
  };
  useEffect(() => {
    replaceSessions({ "": emptySession() });
    operations.current = {};
    activeIdRef.current = "";
    setActiveId("");
    tabs.current = [];
    setTabIds([]);
    setHistory([]);
    setExperience([]);
    setOpen(false);
    navigationBusy.current = false;
    setNavigating(false);
    setNavigationError("");
    applyLock.current = false;
    setApplying(false);
  }, [identity]);
  useEffect(() => {
    for (const [id, item] of Object.entries(records.current))
      update(id, { phase: null, preview: false, needsRefresh: !!item.chat });
    navigationBusy.current = false;
    setNavigating(false);
    applyLock.current = false;
    setApplying(false);
  }, [agentId]);
  useEffect(() => {
    if (open && !activeIdRef.current && !navigationBusy.current) void load();
  }, [open, identity]);
  useEffect(
    () => () => {
      visit.current.epoch += 1;
    },
    [],
  );
  useEffect(() => {
    let cancelled = false;
    void api<unknown>(
      `/flowforge/flows/${encodeURIComponent(flowId)}/conversations`,
      { headers },
    )
      .then((value) => {
        if (!cancelled) setCompatibility(!Array.isArray(value));
      })
      .catch((failure) => {
        if (!cancelled && [404, 405].includes(failure.status))
          setCompatibility(true);
      });
    return () => {
      cancelled = true;
    };
  }, [identity]);
  const refreshExperience = async () => {
    const epoch = visit.current.epoch;
    const id = activeIdRef.current;
    try {
      const value = await api<Experience[]>(
        `/flowforge/flows/${encodeURIComponent(flowId)}/experience`,
        { headers },
      );
      if (isCurrent(epoch)) setExperience(value);
    } catch (failure: any) {
      if (isCurrent(epoch)) update(id, { error: failure.message });
    }
  };
  const show = (ids: string[], forceSelection = false) => {
    setOpen(true);
    if (forceSelection || !activeIdRef.current) setReferences([...ids].sort());
  };
  const begin = (id: string, operation: Phase) => {
    const token = (operations.current[id] || 0) + 1;
    operations.current[id] = token;
    update(id, { phase: operation, error: "", preview: false });
    return token;
  };
  const owns = (id: string, epoch: number, token: number) =>
    isCurrent(epoch) &&
    operations.current[id] === token &&
    !!records.current[id];
  const generate = async (source?: RepairSource) => {
    if (!latest.current) return;
    const epoch = visit.current.epoch;
    const initial = records.current[activeIdRef.current] || records.current[""];
    if (
      initial.phase ||
      initial.chat?.messages.some((turn) => turn.status === "running") ||
      navigationBusy.current
    )
      return;
    const text = source
      ? t("分析节点 {id} 的运行失败并修复", "Diagnose and repair node {id}", {
          id: source.nodeId,
        })
      : initial.prompt.trim();
    if (!text) return;
    const draft = structuredClone(latest.current);
    setOpen(true);
    const active = initial.chat || (await load());
    if (!isCurrent(epoch)) return;
    if (!active) {
      if (source && legacyDetected.current) void legacy.repairNode(source);
      return;
    }
    const id = active.id;
    const currentState = records.current[id];
    if (currentState.phase) return;
    const token = begin(id, "generate");
    const ids = source
      ? [source.nodeId]
      : currentState.selectionOnly
      ? [...currentState.selection]
      : null;
    if (source) {
      setReferences([source.nodeId], id);
      update(id, { repairSource: source });
    }
    persist("references", id, JSON.stringify(ids || []));
    try {
      const next = await api<Chat>(
        `/flowforge/authoring/conversations/${id}/messages`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            request_id: crypto.randomUUID(),
            prompt: text,
            flow: draft,
            mode: currentState.mode,
            selected_node_ids: ids,
            ...(source
              ? { repair_run_id: source.runId, repair_node_id: source.nodeId }
              : {}),
          }),
        },
      );
      if (!owns(id, epoch, token)) return;
      receive(id, next, true);
      if (records.current[id].prompt.trim() === text) {
        update(id, { prompt: "" });
        persist("draft", id, "");
      }
      void refreshExperience();
    } catch (failure: any) {
      if (owns(id, epoch, token))
        update(id, {
          error: failure.message,
          unread: activeIdRef.current !== id,
        });
    } finally {
      if (owns(id, epoch, token)) update(id, { phase: null });
    }
  };
  const apply = async () => {
    const id = activeIdRef.current;
    const turn = rounds[roundIndex];
    if (
      !chat ||
      !turn ||
      stale ||
      phase !== null ||
      navigationBusy.current ||
      applyLock.current ||
      turn.applied ||
      !proposal?.validation.ok
    )
      return;
    const epoch = visit.current.epoch;
    const token = begin(id, "apply");
    const applyingBase = base;
    applyLock.current = true;
    setApplying(true);
    try {
      const applied = await api<FlowDocument>(
        `/flowforge/authoring/conversations/${id}/messages/${turn.id}/apply`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ expected_revision: proposal.base_revision }),
        },
      );
      if (!owns(id, epoch, token)) return;
      const previous = records.current[id].chat!;
      receive(id, {
        ...previous,
        messages: previous.messages.map((item) =>
          item.id === turn.id ? { ...item, applied } : item,
        ),
      });
      update(id, { preview: false });
      if (
        latest.current &&
        applyingBase &&
        latest.current.revision === applyingBase.revision &&
        fingerprint(latest.current) === fingerprint(applyingBase)
      )
        onApplied(applied);
      else
        update(id, {
          error: t(
            "修改已保存，画布有后续编辑，请核对最新版本。",
            "Saved. Review the newer canvas edits.",
          ),
        });
    } catch (failure: any) {
      if (owns(id, epoch, token))
        update(id, {
          error: failure.message,
          unread: activeIdRef.current !== id,
        });
    } finally {
      if (owns(id, epoch, token)) update(id, { phase: null });
      if (isCurrent(epoch)) {
        applyLock.current = false;
        setApplying(false);
      }
    }
  };
  const verify = async (turn: ChatTurn) => {
    const id = activeIdRef.current;
    if (!chat || !current || phase !== null || navigationBusy.current) return;
    const epoch = visit.current.epoch;
    const token = begin(id, "verify");
    try {
      const next = await api<Chat>(
        `/flowforge/authoring/conversations/${id}/messages/${turn.id}/verify`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ expected_revision: current.revision }),
        },
      );
      if (owns(id, epoch, token)) receive(id, next);
    } catch (failure: any) {
      if (owns(id, epoch, token))
        update(id, {
          error: failure.message,
          unread: activeIdRef.current !== id,
        });
    } finally {
      if (owns(id, epoch, token)) update(id, { phase: null });
    }
  };
  const pollingIds = tabIds.filter((id) => {
    const item = sessions[id];
    return (
      item &&
      !item.phase &&
      (item.needsRefresh ||
        item.chat?.messages.some(
          (turn) =>
            turn.status === "running" ||
            (turn.verification &&
              ["running", "pending"].includes(turn.verification.status)),
        ))
    );
  });
  useEffect(() => {
    if (!pollingIds.length) return;
    const epoch = visit.current.epoch;
    let cancelled = false;
    const refresh = async () => {
      await Promise.allSettled(
        pollingIds.map(async (id) => {
          const token = operations.current[id];
          try {
            const next = await api<Chat>(
              `/flowforge/authoring/conversations/${encodeURIComponent(id)}`,
              { headers },
            );
            if (
              !cancelled &&
              isCurrent(epoch) &&
              operations.current[id] === token &&
              !records.current[id]?.phase
            )
              receive(id, next);
          } catch {
            /* A later poll can restore a temporary connection failure. */
          }
        }),
      );
      if (!cancelled && isCurrent(epoch)) void refreshExperience();
    };
    const timer = window.setInterval(refresh, 2000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [JSON.stringify(pollingIds), identity, agentId]);
  const saveExperience = async (
    record: Experience,
    summary: string,
    invalidated = false,
  ) => {
    const epoch = visit.current.epoch;
    const id = activeIdRef.current;
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
      if (isCurrent(epoch)) await refreshExperience();
    } catch (failure: any) {
      if (isCurrent(epoch)) update(id, { error: failure.message });
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
    selectRound: (index: number) =>
      update(activeIdRef.current, { roundIndex: index, preview: true }),
    selection,
    selectionNodes: selection.map((id) => ({
      id,
      label: current?.nodes[id]?.label || id,
    })),
    selectionOnly,
    removeReference: (id: string) =>
      setReferences(selection.filter((item) => item !== id)),
    setScope: (value: boolean) =>
      update(activeIdRef.current, { selectionOnly: value }),
    busy: phase !== null,
    phase,
    error: state.error || navigationError,
    proposal,
    stale,
    preview,
    setPreview: (value: boolean) =>
      update(activeIdRef.current, { preview: value }),
    base,
    generate: () => generate(),
    repairNode: (source: RepairSource) => generate(source),
    repairSource,
    apply,
    applying,
    verify,
    reset,
    history,
    load,
    refreshHistory,
    chat,
    tabs: tabIds.map((id, index) => ({
      id,
      number: index + 1,
      title:
        sessions[id]?.chat?.title ||
        history.find((item) => item.id === id)?.title ||
        t("新对话", "New conversation"),
      active: id === activeId,
      busy:
        !!sessions[id]?.phase ||
        !!sessions[id]?.chat?.messages.some(
          (turn) =>
            turn.status === "running" ||
            (turn.verification &&
              ["running", "pending"].includes(turn.verification.status)),
        ),
      unread: !!sessions[id]?.unread,
      error:
        !!sessions[id]?.error ||
        sessions[id]?.chat?.messages.slice(-1)[0]?.status === "failed",
    })),
    navigating,
    experience,
    refreshExperience,
    saveExperience,
    mode,
    setMode,
    agentId,
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
