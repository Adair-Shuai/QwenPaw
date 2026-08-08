/**
 * Knowledge base tab and preset prompts tab components.
 * Extracted separately to avoid circular dependencies between
 * ExpertCard, ExpertConfigModal, and ExpertCenterPage.
 */

import { getHost, clearApiCache, apiFetch } from "../core/runtime";
import { PRIMARY_BTN_STYLE, renderMarkdown } from "../core/shared";
import type { SkillSpec } from "../core/types";
import {
  extractPromptFromSkills,
  type PromptItem,
  type KnowledgeFileInfo,
  fetchKnowledgeFiles,
  writeKnowledgeFile,
  saveKnowledgeFile,
  normalizeKnowledgeFilename,
  updateAgentSystemPromptFiles,
  fetchAgentLanguage,
  updateAgentLanguage,
  fetchUserTimezone,
  updateUserTimezone,
  fetchSystemPromptFiles,
  updateSystemPromptFiles,
} from "./expertApi";
import { DEFAULT_PROMPT_FILES, TagList } from "./expertUtils";

export function KnowledgeBaseTab({
  agentId,
  systemPromptFiles,
  onRefresh,
}: {
  agentId: string;
  systemPromptFiles: string[];
  onRefresh: () => void;
}) {
  const React = getHost().React;
  const { useState, useEffect, useCallback, useRef } = React;
  const {
    List,
    Tag,
    Switch,
    Button,
    Modal,
    Input,
    Spin,
    Empty,
    message: antdMsg,
    Typography,
    Segmented,
    Alert,
  } = getHost().antd;
  const { FileTextOutlined, PlusOutlined, EditOutlined, ReloadOutlined } =
    getHost().antdIcons || {};
  const { Text } = Typography;

  const [files, setFiles] = useState<KnowledgeFileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [enabledFiles, setEnabledFiles] = useState<string[]>(
    systemPromptFiles || [],
  );
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [saving, setSaving] = useState(false);
  const [editorMode, setEditorMode] = useState<"source" | "preview">("source");
  const loadRequestRef = useRef(0);

  const loadFiles = useCallback(async () => {
    const requestId = ++loadRequestRef.current;
    setLoading(true);
    try {
      const data = await fetchKnowledgeFiles(agentId);
      if (requestId === loadRequestRef.current) setFiles(data);
    } catch (err: any) {
      if (requestId === loadRequestRef.current) {
        antdMsg.error(err.message || "加载工作区文档失败");
        setFiles([]);
      }
    } finally {
      if (requestId === loadRequestRef.current) setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  useEffect(() => {
    setEnabledFiles(systemPromptFiles || []);
  }, [systemPromptFiles]);

  const handleToggleFile = async (filename: string, enabled: boolean) => {
    const current = new Set(enabledFiles);
    if (enabled) {
      current.add(filename);
    } else {
      // Don't allow disabling AGENTS.md
      if (DEFAULT_PROMPT_FILES.includes(filename) && filename === "AGENTS.md") {
        antdMsg.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      current.delete(filename);
    }
    const newList = Array.from(current);
    setEnabledFiles(newList);
    try {
      await updateAgentSystemPromptFiles(agentId, newList);
      antdMsg.success(enabled ? "已启用记忆文件" : "已停用记忆文件");
      onRefresh();
    } catch (err: any) {
      antdMsg.error(err.message || "更新失败");
      // Revert
      setEnabledFiles(systemPromptFiles || []);
    }
  };

  const handleEditFile = async (filename: string) => {
    try {
      const content = await apiFetch<{ content: string }>(
        `/workspace/files/${encodeURIComponent(filename)}`,
        { headers: { "X-Agent-Id": agentId } },
      );
      setEditingFile(filename);
      setEditContent(content.content || "");
      setEditorMode("source");
      setEditModalOpen(true);
    } catch (err: any) {
      antdMsg.error(err.message || "读取文件失败");
    }
  };

  const handleNewFile = () => {
    setEditingFile(null);
    setEditContent("");
    setNewFileName("");
    setEditorMode("source");
    setEditModalOpen(true);
  };

  const handleSaveFile = async () => {
    let finalName: string;
    try {
      finalName = normalizeKnowledgeFilename(editingFile || newFileName);
    } catch (err: any) {
      antdMsg.warning(err.message || "文件名无效");
      return;
    }
    if (!editContent.trim()) {
      antdMsg.warning("Markdown 文档不能为空");
      return;
    }
    if (new TextEncoder().encode(editContent).length > 1024 * 1024) {
      antdMsg.warning("Markdown 文档不能超过 1 MB");
      return;
    }
    setSaving(true);
    try {
      if (editingFile) {
        await writeKnowledgeFile(agentId, finalName, editContent);
      } else {
        const result = await saveKnowledgeFile(
          agentId,
          finalName,
          editContent,
          true,
        );
        setEnabledFiles(result.system_prompt_files);
      }
      antdMsg.success("保存成功");
      setEditModalOpen(false);
      void loadFiles();
      onRefresh();
    } catch (err: any) {
      const detail = err?.message ? `：${err.message}` : "";
      antdMsg.error(
        editingFile
          ? err?.message || "保存失败"
          : `创建并挂载失败，服务端已回滚文件${detail}`,
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return React.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      React.createElement(Spin, { size: "large" }),
    );
  }

  return React.createElement(
    "div",
    null,
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        },
      },
      React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        FileTextOutlined
          ? React.createElement(FileTextOutlined, {
              style: { fontSize: 14, color: "var(--ant-color-primary, #1677ff)" },
            })
          : null,
        React.createElement(
          Text,
          { strong: true },
          `工作区文档 (${files.length})`,
        ),
        React.createElement(
          Text,
          { type: "secondary", style: { fontSize: 12 } },
          `· ${enabledFiles.length} 个已挂载到系统提示`,
        ),
      ),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        React.createElement(
          Button,
          {
            size: "small",
            icon: ReloadOutlined
              ? React.createElement(ReloadOutlined)
              : undefined,
            onClick: loadFiles,
          },
          "刷新",
        ),
        React.createElement(
          Button,
          {
            type: "primary",
            size: "small",
            icon: PlusOutlined ? React.createElement(PlusOutlined) : undefined,
            onClick: handleNewFile,
          },
          "新建 Markdown 文档",
        ),
      ),
    ),
    files.length === 0
      ? React.createElement(Empty, {
          description: "暂无 Markdown 文档，点击「新建 Markdown 文档」添加",
          image: Empty.PRESENTED_IMAGE_SIMPLE,
        })
      : React.createElement(List, {
          dataSource: files,
          renderItem: (file: KnowledgeFileInfo) => {
            const isEnabled = enabledFiles.includes(file.filename);
            const isDefault = DEFAULT_PROMPT_FILES.includes(file.filename);
            return React.createElement(
              List.Item,
              {
                actions: [
                  React.createElement(
                    Button,
                    {
                      type: "link",
                      size: "small",
                      icon: EditOutlined
                        ? React.createElement(EditOutlined)
                        : undefined,
                      onClick: () => handleEditFile(file.filename),
                    },
                    "编辑",
                  ),
                ],
              },
              React.createElement(List.Item.Meta, {
                avatar: React.createElement(FileTextOutlined, {
                  style: {
                    fontSize: 20,
                    color: isEnabled ? "var(--ant-color-primary, #1677ff)" : "var(--ant-color-text-quaternary, #bfbfbf)",
                  },
                }),
                title: React.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    },
                  },
                  React.createElement(Text, null, file.filename),
                  isDefault
                    ? React.createElement(
                        Tag,
                        { color: "default", style: { fontSize: 10 } },
                        "内置",
                      )
                    : React.createElement(
                        Tag,
                        { color: "cyan", style: { fontSize: 10 } },
                        "工作文档",
                      ),
                ),
                description: React.createElement(
                  "div",
                  { style: { fontSize: 12 } },
                  `${(file.size / 1024).toFixed(1)} KB · 修改于 ${new Date(file.modified_time).toLocaleString()}`,
                ),
              }),
              React.createElement(Switch, {
                checked: isEnabled,
                size: "small",
                onChange: (checked: boolean) =>
                  handleToggleFile(file.filename, checked),
              }),
            );
          },
        }),
    // Edit/New file modal
    React.createElement(
      Modal,
      {
        open: editModalOpen,
        onCancel: () => setEditModalOpen(false),
        title: editingFile ? `编辑 ${editingFile}` : "新建 Markdown 文档",
        width: 700,
        onOk: handleSaveFile,
        confirmLoading: saving,
        okText: "保存",
      },
      !editingFile
        ? React.createElement(
            "div",
            { style: { marginBottom: 12 } },
            React.createElement(Input, {
              placeholder: "文件名（如：油藏工程记忆库.md）",
              value: newFileName,
              onChange: (e: any) => setNewFileName(e.target.value),
              addonAfter: !newFileName.endsWith(".md") ? ".md" : "",
            }),
          )
        : null,
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 10,
          },
        },
        React.createElement(Segmented, {
          size: "small",
          value: editorMode,
          options: [
            { label: "源码", value: "source" },
            { label: "预览", value: "preview" },
          ],
          onChange: (value: string | number) =>
            setEditorMode(value as "source" | "preview"),
        }),
        React.createElement(
          Text,
          { type: "secondary", style: { fontSize: 12 } },
          `${editContent.length} 字符 · 约 ${Math.ceil(editContent.length / 4)} tokens · ${editingFile && enabledFiles.includes(editingFile) ? "已挂载" : editingFile ? "未挂载" : "保存后自动挂载"}`,
        ),
      ),
      !editContent.trim()
        ? React.createElement(Alert, {
            type: "warning",
            showIcon: true,
            message: "文档内容为空，保存前需要填写 Markdown 内容",
            style: { marginBottom: 10 },
          })
        : null,
      editorMode === "source"
        ? React.createElement(Input.TextArea, {
            value: editContent,
            onChange: (e: any) => setEditContent(e.target.value),
            rows: 14,
            placeholder:
              "输入 Markdown 内容...\n\n例如：\n# 某区块油藏基础参数\n\n- 地层压力: 25 MPa\n- 地层温度: 85°C\n- 原油密度: 0.85 g/cm³",
            style: { fontFamily: "monospace", fontSize: 13 },
          })
        : React.createElement(
            "div",
            {
              style: {
                minHeight: 320,
                maxHeight: 480,
                overflow: "auto",
                padding: "12px 16px",
                border: "1px solid var(--ant-color-border, #d9d9d9)",
                borderRadius: 6,
                background: "var(--ant-color-bg-container, #fff)",
              },
            },
            renderMarkdown(editContent, React),
          ),
    ),
  );
}

// ─── Preset Prompts Tab ──────────────────────────────────────────────────────

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
            style: { fontSize: 14, color: "var(--ant-color-primary, #1677ff)" },
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
                  color: "var(--ant-color-primary, #1677ff)",
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

