import { ApiClient } from "./viewer/api/client";
import type { ImportJob } from "./viewer/contracts/types";

/** A terminal conversion requires a fresh import; network/query failures do not. */
export class WorkspaceImportFailedError extends Error {
  constructor(message: string) { super(message); this.name = "WorkspaceImportFailedError"; }
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const abort = () => { clearTimeout(timer); reject(new DOMException("已停止等待导入", "AbortError")); };
    const timer = setTimeout(() => { signal?.removeEventListener("abort", abort); resolve(); }, ms);
    if (signal?.aborted) abort();
    else signal?.addEventListener("abort", abort, { once: true });
  });
}

/** Closing a preview cancels its requests, not the user's background conversion. */
export async function waitForWorkspaceImport(
  client: ApiClient,
  jobId: string,
  options: { signal?: AbortSignal; onProgress?: (job: ImportJob) => void; attempts?: number; intervalMs?: number } = {},
): Promise<string> {
  const { signal, onProgress, attempts = 240, intervalMs = 750 } = options;
  for (let attempt = 0; attempt < attempts; attempt++) {
    signal?.throwIfAborted();
    const job = await client.getJobStatus(jobId, signal);
    signal?.throwIfAborted();
    if (!["queued", "running", "completed", "failed", "cancelled"].includes(job.status)) throw new Error("导入任务返回未知状态");
    onProgress?.({ ...job, progress: Number.isFinite(job.progress) ? Math.max(0, Math.min(1, job.progress)) : 0 });
    if (job.status === "completed") {
      if (typeof job.result?.id !== "string" || !job.result.id.trim()) throw new WorkspaceImportFailedError("导入完成但未返回数据集编号");
      return job.result.id;
    }
    if (job.status === "failed" || job.status === "cancelled") throw new WorkspaceImportFailedError(job.error || (job.status === "cancelled" ? "导入任务已取消" : "导入失败"));
    if (attempt + 1 < attempts) await delay(intervalMs, signal);
  }
  throw new Error("等待导入超时，后台任务可能仍在处理；请稍后重试查询");
}
