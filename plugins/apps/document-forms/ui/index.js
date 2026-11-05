(()=>{var Q=window.QwenPaw.host.React,{useEffect:Lt,useState:Ue}=Q;function xt({artifact:i,children:c}){return i.extension==="xlsx"?c:Q.createElement(ta,{artifact:i},c)}function ta({artifact:i,children:c}){let[r,f]=Ue("print"),[h,l]=Ue([]),[g,u]=Ue(0),[s,b]=Ue(""),[o,$]=Ue(0),[N,K]=Ue(100);return Lt(()=>{if(r!=="print")return;let S=new AbortController,O=[];return l([]),u(0),b(""),window.QwenPaw.host.fetch(i.printUrl+"?pages=true",{headers:i.agentId?{"X-Agent-Id":i.agentId}:{},signal:S.signal}).then(async C=>{if(!C.ok){let d=await C.json().catch(()=>({}));throw new Error(typeof d.detail=="string"?d.detail:"\u6253\u5370\u9884\u89C8\u6682\u4E0D\u53EF\u7528\uFF0C\u53EF\u5207\u6362\u6587\u5B57\u9884\u89C8\u6216\u4E0B\u8F7D Word \u67E5\u770B")}let{pages:w}=await C.json();if(!S.signal.aborted){if(!Number.isInteger(w)||w<1||w>40)throw new Error("\u672A\u83B7\u5F97\u6709\u6548\u7684 Word \u9875\u6570");u(w);for(let d=1;d<=w;d++){let D=await window.QwenPaw.host.fetch(i.printUrl+"?page="+d,{headers:i.agentId?{"X-Agent-Id":i.agentId}:{},signal:S.signal});if(!D.ok)throw new Error(`\u7B2C ${d} \u9875\u672A\u80FD\u6E32\u67D3\uFF0C\u8BF7\u91CD\u65B0\u9884\u89C8`);let P=await D.blob();if(S.signal.aborted)return;let z=URL.createObjectURL(P);O.push(z),l(U=>[...U,z])}}}).catch(C=>{S.signal.aborted||b(C.message||"\u6253\u5370\u9884\u89C8\u672A\u5B8C\u6210")}),()=>{S.abort(),O.forEach(C=>URL.revokeObjectURL(C))}},[i.id,i.printUrl,i.agentId,r,o]),Q.createElement("div",{className:"df-print-preview"},Q.createElement("div",{className:"df-print-toolbar"},Q.createElement("div",null,Q.createElement("button",{"aria-pressed":r==="print",onClick:()=>f("print")},"\u6253\u5370\u7248\u5F0F"),Q.createElement("button",{"aria-pressed":r==="text",onClick:()=>f("text")},"\u6587\u5B57\u9884\u89C8")),r==="print"&&Q.createElement("div",null,g>0&&Q.createElement("span",null,"\u5171 ",g," \u9875"),Q.createElement("select",{"aria-label":"\u9884\u89C8\u6BD4\u4F8B",value:N,onChange:S=>K(Number(S.target.value))},Q.createElement("option",{value:100},"\u9002\u5408\u5BBD\u5EA6"),Q.createElement("option",{value:125},"125%"),Q.createElement("option",{value:150},"150%"),Q.createElement("option",{value:200},"200%")))),r==="text"?Q.createElement("div",{className:"df-text-preview"},c):s?Q.createElement("div",{className:"df-preview-message",role:"alert"},Q.createElement("p",null,s),Q.createElement("button",{onClick:()=>$(S=>S+1)},"\u91CD\u65B0\u9884\u89C8")):h.length?Q.createElement("div",{className:"df-print-scroll"},Q.createElement("div",{className:"df-print-pages",style:{width:N+"%"}},h.map((S,O)=>Q.createElement("figure",{key:O},Q.createElement("figcaption",null,"\u7B2C ",O+1," \u9875"),Q.createElement("img",{src:S,alt:i.title+` \xB7 \u6253\u5370\u7248\u5F0F \xB7 \u7B2C ${O+1} \u9875`}))),h.length<g&&Q.createElement("p",{role:"status"},"\u6B63\u5728\u6392\u7248\u7B2C ",h.length+1," \u9875\u2026"))):Q.createElement("div",{className:"df-preview-message",role:"status"},"\u6B63\u5728\u6392\u7248\u6253\u5370\u9875\u9762\u2026"))}function Ee({artifact:i}){let[c,r]=Ue(null),[f,h]=Ue(""),[l,g]=Ue(0);if(Lt(()=>{let s=new AbortController;return r(null),h(""),window.QwenPaw.host.fetch("/workspace/convert-office",{method:"POST",headers:{"Content-Type":"application/json",...i.agentId?{"X-Agent-Id":i.agentId}:{}},signal:s.signal,body:JSON.stringify({url:i.binaryUrl,mime_type:i.mimeType})}).then(async b=>{let o=await b.json();if(!b.ok)throw new Error(typeof o.detail=="string"?o.detail:"\u6587\u4EF6\u9884\u89C8\u672A\u5B8C\u6210");s.signal.aborted||r(o)}).catch(b=>{s.signal.aborted||h(b.message||"\u6587\u4EF6\u9884\u89C8\u672A\u5B8C\u6210")}),()=>s.abort()},[i.id,i.binaryUrl,i.mimeType,i.agentId,l]),f)return Q.createElement("div",{className:"df-preview-message",role:"alert"},Q.createElement("p",null,f),Q.createElement("button",{onClick:()=>g(s=>s+1)},"\u91CD\u65B0\u9884\u89C8"),Q.createElement("p",null,"\u4E5F\u53EF\u4EE5\u4ECE\u6587\u4EF6\u6E05\u5355\u4E0B\u8F7D\u540E\u67E5\u770B\u3002"));if(!c)return Q.createElement("div",{className:"df-preview-message",role:"status"},"\u6B63\u5728\u6253\u5F00\u6587\u4EF6\u2026");let u=c.engine==="officecli"?c.html:`<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;color:#333;background:#fff;padding:24px 32px;line-height:1.7;max-width:900px;margin:0 auto}table{border-collapse:collapse;width:100%;margin:12px 0}td,th{border:1px solid #ddd;padding:8px 12px}img{max-width:100%;height:auto}h1{font-size:1.6em}h2{font-size:1.3em}.docx-page-break{border-top:2px dashed #ccc;margin:32px 0}</style></head><body>${c.html||""}</body></html>`;return Q.createElement("iframe",{className:"df-office-frame",title:i.title,srcDoc:u,sandbox:c.engine==="officecli"?"allow-scripts":"allow-same-origin"})}var Mt=`.df-app {
  --df-bg: #f5f6fa;
  --df-paper: #fff;
  --df-text: #182033;
  --df-muted: #667085;
  --df-line: #e6e9f0;
  --df-accent: #0d76fd;
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
  background: #0d76fd;
  color: #fff;
  border-color: #0d76fd;
}
.df-app .df-primary:hover {
  background: #0a5fd0;
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
  font-size: 13px;
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
.df-field > span {
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
.df-dock-file-list {
  font-size: 13px;
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
  font-size: 13px !important;
  padding: 8px !important;
}
.df-dock-preview h3 {
  font-size: 13px;
  overflow-wrap: anywhere;
  padding: 10px 0;
}
.df-dock-preview .df-print-scroll {
  height: calc(100vh - 330px);
  min-height: 360px;
}
.df-dock-preview .df-print-toolbar {
  flex-wrap: wrap;
  font-size: 13px;
  padding: 8px;
}
.df-dock-preview .df-print-toolbar button {
  font-size: 13px;
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

/* Shared visual language with QwenPaw Data: neutral surfaces and blue actions. */
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
  background: #0d76fd;
  border-color: #0d76fd;
  color: #fff;
}
.df-app .df-primary:hover {
  background: #0a5fd0;
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
  color: #c3342b;
  font-weight: 600;
}
.df-deadline.soon {
  color: #9b6100;
  font-weight: 600;
}
.df-deadline.done {
  color: #23845c;
}
.df-app[data-theme="dark"] .df-deadline.overdue {
  color: #ffaaa2;
}
.df-app[data-theme="dark"] .df-deadline.soon {
  color: #ffd383;
}
.df-app[data-theme="dark"] .df-deadline.done {
  color: #81d4b0;
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
`;var It=`.df-stage-toolbar {
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
  --df-stage-state-color: #327555;
}
.df-stage-state.df-state-submitted {
  --df-stage-state-color: #8a6932;
}
.df-app[data-theme="dark"] .df-stage-state.df-state-completed {
  --df-stage-state-color: #81d4b0;
}
.df-app[data-theme="dark"] .df-stage-state.df-state-submitted {
  --df-stage-state-color: #e5c38a;
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
`;var vt=window.QwenPaw,E=vt.host.React,{useState:qe,useEffect:na}=E,Ot={running:"\u6B63\u5728\u6838\u67E5",completed:"\u6838\u67E5\u5B8C\u6210",failed:"\u672A\u5B8C\u6210",interrupted:"\u5DF2\u4E2D\u65AD"},At=".doc,.docx,.pdf,.xls,.xlsx,.png,.jpg,.jpeg";function ft({project:i,services:c,onChanged:r}){let{request:f,download:h,time:l}=c,[g,u]=qe(null),[s,b]=qe(""),[o,$]=qe(null),[N,K]=qe([]),[S,O]=qe(""),[C,w]=qe(""),[d,D]=qe(!1),[P,z]=qe(""),[U,B]=qe(0);na(()=>{let v=!0,G,A=!1;async function ee(){try{let ne=await f(`/projects/${i.id}/response-reviews`);if(!v)return;u(ne),z("");let J=ne.records.some(q=>q.status==="running");A&&!J&&r(),A=J,J&&(G=setTimeout(ee,3e3))}catch(ne){v&&z(ne.message)}}return ee(),()=>{v=!1,clearTimeout(G)}},[i.id,U]);let _=g?.records.some(v=>v.status==="running"),y=g?.records.find(v=>v.id===C)||g?.records[0],x=vt.host.ReactMarkdown;async function T(v){v.preventDefault(),z(""),D(!0);try{let G=new FormData;s?G.set("reference_id",s):o&&G.set("reference",o);for(let ee of N)G.append("responses",ee);G.set("focus",S);let A=await f(`/projects/${i.id}/response-reviews`,{method:"POST",body:G});w(A.id),u(ee=>({...ee,records:[A,...ee?.records||[]]})),B(ee=>ee+1)}catch(G){z(G.message)}finally{D(!1)}}return E.createElement("div",{className:"df-response-review"},E.createElement("p",{className:"df-muted"},"\u5BF9\u7167\u8C08\u5224\u6587\u4EF6\uFF0C\u9010\u5BB6\u68C0\u67E5\u8D44\u8D28\u3001\u6280\u672F\u54CD\u5E94\u3001\u62A5\u4EF7\u3001\u65E5\u671F\u4E0E\u7B7E\u7AE0\u9644\u4EF6\u3002\u6838\u67E5\u610F\u89C1\u4F9B\u7ECF\u529E\u4EBA\u548C\u4E13\u5BB6\u590D\u6838\u3002"),P&&E.createElement("div",{className:"df-alert error",role:"alert"},P,E.createElement("button",{onClick:()=>B(v=>v+1)},"\u91CD\u65B0\u52A0\u8F7D")),g?E.createElement(E.Fragment,null,E.createElement("form",{onSubmit:T},E.createElement("fieldset",{disabled:d||_},E.createElement("label",{className:"df-field"},E.createElement("span",null,"\u6838\u67E5\u4F9D\u636E"),E.createElement("select",{"aria-label":"\u6838\u67E5\u4F9D\u636E",value:s,onChange:v=>{b(v.target.value),$(null)}},E.createElement("option",{value:""},"\u4E0A\u4F20\u6B63\u5F0F\u8C08\u5224\u6587\u4EF6"),g.references.map(v=>E.createElement("option",{key:v.id,value:v.id},v.label)))),!s&&E.createElement("label",{className:"df-field"},E.createElement("span",null,"\u6B63\u5F0F\u8C08\u5224\u6587\u4EF6"),E.createElement("input",{"aria-label":"\u4E0A\u4F20\u6838\u67E5\u4F9D\u636E",type:"file",accept:At,required:!0,onChange:v=>$(v.target.files[0]||null)})),E.createElement("label",{className:"df-field"},E.createElement("span",null,"\u5404\u5355\u4F4D\u54CD\u5E94\u6750\u6599"),E.createElement("input",{"aria-label":"\u4E0A\u4F20\u54CD\u5E94\u6750\u6599",type:"file",multiple:!0,required:!0,accept:At,onChange:v=>K([...v.target.files])})),N.length>0&&E.createElement("ul",{className:"df-review-files"},N.map((v,G)=>E.createElement("li",{key:G},v.name))),E.createElement("p",{className:"df-muted"},"\u652F\u6301 Word\u3001PDF\u3001Excel \u548C\u56FE\u7247\uFF1B\u53EF\u4E00\u6B21\u9009\u62E9\u591A\u5BB6\u6750\u6599\u3002\u6BCF\u4EFD\u4E0D\u8D85\u8FC7 15 MB\uFF0C\u6BCF\u6B21\u6700\u591A 20 \u4EFD\u3001\u5408\u8BA1 100 MB\u3002\u538B\u7F29\u5305\u8BF7\u5148\u89E3\u538B\u3002"),E.createElement("label",{className:"df-field"},E.createElement("span",null,"\u8865\u5145\u5173\u6CE8\u70B9\uFF08\u9009\u586B\uFF09"),E.createElement("textarea",{"aria-label":"\u8865\u5145\u6838\u67E5\u5173\u6CE8\u70B9",rows:3,maxLength:3e3,value:S,onChange:v=>O(v.target.value),placeholder:"\u4F8B\u5982\uFF1A\u91CD\u70B9\u6838\u5BF9\u62A5\u4EF7\u5927\u5C0F\u5199\u3001\u6210\u679C\u4EA4\u4ED8\u65F6\u95F4\u548C\u8D44\u8D28\u6709\u6548\u671F"})),E.createElement("div",{className:"df-actions"},E.createElement("button",{className:"df-primary",disabled:d||_||!(s||o)||!N.length},d?"\u6B63\u5728\u63D0\u4EA4\u2026":"\u5F00\u59CB\u6838\u67E5"),E.createElement("span",{className:"df-muted"},"\u4F7F\u7528\u201C\u54CD\u5E94\u6587\u4EF6\u6838\u67E5\u201D\u667A\u80FD\u4F53\uFF0C\u6CBF\u7528\u8F6F\u4EF6\u4E2D\u7684\u6A21\u578B\u914D\u7F6E\u3002")))),g.records.length>0&&E.createElement("section",{className:"df-review-history"},E.createElement("div",{className:"df-section-head"},E.createElement("h3",null,"\u6838\u67E5\u8BB0\u5F55"),E.createElement("button",{onClick:()=>B(v=>v+1)},"\u5237\u65B0\u8BB0\u5F55")),E.createElement("div",{className:"df-review-records"},g.records.map(v=>E.createElement("button",{key:v.id,"aria-pressed":y?.id===v.id,onClick:()=>w(v.id)},l(v.created_at)," \xB7 ",Ot[v.status]))),y&&E.createElement("article",{"aria-label":"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5\u7ED3\u679C"},E.createElement("div",{className:"df-section-head"},E.createElement("div",null,E.createElement("b",null,Ot[y.status]),E.createElement("p",{className:"df-muted"},"\u57FA\u4E8E\u9879\u76EE\u4FEE\u8BA2 ",y.project_revision," \xB7"," ",y.files.length," \u4EFD\u6750\u6599\uFF1B\u540E\u7EED\u6750\u6599\u4FEE\u6539\u8BF7\u91CD\u65B0\u6838\u67E5\u3002")),y.status==="completed"&&E.createElement("button",{onClick:async()=>{try{await h(`/projects/${i.id}/response-reviews/${y.id}/report`,`${i.name}_\u54CD\u5E94\u6587\u4EF6\u6838\u67E5\u8BB0\u5F55_${y.id.slice(0,8)}.md`)}catch(v){z(v.message)}}},"\u4E0B\u8F7D\u6838\u67E5\u8BB0\u5F55")),E.createElement("details",null,E.createElement("summary",null,"\u672C\u6B21\u6838\u67E5\u6750\u6599\u4E0E\u5173\u6CE8\u70B9"),E.createElement("ul",null,y.files.map((v,G)=>E.createElement("li",{key:G},v.role,"\uFF1A",v.name))),E.createElement("p",null,y.focus||"\u65E0\u8865\u5145\u5173\u6CE8\u70B9")),y.status==="running"&&E.createElement("p",{role:"status",className:"df-alert"},"\u6B63\u5728\u8BFB\u53D6\u5E76\u6838\u67E5\u6750\u6599\uFF0C\u53EF\u5173\u95ED\u6B64\u7A97\u53E3\uFF0C\u7A0D\u540E\u56DE\u5230\u672C\u9879\u76EE\u67E5\u770B\u7ED3\u679C\u3002"),y.error&&E.createElement("p",{role:"alert",className:"df-alert error"},y.error),y.report&&E.createElement("div",{className:"df-review-report"},x?E.createElement(x,{remarkPlugins:vt.host.remarkGfm?[vt.host.remarkGfm]:[],components:{a:({children:v})=>E.createElement("span",null,v),img:()=>null}},y.report):E.createElement("div",{style:{whiteSpace:"pre-wrap"}},y.report))))):E.createElement("p",{role:"status"},"\u6B63\u5728\u8BFB\u53D6\u6838\u67E5\u8BB0\u5F55\u2026"))}var Ze=window.QwenPaw,k=Ze.host.React,{useState:Qe,useEffect:zt,useRef:Ut}=k;function ra(i,c,r){return{artifact:{id:c.id+r.name,title:r.name,source:"generated",extension:r.name.endsWith(".xlsx")?"xlsx":"docx",mimeType:r.name.endsWith(".xlsx")?"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":"application/vnd.openxmlformats-officedocument.wordprocessingml.document",binaryUrl:r.preview_url,printUrl:`/document-forms/cases/${i.case_id}/print/${c.id}/${encodeURIComponent(r.name)}`,agentId:Ze.host.getSelectedAgentId?.(),createdAt:Date.parse(c.created_at)},reference:{case_id:i.case_id,generation_id:c.id,name:r.name}}}function oa({project:i,stageId:c,selection:r,services:f}){let{request:h,json:l,time:g}=f,[u,s]=Qe([]),[b,o]=Qe(""),[$,N]=Qe(!1),[K,S]=Qe(""),[O,C]=Qe(0),w=Ut(null);zt(()=>{let z=!0,U;async function B(){try{let _=await h(`/projects/${i.id}/assistant`);if(!z)return;s(_.messages),S(""),_.messages.some(y=>y.status==="running")&&(U=setTimeout(B,2500))}catch(_){z&&S(_.message)}}return B(),()=>{z=!1,clearTimeout(U)}},[i.id,O]),zt(()=>{w.current?.scrollIntoView?.({block:"nearest"})},[u.length,u.at(-1)?.status]);let d=$||u.some(z=>z.status==="running"),D=Ze.host.ReactMarkdown;async function P(z){if(z.preventDefault(),!(!b.trim()||d)){N(!0),S("");try{let U=await h(`/projects/${i.id}/assistant`,l({message:b.trim(),stage_id:c||"overview",file:r?.reference||{}}));s(B=>[...B,U]),o(""),C(B=>B+1)}catch(U){S(U.message)}finally{N(!1)}}}return k.createElement("section",{className:"df-project-chat","aria-label":"\u9879\u76EE\u667A\u80FD\u4F53\u95EE\u7B54"},k.createElement("div",{className:"df-chat-messages","aria-live":"polite"},!u.length&&k.createElement("div",{className:"df-chat-welcome"},["\u672C\u9636\u6BB5\u8FD8\u9700\u8981\u51C6\u5907\u54EA\u4E9B\u6750\u6599\uFF1F","\u5E2E\u6211\u6838\u5BF9\u5F53\u524D\u6587\u4EF6\u4E2D\u7684\u65E5\u671F\u548C\u91D1\u989D\u3002"].map(z=>k.createElement("button",{key:z,onClick:()=>o(z)},z))),u.map(z=>k.createElement("article",{className:"df-chat-turn",key:z.id},k.createElement("div",{className:"df-chat-question"},k.createElement("small",null,"\u6211 \xB7 ",g(z.created_at)),k.createElement("p",null,z.message),z.file_name&&k.createElement("small",null,"\u53C2\u8003\u6587\u4EF6\uFF1A",z.file_name)),z.reply&&k.createElement("div",{className:"df-chat-answer"},k.createElement("small",null,"\u9879\u76EE\u52A9\u624B"),D?k.createElement(D,{remarkPlugins:Ze.host.remarkGfm?[Ze.host.remarkGfm]:[],components:{img:()=>null,a:({children:U})=>k.createElement("span",null,U)}},z.reply):k.createElement("p",{style:{whiteSpace:"pre-wrap"}},z.reply)),z.status==="running"&&k.createElement("p",{role:"status",className:"df-muted"},"\u6B63\u5728\u7ED3\u5408\u9879\u76EE\u8D44\u6599\u6574\u7406\u56DE\u7B54\u2026"),z.error&&k.createElement("p",{role:"alert",className:"df-alert error"},z.error))),k.createElement("div",{ref:w})),K&&k.createElement("p",{role:"alert",className:"df-alert error"},K,k.createElement("button",{onClick:()=>C(z=>z+1)},"\u91CD\u65B0\u52A0\u8F7D")),k.createElement("form",{className:"df-chat-composer",onSubmit:P},r&&k.createElement("small",{className:"df-chat-context"},"\u53C2\u8003\u6587\u4EF6\uFF1A",r.artifact.title),k.createElement("textarea",{"aria-label":"\u5411\u9879\u76EE\u667A\u80FD\u4F53\u63D0\u95EE",placeholder:"\u8F93\u5165\u5F53\u524D\u9879\u76EE\u7684\u95EE\u9898\u2026",rows:3,maxLength:4e3,value:b,onChange:z=>o(z.target.value)}),k.createElement("div",{className:"df-actions"},k.createElement("button",{className:"df-primary",disabled:d||!b.trim()},d?"\u6B63\u5728\u56DE\u7B54\u2026":"\u53D1\u9001\u95EE\u9898"))))}function jt({collapsed:i=!1,width:c,maxWidth:r,onResize:f,onToggle:h,project:l,stageId:g,services:u,mode:s,onMode:b,selection:o,onSelect:$,attachment:N,AttachmentPreview:K,onChanged:S,dirty:O=!1}){let C=Ut(null),[w,d]=Qe(!1),D=()=>{C.current=null,d(!1)},[P,z]=Qe(null),[U,B]=Qe("");async function _(x,T){try{B(""),await u.download(x,T)}catch(v){B(v.message)}}zt(()=>{if(s!=="preview"||!o&&!N||P)return;let x=!0;return(Ze.workspace?.loadPreview?Ze.workspace.loadPreview():Promise.resolve(Ee)).then(T=>x&&z(()=>T)).catch(()=>x&&z(()=>Ee)),()=>{x=!1}},[s,o,N,P]);let y=l.forms.flatMap(x=>x.generations.flatMap(T=>g&&g!=="overview"&&g!=="profile"&&(T.stage_id||x.original_stage_id||x.stage_id)!==g?[]:[{form:x,generation:T}]));return k.createElement("aside",{className:"df-right-workspace"+(i?" df-pane-collapsed":"")+(w?" df-resizing":""),"aria-label":"\u9879\u76EE\u667A\u80FD\u4F53\u4E0E\u6587\u4EF6\u9884\u89C8"},k.createElement("div",{className:"df-dock-resizer",role:"separator","aria-label":"\u8C03\u6574\u95EE\u7B54\u4E0E\u9884\u89C8\u680F\u5BBD\u5EA6","aria-orientation":"vertical","aria-valuemin":300,"aria-valuemax":r,"aria-valuenow":c,"aria-valuetext":c+" \u50CF\u7D20",tabIndex:0,title:"\u5DE6\u53F3\u62D6\u52A8\u8C03\u6574\u5BBD\u5EA6\uFF1B\u53CC\u51FB\u6062\u590D\u9ED8\u8BA4\u5BBD\u5EA6",onPointerDown:x=>{x.button===0&&(x.preventDefault(),C.current={x:x.clientX,width:c,pointer:x.pointerId},x.currentTarget.setPointerCapture?.(x.pointerId),d(!0))},onPointerMove:x=>{C.current&&C.current.pointer===x.pointerId&&f(C.current.width+C.current.x-x.clientX)},onPointerUp:D,onPointerCancel:D,onLostPointerCapture:D,onDoubleClick:()=>f(500),onKeyDown:x=>{let T={ArrowLeft:c+24,ArrowRight:c-24,Home:300,End:r}[x.key];T!==void 0&&(x.preventDefault(),f(T))}}),k.createElement("button",{className:"df-pane-toggle","aria-label":i?"\u5C55\u5F00\u95EE\u7B54\u4E0E\u9884\u89C8\u680F":"\u6536\u8D77\u95EE\u7B54\u4E0E\u9884\u89C8\u680F","aria-expanded":!i,title:i?"\u5C55\u5F00\u95EE\u7B54\u4E0E\u9884\u89C8\u680F":"\u6536\u8D77\u95EE\u7B54\u4E0E\u9884\u89C8\u680F",onClick:h},k.createElement("span",{"aria-hidden":"true"},i?"\u2039":"\u203A"),k.createElement("span",null,i?"\u95EE\u7B54\u4E0E\u9884\u89C8":"\u6536\u8D77")),k.createElement("header",null,k.createElement("div",null,k.createElement("h2",null,s==="preview"?"\u6587\u4EF6\u9884\u89C8":s==="review"?"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5":"\u9879\u76EE\u95EE\u7B54")),k.createElement("div",{className:"df-dock-tabs",role:"tablist","aria-label":"\u53F3\u4FA7\u5DE5\u4F5C\u533A"},k.createElement("button",{role:"tab","aria-selected":s==="assistant",onClick:()=>b("assistant")},"\u95EE\u7B54"),k.createElement("button",{role:"tab","aria-selected":s==="preview",onClick:()=>b("preview")},"\u9884\u89C8"))),U&&k.createElement("p",{role:"alert",className:"df-alert error"},U),k.createElement("div",{className:"df-right-body",hidden:s!=="assistant"},k.createElement(oa,{project:l,stageId:["overview","profile"].includes(g)?"overview":g,selection:o,services:u}),g==="negotiation"&&k.createElement("button",{className:"df-open-review",onClick:()=>b("review")},"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5 \u2192")),k.createElement("div",{className:"df-right-body",hidden:s!=="review"},k.createElement("button",{className:"df-back-link",onClick:()=>b("assistant")},"\u2190 \u8FD4\u56DE\u95EE\u7B54"),s==="review"&&k.createElement(ft,{key:l.id,project:l,services:u,onChanged:S})),k.createElement("div",{className:"df-right-body df-dock-files",hidden:s!=="preview"},O&&k.createElement("p",{className:"df-alert"},"\u4E2D\u95F4\u8868\u5355\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\uFF0C\u9884\u89C8\u6587\u4EF6\u4FDD\u7559\u751F\u6210\u65F6\u7684\u5185\u5BB9\u3002"),k.createElement("details",{open:!o&&!N,className:"df-dock-file-list"},k.createElement("summary",null,"\u672C\u9636\u6BB5\u6587\u4EF6 \xB7"," ",y.reduce((x,T)=>x+T.generation.files.length,0)," \u4EFD"),y.map(({form:x,generation:T})=>k.createElement("section",{className:"df-generation",key:T.id},k.createElement("div",{className:"df-generation-heading"},k.createElement("h3",null,u.time(T.created_at)," \xB7 \u4FEE\u8BA2"," ",T.revision,T.date_style!=="zh-CN"&&" \xB7 \u539F\u65E5\u671F\u683C\u5F0F",T.naming_style!=="formal"&&" \xB7 \u539F\u6587\u4EF6\u540D"),k.createElement("button",{onClick:()=>_(`/cases/${x.case_id}/outputs/${T.id}/\u5168\u90E8\u6587\u4E66.zip`,T.bundle_name||l.name+"_\u6587\u4E66.zip")},"\u6253\u5305\u4E0B\u8F7D")),T.files.map(v=>k.createElement("div",{className:"df-dock-file-row",key:v.name},k.createElement("button",{className:"df-dock-file","aria-label":v.name,onClick:()=>$(ra(x,T,v))},v.name,k.createElement("small",null,v.recipient," \xB7 ",(v.size/1024).toFixed(0)," KB",v.print_copies>1&&` \xB7 \u5EFA\u8BAE\u6253\u5370 ${v.print_copies} \u4EFD`)),k.createElement("button",{"aria-label":"\u4E0B\u8F7D"+v.name,onClick:()=>_(`/cases/${x.case_id}/outputs/${T.id}/${encodeURIComponent(v.name)}`,v.name)},"\u2193"))))),!y.length&&k.createElement("p",{className:"df-muted"},"\u751F\u6210\u6587\u4E66\u6216\u4ECE\u4E2D\u95F4\u7684\u6750\u6599\u6E05\u5355\u9009\u62E9\u6587\u4EF6\u540E\uFF0C\u5728\u8FD9\u91CC\u9884\u89C8\u3002"),l.forms.filter(x=>x.case_id!==l.form_id).map(x=>k.createElement("button",{className:"df-dock-file",key:x.case_id,onClick:()=>_(`/cases/${x.case_id}/excel`,x.name+"_\u5386\u53F2\u5E95\u7A3F.xlsx")},"\u5386\u53F2\u5E95\u7A3F\uFF1A",x.name," \u2193"))),y.length>0&&k.createElement("p",{className:"df-muted"},"\u6587\u4EF6\u4FDD\u7559\u5404\u6279\u6B21\u751F\u6210\u65F6\u7684\u5185\u5BB9\uFF0C\u4FEE\u6539\u8868\u5355\u540E\u8BF7\u91CD\u65B0\u6838\u5BF9\u751F\u6210\u3002"),N?k.createElement(K,{key:N.id,file:N,projectId:l.id,download:_,embedded:!0,onClose:()=>$(null)}):o?k.createElement("section",{className:"df-dock-preview","aria-label":"\u6587\u4EF6\u9884\u89C8"},k.createElement("h3",null,o.artifact.title),P&&o.artifact.extension==="xlsx"?k.createElement("div",{className:"df-dock-office"},k.createElement(P,{artifact:o.artifact,readOnly:!0,hostControls:!0})):P?k.createElement(xt,{key:o.artifact.id,artifact:o.artifact},k.createElement(P,{artifact:o.artifact,readOnly:!0,hostControls:!0})):k.createElement("p",{role:"status"},"\u6B63\u5728\u6253\u5F00\u9884\u89C8\u2026"),k.createElement("button",{className:"df-dock-ask",onClick:()=>b("assistant")},"\u5C31\u6B64\u6587\u4EF6\u63D0\u95EE \u2192"),k.createElement("button",{className:"df-dock-ask",onClick:()=>_(`/cases/${o.reference.case_id}/outputs/${o.reference.generation_id}/${encodeURIComponent(o.reference.name)}`,o.artifact.title)},"\u4E0B\u8F7D\u5F53\u524D\u6587\u4EF6")):k.createElement("p",{className:"df-dock-empty"},"\u9009\u62E9\u4E00\u4EFD\u6587\u4EF6\uFF0C\u586B\u5199\u4E0E\u9884\u89C8\u53EF\u4EE5\u540C\u65F6\u8FDB\u884C\u3002")))}var qt=window.QwenPaw.host.React;function ct({id:i,label:c,items:r,value:f,onChange:h}){return qt.createElement("div",{className:"df-workflow-tabs",role:"tablist","aria-label":c},r.map((l,g)=>qt.createElement("button",{type:"button",role:"tab",key:l.id,className:l.align==="end"?"df-workflow-tab-end":void 0,id:`${i}-tab-${l.id}`,"aria-controls":`${i}-panel-${l.id}`,"aria-selected":f===l.id,tabIndex:f===l.id?0:-1,onClick:()=>h(l.id),onKeyDown:u=>{let s;u.key==="ArrowRight"&&(s=(g+1)%r.length),u.key==="ArrowLeft"&&(s=(g+r.length-1)%r.length),u.key==="Home"&&(s=0),u.key==="End"&&(s=r.length-1),s!==void 0&&(u.preventDefault(),h(r[s].id),u.currentTarget.parentElement.children[s].focus())}},l.label)))}var We=["\u9879\u76EE\u7814\u7A76\u5185\u5BB9","\u8003\u6838\u6307\u6807\u4E0E\u8FDB\u5EA6\u5B89\u6392","\u53D7\u9080\u5355\u4F4D\u4E0E\u8D44\u683C\u8981\u6C42","\u8C08\u5224\u8981\u6C42","\u5B9E\u65BD\u65B9\u6848"];function Wt(i,c){if(c==="negotiation"){let r=i.key.split(".")[0];if(["project","research"].includes(r))return We[0];if(["deliverables","metrics","workload","milestones"].includes(r))return We[1];if(r==="qualification")return We[2];if(r==="implementation")return We[4];if(["organization","org","contact","purchaser","dates","events","submission","place","budget"].includes(r))return We[3];let f={\u9879\u76EE\u8D44\u6599:0,\u7814\u7A76\u5185\u5BB9:0,\u6210\u679C\u4E0E\u8003\u6838:1,\u8FDB\u5EA6\u5B89\u6392:1,\u8D44\u683C\u8981\u6C42:2,\u5355\u4F4D\u4E0E\u8054\u7CFB:3,\u8D39\u7528\u4FE1\u606F:3,\u65E5\u671F\u5B89\u6392:3,\u5730\u70B9\u5B89\u6392:3,\u670D\u52A1\u9009\u5546\u5B9E\u65BD\u65B9\u6848:4}[i.group];if(f!==void 0)return We[f]}return/^selection\.member\d+_/.test(i.key)?"\u8BBA\u8BC1\u6210\u5458":/^selection\.partner\d+_/.test(i.key)?"\u5019\u9009\u5355\u4F4D":{\u5355\u4F4D\u4E0E\u8054\u7CFB:"\u8054\u7CFB\u4E0E\u8D39\u7528",\u8D39\u7528\u4FE1\u606F:"\u8054\u7CFB\u4E0E\u8D39\u7528",\u65E5\u671F\u5B89\u6392:"\u65F6\u95F4\u4E0E\u5730\u70B9",\u5730\u70B9\u5B89\u6392:"\u65F6\u95F4\u4E0E\u5730\u70B9",\u670D\u52A1\u9009\u5546\u5B9E\u65BD\u65B9\u6848:"\u5B9E\u65BD\u65B9\u6848"}[i.group]||i.group||"\u586B\u5199\u4FE1\u606F"}var M=window.QwenPaw.host.React,{useEffect:Ft,useRef:da,useState:sa}=M;function re({name:i}){return M.createElement("svg",{className:"df-toolbar-icon",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true"},{template:M.createElement(M.Fragment,null,M.createElement("path",{d:"M8 3h8l4 4v13H8z"}),M.createElement("path",{d:"M16 3v5h4M4 7v14M11 12h6M11 16h6"})),import:M.createElement(M.Fragment,null,M.createElement("path",{d:"M5 3h9l5 5v13H5zM14 3v5h5"}),M.createElement("path",{d:"M12 10v8m-3-3 3 3 3-3"})),export:M.createElement(M.Fragment,null,M.createElement("path",{d:"M5 3h9l5 5v13H5zM14 3v5h5"}),M.createElement("path",{d:"M12 18v-8m-3 3 3-3 3 3"})),save:M.createElement(M.Fragment,null,M.createElement("path",{d:"M4 3h13l4 4v14H4zM8 3v6h9V3M8 21v-8h9v8"})),download:M.createElement(M.Fragment,null,M.createElement("path",{d:"M12 3v12M7 10l5 5 5-5M4 16v5h16v-5"})),file:M.createElement(M.Fragment,null,M.createElement("path",{d:"M5 3h10l4 4v14H5zM15 3v5h4M8 12h8M8 16h6"})),settings:M.createElement(M.Fragment,null,M.createElement("path",{d:"M4 6h16M4 12h16M4 18h16"}),M.createElement("circle",{cx:"9",cy:"6",r:"2"}),M.createElement("circle",{cx:"15",cy:"12",r:"2"}),M.createElement("circle",{cx:"9",cy:"18",r:"2"})),calendar:M.createElement(M.Fragment,null,M.createElement("rect",{x:"3",y:"5",width:"18",height:"16",rx:"2"}),M.createElement("path",{d:"M7 3v4M17 3v4M3 11h18M7 15h2M13 15h2"})),more:M.createElement(M.Fragment,null,M.createElement("circle",{cx:"5",cy:"12",r:"1"}),M.createElement("circle",{cx:"12",cy:"12",r:"1"}),M.createElement("circle",{cx:"19",cy:"12",r:"1"})),back:M.createElement("path",{d:"m10 5-7 7 7 7M3 12h18"}),chevron:M.createElement("path",{d:"m7 10 5 5 5-5"})}[i])}function $t({label:i,icon:c,disabled:r,children:f,iconOnly:h=!1}){let l=da(null),[g,u]=sa(!1);return Ft(()=>{let s=o=>{l.current?.contains(o.target)||u(!1)},b=o=>{o.key!=="Escape"||!l.current?.open||(o.preventDefault(),o.stopPropagation(),u(!1),l.current.querySelector("summary").focus())};return document.addEventListener("pointerdown",s),document.addEventListener("keydown",b,!0),()=>{document.removeEventListener("pointerdown",s),document.removeEventListener("keydown",b,!0)}},[]),Ft(()=>{r&&u(!1)},[r]),M.createElement("details",{className:"df-toolbar-menu"+(h?" df-toolbar-menu-more":""),ref:l,open:g},M.createElement("summary",{"aria-label":i,title:i,"aria-disabled":r||void 0,tabIndex:r?-1:0,onClick:s=>{s.preventDefault(),r||u(b=>!b)},onKeyDown:s=>{r&&["Enter"," "].includes(s.key)&&s.preventDefault()}},M.createElement(re,{name:c}),!h&&M.createElement("span",null,i),!h&&M.createElement(re,{name:"chevron"})),g&&M.createElement("div",{className:"df-toolbar-popover",role:"region","aria-label":i+"\u83DC\u5355"},f))}var Ve=window.QwenPaw,F=Ve.host.React,{useEffect:mt,useRef:la,useState:at}=F,Bt=/审批|批复|回执|签章|签字|审查意见|论证意见|验收意见|验收凭据|付款凭证/;function Qt(i){let c=[],r=[];for(let f of i){let h=Bt.test(f.name),l=f.files.filter(u=>h||u.approval_review||Bt.test(u.name)),g=f.files.filter(u=>!l.includes(u));(h||l.length)&&c.push({...f,files:l}),(!h||g.length)&&r.push({...f,files:g})}return{approvals:c,attachments:r}}function pa({file:i,projectId:c,agentId:r,active:f,availableIds:h}){let l=la(new Map),[g,u]=at(null),[s,b]=at(""),[o,$]=at(0),[N,K]=at(null),S=i?.name.split(".").pop().toLowerCase(),O=["pdf","png","jpg","jpeg","webp","gif"].includes(S),C=i?i.id+":"+(i.sha256||""):"";if(mt(()=>()=>{for(let w of l.current.values())URL.revokeObjectURL(w.url);l.current.clear()},[]),mt(()=>{let w=new Set(h.split(","));for(let[d,D]of l.current)w.has(d.split(":")[0])||(l.current.delete(d),URL.revokeObjectURL(D.url))},[h]),mt(()=>{if(!f||!i||!O)return;b("");let w=l.current.get(C);if(w){u({identity:C,url:w.url});return}u(null);let d=new AbortController,D=window.setTimeout(()=>{b("\u8BFB\u53D6\u8F83\u6162\uFF0C\u8BF7\u91CD\u8BD5\u6216\u4E0B\u8F7D\u539F\u6587\u4EF6\u67E5\u770B\u3002"),d.abort()},2e4);return Ve.host.fetch(`/document-forms/projects/${c}/files/${i.id}`,{signal:d.signal,headers:r?{"X-Agent-Id":r}:{}}).then(async P=>{if(!P.ok)throw new Error("\u6587\u4EF6\u672A\u80FD\u6253\u5F00\uFF0C\u8BF7\u91CD\u8BD5\u6216\u4E0B\u8F7D\u539F\u6587\u4EF6\u3002");let z=await P.blob();if(d.signal.aborted)return;let U=URL.createObjectURL(new Blob([z],{type:S==="pdf"?"application/pdf":"image/"+(S==="jpg"?"jpeg":S)}));l.current.set(C,{url:U,size:z.size});let B=[...l.current.values()].reduce((_,y)=>_+y.size,0);for(let[_,y]of l.current){if(l.current.size<=3&&B<=32*1024*1024)break;_!==C&&(l.current.delete(_),URL.revokeObjectURL(y.url),B-=y.size)}u({identity:C,url:U})}).catch(P=>{d.signal.aborted||b(P.message)}).finally(()=>window.clearTimeout(D)),()=>{window.clearTimeout(D),d.abort()}},[C,f,O,c,r,o]),mt(()=>{if(!f||S!=="pdf"||g?.identity!==C||N)return;let w=!0,d=!!Ve.workspace?.loadPdfPreview,D=Ve.workspace?.loadPdfPreview||Ve.workspace?.loadPreview;if(D)return D().then(P=>{w&&K({component:P,direct:d})}).catch(()=>{w&&b("PDF \u9605\u8BFB\u5668\u672A\u80FD\u6253\u5F00\uFF0C\u8BF7\u91CD\u8BD5\u6216\u4E0B\u8F7D\u539F\u6587\u4EF6\u3002")}),()=>{w=!1}},[f,S,g,C,N,o]),!i)return F.createElement("div",{className:"df-approval-empty"},"\u5C1A\u672A\u4E0A\u4F20\u5BA1\u6279\u6587\u4EF6");if(!O)return F.createElement("div",{className:"df-approval-empty"},"\u6B64\u6587\u4EF6\u53EF\u901A\u8FC7\u201C\u9884\u89C8\u201D\u6253\u5F00\uFF1BPDF \u6216\u56FE\u7247\u53EF\u5728\u8FD9\u91CC\u76F4\u63A5\u6D4F\u89C8\u3002");if(s)return F.createElement("div",{className:"df-approval-empty",role:"alert"},F.createElement("p",null,s),F.createElement("button",{onClick:()=>$(w=>w+1)},"\u91CD\u65B0\u52A0\u8F7D\u5BA1\u6279\u6587\u4EF6"));if(!g||g.identity!==C)return F.createElement("div",{className:"df-approval-empty",role:"status"},"\u6B63\u5728\u8BFB\u53D6\u5BA1\u6279\u6587\u4EF6\u2026");if(S==="pdf"&&N){let w=N.component;return F.createElement("div",{className:"df-approval-pdf",role:"region","aria-label":i.name},N.direct?F.createElement(w,{url:g.url,fileSize:i.size,theme:"light"}):F.createElement(w,{artifact:{id:i.id,title:i.name,source:"uploaded",extension:"pdf",mimeType:"application/pdf",binaryUrl:g.url,agentId:r,size:i.size},readOnly:!0,hostControls:!0}))}return S==="pdf"&&(Ve.workspace?.loadPdfPreview||Ve.workspace?.loadPreview)?F.createElement("div",{className:"df-approval-empty",role:"status"},"\u6B63\u5728\u6253\u5F00 PDF \u9605\u8BFB\u5668\u2026"):S==="pdf"?F.createElement("iframe",{className:"df-approval-pdf",title:i.name,src:g.url+"#view=FitH"}):F.createElement("div",{className:"df-approval-image-scroll"},F.createElement("img",{src:g.url,alt:i.name,decoding:"async"}))}function Pt({projectId:i,materials:c,active:r,onUpload:f,onEdit:h,onAdd:l,onPreview:g,onDownload:u,onDelete:s,busy:b,review:o}){let[$,N]=at(""),[K,S]=at(""),O=c.find(P=>P.id===$)||c.find(P=>P.files.length)||c[0],C=O?.files||[],w=C.find(P=>P.id===K)||C.at(-1),d=C.at(-1)?.id;mt(()=>S(""),[d]);let D=Ve.host.getSelectedAgentId?.();return F.createElement("section",{className:"df-paper df-approval-documents",id:"df-node-materials"},F.createElement("div",{className:"df-section-head"},F.createElement("h2",null,"\u5BA1\u6279\u8D44\u6599"),F.createElement("div",{className:"df-actions"},O&&F.createElement("button",{"aria-label":"\u4E0A\u4F20"+O.name,title:"\u4E0A\u4F20"+O.name,onClick:()=>f(O)},"\u4E0A\u4F20\u5BA1\u6279\u6587\u4EF6"),O&&F.createElement("button",{"aria-label":"\u7F16\u8F91"+O.name,onClick:()=>h(O)},"\u529E\u7406\u4FE1\u606F"),F.createElement("button",{onClick:l},"\uFF0B \u6DFB\u52A0\u6750\u6599"))),c.length>0&&F.createElement("div",{className:"df-approval-file-tools"},F.createElement("select",{"aria-label":"\u5BA1\u6279\u6750\u6599\u7C7B\u578B",value:O.id,onChange:P=>{N(P.target.value),S("")}},c.map(P=>F.createElement("option",{key:P.id,value:P.id},P.name))),w&&F.createElement("select",{"aria-label":"\u5BA1\u6279\u6587\u4EF6\u7248\u672C",value:w.id,onChange:P=>S(P.target.value)},[...C].reverse().map((P,z)=>F.createElement("option",{key:P.id,value:P.id},"V",P.version||C.length-z," \xB7 ",P.name))),w&&F.createElement("span",{className:"df-muted df-approval-versions"},C.length," \u4EFD\u6587\u4EF6 / \u7248\u672C \xB7 \u6700\u65B0\uFF1A",C.at(-1).name),w&&F.createElement("div",{className:"df-actions"},!["pdf","png","jpg","jpeg","webp","gif"].includes(w.name.split(".").pop().toLowerCase())&&F.createElement("button",{onClick:()=>g(w)},"\u9884\u89C8"),F.createElement("button",{"aria-label":"\u4E0B\u8F7D"+w.name+"\u7248\u672C"+(w.version||C.indexOf(w)+1),onClick:()=>u(w)},"\u4E0B\u8F7D\u539F\u6587\u4EF6"),s&&F.createElement("button",{className:"df-delete-file",disabled:b,"aria-label":"\u5220\u9664"+w.name+"\u7248\u672C"+(w.version||C.indexOf(w)+1),onClick:()=>s(O,w)},"\u5220\u9664"))),o,F.createElement(pa,{key:i+":"+D,projectId:i,file:w,agentId:D,active:r,availableIds:c.flatMap(P=>P.files.map(z=>z.id)).join(",")}))}var Fe=window.QwenPaw,e=Fe.host.React,{useState:W,useEffect:Te,useRef:_e}=e,wt={pending:"\u672A\u5F00\u59CB",in_progress:"\u8FDB\u884C\u4E2D",submitted:"\u5DF2\u63D0\u4EA4",completed:"\u5DF2\u5B8C\u6210"},Vt={pending:"\u5F85\u51C6\u5907",preparing:"\u6574\u7406\u4E2D",ready:"\u5F85\u63D0\u4EA4",submitted:"\u5DF2\u63D0\u4EA4",done:"\u5DF2\u5B8C\u6210",na:"\u4E0D\u9002\u7528"},fa=["\u4E0A\u62A5\u8BA1\u5212","\u9009\u5546\u8BBA\u8BC1","\u5546\u52A1\u8C08\u5224","\u5F00\u9898\u8BBA\u8BC1","\u5408\u540C\u5BA1\u67E5","\u7ED3\u9898\u9A8C\u6536","\u5F52\u6863\u4ED8\u6B3E"],Kt=i=>i?new Date(i).toLocaleString("zh-CN",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}):"";function Ke({title:i,children:c,onClose:r,error:f,busy:h=!1}){let l=_e(null);return Te(()=>{let g=document.activeElement;return l.current?.querySelector("input,select,textarea,button")?.focus(),()=>{g?.isConnected&&g.focus()}},[]),e.createElement("div",{className:"df-dialog-backdrop"},e.createElement("section",{ref:l,className:"df-dialog df-paper",role:"dialog","aria-modal":"true","aria-label":i,onKeyDown:g=>{if(g.key==="Escape"&&!h&&(g.stopPropagation(),r()),g.key==="Tab"){let u=[...l.current.querySelectorAll("button,input,textarea,select,a[href]")].filter(s=>!s.disabled);g.shiftKey&&document.activeElement===u[0]&&(g.preventDefault(),u.at(-1)?.focus()),!g.shiftKey&&document.activeElement===u.at(-1)&&(g.preventDefault(),u[0]?.focus())}}},e.createElement("div",{className:"df-section-head"},e.createElement("h2",null,i),e.createElement("button",{type:"button",disabled:h,onClick:r,"aria-label":"\u5173\u95ED"+i},"\xD7")),f&&e.createElement("p",{role:"alert",className:"df-alert error"},f),c))}function Ht({file:i,projectId:c,download:r,onClose:f,embedded:h=!1}){let[l,g]=W(null),[u,s]=W(""),[b,o]=W(""),$=i.name.split(".").pop().toLowerCase(),N=["pdf","png","jpg","jpeg"].includes($)&&!Fe.workspace?.loadPreview;Te(()=>{let O=!0,C;return N?Fe.host.fetch(`/document-forms/projects/${c}/files/${i.id}`).then(async w=>{if(!w.ok)throw new Error("\u9884\u89C8\u672A\u80FD\u6253\u5F00\uFF0C\u8BF7\u4E0B\u8F7D\u67E5\u770B");let d=await w.blob();O&&(C=URL.createObjectURL(new Blob([d],{type:i.mime})),s(C))}).catch(w=>O&&o(w.message)):Fe.workspace?.loadPreview||["doc","docx","xls","xlsx","ppt","pptx"].includes($)?(Fe.workspace?.loadPreview?Fe.workspace.loadPreview():Promise.resolve(Ee)).then(w=>O&&g(()=>w)).catch(()=>O&&g(()=>Ee)):o("\u6B64\u683C\u5F0F\u8BF7\u4E0B\u8F7D\u540E\u67E5\u770B\u3002"),()=>{O=!1,C&&URL.revokeObjectURL(C)}},[i.id]);let K={id:i.id,title:i.name,source:"uploaded",extension:$,mimeType:i.mime,binaryUrl:i.preview_url,agentId:Fe.host.getSelectedAgentId?.(),createdAt:Date.parse(i.uploaded_at)};return e.createElement(h?"section":Ke,{...h?{className:"df-dock-preview","aria-label":"\u6587\u4EF6\u9884\u89C8"}:{title:i.name,onClose:f}},h&&e.createElement("h3",null,i.name),e.createElement("div",{className:"df-attachment-preview"},b?e.createElement("p",{role:"alert"},b):N&&u?$==="pdf"?e.createElement("iframe",{title:i.name,src:u,sandbox:"allow-same-origin"}):e.createElement("img",{src:u,alt:i.name}):l?e.createElement(l,{artifact:K,readOnly:!0,hostControls:!0}):e.createElement("p",{role:"status"},"\u6B63\u5728\u6253\u5F00\u9884\u89C8\u2026")),e.createElement("div",{className:"df-actions"},e.createElement("button",{onClick:()=>r(`/projects/${c}/files/${i.id}`,i.name)},"\u4E0B\u8F7D\u539F\u6587\u4EF6"),e.createElement("button",{onClick:f},"\u5173\u95ED\u9884\u89C8")))}function Xt(){let i=new Date;return`${i.getFullYear()}-${String(i.getMonth()+1).padStart(2,"0")}-${String(i.getDate()).padStart(2,"0")}`}function yt(i,c){if(i.status==="completed")return{kind:"done",text:i.approval_date?`\u6279\u590D\u65E5\u671F ${i.approval_date}`:i.due_date?`\u8BA1\u5212\u65E5\u671F ${i.due_date} \xB7 \u5DF2\u529E\u7ED3`:"\u5DF2\u529E\u7ED3"};if(!i.due_date)return{kind:"unset",text:"\u672A\u8BBE\u7F6E\u8BA1\u5212\u65E5\u671F"};let r=Math.round((Date.parse(i.due_date)-Date.parse(c))/864e5);return Number.isFinite(r)?{kind:r<0?"overdue":r<=3?"soon":"scheduled",text:`${i.due_date} \xB7 ${r<0?`\u5DF2\u903E\u671F ${-r} \u5929`:r===0?"\u4ECA\u5929\u5230\u671F":r<=3?`${r} \u5929\u540E\u5230\u671F`:`\u5269\u4F59 ${r} \u5929`}`}:{kind:"unset",text:"\u8BF7\u68C0\u67E5\u8BA1\u5212\u65E5\u671F"}}function Et({Editor:i,services:c}){let{request:r,json:f,download:h,Field:l}=c,[g,u]=W(Xt);Te(()=>{let t=()=>u(Xt()),m=setInterval(t,6e4);return window.addEventListener("focus",t),()=>{clearInterval(m),window.removeEventListener("focus",t)}},[]);let[s,b]=W([]),[o,$]=W(null),[N,K]=W("overview"),[S,O]=W(""),[C,w]=W(null),[d,D]=W(!1),[P,z]=W(!1),[U,B]=W(""),[_,y]=W(0),[x,T]=W("form"),[v,G]=W(null),[A,ee]=W(""),[ne,J]=W(""),[q,ze]=W(""),[we,Y]=W(null),[I,H]=W({}),[X,Se]=W([]),[me,rt]=W(null),[je,se]=W(null),[le,ue]=W(!1),[gt,De]=W(!1),[te,ae]=W(()=>{try{let t=Number(window.localStorage.getItem("ugsci.document-forms.right-width"));return Number.isFinite(t)&&t>=300&&t<=3e3?t:500}catch{return 500}}),[ye,Le]=W(1200),ot=_e(null);Te(()=>{let t=ot.current;if(!t||!o?.single_form)return;let m=()=>{let V=t.getBoundingClientRect().width;if(V<=850)return;let Pe=t.querySelector(".df-project-sidebar").getBoundingClientRect().width,tt=Math.max(300,Math.floor(V-Pe-(window.innerWidth<=1050?380:440)));Le(tt),ae(pt=>Math.min(tt,Math.max(300,pt)))};m();let j=typeof ResizeObserver=="function"?new ResizeObserver(m):null;return j?.observe(t),window.addEventListener("resize",m),()=>{j?.disconnect(),window.removeEventListener("resize",m)}},[le,o?.single_form]),Te(()=>{try{window.localStorage.setItem("ugsci.document-forms.right-width",String(te))}catch{}},[te]);let ge=t=>ae(Math.min(ye,Math.max(300,Math.round(t)))),[dt,oe]=W(null),[Me,be]=W("assistant"),Z=_e(!0),Ie=_e(0),Ge=_e(null),Oe=_e(null),Re=_e(""),Je=_e(null),Ae=_e(null);Ae.current=o?.id,Te(()=>{Je.current?.scrollTo?.({top:0})},[o?.id,N,C?.id]);let st=Fe.host.useTheme?.()||"light",L=o?.stages.find(t=>t.id===N),ke=o?.forms.filter(t=>t.stage_id===N)||[],{approvals:Ye,attachments:et}=Qt(L?.materials||[]),ie=(o?.stages.find(t=>t.id==="plan")?.materials.flatMap(t=>t.files).filter(t=>t.approval_review)||[]).at(-1),lt=()=>!d&&!P||window.confirm("\u8D44\u6599\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\uFF0C\u662F\u5426\u653E\u5F03\u8FD9\u4E9B\u4FEE\u6539\u5E76\u79BB\u5F00\uFF1F");async function $e(){let t=await r("/projects");return Z.current&&b(t),t}async function Ne(t=o?.id,m=!1){let j=t?await r("/projects/"+t):null;return Z.current&&j&&(m||!Ae.current||Ae.current===t)&&(Ae.current!==j.id&&(se(null),oe(null),be("assistant")),Ae.current=j.id,$(V=>V?.id===j.id&&V.revision>j.revision?V:j)),await $e(),j}Te(()=>(Z.current=!0,ee("\u8F7D\u5165\u9879\u76EE"),$e().then(async t=>{if(t.length&&Z.current){let m=await r("/projects/"+t[0].id);Z.current&&$(m)}}).catch(t=>Z.current&&J(t.message)).finally(()=>Z.current&&ee("")),()=>{Z.current=!1,Ie.current++}),[]),Te(()=>{let t=m=>{(d||P)&&(m.preventDefault(),m.returnValue="")};return window.addEventListener("beforeunload",t),()=>window.removeEventListener("beforeunload",t)},[d,P]);async function R(t,m){if(A)return;let j=++Ie.current;ee(t),J(""),ze("");try{await m()}catch(V){Z.current&&j===Ie.current&&J(V.message)}finally{Z.current&&j===Ie.current&&ee("")}}async function Ct(t){lt()&&await R("\u6253\u5F00\u9879\u76EE",async()=>{w(null),D(!1),z(!1),K("overview"),T("form"),await Ne(t,!0),w(null),D(!1),z(!1),se(null),oe(null),be("assistant"),K("overview")})}async function Be(t){lt()&&(K(t),T("form"),w(null),D(!1),z(!1),ze(""),J(""),o.single_form&&o.stages.some(m=>m.id===t)&&await R("\u6253\u5F00\u9879\u76EE\u8868\u5355",async()=>{let m=await r(`/projects/${o.id}/form`,f({revision:o.revision,stage_id:t}));await Ne(),w({id:m.id,view:"edit",revision:m.revision,initialDraft:m})}))}function pe(t,m){H(m),Y(t),J("")}async function fe(t,m,j="POST"){let V=await r(t,{...f({...m,revision:o.revision}),method:j});return Z.current&&($(V),Y(null)),await $e(),V}function bt(t){return R(t?"\u8BFB\u53D6\u9636\u6BB5 Excel":"\u51C6\u5907\u8C08\u5224\u8868\u5355",async()=>{let m;if(t){let j=new FormData;j.append("revision",o.revision),j.append("stage_id",N),j.append("workbook",t),m=await r(`/projects/${o.id}/${o.single_form?"form":"cases"}/import`,{method:"POST",body:j})}else m=await r(`/projects/${o.id}/${o.single_form?"form":"cases"}`,f({revision:o.revision,stage_id:N}));await Ne(),w({id:m.id,view:"edit",revision:m.revision,initialDraft:o.single_form?m:void 0}),D(!1),t&&ze(m.templates.length?"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\uFF0C\u5E76\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002":"\u5DF2\u8BFB\u53D6\u672C\u9636\u6BB5\u53D8\u91CF\u914D\u7F6E\uFF0C\u8BF7\u6DFB\u52A0\u5BF9\u5E94\u7684 Word \u6A21\u677F\u3002")})}function ht(t){if(!t)return;let m=Re.current;return R("\u4FDD\u5B58\u6750\u6599",async()=>{let j=new FormData;j.append("revision",o.revision),j.append("file",t);let V=await r(`/projects/${o.id}/stages/${N}/materials/${m}/files`,{method:"POST",body:j});$(V),await $e();let Pe=V.stages.find(pt=>pt.id===N),tt=Pe?.materials.find(pt=>pt.id===m)?.files.at(-1);ze(Pe?.status==="completed"&&Pe.completion_file_id===tt?.id?`\u5BA1\u6279\u6587\u4EF6\u5DF2\u4FDD\u5B58\uFF0C\u672C\u9636\u6BB5\u5DF2\u81EA\u52A8\u6807\u8BB0\u4E3A\u5DF2\u5B8C\u6210\uFF0C\u6279\u590D\u65E5\u671F ${Pe.approval_date}\u3002`:tt?.approval_review?.status==="ready"?`\u5BA1\u6279\u6587\u4EF6\u5DF2\u4FDD\u5B58\uFF0C\u5E76\u8BC6\u522B\u51FA ${tt.approval_review.fields.length} \u9879\u5BA1\u6279\u7ED3\u679C\u3002`:"\u6750\u6599\u5DF2\u4FDD\u5B58\uFF0C\u539F\u6709\u7248\u672C\u7EE7\u7EED\u4FDD\u7559\u3002\u8BF7\u6838\u5BF9\u540E\u66F4\u65B0\u6750\u6599\u72B6\u6001\u3002")})}let Ce=o?`/projects/${o.id}`:"",_t=[{id:"form",label:"\u5185\u5BB9\u586B\u5199"},...L?.id==="negotiation"?[{id:"response",label:"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5"}]:[],{id:"materials",label:"\u5BA1\u6279\u8D44\u6599"},{id:"attachments",label:"\u5176\u4ED6\u9644\u4EF6"}],n=t=>{t.preventDefault(),R("\u4FDD\u5B58\u6750\u6599\u4FE1\u606F",()=>fe(`${Ce}/stages/${N}/materials${I.id?"/"+I.id:""}`,I,I.id?"PUT":"POST"))},p=t=>R("\u6574\u7406\u4E0B\u8F7D\u5305",()=>h(Ce+"/bundle"+(t?"?stage_id="+t:""),`${o.name}_${t?L.title:"\u5168\u6D41\u7A0B\u6750\u6599"}.zip`));return e.createElement("main",{ref:ot,style:{"--df-dock-size":te+"px"},className:"df-app df-project-app"+(o?.single_form?" df-three-column":"")+(le?" df-left-collapsed":"")+(gt?" df-right-collapsed":""),"data-theme":st},e.createElement("style",null,Mt+It),e.createElement("input",{ref:Ge,type:"file",accept:".xlsx",hidden:!0,"aria-label":"\u5BFC\u5165\u9636\u6BB5 Excel",onChange:t=>{let m=t.target.files[0];t.target.value="",m&&bt(m)}}),e.createElement("input",{ref:Oe,type:"file",accept:".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.png,.jpg,.jpeg,.zip,.txt,.csv",hidden:!0,"aria-label":"\u4E0A\u4F20\u9636\u6BB5\u6750\u6599",onChange:t=>{let m=t.target.files[0];t.target.value="",ht(m)}}),e.createElement("aside",{className:"df-sidebar df-project-sidebar"+(le?" df-pane-collapsed":""),"aria-label":"\u9879\u76EE\u9009\u62E9"},e.createElement("button",{className:"df-pane-toggle","aria-label":le?"\u5C55\u5F00\u9879\u76EE\u680F":"\u6536\u8D77\u9879\u76EE\u680F","aria-expanded":!le,title:le?"\u5C55\u5F00\u9879\u76EE\u680F":"\u6536\u8D77\u9879\u76EE\u680F",onClick:()=>ue(t=>!t)},e.createElement("span",{"aria-hidden":"true"},le?"\u203A":"\u2039"),e.createElement("span",null,le?"\u9879\u76EE":"\u6536\u8D77")),e.createElement("div",{className:"df-brand"},"\u5916\u534F\u52A9\u624B"),e.createElement("button",{className:"df-primary df-new",disabled:!!A||!!U,onClick:()=>{lt()&&pe("create",{name:"",code:"",owner:""})}},"\uFF0B \u65B0\u5EFA\u9879\u76EE"),e.createElement("label",{className:"df-project-search"},e.createElement("span",{className:"df-sr-only"},"\u641C\u7D22\u9879\u76EE"),e.createElement("input",{"aria-label":"\u641C\u7D22\u9879\u76EE",placeholder:"\u641C\u7D22\u9879\u76EE\u540D\u79F0\u6216\u7F16\u53F7",value:S,onChange:t=>O(t.target.value)})),e.createElement("div",{className:"df-caption"},"\u6211\u7684\u9879\u76EE ",e.createElement("span",null,s.length)),e.createElement("nav",{"aria-label":"\u9879\u76EE\u5217\u8868"},s.filter(t=>(t.name+" "+t.code).toLowerCase().includes(S.trim().toLowerCase())).map(t=>e.createElement("button",{key:t.id,disabled:!!A||!!U,"aria-current":o?.id===t.id?"page":void 0,onClick:()=>Ct(t.id)},e.createElement("b",null,t.name),e.createElement("small",null,t.code||"\u672A\u8BBE\u7F16\u53F7"," \xB7 ",t.completed,"/7 \u9636\u6BB5\u5B8C\u6210")))),S.trim()&&!s.some(t=>(t.name+" "+t.code).toLowerCase().includes(S.trim().toLowerCase()))&&e.createElement("div",{className:"df-search-empty",role:"status"},e.createElement("p",null,"\u672A\u627E\u5230\u9879\u76EE"),e.createElement("button",{onClick:()=>O("")},"\u6E05\u9664\u641C\u7D22")),e.createElement("div",{className:"df-sidebar-foot",hidden:!!(o?.single_form&&L&&C)},e.createElement("button",{disabled:!!A||!!U,onClick:()=>R("\u4E0B\u8F7D\u914D\u5957\u6A21\u677F",()=>h("/starter","\u6587\u4E66\u586B\u62A5_\u914D\u5957\u6A21\u677F.zip"))},"\u4E0B\u8F7D\u914D\u5957\u6A21\u677F \u2197"))),e.createElement("section",{className:"df-main df-project-main",ref:Je},e.createElement("header",{className:"df-header"},e.createElement("div",null,e.createElement("h1",null,o?.name||"\u9879\u76EE\u5DE5\u4F5C\u53F0"),e.createElement("p",null,o?[o.code||"\u672A\u8BBE\u9879\u76EE\u7F16\u53F7",o.owner&&"\u7ECF\u529E\u4EBA\uFF1A"+o.owner].filter(Boolean).join("\u3000\xB7\u3000"):"\u7BA1\u7406\u5916\u534F\u9879\u76EE\u3001\u9636\u6BB5\u6750\u6599\u4E0E\u529E\u7406\u8FDB\u5EA6\u3002")),o&&e.createElement("div",{className:"df-actions"},e.createElement("button",{disabled:!!A||!!U,onClick:()=>Be("profile")},"\u57FA\u7840\u4FE1\u606F\u586B\u62A5"),e.createElement("button",{disabled:!!A||!!U,onClick:()=>p()},"\u4E0B\u8F7D\u9879\u76EE\u6750\u6599"))),ne&&e.createElement("div",{role:"alert",className:"df-alert error"},ne,e.createElement("button",{"aria-label":"\u5173\u95ED\u9519\u8BEF\u63D0\u793A",onClick:()=>J("")},"\xD7")),q&&e.createElement("div",{className:"df-alert",role:"status"},q),me&&me.projectId===o?.id&&me.stageId===N&&e.createElement("div",{className:"df-alert df-file-deleted",role:"status"},e.createElement("span",null,"\u5DF2\u5220\u9664 V",me.file.version," \xB7 ",me.file.name),e.createElement("button",{disabled:!!A||!!U,onClick:()=>R("\u64A4\u9500\u5220\u9664",async()=>{let t=await r(`/projects/${me.projectId}/stages/${me.stageId}/materials/${me.materialId}/files/${me.file.id}/restore`,f({revision:o.revision}));$(t),rt(null),ze("\u5BA1\u6279\u6587\u4EF6\u5DF2\u6062\u590D\u3002"),await $e()})},"\u64A4\u9500\u5220\u9664")),A&&e.createElement("div",{className:"df-progress",role:"status"},A,"\u2026"),o?e.createElement(e.Fragment,null,e.createElement("nav",{className:"df-project-tabs","aria-label":"\u9879\u76EE\u9636\u6BB5"},e.createElement("button",{className:N==="overview"?"active":"",disabled:!!A||!!U,onClick:()=>Be("overview")},"\u9879\u76EE\u603B\u89C8"),o.stages.map((t,m)=>e.createElement("button",{key:t.id,"aria-current":N===t.id?"step":void 0,className:N===t.id?"active":"",disabled:!!A||!!U,onClick:()=>Be(t.id)},e.createElement("small",null,String(m+1).padStart(2,"0"))," ",t.title,e.createElement("span",{className:"df-state df-state-"+t.status},t.upstream_changed.length||t.documents_changed?"\u5F85\u590D\u6838":wt[t.status])))),e.createElement("fieldset",{className:"df-content",disabled:!!A||!!U},N==="overview"&&e.createElement(e.Fragment,null,o.migrated&&e.createElement("p",{className:"df-muted df-migration-note"},"\u5386\u53F2\u586B\u62A5\u5DF2\u6309\u9879\u76EE\u540D\u79F0\u6216\u7F16\u53F7\u5F52\u5165\u5546\u52A1\u8C08\u5224\u9636\u6BB5\uFF0C\u539F\u8868\u5355\u3001\u751F\u6210\u6279\u6B21\u548C\u6587\u4EF6\u5747\u4FDD\u7559\u3002"),e.createElement("section",{className:"df-project-metrics"},e.createElement("div",null,e.createElement("b",null,o.stages.filter(t=>t.status==="completed").length,e.createElement("small",null,"/ ",o.stages.length)),e.createElement("span",null,"\u5DF2\u5B8C\u6210\u9636\u6BB5")),e.createElement("div",null,e.createElement("b",null,o.stages.reduce((t,m)=>t+m.materials.filter(j=>!["done","na"].includes(j.status)).length,0)),e.createElement("span",null,"\u5F85\u6574\u7406\u6750\u6599")),e.createElement("div",null,e.createElement("b",null,o.forms.reduce((t,m)=>t+m.outputs,0)),e.createElement("span",null,"\u5DF2\u751F\u6210\u6587\u4EF6")),e.createElement("div",null,e.createElement("b",null,o.stages.filter(t=>t.upstream_changed.length||t.documents_changed).length),e.createElement("span",null,"\u5F85\u590D\u6838\u9636\u6BB5"))),e.createElement("div",{className:"df-project-stage-grid"},o.stages.map((t,m)=>e.createElement("button",{className:"df-paper df-stage-card",key:t.id,onClick:()=>Be(t.id)},e.createElement("div",{className:"df-section-head"},e.createElement("small",null,"\u9636\u6BB5 ",String(m+1).padStart(2,"0")),e.createElement("span",{className:"df-state df-state-"+t.status},t.upstream_changed.length||t.documents_changed?"\u5F85\u590D\u6838":wt[t.status])),e.createElement("h2",null,t.title),e.createElement("p",null,t.purpose),e.createElement("span",{className:"df-deadline "+yt(t,g).kind},yt(t,g).text),e.createElement("footer",null,e.createElement("span",null,t.materials.filter(j=>["done","na"].includes(j.status)).length,"/",t.materials.length," \u9879\u6750\u6599\u5DF2\u5904\u7406"),e.createElement("span",null,t.upstream_changed.length||t.documents_changed?"\u6709\u53D8\u66F4\u5F85\u590D\u6838":t.due_date?"\u8BA1\u5212 "+t.due_date:"\u8FDB\u5165\u9636\u6BB5 \u2192"))))),e.createElement("section",{className:"df-paper df-project-hint"},e.createElement("h2",null,"\u4E00\u4EFD\u9879\u76EE\u5E95\u7A3F\uFF0C\u8D2F\u7A7F\u5404\u9636\u6BB5"),e.createElement("p",null,"\u9879\u76EE\u540D\u79F0\u3001\u7814\u7A76\u5185\u5BB9\u3001\u6210\u679C\u6307\u6807\u548C\u9884\u7B97\u7B49\u53EF\u5728\u201C\u57FA\u7840\u4FE1\u606F\u586B\u62A5\u201D\u7EDF\u4E00\u7EF4\u62A4\u3002\u9636\u6BB5\u8868\u5355\u4ECE\u5E95\u7A3F\u53D6\u503C\uFF0C\u540E\u7EED\u53D8\u66F4\u4F1A\u63D0\u9192\u6838\u5BF9\uFF1B\u5DF2\u6709\u751F\u6210\u6587\u4EF6\u4FDD\u7559\u539F\u6837\u3002"),e.createElement("button",{onClick:()=>Be("profile")},"\u586B\u5199\u57FA\u7840\u4FE1\u606F"))),N==="profile"&&e.createElement(ca,{onDirtyChange:z,key:o.id+":"+o.revision,project:o,Field:l,request:r,onSave:t=>R("\u4FDD\u5B58\u57FA\u7840\u4FE1\u606F",async()=>{await fe(Ce,t,"PUT"),ze("\u57FA\u7840\u4FE1\u606F\u5DF2\u66F4\u65B0\u3002\u5DF2\u6709\u8868\u5355\u53EF\u9010\u9879\u6838\u5BF9\u540E\u540C\u6B65\uFF0C\u539F\u751F\u6210\u6587\u4EF6\u4E0D\u53D8\u3002")})}),L&&e.createElement(e.Fragment,null,e.createElement("section",{className:"df-paper df-stage-header"},e.createElement("div",{className:"df-stage-top-row"},e.createElement("div",{className:"df-stage-heading"},e.createElement("h2",null,L.title),!o.single_form&&e.createElement("details",{className:"df-stage-help"},e.createElement("summary",null,"\u672C\u9636\u6BB5\u529E\u7406\u8BF4\u660E"),e.createElement("p",null,o.single_form&&L.id==="plan"?"\u5DF2\u63A5\u5165\u79D1\u7814\u8BA1\u5212\u586B\u62A5\u8868\u4E0E\u5916\u534F\u5FC5\u8981\u6027\u8BF4\u660E\uFF0C\u53EF\u76F4\u63A5\u586B\u5199\u5E76\u751F\u6210\u3002":L.id==="selection"?"\u5DF2\u63A5\u5165\u8BBA\u8BC1\u610F\u89C1\u53CA\u7B7E\u5B57\u8868\u4E0E\u975E\u62DB\u6807\u65B9\u6848\u586B\u62A5\u8868\uFF0C\u53EF\u5148\u51C6\u5907\u8BBA\u8BC1\u6750\u6599\uFF0C\u8BBA\u8BC1\u7ED3\u675F\u540E\u6838\u5BF9\u7CFB\u7EDF\u586B\u62A5\u4FE1\u606F\u3002":L.id==="negotiation"?"\u4E94\u4EFD\u6807\u51C6\u6A21\u677F\u5DF2\u63A5\u5165\uFF0C\u53EF\u76F4\u63A5\u586B\u5199\uFF0C\u4E5F\u53EF\u5BFC\u5165\u73B0\u6709 Excel\u3002":"\u7EDF\u4E00\u6A21\u677F\u5F85\u8865\u5145\uFF0C\u53EF\u4E0A\u4F20\u9636\u6BB5\u6750\u6599\uFF0C\u6216\u5BFC\u5165 Excel \u4E0E Word \u6A21\u677F\u3002"))),e.createElement("div",{className:"df-stage-toolbar",role:"toolbar","aria-label":"\u9636\u6BB5\u5DE5\u5177\u680F"},e.createElement("div",{className:"df-stage-tool-slot",ref:G}),(!o.single_form||!C||!Fe.host.ReactDOM?.createPortal)&&e.createElement("div",{className:"df-toolbar-file-actions"},e.createElement("button",{"aria-label":"\u4E0B\u8F7D\u672C\u9636\u6BB5\u6750\u6599",title:"\u4E0B\u8F7D\u672C\u9636\u6BB5\u6750\u6599",onClick:()=>p(L.id)},e.createElement(re,{name:"download"}),"\u9636\u6BB5\u6750\u6599")))),e.createElement("div",{className:"df-stage-bottom-row"},e.createElement(ct,{id:"df-node",label:"\u9636\u6BB5\u529E\u7406\u6D41\u7A0B",items:_t,value:x,onChange:t=>{T(t),t==="form"&&x==="form"&&y(m=>m+1),document.getElementById("df-node-tab-"+t)?.closest(".df-stage-header")?.scrollIntoView?.({block:"start"})}}),e.createElement("div",{className:"df-node-status","aria-label":"\u8282\u70B9\u529E\u7406\u6982\u51B5"},e.createElement("button",{className:"df-stage-state df-state df-state-"+L.status,disabled:d,"aria-label":"\u529E\u7406\u4FE1\u606F\u4E0E\u72B6\u6001",title:d?"\u8BF7\u5148\u4FDD\u5B58\u586B\u5199\u5185\u5BB9\uFF0C\u518D\u66F4\u65B0\u529E\u7406\u72B6\u6001":"\u529E\u7406\u4FE1\u606F\u4E0E\u72B6\u6001",onClick:()=>pe("stage",{...L,confirmed:!1})},e.createElement("span",{className:"df-state-dot","aria-hidden":"true"}),wt[L.status],e.createElement(re,{name:"chevron"})),e.createElement("span",{className:"df-deadline "+yt(L,g).kind},e.createElement(re,{name:"calendar"}),yt(L,g).text),e.createElement("span",{className:"df-stage-approval-count"},"\u5BA1\u6279\u8D44\u6599"," ",Ye.filter(t=>t.files.length).length,"/",Ye.length)))),(L.upstream_changed.length>0||L.documents_changed)&&e.createElement("div",{className:"df-alert df-stage-warning"},e.createElement("div",null,e.createElement("b",null,"\u672C\u9636\u6BB5\u6709\u8D44\u6599\u9700\u8981\u590D\u6838"),e.createElement("p",null,L.upstream_changed.length>0&&"\u524D\u5E8F\u9636\u6BB5\u5DF2\u66F4\u65B0\uFF1A"+L.upstream_changed.join("\u3001")+"\u3002",L.documents_changed&&"\u672C\u9636\u6BB5\u8868\u5355\u6216\u751F\u6210\u6587\u4EF6\u6709\u66F4\u65B0\u3002","\u8BF7\u6838\u5BF9\u5DF2\u63D0\u4EA4\u7684\u6750\u6599\u662F\u5426\u9700\u8981\u8C03\u6574\u3002")),e.createElement("button",{onClick:()=>R("\u8BB0\u5F55\u590D\u6838",()=>fe(`${Ce}/stages/${L.id}/acknowledge`,{}))},"\u5DF2\u6838\u5BF9\u53D8\u66F4")),(L.system_name||L.submission_ref||L.notes)&&e.createElement("section",{className:"df-paper df-stage-details"},e.createElement("dl",null,e.createElement("div",null,e.createElement("dt",null,"\u529E\u7406\u7CFB\u7EDF"),e.createElement("dd",null,L.system_url?e.createElement("a",{href:L.system_url,target:"_blank",rel:"noopener noreferrer"},L.system_name||"\u6253\u5F00\u529E\u7406\u7CFB\u7EDF"," \u2197"):L.system_name||"\u672A\u8BB0\u5F55")),e.createElement("div",null,e.createElement("dt",null,"\u63D0\u4EA4\u7F16\u53F7 / \u56DE\u6267"),e.createElement("dd",null,L.submission_ref||"\u672A\u8BB0\u5F55"))),L.notes&&e.createElement("p",null,L.notes)),e.createElement("div",{id:"df-node-panel-form",role:"tabpanel","aria-labelledby":"df-node-tab-form",hidden:x!=="form"},e.createElement("div",{id:"df-node-form"},C&&e.createElement(i,{key:o.id+":"+C.id+":"+N+":"+(C.revision||""),project:o,workflowStage:L,initialCaseId:C.id,initialView:C.view,editRequest:_,initialDraft:C.initialDraft,onDirtyChange:D,onBusyChange:B,onViewChange:()=>document.getElementById("df-node-form")?.scrollIntoView?.({block:"start"}),onBack:()=>{w(null),D(!1),Ne().catch(t=>J(t.message))},onChanged:()=>Ne(),docked:o.single_form,toolbarTarget:v,onShowForm:()=>T("form"),onDownloadStageMaterials:()=>p(L.id),onEditBasics:()=>{w(null),D(!1),B(""),K("profile")},onStageStatus:()=>pe("stage",{...L,confirmed:!1}),onPreview:t=>{oe(t),se(null),be("preview")}})),!C&&e.createElement("section",{className:"df-paper df-stage-forms"},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,o.single_form?"\u9879\u76EE\u8868\u5355":"\u586B\u5199\u4E0E\u751F\u6210"),e.createElement("p",{className:"df-muted"},"\u8868\u5355\u6CBF\u7528\u9879\u76EE\u5E95\u7A3F\uFF0C\u6838\u5BF9\u540E\u751F\u6210\u3002\u5DF2\u6709\u6279\u6B21\u4FDD\u7559\u751F\u6210\u65F6\u7684\u5185\u5BB9\u3002")),e.createElement("div",{className:"df-actions"},(L.id==="negotiation"||o.single_form)&&e.createElement("button",{className:"df-primary",onClick:()=>bt()},o.single_form?"\u6253\u5F00\u9879\u76EE\u8868\u5355":"\u586B\u5199\u8C08\u5224\u6750\u6599"),e.createElement("button",{onClick:()=>Ge.current.click()},"\u5BFC\u5165 Excel \u8868\u5355"))),o.single_form?e.createElement("p",{className:"df-muted"},"\u6BCF\u4E2A\u9879\u76EE\u5171\u7528\u4E00\u4EFD\u8868\u5355\uFF0C\u4E03\u4E2A\u9636\u6BB5\u5404\u529E\u7406\u4E00\u6B21\u3002\u5DF2\u6709\u6587\u4E66\u4E0E\u5386\u53F2\u5E95\u7A3F\u53EF\u5728\u53F3\u4FA7\u67E5\u770B\u3002"):ke.length?e.createElement("div",{className:"df-project-forms"},ke.map(t=>e.createElement("div",{key:t.case_id},e.createElement("div",null,e.createElement("b",null,t.name),e.createElement("small",null,Kt(t.updated_at)," \xB7"," ",t.outputs?t.outputs+" \u4EFD\u6587\u4EF6":"\u586B\u5199\u4E2D",t.shared_changes.length>0&&" \xB7 \u57FA\u7840\u4FE1\u606F\u6709\u66F4\u65B0")),e.createElement("div",{className:"df-actions"},e.createElement("button",{onClick:()=>w({id:t.case_id,view:"edit"})},"\u6253\u5F00\u8868\u5355"),t.outputs>0&&e.createElement("button",{onClick:()=>w({id:t.case_id,view:"files"})},"\u67E5\u770B\u751F\u6210\u6587\u4EF6"))))):e.createElement("p",{className:"df-empty"},"\u672C\u9636\u6BB5\u8FD8\u6CA1\u6709\u8868\u5355\u3002\u5DF2\u6709\u6210\u54C1\u6587\u4EF6\u53EF\u76F4\u63A5\u4E0A\u4F20\u5230\u4E0B\u9762\u7684\u6750\u6599\u6E05\u5355\u3002"))),L.id==="negotiation"&&e.createElement("section",{className:"df-paper df-review-entry",role:"tabpanel",id:"df-node-panel-response","aria-labelledby":"df-node-tab-response",hidden:x!=="response"},e.createElement("div",null,e.createElement("h2",null,"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5"),e.createElement("p",{className:"df-muted"},"\u5BF9\u7167\u6B63\u5F0F\u8C08\u5224\u6587\u4EF6\uFF0C\u68C0\u67E5\u5404\u5355\u4F4D\u54CD\u5E94\u6750\u6599\uFF0C\u6C47\u603B\u95EE\u9898\u3001\u4F9D\u636E\u548C\u5F85\u786E\u8BA4\u4E8B\u9879\u3002")),e.createElement("button",{onClick:()=>o.single_form?be("review"):pe("response-review",{})},"\u6253\u5F00\u6838\u67E5\u667A\u80FD\u4F53 \u2192")),e.createElement("div",{role:"tabpanel",id:"df-node-panel-materials","aria-labelledby":"df-node-tab-materials",hidden:x!=="materials"},e.createElement(Pt,{key:o.id+":"+L.id,projectId:o.id,materials:Ye,active:x==="materials",busy:!!A||!!U,onDelete:(t,m)=>pe("delete-file",{materialId:t.id,file:{...m,version:m.version||t.files.indexOf(m)+1}}),onUpload:t=>{Re.current=t.id,Oe.current.click()},onEdit:t=>pe("material",{...t}),onAdd:()=>pe("material",{name:"\u5BA1\u6279\u8D44\u6599",status:"pending",required:!1,note:""}),onPreview:t=>{se(t),oe({artifact:{title:t.name},reference:{file_id:t.id}}),be("preview")},onDownload:t=>R("\u4E0B\u8F7D\u5BA1\u6279\u6587\u4EF6",()=>h(Ce+"/files/"+t.id,t.name)),review:L.id==="plan"&&ie&&e.createElement("div",{className:"df-approval-review-summary"},ie.approval_review.status==="ready"?e.createElement(e.Fragment,null,e.createElement("span",{className:"df-muted"},"\u6279\u590D\u65E5\u671F"," ",ie.approval_review.approved_at," \xB7 \u5DF2\u8BC6\u522B"," ",ie.approval_review.fields.length," ","\u9879 \xB7"," ",ie.approval_review.change_count?`\u53D1\u73B0 ${ie.approval_review.change_count} \u9879\u5DEE\u5F02`:"\u4E0E\u5F53\u524D\u8D44\u6599\u4E00\u81F4"),e.createElement("button",{onClick:()=>{Se(ie.approval_review.fields.filter(t=>t.changed).map(t=>t.key)),Y("approval")}},"\u67E5\u770B\u6BD4\u5BF9\u7ED3\u679C \u2192")):e.createElement("span",{className:"df-muted"},ie.approval_review.message))})),e.createElement("div",{role:"tabpanel",id:"df-node-panel-attachments","aria-labelledby":"df-node-tab-attachments",hidden:x!=="attachments"},e.createElement("section",{className:"df-paper df-material-panel",id:"df-node-attachments"},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,"\u5176\u4ED6\u9644\u4EF6 ",e.createElement("small",null,et.length)),e.createElement("p",{className:"df-muted"},"\u9879\u76EE\u8FC7\u7A0B\u6587\u4EF6\u548C\u8865\u5145\u6750\u6599\u3002")),e.createElement("button",{onClick:()=>pe("material",{name:"",status:"pending",required:!1,note:""})},"\uFF0B \u6DFB\u52A0\u6750\u6599")),e.createElement("div",{className:"df-materials"},et.map(t=>{let m=ke.reduce((j,V)=>j+(V.generations[0]?.files.filter(Pe=>Pe.name.includes(t.name)).length||0),0);return e.createElement("article",{className:"df-material-row",key:t.id},e.createElement("div",{className:"df-material-name"},e.createElement("b",null,t.name),t.required&&e.createElement("span",{className:"df-required-tag"},"\u5FC5\u5907"),e.createElement("span",{className:"df-state df-material-state-"+t.status},Vt[t.status]),m>0&&e.createElement("small",null,"\u5DF2\u6709 ",m," \u4EFD\u751F\u6210\u7A3F \xB7 \u5728\u4E0A\u65B9\u8868\u5355\u67E5\u770B"),t.note&&e.createElement("p",null,t.note)),e.createElement("div",{className:"df-material-files"},t.files.length>0?e.createElement("details",null,e.createElement("summary",null,t.files.length," \u4EFD\u6587\u4EF6 / \u7248\u672C \xB7 \u6700\u65B0\uFF1A",t.files[t.files.length-1].name),[...t.files].reverse().map((j,V)=>e.createElement("div",{className:"df-material-file",key:j.id},e.createElement("div",null,e.createElement("b",null,"V",j.version||t.files.length-V," ","\xB7 ",j.name),e.createElement("small",null,Kt(j.uploaded_at)," \xB7"," ",Math.max(1,Math.round(j.size/1024))," ","KB")),e.createElement("button",{onClick:()=>{se(j),oe({artifact:{title:j.name},reference:{file_id:j.id}}),be("preview")}},"\u9884\u89C8"),e.createElement("button",{"aria-label":"\u4E0B\u8F7D"+j.name+"\u7248\u672C"+(j.version||t.files.length-V),onClick:()=>R("\u4E0B\u8F7D\u6750\u6599",()=>h(`${Ce}/files/${j.id}`,j.name))},"\u4E0B\u8F7D")))):e.createElement("span",{className:"df-muted"},"\u5C1A\u672A\u4E0A\u4F20\u6587\u4EF6")),e.createElement("div",{className:"df-actions"},e.createElement("button",{"aria-label":"\u4E0A\u4F20"+t.name,onClick:()=>{Re.current=t.id,Oe.current.click()}},"\u4E0A\u4F20\u6587\u4EF6"),e.createElement("button",{"aria-label":"\u7F16\u8F91"+t.name,onClick:()=>pe("material",{...t})},"\u7F16\u8F91")))})))),!o.single_form&&e.createElement("div",{className:"df-stage-tail"},e.createElement("p",null,"\u5404\u9636\u6BB5\u53EF\u5E76\u884C\u51C6\u5907\uFF1B\u524D\u5E8F\u8D44\u6599\u53D8\u5316\u540E\uFF0C\u540E\u7EED\u9636\u6BB5\u4F1A\u63D0\u793A\u590D\u6838\u3002\u9636\u6BB5\u5B8C\u6210\u7531\u7ECF\u529E\u4EBA\u786E\u8BA4\u3002"),e.createElement("button",{onClick:()=>pe("stage",{...L,confirmed:!1})},"\u66F4\u65B0\u529E\u7406\u72B6\u6001"))))):e.createElement("section",{className:"df-paper df-project-welcome"},e.createElement("h2",null,"\u5148\u5EFA\u4E00\u4E2A\u9879\u76EE"),e.createElement("p",null,"\u586B\u5199\u57FA\u7840\u4FE1\u606F\u540E\uFF0C\u9009\u62E9\u9636\u6BB5\u529E\u7406\u3002"),e.createElement("div",{className:"df-welcome-stages"},fa.map((t,m)=>e.createElement("span",{key:t},e.createElement("small",null,String(m+1).padStart(2,"0")),t))),e.createElement("button",{className:"df-primary",onClick:()=>pe("create",{name:"",code:"",owner:""})},"\u5EFA\u7ACB\u7B2C\u4E00\u4E2A\u9879\u76EE"))),o?.single_form&&e.createElement(jt,{key:o.id,collapsed:gt,width:te,maxWidth:ye,onResize:ge,onToggle:()=>De(t=>!t),project:o,stageId:N,services:c,mode:Me,onMode:be,selection:dt,attachment:je,AttachmentPreview:Ht,dirty:d,onSelect:t=>{oe(t),se(null),be("preview")},onChanged:()=>Ne().catch(t=>J(t.message))}),we==="delete-file"&&e.createElement(Ke,{title:"\u5220\u9664\u5BA1\u6279\u6587\u4EF6",busy:!!A,error:ne,onClose:()=>Y(null)},e.createElement("p",null,"\u786E\u5B9A\u5220\u9664\u5F53\u524D\u9009\u4E2D\u7684\u5BA1\u6279\u6587\u4EF6\uFF1F"),e.createElement("p",{className:"df-delete-file-name"},"V",I.file.version," \xB7 ",I.file.name),e.createElement("p",{className:"df-muted"},"\u5220\u9664\u540E\u53EF\u901A\u8FC7\u201C\u64A4\u9500\u5220\u9664\u201D\u6062\u590D\u3002"),e.createElement("div",{className:"df-actions"},e.createElement("button",{disabled:!!A,onClick:()=>Y(null)},"\u53D6\u6D88"),e.createElement("button",{className:"df-danger",disabled:!!A||!!U,onClick:()=>R("\u5220\u9664\u5BA1\u6279\u6587\u4EF6",async()=>{let t={projectId:o.id,stageId:N,materialId:I.materialId,file:I.file},m=await r(`/projects/${t.projectId}/stages/${t.stageId}/materials/${t.materialId}/files/${t.file.id}`,{...f({revision:o.revision}),method:"DELETE"});$(m),Y(null),rt(t),(je?.id===t.file.id||dt?.reference?.file_id===t.file.id)&&(se(null),oe(null),be("assistant")),await $e()})},"\u786E\u8BA4\u5220\u9664"))),we==="response-review"&&e.createElement(Ke,{title:"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5",onClose:()=>{Y(null),Ne().catch(t=>J(t.message))}},e.createElement(ft,{project:o,services:c,onChanged:()=>Ne().catch(t=>J(t.message))})),we==="approval"&&ie&&e.createElement(Ke,{title:"\u6838\u5BF9\u8BA1\u5212\u5BA1\u6279\u7ED3\u679C",busy:!!A,error:ne,onClose:()=>Y(null)},e.createElement("p",{className:"df-muted"},"\u6765\u6E90\uFF1A",ie.name," \xB7 \u6279\u590D\u65E5\u671F"," ",ie.approval_review.approved_at,"\u3002\u4EC5\u52FE\u9009\u7684\u5DEE\u5F02\u4F1A\u5199\u56DE\u9879\u76EE\u8D44\u6599\u548C\u4E0A\u62A5\u8BA1\u5212\u8868\u5355\u3002"),e.createElement("div",{className:"df-compare df-approval-compare"},ie.approval_review.fields.map(t=>e.createElement("label",{key:t.key},e.createElement("input",{type:"checkbox","aria-label":"\u91C7\u7528\u5BA1\u6279\u7ED3\u679C\uFF1A"+t.label,disabled:!t.changed,checked:X.includes(t.key),onChange:m=>Se(m.target.checked?[...X,t.key]:X.filter(j=>j!==t.key))}),e.createElement("div",null,e.createElement("b",null,t.label,!t.changed&&e.createElement("small",null," \u4E00\u81F4")),e.createElement("div",{className:"df-compare-values"},e.createElement("p",null,e.createElement("small",null,"\u5F53\u524D\u8D44\u6599"),t.current||"\u7A7A\u767D"),e.createElement("p",null,e.createElement("small",null,"\u5BA1\u6279\u7ED3\u679C"),t.value||"\u7A7A\u767D")))))),d&&e.createElement("p",{role:"status"},"\u8BF7\u5148\u4FDD\u5B58\u586B\u5199\u5185\u5BB9\uFF0C\u518D\u91C7\u7528\u5BA1\u6279\u7ED3\u679C\u3002"),e.createElement("div",{className:"df-actions"},e.createElement("button",{disabled:!!A,onClick:()=>Y(null)},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!A||!!U||d||!X.length,onClick:()=>R("\u91C7\u7528\u5BA1\u6279\u7ED3\u679C",async()=>{let t=await r(`${Ce}/stages/plan/approval/apply`,f({revision:o.revision,file_id:ie.id,keys:X}));if($(t),C){let m=await r(`/cases/${C.id}`);w({...C,initialDraft:m,revision:m.revision})}Y(null),Se([]),await $e(),ze("\u5DF2\u91C7\u7528\u6240\u9009\u5BA1\u6279\u7ED3\u679C\u3002\u540E\u7EED\u9636\u6BB5\u4F1A\u63D0\u793A\u91CD\u65B0\u6838\u5BF9\u53D7\u5F71\u54CD\u8D44\u6599\u3002")})},"\u91C7\u7528\u6240\u9009 ",X.length," \u9879"))),we==="create"&&e.createElement(Ke,{title:"\u65B0\u5EFA\u9879\u76EE",busy:!!A,error:ne,onClose:()=>Y(null)},e.createElement("form",{onSubmit:t=>{t.preventDefault(),R("\u5EFA\u7ACB\u9879\u76EE",async()=>{let m=await r("/projects",f(I));se(null),oe(null),be("assistant"),$(m),K("overview"),w(null),D(!1),Y(null),await $e()})}},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u540D\u79F0"),e.createElement("input",{"aria-label":"\u65B0\u9879\u76EE\u540D\u79F0",required:!0,maxLength:120,value:I.name,onChange:t=>H({...I,name:t.target.value})})),e.createElement("div",{className:"df-fields"},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u7F16\u53F7"),e.createElement("input",{"aria-label":"\u65B0\u9879\u76EE\u7F16\u53F7",maxLength:100,value:I.code,onChange:t=>H({...I,code:t.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u7ECF\u529E\u4EBA"),e.createElement("input",{"aria-label":"\u65B0\u9879\u76EE\u7ECF\u529E\u4EBA",maxLength:100,value:I.owner,onChange:t=>H({...I,owner:t.target.value})}))),e.createElement("p",{className:"df-muted"},"\u5EFA\u7ACB\u9879\u76EE\u540E\uFF0C\u53EF\u6574\u7406\u5171\u7528\u8D44\u6599\uFF0C\u518D\u6309\u4E03\u4E2A\u9636\u6BB5\u51C6\u5907\u6750\u6599\u3002"),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",disabled:!!A||!!U,onClick:()=>Y(null)},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!A||!I.name?.trim(),type:"submit"},"\u5EFA\u7ACB\u9879\u76EE")))),we==="material"&&e.createElement(Ke,{title:"\u6750\u6599\u4FE1\u606F",busy:!!A,error:ne,onClose:()=>Y(null)},e.createElement("form",{onSubmit:n},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u6750\u6599\u540D\u79F0"),e.createElement("input",{"aria-label":"\u6750\u6599\u540D\u79F0",required:!0,maxLength:150,value:I.name,onChange:t=>H({...I,name:t.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u6750\u6599\u72B6\u6001"),e.createElement("select",{"aria-label":"\u6750\u6599\u72B6\u6001",value:I.status,onChange:t=>H({...I,status:t.target.value})},Object.entries(Vt).map(([t,m])=>e.createElement("option",{key:t,value:t},m)))),e.createElement("label",{className:"df-checkbox"},e.createElement("input",{type:"checkbox",checked:I.required,onChange:t=>H({...I,required:t.target.checked})}),"\u672C\u9879\u76EE\u7684\u5FC5\u5907\u6750\u6599\uFF0C\u9636\u6BB5\u5B8C\u6210\u524D\u9700\u786E\u8BA4\u5DF2\u5B8C\u6210\u6216\u4E0D\u9002\u7528"),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u6750\u6599\u8BF4\u660E"),e.createElement("textarea",{"aria-label":"\u6750\u6599\u8BF4\u660E",rows:3,maxLength:3e3,value:I.note,onChange:t=>H({...I,note:t.target.value})})),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",onClick:()=>Y(null),disabled:!!A||!!U},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!A||!!U,type:"submit"},"\u4FDD\u5B58\u6750\u6599\u4FE1\u606F")))),we==="stage"&&e.createElement(Ke,{title:L.title+"\u529E\u7406\u4FE1\u606F",busy:!!A,error:ne,onClose:()=>Y(null)},e.createElement("form",{onSubmit:t=>{t.preventDefault(),R("\u4FDD\u5B58\u529E\u7406\u4FE1\u606F",()=>fe(`${Ce}/stages/${N}`,I,"PUT"))}},e.createElement("div",{className:"df-fields"},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9636\u6BB5\u72B6\u6001"),e.createElement("select",{"aria-label":"\u9636\u6BB5\u72B6\u6001",value:I.status,onChange:t=>H({...I,status:t.target.value})},Object.entries(wt).map(([t,m])=>e.createElement("option",{key:t,value:t},m)))),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u8BA1\u5212\u65E5\u671F"),e.createElement("input",{"aria-label":"\u9636\u6BB5\u8BA1\u5212\u65E5\u671F",type:"date",value:I.due_date,onChange:t=>H({...I,due_date:t.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u529E\u7406\u7CFB\u7EDF"),e.createElement("input",{"aria-label":"\u529E\u7406\u7CFB\u7EDF",maxLength:150,value:I.system_name,onChange:t=>H({...I,system_name:t.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u7CFB\u7EDF\u5730\u5740"),e.createElement("input",{"aria-label":"\u7CFB\u7EDF\u5730\u5740",type:"url",placeholder:"https://",maxLength:1e3,value:I.system_url,onChange:t=>H({...I,system_url:t.target.value})}))),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u63D0\u4EA4\u7F16\u53F7 / \u56DE\u6267\u4FE1\u606F"),e.createElement("input",{"aria-label":"\u63D0\u4EA4\u7F16\u53F7",maxLength:500,value:I.submission_ref,onChange:t=>H({...I,submission_ref:t.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u529E\u7406\u8BF4\u660E"),e.createElement("textarea",{"aria-label":"\u529E\u7406\u8BF4\u660E",rows:4,maxLength:5e3,value:I.notes,onChange:t=>H({...I,notes:t.target.value})})),e.createElement("p",{className:"df-muted"},"\u8BB0\u5F55\u7EBF\u4E0B\u6216\u4E1A\u52A1\u7CFB\u7EDF\u7684\u5B9E\u9645\u529E\u7406\u7ED3\u679C\uFF0C\u56DE\u6267\u6587\u4EF6\u53EF\u4E0A\u4F20\u5230\u6750\u6599\u6E05\u5355\u3002"),I.status==="completed"&&e.createElement(e.Fragment,null,e.createElement("p",{className:"df-muted"},L.missing_required.length>0?"\u5C1A\u672A\u529E\u7ED3\u7684\u5FC5\u5907\u6750\u6599\uFF1A"+L.missing_required.join("\u3001"):"\u8BF7\u786E\u8BA4\u9636\u6BB5\u6750\u6599\u548C\u524D\u5E8F\u53D8\u66F4\u5DF2\u6838\u5BF9\u3002"),e.createElement("label",{className:"df-checkbox"},e.createElement("input",{"aria-label":"\u786E\u8BA4\u672C\u9636\u6BB5\u5DF2\u529E\u7ED3",type:"checkbox",checked:I.confirmed,onChange:t=>H({...I,confirmed:t.target.checked})}),"\u5DF2\u6838\u5BF9\u672C\u9636\u6BB5\u6750\u6599\u53CA\u524D\u5E8F\u53D8\u66F4\uFF0C\u786E\u8BA4\u672C\u9636\u6BB5\u5DF2\u529E\u7ED3")),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",onClick:()=>Y(null),disabled:!!A||!!U},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!A||I.status==="completed"&&!I.confirmed,type:"submit"},"\u4FDD\u5B58\u529E\u7406\u4FE1\u606F")))),je&&!o.single_form&&e.createElement(Ht,{key:je.id,file:je,projectId:o.id,download:(t,m)=>R("\u4E0B\u8F7D\u539F\u6587\u4EF6",()=>h(t,m)),onClose:()=>se(null)}))}function ca({project:i,Field:c,request:r,onSave:f,onDirtyChange:h}){let[l,g]=W(i.fields),u=_e(null),s=_e(0),[b,o]=W(!1),[$,N]=W(""),[K,S]=W(null),[O,C]=W([]),[w,d]=W("");Te(()=>()=>{s.current++},[]);let[D,P]=W({name:i.name,code:i.code,owner:i.owner}),z=_=>_==="project.name"?D.name:_==="project.code"?D.code:l.find(y=>y.key===_)?.value||"";async function U(_){if(!_||b)return;let y=++s.current;o(!0),N(""),d("");try{let x=new FormData;x.append("revision",i.revision),x.append("workbook",_);let T=await r(`/projects/${i.id}/profile/import`,{method:"POST",body:x});if(y!==s.current)return;let v=T.fields.filter(G=>G.value!==z(G.key));if(!v.length){d("Excel \u4E2D\u7684\u57FA\u7840\u4FE1\u606F\u4E0E\u5F53\u524D\u5185\u5BB9\u4E00\u81F4\u3002");return}S(v),C(v.map(G=>G.key))}catch(x){y===s.current&&N(x.message)}finally{y===s.current&&o(!1)}}function B(){let _=Object.fromEntries(K.filter(y=>O.includes(y.key)).map(y=>[y.key,y.value]));g(y=>y.map(x=>Object.hasOwn(_,x.key)?{...x,value:_[x.key]}:x)),P(y=>({...y,name:_["project.name"]??y.name,code:_["project.code"]??y.code})),S(null),d(`\u5DF2\u5E26\u5165 ${O.length} \u9879\u57FA\u7840\u4FE1\u606F\uFF0C\u8BF7\u6838\u5BF9\u540E\u4FDD\u5B58\u3002`)}return Te(()=>{h(JSON.stringify(l)!==JSON.stringify(i.fields)||D.name!==i.name||D.code!==i.code||D.owner!==i.owner)},[l,D]),e.createElement("form",{className:"df-paper df-project-profile",onSubmit:_=>{_.preventDefault(),f({...D,values:Object.fromEntries(l.map(y=>[y.key,y.value]))})}},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,"\u57FA\u7840\u4FE1\u606F\u586B\u62A5"),e.createElement("p",{className:"df-muted"},"\u5404\u9636\u6BB5\u8868\u5355\u590D\u7528\u8FD9\u91CC\u7684\u8D44\u6599\uFF1B\u9636\u6BB5\u65E5\u671F\u3001\u8BC4\u5BA1\u5206\u6570\u548C\u4ED8\u6B3E\u7ED3\u679C\u5206\u522B\u8BB0\u5F55\u3002")),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",disabled:b,onClick:()=>u.current?.click()},e.createElement(re,{name:"import"}),b?"\u8BFB\u53D6\u4E2D\u2026":"\u5BFC\u5165 Excel"),e.createElement("button",{className:"df-primary",type:"submit",disabled:b},"\u4FDD\u5B58\u57FA\u7840\u4FE1\u606F"))),e.createElement("input",{ref:u,type:"file",accept:".xlsx",hidden:!0,"aria-label":"\u5BFC\u5165\u57FA\u7840\u4FE1\u606F Excel",onChange:_=>{let y=_.target.files?.[0];_.target.value="",U(y)}}),$&&e.createElement("p",{role:"alert",className:"df-alert error"},$),w&&e.createElement("p",{role:"status",className:"df-alert"},w),e.createElement("div",{className:"df-fields"},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u540D\u79F0"),e.createElement("input",{"aria-label":"\u9879\u76EE\u540D\u79F0",required:!0,value:D.name,maxLength:120,onChange:_=>P({...D,name:_.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u7F16\u53F7"),e.createElement("input",{"aria-label":"\u9879\u76EE\u7F16\u53F7",value:D.code,maxLength:100,onChange:_=>P({...D,code:_.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u7ECF\u529E\u4EBA"),e.createElement("input",{"aria-label":"\u7ECF\u529E\u4EBA",value:D.owner,maxLength:100,onChange:_=>P({...D,owner:_.target.value})}))),[...new Set(l.filter(_=>!["project.name","project.code"].includes(_.key)).map(_=>_.group))].map(_=>e.createElement("section",{className:"df-group",key:_},e.createElement("h3",null,_),e.createElement("div",{className:"df-fields"},l.filter(y=>y.group===_&&!["project.name","project.code"].includes(y.key)).map(y=>e.createElement(c,{key:y.key,field:{...y,required:!1},onChange:x=>g(l.map(T=>T.key===y.key?{...T,value:x}:T))}))))),e.createElement("div",{className:"df-actions"},e.createElement("button",{className:"df-primary",type:"submit",disabled:b},"\u4FDD\u5B58\u57FA\u7840\u4FE1\u606F")),K&&e.createElement(Ke,{title:"\u5BFC\u5165\u57FA\u7840\u4FE1\u606F",onClose:()=>S(null)},e.createElement("p",{className:"df-muted"},"\u52FE\u9009\u8981\u5E26\u5165\u7684\u57FA\u7840\u4FE1\u606F\u3002\u7A7A\u767D\u9879\u4FDD\u7559\u539F\u5185\u5BB9\uFF0C\u5E94\u7528\u540E\u8BF7\u6838\u5BF9\u5E76\u4FDD\u5B58\u3002"),e.createElement("div",{className:"df-profile-import-list"},K.map(_=>e.createElement("label",{className:"df-profile-import-item",key:_.key},e.createElement("input",{type:"checkbox","aria-label":"\u5BFC\u5165"+_.label,checked:O.includes(_.key),onChange:y=>C(x=>y.target.checked?[...x,_.key]:x.filter(T=>T!==_.key))}),e.createElement("span",null,e.createElement("strong",null,_.label),e.createElement("span",{className:"df-muted"},"\u5F53\u524D\uFF1A",z(_.key)||"\u672A\u586B\u5199"),e.createElement("span",null,"Excel\uFF1A",_.value))))),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",onClick:()=>S(null)},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",type:"button",disabled:!O.length,onClick:B},"\u5E94\u7528\u5230\u57FA\u7840\u4FE1\u606F"))))}var he=window.QwenPaw.host.React,{useEffect:Gt,useRef:Tt,useState:ma}=he;function ua({field:i}){let[c,r]=ma(!1),f=Tt(null),h=Tt(null),l=Tt(null),g=()=>{window.clearTimeout(l.current),r(!0)};Gt(()=>()=>window.clearTimeout(l.current),[]);let u="df-help-"+i.key;return Gt(()=>{if(!c)return;let s=o=>{f.current?.contains(o.target)||r(!1)},b=o=>{if(o.key!=="Escape")return;o.preventDefault(),o.stopPropagation();let $=f.current?.contains(document.activeElement);r(!1),$&&h.current?.focus()};return document.addEventListener("pointerdown",s),document.addEventListener("keydown",b,!0),()=>{document.removeEventListener("pointerdown",s),document.removeEventListener("keydown",b,!0)}},[c]),he.createElement("span",{className:"df-field-help",ref:f,onMouseEnter:g,onMouseLeave:s=>{s.relatedTarget?.nodeType&&s.currentTarget.contains(s.relatedTarget)||f.current?.contains(document.activeElement)||(l.current=window.setTimeout(()=>r(!1),120))},onBlur:s=>{s.relatedTarget&&!s.currentTarget.contains(s.relatedTarget)&&r(!1)}},he.createElement("button",{type:"button",className:"df-field-help-trigger","aria-label":i.label+"\uFF1A\u586B\u5199\u8BF4\u660E","aria-expanded":c,"aria-controls":c?u:void 0,"aria-describedby":c?u:void 0,ref:h,onFocus:g,onClick:g},he.createElement("svg",{viewBox:"0 0 20 20",fill:"none","aria-hidden":"true"},he.createElement("circle",{cx:"10",cy:"10",r:"7.5"}),he.createElement("path",{d:"M7.8 7.6a2.3 2.3 0 0 1 4.4.9c0 1.6-2.2 1.8-2.2 3.2"}),he.createElement("circle",{cx:"10",cy:"14",r:".65",fill:"currentColor",stroke:"none"}))),c&&he.createElement("span",{className:"df-field-help-content",id:u,role:"tooltip",onMouseEnter:g},i.help))}function kt({field:i,inputId:c}){return he.createElement("div",{className:"df-field-label"},he.createElement(c?"label":"span",{htmlFor:c},i.label,i.required&&he.createElement("span",{className:"df-required",title:"\u5FC5\u586B","aria-hidden":"true"},"*")),i.help&&he.createElement(ua,{field:i}))}var Yt=window.QwenPaw.host.React,{useRef:ga,useLayoutEffect:ba}=Yt;function Jt(i){function c(r){return r.nodeType===3?r.textContent.replace(/\u00a0/g," "):r.nodeType!==1?"":r.dataset.reference?"\u3010"+r.dataset.reference+"\u3011":r.tagName==="BR"?`
`:[...r.childNodes].map((f,h)=>(f.nodeType===1&&/^(DIV|P)$/.test(f.tagName)&&h>0?`
`:"")+c(f)).join("")}return c(i)}function St({field:i,inputId:c,onChange:r}){let f=ga(null);ba(()=>{let l=f.current,g=[...l.querySelectorAll("[data-reference]")],u=i.linked_parts.filter(b=>typeof b=="object");if(Jt(l)===i.linked_template&&g.length===u.length&&g.every((b,o)=>b.textContent==="\u3010"+u[o].value+"\u3011"))return;let s=document.createDocumentFragment();for(let b of i.linked_parts)if(typeof b=="string")s.append(document.createTextNode(b));else{let o=document.createElement("span");o.className="df-reference-token",o.dataset.reference=b.field,o.setAttribute("contenteditable","false"),o.title=b.label+" \xB7 \u81EA\u52A8\u5173\u8054",o.setAttribute("aria-label",b.label+"\uFF1A"+b.value),o.textContent="\u3010"+b.value+"\u3011",s.append(o)}l.replaceChildren(s)},[i.linked_template,i.linked_parts]);function h(){let l=Jt(f.current);r(i.value,l)}return Yt.createElement("div",{id:c,ref:f,className:"df-linked-editor",role:"textbox","aria-label":i.label,"aria-multiline":"true","aria-required":i.required||void 0,contentEditable:!0,suppressContentEditableWarning:!0,onInput:h,onPaste:l=>{l.preventDefault();let g=l.clipboardData.getData("text/plain"),u=window.getSelection();if(!u?.rangeCount||!f.current.contains(u.anchorNode))return;let s=u.getRangeAt(0);s.deleteContents();let b=document.createTextNode(g);s.insertNode(b),s.setStartAfter(b),s.collapse(!0),u.removeAllRanges(),u.addRange(s),h()}})}function Zt(i){let c=Object.fromEntries(i.map(r=>[r.key,r.value]));return i.map(r=>{if(r.linked_template===void 0||!r.linked_variables)return r;let f={...r.linked_variables,...c},h=[],l=0;for(let u of r.linked_template.matchAll(/【([a-z][a-z0-9_.]*(?:\|[0-6])?)】/g)){let[s,b]=u[1].split("|");if(!(s in r.linked_variables))continue;h.push(r.linked_template.slice(l,u.index));let o=r.linked_parts.find(N=>typeof N=="object"&&N.field.split("|")[0]===s),$=f[s]?.trim();if(b&&$&&/^-?\d+(?:\.\d+)?$/.test($)){let[N,K=""]=$.split(".");$=N+"."+K.padEnd(Number(b),"0")}h.push({field:u[1],label:o?.label||s,value:$||`\uFF08${o?.label||"\u5F15\u7528\u8D44\u6599"}\u5F85\u586B\u5199\uFF09`}),l=u.index+u[0].length}h.push(r.linked_template.slice(l));let g=h.map(u=>typeof u=="string"?u:u.value).join("");return{...r,linked_parts:h,linked_rendered:g,value:g}})}var ve=window.QwenPaw,a=ve.host.React,{useState:ce,useEffect:He,useLayoutEffect:ha,useRef:ut}=a,Dt="/document-forms",xa="application/vnd.openxmlformats-officedocument.wordprocessingml.document";async function xe(i,c){let r=await ve.host.fetch(Dt+i,c);if(!r.ok){let f=await r.json().catch(()=>({}));throw new Error(typeof f.detail=="string"?f.detail:Array.isArray(f.detail)?f.detail.map(h=>`${h.loc?.slice(1).join(".")||"\u8D44\u6599"}\uFF1A${h.msg}`).join("\uFF1B"):`\u64CD\u4F5C\u672A\u5B8C\u6210\uFF08${r.status}\uFF09\uFF0C\u8BF7\u68C0\u67E5\u586B\u5199\u5185\u5BB9`)}return r.json()}async function it(i,c){let r=await ve.host.fetch(Dt+i);if(!r.ok)throw new Error("\u6587\u4EF6\u4E0B\u8F7D\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5");let f=URL.createObjectURL(await r.blob()),h=document.createElement("a");h.href=f,h.download=c,document.body.appendChild(h);try{h.click()}finally{h.remove(),setTimeout(()=>URL.revokeObjectURL(f),1e3)}}var Xe=i=>({method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(i)}),nt=i=>new Date(i).toLocaleString("zh-CN",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}),Rt=i=>i.kind==="textarea"||i.value.length>100||i.value.includes(`
`)||i.label.includes("\u6574\u6BB5"),va=i=>/^(research\.contents|deliverables\.|metrics\.|milestones\.)/.test(i.key)||/主要研究内容|预期成果|考核指标|进度安排/.test(i.label);function Nt(i){return i.map((c,r)=>{let f={...c};for(let h of["start","end"]){let l="follow_"+h;f[l]=r>0&&(typeof f[l]=="boolean"?f[l]:!f[h]),f[l]&&(f[h]=i[0][h])}return f})}function wa({field:i,onChange:c}){let r=["","",""],f=0;for(let h of i.value.split(/\r?\n/)){let l=h.match(/^\s*([1-3])[.、．)）]\s?(.*)$/);l?r[Number(l[1])-1]=l[2]:f<3&&(r[f++]=h)}return a.createElement("div",{className:"df-plan-partners",id:"df-plan.partners",role:"group","aria-label":i.label},a.createElement(kt,{field:i}),r.map((h,l)=>a.createElement("label",{className:"df-field",key:l},a.createElement("span",null,"\u5355\u4F4D",l+1),a.createElement("input",{"aria-label":`\u5355\u4F4D${l+1}`,type:"text",value:h,onChange:g=>{let u=r.map((s,b)=>b===l?g.target.value:s);c(u.some(s=>s.trim())?u.map((s,b)=>`${b+1}. ${s}`).join(`
`):"")}}))))}function ea({field:i,displayValue:c,onChange:r}){let f="df-input-"+i.key,h=i.key!=="plan.notes"&&Rt(i),l=i.linked_template!==void 0,g=va(i)||l,u=["date","datetime-local"].includes(i.kind)?i.value:c??i.value,s=ut(null);return ha(()=>{if(!s.current)return;let b=s.current.scrollTop;s.current.style.height="auto",s.current.style.height=Math.max(g?104:192,s.current.scrollHeight)+"px",s.current.scrollTop=b},[u,h,g]),i.key==="plan.partners"?a.createElement(wa,{field:i,onChange:r}):a.createElement("div",{className:"df-field"+(h?" df-field-paragraph":"")+(g?" df-field-compact":""),id:"df-"+i.key},a.createElement(kt,{field:i,inputId:f}),l?a.createElement(St,{field:i,inputId:f,onChange:r}):i.options?a.createElement("select",{id:f,"aria-label":i.label,"aria-required":i.required||void 0,value:u,onChange:b=>r(b.target.value)},a.createElement("option",{value:""},"\u8BF7\u9009\u62E9"),u&&!i.options.includes(u)&&a.createElement("option",{value:u,disabled:!0},u,"\uFF08\u8BF7\u91CD\u65B0\u9009\u62E9\uFF09"),i.options.map(b=>a.createElement("option",{key:b,value:b},b))):h?a.createElement("textarea",{id:f,ref:s,"aria-label":i.label,"aria-required":i.required||void 0,rows:g?3:8,value:u,onChange:b=>r(b.target.value)}):a.createElement("input",{id:f,"aria-label":i.label,"aria-required":i.required||void 0,type:i.key==="plan.notes"?"text":i.kind,readOnly:!!i.read_only,step:i.kind==="number"?"any":void 0,value:u,onChange:b=>r(b.target.value)}))}function ya({fields:i,onChange:c,compact:r=!1}){let f=i.filter(l=>/^selection\.member\d+_name$/.test(l.key));if(!f.length)return null;let h={unit:["\u5730\u4E0B\u7A7A\u95F4\u5229\u7528\u7814\u7A76\u6240",...i.filter(l=>["contact.department","project.executing_unit"].includes(l.key)).map(l=>l.value)],title:["\u526F\u6240\u957F/\u9AD8\u5DE5","\u4F01\u4E1A\u9AD8\u7EA7\u4E13\u5BB6/\u9AD8\u5DE5","\u90E8\u95E8\u8D1F\u8D23\u4EBA/\u9AD8\u5DE5","\u4E00\u7EA7\u5DE5\u7A0B\u5E08/\u9AD8\u5DE5","\u9AD8\u7EA7\u5DE5\u7A0B\u5E08","\u5DE5\u7A0B\u5E08","\u6559\u6388","\u526F\u6559\u6388"],category:["\u4E3B\u4EFB","\u526F\u4E3B\u4EFB","\u79D1\u59D4\u4F1A\u6210\u5458","\u4E13\u5BB6","\u7EC4\u957F","\u6210\u5458"]};return a.createElement("section",{className:"df-group df-selection-members","aria-label":"\u8BBA\u8BC1\u6210\u5458"},!r&&a.createElement("h3",null,"\u8BBA\u8BC1\u6210\u5458"),!r&&a.createElement("p",{className:"df-muted"},"\u6BCF\u4EBA\u4E00\u884C\u3002\u5355\u4F4D\u3001\u804C\u52A1/\u804C\u79F0\u548C\u7C7B\u522B\u53EF\u9009\u62E9\uFF0C\u4E5F\u53EF\u76F4\u63A5\u8F93\u5165\u3002"),a.createElement("div",{className:"df-member-scroll"},a.createElement("table",{className:"df-member-table"},a.createElement("thead",null,a.createElement("tr",null,a.createElement("th",{scope:"col"},"\u5E8F\u53F7"),a.createElement("th",{scope:"col"},"\u59D3\u540D"),a.createElement("th",{scope:"col"},"\u5355\u4F4D"),a.createElement("th",{scope:"col"},"\u804C\u52A1/\u804C\u79F0"),a.createElement("th",{scope:"col"},"\u7C7B\u522B"))),a.createElement("tbody",null,f.map((l,g)=>{let u=l.key.replace(/name$/,"");return a.createElement("tr",{key:l.key},a.createElement("th",{scope:"row"},String(g+1).padStart(2,"0")),["name","unit","title","category"].map(s=>{let b=i.find(N=>N.key===u+s);if(!b)return a.createElement("td",{key:s});let o=s==="name"?[]:[...new Set([...h[s],...i.filter(N=>new RegExp(`^selection\\.member\\d+_${s}$`).test(N.key)).map(N=>N.value)].filter(Boolean))],$="df-options-"+b.key;return a.createElement("td",{key:s,id:"df-"+b.key},a.createElement("input",{"aria-label":b.label,value:b.value,list:o.length?$:void 0,autoComplete:"off",onChange:N=>c(b.key,N.target.value)}),o.length>0&&a.createElement("datalist",{id:$},o.map(N=>a.createElement("option",{value:N,key:N}))))}))})))))}function ka({project:i,workflowStage:c,initialCaseId:r,initialView:f,editRequest:h=0,initialDraft:l,onBack:g,onChanged:u,onDirtyChange:s,onBusyChange:b,onViewChange:o,docked:$=!1,onPreview:N,onStageStatus:K,onEditBasics:S,toolbarTarget:O,onShowForm:C,onDownloadStageMaterials:w}){let[d,D]=ce(null),[P,z]=ce(""),[U,B]=ce(null),[_,y]=ce([]),[x,T]=ce("import"),[v,G]=ce(!1),[A,ee]=ce(null),[ne,J]=ce(!1),[q,ze]=ce(""),[we,Y]=ce(""),[I,H]=ce(""),[X,Se]=ce(null),[me,rt]=ce(null),je=ut(null),se=ut(null),le=ut(0),ue=ut(!0),gt=ve.host.useTheme?.()||"light",De=()=>u?.()||Promise.resolve(),te=$&&O&&ve.host.ReactDOM?.createPortal;He(()=>(ue.current=!0,(l?Promise.resolve(l):xe("/cases/"+r)).then(n=>{ue.current&&(ye(n),T(f==="files"&&n.generations.length?"files":"edit"),f==="files"&&n.generations.length&&Se({file:n.generations[0].files[0],generation:n.generations[0]}))}).catch(n=>ue.current&&Y(n.message)),(ve.workspace?.loadPreview?ve.workspace.loadPreview():Promise.resolve(Ee)).then(n=>{ue.current&&rt(()=>n)}).catch(n=>{ue.current&&rt(()=>Ee)}),()=>{ue.current=!1,le.current++}),[]),He(()=>{h&&(T("edit"),J(!1))},[h]),He(()=>{s?.(v)},[v]),He(()=>{b?.(q)},[q]),He(()=>{o?.()},[x]),He(()=>{let n=p=>{v&&(p.preventDefault(),p.returnValue="")};return window.addEventListener("beforeunload",n),()=>window.removeEventListener("beforeunload",n)},[v]);async function ae(n,p){if(q)return;let t=++le.current;ze(n),Y(""),H("");try{await p()}catch(m){ue.current&&t===le.current&&(Y(m.message),C?.())}finally{ue.current&&t===le.current&&ze("")}}function ye(n){ue.current&&(D({...n,recipients:Nt(n.recipients),presentation_sources:Object.fromEntries(n.fields.map(p=>[p.key,p.value]))}),G(!1),T(p=>p==="review"?"edit":p),ee(null),J(!1))}function Le(n){D({...n,fields:Zt(n.fields)}),G(!0),ee(null),J(!1),H("")}function ot(n,p,t,m=!1){let j=d.recipients.map((V,Pe)=>Pe===n?{...V,[p]:t,...p!=="name"?{["follow_"+p]:m}:{}}:V);Le({...d,recipients:Nt(j)})}async function ge(){if(!v)return d;let n={revision:d.revision,name:d.name.trim()||"\u672A\u547D\u540D\u586B\u62A5",values:Object.fromEntries(d.fields.map(t=>[t.key,t.value])),recipients:d.recipients,opinion_templates:Object.fromEntries(d.fields.filter(t=>t.linked_template!==void 0).map(t=>[t.key,t.linked_template]))},p=await xe("/cases/"+d.id,{...Xe(n),method:"PUT"});return ye(p),p}function dt(){return!v||window.confirm("\u5F53\u524D\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\u3002\u79BB\u5F00\u6B64\u8BB0\u5F55\uFF1F")}let oe=d?.stage_id==="plan"&&d?.plan_schema===1,Me=d?.stage_id==="selection"&&d?.selection_schema===1,be=d?.stage_id==="contract",Z=(c?.id||d?.stage_id)==="negotiation",Ie=n=>Wt(n,Z?"negotiation":void 0),Ge=Z?We[2]:"recipients",Oe=oe||Me||be,Re=Oe?"\u6587\u4E66\u6A21\u677F":"Word \u6A21\u677F",Je=Oe?d.fields.filter(n=>n.scope!=="shared"):d?.fields||[],Ae=[...new Set([...Z?We:[],...Je.map(Ie)])];if(Me){let n=["\u8BBA\u8BC1\u5B89\u6392","\u5019\u9009\u5355\u4F4D","\u8BBA\u8BC1\u6210\u5458","\u8BBA\u8BC1\u610F\u89C1","\u975E\u62DB\u6807\u65B9\u6848"];Ae.sort((p,t)=>{let m=j=>{let V=n.indexOf(j);return V<0?n.length:V};return m(p)-m(t)})}let st=[...Ae.map(n=>({id:n,label:n})),...!Oe&&!Z?[{id:"recipients",label:"\u53D7\u9080\u5355\u4F4D"}]:[],{id:"generate",label:$?"\u6587\u4EF6\u751F\u6210":"\u6A21\u677F\u4E0E\u751F\u6210",align:"end"}],L=st.some(n=>n.id===P)?P:st[0].id,ke=d?.templates||[],Ye=ke.reduce((n,p)=>n+(p.per_recipient?d.recipients.length:1),0),et=(d?.generations||[]).filter(n=>!$||(n.stage_id||d.original_stage_id||c.id)===c.id),de=et[0];He(()=>{$&&x==="files"&&de&&!et.some(n=>n.id===X?.generation.id)&&Se({file:de.files[0],generation:de})},[x,de?.id]);let ie=A?.checks.filter(n=>n.status!=="ok")||[];async function lt(n){!n||!dt()||await ae("\u8BFB\u53D6 Excel",async()=>{let p=new FormData;p.append("workbook",n),p.append("revision",i.revision),p.append("stage_id",c.id);let t=await xe(`/projects/${i.id}/${i.single_form?"form":"cases"}/import`,{method:"POST",body:p});ye(t),Se(null),z(""),T("edit"),C?.(),await De(),H(t.templates.length?"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\uFF0C\u5E76\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002":t.template_notice||"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\u3002\u8BF7\u6DFB\u52A0\u5BF9\u5E94\u7684 Word \u6A21\u677F\u3002")})}async function $e(n){n=Array.from(n),n.length&&await ae("\u8BFB\u53D6 Word \u6A21\u677F",async()=>{let p=await ge(),t=new FormData;t.append("revision",String(p.revision)),Array.from(n).forEach(m=>t.append("files",m)),ye(await xe("/cases/"+p.id+"/templates",{method:"POST",body:t})),await De(),H("Word \u6A21\u677F\u5DF2\u6DFB\u52A0\uFF0C\u751F\u6210\u65F6\u4F1A\u4FDD\u7559\u539F\u6709\u6392\u7248\u3002")})}async function Ne(){await ae("\u6838\u5BF9\u8D44\u6599",async()=>{let n=await ge(),p=await xe("/cases/"+n.id+"/review",Xe({revision:n.revision}));ue.current&&(ee(p),J(!1),T("review"),await De())})}async function R(){await ae("\u751F\u6210\u6587\u4E66",async()=>{let n=await xe("/cases/"+d.id+"/generate",Xe({revision:d.revision,review_token:A.review_token,confirmed:ne}));ye(n),T("files"),Se({file:n.generations[0].files[0],generation:n.generations[0]}),await De()})}function Ct(n){let p=d.fields.find(t=>t.key===n);if(p?.scope==="shared"&&Oe&&S){S();return}z(p?Ie(p):n.startsWith("recipient-")?Ge:"generate"),T("edit"),requestAnimationFrame(()=>{let t=document.getElementById("df-"+n);t?.scrollIntoView?.({behavior:"smooth",block:"center"}),t?.querySelector("input,textarea,select")?.focus()})}let Be=(n,p)=>`/cases/${d.id}/outputs/${n.id}/${encodeURIComponent(p)}`;function pe(n){return ae("\u6B63\u5728\u4E0B\u8F7D\u538B\u7F29\u5305",async()=>{await it(Be(n,"\u5168\u90E8\u6587\u4E66.zip"),n.bundle_name||d.name+"_\u6587\u4E66.zip"),H(`\u5DF2\u5F00\u59CB\u4E0B\u8F7D\u8BE5\u6279\u6B21\u7684 ${n.files.length} \u4EFD\u6587\u4E66\u538B\u7F29\u5305\u3002`)})}let fe=X?{id:X.generation.id+X.file.name,title:X.file.name,source:"generated",mimeType:X.file.name.endsWith(".xlsx")?"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":xa,extension:X.file.name.endsWith(".xlsx")?"xlsx":"docx",binaryUrl:X.file.preview_url,printUrl:Dt+`/cases/${d.id}/print/${X.generation.id}/${encodeURIComponent(X.file.name)}`,agentId:ve.host.getSelectedAgentId?.(),createdAt:Date.parse(X.generation.created_at)}:null;He(()=>{$&&x==="files"&&fe&&N?.({artifact:fe,reference:{case_id:d.id,generation_id:X.generation.id,name:X.file.name}})},[x,X?.generation.id,X?.file.name]);async function bt(){await ae("\u5BFC\u51FA Excel",async()=>{let n=await ge();await it("/cases/"+n.id+"/excel",(n.fields.find(p=>p.key==="project.name")?.value||n.name).replace(/[<>:"/\\|?*\x00-\x1f]/g,"_").slice(0,80)+"_\u586B\u5199\u6570\u636E.xlsx")})}let ht=a.createElement("section",{className:"df-paper df-template-panel","aria-label":Re},a.createElement("div",{className:"df-section-head"},!te&&a.createElement("h2",null,Re),a.createElement("div",{className:"df-template-actions"},ke.length>0?a.createElement("button",{onClick:()=>ae("\u4FDD\u5B58\u9ED8\u8BA4\u6A21\u677F",async()=>{let n=await ge();await xe(`/cases/${n.id}/defaults`,Xe({revision:n.revision})),H(c.id==="negotiation"?"\u5DF2\u8BBE\u4E3A\u672C\u673A\u9ED8\u8BA4\u6A21\u677F\uFF0C\u4EE5\u540E\u65B0\u5EFA\u586B\u62A5\u4F1A\u81EA\u52A8\u8F7D\u5165\u3002":"\u5DF2\u8BBE\u4E3A\u672C\u9636\u6BB5\u9ED8\u8BA4\u6A21\u677F\uFF0C\u4EE5\u540E\u65B0\u5EFA\u8BE5\u9636\u6BB5\u8868\u5355\u4F1A\u81EA\u52A8\u8F7D\u5165\u3002")})},c.id==="negotiation"?"\u8BBE\u4E3A\u9ED8\u8BA4\u6A21\u677F":"\u8BBE\u4E3A\u672C\u9636\u6BB5\u9ED8\u8BA4\u6A21\u677F"):a.createElement("button",{onClick:()=>ae("\u8F7D\u5165\u9ED8\u8BA4\u6A21\u677F",async()=>{let n=await ge();ye(await xe(`/cases/${n.id}/defaults/apply`,Xe({revision:n.revision}))),H("\u5DF2\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002")})},"\u4F7F\u7528\u9ED8\u8BA4\u6A21\u677F"),!te&&a.createElement("button",{onClick:()=>se.current.click()},"\uFF0B \u6DFB\u52A0"))),!te&&!ke.length&&a.createElement("p",{className:"df-muted"},"\u6DFB\u52A0\u4E0E\u4F60\u7684\u53D8\u91CF\u8868\u5BF9\u5E94\u7684 .docx \u6216 .xlsx \u6A21\u677F\u3002"),ke.map(n=>a.createElement("div",{className:"df-template",key:n.id},a.createElement("b",null,n.name),n.from_builtin&&a.createElement("small",null,"\u5E94\u7528\u81EA\u5E26\u6A21\u677F"),a.createElement("span",null,n.per_recipient?"\u6309\u53D7\u9080\u5355\u4F4D\u5206\u522B\u751F\u6210":"\u5171\u7528\u6587\u4EF6 \xB7 \u751F\u6210\u4E00\u4EFD"),n.print_copies>1&&a.createElement("small",null,"\u5EFA\u8BAE\u6253\u5370 ",n.print_copies," \u4EFD \xB7 ",n.print_note),a.createElement("button",{"aria-label":"\u79FB\u9664\u6A21\u677F"+n.name,onClick:()=>ae("\u79FB\u9664\u6A21\u677F",async()=>{let p=await ge();ye(await xe(`/cases/${p.id}/templates/${n.id}?revision=${p.revision}`,{method:"DELETE"}))})},"\u79FB\u9664")))),Ce=d&&!Oe&&a.createElement("section",{className:Z?"df-recipient-section":"df-paper",role:Z?void 0:"tabpanel",id:"df-form-panel-recipients","aria-labelledby":`df-form-tab-${Ge}`,hidden:L!==Ge},a.createElement("div",{className:"df-section-head"},a.createElement("div",null,a.createElement("h2",null,"\u53D7\u9080\u5355\u4F4D ",a.createElement("span",{className:"df-count"},d.recipients.length)),a.createElement("p",null,"\u6309\u5355\u4F4D\u6587\u4E66\u5206\u522B\u751F\u6210\uFF0C\u5171\u7528\u9879\u76EE\u4E0E\u843D\u6B3E\u4FE1\u606F\u3002")),a.createElement("button",{onClick:()=>Le({...d,recipients:Nt([...d.recipients,{name:"",start:"",end:""}])}),disabled:d.recipients.length>=200},"\uFF0B \u6DFB\u52A0\u5355\u4F4D")),d.recipients.map((n,p)=>a.createElement("div",{className:"df-recipient",key:p,id:"df-recipient-"+p},a.createElement("div",{className:"df-recipient-title"},a.createElement("b",null,String(p+1).padStart(2,"0")),a.createElement("button",{"aria-label":`\u79FB\u9664\u7B2C${p+1}\u5BB6\u5355\u4F4D`,onClick:()=>Le({...d,recipients:Nt(d.recipients.filter((t,m)=>m!==p))})},"\u79FB\u9664")),a.createElement("div",{className:"df-fields"},[["name","\u5355\u4F4D\u540D\u79F0"],["start","\u9886\u53D6\u5F00\u59CB\u65F6\u95F4"],["end","\u9886\u53D6\u7ED3\u675F\u65F6\u95F4"]].map(([t,m])=>a.createElement("label",{className:"df-field "+(t==="name"?"df-span":""),key:t},a.createElement("span",null,m),a.createElement("input",{"aria-label":`\u7B2C${p+1}\u5BB6${m}`,type:t==="name"?"text":"datetime-local",value:t==="name"?n[t]:n[t].replace(" ","T"),onChange:j=>ot(p,t,j.target.value)}),p>0&&t!=="name"&&a.createElement("small",{className:"df-follow-state"},n["follow_"+t]?"\u8DDF\u968F\u7B2C1\u5BB6":"\u5DF2\u5355\u72EC\u8BBE\u7F6E",!n["follow_"+t]&&a.createElement("button",{type:"button","aria-label":`\u7B2C${p+1}\u5BB6${m}\u6062\u590D\u8DDF\u968F`,onClick:j=>{j.preventDefault(),ot(p,t,d.recipients[0][t],!0)}},"\u6062\u590D\u8DDF\u968F")))))))),_t=a.createElement(a.Fragment,null,a.createElement("div",{className:"df-toolbar-file-actions"},a.createElement($t,{label:"\u6A21\u677F",icon:"template",disabled:!!q||!d},a.createElement("button",{className:"df-toolbar-template-import",disabled:!!q,onClick:()=>se.current.click()},a.createElement(re,{name:"import"}),"\u5BFC\u5165\u6A21\u677F"),a.createElement("button",{"aria-label":"\u4E0B\u8F7D\u914D\u5957\u6A21\u677F",disabled:!!q,onClick:()=>ae("\u4E0B\u8F7D\u914D\u5957\u6A21\u677F",()=>it("/starter","\u6587\u4E66\u586B\u62A5_\u914D\u5957\u6A21\u677F.zip"))},a.createElement(re,{name:"download"}),"\u4E0B\u8F7D\u6A21\u677F"),ht),x!=="edit"&&a.createElement("button",{disabled:!!q,onClick:()=>{T("edit"),J(!1),C?.()}},a.createElement(re,{name:"back"}),"\u8FD4\u56DE\u586B\u5199"),de&&x!=="files"&&a.createElement("button",{title:"\u67E5\u770B\u751F\u6210\u6587\u4EF6","aria-label":"\u67E5\u770B\u751F\u6210\u6587\u4EF6",disabled:!!q,onClick:()=>{T("files"),C?.()}},a.createElement(re,{name:"file"}),"\u751F\u6210\u6587\u4EF6"),a.createElement("button",{"aria-label":"\u4E0B\u8F7D\u672C\u9636\u6BB5\u6750\u6599",title:"\u4E0B\u8F7D\u672C\u9636\u6BB5\u6750\u6599",disabled:!!q,onClick:w},a.createElement(re,{name:"download"}),"\u9636\u6BB5\u6750\u6599"),a.createElement($t,{label:"\u66F4\u591A\u64CD\u4F5C",icon:"more",iconOnly:!0,disabled:!!q||!d},a.createElement("label",{className:"df-field"},a.createElement("span",null,"\u8868\u5355\u540D\u79F0"),a.createElement("input",{"aria-label":"\u8868\u5355\u540D\u79F0",maxLength:120,value:d?.name||"",onChange:n=>Le({...d,name:n.target.value})})),a.createElement("button",{disabled:!!q,onClick:()=>{B("adopt"),y([]),C?.()}},"\u6838\u5BF9\u9879\u76EE\u8D44\u6599\u5DEE\u5F02"),a.createElement("button",{disabled:!!q,onClick:()=>{B("publish"),y([]),C?.()}},"\u5B58\u5165\u9879\u76EE\u5E95\u7A3F"))),a.createElement("div",{className:"df-toolbar-save"},d&&a.createElement("span",{className:"df-save-state"+(v?" is-dirty":""),title:v?"\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539":"\u8349\u7A3F\u5DF2\u4FDD\u5B58 \xB7 "+nt(d.updated_at),role:"status"},v?"\u672A\u4FDD\u5B58":"\u5DF2\u4FDD\u5B58"),a.createElement("button",{className:"df-toolbar-icon-button",title:"\u5BFC\u5165 Excel","aria-label":"\u5BFC\u5165 Excel",disabled:!!q||!d,onClick:()=>je.current.click()},a.createElement(re,{name:"import"})),a.createElement("button",{className:"df-toolbar-icon-button",title:"\u5BFC\u51FA\u5F53\u524D Excel","aria-label":"\u5BFC\u51FA\u5F53\u524D Excel",disabled:!!q||!d,onClick:bt},a.createElement(re,{name:"export"})),a.createElement("button",{className:"df-primary df-toolbar-icon-button","aria-label":"\u4FDD\u5B58\u8349\u7A3F",title:"\u4FDD\u5B58\u8349\u7A3F",disabled:!!q||!d||!v,onClick:()=>ae("\u4FDD\u5B58\u8349\u7A3F",async()=>{await ge(),await De(),H("\u8349\u7A3F\u5DF2\u4FDD\u5B58")})},a.createElement(re,{name:"save"}))));return a.createElement("div",{className:"df-app df-embedded-editor","data-theme":gt},a.createElement("input",{ref:je,type:"file",accept:".xlsx",hidden:!0,"aria-label":"\u5BFC\u5165 Excel \u53D8\u91CF\u8868",onChange:n=>{lt(n.target.files[0]),n.target.value=""}}),a.createElement("input",{ref:se,type:"file",accept:".docx,.xlsx",multiple:!0,hidden:!0,"aria-label":"\u5BFC\u5165 Word \u6A21\u677F",onChange:n=>{$e(n.target.files),n.target.value=""}}),a.createElement("section",{className:"df-main"},!$&&a.createElement("div",{className:"df-editor-context"},a.createElement("button",{disabled:!!q,onClick:()=>{dt()&&g()}},"\u2190 \u8FD4\u56DE",c.title),a.createElement("span",null,i.name," / ",c.title),$&&a.createElement("button",{disabled:!!q||v,title:v?"\u8BF7\u5148\u4FDD\u5B58\u8868\u5355":"\u66F4\u65B0\u5F53\u524D\u8282\u70B9\u7684\u529E\u7406\u4FE1\u606F",onClick:K},"\u529E\u7406\u4FE1\u606F\u4E0E\u72B6\u6001"),d&&a.createElement("div",{className:"df-actions"},a.createElement("button",{disabled:!!q,onClick:()=>{B("adopt"),y([])}},"\u6838\u5BF9\u9879\u76EE\u8D44\u6599\u5DEE\u5F02"),a.createElement("button",{disabled:!!q,onClick:()=>{B("publish"),y([])}},"\u5B58\u5165\u9879\u76EE\u5E95\u7A3F"))),!te&&a.createElement("header",{className:"df-header"},a.createElement("div",null,!$&&a.createElement("span",{className:"df-eyebrow"},c.title," / \u586B\u5199\u4E0E\u751F\u6210"),a.createElement("h1",null,d?$?"\u586B\u5199\u5185\u5BB9":d.name:"\u586B\u5199\u9879\u76EE\u8D44\u6599"),a.createElement("p",null,d?v?"\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539":`\u8349\u7A3F\u5DF2\u4FDD\u5B58 \xB7 ${nt(d.updated_at)}`:"\u5BFC\u5165\u53D8\u91CF\u8868\u4E0E Word \u6A21\u677F\uFF0C\u586B\u5199\u3001\u6838\u5BF9\uFF0C\u518D\u751F\u6210\u6587\u4E66\u3002")),d&&a.createElement("button",{disabled:!!q||!v,onClick:()=>ae("\u4FDD\u5B58\u8349\u7A3F",async()=>{await ge(),await De(),H("\u8349\u7A3F\u5DF2\u4FDD\u5B58")})},"\u4FDD\u5B58\u8349\u7A3F")),te?ve.host.ReactDOM.createPortal(_t,O):$?a.createElement("div",{className:"df-node-tools","aria-label":"\u8868\u5355\u64CD\u4F5C"},x!=="edit"&&a.createElement("button",{disabled:!!q,onClick:()=>{T("edit"),J(!1)}},"\u8FD4\u56DE\u586B\u5199"),a.createElement("button",{disabled:!!q,onClick:()=>je.current.click()},"\u5BFC\u5165 Excel"),de&&x!=="files"&&a.createElement("button",{disabled:!!q,onClick:()=>T("files")},"\u67E5\u770B\u751F\u6210\u6587\u4EF6"),a.createElement("details",null,a.createElement("summary",null,"\u66F4\u591A\u64CD\u4F5C"),a.createElement("div",{className:"df-actions"},a.createElement("button",{disabled:!!q,onClick:()=>{B("adopt"),y([])}},"\u6838\u5BF9\u9879\u76EE\u8D44\u6599\u5DEE\u5F02"),a.createElement("button",{disabled:!!q,onClick:()=>{B("publish"),y([])}},"\u5B58\u5165\u9879\u76EE\u5E95\u7A3F")))):a.createElement("div",{className:"df-steps","aria-label":"\u586B\u5199\u6D41\u7A0B"},[["import","01","\u5BFC\u5165\u6A21\u677F"],["edit","02","\u586B\u5199\u8D44\u6599"],["review","03","\u6838\u5BF9\u751F\u6210"],["files","04","\u6587\u4EF6\u9884\u89C8"]].map(([n,p,t])=>a.createElement("button",{key:n,"aria-current":x===n?"step":void 0,className:x===n?"active":"",disabled:!!q||!d&&n!=="import"||n==="files"&&!de,onClick:()=>n==="review"?Ne():T(n)},a.createElement("span",null,p),t))),we&&a.createElement("div",{className:"df-alert error",role:"alert"},we,a.createElement("button",{"aria-label":"\u5173\u95ED\u9519\u8BEF\u63D0\u793A",onClick:()=>Y("")},"\xD7")),I&&a.createElement("div",{className:"df-alert",role:"status"},I),q&&a.createElement("div",{className:"df-progress",role:"status"},q,"\u2026"),a.createElement("fieldset",{className:"df-content",disabled:!!q},x==="import"&&a.createElement("div",{className:"df-import"},a.createElement("section",{className:"df-paper df-drop"},a.createElement("div",{className:"df-file-mark"},"XLSX"),a.createElement("h2",null,"\u4ECE Excel \u53D8\u91CF\u8868\u5F00\u59CB"),a.createElement("p",null,"\u201C\u53D8\u91CF\u914D\u7F6E\u201D\u5DE5\u4F5C\u8868\u4FDD\u7559\u4E09\u5217\uFF1A",a.createElement("br",null),a.createElement("b",null,"\u53D8\u91CF\u540D\u79F0\u3000\u4E2D\u6587\u540D\u79F0\u3000\u503C")),a.createElement("button",{className:"df-primary",onClick:()=>je.current.click()},"\u9009\u62E9 Excel \u53D8\u91CF\u8868"),a.createElement("small",null,"\u652F\u6301 .xlsx \xB7 \u5355\u4E2A\u6587\u4EF6\u4E0D\u8D85\u8FC7 15 MB")),a.createElement("section",{className:"df-paper df-import-note"},a.createElement("span",{className:"df-eyebrow"},"\u5982\u4F55\u51C6\u5907"),a.createElement("h2",null,"\u4E00\u4EFD\u6570\u636E\uFF0C\u591A\u4EFD\u6587\u4E66"),a.createElement("ol",null,a.createElement("li",null,a.createElement("b",null,"\u6574\u7406\u53D8\u91CF"),a.createElement("p",null,"\u4F8B\u5982 project.name / \u9879\u76EE\u540D\u79F0 / \u5B9E\u9645\u540D\u79F0\u3002\u652F\u6301\u5206\u7EC4\u3001\u7C7B\u578B\u548C\u5FC5\u586B\u5217\u3002")),a.createElement("li",null,a.createElement("b",null,"\u81EA\u52A8\u8F7D\u5165\u6A21\u677F"),a.createElement("p",null,"\u5E94\u7528\u81EA\u5E26 5 \u4EFD\u6807\u51C6 Word \u6A21\u677F\uFF0C\u4F7F\u7528\u914D\u5957 Excel \u5373\u53EF\u81EA\u52A8\u8F7D\u5165\uFF1B \u4E5F\u53EF\u6DFB\u52A0\u81EA\u5DF1\u7684\u6A21\u677F\u3002")),a.createElement("li",null,a.createElement("b",null,"\u5206\u522B\u751F\u6210\u9080\u8BF7\u51FD"),a.createElement("p",null,"\u5728\u201C\u53D7\u9080\u5355\u4F4D\u201D\u8868\u8BB0\u5F55\u5355\u4F4D\u540D\u79F0\u3001\u9886\u53D6\u5F00\u59CB\u65F6\u95F4\u548C\u9886\u53D6\u7ED3\u675F\u65F6\u95F4\u3002"))),a.createElement("p",{className:"df-muted"},"\u201C\u65E5\u671F\u6821\u6838\u201D\u8868\u4E2D\u7684\u65E7\u7ED3\u679C\u4E0D\u4F1A\u4F5C\u4E3A\u5224\u65AD\u4F9D\u636E\uFF1B\u5E94\u7528\u4F1A\u6839\u636E\u5F53\u524D\u586B\u5199\u5185\u5BB9\u91CD\u65B0\u6838\u5BF9\u3002\u201C\u6821\u6838\u89C4\u5219\u201D\u8868\u53EF\u8865\u5145\u81EA\u5B9A\u4E49\u5148\u540E\u5173\u7CFB\u3002"))),d&&x==="edit"&&a.createElement("div",{className:"df-edit-layout"},!te&&a.createElement("section",{className:"df-paper df-form-heading"},a.createElement("div",{className:"df-section-head"},!$&&a.createElement("h2",null,"\u586B\u5199\u4FE1\u606F"),a.createElement("button",{onClick:()=>ae("\u5BFC\u51FA Excel",async()=>{let n=await ge();await it(`/cases/${n.id}/excel`,(n.fields.find(p=>p.key==="project.name")?.value||n.name).replace(/[<>:"/\\|?*\x00-\x1f]/g,"_").slice(0,80)+"_\u586B\u5199\u6570\u636E.xlsx")})},"\u5BFC\u51FA\u5F53\u524D Excel")),a.createElement("label",{className:"df-field df-title-field"},a.createElement("span",null,"\u8868\u5355\u540D\u79F0"),a.createElement("input",{"aria-label":"\u8868\u5355\u540D\u79F0",maxLength:120,value:d.name,onChange:n=>Le({...d,name:n.target.value})}))),a.createElement(ct,{id:"df-form",label:"\u586B\u5199\u5185\u5BB9\u5206\u7EC4",items:st,value:L,onChange:z}),Ae.map(n=>a.createElement("section",{className:"df-paper df-form-panel",key:n,role:"tabpanel",id:`df-form-panel-${n}`,"aria-labelledby":`df-form-tab-${n}`,hidden:L!==n},Z&&n===Ge&&Ce,[...new Set(Je.filter(p=>Ie(p)===n&&!/^selection\.member\d+_/.test(p.key)).map(p=>p.group))].map(p=>a.createElement("section",{className:"df-group",key:p},!Z&&(!te||p!==n)&&a.createElement("h3",null,p),!te&&p==="\u65E5\u671F\u5B89\u6392"&&a.createElement("p",{className:"df-muted"},"\u6587\u4E66\u7EDF\u4E00\u4F7F\u7528\u4E2D\u6587\u65E5\u671F\uFF0C\u4F8B\u5982\u201C2026\u5E7410\u670822\u65E5\u4E0B\u534814:30\u201D\u3002\u65E5\u671F\u9009\u62E9\u5668\u4FDD\u7559\u539F\u6765\u7684\u586B\u5199\u65B9\u5F0F\u3002"),a.createElement("div",{className:"df-fields"},Je.filter(t=>t.group===p&&Ie(t)===n&&!/^selection\.member\d+_/.test(t.key)).map(t=>a.createElement(ea,{key:t.key,field:t,displayValue:d.presentation_sources?.[t.key]===t.value?d.document_values?.[t.key]:void 0,onChange:(m,j)=>Le({...d,fields:d.fields.map(V=>V.key===t.key?{...V,value:m,...j!==void 0?{linked_template:j}:{}}:V)})}))))),n==="\u8BBA\u8BC1\u6210\u5458"&&a.createElement(ya,{fields:Je,compact:!!te,onChange:(p,t)=>Le({...d,fields:d.fields.map(m=>m.key===p?{...m,value:t}:m)})}))),!Z&&Ce,a.createElement("div",{role:"tabpanel",id:"df-form-panel-generate","aria-labelledby":"df-form-tab-generate",hidden:L!=="generate"},!te&&ht,a.createElement("section",{className:"df-paper df-edit-footer","aria-label":"\u6838\u5BF9\u4E0E\u751F\u6210"},a.createElement("div",{className:"df-generation-plan"},!te&&a.createElement("h2",null,"\u6838\u5BF9\u4E0E\u751F\u6210"),a.createElement("p",null,"\u672C\u6B21\u8BA1\u5212\u751F\u6210 ",a.createElement("b",null,Ye)," \u4EFD\u6587\u4E66"),!te&&a.createElement("small",null,Me?"\u751F\u6210\u8BBA\u8BC1\u610F\u89C1\u53CA\u7B7E\u5B57\u8868\uFF0C\u4EE5\u53CA\u8BBA\u8BC1\u7ED3\u675F\u540E\u4E0A\u4F20\u7684\u975E\u62DB\u6807\u65B9\u6848\u3002\u7B7E\u5B57\u76D6\u7AE0\u540E\uFF0C\u5728\u9636\u6BB5\u6750\u6599\u4E2D\u7559\u5B58\u626B\u63CF\u4EF6\u3002":oe?"\u6309\u672C\u6B21\u586B\u5199\u5185\u5BB9\u751F\u6210 Word \u8BF4\u660E\u4E0E Excel \u8BA1\u5212\u8868\u3002":a.createElement(a.Fragment,null,ke.filter(n=>!n.per_recipient).length," ","\u4EFD\u5171\u7528\u6587\u4EF6 \xB7"," ",ke.filter(n=>n.per_recipient).length," ","\u7C7B\u6309\u5355\u4F4D\u6587\u4E66 \xD7 ",d.recipients.length," \u5BB6\u5355\u4F4D"))),a.createElement("div",{className:"df-next-action"},a.createElement("button",{className:"df-primary",onClick:Ne},"\u6838\u5BF9\u586B\u5199\u5185\u5BB9 \u2192"),!te&&a.createElement("small",null,Me?"\u6838\u5BF9\u8BBA\u8BC1\u610F\u89C1\u3001\u4E09\u5BB6\u5355\u4F4D\u4E0E\u6210\u5458\u4FE1\u606F\uFF0C\u518D\u786E\u8BA4\u751F\u6210":oe?"\u5148\u6838\u5BF9\u57FA\u7840\u4FE1\u606F\u4E0E\u7533\u62A5\u7ECF\u8D39\uFF0C\u518D\u786E\u8BA4\u751F\u6210":"\u5148\u6838\u5BF9\u7F3A\u9879\u4E0E\u65E5\u671F\uFF0C\u518D\u786E\u8BA4\u751F\u6210"))))),d&&x==="review"&&A&&a.createElement("div",{className:"df-review"},a.createElement("section",{className:"df-paper"},a.createElement("span",{className:"df-eyebrow"},"\u586B\u5199\u6838\u5BF9"),a.createElement("h2",null,A.can_generate?"\u8D44\u6599\u5DF2\u9F50\u5907\uFF0C\u8BF7\u786E\u8BA4\u672C\u6B21\u5185\u5BB9\u3002":`\u8FD8\u6709 ${ie.length} \u9879\u9700\u8981\u5904\u7406`),a.createElement("p",null,"\u672C\u6B21\u4F7F\u7528\u4FEE\u8BA2 ",d.revision," \u7684\u6570\u636E\uFF0C\u8BA1\u5212\u751F\u6210 ",Ye," ","\u4EFD\u6587\u4E66\u3002"),ie.length>0&&a.createElement("div",{className:"df-checks"},ie.map((n,p)=>a.createElement("div",{key:p,className:"df-check "+n.status},a.createElement("span",null,n.status==="ok"?"\u901A\u8FC7":n.status==="missing"?"\u5F85\u8865\u5145":"\u51B2\u7A81"),a.createElement("div",null,a.createElement("b",null,n.label),a.createElement("p",null,n.detail)),n.status!=="ok"&&n.field&&a.createElement("button",{onClick:()=>Ct(n.field)},"\u4FEE\u6539")))),A.checks.some(n=>n.status==="ok")&&a.createElement("details",{className:"df-passed"},a.createElement("summary",null,A.checks.filter(n=>n.status==="ok").length," ","\u9879\u65E5\u671F\u6821\u6838\u901A\u8FC7 \xB7 \u67E5\u770B\u660E\u7EC6"),A.checks.filter(n=>n.status==="ok").map((n,p)=>a.createElement("p",{key:p},a.createElement("b",null,n.label),a.createElement("br",null),n.detail.replaceAll("T"," ")))),a.createElement("div",{className:"df-review-data"},a.createElement("h3",null,"\u5171\u7528\u4FE1\u606F"),a.createElement("dl",null,d.fields.map(n=>a.createElement("div",{key:n.key,className:Rt(n)?"df-span":void 0},a.createElement("dt",null,n.label),a.createElement("dd",null,(d.document_values?.[n.key]??n.value)||"\u5C1A\u672A\u586B\u5199")))),d.recipients.length>0&&a.createElement(a.Fragment,null,a.createElement("h3",null,"\u53D7\u9080\u5355\u4F4D"),d.recipients.map((n,p)=>a.createElement("p",{key:p},p+1,". ",n.name||"\u5C1A\u672A\u586B\u5199",d.recipient_document_times?.[p]??`${n.start.replace("T"," ")} \u2014 ${n.end.replace("T"," ")}`)))),a.createElement("div",{className:"df-review-data"},a.createElement("h3",null,"\u8F93\u51FA\u6E05\u5355"),ke.map(n=>a.createElement("p",{key:n.id},n.name," \xB7"," ",n.per_recipient?d.recipients.map(p=>p.name||"\u5F85\u586B\u5355\u4F4D").join("\u3001"):"\u5171\u7528\u6587\u4EF6",n.print_copies>1&&` \xB7 \u5EFA\u8BAE\u6253\u5370 ${n.print_copies} \u4EFD\uFF0C\u6BCF\u4F4D\u4E13\u5BB6\u4E00\u4EFD`))),a.createElement("div",{className:"df-confirm"},a.createElement("label",null,a.createElement("input",{type:"checkbox",checked:ne,disabled:!A.can_generate,onChange:n=>J(n.target.checked)}),Me?"\u6211\u5DF2\u6838\u5BF9\u8BBA\u8BC1\u610F\u89C1\u3001\u5019\u9009\u5355\u4F4D\u3001\u6210\u5458\u4E0E\u7CFB\u7EDF\u586B\u62A5\u4FE1\u606F":oe?"\u6211\u5DF2\u6838\u5BF9\u57FA\u7840\u4FE1\u606F\u3001\u7533\u62A5\u7ECF\u8D39\u548C\u5916\u534F\u5FC5\u8981\u6027":"\u6211\u5DF2\u6838\u5BF9\u586B\u5199\u5185\u5BB9\u3001\u53D7\u9080\u5355\u4F4D\u548C\u65E5\u671F\u5B89\u6392"),a.createElement("p",null,Me?"\u751F\u6210\u540E\u8BF7\u5B8C\u6210\u7EBF\u4E0B\u7B7E\u5B57\u76D6\u7AE0\uFF0C\u518D\u5C06\u975E\u62DB\u6807\u65B9\u6848\u548C\u7B7E\u5B57\u6750\u6599\u4E0A\u4F20\u4E1A\u52A1\u7CFB\u7EDF\u3002":oe?"\u7533\u62A5\u53E3\u5F84\u4E0E\u6A21\u677F\u7248\u5F0F\u8BF7\u7531\u7ECF\u529E\u4EBA\u590D\u6838\u3002":"\u6821\u6838\u68C0\u67E5\u8D44\u6599\u5B8C\u6574\u6027\u53CA\u65F6\u95F4\u987A\u5E8F\u3002\u4E1A\u52A1\u6761\u6B3E\u4E0E Word \u6A21\u677F\u8BF7\u7531\u7ECF\u529E\u4EBA\u590D\u6838\u3002"),a.createElement("div",null,a.createElement("button",{onClick:()=>{T("edit"),J(!1)}},"\u8FD4\u56DE\u4FEE\u6539"),a.createElement("button",{className:"df-primary",disabled:!A.can_generate||!ne,onClick:R},"\u786E\u8BA4\u5E76\u751F\u6210 ",Ye," \u4EFD\u6587\u4E66"))))),d&&x==="files"&&de&&a.createElement("div",{className:"df-results"+($?" df-results-docked":"")},a.createElement("section",{className:"df-paper df-output-list"},a.createElement("span",{className:"df-eyebrow"},"\u751F\u6210\u8BB0\u5F55"),a.createElement("h2",null,de.files.length," \u4EFD\u6587\u4EF6\u5DF2\u751F\u6210"),a.createElement("p",null,nt(de.created_at)," \xB7 \u4FEE\u8BA2 ",de.revision),a.createElement("p",{className:"df-muted"},Me?"\u538B\u7F29\u5305\u5305\u542B\u8BBA\u8BC1\u610F\u89C1\u53CA\u7B7E\u5B57\u8868\u3001\u975E\u62DB\u6807\u65B9\u6848\u3001\u586B\u5199\u6570\u636E\u548C\u6838\u5BF9\u8BB0\u5F55":oe?"\u538B\u7F29\u5305\u5305\u542B Word\u3001\u79D1\u7814\u8BA1\u5212\u8868\u3001\u586B\u5199\u6570\u636E\u548C\u6838\u5BF9\u8BB0\u5F55":"\u538B\u7F29\u5305\u5305\u542B Word\u3001\u586B\u5199\u6570\u636E\u548C\u6838\u5BF9\u8BB0\u5F55"),(v||(de.content_digest?de.content_digest!==d.content_digest:de.revision!==d.revision))&&a.createElement("div",{className:"df-alert"},"\u586B\u5199\u5185\u5BB9\u5DF2\u6709\u4FEE\u6539\uFF0C\u4E0B\u5217\u6587\u4EF6\u4FDD\u7559\u751F\u6210\u65F6\u7684\u5185\u5BB9\u3002\u8BF7\u91CD\u65B0\u6838\u5BF9\u5E76\u751F\u6210\u65B0\u7248\u3002"),et.map(n=>a.createElement("div",{className:"df-generation",key:n.id},a.createElement("div",{className:"df-generation-heading"},a.createElement("h3",null,nt(n.created_at)," \xB7 \u4FEE\u8BA2 ",n.revision,n.date_style!=="zh-CN"&&" \xB7 \u539F\u65E5\u671F\u683C\u5F0F",n.naming_style!=="formal"&&" \xB7 \u539F\u6587\u4EF6\u540D"),a.createElement("button",{"aria-label":`\u6253\u5305\u4E0B\u8F7D ${nt(n.created_at)} \u4FEE\u8BA2 ${n.revision}`,onClick:()=>pe(n)},"\u6253\u5305\u4E0B\u8F7D")),n.files.map(p=>a.createElement("div",{className:"df-output "+(X?.file.name===p.name&&X?.generation.id===n.id?"selected":""),key:p.name},a.createElement("button",{onClick:()=>Se({file:p,generation:n})},a.createElement("b",null,p.name),a.createElement("small",null,p.recipient," \xB7 ",(p.size/1024).toFixed(0)," KB",p.print_copies>1&&` \xB7 \u5EFA\u8BAE\u6253\u5370 ${p.print_copies} \u4EFD`)),a.createElement("button",{"aria-label":"\u4E0B\u8F7D"+p.name,onClick:()=>ae("\u4E0B\u8F7D\u6587\u4EF6",()=>it(Be(n,p.name),p.name))},"\u2193")))))),!$&&a.createElement("section",{className:"df-paper df-preview"},a.createElement("div",{className:"df-section-head"},a.createElement("h2",null,X?X.file.name:"\u9009\u62E9\u6587\u4EF6\u9884\u89C8"),a.createElement("span",null,"Office \u9884\u89C8")),a.createElement("div",{className:"df-preview-body"},fe&&me?a.createElement(xt,{key:fe.id,artifact:fe},a.createElement(me,{key:fe.id,artifact:fe,readOnly:!0,hostControls:!0})):a.createElement("p",{className:"df-muted"},fe?"\u6B63\u5728\u6253\u5F00\u6587\u4EF6\u2026":"\u4ECE\u5DE6\u4FA7\u9009\u62E9\u4E00\u4EFD\u6587\u4EF6\u3002"))))),a.createElement("footer",{className:"df-footer"},a.createElement("span",null,"UGSci \xB7 \u5916\u534F\u52A9\u624B"))),U&&d&&a.createElement("div",{className:"df-dialog-backdrop"},a.createElement("section",{className:"df-dialog df-paper",role:"dialog","aria-modal":"true","aria-label":"\u6838\u5BF9\u5171\u7528\u8D44\u6599"},a.createElement("div",{className:"df-section-head"},a.createElement("h2",null,U==="adopt"?"\u91C7\u7528\u9879\u76EE\u5E95\u7A3F\u4E2D\u7684\u8D44\u6599":"\u5C06\u672C\u8868\u8D44\u6599\u5B58\u5165\u9879\u76EE\u5E95\u7A3F"),a.createElement("button",{disabled:!!q,onClick:()=>B(null),"aria-label":"\u5173\u95ED\u5171\u7528\u8D44\u6599\u6838\u5BF9"},"\xD7")),a.createElement("p",{className:"df-muted"},"\u53EA\u66F4\u65B0\u52FE\u9009\u9879\u3002\u539F\u751F\u6210\u6587\u4EF6\u4FDD\u7559\uFF0C\u540E\u7EED\u751F\u6210\u524D\u9700\u91CD\u65B0\u6838\u5BF9\u3002"),we&&a.createElement("p",{role:"alert",className:"df-alert error"},we),a.createElement("div",{className:"df-compare"},i.fields.filter(n=>d.fields.some(p=>p.key===n.key&&p.value!==n.value)).map(n=>{let p=d.fields.find(t=>t.key===n.key);return a.createElement("label",{key:n.key},a.createElement("input",{type:"checkbox",checked:_.includes(n.key),onChange:t=>y(t.target.checked?[..._,n.key]:_.filter(m=>m!==n.key))}),a.createElement("div",null,a.createElement("b",null,n.label),a.createElement("div",{className:"df-compare-values"},a.createElement("p",null,a.createElement("small",null,"\u5F53\u524D\u8868\u5355"),p.value||"\u7A7A\u767D"),a.createElement("p",null,a.createElement("small",null,"\u9879\u76EE\u5E95\u7A3F"),n.value||"\u7A7A\u767D"))))}),!i.fields.some(n=>d.fields.some(p=>p.key===n.key&&p.value!==n.value))&&a.createElement("p",null,"\u672C\u8868\u4E0E\u9879\u76EE\u5E95\u7A3F\u4E2D\u7684\u5171\u7528\u8D44\u6599\u4E00\u81F4\u3002")),a.createElement("div",{className:"df-actions"},a.createElement("button",{disabled:!!q,onClick:()=>B(null)},"\u53D6\u6D88"),a.createElement("button",{className:"df-primary",disabled:!!q||!_.length,onClick:()=>ae("\u540C\u6B65\u5171\u7528\u8D44\u6599",async()=>{let n=await ge();if(U==="adopt")ye(await xe(`/projects/${i.id}/cases/${n.id}/sync`,Xe({revision:i.revision,case_revision:n.revision,keys:_})));else{let p=Object.fromEntries(n.fields.filter(t=>_.includes(t.key)).map(t=>[t.key,t.value]));await xe(`/projects/${i.id}`,{...Xe({revision:i.revision,name:p["project.name"]??i.name,code:p["project.code"]??i.code,owner:i.owner,values:p}),method:"PUT"})}await De(),B(null),H("\u6240\u9009\u8D44\u6599\u5DF2\u540C\u6B65\uFF0C\u8BF7\u91CD\u65B0\u6838\u5BF9\u540E\u751F\u6210\u65B0\u7248\u6587\u4E66\u3002")})},U==="adopt"?"\u91C7\u7528\u6240\u9009\u9879\u76EE\u8D44\u6599":"\u4FDD\u5B58\u6240\u9009\u8D44\u6599\u5230\u5E95\u7A3F")))))}function Na(){let i=ve.host.useSelectedAgent?.();return a.createElement(Et,{key:i?.id||ve.host.getSelectedAgentId?.()||"default",Editor:ka,services:{request:xe,json:Xe,download:it,time:nt,Field:ea}})}ve.registerRoutes("document-forms",[{path:"/apps/document-forms",component:Na,label:"\u5916\u534F\u52A9\u624B",icon:"\u25A4"}]);})();
