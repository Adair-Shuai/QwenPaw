/**
 * Type declarations for optional peer dependencies used by Workspace renderers.
 * These packages are dynamically imported at runtime and may not be installed.
 */

declare module "@tiptap/static-renderer" {
  export function renderToReactElement(options: any): React.ReactNode;
}

declare module "@tiptap/starter-kit" {
  const StarterKit: any;
  export default StarterKit;
}

declare module "@tiptap/markdown" {
  export const Markdown: any;
}

declare module "react-pdf" {
  export const pdfjs: {
    GlobalWorkerOptions: { workerSrc: string };
    version: string;
  };
  export function Document(props: any): React.ReactNode;
  export function Page(props: any): React.ReactNode;
}

declare module "@codesandbox/sandpack-react" {
  export function SandpackProvider(props: any): React.ReactNode;
  export function SandpackPreview(props: any): React.ReactNode;
}
