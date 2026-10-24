(()=>{var A=window.QwenPaw.host.React,{useEffect:pt,useState:be}=A;function Je({artifact:n,children:h}){return n.extension==="xlsx"?h:A.createElement(Nt,{artifact:n},h)}function Nt({artifact:n,children:h}){let[s,v]=be("print"),[l,w]=be([]),[c,x]=be(0),[g,z]=be(""),[d,_]=be(0),[E,X]=be(100);return pt(()=>{if(s!=="print")return;let U=new AbortController,o=[];return w([]),x(0),z(""),window.QwenPaw.host.fetch(n.printUrl+"?pages=true",{headers:n.agentId?{"X-Agent-Id":n.agentId}:{},signal:U.signal}).then(async P=>{if(!P.ok){let L=await P.json().catch(()=>({}));throw new Error(typeof L.detail=="string"?L.detail:"\u6253\u5370\u9884\u89C8\u6682\u4E0D\u53EF\u7528\uFF0C\u53EF\u5207\u6362\u6587\u5B57\u9884\u89C8\u6216\u4E0B\u8F7D Word \u67E5\u770B")}let{pages:D}=await P.json();if(!U.signal.aborted){if(!Number.isInteger(D)||D<1||D>40)throw new Error("\u672A\u83B7\u5F97\u6709\u6548\u7684 Word \u9875\u6570");x(D);for(let L=1;L<=D;L++){let M=await window.QwenPaw.host.fetch(n.printUrl+"?page="+L,{headers:n.agentId?{"X-Agent-Id":n.agentId}:{},signal:U.signal});if(!M.ok)throw new Error(`\u7B2C ${L} \u9875\u672A\u80FD\u6E32\u67D3\uFF0C\u8BF7\u91CD\u65B0\u9884\u89C8`);let F=await M.blob();if(U.signal.aborted)return;let b=URL.createObjectURL(F);o.push(b),w(S=>[...S,b])}}}).catch(P=>{U.signal.aborted||z(P.message||"\u6253\u5370\u9884\u89C8\u672A\u5B8C\u6210")}),()=>{U.abort(),o.forEach(P=>URL.revokeObjectURL(P))}},[n.id,n.printUrl,n.agentId,s,d]),A.createElement("div",{className:"df-print-preview"},A.createElement("div",{className:"df-print-toolbar"},A.createElement("div",null,A.createElement("button",{"aria-pressed":s==="print",onClick:()=>v("print")},"\u6253\u5370\u7248\u5F0F"),A.createElement("button",{"aria-pressed":s==="text",onClick:()=>v("text")},"\u6587\u5B57\u9884\u89C8")),s==="print"&&A.createElement("div",null,c>0&&A.createElement("span",null,"\u5171 ",c," \u9875"),A.createElement("select",{"aria-label":"\u9884\u89C8\u6BD4\u4F8B",value:E,onChange:U=>X(Number(U.target.value))},A.createElement("option",{value:100},"\u9002\u5408\u5BBD\u5EA6"),A.createElement("option",{value:125},"125%"),A.createElement("option",{value:150},"150%"),A.createElement("option",{value:200},"200%")))),s==="text"?A.createElement("div",{className:"df-text-preview"},h):g?A.createElement("div",{className:"df-preview-message",role:"alert"},A.createElement("p",null,g),A.createElement("button",{onClick:()=>_(U=>U+1)},"\u91CD\u65B0\u9884\u89C8")):l.length?A.createElement("div",{className:"df-print-scroll"},A.createElement("div",{className:"df-print-pages",style:{width:E+"%"}},l.map((U,o)=>A.createElement("figure",{key:o},A.createElement("figcaption",null,"\u7B2C ",o+1," \u9875"),A.createElement("img",{src:U,alt:n.title+` \xB7 \u6253\u5370\u7248\u5F0F \xB7 \u7B2C ${o+1} \u9875`}))),l.length<c&&A.createElement("p",{role:"status"},"\u6B63\u5728\u6392\u7248\u7B2C ",l.length+1," \u9875\u2026"))):A.createElement("div",{className:"df-preview-message",role:"status"},"\u6B63\u5728\u6392\u7248\u6253\u5370\u9875\u9762\u2026"))}function ge({artifact:n}){let[h,s]=be(null),[v,l]=be(""),[w,c]=be(0);if(pt(()=>{let g=new AbortController;return s(null),l(""),window.QwenPaw.host.fetch("/workspace/convert-office",{method:"POST",headers:{"Content-Type":"application/json",...n.agentId?{"X-Agent-Id":n.agentId}:{}},signal:g.signal,body:JSON.stringify({url:n.binaryUrl,mime_type:n.mimeType})}).then(async z=>{let d=await z.json();if(!z.ok)throw new Error(typeof d.detail=="string"?d.detail:"\u6587\u4EF6\u9884\u89C8\u672A\u5B8C\u6210");g.signal.aborted||s(d)}).catch(z=>{g.signal.aborted||l(z.message||"\u6587\u4EF6\u9884\u89C8\u672A\u5B8C\u6210")}),()=>g.abort()},[n.id,n.binaryUrl,n.mimeType,n.agentId,w]),v)return A.createElement("div",{className:"df-preview-message",role:"alert"},A.createElement("p",null,v),A.createElement("button",{onClick:()=>c(g=>g+1)},"\u91CD\u65B0\u9884\u89C8"),A.createElement("p",null,"\u4E5F\u53EF\u4EE5\u4ECE\u6587\u4EF6\u6E05\u5355\u4E0B\u8F7D\u540E\u67E5\u770B\u3002"));if(!h)return A.createElement("div",{className:"df-preview-message",role:"status"},"\u6B63\u5728\u6253\u5F00\u6587\u4EF6\u2026");let x=h.engine==="officecli"?h.html:`<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;color:#333;background:#fff;padding:24px 32px;line-height:1.7;max-width:900px;margin:0 auto}table{border-collapse:collapse;width:100%;margin:12px 0}td,th{border:1px solid #ddd;padding:8px 12px}img{max-width:100%;height:auto}h1{font-size:1.6em}h2{font-size:1.3em}.docx-page-break{border-top:2px dashed #ccc;margin:32px 0}</style></head><body>${h.html||""}</body></html>`;return A.createElement("iframe",{className:"df-office-frame",title:n.title,srcDoc:x,sandbox:h.engine==="officecli"?"allow-scripts":"allow-same-origin"})}var ft=`.df-app {
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
.df-field em {
  font-size: 13px;
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

.df-plan-reference {
  margin: 22px 0;
  padding: 16px 0;
  border-top: 1px solid var(--df-line);
  border-bottom: 1px solid var(--df-line);
}
.df-plan-reference details > summary {
  cursor: pointer;
  font-size: 13px;
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
  font-size: 13px !important;
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
.df-field-help {
  font-family: inherit;
  font-size: 13px !important;
}
.df-field-help summary,
.df-stage-help summary {
  cursor: pointer;
  color: var(--df-muted);
}
.df-field-help p,
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
`;var Ye=window.QwenPaw,y=Ye.host.React,{useState:xe,useEffect:Ct}=y,mt={running:"\u6B63\u5728\u6838\u67E5",completed:"\u6838\u67E5\u5B8C\u6210",failed:"\u672A\u5B8C\u6210",interrupted:"\u5DF2\u4E2D\u65AD"},ct=".doc,.docx,.pdf,.xls,.xlsx,.png,.jpg,.jpeg";function Ke({project:n,services:h,onChanged:s}){let{request:v,download:l,time:w}=h,[c,x]=xe(null),[g,z]=xe(""),[d,_]=xe(null),[E,X]=xe([]),[U,o]=xe(""),[P,D]=xe(""),[L,M]=xe(!1),[F,b]=xe(""),[S,W]=xe(0);Ct(()=>{let p=!0,C,oe=!1;async function Q(){try{let ee=await v(`/projects/${n.id}/response-reviews`);if(!p)return;x(ee),b("");let K=ee.records.some(N=>N.status==="running");oe&&!K&&s(),oe=K,K&&(C=setTimeout(Q,3e3))}catch(ee){p&&b(ee.message)}}return Q(),()=>{p=!1,clearTimeout(C)}},[n.id,S]);let H=c?.records.some(p=>p.status==="running"),T=c?.records.find(p=>p.id===P)||c?.records[0],u=Ye.host.ReactMarkdown;async function O(p){p.preventDefault(),b(""),M(!0);try{let C=new FormData;g?C.set("reference_id",g):d&&C.set("reference",d);for(let Q of E)C.append("responses",Q);C.set("focus",U);let oe=await v(`/projects/${n.id}/response-reviews`,{method:"POST",body:C});D(oe.id),x(Q=>({...Q,records:[oe,...Q?.records||[]]})),W(Q=>Q+1)}catch(C){b(C.message)}finally{M(!1)}}return y.createElement("div",{className:"df-response-review"},y.createElement("p",{className:"df-muted"},"\u5BF9\u7167\u8C08\u5224\u6587\u4EF6\uFF0C\u9010\u5BB6\u68C0\u67E5\u8D44\u8D28\u3001\u6280\u672F\u54CD\u5E94\u3001\u62A5\u4EF7\u3001\u65E5\u671F\u4E0E\u7B7E\u7AE0\u9644\u4EF6\u3002\u6838\u67E5\u610F\u89C1\u4F9B\u7ECF\u529E\u4EBA\u548C\u4E13\u5BB6\u590D\u6838\u3002"),F&&y.createElement("div",{className:"df-alert error",role:"alert"},F,y.createElement("button",{onClick:()=>W(p=>p+1)},"\u91CD\u65B0\u52A0\u8F7D")),c?y.createElement(y.Fragment,null,y.createElement("form",{onSubmit:O},y.createElement("fieldset",{disabled:L||H},y.createElement("label",{className:"df-field"},y.createElement("span",null,"\u6838\u67E5\u4F9D\u636E"),y.createElement("select",{"aria-label":"\u6838\u67E5\u4F9D\u636E",value:g,onChange:p=>{z(p.target.value),_(null)}},y.createElement("option",{value:""},"\u4E0A\u4F20\u6B63\u5F0F\u8C08\u5224\u6587\u4EF6"),c.references.map(p=>y.createElement("option",{key:p.id,value:p.id},p.label)))),!g&&y.createElement("label",{className:"df-field"},y.createElement("span",null,"\u6B63\u5F0F\u8C08\u5224\u6587\u4EF6"),y.createElement("input",{"aria-label":"\u4E0A\u4F20\u6838\u67E5\u4F9D\u636E",type:"file",accept:ct,required:!0,onChange:p=>_(p.target.files[0]||null)})),y.createElement("label",{className:"df-field"},y.createElement("span",null,"\u5404\u5355\u4F4D\u54CD\u5E94\u6750\u6599"),y.createElement("input",{"aria-label":"\u4E0A\u4F20\u54CD\u5E94\u6750\u6599",type:"file",multiple:!0,required:!0,accept:ct,onChange:p=>X([...p.target.files])})),E.length>0&&y.createElement("ul",{className:"df-review-files"},E.map((p,C)=>y.createElement("li",{key:C},p.name))),y.createElement("p",{className:"df-muted"},"\u652F\u6301 Word\u3001PDF\u3001Excel \u548C\u56FE\u7247\uFF1B\u53EF\u4E00\u6B21\u9009\u62E9\u591A\u5BB6\u6750\u6599\u3002\u6BCF\u4EFD\u4E0D\u8D85\u8FC7 15 MB\uFF0C\u6BCF\u6B21\u6700\u591A 20 \u4EFD\u3001\u5408\u8BA1 100 MB\u3002\u538B\u7F29\u5305\u8BF7\u5148\u89E3\u538B\u3002"),y.createElement("label",{className:"df-field"},y.createElement("span",null,"\u8865\u5145\u5173\u6CE8\u70B9\uFF08\u9009\u586B\uFF09"),y.createElement("textarea",{"aria-label":"\u8865\u5145\u6838\u67E5\u5173\u6CE8\u70B9",rows:3,maxLength:3e3,value:U,onChange:p=>o(p.target.value),placeholder:"\u4F8B\u5982\uFF1A\u91CD\u70B9\u6838\u5BF9\u62A5\u4EF7\u5927\u5C0F\u5199\u3001\u6210\u679C\u4EA4\u4ED8\u65F6\u95F4\u548C\u8D44\u8D28\u6709\u6548\u671F"})),y.createElement("div",{className:"df-actions"},y.createElement("button",{className:"df-primary",disabled:L||H||!(g||d)||!E.length},L?"\u6B63\u5728\u63D0\u4EA4\u2026":"\u5F00\u59CB\u6838\u67E5"),y.createElement("span",{className:"df-muted"},"\u4F7F\u7528\u201C\u54CD\u5E94\u6587\u4EF6\u6838\u67E5\u201D\u667A\u80FD\u4F53\uFF0C\u6CBF\u7528\u8F6F\u4EF6\u4E2D\u7684\u6A21\u578B\u914D\u7F6E\u3002")))),c.records.length>0&&y.createElement("section",{className:"df-review-history"},y.createElement("div",{className:"df-section-head"},y.createElement("h3",null,"\u6838\u67E5\u8BB0\u5F55"),y.createElement("button",{onClick:()=>W(p=>p+1)},"\u5237\u65B0\u8BB0\u5F55")),y.createElement("div",{className:"df-review-records"},c.records.map(p=>y.createElement("button",{key:p.id,"aria-pressed":T?.id===p.id,onClick:()=>D(p.id)},w(p.created_at)," \xB7 ",mt[p.status]))),T&&y.createElement("article",{"aria-label":"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5\u7ED3\u679C"},y.createElement("div",{className:"df-section-head"},y.createElement("div",null,y.createElement("b",null,mt[T.status]),y.createElement("p",{className:"df-muted"},"\u57FA\u4E8E\u9879\u76EE\u4FEE\u8BA2 ",T.project_revision," \xB7"," ",T.files.length," \u4EFD\u6750\u6599\uFF1B\u540E\u7EED\u6750\u6599\u4FEE\u6539\u8BF7\u91CD\u65B0\u6838\u67E5\u3002")),T.status==="completed"&&y.createElement("button",{onClick:async()=>{try{await l(`/projects/${n.id}/response-reviews/${T.id}/report`,`${n.name}_\u54CD\u5E94\u6587\u4EF6\u6838\u67E5\u8BB0\u5F55_${T.id.slice(0,8)}.md`)}catch(p){b(p.message)}}},"\u4E0B\u8F7D\u6838\u67E5\u8BB0\u5F55")),y.createElement("details",null,y.createElement("summary",null,"\u672C\u6B21\u6838\u67E5\u6750\u6599\u4E0E\u5173\u6CE8\u70B9"),y.createElement("ul",null,T.files.map((p,C)=>y.createElement("li",{key:C},p.role,"\uFF1A",p.name))),y.createElement("p",null,T.focus||"\u65E0\u8865\u5145\u5173\u6CE8\u70B9")),T.status==="running"&&y.createElement("p",{role:"status",className:"df-alert"},"\u6B63\u5728\u8BFB\u53D6\u5E76\u6838\u67E5\u6750\u6599\uFF0C\u53EF\u5173\u95ED\u6B64\u7A97\u53E3\uFF0C\u7A0D\u540E\u56DE\u5230\u672C\u9879\u76EE\u67E5\u770B\u7ED3\u679C\u3002"),T.error&&y.createElement("p",{role:"alert",className:"df-alert error"},T.error),T.report&&y.createElement("div",{className:"df-review-report"},u?y.createElement(u,{remarkPlugins:Ye.host.remarkGfm?[Ye.host.remarkGfm]:[],components:{a:({children:p})=>y.createElement("span",null,p),img:()=>null}},T.report):y.createElement("div",{style:{whiteSpace:"pre-wrap"}},T.report))))):y.createElement("p",{role:"status"},"\u6B63\u5728\u8BFB\u53D6\u6838\u67E5\u8BB0\u5F55\u2026"))}var Le=window.QwenPaw,m=Le.host.React,{useState:Ce,useEffect:dt,useRef:ut}=m;function zt(n,h,s){return{artifact:{id:h.id+s.name,title:s.name,source:"generated",extension:s.name.endsWith(".xlsx")?"xlsx":"docx",mimeType:s.name.endsWith(".xlsx")?"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":"application/vnd.openxmlformats-officedocument.wordprocessingml.document",binaryUrl:s.preview_url,printUrl:`/document-forms/cases/${n.case_id}/print/${h.id}/${encodeURIComponent(s.name)}`,agentId:Le.host.getSelectedAgentId?.(),createdAt:Date.parse(h.created_at)},reference:{case_id:n.case_id,generation_id:h.id,name:s.name}}}function jt({project:n,stageId:h,selection:s,services:v}){let{request:l,json:w,time:c}=v,[x,g]=Ce([]),[z,d]=Ce(""),[_,E]=Ce(!1),[X,U]=Ce(""),[o,P]=Ce(0),D=ut(null);dt(()=>{let b=!0,S;async function W(){try{let H=await l(`/projects/${n.id}/assistant`);if(!b)return;g(H.messages),U(""),H.messages.some(T=>T.status==="running")&&(S=setTimeout(W,2500))}catch(H){b&&U(H.message)}}return W(),()=>{b=!1,clearTimeout(S)}},[n.id,o]),dt(()=>{D.current?.scrollIntoView?.({block:"nearest"})},[x.length,x.at(-1)?.status]);let L=_||x.some(b=>b.status==="running"),M=Le.host.ReactMarkdown;async function F(b){if(b.preventDefault(),!(!z.trim()||L)){E(!0),U("");try{let S=await l(`/projects/${n.id}/assistant`,w({message:z.trim(),stage_id:h||"overview",file:s?.reference||{}}));g(W=>[...W,S]),d(""),P(W=>W+1)}catch(S){U(S.message)}finally{E(!1)}}}return m.createElement("section",{className:"df-project-chat","aria-label":"\u9879\u76EE\u667A\u80FD\u4F53\u95EE\u7B54"},m.createElement("div",{className:"df-chat-messages","aria-live":"polite"},!x.length&&m.createElement("div",{className:"df-chat-welcome"},["\u672C\u9636\u6BB5\u8FD8\u9700\u8981\u51C6\u5907\u54EA\u4E9B\u6750\u6599\uFF1F","\u5E2E\u6211\u6838\u5BF9\u5F53\u524D\u6587\u4EF6\u4E2D\u7684\u65E5\u671F\u548C\u91D1\u989D\u3002"].map(b=>m.createElement("button",{key:b,onClick:()=>d(b)},b))),x.map(b=>m.createElement("article",{className:"df-chat-turn",key:b.id},m.createElement("div",{className:"df-chat-question"},m.createElement("small",null,"\u6211 \xB7 ",c(b.created_at)),m.createElement("p",null,b.message),b.file_name&&m.createElement("small",null,"\u53C2\u8003\u6587\u4EF6\uFF1A",b.file_name)),b.reply&&m.createElement("div",{className:"df-chat-answer"},m.createElement("small",null,"\u9879\u76EE\u52A9\u624B"),M?m.createElement(M,{remarkPlugins:Le.host.remarkGfm?[Le.host.remarkGfm]:[],components:{img:()=>null,a:({children:S})=>m.createElement("span",null,S)}},b.reply):m.createElement("p",{style:{whiteSpace:"pre-wrap"}},b.reply)),b.status==="running"&&m.createElement("p",{role:"status",className:"df-muted"},"\u6B63\u5728\u7ED3\u5408\u9879\u76EE\u8D44\u6599\u6574\u7406\u56DE\u7B54\u2026"),b.error&&m.createElement("p",{role:"alert",className:"df-alert error"},b.error))),m.createElement("div",{ref:D})),X&&m.createElement("p",{role:"alert",className:"df-alert error"},X,m.createElement("button",{onClick:()=>P(b=>b+1)},"\u91CD\u65B0\u52A0\u8F7D")),m.createElement("form",{className:"df-chat-composer",onSubmit:F},s&&m.createElement("small",{className:"df-chat-context"},"\u53C2\u8003\u6587\u4EF6\uFF1A",s.artifact.title),m.createElement("textarea",{"aria-label":"\u5411\u9879\u76EE\u667A\u80FD\u4F53\u63D0\u95EE",placeholder:"\u8F93\u5165\u5F53\u524D\u9879\u76EE\u7684\u95EE\u9898\u2026",rows:3,maxLength:4e3,value:z,onChange:b=>d(b.target.value)}),m.createElement("div",{className:"df-actions"},m.createElement("button",{className:"df-primary",disabled:L||!z.trim()},L?"\u6B63\u5728\u56DE\u7B54\u2026":"\u53D1\u9001\u95EE\u9898"))))}function rt({collapsed:n=!1,width:h,maxWidth:s,onResize:v,onToggle:l,project:w,stageId:c,services:x,mode:g,onMode:z,selection:d,onSelect:_,attachment:E,AttachmentPreview:X,onChanged:U,dirty:o=!1}){let P=ut(null),[D,L]=Ce(!1),M=()=>{P.current=null,L(!1)},[F,b]=Ce(null),[S,W]=Ce("");async function H(u,O){try{W(""),await x.download(u,O)}catch(p){W(p.message)}}dt(()=>{let u=!0;return(Le.workspace?.loadPreview?Le.workspace.loadPreview():Promise.resolve(ge)).then(O=>u&&b(()=>O)).catch(()=>u&&b(()=>ge)),()=>{u=!1}},[]);let T=w.forms.flatMap(u=>u.generations.flatMap(O=>c&&c!=="overview"&&c!=="profile"&&(O.stage_id||u.original_stage_id||u.stage_id)!==c?[]:[{form:u,generation:O}]));return m.createElement("aside",{className:"df-right-workspace"+(n?" df-pane-collapsed":"")+(D?" df-resizing":""),"aria-label":"\u9879\u76EE\u667A\u80FD\u4F53\u4E0E\u6587\u4EF6\u9884\u89C8"},m.createElement("div",{className:"df-dock-resizer",role:"separator","aria-label":"\u8C03\u6574\u95EE\u7B54\u4E0E\u9884\u89C8\u680F\u5BBD\u5EA6","aria-orientation":"vertical","aria-valuemin":300,"aria-valuemax":s,"aria-valuenow":h,"aria-valuetext":h+" \u50CF\u7D20",tabIndex:0,title:"\u5DE6\u53F3\u62D6\u52A8\u8C03\u6574\u5BBD\u5EA6\uFF1B\u53CC\u51FB\u6062\u590D\u9ED8\u8BA4\u5BBD\u5EA6",onPointerDown:u=>{u.button===0&&(u.preventDefault(),P.current={x:u.clientX,width:h,pointer:u.pointerId},u.currentTarget.setPointerCapture?.(u.pointerId),L(!0))},onPointerMove:u=>{P.current&&P.current.pointer===u.pointerId&&v(P.current.width+P.current.x-u.clientX)},onPointerUp:M,onPointerCancel:M,onLostPointerCapture:M,onDoubleClick:()=>v(500),onKeyDown:u=>{let O={ArrowLeft:h+24,ArrowRight:h-24,Home:300,End:s}[u.key];O!==void 0&&(u.preventDefault(),v(O))}}),m.createElement("button",{className:"df-pane-toggle","aria-label":n?"\u5C55\u5F00\u95EE\u7B54\u4E0E\u9884\u89C8\u680F":"\u6536\u8D77\u95EE\u7B54\u4E0E\u9884\u89C8\u680F","aria-expanded":!n,title:n?"\u5C55\u5F00\u95EE\u7B54\u4E0E\u9884\u89C8\u680F":"\u6536\u8D77\u95EE\u7B54\u4E0E\u9884\u89C8\u680F",onClick:l},m.createElement("span",{"aria-hidden":"true"},n?"\u2039":"\u203A"),m.createElement("span",null,n?"\u95EE\u7B54\u4E0E\u9884\u89C8":"\u6536\u8D77")),m.createElement("header",null,m.createElement("div",null,m.createElement("h2",null,g==="preview"?"\u6587\u4EF6\u9884\u89C8":g==="review"?"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5":"\u9879\u76EE\u95EE\u7B54")),m.createElement("div",{className:"df-dock-tabs",role:"tablist","aria-label":"\u53F3\u4FA7\u5DE5\u4F5C\u533A"},m.createElement("button",{role:"tab","aria-selected":g==="assistant",onClick:()=>z("assistant")},"\u95EE\u7B54"),m.createElement("button",{role:"tab","aria-selected":g==="preview",onClick:()=>z("preview")},"\u9884\u89C8"))),S&&m.createElement("p",{role:"alert",className:"df-alert error"},S),m.createElement("div",{className:"df-right-body",hidden:g!=="assistant"},m.createElement(jt,{project:w,stageId:["overview","profile"].includes(c)?"overview":c,selection:d,services:x}),c==="negotiation"&&m.createElement("button",{className:"df-open-review",onClick:()=>z("review")},"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5 \u2192")),m.createElement("div",{className:"df-right-body",hidden:g!=="review"},m.createElement("button",{className:"df-back-link",onClick:()=>z("assistant")},"\u2190 \u8FD4\u56DE\u95EE\u7B54"),g==="review"&&m.createElement(Ke,{key:w.id,project:w,services:x,onChanged:U})),m.createElement("div",{className:"df-right-body df-dock-files",hidden:g!=="preview"},o&&m.createElement("p",{className:"df-alert"},"\u4E2D\u95F4\u8868\u5355\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\uFF0C\u9884\u89C8\u6587\u4EF6\u4FDD\u7559\u751F\u6210\u65F6\u7684\u5185\u5BB9\u3002"),m.createElement("details",{open:!d&&!E,className:"df-dock-file-list"},m.createElement("summary",null,"\u672C\u9636\u6BB5\u6587\u4EF6 \xB7"," ",T.reduce((u,O)=>u+O.generation.files.length,0)," \u4EFD"),T.map(({form:u,generation:O})=>m.createElement("section",{className:"df-generation",key:O.id},m.createElement("div",{className:"df-generation-heading"},m.createElement("h3",null,x.time(O.created_at)," \xB7 \u4FEE\u8BA2"," ",O.revision,O.date_style!=="zh-CN"&&" \xB7 \u539F\u65E5\u671F\u683C\u5F0F",O.naming_style!=="formal"&&" \xB7 \u539F\u6587\u4EF6\u540D"),m.createElement("button",{onClick:()=>H(`/cases/${u.case_id}/outputs/${O.id}/\u5168\u90E8\u6587\u4E66.zip`,O.bundle_name||w.name+"_\u6587\u4E66.zip")},"\u6253\u5305\u4E0B\u8F7D")),O.files.map(p=>m.createElement("div",{className:"df-dock-file-row",key:p.name},m.createElement("button",{className:"df-dock-file","aria-label":p.name,onClick:()=>_(zt(u,O,p))},p.name,m.createElement("small",null,p.recipient," \xB7 ",(p.size/1024).toFixed(0)," KB",p.print_copies>1&&` \xB7 \u5EFA\u8BAE\u6253\u5370 ${p.print_copies} \u4EFD`)),m.createElement("button",{"aria-label":"\u4E0B\u8F7D"+p.name,onClick:()=>H(`/cases/${u.case_id}/outputs/${O.id}/${encodeURIComponent(p.name)}`,p.name)},"\u2193"))))),!T.length&&m.createElement("p",{className:"df-muted"},"\u751F\u6210\u6587\u4E66\u6216\u4ECE\u4E2D\u95F4\u7684\u6750\u6599\u6E05\u5355\u9009\u62E9\u6587\u4EF6\u540E\uFF0C\u5728\u8FD9\u91CC\u9884\u89C8\u3002"),w.forms.filter(u=>u.case_id!==w.form_id).map(u=>m.createElement("button",{className:"df-dock-file",key:u.case_id,onClick:()=>H(`/cases/${u.case_id}/excel`,u.name+"_\u5386\u53F2\u5E95\u7A3F.xlsx")},"\u5386\u53F2\u5E95\u7A3F\uFF1A",u.name," \u2193"))),T.length>0&&m.createElement("p",{className:"df-muted"},"\u6587\u4EF6\u4FDD\u7559\u5404\u6279\u6B21\u751F\u6210\u65F6\u7684\u5185\u5BB9\uFF0C\u4FEE\u6539\u8868\u5355\u540E\u8BF7\u91CD\u65B0\u6838\u5BF9\u751F\u6210\u3002"),E?m.createElement(X,{key:E.id,file:E,projectId:w.id,download:H,embedded:!0,onClose:()=>_(null)}):d?m.createElement("section",{className:"df-dock-preview","aria-label":"\u6587\u4EF6\u9884\u89C8"},m.createElement("h3",null,d.artifact.title),F&&d.artifact.extension==="xlsx"?m.createElement("div",{className:"df-dock-office"},m.createElement(F,{artifact:d.artifact,readOnly:!0,hostControls:!0})):F?m.createElement(Je,{key:d.artifact.id,artifact:d.artifact},m.createElement(F,{artifact:d.artifact,readOnly:!0,hostControls:!0})):m.createElement("p",{role:"status"},"\u6B63\u5728\u6253\u5F00\u9884\u89C8\u2026"),m.createElement("button",{className:"df-dock-ask",onClick:()=>z("assistant")},"\u5C31\u6B64\u6587\u4EF6\u63D0\u95EE \u2192"),m.createElement("button",{className:"df-dock-ask",onClick:()=>H(`/cases/${d.reference.case_id}/outputs/${d.reference.generation_id}/${encodeURIComponent(d.reference.name)}`,d.artifact.title)},"\u4E0B\u8F7D\u5F53\u524D\u6587\u4EF6")):m.createElement("p",{className:"df-dock-empty"},"\u9009\u62E9\u4E00\u4EFD\u6587\u4EF6\uFF0C\u586B\u5199\u4E0E\u9884\u89C8\u53EF\u4EE5\u540C\u65F6\u8FDB\u884C\u3002")))}var ze=window.QwenPaw,e=ze.host.React,{useState:q,useEffect:we,useRef:ve}=e,Ze={pending:"\u672A\u5F00\u59CB",in_progress:"\u8FDB\u884C\u4E2D",submitted:"\u5DF2\u63D0\u4EA4",completed:"\u5DF2\u5B8C\u6210"},gt={pending:"\u5F85\u51C6\u5907",preparing:"\u6574\u7406\u4E2D",ready:"\u5F85\u63D0\u4EA4",submitted:"\u5DF2\u63D0\u4EA4",done:"\u5DF2\u5B8C\u6210",na:"\u4E0D\u9002\u7528"},$t=["\u4E0A\u62A5\u8BA1\u5212","\u9009\u5546\u8BBA\u8BC1","\u5546\u52A1\u8C08\u5224","\u5F00\u9898\u8BBA\u8BC1","\u5408\u540C\u5BA1\u67E5","\u7ED3\u9898\u9A8C\u6536","\u5F52\u6863\u4ED8\u6B3E"],ht=n=>n?new Date(n).toLocaleString("zh-CN",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}):"";function We({title:n,children:h,onClose:s,error:v,busy:l=!1}){let w=ve(null);return we(()=>{let c=document.activeElement;return w.current?.querySelector("input,select,textarea,button")?.focus(),()=>{c?.isConnected&&c.focus()}},[]),e.createElement("div",{className:"df-dialog-backdrop"},e.createElement("section",{ref:w,className:"df-dialog df-paper",role:"dialog","aria-modal":"true","aria-label":n,onKeyDown:c=>{if(c.key==="Escape"&&!l&&(c.stopPropagation(),s()),c.key==="Tab"){let x=[...w.current.querySelectorAll("button,input,textarea,select,a[href]")].filter(g=>!g.disabled);c.shiftKey&&document.activeElement===x[0]&&(c.preventDefault(),x.at(-1)?.focus()),!c.shiftKey&&document.activeElement===x.at(-1)&&(c.preventDefault(),x[0]?.focus())}}},e.createElement("div",{className:"df-section-head"},e.createElement("h2",null,n),e.createElement("button",{type:"button",disabled:l,onClick:s,"aria-label":"\u5173\u95ED"+n},"\xD7")),v&&e.createElement("p",{role:"alert",className:"df-alert error"},v),h))}function bt({file:n,projectId:h,download:s,onClose:v,embedded:l=!1}){let[w,c]=q(null),[x,g]=q(""),[z,d]=q(""),_=n.name.split(".").pop().toLowerCase(),E=["pdf","png","jpg","jpeg"].includes(_)&&!ze.workspace?.loadPreview;we(()=>{let o=!0,P;return E?ze.host.fetch(`/document-forms/projects/${h}/files/${n.id}`).then(async D=>{if(!D.ok)throw new Error("\u9884\u89C8\u672A\u80FD\u6253\u5F00\uFF0C\u8BF7\u4E0B\u8F7D\u67E5\u770B");let L=await D.blob();o&&(P=URL.createObjectURL(new Blob([L],{type:n.mime})),g(P))}).catch(D=>o&&d(D.message)):ze.workspace?.loadPreview||["doc","docx","xls","xlsx","ppt","pptx"].includes(_)?(ze.workspace?.loadPreview?ze.workspace.loadPreview():Promise.resolve(ge)).then(D=>o&&c(()=>D)).catch(()=>o&&c(()=>ge)):d("\u6B64\u683C\u5F0F\u8BF7\u4E0B\u8F7D\u540E\u67E5\u770B\u3002"),()=>{o=!1,P&&URL.revokeObjectURL(P)}},[n.id]);let X={id:n.id,title:n.name,source:"uploaded",extension:_,mimeType:n.mime,binaryUrl:n.preview_url,agentId:ze.host.getSelectedAgentId?.(),createdAt:Date.parse(n.uploaded_at)};return e.createElement(l?"section":We,{...l?{className:"df-dock-preview","aria-label":"\u6587\u4EF6\u9884\u89C8"}:{title:n.name,onClose:v}},l&&e.createElement("h3",null,n.name),e.createElement("div",{className:"df-attachment-preview"},z?e.createElement("p",{role:"alert"},z):E&&x?_==="pdf"?e.createElement("iframe",{title:n.name,src:x,sandbox:"allow-same-origin"}):e.createElement("img",{src:x,alt:n.name}):w?e.createElement(w,{artifact:X,readOnly:!0,hostControls:!0}):e.createElement("p",{role:"status"},"\u6B63\u5728\u6253\u5F00\u9884\u89C8\u2026")),e.createElement("div",{className:"df-actions"},e.createElement("button",{onClick:()=>s(`/projects/${h}/files/${n.id}`,n.name)},"\u4E0B\u8F7D\u539F\u6587\u4EF6"),e.createElement("button",{onClick:v},"\u5173\u95ED\u9884\u89C8")))}function xt(){let n=new Date;return`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`}function Re(n,h){if(n.status==="completed")return{kind:"done",text:n.due_date?`\u8BA1\u5212\u65E5\u671F ${n.due_date} \xB7 \u5DF2\u529E\u7ED3`:"\u5DF2\u529E\u7ED3"};if(!n.due_date)return{kind:"unset",text:"\u672A\u8BBE\u7F6E\u8BA1\u5212\u65E5\u671F"};let s=Math.round((Date.parse(n.due_date)-Date.parse(h))/864e5);return Number.isFinite(s)?{kind:s<0?"overdue":s<=3?"soon":"scheduled",text:`${n.due_date} \xB7 ${s<0?`\u5DF2\u903E\u671F ${-s} \u5929`:s===0?"\u4ECA\u5929\u5230\u671F":s<=3?`${s} \u5929\u540E\u5230\u671F`:`\u5269\u4F59 ${s} \u5929`}`}:{kind:"unset",text:"\u8BF7\u68C0\u67E5\u8BA1\u5212\u65E5\u671F"}}function ot({Editor:n,services:h}){let{request:s,json:v,download:l,Field:w}=h,[c,x]=q(xt);we(()=>{let a=()=>x(xt()),f=setInterval(a,6e4);return window.addEventListener("focus",a),()=>{clearInterval(f),window.removeEventListener("focus",a)}},[]);let[g,z]=q([]),[d,_]=q(null),[E,X]=q("overview"),[U,o]=q(""),[P,D]=q(null),[L,M]=q(!1),[F,b]=q(!1),[S,W]=q(""),[H,T]=q(0),[u,O]=q(""),[p,C]=q(""),[oe,Q]=q(""),[ee,K]=q(null),[N,I]=q({}),[ie,Te]=q([]),[Pe,se]=q(null),[le,Ie]=q(!1),[te,at]=q(!1),[pe,Y]=q(()=>{try{let a=Number(window.localStorage.getItem("ugsci.document-forms.right-width"));return Number.isFinite(a)&&a>=300&&a<=3e3?a:500}catch{return 500}}),[fe,ye]=q(1200),qe=ve(null);we(()=>{let a=qe.current;if(!a||!d?.single_form)return;let f=()=>{let G=a.getBoundingClientRect().width;if(G<=850)return;let Me=a.querySelector(".df-project-sidebar").getBoundingClientRect().width,_e=Math.max(300,Math.floor(G-Me-(window.innerWidth<=1050?380:440)));ye(_e),Y(kt=>Math.min(_e,Math.max(300,kt)))};f();let $=typeof ResizeObserver=="function"?new ResizeObserver(f):null;return $?.observe(a),window.addEventListener("resize",f),()=>{$?.disconnect(),window.removeEventListener("resize",f)}},[le,d?.single_form]),we(()=>{try{window.localStorage.setItem("ugsci.document-forms.right-width",String(pe))}catch{}},[pe]);let me=a=>Y(Math.min(fe,Math.max(300,Math.round(a)))),[Xe,ae]=q(null),[ke,ne]=q("assistant"),Z=ve(!0),Se=ve(0),Oe=ve(null),ce=ve(null),Ee=ve(""),Ue=ve(null),V=ve(null);V.current=d?.id,we(()=>{Ue.current?.scrollTo?.({top:0})},[d?.id,E,P?.id]);let Be=ze.host.useTheme?.()||"light",j=d?.stages.find(a=>a.id===E),Fe=d?.forms.filter(a=>a.stage_id===E)||[],R=(d?.stages.find(a=>a.id==="plan")?.materials.flatMap(a=>a.files).filter(a=>a.approval_review)||[]).at(-1),He=d?.stages.find(a=>a.id==="plan")?.materials.find(a=>/批复|审批|回执/.test(a.name)),Ae=()=>!L&&!F||window.confirm("\u8D44\u6599\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\uFF0C\u662F\u5426\u653E\u5F03\u8FD9\u4E9B\u4FEE\u6539\u5E76\u79BB\u5F00\uFF1F");async function Ne(){let a=await s("/projects");return Z.current&&z(a),a}async function J(a=d?.id,f=!1){let $=a?await s("/projects/"+a):null;return Z.current&&$&&(f||!V.current||V.current===a)&&(V.current!==$.id&&(se(null),ae(null),ne("assistant")),V.current=$.id,_(G=>G?.id===$.id&&G.revision>$.revision?G:$)),await Ne(),$}we(()=>(Z.current=!0,O("\u8F7D\u5165\u9879\u76EE"),Ne().then(async a=>{if(a.length&&Z.current){let f=await s("/projects/"+a[0].id);Z.current&&_(f)}}).catch(a=>Z.current&&C(a.message)).finally(()=>Z.current&&O("")),()=>{Z.current=!1,Se.current++}),[]),we(()=>{let a=f=>{(L||F)&&(f.preventDefault(),f.returnValue="")};return window.addEventListener("beforeunload",a),()=>window.removeEventListener("beforeunload",a)},[L,F]);async function i(a,f){if(u)return;let $=++Se.current;O(a),C(""),Q("");try{await f()}catch(G){Z.current&&$===Se.current&&C(G.message)}finally{Z.current&&$===Se.current&&O("")}}async function r(a){Ae()&&await i("\u6253\u5F00\u9879\u76EE",async()=>{D(null),M(!1),b(!1),X("overview"),await J(a,!0),D(null),M(!1),b(!1),se(null),ae(null),ne("assistant"),X("overview")})}async function k(a){Ae()&&(X(a),D(null),M(!1),b(!1),Q(""),C(""),d.single_form&&d.stages.some(f=>f.id===a)&&await i("\u6253\u5F00\u9879\u76EE\u8868\u5355",async()=>{let f=await s(`/projects/${d.id}/form`,v({revision:d.revision,stage_id:a}));await J(),D({id:f.id,view:"edit",revision:f.revision,initialDraft:f})}))}function B(a,f){I(f),K(a),C("")}async function ue(a,f,$="POST"){let G=await s(a,{...v({...f,revision:d.revision}),method:$});return Z.current&&(_(G),K(null)),await Ne(),G}function Qe(a){return i(a?"\u8BFB\u53D6\u9636\u6BB5 Excel":"\u51C6\u5907\u8C08\u5224\u8868\u5355",async()=>{let f;if(a){let $=new FormData;$.append("revision",d.revision),$.append("stage_id",E),$.append("workbook",a),f=await s(`/projects/${d.id}/${d.single_form?"form":"cases"}/import`,{method:"POST",body:$})}else f=await s(`/projects/${d.id}/${d.single_form?"form":"cases"}`,v({revision:d.revision,stage_id:E}));await J(),D({id:f.id,view:"edit",revision:f.revision,initialDraft:d.single_form?f:void 0}),M(!1),a&&Q(f.templates.length?"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\uFF0C\u5E76\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002":"\u5DF2\u8BFB\u53D6\u672C\u9636\u6BB5\u53D8\u91CF\u914D\u7F6E\uFF0C\u8BF7\u6DFB\u52A0\u5BF9\u5E94\u7684 Word \u6A21\u677F\u3002")})}function nt(a){if(!a)return;let f=Ee.current;return i("\u4FDD\u5B58\u6750\u6599",async()=>{let $=new FormData;$.append("revision",d.revision),$.append("file",a);let G=await s(`/projects/${d.id}/stages/${E}/materials/${f}/files`,{method:"POST",body:$});_(G),await Ne();let Me=G.stages.find(_e=>_e.id===E)?.materials.flatMap(_e=>_e.files).find(_e=>_e.name===a.name);Q(Me?.approval_review?.status==="ready"?`\u5BA1\u6279\u6587\u4EF6\u5DF2\u4FDD\u5B58\uFF0C\u5E76\u8BC6\u522B\u51FA ${Me.approval_review.fields.length} \u9879\u5BA1\u6279\u7ED3\u679C\u3002`:"\u6750\u6599\u5DF2\u4FDD\u5B58\uFF0C\u539F\u6709\u7248\u672C\u7EE7\u7EED\u4FDD\u7559\u3002\u8BF7\u6838\u5BF9\u540E\u66F4\u65B0\u6750\u6599\u72B6\u6001\u3002")})}let De=d?`/projects/${d.id}`:"",yt=a=>{a.preventDefault(),i("\u4FDD\u5B58\u6750\u6599\u4FE1\u606F",()=>ue(`${De}/stages/${E}/materials${N.id?"/"+N.id:""}`,N,N.id?"PUT":"POST"))},lt=a=>i("\u6574\u7406\u4E0B\u8F7D\u5305",()=>l(De+"/bundle"+(a?"?stage_id="+a:""),`${d.name}_${a?j.title:"\u5168\u6D41\u7A0B\u6750\u6599"}.zip`));return e.createElement("main",{ref:qe,style:{"--df-dock-size":pe+"px"},className:"df-app df-project-app"+(d?.single_form?" df-three-column":"")+(le?" df-left-collapsed":"")+(te?" df-right-collapsed":""),"data-theme":Be},e.createElement("style",null,ft),e.createElement("input",{ref:Oe,type:"file",accept:".xlsx",hidden:!0,"aria-label":"\u5BFC\u5165\u9636\u6BB5 Excel",onChange:a=>{let f=a.target.files[0];a.target.value="",f&&Qe(f)}}),e.createElement("input",{ref:ce,type:"file",accept:".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.png,.jpg,.jpeg,.zip,.txt,.csv",hidden:!0,"aria-label":"\u4E0A\u4F20\u9636\u6BB5\u6750\u6599",onChange:a=>{let f=a.target.files[0];a.target.value="",nt(f)}}),e.createElement("aside",{className:"df-sidebar df-project-sidebar"+(le?" df-pane-collapsed":""),"aria-label":"\u9879\u76EE\u9009\u62E9"},e.createElement("button",{className:"df-pane-toggle","aria-label":le?"\u5C55\u5F00\u9879\u76EE\u680F":"\u6536\u8D77\u9879\u76EE\u680F","aria-expanded":!le,title:le?"\u5C55\u5F00\u9879\u76EE\u680F":"\u6536\u8D77\u9879\u76EE\u680F",onClick:()=>Ie(a=>!a)},e.createElement("span",{"aria-hidden":"true"},le?"\u203A":"\u2039"),e.createElement("span",null,le?"\u9879\u76EE":"\u6536\u8D77")),e.createElement("div",{className:"df-brand"},"\u5916\u534F\u52A9\u624B"),e.createElement("button",{className:"df-primary df-new",disabled:!!u||!!S,onClick:()=>{Ae()&&B("create",{name:"",code:"",owner:""})}},"\uFF0B \u65B0\u5EFA\u9879\u76EE"),e.createElement("label",{className:"df-project-search"},e.createElement("span",{className:"df-sr-only"},"\u641C\u7D22\u9879\u76EE"),e.createElement("input",{"aria-label":"\u641C\u7D22\u9879\u76EE",placeholder:"\u641C\u7D22\u9879\u76EE\u540D\u79F0\u6216\u7F16\u53F7",value:U,onChange:a=>o(a.target.value)})),e.createElement("div",{className:"df-caption"},"\u6211\u7684\u9879\u76EE ",e.createElement("span",null,g.length)),e.createElement("nav",{"aria-label":"\u9879\u76EE\u5217\u8868"},g.filter(a=>(a.name+" "+a.code).toLowerCase().includes(U.trim().toLowerCase())).map(a=>e.createElement("button",{key:a.id,disabled:!!u||!!S,"aria-current":d?.id===a.id?"page":void 0,onClick:()=>r(a.id)},e.createElement("b",null,a.name),e.createElement("small",null,a.code||"\u672A\u8BBE\u7F16\u53F7"," \xB7 ",a.completed,"/7 \u9636\u6BB5\u5B8C\u6210")))),U.trim()&&!g.some(a=>(a.name+" "+a.code).toLowerCase().includes(U.trim().toLowerCase()))&&e.createElement("div",{className:"df-search-empty",role:"status"},e.createElement("p",null,"\u672A\u627E\u5230\u9879\u76EE"),e.createElement("button",{onClick:()=>o("")},"\u6E05\u9664\u641C\u7D22")),e.createElement("div",{className:"df-sidebar-foot"},e.createElement("button",{disabled:!!u||!!S,onClick:()=>i("\u4E0B\u8F7D\u914D\u5957\u6A21\u677F",()=>l("/starter","\u6587\u4E66\u586B\u62A5_\u914D\u5957\u6A21\u677F.zip"))},"\u4E0B\u8F7D\u914D\u5957\u6A21\u677F \u2197"))),e.createElement("section",{className:"df-main df-project-main",ref:Ue},e.createElement("header",{className:"df-header"},e.createElement("div",null,e.createElement("h1",null,d?.name||"\u9879\u76EE\u5DE5\u4F5C\u53F0"),e.createElement("p",null,d?[d.code||"\u672A\u8BBE\u9879\u76EE\u7F16\u53F7",d.owner&&"\u7ECF\u529E\u4EBA\uFF1A"+d.owner].filter(Boolean).join("\u3000\xB7\u3000"):"\u7BA1\u7406\u5916\u534F\u9879\u76EE\u3001\u9636\u6BB5\u6750\u6599\u4E0E\u529E\u7406\u8FDB\u5EA6\u3002")),d&&e.createElement("div",{className:"df-actions"},e.createElement("button",{disabled:!!u||!!S,onClick:()=>k("profile")},"\u57FA\u7840\u4FE1\u606F\u586B\u62A5"),e.createElement("button",{disabled:!!u||!!S,onClick:()=>lt()},"\u4E0B\u8F7D\u9879\u76EE\u6750\u6599"))),p&&e.createElement("div",{role:"alert",className:"df-alert error"},p,e.createElement("button",{"aria-label":"\u5173\u95ED\u9519\u8BEF\u63D0\u793A",onClick:()=>C("")},"\xD7")),oe&&e.createElement("div",{className:"df-alert",role:"status"},oe),u&&e.createElement("div",{className:"df-progress",role:"status"},u,"\u2026"),d?e.createElement(e.Fragment,null,e.createElement("nav",{className:"df-project-tabs","aria-label":"\u9879\u76EE\u9636\u6BB5"},e.createElement("button",{className:E==="overview"?"active":"",disabled:!!u||!!S,onClick:()=>k("overview")},"\u9879\u76EE\u603B\u89C8"),d.stages.map((a,f)=>e.createElement("button",{key:a.id,"aria-current":E===a.id?"step":void 0,className:E===a.id?"active":"",disabled:!!u||!!S,onClick:()=>k(a.id)},e.createElement("small",null,String(f+1).padStart(2,"0"))," ",a.title,e.createElement("span",{className:"df-state df-state-"+a.status},a.upstream_changed.length||a.documents_changed?"\u5F85\u590D\u6838":Ze[a.status])))),e.createElement("fieldset",{className:"df-content",disabled:!!u||!!S},E==="overview"&&e.createElement(e.Fragment,null,d.migrated&&e.createElement("p",{className:"df-muted df-migration-note"},"\u5386\u53F2\u586B\u62A5\u5DF2\u6309\u9879\u76EE\u540D\u79F0\u6216\u7F16\u53F7\u5F52\u5165\u5546\u52A1\u8C08\u5224\u9636\u6BB5\uFF0C\u539F\u8868\u5355\u3001\u751F\u6210\u6279\u6B21\u548C\u6587\u4EF6\u5747\u4FDD\u7559\u3002"),e.createElement("section",{className:"df-project-metrics"},e.createElement("div",null,e.createElement("b",null,d.stages.filter(a=>a.status==="completed").length,e.createElement("small",null,"/ ",d.stages.length)),e.createElement("span",null,"\u5DF2\u5B8C\u6210\u9636\u6BB5")),e.createElement("div",null,e.createElement("b",null,d.stages.reduce((a,f)=>a+f.materials.filter($=>!["done","na"].includes($.status)).length,0)),e.createElement("span",null,"\u5F85\u6574\u7406\u6750\u6599")),e.createElement("div",null,e.createElement("b",null,d.forms.reduce((a,f)=>a+f.outputs,0)),e.createElement("span",null,"\u5DF2\u751F\u6210\u6587\u4EF6")),e.createElement("div",null,e.createElement("b",null,d.stages.filter(a=>a.upstream_changed.length||a.documents_changed).length),e.createElement("span",null,"\u5F85\u590D\u6838\u9636\u6BB5"))),e.createElement("div",{className:"df-project-stage-grid"},d.stages.map((a,f)=>e.createElement("button",{className:"df-paper df-stage-card",key:a.id,onClick:()=>k(a.id)},e.createElement("div",{className:"df-section-head"},e.createElement("small",null,"\u9636\u6BB5 ",String(f+1).padStart(2,"0")),e.createElement("span",{className:"df-state df-state-"+a.status},a.upstream_changed.length||a.documents_changed?"\u5F85\u590D\u6838":Ze[a.status])),e.createElement("h2",null,a.title),e.createElement("p",null,a.purpose),e.createElement("span",{className:"df-deadline "+Re(a,c).kind},Re(a,c).text),e.createElement("footer",null,e.createElement("span",null,a.materials.filter($=>["done","na"].includes($.status)).length,"/",a.materials.length," \u9879\u6750\u6599\u5DF2\u5904\u7406"),e.createElement("span",null,a.upstream_changed.length||a.documents_changed?"\u6709\u53D8\u66F4\u5F85\u590D\u6838":a.due_date?"\u8BA1\u5212 "+a.due_date:"\u8FDB\u5165\u9636\u6BB5 \u2192"))))),e.createElement("section",{className:"df-paper df-project-hint"},e.createElement("h2",null,"\u4E00\u4EFD\u9879\u76EE\u5E95\u7A3F\uFF0C\u8D2F\u7A7F\u5404\u9636\u6BB5"),e.createElement("p",null,"\u9879\u76EE\u540D\u79F0\u3001\u7814\u7A76\u5185\u5BB9\u3001\u6210\u679C\u6307\u6807\u548C\u9884\u7B97\u7B49\u53EF\u5728\u201C\u57FA\u7840\u4FE1\u606F\u586B\u62A5\u201D\u7EDF\u4E00\u7EF4\u62A4\u3002\u9636\u6BB5\u8868\u5355\u4ECE\u5E95\u7A3F\u53D6\u503C\uFF0C\u540E\u7EED\u53D8\u66F4\u4F1A\u63D0\u9192\u6838\u5BF9\uFF1B\u5DF2\u6709\u751F\u6210\u6587\u4EF6\u4FDD\u7559\u539F\u6837\u3002"),e.createElement("button",{onClick:()=>k("profile")},"\u586B\u5199\u57FA\u7840\u4FE1\u606F"))),E==="profile"&&e.createElement(Pt,{onDirtyChange:b,key:d.id+":"+d.revision,project:d,Field:w,onSave:a=>i("\u4FDD\u5B58\u57FA\u7840\u4FE1\u606F",async()=>{await ue(De,a,"PUT"),Q("\u57FA\u7840\u4FE1\u606F\u5DF2\u66F4\u65B0\u3002\u5DF2\u6709\u8868\u5355\u53EF\u9010\u9879\u6838\u5BF9\u540E\u540C\u6B65\uFF0C\u539F\u751F\u6210\u6587\u4EF6\u4E0D\u53D8\u3002")})}),j&&e.createElement(e.Fragment,null,e.createElement("section",{className:"df-paper df-stage-header"},e.createElement("div",null,e.createElement("h2",null,j.title),e.createElement("div",{className:"df-node-status","aria-label":"\u8282\u70B9\u529E\u7406\u6982\u51B5"},e.createElement("span",{className:"df-state df-state-"+j.status},Ze[j.status]),e.createElement("span",{className:"df-deadline "+Re(j,c).kind},Re(j,c).text),e.createElement("span",null,"\u5BA1\u6279\u8D44\u6599"," ",j.materials.filter(a=>a.files.length).length,"/",j.materials.length)),!d.single_form&&e.createElement("details",{className:"df-stage-help"},e.createElement("summary",null,"\u672C\u9636\u6BB5\u529E\u7406\u8BF4\u660E"),e.createElement("p",null,d.single_form&&j.id==="plan"?"\u5DF2\u63A5\u5165\u79D1\u7814\u8BA1\u5212\u586B\u62A5\u8868\u4E0E\u5916\u534F\u5FC5\u8981\u6027\u8BF4\u660E\uFF0C\u53EF\u76F4\u63A5\u586B\u5199\u5E76\u751F\u6210\u3002":j.id==="selection"?"\u5DF2\u63A5\u5165\u8BBA\u8BC1\u610F\u89C1\u53CA\u7B7E\u5B57\u8868\u4E0E\u975E\u62DB\u6807\u65B9\u6848\u586B\u62A5\u8868\uFF0C\u53EF\u5148\u51C6\u5907\u8BBA\u8BC1\u6750\u6599\uFF0C\u8BBA\u8BC1\u7ED3\u675F\u540E\u6838\u5BF9\u7CFB\u7EDF\u586B\u62A5\u4FE1\u606F\u3002":j.id==="negotiation"?"\u4E94\u4EFD\u6807\u51C6\u6A21\u677F\u5DF2\u63A5\u5165\uFF0C\u53EF\u76F4\u63A5\u586B\u5199\uFF0C\u4E5F\u53EF\u5BFC\u5165\u73B0\u6709 Excel\u3002":"\u7EDF\u4E00\u6A21\u677F\u5F85\u8865\u5145\uFF0C\u53EF\u4E0A\u4F20\u9636\u6BB5\u6750\u6599\uFF0C\u6216\u5BFC\u5165 Excel \u4E0E Word \u6A21\u677F\u3002"))),e.createElement("div",{className:"df-actions"},P&&e.createElement("button",{onClick:()=>{T(a=>a+1),document.getElementById("df-node-form")?.scrollIntoView?.({behavior:"smooth",block:"start"})}},"\u586B\u5199\u5185\u5BB9"),e.createElement("button",{onClick:()=>document.getElementById("df-node-materials")?.scrollIntoView?.({behavior:"smooth",block:"start"})},"\u5BA1\u6279\u8D44\u6599"),e.createElement("button",{onClick:()=>lt(j.id)},"\u4E0B\u8F7D\u672C\u9636\u6BB5\u6750\u6599"),e.createElement("button",{disabled:L,title:L?"\u8BF7\u5148\u4FDD\u5B58\u586B\u5199\u5185\u5BB9\uFF0C\u518D\u66F4\u65B0\u529E\u7406\u72B6\u6001":void 0,onClick:()=>B("stage",{...j,confirmed:!1})},"\u529E\u7406\u4FE1\u606F\u4E0E\u72B6\u6001"))),(j.upstream_changed.length>0||j.documents_changed)&&e.createElement("div",{className:"df-alert df-stage-warning"},e.createElement("div",null,e.createElement("b",null,"\u672C\u9636\u6BB5\u6709\u8D44\u6599\u9700\u8981\u590D\u6838"),e.createElement("p",null,j.upstream_changed.length>0&&"\u524D\u5E8F\u9636\u6BB5\u5DF2\u66F4\u65B0\uFF1A"+j.upstream_changed.join("\u3001")+"\u3002",j.documents_changed&&"\u672C\u9636\u6BB5\u8868\u5355\u6216\u751F\u6210\u6587\u4EF6\u6709\u66F4\u65B0\u3002","\u8BF7\u6838\u5BF9\u5DF2\u63D0\u4EA4\u7684\u6750\u6599\u662F\u5426\u9700\u8981\u8C03\u6574\u3002")),e.createElement("button",{onClick:()=>i("\u8BB0\u5F55\u590D\u6838",()=>ue(`${De}/stages/${j.id}/acknowledge`,{}))},"\u5DF2\u6838\u5BF9\u53D8\u66F4")),(j.system_name||j.submission_ref||j.notes)&&e.createElement("section",{className:"df-paper df-stage-details"},e.createElement("dl",null,e.createElement("div",null,e.createElement("dt",null,"\u529E\u7406\u7CFB\u7EDF"),e.createElement("dd",null,j.system_url?e.createElement("a",{href:j.system_url,target:"_blank",rel:"noopener noreferrer"},j.system_name||"\u6253\u5F00\u529E\u7406\u7CFB\u7EDF"," \u2197"):j.system_name||"\u672A\u8BB0\u5F55")),e.createElement("div",null,e.createElement("dt",null,"\u63D0\u4EA4\u7F16\u53F7 / \u56DE\u6267"),e.createElement("dd",null,j.submission_ref||"\u672A\u8BB0\u5F55"))),j.notes&&e.createElement("p",null,j.notes)),e.createElement("div",{id:"df-node-form"},P&&e.createElement(n,{key:d.id+":"+P.id+":"+E+":"+(P.revision||""),project:d,workflowStage:j,initialCaseId:P.id,initialView:P.view,editRequest:H,initialDraft:P.initialDraft,onDirtyChange:M,onBusyChange:W,onViewChange:()=>document.getElementById("df-node-form")?.scrollIntoView?.({block:"start"}),onBack:()=>{D(null),M(!1),J().catch(a=>C(a.message))},onChanged:()=>J(),docked:d.single_form,onEditBasics:()=>{D(null),M(!1),W(""),X("profile")},onStageStatus:()=>B("stage",{...j,confirmed:!1}),onPreview:a=>{ae(a),se(null),ne("preview")}})),!P&&e.createElement("section",{className:"df-paper df-stage-forms"},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,d.single_form?"\u9879\u76EE\u8868\u5355":"\u586B\u5199\u4E0E\u751F\u6210"),e.createElement("p",{className:"df-muted"},"\u8868\u5355\u6CBF\u7528\u9879\u76EE\u5E95\u7A3F\uFF0C\u6838\u5BF9\u540E\u751F\u6210\u3002\u5DF2\u6709\u6279\u6B21\u4FDD\u7559\u751F\u6210\u65F6\u7684\u5185\u5BB9\u3002")),e.createElement("div",{className:"df-actions"},(j.id==="negotiation"||d.single_form)&&e.createElement("button",{className:"df-primary",onClick:()=>Qe()},d.single_form?"\u6253\u5F00\u9879\u76EE\u8868\u5355":"\u586B\u5199\u8C08\u5224\u6750\u6599"),e.createElement("button",{onClick:()=>Oe.current.click()},"\u5BFC\u5165 Excel \u8868\u5355"))),d.single_form?e.createElement("p",{className:"df-muted"},"\u6BCF\u4E2A\u9879\u76EE\u5171\u7528\u4E00\u4EFD\u8868\u5355\uFF0C\u4E03\u4E2A\u9636\u6BB5\u5404\u529E\u7406\u4E00\u6B21\u3002\u5DF2\u6709\u6587\u4E66\u4E0E\u5386\u53F2\u5E95\u7A3F\u53EF\u5728\u53F3\u4FA7\u67E5\u770B\u3002"):Fe.length?e.createElement("div",{className:"df-project-forms"},Fe.map(a=>e.createElement("div",{key:a.case_id},e.createElement("div",null,e.createElement("b",null,a.name),e.createElement("small",null,ht(a.updated_at)," \xB7"," ",a.outputs?a.outputs+" \u4EFD\u6587\u4EF6":"\u586B\u5199\u4E2D",a.shared_changes.length>0&&" \xB7 \u57FA\u7840\u4FE1\u606F\u6709\u66F4\u65B0")),e.createElement("div",{className:"df-actions"},e.createElement("button",{onClick:()=>D({id:a.case_id,view:"edit"})},"\u6253\u5F00\u8868\u5355"),a.outputs>0&&e.createElement("button",{onClick:()=>D({id:a.case_id,view:"files"})},"\u67E5\u770B\u751F\u6210\u6587\u4EF6"))))):e.createElement("p",{className:"df-empty"},"\u672C\u9636\u6BB5\u8FD8\u6CA1\u6709\u8868\u5355\u3002\u5DF2\u6709\u6210\u54C1\u6587\u4EF6\u53EF\u76F4\u63A5\u4E0A\u4F20\u5230\u4E0B\u9762\u7684\u6750\u6599\u6E05\u5355\u3002")),j.id==="negotiation"&&e.createElement("section",{className:"df-paper df-review-entry"},e.createElement("div",null,e.createElement("h2",null,"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5"),e.createElement("p",{className:"df-muted"},"\u5BF9\u7167\u6B63\u5F0F\u8C08\u5224\u6587\u4EF6\uFF0C\u68C0\u67E5\u5404\u5355\u4F4D\u54CD\u5E94\u6750\u6599\uFF0C\u6C47\u603B\u95EE\u9898\u3001\u4F9D\u636E\u548C\u5F85\u786E\u8BA4\u4E8B\u9879\u3002")),e.createElement("button",{onClick:()=>d.single_form?ne("review"):B("response-review",{})},"\u6253\u5F00\u6838\u67E5\u667A\u80FD\u4F53 \u2192")),j.id==="plan"&&e.createElement("section",{className:"df-paper df-approval-entry"},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,"\u8BA1\u5212\u5BA1\u6279\u7ED3\u679C\u6838\u5BF9"),e.createElement("p",{className:"df-muted"},"\u4E0A\u4F20\u6B63\u5F0F\u5BA1\u6279 PDF \u540E\uFF0C\u6309\u660E\u786E\u5B57\u6BB5\u4E0E\u5F53\u524D\u8D44\u6599\u6BD4\u5BF9\u3002\u66F4\u6B63\u524D\u4F1A\u9010\u9879\u786E\u8BA4\u3002")),e.createElement("div",{className:"df-actions"},R?.approval_review?.status==="ready"&&e.createElement("button",{onClick:()=>{let a=R.approval_review.fields.filter(f=>f.changed).map(f=>f.key);Te(a),K("approval")}},"\u67E5\u770B\u6BD4\u5BF9\u7ED3\u679C \u2192"),e.createElement("button",{disabled:!He,onClick:()=>{Ee.current=He.id,ce.current.click()}},"\u4E0A\u4F20\u5BA1\u6279\u6587\u4EF6"))),R?R.approval_review.status==="ready"?e.createElement("p",null,"\u6279\u590D\u65E5\u671F ",R.approval_review.approved_at," ","\xB7 \u5DF2\u8BC6\u522B"," ",R.approval_review.fields.length," \u9879 \xB7",R.approval_review.change_count?`\u53D1\u73B0 ${R.approval_review.change_count} \u9879\u5DEE\u5F02`:"\u4E0E\u5F53\u524D\u8D44\u6599\u4E00\u81F4"):e.createElement("p",{role:"status"},R.approval_review.message):e.createElement("p",null,"\u8BF7\u5728\u4E0B\u65B9\u201C\u8BA1\u5212\u6279\u590D\u6216\u7CFB\u7EDF\u56DE\u6267\u201D\u4E2D\u4E0A\u4F20\u5BA1\u6279\u6587\u4EF6\u3002")),e.createElement("section",{className:"df-paper df-material-panel",id:"df-node-materials"},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,d.single_form?"\u5BA1\u6279\u8D44\u6599\u4E0E\u9644\u4EF6":"\u6750\u6599\u6E05\u5355"," ",e.createElement("small",null,j.materials.length)),e.createElement("p",{className:"df-muted"},"\u4E0A\u4F20\u5BA1\u6279\u4EF6\u3001\u7B7E\u7AE0\u4EF6\u548C\u56DE\u6267\uFF1B\u6587\u4EF6\u4EC5\u5F52\u6863\uFF0C\u4E0D\u81EA\u52A8\u4FEE\u6539\u8868\u5355\u3002")),e.createElement("button",{onClick:()=>B("material",{name:"",status:"pending",required:!1,note:""})},"\uFF0B \u6DFB\u52A0\u6750\u6599")),e.createElement("div",{className:"df-materials"},j.materials.map(a=>{let f=Fe.reduce(($,G)=>$+(G.generations[0]?.files.filter(Me=>Me.name.includes(a.name)).length||0),0);return e.createElement("article",{className:"df-material-row",key:a.id},e.createElement("div",{className:"df-material-name"},e.createElement("b",null,a.name),a.required&&e.createElement("span",{className:"df-required-tag"},"\u5FC5\u5907"),e.createElement("span",{className:"df-state df-material-state-"+a.status},gt[a.status]),f>0&&e.createElement("small",null,"\u5DF2\u6709 ",f," \u4EFD\u751F\u6210\u7A3F \xB7 \u5728\u4E0A\u65B9\u8868\u5355\u67E5\u770B"),a.note&&e.createElement("p",null,a.note)),e.createElement("div",{className:"df-material-files"},a.files.length>0?e.createElement("details",null,e.createElement("summary",null,a.files.length," \u4EFD\u6587\u4EF6 / \u7248\u672C \xB7 \u6700\u65B0\uFF1A",a.files[a.files.length-1].name),[...a.files].reverse().map(($,G)=>e.createElement("div",{className:"df-material-file",key:$.id},e.createElement("div",null,e.createElement("b",null,"V",a.files.length-G," \xB7"," ",$.name),e.createElement("small",null,ht($.uploaded_at)," \xB7"," ",Math.max(1,Math.round($.size/1024))," ","KB")),e.createElement("button",{onClick:()=>{se($),ae({artifact:{title:$.name},reference:{file_id:$.id}}),ne("preview")}},"\u9884\u89C8"),e.createElement("button",{"aria-label":"\u4E0B\u8F7D"+$.name+"\u7248\u672C"+(a.files.length-G),onClick:()=>i("\u4E0B\u8F7D\u6750\u6599",()=>l(`${De}/files/${$.id}`,$.name))},"\u4E0B\u8F7D")))):e.createElement("span",{className:"df-muted"},"\u5C1A\u672A\u4E0A\u4F20\u6587\u4EF6")),e.createElement("div",{className:"df-actions"},e.createElement("button",{"aria-label":"\u4E0A\u4F20"+a.name,onClick:()=>{Ee.current=a.id,ce.current.click()}},"\u4E0A\u4F20\u6587\u4EF6"),e.createElement("button",{"aria-label":"\u7F16\u8F91"+a.name,onClick:()=>B("material",{...a})},"\u7F16\u8F91")))}))),!d.single_form&&e.createElement("div",{className:"df-stage-tail"},e.createElement("p",null,"\u5404\u9636\u6BB5\u53EF\u5E76\u884C\u51C6\u5907\uFF1B\u524D\u5E8F\u8D44\u6599\u53D8\u5316\u540E\uFF0C\u540E\u7EED\u9636\u6BB5\u4F1A\u63D0\u793A\u590D\u6838\u3002\u9636\u6BB5\u5B8C\u6210\u7531\u7ECF\u529E\u4EBA\u786E\u8BA4\u3002"),e.createElement("button",{onClick:()=>B("stage",{...j,confirmed:!1})},"\u66F4\u65B0\u529E\u7406\u72B6\u6001"))))):e.createElement("section",{className:"df-paper df-project-welcome"},e.createElement("h2",null,"\u5148\u5EFA\u4E00\u4E2A\u9879\u76EE"),e.createElement("p",null,"\u586B\u5199\u57FA\u7840\u4FE1\u606F\u540E\uFF0C\u9009\u62E9\u9636\u6BB5\u529E\u7406\u3002"),e.createElement("div",{className:"df-welcome-stages"},$t.map((a,f)=>e.createElement("span",{key:a},e.createElement("small",null,String(f+1).padStart(2,"0")),a))),e.createElement("button",{className:"df-primary",onClick:()=>B("create",{name:"",code:"",owner:""})},"\u5EFA\u7ACB\u7B2C\u4E00\u4E2A\u9879\u76EE"))),d?.single_form&&e.createElement(rt,{key:d.id,collapsed:te,width:pe,maxWidth:fe,onResize:me,onToggle:()=>at(a=>!a),project:d,stageId:E,services:h,mode:ke,onMode:ne,selection:Xe,attachment:Pe,AttachmentPreview:bt,dirty:L,onSelect:a=>{ae(a),se(null),ne("preview")},onChanged:()=>J().catch(a=>C(a.message))}),ee==="response-review"&&e.createElement(We,{title:"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5",onClose:()=>{K(null),J().catch(a=>C(a.message))}},e.createElement(Ke,{project:d,services:h,onChanged:()=>J().catch(a=>C(a.message))})),ee==="approval"&&R&&e.createElement(We,{title:"\u6838\u5BF9\u8BA1\u5212\u5BA1\u6279\u7ED3\u679C",busy:!!u,error:p,onClose:()=>K(null)},e.createElement("p",{className:"df-muted"},"\u6765\u6E90\uFF1A",R.name," \xB7 \u6279\u590D\u65E5\u671F"," ",R.approval_review.approved_at,"\u3002\u4EC5\u52FE\u9009\u7684\u5DEE\u5F02\u4F1A\u5199\u56DE\u9879\u76EE\u8D44\u6599\u548C\u4E0A\u62A5\u8BA1\u5212\u8868\u5355\u3002"),e.createElement("div",{className:"df-compare df-approval-compare"},R.approval_review.fields.map(a=>e.createElement("label",{key:a.key},e.createElement("input",{type:"checkbox","aria-label":"\u91C7\u7528\u5BA1\u6279\u7ED3\u679C\uFF1A"+a.label,disabled:!a.changed,checked:ie.includes(a.key),onChange:f=>Te(f.target.checked?[...ie,a.key]:ie.filter($=>$!==a.key))}),e.createElement("div",null,e.createElement("b",null,a.label,!a.changed&&e.createElement("small",null," \u4E00\u81F4")),e.createElement("div",{className:"df-compare-values"},e.createElement("p",null,e.createElement("small",null,"\u5F53\u524D\u8D44\u6599"),a.current||"\u7A7A\u767D"),e.createElement("p",null,e.createElement("small",null,"\u5BA1\u6279\u7ED3\u679C"),a.value||"\u7A7A\u767D")))))),L&&e.createElement("p",{role:"status"},"\u8BF7\u5148\u4FDD\u5B58\u586B\u5199\u5185\u5BB9\uFF0C\u518D\u91C7\u7528\u5BA1\u6279\u7ED3\u679C\u3002"),e.createElement("div",{className:"df-actions"},e.createElement("button",{disabled:!!u,onClick:()=>K(null)},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!u||!!S||L||!ie.length,onClick:()=>i("\u91C7\u7528\u5BA1\u6279\u7ED3\u679C",async()=>{let a=await s(`${De}/stages/plan/approval/apply`,v({revision:d.revision,file_id:R.id,keys:ie}));if(_(a),P){let f=await s(`/cases/${P.id}`);D({...P,initialDraft:f,revision:f.revision})}K(null),Te([]),await Ne(),Q("\u5DF2\u91C7\u7528\u6240\u9009\u5BA1\u6279\u7ED3\u679C\u3002\u540E\u7EED\u9636\u6BB5\u4F1A\u63D0\u793A\u91CD\u65B0\u6838\u5BF9\u53D7\u5F71\u54CD\u8D44\u6599\u3002")})},"\u91C7\u7528\u6240\u9009 ",ie.length," \u9879"))),ee==="create"&&e.createElement(We,{title:"\u65B0\u5EFA\u9879\u76EE",busy:!!u,error:p,onClose:()=>K(null)},e.createElement("form",{onSubmit:a=>{a.preventDefault(),i("\u5EFA\u7ACB\u9879\u76EE",async()=>{let f=await s("/projects",v(N));se(null),ae(null),ne("assistant"),_(f),X("overview"),D(null),M(!1),K(null),await Ne()})}},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u540D\u79F0"),e.createElement("input",{"aria-label":"\u65B0\u9879\u76EE\u540D\u79F0",required:!0,maxLength:120,value:N.name,onChange:a=>I({...N,name:a.target.value})})),e.createElement("div",{className:"df-fields"},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u7F16\u53F7"),e.createElement("input",{"aria-label":"\u65B0\u9879\u76EE\u7F16\u53F7",maxLength:100,value:N.code,onChange:a=>I({...N,code:a.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u7ECF\u529E\u4EBA"),e.createElement("input",{"aria-label":"\u65B0\u9879\u76EE\u7ECF\u529E\u4EBA",maxLength:100,value:N.owner,onChange:a=>I({...N,owner:a.target.value})}))),e.createElement("p",{className:"df-muted"},"\u5EFA\u7ACB\u9879\u76EE\u540E\uFF0C\u53EF\u6574\u7406\u5171\u7528\u8D44\u6599\uFF0C\u518D\u6309\u4E03\u4E2A\u9636\u6BB5\u51C6\u5907\u6750\u6599\u3002"),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",disabled:!!u||!!S,onClick:()=>K(null)},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!u||!N.name?.trim(),type:"submit"},"\u5EFA\u7ACB\u9879\u76EE")))),ee==="material"&&e.createElement(We,{title:"\u6750\u6599\u4FE1\u606F",busy:!!u,error:p,onClose:()=>K(null)},e.createElement("form",{onSubmit:yt},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u6750\u6599\u540D\u79F0"),e.createElement("input",{"aria-label":"\u6750\u6599\u540D\u79F0",required:!0,maxLength:150,value:N.name,onChange:a=>I({...N,name:a.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u6750\u6599\u72B6\u6001"),e.createElement("select",{"aria-label":"\u6750\u6599\u72B6\u6001",value:N.status,onChange:a=>I({...N,status:a.target.value})},Object.entries(gt).map(([a,f])=>e.createElement("option",{key:a,value:a},f)))),e.createElement("label",{className:"df-checkbox"},e.createElement("input",{type:"checkbox",checked:N.required,onChange:a=>I({...N,required:a.target.checked})}),"\u672C\u9879\u76EE\u7684\u5FC5\u5907\u6750\u6599\uFF0C\u9636\u6BB5\u5B8C\u6210\u524D\u9700\u786E\u8BA4\u5DF2\u5B8C\u6210\u6216\u4E0D\u9002\u7528"),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u6750\u6599\u8BF4\u660E"),e.createElement("textarea",{"aria-label":"\u6750\u6599\u8BF4\u660E",rows:3,maxLength:3e3,value:N.note,onChange:a=>I({...N,note:a.target.value})})),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",onClick:()=>K(null),disabled:!!u||!!S},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!u||!!S,type:"submit"},"\u4FDD\u5B58\u6750\u6599\u4FE1\u606F")))),ee==="stage"&&e.createElement(We,{title:j.title+"\u529E\u7406\u4FE1\u606F",busy:!!u,error:p,onClose:()=>K(null)},e.createElement("form",{onSubmit:a=>{a.preventDefault(),i("\u4FDD\u5B58\u529E\u7406\u4FE1\u606F",()=>ue(`${De}/stages/${E}`,N,"PUT"))}},e.createElement("div",{className:"df-fields"},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9636\u6BB5\u72B6\u6001"),e.createElement("select",{"aria-label":"\u9636\u6BB5\u72B6\u6001",value:N.status,onChange:a=>I({...N,status:a.target.value})},Object.entries(Ze).map(([a,f])=>e.createElement("option",{key:a,value:a},f)))),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u8BA1\u5212\u65E5\u671F"),e.createElement("input",{"aria-label":"\u9636\u6BB5\u8BA1\u5212\u65E5\u671F",type:"date",value:N.due_date,onChange:a=>I({...N,due_date:a.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u529E\u7406\u7CFB\u7EDF"),e.createElement("input",{"aria-label":"\u529E\u7406\u7CFB\u7EDF",maxLength:150,value:N.system_name,onChange:a=>I({...N,system_name:a.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u7CFB\u7EDF\u5730\u5740"),e.createElement("input",{"aria-label":"\u7CFB\u7EDF\u5730\u5740",type:"url",placeholder:"https://",maxLength:1e3,value:N.system_url,onChange:a=>I({...N,system_url:a.target.value})}))),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u63D0\u4EA4\u7F16\u53F7 / \u56DE\u6267\u4FE1\u606F"),e.createElement("input",{"aria-label":"\u63D0\u4EA4\u7F16\u53F7",maxLength:500,value:N.submission_ref,onChange:a=>I({...N,submission_ref:a.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u529E\u7406\u8BF4\u660E"),e.createElement("textarea",{"aria-label":"\u529E\u7406\u8BF4\u660E",rows:4,maxLength:5e3,value:N.notes,onChange:a=>I({...N,notes:a.target.value})})),e.createElement("p",{className:"df-muted"},"\u8BB0\u5F55\u7EBF\u4E0B\u6216\u4E1A\u52A1\u7CFB\u7EDF\u7684\u5B9E\u9645\u529E\u7406\u7ED3\u679C\uFF0C\u56DE\u6267\u6587\u4EF6\u53EF\u4E0A\u4F20\u5230\u6750\u6599\u6E05\u5355\u3002"),N.status==="completed"&&e.createElement(e.Fragment,null,e.createElement("p",{className:"df-muted"},j.missing_required.length>0?"\u5C1A\u672A\u529E\u7ED3\u7684\u5FC5\u5907\u6750\u6599\uFF1A"+j.missing_required.join("\u3001"):"\u8BF7\u786E\u8BA4\u9636\u6BB5\u6750\u6599\u548C\u524D\u5E8F\u53D8\u66F4\u5DF2\u6838\u5BF9\u3002"),e.createElement("label",{className:"df-checkbox"},e.createElement("input",{"aria-label":"\u786E\u8BA4\u672C\u9636\u6BB5\u5DF2\u529E\u7ED3",type:"checkbox",checked:N.confirmed,onChange:a=>I({...N,confirmed:a.target.checked})}),"\u5DF2\u6838\u5BF9\u672C\u9636\u6BB5\u6750\u6599\u53CA\u524D\u5E8F\u53D8\u66F4\uFF0C\u786E\u8BA4\u672C\u9636\u6BB5\u5DF2\u529E\u7ED3")),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",onClick:()=>K(null),disabled:!!u||!!S},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!u||N.status==="completed"&&!N.confirmed,type:"submit"},"\u4FDD\u5B58\u529E\u7406\u4FE1\u606F")))),Pe&&!d.single_form&&e.createElement(bt,{key:Pe.id,file:Pe,projectId:d.id,download:(a,f)=>i("\u4E0B\u8F7D\u539F\u6587\u4EF6",()=>l(a,f)),onClose:()=>se(null)}))}function Pt({project:n,Field:h,onSave:s,onDirtyChange:v}){let[l,w]=q(n.fields),[c,x]=q({name:n.name,code:n.code,owner:n.owner});return we(()=>{v(JSON.stringify(l)!==JSON.stringify(n.fields)||c.name!==n.name||c.code!==n.code||c.owner!==n.owner)},[l,c]),e.createElement("form",{className:"df-paper df-project-profile",onSubmit:g=>{g.preventDefault(),s({...c,values:Object.fromEntries(l.map(z=>[z.key,z.value]))})}},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,"\u57FA\u7840\u4FE1\u606F\u586B\u62A5"),e.createElement("p",{className:"df-muted"},"\u5404\u9636\u6BB5\u8868\u5355\u590D\u7528\u8FD9\u91CC\u7684\u8D44\u6599\uFF1B\u9636\u6BB5\u65E5\u671F\u3001\u8BC4\u5BA1\u5206\u6570\u548C\u4ED8\u6B3E\u7ED3\u679C\u5206\u522B\u8BB0\u5F55\u3002")),e.createElement("button",{className:"df-primary",type:"submit"},"\u4FDD\u5B58\u57FA\u7840\u4FE1\u606F")),e.createElement("div",{className:"df-fields"},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u540D\u79F0"),e.createElement("input",{"aria-label":"\u9879\u76EE\u540D\u79F0",required:!0,value:c.name,maxLength:120,onChange:g=>x({...c,name:g.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u7F16\u53F7"),e.createElement("input",{"aria-label":"\u9879\u76EE\u7F16\u53F7",value:c.code,maxLength:100,onChange:g=>x({...c,code:g.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u7ECF\u529E\u4EBA"),e.createElement("input",{"aria-label":"\u7ECF\u529E\u4EBA",value:c.owner,maxLength:100,onChange:g=>x({...c,owner:g.target.value})}))),[...new Set(l.filter(g=>!["project.name","project.code"].includes(g.key)).map(g=>g.group))].map(g=>e.createElement("section",{className:"df-group",key:g},e.createElement("h3",null,g),e.createElement("div",{className:"df-fields"},l.filter(z=>z.group===g&&!["project.name","project.code"].includes(z.key)).map(z=>e.createElement(h,{key:z.key,field:{...z,required:!1},onChange:d=>w(l.map(_=>_.key===z.key?{..._,value:d}:_))}))))),e.createElement("div",{className:"df-actions"},e.createElement("button",{className:"df-primary",type:"submit"},"\u4FDD\u5B58\u57FA\u7840\u4FE1\u606F")))}var he=window.QwenPaw,t=he.host.React,{useState:de,useEffect:je,useLayoutEffect:St,useRef:Ve}=t,st="/document-forms",Et="application/vnd.openxmlformats-officedocument.wordprocessingml.document";async function re(n,h){let s=await he.host.fetch(st+n,h);if(!s.ok){let v=await s.json().catch(()=>({}));throw new Error(typeof v.detail=="string"?v.detail:Array.isArray(v.detail)?v.detail.map(l=>`${l.loc?.slice(1).join(".")||"\u8D44\u6599"}\uFF1A${l.msg}`).join("\uFF1B"):`\u64CD\u4F5C\u672A\u5B8C\u6210\uFF08${s.status}\uFF09\uFF0C\u8BF7\u68C0\u67E5\u586B\u5199\u5185\u5BB9`)}return s.json()}async function tt(n,h){let s=await he.host.fetch(st+n);if(!s.ok)throw new Error("\u6587\u4EF6\u4E0B\u8F7D\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5");let v=URL.createObjectURL(await s.blob()),l=document.createElement("a");l.href=v,l.download=h,document.body.appendChild(l);try{l.click()}finally{l.remove(),setTimeout(()=>URL.revokeObjectURL(v),1e3)}}var $e=n=>({method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)}),Ge=n=>new Date(n).toLocaleString("zh-CN",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}),vt=n=>n.kind==="textarea"||n.value.length>100||n.value.includes(`
`)||n.label.includes("\u6574\u6BB5"),Dt=n=>/^(research\.contents|deliverables\.|metrics\.|milestones\.)/.test(n.key)||/主要研究内容|预期成果|考核指标|进度安排/.test(n.label);function et(n){return n.map((h,s)=>{let v={...h};for(let l of["start","end"]){let w="follow_"+l;v[w]=s>0&&(typeof v[w]=="boolean"?v[w]:!v[l]),v[w]&&(v[l]=n[0][l])}return v})}function Lt({field:n,onChange:h}){let s=["","",""],v=0;for(let l of n.value.split(/\r?\n/)){let w=l.match(/^\s*([1-3])[.、．)）]\s?(.*)$/);w?s[Number(w[1])-1]=w[2]:v<3&&(s[v++]=l)}return t.createElement("div",{className:"df-plan-partners",id:"df-plan.partners",role:"group","aria-label":n.label},t.createElement("span",null,n.label),s.map((l,w)=>t.createElement("label",{className:"df-field",key:w},t.createElement("span",null,"\u5355\u4F4D",w+1),t.createElement("input",{"aria-label":`\u5355\u4F4D${w+1}`,type:"text",value:l,onChange:c=>{let x=s.map((g,z)=>z===w?c.target.value:g);h(x.some(g=>g.trim())?x.map((g,z)=>`${z+1}. ${g}`).join(`
`):"")}}))))}function wt({field:n,displayValue:h,onChange:s}){let v=n.key!=="plan.notes"&&vt(n),l=Dt(n),w=["date","datetime-local"].includes(n.kind)?n.value:h??n.value,c=Ve(null);return St(()=>{if(!c.current)return;let x=c.current.scrollTop;c.current.style.height="auto",c.current.style.height=Math.max(l?104:192,c.current.scrollHeight)+"px",c.current.scrollTop=x},[w,v,l]),n.key==="plan.partners"?t.createElement(Lt,{field:n,onChange:s}):t.createElement("label",{className:"df-field"+(v?" df-field-paragraph":"")+(l?" df-field-compact":""),id:"df-"+n.key},t.createElement("span",null,n.label,n.required&&t.createElement("em",null,"\u5FC5\u586B")),n.options?t.createElement("select",{"aria-label":n.label,value:w,onChange:x=>s(x.target.value)},t.createElement("option",{value:""},"\u8BF7\u9009\u62E9"),w&&!n.options.includes(w)&&t.createElement("option",{value:w,disabled:!0},w,"\uFF08\u8BF7\u91CD\u65B0\u9009\u62E9\uFF09"),n.options.map(x=>t.createElement("option",{key:x,value:x},x))):v?t.createElement("textarea",{ref:c,"aria-label":n.label,rows:l?3:8,value:w,onChange:x=>s(x.target.value)}):t.createElement("input",{"aria-label":n.label,type:n.key==="plan.notes"?"text":n.kind,readOnly:!!n.read_only,step:n.kind==="number"?"any":void 0,value:w,onChange:x=>s(x.target.value)}),n.help&&t.createElement("details",{className:"df-field-help"},t.createElement("summary",null,"\u586B\u5199\u8BF4\u660E"),t.createElement("p",null,n.help)))}function Tt({fields:n,onChange:h}){let s=n.filter(l=>/^selection\.member\d+_name$/.test(l.key));if(!s.length)return null;let v={unit:["\u5730\u4E0B\u7A7A\u95F4\u5229\u7528\u7814\u7A76\u6240",...n.filter(l=>["contact.department","project.executing_unit"].includes(l.key)).map(l=>l.value)],title:["\u526F\u6240\u957F/\u9AD8\u5DE5","\u4F01\u4E1A\u9AD8\u7EA7\u4E13\u5BB6/\u9AD8\u5DE5","\u90E8\u95E8\u8D1F\u8D23\u4EBA/\u9AD8\u5DE5","\u4E00\u7EA7\u5DE5\u7A0B\u5E08/\u9AD8\u5DE5","\u9AD8\u7EA7\u5DE5\u7A0B\u5E08","\u5DE5\u7A0B\u5E08","\u6559\u6388","\u526F\u6559\u6388"],category:["\u4E3B\u4EFB","\u526F\u4E3B\u4EFB","\u79D1\u59D4\u4F1A\u6210\u5458","\u4E13\u5BB6","\u7EC4\u957F","\u6210\u5458"]};return t.createElement("section",{className:"df-group df-selection-members","aria-label":"\u8BBA\u8BC1\u6210\u5458"},t.createElement("h3",null,"\u8BBA\u8BC1\u6210\u5458"),t.createElement("p",{className:"df-muted"},"\u6BCF\u4EBA\u4E00\u884C\u3002\u5355\u4F4D\u3001\u804C\u52A1/\u804C\u79F0\u548C\u7C7B\u522B\u53EF\u9009\u62E9\uFF0C\u4E5F\u53EF\u76F4\u63A5\u8F93\u5165\u3002"),t.createElement("div",{className:"df-member-scroll"},t.createElement("table",{className:"df-member-table"},t.createElement("thead",null,t.createElement("tr",null,t.createElement("th",{scope:"col"},"\u5E8F\u53F7"),t.createElement("th",{scope:"col"},"\u59D3\u540D"),t.createElement("th",{scope:"col"},"\u5355\u4F4D"),t.createElement("th",{scope:"col"},"\u804C\u52A1/\u804C\u79F0"),t.createElement("th",{scope:"col"},"\u7C7B\u522B"))),t.createElement("tbody",null,s.map((l,w)=>{let c=l.key.replace(/name$/,"");return t.createElement("tr",{key:l.key},t.createElement("th",{scope:"row"},String(w+1).padStart(2,"0")),["name","unit","title","category"].map(x=>{let g=n.find(_=>_.key===c+x);if(!g)return t.createElement("td",{key:x});let z=x==="name"?[]:[...new Set([...v[x],...n.filter(_=>new RegExp(`^selection\\.member\\d+_${x}$`).test(_.key)).map(_=>_.value)].filter(Boolean))],d="df-options-"+g.key;return t.createElement("td",{key:x},t.createElement("input",{"aria-label":g.label,value:g.value,list:z.length?d:void 0,autoComplete:"off",onChange:_=>h(g.key,_.target.value)}),z.length>0&&t.createElement("datalist",{id:d},z.map(_=>t.createElement("option",{value:_,key:_}))))}))})))))}function It({project:n,workflowStage:h,initialCaseId:s,initialView:v,editRequest:l=0,initialDraft:w,onBack:c,onChanged:x,onDirtyChange:g,onBusyChange:z,onViewChange:d,docked:_=!1,onPreview:E,onStageStatus:X,onEditBasics:U}){let[o,P]=de(null),[D,L]=de(null),[M,F]=de([]),[b,S]=de("import"),[W,H]=de(!1),[T,u]=de(null),[O,p]=de(!1),[C,oe]=de(""),[Q,ee]=de(""),[K,N]=de(""),[I,ie]=de(null),[Te,Pe]=de(null),se=Ve(null),le=Ve(null),Ie=Ve(0),te=Ve(!0),at=he.host.useTheme?.()||"light",pe=()=>x?.()||Promise.resolve();je(()=>(te.current=!0,(w?Promise.resolve(w):re("/cases/"+s)).then(i=>{te.current&&(fe(i),S(v==="files"&&i.generations.length?"files":"edit"),v==="files"&&i.generations.length&&ie({file:i.generations[0].files[0],generation:i.generations[0]}))}).catch(i=>te.current&&ee(i.message)),(he.workspace?.loadPreview?he.workspace.loadPreview():Promise.resolve(ge)).then(i=>{te.current&&Pe(()=>i)}).catch(i=>{te.current&&Pe(()=>ge)}),()=>{te.current=!1,Ie.current++}),[]),je(()=>{l&&(S("edit"),p(!1))},[l]),je(()=>{g?.(W)},[W]),je(()=>{z?.(C)},[C]),je(()=>{d?.()},[b]),je(()=>{let i=r=>{W&&(r.preventDefault(),r.returnValue="")};return window.addEventListener("beforeunload",i),()=>window.removeEventListener("beforeunload",i)},[W]);async function Y(i,r){if(C)return;let k=++Ie.current;oe(i),ee(""),N("");try{await r()}catch(B){te.current&&k===Ie.current&&ee(B.message)}finally{te.current&&k===Ie.current&&oe("")}}function fe(i){te.current&&(P({...i,recipients:et(i.recipients),presentation_sources:Object.fromEntries(i.fields.map(r=>[r.key,r.value]))}),H(!1),u(null),p(!1))}function ye(i){P(i),H(!0),u(null),p(!1),N("")}function qe(i,r,k,B=!1){let ue=o.recipients.map((Qe,nt)=>nt===i?{...Qe,[r]:k,...r!=="name"?{["follow_"+r]:B}:{}}:Qe);ye({...o,recipients:et(ue)})}async function me(){if(!W)return o;let i={revision:o.revision,name:o.name.trim()||"\u672A\u547D\u540D\u586B\u62A5",values:Object.fromEntries(o.fields.map(k=>[k.key,k.value])),recipients:o.recipients},r=await re("/cases/"+o.id,{...$e(i),method:"PUT"});return fe(r),r}function Xe(){return!W||window.confirm("\u5F53\u524D\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\u3002\u79BB\u5F00\u6B64\u8BB0\u5F55\uFF1F")}let ae=o?.stage_id==="plan"&&o?.plan_schema===1,ke=o?.stage_id==="selection"&&o?.selection_schema===1,ne=o?.stage_id==="contract",Z=ae||ke||ne,Se=Z?"\u6587\u4E66\u6A21\u677F":"Word \u6A21\u677F",Oe=Z?o.fields.filter(i=>i.scope!=="shared"):o?.fields||[],ce=o?.templates||[],Ee=ce.reduce((i,r)=>i+(r.per_recipient?o.recipients.length:1),0),Ue=(o?.generations||[]).filter(i=>!_||(i.stage_id||o.original_stage_id||h.id)===h.id),V=Ue[0];je(()=>{_&&b==="files"&&V&&!Ue.some(i=>i.id===I?.generation.id)&&ie({file:V.files[0],generation:V})},[b,V?.id]);let Be=T?.checks.filter(i=>i.status!=="ok")||[];async function j(i){!i||!Xe()||await Y("\u8BFB\u53D6 Excel",async()=>{let r=new FormData;r.append("workbook",i),r.append("revision",n.revision),r.append("stage_id",h.id);let k=await re(`/projects/${n.id}/${n.single_form?"form":"cases"}/import`,{method:"POST",body:r});fe(k),ie(null),S("edit"),await pe(),N(k.templates.length?"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\uFF0C\u5E76\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002":k.template_notice||"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\u3002\u8BF7\u6DFB\u52A0\u5BF9\u5E94\u7684 Word \u6A21\u677F\u3002")})}async function Fe(i){i=Array.from(i),i.length&&await Y("\u8BFB\u53D6 Word \u6A21\u677F",async()=>{let r=await me(),k=new FormData;k.append("revision",String(r.revision)),Array.from(i).forEach(B=>k.append("files",B)),fe(await re("/cases/"+r.id+"/templates",{method:"POST",body:k})),await pe(),N("Word \u6A21\u677F\u5DF2\u6DFB\u52A0\uFF0C\u751F\u6210\u65F6\u4F1A\u4FDD\u7559\u539F\u6709\u6392\u7248\u3002")})}async function it(){await Y("\u6838\u5BF9\u8D44\u6599",async()=>{let i=await me(),r=await re("/cases/"+i.id+"/review",$e({revision:i.revision}));te.current&&(u(r),p(!1),S("review"),await pe())})}async function R(){await Y("\u751F\u6210\u6587\u4E66",async()=>{let i=await re("/cases/"+o.id+"/generate",$e({revision:o.revision,review_token:T.review_token,confirmed:O}));fe(i),S("files"),ie({file:i.generations[0].files[0],generation:i.generations[0]}),await pe()})}function He(i){S("edit"),requestAnimationFrame(()=>{let r=document.getElementById("df-"+i);r?.scrollIntoView({behavior:"smooth",block:"center"}),r?.querySelector("input,textarea")?.focus()})}let Ae=(i,r)=>`/cases/${o.id}/outputs/${i.id}/${encodeURIComponent(r)}`;function Ne(i){return Y("\u6B63\u5728\u4E0B\u8F7D\u538B\u7F29\u5305",async()=>{await tt(Ae(i,"\u5168\u90E8\u6587\u4E66.zip"),i.bundle_name||o.name+"_\u6587\u4E66.zip"),N(`\u5DF2\u5F00\u59CB\u4E0B\u8F7D\u8BE5\u6279\u6B21\u7684 ${i.files.length} \u4EFD\u6587\u4E66\u538B\u7F29\u5305\u3002`)})}let J=I?{id:I.generation.id+I.file.name,title:I.file.name,source:"generated",mimeType:I.file.name.endsWith(".xlsx")?"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":Et,extension:I.file.name.endsWith(".xlsx")?"xlsx":"docx",binaryUrl:I.file.preview_url,printUrl:st+`/cases/${o.id}/print/${I.generation.id}/${encodeURIComponent(I.file.name)}`,agentId:he.host.getSelectedAgentId?.(),createdAt:Date.parse(I.generation.created_at)}:null;return je(()=>{_&&b==="files"&&J&&E?.({artifact:J,reference:{case_id:o.id,generation_id:I.generation.id,name:I.file.name}})},[b,I?.generation.id,I?.file.name]),t.createElement("div",{className:"df-app df-embedded-editor","data-theme":at},t.createElement("input",{ref:se,type:"file",accept:".xlsx",hidden:!0,"aria-label":"\u5BFC\u5165 Excel \u53D8\u91CF\u8868",onChange:i=>{j(i.target.files[0]),i.target.value=""}}),t.createElement("input",{ref:le,type:"file",accept:".docx,.xlsx",multiple:!0,hidden:!0,"aria-label":"\u5BFC\u5165 Word \u6A21\u677F",onChange:i=>{Fe(i.target.files),i.target.value=""}}),t.createElement("section",{className:"df-main"},!_&&t.createElement("div",{className:"df-editor-context"},t.createElement("button",{disabled:!!C,onClick:()=>{Xe()&&c()}},"\u2190 \u8FD4\u56DE",h.title),t.createElement("span",null,n.name," / ",h.title),_&&t.createElement("button",{disabled:!!C||W,title:W?"\u8BF7\u5148\u4FDD\u5B58\u8868\u5355":"\u66F4\u65B0\u5F53\u524D\u8282\u70B9\u7684\u529E\u7406\u4FE1\u606F",onClick:X},"\u529E\u7406\u4FE1\u606F\u4E0E\u72B6\u6001"),o&&t.createElement("div",{className:"df-actions"},t.createElement("button",{disabled:!!C,onClick:()=>{L("adopt"),F([])}},"\u6838\u5BF9\u9879\u76EE\u8D44\u6599\u5DEE\u5F02"),t.createElement("button",{disabled:!!C,onClick:()=>{L("publish"),F([])}},"\u5B58\u5165\u9879\u76EE\u5E95\u7A3F"))),t.createElement("header",{className:"df-header"},t.createElement("div",null,!_&&t.createElement("span",{className:"df-eyebrow"},h.title," / \u586B\u5199\u4E0E\u751F\u6210"),t.createElement("h1",null,o?_?"\u586B\u5199\u5185\u5BB9":o.name:"\u586B\u5199\u9879\u76EE\u8D44\u6599"),t.createElement("p",null,o?W?"\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539":`\u8349\u7A3F\u5DF2\u4FDD\u5B58 \xB7 ${Ge(o.updated_at)}`:"\u5BFC\u5165\u53D8\u91CF\u8868\u4E0E Word \u6A21\u677F\uFF0C\u586B\u5199\u3001\u6838\u5BF9\uFF0C\u518D\u751F\u6210\u6587\u4E66\u3002")),o&&t.createElement("button",{disabled:!!C||!W,onClick:()=>Y("\u4FDD\u5B58\u8349\u7A3F",async()=>{await me(),await pe(),N("\u8349\u7A3F\u5DF2\u4FDD\u5B58")})},"\u4FDD\u5B58\u8349\u7A3F")),_?t.createElement("div",{className:"df-node-tools","aria-label":"\u8868\u5355\u64CD\u4F5C"},b!=="edit"&&t.createElement("button",{disabled:!!C,onClick:()=>{S("edit"),p(!1)}},"\u8FD4\u56DE\u586B\u5199"),t.createElement("button",{disabled:!!C,onClick:()=>se.current.click()},"\u5BFC\u5165 Excel"),V&&b!=="files"&&t.createElement("button",{disabled:!!C,onClick:()=>S("files")},"\u67E5\u770B\u751F\u6210\u6587\u4EF6"),t.createElement("details",null,t.createElement("summary",null,"\u66F4\u591A\u64CD\u4F5C"),t.createElement("div",{className:"df-actions"},t.createElement("button",{disabled:!!C,onClick:()=>{L("adopt"),F([])}},"\u6838\u5BF9\u9879\u76EE\u8D44\u6599\u5DEE\u5F02"),t.createElement("button",{disabled:!!C,onClick:()=>{L("publish"),F([])}},"\u5B58\u5165\u9879\u76EE\u5E95\u7A3F")))):t.createElement("div",{className:"df-steps","aria-label":"\u586B\u5199\u6D41\u7A0B"},[["import","01","\u5BFC\u5165\u6A21\u677F"],["edit","02","\u586B\u5199\u8D44\u6599"],["review","03","\u6838\u5BF9\u751F\u6210"],["files","04","\u6587\u4EF6\u9884\u89C8"]].map(([i,r,k])=>t.createElement("button",{key:i,"aria-current":b===i?"step":void 0,className:b===i?"active":"",disabled:!!C||!o&&i!=="import"||i==="files"&&!V,onClick:()=>i==="review"?it():S(i)},t.createElement("span",null,r),k))),Q&&t.createElement("div",{className:"df-alert error",role:"alert"},Q,t.createElement("button",{"aria-label":"\u5173\u95ED\u9519\u8BEF\u63D0\u793A",onClick:()=>ee("")},"\xD7")),K&&t.createElement("div",{className:"df-alert",role:"status"},K),C&&t.createElement("div",{className:"df-progress",role:"status"},C,"\u2026"),t.createElement("fieldset",{className:"df-content",disabled:!!C},b==="import"&&t.createElement("div",{className:"df-import"},t.createElement("section",{className:"df-paper df-drop"},t.createElement("div",{className:"df-file-mark"},"XLSX"),t.createElement("h2",null,"\u4ECE Excel \u53D8\u91CF\u8868\u5F00\u59CB"),t.createElement("p",null,"\u201C\u53D8\u91CF\u914D\u7F6E\u201D\u5DE5\u4F5C\u8868\u4FDD\u7559\u4E09\u5217\uFF1A",t.createElement("br",null),t.createElement("b",null,"\u53D8\u91CF\u540D\u79F0\u3000\u4E2D\u6587\u540D\u79F0\u3000\u503C")),t.createElement("button",{className:"df-primary",onClick:()=>se.current.click()},"\u9009\u62E9 Excel \u53D8\u91CF\u8868"),t.createElement("small",null,"\u652F\u6301 .xlsx \xB7 \u5355\u4E2A\u6587\u4EF6\u4E0D\u8D85\u8FC7 15 MB")),t.createElement("section",{className:"df-paper df-import-note"},t.createElement("span",{className:"df-eyebrow"},"\u5982\u4F55\u51C6\u5907"),t.createElement("h2",null,"\u4E00\u4EFD\u6570\u636E\uFF0C\u591A\u4EFD\u6587\u4E66"),t.createElement("ol",null,t.createElement("li",null,t.createElement("b",null,"\u6574\u7406\u53D8\u91CF"),t.createElement("p",null,"\u4F8B\u5982 project.name / \u9879\u76EE\u540D\u79F0 / \u5B9E\u9645\u540D\u79F0\u3002\u652F\u6301\u5206\u7EC4\u3001\u7C7B\u578B\u548C\u5FC5\u586B\u5217\u3002")),t.createElement("li",null,t.createElement("b",null,"\u81EA\u52A8\u8F7D\u5165\u6A21\u677F"),t.createElement("p",null,"\u5E94\u7528\u81EA\u5E26 5 \u4EFD\u6807\u51C6 Word \u6A21\u677F\uFF0C\u4F7F\u7528\u914D\u5957 Excel \u5373\u53EF\u81EA\u52A8\u8F7D\u5165\uFF1B \u4E5F\u53EF\u6DFB\u52A0\u81EA\u5DF1\u7684\u6A21\u677F\u3002")),t.createElement("li",null,t.createElement("b",null,"\u5206\u522B\u751F\u6210\u9080\u8BF7\u51FD"),t.createElement("p",null,"\u5728\u201C\u53D7\u9080\u5355\u4F4D\u201D\u8868\u8BB0\u5F55\u5355\u4F4D\u540D\u79F0\u3001\u9886\u53D6\u5F00\u59CB\u65F6\u95F4\u548C\u9886\u53D6\u7ED3\u675F\u65F6\u95F4\u3002"))),t.createElement("p",{className:"df-muted"},"\u201C\u65E5\u671F\u6821\u6838\u201D\u8868\u4E2D\u7684\u65E7\u7ED3\u679C\u4E0D\u4F1A\u4F5C\u4E3A\u5224\u65AD\u4F9D\u636E\uFF1B\u5E94\u7528\u4F1A\u6839\u636E\u5F53\u524D\u586B\u5199\u5185\u5BB9\u91CD\u65B0\u6838\u5BF9\u3002\u201C\u6821\u6838\u89C4\u5219\u201D\u8868\u53EF\u8865\u5145\u81EA\u5B9A\u4E49\u5148\u540E\u5173\u7CFB\u3002"))),o&&b==="edit"&&t.createElement("div",{className:"df-edit-layout"},t.createElement("section",{className:"df-paper"},t.createElement("div",{className:"df-section-head"},!_&&t.createElement("h2",null,"\u586B\u5199\u4FE1\u606F"),t.createElement("button",{onClick:()=>Y("\u5BFC\u51FA Excel",async()=>{let i=await me();await tt(`/cases/${i.id}/excel`,(i.fields.find(r=>r.key==="project.name")?.value||i.name).replace(/[<>:"/\\|?*\x00-\x1f]/g,"_").slice(0,80)+"_\u586B\u5199\u6570\u636E.xlsx")})},"\u5BFC\u51FA\u5F53\u524D Excel")),t.createElement("label",{className:"df-field df-title-field"},t.createElement("span",null,"\u8868\u5355\u540D\u79F0"),t.createElement("input",{"aria-label":"\u8868\u5355\u540D\u79F0",maxLength:120,value:o.name,onChange:i=>ye({...o,name:i.target.value})})),Z&&t.createElement("section",{className:"df-plan-reference","aria-label":"\u5F15\u7528\u7684\u57FA\u7840\u4FE1\u606F"},t.createElement("div",{className:"df-section-head"},t.createElement("div",null,t.createElement("h3",null,ne?"\u5408\u540C\u5BA1\u67E5\u5F15\u7528\u8D44\u6599":"\u5F15\u7528\u7684\u57FA\u7840\u4FE1\u606F"),t.createElement("p",{className:"df-muted"},ne?"\u81EA\u52A8\u5F15\u7528\u57FA\u7840\u4FE1\u606F\u53CA\u8BA1\u5212\u3001\u8BBA\u8BC1\u3001\u8C08\u5224\u9636\u6BB5\u8D44\u6599\u3002\u8BF7\u5728\u539F\u9636\u6BB5\u66F4\u6B63\uFF0C\u8FD4\u56DE\u672C\u9636\u6BB5\u540E\u4F1A\u540C\u6B65\u5F15\u7528\uFF1B\u8FD9\u91CC\u53EA\u6838\u5BF9\u5408\u540C\uFF0C\u4E0D\u91CD\u590D\u586B\u5199\u3002":"\u8FD9\u4E9B\u8D44\u6599\u7531\u57FA\u7840\u4FE1\u606F\u586B\u62A5\u7EF4\u62A4\uFF0C\u6838\u5BF9\u540E\u7528\u4E8E\u672C\u6B21\u751F\u6210\u3002")),U&&t.createElement("button",{onClick:()=>Y("\u4FDD\u5B58\u5E76\u6253\u5F00\u57FA\u7840\u4FE1\u606F",async()=>{await me(),U()})},"\u7F16\u8F91\u57FA\u7840\u4FE1\u606F")),t.createElement("details",null,t.createElement("summary",null,"\u67E5\u770B\u5F15\u7528\u7684\u9879\u76EE\u8D44\u6599"),t.createElement("dl",null,o.fields.filter(i=>i.scope==="shared").map(i=>t.createElement("div",{key:i.key,id:"df-"+i.key},t.createElement("dt",null,i.label),t.createElement("dd",null,i.value||"\u5C1A\u672A\u586B\u5199\uFF0C\u8BF7\u5230\u57FA\u7840\u4FE1\u606F\u586B\u62A5\u8865\u5145")))))),[...new Set(Oe.filter(i=>!/^selection\.member\d+_/.test(i.key)).map(i=>i.group))].map(i=>t.createElement("section",{className:"df-group",key:i},t.createElement("h3",null,i),i==="\u65E5\u671F\u5B89\u6392"&&t.createElement("p",{className:"df-muted"},"\u6587\u4E66\u7EDF\u4E00\u4F7F\u7528\u4E2D\u6587\u65E5\u671F\uFF0C\u4F8B\u5982\u201C2026\u5E7410\u670822\u65E5\u4E0B\u534814:30\u201D\u3002\u65E5\u671F\u9009\u62E9\u5668\u4FDD\u7559\u539F\u6765\u7684\u586B\u5199\u65B9\u5F0F\u3002"),t.createElement("div",{className:"df-fields"},Oe.filter(r=>r.group===i&&!/^selection\.member\d+_/.test(r.key)).map(r=>t.createElement(wt,{key:r.key,field:r,displayValue:o.presentation_sources?.[r.key]===r.value?o.document_values?.[r.key]:void 0,onChange:k=>ye({...o,fields:o.fields.map(B=>B.key===r.key?{...B,value:k}:B)})}))))),t.createElement(Tt,{fields:Oe,onChange:(i,r)=>ye({...o,fields:o.fields.map(k=>k.key===i?{...k,value:r}:k)})})),!Z&&t.createElement("section",{className:"df-paper"},t.createElement("div",{className:"df-section-head"},t.createElement("div",null,t.createElement("h2",null,"\u53D7\u9080\u5355\u4F4D"," ",t.createElement("span",{className:"df-count"},o.recipients.length)),t.createElement("p",null,"\u6309\u5355\u4F4D\u6587\u4E66\u5206\u522B\u751F\u6210\uFF0C\u5171\u7528\u9879\u76EE\u4E0E\u843D\u6B3E\u4FE1\u606F\u3002")),t.createElement("button",{onClick:()=>ye({...o,recipients:et([...o.recipients,{name:"",start:"",end:""}])}),disabled:o.recipients.length>=200},"\uFF0B \u6DFB\u52A0\u5355\u4F4D")),o.recipients.map((i,r)=>t.createElement("div",{className:"df-recipient",key:r,id:"df-recipient-"+r},t.createElement("div",{className:"df-recipient-title"},t.createElement("b",null,String(r+1).padStart(2,"0")),t.createElement("button",{"aria-label":`\u79FB\u9664\u7B2C${r+1}\u5BB6\u5355\u4F4D`,onClick:()=>ye({...o,recipients:et(o.recipients.filter((k,B)=>B!==r))})},"\u79FB\u9664")),t.createElement("div",{className:"df-fields"},[["name","\u5355\u4F4D\u540D\u79F0"],["start","\u9886\u53D6\u5F00\u59CB\u65F6\u95F4"],["end","\u9886\u53D6\u7ED3\u675F\u65F6\u95F4"]].map(([k,B])=>t.createElement("label",{className:"df-field "+(k==="name"?"df-span":""),key:k},t.createElement("span",null,B),t.createElement("input",{"aria-label":`\u7B2C${r+1}\u5BB6${B}`,type:k==="name"?"text":"datetime-local",value:k==="name"?i[k]:i[k].replace(" ","T"),onChange:ue=>qe(r,k,ue.target.value)}),r>0&&k!=="name"&&t.createElement("small",{className:"df-follow-state"},i["follow_"+k]?"\u8DDF\u968F\u7B2C1\u5BB6":"\u5DF2\u5355\u72EC\u8BBE\u7F6E",!i["follow_"+k]&&t.createElement("button",{type:"button","aria-label":`\u7B2C${r+1}\u5BB6${B}\u6062\u590D\u8DDF\u968F`,onClick:ue=>{ue.preventDefault(),qe(r,k,o.recipients[0][k],!0)}},"\u6062\u590D\u8DDF\u968F")))))))),t.createElement("section",{className:"df-paper df-template-panel","aria-label":Se},t.createElement("div",{className:"df-section-head"},t.createElement("h2",null,Se),t.createElement("div",{className:"df-template-actions"},ce.length>0?t.createElement("button",{onClick:()=>Y("\u4FDD\u5B58\u9ED8\u8BA4\u6A21\u677F",async()=>{let i=await me();await re(`/cases/${i.id}/defaults`,$e({revision:i.revision})),N(h.id==="negotiation"?"\u5DF2\u8BBE\u4E3A\u672C\u673A\u9ED8\u8BA4\u6A21\u677F\uFF0C\u4EE5\u540E\u65B0\u5EFA\u586B\u62A5\u4F1A\u81EA\u52A8\u8F7D\u5165\u3002":"\u5DF2\u8BBE\u4E3A\u672C\u9636\u6BB5\u9ED8\u8BA4\u6A21\u677F\uFF0C\u4EE5\u540E\u65B0\u5EFA\u8BE5\u9636\u6BB5\u8868\u5355\u4F1A\u81EA\u52A8\u8F7D\u5165\u3002")})},h.id==="negotiation"?"\u8BBE\u4E3A\u9ED8\u8BA4\u6A21\u677F":"\u8BBE\u4E3A\u672C\u9636\u6BB5\u9ED8\u8BA4\u6A21\u677F"):t.createElement("button",{onClick:()=>Y("\u8F7D\u5165\u9ED8\u8BA4\u6A21\u677F",async()=>{let i=await me();fe(await re(`/cases/${i.id}/defaults/apply`,$e({revision:i.revision}))),N("\u5DF2\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002")})},"\u4F7F\u7528\u9ED8\u8BA4\u6A21\u677F"),t.createElement("button",{onClick:()=>le.current.click()},"\uFF0B \u6DFB\u52A0"))),!ce.length&&t.createElement("p",{className:"df-muted"},"\u6DFB\u52A0\u4E0E\u4F60\u7684\u53D8\u91CF\u8868\u5BF9\u5E94\u7684 .docx \u6216 .xlsx \u6A21\u677F\u3002"),ce.map(i=>t.createElement("div",{className:"df-template",key:i.id},t.createElement("b",null,i.name),i.from_builtin&&t.createElement("small",null,"\u5E94\u7528\u81EA\u5E26\u6A21\u677F"),t.createElement("span",null,i.per_recipient?"\u6309\u53D7\u9080\u5355\u4F4D\u5206\u522B\u751F\u6210":"\u5171\u7528\u6587\u4EF6 \xB7 \u751F\u6210\u4E00\u4EFD"),i.print_copies>1&&t.createElement("small",null,"\u5EFA\u8BAE\u6253\u5370 ",i.print_copies," \u4EFD \xB7 ",i.print_note),t.createElement("button",{"aria-label":"\u79FB\u9664\u6A21\u677F"+i.name,onClick:()=>Y("\u79FB\u9664\u6A21\u677F",async()=>{let r=await me();fe(await re(`/cases/${r.id}/templates/${i.id}?revision=${r.revision}`,{method:"DELETE"}))})},"\u79FB\u9664")))),t.createElement("section",{className:"df-paper df-edit-footer","aria-label":"\u6838\u5BF9\u4E0E\u751F\u6210"},t.createElement("div",{className:"df-generation-plan"},t.createElement("h2",null,"\u6838\u5BF9\u4E0E\u751F\u6210"),t.createElement("p",null,"\u672C\u6B21\u8BA1\u5212\u751F\u6210 ",t.createElement("b",null,Ee)," \u4EFD\u6587\u4E66"),t.createElement("small",null,ke?"\u751F\u6210\u8BBA\u8BC1\u610F\u89C1\u53CA\u7B7E\u5B57\u8868\uFF0C\u4EE5\u53CA\u8BBA\u8BC1\u7ED3\u675F\u540E\u4E0A\u4F20\u7684\u975E\u62DB\u6807\u65B9\u6848\u3002\u7B7E\u5B57\u76D6\u7AE0\u540E\uFF0C\u5728\u9636\u6BB5\u6750\u6599\u4E2D\u7559\u5B58\u626B\u63CF\u4EF6\u3002":ae?"\u6309\u672C\u6B21\u586B\u5199\u5185\u5BB9\u751F\u6210 Word \u8BF4\u660E\u4E0E Excel \u8BA1\u5212\u8868\u3002":t.createElement(t.Fragment,null,ce.filter(i=>!i.per_recipient).length," ","\u4EFD\u5171\u7528\u6587\u4EF6 \xB7"," ",ce.filter(i=>i.per_recipient).length," ","\u7C7B\u6309\u5355\u4F4D\u6587\u4E66 \xD7 ",o.recipients.length," \u5BB6\u5355\u4F4D"))),t.createElement("div",{className:"df-next-action"},t.createElement("button",{className:"df-primary",onClick:it},"\u6838\u5BF9\u586B\u5199\u5185\u5BB9 \u2192"),t.createElement("small",null,ke?"\u6838\u5BF9\u8BBA\u8BC1\u610F\u89C1\u3001\u4E09\u5BB6\u5355\u4F4D\u4E0E\u6210\u5458\u4FE1\u606F\uFF0C\u518D\u786E\u8BA4\u751F\u6210":ae?"\u5148\u6838\u5BF9\u57FA\u7840\u4FE1\u606F\u4E0E\u7533\u62A5\u7ECF\u8D39\uFF0C\u518D\u786E\u8BA4\u751F\u6210":"\u5148\u6838\u5BF9\u7F3A\u9879\u4E0E\u65E5\u671F\uFF0C\u518D\u786E\u8BA4\u751F\u6210")))),o&&b==="review"&&T&&t.createElement("div",{className:"df-review"},t.createElement("section",{className:"df-paper"},t.createElement("span",{className:"df-eyebrow"},"\u586B\u5199\u6838\u5BF9"),t.createElement("h2",null,T.can_generate?"\u8D44\u6599\u5DF2\u9F50\u5907\uFF0C\u8BF7\u786E\u8BA4\u672C\u6B21\u5185\u5BB9\u3002":`\u8FD8\u6709 ${Be.length} \u9879\u9700\u8981\u5904\u7406`),t.createElement("p",null,"\u672C\u6B21\u4F7F\u7528\u4FEE\u8BA2 ",o.revision," \u7684\u6570\u636E\uFF0C\u8BA1\u5212\u751F\u6210 ",Ee," ","\u4EFD\u6587\u4E66\u3002"),Be.length>0&&t.createElement("div",{className:"df-checks"},Be.map((i,r)=>t.createElement("div",{key:r,className:"df-check "+i.status},t.createElement("span",null,i.status==="ok"?"\u901A\u8FC7":i.status==="missing"?"\u5F85\u8865\u5145":"\u51B2\u7A81"),t.createElement("div",null,t.createElement("b",null,i.label),t.createElement("p",null,i.detail)),i.status!=="ok"&&i.field&&t.createElement("button",{onClick:()=>He(i.field)},"\u4FEE\u6539")))),T.checks.some(i=>i.status==="ok")&&t.createElement("details",{className:"df-passed"},t.createElement("summary",null,T.checks.filter(i=>i.status==="ok").length," ","\u9879\u65E5\u671F\u6821\u6838\u901A\u8FC7 \xB7 \u67E5\u770B\u660E\u7EC6"),T.checks.filter(i=>i.status==="ok").map((i,r)=>t.createElement("p",{key:r},t.createElement("b",null,i.label),t.createElement("br",null),i.detail.replaceAll("T"," ")))),t.createElement("div",{className:"df-review-data"},t.createElement("h3",null,"\u5171\u7528\u4FE1\u606F"),t.createElement("dl",null,o.fields.map(i=>t.createElement("div",{key:i.key,className:vt(i)?"df-span":void 0},t.createElement("dt",null,i.label),t.createElement("dd",null,(o.document_values?.[i.key]??i.value)||"\u5C1A\u672A\u586B\u5199")))),o.recipients.length>0&&t.createElement(t.Fragment,null,t.createElement("h3",null,"\u53D7\u9080\u5355\u4F4D"),o.recipients.map((i,r)=>t.createElement("p",{key:r},r+1,". ",i.name||"\u5C1A\u672A\u586B\u5199",o.recipient_document_times?.[r]??`${i.start.replace("T"," ")} \u2014 ${i.end.replace("T"," ")}`)))),t.createElement("div",{className:"df-review-data"},t.createElement("h3",null,"\u8F93\u51FA\u6E05\u5355"),ce.map(i=>t.createElement("p",{key:i.id},i.name," \xB7"," ",i.per_recipient?o.recipients.map(r=>r.name||"\u5F85\u586B\u5355\u4F4D").join("\u3001"):"\u5171\u7528\u6587\u4EF6",i.print_copies>1&&` \xB7 \u5EFA\u8BAE\u6253\u5370 ${i.print_copies} \u4EFD\uFF0C\u6BCF\u4F4D\u4E13\u5BB6\u4E00\u4EFD`))),t.createElement("div",{className:"df-confirm"},t.createElement("label",null,t.createElement("input",{type:"checkbox",checked:O,disabled:!T.can_generate,onChange:i=>p(i.target.checked)}),ke?"\u6211\u5DF2\u6838\u5BF9\u8BBA\u8BC1\u610F\u89C1\u3001\u5019\u9009\u5355\u4F4D\u3001\u6210\u5458\u4E0E\u7CFB\u7EDF\u586B\u62A5\u4FE1\u606F":ae?"\u6211\u5DF2\u6838\u5BF9\u57FA\u7840\u4FE1\u606F\u3001\u7533\u62A5\u7ECF\u8D39\u548C\u5916\u534F\u5FC5\u8981\u6027":"\u6211\u5DF2\u6838\u5BF9\u586B\u5199\u5185\u5BB9\u3001\u53D7\u9080\u5355\u4F4D\u548C\u65E5\u671F\u5B89\u6392"),t.createElement("p",null,ke?"\u751F\u6210\u540E\u8BF7\u5B8C\u6210\u7EBF\u4E0B\u7B7E\u5B57\u76D6\u7AE0\uFF0C\u518D\u5C06\u975E\u62DB\u6807\u65B9\u6848\u548C\u7B7E\u5B57\u6750\u6599\u4E0A\u4F20\u4E1A\u52A1\u7CFB\u7EDF\u3002":ae?"\u7533\u62A5\u53E3\u5F84\u4E0E\u6A21\u677F\u7248\u5F0F\u8BF7\u7531\u7ECF\u529E\u4EBA\u590D\u6838\u3002":"\u6821\u6838\u68C0\u67E5\u8D44\u6599\u5B8C\u6574\u6027\u53CA\u65F6\u95F4\u987A\u5E8F\u3002\u4E1A\u52A1\u6761\u6B3E\u4E0E Word \u6A21\u677F\u8BF7\u7531\u7ECF\u529E\u4EBA\u590D\u6838\u3002"),t.createElement("div",null,t.createElement("button",{onClick:()=>{S("edit"),p(!1)}},"\u8FD4\u56DE\u4FEE\u6539"),t.createElement("button",{className:"df-primary",disabled:!T.can_generate||!O,onClick:R},"\u786E\u8BA4\u5E76\u751F\u6210 ",Ee," \u4EFD\u6587\u4E66"))))),o&&b==="files"&&V&&t.createElement("div",{className:"df-results"+(_?" df-results-docked":"")},t.createElement("section",{className:"df-paper df-output-list"},t.createElement("span",{className:"df-eyebrow"},"\u751F\u6210\u8BB0\u5F55"),t.createElement("h2",null,V.files.length," \u4EFD\u6587\u4EF6\u5DF2\u751F\u6210"),t.createElement("p",null,Ge(V.created_at)," \xB7 \u4FEE\u8BA2 ",V.revision),t.createElement("p",{className:"df-muted"},ke?"\u538B\u7F29\u5305\u5305\u542B\u8BBA\u8BC1\u610F\u89C1\u53CA\u7B7E\u5B57\u8868\u3001\u975E\u62DB\u6807\u65B9\u6848\u3001\u586B\u5199\u6570\u636E\u548C\u6838\u5BF9\u8BB0\u5F55":ae?"\u538B\u7F29\u5305\u5305\u542B Word\u3001\u79D1\u7814\u8BA1\u5212\u8868\u3001\u586B\u5199\u6570\u636E\u548C\u6838\u5BF9\u8BB0\u5F55":"\u538B\u7F29\u5305\u5305\u542B Word\u3001\u586B\u5199\u6570\u636E\u548C\u6838\u5BF9\u8BB0\u5F55"),(W||(V.content_digest?V.content_digest!==o.content_digest:V.revision!==o.revision))&&t.createElement("div",{className:"df-alert"},"\u586B\u5199\u5185\u5BB9\u5DF2\u6709\u4FEE\u6539\uFF0C\u4E0B\u5217\u6587\u4EF6\u4FDD\u7559\u751F\u6210\u65F6\u7684\u5185\u5BB9\u3002\u8BF7\u91CD\u65B0\u6838\u5BF9\u5E76\u751F\u6210\u65B0\u7248\u3002"),Ue.map(i=>t.createElement("div",{className:"df-generation",key:i.id},t.createElement("div",{className:"df-generation-heading"},t.createElement("h3",null,Ge(i.created_at)," \xB7 \u4FEE\u8BA2 ",i.revision,i.date_style!=="zh-CN"&&" \xB7 \u539F\u65E5\u671F\u683C\u5F0F",i.naming_style!=="formal"&&" \xB7 \u539F\u6587\u4EF6\u540D"),t.createElement("button",{"aria-label":`\u6253\u5305\u4E0B\u8F7D ${Ge(i.created_at)} \u4FEE\u8BA2 ${i.revision}`,onClick:()=>Ne(i)},"\u6253\u5305\u4E0B\u8F7D")),i.files.map(r=>t.createElement("div",{className:"df-output "+(I?.file.name===r.name&&I?.generation.id===i.id?"selected":""),key:r.name},t.createElement("button",{onClick:()=>ie({file:r,generation:i})},t.createElement("b",null,r.name),t.createElement("small",null,r.recipient," \xB7 ",(r.size/1024).toFixed(0)," KB",r.print_copies>1&&` \xB7 \u5EFA\u8BAE\u6253\u5370 ${r.print_copies} \u4EFD`)),t.createElement("button",{"aria-label":"\u4E0B\u8F7D"+r.name,onClick:()=>Y("\u4E0B\u8F7D\u6587\u4EF6",()=>tt(Ae(i,r.name),r.name))},"\u2193")))))),!_&&t.createElement("section",{className:"df-paper df-preview"},t.createElement("div",{className:"df-section-head"},t.createElement("h2",null,I?I.file.name:"\u9009\u62E9\u6587\u4EF6\u9884\u89C8"),t.createElement("span",null,"Office \u9884\u89C8")),t.createElement("div",{className:"df-preview-body"},J&&Te?t.createElement(Je,{key:J.id,artifact:J},t.createElement(Te,{key:J.id,artifact:J,readOnly:!0,hostControls:!0})):t.createElement("p",{className:"df-muted"},J?"\u6B63\u5728\u6253\u5F00\u6587\u4EF6\u2026":"\u4ECE\u5DE6\u4FA7\u9009\u62E9\u4E00\u4EFD\u6587\u4EF6\u3002"))))),t.createElement("footer",{className:"df-footer"},t.createElement("span",null,"UGSci \xB7 \u5916\u534F\u52A9\u624B"))),D&&o&&t.createElement("div",{className:"df-dialog-backdrop"},t.createElement("section",{className:"df-dialog df-paper",role:"dialog","aria-modal":"true","aria-label":"\u6838\u5BF9\u5171\u7528\u8D44\u6599"},t.createElement("div",{className:"df-section-head"},t.createElement("h2",null,D==="adopt"?"\u91C7\u7528\u9879\u76EE\u5E95\u7A3F\u4E2D\u7684\u8D44\u6599":"\u5C06\u672C\u8868\u8D44\u6599\u5B58\u5165\u9879\u76EE\u5E95\u7A3F"),t.createElement("button",{disabled:!!C,onClick:()=>L(null),"aria-label":"\u5173\u95ED\u5171\u7528\u8D44\u6599\u6838\u5BF9"},"\xD7")),t.createElement("p",{className:"df-muted"},"\u53EA\u66F4\u65B0\u52FE\u9009\u9879\u3002\u539F\u751F\u6210\u6587\u4EF6\u4FDD\u7559\uFF0C\u540E\u7EED\u751F\u6210\u524D\u9700\u91CD\u65B0\u6838\u5BF9\u3002"),Q&&t.createElement("p",{role:"alert",className:"df-alert error"},Q),t.createElement("div",{className:"df-compare"},n.fields.filter(i=>o.fields.some(r=>r.key===i.key&&r.value!==i.value)).map(i=>{let r=o.fields.find(k=>k.key===i.key);return t.createElement("label",{key:i.key},t.createElement("input",{type:"checkbox",checked:M.includes(i.key),onChange:k=>F(k.target.checked?[...M,i.key]:M.filter(B=>B!==i.key))}),t.createElement("div",null,t.createElement("b",null,i.label),t.createElement("div",{className:"df-compare-values"},t.createElement("p",null,t.createElement("small",null,"\u5F53\u524D\u8868\u5355"),r.value||"\u7A7A\u767D"),t.createElement("p",null,t.createElement("small",null,"\u9879\u76EE\u5E95\u7A3F"),i.value||"\u7A7A\u767D"))))}),!n.fields.some(i=>o.fields.some(r=>r.key===i.key&&r.value!==i.value))&&t.createElement("p",null,"\u672C\u8868\u4E0E\u9879\u76EE\u5E95\u7A3F\u4E2D\u7684\u5171\u7528\u8D44\u6599\u4E00\u81F4\u3002")),t.createElement("div",{className:"df-actions"},t.createElement("button",{disabled:!!C,onClick:()=>L(null)},"\u53D6\u6D88"),t.createElement("button",{className:"df-primary",disabled:!!C||!M.length,onClick:()=>Y("\u540C\u6B65\u5171\u7528\u8D44\u6599",async()=>{let i=await me();if(D==="adopt")fe(await re(`/projects/${n.id}/cases/${i.id}/sync`,$e({revision:n.revision,case_revision:i.revision,keys:M})));else{let r=Object.fromEntries(i.fields.filter(k=>M.includes(k.key)).map(k=>[k.key,k.value]));await re(`/projects/${n.id}`,{...$e({revision:n.revision,name:r["project.name"]??n.name,code:r["project.code"]??n.code,owner:n.owner,values:r}),method:"PUT"})}await pe(),L(null),N("\u6240\u9009\u8D44\u6599\u5DF2\u540C\u6B65\uFF0C\u8BF7\u91CD\u65B0\u6838\u5BF9\u540E\u751F\u6210\u65B0\u7248\u6587\u4E66\u3002")})},D==="adopt"?"\u91C7\u7528\u6240\u9009\u9879\u76EE\u8D44\u6599":"\u4FDD\u5B58\u6240\u9009\u8D44\u6599\u5230\u5E95\u7A3F")))))}function Ot(){let n=he.host.useSelectedAgent?.();return t.createElement(ot,{key:n?.id||he.host.getSelectedAgentId?.()||"default",Editor:It,services:{request:re,json:$e,download:tt,time:Ge,Field:wt}})}he.registerRoutes("document-forms",[{path:"/apps/document-forms",component:Ot,label:"\u5916\u534F\u52A9\u624B",icon:"\u25A4"}]);})();
