/** Small session cache for public OSS catalogs; no credentials or user data. */
export function createMarketManifestCache(
  fetcher: (path: string, refresh: boolean) => Promise<Response>,
  now: () => number = Date.now,
  freshMs = 60_000,
) {
  const entries = new Map<string, { value: any; text: string; at: number }>();
  const pending = new Map<
    string,
    { promise: Promise<any>; refresh: boolean }
  >();
  const listeners = new Set<() => void>();

  function load(
    path: string,
    refresh: boolean,
    background: boolean,
  ): Promise<any> {
    const running = pending.get(path);
    if (running) {
      if (!refresh || running.refresh) return running.promise;
      // A forced reload must validate upstream, even when the initial request
      // was already reading a stale backend copy. Further refreshes join it.
      return running.promise.then(
        () => load(path, true, background),
        () => load(path, true, background),
      );
    }
    let needsRevalidation = false;
    const promise = Promise.resolve()
      .then(async () => {
        const response = await fetcher(path, refresh);
        if (!response.ok)
          throw new Error(`OSS fetch failed (${response.status}): ${path}`);
        const text = await response.text();
        const value = JSON.parse(text);
        const previous = entries.get(path);
        entries.set(path, { value, text, at: now() });
        needsRevalidation =
          !refresh && response.headers.get("X-QwenPaw-Cache") === "stale";
        if (background && previous?.text !== text) {
          for (const listener of listeners) listener();
        }
        return value;
      })
      .catch((error) => {
        // Failed background requests keep usable cards and use a short retry
        // cooldown. Explicit refresh still reports the failure to its caller.
        const previous = entries.get(path);
        if (previous) previous.at = now() - freshMs + Math.min(15_000, freshMs);
        throw error;
      })
      .finally(() => {
        if (pending.get(path)?.promise === promise) pending.delete(path);
        if (needsRevalidation) void load(path, true, true).catch(() => {});
      });
    pending.set(path, { promise, refresh });
    return promise;
  }

  return {
    get(path: string, refresh = false): Promise<any> {
      const cached = entries.get(path);
      if (cached && !refresh) {
        if (now() - cached.at >= freshMs)
          void load(path, true, true).catch(() => {});
        return Promise.resolve(cached.value);
      }
      return load(path, refresh, false);
    },
    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
