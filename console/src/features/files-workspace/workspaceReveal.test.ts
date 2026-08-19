import { describe, expect, it, vi } from "vitest";
import {
  revealTargetFromEditorTab,
  revealWorkspacePath,
  stripEditorTabPath,
} from "./workspaceReveal";

vi.mock("../../api/modules/workspace", () => ({
  workspaceApi: {
    revealInFileManager: vi.fn().mockResolvedValue({ ok: true }),
  },
}));

import { workspaceApi } from "../../api/modules/workspace";

describe("stripEditorTabPath", () => {
  it("removes the agent-workspace tab prefix", () => {
    expect(stripEditorTabPath("workspace-root::agent.json")).toBe("agent.json");
  });

  it("removes source prefixes used by memory and artifacts", () => {
    expect(stripEditorTabPath("artifact::AI-reply.md")).toBe("AI-reply.md");
  });
});

describe("revealTargetFromEditorTab", () => {
  it("uses the display path and project root for ordinary workspace tabs", () => {
    expect(
      revealTargetFromEditorTab(
        {
          displayPath: "docs/notes.md",
          source: "workspace",
          workspaceRoot: "project",
        },
        "docs/notes.md",
      ),
    ).toEqual({ path: "docs/notes.md", root: "project" });
  });

  it("does not send internal tab ids to the file manager", () => {
    expect(
      revealTargetFromEditorTab(
        { source: "workspace", workspaceRoot: "workspace" },
        "workspace-root::agent.json",
      ),
    ).toEqual({ path: "agent.json", root: "workspace" });
  });

  it("refuses generated artifacts that are not on disk yet", () => {
    expect(
      revealTargetFromEditorTab(
        { displayPath: "AI-reply.md", source: "artifact" },
        "artifact::AI-reply.md",
      ),
    ).toBeNull();
  });
});

describe("revealWorkspacePath", () => {
  it("posts the resolved path to the workspace reveal API", async () => {
    await revealWorkspacePath({
      path: "docs/notes.md",
      root: "workspace",
      chatId: "chat-1",
      projectDirOverride: "/tmp/pending",
    });

    expect(workspaceApi.revealInFileManager).toHaveBeenCalledWith(
      "docs/notes.md",
      "chat-1",
      "workspace",
      "/tmp/pending",
    );
  });
});
