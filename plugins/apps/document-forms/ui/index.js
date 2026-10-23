(()=>{var T=window.QwenPaw.host.React,{useEffect:Ge,useState:fe}=T;function Te({artifact:n,children:u}){let[p,c]=fe("print"),[l,y]=fe([]),[f,k]=fe(0),[r,_]=fe(""),[w,A]=fe(0),[M,o]=fe(100);return Ge(()=>{if(p!=="print")return;let j=new AbortController,z=[];return y([]),k(0),_(""),window.QwenPaw.host.fetch(n.printUrl+"?pages=true",{headers:n.agentId?{"X-Agent-Id":n.agentId}:{},signal:j.signal}).then(async P=>{if(!P.ok){let v=await P.json().catch(()=>({}));throw new Error(typeof v.detail=="string"?v.detail:"\u6253\u5370\u9884\u89C8\u6682\u4E0D\u53EF\u7528\uFF0C\u53EF\u5207\u6362\u6587\u5B57\u9884\u89C8\u6216\u4E0B\u8F7D Word \u67E5\u770B")}let{pages:m}=await P.json();if(!j.signal.aborted){if(!Number.isInteger(m)||m<1||m>40)throw new Error("\u672A\u83B7\u5F97\u6709\u6548\u7684 Word \u9875\u6570");k(m);for(let v=1;v<=m;v++){let N=await window.QwenPaw.host.fetch(n.printUrl+"?page="+v,{headers:n.agentId?{"X-Agent-Id":n.agentId}:{},signal:j.signal});if(!N.ok)throw new Error(`\u7B2C ${v} \u9875\u672A\u80FD\u6E32\u67D3\uFF0C\u8BF7\u91CD\u65B0\u9884\u89C8`);let O=await N.blob();if(j.signal.aborted)return;let b=URL.createObjectURL(O);z.push(b),y($=>[...$,b])}}}).catch(P=>{j.signal.aborted||_(P.message||"\u6253\u5370\u9884\u89C8\u672A\u5B8C\u6210")}),()=>{j.abort(),z.forEach(P=>URL.revokeObjectURL(P))}},[n.id,n.printUrl,n.agentId,p,w]),T.createElement("div",{className:"df-print-preview"},T.createElement("div",{className:"df-print-toolbar"},T.createElement("div",null,T.createElement("button",{"aria-pressed":p==="print",onClick:()=>c("print")},"\u6253\u5370\u7248\u5F0F"),T.createElement("button",{"aria-pressed":p==="text",onClick:()=>c("text")},"\u6587\u5B57\u9884\u89C8")),p==="print"&&T.createElement("div",null,f>0&&T.createElement("span",null,"\u5171 ",f," \u9875"),T.createElement("select",{"aria-label":"\u9884\u89C8\u6BD4\u4F8B",value:M,onChange:j=>o(Number(j.target.value))},T.createElement("option",{value:100},"\u9002\u5408\u5BBD\u5EA6"),T.createElement("option",{value:125},"125%"),T.createElement("option",{value:150},"150%"),T.createElement("option",{value:200},"200%")))),p==="text"?T.createElement("div",{className:"df-text-preview"},u):r?T.createElement("div",{className:"df-preview-message",role:"alert"},T.createElement("p",null,r),T.createElement("button",{onClick:()=>A(j=>j+1)},"\u91CD\u65B0\u9884\u89C8")):l.length?T.createElement("div",{className:"df-print-scroll"},T.createElement("div",{className:"df-print-pages",style:{width:M+"%"}},l.map((j,z)=>T.createElement("figure",{key:z},T.createElement("figcaption",null,"\u7B2C ",z+1," \u9875"),T.createElement("img",{src:j,alt:n.title+` \xB7 \u6253\u5370\u7248\u5F0F \xB7 \u7B2C ${z+1} \u9875`}))),l.length<f&&T.createElement("p",{role:"status"},"\u6B63\u5728\u6392\u7248\u7B2C ",l.length+1," \u9875\u2026"))):T.createElement("div",{className:"df-preview-message",role:"status"},"\u6B63\u5728\u6392\u7248\u6253\u5370\u9875\u9762\u2026"))}function ne({artifact:n}){let[u,p]=fe(null),[c,l]=fe(""),[y,f]=fe(0);if(Ge(()=>{let r=new AbortController;return p(null),l(""),window.QwenPaw.host.fetch("/workspace/convert-office",{method:"POST",headers:{"Content-Type":"application/json",...n.agentId?{"X-Agent-Id":n.agentId}:{}},signal:r.signal,body:JSON.stringify({url:n.binaryUrl,mime_type:n.mimeType})}).then(async _=>{let w=await _.json();if(!_.ok)throw new Error(typeof w.detail=="string"?w.detail:"\u6587\u4EF6\u9884\u89C8\u672A\u5B8C\u6210");r.signal.aborted||p(w)}).catch(_=>{r.signal.aborted||l(_.message||"\u6587\u4EF6\u9884\u89C8\u672A\u5B8C\u6210")}),()=>r.abort()},[n.id,n.binaryUrl,n.mimeType,n.agentId,y]),c)return T.createElement("div",{className:"df-preview-message",role:"alert"},T.createElement("p",null,c),T.createElement("button",{onClick:()=>f(r=>r+1)},"\u91CD\u65B0\u9884\u89C8"),T.createElement("p",null,"\u4E5F\u53EF\u4EE5\u4ECE\u6587\u4EF6\u6E05\u5355\u4E0B\u8F7D\u540E\u67E5\u770B\u3002"));if(!u)return T.createElement("div",{className:"df-preview-message",role:"status"},"\u6B63\u5728\u6253\u5F00\u6587\u4EF6\u2026");let k=u.engine==="officecli"?u.html:`<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;color:#333;background:#fff;padding:24px 32px;line-height:1.7;max-width:900px;margin:0 auto}table{border-collapse:collapse;width:100%;margin:12px 0}td,th{border:1px solid #ddd;padding:8px 12px}img{max-width:100%;height:auto}h1{font-size:1.6em}h2{font-size:1.3em}.docx-page-break{border-top:2px dashed #ccc;margin:32px 0}</style></head><body>${u.html||""}</body></html>`;return T.createElement("iframe",{className:"df-office-frame",title:n.title,srcDoc:k,sandbox:u.engine==="officecli"?"allow-scripts":"allow-same-origin"})}var Ke=`.df-app {
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
  grid-template-columns: 190px minmax(440px, 1fr) minmax(360px, 0.82fr);
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
    grid-template-columns: 150px minmax(380px, 1fr) 330px;
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
    grid-template-columns: 130px minmax(360px, 1fr);
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
`;var Le=window.QwenPaw,g=Le.host.React,{useState:me,useEffect:it}=g,Ve={running:"\u6B63\u5728\u6838\u67E5",completed:"\u6838\u67E5\u5B8C\u6210",failed:"\u672A\u5B8C\u6210",interrupted:"\u5DF2\u4E2D\u65AD"},Xe=".doc,.docx,.pdf,.xls,.xlsx,.png,.jpg,.jpeg";function ze({project:n,services:u,onChanged:p}){let{request:c,download:l,time:y}=u,[f,k]=me(null),[r,_]=me(""),[w,A]=me(null),[M,o]=me([]),[j,z]=me(""),[P,m]=me(""),[v,N]=me(!1),[O,b]=me(""),[$,W]=me(0);it(()=>{let h=!0,D,x=!1;async function U(){try{let F=await c(`/projects/${n.id}/response-reviews`);if(!h)return;k(F),b("");let L=F.records.some(de=>de.status==="running");x&&!L&&p(),x=L,L&&(D=setTimeout(U,3e3))}catch(F){h&&b(F.message)}}return U(),()=>{h=!1,clearTimeout(D)}},[n.id,$]);let Q=f?.records.some(h=>h.status==="running"),S=f?.records.find(h=>h.id===P)||f?.records[0],ee=Le.host.ReactMarkdown;async function q(h){h.preventDefault(),b(""),N(!0);try{let D=new FormData;r?D.set("reference_id",r):w&&D.set("reference",w);for(let U of M)D.append("responses",U);D.set("focus",j);let x=await c(`/projects/${n.id}/response-reviews`,{method:"POST",body:D});m(x.id),k(U=>({...U,records:[x,...U?.records||[]]})),W(U=>U+1)}catch(D){b(D.message)}finally{N(!1)}}return g.createElement("div",{className:"df-response-review"},g.createElement("p",{className:"df-muted"},"\u5BF9\u7167\u8C08\u5224\u6587\u4EF6\uFF0C\u9010\u5BB6\u68C0\u67E5\u8D44\u8D28\u3001\u6280\u672F\u54CD\u5E94\u3001\u62A5\u4EF7\u3001\u65E5\u671F\u4E0E\u7B7E\u7AE0\u9644\u4EF6\u3002\u6838\u67E5\u610F\u89C1\u4F9B\u7ECF\u529E\u4EBA\u548C\u4E13\u5BB6\u590D\u6838\u3002"),O&&g.createElement("div",{className:"df-alert error",role:"alert"},O,g.createElement("button",{onClick:()=>W(h=>h+1)},"\u91CD\u65B0\u52A0\u8F7D")),f?g.createElement(g.Fragment,null,g.createElement("form",{onSubmit:q},g.createElement("fieldset",{disabled:v||Q},g.createElement("label",{className:"df-field"},g.createElement("span",null,"\u6838\u67E5\u4F9D\u636E"),g.createElement("select",{"aria-label":"\u6838\u67E5\u4F9D\u636E",value:r,onChange:h=>{_(h.target.value),A(null)}},g.createElement("option",{value:""},"\u4E0A\u4F20\u6B63\u5F0F\u8C08\u5224\u6587\u4EF6"),f.references.map(h=>g.createElement("option",{key:h.id,value:h.id},h.label)))),!r&&g.createElement("label",{className:"df-field"},g.createElement("span",null,"\u6B63\u5F0F\u8C08\u5224\u6587\u4EF6"),g.createElement("input",{"aria-label":"\u4E0A\u4F20\u6838\u67E5\u4F9D\u636E",type:"file",accept:Xe,required:!0,onChange:h=>A(h.target.files[0]||null)})),g.createElement("label",{className:"df-field"},g.createElement("span",null,"\u5404\u5355\u4F4D\u54CD\u5E94\u6750\u6599"),g.createElement("input",{"aria-label":"\u4E0A\u4F20\u54CD\u5E94\u6750\u6599",type:"file",multiple:!0,required:!0,accept:Xe,onChange:h=>o([...h.target.files])})),M.length>0&&g.createElement("ul",{className:"df-review-files"},M.map((h,D)=>g.createElement("li",{key:D},h.name))),g.createElement("p",{className:"df-muted"},"\u652F\u6301 Word\u3001PDF\u3001Excel \u548C\u56FE\u7247\uFF1B\u53EF\u4E00\u6B21\u9009\u62E9\u591A\u5BB6\u6750\u6599\u3002\u6BCF\u4EFD\u4E0D\u8D85\u8FC7 15 MB\uFF0C\u6BCF\u6B21\u6700\u591A 20 \u4EFD\u3001\u5408\u8BA1 100 MB\u3002\u538B\u7F29\u5305\u8BF7\u5148\u89E3\u538B\u3002"),g.createElement("label",{className:"df-field"},g.createElement("span",null,"\u8865\u5145\u5173\u6CE8\u70B9\uFF08\u9009\u586B\uFF09"),g.createElement("textarea",{"aria-label":"\u8865\u5145\u6838\u67E5\u5173\u6CE8\u70B9",rows:3,maxLength:3e3,value:j,onChange:h=>z(h.target.value),placeholder:"\u4F8B\u5982\uFF1A\u91CD\u70B9\u6838\u5BF9\u62A5\u4EF7\u5927\u5C0F\u5199\u3001\u6210\u679C\u4EA4\u4ED8\u65F6\u95F4\u548C\u8D44\u8D28\u6709\u6548\u671F"})),g.createElement("div",{className:"df-actions"},g.createElement("button",{className:"df-primary",disabled:v||Q||!(r||w)||!M.length},v?"\u6B63\u5728\u63D0\u4EA4\u2026":"\u5F00\u59CB\u6838\u67E5"),g.createElement("span",{className:"df-muted"},"\u4F7F\u7528\u201C\u54CD\u5E94\u6587\u4EF6\u6838\u67E5\u201D\u667A\u80FD\u4F53\uFF0C\u6CBF\u7528\u8F6F\u4EF6\u4E2D\u7684\u6A21\u578B\u914D\u7F6E\u3002")))),f.records.length>0&&g.createElement("section",{className:"df-review-history"},g.createElement("div",{className:"df-section-head"},g.createElement("h3",null,"\u6838\u67E5\u8BB0\u5F55"),g.createElement("button",{onClick:()=>W(h=>h+1)},"\u5237\u65B0\u8BB0\u5F55")),g.createElement("div",{className:"df-review-records"},f.records.map(h=>g.createElement("button",{key:h.id,"aria-pressed":S?.id===h.id,onClick:()=>m(h.id)},y(h.created_at)," \xB7 ",Ve[h.status]))),S&&g.createElement("article",{"aria-label":"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5\u7ED3\u679C"},g.createElement("div",{className:"df-section-head"},g.createElement("div",null,g.createElement("b",null,Ve[S.status]),g.createElement("p",{className:"df-muted"},"\u57FA\u4E8E\u9879\u76EE\u4FEE\u8BA2 ",S.project_revision," \xB7"," ",S.files.length," \u4EFD\u6750\u6599\uFF1B\u540E\u7EED\u6750\u6599\u4FEE\u6539\u8BF7\u91CD\u65B0\u6838\u67E5\u3002")),S.status==="completed"&&g.createElement("button",{onClick:async()=>{try{await l(`/projects/${n.id}/response-reviews/${S.id}/report`,`${n.name}_\u54CD\u5E94\u6587\u4EF6\u6838\u67E5\u8BB0\u5F55_${S.id.slice(0,8)}.md`)}catch(h){b(h.message)}}},"\u4E0B\u8F7D\u6838\u67E5\u8BB0\u5F55")),g.createElement("details",null,g.createElement("summary",null,"\u672C\u6B21\u6838\u67E5\u6750\u6599\u4E0E\u5173\u6CE8\u70B9"),g.createElement("ul",null,S.files.map((h,D)=>g.createElement("li",{key:D},h.role,"\uFF1A",h.name))),g.createElement("p",null,S.focus||"\u65E0\u8865\u5145\u5173\u6CE8\u70B9")),S.status==="running"&&g.createElement("p",{role:"status",className:"df-alert"},"\u6B63\u5728\u8BFB\u53D6\u5E76\u6838\u67E5\u6750\u6599\uFF0C\u53EF\u5173\u95ED\u6B64\u7A97\u53E3\uFF0C\u7A0D\u540E\u56DE\u5230\u672C\u9879\u76EE\u67E5\u770B\u7ED3\u679C\u3002"),S.error&&g.createElement("p",{role:"alert",className:"df-alert error"},S.error),S.report&&g.createElement("div",{className:"df-review-report"},ee?g.createElement(ee,{remarkPlugins:Le.host.remarkGfm?[Le.host.remarkGfm]:[],components:{a:({children:h})=>g.createElement("span",null,h),img:()=>null}},S.report):g.createElement("div",{style:{whiteSpace:"pre-wrap"}},S.report))))):g.createElement("p",{role:"status"},"\u6B63\u5728\u8BFB\u53D6\u6838\u67E5\u8BB0\u5F55\u2026"))}var ye=window.QwenPaw,s=ye.host.React,{useState:we,useEffect:We,useRef:at}=s;function nt(n,u,p){return{artifact:{id:u.id+p.name,title:p.name,source:"generated",extension:"docx",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",binaryUrl:p.preview_url,printUrl:`/document-forms/cases/${n.case_id}/print/${u.id}/${encodeURIComponent(p.name)}`,agentId:ye.host.getSelectedAgentId?.(),createdAt:Date.parse(u.created_at)},reference:{case_id:n.case_id,generation_id:u.id,name:p.name}}}function rt({project:n,stageId:u,selection:p,services:c}){let{request:l,json:y,time:f}=c,[k,r]=we([]),[_,w]=we(""),[A,M]=we(!1),[o,j]=we(""),[z,P]=we(0),m=at(null);We(()=>{let b=!0,$;async function W(){try{let Q=await l(`/projects/${n.id}/assistant`);if(!b)return;r(Q.messages),j(""),Q.messages.some(S=>S.status==="running")&&($=setTimeout(W,2500))}catch(Q){b&&j(Q.message)}}return W(),()=>{b=!1,clearTimeout($)}},[n.id,z]),We(()=>{m.current?.scrollIntoView?.({block:"nearest"})},[k.length,k.at(-1)?.status]);let v=A||k.some(b=>b.status==="running"),N=ye.host.ReactMarkdown;async function O(b){if(b.preventDefault(),!(!_.trim()||v)){M(!0),j("");try{let $=await l(`/projects/${n.id}/assistant`,y({message:_.trim(),stage_id:u||"overview",file:p?.reference||{}}));r(W=>[...W,$]),w(""),P(W=>W+1)}catch($){j($.message)}finally{M(!1)}}}return s.createElement("section",{className:"df-project-chat","aria-label":"\u9879\u76EE\u667A\u80FD\u4F53\u95EE\u7B54"},s.createElement("p",{className:"df-muted"},"\u7ED3\u5408\u5DF2\u4FDD\u5B58\u7684\u9879\u76EE\u8D44\u6599\u548C\u5F53\u524D\u9884\u89C8\u56DE\u7B54\uFF0C\u95EE\u7B54\u968F\u9879\u76EE\u4FDD\u7559\u3002"),s.createElement("div",{className:"df-chat-messages","aria-live":"polite"},!k.length&&s.createElement("div",{className:"df-chat-welcome"},s.createElement("h3",null,"\u56F4\u7ED5\u5F53\u524D\u9879\u76EE\u63D0\u95EE"),s.createElement("p",null,"\u53EF\u4EE5\u68B3\u7406\u672C\u9636\u6BB5\u8FD8\u9700\u51C6\u5907\u7684\u6750\u6599\uFF0C\u6216\u5BF9\u7167\u9884\u89C8\u6587\u4EF6\u6838\u5B9E\u5185\u5BB9\u3002"),["\u672C\u9636\u6BB5\u8FD8\u9700\u8981\u51C6\u5907\u54EA\u4E9B\u6750\u6599\uFF1F","\u5E2E\u6211\u6838\u5BF9\u5F53\u524D\u6587\u4EF6\u4E2D\u7684\u65E5\u671F\u548C\u91D1\u989D\u3002"].map(b=>s.createElement("button",{key:b,onClick:()=>w(b)},b))),k.map(b=>s.createElement("article",{className:"df-chat-turn",key:b.id},s.createElement("div",{className:"df-chat-question"},s.createElement("small",null,"\u6211 \xB7 ",f(b.created_at)),s.createElement("p",null,b.message),b.file_name&&s.createElement("small",null,"\u53C2\u8003\u6587\u4EF6\uFF1A",b.file_name)),b.reply&&s.createElement("div",{className:"df-chat-answer"},s.createElement("small",null,"\u9879\u76EE\u52A9\u624B"),N?s.createElement(N,{remarkPlugins:ye.host.remarkGfm?[ye.host.remarkGfm]:[],components:{img:()=>null,a:({children:$})=>s.createElement("span",null,$)}},b.reply):s.createElement("p",{style:{whiteSpace:"pre-wrap"}},b.reply)),b.status==="running"&&s.createElement("p",{role:"status",className:"df-muted"},"\u6B63\u5728\u7ED3\u5408\u9879\u76EE\u8D44\u6599\u6574\u7406\u56DE\u7B54\u2026"),b.error&&s.createElement("p",{role:"alert",className:"df-alert error"},b.error))),s.createElement("div",{ref:m})),o&&s.createElement("p",{role:"alert",className:"df-alert error"},o,s.createElement("button",{onClick:()=>P(b=>b+1)},"\u91CD\u65B0\u52A0\u8F7D")),s.createElement("form",{className:"df-chat-composer",onSubmit:O},p&&s.createElement("small",{className:"df-chat-context"},"\u53C2\u8003\u6587\u4EF6\uFF1A",p.artifact.title),s.createElement("textarea",{"aria-label":"\u5411\u9879\u76EE\u667A\u80FD\u4F53\u63D0\u95EE",placeholder:"\u8F93\u5165\u5F53\u524D\u9879\u76EE\u7684\u95EE\u9898\u2026",rows:3,maxLength:4e3,value:_,onChange:b=>w(b.target.value)}),s.createElement("div",{className:"df-actions"},s.createElement("button",{className:"df-primary",disabled:v||!_.trim()},v?"\u6B63\u5728\u56DE\u7B54\u2026":"\u53D1\u9001\u95EE\u9898"))))}function qe({project:n,stageId:u,services:p,mode:c,onMode:l,selection:y,onSelect:f,attachment:k,AttachmentPreview:r,onChanged:_,dirty:w=!1}){let[A,M]=we(null),[o,j]=we("");async function z(m,v){try{j(""),await p.download(m,v)}catch(N){j(N.message)}}We(()=>{let m=!0;return(ye.workspace?.loadPreview?ye.workspace.loadPreview():Promise.resolve(ne)).then(v=>m&&M(()=>v)).catch(()=>m&&M(()=>ne)),()=>{m=!1}},[]);let P=n.forms.flatMap(m=>m.generations.flatMap(v=>u&&u!=="overview"&&u!=="profile"&&(v.stage_id||m.original_stage_id||m.stage_id)!==u?[]:[{form:m,generation:v}]));return s.createElement("aside",{className:"df-right-workspace","aria-label":"\u9879\u76EE\u667A\u80FD\u4F53\u4E0E\u6587\u4EF6\u9884\u89C8"},s.createElement("header",null,s.createElement("div",null,s.createElement("span",{className:"df-eyebrow"},"\u9879\u76EE\u5DE5\u4F5C\u533A"),s.createElement("h2",null,c==="preview"?"\u6587\u4EF6\u9884\u89C8":c==="review"?"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5":"\u667A\u80FD\u4F53\u95EE\u7B54")),s.createElement("div",{className:"df-dock-tabs",role:"tablist","aria-label":"\u53F3\u4FA7\u5DE5\u4F5C\u533A"},s.createElement("button",{role:"tab","aria-selected":c==="assistant",onClick:()=>l("assistant")},"\u95EE\u7B54"),s.createElement("button",{role:"tab","aria-selected":c==="preview",onClick:()=>l("preview")},"\u9884\u89C8"))),o&&s.createElement("p",{role:"alert",className:"df-alert error"},o),s.createElement("div",{className:"df-right-body",hidden:c!=="assistant"},s.createElement(rt,{project:n,stageId:["overview","profile"].includes(u)?"overview":u,selection:y,services:p}),u==="negotiation"&&s.createElement("button",{className:"df-open-review",onClick:()=>l("review")},"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5 \u2192")),s.createElement("div",{className:"df-right-body",hidden:c!=="review"},s.createElement("button",{className:"df-back-link",onClick:()=>l("assistant")},"\u2190 \u8FD4\u56DE\u95EE\u7B54"),c==="review"&&s.createElement(ze,{key:n.id,project:n,services:p,onChanged:_})),s.createElement("div",{className:"df-right-body df-dock-files",hidden:c!=="preview"},w&&s.createElement("p",{className:"df-alert"},"\u4E2D\u95F4\u8868\u5355\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\uFF0C\u9884\u89C8\u6587\u4EF6\u4FDD\u7559\u751F\u6210\u65F6\u7684\u5185\u5BB9\u3002"),s.createElement("details",{open:!y&&!k,className:"df-dock-file-list"},s.createElement("summary",null,"\u672C\u9636\u6BB5\u6587\u4EF6 \xB7"," ",P.reduce((m,v)=>m+v.generation.files.length,0)," \u4EFD"),P.map(({form:m,generation:v})=>s.createElement("section",{className:"df-generation",key:v.id},s.createElement("div",{className:"df-generation-heading"},s.createElement("h3",null,p.time(v.created_at)," \xB7 \u4FEE\u8BA2"," ",v.revision,v.date_style!=="zh-CN"&&" \xB7 \u539F\u65E5\u671F\u683C\u5F0F",v.naming_style!=="formal"&&" \xB7 \u539F\u6587\u4EF6\u540D"),s.createElement("button",{onClick:()=>z(`/cases/${m.case_id}/outputs/${v.id}/\u5168\u90E8\u6587\u4E66.zip`,v.bundle_name||n.name+"_\u6587\u4E66.zip")},"\u6253\u5305\u4E0B\u8F7D")),v.files.map(N=>s.createElement("div",{className:"df-dock-file-row",key:N.name},s.createElement("button",{className:"df-dock-file","aria-label":N.name,onClick:()=>f(nt(m,v,N))},N.name,s.createElement("small",null,N.recipient," \xB7 ",(N.size/1024).toFixed(0)," KB",N.print_copies>1&&` \xB7 \u5EFA\u8BAE\u6253\u5370 ${N.print_copies} \u4EFD`)),s.createElement("button",{"aria-label":"\u4E0B\u8F7D"+N.name,onClick:()=>z(`/cases/${m.case_id}/outputs/${v.id}/${encodeURIComponent(N.name)}`,N.name)},"\u2193"))))),!P.length&&s.createElement("p",{className:"df-muted"},"\u751F\u6210\u6587\u4E66\u6216\u4ECE\u4E2D\u95F4\u7684\u6750\u6599\u6E05\u5355\u9009\u62E9\u6587\u4EF6\u540E\uFF0C\u5728\u8FD9\u91CC\u9884\u89C8\u3002"),n.forms.filter(m=>m.case_id!==n.form_id).map(m=>s.createElement("button",{className:"df-dock-file",key:m.case_id,onClick:()=>z(`/cases/${m.case_id}/excel`,m.name+"_\u5386\u53F2\u5E95\u7A3F.xlsx")},"\u5386\u53F2\u5E95\u7A3F\uFF1A",m.name," \u2193"))),P.length>0&&s.createElement("p",{className:"df-muted"},"\u6587\u4EF6\u4FDD\u7559\u5404\u6279\u6B21\u751F\u6210\u65F6\u7684\u5185\u5BB9\uFF0C\u4FEE\u6539\u8868\u5355\u540E\u8BF7\u91CD\u65B0\u6838\u5BF9\u751F\u6210\u3002"),k?s.createElement(r,{key:k.id,file:k,projectId:n.id,download:z,embedded:!0,onClose:()=>f(null)}):y?s.createElement("section",{className:"df-dock-preview","aria-label":"\u6587\u4EF6\u9884\u89C8"},s.createElement("h3",null,y.artifact.title),A?s.createElement(Te,{key:y.artifact.id,artifact:y.artifact},s.createElement(A,{artifact:y.artifact,readOnly:!0,hostControls:!0})):s.createElement("p",{role:"status"},"\u6B63\u5728\u6253\u5F00\u9884\u89C8\u2026"),s.createElement("button",{className:"df-dock-ask",onClick:()=>l("assistant")},"\u5C31\u6B64\u6587\u4EF6\u63D0\u95EE \u2192"),s.createElement("button",{className:"df-dock-ask",onClick:()=>z(`/cases/${y.reference.case_id}/outputs/${y.reference.generation_id}/${encodeURIComponent(y.reference.name)}`,y.artifact.title)},"\u4E0B\u8F7D\u5F53\u524D\u6587\u4EF6")):s.createElement("p",{className:"df-dock-empty"},"\u9009\u62E9\u4E00\u4EFD\u6587\u4EF6\uFF0C\u586B\u5199\u4E0E\u9884\u89C8\u53EF\u4EE5\u540C\u65F6\u8FDB\u884C\u3002")))}var ue=window.QwenPaw,t=ue.host.React,{useState:B,useEffect:Ce,useRef:ce}=t,Me={pending:"\u672A\u5F00\u59CB",in_progress:"\u8FDB\u884C\u4E2D",submitted:"\u5DF2\u63D0\u4EA4",completed:"\u5DF2\u5B8C\u6210"},Je={pending:"\u5F85\u51C6\u5907",preparing:"\u6574\u7406\u4E2D",ready:"\u5F85\u63D0\u4EA4",submitted:"\u5DF2\u63D0\u4EA4",done:"\u5DF2\u5B8C\u6210",na:"\u4E0D\u9002\u7528"},dt=["\u4E0A\u62A5\u8BA1\u5212","\u9009\u5546\u8BBA\u8BC1","\u5546\u52A1\u8C08\u5224","\u5F00\u9898\u8BBA\u8BC1","\u7ED3\u9898\u9A8C\u6536","\u5F52\u6863\u4ED8\u6B3E"],He=n=>n?new Date(n).toLocaleString("zh-CN",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}):"";function je({title:n,children:u,onClose:p,error:c,busy:l=!1}){let y=ce(null);return Ce(()=>{let f=document.activeElement;return y.current?.querySelector("input,select,textarea,button")?.focus(),()=>{f?.isConnected&&f.focus()}},[]),t.createElement("div",{className:"df-dialog-backdrop"},t.createElement("section",{ref:y,className:"df-dialog df-paper",role:"dialog","aria-modal":"true","aria-label":n,onKeyDown:f=>{if(f.key==="Escape"&&!l&&(f.stopPropagation(),p()),f.key==="Tab"){let k=[...y.current.querySelectorAll("button,input,textarea,select,a[href]")].filter(r=>!r.disabled);f.shiftKey&&document.activeElement===k[0]&&(f.preventDefault(),k.at(-1)?.focus()),!f.shiftKey&&document.activeElement===k.at(-1)&&(f.preventDefault(),k[0]?.focus())}}},t.createElement("div",{className:"df-section-head"},t.createElement("h2",null,n),t.createElement("button",{type:"button",disabled:l,onClick:p,"aria-label":"\u5173\u95ED"+n},"\xD7")),c&&t.createElement("p",{role:"alert",className:"df-alert error"},c),u))}function Ye({file:n,projectId:u,download:p,onClose:c,embedded:l=!1}){let[y,f]=B(null),[k,r]=B(""),[_,w]=B(""),A=n.name.split(".").pop().toLowerCase(),M=["pdf","png","jpg","jpeg"].includes(A)&&!ue.workspace?.loadPreview;Ce(()=>{let z=!0,P;return M?ue.host.fetch(`/document-forms/projects/${u}/files/${n.id}`).then(async m=>{if(!m.ok)throw new Error("\u9884\u89C8\u672A\u80FD\u6253\u5F00\uFF0C\u8BF7\u4E0B\u8F7D\u67E5\u770B");let v=await m.blob();z&&(P=URL.createObjectURL(new Blob([v],{type:n.mime})),r(P))}).catch(m=>z&&w(m.message)):ue.workspace?.loadPreview||["doc","docx","xls","xlsx","ppt","pptx"].includes(A)?(ue.workspace?.loadPreview?ue.workspace.loadPreview():Promise.resolve(ne)).then(m=>z&&f(()=>m)).catch(()=>z&&f(()=>ne)):w("\u6B64\u683C\u5F0F\u8BF7\u4E0B\u8F7D\u540E\u67E5\u770B\u3002"),()=>{z=!1,P&&URL.revokeObjectURL(P)}},[n.id]);let o={id:n.id,title:n.name,source:"uploaded",extension:A,mimeType:n.mime,binaryUrl:n.preview_url,agentId:ue.host.getSelectedAgentId?.(),createdAt:Date.parse(n.uploaded_at)};return t.createElement(l?"section":je,{...l?{className:"df-dock-preview","aria-label":"\u6587\u4EF6\u9884\u89C8"}:{title:n.name,onClose:c}},l&&t.createElement("h3",null,n.name),t.createElement("div",{className:"df-attachment-preview"},_?t.createElement("p",{role:"alert"},_):M&&k?A==="pdf"?t.createElement("iframe",{title:n.name,src:k,sandbox:"allow-same-origin"}):t.createElement("img",{src:k,alt:n.name}):y?t.createElement(y,{artifact:o,readOnly:!0,hostControls:!0}):t.createElement("p",{role:"status"},"\u6B63\u5728\u6253\u5F00\u9884\u89C8\u2026")),t.createElement("div",{className:"df-actions"},t.createElement("button",{onClick:()=>p(`/projects/${u}/files/${n.id}`,n.name)},"\u4E0B\u8F7D\u539F\u6587\u4EF6"),t.createElement("button",{onClick:c},"\u5173\u95ED\u9884\u89C8")))}function Be({Editor:n,services:u}){let{request:p,json:c,download:l,Field:y}=u,[f,k]=B([]),[r,_]=B(null),[w,A]=B("overview"),[M,o]=B(""),[j,z]=B(null),[P,m]=B(!1),[v,N]=B(!1),[O,b]=B(""),[$,W]=B(""),[Q,S]=B(""),[ee,q]=B(""),[h,D]=B(null),[x,U]=B({}),[F,L]=B(null),[de,oe]=B(null),[Se,te]=B("assistant"),K=ce(!0),se=ce(0),X=ce(null),Ee=ce(null),le=ce(""),G=ce(null),V=ce(null);V.current=r?.id,Ce(()=>{G.current?.scrollTo?.({top:0})},[r?.id,w,j?.id]);let be=ue.host.useTheme?.()||"light",C=r?.stages.find(e=>e.id===w),H=r?.forms.filter(e=>e.stage_id===w)||[],Ne=()=>!P&&!v||window.confirm("\u8D44\u6599\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\uFF0C\u662F\u5426\u653E\u5F03\u8FD9\u4E9B\u4FEE\u6539\u5E76\u79BB\u5F00\uFF1F");async function J(){let e=await p("/projects");return K.current&&k(e),e}async function Y(e=r?.id,a=!1){let d=e?await p("/projects/"+e):null;return K.current&&d&&(a||!V.current||V.current===e)&&(V.current!==d.id&&(L(null),oe(null),te("assistant")),V.current=d.id,_(E=>E?.id===d.id&&E.revision>d.revision?E:d)),await J(),d}Ce(()=>(K.current=!0,W("\u8F7D\u5165\u9879\u76EE"),J().then(async e=>{if(e.length&&K.current){let a=await p("/projects/"+e[0].id);K.current&&_(a)}}).catch(e=>K.current&&S(e.message)).finally(()=>K.current&&W("")),()=>{K.current=!1,se.current++}),[]),Ce(()=>{let e=a=>{(P||v)&&(a.preventDefault(),a.returnValue="")};return window.addEventListener("beforeunload",e),()=>window.removeEventListener("beforeunload",e)},[P,v]);async function I(e,a){if($)return;let d=++se.current;W(e),S(""),q("");try{await a()}catch(E){K.current&&d===se.current&&S(E.message)}finally{K.current&&d===se.current&&W("")}}async function _e(e){Ne()&&await I("\u6253\u5F00\u9879\u76EE",async()=>{z(null),m(!1),N(!1),A("overview"),await Y(e,!0),z(null),m(!1),N(!1),L(null),oe(null),te("assistant"),A("overview")})}async function xe(e){Ne()&&(A(e),z(null),m(!1),N(!1),q(""),S(""),r.single_form&&r.stages.some(a=>a.id===e)&&await I("\u6253\u5F00\u9879\u76EE\u8868\u5355",async()=>{let a=await p(`/projects/${r.id}/form`,c({revision:r.revision,stage_id:e}));await Y(),z({id:a.id,view:"edit",revision:a.revision,initialDraft:a})}))}function ae(e,a){U(a),D(e),S("")}async function he(e,a,d="POST"){let E=await p(e,{...c({...a,revision:r.revision}),method:d});return K.current&&(_(E),D(null)),await J(),E}function De(e){return I(e?"\u8BFB\u53D6\u9636\u6BB5 Excel":"\u51C6\u5907\u8C08\u5224\u8868\u5355",async()=>{let a;if(e){let d=new FormData;d.append("revision",r.revision),d.append("stage_id",w),d.append("workbook",e),a=await p(`/projects/${r.id}/${r.single_form?"form":"cases"}/import`,{method:"POST",body:d})}else a=await p(`/projects/${r.id}/${r.single_form?"form":"cases"}`,c({revision:r.revision,stage_id:w}));await Y(),z({id:a.id,view:"edit",revision:a.revision,initialDraft:r.single_form?a:void 0}),m(!1),e&&q(a.templates.length?"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\uFF0C\u5E76\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002":"\u5DF2\u8BFB\u53D6\u672C\u9636\u6BB5\u53D8\u91CF\u914D\u7F6E\uFF0C\u8BF7\u6DFB\u52A0\u5BF9\u5E94\u7684 Word \u6A21\u677F\u3002")})}function Ie(e){if(!e)return;let a=le.current;return I("\u4FDD\u5B58\u6750\u6599",async()=>{let d=new FormData;d.append("revision",r.revision),d.append("file",e);let E=await p(`/projects/${r.id}/stages/${w}/materials/${a}/files`,{method:"POST",body:d});_(E),await J(),q("\u6750\u6599\u5DF2\u4FDD\u5B58\uFF0C\u539F\u6709\u7248\u672C\u7EE7\u7EED\u4FDD\u7559\u3002\u8BF7\u6838\u5BF9\u540E\u66F4\u65B0\u6750\u6599\u72B6\u6001\u3002")})}let pe=r?`/projects/${r.id}`:"",Ae=e=>{e.preventDefault(),I("\u4FDD\u5B58\u6750\u6599\u4FE1\u606F",()=>he(`${pe}/stages/${w}/materials${x.id?"/"+x.id:""}`,x,x.id?"PUT":"POST"))},ie=e=>I("\u6574\u7406\u4E0B\u8F7D\u5305",()=>l(pe+"/bundle"+(e?"?stage_id="+e:""),`${r.name}_${e?C.title:"\u5168\u6D41\u7A0B\u6750\u6599"}.zip`));return t.createElement("main",{className:"df-app df-project-app"+(r?.single_form?" df-three-column":""),"data-theme":be},t.createElement("style",null,Ke),t.createElement("input",{ref:X,type:"file",accept:".xlsx",hidden:!0,"aria-label":"\u5BFC\u5165\u9636\u6BB5 Excel",onChange:e=>{let a=e.target.files[0];e.target.value="",a&&De(a)}}),t.createElement("input",{ref:Ee,type:"file",accept:".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.png,.jpg,.jpeg,.zip,.txt,.csv",hidden:!0,"aria-label":"\u4E0A\u4F20\u9636\u6BB5\u6750\u6599",onChange:e=>{let a=e.target.files[0];e.target.value="",Ie(a)}}),t.createElement("aside",{className:"df-sidebar df-project-sidebar"},t.createElement("div",{className:"df-brand"},"UGSci ",t.createElement("span",null,"\u9879\u76EE\u6750\u6599")),t.createElement("button",{className:"df-primary df-new",disabled:!!$||!!O,onClick:()=>{Ne()&&ae("create",{name:"",code:"",owner:""})}},"\uFF0B \u65B0\u5EFA\u9879\u76EE"),t.createElement("label",{className:"df-project-search"},t.createElement("span",{className:"df-sr-only"},"\u641C\u7D22\u9879\u76EE"),t.createElement("input",{"aria-label":"\u641C\u7D22\u9879\u76EE",placeholder:"\u641C\u7D22\u9879\u76EE\u540D\u79F0\u6216\u7F16\u53F7",value:M,onChange:e=>o(e.target.value)})),t.createElement("div",{className:"df-caption"},"\u6211\u7684\u9879\u76EE ",t.createElement("span",null,f.length)),t.createElement("nav",{"aria-label":"\u9879\u76EE\u5217\u8868"},f.filter(e=>(e.name+" "+e.code).toLowerCase().includes(M.toLowerCase())).map(e=>t.createElement("button",{key:e.id,disabled:!!$||!!O,"aria-current":r?.id===e.id?"page":void 0,onClick:()=>_e(e.id)},t.createElement("b",null,e.name),t.createElement("small",null,e.code||"\u672A\u8BBE\u7F16\u53F7"," \xB7 ",e.completed,"/6 \u9636\u6BB5\u5B8C\u6210")))),t.createElement("div",{className:"df-sidebar-foot"},t.createElement("b",null,"\u914D\u5957\u6A21\u677F"),t.createElement("p",null,"\u5546\u52A1\u8C08\u5224\u9636\u6BB5\u5DF2\u914D\u597D\u4E94\u4EFD Word \u6A21\u677F\uFF0C\u5176\u4F59\u9636\u6BB5\u53EF\u63A5\u5165\u5404\u81EA\u7684\u7EDF\u4E00\u6A21\u677F\u3002"),t.createElement("button",{disabled:!!$||!!O,onClick:()=>I("\u4E0B\u8F7D\u914D\u5957\u6A21\u677F",()=>l("/starter","\u6587\u4E66\u586B\u62A5_\u914D\u5957\u6A21\u677F.zip"))},"\u4E0B\u8F7D\u914D\u5957\u6A21\u677F \u2197"),t.createElement("small",null,"\u7A7A\u767D Excel \u4E0E 5 \u4EFD\u6807\u51C6 Word"))),t.createElement("section",{className:"df-main df-project-main",ref:G},t.createElement("header",{className:"df-header"},t.createElement("div",null,t.createElement("span",{className:"df-eyebrow"},"UGSCI / \u9879\u76EE\u6750\u6599"),t.createElement("h1",null,r?.name||"\u9879\u76EE\u5DE5\u4F5C\u53F0"),t.createElement("p",null,r?[r.code||"\u672A\u8BBE\u9879\u76EE\u7F16\u53F7",r.owner&&"\u7ECF\u529E\u4EBA\uFF1A"+r.owner].filter(Boolean).join("\u3000\xB7\u3000"):"\u4ECE\u4E0A\u62A5\u8BA1\u5212\u5230\u5F52\u6863\u4ED8\u6B3E\uFF0C\u628A\u540C\u4E00\u9879\u76EE\u7684\u8D44\u6599\u653E\u5728\u4E00\u8D77\u3002")),r&&t.createElement("div",{className:"df-actions"},t.createElement("button",{disabled:!!$||!!O||!!j,onClick:()=>xe("profile")},"\u9879\u76EE\u8D44\u6599"),t.createElement("button",{disabled:!!$||!!O,onClick:()=>ie()},"\u4E0B\u8F7D\u9879\u76EE\u6750\u6599"))),Q&&t.createElement("div",{role:"alert",className:"df-alert error"},Q,t.createElement("button",{"aria-label":"\u5173\u95ED\u9519\u8BEF\u63D0\u793A",onClick:()=>S("")},"\xD7")),ee&&t.createElement("div",{className:"df-alert",role:"status"},ee),$&&t.createElement("div",{className:"df-progress",role:"status"},$,"\u2026"),r?t.createElement(t.Fragment,null,t.createElement("nav",{className:"df-project-tabs","aria-label":"\u9879\u76EE\u9636\u6BB5"},t.createElement("button",{className:w==="overview"?"active":"",disabled:!!$||!!O,onClick:()=>xe("overview")},"\u9879\u76EE\u603B\u89C8"),r.stages.map((e,a)=>t.createElement("button",{key:e.id,"aria-current":w===e.id?"step":void 0,className:w===e.id?"active":"",disabled:!!$||!!O,onClick:()=>xe(e.id)},t.createElement("small",null,String(a+1).padStart(2,"0")),e.title,t.createElement("span",{className:"df-state df-state-"+e.status},e.upstream_changed.length||e.documents_changed?"\u5F85\u590D\u6838":Me[e.status])))),j?t.createElement(n,{key:r.id+":"+j.id+":"+w+":"+(j.revision||""),project:r,workflowStage:C,initialCaseId:j.id,initialView:j.view,initialDraft:j.initialDraft,onDirtyChange:m,onBusyChange:b,onViewChange:()=>G.current?.scrollTo?.({top:0}),onBack:()=>{z(null),m(!1),Y().catch(e=>S(e.message))},onChanged:()=>Y(),docked:r.single_form,onStageStatus:()=>ae("stage",{...C,confirmed:!1}),onPreview:e=>{oe(e),L(null),te("preview")}}):t.createElement("fieldset",{className:"df-content",disabled:!!$||!!O},w==="overview"&&t.createElement(t.Fragment,null,r.migrated&&t.createElement("p",{className:"df-muted df-migration-note"},"\u5386\u53F2\u586B\u62A5\u5DF2\u6309\u9879\u76EE\u540D\u79F0\u6216\u7F16\u53F7\u5F52\u5165\u5546\u52A1\u8C08\u5224\u9636\u6BB5\uFF0C\u539F\u8868\u5355\u3001\u751F\u6210\u6279\u6B21\u548C\u6587\u4EF6\u5747\u4FDD\u7559\u3002"),t.createElement("section",{className:"df-project-metrics"},t.createElement("div",null,t.createElement("b",null,r.stages.filter(e=>e.status==="completed").length,t.createElement("small",null,"/ 6")),t.createElement("span",null,"\u5DF2\u5B8C\u6210\u9636\u6BB5")),t.createElement("div",null,t.createElement("b",null,r.stages.reduce((e,a)=>e+a.materials.filter(d=>!["done","na"].includes(d.status)).length,0)),t.createElement("span",null,"\u5F85\u6574\u7406\u6750\u6599")),t.createElement("div",null,t.createElement("b",null,r.forms.reduce((e,a)=>e+a.outputs,0)),t.createElement("span",null,"\u5DF2\u751F\u6210\u6587\u4EF6")),t.createElement("div",null,t.createElement("b",null,r.stages.filter(e=>e.upstream_changed.length||e.documents_changed).length),t.createElement("span",null,"\u5F85\u590D\u6838\u9636\u6BB5"))),t.createElement("div",{className:"df-project-stage-grid"},r.stages.map((e,a)=>t.createElement("button",{className:"df-paper df-stage-card",key:e.id,onClick:()=>xe(e.id)},t.createElement("div",{className:"df-section-head"},t.createElement("small",null,"\u9636\u6BB5 ",String(a+1).padStart(2,"0")),t.createElement("span",{className:"df-state df-state-"+e.status},Me[e.status])),t.createElement("h2",null,e.title),t.createElement("p",null,e.purpose),t.createElement("footer",null,t.createElement("span",null,e.materials.filter(d=>["done","na"].includes(d.status)).length,"/",e.materials.length," \u9879\u6750\u6599\u5DF2\u5904\u7406"),t.createElement("span",null,e.upstream_changed.length||e.documents_changed?"\u6709\u53D8\u66F4\u5F85\u590D\u6838":e.due_date?"\u8BA1\u5212 "+e.due_date:"\u8FDB\u5165\u9636\u6BB5 \u2192"))))),t.createElement("section",{className:"df-paper df-project-hint"},t.createElement("h2",null,"\u4E00\u4EFD\u9879\u76EE\u5E95\u7A3F\uFF0C\u8D2F\u7A7F\u5404\u9636\u6BB5"),t.createElement("p",null,"\u9879\u76EE\u540D\u79F0\u3001\u7814\u7A76\u5185\u5BB9\u3001\u6210\u679C\u6307\u6807\u548C\u9884\u7B97\u7B49\u53EF\u5728\u201C\u9879\u76EE\u8D44\u6599\u201D\u7EDF\u4E00\u7EF4\u62A4\u3002\u9636\u6BB5\u8868\u5355\u4ECE\u5E95\u7A3F\u53D6\u503C\uFF0C\u540E\u7EED\u53D8\u66F4\u4F1A\u63D0\u9192\u6838\u5BF9\uFF1B\u5DF2\u6709\u751F\u6210\u6587\u4EF6\u4FDD\u7559\u539F\u6837\u3002"),t.createElement("button",{onClick:()=>xe("profile")},"\u6574\u7406\u9879\u76EE\u8D44\u6599"))),w==="profile"&&t.createElement(ot,{onDirtyChange:N,key:r.id+":"+r.revision,project:r,Field:y,onSave:e=>I("\u4FDD\u5B58\u9879\u76EE\u8D44\u6599",async()=>{await he(pe,e,"PUT"),q("\u9879\u76EE\u8D44\u6599\u5DF2\u66F4\u65B0\u3002\u5DF2\u6709\u8868\u5355\u53EF\u9010\u9879\u6838\u5BF9\u540E\u540C\u6B65\uFF0C\u539F\u751F\u6210\u6587\u4EF6\u4E0D\u53D8\u3002")})}),C&&t.createElement(t.Fragment,null,t.createElement("section",{className:"df-paper df-stage-header"},t.createElement("div",null,t.createElement("div",{className:"df-eyebrow"},"\u9636\u6BB5\u6750\u6599"),t.createElement("h2",null,C.title),t.createElement("p",null,C.purpose),t.createElement("p",{className:"df-muted"},C.id==="negotiation"?"\u4E94\u4EFD\u6807\u51C6\u6A21\u677F\u5DF2\u63A5\u5165\uFF0C\u53EF\u76F4\u63A5\u586B\u5199\uFF0C\u4E5F\u53EF\u5BFC\u5165\u73B0\u6709 Excel\u3002":"\u7EDF\u4E00\u6A21\u677F\u5F85\u8865\u5145\uFF1B\u73B0\u9636\u6BB5\u53EF\u6574\u7406\u6750\u6599\u3001\u4E0A\u4F20\u6587\u4EF6\uFF0C\u6216\u5BFC\u5165\u5DF2\u6709 Excel \u4E0E Word \u6A21\u677F\u3002")),t.createElement("div",{className:"df-actions"},t.createElement("button",{onClick:()=>ie(C.id)},"\u4E0B\u8F7D\u672C\u9636\u6BB5\u6750\u6599"),t.createElement("button",{onClick:()=>ae("stage",{...C,confirmed:!1})},"\u529E\u7406\u4FE1\u606F\u4E0E\u72B6\u6001"))),(C.upstream_changed.length>0||C.documents_changed)&&t.createElement("div",{className:"df-alert df-stage-warning"},t.createElement("div",null,t.createElement("b",null,"\u672C\u9636\u6BB5\u6709\u8D44\u6599\u9700\u8981\u590D\u6838"),t.createElement("p",null,C.upstream_changed.length>0&&"\u524D\u5E8F\u9636\u6BB5\u5DF2\u66F4\u65B0\uFF1A"+C.upstream_changed.join("\u3001")+"\u3002",C.documents_changed&&"\u672C\u9636\u6BB5\u8868\u5355\u6216\u751F\u6210\u6587\u4EF6\u6709\u66F4\u65B0\u3002","\u8BF7\u6838\u5BF9\u5DF2\u63D0\u4EA4\u7684\u6750\u6599\u662F\u5426\u9700\u8981\u8C03\u6574\u3002")),t.createElement("button",{onClick:()=>I("\u8BB0\u5F55\u590D\u6838",()=>he(`${pe}/stages/${C.id}/acknowledge`,{}))},"\u5DF2\u6838\u5BF9\u53D8\u66F4")),(C.system_name||C.due_date||C.submission_ref||C.notes)&&t.createElement("section",{className:"df-paper df-stage-details"},t.createElement("dl",null,t.createElement("div",null,t.createElement("dt",null,"\u8BA1\u5212\u65E5\u671F"),t.createElement("dd",null,C.due_date||"\u672A\u8BBE\u7F6E")),t.createElement("div",null,t.createElement("dt",null,"\u529E\u7406\u7CFB\u7EDF"),t.createElement("dd",null,C.system_url?t.createElement("a",{href:C.system_url,target:"_blank",rel:"noopener noreferrer"},C.system_name||"\u6253\u5F00\u529E\u7406\u7CFB\u7EDF"," \u2197"):C.system_name||"\u672A\u8BB0\u5F55")),t.createElement("div",null,t.createElement("dt",null,"\u63D0\u4EA4\u7F16\u53F7 / \u56DE\u6267"),t.createElement("dd",null,C.submission_ref||"\u672A\u8BB0\u5F55"))),C.notes&&t.createElement("p",null,C.notes)),t.createElement("section",{className:"df-paper df-stage-forms"},t.createElement("div",{className:"df-section-head"},t.createElement("div",null,t.createElement("h2",null,r.single_form?"\u9879\u76EE\u8868\u5355":"\u586B\u5199\u4E0E\u751F\u6210"),t.createElement("p",{className:"df-muted"},"\u8868\u5355\u6CBF\u7528\u9879\u76EE\u5E95\u7A3F\uFF0C\u6838\u5BF9\u540E\u751F\u6210\u3002\u5DF2\u6709\u6279\u6B21\u4FDD\u7559\u751F\u6210\u65F6\u7684\u5185\u5BB9\u3002")),t.createElement("div",{className:"df-actions"},(C.id==="negotiation"||r.single_form)&&t.createElement("button",{className:"df-primary",onClick:()=>De()},r.single_form?"\u6253\u5F00\u9879\u76EE\u8868\u5355":"\u586B\u5199\u8C08\u5224\u6750\u6599"),t.createElement("button",{onClick:()=>X.current.click()},"\u5BFC\u5165 Excel \u8868\u5355"))),r.single_form?t.createElement("p",{className:"df-muted"},"\u6BCF\u4E2A\u9879\u76EE\u5171\u7528\u4E00\u4EFD\u8868\u5355\uFF0C\u516D\u4E2A\u9636\u6BB5\u5404\u529E\u7406\u4E00\u6B21\u3002\u5DF2\u6709\u6587\u4E66\u4E0E\u5386\u53F2\u5E95\u7A3F\u53EF\u5728\u53F3\u4FA7\u67E5\u770B\u3002"):H.length?t.createElement("div",{className:"df-project-forms"},H.map(e=>t.createElement("div",{key:e.case_id},t.createElement("div",null,t.createElement("b",null,e.name),t.createElement("small",null,He(e.updated_at)," \xB7"," ",e.outputs?e.outputs+" \u4EFD\u6587\u4EF6":"\u586B\u5199\u4E2D",e.shared_changes.length>0&&" \xB7 \u9879\u76EE\u8D44\u6599\u6709\u66F4\u65B0")),t.createElement("div",{className:"df-actions"},t.createElement("button",{onClick:()=>z({id:e.case_id,view:"edit"})},"\u6253\u5F00\u8868\u5355"),e.outputs>0&&t.createElement("button",{onClick:()=>z({id:e.case_id,view:"files"})},"\u67E5\u770B\u751F\u6210\u6587\u4EF6"))))):t.createElement("p",{className:"df-empty"},"\u672C\u9636\u6BB5\u8FD8\u6CA1\u6709\u8868\u5355\u3002\u5DF2\u6709\u6210\u54C1\u6587\u4EF6\u53EF\u76F4\u63A5\u4E0A\u4F20\u5230\u4E0B\u9762\u7684\u6750\u6599\u6E05\u5355\u3002")),C.id==="negotiation"&&t.createElement("section",{className:"df-paper df-review-entry"},t.createElement("div",null,t.createElement("h2",null,"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5"),t.createElement("p",{className:"df-muted"},"\u5BF9\u7167\u6B63\u5F0F\u8C08\u5224\u6587\u4EF6\uFF0C\u68C0\u67E5\u5404\u5355\u4F4D\u54CD\u5E94\u6750\u6599\uFF0C\u6C47\u603B\u95EE\u9898\u3001\u4F9D\u636E\u548C\u5F85\u786E\u8BA4\u4E8B\u9879\u3002")),t.createElement("button",{onClick:()=>r.single_form?te("review"):ae("response-review",{})},"\u6253\u5F00\u6838\u67E5\u667A\u80FD\u4F53 \u2192")),t.createElement("section",{className:"df-paper df-material-panel"},t.createElement("div",{className:"df-section-head"},t.createElement("div",null,t.createElement("h2",null,"\u6750\u6599\u6E05\u5355 ",t.createElement("small",null,C.materials.length)),t.createElement("p",{className:"df-muted"},"\u5148\u6309\u5E38\u7528\u6750\u6599\u5217\u51FA\uFF0C\u53EF\u4FEE\u6539\u540D\u79F0\u3001\u589E\u8865\u6750\u6599\u6216\u6807\u4E3A\u4E0D\u9002\u7528\u3002\u201C\u5DF2\u63D0\u4EA4\u201D\u7531\u7ECF\u529E\u4EBA\u6838\u5B9E\u540E\u8BB0\u5F55\u3002")),t.createElement("button",{onClick:()=>ae("material",{name:"",status:"pending",required:!1,note:""})},"\uFF0B \u6DFB\u52A0\u6750\u6599")),t.createElement("div",{className:"df-materials"},C.materials.map(e=>{let a=H.reduce((d,E)=>d+(E.generations[0]?.files.filter(ve=>ve.name.includes(e.name)).length||0),0);return t.createElement("article",{className:"df-material-row",key:e.id},t.createElement("div",{className:"df-material-name"},t.createElement("b",null,e.name),e.required&&t.createElement("span",{className:"df-required-tag"},"\u5FC5\u5907"),t.createElement("span",{className:"df-state df-material-state-"+e.status},Je[e.status]),a>0&&t.createElement("small",null,"\u5DF2\u6709 ",a," \u4EFD\u751F\u6210\u7A3F \xB7 \u5728\u4E0A\u65B9\u8868\u5355\u67E5\u770B"),e.note&&t.createElement("p",null,e.note)),t.createElement("div",{className:"df-material-files"},e.files.length>0?t.createElement("details",null,t.createElement("summary",null,e.files.length," \u4EFD\u6587\u4EF6 / \u7248\u672C \xB7 \u6700\u65B0\uFF1A",e.files[e.files.length-1].name),[...e.files].reverse().map((d,E)=>t.createElement("div",{className:"df-material-file",key:d.id},t.createElement("div",null,t.createElement("b",null,"V",e.files.length-E," \xB7"," ",d.name),t.createElement("small",null,He(d.uploaded_at)," \xB7"," ",Math.max(1,Math.round(d.size/1024))," ","KB")),t.createElement("button",{onClick:()=>{L(d),oe({artifact:{title:d.name},reference:{file_id:d.id}}),te("preview")}},"\u9884\u89C8"),t.createElement("button",{"aria-label":"\u4E0B\u8F7D"+d.name+"\u7248\u672C"+(e.files.length-E),onClick:()=>I("\u4E0B\u8F7D\u6750\u6599",()=>l(`${pe}/files/${d.id}`,d.name))},"\u4E0B\u8F7D")))):t.createElement("span",{className:"df-muted"},"\u5C1A\u672A\u4E0A\u4F20\u6587\u4EF6")),t.createElement("div",{className:"df-actions"},t.createElement("button",{"aria-label":"\u4E0A\u4F20"+e.name,onClick:()=>{le.current=e.id,Ee.current.click()}},"\u4E0A\u4F20\u6587\u4EF6"),t.createElement("button",{"aria-label":"\u7F16\u8F91"+e.name,onClick:()=>ae("material",{...e})},"\u7F16\u8F91")))}))),t.createElement("div",{className:"df-stage-tail"},t.createElement("p",null,"\u5404\u9636\u6BB5\u53EF\u5E76\u884C\u51C6\u5907\uFF1B\u524D\u5E8F\u8D44\u6599\u53D8\u5316\u540E\uFF0C\u540E\u7EED\u9636\u6BB5\u4F1A\u63D0\u793A\u590D\u6838\u3002\u9636\u6BB5\u5B8C\u6210\u7531\u7ECF\u529E\u4EBA\u786E\u8BA4\u3002"),t.createElement("button",{onClick:()=>ae("stage",{...C,confirmed:!1})},"\u66F4\u65B0\u529E\u7406\u72B6\u6001"))))):t.createElement("section",{className:"df-paper df-project-welcome"},t.createElement("h2",null,"\u5148\u5EFA\u4E00\u4E2A\u9879\u76EE"),t.createElement("p",null,"\u5171\u7528\u8D44\u6599\u53EA\u6574\u7406\u4E00\u6B21\uFF0C\u8868\u5355\u4E0E\u9644\u4EF6\u6309\u9636\u6BB5\u5F52\u96C6\uFF0C\u751F\u6210\u7A3F\u4E0E\u5B9A\u7A3F\u5206\u522B\u7559\u75D5\u3002"),t.createElement("div",{className:"df-welcome-stages"},dt.map((e,a)=>t.createElement("span",{key:e},t.createElement("small",null,String(a+1).padStart(2,"0")),e))),t.createElement("button",{className:"df-primary",onClick:()=>ae("create",{name:"",code:"",owner:""})},"\u5EFA\u7ACB\u7B2C\u4E00\u4E2A\u9879\u76EE"))),r?.single_form&&t.createElement(qe,{key:r.id,project:r,stageId:w,services:u,mode:Se,onMode:te,selection:de,attachment:F,AttachmentPreview:Ye,dirty:P,onSelect:e=>{oe(e),L(null),te("preview")},onChanged:()=>Y().catch(e=>S(e.message))}),h==="response-review"&&t.createElement(je,{title:"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5",onClose:()=>{D(null),Y().catch(e=>S(e.message))}},t.createElement(ze,{project:r,services:u,onChanged:()=>Y().catch(e=>S(e.message))})),h==="create"&&t.createElement(je,{title:"\u65B0\u5EFA\u9879\u76EE",busy:!!$,error:Q,onClose:()=>D(null)},t.createElement("form",{onSubmit:e=>{e.preventDefault(),I("\u5EFA\u7ACB\u9879\u76EE",async()=>{let a=await p("/projects",c(x));L(null),oe(null),te("assistant"),_(a),A("overview"),z(null),m(!1),D(null),await J()})}},t.createElement("label",{className:"df-field"},t.createElement("span",null,"\u9879\u76EE\u540D\u79F0"),t.createElement("input",{"aria-label":"\u65B0\u9879\u76EE\u540D\u79F0",required:!0,maxLength:120,value:x.name,onChange:e=>U({...x,name:e.target.value})})),t.createElement("div",{className:"df-fields"},t.createElement("label",{className:"df-field"},t.createElement("span",null,"\u9879\u76EE\u7F16\u53F7"),t.createElement("input",{"aria-label":"\u65B0\u9879\u76EE\u7F16\u53F7",maxLength:100,value:x.code,onChange:e=>U({...x,code:e.target.value})})),t.createElement("label",{className:"df-field"},t.createElement("span",null,"\u7ECF\u529E\u4EBA"),t.createElement("input",{"aria-label":"\u65B0\u9879\u76EE\u7ECF\u529E\u4EBA",maxLength:100,value:x.owner,onChange:e=>U({...x,owner:e.target.value})}))),t.createElement("p",{className:"df-muted"},"\u5EFA\u7ACB\u9879\u76EE\u540E\uFF0C\u53EF\u6574\u7406\u5171\u7528\u8D44\u6599\uFF0C\u518D\u6309\u516D\u4E2A\u9636\u6BB5\u51C6\u5907\u6750\u6599\u3002"),t.createElement("div",{className:"df-actions"},t.createElement("button",{type:"button",disabled:!!$||!!O,onClick:()=>D(null)},"\u53D6\u6D88"),t.createElement("button",{className:"df-primary",disabled:!!$||!x.name?.trim(),type:"submit"},"\u5EFA\u7ACB\u9879\u76EE")))),h==="material"&&t.createElement(je,{title:"\u6750\u6599\u4FE1\u606F",busy:!!$,error:Q,onClose:()=>D(null)},t.createElement("form",{onSubmit:Ae},t.createElement("label",{className:"df-field"},t.createElement("span",null,"\u6750\u6599\u540D\u79F0"),t.createElement("input",{"aria-label":"\u6750\u6599\u540D\u79F0",required:!0,maxLength:150,value:x.name,onChange:e=>U({...x,name:e.target.value})})),t.createElement("label",{className:"df-field"},t.createElement("span",null,"\u6750\u6599\u72B6\u6001"),t.createElement("select",{"aria-label":"\u6750\u6599\u72B6\u6001",value:x.status,onChange:e=>U({...x,status:e.target.value})},Object.entries(Je).map(([e,a])=>t.createElement("option",{key:e,value:e},a)))),t.createElement("label",{className:"df-checkbox"},t.createElement("input",{type:"checkbox",checked:x.required,onChange:e=>U({...x,required:e.target.checked})}),"\u672C\u9879\u76EE\u7684\u5FC5\u5907\u6750\u6599\uFF0C\u9636\u6BB5\u5B8C\u6210\u524D\u9700\u786E\u8BA4\u5DF2\u5B8C\u6210\u6216\u4E0D\u9002\u7528"),t.createElement("label",{className:"df-field"},t.createElement("span",null,"\u6750\u6599\u8BF4\u660E"),t.createElement("textarea",{"aria-label":"\u6750\u6599\u8BF4\u660E",rows:3,maxLength:3e3,value:x.note,onChange:e=>U({...x,note:e.target.value})})),t.createElement("div",{className:"df-actions"},t.createElement("button",{type:"button",onClick:()=>D(null),disabled:!!$||!!O},"\u53D6\u6D88"),t.createElement("button",{className:"df-primary",disabled:!!$||!!O,type:"submit"},"\u4FDD\u5B58\u6750\u6599\u4FE1\u606F")))),h==="stage"&&t.createElement(je,{title:C.title+"\u529E\u7406\u4FE1\u606F",busy:!!$,error:Q,onClose:()=>D(null)},t.createElement("form",{onSubmit:e=>{e.preventDefault(),I("\u4FDD\u5B58\u529E\u7406\u4FE1\u606F",()=>he(`${pe}/stages/${w}`,x,"PUT"))}},t.createElement("div",{className:"df-fields"},t.createElement("label",{className:"df-field"},t.createElement("span",null,"\u9636\u6BB5\u72B6\u6001"),t.createElement("select",{"aria-label":"\u9636\u6BB5\u72B6\u6001",value:x.status,onChange:e=>U({...x,status:e.target.value})},Object.entries(Me).map(([e,a])=>t.createElement("option",{key:e,value:e},a)))),t.createElement("label",{className:"df-field"},t.createElement("span",null,"\u8BA1\u5212\u65E5\u671F"),t.createElement("input",{"aria-label":"\u9636\u6BB5\u8BA1\u5212\u65E5\u671F",type:"date",value:x.due_date,onChange:e=>U({...x,due_date:e.target.value})})),t.createElement("label",{className:"df-field"},t.createElement("span",null,"\u529E\u7406\u7CFB\u7EDF"),t.createElement("input",{"aria-label":"\u529E\u7406\u7CFB\u7EDF",maxLength:150,value:x.system_name,onChange:e=>U({...x,system_name:e.target.value})})),t.createElement("label",{className:"df-field"},t.createElement("span",null,"\u7CFB\u7EDF\u5730\u5740"),t.createElement("input",{"aria-label":"\u7CFB\u7EDF\u5730\u5740",type:"url",placeholder:"https://",maxLength:1e3,value:x.system_url,onChange:e=>U({...x,system_url:e.target.value})}))),t.createElement("label",{className:"df-field"},t.createElement("span",null,"\u63D0\u4EA4\u7F16\u53F7 / \u56DE\u6267\u4FE1\u606F"),t.createElement("input",{"aria-label":"\u63D0\u4EA4\u7F16\u53F7",maxLength:500,value:x.submission_ref,onChange:e=>U({...x,submission_ref:e.target.value})})),t.createElement("label",{className:"df-field"},t.createElement("span",null,"\u529E\u7406\u8BF4\u660E"),t.createElement("textarea",{"aria-label":"\u529E\u7406\u8BF4\u660E",rows:4,maxLength:5e3,value:x.notes,onChange:e=>U({...x,notes:e.target.value})})),t.createElement("p",{className:"df-muted"},"\u8BB0\u5F55\u7EBF\u4E0B\u6216\u4E1A\u52A1\u7CFB\u7EDF\u7684\u5B9E\u9645\u529E\u7406\u7ED3\u679C\uFF0C\u56DE\u6267\u6587\u4EF6\u53EF\u4E0A\u4F20\u5230\u6750\u6599\u6E05\u5355\u3002"),x.status==="completed"&&t.createElement(t.Fragment,null,t.createElement("p",{className:"df-muted"},C.missing_required.length>0?"\u5C1A\u672A\u529E\u7ED3\u7684\u5FC5\u5907\u6750\u6599\uFF1A"+C.missing_required.join("\u3001"):"\u8BF7\u786E\u8BA4\u9636\u6BB5\u6750\u6599\u548C\u524D\u5E8F\u53D8\u66F4\u5DF2\u6838\u5BF9\u3002"),t.createElement("label",{className:"df-checkbox"},t.createElement("input",{"aria-label":"\u786E\u8BA4\u672C\u9636\u6BB5\u5DF2\u529E\u7ED3",type:"checkbox",checked:x.confirmed,onChange:e=>U({...x,confirmed:e.target.checked})}),"\u5DF2\u6838\u5BF9\u672C\u9636\u6BB5\u6750\u6599\u53CA\u524D\u5E8F\u53D8\u66F4\uFF0C\u786E\u8BA4\u672C\u9636\u6BB5\u5DF2\u529E\u7ED3")),t.createElement("div",{className:"df-actions"},t.createElement("button",{type:"button",onClick:()=>D(null),disabled:!!$||!!O},"\u53D6\u6D88"),t.createElement("button",{className:"df-primary",disabled:!!$||x.status==="completed"&&!x.confirmed,type:"submit"},"\u4FDD\u5B58\u529E\u7406\u4FE1\u606F")))),F&&!r.single_form&&t.createElement(Ye,{key:F.id,file:F,projectId:r.id,download:(e,a)=>I("\u4E0B\u8F7D\u539F\u6587\u4EF6",()=>l(e,a)),onClose:()=>L(null)}))}function ot({project:n,Field:u,onSave:p,onDirtyChange:c}){let[l,y]=B(n.fields),[f,k]=B({name:n.name,code:n.code,owner:n.owner});return Ce(()=>{c(JSON.stringify(l)!==JSON.stringify(n.fields)||f.name!==n.name||f.code!==n.code||f.owner!==n.owner)},[l,f]),t.createElement("form",{className:"df-paper df-project-profile",onSubmit:r=>{r.preventDefault(),p({...f,values:Object.fromEntries(l.map(_=>[_.key,_.value]))})}},t.createElement("div",{className:"df-section-head"},t.createElement("div",null,t.createElement("h2",null,"\u9879\u76EE\u8D44\u6599\u5E95\u7A3F"),t.createElement("p",{className:"df-muted"},"\u5404\u9636\u6BB5\u8868\u5355\u590D\u7528\u8FD9\u91CC\u7684\u8D44\u6599\uFF1B\u9636\u6BB5\u65E5\u671F\u3001\u8BC4\u5BA1\u5206\u6570\u548C\u4ED8\u6B3E\u7ED3\u679C\u5206\u522B\u8BB0\u5F55\u3002")),t.createElement("button",{className:"df-primary",type:"submit"},"\u4FDD\u5B58\u9879\u76EE\u8D44\u6599")),t.createElement("div",{className:"df-fields"},t.createElement("label",{className:"df-field"},t.createElement("span",null,"\u9879\u76EE\u540D\u79F0"),t.createElement("input",{"aria-label":"\u9879\u76EE\u540D\u79F0",required:!0,value:f.name,maxLength:120,onChange:r=>k({...f,name:r.target.value})})),t.createElement("label",{className:"df-field"},t.createElement("span",null,"\u9879\u76EE\u7F16\u53F7"),t.createElement("input",{"aria-label":"\u9879\u76EE\u7F16\u53F7",value:f.code,maxLength:100,onChange:r=>k({...f,code:r.target.value})})),t.createElement("label",{className:"df-field"},t.createElement("span",null,"\u7ECF\u529E\u4EBA"),t.createElement("input",{"aria-label":"\u7ECF\u529E\u4EBA",value:f.owner,maxLength:100,onChange:r=>k({...f,owner:r.target.value})}))),[...new Set(l.filter(r=>!["project.name","project.code"].includes(r.key)).map(r=>r.group))].map(r=>t.createElement("section",{className:"df-group",key:r},t.createElement("h3",null,r),t.createElement("div",{className:"df-fields"},l.filter(_=>_.group===r&&!["project.name","project.code"].includes(_.key)).map(_=>t.createElement(u,{key:_.key,field:{..._,required:!1},onChange:w=>y(l.map(A=>A.key===_.key?{...A,value:w}:A))}))))),t.createElement("div",{className:"df-actions"},t.createElement("button",{className:"df-primary",type:"submit"},"\u4FDD\u5B58\u9879\u76EE\u8D44\u6599")))}var re=window.QwenPaw,i=re.host.React,{useState:Z,useEffect:ke,useLayoutEffect:st,useRef:$e}=i,Fe="/document-forms",lt="application/vnd.openxmlformats-officedocument.wordprocessingml.document";async function R(n,u){let p=await re.host.fetch(Fe+n,u);if(!p.ok){let c=await p.json().catch(()=>({}));throw new Error(typeof c.detail=="string"?c.detail:Array.isArray(c.detail)?c.detail.map(l=>`${l.loc?.slice(1).join(".")||"\u8D44\u6599"}\uFF1A${l.msg}`).join("\uFF1B"):`\u64CD\u4F5C\u672A\u5B8C\u6210\uFF08${p.status}\uFF09\uFF0C\u8BF7\u68C0\u67E5\u586B\u5199\u5185\u5BB9`)}return p.json()}async function Oe(n,u){let p=await re.host.fetch(Fe+n);if(!p.ok)throw new Error("\u6587\u4EF6\u4E0B\u8F7D\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5");let c=URL.createObjectURL(await p.blob()),l=document.createElement("a");l.href=c,l.download=u,document.body.appendChild(l);try{l.click()}finally{l.remove(),setTimeout(()=>URL.revokeObjectURL(c),1e3)}}var ge=n=>({method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)}),Pe=n=>new Date(n).toLocaleString("zh-CN",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}),Ze=n=>n.kind==="textarea"||n.value.length>100||n.value.includes(`
`)||n.label.includes("\u6574\u6BB5"),pt=n=>/^(research\.contents|deliverables\.|metrics\.|milestones\.)/.test(n.key)||/主要研究内容|预期成果|考核指标|进度安排/.test(n.label);function Ue(n){return n.map((u,p)=>{let c={...u};for(let l of["start","end"]){let y="follow_"+l;c[y]=p>0&&(typeof c[y]=="boolean"?c[y]:!c[l]),c[y]&&(c[l]=n[0][l])}return c})}function Re({field:n,displayValue:u,onChange:p}){let c=Ze(n),l=pt(n),y=["date","datetime-local"].includes(n.kind)?n.value:u??n.value,f=$e(null);return st(()=>{if(!f.current)return;let k=f.current.scrollTop;f.current.style.height="auto",f.current.style.height=Math.max(l?104:192,f.current.scrollHeight)+"px",f.current.scrollTop=k},[y,c,l]),i.createElement("label",{className:"df-field"+(c?" df-field-paragraph":"")+(l?" df-field-compact":""),id:"df-"+n.key},i.createElement("span",null,n.label,n.required&&i.createElement("em",null,"\u5FC5\u586B")),c?i.createElement("textarea",{ref:f,"aria-label":n.label,rows:l?3:8,value:y,onChange:k=>p(k.target.value)}):i.createElement("input",{"aria-label":n.label,type:n.kind,step:n.kind==="number"?"any":void 0,value:y,onChange:k=>p(k.target.value)}),i.createElement("small",null,n.key))}function ft({project:n,workflowStage:u,initialCaseId:p,initialView:c,initialDraft:l,onBack:y,onChanged:f,onDirtyChange:k,onBusyChange:r,onViewChange:_,docked:w=!1,onPreview:A,onStageStatus:M}){let[o,j]=Z(null),[z,P]=Z(null),[m,v]=Z([]),[N,O]=Z("import"),[b,$]=Z(!1),[W,Q]=Z(null),[S,ee]=Z(!1),[q,h]=Z(""),[D,x]=Z(""),[U,F]=Z(""),[L,de]=Z(null),[oe,Se]=Z(null),te=$e(null),K=$e(null),se=$e(0),X=$e(!0),Ee=re.host.useTheme?.()||"light",le=()=>f?.()||Promise.resolve();ke(()=>(X.current=!0,(l?Promise.resolve(l):R("/cases/"+p)).then(e=>{X.current&&(V(e),O(c==="files"&&e.generations.length?"files":"edit"),c==="files"&&e.generations.length&&de({file:e.generations[0].files[0],generation:e.generations[0]}))}).catch(e=>X.current&&x(e.message)),(re.workspace?.loadPreview?re.workspace.loadPreview():Promise.resolve(ne)).then(e=>{X.current&&Se(()=>e)}).catch(e=>{X.current&&Se(()=>ne)}),()=>{X.current=!1,se.current++}),[]),ke(()=>{k?.(b)},[b]),ke(()=>{r?.(q)},[q]),ke(()=>{_?.()},[N]),ke(()=>{let e=a=>{b&&(a.preventDefault(),a.returnValue="")};return window.addEventListener("beforeunload",e),()=>window.removeEventListener("beforeunload",e)},[b]);async function G(e,a){if(q)return;let d=++se.current;h(e),x(""),F("");try{await a()}catch(E){X.current&&d===se.current&&x(E.message)}finally{X.current&&d===se.current&&h("")}}function V(e){X.current&&(j({...e,recipients:Ue(e.recipients),presentation_sources:Object.fromEntries(e.fields.map(a=>[a.key,a.value]))}),$(!1),Q(null),ee(!1))}function be(e){j(e),$(!0),Q(null),ee(!1),F("")}function C(e,a,d,E=!1){let ve=o.recipients.map((Qe,et)=>et===e?{...Qe,[a]:d,...a!=="name"?{["follow_"+a]:E}:{}}:Qe);be({...o,recipients:Ue(ve)})}async function H(){if(!b)return o;let e={revision:o.revision,name:o.name.trim()||"\u672A\u547D\u540D\u586B\u62A5",values:Object.fromEntries(o.fields.map(d=>[d.key,d.value])),recipients:o.recipients},a=await R("/cases/"+o.id,{...ge(e),method:"PUT"});return V(a),a}function Ne(){return!b||window.confirm("\u5F53\u524D\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\u3002\u79BB\u5F00\u6B64\u8BB0\u5F55\uFF1F")}let J=o?.templates||[],Y=J.reduce((e,a)=>e+(a.per_recipient?o.recipients.length:1),0),I=o?.generations.find(e=>!w||(e.stage_id||o.original_stage_id||u.id)===u.id);ke(()=>{w&&N==="files"&&I&&!L&&de({file:I.files[0],generation:I})},[N,I?.id]);let _e=W?.checks.filter(e=>e.status!=="ok")||[];async function xe(e){!e||!Ne()||await G("\u8BFB\u53D6 Excel",async()=>{let a=new FormData;a.append("workbook",e),a.append("revision",n.revision),a.append("stage_id",u.id);let d=await R(`/projects/${n.id}/${n.single_form?"form":"cases"}/import`,{method:"POST",body:a});V(d),de(null),O("edit"),await le(),F(d.templates.length?"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\uFF0C\u5E76\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002":d.template_notice||"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\u3002\u8BF7\u6DFB\u52A0\u5BF9\u5E94\u7684 Word \u6A21\u677F\u3002")})}async function ae(e){e=Array.from(e),e.length&&await G("\u8BFB\u53D6 Word \u6A21\u677F",async()=>{let a=await H(),d=new FormData;d.append("revision",String(a.revision)),Array.from(e).forEach(E=>d.append("files",E)),V(await R("/cases/"+a.id+"/templates",{method:"POST",body:d})),await le(),F("Word \u6A21\u677F\u5DF2\u6DFB\u52A0\uFF0C\u751F\u6210\u65F6\u4F1A\u4FDD\u7559\u539F\u6709\u6392\u7248\u3002")})}async function he(){await G("\u6838\u5BF9\u8D44\u6599",async()=>{let e=await H(),a=await R("/cases/"+e.id+"/review",ge({revision:e.revision}));X.current&&(Q(a),ee(!1),O("review"),await le())})}async function De(){await G("\u751F\u6210\u6587\u4E66",async()=>{let e=await R("/cases/"+o.id+"/generate",ge({revision:o.revision,review_token:W.review_token,confirmed:S}));V(e),O("files"),de({file:e.generations[0].files[0],generation:e.generations[0]}),await le()})}function Ie(e){O("edit"),requestAnimationFrame(()=>{let a=document.getElementById("df-"+e);a?.scrollIntoView({behavior:"smooth",block:"center"}),a?.querySelector("input,textarea")?.focus()})}let pe=(e,a)=>`/cases/${o.id}/outputs/${e.id}/${encodeURIComponent(a)}`;function Ae(e){return G("\u6B63\u5728\u4E0B\u8F7D\u538B\u7F29\u5305",async()=>{await Oe(pe(e,"\u5168\u90E8\u6587\u4E66.zip"),e.bundle_name||o.name+"_\u6587\u4E66.zip"),F(`\u5DF2\u5F00\u59CB\u4E0B\u8F7D\u8BE5\u6279\u6B21\u7684 ${e.files.length} \u4EFD\u6587\u4E66\u538B\u7F29\u5305\u3002`)})}let ie=L?{id:L.generation.id+L.file.name,title:L.file.name,source:"generated",mimeType:lt,extension:"docx",binaryUrl:L.file.preview_url,printUrl:Fe+`/cases/${o.id}/print/${L.generation.id}/${encodeURIComponent(L.file.name)}`,agentId:re.host.getSelectedAgentId?.(),createdAt:Date.parse(L.generation.created_at)}:null;return ke(()=>{w&&N==="files"&&ie&&A?.({artifact:ie,reference:{case_id:o.id,generation_id:L.generation.id,name:L.file.name}})},[N,L?.generation.id,L?.file.name]),i.createElement("div",{className:"df-app df-embedded-editor","data-theme":Ee},i.createElement("input",{ref:te,type:"file",accept:".xlsx",hidden:!0,"aria-label":"\u5BFC\u5165 Excel \u53D8\u91CF\u8868",onChange:e=>{xe(e.target.files[0]),e.target.value=""}}),i.createElement("input",{ref:K,type:"file",accept:".docx",multiple:!0,hidden:!0,"aria-label":"\u5BFC\u5165 Word \u6A21\u677F",onChange:e=>{ae(e.target.files),e.target.value=""}}),i.createElement("section",{className:"df-main"},i.createElement("div",{className:"df-editor-context"},i.createElement("button",{disabled:!!q,onClick:()=>{Ne()&&y()}},"\u2190 \u8FD4\u56DE",u.title),i.createElement("span",null,n.name," / ",u.title),w&&i.createElement("button",{disabled:!!q||b,title:b?"\u8BF7\u5148\u4FDD\u5B58\u8868\u5355":"\u66F4\u65B0\u5F53\u524D\u8282\u70B9\u7684\u529E\u7406\u4FE1\u606F",onClick:M},"\u529E\u7406\u4FE1\u606F\u4E0E\u72B6\u6001"),o&&i.createElement("div",{className:"df-actions"},i.createElement("button",{disabled:!!q,onClick:()=>{P("adopt"),v([])}},"\u6838\u5BF9\u9879\u76EE\u8D44\u6599\u5DEE\u5F02"),i.createElement("button",{disabled:!!q,onClick:()=>{P("publish"),v([])}},"\u5B58\u5165\u9879\u76EE\u5E95\u7A3F"))),i.createElement("header",{className:"df-header"},i.createElement("div",null,i.createElement("span",{className:"df-eyebrow"},u.title," / \u586B\u5199\u4E0E\u751F\u6210"),i.createElement("h1",null,o?w?u.title+" \xB7 \u9879\u76EE\u8868\u5355":o.name:"\u628A\u91CD\u590D\u586B\u5199\u7684\u8D44\u6599\uFF0C\u6574\u7406\u6210\u4E00\u5F20\u8868\u3002"),i.createElement("p",null,o?b?"\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539":`\u8349\u7A3F\u5DF2\u4FDD\u5B58 \xB7 ${Pe(o.updated_at)}`:"\u5BFC\u5165\u53D8\u91CF\u8868\u4E0E Word \u6A21\u677F\uFF0C\u586B\u5199\u3001\u6838\u5BF9\uFF0C\u518D\u751F\u6210\u6587\u4E66\u3002")),o&&i.createElement("button",{disabled:!!q||!b,onClick:()=>G("\u4FDD\u5B58\u8349\u7A3F",async()=>{await H(),await le(),F("\u8349\u7A3F\u5DF2\u4FDD\u5B58")})},"\u4FDD\u5B58\u8349\u7A3F")),i.createElement("div",{className:"df-steps","aria-label":"\u586B\u5199\u6D41\u7A0B"},[["import","01","\u5BFC\u5165\u6A21\u677F"],["edit","02","\u586B\u5199\u8D44\u6599"],["review","03","\u6838\u5BF9\u751F\u6210"],["files","04","\u6587\u4EF6\u9884\u89C8"]].map(([e,a,d])=>i.createElement("button",{key:e,className:N===e?"active":"",disabled:!!q||!o&&e!=="import"||e==="files"&&!I,onClick:()=>e==="review"?he():O(e)},i.createElement("span",null,a),d))),D&&i.createElement("div",{className:"df-alert error",role:"alert"},D,i.createElement("button",{"aria-label":"\u5173\u95ED\u9519\u8BEF\u63D0\u793A",onClick:()=>x("")},"\xD7")),U&&i.createElement("div",{className:"df-alert",role:"status"},U),q&&i.createElement("div",{className:"df-progress",role:"status"},q,"\u2026"),i.createElement("fieldset",{className:"df-content",disabled:!!q},N==="import"&&i.createElement("div",{className:"df-import"},i.createElement("section",{className:"df-paper df-drop"},i.createElement("div",{className:"df-file-mark"},"XLSX"),i.createElement("h2",null,"\u4ECE Excel \u53D8\u91CF\u8868\u5F00\u59CB"),i.createElement("p",null,"\u201C\u53D8\u91CF\u914D\u7F6E\u201D\u5DE5\u4F5C\u8868\u4FDD\u7559\u4E09\u5217\uFF1A",i.createElement("br",null),i.createElement("b",null,"\u53D8\u91CF\u540D\u79F0\u3000\u4E2D\u6587\u540D\u79F0\u3000\u503C")),i.createElement("button",{className:"df-primary",onClick:()=>te.current.click()},"\u9009\u62E9 Excel \u53D8\u91CF\u8868"),i.createElement("small",null,"\u652F\u6301 .xlsx \xB7 \u5355\u4E2A\u6587\u4EF6\u4E0D\u8D85\u8FC7 15 MB")),i.createElement("section",{className:"df-paper df-import-note"},i.createElement("span",{className:"df-eyebrow"},"\u5982\u4F55\u51C6\u5907"),i.createElement("h2",null,"\u4E00\u4EFD\u6570\u636E\uFF0C\u591A\u4EFD\u6587\u4E66"),i.createElement("ol",null,i.createElement("li",null,i.createElement("b",null,"\u6574\u7406\u53D8\u91CF"),i.createElement("p",null,"\u4F8B\u5982 project.name / \u9879\u76EE\u540D\u79F0 / \u5B9E\u9645\u540D\u79F0\u3002\u652F\u6301\u5206\u7EC4\u3001\u7C7B\u578B\u548C\u5FC5\u586B\u5217\u3002")),i.createElement("li",null,i.createElement("b",null,"\u81EA\u52A8\u8F7D\u5165\u6A21\u677F"),i.createElement("p",null,"\u5E94\u7528\u81EA\u5E26 5 \u4EFD\u6807\u51C6 Word \u6A21\u677F\uFF0C\u4F7F\u7528\u914D\u5957 Excel \u5373\u53EF\u81EA\u52A8\u8F7D\u5165\uFF1B \u4E5F\u53EF\u6DFB\u52A0\u81EA\u5DF1\u7684\u6A21\u677F\u3002")),i.createElement("li",null,i.createElement("b",null,"\u5206\u522B\u751F\u6210\u9080\u8BF7\u51FD"),i.createElement("p",null,"\u5728\u201C\u53D7\u9080\u5355\u4F4D\u201D\u8868\u8BB0\u5F55\u5355\u4F4D\u540D\u79F0\u3001\u9886\u53D6\u5F00\u59CB\u65F6\u95F4\u548C\u9886\u53D6\u7ED3\u675F\u65F6\u95F4\u3002"))),i.createElement("p",{className:"df-muted"},"\u201C\u65E5\u671F\u6821\u6838\u201D\u8868\u4E2D\u7684\u65E7\u7ED3\u679C\u4E0D\u4F1A\u4F5C\u4E3A\u5224\u65AD\u4F9D\u636E\uFF1B\u5E94\u7528\u4F1A\u6839\u636E\u5F53\u524D\u586B\u5199\u5185\u5BB9\u91CD\u65B0\u6838\u5BF9\u3002\u201C\u6821\u6838\u89C4\u5219\u201D\u8868\u53EF\u8865\u5145\u81EA\u5B9A\u4E49\u5148\u540E\u5173\u7CFB\u3002"))),o&&(N==="edit"||w&&N==="files")&&i.createElement("div",{className:"df-edit-layout"},i.createElement("section",{className:"df-paper"},i.createElement("div",{className:"df-section-head"},i.createElement("h2",null,"\u586B\u5199\u4FE1\u606F"),i.createElement("button",{onClick:()=>G("\u5BFC\u51FA Excel",async()=>{let e=await H();await Oe(`/cases/${e.id}/excel`,(e.fields.find(a=>a.key==="project.name")?.value||e.name).replace(/[<>:"/\\|?*\x00-\x1f]/g,"_").slice(0,80)+"_\u586B\u5199\u6570\u636E.xlsx")})},"\u5BFC\u51FA\u5F53\u524D Excel")),i.createElement("label",{className:"df-field df-title-field"},i.createElement("span",null,"\u8868\u5355\u540D\u79F0"),i.createElement("input",{"aria-label":"\u8868\u5355\u540D\u79F0",maxLength:120,value:o.name,onChange:e=>be({...o,name:e.target.value})})),[...new Set(o.fields.map(e=>e.group))].map(e=>i.createElement("section",{className:"df-group",key:e},i.createElement("h3",null,e),e==="\u65E5\u671F\u5B89\u6392"&&i.createElement("p",{className:"df-muted"},"\u6587\u4E66\u7EDF\u4E00\u4F7F\u7528\u4E2D\u6587\u65E5\u671F\uFF0C\u4F8B\u5982\u201C2026\u5E7410\u670822\u65E5\u4E0B\u534814:30\u201D\u3002\u65E5\u671F\u9009\u62E9\u5668\u4FDD\u7559\u539F\u6765\u7684\u586B\u5199\u65B9\u5F0F\u3002"),i.createElement("div",{className:"df-fields"},o.fields.filter(a=>a.group===e).map(a=>i.createElement(Re,{key:a.key,field:a,displayValue:o.presentation_sources?.[a.key]===a.value?o.document_values?.[a.key]:void 0,onChange:d=>be({...o,fields:o.fields.map(E=>E.key===a.key?{...E,value:d}:E)})})))))),i.createElement("section",{className:"df-paper"},i.createElement("div",{className:"df-section-head"},i.createElement("div",null,i.createElement("h2",null,"\u53D7\u9080\u5355\u4F4D"," ",i.createElement("span",{className:"df-count"},o.recipients.length)),i.createElement("p",null,"\u6309\u5355\u4F4D\u6587\u4E66\u5206\u522B\u751F\u6210\uFF0C\u5171\u7528\u9879\u76EE\u4E0E\u843D\u6B3E\u4FE1\u606F\u3002")),i.createElement("button",{onClick:()=>be({...o,recipients:Ue([...o.recipients,{name:"",start:"",end:""}])}),disabled:o.recipients.length>=200},"\uFF0B \u6DFB\u52A0\u5355\u4F4D")),o.recipients.map((e,a)=>i.createElement("div",{className:"df-recipient",key:a,id:"df-recipient-"+a},i.createElement("div",{className:"df-recipient-title"},i.createElement("b",null,String(a+1).padStart(2,"0")),i.createElement("button",{"aria-label":`\u79FB\u9664\u7B2C${a+1}\u5BB6\u5355\u4F4D`,onClick:()=>be({...o,recipients:Ue(o.recipients.filter((d,E)=>E!==a))})},"\u79FB\u9664")),i.createElement("div",{className:"df-fields"},[["name","\u5355\u4F4D\u540D\u79F0"],["start","\u9886\u53D6\u5F00\u59CB\u65F6\u95F4"],["end","\u9886\u53D6\u7ED3\u675F\u65F6\u95F4"]].map(([d,E])=>i.createElement("label",{className:"df-field "+(d==="name"?"df-span":""),key:d},i.createElement("span",null,E),i.createElement("input",{"aria-label":`\u7B2C${a+1}\u5BB6${E}`,type:d==="name"?"text":"datetime-local",value:d==="name"?e[d]:e[d].replace(" ","T"),onChange:ve=>C(a,d,ve.target.value)}),a>0&&d!=="name"&&i.createElement("small",{className:"df-follow-state"},e["follow_"+d]?"\u8DDF\u968F\u7B2C1\u5BB6":"\u5DF2\u5355\u72EC\u8BBE\u7F6E",!e["follow_"+d]&&i.createElement("button",{type:"button","aria-label":`\u7B2C${a+1}\u5BB6${E}\u6062\u590D\u8DDF\u968F`,onClick:ve=>{ve.preventDefault(),C(a,d,o.recipients[0][d],!0)}},"\u6062\u590D\u8DDF\u968F")))))))),i.createElement("section",{className:"df-paper df-template-panel","aria-label":"Word \u6A21\u677F"},i.createElement("div",{className:"df-section-head"},i.createElement("h2",null,"Word \u6A21\u677F"),i.createElement("div",{className:"df-template-actions"},J.length>0?i.createElement("button",{onClick:()=>G("\u4FDD\u5B58\u9ED8\u8BA4\u6A21\u677F",async()=>{let e=await H();await R(`/cases/${e.id}/defaults`,ge({revision:e.revision})),F(u.id==="negotiation"?"\u5DF2\u8BBE\u4E3A\u672C\u673A\u9ED8\u8BA4\u6A21\u677F\uFF0C\u4EE5\u540E\u65B0\u5EFA\u586B\u62A5\u4F1A\u81EA\u52A8\u8F7D\u5165\u3002":"\u5DF2\u8BBE\u4E3A\u672C\u9636\u6BB5\u9ED8\u8BA4\u6A21\u677F\uFF0C\u4EE5\u540E\u65B0\u5EFA\u8BE5\u9636\u6BB5\u8868\u5355\u4F1A\u81EA\u52A8\u8F7D\u5165\u3002")})},u.id==="negotiation"?"\u8BBE\u4E3A\u9ED8\u8BA4\u6A21\u677F":"\u8BBE\u4E3A\u672C\u9636\u6BB5\u9ED8\u8BA4\u6A21\u677F"):i.createElement("button",{onClick:()=>G("\u8F7D\u5165\u9ED8\u8BA4\u6A21\u677F",async()=>{let e=await H();V(await R(`/cases/${e.id}/defaults/apply`,ge({revision:e.revision}))),F("\u5DF2\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002")})},"\u4F7F\u7528\u9ED8\u8BA4\u6A21\u677F"),i.createElement("button",{onClick:()=>K.current.click()},"\uFF0B \u6DFB\u52A0"))),!J.length&&i.createElement("p",{className:"df-muted"},"\u6DFB\u52A0\u4E0E\u4F60\u7684\u53D8\u91CF\u8868\u5BF9\u5E94\u7684 .docx \u6A21\u677F\u3002"),J.map(e=>i.createElement("div",{className:"df-template",key:e.id},i.createElement("b",null,e.name),e.from_builtin&&i.createElement("small",null,"\u5E94\u7528\u81EA\u5E26\u6A21\u677F"),i.createElement("span",null,e.per_recipient?"\u6309\u53D7\u9080\u5355\u4F4D\u5206\u522B\u751F\u6210":"\u5171\u7528\u6587\u4EF6 \xB7 \u751F\u6210\u4E00\u4EFD"),e.print_copies>1&&i.createElement("small",null,"\u5EFA\u8BAE\u6253\u5370 ",e.print_copies," \u4EFD \xB7 ",e.print_note),i.createElement("small",null,e.keys.length," \u4E2A\u5F15\u7528\u53D8\u91CF"),i.createElement("button",{"aria-label":"\u79FB\u9664\u6A21\u677F"+e.name,onClick:()=>G("\u79FB\u9664\u6A21\u677F",async()=>{let a=await H();V(await R(`/cases/${a.id}/templates/${e.id}?revision=${a.revision}`,{method:"DELETE"}))})},"\u79FB\u9664")))),i.createElement("section",{className:"df-paper df-edit-footer","aria-label":"\u6838\u5BF9\u4E0E\u751F\u6210"},i.createElement("div",{className:"df-generation-plan"},i.createElement("h2",null,"\u6838\u5BF9\u4E0E\u751F\u6210"),i.createElement("p",null,"\u672C\u6B21\u8BA1\u5212\u751F\u6210 ",i.createElement("b",null,Y)," \u4EFD\u6587\u4E66"),i.createElement("small",null,J.filter(e=>!e.per_recipient).length," ","\u4EFD\u5171\u7528\u6587\u4EF6 \xB7"," ",J.filter(e=>e.per_recipient).length," ","\u7C7B\u6309\u5355\u4F4D\u6587\u4E66 \xD7 ",o.recipients.length," \u5BB6\u5355\u4F4D")),i.createElement("div",{className:"df-next-action"},i.createElement("button",{className:"df-primary",onClick:he},"\u6838\u5BF9\u586B\u5199\u5185\u5BB9 \u2192"),i.createElement("small",null,"\u5148\u6838\u5BF9\u7F3A\u9879\u4E0E\u65E5\u671F\uFF0C\u518D\u786E\u8BA4\u751F\u6210")))),o&&N==="review"&&W&&i.createElement("div",{className:"df-review"},i.createElement("section",{className:"df-paper"},i.createElement("span",{className:"df-eyebrow"},"\u586B\u5199\u6838\u5BF9"),i.createElement("h2",null,W.can_generate?"\u8D44\u6599\u5DF2\u9F50\u5907\uFF0C\u8BF7\u786E\u8BA4\u672C\u6B21\u5185\u5BB9\u3002":`\u8FD8\u6709 ${_e.length} \u9879\u9700\u8981\u5904\u7406`),i.createElement("p",null,"\u672C\u6B21\u4F7F\u7528\u4FEE\u8BA2 ",o.revision," \u7684\u6570\u636E\uFF0C\u8BA1\u5212\u751F\u6210 ",Y," ","\u4EFD\u6587\u4E66\u3002"),_e.length>0&&i.createElement("div",{className:"df-checks"},_e.map((e,a)=>i.createElement("div",{key:a,className:"df-check "+e.status},i.createElement("span",null,e.status==="ok"?"\u901A\u8FC7":e.status==="missing"?"\u5F85\u8865\u5145":"\u51B2\u7A81"),i.createElement("div",null,i.createElement("b",null,e.label),i.createElement("p",null,e.detail)),e.status!=="ok"&&e.field&&i.createElement("button",{onClick:()=>Ie(e.field)},"\u4FEE\u6539")))),W.checks.some(e=>e.status==="ok")&&i.createElement("details",{className:"df-passed"},i.createElement("summary",null,W.checks.filter(e=>e.status==="ok").length," ","\u9879\u65E5\u671F\u6821\u6838\u901A\u8FC7 \xB7 \u67E5\u770B\u660E\u7EC6"),W.checks.filter(e=>e.status==="ok").map((e,a)=>i.createElement("p",{key:a},i.createElement("b",null,e.label),i.createElement("br",null),e.detail.replaceAll("T"," ")))),i.createElement("div",{className:"df-review-data"},i.createElement("h3",null,"\u5171\u7528\u4FE1\u606F"),i.createElement("dl",null,o.fields.map(e=>i.createElement("div",{key:e.key,className:Ze(e)?"df-span":void 0},i.createElement("dt",null,e.label),i.createElement("dd",null,(o.document_values?.[e.key]??e.value)||"\u5C1A\u672A\u586B\u5199")))),o.recipients.length>0&&i.createElement(i.Fragment,null,i.createElement("h3",null,"\u53D7\u9080\u5355\u4F4D"),o.recipients.map((e,a)=>i.createElement("p",{key:a},a+1,". ",e.name||"\u5C1A\u672A\u586B\u5199",o.recipient_document_times?.[a]??`${e.start.replace("T"," ")} \u2014 ${e.end.replace("T"," ")}`)))),i.createElement("div",{className:"df-review-data"},i.createElement("h3",null,"\u8F93\u51FA\u6E05\u5355"),J.map(e=>i.createElement("p",{key:e.id},e.name," \xB7"," ",e.per_recipient?o.recipients.map(a=>a.name||"\u5F85\u586B\u5355\u4F4D").join("\u3001"):"\u5171\u7528\u6587\u4EF6",e.print_copies>1&&` \xB7 \u5EFA\u8BAE\u6253\u5370 ${e.print_copies} \u4EFD\uFF0C\u6BCF\u4F4D\u4E13\u5BB6\u4E00\u4EFD`))),i.createElement("div",{className:"df-confirm"},i.createElement("label",null,i.createElement("input",{type:"checkbox",checked:S,disabled:!W.can_generate,onChange:e=>ee(e.target.checked)}),"\u6211\u5DF2\u6838\u5BF9\u586B\u5199\u5185\u5BB9\u3001\u53D7\u9080\u5355\u4F4D\u548C\u65E5\u671F\u5B89\u6392"),i.createElement("p",null,"\u6821\u6838\u68C0\u67E5\u8D44\u6599\u5B8C\u6574\u6027\u53CA\u65F6\u95F4\u987A\u5E8F\u3002\u4E1A\u52A1\u6761\u6B3E\u4E0E Word \u6A21\u677F\u8BF7\u7531\u7ECF\u529E\u4EBA\u590D\u6838\u3002"),i.createElement("div",null,i.createElement("button",{onClick:()=>{O("edit"),ee(!1)}},"\u8FD4\u56DE\u4FEE\u6539"),i.createElement("button",{className:"df-primary",disabled:!W.can_generate||!S,onClick:De},"\u786E\u8BA4\u5E76\u751F\u6210 ",Y," \u4EFD\u6587\u4E66"))))),o&&N==="files"&&I&&!w&&i.createElement("div",{className:"df-results"},i.createElement("section",{className:"df-paper df-output-list"},i.createElement("span",{className:"df-eyebrow"},"\u751F\u6210\u8BB0\u5F55"),i.createElement("h2",null,I.files.length," \u4EFD\u6587\u4EF6\u5DF2\u751F\u6210"),i.createElement("p",null,Pe(I.created_at)," \xB7 \u4FEE\u8BA2 ",I.revision),i.createElement("p",{className:"df-muted"},"\u538B\u7F29\u5305\u5305\u542B Word\u3001\u586B\u5199\u6570\u636E\u548C\u6838\u5BF9\u8BB0\u5F55"),(b||(I.content_digest?I.content_digest!==o.content_digest:I.revision!==o.revision))&&i.createElement("div",{className:"df-alert"},"\u586B\u5199\u5185\u5BB9\u5DF2\u6709\u4FEE\u6539\uFF0C\u4E0B\u5217\u6587\u4EF6\u4FDD\u7559\u751F\u6210\u65F6\u7684\u5185\u5BB9\u3002\u8BF7\u91CD\u65B0\u6838\u5BF9\u5E76\u751F\u6210\u65B0\u7248\u3002"),o.generations.map(e=>i.createElement("div",{className:"df-generation",key:e.id},i.createElement("div",{className:"df-generation-heading"},i.createElement("h3",null,Pe(e.created_at)," \xB7 \u4FEE\u8BA2 ",e.revision,e.date_style!=="zh-CN"&&" \xB7 \u539F\u65E5\u671F\u683C\u5F0F",e.naming_style!=="formal"&&" \xB7 \u539F\u6587\u4EF6\u540D"),i.createElement("button",{"aria-label":`\u6253\u5305\u4E0B\u8F7D ${Pe(e.created_at)} \u4FEE\u8BA2 ${e.revision}`,onClick:()=>Ae(e)},"\u6253\u5305\u4E0B\u8F7D")),e.files.map(a=>i.createElement("div",{className:"df-output "+(L?.file.name===a.name&&L?.generation.id===e.id?"selected":""),key:a.name},i.createElement("button",{onClick:()=>de({file:a,generation:e})},i.createElement("b",null,a.name),i.createElement("small",null,a.recipient," \xB7 ",(a.size/1024).toFixed(0)," KB",a.print_copies>1&&` \xB7 \u5EFA\u8BAE\u6253\u5370 ${a.print_copies} \u4EFD`)),i.createElement("button",{"aria-label":"\u4E0B\u8F7D"+a.name,onClick:()=>G("\u4E0B\u8F7D\u6587\u4EF6",()=>Oe(pe(e,a.name),a.name))},"\u2193")))))),i.createElement("section",{className:"df-paper df-preview"},i.createElement("div",{className:"df-section-head"},i.createElement("h2",null,L?L.file.name:"\u9009\u62E9\u6587\u4EF6\u9884\u89C8"),i.createElement("span",null,"Office \u9884\u89C8")),i.createElement("div",{className:"df-preview-body"},ie&&oe?i.createElement(Te,{key:ie.id,artifact:ie},i.createElement(oe,{key:ie.id,artifact:ie,readOnly:!0,hostControls:!0})):i.createElement("p",{className:"df-muted"},ie?"\u6B63\u5728\u6253\u5F00\u6587\u4EF6\u2026":"\u4ECE\u5DE6\u4FA7\u9009\u62E9\u4E00\u4EFD\u6587\u4EF6\u3002"))))),i.createElement("footer",{className:"df-footer"},i.createElement("span",null,"UGSci \xB7 \u6587\u4E66\u586B\u62A5"),i.createElement("span",null,"\u6570\u636E\u4E0E\u6587\u4E66\u4FDD\u5B58\u5728\u5F53\u524D\u670D\u52A1\u7AEF \xB7 \u65E0\u9700\u6A21\u578B\u670D\u52A1"))),z&&o&&i.createElement("div",{className:"df-dialog-backdrop"},i.createElement("section",{className:"df-dialog df-paper",role:"dialog","aria-modal":"true","aria-label":"\u6838\u5BF9\u5171\u7528\u8D44\u6599"},i.createElement("div",{className:"df-section-head"},i.createElement("h2",null,z==="adopt"?"\u91C7\u7528\u9879\u76EE\u5E95\u7A3F\u4E2D\u7684\u8D44\u6599":"\u5C06\u672C\u8868\u8D44\u6599\u5B58\u5165\u9879\u76EE\u5E95\u7A3F"),i.createElement("button",{disabled:!!q,onClick:()=>P(null),"aria-label":"\u5173\u95ED\u5171\u7528\u8D44\u6599\u6838\u5BF9"},"\xD7")),i.createElement("p",{className:"df-muted"},"\u53EA\u66F4\u65B0\u52FE\u9009\u9879\u3002\u539F\u751F\u6210\u6587\u4EF6\u4FDD\u7559\uFF0C\u540E\u7EED\u751F\u6210\u524D\u9700\u91CD\u65B0\u6838\u5BF9\u3002"),D&&i.createElement("p",{role:"alert",className:"df-alert error"},D),i.createElement("div",{className:"df-compare"},n.fields.filter(e=>o.fields.some(a=>a.key===e.key&&a.value!==e.value)).map(e=>{let a=o.fields.find(d=>d.key===e.key);return i.createElement("label",{key:e.key},i.createElement("input",{type:"checkbox",checked:m.includes(e.key),onChange:d=>v(d.target.checked?[...m,e.key]:m.filter(E=>E!==e.key))}),i.createElement("div",null,i.createElement("b",null,e.label),i.createElement("div",{className:"df-compare-values"},i.createElement("p",null,i.createElement("small",null,"\u5F53\u524D\u8868\u5355"),a.value||"\u7A7A\u767D"),i.createElement("p",null,i.createElement("small",null,"\u9879\u76EE\u5E95\u7A3F"),e.value||"\u7A7A\u767D"))))}),!n.fields.some(e=>o.fields.some(a=>a.key===e.key&&a.value!==e.value))&&i.createElement("p",null,"\u672C\u8868\u4E0E\u9879\u76EE\u5E95\u7A3F\u4E2D\u7684\u5171\u7528\u8D44\u6599\u4E00\u81F4\u3002")),i.createElement("div",{className:"df-actions"},i.createElement("button",{disabled:!!q,onClick:()=>P(null)},"\u53D6\u6D88"),i.createElement("button",{className:"df-primary",disabled:!!q||!m.length,onClick:()=>G("\u540C\u6B65\u5171\u7528\u8D44\u6599",async()=>{let e=await H();if(z==="adopt")V(await R(`/projects/${n.id}/cases/${e.id}/sync`,ge({revision:n.revision,case_revision:e.revision,keys:m})));else{let a=Object.fromEntries(e.fields.filter(d=>m.includes(d.key)).map(d=>[d.key,d.value]));await R(`/projects/${n.id}`,{...ge({revision:n.revision,name:a["project.name"]??n.name,code:a["project.code"]??n.code,owner:n.owner,values:a}),method:"PUT"})}await le(),P(null),F("\u6240\u9009\u8D44\u6599\u5DF2\u540C\u6B65\uFF0C\u8BF7\u91CD\u65B0\u6838\u5BF9\u540E\u751F\u6210\u65B0\u7248\u6587\u4E66\u3002")})},z==="adopt"?"\u91C7\u7528\u6240\u9009\u9879\u76EE\u8D44\u6599":"\u4FDD\u5B58\u6240\u9009\u8D44\u6599\u5230\u5E95\u7A3F")))))}function mt(){let n=re.host.useSelectedAgent?.();return i.createElement(Be,{key:n?.id||re.host.getSelectedAgentId?.()||"default",Editor:ft,services:{request:R,json:ge,download:Oe,time:Pe,Field:Re}})}re.registerRoutes("document-forms",[{path:"/apps/document-forms",component:mt,label:"\u6587\u4E66\u586B\u62A5",icon:"\u25A4"}]);})();
