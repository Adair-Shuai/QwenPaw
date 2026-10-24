import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from "@testing-library/react";
import OfficePreviewRenderer from "../OfficePreviewRenderer";
import { Suspense } from "react";
import {
  registerBuiltinRenderers,
  unregisterBuiltinRenderers,
} from "../../store/builtinRenderers";
import { rendererRegistry } from "../../store/rendererRegistry";
import { _clearConvertCache } from "../OfficeDocRenderer";
import type { RendererContext } from "../../types";

const { t } = vi.hoisted(() => ({
  t: (key: string, fallback?: string) => fallback ?? key,
}));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t }) }));
vi.mock("@/api/authHeaders", () => ({
  buildWorkspaceScopeHeaders: (scope: Record<string, string>) => ({
    "X-Agent-Id": scope.agentId,
    "X-Chat-Id": scope.chatId,
  }),
}));

function context(chatId = "chat-one"): RendererContext {
  return {
    artifact: {
      id: "doc",
      title: "example.docx",
      source: "generated",
      extension: "docx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      binaryUrl:
        "/api/workspace/file-download?path=example.docx&root=workspace",
      agentId: "agent-one",
      chatId,
    },
    theme: "light",
    locale: "zh",
    readOnly: true,
    workspace: {
      updateArtifact: vi.fn(),
      closeTab: vi.fn(),
      openArtifact: vi.fn(),
      download: vi.fn(),
      fullscreen: vi.fn(),
    },
  };
}

beforeEach(() => {
  _clearConvertCache();
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) =>
      url.endsWith("office-screenshot")
        ? {
            ok: true,
            status: 200,
            blob: async () => new Blob(["image"]),
            headers: new Headers({ "X-Total-Pages": "2" }),
          }
        : {
            ok: true,
            status: 200,
            json: async () => ({
              html: "<html><body>Engine preview</body></html>",
            }),
          },
    ),
  );
  vi.stubGlobal(
    "URL",
    Object.assign(URL, {
      createObjectURL: vi.fn(() => "blob:preview"),
      revokeObjectURL: vi.fn(),
    }),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Office preview integration", () => {
  it("pages the real print renderer, bounds zoom, and resets page on chat change", async () => {
    const { rerender, container } = render(
      <OfficePreviewRenderer {...context()} initialMode="print" />,
    );
    await waitFor(() => expect(container.querySelector("img")).toBeTruthy());
    const next = screen.getByRole("img", { name: "right" }).closest("button")!;
    const previous = screen
      .getByRole("img", { name: "left" })
      .closest("button")!;
    expect(previous).toBeDisabled();
    fireEvent.click(next);
    await waitFor(() =>
      expect(
        JSON.parse(
          String(
            vi.mocked(fetch).mock.calls[
              vi.mocked(fetch).mock.calls.length - 1
            ]?.[1]?.body,
          ),
        ).page,
      ).toBe(2),
    );
    expect(next).toBeDisabled();
    for (let i = 0; i < 6; i++)
      fireEvent.click(screen.getByRole("button", { name: "放大" }));
    expect(screen.getByRole("button", { name: "放大" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "重置缩放" })).toHaveTextContent(
      "200%",
    );
    rerender(
      <OfficePreviewRenderer {...context("chat-two")} initialMode="print" />,
    );
    await waitFor(() =>
      expect(
        JSON.parse(
          String(
            vi.mocked(fetch).mock.calls[
              vi.mocked(fetch).mock.calls.length - 1
            ]?.[1]?.body,
          ),
        ).page,
      ).toBe(1),
    );
    expect(screen.getByRole("button", { name: "重置缩放" })).toHaveTextContent(
      "100%",
    );
  });

  it("does not display late HTML from the previous chat", async () => {
    let resolveOld!: (value: Response) => void;
    vi.mocked(fetch).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveOld = resolve;
        }),
    );
    const { rerender, container } = render(
      <OfficePreviewRenderer {...context()} />,
    );
    rerender(<OfficePreviewRenderer {...context("chat-two")} />);
    await waitFor(() =>
      expect(
        container.querySelector("iframe")?.getAttribute("srcdoc"),
      ).toContain("Engine preview"),
    );
    await act(async () => {
      resolveOld({
        ok: true,
        json: async () => ({
          html: "Obsolete private document",
          engine: "officecli",
        }),
      } as Response);
    });
    expect(
      container.querySelector("iframe")?.getAttribute("srcdoc"),
    ).not.toContain("Obsolete private document");
  });
  it("keeps real reading and print renderers reachable with scoped requests", async () => {
    registerBuiltinRenderers();
    const Registered = rendererRegistry.match(context().artifact)!.renderer
      .component;
    const { container } = render(
      <Suspense fallback="loading">
        <Registered {...context()} />
      </Suspense>,
    );
    unregisterBuiltinRenderers();
    await waitFor(() =>
      expect(
        container.querySelector("iframe")?.getAttribute("srcdoc"),
      ).toContain("Engine preview"),
    );
    fireEvent.click(screen.getByText("打印版式"));
    await waitFor(() =>
      expect(container.querySelector("img")?.getAttribute("src")).toBe(
        "blob:preview",
      ),
    );
    expect(
      vi
        .mocked(fetch)
        .mock.calls.some(
          ([url, options]) =>
            String(url).endsWith("office-screenshot") &&
            (options?.headers as Record<string, string>)["X-Chat-Id"] ===
              "chat-one",
        ),
    ).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "放大" }));
    expect(screen.getByRole("button", { name: "重置缩放" })).toHaveTextContent(
      "125%",
    );
    fireEvent.click(screen.getByText("文档阅读"));
    await waitFor(() => expect(container.querySelector("iframe")).toBeTruthy());
    fireEvent.click(screen.getByText("打印版式"));
    await waitFor(() => expect(container.querySelector("img")).toBeTruthy());
  });

  it("retains the mode selector after print failure so print can be retried", async () => {
    vi.mocked(fetch).mockImplementation(async (url) =>
      String(url).endsWith("office-screenshot")
        ? ({ status: 404, ok: false } as Response)
        : ({
            status: 200,
            ok: true,
            json: async () => ({ html: "<p>Fallback preview</p>" }),
          } as Response),
    );
    const { container } = render(
      <OfficePreviewRenderer {...context()} initialMode="print" />,
    );
    await waitFor(() => expect(container.querySelector("iframe")).toBeTruthy());
    expect(
      screen.getByText("打印版式暂不可用，已显示文档阅读预览。"),
    ).toBeTruthy();
    fireEvent.click(screen.getByText("文档阅读"));
    fireEvent.click(screen.getByText("打印版式"));
    await waitFor(() =>
      expect(
        vi
          .mocked(fetch)
          .mock.calls.filter(([url]) =>
            String(url).endsWith("office-screenshot"),
          ),
      ).toHaveLength(2),
    );
  });

  it("resets print state and rejects a late response when changing chat scope", async () => {
    let resolveOld!: (value: Response) => void;
    vi.mocked(fetch).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveOld = resolve;
        }),
    );
    const { rerender, container } = render(
      <OfficePreviewRenderer {...context()} initialMode="print" />,
    );
    rerender(
      <OfficePreviewRenderer {...context("chat-two")} initialMode="print" />,
    );
    await waitFor(() => expect(container.querySelector("img")).toBeTruthy());
    resolveOld({ status: 404, ok: false } as Response);
    await waitFor(() => expect(container.querySelector("img")).toBeTruthy());
    expect(
      screen.queryByText("打印版式暂不可用，已显示文档阅读预览。"),
    ).toBeNull();
  });
});
