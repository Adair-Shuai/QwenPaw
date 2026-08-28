/**
 * registry/Slot.tsx — <Slot name kind children?> layout fill point.
 *
 * - kind="fill": renders `children` (host default) first, then all plugin fills
 *   sorted by topo + order. Callers can opt to use children only as the
 *   no-fill fallback with `suppressChildrenWhenFilled`.
 * - kind="replace": renders the latest plugin replace if any, else `children`.
 *
 * Every plugin-provided render is wrapped in <SlotErrorBoundary> so a single
 * crash logs to audit and degrades to null instead of taking down the whole
 * layout.
 */
import React from "react";
import { useSyncExternalStore } from "react";
import { slotRegistry, subscribe } from "./store";
import type { SlotKind, SlotName } from "./types";
import { auditStore } from "./audit";

interface SlotProps {
  name: SlotName;
  kind: SlotKind;
  /** Host content: composed for fill by default, or used as a fallback. */
  children?: React.ReactNode;
  /** Hide the host default when at least one fill is registered. */
  suppressChildrenWhenFilled?: boolean;
}

export function Slot({
  name,
  kind,
  children,
  suppressChildrenWhenFilled = false,
}: SlotProps) {
  const entries = useSyncExternalStore(subscribe, () =>
    slotRegistry.snapshot(name),
  );

  if (kind === "replace") {
    const replaceEntry = entries.find((e) => e.kind === "replace");
    if (!replaceEntry) return <>{children}</>;
    // Pass `children` (host default) into the plugin render so an
    // agent-/route-aware plugin can `return defaultContent` to opt out
    // of replacement on a per-render basis — mirrors fallback() in
    // chat.{request,response}.render.
    //
    // Also fall back to children when the render itself yields null/
    // undefined (e.g. a plugin that returns null instead of taking the
    // defaultContent path). Either way the slot still paints.
    const rendered = replaceEntry.render(children);
    if (rendered == null) return <>{children}</>;
    return (
      <SlotErrorBoundary slot={name} pluginId={replaceEntry.source}>
        {rendered}
      </SlotErrorBoundary>
    );
  }

  // fill mode
  const visibleFills = entries.filter((e) => e.kind === "fill");
  return (
    <>
      {!suppressChildrenWhenFilled || visibleFills.length === 0
        ? children
        : null}
      {visibleFills.map((e) => (
        <SlotErrorBoundary
          key={e.registrationId}
          slot={name}
          pluginId={e.source}
        >
          {e.render()}
        </SlotErrorBoundary>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SlotErrorBoundary
// ─────────────────────────────────────────────────────────────────────────────

interface BoundaryProps {
  slot: string;
  pluginId: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

interface BoundaryState {
  errored: boolean;
}

export class SlotErrorBoundary extends React.Component<
  BoundaryProps,
  BoundaryState
> {
  state: BoundaryState = { errored: false };

  static getDerivedStateFromError(): BoundaryState {
    return { errored: true };
  }

  componentDidCatch(error: Error): void {
    auditStore.record({
      kind: "slot.error",
      targetId: this.props.slot,
      pluginId: this.props.pluginId,
      detail: error.message,
      timestamp: Date.now(),
    });
  }

  render(): React.ReactNode {
    if (this.state.errored) return this.props.fallback ?? null;
    return this.props.children;
  }
}
