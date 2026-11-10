import { describe, expect, it, vi } from "vitest";
import NativeRequestBuilder from "@agentscope-ai/chat/lib/AgentScopeRuntimeWebUI/core/AgentScopeRuntime/Request/Builder";
import {
  createRequestEditKeyResolver,
  getRequestEditTarget,
  getRequestEditSnapshot,
} from "./requestEditSnapshot";

const user = (content: unknown, metadata?: unknown) => ({
  role: "user",
  content,
  ...(metadata ? { metadata } : {}),
});
const text = (value: string) => ({ type: "text", text: value });
const input = (...content: unknown[]) => ({ input: [user(content)] });

describe("request edit frame identities", () => {
  it("resolves backend rewind targets from client or original IDs without inferring request IDs", () => {
    expect(
      getRequestEditTarget({
        input: [
          user([], {
            metadata: { qwenpaw_client_message_id: "client" },
            original_id: "native",
          }),
        ],
      }),
    ).toEqual({ client_message_id: "client" });
    expect(
      getRequestEditTarget({ input: [user([], { original_id: "native" })] }),
    ).toEqual({ message_id: "native" });
    expect(
      getRequestEditTarget({
        input: [user([], { metadata: { original_id: "wrapped" } })],
      }),
    ).toEqual({ message_id: "wrapped" });
    expect(
      getRequestEditTarget({
        id: "request-only",
        input: [user([text("same")])],
      }),
    ).toBeUndefined();
  });
  it("keeps a client identity across live/history clones and prefers it over original IDs", () => {
    const resolve = createRequestEditKeyResolver();
    const live = {
      input: [
        user([text("live")], {
          qwenpaw_client_message_id: "request-one",
          original_id: "old",
        }),
      ],
    };
    const history = {
      input: [
        user([text("history")], {
          original_id: "server-id",
          metadata: { qwenpaw_client_message_id: "request-one" },
        }),
      ],
    };
    expect(resolve(live)).toBe("cid:request-one");
    expect(resolve(structuredClone(live))).toBe(resolve(live));
    expect(resolve(history)).toBe(resolve(live));
  });

  it("uses outer or wrapped original metadata IDs with a separate namespace", () => {
    const resolve = createRequestEditKeyResolver();
    const outer = { input: [user([], { original_id: "shared-id" })] };
    const wrapped = {
      input: [user([], { metadata: { original_id: "shared-id" } })],
    };
    const client = {
      input: [user([], { qwenpaw_client_message_id: "shared-id" })],
    };
    expect(resolve(outer)).toBe("original:shared-id");
    expect(resolve(wrapped)).toBe(resolve(outer));
    expect(resolve(structuredClone(outer))).toBe(resolve(outer));
    expect(resolve(client)).not.toBe(resolve(outer));
  });

  it("never matches different ID-less objects by identical text or second timestamps", () => {
    const resolve = createRequestEditKeyResolver();
    const first = { ...input(text("same message")), created_at: 12345 };
    const second = structuredClone(first);
    expect(resolve(first)).not.toBe(resolve(second));
    expect(typeof resolve(first)).toBe("object");
    expect(resolve(first)).not.toBe(first);
  });

  it("retains an opaque key for the same object and isolates each resolver closure", () => {
    const resolve = createRequestEditKeyResolver();
    const data = input(text("draft"));
    const key = resolve(data);
    data.input[0].content = [text("updated body")];
    expect(resolve(data)).toBe(key);
    expect(Object.isFrozen(key)).toBe(true);
    expect(createRequestEditKeyResolver()(data)).not.toBe(key);
  });

  it("uses only the first user metadata, rejects empty/non-string IDs and never infers raw request IDs", () => {
    const resolve = createRequestEditKeyResolver();
    const first = {
      id: "request-id",
      metadata: { original_id: "not-user-metadata" },
      input: [
        {
          role: "assistant",
          metadata: { qwenpaw_client_message_id: "assistant" },
        },
        user([text("root")], {
          qwenpaw_client_message_id: " ",
          original_id: 42,
        }),
        user([text("later")], { qwenpaw_client_message_id: "later-user" }),
      ],
    };
    const key = resolve(first);
    expect(typeof key).toBe("object");
    expect(resolve(first)).toBe(key);
    expect(resolve(structuredClone(first))).not.toBe(key);
    expect(resolve(null)).not.toBe(resolve(null));
  });
});

describe("request edit snapshots", () => {
  it("reads native live builder content and keeps repeated text and attachments in order", () => {
    const built = new NativeRequestBuilder().handle({
      query: "original\nsecond line",
      fileList: [
        {
          uid: "1",
          name: "report.csv",
          type: "text/csv",
          size: 12,
          response: { url: "/files/report.csv" },
        },
        {
          uid: "2",
          name: "photo.png",
          type: "image/png",
          response: { url: "/files/photo.png" },
        },
        {
          uid: "3",
          name: "again.csv",
          type: "text/csv",
          size: 12,
          response: { url: "/files/report.csv" },
        },
      ],
    } as never);
    expect(getRequestEditSnapshot(built)).toEqual({
      text: "original\nsecond line",
      unsupported: false,
      attachments: [
        { url: "/files/report.csv", name: "report.csv", size: 12 },
        { url: "/files/photo.png", type: "image/*" },
        { url: "/files/report.csv", name: "again.csv", size: 12 },
      ],
    });
  });

  it("joins history text and labeled steering supplements without copying history metadata", () => {
    const result = getRequestEditSnapshot({
      input: [
        user(
          [
            text("original"),
            text("补充要求："),
            text("check first"),
            text("check first"),
          ],
          {
            original_id: "old",
            metadata: {
              qwenpaw_client_message_id: "old-client",
              qwenpaw_steering: { request_id: "old-guide" },
            },
          },
        ),
      ],
      qwenpaw_steering_supplements: [{ request_id: "must-not-replay" }],
    });
    expect(result).toEqual({
      text: "original\n补充要求：\ncheck first\ncheck first",
      attachments: [],
      unsupported: false,
    });
  });

  it("keeps attachment-only image string/object and file URL/name/size/MIME references", () => {
    expect(
      getRequestEditSnapshot(
        input(
          {
            type: "image_url",
            image_url: { url: "/first.png", detail: "high" },
          },
          { type: "image", image_url: "/second.webp", mime_type: "image/webp" },
          {
            type: "file",
            file_url: { url: "/report.pdf" },
            filename: "report.pdf",
            size: 21,
            mimeType: "application/pdf",
          },
        ),
      ),
    ).toEqual({
      text: "",
      unsupported: false,
      attachments: [
        { url: "/first.png", type: "image/*" },
        { url: "/second.webp", type: "image/webp" },
        {
          url: "/report.pdf",
          name: "report.pdf",
          size: 21,
          type: "application/pdf",
        },
      ],
    });
  });

  it("rebuilds native audio/video through fileList without changing their URLs or audio format", () => {
    const original = input(
      {
        type: "audio",
        audio_url: "/recording.mp3",
        data: "/recording.mp3",
        format: "mp3",
      },
      { type: "video", video_url: "/clip.webm" },
    );
    const snapshot = getRequestEditSnapshot(original)!;
    expect(snapshot.unsupported).toBe(false);
    const rebuilt = new NativeRequestBuilder().handle({
      query: snapshot.text,
      fileList: snapshot.attachments.map((a, i) => ({
        ...a,
        uid: String(i),
        response: { url: a.url },
      })),
    } as never);
    expect(rebuilt.input[0].content.slice(1)).toMatchObject([
      {
        type: "audio",
        audio_url: "/recording.mp3",
        data: "/recording.mp3",
        format: "mp3",
      },
      { type: "video", video_url: "/clip.webm" },
    ]);
  });

  it("supports URL audio with explicit MIME and data URLs with explicit format without fetching", () => {
    const fetch = vi.spyOn(globalThis, "fetch");
    try {
      expect(
        getRequestEditSnapshot(
          input(
            { type: "audio", audio_url: "/voice.ogg", mime_type: "audio/ogg" },
            {
              type: "audio",
              data: "data:audio/wav;base64,UklGRg==",
              format: "wav",
            },
          ),
        )?.attachments,
      ).toEqual([
        { url: "/voice.ogg", type: "audio/ogg" },
        { url: "data:audio/wav;base64,UklGRg==", type: "audio/wav" },
      ]);
      expect(fetch).not.toHaveBeenCalled();
    } finally {
      fetch.mockRestore();
    }
  });

  it.each([
    { type: "audio", audio_url: "/voice.mp3" },
    { type: "audio", audio_url: "/voice", mime_type: "audio/*" },
    { type: "audio", data: "UklGRg==", format: "wav" },
    { type: "video", video_url: {} },
    { type: "file", file_id: "opaque-id" },
    { type: "image", image_url: { url: 4 } },
    { type: "data", data: { type: "file", file_url: "/nested.pdf" } },
  ])("marks non-equivalent/missing URL content unsupported: %j", (part) => {
    expect(
      getRequestEditSnapshot(input(text("keep visible text"), part)),
    ).toEqual({
      text: "keep visible text",
      attachments: [],
      unsupported: true,
    });
  });

  it("keeps valid mixed attachments while declaring unsupported content instead of silently dropping it", () => {
    expect(
      getRequestEditSnapshot(
        input(
          text("a"),
          { type: "file", file_url: "/a.pdf" },
          { type: "custom", text: "cannot convert" },
          null,
        ),
      ),
    ).toEqual({
      text: "a",
      attachments: [{ url: "/a.pdf" }],
      unsupported: true,
    });
  });

  it("ignores non-user messages and never traverses arbitrary nested metadata", () => {
    expect(
      getRequestEditSnapshot({
        input: [
          { role: "system", content: [text("secret")] },
          user([text("user only")], {
            nested: {
              qwenpaw_agent_mention_dispatch: {
                modes: { fake: "collaborate" },
              },
            },
          }),
          { role: "assistant", content: [{ type: "unknown" }] },
        ],
      }),
    ).toEqual({ text: "user only", attachments: [], unsupported: false });
  });

  it("copies only validated mention modes from root metadata and strips all old request controls", () => {
    const modes = JSON.parse(
      '{"reviewer":"collaborate","researcher":"delegate","bad":"system","__proto__":"delegate","constructor":"collaborate","has space":"delegate"}',
    );
    const snapshot = getRequestEditSnapshot({
      input: [user([text("@reviewer edit")])],
      request_id: "old",
      client_message_id: "old",
      session_id: "old-session",
      request_context: { approval_level: "none", target_agent_id: "forged" },
      metadata: {
        qwenpaw_agent_mention_dispatch: {
          requestText: "replace body",
          targetAgentId: "forged",
          coordinationRequested: true,
          modes,
        },
        qwenpaw_steering: { request_id: "forged" },
      },
    });
    expect(snapshot).toEqual({
      text: "@reviewer edit",
      attachments: [],
      unsupported: false,
      mentionModes: { reviewer: "collaborate", researcher: "delegate" },
    });
    expect(Object.isFrozen(snapshot!.mentionModes)).toBe(true);
  });

  it("reads first user metadata fallback and ignores later user forged dispatch controls", () => {
    expect(
      getRequestEditSnapshot({
        input: [
          { role: "system", content: [] },
          user([text("first")], {
            qwenpaw_agent_mention_dispatch: { modes: { actual: "delegate" } },
          }),
          user([text("second")], {
            qwenpaw_agent_mention_dispatch: {
              modes: { forged: "collaborate" },
            },
          }),
        ],
      })?.mentionModes,
    ).toEqual({ actual: "delegate" });
  });

  it("does not trust inherited metadata or inherited modes", () => {
    const dispatch = { modes: { forged: "collaborate" } };
    for (const metadata of [
      Object.create({ qwenpaw_agent_mention_dispatch: dispatch }),
      { qwenpaw_agent_mention_dispatch: Object.create(dispatch) },
    ])
      expect(
        getRequestEditSnapshot({ input: [user([text("text")])], metadata })
          ?.mentionModes,
      ).toBeUndefined();
  });

  it("returns independent attachment and mode snapshots, preserving duplicate references", () => {
    const url = { url: "/same.pdf" };
    const part = {
      type: "file",
      file_url: url,
      file_name: "same.pdf",
      file_size: 0,
    };
    const modes = { target: "collaborate" };
    const data = {
      input: [user([part, part])],
      metadata: { qwenpaw_agent_mention_dispatch: { modes } },
    };
    const before = structuredClone(data);
    const first = getRequestEditSnapshot(data)!;
    const second = getRequestEditSnapshot(data)!;
    expect(data).toEqual(before);
    first.attachments[0].name = "edited.pdf";
    expect(first.attachments[1].name).toBe("same.pdf");
    expect(second.attachments[0].name).toBe("same.pdf");
    url.url = "/changed.pdf";
    modes.target = "delegate";
    expect(first.attachments[0].url).toBe("/same.pdf");
    expect(first.mentionModes).toEqual({ target: "collaborate" });
  });

  it("rejects active script references and file MIME that would change native content category", () => {
    expect(
      getRequestEditSnapshot(
        input(
          { type: "image", image_url: "javascript:alert(1)" },
          { type: "file", file_url: "/image.png", mime_type: "image/png" },
        ),
      ),
    ).toEqual({ text: "", attachments: [], unsupported: true });
  });

  it("returns undefined for non-request/non-user data, and flags malformed user content", () => {
    for (const value of [
      undefined,
      null,
      {},
      { input: "wrong" },
      { input: [] },
      { input: [{ role: "assistant", content: [] }] },
    ])
      expect(getRequestEditSnapshot(value)).toBeUndefined();
    expect(
      getRequestEditSnapshot({
        input: [user({ type: "text", text: "not an array" })],
      }),
    ).toEqual({ text: "", attachments: [], unsupported: true });
    expect(getRequestEditSnapshot({ input: [user("legacy text")] })?.text).toBe(
      "legacy text",
    );
  });
});
