/**
 * Capability card component — displays a single MCP client.
 */

import { getHost } from "../core/runtime";
import { PRIMARY_BTN_STYLE } from "../core/shared";
import type { MCPClientInfo, MCPClientUpdate, MCPAccessPolicy } from "../core/types";
import {
  toggleMCPClientForCapabilities,
  deleteMCPClientForCapabilities,
} from "../core/api";
import { UGSciMCPAccessModal, UGSciMCPOAuthModal } from "./MCPModals";

export function CapabilityCard({
  mcp,
  agentId,
  onToggle,
  onDelete,
  onUpdate,
  onUpdatePolicy,
  onRefresh,
}: {
  mcp: MCPClientInfo;
  agentId: string;
  onToggle: (e: React.MouseEvent) => void;
  onDelete: () => void;
  onUpdate: (key: string, updates: MCPClientUpdate) => Promise<boolean>;
  onUpdatePolicy: (key: string, policy: MCPAccessPolicy) => Promise<boolean>;
  onRefresh?: () => Promise<void>;
}) {
  const React = getHost().React;
  const { useState } = React;
  const { Card, Tag, Tooltip, Modal, Input, Button, Typography } = getHost().antd;
  const { Text } = Typography;
  const {
    EyeOutlined,
    EyeInvisibleOutlined,
    DeleteOutlined,
    ToolOutlined,
  } = getHost().antdIcons || {};

  const [jsonModalOpen, setJsonModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [editedJson, setEditedJson] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [oauthModalOpen, setOauthModalOpen] = useState(false);

  const isRemote = mcp.transport === "streamable_http" || mcp.transport === "sse";
  const clientType = isRemote ? "Remote" : "Local";

  const oauthStatus = mcp.oauth_status;
  const now = Date.now() / 1000;
  const isOauthAuthorized = !!oauthStatus?.authorized && oauthStatus.expires_at > now;
  const isOauthExpired = !!oauthStatus?.authorized && oauthStatus.expires_at <= now;
  const hasOauth = !!oauthStatus;

  const handleCardClick = () => {
    setEditedJson(JSON.stringify(mcp, null, 2));
    setIsEditing(false);
    setJsonModalOpen(true);
  };

  const handleSaveJson = async () => {
    try {
      const parsed = JSON.parse(editedJson);
      // Only extract updatable fields to avoid sending read-only server-side
      // data (oauth_status, access_summary, tools, etc.) back to the backend.
      const allowedKeys: (keyof MCPClientUpdate)[] = [
        "name", "description", "command", "enabled", "transport",
        "url", "headers", "args", "env", "cwd",
      ];
      const updates: MCPClientUpdate = {};
      for (const k of allowedKeys) {
        if (k in parsed) (updates as any)[k] = parsed[k];
      }
      const success = await onUpdate(mcp.key, updates);
      if (success) { setJsonModalOpen(false); setIsEditing(false); }
    } catch { alert("JSON 格式错误"); }
  };

  const clientJson = JSON.stringify(mcp, null, 2);

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      Card,
      {
        hoverable: true,
        onClick: handleCardClick,
        size: "small",
        style: {
          cursor: "pointer",
          borderColor: mcp.enabled ? undefined : "#d9d9d9",
          opacity: mcp.enabled ? 1 : 0.7,
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
        },
        styles: {
          body: {
            display: "flex",
            flexDirection: "column",
            height: "100%",
            flex: 1,
          },
        },
      },
      // ── Header: name + type badge + oauth icons + status ──
      React.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 } },
        React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, minWidth: 0 } },
          React.createElement(
            Tooltip,
            { title: mcp.name },
            React.createElement(Text, { strong: true, style: { fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, mcp.name || mcp.key),
          ),
          React.createElement(
            "span",
            { style: { fontSize: 10, padding: "1px 6px", borderRadius: 4, background: isRemote ? "#e6f4ff" : "#f9f0ff", color: isRemote ? "#1677ff" : "#722ed1", flexShrink: 0 } },
            clientType,
          ),
          // OAuth status icons
          hasOauth && isOauthExpired
            ? React.createElement("span", { style: { fontSize: 11, color: "#e67e22", flexShrink: 0 } }, "⚠")
            : null,
          hasOauth && isOauthAuthorized
            ? React.createElement("span", { style: { fontSize: 11, color: "#27ae60", flexShrink: 0 } }, "✓")
            : null,
          hasOauth && !isOauthAuthorized && !isOauthExpired
            ? React.createElement("span", { style: { fontSize: 11, color: "#7f8c8d", flexShrink: 0 } }, "🔒")
            : null,
        ),
        React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, flexShrink: 0 } },
          React.createElement("span", { style: { width: 6, height: 6, borderRadius: "50%", background: mcp.enabled ? "#52c41a" : "#d9d9d9" } }),
          mcp.enabled ? "启用" : "停用",
        ),
      ),
      // ── Description ──
      React.createElement(
        "p",
        { style: { fontSize: 12, color: "#666", margin: "6px 0 8px", lineHeight: 1.6, minHeight: 36, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" } },
        mcp.description || "-",
      ),
      // ── Footer: tools button + secondary actions ──
      React.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 8, marginTop: "auto", paddingTop: 12, borderTop: "1px solid #f0f0f0" } },
        // Tools button
        React.createElement(
          Button,
          {
            size: "small",
            icon: ToolOutlined ? React.createElement(ToolOutlined) : undefined,
            onClick: (e: React.MouseEvent) => { e.stopPropagation(); setAccessModalOpen(true); },
            style: { width: "100%" },
          },
          "工具与访问策略",
        ),
        // Secondary actions: oauth (remote only) + toggle + delete
        React.createElement(
          "div",
          { style: { display: "grid", gridTemplateColumns: isRemote ? "1fr 1fr 1fr" : "1fr 1fr", gap: 8 } },
          isRemote
            ? React.createElement(
                Button,
                {
                  size: "small",
                  onClick: (e: React.MouseEvent) => { e.stopPropagation(); setOauthModalOpen(true); },
                  style: {
                    color: isOauthAuthorized ? "#27ae60" : isOauthExpired ? "#e67e22" : undefined,
                    borderColor: isOauthAuthorized ? "#27ae60" : isOauthExpired ? "#e67e22" : undefined,
                    background: isOauthAuthorized ? "rgba(39,174,96,0.06)" : isOauthExpired ? "rgba(230,126,34,0.06)" : undefined,
                  },
                },
                isOauthAuthorized ? "已授权" : isOauthExpired ? "已过期" : "授权",
              )
            : null,
          React.createElement(
            Button,
            {
              size: "small",
              icon: mcp.enabled
                ? EyeInvisibleOutlined ? React.createElement(EyeInvisibleOutlined) : undefined
                : EyeOutlined ? React.createElement(EyeOutlined) : undefined,
              onClick: onToggle,
            },
            mcp.enabled ? "禁用" : "启用",
          ),
          React.createElement(
            Button,
            {
              size: "small",
              danger: true,
              icon: DeleteOutlined ? React.createElement(DeleteOutlined) : undefined,
              onClick: (e: React.MouseEvent) => { e.stopPropagation(); setDeleteModalOpen(true); },
            },
            "删除",
          ),
        ),
      ),
    ),
    // ── Delete Confirmation Modal ──
    React.createElement(
      Modal,
      {
        title: "确认删除",
        open: deleteModalOpen,
        onOk: () => { setDeleteModalOpen(false); onDelete(); },
        onCancel: () => setDeleteModalOpen(false),
        okText: "确认删除",
        cancelText: "取消",
        okButtonProps: { danger: true },
      },
      React.createElement("p", null, `确定要删除 MCP 客户端「${mcp.name || mcp.key}」吗？此操作不可撤销。`),
    ),
    // ── JSON Config Modal (click card to view/edit) ──
    React.createElement(
      Modal,
      {
        title: `${mcp.name || mcp.key} - 配置`,
        open: jsonModalOpen,
        onCancel: () => { setJsonModalOpen(false); setIsEditing(false); },
        footer: React.createElement(
          "div",
          { style: { textAlign: "right" } },
          React.createElement(Button, { onClick: () => { setJsonModalOpen(false); setIsEditing(false); }, style: { marginRight: 8 } }, "取消"),
          isEditing
            ? React.createElement(Button, { type: "primary", onClick: handleSaveJson }, "保存")
            : React.createElement(Button, { type: "primary", onClick: () => setIsEditing(true) }, "编辑"),
        ),
        width: 700,
      },
      React.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
        "密钥类字段（如 API_KEY）可能已被后端脱敏，保存时不会覆盖脱敏值。",
      ),
      isEditing
        ? React.createElement(Input.TextArea, {
            value: editedJson,
            onChange: (e: any) => setEditedJson(e.target.value),
            autoSize: { minRows: 15, maxRows: 25 },
            style: { fontFamily: "Monaco, Courier New, monospace", fontSize: 13 },
          })
        : React.createElement(
            "pre",
            { style: { backgroundColor: "#f5f5f5", padding: 16, borderRadius: 8, maxHeight: 400, overflow: "auto", fontSize: 13, fontFamily: "Monaco, Courier New, monospace" } },
            clientJson,
          ),
    ),
    // ── Access Modal (tools + access policy) ──
    React.createElement(UGSciMCPAccessModal, {
      client: mcp,
      agentId,
      open: accessModalOpen,
      onClose: () => setAccessModalOpen(false),
      onSave: onUpdatePolicy,
    }),
    // ── OAuth Modal (remote clients only) ──
    isRemote
      ? React.createElement(UGSciMCPOAuthModal, {
          client: mcp,
          agentId,
          open: oauthModalOpen,
          onClose: () => setOauthModalOpen(false),
          onAuthChanged: async () => { await onRefresh?.(); },
        })
      : null,
  );
}

