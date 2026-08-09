/** Browser-native GenUI export helpers without runtime dependencies. */

export async function exportGenUiPng(element: HTMLElement, filename: string): Promise<void> {
  const root = element.getBoundingClientRect();
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(root.width * scale); canvas.height = Math.ceil(Math.max(root.height, element.scrollHeight) * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas is unavailable");
  context.scale(scale, scale); context.fillStyle = "#fff"; context.fillRect(0, 0, canvas.width, canvas.height);
  for (const child of Array.from(element.querySelectorAll<HTMLElement>("*"))) {
    const rect = child.getBoundingClientRect();
    if (!rect.width || !rect.height) continue;
    const style = getComputedStyle(child); const x = rect.left - root.left; const y = rect.top - root.top;
    if (style.backgroundColor && style.backgroundColor !== "rgba(0, 0, 0, 0)") { context.fillStyle = style.backgroundColor; context.fillRect(x, y, rect.width, rect.height); }
    if (style.borderTopWidth !== "0px") { context.strokeStyle = style.borderTopColor; context.strokeRect(x, y, rect.width, rect.height); }
  }
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const textNode = walker.currentNode as Text; const text = textNode.textContent?.trim(); if (!text) continue;
    const range = document.createRange(); range.selectNodeContents(textNode); const rect = range.getBoundingClientRect();
    const parent = textNode.parentElement; if (!parent || !rect.width) continue;
    const style = getComputedStyle(parent); context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`; context.fillStyle = style.color || "#111"; context.textBaseline = "top";
    context.fillText(text, rect.left - root.left, rect.top - root.top, Math.max(1, root.width - (rect.left - root.left)));
  }
  for (const input of Array.from(element.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input,textarea"))) {
    if (!input.value) continue; const rect = input.getBoundingClientRect(); const style = getComputedStyle(input);
    context.font = `${style.fontSize} ${style.fontFamily}`; context.fillStyle = style.color || "#111"; context.fillText(input.value, rect.left - root.left + 8, rect.top - root.top + 6);
  }
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("PNG encoding failed")), "image/png"));
  const url = URL.createObjectURL(blob); const link = document.createElement("a");
  link.download = `${filename}.png`; link.href = url; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  console.info("[ugsci.genui] PNG export created", { filename, bytes: blob.size });
}

export function printGenUiPdf(element: HTMLElement, title: string): void {
  const popup = window.open("", "_blank", "noopener,noreferrer");
  if (!popup) throw new Error("print window was blocked");
  popup.document.write(`<!doctype html><html><head><title>${title}</title><style>body{font-family:system-ui;padding:24px}@media print{button{display:none}}</style></head><body>${element.outerHTML}</body></html>`);
  popup.document.close();
  popup.addEventListener("load", () => { popup.focus(); popup.print(); popup.close(); }, { once: true });
}
