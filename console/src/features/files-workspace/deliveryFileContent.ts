import type { SessionFilesScope } from "../../api/modules/turnFiles";
import {
  downloadFileFromUrl,
  triggerBrowserDownload,
} from "../../utils/downloadFileFromUrl";
import { prepareDeliveryFileRequest } from "./deliveryFileNative";
import type { FileTarget } from "./types";

export async function readDeliveryFileBlob(
  target: FileTarget,
  scope: SessionFilesScope,
): Promise<Blob> {
  const request = prepareDeliveryFileRequest(target, scope);
  const response = await fetch(request.url, {
    headers: request.headers,
    credentials: request.credentials,
    redirect: "error",
    cache: "no-store",
  });
  if (!response.ok)
    throw new Error(`Delivery file read failed: ${response.status}`);
  return response.blob();
}

export async function downloadDeliveryContent(
  target: FileTarget,
  scope: SessionFilesScope,
): Promise<void> {
  const request = prepareDeliveryFileRequest(target, scope);
  if (request.url.startsWith("data:")) {
    triggerBrowserDownload(
      await readDeliveryFileBlob(target, scope),
      request.fileName,
    );
    return;
  }
  await downloadFileFromUrl(request.url, request.fileName, {
    headers: request.headers,
  });
}

async function clipboardPng(blob: Blob): Promise<Blob> {
  if (blob.type === "image/png") return blob;
  const url = URL.createObjectURL(blob);
  const image = new Image();
  image.src = url;
  try {
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context || !canvas.width || !canvas.height)
      throw new Error("Image cannot be decoded");
    context.drawImage(image, 0, 0);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) =>
          result
            ? resolve(result)
            : reject(new Error("Image conversion failed")),
        "image/png",
      );
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function copyDeliveryImage(
  target: FileTarget,
  scope: SessionFilesScope,
  isCurrent: () => boolean,
): Promise<void> {
  if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
    throw new Error("Image clipboard is unavailable");
  }
  const bytes = readDeliveryFileBlob(target, scope)
    .then(clipboardPng)
    .then((blob) => {
      if (!isCurrent())
        throw new DOMException(
          "File request is no longer current",
          "AbortError",
        );
      return blob;
    });
  await navigator.clipboard.write([new ClipboardItem({ "image/png": bytes })]);
}
