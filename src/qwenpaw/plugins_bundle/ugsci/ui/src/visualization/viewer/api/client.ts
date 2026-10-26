/** Instance-scoped transport shared by embedded viewers, imports and commands. */
import type { DatasetManifest, ImportJob, Capabilities, SSEEvent, ViewerMountOptions } from "../contracts/types";

export class ApiClient {
  private options: ViewerMountOptions;
  constructor(apiBase: string, authToken?: string, options: Partial<ViewerMountOptions> = {}) {
    this.options = { apiBase, authToken, ...options };
  }
  update(options: Partial<ViewerMountOptions>): void { this.options = { ...this.options, ...options }; }

  async request(path: string, init: RequestInit = {}): Promise<Response> {
    const base = this.options.apiBase.replace(/\/$/, "");
    const url = path.startsWith(`${base}/`) ? path : `${base}/${path.replace(/^\//, "")}`;
    const headers = new Headers(this.options.headers);
    if (this.options.authToken && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${this.options.authToken}`);
    new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    const response = await (this.options.request || fetch)(url, { ...init, headers });
    if (!response.ok) {
      let detail = "";
      try {
        const body = await response.json();
        detail = typeof body.detail === "string" ? body.detail : typeof body.error === "string" ? body.error : "";
      } catch { /* Non-JSON responses retain their HTTP status. */ }
      throw new Error(`请求失败（HTTP ${response.status}）${detail ? `：${detail}` : ""}`);
    }
    return response;
  }
  async fetchJson<T = any>(path: string, signal?: AbortSignal): Promise<T> {
    return (await this.request(path, { signal })).json();
  }
  async getCapabilities(): Promise<Capabilities> {
    return (await this.fetchJson<{ capabilities: Capabilities }>("/capabilities")).capabilities;
  }
  getManifest(signal?: AbortSignal): Promise<DatasetManifest> { return this.fetchJson("/manifest", signal); }
  async fetchBinary(filename: string, signal?: AbortSignal): Promise<ArrayBuffer> {
    const segments = filename.replace(/\\/g, "/").split("/");
    if (segments.some((part) => !part || part === "." || part === "..") || /[:?#]/.test(filename)) throw new Error("数据资源路径无效");
    return (await this.request(`/resource/${segments.map(encodeURIComponent).join("/")}`, { signal })).arrayBuffer();
  }
  async createImport(file: File, name: string, propertyFile?: File, companionFile?: File): Promise<{ job_id: string; status: string }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name);
    if (propertyFile) formData.append("property_file", propertyFile);
    if (companionFile) formData.append("companion_file", companionFile);
    return (await this.request("/imports", { method: "POST", body: formData })).json();
  }
  async createWorkspaceImport(path: string, root: "project" | "workspace" = "project", name = "", signal?: AbortSignal): Promise<{ job_id: string; status: string }> {
    const result = await (await this.request("/imports/workspace", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path, root, name }), signal,
    })).json();
    if (typeof result.job_id !== "string" || !result.job_id) throw new Error("导入请求未返回有效任务编号");
    return result;
  }
  async deleteDataset(datasetId: string): Promise<{ dataset_id: string; status: string; hidden: string[]; removed: string[] }> {
    return (await this.request(`/datasets/${encodeURIComponent(datasetId)}`, { method: "DELETE" })).json();
  }
  async restoreExamples(): Promise<{ count: number; restored: string[] }> {
    return (await this.request("/catalog/restore-examples", { method: "POST" })).json();
  }
  getJobStatus(jobId: string, signal?: AbortSignal): Promise<ImportJob> { return this.fetchJson(`/imports/${encodeURIComponent(jobId)}`, signal); }
  async cancelJob(jobId: string): Promise<void> { await this.request(`/imports/${encodeURIComponent(jobId)}/cancel`, { method: "POST" }); }

  async *subscribeToJobEvents(jobId: string, signal?: AbortSignal): AsyncGenerator<SSEEvent> {
    const response = await this.request(`/imports/${encodeURIComponent(jobId)}/events`, { signal });
    if (!response.body) throw new Error("服务器未返回任务事件流");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        if (done && buffer) lines.push(buffer);
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          let event: SSEEvent;
          try { event = JSON.parse(line.slice(5).trim()); } catch { continue; }
          yield event;
          if (event.type === "done") return;
        }
        if (done) return;
      }
    } finally {
      try { await reader.cancel(); } catch { /* Already aborted/closed. */ }
      reader.releaseLock();
    }
  }
}
