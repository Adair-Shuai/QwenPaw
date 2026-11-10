import { describe, expect, it } from "vitest";
import {
  DIRECTORY_REFERENCE_HREF_PREFIX,
  FILE_REFERENCE_HREF_PREFIX,
  directoryReferenceFromText,
  fileReferenceFromText,
  prepareFileReferenceMarkdown,
} from "./fileReferenceMarkdown";

describe("file reference Markdown adaptation", () => {
  it("preserves every byte and reference in a large mixed file list", () => {
    const rows = Array.from({ length: 1500 }, (_, i) => ({
      source: `查看 src/file${i}.ts:12，保留文字 ${i}。\n`,
      expected: `查看 [src/file${i}.ts:12](${FILE_REFERENCE_HREF_PREFIX}${encodeURIComponent(
        `src/file${i}.ts:12`,
      )})，保留文字 ${i}。\n`,
    }));
    const literal = "\n```text\nPROFILE.md /workspace/\n```\n";
    expect(
      prepareFileReferenceMarkdown(
        rows.map((row) => row.source).join("") + literal,
      ),
    ).toBe(rows.map((row) => row.expected).join("") + literal);
  });

  it("keeps slash-separated prose literal across Unicode words and inline formatting", () => {
    const source = [
      "有什么要办的？无论是查东西、写点东西、看文件，还是折腾点代码/脚本，直接说就行。",
      "输入/输出、文件/目录、中文/English、读/写、代码/script.py、café/scripts、cafe\u0301/scripts。",
      "**代码**/脚本、`代码`/脚本、[代码](https://example.com)/脚本。",
    ].join("\n\n");
    expect(prepareFileReferenceMarkdown(source)).toBe(source);
  });

  it("recognizes separated and explicitly formatted paths while excluding joined prose", () => {
    const source = [
      "目录 /home/demo/workspace，日志：/var/log。",
      "**/tmp** 和 **/home/demo/notes.md#L8**，路径C:/Work/project。",
      "行内目录是`/home/demo/workspace`，引用为“/home/demo/my notes”。",
      "换行后的目录  \n/home/demo/new-line。",
    ].join("\n\n");
    const result = prepareFileReferenceMarkdown(source);
    for (const path of [
      "/home/demo/workspace",
      "/var/log",
      "/tmp",
      "/home/demo/my notes",
      "C:/Work/project",
      "/home/demo/new-line",
    ]) {
      expect(result).toContain(
        DIRECTORY_REFERENCE_HREF_PREFIX + encodeURIComponent(path),
      );
    }
    expect(result).toContain(
      FILE_REFERENCE_HREF_PREFIX + encodeURIComponent("/home/demo/notes.md#L8"),
    );
  });

  it.each([
    [
      String.raw`C:\Users\shuai\.qwenpaw\workspaces\default`,
      "C:/Users/shuai/.qwenpaw/workspaces/default",
    ],
    ["C:/Work/研究目录/", "C:/Work/研究目录/"],
    ["/home/demo/workspace", "/home/demo/workspace"],
    ["file:///C:/Work/research%20notes/", "file:///C:/Work/research%20notes/"],
    ["C:/", "C:/"],
    ["/", "/"],
    ["file:///C:/", "file:///C:/"],
    ["docs/", "docs/"],
    ["./src/components/", "./src/components/"],
  ])("recognizes a local directory location %s", (value, href) => {
    expect(directoryReferenceFromText(value)).toBe(href);
  });

  it.each([
    "default",
    "src/components",
    "PROFILE.md",
    "C:/Work/app.ts:12",
    "C:/Work/app.ts",
    "../docs/",
    "C:/Work/../secret/",
    "//server/share/",
    "file://server/share/",
    "https://example.com/docs/",
    "cd C:/Work/",
  ])(
    "keeps non-directory and unsafe locations out of directory links %s",
    (value) => {
      expect(directoryReferenceFromText(value)).toBeNull();
    },
  );

  it("decorates full Windows and POSIX directory paths and preserves file line suffixes", () => {
    const directory = String.raw`C:\Users\shuai\.qwenpaw\workspaces\default`;
    const source = [
      `目录 \`${directory}\`。直接打开 ${directory}。`,
      "输出位于 /home/demo/workspace，组件位于 src/components/。",
      "打开 C:/Work/app.ts:12-18，再读 /home/demo/notes.md#L8。",
      "[目录](file:///C:/Work/project/) 和 [子目录](docs/)。",
      `\`\`\`text\n${directory}\n\`\`\``,
    ].join("\n\n");
    const result = prepareFileReferenceMarkdown(source);
    const href =
      DIRECTORY_REFERENCE_HREF_PREFIX +
      encodeURIComponent(directory.replace(/\\/g, "/"));
    expect(result.split(href)).toHaveLength(3);
    expect(result).toContain(
      DIRECTORY_REFERENCE_HREF_PREFIX +
        encodeURIComponent("/home/demo/workspace"),
    );
    expect(result).toContain(
      DIRECTORY_REFERENCE_HREF_PREFIX + encodeURIComponent("src/components/"),
    );
    expect(result).toContain(
      DIRECTORY_REFERENCE_HREF_PREFIX +
        encodeURIComponent("file:///C:/Work/project/"),
    );
    expect(result).toContain(
      `[子目录](${DIRECTORY_REFERENCE_HREF_PREFIX}${encodeURIComponent(
        "docs/",
      )})`,
    );
    expect(result).toContain(
      FILE_REFERENCE_HREF_PREFIX + encodeURIComponent("C:/Work/app.ts:12-18"),
    );
    expect(result).toContain(
      FILE_REFERENCE_HREF_PREFIX + encodeURIComponent("/home/demo/notes.md#L8"),
    );
    expect(result).toContain(`\`\`\`text\n${directory}\n\`\`\``);
  });

  it.each([
    "PROFILE.md",
    "README.md:12",
    "src/app.ts#L12-L18",
    "./src/app.py",
    "docs/research notes.md",
    "研究报告 汇总.docx",
    "研究报告(修订).docx",
  ])("recognizes complete inline filename %s", (value) => {
    expect(fileReferenceFromText(value)).toBe(value);
  });

  it.each([
    "default",
    "user.name",
    "config.model",
    "v1.2.3",
    "python main.py",
    "cat PROFILE.md",
    "ls docs/a.md",
    "https://example.com/src/app.ts",
    "user@example.md",
    "../secret.md",
    "print('PROFILE.md')",
  ])("keeps ordinary code or external text literal %s", (value) => {
    expect(fileReferenceFromText(value)).toBeNull();
  });

  it("decorates inline and plain file mentions without nesting links or modifying fenced examples", () => {
    const profile = `[PROFILE.md](${FILE_REFERENCE_HREF_PREFIX}PROFILE.md)`;
    const result = prepareFileReferenceMarkdown(
      "写进 `PROFILE.md`，查看 PROFILE.md 和 src/app.ts:12。身份 `default`。\n\n```text\nPROFILE.md\n```\n\n[`PROFILE.md`](https://example.com)\n\n[PROFILE.md][web]\n\n[web]: https://example.com",
    );
    expect(result.match(/\.qwenpaw-file-reference\/PROFILE.md/g)).toHaveLength(
      2,
    );
    expect(result).toContain(`写进 ${profile}，查看 ${profile}`);
    expect(result).toContain(
      `[src/app.ts:12](${FILE_REFERENCE_HREF_PREFIX}${encodeURIComponent(
        "src/app.ts:12",
      )})`,
    );
    expect(result).toContain("身份 `default`");
    expect(result).toContain("```text\nPROFILE.md\n```");
    expect(result).toContain("[`PROFILE.md`](https://example.com)");
    expect(result).toContain("[PROFILE.md][web]");
  });

  it("supports quoted Chinese and spaced filenames and consumes URLs before file matching", () => {
    const source =
      "打开“研究报告 汇总.docx”和 'docs/research notes.md'。https://example.com/src/app.ts www.example.md user@example.md";
    const result = prepareFileReferenceMarkdown(source);
    expect(result).toContain(
      `[研究报告 汇总.docx](${FILE_REFERENCE_HREF_PREFIX}${encodeURIComponent(
        "研究报告 汇总.docx",
      )})`,
    );
    expect(result).toContain(
      `[docs/research notes.md](${FILE_REFERENCE_HREF_PREFIX}${encodeURIComponent(
        "docs/research notes.md",
      )})`,
    );
    expect(result).toContain(
      "https://example.com/src/app.ts www.example.md user@example.md",
    );
  });

  it("preserves long non-file tokens while recognizing the following filename", () => {
    const prefix = "x".repeat(100000) + " ";
    const result = prepareFileReferenceMarkdown(prefix + "PROFILE.md");
    expect(result).toBe(
      prefix + `[PROFILE.md](${FILE_REFERENCE_HREF_PREFIX}PROFILE.md)`,
    );
  });

  it("adapts Windows links and reference definitions while preserving identical code examples", () => {
    const href = "C:/Work/app.ts:12";
    const code = `\n\n\`\`\`custom-ui\n[source](${href})\n\`\`\`\n\n\`[source](${href})\``;
    const source = `[source](${href})\n\n[notes][ref]\n\n[ref]: <file:///C:/Work/notes.md#L8>${code}`;
    const result = prepareFileReferenceMarkdown(source);
    expect(result).toContain(
      `[source](${FILE_REFERENCE_HREF_PREFIX}${encodeURIComponent(href)})`,
    );
    expect(result).toContain(
      `[ref]: <${FILE_REFERENCE_HREF_PREFIX}${encodeURIComponent(
        "file:///C:/Work/notes.md#L8",
      )}>`,
    );
    expect(result).toContain(code);
  });

  it("preserves external links, ordinary text, images and unverified destinations", () => {
    const source =
      "The agent id is default.\n\n[web](https://example.com) ![image](C:/Work/a.png) [unsafe](javascript:alert)";
    expect(prepareFileReferenceMarkdown(source)).toBe(source);
  });
});
