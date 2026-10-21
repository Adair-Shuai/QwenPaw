const React = window.QwenPaw.host.React;
const { useEffect, useState } = React;

/** Print pages use the host's OfficeCLI binary; text view keeps its renderer. */
export function OfficePrintPreview({ artifact, children }) {
  const [mode, setMode] = useState("print");
  const [images, setImages] = useState([]);
  const [pages, setPages] = useState(0);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [zoom, setZoom] = useState(100);
  useEffect(() => {
    if (mode !== "print") return;
    const controller = new AbortController();
    const objectUrls = [];
    setImages([]);
    setPages(0);
    setError("");
    window.QwenPaw.host
      .fetch(artifact.printUrl + "?pages=true", {
        headers: artifact.agentId ? { "X-Agent-Id": artifact.agentId } : {},
        signal: controller.signal,
      })
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(
            typeof data.detail === "string"
              ? data.detail
              : "打印预览暂不可用，可切换文字预览或下载 Word 查看",
          );
        }
        const { pages: count } = await response.json();
        if (controller.signal.aborted) return;
        if (!Number.isInteger(count) || count < 1 || count > 40)
          throw new Error("未获得有效的 Word 页数");
        setPages(count);
        // Render each real sheet separately. A stitched mixed-orientation
        // canvas pads portrait pages to the width of the widest landscape page.
        for (let page = 1; page <= count; page++) {
          const sheet = await window.QwenPaw.host.fetch(
            artifact.printUrl + "?page=" + page,
            {
              headers: artifact.agentId ? { "X-Agent-Id": artifact.agentId } : {},
              signal: controller.signal,
            },
          );
          if (!sheet.ok) throw new Error(`第 ${page} 页未能渲染，请重新预览`);
          const blob = await sheet.blob();
          if (controller.signal.aborted) return;
          const objectUrl = URL.createObjectURL(blob);
          objectUrls.push(objectUrl);
          setImages((current) => [...current, objectUrl]);
        }
      })
      .catch((reason) => {
        if (!controller.signal.aborted)
          setError(reason.message || "打印预览未完成");
      });
    return () => {
      controller.abort();
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [artifact.id, artifact.printUrl, artifact.agentId, mode, attempt]);
  return (
    <div className="df-print-preview">
      <div className="df-print-toolbar">
        <div>
          <button
            aria-pressed={mode === "print"}
            onClick={() => setMode("print")}
          >
            打印版式
          </button>
          <button
            aria-pressed={mode === "text"}
            onClick={() => setMode("text")}
          >
            文字预览
          </button>
        </div>
        {mode === "print" && (
          <div>
            {pages > 0 && <span>共 {pages} 页</span>}
            <select
              aria-label="预览比例"
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
            >
              <option value={100}>适合宽度</option>
              <option value={125}>125%</option>
              <option value={150}>150%</option>
              <option value={200}>200%</option>
            </select>
          </div>
        )}
      </div>
      {mode === "text" ? (
        <div className="df-text-preview">{children}</div>
      ) : error ? (
        <div className="df-preview-message" role="alert">
          <p>{error}</p>
          <button onClick={() => setAttempt((value) => value + 1)}>
            重新预览
          </button>
        </div>
      ) : images.length ? (
        <div className="df-print-scroll">
          <div className="df-print-pages" style={{ width: zoom + "%" }}>
            {images.map((image, index) => (
              <figure key={index}>
                <figcaption>第 {index + 1} 页</figcaption>
                <img src={image} alt={artifact.title + ` · 打印版式 · 第 ${index + 1} 页`} />
              </figure>
            ))}
            {images.length < pages && <p role="status">正在排版第 {images.length + 1} 页…</p>}
          </div>
        </div>
      ) : (
        <div className="df-preview-message" role="status">
          正在排版打印页面…
        </div>
      )}
    </div>
  );
}

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
