import { beforeEach, describe, expect, it } from "vitest";
import {
  makeWorkspaceFileCacheKey,
  useCodeFileCacheStore,
  type WorkspaceFileScope,
} from "./codeFileCacheStore";

const scopeA: WorkspaceFileScope = {
  agentId: "agent-a",
  projectRoot: "/projects/one",
};

beforeEach(() => {
  useCodeFileCacheStore.getState().clear();
});

describe("codeFileCacheStore", () => {
  describe("get/set", () => {
    it("returns the stored entry after set", () => {
      const store = useCodeFileCacheStore.getState();
      store.set(scopeA, "foo.ts", "content", "etag-1");
      const entry = store.get(scopeA, "foo.ts");
      expect(entry).toBeDefined();
      expect(entry!.content).toBe("content");
      expect(entry!.etag).toBe("etag-1");
      expect(typeof entry!.touchedAt).toBe("number");
    });

    it("returns undefined for a key that was never set", () => {
      const store = useCodeFileCacheStore.getState();
      expect(store.get(scopeA, "nonexistent.ts")).toBeUndefined();
    });
  });

  describe("invalidate", () => {
    it("removes a previously set entry", () => {
      const store = useCodeFileCacheStore.getState();
      store.set(scopeA, "a.ts", "hello", null);
      store.invalidate(scopeA, "a.ts");
      expect(store.get(scopeA, "a.ts")).toBeUndefined();
    });

    it("does not throw when invalidating a key that does not exist", () => {
      const store = useCodeFileCacheStore.getState();
      expect(() => store.invalidate(scopeA, "nonexistent.ts")).not.toThrow();
    });
  });

  describe("clear", () => {
    it("empties all entries", () => {
      const store = useCodeFileCacheStore.getState();
      store.set(scopeA, "a.ts", "a", null);
      store.set(scopeA, "b.ts", "b", "etag-b");
      store.set(scopeA, "c.ts", "c", "etag-c");
      store.clear();
      expect(useCodeFileCacheStore.getState().entries.size).toBe(0);
    });
  });

  describe("LRU eviction", () => {
    it("keeps at most MAX_ENTRIES (50) entries after 51 insertions", () => {
      const store = useCodeFileCacheStore.getState();
      for (let i = 0; i <= 50; i++) {
        store.set(scopeA, `file-${i}.ts`, `content-${i}`, null);
      }
      expect(useCodeFileCacheStore.getState().entries.size).toBe(50);
    });

    it("evicts the oldest entry (file-0.ts) when the 51st file is inserted", () => {
      const store = useCodeFileCacheStore.getState();
      // Insert 50 files (fills the cache to MAX_ENTRIES)
      for (let i = 0; i < 50; i++) {
        store.set(scopeA, `file-${i}.ts`, `content-${i}`, null);
      }
      // Insert one more to trigger eviction
      store.set(scopeA, "file-50.ts", "content-50", null);
      const entries = useCodeFileCacheStore.getState().entries;
      expect(entries.has(makeWorkspaceFileCacheKey(scopeA, "file-0.ts"))).toBe(
        false,
      );
      expect(entries.has(makeWorkspaceFileCacheKey(scopeA, "file-50.ts"))).toBe(
        true,
      );
    });
  });

  describe("scope isolation", () => {
    it("keeps same-path files isolated between Agents", () => {
      const store = useCodeFileCacheStore.getState();
      const scopeB = { ...scopeA, agentId: "agent-b" };
      store.set(scopeA, "README.md", "agent A", null);
      store.set(scopeB, "README.md", "agent B", null);

      expect(store.get(scopeA, "README.md")?.content).toBe("agent A");
      expect(store.get(scopeB, "README.md")?.content).toBe("agent B");
    });

    it("keeps same-path files isolated between projects", () => {
      const store = useCodeFileCacheStore.getState();
      const scopeP2 = { ...scopeA, projectRoot: "/projects/two" };
      store.set(scopeA, "README.md", "project one", null);
      store.set(scopeP2, "README.md", "project two", null);

      expect(store.get(scopeA, "README.md")?.content).toBe("project one");
      expect(store.get(scopeP2, "README.md")?.content).toBe("project two");
    });

    it("normalizes Windows and Unix path separators", () => {
      const store = useCodeFileCacheStore.getState();
      store.set(
        { agentId: "agent-a", projectRoot: "C:\\work\\project" },
        "src\\index.ts",
        "content",
        null,
      );

      expect(
        store.get(
          { agentId: "agent-a", projectRoot: "C:/work/project" },
          "src/index.ts",
        )?.content,
      ).toBe("content");
    });

    it("invalidates only the requested scope", () => {
      const store = useCodeFileCacheStore.getState();
      const scopeB = { ...scopeA, agentId: "agent-b" };
      store.set(scopeA, "README.md", "agent A", null);
      store.set(scopeB, "README.md", "agent B", null);

      store.invalidate(scopeA, "README.md");

      expect(store.get(scopeA, "README.md")).toBeUndefined();
      expect(store.get(scopeB, "README.md")?.content).toBe("agent B");
    });
  });
});
