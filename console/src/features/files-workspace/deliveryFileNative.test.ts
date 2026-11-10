import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import { setRuntimeApiBaseUrl } from "../../api/config";
import type { SessionFilesScope } from "../../api/modules/turnFiles";
import type { FileTarget } from "./types";

const mocks = vi.hoisted(() => ({ native: vi.fn(() => true), fetch: vi.fn() }));
vi.mock("../../utils/openExternalLink", () => ({
  isDesktopTauriRuntime: mocks.native,
  resolveExternalUrl: (url: string) => {
    try {
      return new URL(url, window.location.origin).href;
    } catch {
      return null;
    }
  },
  isHttpExternalUrl: (url: string) => /^https?:\/\//.test(url),
}));

import {
  isDeliveryNativeAvailable,
  listDeliveryApplications,
  openDeliveryFile,
  revealDeliveryFile,
} from "./deliveryFileNative";

const nativeInvoke = vi.mocked(invoke);
const scope: SessionFilesScope = {
  kind: "session",
  agentId: "agent-a",
  sessionId: "session-a",
  chatId: "chat-a",
};
const applications = {
  applications: [
    {
      id: "sheet-app",
      name: "Sheets",
      isDefault: true,
      iconDataUrl: "data:image/png;base64,aQ==",
    },
  ],
  canOpenDefault: true,
  canChooseApplication: true,
};
function target(): FileTarget {
  return {
    source: "artifact",
    path: "output/report.csv",
    root: "project",
    artifactUrl: "/api/archive/report?version=after",
    artifact: {
      id: "archive-id",
      title: "report.csv",
      source: "tool_call",
      mimeType: "text/csv",
      binaryUrl: "/api/archive/binary?version=after",
      agentId: scope.agentId,
      sessionId: scope.sessionId,
      chatId: scope.chatId,
      meta: {
        turnFileArchive: true,
        turnId: "turn-a",
        fileId: "file-a",
        version: "after",
      },
    },
  };
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
function response(
  bytes: number[] = [0, 255, 128, 10],
  status = 200,
  length?: string,
) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(length ? { "Content-Length": length } : {}),
    arrayBuffer: vi.fn(async () => new Uint8Array(bytes).buffer),
  };
}
function calls(command: string) {
  return nativeInvoke.mock.calls.filter(([name]) => name === command);
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.native.mockReturnValue(true);
  vi.stubGlobal("__TAURI_INTERNALS__", {});
  vi.stubGlobal("fetch", mocks.fetch);
  localStorage.setItem("qwenpaw_auth_token", "credential-a");
  setRuntimeApiBaseUrl("");
  mocks.fetch.mockResolvedValue(response());
  let staged = 0;
  nativeInvoke.mockImplementation(async (command) => {
    if (command === "list_delivery_file_applications") return applications;
    if (command === "stage_delivery_file")
      return {
        token: `opaque-${++staged}`,
        fileName: "report.csv",
        path: "/staged/report.csv",
      };
    return undefined;
  });
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  localStorage.clear();
  setRuntimeApiBaseUrl("");
});

describe("native delivery file byte and identity boundary", () => {
  it("fetches exact archived bytes with owning scope headers and opens only its native token", async () => {
    expect(isDeliveryNativeAvailable()).toBe(true);
    await openDeliveryFile(target(), scope, "sheet-app");
    expect(mocks.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/archive/binary?version=after"),
      {
        headers: {
          Authorization: "Bearer credential-a",
          "X-Agent-Id": "agent-a",
          "X-Chat-Id": "chat-a",
        },
        credentials: "same-origin",
        redirect: "error",
        cache: "no-store",
      },
    );
    expect(calls("stage_delivery_file")).toEqual([
      [
        "stage_delivery_file",
        {
          request: { fileName: "report.csv", contentBase64: "AP+ACg==" },
        },
      ],
    ]);
    expect(calls("open_delivery_file")).toEqual([
      ["open_delivery_file", { token: "opaque-1", applicationId: "sheet-app" }],
    ]);
  });

  it("uses artifactUrl when no binary URL exists and reuses a scoped archive token for reveal", async () => {
    const file = target();
    file.artifact!.binaryUrl = undefined;
    await openDeliveryFile(file, scope);
    await revealDeliveryFile(file, scope);
    expect(mocks.fetch).toHaveBeenCalledTimes(1);
    expect(mocks.fetch.mock.calls[0][0]).toContain(
      "/api/archive/report?version=after",
    );
    expect(calls("stage_delivery_file")).toHaveLength(1);
    expect(calls("reveal_delivery_file")).toEqual([
      ["reveal_delivery_file", { token: "opaque-1" }],
    ]);
  });

  it("separates all archive identity fields even when URLs and names are equal", async () => {
    const original = target();
    const variants: FileTarget[] = [
      original,
      { ...original, root: "workspace" },
      { ...original, path: "other/report.csv" },
      { ...original, artifact: { ...original.artifact!, id: "another-id" } },
      {
        ...original,
        artifact: {
          ...original.artifact!,
          meta: { ...original.artifact!.meta, version: "before" },
        },
      },
      { ...original, artifactUrl: "/api/archive/other-url" },
      {
        ...original,
        artifact: {
          ...original.artifact!,
          binaryUrl: "/api/archive/other-binary",
        },
      },
    ];
    for (const file of variants) await openDeliveryFile(file, scope);
    expect(calls("stage_delivery_file")).toHaveLength(variants.length);
  });

  it("does not share archive tokens across credentials or full session directory scope", async () => {
    await openDeliveryFile(target(), scope);
    localStorage.setItem("qwenpaw_auth_token", "credential-b");
    await openDeliveryFile(target(), scope);
    await openDeliveryFile(target(), {
      ...scope,
      projectDirOverride: "/another-project",
    });
    expect(calls("stage_delivery_file")).toHaveLength(3);
    expect(mocks.fetch.mock.calls[1][1].headers.Authorization).toBe(
      "Bearer credential-b",
    );
  });

  it("rejects mismatched artifact ownership without reading bytes", async () => {
    const file = target();
    file.artifact!.agentId = "agent-b";
    await expect(openDeliveryFile(file, scope)).rejects.toThrow("scope");
    expect(mocks.fetch).not.toHaveBeenCalled();
    expect(nativeInvoke).not.toHaveBeenCalled();
  });

  it("never falls back to the workspace when an archive has no URL or returns an error", async () => {
    const file = target();
    file.artifactUrl = undefined;
    file.artifact!.binaryUrl = undefined;
    await expect(openDeliveryFile(file, scope)).rejects.toThrow("binary URL");
    expect(mocks.fetch).not.toHaveBeenCalled();
    mocks.fetch.mockResolvedValueOnce(response([], 404));
    await expect(openDeliveryFile(target(), scope)).rejects.toThrow("404");
    expect(mocks.fetch).toHaveBeenCalledTimes(1);
    expect(calls("stage_delivery_file")).toHaveLength(0);
    await openDeliveryFile(target(), scope);
    expect(calls("stage_delivery_file")).toHaveLength(1);
  });

  it("does not cache staging failures", async () => {
    nativeInvoke.mockRejectedValueOnce(new Error("staging failed"));
    await expect(openDeliveryFile(target(), scope)).rejects.toThrow(
      "staging failed",
    );
    await openDeliveryFile(target(), scope);
    expect(calls("stage_delivery_file")).toHaveLength(2);
    expect(calls("open_delivery_file")).toHaveLength(1);
  });

  it("invalidates a failed native copy so the next explicit action re-stages the archive", async () => {
    nativeInvoke.mockImplementationOnce(async () => ({
      token: "invalid-copy",
      fileName: "report.csv",
      path: "/staged/report.csv",
    }));
    nativeInvoke.mockRejectedValueOnce(new Error("staged copy was modified"));
    await expect(openDeliveryFile(target(), scope)).rejects.toThrow("modified");
    expect(calls("open_delivery_file")).toHaveLength(1);
    expect(mocks.fetch).toHaveBeenCalledTimes(1);
    await openDeliveryFile(target(), scope);
    expect(mocks.fetch).toHaveBeenCalledTimes(2);
    expect(
      mocks.fetch.mock.calls.every(([url]) =>
        url.includes("/api/archive/binary?version=after"),
      ),
    ).toBe(true);
    expect(calls("stage_delivery_file")).toHaveLength(2);
    expect(calls("open_delivery_file")).toHaveLength(2);
    expect(calls("open_delivery_file")[1][1]).toEqual({ token: "opaque-1" });
  });

  it("rejects a declared oversized file before reading or staging it", async () => {
    const oversized = response([], 200, String(32 * 1024 * 1024 + 1));
    mocks.fetch.mockResolvedValueOnce(oversized);
    await expect(openDeliveryFile(target(), scope)).rejects.toThrow("32 MiB");
    expect(oversized.arrayBuffer).not.toHaveBeenCalled();
    expect(calls("stage_delivery_file")).toHaveLength(0);
  });

  it("checks the actual binary length when content length is absent", async () => {
    const oversized = response();
    oversized.arrayBuffer.mockResolvedValueOnce(
      new ArrayBuffer(32 * 1024 * 1024 + 1),
    );
    mocks.fetch.mockResolvedValueOnce(oversized);
    await expect(openDeliveryFile(target(), scope)).rejects.toThrow("32 MiB");
    expect(calls("stage_delivery_file")).toHaveLength(0);
  });

  it("supports scoped legacy workspace bytes while re-reading mutable files for every action", async () => {
    const file: FileTarget = {
      source: "workspace",
      path: "output/report.csv",
      root: "workspace",
    };
    const pendingScope = {
      ...scope,
      chatId: undefined,
      projectDirOverride: "/pending-project",
    };
    await openDeliveryFile(file, pendingScope);
    await revealDeliveryFile(file, pendingScope);
    expect(mocks.fetch).toHaveBeenCalledTimes(2);
    expect(mocks.fetch.mock.calls[0][0]).toContain(
      "workspace/file-download?path=output%2Freport.csv&root=workspace",
    );
    expect(mocks.fetch.mock.calls[0][1].headers["X-Session-Project-Dir"]).toBe(
      "/pending-project",
    );
    expect(calls("stage_delivery_file")).toHaveLength(2);
  });

  it("supports explicit attachment URLs and absolute legacy paths without workspace fallback", async () => {
    await openDeliveryFile(
      {
        source: "attachment",
        path: "report.csv",
        artifactUrl: "/api/attachments/file-a",
      },
      scope,
    );
    await openDeliveryFile(
      { source: "workspace", path: "C:/project/report.csv" },
      scope,
    );
    expect(mocks.fetch.mock.calls[0][0]).toContain("/api/attachments/file-a");
    expect(mocks.fetch.mock.calls[1][0]).toContain("/api/files/preview/");
    expect(mocks.fetch.mock.calls[1][0]).not.toContain(
      "workspace/file-download",
    );
  });

  it("rejects browser runtimes and unsafe URLs without invoking a native program", async () => {
    mocks.native.mockReturnValue(false);
    expect(isDeliveryNativeAvailable()).toBe(false);
    await expect(openDeliveryFile(target(), scope)).rejects.toThrow(
      "unavailable",
    );
    mocks.native.mockReturnValue(true);
    const file = target();
    file.artifact!.binaryUrl = "file:///private/report.csv";
    await expect(openDeliveryFile(file, scope)).rejects.toThrow("binary URL");
    expect(mocks.fetch).not.toHaveBeenCalled();
    expect(nativeInvoke).not.toHaveBeenCalled();
  });
});

describe("native delivery backend trust boundary", () => {
  it("rejects an external archive URL before sending credentials or reading a fallback URL", async () => {
    const file = target();
    file.artifact!.binaryUrl = "https://untrusted.example/archive/report.csv";
    await expect(openDeliveryFile(file, scope)).rejects.toThrow(
      "configured backend",
    );
    file.artifact!.binaryUrl = "//untrusted.example/archive/report.csv";
    await expect(openDeliveryFile(file, scope)).rejects.toThrow(
      "configured backend",
    );
    expect(mocks.fetch).not.toHaveBeenCalled();
    expect(nativeInvoke).not.toHaveBeenCalled();
  });

  it("sends scope headers to the configured desktop backend even when it differs from the WebView origin", async () => {
    setRuntimeApiBaseUrl("http://127.0.0.1:58223");
    const file = target();
    file.artifact!.binaryUrl =
      "http://127.0.0.1:58223/api/archive/binary?version=after";
    await openDeliveryFile(file, scope);
    expect(mocks.fetch).toHaveBeenCalledWith(file.artifact!.binaryUrl, {
      headers: {
        Authorization: "Bearer credential-a",
        "X-Agent-Id": "agent-a",
        "X-Chat-Id": "chat-a",
      },
      credentials: "same-origin",
      redirect: "error",
      cache: "no-store",
    });
    expect(calls("stage_delivery_file")).toHaveLength(1);
  });

  it("does not trust the WebView origin as an archive backend after a desktop backend is configured", async () => {
    setRuntimeApiBaseUrl("http://127.0.0.1:58223");
    await expect(openDeliveryFile(target(), scope)).rejects.toThrow(
      "configured backend",
    );
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it("reads legacy external files without private headers or cookies and refuses redirects", async () => {
    await openDeliveryFile(
      {
        source: "attachment",
        path: "report.csv",
        artifactUrl: "https://public.example/report.csv",
      },
      scope,
    );
    expect(mocks.fetch).toHaveBeenCalledWith(
      "https://public.example/report.csv",
      {
        headers: {},
        credentials: "omit",
        redirect: "error",
        cache: "no-store",
      },
    );
    expect(calls("stage_delivery_file")).toHaveLength(1);
  });

  it("does not stage or retry a backend response when fetch rejects a redirect", async () => {
    mocks.fetch.mockRejectedValueOnce(new TypeError("Redirect disallowed"));
    await expect(openDeliveryFile(target(), scope)).rejects.toThrow(
      "Redirect disallowed",
    );
    expect(mocks.fetch).toHaveBeenCalledTimes(1);
    expect(mocks.fetch.mock.calls[0][1]).toMatchObject({ redirect: "error" });
    expect(nativeInvoke).not.toHaveBeenCalled();
  });

  it("cancels a late response when the configured backend changes", async () => {
    const fetchResult = deferred<ReturnType<typeof response>>();
    mocks.fetch.mockReturnValueOnce(fetchResult.promise);
    const pending = openDeliveryFile(target(), scope);
    setRuntimeApiBaseUrl("http://127.0.0.1:58223");
    fetchResult.resolve(response());
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    expect(nativeInvoke).not.toHaveBeenCalled();
  });
});

describe("native action scope changes", () => {
  it("does not fetch for an already stale origin", async () => {
    await expect(
      openDeliveryFile(target(), scope, undefined, { isCurrent: () => false }),
    ).rejects.toMatchObject({ name: "AbortError" });
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it("does not stage a late file response after the originating scope closes", async () => {
    const fetchResult = deferred<ReturnType<typeof response>>();
    mocks.fetch.mockReturnValueOnce(fetchResult.promise);
    let active = true;
    const pending = openDeliveryFile(target(), scope, undefined, {
      isCurrent: () => active,
    });
    active = false;
    fetchResult.resolve(response());
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    expect(nativeInvoke).not.toHaveBeenCalled();
  });

  it("does not stage an old account's late response after credentials change", async () => {
    const fetchResult = deferred<ReturnType<typeof response>>();
    mocks.fetch.mockReturnValueOnce(fetchResult.promise);
    const pending = openDeliveryFile(target(), scope);
    localStorage.setItem("qwenpaw_auth_token", "credential-b");
    fetchResult.resolve(response());
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    expect(nativeInvoke).not.toHaveBeenCalled();
  });

  it("does not open a program after a late staging response", async () => {
    const staging = deferred<{
      token: string;
      fileName: string;
      path: string;
    }>();
    nativeInvoke.mockReturnValueOnce(staging.promise);
    let active = true;
    const pending = openDeliveryFile(target(), scope, undefined, {
      isCurrent: () => active,
    });
    await vi.waitFor(() =>
      expect(calls("stage_delivery_file")).toHaveLength(1),
    );
    active = false;
    staging.resolve({
      token: "late-token",
      fileName: "report.csv",
      path: "/staged/report.csv",
    });
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    expect(calls("open_delivery_file")).toHaveLength(0);
  });

  it("merges concurrent archive reads and lets only current subscribers open", async () => {
    const fetchResult = deferred<ReturnType<typeof response>>();
    mocks.fetch.mockReturnValueOnce(fetchResult.promise);
    let firstActive = true;
    const first = openDeliveryFile(target(), scope, undefined, {
      isCurrent: () => firstActive,
    });
    const firstResult = expect(first).rejects.toMatchObject({
      name: "AbortError",
    });
    const second = revealDeliveryFile(target(), scope, {
      isCurrent: () => true,
    });
    firstActive = false;
    fetchResult.resolve(response());
    await Promise.all([firstResult, second]);
    expect(mocks.fetch).toHaveBeenCalledTimes(1);
    expect(calls("stage_delivery_file")).toHaveLength(1);
    expect(calls("open_delivery_file")).toHaveLength(0);
    expect(calls("reveal_delivery_file")).toHaveLength(1);
  });

  it("captures target URL and scope headers before asynchronous mutation", async () => {
    const fetchResult = deferred<ReturnType<typeof response>>();
    mocks.fetch.mockReturnValueOnce(fetchResult.promise);
    const file = target();
    const ownerScope = { ...scope };
    const pending = openDeliveryFile(file, ownerScope);
    file.artifact!.title = "changed.csv";
    file.artifact!.binaryUrl = "/wrong-file";
    ownerScope.agentId = "wrong-agent";
    fetchResult.resolve(response());
    await pending;
    expect(mocks.fetch.mock.calls[0][0]).toContain(
      "/api/archive/binary?version=after",
    );
    expect(mocks.fetch.mock.calls[0][1].headers["X-Agent-Id"]).toBe("agent-a");
    expect(calls("stage_delivery_file")[0][1]).toMatchObject({
      request: { fileName: "report.csv" },
    });
  });

  it("does not reuse tokens across native bridge instances", async () => {
    await openDeliveryFile(target(), scope);
    vi.stubGlobal("__TAURI_INTERNALS__", {});
    await revealDeliveryFile(target(), scope);
    expect(calls("stage_delivery_file")).toHaveLength(2);
  });
});

describe("delivery application association cache", () => {
  it("merges enumeration and caches by case insensitive suffix", async () => {
    const listing = deferred<typeof applications>();
    nativeInvoke.mockReturnValueOnce(listing.promise);
    const first = listDeliveryApplications("report.CSV");
    const second = listDeliveryApplications("second.csv");
    expect(calls("list_delivery_file_applications")).toHaveLength(1);
    listing.resolve(applications);
    expect(await first).toEqual(applications);
    expect(await second).toEqual(applications);
    await listDeliveryApplications("third.csv");
    expect(calls("list_delivery_file_applications")).toHaveLength(1);
  });

  it("treats no application association as a successful empty result", async () => {
    nativeInvoke.mockResolvedValueOnce({
      applications: [],
      canOpenDefault: false,
      canChooseApplication: true,
    });
    expect(await listDeliveryApplications("unknown.ext")).toEqual({
      applications: [],
      canOpenDefault: false,
      canChooseApplication: true,
    });
  });

  it("does not cache failed enumerations", async () => {
    nativeInvoke.mockRejectedValueOnce(new Error("enumeration failed"));
    await expect(listDeliveryApplications("report.csv")).rejects.toThrow(
      "enumeration failed",
    );
    expect(await listDeliveryApplications("other.csv")).toEqual(applications);
    expect(calls("list_delivery_file_applications")).toHaveLength(2);
  });

  it("expires association results and invalidates them on runtime replacement", async () => {
    vi.useFakeTimers();
    await listDeliveryApplications("report.csv");
    vi.advanceTimersByTime(30_001);
    await listDeliveryApplications("other.csv");
    vi.stubGlobal("__TAURI_INTERNALS__", {});
    await listDeliveryApplications("third.csv");
    expect(calls("list_delivery_file_applications")).toHaveLength(3);
  });
});
