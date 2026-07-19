/**
 * ResearchPanel — 研究面板（论文模式右栏）
 *
 * 功能：
 * - 显示当前页的笔记/问题列表
 * - 添加笔记（关联当前页码）
 * - 「问 AI」：将当前页上下文 + 问题发送给聊天 composer
 * - 笔记本地持久化（localStorage，按文件 URL 隔离）
 *
 * 设计灵感来自 LeAgent 的 ResearchPanel.tsx：
 * - 笔记与页码关联，点击可跳转
 * - 问题标记（isQuestion）可一键发给 AI
 */
import React, { useState, useEffect, useCallback } from "react";
import {
  Input,
  Button,
  List,
  Tag,
  Space,
  Tooltip,
  Empty,
  Typography,
} from "antd";
import {
  SendOutlined,
  DeleteOutlined,
  EditOutlined,
  QuestionCircleOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { ResearchNote } from "./types";
import { readerComposerBridge } from "./readerComposerBridge";

const { TextArea } = Input;

interface ResearchPanelProps {
  /** 文件 URL（用于 localStorage 隔离） */
  fileUrl: string;
  /** 文件名 */
  fileName: string;
  /** 当前页码 */
  currentPage: number;
  /** 总页数 */
  numPages: number;
  /** 当前页文本 */
  pageText?: string;
  /** 论文标题 */
  paperTitle?: string;
  /** 跳转到页码 */
  onNavigate: (page: number) => void;
  /** 主题 */
  theme: "light" | "dark";
}

/** localStorage key 前缀 */
const STORAGE_PREFIX = "pdf-reader:notes:";

/** 从 localStorage 加载笔记 */
function loadNotes(fileUrl: string): ResearchNote[] {
  try {
    const key = STORAGE_PREFIX + fileUrl;
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

/** 保存笔记到 localStorage */
function saveNotes(fileUrl: string, notes: ResearchNote[]): void {
  try {
    const key = STORAGE_PREFIX + fileUrl;
    localStorage.setItem(key, JSON.stringify(notes));
  } catch {
    // localStorage 满了或不可用
  }
}

const ResearchPanel: React.FC<ResearchPanelProps> = ({
  fileUrl,
  fileName,
  currentPage,
  numPages,
  pageText,
  paperTitle,
  onNavigate,
  theme,
}) => {
  const { t } = useTranslation();
  const isDark = theme === "dark";
  const [notes, setNotes] = useState<ResearchNote[]>([]);
  const [input, setInput] = useState("");
  const [isQuestion, setIsQuestion] = useState(false);

  // 加载笔记
  useEffect(() => {
    setNotes(loadNotes(fileUrl));
  }, [fileUrl]);

  // 保存笔记
  useEffect(() => {
    saveNotes(fileUrl, notes);
  }, [notes, fileUrl]);

  const handleAdd = useCallback(() => {
    if (!input.trim()) return;
    const note: ResearchNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      page: currentPage,
      content: input.trim(),
      createdAt: Date.now(),
      isQuestion,
    };
    setNotes((prev) => [...prev, note]);
    setInput("");
  }, [input, currentPage, isQuestion]);

  const handleDelete = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const handleAskAI = useCallback(
    (note: ResearchNote) => {
      readerComposerBridge.publish({
        fileName,
        fileUrl,
        currentPage: note.page,
        numPages,
        selectedText: note.content,
        pageText: note.page === currentPage ? pageText : undefined,
        paperTitle,
      });
    },
    [fileName, fileUrl, numPages, currentPage, pageText, paperTitle],
  );

  const handleSendCurrentPage = useCallback(() => {
    readerComposerBridge.publish({
      fileName,
      fileUrl,
      currentPage,
      numPages,
      pageText,
      paperTitle,
    });
  }, [fileName, fileUrl, currentPage, numPages, pageText, paperTitle]);

  const bg = isDark ? "#1a1a1a" : "#fafafa";
  const borderColor = isDark ? "#333" : "#e8e8e8";

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: bg,
        borderLeft: `1px solid ${borderColor}`,
      }}
    >
      {/* 头部 */}
      <div
        style={{
          padding: "8px 12px",
          borderBottom: `1px solid ${borderColor}`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "#999",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 4,
          }}
        >
          {t("workspace.researchPanel", "研究面板")}
        </div>
        <Typography.Text
          style={{ fontSize: 12, color: isDark ? "#ccc" : "#666" }}
        >
          {t("workspace.currentPage", "当前页")}: {currentPage} / {numPages}
        </Typography.Text>
        <Tooltip title={t("workspace.sendPageToAI", "将当前页发给 AI")}>
          <Button
            size="small"
            type="link"
            icon={<SendOutlined />}
            onClick={handleSendCurrentPage}
            style={{ float: "right", padding: 0 }}
          >
            {t("workspace.askAI", "问 AI")}
          </Button>
        </Tooltip>
      </div>

      {/* 笔记列表 */}
      <div style={{ flex: 1, overflow: "auto", padding: "8px 0" }}>
        {notes.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("workspace.noNotes", "暂无笔记")}
            style={{ marginTop: 40 }}
          />
        ) : (
          <List
            dataSource={notes}
            renderItem={(note) => (
              <List.Item
                style={{
                  padding: "8px 12px",
                  borderBottom: `1px solid ${borderColor}`,
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      gap: 4,
                      marginBottom: 4,
                      alignItems: "center",
                    }}
                  >
                    <Tag
                      color={note.isQuestion ? "orange" : "blue"}
                      style={{ fontSize: 10, margin: 0 }}
                      icon={
                        note.isQuestion ? (
                          <QuestionCircleOutlined />
                        ) : (
                          <BulbOutlined />
                        )
                      }
                    >
                      {note.isQuestion
                        ? t("workspace.question", "问题")
                        : t("workspace.note", "笔记")}
                    </Tag>
                    <Tooltip title={t("workspace.jumpToPage", "跳转到此页")}>
                      <Tag
                        style={{
                          fontSize: 10,
                          margin: 0,
                          cursor: "pointer",
                        }}
                        onClick={() => onNavigate(note.page)}
                      >
                        P{note.page}
                      </Tag>
                    </Tooltip>
                  </div>
                  <Typography.Paragraph
                    style={{
                      margin: 0,
                      fontSize: 12,
                      color: isDark ? "#ccc" : "#333",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {note.content}
                  </Typography.Paragraph>
                </div>
                <Space size={0} direction="vertical">
                  {note.isQuestion && (
                    <Tooltip title={t("workspace.sendToAI", "发送给 AI")}>
                      <Button
                        size="small"
                        type="text"
                        icon={<SendOutlined />}
                        onClick={() => handleAskAI(note)}
                      />
                    </Tooltip>
                  )}
                  <Tooltip title={t("workspace.delete", "删除")}>
                    <Button
                      size="small"
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(note.id)}
                    />
                  </Tooltip>
                </Space>
              </List.Item>
            )}
          />
        )}
      </div>

      {/* 输入区 */}
      <div
        style={{
          padding: "8px 12px",
          borderTop: `1px solid ${borderColor}`,
          flexShrink: 0,
        }}
      >
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isQuestion
              ? t("workspace.questionPlaceholder", "输入关于此页的问题...")
              : t("workspace.notePlaceholder", "记录关于此页的笔记...")
          }
          autoSize={{ minRows: 2, maxRows: 4 }}
          style={{ fontSize: 12, marginBottom: 8 }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            size="small"
            type={isQuestion ? "default" : "text"}
            icon={<QuestionCircleOutlined />}
            onClick={() => setIsQuestion(!isQuestion)}
            style={{ fontSize: 11 }}
          >
            {isQuestion
              ? t("workspace.asQuestion", "作为问题")
              : t("workspace.asNote", "作为笔记")}
          </Button>
          <Button
            size="small"
            type="primary"
            icon={<EditOutlined />}
            onClick={handleAdd}
            disabled={!input.trim()}
          >
            {t("workspace.add", "添加")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResearchPanel;
