/** Instance-scoped command transport. Disposal prevents late commands and ACKs. */
import type { ViewerMountOptions } from "../contracts/types";
import { ApiClient } from "../api/client";

interface CommandEnvelope { commandId: string; command: string; args?: Record<string, unknown> }
export interface CommandBridgeOptions extends ViewerMountOptions {
  viewerId: string;
  execute(command: string, args: Record<string, unknown>): Promise<unknown>;
  onCommandError?(message: string): void;
  intervalMs?: number;
}
type Outcome = { status: "completed" | "failed"; result?: unknown; error?: string };

export class ViewerCommandBridge {
  private api: ApiClient;
  private timer: number | null = null;
  private controller = new AbortController();
  private polling = false;
  private active = false;
  private outcomes = new Map<string, Outcome>();
  private pendingAcknowledgements = new Map<string, Outcome>();
  private readonly options: CommandBridgeOptions;

  constructor(options: CommandBridgeOptions) {
    this.options = options;
    this.api = new ApiClient(options.apiBase, options.authToken, options);
  }
  start(): void {
    if (this.active) return;
    this.active = true;
    if (this.controller.signal.aborted) this.controller = new AbortController();
    void this.poll();
    this.timer = window.setInterval(() => { void this.poll(); }, this.options.intervalMs ?? 750);
  }
  update(options: Partial<ViewerMountOptions>): void {
    this.controller.abort();
    this.controller = new AbortController();
    this.polling = false;
    this.outcomes.clear();
    this.pendingAcknowledgements.clear();
    this.api.update(options);
  }
  dispose(): void {
    this.active = false;
    this.controller.abort();
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    this.outcomes.clear();
    this.pendingAcknowledgements.clear();
  }
  private async flushAcknowledgements(controller: AbortController): Promise<void> {
    for (const [id, outcome] of this.pendingAcknowledgements) {
      if (controller.signal.aborted || !this.active) return;
      try {
        await this.api.request(`/commands/${encodeURIComponent(id)}/ack`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(outcome), signal: controller.signal,
        });
        if (controller === this.controller) this.pendingAcknowledgements.delete(id);
      } catch (error) {
        if (!controller.signal.aborted) console.debug("[oilgas-vis] Command acknowledgement pending:", error);
      }
    }
  }
  private async poll(): Promise<void> {
    if (!this.active || this.polling) return;
    const controller = this.controller;
    this.polling = true;
    try {
      // The server delivers each command once per viewer. Retry failed ACKs
      // independently so one transient error cannot lose the rest of a batch.
      if (this.pendingAcknowledgements.size) await this.flushAcknowledgements(controller);
      if (controller.signal.aborted || !this.active) return;
      const payload = await this.api.fetchJson<{ commands?: CommandEnvelope[] }>(`/commands?viewerId=${encodeURIComponent(this.options.viewerId)}`, controller.signal);
      for (const item of payload.commands || []) {
        if (controller.signal.aborted || !this.active) return;
        if (!item.commandId || typeof item.command !== "string") continue;
        let outcome = this.outcomes.get(item.commandId);
        if (!outcome) {
          try { outcome = { status: "completed", result: (await this.options.execute(item.command, item.args || {})) ?? { ok: true } }; }
          catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            outcome = { status: "failed", error: message };
            if (!controller.signal.aborted) this.options.onCommandError?.(message);
          }
          if (controller.signal.aborted || !this.active) return;
          this.outcomes.set(item.commandId, outcome);
          if (this.outcomes.size > 256) this.outcomes.delete(this.outcomes.keys().next().value!);
        }
        this.pendingAcknowledgements.set(item.commandId, outcome);
      }
      await this.flushAcknowledgements(controller);
    } catch (error) {
      if (!controller.signal.aborted) console.debug("[oilgas-vis] Command polling unavailable:", error);
    } finally {
      if (controller === this.controller) this.polling = false;
    }
  }
}
