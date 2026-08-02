import { useCallback, useEffect, useRef, useState } from "react";
import {
  App,
  Button,
  Card,
  Input,
  Segmented,
  Slider,
  Space,
  Switch,
  Tag,
  Typography,
} from "antd";
import {
  PauseCircleOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import BackendLoadingPage from "../../tauri/BackendLoadingPage";
import OptimizedSplash from "./OptimizedSplash";
import PumpjackSplash from "./PumpjackSplash";
import GasSplash from "./GasSplash";
import { useTheme } from "../../contexts/ThemeContext";
import type { BackendReadyStatus } from "../../tauri/useBackendReadyPolling";

const SAMPLE_ERROR = [
  "Error: failed to start backend process",
  '  File "src/qwenpaw/app/server.py", line 128, in main',
  '    uvicorn.run(app, host="127.0.0.1", port=5174)',
  "OSError: [Errno 48] Address already in use",
].join("\n");

type DemoMode = "original" | "optimized" | "pumpjack" | "gas";

const STATUS_OPTIONS: Record<
  DemoMode,
  { label: string; value: BackendReadyStatus }[]
> = {
  original: [
    { label: "启动中", value: "checking" },
    { label: "超时", value: "timeout" },
    { label: "失败", value: "error" },
  ],
  optimized: [
    { label: "启动中", value: "checking" },
    { label: "就绪", value: "ready" },
    { label: "超时", value: "timeout" },
    { label: "失败", value: "error" },
  ],
  pumpjack: [
    { label: "启动中", value: "checking" },
    { label: "就绪", value: "ready" },
    { label: "超时", value: "timeout" },
    { label: "失败", value: "error" },
  ],
  gas: [
    { label: "采气中", value: "checking" },
    { label: "就绪", value: "ready" },
    { label: "超时", value: "timeout" },
    { label: "失败", value: "error" },
  ],
};

const STATUS_LABEL: Record<BackendReadyStatus, string> = {
  checking: "checking",
  ready: "ready",
  timeout: "timeout",
  error: "error",
};

/**
 * 启动动画（BackendLoadingPage）演示页 — 访问 /test/startup
 * 可切换「原版 / 优化版」对比查看；右下角控制台控制状态、计时、错误详情、明暗主题。
 */
export default function StartupSplashDemo() {
  const { isDark, toggleTheme } = useTheme();
  const { message } = App.useApp();
  const [mode, setMode] = useState<DemoMode>("original");
  const [status, setStatus] = useState<BackendReadyStatus>("checking");
  const [elapsed, setElapsed] = useState(0);
  const [totalSec, setTotalSec] = useState(180);
  const [playing, setPlaying] = useState(true);
  const [errorMessage, setErrorMessage] = useState(SAMPLE_ERROR);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 模拟真实轮询：每秒 elapsed +1，达到 totalSec 自动进入 timeout
  useEffect(() => {
    if (!playing || status !== "checking") return undefined;
    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next >= totalSec) {
          setStatus("timeout");
          return totalSec;
        }
        return next;
      });
    }, 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [playing, status, totalSec]);

  const handleStatusChange = (value: BackendReadyStatus) => {
    setStatus(value);
    setPlaying(value === "checking");
  };

  const handleRetry = useCallback(() => {
    setStatus("checking");
    setElapsed(0);
    setPlaying(true);
  }, []);

  // 优化版就绪态淡出完成后：模拟“跳转主界面”，随后自动回到启动中循环演示
  const handleOptimizedDone = useCallback(() => {
    message.success("模拟跳转到主界面");
    handleRetry();
  }, [handleRetry, message]);

  const handleModeChange = (value: DemoMode) => {
    setMode(value);
    setStatus("checking");
    setElapsed(0);
    setPlaying(true);
  };

  const runningLabel =
    status === "checking"
      ? elapsed === 0
        ? "启动中"
        : "连接中"
      : STATUS_LABEL[status];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000 }}>
      {mode === "original" ? (
        <BackendLoadingPage
          status={status}
          elapsed={elapsed}
          totalSec={totalSec}
          errorMessage={errorMessage}
          onRetry={handleRetry}
        />
      ) : mode === "pumpjack" ? (
        <PumpjackSplash
          status={status}
          elapsed={elapsed}
          totalSec={totalSec}
          errorMessage={errorMessage}
          onRetry={handleRetry}
          onDone={handleOptimizedDone}
        />
      ) : mode === "gas" ? (
        <GasSplash
          status={status}
          elapsed={elapsed}
          totalSec={totalSec}
          errorMessage={errorMessage}
          onRetry={handleRetry}
          onDone={handleOptimizedDone}
        />
      ) : (
        <OptimizedSplash
          status={status}
          elapsed={elapsed}
          totalSec={totalSec}
          errorMessage={errorMessage}
          onRetry={handleRetry}
          onDone={handleOptimizedDone}
        />
      )}

      {/* 演示控制台 */}
      <Card
        size="small"
        title="启动动画演示控制台"
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          width: 340,
          zIndex: 1001,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* 模式切换 */}
          <div>
            <Typography.Text
              type="secondary"
              style={{ fontSize: 12, display: "block", marginBottom: 6 }}
            >
              演示模式
            </Typography.Text>
            <Segmented
              block
              value={mode}
              options={[
                { label: "原版（现状）", value: "original" },
                { label: "优化版（提案）", value: "optimized" },
                { label: "抽油机版（提案）", value: "pumpjack" },
                { label: "储气库版（提案）", value: "gas" },
              ]}
              onChange={(v) => handleModeChange(v as DemoMode)}
            />
          </div>

          <div>
            <Typography.Text
              type="secondary"
              style={{ fontSize: 12, display: "block", marginBottom: 6 }}
            >
              状态切换
            </Typography.Text>
            <Segmented
              block
              value={status}
              options={STATUS_OPTIONS[mode]}
              onChange={(v) => handleStatusChange(v as BackendReadyStatus)}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Space>
              <Button
                size="small"
                icon={
                  playing ? <PauseCircleOutlined /> : <PlayCircleOutlined />
                }
                onClick={() => setPlaying((p) => !p)}
                disabled={status !== "checking"}
              >
                {playing ? "暂停" : "播放"}
              </Button>
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={handleRetry}
              >
                重置
              </Button>
            </Space>
            <Tag
              color={
                status === "checking"
                  ? "processing"
                  : status === "ready"
                  ? "success"
                  : "error"
              }
            >
              {runningLabel}
            </Tag>
          </div>

          <div>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              已耗时：{elapsed}s / 总超时：{totalSec}s
            </Typography.Text>
            <Slider
              min={0}
              max={totalSec}
              value={elapsed}
              onChange={(v) => {
                setPlaying(false);
                setElapsed(v);
              }}
            />
          </div>

          <div>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              总超时时间（totalSec）：{totalSec}s
            </Typography.Text>
            <Slider
              min={10}
              max={300}
              step={5}
              value={totalSec}
              onChange={setTotalSec}
            />
          </div>

          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                错误详情（error 状态展示）
              </Typography.Text>
              <Space size={6}>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  主题
                </Typography.Text>
                <Switch
                  size="small"
                  checked={isDark}
                  checkedChildren="暗"
                  unCheckedChildren="亮"
                  onChange={toggleTheme}
                />
              </Space>
            </div>
            <Input.TextArea
              rows={3}
              value={errorMessage}
              onChange={(e) => setErrorMessage(e.target.value)}
              placeholder="输入错误消息，用于 error 状态展示"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
