(()=>{var ne=`.df-app {
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
`;var E=window.QwenPaw.host.React,{useEffect:ge,useState:H}=E;function L({artifact:n}){let[f,i]=H(null),[o,r]=H(""),[s,p]=H(0);if(ge(()=>{let l=new AbortController;return i(null),r(""),window.QwenPaw.host.fetch("/workspace/convert-office",{method:"POST",headers:{"Content-Type":"application/json",...n.agentId?{"X-Agent-Id":n.agentId}:{}},signal:l.signal,body:JSON.stringify({url:n.binaryUrl,mime_type:n.mimeType})}).then(async y=>{let k=await y.json();if(!y.ok)throw new Error(typeof k.detail=="string"?k.detail:"\u6587\u4EF6\u9884\u89C8\u672A\u5B8C\u6210");l.signal.aborted||i(k)}).catch(y=>{l.signal.aborted||r(y.message||"\u6587\u4EF6\u9884\u89C8\u672A\u5B8C\u6210")}),()=>l.abort()},[n.id,n.binaryUrl,n.mimeType,n.agentId,s]),o)return E.createElement("div",{className:"df-preview-message",role:"alert"},E.createElement("p",null,o),E.createElement("button",{onClick:()=>p(l=>l+1)},"\u91CD\u65B0\u9884\u89C8"),E.createElement("p",null,"\u4E5F\u53EF\u4EE5\u4ECE\u6587\u4EF6\u6E05\u5355\u4E0B\u8F7D\u540E\u67E5\u770B\u3002"));if(!f)return E.createElement("div",{className:"df-preview-message",role:"status"},"\u6B63\u5728\u6253\u5F00\u6587\u4EF6\u2026");let x=f.engine==="officecli"?f.html:`<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;color:#333;background:#fff;padding:24px 32px;line-height:1.7;max-width:900px;margin:0 auto}table{border-collapse:collapse;width:100%;margin:12px 0}td,th{border:1px solid #ddd;padding:8px 12px}img{max-width:100%;height:auto}h1{font-size:1.6em}h2{font-size:1.3em}.docx-page-break{border-top:2px dashed #ccc;margin:32px 0}</style></head><body>${f.html||""}</body></html>`;return E.createElement("iframe",{className:"df-office-frame",title:n.title,srcDoc:x,sandbox:f.engine==="officecli"?"allow-scripts":"allow-same-origin"})}var h=window.QwenPaw,e=h.host.React,{useState:u,useEffect:de,useLayoutEffect:be,useRef:A}=e,oe="/document-forms",he="application/vnd.openxmlformats-officedocument.wordprocessingml.document";async function b(n,f){let i=await h.host.fetch(oe+n,f);if(!i.ok){let o=await i.json().catch(()=>({}));throw new Error(typeof o.detail=="string"?o.detail:Array.isArray(o.detail)?o.detail.map(r=>`${r.loc?.slice(1).join(".")||"\u8D44\u6599"}\uFF1A${r.msg}`).join("\uFF1B"):`\u64CD\u4F5C\u672A\u5B8C\u6210\uFF08${i.status}\uFF09\uFF0C\u8BF7\u68C0\u67E5\u586B\u5199\u5185\u5BB9`)}return i.json()}async function M(n,f){let i=await h.host.fetch(oe+n);if(!i.ok)throw new Error("\u6587\u4EF6\u4E0B\u8F7D\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5");let o=URL.createObjectURL(await i.blob()),r=document.createElement("a");r.href=o,r.download=f,r.click(),setTimeout(()=>URL.revokeObjectURL(o),1e3)}var I=n=>({method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)}),F=n=>new Date(n).toLocaleString("zh-CN",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}),re=n=>n.kind==="textarea"||n.value.length>100||n.value.includes(`
`)||n.label.includes("\u6574\u6BB5"),ve=n=>/^(research\.contents|deliverables\.|metrics\.|milestones\.)/.test(n.key)||/主要研究内容|预期成果|考核指标|进度安排/.test(n.label);function B(n){return n.map((f,i)=>{let o={...f};for(let r of["start","end"]){let s="follow_"+r;o[s]=i>0&&(typeof o[s]=="boolean"?o[s]:!o[r]),o[s]&&(o[r]=n[0][r])}return o})}function we({field:n,displayValue:f,onChange:i}){let o=re(n),r=ve(n),s=["date","datetime-local"].includes(n.kind)?n.value:f??n.value,p=A(null);return be(()=>{if(!p.current)return;let x=p.current.scrollTop;p.current.style.height="auto",p.current.style.height=Math.max(r?104:192,p.current.scrollHeight)+"px",p.current.scrollTop=x},[s,o,r]),e.createElement("label",{className:"df-field"+(o?" df-field-paragraph":"")+(r?" df-field-compact":""),id:"df-"+n.key},e.createElement("span",null,n.label,n.required&&e.createElement("em",null,"\u5FC5\u586B")),o?e.createElement("textarea",{ref:p,"aria-label":n.label,rows:r?3:8,value:s,onChange:x=>i(x.target.value)}):e.createElement("input",{"aria-label":n.label,type:n.kind,step:n.kind==="number"?"any":void 0,value:s,onChange:x=>i(x.target.value)}),e.createElement("small",null,n.key))}function ye(){let[n,f]=u([]),[i,o]=u(null),[r,s]=u("import"),[p,x]=u(!1),[l,y]=u(null),[k,j]=u(!1),[v,V]=u(""),[X,O]=u(""),[J,N]=u(""),[g,W]=u(null),[Y,K]=u(null),q=A(null),Z=A(null),D=A(0),w=A(!0),se=h.host.useTheme?.()||"light",$=()=>b("/cases").then(t=>{w.current&&f(t)});de(()=>(w.current=!0,$().catch(t=>O(t.message)),(h.workspace?.loadPreview?h.workspace.loadPreview():Promise.resolve(L)).then(t=>{w.current&&K(()=>t)}).catch(t=>{w.current&&K(()=>L)}),()=>{w.current=!1,D.current++}),[]),de(()=>{let t=a=>{p&&(a.preventDefault(),a.returnValue="")};return window.addEventListener("beforeunload",t),()=>window.removeEventListener("beforeunload",t)},[p]);async function m(t,a){if(v)return;let d=++D.current;V(t),O(""),N("");try{await a()}catch(c){w.current&&d===D.current&&O(c.message)}finally{w.current&&d===D.current&&V("")}}function z(t){w.current&&(o({...t,recipients:B(t.recipients),presentation_sources:Object.fromEntries(t.fields.map(a=>[a.key,a.value]))}),x(!1),y(null),j(!1))}function T(t){o(t),x(!0),y(null),j(!1),N("")}function R(t,a,d,c=!1){let P=i.recipients.map((ie,ue)=>ue===t?{...ie,[a]:d,...a!=="name"?{["follow_"+a]:c}:{}}:ie);T({...i,recipients:B(P)})}async function C(){if(!p)return i;let t={revision:i.revision,name:i.name.trim()||"\u672A\u547D\u540D\u586B\u62A5",values:Object.fromEntries(i.fields.map(d=>[d.key,d.value])),recipients:i.recipients},a=await b("/cases/"+i.id,{...I(t),method:"PUT"});return z(a),a}function ee(){return!p||window.confirm("\u5F53\u524D\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\u3002\u79BB\u5F00\u6B64\u8BB0\u5F55\uFF1F")}let _=i?.templates||[],G=_.reduce((t,a)=>t+(a.per_recipient?i.recipients.length:1),0),S=i?.generations[0],Q=l?.checks.filter(t=>t.status!=="ok")||[];async function pe(t){ee()&&await m("\u6253\u5F00\u8BB0\u5F55",async()=>{z(await b("/cases/"+t)),W(null),s("edit")})}async function le(t){!t||!ee()||await m("\u8BFB\u53D6 Excel",async()=>{let a=new FormData;a.append("workbook",t);let d=await b("/cases",{method:"POST",body:a});z(d),W(null),s("edit"),await $(),N(d.templates.length?"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\uFF0C\u5E76\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002":d.template_notice||"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\u3002\u8BF7\u6DFB\u52A0\u5BF9\u5E94\u7684 Word \u6A21\u677F\u3002")})}async function fe(t){t=Array.from(t),t.length&&await m("\u8BFB\u53D6 Word \u6A21\u677F",async()=>{let a=await C(),d=new FormData;d.append("revision",String(a.revision)),Array.from(t).forEach(c=>d.append("files",c)),z(await b("/cases/"+a.id+"/templates",{method:"POST",body:d})),N("Word \u6A21\u677F\u5DF2\u6DFB\u52A0\uFF0C\u751F\u6210\u65F6\u4F1A\u4FDD\u7559\u539F\u6709\u6392\u7248\u3002")})}async function te(){await m("\u6838\u5BF9\u8D44\u6599",async()=>{let t=await C(),a=await b("/cases/"+t.id+"/review",I({revision:t.revision}));w.current&&(y(a),j(!1),s("review"),await $())})}async function ce(){await m("\u751F\u6210\u6587\u4E66",async()=>{let t=await b("/cases/"+i.id+"/generate",I({revision:i.revision,review_token:l.review_token,confirmed:k}));z(t),s("files"),W({file:t.generations[0].files[0],generation:t.generations[0]}),await $()})}function me(t){s("edit"),requestAnimationFrame(()=>{let a=document.getElementById("df-"+t);a?.scrollIntoView({behavior:"smooth",block:"center"}),a?.querySelector("input,textarea")?.focus()})}let ae=(t,a)=>`/cases/${i.id}/outputs/${t.id}/${encodeURIComponent(a)}`,U=g?{id:g.generation.id+g.file.name,title:g.file.name,source:"generated",mimeType:he,extension:"docx",binaryUrl:g.file.preview_url,agentId:h.host.getSelectedAgentId?.(),createdAt:Date.parse(g.generation.created_at)}:null;return e.createElement("main",{className:"df-app","data-theme":se},e.createElement("style",null,ne),e.createElement("input",{ref:q,type:"file",accept:".xlsx",hidden:!0,"aria-label":"\u5BFC\u5165 Excel \u53D8\u91CF\u8868",onChange:t=>{le(t.target.files[0]),t.target.value=""}}),e.createElement("input",{ref:Z,type:"file",accept:".docx",multiple:!0,hidden:!0,"aria-label":"\u5BFC\u5165 Word \u6A21\u677F",onChange:t=>{fe(t.target.files),t.target.value=""}}),e.createElement("aside",{className:"df-sidebar"},e.createElement("div",{className:"df-brand"},"UGSci ",e.createElement("span",null,"\u6587\u4E66\u586B\u62A5")),e.createElement("button",{className:"df-primary df-new",disabled:!!v,onClick:()=>q.current.click()},"\uFF0B \u65B0\u5EFA\u586B\u62A5"),e.createElement("div",{className:"df-caption"},"\u586B\u62A5\u8BB0\u5F55 ",e.createElement("span",null,n.length)),e.createElement("nav",{"aria-label":"\u586B\u62A5\u8BB0\u5F55"},n.map(t=>e.createElement("button",{key:t.id,"aria-current":i?.id===t.id?"page":void 0,disabled:!!v,onClick:()=>pe(t.id)},e.createElement("b",null,t.name),e.createElement("small",null,F(t.updated_at)," \xB7"," ",t.outputs?`${t.outputs} \u4EFD\u6587\u4EF6`:"\u8349\u7A3F")))),e.createElement("div",{className:"df-sidebar-foot"},e.createElement("b",null,"\u6A21\u677F\u51C6\u5907"),e.createElement("p",null,"Excel \u7BA1\u7406\u6570\u636E\uFF0CWord \u4FDD\u7559\u7248\u5F0F\u3002\u540C\u4E00\u7EC4\u6570\u636E\u53EF\u586B\u5199\u591A\u4EFD\u6587\u4E66\u3002"),e.createElement("button",{disabled:!!v,onClick:()=>m("\u4E0B\u8F7D\u793A\u4F8B",()=>M("/starter","\u6587\u4E66\u586B\u62A5_\u5165\u95E8\u6A21\u677F.zip"))},"\u4E0B\u8F7D\u5165\u95E8\u6A21\u677F \u2197"),e.createElement("small",null,"\u901A\u7528\u793A\u4F8B\uFF0C\u4E0D\u542B\u4E1A\u52A1\u6761\u6B3E"))),e.createElement("section",{className:"df-main"},e.createElement("header",{className:"df-header"},e.createElement("div",null,e.createElement("span",{className:"df-eyebrow"},"DOCUMENTS / \u6587\u4E66\u586B\u62A5"),e.createElement("h1",null,i?i.name:"\u628A\u91CD\u590D\u586B\u5199\u7684\u8D44\u6599\uFF0C\u6574\u7406\u6210\u4E00\u5F20\u8868\u3002"),e.createElement("p",null,i?p?"\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539":`\u8349\u7A3F\u5DF2\u4FDD\u5B58 \xB7 ${F(i.updated_at)}`:"\u5BFC\u5165\u53D8\u91CF\u8868\u4E0E Word \u6A21\u677F\uFF0C\u586B\u5199\u3001\u6838\u5BF9\uFF0C\u518D\u751F\u6210\u6587\u4E66\u3002")),i&&e.createElement("button",{disabled:!!v||!p,onClick:()=>m("\u4FDD\u5B58\u8349\u7A3F",async()=>{await C(),await $(),N("\u8349\u7A3F\u5DF2\u4FDD\u5B58")})},"\u4FDD\u5B58\u8349\u7A3F")),e.createElement("div",{className:"df-steps","aria-label":"\u586B\u5199\u6D41\u7A0B"},[["import","01","\u5BFC\u5165\u6A21\u677F"],["edit","02","\u586B\u5199\u8D44\u6599"],["review","03","\u6838\u5BF9\u751F\u6210"],["files","04","\u6587\u4EF6\u9884\u89C8"]].map(([t,a,d])=>e.createElement("button",{key:t,className:r===t?"active":"",disabled:!!v||!i&&t!=="import"||t==="files"&&!S,onClick:()=>t==="review"?te():s(t)},e.createElement("span",null,a),d))),X&&e.createElement("div",{className:"df-alert error",role:"alert"},X,e.createElement("button",{"aria-label":"\u5173\u95ED\u9519\u8BEF\u63D0\u793A",onClick:()=>O("")},"\xD7")),J&&e.createElement("div",{className:"df-alert",role:"status"},J),v&&e.createElement("div",{className:"df-progress",role:"status"},v,"\u2026"),e.createElement("fieldset",{className:"df-content",disabled:!!v},r==="import"&&e.createElement("div",{className:"df-import"},e.createElement("section",{className:"df-paper df-drop"},e.createElement("div",{className:"df-file-mark"},"XLSX"),e.createElement("h2",null,"\u4ECE Excel \u53D8\u91CF\u8868\u5F00\u59CB"),e.createElement("p",null,"\u201C\u53D8\u91CF\u914D\u7F6E\u201D\u5DE5\u4F5C\u8868\u4FDD\u7559\u4E09\u5217\uFF1A",e.createElement("br",null),e.createElement("b",null,"\u53D8\u91CF\u540D\u79F0\u3000\u4E2D\u6587\u540D\u79F0\u3000\u503C")),e.createElement("button",{className:"df-primary",onClick:()=>q.current.click()},"\u9009\u62E9 Excel \u53D8\u91CF\u8868"),e.createElement("small",null,"\u652F\u6301 .xlsx \xB7 \u5355\u4E2A\u6587\u4EF6\u4E0D\u8D85\u8FC7 15 MB")),e.createElement("section",{className:"df-paper df-import-note"},e.createElement("span",{className:"df-eyebrow"},"\u5982\u4F55\u51C6\u5907"),e.createElement("h2",null,"\u4E00\u4EFD\u6570\u636E\uFF0C\u591A\u4EFD\u6587\u4E66"),e.createElement("ol",null,e.createElement("li",null,e.createElement("b",null,"\u6574\u7406\u53D8\u91CF"),e.createElement("p",null,"\u4F8B\u5982 project.name / \u9879\u76EE\u540D\u79F0 / \u5B9E\u9645\u540D\u79F0\u3002\u652F\u6301\u5206\u7EC4\u3001\u7C7B\u578B\u548C\u5FC5\u586B\u5217\u3002")),e.createElement("li",null,e.createElement("b",null,"\u6DFB\u52A0 Word \u6A21\u677F"),e.createElement("p",null,"\u4F7F\u7528 ","{{ project.name }}"," ","\u5F15\u7528\u53D8\u91CF\uFF0C\u6BB5\u843D\u3001\u8868\u683C\u53CA\u9875\u7709\u9875\u811A\u6CBF\u7528\u6A21\u677F\u3002")),e.createElement("li",null,e.createElement("b",null,"\u5206\u522B\u751F\u6210\u9080\u8BF7\u51FD"),e.createElement("p",null,"\u5728\u201C\u53D7\u9080\u5355\u4F4D\u201D\u8868\u8BB0\u5F55\u5355\u4F4D\u540D\u79F0\u3001\u9886\u53D6\u5F00\u59CB\u65F6\u95F4\u548C\u9886\u53D6\u7ED3\u675F\u65F6\u95F4\u3002"))),e.createElement("p",{className:"df-muted"},"\u201C\u65E5\u671F\u6821\u6838\u201D\u8868\u4E2D\u7684\u65E7\u7ED3\u679C\u4E0D\u4F1A\u4F5C\u4E3A\u5224\u65AD\u4F9D\u636E\uFF1B\u5E94\u7528\u4F1A\u6839\u636E\u5F53\u524D\u586B\u5199\u5185\u5BB9\u91CD\u65B0\u6838\u5BF9\u3002\u201C\u6821\u6838\u89C4\u5219\u201D\u8868\u53EF\u8865\u5145\u81EA\u5B9A\u4E49\u5148\u540E\u5173\u7CFB\u3002"))),i&&r==="edit"&&e.createElement("div",{className:"df-edit-layout"},e.createElement("section",{className:"df-paper"},e.createElement("div",{className:"df-section-head"},e.createElement("h2",null,"\u586B\u5199\u4FE1\u606F"),e.createElement("button",{onClick:()=>m("\u5BFC\u51FA Excel",async()=>{let t=await C();await M(`/cases/${t.id}/excel`,t.name+".xlsx")})},"\u5BFC\u51FA\u5F53\u524D Excel")),e.createElement("label",{className:"df-field df-title-field"},e.createElement("span",null,"\u586B\u62A5\u540D\u79F0"),e.createElement("input",{"aria-label":"\u586B\u62A5\u540D\u79F0",maxLength:120,value:i.name,onChange:t=>T({...i,name:t.target.value})})),[...new Set(i.fields.map(t=>t.group))].map(t=>e.createElement("section",{className:"df-group",key:t},e.createElement("h3",null,t),t==="\u65E5\u671F\u5B89\u6392"&&e.createElement("p",{className:"df-muted"},"\u6587\u4E66\u7EDF\u4E00\u4F7F\u7528\u4E2D\u6587\u65E5\u671F\uFF0C\u4F8B\u5982\u201C2026\u5E7410\u670822\u65E5\u4E0B\u534814:30\u201D\u3002\u65E5\u671F\u9009\u62E9\u5668\u4FDD\u7559\u539F\u6765\u7684\u586B\u5199\u65B9\u5F0F\u3002"),e.createElement("div",{className:"df-fields"},i.fields.filter(a=>a.group===t).map(a=>e.createElement(we,{key:a.key,field:a,displayValue:i.presentation_sources?.[a.key]===a.value?i.document_values?.[a.key]:void 0,onChange:d=>T({...i,fields:i.fields.map(c=>c.key===a.key?{...c,value:d}:c)})})))))),e.createElement("section",{className:"df-paper"},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,"\u53D7\u9080\u5355\u4F4D"," ",e.createElement("span",{className:"df-count"},i.recipients.length)),e.createElement("p",null,"\u6BCF\u5BB6\u5355\u4F4D\u5355\u72EC\u751F\u6210\u9080\u8BF7\u51FD\uFF0C\u5171\u7528\u9879\u76EE\u4E0E\u843D\u6B3E\u4FE1\u606F\u3002")),e.createElement("button",{onClick:()=>T({...i,recipients:B([...i.recipients,{name:"",start:"",end:""}])}),disabled:i.recipients.length>=200},"\uFF0B \u6DFB\u52A0\u5355\u4F4D")),i.recipients.map((t,a)=>e.createElement("div",{className:"df-recipient",key:a,id:"df-recipient-"+a},e.createElement("div",{className:"df-recipient-title"},e.createElement("b",null,String(a+1).padStart(2,"0")),e.createElement("button",{"aria-label":`\u79FB\u9664\u7B2C${a+1}\u5BB6\u5355\u4F4D`,onClick:()=>T({...i,recipients:B(i.recipients.filter((d,c)=>c!==a))})},"\u79FB\u9664")),e.createElement("div",{className:"df-fields"},[["name","\u5355\u4F4D\u540D\u79F0"],["start","\u9886\u53D6\u5F00\u59CB\u65F6\u95F4"],["end","\u9886\u53D6\u7ED3\u675F\u65F6\u95F4"]].map(([d,c])=>e.createElement("label",{className:"df-field "+(d==="name"?"df-span":""),key:d},e.createElement("span",null,c),e.createElement("input",{"aria-label":`\u7B2C${a+1}\u5BB6${c}`,type:d==="name"?"text":"datetime-local",value:d==="name"?t[d]:t[d].replace(" ","T"),onChange:P=>R(a,d,P.target.value)}),a>0&&d!=="name"&&e.createElement("small",{className:"df-follow-state"},t["follow_"+d]?"\u8DDF\u968F\u7B2C1\u5BB6":"\u5DF2\u5355\u72EC\u8BBE\u7F6E",!t["follow_"+d]&&e.createElement("button",{type:"button","aria-label":`\u7B2C${a+1}\u5BB6${c}\u6062\u590D\u8DDF\u968F`,onClick:P=>{P.preventDefault(),R(a,d,i.recipients[0][d],!0)}},"\u6062\u590D\u8DDF\u968F")))))))),e.createElement("section",{className:"df-paper df-template-panel","aria-label":"Word \u6A21\u677F"},e.createElement("div",{className:"df-section-head"},e.createElement("h2",null,"Word \u6A21\u677F"),e.createElement("div",{className:"df-template-actions"},_.length>0?e.createElement("button",{onClick:()=>m("\u4FDD\u5B58\u9ED8\u8BA4\u6A21\u677F",async()=>{let t=await C();await b(`/cases/${t.id}/defaults`,I({revision:t.revision})),N("\u5DF2\u8BBE\u4E3A\u672C\u673A\u9ED8\u8BA4\u6A21\u677F\uFF0C\u4EE5\u540E\u65B0\u5EFA\u586B\u62A5\u4F1A\u81EA\u52A8\u8F7D\u5165\u3002")})},"\u8BBE\u4E3A\u9ED8\u8BA4\u6A21\u677F"):e.createElement("button",{onClick:()=>m("\u8F7D\u5165\u9ED8\u8BA4\u6A21\u677F",async()=>{let t=await C();z(await b(`/cases/${t.id}/defaults/apply`,I({revision:t.revision}))),N("\u5DF2\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002")})},"\u4F7F\u7528\u9ED8\u8BA4\u6A21\u677F"),e.createElement("button",{onClick:()=>Z.current.click()},"\uFF0B \u6DFB\u52A0"))),!_.length&&e.createElement("p",{className:"df-muted"},"\u6DFB\u52A0\u4E0E\u4F60\u7684\u53D8\u91CF\u8868\u5BF9\u5E94\u7684 .docx \u6A21\u677F\u3002"),_.map(t=>e.createElement("div",{className:"df-template",key:t.id},e.createElement("b",null,t.name),e.createElement("span",null,t.per_recipient?"\u6309\u53D7\u9080\u5355\u4F4D\u5206\u522B\u751F\u6210":"\u5171\u7528\u6587\u4EF6 \xB7 \u751F\u6210\u4E00\u4EFD"),e.createElement("small",null,t.keys.length," \u4E2A\u5F15\u7528\u53D8\u91CF"),e.createElement("button",{"aria-label":"\u79FB\u9664\u6A21\u677F"+t.name,onClick:()=>m("\u79FB\u9664\u6A21\u677F",async()=>{let a=await C();z(await b(`/cases/${a.id}/templates/${t.id}?revision=${a.revision}`,{method:"DELETE"}))})},"\u79FB\u9664")))),e.createElement("section",{className:"df-paper df-edit-footer","aria-label":"\u6838\u5BF9\u4E0E\u751F\u6210"},e.createElement("div",{className:"df-generation-plan"},e.createElement("h2",null,"\u6838\u5BF9\u4E0E\u751F\u6210"),e.createElement("p",null,"\u672C\u6B21\u8BA1\u5212\u751F\u6210 ",e.createElement("b",null,G)," \u4EFD\u6587\u4E66"),e.createElement("small",null,_.filter(t=>!t.per_recipient).length," ","\u4EFD\u5171\u7528\u6587\u4EF6 \xB7"," ",_.filter(t=>t.per_recipient).length," \u5957\u9080\u8BF7\u51FD \xD7"," ",i.recipients.length," \u5BB6\u5355\u4F4D")),e.createElement("div",{className:"df-next-action"},e.createElement("button",{className:"df-primary",onClick:te},"\u6838\u5BF9\u586B\u5199\u5185\u5BB9 \u2192"),e.createElement("small",null,"\u5148\u6838\u5BF9\u7F3A\u9879\u4E0E\u65E5\u671F\uFF0C\u518D\u786E\u8BA4\u751F\u6210")))),i&&r==="review"&&l&&e.createElement("div",{className:"df-review"},e.createElement("section",{className:"df-paper"},e.createElement("span",{className:"df-eyebrow"},"\u586B\u5199\u6838\u5BF9"),e.createElement("h2",null,l.can_generate?"\u8D44\u6599\u5DF2\u9F50\u5907\uFF0C\u8BF7\u786E\u8BA4\u672C\u6B21\u5185\u5BB9\u3002":`\u8FD8\u6709 ${Q.length} \u9879\u9700\u8981\u5904\u7406`),e.createElement("p",null,"\u672C\u6B21\u4F7F\u7528\u4FEE\u8BA2 ",i.revision," \u7684\u6570\u636E\uFF0C\u8BA1\u5212\u751F\u6210 ",G," ","\u4EFD\u6587\u4E66\u3002"),Q.length>0&&e.createElement("div",{className:"df-checks"},Q.map((t,a)=>e.createElement("div",{key:a,className:"df-check "+t.status},e.createElement("span",null,t.status==="ok"?"\u901A\u8FC7":t.status==="missing"?"\u5F85\u8865\u5145":"\u51B2\u7A81"),e.createElement("div",null,e.createElement("b",null,t.label),e.createElement("p",null,t.detail)),t.status!=="ok"&&t.field&&e.createElement("button",{onClick:()=>me(t.field)},"\u4FEE\u6539")))),l.checks.some(t=>t.status==="ok")&&e.createElement("details",{className:"df-passed"},e.createElement("summary",null,l.checks.filter(t=>t.status==="ok").length," ","\u9879\u65E5\u671F\u6821\u6838\u901A\u8FC7 \xB7 \u67E5\u770B\u660E\u7EC6"),l.checks.filter(t=>t.status==="ok").map((t,a)=>e.createElement("p",{key:a},e.createElement("b",null,t.label),e.createElement("br",null),t.detail.replaceAll("T"," ")))),e.createElement("div",{className:"df-review-data"},e.createElement("h3",null,"\u5171\u7528\u4FE1\u606F"),e.createElement("dl",null,i.fields.map(t=>e.createElement("div",{key:t.key,className:re(t)?"df-span":void 0},e.createElement("dt",null,t.label),e.createElement("dd",null,(i.document_values?.[t.key]??t.value)||"\u5C1A\u672A\u586B\u5199")))),i.recipients.length>0&&e.createElement(e.Fragment,null,e.createElement("h3",null,"\u53D7\u9080\u5355\u4F4D"),i.recipients.map((t,a)=>e.createElement("p",{key:a},a+1,". ",t.name||"\u5C1A\u672A\u586B\u5199",i.recipient_document_times?.[a]??`${t.start.replace("T"," ")} \u2014 ${t.end.replace("T"," ")}`)))),e.createElement("div",{className:"df-review-data"},e.createElement("h3",null,"\u8F93\u51FA\u6E05\u5355"),_.map(t=>e.createElement("p",{key:t.id},t.name," \xB7"," ",t.per_recipient?i.recipients.map(a=>a.name||"\u5F85\u586B\u5355\u4F4D").join("\u3001"):"\u5171\u7528\u6587\u4EF6"))),e.createElement("div",{className:"df-confirm"},e.createElement("label",null,e.createElement("input",{type:"checkbox",checked:k,disabled:!l.can_generate,onChange:t=>j(t.target.checked)}),"\u6211\u5DF2\u6838\u5BF9\u586B\u5199\u5185\u5BB9\u3001\u53D7\u9080\u5355\u4F4D\u548C\u65E5\u671F\u5B89\u6392"),e.createElement("p",null,"\u6821\u6838\u68C0\u67E5\u8D44\u6599\u5B8C\u6574\u6027\u53CA\u65F6\u95F4\u987A\u5E8F\u3002\u4E1A\u52A1\u6761\u6B3E\u4E0E Word \u6A21\u677F\u8BF7\u7531\u7ECF\u529E\u4EBA\u590D\u6838\u3002"),e.createElement("div",null,e.createElement("button",{onClick:()=>{s("edit"),j(!1)}},"\u8FD4\u56DE\u4FEE\u6539"),e.createElement("button",{className:"df-primary",disabled:!l.can_generate||!k,onClick:ce},"\u786E\u8BA4\u5E76\u751F\u6210 ",G," \u4EFD\u6587\u4E66"))))),i&&r==="files"&&S&&e.createElement("div",{className:"df-results"},e.createElement("section",{className:"df-paper df-output-list"},e.createElement("span",{className:"df-eyebrow"},"\u751F\u6210\u8BB0\u5F55"),e.createElement("h2",null,S.files.length," \u4EFD\u6587\u4EF6\u5DF2\u751F\u6210"),e.createElement("p",null,F(S.created_at)," \xB7 \u4FEE\u8BA2 ",S.revision),(p||S.revision!==i.revision)&&e.createElement("div",{className:"df-alert"},"\u586B\u5199\u5185\u5BB9\u5DF2\u6709\u4FEE\u6539\uFF0C\u4E0B\u5217\u6587\u4EF6\u4FDD\u7559\u751F\u6210\u65F6\u7684\u5185\u5BB9\u3002\u8BF7\u91CD\u65B0\u6838\u5BF9\u5E76\u751F\u6210\u65B0\u7248\u3002"),e.createElement("button",{className:"df-primary",onClick:()=>m("\u4E0B\u8F7D\u5168\u90E8\u6587\u4E66",()=>M(ae(S,"\u5168\u90E8\u6587\u4E66.zip"),i.name+"_\u6587\u4E66.zip"))},"\u4E0B\u8F7D\u5168\u90E8\u6587\u4E66"),e.createElement("p",{className:"df-muted"},"\u5305\u542B Word\u3001\u586B\u5199\u6570\u636E\u548C\u6838\u5BF9\u8BB0\u5F55"),i.generations.map(t=>e.createElement("div",{className:"df-generation",key:t.id},e.createElement("h3",null,F(t.created_at)," \xB7 \u4FEE\u8BA2 ",t.revision,t.date_style!=="zh-CN"&&" \xB7 \u539F\u65E5\u671F\u683C\u5F0F"),t.files.map(a=>e.createElement("div",{className:"df-output "+(g?.file.name===a.name&&g?.generation.id===t.id?"selected":""),key:a.name},e.createElement("button",{onClick:()=>W({file:a,generation:t})},e.createElement("b",null,a.name),e.createElement("small",null,a.recipient," \xB7 ",(a.size/1024).toFixed(0)," KB")),e.createElement("button",{"aria-label":"\u4E0B\u8F7D"+a.name,onClick:()=>m("\u4E0B\u8F7D\u6587\u4EF6",()=>M(ae(t,a.name),a.name))},"\u2193")))))),e.createElement("section",{className:"df-paper df-preview"},e.createElement("div",{className:"df-section-head"},e.createElement("h2",null,g?g.file.name:"\u9009\u62E9\u6587\u4EF6\u9884\u89C8"),e.createElement("span",null,"Office \u9884\u89C8")),e.createElement("div",{className:"df-preview-body"},U&&Y?e.createElement(Y,{key:U.id,artifact:U,readOnly:!0,hostControls:!0}):e.createElement("p",{className:"df-muted"},U?"\u6B63\u5728\u6253\u5F00\u6587\u4EF6\u2026":"\u4ECE\u5DE6\u4FA7\u9009\u62E9\u4E00\u4EFD\u6587\u4EF6\u3002"))))),e.createElement("footer",{className:"df-footer"},e.createElement("span",null,"UGSci \xB7 \u6587\u4E66\u586B\u62A5"),e.createElement("span",null,"\u6570\u636E\u4E0E\u6587\u4E66\u4FDD\u5B58\u5728\u5F53\u524D\u670D\u52A1\u7AEF \xB7 \u65E0\u9700\u6A21\u578B\u670D\u52A1"))))}function ke(){let n=h.host.useSelectedAgent?.();return e.createElement(ye,{key:n?.id||h.host.getSelectedAgentId?.()||"default"})}h.registerRoutes("document-forms",[{path:"/apps/document-forms",component:ke,label:"\u6587\u4E66\u586B\u62A5",icon:"\u25A4"}]);})();
