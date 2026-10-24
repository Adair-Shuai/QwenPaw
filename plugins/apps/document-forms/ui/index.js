(()=>{var O=window.QwenPaw.host.React,{useEffect:dt,useState:xe}=O;function Xe({artifact:n,children:g}){return n.extension==="xlsx"?g:O.createElement(bt,{artifact:n},g)}function bt({artifact:n,children:g}){let[p,b]=xe("print"),[f,x]=xe([]),[m,h]=xe(0),[r,N]=xe(""),[u,$]=xe(0),[B,Z]=xe(100);return dt(()=>{if(p!=="print")return;let o=new AbortController,L=[];return x([]),h(0),N(""),window.QwenPaw.host.fetch(n.printUrl+"?pages=true",{headers:n.agentId?{"X-Agent-Id":n.agentId}:{},signal:o.signal}).then(async T=>{if(!T.ok){let I=await T.json().catch(()=>({}));throw new Error(typeof I.detail=="string"?I.detail:"\u6253\u5370\u9884\u89C8\u6682\u4E0D\u53EF\u7528\uFF0C\u53EF\u5207\u6362\u6587\u5B57\u9884\u89C8\u6216\u4E0B\u8F7D Word \u67E5\u770B")}let{pages:E}=await T.json();if(!o.signal.aborted){if(!Number.isInteger(E)||E<1||E>40)throw new Error("\u672A\u83B7\u5F97\u6709\u6548\u7684 Word \u9875\u6570");h(E);for(let I=1;I<=E;I++){let F=await window.QwenPaw.host.fetch(n.printUrl+"?page="+I,{headers:n.agentId?{"X-Agent-Id":n.agentId}:{},signal:o.signal});if(!F.ok)throw new Error(`\u7B2C ${I} \u9875\u672A\u80FD\u6E32\u67D3\uFF0C\u8BF7\u91CD\u65B0\u9884\u89C8`);let D=await F.blob();if(o.signal.aborted)return;let _=URL.createObjectURL(D);L.push(_),x(w=>[...w,_])}}}).catch(T=>{o.signal.aborted||N(T.message||"\u6253\u5370\u9884\u89C8\u672A\u5B8C\u6210")}),()=>{o.abort(),L.forEach(T=>URL.revokeObjectURL(T))}},[n.id,n.printUrl,n.agentId,p,u]),O.createElement("div",{className:"df-print-preview"},O.createElement("div",{className:"df-print-toolbar"},O.createElement("div",null,O.createElement("button",{"aria-pressed":p==="print",onClick:()=>b("print")},"\u6253\u5370\u7248\u5F0F"),O.createElement("button",{"aria-pressed":p==="text",onClick:()=>b("text")},"\u6587\u5B57\u9884\u89C8")),p==="print"&&O.createElement("div",null,m>0&&O.createElement("span",null,"\u5171 ",m," \u9875"),O.createElement("select",{"aria-label":"\u9884\u89C8\u6BD4\u4F8B",value:B,onChange:o=>Z(Number(o.target.value))},O.createElement("option",{value:100},"\u9002\u5408\u5BBD\u5EA6"),O.createElement("option",{value:125},"125%"),O.createElement("option",{value:150},"150%"),O.createElement("option",{value:200},"200%")))),p==="text"?O.createElement("div",{className:"df-text-preview"},g):r?O.createElement("div",{className:"df-preview-message",role:"alert"},O.createElement("p",null,r),O.createElement("button",{onClick:()=>$(o=>o+1)},"\u91CD\u65B0\u9884\u89C8")):f.length?O.createElement("div",{className:"df-print-scroll"},O.createElement("div",{className:"df-print-pages",style:{width:B+"%"}},f.map((o,L)=>O.createElement("figure",{key:L},O.createElement("figcaption",null,"\u7B2C ",L+1," \u9875"),O.createElement("img",{src:o,alt:n.title+` \xB7 \u6253\u5370\u7248\u5F0F \xB7 \u7B2C ${L+1} \u9875`}))),f.length<m&&O.createElement("p",{role:"status"},"\u6B63\u5728\u6392\u7248\u7B2C ",f.length+1," \u9875\u2026"))):O.createElement("div",{className:"df-preview-message",role:"status"},"\u6B63\u5728\u6392\u7248\u6253\u5370\u9875\u9762\u2026"))}function ce({artifact:n}){let[g,p]=xe(null),[b,f]=xe(""),[x,m]=xe(0);if(dt(()=>{let r=new AbortController;return p(null),f(""),window.QwenPaw.host.fetch("/workspace/convert-office",{method:"POST",headers:{"Content-Type":"application/json",...n.agentId?{"X-Agent-Id":n.agentId}:{}},signal:r.signal,body:JSON.stringify({url:n.binaryUrl,mime_type:n.mimeType})}).then(async N=>{let u=await N.json();if(!N.ok)throw new Error(typeof u.detail=="string"?u.detail:"\u6587\u4EF6\u9884\u89C8\u672A\u5B8C\u6210");r.signal.aborted||p(u)}).catch(N=>{r.signal.aborted||f(N.message||"\u6587\u4EF6\u9884\u89C8\u672A\u5B8C\u6210")}),()=>r.abort()},[n.id,n.binaryUrl,n.mimeType,n.agentId,x]),b)return O.createElement("div",{className:"df-preview-message",role:"alert"},O.createElement("p",null,b),O.createElement("button",{onClick:()=>m(r=>r+1)},"\u91CD\u65B0\u9884\u89C8"),O.createElement("p",null,"\u4E5F\u53EF\u4EE5\u4ECE\u6587\u4EF6\u6E05\u5355\u4E0B\u8F7D\u540E\u67E5\u770B\u3002"));if(!g)return O.createElement("div",{className:"df-preview-message",role:"status"},"\u6B63\u5728\u6253\u5F00\u6587\u4EF6\u2026");let h=g.engine==="officecli"?g.html:`<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;color:#333;background:#fff;padding:24px 32px;line-height:1.7;max-width:900px;margin:0 auto}table{border-collapse:collapse;width:100%;margin:12px 0}td,th{border:1px solid #ddd;padding:8px 12px}img{max-width:100%;height:auto}h1{font-size:1.6em}h2{font-size:1.3em}.docx-page-break{border-top:2px dashed #ccc;margin:32px 0}</style></head><body>${g.html||""}</body></html>`;return O.createElement("iframe",{className:"df-office-frame",title:n.title,srcDoc:h,sandbox:g.engine==="officecli"?"allow-scripts":"allow-same-origin"})}var ot=`.df-app {
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
.df-plan-partners {
  grid-column: 1 / -1;
  display: grid;
  gap: 14px;
  min-width: 0;
}
.df-plan-partners > span {
  font-size: 12px;
  font-weight: 500;
}
.df-plan-partners > small {
  font-size: 10px;
  color: var(--df-muted);
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

.df-results.df-results-docked {
  grid-template-columns: minmax(0, 1fr);
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
  font-size: 12px;
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
`;var He=window.QwenPaw,v=He.host.React,{useState:ve,useEffect:vt}=v,st={running:"\u6B63\u5728\u6838\u67E5",completed:"\u6838\u67E5\u5B8C\u6210",failed:"\u672A\u5B8C\u6210",interrupted:"\u5DF2\u4E2D\u65AD"},lt=".doc,.docx,.pdf,.xls,.xlsx,.png,.jpg,.jpeg";function Be({project:n,services:g,onChanged:p}){let{request:b,download:f,time:x}=g,[m,h]=ve(null),[r,N]=ve(""),[u,$]=ve(null),[B,Z]=ve([]),[o,L]=ve(""),[T,E]=ve(""),[I,F]=ve(!1),[D,_]=ve(""),[w,Q]=ve(0);vt(()=>{let s=!0,U,C=!1;async function M(){try{let R=await b(`/projects/${n.id}/response-reviews`);if(!s)return;h(R),_("");let X=R.records.some(W=>W.status==="running");C&&!X&&p(),C=X,X&&(U=setTimeout(M,3e3))}catch(R){s&&_(R.message)}}return M(),()=>{s=!1,clearTimeout(U)}},[n.id,w]);let A=m?.records.some(s=>s.status==="running"),P=m?.records.find(s=>s.id===T)||m?.records[0],z=He.host.ReactMarkdown;async function S(s){s.preventDefault(),_(""),F(!0);try{let U=new FormData;r?U.set("reference_id",r):u&&U.set("reference",u);for(let M of B)U.append("responses",M);U.set("focus",o);let C=await b(`/projects/${n.id}/response-reviews`,{method:"POST",body:U});E(C.id),h(M=>({...M,records:[C,...M?.records||[]]})),Q(M=>M+1)}catch(U){_(U.message)}finally{F(!1)}}return v.createElement("div",{className:"df-response-review"},v.createElement("p",{className:"df-muted"},"\u5BF9\u7167\u8C08\u5224\u6587\u4EF6\uFF0C\u9010\u5BB6\u68C0\u67E5\u8D44\u8D28\u3001\u6280\u672F\u54CD\u5E94\u3001\u62A5\u4EF7\u3001\u65E5\u671F\u4E0E\u7B7E\u7AE0\u9644\u4EF6\u3002\u6838\u67E5\u610F\u89C1\u4F9B\u7ECF\u529E\u4EBA\u548C\u4E13\u5BB6\u590D\u6838\u3002"),D&&v.createElement("div",{className:"df-alert error",role:"alert"},D,v.createElement("button",{onClick:()=>Q(s=>s+1)},"\u91CD\u65B0\u52A0\u8F7D")),m?v.createElement(v.Fragment,null,v.createElement("form",{onSubmit:S},v.createElement("fieldset",{disabled:I||A},v.createElement("label",{className:"df-field"},v.createElement("span",null,"\u6838\u67E5\u4F9D\u636E"),v.createElement("select",{"aria-label":"\u6838\u67E5\u4F9D\u636E",value:r,onChange:s=>{N(s.target.value),$(null)}},v.createElement("option",{value:""},"\u4E0A\u4F20\u6B63\u5F0F\u8C08\u5224\u6587\u4EF6"),m.references.map(s=>v.createElement("option",{key:s.id,value:s.id},s.label)))),!r&&v.createElement("label",{className:"df-field"},v.createElement("span",null,"\u6B63\u5F0F\u8C08\u5224\u6587\u4EF6"),v.createElement("input",{"aria-label":"\u4E0A\u4F20\u6838\u67E5\u4F9D\u636E",type:"file",accept:lt,required:!0,onChange:s=>$(s.target.files[0]||null)})),v.createElement("label",{className:"df-field"},v.createElement("span",null,"\u5404\u5355\u4F4D\u54CD\u5E94\u6750\u6599"),v.createElement("input",{"aria-label":"\u4E0A\u4F20\u54CD\u5E94\u6750\u6599",type:"file",multiple:!0,required:!0,accept:lt,onChange:s=>Z([...s.target.files])})),B.length>0&&v.createElement("ul",{className:"df-review-files"},B.map((s,U)=>v.createElement("li",{key:U},s.name))),v.createElement("p",{className:"df-muted"},"\u652F\u6301 Word\u3001PDF\u3001Excel \u548C\u56FE\u7247\uFF1B\u53EF\u4E00\u6B21\u9009\u62E9\u591A\u5BB6\u6750\u6599\u3002\u6BCF\u4EFD\u4E0D\u8D85\u8FC7 15 MB\uFF0C\u6BCF\u6B21\u6700\u591A 20 \u4EFD\u3001\u5408\u8BA1 100 MB\u3002\u538B\u7F29\u5305\u8BF7\u5148\u89E3\u538B\u3002"),v.createElement("label",{className:"df-field"},v.createElement("span",null,"\u8865\u5145\u5173\u6CE8\u70B9\uFF08\u9009\u586B\uFF09"),v.createElement("textarea",{"aria-label":"\u8865\u5145\u6838\u67E5\u5173\u6CE8\u70B9",rows:3,maxLength:3e3,value:o,onChange:s=>L(s.target.value),placeholder:"\u4F8B\u5982\uFF1A\u91CD\u70B9\u6838\u5BF9\u62A5\u4EF7\u5927\u5C0F\u5199\u3001\u6210\u679C\u4EA4\u4ED8\u65F6\u95F4\u548C\u8D44\u8D28\u6709\u6548\u671F"})),v.createElement("div",{className:"df-actions"},v.createElement("button",{className:"df-primary",disabled:I||A||!(r||u)||!B.length},I?"\u6B63\u5728\u63D0\u4EA4\u2026":"\u5F00\u59CB\u6838\u67E5"),v.createElement("span",{className:"df-muted"},"\u4F7F\u7528\u201C\u54CD\u5E94\u6587\u4EF6\u6838\u67E5\u201D\u667A\u80FD\u4F53\uFF0C\u6CBF\u7528\u8F6F\u4EF6\u4E2D\u7684\u6A21\u578B\u914D\u7F6E\u3002")))),m.records.length>0&&v.createElement("section",{className:"df-review-history"},v.createElement("div",{className:"df-section-head"},v.createElement("h3",null,"\u6838\u67E5\u8BB0\u5F55"),v.createElement("button",{onClick:()=>Q(s=>s+1)},"\u5237\u65B0\u8BB0\u5F55")),v.createElement("div",{className:"df-review-records"},m.records.map(s=>v.createElement("button",{key:s.id,"aria-pressed":P?.id===s.id,onClick:()=>E(s.id)},x(s.created_at)," \xB7 ",st[s.status]))),P&&v.createElement("article",{"aria-label":"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5\u7ED3\u679C"},v.createElement("div",{className:"df-section-head"},v.createElement("div",null,v.createElement("b",null,st[P.status]),v.createElement("p",{className:"df-muted"},"\u57FA\u4E8E\u9879\u76EE\u4FEE\u8BA2 ",P.project_revision," \xB7"," ",P.files.length," \u4EFD\u6750\u6599\uFF1B\u540E\u7EED\u6750\u6599\u4FEE\u6539\u8BF7\u91CD\u65B0\u6838\u67E5\u3002")),P.status==="completed"&&v.createElement("button",{onClick:async()=>{try{await f(`/projects/${n.id}/response-reviews/${P.id}/report`,`${n.name}_\u54CD\u5E94\u6587\u4EF6\u6838\u67E5\u8BB0\u5F55_${P.id.slice(0,8)}.md`)}catch(s){_(s.message)}}},"\u4E0B\u8F7D\u6838\u67E5\u8BB0\u5F55")),v.createElement("details",null,v.createElement("summary",null,"\u672C\u6B21\u6838\u67E5\u6750\u6599\u4E0E\u5173\u6CE8\u70B9"),v.createElement("ul",null,P.files.map((s,U)=>v.createElement("li",{key:U},s.role,"\uFF1A",s.name))),v.createElement("p",null,P.focus||"\u65E0\u8865\u5145\u5173\u6CE8\u70B9")),P.status==="running"&&v.createElement("p",{role:"status",className:"df-alert"},"\u6B63\u5728\u8BFB\u53D6\u5E76\u6838\u67E5\u6750\u6599\uFF0C\u53EF\u5173\u95ED\u6B64\u7A97\u53E3\uFF0C\u7A0D\u540E\u56DE\u5230\u672C\u9879\u76EE\u67E5\u770B\u7ED3\u679C\u3002"),P.error&&v.createElement("p",{role:"alert",className:"df-alert error"},P.error),P.report&&v.createElement("div",{className:"df-review-report"},z?v.createElement(z,{remarkPlugins:He.host.remarkGfm?[He.host.remarkGfm]:[],components:{a:({children:s})=>v.createElement("span",null,s),img:()=>null}},P.report):v.createElement("div",{style:{whiteSpace:"pre-wrap"}},P.report))))):v.createElement("p",{role:"status"},"\u6B63\u5728\u8BFB\u53D6\u6838\u67E5\u8BB0\u5F55\u2026"))}var Te=window.QwenPaw,l=Te.host.React,{useState:Ce,useEffect:Re,useRef:pt}=l;function wt(n,g,p){return{artifact:{id:g.id+p.name,title:p.name,source:"generated",extension:p.name.endsWith(".xlsx")?"xlsx":"docx",mimeType:p.name.endsWith(".xlsx")?"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":"application/vnd.openxmlformats-officedocument.wordprocessingml.document",binaryUrl:p.preview_url,printUrl:`/document-forms/cases/${n.case_id}/print/${g.id}/${encodeURIComponent(p.name)}`,agentId:Te.host.getSelectedAgentId?.(),createdAt:Date.parse(g.created_at)},reference:{case_id:n.case_id,generation_id:g.id,name:p.name}}}function yt({project:n,stageId:g,selection:p,services:b}){let{request:f,json:x,time:m}=b,[h,r]=Ce([]),[N,u]=Ce(""),[$,B]=Ce(!1),[Z,o]=Ce(""),[L,T]=Ce(0),E=pt(null);Re(()=>{let _=!0,w;async function Q(){try{let A=await f(`/projects/${n.id}/assistant`);if(!_)return;r(A.messages),o(""),A.messages.some(P=>P.status==="running")&&(w=setTimeout(Q,2500))}catch(A){_&&o(A.message)}}return Q(),()=>{_=!1,clearTimeout(w)}},[n.id,L]),Re(()=>{E.current?.scrollIntoView?.({block:"nearest"})},[h.length,h.at(-1)?.status]);let I=$||h.some(_=>_.status==="running"),F=Te.host.ReactMarkdown;async function D(_){if(_.preventDefault(),!(!N.trim()||I)){B(!0),o("");try{let w=await f(`/projects/${n.id}/assistant`,x({message:N.trim(),stage_id:g||"overview",file:p?.reference||{}}));r(Q=>[...Q,w]),u(""),T(Q=>Q+1)}catch(w){o(w.message)}finally{B(!1)}}}return l.createElement("section",{className:"df-project-chat","aria-label":"\u9879\u76EE\u667A\u80FD\u4F53\u95EE\u7B54"},l.createElement("p",{className:"df-muted"},"\u7ED3\u5408\u5DF2\u4FDD\u5B58\u7684\u9879\u76EE\u8D44\u6599\u548C\u5F53\u524D\u9884\u89C8\u56DE\u7B54\uFF0C\u95EE\u7B54\u968F\u9879\u76EE\u4FDD\u7559\u3002"),l.createElement("div",{className:"df-chat-messages","aria-live":"polite"},!h.length&&l.createElement("div",{className:"df-chat-welcome"},l.createElement("h3",null,"\u56F4\u7ED5\u5F53\u524D\u9879\u76EE\u63D0\u95EE"),l.createElement("p",null,"\u53EF\u4EE5\u68B3\u7406\u672C\u9636\u6BB5\u8FD8\u9700\u51C6\u5907\u7684\u6750\u6599\uFF0C\u6216\u5BF9\u7167\u9884\u89C8\u6587\u4EF6\u6838\u5B9E\u5185\u5BB9\u3002"),["\u672C\u9636\u6BB5\u8FD8\u9700\u8981\u51C6\u5907\u54EA\u4E9B\u6750\u6599\uFF1F","\u5E2E\u6211\u6838\u5BF9\u5F53\u524D\u6587\u4EF6\u4E2D\u7684\u65E5\u671F\u548C\u91D1\u989D\u3002"].map(_=>l.createElement("button",{key:_,onClick:()=>u(_)},_))),h.map(_=>l.createElement("article",{className:"df-chat-turn",key:_.id},l.createElement("div",{className:"df-chat-question"},l.createElement("small",null,"\u6211 \xB7 ",m(_.created_at)),l.createElement("p",null,_.message),_.file_name&&l.createElement("small",null,"\u53C2\u8003\u6587\u4EF6\uFF1A",_.file_name)),_.reply&&l.createElement("div",{className:"df-chat-answer"},l.createElement("small",null,"\u9879\u76EE\u52A9\u624B"),F?l.createElement(F,{remarkPlugins:Te.host.remarkGfm?[Te.host.remarkGfm]:[],components:{img:()=>null,a:({children:w})=>l.createElement("span",null,w)}},_.reply):l.createElement("p",{style:{whiteSpace:"pre-wrap"}},_.reply)),_.status==="running"&&l.createElement("p",{role:"status",className:"df-muted"},"\u6B63\u5728\u7ED3\u5408\u9879\u76EE\u8D44\u6599\u6574\u7406\u56DE\u7B54\u2026"),_.error&&l.createElement("p",{role:"alert",className:"df-alert error"},_.error))),l.createElement("div",{ref:E})),Z&&l.createElement("p",{role:"alert",className:"df-alert error"},Z,l.createElement("button",{onClick:()=>T(_=>_+1)},"\u91CD\u65B0\u52A0\u8F7D")),l.createElement("form",{className:"df-chat-composer",onSubmit:D},p&&l.createElement("small",{className:"df-chat-context"},"\u53C2\u8003\u6587\u4EF6\uFF1A",p.artifact.title),l.createElement("textarea",{"aria-label":"\u5411\u9879\u76EE\u667A\u80FD\u4F53\u63D0\u95EE",placeholder:"\u8F93\u5165\u5F53\u524D\u9879\u76EE\u7684\u95EE\u9898\u2026",rows:3,maxLength:4e3,value:N,onChange:_=>u(_.target.value)}),l.createElement("div",{className:"df-actions"},l.createElement("button",{className:"df-primary",disabled:I||!N.trim()},I?"\u6B63\u5728\u56DE\u7B54\u2026":"\u53D1\u9001\u95EE\u9898"))))}function et({collapsed:n=!1,width:g,maxWidth:p,onResize:b,onToggle:f,project:x,stageId:m,services:h,mode:r,onMode:N,selection:u,onSelect:$,attachment:B,AttachmentPreview:Z,onChanged:o,dirty:L=!1}){let T=pt(null),[E,I]=Ce(!1),F=()=>{T.current=null,I(!1)},[D,_]=Ce(null),[w,Q]=Ce("");async function A(z,S){try{Q(""),await h.download(z,S)}catch(s){Q(s.message)}}Re(()=>{let z=!0;return(Te.workspace?.loadPreview?Te.workspace.loadPreview():Promise.resolve(ce)).then(S=>z&&_(()=>S)).catch(()=>z&&_(()=>ce)),()=>{z=!1}},[]);let P=x.forms.flatMap(z=>z.generations.flatMap(S=>m&&m!=="overview"&&m!=="profile"&&(S.stage_id||z.original_stage_id||z.stage_id)!==m?[]:[{form:z,generation:S}]));return l.createElement("aside",{className:"df-right-workspace"+(n?" df-pane-collapsed":"")+(E?" df-resizing":""),"aria-label":"\u9879\u76EE\u667A\u80FD\u4F53\u4E0E\u6587\u4EF6\u9884\u89C8"},l.createElement("div",{className:"df-dock-resizer",role:"separator","aria-label":"\u8C03\u6574\u95EE\u7B54\u4E0E\u9884\u89C8\u680F\u5BBD\u5EA6","aria-orientation":"vertical","aria-valuemin":300,"aria-valuemax":p,"aria-valuenow":g,"aria-valuetext":g+" \u50CF\u7D20",tabIndex:0,title:"\u5DE6\u53F3\u62D6\u52A8\u8C03\u6574\u5BBD\u5EA6\uFF1B\u53CC\u51FB\u6062\u590D\u9ED8\u8BA4\u5BBD\u5EA6",onPointerDown:z=>{z.button===0&&(z.preventDefault(),T.current={x:z.clientX,width:g,pointer:z.pointerId},z.currentTarget.setPointerCapture?.(z.pointerId),I(!0))},onPointerMove:z=>{T.current&&T.current.pointer===z.pointerId&&b(T.current.width+T.current.x-z.clientX)},onPointerUp:F,onPointerCancel:F,onLostPointerCapture:F,onDoubleClick:()=>b(500),onKeyDown:z=>{let S={ArrowLeft:g+24,ArrowRight:g-24,Home:300,End:p}[z.key];S!==void 0&&(z.preventDefault(),b(S))}}),l.createElement("button",{className:"df-pane-toggle","aria-label":n?"\u5C55\u5F00\u95EE\u7B54\u4E0E\u9884\u89C8\u680F":"\u6536\u8D77\u95EE\u7B54\u4E0E\u9884\u89C8\u680F","aria-expanded":!n,title:n?"\u5C55\u5F00\u95EE\u7B54\u4E0E\u9884\u89C8\u680F":"\u6536\u8D77\u95EE\u7B54\u4E0E\u9884\u89C8\u680F",onClick:f},l.createElement("span",{"aria-hidden":"true"},n?"\u2039":"\u203A"),l.createElement("span",null,n?"\u95EE\u7B54\u4E0E\u9884\u89C8":"\u6536\u8D77")),l.createElement("header",null,l.createElement("div",null,l.createElement("span",{className:"df-eyebrow"},"\u9879\u76EE\u5DE5\u4F5C\u533A"),l.createElement("h2",null,r==="preview"?"\u6587\u4EF6\u9884\u89C8":r==="review"?"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5":"\u667A\u80FD\u4F53\u95EE\u7B54")),l.createElement("div",{className:"df-dock-tabs",role:"tablist","aria-label":"\u53F3\u4FA7\u5DE5\u4F5C\u533A"},l.createElement("button",{role:"tab","aria-selected":r==="assistant",onClick:()=>N("assistant")},"\u95EE\u7B54"),l.createElement("button",{role:"tab","aria-selected":r==="preview",onClick:()=>N("preview")},"\u9884\u89C8"))),w&&l.createElement("p",{role:"alert",className:"df-alert error"},w),l.createElement("div",{className:"df-right-body",hidden:r!=="assistant"},l.createElement(yt,{project:x,stageId:["overview","profile"].includes(m)?"overview":m,selection:u,services:h}),m==="negotiation"&&l.createElement("button",{className:"df-open-review",onClick:()=>N("review")},"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5 \u2192")),l.createElement("div",{className:"df-right-body",hidden:r!=="review"},l.createElement("button",{className:"df-back-link",onClick:()=>N("assistant")},"\u2190 \u8FD4\u56DE\u95EE\u7B54"),r==="review"&&l.createElement(Be,{key:x.id,project:x,services:h,onChanged:o})),l.createElement("div",{className:"df-right-body df-dock-files",hidden:r!=="preview"},L&&l.createElement("p",{className:"df-alert"},"\u4E2D\u95F4\u8868\u5355\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\uFF0C\u9884\u89C8\u6587\u4EF6\u4FDD\u7559\u751F\u6210\u65F6\u7684\u5185\u5BB9\u3002"),l.createElement("details",{open:!u&&!B,className:"df-dock-file-list"},l.createElement("summary",null,"\u672C\u9636\u6BB5\u6587\u4EF6 \xB7"," ",P.reduce((z,S)=>z+S.generation.files.length,0)," \u4EFD"),P.map(({form:z,generation:S})=>l.createElement("section",{className:"df-generation",key:S.id},l.createElement("div",{className:"df-generation-heading"},l.createElement("h3",null,h.time(S.created_at)," \xB7 \u4FEE\u8BA2"," ",S.revision,S.date_style!=="zh-CN"&&" \xB7 \u539F\u65E5\u671F\u683C\u5F0F",S.naming_style!=="formal"&&" \xB7 \u539F\u6587\u4EF6\u540D"),l.createElement("button",{onClick:()=>A(`/cases/${z.case_id}/outputs/${S.id}/\u5168\u90E8\u6587\u4E66.zip`,S.bundle_name||x.name+"_\u6587\u4E66.zip")},"\u6253\u5305\u4E0B\u8F7D")),S.files.map(s=>l.createElement("div",{className:"df-dock-file-row",key:s.name},l.createElement("button",{className:"df-dock-file","aria-label":s.name,onClick:()=>$(wt(z,S,s))},s.name,l.createElement("small",null,s.recipient," \xB7 ",(s.size/1024).toFixed(0)," KB",s.print_copies>1&&` \xB7 \u5EFA\u8BAE\u6253\u5370 ${s.print_copies} \u4EFD`)),l.createElement("button",{"aria-label":"\u4E0B\u8F7D"+s.name,onClick:()=>A(`/cases/${z.case_id}/outputs/${S.id}/${encodeURIComponent(s.name)}`,s.name)},"\u2193"))))),!P.length&&l.createElement("p",{className:"df-muted"},"\u751F\u6210\u6587\u4E66\u6216\u4ECE\u4E2D\u95F4\u7684\u6750\u6599\u6E05\u5355\u9009\u62E9\u6587\u4EF6\u540E\uFF0C\u5728\u8FD9\u91CC\u9884\u89C8\u3002"),x.forms.filter(z=>z.case_id!==x.form_id).map(z=>l.createElement("button",{className:"df-dock-file",key:z.case_id,onClick:()=>A(`/cases/${z.case_id}/excel`,z.name+"_\u5386\u53F2\u5E95\u7A3F.xlsx")},"\u5386\u53F2\u5E95\u7A3F\uFF1A",z.name," \u2193"))),P.length>0&&l.createElement("p",{className:"df-muted"},"\u6587\u4EF6\u4FDD\u7559\u5404\u6279\u6B21\u751F\u6210\u65F6\u7684\u5185\u5BB9\uFF0C\u4FEE\u6539\u8868\u5355\u540E\u8BF7\u91CD\u65B0\u6838\u5BF9\u751F\u6210\u3002"),B?l.createElement(Z,{key:B.id,file:B,projectId:x.id,download:A,embedded:!0,onClose:()=>$(null)}):u?l.createElement("section",{className:"df-dock-preview","aria-label":"\u6587\u4EF6\u9884\u89C8"},l.createElement("h3",null,u.artifact.title),D&&u.artifact.extension==="xlsx"?l.createElement("div",{className:"df-dock-office"},l.createElement(D,{artifact:u.artifact,readOnly:!0,hostControls:!0})):D?l.createElement(Xe,{key:u.artifact.id,artifact:u.artifact},l.createElement(D,{artifact:u.artifact,readOnly:!0,hostControls:!0})):l.createElement("p",{role:"status"},"\u6B63\u5728\u6253\u5F00\u9884\u89C8\u2026"),l.createElement("button",{className:"df-dock-ask",onClick:()=>N("assistant")},"\u5C31\u6B64\u6587\u4EF6\u63D0\u95EE \u2192"),l.createElement("button",{className:"df-dock-ask",onClick:()=>A(`/cases/${u.reference.case_id}/outputs/${u.reference.generation_id}/${encodeURIComponent(u.reference.name)}`,u.artifact.title)},"\u4E0B\u8F7D\u5F53\u524D\u6587\u4EF6")):l.createElement("p",{className:"df-dock-empty"},"\u9009\u62E9\u4E00\u4EFD\u6587\u4EF6\uFF0C\u586B\u5199\u4E0E\u9884\u89C8\u53EF\u4EE5\u540C\u65F6\u8FDB\u884C\u3002")))}var ze=window.QwenPaw,e=ze.host.React,{useState:q,useEffect:je,useRef:we}=e,tt={pending:"\u672A\u5F00\u59CB",in_progress:"\u8FDB\u884C\u4E2D",submitted:"\u5DF2\u63D0\u4EA4",completed:"\u5DF2\u5B8C\u6210"},ft={pending:"\u5F85\u51C6\u5907",preparing:"\u6574\u7406\u4E2D",ready:"\u5F85\u63D0\u4EA4",submitted:"\u5DF2\u63D0\u4EA4",done:"\u5DF2\u5B8C\u6210",na:"\u4E0D\u9002\u7528"},kt=["\u4E0A\u62A5\u8BA1\u5212","\u9009\u5546\u8BBA\u8BC1","\u5546\u52A1\u8C08\u5224","\u5F00\u9898\u8BBA\u8BC1","\u5408\u540C\u5BA1\u67E5","\u7ED3\u9898\u9A8C\u6536","\u5F52\u6863\u4ED8\u6B3E"],mt=n=>n?new Date(n).toLocaleString("zh-CN",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}):"";function Oe({title:n,children:g,onClose:p,error:b,busy:f=!1}){let x=we(null);return je(()=>{let m=document.activeElement;return x.current?.querySelector("input,select,textarea,button")?.focus(),()=>{m?.isConnected&&m.focus()}},[]),e.createElement("div",{className:"df-dialog-backdrop"},e.createElement("section",{ref:x,className:"df-dialog df-paper",role:"dialog","aria-modal":"true","aria-label":n,onKeyDown:m=>{if(m.key==="Escape"&&!f&&(m.stopPropagation(),p()),m.key==="Tab"){let h=[...x.current.querySelectorAll("button,input,textarea,select,a[href]")].filter(r=>!r.disabled);m.shiftKey&&document.activeElement===h[0]&&(m.preventDefault(),h.at(-1)?.focus()),!m.shiftKey&&document.activeElement===h.at(-1)&&(m.preventDefault(),h[0]?.focus())}}},e.createElement("div",{className:"df-section-head"},e.createElement("h2",null,n),e.createElement("button",{type:"button",disabled:f,onClick:p,"aria-label":"\u5173\u95ED"+n},"\xD7")),b&&e.createElement("p",{role:"alert",className:"df-alert error"},b),g))}function ct({file:n,projectId:g,download:p,onClose:b,embedded:f=!1}){let[x,m]=q(null),[h,r]=q(""),[N,u]=q(""),$=n.name.split(".").pop().toLowerCase(),B=["pdf","png","jpg","jpeg"].includes($)&&!ze.workspace?.loadPreview;je(()=>{let L=!0,T;return B?ze.host.fetch(`/document-forms/projects/${g}/files/${n.id}`).then(async E=>{if(!E.ok)throw new Error("\u9884\u89C8\u672A\u80FD\u6253\u5F00\uFF0C\u8BF7\u4E0B\u8F7D\u67E5\u770B");let I=await E.blob();L&&(T=URL.createObjectURL(new Blob([I],{type:n.mime})),r(T))}).catch(E=>L&&u(E.message)):ze.workspace?.loadPreview||["doc","docx","xls","xlsx","ppt","pptx"].includes($)?(ze.workspace?.loadPreview?ze.workspace.loadPreview():Promise.resolve(ce)).then(E=>L&&m(()=>E)).catch(()=>L&&m(()=>ce)):u("\u6B64\u683C\u5F0F\u8BF7\u4E0B\u8F7D\u540E\u67E5\u770B\u3002"),()=>{L=!1,T&&URL.revokeObjectURL(T)}},[n.id]);let Z={id:n.id,title:n.name,source:"uploaded",extension:$,mimeType:n.mime,binaryUrl:n.preview_url,agentId:ze.host.getSelectedAgentId?.(),createdAt:Date.parse(n.uploaded_at)};return e.createElement(f?"section":Oe,{...f?{className:"df-dock-preview","aria-label":"\u6587\u4EF6\u9884\u89C8"}:{title:n.name,onClose:b}},f&&e.createElement("h3",null,n.name),e.createElement("div",{className:"df-attachment-preview"},N?e.createElement("p",{role:"alert"},N):B&&h?$==="pdf"?e.createElement("iframe",{title:n.name,src:h,sandbox:"allow-same-origin"}):e.createElement("img",{src:h,alt:n.name}):x?e.createElement(x,{artifact:Z,readOnly:!0,hostControls:!0}):e.createElement("p",{role:"status"},"\u6B63\u5728\u6253\u5F00\u9884\u89C8\u2026")),e.createElement("div",{className:"df-actions"},e.createElement("button",{onClick:()=>p(`/projects/${g}/files/${n.id}`,n.name)},"\u4E0B\u8F7D\u539F\u6587\u4EF6"),e.createElement("button",{onClick:b},"\u5173\u95ED\u9884\u89C8")))}function at({Editor:n,services:g}){let{request:p,json:b,download:f,Field:x}=g,[m,h]=q([]),[r,N]=q(null),[u,$]=q("overview"),[B,Z]=q(""),[o,L]=q(null),[T,E]=q(!1),[I,F]=q(!1),[D,_]=q(""),[w,Q]=q(""),[A,P]=q(""),[z,S]=q(""),[s,U]=q(null),[C,M]=q({}),[R,X]=q([]),[W,ee]=q(null),[ne,Ke]=q(!1),[Ae,Ge]=q(!1),[ge,te]=q(()=>{try{let a=Number(window.localStorage.getItem("ugsci.document-forms.right-width"));return Number.isFinite(a)&&a>=300&&a<=3e3?a:500}catch{return 500}}),[Ve,ye]=q(1200),H=we(null);je(()=>{let a=H.current;if(!a||!r?.single_form)return;let c=()=>{let G=a.getBoundingClientRect().width;if(G<=850)return;let Ie=a.querySelector(".df-project-sidebar").getBoundingClientRect().width,_e=Math.max(300,Math.floor(G-Ie-(window.innerWidth<=1050?380:440)));ye(_e),te(ht=>Math.min(_e,Math.max(300,ht)))};c();let j=typeof ResizeObserver=="function"?new ResizeObserver(c):null;return j?.observe(a),window.addEventListener("resize",c),()=>{j?.disconnect(),window.removeEventListener("resize",c)}},[ne,r?.single_form]),je(()=>{try{window.localStorage.setItem("ugsci.document-forms.right-width",String(ge))}catch{}},[ge]);let pe=a=>te(Math.min(Ve,Math.max(300,Math.round(a)))),[ke,he]=q(null),[re,de]=q("assistant"),V=we(!0),oe=we(0),$e=we(null),Ue=we(null),Se=we(""),se=we(null),be=we(null);be.current=r?.id,je(()=>{se.current?.scrollTo?.({top:0})},[r?.id,u,o?.id]);let Me=ze.host.useTheme?.()||"light",y=r?.stages.find(a=>a.id===u),Ee=r?.forms.filter(a=>a.stage_id===u)||[],J=(r?.stages.find(a=>a.id==="plan")?.materials.flatMap(a=>a.files).filter(a=>a.approval_review)||[]).at(-1),We=r?.stages.find(a=>a.id==="plan")?.materials.find(a=>/批复|审批|回执/.test(a.name)),qe=()=>!T&&!I||window.confirm("\u8D44\u6599\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\uFF0C\u662F\u5426\u653E\u5F03\u8FD9\u4E9B\u4FEE\u6539\u5E76\u79BB\u5F00\uFF1F");async function Ne(){let a=await p("/projects");return V.current&&h(a),a}async function le(a=r?.id,c=!1){let j=a?await p("/projects/"+a):null;return V.current&&j&&(c||!be.current||be.current===a)&&(be.current!==j.id&&(ee(null),he(null),de("assistant")),be.current=j.id,N(G=>G?.id===j.id&&G.revision>j.revision?G:j)),await Ne(),j}je(()=>(V.current=!0,Q("\u8F7D\u5165\u9879\u76EE"),Ne().then(async a=>{if(a.length&&V.current){let c=await p("/projects/"+a[0].id);V.current&&N(c)}}).catch(a=>V.current&&P(a.message)).finally(()=>V.current&&Q("")),()=>{V.current=!1,oe.current++}),[]),je(()=>{let a=c=>{(T||I)&&(c.preventDefault(),c.returnValue="")};return window.addEventListener("beforeunload",a),()=>window.removeEventListener("beforeunload",a)},[T,I]);async function Y(a,c){if(w)return;let j=++oe.current;Q(a),P(""),S("");try{await c()}catch(G){V.current&&j===oe.current&&P(G.message)}finally{V.current&&j===oe.current&&Q("")}}async function fe(a){qe()&&await Y("\u6253\u5F00\u9879\u76EE",async()=>{L(null),E(!1),F(!1),$("overview"),await le(a,!0),L(null),E(!1),F(!1),ee(null),he(null),de("assistant"),$("overview")})}async function i(a){qe()&&($(a),L(null),E(!1),F(!1),S(""),P(""),r.single_form&&r.stages.some(c=>c.id===a)&&await Y("\u6253\u5F00\u9879\u76EE\u8868\u5355",async()=>{let c=await p(`/projects/${r.id}/form`,b({revision:r.revision,stage_id:a}));await le(),L({id:c.id,view:"edit",revision:c.revision,initialDraft:c})}))}function d(a,c){M(c),U(a),P("")}async function k(a,c,j="POST"){let G=await p(a,{...b({...c,revision:r.revision}),method:j});return V.current&&(N(G),U(null)),await Ne(),G}function K(a){return Y(a?"\u8BFB\u53D6\u9636\u6BB5 Excel":"\u51C6\u5907\u8C08\u5224\u8868\u5355",async()=>{let c;if(a){let j=new FormData;j.append("revision",r.revision),j.append("stage_id",u),j.append("workbook",a),c=await p(`/projects/${r.id}/${r.single_form?"form":"cases"}/import`,{method:"POST",body:j})}else c=await p(`/projects/${r.id}/${r.single_form?"form":"cases"}`,b({revision:r.revision,stage_id:u}));await le(),L({id:c.id,view:"edit",revision:c.revision,initialDraft:r.single_form?c:void 0}),E(!1),a&&S(c.templates.length?"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\uFF0C\u5E76\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002":"\u5DF2\u8BFB\u53D6\u672C\u9636\u6BB5\u53D8\u91CF\u914D\u7F6E\uFF0C\u8BF7\u6DFB\u52A0\u5BF9\u5E94\u7684 Word \u6A21\u677F\u3002")})}function De(a){if(!a)return;let c=Se.current;return Y("\u4FDD\u5B58\u6750\u6599",async()=>{let j=new FormData;j.append("revision",r.revision),j.append("file",a);let G=await p(`/projects/${r.id}/stages/${u}/materials/${c}/files`,{method:"POST",body:j});N(G),await Ne();let Ie=G.stages.find(_e=>_e.id===u)?.materials.flatMap(_e=>_e.files).find(_e=>_e.name===a.name);S(Ie?.approval_review?.status==="ready"?`\u5BA1\u6279\u6587\u4EF6\u5DF2\u4FDD\u5B58\uFF0C\u5E76\u8BC6\u522B\u51FA ${Ie.approval_review.fields.length} \u9879\u5BA1\u6279\u7ED3\u679C\u3002`:"\u6750\u6599\u5DF2\u4FDD\u5B58\uFF0C\u539F\u6709\u7248\u672C\u7EE7\u7EED\u4FDD\u7559\u3002\u8BF7\u6838\u5BF9\u540E\u66F4\u65B0\u6750\u6599\u72B6\u6001\u3002")})}let me=r?`/projects/${r.id}`:"",Ze=a=>{a.preventDefault(),Y("\u4FDD\u5B58\u6750\u6599\u4FE1\u606F",()=>k(`${me}/stages/${u}/materials${C.id?"/"+C.id:""}`,C,C.id?"PUT":"POST"))},rt=a=>Y("\u6574\u7406\u4E0B\u8F7D\u5305",()=>f(me+"/bundle"+(a?"?stage_id="+a:""),`${r.name}_${a?y.title:"\u5168\u6D41\u7A0B\u6750\u6599"}.zip`));return e.createElement("main",{ref:H,style:{"--df-dock-size":ge+"px"},className:"df-app df-project-app"+(r?.single_form?" df-three-column":"")+(ne?" df-left-collapsed":"")+(Ae?" df-right-collapsed":""),"data-theme":Me},e.createElement("style",null,ot),e.createElement("input",{ref:$e,type:"file",accept:".xlsx",hidden:!0,"aria-label":"\u5BFC\u5165\u9636\u6BB5 Excel",onChange:a=>{let c=a.target.files[0];a.target.value="",c&&K(c)}}),e.createElement("input",{ref:Ue,type:"file",accept:".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.png,.jpg,.jpeg,.zip,.txt,.csv",hidden:!0,"aria-label":"\u4E0A\u4F20\u9636\u6BB5\u6750\u6599",onChange:a=>{let c=a.target.files[0];a.target.value="",De(c)}}),e.createElement("aside",{className:"df-sidebar df-project-sidebar"+(ne?" df-pane-collapsed":""),"aria-label":"\u9879\u76EE\u9009\u62E9"},e.createElement("button",{className:"df-pane-toggle","aria-label":ne?"\u5C55\u5F00\u9879\u76EE\u680F":"\u6536\u8D77\u9879\u76EE\u680F","aria-expanded":!ne,title:ne?"\u5C55\u5F00\u9879\u76EE\u680F":"\u6536\u8D77\u9879\u76EE\u680F",onClick:()=>Ke(a=>!a)},e.createElement("span",{"aria-hidden":"true"},ne?"\u203A":"\u2039"),e.createElement("span",null,ne?"\u9879\u76EE":"\u6536\u8D77")),e.createElement("div",{className:"df-brand"},"UGSci ",e.createElement("span",null,"\u9879\u76EE\u6750\u6599")),e.createElement("button",{className:"df-primary df-new",disabled:!!w||!!D,onClick:()=>{qe()&&d("create",{name:"",code:"",owner:""})}},"\uFF0B \u65B0\u5EFA\u9879\u76EE"),e.createElement("label",{className:"df-project-search"},e.createElement("span",{className:"df-sr-only"},"\u641C\u7D22\u9879\u76EE"),e.createElement("input",{"aria-label":"\u641C\u7D22\u9879\u76EE",placeholder:"\u641C\u7D22\u9879\u76EE\u540D\u79F0\u6216\u7F16\u53F7",value:B,onChange:a=>Z(a.target.value)})),e.createElement("div",{className:"df-caption"},"\u6211\u7684\u9879\u76EE ",e.createElement("span",null,m.length)),e.createElement("nav",{"aria-label":"\u9879\u76EE\u5217\u8868"},m.filter(a=>(a.name+" "+a.code).toLowerCase().includes(B.toLowerCase())).map(a=>e.createElement("button",{key:a.id,disabled:!!w||!!D,"aria-current":r?.id===a.id?"page":void 0,onClick:()=>fe(a.id)},e.createElement("b",null,a.name),e.createElement("small",null,a.code||"\u672A\u8BBE\u7F16\u53F7"," \xB7 ",a.completed,"/7 \u9636\u6BB5\u5B8C\u6210")))),e.createElement("div",{className:"df-sidebar-foot"},e.createElement("b",null,"\u914D\u5957\u6A21\u677F"),e.createElement("p",null,"\u4E0A\u62A5\u8BA1\u5212\u3001\u9009\u5546\u8BBA\u8BC1\u3001\u5546\u52A1\u8C08\u5224\u548C\u7ED3\u9898\u9A8C\u6536\u5DF2\u914D\u597D\u9ED8\u8BA4\u6A21\u677F\uFF0C\u5176\u4F59\u9636\u6BB5\u53EF\u63A5\u5165\u5404\u81EA\u7684\u7EDF\u4E00\u6A21\u677F\u3002"),e.createElement("button",{disabled:!!w||!!D,onClick:()=>Y("\u4E0B\u8F7D\u914D\u5957\u6A21\u677F",()=>f("/starter","\u6587\u4E66\u586B\u62A5_\u914D\u5957\u6A21\u677F.zip"))},"\u4E0B\u8F7D\u914D\u5957\u6A21\u677F \u2197"),e.createElement("small",null,"\u7A7A\u767D Excel \u4E0E 11 \u4EFD\u6807\u51C6\u6587\u4E66"))),e.createElement("section",{className:"df-main df-project-main",ref:se},e.createElement("header",{className:"df-header"},e.createElement("div",null,e.createElement("span",{className:"df-eyebrow"},"UGSCI / \u9879\u76EE\u6750\u6599"),e.createElement("h1",null,r?.name||"\u9879\u76EE\u5DE5\u4F5C\u53F0"),e.createElement("p",null,r?[r.code||"\u672A\u8BBE\u9879\u76EE\u7F16\u53F7",r.owner&&"\u7ECF\u529E\u4EBA\uFF1A"+r.owner].filter(Boolean).join("\u3000\xB7\u3000"):"\u4ECE\u4E0A\u62A5\u8BA1\u5212\u5230\u5F52\u6863\u4ED8\u6B3E\uFF0C\u628A\u540C\u4E00\u9879\u76EE\u7684\u8D44\u6599\u653E\u5728\u4E00\u8D77\u3002")),r&&e.createElement("div",{className:"df-actions"},e.createElement("button",{disabled:!!w||!!D||!!o,onClick:()=>i("profile")},"\u57FA\u7840\u4FE1\u606F\u586B\u62A5"),e.createElement("button",{disabled:!!w||!!D,onClick:()=>rt()},"\u4E0B\u8F7D\u9879\u76EE\u6750\u6599"))),A&&e.createElement("div",{role:"alert",className:"df-alert error"},A,e.createElement("button",{"aria-label":"\u5173\u95ED\u9519\u8BEF\u63D0\u793A",onClick:()=>P("")},"\xD7")),z&&e.createElement("div",{className:"df-alert",role:"status"},z),w&&e.createElement("div",{className:"df-progress",role:"status"},w,"\u2026"),r?e.createElement(e.Fragment,null,e.createElement("nav",{className:"df-project-tabs","aria-label":"\u9879\u76EE\u9636\u6BB5"},e.createElement("button",{className:u==="overview"?"active":"",disabled:!!w||!!D,onClick:()=>i("overview")},"\u9879\u76EE\u603B\u89C8"),r.stages.map((a,c)=>e.createElement("button",{key:a.id,"aria-current":u===a.id?"step":void 0,className:u===a.id?"active":"",disabled:!!w||!!D,onClick:()=>i(a.id)},e.createElement("small",null,String(c+1).padStart(2,"0")),a.title,e.createElement("span",{className:"df-state df-state-"+a.status},a.upstream_changed.length||a.documents_changed?"\u5F85\u590D\u6838":tt[a.status])))),o?e.createElement(n,{key:r.id+":"+o.id+":"+u+":"+(o.revision||""),project:r,workflowStage:y,initialCaseId:o.id,initialView:o.view,initialDraft:o.initialDraft,onDirtyChange:E,onBusyChange:_,onViewChange:()=>se.current?.scrollTo?.({top:0}),onBack:()=>{L(null),E(!1),le().catch(a=>P(a.message))},onChanged:()=>le(),docked:r.single_form,onEditBasics:()=>{L(null),E(!1),_(""),$("profile")},onStageStatus:()=>d("stage",{...y,confirmed:!1}),onPreview:a=>{he(a),ee(null),de("preview")}}):e.createElement("fieldset",{className:"df-content",disabled:!!w||!!D},u==="overview"&&e.createElement(e.Fragment,null,r.migrated&&e.createElement("p",{className:"df-muted df-migration-note"},"\u5386\u53F2\u586B\u62A5\u5DF2\u6309\u9879\u76EE\u540D\u79F0\u6216\u7F16\u53F7\u5F52\u5165\u5546\u52A1\u8C08\u5224\u9636\u6BB5\uFF0C\u539F\u8868\u5355\u3001\u751F\u6210\u6279\u6B21\u548C\u6587\u4EF6\u5747\u4FDD\u7559\u3002"),e.createElement("section",{className:"df-project-metrics"},e.createElement("div",null,e.createElement("b",null,r.stages.filter(a=>a.status==="completed").length,e.createElement("small",null,"/ ",r.stages.length)),e.createElement("span",null,"\u5DF2\u5B8C\u6210\u9636\u6BB5")),e.createElement("div",null,e.createElement("b",null,r.stages.reduce((a,c)=>a+c.materials.filter(j=>!["done","na"].includes(j.status)).length,0)),e.createElement("span",null,"\u5F85\u6574\u7406\u6750\u6599")),e.createElement("div",null,e.createElement("b",null,r.forms.reduce((a,c)=>a+c.outputs,0)),e.createElement("span",null,"\u5DF2\u751F\u6210\u6587\u4EF6")),e.createElement("div",null,e.createElement("b",null,r.stages.filter(a=>a.upstream_changed.length||a.documents_changed).length),e.createElement("span",null,"\u5F85\u590D\u6838\u9636\u6BB5"))),e.createElement("div",{className:"df-project-stage-grid"},r.stages.map((a,c)=>e.createElement("button",{className:"df-paper df-stage-card",key:a.id,onClick:()=>i(a.id)},e.createElement("div",{className:"df-section-head"},e.createElement("small",null,"\u9636\u6BB5 ",String(c+1).padStart(2,"0")),e.createElement("span",{className:"df-state df-state-"+a.status},tt[a.status])),e.createElement("h2",null,a.title),e.createElement("p",null,a.purpose),e.createElement("footer",null,e.createElement("span",null,a.materials.filter(j=>["done","na"].includes(j.status)).length,"/",a.materials.length," \u9879\u6750\u6599\u5DF2\u5904\u7406"),e.createElement("span",null,a.upstream_changed.length||a.documents_changed?"\u6709\u53D8\u66F4\u5F85\u590D\u6838":a.due_date?"\u8BA1\u5212 "+a.due_date:"\u8FDB\u5165\u9636\u6BB5 \u2192"))))),e.createElement("section",{className:"df-paper df-project-hint"},e.createElement("h2",null,"\u4E00\u4EFD\u9879\u76EE\u5E95\u7A3F\uFF0C\u8D2F\u7A7F\u5404\u9636\u6BB5"),e.createElement("p",null,"\u9879\u76EE\u540D\u79F0\u3001\u7814\u7A76\u5185\u5BB9\u3001\u6210\u679C\u6307\u6807\u548C\u9884\u7B97\u7B49\u53EF\u5728\u201C\u57FA\u7840\u4FE1\u606F\u586B\u62A5\u201D\u7EDF\u4E00\u7EF4\u62A4\u3002\u9636\u6BB5\u8868\u5355\u4ECE\u5E95\u7A3F\u53D6\u503C\uFF0C\u540E\u7EED\u53D8\u66F4\u4F1A\u63D0\u9192\u6838\u5BF9\uFF1B\u5DF2\u6709\u751F\u6210\u6587\u4EF6\u4FDD\u7559\u539F\u6837\u3002"),e.createElement("button",{onClick:()=>i("profile")},"\u586B\u5199\u57FA\u7840\u4FE1\u606F"))),u==="profile"&&e.createElement(Nt,{onDirtyChange:F,key:r.id+":"+r.revision,project:r,Field:x,onSave:a=>Y("\u4FDD\u5B58\u57FA\u7840\u4FE1\u606F",async()=>{await k(me,a,"PUT"),S("\u57FA\u7840\u4FE1\u606F\u5DF2\u66F4\u65B0\u3002\u5DF2\u6709\u8868\u5355\u53EF\u9010\u9879\u6838\u5BF9\u540E\u540C\u6B65\uFF0C\u539F\u751F\u6210\u6587\u4EF6\u4E0D\u53D8\u3002")})}),y&&e.createElement(e.Fragment,null,e.createElement("section",{className:"df-paper df-stage-header"},e.createElement("div",null,e.createElement("div",{className:"df-eyebrow"},"\u9636\u6BB5\u6750\u6599"),e.createElement("h2",null,y.title),e.createElement("p",null,y.purpose),e.createElement("p",{className:"df-muted"},r.single_form&&y.id==="plan"?"\u5DF2\u63A5\u5165\u79D1\u7814\u8BA1\u5212\u586B\u62A5\u8868\u4E0E\u5916\u534F\u5FC5\u8981\u6027\u8BF4\u660E\uFF0C\u53EF\u76F4\u63A5\u586B\u5199\u5E76\u751F\u6210\u3002":y.id==="selection"?"\u5DF2\u63A5\u5165\u8BBA\u8BC1\u610F\u89C1\u53CA\u7B7E\u5B57\u8868\u4E0E\u975E\u62DB\u6807\u65B9\u6848\u586B\u62A5\u8868\uFF0C\u53EF\u5148\u51C6\u5907\u8BBA\u8BC1\u6750\u6599\uFF0C\u8BBA\u8BC1\u7ED3\u675F\u540E\u6838\u5BF9\u7CFB\u7EDF\u586B\u62A5\u4FE1\u606F\u3002":y.id==="negotiation"?"\u4E94\u4EFD\u6807\u51C6\u6A21\u677F\u5DF2\u63A5\u5165\uFF0C\u53EF\u76F4\u63A5\u586B\u5199\uFF0C\u4E5F\u53EF\u5BFC\u5165\u73B0\u6709 Excel\u3002":"\u7EDF\u4E00\u6A21\u677F\u5F85\u8865\u5145\uFF1B\u73B0\u9636\u6BB5\u53EF\u6574\u7406\u6750\u6599\u3001\u4E0A\u4F20\u6587\u4EF6\uFF0C\u6216\u5BFC\u5165\u5DF2\u6709 Excel \u4E0E Word \u6A21\u677F\u3002")),e.createElement("div",{className:"df-actions"},e.createElement("button",{onClick:()=>rt(y.id)},"\u4E0B\u8F7D\u672C\u9636\u6BB5\u6750\u6599"),e.createElement("button",{onClick:()=>d("stage",{...y,confirmed:!1})},"\u529E\u7406\u4FE1\u606F\u4E0E\u72B6\u6001"))),(y.upstream_changed.length>0||y.documents_changed)&&e.createElement("div",{className:"df-alert df-stage-warning"},e.createElement("div",null,e.createElement("b",null,"\u672C\u9636\u6BB5\u6709\u8D44\u6599\u9700\u8981\u590D\u6838"),e.createElement("p",null,y.upstream_changed.length>0&&"\u524D\u5E8F\u9636\u6BB5\u5DF2\u66F4\u65B0\uFF1A"+y.upstream_changed.join("\u3001")+"\u3002",y.documents_changed&&"\u672C\u9636\u6BB5\u8868\u5355\u6216\u751F\u6210\u6587\u4EF6\u6709\u66F4\u65B0\u3002","\u8BF7\u6838\u5BF9\u5DF2\u63D0\u4EA4\u7684\u6750\u6599\u662F\u5426\u9700\u8981\u8C03\u6574\u3002")),e.createElement("button",{onClick:()=>Y("\u8BB0\u5F55\u590D\u6838",()=>k(`${me}/stages/${y.id}/acknowledge`,{}))},"\u5DF2\u6838\u5BF9\u53D8\u66F4")),(y.system_name||y.due_date||y.submission_ref||y.notes)&&e.createElement("section",{className:"df-paper df-stage-details"},e.createElement("dl",null,e.createElement("div",null,e.createElement("dt",null,"\u8BA1\u5212\u65E5\u671F"),e.createElement("dd",null,y.due_date||"\u672A\u8BBE\u7F6E")),e.createElement("div",null,e.createElement("dt",null,"\u529E\u7406\u7CFB\u7EDF"),e.createElement("dd",null,y.system_url?e.createElement("a",{href:y.system_url,target:"_blank",rel:"noopener noreferrer"},y.system_name||"\u6253\u5F00\u529E\u7406\u7CFB\u7EDF"," \u2197"):y.system_name||"\u672A\u8BB0\u5F55")),e.createElement("div",null,e.createElement("dt",null,"\u63D0\u4EA4\u7F16\u53F7 / \u56DE\u6267"),e.createElement("dd",null,y.submission_ref||"\u672A\u8BB0\u5F55"))),y.notes&&e.createElement("p",null,y.notes)),e.createElement("section",{className:"df-paper df-stage-forms"},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,r.single_form?"\u9879\u76EE\u8868\u5355":"\u586B\u5199\u4E0E\u751F\u6210"),e.createElement("p",{className:"df-muted"},"\u8868\u5355\u6CBF\u7528\u9879\u76EE\u5E95\u7A3F\uFF0C\u6838\u5BF9\u540E\u751F\u6210\u3002\u5DF2\u6709\u6279\u6B21\u4FDD\u7559\u751F\u6210\u65F6\u7684\u5185\u5BB9\u3002")),e.createElement("div",{className:"df-actions"},(y.id==="negotiation"||r.single_form)&&e.createElement("button",{className:"df-primary",onClick:()=>K()},r.single_form?"\u6253\u5F00\u9879\u76EE\u8868\u5355":"\u586B\u5199\u8C08\u5224\u6750\u6599"),e.createElement("button",{onClick:()=>$e.current.click()},"\u5BFC\u5165 Excel \u8868\u5355"))),r.single_form?e.createElement("p",{className:"df-muted"},"\u6BCF\u4E2A\u9879\u76EE\u5171\u7528\u4E00\u4EFD\u8868\u5355\uFF0C\u4E03\u4E2A\u9636\u6BB5\u5404\u529E\u7406\u4E00\u6B21\u3002\u5DF2\u6709\u6587\u4E66\u4E0E\u5386\u53F2\u5E95\u7A3F\u53EF\u5728\u53F3\u4FA7\u67E5\u770B\u3002"):Ee.length?e.createElement("div",{className:"df-project-forms"},Ee.map(a=>e.createElement("div",{key:a.case_id},e.createElement("div",null,e.createElement("b",null,a.name),e.createElement("small",null,mt(a.updated_at)," \xB7"," ",a.outputs?a.outputs+" \u4EFD\u6587\u4EF6":"\u586B\u5199\u4E2D",a.shared_changes.length>0&&" \xB7 \u57FA\u7840\u4FE1\u606F\u6709\u66F4\u65B0")),e.createElement("div",{className:"df-actions"},e.createElement("button",{onClick:()=>L({id:a.case_id,view:"edit"})},"\u6253\u5F00\u8868\u5355"),a.outputs>0&&e.createElement("button",{onClick:()=>L({id:a.case_id,view:"files"})},"\u67E5\u770B\u751F\u6210\u6587\u4EF6"))))):e.createElement("p",{className:"df-empty"},"\u672C\u9636\u6BB5\u8FD8\u6CA1\u6709\u8868\u5355\u3002\u5DF2\u6709\u6210\u54C1\u6587\u4EF6\u53EF\u76F4\u63A5\u4E0A\u4F20\u5230\u4E0B\u9762\u7684\u6750\u6599\u6E05\u5355\u3002")),y.id==="negotiation"&&e.createElement("section",{className:"df-paper df-review-entry"},e.createElement("div",null,e.createElement("h2",null,"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5"),e.createElement("p",{className:"df-muted"},"\u5BF9\u7167\u6B63\u5F0F\u8C08\u5224\u6587\u4EF6\uFF0C\u68C0\u67E5\u5404\u5355\u4F4D\u54CD\u5E94\u6750\u6599\uFF0C\u6C47\u603B\u95EE\u9898\u3001\u4F9D\u636E\u548C\u5F85\u786E\u8BA4\u4E8B\u9879\u3002")),e.createElement("button",{onClick:()=>r.single_form?de("review"):d("response-review",{})},"\u6253\u5F00\u6838\u67E5\u667A\u80FD\u4F53 \u2192")),y.id==="plan"&&e.createElement("section",{className:"df-paper df-approval-entry"},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,"\u8BA1\u5212\u5BA1\u6279\u7ED3\u679C\u6838\u5BF9"),e.createElement("p",{className:"df-muted"},"\u4E0A\u4F20\u6B63\u5F0F\u5BA1\u6279 PDF \u540E\uFF0C\u6309\u660E\u786E\u5B57\u6BB5\u4E0E\u5F53\u524D\u8D44\u6599\u6BD4\u5BF9\u3002\u66F4\u6B63\u524D\u4F1A\u9010\u9879\u786E\u8BA4\u3002")),e.createElement("div",{className:"df-actions"},J?.approval_review?.status==="ready"&&e.createElement("button",{onClick:()=>{let a=J.approval_review.fields.filter(c=>c.changed).map(c=>c.key);X(a),U("approval")}},"\u67E5\u770B\u6BD4\u5BF9\u7ED3\u679C \u2192"),e.createElement("button",{disabled:!We,onClick:()=>{Se.current=We.id,Ue.current.click()}},"\u4E0A\u4F20\u5BA1\u6279\u6587\u4EF6"))),J?J.approval_review.status==="ready"?e.createElement("p",null,"\u6279\u590D\u65E5\u671F"," ",J.approval_review.approved_at," \xB7 \u5DF2\u8BC6\u522B"," ",J.approval_review.fields.length," \u9879 \xB7",J.approval_review.change_count?`\u53D1\u73B0 ${J.approval_review.change_count} \u9879\u5DEE\u5F02`:"\u4E0E\u5F53\u524D\u8D44\u6599\u4E00\u81F4"):e.createElement("p",{role:"status"},J.approval_review.message):e.createElement("p",null,"\u8BF7\u5728\u4E0B\u65B9\u201C\u8BA1\u5212\u6279\u590D\u6216\u7CFB\u7EDF\u56DE\u6267\u201D\u4E2D\u4E0A\u4F20\u5BA1\u6279\u6587\u4EF6\u3002")),e.createElement("section",{className:"df-paper df-material-panel"},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,"\u6750\u6599\u6E05\u5355 ",e.createElement("small",null,y.materials.length)),e.createElement("p",{className:"df-muted"},"\u5148\u6309\u5E38\u7528\u6750\u6599\u5217\u51FA\uFF0C\u53EF\u4FEE\u6539\u540D\u79F0\u3001\u589E\u8865\u6750\u6599\u6216\u6807\u4E3A\u4E0D\u9002\u7528\u3002\u201C\u5DF2\u63D0\u4EA4\u201D\u7531\u7ECF\u529E\u4EBA\u6838\u5B9E\u540E\u8BB0\u5F55\u3002")),e.createElement("button",{onClick:()=>d("material",{name:"",status:"pending",required:!1,note:""})},"\uFF0B \u6DFB\u52A0\u6750\u6599")),e.createElement("div",{className:"df-materials"},y.materials.map(a=>{let c=Ee.reduce((j,G)=>j+(G.generations[0]?.files.filter(Ie=>Ie.name.includes(a.name)).length||0),0);return e.createElement("article",{className:"df-material-row",key:a.id},e.createElement("div",{className:"df-material-name"},e.createElement("b",null,a.name),a.required&&e.createElement("span",{className:"df-required-tag"},"\u5FC5\u5907"),e.createElement("span",{className:"df-state df-material-state-"+a.status},ft[a.status]),c>0&&e.createElement("small",null,"\u5DF2\u6709 ",c," \u4EFD\u751F\u6210\u7A3F \xB7 \u5728\u4E0A\u65B9\u8868\u5355\u67E5\u770B"),a.note&&e.createElement("p",null,a.note)),e.createElement("div",{className:"df-material-files"},a.files.length>0?e.createElement("details",null,e.createElement("summary",null,a.files.length," \u4EFD\u6587\u4EF6 / \u7248\u672C \xB7 \u6700\u65B0\uFF1A",a.files[a.files.length-1].name),[...a.files].reverse().map((j,G)=>e.createElement("div",{className:"df-material-file",key:j.id},e.createElement("div",null,e.createElement("b",null,"V",a.files.length-G," \xB7"," ",j.name),e.createElement("small",null,mt(j.uploaded_at)," \xB7"," ",Math.max(1,Math.round(j.size/1024))," ","KB")),e.createElement("button",{onClick:()=>{ee(j),he({artifact:{title:j.name},reference:{file_id:j.id}}),de("preview")}},"\u9884\u89C8"),e.createElement("button",{"aria-label":"\u4E0B\u8F7D"+j.name+"\u7248\u672C"+(a.files.length-G),onClick:()=>Y("\u4E0B\u8F7D\u6750\u6599",()=>f(`${me}/files/${j.id}`,j.name))},"\u4E0B\u8F7D")))):e.createElement("span",{className:"df-muted"},"\u5C1A\u672A\u4E0A\u4F20\u6587\u4EF6")),e.createElement("div",{className:"df-actions"},e.createElement("button",{"aria-label":"\u4E0A\u4F20"+a.name,onClick:()=>{Se.current=a.id,Ue.current.click()}},"\u4E0A\u4F20\u6587\u4EF6"),e.createElement("button",{"aria-label":"\u7F16\u8F91"+a.name,onClick:()=>d("material",{...a})},"\u7F16\u8F91")))}))),e.createElement("div",{className:"df-stage-tail"},e.createElement("p",null,"\u5404\u9636\u6BB5\u53EF\u5E76\u884C\u51C6\u5907\uFF1B\u524D\u5E8F\u8D44\u6599\u53D8\u5316\u540E\uFF0C\u540E\u7EED\u9636\u6BB5\u4F1A\u63D0\u793A\u590D\u6838\u3002\u9636\u6BB5\u5B8C\u6210\u7531\u7ECF\u529E\u4EBA\u786E\u8BA4\u3002"),e.createElement("button",{onClick:()=>d("stage",{...y,confirmed:!1})},"\u66F4\u65B0\u529E\u7406\u72B6\u6001"))))):e.createElement("section",{className:"df-paper df-project-welcome"},e.createElement("h2",null,"\u5148\u5EFA\u4E00\u4E2A\u9879\u76EE"),e.createElement("p",null,"\u5171\u7528\u8D44\u6599\u53EA\u6574\u7406\u4E00\u6B21\uFF0C\u8868\u5355\u4E0E\u9644\u4EF6\u6309\u9636\u6BB5\u5F52\u96C6\uFF0C\u751F\u6210\u7A3F\u4E0E\u5B9A\u7A3F\u5206\u522B\u7559\u75D5\u3002"),e.createElement("div",{className:"df-welcome-stages"},kt.map((a,c)=>e.createElement("span",{key:a},e.createElement("small",null,String(c+1).padStart(2,"0")),a))),e.createElement("button",{className:"df-primary",onClick:()=>d("create",{name:"",code:"",owner:""})},"\u5EFA\u7ACB\u7B2C\u4E00\u4E2A\u9879\u76EE"))),r?.single_form&&e.createElement(et,{key:r.id,collapsed:Ae,width:ge,maxWidth:Ve,onResize:pe,onToggle:()=>Ge(a=>!a),project:r,stageId:u,services:g,mode:re,onMode:de,selection:ke,attachment:W,AttachmentPreview:ct,dirty:T,onSelect:a=>{he(a),ee(null),de("preview")},onChanged:()=>le().catch(a=>P(a.message))}),s==="response-review"&&e.createElement(Oe,{title:"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5",onClose:()=>{U(null),le().catch(a=>P(a.message))}},e.createElement(Be,{project:r,services:g,onChanged:()=>le().catch(a=>P(a.message))})),s==="approval"&&J&&e.createElement(Oe,{title:"\u6838\u5BF9\u8BA1\u5212\u5BA1\u6279\u7ED3\u679C",busy:!!w,error:A,onClose:()=>U(null)},e.createElement("p",{className:"df-muted"},"\u6765\u6E90\uFF1A",J.name," \xB7 \u6279\u590D\u65E5\u671F"," ",J.approval_review.approved_at,"\u3002\u4EC5\u52FE\u9009\u7684\u5DEE\u5F02\u4F1A\u5199\u56DE\u9879\u76EE\u8D44\u6599\u548C\u4E0A\u62A5\u8BA1\u5212\u8868\u5355\u3002"),e.createElement("div",{className:"df-compare df-approval-compare"},J.approval_review.fields.map(a=>e.createElement("label",{key:a.key},e.createElement("input",{type:"checkbox","aria-label":"\u91C7\u7528\u5BA1\u6279\u7ED3\u679C\uFF1A"+a.label,disabled:!a.changed,checked:R.includes(a.key),onChange:c=>X(c.target.checked?[...R,a.key]:R.filter(j=>j!==a.key))}),e.createElement("div",null,e.createElement("b",null,a.label,!a.changed&&e.createElement("small",null," \u4E00\u81F4")),e.createElement("div",{className:"df-compare-values"},e.createElement("p",null,e.createElement("small",null,"\u5F53\u524D\u8D44\u6599"),a.current||"\u7A7A\u767D"),e.createElement("p",null,e.createElement("small",null,"\u5BA1\u6279\u7ED3\u679C"),a.value||"\u7A7A\u767D")))))),e.createElement("div",{className:"df-actions"},e.createElement("button",{disabled:!!w,onClick:()=>U(null)},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!w||!R.length,onClick:()=>Y("\u91C7\u7528\u5BA1\u6279\u7ED3\u679C",async()=>{let a=await p(`${me}/stages/plan/approval/apply`,b({revision:r.revision,file_id:J.id,keys:R}));N(a),U(null),X([]),await Ne(),S("\u5DF2\u91C7\u7528\u6240\u9009\u5BA1\u6279\u7ED3\u679C\u3002\u540E\u7EED\u9636\u6BB5\u4F1A\u63D0\u793A\u91CD\u65B0\u6838\u5BF9\u53D7\u5F71\u54CD\u8D44\u6599\u3002")})},"\u91C7\u7528\u6240\u9009 ",R.length," \u9879"))),s==="create"&&e.createElement(Oe,{title:"\u65B0\u5EFA\u9879\u76EE",busy:!!w,error:A,onClose:()=>U(null)},e.createElement("form",{onSubmit:a=>{a.preventDefault(),Y("\u5EFA\u7ACB\u9879\u76EE",async()=>{let c=await p("/projects",b(C));ee(null),he(null),de("assistant"),N(c),$("overview"),L(null),E(!1),U(null),await Ne()})}},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u540D\u79F0"),e.createElement("input",{"aria-label":"\u65B0\u9879\u76EE\u540D\u79F0",required:!0,maxLength:120,value:C.name,onChange:a=>M({...C,name:a.target.value})})),e.createElement("div",{className:"df-fields"},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u7F16\u53F7"),e.createElement("input",{"aria-label":"\u65B0\u9879\u76EE\u7F16\u53F7",maxLength:100,value:C.code,onChange:a=>M({...C,code:a.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u7ECF\u529E\u4EBA"),e.createElement("input",{"aria-label":"\u65B0\u9879\u76EE\u7ECF\u529E\u4EBA",maxLength:100,value:C.owner,onChange:a=>M({...C,owner:a.target.value})}))),e.createElement("p",{className:"df-muted"},"\u5EFA\u7ACB\u9879\u76EE\u540E\uFF0C\u53EF\u6574\u7406\u5171\u7528\u8D44\u6599\uFF0C\u518D\u6309\u4E03\u4E2A\u9636\u6BB5\u51C6\u5907\u6750\u6599\u3002"),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",disabled:!!w||!!D,onClick:()=>U(null)},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!w||!C.name?.trim(),type:"submit"},"\u5EFA\u7ACB\u9879\u76EE")))),s==="material"&&e.createElement(Oe,{title:"\u6750\u6599\u4FE1\u606F",busy:!!w,error:A,onClose:()=>U(null)},e.createElement("form",{onSubmit:Ze},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u6750\u6599\u540D\u79F0"),e.createElement("input",{"aria-label":"\u6750\u6599\u540D\u79F0",required:!0,maxLength:150,value:C.name,onChange:a=>M({...C,name:a.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u6750\u6599\u72B6\u6001"),e.createElement("select",{"aria-label":"\u6750\u6599\u72B6\u6001",value:C.status,onChange:a=>M({...C,status:a.target.value})},Object.entries(ft).map(([a,c])=>e.createElement("option",{key:a,value:a},c)))),e.createElement("label",{className:"df-checkbox"},e.createElement("input",{type:"checkbox",checked:C.required,onChange:a=>M({...C,required:a.target.checked})}),"\u672C\u9879\u76EE\u7684\u5FC5\u5907\u6750\u6599\uFF0C\u9636\u6BB5\u5B8C\u6210\u524D\u9700\u786E\u8BA4\u5DF2\u5B8C\u6210\u6216\u4E0D\u9002\u7528"),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u6750\u6599\u8BF4\u660E"),e.createElement("textarea",{"aria-label":"\u6750\u6599\u8BF4\u660E",rows:3,maxLength:3e3,value:C.note,onChange:a=>M({...C,note:a.target.value})})),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",onClick:()=>U(null),disabled:!!w||!!D},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!w||!!D,type:"submit"},"\u4FDD\u5B58\u6750\u6599\u4FE1\u606F")))),s==="stage"&&e.createElement(Oe,{title:y.title+"\u529E\u7406\u4FE1\u606F",busy:!!w,error:A,onClose:()=>U(null)},e.createElement("form",{onSubmit:a=>{a.preventDefault(),Y("\u4FDD\u5B58\u529E\u7406\u4FE1\u606F",()=>k(`${me}/stages/${u}`,C,"PUT"))}},e.createElement("div",{className:"df-fields"},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9636\u6BB5\u72B6\u6001"),e.createElement("select",{"aria-label":"\u9636\u6BB5\u72B6\u6001",value:C.status,onChange:a=>M({...C,status:a.target.value})},Object.entries(tt).map(([a,c])=>e.createElement("option",{key:a,value:a},c)))),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u8BA1\u5212\u65E5\u671F"),e.createElement("input",{"aria-label":"\u9636\u6BB5\u8BA1\u5212\u65E5\u671F",type:"date",value:C.due_date,onChange:a=>M({...C,due_date:a.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u529E\u7406\u7CFB\u7EDF"),e.createElement("input",{"aria-label":"\u529E\u7406\u7CFB\u7EDF",maxLength:150,value:C.system_name,onChange:a=>M({...C,system_name:a.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u7CFB\u7EDF\u5730\u5740"),e.createElement("input",{"aria-label":"\u7CFB\u7EDF\u5730\u5740",type:"url",placeholder:"https://",maxLength:1e3,value:C.system_url,onChange:a=>M({...C,system_url:a.target.value})}))),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u63D0\u4EA4\u7F16\u53F7 / \u56DE\u6267\u4FE1\u606F"),e.createElement("input",{"aria-label":"\u63D0\u4EA4\u7F16\u53F7",maxLength:500,value:C.submission_ref,onChange:a=>M({...C,submission_ref:a.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u529E\u7406\u8BF4\u660E"),e.createElement("textarea",{"aria-label":"\u529E\u7406\u8BF4\u660E",rows:4,maxLength:5e3,value:C.notes,onChange:a=>M({...C,notes:a.target.value})})),e.createElement("p",{className:"df-muted"},"\u8BB0\u5F55\u7EBF\u4E0B\u6216\u4E1A\u52A1\u7CFB\u7EDF\u7684\u5B9E\u9645\u529E\u7406\u7ED3\u679C\uFF0C\u56DE\u6267\u6587\u4EF6\u53EF\u4E0A\u4F20\u5230\u6750\u6599\u6E05\u5355\u3002"),C.status==="completed"&&e.createElement(e.Fragment,null,e.createElement("p",{className:"df-muted"},y.missing_required.length>0?"\u5C1A\u672A\u529E\u7ED3\u7684\u5FC5\u5907\u6750\u6599\uFF1A"+y.missing_required.join("\u3001"):"\u8BF7\u786E\u8BA4\u9636\u6BB5\u6750\u6599\u548C\u524D\u5E8F\u53D8\u66F4\u5DF2\u6838\u5BF9\u3002"),e.createElement("label",{className:"df-checkbox"},e.createElement("input",{"aria-label":"\u786E\u8BA4\u672C\u9636\u6BB5\u5DF2\u529E\u7ED3",type:"checkbox",checked:C.confirmed,onChange:a=>M({...C,confirmed:a.target.checked})}),"\u5DF2\u6838\u5BF9\u672C\u9636\u6BB5\u6750\u6599\u53CA\u524D\u5E8F\u53D8\u66F4\uFF0C\u786E\u8BA4\u672C\u9636\u6BB5\u5DF2\u529E\u7ED3")),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",onClick:()=>U(null),disabled:!!w||!!D},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!w||C.status==="completed"&&!C.confirmed,type:"submit"},"\u4FDD\u5B58\u529E\u7406\u4FE1\u606F")))),W&&!r.single_form&&e.createElement(ct,{key:W.id,file:W,projectId:r.id,download:(a,c)=>Y("\u4E0B\u8F7D\u539F\u6587\u4EF6",()=>f(a,c)),onClose:()=>ee(null)}))}function Nt({project:n,Field:g,onSave:p,onDirtyChange:b}){let[f,x]=q(n.fields),[m,h]=q({name:n.name,code:n.code,owner:n.owner});return je(()=>{b(JSON.stringify(f)!==JSON.stringify(n.fields)||m.name!==n.name||m.code!==n.code||m.owner!==n.owner)},[f,m]),e.createElement("form",{className:"df-paper df-project-profile",onSubmit:r=>{r.preventDefault(),p({...m,values:Object.fromEntries(f.map(N=>[N.key,N.value]))})}},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,"\u57FA\u7840\u4FE1\u606F\u586B\u62A5"),e.createElement("p",{className:"df-muted"},"\u5404\u9636\u6BB5\u8868\u5355\u590D\u7528\u8FD9\u91CC\u7684\u8D44\u6599\uFF1B\u9636\u6BB5\u65E5\u671F\u3001\u8BC4\u5BA1\u5206\u6570\u548C\u4ED8\u6B3E\u7ED3\u679C\u5206\u522B\u8BB0\u5F55\u3002")),e.createElement("button",{className:"df-primary",type:"submit"},"\u4FDD\u5B58\u57FA\u7840\u4FE1\u606F")),e.createElement("div",{className:"df-fields"},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u540D\u79F0"),e.createElement("input",{"aria-label":"\u9879\u76EE\u540D\u79F0",required:!0,value:m.name,maxLength:120,onChange:r=>h({...m,name:r.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u7F16\u53F7"),e.createElement("input",{"aria-label":"\u9879\u76EE\u7F16\u53F7",value:m.code,maxLength:100,onChange:r=>h({...m,code:r.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u7ECF\u529E\u4EBA"),e.createElement("input",{"aria-label":"\u7ECF\u529E\u4EBA",value:m.owner,maxLength:100,onChange:r=>h({...m,owner:r.target.value})}))),[...new Set(f.filter(r=>!["project.name","project.code"].includes(r.key)).map(r=>r.group))].map(r=>e.createElement("section",{className:"df-group",key:r},e.createElement("h3",null,r),e.createElement("div",{className:"df-fields"},f.filter(N=>N.group===r&&!["project.name","project.code"].includes(N.key)).map(N=>e.createElement(g,{key:N.key,field:{...N,required:!1},onChange:u=>x(f.map($=>$.key===N.key?{...$,value:u}:$))}))))),e.createElement("div",{className:"df-actions"},e.createElement("button",{className:"df-primary",type:"submit"},"\u4FDD\u5B58\u57FA\u7840\u4FE1\u606F")))}var ue=window.QwenPaw,t=ue.host.React,{useState:ae,useEffect:Le,useLayoutEffect:_t,useRef:Fe}=t,it="/document-forms",Ct="application/vnd.openxmlformats-officedocument.wordprocessingml.document";async function ie(n,g){let p=await ue.host.fetch(it+n,g);if(!p.ok){let b=await p.json().catch(()=>({}));throw new Error(typeof b.detail=="string"?b.detail:Array.isArray(b.detail)?b.detail.map(f=>`${f.loc?.slice(1).join(".")||"\u8D44\u6599"}\uFF1A${f.msg}`).join("\uFF1B"):`\u64CD\u4F5C\u672A\u5B8C\u6210\uFF08${p.status}\uFF09\uFF0C\u8BF7\u68C0\u67E5\u586B\u5199\u5185\u5BB9`)}return p.json()}async function Ye(n,g){let p=await ue.host.fetch(it+n);if(!p.ok)throw new Error("\u6587\u4EF6\u4E0B\u8F7D\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5");let b=URL.createObjectURL(await p.blob()),f=document.createElement("a");f.href=b,f.download=g,document.body.appendChild(f);try{f.click()}finally{f.remove(),setTimeout(()=>URL.revokeObjectURL(b),1e3)}}var Pe=n=>({method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)}),Qe=n=>new Date(n).toLocaleString("zh-CN",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}),ut=n=>n.kind==="textarea"||n.value.length>100||n.value.includes(`
`)||n.label.includes("\u6574\u6BB5"),zt=n=>/^(research\.contents|deliverables\.|metrics\.|milestones\.)/.test(n.key)||/主要研究内容|预期成果|考核指标|进度安排/.test(n.label);function Je(n){return n.map((g,p)=>{let b={...g};for(let f of["start","end"]){let x="follow_"+f;b[x]=p>0&&(typeof b[x]=="boolean"?b[x]:!b[f]),b[x]&&(b[f]=n[0][f])}return b})}function jt({field:n,onChange:g}){let p=["","",""],b=0;for(let f of n.value.split(/\r?\n/)){let x=f.match(/^\s*([1-3])[.、．)）]\s?(.*)$/);x?p[Number(x[1])-1]=x[2]:b<3&&(p[b++]=f)}return t.createElement("div",{className:"df-plan-partners",id:"df-plan.partners",role:"group","aria-label":n.label},t.createElement("span",null,n.label),p.map((f,x)=>t.createElement("label",{className:"df-field",key:x},t.createElement("span",null,"\u5355\u4F4D",x+1),t.createElement("input",{"aria-label":`\u5355\u4F4D${x+1}`,type:"text",value:f,onChange:m=>{let h=p.map((r,N)=>N===x?m.target.value:r);g(h.some(r=>r.trim())?h.map((r,N)=>`${N+1}. ${r}`).join(`
`):"")}}))),t.createElement("small",null,"\u4E09\u5BB6\u5355\u4F4D\u5206\u522B\u586B\u5199\uFF0C\u4E0E\u5546\u52A1\u8C08\u5224\u9636\u6BB5\u7684\u53D7\u9080\u5355\u4F4D\u5206\u5F00\u4FDD\u5B58\u3002"))}function gt({field:n,displayValue:g,onChange:p}){let b=n.key!=="plan.notes"&&ut(n),f=zt(n),x=["date","datetime-local"].includes(n.kind)?n.value:g??n.value,m=Fe(null);return _t(()=>{if(!m.current)return;let h=m.current.scrollTop;m.current.style.height="auto",m.current.style.height=Math.max(f?104:192,m.current.scrollHeight)+"px",m.current.scrollTop=h},[x,b,f]),n.key==="plan.partners"?t.createElement(jt,{field:n,onChange:p}):t.createElement("label",{className:"df-field"+(b?" df-field-paragraph":"")+(f?" df-field-compact":""),id:"df-"+n.key},t.createElement("span",null,n.label,n.required&&t.createElement("em",null,"\u5FC5\u586B")),n.options?t.createElement("select",{"aria-label":n.label,value:x,onChange:h=>p(h.target.value)},t.createElement("option",{value:""},"\u8BF7\u9009\u62E9"),x&&!n.options.includes(x)&&t.createElement("option",{value:x,disabled:!0},x,"\uFF08\u8BF7\u91CD\u65B0\u9009\u62E9\uFF09"),n.options.map(h=>t.createElement("option",{key:h,value:h},h))):b?t.createElement("textarea",{ref:m,"aria-label":n.label,rows:f?3:8,value:x,onChange:h=>p(h.target.value)}):t.createElement("input",{"aria-label":n.label,type:n.key==="plan.notes"?"text":n.kind,readOnly:!!n.read_only,step:n.kind==="number"?"any":void 0,value:x,onChange:h=>p(h.target.value)}),n.help&&t.createElement("small",{className:"df-field-help"},n.help),t.createElement("small",null,n.key))}function Pt({fields:n,onChange:g}){let p=n.filter(f=>/^selection\.member\d+_name$/.test(f.key));if(!p.length)return null;let b={unit:["\u5730\u4E0B\u7A7A\u95F4\u5229\u7528\u7814\u7A76\u6240",...n.filter(f=>["contact.department","project.executing_unit"].includes(f.key)).map(f=>f.value)],title:["\u526F\u6240\u957F/\u9AD8\u5DE5","\u4F01\u4E1A\u9AD8\u7EA7\u4E13\u5BB6/\u9AD8\u5DE5","\u90E8\u95E8\u8D1F\u8D23\u4EBA/\u9AD8\u5DE5","\u4E00\u7EA7\u5DE5\u7A0B\u5E08/\u9AD8\u5DE5","\u9AD8\u7EA7\u5DE5\u7A0B\u5E08","\u5DE5\u7A0B\u5E08","\u6559\u6388","\u526F\u6559\u6388"],category:["\u4E3B\u4EFB","\u526F\u4E3B\u4EFB","\u79D1\u59D4\u4F1A\u6210\u5458","\u4E13\u5BB6","\u7EC4\u957F","\u6210\u5458"]};return t.createElement("section",{className:"df-group df-selection-members","aria-label":"\u8BBA\u8BC1\u6210\u5458"},t.createElement("h3",null,"\u8BBA\u8BC1\u6210\u5458"),t.createElement("p",{className:"df-muted"},"\u6BCF\u4EBA\u4E00\u884C\u3002\u5355\u4F4D\u3001\u804C\u52A1/\u804C\u79F0\u548C\u7C7B\u522B\u53EF\u9009\u62E9\uFF0C\u4E5F\u53EF\u76F4\u63A5\u8F93\u5165\u3002"),t.createElement("div",{className:"df-member-scroll"},t.createElement("table",{className:"df-member-table"},t.createElement("thead",null,t.createElement("tr",null,t.createElement("th",{scope:"col"},"\u5E8F\u53F7"),t.createElement("th",{scope:"col"},"\u59D3\u540D"),t.createElement("th",{scope:"col"},"\u5355\u4F4D"),t.createElement("th",{scope:"col"},"\u804C\u52A1/\u804C\u79F0"),t.createElement("th",{scope:"col"},"\u7C7B\u522B"))),t.createElement("tbody",null,p.map((f,x)=>{let m=f.key.replace(/name$/,"");return t.createElement("tr",{key:f.key},t.createElement("th",{scope:"row"},String(x+1).padStart(2,"0")),["name","unit","title","category"].map(h=>{let r=n.find($=>$.key===m+h);if(!r)return t.createElement("td",{key:h});let N=h==="name"?[]:[...new Set([...b[h],...n.filter($=>new RegExp(`^selection\\.member\\d+_${h}$`).test($.key)).map($=>$.value)].filter(Boolean))],u="df-options-"+r.key;return t.createElement("td",{key:h},t.createElement("input",{"aria-label":r.label,value:r.value,list:N.length?u:void 0,autoComplete:"off",onChange:$=>g(r.key,$.target.value)}),N.length>0&&t.createElement("datalist",{id:u},N.map($=>t.createElement("option",{value:$,key:$}))))}))})))))}function $t({project:n,workflowStage:g,initialCaseId:p,initialView:b,initialDraft:f,onBack:x,onChanged:m,onDirtyChange:h,onBusyChange:r,onViewChange:N,docked:u=!1,onPreview:$,onStageStatus:B,onEditBasics:Z}){let[o,L]=ae(null),[T,E]=ae(null),[I,F]=ae([]),[D,_]=ae("import"),[w,Q]=ae(!1),[A,P]=ae(null),[z,S]=ae(!1),[s,U]=ae(""),[C,M]=ae(""),[R,X]=ae(""),[W,ee]=ae(null),[ne,Ke]=ae(null),Ae=Fe(null),Ge=Fe(null),ge=Fe(0),te=Fe(!0),Ve=ue.host.useTheme?.()||"light",ye=()=>m?.()||Promise.resolve();Le(()=>(te.current=!0,(f?Promise.resolve(f):ie("/cases/"+p)).then(i=>{te.current&&(pe(i),_(b==="files"&&i.generations.length?"files":"edit"),b==="files"&&i.generations.length&&ee({file:i.generations[0].files[0],generation:i.generations[0]}))}).catch(i=>te.current&&M(i.message)),(ue.workspace?.loadPreview?ue.workspace.loadPreview():Promise.resolve(ce)).then(i=>{te.current&&Ke(()=>i)}).catch(i=>{te.current&&Ke(()=>ce)}),()=>{te.current=!1,ge.current++}),[]),Le(()=>{h?.(w)},[w]),Le(()=>{r?.(s)},[s]),Le(()=>{N?.()},[D]),Le(()=>{let i=d=>{w&&(d.preventDefault(),d.returnValue="")};return window.addEventListener("beforeunload",i),()=>window.removeEventListener("beforeunload",i)},[w]);async function H(i,d){if(s)return;let k=++ge.current;U(i),M(""),X("");try{await d()}catch(K){te.current&&k===ge.current&&M(K.message)}finally{te.current&&k===ge.current&&U("")}}function pe(i){te.current&&(L({...i,recipients:Je(i.recipients),presentation_sources:Object.fromEntries(i.fields.map(d=>[d.key,d.value]))}),Q(!1),P(null),S(!1))}function ke(i){L(i),Q(!0),P(null),S(!1),X("")}function he(i,d,k,K=!1){let De=o.recipients.map((me,Ze)=>Ze===i?{...me,[d]:k,...d!=="name"?{["follow_"+d]:K}:{}}:me);ke({...o,recipients:Je(De)})}async function re(){if(!w)return o;let i={revision:o.revision,name:o.name.trim()||"\u672A\u547D\u540D\u586B\u62A5",values:Object.fromEntries(o.fields.map(k=>[k.key,k.value])),recipients:o.recipients},d=await ie("/cases/"+o.id,{...Pe(i),method:"PUT"});return pe(d),d}function de(){return!w||window.confirm("\u5F53\u524D\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\u3002\u79BB\u5F00\u6B64\u8BB0\u5F55\uFF1F")}let V=o?.stage_id==="plan"&&o?.plan_schema===1,oe=o?.stage_id==="selection"&&o?.selection_schema===1,$e=V||oe,Ue=$e?"\u6587\u4E66\u6A21\u677F":"Word \u6A21\u677F",Se=$e?o.fields.filter(i=>i.scope!=="shared"):o?.fields||[],se=o?.templates||[],be=se.reduce((i,d)=>i+(d.per_recipient?o.recipients.length:1),0),Me=(o?.generations||[]).filter(i=>!u||(i.stage_id||o.original_stage_id||g.id)===g.id),y=Me[0];Le(()=>{u&&D==="files"&&y&&!Me.some(i=>i.id===W?.generation.id)&&ee({file:y.files[0],generation:y})},[D,y?.id]);let Ee=A?.checks.filter(i=>i.status!=="ok")||[];async function nt(i){!i||!de()||await H("\u8BFB\u53D6 Excel",async()=>{let d=new FormData;d.append("workbook",i),d.append("revision",n.revision),d.append("stage_id",g.id);let k=await ie(`/projects/${n.id}/${n.single_form?"form":"cases"}/import`,{method:"POST",body:d});pe(k),ee(null),_("edit"),await ye(),X(k.templates.length?"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\uFF0C\u5E76\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002":k.template_notice||"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\u3002\u8BF7\u6DFB\u52A0\u5BF9\u5E94\u7684 Word \u6A21\u677F\u3002")})}async function J(i){i=Array.from(i),i.length&&await H("\u8BFB\u53D6 Word \u6A21\u677F",async()=>{let d=await re(),k=new FormData;k.append("revision",String(d.revision)),Array.from(i).forEach(K=>k.append("files",K)),pe(await ie("/cases/"+d.id+"/templates",{method:"POST",body:k})),await ye(),X("Word \u6A21\u677F\u5DF2\u6DFB\u52A0\uFF0C\u751F\u6210\u65F6\u4F1A\u4FDD\u7559\u539F\u6709\u6392\u7248\u3002")})}async function We(){await H("\u6838\u5BF9\u8D44\u6599",async()=>{let i=await re(),d=await ie("/cases/"+i.id+"/review",Pe({revision:i.revision}));te.current&&(P(d),S(!1),_("review"),await ye())})}async function qe(){await H("\u751F\u6210\u6587\u4E66",async()=>{let i=await ie("/cases/"+o.id+"/generate",Pe({revision:o.revision,review_token:A.review_token,confirmed:z}));pe(i),_("files"),ee({file:i.generations[0].files[0],generation:i.generations[0]}),await ye()})}function Ne(i){_("edit"),requestAnimationFrame(()=>{let d=document.getElementById("df-"+i);d?.scrollIntoView({behavior:"smooth",block:"center"}),d?.querySelector("input,textarea")?.focus()})}let le=(i,d)=>`/cases/${o.id}/outputs/${i.id}/${encodeURIComponent(d)}`;function Y(i){return H("\u6B63\u5728\u4E0B\u8F7D\u538B\u7F29\u5305",async()=>{await Ye(le(i,"\u5168\u90E8\u6587\u4E66.zip"),i.bundle_name||o.name+"_\u6587\u4E66.zip"),X(`\u5DF2\u5F00\u59CB\u4E0B\u8F7D\u8BE5\u6279\u6B21\u7684 ${i.files.length} \u4EFD\u6587\u4E66\u538B\u7F29\u5305\u3002`)})}let fe=W?{id:W.generation.id+W.file.name,title:W.file.name,source:"generated",mimeType:W.file.name.endsWith(".xlsx")?"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":Ct,extension:W.file.name.endsWith(".xlsx")?"xlsx":"docx",binaryUrl:W.file.preview_url,printUrl:it+`/cases/${o.id}/print/${W.generation.id}/${encodeURIComponent(W.file.name)}`,agentId:ue.host.getSelectedAgentId?.(),createdAt:Date.parse(W.generation.created_at)}:null;return Le(()=>{u&&D==="files"&&fe&&$?.({artifact:fe,reference:{case_id:o.id,generation_id:W.generation.id,name:W.file.name}})},[D,W?.generation.id,W?.file.name]),t.createElement("div",{className:"df-app df-embedded-editor","data-theme":Ve},t.createElement("input",{ref:Ae,type:"file",accept:".xlsx",hidden:!0,"aria-label":"\u5BFC\u5165 Excel \u53D8\u91CF\u8868",onChange:i=>{nt(i.target.files[0]),i.target.value=""}}),t.createElement("input",{ref:Ge,type:"file",accept:".docx,.xlsx",multiple:!0,hidden:!0,"aria-label":"\u5BFC\u5165 Word \u6A21\u677F",onChange:i=>{J(i.target.files),i.target.value=""}}),t.createElement("section",{className:"df-main"},t.createElement("div",{className:"df-editor-context"},t.createElement("button",{disabled:!!s,onClick:()=>{de()&&x()}},"\u2190 \u8FD4\u56DE",g.title),t.createElement("span",null,n.name," / ",g.title),u&&t.createElement("button",{disabled:!!s||w,title:w?"\u8BF7\u5148\u4FDD\u5B58\u8868\u5355":"\u66F4\u65B0\u5F53\u524D\u8282\u70B9\u7684\u529E\u7406\u4FE1\u606F",onClick:B},"\u529E\u7406\u4FE1\u606F\u4E0E\u72B6\u6001"),o&&t.createElement("div",{className:"df-actions"},t.createElement("button",{disabled:!!s,onClick:()=>{E("adopt"),F([])}},"\u6838\u5BF9\u9879\u76EE\u8D44\u6599\u5DEE\u5F02"),t.createElement("button",{disabled:!!s,onClick:()=>{E("publish"),F([])}},"\u5B58\u5165\u9879\u76EE\u5E95\u7A3F"))),t.createElement("header",{className:"df-header"},t.createElement("div",null,t.createElement("span",{className:"df-eyebrow"},g.title," / \u586B\u5199\u4E0E\u751F\u6210"),t.createElement("h1",null,o?u?g.title+" \xB7 \u9879\u76EE\u8868\u5355":o.name:"\u628A\u91CD\u590D\u586B\u5199\u7684\u8D44\u6599\uFF0C\u6574\u7406\u6210\u4E00\u5F20\u8868\u3002"),t.createElement("p",null,o?w?"\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539":`\u8349\u7A3F\u5DF2\u4FDD\u5B58 \xB7 ${Qe(o.updated_at)}`:"\u5BFC\u5165\u53D8\u91CF\u8868\u4E0E Word \u6A21\u677F\uFF0C\u586B\u5199\u3001\u6838\u5BF9\uFF0C\u518D\u751F\u6210\u6587\u4E66\u3002")),o&&t.createElement("button",{disabled:!!s||!w,onClick:()=>H("\u4FDD\u5B58\u8349\u7A3F",async()=>{await re(),await ye(),X("\u8349\u7A3F\u5DF2\u4FDD\u5B58")})},"\u4FDD\u5B58\u8349\u7A3F")),t.createElement("div",{className:"df-steps","aria-label":"\u586B\u5199\u6D41\u7A0B"},[["import","01","\u5BFC\u5165\u6A21\u677F"],["edit","02","\u586B\u5199\u8D44\u6599"],["review","03","\u6838\u5BF9\u751F\u6210"],["files","04","\u6587\u4EF6\u9884\u89C8"]].map(([i,d,k])=>t.createElement("button",{key:i,className:D===i?"active":"",disabled:!!s||!o&&i!=="import"||i==="files"&&!y,onClick:()=>i==="review"?We():_(i)},t.createElement("span",null,d),k))),C&&t.createElement("div",{className:"df-alert error",role:"alert"},C,t.createElement("button",{"aria-label":"\u5173\u95ED\u9519\u8BEF\u63D0\u793A",onClick:()=>M("")},"\xD7")),R&&t.createElement("div",{className:"df-alert",role:"status"},R),s&&t.createElement("div",{className:"df-progress",role:"status"},s,"\u2026"),t.createElement("fieldset",{className:"df-content",disabled:!!s},D==="import"&&t.createElement("div",{className:"df-import"},t.createElement("section",{className:"df-paper df-drop"},t.createElement("div",{className:"df-file-mark"},"XLSX"),t.createElement("h2",null,"\u4ECE Excel \u53D8\u91CF\u8868\u5F00\u59CB"),t.createElement("p",null,"\u201C\u53D8\u91CF\u914D\u7F6E\u201D\u5DE5\u4F5C\u8868\u4FDD\u7559\u4E09\u5217\uFF1A",t.createElement("br",null),t.createElement("b",null,"\u53D8\u91CF\u540D\u79F0\u3000\u4E2D\u6587\u540D\u79F0\u3000\u503C")),t.createElement("button",{className:"df-primary",onClick:()=>Ae.current.click()},"\u9009\u62E9 Excel \u53D8\u91CF\u8868"),t.createElement("small",null,"\u652F\u6301 .xlsx \xB7 \u5355\u4E2A\u6587\u4EF6\u4E0D\u8D85\u8FC7 15 MB")),t.createElement("section",{className:"df-paper df-import-note"},t.createElement("span",{className:"df-eyebrow"},"\u5982\u4F55\u51C6\u5907"),t.createElement("h2",null,"\u4E00\u4EFD\u6570\u636E\uFF0C\u591A\u4EFD\u6587\u4E66"),t.createElement("ol",null,t.createElement("li",null,t.createElement("b",null,"\u6574\u7406\u53D8\u91CF"),t.createElement("p",null,"\u4F8B\u5982 project.name / \u9879\u76EE\u540D\u79F0 / \u5B9E\u9645\u540D\u79F0\u3002\u652F\u6301\u5206\u7EC4\u3001\u7C7B\u578B\u548C\u5FC5\u586B\u5217\u3002")),t.createElement("li",null,t.createElement("b",null,"\u81EA\u52A8\u8F7D\u5165\u6A21\u677F"),t.createElement("p",null,"\u5E94\u7528\u81EA\u5E26 5 \u4EFD\u6807\u51C6 Word \u6A21\u677F\uFF0C\u4F7F\u7528\u914D\u5957 Excel \u5373\u53EF\u81EA\u52A8\u8F7D\u5165\uFF1B \u4E5F\u53EF\u6DFB\u52A0\u81EA\u5DF1\u7684\u6A21\u677F\u3002")),t.createElement("li",null,t.createElement("b",null,"\u5206\u522B\u751F\u6210\u9080\u8BF7\u51FD"),t.createElement("p",null,"\u5728\u201C\u53D7\u9080\u5355\u4F4D\u201D\u8868\u8BB0\u5F55\u5355\u4F4D\u540D\u79F0\u3001\u9886\u53D6\u5F00\u59CB\u65F6\u95F4\u548C\u9886\u53D6\u7ED3\u675F\u65F6\u95F4\u3002"))),t.createElement("p",{className:"df-muted"},"\u201C\u65E5\u671F\u6821\u6838\u201D\u8868\u4E2D\u7684\u65E7\u7ED3\u679C\u4E0D\u4F1A\u4F5C\u4E3A\u5224\u65AD\u4F9D\u636E\uFF1B\u5E94\u7528\u4F1A\u6839\u636E\u5F53\u524D\u586B\u5199\u5185\u5BB9\u91CD\u65B0\u6838\u5BF9\u3002\u201C\u6821\u6838\u89C4\u5219\u201D\u8868\u53EF\u8865\u5145\u81EA\u5B9A\u4E49\u5148\u540E\u5173\u7CFB\u3002"))),o&&D==="edit"&&t.createElement("div",{className:"df-edit-layout"},t.createElement("section",{className:"df-paper"},t.createElement("div",{className:"df-section-head"},t.createElement("h2",null,"\u586B\u5199\u4FE1\u606F"),t.createElement("button",{onClick:()=>H("\u5BFC\u51FA Excel",async()=>{let i=await re();await Ye(`/cases/${i.id}/excel`,(i.fields.find(d=>d.key==="project.name")?.value||i.name).replace(/[<>:"/\\|?*\x00-\x1f]/g,"_").slice(0,80)+"_\u586B\u5199\u6570\u636E.xlsx")})},"\u5BFC\u51FA\u5F53\u524D Excel")),t.createElement("label",{className:"df-field df-title-field"},t.createElement("span",null,"\u8868\u5355\u540D\u79F0"),t.createElement("input",{"aria-label":"\u8868\u5355\u540D\u79F0",maxLength:120,value:o.name,onChange:i=>ke({...o,name:i.target.value})})),$e&&t.createElement("section",{className:"df-plan-reference","aria-label":"\u5F15\u7528\u7684\u57FA\u7840\u4FE1\u606F"},t.createElement("div",{className:"df-section-head"},t.createElement("div",null,t.createElement("h3",null,"\u5F15\u7528\u7684\u57FA\u7840\u4FE1\u606F"),t.createElement("p",{className:"df-muted"},"\u8FD9\u4E9B\u8D44\u6599\u7531\u57FA\u7840\u4FE1\u606F\u586B\u62A5\u7EF4\u62A4\uFF0C\u6838\u5BF9\u540E\u7528\u4E8E\u672C\u6B21\u751F\u6210\u3002")),Z&&t.createElement("button",{onClick:()=>H("\u4FDD\u5B58\u5E76\u6253\u5F00\u57FA\u7840\u4FE1\u606F",async()=>{await re(),Z()})},"\u7F16\u8F91\u57FA\u7840\u4FE1\u606F")),t.createElement("details",null,t.createElement("summary",null,"\u67E5\u770B\u5F15\u7528\u7684\u9879\u76EE\u8D44\u6599"),t.createElement("dl",null,o.fields.filter(i=>i.scope==="shared").map(i=>t.createElement("div",{key:i.key,id:"df-"+i.key},t.createElement("dt",null,i.label),t.createElement("dd",null,i.value||"\u5C1A\u672A\u586B\u5199\uFF0C\u8BF7\u5230\u57FA\u7840\u4FE1\u606F\u586B\u62A5\u8865\u5145")))))),[...new Set(Se.filter(i=>!/^selection\.member\d+_/.test(i.key)).map(i=>i.group))].map(i=>t.createElement("section",{className:"df-group",key:i},t.createElement("h3",null,i),i==="\u65E5\u671F\u5B89\u6392"&&t.createElement("p",{className:"df-muted"},"\u6587\u4E66\u7EDF\u4E00\u4F7F\u7528\u4E2D\u6587\u65E5\u671F\uFF0C\u4F8B\u5982\u201C2026\u5E7410\u670822\u65E5\u4E0B\u534814:30\u201D\u3002\u65E5\u671F\u9009\u62E9\u5668\u4FDD\u7559\u539F\u6765\u7684\u586B\u5199\u65B9\u5F0F\u3002"),t.createElement("div",{className:"df-fields"},Se.filter(d=>d.group===i&&!/^selection\.member\d+_/.test(d.key)).map(d=>t.createElement(gt,{key:d.key,field:d,displayValue:o.presentation_sources?.[d.key]===d.value?o.document_values?.[d.key]:void 0,onChange:k=>ke({...o,fields:o.fields.map(K=>K.key===d.key?{...K,value:k}:K)})}))))),t.createElement(Pt,{fields:Se,onChange:(i,d)=>ke({...o,fields:o.fields.map(k=>k.key===i?{...k,value:d}:k)})})),!$e&&t.createElement("section",{className:"df-paper"},t.createElement("div",{className:"df-section-head"},t.createElement("div",null,t.createElement("h2",null,"\u53D7\u9080\u5355\u4F4D"," ",t.createElement("span",{className:"df-count"},o.recipients.length)),t.createElement("p",null,"\u6309\u5355\u4F4D\u6587\u4E66\u5206\u522B\u751F\u6210\uFF0C\u5171\u7528\u9879\u76EE\u4E0E\u843D\u6B3E\u4FE1\u606F\u3002")),t.createElement("button",{onClick:()=>ke({...o,recipients:Je([...o.recipients,{name:"",start:"",end:""}])}),disabled:o.recipients.length>=200},"\uFF0B \u6DFB\u52A0\u5355\u4F4D")),o.recipients.map((i,d)=>t.createElement("div",{className:"df-recipient",key:d,id:"df-recipient-"+d},t.createElement("div",{className:"df-recipient-title"},t.createElement("b",null,String(d+1).padStart(2,"0")),t.createElement("button",{"aria-label":`\u79FB\u9664\u7B2C${d+1}\u5BB6\u5355\u4F4D`,onClick:()=>ke({...o,recipients:Je(o.recipients.filter((k,K)=>K!==d))})},"\u79FB\u9664")),t.createElement("div",{className:"df-fields"},[["name","\u5355\u4F4D\u540D\u79F0"],["start","\u9886\u53D6\u5F00\u59CB\u65F6\u95F4"],["end","\u9886\u53D6\u7ED3\u675F\u65F6\u95F4"]].map(([k,K])=>t.createElement("label",{className:"df-field "+(k==="name"?"df-span":""),key:k},t.createElement("span",null,K),t.createElement("input",{"aria-label":`\u7B2C${d+1}\u5BB6${K}`,type:k==="name"?"text":"datetime-local",value:k==="name"?i[k]:i[k].replace(" ","T"),onChange:De=>he(d,k,De.target.value)}),d>0&&k!=="name"&&t.createElement("small",{className:"df-follow-state"},i["follow_"+k]?"\u8DDF\u968F\u7B2C1\u5BB6":"\u5DF2\u5355\u72EC\u8BBE\u7F6E",!i["follow_"+k]&&t.createElement("button",{type:"button","aria-label":`\u7B2C${d+1}\u5BB6${K}\u6062\u590D\u8DDF\u968F`,onClick:De=>{De.preventDefault(),he(d,k,o.recipients[0][k],!0)}},"\u6062\u590D\u8DDF\u968F")))))))),t.createElement("section",{className:"df-paper df-template-panel","aria-label":Ue},t.createElement("div",{className:"df-section-head"},t.createElement("h2",null,Ue),t.createElement("div",{className:"df-template-actions"},se.length>0?t.createElement("button",{onClick:()=>H("\u4FDD\u5B58\u9ED8\u8BA4\u6A21\u677F",async()=>{let i=await re();await ie(`/cases/${i.id}/defaults`,Pe({revision:i.revision})),X(g.id==="negotiation"?"\u5DF2\u8BBE\u4E3A\u672C\u673A\u9ED8\u8BA4\u6A21\u677F\uFF0C\u4EE5\u540E\u65B0\u5EFA\u586B\u62A5\u4F1A\u81EA\u52A8\u8F7D\u5165\u3002":"\u5DF2\u8BBE\u4E3A\u672C\u9636\u6BB5\u9ED8\u8BA4\u6A21\u677F\uFF0C\u4EE5\u540E\u65B0\u5EFA\u8BE5\u9636\u6BB5\u8868\u5355\u4F1A\u81EA\u52A8\u8F7D\u5165\u3002")})},g.id==="negotiation"?"\u8BBE\u4E3A\u9ED8\u8BA4\u6A21\u677F":"\u8BBE\u4E3A\u672C\u9636\u6BB5\u9ED8\u8BA4\u6A21\u677F"):t.createElement("button",{onClick:()=>H("\u8F7D\u5165\u9ED8\u8BA4\u6A21\u677F",async()=>{let i=await re();pe(await ie(`/cases/${i.id}/defaults/apply`,Pe({revision:i.revision}))),X("\u5DF2\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002")})},"\u4F7F\u7528\u9ED8\u8BA4\u6A21\u677F"),t.createElement("button",{onClick:()=>Ge.current.click()},"\uFF0B \u6DFB\u52A0"))),!se.length&&t.createElement("p",{className:"df-muted"},"\u6DFB\u52A0\u4E0E\u4F60\u7684\u53D8\u91CF\u8868\u5BF9\u5E94\u7684 .docx \u6216 .xlsx \u6A21\u677F\u3002"),se.map(i=>t.createElement("div",{className:"df-template",key:i.id},t.createElement("b",null,i.name),i.from_builtin&&t.createElement("small",null,"\u5E94\u7528\u81EA\u5E26\u6A21\u677F"),t.createElement("span",null,i.per_recipient?"\u6309\u53D7\u9080\u5355\u4F4D\u5206\u522B\u751F\u6210":"\u5171\u7528\u6587\u4EF6 \xB7 \u751F\u6210\u4E00\u4EFD"),i.print_copies>1&&t.createElement("small",null,"\u5EFA\u8BAE\u6253\u5370 ",i.print_copies," \u4EFD \xB7 ",i.print_note),t.createElement("small",null,i.keys.length," \u4E2A\u5F15\u7528\u53D8\u91CF"),t.createElement("button",{"aria-label":"\u79FB\u9664\u6A21\u677F"+i.name,onClick:()=>H("\u79FB\u9664\u6A21\u677F",async()=>{let d=await re();pe(await ie(`/cases/${d.id}/templates/${i.id}?revision=${d.revision}`,{method:"DELETE"}))})},"\u79FB\u9664")))),t.createElement("section",{className:"df-paper df-edit-footer","aria-label":"\u6838\u5BF9\u4E0E\u751F\u6210"},t.createElement("div",{className:"df-generation-plan"},t.createElement("h2",null,"\u6838\u5BF9\u4E0E\u751F\u6210"),t.createElement("p",null,"\u672C\u6B21\u8BA1\u5212\u751F\u6210 ",t.createElement("b",null,be)," \u4EFD\u6587\u4E66"),t.createElement("small",null,oe?"\u751F\u6210\u8BBA\u8BC1\u610F\u89C1\u53CA\u7B7E\u5B57\u8868\uFF0C\u4EE5\u53CA\u8BBA\u8BC1\u7ED3\u675F\u540E\u4E0A\u4F20\u7684\u975E\u62DB\u6807\u65B9\u6848\u3002\u7B7E\u5B57\u76D6\u7AE0\u540E\uFF0C\u5728\u9636\u6BB5\u6750\u6599\u4E2D\u7559\u5B58\u626B\u63CF\u4EF6\u3002":V?"\u6309\u672C\u6B21\u586B\u5199\u5185\u5BB9\u751F\u6210 Word \u8BF4\u660E\u4E0E Excel \u8BA1\u5212\u8868\u3002":t.createElement(t.Fragment,null,se.filter(i=>!i.per_recipient).length," ","\u4EFD\u5171\u7528\u6587\u4EF6 \xB7"," ",se.filter(i=>i.per_recipient).length," ","\u7C7B\u6309\u5355\u4F4D\u6587\u4E66 \xD7 ",o.recipients.length," \u5BB6\u5355\u4F4D"))),t.createElement("div",{className:"df-next-action"},t.createElement("button",{className:"df-primary",onClick:We},"\u6838\u5BF9\u586B\u5199\u5185\u5BB9 \u2192"),t.createElement("small",null,oe?"\u6838\u5BF9\u8BBA\u8BC1\u610F\u89C1\u3001\u4E09\u5BB6\u5355\u4F4D\u4E0E\u6210\u5458\u4FE1\u606F\uFF0C\u518D\u786E\u8BA4\u751F\u6210":V?"\u5148\u6838\u5BF9\u57FA\u7840\u4FE1\u606F\u4E0E\u7533\u62A5\u7ECF\u8D39\uFF0C\u518D\u786E\u8BA4\u751F\u6210":"\u5148\u6838\u5BF9\u7F3A\u9879\u4E0E\u65E5\u671F\uFF0C\u518D\u786E\u8BA4\u751F\u6210")))),o&&D==="review"&&A&&t.createElement("div",{className:"df-review"},t.createElement("section",{className:"df-paper"},t.createElement("span",{className:"df-eyebrow"},"\u586B\u5199\u6838\u5BF9"),t.createElement("h2",null,A.can_generate?"\u8D44\u6599\u5DF2\u9F50\u5907\uFF0C\u8BF7\u786E\u8BA4\u672C\u6B21\u5185\u5BB9\u3002":`\u8FD8\u6709 ${Ee.length} \u9879\u9700\u8981\u5904\u7406`),t.createElement("p",null,"\u672C\u6B21\u4F7F\u7528\u4FEE\u8BA2 ",o.revision," \u7684\u6570\u636E\uFF0C\u8BA1\u5212\u751F\u6210 ",be," ","\u4EFD\u6587\u4E66\u3002"),Ee.length>0&&t.createElement("div",{className:"df-checks"},Ee.map((i,d)=>t.createElement("div",{key:d,className:"df-check "+i.status},t.createElement("span",null,i.status==="ok"?"\u901A\u8FC7":i.status==="missing"?"\u5F85\u8865\u5145":"\u51B2\u7A81"),t.createElement("div",null,t.createElement("b",null,i.label),t.createElement("p",null,i.detail)),i.status!=="ok"&&i.field&&t.createElement("button",{onClick:()=>Ne(i.field)},"\u4FEE\u6539")))),A.checks.some(i=>i.status==="ok")&&t.createElement("details",{className:"df-passed"},t.createElement("summary",null,A.checks.filter(i=>i.status==="ok").length," ","\u9879\u65E5\u671F\u6821\u6838\u901A\u8FC7 \xB7 \u67E5\u770B\u660E\u7EC6"),A.checks.filter(i=>i.status==="ok").map((i,d)=>t.createElement("p",{key:d},t.createElement("b",null,i.label),t.createElement("br",null),i.detail.replaceAll("T"," ")))),t.createElement("div",{className:"df-review-data"},t.createElement("h3",null,"\u5171\u7528\u4FE1\u606F"),t.createElement("dl",null,o.fields.map(i=>t.createElement("div",{key:i.key,className:ut(i)?"df-span":void 0},t.createElement("dt",null,i.label),t.createElement("dd",null,(o.document_values?.[i.key]??i.value)||"\u5C1A\u672A\u586B\u5199")))),o.recipients.length>0&&t.createElement(t.Fragment,null,t.createElement("h3",null,"\u53D7\u9080\u5355\u4F4D"),o.recipients.map((i,d)=>t.createElement("p",{key:d},d+1,". ",i.name||"\u5C1A\u672A\u586B\u5199",o.recipient_document_times?.[d]??`${i.start.replace("T"," ")} \u2014 ${i.end.replace("T"," ")}`)))),t.createElement("div",{className:"df-review-data"},t.createElement("h3",null,"\u8F93\u51FA\u6E05\u5355"),se.map(i=>t.createElement("p",{key:i.id},i.name," \xB7"," ",i.per_recipient?o.recipients.map(d=>d.name||"\u5F85\u586B\u5355\u4F4D").join("\u3001"):"\u5171\u7528\u6587\u4EF6",i.print_copies>1&&` \xB7 \u5EFA\u8BAE\u6253\u5370 ${i.print_copies} \u4EFD\uFF0C\u6BCF\u4F4D\u4E13\u5BB6\u4E00\u4EFD`))),t.createElement("div",{className:"df-confirm"},t.createElement("label",null,t.createElement("input",{type:"checkbox",checked:z,disabled:!A.can_generate,onChange:i=>S(i.target.checked)}),oe?"\u6211\u5DF2\u6838\u5BF9\u8BBA\u8BC1\u610F\u89C1\u3001\u5019\u9009\u5355\u4F4D\u3001\u6210\u5458\u4E0E\u7CFB\u7EDF\u586B\u62A5\u4FE1\u606F":V?"\u6211\u5DF2\u6838\u5BF9\u57FA\u7840\u4FE1\u606F\u3001\u7533\u62A5\u7ECF\u8D39\u548C\u5916\u534F\u5FC5\u8981\u6027":"\u6211\u5DF2\u6838\u5BF9\u586B\u5199\u5185\u5BB9\u3001\u53D7\u9080\u5355\u4F4D\u548C\u65E5\u671F\u5B89\u6392"),t.createElement("p",null,oe?"\u751F\u6210\u540E\u8BF7\u5B8C\u6210\u7EBF\u4E0B\u7B7E\u5B57\u76D6\u7AE0\uFF0C\u518D\u5C06\u975E\u62DB\u6807\u65B9\u6848\u548C\u7B7E\u5B57\u6750\u6599\u4E0A\u4F20\u4E1A\u52A1\u7CFB\u7EDF\u3002":V?"\u7533\u62A5\u53E3\u5F84\u4E0E\u6A21\u677F\u7248\u5F0F\u8BF7\u7531\u7ECF\u529E\u4EBA\u590D\u6838\u3002":"\u6821\u6838\u68C0\u67E5\u8D44\u6599\u5B8C\u6574\u6027\u53CA\u65F6\u95F4\u987A\u5E8F\u3002\u4E1A\u52A1\u6761\u6B3E\u4E0E Word \u6A21\u677F\u8BF7\u7531\u7ECF\u529E\u4EBA\u590D\u6838\u3002"),t.createElement("div",null,t.createElement("button",{onClick:()=>{_("edit"),S(!1)}},"\u8FD4\u56DE\u4FEE\u6539"),t.createElement("button",{className:"df-primary",disabled:!A.can_generate||!z,onClick:qe},"\u786E\u8BA4\u5E76\u751F\u6210 ",be," \u4EFD\u6587\u4E66"))))),o&&D==="files"&&y&&t.createElement("div",{className:"df-results"+(u?" df-results-docked":"")},t.createElement("section",{className:"df-paper df-output-list"},t.createElement("span",{className:"df-eyebrow"},"\u751F\u6210\u8BB0\u5F55"),t.createElement("h2",null,y.files.length," \u4EFD\u6587\u4EF6\u5DF2\u751F\u6210"),t.createElement("p",null,Qe(y.created_at)," \xB7 \u4FEE\u8BA2 ",y.revision),t.createElement("p",{className:"df-muted"},oe?"\u538B\u7F29\u5305\u5305\u542B\u8BBA\u8BC1\u610F\u89C1\u53CA\u7B7E\u5B57\u8868\u3001\u975E\u62DB\u6807\u65B9\u6848\u3001\u586B\u5199\u6570\u636E\u548C\u6838\u5BF9\u8BB0\u5F55":V?"\u538B\u7F29\u5305\u5305\u542B Word\u3001\u79D1\u7814\u8BA1\u5212\u8868\u3001\u586B\u5199\u6570\u636E\u548C\u6838\u5BF9\u8BB0\u5F55":"\u538B\u7F29\u5305\u5305\u542B Word\u3001\u586B\u5199\u6570\u636E\u548C\u6838\u5BF9\u8BB0\u5F55"),(w||(y.content_digest?y.content_digest!==o.content_digest:y.revision!==o.revision))&&t.createElement("div",{className:"df-alert"},"\u586B\u5199\u5185\u5BB9\u5DF2\u6709\u4FEE\u6539\uFF0C\u4E0B\u5217\u6587\u4EF6\u4FDD\u7559\u751F\u6210\u65F6\u7684\u5185\u5BB9\u3002\u8BF7\u91CD\u65B0\u6838\u5BF9\u5E76\u751F\u6210\u65B0\u7248\u3002"),Me.map(i=>t.createElement("div",{className:"df-generation",key:i.id},t.createElement("div",{className:"df-generation-heading"},t.createElement("h3",null,Qe(i.created_at)," \xB7 \u4FEE\u8BA2 ",i.revision,i.date_style!=="zh-CN"&&" \xB7 \u539F\u65E5\u671F\u683C\u5F0F",i.naming_style!=="formal"&&" \xB7 \u539F\u6587\u4EF6\u540D"),t.createElement("button",{"aria-label":`\u6253\u5305\u4E0B\u8F7D ${Qe(i.created_at)} \u4FEE\u8BA2 ${i.revision}`,onClick:()=>Y(i)},"\u6253\u5305\u4E0B\u8F7D")),i.files.map(d=>t.createElement("div",{className:"df-output "+(W?.file.name===d.name&&W?.generation.id===i.id?"selected":""),key:d.name},t.createElement("button",{onClick:()=>ee({file:d,generation:i})},t.createElement("b",null,d.name),t.createElement("small",null,d.recipient," \xB7 ",(d.size/1024).toFixed(0)," KB",d.print_copies>1&&` \xB7 \u5EFA\u8BAE\u6253\u5370 ${d.print_copies} \u4EFD`)),t.createElement("button",{"aria-label":"\u4E0B\u8F7D"+d.name,onClick:()=>H("\u4E0B\u8F7D\u6587\u4EF6",()=>Ye(le(i,d.name),d.name))},"\u2193")))))),!u&&t.createElement("section",{className:"df-paper df-preview"},t.createElement("div",{className:"df-section-head"},t.createElement("h2",null,W?W.file.name:"\u9009\u62E9\u6587\u4EF6\u9884\u89C8"),t.createElement("span",null,"Office \u9884\u89C8")),t.createElement("div",{className:"df-preview-body"},fe&&ne?t.createElement(Xe,{key:fe.id,artifact:fe},t.createElement(ne,{key:fe.id,artifact:fe,readOnly:!0,hostControls:!0})):t.createElement("p",{className:"df-muted"},fe?"\u6B63\u5728\u6253\u5F00\u6587\u4EF6\u2026":"\u4ECE\u5DE6\u4FA7\u9009\u62E9\u4E00\u4EFD\u6587\u4EF6\u3002"))))),t.createElement("footer",{className:"df-footer"},t.createElement("span",null,"UGSci \xB7 \u6587\u4E66\u586B\u62A5"),t.createElement("span",null,"\u6570\u636E\u4E0E\u6587\u4E66\u4FDD\u5B58\u5728\u5F53\u524D\u670D\u52A1\u7AEF \xB7 \u65E0\u9700\u6A21\u578B\u670D\u52A1"))),T&&o&&t.createElement("div",{className:"df-dialog-backdrop"},t.createElement("section",{className:"df-dialog df-paper",role:"dialog","aria-modal":"true","aria-label":"\u6838\u5BF9\u5171\u7528\u8D44\u6599"},t.createElement("div",{className:"df-section-head"},t.createElement("h2",null,T==="adopt"?"\u91C7\u7528\u9879\u76EE\u5E95\u7A3F\u4E2D\u7684\u8D44\u6599":"\u5C06\u672C\u8868\u8D44\u6599\u5B58\u5165\u9879\u76EE\u5E95\u7A3F"),t.createElement("button",{disabled:!!s,onClick:()=>E(null),"aria-label":"\u5173\u95ED\u5171\u7528\u8D44\u6599\u6838\u5BF9"},"\xD7")),t.createElement("p",{className:"df-muted"},"\u53EA\u66F4\u65B0\u52FE\u9009\u9879\u3002\u539F\u751F\u6210\u6587\u4EF6\u4FDD\u7559\uFF0C\u540E\u7EED\u751F\u6210\u524D\u9700\u91CD\u65B0\u6838\u5BF9\u3002"),C&&t.createElement("p",{role:"alert",className:"df-alert error"},C),t.createElement("div",{className:"df-compare"},n.fields.filter(i=>o.fields.some(d=>d.key===i.key&&d.value!==i.value)).map(i=>{let d=o.fields.find(k=>k.key===i.key);return t.createElement("label",{key:i.key},t.createElement("input",{type:"checkbox",checked:I.includes(i.key),onChange:k=>F(k.target.checked?[...I,i.key]:I.filter(K=>K!==i.key))}),t.createElement("div",null,t.createElement("b",null,i.label),t.createElement("div",{className:"df-compare-values"},t.createElement("p",null,t.createElement("small",null,"\u5F53\u524D\u8868\u5355"),d.value||"\u7A7A\u767D"),t.createElement("p",null,t.createElement("small",null,"\u9879\u76EE\u5E95\u7A3F"),i.value||"\u7A7A\u767D"))))}),!n.fields.some(i=>o.fields.some(d=>d.key===i.key&&d.value!==i.value))&&t.createElement("p",null,"\u672C\u8868\u4E0E\u9879\u76EE\u5E95\u7A3F\u4E2D\u7684\u5171\u7528\u8D44\u6599\u4E00\u81F4\u3002")),t.createElement("div",{className:"df-actions"},t.createElement("button",{disabled:!!s,onClick:()=>E(null)},"\u53D6\u6D88"),t.createElement("button",{className:"df-primary",disabled:!!s||!I.length,onClick:()=>H("\u540C\u6B65\u5171\u7528\u8D44\u6599",async()=>{let i=await re();if(T==="adopt")pe(await ie(`/projects/${n.id}/cases/${i.id}/sync`,Pe({revision:n.revision,case_revision:i.revision,keys:I})));else{let d=Object.fromEntries(i.fields.filter(k=>I.includes(k.key)).map(k=>[k.key,k.value]));await ie(`/projects/${n.id}`,{...Pe({revision:n.revision,name:d["project.name"]??n.name,code:d["project.code"]??n.code,owner:n.owner,values:d}),method:"PUT"})}await ye(),E(null),X("\u6240\u9009\u8D44\u6599\u5DF2\u540C\u6B65\uFF0C\u8BF7\u91CD\u65B0\u6838\u5BF9\u540E\u751F\u6210\u65B0\u7248\u6587\u4E66\u3002")})},T==="adopt"?"\u91C7\u7528\u6240\u9009\u9879\u76EE\u8D44\u6599":"\u4FDD\u5B58\u6240\u9009\u8D44\u6599\u5230\u5E95\u7A3F")))))}function St(){let n=ue.host.useSelectedAgent?.();return t.createElement(at,{key:n?.id||ue.host.getSelectedAgentId?.()||"default",Editor:$t,services:{request:ie,json:Pe,download:Ye,time:Qe,Field:gt}})}ue.registerRoutes("document-forms",[{path:"/apps/document-forms",component:St,label:"\u6587\u4E66\u586B\u62A5",icon:"\u25A4"}]);})();
