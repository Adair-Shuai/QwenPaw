import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Button,
  Checkbox,
  Descriptions,
  Modal,
  Input,
  Radio,
  Select,
  Spin,
  Tabs,
  Tag,
} from "antd";
import { CloudUpload, FileArchive, PackageCheck, Upload } from "lucide-react";
import { useAppMessage } from "@/hooks/useAppMessage";
import {
  fetchPublisherStatus,
  inspectInstalledAsset,
  publishInstalledAsset,
  uploadPublishArchive,
  type PublishAssetKind,
  type PublishInspection,
  type PublishMode,
  type PublisherStatus,
  type PublishResult,
} from "@/api/modules/publisher";
import { fetchPlugins } from "@/api/modules/plugin";
import { pawappApi } from "@/api/modules/pawapp";
import styles from "./UGSciPublisherModal.module.less";

interface PublishCandidate {
  id: string;
  name: string;
  version: string;
}

interface UGSciPublisherModalProps {
  open: boolean;
  kind: PublishAssetKind;
  onClose: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function UGSciPublisherModal({
  open,
  kind,
  onClose,
}: UGSciPublisherModalProps) {
  const { message } = useAppMessage();
  const [status, setStatus] = useState<PublisherStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<PublishCandidate[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [inspection, setInspection] = useState<PublishInspection | null>(null);
  const [mode, setMode] = useState<PublishMode>("submission");
  const [archive, setArchive] = useState<File | null>(null);
  const [token, setToken] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [receipt, setReceipt] = useState<PublishResult | null>(null);
  const [phase, setPhase] = useState("");
  const [checkedSource, setCheckedSource] = useState<
    "installed" | "upload" | null
  >(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const assetLabel = kind === "app" ? "应用" : "插件";
  const directEnabled = Boolean(status?.direct_publish_configured);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setInspection(null);
    setArchive(null);
    setToken("");
    setConfirmed(false);
    setReceipt(null);
    setCheckedSource(null);
    Promise.all([
      fetchPublisherStatus(),
      kind === "app"
        ? pawappApi.list().then((result) => result.apps)
        : fetchPlugins(),
    ])
      .then(([nextStatus, assets]) => {
        if (cancelled) return;
        setStatus(nextStatus);
        const nextCandidates = assets.map((asset) => ({
          id: asset.id,
          name: asset.name,
          version: asset.version,
        }));
        setCandidates(nextCandidates);
        setSelectedId(nextCandidates[0]?.id);
        setMode("submission");
      })
      .catch((error) =>
        message.error(
          error instanceof Error ? error.message : "加载发布器失败",
        ),
      )
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [kind, message, open]);

  const selected = useMemo(
    () => candidates.find((candidate) => candidate.id === selectedId),
    [candidates, selectedId],
  );

  const runInspect = async () => {
    if (!selectedId) return;
    setLoading(true);
    setPhase("正在检查文件、入口与隐私排除规则…");
    setCheckedSource(null);
    try {
      setInspection(
        await inspectInstalledAsset({ pluginId: selectedId, kind }),
      );
      setCheckedSource("installed");
    } catch (error) {
      message.error(error instanceof Error ? error.message : "发布检查失败");
    } finally {
      setLoading(false);
    }
  };

  const runInstalledPublish = async (nextMode: PublishMode) => {
    if (!selectedId || !confirmed || checkedSource !== "installed") return;
    setLoading(true);
    setPhase("正在打包并校验；远端接收后将返回投稿回执…");
    setReceipt(null);
    try {
      const result = await publishInstalledAsset({
        pluginId: selectedId,
        kind,
        mode: nextMode,
        token,
      });
      message.success(
        result.status === "published"
          ? `${assetLabel}已发布到 UGSci 分发链路`
          : result.status === "submitted"
          ? `${assetLabel}已提交审核`
          : `标准发布包已生成：${result.archive_path ?? "本地发布箱"}`,
      );
      setInspection(result);
      setReceipt(result);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "发布失败");
    } finally {
      setLoading(false);
    }
  };

  const runArchiveUpload = async (inspectOnly = false) => {
    if (!archive) return;
    if (!inspectOnly && (!confirmed || checkedSource !== "upload")) return;
    setLoading(true);
    if (inspectOnly) setCheckedSource(null);
    setPhase(
      inspectOnly
        ? "正在检查 ZIP 结构、入口与隐私数据…"
        : "正在上传并等待服务端校验回执…",
    );
    setReceipt(null);
    try {
      const result = await uploadPublishArchive({
        file: archive,
        kind,
        mode,
        token,
        inspectOnly,
      });
      if (inspectOnly) {
        setInspection(result);
        setCheckedSource("upload");
        return;
      }
      message.success(
        result.status === "published"
          ? "插件包已发布到 UGSci 分发链路"
          : result.status === "submitted"
          ? "插件包已进入审核队列"
          : `插件包已保存到本地审核箱：${result.archive_path ?? ""}`,
      );
      setInspection(result);
      setReceipt(result);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "上传失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={() => {
        if (!loading) {
          setToken("");
          onClose();
        }
      }}
      closable={!loading}
      maskClosable={!loading}
      footer={null}
      width={760}
      title={`发布 / 更新 UGSci ${assetLabel}`}
      destroyOnHidden
    >
      <Spin spinning={loading} tip={phase}>
        <Alert
          className={styles.intro}
          type="info"
          showIcon
          message="上传、检查、审核后上架"
          description="使用管理员分配的投稿凭证；ID 须以您的命名空间开头。更新保留原 ID 并增加版本号；已发布版本内容不可覆盖。投稿先存入 OSS 私有审核区，审核通过后市场可见。"
        />

        <div className={styles.statusGrid}>
          <div className={styles.statusCard}>
            <div className={styles.statusTitle}>
              <CloudUpload size={16} /> 管理员直接发布
            </div>
            <Tag color={directEnabled ? "success" : "default"}>
              {directEnabled ? "已配置" : "未配置发布服务"}
            </Tag>
          </div>
          <div className={styles.statusCard}>
            <div className={styles.statusTitle}>
              <Upload size={16} /> 用户投稿审核
            </div>
            <Tag color={status?.submission_configured ? "success" : "blue"}>
              {status?.submission_configured ? "远端审核队列" : "本地审核箱"}
            </Tag>
          </div>
        </div>

        <div className={styles.formRow}>
          <span className={styles.label}>投稿 / 发布凭证（仅本次使用）</span>
          <Input.Password
            aria-label="投稿凭证"
            autoComplete="off"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="填写管理员分配的凭证，无需 OSS AccessKey"
          />
        </div>
        <Checkbox
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
        >
          我确认发布包可公开分享，已检查不含私人资料、账号密钥和用户数据
        </Checkbox>
        {!status?.submission_configured && (
          <Alert
            style={{ marginTop: 12 }}
            type="warning"
            message="尚未配置投稿服务；生成标准包仅保存到本机，不会上传 OSS 或进入远端审核。"
          />
        )}

        <Tabs
          items={[
            {
              key: "installed",
              label: `发布本机${assetLabel}`,
              children: (
                <>
                  <div className={styles.formRow}>
                    <span className={styles.label}>选择已安装{assetLabel}</span>
                    <Select
                      value={selectedId}
                      onChange={(value) => {
                        setSelectedId(value);
                        setInspection(null);
                        setCheckedSource(null);
                        setReceipt(null);
                        setConfirmed(false);
                      }}
                      style={{ width: "100%" }}
                      options={candidates.map((candidate) => ({
                        value: candidate.id,
                        label: `${candidate.name} · v${candidate.version}`,
                      }))}
                      placeholder={`暂无可发布${assetLabel}`}
                    />
                  </div>
                  <div className={styles.actions}>
                    <Button
                      icon={<PackageCheck size={15} />}
                      disabled={!selected}
                      onClick={runInspect}
                    >
                      检查发布包
                    </Button>
                    <Button
                      icon={<FileArchive size={15} />}
                      disabled={
                        !selected ||
                        !confirmed ||
                        checkedSource !== "installed" ||
                        Boolean(inspection?.blockers.length)
                      }
                      onClick={() => runInstalledPublish("submission")}
                    >
                      {status?.submission_configured
                        ? "提交审核"
                        : "生成标准发布包"}
                    </Button>
                    <Button
                      type="primary"
                      icon={<CloudUpload size={15} />}
                      disabled={
                        !directEnabled ||
                        !selected ||
                        !confirmed ||
                        checkedSource !== "installed" ||
                        Boolean(inspection?.blockers.length)
                      }
                      onClick={() => runInstalledPublish("release")}
                    >
                      直接发布到 UGSci OSS
                    </Button>
                  </div>
                </>
              ),
            },
            {
              key: "upload",
              label: "上传 ZIP 包",
              children: (
                <>
                  <div className={styles.formRow}>
                    <span className={styles.label}>上传方式</span>
                    <Radio.Group
                      value={mode}
                      onChange={(event) => setMode(event.target.value)}
                      options={[
                        { label: "投稿待审核", value: "submission" },
                        {
                          label: "管理员直接发布",
                          value: "release",
                          disabled: !directEnabled,
                        },
                      ]}
                    />
                  </div>
                  <div className={styles.uploadBox}>
                    <input
                      ref={fileRef}
                      hidden
                      type="file"
                      accept=".zip,application/zip"
                      onChange={(event) => {
                        setArchive(event.target.files?.[0] ?? null);
                        setInspection(null);
                        setCheckedSource(null);
                        setConfirmed(false);
                        setReceipt(null);
                      }}
                    />
                    <Button
                      icon={<FileArchive size={15} />}
                      onClick={() => fileRef.current?.click()}
                    >
                      选择标准插件 ZIP
                    </Button>
                    <div className={styles.fileName}>
                      {archive
                        ? `${archive.name} · ${formatBytes(archive.size)}`
                        : `ZIP 内必须且只能包含一个 plugin.json，最大 ${
                            status?.max_archive_mb ?? 256
                          } MB`}
                    </div>
                  </div>
                  <div className={styles.actions}>
                    <Button
                      disabled={!archive}
                      onClick={() => runArchiveUpload(true)}
                    >
                      检查 ZIP 包
                    </Button>
                    <Button
                      type="primary"
                      icon={<Upload size={15} />}
                      disabled={
                        !archive || !confirmed || checkedSource !== "upload"
                      }
                      onClick={() => runArchiveUpload()}
                    >
                      {mode === "release"
                        ? "发布新版本"
                        : status?.submission_configured
                        ? "上传到 OSS 待审核"
                        : "保存到本地发布箱"}
                    </Button>
                  </div>
                </>
              ),
            },
          ]}
        />

        {receipt && (
          <Alert
            style={{ marginTop: 16 }}
            showIcon
            type={receipt.status === "prepared" ? "warning" : "success"}
            message={
              receipt.status === "published"
                ? "已发布，OSS 内容与目录已校验"
                : receipt.status === "submitted"
                ? "已上传 OSS，等待管理员审核"
                : "仅已生成本地包，尚未上传 OSS"
            }
            description={
              <div>
                <div>回执：{receipt.remote?.receipt_id || "无远端回执"}</div>
                <div>
                  版本：{receipt.version} · SHA-256：{receipt.sha256}
                </div>
                {receipt.remote?.object_key && (
                  <div>对象：{receipt.remote.object_key}</div>
                )}
              </div>
            }
          />
        )}

        {inspection && (
          <div className={styles.inspection}>
            <div className={styles.inspectionHeader}>
              <strong>{inspection.name}</strong>
              <Tag color={inspection.blockers.length ? "error" : "success"}>
                {inspection.blockers.length ? "存在阻断项" : "检查通过"}
              </Tag>
            </div>
            <Descriptions size="small" column={2}>
              <Descriptions.Item label="ID">
                {inspection.plugin_id}
              </Descriptions.Item>
              <Descriptions.Item label="版本">
                {inspection.version}
              </Descriptions.Item>
              <Descriptions.Item label="目录类型">
                {inspection.catalog_kind}
              </Descriptions.Item>
              <Descriptions.Item label="文件">
                {inspection.file_count} 个 ·{" "}
                {formatBytes(inspection.source_size_bytes)}
              </Descriptions.Item>
            </Descriptions>
            {inspection.warnings.length > 0 && (
              <Alert
                type="warning"
                showIcon
                message={inspection.warnings.join("；")}
                style={{ marginTop: 10 }}
              />
            )}
            {inspection.blockers.length > 0 && (
              <Alert
                type="error"
                showIcon
                message={inspection.blockers.join("；")}
                style={{ marginTop: 10 }}
              />
            )}
          </div>
        )}
      </Spin>
    </Modal>
  );
}
