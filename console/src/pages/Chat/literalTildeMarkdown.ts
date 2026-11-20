import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

const parser = unified()
  .use(remarkParse)
  .use(remarkGfm, { singleTilde: false })
  .use(remarkMath)
  .freeze();

interface MarkdownNode {
  type: string;
  position?: { start: { offset?: number }; end: { offset?: number } };
  children?: MarkdownNode[];
}

/** The SDK accepts single tilde delimiters but has no public tokenizer option.
 * Escape them in display text, retaining the original message and code sources.
 */
export function preserveLiteralTildes(content: string): string {
  if (!content.includes("~")) return content;

  // Recognize the SDK's bracketed LaTeX too. Equal-length delimiters keep all
  // source offsets valid, and replacements below always use the original text.
  const parseContent = content.replace(
    /\\\(([\s\S]{1,10000}?)\\\)|\\\[([\s\S]{1,10000}?)\\\]/g,
    (match) => `$$${match.slice(2, -2)}$$`,
  );
  const nodes: MarkdownNode[] = [parser.parse(parseContent)];
  const edits: Array<{ start: number; end: number; replacement: string }> = [];
  while (nodes.length) {
    const node = nodes.pop()!;
    const start = node.position?.start.offset;
    const end = node.position?.end.offset;
    if (node.type === "text" && start !== undefined && end !== undefined) {
      const raw = content.slice(start, end);
      // Consume existing escapes and whole tilde runs before single tildes.
      const replacement = raw.replace(/\\[\s\S]|~+/g, (token) =>
        token === "~" ? "\\~" : token,
      );
      if (replacement !== raw) edits.push({ start, end, replacement });
    }
    if (node.children) nodes.push(...node.children);
  }
  if (!edits.length) return content;

  const parts: string[] = [];
  let offset = 0;
  for (const edit of edits.sort((a, b) => a.start - b.start)) {
    parts.push(content.slice(offset, edit.start), edit.replacement);
    offset = edit.end;
  }
  parts.push(content.slice(offset));
  return parts.join("");
}
