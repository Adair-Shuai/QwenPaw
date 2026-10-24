(()=>{var K=`.sc-app {
  --sc-ink: var(--app-text-primary, #182033);
  --sc-muted: var(--app-text-secondary, #667085);
  --sc-paper: var(--app-bg, #fff);
  --sc-soft: var(--app-bg-secondary, #f5f6fa);
  --sc-line: var(--app-border, #e6e9f0);
  --sc-accent: #0d76fd;
  display: flex;
  height: 100%;
  min-height: 520px;
  min-width: 0;
  color: var(--sc-ink);
  background: var(--sc-paper);
  font:
    14px/1.6 -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    "Microsoft YaHei",
    sans-serif;
  container-type: inline-size;
  container-name: capacity;
}
.sc-app * {
  box-sizing: border-box;
}
.sc-app button,
.sc-app input,
.sc-app textarea,
.sc-app select {
  font: inherit;
  color: inherit;
}
.sc-app button {
  border: 1px solid var(--sc-line);
  border-radius: 6px;
  background: var(--sc-paper);
  padding: 7px 12px;
  cursor: pointer;
  white-space: nowrap;
}
.sc-app button:hover {
  background: var(--sc-soft);
}
.sc-app button:disabled {
  opacity: 0.48;
  cursor: default;
}
.sc-app button:focus-visible,
.sc-app input:focus,
.sc-app select:focus,
.sc-app textarea:focus {
  outline: 2px solid var(--sc-accent);
  outline-offset: 2px;
}
.sc-app .sc-primary {
  color: white;
  background: var(--sc-accent);
  border-color: var(--sc-accent);
}
.sc-app .sc-primary:hover {
  background: #0a5fd0;
}
.sc-sidebar {
  width: 210px;
  flex-shrink: 0;
  background: var(--sc-soft);
  border-right: 1px solid var(--sc-line);
  padding: 25px 16px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  overflow: auto;
}
.sc-sidebar h1 {
  font-size: 19px;
  margin: 0;
  letter-spacing: 0.02em;
}
.sc-muted {
  color: var(--sc-muted);
  font-size: 12px;
}
.sc-projects {
  display: grid;
  gap: 5px;
}
.sc-projects button {
  text-align: left;
  white-space: normal;
  border-color: transparent;
  background: transparent;
  padding: 10px;
}
.sc-projects button[aria-current="page"] {
  background: var(--sc-paper);
  border-color: var(--sc-line);
}
.sc-projects strong {
  display: block;
  font-size: 13px;
  font-weight: 500;
  overflow-wrap: anywhere;
}
.sc-projects span {
  font-size: 12px;
  color: var(--sc-muted);
}
.sc-sidebar footer {
  margin-top: auto;
  font-size: 12px;
  color: var(--sc-muted);
}
.sc-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.sc-header {
  padding: 24px 108px 18px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid var(--sc-line);
}
.sc-header h2 {
  font-size: 21px;
  margin: 0 0 3px;
  font-weight: 600;
}
.sc-table td.sc-ok,
.sc-table td.sc-warning,
.sc-table td.sc-error {
  white-space: nowrap;
}
.sc-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.sc-tabs {
  display: flex;
  border-bottom: 1px solid var(--sc-line);
  padding: 0 28px;
  gap: 24px;
  overflow: auto;
  flex-shrink: 0;
}
.sc-tabs button {
  padding: 13px 0;
  border: 0;
  border-bottom: 2px solid transparent;
  border-radius: 0;
  color: var(--sc-muted);
  background: none;
}
.sc-tabs button[aria-selected="true"] {
  border-bottom-color: var(--sc-accent);
  color: var(--sc-accent);
}
.sc-body {
  padding: 24px 28px 44px;
  overflow: auto;
  flex: 1;
  min-height: 0;
}
.sc-body > section {
  max-width: 1280px;
}
.sc-section {
  margin-bottom: 26px;
}
.sc-section h3,
.sc-section h4 {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
}
.sc-section h4 {
  font-size: 14px;
}
.sc-section-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 12px;
}
.sc-section-head h3 {
  margin: 0;
}
.sc-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 15px 20px;
}
.sc-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 12px;
  color: var(--sc-muted);
  min-width: 0;
}
.sc-field input,
.sc-field select,
.sc-field textarea,
.sc-table input,
.sc-table select {
  width: 100%;
  min-width: 0;
  border: 1px solid var(--sc-line);
  border-radius: 5px;
  padding: 7px 9px;
  background: var(--sc-paper);
  color: var(--sc-ink);
  font-size: 13px;
}
.sc-field textarea {
  min-height: 72px;
  resize: vertical;
  line-height: 1.6;
}
.sc-field small {
  font-size: 11px;
}
.sc-span {
  grid-column: 1/-1;
}
.sc-check {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--sc-ink);
  padding: 6px 0;
}
.sc-check input {
  accent-color: var(--sc-accent);
}
.sc-unit {
  border: 1px solid var(--sc-line);
  border-radius: 8px;
  margin-bottom: 18px;
  padding: 20px;
}
.sc-unit-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 16px;
}
.sc-unit-top h3 {
  margin: 0;
}
.sc-app .sc-link {
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--sc-accent);
  font-size: 12px;
}
.sc-note {
  padding: 11px 14px;
  background: var(--sc-soft);
  border-radius: 6px;
  font-size: 12px;
  color: var(--sc-muted);
  line-height: 1.7;
  margin: 12px 0;
}
.sc-alert {
  margin: 12px 28px 0;
  padding: 10px 14px;
  border: 1px solid #eecdb3;
  background: #fffbf5;
  color: #80552b;
  border-radius: 6px;
  font-size: 13px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  overflow-wrap: anywhere;
}
.sc-error {
  color: #b54738;
}
.sc-warning {
  color: #946523;
}
.sc-ok {
  color: #317b59;
}
.sc-empty {
  padding: 70px 24px;
  max-width: 680px;
  margin: auto;
  text-align: center;
  color: var(--sc-muted);
}
.sc-empty h2 {
  font-size: 21px;
  color: var(--sc-ink);
  font-weight: 600;
}
.sc-empty p {
  line-height: 1.9;
  margin: 15px 0 25px;
}
.sc-table-wrap {
  overflow: auto;
  max-width: 100%;
  margin: 10px 0;
}
.sc-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.sc-table th {
  font-weight: 500;
  text-align: left;
  color: var(--sc-muted);
  background: var(--sc-soft);
  white-space: nowrap;
}
.sc-table th,
.sc-table td {
  border-bottom: 1px solid var(--sc-line);
  padding: 10px 12px;
  vertical-align: top;
}
.sc-table td {
  overflow-wrap: anywhere;
}
.sc-table input {
  min-width: 95px;
  padding: 5px 7px;
}
.sc-table .sc-number {
  font-variant-numeric: tabular-nums;
  text-align: right;
  white-space: nowrap;
}
.sc-table td:first-child {
  min-width: 90px;
}
.sc-app details {
  border-top: 1px solid var(--sc-line);
  padding: 13px 0;
  margin-top: 10px;
}
.sc-app summary {
  cursor: pointer;
  color: var(--sc-muted);
  font-size: 13px;
}
.sc-app details[open] > summary {
  margin-bottom: 15px;
}
.sc-upload {
  border: 1px dashed #b9c5d6;
  border-radius: 7px;
  background: var(--sc-soft);
  padding: 22px;
  display: flex;
  gap: 18px;
  align-items: center;
  justify-content: space-between;
}
.sc-upload strong {
  font-weight: 500;
}
.sc-upload p {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--sc-muted);
}
.sc-source {
  border: 1px solid var(--sc-line);
  border-radius: 7px;
  padding: 18px;
  margin: 16px 0;
}
.sc-source pre {
  font: 12px/1.8 inherit;
  white-space: pre-wrap;
  max-height: 340px;
  overflow: auto;
  background: var(--sc-soft);
  padding: 14px;
}
.sc-source .sc-table-wrap {
  max-height: 320px;
}
.sc-map-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
.sc-map-field {
  display: grid;
  grid-template-columns: 1fr 68px;
  gap: 6px;
  align-items: end;
}
.sc-map-field .sc-field {
  font-size: 11px;
}
.sc-results-head {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: start;
}
.sc-results-head h3 {
  margin: 0;
  font-size: 18px;
}
.sc-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-top: 1px solid var(--sc-line);
  border-bottom: 1px solid var(--sc-line);
  margin: 20px 0;
}
.sc-metric {
  padding: 19px 15px;
  border-right: 1px solid var(--sc-line);
}
.sc-metric:last-child {
  border: 0;
}
.sc-metric span {
  font-size: 12px;
  color: var(--sc-muted);
}
.sc-metric strong {
  font-size: 27px;
  display: block;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}
.sc-metric small {
  font-size: 12px;
  font-weight: 400;
  margin-left: 6px;
  color: var(--sc-muted);
}
.sc-formula {
  font:
    13px/1.8 ui-monospace,
    Consolas,
    monospace;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  background: var(--sc-soft);
  padding: 12px;
  margin: 10px 0;
}
.sc-report-preview {
  width: 100%;
  height: 70vh;
  min-height: 450px;
  border: 1px solid var(--sc-line);
  border-radius: 6px;
  background: #fff;
}
.sc-prose {
  font-size: 13px;
  line-height: 1.9;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.sc-steps {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  line-height: 2;
}
.sc-chart {
  width: 100%;
  height: 230px;
  display: block;
  margin: 12px 0;
}
.sc-chart text {
  font: 11px sans-serif;
  fill: var(--sc-muted);
}
.sc-help {
  max-width: 900px;
}
.sc-help p {
  font-size: 13px;
  color: var(--sc-muted);
}
@container capacity (max-width:1000px) {
  .sc-sidebar {
    width: 175px;
    padding: 22px 12px;
  }
  .sc-header {
    padding: 20px 88px 20px 20px;
  }
  .sc-body {
    padding: 20px;
  }
  .sc-tabs {
    padding: 0 20px;
    gap: 18px;
  }
  .sc-grid,
  .sc-map-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .sc-header {
    align-items: start;
  }
  .sc-header h2 {
    font-size: 18px;
  }
}
@container capacity (max-width:720px) {
  .sc-sidebar {
    width: 140px;
  }
  .sc-sidebar h1 {
    font-size: 16px;
  }
  .sc-header {
    flex-direction: column;
    padding: 15px 88px 15px 15px;
  }
  .sc-body {
    padding: 15px;
  }
  .sc-tabs {
    gap: 17px;
    padding: 0 15px;
  }
  .sc-grid,
  .sc-map-grid {
    grid-template-columns: 1fr;
  }
  .sc-unit {
    padding: 13px;
  }
  .sc-metrics {
    grid-template-columns: 1fr;
  }
  .sc-metric {
    border: 0;
    border-bottom: 1px solid var(--sc-line);
    padding: 10px;
  }
  .sc-upload {
    align-items: start;
    flex-direction: column;
  }
  .sc-alert {
    margin: 10px 15px 0;
  }
  .sc-unit-top {
    flex-wrap: wrap;
  }
}
@media (prefers-color-scheme: dark) {
  .sc-app {
    --sc-paper: #20272e;
    --sc-soft: #192027;
    --sc-ink: #e4e8ed;
    --sc-muted: #a4acb7;
    --sc-line: #39414b;
  }
  .sc-alert {
    background: #332b20;
    color: #e8c495;
    border-color: #725d3b;
  }
  .sc-error {
    color: #eea59c;
  }
  .sc-warning {
    color: #d8b47b;
  }
  .sc-ok {
    color: #90c5a5;
  }
}
`;var I=window.QwenPaw,e=I.host.React,{useState:x,useEffect:re,useRef:Q,useId:te}=e,oe="/storage-capacity",V=document.createElement("style");V.id="storage-capacity-styles";V.textContent=K;document.getElementById(V.id)?.remove();document.head.appendChild(V);var q=n=>JSON.parse(JSON.stringify(n));function le(n,l){if(n?.schema_version!==2||!Array.isArray(n.units))throw Error("\u8BF7\u4F7F\u7528\u7B2C 2 \u7248\u8BC4\u4F30\u6570\u636E\u683C\u5F0F");let m={...n,documents:n.documents||[],history:n.history||[],benchmarks:n.benchmarks||[]};for(let i of["standard","design","ledger","sources"]){if(n[i]!==void 0&&(!n[i]||Array.isArray(n[i])||typeof n[i]!="object"))throw Error(`${i} \u683C\u5F0F\u65E0\u6548`);m[i]=n[i]||{}}return m.units=n.units.map(i=>{if(!i||typeof i!="object"||Array.isArray(i))throw Error("\u5355\u5143\u683C\u5F0F\u65E0\u6548");let s={...q(l),...i};for(let t of["parameters","conditions","external","evidence"]){if(i[t]!==void 0&&(!i[t]||Array.isArray(i[t])||typeof i[t]!="object"))throw Error(`${t} \u683C\u5F0F\u65E0\u6548`);s[t]={...l[t],...i[t]}}for(let t of["series","pvt","wells","schedule","start_pressures","end_pressures"])if(s[t]=i[t]||[],!Array.isArray(s[t]))throw Error(`${t} \u683C\u5F0F\u65E0\u6548`);return s}),m}var D=(n,l="POST")=>({method:l,headers:{"Content-Type":"application/json"},body:JSON.stringify(n)});async function N(n,l,m=!1){let i=await I.host.fetch(oe+n,l);if(!i.ok){let s=await i.json().catch(()=>({}));throw Error(typeof s.detail=="string"?s.detail:`\u64CD\u4F5C\u672A\u5B8C\u6210\uFF08${i.status}\uFF09`)}return m?i:i.json()}async function G(n,l){let m=await N(n,void 0,!0),i=URL.createObjectURL(await m.blob()),s=document.createElement("a");s.href=i,s.download=l,document.body.appendChild(s),s.click(),s.remove(),setTimeout(()=>URL.revokeObjectURL(i),1e3)}var z=n=>n==null||n===""?"\u672A\u8BA1\u7B97":Number(n).toLocaleString("zh-CN",{maximumFractionDigits:4}),H={name:"\u5355\u5143\uFF0F\u4E95\u540D",weight:"\u6743\u91CD",source:"\u6765\u6E90",pressure:"\u538B\u529B\uFF08MPa\uFF09",z:"Z \u56E0\u5B50",cumulative_produced:"\u672C\u6BB5\u7D2F\u91C7\u91CF\uFF08\u4EBFm\xB3\uFF09",phase:"\u9636\u6BB5 withdrawal",day:"\u533A\u95F4\u7ED3\u675F\u65E5",rate:"\u533A\u95F4\u5E73\u5747\u65E5\u91CF\uFF08\u4E07m\xB3/d\uFF09",a:"\u7CFB\u6570 A",b:"\u7CFB\u6570 B",reservoir_pressure:"\u5730\u5C42\u7EDD\u538B\uFF08MPa\uFF09",bottomhole_pressure:"\u4E95\u5E95\u7EDD\u538B\uFF08MPa\uFF09",observed:"\u89C2\u6D4B\u503C",simulated:"\u6A21\u62DF\u503C",cycle_id:"\u5468\u671F",book_inventory:"\u8D26\u9762\u5E93\u5B58",effective_inventory:"\u6709\u6548\u5E93\u5B58",geological_swing:"\u5730\u5C42\u8C03\u5CF0\u6C14\u91CF",deliverable_swing:"\u7EFC\u5408\u8C03\u5CF0\u80FD\u529B",peak_rate:"\u51B2\u5CF0\u80FD\u529B"},de=[["scope","\u8BC4\u4F30\u8303\u56F4"],["data","\u8D44\u6599\u4E0E\u53C2\u6570"],["methods","\u65B9\u6CD5\u4E0E\u8BA1\u7B97"],["results","\u7ED3\u679C\u590D\u6838"],["report","\u8BC4\u4F30\u62A5\u544A"]];function u({label:n,value:l,onChange:m,type:i="text",options:s,help:t,wide:c=!1,disabled:r=!1}){let v=te();return e.createElement("label",{className:"sc-field"+(c?" sc-span":""),htmlFor:v},e.createElement("span",null,n),s?e.createElement("select",{id:v,value:l??"",onChange:o=>m(o.target.value),disabled:r},s.map(o=>e.createElement("option",{key:o.value??o[0],value:o.value??o[0]},o.label??o[1]))):i==="textarea"?e.createElement("textarea",{id:v,value:l??"",onChange:o=>m(o.target.value),disabled:r}):e.createElement("input",{id:v,type:i,step:i==="number"?"any":void 0,value:l??"",onChange:o=>m(i==="number"?o.target.value===""?null:Number(o.target.value):o.target.value),disabled:r}),t&&e.createElement("small",null,t))}function E({label:n,value:l,onChange:m}){return e.createElement("label",{className:"sc-check"},e.createElement("input",{type:"checkbox",checked:!!l,onChange:i=>m(i.target.checked)}),n)}function M({title:n,columns:l,rows:m,onChange:i}){return e.createElement("div",null,e.createElement("div",{className:"sc-section-head"},e.createElement("h4",null,n),e.createElement("button",{onClick:()=>i([...m,{}])},"\u6DFB\u52A0\u8BB0\u5F55")),m.length>0&&e.createElement("div",{className:"sc-table-wrap"},e.createElement("table",{className:"sc-table"},e.createElement("thead",null,e.createElement("tr",null,l.map(s=>e.createElement("th",{key:s},H[s]||s)),e.createElement("th",null))),e.createElement("tbody",null,m.map((s,t)=>e.createElement("tr",{key:t},l.map(c=>e.createElement("td",{key:c},e.createElement("input",{"aria-label":`${n} \u7B2C${t+1}\u884C ${H[c]||c}`,type:["name","cycle_id","phase","source"].includes(c)?"text":"number",step:"any",value:s[c]??"",onChange:r=>i(m.map((v,o)=>o===t?{...v,[c]:["name","cycle_id","phase","source"].includes(c)?r.target.value:r.target.value===""?null:Number(r.target.value)}:v))}))),e.createElement("td",null,e.createElement("button",{className:"sc-link",onClick:()=>i(m.filter((c,r)=>t!==r)),"aria-label":`\u5220\u9664${n}\u7B2C${t+1}\u884C`},"\u79FB\u9664"))))))))}function pe({points:n,xlabel:l="\u7D2F\u91C7\u91CF\uFF08\u4EBFm\xB3\uFF09",ylabel:m="p/Z\uFF08MPa\uFF09"}){if(n.length<2)return null;let i=720,s=230,t=n.map(b=>b.x),c=n.flatMap(b=>[b.y,b.fitted??b.y]),r=Math.min(...t),v=Math.max(...t),o=Math.min(...c),a=Math.max(...c),f=b=>58+(b-r)/(v-r||1)*630,C=b=>180-(b-o)/(a-o||1)*145;return e.createElement("svg",{className:"sc-chart",viewBox:`0 0 ${i} ${s}`,role:"img","aria-label":`${l}\u4E0E${m}\u5173\u7CFB\u66F2\u7EBF`},e.createElement("path",{d:"M58 25V180H690",fill:"none",stroke:"#adb6c3"}),[0,.5,1].map(b=>e.createElement("g",{key:b},e.createElement("text",{x:"48",y:C(o+b*(a-o))+4,textAnchor:"end"},z(o+b*(a-o))),e.createElement("text",{x:f(r+b*(v-r)),y:"200",textAnchor:"middle"},z(r+b*(v-r))))),e.createElement("polyline",{points:n.map(b=>`${f(b.x)},${C(b.fitted??b.y)}`).join(" "),stroke:"#0d76fd",strokeWidth:"1.5",fill:"none"}),n.map((b,S)=>e.createElement("circle",{key:S,cx:f(b.x),cy:C(b.y),r:"3",fill:"#0d76fd"})),e.createElement("text",{x:"70",y:"17"},m),e.createElement("text",{x:"380",y:"224",textAnchor:"middle"},l))}function ce({doc:n,cat:l,record:m,apply:i,run:s}){let[t,c]=x(n.tables[0]?.id||""),[r,v]=x("units"),[o,a]=x(1),[f,C]=x(n.tables[0]?.rows.length||1),[b,S]=x({}),[P,F]=x({}),[A,O]=x(0),[T,J]=x([]),$=n.tables.find(p=>p.id===t),L=$?.rows[o-1]||[],Z=()=>s(async()=>{let p=await N(`/cases/${m.id}/documents/${n.id}/map`,D({table_id:t,kind:r,start_row:o,end_row:f,mapping:b,factors:P}));J(p.errors),p.errors.length||i(r,p.records,Number(A))});return e.createElement("div",{className:"sc-source"},e.createElement("div",{className:"sc-section-head"},e.createElement("h3",null,n.name),e.createElement("button",{onClick:()=>s(()=>G(`/cases/${m.id}/documents/${n.id}/original`,n.name))},"\u4E0B\u8F7D\u539F\u4EF6")),n.warnings.map((p,g)=>e.createElement("p",{key:g,className:"sc-note"},p)),n.case_candidate&&e.createElement("div",{className:"sc-note"},"\u5305\u542B\u5B8C\u6574\u8BC4\u4F30\u53C2\u6570\u3002\u5BFC\u5165\u5C06\u66FF\u6362\u5F53\u524D\u586B\u5199\u5185\u5BB9\uFF0C\u539F\u59CB\u8D44\u6599\u4FDD\u7559\u3002",e.createElement("button",{onClick:()=>i("case",n.case_candidate)},"\u91C7\u7528\u8BE5\u8BC4\u4F30\u53C2\u6570")),$&&e.createElement(e.Fragment,null,e.createElement("div",{className:"sc-grid"},e.createElement(u,{label:"\u5DE5\u4F5C\u8868\uFF0F\u8868\u683C",value:t,options:n.tables.map(p=>[p.id,p.label]),onChange:p=>{c(p),C(n.tables.find(g=>g.id===p).rows.length),S({})}}),e.createElement(u,{label:"\u8868\u5934\u884C\u53F7",type:"number",value:o,onChange:p=>{a(Math.max(1,p||1)),S({})}}),e.createElement(u,{label:"\u6570\u636E\u7ED3\u675F\u884C\u53F7\uFF08\u542B\uFF09",type:"number",value:f,onChange:C})),e.createElement("div",{className:"sc-table-wrap"},e.createElement("table",{className:"sc-table"},e.createElement("tbody",null,$.rows.slice(Math.max(0,o-1),Math.min(f,o+11)).map((p,g)=>e.createElement("tr",{key:g},e.createElement("th",null,o+g),p.map((j,w)=>e.createElement("td",{key:w},String(j??"")))))))),e.createElement("p",{className:"sc-muted"},"\u9884\u89C8\u524D 12 \u884C\uFF1B\u6620\u5C04\u4F7F\u7528\u6240\u9009\u5B8C\u6574\u884C\u8303\u56F4\u3002\u8868\u5934\u4E4B\u540E\u4E3A\u6570\u636E\u884C\u3002\u5408\u5E76\u8868\u683C\u9700\u9009\u62E9\u542B\u5B57\u6BB5\u540D\u79F0\u7684\u884C\u3002"),e.createElement("div",{className:"sc-grid"},e.createElement(u,{label:"\u8D44\u6599\u7528\u9014",value:r,onChange:p=>{v(p),S({}),F({})},options:Object.keys(l.mapping_fields).map(p=>[p,{units:"\u5206\u5355\u5143\u53C2\u6570",series:"p/Z \u91C7\u6C14\u5E8F\u5217",pvt:"\u538B\u529B\u4E0E Z \u56E0\u5B50\u8868",wells:"\u4E8C\u9879\u5F0F\u4EA7\u80FD\u53C2\u6570",schedule:"\u91C7\u6C14\u9884\u6D4B\u66F2\u7EBF",history:"\u591A\u5468\u671F\u6210\u679C",history_match:"\u5386\u53F2\u62DF\u5408\u6570\u636E"}[p]])}),!["units","history"].includes(r)&&e.createElement(u,{label:"\u5E94\u7528\u5230\u8BC4\u4F30\u5355\u5143",value:A,onChange:O,options:m.case.units.map((p,g)=>[g,p.name])})),e.createElement("details",{open:!0},e.createElement("summary",null,"\u5B57\u6BB5\u5BF9\u5E94\u4E0E\u5355\u4F4D\u6362\u7B97"),e.createElement("div",{className:"sc-map-grid"},l.mapping_fields[r].map(p=>e.createElement("div",{className:"sc-map-field",key:p},e.createElement(u,{label:l.fields[p]?.label||H[p]||p,value:b[p]??"",options:[["","\u4E0D\u5BFC\u5165"],...L.map((g,j)=>[j,`\u7B2C ${j+1} \u5217 \xB7 ${String(g??"\u7A7A")}`])],onChange:g=>S(j=>{let w={...j};return g===""?delete w[p]:w[p]=Number(g),w})}),e.createElement(u,{label:"\u4E58\u6570",value:P[p]??1,options:[[1,"\xD71"],[1e-4,"\u4E07\u2192\u4EBF"],[1e-8,"m\xB3\u2192\u4EBF"],[.001,"kPa\u2192MPa"],[.01,"bar\u2192MPa"],[1e4,"\u4E07\u2192m\xB3"],[1e8,"\u4EBF\u2192m\xB3"]],onChange:g=>F({...P,[p]:Number(g)})})))),e.createElement("p",{className:"sc-note"},"\u76EE\u6807\u6C14\u91CF\u5355\u4F4D\u4E3A\u4EBF\u6807\u51C6 m\xB3\u3001\u538B\u529B\u4E3A MPa\u3002\u6C34\u4FB5\u548C\u8154\u4F53\u4F53\u79EF\u4E3A m\xB3\uFF0C\u4EA7\u80FD\u6D41\u91CF\u4E3A\u4E07 m\xB3/d\u3002\u6807\u51C6\u72B6\u6001\u4E0E\u538B\u529B\u57FA\u51C6\u9700\u5728\u8BC4\u4F30\u8303\u56F4\u4E2D\u5355\u72EC\u6838\u5BF9\u3002"),e.createElement("button",{className:"sc-primary",onClick:Z,disabled:!Object.keys(b).length||!["units","history"].includes(r)&&!m.case.units.length},"\u5BFC\u5165\u6240\u9009\u5B57\u6BB5"),T.map((p,g)=>e.createElement("p",{className:"sc-error",key:g},p)))),n.pages.length>0&&e.createElement("details",{open:!$},e.createElement("summary",null,"\u63D0\u53D6\u7684\u539F\u6587\uFF08",n.pages.length," \u6BB5\uFF09"),n.pages.map((p,g)=>e.createElement("details",{key:g},e.createElement("summary",null,p.label),e.createElement("pre",null,p.text||"\u672A\u53D6\u5F97\u6587\u5B57\uFF0C\u8BF7\u67E5\u770B\u539F\u4EF6")))))}function me({data:n,edit:l,cat:m}){return e.createElement("section",null,e.createElement("div",{className:"sc-section"},e.createElement("h3",null,"\u50A8\u6C14\u5E93\u4E0E\u8BC4\u4F30\u8FB9\u754C"),e.createElement("div",{className:"sc-grid"},e.createElement(u,{label:"\u50A8\u6C14\u5E93\uFF0F\u9879\u76EE\u540D\u79F0",value:n.case_name,onChange:i=>l({case_name:i})}),e.createElement(u,{label:"\u8BC4\u4F30\u5468\u671F",value:n.cycle_id,onChange:i=>l({cycle_id:i}),help:"\u4F8B\u5982 2025\u20132026\uFF0C\u4E0D\u80FD\u7528\u6587\u4EF6\u4E0A\u4F20\u65F6\u95F4\u4EE3\u66FF"}),e.createElement(u,{label:"\u8BC4\u4F30\u4EFB\u52A1",value:n.purpose,options:[["cycle","\u5468\u671F\u8BC4\u4F30"],["calibration","\u9636\u6BB5\u6807\u5B9A"],["design_review","\u8BBE\u8BA1\u590D\u6838"]],onChange:i=>l({purpose:i})}),e.createElement(u,{label:"\u5EFA\u5E93\u7C7B\u578B",value:n.storage_type,options:m.storage_types,onChange:i=>l({storage_type:i})}),e.createElement(u,{label:"\u50A8\u96C6\u4F53",value:n.rock_type,options:[["sandstone","\u7802\u5CA9"],["carbonate","\u78B3\u9178\u76D0\u5CA9"],["fractured","\u88C2\u7F1D\uFF0F\u6D1E\u7A74"],["salt","\u76D0\u5CA9"],["other","\u5176\u4ED6"]],onChange:i=>l({rock_type:i})}),e.createElement(u,{label:"\u538B\u529B\u53E3\u5F84",value:n.pressure_basis,options:[["","\u8BF7\u9009\u62E9"],["absolute","\u7EDD\u5BF9\u538B\u529B"],["apparent_formation","\u89C6\u5730\u5C42\u538B\u529B"],["report_defined","\u62A5\u544A\u5B9A\u4E49\u53E3\u5F84"]],onChange:i=>l({pressure_basis:i})}),e.createElement(u,{label:"\u91C7\u6C14\u6BB5\u8D77\u59CB\u72B6\u6001",value:n.start_state,onChange:i=>l({start_state:i}),help:"\u65E5\u671F\u6216\u660E\u786E\u7684\u72B6\u6001\u7F16\u53F7"}),e.createElement(u,{label:"\u91C7\u6C14\u6BB5\u672B\u671F\u72B6\u6001",value:n.end_state,onChange:i=>l({end_state:i})}))),e.createElement("div",{className:"sc-section"},e.createElement("h3",null,"\u6807\u51C6\u72B6\u6001\u4E0E\u8BA1\u91CF\u8FB9\u754C"),e.createElement(u,{label:"\u6C14\u91CF\u53E3\u5F84\u786E\u8BA4\u65B9\u5F0F",value:n.standard.mode||"verified",options:[["verified","\u6309\u8BA1\u91CF\u6587\u4EF6\u786E\u8BA4\u6807\u51C6\u6E29\u538B"],["reported","\u6CBF\u7528\u540C\u4E00\u62A5\u544A\u6C14\u91CF\u53E3\u5F84\uFF0C\u6807\u51C6\u6E29\u538B\u5F85\u6838\u5B9E"]],onChange:i=>l({standard:{...n.standard,mode:i}}),help:"\u62A5\u544A\u53E3\u5F84\u4EC5\u652F\u6301\u7269\u8D28\u5E73\u8861\u7684\u6761\u4EF6\u590D\u7B97\uFF1B\u72B6\u6001\u65B9\u7A0B\u548C\u8DE8\u6765\u6E90\u6C14\u91CF\u6BD4\u8F83\u5FC5\u987B\u6838\u5B9E\u6807\u51C6\u6E29\u538B\u3002"}),e.createElement("div",{className:"sc-grid"},[["temperature","\u6807\u51C6\u6E29\u5EA6\uFF08K\uFF09"],["pressure","\u6807\u51C6\u7EDD\u538B\uFF08MPa\uFF09"],["z","\u6807\u51C6\u72B6\u6001 Z \u56E0\u5B50"]].map(([i,s])=>e.createElement(u,{key:i,label:s,type:"number",value:n.standard[i],onChange:t=>l({standard:{...n.standard,[i]:t}})})),e.createElement(u,{label:"\u6807\u51C6\u72B6\u6001\u4F9D\u636E",value:n.standard.source,onChange:i=>l({standard:{...n.standard,source:i}}),wide:!0,help:"\u6309\u8BA1\u91CF\u6587\u4EF6\u586B\u5199\uFF1B\u6E29\u6807\u3001\u4F53\u79EF\u57FA\u51C6\u6216\u7EC4\u5206\u4E0D\u540C\u7684\u8D44\u6599\u5148\u6362\u7B97\u518D\u6BD4\u8F83"}))),e.createElement("div",{className:"sc-section"},e.createElement("div",{className:"sc-section-head"},e.createElement("h3",null,"\u8BC4\u4F30\u5355\u5143"),e.createElement("button",{onClick:()=>l({units:[...n.units,{...q(m.unit_template),name:`\u8BC4\u4F30\u5355\u5143 ${n.units.length+1}`}]})},"\u6DFB\u52A0\u5355\u5143")),e.createElement("p",{className:"sc-muted"},"\u6309\u5C42\u7CFB\u3001\u8FDE\u901A\u533A\u3001\u4E95\u63A7\u8303\u56F4\u6216\u72EC\u7ACB\u76D0\u7A74\u5212\u5206\u3002\u4E00\u4E2A\u5355\u5143\u53EF\u91C7\u7528\u4E00\u79CD\u4E3B\u65B9\u6CD5\uFF0C\u5176\u4ED6\u6210\u679C\u7528\u4E8E\u4EA4\u53C9\u6BD4\u8F83\u3002"),n.units.map((i,s)=>e.createElement("div",{key:s,className:"sc-unit"},e.createElement("div",{className:"sc-grid"},e.createElement(u,{label:`\u5355\u5143 ${s+1} \u540D\u79F0`,value:i.name,onChange:t=>l({units:n.units.map((c,r)=>r===s?{...c,name:t}:c)})}),e.createElement(u,{label:"\u8303\u56F4\u4E0E\u53C2\u6570\u6765\u6E90",value:i.source,onChange:t=>l({units:n.units.map((c,r)=>r===s?{...c,source:t}:c)})}),e.createElement("button",{onClick:()=>l({units:n.units.filter((t,c)=>c!==s)})},"\u79FB\u9664\u5355\u5143")))),n.units.length===0&&e.createElement("p",{className:"sc-note"},"\u5148\u6DFB\u52A0\u4E00\u4E2A\u8BC4\u4F30\u5355\u5143\uFF0C\u6216\u5728\u8D44\u6599\u9875\u5BFC\u5165\u5206\u5355\u5143\u53C2\u6570\u8868\u3002"),n.units.length>1&&e.createElement(E,{label:"\u5404\u5355\u5143\u8303\u56F4\u4E0D\u91CD\u53E0\uFF0C\u6C14\u91CF\u91C7\u7528\u4E00\u81F4\u6807\u51C6\u72B6\u6001\u548C\u65F6\u95F4\u8FB9\u754C",value:n.non_overlapping,onChange:i=>l({non_overlapping:i})})),e.createElement("details",null,e.createElement("summary",null,"\u6807\u51C6\u4E0E\u672F\u8BED"),e.createElement("div",{className:"sc-help"},m.standards.map(i=>e.createElement("p",{key:i.id},e.createElement("strong",null,i.id," ",i.name),e.createElement("br",null),i.basis,i.url&&e.createElement(e.Fragment,null," ",e.createElement("a",{href:i.url,target:"_blank",rel:"noreferrer"},"\u6807\u51C6\u76EE\u5F55")))),m.terms.map(i=>e.createElement("p",{key:i.key},e.createElement("strong",null,i.name),"\u3000",i.definition)))))}function ue({data:n,edit:l}){let[m,i]=x(Object.keys(n.ledger||{}).length?"ledger":"direct");return e.createElement("div",{className:"sc-section"},e.createElement("h3",null,"\u5168\u5E93\u8BA1\u91CF\u4E0E\u8BBE\u8BA1\u6307\u6807"),e.createElement("div",{className:"sc-grid"},e.createElement(u,{label:"\u8D26\u9762\u5E93\u5B58\u6765\u6E90",value:m,options:[["direct","\u76F4\u63A5\u5F55\u5165\u5DF2\u6838\u5B9E\u503C"],["ledger","\u4ECE\u8BA1\u91CF\u5E73\u8861\u8BA1\u7B97"]],onChange:s=>{i(s),l({book_inventory:null,ledger:{}})}}),m==="direct"?e.createElement(e.Fragment,null,e.createElement(u,{label:"\u8D77\u59CB\u72B6\u6001\u8D26\u9762\u5E93\u5B58\uFF08\u4EBFm\xB3\uFF09",value:n.book_inventory,type:"number",onChange:s=>l({book_inventory:s})}),e.createElement(u,{label:"\u8D26\u9762\u5E93\u5B58\u4F9D\u636E",value:n.sources?.book_inventory,onChange:s=>l({sources:{...n.sources,book_inventory:s}})})):e.createElement(e.Fragment,null,[["initial_inventory","\u671F\u521D\u5E93\u5B58"],["injected","\u7D2F\u8BA1\u6CE8\u6C14"],["withdrawn","\u7D2F\u8BA1\u91C7\u6C14"],["metered_loss","\u5DF2\u6838\u5B9E\u635F\u8017"],["equivalent_gas","\u6DB2\u4F53\u5F53\u91CF\u6C14\u91C7\u51FA\u91CF"]].map(([s,t])=>e.createElement(u,{key:s,label:t+"\uFF08\u4EBFm\xB3\uFF09",value:n.ledger?.[s],type:"number",onChange:c=>l({ledger:{...n.ledger,[s]:c}})})),e.createElement(u,{label:"\u8BA1\u91CF\u533A\u95F4\u4E0E\u6765\u6E90",value:n.ledger?.source,onChange:s=>l({ledger:{...n.ledger,source:s}}),wide:!0})),e.createElement(u,{label:"\u8BBE\u8BA1\u5E93\u5BB9\u91CF\uFF08\u4EBFm\xB3\uFF09",value:n.design.capacity,type:"number",onChange:s=>l({design:{...n.design,capacity:s}})}),e.createElement(u,{label:"\u8BBE\u8BA1\u5DE5\u4F5C\u6C14\u91CF\uFF08\u4EBFm\xB3\uFF09",value:n.design.working_gas,type:"number",onChange:s=>l({design:{...n.design,working_gas:s}})}),e.createElement(u,{label:"\u8BBE\u8BA1\u51B2\u5CF0\u80FD\u529B\uFF08\u4E07m\xB3/d\uFF09",value:n.design.peak_rate,type:"number",onChange:s=>l({design:{...n.design,peak_rate:s}})}),e.createElement(u,{label:"\u8BBE\u8BA1\u4F9D\u636E",value:n.design.source,onChange:s=>l({design:{...n.design,source:s}}),wide:!0})),e.createElement("p",{className:"sc-note"},"\u8BA1\u91CF\u5E73\u8861\u5E94\u7ED3\u675F\u4E8E\u672C\u6B21\u91C7\u6C14\u6BB5\u8D77\u59CB\u72B6\u6001\u3002\u635F\u8017\u3001\u6DB2\u4F53\u5F53\u91CF\u6C14\u9700\u663E\u5F0F\u586B\u5199\u6838\u5B9E\u503C\u6216\u96F6\uFF1B\u5B83\u4EEC\u4E0E\u672A\u52A8\u7528\u5E93\u5B58\u5206\u5F00\u8BA1\u7B97\u3002"))}function be({data:n,edit:l,cat:m}){let i=(s,t)=>l({units:n.units.map((c,r)=>s===r?{...c,...t}:c)});return e.createElement("section",null,!n.units.length&&e.createElement("p",{className:"sc-note"},"\u8BF7\u5148\u5728\u8BC4\u4F30\u8303\u56F4\u4E2D\u6DFB\u52A0\u5355\u5143\u3002"),n.units.map((s,t)=>{let c=m.methods.find(a=>a.id===s.method)||m.methods[0],r=(a,f)=>i(t,{conditions:{...s.conditions,[a]:f}}),v=(a,f)=>i(t,{parameters:{...s.parameters,[a]:f},evidence:{...s.evidence,...s.evidence?.[a]?{[a]:{...s.evidence[a],edited:!0,location:"\u624B\u5DE5\u4FEE\u6539\uFF1B\u539F\u59CB\u5B9A\u4F4D\uFF1A"+(s.evidence[a].original_location||s.evidence[a].location),original_location:s.evidence[a].original_location||s.evidence[a].location}}:{}}}),o=(a,f)=>i(t,{external:{...s.external,[a]:f}});return e.createElement("div",{className:"sc-unit",key:t},e.createElement("div",{className:"sc-unit-top"},e.createElement("h3",null,s.name),e.createElement("span",{className:"sc-muted"},c.mode==="external"?"\u771F\u5B9E\u5916\u90E8\u6210\u679C\u590D\u6838":"\u786E\u5B9A\u6027\u8BA1\u7B97")),e.createElement("div",{className:"sc-grid"},e.createElement(u,{label:"\u4E3B\u8BC4\u4F30\u65B9\u6CD5",value:s.method,options:m.methods.map(a=>[a.id,a.name]),onChange:a=>i(t,{method:a})}),e.createElement(u,{label:"\u6C34\u4F53\u5F71\u54CD",value:s.conditions.water_drive,options:[["unknown","\u5C1A\u672A\u5224\u65AD"],["none","\u65E0\u6C34\u4FB5"],["weak","\u5F31\u6C34\u4FB5\uFF0C\u5DF2\u8BBA\u8BC1\u53EF\u5FFD\u7565"],["moderate","\u4E2D\u7B49\u6C34\u4FB5"],["strong","\u5F3A\u6C34\u4FB5"]],onChange:a=>r("water_drive",a)}),e.createElement(u,{label:"\u6D41\u4F53\u4E0E\u76F8\u6001",value:s.conditions.fluid,options:[["unknown","\u5C1A\u672A\u5224\u65AD"],["dry_gas","\u5E72\u6C14\uFF0C\u6C14\u76F8\u4E3A\u4E3B"],["stable_gas","\u6CB9\u73AF\uFF0F\u51DD\u6790\u5F71\u54CD\u5DF2\u8BBA\u8BC1\u53EF\u5FFD\u7565"],["oil","\u6CB9\u73AF\u6216\u6CB9\u6C14\u6C34\u4F20\u8D28\u663E\u8457"],["condensate","\u51DD\u6790\u5F71\u54CD\u663E\u8457"]],onChange:a=>r("fluid",a)}),e.createElement(u,{label:"\u4E95\u95F4\u5E72\u6270",value:s.conditions.interference,options:[["unknown","\u5C1A\u672A\u5224\u65AD"],["none","\u65E0\u660E\u663E\u5E72\u6270"],["weak","\u5F31\u5E72\u6270\u3001\u4E95\u63A7\u8303\u56F4\u4E0D\u91CD\u53E0"],["strong","\u5F3A\u5E72\u6270"]],onChange:a=>r("interference",a)}),e.createElement(u,{label:"\u53C2\u6570\u4E0E\u9002\u7528\u6027\u4F9D\u636E",value:s.source,onChange:a=>i(t,{source:a}),wide:!0}),e.createElement(u,{label:"\u9002\u7528\u6761\u4EF6\u786E\u8BA4\u65B9\u5F0F",value:s.condition_basis||"verified",options:[["verified","\u7ECF\u8D44\u6599\u6838\u67E5\u786E\u8BA4"],["reported","\u6CBF\u7528\u539F\u62A5\u544A\u524D\u63D0\uFF0C\u4F5C\u6761\u4EF6\u590D\u7B97"]],onChange:a=>i(t,{condition_basis:a})})),e.createElement(E,{label:"\u5DF2\u6838\u5B9E\u672C\u5355\u5143\u538B\u529B\uFF0F\u4F53\u79EF\u7684\u4EE3\u8868\u6027\u3001\u5355\u5143\u8FB9\u754C\u53CA\u53D6\u503C\u4F9D\u636E",value:s.conditions.pressure_representative,onChange:a=>r("pressure_representative",a)}),["pz","pz_regression","water_mbe"].includes(s.method)&&e.createElement(E,{label:"\u672C\u6BB5\u5185\u65E0\u540C\u671F\u6CE8\u6C14\uFF0C\u5B54\u9699\u4F53\u79EF\u53EF\u8FD1\u4F3C\u4E0D\u53D8\uFF1B\u4E24\u72B6\u6001\u538B\u529B\u4F7F\u7528\u76F8\u540C\u53E3\u5F84",value:s.conditions.closed_during_segment,onChange:a=>r("closed_during_segment",a)}),s.method==="water_mbe"&&e.createElement(E,{label:"\u6C34\u4FB5\u91CF\u3001\u4EA7\u6C34\u91CF\u4E0E\u6C34\u4F53\u79EF\u7CFB\u6570\u5DF2\u6709\u72EC\u7ACB\u6838\u5B9E\u4F9D\u636E",value:s.conditions.water_volume_verified,onChange:a=>r("water_volume_verified",a)}),e.createElement("p",{className:"sc-note"},c.condition,e.createElement("br",null),c.reference),e.createElement("div",{className:"sc-formula"},c.formula),e.createElement("div",{className:"sc-grid"},c.fields.map(a=>e.createElement(u,{key:a,label:`${m.fields[a].label}\uFF08${m.fields[a].unit}\uFF09${c.required.includes(a)?" *":""}`,type:"number",value:s.parameters[a],onChange:f=>v(a,f)}))),s.method==="pz_regression"&&e.createElement(M,{title:"\u540C\u4E00\u91C7\u6C14\u6BB5 p/Z \u5E8F\u5217",columns:["cumulative_produced","pressure","z"],rows:s.series||[],onChange:a=>i(t,{series:a})}),c.mode==="external"&&e.createElement(e.Fragment,null,e.createElement("div",{className:"sc-grid"},[["software","\u89E3\u91CA\uFF0F\u6A21\u62DF\u8F6F\u4EF6"],["model_version","\u6A21\u578B\u7248\u672C"],["run_id","\u8FD0\u884C\u7F16\u53F7"],["input_reference","\u8F93\u5165\u7248\u672C\uFF0F\u6821\u9A8C\u6458\u8981"],["source","\u6210\u679C\u6587\u4EF6\u4E0E\u4F4D\u7F6E"],["cycle_id","\u6210\u679C\u5468\u671F"],["state","\u6210\u679C\u8D77\u59CB\u72B6\u6001"],["match_metric","\u5386\u53F2\u62DF\u5408\u6307\u6807"],["match_unit","\u62DF\u5408\u6307\u6807\u5355\u4F4D"]].map(([a,f])=>e.createElement(u,{key:a,label:f,value:s.external?.[a],onChange:C=>o(a,C)})),["effective_inventory","geological_swing","deliverable_swing","movable_cushion","capacity","working_gas"].map(a=>e.createElement(u,{key:a,label:(m.terms.find(f=>f.key===a)?.name||a)+"\uFF08\u4EBFm\xB3\uFF09",value:s.external?.[a],type:"number",onChange:f=>o(a,f)}))),e.createElement(E,{label:"\u5916\u90E8\u6C14\u91CF\u5DF2\u6362\u7B97\u4E3A\u4EBF\u6807\u51C6 m\xB3\uFF0C\u4E14\u6807\u51C6\u72B6\u6001\u4E0E\u5F53\u524D\u8BC4\u4F30\u4E00\u81F4",value:s.external?.gas_volume_unit==="1e8_sm3"&&JSON.stringify(s.external?.standard)===JSON.stringify(n.standard),onChange:a=>i(t,{external:{...s.external,gas_volume_unit:a?"1e8_sm3":"",standard:a?q(n.standard):null}})}),e.createElement(M,{title:"\u5386\u53F2\u62DF\u5408\u8BB0\u5F55",columns:["observed","simulated"],rows:s.external?.history_match||[],onChange:a=>o("history_match",a)})),["pz","pz_regression","volumetric"].includes(s.method)&&e.createElement("details",null,e.createElement("summary",null,"PVT \u6570\u636E\u4E0E\u63D2\u503C"),e.createElement("p",{className:"sc-muted"},"\u5BF9\u5E94 Z \u672A\u586B\u5199\u65F6\uFF0C\u4F7F\u7528\u4E0B\u8868\u7EBF\u6027\u63D2\u503C\u3002\u4FDD\u7559\u538B\u529B\u548C\u6E29\u5EA6\u6761\u4EF6\uFF0C\u4E0D\u5916\u63A8\u3002"),e.createElement(M,{title:"PVT \u8868",columns:["pressure","z"],rows:s.pvt||[],onChange:a=>i(t,{pvt:a})})),s.method==="pz"&&e.createElement("details",null,e.createElement("summary",null,"\u6D4B\u538B\u52A0\u6743\u8BA1\u7B97"),e.createElement("p",{className:"sc-muted"},"\u586B\u5165\u8BB0\u5F55\u540E\uFF0C\u4EE5\u52A0\u6743\u7ED3\u679C\u66FF\u4EE3\u672C\u5355\u5143\u76F8\u5E94\u538B\u529B\u3002\u53EA\u5408\u5E76\u540C\u4E00\u72B6\u6001\u3001\u540C\u4E00\u538B\u529B\u57FA\u51C6\u4E14\u5177\u6709\u4EE3\u8868\u6027\u7684\u4E95\uFF1B\u6743\u91CD\u5E94\u6709\u72EC\u7ACB\u4F9D\u636E\uFF0C\u4E0D\u80FD\u8DE8\u8FDE\u901A\u5355\u5143\u5E73\u5747\u3002"),e.createElement("div",{className:"sc-grid"},e.createElement(u,{label:"\u6743\u91CD\u4F9D\u636E",value:s.pressure_weight_basis,onChange:a=>i(t,{pressure_weight_basis:a})}),e.createElement(u,{label:"\u6D4B\u538B\u72B6\u6001\u4E0E\u6765\u6E90",value:s.pressure_source,onChange:a=>i(t,{pressure_source:a})})),e.createElement(M,{title:"\u8D77\u59CB\u72B6\u6001\u6D4B\u538B",columns:["name","pressure","weight"],rows:s.start_pressures||[],onChange:a=>i(t,{start_pressures:a})}),e.createElement(M,{title:"\u672B\u671F\u72B6\u6001\u6D4B\u538B",columns:["name","pressure","weight"],rows:s.end_pressures||[],onChange:a=>i(t,{end_pressures:a})})),s.method==="pz"&&e.createElement("details",null,e.createElement("summary",null,"\u8F93\u5165\u654F\u611F\u6027"),e.createElement(u,{label:"\u5355\u56E0\u7D20\u6270\u52A8\u5E45\u5EA6\uFF08%\uFF0C\u4E0D\u5927\u4E8E 10\uFF09",type:"number",value:s.sensitivity_percent,onChange:a=>i(t,{sensitivity_percent:a})}),e.createElement("p",{className:"sc-muted"},"\u9010\u9879\u6270\u52A8\u91C7\u6C14\u91CF\u3001\u538B\u529B\u548C Z\uFF0C\u663E\u793A\u7ED3\u679C\u53D8\u5316\uFF1B\u4E0D\u4F5C\u4E3A\u6982\u7387\u7F6E\u4FE1\u533A\u95F4\u3002")),e.createElement("details",null,e.createElement("summary",null,"\u7EFC\u5408\u8C03\u5CF0\u4E0E\u51B2\u5CF0\u7EA6\u675F"),e.createElement("div",{className:"sc-grid"},e.createElement(u,{label:"\u65B9\u6848\u91C7\u6C14\u671F\uFF08\u5929\uFF09",value:s.withdrawal_days,type:"number",onChange:a=>i(t,{withdrawal_days:a})}),e.createElement(u,{label:"\u5355\u5143\u5730\u9762\u5904\u7406\u9650\u989D\uFF08\u4E07m\xB3/d\uFF09",value:s.surface_limit,type:"number",onChange:a=>i(t,{surface_limit:a})}),e.createElement(u,{label:"\u9884\u6D4B\u66F2\u7EBF\u4F9D\u636E\u4E0E\u5916\u8F93\u6761\u4EF6",value:s.schedule_source,onChange:a=>i(t,{schedule_source:a})})),e.createElement("p",{className:"sc-note"},"\u66F2\u7EBF\u8F93\u5165\u4E3A\u5404\u65F6\u95F4\u6BB5\u5E73\u5747\u65E5\u91C7\u6C14\u91CF\uFF0C\u5FC5\u987B\u8986\u76D6\u5B8C\u6574\u91C7\u6C14\u671F\u3002\u7B97\u6CD5\u5206\u6BB5\u79EF\u5206\u5E76\u65BD\u52A0\u5730\u9762\u4E0A\u9650\uFF0C\u518D\u4E0E\u5730\u5C42\u8C03\u5CF0\u6C14\u91CF\u53D6\u5C0F\u503C\u3002\u4E95\u5E95\u538B\u529B\u9700\u6765\u81EA\u4E95\u7B52\uFF0F\u7BA1\u7F51\u8BA1\u7B97\uFF0C\u4E0D\u4EE5\u4E95\u53E3\u538B\u529B\u66FF\u4EE3\u3002"),e.createElement(M,{title:"\u91C7\u6C14\u9884\u6D4B",columns:["day","rate"],rows:s.schedule||[],onChange:a=>i(t,{schedule:a})}),e.createElement(M,{title:"\u4E8C\u9879\u5F0F\u4EA7\u80FD",columns:["name","a","b","reservoir_pressure","bottomhole_pressure"],rows:s.wells||[],onChange:a=>i(t,{wells:a})})))}),n.units.length>1&&e.createElement(E,{label:"\u5404\u5355\u5143\u5730\u9762\u8BBE\u65BD\u53CA\u5916\u8F93\u901A\u9053\u5B8C\u5168\u72EC\u7ACB\uFF0C\u53EF\u6309\u540C\u5468\u671F\u6210\u679C\u6C47\u603B\u7EFC\u5408\u8C03\u5CF0\u80FD\u529B",value:n.independent_surface,onChange:s=>l({independent_surface:s})}),e.createElement(u,{label:"\u9879\u76EE\u5047\u8BBE\u4E0E\u5F85\u786E\u8BA4\u4E8B\u9879",type:"textarea",value:n.assumptions,onChange:s=>l({assumptions:s})}),n.units.length>1&&e.createElement(u,{label:"\u5168\u5E93\u5171\u7528\u5730\u9762\u5904\u7406\u80FD\u529B\uFF08\u4E07m\xB3/d\uFF09",type:"number",value:n.site_surface_limit,onChange:s=>l({site_surface_limit:s})}),e.createElement("p",{className:"sc-note"},"\u4FDD\u5B58\u540E\u8FD0\u884C\u8BA1\u7B97\u3002\u6761\u4EF6\u4E0D\u6EE1\u8DB3\u6216\u8D44\u6599\u4E0D\u9F50\u5168\u65F6\uFF0C\u5C55\u793A\u5177\u4F53\u7F3A\u9879\uFF0C\u5176\u4ED6\u5355\u5143\u53EF\u72EC\u7ACB\u5B8C\u6210\uFF1B\u5168\u5E93\u6307\u6807\u53EA\u5728\u5B8C\u6574\u8303\u56F4\u5177\u5907\u540C\u53E3\u5F84\u7ED3\u679C\u65F6\u6C47\u603B\u3002"))}function he({evaluation:n,review:l,cat:m,stale:i,busy:s,onReview:t}){if(!n)return e.createElement("div",{className:"sc-empty"},e.createElement("h2",null,"\u5C1A\u672A\u8BA1\u7B97"),e.createElement("p",null,"\u786E\u8BA4\u8BC4\u4F30\u8303\u56F4\u548C\u8F93\u5165\u53C2\u6570\u540E\uFF0C\u8FD0\u884C\u8BA1\u7B97\u5373\u53EF\u67E5\u770B\u5206\u5355\u5143\u7ED3\u679C\u3001\u7F3A\u9879\u4E0E\u65B9\u6CD5\u5EFA\u8BAE\u3002"));let c=n;return e.createElement("section",null,e.createElement("div",{className:"sc-results-head"},e.createElement("div",null,e.createElement("h3",null,c.status==="calculated"?"\u8BA1\u7B97\u7ED3\u679C":"\u5F85\u8865\u5145\u8D44\u6599\u4E0E\u6761\u4EF6"),e.createElement("p",{className:"sc-muted"},c.summary)),e.createElement("button",{disabled:i||s,onClick:t},"\u65B9\u6CD5\u5BA1\u67E5")),i&&e.createElement("p",{className:"sc-note"},"\u8F93\u5165\u5DF2\u4FEE\u6539\uFF0C\u4EE5\u4E0B\u4E3A\u4E0A\u6B21\u8BA1\u7B97\u5FEB\u7167\u3002\u91CD\u65B0\u8BA1\u7B97\u540E\u624D\u80FD\u751F\u6210\u5F53\u524D\u62A5\u544A\u3002"),c.metrics.length>0&&e.createElement("div",{className:"sc-metrics"},c.metrics.filter(r=>["book_inventory","effective_inventory","deliverable_swing","capacity","working_gas"].includes(r.key)).slice(0,3).map(r=>e.createElement("div",{className:"sc-metric",key:r.key},e.createElement("span",null,r.label),e.createElement("strong",null,z(r.value),e.createElement("small",null,r.unit))))),e.createElement("div",{className:"sc-table-wrap"},e.createElement("table",{className:"sc-table"},e.createElement("thead",null,e.createElement("tr",null,e.createElement("th",null,"\u6307\u6807"),e.createElement("th",null,"\u7ED3\u679C"),e.createElement("th",null,"\u5355\u4F4D"),e.createElement("th",null,"\u4F9D\u636E"))),e.createElement("tbody",null,c.metrics.map(r=>e.createElement("tr",{key:r.key},e.createElement("td",null,r.label),e.createElement("td",{className:"sc-number"},z(r.value)),e.createElement("td",null,r.unit),e.createElement("td",null,r.source)))))),e.createElement("div",{className:"sc-section"},e.createElement("h3",null,"\u8D44\u6599\u4E0E\u53E3\u5F84\u68C0\u67E5"),e.createElement("div",{className:"sc-table-wrap"},e.createElement("table",{className:"sc-table"},e.createElement("tbody",null,c.checks.map((r,v)=>e.createElement("tr",{key:v},e.createElement("td",null,r.label),e.createElement("td",{className:"sc-"+(r.status==="passed"?"ok":r.status)},{passed:"\u901A\u8FC7",warning:"\u9700\u590D\u6838",error:"\u5F85\u8865\u5145"}[r.status]),e.createElement("td",null,r.detail))))))),c.comparisons?.length>0&&e.createElement("div",{className:"sc-section"},e.createElement("h3",null,"\u4EA4\u53C9\u6821\u9A8C"),e.createElement("div",{className:"sc-table-wrap"},e.createElement("table",{className:"sc-table"},e.createElement("thead",null,e.createElement("tr",null,e.createElement("th",null,"\u6307\u6807"),e.createElement("th",null,"\u8BA1\u7B97\u503C"),e.createElement("th",null,"\u5BF9\u6BD4\u503C"),e.createElement("th",null,"\u504F\u5DEE"),e.createElement("th",null,"\u4F9D\u636E"))),e.createElement("tbody",null,c.comparisons.map((r,v)=>e.createElement("tr",{key:v},e.createElement("td",null,m.terms.find(o=>o.key===r.metric)?.name||r.metric),e.createElement("td",null,z(r.calculated)),e.createElement("td",null,z(r.value)),e.createElement("td",null,z(r.difference_percent),"%"),e.createElement("td",null,r.source))))))),c.units.map((r,v)=>e.createElement("div",{className:"sc-unit",key:v},e.createElement("div",{className:"sc-unit-top"},e.createElement("h3",null,r.name),e.createElement("span",{className:"sc-muted"},m.methods.find(o=>o.id===r.method)?.name," \xB7"," ",r.status==="calculated"?"\u5DF2\u8BA1\u7B97":"\u5F85\u8865\u5145")),r.errors.map((o,a)=>e.createElement("p",{className:"sc-error",key:a},o)),e.createElement("p",{className:"sc-note"},"\u65B9\u6CD5\u5EFA\u8BAE\uFF1A",m.methods.find(o=>o.id===r.recommendation.method)?.name,"\u3002",r.recommendation.reason),r.warnings?.map((o,a)=>e.createElement("p",{className:"sc-warning",key:a},o)),r.steps?.map((o,a)=>e.createElement("div",{className:"sc-formula",key:a},o)),r.plot&&e.createElement(pe,{points:r.plot}),e.createElement("div",{className:"sc-table-wrap"},e.createElement("table",{className:"sc-table"},e.createElement("tbody",null,Object.entries(r.values||{}).map(([o,a])=>e.createElement("tr",{key:o},e.createElement("td",null,m.terms.find(f=>f.key===o)?.name||{cushion:"\u538B\u529B\u7A97\u53E3\u4E0B\u9650\u6C14\u91CF",effective_capacity:"\u6709\u6548\u5E93\u5BB9\u91CF"}[o]||o),e.createElement("td",{className:"sc-number"},z(a)),e.createElement("td",null,o==="peak_rate"?"\u4E07m\xB3/d":"\u4EBFm\xB3")))))),r.diagnostics&&e.createElement("details",null,e.createElement("summary",null,"\u62DF\u5408\u4E0E\u8BA1\u7B97\u8BCA\u65AD"),e.createElement("div",{className:"sc-table-wrap"},e.createElement("table",{className:"sc-table"},e.createElement("tbody",null,Object.entries(r.diagnostics).filter(([o])=>o!=="residuals").map(([o,a])=>e.createElement("tr",{key:o},e.createElement("td",null,{start_pz:"\u8D77\u59CB p/Z",end_pz:"\u672B\u671F p/Z",inverse_withdrawal_fraction:"\u64A4\u91C7\u6BD4\u4F8B\u5012\u6570",intercept:"\u56DE\u5F52\u622A\u8DDD",slope:"\u56DE\u5F52\u659C\u7387",r_squared:"\u62DF\u5408\u4F18\u5EA6 R\xB2",rmse:"\u5747\u65B9\u6839\u8BEF\u5DEE",mae:"\u5E73\u5747\u7EDD\u5BF9\u8BEF\u5DEE",n:"\u6837\u672C\u6570",metric:"\u6307\u6807",unit:"\u5355\u4F4D",schedule_integral:"\u91C7\u6C14\u66F2\u7EBF\u79EF\u5206\uFF08\u4EBFm\xB3\uFF09",net_water_reservoir_m3:"\u51C0\u6C34\u4FB5\u91CF\uFF08\u5730\u5C42m\xB3\uFF09",bg_depletion:"\u4F53\u79EF\u7CFB\u6570\u53D8\u5316"}[o]||o),e.createElement("td",null,typeof a=="number"?z(a):String(a)))))))),r.sensitivity&&e.createElement("details",null,e.createElement("summary",null,"\u8F93\u5165\u6270\u52A8 \xB1",r.sensitivity.percent,"%"),e.createElement("p",{className:"sc-muted"},r.sensitivity.label),e.createElement("table",{className:"sc-table"},e.createElement("thead",null,e.createElement("tr",null,e.createElement("th",null,"\u8F93\u5165"),e.createElement("th",null,"\u8D1F\u5411\u6270\u52A8\u7ED3\u679C"),e.createElement("th",null,"\u6B63\u5411\u6270\u52A8\u7ED3\u679C"))),e.createElement("tbody",null,r.sensitivity.rows.map(o=>e.createElement("tr",{key:o.parameter},e.createElement("td",null,o.parameter),e.createElement("td",null,z(o.minus)),e.createElement("td",null,z(o.plus))))))))),e.createElement("div",{className:"sc-section"},e.createElement("h3",null,"\u5DE5\u7A0B\u65B9\u6CD5\u5BA1\u67E5"),e.createElement("div",{className:"sc-prose"},l?.status==="completed"?l.text:"\u5C1A\u672A\u8C03\u7528\u5E93\u5B58\u8BC4\u4EF7\u667A\u80FD\u4F53\u3002\u9700\u8981\u5224\u65AD\u65B9\u6CD5\u3001\u538B\u529B\u4EE3\u8868\u6027\u6216\u5DEE\u5F02\u539F\u56E0\u65F6\uFF0C\u70B9\u51FB\u201C\u65B9\u6CD5\u5BA1\u67E5\u201D\u3002\u8BA1\u7B97\u7ED3\u679C\u4E0D\u4F9D\u8D56\u667A\u80FD\u4F53\u53EF\u7528\u6027\u3002")),e.createElement("details",null,e.createElement("summary",null,"\u8BA1\u7B97\u8BB0\u5F55"),e.createElement("p",{className:"sc-muted"},"\u7248\u672C ",c.engine_version,"\uFF0C\u5B9E\u9645\u8BA1\u7B97\u8017\u65F6 ",c.duration_ms," ms\uFF0C",new Date(c.created_at).toLocaleString("zh-CN")),e.createElement("p",{className:"sc-prose"},"\u8F93\u5165 SHA-256\uFF1A",c.fingerprint)))}function ge(){let[n,l]=x(null),[m,i]=x([]),[s,t]=x(null),[c,r]=x("scope"),[v,o]=x(!1),[a,f]=x(!1),[C,b]=x(""),[S,P]=x(null),[F,A]=x(null),[O,T]=x(null),[J,$]=x(""),L=Q(),Z=Q(0),p=s?.case,g=async d=>{if(!a){f(!0),b("");try{return await d()}catch(h){b(h.message)}finally{f(!1)}}},j=async()=>i((await N("/cases")).cases);re(()=>{let d=!0;return Promise.all([N("/catalog"),N("/cases")]).then(([h,y])=>{d&&(l(h),i(y.cases))}).catch(h=>d&&b(h.message)),()=>{d=!1,Z.current++}},[]);let w=d=>{a||(t(h=>({...h,case:{...h.case,...d},stale:!0})),o(!0),$(""))},Y=d=>{t(d),o(!1),P(d.evaluation||null),A(d.review||null),T(null),$("")},U=async()=>{if(!v)return s;let d=await N(`/cases/${s.id}`,D({revision:s.revision,case:s.case},"PUT"));return t(d),o(!1),await j(),d},R=d=>g(async()=>{s&&v&&await U();let h=++Z.current,y=await N(`/cases/${d}`);h===Z.current&&(Y(y),r("scope"))}),W=()=>g(async()=>{s&&v&&await U(),Y(await N("/cases",D({}))),r("scope"),await j()}),ee=()=>g(async()=>{let d=await U(),h=await N(`/cases/${d.id}/evaluate`,D({revision:d.revision}));P(h),A(null),t({...d,latest_run:h.run_id,stale:!1}),$(""),r("results")}),se=d=>g(async()=>{if(!d.length)return;let h=await U(),y=new FormData;y.append("revision",h.revision),Array.from(d).forEach(_=>y.append("files",_));let k=await N(`/cases/${h.id}/documents`,{method:"POST",body:y});t({...k,stale:!0}),$(""),await j()}),ne=(d,h,y)=>{if(d==="case"){w({...le(h,n.unit_template),documents:p.documents}),r("scope");return}if(d==="units"){let k=new Set(p.units.map(_=>_.name));if(h.some(_=>k.has(_.name))||new Set(h.map(_=>_.name)).size!==h.length){b("\u5355\u5143\u540D\u79F0\u91CD\u590D\uFF0C\u8BF7\u5148\u6838\u5BF9\u8303\u56F4\u6216\u4FEE\u6539\u540D\u79F0\u3002\u73B0\u6709\u5355\u5143\u672A\u8986\u76D6\u3002");return}w({units:[...p.units,...h]})}else if(d==="history")w({history:h});else{let k=q(p.units);if(!k[y]){b("\u8BF7\u5148\u521B\u5EFA\u76EE\u6807\u8BC4\u4F30\u5355\u5143");return}d==="history_match"?k[y].external.history_match=h:k[y][d]=h,w({units:k})}T(null),b("")},B=v||s?.stale||!S;return e.createElement("div",{className:"sc-app"},e.createElement("aside",{className:"sc-sidebar"},e.createElement("div",null,e.createElement("h1",null,"\u5E93\u5BB9\u8BC4\u4F30"),e.createElement("span",{className:"sc-muted"},"UGSci \u5DE5\u7A0B\u5E94\u7528")),e.createElement("button",{className:"sc-primary",disabled:a||!n,onClick:W},"\u65B0\u5EFA\u8BC4\u4F30"),e.createElement("div",null,e.createElement("p",{className:"sc-muted"},"\u8BC4\u4F30\u9879\u76EE"),e.createElement("nav",{className:"sc-projects","aria-label":"\u8BC4\u4F30\u9879\u76EE"},m.map(d=>e.createElement("button",{key:d.id,disabled:a,"aria-current":s?.id===d.id?"page":void 0,onClick:()=>R(d.id)},e.createElement("strong",null,d.name),e.createElement("span",null,d.cycle||"\u5468\u671F\u5F85\u586B\u5199")))),!m.length&&e.createElement("p",{className:"sc-muted"},"\u5C1A\u65E0\u8BC4\u4F30\u9879\u76EE")),e.createElement("footer",null,"\u6309\u5355\u5143\u8BA1\u7B97\uFF0C\u6309\u5468\u671F\u7559\u5B58",e.createElement("br",null),"SY/T 7686-2023")),e.createElement("main",{className:"sc-main"},e.createElement("header",{className:"sc-header"},e.createElement("div",null,e.createElement("h2",null,p?.case_name||"\u5E93\u5BB9\u8BC4\u4F30\u5DE5\u4F5C\u53F0"),e.createElement("span",{className:"sc-muted"},s?`${p.cycle_id||"\u8BC4\u4F30\u5468\u671F\u5F85\u586B\u5199"}\u3000${a?"\u6B63\u5728\u5904\u7406\u2026":v?"\u6709\u672A\u4FDD\u5B58\u4FEE\u6539":"\u5DF2\u4FDD\u5B58"}`:"\u5EFA\u7ACB\u8BC4\u4F30\u9879\u76EE\uFF0C\u6574\u7406\u8D44\u6599\u5E76\u5F62\u6210\u62A5\u544A")),s&&e.createElement("div",{className:"sc-actions"},e.createElement("button",{disabled:a||!v,onClick:()=>g(U)},"\u4FDD\u5B58"),e.createElement("button",{className:"sc-primary",disabled:a,onClick:ee},"\u8FD0\u884C\u8BA1\u7B97"))),s&&e.createElement("nav",{className:"sc-tabs",role:"tablist","aria-label":"\u8BC4\u4F30\u6B65\u9AA4"},de.map(([d,h],y)=>e.createElement("button",{key:d,role:"tab","aria-selected":c===d,disabled:a,onClick:()=>r(d)},y+1,". ",h))),C&&e.createElement("div",{role:"alert",className:"sc-alert"},e.createElement("span",null,C),e.createElement("button",{className:"sc-link",onClick:()=>b("")},"\u5173\u95ED")),e.createElement("div",{className:"sc-body","aria-busy":a},n?s?e.createElement(e.Fragment,null,c==="scope"&&e.createElement(me,{data:p,edit:w,cat:n}),c==="data"&&e.createElement("section",null,e.createElement("div",{className:"sc-section"},e.createElement("div",{className:"sc-upload"},e.createElement("div",null,e.createElement("strong",null,"\u5BFC\u5165\u8BC4\u4F30\u8D44\u6599"),e.createElement("p",null,"Excel\u3001CSV\u3001JSON\u3001PPTX\u3001PDF\u3001Word\u3002\u4FDD\u7559\u539F\u4EF6\uFF0C\u9009\u62E9\u5B57\u6BB5\u540E\u5E94\u7528\u3002")),e.createElement("button",{disabled:a,onClick:()=>L.current.click()},"\u9009\u62E9\u6587\u4EF6"),e.createElement("input",{ref:L,type:"file",multiple:!0,accept:".xlsx,.csv,.tsv,.json,.pptx,.pdf,.docx,.txt,.md",hidden:!0,"aria-label":"\u4E0A\u4F20\u8BC4\u4F30\u8D44\u6599",onChange:d=>{se(d.target.files),d.target.value=""}})),e.createElement("div",{className:"sc-table-wrap"},e.createElement("table",{className:"sc-table"},e.createElement("tbody",null,p.documents.map(d=>e.createElement("tr",{key:d.id},e.createElement("td",null,d.name),e.createElement("td",null,d.tables.length," \u5F20\u8868 / ",d.pages.length," \u6BB5\u6587\u5B57"),e.createElement("td",null,d.status==="manual_review"?"\u5F85\u4EBA\u5DE5\u8BFB\u53D6":"\u5DF2\u8BFB\u53D6\uFF0C\u5F85\u6838\u5BF9"),e.createElement("td",null,e.createElement("button",{className:"sc-link",disabled:a,onClick:()=>g(async()=>T(await N(`/cases/${s.id}/documents/${d.id}`)))},"\u67E5\u770B\u4E0E\u6620\u5C04"))))))),O&&e.createElement(ce,{key:O.id,doc:O,cat:n,record:s,apply:ne,run:g})),e.createElement(ue,{data:p,edit:w}),e.createElement("details",null,e.createElement("summary",null,"\u591A\u5468\u671F\u6210\u679C"),e.createElement("p",{className:"sc-muted"},"\u53EF\u4ECE\u8868\u683C\u6620\u5C04\u5BFC\u5165\u6216\u586B\u5199\u5386\u53F2\u6210\u679C\uFF0C\u5355\u4F4D\u4E3A\u4EBFm\xB3\uFF1B\u51B2\u5CF0\u80FD\u529B\u4E3A\u4E07m\xB3/d\u3002\u5386\u53F2\u6210\u679C\u4E0D\u81EA\u52A8\u66FF\u4EE3\u672C\u6B21\u8BA1\u7B97\u3002"),e.createElement(M,{title:"\u5386\u53F2\u6307\u6807",columns:["cycle_id","book_inventory","effective_inventory","deliverable_swing","peak_rate","source"],rows:p.history||[],onChange:d=>w({history:d})}))),c==="methods"&&e.createElement(be,{data:p,edit:w,cat:n}),c==="results"&&e.createElement(e.Fragment,null,e.createElement(he,{evaluation:S,review:F,cat:n,stale:B,busy:a,onReview:()=>g(async()=>A(await N(`/cases/${s.id}/review`,D({revision:s.revision}))))}),e.createElement("details",null,e.createElement("summary",null,"\u5BF9\u6BD4\u6210\u679C\u4E0E\u9879\u76EE\u63D0\u793A\u9608\u503C"),e.createElement(u,{label:"\u504F\u5DEE\u63D0\u793A\u9608\u503C\uFF08%\uFF0C\u9879\u76EE\u8BBE\u7F6E\uFF0C\u975E\u884C\u4E1A\u6807\u51C6\uFF09",value:p.comparison_tolerance_percent,type:"number",onChange:d=>w({comparison_tolerance_percent:d})}),(p.benchmarks||[]).map((d,h)=>e.createElement("div",{className:"sc-unit",key:h},e.createElement("div",{className:"sc-grid"},[["metric","\u6307\u6807"],["value","\u62A5\u544A\uFF0F\u5176\u4ED6\u65B9\u6CD5\u503C"],["source","\u6210\u679C\u6765\u6E90"],["cycle_id","\u5468\u671F"],["state","\u72B6\u6001"]].map(([y,k])=>e.createElement(u,{key:y,label:k,type:y==="value"?"number":"text",value:d[y],options:y==="metric"?n.terms.filter(_=>["effective_inventory","geological_swing","deliverable_swing","capacity","working_gas","peak_rate"].includes(_.key)).map(_=>[_.key,_.name]):void 0,onChange:_=>w({benchmarks:p.benchmarks.map((X,ae)=>ae===h?{...X,[y]:_}:X)})}))),e.createElement("button",{className:"sc-link",onClick:()=>w({benchmarks:p.benchmarks.filter((y,k)=>k!==h)})},"\u79FB\u9664\u5BF9\u6BD4\u6210\u679C"))),e.createElement("button",{onClick:()=>w({benchmarks:[...p.benchmarks||[],{metric:"effective_inventory",value:null,source:"",cycle_id:p.cycle_id,state:p.start_state}]})},"\u6DFB\u52A0\u5BF9\u6BD4\u6210\u679C"))),c==="report"&&e.createElement("section",null,e.createElement("div",{className:"sc-section"},e.createElement("h3",null,"\u5E93\u5BB9\u8BC4\u4F30\u62A5\u544A"),e.createElement("p",{className:"sc-muted"},"\u62A5\u544A\u5305\u542B\u8303\u56F4\u3001\u6570\u636E\u6765\u6E90\u3001\u9002\u7528\u6761\u4EF6\u3001\u5206\u5355\u5143\u8BA1\u7B97\u3001\u4EA4\u53C9\u6821\u9A8C\u3001\u8D44\u6599\u7F3A\u9879\u4E0E\u590D\u6838\u72B6\u6001\u3002\u8D44\u6599\u4E0D\u9F50\u65F6\u5BFC\u51FA\u5E26\u7F3A\u9879\u7684\u9636\u6BB5\u62A5\u544A\u3002"),e.createElement(u,{label:"\u9879\u76EE\u590D\u6838\u610F\u89C1",type:"textarea",value:p.review_notes,onChange:d=>w({review_notes:d}),wide:!0}),e.createElement("p",{className:"sc-note"},B?"\u5C1A\u65E0\u5F53\u524D\u8F93\u5165\u7684\u8BA1\u7B97\u7ED3\u679C\u3002\u8BF7\u4FDD\u5B58\u5E76\u91CD\u65B0\u8BA1\u7B97\u3002":"\u5F53\u524D\u62A5\u544A\u7ED1\u5B9A\u672C\u6B21\u8BA1\u7B97\u5FEB\u7167\uFF1B\u66F4\u6539\u8F93\u5165\u540E\u9700\u91CD\u65B0\u8BA1\u7B97\u3002"),e.createElement("div",{className:"sc-actions"},e.createElement("button",{disabled:a||B,onClick:()=>g(async()=>$(await(await N(`/cases/${s.id}/report?format=html`,void 0,!0)).text()))},"\u9884\u89C8\u62A5\u544A"),[["docx","\u5BFC\u51FA Word"],["html","\u5BFC\u51FA\u6253\u5370\u7248"],["zip","\u4E0B\u8F7D\u590D\u7B97\u5305"],["json","\u5BFC\u51FA\u8BA1\u7B97\u8BB0\u5F55"]].map(([d,h])=>e.createElement("button",{key:d,disabled:a||B,onClick:()=>g(()=>G(`/cases/${s.id}/report?format=${d}`,`${p.case_name}-\u5E93\u5BB9\u8BC4\u4F30\u62A5\u544A.${d}`))},h)))),J&&e.createElement("iframe",{title:"\u5E93\u5BB9\u8BC4\u4F30\u62A5\u544A\u9884\u89C8",className:"sc-report-preview",sandbox:"",srcDoc:J}))):e.createElement("div",{className:"sc-empty"},e.createElement("h2",null,"\u4ECE\u4E00\u4EFD\u8BC4\u4F30\u9879\u76EE\u5F00\u59CB"),e.createElement("p",null,"\u6309\u50A8\u6C14\u5E93\u7C7B\u578B\u4E0E\u8D44\u6599\u6761\u4EF6\u9009\u62E9\u65B9\u6CD5\u3002\u652F\u6301 Excel\u3001CSV\u3001\u62A5\u544A\u53CA\u5916\u90E8\u6A21\u62DF\u6210\u679C\uFF0C\u4FDD\u7559\u8F93\u5165\u4F9D\u636E\u548C\u8BA1\u7B97\u8FC7\u7A0B\uFF0C\u751F\u6210\u53EF\u590D\u6838\u7684\u5E93\u5BB9\u8BC4\u4F30\u62A5\u544A\u3002"),e.createElement("button",{className:"sc-primary",onClick:W,disabled:a},"\u65B0\u5EFA\u8BC4\u4F30")):e.createElement("p",{className:"sc-muted"},"\u6B63\u5728\u8BFB\u53D6\u5DE5\u4F5C\u53F0\u2026"))))}function ve(){let n=I.host.useSelectedAgent?.();return e.createElement(ge,{key:n?.id||"default"})}I.registerRoutes("storage-capacity",[{path:"/apps/storage-capacity",component:ve,label:"\u5E93\u5BB9\u8BC4\u4F30\u5DE5\u4F5C\u53F0",icon:"SC"}]);})();
