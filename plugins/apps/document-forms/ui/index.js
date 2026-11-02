(()=>{var W=window.QwenPaw.host.React,{useEffect:Ct,useState:je}=W;function pt({artifact:n,children:c}){return n.extension==="xlsx"?c:W.createElement(Ut,{artifact:n},c)}function Ut({artifact:n,children:c}){let[l,h]=je("print"),[g,m]=je([]),[f,x]=je(0),[d,y]=je(""),[r,P]=je(0),[_,Z]=je(100);return Ct(()=>{if(l!=="print")return;let O=new AbortController,Q=[];return m([]),x(0),y(""),window.QwenPaw.host.fetch(n.printUrl+"?pages=true",{headers:n.agentId?{"X-Agent-Id":n.agentId}:{},signal:O.signal}).then(async $=>{if(!$.ok){let s=await $.json().catch(()=>({}));throw new Error(typeof s.detail=="string"?s.detail:"\u6253\u5370\u9884\u89C8\u6682\u4E0D\u53EF\u7528\uFF0C\u53EF\u5207\u6362\u6587\u5B57\u9884\u89C8\u6216\u4E0B\u8F7D Word \u67E5\u770B")}let{pages:D}=await $.json();if(!O.signal.aborted){if(!Number.isInteger(D)||D<1||D>40)throw new Error("\u672A\u83B7\u5F97\u6709\u6548\u7684 Word \u9875\u6570");x(D);for(let s=1;s<=D;s++){let K=await window.QwenPaw.host.fetch(n.printUrl+"?page="+s,{headers:n.agentId?{"X-Agent-Id":n.agentId}:{},signal:O.signal});if(!K.ok)throw new Error(`\u7B2C ${s} \u9875\u672A\u80FD\u6E32\u67D3\uFF0C\u8BF7\u91CD\u65B0\u9884\u89C8`);let R=await K.blob();if(O.signal.aborted)return;let z=URL.createObjectURL(R);Q.push(z),m(L=>[...L,z])}}}).catch($=>{O.signal.aborted||y($.message||"\u6253\u5370\u9884\u89C8\u672A\u5B8C\u6210")}),()=>{O.abort(),Q.forEach($=>URL.revokeObjectURL($))}},[n.id,n.printUrl,n.agentId,l,r]),W.createElement("div",{className:"df-print-preview"},W.createElement("div",{className:"df-print-toolbar"},W.createElement("div",null,W.createElement("button",{"aria-pressed":l==="print",onClick:()=>h("print")},"\u6253\u5370\u7248\u5F0F"),W.createElement("button",{"aria-pressed":l==="text",onClick:()=>h("text")},"\u6587\u5B57\u9884\u89C8")),l==="print"&&W.createElement("div",null,f>0&&W.createElement("span",null,"\u5171 ",f," \u9875"),W.createElement("select",{"aria-label":"\u9884\u89C8\u6BD4\u4F8B",value:_,onChange:O=>Z(Number(O.target.value))},W.createElement("option",{value:100},"\u9002\u5408\u5BBD\u5EA6"),W.createElement("option",{value:125},"125%"),W.createElement("option",{value:150},"150%"),W.createElement("option",{value:200},"200%")))),l==="text"?W.createElement("div",{className:"df-text-preview"},c):d?W.createElement("div",{className:"df-preview-message",role:"alert"},W.createElement("p",null,d),W.createElement("button",{onClick:()=>P(O=>O+1)},"\u91CD\u65B0\u9884\u89C8")):g.length?W.createElement("div",{className:"df-print-scroll"},W.createElement("div",{className:"df-print-pages",style:{width:_+"%"}},g.map((O,Q)=>W.createElement("figure",{key:Q},W.createElement("figcaption",null,"\u7B2C ",Q+1," \u9875"),W.createElement("img",{src:O,alt:n.title+` \xB7 \u6253\u5370\u7248\u5F0F \xB7 \u7B2C ${Q+1} \u9875`}))),g.length<f&&W.createElement("p",{role:"status"},"\u6B63\u5728\u6392\u7248\u7B2C ",g.length+1," \u9875\u2026"))):W.createElement("div",{className:"df-preview-message",role:"status"},"\u6B63\u5728\u6392\u7248\u6253\u5370\u9875\u9762\u2026"))}function ye({artifact:n}){let[c,l]=je(null),[h,g]=je(""),[m,f]=je(0);if(Ct(()=>{let d=new AbortController;return l(null),g(""),window.QwenPaw.host.fetch("/workspace/convert-office",{method:"POST",headers:{"Content-Type":"application/json",...n.agentId?{"X-Agent-Id":n.agentId}:{}},signal:d.signal,body:JSON.stringify({url:n.binaryUrl,mime_type:n.mimeType})}).then(async y=>{let r=await y.json();if(!y.ok)throw new Error(typeof r.detail=="string"?r.detail:"\u6587\u4EF6\u9884\u89C8\u672A\u5B8C\u6210");d.signal.aborted||l(r)}).catch(y=>{d.signal.aborted||g(y.message||"\u6587\u4EF6\u9884\u89C8\u672A\u5B8C\u6210")}),()=>d.abort()},[n.id,n.binaryUrl,n.mimeType,n.agentId,m]),h)return W.createElement("div",{className:"df-preview-message",role:"alert"},W.createElement("p",null,h),W.createElement("button",{onClick:()=>f(d=>d+1)},"\u91CD\u65B0\u9884\u89C8"),W.createElement("p",null,"\u4E5F\u53EF\u4EE5\u4ECE\u6587\u4EF6\u6E05\u5355\u4E0B\u8F7D\u540E\u67E5\u770B\u3002"));if(!c)return W.createElement("div",{className:"df-preview-message",role:"status"},"\u6B63\u5728\u6253\u5F00\u6587\u4EF6\u2026");let x=c.engine==="officecli"?c.html:`<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;color:#333;background:#fff;padding:24px 32px;line-height:1.7;max-width:900px;margin:0 auto}table{border-collapse:collapse;width:100%;margin:12px 0}td,th{border:1px solid #ddd;padding:8px 12px}img{max-width:100%;height:auto}h1{font-size:1.6em}h2{font-size:1.3em}.docx-page-break{border-top:2px dashed #ccc;margin:32px 0}</style></head><body>${c.html||""}</body></html>`;return W.createElement("iframe",{className:"df-office-frame",title:n.title,srcDoc:x,sandbox:c.engine==="officecli"?"allow-scripts":"allow-same-origin"})}var _t=`.df-app {
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
`;var zt=`.df-stage-toolbar {
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
.df-stage-header,
.df-three-column .df-stage-header {
  container-type: inline-size;
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
@container (max-width: 630px) {
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
`;var ft=window.QwenPaw,k=ft.host.React,{useState:$e,useEffect:Ft}=k,jt={running:"\u6B63\u5728\u6838\u67E5",completed:"\u6838\u67E5\u5B8C\u6210",failed:"\u672A\u5B8C\u6210",interrupted:"\u5DF2\u4E2D\u65AD"},$t=".doc,.docx,.pdf,.xls,.xlsx,.png,.jpg,.jpeg";function at({project:n,services:c,onChanged:l}){let{request:h,download:g,time:m}=c,[f,x]=$e(null),[d,y]=$e(""),[r,P]=$e(null),[_,Z]=$e([]),[O,Q]=$e(""),[$,D]=$e(""),[s,K]=$e(!1),[R,z]=$e(""),[L,q]=$e(0);Ft(()=>{let u=!0,X,S=!1;async function ee(){try{let re=await h(`/projects/${n.id}/response-reviews`);if(!u)return;x(re),z("");let H=re.records.some(M=>M.status==="running");S&&!H&&l(),S=H,H&&(X=setTimeout(ee,3e3))}catch(re){u&&z(re.message)}}return ee(),()=>{u=!1,clearTimeout(X)}},[n.id,L]);let V=f?.records.some(u=>u.status==="running"),I=f?.records.find(u=>u.id===$)||f?.records[0],w=ft.host.ReactMarkdown;async function E(u){u.preventDefault(),z(""),K(!0);try{let X=new FormData;d?X.set("reference_id",d):r&&X.set("reference",r);for(let ee of _)X.append("responses",ee);X.set("focus",O);let S=await h(`/projects/${n.id}/response-reviews`,{method:"POST",body:X});D(S.id),x(ee=>({...ee,records:[S,...ee?.records||[]]})),q(ee=>ee+1)}catch(X){z(X.message)}finally{K(!1)}}return k.createElement("div",{className:"df-response-review"},k.createElement("p",{className:"df-muted"},"\u5BF9\u7167\u8C08\u5224\u6587\u4EF6\uFF0C\u9010\u5BB6\u68C0\u67E5\u8D44\u8D28\u3001\u6280\u672F\u54CD\u5E94\u3001\u62A5\u4EF7\u3001\u65E5\u671F\u4E0E\u7B7E\u7AE0\u9644\u4EF6\u3002\u6838\u67E5\u610F\u89C1\u4F9B\u7ECF\u529E\u4EBA\u548C\u4E13\u5BB6\u590D\u6838\u3002"),R&&k.createElement("div",{className:"df-alert error",role:"alert"},R,k.createElement("button",{onClick:()=>q(u=>u+1)},"\u91CD\u65B0\u52A0\u8F7D")),f?k.createElement(k.Fragment,null,k.createElement("form",{onSubmit:E},k.createElement("fieldset",{disabled:s||V},k.createElement("label",{className:"df-field"},k.createElement("span",null,"\u6838\u67E5\u4F9D\u636E"),k.createElement("select",{"aria-label":"\u6838\u67E5\u4F9D\u636E",value:d,onChange:u=>{y(u.target.value),P(null)}},k.createElement("option",{value:""},"\u4E0A\u4F20\u6B63\u5F0F\u8C08\u5224\u6587\u4EF6"),f.references.map(u=>k.createElement("option",{key:u.id,value:u.id},u.label)))),!d&&k.createElement("label",{className:"df-field"},k.createElement("span",null,"\u6B63\u5F0F\u8C08\u5224\u6587\u4EF6"),k.createElement("input",{"aria-label":"\u4E0A\u4F20\u6838\u67E5\u4F9D\u636E",type:"file",accept:$t,required:!0,onChange:u=>P(u.target.files[0]||null)})),k.createElement("label",{className:"df-field"},k.createElement("span",null,"\u5404\u5355\u4F4D\u54CD\u5E94\u6750\u6599"),k.createElement("input",{"aria-label":"\u4E0A\u4F20\u54CD\u5E94\u6750\u6599",type:"file",multiple:!0,required:!0,accept:$t,onChange:u=>Z([...u.target.files])})),_.length>0&&k.createElement("ul",{className:"df-review-files"},_.map((u,X)=>k.createElement("li",{key:X},u.name))),k.createElement("p",{className:"df-muted"},"\u652F\u6301 Word\u3001PDF\u3001Excel \u548C\u56FE\u7247\uFF1B\u53EF\u4E00\u6B21\u9009\u62E9\u591A\u5BB6\u6750\u6599\u3002\u6BCF\u4EFD\u4E0D\u8D85\u8FC7 15 MB\uFF0C\u6BCF\u6B21\u6700\u591A 20 \u4EFD\u3001\u5408\u8BA1 100 MB\u3002\u538B\u7F29\u5305\u8BF7\u5148\u89E3\u538B\u3002"),k.createElement("label",{className:"df-field"},k.createElement("span",null,"\u8865\u5145\u5173\u6CE8\u70B9\uFF08\u9009\u586B\uFF09"),k.createElement("textarea",{"aria-label":"\u8865\u5145\u6838\u67E5\u5173\u6CE8\u70B9",rows:3,maxLength:3e3,value:O,onChange:u=>Q(u.target.value),placeholder:"\u4F8B\u5982\uFF1A\u91CD\u70B9\u6838\u5BF9\u62A5\u4EF7\u5927\u5C0F\u5199\u3001\u6210\u679C\u4EA4\u4ED8\u65F6\u95F4\u548C\u8D44\u8D28\u6709\u6548\u671F"})),k.createElement("div",{className:"df-actions"},k.createElement("button",{className:"df-primary",disabled:s||V||!(d||r)||!_.length},s?"\u6B63\u5728\u63D0\u4EA4\u2026":"\u5F00\u59CB\u6838\u67E5"),k.createElement("span",{className:"df-muted"},"\u4F7F\u7528\u201C\u54CD\u5E94\u6587\u4EF6\u6838\u67E5\u201D\u667A\u80FD\u4F53\uFF0C\u6CBF\u7528\u8F6F\u4EF6\u4E2D\u7684\u6A21\u578B\u914D\u7F6E\u3002")))),f.records.length>0&&k.createElement("section",{className:"df-review-history"},k.createElement("div",{className:"df-section-head"},k.createElement("h3",null,"\u6838\u67E5\u8BB0\u5F55"),k.createElement("button",{onClick:()=>q(u=>u+1)},"\u5237\u65B0\u8BB0\u5F55")),k.createElement("div",{className:"df-review-records"},f.records.map(u=>k.createElement("button",{key:u.id,"aria-pressed":I?.id===u.id,onClick:()=>D(u.id)},m(u.created_at)," \xB7 ",jt[u.status]))),I&&k.createElement("article",{"aria-label":"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5\u7ED3\u679C"},k.createElement("div",{className:"df-section-head"},k.createElement("div",null,k.createElement("b",null,jt[I.status]),k.createElement("p",{className:"df-muted"},"\u57FA\u4E8E\u9879\u76EE\u4FEE\u8BA2 ",I.project_revision," \xB7"," ",I.files.length," \u4EFD\u6750\u6599\uFF1B\u540E\u7EED\u6750\u6599\u4FEE\u6539\u8BF7\u91CD\u65B0\u6838\u67E5\u3002")),I.status==="completed"&&k.createElement("button",{onClick:async()=>{try{await g(`/projects/${n.id}/response-reviews/${I.id}/report`,`${n.name}_\u54CD\u5E94\u6587\u4EF6\u6838\u67E5\u8BB0\u5F55_${I.id.slice(0,8)}.md`)}catch(u){z(u.message)}}},"\u4E0B\u8F7D\u6838\u67E5\u8BB0\u5F55")),k.createElement("details",null,k.createElement("summary",null,"\u672C\u6B21\u6838\u67E5\u6750\u6599\u4E0E\u5173\u6CE8\u70B9"),k.createElement("ul",null,I.files.map((u,X)=>k.createElement("li",{key:X},u.role,"\uFF1A",u.name))),k.createElement("p",null,I.focus||"\u65E0\u8865\u5145\u5173\u6CE8\u70B9")),I.status==="running"&&k.createElement("p",{role:"status",className:"df-alert"},"\u6B63\u5728\u8BFB\u53D6\u5E76\u6838\u67E5\u6750\u6599\uFF0C\u53EF\u5173\u95ED\u6B64\u7A97\u53E3\uFF0C\u7A0D\u540E\u56DE\u5230\u672C\u9879\u76EE\u67E5\u770B\u7ED3\u679C\u3002"),I.error&&k.createElement("p",{role:"alert",className:"df-alert error"},I.error),I.report&&k.createElement("div",{className:"df-review-report"},w?k.createElement(w,{remarkPlugins:ft.host.remarkGfm?[ft.host.remarkGfm]:[],components:{a:({children:u})=>k.createElement("span",null,u),img:()=>null}},I.report):k.createElement("div",{style:{whiteSpace:"pre-wrap"}},I.report))))):k.createElement("p",{role:"status"},"\u6B63\u5728\u8BFB\u53D6\u6838\u67E5\u8BB0\u5F55\u2026"))}var Fe=window.QwenPaw,b=Fe.host.React,{useState:Oe,useEffect:xt,useRef:Pt}=b;function Qt(n,c,l){return{artifact:{id:c.id+l.name,title:l.name,source:"generated",extension:l.name.endsWith(".xlsx")?"xlsx":"docx",mimeType:l.name.endsWith(".xlsx")?"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":"application/vnd.openxmlformats-officedocument.wordprocessingml.document",binaryUrl:l.preview_url,printUrl:`/document-forms/cases/${n.case_id}/print/${c.id}/${encodeURIComponent(l.name)}`,agentId:Fe.host.getSelectedAgentId?.(),createdAt:Date.parse(c.created_at)},reference:{case_id:n.case_id,generation_id:c.id,name:l.name}}}function Kt({project:n,stageId:c,selection:l,services:h}){let{request:g,json:m,time:f}=h,[x,d]=Oe([]),[y,r]=Oe(""),[P,_]=Oe(!1),[Z,O]=Oe(""),[Q,$]=Oe(0),D=Pt(null);xt(()=>{let z=!0,L;async function q(){try{let V=await g(`/projects/${n.id}/assistant`);if(!z)return;d(V.messages),O(""),V.messages.some(I=>I.status==="running")&&(L=setTimeout(q,2500))}catch(V){z&&O(V.message)}}return q(),()=>{z=!1,clearTimeout(L)}},[n.id,Q]),xt(()=>{D.current?.scrollIntoView?.({block:"nearest"})},[x.length,x.at(-1)?.status]);let s=P||x.some(z=>z.status==="running"),K=Fe.host.ReactMarkdown;async function R(z){if(z.preventDefault(),!(!y.trim()||s)){_(!0),O("");try{let L=await g(`/projects/${n.id}/assistant`,m({message:y.trim(),stage_id:c||"overview",file:l?.reference||{}}));d(q=>[...q,L]),r(""),$(q=>q+1)}catch(L){O(L.message)}finally{_(!1)}}}return b.createElement("section",{className:"df-project-chat","aria-label":"\u9879\u76EE\u667A\u80FD\u4F53\u95EE\u7B54"},b.createElement("div",{className:"df-chat-messages","aria-live":"polite"},!x.length&&b.createElement("div",{className:"df-chat-welcome"},["\u672C\u9636\u6BB5\u8FD8\u9700\u8981\u51C6\u5907\u54EA\u4E9B\u6750\u6599\uFF1F","\u5E2E\u6211\u6838\u5BF9\u5F53\u524D\u6587\u4EF6\u4E2D\u7684\u65E5\u671F\u548C\u91D1\u989D\u3002"].map(z=>b.createElement("button",{key:z,onClick:()=>r(z)},z))),x.map(z=>b.createElement("article",{className:"df-chat-turn",key:z.id},b.createElement("div",{className:"df-chat-question"},b.createElement("small",null,"\u6211 \xB7 ",f(z.created_at)),b.createElement("p",null,z.message),z.file_name&&b.createElement("small",null,"\u53C2\u8003\u6587\u4EF6\uFF1A",z.file_name)),z.reply&&b.createElement("div",{className:"df-chat-answer"},b.createElement("small",null,"\u9879\u76EE\u52A9\u624B"),K?b.createElement(K,{remarkPlugins:Fe.host.remarkGfm?[Fe.host.remarkGfm]:[],components:{img:()=>null,a:({children:L})=>b.createElement("span",null,L)}},z.reply):b.createElement("p",{style:{whiteSpace:"pre-wrap"}},z.reply)),z.status==="running"&&b.createElement("p",{role:"status",className:"df-muted"},"\u6B63\u5728\u7ED3\u5408\u9879\u76EE\u8D44\u6599\u6574\u7406\u56DE\u7B54\u2026"),z.error&&b.createElement("p",{role:"alert",className:"df-alert error"},z.error))),b.createElement("div",{ref:D})),Z&&b.createElement("p",{role:"alert",className:"df-alert error"},Z,b.createElement("button",{onClick:()=>$(z=>z+1)},"\u91CD\u65B0\u52A0\u8F7D")),b.createElement("form",{className:"df-chat-composer",onSubmit:R},l&&b.createElement("small",{className:"df-chat-context"},"\u53C2\u8003\u6587\u4EF6\uFF1A",l.artifact.title),b.createElement("textarea",{"aria-label":"\u5411\u9879\u76EE\u667A\u80FD\u4F53\u63D0\u95EE",placeholder:"\u8F93\u5165\u5F53\u524D\u9879\u76EE\u7684\u95EE\u9898\u2026",rows:3,maxLength:4e3,value:y,onChange:z=>r(z.target.value)}),b.createElement("div",{className:"df-actions"},b.createElement("button",{className:"df-primary",disabled:s||!y.trim()},s?"\u6B63\u5728\u56DE\u7B54\u2026":"\u53D1\u9001\u95EE\u9898"))))}function vt({collapsed:n=!1,width:c,maxWidth:l,onResize:h,onToggle:g,project:m,stageId:f,services:x,mode:d,onMode:y,selection:r,onSelect:P,attachment:_,AttachmentPreview:Z,onChanged:O,dirty:Q=!1}){let $=Pt(null),[D,s]=Oe(!1),K=()=>{$.current=null,s(!1)},[R,z]=Oe(null),[L,q]=Oe("");async function V(w,E){try{q(""),await x.download(w,E)}catch(u){q(u.message)}}xt(()=>{let w=!0;return(Fe.workspace?.loadPreview?Fe.workspace.loadPreview():Promise.resolve(ye)).then(E=>w&&z(()=>E)).catch(()=>w&&z(()=>ye)),()=>{w=!1}},[]);let I=m.forms.flatMap(w=>w.generations.flatMap(E=>f&&f!=="overview"&&f!=="profile"&&(E.stage_id||w.original_stage_id||w.stage_id)!==f?[]:[{form:w,generation:E}]));return b.createElement("aside",{className:"df-right-workspace"+(n?" df-pane-collapsed":"")+(D?" df-resizing":""),"aria-label":"\u9879\u76EE\u667A\u80FD\u4F53\u4E0E\u6587\u4EF6\u9884\u89C8"},b.createElement("div",{className:"df-dock-resizer",role:"separator","aria-label":"\u8C03\u6574\u95EE\u7B54\u4E0E\u9884\u89C8\u680F\u5BBD\u5EA6","aria-orientation":"vertical","aria-valuemin":300,"aria-valuemax":l,"aria-valuenow":c,"aria-valuetext":c+" \u50CF\u7D20",tabIndex:0,title:"\u5DE6\u53F3\u62D6\u52A8\u8C03\u6574\u5BBD\u5EA6\uFF1B\u53CC\u51FB\u6062\u590D\u9ED8\u8BA4\u5BBD\u5EA6",onPointerDown:w=>{w.button===0&&(w.preventDefault(),$.current={x:w.clientX,width:c,pointer:w.pointerId},w.currentTarget.setPointerCapture?.(w.pointerId),s(!0))},onPointerMove:w=>{$.current&&$.current.pointer===w.pointerId&&h($.current.width+$.current.x-w.clientX)},onPointerUp:K,onPointerCancel:K,onLostPointerCapture:K,onDoubleClick:()=>h(500),onKeyDown:w=>{let E={ArrowLeft:c+24,ArrowRight:c-24,Home:300,End:l}[w.key];E!==void 0&&(w.preventDefault(),h(E))}}),b.createElement("button",{className:"df-pane-toggle","aria-label":n?"\u5C55\u5F00\u95EE\u7B54\u4E0E\u9884\u89C8\u680F":"\u6536\u8D77\u95EE\u7B54\u4E0E\u9884\u89C8\u680F","aria-expanded":!n,title:n?"\u5C55\u5F00\u95EE\u7B54\u4E0E\u9884\u89C8\u680F":"\u6536\u8D77\u95EE\u7B54\u4E0E\u9884\u89C8\u680F",onClick:g},b.createElement("span",{"aria-hidden":"true"},n?"\u2039":"\u203A"),b.createElement("span",null,n?"\u95EE\u7B54\u4E0E\u9884\u89C8":"\u6536\u8D77")),b.createElement("header",null,b.createElement("div",null,b.createElement("h2",null,d==="preview"?"\u6587\u4EF6\u9884\u89C8":d==="review"?"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5":"\u9879\u76EE\u95EE\u7B54")),b.createElement("div",{className:"df-dock-tabs",role:"tablist","aria-label":"\u53F3\u4FA7\u5DE5\u4F5C\u533A"},b.createElement("button",{role:"tab","aria-selected":d==="assistant",onClick:()=>y("assistant")},"\u95EE\u7B54"),b.createElement("button",{role:"tab","aria-selected":d==="preview",onClick:()=>y("preview")},"\u9884\u89C8"))),L&&b.createElement("p",{role:"alert",className:"df-alert error"},L),b.createElement("div",{className:"df-right-body",hidden:d!=="assistant"},b.createElement(Kt,{project:m,stageId:["overview","profile"].includes(f)?"overview":f,selection:r,services:x}),f==="negotiation"&&b.createElement("button",{className:"df-open-review",onClick:()=>y("review")},"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5 \u2192")),b.createElement("div",{className:"df-right-body",hidden:d!=="review"},b.createElement("button",{className:"df-back-link",onClick:()=>y("assistant")},"\u2190 \u8FD4\u56DE\u95EE\u7B54"),d==="review"&&b.createElement(at,{key:m.id,project:m,services:x,onChanged:O})),b.createElement("div",{className:"df-right-body df-dock-files",hidden:d!=="preview"},Q&&b.createElement("p",{className:"df-alert"},"\u4E2D\u95F4\u8868\u5355\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\uFF0C\u9884\u89C8\u6587\u4EF6\u4FDD\u7559\u751F\u6210\u65F6\u7684\u5185\u5BB9\u3002"),b.createElement("details",{open:!r&&!_,className:"df-dock-file-list"},b.createElement("summary",null,"\u672C\u9636\u6BB5\u6587\u4EF6 \xB7"," ",I.reduce((w,E)=>w+E.generation.files.length,0)," \u4EFD"),I.map(({form:w,generation:E})=>b.createElement("section",{className:"df-generation",key:E.id},b.createElement("div",{className:"df-generation-heading"},b.createElement("h3",null,x.time(E.created_at)," \xB7 \u4FEE\u8BA2"," ",E.revision,E.date_style!=="zh-CN"&&" \xB7 \u539F\u65E5\u671F\u683C\u5F0F",E.naming_style!=="formal"&&" \xB7 \u539F\u6587\u4EF6\u540D"),b.createElement("button",{onClick:()=>V(`/cases/${w.case_id}/outputs/${E.id}/\u5168\u90E8\u6587\u4E66.zip`,E.bundle_name||m.name+"_\u6587\u4E66.zip")},"\u6253\u5305\u4E0B\u8F7D")),E.files.map(u=>b.createElement("div",{className:"df-dock-file-row",key:u.name},b.createElement("button",{className:"df-dock-file","aria-label":u.name,onClick:()=>P(Qt(w,E,u))},u.name,b.createElement("small",null,u.recipient," \xB7 ",(u.size/1024).toFixed(0)," KB",u.print_copies>1&&` \xB7 \u5EFA\u8BAE\u6253\u5370 ${u.print_copies} \u4EFD`)),b.createElement("button",{"aria-label":"\u4E0B\u8F7D"+u.name,onClick:()=>V(`/cases/${w.case_id}/outputs/${E.id}/${encodeURIComponent(u.name)}`,u.name)},"\u2193"))))),!I.length&&b.createElement("p",{className:"df-muted"},"\u751F\u6210\u6587\u4E66\u6216\u4ECE\u4E2D\u95F4\u7684\u6750\u6599\u6E05\u5355\u9009\u62E9\u6587\u4EF6\u540E\uFF0C\u5728\u8FD9\u91CC\u9884\u89C8\u3002"),m.forms.filter(w=>w.case_id!==m.form_id).map(w=>b.createElement("button",{className:"df-dock-file",key:w.case_id,onClick:()=>V(`/cases/${w.case_id}/excel`,w.name+"_\u5386\u53F2\u5E95\u7A3F.xlsx")},"\u5386\u53F2\u5E95\u7A3F\uFF1A",w.name," \u2193"))),I.length>0&&b.createElement("p",{className:"df-muted"},"\u6587\u4EF6\u4FDD\u7559\u5404\u6279\u6B21\u751F\u6210\u65F6\u7684\u5185\u5BB9\uFF0C\u4FEE\u6539\u8868\u5355\u540E\u8BF7\u91CD\u65B0\u6838\u5BF9\u751F\u6210\u3002"),_?b.createElement(Z,{key:_.id,file:_,projectId:m.id,download:V,embedded:!0,onClose:()=>P(null)}):r?b.createElement("section",{className:"df-dock-preview","aria-label":"\u6587\u4EF6\u9884\u89C8"},b.createElement("h3",null,r.artifact.title),R&&r.artifact.extension==="xlsx"?b.createElement("div",{className:"df-dock-office"},b.createElement(R,{artifact:r.artifact,readOnly:!0,hostControls:!0})):R?b.createElement(pt,{key:r.artifact.id,artifact:r.artifact},b.createElement(R,{artifact:r.artifact,readOnly:!0,hostControls:!0})):b.createElement("p",{role:"status"},"\u6B63\u5728\u6253\u5F00\u9884\u89C8\u2026"),b.createElement("button",{className:"df-dock-ask",onClick:()=>y("assistant")},"\u5C31\u6B64\u6587\u4EF6\u63D0\u95EE \u2192"),b.createElement("button",{className:"df-dock-ask",onClick:()=>V(`/cases/${r.reference.case_id}/outputs/${r.reference.generation_id}/${encodeURIComponent(r.reference.name)}`,r.artifact.title)},"\u4E0B\u8F7D\u5F53\u524D\u6587\u4EF6")):b.createElement("p",{className:"df-dock-empty"},"\u9009\u62E9\u4E00\u4EFD\u6587\u4EF6\uFF0C\u586B\u5199\u4E0E\u9884\u89C8\u53EF\u4EE5\u540C\u65F6\u8FDB\u884C\u3002")))}var Et=window.QwenPaw.host.React;function it({id:n,label:c,items:l,value:h,onChange:g}){return Et.createElement("div",{className:"df-workflow-tabs",role:"tablist","aria-label":c},l.map((m,f)=>Et.createElement("button",{type:"button",role:"tab",key:m.id,className:m.align==="end"?"df-workflow-tab-end":void 0,id:`${n}-tab-${m.id}`,"aria-controls":`${n}-panel-${m.id}`,"aria-selected":h===m.id,tabIndex:h===m.id?0:-1,onClick:()=>g(m.id),onKeyDown:x=>{let d;x.key==="ArrowRight"&&(d=(f+1)%l.length),x.key==="ArrowLeft"&&(d=(f+l.length-1)%l.length),x.key==="Home"&&(d=0),x.key==="End"&&(d=l.length-1),d!==void 0&&(x.preventDefault(),g(l[d].id),x.currentTarget.parentElement.children[d].focus())}},m.label)))}function mt(n){return/^selection\.member\d+_/.test(n.key)?"\u8BBA\u8BC1\u6210\u5458":/^selection\.partner\d+_/.test(n.key)?"\u5019\u9009\u5355\u4F4D":{\u5355\u4F4D\u4E0E\u8054\u7CFB:"\u8054\u7CFB\u4E0E\u8D39\u7528",\u8D39\u7528\u4FE1\u606F:"\u8054\u7CFB\u4E0E\u8D39\u7528",\u65E5\u671F\u5B89\u6392:"\u65F6\u95F4\u4E0E\u5730\u70B9",\u5730\u70B9\u5B89\u6392:"\u65F6\u95F4\u4E0E\u5730\u70B9",\u670D\u52A1\u9009\u5546\u5B9E\u65BD\u65B9\u6848:"\u5B9E\u65BD\u65B9\u6848"}[n.group]||n.group||"\u586B\u5199\u4FE1\u606F"}var j=window.QwenPaw.host.React,{useEffect:Tt,useRef:Ht,useState:Vt}=j;function de({name:n}){return j.createElement("svg",{className:"df-toolbar-icon",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true"},{template:j.createElement(j.Fragment,null,j.createElement("path",{d:"M8 3h8l4 4v13H8z"}),j.createElement("path",{d:"M16 3v5h4M4 7v14M11 12h6M11 16h6"})),import:j.createElement(j.Fragment,null,j.createElement("path",{d:"M5 3h9l5 5v13H5zM14 3v5h5"}),j.createElement("path",{d:"M12 10v8m-3-3 3 3 3-3"})),export:j.createElement(j.Fragment,null,j.createElement("path",{d:"M5 3h9l5 5v13H5zM14 3v5h5"}),j.createElement("path",{d:"M12 18v-8m-3 3 3-3 3 3"})),save:j.createElement(j.Fragment,null,j.createElement("path",{d:"M4 3h13l4 4v14H4zM8 3v6h9V3M8 21v-8h9v8"})),download:j.createElement(j.Fragment,null,j.createElement("path",{d:"M12 3v12M7 10l5 5 5-5M4 16v5h16v-5"})),file:j.createElement(j.Fragment,null,j.createElement("path",{d:"M5 3h10l4 4v14H5zM15 3v5h4M8 12h8M8 16h6"})),settings:j.createElement(j.Fragment,null,j.createElement("path",{d:"M4 6h16M4 12h16M4 18h16"}),j.createElement("circle",{cx:"9",cy:"6",r:"2"}),j.createElement("circle",{cx:"15",cy:"12",r:"2"}),j.createElement("circle",{cx:"9",cy:"18",r:"2"})),calendar:j.createElement(j.Fragment,null,j.createElement("rect",{x:"3",y:"5",width:"18",height:"16",rx:"2"}),j.createElement("path",{d:"M7 3v4M17 3v4M3 11h18M7 15h2M13 15h2"})),more:j.createElement(j.Fragment,null,j.createElement("circle",{cx:"5",cy:"12",r:"1"}),j.createElement("circle",{cx:"12",cy:"12",r:"1"}),j.createElement("circle",{cx:"19",cy:"12",r:"1"})),back:j.createElement("path",{d:"m10 5-7 7 7 7M3 12h18"}),chevron:j.createElement("path",{d:"m7 10 5 5 5-5"})}[n])}function wt({label:n,icon:c,disabled:l,children:h,iconOnly:g=!1}){let m=Ht(null),[f,x]=Vt(!1);return Tt(()=>{let d=r=>{m.current?.contains(r.target)||x(!1)},y=r=>{r.key!=="Escape"||!m.current?.open||(r.preventDefault(),r.stopPropagation(),x(!1),m.current.querySelector("summary").focus())};return document.addEventListener("pointerdown",d),document.addEventListener("keydown",y,!0),()=>{document.removeEventListener("pointerdown",d),document.removeEventListener("keydown",y,!0)}},[]),Tt(()=>{l&&x(!1)},[l]),j.createElement("details",{className:"df-toolbar-menu"+(g?" df-toolbar-menu-more":""),ref:m,open:f},j.createElement("summary",{"aria-label":n,title:n,"aria-disabled":l||void 0,tabIndex:l?-1:0,onClick:d=>{d.preventDefault(),l||x(y=>!y)},onKeyDown:d=>{l&&["Enter"," "].includes(d.key)&&d.preventDefault()}},j.createElement(de,{name:c}),!g&&j.createElement("span",null,n),!g&&j.createElement(de,{name:"chevron"})),f&&j.createElement("div",{className:"df-toolbar-popover",role:"region","aria-label":n+"\u83DC\u5355"},h))}var Ee=window.QwenPaw,e=Ee.host.React,{useState:A,useEffect:Te,useRef:Pe}=e,ct={pending:"\u672A\u5F00\u59CB",in_progress:"\u8FDB\u884C\u4E2D",submitted:"\u5DF2\u63D0\u4EA4",completed:"\u5DF2\u5B8C\u6210"},St={pending:"\u5F85\u51C6\u5907",preparing:"\u6574\u7406\u4E2D",ready:"\u5F85\u63D0\u4EA4",submitted:"\u5DF2\u63D0\u4EA4",done:"\u5DF2\u5B8C\u6210",na:"\u4E0D\u9002\u7528"},Gt=["\u4E0A\u62A5\u8BA1\u5212","\u9009\u5546\u8BBA\u8BC1","\u5546\u52A1\u8C08\u5224","\u5F00\u9898\u8BBA\u8BC1","\u5408\u540C\u5BA1\u67E5","\u7ED3\u9898\u9A8C\u6536","\u5F52\u6863\u4ED8\u6B3E"],Mt=n=>n?new Date(n).toLocaleString("zh-CN",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}):"";function Ye({title:n,children:c,onClose:l,error:h,busy:g=!1}){let m=Pe(null);return Te(()=>{let f=document.activeElement;return m.current?.querySelector("input,select,textarea,button")?.focus(),()=>{f?.isConnected&&f.focus()}},[]),e.createElement("div",{className:"df-dialog-backdrop"},e.createElement("section",{ref:m,className:"df-dialog df-paper",role:"dialog","aria-modal":"true","aria-label":n,onKeyDown:f=>{if(f.key==="Escape"&&!g&&(f.stopPropagation(),l()),f.key==="Tab"){let x=[...m.current.querySelectorAll("button,input,textarea,select,a[href]")].filter(d=>!d.disabled);f.shiftKey&&document.activeElement===x[0]&&(f.preventDefault(),x.at(-1)?.focus()),!f.shiftKey&&document.activeElement===x.at(-1)&&(f.preventDefault(),x[0]?.focus())}}},e.createElement("div",{className:"df-section-head"},e.createElement("h2",null,n),e.createElement("button",{type:"button",disabled:g,onClick:l,"aria-label":"\u5173\u95ED"+n},"\xD7")),h&&e.createElement("p",{role:"alert",className:"df-alert error"},h),c))}function Dt({file:n,projectId:c,download:l,onClose:h,embedded:g=!1}){let[m,f]=A(null),[x,d]=A(""),[y,r]=A(""),P=n.name.split(".").pop().toLowerCase(),_=["pdf","png","jpg","jpeg"].includes(P)&&!Ee.workspace?.loadPreview;Te(()=>{let Q=!0,$;return _?Ee.host.fetch(`/document-forms/projects/${c}/files/${n.id}`).then(async D=>{if(!D.ok)throw new Error("\u9884\u89C8\u672A\u80FD\u6253\u5F00\uFF0C\u8BF7\u4E0B\u8F7D\u67E5\u770B");let s=await D.blob();Q&&($=URL.createObjectURL(new Blob([s],{type:n.mime})),d($))}).catch(D=>Q&&r(D.message)):Ee.workspace?.loadPreview||["doc","docx","xls","xlsx","ppt","pptx"].includes(P)?(Ee.workspace?.loadPreview?Ee.workspace.loadPreview():Promise.resolve(ye)).then(D=>Q&&f(()=>D)).catch(()=>Q&&f(()=>ye)):r("\u6B64\u683C\u5F0F\u8BF7\u4E0B\u8F7D\u540E\u67E5\u770B\u3002"),()=>{Q=!1,$&&URL.revokeObjectURL($)}},[n.id]);let Z={id:n.id,title:n.name,source:"uploaded",extension:P,mimeType:n.mime,binaryUrl:n.preview_url,agentId:Ee.host.getSelectedAgentId?.(),createdAt:Date.parse(n.uploaded_at)};return e.createElement(g?"section":Ye,{...g?{className:"df-dock-preview","aria-label":"\u6587\u4EF6\u9884\u89C8"}:{title:n.name,onClose:h}},g&&e.createElement("h3",null,n.name),e.createElement("div",{className:"df-attachment-preview"},y?e.createElement("p",{role:"alert"},y):_&&x?P==="pdf"?e.createElement("iframe",{title:n.name,src:x,sandbox:"allow-same-origin"}):e.createElement("img",{src:x,alt:n.name}):m?e.createElement(m,{artifact:Z,readOnly:!0,hostControls:!0}):e.createElement("p",{role:"status"},"\u6B63\u5728\u6253\u5F00\u9884\u89C8\u2026")),e.createElement("div",{className:"df-actions"},e.createElement("button",{onClick:()=>l(`/projects/${c}/files/${n.id}`,n.name)},"\u4E0B\u8F7D\u539F\u6587\u4EF6"),e.createElement("button",{onClick:h},"\u5173\u95ED\u9884\u89C8")))}function Lt(){let n=new Date;return`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`}function ut(n,c){if(n.status==="completed")return{kind:"done",text:n.due_date?`\u8BA1\u5212\u65E5\u671F ${n.due_date} \xB7 \u5DF2\u529E\u7ED3`:"\u5DF2\u529E\u7ED3"};if(!n.due_date)return{kind:"unset",text:"\u672A\u8BBE\u7F6E\u8BA1\u5212\u65E5\u671F"};let l=Math.round((Date.parse(n.due_date)-Date.parse(c))/864e5);return Number.isFinite(l)?{kind:l<0?"overdue":l<=3?"soon":"scheduled",text:`${n.due_date} \xB7 ${l<0?`\u5DF2\u903E\u671F ${-l} \u5929`:l===0?"\u4ECA\u5929\u5230\u671F":l<=3?`${l} \u5929\u540E\u5230\u671F`:`\u5269\u4F59 ${l} \u5929`}`}:{kind:"unset",text:"\u8BF7\u68C0\u67E5\u8BA1\u5212\u65E5\u671F"}}function yt({Editor:n,services:c}){let{request:l,json:h,download:g,Field:m}=c,[f,x]=A(Lt);Te(()=>{let a=()=>x(Lt()),p=setInterval(a,6e4);return window.addEventListener("focus",a),()=>{clearInterval(p),window.removeEventListener("focus",a)}},[]);let[d,y]=A([]),[r,P]=A(null),[_,Z]=A("overview"),[O,Q]=A(""),[$,D]=A(null),[s,K]=A(!1),[R,z]=A(!1),[L,q]=A(""),[V,I]=A(0),[w,E]=A("form"),[u,X]=A(null),[S,ee]=A(""),[re,H]=A(""),[M,ke]=A(""),[he,J]=A(null),[T,B]=A({}),[F,Ne]=A([]),[Ue,xe]=A(null),[se,et]=A(!1),[qe,fe]=A(!1),[Qe,ve]=A(()=>{try{let a=Number(window.localStorage.getItem("ugsci.document-forms.right-width"));return Number.isFinite(a)&&a>=300&&a<=3e3?a:500}catch{return 500}}),[ie,te]=A(1200),ge=Pe(null);Te(()=>{let a=ge.current;if(!a||!r?.single_form)return;let p=()=>{let G=a.getBoundingClientRect().width;if(G<=850)return;let Je=a.querySelector(".df-project-sidebar").getBoundingClientRect().width,Ie=Math.max(300,Math.floor(G-Je-(window.innerWidth<=1050?380:440)));te(Ie),ve(At=>Math.min(Ie,Math.max(300,At)))};p();let C=typeof ResizeObserver=="function"?new ResizeObserver(p):null;return C?.observe(a),window.addEventListener("resize",p),()=>{C?.disconnect(),window.removeEventListener("resize",p)}},[se,r?.single_form]),Te(()=>{try{window.localStorage.setItem("ugsci.document-forms.right-width",String(Qe))}catch{}},[Qe]);let Ce=a=>ve(Math.min(ie,Math.max(300,Math.round(a)))),[rt,ae]=A(null),[ot,oe]=A("assistant"),Y=Pe(!0),Ke=Pe(0),Se=Pe(null),He=Pe(null),Me=Pe(""),Ve=Pe(null),_e=Pe(null);_e.current=r?.id,Te(()=>{Ve.current?.scrollTo?.({top:0})},[r?.id,_,$?.id]);let Ge=Ee.host.useTheme?.()||"light",N=r?.stages.find(a=>a.id===_),Be=r?.forms.filter(a=>a.stage_id===_)||[],U=(r?.stages.find(a=>a.id==="plan")?.materials.flatMap(a=>a.files).filter(a=>a.approval_review)||[]).at(-1),Xe=r?.stages.find(a=>a.id==="plan")?.materials.find(a=>/批复|审批|回执/.test(a.name)),tt=()=>!s&&!R||window.confirm("\u8D44\u6599\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\uFF0C\u662F\u5426\u653E\u5F03\u8FD9\u4E9B\u4FEE\u6539\u5E76\u79BB\u5F00\uFF1F");async function De(){let a=await l("/projects");return Y.current&&y(a),a}async function be(a=r?.id,p=!1){let C=a?await l("/projects/"+a):null;return Y.current&&C&&(p||!_e.current||_e.current===a)&&(_e.current!==C.id&&(xe(null),ae(null),oe("assistant")),_e.current=C.id,P(G=>G?.id===C.id&&G.revision>C.revision?G:C)),await De(),C}Te(()=>(Y.current=!0,ee("\u8F7D\u5165\u9879\u76EE"),De().then(async a=>{if(a.length&&Y.current){let p=await l("/projects/"+a[0].id);Y.current&&P(p)}}).catch(a=>Y.current&&H(a.message)).finally(()=>Y.current&&ee("")),()=>{Y.current=!1,Ke.current++}),[]),Te(()=>{let a=p=>{(s||R)&&(p.preventDefault(),p.returnValue="")};return window.addEventListener("beforeunload",a),()=>window.removeEventListener("beforeunload",a)},[s,R]);async function ne(a,p){if(S)return;let C=++Ke.current;ee(a),H(""),ke("");try{await p()}catch(G){Y.current&&C===Ke.current&&H(G.message)}finally{Y.current&&C===Ke.current&&ee("")}}async function ht(a){tt()&&await ne("\u6253\u5F00\u9879\u76EE",async()=>{D(null),K(!1),z(!1),Z("overview"),E("form"),await be(a,!0),D(null),K(!1),z(!1),xe(null),ae(null),oe("assistant"),Z("overview")})}async function Le(a){tt()&&(Z(a),E("form"),D(null),K(!1),z(!1),ke(""),H(""),r.single_form&&r.stages.some(p=>p.id===a)&&await ne("\u6253\u5F00\u9879\u76EE\u8868\u5355",async()=>{let p=await l(`/projects/${r.id}/form`,h({revision:r.revision,stage_id:a}));await be(),D({id:p.id,view:"edit",revision:p.revision,initialDraft:p})}))}function we(a,p){B(p),J(a),H("")}async function le(a,p,C="POST"){let G=await l(a,{...h({...p,revision:r.revision}),method:C});return Y.current&&(P(G),J(null)),await De(),G}function st(a){return ne(a?"\u8BFB\u53D6\u9636\u6BB5 Excel":"\u51C6\u5907\u8C08\u5224\u8868\u5355",async()=>{let p;if(a){let C=new FormData;C.append("revision",r.revision),C.append("stage_id",_),C.append("workbook",a),p=await l(`/projects/${r.id}/${r.single_form?"form":"cases"}/import`,{method:"POST",body:C})}else p=await l(`/projects/${r.id}/${r.single_form?"form":"cases"}`,h({revision:r.revision,stage_id:_}));await be(),D({id:p.id,view:"edit",revision:p.revision,initialDraft:r.single_form?p:void 0}),K(!1),a&&ke(p.templates.length?"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\uFF0C\u5E76\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002":"\u5DF2\u8BFB\u53D6\u672C\u9636\u6BB5\u53D8\u91CF\u914D\u7F6E\uFF0C\u8BF7\u6DFB\u52A0\u5BF9\u5E94\u7684 Word \u6A21\u677F\u3002")})}function lt(a){if(!a)return;let p=Me.current;return ne("\u4FDD\u5B58\u6750\u6599",async()=>{let C=new FormData;C.append("revision",r.revision),C.append("file",a);let G=await l(`/projects/${r.id}/stages/${_}/materials/${p}/files`,{method:"POST",body:C});P(G),await De();let Je=G.stages.find(Ie=>Ie.id===_)?.materials.flatMap(Ie=>Ie.files).find(Ie=>Ie.name===a.name);ke(Je?.approval_review?.status==="ready"?`\u5BA1\u6279\u6587\u4EF6\u5DF2\u4FDD\u5B58\uFF0C\u5E76\u8BC6\u522B\u51FA ${Je.approval_review.fields.length} \u9879\u5BA1\u6279\u7ED3\u679C\u3002`:"\u6750\u6599\u5DF2\u4FDD\u5B58\uFF0C\u539F\u6709\u7248\u672C\u7EE7\u7EED\u4FDD\u7559\u3002\u8BF7\u6838\u5BF9\u540E\u66F4\u65B0\u6750\u6599\u72B6\u6001\u3002")})}let ze=r?`/projects/${r.id}`:"",i=[{id:"form",label:"\u5185\u5BB9\u586B\u5199"},...N?.id==="negotiation"?[{id:"response",label:"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5"}]:[],{id:"materials",label:"\u5BA1\u6279\u8D44\u6599"}],o=a=>{a.preventDefault(),ne("\u4FDD\u5B58\u6750\u6599\u4FE1\u606F",()=>le(`${ze}/stages/${_}/materials${T.id?"/"+T.id:""}`,T,T.id?"PUT":"POST"))},v=a=>ne("\u6574\u7406\u4E0B\u8F7D\u5305",()=>g(ze+"/bundle"+(a?"?stage_id="+a:""),`${r.name}_${a?N.title:"\u5168\u6D41\u7A0B\u6750\u6599"}.zip`));return e.createElement("main",{ref:ge,style:{"--df-dock-size":Qe+"px"},className:"df-app df-project-app"+(r?.single_form?" df-three-column":"")+(se?" df-left-collapsed":"")+(qe?" df-right-collapsed":""),"data-theme":Ge},e.createElement("style",null,_t+zt),e.createElement("input",{ref:Se,type:"file",accept:".xlsx",hidden:!0,"aria-label":"\u5BFC\u5165\u9636\u6BB5 Excel",onChange:a=>{let p=a.target.files[0];a.target.value="",p&&st(p)}}),e.createElement("input",{ref:He,type:"file",accept:".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.png,.jpg,.jpeg,.zip,.txt,.csv",hidden:!0,"aria-label":"\u4E0A\u4F20\u9636\u6BB5\u6750\u6599",onChange:a=>{let p=a.target.files[0];a.target.value="",lt(p)}}),e.createElement("aside",{className:"df-sidebar df-project-sidebar"+(se?" df-pane-collapsed":""),"aria-label":"\u9879\u76EE\u9009\u62E9"},e.createElement("button",{className:"df-pane-toggle","aria-label":se?"\u5C55\u5F00\u9879\u76EE\u680F":"\u6536\u8D77\u9879\u76EE\u680F","aria-expanded":!se,title:se?"\u5C55\u5F00\u9879\u76EE\u680F":"\u6536\u8D77\u9879\u76EE\u680F",onClick:()=>et(a=>!a)},e.createElement("span",{"aria-hidden":"true"},se?"\u203A":"\u2039"),e.createElement("span",null,se?"\u9879\u76EE":"\u6536\u8D77")),e.createElement("div",{className:"df-brand"},"\u5916\u534F\u52A9\u624B"),e.createElement("button",{className:"df-primary df-new",disabled:!!S||!!L,onClick:()=>{tt()&&we("create",{name:"",code:"",owner:""})}},"\uFF0B \u65B0\u5EFA\u9879\u76EE"),e.createElement("label",{className:"df-project-search"},e.createElement("span",{className:"df-sr-only"},"\u641C\u7D22\u9879\u76EE"),e.createElement("input",{"aria-label":"\u641C\u7D22\u9879\u76EE",placeholder:"\u641C\u7D22\u9879\u76EE\u540D\u79F0\u6216\u7F16\u53F7",value:O,onChange:a=>Q(a.target.value)})),e.createElement("div",{className:"df-caption"},"\u6211\u7684\u9879\u76EE ",e.createElement("span",null,d.length)),e.createElement("nav",{"aria-label":"\u9879\u76EE\u5217\u8868"},d.filter(a=>(a.name+" "+a.code).toLowerCase().includes(O.trim().toLowerCase())).map(a=>e.createElement("button",{key:a.id,disabled:!!S||!!L,"aria-current":r?.id===a.id?"page":void 0,onClick:()=>ht(a.id)},e.createElement("b",null,a.name),e.createElement("small",null,a.code||"\u672A\u8BBE\u7F16\u53F7"," \xB7 ",a.completed,"/7 \u9636\u6BB5\u5B8C\u6210")))),O.trim()&&!d.some(a=>(a.name+" "+a.code).toLowerCase().includes(O.trim().toLowerCase()))&&e.createElement("div",{className:"df-search-empty",role:"status"},e.createElement("p",null,"\u672A\u627E\u5230\u9879\u76EE"),e.createElement("button",{onClick:()=>Q("")},"\u6E05\u9664\u641C\u7D22")),e.createElement("div",{className:"df-sidebar-foot",hidden:!!(r?.single_form&&N&&$)},e.createElement("button",{disabled:!!S||!!L,onClick:()=>ne("\u4E0B\u8F7D\u914D\u5957\u6A21\u677F",()=>g("/starter","\u6587\u4E66\u586B\u62A5_\u914D\u5957\u6A21\u677F.zip"))},"\u4E0B\u8F7D\u914D\u5957\u6A21\u677F \u2197"))),e.createElement("section",{className:"df-main df-project-main",ref:Ve},e.createElement("header",{className:"df-header"},e.createElement("div",null,e.createElement("h1",null,r?.name||"\u9879\u76EE\u5DE5\u4F5C\u53F0"),e.createElement("p",null,r?[r.code||"\u672A\u8BBE\u9879\u76EE\u7F16\u53F7",r.owner&&"\u7ECF\u529E\u4EBA\uFF1A"+r.owner].filter(Boolean).join("\u3000\xB7\u3000"):"\u7BA1\u7406\u5916\u534F\u9879\u76EE\u3001\u9636\u6BB5\u6750\u6599\u4E0E\u529E\u7406\u8FDB\u5EA6\u3002")),r&&e.createElement("div",{className:"df-actions"},e.createElement("button",{disabled:!!S||!!L,onClick:()=>Le("profile")},"\u57FA\u7840\u4FE1\u606F\u586B\u62A5"),e.createElement("button",{disabled:!!S||!!L,onClick:()=>v()},"\u4E0B\u8F7D\u9879\u76EE\u6750\u6599"))),re&&e.createElement("div",{role:"alert",className:"df-alert error"},re,e.createElement("button",{"aria-label":"\u5173\u95ED\u9519\u8BEF\u63D0\u793A",onClick:()=>H("")},"\xD7")),M&&e.createElement("div",{className:"df-alert",role:"status"},M),S&&e.createElement("div",{className:"df-progress",role:"status"},S,"\u2026"),r?e.createElement(e.Fragment,null,e.createElement("nav",{className:"df-project-tabs","aria-label":"\u9879\u76EE\u9636\u6BB5"},e.createElement("button",{className:_==="overview"?"active":"",disabled:!!S||!!L,onClick:()=>Le("overview")},"\u9879\u76EE\u603B\u89C8"),r.stages.map((a,p)=>e.createElement("button",{key:a.id,"aria-current":_===a.id?"step":void 0,className:_===a.id?"active":"",disabled:!!S||!!L,onClick:()=>Le(a.id)},e.createElement("small",null,String(p+1).padStart(2,"0"))," ",a.title,e.createElement("span",{className:"df-state df-state-"+a.status},a.upstream_changed.length||a.documents_changed?"\u5F85\u590D\u6838":ct[a.status])))),e.createElement("fieldset",{className:"df-content",disabled:!!S||!!L},_==="overview"&&e.createElement(e.Fragment,null,r.migrated&&e.createElement("p",{className:"df-muted df-migration-note"},"\u5386\u53F2\u586B\u62A5\u5DF2\u6309\u9879\u76EE\u540D\u79F0\u6216\u7F16\u53F7\u5F52\u5165\u5546\u52A1\u8C08\u5224\u9636\u6BB5\uFF0C\u539F\u8868\u5355\u3001\u751F\u6210\u6279\u6B21\u548C\u6587\u4EF6\u5747\u4FDD\u7559\u3002"),e.createElement("section",{className:"df-project-metrics"},e.createElement("div",null,e.createElement("b",null,r.stages.filter(a=>a.status==="completed").length,e.createElement("small",null,"/ ",r.stages.length)),e.createElement("span",null,"\u5DF2\u5B8C\u6210\u9636\u6BB5")),e.createElement("div",null,e.createElement("b",null,r.stages.reduce((a,p)=>a+p.materials.filter(C=>!["done","na"].includes(C.status)).length,0)),e.createElement("span",null,"\u5F85\u6574\u7406\u6750\u6599")),e.createElement("div",null,e.createElement("b",null,r.forms.reduce((a,p)=>a+p.outputs,0)),e.createElement("span",null,"\u5DF2\u751F\u6210\u6587\u4EF6")),e.createElement("div",null,e.createElement("b",null,r.stages.filter(a=>a.upstream_changed.length||a.documents_changed).length),e.createElement("span",null,"\u5F85\u590D\u6838\u9636\u6BB5"))),e.createElement("div",{className:"df-project-stage-grid"},r.stages.map((a,p)=>e.createElement("button",{className:"df-paper df-stage-card",key:a.id,onClick:()=>Le(a.id)},e.createElement("div",{className:"df-section-head"},e.createElement("small",null,"\u9636\u6BB5 ",String(p+1).padStart(2,"0")),e.createElement("span",{className:"df-state df-state-"+a.status},a.upstream_changed.length||a.documents_changed?"\u5F85\u590D\u6838":ct[a.status])),e.createElement("h2",null,a.title),e.createElement("p",null,a.purpose),e.createElement("span",{className:"df-deadline "+ut(a,f).kind},ut(a,f).text),e.createElement("footer",null,e.createElement("span",null,a.materials.filter(C=>["done","na"].includes(C.status)).length,"/",a.materials.length," \u9879\u6750\u6599\u5DF2\u5904\u7406"),e.createElement("span",null,a.upstream_changed.length||a.documents_changed?"\u6709\u53D8\u66F4\u5F85\u590D\u6838":a.due_date?"\u8BA1\u5212 "+a.due_date:"\u8FDB\u5165\u9636\u6BB5 \u2192"))))),e.createElement("section",{className:"df-paper df-project-hint"},e.createElement("h2",null,"\u4E00\u4EFD\u9879\u76EE\u5E95\u7A3F\uFF0C\u8D2F\u7A7F\u5404\u9636\u6BB5"),e.createElement("p",null,"\u9879\u76EE\u540D\u79F0\u3001\u7814\u7A76\u5185\u5BB9\u3001\u6210\u679C\u6307\u6807\u548C\u9884\u7B97\u7B49\u53EF\u5728\u201C\u57FA\u7840\u4FE1\u606F\u586B\u62A5\u201D\u7EDF\u4E00\u7EF4\u62A4\u3002\u9636\u6BB5\u8868\u5355\u4ECE\u5E95\u7A3F\u53D6\u503C\uFF0C\u540E\u7EED\u53D8\u66F4\u4F1A\u63D0\u9192\u6838\u5BF9\uFF1B\u5DF2\u6709\u751F\u6210\u6587\u4EF6\u4FDD\u7559\u539F\u6837\u3002"),e.createElement("button",{onClick:()=>Le("profile")},"\u586B\u5199\u57FA\u7840\u4FE1\u606F"))),_==="profile"&&e.createElement(Xt,{onDirtyChange:z,key:r.id+":"+r.revision,project:r,Field:m,onSave:a=>ne("\u4FDD\u5B58\u57FA\u7840\u4FE1\u606F",async()=>{await le(ze,a,"PUT"),ke("\u57FA\u7840\u4FE1\u606F\u5DF2\u66F4\u65B0\u3002\u5DF2\u6709\u8868\u5355\u53EF\u9010\u9879\u6838\u5BF9\u540E\u540C\u6B65\uFF0C\u539F\u751F\u6210\u6587\u4EF6\u4E0D\u53D8\u3002")})}),N&&e.createElement(e.Fragment,null,e.createElement("section",{className:"df-paper df-stage-header"},e.createElement("div",{className:"df-stage-top-row"},e.createElement("div",{className:"df-stage-heading"},e.createElement("h2",null,N.title),!r.single_form&&e.createElement("details",{className:"df-stage-help"},e.createElement("summary",null,"\u672C\u9636\u6BB5\u529E\u7406\u8BF4\u660E"),e.createElement("p",null,r.single_form&&N.id==="plan"?"\u5DF2\u63A5\u5165\u79D1\u7814\u8BA1\u5212\u586B\u62A5\u8868\u4E0E\u5916\u534F\u5FC5\u8981\u6027\u8BF4\u660E\uFF0C\u53EF\u76F4\u63A5\u586B\u5199\u5E76\u751F\u6210\u3002":N.id==="selection"?"\u5DF2\u63A5\u5165\u8BBA\u8BC1\u610F\u89C1\u53CA\u7B7E\u5B57\u8868\u4E0E\u975E\u62DB\u6807\u65B9\u6848\u586B\u62A5\u8868\uFF0C\u53EF\u5148\u51C6\u5907\u8BBA\u8BC1\u6750\u6599\uFF0C\u8BBA\u8BC1\u7ED3\u675F\u540E\u6838\u5BF9\u7CFB\u7EDF\u586B\u62A5\u4FE1\u606F\u3002":N.id==="negotiation"?"\u4E94\u4EFD\u6807\u51C6\u6A21\u677F\u5DF2\u63A5\u5165\uFF0C\u53EF\u76F4\u63A5\u586B\u5199\uFF0C\u4E5F\u53EF\u5BFC\u5165\u73B0\u6709 Excel\u3002":"\u7EDF\u4E00\u6A21\u677F\u5F85\u8865\u5145\uFF0C\u53EF\u4E0A\u4F20\u9636\u6BB5\u6750\u6599\uFF0C\u6216\u5BFC\u5165 Excel \u4E0E Word \u6A21\u677F\u3002"))),e.createElement("div",{className:"df-stage-toolbar",role:"toolbar","aria-label":"\u9636\u6BB5\u5DE5\u5177\u680F"},e.createElement("div",{className:"df-stage-tool-slot",ref:X}),(!r.single_form||!$||!Ee.host.ReactDOM?.createPortal)&&e.createElement("div",{className:"df-toolbar-file-actions"},e.createElement("button",{"aria-label":"\u4E0B\u8F7D\u672C\u9636\u6BB5\u6750\u6599",title:"\u4E0B\u8F7D\u672C\u9636\u6BB5\u6750\u6599",onClick:()=>v(N.id)},e.createElement(de,{name:"download"}),"\u9636\u6BB5\u6750\u6599")))),e.createElement("div",{className:"df-stage-bottom-row"},e.createElement(it,{id:"df-node",label:"\u9636\u6BB5\u529E\u7406\u6D41\u7A0B",items:i,value:w,onChange:a=>{E(a),a==="form"&&w==="form"&&I(p=>p+1),document.getElementById("df-node-tab-"+a)?.closest(".df-stage-header")?.scrollIntoView?.({block:"start"})}}),e.createElement("div",{className:"df-node-status","aria-label":"\u8282\u70B9\u529E\u7406\u6982\u51B5"},e.createElement("button",{className:"df-stage-state df-state df-state-"+N.status,disabled:s,"aria-label":"\u529E\u7406\u4FE1\u606F\u4E0E\u72B6\u6001",title:s?"\u8BF7\u5148\u4FDD\u5B58\u586B\u5199\u5185\u5BB9\uFF0C\u518D\u66F4\u65B0\u529E\u7406\u72B6\u6001":"\u529E\u7406\u4FE1\u606F\u4E0E\u72B6\u6001",onClick:()=>we("stage",{...N,confirmed:!1})},e.createElement("span",{className:"df-state-dot","aria-hidden":"true"}),ct[N.status],e.createElement(de,{name:"chevron"})),e.createElement("span",{className:"df-deadline "+ut(N,f).kind},e.createElement(de,{name:"calendar"}),ut(N,f).text),e.createElement("span",{className:"df-stage-approval-count"},"\u5BA1\u6279\u8D44\u6599"," ",N.materials.filter(a=>a.files.length).length,"/",N.materials.length)))),(N.upstream_changed.length>0||N.documents_changed)&&e.createElement("div",{className:"df-alert df-stage-warning"},e.createElement("div",null,e.createElement("b",null,"\u672C\u9636\u6BB5\u6709\u8D44\u6599\u9700\u8981\u590D\u6838"),e.createElement("p",null,N.upstream_changed.length>0&&"\u524D\u5E8F\u9636\u6BB5\u5DF2\u66F4\u65B0\uFF1A"+N.upstream_changed.join("\u3001")+"\u3002",N.documents_changed&&"\u672C\u9636\u6BB5\u8868\u5355\u6216\u751F\u6210\u6587\u4EF6\u6709\u66F4\u65B0\u3002","\u8BF7\u6838\u5BF9\u5DF2\u63D0\u4EA4\u7684\u6750\u6599\u662F\u5426\u9700\u8981\u8C03\u6574\u3002")),e.createElement("button",{onClick:()=>ne("\u8BB0\u5F55\u590D\u6838",()=>le(`${ze}/stages/${N.id}/acknowledge`,{}))},"\u5DF2\u6838\u5BF9\u53D8\u66F4")),(N.system_name||N.submission_ref||N.notes)&&e.createElement("section",{className:"df-paper df-stage-details"},e.createElement("dl",null,e.createElement("div",null,e.createElement("dt",null,"\u529E\u7406\u7CFB\u7EDF"),e.createElement("dd",null,N.system_url?e.createElement("a",{href:N.system_url,target:"_blank",rel:"noopener noreferrer"},N.system_name||"\u6253\u5F00\u529E\u7406\u7CFB\u7EDF"," \u2197"):N.system_name||"\u672A\u8BB0\u5F55")),e.createElement("div",null,e.createElement("dt",null,"\u63D0\u4EA4\u7F16\u53F7 / \u56DE\u6267"),e.createElement("dd",null,N.submission_ref||"\u672A\u8BB0\u5F55"))),N.notes&&e.createElement("p",null,N.notes)),e.createElement("div",{id:"df-node-panel-form",role:"tabpanel","aria-labelledby":"df-node-tab-form",hidden:w!=="form"},e.createElement("div",{id:"df-node-form"},$&&e.createElement(n,{key:r.id+":"+$.id+":"+_+":"+($.revision||""),project:r,workflowStage:N,initialCaseId:$.id,initialView:$.view,editRequest:V,initialDraft:$.initialDraft,onDirtyChange:K,onBusyChange:q,onViewChange:()=>document.getElementById("df-node-form")?.scrollIntoView?.({block:"start"}),onBack:()=>{D(null),K(!1),be().catch(a=>H(a.message))},onChanged:()=>be(),docked:r.single_form,toolbarTarget:u,onShowForm:()=>E("form"),onDownloadStageMaterials:()=>v(N.id),onEditBasics:()=>{D(null),K(!1),q(""),Z("profile")},onStageStatus:()=>we("stage",{...N,confirmed:!1}),onPreview:a=>{ae(a),xe(null),oe("preview")}})),!$&&e.createElement("section",{className:"df-paper df-stage-forms"},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,r.single_form?"\u9879\u76EE\u8868\u5355":"\u586B\u5199\u4E0E\u751F\u6210"),e.createElement("p",{className:"df-muted"},"\u8868\u5355\u6CBF\u7528\u9879\u76EE\u5E95\u7A3F\uFF0C\u6838\u5BF9\u540E\u751F\u6210\u3002\u5DF2\u6709\u6279\u6B21\u4FDD\u7559\u751F\u6210\u65F6\u7684\u5185\u5BB9\u3002")),e.createElement("div",{className:"df-actions"},(N.id==="negotiation"||r.single_form)&&e.createElement("button",{className:"df-primary",onClick:()=>st()},r.single_form?"\u6253\u5F00\u9879\u76EE\u8868\u5355":"\u586B\u5199\u8C08\u5224\u6750\u6599"),e.createElement("button",{onClick:()=>Se.current.click()},"\u5BFC\u5165 Excel \u8868\u5355"))),r.single_form?e.createElement("p",{className:"df-muted"},"\u6BCF\u4E2A\u9879\u76EE\u5171\u7528\u4E00\u4EFD\u8868\u5355\uFF0C\u4E03\u4E2A\u9636\u6BB5\u5404\u529E\u7406\u4E00\u6B21\u3002\u5DF2\u6709\u6587\u4E66\u4E0E\u5386\u53F2\u5E95\u7A3F\u53EF\u5728\u53F3\u4FA7\u67E5\u770B\u3002"):Be.length?e.createElement("div",{className:"df-project-forms"},Be.map(a=>e.createElement("div",{key:a.case_id},e.createElement("div",null,e.createElement("b",null,a.name),e.createElement("small",null,Mt(a.updated_at)," \xB7"," ",a.outputs?a.outputs+" \u4EFD\u6587\u4EF6":"\u586B\u5199\u4E2D",a.shared_changes.length>0&&" \xB7 \u57FA\u7840\u4FE1\u606F\u6709\u66F4\u65B0")),e.createElement("div",{className:"df-actions"},e.createElement("button",{onClick:()=>D({id:a.case_id,view:"edit"})},"\u6253\u5F00\u8868\u5355"),a.outputs>0&&e.createElement("button",{onClick:()=>D({id:a.case_id,view:"files"})},"\u67E5\u770B\u751F\u6210\u6587\u4EF6"))))):e.createElement("p",{className:"df-empty"},"\u672C\u9636\u6BB5\u8FD8\u6CA1\u6709\u8868\u5355\u3002\u5DF2\u6709\u6210\u54C1\u6587\u4EF6\u53EF\u76F4\u63A5\u4E0A\u4F20\u5230\u4E0B\u9762\u7684\u6750\u6599\u6E05\u5355\u3002"))),N.id==="negotiation"&&e.createElement("section",{className:"df-paper df-review-entry",role:"tabpanel",id:"df-node-panel-response","aria-labelledby":"df-node-tab-response",hidden:w!=="response"},e.createElement("div",null,e.createElement("h2",null,"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5"),e.createElement("p",{className:"df-muted"},"\u5BF9\u7167\u6B63\u5F0F\u8C08\u5224\u6587\u4EF6\uFF0C\u68C0\u67E5\u5404\u5355\u4F4D\u54CD\u5E94\u6750\u6599\uFF0C\u6C47\u603B\u95EE\u9898\u3001\u4F9D\u636E\u548C\u5F85\u786E\u8BA4\u4E8B\u9879\u3002")),e.createElement("button",{onClick:()=>r.single_form?oe("review"):we("response-review",{})},"\u6253\u5F00\u6838\u67E5\u667A\u80FD\u4F53 \u2192")),e.createElement("div",{role:"tabpanel",id:"df-node-panel-materials","aria-labelledby":"df-node-tab-materials",hidden:w!=="materials"},N.id==="plan"&&e.createElement("section",{className:"df-paper df-approval-entry"},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,"\u8BA1\u5212\u5BA1\u6279\u7ED3\u679C\u6838\u5BF9"),e.createElement("p",{className:"df-muted"},"\u4E0A\u4F20\u6B63\u5F0F\u5BA1\u6279 PDF \u540E\uFF0C\u6309\u660E\u786E\u5B57\u6BB5\u4E0E\u5F53\u524D\u8D44\u6599\u6BD4\u5BF9\u3002\u66F4\u6B63\u524D\u4F1A\u9010\u9879\u786E\u8BA4\u3002")),e.createElement("div",{className:"df-actions"},U?.approval_review?.status==="ready"&&e.createElement("button",{onClick:()=>{let a=U.approval_review.fields.filter(p=>p.changed).map(p=>p.key);Ne(a),J("approval")}},"\u67E5\u770B\u6BD4\u5BF9\u7ED3\u679C \u2192"),e.createElement("button",{disabled:!Xe,onClick:()=>{Me.current=Xe.id,He.current.click()}},"\u4E0A\u4F20\u5BA1\u6279\u6587\u4EF6"))),U?U.approval_review.status==="ready"?e.createElement("p",null,"\u6279\u590D\u65E5\u671F"," ",U.approval_review.approved_at," \xB7 \u5DF2\u8BC6\u522B"," ",U.approval_review.fields.length," \u9879 \xB7",U.approval_review.change_count?`\u53D1\u73B0 ${U.approval_review.change_count} \u9879\u5DEE\u5F02`:"\u4E0E\u5F53\u524D\u8D44\u6599\u4E00\u81F4"):e.createElement("p",{role:"status"},U.approval_review.message):e.createElement("p",null,"\u8BF7\u5728\u4E0B\u65B9\u201C\u8BA1\u5212\u6279\u590D\u6216\u7CFB\u7EDF\u56DE\u6267\u201D\u4E2D\u4E0A\u4F20\u5BA1\u6279\u6587\u4EF6\u3002")),e.createElement("section",{className:"df-paper df-material-panel",id:"df-node-materials"},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,r.single_form?"\u5BA1\u6279\u8D44\u6599\u4E0E\u9644\u4EF6":"\u6750\u6599\u6E05\u5355"," ",e.createElement("small",null,N.materials.length)),e.createElement("p",{className:"df-muted"},"\u4E0A\u4F20\u5BA1\u6279\u4EF6\u3001\u7B7E\u7AE0\u4EF6\u548C\u56DE\u6267\uFF1B\u6587\u4EF6\u4EC5\u5F52\u6863\uFF0C\u4E0D\u81EA\u52A8\u4FEE\u6539\u8868\u5355\u3002")),e.createElement("button",{onClick:()=>we("material",{name:"",status:"pending",required:!1,note:""})},"\uFF0B \u6DFB\u52A0\u6750\u6599")),e.createElement("div",{className:"df-materials"},N.materials.map(a=>{let p=Be.reduce((C,G)=>C+(G.generations[0]?.files.filter(Je=>Je.name.includes(a.name)).length||0),0);return e.createElement("article",{className:"df-material-row",key:a.id},e.createElement("div",{className:"df-material-name"},e.createElement("b",null,a.name),a.required&&e.createElement("span",{className:"df-required-tag"},"\u5FC5\u5907"),e.createElement("span",{className:"df-state df-material-state-"+a.status},St[a.status]),p>0&&e.createElement("small",null,"\u5DF2\u6709 ",p," \u4EFD\u751F\u6210\u7A3F \xB7 \u5728\u4E0A\u65B9\u8868\u5355\u67E5\u770B"),a.note&&e.createElement("p",null,a.note)),e.createElement("div",{className:"df-material-files"},a.files.length>0?e.createElement("details",null,e.createElement("summary",null,a.files.length," \u4EFD\u6587\u4EF6 / \u7248\u672C \xB7 \u6700\u65B0\uFF1A",a.files[a.files.length-1].name),[...a.files].reverse().map((C,G)=>e.createElement("div",{className:"df-material-file",key:C.id},e.createElement("div",null,e.createElement("b",null,"V",a.files.length-G," \xB7"," ",C.name),e.createElement("small",null,Mt(C.uploaded_at)," \xB7"," ",Math.max(1,Math.round(C.size/1024))," ","KB")),e.createElement("button",{onClick:()=>{xe(C),ae({artifact:{title:C.name},reference:{file_id:C.id}}),oe("preview")}},"\u9884\u89C8"),e.createElement("button",{"aria-label":"\u4E0B\u8F7D"+C.name+"\u7248\u672C"+(a.files.length-G),onClick:()=>ne("\u4E0B\u8F7D\u6750\u6599",()=>g(`${ze}/files/${C.id}`,C.name))},"\u4E0B\u8F7D")))):e.createElement("span",{className:"df-muted"},"\u5C1A\u672A\u4E0A\u4F20\u6587\u4EF6")),e.createElement("div",{className:"df-actions"},e.createElement("button",{"aria-label":"\u4E0A\u4F20"+a.name,onClick:()=>{Me.current=a.id,He.current.click()}},"\u4E0A\u4F20\u6587\u4EF6"),e.createElement("button",{"aria-label":"\u7F16\u8F91"+a.name,onClick:()=>we("material",{...a})},"\u7F16\u8F91")))})))),!r.single_form&&e.createElement("div",{className:"df-stage-tail"},e.createElement("p",null,"\u5404\u9636\u6BB5\u53EF\u5E76\u884C\u51C6\u5907\uFF1B\u524D\u5E8F\u8D44\u6599\u53D8\u5316\u540E\uFF0C\u540E\u7EED\u9636\u6BB5\u4F1A\u63D0\u793A\u590D\u6838\u3002\u9636\u6BB5\u5B8C\u6210\u7531\u7ECF\u529E\u4EBA\u786E\u8BA4\u3002"),e.createElement("button",{onClick:()=>we("stage",{...N,confirmed:!1})},"\u66F4\u65B0\u529E\u7406\u72B6\u6001"))))):e.createElement("section",{className:"df-paper df-project-welcome"},e.createElement("h2",null,"\u5148\u5EFA\u4E00\u4E2A\u9879\u76EE"),e.createElement("p",null,"\u586B\u5199\u57FA\u7840\u4FE1\u606F\u540E\uFF0C\u9009\u62E9\u9636\u6BB5\u529E\u7406\u3002"),e.createElement("div",{className:"df-welcome-stages"},Gt.map((a,p)=>e.createElement("span",{key:a},e.createElement("small",null,String(p+1).padStart(2,"0")),a))),e.createElement("button",{className:"df-primary",onClick:()=>we("create",{name:"",code:"",owner:""})},"\u5EFA\u7ACB\u7B2C\u4E00\u4E2A\u9879\u76EE"))),r?.single_form&&e.createElement(vt,{key:r.id,collapsed:qe,width:Qe,maxWidth:ie,onResize:Ce,onToggle:()=>fe(a=>!a),project:r,stageId:_,services:c,mode:ot,onMode:oe,selection:rt,attachment:Ue,AttachmentPreview:Dt,dirty:s,onSelect:a=>{ae(a),xe(null),oe("preview")},onChanged:()=>be().catch(a=>H(a.message))}),he==="response-review"&&e.createElement(Ye,{title:"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5",onClose:()=>{J(null),be().catch(a=>H(a.message))}},e.createElement(at,{project:r,services:c,onChanged:()=>be().catch(a=>H(a.message))})),he==="approval"&&U&&e.createElement(Ye,{title:"\u6838\u5BF9\u8BA1\u5212\u5BA1\u6279\u7ED3\u679C",busy:!!S,error:re,onClose:()=>J(null)},e.createElement("p",{className:"df-muted"},"\u6765\u6E90\uFF1A",U.name," \xB7 \u6279\u590D\u65E5\u671F"," ",U.approval_review.approved_at,"\u3002\u4EC5\u52FE\u9009\u7684\u5DEE\u5F02\u4F1A\u5199\u56DE\u9879\u76EE\u8D44\u6599\u548C\u4E0A\u62A5\u8BA1\u5212\u8868\u5355\u3002"),e.createElement("div",{className:"df-compare df-approval-compare"},U.approval_review.fields.map(a=>e.createElement("label",{key:a.key},e.createElement("input",{type:"checkbox","aria-label":"\u91C7\u7528\u5BA1\u6279\u7ED3\u679C\uFF1A"+a.label,disabled:!a.changed,checked:F.includes(a.key),onChange:p=>Ne(p.target.checked?[...F,a.key]:F.filter(C=>C!==a.key))}),e.createElement("div",null,e.createElement("b",null,a.label,!a.changed&&e.createElement("small",null," \u4E00\u81F4")),e.createElement("div",{className:"df-compare-values"},e.createElement("p",null,e.createElement("small",null,"\u5F53\u524D\u8D44\u6599"),a.current||"\u7A7A\u767D"),e.createElement("p",null,e.createElement("small",null,"\u5BA1\u6279\u7ED3\u679C"),a.value||"\u7A7A\u767D")))))),s&&e.createElement("p",{role:"status"},"\u8BF7\u5148\u4FDD\u5B58\u586B\u5199\u5185\u5BB9\uFF0C\u518D\u91C7\u7528\u5BA1\u6279\u7ED3\u679C\u3002"),e.createElement("div",{className:"df-actions"},e.createElement("button",{disabled:!!S,onClick:()=>J(null)},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!S||!!L||s||!F.length,onClick:()=>ne("\u91C7\u7528\u5BA1\u6279\u7ED3\u679C",async()=>{let a=await l(`${ze}/stages/plan/approval/apply`,h({revision:r.revision,file_id:U.id,keys:F}));if(P(a),$){let p=await l(`/cases/${$.id}`);D({...$,initialDraft:p,revision:p.revision})}J(null),Ne([]),await De(),ke("\u5DF2\u91C7\u7528\u6240\u9009\u5BA1\u6279\u7ED3\u679C\u3002\u540E\u7EED\u9636\u6BB5\u4F1A\u63D0\u793A\u91CD\u65B0\u6838\u5BF9\u53D7\u5F71\u54CD\u8D44\u6599\u3002")})},"\u91C7\u7528\u6240\u9009 ",F.length," \u9879"))),he==="create"&&e.createElement(Ye,{title:"\u65B0\u5EFA\u9879\u76EE",busy:!!S,error:re,onClose:()=>J(null)},e.createElement("form",{onSubmit:a=>{a.preventDefault(),ne("\u5EFA\u7ACB\u9879\u76EE",async()=>{let p=await l("/projects",h(T));xe(null),ae(null),oe("assistant"),P(p),Z("overview"),D(null),K(!1),J(null),await De()})}},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u540D\u79F0"),e.createElement("input",{"aria-label":"\u65B0\u9879\u76EE\u540D\u79F0",required:!0,maxLength:120,value:T.name,onChange:a=>B({...T,name:a.target.value})})),e.createElement("div",{className:"df-fields"},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u7F16\u53F7"),e.createElement("input",{"aria-label":"\u65B0\u9879\u76EE\u7F16\u53F7",maxLength:100,value:T.code,onChange:a=>B({...T,code:a.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u7ECF\u529E\u4EBA"),e.createElement("input",{"aria-label":"\u65B0\u9879\u76EE\u7ECF\u529E\u4EBA",maxLength:100,value:T.owner,onChange:a=>B({...T,owner:a.target.value})}))),e.createElement("p",{className:"df-muted"},"\u5EFA\u7ACB\u9879\u76EE\u540E\uFF0C\u53EF\u6574\u7406\u5171\u7528\u8D44\u6599\uFF0C\u518D\u6309\u4E03\u4E2A\u9636\u6BB5\u51C6\u5907\u6750\u6599\u3002"),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",disabled:!!S||!!L,onClick:()=>J(null)},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!S||!T.name?.trim(),type:"submit"},"\u5EFA\u7ACB\u9879\u76EE")))),he==="material"&&e.createElement(Ye,{title:"\u6750\u6599\u4FE1\u606F",busy:!!S,error:re,onClose:()=>J(null)},e.createElement("form",{onSubmit:o},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u6750\u6599\u540D\u79F0"),e.createElement("input",{"aria-label":"\u6750\u6599\u540D\u79F0",required:!0,maxLength:150,value:T.name,onChange:a=>B({...T,name:a.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u6750\u6599\u72B6\u6001"),e.createElement("select",{"aria-label":"\u6750\u6599\u72B6\u6001",value:T.status,onChange:a=>B({...T,status:a.target.value})},Object.entries(St).map(([a,p])=>e.createElement("option",{key:a,value:a},p)))),e.createElement("label",{className:"df-checkbox"},e.createElement("input",{type:"checkbox",checked:T.required,onChange:a=>B({...T,required:a.target.checked})}),"\u672C\u9879\u76EE\u7684\u5FC5\u5907\u6750\u6599\uFF0C\u9636\u6BB5\u5B8C\u6210\u524D\u9700\u786E\u8BA4\u5DF2\u5B8C\u6210\u6216\u4E0D\u9002\u7528"),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u6750\u6599\u8BF4\u660E"),e.createElement("textarea",{"aria-label":"\u6750\u6599\u8BF4\u660E",rows:3,maxLength:3e3,value:T.note,onChange:a=>B({...T,note:a.target.value})})),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",onClick:()=>J(null),disabled:!!S||!!L},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!S||!!L,type:"submit"},"\u4FDD\u5B58\u6750\u6599\u4FE1\u606F")))),he==="stage"&&e.createElement(Ye,{title:N.title+"\u529E\u7406\u4FE1\u606F",busy:!!S,error:re,onClose:()=>J(null)},e.createElement("form",{onSubmit:a=>{a.preventDefault(),ne("\u4FDD\u5B58\u529E\u7406\u4FE1\u606F",()=>le(`${ze}/stages/${_}`,T,"PUT"))}},e.createElement("div",{className:"df-fields"},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9636\u6BB5\u72B6\u6001"),e.createElement("select",{"aria-label":"\u9636\u6BB5\u72B6\u6001",value:T.status,onChange:a=>B({...T,status:a.target.value})},Object.entries(ct).map(([a,p])=>e.createElement("option",{key:a,value:a},p)))),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u8BA1\u5212\u65E5\u671F"),e.createElement("input",{"aria-label":"\u9636\u6BB5\u8BA1\u5212\u65E5\u671F",type:"date",value:T.due_date,onChange:a=>B({...T,due_date:a.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u529E\u7406\u7CFB\u7EDF"),e.createElement("input",{"aria-label":"\u529E\u7406\u7CFB\u7EDF",maxLength:150,value:T.system_name,onChange:a=>B({...T,system_name:a.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u7CFB\u7EDF\u5730\u5740"),e.createElement("input",{"aria-label":"\u7CFB\u7EDF\u5730\u5740",type:"url",placeholder:"https://",maxLength:1e3,value:T.system_url,onChange:a=>B({...T,system_url:a.target.value})}))),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u63D0\u4EA4\u7F16\u53F7 / \u56DE\u6267\u4FE1\u606F"),e.createElement("input",{"aria-label":"\u63D0\u4EA4\u7F16\u53F7",maxLength:500,value:T.submission_ref,onChange:a=>B({...T,submission_ref:a.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u529E\u7406\u8BF4\u660E"),e.createElement("textarea",{"aria-label":"\u529E\u7406\u8BF4\u660E",rows:4,maxLength:5e3,value:T.notes,onChange:a=>B({...T,notes:a.target.value})})),e.createElement("p",{className:"df-muted"},"\u8BB0\u5F55\u7EBF\u4E0B\u6216\u4E1A\u52A1\u7CFB\u7EDF\u7684\u5B9E\u9645\u529E\u7406\u7ED3\u679C\uFF0C\u56DE\u6267\u6587\u4EF6\u53EF\u4E0A\u4F20\u5230\u6750\u6599\u6E05\u5355\u3002"),T.status==="completed"&&e.createElement(e.Fragment,null,e.createElement("p",{className:"df-muted"},N.missing_required.length>0?"\u5C1A\u672A\u529E\u7ED3\u7684\u5FC5\u5907\u6750\u6599\uFF1A"+N.missing_required.join("\u3001"):"\u8BF7\u786E\u8BA4\u9636\u6BB5\u6750\u6599\u548C\u524D\u5E8F\u53D8\u66F4\u5DF2\u6838\u5BF9\u3002"),e.createElement("label",{className:"df-checkbox"},e.createElement("input",{"aria-label":"\u786E\u8BA4\u672C\u9636\u6BB5\u5DF2\u529E\u7ED3",type:"checkbox",checked:T.confirmed,onChange:a=>B({...T,confirmed:a.target.checked})}),"\u5DF2\u6838\u5BF9\u672C\u9636\u6BB5\u6750\u6599\u53CA\u524D\u5E8F\u53D8\u66F4\uFF0C\u786E\u8BA4\u672C\u9636\u6BB5\u5DF2\u529E\u7ED3")),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",onClick:()=>J(null),disabled:!!S||!!L},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!S||T.status==="completed"&&!T.confirmed,type:"submit"},"\u4FDD\u5B58\u529E\u7406\u4FE1\u606F")))),Ue&&!r.single_form&&e.createElement(Dt,{key:Ue.id,file:Ue,projectId:r.id,download:(a,p)=>ne("\u4E0B\u8F7D\u539F\u6587\u4EF6",()=>g(a,p)),onClose:()=>xe(null)}))}function Xt({project:n,Field:c,onSave:l,onDirtyChange:h}){let[g,m]=A(n.fields),[f,x]=A({name:n.name,code:n.code,owner:n.owner});return Te(()=>{h(JSON.stringify(g)!==JSON.stringify(n.fields)||f.name!==n.name||f.code!==n.code||f.owner!==n.owner)},[g,f]),e.createElement("form",{className:"df-paper df-project-profile",onSubmit:d=>{d.preventDefault(),l({...f,values:Object.fromEntries(g.map(y=>[y.key,y.value]))})}},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,"\u57FA\u7840\u4FE1\u606F\u586B\u62A5"),e.createElement("p",{className:"df-muted"},"\u5404\u9636\u6BB5\u8868\u5355\u590D\u7528\u8FD9\u91CC\u7684\u8D44\u6599\uFF1B\u9636\u6BB5\u65E5\u671F\u3001\u8BC4\u5BA1\u5206\u6570\u548C\u4ED8\u6B3E\u7ED3\u679C\u5206\u522B\u8BB0\u5F55\u3002")),e.createElement("button",{className:"df-primary",type:"submit"},"\u4FDD\u5B58\u57FA\u7840\u4FE1\u606F")),e.createElement("div",{className:"df-fields"},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u540D\u79F0"),e.createElement("input",{"aria-label":"\u9879\u76EE\u540D\u79F0",required:!0,value:f.name,maxLength:120,onChange:d=>x({...f,name:d.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u7F16\u53F7"),e.createElement("input",{"aria-label":"\u9879\u76EE\u7F16\u53F7",value:f.code,maxLength:100,onChange:d=>x({...f,code:d.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u7ECF\u529E\u4EBA"),e.createElement("input",{"aria-label":"\u7ECF\u529E\u4EBA",value:f.owner,maxLength:100,onChange:d=>x({...f,owner:d.target.value})}))),[...new Set(g.filter(d=>!["project.name","project.code"].includes(d.key)).map(d=>d.group))].map(d=>e.createElement("section",{className:"df-group",key:d},e.createElement("h3",null,d),e.createElement("div",{className:"df-fields"},g.filter(y=>y.group===d&&!["project.name","project.code"].includes(y.key)).map(y=>e.createElement(c,{key:y.key,field:{...y,required:!1},onChange:r=>m(g.map(P=>P.key===y.key?{...P,value:r}:P))}))))),e.createElement("div",{className:"df-actions"},e.createElement("button",{className:"df-primary",type:"submit"},"\u4FDD\u5B58\u57FA\u7840\u4FE1\u606F")))}var me=window.QwenPaw.host.React,{useEffect:It,useRef:kt,useState:Jt}=me;function Yt({field:n}){let[c,l]=Jt(!1),h=kt(null),g=kt(null),m=kt(null),f=()=>{window.clearTimeout(m.current),l(!0)};It(()=>()=>window.clearTimeout(m.current),[]);let x="df-help-"+n.key;return It(()=>{if(!c)return;let d=r=>{h.current?.contains(r.target)||l(!1)},y=r=>{if(r.key!=="Escape")return;r.preventDefault(),r.stopPropagation();let P=h.current?.contains(document.activeElement);l(!1),P&&g.current?.focus()};return document.addEventListener("pointerdown",d),document.addEventListener("keydown",y,!0),()=>{document.removeEventListener("pointerdown",d),document.removeEventListener("keydown",y,!0)}},[c]),me.createElement("span",{className:"df-field-help",ref:h,onMouseEnter:f,onMouseLeave:d=>{d.relatedTarget?.nodeType&&d.currentTarget.contains(d.relatedTarget)||h.current?.contains(document.activeElement)||(m.current=window.setTimeout(()=>l(!1),120))},onBlur:d=>{d.relatedTarget&&!d.currentTarget.contains(d.relatedTarget)&&l(!1)}},me.createElement("button",{type:"button",className:"df-field-help-trigger","aria-label":n.label+"\uFF1A\u586B\u5199\u8BF4\u660E","aria-expanded":c,"aria-controls":c?x:void 0,"aria-describedby":c?x:void 0,ref:g,onFocus:f,onClick:f},me.createElement("svg",{viewBox:"0 0 20 20",fill:"none","aria-hidden":"true"},me.createElement("circle",{cx:"10",cy:"10",r:"7.5"}),me.createElement("path",{d:"M7.8 7.6a2.3 2.3 0 0 1 4.4.9c0 1.6-2.2 1.8-2.2 3.2"}),me.createElement("circle",{cx:"10",cy:"14",r:".65",fill:"currentColor",stroke:"none"}))),c&&me.createElement("span",{className:"df-field-help-content",id:x,role:"tooltip",onMouseEnter:f},n.help))}function gt({field:n,inputId:c}){return me.createElement("div",{className:"df-field-label"},me.createElement(c?"label":"span",{htmlFor:c},n.label,n.required&&me.createElement("span",{className:"df-required",title:"\u5FC5\u586B","aria-hidden":"true"},"*")),n.help&&me.createElement(Yt,{field:n}))}var ue=window.QwenPaw,t=ue.host.React,{useState:pe,useEffect:We,useLayoutEffect:Zt,useRef:nt}=t,Nt="/document-forms",Rt="application/vnd.openxmlformats-officedocument.wordprocessingml.document";async function ce(n,c){let l=await ue.host.fetch(Nt+n,c);if(!l.ok){let h=await l.json().catch(()=>({}));throw new Error(typeof h.detail=="string"?h.detail:Array.isArray(h.detail)?h.detail.map(g=>`${g.loc?.slice(1).join(".")||"\u8D44\u6599"}\uFF1A${g.msg}`).join("\uFF1B"):`\u64CD\u4F5C\u672A\u5B8C\u6210\uFF08${l.status}\uFF09\uFF0C\u8BF7\u68C0\u67E5\u586B\u5199\u5185\u5BB9`)}return l.json()}async function Ze(n,c){let l=await ue.host.fetch(Nt+n);if(!l.ok)throw new Error("\u6587\u4EF6\u4E0B\u8F7D\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5");let h=URL.createObjectURL(await l.blob()),g=document.createElement("a");g.href=h,g.download=c,document.body.appendChild(g);try{g.click()}finally{g.remove(),setTimeout(()=>URL.revokeObjectURL(h),1e3)}}var Ae=n=>({method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)}),Re=n=>new Date(n).toLocaleString("zh-CN",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}),Ot=n=>n.kind==="textarea"||n.value.length>100||n.value.includes(`
`)||n.label.includes("\u6574\u6BB5"),ea=n=>/^(research\.contents|deliverables\.|metrics\.|milestones\.)/.test(n.key)||/主要研究内容|预期成果|考核指标|进度安排/.test(n.label);function bt(n){return n.map((c,l)=>{let h={...c};for(let g of["start","end"]){let m="follow_"+g;h[m]=l>0&&(typeof h[m]=="boolean"?h[m]:!h[g]),h[m]&&(h[g]=n[0][g])}return h})}function ta({field:n,onChange:c}){let l=["","",""],h=0;for(let g of n.value.split(/\r?\n/)){let m=g.match(/^\s*([1-3])[.、．)）]\s?(.*)$/);m?l[Number(m[1])-1]=m[2]:h<3&&(l[h++]=g)}return t.createElement("div",{className:"df-plan-partners",id:"df-plan.partners",role:"group","aria-label":n.label},t.createElement(gt,{field:n}),l.map((g,m)=>t.createElement("label",{className:"df-field",key:m},t.createElement("span",null,"\u5355\u4F4D",m+1),t.createElement("input",{"aria-label":`\u5355\u4F4D${m+1}`,type:"text",value:g,onChange:f=>{let x=l.map((d,y)=>y===m?f.target.value:d);c(x.some(d=>d.trim())?x.map((d,y)=>`${y+1}. ${d}`).join(`
`):"")}}))))}function Wt({field:n,displayValue:c,onChange:l}){let h="df-input-"+n.key,g=n.key!=="plan.notes"&&Ot(n),m=ea(n),f=["date","datetime-local"].includes(n.kind)?n.value:c??n.value,x=nt(null);return Zt(()=>{if(!x.current)return;let d=x.current.scrollTop;x.current.style.height="auto",x.current.style.height=Math.max(m?104:192,x.current.scrollHeight)+"px",x.current.scrollTop=d},[f,g,m]),n.key==="plan.partners"?t.createElement(ta,{field:n,onChange:l}):t.createElement("div",{className:"df-field"+(g?" df-field-paragraph":"")+(m?" df-field-compact":""),id:"df-"+n.key},t.createElement(gt,{field:n,inputId:h}),n.options?t.createElement("select",{id:h,"aria-label":n.label,"aria-required":n.required||void 0,value:f,onChange:d=>l(d.target.value)},t.createElement("option",{value:""},"\u8BF7\u9009\u62E9"),f&&!n.options.includes(f)&&t.createElement("option",{value:f,disabled:!0},f,"\uFF08\u8BF7\u91CD\u65B0\u9009\u62E9\uFF09"),n.options.map(d=>t.createElement("option",{key:d,value:d},d))):g?t.createElement("textarea",{id:h,ref:x,"aria-label":n.label,"aria-required":n.required||void 0,rows:m?3:8,value:f,onChange:d=>l(d.target.value)}):t.createElement("input",{id:h,"aria-label":n.label,"aria-required":n.required||void 0,type:n.key==="plan.notes"?"text":n.kind,readOnly:!!n.read_only,step:n.kind==="number"?"any":void 0,value:f,onChange:d=>l(d.target.value)}))}function aa({fields:n,onChange:c,compact:l=!1}){let h=n.filter(m=>/^selection\.member\d+_name$/.test(m.key));if(!h.length)return null;let g={unit:["\u5730\u4E0B\u7A7A\u95F4\u5229\u7528\u7814\u7A76\u6240",...n.filter(m=>["contact.department","project.executing_unit"].includes(m.key)).map(m=>m.value)],title:["\u526F\u6240\u957F/\u9AD8\u5DE5","\u4F01\u4E1A\u9AD8\u7EA7\u4E13\u5BB6/\u9AD8\u5DE5","\u90E8\u95E8\u8D1F\u8D23\u4EBA/\u9AD8\u5DE5","\u4E00\u7EA7\u5DE5\u7A0B\u5E08/\u9AD8\u5DE5","\u9AD8\u7EA7\u5DE5\u7A0B\u5E08","\u5DE5\u7A0B\u5E08","\u6559\u6388","\u526F\u6559\u6388"],category:["\u4E3B\u4EFB","\u526F\u4E3B\u4EFB","\u79D1\u59D4\u4F1A\u6210\u5458","\u4E13\u5BB6","\u7EC4\u957F","\u6210\u5458"]};return t.createElement("section",{className:"df-group df-selection-members","aria-label":"\u8BBA\u8BC1\u6210\u5458"},!l&&t.createElement("h3",null,"\u8BBA\u8BC1\u6210\u5458"),!l&&t.createElement("p",{className:"df-muted"},"\u6BCF\u4EBA\u4E00\u884C\u3002\u5355\u4F4D\u3001\u804C\u52A1/\u804C\u79F0\u548C\u7C7B\u522B\u53EF\u9009\u62E9\uFF0C\u4E5F\u53EF\u76F4\u63A5\u8F93\u5165\u3002"),t.createElement("div",{className:"df-member-scroll"},t.createElement("table",{className:"df-member-table"},t.createElement("thead",null,t.createElement("tr",null,t.createElement("th",{scope:"col"},"\u5E8F\u53F7"),t.createElement("th",{scope:"col"},"\u59D3\u540D"),t.createElement("th",{scope:"col"},"\u5355\u4F4D"),t.createElement("th",{scope:"col"},"\u804C\u52A1/\u804C\u79F0"),t.createElement("th",{scope:"col"},"\u7C7B\u522B"))),t.createElement("tbody",null,h.map((m,f)=>{let x=m.key.replace(/name$/,"");return t.createElement("tr",{key:m.key},t.createElement("th",{scope:"row"},String(f+1).padStart(2,"0")),["name","unit","title","category"].map(d=>{let y=n.find(_=>_.key===x+d);if(!y)return t.createElement("td",{key:d});let r=d==="name"?[]:[...new Set([...g[d],...n.filter(_=>new RegExp(`^selection\\.member\\d+_${d}$`).test(_.key)).map(_=>_.value)].filter(Boolean))],P="df-options-"+y.key;return t.createElement("td",{key:d,id:"df-"+y.key},t.createElement("input",{"aria-label":y.label,value:y.value,list:r.length?P:void 0,autoComplete:"off",onChange:_=>c(y.key,_.target.value)}),r.length>0&&t.createElement("datalist",{id:P},r.map(_=>t.createElement("option",{value:_,key:_}))))}))})))))}function ia({project:n,workflowStage:c,initialCaseId:l,initialView:h,editRequest:g=0,initialDraft:m,onBack:f,onChanged:x,onDirtyChange:d,onBusyChange:y,onViewChange:r,docked:P=!1,onPreview:_,onStageStatus:Z,onEditBasics:O,toolbarTarget:Q,onShowForm:$,onDownloadStageMaterials:D}){let[s,K]=pe(null),[R,z]=pe(""),[L,q]=pe(null),[V,I]=pe([]),[w,E]=pe("import"),[u,X]=pe(!1),[S,ee]=pe(null),[re,H]=pe(!1),[M,ke]=pe(""),[he,J]=pe(""),[T,B]=pe(""),[F,Ne]=pe(null),[Ue,xe]=pe(null),se=nt(null),et=nt(null),qe=nt(0),fe=nt(!0),Qe=ue.host.useTheme?.()||"light",ve=()=>x?.()||Promise.resolve(),ie=P&&Q&&ue.host.ReactDOM?.createPortal;We(()=>(fe.current=!0,(m?Promise.resolve(m):ce("/cases/"+l)).then(i=>{fe.current&&(ge(i),E(h==="files"&&i.generations.length?"files":"edit"),h==="files"&&i.generations.length&&Ne({file:i.generations[0].files[0],generation:i.generations[0]}))}).catch(i=>fe.current&&J(i.message)),(ue.workspace?.loadPreview?ue.workspace.loadPreview():Promise.resolve(ye)).then(i=>{fe.current&&xe(()=>i)}).catch(i=>{fe.current&&xe(()=>ye)}),()=>{fe.current=!1,qe.current++}),[]),We(()=>{g&&(E("edit"),H(!1))},[g]),We(()=>{d?.(u)},[u]),We(()=>{y?.(M)},[M]),We(()=>{r?.()},[w]),We(()=>{let i=o=>{u&&(o.preventDefault(),o.returnValue="")};return window.addEventListener("beforeunload",i),()=>window.removeEventListener("beforeunload",i)},[u]);async function te(i,o){if(M)return;let v=++qe.current;ke(i),J(""),B("");try{await o()}catch(a){fe.current&&v===qe.current&&(J(a.message),$?.())}finally{fe.current&&v===qe.current&&ke("")}}function ge(i){fe.current&&(K({...i,recipients:bt(i.recipients),presentation_sources:Object.fromEntries(i.fields.map(o=>[o.key,o.value]))}),X(!1),E(o=>o==="review"?"edit":o),ee(null),H(!1))}function Ce(i){K(i),X(!0),ee(null),H(!1),B("")}function rt(i,o,v,a=!1){let p=s.recipients.map((C,G)=>G===i?{...C,[o]:v,...o!=="name"?{["follow_"+o]:a}:{}}:C);Ce({...s,recipients:bt(p)})}async function ae(){if(!u)return s;let i={revision:s.revision,name:s.name.trim()||"\u672A\u547D\u540D\u586B\u62A5",values:Object.fromEntries(s.fields.map(v=>[v.key,v.value])),recipients:s.recipients},o=await ce("/cases/"+s.id,{...Ae(i),method:"PUT"});return ge(o),o}function ot(){return!u||window.confirm("\u5F53\u524D\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\u3002\u79BB\u5F00\u6B64\u8BB0\u5F55\uFF1F")}let oe=s?.stage_id==="plan"&&s?.plan_schema===1,Y=s?.stage_id==="selection"&&s?.selection_schema===1,Ke=s?.stage_id==="contract",Se=oe||Y||Ke,He=Se?"\u6587\u4E66\u6A21\u677F":"Word \u6A21\u677F",Me=Se?s.fields.filter(i=>i.scope!=="shared"):s?.fields||[],Ve=[...new Set(Me.map(mt))];if(Y){let i=["\u8BBA\u8BC1\u5B89\u6392","\u5019\u9009\u5355\u4F4D","\u8BBA\u8BC1\u6210\u5458","\u8BBA\u8BC1\u610F\u89C1","\u975E\u62DB\u6807\u65B9\u6848"];Ve.sort((o,v)=>{let a=p=>{let C=i.indexOf(p);return C<0?i.length:C};return a(o)-a(v)})}let _e=[...Ve.map(i=>({id:i,label:i})),...Se?[]:[{id:"recipients",label:"\u53D7\u9080\u5355\u4F4D"}],{id:"generate",label:P?"\u6587\u4EF6\u751F\u6210":"\u6A21\u677F\u4E0E\u751F\u6210",align:"end"}],Ge=_e.some(i=>i.id===R)?R:_e[0].id,N=s?.templates||[],Be=N.reduce((i,o)=>i+(o.per_recipient?s.recipients.length:1),0),dt=(s?.generations||[]).filter(i=>!P||(i.stage_id||s.original_stage_id||c.id)===c.id),U=dt[0];We(()=>{P&&w==="files"&&U&&!dt.some(i=>i.id===F?.generation.id)&&Ne({file:U.files[0],generation:U})},[w,U?.id]);let Xe=S?.checks.filter(i=>i.status!=="ok")||[];async function tt(i){!i||!ot()||await te("\u8BFB\u53D6 Excel",async()=>{let o=new FormData;o.append("workbook",i),o.append("revision",n.revision),o.append("stage_id",c.id);let v=await ce(`/projects/${n.id}/${n.single_form?"form":"cases"}/import`,{method:"POST",body:o});ge(v),Ne(null),z(""),E("edit"),$?.(),await ve(),B(v.templates.length?"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\uFF0C\u5E76\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002":v.template_notice||"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\u3002\u8BF7\u6DFB\u52A0\u5BF9\u5E94\u7684 Word \u6A21\u677F\u3002")})}async function De(i){i=Array.from(i),i.length&&await te("\u8BFB\u53D6 Word \u6A21\u677F",async()=>{let o=await ae(),v=new FormData;v.append("revision",String(o.revision)),Array.from(i).forEach(a=>v.append("files",a)),ge(await ce("/cases/"+o.id+"/templates",{method:"POST",body:v})),await ve(),B("Word \u6A21\u677F\u5DF2\u6DFB\u52A0\uFF0C\u751F\u6210\u65F6\u4F1A\u4FDD\u7559\u539F\u6709\u6392\u7248\u3002")})}async function be(){await te("\u6838\u5BF9\u8D44\u6599",async()=>{let i=await ae(),o=await ce("/cases/"+i.id+"/review",Ae({revision:i.revision}));fe.current&&(ee(o),H(!1),E("review"),await ve())})}async function ne(){await te("\u751F\u6210\u6587\u4E66",async()=>{let i=await ce("/cases/"+s.id+"/generate",Ae({revision:s.revision,review_token:S.review_token,confirmed:re}));ge(i),E("files"),Ne({file:i.generations[0].files[0],generation:i.generations[0]}),await ve()})}function ht(i){let o=s.fields.find(v=>v.key===i);if(o?.scope==="shared"&&Se&&O){O();return}z(o?mt(o):i.startsWith("recipient-")?"recipients":"generate"),E("edit"),requestAnimationFrame(()=>{let v=document.getElementById("df-"+i);v?.scrollIntoView?.({behavior:"smooth",block:"center"}),v?.querySelector("input,textarea,select")?.focus()})}let Le=(i,o)=>`/cases/${s.id}/outputs/${i.id}/${encodeURIComponent(o)}`;function we(i){return te("\u6B63\u5728\u4E0B\u8F7D\u538B\u7F29\u5305",async()=>{await Ze(Le(i,"\u5168\u90E8\u6587\u4E66.zip"),i.bundle_name||s.name+"_\u6587\u4E66.zip"),B(`\u5DF2\u5F00\u59CB\u4E0B\u8F7D\u8BE5\u6279\u6B21\u7684 ${i.files.length} \u4EFD\u6587\u4E66\u538B\u7F29\u5305\u3002`)})}let le=F?{id:F.generation.id+F.file.name,title:F.file.name,source:"generated",mimeType:F.file.name.endsWith(".xlsx")?"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":Rt,extension:F.file.name.endsWith(".xlsx")?"xlsx":"docx",binaryUrl:F.file.preview_url,printUrl:Nt+`/cases/${s.id}/print/${F.generation.id}/${encodeURIComponent(F.file.name)}`,agentId:ue.host.getSelectedAgentId?.(),createdAt:Date.parse(F.generation.created_at)}:null;We(()=>{P&&w==="files"&&le&&_?.({artifact:le,reference:{case_id:s.id,generation_id:F.generation.id,name:F.file.name}})},[w,F?.generation.id,F?.file.name]);async function st(){await te("\u5BFC\u51FA Excel",async()=>{let i=await ae();await Ze("/cases/"+i.id+"/excel",(i.fields.find(o=>o.key==="project.name")?.value||i.name).replace(/[<>:"/\\|?*\x00-\x1f]/g,"_").slice(0,80)+"_\u586B\u5199\u6570\u636E.xlsx")})}let lt=t.createElement("section",{className:"df-paper df-template-panel","aria-label":He},t.createElement("div",{className:"df-section-head"},!ie&&t.createElement("h2",null,He),t.createElement("div",{className:"df-template-actions"},N.length>0?t.createElement("button",{onClick:()=>te("\u4FDD\u5B58\u9ED8\u8BA4\u6A21\u677F",async()=>{let i=await ae();await ce(`/cases/${i.id}/defaults`,Ae({revision:i.revision})),B(c.id==="negotiation"?"\u5DF2\u8BBE\u4E3A\u672C\u673A\u9ED8\u8BA4\u6A21\u677F\uFF0C\u4EE5\u540E\u65B0\u5EFA\u586B\u62A5\u4F1A\u81EA\u52A8\u8F7D\u5165\u3002":"\u5DF2\u8BBE\u4E3A\u672C\u9636\u6BB5\u9ED8\u8BA4\u6A21\u677F\uFF0C\u4EE5\u540E\u65B0\u5EFA\u8BE5\u9636\u6BB5\u8868\u5355\u4F1A\u81EA\u52A8\u8F7D\u5165\u3002")})},c.id==="negotiation"?"\u8BBE\u4E3A\u9ED8\u8BA4\u6A21\u677F":"\u8BBE\u4E3A\u672C\u9636\u6BB5\u9ED8\u8BA4\u6A21\u677F"):t.createElement("button",{onClick:()=>te("\u8F7D\u5165\u9ED8\u8BA4\u6A21\u677F",async()=>{let i=await ae();ge(await ce(`/cases/${i.id}/defaults/apply`,Ae({revision:i.revision}))),B("\u5DF2\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002")})},"\u4F7F\u7528\u9ED8\u8BA4\u6A21\u677F"),!ie&&t.createElement("button",{onClick:()=>et.current.click()},"\uFF0B \u6DFB\u52A0"))),!ie&&!N.length&&t.createElement("p",{className:"df-muted"},"\u6DFB\u52A0\u4E0E\u4F60\u7684\u53D8\u91CF\u8868\u5BF9\u5E94\u7684 .docx \u6216 .xlsx \u6A21\u677F\u3002"),N.map(i=>t.createElement("div",{className:"df-template",key:i.id},t.createElement("b",null,i.name),i.from_builtin&&t.createElement("small",null,"\u5E94\u7528\u81EA\u5E26\u6A21\u677F"),t.createElement("span",null,i.per_recipient?"\u6309\u53D7\u9080\u5355\u4F4D\u5206\u522B\u751F\u6210":"\u5171\u7528\u6587\u4EF6 \xB7 \u751F\u6210\u4E00\u4EFD"),i.print_copies>1&&t.createElement("small",null,"\u5EFA\u8BAE\u6253\u5370 ",i.print_copies," \u4EFD \xB7 ",i.print_note),t.createElement("button",{"aria-label":"\u79FB\u9664\u6A21\u677F"+i.name,onClick:()=>te("\u79FB\u9664\u6A21\u677F",async()=>{let o=await ae();ge(await ce(`/cases/${o.id}/templates/${i.id}?revision=${o.revision}`,{method:"DELETE"}))})},"\u79FB\u9664")))),ze=t.createElement(t.Fragment,null,t.createElement("div",{className:"df-toolbar-file-actions"},t.createElement(wt,{label:"\u6A21\u677F",icon:"template",disabled:!!M||!s},t.createElement("button",{className:"df-toolbar-template-import",disabled:!!M,onClick:()=>et.current.click()},t.createElement(de,{name:"import"}),"\u5BFC\u5165\u6A21\u677F"),t.createElement("button",{"aria-label":"\u4E0B\u8F7D\u914D\u5957\u6A21\u677F",disabled:!!M,onClick:()=>te("\u4E0B\u8F7D\u914D\u5957\u6A21\u677F",()=>Ze("/starter","\u6587\u4E66\u586B\u62A5_\u914D\u5957\u6A21\u677F.zip"))},t.createElement(de,{name:"download"}),"\u4E0B\u8F7D\u6A21\u677F"),lt),w!=="edit"&&t.createElement("button",{disabled:!!M,onClick:()=>{E("edit"),H(!1),$?.()}},t.createElement(de,{name:"back"}),"\u8FD4\u56DE\u586B\u5199"),U&&w!=="files"&&t.createElement("button",{title:"\u67E5\u770B\u751F\u6210\u6587\u4EF6","aria-label":"\u67E5\u770B\u751F\u6210\u6587\u4EF6",disabled:!!M,onClick:()=>{E("files"),$?.()}},t.createElement(de,{name:"file"}),"\u751F\u6210\u6587\u4EF6"),t.createElement("button",{"aria-label":"\u4E0B\u8F7D\u672C\u9636\u6BB5\u6750\u6599",title:"\u4E0B\u8F7D\u672C\u9636\u6BB5\u6750\u6599",disabled:!!M,onClick:D},t.createElement(de,{name:"download"}),"\u9636\u6BB5\u6750\u6599"),t.createElement(wt,{label:"\u66F4\u591A\u64CD\u4F5C",icon:"more",iconOnly:!0,disabled:!!M||!s},t.createElement("label",{className:"df-field"},t.createElement("span",null,"\u8868\u5355\u540D\u79F0"),t.createElement("input",{"aria-label":"\u8868\u5355\u540D\u79F0",maxLength:120,value:s?.name||"",onChange:i=>Ce({...s,name:i.target.value})})),t.createElement("button",{disabled:!!M,onClick:()=>{q("adopt"),I([]),$?.()}},"\u6838\u5BF9\u9879\u76EE\u8D44\u6599\u5DEE\u5F02"),t.createElement("button",{disabled:!!M,onClick:()=>{q("publish"),I([]),$?.()}},"\u5B58\u5165\u9879\u76EE\u5E95\u7A3F"))),t.createElement("div",{className:"df-toolbar-save"},s&&t.createElement("span",{className:"df-save-state"+(u?" is-dirty":""),title:u?"\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539":"\u8349\u7A3F\u5DF2\u4FDD\u5B58 \xB7 "+Re(s.updated_at),role:"status"},u?"\u672A\u4FDD\u5B58":"\u5DF2\u4FDD\u5B58"),t.createElement("button",{className:"df-toolbar-icon-button",title:"\u5BFC\u5165 Excel","aria-label":"\u5BFC\u5165 Excel",disabled:!!M||!s,onClick:()=>se.current.click()},t.createElement(de,{name:"import"})),t.createElement("button",{className:"df-toolbar-icon-button",title:"\u5BFC\u51FA\u5F53\u524D Excel","aria-label":"\u5BFC\u51FA\u5F53\u524D Excel",disabled:!!M||!s,onClick:st},t.createElement(de,{name:"export"})),t.createElement("button",{className:"df-primary df-toolbar-icon-button","aria-label":"\u4FDD\u5B58\u8349\u7A3F",title:"\u4FDD\u5B58\u8349\u7A3F",disabled:!!M||!s||!u,onClick:()=>te("\u4FDD\u5B58\u8349\u7A3F",async()=>{await ae(),await ve(),B("\u8349\u7A3F\u5DF2\u4FDD\u5B58")})},t.createElement(de,{name:"save"}))));return t.createElement("div",{className:"df-app df-embedded-editor","data-theme":Qe},t.createElement("input",{ref:se,type:"file",accept:".xlsx",hidden:!0,"aria-label":"\u5BFC\u5165 Excel \u53D8\u91CF\u8868",onChange:i=>{tt(i.target.files[0]),i.target.value=""}}),t.createElement("input",{ref:et,type:"file",accept:".docx,.xlsx",multiple:!0,hidden:!0,"aria-label":"\u5BFC\u5165 Word \u6A21\u677F",onChange:i=>{De(i.target.files),i.target.value=""}}),t.createElement("section",{className:"df-main"},!P&&t.createElement("div",{className:"df-editor-context"},t.createElement("button",{disabled:!!M,onClick:()=>{ot()&&f()}},"\u2190 \u8FD4\u56DE",c.title),t.createElement("span",null,n.name," / ",c.title),P&&t.createElement("button",{disabled:!!M||u,title:u?"\u8BF7\u5148\u4FDD\u5B58\u8868\u5355":"\u66F4\u65B0\u5F53\u524D\u8282\u70B9\u7684\u529E\u7406\u4FE1\u606F",onClick:Z},"\u529E\u7406\u4FE1\u606F\u4E0E\u72B6\u6001"),s&&t.createElement("div",{className:"df-actions"},t.createElement("button",{disabled:!!M,onClick:()=>{q("adopt"),I([])}},"\u6838\u5BF9\u9879\u76EE\u8D44\u6599\u5DEE\u5F02"),t.createElement("button",{disabled:!!M,onClick:()=>{q("publish"),I([])}},"\u5B58\u5165\u9879\u76EE\u5E95\u7A3F"))),!ie&&t.createElement("header",{className:"df-header"},t.createElement("div",null,!P&&t.createElement("span",{className:"df-eyebrow"},c.title," / \u586B\u5199\u4E0E\u751F\u6210"),t.createElement("h1",null,s?P?"\u586B\u5199\u5185\u5BB9":s.name:"\u586B\u5199\u9879\u76EE\u8D44\u6599"),t.createElement("p",null,s?u?"\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539":`\u8349\u7A3F\u5DF2\u4FDD\u5B58 \xB7 ${Re(s.updated_at)}`:"\u5BFC\u5165\u53D8\u91CF\u8868\u4E0E Word \u6A21\u677F\uFF0C\u586B\u5199\u3001\u6838\u5BF9\uFF0C\u518D\u751F\u6210\u6587\u4E66\u3002")),s&&t.createElement("button",{disabled:!!M||!u,onClick:()=>te("\u4FDD\u5B58\u8349\u7A3F",async()=>{await ae(),await ve(),B("\u8349\u7A3F\u5DF2\u4FDD\u5B58")})},"\u4FDD\u5B58\u8349\u7A3F")),ie?ue.host.ReactDOM.createPortal(ze,Q):P?t.createElement("div",{className:"df-node-tools","aria-label":"\u8868\u5355\u64CD\u4F5C"},w!=="edit"&&t.createElement("button",{disabled:!!M,onClick:()=>{E("edit"),H(!1)}},"\u8FD4\u56DE\u586B\u5199"),t.createElement("button",{disabled:!!M,onClick:()=>se.current.click()},"\u5BFC\u5165 Excel"),U&&w!=="files"&&t.createElement("button",{disabled:!!M,onClick:()=>E("files")},"\u67E5\u770B\u751F\u6210\u6587\u4EF6"),t.createElement("details",null,t.createElement("summary",null,"\u66F4\u591A\u64CD\u4F5C"),t.createElement("div",{className:"df-actions"},t.createElement("button",{disabled:!!M,onClick:()=>{q("adopt"),I([])}},"\u6838\u5BF9\u9879\u76EE\u8D44\u6599\u5DEE\u5F02"),t.createElement("button",{disabled:!!M,onClick:()=>{q("publish"),I([])}},"\u5B58\u5165\u9879\u76EE\u5E95\u7A3F")))):t.createElement("div",{className:"df-steps","aria-label":"\u586B\u5199\u6D41\u7A0B"},[["import","01","\u5BFC\u5165\u6A21\u677F"],["edit","02","\u586B\u5199\u8D44\u6599"],["review","03","\u6838\u5BF9\u751F\u6210"],["files","04","\u6587\u4EF6\u9884\u89C8"]].map(([i,o,v])=>t.createElement("button",{key:i,"aria-current":w===i?"step":void 0,className:w===i?"active":"",disabled:!!M||!s&&i!=="import"||i==="files"&&!U,onClick:()=>i==="review"?be():E(i)},t.createElement("span",null,o),v))),he&&t.createElement("div",{className:"df-alert error",role:"alert"},he,t.createElement("button",{"aria-label":"\u5173\u95ED\u9519\u8BEF\u63D0\u793A",onClick:()=>J("")},"\xD7")),T&&t.createElement("div",{className:"df-alert",role:"status"},T),M&&t.createElement("div",{className:"df-progress",role:"status"},M,"\u2026"),t.createElement("fieldset",{className:"df-content",disabled:!!M},w==="import"&&t.createElement("div",{className:"df-import"},t.createElement("section",{className:"df-paper df-drop"},t.createElement("div",{className:"df-file-mark"},"XLSX"),t.createElement("h2",null,"\u4ECE Excel \u53D8\u91CF\u8868\u5F00\u59CB"),t.createElement("p",null,"\u201C\u53D8\u91CF\u914D\u7F6E\u201D\u5DE5\u4F5C\u8868\u4FDD\u7559\u4E09\u5217\uFF1A",t.createElement("br",null),t.createElement("b",null,"\u53D8\u91CF\u540D\u79F0\u3000\u4E2D\u6587\u540D\u79F0\u3000\u503C")),t.createElement("button",{className:"df-primary",onClick:()=>se.current.click()},"\u9009\u62E9 Excel \u53D8\u91CF\u8868"),t.createElement("small",null,"\u652F\u6301 .xlsx \xB7 \u5355\u4E2A\u6587\u4EF6\u4E0D\u8D85\u8FC7 15 MB")),t.createElement("section",{className:"df-paper df-import-note"},t.createElement("span",{className:"df-eyebrow"},"\u5982\u4F55\u51C6\u5907"),t.createElement("h2",null,"\u4E00\u4EFD\u6570\u636E\uFF0C\u591A\u4EFD\u6587\u4E66"),t.createElement("ol",null,t.createElement("li",null,t.createElement("b",null,"\u6574\u7406\u53D8\u91CF"),t.createElement("p",null,"\u4F8B\u5982 project.name / \u9879\u76EE\u540D\u79F0 / \u5B9E\u9645\u540D\u79F0\u3002\u652F\u6301\u5206\u7EC4\u3001\u7C7B\u578B\u548C\u5FC5\u586B\u5217\u3002")),t.createElement("li",null,t.createElement("b",null,"\u81EA\u52A8\u8F7D\u5165\u6A21\u677F"),t.createElement("p",null,"\u5E94\u7528\u81EA\u5E26 5 \u4EFD\u6807\u51C6 Word \u6A21\u677F\uFF0C\u4F7F\u7528\u914D\u5957 Excel \u5373\u53EF\u81EA\u52A8\u8F7D\u5165\uFF1B \u4E5F\u53EF\u6DFB\u52A0\u81EA\u5DF1\u7684\u6A21\u677F\u3002")),t.createElement("li",null,t.createElement("b",null,"\u5206\u522B\u751F\u6210\u9080\u8BF7\u51FD"),t.createElement("p",null,"\u5728\u201C\u53D7\u9080\u5355\u4F4D\u201D\u8868\u8BB0\u5F55\u5355\u4F4D\u540D\u79F0\u3001\u9886\u53D6\u5F00\u59CB\u65F6\u95F4\u548C\u9886\u53D6\u7ED3\u675F\u65F6\u95F4\u3002"))),t.createElement("p",{className:"df-muted"},"\u201C\u65E5\u671F\u6821\u6838\u201D\u8868\u4E2D\u7684\u65E7\u7ED3\u679C\u4E0D\u4F1A\u4F5C\u4E3A\u5224\u65AD\u4F9D\u636E\uFF1B\u5E94\u7528\u4F1A\u6839\u636E\u5F53\u524D\u586B\u5199\u5185\u5BB9\u91CD\u65B0\u6838\u5BF9\u3002\u201C\u6821\u6838\u89C4\u5219\u201D\u8868\u53EF\u8865\u5145\u81EA\u5B9A\u4E49\u5148\u540E\u5173\u7CFB\u3002"))),s&&w==="edit"&&t.createElement("div",{className:"df-edit-layout"},!ie&&t.createElement("section",{className:"df-paper df-form-heading"},t.createElement("div",{className:"df-section-head"},!P&&t.createElement("h2",null,"\u586B\u5199\u4FE1\u606F"),t.createElement("button",{onClick:()=>te("\u5BFC\u51FA Excel",async()=>{let i=await ae();await Ze(`/cases/${i.id}/excel`,(i.fields.find(o=>o.key==="project.name")?.value||i.name).replace(/[<>:"/\\|?*\x00-\x1f]/g,"_").slice(0,80)+"_\u586B\u5199\u6570\u636E.xlsx")})},"\u5BFC\u51FA\u5F53\u524D Excel")),t.createElement("label",{className:"df-field df-title-field"},t.createElement("span",null,"\u8868\u5355\u540D\u79F0"),t.createElement("input",{"aria-label":"\u8868\u5355\u540D\u79F0",maxLength:120,value:s.name,onChange:i=>Ce({...s,name:i.target.value})}))),t.createElement(it,{id:"df-form",label:"\u586B\u5199\u5185\u5BB9\u5206\u7EC4",items:_e,value:Ge,onChange:z}),Ve.map(i=>t.createElement("section",{className:"df-paper df-form-panel",key:i,role:"tabpanel",id:`df-form-panel-${i}`,"aria-labelledby":`df-form-tab-${i}`,hidden:Ge!==i},[...new Set(Me.filter(o=>mt(o)===i&&!/^selection\.member\d+_/.test(o.key)).map(o=>o.group))].map(o=>t.createElement("section",{className:"df-group",key:o},(!ie||o!==i)&&t.createElement("h3",null,o),!ie&&o==="\u65E5\u671F\u5B89\u6392"&&t.createElement("p",{className:"df-muted"},"\u6587\u4E66\u7EDF\u4E00\u4F7F\u7528\u4E2D\u6587\u65E5\u671F\uFF0C\u4F8B\u5982\u201C2026\u5E7410\u670822\u65E5\u4E0B\u534814:30\u201D\u3002\u65E5\u671F\u9009\u62E9\u5668\u4FDD\u7559\u539F\u6765\u7684\u586B\u5199\u65B9\u5F0F\u3002"),t.createElement("div",{className:"df-fields"},Me.filter(v=>v.group===o&&!/^selection\.member\d+_/.test(v.key)).map(v=>t.createElement(Wt,{key:v.key,field:v,displayValue:s.presentation_sources?.[v.key]===v.value?s.document_values?.[v.key]:void 0,onChange:a=>Ce({...s,fields:s.fields.map(p=>p.key===v.key?{...p,value:a}:p)})}))))),i==="\u8BBA\u8BC1\u6210\u5458"&&t.createElement(aa,{fields:Me,compact:!!ie,onChange:(o,v)=>Ce({...s,fields:s.fields.map(a=>a.key===o?{...a,value:v}:a)})}))),!Se&&t.createElement("section",{className:"df-paper",role:"tabpanel",id:"df-form-panel-recipients","aria-labelledby":"df-form-tab-recipients",hidden:Ge!=="recipients"},t.createElement("div",{className:"df-section-head"},t.createElement("div",null,t.createElement("h2",null,"\u53D7\u9080\u5355\u4F4D"," ",t.createElement("span",{className:"df-count"},s.recipients.length)),t.createElement("p",null,"\u6309\u5355\u4F4D\u6587\u4E66\u5206\u522B\u751F\u6210\uFF0C\u5171\u7528\u9879\u76EE\u4E0E\u843D\u6B3E\u4FE1\u606F\u3002")),t.createElement("button",{onClick:()=>Ce({...s,recipients:bt([...s.recipients,{name:"",start:"",end:""}])}),disabled:s.recipients.length>=200},"\uFF0B \u6DFB\u52A0\u5355\u4F4D")),s.recipients.map((i,o)=>t.createElement("div",{className:"df-recipient",key:o,id:"df-recipient-"+o},t.createElement("div",{className:"df-recipient-title"},t.createElement("b",null,String(o+1).padStart(2,"0")),t.createElement("button",{"aria-label":`\u79FB\u9664\u7B2C${o+1}\u5BB6\u5355\u4F4D`,onClick:()=>Ce({...s,recipients:bt(s.recipients.filter((v,a)=>a!==o))})},"\u79FB\u9664")),t.createElement("div",{className:"df-fields"},[["name","\u5355\u4F4D\u540D\u79F0"],["start","\u9886\u53D6\u5F00\u59CB\u65F6\u95F4"],["end","\u9886\u53D6\u7ED3\u675F\u65F6\u95F4"]].map(([v,a])=>t.createElement("label",{className:"df-field "+(v==="name"?"df-span":""),key:v},t.createElement("span",null,a),t.createElement("input",{"aria-label":`\u7B2C${o+1}\u5BB6${a}`,type:v==="name"?"text":"datetime-local",value:v==="name"?i[v]:i[v].replace(" ","T"),onChange:p=>rt(o,v,p.target.value)}),o>0&&v!=="name"&&t.createElement("small",{className:"df-follow-state"},i["follow_"+v]?"\u8DDF\u968F\u7B2C1\u5BB6":"\u5DF2\u5355\u72EC\u8BBE\u7F6E",!i["follow_"+v]&&t.createElement("button",{type:"button","aria-label":`\u7B2C${o+1}\u5BB6${a}\u6062\u590D\u8DDF\u968F`,onClick:p=>{p.preventDefault(),rt(o,v,s.recipients[0][v],!0)}},"\u6062\u590D\u8DDF\u968F")))))))),t.createElement("div",{role:"tabpanel",id:"df-form-panel-generate","aria-labelledby":"df-form-tab-generate",hidden:Ge!=="generate"},!ie&&lt,t.createElement("section",{className:"df-paper df-edit-footer","aria-label":"\u6838\u5BF9\u4E0E\u751F\u6210"},t.createElement("div",{className:"df-generation-plan"},!ie&&t.createElement("h2",null,"\u6838\u5BF9\u4E0E\u751F\u6210"),t.createElement("p",null,"\u672C\u6B21\u8BA1\u5212\u751F\u6210 ",t.createElement("b",null,Be)," \u4EFD\u6587\u4E66"),!ie&&t.createElement("small",null,Y?"\u751F\u6210\u8BBA\u8BC1\u610F\u89C1\u53CA\u7B7E\u5B57\u8868\uFF0C\u4EE5\u53CA\u8BBA\u8BC1\u7ED3\u675F\u540E\u4E0A\u4F20\u7684\u975E\u62DB\u6807\u65B9\u6848\u3002\u7B7E\u5B57\u76D6\u7AE0\u540E\uFF0C\u5728\u9636\u6BB5\u6750\u6599\u4E2D\u7559\u5B58\u626B\u63CF\u4EF6\u3002":oe?"\u6309\u672C\u6B21\u586B\u5199\u5185\u5BB9\u751F\u6210 Word \u8BF4\u660E\u4E0E Excel \u8BA1\u5212\u8868\u3002":t.createElement(t.Fragment,null,N.filter(i=>!i.per_recipient).length," ","\u4EFD\u5171\u7528\u6587\u4EF6 \xB7"," ",N.filter(i=>i.per_recipient).length," ","\u7C7B\u6309\u5355\u4F4D\u6587\u4E66 \xD7 ",s.recipients.length," \u5BB6\u5355\u4F4D"))),t.createElement("div",{className:"df-next-action"},t.createElement("button",{className:"df-primary",onClick:be},"\u6838\u5BF9\u586B\u5199\u5185\u5BB9 \u2192"),!ie&&t.createElement("small",null,Y?"\u6838\u5BF9\u8BBA\u8BC1\u610F\u89C1\u3001\u4E09\u5BB6\u5355\u4F4D\u4E0E\u6210\u5458\u4FE1\u606F\uFF0C\u518D\u786E\u8BA4\u751F\u6210":oe?"\u5148\u6838\u5BF9\u57FA\u7840\u4FE1\u606F\u4E0E\u7533\u62A5\u7ECF\u8D39\uFF0C\u518D\u786E\u8BA4\u751F\u6210":"\u5148\u6838\u5BF9\u7F3A\u9879\u4E0E\u65E5\u671F\uFF0C\u518D\u786E\u8BA4\u751F\u6210"))))),s&&w==="review"&&S&&t.createElement("div",{className:"df-review"},t.createElement("section",{className:"df-paper"},t.createElement("span",{className:"df-eyebrow"},"\u586B\u5199\u6838\u5BF9"),t.createElement("h2",null,S.can_generate?"\u8D44\u6599\u5DF2\u9F50\u5907\uFF0C\u8BF7\u786E\u8BA4\u672C\u6B21\u5185\u5BB9\u3002":`\u8FD8\u6709 ${Xe.length} \u9879\u9700\u8981\u5904\u7406`),t.createElement("p",null,"\u672C\u6B21\u4F7F\u7528\u4FEE\u8BA2 ",s.revision," \u7684\u6570\u636E\uFF0C\u8BA1\u5212\u751F\u6210 ",Be," ","\u4EFD\u6587\u4E66\u3002"),Xe.length>0&&t.createElement("div",{className:"df-checks"},Xe.map((i,o)=>t.createElement("div",{key:o,className:"df-check "+i.status},t.createElement("span",null,i.status==="ok"?"\u901A\u8FC7":i.status==="missing"?"\u5F85\u8865\u5145":"\u51B2\u7A81"),t.createElement("div",null,t.createElement("b",null,i.label),t.createElement("p",null,i.detail)),i.status!=="ok"&&i.field&&t.createElement("button",{onClick:()=>ht(i.field)},"\u4FEE\u6539")))),S.checks.some(i=>i.status==="ok")&&t.createElement("details",{className:"df-passed"},t.createElement("summary",null,S.checks.filter(i=>i.status==="ok").length," ","\u9879\u65E5\u671F\u6821\u6838\u901A\u8FC7 \xB7 \u67E5\u770B\u660E\u7EC6"),S.checks.filter(i=>i.status==="ok").map((i,o)=>t.createElement("p",{key:o},t.createElement("b",null,i.label),t.createElement("br",null),i.detail.replaceAll("T"," ")))),t.createElement("div",{className:"df-review-data"},t.createElement("h3",null,"\u5171\u7528\u4FE1\u606F"),t.createElement("dl",null,s.fields.map(i=>t.createElement("div",{key:i.key,className:Ot(i)?"df-span":void 0},t.createElement("dt",null,i.label),t.createElement("dd",null,(s.document_values?.[i.key]??i.value)||"\u5C1A\u672A\u586B\u5199")))),s.recipients.length>0&&t.createElement(t.Fragment,null,t.createElement("h3",null,"\u53D7\u9080\u5355\u4F4D"),s.recipients.map((i,o)=>t.createElement("p",{key:o},o+1,". ",i.name||"\u5C1A\u672A\u586B\u5199",s.recipient_document_times?.[o]??`${i.start.replace("T"," ")} \u2014 ${i.end.replace("T"," ")}`)))),t.createElement("div",{className:"df-review-data"},t.createElement("h3",null,"\u8F93\u51FA\u6E05\u5355"),N.map(i=>t.createElement("p",{key:i.id},i.name," \xB7"," ",i.per_recipient?s.recipients.map(o=>o.name||"\u5F85\u586B\u5355\u4F4D").join("\u3001"):"\u5171\u7528\u6587\u4EF6",i.print_copies>1&&` \xB7 \u5EFA\u8BAE\u6253\u5370 ${i.print_copies} \u4EFD\uFF0C\u6BCF\u4F4D\u4E13\u5BB6\u4E00\u4EFD`))),t.createElement("div",{className:"df-confirm"},t.createElement("label",null,t.createElement("input",{type:"checkbox",checked:re,disabled:!S.can_generate,onChange:i=>H(i.target.checked)}),Y?"\u6211\u5DF2\u6838\u5BF9\u8BBA\u8BC1\u610F\u89C1\u3001\u5019\u9009\u5355\u4F4D\u3001\u6210\u5458\u4E0E\u7CFB\u7EDF\u586B\u62A5\u4FE1\u606F":oe?"\u6211\u5DF2\u6838\u5BF9\u57FA\u7840\u4FE1\u606F\u3001\u7533\u62A5\u7ECF\u8D39\u548C\u5916\u534F\u5FC5\u8981\u6027":"\u6211\u5DF2\u6838\u5BF9\u586B\u5199\u5185\u5BB9\u3001\u53D7\u9080\u5355\u4F4D\u548C\u65E5\u671F\u5B89\u6392"),t.createElement("p",null,Y?"\u751F\u6210\u540E\u8BF7\u5B8C\u6210\u7EBF\u4E0B\u7B7E\u5B57\u76D6\u7AE0\uFF0C\u518D\u5C06\u975E\u62DB\u6807\u65B9\u6848\u548C\u7B7E\u5B57\u6750\u6599\u4E0A\u4F20\u4E1A\u52A1\u7CFB\u7EDF\u3002":oe?"\u7533\u62A5\u53E3\u5F84\u4E0E\u6A21\u677F\u7248\u5F0F\u8BF7\u7531\u7ECF\u529E\u4EBA\u590D\u6838\u3002":"\u6821\u6838\u68C0\u67E5\u8D44\u6599\u5B8C\u6574\u6027\u53CA\u65F6\u95F4\u987A\u5E8F\u3002\u4E1A\u52A1\u6761\u6B3E\u4E0E Word \u6A21\u677F\u8BF7\u7531\u7ECF\u529E\u4EBA\u590D\u6838\u3002"),t.createElement("div",null,t.createElement("button",{onClick:()=>{E("edit"),H(!1)}},"\u8FD4\u56DE\u4FEE\u6539"),t.createElement("button",{className:"df-primary",disabled:!S.can_generate||!re,onClick:ne},"\u786E\u8BA4\u5E76\u751F\u6210 ",Be," \u4EFD\u6587\u4E66"))))),s&&w==="files"&&U&&t.createElement("div",{className:"df-results"+(P?" df-results-docked":"")},t.createElement("section",{className:"df-paper df-output-list"},t.createElement("span",{className:"df-eyebrow"},"\u751F\u6210\u8BB0\u5F55"),t.createElement("h2",null,U.files.length," \u4EFD\u6587\u4EF6\u5DF2\u751F\u6210"),t.createElement("p",null,Re(U.created_at)," \xB7 \u4FEE\u8BA2 ",U.revision),t.createElement("p",{className:"df-muted"},Y?"\u538B\u7F29\u5305\u5305\u542B\u8BBA\u8BC1\u610F\u89C1\u53CA\u7B7E\u5B57\u8868\u3001\u975E\u62DB\u6807\u65B9\u6848\u3001\u586B\u5199\u6570\u636E\u548C\u6838\u5BF9\u8BB0\u5F55":oe?"\u538B\u7F29\u5305\u5305\u542B Word\u3001\u79D1\u7814\u8BA1\u5212\u8868\u3001\u586B\u5199\u6570\u636E\u548C\u6838\u5BF9\u8BB0\u5F55":"\u538B\u7F29\u5305\u5305\u542B Word\u3001\u586B\u5199\u6570\u636E\u548C\u6838\u5BF9\u8BB0\u5F55"),(u||(U.content_digest?U.content_digest!==s.content_digest:U.revision!==s.revision))&&t.createElement("div",{className:"df-alert"},"\u586B\u5199\u5185\u5BB9\u5DF2\u6709\u4FEE\u6539\uFF0C\u4E0B\u5217\u6587\u4EF6\u4FDD\u7559\u751F\u6210\u65F6\u7684\u5185\u5BB9\u3002\u8BF7\u91CD\u65B0\u6838\u5BF9\u5E76\u751F\u6210\u65B0\u7248\u3002"),dt.map(i=>t.createElement("div",{className:"df-generation",key:i.id},t.createElement("div",{className:"df-generation-heading"},t.createElement("h3",null,Re(i.created_at)," \xB7 \u4FEE\u8BA2 ",i.revision,i.date_style!=="zh-CN"&&" \xB7 \u539F\u65E5\u671F\u683C\u5F0F",i.naming_style!=="formal"&&" \xB7 \u539F\u6587\u4EF6\u540D"),t.createElement("button",{"aria-label":`\u6253\u5305\u4E0B\u8F7D ${Re(i.created_at)} \u4FEE\u8BA2 ${i.revision}`,onClick:()=>we(i)},"\u6253\u5305\u4E0B\u8F7D")),i.files.map(o=>t.createElement("div",{className:"df-output "+(F?.file.name===o.name&&F?.generation.id===i.id?"selected":""),key:o.name},t.createElement("button",{onClick:()=>Ne({file:o,generation:i})},t.createElement("b",null,o.name),t.createElement("small",null,o.recipient," \xB7 ",(o.size/1024).toFixed(0)," KB",o.print_copies>1&&` \xB7 \u5EFA\u8BAE\u6253\u5370 ${o.print_copies} \u4EFD`)),t.createElement("button",{"aria-label":"\u4E0B\u8F7D"+o.name,onClick:()=>te("\u4E0B\u8F7D\u6587\u4EF6",()=>Ze(Le(i,o.name),o.name))},"\u2193")))))),!P&&t.createElement("section",{className:"df-paper df-preview"},t.createElement("div",{className:"df-section-head"},t.createElement("h2",null,F?F.file.name:"\u9009\u62E9\u6587\u4EF6\u9884\u89C8"),t.createElement("span",null,"Office \u9884\u89C8")),t.createElement("div",{className:"df-preview-body"},le&&Ue?t.createElement(pt,{key:le.id,artifact:le},t.createElement(Ue,{key:le.id,artifact:le,readOnly:!0,hostControls:!0})):t.createElement("p",{className:"df-muted"},le?"\u6B63\u5728\u6253\u5F00\u6587\u4EF6\u2026":"\u4ECE\u5DE6\u4FA7\u9009\u62E9\u4E00\u4EFD\u6587\u4EF6\u3002"))))),t.createElement("footer",{className:"df-footer"},t.createElement("span",null,"UGSci \xB7 \u5916\u534F\u52A9\u624B"))),L&&s&&t.createElement("div",{className:"df-dialog-backdrop"},t.createElement("section",{className:"df-dialog df-paper",role:"dialog","aria-modal":"true","aria-label":"\u6838\u5BF9\u5171\u7528\u8D44\u6599"},t.createElement("div",{className:"df-section-head"},t.createElement("h2",null,L==="adopt"?"\u91C7\u7528\u9879\u76EE\u5E95\u7A3F\u4E2D\u7684\u8D44\u6599":"\u5C06\u672C\u8868\u8D44\u6599\u5B58\u5165\u9879\u76EE\u5E95\u7A3F"),t.createElement("button",{disabled:!!M,onClick:()=>q(null),"aria-label":"\u5173\u95ED\u5171\u7528\u8D44\u6599\u6838\u5BF9"},"\xD7")),t.createElement("p",{className:"df-muted"},"\u53EA\u66F4\u65B0\u52FE\u9009\u9879\u3002\u539F\u751F\u6210\u6587\u4EF6\u4FDD\u7559\uFF0C\u540E\u7EED\u751F\u6210\u524D\u9700\u91CD\u65B0\u6838\u5BF9\u3002"),he&&t.createElement("p",{role:"alert",className:"df-alert error"},he),t.createElement("div",{className:"df-compare"},n.fields.filter(i=>s.fields.some(o=>o.key===i.key&&o.value!==i.value)).map(i=>{let o=s.fields.find(v=>v.key===i.key);return t.createElement("label",{key:i.key},t.createElement("input",{type:"checkbox",checked:V.includes(i.key),onChange:v=>I(v.target.checked?[...V,i.key]:V.filter(a=>a!==i.key))}),t.createElement("div",null,t.createElement("b",null,i.label),t.createElement("div",{className:"df-compare-values"},t.createElement("p",null,t.createElement("small",null,"\u5F53\u524D\u8868\u5355"),o.value||"\u7A7A\u767D"),t.createElement("p",null,t.createElement("small",null,"\u9879\u76EE\u5E95\u7A3F"),i.value||"\u7A7A\u767D"))))}),!n.fields.some(i=>s.fields.some(o=>o.key===i.key&&o.value!==i.value))&&t.createElement("p",null,"\u672C\u8868\u4E0E\u9879\u76EE\u5E95\u7A3F\u4E2D\u7684\u5171\u7528\u8D44\u6599\u4E00\u81F4\u3002")),t.createElement("div",{className:"df-actions"},t.createElement("button",{disabled:!!M,onClick:()=>q(null)},"\u53D6\u6D88"),t.createElement("button",{className:"df-primary",disabled:!!M||!V.length,onClick:()=>te("\u540C\u6B65\u5171\u7528\u8D44\u6599",async()=>{let i=await ae();if(L==="adopt")ge(await ce(`/projects/${n.id}/cases/${i.id}/sync`,Ae({revision:n.revision,case_revision:i.revision,keys:V})));else{let o=Object.fromEntries(i.fields.filter(v=>V.includes(v.key)).map(v=>[v.key,v.value]));await ce(`/projects/${n.id}`,{...Ae({revision:n.revision,name:o["project.name"]??n.name,code:o["project.code"]??n.code,owner:n.owner,values:o}),method:"PUT"})}await ve(),q(null),B("\u6240\u9009\u8D44\u6599\u5DF2\u540C\u6B65\uFF0C\u8BF7\u91CD\u65B0\u6838\u5BF9\u540E\u751F\u6210\u65B0\u7248\u6587\u4E66\u3002")})},L==="adopt"?"\u91C7\u7528\u6240\u9009\u9879\u76EE\u8D44\u6599":"\u4FDD\u5B58\u6240\u9009\u8D44\u6599\u5230\u5E95\u7A3F")))))}function na(){let n=ue.host.useSelectedAgent?.();return t.createElement(yt,{key:n?.id||ue.host.getSelectedAgentId?.()||"default",Editor:ia,services:{request:ce,json:Ae,download:Ze,time:Re,Field:Wt}})}ue.registerRoutes("document-forms",[{path:"/apps/document-forms",component:na,label:"\u5916\u534F\u52A9\u624B",icon:"\u25A4"}]);})();
