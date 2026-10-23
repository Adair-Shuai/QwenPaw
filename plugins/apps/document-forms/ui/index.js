(()=>{var U=window.QwenPaw.host.React,{useEffect:tt,useState:me}=U;function Qe({artifact:n,children:g}){return n.extension==="xlsx"?g:U.createElement(mt,{artifact:n},g)}function mt({artifact:n,children:g}){let[f,h]=me("print"),[u,j]=me([]),[p,N]=me(0),[r,z]=me(""),[c,M]=me(0),[F,J]=me(100);return tt(()=>{if(f!=="print")return;let d=new AbortController,T=[];return j([]),N(0),z(""),window.QwenPaw.host.fetch(n.printUrl+"?pages=true",{headers:n.agentId?{"X-Agent-Id":n.agentId}:{},signal:d.signal}).then(async D=>{if(!D.ok){let L=await D.json().catch(()=>({}));throw new Error(typeof L.detail=="string"?L.detail:"\u6253\u5370\u9884\u89C8\u6682\u4E0D\u53EF\u7528\uFF0C\u53EF\u5207\u6362\u6587\u5B57\u9884\u89C8\u6216\u4E0B\u8F7D Word \u67E5\u770B")}let{pages:E}=await D.json();if(!d.signal.aborted){if(!Number.isInteger(E)||E<1||E>40)throw new Error("\u672A\u83B7\u5F97\u6709\u6548\u7684 Word \u9875\u6570");N(E);for(let L=1;L<=E;L++){let Q=await window.QwenPaw.host.fetch(n.printUrl+"?page="+L,{headers:n.agentId?{"X-Agent-Id":n.agentId}:{},signal:d.signal});if(!Q.ok)throw new Error(`\u7B2C ${L} \u9875\u672A\u80FD\u6E32\u67D3\uFF0C\u8BF7\u91CD\u65B0\u9884\u89C8`);let $=await Q.blob();if(d.signal.aborted)return;let b=URL.createObjectURL($);T.push(b),j(w=>[...w,b])}}}).catch(D=>{d.signal.aborted||z(D.message||"\u6253\u5370\u9884\u89C8\u672A\u5B8C\u6210")}),()=>{d.abort(),T.forEach(D=>URL.revokeObjectURL(D))}},[n.id,n.printUrl,n.agentId,f,c]),U.createElement("div",{className:"df-print-preview"},U.createElement("div",{className:"df-print-toolbar"},U.createElement("div",null,U.createElement("button",{"aria-pressed":f==="print",onClick:()=>h("print")},"\u6253\u5370\u7248\u5F0F"),U.createElement("button",{"aria-pressed":f==="text",onClick:()=>h("text")},"\u6587\u5B57\u9884\u89C8")),f==="print"&&U.createElement("div",null,p>0&&U.createElement("span",null,"\u5171 ",p," \u9875"),U.createElement("select",{"aria-label":"\u9884\u89C8\u6BD4\u4F8B",value:F,onChange:d=>J(Number(d.target.value))},U.createElement("option",{value:100},"\u9002\u5408\u5BBD\u5EA6"),U.createElement("option",{value:125},"125%"),U.createElement("option",{value:150},"150%"),U.createElement("option",{value:200},"200%")))),f==="text"?U.createElement("div",{className:"df-text-preview"},g):r?U.createElement("div",{className:"df-preview-message",role:"alert"},U.createElement("p",null,r),U.createElement("button",{onClick:()=>M(d=>d+1)},"\u91CD\u65B0\u9884\u89C8")):u.length?U.createElement("div",{className:"df-print-scroll"},U.createElement("div",{className:"df-print-pages",style:{width:F+"%"}},u.map((d,T)=>U.createElement("figure",{key:T},U.createElement("figcaption",null,"\u7B2C ",T+1," \u9875"),U.createElement("img",{src:d,alt:n.title+` \xB7 \u6253\u5370\u7248\u5F0F \xB7 \u7B2C ${T+1} \u9875`}))),u.length<p&&U.createElement("p",{role:"status"},"\u6B63\u5728\u6392\u7248\u7B2C ",u.length+1," \u9875\u2026"))):U.createElement("div",{className:"df-preview-message",role:"status"},"\u6B63\u5728\u6392\u7248\u6253\u5370\u9875\u9762\u2026"))}function le({artifact:n}){let[g,f]=me(null),[h,u]=me(""),[j,p]=me(0);if(tt(()=>{let r=new AbortController;return f(null),u(""),window.QwenPaw.host.fetch("/workspace/convert-office",{method:"POST",headers:{"Content-Type":"application/json",...n.agentId?{"X-Agent-Id":n.agentId}:{}},signal:r.signal,body:JSON.stringify({url:n.binaryUrl,mime_type:n.mimeType})}).then(async z=>{let c=await z.json();if(!z.ok)throw new Error(typeof c.detail=="string"?c.detail:"\u6587\u4EF6\u9884\u89C8\u672A\u5B8C\u6210");r.signal.aborted||f(c)}).catch(z=>{r.signal.aborted||u(z.message||"\u6587\u4EF6\u9884\u89C8\u672A\u5B8C\u6210")}),()=>r.abort()},[n.id,n.binaryUrl,n.mimeType,n.agentId,j]),h)return U.createElement("div",{className:"df-preview-message",role:"alert"},U.createElement("p",null,h),U.createElement("button",{onClick:()=>p(r=>r+1)},"\u91CD\u65B0\u9884\u89C8"),U.createElement("p",null,"\u4E5F\u53EF\u4EE5\u4ECE\u6587\u4EF6\u6E05\u5355\u4E0B\u8F7D\u540E\u67E5\u770B\u3002"));if(!g)return U.createElement("div",{className:"df-preview-message",role:"status"},"\u6B63\u5728\u6253\u5F00\u6587\u4EF6\u2026");let N=g.engine==="officecli"?g.html:`<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;color:#333;background:#fff;padding:24px 32px;line-height:1.7;max-width:900px;margin:0 auto}table{border-collapse:collapse;width:100%;margin:12px 0}td,th{border:1px solid #ddd;padding:8px 12px}img{max-width:100%;height:auto}h1{font-size:1.6em}h2{font-size:1.3em}.docx-page-break{border-top:2px dashed #ccc;margin:32px 0}</style></head><body>${g.html||""}</body></html>`;return U.createElement("iframe",{className:"df-office-frame",title:n.title,srcDoc:N,sandbox:g.engine==="officecli"?"allow-scripts":"allow-same-origin"})}var it=`.df-app {
  --df-bg: #f5f5f1;
  --df-paper: #fff;
  --df-text: #223b3e;
  --df-muted: #6d7b7d;
  --df-line: #dfe5e2;
  --df-accent: #2c6260;
  display: flex;
  height: 100%;
  min-height: 500px;
  color: var(--df-text);
  background: var(--df-bg);
  font:
    14px/1.6 -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    "Microsoft YaHei",
    sans-serif;
}

.df-app[data-theme="dark"] {
  --df-bg: #151d20;
  --df-paper: #202b2e;
  --df-text: #e3ece8;
  --df-muted: #a4b6b3;
  --df-line: #3a494a;
  --df-accent: #79b7aa;
}
.df-app * {
  box-sizing: border-box;
}
.df-app button,
.df-app input,
.df-app textarea {
  font: inherit;
}
.df-app button {
  border: 1px solid var(--df-line);
  border-radius: 6px;
  background: var(--df-paper);
  color: var(--df-text);
  padding: 7px 13px;
  cursor: pointer;
  transition: background 0.12s;
}
.df-app button:hover {
  background: var(--df-bg);
}
.df-app button:disabled {
  opacity: 0.45;
  cursor: default;
}
.df-app button:focus-visible,
.df-app input:focus,
.df-app textarea:focus {
  outline: 2px solid var(--df-accent);
  outline-offset: 2px;
}
.df-app .df-primary {
  background: #2b625f;
  color: #fff;
  border-color: #2b625f;
}
.df-app .df-primary:hover {
  background: #204f4d;
}
.df-sidebar {
  width: 236px;
  flex-shrink: 0;
  border-right: 1px solid var(--df-line);
  padding: 25px 18px;
  display: flex;
  flex-direction: column;
  overflow: auto;
}
.df-brand {
  font-family: Georgia, serif;
  font-size: 22px;
  letter-spacing: 0.04em;
}
.df-brand span {
  display: block;
  font-family: inherit;
  font-size: 13px;
  letter-spacing: 0.15em;
  color: var(--df-muted);
  margin-top: 3px;
}
.df-new {
  margin: 27px 0;
}
.df-caption,
.df-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.df-caption {
  font-size: 12px;
  color: var(--df-muted);
  margin-bottom: 10px;
}
.df-sidebar nav {
  display: grid;
  gap: 5px;
  max-height: 50vh;
  overflow: auto;
}
.df-sidebar nav button {
  text-align: left;
  border-color: transparent;
  background: transparent;
  padding: 10px;
  overflow-wrap: anywhere;
}
.df-sidebar nav button[aria-current="page"] {
  background: var(--df-paper);
  border-color: var(--df-line);
}
.df-sidebar nav b {
  display: block;
  font-size: 13px;
  font-weight: 550;
}
.df-app small {
  font-size: 11px;
  color: var(--df-muted);
  display: block;
}
.df-sidebar-foot {
  margin-top: auto;
  padding-top: 35px;
  color: var(--df-muted);
  font-size: 12px;
}
.df-sidebar-foot p {
  margin: 8px 0 14px;
}
.df-sidebar-foot button {
  font-size: 12px;
  margin-bottom: 8px;
}
.df-main {
  flex: 1;
  min-width: 0;
  overflow: auto;
  padding: 31px 36px 16px;
}
.df-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 25px;
}
.df-eyebrow {
  font-size: 10px;
  letter-spacing: 0.15em;
  color: var(--df-muted);
}
.df-app h1 {
  font-weight: 550;
  font-size: 25px;
  margin: 7px 0;
  overflow-wrap: anywhere;
  line-height: 1.5;
}
.df-app h2 {
  font-size: 17px;
  margin: 0 0 8px;
  font-weight: 600;
}
.df-app h3 {
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 14px;
}
.df-header p,
.df-section-head p {
  font-size: 12px;
  color: var(--df-muted);
  margin: 0;
}
.df-steps {
  display: flex;
  gap: 25px;
  border-bottom: 1px solid var(--df-line);
  margin-bottom: 22px;
}
.df-steps button {
  border: 0;
  background: transparent;
  border-radius: 0;
  padding: 7px 0 13px;
  color: var(--df-muted);
  border-bottom: 2px solid transparent;
  white-space: nowrap;
}
.df-steps button.active {
  color: var(--df-accent);
  border-bottom-color: var(--df-accent);
  font-weight: 600;
}
.df-steps span {
  font-size: 10px;
  margin-right: 7px;
  opacity: 0.6;
}
.df-content {
  border: 0;
  margin: 0;
  padding: 0;
  min-width: 0;
}
.df-paper {
  background: var(--df-paper);
  border: 1px solid var(--df-line);
  border-radius: 9px;
  padding: 25px;
  margin-bottom: 18px;
}
.df-import {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
  max-width: 1100px;
  margin-top: 38px;
}
.df-drop {
  text-align: center;
  padding: 60px 25px;
  border-style: dashed;
}
.df-file-mark {
  font:
    12px/1.4 ui-monospace,
    monospace;
  border: 1px solid var(--df-line);
  border-radius: 5px;
  color: var(--df-accent);
  width: 50px;
  margin: 0 auto 25px;
  padding: 21px 4px;
}
.df-drop p {
  color: var(--df-muted);
  margin: 18px 0 28px;
}
.df-drop small {
  margin-top: 15px;
}
.df-import-note {
  padding: 32px;
}
.df-import-note h2 {
  margin: 10px 0 25px;
}
.df-import-note ol {
  padding-left: 20px;
}
.df-import-note li {
  padding-left: 7px;
  margin-bottom: 20px;
}
.df-import-note li p {
  font-size: 12px;
  color: var(--df-muted);
  margin: 5px 0;
}
.df-muted {
  font-size: 12px;
  color: var(--df-muted);
}
.df-edit-layout {
  max-width: 1120px;
  margin: 0 auto;
}
.df-section-head {
  margin-bottom: 22px;
}
.df-section-head h2 {
  margin: 0;
}
.df-section-head button {
  font-size: 12px;
  flex-shrink: 0;
}
.df-group {
  border-top: 1px solid var(--df-line);
  margin-top: 25px;
  padding-top: 22px;
}
.df-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 22px;
}
.df-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  scroll-margin: 100px;
}
.df-field > span {
  font-size: 12px;
  font-weight: 500;
}
.df-field em {
  font-size: 9px;
  color: var(--df-muted);
  font-style: normal;
  font-weight: 400;
  margin-left: 8px;
}
.df-field input,
.df-field textarea {
  color: var(--df-text);
  background: var(--df-bg);
  border: 1px solid var(--df-line);
  border-radius: 5px;
  padding: 8px 10px;
  width: 100%;
  min-height: 40px;
}
.df-field textarea {
  resize: vertical;
}
.df-field-paragraph {
  grid-column: 1 / -1;
}
.df-field-paragraph textarea {
  min-height: 192px;
  max-height: 640px;
  padding: 14px 16px;
  line-height: 1.85;
  background: var(--df-paper);
  border-color: var(--df-line);
  scrollbar-gutter: stable;
}
.df-field-paragraph + .df-field-paragraph {
  margin-top: 6px;
}
.df-field-compact textarea {
  min-height: 104px;
}
.df-follow-state {
  display: flex !important;
  align-items: center;
  gap: 10px;
}
.df-follow-state button {
  font-size: 11px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--df-accent);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.df-field small {
  opacity: 0.7;
  word-break: break-all;
  font:
    10px ui-monospace,
    monospace;
}
.df-title-field {
  max-width: 550px;
}
.df-template {
  padding: 14px 0;
  border-top: 1px solid var(--df-line);
  position: relative;
}
.df-template-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}
.df-template b {
  font-size: 12px;
  display: block;
  overflow-wrap: anywhere;
}
.df-template span {
  font-size: 11px;
  color: var(--df-muted);
  display: block;
  margin-top: 5px;
}
.df-template button {
  font-size: 10px;
  padding: 2px 7px;
  margin-top: 8px;
}
.df-edit-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  border-top: 3px solid var(--df-accent);
}
.df-generation-plan h2 {
  margin-bottom: 10px;
}
.df-generation-plan p {
  color: var(--df-muted);
  font-size: 13px;
  margin: 0 0 4px;
}
.df-generation-plan b {
  font-size: 20px;
  font-weight: 600;
  color: var(--df-text);
  margin: 0 4px;
}
.df-next-action {
  min-width: 230px;
  text-align: center;
}
.df-next-action .df-primary {
  width: 100%;
  min-height: 44px;
  margin-bottom: 8px;
}
.df-next-action small {
  font-size: 10px;
}
.df-count {
  font-size: 11px;
  font-weight: 400;
  color: var(--df-muted);
  margin-left: 8px;
}
.df-recipient {
  border-top: 1px solid var(--df-line);
  padding: 18px 0;
}
.df-recipient-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.df-recipient-title b {
  font:
    13px Georgia,
    serif;
  color: var(--df-muted);
}
.df-recipient-title button {
  font-size: 11px;
  border: 0;
  padding: 2px 6px;
}
.df-span {
  grid-column: 1/-1;
}
.df-alert {
  border: 1px solid #b6d0c3;
  background: #eff8f1;
  color: #2e6150;
  padding: 11px 14px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  gap: 15px;
}
.df-alert.error {
  background: #fff1ec;
  border-color: #e9bca9;
  color: #994f39;
}
.df-alert button {
  padding: 0 5px;
  background: transparent;
  border: 0;
}
.df-progress {
  font-size: 12px;
  color: var(--df-accent);
  margin-bottom: 12px;
}
.df-review {
  max-width: 1000px;
  margin: auto;
}
.df-review > .df-paper > h2 {
  margin-top: 10px;
  font-size: 21px;
}
.df-review > .df-paper > p {
  font-size: 12px;
  color: var(--df-muted);
}
.df-checks {
  margin: 24px 0;
}
.df-check {
  padding: 12px 0;
  display: flex;
  gap: 15px;
  align-items: start;
  border-bottom: 1px solid var(--df-line);
}
.df-check > span {
  font-size: 10px;
  border: 1px solid var(--df-line);
  padding: 2px 7px;
  border-radius: 4px;
  flex-shrink: 0;
}
.df-check.error > span {
  color: #b75a3a;
  border-color: #dfb7a8;
}
.df-check.missing > span {
  color: #9a7e31;
  border-color: #dfd3af;
}
.df-check.ok > span {
  color: var(--df-accent);
}
.df-check b {
  font-size: 12px;
  overflow-wrap: anywhere;
}
.df-check p {
  margin: 3px 0 0;
  font-size: 11px;
  color: var(--df-muted);
}
.df-check button {
  font-size: 11px;
  margin-left: auto;
}
.df-review-data {
  padding: 22px 0;
  border-top: 1px solid var(--df-line);
}
.df-review-data dl {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px 30px;
  margin: 0;
}
.df-review-data dt {
  font-size: 11px;
  color: var(--df-muted);
}
.df-review-data dd {
  margin: 4px 0 0;
  overflow-wrap: anywhere;
  font-size: 13px;
  white-space: pre-wrap;
  line-height: 1.85;
}
.df-review-data p {
  font-size: 12px;
  overflow-wrap: anywhere;
}
.df-confirm {
  border-top: 1px solid var(--df-line);
  padding-top: 25px;
}
.df-confirm label {
  display: flex;
  gap: 9px;
  align-items: center;
  font-size: 13px;
}
.df-confirm input {
  accent-color: var(--df-accent);
}
.df-confirm p {
  color: var(--df-muted);
  font-size: 11px;
  margin: 10px 0 23px;
}
.df-confirm > div {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}
.df-results {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}
.df-generation-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 4px 8px;
  margin-bottom: 10px;
}
.df-generation-heading h3 {
  flex: 1 1 150px;
  margin: 0;
}
.df-generation-heading button {
  padding: 3px 0;
  border: 0;
  background: transparent;
  color: var(--df-accent);
  font-size: 11px;
  white-space: nowrap;
}
.df-output-list {
  padding: 20px;
}
.df-output-list > h2 {
  margin: 10px 0;
}
.df-output-list > p {
  font-size: 11px;
  color: var(--df-muted);
}
.df-generation {
  border-top: 1px solid var(--df-line);
  padding-top: 18px;
  margin-top: 20px;
}
.df-generation h3 {
  font-size: 11px;
  color: var(--df-muted);
}
.df-output {
  display: flex;
  border: 1px solid transparent;
  border-radius: 5px;
  margin-bottom: 8px;
}
.df-output.selected {
  border-color: var(--df-accent);
  background: var(--df-bg);
}
.df-output button {
  border: 0;
  background: transparent;
  padding: 9px;
  min-width: 0;
  text-align: left;
}
.df-output button:first-child {
  flex: 1;
  overflow-wrap: anywhere;
}
.df-output b {
  font-size: 11px;
  display: block;
  font-weight: 500;
}
.df-output small {
  font-size: 10px;
  margin-top: 4px;
}
.df-preview {
  padding: 15px;
  position: sticky;
  top: 10px;
}
.df-preview .df-section-head {
  margin-bottom: 12px;
}
.df-preview h2 {
  font-size: 12px;
  overflow-wrap: anywhere;
}
.df-preview .df-section-head > span {
  font-size: 10px;
  white-space: nowrap;
  color: var(--df-muted);
}
.df-preview-body {
  height: 75vh;
  min-height: 450px;
  background: var(--df-bg);
  border: 1px solid var(--df-line);
  overflow: hidden;
}
.df-footer {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--df-muted);
  gap: 18px;
  margin-top: 23px;
}
.df-app fieldset:disabled {
  opacity: 0.75;
}
@media (max-width: 1150px) {
  .df-sidebar {
    width: 190px;
    padding: 22px 14px;
  }
  .df-main {
    padding: 24px 22px;
  }
  .df-fields {
    gap: 16px;
  }
  .df-paper {
    padding: 20px;
  }
  .df-results {
    grid-template-columns: 250px minmax(0, 1fr);
  }
}
@media (max-width: 850px) {
  .df-sidebar {
    width: 165px;
  }
  .df-import,
  .df-results {
    grid-template-columns: 1fr;
  }
  .df-preview {
    position: static;
  }
  .df-fields,
  .df-review-data dl {
    grid-template-columns: 1fr;
  }
  .df-edit-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }
  .df-next-action {
    min-width: 0;
  }
  .df-main {
    padding: 20px 18px;
  }
  .df-app h1 {
    font-size: 20px;
  }
  .df-steps {
    gap: 14px;
  }
  .df-steps button {
    font-size: 12px;
  }
  .df-steps span {
    display: none;
  }
  .df-drop {
    padding: 35px 20px;
  }
  .df-import {
    margin-top: 15px;
  }
  .df-output-list {
    max-height: 400px;
    overflow: auto;
  }
}
@media (max-width: 560px) {
  .df-app {
    display: block;
    height: auto;
    min-height: 100%;
    overflow: auto;
  }
  .df-sidebar {
    width: 100%;
    padding: 14px 18px;
    display: grid;
    grid-template-columns: 1fr auto;
    border-right: 0;
    border-bottom: 1px solid var(--df-line);
    gap: 10px;
  }
  .df-brand {
    font-size: 18px;
  }
  .df-brand span {
    display: inline;
    margin-left: 10px;
    font-size: 11px;
  }
  .df-new {
    margin: 0;
    font-size: 12px;
  }
  .df-caption,
  .df-sidebar-foot {
    display: none;
  }
  .df-sidebar nav {
    grid-column: 1/-1;
    display: flex;
    max-height: 100px;
  }
  .df-sidebar nav button {
    min-width: 130px;
    max-width: 190px;
    flex-shrink: 0;
  }
  .df-main {
    overflow: visible;
    padding: 20px 14px;
  }
  .df-app h1 {
    font-size: 19px;
  }
  .df-header {
    align-items: start;
    gap: 8px;
  }
  .df-header > button {
    font-size: 11px;
    white-space: nowrap;
  }
  .df-fields,
  .df-review-data dl {
    grid-template-columns: 1fr;
  }
  .df-paper {
    padding: 18px;
  }
  .df-steps {
    gap: 0;
    justify-content: space-between;
  }
  .df-steps button {
    font-size: 11px;
  }
  .df-steps span {
    display: none;
  }
  .df-confirm > div {
    flex-direction: column;
  }
  .df-field-paragraph textarea {
    padding: 12px;
    min-height: 180px;
    max-height: 70vh;
  }
  .df-field-compact textarea {
    min-height: 104px;
  }
  .df-footer {
    flex-direction: column;
    gap: 3px;
  }
  .df-preview-body {
    height: 65vh;
    min-height: 380px;
  }
  .df-output-list {
    max-height: none;
  }
}

.df-passed {
  margin: 20px 0;
  padding: 12px 15px;
  background: var(--df-bg);
  border: 1px solid var(--df-line);
  border-radius: 6px;
  font-size: 12px;
  color: var(--df-muted);
}
.df-passed summary {
  cursor: pointer;
  color: var(--df-accent);
}
.df-passed p {
  font-size: 11px;
  margin: 12px 0;
}
.df-passed b {
  font-weight: 500;
}

.df-office-frame {
  width: 100%;
  height: 100%;
  border: 0;
  background: #fff;
}
.df-preview-message {
  padding: 25px;
  color: var(--df-muted);
  font-size: 12px;
}
.df-print-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.df-print-toolbar {
  padding: 8px 12px;
  border-bottom: 1px solid var(--df-line);
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.df-print-toolbar > div {
  display: flex;
  gap: 8px;
  align-items: center;
}
.df-print-toolbar button,
.df-print-toolbar select {
  font-size: 11px;
  padding: 5px 8px;
}
.df-print-toolbar button[aria-pressed="true"] {
  color: var(--df-accent);
  border-color: var(--df-accent);
}
.df-print-toolbar span {
  font-size: 11px;
  color: var(--df-muted);
}
.df-print-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 16px;
  background: #e9ebeb;
}
.df-print-pages figure {
  margin: 0 0 18px;
}
.df-print-pages figcaption {
  margin-bottom: 6px;
  color: var(--df-muted);
  font-size: 11px;
}
.df-print-scroll img {
  display: block;
  max-width: none;
  width: 100%;
  height: auto;
  background: white;
  box-shadow: 0 1px 6px #0002;
}
.df-text-preview {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.df-app select {
  font: inherit;
  color: var(--df-text);
  background: var(--df-paper);
  border: 1px solid var(--df-line);
  border-radius: 5px;
  padding: 9px 10px;
  max-width: 100%;
}
.df-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
.df-project-app {
  min-height: 680px;
}
.df-project-sidebar {
  width: 232px;
}
.df-project-search {
  display: block;
  margin-bottom: 23px;
}
.df-project-search input {
  width: 100%;
  border: 1px solid var(--df-line);
  background: var(--df-paper);
  color: var(--df-text);
  border-radius: 5px;
  padding: 9px;
  font-size: 12px;
}
.df-project-main {
  min-width: 0;
}
.df-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 9px;
  flex-wrap: wrap;
}
.df-project-tabs {
  display: flex;
  align-items: stretch;
  gap: 2px;
  border-bottom: 1px solid var(--df-line);
  margin-bottom: 24px;
  overflow-x: auto;
  padding-bottom: 6px;
}
.df-project-tabs > button {
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  border-radius: 0;
  padding: 11px 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex-shrink: 0;
  text-align: left;
  min-width: 102px;
}
.df-project-tabs > button:first-child {
  min-width: 84px;
  justify-content: center;
}
.df-project-tabs > button.active {
  color: var(--df-accent);
  border-bottom-color: var(--df-accent);
  background: var(--df-paper);
}
.df-project-tabs small {
  font-size: 10px;
  color: var(--df-muted);
}
.df-state {
  font-size: 11px;
  font-weight: 400;
  color: var(--df-muted);
  white-space: nowrap;
}
.df-state-in_progress,
.df-material-state-preparing {
  color: var(--df-accent);
}
.df-state-completed,
.df-material-state-done {
  color: #327555;
}
.df-state-submitted,
.df-material-state-submitted {
  color: #8a6932;
}
.df-project-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin: 10px 0 25px;
}
.df-project-metrics > div {
  display: flex;
  flex-direction: column;
  border-left: 2px solid var(--df-line);
  padding: 6px 15px;
  gap: 5px;
}
.df-project-metrics b {
  font-size: 27px;
  font-weight: 500;
  line-height: 1.3;
}
.df-project-metrics b small {
  font-size: 13px;
  color: var(--df-muted);
  margin-left: 5px;
}
.df-project-metrics span {
  font-size: 12px;
  color: var(--df-muted);
}
.df-project-stage-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}
.df-app .df-stage-card {
  text-align: left;
  padding: 22px;
  min-width: 0;
}
.df-app .df-stage-card:hover {
  background: var(--df-paper);
  border-color: var(--df-accent);
}
.df-stage-card h2 {
  font-size: 17px;
  margin: 19px 0 8px;
}
.df-stage-card p {
  font-size: 12px;
  color: var(--df-muted);
  min-height: 38px;
}
.df-stage-card .df-section-head > small {
  color: var(--df-muted);
  font-size: 10px;
}
.df-stage-card footer {
  margin-top: 20px;
  padding-top: 13px;
  border-top: 1px solid var(--df-line);
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 11px;
  color: var(--df-muted);
}
.df-stage-card footer > span:last-child {
  color: var(--df-accent);
}
.df-project-hint {
  margin-top: 22px;
}
.df-project-hint h2 {
  font-size: 16px;
}
.df-project-hint p {
  color: var(--df-muted);
  font-size: 13px;
  max-width: 780px;
}
.df-migration-note {
  margin: 0 0 22px;
  font-size: 12px;
}
.df-stage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 22px;
  margin-bottom: 16px;
}
.df-stage-header h2 {
  margin: 4px 0 8px;
}
.df-stage-header p {
  margin: 5px 0;
  font-size: 13px;
}
.df-stage-header > .df-actions {
  flex-shrink: 0;
  flex-direction: column;
  align-items: stretch;
}
.df-stage-forms,
.df-material-panel,
.df-stage-details {
  margin-bottom: 18px;
}
.df-stage-forms .df-section-head p,
.df-material-panel .df-section-head p {
  margin: 6px 0 0;
  max-width: 600px;
  font-size: 12px;
}
.df-stage-forms .df-section-head h2,
.df-material-panel .df-section-head h2 {
  margin: 0;
}
.df-material-panel h2 small {
  margin-left: 8px;
  font-size: 12px;
  color: var(--df-muted);
  font-weight: 400;
}
.df-project-forms {
  margin-top: 18px;
}
.df-project-forms > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 0;
  gap: 16px;
  border-top: 1px solid var(--df-line);
}
.df-project-forms small {
  display: block;
  color: var(--df-muted);
  margin-top: 5px;
  font-size: 11px;
}
.df-empty {
  padding: 15px 0 0;
  color: var(--df-muted);
  font-size: 13px;
}
.df-materials {
  margin-top: 22px;
}
.df-material-row {
  display: grid;
  grid-template-columns: minmax(140px, 1fr) minmax(140px, 1fr) auto;
  align-items: start;
  gap: 18px;
  padding: 21px 0;
  border-top: 1px solid var(--df-line);
}
.df-material-name b {
  display: block;
  font-size: 14px;
  margin-bottom: 6px;
}
.df-material-name > .df-state {
  margin-right: 10px;
}
.df-required-tag {
  font-size: 10px;
  border: 1px solid var(--df-line);
  padding: 1px 5px;
  margin-right: 8px;
  border-radius: 3px;
}
.df-material-name > small {
  display: block;
  margin-top: 6px;
  font-size: 11px;
  color: var(--df-muted);
}
.df-material-name p {
  font-size: 12px;
  color: var(--df-muted);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  margin-bottom: 0;
}
.df-material-files {
  min-width: 0;
  font-size: 12px;
  padding-top: 4px;
}
.df-material-files summary {
  cursor: pointer;
  overflow-wrap: anywhere;
}
.df-material-file {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  margin-top: 14px;
}
.df-material-file > div {
  flex: 1;
  min-width: 0;
}
.df-material-file b {
  font-size: 11px;
  font-weight: 400;
  overflow-wrap: anywhere;
}
.df-material-file small {
  font-size: 10px;
  color: var(--df-muted);
  display: block;
  margin-top: 4px;
}
.df-app .df-material-file button {
  padding: 3px 6px;
  font-size: 11px;
}
.df-stage-tail {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 2px 0 25px;
}
.df-stage-tail p {
  font-size: 12px;
  color: var(--df-muted);
}
.df-stage-details dl {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  margin: 0;
}
.df-stage-details dt {
  font-size: 11px;
  color: var(--df-muted);
}
.df-stage-details dd {
  margin: 5px 0 0;
  overflow-wrap: anywhere;
}
.df-stage-details p {
  white-space: pre-wrap;
  border-top: 1px solid var(--df-line);
  padding-top: 15px;
  margin-bottom: 0;
  font-size: 13px;
}
.df-app a {
  color: var(--df-accent);
}
.df-stage-warning {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}
.df-stage-warning p {
  margin-bottom: 0;
  font-size: 12px;
}
.df-project-welcome {
  margin-top: 25px;
  padding: 36px;
}
.df-project-welcome > p {
  color: var(--df-muted);
}
.df-welcome-stages {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 25px;
  margin: 35px 0;
}
.df-welcome-stages small {
  display: block;
  font-size: 10px;
  margin-bottom: 4px;
  color: var(--df-muted);
}
.df-dialog-backdrop {
  position: fixed;
  z-index: 1100;
  inset: 0;
  background: #102b355e;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.df-app .df-dialog {
  width: 760px;
  max-width: 100%;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  margin: 0;
  padding: 26px;
  box-shadow: 0 15px 55px #142b3a25;
}
.df-dialog .df-field {
  margin-bottom: 19px;
}
.df-dialog .df-section-head {
  margin-bottom: 24px;
}
.df-dialog .df-section-head h2 {
  font-size: 18px;
  overflow-wrap: anywhere;
}
.df-dialog .df-actions {
  margin-top: 20px;
}
.df-dialog .df-checkbox {
  display: flex;
  gap: 9px;
  align-items: flex-start;
  font-size: 13px;
  margin-bottom: 20px;
}
.df-dialog .df-checkbox input {
  flex-shrink: 0;
  margin-top: 4px;
}
.df-attachment-preview {
  height: min(68vh, 800px);
  overflow: auto;
}
.df-attachment-preview iframe {
  border: 0;
  width: 100%;
  height: 100%;
}
.df-attachment-preview > img {
  max-width: 100%;
  height: auto;
}
.df-project-profile > .df-fields {
  margin-top: 26px;
}
.df-app .df-embedded-editor {
  height: auto;
  min-height: 500px;
  margin: 0;
  display: block;
}
.df-embedded-editor > .df-main {
  padding: 0;
  overflow: visible;
}
.df-editor-context {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 24px;
}
.df-editor-context > span {
  color: var(--df-muted);
  font-size: 12px;
  flex: 1;
}
.df-editor-context .df-actions {
  font-size: 12px;
}
.df-compare {
  max-height: 55vh;
  overflow-y: auto;
}
.df-compare > label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 0;
  border-top: 1px solid var(--df-line);
}
.df-compare > label > div {
  flex: 1;
  min-width: 0;
}
.df-compare-values {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}
.df-compare-values p {
  white-space: pre-wrap;
  font-size: 12px;
  max-height: 180px;
  overflow-y: auto;
  overflow-wrap: anywhere;
  margin-bottom: 0;
}
.df-compare-values small {
  display: block;
  color: var(--df-muted);
  margin-bottom: 5px;
}
@media (max-width: 1250px) {
  .df-project-sidebar {
    width: 200px;
  }
  .df-project-stage-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .df-material-row {
    grid-template-columns: minmax(150px, 1fr) minmax(170px, 1fr);
  }
  .df-material-row > .df-actions {
    grid-column: 1 / -1;
    justify-content: flex-start;
  }
}
@media (max-width: 800px) {
  .df-project-app {
    flex-direction: column;
    height: auto;
    min-height: 100%;
  }
  .df-project-sidebar {
    width: 100%;
    border-right: 0;
    border-bottom: 1px solid var(--df-line);
    padding: 16px;
  }
  .df-project-sidebar .df-brand {
    font-size: 18px;
  }
  .df-project-sidebar .df-brand span {
    display: inline;
    margin-left: 10px;
  }
  .df-project-sidebar .df-new {
    margin: 15px 0;
  }
  .df-project-sidebar .df-sidebar-foot {
    display: none;
  }
  .df-project-sidebar nav {
    display: flex;
    overflow-x: auto;
    max-height: 100px;
    gap: 10px;
  }
  .df-project-sidebar nav > button {
    min-width: 180px;
    margin: 0;
  }
  .df-project-search {
    margin-bottom: 12px;
  }
  .df-project-metrics {
    gap: 8px;
  }
  .df-project-metrics > div {
    padding: 4px 8px;
  }
  .df-project-metrics b {
    font-size: 23px;
  }
  .df-project-stage-grid {
    gap: 12px;
  }
  .df-app .df-stage-card {
    padding: 16px;
  }
  .df-stage-header,
  .df-project-forms > div {
    align-items: flex-start;
    flex-direction: column;
  }
  .df-stage-header > .df-actions {
    flex-direction: row;
  }
  .df-material-row {
    grid-template-columns: 1fr;
  }
  .df-stage-details dl {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .df-compare-values {
    grid-template-columns: 1fr;
  }
  .df-app .df-dialog {
    padding: 18px;
  }
}
.df-review-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}
.df-review-entry h2 {
  margin: 0;
}
.df-review-entry p {
  margin-bottom: 0;
}
.df-review-entry button {
  flex-shrink: 0;
}
.df-dialog:has(.df-response-review) {
  width: min(1000px, calc(100vw - 48px));
}
.df-response-review fieldset {
  border: 0;
  padding: 0;
  margin: 0;
  min-width: 0;
}
.df-response-review .df-field {
  margin: 18px 0;
}
.df-response-review .df-field input[type="file"] {
  width: 100%;
}
.df-review-history {
  border-top: 1px solid var(--df-line);
  margin-top: 28px;
  padding-top: 20px;
}
.df-review-records {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.df-review-records button[aria-pressed="true"] {
  border-color: var(--df-accent);
}
.df-review-report {
  overflow-x: auto;
  line-height: 1.85;
  margin-top: 20px;
  overflow-wrap: anywhere;
}
.df-review-report table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.df-review-report th,
.df-review-report td {
  border: 1px solid var(--df-line);
  padding: 8px;
  vertical-align: top;
  text-align: left;
}
.df-review-report pre {
  white-space: pre-wrap;
}
.df-review-files {
  line-height: 1.8;
  overflow-wrap: anywhere;
}
@media (max-width: 800px) {
  .df-review-entry {
    align-items: flex-start;
    flex-direction: column;
    gap: 16px;
  }
}
.df-app.df-three-column {
  display: grid;
  grid-template-columns: var(--df-left-width, 190px) minmax(440px, 1fr) var(
      --df-right-width,
      clamp(
        300px,
        var(--df-dock-size, 500px),
        calc(100% - var(--df-left-width, 190px) - 440px)
      )
    );
  min-height: 640px;
  overflow: hidden;
}
.df-three-column .df-project-sidebar {
  width: auto;
  min-width: 0;
  padding: 24px 16px;
  overflow-y: auto;
}
.df-three-column .df-project-main {
  padding: 24px;
  overflow-y: auto;
  min-height: 0;
}
.df-three-column .df-header {
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 18px;
}
.df-three-column .df-header h1 {
  font-size: 22px;
}
.df-three-column .df-project-tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  overflow: visible;
  gap: 4px;
}
.df-three-column .df-project-tabs > button {
  min-width: 0;
  padding: 9px 6px;
  font-size: 12px;
}
.df-three-column .df-project-tabs > button:first-child {
  grid-column: 1/-1;
  padding: 4px;
  text-align: left;
}
.df-three-column .df-project-tabs .df-state {
  font-size: 10px;
}
.df-three-column .df-fields {
  grid-template-columns: 1fr;
}
.df-three-column .df-edit-layout {
  grid-template-columns: minmax(0, 1fr);
}
.df-three-column .df-paper {
  padding: 20px;
}
.df-right-workspace {
  border-left: 1px solid var(--df-line);
  background: var(--df-paper);
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}
.df-right-workspace > header {
  padding: 22px 20px 14px;
  border-bottom: 1px solid var(--df-line);
  display: flex;
  gap: 12px;
  justify-content: space-between;
  align-items: center;
}
.df-right-workspace h2 {
  font-size: 16px;
  margin: 4px 0;
}
.df-dock-tabs {
  display: flex;
  gap: 4px;
}
.df-dock-tabs button {
  padding: 6px 12px;
  font-size: 12px;
}
.df-dock-tabs button[aria-selected="true"] {
  color: var(--df-accent);
  border-color: var(--df-accent);
}
.df-right-body {
  padding: 16px 20px;
  overflow-y: auto;
  min-height: 0;
  flex: 1;
}
.df-right-body[hidden] {
  display: none;
}
.df-right-body:has(.df-project-chat) {
  display: flex;
  flex-direction: column;
}
.df-right-body[hidden]:has(.df-project-chat) {
  display: none;
}
.df-project-chat {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
}
.df-project-chat > .df-muted {
  font-size: 11px;
  margin: 0 0 14px;
}
.df-chat-messages {
  flex: 1;
  min-height: 100px;
  overflow-y: auto;
  padding-bottom: 14px;
}
.df-chat-welcome {
  margin: 20px 0;
  color: var(--df-muted);
  font-size: 12px;
}
.df-chat-welcome h3 {
  font-size: 14px;
  color: var(--df-text);
}
.df-chat-welcome button {
  display: block;
  width: 100%;
  margin: 8px 0;
  text-align: left;
  padding: 10px;
  font-size: 12px;
}
.df-chat-turn {
  margin-bottom: 24px;
  font-size: 13px;
  overflow-wrap: anywhere;
}
.df-chat-question {
  margin: 12px 0;
  padding: 12px;
  background: var(--df-bg);
  border-radius: 6px;
}
.df-chat-question p {
  white-space: pre-wrap;
  margin: 4px 0;
}
.df-chat-answer {
  line-height: 1.85;
}
.df-chat-answer table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.df-chat-answer th,
.df-chat-answer td {
  border: 1px solid var(--df-line);
  padding: 6px;
}
.df-chat-composer {
  border-top: 1px solid var(--df-line);
  padding-top: 12px;
}
.df-chat-composer textarea {
  width: 100%;
  resize: vertical;
  min-height: 80px;
  max-height: 180px;
  border: 1px solid var(--df-line);
  border-radius: 5px;
  padding: 10px;
  color: var(--df-text);
  background: var(--df-bg);
  font: inherit;
}
.df-chat-composer .df-actions {
  margin-top: 8px;
}
.df-chat-context {
  margin-bottom: 8px;
  overflow-wrap: anywhere;
}
.df-open-review {
  margin-top: 12px;
  width: 100%;
}
.df-dock-file-list {
  font-size: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--df-line);
}
.df-dock-file-list summary {
  cursor: pointer;
  padding: 4px 0;
}
.df-dock-file {
  display: block;
  width: 100%;
  text-align: left;
  overflow-wrap: anywhere;
  margin: 5px 0;
  font-size: 11px !important;
  padding: 8px !important;
}
.df-dock-preview h3 {
  font-size: 12px;
  overflow-wrap: anywhere;
  padding: 10px 0;
}
.df-dock-preview .df-print-scroll {
  height: calc(100vh - 330px);
  min-height: 360px;
}
.df-dock-preview .df-print-toolbar {
  flex-wrap: wrap;
  font-size: 10px;
  padding: 8px;
}
.df-dock-preview .df-print-toolbar button {
  font-size: 10px;
  padding: 5px;
}
.df-dock-office {
  height: max(360px, calc(100vh - 330px));
  overflow: hidden;
  border: 1px solid var(--df-line);
}
.df-dock-preview .df-attachment-preview {
  height: calc(100vh - 330px);
}
.df-dock-ask {
  width: 100%;
  margin-top: 12px;
}
.df-dock-empty {
  color: var(--df-muted);
  margin: 80px 20px;
  text-align: center;
  font-size: 12px;
}
@media (max-width: 1050px) {
  .df-app.df-three-column {
    grid-template-columns: var(--df-left-width, 150px) minmax(380px, 1fr) var(
        --df-right-width,
        clamp(
          300px,
          var(--df-dock-size, 500px),
          calc(100% - var(--df-left-width, 150px) - 380px)
        )
      );
  }
  .df-three-column .df-project-main {
    padding: 18px;
  }
  .df-right-body,
  .df-right-workspace > header {
    padding: 14px;
  }
}
@media (max-width: 850px) {
  .df-app.df-three-column {
    grid-template-columns: var(--df-left-width, 130px) minmax(0, 1fr);
    height: auto;
    max-height: 100%;
    overflow: auto;
  }
  .df-right-workspace {
    grid-column: 2;
    min-height: 550px;
    overflow: visible;
  }
  .df-three-column .df-project-sidebar {
    grid-row: 1/3;
  }
}
.df-dock-file-row {
  display: flex;
  align-items: center;
  gap: 4px;
}
.df-dock-file-row > .df-dock-file {
  flex: 1;
  min-width: 0;
}
.df-dock-file-row > button:last-child {
  border: 0;
  padding: 5px;
  background: transparent;
}

.df-project-app.df-left-collapsed {
  --df-left-width: 44px;
}
.df-project-app.df-right-collapsed {
  --df-right-width: 44px;
}
.df-app .df-pane-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  align-self: flex-end;
  flex-shrink: 0;
  padding: 3px 7px;
  font-size: 11px;
  color: var(--df-muted);
  background: transparent;
}
.df-pane-toggle > span:first-child {
  font-size: 20px;
  line-height: 1;
}
.df-project-sidebar > .df-pane-toggle {
  margin: -12px -4px 12px 0;
}
.df-right-workspace > .df-pane-toggle {
  margin: 8px 12px 0;
  align-self: flex-start;
}
.df-project-app .df-pane-collapsed {
  width: 44px;
  padding: 12px 4px;
  display: flex;
  overflow: hidden;
}
.df-project-app .df-pane-collapsed > :not(.df-pane-toggle) {
  display: none;
}
.df-project-app .df-pane-collapsed > .df-pane-toggle {
  margin: 0;
  width: 35px;
  padding: 8px 4px;
  flex-direction: column;
  align-self: center;
}
.df-pane-collapsed > .df-pane-toggle > span:last-child {
  writing-mode: vertical-rl;
  letter-spacing: 3px;
  margin-top: 6px;
}
.df-right-workspace.df-pane-collapsed {
  padding-top: 64px;
}
@media (max-width: 850px) {
  .df-three-column .df-right-workspace.df-pane-collapsed {
    width: auto;
    min-height: 0;
    padding: 6px 12px;
    border-top: 1px solid var(--df-line);
  }
  .df-three-column .df-right-workspace.df-pane-collapsed > .df-pane-toggle {
    width: auto;
    flex-direction: row;
    align-self: flex-start;
  }
  .df-right-workspace.df-pane-collapsed > .df-pane-toggle > span:last-child {
    writing-mode: horizontal-tb;
    letter-spacing: 0;
    margin: 0;
  }
}

.df-right-workspace {
  position: relative;
}
.df-dock-resizer {
  position: absolute;
  inset: 0 auto 0 0;
  width: 10px;
  z-index: 4;
  cursor: col-resize;
  touch-action: none;
  outline-offset: -2px;
}
.df-dock-resizer::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 3px;
  background: transparent;
}
.df-dock-resizer:hover::after,
.df-dock-resizer:focus-visible::after,
.df-resizing > .df-dock-resizer::after {
  background: var(--df-accent);
}
.df-three-column:has(.df-resizing) {
  cursor: col-resize;
  user-select: none;
}
@media (max-width: 850px) {
  .df-dock-resizer {
    display: none;
  }
}

.df-plan-reference {
  margin: 22px 0;
  padding: 16px 0;
  border-top: 1px solid var(--df-line);
  border-bottom: 1px solid var(--df-line);
}
.df-plan-reference details > summary {
  cursor: pointer;
  font-size: 12px;
  color: var(--df-muted);
}
.df-plan-reference dt {
  font-weight: 600;
  margin-top: 12px;
}
.df-plan-reference dd {
  margin: 4px 0 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.df-field-help {
  font-family: inherit !important;
  font-size: 11px !important;
  line-height: 1.6;
  color: var(--df-muted);
}
`;var Ge=window.QwenPaw,x=Ge.host.React,{useState:ce,useEffect:ut}=x,at={running:"\u6B63\u5728\u6838\u67E5",completed:"\u6838\u67E5\u5B8C\u6210",failed:"\u672A\u5B8C\u6210",interrupted:"\u5DF2\u4E2D\u65AD"},nt=".doc,.docx,.pdf,.xls,.xlsx,.png,.jpg,.jpeg";function Oe({project:n,services:g,onChanged:f}){let{request:h,download:u,time:j}=g,[p,N]=ce(null),[r,z]=ce(""),[c,M]=ce(null),[F,J]=ce([]),[d,T]=ce(""),[D,E]=ce(""),[L,Q]=ce(!1),[$,b]=ce(""),[w,G]=ce(0);ut(()=>{let s=!0,A,v=!1;async function I(){try{let te=await h(`/projects/${n.id}/response-reviews`);if(!s)return;N(te),b("");let K=te.records.some(O=>O.status==="running");v&&!K&&f(),v=K,K&&(A=setTimeout(I,3e3))}catch(te){s&&b(te.message)}}return I(),()=>{s=!1,clearTimeout(A)}},[n.id,w]);let W=p?.records.some(s=>s.status==="running"),P=p?.records.find(s=>s.id===D)||p?.records[0],y=Ge.host.ReactMarkdown;async function S(s){s.preventDefault(),b(""),Q(!0);try{let A=new FormData;r?A.set("reference_id",r):c&&A.set("reference",c);for(let I of F)A.append("responses",I);A.set("focus",d);let v=await h(`/projects/${n.id}/response-reviews`,{method:"POST",body:A});E(v.id),N(I=>({...I,records:[v,...I?.records||[]]})),G(I=>I+1)}catch(A){b(A.message)}finally{Q(!1)}}return x.createElement("div",{className:"df-response-review"},x.createElement("p",{className:"df-muted"},"\u5BF9\u7167\u8C08\u5224\u6587\u4EF6\uFF0C\u9010\u5BB6\u68C0\u67E5\u8D44\u8D28\u3001\u6280\u672F\u54CD\u5E94\u3001\u62A5\u4EF7\u3001\u65E5\u671F\u4E0E\u7B7E\u7AE0\u9644\u4EF6\u3002\u6838\u67E5\u610F\u89C1\u4F9B\u7ECF\u529E\u4EBA\u548C\u4E13\u5BB6\u590D\u6838\u3002"),$&&x.createElement("div",{className:"df-alert error",role:"alert"},$,x.createElement("button",{onClick:()=>G(s=>s+1)},"\u91CD\u65B0\u52A0\u8F7D")),p?x.createElement(x.Fragment,null,x.createElement("form",{onSubmit:S},x.createElement("fieldset",{disabled:L||W},x.createElement("label",{className:"df-field"},x.createElement("span",null,"\u6838\u67E5\u4F9D\u636E"),x.createElement("select",{"aria-label":"\u6838\u67E5\u4F9D\u636E",value:r,onChange:s=>{z(s.target.value),M(null)}},x.createElement("option",{value:""},"\u4E0A\u4F20\u6B63\u5F0F\u8C08\u5224\u6587\u4EF6"),p.references.map(s=>x.createElement("option",{key:s.id,value:s.id},s.label)))),!r&&x.createElement("label",{className:"df-field"},x.createElement("span",null,"\u6B63\u5F0F\u8C08\u5224\u6587\u4EF6"),x.createElement("input",{"aria-label":"\u4E0A\u4F20\u6838\u67E5\u4F9D\u636E",type:"file",accept:nt,required:!0,onChange:s=>M(s.target.files[0]||null)})),x.createElement("label",{className:"df-field"},x.createElement("span",null,"\u5404\u5355\u4F4D\u54CD\u5E94\u6750\u6599"),x.createElement("input",{"aria-label":"\u4E0A\u4F20\u54CD\u5E94\u6750\u6599",type:"file",multiple:!0,required:!0,accept:nt,onChange:s=>J([...s.target.files])})),F.length>0&&x.createElement("ul",{className:"df-review-files"},F.map((s,A)=>x.createElement("li",{key:A},s.name))),x.createElement("p",{className:"df-muted"},"\u652F\u6301 Word\u3001PDF\u3001Excel \u548C\u56FE\u7247\uFF1B\u53EF\u4E00\u6B21\u9009\u62E9\u591A\u5BB6\u6750\u6599\u3002\u6BCF\u4EFD\u4E0D\u8D85\u8FC7 15 MB\uFF0C\u6BCF\u6B21\u6700\u591A 20 \u4EFD\u3001\u5408\u8BA1 100 MB\u3002\u538B\u7F29\u5305\u8BF7\u5148\u89E3\u538B\u3002"),x.createElement("label",{className:"df-field"},x.createElement("span",null,"\u8865\u5145\u5173\u6CE8\u70B9\uFF08\u9009\u586B\uFF09"),x.createElement("textarea",{"aria-label":"\u8865\u5145\u6838\u67E5\u5173\u6CE8\u70B9",rows:3,maxLength:3e3,value:d,onChange:s=>T(s.target.value),placeholder:"\u4F8B\u5982\uFF1A\u91CD\u70B9\u6838\u5BF9\u62A5\u4EF7\u5927\u5C0F\u5199\u3001\u6210\u679C\u4EA4\u4ED8\u65F6\u95F4\u548C\u8D44\u8D28\u6709\u6548\u671F"})),x.createElement("div",{className:"df-actions"},x.createElement("button",{className:"df-primary",disabled:L||W||!(r||c)||!F.length},L?"\u6B63\u5728\u63D0\u4EA4\u2026":"\u5F00\u59CB\u6838\u67E5"),x.createElement("span",{className:"df-muted"},"\u4F7F\u7528\u201C\u54CD\u5E94\u6587\u4EF6\u6838\u67E5\u201D\u667A\u80FD\u4F53\uFF0C\u6CBF\u7528\u8F6F\u4EF6\u4E2D\u7684\u6A21\u578B\u914D\u7F6E\u3002")))),p.records.length>0&&x.createElement("section",{className:"df-review-history"},x.createElement("div",{className:"df-section-head"},x.createElement("h3",null,"\u6838\u67E5\u8BB0\u5F55"),x.createElement("button",{onClick:()=>G(s=>s+1)},"\u5237\u65B0\u8BB0\u5F55")),x.createElement("div",{className:"df-review-records"},p.records.map(s=>x.createElement("button",{key:s.id,"aria-pressed":P?.id===s.id,onClick:()=>E(s.id)},j(s.created_at)," \xB7 ",at[s.status]))),P&&x.createElement("article",{"aria-label":"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5\u7ED3\u679C"},x.createElement("div",{className:"df-section-head"},x.createElement("div",null,x.createElement("b",null,at[P.status]),x.createElement("p",{className:"df-muted"},"\u57FA\u4E8E\u9879\u76EE\u4FEE\u8BA2 ",P.project_revision," \xB7"," ",P.files.length," \u4EFD\u6750\u6599\uFF1B\u540E\u7EED\u6750\u6599\u4FEE\u6539\u8BF7\u91CD\u65B0\u6838\u67E5\u3002")),P.status==="completed"&&x.createElement("button",{onClick:async()=>{try{await u(`/projects/${n.id}/response-reviews/${P.id}/report`,`${n.name}_\u54CD\u5E94\u6587\u4EF6\u6838\u67E5\u8BB0\u5F55_${P.id.slice(0,8)}.md`)}catch(s){b(s.message)}}},"\u4E0B\u8F7D\u6838\u67E5\u8BB0\u5F55")),x.createElement("details",null,x.createElement("summary",null,"\u672C\u6B21\u6838\u67E5\u6750\u6599\u4E0E\u5173\u6CE8\u70B9"),x.createElement("ul",null,P.files.map((s,A)=>x.createElement("li",{key:A},s.role,"\uFF1A",s.name))),x.createElement("p",null,P.focus||"\u65E0\u8865\u5145\u5173\u6CE8\u70B9")),P.status==="running"&&x.createElement("p",{role:"status",className:"df-alert"},"\u6B63\u5728\u8BFB\u53D6\u5E76\u6838\u67E5\u6750\u6599\uFF0C\u53EF\u5173\u95ED\u6B64\u7A97\u53E3\uFF0C\u7A0D\u540E\u56DE\u5230\u672C\u9879\u76EE\u67E5\u770B\u7ED3\u679C\u3002"),P.error&&x.createElement("p",{role:"alert",className:"df-alert error"},P.error),P.report&&x.createElement("div",{className:"df-review-report"},y?x.createElement(y,{remarkPlugins:Ge.host.remarkGfm?[Ge.host.remarkGfm]:[],components:{a:({children:s})=>x.createElement("span",null,s),img:()=>null}},P.report):x.createElement("div",{style:{whiteSpace:"pre-wrap"}},P.report))))):x.createElement("p",{role:"status"},"\u6B63\u5728\u8BFB\u53D6\u6838\u67E5\u8BB0\u5F55\u2026"))}var Pe=window.QwenPaw,l=Pe.host.React,{useState:he,useEffect:He,useRef:rt}=l;function gt(n,g,f){return{artifact:{id:g.id+f.name,title:f.name,source:"generated",extension:f.name.endsWith(".xlsx")?"xlsx":"docx",mimeType:f.name.endsWith(".xlsx")?"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":"application/vnd.openxmlformats-officedocument.wordprocessingml.document",binaryUrl:f.preview_url,printUrl:`/document-forms/cases/${n.case_id}/print/${g.id}/${encodeURIComponent(f.name)}`,agentId:Pe.host.getSelectedAgentId?.(),createdAt:Date.parse(g.created_at)},reference:{case_id:n.case_id,generation_id:g.id,name:f.name}}}function xt({project:n,stageId:g,selection:f,services:h}){let{request:u,json:j,time:p}=h,[N,r]=he([]),[z,c]=he(""),[M,F]=he(!1),[J,d]=he(""),[T,D]=he(0),E=rt(null);He(()=>{let b=!0,w;async function G(){try{let W=await u(`/projects/${n.id}/assistant`);if(!b)return;r(W.messages),d(""),W.messages.some(P=>P.status==="running")&&(w=setTimeout(G,2500))}catch(W){b&&d(W.message)}}return G(),()=>{b=!1,clearTimeout(w)}},[n.id,T]),He(()=>{E.current?.scrollIntoView?.({block:"nearest"})},[N.length,N.at(-1)?.status]);let L=M||N.some(b=>b.status==="running"),Q=Pe.host.ReactMarkdown;async function $(b){if(b.preventDefault(),!(!z.trim()||L)){F(!0),d("");try{let w=await u(`/projects/${n.id}/assistant`,j({message:z.trim(),stage_id:g||"overview",file:f?.reference||{}}));r(G=>[...G,w]),c(""),D(G=>G+1)}catch(w){d(w.message)}finally{F(!1)}}}return l.createElement("section",{className:"df-project-chat","aria-label":"\u9879\u76EE\u667A\u80FD\u4F53\u95EE\u7B54"},l.createElement("p",{className:"df-muted"},"\u7ED3\u5408\u5DF2\u4FDD\u5B58\u7684\u9879\u76EE\u8D44\u6599\u548C\u5F53\u524D\u9884\u89C8\u56DE\u7B54\uFF0C\u95EE\u7B54\u968F\u9879\u76EE\u4FDD\u7559\u3002"),l.createElement("div",{className:"df-chat-messages","aria-live":"polite"},!N.length&&l.createElement("div",{className:"df-chat-welcome"},l.createElement("h3",null,"\u56F4\u7ED5\u5F53\u524D\u9879\u76EE\u63D0\u95EE"),l.createElement("p",null,"\u53EF\u4EE5\u68B3\u7406\u672C\u9636\u6BB5\u8FD8\u9700\u51C6\u5907\u7684\u6750\u6599\uFF0C\u6216\u5BF9\u7167\u9884\u89C8\u6587\u4EF6\u6838\u5B9E\u5185\u5BB9\u3002"),["\u672C\u9636\u6BB5\u8FD8\u9700\u8981\u51C6\u5907\u54EA\u4E9B\u6750\u6599\uFF1F","\u5E2E\u6211\u6838\u5BF9\u5F53\u524D\u6587\u4EF6\u4E2D\u7684\u65E5\u671F\u548C\u91D1\u989D\u3002"].map(b=>l.createElement("button",{key:b,onClick:()=>c(b)},b))),N.map(b=>l.createElement("article",{className:"df-chat-turn",key:b.id},l.createElement("div",{className:"df-chat-question"},l.createElement("small",null,"\u6211 \xB7 ",p(b.created_at)),l.createElement("p",null,b.message),b.file_name&&l.createElement("small",null,"\u53C2\u8003\u6587\u4EF6\uFF1A",b.file_name)),b.reply&&l.createElement("div",{className:"df-chat-answer"},l.createElement("small",null,"\u9879\u76EE\u52A9\u624B"),Q?l.createElement(Q,{remarkPlugins:Pe.host.remarkGfm?[Pe.host.remarkGfm]:[],components:{img:()=>null,a:({children:w})=>l.createElement("span",null,w)}},b.reply):l.createElement("p",{style:{whiteSpace:"pre-wrap"}},b.reply)),b.status==="running"&&l.createElement("p",{role:"status",className:"df-muted"},"\u6B63\u5728\u7ED3\u5408\u9879\u76EE\u8D44\u6599\u6574\u7406\u56DE\u7B54\u2026"),b.error&&l.createElement("p",{role:"alert",className:"df-alert error"},b.error))),l.createElement("div",{ref:E})),J&&l.createElement("p",{role:"alert",className:"df-alert error"},J,l.createElement("button",{onClick:()=>D(b=>b+1)},"\u91CD\u65B0\u52A0\u8F7D")),l.createElement("form",{className:"df-chat-composer",onSubmit:$},f&&l.createElement("small",{className:"df-chat-context"},"\u53C2\u8003\u6587\u4EF6\uFF1A",f.artifact.title),l.createElement("textarea",{"aria-label":"\u5411\u9879\u76EE\u667A\u80FD\u4F53\u63D0\u95EE",placeholder:"\u8F93\u5165\u5F53\u524D\u9879\u76EE\u7684\u95EE\u9898\u2026",rows:3,maxLength:4e3,value:z,onChange:b=>c(b.target.value)}),l.createElement("div",{className:"df-actions"},l.createElement("button",{className:"df-primary",disabled:L||!z.trim()},L?"\u6B63\u5728\u56DE\u7B54\u2026":"\u53D1\u9001\u95EE\u9898"))))}function Je({collapsed:n=!1,width:g,maxWidth:f,onResize:h,onToggle:u,project:j,stageId:p,services:N,mode:r,onMode:z,selection:c,onSelect:M,attachment:F,AttachmentPreview:J,onChanged:d,dirty:T=!1}){let D=rt(null),[E,L]=he(!1),Q=()=>{D.current=null,L(!1)},[$,b]=he(null),[w,G]=he("");async function W(y,S){try{G(""),await N.download(y,S)}catch(s){G(s.message)}}He(()=>{let y=!0;return(Pe.workspace?.loadPreview?Pe.workspace.loadPreview():Promise.resolve(le)).then(S=>y&&b(()=>S)).catch(()=>y&&b(()=>le)),()=>{y=!1}},[]);let P=j.forms.flatMap(y=>y.generations.flatMap(S=>p&&p!=="overview"&&p!=="profile"&&(S.stage_id||y.original_stage_id||y.stage_id)!==p?[]:[{form:y,generation:S}]));return l.createElement("aside",{className:"df-right-workspace"+(n?" df-pane-collapsed":"")+(E?" df-resizing":""),"aria-label":"\u9879\u76EE\u667A\u80FD\u4F53\u4E0E\u6587\u4EF6\u9884\u89C8"},l.createElement("div",{className:"df-dock-resizer",role:"separator","aria-label":"\u8C03\u6574\u95EE\u7B54\u4E0E\u9884\u89C8\u680F\u5BBD\u5EA6","aria-orientation":"vertical","aria-valuemin":300,"aria-valuemax":f,"aria-valuenow":g,"aria-valuetext":g+" \u50CF\u7D20",tabIndex:0,title:"\u5DE6\u53F3\u62D6\u52A8\u8C03\u6574\u5BBD\u5EA6\uFF1B\u53CC\u51FB\u6062\u590D\u9ED8\u8BA4\u5BBD\u5EA6",onPointerDown:y=>{y.button===0&&(y.preventDefault(),D.current={x:y.clientX,width:g,pointer:y.pointerId},y.currentTarget.setPointerCapture?.(y.pointerId),L(!0))},onPointerMove:y=>{D.current&&D.current.pointer===y.pointerId&&h(D.current.width+D.current.x-y.clientX)},onPointerUp:Q,onPointerCancel:Q,onLostPointerCapture:Q,onDoubleClick:()=>h(500),onKeyDown:y=>{let S={ArrowLeft:g+24,ArrowRight:g-24,Home:300,End:f}[y.key];S!==void 0&&(y.preventDefault(),h(S))}}),l.createElement("button",{className:"df-pane-toggle","aria-label":n?"\u5C55\u5F00\u95EE\u7B54\u4E0E\u9884\u89C8\u680F":"\u6536\u8D77\u95EE\u7B54\u4E0E\u9884\u89C8\u680F","aria-expanded":!n,title:n?"\u5C55\u5F00\u95EE\u7B54\u4E0E\u9884\u89C8\u680F":"\u6536\u8D77\u95EE\u7B54\u4E0E\u9884\u89C8\u680F",onClick:u},l.createElement("span",{"aria-hidden":"true"},n?"\u2039":"\u203A"),l.createElement("span",null,n?"\u95EE\u7B54\u4E0E\u9884\u89C8":"\u6536\u8D77")),l.createElement("header",null,l.createElement("div",null,l.createElement("span",{className:"df-eyebrow"},"\u9879\u76EE\u5DE5\u4F5C\u533A"),l.createElement("h2",null,r==="preview"?"\u6587\u4EF6\u9884\u89C8":r==="review"?"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5":"\u667A\u80FD\u4F53\u95EE\u7B54")),l.createElement("div",{className:"df-dock-tabs",role:"tablist","aria-label":"\u53F3\u4FA7\u5DE5\u4F5C\u533A"},l.createElement("button",{role:"tab","aria-selected":r==="assistant",onClick:()=>z("assistant")},"\u95EE\u7B54"),l.createElement("button",{role:"tab","aria-selected":r==="preview",onClick:()=>z("preview")},"\u9884\u89C8"))),w&&l.createElement("p",{role:"alert",className:"df-alert error"},w),l.createElement("div",{className:"df-right-body",hidden:r!=="assistant"},l.createElement(xt,{project:j,stageId:["overview","profile"].includes(p)?"overview":p,selection:c,services:N}),p==="negotiation"&&l.createElement("button",{className:"df-open-review",onClick:()=>z("review")},"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5 \u2192")),l.createElement("div",{className:"df-right-body",hidden:r!=="review"},l.createElement("button",{className:"df-back-link",onClick:()=>z("assistant")},"\u2190 \u8FD4\u56DE\u95EE\u7B54"),r==="review"&&l.createElement(Oe,{key:j.id,project:j,services:N,onChanged:d})),l.createElement("div",{className:"df-right-body df-dock-files",hidden:r!=="preview"},T&&l.createElement("p",{className:"df-alert"},"\u4E2D\u95F4\u8868\u5355\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\uFF0C\u9884\u89C8\u6587\u4EF6\u4FDD\u7559\u751F\u6210\u65F6\u7684\u5185\u5BB9\u3002"),l.createElement("details",{open:!c&&!F,className:"df-dock-file-list"},l.createElement("summary",null,"\u672C\u9636\u6BB5\u6587\u4EF6 \xB7"," ",P.reduce((y,S)=>y+S.generation.files.length,0)," \u4EFD"),P.map(({form:y,generation:S})=>l.createElement("section",{className:"df-generation",key:S.id},l.createElement("div",{className:"df-generation-heading"},l.createElement("h3",null,N.time(S.created_at)," \xB7 \u4FEE\u8BA2"," ",S.revision,S.date_style!=="zh-CN"&&" \xB7 \u539F\u65E5\u671F\u683C\u5F0F",S.naming_style!=="formal"&&" \xB7 \u539F\u6587\u4EF6\u540D"),l.createElement("button",{onClick:()=>W(`/cases/${y.case_id}/outputs/${S.id}/\u5168\u90E8\u6587\u4E66.zip`,S.bundle_name||j.name+"_\u6587\u4E66.zip")},"\u6253\u5305\u4E0B\u8F7D")),S.files.map(s=>l.createElement("div",{className:"df-dock-file-row",key:s.name},l.createElement("button",{className:"df-dock-file","aria-label":s.name,onClick:()=>M(gt(y,S,s))},s.name,l.createElement("small",null,s.recipient," \xB7 ",(s.size/1024).toFixed(0)," KB",s.print_copies>1&&` \xB7 \u5EFA\u8BAE\u6253\u5370 ${s.print_copies} \u4EFD`)),l.createElement("button",{"aria-label":"\u4E0B\u8F7D"+s.name,onClick:()=>W(`/cases/${y.case_id}/outputs/${S.id}/${encodeURIComponent(s.name)}`,s.name)},"\u2193"))))),!P.length&&l.createElement("p",{className:"df-muted"},"\u751F\u6210\u6587\u4E66\u6216\u4ECE\u4E2D\u95F4\u7684\u6750\u6599\u6E05\u5355\u9009\u62E9\u6587\u4EF6\u540E\uFF0C\u5728\u8FD9\u91CC\u9884\u89C8\u3002"),j.forms.filter(y=>y.case_id!==j.form_id).map(y=>l.createElement("button",{className:"df-dock-file",key:y.case_id,onClick:()=>W(`/cases/${y.case_id}/excel`,y.name+"_\u5386\u53F2\u5E95\u7A3F.xlsx")},"\u5386\u53F2\u5E95\u7A3F\uFF1A",y.name," \u2193"))),P.length>0&&l.createElement("p",{className:"df-muted"},"\u6587\u4EF6\u4FDD\u7559\u5404\u6279\u6B21\u751F\u6210\u65F6\u7684\u5185\u5BB9\uFF0C\u4FEE\u6539\u8868\u5355\u540E\u8BF7\u91CD\u65B0\u6838\u5BF9\u751F\u6210\u3002"),F?l.createElement(J,{key:F.id,file:F,projectId:j.id,download:W,embedded:!0,onClose:()=>M(null)}):c?l.createElement("section",{className:"df-dock-preview","aria-label":"\u6587\u4EF6\u9884\u89C8"},l.createElement("h3",null,c.artifact.title),$&&c.artifact.extension==="xlsx"?l.createElement("div",{className:"df-dock-office"},l.createElement($,{artifact:c.artifact,readOnly:!0,hostControls:!0})):$?l.createElement(Qe,{key:c.artifact.id,artifact:c.artifact},l.createElement($,{artifact:c.artifact,readOnly:!0,hostControls:!0})):l.createElement("p",{role:"status"},"\u6B63\u5728\u6253\u5F00\u9884\u89C8\u2026"),l.createElement("button",{className:"df-dock-ask",onClick:()=>z("assistant")},"\u5C31\u6B64\u6587\u4EF6\u63D0\u95EE \u2192"),l.createElement("button",{className:"df-dock-ask",onClick:()=>W(`/cases/${c.reference.case_id}/outputs/${c.reference.generation_id}/${encodeURIComponent(c.reference.name)}`,c.artifact.title)},"\u4E0B\u8F7D\u5F53\u524D\u6587\u4EF6")):l.createElement("p",{className:"df-dock-empty"},"\u9009\u62E9\u4E00\u4EFD\u6587\u4EF6\uFF0C\u586B\u5199\u4E0E\u9884\u89C8\u53EF\u4EE5\u540C\u65F6\u8FDB\u884C\u3002")))}var be=window.QwenPaw,e=be.host.React,{useState:q,useEffect:ve,useRef:ue}=e,Ye={pending:"\u672A\u5F00\u59CB",in_progress:"\u8FDB\u884C\u4E2D",submitted:"\u5DF2\u63D0\u4EA4",completed:"\u5DF2\u5B8C\u6210"},dt={pending:"\u5F85\u51C6\u5907",preparing:"\u6574\u7406\u4E2D",ready:"\u5F85\u63D0\u4EA4",submitted:"\u5DF2\u63D0\u4EA4",done:"\u5DF2\u5B8C\u6210",na:"\u4E0D\u9002\u7528"},ht=["\u4E0A\u62A5\u8BA1\u5212","\u9009\u5546\u8BBA\u8BC1","\u5546\u52A1\u8C08\u5224","\u5F00\u9898\u8BBA\u8BC1","\u7ED3\u9898\u9A8C\u6536","\u5F52\u6863\u4ED8\u6B3E"],ot=n=>n?new Date(n).toLocaleString("zh-CN",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}):"";function We({title:n,children:g,onClose:f,error:h,busy:u=!1}){let j=ue(null);return ve(()=>{let p=document.activeElement;return j.current?.querySelector("input,select,textarea,button")?.focus(),()=>{p?.isConnected&&p.focus()}},[]),e.createElement("div",{className:"df-dialog-backdrop"},e.createElement("section",{ref:j,className:"df-dialog df-paper",role:"dialog","aria-modal":"true","aria-label":n,onKeyDown:p=>{if(p.key==="Escape"&&!u&&(p.stopPropagation(),f()),p.key==="Tab"){let N=[...j.current.querySelectorAll("button,input,textarea,select,a[href]")].filter(r=>!r.disabled);p.shiftKey&&document.activeElement===N[0]&&(p.preventDefault(),N.at(-1)?.focus()),!p.shiftKey&&document.activeElement===N.at(-1)&&(p.preventDefault(),N[0]?.focus())}}},e.createElement("div",{className:"df-section-head"},e.createElement("h2",null,n),e.createElement("button",{type:"button",disabled:u,onClick:f,"aria-label":"\u5173\u95ED"+n},"\xD7")),h&&e.createElement("p",{role:"alert",className:"df-alert error"},h),g))}function st({file:n,projectId:g,download:f,onClose:h,embedded:u=!1}){let[j,p]=q(null),[N,r]=q(""),[z,c]=q(""),M=n.name.split(".").pop().toLowerCase(),F=["pdf","png","jpg","jpeg"].includes(M)&&!be.workspace?.loadPreview;ve(()=>{let T=!0,D;return F?be.host.fetch(`/document-forms/projects/${g}/files/${n.id}`).then(async E=>{if(!E.ok)throw new Error("\u9884\u89C8\u672A\u80FD\u6253\u5F00\uFF0C\u8BF7\u4E0B\u8F7D\u67E5\u770B");let L=await E.blob();T&&(D=URL.createObjectURL(new Blob([L],{type:n.mime})),r(D))}).catch(E=>T&&c(E.message)):be.workspace?.loadPreview||["doc","docx","xls","xlsx","ppt","pptx"].includes(M)?(be.workspace?.loadPreview?be.workspace.loadPreview():Promise.resolve(le)).then(E=>T&&p(()=>E)).catch(()=>T&&p(()=>le)):c("\u6B64\u683C\u5F0F\u8BF7\u4E0B\u8F7D\u540E\u67E5\u770B\u3002"),()=>{T=!1,D&&URL.revokeObjectURL(D)}},[n.id]);let J={id:n.id,title:n.name,source:"uploaded",extension:M,mimeType:n.mime,binaryUrl:n.preview_url,agentId:be.host.getSelectedAgentId?.(),createdAt:Date.parse(n.uploaded_at)};return e.createElement(u?"section":We,{...u?{className:"df-dock-preview","aria-label":"\u6587\u4EF6\u9884\u89C8"}:{title:n.name,onClose:h}},u&&e.createElement("h3",null,n.name),e.createElement("div",{className:"df-attachment-preview"},z?e.createElement("p",{role:"alert"},z):F&&N?M==="pdf"?e.createElement("iframe",{title:n.name,src:N,sandbox:"allow-same-origin"}):e.createElement("img",{src:N,alt:n.name}):j?e.createElement(j,{artifact:J,readOnly:!0,hostControls:!0}):e.createElement("p",{role:"status"},"\u6B63\u5728\u6253\u5F00\u9884\u89C8\u2026")),e.createElement("div",{className:"df-actions"},e.createElement("button",{onClick:()=>f(`/projects/${g}/files/${n.id}`,n.name)},"\u4E0B\u8F7D\u539F\u6587\u4EF6"),e.createElement("button",{onClick:h},"\u5173\u95ED\u9884\u89C8")))}function Ze({Editor:n,services:g}){let{request:f,json:h,download:u,Field:j}=g,[p,N]=q([]),[r,z]=q(null),[c,M]=q("overview"),[F,J]=q(""),[d,T]=q(null),[D,E]=q(!1),[L,Q]=q(!1),[$,b]=q(""),[w,G]=q(""),[W,P]=q(""),[y,S]=q(""),[s,A]=q(null),[v,I]=q({}),[te,K]=q(null),[O,ye]=q(!1),[Se,qe]=q(!1),[ke,Ee]=q(()=>{try{let i=Number(window.localStorage.getItem("ugsci.document-forms.right-width"));return Number.isFinite(i)&&i>=300&&i<=3e3?i:500}catch{return 500}}),[Ne,ie]=q(1200),Be=ue(null);ve(()=>{let i=Be.current;if(!i||!r?.single_form)return;let m=()=>{let X=i.getBoundingClientRect().width;if(X<=850)return;let Xe=i.querySelector(".df-project-sidebar").getBoundingClientRect().width,et=Math.max(300,Math.floor(X-Xe-(window.innerWidth<=1050?380:440)));ie(et),Ee(ft=>Math.min(et,Math.max(300,ft)))};m();let C=typeof ResizeObserver=="function"?new ResizeObserver(m):null;return C?.observe(i),window.addEventListener("resize",m),()=>{C?.disconnect(),window.removeEventListener("resize",m)}},[O,r?.single_form]),ve(()=>{try{window.localStorage.setItem("ugsci.document-forms.right-width",String(ke))}catch{}},[ke]);let ge=i=>Ee(Math.min(Ne,Math.max(300,Math.round(i)))),[Y,Z]=q(null),[ze,de]=q("assistant"),V=ue(!0),Ce=ue(0),ae=ue(null),De=ue(null),Te=ue(""),oe=ue(null),fe=ue(null);fe.current=r?.id,ve(()=>{oe.current?.scrollTo?.({top:0})},[r?.id,c,d?.id]);let ee=be.host.useTheme?.()||"light",_=r?.stages.find(i=>i.id===c),Le=r?.forms.filter(i=>i.stage_id===c)||[],Ue=()=>!D&&!L||window.confirm("\u8D44\u6599\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\uFF0C\u662F\u5426\u653E\u5F03\u8FD9\u4E9B\u4FEE\u6539\u5E76\u79BB\u5F00\uFF1F");async function xe(){let i=await f("/projects");return V.current&&N(i),i}async function se(i=r?.id,m=!1){let C=i?await f("/projects/"+i):null;return V.current&&C&&(m||!fe.current||fe.current===i)&&(fe.current!==C.id&&(K(null),Z(null),de("assistant")),fe.current=C.id,z(X=>X?.id===C.id&&X.revision>C.revision?X:C)),await xe(),C}ve(()=>(V.current=!0,G("\u8F7D\u5165\u9879\u76EE"),xe().then(async i=>{if(i.length&&V.current){let m=await f("/projects/"+i[0].id);V.current&&z(m)}}).catch(i=>V.current&&P(i.message)).finally(()=>V.current&&G("")),()=>{V.current=!1,Ce.current++}),[]),ve(()=>{let i=m=>{(D||L)&&(m.preventDefault(),m.returnValue="")};return window.addEventListener("beforeunload",i),()=>window.removeEventListener("beforeunload",i)},[D,L]);async function R(i,m){if(w)return;let C=++Ce.current;G(i),P(""),S("");try{await m()}catch(X){V.current&&C===Ce.current&&P(X.message)}finally{V.current&&C===Ce.current&&G("")}}async function Fe(i){Ue()&&await R("\u6253\u5F00\u9879\u76EE",async()=>{T(null),E(!1),Q(!1),M("overview"),await se(i,!0),T(null),E(!1),Q(!1),K(null),Z(null),de("assistant"),M("overview")})}async function _e(i){Ue()&&(M(i),T(null),E(!1),Q(!1),S(""),P(""),r.single_form&&r.stages.some(m=>m.id===i)&&await R("\u6253\u5F00\u9879\u76EE\u8868\u5355",async()=>{let m=await f(`/projects/${r.id}/form`,h({revision:r.revision,stage_id:i}));await se(),T({id:m.id,view:"edit",revision:m.revision,initialDraft:m})}))}function H(i,m){I(m),A(i),P("")}async function a(i,m,C="POST"){let X=await f(i,{...h({...m,revision:r.revision}),method:C});return V.current&&(z(X),A(null)),await xe(),X}function o(i){return R(i?"\u8BFB\u53D6\u9636\u6BB5 Excel":"\u51C6\u5907\u8C08\u5224\u8868\u5355",async()=>{let m;if(i){let C=new FormData;C.append("revision",r.revision),C.append("stage_id",c),C.append("workbook",i),m=await f(`/projects/${r.id}/${r.single_form?"form":"cases"}/import`,{method:"POST",body:C})}else m=await f(`/projects/${r.id}/${r.single_form?"form":"cases"}`,h({revision:r.revision,stage_id:c}));await se(),T({id:m.id,view:"edit",revision:m.revision,initialDraft:r.single_form?m:void 0}),E(!1),i&&S(m.templates.length?"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\uFF0C\u5E76\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002":"\u5DF2\u8BFB\u53D6\u672C\u9636\u6BB5\u53D8\u91CF\u914D\u7F6E\uFF0C\u8BF7\u6DFB\u52A0\u5BF9\u5E94\u7684 Word \u6A21\u677F\u3002")})}function k(i){if(!i)return;let m=Te.current;return R("\u4FDD\u5B58\u6750\u6599",async()=>{let C=new FormData;C.append("revision",r.revision),C.append("file",i);let X=await f(`/projects/${r.id}/stages/${c}/materials/${m}/files`,{method:"POST",body:C});z(X),await xe(),S("\u6750\u6599\u5DF2\u4FDD\u5B58\uFF0C\u539F\u6709\u7248\u672C\u7EE7\u7EED\u4FDD\u7559\u3002\u8BF7\u6838\u5BF9\u540E\u66F4\u65B0\u6750\u6599\u72B6\u6001\u3002")})}let B=r?`/projects/${r.id}`:"",je=i=>{i.preventDefault(),R("\u4FDD\u5B58\u6750\u6599\u4FE1\u606F",()=>a(`${B}/stages/${c}/materials${v.id?"/"+v.id:""}`,v,v.id?"PUT":"POST"))},Ie=i=>R("\u6574\u7406\u4E0B\u8F7D\u5305",()=>u(B+"/bundle"+(i?"?stage_id="+i:""),`${r.name}_${i?_.title:"\u5168\u6D41\u7A0B\u6750\u6599"}.zip`));return e.createElement("main",{ref:Be,style:{"--df-dock-size":ke+"px"},className:"df-app df-project-app"+(r?.single_form?" df-three-column":"")+(O?" df-left-collapsed":"")+(Se?" df-right-collapsed":""),"data-theme":ee},e.createElement("style",null,it),e.createElement("input",{ref:ae,type:"file",accept:".xlsx",hidden:!0,"aria-label":"\u5BFC\u5165\u9636\u6BB5 Excel",onChange:i=>{let m=i.target.files[0];i.target.value="",m&&o(m)}}),e.createElement("input",{ref:De,type:"file",accept:".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.png,.jpg,.jpeg,.zip,.txt,.csv",hidden:!0,"aria-label":"\u4E0A\u4F20\u9636\u6BB5\u6750\u6599",onChange:i=>{let m=i.target.files[0];i.target.value="",k(m)}}),e.createElement("aside",{className:"df-sidebar df-project-sidebar"+(O?" df-pane-collapsed":""),"aria-label":"\u9879\u76EE\u9009\u62E9"},e.createElement("button",{className:"df-pane-toggle","aria-label":O?"\u5C55\u5F00\u9879\u76EE\u680F":"\u6536\u8D77\u9879\u76EE\u680F","aria-expanded":!O,title:O?"\u5C55\u5F00\u9879\u76EE\u680F":"\u6536\u8D77\u9879\u76EE\u680F",onClick:()=>ye(i=>!i)},e.createElement("span",{"aria-hidden":"true"},O?"\u203A":"\u2039"),e.createElement("span",null,O?"\u9879\u76EE":"\u6536\u8D77")),e.createElement("div",{className:"df-brand"},"UGSci ",e.createElement("span",null,"\u9879\u76EE\u6750\u6599")),e.createElement("button",{className:"df-primary df-new",disabled:!!w||!!$,onClick:()=>{Ue()&&H("create",{name:"",code:"",owner:""})}},"\uFF0B \u65B0\u5EFA\u9879\u76EE"),e.createElement("label",{className:"df-project-search"},e.createElement("span",{className:"df-sr-only"},"\u641C\u7D22\u9879\u76EE"),e.createElement("input",{"aria-label":"\u641C\u7D22\u9879\u76EE",placeholder:"\u641C\u7D22\u9879\u76EE\u540D\u79F0\u6216\u7F16\u53F7",value:F,onChange:i=>J(i.target.value)})),e.createElement("div",{className:"df-caption"},"\u6211\u7684\u9879\u76EE ",e.createElement("span",null,p.length)),e.createElement("nav",{"aria-label":"\u9879\u76EE\u5217\u8868"},p.filter(i=>(i.name+" "+i.code).toLowerCase().includes(F.toLowerCase())).map(i=>e.createElement("button",{key:i.id,disabled:!!w||!!$,"aria-current":r?.id===i.id?"page":void 0,onClick:()=>Fe(i.id)},e.createElement("b",null,i.name),e.createElement("small",null,i.code||"\u672A\u8BBE\u7F16\u53F7"," \xB7 ",i.completed,"/6 \u9636\u6BB5\u5B8C\u6210")))),e.createElement("div",{className:"df-sidebar-foot"},e.createElement("b",null,"\u914D\u5957\u6A21\u677F"),e.createElement("p",null,"\u4E0A\u62A5\u8BA1\u5212\u548C\u5546\u52A1\u8C08\u5224\u5DF2\u914D\u597D\u9ED8\u8BA4\u6A21\u677F\uFF0C\u5176\u4F59\u9636\u6BB5\u53EF\u63A5\u5165\u5404\u81EA\u7684\u7EDF\u4E00\u6A21\u677F\u3002"),e.createElement("button",{disabled:!!w||!!$,onClick:()=>R("\u4E0B\u8F7D\u914D\u5957\u6A21\u677F",()=>u("/starter","\u6587\u4E66\u586B\u62A5_\u914D\u5957\u6A21\u677F.zip"))},"\u4E0B\u8F7D\u914D\u5957\u6A21\u677F \u2197"),e.createElement("small",null,"\u7A7A\u767D Excel \u4E0E 7 \u4EFD\u6807\u51C6\u6587\u4E66"))),e.createElement("section",{className:"df-main df-project-main",ref:oe},e.createElement("header",{className:"df-header"},e.createElement("div",null,e.createElement("span",{className:"df-eyebrow"},"UGSCI / \u9879\u76EE\u6750\u6599"),e.createElement("h1",null,r?.name||"\u9879\u76EE\u5DE5\u4F5C\u53F0"),e.createElement("p",null,r?[r.code||"\u672A\u8BBE\u9879\u76EE\u7F16\u53F7",r.owner&&"\u7ECF\u529E\u4EBA\uFF1A"+r.owner].filter(Boolean).join("\u3000\xB7\u3000"):"\u4ECE\u4E0A\u62A5\u8BA1\u5212\u5230\u5F52\u6863\u4ED8\u6B3E\uFF0C\u628A\u540C\u4E00\u9879\u76EE\u7684\u8D44\u6599\u653E\u5728\u4E00\u8D77\u3002")),r&&e.createElement("div",{className:"df-actions"},e.createElement("button",{disabled:!!w||!!$||!!d,onClick:()=>_e("profile")},"\u57FA\u7840\u4FE1\u606F\u586B\u62A5"),e.createElement("button",{disabled:!!w||!!$,onClick:()=>Ie()},"\u4E0B\u8F7D\u9879\u76EE\u6750\u6599"))),W&&e.createElement("div",{role:"alert",className:"df-alert error"},W,e.createElement("button",{"aria-label":"\u5173\u95ED\u9519\u8BEF\u63D0\u793A",onClick:()=>P("")},"\xD7")),y&&e.createElement("div",{className:"df-alert",role:"status"},y),w&&e.createElement("div",{className:"df-progress",role:"status"},w,"\u2026"),r?e.createElement(e.Fragment,null,e.createElement("nav",{className:"df-project-tabs","aria-label":"\u9879\u76EE\u9636\u6BB5"},e.createElement("button",{className:c==="overview"?"active":"",disabled:!!w||!!$,onClick:()=>_e("overview")},"\u9879\u76EE\u603B\u89C8"),r.stages.map((i,m)=>e.createElement("button",{key:i.id,"aria-current":c===i.id?"step":void 0,className:c===i.id?"active":"",disabled:!!w||!!$,onClick:()=>_e(i.id)},e.createElement("small",null,String(m+1).padStart(2,"0")),i.title,e.createElement("span",{className:"df-state df-state-"+i.status},i.upstream_changed.length||i.documents_changed?"\u5F85\u590D\u6838":Ye[i.status])))),d?e.createElement(n,{key:r.id+":"+d.id+":"+c+":"+(d.revision||""),project:r,workflowStage:_,initialCaseId:d.id,initialView:d.view,initialDraft:d.initialDraft,onDirtyChange:E,onBusyChange:b,onViewChange:()=>oe.current?.scrollTo?.({top:0}),onBack:()=>{T(null),E(!1),se().catch(i=>P(i.message))},onChanged:()=>se(),docked:r.single_form,onEditBasics:()=>{T(null),E(!1),b(""),M("profile")},onStageStatus:()=>H("stage",{..._,confirmed:!1}),onPreview:i=>{Z(i),K(null),de("preview")}}):e.createElement("fieldset",{className:"df-content",disabled:!!w||!!$},c==="overview"&&e.createElement(e.Fragment,null,r.migrated&&e.createElement("p",{className:"df-muted df-migration-note"},"\u5386\u53F2\u586B\u62A5\u5DF2\u6309\u9879\u76EE\u540D\u79F0\u6216\u7F16\u53F7\u5F52\u5165\u5546\u52A1\u8C08\u5224\u9636\u6BB5\uFF0C\u539F\u8868\u5355\u3001\u751F\u6210\u6279\u6B21\u548C\u6587\u4EF6\u5747\u4FDD\u7559\u3002"),e.createElement("section",{className:"df-project-metrics"},e.createElement("div",null,e.createElement("b",null,r.stages.filter(i=>i.status==="completed").length,e.createElement("small",null,"/ 6")),e.createElement("span",null,"\u5DF2\u5B8C\u6210\u9636\u6BB5")),e.createElement("div",null,e.createElement("b",null,r.stages.reduce((i,m)=>i+m.materials.filter(C=>!["done","na"].includes(C.status)).length,0)),e.createElement("span",null,"\u5F85\u6574\u7406\u6750\u6599")),e.createElement("div",null,e.createElement("b",null,r.forms.reduce((i,m)=>i+m.outputs,0)),e.createElement("span",null,"\u5DF2\u751F\u6210\u6587\u4EF6")),e.createElement("div",null,e.createElement("b",null,r.stages.filter(i=>i.upstream_changed.length||i.documents_changed).length),e.createElement("span",null,"\u5F85\u590D\u6838\u9636\u6BB5"))),e.createElement("div",{className:"df-project-stage-grid"},r.stages.map((i,m)=>e.createElement("button",{className:"df-paper df-stage-card",key:i.id,onClick:()=>_e(i.id)},e.createElement("div",{className:"df-section-head"},e.createElement("small",null,"\u9636\u6BB5 ",String(m+1).padStart(2,"0")),e.createElement("span",{className:"df-state df-state-"+i.status},Ye[i.status])),e.createElement("h2",null,i.title),e.createElement("p",null,i.purpose),e.createElement("footer",null,e.createElement("span",null,i.materials.filter(C=>["done","na"].includes(C.status)).length,"/",i.materials.length," \u9879\u6750\u6599\u5DF2\u5904\u7406"),e.createElement("span",null,i.upstream_changed.length||i.documents_changed?"\u6709\u53D8\u66F4\u5F85\u590D\u6838":i.due_date?"\u8BA1\u5212 "+i.due_date:"\u8FDB\u5165\u9636\u6BB5 \u2192"))))),e.createElement("section",{className:"df-paper df-project-hint"},e.createElement("h2",null,"\u4E00\u4EFD\u9879\u76EE\u5E95\u7A3F\uFF0C\u8D2F\u7A7F\u5404\u9636\u6BB5"),e.createElement("p",null,"\u9879\u76EE\u540D\u79F0\u3001\u7814\u7A76\u5185\u5BB9\u3001\u6210\u679C\u6307\u6807\u548C\u9884\u7B97\u7B49\u53EF\u5728\u201C\u57FA\u7840\u4FE1\u606F\u586B\u62A5\u201D\u7EDF\u4E00\u7EF4\u62A4\u3002\u9636\u6BB5\u8868\u5355\u4ECE\u5E95\u7A3F\u53D6\u503C\uFF0C\u540E\u7EED\u53D8\u66F4\u4F1A\u63D0\u9192\u6838\u5BF9\uFF1B\u5DF2\u6709\u751F\u6210\u6587\u4EF6\u4FDD\u7559\u539F\u6837\u3002"),e.createElement("button",{onClick:()=>_e("profile")},"\u586B\u5199\u57FA\u7840\u4FE1\u606F"))),c==="profile"&&e.createElement(bt,{onDirtyChange:Q,key:r.id+":"+r.revision,project:r,Field:j,onSave:i=>R("\u4FDD\u5B58\u57FA\u7840\u4FE1\u606F",async()=>{await a(B,i,"PUT"),S("\u57FA\u7840\u4FE1\u606F\u5DF2\u66F4\u65B0\u3002\u5DF2\u6709\u8868\u5355\u53EF\u9010\u9879\u6838\u5BF9\u540E\u540C\u6B65\uFF0C\u539F\u751F\u6210\u6587\u4EF6\u4E0D\u53D8\u3002")})}),_&&e.createElement(e.Fragment,null,e.createElement("section",{className:"df-paper df-stage-header"},e.createElement("div",null,e.createElement("div",{className:"df-eyebrow"},"\u9636\u6BB5\u6750\u6599"),e.createElement("h2",null,_.title),e.createElement("p",null,_.purpose),e.createElement("p",{className:"df-muted"},r.single_form&&_.id==="plan"?"\u5DF2\u63A5\u5165\u79D1\u7814\u8BA1\u5212\u586B\u62A5\u8868\u4E0E\u5916\u534F\u5FC5\u8981\u6027\u8BF4\u660E\uFF0C\u53EF\u76F4\u63A5\u586B\u5199\u5E76\u751F\u6210\u3002":_.id==="negotiation"?"\u4E94\u4EFD\u6807\u51C6\u6A21\u677F\u5DF2\u63A5\u5165\uFF0C\u53EF\u76F4\u63A5\u586B\u5199\uFF0C\u4E5F\u53EF\u5BFC\u5165\u73B0\u6709 Excel\u3002":"\u7EDF\u4E00\u6A21\u677F\u5F85\u8865\u5145\uFF1B\u73B0\u9636\u6BB5\u53EF\u6574\u7406\u6750\u6599\u3001\u4E0A\u4F20\u6587\u4EF6\uFF0C\u6216\u5BFC\u5165\u5DF2\u6709 Excel \u4E0E Word \u6A21\u677F\u3002")),e.createElement("div",{className:"df-actions"},e.createElement("button",{onClick:()=>Ie(_.id)},"\u4E0B\u8F7D\u672C\u9636\u6BB5\u6750\u6599"),e.createElement("button",{onClick:()=>H("stage",{..._,confirmed:!1})},"\u529E\u7406\u4FE1\u606F\u4E0E\u72B6\u6001"))),(_.upstream_changed.length>0||_.documents_changed)&&e.createElement("div",{className:"df-alert df-stage-warning"},e.createElement("div",null,e.createElement("b",null,"\u672C\u9636\u6BB5\u6709\u8D44\u6599\u9700\u8981\u590D\u6838"),e.createElement("p",null,_.upstream_changed.length>0&&"\u524D\u5E8F\u9636\u6BB5\u5DF2\u66F4\u65B0\uFF1A"+_.upstream_changed.join("\u3001")+"\u3002",_.documents_changed&&"\u672C\u9636\u6BB5\u8868\u5355\u6216\u751F\u6210\u6587\u4EF6\u6709\u66F4\u65B0\u3002","\u8BF7\u6838\u5BF9\u5DF2\u63D0\u4EA4\u7684\u6750\u6599\u662F\u5426\u9700\u8981\u8C03\u6574\u3002")),e.createElement("button",{onClick:()=>R("\u8BB0\u5F55\u590D\u6838",()=>a(`${B}/stages/${_.id}/acknowledge`,{}))},"\u5DF2\u6838\u5BF9\u53D8\u66F4")),(_.system_name||_.due_date||_.submission_ref||_.notes)&&e.createElement("section",{className:"df-paper df-stage-details"},e.createElement("dl",null,e.createElement("div",null,e.createElement("dt",null,"\u8BA1\u5212\u65E5\u671F"),e.createElement("dd",null,_.due_date||"\u672A\u8BBE\u7F6E")),e.createElement("div",null,e.createElement("dt",null,"\u529E\u7406\u7CFB\u7EDF"),e.createElement("dd",null,_.system_url?e.createElement("a",{href:_.system_url,target:"_blank",rel:"noopener noreferrer"},_.system_name||"\u6253\u5F00\u529E\u7406\u7CFB\u7EDF"," \u2197"):_.system_name||"\u672A\u8BB0\u5F55")),e.createElement("div",null,e.createElement("dt",null,"\u63D0\u4EA4\u7F16\u53F7 / \u56DE\u6267"),e.createElement("dd",null,_.submission_ref||"\u672A\u8BB0\u5F55"))),_.notes&&e.createElement("p",null,_.notes)),e.createElement("section",{className:"df-paper df-stage-forms"},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,r.single_form?"\u9879\u76EE\u8868\u5355":"\u586B\u5199\u4E0E\u751F\u6210"),e.createElement("p",{className:"df-muted"},"\u8868\u5355\u6CBF\u7528\u9879\u76EE\u5E95\u7A3F\uFF0C\u6838\u5BF9\u540E\u751F\u6210\u3002\u5DF2\u6709\u6279\u6B21\u4FDD\u7559\u751F\u6210\u65F6\u7684\u5185\u5BB9\u3002")),e.createElement("div",{className:"df-actions"},(_.id==="negotiation"||r.single_form)&&e.createElement("button",{className:"df-primary",onClick:()=>o()},r.single_form?"\u6253\u5F00\u9879\u76EE\u8868\u5355":"\u586B\u5199\u8C08\u5224\u6750\u6599"),e.createElement("button",{onClick:()=>ae.current.click()},"\u5BFC\u5165 Excel \u8868\u5355"))),r.single_form?e.createElement("p",{className:"df-muted"},"\u6BCF\u4E2A\u9879\u76EE\u5171\u7528\u4E00\u4EFD\u8868\u5355\uFF0C\u516D\u4E2A\u9636\u6BB5\u5404\u529E\u7406\u4E00\u6B21\u3002\u5DF2\u6709\u6587\u4E66\u4E0E\u5386\u53F2\u5E95\u7A3F\u53EF\u5728\u53F3\u4FA7\u67E5\u770B\u3002"):Le.length?e.createElement("div",{className:"df-project-forms"},Le.map(i=>e.createElement("div",{key:i.case_id},e.createElement("div",null,e.createElement("b",null,i.name),e.createElement("small",null,ot(i.updated_at)," \xB7"," ",i.outputs?i.outputs+" \u4EFD\u6587\u4EF6":"\u586B\u5199\u4E2D",i.shared_changes.length>0&&" \xB7 \u57FA\u7840\u4FE1\u606F\u6709\u66F4\u65B0")),e.createElement("div",{className:"df-actions"},e.createElement("button",{onClick:()=>T({id:i.case_id,view:"edit"})},"\u6253\u5F00\u8868\u5355"),i.outputs>0&&e.createElement("button",{onClick:()=>T({id:i.case_id,view:"files"})},"\u67E5\u770B\u751F\u6210\u6587\u4EF6"))))):e.createElement("p",{className:"df-empty"},"\u672C\u9636\u6BB5\u8FD8\u6CA1\u6709\u8868\u5355\u3002\u5DF2\u6709\u6210\u54C1\u6587\u4EF6\u53EF\u76F4\u63A5\u4E0A\u4F20\u5230\u4E0B\u9762\u7684\u6750\u6599\u6E05\u5355\u3002")),_.id==="negotiation"&&e.createElement("section",{className:"df-paper df-review-entry"},e.createElement("div",null,e.createElement("h2",null,"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5"),e.createElement("p",{className:"df-muted"},"\u5BF9\u7167\u6B63\u5F0F\u8C08\u5224\u6587\u4EF6\uFF0C\u68C0\u67E5\u5404\u5355\u4F4D\u54CD\u5E94\u6750\u6599\uFF0C\u6C47\u603B\u95EE\u9898\u3001\u4F9D\u636E\u548C\u5F85\u786E\u8BA4\u4E8B\u9879\u3002")),e.createElement("button",{onClick:()=>r.single_form?de("review"):H("response-review",{})},"\u6253\u5F00\u6838\u67E5\u667A\u80FD\u4F53 \u2192")),e.createElement("section",{className:"df-paper df-material-panel"},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,"\u6750\u6599\u6E05\u5355 ",e.createElement("small",null,_.materials.length)),e.createElement("p",{className:"df-muted"},"\u5148\u6309\u5E38\u7528\u6750\u6599\u5217\u51FA\uFF0C\u53EF\u4FEE\u6539\u540D\u79F0\u3001\u589E\u8865\u6750\u6599\u6216\u6807\u4E3A\u4E0D\u9002\u7528\u3002\u201C\u5DF2\u63D0\u4EA4\u201D\u7531\u7ECF\u529E\u4EBA\u6838\u5B9E\u540E\u8BB0\u5F55\u3002")),e.createElement("button",{onClick:()=>H("material",{name:"",status:"pending",required:!1,note:""})},"\uFF0B \u6DFB\u52A0\u6750\u6599")),e.createElement("div",{className:"df-materials"},_.materials.map(i=>{let m=Le.reduce((C,X)=>C+(X.generations[0]?.files.filter(Xe=>Xe.name.includes(i.name)).length||0),0);return e.createElement("article",{className:"df-material-row",key:i.id},e.createElement("div",{className:"df-material-name"},e.createElement("b",null,i.name),i.required&&e.createElement("span",{className:"df-required-tag"},"\u5FC5\u5907"),e.createElement("span",{className:"df-state df-material-state-"+i.status},dt[i.status]),m>0&&e.createElement("small",null,"\u5DF2\u6709 ",m," \u4EFD\u751F\u6210\u7A3F \xB7 \u5728\u4E0A\u65B9\u8868\u5355\u67E5\u770B"),i.note&&e.createElement("p",null,i.note)),e.createElement("div",{className:"df-material-files"},i.files.length>0?e.createElement("details",null,e.createElement("summary",null,i.files.length," \u4EFD\u6587\u4EF6 / \u7248\u672C \xB7 \u6700\u65B0\uFF1A",i.files[i.files.length-1].name),[...i.files].reverse().map((C,X)=>e.createElement("div",{className:"df-material-file",key:C.id},e.createElement("div",null,e.createElement("b",null,"V",i.files.length-X," \xB7"," ",C.name),e.createElement("small",null,ot(C.uploaded_at)," \xB7"," ",Math.max(1,Math.round(C.size/1024))," ","KB")),e.createElement("button",{onClick:()=>{K(C),Z({artifact:{title:C.name},reference:{file_id:C.id}}),de("preview")}},"\u9884\u89C8"),e.createElement("button",{"aria-label":"\u4E0B\u8F7D"+C.name+"\u7248\u672C"+(i.files.length-X),onClick:()=>R("\u4E0B\u8F7D\u6750\u6599",()=>u(`${B}/files/${C.id}`,C.name))},"\u4E0B\u8F7D")))):e.createElement("span",{className:"df-muted"},"\u5C1A\u672A\u4E0A\u4F20\u6587\u4EF6")),e.createElement("div",{className:"df-actions"},e.createElement("button",{"aria-label":"\u4E0A\u4F20"+i.name,onClick:()=>{Te.current=i.id,De.current.click()}},"\u4E0A\u4F20\u6587\u4EF6"),e.createElement("button",{"aria-label":"\u7F16\u8F91"+i.name,onClick:()=>H("material",{...i})},"\u7F16\u8F91")))}))),e.createElement("div",{className:"df-stage-tail"},e.createElement("p",null,"\u5404\u9636\u6BB5\u53EF\u5E76\u884C\u51C6\u5907\uFF1B\u524D\u5E8F\u8D44\u6599\u53D8\u5316\u540E\uFF0C\u540E\u7EED\u9636\u6BB5\u4F1A\u63D0\u793A\u590D\u6838\u3002\u9636\u6BB5\u5B8C\u6210\u7531\u7ECF\u529E\u4EBA\u786E\u8BA4\u3002"),e.createElement("button",{onClick:()=>H("stage",{..._,confirmed:!1})},"\u66F4\u65B0\u529E\u7406\u72B6\u6001"))))):e.createElement("section",{className:"df-paper df-project-welcome"},e.createElement("h2",null,"\u5148\u5EFA\u4E00\u4E2A\u9879\u76EE"),e.createElement("p",null,"\u5171\u7528\u8D44\u6599\u53EA\u6574\u7406\u4E00\u6B21\uFF0C\u8868\u5355\u4E0E\u9644\u4EF6\u6309\u9636\u6BB5\u5F52\u96C6\uFF0C\u751F\u6210\u7A3F\u4E0E\u5B9A\u7A3F\u5206\u522B\u7559\u75D5\u3002"),e.createElement("div",{className:"df-welcome-stages"},ht.map((i,m)=>e.createElement("span",{key:i},e.createElement("small",null,String(m+1).padStart(2,"0")),i))),e.createElement("button",{className:"df-primary",onClick:()=>H("create",{name:"",code:"",owner:""})},"\u5EFA\u7ACB\u7B2C\u4E00\u4E2A\u9879\u76EE"))),r?.single_form&&e.createElement(Je,{key:r.id,collapsed:Se,width:ke,maxWidth:Ne,onResize:ge,onToggle:()=>qe(i=>!i),project:r,stageId:c,services:g,mode:ze,onMode:de,selection:Y,attachment:te,AttachmentPreview:st,dirty:D,onSelect:i=>{Z(i),K(null),de("preview")},onChanged:()=>se().catch(i=>P(i.message))}),s==="response-review"&&e.createElement(We,{title:"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5",onClose:()=>{A(null),se().catch(i=>P(i.message))}},e.createElement(Oe,{project:r,services:g,onChanged:()=>se().catch(i=>P(i.message))})),s==="create"&&e.createElement(We,{title:"\u65B0\u5EFA\u9879\u76EE",busy:!!w,error:W,onClose:()=>A(null)},e.createElement("form",{onSubmit:i=>{i.preventDefault(),R("\u5EFA\u7ACB\u9879\u76EE",async()=>{let m=await f("/projects",h(v));K(null),Z(null),de("assistant"),z(m),M("overview"),T(null),E(!1),A(null),await xe()})}},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u540D\u79F0"),e.createElement("input",{"aria-label":"\u65B0\u9879\u76EE\u540D\u79F0",required:!0,maxLength:120,value:v.name,onChange:i=>I({...v,name:i.target.value})})),e.createElement("div",{className:"df-fields"},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u7F16\u53F7"),e.createElement("input",{"aria-label":"\u65B0\u9879\u76EE\u7F16\u53F7",maxLength:100,value:v.code,onChange:i=>I({...v,code:i.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u7ECF\u529E\u4EBA"),e.createElement("input",{"aria-label":"\u65B0\u9879\u76EE\u7ECF\u529E\u4EBA",maxLength:100,value:v.owner,onChange:i=>I({...v,owner:i.target.value})}))),e.createElement("p",{className:"df-muted"},"\u5EFA\u7ACB\u9879\u76EE\u540E\uFF0C\u53EF\u6574\u7406\u5171\u7528\u8D44\u6599\uFF0C\u518D\u6309\u516D\u4E2A\u9636\u6BB5\u51C6\u5907\u6750\u6599\u3002"),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",disabled:!!w||!!$,onClick:()=>A(null)},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!w||!v.name?.trim(),type:"submit"},"\u5EFA\u7ACB\u9879\u76EE")))),s==="material"&&e.createElement(We,{title:"\u6750\u6599\u4FE1\u606F",busy:!!w,error:W,onClose:()=>A(null)},e.createElement("form",{onSubmit:je},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u6750\u6599\u540D\u79F0"),e.createElement("input",{"aria-label":"\u6750\u6599\u540D\u79F0",required:!0,maxLength:150,value:v.name,onChange:i=>I({...v,name:i.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u6750\u6599\u72B6\u6001"),e.createElement("select",{"aria-label":"\u6750\u6599\u72B6\u6001",value:v.status,onChange:i=>I({...v,status:i.target.value})},Object.entries(dt).map(([i,m])=>e.createElement("option",{key:i,value:i},m)))),e.createElement("label",{className:"df-checkbox"},e.createElement("input",{type:"checkbox",checked:v.required,onChange:i=>I({...v,required:i.target.checked})}),"\u672C\u9879\u76EE\u7684\u5FC5\u5907\u6750\u6599\uFF0C\u9636\u6BB5\u5B8C\u6210\u524D\u9700\u786E\u8BA4\u5DF2\u5B8C\u6210\u6216\u4E0D\u9002\u7528"),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u6750\u6599\u8BF4\u660E"),e.createElement("textarea",{"aria-label":"\u6750\u6599\u8BF4\u660E",rows:3,maxLength:3e3,value:v.note,onChange:i=>I({...v,note:i.target.value})})),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",onClick:()=>A(null),disabled:!!w||!!$},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!w||!!$,type:"submit"},"\u4FDD\u5B58\u6750\u6599\u4FE1\u606F")))),s==="stage"&&e.createElement(We,{title:_.title+"\u529E\u7406\u4FE1\u606F",busy:!!w,error:W,onClose:()=>A(null)},e.createElement("form",{onSubmit:i=>{i.preventDefault(),R("\u4FDD\u5B58\u529E\u7406\u4FE1\u606F",()=>a(`${B}/stages/${c}`,v,"PUT"))}},e.createElement("div",{className:"df-fields"},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9636\u6BB5\u72B6\u6001"),e.createElement("select",{"aria-label":"\u9636\u6BB5\u72B6\u6001",value:v.status,onChange:i=>I({...v,status:i.target.value})},Object.entries(Ye).map(([i,m])=>e.createElement("option",{key:i,value:i},m)))),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u8BA1\u5212\u65E5\u671F"),e.createElement("input",{"aria-label":"\u9636\u6BB5\u8BA1\u5212\u65E5\u671F",type:"date",value:v.due_date,onChange:i=>I({...v,due_date:i.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u529E\u7406\u7CFB\u7EDF"),e.createElement("input",{"aria-label":"\u529E\u7406\u7CFB\u7EDF",maxLength:150,value:v.system_name,onChange:i=>I({...v,system_name:i.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u7CFB\u7EDF\u5730\u5740"),e.createElement("input",{"aria-label":"\u7CFB\u7EDF\u5730\u5740",type:"url",placeholder:"https://",maxLength:1e3,value:v.system_url,onChange:i=>I({...v,system_url:i.target.value})}))),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u63D0\u4EA4\u7F16\u53F7 / \u56DE\u6267\u4FE1\u606F"),e.createElement("input",{"aria-label":"\u63D0\u4EA4\u7F16\u53F7",maxLength:500,value:v.submission_ref,onChange:i=>I({...v,submission_ref:i.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u529E\u7406\u8BF4\u660E"),e.createElement("textarea",{"aria-label":"\u529E\u7406\u8BF4\u660E",rows:4,maxLength:5e3,value:v.notes,onChange:i=>I({...v,notes:i.target.value})})),e.createElement("p",{className:"df-muted"},"\u8BB0\u5F55\u7EBF\u4E0B\u6216\u4E1A\u52A1\u7CFB\u7EDF\u7684\u5B9E\u9645\u529E\u7406\u7ED3\u679C\uFF0C\u56DE\u6267\u6587\u4EF6\u53EF\u4E0A\u4F20\u5230\u6750\u6599\u6E05\u5355\u3002"),v.status==="completed"&&e.createElement(e.Fragment,null,e.createElement("p",{className:"df-muted"},_.missing_required.length>0?"\u5C1A\u672A\u529E\u7ED3\u7684\u5FC5\u5907\u6750\u6599\uFF1A"+_.missing_required.join("\u3001"):"\u8BF7\u786E\u8BA4\u9636\u6BB5\u6750\u6599\u548C\u524D\u5E8F\u53D8\u66F4\u5DF2\u6838\u5BF9\u3002"),e.createElement("label",{className:"df-checkbox"},e.createElement("input",{"aria-label":"\u786E\u8BA4\u672C\u9636\u6BB5\u5DF2\u529E\u7ED3",type:"checkbox",checked:v.confirmed,onChange:i=>I({...v,confirmed:i.target.checked})}),"\u5DF2\u6838\u5BF9\u672C\u9636\u6BB5\u6750\u6599\u53CA\u524D\u5E8F\u53D8\u66F4\uFF0C\u786E\u8BA4\u672C\u9636\u6BB5\u5DF2\u529E\u7ED3")),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",onClick:()=>A(null),disabled:!!w||!!$},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!w||v.status==="completed"&&!v.confirmed,type:"submit"},"\u4FDD\u5B58\u529E\u7406\u4FE1\u606F")))),te&&!r.single_form&&e.createElement(st,{key:te.id,file:te,projectId:r.id,download:(i,m)=>R("\u4E0B\u8F7D\u539F\u6587\u4EF6",()=>u(i,m)),onClose:()=>K(null)}))}function bt({project:n,Field:g,onSave:f,onDirtyChange:h}){let[u,j]=q(n.fields),[p,N]=q({name:n.name,code:n.code,owner:n.owner});return ve(()=>{h(JSON.stringify(u)!==JSON.stringify(n.fields)||p.name!==n.name||p.code!==n.code||p.owner!==n.owner)},[u,p]),e.createElement("form",{className:"df-paper df-project-profile",onSubmit:r=>{r.preventDefault(),f({...p,values:Object.fromEntries(u.map(z=>[z.key,z.value]))})}},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,"\u57FA\u7840\u4FE1\u606F\u586B\u62A5"),e.createElement("p",{className:"df-muted"},"\u5404\u9636\u6BB5\u8868\u5355\u590D\u7528\u8FD9\u91CC\u7684\u8D44\u6599\uFF1B\u9636\u6BB5\u65E5\u671F\u3001\u8BC4\u5BA1\u5206\u6570\u548C\u4ED8\u6B3E\u7ED3\u679C\u5206\u522B\u8BB0\u5F55\u3002")),e.createElement("button",{className:"df-primary",type:"submit"},"\u4FDD\u5B58\u57FA\u7840\u4FE1\u606F")),e.createElement("div",{className:"df-fields"},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u540D\u79F0"),e.createElement("input",{"aria-label":"\u9879\u76EE\u540D\u79F0",required:!0,value:p.name,maxLength:120,onChange:r=>N({...p,name:r.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u7F16\u53F7"),e.createElement("input",{"aria-label":"\u9879\u76EE\u7F16\u53F7",value:p.code,maxLength:100,onChange:r=>N({...p,code:r.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u7ECF\u529E\u4EBA"),e.createElement("input",{"aria-label":"\u7ECF\u529E\u4EBA",value:p.owner,maxLength:100,onChange:r=>N({...p,owner:r.target.value})}))),[...new Set(u.filter(r=>!["project.name","project.code"].includes(r.key)).map(r=>r.group))].map(r=>e.createElement("section",{className:"df-group",key:r},e.createElement("h3",null,r),e.createElement("div",{className:"df-fields"},u.filter(z=>z.group===r&&!["project.name","project.code"].includes(z.key)).map(z=>e.createElement(g,{key:z.key,field:{...z,required:!1},onChange:c=>j(u.map(M=>M.key===z.key?{...M,value:c}:M))}))))),e.createElement("div",{className:"df-actions"},e.createElement("button",{className:"df-primary",type:"submit"},"\u4FDD\u5B58\u57FA\u7840\u4FE1\u606F")))}var pe=window.QwenPaw,t=pe.host.React,{useState:ne,useEffect:$e,useLayoutEffect:vt,useRef:Ae}=t,Re="/document-forms",wt="application/vnd.openxmlformats-officedocument.wordprocessingml.document";async function re(n,g){let f=await pe.host.fetch(Re+n,g);if(!f.ok){let h=await f.json().catch(()=>({}));throw new Error(typeof h.detail=="string"?h.detail:Array.isArray(h.detail)?h.detail.map(u=>`${u.loc?.slice(1).join(".")||"\u8D44\u6599"}\uFF1A${u.msg}`).join("\uFF1B"):`\u64CD\u4F5C\u672A\u5B8C\u6210\uFF08${f.status}\uFF09\uFF0C\u8BF7\u68C0\u67E5\u586B\u5199\u5185\u5BB9`)}return f.json()}async function Ve(n,g){let f=await pe.host.fetch(Re+n);if(!f.ok)throw new Error("\u6587\u4EF6\u4E0B\u8F7D\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5");let h=URL.createObjectURL(await f.blob()),u=document.createElement("a");u.href=h,u.download=g,document.body.appendChild(u);try{u.click()}finally{u.remove(),setTimeout(()=>URL.revokeObjectURL(h),1e3)}}var we=n=>({method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)}),Me=n=>new Date(n).toLocaleString("zh-CN",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}),lt=n=>n.kind==="textarea"||n.value.length>100||n.value.includes(`
`)||n.label.includes("\u6574\u6BB5"),yt=n=>/^(research\.contents|deliverables\.|metrics\.|milestones\.)/.test(n.key)||/主要研究内容|预期成果|考核指标|进度安排/.test(n.label);function Ke(n){return n.map((g,f)=>{let h={...g};for(let u of["start","end"]){let j="follow_"+u;h[j]=f>0&&(typeof h[j]=="boolean"?h[j]:!h[u]),h[j]&&(h[u]=n[0][u])}return h})}function pt({field:n,displayValue:g,onChange:f}){let h=lt(n),u=yt(n),j=["date","datetime-local"].includes(n.kind)?n.value:g??n.value,p=Ae(null);return vt(()=>{if(!p.current)return;let N=p.current.scrollTop;p.current.style.height="auto",p.current.style.height=Math.max(u?104:192,p.current.scrollHeight)+"px",p.current.scrollTop=N},[j,h,u]),t.createElement("label",{className:"df-field"+(h?" df-field-paragraph":"")+(u?" df-field-compact":""),id:"df-"+n.key},t.createElement("span",null,n.label,n.required&&t.createElement("em",null,"\u5FC5\u586B")),h?t.createElement("textarea",{ref:p,"aria-label":n.label,rows:u?3:8,value:j,onChange:N=>f(N.target.value)}):t.createElement("input",{"aria-label":n.label,type:n.kind,step:n.kind==="number"?"any":void 0,value:j,onChange:N=>f(N.target.value)}),n.help&&t.createElement("small",{className:"df-field-help"},n.help),t.createElement("small",null,n.key))}function kt({project:n,workflowStage:g,initialCaseId:f,initialView:h,initialDraft:u,onBack:j,onChanged:p,onDirtyChange:N,onBusyChange:r,onViewChange:z,docked:c=!1,onPreview:M,onStageStatus:F,onEditBasics:J}){let[d,T]=ne(null),[D,E]=ne(null),[L,Q]=ne([]),[$,b]=ne("import"),[w,G]=ne(!1),[W,P]=ne(null),[y,S]=ne(!1),[s,A]=ne(""),[v,I]=ne(""),[te,K]=ne(""),[O,ye]=ne(null),[Se,qe]=ne(null),ke=Ae(null),Ee=Ae(null),Ne=Ae(0),ie=Ae(!0),Be=pe.host.useTheme?.()||"light",ge=()=>p?.()||Promise.resolve();$e(()=>(ie.current=!0,(u?Promise.resolve(u):re("/cases/"+f)).then(a=>{ie.current&&(Z(a),b(h==="files"&&a.generations.length?"files":"edit"),h==="files"&&a.generations.length&&ye({file:a.generations[0].files[0],generation:a.generations[0]}))}).catch(a=>ie.current&&I(a.message)),(pe.workspace?.loadPreview?pe.workspace.loadPreview():Promise.resolve(le)).then(a=>{ie.current&&qe(()=>a)}).catch(a=>{ie.current&&qe(()=>le)}),()=>{ie.current=!1,Ne.current++}),[]),$e(()=>{N?.(w)},[w]),$e(()=>{r?.(s)},[s]),$e(()=>{z?.()},[$]),$e(()=>{let a=o=>{w&&(o.preventDefault(),o.returnValue="")};return window.addEventListener("beforeunload",a),()=>window.removeEventListener("beforeunload",a)},[w]);async function Y(a,o){if(s)return;let k=++Ne.current;A(a),I(""),K("");try{await o()}catch(B){ie.current&&k===Ne.current&&I(B.message)}finally{ie.current&&k===Ne.current&&A("")}}function Z(a){ie.current&&(T({...a,recipients:Ke(a.recipients),presentation_sources:Object.fromEntries(a.fields.map(o=>[o.key,o.value]))}),G(!1),P(null),S(!1))}function ze(a){T(a),G(!0),P(null),S(!1),K("")}function de(a,o,k,B=!1){let je=d.recipients.map((Ie,i)=>i===a?{...Ie,[o]:k,...o!=="name"?{["follow_"+o]:B}:{}}:Ie);ze({...d,recipients:Ke(je)})}async function V(){if(!w)return d;let a={revision:d.revision,name:d.name.trim()||"\u672A\u547D\u540D\u586B\u62A5",values:Object.fromEntries(d.fields.map(k=>[k.key,k.value])),recipients:d.recipients},o=await re("/cases/"+d.id,{...we(a),method:"PUT"});return Z(o),o}function Ce(){return!w||window.confirm("\u5F53\u524D\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\u3002\u79BB\u5F00\u6B64\u8BB0\u5F55\uFF1F")}let ae=d?.stage_id==="plan"&&d?.plan_schema===1,De=ae?"\u6587\u4E66\u6A21\u677F":"Word \u6A21\u677F",Te=ae?d.fields.filter(a=>a.scope!=="shared"):d?.fields||[],oe=d?.templates||[],fe=oe.reduce((a,o)=>a+(o.per_recipient?d.recipients.length:1),0),ee=d?.generations.find(a=>!c||(a.stage_id||d.original_stage_id||g.id)===g.id);$e(()=>{c&&$==="files"&&ee&&!O&&ye({file:ee.files[0],generation:ee})},[$,ee?.id]);let _=W?.checks.filter(a=>a.status!=="ok")||[];async function Le(a){!a||!Ce()||await Y("\u8BFB\u53D6 Excel",async()=>{let o=new FormData;o.append("workbook",a),o.append("revision",n.revision),o.append("stage_id",g.id);let k=await re(`/projects/${n.id}/${n.single_form?"form":"cases"}/import`,{method:"POST",body:o});Z(k),ye(null),b("edit"),await ge(),K(k.templates.length?"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\uFF0C\u5E76\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002":k.template_notice||"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\u3002\u8BF7\u6DFB\u52A0\u5BF9\u5E94\u7684 Word \u6A21\u677F\u3002")})}async function Ue(a){a=Array.from(a),a.length&&await Y("\u8BFB\u53D6 Word \u6A21\u677F",async()=>{let o=await V(),k=new FormData;k.append("revision",String(o.revision)),Array.from(a).forEach(B=>k.append("files",B)),Z(await re("/cases/"+o.id+"/templates",{method:"POST",body:k})),await ge(),K("Word \u6A21\u677F\u5DF2\u6DFB\u52A0\uFF0C\u751F\u6210\u65F6\u4F1A\u4FDD\u7559\u539F\u6709\u6392\u7248\u3002")})}async function xe(){await Y("\u6838\u5BF9\u8D44\u6599",async()=>{let a=await V(),o=await re("/cases/"+a.id+"/review",we({revision:a.revision}));ie.current&&(P(o),S(!1),b("review"),await ge())})}async function se(){await Y("\u751F\u6210\u6587\u4E66",async()=>{let a=await re("/cases/"+d.id+"/generate",we({revision:d.revision,review_token:W.review_token,confirmed:y}));Z(a),b("files"),ye({file:a.generations[0].files[0],generation:a.generations[0]}),await ge()})}function R(a){b("edit"),requestAnimationFrame(()=>{let o=document.getElementById("df-"+a);o?.scrollIntoView({behavior:"smooth",block:"center"}),o?.querySelector("input,textarea")?.focus()})}let Fe=(a,o)=>`/cases/${d.id}/outputs/${a.id}/${encodeURIComponent(o)}`;function _e(a){return Y("\u6B63\u5728\u4E0B\u8F7D\u538B\u7F29\u5305",async()=>{await Ve(Fe(a,"\u5168\u90E8\u6587\u4E66.zip"),a.bundle_name||d.name+"_\u6587\u4E66.zip"),K(`\u5DF2\u5F00\u59CB\u4E0B\u8F7D\u8BE5\u6279\u6B21\u7684 ${a.files.length} \u4EFD\u6587\u4E66\u538B\u7F29\u5305\u3002`)})}let H=O?{id:O.generation.id+O.file.name,title:O.file.name,source:"generated",mimeType:O.file.name.endsWith(".xlsx")?"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":wt,extension:O.file.name.endsWith(".xlsx")?"xlsx":"docx",binaryUrl:O.file.preview_url,printUrl:Re+`/cases/${d.id}/print/${O.generation.id}/${encodeURIComponent(O.file.name)}`,agentId:pe.host.getSelectedAgentId?.(),createdAt:Date.parse(O.generation.created_at)}:null;return $e(()=>{c&&$==="files"&&H&&M?.({artifact:H,reference:{case_id:d.id,generation_id:O.generation.id,name:O.file.name}})},[$,O?.generation.id,O?.file.name]),t.createElement("div",{className:"df-app df-embedded-editor","data-theme":Be},t.createElement("input",{ref:ke,type:"file",accept:".xlsx",hidden:!0,"aria-label":"\u5BFC\u5165 Excel \u53D8\u91CF\u8868",onChange:a=>{Le(a.target.files[0]),a.target.value=""}}),t.createElement("input",{ref:Ee,type:"file",accept:".docx,.xlsx",multiple:!0,hidden:!0,"aria-label":"\u5BFC\u5165 Word \u6A21\u677F",onChange:a=>{Ue(a.target.files),a.target.value=""}}),t.createElement("section",{className:"df-main"},t.createElement("div",{className:"df-editor-context"},t.createElement("button",{disabled:!!s,onClick:()=>{Ce()&&j()}},"\u2190 \u8FD4\u56DE",g.title),t.createElement("span",null,n.name," / ",g.title),c&&t.createElement("button",{disabled:!!s||w,title:w?"\u8BF7\u5148\u4FDD\u5B58\u8868\u5355":"\u66F4\u65B0\u5F53\u524D\u8282\u70B9\u7684\u529E\u7406\u4FE1\u606F",onClick:F},"\u529E\u7406\u4FE1\u606F\u4E0E\u72B6\u6001"),d&&t.createElement("div",{className:"df-actions"},t.createElement("button",{disabled:!!s,onClick:()=>{E("adopt"),Q([])}},"\u6838\u5BF9\u9879\u76EE\u8D44\u6599\u5DEE\u5F02"),t.createElement("button",{disabled:!!s,onClick:()=>{E("publish"),Q([])}},"\u5B58\u5165\u9879\u76EE\u5E95\u7A3F"))),t.createElement("header",{className:"df-header"},t.createElement("div",null,t.createElement("span",{className:"df-eyebrow"},g.title," / \u586B\u5199\u4E0E\u751F\u6210"),t.createElement("h1",null,d?c?g.title+" \xB7 \u9879\u76EE\u8868\u5355":d.name:"\u628A\u91CD\u590D\u586B\u5199\u7684\u8D44\u6599\uFF0C\u6574\u7406\u6210\u4E00\u5F20\u8868\u3002"),t.createElement("p",null,d?w?"\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539":`\u8349\u7A3F\u5DF2\u4FDD\u5B58 \xB7 ${Me(d.updated_at)}`:"\u5BFC\u5165\u53D8\u91CF\u8868\u4E0E Word \u6A21\u677F\uFF0C\u586B\u5199\u3001\u6838\u5BF9\uFF0C\u518D\u751F\u6210\u6587\u4E66\u3002")),d&&t.createElement("button",{disabled:!!s||!w,onClick:()=>Y("\u4FDD\u5B58\u8349\u7A3F",async()=>{await V(),await ge(),K("\u8349\u7A3F\u5DF2\u4FDD\u5B58")})},"\u4FDD\u5B58\u8349\u7A3F")),t.createElement("div",{className:"df-steps","aria-label":"\u586B\u5199\u6D41\u7A0B"},[["import","01","\u5BFC\u5165\u6A21\u677F"],["edit","02","\u586B\u5199\u8D44\u6599"],["review","03","\u6838\u5BF9\u751F\u6210"],["files","04","\u6587\u4EF6\u9884\u89C8"]].map(([a,o,k])=>t.createElement("button",{key:a,className:$===a?"active":"",disabled:!!s||!d&&a!=="import"||a==="files"&&!ee,onClick:()=>a==="review"?xe():b(a)},t.createElement("span",null,o),k))),v&&t.createElement("div",{className:"df-alert error",role:"alert"},v,t.createElement("button",{"aria-label":"\u5173\u95ED\u9519\u8BEF\u63D0\u793A",onClick:()=>I("")},"\xD7")),te&&t.createElement("div",{className:"df-alert",role:"status"},te),s&&t.createElement("div",{className:"df-progress",role:"status"},s,"\u2026"),t.createElement("fieldset",{className:"df-content",disabled:!!s},$==="import"&&t.createElement("div",{className:"df-import"},t.createElement("section",{className:"df-paper df-drop"},t.createElement("div",{className:"df-file-mark"},"XLSX"),t.createElement("h2",null,"\u4ECE Excel \u53D8\u91CF\u8868\u5F00\u59CB"),t.createElement("p",null,"\u201C\u53D8\u91CF\u914D\u7F6E\u201D\u5DE5\u4F5C\u8868\u4FDD\u7559\u4E09\u5217\uFF1A",t.createElement("br",null),t.createElement("b",null,"\u53D8\u91CF\u540D\u79F0\u3000\u4E2D\u6587\u540D\u79F0\u3000\u503C")),t.createElement("button",{className:"df-primary",onClick:()=>ke.current.click()},"\u9009\u62E9 Excel \u53D8\u91CF\u8868"),t.createElement("small",null,"\u652F\u6301 .xlsx \xB7 \u5355\u4E2A\u6587\u4EF6\u4E0D\u8D85\u8FC7 15 MB")),t.createElement("section",{className:"df-paper df-import-note"},t.createElement("span",{className:"df-eyebrow"},"\u5982\u4F55\u51C6\u5907"),t.createElement("h2",null,"\u4E00\u4EFD\u6570\u636E\uFF0C\u591A\u4EFD\u6587\u4E66"),t.createElement("ol",null,t.createElement("li",null,t.createElement("b",null,"\u6574\u7406\u53D8\u91CF"),t.createElement("p",null,"\u4F8B\u5982 project.name / \u9879\u76EE\u540D\u79F0 / \u5B9E\u9645\u540D\u79F0\u3002\u652F\u6301\u5206\u7EC4\u3001\u7C7B\u578B\u548C\u5FC5\u586B\u5217\u3002")),t.createElement("li",null,t.createElement("b",null,"\u81EA\u52A8\u8F7D\u5165\u6A21\u677F"),t.createElement("p",null,"\u5E94\u7528\u81EA\u5E26 5 \u4EFD\u6807\u51C6 Word \u6A21\u677F\uFF0C\u4F7F\u7528\u914D\u5957 Excel \u5373\u53EF\u81EA\u52A8\u8F7D\u5165\uFF1B \u4E5F\u53EF\u6DFB\u52A0\u81EA\u5DF1\u7684\u6A21\u677F\u3002")),t.createElement("li",null,t.createElement("b",null,"\u5206\u522B\u751F\u6210\u9080\u8BF7\u51FD"),t.createElement("p",null,"\u5728\u201C\u53D7\u9080\u5355\u4F4D\u201D\u8868\u8BB0\u5F55\u5355\u4F4D\u540D\u79F0\u3001\u9886\u53D6\u5F00\u59CB\u65F6\u95F4\u548C\u9886\u53D6\u7ED3\u675F\u65F6\u95F4\u3002"))),t.createElement("p",{className:"df-muted"},"\u201C\u65E5\u671F\u6821\u6838\u201D\u8868\u4E2D\u7684\u65E7\u7ED3\u679C\u4E0D\u4F1A\u4F5C\u4E3A\u5224\u65AD\u4F9D\u636E\uFF1B\u5E94\u7528\u4F1A\u6839\u636E\u5F53\u524D\u586B\u5199\u5185\u5BB9\u91CD\u65B0\u6838\u5BF9\u3002\u201C\u6821\u6838\u89C4\u5219\u201D\u8868\u53EF\u8865\u5145\u81EA\u5B9A\u4E49\u5148\u540E\u5173\u7CFB\u3002"))),d&&($==="edit"||c&&$==="files")&&t.createElement("div",{className:"df-edit-layout"},t.createElement("section",{className:"df-paper"},t.createElement("div",{className:"df-section-head"},t.createElement("h2",null,"\u586B\u5199\u4FE1\u606F"),t.createElement("button",{onClick:()=>Y("\u5BFC\u51FA Excel",async()=>{let a=await V();await Ve(`/cases/${a.id}/excel`,(a.fields.find(o=>o.key==="project.name")?.value||a.name).replace(/[<>:"/\\|?*\x00-\x1f]/g,"_").slice(0,80)+"_\u586B\u5199\u6570\u636E.xlsx")})},"\u5BFC\u51FA\u5F53\u524D Excel")),t.createElement("label",{className:"df-field df-title-field"},t.createElement("span",null,"\u8868\u5355\u540D\u79F0"),t.createElement("input",{"aria-label":"\u8868\u5355\u540D\u79F0",maxLength:120,value:d.name,onChange:a=>ze({...d,name:a.target.value})})),ae&&t.createElement("section",{className:"df-plan-reference","aria-label":"\u5F15\u7528\u7684\u57FA\u7840\u4FE1\u606F"},t.createElement("div",{className:"df-section-head"},t.createElement("div",null,t.createElement("h3",null,"\u5F15\u7528\u7684\u57FA\u7840\u4FE1\u606F"),t.createElement("p",{className:"df-muted"},"\u8FD9\u4E9B\u8D44\u6599\u7531\u57FA\u7840\u4FE1\u606F\u586B\u62A5\u7EF4\u62A4\uFF0C\u6838\u5BF9\u540E\u7528\u4E8E\u672C\u6B21\u751F\u6210\u3002")),J&&t.createElement("button",{onClick:()=>Y("\u4FDD\u5B58\u5E76\u6253\u5F00\u57FA\u7840\u4FE1\u606F",async()=>{await V(),J()})},"\u7F16\u8F91\u57FA\u7840\u4FE1\u606F")),t.createElement("details",null,t.createElement("summary",null,"\u67E5\u770B\u9879\u76EE\u80CC\u666F\u3001\u7814\u7A76\u5185\u5BB9\u4E0E\u7ECF\u8D39\u4FE1\u606F"),t.createElement("dl",null,d.fields.filter(a=>a.scope==="shared").map(a=>t.createElement("div",{key:a.key,id:"df-"+a.key},t.createElement("dt",null,a.label),t.createElement("dd",null,a.value||"\u5C1A\u672A\u586B\u5199\uFF0C\u8BF7\u5230\u57FA\u7840\u4FE1\u606F\u586B\u62A5\u8865\u5145")))))),[...new Set(Te.map(a=>a.group))].map(a=>t.createElement("section",{className:"df-group",key:a},t.createElement("h3",null,a),a==="\u65E5\u671F\u5B89\u6392"&&t.createElement("p",{className:"df-muted"},"\u6587\u4E66\u7EDF\u4E00\u4F7F\u7528\u4E2D\u6587\u65E5\u671F\uFF0C\u4F8B\u5982\u201C2026\u5E7410\u670822\u65E5\u4E0B\u534814:30\u201D\u3002\u65E5\u671F\u9009\u62E9\u5668\u4FDD\u7559\u539F\u6765\u7684\u586B\u5199\u65B9\u5F0F\u3002"),t.createElement("div",{className:"df-fields"},Te.filter(o=>o.group===a).map(o=>t.createElement(pt,{key:o.key,field:o,displayValue:d.presentation_sources?.[o.key]===o.value?d.document_values?.[o.key]:void 0,onChange:k=>ze({...d,fields:d.fields.map(B=>B.key===o.key?{...B,value:k}:B)})})))))),!ae&&t.createElement("section",{className:"df-paper"},t.createElement("div",{className:"df-section-head"},t.createElement("div",null,t.createElement("h2",null,"\u53D7\u9080\u5355\u4F4D"," ",t.createElement("span",{className:"df-count"},d.recipients.length)),t.createElement("p",null,"\u6309\u5355\u4F4D\u6587\u4E66\u5206\u522B\u751F\u6210\uFF0C\u5171\u7528\u9879\u76EE\u4E0E\u843D\u6B3E\u4FE1\u606F\u3002")),t.createElement("button",{onClick:()=>ze({...d,recipients:Ke([...d.recipients,{name:"",start:"",end:""}])}),disabled:d.recipients.length>=200},"\uFF0B \u6DFB\u52A0\u5355\u4F4D")),d.recipients.map((a,o)=>t.createElement("div",{className:"df-recipient",key:o,id:"df-recipient-"+o},t.createElement("div",{className:"df-recipient-title"},t.createElement("b",null,String(o+1).padStart(2,"0")),t.createElement("button",{"aria-label":`\u79FB\u9664\u7B2C${o+1}\u5BB6\u5355\u4F4D`,onClick:()=>ze({...d,recipients:Ke(d.recipients.filter((k,B)=>B!==o))})},"\u79FB\u9664")),t.createElement("div",{className:"df-fields"},[["name","\u5355\u4F4D\u540D\u79F0"],["start","\u9886\u53D6\u5F00\u59CB\u65F6\u95F4"],["end","\u9886\u53D6\u7ED3\u675F\u65F6\u95F4"]].map(([k,B])=>t.createElement("label",{className:"df-field "+(k==="name"?"df-span":""),key:k},t.createElement("span",null,B),t.createElement("input",{"aria-label":`\u7B2C${o+1}\u5BB6${B}`,type:k==="name"?"text":"datetime-local",value:k==="name"?a[k]:a[k].replace(" ","T"),onChange:je=>de(o,k,je.target.value)}),o>0&&k!=="name"&&t.createElement("small",{className:"df-follow-state"},a["follow_"+k]?"\u8DDF\u968F\u7B2C1\u5BB6":"\u5DF2\u5355\u72EC\u8BBE\u7F6E",!a["follow_"+k]&&t.createElement("button",{type:"button","aria-label":`\u7B2C${o+1}\u5BB6${B}\u6062\u590D\u8DDF\u968F`,onClick:je=>{je.preventDefault(),de(o,k,d.recipients[0][k],!0)}},"\u6062\u590D\u8DDF\u968F")))))))),t.createElement("section",{className:"df-paper df-template-panel","aria-label":De},t.createElement("div",{className:"df-section-head"},t.createElement("h2",null,De),t.createElement("div",{className:"df-template-actions"},oe.length>0?t.createElement("button",{onClick:()=>Y("\u4FDD\u5B58\u9ED8\u8BA4\u6A21\u677F",async()=>{let a=await V();await re(`/cases/${a.id}/defaults`,we({revision:a.revision})),K(g.id==="negotiation"?"\u5DF2\u8BBE\u4E3A\u672C\u673A\u9ED8\u8BA4\u6A21\u677F\uFF0C\u4EE5\u540E\u65B0\u5EFA\u586B\u62A5\u4F1A\u81EA\u52A8\u8F7D\u5165\u3002":"\u5DF2\u8BBE\u4E3A\u672C\u9636\u6BB5\u9ED8\u8BA4\u6A21\u677F\uFF0C\u4EE5\u540E\u65B0\u5EFA\u8BE5\u9636\u6BB5\u8868\u5355\u4F1A\u81EA\u52A8\u8F7D\u5165\u3002")})},g.id==="negotiation"?"\u8BBE\u4E3A\u9ED8\u8BA4\u6A21\u677F":"\u8BBE\u4E3A\u672C\u9636\u6BB5\u9ED8\u8BA4\u6A21\u677F"):t.createElement("button",{onClick:()=>Y("\u8F7D\u5165\u9ED8\u8BA4\u6A21\u677F",async()=>{let a=await V();Z(await re(`/cases/${a.id}/defaults/apply`,we({revision:a.revision}))),K("\u5DF2\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002")})},"\u4F7F\u7528\u9ED8\u8BA4\u6A21\u677F"),t.createElement("button",{onClick:()=>Ee.current.click()},"\uFF0B \u6DFB\u52A0"))),!oe.length&&t.createElement("p",{className:"df-muted"},"\u6DFB\u52A0\u4E0E\u4F60\u7684\u53D8\u91CF\u8868\u5BF9\u5E94\u7684 .docx \u6216 .xlsx \u6A21\u677F\u3002"),oe.map(a=>t.createElement("div",{className:"df-template",key:a.id},t.createElement("b",null,a.name),a.from_builtin&&t.createElement("small",null,"\u5E94\u7528\u81EA\u5E26\u6A21\u677F"),t.createElement("span",null,a.per_recipient?"\u6309\u53D7\u9080\u5355\u4F4D\u5206\u522B\u751F\u6210":"\u5171\u7528\u6587\u4EF6 \xB7 \u751F\u6210\u4E00\u4EFD"),a.print_copies>1&&t.createElement("small",null,"\u5EFA\u8BAE\u6253\u5370 ",a.print_copies," \u4EFD \xB7 ",a.print_note),t.createElement("small",null,a.keys.length," \u4E2A\u5F15\u7528\u53D8\u91CF"),t.createElement("button",{"aria-label":"\u79FB\u9664\u6A21\u677F"+a.name,onClick:()=>Y("\u79FB\u9664\u6A21\u677F",async()=>{let o=await V();Z(await re(`/cases/${o.id}/templates/${a.id}?revision=${o.revision}`,{method:"DELETE"}))})},"\u79FB\u9664")))),t.createElement("section",{className:"df-paper df-edit-footer","aria-label":"\u6838\u5BF9\u4E0E\u751F\u6210"},t.createElement("div",{className:"df-generation-plan"},t.createElement("h2",null,"\u6838\u5BF9\u4E0E\u751F\u6210"),t.createElement("p",null,"\u672C\u6B21\u8BA1\u5212\u751F\u6210 ",t.createElement("b",null,fe)," \u4EFD\u6587\u4E66"),t.createElement("small",null,ae?"\u6309\u672C\u6B21\u586B\u5199\u5185\u5BB9\u751F\u6210 Word \u8BF4\u660E\u4E0E Excel \u8BA1\u5212\u8868\u3002":t.createElement(t.Fragment,null,oe.filter(a=>!a.per_recipient).length," ","\u4EFD\u5171\u7528\u6587\u4EF6 \xB7"," ",oe.filter(a=>a.per_recipient).length," ","\u7C7B\u6309\u5355\u4F4D\u6587\u4E66 \xD7 ",d.recipients.length," \u5BB6\u5355\u4F4D"))),t.createElement("div",{className:"df-next-action"},t.createElement("button",{className:"df-primary",onClick:xe},"\u6838\u5BF9\u586B\u5199\u5185\u5BB9 \u2192"),t.createElement("small",null,ae?"\u5148\u6838\u5BF9\u57FA\u7840\u4FE1\u606F\u4E0E\u7533\u62A5\u7ECF\u8D39\uFF0C\u518D\u786E\u8BA4\u751F\u6210":"\u5148\u6838\u5BF9\u7F3A\u9879\u4E0E\u65E5\u671F\uFF0C\u518D\u786E\u8BA4\u751F\u6210")))),d&&$==="review"&&W&&t.createElement("div",{className:"df-review"},t.createElement("section",{className:"df-paper"},t.createElement("span",{className:"df-eyebrow"},"\u586B\u5199\u6838\u5BF9"),t.createElement("h2",null,W.can_generate?"\u8D44\u6599\u5DF2\u9F50\u5907\uFF0C\u8BF7\u786E\u8BA4\u672C\u6B21\u5185\u5BB9\u3002":`\u8FD8\u6709 ${_.length} \u9879\u9700\u8981\u5904\u7406`),t.createElement("p",null,"\u672C\u6B21\u4F7F\u7528\u4FEE\u8BA2 ",d.revision," \u7684\u6570\u636E\uFF0C\u8BA1\u5212\u751F\u6210 ",fe," ","\u4EFD\u6587\u4E66\u3002"),_.length>0&&t.createElement("div",{className:"df-checks"},_.map((a,o)=>t.createElement("div",{key:o,className:"df-check "+a.status},t.createElement("span",null,a.status==="ok"?"\u901A\u8FC7":a.status==="missing"?"\u5F85\u8865\u5145":"\u51B2\u7A81"),t.createElement("div",null,t.createElement("b",null,a.label),t.createElement("p",null,a.detail)),a.status!=="ok"&&a.field&&t.createElement("button",{onClick:()=>R(a.field)},"\u4FEE\u6539")))),W.checks.some(a=>a.status==="ok")&&t.createElement("details",{className:"df-passed"},t.createElement("summary",null,W.checks.filter(a=>a.status==="ok").length," ","\u9879\u65E5\u671F\u6821\u6838\u901A\u8FC7 \xB7 \u67E5\u770B\u660E\u7EC6"),W.checks.filter(a=>a.status==="ok").map((a,o)=>t.createElement("p",{key:o},t.createElement("b",null,a.label),t.createElement("br",null),a.detail.replaceAll("T"," ")))),t.createElement("div",{className:"df-review-data"},t.createElement("h3",null,"\u5171\u7528\u4FE1\u606F"),t.createElement("dl",null,d.fields.map(a=>t.createElement("div",{key:a.key,className:lt(a)?"df-span":void 0},t.createElement("dt",null,a.label),t.createElement("dd",null,(d.document_values?.[a.key]??a.value)||"\u5C1A\u672A\u586B\u5199")))),d.recipients.length>0&&t.createElement(t.Fragment,null,t.createElement("h3",null,"\u53D7\u9080\u5355\u4F4D"),d.recipients.map((a,o)=>t.createElement("p",{key:o},o+1,". ",a.name||"\u5C1A\u672A\u586B\u5199",d.recipient_document_times?.[o]??`${a.start.replace("T"," ")} \u2014 ${a.end.replace("T"," ")}`)))),t.createElement("div",{className:"df-review-data"},t.createElement("h3",null,"\u8F93\u51FA\u6E05\u5355"),oe.map(a=>t.createElement("p",{key:a.id},a.name," \xB7"," ",a.per_recipient?d.recipients.map(o=>o.name||"\u5F85\u586B\u5355\u4F4D").join("\u3001"):"\u5171\u7528\u6587\u4EF6",a.print_copies>1&&` \xB7 \u5EFA\u8BAE\u6253\u5370 ${a.print_copies} \u4EFD\uFF0C\u6BCF\u4F4D\u4E13\u5BB6\u4E00\u4EFD`))),t.createElement("div",{className:"df-confirm"},t.createElement("label",null,t.createElement("input",{type:"checkbox",checked:y,disabled:!W.can_generate,onChange:a=>S(a.target.checked)}),ae?"\u6211\u5DF2\u6838\u5BF9\u57FA\u7840\u4FE1\u606F\u3001\u7533\u62A5\u7ECF\u8D39\u548C\u5916\u534F\u5FC5\u8981\u6027":"\u6211\u5DF2\u6838\u5BF9\u586B\u5199\u5185\u5BB9\u3001\u53D7\u9080\u5355\u4F4D\u548C\u65E5\u671F\u5B89\u6392"),t.createElement("p",null,ae?"\u7533\u62A5\u53E3\u5F84\u4E0E\u6A21\u677F\u7248\u5F0F\u8BF7\u7531\u7ECF\u529E\u4EBA\u590D\u6838\u3002":"\u6821\u6838\u68C0\u67E5\u8D44\u6599\u5B8C\u6574\u6027\u53CA\u65F6\u95F4\u987A\u5E8F\u3002\u4E1A\u52A1\u6761\u6B3E\u4E0E Word \u6A21\u677F\u8BF7\u7531\u7ECF\u529E\u4EBA\u590D\u6838\u3002"),t.createElement("div",null,t.createElement("button",{onClick:()=>{b("edit"),S(!1)}},"\u8FD4\u56DE\u4FEE\u6539"),t.createElement("button",{className:"df-primary",disabled:!W.can_generate||!y,onClick:se},"\u786E\u8BA4\u5E76\u751F\u6210 ",fe," \u4EFD\u6587\u4E66"))))),d&&$==="files"&&ee&&!c&&t.createElement("div",{className:"df-results"},t.createElement("section",{className:"df-paper df-output-list"},t.createElement("span",{className:"df-eyebrow"},"\u751F\u6210\u8BB0\u5F55"),t.createElement("h2",null,ee.files.length," \u4EFD\u6587\u4EF6\u5DF2\u751F\u6210"),t.createElement("p",null,Me(ee.created_at)," \xB7 \u4FEE\u8BA2 ",ee.revision),t.createElement("p",{className:"df-muted"},ae?"\u538B\u7F29\u5305\u5305\u542B Word\u3001\u79D1\u7814\u8BA1\u5212\u8868\u3001\u586B\u5199\u6570\u636E\u548C\u6838\u5BF9\u8BB0\u5F55":"\u538B\u7F29\u5305\u5305\u542B Word\u3001\u586B\u5199\u6570\u636E\u548C\u6838\u5BF9\u8BB0\u5F55"),(w||(ee.content_digest?ee.content_digest!==d.content_digest:ee.revision!==d.revision))&&t.createElement("div",{className:"df-alert"},"\u586B\u5199\u5185\u5BB9\u5DF2\u6709\u4FEE\u6539\uFF0C\u4E0B\u5217\u6587\u4EF6\u4FDD\u7559\u751F\u6210\u65F6\u7684\u5185\u5BB9\u3002\u8BF7\u91CD\u65B0\u6838\u5BF9\u5E76\u751F\u6210\u65B0\u7248\u3002"),d.generations.map(a=>t.createElement("div",{className:"df-generation",key:a.id},t.createElement("div",{className:"df-generation-heading"},t.createElement("h3",null,Me(a.created_at)," \xB7 \u4FEE\u8BA2 ",a.revision,a.date_style!=="zh-CN"&&" \xB7 \u539F\u65E5\u671F\u683C\u5F0F",a.naming_style!=="formal"&&" \xB7 \u539F\u6587\u4EF6\u540D"),t.createElement("button",{"aria-label":`\u6253\u5305\u4E0B\u8F7D ${Me(a.created_at)} \u4FEE\u8BA2 ${a.revision}`,onClick:()=>_e(a)},"\u6253\u5305\u4E0B\u8F7D")),a.files.map(o=>t.createElement("div",{className:"df-output "+(O?.file.name===o.name&&O?.generation.id===a.id?"selected":""),key:o.name},t.createElement("button",{onClick:()=>ye({file:o,generation:a})},t.createElement("b",null,o.name),t.createElement("small",null,o.recipient," \xB7 ",(o.size/1024).toFixed(0)," KB",o.print_copies>1&&` \xB7 \u5EFA\u8BAE\u6253\u5370 ${o.print_copies} \u4EFD`)),t.createElement("button",{"aria-label":"\u4E0B\u8F7D"+o.name,onClick:()=>Y("\u4E0B\u8F7D\u6587\u4EF6",()=>Ve(Fe(a,o.name),o.name))},"\u2193")))))),t.createElement("section",{className:"df-paper df-preview"},t.createElement("div",{className:"df-section-head"},t.createElement("h2",null,O?O.file.name:"\u9009\u62E9\u6587\u4EF6\u9884\u89C8"),t.createElement("span",null,"Office \u9884\u89C8")),t.createElement("div",{className:"df-preview-body"},H&&Se?t.createElement(Qe,{key:H.id,artifact:H},t.createElement(Se,{key:H.id,artifact:H,readOnly:!0,hostControls:!0})):t.createElement("p",{className:"df-muted"},H?"\u6B63\u5728\u6253\u5F00\u6587\u4EF6\u2026":"\u4ECE\u5DE6\u4FA7\u9009\u62E9\u4E00\u4EFD\u6587\u4EF6\u3002"))))),t.createElement("footer",{className:"df-footer"},t.createElement("span",null,"UGSci \xB7 \u6587\u4E66\u586B\u62A5"),t.createElement("span",null,"\u6570\u636E\u4E0E\u6587\u4E66\u4FDD\u5B58\u5728\u5F53\u524D\u670D\u52A1\u7AEF \xB7 \u65E0\u9700\u6A21\u578B\u670D\u52A1"))),D&&d&&t.createElement("div",{className:"df-dialog-backdrop"},t.createElement("section",{className:"df-dialog df-paper",role:"dialog","aria-modal":"true","aria-label":"\u6838\u5BF9\u5171\u7528\u8D44\u6599"},t.createElement("div",{className:"df-section-head"},t.createElement("h2",null,D==="adopt"?"\u91C7\u7528\u9879\u76EE\u5E95\u7A3F\u4E2D\u7684\u8D44\u6599":"\u5C06\u672C\u8868\u8D44\u6599\u5B58\u5165\u9879\u76EE\u5E95\u7A3F"),t.createElement("button",{disabled:!!s,onClick:()=>E(null),"aria-label":"\u5173\u95ED\u5171\u7528\u8D44\u6599\u6838\u5BF9"},"\xD7")),t.createElement("p",{className:"df-muted"},"\u53EA\u66F4\u65B0\u52FE\u9009\u9879\u3002\u539F\u751F\u6210\u6587\u4EF6\u4FDD\u7559\uFF0C\u540E\u7EED\u751F\u6210\u524D\u9700\u91CD\u65B0\u6838\u5BF9\u3002"),v&&t.createElement("p",{role:"alert",className:"df-alert error"},v),t.createElement("div",{className:"df-compare"},n.fields.filter(a=>d.fields.some(o=>o.key===a.key&&o.value!==a.value)).map(a=>{let o=d.fields.find(k=>k.key===a.key);return t.createElement("label",{key:a.key},t.createElement("input",{type:"checkbox",checked:L.includes(a.key),onChange:k=>Q(k.target.checked?[...L,a.key]:L.filter(B=>B!==a.key))}),t.createElement("div",null,t.createElement("b",null,a.label),t.createElement("div",{className:"df-compare-values"},t.createElement("p",null,t.createElement("small",null,"\u5F53\u524D\u8868\u5355"),o.value||"\u7A7A\u767D"),t.createElement("p",null,t.createElement("small",null,"\u9879\u76EE\u5E95\u7A3F"),a.value||"\u7A7A\u767D"))))}),!n.fields.some(a=>d.fields.some(o=>o.key===a.key&&o.value!==a.value))&&t.createElement("p",null,"\u672C\u8868\u4E0E\u9879\u76EE\u5E95\u7A3F\u4E2D\u7684\u5171\u7528\u8D44\u6599\u4E00\u81F4\u3002")),t.createElement("div",{className:"df-actions"},t.createElement("button",{disabled:!!s,onClick:()=>E(null)},"\u53D6\u6D88"),t.createElement("button",{className:"df-primary",disabled:!!s||!L.length,onClick:()=>Y("\u540C\u6B65\u5171\u7528\u8D44\u6599",async()=>{let a=await V();if(D==="adopt")Z(await re(`/projects/${n.id}/cases/${a.id}/sync`,we({revision:n.revision,case_revision:a.revision,keys:L})));else{let o=Object.fromEntries(a.fields.filter(k=>L.includes(k.key)).map(k=>[k.key,k.value]));await re(`/projects/${n.id}`,{...we({revision:n.revision,name:o["project.name"]??n.name,code:o["project.code"]??n.code,owner:n.owner,values:o}),method:"PUT"})}await ge(),E(null),K("\u6240\u9009\u8D44\u6599\u5DF2\u540C\u6B65\uFF0C\u8BF7\u91CD\u65B0\u6838\u5BF9\u540E\u751F\u6210\u65B0\u7248\u6587\u4E66\u3002")})},D==="adopt"?"\u91C7\u7528\u6240\u9009\u9879\u76EE\u8D44\u6599":"\u4FDD\u5B58\u6240\u9009\u8D44\u6599\u5230\u5E95\u7A3F")))))}function Nt(){let n=pe.host.useSelectedAgent?.();return t.createElement(Ze,{key:n?.id||pe.host.getSelectedAgentId?.()||"default",Editor:kt,services:{request:re,json:we,download:Ve,time:Me,Field:pt}})}pe.registerRoutes("document-forms",[{path:"/apps/document-forms",component:Nt,label:"\u6587\u4E66\u586B\u62A5",icon:"\u25A4"}]);})();
