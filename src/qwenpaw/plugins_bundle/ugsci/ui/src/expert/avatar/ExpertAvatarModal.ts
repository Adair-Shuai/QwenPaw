import { clearApiCache, getHost } from "../../core/runtime";
import type { ExpertData, ExpertPresentation } from "../../core/types";
import {
  expertPresentation,
  fetchExpertPresentation,
  saveExpertPresentation,
} from "../expertPresentation";
import { avatarForExpert, type ExpertAvatarRecipe } from "./expertAvatar";
import {
  AvatarResetColorsButton,
  ExpertAvatarEditor,
} from "./ExpertAvatarEditor";

export function ExpertAvatarModal({
  expert,
  onClose,
  onSaved,
}: {
  expert: ExpertData;
  onClose: () => void;
  onSaved: () => void;
}) {
  const React = getHost().React;
  const { Modal, Alert, Spin, Button, message } = getHost().antd;
  const [baseline, setBaseline] = React.useState<ExpertPresentation | null>(
    null,
  );
  const [draft, setDraft] = React.useState<ExpertAvatarRecipe | null>(null);
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [revision, setRevision] = React.useState(0);
  const suggested = avatarForExpert({
    ...expert,
    presentation: expert.presentation
      ? { ...expert.presentation, avatar: null }
      : null,
  });
  const display = expertPresentation(expert);
  React.useEffect(() => {
    let active = true;
    setBaseline(null);
    setDraft(null);
    setError("");
    fetchExpertPresentation(expert.agent.id, true)
      .then((value) => {
        if (!active) return;
        setBaseline(value);
        setDraft(
          value.avatar || avatarForExpert({ ...expert, presentation: value }),
        );
      })
      .catch((err: Error) => {
        if (active) setError(err.message || "无法读取头像配置");
      });
    return () => {
      active = false;
    };
  }, [expert.agent.id, revision]);
  const save = async () => {
    if (!baseline || !draft) return;
    setSaving(true);
    setError("");
    try {
      await saveExpertPresentation(expert.agent.id, {
        ...baseline,
        avatar: draft,
      });
      clearApiCache();
      onSaved();
      message.success("专家头像已保存");
      onClose();
    } catch (err: any) {
      setError(err.message || "头像保存失败，修改内容已保留");
    } finally {
      setSaving(false);
    }
  };
  return React.createElement(
    Modal,
    {
      open: true,
      title: React.createElement(
        "span",
        { style: { fontSize: 15, fontWeight: 600, lineHeight: 1.5 } },
        "UGSci 专家头像工坊",
      ),
      width: 736,
      centered: true,
      className: "ugsci-avatar-modal",
      destroyOnHidden: true,
      onCancel: saving ? undefined : onClose,
      closable: !saving,
      maskClosable: !saving,
      keyboard: !saving,
      onOk: save,
      okText: "保存头像",
      cancelText: "取消",
      okButtonProps: { disabled: !draft, loading: saving },
      cancelButtonProps: { disabled: saving },
      styles: {
        content: {
          padding: 0,
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid var(--app-border)",
          background: "var(--app-surface)",
        },
        header: {
          boxSizing: "border-box",
          padding: "10px 24px",
          minHeight: 48,
          margin: 0,
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid var(--app-border)",
          background: "var(--app-surface)",
        },
        body: {
          padding: 0,
          maxHeight: "calc(100dvh - 190px)",
          overflowY: "auto",
        },
        footer: {
          padding: "11px 24px",
          margin: 0,
          borderTop: "1px solid var(--app-border)",
        },
      },
      footer: React.createElement(
        "div",
        { className: "ugsci-avatar-modal-footer" },
        React.createElement(AvatarResetColorsButton, {
          disabled: saving || !draft,
          onClick: () =>
            setDraft((previous) =>
              previous ? { ...previous, colors: {} } : previous,
            ),
        }),
        React.createElement(
          "div",
          null,
          React.createElement(
            Button,
            { disabled: saving, onClick: onClose },
            "取消",
          ),
          React.createElement(
            Button,
            {
              type: "primary",
              disabled: !draft,
              loading: saving,
              onClick: save,
            },
            "保存头像",
          ),
        ),
      ),
    },
    error &&
      React.createElement(Alert, {
        type: "error",
        showIcon: true,
        message: error,
        action: React.createElement(
          Button,
          {
            size: "small",
            disabled: saving,
            onClick: () => setRevision((value) => value + 1),
          },
          "重新加载配置",
        ),
      }),
    draft
      ? React.createElement(ExpertAvatarEditor, {
          name: display.name,
          value: draft,
          suggested,
          onChange: setDraft,
          disabled: saving,
          showResetColors: false,
        })
      : !error && React.createElement(Spin, { size: "small" }),
  );
}
