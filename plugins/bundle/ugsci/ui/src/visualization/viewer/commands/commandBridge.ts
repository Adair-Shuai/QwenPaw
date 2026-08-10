/**
 * Agent-to-viewer command transport.
 *
 * The bridge owns polling, authentication and ACK delivery. Rendering engines
 * only implement command execution, which keeps transport failures isolated
 * from WebGL lifecycle and makes the bridge reusable by future engines.
 */

import type { ViewerMountOptions } from "../contracts/types";

interface CommandEnvelope {
  commandId: string;
  command: string;
  args?: Record<string, unknown>;
}

export interface CommandBridgeOptions extends ViewerMountOptions {
  viewerId: string;
  execute(command: string, args: Record<string, unknown>): Promise<unknown>;
  onCommandError?(message: string): void;
  intervalMs?: number;
}

export class ViewerCommandBridge {
  private apiBase: string;
  private authToken?: string;
  private timer: number | null = null;
  private polling = false;

  constructor(private readonly options: CommandBridgeOptions) {
    this.apiBase = options.apiBase;
    this.authToken = options.authToken;
  }

  start(): void {
    if (this.timer !== null) return;
    void this.poll();
    this.timer = window.setInterval(
      () => { void this.poll(); },
      this.options.intervalMs ?? 750,
    );
  }

  update(options: Partial<ViewerMountOptions>): void {
    if (options.apiBase) this.apiBase = options.apiBase;
    if (options.authToken !== undefined) this.authToken = options.authToken;
  }

  dispose(): void {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
  }

  private headers(): Record<string, string> {
    return this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {};
  }

  private async poll(): Promise<void> {
    if (this.polling) return;
    this.polling = true;
    try {
      const response = await fetch(
        `${this.apiBase}/commands?viewerId=${encodeURIComponent(this.options.viewerId)}`,
        { headers: this.headers() },
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json() as { commands?: CommandEnvelope[] };
      for (const item of payload.commands || []) {
        try {
          const result = await this.options.execute(item.command, item.args || {});
          await this.acknowledge(item.commandId, "completed", result ?? { ok: true });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          this.options.onCommandError?.(message);
          await this.acknowledge(item.commandId, "failed", undefined, message);
        }
      }
    } catch (error) {
      // A transient backend restart should not take down the WebGL viewer.
      console.debug("[oilgas-vis] Command polling unavailable:", error);
    } finally {
      this.polling = false;
    }
  }

  private async acknowledge(
    commandId: string,
    status: "completed" | "failed",
    result?: unknown,
    error?: string,
  ): Promise<void> {
    try {
      await fetch(`${this.apiBase}/commands/${encodeURIComponent(commandId)}/ack`, {
        method: "POST",
        headers: { ...this.headers(), "Content-Type": "application/json" },
        body: JSON.stringify({ status, result, error }),
      });
    } catch (ackError) {
      console.debug("[oilgas-vis] Command ACK unavailable:", ackError);
    }
  }
}
