/**
 * OfficeDocRenderer.test.tsx — Office 文档渲染器组件测试
 *
 * 测试覆盖：
 * - 加载状态（Spin）
 * - 成功转换（iframe 渲染 HTML）
 * - 回退模式（404/405 → 下载按钮）
 * - 主题适配（亮色/暗色 CSS）
 * - 认证头注入（buildAuthHeaders）
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import type { RendererContext, WorkspaceArtifact } from "../../types";

// Mock buildAuthHeaders
vi.mock("@/api/authHeaders", () => ({
  buildAuthHeaders: () => ({
    Authorization: "Bearer test-token",
    "X-Agent-Id": "test-agent",
  }),
}));

// Mock OfficeOoxmlPreview — the real component does async fetch + dynamic
// import (mammoth/read-excel-file) which hangs in the test environment.
// Using @/ alias path (same approach as @/api/authHeaders mock above).
vi.mock("@/components/Workspace/renderers/OfficeOoxmlPreview", () => ({
  default: function MockOoxmlPreview() {
    return null as any;
  },
}));

// Mock react-i18next
// CRITICAL: the t function must be stable (same reference across renders).
// OfficeDocRenderer's useCallback depends on `t`; if t changes every render,
// convertDocument is recreated → useEffect re-fires → infinite loop in tests.
const { stableT } = vi.hoisted(() => ({
  stableT: (key: string) => {
    const map: Record<string, string> = {
      "workspace.converting": "Converting...",
      "workspace.download": "Download",
      "workspace.retry": "Retry",
      "workspace.reload": "Reload",
      "workspace.convertFailed": "Conversion failed",
      "workspace.noFileUrl": "No file URL",
      "workspace.clientSideConverting": "Parsing in browser...",
      "workspace.clientSideConvertFailed": "Client-side parsing failed",
      "workspace.clientSidePreview": "Client-side preview",
    };
    return map[key] || key;
  },
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: stableT }),
}));

import OfficeDocRenderer from "../OfficeDocRenderer";

function makeContext(
  overrides: Partial<RendererContext> = {},
): RendererContext {
  const artifact: WorkspaceArtifact = {
    id: "test-doc-1",
    title: "test.docx",
    source: "tool_call",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    extension: "docx",
    binaryUrl: "/api/workspace/binary-files/test.docx",
    ...overrides.artifact,
  };

  return {
    artifact,
    readOnly: true,
    theme: "light",
    locale: "en",
    workspace: {
      updateArtifact: vi.fn(),
      closeTab: vi.fn(),
      openArtifact: vi.fn(),
      download: vi.fn(),
      fullscreen: vi.fn(),
    },
    ...overrides,
  };
}

describe("OfficeDocRenderer", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    cleanup();
    global.fetch = originalFetch;
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  it("shows loading spinner initially", () => {
    // A fetch that never calls resolve keeps the component in loading state.
    // We use a simple mock without timers to avoid leaking fake timers.
    global.fetch = vi.fn(
      () => new Promise(() => {}),
    ) as unknown as typeof global.fetch;

    const ctx = makeContext();
    const { container } = render(<OfficeDocRenderer {...ctx} />);

    // antd Spin renders with .ant-spin class
    expect(container.querySelector(".ant-spin")).toBeTruthy();
  });

  it("renders iframe with HTML on successful conversion", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            html: "<p>Test content</p>",
          }),
      }),
    ) as unknown as typeof global.fetch;

    const ctx = makeContext();
    const { container } = render(<OfficeDocRenderer {...ctx} />);

    await waitFor(() => {
      const iframe = container.querySelector("iframe");
      expect(iframe).toBeTruthy();
    });

    const iframe = container.querySelector("iframe")!;
    expect(iframe.getAttribute("srcDoc")).toContain("Test content");
    // Should contain theme-aware styling
    expect(iframe.getAttribute("srcDoc")).toContain("<style>");
    expect(iframe.getAttribute("srcDoc")).toContain("font-family");
  });

  it("includes page-break CSS in the styled HTML", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            html: '<p>Page 1</p><div class="docx-page-break"></div><p>Page 2</p>',
          }),
      }),
    ) as unknown as typeof global.fetch;

    const ctx = makeContext();
    const { container } = render(<OfficeDocRenderer {...ctx} />);

    await waitFor(() => {
      const iframe = container.querySelector("iframe");
      expect(iframe).toBeTruthy();
    });

    const srcDoc = container.querySelector("iframe")!.getAttribute("srcDoc")!;
    expect(srcDoc).toContain("docx-page-break");
    expect(srcDoc).toContain("Page Break");
  });

  it("shows client-side OOXML fallback for docx on 404 or 405", async () => {
    // Test 404 — docx is OOXML, so should route to client-side fallback.
    // OfficeOoxmlPreview is mocked to return null, so we verify routing by
    // checking: (1) loading spinner is gone, (2) no iframe (success),
    // (3) no "Download" button (download-only would show for legacy formats).
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ detail: "Not found" }),
      }),
    ) as unknown as typeof global.fetch;

    const { container, unmount: unmount1 } = render(
      <OfficeDocRenderer {...makeContext()} />,
    );
    await waitFor(
      () => {
        expect(container.querySelector(".ant-spin")).not.toBeInTheDocument();
        expect(container.querySelector("iframe")).not.toBeInTheDocument();
        expect(screen.queryByText("Download")).not.toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    unmount1();

    // Test 405 — same behavior
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 405,
        json: () => Promise.resolve({ detail: "Method not allowed" }),
      }),
    ) as unknown as typeof global.fetch;

    const { container: container2 } = render(
      <OfficeDocRenderer {...makeContext()} />,
    );
    await waitFor(
      () => {
        expect(container2.querySelector(".ant-spin")).not.toBeInTheDocument();
        expect(container2.querySelector("iframe")).not.toBeInTheDocument();
        expect(screen.queryByText("Download")).not.toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });

  it("shows download-only fallback for legacy doc on 404", async () => {
    // Legacy .doc (not OOXML) → download-only fallback
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ detail: "Not found" }),
      }),
    ) as unknown as typeof global.fetch;

    const ctx = makeContext({
      artifact: {
        id: "test-doc-legacy",
        title: "legacy.doc",
        source: "tool_call",
        mimeType: "application/msword",
        extension: "doc",
        binaryUrl: "/api/workspace/binary-files/legacy.doc",
      },
    });

    render(<OfficeDocRenderer {...ctx} />);
    await waitFor(
      () => {
        expect(screen.getByText("Download")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("shows client-side fallback on network error for OOXML", async () => {
    global.fetch = vi.fn(() =>
      Promise.reject(new Error("Network error")),
    ) as unknown as typeof global.fetch;

    const ctx = makeContext();
    const { container } = render(<OfficeDocRenderer {...ctx} />);

    await waitFor(
      () => {
        expect(container.querySelector(".ant-spin")).not.toBeInTheDocument();
        expect(container.querySelector("iframe")).not.toBeInTheDocument();
        expect(screen.queryByText("Download")).not.toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });

  it("applies dark theme colors in iframe HTML", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            html: "<p>Dark mode test</p>",
          }),
      }),
    ) as unknown as typeof global.fetch;

    const ctx = makeContext({ theme: "dark" });
    const { container } = render(<OfficeDocRenderer {...ctx} />);

    await waitFor(() => {
      const iframe = container.querySelector("iframe");
      expect(iframe).toBeTruthy();
    });

    const srcDoc = container.querySelector("iframe")!.getAttribute("srcDoc")!;
    // Dark mode should use dark background
    expect(srcDoc).toContain("#1e1e1e");
    expect(srcDoc).toContain("#d4d4d4");
  });

  it("applies light theme colors in iframe HTML", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            html: "<p>Light mode test</p>",
          }),
      }),
    ) as unknown as typeof global.fetch;

    const ctx = makeContext({ theme: "light" });
    const { container } = render(<OfficeDocRenderer {...ctx} />);

    await waitFor(() => {
      const iframe = container.querySelector("iframe");
      expect(iframe).toBeTruthy();
    });

    const srcDoc = container.querySelector("iframe")!.getAttribute("srcDoc")!;
    // Light mode should use white background
    expect(srcDoc).toContain("#ffffff");
    expect(srcDoc).toContain("#333333");
  });

  it("sends auth headers in the fetch request", async () => {
    const fetchMock = vi.fn((_url: string, _opts: RequestInit) =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ html: "<p>test</p>" }),
      }),
    );
    global.fetch = fetchMock as unknown as typeof global.fetch;

    const ctx = makeContext();
    render(<OfficeDocRenderer {...ctx} />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    const calls = fetchMock.mock.calls as unknown as [string, RequestInit][];
    const options = calls[0][1];
    const headers = options.headers as Record<string, string>;
    expect(headers["Authorization"]).toBe("Bearer test-token");
    expect(headers["X-Agent-Id"]).toBe("test-agent");
    expect(headers["Content-Type"]).toBe("application/json");
  });

  it("sends file URL in request body", async () => {
    const fetchMock = vi.fn((_url: string, _opts: RequestInit) =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ html: "<p>test</p>" }),
      }),
    );
    global.fetch = fetchMock as unknown as typeof global.fetch;

    const ctx = makeContext({
      artifact: {
        id: "doc-1",
        title: "report.docx",
        source: "tool_call",
        mimeType:
          "application/vnd.openxmlformats-officedocument" +
          ".wordprocessingml.document",
        extension: "docx",
        binaryUrl: "/api/workspace/binary-files/report.docx",
      },
    });
    render(<OfficeDocRenderer {...ctx} />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    const calls = fetchMock.mock.calls as unknown as [string, RequestInit][];
    const body = JSON.parse(calls[0][1].body as string);
    expect(body.url).toBe("/api/workspace/binary-files/report.docx");
  });
});
