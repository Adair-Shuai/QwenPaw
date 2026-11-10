import React, { createContext, useContext, useEffect, useState } from "react";
import { useWorkflowI18n } from "./i18n";

export const RunValueScope = createContext<{
  agentId?: string;
  runId?: string;
}>({});
type JsonObject = Record<string, unknown>;
type FileReference = { path: string; url?: string; mimeType?: string };
const object = (value: unknown): value is JsonObject =>
  !!value && typeof value === "object" && !Array.isArray(value);
const pretty = (value: unknown) => JSON.stringify(value, null, 2);

function localPath(value: string): string | undefined {
  let path = value.trim();
  if (/^file:/i.test(path)) {
    try {
      const url = new URL(path);
      if (url.hostname && url.hostname !== "localhost") return;
      path = decodeURIComponent(url.pathname).replace(/^\/([a-z]:\/)/i, "$1");
    } catch {
      return;
    }
  }
  path = path.replace(/\\/g, "/").replace(/^(?:\.\/)+/, "");
  if (
    !path ||
    /[\u0000-\u001f\u007f]/.test(path) ||
    path.startsWith("//") ||
    /\[(?:redacted|.*已隐藏)\]/i.test(path) ||
    (/^[a-z][a-z\d+.-]*:/i.test(path) && !/^[a-z]:\//i.test(path)) ||
    path.split("/").some((part) => part === ".." || part === ".")
  )
    return;
  return path;
}

function sameOriginUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || !value || value.startsWith("//")) return;
  try {
    const url = new URL(value, window.location.origin);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.origin !== window.location.origin ||
      url.username ||
      url.password ||
      /\[(?:redacted|.*已隐藏)\]/i.test(value)
    )
      return;
    for (const key of Array.from(url.searchParams.keys()))
      if (/token|secret|password|credential|api.?key/i.test(key))
        url.searchParams.delete(key);
    return url.href;
  } catch {
    return;
  }
}

function trustedPreviewUrl(host: any, path: string): string | undefined {
  const base = host?.getApiUrl?.("/");
  const preview = host?.getApiUrl?.(path);
  if (typeof base !== "string" || typeof preview !== "string") return;
  try {
    const api = new URL(base, window.location.origin);
    const url = new URL(preview, window.location.origin);
    if (
      ![api, url].every(
        (item) =>
          ["http:", "https:"].includes(item.protocol) &&
          !item.username &&
          !item.password,
      )
    )
      return;
    if (
      url.origin !== api.origin ||
      url.pathname !== `${api.pathname.replace(/\/$/, "")}${path}`
    )
      return;
    return url.href;
  } catch {
    return;
  }
}

function fileReferences(value: unknown): {
  files: FileReference[];
  truncated: boolean;
} {
  let scanned = 0;
  let truncated = false;
  const files = new Map<string, FileReference>();
  const add = (raw: string, url?: unknown, mimeType?: unknown) => {
    const directUrl = sameOriginUrl(raw);
    const previewPath =
      directUrl &&
      new URL(directUrl).pathname.match(/\/files\/preview\/(.+)$/)?.[1];
    let path: string | undefined;
    if (previewPath) {
      try {
        path = localPath(decodeURIComponent(previewPath));
      } catch {
        return;
      }
    } else if (/^(?:https?:)?\/\//i.test(raw) || raw.startsWith("/api/"))
      return;
    else path = localPath(raw);
    if (path)
      files.set(path, {
        path,
        url:
          sameOriginUrl(url) ||
          files.get(path)?.url ||
          (previewPath ? directUrl : undefined),
        mimeType:
          typeof mimeType === "string" ? mimeType : files.get(path)?.mimeType,
      });
  };
  const visit = (item: unknown, depth: number) => {
    if (depth > 8 || files.size >= 50 || scanned >= 1000) {
      truncated = true;
      return;
    }
    scanned += 1;
    if (typeof item === "string") {
      if (
        /^(?:file:|[a-z]:[\\/]|\/)/i.test(item) ||
        /(?:^|[\\/])[^\r\n]+\.[a-z\d]{1,10}$/i.test(item)
      )
        add(item);
    } else if (Array.isArray(item)) {
      for (const entry of item) {
        if (scanned >= 1000 || files.size >= 50) {
          truncated = true;
          break;
        }
        visit(entry, depth + 1);
      }
    } else if (object(item)) {
      const path = item.workspace_path ?? item.file_path ?? item.path;
      if (typeof path === "string")
        add(
          path,
          item.download_url ?? item.preview_url ?? item.url,
          item.mime_type ?? item.mimeType,
        );
      for (const key in item) {
        if (!Object.prototype.hasOwnProperty.call(item, key)) continue;
        if (scanned >= 1000 || files.size >= 50) {
          truncated = true;
          break;
        }
        visit(item[key], depth + 1);
      }
    }
  };
  visit(value, 0);
  return { files: Array.from(files.values()), truncated };
}

function JsonTree({
  value,
  label = "$",
  initialOpen = true,
}: {
  value: unknown;
  label?: string;
  initialOpen?: boolean;
}) {
  const { t } = useWorkflowI18n();
  const [expanded, setExpanded] = useState(initialOpen);
  const [limit, setLimit] = useState(100);
  if (!object(value) && !Array.isArray(value))
    return (
      <div className="ff-json-leaf">
        <code>{label}</code> <span>{pretty(value) ?? "undefined"}</span>
      </div>
    );
  const entries = Object.entries(value);
  return (
    <details
      open={expanded}
      className="ff-json-tree"
      onToggle={(event) => setExpanded(event.currentTarget.open)}
    >
      <summary>
        <code>{label}</code>{" "}
        {Array.isArray(value) ? `[${entries.length}]` : `{${entries.length}}`}
      </summary>
      {expanded &&
        entries
          .slice(0, limit)
          .map(([key, item]) => (
            <JsonTree key={key} label={key} value={item} initialOpen={false} />
          ))}
      {expanded && entries.length > limit && (
        <button type="button" onClick={() => setLimit((value) => value + 100)}>
          {t("显示更多（剩余 {count} 项）", "Show more ({count} remaining)", {
            count: entries.length - limit,
          })}
        </button>
      )}
    </details>
  );
}

function FileViewer({
  file,
  redact,
}: {
  file: FileReference;
  redact: (value: unknown) => unknown;
}) {
  const { t } = useWorkflowI18n();
  const scope = useContext(RunValueScope);
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState<{
    Preview: React.ComponentType<any>;
    artifact: JsonObject;
  }>();
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setError("");
    setLoaded(undefined);
    void (async () => {
      try {
        if (!scope.agentId)
          throw new Error("此旧记录缺少所属专家，无法确认文件上下文。");
        const sdk = (window as any).QwenPaw;
        if (!sdk?.workspace?.loadPreview)
          throw new Error("宿主文件预览暂不可用。");
        const encoded = file.path
          .replace(/^\//, "")
          .split("/")
          .map(encodeURIComponent)
          .join("/");
        const generated = trustedPreviewUrl(
          sdk.host,
          `/files/preview/${file.path.startsWith("/") ? "%2F" : ""}${encoded}`,
        );
        if (!generated) throw new Error("文件预览地址无效。");
        // Record URLs retain their page-origin check. Authentication belongs
        // to the API origin supplied by the public host SDK.
        const url =
          file.url && new URL(file.url).origin === new URL(generated).origin
            ? file.url
            : generated;
        const Preview = await sdk.workspace.loadPreview();
        if (!active) return;
        const title = file.path.split("/").pop() || file.path;
        const extension = title.split(".").pop()?.toLowerCase() || "";
        const artifact: JsonObject = {
          id: `workflow:${scope.runId || "record"}:${file.path}`,
          title,
          source: "tool_call",
          extension,
          mimeType:
            file.mimeType ||
            (
              {
                json: "application/json",
                csv: "text/csv",
                md: "text/markdown",
                pdf: "application/pdf",
                html: "text/html",
                png: "image/png",
                jpg: "image/jpeg",
                jpeg: "image/jpeg",
                svg: "image/svg+xml",
                txt: "text/plain",
              } as Record<string, string>
            )[extension] ||
            "application/octet-stream",
          workspacePath: file.path,
          agentId: scope.agentId,
          binaryUrl: url,
        };
        if (
          /^(?:txt|log|json|csv|md|html|xml|yaml|yml|py|js|ts|css|sql)$/i.test(
            extension,
          ) ||
          String(artifact.mimeType).startsWith("text/")
        ) {
          const token = sdk.host?.getApiToken?.();
          const response = await fetch(url, {
            signal: controller.signal,
            headers: {
              "X-Agent-Id": scope.agentId,
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const content = await response.text();
          let value: unknown = content;
          if (extension === "json") {
            try {
              value = JSON.parse(content);
            } catch {
              /* Preserve malformed JSON for inspection. */
            }
          }
          const safe = redact(value);
          artifact.mimeType =
            (
              {
                json: "application/json",
                csv: "text/csv",
                md: "text/markdown",
                html: "text/html",
                xml: "text/xml",
              } as Record<string, string>
            )[extension] || "text/plain";
          artifact.textContent = typeof safe === "string" ? safe : pretty(safe);
          if (extension === "json" && typeof safe !== "string")
            artifact.jsonContent = safe;
        }
        if (active) setLoaded({ Preview, artifact });
      } catch (failure: any) {
        if (active && !controller.signal.aborted)
          setError(String(redact(failure.message)));
      }
    })();
    return () => {
      active = false;
      controller.abort();
    };
  }, [file.path, file.url, scope.agentId, scope.runId, attempt]);
  const errorEnglish: Record<string, string> = {
    "此旧记录缺少所属专家，无法确认文件上下文。":
      "This older record has no agent identity for file access.",
    "宿主文件预览暂不可用。": "The host file preview is unavailable.",
    "文件预览地址无效。": "The file preview URL is invalid.",
  };
  if (error)
    return (
      <div role="alert">
        <p>{t(error, errorEnglish[error])}</p>
        <button type="button" onClick={() => setAttempt((value) => value + 1)}>
          {t("重试文件预览", "Retry file preview")}
        </button>
      </div>
    );
  if (!loaded)
    return <p role="status">{t("正在加载文件预览", "Loading file preview")}</p>;
  return (
    <div className="ff-run-file-preview">
      <loaded.Preview
        artifact={loaded.artifact}
        readOnly
        listenForUpdates={false}
      />
    </div>
  );
}

export function RunValueViews({
  value,
  redact,
  outputSlots = false,
}: {
  value: unknown;
  redact: (value: unknown) => unknown;
  outputSlots?: boolean;
}) {
  const { t } = useWorkflowI18n();
  const scope = useContext(RunValueScope);
  const [view, setView] = useState("raw");
  const [file, setFile] = useState<{ path: string; slot: string }>();
  const [page, setPage] = useState(0);
  const [slot, setSlot] = useState("all");
  const slots = outputSlots && Array.isArray(value) ? value : undefined;
  const activeSlot =
    slot !== "all" && slots && Number(slot) < slots.length ? slot : "all";
  const selected = activeSlot === "all" ? value : slots![Number(activeSlot)];
  const raw = pretty(selected);
  const rows =
    Array.isArray(selected) && selected.every(object)
      ? selected
      : Array.isArray(selected) &&
        selected.length === 1 &&
        Array.isArray(selected[0]) &&
        selected[0].every(object)
      ? selected[0]
      : undefined;
  const start = rows
    ? Math.min(
        page * 100,
        Math.max(0, Math.floor((rows.length - 1) / 100) * 100),
      )
    : 0;
  const visibleRows = rows?.slice(start, start + 100) || [];
  const allColumns = Array.from(
    new Set(visibleRows.flatMap((row) => Object.keys(row))),
  );
  const columns = allColumns.slice(0, 50);
  const { files, truncated } = fileReferences(selected);
  const selectedFile =
    file?.slot === activeSlot
      ? files.find((reference) => reference.path === file.path)
      : undefined;
  const formats = [
    ["raw", t("原始 JSON", "Raw JSON")],
    ["text", t("文本", "Text")],
    ["tree", t("JSON 树", "JSON tree")],
    ...(rows ? [["table", t("表格", "Table")]] : []),
    ...(files.length || truncated ? [["files", t("文件", "Files")]] : []),
  ];
  const activeView = formats.some(([key]) => key === view) ? view : "raw";
  return (
    <div className="ff-run-value">
      {slots && (
        <label className="ff-output-slot">
          {t("输出槽", "Output slot")}
          <select
            aria-label={t("选择输出槽", "Select output slot")}
            value={activeSlot}
            onChange={(event) => {
              setSlot(event.target.value);
              setFile(undefined);
              setPage(0);
              setView("raw");
            }}
          >
            <option value="all">{t("全部输出", "All outputs")}</option>
            {slots.map((_, index) => (
              <option key={index} value={String(index)}>
                {t("输出槽 {index}", "Output slot {index}", { index })}
              </option>
            ))}
          </select>
        </label>
      )}
      <details className="ff-value-options">
        <summary>{t("查看方式", "View options")}</summary>
        <div
          role="group"
          aria-label={t("结果查看方式", "Result view")}
          className="ff-value-tabs"
        >
          {formats.map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={activeView === key}
              onClick={() => setView(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </details>
      {activeView === "raw" && (
        <pre className="ff-code ff-inspector-value">{raw}</pre>
      )}
      {activeView === "text" && (
        <pre className="ff-code ff-inspector-value">
          {typeof selected === "string" ? selected : raw}
        </pre>
      )}
      {activeView === "tree" && (
        <div className="ff-inspector-value">
          <JsonTree value={selected} />
        </div>
      )}
      {activeView === "table" && rows && (
        <div className="ff-value-table">
          {allColumns.length > columns.length && (
            <p>
              {t(
                "表格显示本页前 50 列，原始 JSON 保留全部字段。",
                "The table shows the first 50 columns on this page. Raw JSON retains every field.",
              )}
            </p>
          )}
          <div className="ff-value-tabs">
            <button
              type="button"
              disabled={start === 0}
              onClick={() => setPage(Math.max(0, Math.floor(start / 100) - 1))}
            >
              {t("上一页", "Previous page")}
            </button>
            <span>
              {t(
                "显示 {start}–{end} / {total} 行",
                "Showing rows {start}–{end} / {total}",
                {
                  start: rows.length ? start + 1 : 0,
                  end: Math.min(start + 100, rows.length),
                  total: rows.length,
                },
              )}
            </span>
            <button
              type="button"
              disabled={start + 100 >= rows.length}
              onClick={() => setPage(Math.floor(start / 100) + 1)}
            >
              {t("下一页", "Next page")}
            </button>
          </div>
          <table>
            <thead>
              <tr>
                {columns.map((key) => (
                  <th key={key} scope="col">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row, index) => (
                <tr key={index}>
                  {columns.map((key) => (
                    <td key={key}>
                      {Object.prototype.hasOwnProperty.call(row, key)
                        ? typeof row[key] === "string"
                          ? row[key]
                          : pretty(row[key])
                        : "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {activeView === "files" && (
        <div>
          {truncated && (
            <p>
              {t(
                "文件列表扫描上限为 1000 项、8 层及 50 个文件。原始 JSON 保留完整记录。",
                "File discovery scans up to 1000 items, 8 levels, and 50 files. Raw JSON retains the complete record.",
              )}
            </p>
          )}
          {!scope.agentId && (
            <p role="status">
              {t(
                "此旧记录缺少所属专家，无法确认文件上下文。",
                "This older record has no agent identity for file access.",
              )}
            </p>
          )}
          <ul>
            {files.map((reference) => (
              <li key={reference.path}>
                <button
                  type="button"
                  disabled={!scope.agentId}
                  onClick={() =>
                    setFile({ path: reference.path, slot: activeSlot })
                  }
                >
                  {t("预览 {path}", "Preview {path}", { path: reference.path })}
                </button>
              </li>
            ))}
          </ul>
          {selectedFile && (
            <FileViewer
              key={`${scope.runId}:${scope.agentId}:${activeSlot}:${selectedFile.path}`}
              file={selectedFile}
              redact={redact}
            />
          )}
        </div>
      )}
    </div>
  );
}
