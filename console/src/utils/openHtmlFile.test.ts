/**
 * openHtmlFile renders raw HTML previews across three shells:
 * pywebview (legacy desktop), Tauri (desktop), and blob URL (browser).
 * The workspace-backed flag decides whether native openers are used;
 * blob fallback must always carry the content.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { waitFor } from "@testing-library/react";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(() => Promise.resolve(undefined)),
}));

vi.mock("../api/authHeaders", () => ({
  buildAuthHeaders: () => ({ Authorization: "Bearer test" }),
  buildWorkspaceScopeHeaders: () => ({
    Authorization: "Bearer test",
    "X-Chat-Id": "chat-1",
  }),
}));

vi.mock("../api/modules/workspace", () => ({
  workspaceApi: {
    getHtmlFileUriUrl: vi.fn(
      (path: string, root: string) => `/api/html?path=${path}&root=${root}`,
    ),
    getFileDownloadUrl: vi.fn((path: string) => `/api/files/${path}`),
  },
}));

const mockIsDesktopTauriRuntime = vi.fn(() => false);
vi.mock("./openExternalLink", () => ({
  isDesktopTauriRuntime: () => mockIsDesktopTauriRuntime(),
}));

const mockGetPyWebViewApi = vi.fn<
  () =>
    | (Omit<
        Partial<import("./pywebview").PyWebViewApi>,
        "open_workspace_html"
      > & {
        open_workspace_html?: (
          ...args: Parameters<
            NonNullable<
              import("./pywebview").PyWebViewApi["open_workspace_html"]
            >
          >
        ) => Promise<boolean | void>;
      })
    | undefined
>(() => undefined);
vi.mock("./pywebview", () => ({
  getPyWebViewApi: () => mockGetPyWebViewApi(),
}));

import { openHtmlFile } from "./openHtmlFile";
import "./htmlPreviewResources";
import { invoke } from "@tauri-apps/api/core";
import { workspaceApi } from "../api/modules/workspace";

const baseOptions = {
  content: "<h1>hello</h1>",
  filePath: "report.html",
};

describe("openHtmlFile", () => {
  let createObjectURL: unknown;
  let revokeObjectURL: unknown;
  let openSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    createObjectURL = URL.createObjectURL;
    revokeObjectURL = URL.revokeObjectURL;
    URL.createObjectURL = vi.fn(() => "blob:preview");
    URL.revokeObjectURL = vi.fn();
    // jsdom's window.open is a no-op stub; spy on it to observe navigation
    openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    mockIsDesktopTauriRuntime.mockReturnValue(false);
    mockGetPyWebViewApi.mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    URL.createObjectURL = createObjectURL as typeof URL.createObjectURL;
    URL.revokeObjectURL = revokeObjectURL as typeof URL.revokeObjectURL;
  });

  it("falls back to a blob URL in the browser (not workspace backed)", () => {
    openHtmlFile({ ...baseOptions });
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(openSpy).toHaveBeenCalledWith(
      "blob:preview",
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("contains untrusted markup only inside an opaque sandbox", async () => {
    const content =
      '<script>parent.localStorage.getItem("qwenpaw_auth_token")</script><h1>交互</h1>';
    openHtmlFile({ ...baseOptions, content });
    const blob = vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob;
    const html = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.readAsText(blob);
    });
    const wrapper = new DOMParser().parseFromString(html, "text/html");
    expect(wrapper.querySelector("script")).toBeNull();
    const frame = wrapper.querySelector("iframe")!;
    expect(frame.getAttribute("sandbox")).toBe("allow-scripts");
    const preview = new DOMParser().parseFromString(
      frame.getAttribute("srcdoc")!,
      "text/html",
    );
    expect(preview.querySelector("h1")?.textContent).toBe("交互");
    expect(preview.querySelectorAll("script")).toHaveLength(2);
    expect(preview.querySelector("script")?.textContent).toContain(
      "makeStorage",
    );
  });

  it("falls back to a blob URL when workspace backed but no native shell", () => {
    openHtmlFile({ ...baseOptions, workspaceBacked: true });
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it("reserves a browser window before loading relative HTML resources", async () => {
    const target = {
      opener: window,
      closed: false,
      document: document.implementation.createHTMLDocument(),
      location: { replace: vi.fn() },
    };
    openSpy.mockReturnValue(target as unknown as Window);
    let finish!: (value: Response) => void;
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            finish = resolve;
          }),
      ),
    );
    openHtmlFile({
      ...baseOptions,
      content: '<link rel="stylesheet" href="styles.css"><h1>hello</h1>',
      artifact: {
        id: "page",
        title: "report.html",
        source: "generated",
        mimeType: "text/html",
        workspacePath: "design/report.html",
        workspaceRoot: "workspace",
        chatId: "chat-1",
      },
    });
    expect(openSpy).toHaveBeenCalledWith("about:blank", "_blank");
    expect(target.opener).toBeNull();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    await vi.dynamicImportSettled();
    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    finish(new Response("h1 { color: green }"));
    await waitFor(() =>
      expect(target.location.replace).toHaveBeenCalledWith("blob:preview"),
    );
    expect(openSpy).toHaveBeenCalledOnce();
    const blob = vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob;
    const html = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.readAsText(blob);
    });
    const wrapper = new DOMParser().parseFromString(html, "text/html");
    const frame = wrapper.querySelector("iframe")!;
    expect(frame.getAttribute("sandbox")).toBe("allow-scripts");
    expect(frame.getAttribute("srcdoc")).toContain("data:text/css");
    expect(html).not.toContain("Bearer test");
  });

  it("uses the pywebview bridge when workspace backed and available", async () => {
    const openWorkspaceHtml = vi.fn(() => Promise.resolve());
    mockGetPyWebViewApi.mockReturnValue({
      open_workspace_html: openWorkspaceHtml,
    });
    openHtmlFile({ ...baseOptions, workspaceBacked: true, chatId: "chat-1" });
    expect(openWorkspaceHtml).toHaveBeenCalledWith(
      "/api/html?path=report.html&root=project",
      expect.objectContaining({
        Authorization: "Bearer test",
        "X-Chat-Id": "chat-1",
      }),
    );
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it("passes the project dir header instead of chat id when there is no chat", async () => {
    const openWorkspaceHtml = vi.fn(() => Promise.resolve());
    mockGetPyWebViewApi.mockReturnValue({
      open_workspace_html: openWorkspaceHtml,
    });
    openHtmlFile({
      ...baseOptions,
      workspaceBacked: true,
      projectDirOverride: "/data/proj",
    });
    const call = openWorkspaceHtml.mock.calls[0] as unknown[];
    const headers = call[1] as Record<string, string>;
    expect(headers["X-Session-Project-Dir"]).toBe("/data/proj");
    expect(headers).not.toHaveProperty("X-Chat-Id");
  });

  it("uses the Tauri invoke when workspace backed in a tauri runtime", () => {
    mockIsDesktopTauriRuntime.mockReturnValue(true);
    openHtmlFile({ ...baseOptions, workspaceBacked: true });
    expect(invoke).toHaveBeenCalledWith("open_workspace_html", {
      url: "/api/html?path=report.html&root=project",
      headers: expect.objectContaining({ Authorization: "Bearer test" }),
    });
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it("honors the workspace root option", () => {
    openHtmlFile({ ...baseOptions, root: "workspace" });
    expect(workspaceApi.getHtmlFileUriUrl).toHaveBeenCalledWith(
      "report.html",
      "workspace",
    );
  });

  it("does not crash when the native opener rejects", async () => {
    const openWorkspaceHtml = vi.fn(() => Promise.reject(new Error("nope")));
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    mockGetPyWebViewApi.mockReturnValue({
      open_workspace_html: openWorkspaceHtml,
    });
    openHtmlFile({ ...baseOptions, workspaceBacked: true });
    // Let the rejection settle
    await Promise.resolve();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
