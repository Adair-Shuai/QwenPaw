import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.resolve(here, '../../../console/package.json'));
await require('esbuild').build({entryPoints:[path.join(here,'src/app.jsx')], bundle:true, outfile:path.join(here,'ui/index.js'), format:'iife', target:'es2020', minify:true, legalComments:'eof', loader:{'.css':'text'}, nodePaths:[path.resolve(here,'../../../console/node_modules')], jsxFactory:'React.createElement', jsxFragment:'React.Fragment'});
const output = path.join(here, 'ui/index.js');
fs.writeFileSync(output, fs.readFileSync(output, 'utf8').replace(/[ \t]+$/gm, ''));
