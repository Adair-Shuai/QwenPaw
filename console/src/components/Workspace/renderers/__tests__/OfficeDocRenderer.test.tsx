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

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "workspace.converting": "Converting...",
        "workspace.download": "Download",
        "workspace.retry": "Retry",
        "workspace.reload": "Reload",
        "workspace.convertFailed": "Conversion failed",
        "workspace.noFileUrl": "No file URL",
      };
      return map[key] || key;
    },
  }),
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
    global.fetch = vi.fn(() => new Promise(() => {})) as unknown as typeof global.fetch;

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

  it("shows fallback download mode on 404 or 405", async () => {
    // Test 404
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ detail: "Not found" }),
      }),
    ) as unknown as typeof global.fetch;

    const { unmount: unmount1 } = render(<OfficeDocRenderer {...makeContext()} />);
    await waitFor(
      () => {
        expect(screen.getByText("Download")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    unmount1();

    // Test 405
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 405,
        json: () => Promise.resolve({ detail: "Method not allowed" }),
      }),
    ) as unknown as typeof global.fetch;

    render(<OfficeDocRenderer {...makeContext()} />);
    await waitFor(
      () => {
        expect(screen.getByText("Download")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("shows fallback on network error", async () => {
    global.fetch = vi.fn(() =>
      Promise.reject(new Error("Network error")),
    ) as unknown as typeof global.fetch;

    const ctx = makeContext();
    render(<OfficeDocRenderer {...ctx} />);

    await waitFor(() => {
      expect(screen.getByText("Download")).toBeInTheDocument();
    });
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
    const fetchMock = vi.fn(() =>
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

    const call = fetchMock.mock.calls[0];
    const options = call[1] as RequestInit;
    const headers = options.headers as Record<string, string>;
    expect(headers["Authorization"]).toBe("Bearer test-token");
    expect(headers["X-Agent-Id"]).toBe("test-agent");
    expect(headers["Content-Type"]).toBe("application/json");
  });

  it("sends file URL in request body", async () => {
    const fetchMock = vi.fn(() =>
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
        mimeType: "application/vnd.openxmlformats-officedocument"
          + ".wordprocessingml.document",
        extension: "docx",
        binaryUrl: "/api/workspace/binary-files/report.docx",
      },
    });
    render(<OfficeDocRenderer {...ctx} />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    const call = fetchMock.mock.calls[0];
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body.url).toBe("/api/workspace/binary-files/report.docx");
  });
});
