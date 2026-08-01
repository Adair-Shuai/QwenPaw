import type * as PdfJsTypes from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

let modulePromise: Promise<typeof PdfJsTypes> | null = null;
let sharedWorker: PdfJsTypes.PDFWorker | null = null;

/** Lazily load PDF.js and reuse one worker across all Workspace PDF tabs. */
export async function loadLightweightPdfJs(): Promise<{
  pdfjs: typeof PdfJsTypes;
  worker: PdfJsTypes.PDFWorker;
}> {
  modulePromise ??= import("pdfjs-dist");
  const pdfjs = await modulePromise;
  (pdfjs.GlobalWorkerOptions as unknown as { workerSrc: string }).workerSrc =
    workerUrl;
  sharedWorker ??= pdfjs.PDFWorker.create({ name: "qwenpaw-workspace-pdf" });
  return { pdfjs, worker: sharedWorker };
}

/** Test/app-shutdown hook. Normal tab closes intentionally keep the worker. */
export async function destroySharedPdfWorker(): Promise<void> {
  const worker = sharedWorker;
  sharedWorker = null;
  if (worker) await worker.destroy();
}
