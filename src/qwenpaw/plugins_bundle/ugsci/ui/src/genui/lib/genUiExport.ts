/** GenUI export helpers. PNG uses lazy html-to-image; HTML/PDF share the walker. */

import type { GenUiNode } from "../types/genUi";
import { buildGenUiHtmlDocument } from "./genUiHtmlRender";

function triggerDownload(href: string, filename: string): void {
  const link = document.createElement("a");
  link.download = filename;
  link.href = href;
  link.click();
}

export async function exportGenUiPng(element: HTMLElement, filename: string): Promise<void> {
  const { toPng } = await import("html-to-image");
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    backgroundColor: "#ffffff",
  });
  triggerDownload(dataUrl, `${filename}.png`);
  console.info("[ugsci.genui] PNG export created", { filename, via: "html-to-image" });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("media encoding failed"));
    reader.readAsDataURL(blob);
  });
}

async function imageToDataUrl(image: HTMLImageElement): Promise<string | null> {
  const src = image.currentSrc || image.src;
  if (!src) return null;
  if (src.startsWith("data:")) return src;
  try {
    const response = await fetch(src);
    if (!response.ok) return null;
    return await blobToDataUrl(await response.blob());
  } catch {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d");
      if (!context || !canvas.width || !canvas.height) return null;
      context.drawImage(image, 0, 0);
      return canvas.toDataURL("image/png");
    } catch {
      return null;
    }
  }
}

async function collectEmbeddedMedia(element: HTMLElement): Promise<{ sources: Record<string, string>; missing: string[] }> {
  const sources: Record<string, string> = {};
  const missing: string[] = [];
  const images = Array.from(element.querySelectorAll<HTMLImageElement>("img[data-genui-media-source]"));
  await Promise.all(images.map(async (image) => {
    const source = image.dataset.genuiMediaSource || "";
    const dataUrl = await imageToDataUrl(image);
    if (!source) return;
    if (dataUrl) sources[source] = dataUrl;
    else missing.push(source);
  }));
  return { sources, missing: Array.from(new Set(missing)) };
}

/** Download the current GenUI card as an interactive standalone HTML file. */
export async function exportGenUiHtml(
  element: HTMLElement,
  tree: GenUiNode,
  values: Record<string, unknown>,
  filename: string,
  title = filename,
): Promise<void> {
  const embeddedMedia = await collectEmbeddedMedia(element);
  const documentHtml = buildGenUiHtmlDocument(tree, values, embeddedMedia, title);
  const blob = new Blob([documentHtml], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${filename}.html`);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  if (embeddedMedia.missing.length) console.warn("[ugsci.genui] HTML export has media that could not be embedded", { filename, missing: embeddedMedia.missing });
  console.info("[ugsci.genui] HTML export created", { filename, bytes: blob.size, embeddedMedia: Object.keys(embeddedMedia.sources).length, missingMedia: embeddedMedia.missing.length });
}

/** Print / save-as-PDF from the same HTML document as export, with blob images inlined. */
export async function printGenUiPdf(
  element: HTMLElement,
  tree: GenUiNode,
  values: Record<string, unknown>,
  title: string,
): Promise<void> {
  const embeddedMedia = await collectEmbeddedMedia(element);
  const documentHtml = buildGenUiHtmlDocument(tree, values, embeddedMedia, title);
  const popup = window.open("", "_blank", "noopener,noreferrer");
  if (!popup) throw new Error("print window was blocked");
  popup.document.open();
  popup.document.write(documentHtml);
  popup.document.close();
  await new Promise<void>((resolve) => {
    const finish = () => resolve();
    if (popup.document.readyState === "complete") {
      window.setTimeout(finish, 50);
      return;
    }
    popup.addEventListener("load", finish, { once: true });
    window.setTimeout(finish, 400);
  });
  popup.focus();
  popup.print();
  popup.close();
  if (embeddedMedia.missing.length) {
    console.warn("[ugsci.genui] PDF print has media that could not be embedded", { missing: embeddedMedia.missing });
  }
}
