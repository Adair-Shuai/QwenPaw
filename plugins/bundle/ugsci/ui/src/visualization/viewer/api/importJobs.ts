import type { ApiClient } from "./client";
import type { DatasetInfo, ImportJob } from "../contracts/types";

/** Only a terminal conversion failure requires submitting a new import. */
export class ImportJobFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImportJobFailedError";
  }
}

export interface ImportWaitOptions {
  signal?: AbortSignal;
  onProgress?: (job: ImportJob) => void;
  attempts?: number;
  intervalMs?: number;
}

export type CompletedImportJob = ImportJob & {
  status: "completed";
  result: DatasetInfo;
};

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      reject(new DOMException("已停止等待导入", "AbortError"));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", abort);
      resolve();
    }, ms);
    if (signal?.aborted) abort();
    else signal?.addEventListener("abort", abort, { once: true });
  });
}

/** Shared observer for uploads, workbench imports and embedded previews.
 * Cancelling this observer never cancels or resubmits the background job.
 */
export async function waitForImportJob(
  client: Pick<ApiClient, "getJobStatus">,
  jobId: string,
  options: ImportWaitOptions = {},
): Promise<CompletedImportJob> {
  if (typeof jobId !== "string" || !jobId.trim())
    throw new Error("导入任务未返回有效编号，请重试");
  const { signal, onProgress, attempts = 240, intervalMs = 750 } = options;
  for (let attempt = 0; attempt < attempts; attempt++) {
    signal?.throwIfAborted();
    const job = await client.getJobStatus(jobId, signal);
    signal?.throwIfAborted();
    if (
      !["queued", "running", "completed", "failed", "cancelled"].includes(
        job.status,
      )
    )
      throw new Error("导入任务返回未知状态");
    const progress = Number(job.progress);
    onProgress?.({
      ...job,
      progress: Number.isFinite(progress)
        ? Math.max(0, Math.min(1, progress))
        : 0,
    });
    signal?.throwIfAborted();
    if (job.status === "completed") {
      if (typeof job.result?.id !== "string" || !job.result.id.trim())
        throw new ImportJobFailedError("导入完成但未返回数据集编号");
      return job as CompletedImportJob;
    }
    if (job.status === "failed" || job.status === "cancelled")
      throw new ImportJobFailedError(
        job.error ||
          (job.status === "cancelled" ? "导入任务已取消" : "导入失败"),
      );
    if (attempt + 1 < attempts) await delay(intervalMs, signal);
  }
  throw new Error("等待导入超时，后台任务可能仍在处理；请稍后重试查询");
}
