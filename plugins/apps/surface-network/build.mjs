import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const require = createRequire(path.join(root, "console/package.json"));
const { build } = require("esbuild");
const options = {
  absWorkingDir: here,
  bundle: true,
  minify: true,
  target: "es2022",
  legalComments: "eof",
  nodePaths: [
    path.join(root, "plugins/bundle/ugsci/ui/node_modules"),
    path.join(root, "console/node_modules"),
  ],
  define: { "process.env.NODE_ENV": '"production"' },
  loader: { ".css": "text" },
};
await build({
  ...options,
  entryPoints: ["src/app.jsx"],
  outfile: "ui/index.js",
});
const out = path.join(root, "deliverables/surface-network");
fs.mkdirSync(out, { recursive: true });
const preview = await build({
  ...options,
  stdin: {
    contents: `import React from "react";import {createRoot} from "react-dom/client";window.QwenPaw={host:{React},registerRoutes:(_,routes)=>createRoot(document.getElementById("root")).render(React.createElement(routes[0].component))};require("./src/app.jsx");`,
    resolveDir: here,
  },
  write: false,
});
const modules = path.join(root, "plugins/bundle/ugsci/ui/node_modules");
const licenses = ["three", "react", "react-dom", "scheduler"].map(
  (id) =>
    id + "\n" + fs.readFileSync(path.join(modules, id, "LICENSE"), "utf8"),
);
const csvLicense =
  "d3-dsv\n" +
  fs.readFileSync(
    path.join(root, "console/node_modules/d3-dsv/LICENSE"),
    "utf8",
  );
licenses.push(csvLicense);
fs.writeFileSync(
  path.join(here, "THIRD_PARTY_LICENSES.txt"),
  licenses[0] + "\n\n" + csvLicense,
);
fs.writeFileSync(
  path.join(out, "地面管网.html"),
  '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>地面管网 · UGSci</title><style>html,body,#root{margin:0;height:100%;background:#f5f6f8}</style><div id="root"></div><script>' +
    preview.outputFiles[0].text.replace(/<\/script/gi, "<\\/script") +
    "</script></html>",
);
fs.appendFileSync(
  path.join(out, "地面管网.html"),
  "\n<!--\n" + licenses.join("\n\n") + "\n-->",
);
