import { beforeEach, describe, expect, it, vi } from "vitest";

const { getApiToken } = vi.hoisted(() => ({
  getApiToken: vi.fn(() => "token with spaces"),
}));

vi.mock("./config", () => ({ getApiToken }));

import { buildAuthenticatedMediaUrl } from "./authHeaders";

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
