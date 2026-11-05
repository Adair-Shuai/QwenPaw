const Q = window.QwenPaw;
const React = Q.host.React;
const { useEffect, useRef, useState } = React;
const APPROVAL =
  /审批|批复|回执|签章|签字|审查意见|论证意见|验收意见|验收凭据|付款凭证/;

export function splitMaterials(materials) {
  const approvals = [],
    attachments = [];
  for (const material of materials) {
    const whole = APPROVAL.test(material.name);
    const approvalFiles = material.files.filter(
      (file) => whole || file.approval_review || APPROVAL.test(file.name),
    );
    const otherFiles = material.files.filter(
      (file) => !approvalFiles.includes(file),
    );
    if (whole || approvalFiles.length)
      approvals.push({ ...material, files: approvalFiles });
    if (!whole || otherFiles.length)
      attachments.push({ ...material, files: otherFiles });
  }
  return { approvals, attachments };
}

function InlineDocument({ file, projectId, agentId, active, availableIds }) {
  const cache = useRef(new Map());
  const [source, setSource] = useState(null),
    [error, setError] = useState(""),
    [attempt, setAttempt] = useState(0),
    [pdf, setPdf] = useState(null);
  const extension = file?.name.split(".").pop().toLowerCase();
  const supported = ["pdf", "png", "jpg", "jpeg", "webp", "gif"].includes(
    extension,
  );
  const identity = file ? file.id + ":" + (file.sha256 || "") : "";
  useEffect(
    () => () => {
      for (const item of cache.current.values()) URL.revokeObjectURL(item.url);
      cache.current.clear();
    },
    [],
  );
  useEffect(() => {
    const current = new Set(availableIds.split(","));
    for (const [key, item] of cache.current) {
      if (current.has(key.split(":")[0])) continue;
      cache.current.delete(key);
      URL.revokeObjectURL(item.url);
    }
  }, [availableIds]);
  useEffect(() => {
    if (!active || !file || !supported) return;
    setError("");
    const saved = cache.current.get(identity);
    if (saved) {
      setSource({ identity, url: saved.url });
      return;
    }
    setSource(null);
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setError("读取较慢，请重试或下载原文件查看。");
      controller.abort();
    }, 20000);
    Q.host
      .fetch(`/document-forms/projects/${projectId}/files/${file.id}`, {
        signal: controller.signal,
        headers: agentId ? { "X-Agent-Id": agentId } : {},
      })
      .then(async (response) => {
        if (!response.ok) throw new Error("文件未能打开，请重试或下载原文件。");
        const blob = await response.blob();
        if (controller.signal.aborted) return;
        const url = URL.createObjectURL(
          new Blob([blob], {
            type:
              extension === "pdf"
                ? "application/pdf"
                : "image/" + (extension === "jpg" ? "jpeg" : extension),
          }),
        );
        cache.current.set(identity, { url, size: blob.size });
        let size = [...cache.current.values()].reduce(
          (total, item) => total + item.size,
          0,
        );
        for (const [key, item] of cache.current) {
          if (cache.current.size <= 3 && size <= 32 * 1024 * 1024) break;
          if (key === identity) continue;
          cache.current.delete(key);
          URL.revokeObjectURL(item.url);
          size -= item.size;
        }
        setSource({ identity, url });
      })
      .catch((reason) => {
        if (!controller.signal.aborted) setError(reason.message);
      })
      .finally(() => window.clearTimeout(timer));
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [identity, active, supported, projectId, agentId, attempt]);
  useEffect(() => {
    if (!active || extension !== "pdf" || source?.identity !== identity || pdf)
      return;
    let live = true;
    const direct = !!Q.workspace?.loadPdfPreview;
    const load = Q.workspace?.loadPdfPreview || Q.workspace?.loadPreview;
    if (!load) return;
    load()
      .then((component) => {
        if (live) setPdf({ component, direct });
      })
      .catch(() => {
        if (live) setError("PDF 阅读器未能打开，请重试或下载原文件。");
      });
    return () => {
      live = false;
    };
  }, [active, extension, source, identity, pdf, attempt]);
  if (!file) return <div className="df-approval-empty">尚未上传审批文件</div>;
  if (!supported)
    return (
      <div className="df-approval-empty">
        此文件可通过“预览”打开；PDF 或图片可在这里直接浏览。
      </div>
    );
  if (error)
    return (
      <div className="df-approval-empty" role="alert">
        <p>{error}</p>
        <button onClick={() => setAttempt((value) => value + 1)}>
          重新加载审批文件
        </button>
      </div>
    );
  if (!source || source.identity !== identity)
    return (
      <div className="df-approval-empty" role="status">
        正在读取审批文件…
      </div>
    );
  if (extension === "pdf" && pdf) {
    const Preview = pdf.component;
    return (
      <div className="df-approval-pdf" role="region" aria-label={file.name}>
        {pdf.direct ? (
          <Preview url={source.url} fileSize={file.size} theme="light" />
        ) : (
          <Preview
            artifact={{
              id: file.id,
              title: file.name,
              source: "uploaded",
              extension: "pdf",
              mimeType: "application/pdf",
              binaryUrl: source.url,
              agentId,
              size: file.size,
            }}
            readOnly
            hostControls
          />
        )}
      </div>
    );
  }
  if (
    extension === "pdf" &&
    (Q.workspace?.loadPdfPreview || Q.workspace?.loadPreview)
  )
    return (
      <div className="df-approval-empty" role="status">
        正在打开 PDF 阅读器…
      </div>
    );
  return extension === "pdf" ? (
    <iframe
      className="df-approval-pdf"
      title={file.name}
      src={source.url + "#view=FitH"}
    />
  ) : (
    <div className="df-approval-image-scroll">
      <img src={source.url} alt={file.name} decoding="async" />
    </div>
  );
}

export default function ApprovalDocuments({
  projectId,
  materials,
  active,
  onUpload,
  onEdit,
  onAdd,
  onPreview,
  onDownload,
  onDelete,
  busy,
  review,
}) {
  const [materialId, setMaterialId] = useState(""),
    [fileId, setFileId] = useState("");
  const material =
    materials.find((item) => item.id === materialId) ||
    materials.find((item) => item.files.length) ||
    materials[0];
  const files = material?.files || [];
  const file = files.find((item) => item.id === fileId) || files.at(-1);
  const latest = files.at(-1)?.id;
  useEffect(() => setFileId(""), [latest]);
  const agentId = Q.host.getSelectedAgentId?.();
  return (
    <section className="df-paper df-approval-documents" id="df-node-materials">
      <div className="df-section-head">
        <h2>审批资料</h2>
        <div className="df-actions">
          {material && (
            <button
              aria-label={"上传" + material.name}
              title={"上传" + material.name}
              onClick={() => onUpload(material)}
            >
              上传审批文件
            </button>
          )}
          {material && (
            <button
              aria-label={"编辑" + material.name}
              onClick={() => onEdit(material)}
            >
              办理信息
            </button>
          )}
          <button onClick={onAdd}>＋ 添加材料</button>
        </div>
      </div>
      {materials.length > 0 && (
        <div className="df-approval-file-tools">
          <select
            aria-label="审批材料类型"
            value={material.id}
            onChange={(event) => {
              setMaterialId(event.target.value);
              setFileId("");
            }}
          >
            {materials.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          {file && (
            <select
              aria-label="审批文件版本"
              value={file.id}
              onChange={(event) => setFileId(event.target.value)}
            >
              {[...files].reverse().map((item, index) => (
                <option key={item.id} value={item.id}>
                  V{item.version || files.length - index} · {item.name}
                </option>
              ))}
            </select>
          )}
          {file && (
            <span className="df-muted df-approval-versions">
              {files.length} 份文件 / 版本 · 最新：{files.at(-1).name}
            </span>
          )}
          {file && (
            <div className="df-actions">
              {!["pdf", "png", "jpg", "jpeg", "webp", "gif"].includes(
                file.name.split(".").pop().toLowerCase(),
              ) && <button onClick={() => onPreview(file)}>预览</button>}
              <button
                aria-label={
                  "下载" +
                  file.name +
                  "版本" +
                  (file.version || files.indexOf(file) + 1)
                }
                onClick={() => onDownload(file)}
              >
                下载原文件
              </button>
              {onDelete && (
                <button
                  className="df-delete-file"
                  disabled={busy}
                  aria-label={
                    "删除" +
                    file.name +
                    "版本" +
                    (file.version || files.indexOf(file) + 1)
                  }
                  onClick={() => onDelete(material, file)}
                >
                  删除
                </button>
              )}
            </div>
          )}
        </div>
      )}
      {review}
      <InlineDocument
        key={projectId + ":" + agentId}
        projectId={projectId}
        file={file}
        agentId={agentId}
        active={active}
        availableIds={materials
          .flatMap((item) => item.files.map((file) => file.id))
          .join(",")}
      />
    </section>
  );
}
