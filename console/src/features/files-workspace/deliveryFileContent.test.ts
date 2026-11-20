import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { setRuntimeApiBaseUrl } from "../../api/config";
import type { SessionFilesScope } from "../../api/modules/turnFiles";
import type { FileTarget } from "./types";
const mocks = vi.hoisted(() => ({
  download: vi.fn(),
  browserDownload: vi.fn(),
  fetch: vi.fn(),
  write: vi.fn(),
}));
vi.mock("../../utils/downloadFileFromUrl", () => ({
  downloadFileFromUrl: mocks.download,
  triggerBrowserDownload: mocks.browserDownload,
}));
import {
  copyDeliveryImage,
  downloadDeliveryContent,
  readDeliveryFileBlob,
} from "./deliveryFileContent";

const scope: SessionFilesScope = {
  kind: "session",
  agentId: "a",
  sessionId: "runtime",
  chatId: "chat",
};
const file: FileTarget = {
  source: "artifact",
  path: "out/image.png",
  artifact: {
    id: "image",
    title: "image.png",
    source: "tool_call",
    mimeType: "image/png",
    agentId: "a",
    sessionId: "runtime",
    chatId: "chat",
    binaryUrl: "/api/archive/image?version=before",
    meta: { turnFileArchive: true, version: "before" },
  },
};
const clipboardDescriptor = Object.getOwnPropertyDescriptor(
  navigator,
  "clipboard",
);
let clipboardItems: Record<string, Promise<Blob>>[];
beforeEach(() => {
  vi.clearAllMocks();
  clipboardItems = [];
  setRuntimeApiBaseUrl("");
  localStorage.setItem("qwenpaw_auth_token", "secret");
  vi.stubGlobal("fetch", mocks.fetch);
  vi.stubGlobal(
    "ClipboardItem",
    class {
      constructor(items: Record<string, Promise<Blob>>) {
        clipboardItems.push(items);
      }
    },
  );
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { write: mocks.write },
  });
  mocks.write.mockImplementation(async () => {
    await Promise.all(clipboardItems.map((item) => item["image/png"]));
  });
  mocks.fetch.mockResolvedValue({
    ok: true,
    blob: async () =>
      new Blob([new Uint8Array([0, 255, 127])], { type: "image/png" }),
  });
});
afterEach(() => {
  if (clipboardDescriptor)
    Object.defineProperty(navigator, "clipboard", clipboardDescriptor);
  else Reflect.deleteProperty(navigator, "clipboard");
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  localStorage.clear();
  setRuntimeApiBaseUrl("");
});

it("copies the exact archived PNG with scoped credentials and retains clipboard user activation", async () => {
  const operation = copyDeliveryImage(file, scope, () => true);
  expect(mocks.write).toHaveBeenCalledTimes(1);
  await operation;
  expect(mocks.fetch).toHaveBeenCalledWith(
    expect.stringContaining("version=before"),
    {
      headers: {
        Authorization: "Bearer secret",
        "X-Agent-Id": "a",
        "X-Chat-Id": "chat",
      },
      credentials: "same-origin",
      redirect: "error",
      cache: "no-store",
    },
  );
  const blob = await clipboardItems[0]["image/png"];
  expect(blob.type).toBe("image/png");
  expect(Array.from(new Uint8Array(await blob.arrayBuffer()))).toEqual([
    0, 255, 127,
  ]);
});
it("rejects a clipboard result after the owning file changes", async () => {
  await expect(
    copyDeliveryImage(file, scope, () => false),
  ).rejects.toMatchObject({ name: "AbortError" });
});
it("keeps archive scope and origin rejection before any file read", async () => {
  await expect(
    readDeliveryFileBlob(file, { ...scope, agentId: "b" }),
  ).rejects.toThrow("scope");
  await expect(
    readDeliveryFileBlob(
      {
        ...file,
        artifact: {
          ...file.artifact!,
          binaryUrl: "https://other.example/private.png",
        },
      },
      scope,
    ),
  ).rejects.toThrow("backend");
  expect(mocks.fetch).not.toHaveBeenCalled();
});
it("does not send credentials to an external legacy image", async () => {
  await readDeliveryFileBlob(
    {
      source: "attachment",
      path: "image.png",
      artifactUrl: "https://example.com/image.png",
    },
    scope,
  );
  expect(mocks.fetch).toHaveBeenCalledWith(
    "https://example.com/image.png",
    expect.objectContaining({
      headers: {},
      credentials: "omit",
      redirect: "error",
    }),
  );
});
it("downloads HTTP archives through the existing native or browser save flow", async () => {
  await downloadDeliveryContent(file, scope);
  expect(mocks.download).toHaveBeenCalledWith(
    expect.stringContaining("version=before"),
    "image.png",
    { headers: expect.objectContaining({ "X-Chat-Id": "chat" }) },
  );
  expect(mocks.fetch).not.toHaveBeenCalled();
});
it("downloads saved inline content and rejects replacing an archive with inline bytes", async () => {
  const inline: FileTarget = {
    source: "attachment",
    path: "image.png",
    artifactUrl: "data:image/png;base64,AP9/",
  };
  await downloadDeliveryContent(inline, scope);
  expect(mocks.browserDownload).toHaveBeenCalledWith(
    expect.any(Blob),
    "image.png",
  );
  expect(mocks.fetch).toHaveBeenCalledWith(
    inline.artifactUrl,
    expect.objectContaining({ headers: {}, credentials: "omit" }),
  );
  await expect(
    readDeliveryFileBlob(
      {
        ...file,
        artifact: { ...file.artifact!, binaryUrl: inline.artifactUrl },
      },
      scope,
    ),
  ).rejects.toThrow();
});
it("converts a non-PNG image for the clipboard and releases its temporary URL", async () => {
  mocks.fetch.mockResolvedValue({
    ok: true,
    blob: async () => new Blob(["jpeg"], { type: "image/jpeg" }),
  });
  vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:conversion");
  const revoke = vi.spyOn(URL, "revokeObjectURL");
  vi.stubGlobal(
    "Image",
    class {
      src = "";
      naturalWidth = 2;
      naturalHeight = 3;
      decode = async () => {};
    },
  );
  const drawImage = vi.fn();
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    drawImage,
  } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(
    (callback) => callback(new Blob(["png"], { type: "image/png" })),
  );
  await copyDeliveryImage(file, scope, () => true);
  expect(drawImage).toHaveBeenCalledTimes(1);
  expect(revoke).toHaveBeenCalledWith("blob:conversion");
  expect((await clipboardItems[0]["image/png"]).type).toBe("image/png");
});
it("reports read failures without writing a successful clipboard payload", async () => {
  mocks.fetch.mockResolvedValue({ ok: false, status: 404 });
  await expect(copyDeliveryImage(file, scope, () => true)).rejects.toThrow(
    "404",
  );
});
