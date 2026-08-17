import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Button,
  Descriptions,
  Modal,
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
  const fileRef = useRef<HTMLInputElement>(null);

  const assetLabel = kind === "app" ? "应用" : "插件";
  const directEnabled = Boolean(status?.direct_publish_configured);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setInspection(null);
    setArchive(null);
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
        setMode(
          nextStatus.direct_publish_configured ? "release" : "submission",
        );
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
    try {
      setInspection(
        await inspectInstalledAsset({ pluginId: selectedId, kind }),
      );
    } catch (error) {
      message.error(error instanceof Error ? error.message : "发布检查失败");
    } finally {
      setLoading(false);
    }
  };

  const runInstalledPublish = async (nextMode: PublishMode) => {
    if (!selectedId) return;
    setLoading(true);
    try {
      const result = await publishInstalledAsset({
        pluginId: selectedId,
        kind,
        mode: nextMode,
      });
      message.success(
        result.status === "published"
          ? `${assetLabel}已发布到 UGSci 分发链路`
          : result.status === "submitted"
          ? `${assetLabel}已提交审核`
          : `标准发布包已生成：${result.archive_path ?? "本地发布箱"}`,
      );
      setInspection(result);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "发布失败");
    } finally {
      setLoading(false);
    }
  };

  const runArchiveUpload = async () => {
    if (!archive) return;
    setLoading(true);
    try {
      const result = await uploadPublishArchive({ file: archive, kind, mode });
      message.success(
        result.status === "published"
          ? "插件包已发布到 UGSci 分发链路"
          : result.status === "submitted"
          ? "插件包已进入审核队列"
          : `插件包已保存到本地审核箱：${result.archive_path ?? ""}`,
      );
      setInspection(result);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "上传失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={760}
      title={`发布 UGSci ${assetLabel}`}
      destroyOnHidden
    >
      <Spin spinning={loading}>
        <Alert
          className={styles.intro}
          type="info"
          showIcon
          message="发布链路与上游官方目录隔离"
          description="正式发布使用受控发布服务写入 UGSci OSS；用户上传只进入审核区。桌面端不保存 OSS 长期密钥。"
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
                        !selected || Boolean(inspection?.blockers.length)
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
                      type="primary"
                      icon={<Upload size={15} />}
                      disabled={!archive}
                      onClick={runArchiveUpload}
                    >
                      {mode === "release" ? "验证并发布" : "验证并提交审核"}
                    </Button>
                  </div>
                </>
              ),
            },
          ]}
        />

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
