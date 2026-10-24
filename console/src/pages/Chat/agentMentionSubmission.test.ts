import { beforeEach, describe, expect, it } from "vitest";
import type { AgentSummary } from "../../api/types/agents";
import { useMessageQueueStore } from "../../stores/messageQueueStore";
import {
  clearAgentMentionModes,
  setAgentMentionMode,
} from "./components/agentMentionModes";
import { applyChatPayloadTransforms } from "./chatPayload";
import {
  captureAgentMentionContext,
  getQueuedAgentMentionContext,
  getSubmittedAgentMention,
} from "./agentMentionSubmission";

const agents = ["reviewer", "researcher"].map(
  (id): AgentSummary => ({
    id,
    name: id,
    enabled: true,
    backend: "qwenpaw",
    description: "",
    workspace_dir: `/tmp/${id}`,
  }),
);
const displayName = (agent: AgentSummary) => agent.name;
const input = (text: string) => [
  {
    role: "user",
    metadata: { custom: "kept" },
    content: [
      { type: "text", text },
      { type: "image", image_url: "/images/test.png" },
    ],
  },
];

describe("Agent mention submission snapshots", () => {
  beforeEach(() => {
    clearAgentMentionModes();
    useMessageQueueStore.setState({ queues: {}, runStates: {} });
  });

  it("preserves ordinary text and email addresses", () => {
    const text = "Email user@example.com";
    const context = captureAgentMentionContext(text, agents, displayName);
    expect(getSubmittedAgentMention(context)).toBeUndefined();
    expect(
      applyChatPayloadTransforms(
        { input: input(text), request_context: context },
        "default",
        undefined,
        [],
      ).input,
    ).toEqual(input(text));
  });

  it("keeps collaboration after the composer is cleared and another mode is selected", () => {
    setAgentMentionMode("reviewer", "collaborate");
    const context = captureAgentMentionContext(
      "@reviewer check",
      agents,
      displayName,
      { approval_level: "high", keep: true },
    );
    clearAgentMentionModes();
    setAgentMentionMode("reviewer", "delegate");
    const body = applyChatPayloadTransforms(
      { input: input("@reviewer check"), request_context: context },
      "default",
      "receipt",
      [],
    );
    expect(body.target_agent_id).toBeUndefined();
    expect(body.request_context).toMatchObject({
      approval_level: "high",
      keep: true,
      agent_coordination_requested: true,
    });
    expect(JSON.stringify(body.input)).toContain("chat_with_agent");
    expect((body.input as ReturnType<typeof input>)[0].content[1]).toEqual(
      input("")[0].content[1],
    );
  });

  it("coordinates multiple agents in their requested order", () => {
    const text = "@reviewer check @researcher research";
    const context = captureAgentMentionContext(text, agents, displayName);
    const dispatch = getSubmittedAgentMention(context)!;
    expect(dispatch.coordinationRequested).toBe(true);
    expect(dispatch.targetAgentId).toBeUndefined();
    expect(dispatch.requestText.indexOf("agent_id: reviewer")).toBeLessThan(
      dispatch.requestText.indexOf("agent_id: researcher"),
    );
  });

  it("updates queued routing when an @ target is edited or removed", () => {
    const store = useMessageQueueStore.getState();
    store.enqueue("chat", {
      text: "@reviewer check",
      requestContext: captureAgentMentionContext(
        "@reviewer check",
        agents,
        displayName,
      ),
    });
    const item = useMessageQueueStore.getState().getQueue("chat")[0];
    store.edit(
      "chat",
      item.id,
      "@researcher research",
      undefined,
      undefined,
      captureAgentMentionContext(
        "@researcher research",
        agents,
        displayName,
        item.requestContext,
      ),
    );
    const edited = useMessageQueueStore.getState().getQueue("chat")[0];
    expect(getSubmittedAgentMention(edited.requestContext)?.targetAgentId).toBe(
      "researcher",
    );
    store.edit(
      "chat",
      item.id,
      "ordinary text",
      undefined,
      undefined,
      captureAgentMentionContext(
        "ordinary text",
        agents,
        displayName,
        edited.requestContext,
      ),
    );
    expect(
      getSubmittedAgentMention(
        useMessageQueueStore.getState().getQueue("chat")[0].requestContext,
      ),
    ).toBeUndefined();
  });

  it("preserves collaboration when a persisted queue entry is edited after the composer mode changes", () => {
    setAgentMentionMode("reviewer", "collaborate");
    const savedContext = JSON.parse(
      JSON.stringify(
        captureAgentMentionContext("@reviewer check", agents, displayName),
      ),
    );
    clearAgentMentionModes();
    const context = captureAgentMentionContext(
      "@reviewer check again",
      agents,
      displayName,
      savedContext,
      getSubmittedAgentMention(savedContext)?.modes,
    );
    expect(getSubmittedAgentMention(context)).toMatchObject({
      coordinationRequested: true,
    });
    expect(getSubmittedAgentMention(context)?.requestText).toContain(
      "check again",
    );
  });

  it("restores legacy queue dispatch without relying on the current composer", () => {
    const context = getQueuedAgentMentionContext({
      requestContext: { approval_level: "high" },
      agentDispatch: {
        requestText: "legacy task",
        targetAgentId: "reviewer",
        coordinationRequested: false,
      },
      agentMentionModes: { reviewer: "delegate" },
    });
    const body = applyChatPayloadTransforms(
      { input: input("@reviewer legacy task"), request_context: context },
      "default",
      undefined,
      [],
      context,
    );
    expect(body.target_agent_id).toBe("reviewer");
    expect(body.request_context).toEqual({ approval_level: "high" });
    expect((body.input as ReturnType<typeof input>)[0].content[0].text).toBe(
      "legacy task",
    );
  });

  it("retains the captured routing when a plugin replaces request context", () => {
    const context = captureAgentMentionContext(
      "@reviewer check",
      agents,
      displayName,
    );
    const body = applyChatPayloadTransforms(
      { input: input("@reviewer check"), request_context: context },
      "reviewer",
      undefined,
      [
        {
          pluginId: "test",
          registrationId: "test-registration",
          registeredAt: 0,
          item: {
            id: "replace",
            transform: ({ payload }) => ({
              ...payload,
              request_context: { plugin: true },
            }),
          },
        },
      ],
    );
    expect(body.target_agent_id).toBe("reviewer");
    expect(body.request_context).toEqual({ plugin: true });
    expect((body.input as ReturnType<typeof input>)[0].content[0].text).toBe(
      "check",
    );
  });
});
