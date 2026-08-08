/**
 * Extension → Monaco language id mapping for the Coding editor.
 * Shared by the normal editor and the DiffEditor in TabbedEditor.
 */

export function getLanguage(path: string): string {
  const basename = path.replace(/\\/g, "/").split("/").pop()?.toLowerCase();
  if (basename === "dockerfile") return "dockerfile";
  if (basename === "makefile") return "makefile";

  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    py: "python",
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    json: "json",
    jsonc: "json",
    yaml: "yaml",
    yml: "yaml",
    md: "markdown",
    mdx: "markdown",
    markdown: "markdown",
    mmd: "markdown",
    mermaid: "markdown",
    sh: "shell",
    bash: "shell",
    zsh: "shell",
    bat: "bat",
    ps1: "powershell",
    psm1: "powershell",
    html: "html",
    htm: "html",
    css: "css",
    less: "less",
    scss: "scss",
    sql: "sql",
    toml: "ini",
    ini: "ini",
    cfg: "ini",
    conf: "ini",
    properties: "ini",
    env: "ini",
    xml: "xml",
    rs: "rust",
    go: "go",
    java: "java",
    cpp: "cpp",
    cc: "cpp",
    hpp: "cpp",
    c: "c",
    h: "c",
    kt: "kotlin",
    kotlin: "kotlin",
    rb: "ruby",
    php: "php",
    lua: "lua",
    r: "r",
    dart: "dart",
    swift: "swift",
    scala: "scala",
    graphql: "graphql",
    gql: "graphql",
    proto: "protobuf",
    gradle: "groovy",
    tf: "hcl",
    log: "plaintext",
    txt: "plaintext",
    vim: "plaintext",
    robot: "robotframework",
    resource: "robotframework",
  };
  return map[ext] ?? "plaintext";
}
