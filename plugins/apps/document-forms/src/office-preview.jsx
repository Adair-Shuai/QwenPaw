const React = window.QwenPaw.host.React;
const { useEffect, useState } = React;

/** Existing hosts expose the Office conversion API before the embedded SDK. */
export default function OfficeServicePreview({ artifact }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setResult(null);
    setError("");
    window.QwenPaw.host
      .fetch("/workspace/convert-office", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(artifact.agentId ? { "X-Agent-Id": artifact.agentId } : {}),
        },
        signal: controller.signal,
        body: JSON.stringify({
          url: artifact.binaryUrl,
          mime_type: artifact.mimeType,
        }),
      })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw new Error(
            typeof data.detail === "string" ? data.detail : "文件预览未完成",
          );
        if (!controller.signal.aborted) setResult(data);
      })
      .catch((reason) => {
        if (!controller.signal.aborted)
          setError(reason.message || "文件预览未完成");
      });
    return () => controller.abort();
  }, [
    artifact.id,
    artifact.binaryUrl,
    artifact.mimeType,
    artifact.agentId,
    attempt,
  ]);
  if (error)
    return (
      <div className="df-preview-message" role="alert">
        <p>{error}</p>
        <button onClick={() => setAttempt((value) => value + 1)}>
          重新预览
        </button>
        <p>也可以从文件清单下载后查看。</p>
      </div>
    );
  if (!result)
    return (
      <div className="df-preview-message" role="status">
        正在打开文件…
      </div>
    );
  const html =
    result.engine === "officecli"
      ? result.html
      : `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;color:#333;background:#fff;padding:24px 32px;line-height:1.7;max-width:900px;margin:0 auto}table{border-collapse:collapse;width:100%;margin:12px 0}td,th{border:1px solid #ddd;padding:8px 12px}img{max-width:100%;height:auto}h1{font-size:1.6em}h2{font-size:1.3em}.docx-page-break{border-top:2px dashed #ccc;margin:32px 0}</style></head><body>${
          result.html || ""
        }</body></html>`;
  return (
    <iframe
      className="df-office-frame"
      title={artifact.title}
      srcDoc={html}
      sandbox={
        result.engine === "officecli" ? "allow-scripts" : "allow-same-origin"
      }
    />
  );
}
