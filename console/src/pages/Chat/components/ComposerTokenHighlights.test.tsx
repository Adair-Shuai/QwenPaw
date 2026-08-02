import { fireEvent, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AgentSummary } from "../../../api/types/agents";
import ComposerTokenHighlights, {
  COMPOSER_VALUE_CHANGE_EVENT,
} from "./ComposerTokenHighlights";
import {
  clearAgentMentionModes,
  setAgentMentionMode,
} from "./agentMentionModes";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string) => fallback,
  }),
}));

const agents: AgentSummary[] = [
  {
    id: "pvt",
    name: "PVT专家",
    description: "",
    workspace_dir: "/tmp/pvt",
    enabled: true,
    backend: "qwenpaw",
  },
];

function createSender(value: string) {
  const sender = document.createElement("div");
  sender.className = "ant-sender";
  const content = document.createElement("div");
  content.className = "ant-sender-content";
  const textarea = document.createElement("textarea");
  textarea.value = value;
  content.appendChild(textarea);
  sender.appendChild(content);
  document.body.appendChild(sender);
  return { sender, textarea };
}

describe("ComposerTokenHighlights", () => {
  beforeEach(clearAgentMentionModes);

  it("renders skills inside the sender and keeps Agent tags outside", async () => {
    const { sender, textarea } = createSender("、reservoir-analysis 参数");
    const view = render(
      <ComposerTokenHighlights
        agents={agents}
        selectedAgentId="pvt"
        skillNames={["reservoir-analysis"]}
        commandNames={["compact"]}
      />,
    );

    await waitFor(() => {
      const mirror = sender.querySelector(
        "[data-qwenpaw-composer-token-mirror]",
      );
      expect(mirror?.textContent).toContain("、reservoir-analysis");
      expect(mirror?.querySelector("svg")).not.toBeNull();
    });

    textarea.value = "/compact ";
    window.dispatchEvent(
      new CustomEvent(COMPOSER_VALUE_CHANGE_EVENT, { detail: "/compact " }),
    );
    await waitFor(() => {
      expect(
        sender.querySelector("[data-qwenpaw-composer-token-mirror]")
          ?.textContent,
      ).toContain("/compact");
    });

    textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
    fireEvent.keyDown(textarea, { key: "Backspace" });
    expect(textarea.value).toBe("");

    // Sender confirms a keyboard suggestion through a controlled value update
    // and does not emit a native input event. The next frame must still sync.
    textarea.value = "/comp";
    fireEvent.input(textarea);
    fireEvent.keyDown(textarea, { key: "Enter" });
    textarea.value = "/compact ";
    await waitFor(() => {
      const mirror = sender.querySelector(
        "[data-qwenpaw-composer-token-mirror]",
      );
      expect(mirror?.textContent).toContain("/compact");
      const icon = mirror?.querySelector("svg");
      expect(icon).not.toBeNull();
      expect(getComputedStyle(icon!).position).not.toBe("absolute");
      expect(
        textarea.style.getPropertyValue("--qwenpaw-inline-token-indent"),
      ).toBe("10px");
    });

    textarea.value = "请交给 @PVT专家 处理";
    fireEvent.input(textarea);
    await waitFor(() => {
      expect(view.container.textContent).toContain("PVT专家");
      expect(view.container.textContent).not.toContain("@PVT专家");
      expect(
        sender.querySelector("[data-qwenpaw-composer-token-mirror]")
          ?.textContent,
      ).not.toContain("@PVT专家");
    });

    view.unmount();
    sender.remove();
  });

  it("shows the current Agent as coordinator for collaborative mode", async () => {
    setAgentMentionMode("pvt", "collaborate");
    const { sender } = createSender("请与 @PVT专家 一起处理");
    const view = render(
      <ComposerTokenHighlights
        agents={agents}
        selectedAgentId="pvt"
        skillNames={[]}
        commandNames={[]}
      />,
    );

    await waitFor(() => {
      expect(view.container.textContent).toContain("协调");
      expect(view.container.textContent).toContain("协作");
    });

    view.unmount();
    sender.remove();
  });
});
