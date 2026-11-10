import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiClient } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/api/client";
import {
  ImportJobFailedError,
  waitForImportJob,
} from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/api/importJobs";
import {
  waitForWorkspaceImport,
  WorkspaceImportFailedError,
} from "../../../plugins/bundle/ugsci/ui/src/visualization/workspaceImport";
import { pollImportJob } from "../../../plugins/bundle/ugsci/ui/src/visualization/viewer/ui/importFormats";
import {
  classifyPickedFiles,
  fileAcceptAttribute,
  WORKSPACE_PREVIEW_EXTENSIONS,
  WORKSPACE_PREVIEW_MIME_TYPES,
} from "../../../plugins/bundle/ugsci/ui/src/visualization/imports/formats";

const response = (status: string, extra: Record<string, unknown> = {}) =>
  new Response(
    JSON.stringify({ job_id: "job", status, progress: 0.5, ...extra }),
  );
const api = (request: typeof fetch) =>
  new ApiClient("/api/visualization", "token", {
    request,
    headers: { "X-Agent-ID": "agent-one" },
  });
afterEach(() => vi.useRealTimers());

describe("shared visualization import services", () => {
  it("keeps CSV explicit and preserves same-model companion selection across entry points", () => {
    expect(fileAcceptAttribute()).toContain(".csv");
    expect(WORKSPACE_PREVIEW_EXTENSIONS).not.toContain("csv");
    expect(WORKSPACE_PREVIEW_MIME_TYPES).not.toContain("text/csv");
    expect(WORKSPACE_PREVIEW_EXTENSIONS).toEqual(
      expect.arrayContaining(["egrid", "las", "well.json", "network.json"]),
    );
    const grid = new File(["grid"], "A.EGRID");
    const own = new File(["properties"], "a.INIT");
    const other = new File(["other"], "b.INIT");
    const csv = new File(["x,y"], "network.csv");
    expect(classifyPickedFiles([other, csv, own, grid])).toEqual({
      primary: grid,
      companion: own,
      extra: [csv, other],
    });
    expect(classifyPickedFiles([csv])?.primary).toBe(csv);
  });

  it("uses one scoped observer for workspace previews and explicit uploads", async () => {
    const request = vi.fn(async () =>
      response("completed", { name: "model", result: { id: "dataset" } }),
    );
    expect(await waitForWorkspaceImport(api(request), "job/id")).toBe(
      "dataset",
    );
    expect(
      await pollImportJob({
        apiBase: "/api/visualization",
        authToken: "token",
        headers: { "X-Agent-ID": "agent-one" },
        request,
        jobId: "job/id",
      }),
    ).toEqual({ id: "dataset", name: "model" });
    expect(request).toHaveBeenCalledTimes(2);
    for (const [url, init] of request.mock.calls as unknown as [
      string,
      RequestInit,
    ][]) {
      expect(url).toBe("/api/visualization/imports/job%2Fid");
      expect(new Headers(init.headers).get("X-Agent-ID")).toBe("agent-one");
      expect(new Headers(init.headers).get("Authorization")).toBe(
        "Bearer token",
      );
      expect(init.method).toBeUndefined();
    }
  });

  it("aborts during the polling delay without another request or cancelling the conversion", async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const request = vi.fn(async () => response("running"));
    const progress = vi.fn();
    const pending = pollImportJob({
      apiBase: "/api/visualization",
      request,
      jobId: "job",
      signal: controller.signal,
      onProgress: progress,
    });
    const rejected = expect(pending).rejects.toMatchObject({
      name: "AbortError",
    });
    await vi.advanceTimersByTimeAsync(1);
    expect(progress).toHaveBeenCalledWith(0.5, "处理中");
    controller.abort();
    await rejected;
    await vi.advanceTimersByTimeAsync(2000);
    expect(request).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("ignores late completion after disposal and keeps another observer independent", async () => {
    let finish!: (value: Response) => void;
    const request = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          finish = resolve;
        }),
    );
    const controller = new AbortController();
    const progress = vi.fn();
    const pending = waitForImportJob(api(request), "job", {
      signal: controller.signal,
      onProgress: progress,
    });
    const rejected = expect(pending).rejects.toMatchObject({
      name: "AbortError",
    });
    controller.abort();
    finish(response("completed", { result: { id: "late" } }));
    await rejected;
    expect(progress).not.toHaveBeenCalled();
    expect(
      await waitForWorkspaceImport(
        api(async () => response("completed", { result: { id: "survivor" } })),
        "other",
      ),
    ).toBe("survivor");
  });

  it("preserves terminal failure identity for retry decisions and rejects empty results", async () => {
    for (const status of ["failed", "cancelled", "completed"]) {
      const request = vi.fn(async () =>
        response(status, { error: "转换错误", result: { id: "  " } }),
      );
      const failure = await waitForWorkspaceImport(api(request), "job").catch(
        (error: unknown) => error,
      );
      expect(failure).toBeInstanceOf(ImportJobFailedError);
      expect(failure).toBeInstanceOf(WorkspaceImportFailedError);
      expect(request).toHaveBeenCalledTimes(1);
    }
  });

  it("leaves transport failures retryable without resubmitting or retrying the request", async () => {
    const request = vi.fn(async () => {
      throw new Error("connection closed");
    });
    const failure = await waitForWorkspaceImport(api(request), "job").catch(
      (error: unknown) => error,
    );
    expect(failure).toBeInstanceOf(Error);
    expect(failure).not.toBeInstanceOf(ImportJobFailedError);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("bounds progress and rejects unknown task states instead of waiting indefinitely", async () => {
    const progress = vi.fn();
    await waitForImportJob(
      api(async () =>
        response("completed", { progress: 4, result: { id: "ready" } }),
      ),
      "job",
      { onProgress: progress },
    );
    expect(progress.mock.calls[0][0].progress).toBe(1);
    const request = vi.fn(async () => response("unrecognized"));
    await expect(waitForImportJob(api(request), "job")).rejects.toThrow(
      "未知状态",
    );
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("times out without an extra delay or treating the background job as failed", async () => {
    vi.useFakeTimers();
    const request = vi.fn(async () => response("queued"));
    const pending = waitForImportJob(api(request), "job", {
      attempts: 2,
      intervalMs: 20,
    });
    const rejected = expect(pending).rejects.toThrow("后台任务可能仍在处理");
    await vi.advanceTimersByTimeAsync(20);
    await rejected;
    expect(request).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });
});
