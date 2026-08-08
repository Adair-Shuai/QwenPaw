// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

import { FilePreviewLink } from "./FileAttachmentPreview";

describe("FilePreviewLink", () => {
  it("opens a relative tool file from a compact preview link", () => {
    const listener = vi.fn();
    window.addEventListener("qwenpaw:open-file-preview", listener);

    render(
      <FilePreviewLink
        content={{
          type: "tool_call",
          id: "write-1",
          name: "write_file",
          status: "done",
          params: { file_path: "src/result.txt" },
        }}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: /result\.txt.*files\.preview/ }),
    );

    const event = listener.mock.calls[0][0] as CustomEvent;
    expect(event.detail.target).toEqual({
      source: "workspace",
      path: "src/result.txt",
      root: "project",
    });
    window.removeEventListener("qwenpaw:open-file-preview", listener);
  });

  it("prefers the attachment URL over a home-relative-looking tool path", () => {
    const listener = vi.fn();
    window.addEventListener("qwenpaw:open-file-preview", listener);

    render(
      <FilePreviewLink
        content={{
          type: "tool_call",
          id: "write-image-1",
          name: "write_file",
          status: "done",
          params: {
            file_path: "Documents/文件预览测试/测试图片.png",
          },
          result: [
            {
              type: "image",
              source: {
                type: "url",
                url: "file:///Users/lzw/Documents/文件预览测试/测试图片.png",
              },
            },
          ],
        }}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: /测试图片\.png.*files\.preview/ }),
    );

    const event = listener.mock.calls[0][0] as CustomEvent;
    expect(event.detail.target).toMatchObject({
      source: "attachment",
      path: "/Users/lzw/Documents/文件预览测试/测试图片.png",
    });
    expect(event.detail.target.artifactUrl).toContain("/files/preview/");
    expect(event.detail.target.artifactUrl).toContain("%2FUsers/");
    expect(event.detail.target).not.toHaveProperty("root");
    window.removeEventListener("qwenpaw:open-file-preview", listener);
  });

  it("keeps relative attachment URLs project-relative", () => {
    const listener = vi.fn();
    window.addEventListener("qwenpaw:open-file-preview", listener);

    render(
      <FilePreviewLink
        content={{
          type: "tool_call",
          id: "write-report-1",
          name: "write_file",
          status: "done",
          params: { file_path: "reports/report.md" },
          result: [
            {
              type: "file",
              source: {
                type: "url",
                url: "/api/files/preview/reports/report.md",
              },
            },
          ],
        }}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: /report\.md.*files\.preview/ }),
    );

    const event = listener.mock.calls[0][0] as CustomEvent;
    expect(event.detail.target).toMatchObject({
      source: "attachment",
      path: "reports/report.md",
      artifactUrl: "/api/files/preview/reports/report.md",
    });
    window.removeEventListener("qwenpaw:open-file-preview", listener);
  });
});
