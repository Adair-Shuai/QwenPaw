import { describe, it, test, expect, vi } from "vitest";
import {
  extractCopyableText,
  extractUserMessageText,
  buildModelError,
  buildWorkspaceMarkdown,
  summarizeReplyFilename,
  toStoredName,
  normalizeContentUrls,
  toDisplayUrl,
  getActiveSenderTextarea,
  getSenderTextareaFromTarget,
  clearSubmittedSenderInput,
} from "./utils";
import type { CopyableResponse } from "./utils";

// toDisplayUrl depends on chatApi.filePreviewUrl, needs to be mocked
vi.mock("@/api/modules/chat", () => ({
  chatApi: {
    // Mock mimics real filePreviewUrl: %2F for absolute paths, as-is for relative
    filePreviewUrl: vi.fn((p: string) => {
      if (p.startsWith("http://") || p.startsWith("https://")) return p;
      let cleaned = p;
      if (p.startsWith("file://")) {
        cleaned = p.slice(7);
        if (
          cleaned.length > 2 &&
          cleaned[0] === "/" &&
          cleaned[2] === ":" &&
          /^[a-zA-Z]$/.test(cleaned[1])
        ) {
          cleaned = cleaned.slice(1);
        }
      }
      const isAbs = cleaned.startsWith("/");
      const segs = (isAbs ? cleaned.slice(1) : cleaned)
        .split("/")
        .map(encodeURIComponent)
        .join("/");
      return `http://localhost:8000/api/files/preview/${
        isAbs ? "%2F" : ""
      }${segs}`;
    }),
  },
}));

// ---------------------------------------------------------------------------
// extractCopyableText
// ---------------------------------------------------------------------------
describe("extractCopyableText", () => {
  it("extracts string content from assistant role", () => {
    const response: CopyableResponse = {
      output: [
        { role: "user", content: "你好" },
        { role: "assistant", content: "你好，有什么可以帮你？" },
      ],
    };
    expect(extractCopyableText(response)).toBe("你好，有什么可以帮你？");
  });

  it("extracts text from structured content array", () => {
    const response: CopyableResponse = {
      output: [
        {
          role: "assistant",
          content: [
            { type: "text", text: "第一段" },
            { type: "text", text: "第二段" },
          ],
        },
      ],
    };
    expect(extractCopyableText(response)).toBe("第一段\n\n第二段");
  });

  it("extracts refusal type content", () => {
    const response: CopyableResponse = {
      output: [
        {
          role: "assistant",
          content: [{ type: "refusal", refusal: "无法回答此问题" }],
        },
      ],
    };
    expect(extractCopyableText(response)).toBe("无法回答此问题");
  });

  it("falls back to JSON.stringify when no assistant message is present", () => {
    const response: CopyableResponse = {
      output: [{ role: "user", content: "仅用户消息" }],
    };
    expect(extractCopyableText(response)).toBe(JSON.stringify(response));
  });

  it("returns JSON serialization when output is empty", () => {
    const response: CopyableResponse = { output: [] };
    expect(extractCopyableText(response)).toBe(JSON.stringify(response));
  });

  it("does not throw when output is undefined", () => {
    expect(() => extractCopyableText({})).not.toThrow();
  });

  it("merges multiple assistant messages with double newlines", () => {
    const response: CopyableResponse = {
      output: [
        { role: "assistant", content: "第一句" },
        { role: "assistant", content: "第二句" },
      ],
    };
    expect(extractCopyableText(response)).toBe("第一句\n\n第二句");
  });
});

// ---------------------------------------------------------------------------
// buildWorkspaceMarkdown
// ---------------------------------------------------------------------------
describe("buildWorkspaceMarkdown", () => {
  it("separates thinking and text via message-level type", () => {
    // AgentScope runtime: reasoning messages have type "reasoning",
    // reply messages have type "message". Both use { type: "text" } content blocks.
    const response: CopyableResponse = {
      output: [
        {
          role: "assistant",
          type: "reasoning",
          content: [{ type: "text", text: "让我想想..." }],
        },
        {
          role: "assistant",
          type: "message",
          content: [{ type: "text", text: "这是回复内容" }],
        },
      ],
    };
    const result = buildWorkspaceMarkdown(response);
    expect(result).toContain("让我想想...");
    expect(result).toContain("这是回复内容");
    // thinking section uses blockquote syntax with 💭 marker
    expect(result).toContain("> 💭 让我想想...");
    // thinking before reply, separated by ---
    const thinkingIdx = result.indexOf("让我想想...");
    const replyIdx = result.indexOf("这是回复内容");
    expect(thinkingIdx).toBeLessThan(replyIdx);
    expect(result).toContain("---");
  });

  it("returns only reply text when no thinking messages", () => {
    const response: CopyableResponse = {
      output: [
        {
          role: "assistant",
          type: "message",
          content: [{ type: "text", text: "纯回复" }],
        },
      ],
    };
    const result = buildWorkspaceMarkdown(response);
    expect(result).toBe("纯回复");
    expect(result).not.toContain(">");
  });

  it("treats messages without type as reply (backward-compatible)", () => {
    const response: CopyableResponse = {
      output: [
        {
          role: "assistant",
          content: [{ type: "text", text: "无类型消息" }],
        },
      ],
    };
    const result = buildWorkspaceMarkdown(response);
    expect(result).toBe("无类型消息");
  });

  it("handles string content in reasoning message", () => {
    const response: CopyableResponse = {
      output: [
        { role: "assistant", type: "reasoning", content: "字符串思考" },
        { role: "assistant", type: "message", content: "字符串回复" },
      ],
    };
    const result = buildWorkspaceMarkdown(response);
    expect(result).toContain("> 💭 字符串思考");
    expect(result).toContain("字符串回复");
    // thinking before reply
    expect(result.indexOf("字符串思考")).toBeLessThan(
      result.indexOf("字符串回复"),
    );
  });

  it("falls back to extractCopyableText when no content found", () => {
    const response: CopyableResponse = {
      output: [{ role: "user", content: "仅用户消息" }],
    };
    const result = buildWorkspaceMarkdown(response);
    expect(result).toBe(JSON.stringify(response));
  });

  it("merges consecutive reasoning and message segments", () => {
    const response: CopyableResponse = {
      output: [
        {
          role: "assistant",
          type: "reasoning",
          content: [{ type: "text", text: "思考1" }],
        },
        {
          role: "assistant",
          type: "reasoning",
          content: [{ type: "text", text: "思考2" }],
        },
        {
          role: "assistant",
          type: "message",
          content: [{ type: "text", text: "回复1" }],
        },
        {
          role: "assistant",
          type: "message",
          content: [{ type: "text", text: "回复2" }],
        },
      ],
    };
    const result = buildWorkspaceMarkdown(response);
    // Consecutive reasoning messages merged into one blockquote section
    expect(result).toContain("> 💭 思考1");
    expect(result).toContain("> 思考2");
    // Consecutive message messages merged into one text section
    expect(result).toContain("回复1\n\n回复2");
    // Only one --- separator between the two sections
    expect(result).toContain("---");
  });

  it("includes refusal blocks in reply section", () => {
    const response: CopyableResponse = {
      output: [
        {
          role: "assistant",
          type: "message",
          content: [{ type: "refusal", refusal: "无法回答" }],
        },
      ],
    };
    const result = buildWorkspaceMarkdown(response);
    expect(result).toBe("无法回答");
  });

  it("only processes assistant messages", () => {
    const response: CopyableResponse = {
      output: [
        {
          role: "user",
          type: "message",
          content: [{ type: "text", text: "用户消息" }],
        },
        {
          role: "assistant",
          type: "message",
          content: [{ type: "text", text: "AI回复" }],
        },
      ],
    };
    const result = buildWorkspaceMarkdown(response);
    expect(result).toBe("AI回复");
    expect(result).not.toContain("用户消息");
  });

  it("handles thinking type at message level", () => {
    // Some providers may use "thinking" as the message type instead of "reasoning"
    const response: CopyableResponse = {
      output: [
        {
          role: "assistant",
          type: "thinking",
          content: [{ type: "text", text: "思考内容" }],
        },
        {
          role: "assistant",
          type: "message",
          content: [{ type: "text", text: "回复内容" }],
        },
      ],
    };
    const result = buildWorkspaceMarkdown(response);
    expect(result).toContain("> 💭 思考内容");
    expect(result).toContain("回复内容");
    // thinking before reply
    expect(result.indexOf("思考内容")).toBeLessThan(result.indexOf("回复内容"));
  });

  it("preserves interleaved order of thinking and reply", () => {
    // The key requirement: don't group all thinking together.
    // If the response alternates reasoning → message → reasoning → message,
    // the output must preserve that order.
    const response: CopyableResponse = {
      output: [
        {
          role: "assistant",
          type: "reasoning",
          content: [{ type: "text", text: "思考A" }],
        },
        {
          role: "assistant",
          type: "message",
          content: [{ type: "text", text: "回复A" }],
        },
        {
          role: "assistant",
          type: "reasoning",
          content: [{ type: "text", text: "思考B" }],
        },
        {
          role: "assistant",
          type: "message",
          content: [{ type: "text", text: "回复B" }],
        },
      ],
    };
    const result = buildWorkspaceMarkdown(response);
    // Order: 思考A → 回复A → 思考B → 回复B
    const idxA = result.indexOf("思考A");
    const replyA = result.indexOf("回复A");
    const idxB = result.indexOf("思考B");
    const replyB = result.indexOf("回复B");
    expect(idxA).toBeLessThan(replyA);
    expect(replyA).toBeLessThan(idxB);
    expect(idxB).toBeLessThan(replyB);
    // Each thinking section has its own blockquote
    expect(result).toContain("> 💭 思考A");
    expect(result).toContain("> 💭 思考B");
    // Multiple --- separators
    const sepCount = (result.match(/---/g) || []).length;
    expect(sepCount).toBe(3); // 4 sections → 3 separators
  });

  it("falls back to content-block-level thinking type for edge cases", () => {
    // Edge case: some providers may put thinking text directly in a
    // content block with type "thinking" instead of using message-level type
    const response: CopyableResponse = {
      output: [
        {
          role: "assistant",
          type: "message",
          content: [
            { type: "thinking", thinking: "块级思考" },
            { type: "text", text: "块级回复" },
          ],
        },
      ],
    };
    const result = buildWorkspaceMarkdown(response);
    expect(result).toContain("> 💭 块级思考");
    expect(result).toContain("块级回复");
  });
});

describe("summarizeReplyFilename", () => {
  it("uses the first heading as the stem", () => {
    expect(summarizeReplyFilename("# 默认文件名太容易撞\n\n说明")).toBe(
      "默认文件名太容易撞",
    );
  });

  it("skips thinking quotes and code fences", () => {
    const markdown = [
      "> 💭 先想一下文件名",
      "",
      "---",
      "",
      "```py",
      "print('no')",
      "```",
      "",
      "实际回复从这里开始。第二句。",
    ].join("\n");
    expect(summarizeReplyFilename(markdown)).toBe("实际回复从这里开始。第二句。");
  });

  it("strips illegal filename characters and truncates", () => {
    expect(summarizeReplyFilename("notes/a:b?c")).toBe("notes a b c");
    expect(summarizeReplyFilename("**bold title**")).toBe("bold title");
    const long = "这是一段用来验证文件名会被截成三十二个字符的回复正文内容继续";
    expect(Array.from(summarizeReplyFilename(`${long}一二`)).length).toBe(32);
  });

  it("falls back when nothing usable remains", () => {
    expect(summarizeReplyFilename("```\ncode\n```", "AI 回复")).toBe("AI 回复");
    expect(summarizeReplyFilename("> only thinking", "AI 回复")).toBe("AI 回复");
  });
});

// ---------------------------------------------------------------------------
// extractUserMessageText
// ---------------------------------------------------------------------------
describe("extractUserMessageText", () => {
  it("returns string content directly", () => {
    expect(extractUserMessageText({ content: "你好" })).toBe("你好");
  });

  it("extracts text type items from array content and joins with newlines", () => {
    const msg = {
      content: [
        { type: "text", text: "你好" },
        { type: "image_url", image_url: "http://..." },
        { type: "text", text: "世界" },
      ],
    };
    expect(extractUserMessageText(msg)).toBe("你好\n世界");
  });

  it("returns empty string for non-string non-array content", () => {
    expect(extractUserMessageText({ content: null })).toBe("");
    expect(extractUserMessageText({ content: 123 })).toBe("");
  });
});

describe("getActiveSenderTextarea", () => {
  it("prefers the textarea in the focused sender", () => {
    document.body.innerHTML = `
      <div class="sender-one"><textarea id="first"></textarea></div>
      <div class="sender-two"><textarea id="second"></textarea></div>
    `;
    const second = document.querySelector("#second") as HTMLTextAreaElement;
    second.focus();

    expect(getActiveSenderTextarea()).toBe(second);
    document.body.innerHTML = "";
  });
});

describe("getSenderTextareaFromTarget", () => {
  it("resolves the hidden textarea from the rich sender editor", () => {
    document.body.innerHTML = `
      <div class="qwenpaw-sender">
        <div id="editor" contenteditable="true"></div>
        <textarea id="bridge"></textarea>
      </div>
    `;
    const editor = document.querySelector("#editor");
    const textarea = document.querySelector("#bridge");

    expect(getSenderTextareaFromTarget(editor)).toBe(textarea);
    document.body.innerHTML = "";
  });

  it("resolves the hidden textarea from a rich-editor Enter event", () => {
    document.body.innerHTML = `
      <div class="qwenpaw-sender">
        <div id="editor" contenteditable="true"></div>
        <textarea id="bridge">queued message</textarea>
      </div>
    `;
    const editor = document.querySelector("#editor") as HTMLElement;
    const textarea = document.querySelector("#bridge");
    let resolved: HTMLTextAreaElement | null = null;
    const handleKeyDown = (event: KeyboardEvent) => {
      resolved = getSenderTextareaFromTarget(event.target);
    };
    document.addEventListener("keydown", handleKeyDown, true);

    editor.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
        cancelable: true,
      }),
    );

    expect(resolved).toBe(textarea);
    document.removeEventListener("keydown", handleKeyDown, true);
    document.body.innerHTML = "";
  });

  it("rejects contenteditable elements outside a sender", () => {
    document.body.innerHTML = `<div id="editor" contenteditable="true"></div>`;

    expect(
      getSenderTextareaFromTarget(document.querySelector("#editor")),
    ).toBeNull();
    document.body.innerHTML = "";
  });
});

describe("clearSubmittedSenderInput", () => {
  it("clears the real textarea value and dispatches an input event", () => {
    document.body.innerHTML = `
      <div class="sender"><textarea>send me</textarea></div>
    `;
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
    const onInput = vi.fn();
    textarea.addEventListener("input", onInput);

    expect(clearSubmittedSenderInput("send me")).toBe(true);
    expect(textarea.value).toBe("");
    expect(onInput).toHaveBeenCalledOnce();
    document.body.innerHTML = "";
  });

  it("does not erase text typed for the next message", () => {
    document.body.innerHTML = `
      <div class="sender"><textarea>next message</textarea></div>
    `;
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement;

    expect(clearSubmittedSenderInput("sent message")).toBe(false);
    expect(textarea.value).toBe("next message");
    document.body.innerHTML = "";
  });
});

// ---------------------------------------------------------------------------
// buildModelError
// ---------------------------------------------------------------------------
describe("buildModelError", () => {
  it("returns 400 status code", () => {
    const response = buildModelError();
    expect(response.status).toBe(400);
  });

  it("response body contains error and message fields", async () => {
    const response = buildModelError();
    const body = await response.json();
    expect(body).toHaveProperty("error");
    expect(body).toHaveProperty("message");
  });

  it("Content-Type is application/json", () => {
    const response = buildModelError();
    expect(response.headers.get("Content-Type")).toBe("application/json");
  });
});

// ---------------------------------------------------------------------------
// toStoredName
// ---------------------------------------------------------------------------
describe("toStoredName", () => {
  test.each([
    [
      "extracts path after /files/preview/",
      "http://host/files/preview/uploads/img.png",
      "/uploads/img.png",
    ],
    [
      "strips query parameters",
      "http://host/files/preview/img.png?token=abc",
      "/img.png",
    ],
    [
      "strips hash fragment",
      "http://host/files/preview/img.png#section",
      "/img.png",
    ],
    [
      "returns input as-is when marker is absent",
      "/local/path/file.txt",
      "/local/path/file.txt",
    ],
    [
      "correctly decodes URL-encoded path",
      "http://host/files/preview/%E4%B8%AD%E6%96%87.txt",
      "/中文.txt",
    ],
  ])("%s", (_: string, input: string, expected: string) => {
    expect(toStoredName(input)).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// normalizeContentUrls
// ---------------------------------------------------------------------------
describe("normalizeContentUrls", () => {
  it("converts image_url for image type", () => {
    const part = {
      type: "image",
      image_url: "http://host/files/preview/img.png",
    };
    const result = normalizeContentUrls(part);
    expect(result.image_url).toBe("/img.png");
  });

  it("converts file_url for file type", () => {
    const part = {
      type: "file",
      file_url: "http://host/files/preview/doc.pdf",
    };
    const result = normalizeContentUrls(part);
    expect(result.file_url).toBe("/doc.pdf");
  });

  it("converts data for audio type", () => {
    const part = { type: "audio", data: "http://host/files/preview/audio.mp3" };
    const result = normalizeContentUrls(part);
    expect(result.data).toBe("/audio.mp3");
  });

  it("does not affect text type", () => {
    const part = { type: "text", text: "hello" };
    expect(normalizeContentUrls(part)).toEqual(part);
  });

  it("does not mutate the original object (shallow copy)", () => {
    const part = {
      type: "image",
      image_url: "http://host/files/preview/img.png",
    };
    normalizeContentUrls(part);
    expect(part.image_url).toBe("http://host/files/preview/img.png");
  });
});

// ---------------------------------------------------------------------------
// toDisplayUrl
// ---------------------------------------------------------------------------
describe("toDisplayUrl", () => {
  it("returns http URL as-is", () => {
    expect(toDisplayUrl("http://cdn.com/img.png")).toBe(
      "http://cdn.com/img.png",
    );
  });

  it("returns https URL as-is", () => {
    expect(toDisplayUrl("https://cdn.com/file")).toBe("https://cdn.com/file");
  });

  it("returns empty string for undefined", () => {
    expect(toDisplayUrl(undefined)).toBe("");
  });

  it("returns empty string for empty string", () => {
    expect(toDisplayUrl("")).toBe("");
  });

  it("calls chatApi.filePreviewUrl for absolute paths", () => {
    expect(toDisplayUrl("/uploads/img.png")).toBe(
      "http://localhost:8000/api/files/preview/%2Fuploads/img.png",
    );
  });

  it("resolves file:// URLs as absolute paths with %2F", () => {
    expect(toDisplayUrl("file:///uploads/img.png")).toBe(
      "http://localhost:8000/api/files/preview/%2Fuploads/img.png",
    );
  });

  it("passes data URLs through untouched (issue #7051)", () => {
    const dataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB";
    expect(toDisplayUrl(dataUrl)).toBe(dataUrl);
  });

  it("passes data URLs through without filePreviewUrl fallback", () => {
    const dataUrl = "data:image/png;base64,AAA=";
    expect(toDisplayUrl(dataUrl)).toBe(dataUrl);
    expect(toDisplayUrl(dataUrl)).not.toContain("/files/preview");
  });
});
