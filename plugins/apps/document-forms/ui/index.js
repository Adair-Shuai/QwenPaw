(()=>{var O=window.QwenPaw.host.React,{useEffect:Ve,useState:ce}=O;function Ie({artifact:n,children:w}){let[p,u]=ce("print"),[m,j]=ce([]),[f,h]=ce(0),[d,C]=ce(""),[k,q]=ce(0),[F,o]=ce(100);return Ve(()=>{if(p!=="print")return;let P=new AbortController,E=[];return j([]),h(0),C(""),window.QwenPaw.host.fetch(n.printUrl+"?pages=true",{headers:n.agentId?{"X-Agent-Id":n.agentId}:{},signal:P.signal}).then(async T=>{if(!T.ok){let L=await T.json().catch(()=>({}));throw new Error(typeof L.detail=="string"?L.detail:"\u6253\u5370\u9884\u89C8\u6682\u4E0D\u53EF\u7528\uFF0C\u53EF\u5207\u6362\u6587\u5B57\u9884\u89C8\u6216\u4E0B\u8F7D Word \u67E5\u770B")}let{pages:z}=await T.json();if(!P.signal.aborted){if(!Number.isInteger(z)||z<1||z>40)throw new Error("\u672A\u83B7\u5F97\u6709\u6548\u7684 Word \u9875\u6570");h(z);for(let L=1;L<=z;L++){let x=await window.QwenPaw.host.fetch(n.printUrl+"?page="+L,{headers:n.agentId?{"X-Agent-Id":n.agentId}:{},signal:P.signal});if(!x.ok)throw new Error(`\u7B2C ${L} \u9875\u672A\u80FD\u6E32\u67D3\uFF0C\u8BF7\u91CD\u65B0\u9884\u89C8`);let y=await x.blob();if(P.signal.aborted)return;let l=URL.createObjectURL(y);E.push(l),j(S=>[...S,l])}}}).catch(T=>{P.signal.aborted||C(T.message||"\u6253\u5370\u9884\u89C8\u672A\u5B8C\u6210")}),()=>{P.abort(),E.forEach(T=>URL.revokeObjectURL(T))}},[n.id,n.printUrl,n.agentId,p,k]),O.createElement("div",{className:"df-print-preview"},O.createElement("div",{className:"df-print-toolbar"},O.createElement("div",null,O.createElement("button",{"aria-pressed":p==="print",onClick:()=>u("print")},"\u6253\u5370\u7248\u5F0F"),O.createElement("button",{"aria-pressed":p==="text",onClick:()=>u("text")},"\u6587\u5B57\u9884\u89C8")),p==="print"&&O.createElement("div",null,f>0&&O.createElement("span",null,"\u5171 ",f," \u9875"),O.createElement("select",{"aria-label":"\u9884\u89C8\u6BD4\u4F8B",value:F,onChange:P=>o(Number(P.target.value))},O.createElement("option",{value:100},"\u9002\u5408\u5BBD\u5EA6"),O.createElement("option",{value:125},"125%"),O.createElement("option",{value:150},"150%"),O.createElement("option",{value:200},"200%")))),p==="text"?O.createElement("div",{className:"df-text-preview"},w):d?O.createElement("div",{className:"df-preview-message",role:"alert"},O.createElement("p",null,d),O.createElement("button",{onClick:()=>q(P=>P+1)},"\u91CD\u65B0\u9884\u89C8")):m.length?O.createElement("div",{className:"df-print-scroll"},O.createElement("div",{className:"df-print-pages",style:{width:F+"%"}},m.map((P,E)=>O.createElement("figure",{key:E},O.createElement("figcaption",null,"\u7B2C ",E+1," \u9875"),O.createElement("img",{src:P,alt:n.title+` \xB7 \u6253\u5370\u7248\u5F0F \xB7 \u7B2C ${E+1} \u9875`}))),m.length<f&&O.createElement("p",{role:"status"},"\u6B63\u5728\u6392\u7248\u7B2C ",m.length+1," \u9875\u2026"))):O.createElement("div",{className:"df-preview-message",role:"status"},"\u6B63\u5728\u6392\u7248\u6253\u5370\u9875\u9762\u2026"))}function pe({artifact:n}){let[w,p]=ce(null),[u,m]=ce(""),[j,f]=ce(0);if(Ve(()=>{let d=new AbortController;return p(null),m(""),window.QwenPaw.host.fetch("/workspace/convert-office",{method:"POST",headers:{"Content-Type":"application/json",...n.agentId?{"X-Agent-Id":n.agentId}:{}},signal:d.signal,body:JSON.stringify({url:n.binaryUrl,mime_type:n.mimeType})}).then(async C=>{let k=await C.json();if(!C.ok)throw new Error(typeof k.detail=="string"?k.detail:"\u6587\u4EF6\u9884\u89C8\u672A\u5B8C\u6210");d.signal.aborted||p(k)}).catch(C=>{d.signal.aborted||m(C.message||"\u6587\u4EF6\u9884\u89C8\u672A\u5B8C\u6210")}),()=>d.abort()},[n.id,n.binaryUrl,n.mimeType,n.agentId,j]),u)return O.createElement("div",{className:"df-preview-message",role:"alert"},O.createElement("p",null,u),O.createElement("button",{onClick:()=>f(d=>d+1)},"\u91CD\u65B0\u9884\u89C8"),O.createElement("p",null,"\u4E5F\u53EF\u4EE5\u4ECE\u6587\u4EF6\u6E05\u5355\u4E0B\u8F7D\u540E\u67E5\u770B\u3002"));if(!w)return O.createElement("div",{className:"df-preview-message",role:"status"},"\u6B63\u5728\u6253\u5F00\u6587\u4EF6\u2026");let h=w.engine==="officecli"?w.html:`<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;color:#333;background:#fff;padding:24px 32px;line-height:1.7;max-width:900px;margin:0 auto}table{border-collapse:collapse;width:100%;margin:12px 0}td,th{border:1px solid #ddd;padding:8px 12px}img{max-width:100%;height:auto}h1{font-size:1.6em}h2{font-size:1.3em}.docx-page-break{border-top:2px dashed #ccc;margin:32px 0}</style></head><body>${w.html||""}</body></html>`;return O.createElement("iframe",{className:"df-office-frame",title:n.title,srcDoc:h,sandbox:w.engine==="officecli"?"allow-scripts":"allow-same-origin"})}var Xe=`.df-app {
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
      minmax(360px, 0.82fr)
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
        330px
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
`;var Ae=window.QwenPaw,g=Ae.host.React,{useState:ue,useEffect:nt}=g,Je={running:"\u6B63\u5728\u6838\u67E5",completed:"\u6838\u67E5\u5B8C\u6210",failed:"\u672A\u5B8C\u6210",interrupted:"\u5DF2\u4E2D\u65AD"},He=".doc,.docx,.pdf,.xls,.xlsx,.png,.jpg,.jpeg";function Se({project:n,services:w,onChanged:p}){let{request:u,download:m,time:j}=w,[f,h]=ue(null),[d,C]=ue(""),[k,q]=ue(null),[F,o]=ue([]),[P,E]=ue(""),[T,z]=ue(""),[L,x]=ue(!1),[y,l]=ue(""),[S,W]=ue(0);nt(()=>{let v=!0,U,b=!1;async function A(){try{let G=await u(`/projects/${n.id}/response-reviews`);if(!v)return;h(G),l("");let I=G.records.some(Y=>Y.status==="running");b&&!I&&p(),b=I,I&&(U=setTimeout(A,3e3))}catch(G){v&&l(G.message)}}return A(),()=>{v=!1,clearTimeout(U)}},[n.id,S]);let V=f?.records.some(v=>v.status==="running"),D=f?.records.find(v=>v.id===T)||f?.records[0],ie=Ae.host.ReactMarkdown;async function M(v){v.preventDefault(),l(""),x(!0);try{let U=new FormData;d?U.set("reference_id",d):k&&U.set("reference",k);for(let A of F)U.append("responses",A);U.set("focus",P);let b=await u(`/projects/${n.id}/response-reviews`,{method:"POST",body:U});z(b.id),h(A=>({...A,records:[b,...A?.records||[]]})),W(A=>A+1)}catch(U){l(U.message)}finally{x(!1)}}return g.createElement("div",{className:"df-response-review"},g.createElement("p",{className:"df-muted"},"\u5BF9\u7167\u8C08\u5224\u6587\u4EF6\uFF0C\u9010\u5BB6\u68C0\u67E5\u8D44\u8D28\u3001\u6280\u672F\u54CD\u5E94\u3001\u62A5\u4EF7\u3001\u65E5\u671F\u4E0E\u7B7E\u7AE0\u9644\u4EF6\u3002\u6838\u67E5\u610F\u89C1\u4F9B\u7ECF\u529E\u4EBA\u548C\u4E13\u5BB6\u590D\u6838\u3002"),y&&g.createElement("div",{className:"df-alert error",role:"alert"},y,g.createElement("button",{onClick:()=>W(v=>v+1)},"\u91CD\u65B0\u52A0\u8F7D")),f?g.createElement(g.Fragment,null,g.createElement("form",{onSubmit:M},g.createElement("fieldset",{disabled:L||V},g.createElement("label",{className:"df-field"},g.createElement("span",null,"\u6838\u67E5\u4F9D\u636E"),g.createElement("select",{"aria-label":"\u6838\u67E5\u4F9D\u636E",value:d,onChange:v=>{C(v.target.value),q(null)}},g.createElement("option",{value:""},"\u4E0A\u4F20\u6B63\u5F0F\u8C08\u5224\u6587\u4EF6"),f.references.map(v=>g.createElement("option",{key:v.id,value:v.id},v.label)))),!d&&g.createElement("label",{className:"df-field"},g.createElement("span",null,"\u6B63\u5F0F\u8C08\u5224\u6587\u4EF6"),g.createElement("input",{"aria-label":"\u4E0A\u4F20\u6838\u67E5\u4F9D\u636E",type:"file",accept:He,required:!0,onChange:v=>q(v.target.files[0]||null)})),g.createElement("label",{className:"df-field"},g.createElement("span",null,"\u5404\u5355\u4F4D\u54CD\u5E94\u6750\u6599"),g.createElement("input",{"aria-label":"\u4E0A\u4F20\u54CD\u5E94\u6750\u6599",type:"file",multiple:!0,required:!0,accept:He,onChange:v=>o([...v.target.files])})),F.length>0&&g.createElement("ul",{className:"df-review-files"},F.map((v,U)=>g.createElement("li",{key:U},v.name))),g.createElement("p",{className:"df-muted"},"\u652F\u6301 Word\u3001PDF\u3001Excel \u548C\u56FE\u7247\uFF1B\u53EF\u4E00\u6B21\u9009\u62E9\u591A\u5BB6\u6750\u6599\u3002\u6BCF\u4EFD\u4E0D\u8D85\u8FC7 15 MB\uFF0C\u6BCF\u6B21\u6700\u591A 20 \u4EFD\u3001\u5408\u8BA1 100 MB\u3002\u538B\u7F29\u5305\u8BF7\u5148\u89E3\u538B\u3002"),g.createElement("label",{className:"df-field"},g.createElement("span",null,"\u8865\u5145\u5173\u6CE8\u70B9\uFF08\u9009\u586B\uFF09"),g.createElement("textarea",{"aria-label":"\u8865\u5145\u6838\u67E5\u5173\u6CE8\u70B9",rows:3,maxLength:3e3,value:P,onChange:v=>E(v.target.value),placeholder:"\u4F8B\u5982\uFF1A\u91CD\u70B9\u6838\u5BF9\u62A5\u4EF7\u5927\u5C0F\u5199\u3001\u6210\u679C\u4EA4\u4ED8\u65F6\u95F4\u548C\u8D44\u8D28\u6709\u6548\u671F"})),g.createElement("div",{className:"df-actions"},g.createElement("button",{className:"df-primary",disabled:L||V||!(d||k)||!F.length},L?"\u6B63\u5728\u63D0\u4EA4\u2026":"\u5F00\u59CB\u6838\u67E5"),g.createElement("span",{className:"df-muted"},"\u4F7F\u7528\u201C\u54CD\u5E94\u6587\u4EF6\u6838\u67E5\u201D\u667A\u80FD\u4F53\uFF0C\u6CBF\u7528\u8F6F\u4EF6\u4E2D\u7684\u6A21\u578B\u914D\u7F6E\u3002")))),f.records.length>0&&g.createElement("section",{className:"df-review-history"},g.createElement("div",{className:"df-section-head"},g.createElement("h3",null,"\u6838\u67E5\u8BB0\u5F55"),g.createElement("button",{onClick:()=>W(v=>v+1)},"\u5237\u65B0\u8BB0\u5F55")),g.createElement("div",{className:"df-review-records"},f.records.map(v=>g.createElement("button",{key:v.id,"aria-pressed":D?.id===v.id,onClick:()=>z(v.id)},j(v.created_at)," \xB7 ",Je[v.status]))),D&&g.createElement("article",{"aria-label":"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5\u7ED3\u679C"},g.createElement("div",{className:"df-section-head"},g.createElement("div",null,g.createElement("b",null,Je[D.status]),g.createElement("p",{className:"df-muted"},"\u57FA\u4E8E\u9879\u76EE\u4FEE\u8BA2 ",D.project_revision," \xB7"," ",D.files.length," \u4EFD\u6750\u6599\uFF1B\u540E\u7EED\u6750\u6599\u4FEE\u6539\u8BF7\u91CD\u65B0\u6838\u67E5\u3002")),D.status==="completed"&&g.createElement("button",{onClick:async()=>{try{await m(`/projects/${n.id}/response-reviews/${D.id}/report`,`${n.name}_\u54CD\u5E94\u6587\u4EF6\u6838\u67E5\u8BB0\u5F55_${D.id.slice(0,8)}.md`)}catch(v){l(v.message)}}},"\u4E0B\u8F7D\u6838\u67E5\u8BB0\u5F55")),g.createElement("details",null,g.createElement("summary",null,"\u672C\u6B21\u6838\u67E5\u6750\u6599\u4E0E\u5173\u6CE8\u70B9"),g.createElement("ul",null,D.files.map((v,U)=>g.createElement("li",{key:U},v.role,"\uFF1A",v.name))),g.createElement("p",null,D.focus||"\u65E0\u8865\u5145\u5173\u6CE8\u70B9")),D.status==="running"&&g.createElement("p",{role:"status",className:"df-alert"},"\u6B63\u5728\u8BFB\u53D6\u5E76\u6838\u67E5\u6750\u6599\uFF0C\u53EF\u5173\u95ED\u6B64\u7A97\u53E3\uFF0C\u7A0D\u540E\u56DE\u5230\u672C\u9879\u76EE\u67E5\u770B\u7ED3\u679C\u3002"),D.error&&g.createElement("p",{role:"alert",className:"df-alert error"},D.error),D.report&&g.createElement("div",{className:"df-review-report"},ie?g.createElement(ie,{remarkPlugins:Ae.host.remarkGfm?[Ae.host.remarkGfm]:[],components:{a:({children:v})=>g.createElement("span",null,v),img:()=>null}},D.report):g.createElement("div",{style:{whiteSpace:"pre-wrap"}},D.report))))):g.createElement("p",{role:"status"},"\u6B63\u5728\u8BFB\u53D6\u6838\u67E5\u8BB0\u5F55\u2026"))}var Ce=window.QwenPaw,s=Ce.host.React,{useState:Ne,useEffect:Be,useRef:dt}=s;function rt(n,w,p){return{artifact:{id:w.id+p.name,title:p.name,source:"generated",extension:"docx",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",binaryUrl:p.preview_url,printUrl:`/document-forms/cases/${n.case_id}/print/${w.id}/${encodeURIComponent(p.name)}`,agentId:Ce.host.getSelectedAgentId?.(),createdAt:Date.parse(w.created_at)},reference:{case_id:n.case_id,generation_id:w.id,name:p.name}}}function ot({project:n,stageId:w,selection:p,services:u}){let{request:m,json:j,time:f}=u,[h,d]=Ne([]),[C,k]=Ne(""),[q,F]=Ne(!1),[o,P]=Ne(""),[E,T]=Ne(0),z=dt(null);Be(()=>{let l=!0,S;async function W(){try{let V=await m(`/projects/${n.id}/assistant`);if(!l)return;d(V.messages),P(""),V.messages.some(D=>D.status==="running")&&(S=setTimeout(W,2500))}catch(V){l&&P(V.message)}}return W(),()=>{l=!1,clearTimeout(S)}},[n.id,E]),Be(()=>{z.current?.scrollIntoView?.({block:"nearest"})},[h.length,h.at(-1)?.status]);let L=q||h.some(l=>l.status==="running"),x=Ce.host.ReactMarkdown;async function y(l){if(l.preventDefault(),!(!C.trim()||L)){F(!0),P("");try{let S=await m(`/projects/${n.id}/assistant`,j({message:C.trim(),stage_id:w||"overview",file:p?.reference||{}}));d(W=>[...W,S]),k(""),T(W=>W+1)}catch(S){P(S.message)}finally{F(!1)}}}return s.createElement("section",{className:"df-project-chat","aria-label":"\u9879\u76EE\u667A\u80FD\u4F53\u95EE\u7B54"},s.createElement("p",{className:"df-muted"},"\u7ED3\u5408\u5DF2\u4FDD\u5B58\u7684\u9879\u76EE\u8D44\u6599\u548C\u5F53\u524D\u9884\u89C8\u56DE\u7B54\uFF0C\u95EE\u7B54\u968F\u9879\u76EE\u4FDD\u7559\u3002"),s.createElement("div",{className:"df-chat-messages","aria-live":"polite"},!h.length&&s.createElement("div",{className:"df-chat-welcome"},s.createElement("h3",null,"\u56F4\u7ED5\u5F53\u524D\u9879\u76EE\u63D0\u95EE"),s.createElement("p",null,"\u53EF\u4EE5\u68B3\u7406\u672C\u9636\u6BB5\u8FD8\u9700\u51C6\u5907\u7684\u6750\u6599\uFF0C\u6216\u5BF9\u7167\u9884\u89C8\u6587\u4EF6\u6838\u5B9E\u5185\u5BB9\u3002"),["\u672C\u9636\u6BB5\u8FD8\u9700\u8981\u51C6\u5907\u54EA\u4E9B\u6750\u6599\uFF1F","\u5E2E\u6211\u6838\u5BF9\u5F53\u524D\u6587\u4EF6\u4E2D\u7684\u65E5\u671F\u548C\u91D1\u989D\u3002"].map(l=>s.createElement("button",{key:l,onClick:()=>k(l)},l))),h.map(l=>s.createElement("article",{className:"df-chat-turn",key:l.id},s.createElement("div",{className:"df-chat-question"},s.createElement("small",null,"\u6211 \xB7 ",f(l.created_at)),s.createElement("p",null,l.message),l.file_name&&s.createElement("small",null,"\u53C2\u8003\u6587\u4EF6\uFF1A",l.file_name)),l.reply&&s.createElement("div",{className:"df-chat-answer"},s.createElement("small",null,"\u9879\u76EE\u52A9\u624B"),x?s.createElement(x,{remarkPlugins:Ce.host.remarkGfm?[Ce.host.remarkGfm]:[],components:{img:()=>null,a:({children:S})=>s.createElement("span",null,S)}},l.reply):s.createElement("p",{style:{whiteSpace:"pre-wrap"}},l.reply)),l.status==="running"&&s.createElement("p",{role:"status",className:"df-muted"},"\u6B63\u5728\u7ED3\u5408\u9879\u76EE\u8D44\u6599\u6574\u7406\u56DE\u7B54\u2026"),l.error&&s.createElement("p",{role:"alert",className:"df-alert error"},l.error))),s.createElement("div",{ref:z})),o&&s.createElement("p",{role:"alert",className:"df-alert error"},o,s.createElement("button",{onClick:()=>T(l=>l+1)},"\u91CD\u65B0\u52A0\u8F7D")),s.createElement("form",{className:"df-chat-composer",onSubmit:y},p&&s.createElement("small",{className:"df-chat-context"},"\u53C2\u8003\u6587\u4EF6\uFF1A",p.artifact.title),s.createElement("textarea",{"aria-label":"\u5411\u9879\u76EE\u667A\u80FD\u4F53\u63D0\u95EE",placeholder:"\u8F93\u5165\u5F53\u524D\u9879\u76EE\u7684\u95EE\u9898\u2026",rows:3,maxLength:4e3,value:C,onChange:l=>k(l.target.value)}),s.createElement("div",{className:"df-actions"},s.createElement("button",{className:"df-primary",disabled:L||!C.trim()},L?"\u6B63\u5728\u56DE\u7B54\u2026":"\u53D1\u9001\u95EE\u9898"))))}function Fe({collapsed:n=!1,onToggle:w,project:p,stageId:u,services:m,mode:j,onMode:f,selection:h,onSelect:d,attachment:C,AttachmentPreview:k,onChanged:q,dirty:F=!1}){let[o,P]=Ne(null),[E,T]=Ne("");async function z(x,y){try{T(""),await m.download(x,y)}catch(l){T(l.message)}}Be(()=>{let x=!0;return(Ce.workspace?.loadPreview?Ce.workspace.loadPreview():Promise.resolve(pe)).then(y=>x&&P(()=>y)).catch(()=>x&&P(()=>pe)),()=>{x=!1}},[]);let L=p.forms.flatMap(x=>x.generations.flatMap(y=>u&&u!=="overview"&&u!=="profile"&&(y.stage_id||x.original_stage_id||x.stage_id)!==u?[]:[{form:x,generation:y}]));return s.createElement("aside",{className:"df-right-workspace"+(n?" df-pane-collapsed":""),"aria-label":"\u9879\u76EE\u667A\u80FD\u4F53\u4E0E\u6587\u4EF6\u9884\u89C8"},s.createElement("button",{className:"df-pane-toggle","aria-label":n?"\u5C55\u5F00\u95EE\u7B54\u4E0E\u9884\u89C8\u680F":"\u6536\u8D77\u95EE\u7B54\u4E0E\u9884\u89C8\u680F","aria-expanded":!n,title:n?"\u5C55\u5F00\u95EE\u7B54\u4E0E\u9884\u89C8\u680F":"\u6536\u8D77\u95EE\u7B54\u4E0E\u9884\u89C8\u680F",onClick:w},s.createElement("span",{"aria-hidden":"true"},n?"\u2039":"\u203A"),s.createElement("span",null,n?"\u95EE\u7B54\u4E0E\u9884\u89C8":"\u6536\u8D77")),s.createElement("header",null,s.createElement("div",null,s.createElement("span",{className:"df-eyebrow"},"\u9879\u76EE\u5DE5\u4F5C\u533A"),s.createElement("h2",null,j==="preview"?"\u6587\u4EF6\u9884\u89C8":j==="review"?"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5":"\u667A\u80FD\u4F53\u95EE\u7B54")),s.createElement("div",{className:"df-dock-tabs",role:"tablist","aria-label":"\u53F3\u4FA7\u5DE5\u4F5C\u533A"},s.createElement("button",{role:"tab","aria-selected":j==="assistant",onClick:()=>f("assistant")},"\u95EE\u7B54"),s.createElement("button",{role:"tab","aria-selected":j==="preview",onClick:()=>f("preview")},"\u9884\u89C8"))),E&&s.createElement("p",{role:"alert",className:"df-alert error"},E),s.createElement("div",{className:"df-right-body",hidden:j!=="assistant"},s.createElement(ot,{project:p,stageId:["overview","profile"].includes(u)?"overview":u,selection:h,services:m}),u==="negotiation"&&s.createElement("button",{className:"df-open-review",onClick:()=>f("review")},"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5 \u2192")),s.createElement("div",{className:"df-right-body",hidden:j!=="review"},s.createElement("button",{className:"df-back-link",onClick:()=>f("assistant")},"\u2190 \u8FD4\u56DE\u95EE\u7B54"),j==="review"&&s.createElement(Se,{key:p.id,project:p,services:m,onChanged:q})),s.createElement("div",{className:"df-right-body df-dock-files",hidden:j!=="preview"},F&&s.createElement("p",{className:"df-alert"},"\u4E2D\u95F4\u8868\u5355\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\uFF0C\u9884\u89C8\u6587\u4EF6\u4FDD\u7559\u751F\u6210\u65F6\u7684\u5185\u5BB9\u3002"),s.createElement("details",{open:!h&&!C,className:"df-dock-file-list"},s.createElement("summary",null,"\u672C\u9636\u6BB5\u6587\u4EF6 \xB7"," ",L.reduce((x,y)=>x+y.generation.files.length,0)," \u4EFD"),L.map(({form:x,generation:y})=>s.createElement("section",{className:"df-generation",key:y.id},s.createElement("div",{className:"df-generation-heading"},s.createElement("h3",null,m.time(y.created_at)," \xB7 \u4FEE\u8BA2"," ",y.revision,y.date_style!=="zh-CN"&&" \xB7 \u539F\u65E5\u671F\u683C\u5F0F",y.naming_style!=="formal"&&" \xB7 \u539F\u6587\u4EF6\u540D"),s.createElement("button",{onClick:()=>z(`/cases/${x.case_id}/outputs/${y.id}/\u5168\u90E8\u6587\u4E66.zip`,y.bundle_name||p.name+"_\u6587\u4E66.zip")},"\u6253\u5305\u4E0B\u8F7D")),y.files.map(l=>s.createElement("div",{className:"df-dock-file-row",key:l.name},s.createElement("button",{className:"df-dock-file","aria-label":l.name,onClick:()=>d(rt(x,y,l))},l.name,s.createElement("small",null,l.recipient," \xB7 ",(l.size/1024).toFixed(0)," KB",l.print_copies>1&&` \xB7 \u5EFA\u8BAE\u6253\u5370 ${l.print_copies} \u4EFD`)),s.createElement("button",{"aria-label":"\u4E0B\u8F7D"+l.name,onClick:()=>z(`/cases/${x.case_id}/outputs/${y.id}/${encodeURIComponent(l.name)}`,l.name)},"\u2193"))))),!L.length&&s.createElement("p",{className:"df-muted"},"\u751F\u6210\u6587\u4E66\u6216\u4ECE\u4E2D\u95F4\u7684\u6750\u6599\u6E05\u5355\u9009\u62E9\u6587\u4EF6\u540E\uFF0C\u5728\u8FD9\u91CC\u9884\u89C8\u3002"),p.forms.filter(x=>x.case_id!==p.form_id).map(x=>s.createElement("button",{className:"df-dock-file",key:x.case_id,onClick:()=>z(`/cases/${x.case_id}/excel`,x.name+"_\u5386\u53F2\u5E95\u7A3F.xlsx")},"\u5386\u53F2\u5E95\u7A3F\uFF1A",x.name," \u2193"))),L.length>0&&s.createElement("p",{className:"df-muted"},"\u6587\u4EF6\u4FDD\u7559\u5404\u6279\u6B21\u751F\u6210\u65F6\u7684\u5185\u5BB9\uFF0C\u4FEE\u6539\u8868\u5355\u540E\u8BF7\u91CD\u65B0\u6838\u5BF9\u751F\u6210\u3002"),C?s.createElement(k,{key:C.id,file:C,projectId:p.id,download:z,embedded:!0,onClose:()=>d(null)}):h?s.createElement("section",{className:"df-dock-preview","aria-label":"\u6587\u4EF6\u9884\u89C8"},s.createElement("h3",null,h.artifact.title),o?s.createElement(Ie,{key:h.artifact.id,artifact:h.artifact},s.createElement(o,{artifact:h.artifact,readOnly:!0,hostControls:!0})):s.createElement("p",{role:"status"},"\u6B63\u5728\u6253\u5F00\u9884\u89C8\u2026"),s.createElement("button",{className:"df-dock-ask",onClick:()=>f("assistant")},"\u5C31\u6B64\u6587\u4EF6\u63D0\u95EE \u2192"),s.createElement("button",{className:"df-dock-ask",onClick:()=>z(`/cases/${h.reference.case_id}/outputs/${h.reference.generation_id}/${encodeURIComponent(h.reference.name)}`,h.artifact.title)},"\u4E0B\u8F7D\u5F53\u524D\u6587\u4EF6")):s.createElement("p",{className:"df-dock-empty"},"\u9009\u62E9\u4E00\u4EFD\u6587\u4EF6\uFF0C\u586B\u5199\u4E0E\u9884\u89C8\u53EF\u4EE5\u540C\u65F6\u8FDB\u884C\u3002")))}var he=window.QwenPaw,e=he.host.React,{useState:B,useEffect:ze,useRef:be}=e,Qe={pending:"\u672A\u5F00\u59CB",in_progress:"\u8FDB\u884C\u4E2D",submitted:"\u5DF2\u63D0\u4EA4",completed:"\u5DF2\u5B8C\u6210"},Ye={pending:"\u5F85\u51C6\u5907",preparing:"\u6574\u7406\u4E2D",ready:"\u5F85\u63D0\u4EA4",submitted:"\u5DF2\u63D0\u4EA4",done:"\u5DF2\u5B8C\u6210",na:"\u4E0D\u9002\u7528"},st=["\u4E0A\u62A5\u8BA1\u5212","\u9009\u5546\u8BBA\u8BC1","\u5546\u52A1\u8C08\u5224","\u5F00\u9898\u8BBA\u8BC1","\u7ED3\u9898\u9A8C\u6536","\u5F52\u6863\u4ED8\u6B3E"],Ze=n=>n?new Date(n).toLocaleString("zh-CN",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}):"";function Ee({title:n,children:w,onClose:p,error:u,busy:m=!1}){let j=be(null);return ze(()=>{let f=document.activeElement;return j.current?.querySelector("input,select,textarea,button")?.focus(),()=>{f?.isConnected&&f.focus()}},[]),e.createElement("div",{className:"df-dialog-backdrop"},e.createElement("section",{ref:j,className:"df-dialog df-paper",role:"dialog","aria-modal":"true","aria-label":n,onKeyDown:f=>{if(f.key==="Escape"&&!m&&(f.stopPropagation(),p()),f.key==="Tab"){let h=[...j.current.querySelectorAll("button,input,textarea,select,a[href]")].filter(d=>!d.disabled);f.shiftKey&&document.activeElement===h[0]&&(f.preventDefault(),h.at(-1)?.focus()),!f.shiftKey&&document.activeElement===h.at(-1)&&(f.preventDefault(),h[0]?.focus())}}},e.createElement("div",{className:"df-section-head"},e.createElement("h2",null,n),e.createElement("button",{type:"button",disabled:m,onClick:p,"aria-label":"\u5173\u95ED"+n},"\xD7")),u&&e.createElement("p",{role:"alert",className:"df-alert error"},u),w))}function Re({file:n,projectId:w,download:p,onClose:u,embedded:m=!1}){let[j,f]=B(null),[h,d]=B(""),[C,k]=B(""),q=n.name.split(".").pop().toLowerCase(),F=["pdf","png","jpg","jpeg"].includes(q)&&!he.workspace?.loadPreview;ze(()=>{let E=!0,T;return F?he.host.fetch(`/document-forms/projects/${w}/files/${n.id}`).then(async z=>{if(!z.ok)throw new Error("\u9884\u89C8\u672A\u80FD\u6253\u5F00\uFF0C\u8BF7\u4E0B\u8F7D\u67E5\u770B");let L=await z.blob();E&&(T=URL.createObjectURL(new Blob([L],{type:n.mime})),d(T))}).catch(z=>E&&k(z.message)):he.workspace?.loadPreview||["doc","docx","xls","xlsx","ppt","pptx"].includes(q)?(he.workspace?.loadPreview?he.workspace.loadPreview():Promise.resolve(pe)).then(z=>E&&f(()=>z)).catch(()=>E&&f(()=>pe)):k("\u6B64\u683C\u5F0F\u8BF7\u4E0B\u8F7D\u540E\u67E5\u770B\u3002"),()=>{E=!1,T&&URL.revokeObjectURL(T)}},[n.id]);let o={id:n.id,title:n.name,source:"uploaded",extension:q,mimeType:n.mime,binaryUrl:n.preview_url,agentId:he.host.getSelectedAgentId?.(),createdAt:Date.parse(n.uploaded_at)};return e.createElement(m?"section":Ee,{...m?{className:"df-dock-preview","aria-label":"\u6587\u4EF6\u9884\u89C8"}:{title:n.name,onClose:u}},m&&e.createElement("h3",null,n.name),e.createElement("div",{className:"df-attachment-preview"},C?e.createElement("p",{role:"alert"},C):F&&h?q==="pdf"?e.createElement("iframe",{title:n.name,src:h,sandbox:"allow-same-origin"}):e.createElement("img",{src:h,alt:n.name}):j?e.createElement(j,{artifact:o,readOnly:!0,hostControls:!0}):e.createElement("p",{role:"status"},"\u6B63\u5728\u6253\u5F00\u9884\u89C8\u2026")),e.createElement("div",{className:"df-actions"},e.createElement("button",{onClick:()=>p(`/projects/${w}/files/${n.id}`,n.name)},"\u4E0B\u8F7D\u539F\u6587\u4EF6"),e.createElement("button",{onClick:u},"\u5173\u95ED\u9884\u89C8")))}function Ge({Editor:n,services:w}){let{request:p,json:u,download:m,Field:j}=w,[f,h]=B([]),[d,C]=B(null),[k,q]=B("overview"),[F,o]=B(""),[P,E]=B(null),[T,z]=B(!1),[L,x]=B(!1),[y,l]=B(""),[S,W]=B(""),[V,D]=B(""),[ie,M]=B(""),[v,U]=B(null),[b,A]=B({}),[G,I]=B(null),[Y,Le]=B(!1),[$e,Ue]=B(!1),[Oe,ne]=B(null),[R,se]=B("assistant"),K=be(!0),X=be(0),de=be(null),ge=be(null),Pe=be(""),ee=be(null),xe=be(null);xe.current=d?.id,ze(()=>{ee.current?.scrollTo?.({top:0})},[d?.id,k,P?.id]);let me=he.host.useTheme?.()||"light",$=d?.stages.find(a=>a.id===k),J=d?.forms.filter(a=>a.stage_id===k)||[],we=()=>!T&&!L||window.confirm("\u8D44\u6599\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\uFF0C\u662F\u5426\u653E\u5F03\u8FD9\u4E9B\u4FEE\u6539\u5E76\u79BB\u5F00\uFF1F");async function ye(){let a=await p("/projects");return K.current&&h(a),a}async function le(a=d?.id,c=!1){let _=a?await p("/projects/"+a):null;return K.current&&_&&(c||!xe.current||xe.current===a)&&(xe.current!==_.id&&(I(null),ne(null),se("assistant")),xe.current=_.id,C(Z=>Z?.id===_.id&&Z.revision>_.revision?Z:_)),await ye(),_}ze(()=>(K.current=!0,W("\u8F7D\u5165\u9879\u76EE"),ye().then(async a=>{if(a.length&&K.current){let c=await p("/projects/"+a[0].id);K.current&&C(c)}}).catch(a=>K.current&&D(a.message)).finally(()=>K.current&&W("")),()=>{K.current=!1,X.current++}),[]),ze(()=>{let a=c=>{(T||L)&&(c.preventDefault(),c.returnValue="")};return window.addEventListener("beforeunload",a),()=>window.removeEventListener("beforeunload",a)},[T,L]);async function H(a,c){if(S)return;let _=++X.current;W(a),D(""),M("");try{await c()}catch(Z){K.current&&_===X.current&&D(Z.message)}finally{K.current&&_===X.current&&W("")}}async function Me(a){we()&&await H("\u6253\u5F00\u9879\u76EE",async()=>{E(null),z(!1),x(!1),q("overview"),await le(a,!0),E(null),z(!1),x(!1),I(null),ne(null),se("assistant"),q("overview")})}async function ke(a){we()&&(q(a),E(null),z(!1),x(!1),M(""),D(""),d.single_form&&d.stages.some(c=>c.id===a)&&await H("\u6253\u5F00\u9879\u76EE\u8868\u5355",async()=>{let c=await p(`/projects/${d.id}/form`,u({revision:d.revision,stage_id:a}));await le(),E({id:c.id,view:"edit",revision:c.revision,initialDraft:c})}))}function re(a,c){A(c),U(a),D("")}async function je(a,c,_="POST"){let Z=await p(a,{...u({...c,revision:d.revision}),method:_});return K.current&&(C(Z),U(null)),await ye(),Z}function oe(a){return H(a?"\u8BFB\u53D6\u9636\u6BB5 Excel":"\u51C6\u5907\u8C08\u5224\u8868\u5355",async()=>{let c;if(a){let _=new FormData;_.append("revision",d.revision),_.append("stage_id",k),_.append("workbook",a),c=await p(`/projects/${d.id}/${d.single_form?"form":"cases"}/import`,{method:"POST",body:_})}else c=await p(`/projects/${d.id}/${d.single_form?"form":"cases"}`,u({revision:d.revision,stage_id:k}));await le(),E({id:c.id,view:"edit",revision:c.revision,initialDraft:d.single_form?c:void 0}),z(!1),a&&M(c.templates.length?"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\uFF0C\u5E76\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002":"\u5DF2\u8BFB\u53D6\u672C\u9636\u6BB5\u53D8\u91CF\u914D\u7F6E\uFF0C\u8BF7\u6DFB\u52A0\u5BF9\u5E94\u7684 Word \u6A21\u677F\u3002")})}function i(a){if(!a)return;let c=Pe.current;return H("\u4FDD\u5B58\u6750\u6599",async()=>{let _=new FormData;_.append("revision",d.revision),_.append("file",a);let Z=await p(`/projects/${d.id}/stages/${k}/materials/${c}/files`,{method:"POST",body:_});C(Z),await ye(),M("\u6750\u6599\u5DF2\u4FDD\u5B58\uFF0C\u539F\u6709\u7248\u672C\u7EE7\u7EED\u4FDD\u7559\u3002\u8BF7\u6838\u5BF9\u540E\u66F4\u65B0\u6750\u6599\u72B6\u6001\u3002")})}let r=d?`/projects/${d.id}`:"",N=a=>{a.preventDefault(),H("\u4FDD\u5B58\u6750\u6599\u4FE1\u606F",()=>je(`${r}/stages/${k}/materials${b.id?"/"+b.id:""}`,b,b.id?"PUT":"POST"))},Q=a=>H("\u6574\u7406\u4E0B\u8F7D\u5305",()=>m(r+"/bundle"+(a?"?stage_id="+a:""),`${d.name}_${a?$.title:"\u5168\u6D41\u7A0B\u6750\u6599"}.zip`));return e.createElement("main",{className:"df-app df-project-app"+(d?.single_form?" df-three-column":"")+(Y?" df-left-collapsed":"")+($e?" df-right-collapsed":""),"data-theme":me},e.createElement("style",null,Xe),e.createElement("input",{ref:de,type:"file",accept:".xlsx",hidden:!0,"aria-label":"\u5BFC\u5165\u9636\u6BB5 Excel",onChange:a=>{let c=a.target.files[0];a.target.value="",c&&oe(c)}}),e.createElement("input",{ref:ge,type:"file",accept:".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.png,.jpg,.jpeg,.zip,.txt,.csv",hidden:!0,"aria-label":"\u4E0A\u4F20\u9636\u6BB5\u6750\u6599",onChange:a=>{let c=a.target.files[0];a.target.value="",i(c)}}),e.createElement("aside",{className:"df-sidebar df-project-sidebar"+(Y?" df-pane-collapsed":""),"aria-label":"\u9879\u76EE\u9009\u62E9"},e.createElement("button",{className:"df-pane-toggle","aria-label":Y?"\u5C55\u5F00\u9879\u76EE\u680F":"\u6536\u8D77\u9879\u76EE\u680F","aria-expanded":!Y,title:Y?"\u5C55\u5F00\u9879\u76EE\u680F":"\u6536\u8D77\u9879\u76EE\u680F",onClick:()=>Le(a=>!a)},e.createElement("span",{"aria-hidden":"true"},Y?"\u203A":"\u2039"),e.createElement("span",null,Y?"\u9879\u76EE":"\u6536\u8D77")),e.createElement("div",{className:"df-brand"},"UGSci ",e.createElement("span",null,"\u9879\u76EE\u6750\u6599")),e.createElement("button",{className:"df-primary df-new",disabled:!!S||!!y,onClick:()=>{we()&&re("create",{name:"",code:"",owner:""})}},"\uFF0B \u65B0\u5EFA\u9879\u76EE"),e.createElement("label",{className:"df-project-search"},e.createElement("span",{className:"df-sr-only"},"\u641C\u7D22\u9879\u76EE"),e.createElement("input",{"aria-label":"\u641C\u7D22\u9879\u76EE",placeholder:"\u641C\u7D22\u9879\u76EE\u540D\u79F0\u6216\u7F16\u53F7",value:F,onChange:a=>o(a.target.value)})),e.createElement("div",{className:"df-caption"},"\u6211\u7684\u9879\u76EE ",e.createElement("span",null,f.length)),e.createElement("nav",{"aria-label":"\u9879\u76EE\u5217\u8868"},f.filter(a=>(a.name+" "+a.code).toLowerCase().includes(F.toLowerCase())).map(a=>e.createElement("button",{key:a.id,disabled:!!S||!!y,"aria-current":d?.id===a.id?"page":void 0,onClick:()=>Me(a.id)},e.createElement("b",null,a.name),e.createElement("small",null,a.code||"\u672A\u8BBE\u7F16\u53F7"," \xB7 ",a.completed,"/6 \u9636\u6BB5\u5B8C\u6210")))),e.createElement("div",{className:"df-sidebar-foot"},e.createElement("b",null,"\u914D\u5957\u6A21\u677F"),e.createElement("p",null,"\u5546\u52A1\u8C08\u5224\u9636\u6BB5\u5DF2\u914D\u597D\u4E94\u4EFD Word \u6A21\u677F\uFF0C\u5176\u4F59\u9636\u6BB5\u53EF\u63A5\u5165\u5404\u81EA\u7684\u7EDF\u4E00\u6A21\u677F\u3002"),e.createElement("button",{disabled:!!S||!!y,onClick:()=>H("\u4E0B\u8F7D\u914D\u5957\u6A21\u677F",()=>m("/starter","\u6587\u4E66\u586B\u62A5_\u914D\u5957\u6A21\u677F.zip"))},"\u4E0B\u8F7D\u914D\u5957\u6A21\u677F \u2197"),e.createElement("small",null,"\u7A7A\u767D Excel \u4E0E 5 \u4EFD\u6807\u51C6 Word"))),e.createElement("section",{className:"df-main df-project-main",ref:ee},e.createElement("header",{className:"df-header"},e.createElement("div",null,e.createElement("span",{className:"df-eyebrow"},"UGSCI / \u9879\u76EE\u6750\u6599"),e.createElement("h1",null,d?.name||"\u9879\u76EE\u5DE5\u4F5C\u53F0"),e.createElement("p",null,d?[d.code||"\u672A\u8BBE\u9879\u76EE\u7F16\u53F7",d.owner&&"\u7ECF\u529E\u4EBA\uFF1A"+d.owner].filter(Boolean).join("\u3000\xB7\u3000"):"\u4ECE\u4E0A\u62A5\u8BA1\u5212\u5230\u5F52\u6863\u4ED8\u6B3E\uFF0C\u628A\u540C\u4E00\u9879\u76EE\u7684\u8D44\u6599\u653E\u5728\u4E00\u8D77\u3002")),d&&e.createElement("div",{className:"df-actions"},e.createElement("button",{disabled:!!S||!!y||!!P,onClick:()=>ke("profile")},"\u9879\u76EE\u8D44\u6599"),e.createElement("button",{disabled:!!S||!!y,onClick:()=>Q()},"\u4E0B\u8F7D\u9879\u76EE\u6750\u6599"))),V&&e.createElement("div",{role:"alert",className:"df-alert error"},V,e.createElement("button",{"aria-label":"\u5173\u95ED\u9519\u8BEF\u63D0\u793A",onClick:()=>D("")},"\xD7")),ie&&e.createElement("div",{className:"df-alert",role:"status"},ie),S&&e.createElement("div",{className:"df-progress",role:"status"},S,"\u2026"),d?e.createElement(e.Fragment,null,e.createElement("nav",{className:"df-project-tabs","aria-label":"\u9879\u76EE\u9636\u6BB5"},e.createElement("button",{className:k==="overview"?"active":"",disabled:!!S||!!y,onClick:()=>ke("overview")},"\u9879\u76EE\u603B\u89C8"),d.stages.map((a,c)=>e.createElement("button",{key:a.id,"aria-current":k===a.id?"step":void 0,className:k===a.id?"active":"",disabled:!!S||!!y,onClick:()=>ke(a.id)},e.createElement("small",null,String(c+1).padStart(2,"0")),a.title,e.createElement("span",{className:"df-state df-state-"+a.status},a.upstream_changed.length||a.documents_changed?"\u5F85\u590D\u6838":Qe[a.status])))),P?e.createElement(n,{key:d.id+":"+P.id+":"+k+":"+(P.revision||""),project:d,workflowStage:$,initialCaseId:P.id,initialView:P.view,initialDraft:P.initialDraft,onDirtyChange:z,onBusyChange:l,onViewChange:()=>ee.current?.scrollTo?.({top:0}),onBack:()=>{E(null),z(!1),le().catch(a=>D(a.message))},onChanged:()=>le(),docked:d.single_form,onStageStatus:()=>re("stage",{...$,confirmed:!1}),onPreview:a=>{ne(a),I(null),se("preview")}}):e.createElement("fieldset",{className:"df-content",disabled:!!S||!!y},k==="overview"&&e.createElement(e.Fragment,null,d.migrated&&e.createElement("p",{className:"df-muted df-migration-note"},"\u5386\u53F2\u586B\u62A5\u5DF2\u6309\u9879\u76EE\u540D\u79F0\u6216\u7F16\u53F7\u5F52\u5165\u5546\u52A1\u8C08\u5224\u9636\u6BB5\uFF0C\u539F\u8868\u5355\u3001\u751F\u6210\u6279\u6B21\u548C\u6587\u4EF6\u5747\u4FDD\u7559\u3002"),e.createElement("section",{className:"df-project-metrics"},e.createElement("div",null,e.createElement("b",null,d.stages.filter(a=>a.status==="completed").length,e.createElement("small",null,"/ 6")),e.createElement("span",null,"\u5DF2\u5B8C\u6210\u9636\u6BB5")),e.createElement("div",null,e.createElement("b",null,d.stages.reduce((a,c)=>a+c.materials.filter(_=>!["done","na"].includes(_.status)).length,0)),e.createElement("span",null,"\u5F85\u6574\u7406\u6750\u6599")),e.createElement("div",null,e.createElement("b",null,d.forms.reduce((a,c)=>a+c.outputs,0)),e.createElement("span",null,"\u5DF2\u751F\u6210\u6587\u4EF6")),e.createElement("div",null,e.createElement("b",null,d.stages.filter(a=>a.upstream_changed.length||a.documents_changed).length),e.createElement("span",null,"\u5F85\u590D\u6838\u9636\u6BB5"))),e.createElement("div",{className:"df-project-stage-grid"},d.stages.map((a,c)=>e.createElement("button",{className:"df-paper df-stage-card",key:a.id,onClick:()=>ke(a.id)},e.createElement("div",{className:"df-section-head"},e.createElement("small",null,"\u9636\u6BB5 ",String(c+1).padStart(2,"0")),e.createElement("span",{className:"df-state df-state-"+a.status},Qe[a.status])),e.createElement("h2",null,a.title),e.createElement("p",null,a.purpose),e.createElement("footer",null,e.createElement("span",null,a.materials.filter(_=>["done","na"].includes(_.status)).length,"/",a.materials.length," \u9879\u6750\u6599\u5DF2\u5904\u7406"),e.createElement("span",null,a.upstream_changed.length||a.documents_changed?"\u6709\u53D8\u66F4\u5F85\u590D\u6838":a.due_date?"\u8BA1\u5212 "+a.due_date:"\u8FDB\u5165\u9636\u6BB5 \u2192"))))),e.createElement("section",{className:"df-paper df-project-hint"},e.createElement("h2",null,"\u4E00\u4EFD\u9879\u76EE\u5E95\u7A3F\uFF0C\u8D2F\u7A7F\u5404\u9636\u6BB5"),e.createElement("p",null,"\u9879\u76EE\u540D\u79F0\u3001\u7814\u7A76\u5185\u5BB9\u3001\u6210\u679C\u6307\u6807\u548C\u9884\u7B97\u7B49\u53EF\u5728\u201C\u9879\u76EE\u8D44\u6599\u201D\u7EDF\u4E00\u7EF4\u62A4\u3002\u9636\u6BB5\u8868\u5355\u4ECE\u5E95\u7A3F\u53D6\u503C\uFF0C\u540E\u7EED\u53D8\u66F4\u4F1A\u63D0\u9192\u6838\u5BF9\uFF1B\u5DF2\u6709\u751F\u6210\u6587\u4EF6\u4FDD\u7559\u539F\u6837\u3002"),e.createElement("button",{onClick:()=>ke("profile")},"\u6574\u7406\u9879\u76EE\u8D44\u6599"))),k==="profile"&&e.createElement(lt,{onDirtyChange:x,key:d.id+":"+d.revision,project:d,Field:j,onSave:a=>H("\u4FDD\u5B58\u9879\u76EE\u8D44\u6599",async()=>{await je(r,a,"PUT"),M("\u9879\u76EE\u8D44\u6599\u5DF2\u66F4\u65B0\u3002\u5DF2\u6709\u8868\u5355\u53EF\u9010\u9879\u6838\u5BF9\u540E\u540C\u6B65\uFF0C\u539F\u751F\u6210\u6587\u4EF6\u4E0D\u53D8\u3002")})}),$&&e.createElement(e.Fragment,null,e.createElement("section",{className:"df-paper df-stage-header"},e.createElement("div",null,e.createElement("div",{className:"df-eyebrow"},"\u9636\u6BB5\u6750\u6599"),e.createElement("h2",null,$.title),e.createElement("p",null,$.purpose),e.createElement("p",{className:"df-muted"},$.id==="negotiation"?"\u4E94\u4EFD\u6807\u51C6\u6A21\u677F\u5DF2\u63A5\u5165\uFF0C\u53EF\u76F4\u63A5\u586B\u5199\uFF0C\u4E5F\u53EF\u5BFC\u5165\u73B0\u6709 Excel\u3002":"\u7EDF\u4E00\u6A21\u677F\u5F85\u8865\u5145\uFF1B\u73B0\u9636\u6BB5\u53EF\u6574\u7406\u6750\u6599\u3001\u4E0A\u4F20\u6587\u4EF6\uFF0C\u6216\u5BFC\u5165\u5DF2\u6709 Excel \u4E0E Word \u6A21\u677F\u3002")),e.createElement("div",{className:"df-actions"},e.createElement("button",{onClick:()=>Q($.id)},"\u4E0B\u8F7D\u672C\u9636\u6BB5\u6750\u6599"),e.createElement("button",{onClick:()=>re("stage",{...$,confirmed:!1})},"\u529E\u7406\u4FE1\u606F\u4E0E\u72B6\u6001"))),($.upstream_changed.length>0||$.documents_changed)&&e.createElement("div",{className:"df-alert df-stage-warning"},e.createElement("div",null,e.createElement("b",null,"\u672C\u9636\u6BB5\u6709\u8D44\u6599\u9700\u8981\u590D\u6838"),e.createElement("p",null,$.upstream_changed.length>0&&"\u524D\u5E8F\u9636\u6BB5\u5DF2\u66F4\u65B0\uFF1A"+$.upstream_changed.join("\u3001")+"\u3002",$.documents_changed&&"\u672C\u9636\u6BB5\u8868\u5355\u6216\u751F\u6210\u6587\u4EF6\u6709\u66F4\u65B0\u3002","\u8BF7\u6838\u5BF9\u5DF2\u63D0\u4EA4\u7684\u6750\u6599\u662F\u5426\u9700\u8981\u8C03\u6574\u3002")),e.createElement("button",{onClick:()=>H("\u8BB0\u5F55\u590D\u6838",()=>je(`${r}/stages/${$.id}/acknowledge`,{}))},"\u5DF2\u6838\u5BF9\u53D8\u66F4")),($.system_name||$.due_date||$.submission_ref||$.notes)&&e.createElement("section",{className:"df-paper df-stage-details"},e.createElement("dl",null,e.createElement("div",null,e.createElement("dt",null,"\u8BA1\u5212\u65E5\u671F"),e.createElement("dd",null,$.due_date||"\u672A\u8BBE\u7F6E")),e.createElement("div",null,e.createElement("dt",null,"\u529E\u7406\u7CFB\u7EDF"),e.createElement("dd",null,$.system_url?e.createElement("a",{href:$.system_url,target:"_blank",rel:"noopener noreferrer"},$.system_name||"\u6253\u5F00\u529E\u7406\u7CFB\u7EDF"," \u2197"):$.system_name||"\u672A\u8BB0\u5F55")),e.createElement("div",null,e.createElement("dt",null,"\u63D0\u4EA4\u7F16\u53F7 / \u56DE\u6267"),e.createElement("dd",null,$.submission_ref||"\u672A\u8BB0\u5F55"))),$.notes&&e.createElement("p",null,$.notes)),e.createElement("section",{className:"df-paper df-stage-forms"},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,d.single_form?"\u9879\u76EE\u8868\u5355":"\u586B\u5199\u4E0E\u751F\u6210"),e.createElement("p",{className:"df-muted"},"\u8868\u5355\u6CBF\u7528\u9879\u76EE\u5E95\u7A3F\uFF0C\u6838\u5BF9\u540E\u751F\u6210\u3002\u5DF2\u6709\u6279\u6B21\u4FDD\u7559\u751F\u6210\u65F6\u7684\u5185\u5BB9\u3002")),e.createElement("div",{className:"df-actions"},($.id==="negotiation"||d.single_form)&&e.createElement("button",{className:"df-primary",onClick:()=>oe()},d.single_form?"\u6253\u5F00\u9879\u76EE\u8868\u5355":"\u586B\u5199\u8C08\u5224\u6750\u6599"),e.createElement("button",{onClick:()=>de.current.click()},"\u5BFC\u5165 Excel \u8868\u5355"))),d.single_form?e.createElement("p",{className:"df-muted"},"\u6BCF\u4E2A\u9879\u76EE\u5171\u7528\u4E00\u4EFD\u8868\u5355\uFF0C\u516D\u4E2A\u9636\u6BB5\u5404\u529E\u7406\u4E00\u6B21\u3002\u5DF2\u6709\u6587\u4E66\u4E0E\u5386\u53F2\u5E95\u7A3F\u53EF\u5728\u53F3\u4FA7\u67E5\u770B\u3002"):J.length?e.createElement("div",{className:"df-project-forms"},J.map(a=>e.createElement("div",{key:a.case_id},e.createElement("div",null,e.createElement("b",null,a.name),e.createElement("small",null,Ze(a.updated_at)," \xB7"," ",a.outputs?a.outputs+" \u4EFD\u6587\u4EF6":"\u586B\u5199\u4E2D",a.shared_changes.length>0&&" \xB7 \u9879\u76EE\u8D44\u6599\u6709\u66F4\u65B0")),e.createElement("div",{className:"df-actions"},e.createElement("button",{onClick:()=>E({id:a.case_id,view:"edit"})},"\u6253\u5F00\u8868\u5355"),a.outputs>0&&e.createElement("button",{onClick:()=>E({id:a.case_id,view:"files"})},"\u67E5\u770B\u751F\u6210\u6587\u4EF6"))))):e.createElement("p",{className:"df-empty"},"\u672C\u9636\u6BB5\u8FD8\u6CA1\u6709\u8868\u5355\u3002\u5DF2\u6709\u6210\u54C1\u6587\u4EF6\u53EF\u76F4\u63A5\u4E0A\u4F20\u5230\u4E0B\u9762\u7684\u6750\u6599\u6E05\u5355\u3002")),$.id==="negotiation"&&e.createElement("section",{className:"df-paper df-review-entry"},e.createElement("div",null,e.createElement("h2",null,"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5"),e.createElement("p",{className:"df-muted"},"\u5BF9\u7167\u6B63\u5F0F\u8C08\u5224\u6587\u4EF6\uFF0C\u68C0\u67E5\u5404\u5355\u4F4D\u54CD\u5E94\u6750\u6599\uFF0C\u6C47\u603B\u95EE\u9898\u3001\u4F9D\u636E\u548C\u5F85\u786E\u8BA4\u4E8B\u9879\u3002")),e.createElement("button",{onClick:()=>d.single_form?se("review"):re("response-review",{})},"\u6253\u5F00\u6838\u67E5\u667A\u80FD\u4F53 \u2192")),e.createElement("section",{className:"df-paper df-material-panel"},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,"\u6750\u6599\u6E05\u5355 ",e.createElement("small",null,$.materials.length)),e.createElement("p",{className:"df-muted"},"\u5148\u6309\u5E38\u7528\u6750\u6599\u5217\u51FA\uFF0C\u53EF\u4FEE\u6539\u540D\u79F0\u3001\u589E\u8865\u6750\u6599\u6216\u6807\u4E3A\u4E0D\u9002\u7528\u3002\u201C\u5DF2\u63D0\u4EA4\u201D\u7531\u7ECF\u529E\u4EBA\u6838\u5B9E\u540E\u8BB0\u5F55\u3002")),e.createElement("button",{onClick:()=>re("material",{name:"",status:"pending",required:!1,note:""})},"\uFF0B \u6DFB\u52A0\u6750\u6599")),e.createElement("div",{className:"df-materials"},$.materials.map(a=>{let c=J.reduce((_,Z)=>_+(Z.generations[0]?.files.filter(at=>at.name.includes(a.name)).length||0),0);return e.createElement("article",{className:"df-material-row",key:a.id},e.createElement("div",{className:"df-material-name"},e.createElement("b",null,a.name),a.required&&e.createElement("span",{className:"df-required-tag"},"\u5FC5\u5907"),e.createElement("span",{className:"df-state df-material-state-"+a.status},Ye[a.status]),c>0&&e.createElement("small",null,"\u5DF2\u6709 ",c," \u4EFD\u751F\u6210\u7A3F \xB7 \u5728\u4E0A\u65B9\u8868\u5355\u67E5\u770B"),a.note&&e.createElement("p",null,a.note)),e.createElement("div",{className:"df-material-files"},a.files.length>0?e.createElement("details",null,e.createElement("summary",null,a.files.length," \u4EFD\u6587\u4EF6 / \u7248\u672C \xB7 \u6700\u65B0\uFF1A",a.files[a.files.length-1].name),[...a.files].reverse().map((_,Z)=>e.createElement("div",{className:"df-material-file",key:_.id},e.createElement("div",null,e.createElement("b",null,"V",a.files.length-Z," \xB7"," ",_.name),e.createElement("small",null,Ze(_.uploaded_at)," \xB7"," ",Math.max(1,Math.round(_.size/1024))," ","KB")),e.createElement("button",{onClick:()=>{I(_),ne({artifact:{title:_.name},reference:{file_id:_.id}}),se("preview")}},"\u9884\u89C8"),e.createElement("button",{"aria-label":"\u4E0B\u8F7D"+_.name+"\u7248\u672C"+(a.files.length-Z),onClick:()=>H("\u4E0B\u8F7D\u6750\u6599",()=>m(`${r}/files/${_.id}`,_.name))},"\u4E0B\u8F7D")))):e.createElement("span",{className:"df-muted"},"\u5C1A\u672A\u4E0A\u4F20\u6587\u4EF6")),e.createElement("div",{className:"df-actions"},e.createElement("button",{"aria-label":"\u4E0A\u4F20"+a.name,onClick:()=>{Pe.current=a.id,ge.current.click()}},"\u4E0A\u4F20\u6587\u4EF6"),e.createElement("button",{"aria-label":"\u7F16\u8F91"+a.name,onClick:()=>re("material",{...a})},"\u7F16\u8F91")))}))),e.createElement("div",{className:"df-stage-tail"},e.createElement("p",null,"\u5404\u9636\u6BB5\u53EF\u5E76\u884C\u51C6\u5907\uFF1B\u524D\u5E8F\u8D44\u6599\u53D8\u5316\u540E\uFF0C\u540E\u7EED\u9636\u6BB5\u4F1A\u63D0\u793A\u590D\u6838\u3002\u9636\u6BB5\u5B8C\u6210\u7531\u7ECF\u529E\u4EBA\u786E\u8BA4\u3002"),e.createElement("button",{onClick:()=>re("stage",{...$,confirmed:!1})},"\u66F4\u65B0\u529E\u7406\u72B6\u6001"))))):e.createElement("section",{className:"df-paper df-project-welcome"},e.createElement("h2",null,"\u5148\u5EFA\u4E00\u4E2A\u9879\u76EE"),e.createElement("p",null,"\u5171\u7528\u8D44\u6599\u53EA\u6574\u7406\u4E00\u6B21\uFF0C\u8868\u5355\u4E0E\u9644\u4EF6\u6309\u9636\u6BB5\u5F52\u96C6\uFF0C\u751F\u6210\u7A3F\u4E0E\u5B9A\u7A3F\u5206\u522B\u7559\u75D5\u3002"),e.createElement("div",{className:"df-welcome-stages"},st.map((a,c)=>e.createElement("span",{key:a},e.createElement("small",null,String(c+1).padStart(2,"0")),a))),e.createElement("button",{className:"df-primary",onClick:()=>re("create",{name:"",code:"",owner:""})},"\u5EFA\u7ACB\u7B2C\u4E00\u4E2A\u9879\u76EE"))),d?.single_form&&e.createElement(Fe,{key:d.id,collapsed:$e,onToggle:()=>Ue(a=>!a),project:d,stageId:k,services:w,mode:R,onMode:se,selection:Oe,attachment:G,AttachmentPreview:Re,dirty:T,onSelect:a=>{ne(a),I(null),se("preview")},onChanged:()=>le().catch(a=>D(a.message))}),v==="response-review"&&e.createElement(Ee,{title:"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5",onClose:()=>{U(null),le().catch(a=>D(a.message))}},e.createElement(Se,{project:d,services:w,onChanged:()=>le().catch(a=>D(a.message))})),v==="create"&&e.createElement(Ee,{title:"\u65B0\u5EFA\u9879\u76EE",busy:!!S,error:V,onClose:()=>U(null)},e.createElement("form",{onSubmit:a=>{a.preventDefault(),H("\u5EFA\u7ACB\u9879\u76EE",async()=>{let c=await p("/projects",u(b));I(null),ne(null),se("assistant"),C(c),q("overview"),E(null),z(!1),U(null),await ye()})}},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u540D\u79F0"),e.createElement("input",{"aria-label":"\u65B0\u9879\u76EE\u540D\u79F0",required:!0,maxLength:120,value:b.name,onChange:a=>A({...b,name:a.target.value})})),e.createElement("div",{className:"df-fields"},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u7F16\u53F7"),e.createElement("input",{"aria-label":"\u65B0\u9879\u76EE\u7F16\u53F7",maxLength:100,value:b.code,onChange:a=>A({...b,code:a.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u7ECF\u529E\u4EBA"),e.createElement("input",{"aria-label":"\u65B0\u9879\u76EE\u7ECF\u529E\u4EBA",maxLength:100,value:b.owner,onChange:a=>A({...b,owner:a.target.value})}))),e.createElement("p",{className:"df-muted"},"\u5EFA\u7ACB\u9879\u76EE\u540E\uFF0C\u53EF\u6574\u7406\u5171\u7528\u8D44\u6599\uFF0C\u518D\u6309\u516D\u4E2A\u9636\u6BB5\u51C6\u5907\u6750\u6599\u3002"),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",disabled:!!S||!!y,onClick:()=>U(null)},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!S||!b.name?.trim(),type:"submit"},"\u5EFA\u7ACB\u9879\u76EE")))),v==="material"&&e.createElement(Ee,{title:"\u6750\u6599\u4FE1\u606F",busy:!!S,error:V,onClose:()=>U(null)},e.createElement("form",{onSubmit:N},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u6750\u6599\u540D\u79F0"),e.createElement("input",{"aria-label":"\u6750\u6599\u540D\u79F0",required:!0,maxLength:150,value:b.name,onChange:a=>A({...b,name:a.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u6750\u6599\u72B6\u6001"),e.createElement("select",{"aria-label":"\u6750\u6599\u72B6\u6001",value:b.status,onChange:a=>A({...b,status:a.target.value})},Object.entries(Ye).map(([a,c])=>e.createElement("option",{key:a,value:a},c)))),e.createElement("label",{className:"df-checkbox"},e.createElement("input",{type:"checkbox",checked:b.required,onChange:a=>A({...b,required:a.target.checked})}),"\u672C\u9879\u76EE\u7684\u5FC5\u5907\u6750\u6599\uFF0C\u9636\u6BB5\u5B8C\u6210\u524D\u9700\u786E\u8BA4\u5DF2\u5B8C\u6210\u6216\u4E0D\u9002\u7528"),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u6750\u6599\u8BF4\u660E"),e.createElement("textarea",{"aria-label":"\u6750\u6599\u8BF4\u660E",rows:3,maxLength:3e3,value:b.note,onChange:a=>A({...b,note:a.target.value})})),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",onClick:()=>U(null),disabled:!!S||!!y},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!S||!!y,type:"submit"},"\u4FDD\u5B58\u6750\u6599\u4FE1\u606F")))),v==="stage"&&e.createElement(Ee,{title:$.title+"\u529E\u7406\u4FE1\u606F",busy:!!S,error:V,onClose:()=>U(null)},e.createElement("form",{onSubmit:a=>{a.preventDefault(),H("\u4FDD\u5B58\u529E\u7406\u4FE1\u606F",()=>je(`${r}/stages/${k}`,b,"PUT"))}},e.createElement("div",{className:"df-fields"},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9636\u6BB5\u72B6\u6001"),e.createElement("select",{"aria-label":"\u9636\u6BB5\u72B6\u6001",value:b.status,onChange:a=>A({...b,status:a.target.value})},Object.entries(Qe).map(([a,c])=>e.createElement("option",{key:a,value:a},c)))),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u8BA1\u5212\u65E5\u671F"),e.createElement("input",{"aria-label":"\u9636\u6BB5\u8BA1\u5212\u65E5\u671F",type:"date",value:b.due_date,onChange:a=>A({...b,due_date:a.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u529E\u7406\u7CFB\u7EDF"),e.createElement("input",{"aria-label":"\u529E\u7406\u7CFB\u7EDF",maxLength:150,value:b.system_name,onChange:a=>A({...b,system_name:a.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u7CFB\u7EDF\u5730\u5740"),e.createElement("input",{"aria-label":"\u7CFB\u7EDF\u5730\u5740",type:"url",placeholder:"https://",maxLength:1e3,value:b.system_url,onChange:a=>A({...b,system_url:a.target.value})}))),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u63D0\u4EA4\u7F16\u53F7 / \u56DE\u6267\u4FE1\u606F"),e.createElement("input",{"aria-label":"\u63D0\u4EA4\u7F16\u53F7",maxLength:500,value:b.submission_ref,onChange:a=>A({...b,submission_ref:a.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u529E\u7406\u8BF4\u660E"),e.createElement("textarea",{"aria-label":"\u529E\u7406\u8BF4\u660E",rows:4,maxLength:5e3,value:b.notes,onChange:a=>A({...b,notes:a.target.value})})),e.createElement("p",{className:"df-muted"},"\u8BB0\u5F55\u7EBF\u4E0B\u6216\u4E1A\u52A1\u7CFB\u7EDF\u7684\u5B9E\u9645\u529E\u7406\u7ED3\u679C\uFF0C\u56DE\u6267\u6587\u4EF6\u53EF\u4E0A\u4F20\u5230\u6750\u6599\u6E05\u5355\u3002"),b.status==="completed"&&e.createElement(e.Fragment,null,e.createElement("p",{className:"df-muted"},$.missing_required.length>0?"\u5C1A\u672A\u529E\u7ED3\u7684\u5FC5\u5907\u6750\u6599\uFF1A"+$.missing_required.join("\u3001"):"\u8BF7\u786E\u8BA4\u9636\u6BB5\u6750\u6599\u548C\u524D\u5E8F\u53D8\u66F4\u5DF2\u6838\u5BF9\u3002"),e.createElement("label",{className:"df-checkbox"},e.createElement("input",{"aria-label":"\u786E\u8BA4\u672C\u9636\u6BB5\u5DF2\u529E\u7ED3",type:"checkbox",checked:b.confirmed,onChange:a=>A({...b,confirmed:a.target.checked})}),"\u5DF2\u6838\u5BF9\u672C\u9636\u6BB5\u6750\u6599\u53CA\u524D\u5E8F\u53D8\u66F4\uFF0C\u786E\u8BA4\u672C\u9636\u6BB5\u5DF2\u529E\u7ED3")),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",onClick:()=>U(null),disabled:!!S||!!y},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!S||b.status==="completed"&&!b.confirmed,type:"submit"},"\u4FDD\u5B58\u529E\u7406\u4FE1\u606F")))),G&&!d.single_form&&e.createElement(Re,{key:G.id,file:G,projectId:d.id,download:(a,c)=>H("\u4E0B\u8F7D\u539F\u6587\u4EF6",()=>m(a,c)),onClose:()=>I(null)}))}function lt({project:n,Field:w,onSave:p,onDirtyChange:u}){let[m,j]=B(n.fields),[f,h]=B({name:n.name,code:n.code,owner:n.owner});return ze(()=>{u(JSON.stringify(m)!==JSON.stringify(n.fields)||f.name!==n.name||f.code!==n.code||f.owner!==n.owner)},[m,f]),e.createElement("form",{className:"df-paper df-project-profile",onSubmit:d=>{d.preventDefault(),p({...f,values:Object.fromEntries(m.map(C=>[C.key,C.value]))})}},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,"\u9879\u76EE\u8D44\u6599\u5E95\u7A3F"),e.createElement("p",{className:"df-muted"},"\u5404\u9636\u6BB5\u8868\u5355\u590D\u7528\u8FD9\u91CC\u7684\u8D44\u6599\uFF1B\u9636\u6BB5\u65E5\u671F\u3001\u8BC4\u5BA1\u5206\u6570\u548C\u4ED8\u6B3E\u7ED3\u679C\u5206\u522B\u8BB0\u5F55\u3002")),e.createElement("button",{className:"df-primary",type:"submit"},"\u4FDD\u5B58\u9879\u76EE\u8D44\u6599")),e.createElement("div",{className:"df-fields"},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u540D\u79F0"),e.createElement("input",{"aria-label":"\u9879\u76EE\u540D\u79F0",required:!0,value:f.name,maxLength:120,onChange:d=>h({...f,name:d.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u7F16\u53F7"),e.createElement("input",{"aria-label":"\u9879\u76EE\u7F16\u53F7",value:f.code,maxLength:100,onChange:d=>h({...f,code:d.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u7ECF\u529E\u4EBA"),e.createElement("input",{"aria-label":"\u7ECF\u529E\u4EBA",value:f.owner,maxLength:100,onChange:d=>h({...f,owner:d.target.value})}))),[...new Set(m.filter(d=>!["project.name","project.code"].includes(d.key)).map(d=>d.group))].map(d=>e.createElement("section",{className:"df-group",key:d},e.createElement("h3",null,d),e.createElement("div",{className:"df-fields"},m.filter(C=>C.group===d&&!["project.name","project.code"].includes(C.key)).map(C=>e.createElement(w,{key:C.key,field:{...C,required:!1},onChange:k=>j(m.map(q=>q.key===C.key?{...q,value:k}:q))}))))),e.createElement("div",{className:"df-actions"},e.createElement("button",{className:"df-primary",type:"submit"},"\u4FDD\u5B58\u9879\u76EE\u8D44\u6599")))}var fe=window.QwenPaw,t=fe.host.React,{useState:te,useEffect:_e,useLayoutEffect:pt,useRef:De}=t,Ke="/document-forms",ft="application/vnd.openxmlformats-officedocument.wordprocessingml.document";async function ae(n,w){let p=await fe.host.fetch(Ke+n,w);if(!p.ok){let u=await p.json().catch(()=>({}));throw new Error(typeof u.detail=="string"?u.detail:Array.isArray(u.detail)?u.detail.map(m=>`${m.loc?.slice(1).join(".")||"\u8D44\u6599"}\uFF1A${m.msg}`).join("\uFF1B"):`\u64CD\u4F5C\u672A\u5B8C\u6210\uFF08${p.status}\uFF09\uFF0C\u8BF7\u68C0\u67E5\u586B\u5199\u5185\u5BB9`)}return p.json()}async function qe(n,w){let p=await fe.host.fetch(Ke+n);if(!p.ok)throw new Error("\u6587\u4EF6\u4E0B\u8F7D\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5");let u=URL.createObjectURL(await p.blob()),m=document.createElement("a");m.href=u,m.download=w,document.body.appendChild(m);try{m.click()}finally{m.remove(),setTimeout(()=>URL.revokeObjectURL(u),1e3)}}var ve=n=>({method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)}),Te=n=>new Date(n).toLocaleString("zh-CN",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}),et=n=>n.kind==="textarea"||n.value.length>100||n.value.includes(`
`)||n.label.includes("\u6574\u6BB5"),mt=n=>/^(research\.contents|deliverables\.|metrics\.|milestones\.)/.test(n.key)||/主要研究内容|预期成果|考核指标|进度安排/.test(n.label);function We(n){return n.map((w,p)=>{let u={...w};for(let m of["start","end"]){let j="follow_"+m;u[j]=p>0&&(typeof u[j]=="boolean"?u[j]:!u[m]),u[j]&&(u[m]=n[0][m])}return u})}function tt({field:n,displayValue:w,onChange:p}){let u=et(n),m=mt(n),j=["date","datetime-local"].includes(n.kind)?n.value:w??n.value,f=De(null);return pt(()=>{if(!f.current)return;let h=f.current.scrollTop;f.current.style.height="auto",f.current.style.height=Math.max(m?104:192,f.current.scrollHeight)+"px",f.current.scrollTop=h},[j,u,m]),t.createElement("label",{className:"df-field"+(u?" df-field-paragraph":"")+(m?" df-field-compact":""),id:"df-"+n.key},t.createElement("span",null,n.label,n.required&&t.createElement("em",null,"\u5FC5\u586B")),u?t.createElement("textarea",{ref:f,"aria-label":n.label,rows:m?3:8,value:j,onChange:h=>p(h.target.value)}):t.createElement("input",{"aria-label":n.label,type:n.kind,step:n.kind==="number"?"any":void 0,value:j,onChange:h=>p(h.target.value)}),t.createElement("small",null,n.key))}function ct({project:n,workflowStage:w,initialCaseId:p,initialView:u,initialDraft:m,onBack:j,onChanged:f,onDirtyChange:h,onBusyChange:d,onViewChange:C,docked:k=!1,onPreview:q,onStageStatus:F}){let[o,P]=te(null),[E,T]=te(null),[z,L]=te([]),[x,y]=te("import"),[l,S]=te(!1),[W,V]=te(null),[D,ie]=te(!1),[M,v]=te(""),[U,b]=te(""),[A,G]=te(""),[I,Y]=te(null),[Le,$e]=te(null),Ue=De(null),Oe=De(null),ne=De(0),R=De(!0),se=fe.host.useTheme?.()||"light",K=()=>f?.()||Promise.resolve();_e(()=>(R.current=!0,(m?Promise.resolve(m):ae("/cases/"+p)).then(i=>{R.current&&(de(i),y(u==="files"&&i.generations.length?"files":"edit"),u==="files"&&i.generations.length&&Y({file:i.generations[0].files[0],generation:i.generations[0]}))}).catch(i=>R.current&&b(i.message)),(fe.workspace?.loadPreview?fe.workspace.loadPreview():Promise.resolve(pe)).then(i=>{R.current&&$e(()=>i)}).catch(i=>{R.current&&$e(()=>pe)}),()=>{R.current=!1,ne.current++}),[]),_e(()=>{h?.(l)},[l]),_e(()=>{d?.(M)},[M]),_e(()=>{C?.()},[x]),_e(()=>{let i=r=>{l&&(r.preventDefault(),r.returnValue="")};return window.addEventListener("beforeunload",i),()=>window.removeEventListener("beforeunload",i)},[l]);async function X(i,r){if(M)return;let N=++ne.current;v(i),b(""),G("");try{await r()}catch(Q){R.current&&N===ne.current&&b(Q.message)}finally{R.current&&N===ne.current&&v("")}}function de(i){R.current&&(P({...i,recipients:We(i.recipients),presentation_sources:Object.fromEntries(i.fields.map(r=>[r.key,r.value]))}),S(!1),V(null),ie(!1))}function ge(i){P(i),S(!0),V(null),ie(!1),G("")}function Pe(i,r,N,Q=!1){let a=o.recipients.map((c,_)=>_===i?{...c,[r]:N,...r!=="name"?{["follow_"+r]:Q}:{}}:c);ge({...o,recipients:We(a)})}async function ee(){if(!l)return o;let i={revision:o.revision,name:o.name.trim()||"\u672A\u547D\u540D\u586B\u62A5",values:Object.fromEntries(o.fields.map(N=>[N.key,N.value])),recipients:o.recipients},r=await ae("/cases/"+o.id,{...ve(i),method:"PUT"});return de(r),r}function xe(){return!l||window.confirm("\u5F53\u524D\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\u3002\u79BB\u5F00\u6B64\u8BB0\u5F55\uFF1F")}let me=o?.templates||[],$=me.reduce((i,r)=>i+(r.per_recipient?o.recipients.length:1),0),J=o?.generations.find(i=>!k||(i.stage_id||o.original_stage_id||w.id)===w.id);_e(()=>{k&&x==="files"&&J&&!I&&Y({file:J.files[0],generation:J})},[x,J?.id]);let we=W?.checks.filter(i=>i.status!=="ok")||[];async function ye(i){!i||!xe()||await X("\u8BFB\u53D6 Excel",async()=>{let r=new FormData;r.append("workbook",i),r.append("revision",n.revision),r.append("stage_id",w.id);let N=await ae(`/projects/${n.id}/${n.single_form?"form":"cases"}/import`,{method:"POST",body:r});de(N),Y(null),y("edit"),await K(),G(N.templates.length?"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\uFF0C\u5E76\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002":N.template_notice||"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\u3002\u8BF7\u6DFB\u52A0\u5BF9\u5E94\u7684 Word \u6A21\u677F\u3002")})}async function le(i){i=Array.from(i),i.length&&await X("\u8BFB\u53D6 Word \u6A21\u677F",async()=>{let r=await ee(),N=new FormData;N.append("revision",String(r.revision)),Array.from(i).forEach(Q=>N.append("files",Q)),de(await ae("/cases/"+r.id+"/templates",{method:"POST",body:N})),await K(),G("Word \u6A21\u677F\u5DF2\u6DFB\u52A0\uFF0C\u751F\u6210\u65F6\u4F1A\u4FDD\u7559\u539F\u6709\u6392\u7248\u3002")})}async function H(){await X("\u6838\u5BF9\u8D44\u6599",async()=>{let i=await ee(),r=await ae("/cases/"+i.id+"/review",ve({revision:i.revision}));R.current&&(V(r),ie(!1),y("review"),await K())})}async function Me(){await X("\u751F\u6210\u6587\u4E66",async()=>{let i=await ae("/cases/"+o.id+"/generate",ve({revision:o.revision,review_token:W.review_token,confirmed:D}));de(i),y("files"),Y({file:i.generations[0].files[0],generation:i.generations[0]}),await K()})}function ke(i){y("edit"),requestAnimationFrame(()=>{let r=document.getElementById("df-"+i);r?.scrollIntoView({behavior:"smooth",block:"center"}),r?.querySelector("input,textarea")?.focus()})}let re=(i,r)=>`/cases/${o.id}/outputs/${i.id}/${encodeURIComponent(r)}`;function je(i){return X("\u6B63\u5728\u4E0B\u8F7D\u538B\u7F29\u5305",async()=>{await qe(re(i,"\u5168\u90E8\u6587\u4E66.zip"),i.bundle_name||o.name+"_\u6587\u4E66.zip"),G(`\u5DF2\u5F00\u59CB\u4E0B\u8F7D\u8BE5\u6279\u6B21\u7684 ${i.files.length} \u4EFD\u6587\u4E66\u538B\u7F29\u5305\u3002`)})}let oe=I?{id:I.generation.id+I.file.name,title:I.file.name,source:"generated",mimeType:ft,extension:"docx",binaryUrl:I.file.preview_url,printUrl:Ke+`/cases/${o.id}/print/${I.generation.id}/${encodeURIComponent(I.file.name)}`,agentId:fe.host.getSelectedAgentId?.(),createdAt:Date.parse(I.generation.created_at)}:null;return _e(()=>{k&&x==="files"&&oe&&q?.({artifact:oe,reference:{case_id:o.id,generation_id:I.generation.id,name:I.file.name}})},[x,I?.generation.id,I?.file.name]),t.createElement("div",{className:"df-app df-embedded-editor","data-theme":se},t.createElement("input",{ref:Ue,type:"file",accept:".xlsx",hidden:!0,"aria-label":"\u5BFC\u5165 Excel \u53D8\u91CF\u8868",onChange:i=>{ye(i.target.files[0]),i.target.value=""}}),t.createElement("input",{ref:Oe,type:"file",accept:".docx",multiple:!0,hidden:!0,"aria-label":"\u5BFC\u5165 Word \u6A21\u677F",onChange:i=>{le(i.target.files),i.target.value=""}}),t.createElement("section",{className:"df-main"},t.createElement("div",{className:"df-editor-context"},t.createElement("button",{disabled:!!M,onClick:()=>{xe()&&j()}},"\u2190 \u8FD4\u56DE",w.title),t.createElement("span",null,n.name," / ",w.title),k&&t.createElement("button",{disabled:!!M||l,title:l?"\u8BF7\u5148\u4FDD\u5B58\u8868\u5355":"\u66F4\u65B0\u5F53\u524D\u8282\u70B9\u7684\u529E\u7406\u4FE1\u606F",onClick:F},"\u529E\u7406\u4FE1\u606F\u4E0E\u72B6\u6001"),o&&t.createElement("div",{className:"df-actions"},t.createElement("button",{disabled:!!M,onClick:()=>{T("adopt"),L([])}},"\u6838\u5BF9\u9879\u76EE\u8D44\u6599\u5DEE\u5F02"),t.createElement("button",{disabled:!!M,onClick:()=>{T("publish"),L([])}},"\u5B58\u5165\u9879\u76EE\u5E95\u7A3F"))),t.createElement("header",{className:"df-header"},t.createElement("div",null,t.createElement("span",{className:"df-eyebrow"},w.title," / \u586B\u5199\u4E0E\u751F\u6210"),t.createElement("h1",null,o?k?w.title+" \xB7 \u9879\u76EE\u8868\u5355":o.name:"\u628A\u91CD\u590D\u586B\u5199\u7684\u8D44\u6599\uFF0C\u6574\u7406\u6210\u4E00\u5F20\u8868\u3002"),t.createElement("p",null,o?l?"\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539":`\u8349\u7A3F\u5DF2\u4FDD\u5B58 \xB7 ${Te(o.updated_at)}`:"\u5BFC\u5165\u53D8\u91CF\u8868\u4E0E Word \u6A21\u677F\uFF0C\u586B\u5199\u3001\u6838\u5BF9\uFF0C\u518D\u751F\u6210\u6587\u4E66\u3002")),o&&t.createElement("button",{disabled:!!M||!l,onClick:()=>X("\u4FDD\u5B58\u8349\u7A3F",async()=>{await ee(),await K(),G("\u8349\u7A3F\u5DF2\u4FDD\u5B58")})},"\u4FDD\u5B58\u8349\u7A3F")),t.createElement("div",{className:"df-steps","aria-label":"\u586B\u5199\u6D41\u7A0B"},[["import","01","\u5BFC\u5165\u6A21\u677F"],["edit","02","\u586B\u5199\u8D44\u6599"],["review","03","\u6838\u5BF9\u751F\u6210"],["files","04","\u6587\u4EF6\u9884\u89C8"]].map(([i,r,N])=>t.createElement("button",{key:i,className:x===i?"active":"",disabled:!!M||!o&&i!=="import"||i==="files"&&!J,onClick:()=>i==="review"?H():y(i)},t.createElement("span",null,r),N))),U&&t.createElement("div",{className:"df-alert error",role:"alert"},U,t.createElement("button",{"aria-label":"\u5173\u95ED\u9519\u8BEF\u63D0\u793A",onClick:()=>b("")},"\xD7")),A&&t.createElement("div",{className:"df-alert",role:"status"},A),M&&t.createElement("div",{className:"df-progress",role:"status"},M,"\u2026"),t.createElement("fieldset",{className:"df-content",disabled:!!M},x==="import"&&t.createElement("div",{className:"df-import"},t.createElement("section",{className:"df-paper df-drop"},t.createElement("div",{className:"df-file-mark"},"XLSX"),t.createElement("h2",null,"\u4ECE Excel \u53D8\u91CF\u8868\u5F00\u59CB"),t.createElement("p",null,"\u201C\u53D8\u91CF\u914D\u7F6E\u201D\u5DE5\u4F5C\u8868\u4FDD\u7559\u4E09\u5217\uFF1A",t.createElement("br",null),t.createElement("b",null,"\u53D8\u91CF\u540D\u79F0\u3000\u4E2D\u6587\u540D\u79F0\u3000\u503C")),t.createElement("button",{className:"df-primary",onClick:()=>Ue.current.click()},"\u9009\u62E9 Excel \u53D8\u91CF\u8868"),t.createElement("small",null,"\u652F\u6301 .xlsx \xB7 \u5355\u4E2A\u6587\u4EF6\u4E0D\u8D85\u8FC7 15 MB")),t.createElement("section",{className:"df-paper df-import-note"},t.createElement("span",{className:"df-eyebrow"},"\u5982\u4F55\u51C6\u5907"),t.createElement("h2",null,"\u4E00\u4EFD\u6570\u636E\uFF0C\u591A\u4EFD\u6587\u4E66"),t.createElement("ol",null,t.createElement("li",null,t.createElement("b",null,"\u6574\u7406\u53D8\u91CF"),t.createElement("p",null,"\u4F8B\u5982 project.name / \u9879\u76EE\u540D\u79F0 / \u5B9E\u9645\u540D\u79F0\u3002\u652F\u6301\u5206\u7EC4\u3001\u7C7B\u578B\u548C\u5FC5\u586B\u5217\u3002")),t.createElement("li",null,t.createElement("b",null,"\u81EA\u52A8\u8F7D\u5165\u6A21\u677F"),t.createElement("p",null,"\u5E94\u7528\u81EA\u5E26 5 \u4EFD\u6807\u51C6 Word \u6A21\u677F\uFF0C\u4F7F\u7528\u914D\u5957 Excel \u5373\u53EF\u81EA\u52A8\u8F7D\u5165\uFF1B \u4E5F\u53EF\u6DFB\u52A0\u81EA\u5DF1\u7684\u6A21\u677F\u3002")),t.createElement("li",null,t.createElement("b",null,"\u5206\u522B\u751F\u6210\u9080\u8BF7\u51FD"),t.createElement("p",null,"\u5728\u201C\u53D7\u9080\u5355\u4F4D\u201D\u8868\u8BB0\u5F55\u5355\u4F4D\u540D\u79F0\u3001\u9886\u53D6\u5F00\u59CB\u65F6\u95F4\u548C\u9886\u53D6\u7ED3\u675F\u65F6\u95F4\u3002"))),t.createElement("p",{className:"df-muted"},"\u201C\u65E5\u671F\u6821\u6838\u201D\u8868\u4E2D\u7684\u65E7\u7ED3\u679C\u4E0D\u4F1A\u4F5C\u4E3A\u5224\u65AD\u4F9D\u636E\uFF1B\u5E94\u7528\u4F1A\u6839\u636E\u5F53\u524D\u586B\u5199\u5185\u5BB9\u91CD\u65B0\u6838\u5BF9\u3002\u201C\u6821\u6838\u89C4\u5219\u201D\u8868\u53EF\u8865\u5145\u81EA\u5B9A\u4E49\u5148\u540E\u5173\u7CFB\u3002"))),o&&(x==="edit"||k&&x==="files")&&t.createElement("div",{className:"df-edit-layout"},t.createElement("section",{className:"df-paper"},t.createElement("div",{className:"df-section-head"},t.createElement("h2",null,"\u586B\u5199\u4FE1\u606F"),t.createElement("button",{onClick:()=>X("\u5BFC\u51FA Excel",async()=>{let i=await ee();await qe(`/cases/${i.id}/excel`,(i.fields.find(r=>r.key==="project.name")?.value||i.name).replace(/[<>:"/\\|?*\x00-\x1f]/g,"_").slice(0,80)+"_\u586B\u5199\u6570\u636E.xlsx")})},"\u5BFC\u51FA\u5F53\u524D Excel")),t.createElement("label",{className:"df-field df-title-field"},t.createElement("span",null,"\u8868\u5355\u540D\u79F0"),t.createElement("input",{"aria-label":"\u8868\u5355\u540D\u79F0",maxLength:120,value:o.name,onChange:i=>ge({...o,name:i.target.value})})),[...new Set(o.fields.map(i=>i.group))].map(i=>t.createElement("section",{className:"df-group",key:i},t.createElement("h3",null,i),i==="\u65E5\u671F\u5B89\u6392"&&t.createElement("p",{className:"df-muted"},"\u6587\u4E66\u7EDF\u4E00\u4F7F\u7528\u4E2D\u6587\u65E5\u671F\uFF0C\u4F8B\u5982\u201C2026\u5E7410\u670822\u65E5\u4E0B\u534814:30\u201D\u3002\u65E5\u671F\u9009\u62E9\u5668\u4FDD\u7559\u539F\u6765\u7684\u586B\u5199\u65B9\u5F0F\u3002"),t.createElement("div",{className:"df-fields"},o.fields.filter(r=>r.group===i).map(r=>t.createElement(tt,{key:r.key,field:r,displayValue:o.presentation_sources?.[r.key]===r.value?o.document_values?.[r.key]:void 0,onChange:N=>ge({...o,fields:o.fields.map(Q=>Q.key===r.key?{...Q,value:N}:Q)})})))))),t.createElement("section",{className:"df-paper"},t.createElement("div",{className:"df-section-head"},t.createElement("div",null,t.createElement("h2",null,"\u53D7\u9080\u5355\u4F4D"," ",t.createElement("span",{className:"df-count"},o.recipients.length)),t.createElement("p",null,"\u6309\u5355\u4F4D\u6587\u4E66\u5206\u522B\u751F\u6210\uFF0C\u5171\u7528\u9879\u76EE\u4E0E\u843D\u6B3E\u4FE1\u606F\u3002")),t.createElement("button",{onClick:()=>ge({...o,recipients:We([...o.recipients,{name:"",start:"",end:""}])}),disabled:o.recipients.length>=200},"\uFF0B \u6DFB\u52A0\u5355\u4F4D")),o.recipients.map((i,r)=>t.createElement("div",{className:"df-recipient",key:r,id:"df-recipient-"+r},t.createElement("div",{className:"df-recipient-title"},t.createElement("b",null,String(r+1).padStart(2,"0")),t.createElement("button",{"aria-label":`\u79FB\u9664\u7B2C${r+1}\u5BB6\u5355\u4F4D`,onClick:()=>ge({...o,recipients:We(o.recipients.filter((N,Q)=>Q!==r))})},"\u79FB\u9664")),t.createElement("div",{className:"df-fields"},[["name","\u5355\u4F4D\u540D\u79F0"],["start","\u9886\u53D6\u5F00\u59CB\u65F6\u95F4"],["end","\u9886\u53D6\u7ED3\u675F\u65F6\u95F4"]].map(([N,Q])=>t.createElement("label",{className:"df-field "+(N==="name"?"df-span":""),key:N},t.createElement("span",null,Q),t.createElement("input",{"aria-label":`\u7B2C${r+1}\u5BB6${Q}`,type:N==="name"?"text":"datetime-local",value:N==="name"?i[N]:i[N].replace(" ","T"),onChange:a=>Pe(r,N,a.target.value)}),r>0&&N!=="name"&&t.createElement("small",{className:"df-follow-state"},i["follow_"+N]?"\u8DDF\u968F\u7B2C1\u5BB6":"\u5DF2\u5355\u72EC\u8BBE\u7F6E",!i["follow_"+N]&&t.createElement("button",{type:"button","aria-label":`\u7B2C${r+1}\u5BB6${Q}\u6062\u590D\u8DDF\u968F`,onClick:a=>{a.preventDefault(),Pe(r,N,o.recipients[0][N],!0)}},"\u6062\u590D\u8DDF\u968F")))))))),t.createElement("section",{className:"df-paper df-template-panel","aria-label":"Word \u6A21\u677F"},t.createElement("div",{className:"df-section-head"},t.createElement("h2",null,"Word \u6A21\u677F"),t.createElement("div",{className:"df-template-actions"},me.length>0?t.createElement("button",{onClick:()=>X("\u4FDD\u5B58\u9ED8\u8BA4\u6A21\u677F",async()=>{let i=await ee();await ae(`/cases/${i.id}/defaults`,ve({revision:i.revision})),G(w.id==="negotiation"?"\u5DF2\u8BBE\u4E3A\u672C\u673A\u9ED8\u8BA4\u6A21\u677F\uFF0C\u4EE5\u540E\u65B0\u5EFA\u586B\u62A5\u4F1A\u81EA\u52A8\u8F7D\u5165\u3002":"\u5DF2\u8BBE\u4E3A\u672C\u9636\u6BB5\u9ED8\u8BA4\u6A21\u677F\uFF0C\u4EE5\u540E\u65B0\u5EFA\u8BE5\u9636\u6BB5\u8868\u5355\u4F1A\u81EA\u52A8\u8F7D\u5165\u3002")})},w.id==="negotiation"?"\u8BBE\u4E3A\u9ED8\u8BA4\u6A21\u677F":"\u8BBE\u4E3A\u672C\u9636\u6BB5\u9ED8\u8BA4\u6A21\u677F"):t.createElement("button",{onClick:()=>X("\u8F7D\u5165\u9ED8\u8BA4\u6A21\u677F",async()=>{let i=await ee();de(await ae(`/cases/${i.id}/defaults/apply`,ve({revision:i.revision}))),G("\u5DF2\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002")})},"\u4F7F\u7528\u9ED8\u8BA4\u6A21\u677F"),t.createElement("button",{onClick:()=>Oe.current.click()},"\uFF0B \u6DFB\u52A0"))),!me.length&&t.createElement("p",{className:"df-muted"},"\u6DFB\u52A0\u4E0E\u4F60\u7684\u53D8\u91CF\u8868\u5BF9\u5E94\u7684 .docx \u6A21\u677F\u3002"),me.map(i=>t.createElement("div",{className:"df-template",key:i.id},t.createElement("b",null,i.name),i.from_builtin&&t.createElement("small",null,"\u5E94\u7528\u81EA\u5E26\u6A21\u677F"),t.createElement("span",null,i.per_recipient?"\u6309\u53D7\u9080\u5355\u4F4D\u5206\u522B\u751F\u6210":"\u5171\u7528\u6587\u4EF6 \xB7 \u751F\u6210\u4E00\u4EFD"),i.print_copies>1&&t.createElement("small",null,"\u5EFA\u8BAE\u6253\u5370 ",i.print_copies," \u4EFD \xB7 ",i.print_note),t.createElement("small",null,i.keys.length," \u4E2A\u5F15\u7528\u53D8\u91CF"),t.createElement("button",{"aria-label":"\u79FB\u9664\u6A21\u677F"+i.name,onClick:()=>X("\u79FB\u9664\u6A21\u677F",async()=>{let r=await ee();de(await ae(`/cases/${r.id}/templates/${i.id}?revision=${r.revision}`,{method:"DELETE"}))})},"\u79FB\u9664")))),t.createElement("section",{className:"df-paper df-edit-footer","aria-label":"\u6838\u5BF9\u4E0E\u751F\u6210"},t.createElement("div",{className:"df-generation-plan"},t.createElement("h2",null,"\u6838\u5BF9\u4E0E\u751F\u6210"),t.createElement("p",null,"\u672C\u6B21\u8BA1\u5212\u751F\u6210 ",t.createElement("b",null,$)," \u4EFD\u6587\u4E66"),t.createElement("small",null,me.filter(i=>!i.per_recipient).length," ","\u4EFD\u5171\u7528\u6587\u4EF6 \xB7"," ",me.filter(i=>i.per_recipient).length," ","\u7C7B\u6309\u5355\u4F4D\u6587\u4E66 \xD7 ",o.recipients.length," \u5BB6\u5355\u4F4D")),t.createElement("div",{className:"df-next-action"},t.createElement("button",{className:"df-primary",onClick:H},"\u6838\u5BF9\u586B\u5199\u5185\u5BB9 \u2192"),t.createElement("small",null,"\u5148\u6838\u5BF9\u7F3A\u9879\u4E0E\u65E5\u671F\uFF0C\u518D\u786E\u8BA4\u751F\u6210")))),o&&x==="review"&&W&&t.createElement("div",{className:"df-review"},t.createElement("section",{className:"df-paper"},t.createElement("span",{className:"df-eyebrow"},"\u586B\u5199\u6838\u5BF9"),t.createElement("h2",null,W.can_generate?"\u8D44\u6599\u5DF2\u9F50\u5907\uFF0C\u8BF7\u786E\u8BA4\u672C\u6B21\u5185\u5BB9\u3002":`\u8FD8\u6709 ${we.length} \u9879\u9700\u8981\u5904\u7406`),t.createElement("p",null,"\u672C\u6B21\u4F7F\u7528\u4FEE\u8BA2 ",o.revision," \u7684\u6570\u636E\uFF0C\u8BA1\u5212\u751F\u6210 ",$," ","\u4EFD\u6587\u4E66\u3002"),we.length>0&&t.createElement("div",{className:"df-checks"},we.map((i,r)=>t.createElement("div",{key:r,className:"df-check "+i.status},t.createElement("span",null,i.status==="ok"?"\u901A\u8FC7":i.status==="missing"?"\u5F85\u8865\u5145":"\u51B2\u7A81"),t.createElement("div",null,t.createElement("b",null,i.label),t.createElement("p",null,i.detail)),i.status!=="ok"&&i.field&&t.createElement("button",{onClick:()=>ke(i.field)},"\u4FEE\u6539")))),W.checks.some(i=>i.status==="ok")&&t.createElement("details",{className:"df-passed"},t.createElement("summary",null,W.checks.filter(i=>i.status==="ok").length," ","\u9879\u65E5\u671F\u6821\u6838\u901A\u8FC7 \xB7 \u67E5\u770B\u660E\u7EC6"),W.checks.filter(i=>i.status==="ok").map((i,r)=>t.createElement("p",{key:r},t.createElement("b",null,i.label),t.createElement("br",null),i.detail.replaceAll("T"," ")))),t.createElement("div",{className:"df-review-data"},t.createElement("h3",null,"\u5171\u7528\u4FE1\u606F"),t.createElement("dl",null,o.fields.map(i=>t.createElement("div",{key:i.key,className:et(i)?"df-span":void 0},t.createElement("dt",null,i.label),t.createElement("dd",null,(o.document_values?.[i.key]??i.value)||"\u5C1A\u672A\u586B\u5199")))),o.recipients.length>0&&t.createElement(t.Fragment,null,t.createElement("h3",null,"\u53D7\u9080\u5355\u4F4D"),o.recipients.map((i,r)=>t.createElement("p",{key:r},r+1,". ",i.name||"\u5C1A\u672A\u586B\u5199",o.recipient_document_times?.[r]??`${i.start.replace("T"," ")} \u2014 ${i.end.replace("T"," ")}`)))),t.createElement("div",{className:"df-review-data"},t.createElement("h3",null,"\u8F93\u51FA\u6E05\u5355"),me.map(i=>t.createElement("p",{key:i.id},i.name," \xB7"," ",i.per_recipient?o.recipients.map(r=>r.name||"\u5F85\u586B\u5355\u4F4D").join("\u3001"):"\u5171\u7528\u6587\u4EF6",i.print_copies>1&&` \xB7 \u5EFA\u8BAE\u6253\u5370 ${i.print_copies} \u4EFD\uFF0C\u6BCF\u4F4D\u4E13\u5BB6\u4E00\u4EFD`))),t.createElement("div",{className:"df-confirm"},t.createElement("label",null,t.createElement("input",{type:"checkbox",checked:D,disabled:!W.can_generate,onChange:i=>ie(i.target.checked)}),"\u6211\u5DF2\u6838\u5BF9\u586B\u5199\u5185\u5BB9\u3001\u53D7\u9080\u5355\u4F4D\u548C\u65E5\u671F\u5B89\u6392"),t.createElement("p",null,"\u6821\u6838\u68C0\u67E5\u8D44\u6599\u5B8C\u6574\u6027\u53CA\u65F6\u95F4\u987A\u5E8F\u3002\u4E1A\u52A1\u6761\u6B3E\u4E0E Word \u6A21\u677F\u8BF7\u7531\u7ECF\u529E\u4EBA\u590D\u6838\u3002"),t.createElement("div",null,t.createElement("button",{onClick:()=>{y("edit"),ie(!1)}},"\u8FD4\u56DE\u4FEE\u6539"),t.createElement("button",{className:"df-primary",disabled:!W.can_generate||!D,onClick:Me},"\u786E\u8BA4\u5E76\u751F\u6210 ",$," \u4EFD\u6587\u4E66"))))),o&&x==="files"&&J&&!k&&t.createElement("div",{className:"df-results"},t.createElement("section",{className:"df-paper df-output-list"},t.createElement("span",{className:"df-eyebrow"},"\u751F\u6210\u8BB0\u5F55"),t.createElement("h2",null,J.files.length," \u4EFD\u6587\u4EF6\u5DF2\u751F\u6210"),t.createElement("p",null,Te(J.created_at)," \xB7 \u4FEE\u8BA2 ",J.revision),t.createElement("p",{className:"df-muted"},"\u538B\u7F29\u5305\u5305\u542B Word\u3001\u586B\u5199\u6570\u636E\u548C\u6838\u5BF9\u8BB0\u5F55"),(l||(J.content_digest?J.content_digest!==o.content_digest:J.revision!==o.revision))&&t.createElement("div",{className:"df-alert"},"\u586B\u5199\u5185\u5BB9\u5DF2\u6709\u4FEE\u6539\uFF0C\u4E0B\u5217\u6587\u4EF6\u4FDD\u7559\u751F\u6210\u65F6\u7684\u5185\u5BB9\u3002\u8BF7\u91CD\u65B0\u6838\u5BF9\u5E76\u751F\u6210\u65B0\u7248\u3002"),o.generations.map(i=>t.createElement("div",{className:"df-generation",key:i.id},t.createElement("div",{className:"df-generation-heading"},t.createElement("h3",null,Te(i.created_at)," \xB7 \u4FEE\u8BA2 ",i.revision,i.date_style!=="zh-CN"&&" \xB7 \u539F\u65E5\u671F\u683C\u5F0F",i.naming_style!=="formal"&&" \xB7 \u539F\u6587\u4EF6\u540D"),t.createElement("button",{"aria-label":`\u6253\u5305\u4E0B\u8F7D ${Te(i.created_at)} \u4FEE\u8BA2 ${i.revision}`,onClick:()=>je(i)},"\u6253\u5305\u4E0B\u8F7D")),i.files.map(r=>t.createElement("div",{className:"df-output "+(I?.file.name===r.name&&I?.generation.id===i.id?"selected":""),key:r.name},t.createElement("button",{onClick:()=>Y({file:r,generation:i})},t.createElement("b",null,r.name),t.createElement("small",null,r.recipient," \xB7 ",(r.size/1024).toFixed(0)," KB",r.print_copies>1&&` \xB7 \u5EFA\u8BAE\u6253\u5370 ${r.print_copies} \u4EFD`)),t.createElement("button",{"aria-label":"\u4E0B\u8F7D"+r.name,onClick:()=>X("\u4E0B\u8F7D\u6587\u4EF6",()=>qe(re(i,r.name),r.name))},"\u2193")))))),t.createElement("section",{className:"df-paper df-preview"},t.createElement("div",{className:"df-section-head"},t.createElement("h2",null,I?I.file.name:"\u9009\u62E9\u6587\u4EF6\u9884\u89C8"),t.createElement("span",null,"Office \u9884\u89C8")),t.createElement("div",{className:"df-preview-body"},oe&&Le?t.createElement(Ie,{key:oe.id,artifact:oe},t.createElement(Le,{key:oe.id,artifact:oe,readOnly:!0,hostControls:!0})):t.createElement("p",{className:"df-muted"},oe?"\u6B63\u5728\u6253\u5F00\u6587\u4EF6\u2026":"\u4ECE\u5DE6\u4FA7\u9009\u62E9\u4E00\u4EFD\u6587\u4EF6\u3002"))))),t.createElement("footer",{className:"df-footer"},t.createElement("span",null,"UGSci \xB7 \u6587\u4E66\u586B\u62A5"),t.createElement("span",null,"\u6570\u636E\u4E0E\u6587\u4E66\u4FDD\u5B58\u5728\u5F53\u524D\u670D\u52A1\u7AEF \xB7 \u65E0\u9700\u6A21\u578B\u670D\u52A1"))),E&&o&&t.createElement("div",{className:"df-dialog-backdrop"},t.createElement("section",{className:"df-dialog df-paper",role:"dialog","aria-modal":"true","aria-label":"\u6838\u5BF9\u5171\u7528\u8D44\u6599"},t.createElement("div",{className:"df-section-head"},t.createElement("h2",null,E==="adopt"?"\u91C7\u7528\u9879\u76EE\u5E95\u7A3F\u4E2D\u7684\u8D44\u6599":"\u5C06\u672C\u8868\u8D44\u6599\u5B58\u5165\u9879\u76EE\u5E95\u7A3F"),t.createElement("button",{disabled:!!M,onClick:()=>T(null),"aria-label":"\u5173\u95ED\u5171\u7528\u8D44\u6599\u6838\u5BF9"},"\xD7")),t.createElement("p",{className:"df-muted"},"\u53EA\u66F4\u65B0\u52FE\u9009\u9879\u3002\u539F\u751F\u6210\u6587\u4EF6\u4FDD\u7559\uFF0C\u540E\u7EED\u751F\u6210\u524D\u9700\u91CD\u65B0\u6838\u5BF9\u3002"),U&&t.createElement("p",{role:"alert",className:"df-alert error"},U),t.createElement("div",{className:"df-compare"},n.fields.filter(i=>o.fields.some(r=>r.key===i.key&&r.value!==i.value)).map(i=>{let r=o.fields.find(N=>N.key===i.key);return t.createElement("label",{key:i.key},t.createElement("input",{type:"checkbox",checked:z.includes(i.key),onChange:N=>L(N.target.checked?[...z,i.key]:z.filter(Q=>Q!==i.key))}),t.createElement("div",null,t.createElement("b",null,i.label),t.createElement("div",{className:"df-compare-values"},t.createElement("p",null,t.createElement("small",null,"\u5F53\u524D\u8868\u5355"),r.value||"\u7A7A\u767D"),t.createElement("p",null,t.createElement("small",null,"\u9879\u76EE\u5E95\u7A3F"),i.value||"\u7A7A\u767D"))))}),!n.fields.some(i=>o.fields.some(r=>r.key===i.key&&r.value!==i.value))&&t.createElement("p",null,"\u672C\u8868\u4E0E\u9879\u76EE\u5E95\u7A3F\u4E2D\u7684\u5171\u7528\u8D44\u6599\u4E00\u81F4\u3002")),t.createElement("div",{className:"df-actions"},t.createElement("button",{disabled:!!M,onClick:()=>T(null)},"\u53D6\u6D88"),t.createElement("button",{className:"df-primary",disabled:!!M||!z.length,onClick:()=>X("\u540C\u6B65\u5171\u7528\u8D44\u6599",async()=>{let i=await ee();if(E==="adopt")de(await ae(`/projects/${n.id}/cases/${i.id}/sync`,ve({revision:n.revision,case_revision:i.revision,keys:z})));else{let r=Object.fromEntries(i.fields.filter(N=>z.includes(N.key)).map(N=>[N.key,N.value]));await ae(`/projects/${n.id}`,{...ve({revision:n.revision,name:r["project.name"]??n.name,code:r["project.code"]??n.code,owner:n.owner,values:r}),method:"PUT"})}await K(),T(null),G("\u6240\u9009\u8D44\u6599\u5DF2\u540C\u6B65\uFF0C\u8BF7\u91CD\u65B0\u6838\u5BF9\u540E\u751F\u6210\u65B0\u7248\u6587\u4E66\u3002")})},E==="adopt"?"\u91C7\u7528\u6240\u9009\u9879\u76EE\u8D44\u6599":"\u4FDD\u5B58\u6240\u9009\u8D44\u6599\u5230\u5E95\u7A3F")))))}function ut(){let n=fe.host.useSelectedAgent?.();return t.createElement(Ge,{key:n?.id||fe.host.getSelectedAgentId?.()||"default",Editor:ct,services:{request:ae,json:ve,download:qe,time:Te,Field:tt}})}fe.registerRoutes("document-forms",[{path:"/apps/document-forms",component:ut,label:"\u6587\u4E66\u586B\u62A5",icon:"\u25A4"}]);})();
