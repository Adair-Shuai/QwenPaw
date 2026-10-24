import React, { useMemo, useState } from "react";
import { Input, Pagination } from "antd";
import { Plus as PlusOutlined } from "lucide-react";
import { Button, Tag } from "@agentscope-ai/design";
import { useTranslation } from "react-i18next";
import type {
  MCPAccessEffect,
  MCPAccessPrincipalOption,
  MCPAccessRule,
  MCPToolAccessOverride,
} from "../../../../api/types";
import type { MCPAccessToolGroup } from "../accessPolicy";
import { toolRuleIdentityKey } from "../accessPolicy";
import styles from "../index.module.less";
import { MCPAccessPolicySegmented } from "./MCPAccessPolicySegmented";
import { MCPAccessRuleRows } from "./MCPAccessRuleRows";

interface MCPAccessToolPanelProps {
  groups: MCPAccessToolGroup[];
  principalOptions: MCPAccessPrincipalOption[];
  channelSourceValues: readonly string[];
  setToolDefaultEffect: (toolName: string, effect: MCPAccessEffect) => void;
  addRule: (toolName: string) => void;
  updateRule: (
    rule: MCPToolAccessOverride,
    patch: Partial<MCPAccessRule>,
  ) => void;
  setRuleEffect: (rule: MCPToolAccessOverride, effect: MCPAccessEffect) => void;
  deleteRule: (rule: MCPToolAccessOverride) => void;
  effectLabel: (effect: MCPAccessEffect) => string;
}

export const MCPAccessToolPanel: React.FC<MCPAccessToolPanelProps> = ({
  groups,
  principalOptions,
  channelSourceValues,
  setToolDefaultEffect,
  addRule,
  updateRule,
  setRuleEffect,
  deleteRule,
  effectLabel,
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  // Remote services can expose hundreds of tools. Mount only one page of
  // editors so loading their schemas cannot starve the modal's close action.
  const pageSize = 20;
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return needle
      ? groups.filter((group) =>
          `${group.toolName} ${group.description || ""}`
            .toLocaleLowerCase()
            .includes(needle),
        )
      : groups;
  }, [groups, query]);
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(filtered.length / pageSize)),
  );
  const visibleGroups = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className={styles.accessToolsPanel}>
      <div className={styles.accessSectionHeader}>
        <div className={styles.accessSectionTitle}>
          {t("mcp.access.toolSection")}
        </div>
      </div>
      <Input
        allowClear
        aria-label={t("tools.search")}
        placeholder={t("tools.search")}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setPage(1);
        }}
      />
      <div className={styles.accessToolGroups}>
        {visibleGroups.map((group) => (
          <div key={group.toolName} className={styles.accessToolGroup}>
            <div className={styles.accessToolGroupHeader}>
              <div className={styles.accessToolInfo}>
                <div className={styles.accessToolTitle}>
                  <Tag color={group.stale ? "default" : "blue"}>
                    {group.toolName}
                  </Tag>
                  {group.stale && (
                    <Tag color="orange">{t("mcp.access.stale")}</Tag>
                  )}
                </div>
              </div>
              <div className={styles.accessToolDefault}>
                <span className={styles.accessDefaultLabel}>
                  {t("mcp.access.default")}
                </span>
                <MCPAccessPolicySegmented
                  value={group.defaultEffect}
                  onChange={(effect) =>
                    setToolDefaultEffect(group.toolName, effect)
                  }
                  effectLabel={effectLabel}
                />
              </div>
              <Button
                className={styles.accessToolAddButton}
                icon={<PlusOutlined size="1em" />}
                onClick={() => addRule(group.toolName)}
              >
                {t("mcp.access.addRule")}
              </Button>
            </div>

            {(group.description ||
              (group.inputSchema &&
                Object.keys(group.inputSchema).length > 0)) && (
              <ToolSchema group={group} label={t("mcp.toolSchema")} />
            )}

            <MCPAccessRuleRows
              rules={group.rules}
              principalOptions={principalOptions}
              channelSourceValues={channelSourceValues}
              getKey={toolRuleIdentityKey}
              updateRule={updateRule}
              setRuleEffect={setRuleEffect}
              deleteRule={deleteRule}
              emptyText={t("mcp.access.noRules")}
              effectLabel={effectLabel}
            />
          </div>
        ))}
      </div>
      <Pagination
        size="small"
        current={currentPage}
        pageSize={pageSize}
        total={filtered.length}
        onChange={setPage}
        showSizeChanger={false}
        hideOnSinglePage
      />
    </div>
  );
};

function ToolSchema({
  group,
  label,
}: {
  group: MCPAccessToolGroup;
  label: string;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <details
      className={styles.toolSchema}
      onToggle={(event) => setExpanded(event.currentTarget.open)}
    >
      <summary>{label}</summary>
      {expanded && (
        <>
          {group.description && (
            <div className={styles.toolSchemaDescription}>
              {group.description}
            </div>
          )}
          {group.inputSchema && Object.keys(group.inputSchema).length > 0 && (
            <pre className={styles.toolSchemaContent}>
              {JSON.stringify(group.inputSchema, null, 2)}
            </pre>
          )}
        </>
      )}
    </details>
  );
}
