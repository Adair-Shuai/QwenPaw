import { beforeEach, describe, expect, it, vi } from "vitest";

const { getApiToken } = vi.hoisted(() => ({
  getApiToken: vi.fn(() => "token with spaces"),
}));

vi.mock("./config", () => ({ getApiToken }));

import {
  buildAuthenticatedMediaUrl,
  buildWorkspaceScopeHeaders,
} from "./authHeaders";

describe("buildAuthenticatedMediaUrl", () => {
  beforeEach(() => getApiToken.mockReturnValue("token with spaces"));

  it("adds the API token and owning Agent to a workspace media URL", () => {
    expect(
      buildAuthenticatedMediaUrl(
        "/api/workspace/binary-files/clip.mp4",
        "agent/b",
      ),
    ).toBe(
      "/api/workspace/binary-files/clip.mp4?token=token+with+spaces&agent_id=agent%2Fb",
    );
  });

  it("preserves an existing query string", () => {
    expect(buildAuthenticatedMediaUrl("/media?download=0", "agent-a")).toBe(
      "/media?download=0&token=token+with+spaces&agent_id=agent-a",
    );
  });

  it("returns the original URL when no credential or Agent is available", () => {
    getApiToken.mockReturnValue("");
    expect(buildAuthenticatedMediaUrl("/media")).toBe("/media");
  });
});

describe("buildWorkspaceScopeHeaders", () => {
  beforeEach(() => getApiToken.mockReturnValue("token with spaces"));

  it("uses the chat scope as the authoritative project directory", () => {
    expect(
      buildWorkspaceScopeHeaders({
        agentId: "agent-a",
        chatId: "chat-a",
        projectDirOverride: "/pending/project",
      }),
    ).toMatchObject({
      Authorization: "Bearer token with spaces",
      "X-Agent-Id": "agent-a",
      "X-Chat-Id": "chat-a",
    });
    expect(
      buildWorkspaceScopeHeaders({
        chatId: "chat-a",
        projectDirOverride: "/pending/project",
      }),
    ).not.toHaveProperty("X-Session-Project-Dir");
  });

  it("uses the pending project directory before a chat exists", () => {
    expect(
      buildWorkspaceScopeHeaders({
        agentId: "agent-a",
        projectDirOverride: "/pending/project",
      }),
    ).toMatchObject({
      "X-Agent-Id": "agent-a",
      "X-Session-Project-Dir": "/pending/project",
    });
  });
});
