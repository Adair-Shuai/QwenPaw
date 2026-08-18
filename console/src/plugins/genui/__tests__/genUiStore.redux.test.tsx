/**
 * Tests for GenUI store React hooks: setSnapshot, applyPatch, getSnapshot,
 * clearSession, hydrateFromMessages.
 *
 * Covers plan section 9.2:
 * - setSnapshot stores and retrieves snapshots
 * - applyPatch updates tree with revision check
 * - Stale revision is ignored
 * - Multiple trees don't overwrite each other
 * - clearSession removes only the specified session's snapshots
 * - hydrateFromMessages recovers snapshots from message history (history restore)
 * - hydrateFromMessages respects revision monotonicity
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import * as React from "react";
import {
  GenUiStoreProvider,
  useGenUiStore,
  useGenUiSnapshots,
  resetGenUiStore,
} from "@genui-src/stores/genUi";
import type {
  GenUiSnapshot,
  GenUiPatchPayload,
  GenUiTreeV1,
} from "@genui-src/types/genUi";

// ─── Test harness ───────────────────────────────────────────────────────────

let storeState: ReturnType<typeof useGenUiStore> | null = null;

function TestConsumer() {
  const store = useGenUiStore();
  storeState = store;
  return React.createElement("div", { "data-testid": "consumer" });
}

function renderProvider() {
  storeState = null;
  return render(
    React.createElement(
      GenUiStoreProvider,
      null,
      React.createElement(TestConsumer),
    ),
  );
}

function makeSnapshot(
  sessionId: string,
  uiId: string,
  revision: number = 1,
  value: string = "test",
): GenUiSnapshot {
  return {
    schemaVersion: "1",
    uiId: uiId,
    revision,
    sessionId,
    tree: {
      schemaVersion: "1",
      root: {
        nodeId: "n1",
        kind: "Text",
        props: { value },
        children: [],
      },
    },
    updatedAt: Date.now(),
  };
}

function makeOutput(
  uiId: string,
  revision: number = 1,
  value: string = "from-history",
): unknown[] {
  const result = {
    ok: true,
    kind: "genui" as const,
    schema_version: "1",
    ui_id: uiId,
    revision,
    tree: {
      schemaVersion: "1" as const,
      root: {
        nodeId: "n1",
        kind: "Text",
        props: { value },
        children: [],
      },
    },
  };
  return [
    {
      type: "plugin_call_output",
      content: [
        { data: { name: "emit_ui_tree", call_id: "c1" } },
        { data: { output: JSON.stringify(result), call_id: "c1" } },
      ],
    },
  ];
}

// ─── Setup / Teardown ──────────────────────────────────────────────────────

beforeEach(() => {
  resetGenUiStore();
  (window as any).QwenPaw = {
    host: { React },
  };
});

afterEach(() => {
  delete (window as any).QwenPaw;
  storeState = null;
});

// ─── setSnapshot ────────────────────────────────────────────────────────────

describe("setSnapshot", () => {
  it("stores a snapshot and retrieves it via getSnapshot", () => {
    renderProvider();
    expect(storeState).not.toBeNull();

    const snap = makeSnapshot("s1", "ui_abc");
    act(() => {
      storeState!.setSnapshot(snap);
    });

    const retrieved = storeState!.getSnapshot("s1", "ui_abc");
    expect(retrieved).toBeDefined();
    expect(retrieved!.uiId).toBe("ui_abc");
    expect(retrieved!.revision).toBe(1);
  });

  it("overwrites existing snapshot with higher revision", () => {
    renderProvider();

    act(() => {
      storeState!.setSnapshot(makeSnapshot("s1", "ui_abc", 1, "v1"));
    });

    act(() => {
      storeState!.setSnapshot(makeSnapshot("s1", "ui_abc", 2, "v2"));
    });

    const retrieved = storeState!.getSnapshot("s1", "ui_abc");
    expect(retrieved!.revision).toBe(2);
    expect(retrieved!.tree.root.props!.value).toBe("v2");
  });

  it("ignores stale revision (lower than existing)", () => {
    renderProvider();

    act(() => {
      storeState!.setSnapshot(makeSnapshot("s1", "ui_abc", 3, "v3"));
    });

    // Try to set revision 2 (stale)
    act(() => {
      storeState!.setSnapshot(makeSnapshot("s1", "ui_abc", 2, "v2-stale"));
    });

    const retrieved = storeState!.getSnapshot("s1", "ui_abc");
    expect(retrieved!.revision).toBe(3);
    expect(retrieved!.tree.root.props!.value).toBe("v3");
  });

  it("stores multiple snapshots in different sessions", () => {
    renderProvider();

    act(() => {
      storeState!.setSnapshot(makeSnapshot("s1", "ui_a"));
      storeState!.setSnapshot(makeSnapshot("s2", "ui_b"));
    });

    expect(storeState!.getSnapshot("s1", "ui_a")).toBeDefined();
    expect(storeState!.getSnapshot("s2", "ui_b")).toBeDefined();
    expect(storeState!.getSnapshot("s1", "ui_b")).toBeUndefined();
    expect(storeState!.getSnapshot("s2", "ui_a")).toBeUndefined();
  });
});

// ─── applyPatch ─────────────────────────────────────────────────────────────

describe("applyPatch", () => {
  it("updates tree and revision when revision matches", () => {
    renderProvider();

    act(() => {
      storeState!.setSnapshot(makeSnapshot("s1", "ui_abc", 1, "original"));
    });

    const newTree: GenUiTreeV1 = {
      schemaVersion: "1",
      root: {
        nodeId: "n1",
        kind: "Text",
        props: { value: "patched" },
        children: [],
      },
    };

    const payload: GenUiPatchPayload = {
      ui_id: "ui_abc",
      base_revision: 1,
      patches: [{ op: "replace", path: "/root/props/value", value: "patched" }],
    };

    // Mock getCurrentSessionId
    (window as any).QwenPaw.host.getCurrentSessionId = () => "s1";

    act(() => {
      storeState!.applyPatch(payload, newTree, 2);
    });

    const retrieved = storeState!.getSnapshot("s1", "ui_abc");
    expect(retrieved!.revision).toBe(2);
    expect(retrieved!.tree.root.props!.value).toBe("patched");
  });

  it("ignores patch with stale revision", () => {
    renderProvider();

    act(() => {
      storeState!.setSnapshot(makeSnapshot("s1", "ui_abc", 3, "current"));
    });

    const newTree: GenUiTreeV1 = {
      schemaVersion: "1",
      root: {
        nodeId: "n1",
        kind: "Text",
        props: { value: "stale-patch" },
        children: [],
      },
    };

    const payload: GenUiPatchPayload = {
      ui_id: "ui_abc",
      base_revision: 2, // stale
      patches: [{ op: "replace", path: "/root/props/value", value: "stale" }],
    };

    (window as any).QwenPaw.host.getCurrentSessionId = () => "s1";

    act(() => {
      storeState!.applyPatch(payload, newTree, 2);
    });

    // Original snapshot should be unchanged
    const retrieved = storeState!.getSnapshot("s1", "ui_abc");
    expect(retrieved!.revision).toBe(3);
    expect(retrieved!.tree.root.props!.value).toBe("current");
  });

  it("does nothing when ui_id not found", () => {
    renderProvider();

    (window as any).QwenPaw.host.getCurrentSessionId = () => "s1";

    const payload: GenUiPatchPayload = {
      ui_id: "ui_nonexistent",
      base_revision: 1,
      patches: [],
    };

    act(() => {
      storeState!.applyPatch(
        payload,
        {
          schemaVersion: "1",
          root: { nodeId: "n1", kind: "Text", props: {}, children: [] },
        },
        2,
      );
    });

    // Should not crash, and nothing should be stored
    expect(storeState!.getSnapshot("s1", "ui_nonexistent")).toBeUndefined();
  });
});

// ─── clearSession ───────────────────────────────────────────────────────────

describe("clearSession", () => {
  it("removes only the specified session's snapshots", () => {
    renderProvider();

    act(() => {
      storeState!.setSnapshot(makeSnapshot("s1", "ui_a"));
      storeState!.setSnapshot(makeSnapshot("s1", "ui_b"));
      storeState!.setSnapshot(makeSnapshot("s2", "ui_c"));
    });

    act(() => {
      storeState!.clearSession("s1");
    });

    expect(storeState!.getSnapshot("s1", "ui_a")).toBeUndefined();
    expect(storeState!.getSnapshot("s1", "ui_b")).toBeUndefined();
    expect(storeState!.getSnapshot("s2", "ui_c")).toBeDefined();
  });

  it("does nothing when session has no snapshots", () => {
    renderProvider();

    act(() => {
      storeState!.setSnapshot(makeSnapshot("s1", "ui_a"));
    });

    act(() => {
      storeState!.clearSession("nonexistent");
    });

    expect(storeState!.getSnapshot("s1", "ui_a")).toBeDefined();
  });
});

// ─── hydrateFromMessages (history recovery) ─────────────────────────────────

describe("hydrateFromMessages", () => {
  it("restores snapshots from message history", () => {
    renderProvider();

    const output = makeOutput("ui_restored", 1, "from-history");

    act(() => {
      storeState!.hydrateFromMessages("s1", output as unknown[]);
    });

    const retrieved = storeState!.getSnapshot("s1", "ui_restored");
    expect(retrieved).toBeDefined();
    expect(retrieved!.revision).toBe(1);
    expect(retrieved!.tree.root.props!.value).toBe("from-history");
    expect(retrieved!.sessionId).toBe("s1");
  });

  it("restores multiple snapshots from history", () => {
    renderProvider();

    const output = [
      ...makeOutput("ui_first", 1, "first"),
      ...makeOutput("ui_second", 1, "second"),
    ];

    act(() => {
      storeState!.hydrateFromMessages("s1", output as unknown[]);
    });

    expect(storeState!.getSnapshot("s1", "ui_first")).toBeDefined();
    expect(storeState!.getSnapshot("s1", "ui_second")).toBeDefined();
    expect(
      storeState!.getSnapshot("s1", "ui_first")!.tree.root.props!.value,
    ).toBe("first");
    expect(
      storeState!.getSnapshot("s1", "ui_second")!.tree.root.props!.value,
    ).toBe("second");
  });

  it("respects revision monotonicity (does not downgrade)", () => {
    renderProvider();

    // First hydrate with revision 3
    act(() => {
      storeState!.hydrateFromMessages(
        "s1",
        makeOutput("ui_rev", 3, "v3") as unknown[],
      );
    });

    // Then try to hydrate with revision 1 (stale)
    act(() => {
      storeState!.hydrateFromMessages(
        "s1",
        makeOutput("ui_rev", 1, "v1-stale") as unknown[],
      );
    });

    const retrieved = storeState!.getSnapshot("s1", "ui_rev");
    expect(retrieved!.revision).toBe(3);
    expect(retrieved!.tree.root.props!.value).toBe("v3");
  });

  it("handles empty output array", () => {
    renderProvider();

    act(() => {
      storeState!.hydrateFromMessages("s1", []);
    });

    // No crash, no snapshots
    expect(Object.keys(storeState!.snapshots)).toHaveLength(0);
  });

  it("handles non-genUI messages in output", () => {
    renderProvider();

    const output = [
      { type: "text_message", content: [{ data: { text: "hello" } }] },
      ...makeOutput("ui_real", 1, "real"),
      {
        type: "plugin_call_output",
        content: [{ data: { name: "other_tool" } }],
      },
    ];

    act(() => {
      storeState!.hydrateFromMessages("s1", output as unknown[]);
    });

    expect(storeState!.getSnapshot("s1", "ui_real")).toBeDefined();
    expect(Object.keys(storeState!.snapshots)).toHaveLength(1);
  });

  it("restores emit_ui_patch results from history", () => {
    renderProvider();

    // First emit a tree
    act(() => {
      storeState!.hydrateFromMessages(
        "s1",
        makeOutput("ui_patch_test", 1, "original") as unknown[],
      );
    });

    // Then hydrate with a patch result (revision 2)
    const patchResult = {
      ok: true,
      kind: "genui_patch" as const,
      ui_id: "ui_patch_test",
      base_revision: 1,
      revision: 2,
      tree: {
        schemaVersion: "1" as const,
        root: {
          nodeId: "n1",
          kind: "Text",
          props: { value: "patched" },
          children: [],
        },
      },
    };

    const output = [
      {
        type: "plugin_call_output",
        content: [
          { data: { name: "emit_ui_patch", call_id: "c2" } },
          { data: { output: JSON.stringify(patchResult), call_id: "c2" } },
        ],
      },
    ];

    act(() => {
      storeState!.hydrateFromMessages("s1", output as unknown[]);
    });

    const retrieved = storeState!.getSnapshot("s1", "ui_patch_test");
    expect(retrieved).toBeDefined();
    expect(retrieved!.revision).toBe(2);
    expect(retrieved!.tree.root.props!.value).toBe("patched");
  });
});

// ─── Multiple trees don't overwrite (PLAN §9.2) ────────────────────────────

describe("multiple trees isolation", () => {
  it("multiple setSnapshot calls with different ui_ids don't overwrite", () => {
    renderProvider();

    act(() => {
      storeState!.setSnapshot(makeSnapshot("s1", "ui_first", 1, "first"));
      storeState!.setSnapshot(makeSnapshot("s1", "ui_second", 1, "second"));
    });

    const first = storeState!.getSnapshot("s1", "ui_first");
    const second = storeState!.getSnapshot("s1", "ui_second");

    expect(first).toBeDefined();
    expect(second).toBeDefined();
    expect(first!.tree.root.props!.value).toBe("first");
    expect(second!.tree.root.props!.value).toBe("second");
  });

  it("re-keys fallback snapshots when the real session becomes available", () => {
    renderProvider();
    act(() => {
      storeState!.setSnapshot(
        makeSnapshot("__current_chat__", "ui_rekey", 1, "fallback"),
      );
      storeState!.setSnapshot(
        makeSnapshot("real-session", "ui_rekey", 1, "fallback"),
      );
    });
    expect(
      storeState!.getSnapshot("__current_chat__", "ui_rekey"),
    ).toBeUndefined();
    expect(storeState!.getSnapshot("real-session", "ui_rekey")).toBeDefined();
  });

  it("bounds the session-wide snapshot cache", () => {
    renderProvider();
    act(() => {
      for (let index = 0; index < 300; index += 1) {
        storeState!.setSnapshot(
          makeSnapshot("s1", `ui_${index}`, 1, String(index)),
        );
      }
    });
    expect(Object.keys(storeState!.snapshots)).toHaveLength(256);
  });
});

// ─── per-ui_id subscription (F17) ───────────────────────────────────────────

describe("useGenUiSnapshots", () => {
  it("does not re-render when an unrelated ui_id changes", () => {
    let renders = 0;
    function Selector() {
      useGenUiSnapshots("s1", ["ui_keep"]);
      renders += 1;
      return React.createElement("div");
    }

    render(
      React.createElement(
        GenUiStoreProvider,
        null,
        React.createElement(Selector),
        React.createElement(TestConsumer),
      ),
    );

    act(() => {
      storeState!.setSnapshot(makeSnapshot("s1", "ui_keep", 1, "keep"));
    });
    const afterOwn = renders;

    act(() => {
      storeState!.setSnapshot(makeSnapshot("s1", "ui_other", 1, "other"));
    });
    expect(renders).toBe(afterOwn);
  });
});
