/**
 * Knowledge base tab and preset prompts tab components.
 * Extracted separately to avoid circular dependencies between
 * ExpertCard, ExpertConfigModal, and ExpertCenterPage.
 */

import { getHost } from "../core/runtime";
import { PRIMARY_BTN_STYLE } from "../core/shared";
import type { SkillSpec } from "../core/types";
import {
  extractPromptFromSkills,
  type PromptItem,
  fetchAgentLanguage,
  updateAgentLanguage,
  fetchUserTimezone,
  updateUserTimezone,
  fetchSystemPromptFiles,
  updateSystemPromptFiles,
} from "./expertApi";
import { TagList } from "./expertUtils";

export { KnowledgeBaseTab } from "./ExpertFilesTab";

export function PresetPromptsTab({
  skills,
  agentId,
}: {
  skills: SkillSpec[];
  agentId: string;
}) {
  const React = getHost().React;
  const { useMemo } = React;
  const {
    List,
    Tag,
    Typography,
    Empty,
    Button,
    message: antdMsg,
  } = getHost().antd;
  const { ThunderboltOutlined, CopyOutlined } = getHost().antdIcons || {};
  const { Text } = Typography;

  const prompts = useMemo(() => extractPromptFromSkills(skills), [skills]);

  const handleUsePrompt = (prompt: PromptItem) => {
    try {
      const host = getHost();
      if (host.setSelectedAgent) {
        host.setSelectedAgent(agentId);
      }
    } catch {}
    // Store the prompt for the chat page to pick up
    try {
      sessionStorage.setItem("ugsci_pending_prompt", prompt.value);
    } catch {}
    window.history.pushState({}, "", "/chat");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const handleCopy = (prompt: PromptItem) => {
    navigator.clipboard?.writeText(prompt.value).then(() => {
      antdMsg.success("已复制到剪贴板");
    });
  };

  if (prompts.length === 0) {
    return React.createElement(Empty, {
      description: "暂无推荐提问，请先为专家添加技能",
      image: Empty.PRESENTED_IMAGE_SIMPLE,
    });
  }

  return React.createElement(
    "div",
    null,
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 12,
        },
      },
      ThunderboltOutlined
        ? React.createElement(ThunderboltOutlined, {
            style: { fontSize: 14, color: "#1677ff" },
          })
        : null,
      React.createElement(
        Text,
        { strong: true },
        `推荐提问 (${prompts.length})`,
      ),
      React.createElement(
        Text,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取",
      ),
    ),
    React.createElement(List, {
      dataSource: prompts,
      renderItem: (prompt: PromptItem, index: number) =>
        React.createElement(
          List.Item,
          {
            actions: [
              React.createElement(
                Button,
                {
                  type: "link",
                  size: "small",
                  icon: CopyOutlined
                    ? React.createElement(CopyOutlined)
                    : undefined,
                  onClick: () => handleCopy(prompt),
                },
                "复制",
              ),
            ],
          },
          React.createElement(List.Item.Meta, {
            avatar: React.createElement(
              Tag,
              { color: "blue", style: { borderRadius: "50%" } },
              `${index + 1}`,
            ),
            title: React.createElement(
              "div",
              {
                style: {
                  cursor: "pointer",
                  color: "#1677ff",
                },
                onClick: () => handleUsePrompt(prompt),
              },
              prompt.value,
            ),
            description: React.createElement(
              Text,
              { type: "secondary", style: { fontSize: 12 } },
              prompt.label,
            ),
          }),
        ),
    }),
  );
}
