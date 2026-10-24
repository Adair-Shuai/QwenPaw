import { getHost } from "../core/runtime";
import {
  fetchEngineInstallTask,
  fetchEngineRuntimePlan,
  installEngineRuntime,
} from "./domainEngineApi";
import type { EngineRuntimePlan, RuntimeInstallTask } from "./types";

export function RuntimeInstallDialog({
  open,
  engineName,
  plan,
  task,
  error,
  onClose,
  onTaskChange,
  onRetry,
  onCompleted,
  onManage,
}: {
  open: boolean;
  engineName: string;
  plan: EngineRuntimePlan | null;
  task: RuntimeInstallTask | null;
  error: string;
  onClose: () => void;
  onTaskChange: (task: RuntimeInstallTask) => void;
  onRetry: (message?: string) => void;
  onCompleted: () => void;
  onManage: () => void;
}) {
  const React = getHost().React;
  const { Modal, Button, Typography, Alert, Progress, Tag, Space } =
    getHost().antd;
  const { Text, Paragraph } = Typography;
  const generation = React.useRef(0);
  const mounted = React.useRef(true);
  const identity = `${open}:${plan?.engine_id || ""}`;
  const identityRef = React.useRef(identity);
  identityRef.current = identity;
  const [starting, setStarting] = React.useState(false);
  const [pollingError, setPollingError] = React.useState("");
  const [pollRevision, setPollRevision] = React.useState(0);
  const busy = task?.status === "queued" || task?.status === "running";

  React.useEffect(() => {
    setStarting(false);
    setPollingError("");
  }, [identity]);

  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      generation.current += 1;
    };
  }, []);

  React.useEffect(() => {
    if (!open || !busy || !task) return;
    const current = ++generation.current;
    let stopped = false;
    const poll = async () => {
      while (!stopped && current === generation.current) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (stopped || current !== generation.current) return;
        try {
          const latest = await fetchEngineInstallTask(task.id);
          if (stopped || current !== generation.current) return;
          setPollingError("");
          onTaskChange(latest);
          if (latest.status === "completed") {
            onCompleted();
            return;
          }
          if (latest.status === "failed") return;
        } catch (err: unknown) {
          if (stopped || current !== generation.current) return;
          const message =
            err instanceof Error ? err.message : "连接安装任务失败";
          if (/HTTP 404|not found|未找到/i.test(message)) {
            try {
              const recovered = await fetchEngineRuntimePlan(task.engine_id);
              if (stopped || current !== generation.current) return;
              if (recovered.state === "ready") {
                onTaskChange({
                  ...task,
                  status: "completed",
                  progress: 100,
                  message: "依赖已就绪，已恢复安装状态。",
                  error: "",
                });
                onCompleted();
              } else if (recovered.active_task) {
                onTaskChange(recovered.active_task);
                setPollRevision((value) => value + 1);
              } else {
                onTaskChange({
                  ...task,
                  status: "failed",
                  error: "未找到此安装任务，且依赖尚未就绪，请重新发起安装。",
                });
              }
            } catch {
              if (stopped || current !== generation.current) return;
              setPollingError("暂时无法确认安装结果，请重新检测以恢复进度。");
            }
          } else {
            setPollingError(
              "连接安装任务时遇到问题。安装可能仍在后台继续，请重新检测以恢复进度。" +
                `（${message}）`,
            );
          }
          return;
        }
      }
    };
    void poll();
    return () => {
      stopped = true;
      generation.current += 1;
    };
  }, [open, busy, task?.id, pollRevision, onTaskChange, onCompleted]);

  const start = async () => {
    if (!plan?.installable || starting || busy) return;
    const requestIdentity = identityRef.current;
    setStarting(true);
    try {
      const created = await installEngineRuntime(plan.engine_id);
      if (!mounted.current || identityRef.current !== requestIdentity) return;
      onTaskChange(created);
      if (created.status === "completed") onCompleted();
    } catch (err: unknown) {
      if (!mounted.current || identityRef.current !== requestIdentity) return;
      onRetry(err instanceof Error ? err.message : "无法开始安装，请重试");
    } finally {
      if (mounted.current && identityRef.current === requestIdentity)
        setStarting(false);
    }
  };

  const canStart = !!plan?.installable && !busy && task?.status !== "completed";
  const done = task?.status === "completed";
  const failed = task?.status === "failed";
  const status = done
    ? React.createElement(Alert, {
        type: "success",
        showIcon: true,
        message: "安装完成",
        description:
          task?.message || "运行环境安装完成。请关闭弹窗查看刷新后的工具状态。",
      })
    : failed
    ? React.createElement(Alert, {
        type: "error",
        showIcon: true,
        message: "安装失败",
        description: task?.error || task?.message || "安装失败，请重试。",
      })
    : task
    ? React.createElement(
        "div",
        { role: "status", "aria-live": "polite", style: { marginTop: 16 } },
        React.createElement(
          Space,
          { size: 8 },
          React.createElement(
            Tag,
            { color: busy ? "processing" : "default" },
            task.status === "queued"
              ? "排队中"
              : task.status === "running"
              ? "安装中"
              : task.status,
          ),
          React.createElement(Text, null, task.message || "正在准备安装…"),
        ),
        busy
          ? React.createElement(
              React.Fragment,
              null,
              React.createElement(
                Text,
                {
                  type: "secondary",
                  style: { display: "block", marginTop: 8, fontSize: 12 },
                },
                "阶段进度（非下载百分比）",
              ),
              React.createElement(Progress, {
                percent: task.progress ?? undefined,
                status: "active",
                showInfo: false,
                style: { marginTop: 2, marginBottom: 0 },
              }),
            )
          : null,
        task.warning
          ? React.createElement(Alert, {
              style: { marginTop: 10 },
              type: "warning",
              showIcon: true,
              message: task.warning,
            })
          : null,
      )
    : null;

  return React.createElement(
    Modal,
    {
      title: `${engineName} · 运行环境`,
      open,
      onCancel: onClose,
      width: "min(520px, calc(100vw - 32px))",
      destroyOnHidden: false,
      footer: done
        ? React.createElement(
            Button,
            {
              type: "primary",
              onClick: onClose,
              "aria-label": "关闭安装完成提示",
            },
            "关闭",
          )
        : failed
        ? React.createElement(
            Space,
            null,
            React.createElement(Button, { onClick: onClose }, "关闭"),
            React.createElement(
              Button,
              {
                type: "primary",
                onClick: start,
                disabled: !plan?.installable,
                loading: starting,
                "aria-label": "重试安装",
              },
              "重试安装",
            ),
          )
        : task
        ? React.createElement(
            Button,
            { onClick: onClose, "aria-label": "关闭安装进度" },
            "后台继续，关闭窗口",
          )
        : plan && !plan.installable && plan.state !== "ready"
        ? React.createElement(
            React.Fragment,
            null,
            React.createElement(Button, { onClick: onClose }, "关闭"),
            React.createElement(
              Button,
              { onClick: onManage, "aria-label": "前往工具或技能管理入口" },
              "前往管理入口",
            ),
          )
        : plan?.state === "ready"
        ? React.createElement(
            Button,
            { type: "primary", onClick: onClose },
            "关闭",
          )
        : React.createElement(
            Space,
            null,
            React.createElement(Button, { onClick: onClose }, "取消"),
            React.createElement(
              Button,
              {
                type: "primary",
                disabled: !canStart || starting,
                loading: starting,
                onClick: start,
                "aria-label": "开始安装运行环境",
              },
              "开始安装",
            ),
          ),
    },
    error
      ? React.createElement(Alert, {
          type: "error",
          showIcon: true,
          message: "运行环境操作未完成",
          description: error,
          action: React.createElement(
            Button,
            {
              size: "small",
              onClick: () => onRetry(),
              "aria-label": "重新检测运行环境",
            },
            "重新检测",
          ),
        })
      : null,
    pollingError
      ? React.createElement(Alert, {
          style: { marginTop: 12 },
          type: "warning",
          showIcon: true,
          message: pollingError,
          action: React.createElement(
            Button,
            {
              size: "small",
              onClick: () => {
                setPollingError("");
                setPollRevision((value) => value + 1);
                onRetry();
              },
              "aria-label": "重新检测安装任务",
            },
            "重新检测",
          ),
        })
      : null,
    plan
      ? React.createElement(
          React.Fragment,
          null,
          React.createElement(
            Paragraph,
            { style: { marginBottom: 12 } },
            plan.state === "ready"
              ? "运行依赖已就绪。你可以关闭窗口并刷新状态。"
              : plan.installable
              ? "将把以下依赖安装到 QwenPaw 软件使用的 Python 环境中。安装耗时和下载量取决于所需依赖。"
              : plan.message || "此运行环境当前无法由软件安装。",
          ),
          plan.packages.length
            ? React.createElement(
                "div",
                {
                  style: {
                    padding: 12,
                    borderRadius: 8,
                    background:
                      "var(--ant-color-fill-quaternary, rgba(127,127,127,.07))",
                  },
                },
                React.createElement(
                  Text,
                  {
                    strong: true,
                    style: { display: "block", marginBottom: 6 },
                  },
                  "依赖清单",
                ),
                ...plan.packages.map((pkg) =>
                  React.createElement(
                    "div",
                    {
                      key: pkg,
                      style: {
                        fontFamily: "monospace",
                        fontSize: 13,
                        lineHeight: "21px",
                        overflowWrap: "anywhere",
                      },
                    },
                    pkg,
                  ),
                ),
              )
            : React.createElement(Alert, {
                type: plan.installable ? "info" : "warning",
                showIcon: true,
                message: plan.message || "没有可列出的安装依赖。",
              }),
          done || plan.state === "ready"
            ? React.createElement(Alert, {
                style: { marginTop: 12 },
                type: "success",
                showIcon: true,
                message: "运行环境已就绪",
              })
            : null,
          !plan.installable && plan.state !== "ready"
            ? React.createElement(Alert, {
                style: { marginTop: 12 },
                type: "warning",
                showIcon: true,
                message:
                  plan.message ||
                  "当前环境不支持自动安装，请前往工具或技能管理入口处理。",
              })
            : null,
        )
      : null,
    status,
  );
}
