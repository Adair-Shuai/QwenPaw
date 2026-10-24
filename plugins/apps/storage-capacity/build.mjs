import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { readFileSync } from "node:fs";
const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(
  path.resolve(here, "../../../console/package.json"),
);
await require("esbuild").build({
  entryPoints: [path.join(here, "src/app.jsx")],
  bundle: true,
  outfile: path.join(here, "ui/index.js"),
  format: "iife",
  target: "es2020",
  minify: true,
  loader: { ".css": "text" },
  jsxFactory: "React.createElement",
  jsxFragment: "React.Fragment",
  plugins: [
    {
      name: "portable-css-newlines",
      setup(build) {
        build.onLoad({ filter: /\.css$/ }, (args) => ({
          contents: readFileSync(args.path, "utf8").replace(/\r\n/g, "\n"),
          loader: "text",
        }));
      },
    },
  ],
});
