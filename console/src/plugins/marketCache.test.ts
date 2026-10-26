import { describe, expect, it, vi } from "vitest";
import { createMarketManifestCache } from "../../../plugins/bundle/ugsci/ui/src/market/marketCache";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

const json = (version: string, stale = false) =>
  new Response(JSON.stringify({ version }), {
    headers: stale ? { "X-QwenPaw-Cache": "stale" } : {},
  });

describe("public OSS manifest session cache", () => {
  it("shares cold requests and reuses a fresh catalog when reopening", async () => {
    const reply = deferred<Response>();
    const fetcher = vi.fn(() => reply.promise);
    const cache = createMarketManifestCache(fetcher);
    const first = cache.get("skills/manifest.json");
    const second = cache.get("skills/manifest.json");
    expect(first).toBe(second);
    reply.resolve(json("one"));
    expect(await first).toEqual({ version: "one" });
    expect(await cache.get("skills/manifest.json")).toEqual({ version: "one" });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("returns stale cards immediately and notifies once background validation finishes", async () => {
    let clock = 0;
    const reply = deferred<Response>();
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(json("one"))
      .mockReturnValueOnce(reply.promise);
    const cache = createMarketManifestCache(fetcher, () => clock);
    const changed = vi.fn();
    const unsubscribe = cache.subscribe(changed);
    await cache.get("mcp/manifest.json");
    clock = 60_001;
    expect(await cache.get("mcp/manifest.json")).toEqual({ version: "one" });
    expect(await cache.get("mcp/manifest.json")).toEqual({ version: "one" });
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher).toHaveBeenLastCalledWith("mcp/manifest.json", true);
    expect(changed).not.toHaveBeenCalled();
    const refreshed = cache.get("mcp/manifest.json", true);
    reply.resolve(json("two"));
    expect(await refreshed).toEqual({ version: "two" });
    expect(await cache.get("mcp/manifest.json")).toEqual({ version: "two" });
    expect(changed).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("keeps good cards on failed refresh and allows an explicit retry", async () => {
    let clock = 0;
    const reply = deferred<Response>();
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(json("one"))
      .mockReturnValueOnce(reply.promise)
      .mockResolvedValueOnce(json("two"));
    const cache = createMarketManifestCache(fetcher, () => clock);
    await cache.get("agents/manifest.json");
    clock = 60_001;
    expect(await cache.get("agents/manifest.json")).toEqual({ version: "one" });
    const forced = cache.get("agents/manifest.json", true);
    reply.reject(new Error("offline"));
    await expect(forced).rejects.toThrow("offline");
    expect(await cache.get("agents/manifest.json")).toEqual({ version: "one" });
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(await cache.get("agents/manifest.json", true)).toEqual({
      version: "two",
    });
    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it("follows backend stale responses without blocking the first catalog paint", async () => {
    const reply = deferred<Response>();
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(json("old", true))
      .mockReturnValueOnce(reply.promise);
    const cache = createMarketManifestCache(fetcher);
    const changed = vi.fn();
    cache.subscribe(changed);
    expect(await cache.get("mcp/manifest.json")).toEqual({ version: "old" });
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher).toHaveBeenLastCalledWith("mcp/manifest.json", true);
    const joined = cache.get("mcp/manifest.json", true);
    reply.resolve(json("new"));
    expect(await joined).toEqual({ version: "new" });
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(changed).toHaveBeenCalledTimes(1);
  });

  it("does not let a slow expert catalog delay skills or MCP", async () => {
    const expert = deferred<Response>();
    const fetcher = vi.fn((path: string) =>
      path.startsWith("agents/") ? expert.promise : Promise.resolve(json(path)),
    );
    const cache = createMarketManifestCache(fetcher);
    const pendingExpert = cache.get("agents/manifest.json");
    expect(await cache.get("skills/manifest.json")).toEqual({
      version: "skills/manifest.json",
    });
    expect(await cache.get("mcp/manifest.json")).toEqual({
      version: "mcp/manifest.json",
    });
    expert.resolve(json("experts"));
    expect(await pendingExpert).toEqual({ version: "experts" });
  });

  it("validates upstream when refresh was requested during an ordinary request", async () => {
    const first = deferred<Response>();
    const second = deferred<Response>();
    const fetcher = vi
      .fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    const cache = createMarketManifestCache(fetcher);
    const ordinary = cache.get("mcp/manifest.json");
    const forced = cache.get("mcp/manifest.json", true);
    first.resolve(json("one"));
    expect(await ordinary).toEqual({ version: "one" });
    second.resolve(json("two"));
    expect(await forced).toEqual({ version: "two" });
    expect(fetcher.mock.calls).toEqual([
      ["mcp/manifest.json", false],
      ["mcp/manifest.json", true],
    ]);
  });
});
