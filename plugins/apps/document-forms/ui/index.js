(()=>{var H=window.QwenPaw.host.React,{useEffect:da,useState:We}=H;function Lt({artifact:a,children:s}){return a.extension==="xlsx"?s:H.createElement(Fa,{artifact:a},s)}function Fa({artifact:a,children:s}){let[r,p]=We("print"),[h,d]=We([]),[g,m]=We(0),[c,x]=We(""),[o,b]=We(0),[v,q]=We(100);return da(()=>{if(r!=="print")return;let N=new AbortController,D=[];return d([]),m(0),x(""),window.QwenPaw.host.fetch(a.printUrl+"?pages=true",{headers:a.agentId?{"X-Agent-Id":a.agentId}:{},signal:N.signal}).then(async w=>{if(!w.ok){let I=await w.json().catch(()=>({}));throw new Error(typeof I.detail=="string"?I.detail:"\u6253\u5370\u9884\u89C8\u6682\u4E0D\u53EF\u7528\uFF0C\u53EF\u5207\u6362\u6587\u5B57\u9884\u89C8\u6216\u4E0B\u8F7D Word \u67E5\u770B")}let{pages:k}=await w.json();if(!N.signal.aborted){if(!Number.isInteger(k)||k<1||k>40)throw new Error("\u672A\u83B7\u5F97\u6709\u6548\u7684 Word \u9875\u6570");m(k);for(let I=1;I<=k;I++){let T=await window.QwenPaw.host.fetch(a.printUrl+"?page="+I,{headers:a.agentId?{"X-Agent-Id":a.agentId}:{},signal:N.signal});if(!T.ok)throw new Error(`\u7B2C ${I} \u9875\u672A\u80FD\u6E32\u67D3\uFF0C\u8BF7\u91CD\u65B0\u9884\u89C8`);let S=await T.blob();if(N.signal.aborted)return;let z=URL.createObjectURL(S);D.push(z),d(u=>[...u,z])}}}).catch(w=>{N.signal.aborted||x(w.message||"\u6253\u5370\u9884\u89C8\u672A\u5B8C\u6210")}),()=>{N.abort(),D.forEach(w=>URL.revokeObjectURL(w))}},[a.id,a.printUrl,a.agentId,r,o]),H.createElement("div",{className:"df-print-preview"},H.createElement("div",{className:"df-print-toolbar"},H.createElement("div",null,H.createElement("button",{"aria-pressed":r==="print",onClick:()=>p("print")},"\u6253\u5370\u7248\u5F0F"),H.createElement("button",{"aria-pressed":r==="text",onClick:()=>p("text")},"\u6587\u5B57\u9884\u89C8")),r==="print"&&H.createElement("div",null,g>0&&H.createElement("span",null,"\u5171 ",g," \u9875"),H.createElement("select",{"aria-label":"\u9884\u89C8\u6BD4\u4F8B",value:v,onChange:N=>q(Number(N.target.value))},H.createElement("option",{value:100},"\u9002\u5408\u5BBD\u5EA6"),H.createElement("option",{value:125},"125%"),H.createElement("option",{value:150},"150%"),H.createElement("option",{value:200},"200%")))),r==="text"?H.createElement("div",{className:"df-text-preview"},s):c?H.createElement("div",{className:"df-preview-message",role:"alert"},H.createElement("p",null,c),H.createElement("button",{onClick:()=>b(N=>N+1)},"\u91CD\u65B0\u9884\u89C8")):h.length?H.createElement("div",{className:"df-print-scroll"},H.createElement("div",{className:"df-print-pages",style:{width:v+"%"}},h.map((N,D)=>H.createElement("figure",{key:D},H.createElement("figcaption",null,"\u7B2C ",D+1," \u9875"),H.createElement("img",{src:N,alt:a.title+` \xB7 \u6253\u5370\u7248\u5F0F \xB7 \u7B2C ${D+1} \u9875`}))),h.length<g&&H.createElement("p",{role:"status"},"\u6B63\u5728\u6392\u7248\u7B2C ",h.length+1," \u9875\u2026"))):H.createElement("div",{className:"df-preview-message",role:"status"},"\u6B63\u5728\u6392\u7248\u6253\u5370\u9875\u9762\u2026"))}function Oe({artifact:a}){let[s,r]=We(null),[p,h]=We(""),[d,g]=We(0);if(da(()=>{let c=new AbortController;return r(null),h(""),window.QwenPaw.host.fetch("/workspace/convert-office",{method:"POST",headers:{"Content-Type":"application/json",...a.agentId?{"X-Agent-Id":a.agentId}:{}},signal:c.signal,body:JSON.stringify({url:a.binaryUrl,mime_type:a.mimeType})}).then(async x=>{let o=await x.json();if(!x.ok)throw new Error(typeof o.detail=="string"?o.detail:"\u6587\u4EF6\u9884\u89C8\u672A\u5B8C\u6210");c.signal.aborted||r(o)}).catch(x=>{c.signal.aborted||h(x.message||"\u6587\u4EF6\u9884\u89C8\u672A\u5B8C\u6210")}),()=>c.abort()},[a.id,a.binaryUrl,a.mimeType,a.agentId,d]),p)return H.createElement("div",{className:"df-preview-message",role:"alert"},H.createElement("p",null,p),H.createElement("button",{onClick:()=>g(c=>c+1)},"\u91CD\u65B0\u9884\u89C8"),H.createElement("p",null,"\u4E5F\u53EF\u4EE5\u4ECE\u6587\u4EF6\u6E05\u5355\u4E0B\u8F7D\u540E\u67E5\u770B\u3002"));if(!s)return H.createElement("div",{className:"df-preview-message",role:"status"},"\u6B63\u5728\u6253\u5F00\u6587\u4EF6\u2026");let m=s.engine==="officecli"?s.html:`<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;color:#333;background:#fff;padding:24px 32px;line-height:1.7;max-width:900px;margin:0 auto}table{border-collapse:collapse;width:100%;margin:12px 0}td,th{border:1px solid #ddd;padding:8px 12px}img{max-width:100%;height:auto}h1{font-size:1.6em}h2{font-size:1.3em}.docx-page-break{border-top:2px dashed #ccc;margin:32px 0}</style></head><body>${s.html||""}</body></html>`;return H.createElement("iframe",{className:"df-office-frame",title:a.title,srcDoc:m,sandbox:s.engine==="officecli"?"allow-scripts":"allow-same-origin"})}var sa=`.df-app {
  --df-bg: var(--app-bg);
  --df-paper: var(--app-surface);
  --df-text: var(--app-text);
  --df-muted: var(--app-text-secondary);
  --df-line: var(--app-border);
  --df-accent: var(--app-accent);
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
  background: var(--app-accent);
  color: var(--app-text-inverse);
  border-color: var(--app-accent);
}
.df-app .df-primary:hover {
  background: var(--app-accent-hover);
}
.df-sidebar {
  width: 236px;
  flex-shrink: 0;
  border-right: 1px solid var(--df-line);
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  overflow: auto;
}
.df-brand {
  font-family: inherit;
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
  font-size: 13px;
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
  font-size: 13px;
  color: var(--df-muted);
  display: block;
}
.df-sidebar-foot {
  margin-top: auto;
  padding-top: 35px;
  color: var(--df-muted);
  font-size: 13px;
}
.df-sidebar-foot p {
  margin: 8px 0 14px;
}
.df-sidebar-foot button {
  font-size: 13px;
  margin-bottom: 8px;
}
.df-main {
  flex: 1;
  min-width: 0;
  overflow: auto;
  padding: 24px 28px 16px;
}
.df-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 20px;
}
.df-eyebrow {
  font-size: 13px;
  letter-spacing: 0.15em;
  color: var(--df-muted);
}
.df-app h1 {
  font-weight: 550;
  font-size: calc(24px * var(--app-font-scale, 1));
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
  font-size: 13px;
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
  font-size: 13px;
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
  font-size: 13px;
  color: var(--df-muted);
  margin: 5px 0;
}
.df-muted {
  font-size: 13px;
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
  font-size: 13px;
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
.df-plan-partners {
  grid-column: 1 / -1;
  display: grid;
  gap: 14px;
  min-width: 0;
}
.df-plan-partners > span {
  font-size: 13px;
  font-weight: 500;
}
.df-plan-partners > small {
  font-size: 13px;
  color: var(--df-muted);
}
.df-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  scroll-margin: 100px;
}
.df-field > span,
.df-recipient .df-field > label {
  font-size: 13px;
  font-weight: 500;
}
.df-field-label {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  min-height: 20px;
  font-size: 13px;
  font-weight: 500;
}
.df-field-label > label,
.df-field-label > span:not(.df-field-help) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.df-required {
  color: #d92d20;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
}
.df-app[data-theme="dark"] .df-required {
  color: #ff8a80;
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
  font-size: 13px;
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
.df-field .df-field-validation {
  color: var(--app-error-text, #b42318);
  font: inherit;
  opacity: 1;
  word-break: normal;
}
.df-field ul.df-field-validation {
  margin: 0;
  padding-inline-start: 18px;
}
.df-app .df-field input[aria-invalid="true"] {
  border-color: var(--app-error-text, #b42318);
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
  font-size: 13px;
  display: block;
  overflow-wrap: anywhere;
}
.df-template span {
  font-size: 13px;
  color: var(--df-muted);
  display: block;
  margin-top: 5px;
}
.df-template button {
  font-size: 13px;
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
  font-size: 13px;
}
.df-count {
  font-size: 13px;
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
  font-size: 13px;
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
  font-size: 13px;
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
  font-size: 13px;
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
  font-size: 13px;
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
  font-size: 13px;
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
  font-size: 13px;
  overflow-wrap: anywhere;
}
.df-check p {
  margin: 3px 0 0;
  font-size: 13px;
  color: var(--df-muted);
}
.df-check button {
  font-size: 13px;
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
  font-size: 13px;
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
  font-size: 13px;
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
  font-size: 13px;
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
  font-size: 13px;
  white-space: nowrap;
}
.df-output-list {
  padding: 20px;
}
.df-output-list > h2 {
  margin: 10px 0;
}
.df-output-list > p {
  font-size: 13px;
  color: var(--df-muted);
}
.df-generation {
  border-top: 1px solid var(--df-line);
  padding-top: 18px;
  margin-top: 20px;
}
.df-generation h3 {
  font-size: 13px;
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
  font-size: 13px;
  display: block;
  font-weight: 500;
}
.df-output small {
  font-size: 13px;
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
  font-size: 13px;
  overflow-wrap: anywhere;
}
.df-preview .df-section-head > span {
  font-size: 13px;
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
  font-size: 13px;
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
    font-size: 13px;
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
    font-size: 13px;
  }
  .df-new {
    margin: 0;
    font-size: 13px;
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
    font-size: 13px;
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
    font-size: 13px;
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
  font-size: 13px;
  color: var(--df-muted);
}
.df-passed summary {
  cursor: pointer;
  color: var(--df-accent);
}
.df-passed p {
  font-size: 13px;
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
  font-size: 13px;
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
  font-size: 13px;
  padding: 5px 8px;
}
.df-print-toolbar button[aria-pressed="true"] {
  color: var(--df-accent);
  border-color: var(--df-accent);
}
.df-print-toolbar span {
  font-size: 13px;
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
  font-size: 13px;
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
  font-size: 13px;
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
  font-size: 13px;
  color: var(--df-muted);
}
.df-state {
  font-size: 13px;
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
  color: var(--app-success-text);
}
.df-state-submitted,
.df-material-state-submitted {
  color: var(--app-warning-text);
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
  font-size: 13px;
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
  font-size: 13px;
  color: var(--df-muted);
  min-height: 38px;
}
.df-stage-card .df-section-head > small {
  color: var(--df-muted);
  font-size: 13px;
}
.df-stage-card footer {
  margin-top: 20px;
  padding-top: 13px;
  border-top: 1px solid var(--df-line);
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
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
  font-size: 13px;
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
  font-size: 13px;
}
.df-stage-forms .df-section-head h2,
.df-material-panel .df-section-head h2 {
  margin: 0;
}
.df-material-panel h2 small {
  margin-left: 8px;
  font-size: 13px;
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
  font-size: 13px;
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
  font-size: 13px;
  border: 1px solid var(--df-line);
  padding: 1px 5px;
  margin-right: 8px;
  border-radius: 3px;
}
.df-material-name > small {
  display: block;
  margin-top: 6px;
  font-size: 13px;
  color: var(--df-muted);
}
.df-material-name p {
  font-size: 13px;
  color: var(--df-muted);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  margin-bottom: 0;
}
.df-material-files {
  min-width: 0;
  font-size: 13px;
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
  font-size: 13px;
  font-weight: 400;
  overflow-wrap: anywhere;
}
.df-material-file small {
  font-size: 13px;
  color: var(--df-muted);
  display: block;
  margin-top: 4px;
}
.df-app .df-material-file button {
  padding: 3px 6px;
  font-size: 13px;
}
.df-stage-tail {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 2px 0 25px;
}
.df-stage-tail p {
  font-size: 13px;
  color: var(--df-muted);
}
.df-stage-details dl {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  margin: 0;
}
.df-stage-details dt {
  font-size: 13px;
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
  font-size: 13px;
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
  font-size: 13px;
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
  font-size: 13px;
  flex: 1;
}
.df-editor-context .df-actions {
  font-size: 13px;
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
  font-size: 13px;
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
.df-approval-entry .df-section-head {
  align-items: center;
}
.df-approval-entry h2,
.df-approval-entry p {
  margin-bottom: 0;
}
.df-approval-entry > p {
  padding-top: 14px;
  border-top: 1px solid var(--df-line);
}
.df-approval-compare b small {
  color: var(--df-muted);
  font-weight: normal;
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
  font-size: 13px;
}
.df-three-column .df-project-tabs > button:first-child {
  grid-column: 1/-1;
  padding: 4px;
  text-align: left;
}
.df-three-column .df-project-tabs .df-state {
  font-size: 13px;
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
  font-size: 13px;
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
  font-size: 13px;
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
  font-size: 13px;
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
  font-size: 13px;
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
  font-size: 13px;
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
.df-right-preview:not([hidden]):has(.df-dock-preview) {
  display: flex;
  flex-direction: column;
  padding-block: 6px 10px;
  overflow: hidden;
}
.df-dock-preview {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
.df-dock-preview h3 {
  font-size: 13px;
  line-height: 20px;
  margin: 0 0 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 0;
}
.df-dock-preview .df-print-toolbar {
  gap: 4px 8px;
  padding: 3px 4px;
}
.df-dock-preview .df-print-toolbar > div {
  gap: 4px;
}
.df-dock-preview .df-print-toolbar :is(button, select) {
  min-height: 26px;
  font-size: 12px;
  padding: 3px 6px;
}
.df-dock-preview :is(.df-print-preview, .df-dock-office) {
  flex: 1;
  min-height: 0;
}
.df-dock-office {
  overflow: hidden;
  border: 1px solid var(--df-line);
}
.df-dock-empty {
  color: var(--df-muted);
  margin: 80px 20px;
  text-align: center;
  font-size: 13px;
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
  font-size: 13px;
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

.df-app [hidden] {
  display: none !important;
}
.df-workflow-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 0;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--df-line);
}
.df-workflow-tabs > button {
  flex: 0 0 auto;
  padding: 9px 14px;
  border-color: transparent;
  background: transparent;
}
.df-workflow-tabs > .df-workflow-tab-end {
  margin-left: auto;
}
.df-workflow-tabs > button[aria-selected="true"] {
  color: var(--df-accent);
  background: color-mix(in srgb, var(--df-accent) 8%, var(--df-paper));
  border-color: var(--df-accent);
}
.df-stage-header > .df-workflow-tabs {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: 0;
}
.df-form-heading {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 12px 24px;
}
.df-form-heading .df-section-head,
.df-form-heading .df-title-field {
  margin: 0;
}
.df-form-heading .df-title-field {
  flex: 1;
  min-width: 180px;
}
.df-form-panel > .df-group:first-child {
  border-top: 0;
  margin-top: 0;
  padding-top: 0;
}
.df-form-panel textarea {
  max-height: 360px;
  overflow-y: auto;
}
.df-workflow-tabs > #df-form-tab-timeline:not([aria-selected="true"]) {
  border-color: var(--df-line);
}
.df-timeline-panel h2 {
  margin: 0 0 18px;
}
.df-negotiation-timeline {
  margin: 0;
  padding: 0;
  list-style: none;
}
.df-timeline-step {
  position: relative;
  margin-left: 6px;
  padding: 0 0 20px 20px;
  border-left: 1px solid var(--df-line);
}
.df-timeline-step:last-child {
  padding-bottom: 0;
  border-left-color: transparent;
}
.df-timeline-step::before {
  content: "";
  position: absolute;
  top: 3px;
  left: -6px;
  width: 11px;
  height: 11px;
  border: 1px solid var(--df-muted);
  border-radius: 50%;
  background: var(--df-paper);
}
.df-timeline-step[data-state="set"]::before {
  border-color: var(--df-accent);
  background: var(--df-accent);
}
.df-timeline-step[data-state="error"]::before {
  border-color: var(--app-error-text, #b42318);
  background: var(--app-error-text, #b42318);
}
.df-timeline-step h3 {
  margin: 0 0 8px;
  font-size: 14px;
}
.df-timeline-approval {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 14px;
}
.df-timeline-approval button {
  padding: 4px 8px;
}
.df-timeline-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 185px), 1fr));
  gap: 8px 12px;
}
.df-timeline-recipients {
  display: grid;
  gap: 8px;
  padding: 0;
  margin: 0;
  list-style: none;
}
.df-timeline-recipient {
  padding: 10px;
  border: 1px solid var(--df-line);
  border-radius: 6px;
}
.df-timeline-recipient > strong {
  display: block;
  margin-bottom: 8px;
  overflow-wrap: anywhere;
}
.df-timeline-issues {
  margin: 6px 0 0;
  padding-left: 18px;
  color: var(--app-error-text, #b42318);
}
.df-field-help {
  position: relative;
  display: inline-flex;
  align-items: flex-start;
  min-width: 0;
  flex-shrink: 1;
  color: var(--df-muted);
}
.df-app .df-field-help-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: inherit;
}
.df-app .df-field-help-trigger:hover {
  background: transparent;
  color: var(--df-accent);
}
.df-field-help-trigger svg {
  display: block;
  width: 16px;
  height: 16px;
  stroke: currentColor;
  stroke-width: 1.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.df-field-help-content {
  position: absolute;
  left: calc(100% + 8px);
  bottom: 0;
  min-width: 0;
  z-index: 8;
  display: block;
  width: min(320px, calc(100vw - 48px));
  max-height: min(280px, 50vh);
  overflow-y: auto;
  padding: 10px 12px;
  border: 1px solid var(--df-line);
  border-radius: 8px;
  background: var(--df-paper);
  color: var(--df-text);
  box-shadow: 0 6px 20px #18203318;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.65;
  white-space: pre-line;
  overflow-wrap: anywhere;
}
.df-field-help-timeline {
  display: block;
}
.df-field-help-content > span + .df-field-help-timeline {
  margin-top: 6px;
}
.df-field-help-timeline a {
  color: var(--df-accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.df-profile-import-list {
  max-height: 55vh;
  overflow-y: auto;
}
.df-approval-file-tools,
.df-approval-review-summary {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
}
.df-approval-file-tools select {
  max-width: 100%;
  min-width: 160px;
}
.df-approval-file-tools select[aria-label="\u5BA1\u6279\u6587\u4EF6\u7248\u672C"] {
  flex: 1;
  min-width: 220px;
}
.df-approval-versions {
  max-width: 220px;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.df-approval-pdf {
  display: block;
  width: 100%;
  height: max(480px, 68vh);
  border: 1px solid var(--df-line);
  border-radius: 6px;
  background: #f2f3f5;
  overflow: hidden;
}
.df-approval-image-scroll {
  height: max(480px, 68vh);
  overflow: auto;
  border: 1px solid var(--df-line);
  border-radius: 6px;
  background: #f2f3f5;
  text-align: center;
}
.df-approval-image-scroll img {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 0 auto;
}
.df-approval-empty {
  display: grid;
  justify-items: center;
  align-content: center;
  min-height: 320px;
  padding: 24px;
  color: var(--df-muted);
  text-align: center;
}
.df-project-profile > .df-section-head .df-actions > button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
.df-profile-import-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid var(--df-line);
}
.df-profile-import-item > span {
  display: grid;
  gap: 6px;
  min-width: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.df-results.df-results-docked {
  grid-template-columns: minmax(0, 1fr);
}
.df-generation-panel {
  display: grid;
  gap: 16px;
}
.df-historical-forms {
  margin-top: 16px;
}
.df-historical-forms summary {
  cursor: pointer;
}
.df-historical-forms button {
  display: block;
  margin-top: 8px;
  text-align: left;
  overflow-wrap: anywhere;
}

.df-field select {
  width: 100%;
  min-height: 40px;
}
.df-field input[readonly] {
  color: var(--df-muted);
  cursor: default;
}
.df-member-scroll {
  overflow-x: auto;
}
.df-member-table {
  width: 100%;
  min-width: 590px;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 13px;
}
.df-member-table th,
.df-member-table td {
  padding: 8px 6px;
  border-bottom: 1px solid var(--df-border, #dce4e3);
  text-align: left;
  vertical-align: middle;
}
.df-member-table thead th {
  color: var(--df-muted);
  font-weight: 500;
  background: var(--df-bg, #f5f6f3);
}
.df-member-table th:first-child {
  width: 42px;
}
.df-member-table th:nth-child(2) {
  width: 78px;
}
.df-member-table th:nth-child(3) {
  width: 28%;
}
.df-member-table th:last-child {
  width: 115px;
}
.df-member-table tbody th {
  color: var(--df-muted);
  font-weight: 400;
}
.df-member-table input {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: 38px;
  padding: 8px;
  border: 1px solid var(--df-border, #dce4e3);
  border-radius: 4px;
  background: var(--df-bg, #f5f6f3);
  color: inherit;
  font: inherit;
}
.df-member-table input:focus {
  outline: 2px solid var(--df-accent, #2b6463);
  outline-offset: 1px;
}

/* Shared visual language with QwenPaw Data: host surfaces and theme actions. */
.df-app {
  --df-border: var(--df-line);
}
.df-brand {
  font-size: 20px;
  font-weight: 650;
  letter-spacing: 0;
}
.df-sidebar {
  background: var(--df-paper);
}
.df-app .df-primary {
  background: var(--df-accent);
  border-color: var(--df-accent);
  color: var(--app-text-inverse);
}
.df-app .df-primary:hover {
  background: var(--app-accent-hover);
}
.df-sidebar nav button[aria-current="page"] {
  background: color-mix(in srgb, var(--df-accent) 8%, var(--df-paper));
  border-color: transparent;
}
.df-sidebar nav b {
  font-size: 14px;
}
.df-app input,
.df-app textarea,
.df-app select {
  font-size: 14px;
}
.df-app select:focus-visible,
.df-app summary:focus-visible {
  outline: 2px solid var(--df-accent);
  outline-offset: 2px;
}
.df-stage-help summary {
  cursor: pointer;
  color: var(--df-muted);
}
.df-stage-help p {
  margin: 8px 0;
  color: var(--df-muted);
  font-size: 14px;
}
.df-search-empty {
  padding: 16px 8px;
  color: var(--df-muted);
}
.df-search-empty p {
  margin: 0 0 8px;
}
.df-editor-context {
  flex-wrap: wrap;
}
.df-template {
  position: relative;
  padding-right: 72px;
}
.df-template > button {
  position: absolute;
  right: 0;
  top: 16px;
}
.df-chat-welcome h3 {
  margin-bottom: 20px;
}
.df-project-tabs button {
  min-width: 110px;
}
.df-project-tabs {
  overflow-x: auto;
}
.df-app .df-header h1 {
  font-size: 22px;
}

.df-three-column .df-project-tabs {
  display: flex;
  overflow-x: auto;
  gap: 4px;
  padding-bottom: 8px;
}
.df-three-column .df-project-tabs > button {
  flex: 0 0 auto;
  min-width: 104px;
  padding: 10px 12px;
}
.df-three-column .df-project-tabs > button:first-child {
  padding: 10px 12px;
  text-align: center;
}
.df-three-column .df-project-tabs small {
  display: inline;
  margin-right: 6px;
}
.df-three-column .df-project-tabs .df-state {
  margin-top: 4px;
}
/* A single node workspace keeps status, dates and materials within reach. */
.df-node-status {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  margin-top: 10px;
  font-size: 14px;
}
.df-deadline {
  display: inline-block;
  color: var(--df-muted);
  font-size: 14px;
}
.df-deadline.overdue {
  color: var(--app-error-text);
  font-weight: 600;
}
.df-deadline.soon {
  color: var(--app-warning-text);
  font-weight: 600;
}
.df-deadline.done {
  color: var(--app-success-text);
}
.df-app[data-theme="dark"] .df-deadline.overdue {
  color: var(--app-error-text);
}
.df-app[data-theme="dark"] .df-deadline.soon {
  color: var(--app-warning-text);
}
.df-app[data-theme="dark"] .df-deadline.done {
  color: var(--app-success-text);
}
.df-three-column .df-stage-header {
  position: sticky;
  top: -24px;
  z-index: 3;
  border-radius: 0;
  border: 0;
  border-bottom: 1px solid var(--df-line);
  box-shadow: 0 3px 8px #18203308;
  padding: 16px 20px;
  gap: 16px;
}
.df-stage-header .df-actions {
  flex-wrap: wrap;
}
#df-node-form,
#df-node-materials {
  scroll-margin-top: 160px;
}
.df-node-tools {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 20px;
}
.df-node-tools details {
  position: relative;
}
.df-node-tools summary {
  cursor: pointer;
  padding: 8px 12px;
}
.df-node-tools details[open] > div {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 4;
  background: var(--df-paper);
  border: 1px solid var(--df-line);
  padding: 12px;
  min-width: 240px;
  box-shadow: 0 6px 20px #18203312;
}
.df-three-column .df-embedded-editor {
  min-height: 0;
}
.df-three-column .df-embedded-editor .df-footer {
  display: none;
}
.df-material-panel .df-section-head {
  margin-bottom: 16px;
}
@media (max-width: 850px) {
  .df-three-column .df-stage-header {
    position: static;
  }
  #df-node-form,
  #df-node-materials {
    scroll-margin-top: 16px;
  }
}
.df-three-column .df-stage-header {
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
}
.df-three-column .df-stage-header > .df-actions {
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
}
.df-three-column .df-stage-header > div:first-child {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.df-three-column .df-stage-header h2 {
  margin: 0;
}
.df-three-column .df-node-status {
  margin-top: 0;
}

.df-linked-editor {
  min-height: 112px;
  padding: 14px 16px;
  border: 1px solid var(--df-line);
  border-radius: 5px;
  background: var(--df-paper, #fff);
  color: var(--df-text);
  font: inherit;
  line-height: 1.9;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  cursor: text;
}
.df-linked-editor:focus {
  outline: 2px solid #1677ff;
  outline-offset: 1px;
}
.df-reference-token {
  color: #1668c7;
  background: #edf5ff;
  border-radius: 3px;
  padding: 1px 0;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
  cursor: default;
}
.df-app[data-theme="dark"] .df-reference-token {
  color: #91caff;
  background: #162f4a;
}

/* Application chrome follows the host; document sheets retain print colors. */
.df-app {
  font-size: var(--app-font-body, 14px);
  container-type: inline-size;
}
.df-sidebar {
  background: var(--app-surface-subtle);
}
.df-sidebar nav button[aria-current="page"] {
  color: var(--app-accent-text);
  background: var(--app-accent-soft);
  border-color: transparent;
}
.df-app button {
  min-height: var(--app-hit-target, 32px);
  border-radius: var(--app-radius, 10px);
}
.df-steps button {
  border-radius: 0;
}
.df-paper {
  border-radius: var(--app-radius-card, 16px);
}
.df-header {
  flex-wrap: wrap;
}
.df-steps {
  overflow-x: auto;
}
@container (max-width: 720px) {
  .df-main {
    padding: 20px 16px;
  }
  .df-import {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
`;var la=`.df-stage-toolbar {
  display: flex;
  flex: 1;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 16px;
  min-width: 0;
}
.df-stage-tool-slot {
  display: contents;
}
.df-toolbar-file-actions,
.df-toolbar-save {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}
.df-toolbar-save {
  position: absolute;
  top: 14px;
  right: 16px;
  justify-content: flex-end;
  gap: 8px;
  margin-left: auto;
}
.df-stage-toolbar button,
.df-toolbar-menu > summary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 32px;
  padding: 6px 9px;
  font-size: 13px;
  line-height: 18px;
  border: 1px solid var(--df-line);
  border-radius: 6px;
  background: var(--df-paper);
  color: var(--df-text);
  cursor: pointer;
}
.df-stage-toolbar .df-toolbar-icon-button {
  width: 32px;
  min-width: 32px;
  height: 32px;
  padding: 0;
}
.df-stage-toolbar button:hover,
.df-toolbar-menu > summary:hover {
  border-color: var(--df-accent);
}
.df-toolbar-menu > summary[aria-disabled="true"] {
  opacity: 0.45;
  cursor: default;
}
.df-toolbar-icon {
  display: block;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.df-toolbar-menu {
  position: relative;
}
.df-toolbar-menu-more > .df-toolbar-popover {
  left: auto;
  right: 0;
  width: 280px;
}
.df-toolbar-menu > summary {
  list-style: none;
}
.df-toolbar-menu > summary::-webkit-details-marker {
  display: none;
}
.df-toolbar-menu > summary:focus-visible {
  outline: 2px solid var(--df-accent);
  outline-offset: 2px;
}
.df-toolbar-popover {
  position: absolute;
  z-index: 10;
  top: calc(100% + 8px);
  left: 0;
  width: min(420px, calc(100vw - 48px));
  max-height: min(460px, 65vh);
  overflow-y: auto;
  padding: 12px;
  border: 1px solid var(--df-line);
  border-radius: 10px;
  background: var(--df-paper);
  box-shadow: 0 10px 28px #18203320;
}
.df-toolbar-popover > .df-field {
  margin-bottom: 12px;
}
.df-toolbar-popover > button {
  margin: 0 6px 6px 0;
}
.df-toolbar-popover .df-template-panel {
  border: 0;
  box-shadow: none;
  margin: 8px 0 0;
  padding: 0;
}
.df-toolbar-popover .df-section-head {
  margin-bottom: 12px;
}
.df-toolbar-popover .df-template-actions {
  flex-wrap: wrap;
}
.df-toolbar-popover .df-template {
  font-size: 13px;
  padding-top: 12px;
  padding-bottom: 12px;
}
.df-toolbar-popover .df-template > b {
  overflow-wrap: anywhere;
}
.df-save-state {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--df-muted);
  font-size: 12px;
  white-space: nowrap;
}
.df-save-state::before {
  content: "";
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}
.df-save-state.is-dirty {
  color: var(--df-accent);
}
.df-stage-header {
  position: relative;
}
/* Keep size queries on the persistent column. Containment on the sticky,
   remounted header can leave its children with no layout after returning. */
.df-project-main {
  container-name: df-project-column;
  container-type: inline-size;
}
.df-stage-header,
.df-three-column .df-stage-header {
  container-type: normal;
  flex-direction: column;
  align-items: stretch;
  padding: 14px 16px 0;
  border: 1px solid var(--df-line);
  border-radius: 10px;
  box-shadow: none;
  gap: 12px;
}
.df-stage-top-row,
.df-three-column .df-stage-header > div.df-stage-top-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: nowrap;
  gap: 20px;
  min-width: 0;
}
.df-stage-header:has(.df-toolbar-save) > .df-stage-top-row {
  padding-right: 180px;
}
.df-stage-heading {
  flex-shrink: 0;
}
.df-stage-header h2,
.df-three-column .df-stage-header h2 {
  margin: 0;
  font-size: 18px;
  line-height: 26px;
  white-space: nowrap;
}
.df-stage-bottom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0 16px;
  min-height: 46px;
  border-top: 1px solid var(--df-line);
}
.df-stage-bottom-row > .df-workflow-tabs {
  margin: 0;
  padding: 0;
  gap: 20px;
  border: 0;
}
.df-stage-bottom-row > .df-workflow-tabs > button {
  padding: 11px 0;
  border: 0;
  border-bottom: 2px solid transparent;
  border-radius: 0;
  background: transparent;
}
.df-stage-bottom-row > .df-workflow-tabs > button[aria-selected="true"] {
  border-bottom-color: var(--df-accent);
  color: var(--df-accent);
}
.df-stage-bottom-row .df-node-status {
  align-items: center;
  justify-content: flex-end;
  margin: 0 0 0 auto;
  padding: 8px 0;
  gap: 8px 12px;
  font-size: 12px;
}
.df-app .df-stage-state {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border: 0;
  border-radius: 6px;
  background: color-mix(in srgb, currentColor 8%, var(--df-paper));
  color: var(--df-stage-state-color, var(--df-muted));
  font-size: 12px;
  line-height: 20px;
}
.df-app .df-stage-state:hover {
  background: color-mix(in srgb, currentColor 13%, var(--df-paper));
}
.df-stage-state.df-state-in_progress {
  --df-stage-state-color: var(--df-accent);
}
.df-stage-state.df-state-completed {
  --df-stage-state-color: var(--app-success-text);
}
.df-stage-state.df-state-submitted {
  --df-stage-state-color: var(--app-warning-text);
}
.df-app[data-theme="dark"] .df-stage-state.df-state-completed {
  --df-stage-state-color: var(--app-success-text);
}
.df-app[data-theme="dark"] .df-stage-state.df-state-submitted {
  --df-stage-state-color: var(--app-warning-text);
}
.df-stage-state .df-toolbar-icon {
  width: 12px;
  height: 12px;
}
.df-state-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
.df-node-status .df-deadline {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  white-space: nowrap;
}
.df-node-status .df-deadline .df-toolbar-icon {
  width: 14px;
  height: 14px;
}
.df-stage-approval-count {
  padding-left: 12px;
  border-left: 1px solid var(--df-line);
  white-space: nowrap;
}
.df-three-column .df-embedded-editor > .df-main {
  padding: 0;
}
.df-three-column .df-embedded-editor .df-edit-footer {
  border-top: 1px solid var(--df-line);
}
.df-three-column .df-embedded-editor .df-edit-footer p {
  margin: 0;
}
@container df-project-column (max-width: 664px) {
  .df-stage-top-row,
  .df-three-column .df-stage-header > div.df-stage-top-row {
    flex-wrap: wrap;
    gap: 12px;
  }
  .df-stage-header:has(.df-toolbar-save) > .df-stage-top-row {
    padding-right: 0;
  }
  .df-stage-header:has(.df-toolbar-save) .df-stage-heading {
    width: 100%;
    min-height: 32px;
    padding-right: 180px;
  }
  .df-stage-toolbar {
    flex-basis: 100%;
  }
}
@media (max-width: 600px) {
  .df-toolbar-popover {
    width: min(340px, calc(100vw - 48px));
  }
}

.df-linked-reference {
  margin: 0 0 10px;
  padding: 10px 12px;
  border-left: 2px solid var(--df-accent);
  background: var(--df-bg);
  color: var(--df-muted);
  font-size: 13px;
  line-height: 1.8;
  overflow-wrap: anywhere;
}

.df-app .df-delete-file,
.df-app .df-danger {
  color: #b42318;
}
.df-delete-file-name {
  overflow-wrap: anywhere;
  font-weight: 600;
}
.df-file-deleted {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.df-app[data-theme="dark"] .df-delete-file,
.df-app[data-theme="dark"] .df-danger {
  color: #fda29b;
}
`;var Mt=window.QwenPaw,P=Mt.host.React,{useState:Be,useEffect:Wa}=P,pa={running:"\u6B63\u5728\u6838\u67E5",completed:"\u6838\u67E5\u5B8C\u6210",failed:"\u672A\u5B8C\u6210",interrupted:"\u5DF2\u4E2D\u65AD"},fa=".doc,.docx,.pdf,.xls,.xlsx,.png,.jpg,.jpeg";function Ct({project:a,services:s,onChanged:r}){let{request:p,download:h,time:d}=s,[g,m]=Be(null),[c,x]=Be(""),[o,b]=Be(null),[v,q]=Be([]),[N,D]=Be(""),[w,k]=Be(""),[I,T]=Be(!1),[S,z]=Be(""),[u,J]=Be(0);Wa(()=>{let E=!0,K,A=!1;async function Y(){try{let G=await p(`/projects/${a.id}/response-reviews`);if(!E)return;m(G),z("");let de=G.records.some(Fe=>Fe.status==="running");A&&!de&&r(),A=de,de&&(K=setTimeout(Y,3e3))}catch(G){E&&z(G.message)}}return Y(),()=>{E=!1,clearTimeout(K)}},[a.id,u]);let _=g?.records.some(E=>E.status==="running"),y=g?.records.find(E=>E.id===w)||g?.records[0],U=Mt.host.ReactMarkdown;async function X(E){E.preventDefault(),z(""),T(!0);try{let K=new FormData;c?K.set("reference_id",c):o&&K.set("reference",o);for(let Y of v)K.append("responses",Y);K.set("focus",N);let A=await p(`/projects/${a.id}/response-reviews`,{method:"POST",body:K});k(A.id),m(Y=>({...Y,records:[A,...Y?.records||[]]})),J(Y=>Y+1)}catch(K){z(K.message)}finally{T(!1)}}return P.createElement("div",{className:"df-response-review"},P.createElement("p",{className:"df-muted"},"\u5BF9\u7167\u8C08\u5224\u6587\u4EF6\uFF0C\u9010\u5BB6\u68C0\u67E5\u8D44\u8D28\u3001\u6280\u672F\u54CD\u5E94\u3001\u62A5\u4EF7\u3001\u65E5\u671F\u4E0E\u7B7E\u7AE0\u9644\u4EF6\u3002\u6838\u67E5\u610F\u89C1\u4F9B\u7ECF\u529E\u4EBA\u548C\u4E13\u5BB6\u590D\u6838\u3002"),S&&P.createElement("div",{className:"df-alert error",role:"alert"},S,P.createElement("button",{onClick:()=>J(E=>E+1)},"\u91CD\u65B0\u52A0\u8F7D")),g?P.createElement(P.Fragment,null,P.createElement("form",{onSubmit:X},P.createElement("fieldset",{disabled:I||_},P.createElement("label",{className:"df-field"},P.createElement("span",null,"\u6838\u67E5\u4F9D\u636E"),P.createElement("select",{"aria-label":"\u6838\u67E5\u4F9D\u636E",value:c,onChange:E=>{x(E.target.value),b(null)}},P.createElement("option",{value:""},"\u4E0A\u4F20\u6B63\u5F0F\u8C08\u5224\u6587\u4EF6"),g.references.map(E=>P.createElement("option",{key:E.id,value:E.id},E.label)))),!c&&P.createElement("label",{className:"df-field"},P.createElement("span",null,"\u6B63\u5F0F\u8C08\u5224\u6587\u4EF6"),P.createElement("input",{"aria-label":"\u4E0A\u4F20\u6838\u67E5\u4F9D\u636E",type:"file",accept:fa,required:!0,onChange:E=>b(E.target.files[0]||null)})),P.createElement("label",{className:"df-field"},P.createElement("span",null,"\u5404\u5355\u4F4D\u54CD\u5E94\u6750\u6599"),P.createElement("input",{"aria-label":"\u4E0A\u4F20\u54CD\u5E94\u6750\u6599",type:"file",multiple:!0,required:!0,accept:fa,onChange:E=>q([...E.target.files])})),v.length>0&&P.createElement("ul",{className:"df-review-files"},v.map((E,K)=>P.createElement("li",{key:K},E.name))),P.createElement("p",{className:"df-muted"},"\u652F\u6301 Word\u3001PDF\u3001Excel \u548C\u56FE\u7247\uFF1B\u53EF\u4E00\u6B21\u9009\u62E9\u591A\u5BB6\u6750\u6599\u3002\u6BCF\u4EFD\u4E0D\u8D85\u8FC7 15 MB\uFF0C\u6BCF\u6B21\u6700\u591A 20 \u4EFD\u3001\u5408\u8BA1 100 MB\u3002\u538B\u7F29\u5305\u8BF7\u5148\u89E3\u538B\u3002"),P.createElement("label",{className:"df-field"},P.createElement("span",null,"\u8865\u5145\u5173\u6CE8\u70B9\uFF08\u9009\u586B\uFF09"),P.createElement("textarea",{"aria-label":"\u8865\u5145\u6838\u67E5\u5173\u6CE8\u70B9",rows:3,maxLength:3e3,value:N,onChange:E=>D(E.target.value),placeholder:"\u4F8B\u5982\uFF1A\u91CD\u70B9\u6838\u5BF9\u62A5\u4EF7\u5927\u5C0F\u5199\u3001\u6210\u679C\u4EA4\u4ED8\u65F6\u95F4\u548C\u8D44\u8D28\u6709\u6548\u671F"})),P.createElement("div",{className:"df-actions"},P.createElement("button",{className:"df-primary",disabled:I||_||!(c||o)||!v.length},I?"\u6B63\u5728\u63D0\u4EA4\u2026":"\u5F00\u59CB\u6838\u67E5"),P.createElement("span",{className:"df-muted"},"\u4F7F\u7528\u201C\u54CD\u5E94\u6587\u4EF6\u6838\u67E5\u201D\u667A\u80FD\u4F53\uFF0C\u6CBF\u7528\u8F6F\u4EF6\u4E2D\u7684\u6A21\u578B\u914D\u7F6E\u3002")))),g.records.length>0&&P.createElement("section",{className:"df-review-history"},P.createElement("div",{className:"df-section-head"},P.createElement("h3",null,"\u6838\u67E5\u8BB0\u5F55"),P.createElement("button",{onClick:()=>J(E=>E+1)},"\u5237\u65B0\u8BB0\u5F55")),P.createElement("div",{className:"df-review-records"},g.records.map(E=>P.createElement("button",{key:E.id,"aria-pressed":y?.id===E.id,onClick:()=>k(E.id)},d(E.created_at)," \xB7 ",pa[E.status]))),y&&P.createElement("article",{"aria-label":"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5\u7ED3\u679C"},P.createElement("div",{className:"df-section-head"},P.createElement("div",null,P.createElement("b",null,pa[y.status]),P.createElement("p",{className:"df-muted"},"\u57FA\u4E8E\u9879\u76EE\u4FEE\u8BA2 ",y.project_revision," \xB7"," ",y.files.length," \u4EFD\u6750\u6599\uFF1B\u540E\u7EED\u6750\u6599\u4FEE\u6539\u8BF7\u91CD\u65B0\u6838\u67E5\u3002")),y.status==="completed"&&P.createElement("button",{onClick:async()=>{try{await h(`/projects/${a.id}/response-reviews/${y.id}/report`,`${a.name}_\u54CD\u5E94\u6587\u4EF6\u6838\u67E5\u8BB0\u5F55_${y.id.slice(0,8)}.md`)}catch(E){z(E.message)}}},"\u4E0B\u8F7D\u6838\u67E5\u8BB0\u5F55")),P.createElement("details",null,P.createElement("summary",null,"\u672C\u6B21\u6838\u67E5\u6750\u6599\u4E0E\u5173\u6CE8\u70B9"),P.createElement("ul",null,y.files.map((E,K)=>P.createElement("li",{key:K},E.role,"\uFF1A",E.name))),P.createElement("p",null,y.focus||"\u65E0\u8865\u5145\u5173\u6CE8\u70B9")),y.status==="running"&&P.createElement("p",{role:"status",className:"df-alert"},"\u6B63\u5728\u8BFB\u53D6\u5E76\u6838\u67E5\u6750\u6599\uFF0C\u53EF\u5173\u95ED\u6B64\u7A97\u53E3\uFF0C\u7A0D\u540E\u56DE\u5230\u672C\u9879\u76EE\u67E5\u770B\u7ED3\u679C\u3002"),y.error&&P.createElement("p",{role:"alert",className:"df-alert error"},y.error),y.report&&P.createElement("div",{className:"df-review-report"},U?P.createElement(U,{remarkPlugins:Mt.host.remarkGfm?[Mt.host.remarkGfm]:[],components:{a:({children:E})=>P.createElement("span",null,E),img:()=>null}},y.report):P.createElement("div",{style:{whiteSpace:"pre-wrap"}},y.report))))):P.createElement("p",{role:"status"},"\u6B63\u5728\u8BFB\u53D6\u6838\u67E5\u8BB0\u5F55\u2026"))}var mt=window.QwenPaw,$=mt.host.React,{useState:Ye,useEffect:qt,useRef:ca}=$;function Ba({project:a,stageId:s,selection:r,services:p}){let{request:h,json:d,time:g}=p,[m,c]=Ye([]),[x,o]=Ye(""),[b,v]=Ye(!1),[q,N]=Ye(""),[D,w]=Ye(0),k=ca(null);qt(()=>{let z=!0,u;async function J(){try{let _=await h(`/projects/${a.id}/assistant`);if(!z)return;c(_.messages),N(""),_.messages.some(y=>y.status==="running")&&(u=setTimeout(J,2500))}catch(_){z&&N(_.message)}}return J(),()=>{z=!1,clearTimeout(u)}},[a.id,D]),qt(()=>{k.current?.scrollIntoView?.({block:"nearest"})},[m.length,m.at(-1)?.status]);let I=b||m.some(z=>z.status==="running"),T=mt.host.ReactMarkdown;async function S(z){if(z.preventDefault(),!(!x.trim()||I)){v(!0),N("");try{let u=await h(`/projects/${a.id}/assistant`,d({message:x.trim(),stage_id:s||"overview",file:r?.reference||{}}));c(J=>[...J,u]),o(""),w(J=>J+1)}catch(u){N(u.message)}finally{v(!1)}}}return $.createElement("section",{className:"df-project-chat","aria-label":"\u9879\u76EE\u667A\u80FD\u4F53\u95EE\u7B54"},$.createElement("div",{className:"df-chat-messages","aria-live":"polite"},!m.length&&$.createElement("div",{className:"df-chat-welcome"},["\u672C\u9636\u6BB5\u8FD8\u9700\u8981\u51C6\u5907\u54EA\u4E9B\u6750\u6599\uFF1F","\u5E2E\u6211\u6838\u5BF9\u5F53\u524D\u6587\u4EF6\u4E2D\u7684\u65E5\u671F\u548C\u91D1\u989D\u3002"].map(z=>$.createElement("button",{key:z,onClick:()=>o(z)},z))),m.map(z=>$.createElement("article",{className:"df-chat-turn",key:z.id},$.createElement("div",{className:"df-chat-question"},$.createElement("small",null,"\u6211 \xB7 ",g(z.created_at)),$.createElement("p",null,z.message),z.file_name&&$.createElement("small",null,"\u53C2\u8003\u6587\u4EF6\uFF1A",z.file_name)),z.reply&&$.createElement("div",{className:"df-chat-answer"},$.createElement("small",null,"\u9879\u76EE\u52A9\u624B"),T?$.createElement(T,{remarkPlugins:mt.host.remarkGfm?[mt.host.remarkGfm]:[],components:{img:()=>null,a:({children:u})=>$.createElement("span",null,u)}},z.reply):$.createElement("p",{style:{whiteSpace:"pre-wrap"}},z.reply)),z.status==="running"&&$.createElement("p",{role:"status",className:"df-muted"},"\u6B63\u5728\u7ED3\u5408\u9879\u76EE\u8D44\u6599\u6574\u7406\u56DE\u7B54\u2026"),z.error&&$.createElement("p",{role:"alert",className:"df-alert error"},z.error))),$.createElement("div",{ref:k})),q&&$.createElement("p",{role:"alert",className:"df-alert error"},q,$.createElement("button",{onClick:()=>w(z=>z+1)},"\u91CD\u65B0\u52A0\u8F7D")),$.createElement("form",{className:"df-chat-composer",onSubmit:S},r&&$.createElement("small",{className:"df-chat-context"},"\u53C2\u8003\u6587\u4EF6\uFF1A",r.artifact.title),$.createElement("textarea",{"aria-label":"\u5411\u9879\u76EE\u667A\u80FD\u4F53\u63D0\u95EE",placeholder:"\u8F93\u5165\u5F53\u524D\u9879\u76EE\u7684\u95EE\u9898\u2026",rows:3,maxLength:4e3,value:x,onChange:z=>o(z.target.value)}),$.createElement("div",{className:"df-actions"},$.createElement("button",{className:"df-primary",disabled:I||!x.trim()},I?"\u6B63\u5728\u56DE\u7B54\u2026":"\u53D1\u9001\u95EE\u9898"))))}function Ut({collapsed:a=!1,width:s,maxWidth:r,onResize:p,onToggle:h,project:d,stageId:g,services:m,mode:c,onMode:x,selection:o,onSelect:b,attachment:v,AttachmentPreview:q,onChanged:N,dirty:D=!1}){let w=ca(null),[k,I]=Ye(!1),T=()=>{w.current=null,I(!1)},[S,z]=Ye(null),[u,J]=Ye("");async function _(y,U){try{J(""),await m.download(y,U)}catch(X){J(X.message)}}return qt(()=>{if(c!=="preview"||!o&&!v||S)return;let y=!0;return(mt.workspace?.loadPreview?mt.workspace.loadPreview():Promise.resolve(Oe)).then(U=>y&&z(()=>U)).catch(()=>y&&z(()=>Oe)),()=>{y=!1}},[c,o,v,S]),$.createElement("aside",{className:"df-right-workspace"+(a?" df-pane-collapsed":"")+(k?" df-resizing":""),"aria-label":"\u9879\u76EE\u667A\u80FD\u4F53\u4E0E\u6587\u4EF6\u9884\u89C8"},$.createElement("div",{className:"df-dock-resizer",role:"separator","aria-label":"\u8C03\u6574\u95EE\u7B54\u4E0E\u9884\u89C8\u680F\u5BBD\u5EA6","aria-orientation":"vertical","aria-valuemin":300,"aria-valuemax":r,"aria-valuenow":s,"aria-valuetext":s+" \u50CF\u7D20",tabIndex:0,title:"\u5DE6\u53F3\u62D6\u52A8\u8C03\u6574\u5BBD\u5EA6\uFF1B\u53CC\u51FB\u6062\u590D\u9ED8\u8BA4\u5BBD\u5EA6",onPointerDown:y=>{y.button===0&&(y.preventDefault(),w.current={x:y.clientX,width:s,pointer:y.pointerId},y.currentTarget.setPointerCapture?.(y.pointerId),I(!0))},onPointerMove:y=>{w.current&&w.current.pointer===y.pointerId&&p(w.current.width+w.current.x-y.clientX)},onPointerUp:T,onPointerCancel:T,onLostPointerCapture:T,onDoubleClick:()=>p(500),onKeyDown:y=>{let U={ArrowLeft:s+24,ArrowRight:s-24,Home:300,End:r}[y.key];U!==void 0&&(y.preventDefault(),p(U))}}),$.createElement("button",{className:"df-pane-toggle","aria-label":a?"\u5C55\u5F00\u95EE\u7B54\u4E0E\u9884\u89C8\u680F":"\u6536\u8D77\u95EE\u7B54\u4E0E\u9884\u89C8\u680F","aria-expanded":!a,title:a?"\u5C55\u5F00\u95EE\u7B54\u4E0E\u9884\u89C8\u680F":"\u6536\u8D77\u95EE\u7B54\u4E0E\u9884\u89C8\u680F",onClick:h},$.createElement("span",{"aria-hidden":"true"},a?"\u2039":"\u203A"),$.createElement("span",null,a?"\u95EE\u7B54\u4E0E\u9884\u89C8":"\u6536\u8D77")),$.createElement("header",null,$.createElement("div",null,$.createElement("h2",null,c==="preview"?"\u6587\u4EF6\u9884\u89C8":c==="review"?"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5":"\u9879\u76EE\u95EE\u7B54")),$.createElement("div",{className:"df-dock-tabs",role:"tablist","aria-label":"\u53F3\u4FA7\u5DE5\u4F5C\u533A"},$.createElement("button",{role:"tab","aria-selected":c==="assistant",onClick:()=>x("assistant")},"\u95EE\u7B54"),$.createElement("button",{role:"tab","aria-selected":c==="preview",onClick:()=>x("preview")},"\u9884\u89C8"))),u&&$.createElement("p",{role:"alert",className:"df-alert error"},u),$.createElement("div",{className:"df-right-body",hidden:c!=="assistant"},$.createElement(Ba,{project:d,stageId:["overview","profile"].includes(g)?"overview":g,selection:o,services:m}),g==="negotiation"&&$.createElement("button",{className:"df-open-review",onClick:()=>x("review")},"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5 \u2192")),$.createElement("div",{className:"df-right-body",hidden:c!=="review"},$.createElement("button",{className:"df-back-link",onClick:()=>x("assistant")},"\u2190 \u8FD4\u56DE\u95EE\u7B54"),c==="review"&&$.createElement(Ct,{key:d.id,project:d,services:m,onChanged:N})),$.createElement("div",{className:"df-right-body df-right-preview",hidden:c!=="preview"},D&&$.createElement("p",{className:"df-alert"},"\u4E2D\u95F4\u8868\u5355\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\uFF0C\u9884\u89C8\u6587\u4EF6\u4FDD\u7559\u751F\u6210\u65F6\u7684\u5185\u5BB9\u3002"),v?$.createElement(q,{key:v.id,file:v,projectId:d.id,download:_,embedded:!0,onClose:()=>b(null)}):o?$.createElement("section",{className:"df-dock-preview","aria-label":"\u6587\u4EF6\u9884\u89C8"},$.createElement("h3",{title:o.artifact.title},o.artifact.title),S&&o.artifact.extension==="xlsx"?$.createElement("div",{className:"df-dock-office"},$.createElement(S,{artifact:o.artifact,readOnly:!0,hostControls:!0})):S?$.createElement(Lt,{key:o.artifact.id,artifact:o.artifact},$.createElement(S,{artifact:o.artifact,readOnly:!0,hostControls:!0})):$.createElement("p",{role:"status"},"\u6B63\u5728\u6253\u5F00\u9884\u89C8\u2026")):$.createElement("p",{className:"df-dock-empty"},"\u4ECE\u300C\u6587\u4EF6\u751F\u6210\u300D\u3001\u5BA1\u6279\u8D44\u6599\u6216\u5176\u4ED6\u9644\u4EF6\u4E2D\u9009\u62E9\u6587\u4EF6\u9884\u89C8\u3002")))}var ma=window.QwenPaw.host.React;function _t({id:a,label:s,items:r,value:p,onChange:h}){return ma.createElement("div",{className:"df-workflow-tabs",role:"tablist","aria-label":s},r.map((d,g)=>ma.createElement("button",{type:"button",role:"tab",key:d.id,className:d.align==="end"?"df-workflow-tab-end":void 0,id:`${a}-tab-${d.id}`,"aria-controls":`${a}-panel-${d.id}`,"aria-selected":p===d.id,tabIndex:p===d.id?0:-1,onClick:()=>h(d.id),onKeyDown:m=>{let c;m.key==="ArrowRight"&&(c=(g+1)%r.length),m.key==="ArrowLeft"&&(c=(g+r.length-1)%r.length),m.key==="Home"&&(c=0),m.key==="End"&&(c=r.length-1),c!==void 0&&(m.preventDefault(),h(r[c].id),m.currentTarget.parentElement.children[c].focus())}},d.label)))}var Qe=["\u9879\u76EE\u7814\u7A76\u5185\u5BB9","\u8003\u6838\u6307\u6807\u4E0E\u8FDB\u5EA6\u5B89\u6392","\u53D7\u9080\u5355\u4F4D\u4E0E\u8D44\u683C\u8981\u6C42","\u8C08\u5224\u8981\u6C42","\u5B9E\u65BD\u65B9\u6848"];function ua(a,s){if(s==="negotiation"){let r=a.key.split(".")[0];if(["project","research"].includes(r))return Qe[0];if(["deliverables","metrics","workload","milestones"].includes(r))return Qe[1];if(r==="qualification")return Qe[2];if(r==="implementation")return Qe[4];if(["organization","org","contact","purchaser","dates","events","submission","place","budget"].includes(r))return Qe[3];let p={\u9879\u76EE\u8D44\u6599:0,\u7814\u7A76\u5185\u5BB9:0,\u6210\u679C\u4E0E\u8003\u6838:1,\u8FDB\u5EA6\u5B89\u6392:1,\u8D44\u683C\u8981\u6C42:2,\u5355\u4F4D\u4E0E\u8054\u7CFB:3,\u8D39\u7528\u4FE1\u606F:3,\u65E5\u671F\u5B89\u6392:3,\u5730\u70B9\u5B89\u6392:3,\u670D\u52A1\u9009\u5546\u5B9E\u65BD\u65B9\u6848:4}[a.group];if(p!==void 0)return Qe[p]}return/^selection\.member\d+_/.test(a.key)?"\u8BBA\u8BC1\u6210\u5458":/^selection\.partner\d+_/.test(a.key)?"\u5019\u9009\u5355\u4F4D":{\u5355\u4F4D\u4E0E\u8054\u7CFB:"\u8054\u7CFB\u4E0E\u8D39\u7528",\u8D39\u7528\u4FE1\u606F:"\u8054\u7CFB\u4E0E\u8D39\u7528",\u65E5\u671F\u5B89\u6392:"\u65F6\u95F4\u4E0E\u5730\u70B9",\u5730\u70B9\u5B89\u6392:"\u65F6\u95F4\u4E0E\u5730\u70B9",\u670D\u52A1\u9009\u5546\u5B9E\u65BD\u65B9\u6848:"\u5B9E\u65BD\u65B9\u6848"}[a.group]||a.group||"\u586B\u5199\u4FE1\u606F"}var M=window.QwenPaw.host.React,{useEffect:ga,useRef:Qa,useState:Va}=M;function he({name:a}){return M.createElement("svg",{className:"df-toolbar-icon",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true"},{template:M.createElement(M.Fragment,null,M.createElement("path",{d:"M8 3h8l4 4v13H8z"}),M.createElement("path",{d:"M16 3v5h4M4 7v14M11 12h6M11 16h6"})),import:M.createElement(M.Fragment,null,M.createElement("path",{d:"M5 3h9l5 5v13H5zM14 3v5h5"}),M.createElement("path",{d:"M12 10v8m-3-3 3 3 3-3"})),export:M.createElement(M.Fragment,null,M.createElement("path",{d:"M5 3h9l5 5v13H5zM14 3v5h5"}),M.createElement("path",{d:"M12 18v-8m-3 3 3-3 3 3"})),save:M.createElement(M.Fragment,null,M.createElement("path",{d:"M4 3h13l4 4v14H4zM8 3v6h9V3M8 21v-8h9v8"})),download:M.createElement(M.Fragment,null,M.createElement("path",{d:"M12 3v12M7 10l5 5 5-5M4 16v5h16v-5"})),file:M.createElement(M.Fragment,null,M.createElement("path",{d:"M5 3h10l4 4v14H5zM15 3v5h4M8 12h8M8 16h6"})),settings:M.createElement(M.Fragment,null,M.createElement("path",{d:"M4 6h16M4 12h16M4 18h16"}),M.createElement("circle",{cx:"9",cy:"6",r:"2"}),M.createElement("circle",{cx:"15",cy:"12",r:"2"}),M.createElement("circle",{cx:"9",cy:"18",r:"2"})),calendar:M.createElement(M.Fragment,null,M.createElement("rect",{x:"3",y:"5",width:"18",height:"16",rx:"2"}),M.createElement("path",{d:"M7 3v4M17 3v4M3 11h18M7 15h2M13 15h2"})),more:M.createElement(M.Fragment,null,M.createElement("circle",{cx:"5",cy:"12",r:"1"}),M.createElement("circle",{cx:"12",cy:"12",r:"1"}),M.createElement("circle",{cx:"19",cy:"12",r:"1"})),back:M.createElement("path",{d:"m10 5-7 7 7 7M3 12h18"}),chevron:M.createElement("path",{d:"m7 10 5 5 5-5"})}[a])}function Wt({label:a,icon:s,disabled:r,children:p,iconOnly:h=!1}){let d=Qa(null),[g,m]=Va(!1);return ga(()=>{let c=o=>{d.current?.contains(o.target)||m(!1)},x=o=>{o.key!=="Escape"||!d.current?.open||(o.preventDefault(),o.stopPropagation(),m(!1),d.current.querySelector("summary").focus())};return document.addEventListener("pointerdown",c),document.addEventListener("keydown",x,!0),()=>{document.removeEventListener("pointerdown",c),document.removeEventListener("keydown",x,!0)}},[]),ga(()=>{r&&m(!1)},[r]),M.createElement("details",{className:"df-toolbar-menu"+(h?" df-toolbar-menu-more":""),ref:d,open:g},M.createElement("summary",{"aria-label":a,title:a,"aria-disabled":r||void 0,tabIndex:r?-1:0,onClick:c=>{c.preventDefault(),r||m(x=>!x)},onKeyDown:c=>{r&&["Enter"," "].includes(c.key)&&c.preventDefault()}},M.createElement(he,{name:s}),!h&&M.createElement("span",null,a),!h&&M.createElement(he,{name:"chevron"})),g&&M.createElement("div",{className:"df-toolbar-popover",role:"region","aria-label":a+"\u83DC\u5355"},p))}var Ze=window.QwenPaw,V=Ze.host.React,{useEffect:zt,useRef:Ha,useState:ut}=V,ba=/审批|批复|回执|签章|签字|审查意见|论证意见|验收意见|验收凭据|付款凭证/;function ha(a){let s=[],r=[];for(let p of a){let h=ba.test(p.name),d=p.files.filter(m=>h||m.approval_review||ba.test(m.name)),g=p.files.filter(m=>!d.includes(m));(h||d.length)&&s.push({...p,files:d}),(!h||g.length)&&r.push({...p,files:g})}return{approvals:s,attachments:r}}function Ka({file:a,projectId:s,agentId:r,active:p,availableIds:h}){let d=Ha(new Map),[g,m]=ut(null),[c,x]=ut(""),[o,b]=ut(0),[v,q]=ut(null),N=a?.name.split(".").pop().toLowerCase(),D=["pdf","png","jpg","jpeg","webp","gif"].includes(N),w=a?a.id+":"+(a.sha256||""):"";if(zt(()=>()=>{for(let k of d.current.values())URL.revokeObjectURL(k.url);d.current.clear()},[]),zt(()=>{let k=new Set(h.split(","));for(let[I,T]of d.current)k.has(I.split(":")[0])||(d.current.delete(I),URL.revokeObjectURL(T.url))},[h]),zt(()=>{if(!p||!a||!D)return;x("");let k=d.current.get(w);if(k){m({identity:w,url:k.url});return}m(null);let I=new AbortController,T=window.setTimeout(()=>{x("\u8BFB\u53D6\u8F83\u6162\uFF0C\u8BF7\u91CD\u8BD5\u6216\u4E0B\u8F7D\u539F\u6587\u4EF6\u67E5\u770B\u3002"),I.abort()},2e4);return Ze.host.fetch(`/document-forms/projects/${s}/files/${a.id}`,{signal:I.signal,headers:r?{"X-Agent-Id":r}:{}}).then(async S=>{if(!S.ok)throw new Error("\u6587\u4EF6\u672A\u80FD\u6253\u5F00\uFF0C\u8BF7\u91CD\u8BD5\u6216\u4E0B\u8F7D\u539F\u6587\u4EF6\u3002");let z=await S.blob();if(I.signal.aborted)return;let u=URL.createObjectURL(new Blob([z],{type:N==="pdf"?"application/pdf":"image/"+(N==="jpg"?"jpeg":N)}));d.current.set(w,{url:u,size:z.size});let J=[...d.current.values()].reduce((_,y)=>_+y.size,0);for(let[_,y]of d.current){if(d.current.size<=3&&J<=32*1024*1024)break;_!==w&&(d.current.delete(_),URL.revokeObjectURL(y.url),J-=y.size)}m({identity:w,url:u})}).catch(S=>{I.signal.aborted||x(S.message)}).finally(()=>window.clearTimeout(T)),()=>{window.clearTimeout(T),I.abort()}},[w,p,D,s,r,o]),zt(()=>{if(!p||N!=="pdf"||g?.identity!==w||v)return;let k=!0,I=!!Ze.workspace?.loadPdfPreview,T=Ze.workspace?.loadPdfPreview||Ze.workspace?.loadPreview;if(T)return T().then(S=>{k&&q({component:S,direct:I})}).catch(()=>{k&&x("PDF \u9605\u8BFB\u5668\u672A\u80FD\u6253\u5F00\uFF0C\u8BF7\u91CD\u8BD5\u6216\u4E0B\u8F7D\u539F\u6587\u4EF6\u3002")}),()=>{k=!1}},[p,N,g,w,v,o]),!a)return V.createElement("div",{className:"df-approval-empty"},"\u5C1A\u672A\u4E0A\u4F20\u5BA1\u6279\u6587\u4EF6");if(!D)return V.createElement("div",{className:"df-approval-empty"},"\u6B64\u6587\u4EF6\u53EF\u901A\u8FC7\u201C\u9884\u89C8\u201D\u6253\u5F00\uFF1BPDF \u6216\u56FE\u7247\u53EF\u5728\u8FD9\u91CC\u76F4\u63A5\u6D4F\u89C8\u3002");if(c)return V.createElement("div",{className:"df-approval-empty",role:"alert"},V.createElement("p",null,c),V.createElement("button",{onClick:()=>b(k=>k+1)},"\u91CD\u65B0\u52A0\u8F7D\u5BA1\u6279\u6587\u4EF6"));if(!g||g.identity!==w)return V.createElement("div",{className:"df-approval-empty",role:"status"},"\u6B63\u5728\u8BFB\u53D6\u5BA1\u6279\u6587\u4EF6\u2026");if(N==="pdf"&&v){let k=v.component;return V.createElement("div",{className:"df-approval-pdf",role:"region","aria-label":a.name},v.direct?V.createElement(k,{url:g.url,fileSize:a.size,theme:"light"}):V.createElement(k,{artifact:{id:a.id,title:a.name,source:"uploaded",extension:"pdf",mimeType:"application/pdf",binaryUrl:g.url,agentId:r,size:a.size},readOnly:!0,hostControls:!0}))}return N==="pdf"&&(Ze.workspace?.loadPdfPreview||Ze.workspace?.loadPreview)?V.createElement("div",{className:"df-approval-empty",role:"status"},"\u6B63\u5728\u6253\u5F00 PDF \u9605\u8BFB\u5668\u2026"):N==="pdf"?V.createElement("iframe",{className:"df-approval-pdf",title:a.name,src:g.url+"#view=FitH"}):V.createElement("div",{className:"df-approval-image-scroll"},V.createElement("img",{src:g.url,alt:a.name,decoding:"async"}))}function Bt({projectId:a,materials:s,active:r,onUpload:p,onEdit:h,onAdd:d,onPreview:g,onDownload:m,onDelete:c,busy:x,review:o}){let[b,v]=ut(""),[q,N]=ut(""),D=s.find(S=>S.id===b)||s.find(S=>S.files.length)||s[0],w=D?.files||[],k=w.find(S=>S.id===q)||w.at(-1),I=w.at(-1)?.id;zt(()=>N(""),[I]);let T=Ze.host.getSelectedAgentId?.();return V.createElement("section",{className:"df-paper df-approval-documents",id:"df-node-materials"},V.createElement("div",{className:"df-section-head"},V.createElement("h2",null,"\u5BA1\u6279\u8D44\u6599"),V.createElement("div",{className:"df-actions"},D&&V.createElement("button",{"aria-label":"\u4E0A\u4F20"+D.name,title:"\u4E0A\u4F20"+D.name,onClick:()=>p(D)},"\u4E0A\u4F20\u5BA1\u6279\u6587\u4EF6"),D&&V.createElement("button",{"aria-label":"\u7F16\u8F91"+D.name,onClick:()=>h(D)},"\u529E\u7406\u4FE1\u606F"),V.createElement("button",{onClick:d},"\uFF0B \u6DFB\u52A0\u6750\u6599"))),s.length>0&&V.createElement("div",{className:"df-approval-file-tools"},V.createElement("select",{"aria-label":"\u5BA1\u6279\u6750\u6599\u7C7B\u578B",value:D.id,onChange:S=>{v(S.target.value),N("")}},s.map(S=>V.createElement("option",{key:S.id,value:S.id},S.name))),k&&V.createElement("select",{"aria-label":"\u5BA1\u6279\u6587\u4EF6\u7248\u672C",value:k.id,onChange:S=>N(S.target.value)},[...w].reverse().map((S,z)=>V.createElement("option",{key:S.id,value:S.id},"V",S.version||w.length-z," \xB7 ",S.name))),k&&V.createElement("span",{className:"df-muted df-approval-versions"},w.length," \u4EFD\u6587\u4EF6 / \u7248\u672C \xB7 \u6700\u65B0\uFF1A",w.at(-1).name),k&&V.createElement("div",{className:"df-actions"},!["pdf","png","jpg","jpeg","webp","gif"].includes(k.name.split(".").pop().toLowerCase())&&V.createElement("button",{onClick:()=>g(k)},"\u9884\u89C8"),V.createElement("button",{"aria-label":"\u4E0B\u8F7D"+k.name+"\u7248\u672C"+(k.version||w.indexOf(k)+1),onClick:()=>m(k)},"\u4E0B\u8F7D\u539F\u6587\u4EF6"),c&&V.createElement("button",{className:"df-delete-file",disabled:x,"aria-label":"\u5220\u9664"+k.name+"\u7248\u672C"+(k.version||w.indexOf(k)+1),onClick:()=>c(D,k)},"\u5220\u9664"))),o,V.createElement(Ka,{key:a+":"+T,projectId:a,file:k,agentId:T,active:r,availableIds:s.flatMap(S=>S.files.map(z=>z.id)).join(",")}))}var Ve=window.QwenPaw,e=Ve.host.React,{useState:Q,useEffect:Ae,useRef:De}=e,Ga=()=>e.createElement("svg",{width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.6",strokeLinejoin:"round",strokeLinecap:"round","aria-hidden":!0,style:{verticalAlign:"middle",flexShrink:0}},e.createElement("path",{d:"M6 2.9h8.5l4.9 4.9v12.1q0 1.2-1.2 1.2H6q-1.4 0-1.4-1.4V4.3q0-1.4 1.4-1.4Z"}),e.createElement("path",{d:"M14.1 3.2v4.9H19M8 11h5.9"}),e.createElement("path",{d:"M8 17.2c1.4-2.25 2.2-3.5 3.1-3.15 1.1.42-.05 3.28 1.05 3.28.8 0 1.2-1.03 1.8-1.03.63 0 1.02.56 2.15.56"})),Ot={pending:"\u672A\u5F00\u59CB",in_progress:"\u8FDB\u884C\u4E2D",submitted:"\u5DF2\u63D0\u4EA4",completed:"\u5DF2\u5B8C\u6210"},xa={pending:"\u5F85\u51C6\u5907",preparing:"\u6574\u7406\u4E2D",ready:"\u5F85\u63D0\u4EA4",submitted:"\u5DF2\u63D0\u4EA4",done:"\u5DF2\u5B8C\u6210",na:"\u4E0D\u9002\u7528"},Xa=["\u4E0A\u62A5\u8BA1\u5212","\u9009\u5546\u8BBA\u8BC1","\u5546\u52A1\u8C08\u5224","\u5F00\u9898\u8BBA\u8BC1","\u5408\u540C\u5BA1\u67E5","\u7ED3\u9898\u9A8C\u6536","\u5F52\u6863\u4ED8\u6B3E"],va=a=>a?new Date(a).toLocaleString("zh-CN",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}):"";function Re({title:a,children:s,onClose:r,error:p,busy:h=!1}){let d=De(null);return Ae(()=>{let g=document.activeElement;return d.current?.querySelector("input,select,textarea,button")?.focus(),()=>{g?.isConnected&&g.focus()}},[]),e.createElement("div",{className:"df-dialog-backdrop"},e.createElement("section",{ref:d,className:"df-dialog df-paper",role:"dialog","aria-modal":"true","aria-label":a,onKeyDown:g=>{if(g.key==="Escape"&&!h&&(g.stopPropagation(),r()),g.key==="Tab"){let m=[...d.current.querySelectorAll("button,input,textarea,select,a[href]")].filter(c=>!c.disabled);g.shiftKey&&document.activeElement===m[0]&&(g.preventDefault(),m.at(-1)?.focus()),!g.shiftKey&&document.activeElement===m.at(-1)&&(g.preventDefault(),m[0]?.focus())}}},e.createElement("div",{className:"df-section-head"},e.createElement("h2",null,a),e.createElement("button",{type:"button",disabled:h,onClick:r,"aria-label":"\u5173\u95ED"+a},"\xD7")),p&&e.createElement("p",{role:"alert",className:"df-alert error"},p),s))}function wa({file:a,projectId:s,download:r,onClose:p,embedded:h=!1}){let[d,g]=Q(null),[m,c]=Q(""),[x,o]=Q(""),b=a.name.split(".").pop().toLowerCase(),v=["pdf","png","jpg","jpeg"].includes(b)&&!Ve.workspace?.loadPreview;Ae(()=>{let D=!0,w;return v?Ve.host.fetch(`/document-forms/projects/${s}/files/${a.id}`).then(async k=>{if(!k.ok)throw new Error("\u9884\u89C8\u672A\u80FD\u6253\u5F00\uFF0C\u8BF7\u4E0B\u8F7D\u67E5\u770B");let I=await k.blob();D&&(w=URL.createObjectURL(new Blob([I],{type:a.mime})),c(w))}).catch(k=>D&&o(k.message)):Ve.workspace?.loadPreview||["doc","docx","xls","xlsx","ppt","pptx"].includes(b)?(Ve.workspace?.loadPreview?Ve.workspace.loadPreview():Promise.resolve(Oe)).then(k=>D&&g(()=>k)).catch(()=>D&&g(()=>Oe)):o("\u6B64\u683C\u5F0F\u8BF7\u4E0B\u8F7D\u540E\u67E5\u770B\u3002"),()=>{D=!1,w&&URL.revokeObjectURL(w)}},[a.id]);let q={id:a.id,title:a.name,source:"uploaded",extension:b,mimeType:a.mime,binaryUrl:a.preview_url,agentId:Ve.host.getSelectedAgentId?.(),createdAt:Date.parse(a.uploaded_at)};return e.createElement(h?"section":Re,{...h?{className:"df-dock-preview","aria-label":"\u6587\u4EF6\u9884\u89C8"}:{title:a.name,onClose:p}},h&&e.createElement("h3",null,a.name),e.createElement("div",{className:"df-attachment-preview"},x?e.createElement("p",{role:"alert"},x):v&&m?b==="pdf"?e.createElement("iframe",{title:a.name,src:m,sandbox:"allow-same-origin"}):e.createElement("img",{src:m,alt:a.name}):d?e.createElement(d,{artifact:q,readOnly:!0,hostControls:!0}):e.createElement("p",{role:"status"},"\u6B63\u5728\u6253\u5F00\u9884\u89C8\u2026")),e.createElement("div",{className:"df-actions"},e.createElement("button",{onClick:()=>r(`/projects/${s}/files/${a.id}`,a.name)},"\u4E0B\u8F7D\u539F\u6587\u4EF6"),e.createElement("button",{onClick:p},"\u5173\u95ED\u9884\u89C8")))}function ya(){let a=new Date;return`${a.getFullYear()}-${String(a.getMonth()+1).padStart(2,"0")}-${String(a.getDate()).padStart(2,"0")}`}function jt(a,s){if(a.status==="completed")return{kind:"done",text:a.approval_date?`${a.id==="selection"?"\u5BA1\u6279\u65E5\u671F":"\u6279\u590D\u65E5\u671F"} ${a.approval_date}`:a.due_date?`\u8BA1\u5212\u65E5\u671F ${a.due_date} \xB7 \u5DF2\u529E\u7ED3`:"\u5DF2\u529E\u7ED3"};if(!a.due_date)return{kind:"unset",text:"\u672A\u8BBE\u7F6E\u8BA1\u5212\u65E5\u671F"};let r=Math.round((Date.parse(a.due_date)-Date.parse(s))/864e5);return Number.isFinite(r)?{kind:r<0?"overdue":r<=3?"soon":"scheduled",text:`${a.due_date} \xB7 ${r<0?`\u5DF2\u903E\u671F ${-r} \u5929`:r===0?"\u4ECA\u5929\u5230\u671F":r<=3?`${r} \u5929\u540E\u5230\u671F`:`\u5269\u4F59 ${r} \u5929`}`}:{kind:"unset",text:"\u8BF7\u68C0\u67E5\u8BA1\u5212\u65E5\u671F"}}function Qt({Editor:a,services:s}){let{request:r,json:p,download:h,Field:d}=s,[g,m]=Q(ya);Ae(()=>{let t=()=>m(ya()),C=setInterval(t,6e4);return window.addEventListener("focus",t),()=>{clearInterval(C),window.removeEventListener("focus",t)}},[]);let[c,x]=Q([]),[o,b]=Q(null),[v,q]=Q("overview"),[N,D]=Q(""),[w,k]=Q(null),[I,T]=Q(!1),[S,z]=Q(!1),[u,J]=Q(""),[_,y]=Q(0),[U,X]=Q("form"),[E,K]=Q(null),[A,Y]=Q(""),[G,de]=Q(""),[Fe,Ce]=Q(""),[Le,te]=Q(null),[F,re]=Q({}),[Ke,Ge]=Q([]),[Te,et]=Q(null),[B,_e]=Q(null),[xe,st]=Q(!1),[ht,pe]=Q(!1),[ze,tt]=Q(()=>{try{let t=Number(window.localStorage.getItem("ugsci.document-forms.right-width"));return Number.isFinite(t)&&t>=300&&t<=3e3?t:500}catch{return 500}}),[xt,Tt]=Q(1200),at=De(null);Ae(()=>{let t=at.current;if(!t||!o?.single_form)return;let C=()=>{let R=t.getBoundingClientRect().width;if(R<=850)return;let ne=t.querySelector(".df-project-sidebar").getBoundingClientRect().width,ke=Math.max(300,Math.floor(R-ne-(window.innerWidth<=1050?380:440)));Tt(ke),tt(Ue=>Math.min(ke,Math.max(300,Ue)))};C();let j=typeof ResizeObserver=="function"?new ResizeObserver(C):null;return j?.observe(t),window.addEventListener("resize",C),()=>{j?.disconnect(),window.removeEventListener("resize",C)}},[xe,o?.single_form]),Ae(()=>{try{window.localStorage.setItem("ugsci.document-forms.right-width",String(ze))}catch{}},[ze]);let vt=t=>tt(Math.min(xt,Math.max(300,Math.round(t)))),[Xe,ee]=Q(null),[lt,ve]=Q("assistant"),oe=De(!0),fe=De(0),ae=De(null),je=De(null),$e=De(""),pt=De(null),it=De(null);it.current=o?.id,Ae(()=>{pt.current?.scrollTo?.({top:0})},[o?.id,v,w?.id]);let St=Ve.host.useTheme?.()||"light",L=o?.stages.find(t=>t.id===v),be=o?.forms.filter(t=>t.stage_id===v)||[],{approvals:ft,attachments:wt}=ha(L?.materials||[]),ce=(o?.stages.find(t=>t.id==="plan")?.materials.flatMap(t=>t.files).filter(t=>t.approval_review)||[]).at(-1),me=()=>!I&&!S||window.confirm("\u8D44\u6599\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\uFF0C\u662F\u5426\u653E\u5F03\u8FD9\u4E9B\u4FEE\u6539\u5E76\u79BB\u5F00\uFF1F");async function Me(){let t=await r("/projects");return oe.current&&x(t),t}async function we(t=o?.id,C=!1){let j=t?await r("/projects/"+t):null;return oe.current&&j&&(C||!it.current||it.current===t)&&(it.current!==j.id&&(_e(null),ee(null),ve("assistant")),it.current=j.id,b(R=>R?.id===j.id&&R.revision>j.revision?R:j)),await Me(),j}Ae(()=>(oe.current=!0,Y("\u8F7D\u5165\u9879\u76EE"),Me().then(async t=>{if(t.length&&oe.current){let C=await r("/projects/"+t[0].id);oe.current&&b(C)}}).catch(t=>oe.current&&de(t.message)).finally(()=>oe.current&&Y("")),()=>{oe.current=!1,fe.current++}),[]),Ae(()=>{let t=C=>{(I||S)&&(C.preventDefault(),C.returnValue="")};return window.addEventListener("beforeunload",t),()=>window.removeEventListener("beforeunload",t)},[I,S]);async function Z(t,C){if(A)return;let j=++fe.current;Y(t),de(""),Ce("");try{await C()}catch(R){oe.current&&j===fe.current&&de(R.message)}finally{oe.current&&j===fe.current&&Y("")}}async function nt(t){me()&&await Z("\u6253\u5F00\u9879\u76EE",async()=>{k(null),T(!1),z(!1),q("overview"),X("form"),await we(t,!0),k(null),T(!1),z(!1),_e(null),ee(null),ve("assistant"),q("overview")})}async function Se(t,C="form"){me()&&(q(t),X(C),k(null),T(!1),z(!1),Ce(""),de(""),o.single_form&&o.stages.some(j=>j.id===t)&&await Z("\u6253\u5F00\u9879\u76EE\u8868\u5355",async()=>{let j=await r(`/projects/${o.id}/form`,p({revision:o.revision,stage_id:t}));await we(),k({id:j.id,view:"edit",revision:j.revision,initialDraft:j})}))}function ie(t,C){re(C),te(t),de("")}async function ue(t,C,j="POST"){let R=await r(t,{...p({...C,revision:o.revision}),method:j});return oe.current&&(b(R),te(null)),await Me(),R}function qe(t){return Z(t?"\u8BFB\u53D6\u9636\u6BB5 Excel":"\u51C6\u5907\u8C08\u5224\u8868\u5355",async()=>{let C;if(t){let j=new FormData;j.append("revision",o.revision),j.append("stage_id",v),j.append("workbook",t),C=await r(`/projects/${o.id}/${o.single_form?"form":"cases"}/import`,{method:"POST",body:j})}else C=await r(`/projects/${o.id}/${o.single_form?"form":"cases"}`,p({revision:o.revision,stage_id:v}));await we(),k({id:C.id,view:"edit",revision:C.revision,initialDraft:o.single_form?C:void 0}),T(!1),t&&Ce(C.templates.length?"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\uFF0C\u5E76\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002":"\u5DF2\u8BFB\u53D6\u672C\u9636\u6BB5\u53D8\u91CF\u914D\u7F6E\uFF0C\u8BF7\u6DFB\u52A0\u5BF9\u5E94\u7684 Word \u6A21\u677F\u3002")})}function Dt(t){if(!t)return;let C=$e.current;return Z("\u4FDD\u5B58\u6750\u6599",async()=>{let j=new FormData;j.append("revision",o.revision),j.append("file",t);let R=await r(`/projects/${o.id}/stages/${v}/materials/${C}/files`,{method:"POST",body:j});b(R),await Me();let ne=R.stages.find(Ue=>Ue.id===v),ke=ne?.materials.find(Ue=>Ue.id===C)?.files.at(-1);Ce(ne?.status==="completed"&&ne.completion_file_id===ke?.id?`\u5BA1\u6279\u6587\u4EF6\u5DF2\u4FDD\u5B58\uFF0C\u672C\u9636\u6BB5\u5DF2\u81EA\u52A8\u6807\u8BB0\u4E3A\u5DF2\u5B8C\u6210\uFF0C${jt(ne,g).text}\u3002`:ke?.approval_review?.status==="ready"&&ke.approval_review.fields?.length?`\u5BA1\u6279\u6587\u4EF6\u5DF2\u4FDD\u5B58\uFF0C\u5E76\u8BC6\u522B\u51FA ${ke.approval_review.fields.length} \u9879\u5BA1\u6279\u7ED3\u679C\u3002`:v==="selection"&&ke?.approval_review?.message?`\u5BA1\u6279\u6587\u4EF6\u5DF2\u4FDD\u5B58\u3002${ke.approval_review.message}`:"\u6750\u6599\u5DF2\u4FDD\u5B58\uFF0C\u539F\u6709\u7248\u672C\u7EE7\u7EED\u4FDD\u7559\u3002\u8BF7\u6838\u5BF9\u540E\u66F4\u65B0\u6750\u6599\u72B6\u6001\u3002")})}let ye=o?`/projects/${o.id}`:"",yt=[{id:"form",label:"\u5185\u5BB9\u586B\u5199"},...o?.single_form?[{id:"generate",label:"\u6587\u4EF6\u751F\u6210"}]:[],...L?.id==="negotiation"?[{id:"response",label:"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5"}]:[],{id:"materials",label:"\u5BA1\u6279\u8D44\u6599"},{id:"attachments",label:"\u5176\u4ED6\u9644\u4EF6"}],kt=t=>{t.preventDefault(),Z("\u4FDD\u5B58\u6750\u6599\u4FE1\u606F",()=>ue(`${ye}/stages/${v}/materials${F.id?"/"+F.id:""}`,F,F.id?"PUT":"POST"))},Ee=t=>Z("\u6574\u7406\u4E0B\u8F7D\u5305",()=>h(ye+"/bundle"+(t?"?stage_id="+t:""),`${o.name}_${t?L.title:"\u5168\u6D41\u7A0B\u6750\u6599"}.zip`));return e.createElement("main",{ref:at,style:{"--df-dock-size":ze+"px"},className:"df-app df-project-app"+(o?.single_form?" df-three-column":"")+(xe?" df-left-collapsed":"")+(ht?" df-right-collapsed":""),"data-theme":St},e.createElement("style",null,sa+la),e.createElement("input",{ref:ae,type:"file",accept:".xlsx",hidden:!0,"aria-label":"\u5BFC\u5165\u9636\u6BB5 Excel",onChange:t=>{let C=t.target.files[0];t.target.value="",C&&qe(C)}}),e.createElement("input",{ref:je,type:"file",accept:".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.png,.jpg,.jpeg,.zip,.txt,.csv",hidden:!0,"aria-label":"\u4E0A\u4F20\u9636\u6BB5\u6750\u6599",onChange:t=>{let C=t.target.files[0];t.target.value="",Dt(C)}}),e.createElement("aside",{className:"df-sidebar df-project-sidebar"+(xe?" df-pane-collapsed":""),"aria-label":"\u9879\u76EE\u9009\u62E9"},e.createElement("button",{className:"df-pane-toggle","aria-label":xe?"\u5C55\u5F00\u9879\u76EE\u680F":"\u6536\u8D77\u9879\u76EE\u680F","aria-expanded":!xe,title:xe?"\u5C55\u5F00\u9879\u76EE\u680F":"\u6536\u8D77\u9879\u76EE\u680F",onClick:()=>st(t=>!t)},e.createElement("span",{"aria-hidden":"true"},xe?"\u203A":"\u2039"),e.createElement("span",null,xe?"\u9879\u76EE":"\u6536\u8D77")),e.createElement("div",{className:"df-brand",style:{display:"flex",alignItems:"center",gap:10}},e.createElement(Ga,null),"\u5916\u534F\u52A9\u624B"),e.createElement("button",{className:"df-primary df-new",disabled:!!A||!!u,onClick:()=>{me()&&ie("create",{name:"",code:"",owner:""})}},"\uFF0B \u65B0\u5EFA\u9879\u76EE"),e.createElement("label",{className:"df-project-search"},e.createElement("span",{className:"df-sr-only"},"\u641C\u7D22\u9879\u76EE"),e.createElement("input",{"aria-label":"\u641C\u7D22\u9879\u76EE",placeholder:"\u641C\u7D22\u9879\u76EE\u540D\u79F0\u6216\u7F16\u53F7",value:N,onChange:t=>D(t.target.value)})),e.createElement("div",{className:"df-caption"},"\u6211\u7684\u9879\u76EE ",e.createElement("span",null,c.length)),e.createElement("nav",{"aria-label":"\u9879\u76EE\u5217\u8868"},c.filter(t=>(t.name+" "+t.code).toLowerCase().includes(N.trim().toLowerCase())).map(t=>e.createElement("button",{key:t.id,disabled:!!A||!!u,"aria-current":o?.id===t.id?"page":void 0,onClick:()=>nt(t.id)},e.createElement("b",null,t.name),e.createElement("small",null,t.code||"\u672A\u8BBE\u7F16\u53F7"," \xB7 ",t.completed,"/7 \u9636\u6BB5\u5B8C\u6210")))),N.trim()&&!c.some(t=>(t.name+" "+t.code).toLowerCase().includes(N.trim().toLowerCase()))&&e.createElement("div",{className:"df-search-empty",role:"status"},e.createElement("p",null,"\u672A\u627E\u5230\u9879\u76EE"),e.createElement("button",{onClick:()=>D("")},"\u6E05\u9664\u641C\u7D22")),e.createElement("div",{className:"df-sidebar-foot",hidden:!!(o?.single_form&&L&&w)},e.createElement("button",{disabled:!!A||!!u,onClick:()=>Z("\u4E0B\u8F7D\u914D\u5957\u6A21\u677F",()=>h("/starter","\u6587\u4E66\u586B\u62A5_\u914D\u5957\u6A21\u677F.zip"))},"\u4E0B\u8F7D\u914D\u5957\u6A21\u677F \u2197"))),e.createElement("section",{className:"df-main df-project-main",ref:pt},e.createElement("header",{className:"df-header"},e.createElement("div",null,e.createElement("h1",null,o?.name||"\u9879\u76EE\u5DE5\u4F5C\u53F0"),e.createElement("p",null,o?[o.code||"\u672A\u8BBE\u9879\u76EE\u7F16\u53F7",o.owner&&"\u7ECF\u529E\u4EBA\uFF1A"+o.owner].filter(Boolean).join("\u3000\xB7\u3000"):"\u7BA1\u7406\u5916\u534F\u9879\u76EE\u3001\u9636\u6BB5\u6750\u6599\u4E0E\u529E\u7406\u8FDB\u5EA6\u3002")),o&&e.createElement("div",{className:"df-actions"},e.createElement("button",{disabled:!!A||!!u,onClick:()=>Se("profile")},"\u57FA\u7840\u4FE1\u606F\u586B\u62A5"),e.createElement("button",{disabled:!!A||!!u,onClick:()=>Ee()},"\u4E0B\u8F7D\u9879\u76EE\u6750\u6599"))),G&&e.createElement("div",{role:"alert",className:"df-alert error"},G,e.createElement("button",{"aria-label":"\u5173\u95ED\u9519\u8BEF\u63D0\u793A",onClick:()=>de("")},"\xD7")),Fe&&e.createElement("div",{className:"df-alert",role:"status"},Fe),Te&&Te.projectId===o?.id&&Te.stageId===v&&e.createElement("div",{className:"df-alert df-file-deleted",role:"status"},e.createElement("span",null,"\u5DF2\u5220\u9664 V",Te.file.version," \xB7 ",Te.file.name),e.createElement("button",{disabled:!!A||!!u,onClick:()=>Z("\u64A4\u9500\u5220\u9664",async()=>{let t=await r(`/projects/${Te.projectId}/stages/${Te.stageId}/materials/${Te.materialId}/files/${Te.file.id}/restore`,p({revision:o.revision}));b(t),et(null),Ce("\u5BA1\u6279\u6587\u4EF6\u5DF2\u6062\u590D\u3002"),await Me()})},"\u64A4\u9500\u5220\u9664")),A&&e.createElement("div",{className:"df-progress",role:"status"},A,"\u2026"),o?e.createElement(e.Fragment,null,e.createElement("nav",{className:"df-project-tabs","aria-label":"\u9879\u76EE\u9636\u6BB5"},e.createElement("button",{className:v==="overview"?"active":"",disabled:!!A||!!u,onClick:()=>Se("overview")},"\u9879\u76EE\u603B\u89C8"),o.stages.map((t,C)=>e.createElement("button",{key:t.id,"aria-current":v===t.id?"step":void 0,className:v===t.id?"active":"",disabled:!!A||!!u,onClick:()=>Se(t.id)},e.createElement("small",null,String(C+1).padStart(2,"0"))," ",t.title,e.createElement("span",{className:"df-state df-state-"+t.status},t.upstream_changed.length||t.documents_changed?"\u5F85\u590D\u6838":Ot[t.status])))),e.createElement("fieldset",{className:"df-content",disabled:!!A||!!u},v==="overview"&&e.createElement(e.Fragment,null,o.migrated&&e.createElement("p",{className:"df-muted df-migration-note"},"\u5386\u53F2\u586B\u62A5\u5DF2\u6309\u9879\u76EE\u540D\u79F0\u6216\u7F16\u53F7\u5F52\u5165\u5546\u52A1\u8C08\u5224\u9636\u6BB5\uFF0C\u539F\u8868\u5355\u3001\u751F\u6210\u6279\u6B21\u548C\u6587\u4EF6\u5747\u4FDD\u7559\u3002"),e.createElement("section",{className:"df-project-metrics"},e.createElement("div",null,e.createElement("b",null,o.stages.filter(t=>t.status==="completed").length,e.createElement("small",null,"/ ",o.stages.length)),e.createElement("span",null,"\u5DF2\u5B8C\u6210\u9636\u6BB5")),e.createElement("div",null,e.createElement("b",null,o.stages.reduce((t,C)=>t+C.materials.filter(j=>!["done","na"].includes(j.status)).length,0)),e.createElement("span",null,"\u5F85\u6574\u7406\u6750\u6599")),e.createElement("div",null,e.createElement("b",null,o.forms.reduce((t,C)=>t+C.outputs,0)),e.createElement("span",null,"\u5DF2\u751F\u6210\u6587\u4EF6")),e.createElement("div",null,e.createElement("b",null,o.stages.filter(t=>t.upstream_changed.length||t.documents_changed).length),e.createElement("span",null,"\u5F85\u590D\u6838\u9636\u6BB5"))),e.createElement("div",{className:"df-project-stage-grid"},o.stages.map((t,C)=>e.createElement("button",{className:"df-paper df-stage-card",key:t.id,onClick:()=>Se(t.id)},e.createElement("div",{className:"df-section-head"},e.createElement("small",null,"\u9636\u6BB5 ",String(C+1).padStart(2,"0")),e.createElement("span",{className:"df-state df-state-"+t.status},t.upstream_changed.length||t.documents_changed?"\u5F85\u590D\u6838":Ot[t.status])),e.createElement("h2",null,t.title),e.createElement("p",null,t.purpose),e.createElement("span",{className:"df-deadline "+jt(t,g).kind},jt(t,g).text),e.createElement("footer",null,e.createElement("span",null,t.materials.filter(j=>["done","na"].includes(j.status)).length,"/",t.materials.length," \u9879\u6750\u6599\u5DF2\u5904\u7406"),e.createElement("span",null,t.upstream_changed.length||t.documents_changed?"\u6709\u53D8\u66F4\u5F85\u590D\u6838":t.due_date?"\u8BA1\u5212 "+t.due_date:"\u8FDB\u5165\u9636\u6BB5 \u2192"))))),e.createElement("section",{className:"df-paper df-project-hint"},e.createElement("h2",null,"\u4E00\u4EFD\u9879\u76EE\u5E95\u7A3F\uFF0C\u8D2F\u7A7F\u5404\u9636\u6BB5"),e.createElement("p",null,"\u9879\u76EE\u540D\u79F0\u3001\u7814\u7A76\u5185\u5BB9\u3001\u6210\u679C\u6307\u6807\u548C\u9884\u7B97\u7B49\u53EF\u5728\u201C\u57FA\u7840\u4FE1\u606F\u586B\u62A5\u201D\u7EDF\u4E00\u7EF4\u62A4\u3002\u9636\u6BB5\u8868\u5355\u4ECE\u5E95\u7A3F\u53D6\u503C\uFF0C\u540E\u7EED\u53D8\u66F4\u4F1A\u63D0\u9192\u6838\u5BF9\uFF1B\u5DF2\u6709\u751F\u6210\u6587\u4EF6\u4FDD\u7559\u539F\u6837\u3002"),e.createElement("button",{onClick:()=>Se("profile")},"\u586B\u5199\u57FA\u7840\u4FE1\u606F"))),v==="profile"&&e.createElement(Ja,{onDirtyChange:z,key:o.id+":"+o.revision,project:o,Field:d,request:r,onSave:t=>Z("\u4FDD\u5B58\u57FA\u7840\u4FE1\u606F",async()=>{await ue(ye,t,"PUT"),Ce("\u57FA\u7840\u4FE1\u606F\u5DF2\u66F4\u65B0\u3002\u5DF2\u6709\u8868\u5355\u53EF\u9010\u9879\u6838\u5BF9\u540E\u540C\u6B65\uFF0C\u539F\u751F\u6210\u6587\u4EF6\u4E0D\u53D8\u3002")})}),L&&e.createElement(e.Fragment,null,e.createElement("section",{className:"df-paper df-stage-header"},e.createElement("div",{className:"df-stage-top-row"},e.createElement("div",{className:"df-stage-heading"},e.createElement("h2",null,L.title),!o.single_form&&e.createElement("details",{className:"df-stage-help"},e.createElement("summary",null,"\u672C\u9636\u6BB5\u529E\u7406\u8BF4\u660E"),e.createElement("p",null,o.single_form&&L.id==="plan"?"\u5DF2\u63A5\u5165\u79D1\u7814\u8BA1\u5212\u586B\u62A5\u8868\u4E0E\u5916\u534F\u5FC5\u8981\u6027\u8BF4\u660E\uFF0C\u53EF\u76F4\u63A5\u586B\u5199\u5E76\u751F\u6210\u3002":L.id==="selection"?"\u5DF2\u63A5\u5165\u8BBA\u8BC1\u610F\u89C1\u53CA\u7B7E\u5B57\u8868\u4E0E\u975E\u62DB\u6807\u65B9\u6848\u586B\u62A5\u8868\uFF0C\u53EF\u5148\u51C6\u5907\u8BBA\u8BC1\u6750\u6599\uFF0C\u8BBA\u8BC1\u7ED3\u675F\u540E\u6838\u5BF9\u7CFB\u7EDF\u586B\u62A5\u4FE1\u606F\u3002":L.id==="negotiation"?"\u4E94\u4EFD\u6807\u51C6\u6A21\u677F\u5DF2\u63A5\u5165\uFF0C\u53EF\u76F4\u63A5\u586B\u5199\uFF0C\u4E5F\u53EF\u5BFC\u5165\u73B0\u6709 Excel\u3002":"\u7EDF\u4E00\u6A21\u677F\u5F85\u8865\u5145\uFF0C\u53EF\u4E0A\u4F20\u9636\u6BB5\u6750\u6599\uFF0C\u6216\u5BFC\u5165 Excel \u4E0E Word \u6A21\u677F\u3002"))),e.createElement("div",{className:"df-stage-toolbar",role:"toolbar","aria-label":"\u9636\u6BB5\u5DE5\u5177\u680F"},e.createElement("div",{className:"df-stage-tool-slot",ref:K}),(!o.single_form||!w||!Ve.host.ReactDOM?.createPortal)&&e.createElement("div",{className:"df-toolbar-file-actions"},e.createElement("button",{"aria-label":"\u4E0B\u8F7D\u672C\u9636\u6BB5\u6750\u6599",title:"\u4E0B\u8F7D\u672C\u9636\u6BB5\u6750\u6599",onClick:()=>Ee(L.id)},e.createElement(he,{name:"download"}),"\u9636\u6BB5\u6750\u6599")))),e.createElement("div",{className:"df-stage-bottom-row"},e.createElement(_t,{id:"df-node",label:"\u9636\u6BB5\u529E\u7406\u6D41\u7A0B",items:yt,value:U,onChange:t=>{X(t),t==="form"&&U==="form"&&y(C=>C+1),document.getElementById("df-node-tab-"+t)?.closest(".df-stage-header")?.scrollIntoView?.({block:"start"})}}),e.createElement("div",{className:"df-node-status","aria-label":"\u8282\u70B9\u529E\u7406\u6982\u51B5"},e.createElement("button",{className:"df-stage-state df-state df-state-"+L.status,disabled:I,"aria-label":"\u529E\u7406\u4FE1\u606F\u4E0E\u72B6\u6001",title:I?"\u8BF7\u5148\u4FDD\u5B58\u586B\u5199\u5185\u5BB9\uFF0C\u518D\u66F4\u65B0\u529E\u7406\u72B6\u6001":"\u529E\u7406\u4FE1\u606F\u4E0E\u72B6\u6001",onClick:()=>ie("stage",{...L,confirmed:!1})},e.createElement("span",{className:"df-state-dot","aria-hidden":"true"}),Ot[L.status],e.createElement(he,{name:"chevron"})),e.createElement("span",{className:"df-deadline "+jt(L,g).kind},e.createElement(he,{name:"calendar"}),jt(L,g).text),e.createElement("span",{className:"df-stage-approval-count"},"\u5BA1\u6279\u8D44\u6599"," ",ft.filter(t=>t.files.length).length,"/",ft.length)))),(L.upstream_changed.length>0||L.documents_changed)&&e.createElement("div",{className:"df-alert df-stage-warning"},e.createElement("div",null,e.createElement("b",null,"\u672C\u9636\u6BB5\u6709\u8D44\u6599\u9700\u8981\u590D\u6838"),e.createElement("p",null,L.upstream_changed.length>0&&"\u524D\u5E8F\u9636\u6BB5\u5DF2\u66F4\u65B0\uFF1A"+L.upstream_changed.join("\u3001")+"\u3002",L.documents_changed&&"\u672C\u9636\u6BB5\u8868\u5355\u6216\u751F\u6210\u6587\u4EF6\u6709\u66F4\u65B0\u3002","\u8BF7\u6838\u5BF9\u5DF2\u63D0\u4EA4\u7684\u6750\u6599\u662F\u5426\u9700\u8981\u8C03\u6574\u3002")),e.createElement("button",{onClick:()=>Z("\u8BB0\u5F55\u590D\u6838",()=>ue(`${ye}/stages/${L.id}/acknowledge`,{}))},"\u5DF2\u6838\u5BF9\u53D8\u66F4")),(L.system_name||L.submission_ref||L.notes)&&e.createElement("section",{className:"df-paper df-stage-details"},e.createElement("dl",null,e.createElement("div",null,e.createElement("dt",null,"\u529E\u7406\u7CFB\u7EDF"),e.createElement("dd",null,L.system_url?e.createElement("a",{href:L.system_url,target:"_blank",rel:"noopener noreferrer"},L.system_name||"\u6253\u5F00\u529E\u7406\u7CFB\u7EDF"," \u2197"):L.system_name||"\u672A\u8BB0\u5F55")),e.createElement("div",null,e.createElement("dt",null,"\u63D0\u4EA4\u7F16\u53F7 / \u56DE\u6267"),e.createElement("dd",null,L.submission_ref||"\u672A\u8BB0\u5F55"))),L.notes&&e.createElement("p",null,L.notes)),e.createElement("div",{id:o.single_form&&w?void 0:"df-node-panel-form",role:o.single_form&&w?void 0:"tabpanel","aria-labelledby":o.single_form&&w?void 0:"df-node-tab-form",hidden:U!=="form"&&!(o.single_form&&w&&U==="generate")},e.createElement("div",{id:"df-node-form"},w&&e.createElement(a,{key:o.id+":"+w.id+":"+v+":"+(w.revision||""),project:o,workflowStage:L,initialCaseId:w.id,initialView:w.view,editRequest:_,initialDraft:w.initialDraft,onDirtyChange:T,onBusyChange:J,onViewChange:()=>document.getElementById("df-node-form")?.scrollIntoView?.({block:"start"}),onBack:()=>{k(null),T(!1),we().catch(t=>de(t.message))},onChanged:()=>we(),docked:o.single_form,nodeTab:U,selectedOutput:Xe?.reference,onAskAboutOutput:()=>{pe(!1),ve("assistant")},toolbarTarget:E,onShowForm:()=>X("form"),onOpenApproval:t=>Se(t,"materials"),onDownloadStageMaterials:()=>Ee(L.id),onEditBasics:()=>{k(null),T(!1),J(""),q("profile")},onStageStatus:()=>ie("stage",{...L,confirmed:!1}),onPreview:t=>{ee(t),_e(null),pe(!1),ve("preview")}})),!w&&e.createElement("section",{className:"df-paper df-stage-forms"},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,o.single_form?"\u9879\u76EE\u8868\u5355":"\u586B\u5199\u4E0E\u751F\u6210"),e.createElement("p",{className:"df-muted"},"\u8868\u5355\u6CBF\u7528\u9879\u76EE\u5E95\u7A3F\uFF0C\u6838\u5BF9\u540E\u751F\u6210\u3002\u5DF2\u6709\u6279\u6B21\u4FDD\u7559\u751F\u6210\u65F6\u7684\u5185\u5BB9\u3002")),e.createElement("div",{className:"df-actions"},(L.id==="negotiation"||o.single_form)&&e.createElement("button",{className:"df-primary",onClick:()=>qe()},o.single_form?"\u6253\u5F00\u9879\u76EE\u8868\u5355":"\u586B\u5199\u8C08\u5224\u6750\u6599"),e.createElement("button",{onClick:()=>ae.current.click()},"\u5BFC\u5165 Excel \u8868\u5355"))),o.single_form?e.createElement("p",{className:"df-muted"},"\u6BCF\u4E2A\u9879\u76EE\u5171\u7528\u4E00\u4EFD\u8868\u5355\uFF0C\u4E03\u4E2A\u9636\u6BB5\u5404\u529E\u7406\u4E00\u6B21\u3002"):be.length?e.createElement("div",{className:"df-project-forms"},be.map(t=>e.createElement("div",{key:t.case_id},e.createElement("div",null,e.createElement("b",null,t.name),e.createElement("small",null,va(t.updated_at)," \xB7"," ",t.outputs?t.outputs+" \u4EFD\u6587\u4EF6":"\u586B\u5199\u4E2D",t.shared_changes.length>0&&" \xB7 \u57FA\u7840\u4FE1\u606F\u6709\u66F4\u65B0")),e.createElement("div",{className:"df-actions"},e.createElement("button",{onClick:()=>k({id:t.case_id,view:"edit"})},"\u6253\u5F00\u8868\u5355"),t.outputs>0&&e.createElement("button",{onClick:()=>k({id:t.case_id,view:"files"})},"\u67E5\u770B\u751F\u6210\u6587\u4EF6"))))):e.createElement("p",{className:"df-empty"},"\u672C\u9636\u6BB5\u8FD8\u6CA1\u6709\u8868\u5355\u3002\u5DF2\u6709\u6210\u54C1\u6587\u4EF6\u53EF\u76F4\u63A5\u4E0A\u4F20\u5230\u4E0B\u9762\u7684\u6750\u6599\u6E05\u5355\u3002"))),o.single_form&&!w&&e.createElement("section",{className:"df-paper df-stage-forms",id:"df-node-panel-generate",role:"tabpanel","aria-labelledby":"df-node-tab-generate",hidden:U!=="generate"},e.createElement("button",{className:"df-primary",onClick:()=>qe()},"\u6253\u5F00\u9879\u76EE\u8868\u5355")),L.id==="negotiation"&&e.createElement("section",{className:"df-paper df-review-entry",role:"tabpanel",id:"df-node-panel-response","aria-labelledby":"df-node-tab-response",hidden:U!=="response"},e.createElement("div",null,e.createElement("h2",null,"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5"),e.createElement("p",{className:"df-muted"},"\u5BF9\u7167\u6B63\u5F0F\u8C08\u5224\u6587\u4EF6\uFF0C\u68C0\u67E5\u5404\u5355\u4F4D\u54CD\u5E94\u6750\u6599\uFF0C\u6C47\u603B\u95EE\u9898\u3001\u4F9D\u636E\u548C\u5F85\u786E\u8BA4\u4E8B\u9879\u3002")),e.createElement("button",{onClick:()=>o.single_form?ve("review"):ie("response-review",{})},"\u6253\u5F00\u6838\u67E5\u667A\u80FD\u4F53 \u2192")),e.createElement("div",{role:"tabpanel",id:"df-node-panel-materials","aria-labelledby":"df-node-tab-materials",hidden:U!=="materials"},e.createElement(Bt,{key:o.id+":"+L.id,projectId:o.id,materials:ft,active:U==="materials",busy:!!A||!!u,onDelete:(t,C)=>ie("delete-file",{materialId:t.id,file:{...C,version:C.version||t.files.indexOf(C)+1}}),onUpload:t=>{$e.current=t.id,je.current.click()},onEdit:t=>ie("material",{...t}),onAdd:()=>ie("material",{name:"\u5BA1\u6279\u8D44\u6599",status:"pending",required:!1,note:""}),onPreview:t=>{_e(t),ee({artifact:{title:t.name},reference:{file_id:t.id}}),ve("preview")},onDownload:t=>Z("\u4E0B\u8F7D\u5BA1\u6279\u6587\u4EF6",()=>h(ye+"/files/"+t.id,t.name)),review:L.id==="plan"&&ce&&e.createElement("div",{className:"df-approval-review-summary"},ce.approval_review.status==="ready"?e.createElement(e.Fragment,null,e.createElement("span",{className:"df-muted"},"\u6279\u590D\u65E5\u671F"," ",ce.approval_review.approved_at," \xB7 \u5DF2\u8BC6\u522B"," ",ce.approval_review.fields.length," ","\u9879 \xB7"," ",ce.approval_review.change_count?`\u53D1\u73B0 ${ce.approval_review.change_count} \u9879\u5DEE\u5F02`:"\u4E0E\u5F53\u524D\u8D44\u6599\u4E00\u81F4"),e.createElement("button",{onClick:()=>{Ge(ce.approval_review.fields.filter(t=>t.changed).map(t=>t.key)),te("approval")}},"\u67E5\u770B\u6BD4\u5BF9\u7ED3\u679C \u2192")):e.createElement("span",{className:"df-muted"},ce.approval_review.message))})),e.createElement("div",{role:"tabpanel",id:"df-node-panel-attachments","aria-labelledby":"df-node-tab-attachments",hidden:U!=="attachments"},e.createElement("section",{className:"df-paper df-material-panel",id:"df-node-attachments"},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,"\u5176\u4ED6\u9644\u4EF6 ",e.createElement("small",null,wt.length)),e.createElement("p",{className:"df-muted"},"\u9879\u76EE\u8FC7\u7A0B\u6587\u4EF6\u548C\u8865\u5145\u6750\u6599\u3002")),e.createElement("button",{onClick:()=>ie("material",{name:"",status:"pending",required:!1,note:""})},"\uFF0B \u6DFB\u52A0\u6750\u6599")),e.createElement("div",{className:"df-materials"},wt.map(t=>{let C=be.reduce((j,R)=>j+(R.generations[0]?.files.filter(ne=>ne.name.includes(t.name)).length||0),0);return e.createElement("article",{className:"df-material-row",key:t.id},e.createElement("div",{className:"df-material-name"},e.createElement("b",null,t.name),t.required&&e.createElement("span",{className:"df-required-tag"},"\u5FC5\u5907"),e.createElement("span",{className:"df-state df-material-state-"+t.status},xa[t.status]),C>0&&e.createElement("small",null,"\u5DF2\u6709 ",C," \u4EFD\u751F\u6210\u7A3F \xB7"," ",o.single_form?"\u5728\u6587\u4EF6\u751F\u6210\u4E2D\u67E5\u770B":"\u5728\u4E0A\u65B9\u8868\u5355\u67E5\u770B"),t.note&&e.createElement("p",null,t.note)),e.createElement("div",{className:"df-material-files"},t.files.length>0?e.createElement("details",null,e.createElement("summary",null,t.files.length," \u4EFD\u6587\u4EF6 / \u7248\u672C \xB7 \u6700\u65B0\uFF1A",t.files[t.files.length-1].name),[...t.files].reverse().map((j,R)=>e.createElement("div",{className:"df-material-file",key:j.id},e.createElement("div",null,e.createElement("b",null,"V",j.version||t.files.length-R," ","\xB7 ",j.name),e.createElement("small",null,va(j.uploaded_at)," \xB7"," ",Math.max(1,Math.round(j.size/1024))," ","KB")),e.createElement("button",{onClick:()=>{_e(j),ee({artifact:{title:j.name},reference:{file_id:j.id}}),ve("preview")}},"\u9884\u89C8"),e.createElement("button",{"aria-label":"\u4E0B\u8F7D"+j.name+"\u7248\u672C"+(j.version||t.files.length-R),onClick:()=>Z("\u4E0B\u8F7D\u6750\u6599",()=>h(`${ye}/files/${j.id}`,j.name))},"\u4E0B\u8F7D")))):e.createElement("span",{className:"df-muted"},"\u5C1A\u672A\u4E0A\u4F20\u6587\u4EF6")),e.createElement("div",{className:"df-actions"},e.createElement("button",{"aria-label":"\u4E0A\u4F20"+t.name,onClick:()=>{$e.current=t.id,je.current.click()}},"\u4E0A\u4F20\u6587\u4EF6"),e.createElement("button",{"aria-label":"\u7F16\u8F91"+t.name,onClick:()=>ie("material",{...t})},"\u7F16\u8F91")))})))),!o.single_form&&e.createElement("div",{className:"df-stage-tail"},e.createElement("p",null,"\u5404\u9636\u6BB5\u53EF\u5E76\u884C\u51C6\u5907\uFF1B\u524D\u5E8F\u8D44\u6599\u53D8\u5316\u540E\uFF0C\u540E\u7EED\u9636\u6BB5\u4F1A\u63D0\u793A\u590D\u6838\u3002\u9636\u6BB5\u5B8C\u6210\u7531\u7ECF\u529E\u4EBA\u786E\u8BA4\u3002"),e.createElement("button",{onClick:()=>ie("stage",{...L,confirmed:!1})},"\u66F4\u65B0\u529E\u7406\u72B6\u6001"))))):e.createElement("section",{className:"df-paper df-project-welcome"},e.createElement("h2",null,"\u5148\u5EFA\u4E00\u4E2A\u9879\u76EE"),e.createElement("p",null,"\u586B\u5199\u57FA\u7840\u4FE1\u606F\u540E\uFF0C\u9009\u62E9\u9636\u6BB5\u529E\u7406\u3002"),e.createElement("div",{className:"df-welcome-stages"},Xa.map((t,C)=>e.createElement("span",{key:t},e.createElement("small",null,String(C+1).padStart(2,"0")),t))),e.createElement("button",{className:"df-primary",onClick:()=>ie("create",{name:"",code:"",owner:""})},"\u5EFA\u7ACB\u7B2C\u4E00\u4E2A\u9879\u76EE"))),o?.single_form&&e.createElement(Ut,{key:o.id,collapsed:ht,width:ze,maxWidth:xt,onResize:vt,onToggle:()=>pe(t=>!t),project:o,stageId:v,services:s,mode:lt,onMode:ve,selection:Xe,attachment:B,AttachmentPreview:wa,dirty:I,onSelect:t=>{ee(t),_e(null),ve("preview")},onChanged:()=>we().catch(t=>de(t.message))}),Le==="delete-file"&&e.createElement(Re,{title:"\u5220\u9664\u5BA1\u6279\u6587\u4EF6",busy:!!A,error:G,onClose:()=>te(null)},e.createElement("p",null,"\u786E\u5B9A\u5220\u9664\u5F53\u524D\u9009\u4E2D\u7684\u5BA1\u6279\u6587\u4EF6\uFF1F"),e.createElement("p",{className:"df-delete-file-name"},"V",F.file.version," \xB7 ",F.file.name),e.createElement("p",{className:"df-muted"},"\u5220\u9664\u540E\u53EF\u901A\u8FC7\u201C\u64A4\u9500\u5220\u9664\u201D\u6062\u590D\u3002"),e.createElement("div",{className:"df-actions"},e.createElement("button",{disabled:!!A,onClick:()=>te(null)},"\u53D6\u6D88"),e.createElement("button",{className:"df-danger",disabled:!!A||!!u,onClick:()=>Z("\u5220\u9664\u5BA1\u6279\u6587\u4EF6",async()=>{let t={projectId:o.id,stageId:v,materialId:F.materialId,file:F.file},C=await r(`/projects/${t.projectId}/stages/${t.stageId}/materials/${t.materialId}/files/${t.file.id}`,{...p({revision:o.revision}),method:"DELETE"});b(C),te(null),et(t),(B?.id===t.file.id||Xe?.reference?.file_id===t.file.id)&&(_e(null),ee(null),ve("assistant")),await Me()})},"\u786E\u8BA4\u5220\u9664"))),Le==="response-review"&&e.createElement(Re,{title:"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5",onClose:()=>{te(null),we().catch(t=>de(t.message))}},e.createElement(Ct,{project:o,services:s,onChanged:()=>we().catch(t=>de(t.message))})),Le==="approval"&&ce&&e.createElement(Re,{title:"\u6838\u5BF9\u8BA1\u5212\u5BA1\u6279\u7ED3\u679C",busy:!!A,error:G,onClose:()=>te(null)},e.createElement("p",{className:"df-muted"},"\u6765\u6E90\uFF1A",ce.name," \xB7 \u6279\u590D\u65E5\u671F"," ",ce.approval_review.approved_at,"\u3002\u4EC5\u52FE\u9009\u7684\u5DEE\u5F02\u4F1A\u5199\u56DE\u9879\u76EE\u8D44\u6599\u548C\u4E0A\u62A5\u8BA1\u5212\u8868\u5355\u3002"),e.createElement("div",{className:"df-compare df-approval-compare"},ce.approval_review.fields.map(t=>e.createElement("label",{key:t.key},e.createElement("input",{type:"checkbox","aria-label":"\u91C7\u7528\u5BA1\u6279\u7ED3\u679C\uFF1A"+t.label,disabled:!t.changed,checked:Ke.includes(t.key),onChange:C=>Ge(C.target.checked?[...Ke,t.key]:Ke.filter(j=>j!==t.key))}),e.createElement("div",null,e.createElement("b",null,t.label,!t.changed&&e.createElement("small",null," \u4E00\u81F4")),e.createElement("div",{className:"df-compare-values"},e.createElement("p",null,e.createElement("small",null,"\u5F53\u524D\u8D44\u6599"),t.current||"\u7A7A\u767D"),e.createElement("p",null,e.createElement("small",null,"\u5BA1\u6279\u7ED3\u679C"),t.value||"\u7A7A\u767D")))))),I&&e.createElement("p",{role:"status"},"\u8BF7\u5148\u4FDD\u5B58\u586B\u5199\u5185\u5BB9\uFF0C\u518D\u91C7\u7528\u5BA1\u6279\u7ED3\u679C\u3002"),e.createElement("div",{className:"df-actions"},e.createElement("button",{disabled:!!A,onClick:()=>te(null)},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!A||!!u||I||!Ke.length,onClick:()=>Z("\u91C7\u7528\u5BA1\u6279\u7ED3\u679C",async()=>{let t=await r(`${ye}/stages/plan/approval/apply`,p({revision:o.revision,file_id:ce.id,keys:Ke}));if(b(t),w){let C=await r(`/cases/${w.id}`);k({...w,initialDraft:C,revision:C.revision})}te(null),Ge([]),await Me(),Ce("\u5DF2\u91C7\u7528\u6240\u9009\u5BA1\u6279\u7ED3\u679C\u3002\u540E\u7EED\u9636\u6BB5\u4F1A\u63D0\u793A\u91CD\u65B0\u6838\u5BF9\u53D7\u5F71\u54CD\u8D44\u6599\u3002")})},"\u91C7\u7528\u6240\u9009 ",Ke.length," \u9879"))),Le==="create"&&e.createElement(Re,{title:"\u65B0\u5EFA\u9879\u76EE",busy:!!A,error:G,onClose:()=>te(null)},e.createElement("form",{onSubmit:t=>{t.preventDefault(),Z("\u5EFA\u7ACB\u9879\u76EE",async()=>{let C=await r("/projects",p(F));_e(null),ee(null),ve("assistant"),b(C),q("overview"),k(null),T(!1),te(null),await Me()})}},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u540D\u79F0"),e.createElement("input",{"aria-label":"\u65B0\u9879\u76EE\u540D\u79F0",required:!0,maxLength:120,value:F.name,onChange:t=>re({...F,name:t.target.value})})),e.createElement("div",{className:"df-fields"},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u7F16\u53F7"),e.createElement("input",{"aria-label":"\u65B0\u9879\u76EE\u7F16\u53F7",maxLength:100,value:F.code,onChange:t=>re({...F,code:t.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u7ECF\u529E\u4EBA"),e.createElement("input",{"aria-label":"\u65B0\u9879\u76EE\u7ECF\u529E\u4EBA",maxLength:100,value:F.owner,onChange:t=>re({...F,owner:t.target.value})}))),e.createElement("p",{className:"df-muted"},"\u5EFA\u7ACB\u9879\u76EE\u540E\uFF0C\u53EF\u6574\u7406\u5171\u7528\u8D44\u6599\uFF0C\u518D\u6309\u4E03\u4E2A\u9636\u6BB5\u51C6\u5907\u6750\u6599\u3002"),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",disabled:!!A||!!u,onClick:()=>te(null)},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!A||!F.name?.trim(),type:"submit"},"\u5EFA\u7ACB\u9879\u76EE")))),Le==="material"&&e.createElement(Re,{title:"\u6750\u6599\u4FE1\u606F",busy:!!A,error:G,onClose:()=>te(null)},e.createElement("form",{onSubmit:kt},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u6750\u6599\u540D\u79F0"),e.createElement("input",{"aria-label":"\u6750\u6599\u540D\u79F0",required:!0,maxLength:150,value:F.name,onChange:t=>re({...F,name:t.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u6750\u6599\u72B6\u6001"),e.createElement("select",{"aria-label":"\u6750\u6599\u72B6\u6001",value:F.status,onChange:t=>re({...F,status:t.target.value})},Object.entries(xa).map(([t,C])=>e.createElement("option",{key:t,value:t},C)))),e.createElement("label",{className:"df-checkbox"},e.createElement("input",{type:"checkbox",checked:F.required,onChange:t=>re({...F,required:t.target.checked})}),"\u672C\u9879\u76EE\u7684\u5FC5\u5907\u6750\u6599\uFF0C\u9636\u6BB5\u5B8C\u6210\u524D\u9700\u786E\u8BA4\u5DF2\u5B8C\u6210\u6216\u4E0D\u9002\u7528"),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u6750\u6599\u8BF4\u660E"),e.createElement("textarea",{"aria-label":"\u6750\u6599\u8BF4\u660E",rows:3,maxLength:3e3,value:F.note,onChange:t=>re({...F,note:t.target.value})})),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",onClick:()=>te(null),disabled:!!A||!!u},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!A||!!u,type:"submit"},"\u4FDD\u5B58\u6750\u6599\u4FE1\u606F")))),Le==="stage"&&e.createElement(Re,{title:L.title+"\u529E\u7406\u4FE1\u606F",busy:!!A,error:G,onClose:()=>te(null)},e.createElement("form",{onSubmit:t=>{t.preventDefault(),Z("\u4FDD\u5B58\u529E\u7406\u4FE1\u606F",()=>ue(`${ye}/stages/${v}`,F,"PUT"))}},e.createElement("div",{className:"df-fields"},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9636\u6BB5\u72B6\u6001"),e.createElement("select",{"aria-label":"\u9636\u6BB5\u72B6\u6001",value:F.status,onChange:t=>re({...F,status:t.target.value})},Object.entries(Ot).map(([t,C])=>e.createElement("option",{key:t,value:t},C)))),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u8BA1\u5212\u65E5\u671F"),e.createElement("input",{"aria-label":"\u9636\u6BB5\u8BA1\u5212\u65E5\u671F",type:"date",value:F.due_date,onChange:t=>re({...F,due_date:t.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u529E\u7406\u7CFB\u7EDF"),e.createElement("input",{"aria-label":"\u529E\u7406\u7CFB\u7EDF",maxLength:150,value:F.system_name,onChange:t=>re({...F,system_name:t.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u7CFB\u7EDF\u5730\u5740"),e.createElement("input",{"aria-label":"\u7CFB\u7EDF\u5730\u5740",type:"url",placeholder:"https://",maxLength:1e3,value:F.system_url,onChange:t=>re({...F,system_url:t.target.value})}))),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u63D0\u4EA4\u7F16\u53F7 / \u56DE\u6267\u4FE1\u606F"),e.createElement("input",{"aria-label":"\u63D0\u4EA4\u7F16\u53F7",maxLength:500,value:F.submission_ref,onChange:t=>re({...F,submission_ref:t.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u529E\u7406\u8BF4\u660E"),e.createElement("textarea",{"aria-label":"\u529E\u7406\u8BF4\u660E",rows:4,maxLength:5e3,value:F.notes,onChange:t=>re({...F,notes:t.target.value})})),e.createElement("p",{className:"df-muted"},"\u8BB0\u5F55\u7EBF\u4E0B\u6216\u4E1A\u52A1\u7CFB\u7EDF\u7684\u5B9E\u9645\u529E\u7406\u7ED3\u679C\uFF0C\u56DE\u6267\u6587\u4EF6\u53EF\u4E0A\u4F20\u5230\u6750\u6599\u6E05\u5355\u3002"),F.status==="completed"&&e.createElement(e.Fragment,null,e.createElement("p",{className:"df-muted"},L.missing_required.length>0?"\u5C1A\u672A\u529E\u7ED3\u7684\u5FC5\u5907\u6750\u6599\uFF1A"+L.missing_required.join("\u3001"):"\u8BF7\u786E\u8BA4\u9636\u6BB5\u6750\u6599\u548C\u524D\u5E8F\u53D8\u66F4\u5DF2\u6838\u5BF9\u3002"),e.createElement("label",{className:"df-checkbox"},e.createElement("input",{"aria-label":"\u786E\u8BA4\u672C\u9636\u6BB5\u5DF2\u529E\u7ED3",type:"checkbox",checked:F.confirmed,onChange:t=>re({...F,confirmed:t.target.checked})}),"\u5DF2\u6838\u5BF9\u672C\u9636\u6BB5\u6750\u6599\u53CA\u524D\u5E8F\u53D8\u66F4\uFF0C\u786E\u8BA4\u672C\u9636\u6BB5\u5DF2\u529E\u7ED3")),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",onClick:()=>te(null),disabled:!!A||!!u},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!A||F.status==="completed"&&!F.confirmed,type:"submit"},"\u4FDD\u5B58\u529E\u7406\u4FE1\u606F")))),B&&!o.single_form&&e.createElement(wa,{key:B.id,file:B,projectId:o.id,download:(t,C)=>Z("\u4E0B\u8F7D\u539F\u6587\u4EF6",()=>h(t,C)),onClose:()=>_e(null)}))}function Ja({project:a,Field:s,request:r,onSave:p,onDirtyChange:h}){let[d,g]=Q(a.fields),m=De(null),c=De(0),[x,o]=Q(!1),[b,v]=Q(""),[q,N]=Q(null),[D,w]=Q([]),[k,I]=Q("");Ae(()=>()=>{c.current++},[]);let[T,S]=Q({name:a.name,code:a.code,owner:a.owner}),z=_=>_==="project.name"?T.name:_==="project.code"?T.code:d.find(y=>y.key===_)?.value||"";async function u(_){if(!_||x)return;let y=++c.current;o(!0),v(""),I("");try{let U=new FormData;U.append("revision",a.revision),U.append("workbook",_);let X=await r(`/projects/${a.id}/profile/import`,{method:"POST",body:U});if(y!==c.current)return;let E=X.fields.filter(K=>K.value!==z(K.key));if(!E.length){I("Excel \u4E2D\u7684\u57FA\u7840\u4FE1\u606F\u4E0E\u5F53\u524D\u5185\u5BB9\u4E00\u81F4\u3002");return}N(E),w(E.map(K=>K.key))}catch(U){y===c.current&&v(U.message)}finally{y===c.current&&o(!1)}}function J(){let _=Object.fromEntries(q.filter(y=>D.includes(y.key)).map(y=>[y.key,y.value]));g(y=>y.map(U=>Object.hasOwn(_,U.key)?{...U,value:_[U.key]}:U)),S(y=>({...y,name:_["project.name"]??y.name,code:_["project.code"]??y.code})),N(null),I(`\u5DF2\u5E26\u5165 ${D.length} \u9879\u57FA\u7840\u4FE1\u606F\uFF0C\u8BF7\u6838\u5BF9\u540E\u4FDD\u5B58\u3002`)}return Ae(()=>{h(JSON.stringify(d)!==JSON.stringify(a.fields)||T.name!==a.name||T.code!==a.code||T.owner!==a.owner)},[d,T]),e.createElement("form",{className:"df-paper df-project-profile",onSubmit:_=>{_.preventDefault(),p({...T,values:Object.fromEntries(d.map(y=>[y.key,y.value]))})}},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,"\u57FA\u7840\u4FE1\u606F\u586B\u62A5"),e.createElement("p",{className:"df-muted"},"\u5404\u9636\u6BB5\u8868\u5355\u590D\u7528\u8FD9\u91CC\u7684\u8D44\u6599\uFF1B\u9636\u6BB5\u65E5\u671F\u3001\u8BC4\u5BA1\u5206\u6570\u548C\u4ED8\u6B3E\u7ED3\u679C\u5206\u522B\u8BB0\u5F55\u3002")),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",disabled:x,onClick:()=>m.current?.click()},e.createElement(he,{name:"import"}),x?"\u8BFB\u53D6\u4E2D\u2026":"\u5BFC\u5165 Excel"),e.createElement("button",{className:"df-primary",type:"submit",disabled:x},"\u4FDD\u5B58\u57FA\u7840\u4FE1\u606F"))),e.createElement("input",{ref:m,type:"file",accept:".xlsx",hidden:!0,"aria-label":"\u5BFC\u5165\u57FA\u7840\u4FE1\u606F Excel",onChange:_=>{let y=_.target.files?.[0];_.target.value="",u(y)}}),b&&e.createElement("p",{role:"alert",className:"df-alert error"},b),k&&e.createElement("p",{role:"status",className:"df-alert"},k),e.createElement("div",{className:"df-fields"},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u540D\u79F0"),e.createElement("input",{"aria-label":"\u9879\u76EE\u540D\u79F0",required:!0,value:T.name,maxLength:120,onChange:_=>S({...T,name:_.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u7F16\u53F7"),e.createElement("input",{"aria-label":"\u9879\u76EE\u7F16\u53F7",value:T.code,maxLength:100,onChange:_=>S({...T,code:_.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u7ECF\u529E\u4EBA"),e.createElement("input",{"aria-label":"\u7ECF\u529E\u4EBA",value:T.owner,maxLength:100,onChange:_=>S({...T,owner:_.target.value})}))),[...new Set(d.filter(_=>!["project.name","project.code"].includes(_.key)).map(_=>_.group))].map(_=>e.createElement("section",{className:"df-group",key:_},e.createElement("h3",null,_),e.createElement("div",{className:"df-fields"},d.filter(y=>y.group===_&&!["project.name","project.code"].includes(y.key)).map(y=>e.createElement(s,{key:y.key,field:{...y,required:!1},onChange:U=>g(d.map(X=>X.key===y.key?{...X,value:U}:X))}))))),e.createElement("div",{className:"df-actions"},e.createElement("button",{className:"df-primary",type:"submit",disabled:x},"\u4FDD\u5B58\u57FA\u7840\u4FE1\u606F")),q&&e.createElement(Re,{title:"\u5BFC\u5165\u57FA\u7840\u4FE1\u606F",onClose:()=>N(null)},e.createElement("p",{className:"df-muted"},"\u52FE\u9009\u8981\u5E26\u5165\u7684\u57FA\u7840\u4FE1\u606F\u3002\u7A7A\u767D\u9879\u4FDD\u7559\u539F\u5185\u5BB9\uFF0C\u5E94\u7528\u540E\u8BF7\u6838\u5BF9\u5E76\u4FDD\u5B58\u3002"),e.createElement("div",{className:"df-profile-import-list"},q.map(_=>e.createElement("label",{className:"df-profile-import-item",key:_.key},e.createElement("input",{type:"checkbox","aria-label":"\u5BFC\u5165"+_.label,checked:D.includes(_.key),onChange:y=>w(U=>y.target.checked?[...U,_.key]:U.filter(X=>X!==_.key))}),e.createElement("span",null,e.createElement("strong",null,_.label),e.createElement("span",{className:"df-muted"},"\u5F53\u524D\uFF1A",z(_.key)||"\u672A\u586B\u5199"),e.createElement("span",null,"Excel\uFF1A",_.value))))),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",onClick:()=>N(null)},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",type:"button",disabled:!D.length,onClick:J},"\u5E94\u7528\u5230\u57FA\u7840\u4FE1\u606F"))))}var ge=window.QwenPaw.host.React,{useEffect:ka,useRef:Vt,useState:Ya}=ge;function Za({field:a,timelineLink:s}){let[r,p]=Ya(!1),h=Vt(null),d=Vt(null),g=Vt(null),m=()=>{window.clearTimeout(g.current),p(!0)};ka(()=>()=>window.clearTimeout(g.current),[]);let c="df-help-"+a.key;return ka(()=>{if(!r)return;let x=b=>{h.current?.contains(b.target)||p(!1)},o=b=>{if(b.key!=="Escape")return;b.preventDefault(),b.stopPropagation();let v=h.current?.contains(document.activeElement);p(!1),v&&d.current?.focus()};return document.addEventListener("pointerdown",x),document.addEventListener("keydown",o,!0),()=>{document.removeEventListener("pointerdown",x),document.removeEventListener("keydown",o,!0)}},[r]),ge.createElement("span",{className:"df-field-help",ref:h,onMouseEnter:m,onMouseLeave:x=>{x.relatedTarget?.nodeType&&x.currentTarget.contains(x.relatedTarget)||h.current?.contains(document.activeElement)||(g.current=window.setTimeout(()=>p(!1),120))},onBlur:x=>{x.relatedTarget&&!x.currentTarget.contains(x.relatedTarget)&&p(!1)}},ge.createElement("button",{type:"button",className:"df-field-help-trigger","aria-label":a.label+"\uFF1A\u586B\u5199\u8BF4\u660E","aria-expanded":r,"aria-controls":r?c:void 0,"aria-describedby":r?c:void 0,ref:d,onFocus:m,onClick:m},ge.createElement("svg",{viewBox:"0 0 20 20",fill:"none","aria-hidden":"true"},ge.createElement("circle",{cx:"10",cy:"10",r:"7.5"}),ge.createElement("path",{d:"M7.8 7.6a2.3 2.3 0 0 1 4.4.9c0 1.6-2.2 1.8-2.2 3.2"}),ge.createElement("circle",{cx:"10",cy:"14",r:".65",fill:"currentColor",stroke:"none"}))),r&&ge.createElement("span",{className:"df-field-help-content",id:c,role:s?void 0:"tooltip",onMouseEnter:m},a.help&&ge.createElement("span",null,a.help),s&&ge.createElement("span",{className:"df-field-help-timeline"},"\u6B64\u9879\u4E5F\u53EF\u4EE5\u5728",ge.createElement("a",{href:s.href,onClick:x=>{x.preventDefault(),p(!1),s.open()}},"\u65F6\u95F4\u8F74"),"\u586B\u5199\u3002")))}function $t({field:a,inputId:s,timelineLink:r}){return ge.createElement("div",{className:"df-field-label"},ge.createElement(s?"label":"span",{htmlFor:s},a.label,a.required&&ge.createElement("span",{className:"df-required",title:"\u5FC5\u586B","aria-hidden":"true"},"*")),(a.help||r)&&ge.createElement(Za,{field:a,timelineLink:r}))}var Ca=window.QwenPaw.host.React,{useRef:Ra,useLayoutEffect:ei}=Ca;function Na(a){function s(r){return r.nodeType===3?r.textContent.replace(/\u00a0/g," "):r.nodeType!==1?"":r.dataset.reference?"\u3010"+r.dataset.reference+"\u3011":r.tagName==="BR"?`
`:[...r.childNodes].map((p,h)=>(p.nodeType===1&&/^(DIV|P)$/.test(p.tagName)&&h>0?`
`:"")+s(p)).join("")}return s(a)}function Ht({field:a,inputId:s,onChange:r}){let p=Ra(null);ei(()=>{let d=p.current,g=[...d.querySelectorAll("[data-reference]")],m=a.linked_parts.filter(x=>typeof x=="object");if(Na(d)===a.linked_template&&g.length===m.length&&g.every((x,o)=>x.textContent==="\u3010"+m[o].value+"\u3011"))return;let c=document.createDocumentFragment();for(let x of a.linked_parts)if(typeof x=="string")c.append(document.createTextNode(x));else{let o=document.createElement("span");o.className="df-reference-token",o.dataset.reference=x.field,o.setAttribute("contenteditable","false"),o.title=x.label+" \xB7 \u81EA\u52A8\u5173\u8054",o.setAttribute("aria-label",x.label+"\uFF1A"+x.value),o.textContent="\u3010"+x.value+"\u3011",c.append(o)}d.replaceChildren(c)},[a.linked_template,a.linked_parts]);function h(){let d=Na(p.current);r(a.value,d)}return Ca.createElement("div",{id:s,ref:p,className:"df-linked-editor",role:"textbox","aria-label":a.label,"aria-multiline":"true","aria-required":a.required||void 0,contentEditable:!0,suppressContentEditableWarning:!0,onInput:h,onPaste:d=>{d.preventDefault();let g=d.clipboardData.getData("text/plain"),m=window.getSelection();if(!m?.rangeCount||!p.current.contains(m.anchorNode))return;let c=m.getRangeAt(0);c.deleteContents();let x=document.createTextNode(g);c.insertNode(x),c.setStartAfter(x),c.collapse(!0),m.removeAllRanges(),m.addRange(c),h()}})}var W=window.QwenPaw.host.React,{useId:Kt}=W,Et=a=>"df-timeline-"+a;function Xt({title:a,state:s,children:r}){return W.createElement("li",{className:"df-timeline-step","data-state":s},W.createElement("h3",null,a),r)}function _a({stage:a,title:s,onOpen:r}){let p=a?.approval_date;return W.createElement(Xt,{title:s,state:p?"set":"pending"},W.createElement("div",{className:"df-timeline-approval"},p?W.createElement("time",{dateTime:p},p):W.createElement("span",{className:"df-muted"},"\u5C1A\u672A\u53D6\u5F97\u5BA1\u6279\u65E5\u671F"),a&&r&&W.createElement("button",{type:"button",onClick:()=>r(a.id),"aria-label":`\u67E5\u770B${s}\u8D44\u6599`},"\u5BA1\u6279\u8D44\u6599")))}function At({id:a,label:s,type:r="datetime-local",value:p,onChange:h,issueId:d,readOnly:g}){return W.createElement("label",{className:"df-field"},W.createElement("span",null,s),W.createElement("input",{id:a,type:r,step:r==="datetime-local"?"any":void 0,value:p,readOnly:g,"aria-invalid":!!d||void 0,"aria-describedby":d,onChange:m=>h(m.target.value)}))}function Gt({id:a,details:s}){return s.length>0&&W.createElement("ul",{className:"df-timeline-issues",id:a},s.map(r=>W.createElement("li",{key:r},r)))}function Jt(a,s){if(a.value===s?.value&&s.start)return s;let[r,p=""]=a.value.split(" ~ "),h=/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2}(?:\.\d{1,6})?)?$/,d=g=>h.test(g)?g.replace(" ","T"):"";return{start:a.kind==="date"&&/^\d{4}-\d{2}-\d{2}$/.test(r)?r:d(r),end:d(p)}}function ti({title:a,binding:s,field:r,range:p,issues:h,onEdit:d}){let g=Kt();if(!r)return null;let{start:m,end:c}=Jt(r,s),x=[...new Set(h.filter(N=>N.field===r.key).map(N=>N.label&&N.detail.startsWith("\u65F6\u95F4\u987A\u5E8F\u51B2\u7A81")?`${N.label}\u3002${N.detail}`:N.detail))],o=p&&!["date","datetime-local"].includes(r.kind),b=a.replace(/时间$/,""),v=x.length?g:void 0,q=(N,D)=>d(r.key,D?`${N} ~ ${D}`:N);return W.createElement(Xt,{title:a,state:x.length?"error":m?"set":"pending"},W.createElement("div",{className:"df-timeline-controls"},W.createElement(At,{id:Et(r.key),label:o?`${b}\u5F00\u59CB\u65F6\u95F4`:r.label,type:r.kind==="date"?"date":"datetime-local",value:m,issueId:v,readOnly:r.read_only,onChange:N=>q(N,o?c:"")}),o&&W.createElement(At,{label:`${b}\u7ED3\u675F\u65F6\u95F4\uFF08\u53EF\u9009\uFF09`,value:c,issueId:v,readOnly:r.read_only,onChange:N=>q(m,N)})),r.value&&!m&&!c&&W.createElement("p",{className:"df-muted"},"\u5F53\u524D\u586B\u5199\u503C ",r.value),W.createElement(Gt,{id:g,details:x}))}function ai({recipient:a,index:s,approvalDate:r,issues:p,onEdit:h}){let d=Kt(),g=Kt(),m=a.start.replace(" ","T"),c=a.end.replace(" ","T"),x=v=>new Set(p.filter(q=>q.field===`recipient-${s}-${v}`).map(q=>q.detail)),o=x("start"),b=x("end");return r&&m&&m.slice(0,10)<=r&&o.add(`\u9886\u53D6\u5F00\u59CB\u65E5\u671F\u5FC5\u987B\u665A\u4E8E\u9009\u5546\u8BBA\u8BC1\u5BA1\u6279\u65E5\u671F\uFF08${r}\uFF09\u3002`),W.createElement("li",{className:"df-timeline-recipient"},W.createElement("strong",null,a.name||`\u7B2C ${s+1} \u5BB6\u5355\u4F4D`),W.createElement("div",{className:"df-timeline-controls"},W.createElement("div",null,W.createElement(At,{id:Et(`recipient-${s}-start`),label:`\u7B2C${s+1}\u5BB6\u9886\u53D6\u5F00\u59CB\u65F6\u95F4`,value:m,issueId:o.size?d:void 0,onChange:v=>h(s,"start",v)}),W.createElement(Gt,{id:d,details:[...o]})),W.createElement("div",null,W.createElement(At,{id:Et(`recipient-${s}-end`),label:`\u7B2C${s+1}\u5BB6\u9886\u53D6\u7ED3\u675F\u65F6\u95F4`,value:c,issueId:b.size?g:void 0,onChange:v=>h(s,"end",v)}),W.createElement(Gt,{id:g,details:[...b]}))))}function Yt({project:a,draft:s,times:r,issues:p,onEdit:h,onEditRecipient:d,onFollowDispatch:g,onOpenRecipients:m,onOpenApproval:c}){let x=new Map(s.fields.map(w=>[w.key,w])),o=w=>a.stages.find(k=>k.id===w),b=o("selection"),v=b?.status==="completed"?b.approval_date:"",q=p.filter(w=>w.status==="error"),N=(w,k,I=!1)=>W.createElement(ti,{title:k,binding:r[w],field:x.get(r[w]?.key),issues:q,range:I,onEdit:h}),D=q.some(w=>/^recipient-\d+-(start|end)$/.test(w.field))||!!(v&&s.recipients.some(w=>w.start&&w.start.slice(0,10)<=v));return W.createElement(W.Fragment,null,W.createElement("h2",null,"\u5546\u52A1\u8C08\u5224\u65F6\u95F4\u8F74"),W.createElement("ol",{className:"df-negotiation-timeline"},W.createElement(_a,{stage:o("plan"),title:"\u8BA1\u5212\u5BA1\u6279",onOpen:c}),W.createElement(_a,{stage:b,title:"\u8BBA\u8BC1\u610F\u89C1\u5BA1\u6279",onOpen:c}),N("issue","\u6587\u4EF6\u843D\u6B3E"),N("dispatch","\u9080\u8BF7\u51FD\u53D1\u653E\u65F6\u95F4",!0),W.createElement(Xt,{title:"\u9080\u8BF7\u51FD\u9886\u53D6",state:D?"error":s.recipients.some(w=>w.start)?"set":"pending"},g&&W.createElement("button",{type:"button",onClick:g},"\u5168\u90E8\u8DDF\u968F\u53D1\u653E\u65F6\u95F4"),s.recipients.length?W.createElement("ul",{className:"df-timeline-recipients"},s.recipients.map((w,k)=>W.createElement(ai,{key:k,recipient:w,index:k,approvalDate:v,issues:q,onEdit:d}))):W.createElement("button",{type:"button",onClick:m},"\u8BBE\u7F6E\u53D7\u9080\u5355\u4F4D")),N("qa","\u5546\u52A1\u7B54\u7591",!0),N("response","\u54CD\u5E94\u6587\u4EF6\u63D0\u4EA4\u622A\u6B62"),N("negotiation","\u5546\u52A1\u8C08\u5224",!0)))}function za(a){let s=Object.fromEntries(a.map(r=>[r.key,r.value]));return a.map(r=>{if(r.linked_template===void 0||!r.linked_variables)return r;let p={...r.linked_variables,...s},h=[],d=0;for(let m of r.linked_template.matchAll(/【([a-z][a-z0-9_.]*(?:\|[0-6])?)】/g)){let[c,x]=m[1].split("|");if(!(c in r.linked_variables))continue;h.push(r.linked_template.slice(d,m.index));let o=r.linked_parts.find(v=>typeof v=="object"&&v.field.split("|")[0]===c),b=p[c]?.trim();if(x&&b&&/^-?\d+(?:\.\d+)?$/.test(b)){let[v,q=""]=b.split(".");b=v+"."+q.padEnd(Number(x),"0")}h.push({field:m[1],label:o?.label||c,value:b||`\uFF08${o?.label||"\u5F15\u7528\u8D44\u6599"}\u5F85\u586B\u5199\uFF09`}),d=m.index+m[0].length}h.push(r.linked_template.slice(d));let g=h.map(m=>typeof m=="string"?m:m.value).join("");return{...r,linked_parts:h,linked_rendered:g,value:g}})}var Pe=window.QwenPaw,i=Pe.host.React,{useState:le,useEffect:ot,useLayoutEffect:Ea,useRef:gt}=i,Rt="/document-forms";function Zt(a,s,r){return{artifact:{id:s.id+r.name,title:r.name,source:"generated",extension:r.name.endsWith(".xlsx")?"xlsx":"docx",mimeType:r.name.endsWith(".xlsx")?"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":"application/vnd.openxmlformats-officedocument.wordprocessingml.document",binaryUrl:r.preview_url,printUrl:Rt+`/cases/${a}/print/${s.id}/${encodeURIComponent(r.name)}`,agentId:Pe.host.getSelectedAgentId?.(),createdAt:Date.parse(s.created_at)},reference:{case_id:a,generation_id:s.id,name:r.name}}}async function Ne(a,s){let r=await Pe.host.fetch(Rt+a,s);if(!r.ok){let p=await r.json().catch(()=>({})),h=new Error(typeof p.detail?.message=="string"?p.detail.message:typeof p.detail=="string"?p.detail:Array.isArray(p.detail)?p.detail.map(d=>`${d.loc?.slice(1).join(".")||"\u8D44\u6599"}\uFF1A${d.msg}`).join("\uFF1B"):`\u64CD\u4F5C\u672A\u5B8C\u6210\uFF08${r.status}\uFF09\uFF0C\u8BF7\u68C0\u67E5\u586B\u5199\u5185\u5BB9`);throw h.issues=p.detail?.issues,h}return r.json()}async function dt(a,s){let r=await Pe.host.fetch(Rt+a);if(!r.ok)throw new Error("\u6587\u4EF6\u4E0B\u8F7D\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5");let p=URL.createObjectURL(await r.blob()),h=document.createElement("a");h.href=p,h.download=s,document.body.appendChild(h);try{h.click()}finally{h.remove(),setTimeout(()=>URL.revokeObjectURL(p),1e3)}}var He=a=>({method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)}),bt=a=>new Date(a).toLocaleString("zh-CN",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}),ii=a=>a.kind==="textarea"||a.value.length>100||a.value.includes(`
`)||a.label.includes("\u6574\u6BB5"),ni=a=>/^(research\.contents|deliverables\.|metrics\.|milestones\.)/.test(a.key)||/主要研究内容|预期成果|考核指标|进度安排/.test(a.label),Ft=a=>a?.match(/^\d{4}-\d{2}-\d{2}(?=[T ]|$)/)?.[0];function ja(a,s){if(!a||a.stage_id&&a.stage_id!=="negotiation")return;let r=a.fields.find(g=>g.key==="events.invitation_time");if(!r)return;let{start:p,end:h}=Jt(r,s?.dispatch),d=g=>/^\d{4}-\d{2}-\d{2}$/.test(g)?g+"T00:00":g.replace(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}):00$/,"$1");return{start:d(p),end:d(h)}}function Pt(a,s,r){let p=a.map(h=>({...h}));for(let[h,d]of p.entries()){let g=typeof d.follow_end!="boolean"&&!d.end;for(let b of["start","end"]){let v="follow_"+b;d[v]=!!(r||h)&&(typeof d[v]=="boolean"?d[v]:!d[b]),d[b]=(d[v]?(r||p[0])[b]:d[b])||""}let m=Ft(d.start),c=d.end.match(/[T ](\d{2}:\d{2}(?::\d{2}(?:\.\d{1,6})?)?)$/)?.[1];if(r&&d.follow_end){m?(!d.follow_start||!d.end)&&(d.end=m+"T"+(c||"17:30")):d.end="";continue}let x=s?.[h]&&d.start!==s[h].start&&(!r||!d.follow_start),o=d.follow_end&&d.end&&m!==Ft(p[0].start);m&&(x||o||g&&!d.end)&&(d.end=m+"T"+(c||"17:30"))}return p}function ri({field:a,onChange:s}){let r=["","",""],p=0;for(let h of a.value.split(/\r?\n/)){let d=h.match(/^\s*([1-3])[.、．)）]\s?(.*)$/);d?r[Number(d[1])-1]=d[2]:p<3&&(r[p++]=h)}return i.createElement("div",{className:"df-plan-partners",id:"df-plan.partners",role:"group","aria-label":a.label},i.createElement($t,{field:a}),r.map((h,d)=>i.createElement("label",{className:"df-field",key:d},i.createElement("span",null,"\u5355\u4F4D",d+1),i.createElement("input",{"aria-label":`\u5355\u4F4D${d+1}`,type:"text",value:h,onChange:g=>{let m=r.map((c,x)=>x===d?g.target.value:c);s(m.some(c=>c.trim())?m.map((c,x)=>`${x+1}. ${c}`).join(`
`):"")}}))))}function $a({title:a,issues:s,onFix:r}){return s.length?i.createElement("section",{className:"df-paper","aria-label":a},i.createElement("h3",null,a),i.createElement("div",{className:"df-checks","aria-live":"polite"},s.map(({label:p,detail:h,status:d,field:g},m)=>i.createElement("div",{key:m,className:"df-check "+d},i.createElement("span",null,d==="missing"?"\u5F85\u8865\u5145":"\u51B2\u7A81"),i.createElement("div",null,i.createElement("b",null,p),i.createElement("p",null,h)),g&&i.createElement("button",{onClick:()=>r(g)},"\u4FEE\u6539"))))):null}function Pa({field:a,displayValue:s,onChange:r,issue:p,timelineLink:h}){let d="df-input-"+a.key,g=p?{"aria-invalid":!0,"aria-describedby":d+"-error"}:{},m=a.key!=="plan.notes"&&ii(a),c=a.linked_template!==void 0,x=ni(a)||c,o=["date","datetime-local"].includes(a.kind)?a.value:s??a.value,b=gt(null);return Ea(()=>{if(!b.current)return;let v=b.current.scrollTop;b.current.style.height="auto",b.current.style.height=Math.max(x?104:192,b.current.scrollHeight)+"px",b.current.scrollTop=v},[o,m,x]),a.key==="plan.partners"?i.createElement(ri,{field:a,onChange:r}):i.createElement("div",{className:"df-field"+(m?" df-field-paragraph":"")+(x?" df-field-compact":""),id:"df-"+a.key},i.createElement($t,{field:a,inputId:d,timelineLink:h}),c?i.createElement(Ht,{field:a,inputId:d,onChange:r}):a.options?i.createElement("select",{id:d,"aria-label":a.label,"aria-required":a.required||void 0,...g,value:o,onChange:v=>r(v.target.value)},i.createElement("option",{value:""},"\u8BF7\u9009\u62E9"),o&&!a.options.includes(o)&&i.createElement("option",{value:o,disabled:!0},o,"\uFF08\u8BF7\u91CD\u65B0\u9009\u62E9\uFF09"),a.options.map(v=>i.createElement("option",{key:v,value:v},v))):m?i.createElement("textarea",{id:d,ref:b,"aria-label":a.label,"aria-required":a.required||void 0,...g,rows:x?3:8,value:o,onChange:v=>r(v.target.value)}):i.createElement("input",{id:d,"aria-label":a.label,"aria-required":a.required||void 0,...g,type:a.key==="plan.notes"?"text":a.kind,readOnly:!!a.read_only,step:a.kind==="number"?"any":void 0,value:o,onChange:v=>r(v.target.value)}),p&&i.createElement("small",{id:d+"-error",className:"df-field-validation"},p.detail))}function oi({fields:a,onChange:s,compact:r=!1}){let p=a.filter(d=>/^selection\.member\d+_name$/.test(d.key));if(!p.length)return null;let h={unit:["\u5730\u4E0B\u7A7A\u95F4\u5229\u7528\u7814\u7A76\u6240",...a.filter(d=>["contact.department","project.executing_unit"].includes(d.key)).map(d=>d.value)],title:["\u526F\u6240\u957F/\u9AD8\u5DE5","\u4F01\u4E1A\u9AD8\u7EA7\u4E13\u5BB6/\u9AD8\u5DE5","\u90E8\u95E8\u8D1F\u8D23\u4EBA/\u9AD8\u5DE5","\u4E00\u7EA7\u5DE5\u7A0B\u5E08/\u9AD8\u5DE5","\u9AD8\u7EA7\u5DE5\u7A0B\u5E08","\u5DE5\u7A0B\u5E08","\u6559\u6388","\u526F\u6559\u6388"],category:["\u4E3B\u4EFB","\u526F\u4E3B\u4EFB","\u79D1\u59D4\u4F1A\u6210\u5458","\u4E13\u5BB6","\u7EC4\u957F","\u6210\u5458"]};return i.createElement("section",{className:"df-group df-selection-members","aria-label":"\u8BBA\u8BC1\u6210\u5458"},!r&&i.createElement("h3",null,"\u8BBA\u8BC1\u6210\u5458"),!r&&i.createElement("p",{className:"df-muted"},"\u6BCF\u4EBA\u4E00\u884C\u3002\u5355\u4F4D\u3001\u804C\u52A1/\u804C\u79F0\u548C\u7C7B\u522B\u53EF\u9009\u62E9\uFF0C\u4E5F\u53EF\u76F4\u63A5\u8F93\u5165\u3002"),i.createElement("div",{className:"df-member-scroll"},i.createElement("table",{className:"df-member-table"},i.createElement("thead",null,i.createElement("tr",null,i.createElement("th",{scope:"col"},"\u5E8F\u53F7"),i.createElement("th",{scope:"col"},"\u59D3\u540D"),i.createElement("th",{scope:"col"},"\u5355\u4F4D"),i.createElement("th",{scope:"col"},"\u804C\u52A1/\u804C\u79F0"),i.createElement("th",{scope:"col"},"\u7C7B\u522B"))),i.createElement("tbody",null,p.map((d,g)=>{let m=d.key.replace(/name$/,"");return i.createElement("tr",{key:d.key},i.createElement("th",{scope:"row"},String(g+1).padStart(2,"0")),["name","unit","title","category"].map(c=>{let x=a.find(v=>v.key===m+c);if(!x)return i.createElement("td",{key:c});let o=c==="name"?[]:[...new Set([...h[c],...a.filter(v=>new RegExp(`^selection\\.member\\d+_${c}$`).test(v.key)).map(v=>v.value)].filter(Boolean))],b="df-options-"+x.key;return i.createElement("td",{key:c,id:"df-"+x.key},i.createElement("input",{"aria-label":x.label,value:x.value,list:o.length?b:void 0,autoComplete:"off",onChange:v=>s(x.key,v.target.value)}),o.length>0&&i.createElement("datalist",{id:b},o.map(v=>i.createElement("option",{value:v,key:v}))))}))})))))}function di({project:a,workflowStage:s,initialCaseId:r,initialView:p,editRequest:h=0,initialDraft:d,onBack:g,onChanged:m,onDirtyChange:c,onBusyChange:x,onViewChange:o,docked:b=!1,onPreview:v,nodeTab:q,selectedOutput:N,onAskAboutOutput:D,onStageStatus:w,onEditBasics:k,toolbarTarget:I,onShowForm:T,onDownloadStageMaterials:S,onOpenApproval:z}){let[u,J]=le(null),[_,y]=le(""),[U,X]=le(null),[E,K]=le([]),[A,Y]=le("import"),[G,de]=le(!1),[Fe,Ce]=le([]),[Le,te]=le({}),[F,re]=le({}),[Ke,Ge]=le([]),[Te,et]=le([]),[B,_e]=le(""),[xe,st]=le(""),[ht,pe]=le(""),[ze,tt]=le(null),[xt,Tt]=le(null),at=gt(null),vt=gt(null),Xe=gt(0),ee=gt(!0),lt=gt(null),ve=Pe.host.useTheme?.()||"light",oe=()=>m?.()||Promise.resolve(),fe=b&&I&&Pe.host.ReactDOM?.createPortal;ot(()=>(ee.current=!0,(d?Promise.resolve(d):Ne("/cases/"+r)).then(n=>{ee.current&&(je(n),Y(p==="files"&&n.generations.length?"files":"edit"),p==="files"&&n.generations.length&&tt({file:n.generations[0].files[0],generation:n.generations[0]}))}).catch(n=>ee.current&&st(n.message)),(Pe.workspace?.loadPreview?Pe.workspace.loadPreview():Promise.resolve(Oe)).then(n=>{ee.current&&Tt(()=>n)}).catch(n=>{ee.current&&Tt(()=>Oe)}),()=>{ee.current=!1,Xe.current++}),[]),ot(()=>{h&&Y("edit")},[h]),ot(()=>{c?.(G)},[G]),ot(()=>{x?.(B)},[B]),ot(()=>{o?.()},[A]),ot(()=>{let n=l=>{G&&(l.preventDefault(),l.returnValue="")};return window.addEventListener("beforeunload",n),()=>window.removeEventListener("beforeunload",n)},[G]);async function ae(n,l){if(B)return;let f=++Xe.current;_e(n),st(""),pe("");try{await l()}catch(O){ee.current&&f===Xe.current&&(st(O.message),q!=="generate"&&T?.())}finally{ee.current&&f===Xe.current&&_e("")}}function je(n,{retainAgent:l=!1}={}){ee.current&&(J({...n,recipients:Pt(n.recipients,void 0,ja(n,n.timeline_times)),presentation_sources:Object.fromEntries(n.fields.map(f=>[f.key,f.value]))}),de(!1),te(n.timeline_times||{}),Ce([]),re({}),Ge([]),l||et([]))}function $e(n){J({...n,fields:za(n.fields)}),de(!0),b&&Y("edit"),Ce([]),Ge([]),et([]),pe("")}function pt(n,l,f,O=!1){let se=ue.map((Je,Nt)=>Nt===n?{...Je,[l]:f,...l!=="name"?{["follow_"+l]:O}:{}}:Je);$e({...u,recipients:Pt(se,l==="start"?ue:void 0,ie)})}function it(){$e({...u,recipients:ue.map(n=>({...n,follow_start:!0,follow_end:!0}))})}function St(n,l,f){$e({...u,fields:u.fields.map(O=>O.key===n?{...O,value:l,...f!==void 0?{linked_template:f}:{}}:O)})}function L(){return{revision:u.revision,name:u.name.trim()||"\u672A\u547D\u540D\u586B\u62A5",values:Object.fromEntries(u.fields.map(n=>[n.key,n.value])),recipients:ue,opinion_templates:Object.fromEntries(u.fields.filter(n=>n.linked_template!==void 0).map(n=>[n.key,n.linked_template]))}}async function be(){if(!G)return u;let n=await Ne("/cases/"+u.id,{...He(L()),method:"PUT"});return je(n,{retainAgent:!0}),n}function ft(){return!G||window.confirm("\u5F53\u524D\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\u3002\u79BB\u5F00\u6B64\u8BB0\u5F55\uFF1F")}let wt=u?.stage_id==="plan"&&u?.plan_schema===1,It=u?.stage_id==="selection"&&u?.selection_schema===1,ce=u?.stage_id==="contract",me=(s?.id||u?.stage_id)==="negotiation",Me=me?a?.stages?.find(n=>n.id==="selection"&&n.status==="completed"):void 0,we=Ft(Me?.approval_date),Z=n=>ua(n,me?"negotiation":void 0),nt=me?Qe[2]:"recipients",Se=b&&me,ie=ja(u,Le),ue=Pt(u?.recipients||[],void 0,ie),qe=wt||It||ce,Dt=qe?"\u6587\u4E66\u6A21\u677F":"Word \u6A21\u677F",ye=(u?.fields||[]).filter(n=>!n.hidden&&(!qe||n.scope!=="shared")),yt=[...new Set([...me?Qe:[],...ye.map(Z)])];if(It){let n=["\u8BBA\u8BC1\u5B89\u6392","\u5019\u9009\u5355\u4F4D","\u8BBA\u8BC1\u6210\u5458","\u8BBA\u8BC1\u610F\u89C1","\u975E\u62DB\u6807\u65B9\u6848"];yt.sort((l,f)=>{let O=se=>{let Je=n.indexOf(se);return Je<0?n.length:Je};return O(l)-O(f)})}let kt=[...yt.map(n=>({id:n,label:n})),...Se?[{id:"timeline",label:"\u65F6\u95F4\u8F74",align:"end"}]:[],...!qe&&!me?[{id:"recipients",label:"\u53D7\u9080\u5355\u4F4D"}]:[],...b?[]:[{id:"generate",label:"\u6A21\u677F\u4E0E\u751F\u6210",align:"end"}]],Ee=kt.some(n=>n.id===_)?_:kt[0]?.id;Ea(()=>{if(Ee!=="timeline"||!lt.current)return;let n=document.getElementById(lt.current);lt.current=null,n?.scrollIntoView?.({block:"center"}),n?.focus({preventScroll:!0})},[Ee]);let t=u?.templates||[],C=t.reduce((n,l)=>n+(l.per_recipient?u.recipients.length:1),0),j=(n,l)=>(n.stage_id||l.original_stage_id||l.stage_id)===s.id,R=(u?.generations||[]).filter(n=>!b||j(n,u)),ne=R[0],ke=b?a.forms.filter(n=>n.case_id!==(u?.id||a.form_id)):[],Ue=[...R.map(n=>({caseId:u.id,batch:n})),...ke.flatMap(n=>n.generations.filter(l=>j(l,n)).map(l=>({caseId:n.case_id,batch:l})))];ot(()=>{if(!u||B||A!=="edit"||b&&q!=="form")return;let n=new AbortController,l=setTimeout(async()=>{try{let f=await Ne("/cases/"+u.id+"/validate",{...He(L()),signal:n.signal});n.signal.aborted||(Ce(f.issues),re(f.derived_values||{}),f.timeline_times&&te(f.timeline_times))}catch{n.signal.aborted||Ce([])}},350);return()=>{clearTimeout(l),n.abort()}},[u,B,A,q,b,we]);function ea(n){return n.map(l=>({...l,field:u.fields.some(f=>f.key===l.field)||/^recipient-\d+(?:-start|-end)?$/.test(l.field)?l.field:""}))}async function Ta(n){!n||!ft()||await ae("\u8BFB\u53D6 Excel",async()=>{let l=new FormData;l.append("workbook",n),l.append("revision",a.revision),l.append("stage_id",s.id);let f=await Ne(`/projects/${a.id}/${a.single_form?"form":"cases"}/import`,{method:"POST",body:l});je(f),tt(null),y(""),Y("edit"),T?.(),await oe(),pe(f.templates.length?"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\uFF0C\u5E76\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002":f.template_notice||"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\u3002\u8BF7\u6DFB\u52A0\u5BF9\u5E94\u7684 Word \u6A21\u677F\u3002")})}async function Sa(n){n=Array.from(n),n.length&&await ae("\u8BFB\u53D6 Word \u6A21\u677F",async()=>{let l=await be(),f=new FormData;f.append("revision",String(l.revision)),Array.from(n).forEach(O=>f.append("files",O)),je(await Ne("/cases/"+l.id+"/templates",{method:"POST",body:f})),await oe(),pe("Word \u6A21\u677F\u5DF2\u6DFB\u52A0\uFF0C\u751F\u6210\u65F6\u4F1A\u4FDD\u7559\u539F\u6709\u6392\u7248\u3002")})}async function Ia(){await ae("\u667A\u80FD\u4F53\u6838\u67E5",async()=>{et([]);let n=await Ne("/cases/"+u.id+"/agent-check",He(L()));ee.current&&(et(n.issues),n.issues.length||pe("\u667A\u80FD\u4F53\u672A\u53D1\u73B0\u51B2\u7A81\u3002"))})}async function Da(){await ae("\u751F\u6210\u6587\u4E66",async()=>{Ge([]);let n=await be(),l;try{l=await Ne("/cases/"+n.id+"/generate",He({revision:n.revision}))}catch(se){if(!Array.isArray(se.issues))throw se;ee.current&&Ge(se.issues);return}if(!ee.current)return;je(l,{retainAgent:!0});let f=l.generations[0],O=f.files[0];b?(Y("edit"),O&&v(Zt(l.id,f,O))):(Y("files"),tt({file:O,generation:f})),await oe()})}function ta(n){let l=u.fields.find(f=>f.key===n);if(l?.derived_from){let f=u.fields.find(O=>O.key===l.derived_from);f&&(l=f,n=f.key)}if(l?.scope==="shared"&&qe&&k){k();return}y(l?Z(l):n.startsWith("recipient-")?nt:"generate"),Y("edit"),(l||n.startsWith("recipient-"))&&T?.(),requestAnimationFrame(()=>{let f=document.getElementById("df-"+n);f?.scrollIntoView?.({behavior:"smooth",block:"center"});let O="input,textarea,select";(f?.matches(O)?f:f?.querySelector(O))?.focus()})}function aa(n){let l=Et(n);return{href:"#"+l,open(){lt.current=l,y("timeline")}}}let ia=(n,l,f)=>`/cases/${n}/outputs/${l.id}/${encodeURIComponent(f)}`;function La(n,l){return ae("\u6B63\u5728\u4E0B\u8F7D\u538B\u7F29\u5305",async()=>{await dt(ia(n,l,"\u5168\u90E8\u6587\u4E66.zip"),l.bundle_name||(b?a.name:u.name)+"_\u6587\u4E66.zip"),pe(`\u5DF2\u5F00\u59CB\u4E0B\u8F7D\u8BE5\u6279\u6B21\u7684 ${l.files.length} \u4EFD\u6587\u4E66\u538B\u7F29\u5305\u3002`)})}let ct=ze?.file?Zt(u.id,ze.generation,ze.file).artifact:null;async function Ma(){await ae("\u5BFC\u51FA Excel",async()=>{let n=await be();await dt("/cases/"+n.id+"/excel",(n.fields.find(l=>l.key==="project.name")?.value||n.name).replace(/[<>:"/\\|?*\x00-\x1f]/g,"_").slice(0,80)+"_\u586B\u5199\u6570\u636E.xlsx")})}let na=i.createElement("section",{className:"df-paper df-template-panel","aria-label":Dt},i.createElement("div",{className:"df-section-head"},!fe&&i.createElement("h2",null,Dt),i.createElement("div",{className:"df-template-actions"},t.length>0?i.createElement("button",{onClick:()=>ae("\u4FDD\u5B58\u9ED8\u8BA4\u6A21\u677F",async()=>{let n=await be();await Ne(`/cases/${n.id}/defaults`,He({revision:n.revision})),pe(s.id==="negotiation"?"\u5DF2\u8BBE\u4E3A\u672C\u673A\u9ED8\u8BA4\u6A21\u677F\uFF0C\u4EE5\u540E\u65B0\u5EFA\u586B\u62A5\u4F1A\u81EA\u52A8\u8F7D\u5165\u3002":"\u5DF2\u8BBE\u4E3A\u672C\u9636\u6BB5\u9ED8\u8BA4\u6A21\u677F\uFF0C\u4EE5\u540E\u65B0\u5EFA\u8BE5\u9636\u6BB5\u8868\u5355\u4F1A\u81EA\u52A8\u8F7D\u5165\u3002")})},s.id==="negotiation"?"\u8BBE\u4E3A\u9ED8\u8BA4\u6A21\u677F":"\u8BBE\u4E3A\u672C\u9636\u6BB5\u9ED8\u8BA4\u6A21\u677F"):i.createElement("button",{onClick:()=>ae("\u8F7D\u5165\u9ED8\u8BA4\u6A21\u677F",async()=>{let n=await be();je(await Ne(`/cases/${n.id}/defaults/apply`,He({revision:n.revision}))),pe("\u5DF2\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002")})},"\u4F7F\u7528\u9ED8\u8BA4\u6A21\u677F"),!fe&&i.createElement("button",{onClick:()=>vt.current.click()},"\uFF0B \u6DFB\u52A0"))),!fe&&!t.length&&i.createElement("p",{className:"df-muted"},"\u6DFB\u52A0\u4E0E\u4F60\u7684\u53D8\u91CF\u8868\u5BF9\u5E94\u7684 .docx \u6216 .xlsx \u6A21\u677F\u3002"),t.map(n=>i.createElement("div",{className:"df-template",key:n.id},i.createElement("b",null,n.name),n.from_builtin&&i.createElement("small",null,"\u5E94\u7528\u81EA\u5E26\u6A21\u677F"),i.createElement("span",null,n.per_recipient?"\u6309\u53D7\u9080\u5355\u4F4D\u5206\u522B\u751F\u6210":"\u5171\u7528\u6587\u4EF6 \xB7 \u751F\u6210\u4E00\u4EFD"),n.print_copies>1&&i.createElement("small",null,"\u5EFA\u8BAE\u6253\u5370 ",n.print_copies," \u4EFD \xB7 ",n.print_note),i.createElement("button",{"aria-label":"\u79FB\u9664\u6A21\u677F"+n.name,onClick:()=>ae("\u79FB\u9664\u6A21\u677F",async()=>{let l=await be();je(await Ne(`/cases/${l.id}/templates/${n.id}?revision=${l.revision}`,{method:"DELETE"}))})},"\u79FB\u9664")))),ra=u&&!qe&&i.createElement("section",{className:me?"df-recipient-section":"df-paper",role:me?void 0:"tabpanel",id:"df-form-panel-recipients","aria-labelledby":`df-form-tab-${nt}`,hidden:Ee!==nt},i.createElement("div",{className:"df-section-head"},i.createElement("div",null,i.createElement("h2",null,"\u53D7\u9080\u5355\u4F4D ",i.createElement("span",{className:"df-count"},u.recipients.length)),i.createElement("p",null,"\u6309\u5355\u4F4D\u6587\u4E66\u5206\u522B\u751F\u6210\uFF0C\u5171\u7528\u9879\u76EE\u4E0E\u843D\u6B3E\u4FE1\u606F\u3002")),i.createElement("button",{onClick:()=>$e({...u,recipients:Pt([...ue,{name:"",start:"",end:""}],void 0,ie)}),disabled:u.recipients.length>=200},"\uFF0B \u6DFB\u52A0\u5355\u4F4D")),ue.map((n,l)=>i.createElement("div",{className:"df-recipient",key:l,id:"df-recipient-"+l},i.createElement("div",{className:"df-recipient-title"},i.createElement("b",null,String(l+1).padStart(2,"0")),i.createElement("button",{"aria-label":`\u79FB\u9664\u7B2C${l+1}\u5BB6\u5355\u4F4D`,onClick:()=>$e({...u,recipients:Pt(ue.filter((f,O)=>O!==l),void 0,ie)})},"\u79FB\u9664")),i.createElement("div",{className:"df-fields"},[["name","\u5355\u4F4D\u540D\u79F0"],["start","\u9886\u53D6\u5F00\u59CB\u65F6\u95F4"],["end","\u9886\u53D6\u7ED3\u675F\u65F6\u95F4"]].map(([f,O])=>{let se=`df-recipient-${l}-${f}`,Je=Ft(n.start),Nt=f==="start"&&we&&Je&&Je<=we?`\u9886\u53D6\u5F00\u59CB\u65E5\u671F\u5FC5\u987B\u665A\u4E8E\u9009\u5546\u8BBA\u8BC1\u5BA1\u6279\u65E5\u671F\uFF08${we}\uFF09\u3002`:"",rt=Fe.filter(Ie=>Ie.status==="error"&&Ie.field===`recipient-${l}-${f}`&&Ie.detail!==Nt).map(Ie=>Ie.detail);return Nt&&rt.unshift(Nt),i.createElement("div",{className:"df-field "+(f==="name"?"df-span":""),key:f},Se&&f!=="name"?i.createElement($t,{field:{key:`recipient-${l}-${f}`,label:O},inputId:se,timelineLink:aa(`recipient-${l}-${f}`)}):i.createElement("label",{htmlFor:se},O),i.createElement("input",{id:se,"aria-label":`\u7B2C${l+1}\u5BB6${O}`,"aria-invalid":rt.length?!0:void 0,"aria-describedby":rt.length?se+"-error":void 0,type:f==="name"?"text":"datetime-local",value:f==="name"?n[f]:n[f].replace(" ","T"),onChange:Ie=>pt(l,f,Ie.target.value)}),rt.length===1&&i.createElement("small",{id:se+"-error",className:"df-field-validation"},rt[0]),rt.length>1&&i.createElement("ul",{id:se+"-error",className:"df-field-validation"},rt.map((Ie,Aa)=>i.createElement("li",{key:Aa},Ie))),(ie||l>0)&&f!=="name"&&i.createElement("small",{className:"df-follow-state"},n["follow_"+f]?ie?"\u8DDF\u968F\u53D1\u653E\u65F6\u95F4":f==="end"?"\u65F6\u523B\u8DDF\u968F\u7B2C1\u5BB6":"\u8DDF\u968F\u7B2C1\u5BB6":"\u5DF2\u5355\u72EC\u8BBE\u7F6E",!n["follow_"+f]&&i.createElement("button",{type:"button","aria-label":`\u7B2C${l+1}\u5BB6${O}\u6062\u590D\u8DDF\u968F`,onClick:Ie=>{Ie.preventDefault(),pt(l,f,ue[0][f],!0)}},"\u6062\u590D\u8DDF\u968F")))})),Fe.filter(f=>f.status==="error"&&f.field==="recipient-"+l).map((f,O)=>i.createElement("p",{className:"df-field-validation",key:O},f.detail))))),Oa=i.createElement(i.Fragment,null,i.createElement("div",{className:"df-toolbar-file-actions"},i.createElement(Wt,{label:"\u6A21\u677F",icon:"template",disabled:!!B||!u},i.createElement("button",{className:"df-toolbar-template-import",disabled:!!B,onClick:()=>vt.current.click()},i.createElement(he,{name:"import"}),"\u5BFC\u5165\u6A21\u677F"),i.createElement("button",{"aria-label":"\u4E0B\u8F7D\u914D\u5957\u6A21\u677F",disabled:!!B,onClick:()=>ae("\u4E0B\u8F7D\u914D\u5957\u6A21\u677F",()=>dt("/starter","\u6587\u4E66\u586B\u62A5_\u914D\u5957\u6A21\u677F.zip"))},i.createElement(he,{name:"download"}),"\u4E0B\u8F7D\u6A21\u677F"),na),i.createElement("button",{"aria-label":"\u4E0B\u8F7D\u672C\u9636\u6BB5\u6750\u6599",title:"\u4E0B\u8F7D\u672C\u9636\u6BB5\u6750\u6599",disabled:!!B,onClick:S},i.createElement(he,{name:"download"}),"\u9636\u6BB5\u6750\u6599"),i.createElement(Wt,{label:"\u66F4\u591A\u64CD\u4F5C",icon:"more",iconOnly:!0,disabled:!!B||!u},i.createElement("label",{className:"df-field"},i.createElement("span",null,"\u8868\u5355\u540D\u79F0"),i.createElement("input",{"aria-label":"\u8868\u5355\u540D\u79F0",maxLength:120,value:u?.name||"",onChange:n=>$e({...u,name:n.target.value})})),i.createElement("button",{disabled:!!B,onClick:()=>{X("adopt"),K([]),T?.()}},"\u6838\u5BF9\u9879\u76EE\u8D44\u6599\u5DEE\u5F02"),i.createElement("button",{disabled:!!B,onClick:()=>{X("publish"),K([]),T?.()}},"\u5B58\u5165\u9879\u76EE\u5E95\u7A3F"))),i.createElement("div",{className:"df-toolbar-save"},u&&i.createElement("span",{className:"df-save-state"+(G?" is-dirty":""),title:G?"\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539":"\u8349\u7A3F\u5DF2\u4FDD\u5B58 \xB7 "+bt(u.updated_at),role:"status"},G?"\u672A\u4FDD\u5B58":"\u5DF2\u4FDD\u5B58"),i.createElement("button",{className:"df-toolbar-icon-button",title:"\u5BFC\u5165 Excel","aria-label":"\u5BFC\u5165 Excel",disabled:!!B||!u,onClick:()=>at.current.click()},i.createElement(he,{name:"import"})),i.createElement("button",{className:"df-toolbar-icon-button",title:"\u5BFC\u51FA\u5F53\u524D Excel","aria-label":"\u5BFC\u51FA\u5F53\u524D Excel",disabled:!!B||!u,onClick:Ma},i.createElement(he,{name:"export"})),i.createElement("button",{className:"df-primary df-toolbar-icon-button","aria-label":"\u4FDD\u5B58\u8349\u7A3F",title:"\u4FDD\u5B58\u8349\u7A3F",disabled:!!B||!u||!G,onClick:()=>ae("\u4FDD\u5B58\u8349\u7A3F",async()=>{await be(),await oe(),pe("\u8349\u7A3F\u5DF2\u4FDD\u5B58")})},i.createElement(he,{name:"save"})))),oa=u&&i.createElement(i.Fragment,null,!fe&&na,i.createElement($a,{title:"\u89C4\u5219\u51B2\u7A81",issues:ea(Ke),onFix:ta}),i.createElement($a,{title:"\u667A\u80FD\u4F53\u51B2\u7A81",issues:ea(Te),onFix:ta}),i.createElement("section",{className:"df-paper df-edit-footer","aria-label":"\u6587\u4EF6\u751F\u6210\u64CD\u4F5C"},i.createElement("div",{className:"df-generation-plan"},i.createElement("p",null,"\u672C\u6B21\u8BA1\u5212\u751F\u6210 ",i.createElement("b",null,C)," \u4EFD\u6587\u4E66")),i.createElement("div",{className:"df-actions"},i.createElement("button",{onClick:Ia},"\u667A\u80FD\u4F53\u6838\u67E5"),i.createElement("button",{className:"df-primary",onClick:Da},"\u751F\u6210\u6587\u4EF6"))));return i.createElement("div",{className:"df-app df-embedded-editor","data-theme":ve},i.createElement("input",{ref:at,type:"file",accept:".xlsx",hidden:!0,"aria-label":"\u5BFC\u5165 Excel \u53D8\u91CF\u8868",onChange:n=>{Ta(n.target.files[0]),n.target.value=""}}),i.createElement("input",{ref:vt,type:"file",accept:".docx,.xlsx",multiple:!0,hidden:!0,"aria-label":"\u5BFC\u5165 Word \u6A21\u677F",onChange:n=>{Sa(n.target.files),n.target.value=""}}),i.createElement("section",{className:"df-main"},!b&&i.createElement("div",{className:"df-editor-context"},i.createElement("button",{disabled:!!B,onClick:()=>{ft()&&g()}},"\u2190 \u8FD4\u56DE",s.title),i.createElement("span",null,a.name," / ",s.title),b&&i.createElement("button",{disabled:!!B||G,title:G?"\u8BF7\u5148\u4FDD\u5B58\u8868\u5355":"\u66F4\u65B0\u5F53\u524D\u8282\u70B9\u7684\u529E\u7406\u4FE1\u606F",onClick:w},"\u529E\u7406\u4FE1\u606F\u4E0E\u72B6\u6001"),u&&i.createElement("div",{className:"df-actions"},i.createElement("button",{disabled:!!B,onClick:()=>{X("adopt"),K([])}},"\u6838\u5BF9\u9879\u76EE\u8D44\u6599\u5DEE\u5F02"),i.createElement("button",{disabled:!!B,onClick:()=>{X("publish"),K([])}},"\u5B58\u5165\u9879\u76EE\u5E95\u7A3F"))),!fe&&i.createElement("header",{className:"df-header"},i.createElement("div",null,!b&&i.createElement("span",{className:"df-eyebrow"},s.title," / \u586B\u5199\u4E0E\u751F\u6210"),i.createElement("h1",null,u?b?"\u586B\u5199\u5185\u5BB9":u.name:"\u586B\u5199\u9879\u76EE\u8D44\u6599"),i.createElement("p",null,u?G?"\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539":`\u8349\u7A3F\u5DF2\u4FDD\u5B58 \xB7 ${bt(u.updated_at)}`:"\u5BFC\u5165\u53D8\u91CF\u8868\u4E0E Word \u6A21\u677F\uFF0C\u586B\u5199\u3001\u6838\u5BF9\uFF0C\u518D\u751F\u6210\u6587\u4E66\u3002")),u&&i.createElement("button",{disabled:!!B||!G,onClick:()=>ae("\u4FDD\u5B58\u8349\u7A3F",async()=>{await be(),await oe(),pe("\u8349\u7A3F\u5DF2\u4FDD\u5B58")})},"\u4FDD\u5B58\u8349\u7A3F")),fe?Pe.host.ReactDOM.createPortal(Oa,I):b?i.createElement("div",{className:"df-node-tools","aria-label":"\u8868\u5355\u64CD\u4F5C"},i.createElement("button",{disabled:!!B,onClick:()=>at.current.click()},"\u5BFC\u5165 Excel"),i.createElement("details",null,i.createElement("summary",null,"\u66F4\u591A\u64CD\u4F5C"),i.createElement("div",{className:"df-actions"},i.createElement("button",{disabled:!!B,onClick:()=>{X("adopt"),K([])}},"\u6838\u5BF9\u9879\u76EE\u8D44\u6599\u5DEE\u5F02"),i.createElement("button",{disabled:!!B,onClick:()=>{X("publish"),K([])}},"\u5B58\u5165\u9879\u76EE\u5E95\u7A3F")))):i.createElement("div",{className:"df-steps","aria-label":"\u586B\u5199\u6D41\u7A0B"},[["import","01","\u5BFC\u5165\u6A21\u677F"],["edit","02","\u586B\u5199\u8D44\u6599"],["generate","03","\u6587\u4EF6\u751F\u6210"],["files","04","\u6587\u4EF6\u9884\u89C8"]].map(([n,l,f])=>i.createElement("button",{key:n,"aria-current":A===n?"step":void 0,className:A===n?"active":"",disabled:!!B||!u&&n!=="import"||n==="files"&&!ne,onClick:()=>{n==="generate"&&y("generate"),Y(n==="generate"?"edit":n)}},i.createElement("span",null,l),f))),xe&&i.createElement("div",{className:"df-alert error",role:"alert"},xe,i.createElement("button",{"aria-label":"\u5173\u95ED\u9519\u8BEF\u63D0\u793A",onClick:()=>st("")},"\xD7")),ht&&i.createElement("div",{className:"df-alert",role:"status"},ht),B&&i.createElement("div",{className:"df-progress",role:"status"},B,"\u2026"),i.createElement("fieldset",{className:"df-content",disabled:!!B},A==="import"&&i.createElement("div",{className:"df-import"},i.createElement("section",{className:"df-paper df-drop"},i.createElement("div",{className:"df-file-mark"},"XLSX"),i.createElement("h2",null,"\u4ECE Excel \u53D8\u91CF\u8868\u5F00\u59CB"),i.createElement("p",null,"\u201C\u53D8\u91CF\u914D\u7F6E\u201D\u5DE5\u4F5C\u8868\u4FDD\u7559\u4E09\u5217\uFF1A",i.createElement("br",null),i.createElement("b",null,"\u53D8\u91CF\u540D\u79F0\u3000\u4E2D\u6587\u540D\u79F0\u3000\u503C")),i.createElement("button",{className:"df-primary",onClick:()=>at.current.click()},"\u9009\u62E9 Excel \u53D8\u91CF\u8868"),i.createElement("small",null,"\u652F\u6301 .xlsx \xB7 \u5355\u4E2A\u6587\u4EF6\u4E0D\u8D85\u8FC7 15 MB")),i.createElement("section",{className:"df-paper df-import-note"},i.createElement("span",{className:"df-eyebrow"},"\u5982\u4F55\u51C6\u5907"),i.createElement("h2",null,"\u4E00\u4EFD\u6570\u636E\uFF0C\u591A\u4EFD\u6587\u4E66"),i.createElement("ol",null,i.createElement("li",null,i.createElement("b",null,"\u6574\u7406\u53D8\u91CF"),i.createElement("p",null,"\u4F8B\u5982 project.name / \u9879\u76EE\u540D\u79F0 / \u5B9E\u9645\u540D\u79F0\u3002\u652F\u6301\u5206\u7EC4\u3001\u7C7B\u578B\u548C\u5FC5\u586B\u5217\u3002")),i.createElement("li",null,i.createElement("b",null,"\u81EA\u52A8\u8F7D\u5165\u6A21\u677F"),i.createElement("p",null,"\u5E94\u7528\u81EA\u5E26 5 \u4EFD\u6807\u51C6 Word \u6A21\u677F\uFF0C\u4F7F\u7528\u914D\u5957 Excel \u5373\u53EF\u81EA\u52A8\u8F7D\u5165\uFF1B \u4E5F\u53EF\u6DFB\u52A0\u81EA\u5DF1\u7684\u6A21\u677F\u3002")),i.createElement("li",null,i.createElement("b",null,"\u5206\u522B\u751F\u6210\u9080\u8BF7\u51FD"),i.createElement("p",null,"\u5728\u201C\u53D7\u9080\u5355\u4F4D\u201D\u8868\u8BB0\u5F55\u5355\u4F4D\u540D\u79F0\u3001\u9886\u53D6\u5F00\u59CB\u65F6\u95F4\u548C\u9886\u53D6\u7ED3\u675F\u65F6\u95F4\u3002"))),i.createElement("p",{className:"df-muted"},"\u201C\u65E5\u671F\u6821\u6838\u201D\u8868\u4E2D\u7684\u65E7\u7ED3\u679C\u4E0D\u4F1A\u4F5C\u4E3A\u5224\u65AD\u4F9D\u636E\uFF1B\u5E94\u7528\u4F1A\u6839\u636E\u5F53\u524D\u586B\u5199\u5185\u5BB9\u91CD\u65B0\u6838\u5BF9\u3002\u201C\u6821\u6838\u89C4\u5219\u201D\u8868\u53EF\u8865\u5145\u81EA\u5B9A\u4E49\u5148\u540E\u5173\u7CFB\u3002"))),u&&(b||A==="edit")&&i.createElement("div",{className:"df-edit-layout",id:b?"df-node-panel-form":void 0,role:b?"tabpanel":void 0,"aria-labelledby":b?"df-node-tab-form":void 0,hidden:b&&q!=="form"},!fe&&i.createElement("section",{className:"df-paper df-form-heading"},i.createElement("div",{className:"df-section-head"},!b&&i.createElement("h2",null,"\u586B\u5199\u4FE1\u606F"),i.createElement("button",{onClick:()=>ae("\u5BFC\u51FA Excel",async()=>{let n=await be();await dt(`/cases/${n.id}/excel`,(n.fields.find(l=>l.key==="project.name")?.value||n.name).replace(/[<>:"/\\|?*\x00-\x1f]/g,"_").slice(0,80)+"_\u586B\u5199\u6570\u636E.xlsx")})},"\u5BFC\u51FA\u5F53\u524D Excel")),i.createElement("label",{className:"df-field df-title-field"},i.createElement("span",null,"\u8868\u5355\u540D\u79F0"),i.createElement("input",{"aria-label":"\u8868\u5355\u540D\u79F0",maxLength:120,value:u.name,onChange:n=>$e({...u,name:n.target.value})}))),i.createElement(_t,{id:"df-form",label:"\u586B\u5199\u5185\u5BB9\u5206\u7EC4",items:kt,value:Ee,onChange:y}),yt.map(n=>i.createElement("section",{className:"df-paper df-form-panel",key:n,role:"tabpanel",id:`df-form-panel-${n}`,"aria-labelledby":`df-form-tab-${n}`,hidden:Ee!==n},me&&n===nt&&ra,[...new Set(ye.filter(l=>Z(l)===n&&!/^selection\.member\d+_/.test(l.key)).map(l=>l.group))].map(l=>i.createElement("section",{className:"df-group",key:l},!me&&(!fe||l!==n)&&i.createElement("h3",null,l),!fe&&l==="\u65E5\u671F\u5B89\u6392"&&i.createElement("p",{className:"df-muted"},"\u6587\u4E66\u7EDF\u4E00\u4F7F\u7528\u4E2D\u6587\u65E5\u671F\uFF0C\u4F8B\u5982\u201C2026\u5E7410\u670822\u65E5\u4E0B\u534814:30\u201D\u3002\u65E5\u671F\u9009\u62E9\u5668\u4FDD\u7559\u539F\u6765\u7684\u586B\u5199\u65B9\u5F0F\u3002"),i.createElement("div",{className:"df-fields"},ye.filter(f=>f.group===l&&Z(f)===n&&!/^selection\.member\d+_/.test(f.key)).map(f=>i.createElement(Pa,{key:f.key,field:f,timelineLink:Se&&!f.read_only&&Object.values(Le).some(O=>O.key===f.key)?aa(f.key):void 0,issue:Fe.find(O=>O.field===f.key&&(O.status==="error"||u.presentation_sources?.[f.key]!==f.value)),displayValue:F[f.key]??(u.presentation_sources?.[f.key]===f.value?u.document_values?.[f.key]:void 0),onChange:(O,se)=>St(f.key,O,se)}))))),n==="\u8BBA\u8BC1\u6210\u5458"&&i.createElement(oi,{fields:ye,compact:!!fe,onChange:(l,f)=>$e({...u,fields:u.fields.map(O=>O.key===l?{...O,value:f}:O)})}))),Se&&i.createElement("section",{className:"df-paper df-timeline-panel",role:"tabpanel",id:"df-form-panel-timeline","aria-labelledby":"df-form-tab-timeline",hidden:Ee!=="timeline"},Ee==="timeline"&&i.createElement(Yt,{project:a,draft:{...u,recipients:ue},times:Le,issues:Fe,onEdit:St,onEditRecipient:pt,onFollowDispatch:ie?.start&&ue.some(n=>!n.follow_start||!n.follow_end)?it:void 0,onOpenRecipients:()=>y(nt),onOpenApproval:z})),!me&&ra,!b&&i.createElement("div",{role:"tabpanel",id:"df-form-panel-generate","aria-labelledby":"df-form-tab-generate",hidden:Ee!=="generate"},oa)),u&&i.createElement("div",{className:b?"df-generation-panel":void 0,id:b?"df-node-panel-generate":void 0,role:b?"tabpanel":void 0,"aria-labelledby":b?"df-node-tab-generate":void 0,hidden:b&&q!=="generate"},b&&A==="edit"&&oa,(b||A==="files"&&ne)&&i.createElement("div",{className:"df-results"+(b?" df-results-docked":"")},i.createElement("section",{className:"df-paper df-output-list","aria-label":"\u751F\u6210\u8BB0\u5F55"},b?i.createElement("h2",null,"\u751F\u6210\u8BB0\u5F55"):i.createElement(i.Fragment,null,i.createElement("span",{className:"df-eyebrow"},"\u751F\u6210\u8BB0\u5F55"),i.createElement("h2",null,ne.files.length," \u4EFD\u6587\u4EF6\u5DF2\u751F\u6210"),i.createElement("p",null,bt(ne.created_at)," \xB7 \u4FEE\u8BA2"," ",ne.revision)),!Ue.length&&i.createElement("p",{className:"df-muted"},"\u672C\u9636\u6BB5\u8FD8\u6CA1\u6709\u751F\u6210\u6587\u4EF6\u3002"),ne&&i.createElement("p",{className:"df-muted"},It?"\u538B\u7F29\u5305\u5305\u542B\u8BBA\u8BC1\u610F\u89C1\u53CA\u7B7E\u5B57\u8868\u3001\u975E\u62DB\u6807\u65B9\u6848\u3001\u586B\u5199\u6570\u636E\u548C\u6838\u5BF9\u8BB0\u5F55":wt?"\u538B\u7F29\u5305\u5305\u542B Word\u3001\u79D1\u7814\u8BA1\u5212\u8868\u3001\u586B\u5199\u6570\u636E\u548C\u6838\u5BF9\u8BB0\u5F55":"\u538B\u7F29\u5305\u5305\u542B Word\u3001\u586B\u5199\u6570\u636E\u548C\u6838\u5BF9\u8BB0\u5F55"),ne&&(G||(ne.content_digest?ne.content_digest!==u.content_digest:ne.revision!==u.revision))&&i.createElement("div",{className:"df-alert"},"\u586B\u5199\u5185\u5BB9\u5DF2\u6709\u4FEE\u6539\uFF0C\u4E0B\u5217\u6587\u4EF6\u4FDD\u7559\u751F\u6210\u65F6\u7684\u5185\u5BB9\u3002\u8BF7\u91CD\u65B0\u6838\u5BF9\u5E76\u751F\u6210\u65B0\u7248\u3002"),Ue.map(({caseId:n,batch:l})=>i.createElement("div",{className:"df-generation",key:n+":"+l.id},i.createElement("div",{className:"df-generation-heading"},i.createElement("h3",null,bt(l.created_at)," \xB7 \u4FEE\u8BA2 ",l.revision,l.date_style!=="zh-CN"&&" \xB7 \u539F\u65E5\u671F\u683C\u5F0F",l.naming_style!=="formal"&&" \xB7 \u539F\u6587\u4EF6\u540D"),i.createElement("button",{"aria-label":`\u6253\u5305\u4E0B\u8F7D ${bt(l.created_at)} \u4FEE\u8BA2 ${l.revision}`,onClick:()=>La(n,l)},"\u6253\u5305\u4E0B\u8F7D")),l.files.map(f=>{let O=b?N?.case_id===n&&N.generation_id===l.id&&N.name===f.name:ze?.generation.id===l.id&&ze.file.name===f.name;return i.createElement("div",{className:"df-output"+(O?" selected":""),key:f.name},i.createElement("button",{onClick:()=>{b?v(Zt(n,l,f)):tt({file:f,generation:l})}},i.createElement("b",null,f.name),i.createElement("small",null,f.recipient," \xB7 ",(f.size/1024).toFixed(0)," ","KB",f.print_copies>1&&` \xB7 \u5EFA\u8BAE\u6253\u5370 ${f.print_copies} \u4EFD`)),i.createElement("button",{"aria-label":"\u4E0B\u8F7D"+f.name,onClick:()=>ae("\u4E0B\u8F7D\u6587\u4EF6",()=>dt(ia(n,l,f.name),f.name))},"\u2193"))}))),b&&N?.case_id&&Ue.some(({caseId:n,batch:l})=>n===N.case_id&&l.id===N.generation_id)&&i.createElement("button",{onClick:D},"\u5C31\u6B64\u6587\u4EF6\u63D0\u95EE \u2192"),ke.length>0&&i.createElement("details",{className:"df-historical-forms"},i.createElement("summary",null,"\u5386\u53F2\u5E95\u7A3F"),ke.map(n=>i.createElement("button",{key:n.case_id,onClick:()=>ae("\u4E0B\u8F7D\u5386\u53F2\u5E95\u7A3F",()=>dt(`/cases/${n.case_id}/excel`,n.name+"_\u5386\u53F2\u5E95\u7A3F.xlsx"))},n.name," \u2193")))),!b&&i.createElement("section",{className:"df-paper df-preview"},i.createElement("div",{className:"df-section-head"},i.createElement("h2",null,ze?ze.file.name:"\u9009\u62E9\u6587\u4EF6\u9884\u89C8"),i.createElement("span",null,"Office \u9884\u89C8")),i.createElement("div",{className:"df-preview-body"},ct&&xt?i.createElement(Lt,{key:ct.id,artifact:ct},i.createElement(xt,{key:ct.id,artifact:ct,readOnly:!0,hostControls:!0})):i.createElement("p",{className:"df-muted"},ct?"\u6B63\u5728\u6253\u5F00\u6587\u4EF6\u2026":"\u4ECE\u5DE6\u4FA7\u9009\u62E9\u4E00\u4EFD\u6587\u4EF6\u3002")))))),i.createElement("footer",{className:"df-footer"},i.createElement("span",null,"UGSci \xB7 \u5916\u534F\u52A9\u624B"))),U&&u&&i.createElement("div",{className:"df-dialog-backdrop"},i.createElement("section",{className:"df-dialog df-paper",role:"dialog","aria-modal":"true","aria-label":"\u6838\u5BF9\u5171\u7528\u8D44\u6599"},i.createElement("div",{className:"df-section-head"},i.createElement("h2",null,U==="adopt"?"\u91C7\u7528\u9879\u76EE\u5E95\u7A3F\u4E2D\u7684\u8D44\u6599":"\u5C06\u672C\u8868\u8D44\u6599\u5B58\u5165\u9879\u76EE\u5E95\u7A3F"),i.createElement("button",{disabled:!!B,onClick:()=>X(null),"aria-label":"\u5173\u95ED\u5171\u7528\u8D44\u6599\u6838\u5BF9"},"\xD7")),i.createElement("p",{className:"df-muted"},"\u53EA\u66F4\u65B0\u52FE\u9009\u9879\u3002\u539F\u751F\u6210\u6587\u4EF6\u4FDD\u7559\uFF0C\u540E\u7EED\u751F\u6210\u524D\u9700\u91CD\u65B0\u6838\u5BF9\u3002"),xe&&i.createElement("p",{role:"alert",className:"df-alert error"},xe),i.createElement("div",{className:"df-compare"},a.fields.filter(n=>u.fields.some(l=>l.key===n.key&&l.value!==n.value)).map(n=>{let l=u.fields.find(f=>f.key===n.key);return i.createElement("label",{key:n.key},i.createElement("input",{type:"checkbox",checked:E.includes(n.key),onChange:f=>K(f.target.checked?[...E,n.key]:E.filter(O=>O!==n.key))}),i.createElement("div",null,i.createElement("b",null,n.label),i.createElement("div",{className:"df-compare-values"},i.createElement("p",null,i.createElement("small",null,"\u5F53\u524D\u8868\u5355"),l.value||"\u7A7A\u767D"),i.createElement("p",null,i.createElement("small",null,"\u9879\u76EE\u5E95\u7A3F"),n.value||"\u7A7A\u767D"))))}),!a.fields.some(n=>u.fields.some(l=>l.key===n.key&&l.value!==n.value))&&i.createElement("p",null,"\u672C\u8868\u4E0E\u9879\u76EE\u5E95\u7A3F\u4E2D\u7684\u5171\u7528\u8D44\u6599\u4E00\u81F4\u3002")),i.createElement("div",{className:"df-actions"},i.createElement("button",{disabled:!!B,onClick:()=>X(null)},"\u53D6\u6D88"),i.createElement("button",{className:"df-primary",disabled:!!B||!E.length,onClick:()=>ae("\u540C\u6B65\u5171\u7528\u8D44\u6599",async()=>{let n=await be();if(U==="adopt")je(await Ne(`/projects/${a.id}/cases/${n.id}/sync`,He({revision:a.revision,case_revision:n.revision,keys:E})));else{let l=Object.fromEntries(n.fields.filter(f=>E.includes(f.key)).map(f=>[f.key,f.value]));await Ne(`/projects/${a.id}`,{...He({revision:a.revision,name:l["project.name"]??a.name,code:l["project.code"]??a.code,owner:a.owner,values:l}),method:"PUT"})}await oe(),X(null),pe("\u6240\u9009\u8D44\u6599\u5DF2\u540C\u6B65\uFF0C\u8BF7\u91CD\u65B0\u6838\u5BF9\u540E\u751F\u6210\u65B0\u7248\u6587\u4E66\u3002")})},U==="adopt"?"\u91C7\u7528\u6240\u9009\u9879\u76EE\u8D44\u6599":"\u4FDD\u5B58\u6240\u9009\u8D44\u6599\u5230\u5E95\u7A3F")))))}function si(){let a=Pe.host.useSelectedAgent?.();return i.createElement(Qt,{key:a?.id||Pe.host.getSelectedAgentId?.()||"default",Editor:di,services:{request:Ne,json:He,download:dt,time:bt,Field:Pa}})}Pe.registerRoutes("document-forms",[{path:"/apps/document-forms",component:si,label:"\u5916\u534F\u52A9\u624B",icon:"\u25A4"}]);})();
