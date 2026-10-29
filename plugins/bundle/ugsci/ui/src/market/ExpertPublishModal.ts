import { apiFetch, getHost } from "../core/runtime";
import { fetchOSSAgentsManifest } from "./marketHelpers";

/** A deliberately public template editor; never reads the user's agent files. */
export function ExpertPublishModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { React, antd } = getHost();
  const h = React.createElement;
  const { Modal, Input, Button, Alert, Checkbox, Radio, Space } = antd;
  const [draft, setDraft] = React.useState({
    id: "",
    name: "",
    version: "1.0.0",
    description: "",
    author: "",
    system_prompt: "",
    tags: "",
    recommended_skills: "",
  });
  const [token, setToken] = React.useState("");
  const [mode, setMode] = React.useState("submission");
  const [status, setStatus] = React.useState<any>(null);
  const [checked, setChecked] = React.useState("");
  const [consent, setConsent] = React.useState(false);
  const [busy, setBusy] = React.useState("");
  const [error, setError] = React.useState("");
  const [receipt, setReceipt] = React.useState<any>(null);
  React.useEffect(() => {
    if (!open) {
      setToken("");
      return;
    }
    let active = true;
    setChecked("");
    setConsent(false);
    setReceipt(null);
    setError("");
    setStatus(null);
    apiFetch("/publisher/status")
      .then((value) => {
        if (active) setStatus(value);
      })
      .catch(() => {
        if (active) setError("无法读取发布服务配置，请稍后重试");
      });
    return () => {
      active = false;
    };
  }, [open]);
  const expert = {
    ...draft,
    tags: draft.tags
      .split(/[,，]/)
      .map((item) => item.trim())
      .filter(Boolean),
    recommended_skills: draft.recommended_skills
      .split(/[,，]/)
      .map((item) => item.trim())
      .filter(Boolean),
  };
  const payload = JSON.stringify({ expert, mode });
  const fingerprint = payload + token;
  const configured =
    mode === "release"
      ? status?.direct_publish_configured
      : status?.submission_configured;
  const execute = async (action: "inspect" | "publish") => {
    setError("");
    setReceipt(null);
    setBusy(action);
    try {
      const result = await apiFetch<any>(`/publisher/expert/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-UGSci-Publisher-Token": token,
        },
        body: payload,
      });
      if (action === "inspect") setChecked(fingerprint);
      setReceipt(result);
      if (result.status === "published") {
        void fetchOSSAgentsManifest(true).catch(() => {});
      }
    } catch (reason: any) {
      setChecked("");
      let detail = reason?.message || "提交失败，请重试";
      try {
        detail = JSON.parse(detail).detail || detail;
      } catch {
        /* plain error */
      }
      setError(String(detail));
    } finally {
      setBusy("");
    }
  };
  const importTemplate = async (file?: File) => {
    if (!file) return;
    setError("");
    setReceipt(null);
    setChecked("");
    setConsent(false);
    try {
      if (file.size > 1024 * 1024) throw new Error("专家 JSON 不能超过 1 MB");
      const value = JSON.parse(await file.text());
      const allowed = [
        "id",
        "name",
        "version",
        "description",
        "author",
        "system_prompt",
        "tags",
        "recommended_skills",
      ];
      if (
        !value ||
        typeof value !== "object" ||
        Array.isArray(value) ||
        Object.keys(value).some((key) => !allowed.includes(key))
      )
        throw new Error(
          "仅支持公开专家模板字段；请移除记忆、知识文件、凭证和其他运行配置",
        );
      for (const key of allowed) {
        if (value[key] === undefined) continue;
        if (
          ["tags", "recommended_skills"].includes(key)
            ? !Array.isArray(value[key]) ||
              value[key].some((item: any) => typeof item !== "string")
            : typeof value[key] !== "string"
        )
          throw new Error(`字段 ${key} 格式无效`);
      }
      setDraft({
        id: value.id || "",
        name: value.name || "",
        version: value.version || "1.0.0",
        description: value.description || "",
        author: value.author || "",
        system_prompt: value.system_prompt || "",
        tags: (value.tags || []).join(", "),
        recommended_skills: (value.recommended_skills || []).join(", "),
      });
    } catch (reason: any) {
      setError(reason?.message || "模板导入失败");
    }
  };
  const downloadTemplate = () => {
    const sample = {
      id: "yourname-expert",
      name: "公开专家",
      version: "1.0.0",
      description: "专家职责",
      author: "团队名",
      system_prompt: "填写可公开分享的专家提示词。",
      tags: ["科研"],
      recommended_skills: [],
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(sample, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "ugsci-expert-template.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const field = (
    key: keyof typeof draft,
    label: string,
    placeholder: string,
    multiline = false,
  ) =>
    h(
      "label",
      { key, style: { display: "block", marginBottom: 12 } },
      h("div", { style: { marginBottom: 4 } }, label),
      h(multiline ? Input.TextArea : Input, {
        "aria-label": label,
        value: draft[key],
        placeholder,
        rows: key === "system_prompt" ? 7 : 2,
        onChange: (event: any) => {
          setDraft((previous) => ({ ...previous, [key]: event.target.value }));
          setReceipt(null);
        },
      }),
    );
  return h(
    Modal,
    {
      open,
      title: "发布 / 更新专家到 UGSci",
      width: 720,
      destroyOnHidden: true,
      closable: !busy,
      maskClosable: !busy,
      onCancel: () => {
        if (!busy) {
          setToken("");
          onClose();
        }
      },
      footer: null,
    },
    h(Alert, {
      type: "info",
      showIcon: true,
      message: "编写可公开分享的专家模板",
      description:
        "填写公开提示词与推荐技能名称。此入口不读取本机专家的聊天、记忆、知识文件或账号配置。更新时保留 ID、提高版本号；投稿审核通过后市场可见。",
      style: { marginBottom: 16 },
    }),
    h(
      Space,
      { style: { marginBottom: 16 }, wrap: true },
      h(
        "label",
        null,
        "导入专家 JSON ",
        h("input", {
          type: "file",
          accept: ".json,application/json",
          "aria-label": "导入专家 JSON",
          disabled: !!busy,
          onChange: (event: any) => {
            void importTemplate(event.target.files?.[0]);
            event.target.value = "";
          },
        }),
      ),
      h(Button, { onClick: downloadTemplate }, "下载空白模板"),
    ),
    field(
      "id",
      "专家 ID",
      "例如 alice-reservoir，须以管理员分配的命名空间开头",
    ),
    h(
      "div",
      { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } },
      field("name", "专家名称", "公开显示的名称"),
      field("version", "版本号", "例如 1.0.0"),
    ),
    field("description", "简介", "专家擅长什么", true),
    field("author", "公开作者", "可使用团队名或笔名"),
    field(
      "system_prompt",
      "公开提示词",
      "填写专家职责、流程与输出要求；勿填写私人资料或密钥",
      true,
    ),
    field("tags", "标签", "科研, 油藏工程"),
    field(
      "recommended_skills",
      "推荐技能名称",
      "多个名称以逗号分隔，不上传技能文件",
    ),
    h(
      "label",
      null,
      "投稿凭证（仅本次使用）",
      h(Input.Password, {
        "aria-label": "投稿凭证",
        value: token,
        autoComplete: "off",
        onChange: (event: any) => setToken(event.target.value),
        placeholder: "管理员分配的投稿凭证，无需 OSS AccessKey",
      }),
    ),
    h(Radio.Group, {
      value: mode,
      style: { margin: "12px 0" },
      onChange: (event: any) => {
        setMode(event.target.value);
        setReceipt(null);
      },
      options: [
        { label: "投稿待审核", value: "submission" },
        {
          label: "管理员发布",
          value: "release",
          disabled: !status?.direct_publish_configured,
        },
      ],
    }),
    h(
      "div",
      { style: { marginBottom: 12 } },
      h(
        Checkbox,
        {
          checked: consent,
          onChange: (event: any) => setConsent(event.target.checked),
        },
        "我确认以上内容可公开分享，不含私人数据或账号密钥",
      ),
    ),
    status &&
      !configured &&
      h(Alert, {
        type: "warning",
        message:
          "管理员尚未配置远端发布服务，当前无法上传 OSS。请联系管理员开通投稿服务。",
        style: { marginBottom: 12 },
      }),
    error &&
      h(Alert, {
        type: "error",
        showIcon: true,
        message: error,
        style: { marginBottom: 12 },
      }),
    receipt &&
      h(Alert, {
        showIcon: true,
        type: receipt.status === "checked" ? "info" : "success",
        message:
          receipt.status === "checked"
            ? `服务端检查通过：${
                receipt.operation === "update" ? "更新现有专家" : "新增专家"
              }`
            : receipt.status === "published"
            ? "已发布，OSS 内容与目录已校验"
            : "已上传 OSS，等待管理员审核",
        description: h(
          "div",
          { style: { overflowWrap: "anywhere" } },
          h("div", null, `回执：${receipt.receipt_id}`),
          h("div", null, `SHA-256：${receipt.sha256}`),
        ),
        style: { marginBottom: 12 },
      }),
    h(
      Space,
      null,
      h(
        Button,
        {
          disabled:
            !!busy ||
            !configured ||
            !token.trim() ||
            !draft.id ||
            !draft.name ||
            !draft.system_prompt,
          loading: busy === "inspect",
          onClick: () => execute("inspect"),
        },
        "检查归属与版本",
      ),
      h(
        Button,
        {
          type: "primary",
          disabled:
            !!busy || !configured || !consent || checked !== fingerprint,
          loading: busy === "publish",
          onClick: () => execute("publish"),
        },
        mode === "release" ? "发布新版本" : "上传到 OSS 待审核",
      ),
    ),
    busy &&
      h(
        "div",
        { role: "status", style: { marginTop: 12 } },
        busy === "inspect"
          ? "正在校验身份、命名空间与版本…"
          : "正在写入 OSS 并核验回执，请稍候…",
      ),
  );
}
