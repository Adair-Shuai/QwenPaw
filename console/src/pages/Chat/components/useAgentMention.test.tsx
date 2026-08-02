import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AgentSummary } from "../../../api/types/agents";
import { useAgentMention } from "./useAgentMention";
import {
  clearAgentMentionModes,
  getAgentMentionMode,
} from "./agentMentionModes";

const agents: AgentSummary[] = [
  {
    id: "default",
    name: "Primary",
    description: "",
    workspace_dir: "/tmp/default",
    enabled: true,
    backend: "qwenpaw",
  },
  {
    id: "reviewer",
    name: "Code Reviewer",
    description: "Reviews changes",
    workspace_dir: "/tmp/reviewer",
    enabled: true,
    backend: "qwenpaw",
  },
  {
    id: "writer",
    name: "Writer",
    description: "Writes copy",
    workspace_dir: "/tmp/writer",
    enabled: true,
    backend: "qwenpaw",
  },
];

function textareaWithValue(value: string): HTMLTextAreaElement {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.selectionStart = textarea.selectionEnd = value.length;
  return textarea;
}

describe("useAgentMention", () => {
  beforeEach(clearAgentMentionModes);

  it("only scans the token at the cursor and keeps key handlers stable", () => {
    const { result } = renderHook(() => useAgentMention(agents, "default"));
    const initialKeyHandler = result.current.handleKeyDown;
    const textarea = textareaWithValue("long previous text @rev");

    act(() => result.current.handleInputChange(textarea));

    expect(result.current.mentionState).toMatchObject({
      visible: true,
      query: "rev",
    });
    expect(result.current.filteredAgents.map((agent) => agent.id)).toEqual([
      "reviewer",
    ]);
    expect(textarea.dataset.agentMentionActive).toBe("true");
    expect(result.current.handleKeyDown).toBe(initialKeyHandler);

    textarea.value = "@reviewer selected and now writing";
    textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
    act(() => result.current.handleInputChange(textarea));

    expect(result.current.mentionState.visible).toBe(false);
    expect(textarea.dataset.agentMentionActive).toBeUndefined();
  });

  it("opens a mention immediately after Chinese punctuation", () => {
    const { result } = renderHook(() => useAgentMention(agents, "default"));
    const textarea = textareaWithValue("请处理这个任务，然后@rev");

    act(() => result.current.handleInputChange(textarea));

    expect(result.current.mentionState.visible).toBe(true);
    expect(result.current.mentionState.query).toBe("rev");
    expect(result.current.filteredAgents.map((agent) => agent.id)).toEqual([
      "reviewer",
    ]);
  });

  it("navigates candidates without allowing other document key handlers", () => {
    const { result } = renderHook(() => useAgentMention(agents, "default"));
    const textarea = textareaWithValue("@");
    act(() => result.current.handleInputChange(textarea));

    const event = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      cancelable: true,
    });
    const stopImmediatePropagation = vi.spyOn(
      event,
      "stopImmediatePropagation",
    );
    act(() => result.current.handleKeyDown(event, textarea));

    expect(result.current.activeIndex).toBe(1);
    expect(event.defaultPrevented).toBe(true);
    expect(stopImmediatePropagation).toHaveBeenCalledOnce();
  });

  it("inserts the selected Agent immediately on keyboard confirmation", () => {
    const { result } = renderHook(() => useAgentMention(agents, "default"));
    const textarea = textareaWithValue("@");
    const inputEvents: Event[] = [];
    textarea.addEventListener("input", (event) => inputEvents.push(event));
    act(() => result.current.handleInputChange(textarea));

    act(() =>
      result.current.handleKeyDown(
        new KeyboardEvent("keydown", { key: "ArrowDown", cancelable: true }),
        textarea,
      ),
    );
    act(() =>
      result.current.handleKeyDown(
        new KeyboardEvent("keydown", { key: "Enter", cancelable: true }),
        textarea,
      ),
    );

    expect(textarea.value).toBe("@Writer ");
    expect(inputEvents).toHaveLength(1);
    expect(textarea.dataset.agentMentionActive).toBeUndefined();
  });

  it("removes a selected mention atomically with Backspace", () => {
    const { result } = renderHook(() => useAgentMention(agents, "default"));
    const textarea = textareaWithValue("ask @Code Reviewer ");
    const inputEvents: Event[] = [];
    textarea.addEventListener("input", (event) => inputEvents.push(event));

    const event = new KeyboardEvent("keydown", {
      key: "Backspace",
      cancelable: true,
    });
    let handled = false;
    act(() => {
      handled = result.current.handleKeyDown(event, textarea);
    });

    expect(handled).toBe(true);
    expect(textarea.value).toBe("ask ");
    expect(textarea.selectionStart).toBe(4);
    expect(inputEvents).toHaveLength(1);
  });

  it("stores collaborative mode for a single selected Agent", () => {
    const { result } = renderHook(() => useAgentMention(agents, "default"));
    const textarea = textareaWithValue("@");
    act(() => result.current.handleInputChange(textarea));
    act(() => result.current.setSelectionMode("collaborate"));
    act(() => result.current.insertMention(agents[1], textarea));

    expect(textarea.value).toBe("@Code Reviewer ");
    expect(getAgentMentionMode("reviewer")).toBe("collaborate");
  });

  it("locks additional Agents to collaboration and filters selected Agents", () => {
    const { result } = renderHook(() =>
      useAgentMention(agents, "default", ["reviewer"]),
    );
    const textarea = textareaWithValue("@");
    act(() => result.current.handleInputChange(textarea));

    expect(result.current.collaborationLocked).toBe(true);
    expect(result.current.selectionMode).toBe("collaborate");
    expect(result.current.filteredAgents.map((agent) => agent.id)).toEqual([
      "writer",
    ]);
  });
});
