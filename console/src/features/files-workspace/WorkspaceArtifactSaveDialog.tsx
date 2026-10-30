import { Alert, Input, Modal } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { sanitizeWorkspaceSavePath } from "./workspaceSavePath";

/** Save-as UI only; the workspace owns the request scope and file lifecycle. */
export default function WorkspaceArtifactSaveDialog({
  suggestedPath,
  onSave,
  onCancel,
}: {
  suggestedPath: string;
  onSave: (path: string) => Promise<void>;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [path, setPath] = useState(suggestedPath);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const save = async () => {
    if (saving) return;
    const normalized = sanitizeWorkspaceSavePath(path);
    if (!normalized) {
      setError(t("files.invalidSavePath", "请输入工作区内的相对文件路径"));
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(normalized);
    } catch {
      setError(t("files.saveFailed", "保存失败，请确认文件夹存在后重试"));
    } finally {
      setSaving(false);
    }
  };
  return (
    <Modal
      open
      title={t("files.saveToWorkspace", "保存到工作区")}
      okText={t("common.save")}
      cancelText={t("common.cancel")}
      confirmLoading={saving}
      cancelButtonProps={{ disabled: saving }}
      closable={!saving}
      maskClosable={!saving}
      keyboard={!saving}
      onOk={() => void save()}
      onCancel={onCancel}
    >
      <p>
        {t(
          "files.saveArtifactDescription",
          "保存到当前文件所属目录；没有关联目录时使用会话的主目录。可填写已有文件夹中的相对路径。同名文件会自动另取名称。",
        )}
      </p>
      <Input
        autoFocus
        aria-label={t("files.savePath", "保存路径")}
        value={path}
        disabled={saving}
        onChange={(event) => setPath(event.target.value)}
        onPressEnter={() => void save()}
      />
      {error && <Alert type="error" role="alert" message={error} />}
    </Modal>
  );
}
