/**
 * Frontend API client — authenticated fetch wrapper for the plugin backend.
 *
 * All API calls go through this module to ensure:
 * - Bearer token is injected
 * - Correct base URL is used (host.getApiUrl prepends /api)
 * - Consistent error handling
 */

import type {
  DatasetManifest,
  ImportJob,
  Capabilities,
  SSEEvent,
} from "../contracts/types";

export class ApiClient {
  constructor(
    private apiBase: string,
    private authToken?: string,
  ) {}

  private headers(): Record<string, string> {
    return this.authToken
      ? { Authorization: `Bearer ${this.authToken}` }
      : {};
  }

  async getCapabilities(): Promise<Capabilities> {
    const resp = await fetch(`${this.apiBase}/capabilities`, {
      headers: this.headers(),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    return data.capabilities;
  }

  async getManifest(): Promise<DatasetManifest> {
    const resp = await fetch(`${this.apiBase}/manifest`, {
      headers: this.headers(),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.json();
  }

  async fetchBinary(filename: string): Promise<ArrayBuffer> {
    const resp = await fetch(`${this.apiBase}/resource/${filename}`, {
      headers: this.headers(),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.arrayBuffer();
  }

  async createImport(
    file: File,
    name: string,
    propertyFile?: File,
  ): Promise<{ job_id: string; status: string }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name);
    if (propertyFile) {
      formData.append("property_file", propertyFile);
    }
    const resp = await fetch(`${this.apiBase}/imports`, {
      method: "POST",
      headers: this.authToken
        ? { Authorization: `Bearer ${this.authToken}` }
        : {},
      body: formData,
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.json();
  }

  async getJobStatus(jobId: string): Promise<ImportJob> {
    const resp = await fetch(`${this.apiBase}/imports/${jobId}`, {
      headers: this.headers(),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.json();
  }

  async cancelJob(jobId: string): Promise<void> {
    const resp = await fetch(`${this.apiBase}/imports/${jobId}/cancel`, {
      method: "POST",
      headers: this.headers(),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  }

  /**
   * Subscribe to SSE events for an import job.
   * Returns an async generator that yields events.
   */
  async *subscribeToJobEvents(jobId: string): AsyncGenerator<SSEEvent> {
    const resp = await fetch(`${this.apiBase}/imports/${jobId}/events`, {
      headers: this.headers(),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const reader = resp.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const event = JSON.parse(line.slice(6));
            yield event as SSEEvent;
            if (event.type === "done") return;
          } catch {
            // Skip malformed lines
          }
        }
      }
    }
  }
}
