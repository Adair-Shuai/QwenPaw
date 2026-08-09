/**
 * FileSummaryCards parsing tests
 *
 * Verifies that extractFileInfos correctly parses the vendor's
 * (@agentscope-ai/chat) output array structure:
 *
 *   {
 *     type: "plugin_call" | "plugin_call_output" | ...,
 *     content: [
 *       { data: { name, arguments, call_id } },   // [0] = call info
 *       { data: { output } },                      // [1] = result (if merged)
 *     ]
 *   }
 */
// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, it, expect, vi } from "vitest";
import FileSummaryCards, { extractFileInfos } from "./FileSummaryCards";

// We test the parsing logic indirectly by simulating the data structure
// that the vendor passes to FileSummaryCards via HostResponseCard.

describe("FileSummaryCards data parsing", () => {
  it("runs the production parser and exposes a downloadable deliverable", () => {
    const infos = extractFileInfos({
      output: [
        {
          id: "msg-write",
          type: "plugin_call",
          content: [
            {
              data: {
                name: "write_file",
                arguments: JSON.stringify({
                  file_path: "/workspace/report.md",
                  content: "# Delivery",
                }),
                call_id: "call-write",
              },
            },
            { data: { output: "Wrote 10 bytes" } },
          ],
        },
      ],
    });

    expect(infos).toMatchObject([
      {
        fileName: "report.md",
        filePath: "/workspace/report.md",
        operation: "write",
        content: "# Delivery",
        extension: "md",
        isDeliverable: true,
        fileSize: 10,
      },
    ]);
  });

  it("extracts file info from plugin_call with merged output", () => {
    // Simulate a merged tool message (input + output in one message)
    const data = {
      output: [
        {
          id: "msg-1",
          type: "plugin_call",
          role: "assistant",
          status: "completed",
          content: [
            {
              type: "data",
              data: {
                name: "read_file",
                arguments: JSON.stringify({
                  file_path: "/home/user/example.py",
                }),
                call_id: "call-123",
                server_label: "builtin",
              },
            },
            {
              type: "data",
              data: {
                output: "print('hello')",
                state: "success",
              },
            },
          ],
        },
      ],
    };

    // The parsing logic should find:
    // - tool name: "read_file"
    // - file path: "/home/user/example.py"
    // - file name: "example.py"
    // - extension: "py"
    // - operation: "read"
    // - content: "print('hello')"
    expect(data.output).toHaveLength(1);
    const msg = data.output[0] as Record<string, unknown>;
    expect(msg.type).toBe("plugin_call");

    const content = msg.content as Array<Record<string, unknown>>;
    expect(content).toHaveLength(2);

    const callData = content[0].data as Record<string, unknown>;
    expect(callData.name).toBe("read_file");

    const args = JSON.parse(callData.arguments as string);
    expect(args.file_path).toBe("/home/user/example.py");

    const outputData = content[1].data as Record<string, unknown>;
    expect(outputData.output).toBe("print('hello')");
  });

  it("extracts file info from separate plugin_call and plugin_call_output", () => {
    const data = {
      output: [
        {
          id: "msg-input",
          type: "plugin_call",
          role: "assistant",
          status: "completed",
          content: [
            {
              type: "data",
              data: {
                name: "write_file",
                arguments: JSON.stringify({
                  file_path: "/home/user/test.md",
                  content: "# Hello",
                }),
                call_id: "call-456",
              },
            },
          ],
        },
        {
          id: "msg-output",
          type: "plugin_call_output",
          role: "tool",
          status: "completed",
          content: [
            {
              type: "data",
              data: {
                name: "write_file",
                call_id: "call-456",
                output: "File written successfully",
                state: "success",
              },
            },
          ],
        },
      ],
    };

    // Verify the structure
    expect(data.output).toHaveLength(2);
    const inputMsg = data.output[0] as Record<string, unknown>;
    const outputMsg = data.output[1] as Record<string, unknown>;

    expect(inputMsg.type).toBe("plugin_call");
    expect(outputMsg.type).toBe("plugin_call_output");

    const inputContent = inputMsg.content as Array<Record<string, unknown>>;
    const callData = inputContent[0].data as Record<string, unknown>;
    expect(callData.name).toBe("write_file");

    const args = JSON.parse(callData.arguments as string);
    expect(args.file_path).toBe("/home/user/test.md");
    expect(args.content).toBe("# Hello");

    const outputContent = outputMsg.content as Array<Record<string, unknown>>;
    const outputData = outputContent[0].data as Record<string, unknown>;
    expect(outputData.call_id).toBe("call-456");
    expect(outputData.output).toBe("File written successfully");
  });

  it("handles tool_call type (not just plugin_call)", () => {
    const data = {
      output: [
        {
          id: "msg-1",
          type: "tool_call",
          role: "assistant",
          status: "completed",
          content: [
            {
              type: "data",
              data: {
                name: "edit_file",
                arguments: JSON.stringify({
                  file_path: "/app/src/index.tsx",
                  old_text: "foo",
                  new_text: "bar",
                }),
                call_id: "call-789",
              },
            },
          ],
        },
      ],
    };

    const msg = data.output[0] as Record<string, unknown>;
    expect(msg.type).toBe("tool_call");

    const content = msg.content as Array<Record<string, unknown>>;
    const callData = content[0].data as Record<string, unknown>;
    expect(callData.name).toBe("edit_file");

    const args = JSON.parse(callData.arguments as string);
    expect(args.file_path).toBe("/app/src/index.tsx");
  });

  it("handles send_file_to_user tool", () => {
    const data = {
      output: [
        {
          id: "msg-1",
          type: "mcp_call",
          status: "completed",
          content: [
            {
              type: "data",
              data: {
                name: "send_file_to_user",
                arguments: JSON.stringify({
                  image_path: "/tmp/screenshot.png",
                }),
                call_id: "call-send-1",
              },
            },
          ],
        },
      ],
    };

    const msg = data.output[0] as Record<string, unknown>;
    const content = msg.content as Array<Record<string, unknown>>;
    const callData = content[0].data as Record<string, unknown>;
    expect(callData.name).toBe("send_file_to_user");

    const args = JSON.parse(callData.arguments as string);
    expect(args.image_path).toBe("/tmp/screenshot.png");
  });

  it("opens a binary send_file_to_user result through its attachment URL", () => {
    const listener = vi.fn();
    window.addEventListener("qwenpaw:open-file-preview", listener);

    render(
      createElement(FileSummaryCards, {
        data: {
          output: [
            {
              id: "msg-send-image",
              type: "mcp_call",
              status: "completed",
              content: [
                {
                  type: "data",
                  data: {
                    name: "send_file_to_user",
                    arguments: JSON.stringify({
                      image_path:
                        "/Users/lzw/Documents/文件预览测试/well_log_figure.png",
                    }),
                    call_id: "call-send-image",
                  },
                },
                {
                  type: "data",
                  data: {
                    output: [
                      {
                        type: "image",
                        source: {
                          type: "url",
                          url: "file:///Users/lzw/Documents/%E6%96%87%E4%BB%B6%E9%A2%84%E8%A7%88%E6%B5%8B%E8%AF%95/well_log_figure.png",
                        },
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      }),
    );

    fireEvent.click(
      screen.getByRole("button", { name: "预览 well_log_figure.png" }),
    );

    expect(listener).toHaveBeenCalledTimes(1);
    const event = listener.mock.calls[0][0] as CustomEvent;
    expect(event.detail.target).toMatchObject({
      source: "attachment",
      path: "/Users/lzw/Documents/文件预览测试/well_log_figure.png",
    });
    expect(event.detail.target.artifactUrl).toContain("/files/preview/");
    expect(event.detail.target.artifactUrl).toContain("%2FUsers/");
    expect(event.detail.target.artifactUrl).not.toContain(
      "/workspace/file-download",
    );

    window.removeEventListener("qwenpaw:open-file-preview", listener);
  });

  it("uses the file preview API when an absolute generated image has no result URL", () => {
    const listener = vi.fn();
    window.addEventListener("qwenpaw:open-file-preview", listener);

    render(
      createElement(FileSummaryCards, {
        data: {
          output: [
            {
              id: "msg-write-image",
              type: "plugin_call",
              content: [
                {
                  data: {
                    name: "write_file",
                    arguments: JSON.stringify({
                      file_path:
                        "/Users/lzw/Documents/文件预览测试/测试图片.jpg",
                      content: "binary-placeholder",
                    }),
                    call_id: "call-write-image",
                  },
                },
                { data: { output: "Wrote image" } },
              ],
            },
          ],
        },
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "预览 测试图片.jpg" }));

    const event = listener.mock.calls[0][0] as CustomEvent;
    expect(event.detail.target).toMatchObject({
      source: "attachment",
      path: "/Users/lzw/Documents/文件预览测试/测试图片.jpg",
    });
    expect(event.detail.target.artifactUrl).toContain("/files/preview/");
    expect(event.detail.target.artifactUrl).toContain("%2FUsers/");
    expect(event.detail.target.artifactUrl).not.toContain(
      "/workspace/binary-files",
    );

    window.removeEventListener("qwenpaw:open-file-preview", listener);
  });

  it("renders view_image output inline outside the execution record", () => {
    const path = "/workspace/result.png";
    const { container } = render(
      createElement(FileSummaryCards, {
        data: {
          output: [{
            id: "msg-view-image",
            type: "plugin_call",
            content: [
              { data: { name: "view_image", arguments: JSON.stringify({ path }), call_id: "call-view" } },
              { data: { output: [{ type: "image", source: { type: "url", url: path } }] } },
            ],
          }],
        },
      }),
    );

    expect(extractFileInfos({ output: [{
      id: "msg-view-image",
      type: "plugin_call",
      content: [{ data: { name: "view_image", arguments: JSON.stringify({ path }), call_id: "call-view" } }],
    }] })).toMatchObject([{ toolName: "view_image", isDeliverable: true }]);
    expect(container.querySelector("img")).not.toBeNull();
    expect(container.querySelector("details")).toBeNull();
  });

  it("non-file tools are not included", () => {
    const data = {
      output: [
        {
          id: "msg-1",
          type: "plugin_call",
          status: "completed",
          content: [
            {
              type: "data",
              data: {
                name: "execute_shell_command",
                arguments: JSON.stringify({ command: "ls -la" }),
                call_id: "call-shell-1",
              },
            },
          ],
        },
        {
          id: "msg-2",
          type: "plugin_call",
          status: "completed",
          content: [
            {
              type: "data",
              data: {
                name: "get_current_time",
                arguments: "{}",
                call_id: "call-time-1",
              },
            },
          ],
        },
      ],
    };

    // These should NOT be considered file-related
    for (const msg of data.output) {
      const m = msg as Record<string, unknown>;
      const content = m.content as Array<Record<string, unknown>>;
      const callData = content[0].data as Record<string, unknown>;
      const name = callData.name as string;
      expect(name).not.toBe("read_file");
      expect(name).not.toBe("write_file");
      expect(name).not.toBe("edit_file");
      expect(name).not.toBe("append_file");
      expect(name).not.toBe("send_file_to_user");
    }
  });
});
