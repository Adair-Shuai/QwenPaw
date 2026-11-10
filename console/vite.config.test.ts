import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

function loadDeploymentConfig(basename: string | undefined) {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    BASE_URL: "https://unrelated.example.com",
    VITE_API_BASE_URL: "/backend",
  };
  delete env.VITE_CONSOLE_BASENAME;
  if (basename !== undefined) env.VITE_CONSOLE_BASENAME = basename;

  // Load build tooling in Node, outside jsdom's browser globals.
  const output = execFileSync(
    process.execPath,
    [
      "--input-type=module",
      "--eval",
      `import { loadConfigFromFile } from "vite";
       const { config } = await loadConfigFromFile({
         command: "build", mode: "production",
       });
       process.stdout.write(JSON.stringify({
         base: config.base ?? "/",
         apiBase: config.define.VITE_API_BASE_URL,
       }));`,
    ],
    {
      env,
      encoding: "utf8",
    },
  );
  return JSON.parse(output) as { base: string; apiBase: string };
}

describe("console deployment configuration", () => {
  it.each(["production", "tauri"])(
    "builds extensionless assets with portable names and intact references (%s)",
    (mode) => {
      const output = execFileSync(
        process.execPath,
        [
          "--input-type=module",
          "--eval",
          `import { build, loadConfigFromFile } from "vite";
         import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
         import { tmpdir } from "node:os";
         import path from "node:path";
         const temporary = path.resolve(tmpdir());
         const root = mkdtempSync(path.join(temporary, "console-assets-"));
         try {
           writeFileSync(path.join(root, "LICENSE_LIBERATION"), "Synthetic font license\\n");
           writeFileSync(path.join(root, "font.woff2"), "synthetic-font-bytes");
           writeFileSync(path.join(root, "main.js"),
             'globalThis.assetURLs = [new URL("./LICENSE_LIBERATION", import.meta.url).href, new URL("./font.woff2", import.meta.url).href];');
           const { config } = await loadConfigFromFile({
             command: "build", mode: ${JSON.stringify(mode)},
           });
           const result = await build({
             ...config,
             configFile: false,
             mode: ${JSON.stringify(mode)},
             root,
             publicDir: false,
             logLevel: "silent",
             build: {
               ...config.build,
               write: false,
               assetsInlineLimit: 0,
               minify: false,
               sourcemap: false,
               rollupOptions: {
                 ...config.build.rollupOptions,
                 input: path.join(root, "main.js"),
               },
             },
           });
           const chunks = (Array.isArray(result) ? result : [result]).flatMap(bundle => bundle.output);
           process.stdout.write(JSON.stringify(chunks.map(chunk => ({
             fileName: chunk.fileName,
             type: chunk.type,
             content: chunk.type === "chunk" ? chunk.code : Buffer.from(chunk.source).toString("utf8"),
           }))));
         } finally {
           if (path.dirname(root) !== temporary || !path.basename(root).startsWith("console-assets-")) {
             throw new Error("Refusing to clean an unexpected build fixture path");
           }
           rmSync(root, { recursive: true, force: true });
         }`,
        ],
        { encoding: "utf8" },
      );
      const files = JSON.parse(output) as {
        fileName: string;
        type: "asset" | "chunk";
        content: string;
      }[];
      const license = files.find(
        (file) => file.content === "Synthetic font license\n",
      );
      const font = files.find(
        (file) => file.content === "synthetic-font-bytes",
      );
      expect(license?.fileName).toMatch(/^assets\/LICENSE_LIBERATION-[\w-]+$/);
      expect(font?.fileName).toMatch(/^assets\/font-[\w-]+\.woff2$/);
      for (const file of files) {
        for (const part of file.fileName.split("/")) {
          // Windows filenames must explicitly reject ASCII control characters.
          // eslint-disable-next-line no-control-regex
          expect(part).not.toMatch(/[<>:"\\|?*\x00-\x1f]|[. ]$/);
          expect(part).not.toMatch(
            /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i,
          );
        }
      }
      const javascript = files
        .filter((file) => file.type === "chunk")
        .map((file) => file.content)
        .join("\n");
      expect(javascript).toContain(license!.fileName);
      expect(javascript).toContain(font!.fileName);
    },
  );

  it.each([undefined, "", " "])(
    "keeps assets at the root when the basename is %j",
    (basename) => {
      const config = loadDeploymentConfig(basename);
      expect(config.base).toBe("/");
    },
  );

  it.each([
    ["/qwenpaw", "/qwenpaw/"],
    ["/qwenpaw/", "/qwenpaw/"],
    ["qwenpaw", "/qwenpaw/"],
    [" /apps/qwenpaw// ", "/apps/qwenpaw/"],
    ["/", "/"],
  ])("uses %j as the asset prefix %j", (basename, base) => {
    const config = loadDeploymentConfig(basename);
    expect(config.base).toBe(base);
    expect(config.apiBase).toBe('"/backend"');
  });
});
