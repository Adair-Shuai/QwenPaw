/**
 * Type declarations for optional peer dependencies used by Workspace renderers.
 * These packages are dynamically imported at runtime and may not be installed.
 */

declare module "@tiptap/static-renderer" {
  export function renderToReactElement(
    options: Record<string, unknown>,
  ): React.ReactNode;
}

declare module "@tiptap/starter-kit" {
  const StarterKit: unknown;
  export default StarterKit;
}

declare module "@tiptap/markdown" {
  export const Markdown: unknown;
}

// react-pdf and Sandpack use the types shipped by their installed packages.
