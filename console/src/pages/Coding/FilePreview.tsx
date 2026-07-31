/**
 * FilePreview – renders a non-code file in the editor area.
 *
 * Supported types (auto-detected by extension):
 *   • image  – PNG / JPG / GIF / WebP / SVG / ICO / BMP
 *   • pdf    – inline <embed>
 *   • markdown – react-markdown with GFM
 *   • csv    – parsed table
 */

import { useMemo } from "react";
import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ExternalMarkdownLink } from "../../components/Markdown/externalLinkComponents";
import { useAgentStore } from "../../stores/agentStore";
import { useAuthenticatedWorkspaceBlob } from "../../hooks/useAuthenticatedWorkspaceBlob";
import { resolveWorkspaceMarkdownTarget } from "../../utils/workspaceMarkdownLinks";
import styles from "./FilePreview.module.less";

// ---------------------------------------------------------------------------
// Type detection
// ---------------------------------------------------------------------------

const IMAGE_EXTS = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "svg",
  "ico",
  "bmp",
]);

export type PreviewType = "image" | "pdf" | "markdown" | "csv" | "none";

export function getPreviewType(filePath: string): PreviewType {
  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
  if (IMAGE_EXTS.has(ext)) return "image";
  if (ext === "pdf") return "pdf";
  if (ext === "md" || ext === "mdx") return "markdown";
  if (ext === "csv") return "csv";
  return "none";
}

export function isPreviewable(filePath: string): boolean {
  return getPreviewType(filePath) !== "none";
}

// ---------------------------------------------------------------------------
// CSV parser (no external dep)
// ---------------------------------------------------------------------------

/**
 * RFC 4180-compliant CSV parser (character-level state machine).
 *
 * Handles quoted fields that contain newlines, commas, and escaped
 * double-quotes ("") — cases the old line-split approach broke on.
 *
 * Supported line endings: \n (Unix), \r\n (Windows), \r (old Mac).
 */
function parseCsv(raw: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuote = false;

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];

    if (inQuote) {
      if (ch === '"') {
        if (raw[i + 1] === '"') {
          // Escaped quote inside a quoted field
          cell += '"';
          i++;
        } else {
          // End of quoted field
          inQuote = false;
        }
      } else {
        // Everything inside quotes — including newlines and commas
        cell += ch;
      }
    } else {
      if (ch === '"') {
        inQuote = true;
      } else if (ch === ",") {
        row.push(cell);
        cell = "";
      } else if (ch === "\r") {
        // \r\n (Windows) or \r alone (old Mac) — line break
        row.push(cell);
        cell = "";
        rows.push(row);
        row = [];
        // Skip the \n in \r\n pairs
        if (raw[i + 1] === "\n") i++;
      } else if (ch === "\n") {
        // \n alone (Unix) — line break
        row.push(cell);
        cell = "";
        rows.push(row);
        row = [];
      } else {
        cell += ch;
      }
    }
  }

  // Flush the last row if there is pending content
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

// ---------------------------------------------------------------------------
// Sub-renderers
// ---------------------------------------------------------------------------

function ImagePreview({ filePath }: { filePath: string }) {
  const agentId = useAgentStore((state) => state.selectedAgent);
  const resource = useAuthenticatedWorkspaceBlob(filePath, agentId);
  if (resource.status !== "ready" || !resource.url) return null;
  return (
    <div className={styles.imageWrap}>
      <img
        src={resource.url}
        alt={filePath.split("/").pop()}
        className={styles.image}
      />
    </div>
  );
}

function PdfPreview({ filePath }: { filePath: string }) {
  const agentId = useAgentStore((state) => state.selectedAgent);
  const resource = useAuthenticatedWorkspaceBlob(filePath, agentId);
  if (resource.status !== "ready" || !resource.url) return null;
  return (
    <embed
      src={resource.url}
      type="application/pdf"
      className={styles.pdfEmbed}
      title={filePath.split("/").pop()}
    />
  );
}

const markdownCodeComponents: Components = {
  pre({ children }: { children?: React.ReactNode }) {
    return <>{children}</>;
  },
  code({
    node,
    inline,
    className,
    children,
    ...rest
  }: ComponentPropsWithoutRef<"code"> & {
    node?: unknown;
    inline?: boolean;
  }) {
    void node;
    void inline;
    const match = /language-([\w-]+)/.exec(className || "");
    const codeText = String(children).replace(/\n$/, "");
    if (match) {
      return (
        <SyntaxHighlighter
          language={match[1]}
          style={oneDark}
          customStyle={{
            margin: 0,
            borderRadius: "6px",
            fontSize: "13px",
            lineHeight: "1.6",
          }}
        >
          {codeText}
        </SyntaxHighlighter>
      );
    }
    return (
      <code className={className} {...rest}>
        {children}
      </code>
    );
  },
};

interface MarkdownPreviewProps {
  filePath: string;
  content: string;
  onOpenWorkspaceFile?: (path: string) => void;
}

function MarkdownPreview({
  filePath,
  content,
  onOpenWorkspaceFile,
}: MarkdownPreviewProps) {
  const agentId = useAgentStore((state) => state.selectedAgent);
  const components = useMemo<Components>(() => {
    const WorkspaceImage = ({
      node,
      src,
      alt,
      ...props
    }: ComponentPropsWithoutRef<"img"> & { node?: unknown }) => {
      void node;
      const target = src
        ? resolveWorkspaceMarkdownTarget(src, filePath)
        : { kind: "invalid" as const };
      const resource = useAuthenticatedWorkspaceBlob(
        target.kind === "workspace" ? target.path : null,
        agentId,
      );

      if (target.kind === "external") {
        return <img src={target.href} alt={alt} {...props} />;
      }
      if (target.kind !== "workspace") return <span>{alt}</span>;
      return resource.status === "ready" && resource.url ? (
        <img src={resource.url} alt={alt} {...props} />
      ) : null;
    };

    const WorkspaceLink = ({
      node,
      href,
      children,
      ...props
    }: ComponentPropsWithoutRef<"a"> & { node?: unknown }) => {
      void node;
      const target = href
        ? resolveWorkspaceMarkdownTarget(href, filePath)
        : { kind: "invalid" as const };
      if (target.kind === "external") {
        return (
          <ExternalMarkdownLink href={target.href} {...props}>
            {children}
          </ExternalMarkdownLink>
        );
      }
      if (target.kind === "anchor") {
        return (
          <a href={target.href} {...props}>
            {children}
          </a>
        );
      }
      if (target.kind !== "workspace") return <span>{children}</span>;
      return (
        <a
          href={target.path}
          {...props}
          onClick={(event) => {
            event.preventDefault();
            onOpenWorkspaceFile?.(target.path);
          }}
        >
          {children}
        </a>
      );
    };

    return {
      ...markdownCodeComponents,
      a: WorkspaceLink,
      img: WorkspaceImage,
    };
  }, [agentId, filePath, onOpenWorkspaceFile]);

  return (
    <div className={styles.markdownWrap}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

const MAX_CSV_ROWS = 500;
const MAX_CSV_COLS = 50;

function CsvPreview({ content }: { content: string }) {
  const rows = useMemo(() => parseCsv(content), [content]);
  const header = rows[0] ?? [];
  const body = rows.slice(1, MAX_CSV_ROWS + 1);
  const truncatedCols = header.length > MAX_CSV_COLS;
  const truncatedRows = rows.length - 1 > MAX_CSV_ROWS;

  return (
    <div className={styles.csvWrap}>
      {(truncatedCols || truncatedRows) && (
        <div className={styles.csvNote}>
          {truncatedRows &&
            `Showing first ${MAX_CSV_ROWS} of ${rows.length - 1} rows. `}
          {truncatedCols &&
            `Showing first ${MAX_CSV_COLS} of ${header.length} columns.`}
        </div>
      )}
      <div className={styles.csvScroll}>
        <table className={styles.csvTable}>
          <thead>
            <tr>
              {header.slice(0, MAX_CSV_COLS).map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, ri) => (
              <tr key={ri}>
                {row.slice(0, MAX_CSV_COLS).map((cell, ci) => (
                  <td key={ci}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export interface FilePreviewProps {
  filePath: string;
  /** Text content – used by Markdown and CSV renderers. */
  content: string;
  onOpenWorkspaceFile?: (path: string) => void;
}

export default function FilePreview({
  filePath,
  content,
  onOpenWorkspaceFile,
}: FilePreviewProps) {
  const type = getPreviewType(filePath);

  if (type === "image") return <ImagePreview filePath={filePath} />;
  if (type === "pdf") return <PdfPreview filePath={filePath} />;
  if (type === "markdown") {
    return (
      <MarkdownPreview
        filePath={filePath}
        content={content}
        onOpenWorkspaceFile={onOpenWorkspaceFile}
      />
    );
  }
  if (type === "csv") return <CsvPreview content={content} />;
  return null;
}
