import { apiFetch, getHost } from "../core/runtime";

interface InstallState {
  id: string;
  name?: string;
  version?: string;
  status: string;
  error?: string;
  agent_id?: string;
  optional_setup?: string[];
  download_bytes?: number;
  skills?: number;
  runtime_verified?: boolean;
  operation?: string;
  problem?: { code: string; action: string; items?: string[] } | null;
}

const labels: Record<string, string> = {
  planned: "待安装",
  queued: "等待安装",
  downloading: "下载并校验专家包",
  preparing: "安装技能与运行依赖",
  verifying: "执行方法自检",
  activating: "登记专家",
  starting: "启动专家并检查方法工具",
  startup_failed: "已安装，启动检查未通过",
  ready: "基础能力已就绪",
  failed: "安装失败",
  interrupted: "安装已中断",
  cancelled: "安装已取消",
  removed: "专家已删除，可重新安装",
  repair_required: "运行环境需要修复",
  repairing: "准备新的运行环境",
  repair_verifying: "验证修复后的方法服务",
  repair_committing: "切换已验证的运行环境",
  repair_failed: "环境修复未完成",
  repaired: "运行环境已修复，可检查启动",
};
const running = new Set([
  "queued",
  "downloading",
  "preparing",
  "verifying",
  "activating",
  "starting",
  "repairing",
  "repair_verifying",
  "repair_committing",
]);

const startupLabels: Record<string, string> = {
  model_required: "待选择对话模型",
  agent_disabled: "专家尚未启用",
  skills_required: "待补齐必需技能",
  service_unavailable: "方法服务尚未可用",
  tools_required: "待检查方法工具",
};

export function ExpertPackageInstaller({
  manifestPath,
  onClose,
}: {
  manifestPath: string | null;
  onClose: () => void;
}) {
  const { React, antd } = getHost();
  const { useEffect, useState } = React;
  const { Alert, Button, Modal, Space, Spin } = antd;
  const navigate = getHost().useNavigate?.();
  const [jobs, setJobs] = useState<InstallState[]>([]);
  const [plan, setPlan] = useState<InstallState | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    async function refresh() {
      try {
        const next = await apiFetch<InstallState[]>(
          "/expert-packages/installations",
          { bypassCache: true },
        );
        if (alive && Array.isArray(next))
          setJobs(next.filter((j) => j.status !== "planned"));
      } catch {
        // Older hosts retain the existing template market. An explicit package
        // install displays its compatibility/network error in the dialog.
      }
      if (alive) timer = setTimeout(refresh, 1500);
    }
    void refresh();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    let alive = true;
    setPlan(null);
    setError("");
    if (manifestPath) {
      apiFetch<InstallState>("/expert-packages/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manifest_path: manifestPath }),
      })
        .then((value) => {
          if (alive) setPlan(value);
        })
        .catch((err: Error) => {
          if (alive)
            setError(
              err.message || "无法获取专家安装计划，请检查宿主版本和网络",
            );
        });
    }
    return () => {
      alive = false;
    };
  }, [manifestPath]);

  async function start(id: string, repair = false) {
    setBusy(true);
    setError("");
    try {
      const job = await apiFetch<InstallState>(
        `/expert-packages/installations/${id}${repair ? "/repair" : ""}`,
        { method: "POST" },
      );
      setJobs((current) => [...current.filter((j) => j.id !== id), job]);
      onClose();
    } catch (err: any) {
      setError(err.message || (repair ? "修复请求失败" : "安装请求失败"));
    } finally {
      setBusy(false);
    }
  }

  function recoveryButton(job: InstallState) {
    if (
      ![
        "startup_failed",
        "repair_required",
        "repair_failed",
        "repaired",
      ].includes(job.status)
    )
      return null;
    const actions: Record<
      string,
      { label: string; path: string; scoped?: boolean }
    > = {
      models: { label: "选择对话模型", path: "/models" },
      experts: { label: "查看专家配置", path: "/ugsci-experts" },
      skills: {
        label: "检查必需技能",
        path: "/ugsci-tools-skills?tab=skills",
        scoped: true,
      },
      tools: {
        label: "检查方法服务",
        path: "/ugsci-tools-skills?tab=tools",
        scoped: true,
      },
    };
    const key =
      job.problem?.action ||
      (["repair_required", "repair_failed", "repaired"].includes(job.status)
        ? "experts"
        : "");
    if (!Object.prototype.hasOwnProperty.call(actions, key)) return null;
    const action = actions[key];
    return React.createElement(
      Button,
      {
        size: "small",
        disabled: busy,
        onClick: () => {
          try {
            if (action.scoped) {
              const host = getHost();
              if (!job.agent_id || !host.setSelectedAgent)
                throw new Error("无法切换到此专家，请从专家中心打开对应配置");
              host.setSelectedAgent(job.agent_id);
            }
            if (navigate) navigate(action.path);
            else window.location.assign(action.path);
          } catch (err: any) {
            setError(err.message || "无法打开配置，请重试");
          }
        },
      },
      action.label,
    );
  }

  return React.createElement(
    React.Fragment,
    null,
    ...jobs.map((job) =>
      React.createElement(Alert, {
        key: job.id,
        style: { marginBottom: 8 },
        showIcon: true,
        type:
          job.status === "ready" && job.runtime_verified === true
            ? "success"
            : job.status === "failed" || job.status === "startup_failed"
            ? "error"
            : "info",
        message: `${job.name || "专家包"} · ${
          job.operation === "repair" && job.status === "interrupted"
            ? "环境修复已中断，可重试"
            : job.operation === "repair" && job.status === "cancelled"
            ? "环境修复已取消"
            : job.status === "ready" && job.runtime_verified !== true
            ? "已安装，待启动检查"
            : job.status === "startup_failed" &&
              Object.prototype.hasOwnProperty.call(
                startupLabels,
                job.problem?.code || "",
              )
            ? startupLabels[job.problem!.code]
            : labels[job.status] || job.status
        }`,
        description: [
          job.error,
          ["repair_required", "repaired"].includes(job.status)
            ? "修复保留专家、设置和业务文件；运行中的专家请先停用，修复后不会自动启用。"
            : null,
          ...(job.optional_setup || []).map(
            (value) => `可选能力需另行配置：${value}`,
          ),
        ]
          .filter(Boolean)
          .join("；"),
        action: React.createElement(
          Space,
          { wrap: true },
          recoveryButton(job),
          !running.has(job.status) &&
            (["repair_required", "repair_failed"].includes(job.status) ||
              (job.operation === "repair" &&
                ["cancelled", "interrupted"].includes(job.status)) ||
              (job.status === "startup_failed" &&
                job.problem?.code === "service_unavailable"))
            ? React.createElement(
                Button,
                {
                  size: "small",
                  disabled: busy,
                  onClick: () => void start(job.id, true),
                },
                "修复运行环境",
              )
            : null,
          running.has(job.status)
            ? React.createElement(
                Space,
                null,
                React.createElement(Spin, { size: "small" }),
                React.createElement(
                  Button,
                  {
                    size: "small",
                    disabled:
                      busy ||
                      ["activating", "starting", "repair_committing"].includes(
                        job.status,
                      ),
                    onClick: async () => {
                      try {
                        await apiFetch(
                          `/expert-packages/installations/${job.id}/cancel`,
                          { method: "POST" },
                        );
                      } catch (err: any) {
                        setError(err.message || "取消请求失败");
                      }
                    },
                  },
                  job.operation === "repair" ? "取消修复" : "取消安装",
                ),
              )
            : ["repair_required", "repair_failed"].includes(job.status) ||
              (job.operation === "repair" &&
                ["interrupted", "cancelled"].includes(job.status))
            ? null
            : job.status !== "ready" || job.runtime_verified !== true
            ? React.createElement(
                Button,
                {
                  size: "small",
                  disabled: busy,
                  onClick: () => void start(job.id),
                },
                job.status === "startup_failed"
                  ? "重试启动"
                  : ["ready", "repaired"].includes(job.status)
                  ? "检查并启动"
                  : "继续安装",
              )
            : React.createElement(
                Button,
                {
                  size: "small",
                  onClick: () => {
                    window.history.pushState({}, "", "/ugsci-experts");
                    window.dispatchEvent(new PopStateEvent("popstate"));
                  },
                },
                "查看专家",
              ),
        ),
      }),
    ),
    !manifestPath && error
      ? React.createElement(Alert, { type: "error", message: error })
      : null,
    React.createElement(
      Modal,
      {
        open: !!manifestPath,
        title: "安装专家及配套能力",
        onCancel: onClose,
        footer: React.createElement(
          Space,
          null,
          React.createElement(Button, { onClick: onClose }, "关闭"),
          React.createElement(
            Button,
            {
              type: "primary",
              loading: busy,
              disabled: !plan || !!error,
              onClick: () => plan && void start(plan.id),
            },
            "安装专家包",
          ),
        ),
      },
      error
        ? React.createElement(Alert, { type: "error", message: error })
        : plan
        ? React.createElement(
            "div",
            null,
            React.createElement("p", null, `${plan.name} ${plan.version}`),
            React.createElement(
              "p",
              null,
              `${plan.skills} 个技能，配套方法服务与运行依赖；下载约 ${(
                (plan.download_bytes || 0) /
                1024 /
                1024
              ).toFixed(1)} MB。`,
            ),
            React.createElement(
              "p",
              null,
              "安装时执行方法自检；登记后检查模型配置、技能和实际方法工具，通过后才显示就绪。",
            ),
            ...(plan.optional_setup || []).map((value) =>
              React.createElement("p", { key: value }, `可选：${value}`),
            ),
          )
        : React.createElement(Spin, null),
    ),
  );
}
