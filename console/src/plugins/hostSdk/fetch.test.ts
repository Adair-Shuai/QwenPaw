import { beforeEach, describe, expect, it, vi } from "vitest";

const { buildAuthHeaders, getApiUrl } = vi.hoisted(() => ({
  buildAuthHeaders: vi.fn(() => ({
    Authorization: "Bearer host-token",
    "X-Agent-Id": "selected-agent",
  })),
  getApiUrl: vi.fn((path: string) => `/api${path}`),
}));

vi.mock("../../api/config", () => ({ getApiUrl }));
vi.mock("../../api/authHeaders", () => ({ buildAuthHeaders }));

import { hostFetch } from "./fetch";

describe("hostFetch", () => {
  const fetchMock = vi.fn(
    async (_input: RequestInfo | URL, _init?: RequestInit) =>
      new Response(null, { status: 204 }),
  );

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("overrides the host Agent header without creating a case-variant duplicate", async () => {
    await hostFetch("/ugsci/team/state", {
      headers: {
        "x-agent-id": "explicit-agent",
        "content-type": "application/json",
      },
    });

    const [, init] = fetchMock.mock.calls[0];
    const headers = new Headers(init?.headers);

    expect(headers.get("x-agent-id")).toBe("explicit-agent");
    expect(
      [...headers.keys()].filter((key) => key.toLowerCase() === "x-agent-id"),
    ).toHaveLength(1);
    expect(headers.get("authorization")).toBe("Bearer host-token");
  });

  it("keeps the automatically selected Agent when the caller does not override it", async () => {
    await hostFetch("/ugsci/team/runs");

    const [, init] = fetchMock.mock.calls[0];
    expect(new Headers(init?.headers).get("x-agent-id")).toBe("selected-agent");
  });
});
