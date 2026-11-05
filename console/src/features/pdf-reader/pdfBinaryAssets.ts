// Resolve local PDF.js resources at build time; download only requested assets.
const assets = {
  ...import.meta.glob<string>(
    "../../../node_modules/pdfjs-dist/cmaps/*.bcmap",
    { query: "?url", import: "default", eager: true, exhaustive: true },
  ),
  ...import.meta.glob<string>(
    "../../../node_modules/pdfjs-dist/standard_fonts/*",
    { query: "?url", import: "default", eager: true, exhaustive: true },
  ),
};
const urls = new Map(
  Object.entries(assets).map(([path, url]) => [path.split("/").pop()!, url]),
);
const pending = new Map<string, Promise<Uint8Array>>();

/** PDF.js 6 resource factory, including Chinese fonts without embedded CMaps. */
export class BundledPdfBinaryDataFactory {
  async fetch({ kind, filename }: { kind: string; filename: string }) {
    const url = urls.get(filename);
    if (
      !url ||
      !["cMapUrl", "standardFontDataUrl"].includes(kind) ||
      (kind === "cMapUrl" && !filename.endsWith(".bcmap"))
    ) {
      throw new Error("Unsupported PDF font resource");
    }
    let request = pending.get(url);
    if (!request) {
      request = fetch(url)
        .then(async (response) => {
          if (!response.ok) throw new Error("PDF font resource unavailable");
          return new Uint8Array(await response.arrayBuffer());
        })
        .catch((error) => {
          pending.delete(url);
          throw error;
        });
      pending.set(url, request);
    }
    // Worker messages may transfer buffers, so every caller owns its bytes.
    return (await request).slice();
  }
}
