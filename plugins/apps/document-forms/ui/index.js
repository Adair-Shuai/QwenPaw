(()=>{var H=window.QwenPaw.host.React,{useEffect:Kt,useState:Oe}=H;function Ct({artifact:i,children:c}){return i.extension==="xlsx"?c:H.createElement(ba,{artifact:i},c)}function ba({artifact:i,children:c}){let[o,m]=Oe("print"),[f,p]=Oe([]),[b,h]=Oe(0),[l,g]=Oe(""),[n,x]=Oe(0),[k,B]=Oe(100);return Kt(()=>{if(o!=="print")return;let _=new AbortController,O=[];return p([]),h(0),g(""),window.QwenPaw.host.fetch(i.printUrl+"?pages=true",{headers:i.agentId?{"X-Agent-Id":i.agentId}:{},signal:_.signal}).then(async N=>{if(!N.ok){let T=await N.json().catch(()=>({}));throw new Error(typeof T.detail=="string"?T.detail:"\u6253\u5370\u9884\u89C8\u6682\u4E0D\u53EF\u7528\uFF0C\u53EF\u5207\u6362\u6587\u5B57\u9884\u89C8\u6216\u4E0B\u8F7D Word \u67E5\u770B")}let{pages:y}=await N.json();if(!_.signal.aborted){if(!Number.isInteger(y)||y<1||y>40)throw new Error("\u672A\u83B7\u5F97\u6709\u6548\u7684 Word \u9875\u6570");h(y);for(let T=1;T<=y;T++){let E=await window.QwenPaw.host.fetch(i.printUrl+"?page="+T,{headers:i.agentId?{"X-Agent-Id":i.agentId}:{},signal:_.signal});if(!E.ok)throw new Error(`\u7B2C ${T} \u9875\u672A\u80FD\u6E32\u67D3\uFF0C\u8BF7\u91CD\u65B0\u9884\u89C8`);let $=await E.blob();if(_.signal.aborted)return;let d=URL.createObjectURL($);O.push(d),p(F=>[...F,d])}}}).catch(N=>{_.signal.aborted||g(N.message||"\u6253\u5370\u9884\u89C8\u672A\u5B8C\u6210")}),()=>{_.abort(),O.forEach(N=>URL.revokeObjectURL(N))}},[i.id,i.printUrl,i.agentId,o,n]),H.createElement("div",{className:"df-print-preview"},H.createElement("div",{className:"df-print-toolbar"},H.createElement("div",null,H.createElement("button",{"aria-pressed":o==="print",onClick:()=>m("print")},"\u6253\u5370\u7248\u5F0F"),H.createElement("button",{"aria-pressed":o==="text",onClick:()=>m("text")},"\u6587\u5B57\u9884\u89C8")),o==="print"&&H.createElement("div",null,b>0&&H.createElement("span",null,"\u5171 ",b," \u9875"),H.createElement("select",{"aria-label":"\u9884\u89C8\u6BD4\u4F8B",value:k,onChange:_=>B(Number(_.target.value))},H.createElement("option",{value:100},"\u9002\u5408\u5BBD\u5EA6"),H.createElement("option",{value:125},"125%"),H.createElement("option",{value:150},"150%"),H.createElement("option",{value:200},"200%")))),o==="text"?H.createElement("div",{className:"df-text-preview"},c):l?H.createElement("div",{className:"df-preview-message",role:"alert"},H.createElement("p",null,l),H.createElement("button",{onClick:()=>x(_=>_+1)},"\u91CD\u65B0\u9884\u89C8")):f.length?H.createElement("div",{className:"df-print-scroll"},H.createElement("div",{className:"df-print-pages",style:{width:k+"%"}},f.map((_,O)=>H.createElement("figure",{key:O},H.createElement("figcaption",null,"\u7B2C ",O+1," \u9875"),H.createElement("img",{src:_,alt:i.title+` \xB7 \u6253\u5370\u7248\u5F0F \xB7 \u7B2C ${O+1} \u9875`}))),f.length<b&&H.createElement("p",{role:"status"},"\u6B63\u5728\u6392\u7248\u7B2C ",f.length+1," \u9875\u2026"))):H.createElement("div",{className:"df-preview-message",role:"status"},"\u6B63\u5728\u6392\u7248\u6253\u5370\u9875\u9762\u2026"))}function Te({artifact:i}){let[c,o]=Oe(null),[m,f]=Oe(""),[p,b]=Oe(0);if(Kt(()=>{let l=new AbortController;return o(null),f(""),window.QwenPaw.host.fetch("/workspace/convert-office",{method:"POST",headers:{"Content-Type":"application/json",...i.agentId?{"X-Agent-Id":i.agentId}:{}},signal:l.signal,body:JSON.stringify({url:i.binaryUrl,mime_type:i.mimeType})}).then(async g=>{let n=await g.json();if(!g.ok)throw new Error(typeof n.detail=="string"?n.detail:"\u6587\u4EF6\u9884\u89C8\u672A\u5B8C\u6210");l.signal.aborted||o(n)}).catch(g=>{l.signal.aborted||f(g.message||"\u6587\u4EF6\u9884\u89C8\u672A\u5B8C\u6210")}),()=>l.abort()},[i.id,i.binaryUrl,i.mimeType,i.agentId,p]),m)return H.createElement("div",{className:"df-preview-message",role:"alert"},H.createElement("p",null,m),H.createElement("button",{onClick:()=>b(l=>l+1)},"\u91CD\u65B0\u9884\u89C8"),H.createElement("p",null,"\u4E5F\u53EF\u4EE5\u4ECE\u6587\u4EF6\u6E05\u5355\u4E0B\u8F7D\u540E\u67E5\u770B\u3002"));if(!c)return H.createElement("div",{className:"df-preview-message",role:"status"},"\u6B63\u5728\u6253\u5F00\u6587\u4EF6\u2026");let h=c.engine==="officecli"?c.html:`<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;color:#333;background:#fff;padding:24px 32px;line-height:1.7;max-width:900px;margin:0 auto}table{border-collapse:collapse;width:100%;margin:12px 0}td,th{border:1px solid #ddd;padding:8px 12px}img{max-width:100%;height:auto}h1{font-size:1.6em}h2{font-size:1.3em}.docx-page-break{border-top:2px dashed #ccc;margin:32px 0}</style></head><body>${c.html||""}</body></html>`;return H.createElement("iframe",{className:"df-office-frame",title:i.title,srcDoc:h,sandbox:c.engine==="officecli"?"allow-scripts":"allow-same-origin"})}var Gt=`.df-app {
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
`;var Xt=`.df-stage-toolbar {\r
  display: flex;\r
  flex: 1;\r
  align-items: center;\r
  flex-wrap: wrap;\r
  gap: 10px 16px;\r
  min-width: 0;\r
}\r
.df-stage-tool-slot {\r
  display: contents;\r
}\r
.df-toolbar-file-actions,\r
.df-toolbar-save {\r
  display: flex;\r
  align-items: center;\r
  flex-wrap: wrap;\r
  gap: 6px;\r
}\r
.df-toolbar-save {\r
  position: absolute;\r
  top: 14px;\r
  right: 16px;\r
  justify-content: flex-end;\r
  gap: 8px;\r
  margin-left: auto;\r
}\r
.df-stage-toolbar button,\r
.df-toolbar-menu > summary {\r
  display: inline-flex;\r
  align-items: center;\r
  justify-content: center;\r
  gap: 6px;\r
  min-height: 32px;\r
  padding: 6px 9px;\r
  font-size: 13px;\r
  line-height: 18px;\r
  border: 1px solid var(--df-line);\r
  border-radius: 6px;\r
  background: var(--df-paper);\r
  color: var(--df-text);\r
  cursor: pointer;\r
}\r
.df-stage-toolbar .df-toolbar-icon-button {\r
  width: 32px;\r
  min-width: 32px;\r
  height: 32px;\r
  padding: 0;\r
}\r
.df-stage-toolbar button:hover,\r
.df-toolbar-menu > summary:hover {\r
  border-color: var(--df-accent);\r
}\r
.df-toolbar-menu > summary[aria-disabled="true"] {\r
  opacity: 0.45;\r
  cursor: default;\r
}\r
.df-toolbar-icon {\r
  display: block;\r
  width: 16px;\r
  height: 16px;\r
  flex-shrink: 0;\r
}\r
.df-toolbar-menu {\r
  position: relative;\r
}\r
.df-toolbar-menu-more > .df-toolbar-popover {\r
  left: auto;\r
  right: 0;\r
  width: 280px;\r
}\r
.df-toolbar-menu > summary {\r
  list-style: none;\r
}\r
.df-toolbar-menu > summary::-webkit-details-marker {\r
  display: none;\r
}\r
.df-toolbar-menu > summary:focus-visible {\r
  outline: 2px solid var(--df-accent);\r
  outline-offset: 2px;\r
}\r
.df-toolbar-popover {\r
  position: absolute;\r
  z-index: 10;\r
  top: calc(100% + 8px);\r
  left: 0;\r
  width: min(420px, calc(100vw - 48px));\r
  max-height: min(460px, 65vh);\r
  overflow-y: auto;\r
  padding: 12px;\r
  border: 1px solid var(--df-line);\r
  border-radius: 10px;\r
  background: var(--df-paper);\r
  box-shadow: 0 10px 28px #18203320;\r
}\r
.df-toolbar-popover > .df-field {\r
  margin-bottom: 12px;\r
}\r
.df-toolbar-popover > button {\r
  margin: 0 6px 6px 0;\r
}\r
.df-toolbar-popover .df-template-panel {\r
  border: 0;\r
  box-shadow: none;\r
  margin: 8px 0 0;\r
  padding: 0;\r
}\r
.df-toolbar-popover .df-section-head {\r
  margin-bottom: 12px;\r
}\r
.df-toolbar-popover .df-template-actions {\r
  flex-wrap: wrap;\r
}\r
.df-toolbar-popover .df-template {\r
  font-size: 13px;\r
  padding-top: 12px;\r
  padding-bottom: 12px;\r
}\r
.df-toolbar-popover .df-template > b {\r
  overflow-wrap: anywhere;\r
}\r
.df-save-state {\r
  display: inline-flex;\r
  align-items: center;\r
  gap: 5px;\r
  color: var(--df-muted);\r
  font-size: 12px;\r
  white-space: nowrap;\r
}\r
.df-save-state::before {\r
  content: "";\r
  width: 5px;\r
  height: 5px;\r
  border-radius: 50%;\r
  background: currentColor;\r
}\r
.df-save-state.is-dirty {\r
  color: var(--df-accent);\r
}\r
.df-stage-header {\r
  position: relative;\r
}\r
/* Keep size queries on the persistent column. Containment on the sticky,\r
   remounted header can leave its children with no layout after returning. */\r
.df-project-main {\r
  container-name: df-project-column;\r
  container-type: inline-size;\r
}\r
.df-stage-header,\r
.df-three-column .df-stage-header {\r
  container-type: normal;\r
  flex-direction: column;\r
  align-items: stretch;\r
  padding: 14px 16px 0;\r
  border: 1px solid var(--df-line);\r
  border-radius: 10px;\r
  box-shadow: none;\r
  gap: 12px;\r
}\r
.df-stage-top-row,\r
.df-three-column .df-stage-header > div.df-stage-top-row {\r
  display: flex;\r
  align-items: center;\r
  justify-content: flex-start;\r
  flex-wrap: nowrap;\r
  gap: 20px;\r
  min-width: 0;\r
}\r
.df-stage-header:has(.df-toolbar-save) > .df-stage-top-row {\r
  padding-right: 180px;\r
}\r
.df-stage-heading {\r
  flex-shrink: 0;\r
}\r
.df-stage-header h2,\r
.df-three-column .df-stage-header h2 {\r
  margin: 0;\r
  font-size: 18px;\r
  line-height: 26px;\r
  white-space: nowrap;\r
}\r
.df-stage-bottom-row {\r
  display: flex;\r
  align-items: center;\r
  justify-content: space-between;\r
  flex-wrap: wrap;\r
  gap: 0 16px;\r
  min-height: 46px;\r
  border-top: 1px solid var(--df-line);\r
}\r
.df-stage-bottom-row > .df-workflow-tabs {\r
  margin: 0;\r
  padding: 0;\r
  gap: 20px;\r
  border: 0;\r
}\r
.df-stage-bottom-row > .df-workflow-tabs > button {\r
  padding: 11px 0;\r
  border: 0;\r
  border-bottom: 2px solid transparent;\r
  border-radius: 0;\r
  background: transparent;\r
}\r
.df-stage-bottom-row > .df-workflow-tabs > button[aria-selected="true"] {\r
  border-bottom-color: var(--df-accent);\r
  color: var(--df-accent);\r
}\r
.df-stage-bottom-row .df-node-status {\r
  align-items: center;\r
  justify-content: flex-end;\r
  margin: 0 0 0 auto;\r
  padding: 8px 0;\r
  gap: 8px 12px;\r
  font-size: 12px;\r
}\r
.df-app .df-stage-state {\r
  display: inline-flex;\r
  align-items: center;\r
  gap: 6px;\r
  padding: 4px 8px;\r
  border: 0;\r
  border-radius: 6px;\r
  background: color-mix(in srgb, currentColor 8%, var(--df-paper));\r
  color: var(--df-stage-state-color, var(--df-muted));\r
  font-size: 12px;\r
  line-height: 20px;\r
}\r
.df-app .df-stage-state:hover {\r
  background: color-mix(in srgb, currentColor 13%, var(--df-paper));\r
}\r
.df-stage-state.df-state-in_progress {\r
  --df-stage-state-color: var(--df-accent);\r
}\r
.df-stage-state.df-state-completed {\r
  --df-stage-state-color: var(--app-success-text);\r
}\r
.df-stage-state.df-state-submitted {\r
  --df-stage-state-color: var(--app-warning-text);\r
}\r
.df-app[data-theme="dark"] .df-stage-state.df-state-completed {\r
  --df-stage-state-color: var(--app-success-text);\r
}\r
.df-app[data-theme="dark"] .df-stage-state.df-state-submitted {\r
  --df-stage-state-color: var(--app-warning-text);\r
}\r
.df-stage-state .df-toolbar-icon {\r
  width: 12px;\r
  height: 12px;\r
}\r
.df-state-dot {\r
  width: 6px;\r
  height: 6px;\r
  border-radius: 50%;\r
  background: currentColor;\r
}\r
.df-node-status .df-deadline {\r
  display: inline-flex;\r
  align-items: center;\r
  gap: 6px;\r
  font-size: 12px;\r
  white-space: nowrap;\r
}\r
.df-node-status .df-deadline .df-toolbar-icon {\r
  width: 14px;\r
  height: 14px;\r
}\r
.df-stage-approval-count {\r
  padding-left: 12px;\r
  border-left: 1px solid var(--df-line);\r
  white-space: nowrap;\r
}\r
.df-three-column .df-embedded-editor > .df-main {\r
  padding: 0;\r
}\r
.df-three-column .df-embedded-editor .df-edit-footer {\r
  border-top: 1px solid var(--df-line);\r
}\r
.df-three-column .df-embedded-editor .df-edit-footer p {\r
  margin: 0;\r
}\r
@container df-project-column (max-width: 664px) {\r
  .df-stage-top-row,\r
  .df-three-column .df-stage-header > div.df-stage-top-row {\r
    flex-wrap: wrap;\r
    gap: 12px;\r
  }\r
  .df-stage-header:has(.df-toolbar-save) > .df-stage-top-row {\r
    padding-right: 0;\r
  }\r
  .df-stage-header:has(.df-toolbar-save) .df-stage-heading {\r
    width: 100%;\r
    min-height: 32px;\r
    padding-right: 180px;\r
  }\r
  .df-stage-toolbar {\r
    flex-basis: 100%;\r
  }\r
}\r
@media (max-width: 600px) {\r
  .df-toolbar-popover {\r
    width: min(340px, calc(100vw - 48px));\r
  }\r
}\r
\r
.df-linked-reference {\r
  margin: 0 0 10px;\r
  padding: 10px 12px;\r
  border-left: 2px solid var(--df-accent);\r
  background: var(--df-bg);\r
  color: var(--df-muted);\r
  font-size: 13px;\r
  line-height: 1.8;\r
  overflow-wrap: anywhere;\r
}\r
\r
.df-app .df-delete-file,\r
.df-app .df-danger {\r
  color: #b42318;\r
}\r
.df-delete-file-name {\r
  overflow-wrap: anywhere;\r
  font-weight: 600;\r
}\r
.df-file-deleted {\r
  display: flex;\r
  align-items: center;\r
  justify-content: space-between;\r
  gap: 12px;\r
}\r
\r
.df-app[data-theme="dark"] .df-delete-file,\r
.df-app[data-theme="dark"] .df-danger {\r
  color: #fda29b;\r
}\r
`;var _t=window.QwenPaw,P=_t.host.React,{useState:qe,useEffect:va}=P,Jt={running:"\u6B63\u5728\u6838\u67E5",completed:"\u6838\u67E5\u5B8C\u6210",failed:"\u672A\u5B8C\u6210",interrupted:"\u5DF2\u4E2D\u65AD"},Yt=".doc,.docx,.pdf,.xls,.xlsx,.png,.jpg,.jpeg";function ht({project:i,services:c,onChanged:o}){let{request:m,download:f,time:p}=c,[b,h]=qe(null),[l,g]=qe(""),[n,x]=qe(null),[k,B]=qe([]),[_,O]=qe(""),[N,y]=qe(""),[T,E]=qe(!1),[$,d]=qe(""),[F,G]=qe(0);va(()=>{let z=!0,V,q=!1;async function K(){try{let de=await m(`/projects/${i.id}/response-reviews`);if(!z)return;h(de),d("");let ee=de.records.some(De=>De.status==="running");q&&!ee&&o(),q=ee,ee&&(V=setTimeout(K,3e3))}catch(de){z&&d(de.message)}}return K(),()=>{z=!1,clearTimeout(V)}},[i.id,F]);let C=b?.records.some(z=>z.status==="running"),v=b?.records.find(z=>z.id===N)||b?.records[0],M=_t.host.ReactMarkdown;async function X(z){z.preventDefault(),d(""),E(!0);try{let V=new FormData;l?V.set("reference_id",l):n&&V.set("reference",n);for(let K of k)V.append("responses",K);V.set("focus",_);let q=await m(`/projects/${i.id}/response-reviews`,{method:"POST",body:V});y(q.id),h(K=>({...K,records:[q,...K?.records||[]]})),G(K=>K+1)}catch(V){d(V.message)}finally{E(!1)}}return P.createElement("div",{className:"df-response-review"},P.createElement("p",{className:"df-muted"},"\u5BF9\u7167\u8C08\u5224\u6587\u4EF6\uFF0C\u9010\u5BB6\u68C0\u67E5\u8D44\u8D28\u3001\u6280\u672F\u54CD\u5E94\u3001\u62A5\u4EF7\u3001\u65E5\u671F\u4E0E\u7B7E\u7AE0\u9644\u4EF6\u3002\u6838\u67E5\u610F\u89C1\u4F9B\u7ECF\u529E\u4EBA\u548C\u4E13\u5BB6\u590D\u6838\u3002"),$&&P.createElement("div",{className:"df-alert error",role:"alert"},$,P.createElement("button",{onClick:()=>G(z=>z+1)},"\u91CD\u65B0\u52A0\u8F7D")),b?P.createElement(P.Fragment,null,P.createElement("form",{onSubmit:X},P.createElement("fieldset",{disabled:T||C},P.createElement("label",{className:"df-field"},P.createElement("span",null,"\u6838\u67E5\u4F9D\u636E"),P.createElement("select",{"aria-label":"\u6838\u67E5\u4F9D\u636E",value:l,onChange:z=>{g(z.target.value),x(null)}},P.createElement("option",{value:""},"\u4E0A\u4F20\u6B63\u5F0F\u8C08\u5224\u6587\u4EF6"),b.references.map(z=>P.createElement("option",{key:z.id,value:z.id},z.label)))),!l&&P.createElement("label",{className:"df-field"},P.createElement("span",null,"\u6B63\u5F0F\u8C08\u5224\u6587\u4EF6"),P.createElement("input",{"aria-label":"\u4E0A\u4F20\u6838\u67E5\u4F9D\u636E",type:"file",accept:Yt,required:!0,onChange:z=>x(z.target.files[0]||null)})),P.createElement("label",{className:"df-field"},P.createElement("span",null,"\u5404\u5355\u4F4D\u54CD\u5E94\u6750\u6599"),P.createElement("input",{"aria-label":"\u4E0A\u4F20\u54CD\u5E94\u6750\u6599",type:"file",multiple:!0,required:!0,accept:Yt,onChange:z=>B([...z.target.files])})),k.length>0&&P.createElement("ul",{className:"df-review-files"},k.map((z,V)=>P.createElement("li",{key:V},z.name))),P.createElement("p",{className:"df-muted"},"\u652F\u6301 Word\u3001PDF\u3001Excel \u548C\u56FE\u7247\uFF1B\u53EF\u4E00\u6B21\u9009\u62E9\u591A\u5BB6\u6750\u6599\u3002\u6BCF\u4EFD\u4E0D\u8D85\u8FC7 15 MB\uFF0C\u6BCF\u6B21\u6700\u591A 20 \u4EFD\u3001\u5408\u8BA1 100 MB\u3002\u538B\u7F29\u5305\u8BF7\u5148\u89E3\u538B\u3002"),P.createElement("label",{className:"df-field"},P.createElement("span",null,"\u8865\u5145\u5173\u6CE8\u70B9\uFF08\u9009\u586B\uFF09"),P.createElement("textarea",{"aria-label":"\u8865\u5145\u6838\u67E5\u5173\u6CE8\u70B9",rows:3,maxLength:3e3,value:_,onChange:z=>O(z.target.value),placeholder:"\u4F8B\u5982\uFF1A\u91CD\u70B9\u6838\u5BF9\u62A5\u4EF7\u5927\u5C0F\u5199\u3001\u6210\u679C\u4EA4\u4ED8\u65F6\u95F4\u548C\u8D44\u8D28\u6709\u6548\u671F"})),P.createElement("div",{className:"df-actions"},P.createElement("button",{className:"df-primary",disabled:T||C||!(l||n)||!k.length},T?"\u6B63\u5728\u63D0\u4EA4\u2026":"\u5F00\u59CB\u6838\u67E5"),P.createElement("span",{className:"df-muted"},"\u4F7F\u7528\u201C\u54CD\u5E94\u6587\u4EF6\u6838\u67E5\u201D\u667A\u80FD\u4F53\uFF0C\u6CBF\u7528\u8F6F\u4EF6\u4E2D\u7684\u6A21\u578B\u914D\u7F6E\u3002")))),b.records.length>0&&P.createElement("section",{className:"df-review-history"},P.createElement("div",{className:"df-section-head"},P.createElement("h3",null,"\u6838\u67E5\u8BB0\u5F55"),P.createElement("button",{onClick:()=>G(z=>z+1)},"\u5237\u65B0\u8BB0\u5F55")),P.createElement("div",{className:"df-review-records"},b.records.map(z=>P.createElement("button",{key:z.id,"aria-pressed":v?.id===z.id,onClick:()=>y(z.id)},p(z.created_at)," \xB7 ",Jt[z.status]))),v&&P.createElement("article",{"aria-label":"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5\u7ED3\u679C"},P.createElement("div",{className:"df-section-head"},P.createElement("div",null,P.createElement("b",null,Jt[v.status]),P.createElement("p",{className:"df-muted"},"\u57FA\u4E8E\u9879\u76EE\u4FEE\u8BA2 ",v.project_revision," \xB7"," ",v.files.length," \u4EFD\u6750\u6599\uFF1B\u540E\u7EED\u6750\u6599\u4FEE\u6539\u8BF7\u91CD\u65B0\u6838\u67E5\u3002")),v.status==="completed"&&P.createElement("button",{onClick:async()=>{try{await f(`/projects/${i.id}/response-reviews/${v.id}/report`,`${i.name}_\u54CD\u5E94\u6587\u4EF6\u6838\u67E5\u8BB0\u5F55_${v.id.slice(0,8)}.md`)}catch(z){d(z.message)}}},"\u4E0B\u8F7D\u6838\u67E5\u8BB0\u5F55")),P.createElement("details",null,P.createElement("summary",null,"\u672C\u6B21\u6838\u67E5\u6750\u6599\u4E0E\u5173\u6CE8\u70B9"),P.createElement("ul",null,v.files.map((z,V)=>P.createElement("li",{key:V},z.role,"\uFF1A",z.name))),P.createElement("p",null,v.focus||"\u65E0\u8865\u5145\u5173\u6CE8\u70B9")),v.status==="running"&&P.createElement("p",{role:"status",className:"df-alert"},"\u6B63\u5728\u8BFB\u53D6\u5E76\u6838\u67E5\u6750\u6599\uFF0C\u53EF\u5173\u95ED\u6B64\u7A97\u53E3\uFF0C\u7A0D\u540E\u56DE\u5230\u672C\u9879\u76EE\u67E5\u770B\u7ED3\u679C\u3002"),v.error&&P.createElement("p",{role:"alert",className:"df-alert error"},v.error),v.report&&P.createElement("div",{className:"df-review-report"},M?P.createElement(M,{remarkPlugins:_t.host.remarkGfm?[_t.host.remarkGfm]:[],components:{a:({children:z})=>P.createElement("span",null,z),img:()=>null}},v.report):P.createElement("div",{style:{whiteSpace:"pre-wrap"}},v.report))))):P.createElement("p",{role:"status"},"\u6B63\u5728\u8BFB\u53D6\u6838\u67E5\u8BB0\u5F55\u2026"))}var st=window.QwenPaw,j=st.host.React,{useState:Ye,useEffect:It,useRef:Zt}=j;function wa({project:i,stageId:c,selection:o,services:m}){let{request:f,json:p,time:b}=m,[h,l]=Ye([]),[g,n]=Ye(""),[x,k]=Ye(!1),[B,_]=Ye(""),[O,N]=Ye(0),y=Zt(null);It(()=>{let d=!0,F;async function G(){try{let C=await f(`/projects/${i.id}/assistant`);if(!d)return;l(C.messages),_(""),C.messages.some(v=>v.status==="running")&&(F=setTimeout(G,2500))}catch(C){d&&_(C.message)}}return G(),()=>{d=!1,clearTimeout(F)}},[i.id,O]),It(()=>{y.current?.scrollIntoView?.({block:"nearest"})},[h.length,h.at(-1)?.status]);let T=x||h.some(d=>d.status==="running"),E=st.host.ReactMarkdown;async function $(d){if(d.preventDefault(),!(!g.trim()||T)){k(!0),_("");try{let F=await f(`/projects/${i.id}/assistant`,p({message:g.trim(),stage_id:c||"overview",file:o?.reference||{}}));l(G=>[...G,F]),n(""),N(G=>G+1)}catch(F){_(F.message)}finally{k(!1)}}}return j.createElement("section",{className:"df-project-chat","aria-label":"\u9879\u76EE\u667A\u80FD\u4F53\u95EE\u7B54"},j.createElement("div",{className:"df-chat-messages","aria-live":"polite"},!h.length&&j.createElement("div",{className:"df-chat-welcome"},["\u672C\u9636\u6BB5\u8FD8\u9700\u8981\u51C6\u5907\u54EA\u4E9B\u6750\u6599\uFF1F","\u5E2E\u6211\u6838\u5BF9\u5F53\u524D\u6587\u4EF6\u4E2D\u7684\u65E5\u671F\u548C\u91D1\u989D\u3002"].map(d=>j.createElement("button",{key:d,onClick:()=>n(d)},d))),h.map(d=>j.createElement("article",{className:"df-chat-turn",key:d.id},j.createElement("div",{className:"df-chat-question"},j.createElement("small",null,"\u6211 \xB7 ",b(d.created_at)),j.createElement("p",null,d.message),d.file_name&&j.createElement("small",null,"\u53C2\u8003\u6587\u4EF6\uFF1A",d.file_name)),d.reply&&j.createElement("div",{className:"df-chat-answer"},j.createElement("small",null,"\u9879\u76EE\u52A9\u624B"),E?j.createElement(E,{remarkPlugins:st.host.remarkGfm?[st.host.remarkGfm]:[],components:{img:()=>null,a:({children:F})=>j.createElement("span",null,F)}},d.reply):j.createElement("p",{style:{whiteSpace:"pre-wrap"}},d.reply)),d.status==="running"&&j.createElement("p",{role:"status",className:"df-muted"},"\u6B63\u5728\u7ED3\u5408\u9879\u76EE\u8D44\u6599\u6574\u7406\u56DE\u7B54\u2026"),d.error&&j.createElement("p",{role:"alert",className:"df-alert error"},d.error))),j.createElement("div",{ref:y})),B&&j.createElement("p",{role:"alert",className:"df-alert error"},B,j.createElement("button",{onClick:()=>N(d=>d+1)},"\u91CD\u65B0\u52A0\u8F7D")),j.createElement("form",{className:"df-chat-composer",onSubmit:$},o&&j.createElement("small",{className:"df-chat-context"},"\u53C2\u8003\u6587\u4EF6\uFF1A",o.artifact.title),j.createElement("textarea",{"aria-label":"\u5411\u9879\u76EE\u667A\u80FD\u4F53\u63D0\u95EE",placeholder:"\u8F93\u5165\u5F53\u524D\u9879\u76EE\u7684\u95EE\u9898\u2026",rows:3,maxLength:4e3,value:g,onChange:d=>n(d.target.value)}),j.createElement("div",{className:"df-actions"},j.createElement("button",{className:"df-primary",disabled:T||!g.trim()},T?"\u6B63\u5728\u56DE\u7B54\u2026":"\u53D1\u9001\u95EE\u9898"))))}function At({collapsed:i=!1,width:c,maxWidth:o,onResize:m,onToggle:f,project:p,stageId:b,services:h,mode:l,onMode:g,selection:n,onSelect:x,attachment:k,AttachmentPreview:B,onChanged:_,dirty:O=!1}){let N=Zt(null),[y,T]=Ye(!1),E=()=>{N.current=null,T(!1)},[$,d]=Ye(null),[F,G]=Ye("");async function C(v,M){try{G(""),await h.download(v,M)}catch(X){G(X.message)}}return It(()=>{if(l!=="preview"||!n&&!k||$)return;let v=!0;return(st.workspace?.loadPreview?st.workspace.loadPreview():Promise.resolve(Te)).then(M=>v&&d(()=>M)).catch(()=>v&&d(()=>Te)),()=>{v=!1}},[l,n,k,$]),j.createElement("aside",{className:"df-right-workspace"+(i?" df-pane-collapsed":"")+(y?" df-resizing":""),"aria-label":"\u9879\u76EE\u667A\u80FD\u4F53\u4E0E\u6587\u4EF6\u9884\u89C8"},j.createElement("div",{className:"df-dock-resizer",role:"separator","aria-label":"\u8C03\u6574\u95EE\u7B54\u4E0E\u9884\u89C8\u680F\u5BBD\u5EA6","aria-orientation":"vertical","aria-valuemin":300,"aria-valuemax":o,"aria-valuenow":c,"aria-valuetext":c+" \u50CF\u7D20",tabIndex:0,title:"\u5DE6\u53F3\u62D6\u52A8\u8C03\u6574\u5BBD\u5EA6\uFF1B\u53CC\u51FB\u6062\u590D\u9ED8\u8BA4\u5BBD\u5EA6",onPointerDown:v=>{v.button===0&&(v.preventDefault(),N.current={x:v.clientX,width:c,pointer:v.pointerId},v.currentTarget.setPointerCapture?.(v.pointerId),T(!0))},onPointerMove:v=>{N.current&&N.current.pointer===v.pointerId&&m(N.current.width+N.current.x-v.clientX)},onPointerUp:E,onPointerCancel:E,onLostPointerCapture:E,onDoubleClick:()=>m(500),onKeyDown:v=>{let M={ArrowLeft:c+24,ArrowRight:c-24,Home:300,End:o}[v.key];M!==void 0&&(v.preventDefault(),m(M))}}),j.createElement("button",{className:"df-pane-toggle","aria-label":i?"\u5C55\u5F00\u95EE\u7B54\u4E0E\u9884\u89C8\u680F":"\u6536\u8D77\u95EE\u7B54\u4E0E\u9884\u89C8\u680F","aria-expanded":!i,title:i?"\u5C55\u5F00\u95EE\u7B54\u4E0E\u9884\u89C8\u680F":"\u6536\u8D77\u95EE\u7B54\u4E0E\u9884\u89C8\u680F",onClick:f},j.createElement("span",{"aria-hidden":"true"},i?"\u2039":"\u203A"),j.createElement("span",null,i?"\u95EE\u7B54\u4E0E\u9884\u89C8":"\u6536\u8D77")),j.createElement("header",null,j.createElement("div",null,j.createElement("h2",null,l==="preview"?"\u6587\u4EF6\u9884\u89C8":l==="review"?"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5":"\u9879\u76EE\u95EE\u7B54")),j.createElement("div",{className:"df-dock-tabs",role:"tablist","aria-label":"\u53F3\u4FA7\u5DE5\u4F5C\u533A"},j.createElement("button",{role:"tab","aria-selected":l==="assistant",onClick:()=>g("assistant")},"\u95EE\u7B54"),j.createElement("button",{role:"tab","aria-selected":l==="preview",onClick:()=>g("preview")},"\u9884\u89C8"))),F&&j.createElement("p",{role:"alert",className:"df-alert error"},F),j.createElement("div",{className:"df-right-body",hidden:l!=="assistant"},j.createElement(wa,{project:p,stageId:["overview","profile"].includes(b)?"overview":b,selection:n,services:h}),b==="negotiation"&&j.createElement("button",{className:"df-open-review",onClick:()=>g("review")},"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5 \u2192")),j.createElement("div",{className:"df-right-body",hidden:l!=="review"},j.createElement("button",{className:"df-back-link",onClick:()=>g("assistant")},"\u2190 \u8FD4\u56DE\u95EE\u7B54"),l==="review"&&j.createElement(ht,{key:p.id,project:p,services:h,onChanged:_})),j.createElement("div",{className:"df-right-body df-right-preview",hidden:l!=="preview"},O&&j.createElement("p",{className:"df-alert"},"\u4E2D\u95F4\u8868\u5355\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\uFF0C\u9884\u89C8\u6587\u4EF6\u4FDD\u7559\u751F\u6210\u65F6\u7684\u5185\u5BB9\u3002"),k?j.createElement(B,{key:k.id,file:k,projectId:p.id,download:C,embedded:!0,onClose:()=>x(null)}):n?j.createElement("section",{className:"df-dock-preview","aria-label":"\u6587\u4EF6\u9884\u89C8"},j.createElement("h3",{title:n.artifact.title},n.artifact.title),$&&n.artifact.extension==="xlsx"?j.createElement("div",{className:"df-dock-office"},j.createElement($,{artifact:n.artifact,readOnly:!0,hostControls:!0})):$?j.createElement(Ct,{key:n.artifact.id,artifact:n.artifact},j.createElement($,{artifact:n.artifact,readOnly:!0,hostControls:!0})):j.createElement("p",{role:"status"},"\u6B63\u5728\u6253\u5F00\u9884\u89C8\u2026")):j.createElement("p",{className:"df-dock-empty"},"\u4ECE\u300C\u6587\u4EF6\u751F\u6210\u300D\u3001\u5BA1\u6279\u8D44\u6599\u6216\u5176\u4ED6\u9644\u4EF6\u4E2D\u9009\u62E9\u6587\u4EF6\u9884\u89C8\u3002")))}var Rt=window.QwenPaw.host.React;function xt({id:i,label:c,items:o,value:m,onChange:f}){return Rt.createElement("div",{className:"df-workflow-tabs",role:"tablist","aria-label":c},o.map((p,b)=>Rt.createElement("button",{type:"button",role:"tab",key:p.id,className:p.align==="end"?"df-workflow-tab-end":void 0,id:`${i}-tab-${p.id}`,"aria-controls":`${i}-panel-${p.id}`,"aria-selected":m===p.id,tabIndex:m===p.id?0:-1,onClick:()=>f(p.id),onKeyDown:h=>{let l;h.key==="ArrowRight"&&(l=(b+1)%o.length),h.key==="ArrowLeft"&&(l=(b+o.length-1)%o.length),h.key==="Home"&&(l=0),h.key==="End"&&(l=o.length-1),l!==void 0&&(h.preventDefault(),f(o[l].id),h.currentTarget.parentElement.children[l].focus())}},p.label)))}var Fe=["\u9879\u76EE\u7814\u7A76\u5185\u5BB9","\u8003\u6838\u6307\u6807\u4E0E\u8FDB\u5EA6\u5B89\u6392","\u53D7\u9080\u5355\u4F4D\u4E0E\u8D44\u683C\u8981\u6C42","\u8C08\u5224\u8981\u6C42","\u5B9E\u65BD\u65B9\u6848"];function ea(i,c){if(c==="negotiation"){let o=i.key.split(".")[0];if(["project","research"].includes(o))return Fe[0];if(["deliverables","metrics","workload","milestones"].includes(o))return Fe[1];if(o==="qualification")return Fe[2];if(o==="implementation")return Fe[4];if(["organization","org","contact","purchaser","dates","events","submission","place","budget"].includes(o))return Fe[3];let m={\u9879\u76EE\u8D44\u6599:0,\u7814\u7A76\u5185\u5BB9:0,\u6210\u679C\u4E0E\u8003\u6838:1,\u8FDB\u5EA6\u5B89\u6392:1,\u8D44\u683C\u8981\u6C42:2,\u5355\u4F4D\u4E0E\u8054\u7CFB:3,\u8D39\u7528\u4FE1\u606F:3,\u65E5\u671F\u5B89\u6392:3,\u5730\u70B9\u5B89\u6392:3,\u670D\u52A1\u9009\u5546\u5B9E\u65BD\u65B9\u6848:4}[i.group];if(m!==void 0)return Fe[m]}return/^selection\.member\d+_/.test(i.key)?"\u8BBA\u8BC1\u6210\u5458":/^selection\.partner\d+_/.test(i.key)?"\u5019\u9009\u5355\u4F4D":{\u5355\u4F4D\u4E0E\u8054\u7CFB:"\u8054\u7CFB\u4E0E\u8D39\u7528",\u8D39\u7528\u4FE1\u606F:"\u8054\u7CFB\u4E0E\u8D39\u7528",\u65E5\u671F\u5B89\u6392:"\u65F6\u95F4\u4E0E\u5730\u70B9",\u5730\u70B9\u5B89\u6392:"\u65F6\u95F4\u4E0E\u5730\u70B9",\u670D\u52A1\u9009\u5546\u5B9E\u65BD\u65B9\u6848:"\u5B9E\u65BD\u65B9\u6848"}[i.group]||i.group||"\u586B\u5199\u4FE1\u606F"}var A=window.QwenPaw.host.React,{useEffect:ta,useRef:ya,useState:ka}=A;function be({name:i}){return A.createElement("svg",{className:"df-toolbar-icon",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true"},{template:A.createElement(A.Fragment,null,A.createElement("path",{d:"M8 3h8l4 4v13H8z"}),A.createElement("path",{d:"M16 3v5h4M4 7v14M11 12h6M11 16h6"})),import:A.createElement(A.Fragment,null,A.createElement("path",{d:"M5 3h9l5 5v13H5zM14 3v5h5"}),A.createElement("path",{d:"M12 10v8m-3-3 3 3 3-3"})),export:A.createElement(A.Fragment,null,A.createElement("path",{d:"M5 3h9l5 5v13H5zM14 3v5h5"}),A.createElement("path",{d:"M12 18v-8m-3 3 3-3 3 3"})),save:A.createElement(A.Fragment,null,A.createElement("path",{d:"M4 3h13l4 4v14H4zM8 3v6h9V3M8 21v-8h9v8"})),download:A.createElement(A.Fragment,null,A.createElement("path",{d:"M12 3v12M7 10l5 5 5-5M4 16v5h16v-5"})),file:A.createElement(A.Fragment,null,A.createElement("path",{d:"M5 3h10l4 4v14H5zM15 3v5h4M8 12h8M8 16h6"})),settings:A.createElement(A.Fragment,null,A.createElement("path",{d:"M4 6h16M4 12h16M4 18h16"}),A.createElement("circle",{cx:"9",cy:"6",r:"2"}),A.createElement("circle",{cx:"15",cy:"12",r:"2"}),A.createElement("circle",{cx:"9",cy:"18",r:"2"})),calendar:A.createElement(A.Fragment,null,A.createElement("rect",{x:"3",y:"5",width:"18",height:"16",rx:"2"}),A.createElement("path",{d:"M7 3v4M17 3v4M3 11h18M7 15h2M13 15h2"})),more:A.createElement(A.Fragment,null,A.createElement("circle",{cx:"5",cy:"12",r:"1"}),A.createElement("circle",{cx:"12",cy:"12",r:"1"}),A.createElement("circle",{cx:"19",cy:"12",r:"1"})),back:A.createElement("path",{d:"m10 5-7 7 7 7M3 12h18"}),chevron:A.createElement("path",{d:"m7 10 5 5 5-5"})}[i])}function Ot({label:i,icon:c,disabled:o,children:m,iconOnly:f=!1}){let p=ya(null),[b,h]=ka(!1);return ta(()=>{let l=n=>{p.current?.contains(n.target)||h(!1)},g=n=>{n.key!=="Escape"||!p.current?.open||(n.preventDefault(),n.stopPropagation(),h(!1),p.current.querySelector("summary").focus())};return document.addEventListener("pointerdown",l),document.addEventListener("keydown",g,!0),()=>{document.removeEventListener("pointerdown",l),document.removeEventListener("keydown",g,!0)}},[]),ta(()=>{o&&h(!1)},[o]),A.createElement("details",{className:"df-toolbar-menu"+(f?" df-toolbar-menu-more":""),ref:p,open:b},A.createElement("summary",{"aria-label":i,title:i,"aria-disabled":o||void 0,tabIndex:o?-1:0,onClick:l=>{l.preventDefault(),o||h(g=>!g)},onKeyDown:l=>{o&&["Enter"," "].includes(l.key)&&l.preventDefault()}},A.createElement(be,{name:c}),!f&&A.createElement("span",null,i),!f&&A.createElement(be,{name:"chevron"})),b&&A.createElement("div",{className:"df-toolbar-popover",role:"region","aria-label":i+"\u83DC\u5355"},m))}var Ze=window.QwenPaw,Q=Ze.host.React,{useEffect:vt,useRef:Na,useState:lt}=Q,aa=/审批|批复|回执|签章|签字|审查意见|论证意见|验收意见|验收凭据|付款凭证/;function ia(i){let c=[],o=[];for(let m of i){let f=aa.test(m.name),p=m.files.filter(h=>f||h.approval_review||aa.test(h.name)),b=m.files.filter(h=>!p.includes(h));(f||p.length)&&c.push({...m,files:p}),(!f||b.length)&&o.push({...m,files:b})}return{approvals:c,attachments:o}}function Ca({file:i,projectId:c,agentId:o,active:m,availableIds:f}){let p=Na(new Map),[b,h]=lt(null),[l,g]=lt(""),[n,x]=lt(0),[k,B]=lt(null),_=i?.name.split(".").pop().toLowerCase(),O=["pdf","png","jpg","jpeg","webp","gif"].includes(_),N=i?i.id+":"+(i.sha256||""):"";if(vt(()=>()=>{for(let y of p.current.values())URL.revokeObjectURL(y.url);p.current.clear()},[]),vt(()=>{let y=new Set(f.split(","));for(let[T,E]of p.current)y.has(T.split(":")[0])||(p.current.delete(T),URL.revokeObjectURL(E.url))},[f]),vt(()=>{if(!m||!i||!O)return;g("");let y=p.current.get(N);if(y){h({identity:N,url:y.url});return}h(null);let T=new AbortController,E=window.setTimeout(()=>{g("\u8BFB\u53D6\u8F83\u6162\uFF0C\u8BF7\u91CD\u8BD5\u6216\u4E0B\u8F7D\u539F\u6587\u4EF6\u67E5\u770B\u3002"),T.abort()},2e4);return Ze.host.fetch(`/document-forms/projects/${c}/files/${i.id}`,{signal:T.signal,headers:o?{"X-Agent-Id":o}:{}}).then(async $=>{if(!$.ok)throw new Error("\u6587\u4EF6\u672A\u80FD\u6253\u5F00\uFF0C\u8BF7\u91CD\u8BD5\u6216\u4E0B\u8F7D\u539F\u6587\u4EF6\u3002");let d=await $.blob();if(T.signal.aborted)return;let F=URL.createObjectURL(new Blob([d],{type:_==="pdf"?"application/pdf":"image/"+(_==="jpg"?"jpeg":_)}));p.current.set(N,{url:F,size:d.size});let G=[...p.current.values()].reduce((C,v)=>C+v.size,0);for(let[C,v]of p.current){if(p.current.size<=3&&G<=32*1024*1024)break;C!==N&&(p.current.delete(C),URL.revokeObjectURL(v.url),G-=v.size)}h({identity:N,url:F})}).catch($=>{T.signal.aborted||g($.message)}).finally(()=>window.clearTimeout(E)),()=>{window.clearTimeout(E),T.abort()}},[N,m,O,c,o,n]),vt(()=>{if(!m||_!=="pdf"||b?.identity!==N||k)return;let y=!0,T=!!Ze.workspace?.loadPdfPreview,E=Ze.workspace?.loadPdfPreview||Ze.workspace?.loadPreview;if(E)return E().then($=>{y&&B({component:$,direct:T})}).catch(()=>{y&&g("PDF \u9605\u8BFB\u5668\u672A\u80FD\u6253\u5F00\uFF0C\u8BF7\u91CD\u8BD5\u6216\u4E0B\u8F7D\u539F\u6587\u4EF6\u3002")}),()=>{y=!1}},[m,_,b,N,k,n]),!i)return Q.createElement("div",{className:"df-approval-empty"},"\u5C1A\u672A\u4E0A\u4F20\u5BA1\u6279\u6587\u4EF6");if(!O)return Q.createElement("div",{className:"df-approval-empty"},"\u6B64\u6587\u4EF6\u53EF\u901A\u8FC7\u201C\u9884\u89C8\u201D\u6253\u5F00\uFF1BPDF \u6216\u56FE\u7247\u53EF\u5728\u8FD9\u91CC\u76F4\u63A5\u6D4F\u89C8\u3002");if(l)return Q.createElement("div",{className:"df-approval-empty",role:"alert"},Q.createElement("p",null,l),Q.createElement("button",{onClick:()=>x(y=>y+1)},"\u91CD\u65B0\u52A0\u8F7D\u5BA1\u6279\u6587\u4EF6"));if(!b||b.identity!==N)return Q.createElement("div",{className:"df-approval-empty",role:"status"},"\u6B63\u5728\u8BFB\u53D6\u5BA1\u6279\u6587\u4EF6\u2026");if(_==="pdf"&&k){let y=k.component;return Q.createElement("div",{className:"df-approval-pdf",role:"region","aria-label":i.name},k.direct?Q.createElement(y,{url:b.url,fileSize:i.size,theme:"light"}):Q.createElement(y,{artifact:{id:i.id,title:i.name,source:"uploaded",extension:"pdf",mimeType:"application/pdf",binaryUrl:b.url,agentId:o,size:i.size},readOnly:!0,hostControls:!0}))}return _==="pdf"&&(Ze.workspace?.loadPdfPreview||Ze.workspace?.loadPreview)?Q.createElement("div",{className:"df-approval-empty",role:"status"},"\u6B63\u5728\u6253\u5F00 PDF \u9605\u8BFB\u5668\u2026"):_==="pdf"?Q.createElement("iframe",{className:"df-approval-pdf",title:i.name,src:b.url+"#view=FitH"}):Q.createElement("div",{className:"df-approval-image-scroll"},Q.createElement("img",{src:b.url,alt:i.name,decoding:"async"}))}function qt({projectId:i,materials:c,active:o,onUpload:m,onEdit:f,onAdd:p,onPreview:b,onDownload:h,onDelete:l,busy:g,review:n}){let[x,k]=lt(""),[B,_]=lt(""),O=c.find($=>$.id===x)||c.find($=>$.files.length)||c[0],N=O?.files||[],y=N.find($=>$.id===B)||N.at(-1),T=N.at(-1)?.id;vt(()=>_(""),[T]);let E=Ze.host.getSelectedAgentId?.();return Q.createElement("section",{className:"df-paper df-approval-documents",id:"df-node-materials"},Q.createElement("div",{className:"df-section-head"},Q.createElement("h2",null,"\u5BA1\u6279\u8D44\u6599"),Q.createElement("div",{className:"df-actions"},O&&Q.createElement("button",{"aria-label":"\u4E0A\u4F20"+O.name,title:"\u4E0A\u4F20"+O.name,onClick:()=>m(O)},"\u4E0A\u4F20\u5BA1\u6279\u6587\u4EF6"),O&&Q.createElement("button",{"aria-label":"\u7F16\u8F91"+O.name,onClick:()=>f(O)},"\u529E\u7406\u4FE1\u606F"),Q.createElement("button",{onClick:p},"\uFF0B \u6DFB\u52A0\u6750\u6599"))),c.length>0&&Q.createElement("div",{className:"df-approval-file-tools"},Q.createElement("select",{"aria-label":"\u5BA1\u6279\u6750\u6599\u7C7B\u578B",value:O.id,onChange:$=>{k($.target.value),_("")}},c.map($=>Q.createElement("option",{key:$.id,value:$.id},$.name))),y&&Q.createElement("select",{"aria-label":"\u5BA1\u6279\u6587\u4EF6\u7248\u672C",value:y.id,onChange:$=>_($.target.value)},[...N].reverse().map(($,d)=>Q.createElement("option",{key:$.id,value:$.id},"V",$.version||N.length-d," \xB7 ",$.name))),y&&Q.createElement("span",{className:"df-muted df-approval-versions"},N.length," \u4EFD\u6587\u4EF6 / \u7248\u672C \xB7 \u6700\u65B0\uFF1A",N.at(-1).name),y&&Q.createElement("div",{className:"df-actions"},!["pdf","png","jpg","jpeg","webp","gif"].includes(y.name.split(".").pop().toLowerCase())&&Q.createElement("button",{onClick:()=>b(y)},"\u9884\u89C8"),Q.createElement("button",{"aria-label":"\u4E0B\u8F7D"+y.name+"\u7248\u672C"+(y.version||N.indexOf(y)+1),onClick:()=>h(y)},"\u4E0B\u8F7D\u539F\u6587\u4EF6"),l&&Q.createElement("button",{className:"df-delete-file",disabled:g,"aria-label":"\u5220\u9664"+y.name+"\u7248\u672C"+(y.version||N.indexOf(y)+1),onClick:()=>l(O,y)},"\u5220\u9664"))),n,Q.createElement(Ca,{key:i+":"+E,projectId:i,file:y,agentId:E,active:o,availableIds:c.flatMap($=>$.files.map(d=>d.id)).join(",")}))}var Ue=window.QwenPaw,e=Ue.host.React,{useState:W,useEffect:Se,useRef:$e}=e,_a=()=>e.createElement("svg",{width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.6",strokeLinejoin:"round",strokeLinecap:"round","aria-hidden":!0,style:{verticalAlign:"middle",flexShrink:0}},e.createElement("path",{d:"M6 2.9h8.5l4.9 4.9v12.1q0 1.2-1.2 1.2H6q-1.4 0-1.4-1.4V4.3q0-1.4 1.4-1.4Z"}),e.createElement("path",{d:"M14.1 3.2v4.9H19M8 11h5.9"}),e.createElement("path",{d:"M8 17.2c1.4-2.25 2.2-3.5 3.1-3.15 1.1.42-.05 3.28 1.05 3.28.8 0 1.2-1.03 1.8-1.03.63 0 1.02.56 2.15.56"})),zt={pending:"\u672A\u5F00\u59CB",in_progress:"\u8FDB\u884C\u4E2D",submitted:"\u5DF2\u63D0\u4EA4",completed:"\u5DF2\u5B8C\u6210"},ra={pending:"\u5F85\u51C6\u5907",preparing:"\u6574\u7406\u4E2D",ready:"\u5F85\u63D0\u4EA4",submitted:"\u5DF2\u63D0\u4EA4",done:"\u5DF2\u5B8C\u6210",na:"\u4E0D\u9002\u7528"},za=["\u4E0A\u62A5\u8BA1\u5212","\u9009\u5546\u8BBA\u8BC1","\u5546\u52A1\u8C08\u5224","\u5F00\u9898\u8BBA\u8BC1","\u5408\u540C\u5BA1\u67E5","\u7ED3\u9898\u9A8C\u6536","\u5F52\u6863\u4ED8\u6B3E"],na=i=>i?new Date(i).toLocaleString("zh-CN",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}):"";function Re({title:i,children:c,onClose:o,error:m,busy:f=!1}){let p=$e(null);return Se(()=>{let b=document.activeElement;return p.current?.querySelector("input,select,textarea,button")?.focus(),()=>{b?.isConnected&&b.focus()}},[]),e.createElement("div",{className:"df-dialog-backdrop"},e.createElement("section",{ref:p,className:"df-dialog df-paper",role:"dialog","aria-modal":"true","aria-label":i,onKeyDown:b=>{if(b.key==="Escape"&&!f&&(b.stopPropagation(),o()),b.key==="Tab"){let h=[...p.current.querySelectorAll("button,input,textarea,select,a[href]")].filter(l=>!l.disabled);b.shiftKey&&document.activeElement===h[0]&&(b.preventDefault(),h.at(-1)?.focus()),!b.shiftKey&&document.activeElement===h.at(-1)&&(b.preventDefault(),h[0]?.focus())}}},e.createElement("div",{className:"df-section-head"},e.createElement("h2",null,i),e.createElement("button",{type:"button",disabled:f,onClick:o,"aria-label":"\u5173\u95ED"+i},"\xD7")),m&&e.createElement("p",{role:"alert",className:"df-alert error"},m),c))}function oa({file:i,projectId:c,download:o,onClose:m,embedded:f=!1}){let[p,b]=W(null),[h,l]=W(""),[g,n]=W(""),x=i.name.split(".").pop().toLowerCase(),k=["pdf","png","jpg","jpeg"].includes(x)&&!Ue.workspace?.loadPreview;Se(()=>{let O=!0,N;return k?Ue.host.fetch(`/document-forms/projects/${c}/files/${i.id}`).then(async y=>{if(!y.ok)throw new Error("\u9884\u89C8\u672A\u80FD\u6253\u5F00\uFF0C\u8BF7\u4E0B\u8F7D\u67E5\u770B");let T=await y.blob();O&&(N=URL.createObjectURL(new Blob([T],{type:i.mime})),l(N))}).catch(y=>O&&n(y.message)):Ue.workspace?.loadPreview||["doc","docx","xls","xlsx","ppt","pptx"].includes(x)?(Ue.workspace?.loadPreview?Ue.workspace.loadPreview():Promise.resolve(Te)).then(y=>O&&b(()=>y)).catch(()=>O&&b(()=>Te)):n("\u6B64\u683C\u5F0F\u8BF7\u4E0B\u8F7D\u540E\u67E5\u770B\u3002"),()=>{O=!1,N&&URL.revokeObjectURL(N)}},[i.id]);let B={id:i.id,title:i.name,source:"uploaded",extension:x,mimeType:i.mime,binaryUrl:i.preview_url,agentId:Ue.host.getSelectedAgentId?.(),createdAt:Date.parse(i.uploaded_at)};return e.createElement(f?"section":Re,{...f?{className:"df-dock-preview","aria-label":"\u6587\u4EF6\u9884\u89C8"}:{title:i.name,onClose:m}},f&&e.createElement("h3",null,i.name),e.createElement("div",{className:"df-attachment-preview"},g?e.createElement("p",{role:"alert"},g):k&&h?x==="pdf"?e.createElement("iframe",{title:i.name,src:h,sandbox:"allow-same-origin"}):e.createElement("img",{src:h,alt:i.name}):p?e.createElement(p,{artifact:B,readOnly:!0,hostControls:!0}):e.createElement("p",{role:"status"},"\u6B63\u5728\u6253\u5F00\u9884\u89C8\u2026")),e.createElement("div",{className:"df-actions"},e.createElement("button",{onClick:()=>o(`/projects/${c}/files/${i.id}`,i.name)},"\u4E0B\u8F7D\u539F\u6587\u4EF6"),e.createElement("button",{onClick:m},"\u5173\u95ED\u9884\u89C8")))}function da(){let i=new Date;return`${i.getFullYear()}-${String(i.getMonth()+1).padStart(2,"0")}-${String(i.getDate()).padStart(2,"0")}`}function wt(i,c){if(i.status==="completed")return{kind:"done",text:i.approval_date?`${i.id==="selection"?"\u5BA1\u6279\u65E5\u671F":"\u6279\u590D\u65E5\u671F"} ${i.approval_date}`:i.due_date?`\u8BA1\u5212\u65E5\u671F ${i.due_date} \xB7 \u5DF2\u529E\u7ED3`:"\u5DF2\u529E\u7ED3"};if(!i.due_date)return{kind:"unset",text:"\u672A\u8BBE\u7F6E\u8BA1\u5212\u65E5\u671F"};let o=Math.round((Date.parse(i.due_date)-Date.parse(c))/864e5);return Number.isFinite(o)?{kind:o<0?"overdue":o<=3?"soon":"scheduled",text:`${i.due_date} \xB7 ${o<0?`\u5DF2\u903E\u671F ${-o} \u5929`:o===0?"\u4ECA\u5929\u5230\u671F":o<=3?`${o} \u5929\u540E\u5230\u671F`:`\u5269\u4F59 ${o} \u5929`}`}:{kind:"unset",text:"\u8BF7\u68C0\u67E5\u8BA1\u5212\u65E5\u671F"}}function Ft({Editor:i,services:c}){let{request:o,json:m,download:f,Field:p}=c,[b,h]=W(da);Se(()=>{let t=()=>h(da()),w=setInterval(t,6e4);return window.addEventListener("focus",t),()=>{clearInterval(w),window.removeEventListener("focus",t)}},[]);let[l,g]=W([]),[n,x]=W(null),[k,B]=W("overview"),[_,O]=W(""),[N,y]=W(null),[T,E]=W(!1),[$,d]=W(!1),[F,G]=W(""),[C,v]=W(0),[M,X]=W("form"),[z,V]=W(null),[q,K]=W(""),[de,ee]=W(""),[De,Le]=W(""),[ze,R]=W(null),[D,I]=W({}),[Me,Be]=W([]),[me,ft]=W(null),[ae,ie]=W(null),[xe,kt]=W(!1),[ct,Qe]=W(!1),[Ve,et]=W(()=>{try{let t=Number(window.localStorage.getItem("ugsci.document-forms.right-width"));return Number.isFinite(t)&&t>=300&&t<=3e3?t:500}catch{return 500}}),[se,$t]=W(1200),Ie=$e(null);Se(()=>{let t=Ie.current;if(!t||!n?.single_form)return;let w=()=>{let Y=t.getBoundingClientRect().width;if(Y<=850)return;let ce=t.querySelector(".df-project-sidebar").getBoundingClientRect().width,Pe=Math.max(300,Math.floor(Y-ce-(window.innerWidth<=1050?380:440)));$t(Pe),et(Je=>Math.min(Pe,Math.max(300,Je)))};w();let S=typeof ResizeObserver=="function"?new ResizeObserver(w):null;return S?.observe(t),window.addEventListener("resize",w),()=>{S?.disconnect(),window.removeEventListener("resize",w)}},[xe,n?.single_form]),Se(()=>{try{window.localStorage.setItem("ugsci.document-forms.right-width",String(Ve))}catch{}},[Ve]);let ye=t=>et(Math.min(se,Math.max(300,Math.round(t)))),[Z,re]=W(null),[Ae,ue]=W("assistant"),le=$e(!0),pe=$e(0),mt=$e(null),dt=$e(null),tt=$e(""),Nt=$e(null),oe=$e(null);oe.current=n?.id,Se(()=>{Nt.current?.scrollTo?.({top:0})},[n?.id,k,N?.id]);let Tt=Ue.host.useTheme?.()||"light",L=n?.stages.find(t=>t.id===k),He=n?.forms.filter(t=>t.stage_id===k)||[],{approvals:Ke,attachments:Ge}=ia(L?.materials||[]),te=(n?.stages.find(t=>t.id==="plan")?.materials.flatMap(t=>t.files).filter(t=>t.approval_review)||[]).at(-1),at=()=>!T&&!$||window.confirm("\u8D44\u6599\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\uFF0C\u662F\u5426\u653E\u5F03\u8FD9\u4E9B\u4FEE\u6539\u5E76\u79BB\u5F00\uFF1F");async function ke(){let t=await o("/projects");return le.current&&g(t),t}async function ve(t=n?.id,w=!1){let S=t?await o("/projects/"+t):null;return le.current&&S&&(w||!oe.current||oe.current===t)&&(oe.current!==S.id&&(ie(null),re(null),ue("assistant")),oe.current=S.id,x(Y=>Y?.id===S.id&&Y.revision>S.revision?Y:S)),await ke(),S}Se(()=>(le.current=!0,K("\u8F7D\u5165\u9879\u76EE"),ke().then(async t=>{if(t.length&&le.current){let w=await o("/projects/"+t[0].id);le.current&&x(w)}}).catch(t=>le.current&&ee(t.message)).finally(()=>le.current&&K("")),()=>{le.current=!1,pe.current++}),[]),Se(()=>{let t=w=>{(T||$)&&(w.preventDefault(),w.returnValue="")};return window.addEventListener("beforeunload",t),()=>window.removeEventListener("beforeunload",t)},[T,$]);async function J(t,w){if(q)return;let S=++pe.current;K(t),ee(""),Le("");try{await w()}catch(Y){le.current&&S===pe.current&&ee(Y.message)}finally{le.current&&S===pe.current&&K("")}}async function Dt(t){at()&&await J("\u6253\u5F00\u9879\u76EE",async()=>{y(null),E(!1),d(!1),B("overview"),X("form"),await ve(t,!0),y(null),E(!1),d(!1),ie(null),re(null),ue("assistant"),B("overview")})}async function Xe(t){at()&&(B(t),X("form"),y(null),E(!1),d(!1),Le(""),ee(""),n.single_form&&n.stages.some(w=>w.id===t)&&await J("\u6253\u5F00\u9879\u76EE\u8868\u5355",async()=>{let w=await o(`/projects/${n.id}/form`,m({revision:n.revision,stage_id:t}));await ve(),y({id:w.id,view:"edit",revision:w.revision,initialDraft:w})}))}function ge(t,w){I(w),R(t),ee("")}async function fe(t,w,S="POST"){let Y=await o(t,{...m({...w,revision:n.revision}),method:S});return le.current&&(x(Y),R(null)),await ke(),Y}function it(t){return J(t?"\u8BFB\u53D6\u9636\u6BB5 Excel":"\u51C6\u5907\u8C08\u5224\u8868\u5355",async()=>{let w;if(t){let S=new FormData;S.append("revision",n.revision),S.append("stage_id",k),S.append("workbook",t),w=await o(`/projects/${n.id}/${n.single_form?"form":"cases"}/import`,{method:"POST",body:S})}else w=await o(`/projects/${n.id}/${n.single_form?"form":"cases"}`,m({revision:n.revision,stage_id:k}));await ve(),y({id:w.id,view:"edit",revision:w.revision,initialDraft:n.single_form?w:void 0}),E(!1),t&&Le(w.templates.length?"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\uFF0C\u5E76\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002":"\u5DF2\u8BFB\u53D6\u672C\u9636\u6BB5\u53D8\u91CF\u914D\u7F6E\uFF0C\u8BF7\u6DFB\u52A0\u5BF9\u5E94\u7684 Word \u6A21\u677F\u3002")})}function ut(t){if(!t)return;let w=tt.current;return J("\u4FDD\u5B58\u6750\u6599",async()=>{let S=new FormData;S.append("revision",n.revision),S.append("file",t);let Y=await o(`/projects/${n.id}/stages/${k}/materials/${w}/files`,{method:"POST",body:S});x(Y),await ke();let ce=Y.stages.find(Je=>Je.id===k),Pe=ce?.materials.find(Je=>Je.id===w)?.files.at(-1);Le(ce?.status==="completed"&&ce.completion_file_id===Pe?.id?`\u5BA1\u6279\u6587\u4EF6\u5DF2\u4FDD\u5B58\uFF0C\u672C\u9636\u6BB5\u5DF2\u81EA\u52A8\u6807\u8BB0\u4E3A\u5DF2\u5B8C\u6210\uFF0C${wt(ce,b).text}\u3002`:Pe?.approval_review?.status==="ready"&&Pe.approval_review.fields?.length?`\u5BA1\u6279\u6587\u4EF6\u5DF2\u4FDD\u5B58\uFF0C\u5E76\u8BC6\u522B\u51FA ${Pe.approval_review.fields.length} \u9879\u5BA1\u6279\u7ED3\u679C\u3002`:k==="selection"&&Pe?.approval_review?.message?`\u5BA1\u6279\u6587\u4EF6\u5DF2\u4FDD\u5B58\u3002${Pe.approval_review.message}`:"\u6750\u6599\u5DF2\u4FDD\u5B58\uFF0C\u539F\u6709\u7248\u672C\u7EE7\u7EED\u4FDD\u7559\u3002\u8BF7\u6838\u5BF9\u540E\u66F4\u65B0\u6750\u6599\u72B6\u6001\u3002")})}let je=n?`/projects/${n.id}`:"",Lt=[{id:"form",label:"\u5185\u5BB9\u586B\u5199"},...n?.single_form?[{id:"generate",label:"\u6587\u4EF6\u751F\u6210"}]:[],...L?.id==="negotiation"?[{id:"response",label:"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5"}]:[],{id:"materials",label:"\u5BA1\u6279\u8D44\u6599"},{id:"attachments",label:"\u5176\u4ED6\u9644\u4EF6"}],Mt=t=>{t.preventDefault(),J("\u4FDD\u5B58\u6750\u6599\u4FE1\u606F",()=>fe(`${je}/stages/${k}/materials${D.id?"/"+D.id:""}`,D,D.id?"PUT":"POST"))},gt=t=>J("\u6574\u7406\u4E0B\u8F7D\u5305",()=>f(je+"/bundle"+(t?"?stage_id="+t:""),`${n.name}_${t?L.title:"\u5168\u6D41\u7A0B\u6750\u6599"}.zip`));return e.createElement("main",{ref:Ie,style:{"--df-dock-size":Ve+"px"},className:"df-app df-project-app"+(n?.single_form?" df-three-column":"")+(xe?" df-left-collapsed":"")+(ct?" df-right-collapsed":""),"data-theme":Tt},e.createElement("style",null,Gt+Xt),e.createElement("input",{ref:mt,type:"file",accept:".xlsx",hidden:!0,"aria-label":"\u5BFC\u5165\u9636\u6BB5 Excel",onChange:t=>{let w=t.target.files[0];t.target.value="",w&&it(w)}}),e.createElement("input",{ref:dt,type:"file",accept:".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.png,.jpg,.jpeg,.zip,.txt,.csv",hidden:!0,"aria-label":"\u4E0A\u4F20\u9636\u6BB5\u6750\u6599",onChange:t=>{let w=t.target.files[0];t.target.value="",ut(w)}}),e.createElement("aside",{className:"df-sidebar df-project-sidebar"+(xe?" df-pane-collapsed":""),"aria-label":"\u9879\u76EE\u9009\u62E9"},e.createElement("button",{className:"df-pane-toggle","aria-label":xe?"\u5C55\u5F00\u9879\u76EE\u680F":"\u6536\u8D77\u9879\u76EE\u680F","aria-expanded":!xe,title:xe?"\u5C55\u5F00\u9879\u76EE\u680F":"\u6536\u8D77\u9879\u76EE\u680F",onClick:()=>kt(t=>!t)},e.createElement("span",{"aria-hidden":"true"},xe?"\u203A":"\u2039"),e.createElement("span",null,xe?"\u9879\u76EE":"\u6536\u8D77")),e.createElement("div",{className:"df-brand",style:{display:"flex",alignItems:"center",gap:10}},e.createElement(_a,null),"\u5916\u534F\u52A9\u624B"),e.createElement("button",{className:"df-primary df-new",disabled:!!q||!!F,onClick:()=>{at()&&ge("create",{name:"",code:"",owner:""})}},"\uFF0B \u65B0\u5EFA\u9879\u76EE"),e.createElement("label",{className:"df-project-search"},e.createElement("span",{className:"df-sr-only"},"\u641C\u7D22\u9879\u76EE"),e.createElement("input",{"aria-label":"\u641C\u7D22\u9879\u76EE",placeholder:"\u641C\u7D22\u9879\u76EE\u540D\u79F0\u6216\u7F16\u53F7",value:_,onChange:t=>O(t.target.value)})),e.createElement("div",{className:"df-caption"},"\u6211\u7684\u9879\u76EE ",e.createElement("span",null,l.length)),e.createElement("nav",{"aria-label":"\u9879\u76EE\u5217\u8868"},l.filter(t=>(t.name+" "+t.code).toLowerCase().includes(_.trim().toLowerCase())).map(t=>e.createElement("button",{key:t.id,disabled:!!q||!!F,"aria-current":n?.id===t.id?"page":void 0,onClick:()=>Dt(t.id)},e.createElement("b",null,t.name),e.createElement("small",null,t.code||"\u672A\u8BBE\u7F16\u53F7"," \xB7 ",t.completed,"/7 \u9636\u6BB5\u5B8C\u6210")))),_.trim()&&!l.some(t=>(t.name+" "+t.code).toLowerCase().includes(_.trim().toLowerCase()))&&e.createElement("div",{className:"df-search-empty",role:"status"},e.createElement("p",null,"\u672A\u627E\u5230\u9879\u76EE"),e.createElement("button",{onClick:()=>O("")},"\u6E05\u9664\u641C\u7D22")),e.createElement("div",{className:"df-sidebar-foot",hidden:!!(n?.single_form&&L&&N)},e.createElement("button",{disabled:!!q||!!F,onClick:()=>J("\u4E0B\u8F7D\u914D\u5957\u6A21\u677F",()=>f("/starter","\u6587\u4E66\u586B\u62A5_\u914D\u5957\u6A21\u677F.zip"))},"\u4E0B\u8F7D\u914D\u5957\u6A21\u677F \u2197"))),e.createElement("section",{className:"df-main df-project-main",ref:Nt},e.createElement("header",{className:"df-header"},e.createElement("div",null,e.createElement("h1",null,n?.name||"\u9879\u76EE\u5DE5\u4F5C\u53F0"),e.createElement("p",null,n?[n.code||"\u672A\u8BBE\u9879\u76EE\u7F16\u53F7",n.owner&&"\u7ECF\u529E\u4EBA\uFF1A"+n.owner].filter(Boolean).join("\u3000\xB7\u3000"):"\u7BA1\u7406\u5916\u534F\u9879\u76EE\u3001\u9636\u6BB5\u6750\u6599\u4E0E\u529E\u7406\u8FDB\u5EA6\u3002")),n&&e.createElement("div",{className:"df-actions"},e.createElement("button",{disabled:!!q||!!F,onClick:()=>Xe("profile")},"\u57FA\u7840\u4FE1\u606F\u586B\u62A5"),e.createElement("button",{disabled:!!q||!!F,onClick:()=>gt()},"\u4E0B\u8F7D\u9879\u76EE\u6750\u6599"))),de&&e.createElement("div",{role:"alert",className:"df-alert error"},de,e.createElement("button",{"aria-label":"\u5173\u95ED\u9519\u8BEF\u63D0\u793A",onClick:()=>ee("")},"\xD7")),De&&e.createElement("div",{className:"df-alert",role:"status"},De),me&&me.projectId===n?.id&&me.stageId===k&&e.createElement("div",{className:"df-alert df-file-deleted",role:"status"},e.createElement("span",null,"\u5DF2\u5220\u9664 V",me.file.version," \xB7 ",me.file.name),e.createElement("button",{disabled:!!q||!!F,onClick:()=>J("\u64A4\u9500\u5220\u9664",async()=>{let t=await o(`/projects/${me.projectId}/stages/${me.stageId}/materials/${me.materialId}/files/${me.file.id}/restore`,m({revision:n.revision}));x(t),ft(null),Le("\u5BA1\u6279\u6587\u4EF6\u5DF2\u6062\u590D\u3002"),await ke()})},"\u64A4\u9500\u5220\u9664")),q&&e.createElement("div",{className:"df-progress",role:"status"},q,"\u2026"),n?e.createElement(e.Fragment,null,e.createElement("nav",{className:"df-project-tabs","aria-label":"\u9879\u76EE\u9636\u6BB5"},e.createElement("button",{className:k==="overview"?"active":"",disabled:!!q||!!F,onClick:()=>Xe("overview")},"\u9879\u76EE\u603B\u89C8"),n.stages.map((t,w)=>e.createElement("button",{key:t.id,"aria-current":k===t.id?"step":void 0,className:k===t.id?"active":"",disabled:!!q||!!F,onClick:()=>Xe(t.id)},e.createElement("small",null,String(w+1).padStart(2,"0"))," ",t.title,e.createElement("span",{className:"df-state df-state-"+t.status},t.upstream_changed.length||t.documents_changed?"\u5F85\u590D\u6838":zt[t.status])))),e.createElement("fieldset",{className:"df-content",disabled:!!q||!!F},k==="overview"&&e.createElement(e.Fragment,null,n.migrated&&e.createElement("p",{className:"df-muted df-migration-note"},"\u5386\u53F2\u586B\u62A5\u5DF2\u6309\u9879\u76EE\u540D\u79F0\u6216\u7F16\u53F7\u5F52\u5165\u5546\u52A1\u8C08\u5224\u9636\u6BB5\uFF0C\u539F\u8868\u5355\u3001\u751F\u6210\u6279\u6B21\u548C\u6587\u4EF6\u5747\u4FDD\u7559\u3002"),e.createElement("section",{className:"df-project-metrics"},e.createElement("div",null,e.createElement("b",null,n.stages.filter(t=>t.status==="completed").length,e.createElement("small",null,"/ ",n.stages.length)),e.createElement("span",null,"\u5DF2\u5B8C\u6210\u9636\u6BB5")),e.createElement("div",null,e.createElement("b",null,n.stages.reduce((t,w)=>t+w.materials.filter(S=>!["done","na"].includes(S.status)).length,0)),e.createElement("span",null,"\u5F85\u6574\u7406\u6750\u6599")),e.createElement("div",null,e.createElement("b",null,n.forms.reduce((t,w)=>t+w.outputs,0)),e.createElement("span",null,"\u5DF2\u751F\u6210\u6587\u4EF6")),e.createElement("div",null,e.createElement("b",null,n.stages.filter(t=>t.upstream_changed.length||t.documents_changed).length),e.createElement("span",null,"\u5F85\u590D\u6838\u9636\u6BB5"))),e.createElement("div",{className:"df-project-stage-grid"},n.stages.map((t,w)=>e.createElement("button",{className:"df-paper df-stage-card",key:t.id,onClick:()=>Xe(t.id)},e.createElement("div",{className:"df-section-head"},e.createElement("small",null,"\u9636\u6BB5 ",String(w+1).padStart(2,"0")),e.createElement("span",{className:"df-state df-state-"+t.status},t.upstream_changed.length||t.documents_changed?"\u5F85\u590D\u6838":zt[t.status])),e.createElement("h2",null,t.title),e.createElement("p",null,t.purpose),e.createElement("span",{className:"df-deadline "+wt(t,b).kind},wt(t,b).text),e.createElement("footer",null,e.createElement("span",null,t.materials.filter(S=>["done","na"].includes(S.status)).length,"/",t.materials.length," \u9879\u6750\u6599\u5DF2\u5904\u7406"),e.createElement("span",null,t.upstream_changed.length||t.documents_changed?"\u6709\u53D8\u66F4\u5F85\u590D\u6838":t.due_date?"\u8BA1\u5212 "+t.due_date:"\u8FDB\u5165\u9636\u6BB5 \u2192"))))),e.createElement("section",{className:"df-paper df-project-hint"},e.createElement("h2",null,"\u4E00\u4EFD\u9879\u76EE\u5E95\u7A3F\uFF0C\u8D2F\u7A7F\u5404\u9636\u6BB5"),e.createElement("p",null,"\u9879\u76EE\u540D\u79F0\u3001\u7814\u7A76\u5185\u5BB9\u3001\u6210\u679C\u6307\u6807\u548C\u9884\u7B97\u7B49\u53EF\u5728\u201C\u57FA\u7840\u4FE1\u606F\u586B\u62A5\u201D\u7EDF\u4E00\u7EF4\u62A4\u3002\u9636\u6BB5\u8868\u5355\u4ECE\u5E95\u7A3F\u53D6\u503C\uFF0C\u540E\u7EED\u53D8\u66F4\u4F1A\u63D0\u9192\u6838\u5BF9\uFF1B\u5DF2\u6709\u751F\u6210\u6587\u4EF6\u4FDD\u7559\u539F\u6837\u3002"),e.createElement("button",{onClick:()=>Xe("profile")},"\u586B\u5199\u57FA\u7840\u4FE1\u606F"))),k==="profile"&&e.createElement(ja,{onDirtyChange:d,key:n.id+":"+n.revision,project:n,Field:p,request:o,onSave:t=>J("\u4FDD\u5B58\u57FA\u7840\u4FE1\u606F",async()=>{await fe(je,t,"PUT"),Le("\u57FA\u7840\u4FE1\u606F\u5DF2\u66F4\u65B0\u3002\u5DF2\u6709\u8868\u5355\u53EF\u9010\u9879\u6838\u5BF9\u540E\u540C\u6B65\uFF0C\u539F\u751F\u6210\u6587\u4EF6\u4E0D\u53D8\u3002")})}),L&&e.createElement(e.Fragment,null,e.createElement("section",{className:"df-paper df-stage-header"},e.createElement("div",{className:"df-stage-top-row"},e.createElement("div",{className:"df-stage-heading"},e.createElement("h2",null,L.title),!n.single_form&&e.createElement("details",{className:"df-stage-help"},e.createElement("summary",null,"\u672C\u9636\u6BB5\u529E\u7406\u8BF4\u660E"),e.createElement("p",null,n.single_form&&L.id==="plan"?"\u5DF2\u63A5\u5165\u79D1\u7814\u8BA1\u5212\u586B\u62A5\u8868\u4E0E\u5916\u534F\u5FC5\u8981\u6027\u8BF4\u660E\uFF0C\u53EF\u76F4\u63A5\u586B\u5199\u5E76\u751F\u6210\u3002":L.id==="selection"?"\u5DF2\u63A5\u5165\u8BBA\u8BC1\u610F\u89C1\u53CA\u7B7E\u5B57\u8868\u4E0E\u975E\u62DB\u6807\u65B9\u6848\u586B\u62A5\u8868\uFF0C\u53EF\u5148\u51C6\u5907\u8BBA\u8BC1\u6750\u6599\uFF0C\u8BBA\u8BC1\u7ED3\u675F\u540E\u6838\u5BF9\u7CFB\u7EDF\u586B\u62A5\u4FE1\u606F\u3002":L.id==="negotiation"?"\u4E94\u4EFD\u6807\u51C6\u6A21\u677F\u5DF2\u63A5\u5165\uFF0C\u53EF\u76F4\u63A5\u586B\u5199\uFF0C\u4E5F\u53EF\u5BFC\u5165\u73B0\u6709 Excel\u3002":"\u7EDF\u4E00\u6A21\u677F\u5F85\u8865\u5145\uFF0C\u53EF\u4E0A\u4F20\u9636\u6BB5\u6750\u6599\uFF0C\u6216\u5BFC\u5165 Excel \u4E0E Word \u6A21\u677F\u3002"))),e.createElement("div",{className:"df-stage-toolbar",role:"toolbar","aria-label":"\u9636\u6BB5\u5DE5\u5177\u680F"},e.createElement("div",{className:"df-stage-tool-slot",ref:V}),(!n.single_form||!N||!Ue.host.ReactDOM?.createPortal)&&e.createElement("div",{className:"df-toolbar-file-actions"},e.createElement("button",{"aria-label":"\u4E0B\u8F7D\u672C\u9636\u6BB5\u6750\u6599",title:"\u4E0B\u8F7D\u672C\u9636\u6BB5\u6750\u6599",onClick:()=>gt(L.id)},e.createElement(be,{name:"download"}),"\u9636\u6BB5\u6750\u6599")))),e.createElement("div",{className:"df-stage-bottom-row"},e.createElement(xt,{id:"df-node",label:"\u9636\u6BB5\u529E\u7406\u6D41\u7A0B",items:Lt,value:M,onChange:t=>{X(t),t==="form"&&M==="form"&&v(w=>w+1),document.getElementById("df-node-tab-"+t)?.closest(".df-stage-header")?.scrollIntoView?.({block:"start"})}}),e.createElement("div",{className:"df-node-status","aria-label":"\u8282\u70B9\u529E\u7406\u6982\u51B5"},e.createElement("button",{className:"df-stage-state df-state df-state-"+L.status,disabled:T,"aria-label":"\u529E\u7406\u4FE1\u606F\u4E0E\u72B6\u6001",title:T?"\u8BF7\u5148\u4FDD\u5B58\u586B\u5199\u5185\u5BB9\uFF0C\u518D\u66F4\u65B0\u529E\u7406\u72B6\u6001":"\u529E\u7406\u4FE1\u606F\u4E0E\u72B6\u6001",onClick:()=>ge("stage",{...L,confirmed:!1})},e.createElement("span",{className:"df-state-dot","aria-hidden":"true"}),zt[L.status],e.createElement(be,{name:"chevron"})),e.createElement("span",{className:"df-deadline "+wt(L,b).kind},e.createElement(be,{name:"calendar"}),wt(L,b).text),e.createElement("span",{className:"df-stage-approval-count"},"\u5BA1\u6279\u8D44\u6599"," ",Ke.filter(t=>t.files.length).length,"/",Ke.length)))),(L.upstream_changed.length>0||L.documents_changed)&&e.createElement("div",{className:"df-alert df-stage-warning"},e.createElement("div",null,e.createElement("b",null,"\u672C\u9636\u6BB5\u6709\u8D44\u6599\u9700\u8981\u590D\u6838"),e.createElement("p",null,L.upstream_changed.length>0&&"\u524D\u5E8F\u9636\u6BB5\u5DF2\u66F4\u65B0\uFF1A"+L.upstream_changed.join("\u3001")+"\u3002",L.documents_changed&&"\u672C\u9636\u6BB5\u8868\u5355\u6216\u751F\u6210\u6587\u4EF6\u6709\u66F4\u65B0\u3002","\u8BF7\u6838\u5BF9\u5DF2\u63D0\u4EA4\u7684\u6750\u6599\u662F\u5426\u9700\u8981\u8C03\u6574\u3002")),e.createElement("button",{onClick:()=>J("\u8BB0\u5F55\u590D\u6838",()=>fe(`${je}/stages/${L.id}/acknowledge`,{}))},"\u5DF2\u6838\u5BF9\u53D8\u66F4")),(L.system_name||L.submission_ref||L.notes)&&e.createElement("section",{className:"df-paper df-stage-details"},e.createElement("dl",null,e.createElement("div",null,e.createElement("dt",null,"\u529E\u7406\u7CFB\u7EDF"),e.createElement("dd",null,L.system_url?e.createElement("a",{href:L.system_url,target:"_blank",rel:"noopener noreferrer"},L.system_name||"\u6253\u5F00\u529E\u7406\u7CFB\u7EDF"," \u2197"):L.system_name||"\u672A\u8BB0\u5F55")),e.createElement("div",null,e.createElement("dt",null,"\u63D0\u4EA4\u7F16\u53F7 / \u56DE\u6267"),e.createElement("dd",null,L.submission_ref||"\u672A\u8BB0\u5F55"))),L.notes&&e.createElement("p",null,L.notes)),e.createElement("div",{id:n.single_form&&N?void 0:"df-node-panel-form",role:n.single_form&&N?void 0:"tabpanel","aria-labelledby":n.single_form&&N?void 0:"df-node-tab-form",hidden:M!=="form"&&!(n.single_form&&N&&M==="generate")},e.createElement("div",{id:"df-node-form"},N&&e.createElement(i,{key:n.id+":"+N.id+":"+k+":"+(N.revision||""),project:n,workflowStage:L,initialCaseId:N.id,initialView:N.view,editRequest:C,initialDraft:N.initialDraft,onDirtyChange:E,onBusyChange:G,onViewChange:()=>document.getElementById("df-node-form")?.scrollIntoView?.({block:"start"}),onBack:()=>{y(null),E(!1),ve().catch(t=>ee(t.message))},onChanged:()=>ve(),docked:n.single_form,nodeTab:M,selectedOutput:Z?.reference,onAskAboutOutput:()=>{Qe(!1),ue("assistant")},toolbarTarget:z,onShowForm:()=>X("form"),onDownloadStageMaterials:()=>gt(L.id),onEditBasics:()=>{y(null),E(!1),G(""),B("profile")},onStageStatus:()=>ge("stage",{...L,confirmed:!1}),onPreview:t=>{re(t),ie(null),Qe(!1),ue("preview")}})),!N&&e.createElement("section",{className:"df-paper df-stage-forms"},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,n.single_form?"\u9879\u76EE\u8868\u5355":"\u586B\u5199\u4E0E\u751F\u6210"),e.createElement("p",{className:"df-muted"},"\u8868\u5355\u6CBF\u7528\u9879\u76EE\u5E95\u7A3F\uFF0C\u6838\u5BF9\u540E\u751F\u6210\u3002\u5DF2\u6709\u6279\u6B21\u4FDD\u7559\u751F\u6210\u65F6\u7684\u5185\u5BB9\u3002")),e.createElement("div",{className:"df-actions"},(L.id==="negotiation"||n.single_form)&&e.createElement("button",{className:"df-primary",onClick:()=>it()},n.single_form?"\u6253\u5F00\u9879\u76EE\u8868\u5355":"\u586B\u5199\u8C08\u5224\u6750\u6599"),e.createElement("button",{onClick:()=>mt.current.click()},"\u5BFC\u5165 Excel \u8868\u5355"))),n.single_form?e.createElement("p",{className:"df-muted"},"\u6BCF\u4E2A\u9879\u76EE\u5171\u7528\u4E00\u4EFD\u8868\u5355\uFF0C\u4E03\u4E2A\u9636\u6BB5\u5404\u529E\u7406\u4E00\u6B21\u3002"):He.length?e.createElement("div",{className:"df-project-forms"},He.map(t=>e.createElement("div",{key:t.case_id},e.createElement("div",null,e.createElement("b",null,t.name),e.createElement("small",null,na(t.updated_at)," \xB7"," ",t.outputs?t.outputs+" \u4EFD\u6587\u4EF6":"\u586B\u5199\u4E2D",t.shared_changes.length>0&&" \xB7 \u57FA\u7840\u4FE1\u606F\u6709\u66F4\u65B0")),e.createElement("div",{className:"df-actions"},e.createElement("button",{onClick:()=>y({id:t.case_id,view:"edit"})},"\u6253\u5F00\u8868\u5355"),t.outputs>0&&e.createElement("button",{onClick:()=>y({id:t.case_id,view:"files"})},"\u67E5\u770B\u751F\u6210\u6587\u4EF6"))))):e.createElement("p",{className:"df-empty"},"\u672C\u9636\u6BB5\u8FD8\u6CA1\u6709\u8868\u5355\u3002\u5DF2\u6709\u6210\u54C1\u6587\u4EF6\u53EF\u76F4\u63A5\u4E0A\u4F20\u5230\u4E0B\u9762\u7684\u6750\u6599\u6E05\u5355\u3002"))),n.single_form&&!N&&e.createElement("section",{className:"df-paper df-stage-forms",id:"df-node-panel-generate",role:"tabpanel","aria-labelledby":"df-node-tab-generate",hidden:M!=="generate"},e.createElement("button",{className:"df-primary",onClick:()=>it()},"\u6253\u5F00\u9879\u76EE\u8868\u5355")),L.id==="negotiation"&&e.createElement("section",{className:"df-paper df-review-entry",role:"tabpanel",id:"df-node-panel-response","aria-labelledby":"df-node-tab-response",hidden:M!=="response"},e.createElement("div",null,e.createElement("h2",null,"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5"),e.createElement("p",{className:"df-muted"},"\u5BF9\u7167\u6B63\u5F0F\u8C08\u5224\u6587\u4EF6\uFF0C\u68C0\u67E5\u5404\u5355\u4F4D\u54CD\u5E94\u6750\u6599\uFF0C\u6C47\u603B\u95EE\u9898\u3001\u4F9D\u636E\u548C\u5F85\u786E\u8BA4\u4E8B\u9879\u3002")),e.createElement("button",{onClick:()=>n.single_form?ue("review"):ge("response-review",{})},"\u6253\u5F00\u6838\u67E5\u667A\u80FD\u4F53 \u2192")),e.createElement("div",{role:"tabpanel",id:"df-node-panel-materials","aria-labelledby":"df-node-tab-materials",hidden:M!=="materials"},e.createElement(qt,{key:n.id+":"+L.id,projectId:n.id,materials:Ke,active:M==="materials",busy:!!q||!!F,onDelete:(t,w)=>ge("delete-file",{materialId:t.id,file:{...w,version:w.version||t.files.indexOf(w)+1}}),onUpload:t=>{tt.current=t.id,dt.current.click()},onEdit:t=>ge("material",{...t}),onAdd:()=>ge("material",{name:"\u5BA1\u6279\u8D44\u6599",status:"pending",required:!1,note:""}),onPreview:t=>{ie(t),re({artifact:{title:t.name},reference:{file_id:t.id}}),ue("preview")},onDownload:t=>J("\u4E0B\u8F7D\u5BA1\u6279\u6587\u4EF6",()=>f(je+"/files/"+t.id,t.name)),review:L.id==="plan"&&te&&e.createElement("div",{className:"df-approval-review-summary"},te.approval_review.status==="ready"?e.createElement(e.Fragment,null,e.createElement("span",{className:"df-muted"},"\u6279\u590D\u65E5\u671F"," ",te.approval_review.approved_at," \xB7 \u5DF2\u8BC6\u522B"," ",te.approval_review.fields.length," ","\u9879 \xB7"," ",te.approval_review.change_count?`\u53D1\u73B0 ${te.approval_review.change_count} \u9879\u5DEE\u5F02`:"\u4E0E\u5F53\u524D\u8D44\u6599\u4E00\u81F4"),e.createElement("button",{onClick:()=>{Be(te.approval_review.fields.filter(t=>t.changed).map(t=>t.key)),R("approval")}},"\u67E5\u770B\u6BD4\u5BF9\u7ED3\u679C \u2192")):e.createElement("span",{className:"df-muted"},te.approval_review.message))})),e.createElement("div",{role:"tabpanel",id:"df-node-panel-attachments","aria-labelledby":"df-node-tab-attachments",hidden:M!=="attachments"},e.createElement("section",{className:"df-paper df-material-panel",id:"df-node-attachments"},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,"\u5176\u4ED6\u9644\u4EF6 ",e.createElement("small",null,Ge.length)),e.createElement("p",{className:"df-muted"},"\u9879\u76EE\u8FC7\u7A0B\u6587\u4EF6\u548C\u8865\u5145\u6750\u6599\u3002")),e.createElement("button",{onClick:()=>ge("material",{name:"",status:"pending",required:!1,note:""})},"\uFF0B \u6DFB\u52A0\u6750\u6599")),e.createElement("div",{className:"df-materials"},Ge.map(t=>{let w=He.reduce((S,Y)=>S+(Y.generations[0]?.files.filter(ce=>ce.name.includes(t.name)).length||0),0);return e.createElement("article",{className:"df-material-row",key:t.id},e.createElement("div",{className:"df-material-name"},e.createElement("b",null,t.name),t.required&&e.createElement("span",{className:"df-required-tag"},"\u5FC5\u5907"),e.createElement("span",{className:"df-state df-material-state-"+t.status},ra[t.status]),w>0&&e.createElement("small",null,"\u5DF2\u6709 ",w," \u4EFD\u751F\u6210\u7A3F \xB7"," ",n.single_form?"\u5728\u6587\u4EF6\u751F\u6210\u4E2D\u67E5\u770B":"\u5728\u4E0A\u65B9\u8868\u5355\u67E5\u770B"),t.note&&e.createElement("p",null,t.note)),e.createElement("div",{className:"df-material-files"},t.files.length>0?e.createElement("details",null,e.createElement("summary",null,t.files.length," \u4EFD\u6587\u4EF6 / \u7248\u672C \xB7 \u6700\u65B0\uFF1A",t.files[t.files.length-1].name),[...t.files].reverse().map((S,Y)=>e.createElement("div",{className:"df-material-file",key:S.id},e.createElement("div",null,e.createElement("b",null,"V",S.version||t.files.length-Y," ","\xB7 ",S.name),e.createElement("small",null,na(S.uploaded_at)," \xB7"," ",Math.max(1,Math.round(S.size/1024))," ","KB")),e.createElement("button",{onClick:()=>{ie(S),re({artifact:{title:S.name},reference:{file_id:S.id}}),ue("preview")}},"\u9884\u89C8"),e.createElement("button",{"aria-label":"\u4E0B\u8F7D"+S.name+"\u7248\u672C"+(S.version||t.files.length-Y),onClick:()=>J("\u4E0B\u8F7D\u6750\u6599",()=>f(`${je}/files/${S.id}`,S.name))},"\u4E0B\u8F7D")))):e.createElement("span",{className:"df-muted"},"\u5C1A\u672A\u4E0A\u4F20\u6587\u4EF6")),e.createElement("div",{className:"df-actions"},e.createElement("button",{"aria-label":"\u4E0A\u4F20"+t.name,onClick:()=>{tt.current=t.id,dt.current.click()}},"\u4E0A\u4F20\u6587\u4EF6"),e.createElement("button",{"aria-label":"\u7F16\u8F91"+t.name,onClick:()=>ge("material",{...t})},"\u7F16\u8F91")))})))),!n.single_form&&e.createElement("div",{className:"df-stage-tail"},e.createElement("p",null,"\u5404\u9636\u6BB5\u53EF\u5E76\u884C\u51C6\u5907\uFF1B\u524D\u5E8F\u8D44\u6599\u53D8\u5316\u540E\uFF0C\u540E\u7EED\u9636\u6BB5\u4F1A\u63D0\u793A\u590D\u6838\u3002\u9636\u6BB5\u5B8C\u6210\u7531\u7ECF\u529E\u4EBA\u786E\u8BA4\u3002"),e.createElement("button",{onClick:()=>ge("stage",{...L,confirmed:!1})},"\u66F4\u65B0\u529E\u7406\u72B6\u6001"))))):e.createElement("section",{className:"df-paper df-project-welcome"},e.createElement("h2",null,"\u5148\u5EFA\u4E00\u4E2A\u9879\u76EE"),e.createElement("p",null,"\u586B\u5199\u57FA\u7840\u4FE1\u606F\u540E\uFF0C\u9009\u62E9\u9636\u6BB5\u529E\u7406\u3002"),e.createElement("div",{className:"df-welcome-stages"},za.map((t,w)=>e.createElement("span",{key:t},e.createElement("small",null,String(w+1).padStart(2,"0")),t))),e.createElement("button",{className:"df-primary",onClick:()=>ge("create",{name:"",code:"",owner:""})},"\u5EFA\u7ACB\u7B2C\u4E00\u4E2A\u9879\u76EE"))),n?.single_form&&e.createElement(At,{key:n.id,collapsed:ct,width:Ve,maxWidth:se,onResize:ye,onToggle:()=>Qe(t=>!t),project:n,stageId:k,services:c,mode:Ae,onMode:ue,selection:Z,attachment:ae,AttachmentPreview:oa,dirty:T,onSelect:t=>{re(t),ie(null),ue("preview")},onChanged:()=>ve().catch(t=>ee(t.message))}),ze==="delete-file"&&e.createElement(Re,{title:"\u5220\u9664\u5BA1\u6279\u6587\u4EF6",busy:!!q,error:de,onClose:()=>R(null)},e.createElement("p",null,"\u786E\u5B9A\u5220\u9664\u5F53\u524D\u9009\u4E2D\u7684\u5BA1\u6279\u6587\u4EF6\uFF1F"),e.createElement("p",{className:"df-delete-file-name"},"V",D.file.version," \xB7 ",D.file.name),e.createElement("p",{className:"df-muted"},"\u5220\u9664\u540E\u53EF\u901A\u8FC7\u201C\u64A4\u9500\u5220\u9664\u201D\u6062\u590D\u3002"),e.createElement("div",{className:"df-actions"},e.createElement("button",{disabled:!!q,onClick:()=>R(null)},"\u53D6\u6D88"),e.createElement("button",{className:"df-danger",disabled:!!q||!!F,onClick:()=>J("\u5220\u9664\u5BA1\u6279\u6587\u4EF6",async()=>{let t={projectId:n.id,stageId:k,materialId:D.materialId,file:D.file},w=await o(`/projects/${t.projectId}/stages/${t.stageId}/materials/${t.materialId}/files/${t.file.id}`,{...m({revision:n.revision}),method:"DELETE"});x(w),R(null),ft(t),(ae?.id===t.file.id||Z?.reference?.file_id===t.file.id)&&(ie(null),re(null),ue("assistant")),await ke()})},"\u786E\u8BA4\u5220\u9664"))),ze==="response-review"&&e.createElement(Re,{title:"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5",onClose:()=>{R(null),ve().catch(t=>ee(t.message))}},e.createElement(ht,{project:n,services:c,onChanged:()=>ve().catch(t=>ee(t.message))})),ze==="approval"&&te&&e.createElement(Re,{title:"\u6838\u5BF9\u8BA1\u5212\u5BA1\u6279\u7ED3\u679C",busy:!!q,error:de,onClose:()=>R(null)},e.createElement("p",{className:"df-muted"},"\u6765\u6E90\uFF1A",te.name," \xB7 \u6279\u590D\u65E5\u671F"," ",te.approval_review.approved_at,"\u3002\u4EC5\u52FE\u9009\u7684\u5DEE\u5F02\u4F1A\u5199\u56DE\u9879\u76EE\u8D44\u6599\u548C\u4E0A\u62A5\u8BA1\u5212\u8868\u5355\u3002"),e.createElement("div",{className:"df-compare df-approval-compare"},te.approval_review.fields.map(t=>e.createElement("label",{key:t.key},e.createElement("input",{type:"checkbox","aria-label":"\u91C7\u7528\u5BA1\u6279\u7ED3\u679C\uFF1A"+t.label,disabled:!t.changed,checked:Me.includes(t.key),onChange:w=>Be(w.target.checked?[...Me,t.key]:Me.filter(S=>S!==t.key))}),e.createElement("div",null,e.createElement("b",null,t.label,!t.changed&&e.createElement("small",null," \u4E00\u81F4")),e.createElement("div",{className:"df-compare-values"},e.createElement("p",null,e.createElement("small",null,"\u5F53\u524D\u8D44\u6599"),t.current||"\u7A7A\u767D"),e.createElement("p",null,e.createElement("small",null,"\u5BA1\u6279\u7ED3\u679C"),t.value||"\u7A7A\u767D")))))),T&&e.createElement("p",{role:"status"},"\u8BF7\u5148\u4FDD\u5B58\u586B\u5199\u5185\u5BB9\uFF0C\u518D\u91C7\u7528\u5BA1\u6279\u7ED3\u679C\u3002"),e.createElement("div",{className:"df-actions"},e.createElement("button",{disabled:!!q,onClick:()=>R(null)},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!q||!!F||T||!Me.length,onClick:()=>J("\u91C7\u7528\u5BA1\u6279\u7ED3\u679C",async()=>{let t=await o(`${je}/stages/plan/approval/apply`,m({revision:n.revision,file_id:te.id,keys:Me}));if(x(t),N){let w=await o(`/cases/${N.id}`);y({...N,initialDraft:w,revision:w.revision})}R(null),Be([]),await ke(),Le("\u5DF2\u91C7\u7528\u6240\u9009\u5BA1\u6279\u7ED3\u679C\u3002\u540E\u7EED\u9636\u6BB5\u4F1A\u63D0\u793A\u91CD\u65B0\u6838\u5BF9\u53D7\u5F71\u54CD\u8D44\u6599\u3002")})},"\u91C7\u7528\u6240\u9009 ",Me.length," \u9879"))),ze==="create"&&e.createElement(Re,{title:"\u65B0\u5EFA\u9879\u76EE",busy:!!q,error:de,onClose:()=>R(null)},e.createElement("form",{onSubmit:t=>{t.preventDefault(),J("\u5EFA\u7ACB\u9879\u76EE",async()=>{let w=await o("/projects",m(D));ie(null),re(null),ue("assistant"),x(w),B("overview"),y(null),E(!1),R(null),await ke()})}},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u540D\u79F0"),e.createElement("input",{"aria-label":"\u65B0\u9879\u76EE\u540D\u79F0",required:!0,maxLength:120,value:D.name,onChange:t=>I({...D,name:t.target.value})})),e.createElement("div",{className:"df-fields"},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u7F16\u53F7"),e.createElement("input",{"aria-label":"\u65B0\u9879\u76EE\u7F16\u53F7",maxLength:100,value:D.code,onChange:t=>I({...D,code:t.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u7ECF\u529E\u4EBA"),e.createElement("input",{"aria-label":"\u65B0\u9879\u76EE\u7ECF\u529E\u4EBA",maxLength:100,value:D.owner,onChange:t=>I({...D,owner:t.target.value})}))),e.createElement("p",{className:"df-muted"},"\u5EFA\u7ACB\u9879\u76EE\u540E\uFF0C\u53EF\u6574\u7406\u5171\u7528\u8D44\u6599\uFF0C\u518D\u6309\u4E03\u4E2A\u9636\u6BB5\u51C6\u5907\u6750\u6599\u3002"),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",disabled:!!q||!!F,onClick:()=>R(null)},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!q||!D.name?.trim(),type:"submit"},"\u5EFA\u7ACB\u9879\u76EE")))),ze==="material"&&e.createElement(Re,{title:"\u6750\u6599\u4FE1\u606F",busy:!!q,error:de,onClose:()=>R(null)},e.createElement("form",{onSubmit:Mt},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u6750\u6599\u540D\u79F0"),e.createElement("input",{"aria-label":"\u6750\u6599\u540D\u79F0",required:!0,maxLength:150,value:D.name,onChange:t=>I({...D,name:t.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u6750\u6599\u72B6\u6001"),e.createElement("select",{"aria-label":"\u6750\u6599\u72B6\u6001",value:D.status,onChange:t=>I({...D,status:t.target.value})},Object.entries(ra).map(([t,w])=>e.createElement("option",{key:t,value:t},w)))),e.createElement("label",{className:"df-checkbox"},e.createElement("input",{type:"checkbox",checked:D.required,onChange:t=>I({...D,required:t.target.checked})}),"\u672C\u9879\u76EE\u7684\u5FC5\u5907\u6750\u6599\uFF0C\u9636\u6BB5\u5B8C\u6210\u524D\u9700\u786E\u8BA4\u5DF2\u5B8C\u6210\u6216\u4E0D\u9002\u7528"),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u6750\u6599\u8BF4\u660E"),e.createElement("textarea",{"aria-label":"\u6750\u6599\u8BF4\u660E",rows:3,maxLength:3e3,value:D.note,onChange:t=>I({...D,note:t.target.value})})),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",onClick:()=>R(null),disabled:!!q||!!F},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!q||!!F,type:"submit"},"\u4FDD\u5B58\u6750\u6599\u4FE1\u606F")))),ze==="stage"&&e.createElement(Re,{title:L.title+"\u529E\u7406\u4FE1\u606F",busy:!!q,error:de,onClose:()=>R(null)},e.createElement("form",{onSubmit:t=>{t.preventDefault(),J("\u4FDD\u5B58\u529E\u7406\u4FE1\u606F",()=>fe(`${je}/stages/${k}`,D,"PUT"))}},e.createElement("div",{className:"df-fields"},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9636\u6BB5\u72B6\u6001"),e.createElement("select",{"aria-label":"\u9636\u6BB5\u72B6\u6001",value:D.status,onChange:t=>I({...D,status:t.target.value})},Object.entries(zt).map(([t,w])=>e.createElement("option",{key:t,value:t},w)))),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u8BA1\u5212\u65E5\u671F"),e.createElement("input",{"aria-label":"\u9636\u6BB5\u8BA1\u5212\u65E5\u671F",type:"date",value:D.due_date,onChange:t=>I({...D,due_date:t.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u529E\u7406\u7CFB\u7EDF"),e.createElement("input",{"aria-label":"\u529E\u7406\u7CFB\u7EDF",maxLength:150,value:D.system_name,onChange:t=>I({...D,system_name:t.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u7CFB\u7EDF\u5730\u5740"),e.createElement("input",{"aria-label":"\u7CFB\u7EDF\u5730\u5740",type:"url",placeholder:"https://",maxLength:1e3,value:D.system_url,onChange:t=>I({...D,system_url:t.target.value})}))),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u63D0\u4EA4\u7F16\u53F7 / \u56DE\u6267\u4FE1\u606F"),e.createElement("input",{"aria-label":"\u63D0\u4EA4\u7F16\u53F7",maxLength:500,value:D.submission_ref,onChange:t=>I({...D,submission_ref:t.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u529E\u7406\u8BF4\u660E"),e.createElement("textarea",{"aria-label":"\u529E\u7406\u8BF4\u660E",rows:4,maxLength:5e3,value:D.notes,onChange:t=>I({...D,notes:t.target.value})})),e.createElement("p",{className:"df-muted"},"\u8BB0\u5F55\u7EBF\u4E0B\u6216\u4E1A\u52A1\u7CFB\u7EDF\u7684\u5B9E\u9645\u529E\u7406\u7ED3\u679C\uFF0C\u56DE\u6267\u6587\u4EF6\u53EF\u4E0A\u4F20\u5230\u6750\u6599\u6E05\u5355\u3002"),D.status==="completed"&&e.createElement(e.Fragment,null,e.createElement("p",{className:"df-muted"},L.missing_required.length>0?"\u5C1A\u672A\u529E\u7ED3\u7684\u5FC5\u5907\u6750\u6599\uFF1A"+L.missing_required.join("\u3001"):"\u8BF7\u786E\u8BA4\u9636\u6BB5\u6750\u6599\u548C\u524D\u5E8F\u53D8\u66F4\u5DF2\u6838\u5BF9\u3002"),e.createElement("label",{className:"df-checkbox"},e.createElement("input",{"aria-label":"\u786E\u8BA4\u672C\u9636\u6BB5\u5DF2\u529E\u7ED3",type:"checkbox",checked:D.confirmed,onChange:t=>I({...D,confirmed:t.target.checked})}),"\u5DF2\u6838\u5BF9\u672C\u9636\u6BB5\u6750\u6599\u53CA\u524D\u5E8F\u53D8\u66F4\uFF0C\u786E\u8BA4\u672C\u9636\u6BB5\u5DF2\u529E\u7ED3")),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",onClick:()=>R(null),disabled:!!q||!!F},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!q||D.status==="completed"&&!D.confirmed,type:"submit"},"\u4FDD\u5B58\u529E\u7406\u4FE1\u606F")))),ae&&!n.single_form&&e.createElement(oa,{key:ae.id,file:ae,projectId:n.id,download:(t,w)=>J("\u4E0B\u8F7D\u539F\u6587\u4EF6",()=>f(t,w)),onClose:()=>ie(null)}))}function ja({project:i,Field:c,request:o,onSave:m,onDirtyChange:f}){let[p,b]=W(i.fields),h=$e(null),l=$e(0),[g,n]=W(!1),[x,k]=W(""),[B,_]=W(null),[O,N]=W([]),[y,T]=W("");Se(()=>()=>{l.current++},[]);let[E,$]=W({name:i.name,code:i.code,owner:i.owner}),d=C=>C==="project.name"?E.name:C==="project.code"?E.code:p.find(v=>v.key===C)?.value||"";async function F(C){if(!C||g)return;let v=++l.current;n(!0),k(""),T("");try{let M=new FormData;M.append("revision",i.revision),M.append("workbook",C);let X=await o(`/projects/${i.id}/profile/import`,{method:"POST",body:M});if(v!==l.current)return;let z=X.fields.filter(V=>V.value!==d(V.key));if(!z.length){T("Excel \u4E2D\u7684\u57FA\u7840\u4FE1\u606F\u4E0E\u5F53\u524D\u5185\u5BB9\u4E00\u81F4\u3002");return}_(z),N(z.map(V=>V.key))}catch(M){v===l.current&&k(M.message)}finally{v===l.current&&n(!1)}}function G(){let C=Object.fromEntries(B.filter(v=>O.includes(v.key)).map(v=>[v.key,v.value]));b(v=>v.map(M=>Object.hasOwn(C,M.key)?{...M,value:C[M.key]}:M)),$(v=>({...v,name:C["project.name"]??v.name,code:C["project.code"]??v.code})),_(null),T(`\u5DF2\u5E26\u5165 ${O.length} \u9879\u57FA\u7840\u4FE1\u606F\uFF0C\u8BF7\u6838\u5BF9\u540E\u4FDD\u5B58\u3002`)}return Se(()=>{f(JSON.stringify(p)!==JSON.stringify(i.fields)||E.name!==i.name||E.code!==i.code||E.owner!==i.owner)},[p,E]),e.createElement("form",{className:"df-paper df-project-profile",onSubmit:C=>{C.preventDefault(),m({...E,values:Object.fromEntries(p.map(v=>[v.key,v.value]))})}},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,"\u57FA\u7840\u4FE1\u606F\u586B\u62A5"),e.createElement("p",{className:"df-muted"},"\u5404\u9636\u6BB5\u8868\u5355\u590D\u7528\u8FD9\u91CC\u7684\u8D44\u6599\uFF1B\u9636\u6BB5\u65E5\u671F\u3001\u8BC4\u5BA1\u5206\u6570\u548C\u4ED8\u6B3E\u7ED3\u679C\u5206\u522B\u8BB0\u5F55\u3002")),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",disabled:g,onClick:()=>h.current?.click()},e.createElement(be,{name:"import"}),g?"\u8BFB\u53D6\u4E2D\u2026":"\u5BFC\u5165 Excel"),e.createElement("button",{className:"df-primary",type:"submit",disabled:g},"\u4FDD\u5B58\u57FA\u7840\u4FE1\u606F"))),e.createElement("input",{ref:h,type:"file",accept:".xlsx",hidden:!0,"aria-label":"\u5BFC\u5165\u57FA\u7840\u4FE1\u606F Excel",onChange:C=>{let v=C.target.files?.[0];C.target.value="",F(v)}}),x&&e.createElement("p",{role:"alert",className:"df-alert error"},x),y&&e.createElement("p",{role:"status",className:"df-alert"},y),e.createElement("div",{className:"df-fields"},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u540D\u79F0"),e.createElement("input",{"aria-label":"\u9879\u76EE\u540D\u79F0",required:!0,value:E.name,maxLength:120,onChange:C=>$({...E,name:C.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u7F16\u53F7"),e.createElement("input",{"aria-label":"\u9879\u76EE\u7F16\u53F7",value:E.code,maxLength:100,onChange:C=>$({...E,code:C.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u7ECF\u529E\u4EBA"),e.createElement("input",{"aria-label":"\u7ECF\u529E\u4EBA",value:E.owner,maxLength:100,onChange:C=>$({...E,owner:C.target.value})}))),[...new Set(p.filter(C=>!["project.name","project.code"].includes(C.key)).map(C=>C.group))].map(C=>e.createElement("section",{className:"df-group",key:C},e.createElement("h3",null,C),e.createElement("div",{className:"df-fields"},p.filter(v=>v.group===C&&!["project.name","project.code"].includes(v.key)).map(v=>e.createElement(c,{key:v.key,field:{...v,required:!1},onChange:M=>b(p.map(X=>X.key===v.key?{...X,value:M}:X))}))))),e.createElement("div",{className:"df-actions"},e.createElement("button",{className:"df-primary",type:"submit",disabled:g},"\u4FDD\u5B58\u57FA\u7840\u4FE1\u606F")),B&&e.createElement(Re,{title:"\u5BFC\u5165\u57FA\u7840\u4FE1\u606F",onClose:()=>_(null)},e.createElement("p",{className:"df-muted"},"\u52FE\u9009\u8981\u5E26\u5165\u7684\u57FA\u7840\u4FE1\u606F\u3002\u7A7A\u767D\u9879\u4FDD\u7559\u539F\u5185\u5BB9\uFF0C\u5E94\u7528\u540E\u8BF7\u6838\u5BF9\u5E76\u4FDD\u5B58\u3002"),e.createElement("div",{className:"df-profile-import-list"},B.map(C=>e.createElement("label",{className:"df-profile-import-item",key:C.key},e.createElement("input",{type:"checkbox","aria-label":"\u5BFC\u5165"+C.label,checked:O.includes(C.key),onChange:v=>N(M=>v.target.checked?[...M,C.key]:M.filter(X=>X!==C.key))}),e.createElement("span",null,e.createElement("strong",null,C.label),e.createElement("span",{className:"df-muted"},"\u5F53\u524D\uFF1A",d(C.key)||"\u672A\u586B\u5199"),e.createElement("span",null,"Excel\uFF1A",C.value))))),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",onClick:()=>_(null)},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",type:"button",disabled:!O.length,onClick:G},"\u5E94\u7528\u5230\u57FA\u7840\u4FE1\u606F"))))}var Ce=window.QwenPaw.host.React,{useEffect:sa,useRef:Ut,useState:Pa}=Ce;function Ea({field:i}){let[c,o]=Pa(!1),m=Ut(null),f=Ut(null),p=Ut(null),b=()=>{window.clearTimeout(p.current),o(!0)};sa(()=>()=>window.clearTimeout(p.current),[]);let h="df-help-"+i.key;return sa(()=>{if(!c)return;let l=n=>{m.current?.contains(n.target)||o(!1)},g=n=>{if(n.key!=="Escape")return;n.preventDefault(),n.stopPropagation();let x=m.current?.contains(document.activeElement);o(!1),x&&f.current?.focus()};return document.addEventListener("pointerdown",l),document.addEventListener("keydown",g,!0),()=>{document.removeEventListener("pointerdown",l),document.removeEventListener("keydown",g,!0)}},[c]),Ce.createElement("span",{className:"df-field-help",ref:m,onMouseEnter:b,onMouseLeave:l=>{l.relatedTarget?.nodeType&&l.currentTarget.contains(l.relatedTarget)||m.current?.contains(document.activeElement)||(p.current=window.setTimeout(()=>o(!1),120))},onBlur:l=>{l.relatedTarget&&!l.currentTarget.contains(l.relatedTarget)&&o(!1)}},Ce.createElement("button",{type:"button",className:"df-field-help-trigger","aria-label":i.label+"\uFF1A\u586B\u5199\u8BF4\u660E","aria-expanded":c,"aria-controls":c?h:void 0,"aria-describedby":c?h:void 0,ref:f,onFocus:b,onClick:b},Ce.createElement("svg",{viewBox:"0 0 20 20",fill:"none","aria-hidden":"true"},Ce.createElement("circle",{cx:"10",cy:"10",r:"7.5"}),Ce.createElement("path",{d:"M7.8 7.6a2.3 2.3 0 0 1 4.4.9c0 1.6-2.2 1.8-2.2 3.2"}),Ce.createElement("circle",{cx:"10",cy:"14",r:".65",fill:"currentColor",stroke:"none"}))),c&&Ce.createElement("span",{className:"df-field-help-content",id:h,role:"tooltip",onMouseEnter:b},i.help))}function jt({field:i,inputId:c}){return Ce.createElement("div",{className:"df-field-label"},Ce.createElement(c?"label":"span",{htmlFor:c},i.label,i.required&&Ce.createElement("span",{className:"df-required",title:"\u5FC5\u586B","aria-hidden":"true"},"*")),i.help&&Ce.createElement(Ea,{field:i}))}var pa=window.QwenPaw.host.React,{useRef:$a,useLayoutEffect:Ta}=pa;function la(i){function c(o){return o.nodeType===3?o.textContent.replace(/\u00a0/g," "):o.nodeType!==1?"":o.dataset.reference?"\u3010"+o.dataset.reference+"\u3011":o.tagName==="BR"?`
`:[...o.childNodes].map((m,f)=>(m.nodeType===1&&/^(DIV|P)$/.test(m.tagName)&&f>0?`
`:"")+c(m)).join("")}return c(i)}function Wt({field:i,inputId:c,onChange:o}){let m=$a(null);Ta(()=>{let p=m.current,b=[...p.querySelectorAll("[data-reference]")],h=i.linked_parts.filter(g=>typeof g=="object");if(la(p)===i.linked_template&&b.length===h.length&&b.every((g,n)=>g.textContent==="\u3010"+h[n].value+"\u3011"))return;let l=document.createDocumentFragment();for(let g of i.linked_parts)if(typeof g=="string")l.append(document.createTextNode(g));else{let n=document.createElement("span");n.className="df-reference-token",n.dataset.reference=g.field,n.setAttribute("contenteditable","false"),n.title=g.label+" \xB7 \u81EA\u52A8\u5173\u8054",n.setAttribute("aria-label",g.label+"\uFF1A"+g.value),n.textContent="\u3010"+g.value+"\u3011",l.append(n)}p.replaceChildren(l)},[i.linked_template,i.linked_parts]);function f(){let p=la(m.current);o(i.value,p)}return pa.createElement("div",{id:c,ref:m,className:"df-linked-editor",role:"textbox","aria-label":i.label,"aria-multiline":"true","aria-required":i.required||void 0,contentEditable:!0,suppressContentEditableWarning:!0,onInput:f,onPaste:p=>{p.preventDefault();let b=p.clipboardData.getData("text/plain"),h=window.getSelection();if(!h?.rangeCount||!m.current.contains(h.anchorNode))return;let l=h.getRangeAt(0);l.deleteContents();let g=document.createTextNode(b);l.insertNode(g),l.setStartAfter(g),l.collapse(!0),h.removeAllRanges(),h.addRange(l),f()}})}function fa(i){let c=Object.fromEntries(i.map(o=>[o.key,o.value]));return i.map(o=>{if(o.linked_template===void 0||!o.linked_variables)return o;let m={...o.linked_variables,...c},f=[],p=0;for(let h of o.linked_template.matchAll(/【([a-z][a-z0-9_.]*(?:\|[0-6])?)】/g)){let[l,g]=h[1].split("|");if(!(l in o.linked_variables))continue;f.push(o.linked_template.slice(p,h.index));let n=o.linked_parts.find(k=>typeof k=="object"&&k.field.split("|")[0]===l),x=m[l]?.trim();if(g&&x&&/^-?\d+(?:\.\d+)?$/.test(x)){let[k,B=""]=x.split(".");x=k+"."+B.padEnd(Number(g),"0")}f.push({field:h[1],label:n?.label||l,value:x||`\uFF08${n?.label||"\u5F15\u7528\u8D44\u6599"}\u5F85\u586B\u5199\uFF09`}),p=h.index+h[0].length}f.push(o.linked_template.slice(p));let b=f.map(h=>typeof h=="string"?h:h.value).join("");return{...o,linked_parts:f,linked_rendered:b,value:b}})}var _e=window.QwenPaw,a=_e.host.React,{useState:he,useEffect:nt,useLayoutEffect:Sa,useRef:yt}=a,Qt="/document-forms";function Bt(i,c,o){return{artifact:{id:c.id+o.name,title:o.name,source:"generated",extension:o.name.endsWith(".xlsx")?"xlsx":"docx",mimeType:o.name.endsWith(".xlsx")?"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":"application/vnd.openxmlformats-officedocument.wordprocessingml.document",binaryUrl:o.preview_url,printUrl:Qt+`/cases/${i}/print/${c.id}/${encodeURIComponent(o.name)}`,agentId:_e.host.getSelectedAgentId?.(),createdAt:Date.parse(c.created_at)},reference:{case_id:i,generation_id:c.id,name:o.name}}}async function we(i,c){let o=await _e.host.fetch(Qt+i,c);if(!o.ok){let m=await o.json().catch(()=>({})),f=new Error(typeof m.detail?.message=="string"?m.detail.message:typeof m.detail=="string"?m.detail:Array.isArray(m.detail)?m.detail.map(p=>`${p.loc?.slice(1).join(".")||"\u8D44\u6599"}\uFF1A${p.msg}`).join("\uFF1B"):`\u64CD\u4F5C\u672A\u5B8C\u6210\uFF08${o.status}\uFF09\uFF0C\u8BF7\u68C0\u67E5\u586B\u5199\u5185\u5BB9`);throw f.issues=m.detail?.issues,f}return o.json()}async function ot(i,c){let o=await _e.host.fetch(Qt+i);if(!o.ok)throw new Error("\u6587\u4EF6\u4E0B\u8F7D\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5");let m=URL.createObjectURL(await o.blob()),f=document.createElement("a");f.href=m,f.download=c,document.body.appendChild(f);try{f.click()}finally{f.remove(),setTimeout(()=>URL.revokeObjectURL(m),1e3)}}var We=i=>({method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(i)}),pt=i=>new Date(i).toLocaleString("zh-CN",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}),Da=i=>i.kind==="textarea"||i.value.length>100||i.value.includes(`
`)||i.label.includes("\u6574\u6BB5"),La=i=>/^(research\.contents|deliverables\.|metrics\.|milestones\.)/.test(i.key)||/主要研究内容|预期成果|考核指标|进度安排/.test(i.label),Et=i=>i?.match(/^\d{4}-\d{2}-\d{2}(?=[T ]|$)/)?.[0];function Pt(i,c){let o=i.map(m=>({...m}));for(let[m,f]of o.entries()){let p=typeof f.follow_end!="boolean"&&!f.end;for(let g of["start","end"]){let n="follow_"+g;f[n]=m>0&&(typeof f[n]=="boolean"?f[n]:!f[g]),f[g]=(f[n]?o[0][g]:f[g])||""}let b=Et(f.start),h=c&&f.start!==c[m].start,l=f.follow_end&&f.end&&b!==Et(o[0].start);if(b&&(h||l||p&&!f.end)){let g=f.end.match(/[T ](\d{2}:\d{2}(?::\d{2})?)$/)?.[1];f.end=b+"T"+(g||"17:30")}}return o}function Ma({field:i,onChange:c}){let o=["","",""],m=0;for(let f of i.value.split(/\r?\n/)){let p=f.match(/^\s*([1-3])[.、．)）]\s?(.*)$/);p?o[Number(p[1])-1]=p[2]:m<3&&(o[m++]=f)}return a.createElement("div",{className:"df-plan-partners",id:"df-plan.partners",role:"group","aria-label":i.label},a.createElement(jt,{field:i}),o.map((f,p)=>a.createElement("label",{className:"df-field",key:p},a.createElement("span",null,"\u5355\u4F4D",p+1),a.createElement("input",{"aria-label":`\u5355\u4F4D${p+1}`,type:"text",value:f,onChange:b=>{let h=o.map((l,g)=>g===p?b.target.value:l);c(h.some(l=>l.trim())?h.map((l,g)=>`${g+1}. ${l}`).join(`
`):"")}}))))}function ca({title:i,issues:c,onFix:o}){return c.length?a.createElement("section",{className:"df-paper","aria-label":i},a.createElement("h3",null,i),a.createElement("div",{className:"df-checks","aria-live":"polite"},c.map(({label:m,detail:f,status:p,field:b},h)=>a.createElement("div",{key:h,className:"df-check "+p},a.createElement("span",null,p==="missing"?"\u5F85\u8865\u5145":"\u51B2\u7A81"),a.createElement("div",null,a.createElement("b",null,m),a.createElement("p",null,f)),b&&a.createElement("button",{onClick:()=>o(b)},"\u4FEE\u6539"))))):null}function ma({field:i,displayValue:c,onChange:o,issue:m}){let f="df-input-"+i.key,p=m?{"aria-invalid":!0,"aria-describedby":f+"-error"}:{},b=i.key!=="plan.notes"&&Da(i),h=i.linked_template!==void 0,l=La(i)||h,g=["date","datetime-local"].includes(i.kind)?i.value:c??i.value,n=yt(null);return Sa(()=>{if(!n.current)return;let x=n.current.scrollTop;n.current.style.height="auto",n.current.style.height=Math.max(l?104:192,n.current.scrollHeight)+"px",n.current.scrollTop=x},[g,b,l]),i.key==="plan.partners"?a.createElement(Ma,{field:i,onChange:o}):a.createElement("div",{className:"df-field"+(b?" df-field-paragraph":"")+(l?" df-field-compact":""),id:"df-"+i.key},a.createElement(jt,{field:i,inputId:f}),h?a.createElement(Wt,{field:i,inputId:f,onChange:o}):i.options?a.createElement("select",{id:f,"aria-label":i.label,"aria-required":i.required||void 0,...p,value:g,onChange:x=>o(x.target.value)},a.createElement("option",{value:""},"\u8BF7\u9009\u62E9"),g&&!i.options.includes(g)&&a.createElement("option",{value:g,disabled:!0},g,"\uFF08\u8BF7\u91CD\u65B0\u9009\u62E9\uFF09"),i.options.map(x=>a.createElement("option",{key:x,value:x},x))):b?a.createElement("textarea",{id:f,ref:n,"aria-label":i.label,"aria-required":i.required||void 0,...p,rows:l?3:8,value:g,onChange:x=>o(x.target.value)}):a.createElement("input",{id:f,"aria-label":i.label,"aria-required":i.required||void 0,...p,type:i.key==="plan.notes"?"text":i.kind,readOnly:!!i.read_only,step:i.kind==="number"?"any":void 0,value:g,onChange:x=>o(x.target.value)}),m&&a.createElement("small",{id:f+"-error",className:"df-field-validation"},m.detail))}function Ia({fields:i,onChange:c,compact:o=!1}){let m=i.filter(p=>/^selection\.member\d+_name$/.test(p.key));if(!m.length)return null;let f={unit:["\u5730\u4E0B\u7A7A\u95F4\u5229\u7528\u7814\u7A76\u6240",...i.filter(p=>["contact.department","project.executing_unit"].includes(p.key)).map(p=>p.value)],title:["\u526F\u6240\u957F/\u9AD8\u5DE5","\u4F01\u4E1A\u9AD8\u7EA7\u4E13\u5BB6/\u9AD8\u5DE5","\u90E8\u95E8\u8D1F\u8D23\u4EBA/\u9AD8\u5DE5","\u4E00\u7EA7\u5DE5\u7A0B\u5E08/\u9AD8\u5DE5","\u9AD8\u7EA7\u5DE5\u7A0B\u5E08","\u5DE5\u7A0B\u5E08","\u6559\u6388","\u526F\u6559\u6388"],category:["\u4E3B\u4EFB","\u526F\u4E3B\u4EFB","\u79D1\u59D4\u4F1A\u6210\u5458","\u4E13\u5BB6","\u7EC4\u957F","\u6210\u5458"]};return a.createElement("section",{className:"df-group df-selection-members","aria-label":"\u8BBA\u8BC1\u6210\u5458"},!o&&a.createElement("h3",null,"\u8BBA\u8BC1\u6210\u5458"),!o&&a.createElement("p",{className:"df-muted"},"\u6BCF\u4EBA\u4E00\u884C\u3002\u5355\u4F4D\u3001\u804C\u52A1/\u804C\u79F0\u548C\u7C7B\u522B\u53EF\u9009\u62E9\uFF0C\u4E5F\u53EF\u76F4\u63A5\u8F93\u5165\u3002"),a.createElement("div",{className:"df-member-scroll"},a.createElement("table",{className:"df-member-table"},a.createElement("thead",null,a.createElement("tr",null,a.createElement("th",{scope:"col"},"\u5E8F\u53F7"),a.createElement("th",{scope:"col"},"\u59D3\u540D"),a.createElement("th",{scope:"col"},"\u5355\u4F4D"),a.createElement("th",{scope:"col"},"\u804C\u52A1/\u804C\u79F0"),a.createElement("th",{scope:"col"},"\u7C7B\u522B"))),a.createElement("tbody",null,m.map((p,b)=>{let h=p.key.replace(/name$/,"");return a.createElement("tr",{key:p.key},a.createElement("th",{scope:"row"},String(b+1).padStart(2,"0")),["name","unit","title","category"].map(l=>{let g=i.find(k=>k.key===h+l);if(!g)return a.createElement("td",{key:l});let n=l==="name"?[]:[...new Set([...f[l],...i.filter(k=>new RegExp(`^selection\\.member\\d+_${l}$`).test(k.key)).map(k=>k.value)].filter(Boolean))],x="df-options-"+g.key;return a.createElement("td",{key:l,id:"df-"+g.key},a.createElement("input",{"aria-label":g.label,value:g.value,list:n.length?x:void 0,autoComplete:"off",onChange:k=>c(g.key,k.target.value)}),n.length>0&&a.createElement("datalist",{id:x},n.map(k=>a.createElement("option",{value:k,key:k}))))}))})))))}function Aa({project:i,workflowStage:c,initialCaseId:o,initialView:m,editRequest:f=0,initialDraft:p,onBack:b,onChanged:h,onDirtyChange:l,onBusyChange:g,onViewChange:n,docked:x=!1,onPreview:k,nodeTab:B,selectedOutput:_,onAskAboutOutput:O,onStageStatus:N,onEditBasics:y,toolbarTarget:T,onShowForm:E,onDownloadStageMaterials:$}){let[d,F]=he(null),[G,C]=he(""),[v,M]=he(null),[X,z]=he([]),[V,q]=he("import"),[K,de]=he(!1),[ee,De]=he([]),[Le,ze]=he([]),[R,D]=he([]),[I,Me]=he(""),[Be,me]=he(""),[ft,ae]=he(""),[ie,xe]=he(null),[kt,ct]=he(null),Qe=yt(null),Ve=yt(null),et=yt(0),se=yt(!0),$t=_e.host.useTheme?.()||"light",Ie=()=>h?.()||Promise.resolve(),ye=x&&T&&_e.host.ReactDOM?.createPortal;nt(()=>(se.current=!0,(p?Promise.resolve(p):we("/cases/"+o)).then(r=>{se.current&&(re(r),q(m==="files"&&r.generations.length?"files":"edit"),m==="files"&&r.generations.length&&xe({file:r.generations[0].files[0],generation:r.generations[0]}))}).catch(r=>se.current&&me(r.message)),(_e.workspace?.loadPreview?_e.workspace.loadPreview():Promise.resolve(Te)).then(r=>{se.current&&ct(()=>r)}).catch(r=>{se.current&&ct(()=>Te)}),()=>{se.current=!1,et.current++}),[]),nt(()=>{f&&q("edit")},[f]),nt(()=>{l?.(K)},[K]),nt(()=>{g?.(I)},[I]),nt(()=>{n?.()},[V]),nt(()=>{let r=s=>{K&&(s.preventDefault(),s.returnValue="")};return window.addEventListener("beforeunload",r),()=>window.removeEventListener("beforeunload",r)},[K]);async function Z(r,s){if(I)return;let u=++et.current;Me(r),me(""),ae("");try{await s()}catch(U){se.current&&u===et.current&&(me(U.message),B!=="generate"&&E?.())}finally{se.current&&u===et.current&&Me("")}}function re(r,{retainAgent:s=!1}={}){se.current&&(F({...r,recipients:Pt(r.recipients),presentation_sources:Object.fromEntries(r.fields.map(u=>[u.key,u.value]))}),de(!1),De([]),ze([]),s||D([]))}function Ae(r){F({...r,fields:fa(r.fields)}),de(!0),x&&q("edit"),De([]),ze([]),D([]),ae("")}function ue(r,s,u,U=!1){let ne=d.recipients.map((Ne,bt)=>bt===r?{...Ne,[s]:u,...s!=="name"?{["follow_"+s]:U}:{}}:Ne);Ae({...d,recipients:Pt(ne,s==="start"?d.recipients:void 0)})}function le(){return{revision:d.revision,name:d.name.trim()||"\u672A\u547D\u540D\u586B\u62A5",values:Object.fromEntries(d.fields.map(r=>[r.key,r.value])),recipients:d.recipients,opinion_templates:Object.fromEntries(d.fields.filter(r=>r.linked_template!==void 0).map(r=>[r.key,r.linked_template]))}}async function pe(){if(!K)return d;let r=await we("/cases/"+d.id,{...We(le()),method:"PUT"});return re(r,{retainAgent:!0}),r}function mt(){return!K||window.confirm("\u5F53\u524D\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\u3002\u79BB\u5F00\u6B64\u8BB0\u5F55\uFF1F")}let dt=d?.stage_id==="plan"&&d?.plan_schema===1,tt=d?.stage_id==="selection"&&d?.selection_schema===1,Nt=d?.stage_id==="contract",oe=(c?.id||d?.stage_id)==="negotiation",Tt=oe?i?.stages?.find(r=>r.id==="selection"&&r.status==="completed"):void 0,L=Et(Tt?.approval_date),He=r=>ea(r,oe?"negotiation":void 0),Ke=oe?Fe[2]:"recipients",Ge=dt||tt||Nt,St=Ge?"\u6587\u4E66\u6A21\u677F":"Word \u6A21\u677F",te=Ge?d.fields.filter(r=>r.scope!=="shared"):d?.fields||[],at=[...new Set([...oe?Fe:[],...te.map(He)])];if(tt){let r=["\u8BBA\u8BC1\u5B89\u6392","\u5019\u9009\u5355\u4F4D","\u8BBA\u8BC1\u6210\u5458","\u8BBA\u8BC1\u610F\u89C1","\u975E\u62DB\u6807\u65B9\u6848"];at.sort((s,u)=>{let U=ne=>{let Ne=r.indexOf(ne);return Ne<0?r.length:Ne};return U(s)-U(u)})}let ke=[...at.map(r=>({id:r,label:r})),...!Ge&&!oe?[{id:"recipients",label:"\u53D7\u9080\u5355\u4F4D"}]:[],...x?[]:[{id:"generate",label:"\u6A21\u677F\u4E0E\u751F\u6210",align:"end"}]],ve=ke.some(r=>r.id===G)?G:ke[0]?.id,J=d?.templates||[],Dt=J.reduce((r,s)=>r+(s.per_recipient?d.recipients.length:1),0),Xe=(r,s)=>(r.stage_id||s.original_stage_id||s.stage_id)===c.id,ge=(d?.generations||[]).filter(r=>!x||Xe(r,d)),fe=ge[0],it=x?i.forms.filter(r=>r.case_id!==(d?.id||i.form_id)):[],ut=[...ge.map(r=>({caseId:d.id,batch:r})),...it.flatMap(r=>r.generations.filter(s=>Xe(s,r)).map(s=>({caseId:r.case_id,batch:s})))];nt(()=>{if(!d||I||V!=="edit"||x&&B!=="form")return;let r=new AbortController,s=setTimeout(async()=>{try{let u=await we("/cases/"+d.id+"/validate",{...We(le()),signal:r.signal});r.signal.aborted||De(u.issues)}catch{r.signal.aborted||De([])}},350);return()=>{clearTimeout(s),r.abort()}},[d,I,V,B,x,L]);function je(r){return r.map(s=>({...s,field:d.fields.some(u=>u.key===s.field)||/^recipient-\d+(?:-start|-end)?$/.test(s.field)?s.field:""}))}async function Lt(r){!r||!mt()||await Z("\u8BFB\u53D6 Excel",async()=>{let s=new FormData;s.append("workbook",r),s.append("revision",i.revision),s.append("stage_id",c.id);let u=await we(`/projects/${i.id}/${i.single_form?"form":"cases"}/import`,{method:"POST",body:s});re(u),xe(null),C(""),q("edit"),E?.(),await Ie(),ae(u.templates.length?"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\uFF0C\u5E76\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002":u.template_notice||"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\u3002\u8BF7\u6DFB\u52A0\u5BF9\u5E94\u7684 Word \u6A21\u677F\u3002")})}async function Mt(r){r=Array.from(r),r.length&&await Z("\u8BFB\u53D6 Word \u6A21\u677F",async()=>{let s=await pe(),u=new FormData;u.append("revision",String(s.revision)),Array.from(r).forEach(U=>u.append("files",U)),re(await we("/cases/"+s.id+"/templates",{method:"POST",body:u})),await Ie(),ae("Word \u6A21\u677F\u5DF2\u6DFB\u52A0\uFF0C\u751F\u6210\u65F6\u4F1A\u4FDD\u7559\u539F\u6709\u6392\u7248\u3002")})}async function gt(){await Z("\u667A\u80FD\u4F53\u6838\u67E5",async()=>{D([]);let r=await we("/cases/"+d.id+"/agent-check",We(le()));se.current&&(D(r.issues),r.issues.length||ae("\u667A\u80FD\u4F53\u672A\u53D1\u73B0\u51B2\u7A81\u3002"))})}async function t(){await Z("\u751F\u6210\u6587\u4E66",async()=>{ze([]);let r=await pe(),s;try{s=await we("/cases/"+r.id+"/generate",We({revision:r.revision}))}catch(ne){if(!Array.isArray(ne.issues))throw ne;se.current&&ze(ne.issues);return}if(!se.current)return;re(s,{retainAgent:!0});let u=s.generations[0],U=u.files[0];x?(q("edit"),U&&k(Bt(s.id,u,U))):(q("files"),xe({file:U,generation:u})),await Ie()})}function w(r){let s=d.fields.find(u=>u.key===r);if(s?.scope==="shared"&&Ge&&y){y();return}C(s?He(s):r.startsWith("recipient-")?Ke:"generate"),q("edit"),(s||r.startsWith("recipient-"))&&E?.(),requestAnimationFrame(()=>{let u=document.getElementById("df-"+r);u?.scrollIntoView?.({behavior:"smooth",block:"center"});let U="input,textarea,select";(u?.matches(U)?u:u?.querySelector(U))?.focus()})}let S=(r,s,u)=>`/cases/${r}/outputs/${s.id}/${encodeURIComponent(u)}`;function Y(r,s){return Z("\u6B63\u5728\u4E0B\u8F7D\u538B\u7F29\u5305",async()=>{await ot(S(r,s,"\u5168\u90E8\u6587\u4E66.zip"),s.bundle_name||(x?i.name:d.name)+"_\u6587\u4E66.zip"),ae(`\u5DF2\u5F00\u59CB\u4E0B\u8F7D\u8BE5\u6279\u6B21\u7684 ${s.files.length} \u4EFD\u6587\u4E66\u538B\u7F29\u5305\u3002`)})}let ce=ie?.file?Bt(d.id,ie.generation,ie.file).artifact:null;async function Pe(){await Z("\u5BFC\u51FA Excel",async()=>{let r=await pe();await ot("/cases/"+r.id+"/excel",(r.fields.find(s=>s.key==="project.name")?.value||r.name).replace(/[<>:"/\\|?*\x00-\x1f]/g,"_").slice(0,80)+"_\u586B\u5199\u6570\u636E.xlsx")})}let Je=a.createElement("section",{className:"df-paper df-template-panel","aria-label":St},a.createElement("div",{className:"df-section-head"},!ye&&a.createElement("h2",null,St),a.createElement("div",{className:"df-template-actions"},J.length>0?a.createElement("button",{onClick:()=>Z("\u4FDD\u5B58\u9ED8\u8BA4\u6A21\u677F",async()=>{let r=await pe();await we(`/cases/${r.id}/defaults`,We({revision:r.revision})),ae(c.id==="negotiation"?"\u5DF2\u8BBE\u4E3A\u672C\u673A\u9ED8\u8BA4\u6A21\u677F\uFF0C\u4EE5\u540E\u65B0\u5EFA\u586B\u62A5\u4F1A\u81EA\u52A8\u8F7D\u5165\u3002":"\u5DF2\u8BBE\u4E3A\u672C\u9636\u6BB5\u9ED8\u8BA4\u6A21\u677F\uFF0C\u4EE5\u540E\u65B0\u5EFA\u8BE5\u9636\u6BB5\u8868\u5355\u4F1A\u81EA\u52A8\u8F7D\u5165\u3002")})},c.id==="negotiation"?"\u8BBE\u4E3A\u9ED8\u8BA4\u6A21\u677F":"\u8BBE\u4E3A\u672C\u9636\u6BB5\u9ED8\u8BA4\u6A21\u677F"):a.createElement("button",{onClick:()=>Z("\u8F7D\u5165\u9ED8\u8BA4\u6A21\u677F",async()=>{let r=await pe();re(await we(`/cases/${r.id}/defaults/apply`,We({revision:r.revision}))),ae("\u5DF2\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002")})},"\u4F7F\u7528\u9ED8\u8BA4\u6A21\u677F"),!ye&&a.createElement("button",{onClick:()=>Ve.current.click()},"\uFF0B \u6DFB\u52A0"))),!ye&&!J.length&&a.createElement("p",{className:"df-muted"},"\u6DFB\u52A0\u4E0E\u4F60\u7684\u53D8\u91CF\u8868\u5BF9\u5E94\u7684 .docx \u6216 .xlsx \u6A21\u677F\u3002"),J.map(r=>a.createElement("div",{className:"df-template",key:r.id},a.createElement("b",null,r.name),r.from_builtin&&a.createElement("small",null,"\u5E94\u7528\u81EA\u5E26\u6A21\u677F"),a.createElement("span",null,r.per_recipient?"\u6309\u53D7\u9080\u5355\u4F4D\u5206\u522B\u751F\u6210":"\u5171\u7528\u6587\u4EF6 \xB7 \u751F\u6210\u4E00\u4EFD"),r.print_copies>1&&a.createElement("small",null,"\u5EFA\u8BAE\u6253\u5370 ",r.print_copies," \u4EFD \xB7 ",r.print_note),a.createElement("button",{"aria-label":"\u79FB\u9664\u6A21\u677F"+r.name,onClick:()=>Z("\u79FB\u9664\u6A21\u677F",async()=>{let s=await pe();re(await we(`/cases/${s.id}/templates/${r.id}?revision=${s.revision}`,{method:"DELETE"}))})},"\u79FB\u9664")))),Vt=d&&!Ge&&a.createElement("section",{className:oe?"df-recipient-section":"df-paper",role:oe?void 0:"tabpanel",id:"df-form-panel-recipients","aria-labelledby":`df-form-tab-${Ke}`,hidden:ve!==Ke},a.createElement("div",{className:"df-section-head"},a.createElement("div",null,a.createElement("h2",null,"\u53D7\u9080\u5355\u4F4D ",a.createElement("span",{className:"df-count"},d.recipients.length)),a.createElement("p",null,"\u6309\u5355\u4F4D\u6587\u4E66\u5206\u522B\u751F\u6210\uFF0C\u5171\u7528\u9879\u76EE\u4E0E\u843D\u6B3E\u4FE1\u606F\u3002")),a.createElement("button",{onClick:()=>Ae({...d,recipients:Pt([...d.recipients,{name:"",start:"",end:""}])}),disabled:d.recipients.length>=200},"\uFF0B \u6DFB\u52A0\u5355\u4F4D")),d.recipients.map((r,s)=>a.createElement("div",{className:"df-recipient",key:s,id:"df-recipient-"+s},a.createElement("div",{className:"df-recipient-title"},a.createElement("b",null,String(s+1).padStart(2,"0")),a.createElement("button",{"aria-label":`\u79FB\u9664\u7B2C${s+1}\u5BB6\u5355\u4F4D`,onClick:()=>Ae({...d,recipients:Pt(d.recipients.filter((u,U)=>U!==s))})},"\u79FB\u9664")),a.createElement("div",{className:"df-fields"},[["name","\u5355\u4F4D\u540D\u79F0"],["start","\u9886\u53D6\u5F00\u59CB\u65F6\u95F4"],["end","\u9886\u53D6\u7ED3\u675F\u65F6\u95F4"]].map(([u,U])=>{let ne=`df-recipient-${s}-${u}`,Ne=Et(r.start),bt=u==="start"&&L&&Ne&&Ne<=L?`\u9886\u53D6\u5F00\u59CB\u65E5\u671F\u5FC5\u987B\u665A\u4E8E\u9009\u5546\u8BBA\u8BC1\u5BA1\u6279\u65E5\u671F\uFF08${L}\uFF09\u3002`:"",rt=ee.filter(Ee=>Ee.status==="error"&&Ee.field===`recipient-${s}-${u}`&&Ee.detail!==bt).map(Ee=>Ee.detail);return bt&&rt.unshift(bt),a.createElement("div",{className:"df-field "+(u==="name"?"df-span":""),key:u},a.createElement("label",{htmlFor:ne},U),a.createElement("input",{id:ne,"aria-label":`\u7B2C${s+1}\u5BB6${U}`,"aria-invalid":rt.length?!0:void 0,"aria-describedby":rt.length?ne+"-error":void 0,type:u==="name"?"text":"datetime-local",value:u==="name"?r[u]:r[u].replace(" ","T"),onChange:Ee=>ue(s,u,Ee.target.value)}),rt.length===1&&a.createElement("small",{id:ne+"-error",className:"df-field-validation"},rt[0]),rt.length>1&&a.createElement("ul",{id:ne+"-error",className:"df-field-validation"},rt.map((Ee,ga)=>a.createElement("li",{key:ga},Ee))),s>0&&u!=="name"&&a.createElement("small",{className:"df-follow-state"},r["follow_"+u]?u==="end"?"\u65F6\u523B\u8DDF\u968F\u7B2C1\u5BB6":"\u8DDF\u968F\u7B2C1\u5BB6":"\u5DF2\u5355\u72EC\u8BBE\u7F6E",!r["follow_"+u]&&a.createElement("button",{type:"button","aria-label":`\u7B2C${s+1}\u5BB6${U}\u6062\u590D\u8DDF\u968F`,onClick:Ee=>{Ee.preventDefault(),ue(s,u,d.recipients[0][u],!0)}},"\u6062\u590D\u8DDF\u968F")))})),ee.filter(u=>u.status==="error"&&u.field==="recipient-"+s).map((u,U)=>a.createElement("p",{className:"df-field-validation",key:U},u.detail))))),ua=a.createElement(a.Fragment,null,a.createElement("div",{className:"df-toolbar-file-actions"},a.createElement(Ot,{label:"\u6A21\u677F",icon:"template",disabled:!!I||!d},a.createElement("button",{className:"df-toolbar-template-import",disabled:!!I,onClick:()=>Ve.current.click()},a.createElement(be,{name:"import"}),"\u5BFC\u5165\u6A21\u677F"),a.createElement("button",{"aria-label":"\u4E0B\u8F7D\u914D\u5957\u6A21\u677F",disabled:!!I,onClick:()=>Z("\u4E0B\u8F7D\u914D\u5957\u6A21\u677F",()=>ot("/starter","\u6587\u4E66\u586B\u62A5_\u914D\u5957\u6A21\u677F.zip"))},a.createElement(be,{name:"download"}),"\u4E0B\u8F7D\u6A21\u677F"),Je),a.createElement("button",{"aria-label":"\u4E0B\u8F7D\u672C\u9636\u6BB5\u6750\u6599",title:"\u4E0B\u8F7D\u672C\u9636\u6BB5\u6750\u6599",disabled:!!I,onClick:$},a.createElement(be,{name:"download"}),"\u9636\u6BB5\u6750\u6599"),a.createElement(Ot,{label:"\u66F4\u591A\u64CD\u4F5C",icon:"more",iconOnly:!0,disabled:!!I||!d},a.createElement("label",{className:"df-field"},a.createElement("span",null,"\u8868\u5355\u540D\u79F0"),a.createElement("input",{"aria-label":"\u8868\u5355\u540D\u79F0",maxLength:120,value:d?.name||"",onChange:r=>Ae({...d,name:r.target.value})})),a.createElement("button",{disabled:!!I,onClick:()=>{M("adopt"),z([]),E?.()}},"\u6838\u5BF9\u9879\u76EE\u8D44\u6599\u5DEE\u5F02"),a.createElement("button",{disabled:!!I,onClick:()=>{M("publish"),z([]),E?.()}},"\u5B58\u5165\u9879\u76EE\u5E95\u7A3F"))),a.createElement("div",{className:"df-toolbar-save"},d&&a.createElement("span",{className:"df-save-state"+(K?" is-dirty":""),title:K?"\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539":"\u8349\u7A3F\u5DF2\u4FDD\u5B58 \xB7 "+pt(d.updated_at),role:"status"},K?"\u672A\u4FDD\u5B58":"\u5DF2\u4FDD\u5B58"),a.createElement("button",{className:"df-toolbar-icon-button",title:"\u5BFC\u5165 Excel","aria-label":"\u5BFC\u5165 Excel",disabled:!!I||!d,onClick:()=>Qe.current.click()},a.createElement(be,{name:"import"})),a.createElement("button",{className:"df-toolbar-icon-button",title:"\u5BFC\u51FA\u5F53\u524D Excel","aria-label":"\u5BFC\u51FA\u5F53\u524D Excel",disabled:!!I||!d,onClick:Pe},a.createElement(be,{name:"export"})),a.createElement("button",{className:"df-primary df-toolbar-icon-button","aria-label":"\u4FDD\u5B58\u8349\u7A3F",title:"\u4FDD\u5B58\u8349\u7A3F",disabled:!!I||!d||!K,onClick:()=>Z("\u4FDD\u5B58\u8349\u7A3F",async()=>{await pe(),await Ie(),ae("\u8349\u7A3F\u5DF2\u4FDD\u5B58")})},a.createElement(be,{name:"save"})))),Ht=d&&a.createElement(a.Fragment,null,!ye&&Je,a.createElement(ca,{title:"\u89C4\u5219\u51B2\u7A81",issues:je(Le),onFix:w}),a.createElement(ca,{title:"\u667A\u80FD\u4F53\u51B2\u7A81",issues:je(R),onFix:w}),a.createElement("section",{className:"df-paper df-edit-footer","aria-label":"\u6587\u4EF6\u751F\u6210\u64CD\u4F5C"},a.createElement("div",{className:"df-generation-plan"},a.createElement("p",null,"\u672C\u6B21\u8BA1\u5212\u751F\u6210 ",a.createElement("b",null,Dt)," \u4EFD\u6587\u4E66")),a.createElement("div",{className:"df-actions"},a.createElement("button",{onClick:gt},"\u667A\u80FD\u4F53\u6838\u67E5"),a.createElement("button",{className:"df-primary",onClick:t},"\u751F\u6210\u6587\u4EF6"))));return a.createElement("div",{className:"df-app df-embedded-editor","data-theme":$t},a.createElement("input",{ref:Qe,type:"file",accept:".xlsx",hidden:!0,"aria-label":"\u5BFC\u5165 Excel \u53D8\u91CF\u8868",onChange:r=>{Lt(r.target.files[0]),r.target.value=""}}),a.createElement("input",{ref:Ve,type:"file",accept:".docx,.xlsx",multiple:!0,hidden:!0,"aria-label":"\u5BFC\u5165 Word \u6A21\u677F",onChange:r=>{Mt(r.target.files),r.target.value=""}}),a.createElement("section",{className:"df-main"},!x&&a.createElement("div",{className:"df-editor-context"},a.createElement("button",{disabled:!!I,onClick:()=>{mt()&&b()}},"\u2190 \u8FD4\u56DE",c.title),a.createElement("span",null,i.name," / ",c.title),x&&a.createElement("button",{disabled:!!I||K,title:K?"\u8BF7\u5148\u4FDD\u5B58\u8868\u5355":"\u66F4\u65B0\u5F53\u524D\u8282\u70B9\u7684\u529E\u7406\u4FE1\u606F",onClick:N},"\u529E\u7406\u4FE1\u606F\u4E0E\u72B6\u6001"),d&&a.createElement("div",{className:"df-actions"},a.createElement("button",{disabled:!!I,onClick:()=>{M("adopt"),z([])}},"\u6838\u5BF9\u9879\u76EE\u8D44\u6599\u5DEE\u5F02"),a.createElement("button",{disabled:!!I,onClick:()=>{M("publish"),z([])}},"\u5B58\u5165\u9879\u76EE\u5E95\u7A3F"))),!ye&&a.createElement("header",{className:"df-header"},a.createElement("div",null,!x&&a.createElement("span",{className:"df-eyebrow"},c.title," / \u586B\u5199\u4E0E\u751F\u6210"),a.createElement("h1",null,d?x?"\u586B\u5199\u5185\u5BB9":d.name:"\u586B\u5199\u9879\u76EE\u8D44\u6599"),a.createElement("p",null,d?K?"\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539":`\u8349\u7A3F\u5DF2\u4FDD\u5B58 \xB7 ${pt(d.updated_at)}`:"\u5BFC\u5165\u53D8\u91CF\u8868\u4E0E Word \u6A21\u677F\uFF0C\u586B\u5199\u3001\u6838\u5BF9\uFF0C\u518D\u751F\u6210\u6587\u4E66\u3002")),d&&a.createElement("button",{disabled:!!I||!K,onClick:()=>Z("\u4FDD\u5B58\u8349\u7A3F",async()=>{await pe(),await Ie(),ae("\u8349\u7A3F\u5DF2\u4FDD\u5B58")})},"\u4FDD\u5B58\u8349\u7A3F")),ye?_e.host.ReactDOM.createPortal(ua,T):x?a.createElement("div",{className:"df-node-tools","aria-label":"\u8868\u5355\u64CD\u4F5C"},a.createElement("button",{disabled:!!I,onClick:()=>Qe.current.click()},"\u5BFC\u5165 Excel"),a.createElement("details",null,a.createElement("summary",null,"\u66F4\u591A\u64CD\u4F5C"),a.createElement("div",{className:"df-actions"},a.createElement("button",{disabled:!!I,onClick:()=>{M("adopt"),z([])}},"\u6838\u5BF9\u9879\u76EE\u8D44\u6599\u5DEE\u5F02"),a.createElement("button",{disabled:!!I,onClick:()=>{M("publish"),z([])}},"\u5B58\u5165\u9879\u76EE\u5E95\u7A3F")))):a.createElement("div",{className:"df-steps","aria-label":"\u586B\u5199\u6D41\u7A0B"},[["import","01","\u5BFC\u5165\u6A21\u677F"],["edit","02","\u586B\u5199\u8D44\u6599"],["generate","03","\u6587\u4EF6\u751F\u6210"],["files","04","\u6587\u4EF6\u9884\u89C8"]].map(([r,s,u])=>a.createElement("button",{key:r,"aria-current":V===r?"step":void 0,className:V===r?"active":"",disabled:!!I||!d&&r!=="import"||r==="files"&&!fe,onClick:()=>{r==="generate"&&C("generate"),q(r==="generate"?"edit":r)}},a.createElement("span",null,s),u))),Be&&a.createElement("div",{className:"df-alert error",role:"alert"},Be,a.createElement("button",{"aria-label":"\u5173\u95ED\u9519\u8BEF\u63D0\u793A",onClick:()=>me("")},"\xD7")),ft&&a.createElement("div",{className:"df-alert",role:"status"},ft),I&&a.createElement("div",{className:"df-progress",role:"status"},I,"\u2026"),a.createElement("fieldset",{className:"df-content",disabled:!!I},V==="import"&&a.createElement("div",{className:"df-import"},a.createElement("section",{className:"df-paper df-drop"},a.createElement("div",{className:"df-file-mark"},"XLSX"),a.createElement("h2",null,"\u4ECE Excel \u53D8\u91CF\u8868\u5F00\u59CB"),a.createElement("p",null,"\u201C\u53D8\u91CF\u914D\u7F6E\u201D\u5DE5\u4F5C\u8868\u4FDD\u7559\u4E09\u5217\uFF1A",a.createElement("br",null),a.createElement("b",null,"\u53D8\u91CF\u540D\u79F0\u3000\u4E2D\u6587\u540D\u79F0\u3000\u503C")),a.createElement("button",{className:"df-primary",onClick:()=>Qe.current.click()},"\u9009\u62E9 Excel \u53D8\u91CF\u8868"),a.createElement("small",null,"\u652F\u6301 .xlsx \xB7 \u5355\u4E2A\u6587\u4EF6\u4E0D\u8D85\u8FC7 15 MB")),a.createElement("section",{className:"df-paper df-import-note"},a.createElement("span",{className:"df-eyebrow"},"\u5982\u4F55\u51C6\u5907"),a.createElement("h2",null,"\u4E00\u4EFD\u6570\u636E\uFF0C\u591A\u4EFD\u6587\u4E66"),a.createElement("ol",null,a.createElement("li",null,a.createElement("b",null,"\u6574\u7406\u53D8\u91CF"),a.createElement("p",null,"\u4F8B\u5982 project.name / \u9879\u76EE\u540D\u79F0 / \u5B9E\u9645\u540D\u79F0\u3002\u652F\u6301\u5206\u7EC4\u3001\u7C7B\u578B\u548C\u5FC5\u586B\u5217\u3002")),a.createElement("li",null,a.createElement("b",null,"\u81EA\u52A8\u8F7D\u5165\u6A21\u677F"),a.createElement("p",null,"\u5E94\u7528\u81EA\u5E26 5 \u4EFD\u6807\u51C6 Word \u6A21\u677F\uFF0C\u4F7F\u7528\u914D\u5957 Excel \u5373\u53EF\u81EA\u52A8\u8F7D\u5165\uFF1B \u4E5F\u53EF\u6DFB\u52A0\u81EA\u5DF1\u7684\u6A21\u677F\u3002")),a.createElement("li",null,a.createElement("b",null,"\u5206\u522B\u751F\u6210\u9080\u8BF7\u51FD"),a.createElement("p",null,"\u5728\u201C\u53D7\u9080\u5355\u4F4D\u201D\u8868\u8BB0\u5F55\u5355\u4F4D\u540D\u79F0\u3001\u9886\u53D6\u5F00\u59CB\u65F6\u95F4\u548C\u9886\u53D6\u7ED3\u675F\u65F6\u95F4\u3002"))),a.createElement("p",{className:"df-muted"},"\u201C\u65E5\u671F\u6821\u6838\u201D\u8868\u4E2D\u7684\u65E7\u7ED3\u679C\u4E0D\u4F1A\u4F5C\u4E3A\u5224\u65AD\u4F9D\u636E\uFF1B\u5E94\u7528\u4F1A\u6839\u636E\u5F53\u524D\u586B\u5199\u5185\u5BB9\u91CD\u65B0\u6838\u5BF9\u3002\u201C\u6821\u6838\u89C4\u5219\u201D\u8868\u53EF\u8865\u5145\u81EA\u5B9A\u4E49\u5148\u540E\u5173\u7CFB\u3002"))),d&&(x||V==="edit")&&a.createElement("div",{className:"df-edit-layout",id:x?"df-node-panel-form":void 0,role:x?"tabpanel":void 0,"aria-labelledby":x?"df-node-tab-form":void 0,hidden:x&&B!=="form"},!ye&&a.createElement("section",{className:"df-paper df-form-heading"},a.createElement("div",{className:"df-section-head"},!x&&a.createElement("h2",null,"\u586B\u5199\u4FE1\u606F"),a.createElement("button",{onClick:()=>Z("\u5BFC\u51FA Excel",async()=>{let r=await pe();await ot(`/cases/${r.id}/excel`,(r.fields.find(s=>s.key==="project.name")?.value||r.name).replace(/[<>:"/\\|?*\x00-\x1f]/g,"_").slice(0,80)+"_\u586B\u5199\u6570\u636E.xlsx")})},"\u5BFC\u51FA\u5F53\u524D Excel")),a.createElement("label",{className:"df-field df-title-field"},a.createElement("span",null,"\u8868\u5355\u540D\u79F0"),a.createElement("input",{"aria-label":"\u8868\u5355\u540D\u79F0",maxLength:120,value:d.name,onChange:r=>Ae({...d,name:r.target.value})}))),a.createElement(xt,{id:"df-form",label:"\u586B\u5199\u5185\u5BB9\u5206\u7EC4",items:ke,value:ve,onChange:C}),at.map(r=>a.createElement("section",{className:"df-paper df-form-panel",key:r,role:"tabpanel",id:`df-form-panel-${r}`,"aria-labelledby":`df-form-tab-${r}`,hidden:ve!==r},oe&&r===Ke&&Vt,[...new Set(te.filter(s=>He(s)===r&&!/^selection\.member\d+_/.test(s.key)).map(s=>s.group))].map(s=>a.createElement("section",{className:"df-group",key:s},!oe&&(!ye||s!==r)&&a.createElement("h3",null,s),!ye&&s==="\u65E5\u671F\u5B89\u6392"&&a.createElement("p",{className:"df-muted"},"\u6587\u4E66\u7EDF\u4E00\u4F7F\u7528\u4E2D\u6587\u65E5\u671F\uFF0C\u4F8B\u5982\u201C2026\u5E7410\u670822\u65E5\u4E0B\u534814:30\u201D\u3002\u65E5\u671F\u9009\u62E9\u5668\u4FDD\u7559\u539F\u6765\u7684\u586B\u5199\u65B9\u5F0F\u3002"),a.createElement("div",{className:"df-fields"},te.filter(u=>u.group===s&&He(u)===r&&!/^selection\.member\d+_/.test(u.key)).map(u=>a.createElement(ma,{key:u.key,field:u,issue:ee.find(U=>U.field===u.key&&(U.status==="error"||d.presentation_sources?.[u.key]!==u.value)),displayValue:d.presentation_sources?.[u.key]===u.value?d.document_values?.[u.key]:void 0,onChange:(U,ne)=>Ae({...d,fields:d.fields.map(Ne=>Ne.key===u.key?{...Ne,value:U,...ne!==void 0?{linked_template:ne}:{}}:Ne)})}))))),r==="\u8BBA\u8BC1\u6210\u5458"&&a.createElement(Ia,{fields:te,compact:!!ye,onChange:(s,u)=>Ae({...d,fields:d.fields.map(U=>U.key===s?{...U,value:u}:U)})}))),!oe&&Vt,!x&&a.createElement("div",{role:"tabpanel",id:"df-form-panel-generate","aria-labelledby":"df-form-tab-generate",hidden:ve!=="generate"},Ht)),d&&a.createElement("div",{className:x?"df-generation-panel":void 0,id:x?"df-node-panel-generate":void 0,role:x?"tabpanel":void 0,"aria-labelledby":x?"df-node-tab-generate":void 0,hidden:x&&B!=="generate"},x&&V==="edit"&&Ht,(x||V==="files"&&fe)&&a.createElement("div",{className:"df-results"+(x?" df-results-docked":"")},a.createElement("section",{className:"df-paper df-output-list","aria-label":"\u751F\u6210\u8BB0\u5F55"},x?a.createElement("h2",null,"\u751F\u6210\u8BB0\u5F55"):a.createElement(a.Fragment,null,a.createElement("span",{className:"df-eyebrow"},"\u751F\u6210\u8BB0\u5F55"),a.createElement("h2",null,fe.files.length," \u4EFD\u6587\u4EF6\u5DF2\u751F\u6210"),a.createElement("p",null,pt(fe.created_at)," \xB7 \u4FEE\u8BA2"," ",fe.revision)),!ut.length&&a.createElement("p",{className:"df-muted"},"\u672C\u9636\u6BB5\u8FD8\u6CA1\u6709\u751F\u6210\u6587\u4EF6\u3002"),fe&&a.createElement("p",{className:"df-muted"},tt?"\u538B\u7F29\u5305\u5305\u542B\u8BBA\u8BC1\u610F\u89C1\u53CA\u7B7E\u5B57\u8868\u3001\u975E\u62DB\u6807\u65B9\u6848\u3001\u586B\u5199\u6570\u636E\u548C\u6838\u5BF9\u8BB0\u5F55":dt?"\u538B\u7F29\u5305\u5305\u542B Word\u3001\u79D1\u7814\u8BA1\u5212\u8868\u3001\u586B\u5199\u6570\u636E\u548C\u6838\u5BF9\u8BB0\u5F55":"\u538B\u7F29\u5305\u5305\u542B Word\u3001\u586B\u5199\u6570\u636E\u548C\u6838\u5BF9\u8BB0\u5F55"),fe&&(K||(fe.content_digest?fe.content_digest!==d.content_digest:fe.revision!==d.revision))&&a.createElement("div",{className:"df-alert"},"\u586B\u5199\u5185\u5BB9\u5DF2\u6709\u4FEE\u6539\uFF0C\u4E0B\u5217\u6587\u4EF6\u4FDD\u7559\u751F\u6210\u65F6\u7684\u5185\u5BB9\u3002\u8BF7\u91CD\u65B0\u6838\u5BF9\u5E76\u751F\u6210\u65B0\u7248\u3002"),ut.map(({caseId:r,batch:s})=>a.createElement("div",{className:"df-generation",key:r+":"+s.id},a.createElement("div",{className:"df-generation-heading"},a.createElement("h3",null,pt(s.created_at)," \xB7 \u4FEE\u8BA2 ",s.revision,s.date_style!=="zh-CN"&&" \xB7 \u539F\u65E5\u671F\u683C\u5F0F",s.naming_style!=="formal"&&" \xB7 \u539F\u6587\u4EF6\u540D"),a.createElement("button",{"aria-label":`\u6253\u5305\u4E0B\u8F7D ${pt(s.created_at)} \u4FEE\u8BA2 ${s.revision}`,onClick:()=>Y(r,s)},"\u6253\u5305\u4E0B\u8F7D")),s.files.map(u=>{let U=x?_?.case_id===r&&_.generation_id===s.id&&_.name===u.name:ie?.generation.id===s.id&&ie.file.name===u.name;return a.createElement("div",{className:"df-output"+(U?" selected":""),key:u.name},a.createElement("button",{onClick:()=>{x?k(Bt(r,s,u)):xe({file:u,generation:s})}},a.createElement("b",null,u.name),a.createElement("small",null,u.recipient," \xB7 ",(u.size/1024).toFixed(0)," ","KB",u.print_copies>1&&` \xB7 \u5EFA\u8BAE\u6253\u5370 ${u.print_copies} \u4EFD`)),a.createElement("button",{"aria-label":"\u4E0B\u8F7D"+u.name,onClick:()=>Z("\u4E0B\u8F7D\u6587\u4EF6",()=>ot(S(r,s,u.name),u.name))},"\u2193"))}))),x&&_?.case_id&&ut.some(({caseId:r,batch:s})=>r===_.case_id&&s.id===_.generation_id)&&a.createElement("button",{onClick:O},"\u5C31\u6B64\u6587\u4EF6\u63D0\u95EE \u2192"),it.length>0&&a.createElement("details",{className:"df-historical-forms"},a.createElement("summary",null,"\u5386\u53F2\u5E95\u7A3F"),it.map(r=>a.createElement("button",{key:r.case_id,onClick:()=>Z("\u4E0B\u8F7D\u5386\u53F2\u5E95\u7A3F",()=>ot(`/cases/${r.case_id}/excel`,r.name+"_\u5386\u53F2\u5E95\u7A3F.xlsx"))},r.name," \u2193")))),!x&&a.createElement("section",{className:"df-paper df-preview"},a.createElement("div",{className:"df-section-head"},a.createElement("h2",null,ie?ie.file.name:"\u9009\u62E9\u6587\u4EF6\u9884\u89C8"),a.createElement("span",null,"Office \u9884\u89C8")),a.createElement("div",{className:"df-preview-body"},ce&&kt?a.createElement(Ct,{key:ce.id,artifact:ce},a.createElement(kt,{key:ce.id,artifact:ce,readOnly:!0,hostControls:!0})):a.createElement("p",{className:"df-muted"},ce?"\u6B63\u5728\u6253\u5F00\u6587\u4EF6\u2026":"\u4ECE\u5DE6\u4FA7\u9009\u62E9\u4E00\u4EFD\u6587\u4EF6\u3002")))))),a.createElement("footer",{className:"df-footer"},a.createElement("span",null,"UGSci \xB7 \u5916\u534F\u52A9\u624B"))),v&&d&&a.createElement("div",{className:"df-dialog-backdrop"},a.createElement("section",{className:"df-dialog df-paper",role:"dialog","aria-modal":"true","aria-label":"\u6838\u5BF9\u5171\u7528\u8D44\u6599"},a.createElement("div",{className:"df-section-head"},a.createElement("h2",null,v==="adopt"?"\u91C7\u7528\u9879\u76EE\u5E95\u7A3F\u4E2D\u7684\u8D44\u6599":"\u5C06\u672C\u8868\u8D44\u6599\u5B58\u5165\u9879\u76EE\u5E95\u7A3F"),a.createElement("button",{disabled:!!I,onClick:()=>M(null),"aria-label":"\u5173\u95ED\u5171\u7528\u8D44\u6599\u6838\u5BF9"},"\xD7")),a.createElement("p",{className:"df-muted"},"\u53EA\u66F4\u65B0\u52FE\u9009\u9879\u3002\u539F\u751F\u6210\u6587\u4EF6\u4FDD\u7559\uFF0C\u540E\u7EED\u751F\u6210\u524D\u9700\u91CD\u65B0\u6838\u5BF9\u3002"),Be&&a.createElement("p",{role:"alert",className:"df-alert error"},Be),a.createElement("div",{className:"df-compare"},i.fields.filter(r=>d.fields.some(s=>s.key===r.key&&s.value!==r.value)).map(r=>{let s=d.fields.find(u=>u.key===r.key);return a.createElement("label",{key:r.key},a.createElement("input",{type:"checkbox",checked:X.includes(r.key),onChange:u=>z(u.target.checked?[...X,r.key]:X.filter(U=>U!==r.key))}),a.createElement("div",null,a.createElement("b",null,r.label),a.createElement("div",{className:"df-compare-values"},a.createElement("p",null,a.createElement("small",null,"\u5F53\u524D\u8868\u5355"),s.value||"\u7A7A\u767D"),a.createElement("p",null,a.createElement("small",null,"\u9879\u76EE\u5E95\u7A3F"),r.value||"\u7A7A\u767D"))))}),!i.fields.some(r=>d.fields.some(s=>s.key===r.key&&s.value!==r.value))&&a.createElement("p",null,"\u672C\u8868\u4E0E\u9879\u76EE\u5E95\u7A3F\u4E2D\u7684\u5171\u7528\u8D44\u6599\u4E00\u81F4\u3002")),a.createElement("div",{className:"df-actions"},a.createElement("button",{disabled:!!I,onClick:()=>M(null)},"\u53D6\u6D88"),a.createElement("button",{className:"df-primary",disabled:!!I||!X.length,onClick:()=>Z("\u540C\u6B65\u5171\u7528\u8D44\u6599",async()=>{let r=await pe();if(v==="adopt")re(await we(`/projects/${i.id}/cases/${r.id}/sync`,We({revision:i.revision,case_revision:r.revision,keys:X})));else{let s=Object.fromEntries(r.fields.filter(u=>X.includes(u.key)).map(u=>[u.key,u.value]));await we(`/projects/${i.id}`,{...We({revision:i.revision,name:s["project.name"]??i.name,code:s["project.code"]??i.code,owner:i.owner,values:s}),method:"PUT"})}await Ie(),M(null),ae("\u6240\u9009\u8D44\u6599\u5DF2\u540C\u6B65\uFF0C\u8BF7\u91CD\u65B0\u6838\u5BF9\u540E\u751F\u6210\u65B0\u7248\u6587\u4E66\u3002")})},v==="adopt"?"\u91C7\u7528\u6240\u9009\u9879\u76EE\u8D44\u6599":"\u4FDD\u5B58\u6240\u9009\u8D44\u6599\u5230\u5E95\u7A3F")))))}function Oa(){let i=_e.host.useSelectedAgent?.();return a.createElement(Ft,{key:i?.id||_e.host.getSelectedAgentId?.()||"default",Editor:Aa,services:{request:we,json:We,download:ot,time:pt,Field:ma}})}_e.registerRoutes("document-forms",[{path:"/apps/document-forms",component:Oa,label:"\u5916\u534F\u52A9\u624B",icon:"\u25A4"}]);})();
