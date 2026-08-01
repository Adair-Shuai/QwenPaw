import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { ComponentType, CSSProperties, ForwardedRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

interface MockListHandle {
  scrollToItem: (index: number, align?: string) => void;
  resetAfterIndex: (index: number, forceUpdate?: boolean) => void;
}

interface MockListProps {
  children: ComponentType<{
    index: number;
    style: CSSProperties;
    data: unknown;
  }>;
  itemCount: number;
  itemData: unknown;
  itemSize: (index: number) => number;
  width: number;
  onItemsRendered?: (range: {
    overscanStartIndex: number;
    overscanStopIndex: number;
    visibleStartIndex: number;
    visibleStopIndex: number;
  }) => void;
}

const { scrollToItem, resetAfterIndex, MockVariableSizeList } = vi.hoisted(
  () => {
    // Vitest executes this factory before ESM imports are initialized.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require("react");
    const scrollToItem = vi.fn();
    const resetAfterIndex = vi.fn();
    const MockVariableSizeList = React.forwardRef(
      (props: MockListProps, ref: ForwardedRef<MockListHandle>) => {
        const {
          children: Row,
          itemCount,
          itemData,
          itemSize,
          onItemsRendered,
          width,
        } = props;
        React.useImperativeHandle(ref, () => ({
          scrollToItem,
          resetAfterIndex,
        }));
        React.useEffect(() => {
          onItemsRendered?.({
            overscanStartIndex: 0,
            overscanStopIndex: Math.min(1, itemCount - 1),
            visibleStartIndex: 0,
            visibleStopIndex: Math.min(1, itemCount - 1),
          });
        }, [itemCount, onItemsRendered]);
        return React.createElement(
          "div",
          { "data-testid": "virtual-pdf-list" },
          Array.from({ length: Math.min(2, itemCount) }, (_, index) =>
            React.createElement(Row, {
              key: index,
              index,
              style: { width, height: itemSize(index) },
              data: itemData,
            }),
          ),
        );
      },
    );
    return { scrollToItem, resetAfterIndex, MockVariableSizeList };
  },
);

vi.mock("react-window", () => ({
  VariableSizeList: MockVariableSizeList,
}));

const {
  loadLightweightPdfJs,
  getDocument,
  loadingDestroy,
  getPage,
  pageCleanup,
  renderPage,
  renderCancel,
} = vi.hoisted(() => {
  const renderCancel = vi.fn();
  const renderPage = vi.fn(() => ({
    promise: Promise.resolve(),
    cancel: renderCancel,
  }));
  const pageCleanup = vi.fn();
  const page = {
    getViewport: ({ scale }: { scale: number }) => ({
      width: 600 * scale,
      height: 800 * scale,
    }),
    render: renderPage,
    cleanup: pageCleanup,
  };
  const getPage = vi.fn(() => Promise.resolve(page));
  const document = { numPages: 4, getPage };
  const loadingDestroy = vi.fn(() => Promise.resolve());
  const getDocument = vi.fn(() => ({
    promise: Promise.resolve(document),
    destroy: loadingDestroy,
  }));
  return {
    loadLightweightPdfJs: vi.fn(() =>
      Promise.resolve({ pdfjs: { getDocument }, worker: {} }),
    ),
    getDocument,
    loadingDestroy,
    getPage,
    pageCleanup,
    renderPage,
    renderCancel,
  };
});

vi.mock("@/features/pdf-reader/lightweightPdf", () => ({
  loadLightweightPdfJs,
}));

import LightweightPdfViewer from "../LightweightPdfViewer";
import { constrainCanvasScale } from "../pdfViewerLimits";

class ResizeObserverMock {
  callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe() {
    this.callback([], this as unknown as ResizeObserver);
  }

  disconnect() {}

  unobserve() {}
}

describe("LightweightPdfViewer", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(800);
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(600);
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      {} as CanvasRenderingContext2D,
    );
    getDocument.mockClear();
    getPage.mockClear();
    renderPage.mockClear();
    renderCancel.mockClear();
    pageCleanup.mockClear();
    loadingDestroy.mockClear();
    scrollToItem.mockClear();
    resetAfterIndex.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("uses authenticated strict Range loading for large workspace PDFs", async () => {
    render(
      <LightweightPdfViewer
        url="/api/workspace/binary-files/report.pdf"
        headers={{ Authorization: "Bearer token", "X-Agent-Id": "agent-b" }}
        fileSize={32 * 1024 * 1024}
        theme="light"
      />,
    );

    await waitFor(() => expect(renderPage).toHaveBeenCalled());
    expect(getDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/api/workspace/binary-files/report.pdf",
        httpHeaders: {
          Authorization: "Bearer token",
          "X-Agent-Id": "agent-b",
        },
        rangeChunkSize: 256 * 1024,
        disableRange: false,
        disableStream: true,
        disableAutoFetch: true,
      }),
    );
    expect(getPage).toHaveBeenCalledWith(1);
    expect(screen.getByLabelText("PDF 页面 1")).toBeVisible();
  });

  it("renders a continuous virtual page window and jumps from the page input", async () => {
    const { unmount } = render(
      <LightweightPdfViewer url="/report.pdf" theme="dark" />,
    );
    await waitFor(() => expect(renderPage).toHaveBeenCalledTimes(2));

    expect(getPage).toHaveBeenCalledWith(1);
    expect(getPage).toHaveBeenCalledWith(2);
    expect(getPage).not.toHaveBeenCalledWith(3);
    expect(screen.getByLabelText("PDF 页面 1")).toBeVisible();
    expect(screen.getByLabelText("PDF 页面 2")).toBeVisible();

    fireEvent.change(screen.getByLabelText("页码"), {
      target: { value: "4" },
    });
    await waitFor(() => expect(scrollToItem).toHaveBeenCalledWith(3, "start"));

    unmount();
    expect(renderCancel).toHaveBeenCalled();
    expect(loadingDestroy).toHaveBeenCalled();
    expect(pageCleanup).toHaveBeenCalledTimes(2);
  });

  it("cleans up a page that resolves after fast scrolling unmounts its row", async () => {
    type DeferredPage = Awaited<ReturnType<typeof getPage>>;
    let resolvePage: ((page: DeferredPage) => void) | undefined;
    const lateCleanup = vi.fn();
    const pagePromise = new Promise<DeferredPage>((resolve) => {
      resolvePage = resolve;
    });
    getPage.mockImplementationOnce(() => pagePromise);

    const { unmount } = render(
      <LightweightPdfViewer url="/large-report.pdf" theme="light" />,
    );
    await waitFor(() => expect(getPage).toHaveBeenCalledWith(1));
    unmount();

    await act(async () => {
      resolvePage?.({
        getViewport: ({ scale }: { scale: number }) => ({
          width: 600 * scale,
          height: 800 * scale,
        }),
        render: renderPage,
        cleanup: lateCleanup,
      });
      await Promise.resolve();
    });

    expect(lateCleanup).toHaveBeenCalledTimes(1);
  });

  it("caps high-DPI canvas memory on Windows and macOS displays", () => {
    const constrained = constrainCanvasScale(2400, 3200, 2.5);
    const pixels =
      constrained.cssWidth *
      constrained.cssHeight *
      constrained.outputScale *
      constrained.outputScale;

    expect(constrained.outputScale).toBeLessThan(2);
    expect(pixels).toBeLessThanOrEqual(8_000_001);
  });
});
