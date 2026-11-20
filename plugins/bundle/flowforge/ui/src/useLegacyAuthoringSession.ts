import { useEffect, useRef, useState } from "react";
import { fingerprint, type Api, type FlowDocument } from "./model";
import type { Proposal, RepairSource } from "./authoringModel";
import type { WorkflowTranslate } from "./i18n";

export function useLegacyAuthoringSession({
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
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [rounds, setRounds] = useState<
    { prompt: string; proposal: Proposal }[]
  >([]);
  const [roundIndex, setRoundIndex] = useState(-1);
  const [selection, setSelection] = useState<string[]>([]);
  const [selectionOnly, setSelectionOnly] = useState(false);
  const [repairSource, setRepairSource] = useState<RepairSource | null>(null);
  const [phase, setPhase] = useState<"generate" | "apply" | null>(null);
  const busy = phase !== null;
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);
  const base = useRef<FlowDocument | null>(null);
  const request = useRef(0);
  const mounted = useRef(true);
  const scope = useRef({ flowId, agentId, userId });
  if (
    scope.current.flowId !== flowId ||
    scope.current.agentId !== agentId ||
    scope.current.userId !== userId
  )
    scope.current = { flowId, agentId, userId };
  const currentRef = useRef(current);
  currentRef.current = current;
  const proposal = rounds[roundIndex]?.proposal || null;
  const stale =
    !!base.current &&
    (!current ||
      fingerprint(base.current) !== fingerprint(current) ||
      base.current.revision !== current.revision);
  const reset = () => {
    ++request.current;
    base.current = null;
    setRounds([]);
    setRoundIndex(-1);
    setPrompt("");
    setError("");
    setPreview(false);
    setRepairSource(null);
    setPhase(null);
  };
  useEffect(() => {
    reset();
    setOpen(false);
    setSelection([]);
    setSelectionOnly(false);
  }, [flowId, agentId, userId]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      ++request.current;
    };
  }, []);
  const show = (ids: string[], forceSelection = false) => {
    if (busy) {
      setOpen(true);
      return;
    }
    const selected = [...ids].sort();
    const changedSelection =
      !selectionOnly || JSON.stringify(selection) !== JSON.stringify(selected);
    if (forceSelection && (changedSelection || stale)) {
      reset();
      setPrompt(prompt);
      setSelection(selected);
      setSelectionOnly(selected.length > 0);
    } else if (!rounds.length && !base.current) {
      setSelection(selected);
      setSelectionOnly(selected.length > 0);
    }
    setOpen(true);
  };
  const setScope = (selected: boolean) => {
    if (selected === selectionOnly) return;
    reset();
    setPrompt(prompt);
    setRepairSource(repairSource);
    setSelectionOnly(selected);
  };
  const generate = async (target?: RepairSource) => {
    if (!current || busy || (!target && stale)) return;
    const text = target
      ? t(
          "分析节点 {id} 的运行失败，依据实际错误与输入输出生成最小修复方案，保留业务目标和其他节点。",
          "Diagnose the recorded failure of node {id} and propose a minimal fix using its actual error, inputs and outputs. Preserve the business goal and other nodes.",
          { id: target.nodeId },
        )
      : prompt.trim();
    if (!text) return;
    if (target) {
      reset();
      setRepairSource(target);
      setOpen(true);
      setPrompt(text);
      if (target.flowId !== flowId || !current.nodes[target.nodeId]) {
        setError(
          t(
            "当前草稿中没有该节点，请先查看对应工作流。",
            "This node is missing from the current draft. Open its workflow first.",
          ),
        );
        return;
      }
      setSelection([target.nodeId]);
      setSelectionOnly(true);
    }
    const source = target || repairSource;
    const original = target
      ? structuredClone(current)
      : base.current || structuredClone(current);
    base.current = original;
    const token = ++request.current;
    const visit = scope.current;
    setPhase("generate");
    setError("");
    try {
      const next = await api<Proposal>("/flowforge/authoring/proposals", {
        method: "POST",
        headers: { "X-Agent-Id": agentId },
        body: JSON.stringify({
          prompt: text,
          flow: original,
          agent_id: agentId,
          selected_node_ids: target
            ? [target.nodeId]
            : selectionOnly
            ? selection
            : null,
          parent_proposal_id: target ? null : proposal?.proposal_id || null,
          ...(source
            ? { repair_run_id: source.runId, repair_node_id: source.nodeId }
            : {}),
        }),
      });
      if (
        !mounted.current ||
        request.current !== token ||
        scope.current !== visit
      )
        return;
      setRounds((list) =>
        target
          ? [{ prompt: text, proposal: next }]
          : [...list, { prompt: text, proposal: next }],
      );
      setRoundIndex(target ? 0 : rounds.length);
      setPrompt("");
      setPreview(true);
    } catch (failure: any) {
      if (
        mounted.current &&
        request.current === token &&
        scope.current === visit
      )
        setError(failure.message);
    } finally {
      if (
        mounted.current &&
        request.current === token &&
        scope.current === visit
      )
        setPhase(null);
    }
  };
  const apply = async () => {
    if (!proposal || !proposal.validation.ok || stale || busy) return;
    const visit = scope.current;
    const token = ++request.current;
    setPhase("apply");
    setError("");
    try {
      const applied = await api<FlowDocument>(
        `/flowforge/authoring/proposals/${encodeURIComponent(
          proposal.proposal_id,
        )}/apply`,
        {
          method: "POST",
          headers: { "X-Agent-Id": agentId },
          body: JSON.stringify({ expected_revision: proposal.base_revision }),
        },
      );
      if (
        !mounted.current ||
        request.current !== token ||
        scope.current !== visit
      )
        return;
      // A save can finish while the user changes the canvas. Keep that draft.
      if (
        !currentRef.current ||
        fingerprint(currentRef.current) !== fingerprint(base.current!)
      ) {
        setError(
          t(
            "方案已保存，当前画布有新的修改，请重新载入后继续。",
            "The proposal was saved. Reload to continue with the newer canvas edits.",
          ),
        );
        return;
      }
      onApplied(applied);
      reset();
      setOpen(false);
    } catch (failure: any) {
      if (
        mounted.current &&
        request.current === token &&
        scope.current === visit
      )
        setError(failure.message);
    } finally {
      if (
        mounted.current &&
        request.current === token &&
        scope.current === visit
      )
        setPhase(null);
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
      setError("");
    },
    selection,
    selectionNodes: selection.map((id) => ({
      id,
      label: current?.nodes[id]?.label || id,
    })),
    selectionOnly,
    setScope,
    busy,
    phase,
    error,
    proposal,
    stale,
    preview,
    setPreview,
    base: base.current,
    generate: () => generate(),
    repairNode: (source: RepairSource) => generate(source),
    repairSource,
    apply,
    reset,
  };
}

export type LegacyAuthoringSession = ReturnType<
  typeof useLegacyAuthoringSession
>;
