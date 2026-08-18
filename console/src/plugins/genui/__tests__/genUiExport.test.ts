import { afterEach, describe, expect, it, vi } from "vitest";
import * as htmlToImage from "html-to-image";
import { exportGenUiPng, printGenUiPdf } from "@genui-src/lib/genUiExport";
import type { GenUiNode } from "@genui-src/types/genUi";

describe("genUiExport", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rasterizes PNG through html-to-image", async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const toPng = vi.spyOn(htmlToImage, "toPng");
    await exportGenUiPng(document.createElement("div"), "card-1");
    expect(toPng).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
  });

  it("prints PDF from the HTML export document with blob images inlined", async () => {
    const write = vi.fn();
    const popup = {
      document: { open: vi.fn(), write, close: vi.fn(), readyState: "complete" },
      addEventListener: vi.fn(),
      focus: vi.fn(),
      print: vi.fn(),
      close: vi.fn(),
    };
    vi.spyOn(window, "open").mockReturnValue(popup as any);
    const host = document.createElement("div");
    const img = document.createElement("img");
    img.setAttribute("data-genui-media-source", "blob:example");
    img.src = "data:image/png;base64,aaaa";
    host.appendChild(img);
    const tree: GenUiNode = {
      nodeId: "root",
      kind: "Image",
      props: { src: "blob:example", alt: "shot" },
      children: [],
    };
    await printGenUiPdf(host, tree, {}, "card-1");
    expect(write).toHaveBeenCalled();
    const html = String(write.mock.calls[0][0]);
    expect(html).toContain("<!doctype html>");
    expect(html).toContain("data:image/png;base64,aaaa");
    expect(html).not.toContain("blob:example");
    expect(popup.print).toHaveBeenCalled();
  });
});
