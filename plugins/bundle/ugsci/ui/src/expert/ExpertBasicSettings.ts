import { getHost, clearApiCache } from "../core/runtime";
import type { ExpertData, ExpertPresentation } from "../core/types";
import {
  EXPERT_CATEGORIES,
  expertPresentation,
  fetchExpertPresentation,
  saveExpertPresentation,
} from "./expertPresentation";

export function ExpertBasicSettings({
  expert,
  onRefresh,
  onDirtyChange,
}: {
  expert: ExpertData;
  onRefresh: () => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const React = getHost().React;
  const { useState, useEffect } = React;
  const { Input, Select, Button, Alert, message } = getHost().antd;
  const [draft, setDraft] = useState<ExpertPresentation | null>(null);
  const [baseline, setBaseline] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const display = expertPresentation(expert);
  useEffect(() => {
    let active = true;
    fetchExpertPresentation(expert.agent.id)
      .then((value) => {
        if (active) {
          setDraft(value);
          setBaseline(JSON.stringify(value));
        }
      })
      .catch((err) => {
        if (active) setError(err.message || "无法读取显示配置");
      });
    return () => {
      active = false;
    };
  }, [expert.agent.id]);
  const dirty = !!draft && JSON.stringify(draft) !== baseline;
  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);
  const update = (key: keyof ExpertPresentation, value: string | null) =>
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  const save = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      const saved = await saveExpertPresentation(expert.agent.id, draft);
      setDraft(saved);
      setBaseline(JSON.stringify(saved));
      clearApiCache();
      onRefresh();
      message.success("专家显示信息已保存");
    } catch (err: any) {
      message.error(err.message || "保存失败，修改内容已保留");
    } finally {
      setSaving(false);
    }
  };
  if (error)
    return React.createElement(Alert, {
      type: "error",
      showIcon: true,
      message: "显示配置暂不可用",
      description: error,
    });
  if (!draft) return React.createElement("p", null, "正在读取显示配置…");
  return React.createElement(
    "div",
    null,
    React.createElement("h3", null, "基本信息"),
    React.createElement(
      "p",
      { className: "ugsci-settings-intro" },
      "设置卡片的显示名称、分类和简介。留空使用自动摘要，不改变专家指令。",
    ),
    React.createElement(
      "div",
      { className: "ugsci-expert-settings-grid" },
      React.createElement(
        "label",
        null,
        "显示名称",
        React.createElement(Input, {
          "aria-label": "显示名称",
          value: draft.display_name,
          placeholder: expert.agent.name,
          maxLength: 60,
          onChange: (e: any) => update("display_name", e.target.value),
        }),
      ),
      React.createElement(
        "label",
        null,
        "专家分类",
        React.createElement(Select, {
          "aria-label": "专家分类",
          value: draft.category || "auto",
          disabled: !!expert.agent.managed_by_app,
          onChange: (value: string) =>
            update("category", value === "auto" ? null : value),
          options: [
            { value: "auto", label: `自动分类 · ${display.category}` },
            ...EXPERT_CATEGORIES.slice(1).map((value) => ({
              value,
              label: value,
            })),
          ],
        }),
      ),
      React.createElement(
        "label",
        null,
        "专业方向",
        React.createElement(Input, {
          "aria-label": "专业方向",
          value: draft.specialty,
          disabled: !!expert.agent.managed_by_app,
          placeholder: display.specialty,
          maxLength: 50,
          onChange: (e: any) => update("specialty", e.target.value),
        }),
      ),
      React.createElement(
        "label",
        { className: "full" },
        "卡片简介",
        React.createElement(Input.TextArea, {
          "aria-label": "卡片简介",
          value: draft.summary,
          placeholder: display.summary,
          rows: 3,
          maxLength: 180,
          showCount: true,
          onChange: (e: any) => update("summary", e.target.value),
        }),
      ),
    ),
    React.createElement(
      "div",
      { className: "ugsci-settings-save" },
      React.createElement(
        "span",
        { role: "status" },
        dirty ? "有未保存的修改" : "修改仅用于专家卡片展示",
      ),
      React.createElement(
        Button,
        { type: "primary", loading: saving, disabled: !dirty, onClick: save },
        "保存基本信息",
      ),
    ),
  );
}
