(()=>{var I=window.QwenPaw.host.React,{useEffect:et,useState:fe}=I;function We({artifact:n,children:b}){let[m,h]=fe("print"),[c,_]=fe([]),[l,N]=fe(0),[r,z]=fe(""),[u,F]=fe(0),[G,o]=fe(100);return et(()=>{if(m!=="print")return;let S=new AbortController,T=[];return _([]),N(0),z(""),window.QwenPaw.host.fetch(n.printUrl+"?pages=true",{headers:n.agentId?{"X-Agent-Id":n.agentId}:{},signal:S.signal}).then(async E=>{if(!E.ok){let M=await E.json().catch(()=>({}));throw new Error(typeof M.detail=="string"?M.detail:"\u6253\u5370\u9884\u89C8\u6682\u4E0D\u53EF\u7528\uFF0C\u53EF\u5207\u6362\u6587\u5B57\u9884\u89C8\u6216\u4E0B\u8F7D Word \u67E5\u770B")}let{pages:D}=await E.json();if(!S.signal.aborted){if(!Number.isInteger(D)||D<1||D>40)throw new Error("\u672A\u83B7\u5F97\u6709\u6548\u7684 Word \u9875\u6570");N(D);for(let M=1;M<=D;M++){let O=await window.QwenPaw.host.fetch(n.printUrl+"?page="+M,{headers:n.agentId?{"X-Agent-Id":n.agentId}:{},signal:S.signal});if(!O.ok)throw new Error(`\u7B2C ${M} \u9875\u672A\u80FD\u6E32\u67D3\uFF0C\u8BF7\u91CD\u65B0\u9884\u89C8`);let L=await O.blob();if(S.signal.aborted)return;let g=URL.createObjectURL(L);T.push(g),_(j=>[...j,g])}}}).catch(E=>{S.signal.aborted||z(E.message||"\u6253\u5370\u9884\u89C8\u672A\u5B8C\u6210")}),()=>{S.abort(),T.forEach(E=>URL.revokeObjectURL(E))}},[n.id,n.printUrl,n.agentId,m,u]),I.createElement("div",{className:"df-print-preview"},I.createElement("div",{className:"df-print-toolbar"},I.createElement("div",null,I.createElement("button",{"aria-pressed":m==="print",onClick:()=>h("print")},"\u6253\u5370\u7248\u5F0F"),I.createElement("button",{"aria-pressed":m==="text",onClick:()=>h("text")},"\u6587\u5B57\u9884\u89C8")),m==="print"&&I.createElement("div",null,l>0&&I.createElement("span",null,"\u5171 ",l," \u9875"),I.createElement("select",{"aria-label":"\u9884\u89C8\u6BD4\u4F8B",value:G,onChange:S=>o(Number(S.target.value))},I.createElement("option",{value:100},"\u9002\u5408\u5BBD\u5EA6"),I.createElement("option",{value:125},"125%"),I.createElement("option",{value:150},"150%"),I.createElement("option",{value:200},"200%")))),m==="text"?I.createElement("div",{className:"df-text-preview"},b):r?I.createElement("div",{className:"df-preview-message",role:"alert"},I.createElement("p",null,r),I.createElement("button",{onClick:()=>F(S=>S+1)},"\u91CD\u65B0\u9884\u89C8")):c.length?I.createElement("div",{className:"df-print-scroll"},I.createElement("div",{className:"df-print-pages",style:{width:G+"%"}},c.map((S,T)=>I.createElement("figure",{key:T},I.createElement("figcaption",null,"\u7B2C ",T+1," \u9875"),I.createElement("img",{src:S,alt:n.title+` \xB7 \u6253\u5370\u7248\u5F0F \xB7 \u7B2C ${T+1} \u9875`}))),c.length<l&&I.createElement("p",{role:"status"},"\u6B63\u5728\u6392\u7248\u7B2C ",c.length+1," \u9875\u2026"))):I.createElement("div",{className:"df-preview-message",role:"status"},"\u6B63\u5728\u6392\u7248\u6253\u5370\u9875\u9762\u2026"))}function se({artifact:n}){let[b,m]=fe(null),[h,c]=fe(""),[_,l]=fe(0);if(et(()=>{let r=new AbortController;return m(null),c(""),window.QwenPaw.host.fetch("/workspace/convert-office",{method:"POST",headers:{"Content-Type":"application/json",...n.agentId?{"X-Agent-Id":n.agentId}:{}},signal:r.signal,body:JSON.stringify({url:n.binaryUrl,mime_type:n.mimeType})}).then(async z=>{let u=await z.json();if(!z.ok)throw new Error(typeof u.detail=="string"?u.detail:"\u6587\u4EF6\u9884\u89C8\u672A\u5B8C\u6210");r.signal.aborted||m(u)}).catch(z=>{r.signal.aborted||c(z.message||"\u6587\u4EF6\u9884\u89C8\u672A\u5B8C\u6210")}),()=>r.abort()},[n.id,n.binaryUrl,n.mimeType,n.agentId,_]),h)return I.createElement("div",{className:"df-preview-message",role:"alert"},I.createElement("p",null,h),I.createElement("button",{onClick:()=>l(r=>r+1)},"\u91CD\u65B0\u9884\u89C8"),I.createElement("p",null,"\u4E5F\u53EF\u4EE5\u4ECE\u6587\u4EF6\u6E05\u5355\u4E0B\u8F7D\u540E\u67E5\u770B\u3002"));if(!b)return I.createElement("div",{className:"df-preview-message",role:"status"},"\u6B63\u5728\u6253\u5F00\u6587\u4EF6\u2026");let N=b.engine==="officecli"?b.html:`<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;color:#333;background:#fff;padding:24px 32px;line-height:1.7;max-width:900px;margin:0 auto}table{border-collapse:collapse;width:100%;margin:12px 0}td,th{border:1px solid #ddd;padding:8px 12px}img{max-width:100%;height:auto}h1{font-size:1.6em}h2{font-size:1.3em}.docx-page-break{border-top:2px dashed #ccc;margin:32px 0}</style></head><body>${b.html||""}</body></html>`;return I.createElement("iframe",{className:"df-office-frame",title:n.title,srcDoc:N,sandbox:b.engine==="officecli"?"allow-scripts":"allow-same-origin"})}var tt=`.df-app {
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
`;var qe=window.QwenPaw,x=qe.host.React,{useState:me,useEffect:ct}=x,it={running:"\u6B63\u5728\u6838\u67E5",completed:"\u6838\u67E5\u5B8C\u6210",failed:"\u672A\u5B8C\u6210",interrupted:"\u5DF2\u4E2D\u65AD"},at=".doc,.docx,.pdf,.xls,.xlsx,.png,.jpg,.jpeg";function De({project:n,services:b,onChanged:m}){let{request:h,download:c,time:_}=b,[l,N]=me(null),[r,z]=me(""),[u,F]=me(null),[G,o]=me([]),[S,T]=me(""),[E,D]=me(""),[M,O]=me(!1),[L,g]=me(""),[j,W]=me(0);ct(()=>{let p=!0,U,v=!1;async function q(){try{let V=await h(`/projects/${n.id}/response-reviews`);if(!p)return;N(V),g("");let A=V.records.some(Y=>Y.status==="running");v&&!A&&m(),v=A,A&&(U=setTimeout(q,3e3))}catch(V){p&&g(V.message)}}return q(),()=>{p=!1,clearTimeout(U)}},[n.id,j]);let K=l?.records.some(p=>p.status==="running"),P=l?.records.find(p=>p.id===E)||l?.records[0],w=qe.host.ReactMarkdown;async function k(p){p.preventDefault(),g(""),O(!0);try{let U=new FormData;r?U.set("reference_id",r):u&&U.set("reference",u);for(let q of G)U.append("responses",q);U.set("focus",S);let v=await h(`/projects/${n.id}/response-reviews`,{method:"POST",body:U});D(v.id),N(q=>({...q,records:[v,...q?.records||[]]})),W(q=>q+1)}catch(U){g(U.message)}finally{O(!1)}}return x.createElement("div",{className:"df-response-review"},x.createElement("p",{className:"df-muted"},"\u5BF9\u7167\u8C08\u5224\u6587\u4EF6\uFF0C\u9010\u5BB6\u68C0\u67E5\u8D44\u8D28\u3001\u6280\u672F\u54CD\u5E94\u3001\u62A5\u4EF7\u3001\u65E5\u671F\u4E0E\u7B7E\u7AE0\u9644\u4EF6\u3002\u6838\u67E5\u610F\u89C1\u4F9B\u7ECF\u529E\u4EBA\u548C\u4E13\u5BB6\u590D\u6838\u3002"),L&&x.createElement("div",{className:"df-alert error",role:"alert"},L,x.createElement("button",{onClick:()=>W(p=>p+1)},"\u91CD\u65B0\u52A0\u8F7D")),l?x.createElement(x.Fragment,null,x.createElement("form",{onSubmit:k},x.createElement("fieldset",{disabled:M||K},x.createElement("label",{className:"df-field"},x.createElement("span",null,"\u6838\u67E5\u4F9D\u636E"),x.createElement("select",{"aria-label":"\u6838\u67E5\u4F9D\u636E",value:r,onChange:p=>{z(p.target.value),F(null)}},x.createElement("option",{value:""},"\u4E0A\u4F20\u6B63\u5F0F\u8C08\u5224\u6587\u4EF6"),l.references.map(p=>x.createElement("option",{key:p.id,value:p.id},p.label)))),!r&&x.createElement("label",{className:"df-field"},x.createElement("span",null,"\u6B63\u5F0F\u8C08\u5224\u6587\u4EF6"),x.createElement("input",{"aria-label":"\u4E0A\u4F20\u6838\u67E5\u4F9D\u636E",type:"file",accept:at,required:!0,onChange:p=>F(p.target.files[0]||null)})),x.createElement("label",{className:"df-field"},x.createElement("span",null,"\u5404\u5355\u4F4D\u54CD\u5E94\u6750\u6599"),x.createElement("input",{"aria-label":"\u4E0A\u4F20\u54CD\u5E94\u6750\u6599",type:"file",multiple:!0,required:!0,accept:at,onChange:p=>o([...p.target.files])})),G.length>0&&x.createElement("ul",{className:"df-review-files"},G.map((p,U)=>x.createElement("li",{key:U},p.name))),x.createElement("p",{className:"df-muted"},"\u652F\u6301 Word\u3001PDF\u3001Excel \u548C\u56FE\u7247\uFF1B\u53EF\u4E00\u6B21\u9009\u62E9\u591A\u5BB6\u6750\u6599\u3002\u6BCF\u4EFD\u4E0D\u8D85\u8FC7 15 MB\uFF0C\u6BCF\u6B21\u6700\u591A 20 \u4EFD\u3001\u5408\u8BA1 100 MB\u3002\u538B\u7F29\u5305\u8BF7\u5148\u89E3\u538B\u3002"),x.createElement("label",{className:"df-field"},x.createElement("span",null,"\u8865\u5145\u5173\u6CE8\u70B9\uFF08\u9009\u586B\uFF09"),x.createElement("textarea",{"aria-label":"\u8865\u5145\u6838\u67E5\u5173\u6CE8\u70B9",rows:3,maxLength:3e3,value:S,onChange:p=>T(p.target.value),placeholder:"\u4F8B\u5982\uFF1A\u91CD\u70B9\u6838\u5BF9\u62A5\u4EF7\u5927\u5C0F\u5199\u3001\u6210\u679C\u4EA4\u4ED8\u65F6\u95F4\u548C\u8D44\u8D28\u6709\u6548\u671F"})),x.createElement("div",{className:"df-actions"},x.createElement("button",{className:"df-primary",disabled:M||K||!(r||u)||!G.length},M?"\u6B63\u5728\u63D0\u4EA4\u2026":"\u5F00\u59CB\u6838\u67E5"),x.createElement("span",{className:"df-muted"},"\u4F7F\u7528\u201C\u54CD\u5E94\u6587\u4EF6\u6838\u67E5\u201D\u667A\u80FD\u4F53\uFF0C\u6CBF\u7528\u8F6F\u4EF6\u4E2D\u7684\u6A21\u578B\u914D\u7F6E\u3002")))),l.records.length>0&&x.createElement("section",{className:"df-review-history"},x.createElement("div",{className:"df-section-head"},x.createElement("h3",null,"\u6838\u67E5\u8BB0\u5F55"),x.createElement("button",{onClick:()=>W(p=>p+1)},"\u5237\u65B0\u8BB0\u5F55")),x.createElement("div",{className:"df-review-records"},l.records.map(p=>x.createElement("button",{key:p.id,"aria-pressed":P?.id===p.id,onClick:()=>D(p.id)},_(p.created_at)," \xB7 ",it[p.status]))),P&&x.createElement("article",{"aria-label":"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5\u7ED3\u679C"},x.createElement("div",{className:"df-section-head"},x.createElement("div",null,x.createElement("b",null,it[P.status]),x.createElement("p",{className:"df-muted"},"\u57FA\u4E8E\u9879\u76EE\u4FEE\u8BA2 ",P.project_revision," \xB7"," ",P.files.length," \u4EFD\u6750\u6599\uFF1B\u540E\u7EED\u6750\u6599\u4FEE\u6539\u8BF7\u91CD\u65B0\u6838\u67E5\u3002")),P.status==="completed"&&x.createElement("button",{onClick:async()=>{try{await c(`/projects/${n.id}/response-reviews/${P.id}/report`,`${n.name}_\u54CD\u5E94\u6587\u4EF6\u6838\u67E5\u8BB0\u5F55_${P.id.slice(0,8)}.md`)}catch(p){g(p.message)}}},"\u4E0B\u8F7D\u6838\u67E5\u8BB0\u5F55")),x.createElement("details",null,x.createElement("summary",null,"\u672C\u6B21\u6838\u67E5\u6750\u6599\u4E0E\u5173\u6CE8\u70B9"),x.createElement("ul",null,P.files.map((p,U)=>x.createElement("li",{key:U},p.role,"\uFF1A",p.name))),x.createElement("p",null,P.focus||"\u65E0\u8865\u5145\u5173\u6CE8\u70B9")),P.status==="running"&&x.createElement("p",{role:"status",className:"df-alert"},"\u6B63\u5728\u8BFB\u53D6\u5E76\u6838\u67E5\u6750\u6599\uFF0C\u53EF\u5173\u95ED\u6B64\u7A97\u53E3\uFF0C\u7A0D\u540E\u56DE\u5230\u672C\u9879\u76EE\u67E5\u770B\u7ED3\u679C\u3002"),P.error&&x.createElement("p",{role:"alert",className:"df-alert error"},P.error),P.report&&x.createElement("div",{className:"df-review-report"},w?x.createElement(w,{remarkPlugins:qe.host.remarkGfm?[qe.host.remarkGfm]:[],components:{a:({children:p})=>x.createElement("span",null,p),img:()=>null}},P.report):x.createElement("div",{style:{whiteSpace:"pre-wrap"}},P.report))))):x.createElement("p",{role:"status"},"\u6B63\u5728\u8BFB\u53D6\u6838\u67E5\u8BB0\u5F55\u2026"))}var ke=window.QwenPaw,s=ke.host.React,{useState:ue,useEffect:Ve,useRef:nt}=s;function ut(n,b,m){return{artifact:{id:b.id+m.name,title:m.name,source:"generated",extension:"docx",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",binaryUrl:m.preview_url,printUrl:`/document-forms/cases/${n.case_id}/print/${b.id}/${encodeURIComponent(m.name)}`,agentId:ke.host.getSelectedAgentId?.(),createdAt:Date.parse(b.created_at)},reference:{case_id:n.case_id,generation_id:b.id,name:m.name}}}function gt({project:n,stageId:b,selection:m,services:h}){let{request:c,json:_,time:l}=h,[N,r]=ue([]),[z,u]=ue(""),[F,G]=ue(!1),[o,S]=ue(""),[T,E]=ue(0),D=nt(null);Ve(()=>{let g=!0,j;async function W(){try{let K=await c(`/projects/${n.id}/assistant`);if(!g)return;r(K.messages),S(""),K.messages.some(P=>P.status==="running")&&(j=setTimeout(W,2500))}catch(K){g&&S(K.message)}}return W(),()=>{g=!1,clearTimeout(j)}},[n.id,T]),Ve(()=>{D.current?.scrollIntoView?.({block:"nearest"})},[N.length,N.at(-1)?.status]);let M=F||N.some(g=>g.status==="running"),O=ke.host.ReactMarkdown;async function L(g){if(g.preventDefault(),!(!z.trim()||M)){G(!0),S("");try{let j=await c(`/projects/${n.id}/assistant`,_({message:z.trim(),stage_id:b||"overview",file:m?.reference||{}}));r(W=>[...W,j]),u(""),E(W=>W+1)}catch(j){S(j.message)}finally{G(!1)}}}return s.createElement("section",{className:"df-project-chat","aria-label":"\u9879\u76EE\u667A\u80FD\u4F53\u95EE\u7B54"},s.createElement("p",{className:"df-muted"},"\u7ED3\u5408\u5DF2\u4FDD\u5B58\u7684\u9879\u76EE\u8D44\u6599\u548C\u5F53\u524D\u9884\u89C8\u56DE\u7B54\uFF0C\u95EE\u7B54\u968F\u9879\u76EE\u4FDD\u7559\u3002"),s.createElement("div",{className:"df-chat-messages","aria-live":"polite"},!N.length&&s.createElement("div",{className:"df-chat-welcome"},s.createElement("h3",null,"\u56F4\u7ED5\u5F53\u524D\u9879\u76EE\u63D0\u95EE"),s.createElement("p",null,"\u53EF\u4EE5\u68B3\u7406\u672C\u9636\u6BB5\u8FD8\u9700\u51C6\u5907\u7684\u6750\u6599\uFF0C\u6216\u5BF9\u7167\u9884\u89C8\u6587\u4EF6\u6838\u5B9E\u5185\u5BB9\u3002"),["\u672C\u9636\u6BB5\u8FD8\u9700\u8981\u51C6\u5907\u54EA\u4E9B\u6750\u6599\uFF1F","\u5E2E\u6211\u6838\u5BF9\u5F53\u524D\u6587\u4EF6\u4E2D\u7684\u65E5\u671F\u548C\u91D1\u989D\u3002"].map(g=>s.createElement("button",{key:g,onClick:()=>u(g)},g))),N.map(g=>s.createElement("article",{className:"df-chat-turn",key:g.id},s.createElement("div",{className:"df-chat-question"},s.createElement("small",null,"\u6211 \xB7 ",l(g.created_at)),s.createElement("p",null,g.message),g.file_name&&s.createElement("small",null,"\u53C2\u8003\u6587\u4EF6\uFF1A",g.file_name)),g.reply&&s.createElement("div",{className:"df-chat-answer"},s.createElement("small",null,"\u9879\u76EE\u52A9\u624B"),O?s.createElement(O,{remarkPlugins:ke.host.remarkGfm?[ke.host.remarkGfm]:[],components:{img:()=>null,a:({children:j})=>s.createElement("span",null,j)}},g.reply):s.createElement("p",{style:{whiteSpace:"pre-wrap"}},g.reply)),g.status==="running"&&s.createElement("p",{role:"status",className:"df-muted"},"\u6B63\u5728\u7ED3\u5408\u9879\u76EE\u8D44\u6599\u6574\u7406\u56DE\u7B54\u2026"),g.error&&s.createElement("p",{role:"alert",className:"df-alert error"},g.error))),s.createElement("div",{ref:D})),o&&s.createElement("p",{role:"alert",className:"df-alert error"},o,s.createElement("button",{onClick:()=>E(g=>g+1)},"\u91CD\u65B0\u52A0\u8F7D")),s.createElement("form",{className:"df-chat-composer",onSubmit:L},m&&s.createElement("small",{className:"df-chat-context"},"\u53C2\u8003\u6587\u4EF6\uFF1A",m.artifact.title),s.createElement("textarea",{"aria-label":"\u5411\u9879\u76EE\u667A\u80FD\u4F53\u63D0\u95EE",placeholder:"\u8F93\u5165\u5F53\u524D\u9879\u76EE\u7684\u95EE\u9898\u2026",rows:3,maxLength:4e3,value:z,onChange:g=>u(g.target.value)}),s.createElement("div",{className:"df-actions"},s.createElement("button",{className:"df-primary",disabled:M||!z.trim()},M?"\u6B63\u5728\u56DE\u7B54\u2026":"\u53D1\u9001\u95EE\u9898"))))}function Xe({collapsed:n=!1,width:b,maxWidth:m,onResize:h,onToggle:c,project:_,stageId:l,services:N,mode:r,onMode:z,selection:u,onSelect:F,attachment:G,AttachmentPreview:o,onChanged:S,dirty:T=!1}){let E=nt(null),[D,M]=ue(!1),O=()=>{E.current=null,M(!1)},[L,g]=ue(null),[j,W]=ue("");async function K(w,k){try{W(""),await N.download(w,k)}catch(p){W(p.message)}}Ve(()=>{let w=!0;return(ke.workspace?.loadPreview?ke.workspace.loadPreview():Promise.resolve(se)).then(k=>w&&g(()=>k)).catch(()=>w&&g(()=>se)),()=>{w=!1}},[]);let P=_.forms.flatMap(w=>w.generations.flatMap(k=>l&&l!=="overview"&&l!=="profile"&&(k.stage_id||w.original_stage_id||w.stage_id)!==l?[]:[{form:w,generation:k}]));return s.createElement("aside",{className:"df-right-workspace"+(n?" df-pane-collapsed":"")+(D?" df-resizing":""),"aria-label":"\u9879\u76EE\u667A\u80FD\u4F53\u4E0E\u6587\u4EF6\u9884\u89C8"},s.createElement("div",{className:"df-dock-resizer",role:"separator","aria-label":"\u8C03\u6574\u95EE\u7B54\u4E0E\u9884\u89C8\u680F\u5BBD\u5EA6","aria-orientation":"vertical","aria-valuemin":300,"aria-valuemax":m,"aria-valuenow":b,"aria-valuetext":b+" \u50CF\u7D20",tabIndex:0,title:"\u5DE6\u53F3\u62D6\u52A8\u8C03\u6574\u5BBD\u5EA6\uFF1B\u53CC\u51FB\u6062\u590D\u9ED8\u8BA4\u5BBD\u5EA6",onPointerDown:w=>{w.button===0&&(w.preventDefault(),E.current={x:w.clientX,width:b,pointer:w.pointerId},w.currentTarget.setPointerCapture?.(w.pointerId),M(!0))},onPointerMove:w=>{E.current&&E.current.pointer===w.pointerId&&h(E.current.width+E.current.x-w.clientX)},onPointerUp:O,onPointerCancel:O,onLostPointerCapture:O,onDoubleClick:()=>h(500),onKeyDown:w=>{let k={ArrowLeft:b+24,ArrowRight:b-24,Home:300,End:m}[w.key];k!==void 0&&(w.preventDefault(),h(k))}}),s.createElement("button",{className:"df-pane-toggle","aria-label":n?"\u5C55\u5F00\u95EE\u7B54\u4E0E\u9884\u89C8\u680F":"\u6536\u8D77\u95EE\u7B54\u4E0E\u9884\u89C8\u680F","aria-expanded":!n,title:n?"\u5C55\u5F00\u95EE\u7B54\u4E0E\u9884\u89C8\u680F":"\u6536\u8D77\u95EE\u7B54\u4E0E\u9884\u89C8\u680F",onClick:c},s.createElement("span",{"aria-hidden":"true"},n?"\u2039":"\u203A"),s.createElement("span",null,n?"\u95EE\u7B54\u4E0E\u9884\u89C8":"\u6536\u8D77")),s.createElement("header",null,s.createElement("div",null,s.createElement("span",{className:"df-eyebrow"},"\u9879\u76EE\u5DE5\u4F5C\u533A"),s.createElement("h2",null,r==="preview"?"\u6587\u4EF6\u9884\u89C8":r==="review"?"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5":"\u667A\u80FD\u4F53\u95EE\u7B54")),s.createElement("div",{className:"df-dock-tabs",role:"tablist","aria-label":"\u53F3\u4FA7\u5DE5\u4F5C\u533A"},s.createElement("button",{role:"tab","aria-selected":r==="assistant",onClick:()=>z("assistant")},"\u95EE\u7B54"),s.createElement("button",{role:"tab","aria-selected":r==="preview",onClick:()=>z("preview")},"\u9884\u89C8"))),j&&s.createElement("p",{role:"alert",className:"df-alert error"},j),s.createElement("div",{className:"df-right-body",hidden:r!=="assistant"},s.createElement(gt,{project:_,stageId:["overview","profile"].includes(l)?"overview":l,selection:u,services:N}),l==="negotiation"&&s.createElement("button",{className:"df-open-review",onClick:()=>z("review")},"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5 \u2192")),s.createElement("div",{className:"df-right-body",hidden:r!=="review"},s.createElement("button",{className:"df-back-link",onClick:()=>z("assistant")},"\u2190 \u8FD4\u56DE\u95EE\u7B54"),r==="review"&&s.createElement(De,{key:_.id,project:_,services:N,onChanged:S})),s.createElement("div",{className:"df-right-body df-dock-files",hidden:r!=="preview"},T&&s.createElement("p",{className:"df-alert"},"\u4E2D\u95F4\u8868\u5355\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\uFF0C\u9884\u89C8\u6587\u4EF6\u4FDD\u7559\u751F\u6210\u65F6\u7684\u5185\u5BB9\u3002"),s.createElement("details",{open:!u&&!G,className:"df-dock-file-list"},s.createElement("summary",null,"\u672C\u9636\u6BB5\u6587\u4EF6 \xB7"," ",P.reduce((w,k)=>w+k.generation.files.length,0)," \u4EFD"),P.map(({form:w,generation:k})=>s.createElement("section",{className:"df-generation",key:k.id},s.createElement("div",{className:"df-generation-heading"},s.createElement("h3",null,N.time(k.created_at)," \xB7 \u4FEE\u8BA2"," ",k.revision,k.date_style!=="zh-CN"&&" \xB7 \u539F\u65E5\u671F\u683C\u5F0F",k.naming_style!=="formal"&&" \xB7 \u539F\u6587\u4EF6\u540D"),s.createElement("button",{onClick:()=>K(`/cases/${w.case_id}/outputs/${k.id}/\u5168\u90E8\u6587\u4E66.zip`,k.bundle_name||_.name+"_\u6587\u4E66.zip")},"\u6253\u5305\u4E0B\u8F7D")),k.files.map(p=>s.createElement("div",{className:"df-dock-file-row",key:p.name},s.createElement("button",{className:"df-dock-file","aria-label":p.name,onClick:()=>F(ut(w,k,p))},p.name,s.createElement("small",null,p.recipient," \xB7 ",(p.size/1024).toFixed(0)," KB",p.print_copies>1&&` \xB7 \u5EFA\u8BAE\u6253\u5370 ${p.print_copies} \u4EFD`)),s.createElement("button",{"aria-label":"\u4E0B\u8F7D"+p.name,onClick:()=>K(`/cases/${w.case_id}/outputs/${k.id}/${encodeURIComponent(p.name)}`,p.name)},"\u2193"))))),!P.length&&s.createElement("p",{className:"df-muted"},"\u751F\u6210\u6587\u4E66\u6216\u4ECE\u4E2D\u95F4\u7684\u6750\u6599\u6E05\u5355\u9009\u62E9\u6587\u4EF6\u540E\uFF0C\u5728\u8FD9\u91CC\u9884\u89C8\u3002"),_.forms.filter(w=>w.case_id!==_.form_id).map(w=>s.createElement("button",{className:"df-dock-file",key:w.case_id,onClick:()=>K(`/cases/${w.case_id}/excel`,w.name+"_\u5386\u53F2\u5E95\u7A3F.xlsx")},"\u5386\u53F2\u5E95\u7A3F\uFF1A",w.name," \u2193"))),P.length>0&&s.createElement("p",{className:"df-muted"},"\u6587\u4EF6\u4FDD\u7559\u5404\u6279\u6B21\u751F\u6210\u65F6\u7684\u5185\u5BB9\uFF0C\u4FEE\u6539\u8868\u5355\u540E\u8BF7\u91CD\u65B0\u6838\u5BF9\u751F\u6210\u3002"),G?s.createElement(o,{key:G.id,file:G,projectId:_.id,download:K,embedded:!0,onClose:()=>F(null)}):u?s.createElement("section",{className:"df-dock-preview","aria-label":"\u6587\u4EF6\u9884\u89C8"},s.createElement("h3",null,u.artifact.title),L?s.createElement(We,{key:u.artifact.id,artifact:u.artifact},s.createElement(L,{artifact:u.artifact,readOnly:!0,hostControls:!0})):s.createElement("p",{role:"status"},"\u6B63\u5728\u6253\u5F00\u9884\u89C8\u2026"),s.createElement("button",{className:"df-dock-ask",onClick:()=>z("assistant")},"\u5C31\u6B64\u6587\u4EF6\u63D0\u95EE \u2192"),s.createElement("button",{className:"df-dock-ask",onClick:()=>K(`/cases/${u.reference.case_id}/outputs/${u.reference.generation_id}/${encodeURIComponent(u.reference.name)}`,u.artifact.title)},"\u4E0B\u8F7D\u5F53\u524D\u6587\u4EF6")):s.createElement("p",{className:"df-dock-empty"},"\u9009\u62E9\u4E00\u4EFD\u6587\u4EF6\uFF0C\u586B\u5199\u4E0E\u9884\u89C8\u53EF\u4EE5\u540C\u65F6\u8FDB\u884C\u3002")))}var ge=window.QwenPaw,e=ge.host.React,{useState:Q,useEffect:xe,useRef:ce}=e,He={pending:"\u672A\u5F00\u59CB",in_progress:"\u8FDB\u884C\u4E2D",submitted:"\u5DF2\u63D0\u4EA4",completed:"\u5DF2\u5B8C\u6210"},rt={pending:"\u5F85\u51C6\u5907",preparing:"\u6574\u7406\u4E2D",ready:"\u5F85\u63D0\u4EA4",submitted:"\u5DF2\u63D0\u4EA4",done:"\u5DF2\u5B8C\u6210",na:"\u4E0D\u9002\u7528"},xt=["\u4E0A\u62A5\u8BA1\u5212","\u9009\u5546\u8BBA\u8BC1","\u5546\u52A1\u8C08\u5224","\u5F00\u9898\u8BBA\u8BC1","\u7ED3\u9898\u9A8C\u6536","\u5F52\u6863\u4ED8\u6B3E"],dt=n=>n?new Date(n).toLocaleString("zh-CN",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}):"";function Te({title:n,children:b,onClose:m,error:h,busy:c=!1}){let _=ce(null);return xe(()=>{let l=document.activeElement;return _.current?.querySelector("input,select,textarea,button")?.focus(),()=>{l?.isConnected&&l.focus()}},[]),e.createElement("div",{className:"df-dialog-backdrop"},e.createElement("section",{ref:_,className:"df-dialog df-paper",role:"dialog","aria-modal":"true","aria-label":n,onKeyDown:l=>{if(l.key==="Escape"&&!c&&(l.stopPropagation(),m()),l.key==="Tab"){let N=[..._.current.querySelectorAll("button,input,textarea,select,a[href]")].filter(r=>!r.disabled);l.shiftKey&&document.activeElement===N[0]&&(l.preventDefault(),N.at(-1)?.focus()),!l.shiftKey&&document.activeElement===N.at(-1)&&(l.preventDefault(),N[0]?.focus())}}},e.createElement("div",{className:"df-section-head"},e.createElement("h2",null,n),e.createElement("button",{type:"button",disabled:c,onClick:m,"aria-label":"\u5173\u95ED"+n},"\xD7")),h&&e.createElement("p",{role:"alert",className:"df-alert error"},h),b))}function ot({file:n,projectId:b,download:m,onClose:h,embedded:c=!1}){let[_,l]=Q(null),[N,r]=Q(""),[z,u]=Q(""),F=n.name.split(".").pop().toLowerCase(),G=["pdf","png","jpg","jpeg"].includes(F)&&!ge.workspace?.loadPreview;xe(()=>{let T=!0,E;return G?ge.host.fetch(`/document-forms/projects/${b}/files/${n.id}`).then(async D=>{if(!D.ok)throw new Error("\u9884\u89C8\u672A\u80FD\u6253\u5F00\uFF0C\u8BF7\u4E0B\u8F7D\u67E5\u770B");let M=await D.blob();T&&(E=URL.createObjectURL(new Blob([M],{type:n.mime})),r(E))}).catch(D=>T&&u(D.message)):ge.workspace?.loadPreview||["doc","docx","xls","xlsx","ppt","pptx"].includes(F)?(ge.workspace?.loadPreview?ge.workspace.loadPreview():Promise.resolve(se)).then(D=>T&&l(()=>D)).catch(()=>T&&l(()=>se)):u("\u6B64\u683C\u5F0F\u8BF7\u4E0B\u8F7D\u540E\u67E5\u770B\u3002"),()=>{T=!1,E&&URL.revokeObjectURL(E)}},[n.id]);let o={id:n.id,title:n.name,source:"uploaded",extension:F,mimeType:n.mime,binaryUrl:n.preview_url,agentId:ge.host.getSelectedAgentId?.(),createdAt:Date.parse(n.uploaded_at)};return e.createElement(c?"section":Te,{...c?{className:"df-dock-preview","aria-label":"\u6587\u4EF6\u9884\u89C8"}:{title:n.name,onClose:h}},c&&e.createElement("h3",null,n.name),e.createElement("div",{className:"df-attachment-preview"},z?e.createElement("p",{role:"alert"},z):G&&N?F==="pdf"?e.createElement("iframe",{title:n.name,src:N,sandbox:"allow-same-origin"}):e.createElement("img",{src:N,alt:n.name}):_?e.createElement(_,{artifact:o,readOnly:!0,hostControls:!0}):e.createElement("p",{role:"status"},"\u6B63\u5728\u6253\u5F00\u9884\u89C8\u2026")),e.createElement("div",{className:"df-actions"},e.createElement("button",{onClick:()=>m(`/projects/${b}/files/${n.id}`,n.name)},"\u4E0B\u8F7D\u539F\u6587\u4EF6"),e.createElement("button",{onClick:h},"\u5173\u95ED\u9884\u89C8")))}function Je({Editor:n,services:b}){let{request:m,json:h,download:c,Field:_}=b,[l,N]=Q([]),[r,z]=Q(null),[u,F]=Q("overview"),[G,o]=Q(""),[S,T]=Q(null),[E,D]=Q(!1),[M,O]=Q(!1),[L,g]=Q(""),[j,W]=Q(""),[K,P]=Q(""),[w,k]=Q(""),[p,U]=Q(null),[v,q]=Q({}),[V,A]=Q(null),[Y,Ie]=Q(!1),[Pe,Oe]=Q(!1),[he,ve]=Q(()=>{try{let t=Number(window.localStorage.getItem("ugsci.document-forms.right-width"));return Number.isFinite(t)&&t>=300&&t<=3e3?t:500}catch{return 500}}),[te,Qe]=Q(1200),pe=ce(null);xe(()=>{let t=pe.current;if(!t||!r?.single_form)return;let f=()=>{let X=t.getBoundingClientRect().width;if(X<=850)return;let Ke=t.querySelector(".df-project-sidebar").getBoundingClientRect().width,Re=Math.max(300,Math.floor(X-Ke-(window.innerWidth<=1050?380:440)));Qe(Re),ve(ft=>Math.min(Re,Math.max(300,ft)))};f();let C=typeof ResizeObserver=="function"?new ResizeObserver(f):null;return C?.observe(t),window.addEventListener("resize",f),()=>{C?.disconnect(),window.removeEventListener("resize",f)}},[Y,r?.single_form]),xe(()=>{try{window.localStorage.setItem("ugsci.document-forms.right-width",String(he))}catch{}},[he]);let R=t=>ve(Math.min(te,Math.max(300,Math.round(t)))),[de,ie]=Q(null),[Ae,H]=Q("assistant"),ee=ce(!0),ae=ce(0),ze=ce(null),Z=ce(null),Ce=ce(""),$e=ce(null),we=ce(null);we.current=r?.id,xe(()=>{$e.current?.scrollTo?.({top:0})},[r?.id,u,S?.id]);let Me=ge.host.useTheme?.()||"light",$=r?.stages.find(t=>t.id===u),Se=r?.forms.filter(t=>t.stage_id===u)||[],_e=()=>!E&&!M||window.confirm("\u8D44\u6599\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\uFF0C\u662F\u5426\u653E\u5F03\u8FD9\u4E9B\u4FEE\u6539\u5E76\u79BB\u5F00\uFF1F");async function ye(){let t=await m("/projects");return ee.current&&N(t),t}async function J(t=r?.id,f=!1){let C=t?await m("/projects/"+t):null;return ee.current&&C&&(f||!we.current||we.current===t)&&(we.current!==C.id&&(A(null),ie(null),H("assistant")),we.current=C.id,z(X=>X?.id===C.id&&X.revision>C.revision?X:C)),await ye(),C}xe(()=>(ee.current=!0,W("\u8F7D\u5165\u9879\u76EE"),ye().then(async t=>{if(t.length&&ee.current){let f=await m("/projects/"+t[0].id);ee.current&&z(f)}}).catch(t=>ee.current&&P(t.message)).finally(()=>ee.current&&W("")),()=>{ee.current=!1,ae.current++}),[]),xe(()=>{let t=f=>{(E||M)&&(f.preventDefault(),f.returnValue="")};return window.addEventListener("beforeunload",t),()=>window.removeEventListener("beforeunload",t)},[E,M]);async function a(t,f){if(j)return;let C=++ae.current;W(t),P(""),k("");try{await f()}catch(X){ee.current&&C===ae.current&&P(X.message)}finally{ee.current&&C===ae.current&&W("")}}async function d(t){_e()&&await a("\u6253\u5F00\u9879\u76EE",async()=>{T(null),D(!1),O(!1),F("overview"),await J(t,!0),T(null),D(!1),O(!1),A(null),ie(null),H("assistant"),F("overview")})}async function y(t){_e()&&(F(t),T(null),D(!1),O(!1),k(""),P(""),r.single_form&&r.stages.some(f=>f.id===t)&&await a("\u6253\u5F00\u9879\u76EE\u8868\u5355",async()=>{let f=await m(`/projects/${r.id}/form`,h({revision:r.revision,stage_id:t}));await J(),T({id:f.id,view:"edit",revision:f.revision,initialDraft:f})}))}function B(t,f){q(f),U(t),P("")}async function oe(t,f,C="POST"){let X=await m(t,{...h({...f,revision:r.revision}),method:C});return ee.current&&(z(X),U(null)),await ye(),X}function Ee(t){return a(t?"\u8BFB\u53D6\u9636\u6BB5 Excel":"\u51C6\u5907\u8C08\u5224\u8868\u5355",async()=>{let f;if(t){let C=new FormData;C.append("revision",r.revision),C.append("stage_id",u),C.append("workbook",t),f=await m(`/projects/${r.id}/${r.single_form?"form":"cases"}/import`,{method:"POST",body:C})}else f=await m(`/projects/${r.id}/${r.single_form?"form":"cases"}`,h({revision:r.revision,stage_id:u}));await J(),T({id:f.id,view:"edit",revision:f.revision,initialDraft:r.single_form?f:void 0}),D(!1),t&&k(f.templates.length?"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\uFF0C\u5E76\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002":"\u5DF2\u8BFB\u53D6\u672C\u9636\u6BB5\u53D8\u91CF\u914D\u7F6E\uFF0C\u8BF7\u6DFB\u52A0\u5BF9\u5E94\u7684 Word \u6A21\u677F\u3002")})}function Ge(t){if(!t)return;let f=Ce.current;return a("\u4FDD\u5B58\u6750\u6599",async()=>{let C=new FormData;C.append("revision",r.revision),C.append("file",t);let X=await m(`/projects/${r.id}/stages/${u}/materials/${f}/files`,{method:"POST",body:C});z(X),await ye(),k("\u6750\u6599\u5DF2\u4FDD\u5B58\uFF0C\u539F\u6709\u7248\u672C\u7EE7\u7EED\u4FDD\u7559\u3002\u8BF7\u6838\u5BF9\u540E\u66F4\u65B0\u6750\u6599\u72B6\u6001\u3002")})}let je=r?`/projects/${r.id}`:"",pt=t=>{t.preventDefault(),a("\u4FDD\u5B58\u6750\u6599\u4FE1\u606F",()=>oe(`${je}/stages/${u}/materials${v.id?"/"+v.id:""}`,v,v.id?"PUT":"POST"))},Ze=t=>a("\u6574\u7406\u4E0B\u8F7D\u5305",()=>c(je+"/bundle"+(t?"?stage_id="+t:""),`${r.name}_${t?$.title:"\u5168\u6D41\u7A0B\u6750\u6599"}.zip`));return e.createElement("main",{ref:pe,style:{"--df-dock-size":he+"px"},className:"df-app df-project-app"+(r?.single_form?" df-three-column":"")+(Y?" df-left-collapsed":"")+(Pe?" df-right-collapsed":""),"data-theme":Me},e.createElement("style",null,tt),e.createElement("input",{ref:ze,type:"file",accept:".xlsx",hidden:!0,"aria-label":"\u5BFC\u5165\u9636\u6BB5 Excel",onChange:t=>{let f=t.target.files[0];t.target.value="",f&&Ee(f)}}),e.createElement("input",{ref:Z,type:"file",accept:".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.png,.jpg,.jpeg,.zip,.txt,.csv",hidden:!0,"aria-label":"\u4E0A\u4F20\u9636\u6BB5\u6750\u6599",onChange:t=>{let f=t.target.files[0];t.target.value="",Ge(f)}}),e.createElement("aside",{className:"df-sidebar df-project-sidebar"+(Y?" df-pane-collapsed":""),"aria-label":"\u9879\u76EE\u9009\u62E9"},e.createElement("button",{className:"df-pane-toggle","aria-label":Y?"\u5C55\u5F00\u9879\u76EE\u680F":"\u6536\u8D77\u9879\u76EE\u680F","aria-expanded":!Y,title:Y?"\u5C55\u5F00\u9879\u76EE\u680F":"\u6536\u8D77\u9879\u76EE\u680F",onClick:()=>Ie(t=>!t)},e.createElement("span",{"aria-hidden":"true"},Y?"\u203A":"\u2039"),e.createElement("span",null,Y?"\u9879\u76EE":"\u6536\u8D77")),e.createElement("div",{className:"df-brand"},"UGSci ",e.createElement("span",null,"\u9879\u76EE\u6750\u6599")),e.createElement("button",{className:"df-primary df-new",disabled:!!j||!!L,onClick:()=>{_e()&&B("create",{name:"",code:"",owner:""})}},"\uFF0B \u65B0\u5EFA\u9879\u76EE"),e.createElement("label",{className:"df-project-search"},e.createElement("span",{className:"df-sr-only"},"\u641C\u7D22\u9879\u76EE"),e.createElement("input",{"aria-label":"\u641C\u7D22\u9879\u76EE",placeholder:"\u641C\u7D22\u9879\u76EE\u540D\u79F0\u6216\u7F16\u53F7",value:G,onChange:t=>o(t.target.value)})),e.createElement("div",{className:"df-caption"},"\u6211\u7684\u9879\u76EE ",e.createElement("span",null,l.length)),e.createElement("nav",{"aria-label":"\u9879\u76EE\u5217\u8868"},l.filter(t=>(t.name+" "+t.code).toLowerCase().includes(G.toLowerCase())).map(t=>e.createElement("button",{key:t.id,disabled:!!j||!!L,"aria-current":r?.id===t.id?"page":void 0,onClick:()=>d(t.id)},e.createElement("b",null,t.name),e.createElement("small",null,t.code||"\u672A\u8BBE\u7F16\u53F7"," \xB7 ",t.completed,"/6 \u9636\u6BB5\u5B8C\u6210")))),e.createElement("div",{className:"df-sidebar-foot"},e.createElement("b",null,"\u914D\u5957\u6A21\u677F"),e.createElement("p",null,"\u5546\u52A1\u8C08\u5224\u9636\u6BB5\u5DF2\u914D\u597D\u4E94\u4EFD Word \u6A21\u677F\uFF0C\u5176\u4F59\u9636\u6BB5\u53EF\u63A5\u5165\u5404\u81EA\u7684\u7EDF\u4E00\u6A21\u677F\u3002"),e.createElement("button",{disabled:!!j||!!L,onClick:()=>a("\u4E0B\u8F7D\u914D\u5957\u6A21\u677F",()=>c("/starter","\u6587\u4E66\u586B\u62A5_\u914D\u5957\u6A21\u677F.zip"))},"\u4E0B\u8F7D\u914D\u5957\u6A21\u677F \u2197"),e.createElement("small",null,"\u7A7A\u767D Excel \u4E0E 5 \u4EFD\u6807\u51C6 Word"))),e.createElement("section",{className:"df-main df-project-main",ref:$e},e.createElement("header",{className:"df-header"},e.createElement("div",null,e.createElement("span",{className:"df-eyebrow"},"UGSCI / \u9879\u76EE\u6750\u6599"),e.createElement("h1",null,r?.name||"\u9879\u76EE\u5DE5\u4F5C\u53F0"),e.createElement("p",null,r?[r.code||"\u672A\u8BBE\u9879\u76EE\u7F16\u53F7",r.owner&&"\u7ECF\u529E\u4EBA\uFF1A"+r.owner].filter(Boolean).join("\u3000\xB7\u3000"):"\u4ECE\u4E0A\u62A5\u8BA1\u5212\u5230\u5F52\u6863\u4ED8\u6B3E\uFF0C\u628A\u540C\u4E00\u9879\u76EE\u7684\u8D44\u6599\u653E\u5728\u4E00\u8D77\u3002")),r&&e.createElement("div",{className:"df-actions"},e.createElement("button",{disabled:!!j||!!L||!!S,onClick:()=>y("profile")},"\u57FA\u7840\u4FE1\u606F\u586B\u62A5"),e.createElement("button",{disabled:!!j||!!L,onClick:()=>Ze()},"\u4E0B\u8F7D\u9879\u76EE\u6750\u6599"))),K&&e.createElement("div",{role:"alert",className:"df-alert error"},K,e.createElement("button",{"aria-label":"\u5173\u95ED\u9519\u8BEF\u63D0\u793A",onClick:()=>P("")},"\xD7")),w&&e.createElement("div",{className:"df-alert",role:"status"},w),j&&e.createElement("div",{className:"df-progress",role:"status"},j,"\u2026"),r?e.createElement(e.Fragment,null,e.createElement("nav",{className:"df-project-tabs","aria-label":"\u9879\u76EE\u9636\u6BB5"},e.createElement("button",{className:u==="overview"?"active":"",disabled:!!j||!!L,onClick:()=>y("overview")},"\u9879\u76EE\u603B\u89C8"),r.stages.map((t,f)=>e.createElement("button",{key:t.id,"aria-current":u===t.id?"step":void 0,className:u===t.id?"active":"",disabled:!!j||!!L,onClick:()=>y(t.id)},e.createElement("small",null,String(f+1).padStart(2,"0")),t.title,e.createElement("span",{className:"df-state df-state-"+t.status},t.upstream_changed.length||t.documents_changed?"\u5F85\u590D\u6838":He[t.status])))),S?e.createElement(n,{key:r.id+":"+S.id+":"+u+":"+(S.revision||""),project:r,workflowStage:$,initialCaseId:S.id,initialView:S.view,initialDraft:S.initialDraft,onDirtyChange:D,onBusyChange:g,onViewChange:()=>$e.current?.scrollTo?.({top:0}),onBack:()=>{T(null),D(!1),J().catch(t=>P(t.message))},onChanged:()=>J(),docked:r.single_form,onStageStatus:()=>B("stage",{...$,confirmed:!1}),onPreview:t=>{ie(t),A(null),H("preview")}}):e.createElement("fieldset",{className:"df-content",disabled:!!j||!!L},u==="overview"&&e.createElement(e.Fragment,null,r.migrated&&e.createElement("p",{className:"df-muted df-migration-note"},"\u5386\u53F2\u586B\u62A5\u5DF2\u6309\u9879\u76EE\u540D\u79F0\u6216\u7F16\u53F7\u5F52\u5165\u5546\u52A1\u8C08\u5224\u9636\u6BB5\uFF0C\u539F\u8868\u5355\u3001\u751F\u6210\u6279\u6B21\u548C\u6587\u4EF6\u5747\u4FDD\u7559\u3002"),e.createElement("section",{className:"df-project-metrics"},e.createElement("div",null,e.createElement("b",null,r.stages.filter(t=>t.status==="completed").length,e.createElement("small",null,"/ 6")),e.createElement("span",null,"\u5DF2\u5B8C\u6210\u9636\u6BB5")),e.createElement("div",null,e.createElement("b",null,r.stages.reduce((t,f)=>t+f.materials.filter(C=>!["done","na"].includes(C.status)).length,0)),e.createElement("span",null,"\u5F85\u6574\u7406\u6750\u6599")),e.createElement("div",null,e.createElement("b",null,r.forms.reduce((t,f)=>t+f.outputs,0)),e.createElement("span",null,"\u5DF2\u751F\u6210\u6587\u4EF6")),e.createElement("div",null,e.createElement("b",null,r.stages.filter(t=>t.upstream_changed.length||t.documents_changed).length),e.createElement("span",null,"\u5F85\u590D\u6838\u9636\u6BB5"))),e.createElement("div",{className:"df-project-stage-grid"},r.stages.map((t,f)=>e.createElement("button",{className:"df-paper df-stage-card",key:t.id,onClick:()=>y(t.id)},e.createElement("div",{className:"df-section-head"},e.createElement("small",null,"\u9636\u6BB5 ",String(f+1).padStart(2,"0")),e.createElement("span",{className:"df-state df-state-"+t.status},He[t.status])),e.createElement("h2",null,t.title),e.createElement("p",null,t.purpose),e.createElement("footer",null,e.createElement("span",null,t.materials.filter(C=>["done","na"].includes(C.status)).length,"/",t.materials.length," \u9879\u6750\u6599\u5DF2\u5904\u7406"),e.createElement("span",null,t.upstream_changed.length||t.documents_changed?"\u6709\u53D8\u66F4\u5F85\u590D\u6838":t.due_date?"\u8BA1\u5212 "+t.due_date:"\u8FDB\u5165\u9636\u6BB5 \u2192"))))),e.createElement("section",{className:"df-paper df-project-hint"},e.createElement("h2",null,"\u4E00\u4EFD\u9879\u76EE\u5E95\u7A3F\uFF0C\u8D2F\u7A7F\u5404\u9636\u6BB5"),e.createElement("p",null,"\u9879\u76EE\u540D\u79F0\u3001\u7814\u7A76\u5185\u5BB9\u3001\u6210\u679C\u6307\u6807\u548C\u9884\u7B97\u7B49\u53EF\u5728\u201C\u57FA\u7840\u4FE1\u606F\u586B\u62A5\u201D\u7EDF\u4E00\u7EF4\u62A4\u3002\u9636\u6BB5\u8868\u5355\u4ECE\u5E95\u7A3F\u53D6\u503C\uFF0C\u540E\u7EED\u53D8\u66F4\u4F1A\u63D0\u9192\u6838\u5BF9\uFF1B\u5DF2\u6709\u751F\u6210\u6587\u4EF6\u4FDD\u7559\u539F\u6837\u3002"),e.createElement("button",{onClick:()=>y("profile")},"\u586B\u5199\u57FA\u7840\u4FE1\u606F"))),u==="profile"&&e.createElement(bt,{onDirtyChange:O,key:r.id+":"+r.revision,project:r,Field:_,onSave:t=>a("\u4FDD\u5B58\u57FA\u7840\u4FE1\u606F",async()=>{await oe(je,t,"PUT"),k("\u57FA\u7840\u4FE1\u606F\u5DF2\u66F4\u65B0\u3002\u5DF2\u6709\u8868\u5355\u53EF\u9010\u9879\u6838\u5BF9\u540E\u540C\u6B65\uFF0C\u539F\u751F\u6210\u6587\u4EF6\u4E0D\u53D8\u3002")})}),$&&e.createElement(e.Fragment,null,e.createElement("section",{className:"df-paper df-stage-header"},e.createElement("div",null,e.createElement("div",{className:"df-eyebrow"},"\u9636\u6BB5\u6750\u6599"),e.createElement("h2",null,$.title),e.createElement("p",null,$.purpose),e.createElement("p",{className:"df-muted"},$.id==="negotiation"?"\u4E94\u4EFD\u6807\u51C6\u6A21\u677F\u5DF2\u63A5\u5165\uFF0C\u53EF\u76F4\u63A5\u586B\u5199\uFF0C\u4E5F\u53EF\u5BFC\u5165\u73B0\u6709 Excel\u3002":"\u7EDF\u4E00\u6A21\u677F\u5F85\u8865\u5145\uFF1B\u73B0\u9636\u6BB5\u53EF\u6574\u7406\u6750\u6599\u3001\u4E0A\u4F20\u6587\u4EF6\uFF0C\u6216\u5BFC\u5165\u5DF2\u6709 Excel \u4E0E Word \u6A21\u677F\u3002")),e.createElement("div",{className:"df-actions"},e.createElement("button",{onClick:()=>Ze($.id)},"\u4E0B\u8F7D\u672C\u9636\u6BB5\u6750\u6599"),e.createElement("button",{onClick:()=>B("stage",{...$,confirmed:!1})},"\u529E\u7406\u4FE1\u606F\u4E0E\u72B6\u6001"))),($.upstream_changed.length>0||$.documents_changed)&&e.createElement("div",{className:"df-alert df-stage-warning"},e.createElement("div",null,e.createElement("b",null,"\u672C\u9636\u6BB5\u6709\u8D44\u6599\u9700\u8981\u590D\u6838"),e.createElement("p",null,$.upstream_changed.length>0&&"\u524D\u5E8F\u9636\u6BB5\u5DF2\u66F4\u65B0\uFF1A"+$.upstream_changed.join("\u3001")+"\u3002",$.documents_changed&&"\u672C\u9636\u6BB5\u8868\u5355\u6216\u751F\u6210\u6587\u4EF6\u6709\u66F4\u65B0\u3002","\u8BF7\u6838\u5BF9\u5DF2\u63D0\u4EA4\u7684\u6750\u6599\u662F\u5426\u9700\u8981\u8C03\u6574\u3002")),e.createElement("button",{onClick:()=>a("\u8BB0\u5F55\u590D\u6838",()=>oe(`${je}/stages/${$.id}/acknowledge`,{}))},"\u5DF2\u6838\u5BF9\u53D8\u66F4")),($.system_name||$.due_date||$.submission_ref||$.notes)&&e.createElement("section",{className:"df-paper df-stage-details"},e.createElement("dl",null,e.createElement("div",null,e.createElement("dt",null,"\u8BA1\u5212\u65E5\u671F"),e.createElement("dd",null,$.due_date||"\u672A\u8BBE\u7F6E")),e.createElement("div",null,e.createElement("dt",null,"\u529E\u7406\u7CFB\u7EDF"),e.createElement("dd",null,$.system_url?e.createElement("a",{href:$.system_url,target:"_blank",rel:"noopener noreferrer"},$.system_name||"\u6253\u5F00\u529E\u7406\u7CFB\u7EDF"," \u2197"):$.system_name||"\u672A\u8BB0\u5F55")),e.createElement("div",null,e.createElement("dt",null,"\u63D0\u4EA4\u7F16\u53F7 / \u56DE\u6267"),e.createElement("dd",null,$.submission_ref||"\u672A\u8BB0\u5F55"))),$.notes&&e.createElement("p",null,$.notes)),e.createElement("section",{className:"df-paper df-stage-forms"},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,r.single_form?"\u9879\u76EE\u8868\u5355":"\u586B\u5199\u4E0E\u751F\u6210"),e.createElement("p",{className:"df-muted"},"\u8868\u5355\u6CBF\u7528\u9879\u76EE\u5E95\u7A3F\uFF0C\u6838\u5BF9\u540E\u751F\u6210\u3002\u5DF2\u6709\u6279\u6B21\u4FDD\u7559\u751F\u6210\u65F6\u7684\u5185\u5BB9\u3002")),e.createElement("div",{className:"df-actions"},($.id==="negotiation"||r.single_form)&&e.createElement("button",{className:"df-primary",onClick:()=>Ee()},r.single_form?"\u6253\u5F00\u9879\u76EE\u8868\u5355":"\u586B\u5199\u8C08\u5224\u6750\u6599"),e.createElement("button",{onClick:()=>ze.current.click()},"\u5BFC\u5165 Excel \u8868\u5355"))),r.single_form?e.createElement("p",{className:"df-muted"},"\u6BCF\u4E2A\u9879\u76EE\u5171\u7528\u4E00\u4EFD\u8868\u5355\uFF0C\u516D\u4E2A\u9636\u6BB5\u5404\u529E\u7406\u4E00\u6B21\u3002\u5DF2\u6709\u6587\u4E66\u4E0E\u5386\u53F2\u5E95\u7A3F\u53EF\u5728\u53F3\u4FA7\u67E5\u770B\u3002"):Se.length?e.createElement("div",{className:"df-project-forms"},Se.map(t=>e.createElement("div",{key:t.case_id},e.createElement("div",null,e.createElement("b",null,t.name),e.createElement("small",null,dt(t.updated_at)," \xB7"," ",t.outputs?t.outputs+" \u4EFD\u6587\u4EF6":"\u586B\u5199\u4E2D",t.shared_changes.length>0&&" \xB7 \u57FA\u7840\u4FE1\u606F\u6709\u66F4\u65B0")),e.createElement("div",{className:"df-actions"},e.createElement("button",{onClick:()=>T({id:t.case_id,view:"edit"})},"\u6253\u5F00\u8868\u5355"),t.outputs>0&&e.createElement("button",{onClick:()=>T({id:t.case_id,view:"files"})},"\u67E5\u770B\u751F\u6210\u6587\u4EF6"))))):e.createElement("p",{className:"df-empty"},"\u672C\u9636\u6BB5\u8FD8\u6CA1\u6709\u8868\u5355\u3002\u5DF2\u6709\u6210\u54C1\u6587\u4EF6\u53EF\u76F4\u63A5\u4E0A\u4F20\u5230\u4E0B\u9762\u7684\u6750\u6599\u6E05\u5355\u3002")),$.id==="negotiation"&&e.createElement("section",{className:"df-paper df-review-entry"},e.createElement("div",null,e.createElement("h2",null,"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5"),e.createElement("p",{className:"df-muted"},"\u5BF9\u7167\u6B63\u5F0F\u8C08\u5224\u6587\u4EF6\uFF0C\u68C0\u67E5\u5404\u5355\u4F4D\u54CD\u5E94\u6750\u6599\uFF0C\u6C47\u603B\u95EE\u9898\u3001\u4F9D\u636E\u548C\u5F85\u786E\u8BA4\u4E8B\u9879\u3002")),e.createElement("button",{onClick:()=>r.single_form?H("review"):B("response-review",{})},"\u6253\u5F00\u6838\u67E5\u667A\u80FD\u4F53 \u2192")),e.createElement("section",{className:"df-paper df-material-panel"},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,"\u6750\u6599\u6E05\u5355 ",e.createElement("small",null,$.materials.length)),e.createElement("p",{className:"df-muted"},"\u5148\u6309\u5E38\u7528\u6750\u6599\u5217\u51FA\uFF0C\u53EF\u4FEE\u6539\u540D\u79F0\u3001\u589E\u8865\u6750\u6599\u6216\u6807\u4E3A\u4E0D\u9002\u7528\u3002\u201C\u5DF2\u63D0\u4EA4\u201D\u7531\u7ECF\u529E\u4EBA\u6838\u5B9E\u540E\u8BB0\u5F55\u3002")),e.createElement("button",{onClick:()=>B("material",{name:"",status:"pending",required:!1,note:""})},"\uFF0B \u6DFB\u52A0\u6750\u6599")),e.createElement("div",{className:"df-materials"},$.materials.map(t=>{let f=Se.reduce((C,X)=>C+(X.generations[0]?.files.filter(Ke=>Ke.name.includes(t.name)).length||0),0);return e.createElement("article",{className:"df-material-row",key:t.id},e.createElement("div",{className:"df-material-name"},e.createElement("b",null,t.name),t.required&&e.createElement("span",{className:"df-required-tag"},"\u5FC5\u5907"),e.createElement("span",{className:"df-state df-material-state-"+t.status},rt[t.status]),f>0&&e.createElement("small",null,"\u5DF2\u6709 ",f," \u4EFD\u751F\u6210\u7A3F \xB7 \u5728\u4E0A\u65B9\u8868\u5355\u67E5\u770B"),t.note&&e.createElement("p",null,t.note)),e.createElement("div",{className:"df-material-files"},t.files.length>0?e.createElement("details",null,e.createElement("summary",null,t.files.length," \u4EFD\u6587\u4EF6 / \u7248\u672C \xB7 \u6700\u65B0\uFF1A",t.files[t.files.length-1].name),[...t.files].reverse().map((C,X)=>e.createElement("div",{className:"df-material-file",key:C.id},e.createElement("div",null,e.createElement("b",null,"V",t.files.length-X," \xB7"," ",C.name),e.createElement("small",null,dt(C.uploaded_at)," \xB7"," ",Math.max(1,Math.round(C.size/1024))," ","KB")),e.createElement("button",{onClick:()=>{A(C),ie({artifact:{title:C.name},reference:{file_id:C.id}}),H("preview")}},"\u9884\u89C8"),e.createElement("button",{"aria-label":"\u4E0B\u8F7D"+C.name+"\u7248\u672C"+(t.files.length-X),onClick:()=>a("\u4E0B\u8F7D\u6750\u6599",()=>c(`${je}/files/${C.id}`,C.name))},"\u4E0B\u8F7D")))):e.createElement("span",{className:"df-muted"},"\u5C1A\u672A\u4E0A\u4F20\u6587\u4EF6")),e.createElement("div",{className:"df-actions"},e.createElement("button",{"aria-label":"\u4E0A\u4F20"+t.name,onClick:()=>{Ce.current=t.id,Z.current.click()}},"\u4E0A\u4F20\u6587\u4EF6"),e.createElement("button",{"aria-label":"\u7F16\u8F91"+t.name,onClick:()=>B("material",{...t})},"\u7F16\u8F91")))}))),e.createElement("div",{className:"df-stage-tail"},e.createElement("p",null,"\u5404\u9636\u6BB5\u53EF\u5E76\u884C\u51C6\u5907\uFF1B\u524D\u5E8F\u8D44\u6599\u53D8\u5316\u540E\uFF0C\u540E\u7EED\u9636\u6BB5\u4F1A\u63D0\u793A\u590D\u6838\u3002\u9636\u6BB5\u5B8C\u6210\u7531\u7ECF\u529E\u4EBA\u786E\u8BA4\u3002"),e.createElement("button",{onClick:()=>B("stage",{...$,confirmed:!1})},"\u66F4\u65B0\u529E\u7406\u72B6\u6001"))))):e.createElement("section",{className:"df-paper df-project-welcome"},e.createElement("h2",null,"\u5148\u5EFA\u4E00\u4E2A\u9879\u76EE"),e.createElement("p",null,"\u5171\u7528\u8D44\u6599\u53EA\u6574\u7406\u4E00\u6B21\uFF0C\u8868\u5355\u4E0E\u9644\u4EF6\u6309\u9636\u6BB5\u5F52\u96C6\uFF0C\u751F\u6210\u7A3F\u4E0E\u5B9A\u7A3F\u5206\u522B\u7559\u75D5\u3002"),e.createElement("div",{className:"df-welcome-stages"},xt.map((t,f)=>e.createElement("span",{key:t},e.createElement("small",null,String(f+1).padStart(2,"0")),t))),e.createElement("button",{className:"df-primary",onClick:()=>B("create",{name:"",code:"",owner:""})},"\u5EFA\u7ACB\u7B2C\u4E00\u4E2A\u9879\u76EE"))),r?.single_form&&e.createElement(Xe,{key:r.id,collapsed:Pe,width:he,maxWidth:te,onResize:R,onToggle:()=>Oe(t=>!t),project:r,stageId:u,services:b,mode:Ae,onMode:H,selection:de,attachment:V,AttachmentPreview:ot,dirty:E,onSelect:t=>{ie(t),A(null),H("preview")},onChanged:()=>J().catch(t=>P(t.message))}),p==="response-review"&&e.createElement(Te,{title:"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5",onClose:()=>{U(null),J().catch(t=>P(t.message))}},e.createElement(De,{project:r,services:b,onChanged:()=>J().catch(t=>P(t.message))})),p==="create"&&e.createElement(Te,{title:"\u65B0\u5EFA\u9879\u76EE",busy:!!j,error:K,onClose:()=>U(null)},e.createElement("form",{onSubmit:t=>{t.preventDefault(),a("\u5EFA\u7ACB\u9879\u76EE",async()=>{let f=await m("/projects",h(v));A(null),ie(null),H("assistant"),z(f),F("overview"),T(null),D(!1),U(null),await ye()})}},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u540D\u79F0"),e.createElement("input",{"aria-label":"\u65B0\u9879\u76EE\u540D\u79F0",required:!0,maxLength:120,value:v.name,onChange:t=>q({...v,name:t.target.value})})),e.createElement("div",{className:"df-fields"},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u7F16\u53F7"),e.createElement("input",{"aria-label":"\u65B0\u9879\u76EE\u7F16\u53F7",maxLength:100,value:v.code,onChange:t=>q({...v,code:t.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u7ECF\u529E\u4EBA"),e.createElement("input",{"aria-label":"\u65B0\u9879\u76EE\u7ECF\u529E\u4EBA",maxLength:100,value:v.owner,onChange:t=>q({...v,owner:t.target.value})}))),e.createElement("p",{className:"df-muted"},"\u5EFA\u7ACB\u9879\u76EE\u540E\uFF0C\u53EF\u6574\u7406\u5171\u7528\u8D44\u6599\uFF0C\u518D\u6309\u516D\u4E2A\u9636\u6BB5\u51C6\u5907\u6750\u6599\u3002"),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",disabled:!!j||!!L,onClick:()=>U(null)},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!j||!v.name?.trim(),type:"submit"},"\u5EFA\u7ACB\u9879\u76EE")))),p==="material"&&e.createElement(Te,{title:"\u6750\u6599\u4FE1\u606F",busy:!!j,error:K,onClose:()=>U(null)},e.createElement("form",{onSubmit:pt},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u6750\u6599\u540D\u79F0"),e.createElement("input",{"aria-label":"\u6750\u6599\u540D\u79F0",required:!0,maxLength:150,value:v.name,onChange:t=>q({...v,name:t.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u6750\u6599\u72B6\u6001"),e.createElement("select",{"aria-label":"\u6750\u6599\u72B6\u6001",value:v.status,onChange:t=>q({...v,status:t.target.value})},Object.entries(rt).map(([t,f])=>e.createElement("option",{key:t,value:t},f)))),e.createElement("label",{className:"df-checkbox"},e.createElement("input",{type:"checkbox",checked:v.required,onChange:t=>q({...v,required:t.target.checked})}),"\u672C\u9879\u76EE\u7684\u5FC5\u5907\u6750\u6599\uFF0C\u9636\u6BB5\u5B8C\u6210\u524D\u9700\u786E\u8BA4\u5DF2\u5B8C\u6210\u6216\u4E0D\u9002\u7528"),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u6750\u6599\u8BF4\u660E"),e.createElement("textarea",{"aria-label":"\u6750\u6599\u8BF4\u660E",rows:3,maxLength:3e3,value:v.note,onChange:t=>q({...v,note:t.target.value})})),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",onClick:()=>U(null),disabled:!!j||!!L},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!j||!!L,type:"submit"},"\u4FDD\u5B58\u6750\u6599\u4FE1\u606F")))),p==="stage"&&e.createElement(Te,{title:$.title+"\u529E\u7406\u4FE1\u606F",busy:!!j,error:K,onClose:()=>U(null)},e.createElement("form",{onSubmit:t=>{t.preventDefault(),a("\u4FDD\u5B58\u529E\u7406\u4FE1\u606F",()=>oe(`${je}/stages/${u}`,v,"PUT"))}},e.createElement("div",{className:"df-fields"},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9636\u6BB5\u72B6\u6001"),e.createElement("select",{"aria-label":"\u9636\u6BB5\u72B6\u6001",value:v.status,onChange:t=>q({...v,status:t.target.value})},Object.entries(He).map(([t,f])=>e.createElement("option",{key:t,value:t},f)))),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u8BA1\u5212\u65E5\u671F"),e.createElement("input",{"aria-label":"\u9636\u6BB5\u8BA1\u5212\u65E5\u671F",type:"date",value:v.due_date,onChange:t=>q({...v,due_date:t.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u529E\u7406\u7CFB\u7EDF"),e.createElement("input",{"aria-label":"\u529E\u7406\u7CFB\u7EDF",maxLength:150,value:v.system_name,onChange:t=>q({...v,system_name:t.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u7CFB\u7EDF\u5730\u5740"),e.createElement("input",{"aria-label":"\u7CFB\u7EDF\u5730\u5740",type:"url",placeholder:"https://",maxLength:1e3,value:v.system_url,onChange:t=>q({...v,system_url:t.target.value})}))),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u63D0\u4EA4\u7F16\u53F7 / \u56DE\u6267\u4FE1\u606F"),e.createElement("input",{"aria-label":"\u63D0\u4EA4\u7F16\u53F7",maxLength:500,value:v.submission_ref,onChange:t=>q({...v,submission_ref:t.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u529E\u7406\u8BF4\u660E"),e.createElement("textarea",{"aria-label":"\u529E\u7406\u8BF4\u660E",rows:4,maxLength:5e3,value:v.notes,onChange:t=>q({...v,notes:t.target.value})})),e.createElement("p",{className:"df-muted"},"\u8BB0\u5F55\u7EBF\u4E0B\u6216\u4E1A\u52A1\u7CFB\u7EDF\u7684\u5B9E\u9645\u529E\u7406\u7ED3\u679C\uFF0C\u56DE\u6267\u6587\u4EF6\u53EF\u4E0A\u4F20\u5230\u6750\u6599\u6E05\u5355\u3002"),v.status==="completed"&&e.createElement(e.Fragment,null,e.createElement("p",{className:"df-muted"},$.missing_required.length>0?"\u5C1A\u672A\u529E\u7ED3\u7684\u5FC5\u5907\u6750\u6599\uFF1A"+$.missing_required.join("\u3001"):"\u8BF7\u786E\u8BA4\u9636\u6BB5\u6750\u6599\u548C\u524D\u5E8F\u53D8\u66F4\u5DF2\u6838\u5BF9\u3002"),e.createElement("label",{className:"df-checkbox"},e.createElement("input",{"aria-label":"\u786E\u8BA4\u672C\u9636\u6BB5\u5DF2\u529E\u7ED3",type:"checkbox",checked:v.confirmed,onChange:t=>q({...v,confirmed:t.target.checked})}),"\u5DF2\u6838\u5BF9\u672C\u9636\u6BB5\u6750\u6599\u53CA\u524D\u5E8F\u53D8\u66F4\uFF0C\u786E\u8BA4\u672C\u9636\u6BB5\u5DF2\u529E\u7ED3")),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",onClick:()=>U(null),disabled:!!j||!!L},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!j||v.status==="completed"&&!v.confirmed,type:"submit"},"\u4FDD\u5B58\u529E\u7406\u4FE1\u606F")))),V&&!r.single_form&&e.createElement(ot,{key:V.id,file:V,projectId:r.id,download:(t,f)=>a("\u4E0B\u8F7D\u539F\u6587\u4EF6",()=>c(t,f)),onClose:()=>A(null)}))}function bt({project:n,Field:b,onSave:m,onDirtyChange:h}){let[c,_]=Q(n.fields),[l,N]=Q({name:n.name,code:n.code,owner:n.owner});return xe(()=>{h(JSON.stringify(c)!==JSON.stringify(n.fields)||l.name!==n.name||l.code!==n.code||l.owner!==n.owner)},[c,l]),e.createElement("form",{className:"df-paper df-project-profile",onSubmit:r=>{r.preventDefault(),m({...l,values:Object.fromEntries(c.map(z=>[z.key,z.value]))})}},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,"\u57FA\u7840\u4FE1\u606F\u586B\u62A5"),e.createElement("p",{className:"df-muted"},"\u5404\u9636\u6BB5\u8868\u5355\u590D\u7528\u8FD9\u91CC\u7684\u8D44\u6599\uFF1B\u9636\u6BB5\u65E5\u671F\u3001\u8BC4\u5BA1\u5206\u6570\u548C\u4ED8\u6B3E\u7ED3\u679C\u5206\u522B\u8BB0\u5F55\u3002")),e.createElement("button",{className:"df-primary",type:"submit"},"\u4FDD\u5B58\u57FA\u7840\u4FE1\u606F")),e.createElement("div",{className:"df-fields"},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u540D\u79F0"),e.createElement("input",{"aria-label":"\u9879\u76EE\u540D\u79F0",required:!0,value:l.name,maxLength:120,onChange:r=>N({...l,name:r.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u7F16\u53F7"),e.createElement("input",{"aria-label":"\u9879\u76EE\u7F16\u53F7",value:l.code,maxLength:100,onChange:r=>N({...l,code:r.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u7ECF\u529E\u4EBA"),e.createElement("input",{"aria-label":"\u7ECF\u529E\u4EBA",value:l.owner,maxLength:100,onChange:r=>N({...l,owner:r.target.value})}))),[...new Set(c.filter(r=>!["project.name","project.code"].includes(r.key)).map(r=>r.group))].map(r=>e.createElement("section",{className:"df-group",key:r},e.createElement("h3",null,r),e.createElement("div",{className:"df-fields"},c.filter(z=>z.group===r&&!["project.name","project.code"].includes(z.key)).map(z=>e.createElement(b,{key:z.key,field:{...z,required:!1},onChange:u=>_(c.map(F=>F.key===z.key?{...F,value:u}:F))}))))),e.createElement("div",{className:"df-actions"},e.createElement("button",{className:"df-primary",type:"submit"},"\u4FDD\u5B58\u57FA\u7840\u4FE1\u606F")))}var le=window.QwenPaw,i=le.host.React,{useState:ne,useEffect:Ne,useLayoutEffect:ht,useRef:Le}=i,Ye="/document-forms",vt="application/vnd.openxmlformats-officedocument.wordprocessingml.document";async function re(n,b){let m=await le.host.fetch(Ye+n,b);if(!m.ok){let h=await m.json().catch(()=>({}));throw new Error(typeof h.detail=="string"?h.detail:Array.isArray(h.detail)?h.detail.map(c=>`${c.loc?.slice(1).join(".")||"\u8D44\u6599"}\uFF1A${c.msg}`).join("\uFF1B"):`\u64CD\u4F5C\u672A\u5B8C\u6210\uFF08${m.status}\uFF09\uFF0C\u8BF7\u68C0\u67E5\u586B\u5199\u5185\u5BB9`)}return m.json()}async function Fe(n,b){let m=await le.host.fetch(Ye+n);if(!m.ok)throw new Error("\u6587\u4EF6\u4E0B\u8F7D\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5");let h=URL.createObjectURL(await m.blob()),c=document.createElement("a");c.href=h,c.download=b,document.body.appendChild(c);try{c.click()}finally{c.remove(),setTimeout(()=>URL.revokeObjectURL(h),1e3)}}var be=n=>({method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)}),Ue=n=>new Date(n).toLocaleString("zh-CN",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}),st=n=>n.kind==="textarea"||n.value.length>100||n.value.includes(`
`)||n.label.includes("\u6574\u6BB5"),wt=n=>/^(research\.contents|deliverables\.|metrics\.|milestones\.)/.test(n.key)||/主要研究内容|预期成果|考核指标|进度安排/.test(n.label);function Be(n){return n.map((b,m)=>{let h={...b};for(let c of["start","end"]){let _="follow_"+c;h[_]=m>0&&(typeof h[_]=="boolean"?h[_]:!h[c]),h[_]&&(h[c]=n[0][c])}return h})}function lt({field:n,displayValue:b,onChange:m}){let h=st(n),c=wt(n),_=["date","datetime-local"].includes(n.kind)?n.value:b??n.value,l=Le(null);return ht(()=>{if(!l.current)return;let N=l.current.scrollTop;l.current.style.height="auto",l.current.style.height=Math.max(c?104:192,l.current.scrollHeight)+"px",l.current.scrollTop=N},[_,h,c]),i.createElement("label",{className:"df-field"+(h?" df-field-paragraph":"")+(c?" df-field-compact":""),id:"df-"+n.key},i.createElement("span",null,n.label,n.required&&i.createElement("em",null,"\u5FC5\u586B")),h?i.createElement("textarea",{ref:l,"aria-label":n.label,rows:c?3:8,value:_,onChange:N=>m(N.target.value)}):i.createElement("input",{"aria-label":n.label,type:n.kind,step:n.kind==="number"?"any":void 0,value:_,onChange:N=>m(N.target.value)}),i.createElement("small",null,n.key))}function yt({project:n,workflowStage:b,initialCaseId:m,initialView:h,initialDraft:c,onBack:_,onChanged:l,onDirtyChange:N,onBusyChange:r,onViewChange:z,docked:u=!1,onPreview:F,onStageStatus:G}){let[o,S]=ne(null),[T,E]=ne(null),[D,M]=ne([]),[O,L]=ne("import"),[g,j]=ne(!1),[W,K]=ne(null),[P,w]=ne(!1),[k,p]=ne(""),[U,v]=ne(""),[q,V]=ne(""),[A,Y]=ne(null),[Ie,Pe]=ne(null),Oe=Le(null),he=Le(null),ve=Le(0),te=Le(!0),Qe=le.host.useTheme?.()||"light",pe=()=>l?.()||Promise.resolve();Ne(()=>(te.current=!0,(c?Promise.resolve(c):re("/cases/"+m)).then(a=>{te.current&&(de(a),L(h==="files"&&a.generations.length?"files":"edit"),h==="files"&&a.generations.length&&Y({file:a.generations[0].files[0],generation:a.generations[0]}))}).catch(a=>te.current&&v(a.message)),(le.workspace?.loadPreview?le.workspace.loadPreview():Promise.resolve(se)).then(a=>{te.current&&Pe(()=>a)}).catch(a=>{te.current&&Pe(()=>se)}),()=>{te.current=!1,ve.current++}),[]),Ne(()=>{N?.(g)},[g]),Ne(()=>{r?.(k)},[k]),Ne(()=>{z?.()},[O]),Ne(()=>{let a=d=>{g&&(d.preventDefault(),d.returnValue="")};return window.addEventListener("beforeunload",a),()=>window.removeEventListener("beforeunload",a)},[g]);async function R(a,d){if(k)return;let y=++ve.current;p(a),v(""),V("");try{await d()}catch(B){te.current&&y===ve.current&&v(B.message)}finally{te.current&&y===ve.current&&p("")}}function de(a){te.current&&(S({...a,recipients:Be(a.recipients),presentation_sources:Object.fromEntries(a.fields.map(d=>[d.key,d.value]))}),j(!1),K(null),w(!1))}function ie(a){S(a),j(!0),K(null),w(!1),V("")}function Ae(a,d,y,B=!1){let oe=o.recipients.map((Ee,Ge)=>Ge===a?{...Ee,[d]:y,...d!=="name"?{["follow_"+d]:B}:{}}:Ee);ie({...o,recipients:Be(oe)})}async function H(){if(!g)return o;let a={revision:o.revision,name:o.name.trim()||"\u672A\u547D\u540D\u586B\u62A5",values:Object.fromEntries(o.fields.map(y=>[y.key,y.value])),recipients:o.recipients},d=await re("/cases/"+o.id,{...be(a),method:"PUT"});return de(d),d}function ee(){return!g||window.confirm("\u5F53\u524D\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\u3002\u79BB\u5F00\u6B64\u8BB0\u5F55\uFF1F")}let ae=o?.templates||[],ze=ae.reduce((a,d)=>a+(d.per_recipient?o.recipients.length:1),0),Z=o?.generations.find(a=>!u||(a.stage_id||o.original_stage_id||b.id)===b.id);Ne(()=>{u&&O==="files"&&Z&&!A&&Y({file:Z.files[0],generation:Z})},[O,Z?.id]);let Ce=W?.checks.filter(a=>a.status!=="ok")||[];async function $e(a){!a||!ee()||await R("\u8BFB\u53D6 Excel",async()=>{let d=new FormData;d.append("workbook",a),d.append("revision",n.revision),d.append("stage_id",b.id);let y=await re(`/projects/${n.id}/${n.single_form?"form":"cases"}/import`,{method:"POST",body:d});de(y),Y(null),L("edit"),await pe(),V(y.templates.length?"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\uFF0C\u5E76\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002":y.template_notice||"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\u3002\u8BF7\u6DFB\u52A0\u5BF9\u5E94\u7684 Word \u6A21\u677F\u3002")})}async function we(a){a=Array.from(a),a.length&&await R("\u8BFB\u53D6 Word \u6A21\u677F",async()=>{let d=await H(),y=new FormData;y.append("revision",String(d.revision)),Array.from(a).forEach(B=>y.append("files",B)),de(await re("/cases/"+d.id+"/templates",{method:"POST",body:y})),await pe(),V("Word \u6A21\u677F\u5DF2\u6DFB\u52A0\uFF0C\u751F\u6210\u65F6\u4F1A\u4FDD\u7559\u539F\u6709\u6392\u7248\u3002")})}async function Me(){await R("\u6838\u5BF9\u8D44\u6599",async()=>{let a=await H(),d=await re("/cases/"+a.id+"/review",be({revision:a.revision}));te.current&&(K(d),w(!1),L("review"),await pe())})}async function $(){await R("\u751F\u6210\u6587\u4E66",async()=>{let a=await re("/cases/"+o.id+"/generate",be({revision:o.revision,review_token:W.review_token,confirmed:P}));de(a),L("files"),Y({file:a.generations[0].files[0],generation:a.generations[0]}),await pe()})}function Se(a){L("edit"),requestAnimationFrame(()=>{let d=document.getElementById("df-"+a);d?.scrollIntoView({behavior:"smooth",block:"center"}),d?.querySelector("input,textarea")?.focus()})}let _e=(a,d)=>`/cases/${o.id}/outputs/${a.id}/${encodeURIComponent(d)}`;function ye(a){return R("\u6B63\u5728\u4E0B\u8F7D\u538B\u7F29\u5305",async()=>{await Fe(_e(a,"\u5168\u90E8\u6587\u4E66.zip"),a.bundle_name||o.name+"_\u6587\u4E66.zip"),V(`\u5DF2\u5F00\u59CB\u4E0B\u8F7D\u8BE5\u6279\u6B21\u7684 ${a.files.length} \u4EFD\u6587\u4E66\u538B\u7F29\u5305\u3002`)})}let J=A?{id:A.generation.id+A.file.name,title:A.file.name,source:"generated",mimeType:vt,extension:"docx",binaryUrl:A.file.preview_url,printUrl:Ye+`/cases/${o.id}/print/${A.generation.id}/${encodeURIComponent(A.file.name)}`,agentId:le.host.getSelectedAgentId?.(),createdAt:Date.parse(A.generation.created_at)}:null;return Ne(()=>{u&&O==="files"&&J&&F?.({artifact:J,reference:{case_id:o.id,generation_id:A.generation.id,name:A.file.name}})},[O,A?.generation.id,A?.file.name]),i.createElement("div",{className:"df-app df-embedded-editor","data-theme":Qe},i.createElement("input",{ref:Oe,type:"file",accept:".xlsx",hidden:!0,"aria-label":"\u5BFC\u5165 Excel \u53D8\u91CF\u8868",onChange:a=>{$e(a.target.files[0]),a.target.value=""}}),i.createElement("input",{ref:he,type:"file",accept:".docx",multiple:!0,hidden:!0,"aria-label":"\u5BFC\u5165 Word \u6A21\u677F",onChange:a=>{we(a.target.files),a.target.value=""}}),i.createElement("section",{className:"df-main"},i.createElement("div",{className:"df-editor-context"},i.createElement("button",{disabled:!!k,onClick:()=>{ee()&&_()}},"\u2190 \u8FD4\u56DE",b.title),i.createElement("span",null,n.name," / ",b.title),u&&i.createElement("button",{disabled:!!k||g,title:g?"\u8BF7\u5148\u4FDD\u5B58\u8868\u5355":"\u66F4\u65B0\u5F53\u524D\u8282\u70B9\u7684\u529E\u7406\u4FE1\u606F",onClick:G},"\u529E\u7406\u4FE1\u606F\u4E0E\u72B6\u6001"),o&&i.createElement("div",{className:"df-actions"},i.createElement("button",{disabled:!!k,onClick:()=>{E("adopt"),M([])}},"\u6838\u5BF9\u9879\u76EE\u8D44\u6599\u5DEE\u5F02"),i.createElement("button",{disabled:!!k,onClick:()=>{E("publish"),M([])}},"\u5B58\u5165\u9879\u76EE\u5E95\u7A3F"))),i.createElement("header",{className:"df-header"},i.createElement("div",null,i.createElement("span",{className:"df-eyebrow"},b.title," / \u586B\u5199\u4E0E\u751F\u6210"),i.createElement("h1",null,o?u?b.title+" \xB7 \u9879\u76EE\u8868\u5355":o.name:"\u628A\u91CD\u590D\u586B\u5199\u7684\u8D44\u6599\uFF0C\u6574\u7406\u6210\u4E00\u5F20\u8868\u3002"),i.createElement("p",null,o?g?"\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539":`\u8349\u7A3F\u5DF2\u4FDD\u5B58 \xB7 ${Ue(o.updated_at)}`:"\u5BFC\u5165\u53D8\u91CF\u8868\u4E0E Word \u6A21\u677F\uFF0C\u586B\u5199\u3001\u6838\u5BF9\uFF0C\u518D\u751F\u6210\u6587\u4E66\u3002")),o&&i.createElement("button",{disabled:!!k||!g,onClick:()=>R("\u4FDD\u5B58\u8349\u7A3F",async()=>{await H(),await pe(),V("\u8349\u7A3F\u5DF2\u4FDD\u5B58")})},"\u4FDD\u5B58\u8349\u7A3F")),i.createElement("div",{className:"df-steps","aria-label":"\u586B\u5199\u6D41\u7A0B"},[["import","01","\u5BFC\u5165\u6A21\u677F"],["edit","02","\u586B\u5199\u8D44\u6599"],["review","03","\u6838\u5BF9\u751F\u6210"],["files","04","\u6587\u4EF6\u9884\u89C8"]].map(([a,d,y])=>i.createElement("button",{key:a,className:O===a?"active":"",disabled:!!k||!o&&a!=="import"||a==="files"&&!Z,onClick:()=>a==="review"?Me():L(a)},i.createElement("span",null,d),y))),U&&i.createElement("div",{className:"df-alert error",role:"alert"},U,i.createElement("button",{"aria-label":"\u5173\u95ED\u9519\u8BEF\u63D0\u793A",onClick:()=>v("")},"\xD7")),q&&i.createElement("div",{className:"df-alert",role:"status"},q),k&&i.createElement("div",{className:"df-progress",role:"status"},k,"\u2026"),i.createElement("fieldset",{className:"df-content",disabled:!!k},O==="import"&&i.createElement("div",{className:"df-import"},i.createElement("section",{className:"df-paper df-drop"},i.createElement("div",{className:"df-file-mark"},"XLSX"),i.createElement("h2",null,"\u4ECE Excel \u53D8\u91CF\u8868\u5F00\u59CB"),i.createElement("p",null,"\u201C\u53D8\u91CF\u914D\u7F6E\u201D\u5DE5\u4F5C\u8868\u4FDD\u7559\u4E09\u5217\uFF1A",i.createElement("br",null),i.createElement("b",null,"\u53D8\u91CF\u540D\u79F0\u3000\u4E2D\u6587\u540D\u79F0\u3000\u503C")),i.createElement("button",{className:"df-primary",onClick:()=>Oe.current.click()},"\u9009\u62E9 Excel \u53D8\u91CF\u8868"),i.createElement("small",null,"\u652F\u6301 .xlsx \xB7 \u5355\u4E2A\u6587\u4EF6\u4E0D\u8D85\u8FC7 15 MB")),i.createElement("section",{className:"df-paper df-import-note"},i.createElement("span",{className:"df-eyebrow"},"\u5982\u4F55\u51C6\u5907"),i.createElement("h2",null,"\u4E00\u4EFD\u6570\u636E\uFF0C\u591A\u4EFD\u6587\u4E66"),i.createElement("ol",null,i.createElement("li",null,i.createElement("b",null,"\u6574\u7406\u53D8\u91CF"),i.createElement("p",null,"\u4F8B\u5982 project.name / \u9879\u76EE\u540D\u79F0 / \u5B9E\u9645\u540D\u79F0\u3002\u652F\u6301\u5206\u7EC4\u3001\u7C7B\u578B\u548C\u5FC5\u586B\u5217\u3002")),i.createElement("li",null,i.createElement("b",null,"\u81EA\u52A8\u8F7D\u5165\u6A21\u677F"),i.createElement("p",null,"\u5E94\u7528\u81EA\u5E26 5 \u4EFD\u6807\u51C6 Word \u6A21\u677F\uFF0C\u4F7F\u7528\u914D\u5957 Excel \u5373\u53EF\u81EA\u52A8\u8F7D\u5165\uFF1B \u4E5F\u53EF\u6DFB\u52A0\u81EA\u5DF1\u7684\u6A21\u677F\u3002")),i.createElement("li",null,i.createElement("b",null,"\u5206\u522B\u751F\u6210\u9080\u8BF7\u51FD"),i.createElement("p",null,"\u5728\u201C\u53D7\u9080\u5355\u4F4D\u201D\u8868\u8BB0\u5F55\u5355\u4F4D\u540D\u79F0\u3001\u9886\u53D6\u5F00\u59CB\u65F6\u95F4\u548C\u9886\u53D6\u7ED3\u675F\u65F6\u95F4\u3002"))),i.createElement("p",{className:"df-muted"},"\u201C\u65E5\u671F\u6821\u6838\u201D\u8868\u4E2D\u7684\u65E7\u7ED3\u679C\u4E0D\u4F1A\u4F5C\u4E3A\u5224\u65AD\u4F9D\u636E\uFF1B\u5E94\u7528\u4F1A\u6839\u636E\u5F53\u524D\u586B\u5199\u5185\u5BB9\u91CD\u65B0\u6838\u5BF9\u3002\u201C\u6821\u6838\u89C4\u5219\u201D\u8868\u53EF\u8865\u5145\u81EA\u5B9A\u4E49\u5148\u540E\u5173\u7CFB\u3002"))),o&&(O==="edit"||u&&O==="files")&&i.createElement("div",{className:"df-edit-layout"},i.createElement("section",{className:"df-paper"},i.createElement("div",{className:"df-section-head"},i.createElement("h2",null,"\u586B\u5199\u4FE1\u606F"),i.createElement("button",{onClick:()=>R("\u5BFC\u51FA Excel",async()=>{let a=await H();await Fe(`/cases/${a.id}/excel`,(a.fields.find(d=>d.key==="project.name")?.value||a.name).replace(/[<>:"/\\|?*\x00-\x1f]/g,"_").slice(0,80)+"_\u586B\u5199\u6570\u636E.xlsx")})},"\u5BFC\u51FA\u5F53\u524D Excel")),i.createElement("label",{className:"df-field df-title-field"},i.createElement("span",null,"\u8868\u5355\u540D\u79F0"),i.createElement("input",{"aria-label":"\u8868\u5355\u540D\u79F0",maxLength:120,value:o.name,onChange:a=>ie({...o,name:a.target.value})})),[...new Set(o.fields.map(a=>a.group))].map(a=>i.createElement("section",{className:"df-group",key:a},i.createElement("h3",null,a),a==="\u65E5\u671F\u5B89\u6392"&&i.createElement("p",{className:"df-muted"},"\u6587\u4E66\u7EDF\u4E00\u4F7F\u7528\u4E2D\u6587\u65E5\u671F\uFF0C\u4F8B\u5982\u201C2026\u5E7410\u670822\u65E5\u4E0B\u534814:30\u201D\u3002\u65E5\u671F\u9009\u62E9\u5668\u4FDD\u7559\u539F\u6765\u7684\u586B\u5199\u65B9\u5F0F\u3002"),i.createElement("div",{className:"df-fields"},o.fields.filter(d=>d.group===a).map(d=>i.createElement(lt,{key:d.key,field:d,displayValue:o.presentation_sources?.[d.key]===d.value?o.document_values?.[d.key]:void 0,onChange:y=>ie({...o,fields:o.fields.map(B=>B.key===d.key?{...B,value:y}:B)})})))))),i.createElement("section",{className:"df-paper"},i.createElement("div",{className:"df-section-head"},i.createElement("div",null,i.createElement("h2",null,"\u53D7\u9080\u5355\u4F4D"," ",i.createElement("span",{className:"df-count"},o.recipients.length)),i.createElement("p",null,"\u6309\u5355\u4F4D\u6587\u4E66\u5206\u522B\u751F\u6210\uFF0C\u5171\u7528\u9879\u76EE\u4E0E\u843D\u6B3E\u4FE1\u606F\u3002")),i.createElement("button",{onClick:()=>ie({...o,recipients:Be([...o.recipients,{name:"",start:"",end:""}])}),disabled:o.recipients.length>=200},"\uFF0B \u6DFB\u52A0\u5355\u4F4D")),o.recipients.map((a,d)=>i.createElement("div",{className:"df-recipient",key:d,id:"df-recipient-"+d},i.createElement("div",{className:"df-recipient-title"},i.createElement("b",null,String(d+1).padStart(2,"0")),i.createElement("button",{"aria-label":`\u79FB\u9664\u7B2C${d+1}\u5BB6\u5355\u4F4D`,onClick:()=>ie({...o,recipients:Be(o.recipients.filter((y,B)=>B!==d))})},"\u79FB\u9664")),i.createElement("div",{className:"df-fields"},[["name","\u5355\u4F4D\u540D\u79F0"],["start","\u9886\u53D6\u5F00\u59CB\u65F6\u95F4"],["end","\u9886\u53D6\u7ED3\u675F\u65F6\u95F4"]].map(([y,B])=>i.createElement("label",{className:"df-field "+(y==="name"?"df-span":""),key:y},i.createElement("span",null,B),i.createElement("input",{"aria-label":`\u7B2C${d+1}\u5BB6${B}`,type:y==="name"?"text":"datetime-local",value:y==="name"?a[y]:a[y].replace(" ","T"),onChange:oe=>Ae(d,y,oe.target.value)}),d>0&&y!=="name"&&i.createElement("small",{className:"df-follow-state"},a["follow_"+y]?"\u8DDF\u968F\u7B2C1\u5BB6":"\u5DF2\u5355\u72EC\u8BBE\u7F6E",!a["follow_"+y]&&i.createElement("button",{type:"button","aria-label":`\u7B2C${d+1}\u5BB6${B}\u6062\u590D\u8DDF\u968F`,onClick:oe=>{oe.preventDefault(),Ae(d,y,o.recipients[0][y],!0)}},"\u6062\u590D\u8DDF\u968F")))))))),i.createElement("section",{className:"df-paper df-template-panel","aria-label":"Word \u6A21\u677F"},i.createElement("div",{className:"df-section-head"},i.createElement("h2",null,"Word \u6A21\u677F"),i.createElement("div",{className:"df-template-actions"},ae.length>0?i.createElement("button",{onClick:()=>R("\u4FDD\u5B58\u9ED8\u8BA4\u6A21\u677F",async()=>{let a=await H();await re(`/cases/${a.id}/defaults`,be({revision:a.revision})),V(b.id==="negotiation"?"\u5DF2\u8BBE\u4E3A\u672C\u673A\u9ED8\u8BA4\u6A21\u677F\uFF0C\u4EE5\u540E\u65B0\u5EFA\u586B\u62A5\u4F1A\u81EA\u52A8\u8F7D\u5165\u3002":"\u5DF2\u8BBE\u4E3A\u672C\u9636\u6BB5\u9ED8\u8BA4\u6A21\u677F\uFF0C\u4EE5\u540E\u65B0\u5EFA\u8BE5\u9636\u6BB5\u8868\u5355\u4F1A\u81EA\u52A8\u8F7D\u5165\u3002")})},b.id==="negotiation"?"\u8BBE\u4E3A\u9ED8\u8BA4\u6A21\u677F":"\u8BBE\u4E3A\u672C\u9636\u6BB5\u9ED8\u8BA4\u6A21\u677F"):i.createElement("button",{onClick:()=>R("\u8F7D\u5165\u9ED8\u8BA4\u6A21\u677F",async()=>{let a=await H();de(await re(`/cases/${a.id}/defaults/apply`,be({revision:a.revision}))),V("\u5DF2\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002")})},"\u4F7F\u7528\u9ED8\u8BA4\u6A21\u677F"),i.createElement("button",{onClick:()=>he.current.click()},"\uFF0B \u6DFB\u52A0"))),!ae.length&&i.createElement("p",{className:"df-muted"},"\u6DFB\u52A0\u4E0E\u4F60\u7684\u53D8\u91CF\u8868\u5BF9\u5E94\u7684 .docx \u6A21\u677F\u3002"),ae.map(a=>i.createElement("div",{className:"df-template",key:a.id},i.createElement("b",null,a.name),a.from_builtin&&i.createElement("small",null,"\u5E94\u7528\u81EA\u5E26\u6A21\u677F"),i.createElement("span",null,a.per_recipient?"\u6309\u53D7\u9080\u5355\u4F4D\u5206\u522B\u751F\u6210":"\u5171\u7528\u6587\u4EF6 \xB7 \u751F\u6210\u4E00\u4EFD"),a.print_copies>1&&i.createElement("small",null,"\u5EFA\u8BAE\u6253\u5370 ",a.print_copies," \u4EFD \xB7 ",a.print_note),i.createElement("small",null,a.keys.length," \u4E2A\u5F15\u7528\u53D8\u91CF"),i.createElement("button",{"aria-label":"\u79FB\u9664\u6A21\u677F"+a.name,onClick:()=>R("\u79FB\u9664\u6A21\u677F",async()=>{let d=await H();de(await re(`/cases/${d.id}/templates/${a.id}?revision=${d.revision}`,{method:"DELETE"}))})},"\u79FB\u9664")))),i.createElement("section",{className:"df-paper df-edit-footer","aria-label":"\u6838\u5BF9\u4E0E\u751F\u6210"},i.createElement("div",{className:"df-generation-plan"},i.createElement("h2",null,"\u6838\u5BF9\u4E0E\u751F\u6210"),i.createElement("p",null,"\u672C\u6B21\u8BA1\u5212\u751F\u6210 ",i.createElement("b",null,ze)," \u4EFD\u6587\u4E66"),i.createElement("small",null,ae.filter(a=>!a.per_recipient).length," ","\u4EFD\u5171\u7528\u6587\u4EF6 \xB7"," ",ae.filter(a=>a.per_recipient).length," ","\u7C7B\u6309\u5355\u4F4D\u6587\u4E66 \xD7 ",o.recipients.length," \u5BB6\u5355\u4F4D")),i.createElement("div",{className:"df-next-action"},i.createElement("button",{className:"df-primary",onClick:Me},"\u6838\u5BF9\u586B\u5199\u5185\u5BB9 \u2192"),i.createElement("small",null,"\u5148\u6838\u5BF9\u7F3A\u9879\u4E0E\u65E5\u671F\uFF0C\u518D\u786E\u8BA4\u751F\u6210")))),o&&O==="review"&&W&&i.createElement("div",{className:"df-review"},i.createElement("section",{className:"df-paper"},i.createElement("span",{className:"df-eyebrow"},"\u586B\u5199\u6838\u5BF9"),i.createElement("h2",null,W.can_generate?"\u8D44\u6599\u5DF2\u9F50\u5907\uFF0C\u8BF7\u786E\u8BA4\u672C\u6B21\u5185\u5BB9\u3002":`\u8FD8\u6709 ${Ce.length} \u9879\u9700\u8981\u5904\u7406`),i.createElement("p",null,"\u672C\u6B21\u4F7F\u7528\u4FEE\u8BA2 ",o.revision," \u7684\u6570\u636E\uFF0C\u8BA1\u5212\u751F\u6210 ",ze," ","\u4EFD\u6587\u4E66\u3002"),Ce.length>0&&i.createElement("div",{className:"df-checks"},Ce.map((a,d)=>i.createElement("div",{key:d,className:"df-check "+a.status},i.createElement("span",null,a.status==="ok"?"\u901A\u8FC7":a.status==="missing"?"\u5F85\u8865\u5145":"\u51B2\u7A81"),i.createElement("div",null,i.createElement("b",null,a.label),i.createElement("p",null,a.detail)),a.status!=="ok"&&a.field&&i.createElement("button",{onClick:()=>Se(a.field)},"\u4FEE\u6539")))),W.checks.some(a=>a.status==="ok")&&i.createElement("details",{className:"df-passed"},i.createElement("summary",null,W.checks.filter(a=>a.status==="ok").length," ","\u9879\u65E5\u671F\u6821\u6838\u901A\u8FC7 \xB7 \u67E5\u770B\u660E\u7EC6"),W.checks.filter(a=>a.status==="ok").map((a,d)=>i.createElement("p",{key:d},i.createElement("b",null,a.label),i.createElement("br",null),a.detail.replaceAll("T"," ")))),i.createElement("div",{className:"df-review-data"},i.createElement("h3",null,"\u5171\u7528\u4FE1\u606F"),i.createElement("dl",null,o.fields.map(a=>i.createElement("div",{key:a.key,className:st(a)?"df-span":void 0},i.createElement("dt",null,a.label),i.createElement("dd",null,(o.document_values?.[a.key]??a.value)||"\u5C1A\u672A\u586B\u5199")))),o.recipients.length>0&&i.createElement(i.Fragment,null,i.createElement("h3",null,"\u53D7\u9080\u5355\u4F4D"),o.recipients.map((a,d)=>i.createElement("p",{key:d},d+1,". ",a.name||"\u5C1A\u672A\u586B\u5199",o.recipient_document_times?.[d]??`${a.start.replace("T"," ")} \u2014 ${a.end.replace("T"," ")}`)))),i.createElement("div",{className:"df-review-data"},i.createElement("h3",null,"\u8F93\u51FA\u6E05\u5355"),ae.map(a=>i.createElement("p",{key:a.id},a.name," \xB7"," ",a.per_recipient?o.recipients.map(d=>d.name||"\u5F85\u586B\u5355\u4F4D").join("\u3001"):"\u5171\u7528\u6587\u4EF6",a.print_copies>1&&` \xB7 \u5EFA\u8BAE\u6253\u5370 ${a.print_copies} \u4EFD\uFF0C\u6BCF\u4F4D\u4E13\u5BB6\u4E00\u4EFD`))),i.createElement("div",{className:"df-confirm"},i.createElement("label",null,i.createElement("input",{type:"checkbox",checked:P,disabled:!W.can_generate,onChange:a=>w(a.target.checked)}),"\u6211\u5DF2\u6838\u5BF9\u586B\u5199\u5185\u5BB9\u3001\u53D7\u9080\u5355\u4F4D\u548C\u65E5\u671F\u5B89\u6392"),i.createElement("p",null,"\u6821\u6838\u68C0\u67E5\u8D44\u6599\u5B8C\u6574\u6027\u53CA\u65F6\u95F4\u987A\u5E8F\u3002\u4E1A\u52A1\u6761\u6B3E\u4E0E Word \u6A21\u677F\u8BF7\u7531\u7ECF\u529E\u4EBA\u590D\u6838\u3002"),i.createElement("div",null,i.createElement("button",{onClick:()=>{L("edit"),w(!1)}},"\u8FD4\u56DE\u4FEE\u6539"),i.createElement("button",{className:"df-primary",disabled:!W.can_generate||!P,onClick:$},"\u786E\u8BA4\u5E76\u751F\u6210 ",ze," \u4EFD\u6587\u4E66"))))),o&&O==="files"&&Z&&!u&&i.createElement("div",{className:"df-results"},i.createElement("section",{className:"df-paper df-output-list"},i.createElement("span",{className:"df-eyebrow"},"\u751F\u6210\u8BB0\u5F55"),i.createElement("h2",null,Z.files.length," \u4EFD\u6587\u4EF6\u5DF2\u751F\u6210"),i.createElement("p",null,Ue(Z.created_at)," \xB7 \u4FEE\u8BA2 ",Z.revision),i.createElement("p",{className:"df-muted"},"\u538B\u7F29\u5305\u5305\u542B Word\u3001\u586B\u5199\u6570\u636E\u548C\u6838\u5BF9\u8BB0\u5F55"),(g||(Z.content_digest?Z.content_digest!==o.content_digest:Z.revision!==o.revision))&&i.createElement("div",{className:"df-alert"},"\u586B\u5199\u5185\u5BB9\u5DF2\u6709\u4FEE\u6539\uFF0C\u4E0B\u5217\u6587\u4EF6\u4FDD\u7559\u751F\u6210\u65F6\u7684\u5185\u5BB9\u3002\u8BF7\u91CD\u65B0\u6838\u5BF9\u5E76\u751F\u6210\u65B0\u7248\u3002"),o.generations.map(a=>i.createElement("div",{className:"df-generation",key:a.id},i.createElement("div",{className:"df-generation-heading"},i.createElement("h3",null,Ue(a.created_at)," \xB7 \u4FEE\u8BA2 ",a.revision,a.date_style!=="zh-CN"&&" \xB7 \u539F\u65E5\u671F\u683C\u5F0F",a.naming_style!=="formal"&&" \xB7 \u539F\u6587\u4EF6\u540D"),i.createElement("button",{"aria-label":`\u6253\u5305\u4E0B\u8F7D ${Ue(a.created_at)} \u4FEE\u8BA2 ${a.revision}`,onClick:()=>ye(a)},"\u6253\u5305\u4E0B\u8F7D")),a.files.map(d=>i.createElement("div",{className:"df-output "+(A?.file.name===d.name&&A?.generation.id===a.id?"selected":""),key:d.name},i.createElement("button",{onClick:()=>Y({file:d,generation:a})},i.createElement("b",null,d.name),i.createElement("small",null,d.recipient," \xB7 ",(d.size/1024).toFixed(0)," KB",d.print_copies>1&&` \xB7 \u5EFA\u8BAE\u6253\u5370 ${d.print_copies} \u4EFD`)),i.createElement("button",{"aria-label":"\u4E0B\u8F7D"+d.name,onClick:()=>R("\u4E0B\u8F7D\u6587\u4EF6",()=>Fe(_e(a,d.name),d.name))},"\u2193")))))),i.createElement("section",{className:"df-paper df-preview"},i.createElement("div",{className:"df-section-head"},i.createElement("h2",null,A?A.file.name:"\u9009\u62E9\u6587\u4EF6\u9884\u89C8"),i.createElement("span",null,"Office \u9884\u89C8")),i.createElement("div",{className:"df-preview-body"},J&&Ie?i.createElement(We,{key:J.id,artifact:J},i.createElement(Ie,{key:J.id,artifact:J,readOnly:!0,hostControls:!0})):i.createElement("p",{className:"df-muted"},J?"\u6B63\u5728\u6253\u5F00\u6587\u4EF6\u2026":"\u4ECE\u5DE6\u4FA7\u9009\u62E9\u4E00\u4EFD\u6587\u4EF6\u3002"))))),i.createElement("footer",{className:"df-footer"},i.createElement("span",null,"UGSci \xB7 \u6587\u4E66\u586B\u62A5"),i.createElement("span",null,"\u6570\u636E\u4E0E\u6587\u4E66\u4FDD\u5B58\u5728\u5F53\u524D\u670D\u52A1\u7AEF \xB7 \u65E0\u9700\u6A21\u578B\u670D\u52A1"))),T&&o&&i.createElement("div",{className:"df-dialog-backdrop"},i.createElement("section",{className:"df-dialog df-paper",role:"dialog","aria-modal":"true","aria-label":"\u6838\u5BF9\u5171\u7528\u8D44\u6599"},i.createElement("div",{className:"df-section-head"},i.createElement("h2",null,T==="adopt"?"\u91C7\u7528\u9879\u76EE\u5E95\u7A3F\u4E2D\u7684\u8D44\u6599":"\u5C06\u672C\u8868\u8D44\u6599\u5B58\u5165\u9879\u76EE\u5E95\u7A3F"),i.createElement("button",{disabled:!!k,onClick:()=>E(null),"aria-label":"\u5173\u95ED\u5171\u7528\u8D44\u6599\u6838\u5BF9"},"\xD7")),i.createElement("p",{className:"df-muted"},"\u53EA\u66F4\u65B0\u52FE\u9009\u9879\u3002\u539F\u751F\u6210\u6587\u4EF6\u4FDD\u7559\uFF0C\u540E\u7EED\u751F\u6210\u524D\u9700\u91CD\u65B0\u6838\u5BF9\u3002"),U&&i.createElement("p",{role:"alert",className:"df-alert error"},U),i.createElement("div",{className:"df-compare"},n.fields.filter(a=>o.fields.some(d=>d.key===a.key&&d.value!==a.value)).map(a=>{let d=o.fields.find(y=>y.key===a.key);return i.createElement("label",{key:a.key},i.createElement("input",{type:"checkbox",checked:D.includes(a.key),onChange:y=>M(y.target.checked?[...D,a.key]:D.filter(B=>B!==a.key))}),i.createElement("div",null,i.createElement("b",null,a.label),i.createElement("div",{className:"df-compare-values"},i.createElement("p",null,i.createElement("small",null,"\u5F53\u524D\u8868\u5355"),d.value||"\u7A7A\u767D"),i.createElement("p",null,i.createElement("small",null,"\u9879\u76EE\u5E95\u7A3F"),a.value||"\u7A7A\u767D"))))}),!n.fields.some(a=>o.fields.some(d=>d.key===a.key&&d.value!==a.value))&&i.createElement("p",null,"\u672C\u8868\u4E0E\u9879\u76EE\u5E95\u7A3F\u4E2D\u7684\u5171\u7528\u8D44\u6599\u4E00\u81F4\u3002")),i.createElement("div",{className:"df-actions"},i.createElement("button",{disabled:!!k,onClick:()=>E(null)},"\u53D6\u6D88"),i.createElement("button",{className:"df-primary",disabled:!!k||!D.length,onClick:()=>R("\u540C\u6B65\u5171\u7528\u8D44\u6599",async()=>{let a=await H();if(T==="adopt")de(await re(`/projects/${n.id}/cases/${a.id}/sync`,be({revision:n.revision,case_revision:a.revision,keys:D})));else{let d=Object.fromEntries(a.fields.filter(y=>D.includes(y.key)).map(y=>[y.key,y.value]));await re(`/projects/${n.id}`,{...be({revision:n.revision,name:d["project.name"]??n.name,code:d["project.code"]??n.code,owner:n.owner,values:d}),method:"PUT"})}await pe(),E(null),V("\u6240\u9009\u8D44\u6599\u5DF2\u540C\u6B65\uFF0C\u8BF7\u91CD\u65B0\u6838\u5BF9\u540E\u751F\u6210\u65B0\u7248\u6587\u4E66\u3002")})},T==="adopt"?"\u91C7\u7528\u6240\u9009\u9879\u76EE\u8D44\u6599":"\u4FDD\u5B58\u6240\u9009\u8D44\u6599\u5230\u5E95\u7A3F")))))}function kt(){let n=le.host.useSelectedAgent?.();return i.createElement(Je,{key:n?.id||le.host.getSelectedAgentId?.()||"default",Editor:yt,services:{request:re,json:be,download:Fe,time:Ue,Field:lt}})}le.registerRoutes("document-forms",[{path:"/apps/document-forms",component:kt,label:"\u6587\u4E66\u586B\u62A5",icon:"\u25A4"}]);})();
