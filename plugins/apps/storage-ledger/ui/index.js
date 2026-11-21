(()=>{var Fe=`.sl-app {
  --sl-accent: #177b6b;
  --sl-rule: var(--app-border-color, #cedbd6);
  color: var(--app-text-color, inherit);
  background: var(--app-bg-color, transparent);
  height: 100%;
  min-height: 0;
  overflow: auto;
  padding: clamp(16px, 3vw, 44px);
  box-sizing: border-box;
  font-family: inherit;
  font-size: 14px;
}
.sl-app * {
  box-sizing: border-box;
}
.sl-app h1 {
  font-size: clamp(23px, 3vw, 34px);
  font-weight: 650;
  letter-spacing: -0.04em;
  margin: 0 0 6px;
}
.sl-head,
.sl-section,
.sl-figure footer,
.sl-figure figcaption {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.sl-app small,
.sl-app p,
.sl-app figcaption span,
.sl-figure footer {
  font-size: 13px;
  opacity: 0.78;
}
.sl-app nav {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--sl-rule);
  margin: 24px 0 16px;
}
.sl-app button,
.sl-app input,
.sl-app select {
  font: inherit;
  color: inherit;
}
.sl-app input:not([type="radio"]),
.sl-app select,
.sl-app button {
  border: 1px solid var(--sl-rule);
  background: var(--app-card-bg, transparent);
  border-radius: 5px;
  padding: 6px 10px;
}
.sl-app select {
  max-width: 100%;
}
.sl-app option {
  color: CanvasText;
  background: Canvas;
}
.sl-app button {
  cursor: pointer;
}
.sl-app button:disabled {
  cursor: default;
  opacity: 0.55;
}
.sl-app button.sl-primary {
  background: var(--sl-accent);
  border-color: var(--sl-accent);
  color: white;
  font-weight: 600;
}
.sl-app nav button {
  background: none;
  border: 0;
  border-radius: 0;
  padding: 9px 0;
  border-bottom: 3px solid transparent;
}
.sl-app nav button[aria-current="page"] {
  color: var(--sl-accent);
  border-color: currentColor;
  font-weight: 650;
}
.sl-controls {
  display: flex;
  gap: 12px 24px;
  flex-wrap: wrap;
}
.sl-app label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
}
.sl-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));
  gap: 1px;
  border: 1px solid var(--sl-rule);
  margin: 20px 0;
  border-radius: 7px;
  overflow: hidden;
}
.sl-metrics article {
  padding: 15px;
  border-left: 2px solid var(--sl-rule);
}
.sl-metrics article:first-child {
  border-color: var(--sl-accent);
}
.sl-metrics article span {
  font-size: 13px;
}
.sl-metrics article div {
  font-variant-numeric: tabular-nums;
  font-size: 24px;
  margin-top: 5px;
}
.sl-figure {
  margin: 18px 0 20px;
  border: 1px solid var(--sl-rule);
  border-radius: 7px;
  padding: 14px 18px;
}
.sl-figure svg {
  width: 100%;
  height: 95px;
  margin: 12px 0 2px;
}
.sl-figure i {
  display: inline-block;
  width: 8px;
  height: 8px;
  background: #198576;
  border-radius: 2px;
  margin-right: 4px;
}
.sl-figure i + i {
  background: #bd753c;
}
.sl-app h2 {
  font-size: 18px;
  margin: 20px 0 12px;
}
.sl-app h3 {
  font-size: 15px;
}
.sl-table {
  overflow: auto;
  max-height: 350px;
  border: 1px solid var(--sl-rule);
  border-radius: 6px;
}
.sl-table table {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  font-variant-numeric: tabular-nums;
  font-size: 13px;
  white-space: nowrap;
}
.sl-table th,
.sl-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid var(--sl-rule);
}
.sl-table th {
  background: var(--app-card-bg, Canvas);
  color: var(--app-text-color, CanvasText);
  position: sticky;
  top: 0;
}
.sl-table p,
.sl-empty {
  padding: 16px;
}
.sl-app .sl-link {
  padding: 0;
  border: none;
  color: var(--sl-accent);
  text-decoration: underline;
  background: transparent;
}
.sl-review,
.sl-alert,
.sl-empty {
  margin: 16px 0;
  padding: 14px;
  border-left: 3px solid var(--sl-accent);
  background: rgba(80, 145, 125, 0.09);
}
.sl-review .sl-table {
  margin: 10px 0;
}
.sl-alert {
  border-color: #b05b32;
}
.sl-section {
  margin-top: 15px;
}
.sl-section h2 {
  margin: 10px 0;
}

.sl-library {
  max-width: 1500px;
  margin: auto;
}
.sl-library .sl-head {
  padding-bottom: 20px;
  border-bottom: 1px solid var(--sl-rule);
}
.sl-actions,
.sl-project footer,
.sl-pager,
.sl-attachment {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
}
.sl-library-filter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 22px 0;
}
.sl-library-filter nav {
  margin: 0;
}
.sl-library-filter input {
  min-width: min(250px, 45%);
}
.sl-project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 330px), 1fr));
  gap: 16px;
}
.sl-project {
  padding: 20px 22px;
  border: 1px solid var(--sl-rule);
  border-radius: 9px;
  border-top: 4px solid var(--sl-accent);
  background: var(--app-card-bg, transparent);
}
.sl-project .sl-section {
  margin: 0;
}
.sl-project .sl-section h2 {
  margin: 0;
}
.sl-project .sl-title,
.sl-app button.sl-back {
  border: none;
  padding: 0;
  background: none;
}
.sl-project .sl-title {
  font-size: 21px;
  font-weight: 650;
}
.sl-project-count {
  display: flex;
  gap: 22px;
  padding: 22px 0;
  font-size: 13px;
}
.sl-project-count strong {
  font-size: 21px;
  font-variant-numeric: tabular-nums;
}
.sl-project footer {
  border-top: 1px solid var(--sl-rule);
  padding-top: 14px;
}
.sl-app button.sl-back {
  color: var(--sl-accent);
  margin-bottom: 12px;
}
.sl-form {
  padding: 18px;
  margin: 14px 0;
  background: rgba(65, 135, 117, 0.06);
  border: 1px solid var(--sl-rule);
  border-radius: 7px;
}
.sl-form h2,
.sl-form h3 {
  margin: 0 0 14px;
}
.sl-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 15px;
}
.sl-app .sl-fields label {
  display: grid;
  gap: 5px;
}
.sl-fields input {
  width: 100%;
  min-width: 0;
}
.sl-form .sl-actions {
  margin-top: 12px;
}
.sl-pager {
  justify-content: flex-end;
  padding: 12px;
}
.sl-log article {
  border-left: 2px solid var(--sl-accent);
  padding: 8px 15px;
  margin: 12px 0;
}
.sl-records .sl-table {
  max-height: 55vh;
}
.sl-project p {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
@media (max-width: 680px) {
  .sl-head,
  .sl-library-filter,
  .sl-section {
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .sl-app nav {
    gap: 12px;
  }
  .sl-app .sl-controls label {
    flex-wrap: wrap;
  }
}
.sl-well-trends {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 1fr));
  gap: 12px;
}
.sl-well-trends figure {
  margin: 0 0 12px;
}
`;var Ie=`.sl-app.se-studio,
.sl-library {
  --sl-accent: #126f72;
  --sl-rule: #d2dde1;
  --se-ink: #203944;
  --se-muted: #546c78;
  --se-pale: #f2f6f7;
  --se-panel: #f7f9fa;
  color: #203944;
  background: #fff;
  font-family: Inter, "Microsoft YaHei", "PingFang SC", sans-serif;
  font-size: 13px;
  color-scheme: light;
}
.sl-app.se-studio {
  height: 100%;
  min-height: min(540px, 80vh);
  width: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  isolation: isolate;
  container: reservoir / inline-size;
}
.sl-app.se-focus {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  width: 100vw;
  height: 100dvh;
}
.se-studio [hidden] {
  display: none !important;
}
.se-studio h2,
.se-studio h3,
.se-studio h4,
.sl-library h1 {
  color: var(--se-ink);
}
.se-studio h3 {
  font-size: 15px;
  margin: 15px 0 9px;
  font-weight: 650;
}
.se-studio h2 {
  font-size: 20px;
  font-weight: 670;
}
.se-studio h2 small,
.se-studio h3 small {
  font-size: 12px;
  font-weight: 450;
  color: #647a83;
}
.se-studio p,
.sl-library p,
.se-studio small {
  color: var(--se-muted);
}
.se-studio button,
.se-studio input,
.se-studio select,
.sl-library button,
.sl-library input {
  font: inherit;
  background: #fff;
  color: #263e49;
  border-color: #c6d3d8;
  border-radius: 4px;
}
.se-studio button:not(:disabled):hover,
.sl-library button:not(:disabled):hover {
  background: #e6f1f0;
  color: #126567;
}
.se-studio button:focus-visible,
.se-studio input:focus-visible,
.se-studio select:focus-visible,
.se-studio [role="button"]:focus-visible {
  outline: 2px solid #007c86;
  outline-offset: -2px;
}
.se-studio button.sl-primary,
.sl-library button.sl-primary {
  color: white;
  background: var(--sl-accent);
}
.se-studio .sl-link,
.sl-library .sl-title {
  border: 0;
  background: transparent;
  color: #135f70;
  padding: 2px 1px;
  text-align: left;
}
.se-icon {
  width: 16px;
  height: 16px;
  flex: none;
  vertical-align: -3px;
}
.se-titlebar,
.se-ribbon,
.se-command-group,
.se-title-actions,
.se-tools,
.se-subtabs,
.se-section-head,
.se-dock-title,
.se-canvas-tools,
.se-legend,
.se-status,
.se-series-legend,
.se-readout,
.se-pager {
  display: flex;
  align-items: center;
}
.se-titlebar {
  min-height: 52px;
  flex: none;
  background: #18373e;
  color: white;
  padding: 7px 14px;
  gap: 10px;
}
.se-appmark {
  width: 34px;
  height: 34px;
  border: 1px solid #7bb5b0;
  border-radius: 6px;
  background: #23494d;
  display: grid;
  place-items: center;
}
.se-appmark .se-icon {
  width: 24px;
  height: 24px;
  color: #9de1d6;
}
.se-titlebar .se-titletext {
  min-width: 0;
}
.se-titlebar small {
  display: block;
  color: #bed3d4;
  font-size: 10px;
  letter-spacing: 0.13em;
  line-height: 1.4;
}
.se-titlebar h1 {
  color: #fff;
  font-size: 17px;
  letter-spacing: 0.01em;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.45;
}
.se-title-actions {
  gap: 6px;
  margin-left: auto;
  flex: none;
}
.se-title-actions button {
  color: #eff9f8;
  background: #264b50;
  border: 1px solid #4e7074;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 5px;
  min-height: 28px;
  padding: 3px 9px;
}
.se-titlebar button:hover {
  color: white !important;
  background: #365e63 !important;
}
.se-ribbon {
  background: #fafcfc;
  min-height: 42px;
  border-bottom: 1px solid #bacace;
  padding: 3px 8px;
  gap: 6px;
  flex: none;
  overflow-x: auto;
}
.se-command-group {
  flex: none;
  gap: 2px;
  padding-right: 7px;
  border-right: 1px solid #d8e1e3;
}
.se-command-group button,
.se-canvas-tools button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: transparent;
  border: 1px solid transparent;
  padding: 5px 7px;
  font-size: 12px;
  white-space: nowrap;
}
.se-command-group button.selected,
.se-subtabs button[aria-pressed="true"],
.se-dock-tools button[aria-pressed="true"] {
  background: #e1efee;
  border-color: #b6d3d1;
  color: #075e63;
}
.se-command-group button.se-import {
  border-color: #cbd8d9;
  background: white;
}
.se-dock-tools {
  margin-left: auto;
  border: 0;
  padding-right: 0;
}
.se-dock-tools button {
  padding: 5px;
}
.se-workarea {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  overflow: hidden;
  min-height: 0;
  flex: 1;
  background: white;
  --se-tree-width: clamp(165px, 15cqw, 225px);
  --se-prop-width: clamp(205px, 17cqw, 270px);
}
.se-workarea.has-tree {
  grid-template-columns: var(--se-tree-width) minmax(0, 1fr);
}
.se-workarea.has-props {
  grid-template-columns: minmax(0, 1fr) var(--se-prop-width);
}
.se-workarea.has-tree.has-props {
  grid-template-columns: var(--se-tree-width) minmax(0, 1fr) var(
      --se-prop-width
    );
}
.se-explorer,
.se-inspector {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--se-panel);
}
.se-explorer {
  border-right: 1px solid #c7d5d8;
}
.se-inspector {
  border-left: 1px solid #c7d5d8;
}
.se-dock-title {
  height: 35px;
  flex: none;
  gap: 7px;
  padding: 0 12px;
  border-bottom: 1px solid #d6e0e3;
  color: #334f5b;
  background: #edf2f3;
  font-size: 12px;
}
.se-dock-title .se-icon {
  width: 14px;
  height: 14px;
}
.se-dock-title button.se-x {
  margin-left: auto;
  border: 0;
  background: transparent;
  padding: 0 3px;
  font-size: 18px;
  line-height: 1;
}
.se-search {
  margin: 10px 8px 6px;
  border: 1px solid #cad7da;
  border-radius: 4px;
  background: white;
  display: flex !important;
  padding: 0 6px;
  gap: 4px !important;
}
.se-search .se-icon {
  width: 13px;
  color: #627782;
}
.se-search input {
  width: 100%;
  min-width: 0;
  border: 0;
  padding: 5px 0;
  font-size: 12px;
  background: none;
}
.se-tree,
.se-prop-body {
  overflow: auto;
  min-height: 0;
  scrollbar-width: thin;
  flex: 1;
}
.se-tree {
  padding: 3px 5px 12px;
}
.se-tree p {
  padding: 5px;
}
.se-tree-root,
.se-tree button {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 27px;
  color: #344f5a;
}
.se-tree-root {
  font-size: 12px;
  font-weight: 650;
  padding: 0 5px;
}
.se-tree-root .se-icon {
  color: #297671;
}
.se-tree button {
  width: 100%;
  border: 0;
  background: transparent;
  text-align: left;
  border-radius: 3px;
  padding: 2px 5px;
}
.se-tree button.se-branch {
  font-size: 12px;
  font-weight: 650;
}
.se-branch > span:first-child {
  width: 9px;
  color: #748b93;
}
.se-tree em {
  font-size: 10px;
  color: #536c76;
  margin-left: auto;
  font-style: normal;
  font-variant-numeric: tabular-nums;
}
.se-leaves {
  margin-left: 11px;
  padding-left: 7px;
  border-left: 1px solid #d5dfe1;
}
.se-leaves button {
  font-size: 12px;
}
.se-leaves button .se-icon {
  width: 13px;
  height: 13px;
  color: #69838a;
}
.se-leaves button span {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.se-leaves em {
  color: #8f5623;
  background: #f4e8d8;
  min-width: 17px;
  text-align: center;
  border-radius: 3px;
}
.se-tree button.current {
  background: #d7eae7;
  color: #065f60;
  font-weight: 650;
}
.se-editor {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.se-tabbar {
  display: flex;
  align-items: stretch;
  background: #e9eff0;
  border-bottom: 1px solid #c5d3d6;
  min-height: 35px;
  flex: none;
  overflow: auto;
  scrollbar-width: thin;
}
.se-tabbar > span {
  display: flex;
  align-items: stretch;
  flex: none;
  border-right: 1px solid #c8d5d7;
  border-top: 2px solid transparent;
}
.se-tabbar > span.active {
  background: white;
  border-top-color: #147c7a;
}
.se-tabbar button {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  background: transparent;
  border: 0;
  border-radius: 0;
  padding: 4px 10px;
}
.se-tabbar .active button[role="tab"] {
  color: #105e62;
  font-weight: 650;
}
.se-tabbar button.se-close {
  font-size: 14px;
  padding: 2px 6px 2px 1px;
  color: #687c84;
}
.se-document {
  overflow: auto;
  flex: 1;
  min-height: 0;
  scrollbar-width: thin;
  background: white;
  overscroll-behavior: contain;
}
.se-paper,
.se-mapdoc {
  padding: 16px clamp(12px, 1.6cqw, 27px) 22px;
  min-width: 0;
}
.se-doc-head,
.se-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 9px;
}
.se-doc-head {
  padding-bottom: 13px;
}
.se-doc-head h2 {
  font-size: 22px;
  line-height: 1.3;
  margin: 2px 0 0;
  letter-spacing: -0.025em;
}
.se-doc-head small,
.se-prop-body > small {
  font-size: 10px;
  letter-spacing: 0.1em;
}
.se-meta {
  font-size: 12px;
  color: #55717c;
  font-variant-numeric: tabular-nums;
}
.se-canvas-tools {
  border: 1px solid #cbdadc;
  background: #f1f6f6;
  justify-content: space-between;
  padding: 3px 9px;
  gap: 5px;
  flex-wrap: wrap;
  border-radius: 4px 4px 0 0;
  font-size: 12px;
}
.se-canvas-tools > span {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;
  color: #365c64;
}
.se-tools {
  gap: 6px;
  flex-wrap: wrap;
}
.se-tools label {
  gap: 3px;
  font-size: 12px;
}
.se-tools input[type="checkbox"] {
  accent-color: #16736e;
  width: 13px;
  height: 13px;
}
.se-canvas-tools button {
  background: #fff;
  border-color: #cbd9db;
  padding: 1px 7px;
  min-height: 23px;
}
.se-map-plane {
  background: #f8fbfb;
  border: 1px solid #cbdadc;
  border-top: 0;
  display: grid;
  align-items: center;
}
.se-map-plane > svg {
  width: 100%;
  height: clamp(255px, 37vh, 500px);
  display: block;
  touch-action: none;
  cursor: grab;
  user-select: none;
}
.se-map-plane > svg:active {
  cursor: grabbing;
}
.se-plot-bg {
  fill: #f4f9f9;
  stroke: #bdced1;
  stroke-width: 1;
}
.se-grid {
  stroke: #cddcde;
  stroke-width: 0.8;
}
.se-axis,
.se-casing-scroll svg text {
  font:
    11px "Consolas",
    "SFMono-Regular",
    monospace;
  fill: #4d6873;
}
.se-point-label {
  font:
    11px "Consolas",
    "Microsoft YaHei",
    sans-serif;
  fill: #294852;
  paint-order: stroke;
  stroke: #f5fafa;
  stroke-width: 3;
  stroke-linejoin: round;
}
.se-wellpoint {
  cursor: pointer;
}
.se-wellpoint.selected .se-point-label,
.se-wellpoint:hover .se-point-label {
  font-weight: bold;
  fill: #183e7b;
}
.se-legend,
.se-series-legend {
  gap: 8px 17px;
  flex-wrap: wrap;
  font-size: 11px;
  color: #52707a;
}
.se-legend {
  padding: 8px 9px;
  border: 1px solid #cbdadc;
  border-top: 0;
  border-radius: 0 0 4px 4px;
  background: #fcfdfd;
}
.se-legend span,
.se-series-legend span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.se-legend i {
  width: 9px;
  height: 9px;
  border: 1.6px solid #647a8c;
  border-radius: 50%;
  display: inline-block;
}
.se-legend i.producing {
  background: #087366;
  border-color: #065d52;
}
.se-legend i.flagged {
  border-color: #b66a24;
  box-shadow: inset 0 0 0 2px white;
  background: #087366;
}
.se-legend .se-muted {
  margin-left: auto;
  font-family: Consolas, monospace;
  color: #677e86;
}
.se-map-index {
  margin-top: 12px;
}
.se-section-head h3 {
  margin: 6px 0;
}
.se-section-head {
  margin: 7px 0;
}
.se-well-strip,
.se-stations,
.se-subtabs {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}
.se-well-strip button,
.se-stations button {
  display: flex;
  align-items: center;
  gap: 6px;
  border-color: #cedbde;
  border-radius: 4px;
  padding: 4px 7px;
  font-size: 12px;
}
.se-well-strip button b {
  color: #8c5426;
  font-size: 10px;
  background: #f6ecdf;
  padding: 0 4px;
  border-radius: 2px;
}
.se-no-map,
.se-loading {
  text-align: center;
  padding: 35px 15px;
  background: #f6f9f9;
}
.se-no-map > .se-icon {
  width: 30px;
  height: 30px;
  color: #4d8886;
}
.se-no-map h3 {
  margin-top: 8px;
}
.se-prop-body {
  padding: 13px 12px;
}
.se-prop-body h3 {
  font-size: 17px;
  margin: 2px 0 12px;
  overflow-wrap: anywhere;
}
.se-prop-body h4 {
  font-size: 12px;
  color: #345762;
  margin: 16px 0 7px;
  border-bottom: 1px solid #d6e1e3;
  padding-bottom: 5px;
}
.se-properties {
  display: grid;
  grid-template-columns: minmax(58px, 0.72fr) minmax(80px, 1.28fr);
  gap: 0;
  margin: 0 0 10px;
  font-size: 12px;
}
.se-properties dt,
.se-properties dd {
  margin: 0;
  padding: 5px 0;
  border-bottom: 1px solid #e2e9eb;
  overflow-wrap: anywhere;
}
.se-properties dt {
  color: #607680;
}
.se-properties dd {
  font-variant-numeric: tabular-nums;
  white-space: pre-wrap;
}
.se-prop-actions {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}
.se-prop-body button {
  font-size: 12px;
  overflow-wrap: anywhere;
}
.se-prop-body p {
  font-size: 12px;
}
.se-prop-body .sl-link {
  text-align: left;
}
.se-status {
  gap: 15px;
  padding: 3px 11px;
  background: #e8f1f1;
  border-top: 1px solid #c2d4d5;
  font-size: 11px;
  min-height: 27px;
  flex: none;
  white-space: nowrap;
}
.se-status strong {
  display: flex;
  gap: 5px;
  align-items: center;
  color: #295f5e;
  font-weight: 550;
}
.se-status strong i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #288777;
}
.se-status label {
  min-width: 0;
  gap: 4px;
}
.se-status select {
  font-size: 11px;
  border: 0;
  background: transparent;
  max-width: min(45vw, 350px);
  padding: 1px 0;
  text-overflow: ellipsis;
}
.se-status > span {
  margin-left: auto;
  color: #795127;
}
.se-notice {
  display: flex;
  align-items: center;
  gap: 7px;
  justify-content: space-between;
  padding: 3px 11px;
  margin: 0;
  font-size: 12px;
  background: #eff7f4;
}
.se-notice button {
  padding: 0 6px;
}
.se-studio .sl-alert {
  background: #fff1e6;
  color: #7f4226;
}
.se-studio .sl-table {
  max-width: 100%;
  border-radius: 3px;
}
.se-studio table {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: #233e49;
}
.se-studio th {
  background: #edf3f4;
  position: sticky;
  top: 0;
  z-index: 1;
  color: #48626c;
}
.se-studio td,
.se-studio th {
  padding: 6px 9px;
  border-color: #dce5e8;
}
.se-studio tbody tr:nth-child(even) {
  background: #fafcfc;
}
.se-studio .sl-review {
  border-color: #e0c8a7;
  background: #fffaf2;
}
.se-studio .sl-form,
.se-studio .sl-metrics,
.se-studio .sl-figure {
  border-color: #cedbdf;
  background: #f8fbfb;
}
.se-studio .sl-form input,
.se-studio .sl-controls input,
.se-studio .sl-controls select {
  background: #fff;
}
.se-subtabs {
  border-bottom: 1px solid #cedbdd;
  padding-bottom: 7px;
  margin-bottom: 11px;
}
.se-subtabs button {
  font-size: 12px;
  padding: 4px 9px;
}
.se-filter-grid {
  display: flex;
  align-items: center;
  gap: 8px 13px;
  flex-wrap: wrap;
  margin: 10px 0;
}
.se-filter-grid label {
  font-size: 12px;
  color: #47626c;
  gap: 5px;
}
.se-filter-grid select,
.se-filter-grid input {
  font-size: 12px;
  padding: 3px 5px;
}
.se-curve {
  border: 1px solid #cfddde;
  border-radius: 4px;
  background: #fcfdfd;
  margin: 8px 0 12px;
}
.se-curve svg {
  display: block;
  width: 100%;
  height: auto;
  min-height: 155px;
  max-height: 330px;
  cursor: crosshair;
}
.se-series-legend {
  padding: 8px 12px;
}
.se-series-legend i {
  width: 15px;
  height: 3px;
}
.se-readout {
  border-top: 1px solid #d7e2e3;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 11px;
  min-height: 30px;
  background: #f0f5f5;
  padding: 5px 9px;
  font-variant-numeric: tabular-nums;
}
.se-readout span {
  border-left: 2px solid #bfcccf;
  padding-left: 4px;
}
.se-picked {
  background: #f3f7fa;
  padding: 5px 8px;
}
.se-pager {
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}
.se-warning {
  color: #85501e !important;
  background: #fff7e9 !important;
}
.se-casing-scroll {
  overflow: auto;
  border: 1px solid #d1dfe0;
  background: #f8fbfb;
  margin-bottom: 10px;
}
.se-casing-scroll svg {
  width: 100%;
  min-width: 450px;
  max-height: 320px;
}
.se-casing-scroll [role="button"] {
  cursor: pointer;
}
.se-stations button {
  padding: 8px 10px;
  background: #f5f9f9;
}
.se-stations small {
  display: block;
  font-size: 11px;
}
.se-stations button span {
  text-align: left;
}
.se-pipeline {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f7f7;
  border: 1px solid #d0dedf;
  padding: 23px 10px;
  margin: 5px 0 12px;
  gap: 9px;
}
.se-pipeline > div {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 3px;
}
.se-pipeline .se-icon {
  width: 24px;
  height: 24px;
  color: #286d72;
}
.se-pipeline .se-pipe-span {
  min-width: 95px;
  width: 38%;
  text-align: center;
  font-size: 11px;
  color: #537079;
}
.se-pipe-span hr {
  width: 100%;
  border: 2px solid #367a81;
  margin: 3px 0;
}
.sl-library {
  padding: 0;
  min-height: 100%;
  background: #f3f6f7;
}
.sl-library .sl-head {
  background: #18373e;
  padding: 20px clamp(18px, 3vw, 48px);
  color: white;
}
.sl-library .sl-head h1 {
  color: white;
  font-size: 24px;
  margin: 0;
}
.sl-library .sl-head p {
  color: #c5d9d9;
  margin: 4px 0 0;
  font-size: 12px;
}
.sl-library .sl-library-filter,
.sl-library .sl-form,
.sl-library .sl-alert,
.sl-library > p,
.se-library-grid {
  margin: 16px clamp(12px, 2.5vw, 40px);
}
.sl-library .sl-library-filter {
  padding: 0;
  gap: 8px;
}
.se-library-grid {
  overflow: auto;
  border: 1px solid #cad8db;
  border-radius: 5px;
  background: white;
}
.se-library-grid table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.se-library-grid th {
  text-align: left;
  background: #e6eeef;
  color: #49636c;
  font-size: 12px;
}
.se-library-grid th,
.se-library-grid td {
  padding: 11px 13px;
  border-bottom: 1px solid #d9e3e5;
}
.se-library-grid td small {
  display: block;
  color: #5e737b;
  max-width: 28em;
}
.se-library-grid .sl-actions {
  gap: 4px;
}
.se-library-grid button {
  white-space: nowrap;
  font-size: 12px;
}
@container reservoir (max-width:959px) {
  .se-workarea.has-props {
    grid-template-columns: minmax(0, 1fr);
  }
  .se-workarea.has-tree.has-props {
    grid-template-columns: var(--se-tree-width) minmax(0, 1fr);
  }
  .se-inspector {
    position: absolute;
    inset: 0 0 0 auto;
    width: min(270px, 83%);
    z-index: 3;
    box-shadow: -6px 0 16px #18373e21;
  }
  .se-titlebar {
    min-height: 45px;
  }
}
@container reservoir (max-width:679px) {
  .se-workarea.has-tree,
  .se-workarea.has-tree.has-props {
    grid-template-columns: minmax(0, 1fr);
  }
  .se-explorer {
    position: absolute;
    inset: 0 auto 0 0;
    width: min(220px, 80%);
    z-index: 3;
    box-shadow: 6px 0 16px #18373e21;
  }
  .se-dock-tools {
    order: -1;
    margin: 0;
    border-right: 1px solid #d4dfe1;
  }
  .se-paper,
  .se-mapdoc {
    padding: 10px;
  }
  .se-doc-head h2 {
    font-size: 18px;
  }
  .se-doc-head {
    flex-wrap: wrap;
  }
  .se-canvas-tools > span {
    display: none;
  }
  .se-map-plane > svg {
    height: auto;
    min-height: 190px;
  }
  .se-titlebar h1 {
    font-size: 15px;
  }
  .se-status {
    gap: 6px;
  }
  .se-status select {
    max-width: 31vw;
  }
}

/* The PawApp frame places its own window controls in the upper right. */
.se-titlebar,
.sl-library .sl-head {
  padding-right: 104px;
}
.se-index-tabs {
  display: flex;
  align-items: center;
  gap: 3px;
}
.se-index-tabs button {
  border: 0;
  border-bottom: 2px solid transparent;
  border-radius: 0;
  background: transparent;
  font-weight: 600;
}
.se-index-tabs button[aria-pressed="true"] {
  border-color: #147b75;
  color: #145e61;
}
.se-index-tabs small {
  font-variant-numeric: tabular-nums;
  color: #547079;
  margin-left: 3px;
}
.se-map-index .se-tools {
  font-size: 11px;
  color: #536c77;
  font-variant-numeric: tabular-nums;
}
.se-map-index .se-tools button {
  padding: 1px 7px;
  line-height: 1.4;
}
.se-map-index .sl-table th,
.se-map-index .sl-table td {
  padding: 4px 9px;
}
@media (max-width: 650px) {
  .sl-library .sl-head {
    align-items: flex-start;
    flex-direction: column;
  }
  .sl-library .sl-head .sl-actions {
    flex-wrap: wrap;
  }
}
`;var j=window.QwenPaw.host.React,{useEffect:os,useState:me}=j;async function Se(e,i){let l=URL.createObjectURL(await e.blob()),m=document.createElement("a");m.href=l,m.download=i,m.click(),setTimeout(()=>URL.revokeObjectURL(l),1e3)}function fe(e,i){return{method:e,headers:{"Content-Type":"application/json"},body:JSON.stringify(i)}}var is={name:"",operator:"",region:"",description:""};function Ae({api:e,open:i,css:l,initialId:m}){let[_,g]=me([]),[o,s]=me(null),[S,P]=me(""),[d,C]=me(!1),[b,D]=me(!1),[L,E]=me(""),[w,V]=me(!1),[z,A]=me(0),[Y,G]=me(""),H=j.useRef(null);os(()=>{let t=!0;return e("/projects").then(N=>N.json()).then(N=>{if(t){let M=m&&N.find(Q=>Q.id===m);if(M){i(M);return}g(N),D(!0)}}).catch(N=>{t&&P(N.message)}),()=>{t=!1}},[z]);async function f(t){C(!0),P(""),G("");try{await t(),A(N=>N+1)}catch(N){P(N.message)}finally{C(!1)}}async function F(t){t.preventDefault(),await f(async()=>{let M=await(await e(o.id?"/projects/"+o.id:"/projects",fe(o.id?"PATCH":"POST",o))).json();s(null),o.id?G("\u5DF2\u4FDD\u5B58\u9879\u76EE\u8D44\u6599"):i(M)})}let X=_.filter(t=>!!t.archived===w&&[t.name,t.region,t.operator].join(" ").toLowerCase().includes(L.trim().toLowerCase()));return j.createElement("main",{className:"sl-app sl-library"},j.createElement("style",null,l),j.createElement("header",{className:"sl-head"},j.createElement("div",null,j.createElement("h1",null,"\u50A8\u6C14\u5E93\u6570\u636E\u7BA1\u7406"),j.createElement("p",null,"\u9879\u76EE\u5E93")),j.createElement("div",{className:"sl-actions"},j.createElement("button",{disabled:d,onClick:()=>H.current.click()},"\u4ECE\u5907\u4EFD\u6062\u590D"),j.createElement("button",{className:"sl-primary",disabled:d,onClick:()=>s({...is})},"\uFF0B \u65B0\u5EFA\u9879\u76EE"))),j.createElement("input",{ref:H,type:"file",accept:".ugsdb",hidden:!0,"aria-label":"\u9009\u62E9\u9879\u76EE\u5907\u4EFD",onChange:t=>{let N=t.target.files[0];t.target.value="",N&&f(async()=>{let M=new FormData;M.append("file",N);let Q=await(await e("/projects/restore",{method:"POST",body:M})).json();i(Q)})}}),S&&j.createElement("p",{className:"sl-alert",role:"alert"},S," ",j.createElement("button",{onClick:()=>A(t=>t+1)},"\u5237\u65B0")),Y&&j.createElement("p",{role:"status"},Y),o&&j.createElement("form",{className:"sl-form",onSubmit:F},j.createElement("h2",null,o.id?"\u9879\u76EE\u8D44\u6599":"\u65B0\u5EFA\u50A8\u6C14\u5E93\u9879\u76EE"),j.createElement("div",{className:"sl-fields"},[["name","\u9879\u76EE\u540D\u79F0"],["operator","\u8FD0\u8425\u5355\u4F4D"],["region","\u6240\u5728\u5730\u533A"],["description","\u9879\u76EE\u8BF4\u660E"]].map(([t,N])=>j.createElement("label",{key:t},N,j.createElement("input",{autoFocus:t==="name",required:t==="name",maxLength:t==="description"?1600:t==="name"?100:120,value:o[t],onChange:M=>s({...o,[t]:M.target.value})})))),j.createElement("div",{className:"sl-actions"},j.createElement("button",{type:"submit",className:"sl-primary",disabled:d||!o.name.trim()},o.id?"\u4FDD\u5B58\u8D44\u6599":"\u521B\u5EFA\u5E76\u6253\u5F00"),j.createElement("button",{type:"button",onClick:()=>s(null)},"\u53D6\u6D88"))),j.createElement("div",{className:"sl-library-filter"},j.createElement("nav",{"aria-label":"\u9879\u76EE\u72B6\u6001"},[[!1,"\u4F7F\u7528\u4E2D"],[!0,"\u5DF2\u5F52\u6863"]].map(([t,N])=>j.createElement("button",{key:N,"aria-current":w===t?"page":void 0,onClick:()=>V(t)},N,_.filter(M=>!!M.archived===t).length))),j.createElement("input",{type:"search","aria-label":"\u641C\u7D22\u9879\u76EE",placeholder:"\u641C\u7D22\u9879\u76EE\u3001\u5730\u533A\u6216\u5355\u4F4D",value:L,onChange:t=>E(t.target.value)})),j.createElement("div",{className:"se-library-grid"},j.createElement("table",{"aria-label":"\u5DE5\u7A0B\u76EE\u5F55"},j.createElement("thead",null,j.createElement("tr",null,j.createElement("th",null,"\u9879\u76EE\u540D\u79F0"),j.createElement("th",null,"\u6240\u5728\u5730\u533A / \u8FD0\u8425\u5355\u4F4D"),j.createElement("th",null,"\u8D44\u6599"),j.createElement("th",null,"\u8BB0\u5F55"),j.createElement("th",null,"\u9879\u76EE\u64CD\u4F5C"))),j.createElement("tbody",null,X.map(t=>j.createElement("tr",{key:t.id},j.createElement("td",null,j.createElement("button",{className:"sl-title",onClick:()=>i(t)},t.name),t.description&&j.createElement("small",null,t.description)),j.createElement("td",null,[t.region,t.operator].filter(Boolean).join(" / ")||"\u2014"),j.createElement("td",null,t.sources),j.createElement("td",null,t.records.toLocaleString()),j.createElement("td",null," ",j.createElement("div",{className:"sl-actions"},j.createElement("button",{className:"sl-primary",onClick:()=>i(t)},t.archived?"\u67E5\u770B\u9879\u76EE":"\u8FDB\u5165\u9879\u76EE"),j.createElement("button",{disabled:d,onClick:()=>s({...t})},"\u7F16\u8F91\u8D44\u6599"),j.createElement("button",{disabled:d,onClick:()=>f(async()=>{await Se(await e("/projects/"+t.id+"/backup"),t.name+".ugsdb"),G("\u9879\u76EE\u5907\u4EFD\u5DF2\u5BFC\u51FA")})},"\u5907\u4EFD"),j.createElement("button",{disabled:d,onClick:()=>f(async()=>{await e("/projects/"+t.id,fe("PATCH",{...t,archived:!t.archived})),G(t.archived?"\u9879\u76EE\u5DF2\u6062\u590D\u4F7F\u7528":"\u9879\u76EE\u5DF2\u5F52\u6863\uFF0C\u53EF\u5728\u5DF2\u5F52\u6863\u5217\u8868\u4E2D\u67E5\u770B\u548C\u6062\u590D")})},t.archived?"\u6062\u590D\u4F7F\u7528":"\u5F52\u6863")))))))),!X.length&&j.createElement("div",{className:"sl-empty"},b?L?"\u6CA1\u6709\u5339\u914D\u7684\u9879\u76EE":w?"\u6682\u65E0\u5F52\u6863\u9879\u76EE":"\u4ECE\u65B0\u5EFA\u9879\u76EE\u5F00\u59CB\uFF0C\u6216\u6062\u590D\u5DF2\u6709\u9879\u76EE\u5907\u4EFD\u3002":"\u6B63\u5728\u8BFB\u53D6\u9879\u76EE\u2026"))}var pe=window.QwenPaw.host.React;function ce(e,i,l){let[m,_]=pe.useState({});return pe.useEffect(()=>{if(!i)return;let g=!0;return e(i).then(o=>o.json()).then(o=>{g&&_({path:i,revision:l,data:o})}).catch(o=>{g&&_(s=>({path:i,revision:l,error:o.message,data:s.path===i?s.data:void 0}))}),()=>{g=!1}},[e,i,l]),m.path===i?{...m,updating:m.revision!==l}:{}}var xe={map:"\u5E93\u533A\u4E95\u4F4D\u56FE",surface:"\u5730\u9762\u7BA1\u7F51",balance:"\u751F\u4EA7\u5BF9\u8D26",quality:"\u8D28\u63A7\u590D\u6838",data:"\u6570\u636E\u7BA1\u7406",files:"\u8D44\u6599\u5E93",well:"\u5355\u4E95",pipe:"\u7BA1\u7EBF",station:"\u7AD9\u573A",record:"\u8BB0\u5F55",project:"\u9879\u76EE"},He={map:"M3 5l6-2 6 2 6-2v16l-6 2-6-2-6 2z M9 3v16m6-14v16",well:"M6 21h12M12 3l-5 17m5-17 5 17M9 13h6M8 17h8M8 6h8",surface:"M3 3h5v5H3z M16 16h5v5h-5z M5.5 8v10.5H16m-6-13h8.5V14",pipe:"M3 8h8V4h9v6h-4v4H3z M4 6v10m14-14v10",station:"M3 21V9l6 3V7l6 4V3h4v18z M6 16h2m3 0h2m3 0h1",balance:"M3 20V4m0 16h18M6 14l4-5 4 3 6-7",quality:"M12 2l8 3v6c0 5-4 8-8 11-4-3-8-6-8-11V5z M8 11l3 3 5-6",data:"M3 4h18v16H3z M3 9h18M3 14h18M9 9v11",files:"M3 6h6l2 2h10v12H3z",project:"M3 6h6l2 2h10v12H3z",import:"M12 3v12m-5-5 5 5 5-5 M3 16v5h18v-5",panel:"M3 4h18v16H3z M9 4v16",inspector:"M3 4h18v16H3z M15 4v16",focus:"M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5",source:"M5 2h9l5 5v15H5z M13 2v6h6M8 12h8m-8 4h6",search:"M16 16l5 5 M18 10a8 8 0 1 1-16 0 8 8 0 1 1 16 0",target:"M12 2v5m0 10v5M2 12h5m10 0h5 M19 12a7 7 0 1 1-14 0 7 7 0 1 1 14 0",home:"M3 12l9-9 9 9M6 10v11h12V10"};function $({name:e}){return pe.createElement("svg",{className:"se-icon","aria-hidden":"true",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.55",strokeLinecap:"round",strokeLinejoin:"round"},pe.createElement("path",{d:He[e]||He.source}))}var B=e=>e==null?"\u2014":typeof e=="number"?e.toLocaleString("zh-CN",{maximumFractionDigits:4}):e;function re({cols:e,rows:i,empty:l="\u6682\u65E0\u8BB0\u5F55"}){return pe.createElement("div",{className:"sl-table"},pe.createElement("table",null,pe.createElement("thead",null,pe.createElement("tr",null,e.map(([m])=>pe.createElement("th",{key:m},m)))),pe.createElement("tbody",null,i.map((m,_)=>pe.createElement("tr",{key:_},e.map(([g,o])=>pe.createElement("td",{key:g},typeof o=="function"?o(m):B(m[o]))))))),!i.length&&pe.createElement("p",null,l))}var r=window.QwenPaw.host.React,{useState:te,useEffect:as,useRef:rs}=r,ze={daily:["\u5355\u4E95\u65E5\u62A5","production"],block:["\u533A\u5757\u65E5\u62A5","production"],master:["\u4E95\u57FA\u7840\u6863\u6848","master"],casing:["\u5B8C\u4E95\u5957\u7BA1","casing"],pipe:["\u5730\u9762\u7BA1\u7EBF","pipe"]},De={add:"\u65B0\u589E",edit:"\u4FEE\u8BA2",remove:"\u79FB\u9664",undo:"\u64A4\u9500"},ls={inj:"\u65E5\u6CE8\u6C14\u91CF104m3",prod:"\u65E5\u91C7\u6C14\u91CF104m3",hours:"\u751F\u4EA7\u65F6\u95F4h",tubing:"\u6CB9\u538Bmpa",casing:"\u5957\u538Bmpa"};function be(e,i){return e.raw?.[ls[i]]??e[i]??""}function Ue({api:e,sources:i,readOnly:l,onChange:m,inspect:_,generation:g}){let[o,s]=te("daily"),[S,P]=te(""),[d,C]=te(""),[b,D]=te(""),[L,E]=te(""),[w,V]=te(0),[z,A]=te(null),[Y,G]=te(0),[H,f]=te(null),[F,X]=te({}),[t,N]=te(""),[M,Q]=te(""),[K,le]=te(!1),[ee,J]=te(!0),[h,I]=te(!1),Z=new URLSearchParams({search:d,page:w,start:b,end:L});S&&Z.set("src",S);let oe=Z.toString();as(()=>{let c=!0;return J(!0),Q(""),e("/records/"+o+"?"+oe).then(O=>O.json()).then(O=>{c&&A(O)}).catch(O=>{c&&(Q(O.message),A(null))}).finally(()=>{c&&J(!1)}),()=>{c=!1}},[o,oe,Y,g,e]);function de(c,O){c(O),V(0),f(null)}function a(c,O){f({action:c,record_id:O?.record_id,revision:O?.revision||0}),X(Object.fromEntries(Object.keys(z.fields).map(ne=>[ne,O?be(O,ne):""]))),N(""),Q("")}async function n(c){c.preventDefault(),le(!0),Q("");try{await e("/records/"+o,fe("POST",{...H,src:z.src,values:F,reason:t})),f(null),G(O=>O+1),m()}catch(O){Q(O.message)}finally{le(!1)}}let U=K||!!H;return r.createElement("section",{className:"sl-records"},r.createElement("div",{className:"sl-section"},r.createElement("h2",null,"\u6570\u636E\u7BA1\u7406"),r.createElement("div",{className:"sl-actions"},r.createElement("button",{disabled:!z||ee||K,onClick:async()=>{try{await Se(await e("/exports/"+o+"?"+oe),ze[o][0]+".csv")}catch(c){Q(c.message)}}},"\u5BFC\u51FA\u7B5B\u9009\u7ED3\u679C"),r.createElement("button",{className:"sl-primary",disabled:l||!z||ee||K,onClick:()=>a("add")},"\u65B0\u589E\u8BB0\u5F55"))),r.createElement("div",{className:"sl-controls"},r.createElement("label",null,"\u6570\u636E\u8868",r.createElement("select",{disabled:U,value:o,onChange:c=>{s(c.target.value),P(""),C(""),D(""),E(""),V(0),I(!1)}},Object.entries(ze).map(([c,[O]])=>r.createElement("option",{key:c,value:c},O)))),r.createElement("label",null,"\u8D44\u6599\u7248\u672C",r.createElement("select",{disabled:U,value:S,onChange:c=>de(P,c.target.value)},r.createElement("option",{value:""},"\u6700\u65B0\u7248\u672C"),i.filter(c=>c.kind===ze[o][1]&&!c.archived).map(c=>r.createElement("option",{key:c.id,value:c.id},c.name)))),r.createElement("input",{disabled:U,type:"search","aria-label":"\u7B5B\u9009\u6570\u636E\u8BB0\u5F55",placeholder:"\u4E95\u53F7\u3001\u540D\u79F0\u6216\u5173\u952E\u5B57",value:d,onChange:c=>de(C,c.target.value)}),["daily","block"].includes(o)&&r.createElement(r.Fragment,null,r.createElement("label",null,"\u8D77\u59CB\u65E5",r.createElement("input",{disabled:U,type:"date",value:b,max:L||void 0,onChange:c=>de(D,c.target.value)})),r.createElement("label",null,"\u622A\u6B62\u65E5",r.createElement("input",{disabled:U,type:"date",value:L,min:b||void 0,onChange:c=>de(E,c.target.value)})))),M&&r.createElement("p",{className:"sl-alert",role:"alert"},M),H&&z&&r.createElement("form",{className:"sl-form",onSubmit:n},r.createElement("h3",null,De[H.action],ze[o][0],"\u8BB0\u5F55"),["add","edit"].includes(H.action)&&r.createElement("div",{className:"sl-fields"},Object.entries(z.fields).map(([c,O])=>r.createElement("label",{key:c},O,r.createElement("input",{type:c==="day"?"date":"text",required:z.required.includes(c),value:F[c]??"",onChange:ne=>X({...F,[c]:ne.target.value})})))),r.createElement("label",null,"\u53D8\u66F4\u539F\u56E0",r.createElement("input",{required:!0,maxLength:500,value:t,onChange:c=>N(c.target.value)})),r.createElement("div",{className:"sl-actions"},r.createElement("button",{className:"sl-primary",disabled:K||!t.trim()},K?"\u6B63\u5728\u4FDD\u5B58\u2026":"\u786E\u8BA4"+De[H.action]),r.createElement("button",{type:"button",disabled:K,onClick:()=>f(null)},"\u53D6\u6D88"))),z&&r.createElement(r.Fragment,null,r.createElement("div",{className:"sl-section"},r.createElement("p",null,ee?"\u6B63\u5728\u67E5\u8BE2\u2026":z.count.toLocaleString()+" \u6761\u8BB0\u5F55"),r.createElement("button",{onClick:()=>I(!h)},h?"\u8FD4\u56DE\u8BB0\u5F55":"\u53D8\u66F4\u5386\u53F2")),h?r.createElement("div",{className:"sl-log"},!z.history.length&&r.createElement("p",null,"\u6682\u65E0\u53D8\u66F4"),z.history.map(c=>{let O=c.prior?JSON.parse(c.prior):{},ne=c.current?JSON.parse(c.current):{},ue=Object.keys(z.fields).filter(ie=>String(be(O,ie))!==String(be(ne,ie)));return r.createElement("article",{key:c.id},r.createElement("strong",null,De[c.action]," \xB7"," ",ne.well||O.well||ne.name||O.name||ze[o][0])," ",r.createElement("small",null,c.created," UTC"),r.createElement("p",null,c.reason),r.createElement("p",null,ue.map(ie=>z.fields[ie]+" "+(be(O,ie)===""?"\u2014":be(O,ie))+" \u2192 "+(be(ne,ie)===""?"\u2014":be(ne,ie))).join("\u3000")),!l&&c.action!=="undo"&&z.history.find(ie=>ie.record_id===c.record_id)?.id===c.id&&r.createElement("button",{disabled:K||ee,onClick:()=>a("undo",{record_id:c.record_id,revision:c.id})},"\u64A4\u9500\u6B64\u9879"))})):r.createElement(r.Fragment,null,r.createElement("div",{className:"sl-table"},r.createElement("table",null,r.createElement("thead",null,r.createElement("tr",null,r.createElement("th",null,"\u6765\u6E90\u884C"),Object.values(z.fields).map(c=>r.createElement("th",{key:c},c)),r.createElement("th",null,"\u64CD\u4F5C"))),r.createElement("tbody",null,z.rows.map(c=>r.createElement("tr",{key:c.record_id},r.createElement("td",null,r.createElement("button",{className:"sl-link",onClick:()=>_({type:"record",area:o,src:z.src,row_no:c.row_no,sheet:c.sheet})},c.origin||(c.row_no>0?c.row_no:"\u624B\u5DE5")),c.revision>0?" \xB7 \u5DF2\u4FEE\u6539":""),Object.keys(z.fields).map(O=>r.createElement("td",{key:O},be(c,O)===""?"\u2014":be(c,O))),r.createElement("td",null,r.createElement("button",{disabled:l||U||ee,onClick:()=>a("edit",c)},"\u7F16\u8F91")," ",r.createElement("button",{disabled:l||U||ee,onClick:()=>a("remove",c)},"\u79FB\u9664")))))),!z.rows.length&&r.createElement("p",null,"\u6682\u65E0\u7B26\u5408\u6761\u4EF6\u7684\u8BB0\u5F55")),r.createElement("div",{className:"sl-pager"},r.createElement("button",{disabled:U||ee||z.page===0,onClick:()=>V(z.page-1)},"\u4E0A\u4E00\u9875"),r.createElement("span",null,z.page+1," / ",Math.max(1,Math.ceil(z.count/50))),r.createElement("button",{disabled:U||ee||(z.page+1)*50>=z.count,onClick:()=>V(z.page+1)},"\u4E0B\u4E00\u9875")))))}function Qe({api:e,sources:i,readOnly:l,onChange:m,download:_,Table:g}){let[o,s]=te(null),[S,P]=te(""),d=i.filter(t=>t.kind==="production"&&!t.archived),[C,b]=te(""),[D,L]=te(""),[E,w]=te("\u5DE5\u7A0B\u62A5\u544A"),[V,z]=te(null),[A,Y]=te(!1),[G,H]=te(""),f=rs(null);async function F(t){t.preventDefault(),Y(!0);try{let N=new FormData;N.append("file",V),N.append("well",D),N.append("category",E);let M=await(await e("/attachments",{method:"POST",body:N})).json();H(M.duplicate?"\u6B64\u539F\u4EF6\u5DF2\u5B58\u5728":"\u8D44\u6599\u5DF2\u5F52\u6863"),z(null),f.current.value="",m()}catch(N){H(N.message)}finally{Y(!1)}}let X={attachment:"\u9644\u4EF6",production:"\u751F\u4EA7\u65E5\u62A5",master:"\u4E95\u57FA\u7840\u6863\u6848",pipe:"\u5730\u9762\u7BA1\u9053",casing:"\u5B8C\u4E95\u5361\u7247"};return r.createElement("section",null,r.createElement("div",{className:"sl-section"},r.createElement("h2",null,"\u9879\u76EE\u8D44\u6599\u5E93"),r.createElement("input",{value:C,type:"search","aria-label":"\u641C\u7D22\u8D44\u6599",placeholder:"\u6587\u4EF6\u540D\u3001\u4E95\u53F7\u6216\u7C7B\u522B",onChange:t=>b(t.target.value)})),r.createElement("details",null,r.createElement("summary",null,"\u6C47\u7F16\u751F\u4EA7\u7248\u672C"),r.createElement("form",{className:"sl-form",onSubmit:async t=>{t.preventDefault(),Y(!0);try{await e("/editions",fe("POST",{sources:o,name:S})),m(),s([]),P(""),H("\u6C47\u7F16\u7248\u672C\u5DF2\u4FDD\u5B58")}catch(N){H(N.message)}finally{Y(!1)}}},r.createElement("p",null,"\u52FE\u9009\u81F3\u5C11\u4E24\u4EFD\u751F\u4EA7\u8D44\u6599\u3002\u540C\u4E00\u53E3\u4E95\u540C\u4E00\u65E5\u671F\u91C7\u7528\u8F83\u665A\u5BFC\u5165\u7248\u672C\u7684\u5168\u90E8\u8BB0\u5F55\uFF0C\u533A\u5757\u65E5\u62A5\u6309\u65E5\u671F\u91C7\u7528\u8F83\u665A\u7248\u672C\u3002\u5176\u4ED6\u4E95\u65E5\u4E00\u5E76\u4FDD\u7559\u3002"),r.createElement("div",{className:"sl-fields"},d.map(t=>r.createElement("label",{key:t.id},r.createElement("span",null,r.createElement("input",{type:"checkbox",checked:!!o?.includes(t.id),onChange:N=>s(N.target.checked?[...o||[],t.id]:o.filter(M=>M!==t.id))})," ",t.name)))),r.createElement("label",null,"\u6C47\u7F16\u540D\u79F0",r.createElement("input",{value:S,required:!0,maxLength:100,onChange:t=>P(t.target.value)}))," ",r.createElement("button",{disabled:A||l||!S.trim()||!(o?.length>=2)},"\u751F\u6210\u6C47\u7F16\u7248\u672C"))),r.createElement("form",{className:"sl-form sl-attachment",onSubmit:F},r.createElement("label",null,"\u9644\u4EF6\u7C7B\u522B",r.createElement("select",{disabled:l,value:E,onChange:t=>w(t.target.value)},["\u5DE5\u7A0B\u62A5\u544A","\u4E95\u7B52\u8D44\u6599","\u5730\u9762\u56FE\u7EB8","\u5316\u9A8C\u8D44\u6599","\u5176\u4ED6\u8D44\u6599"].map(t=>r.createElement("option",{key:t},t)))),r.createElement("label",null,"\u5173\u8054\u4E95\u53F7",r.createElement("input",{placeholder:"\u53EF\u7559\u7A7A",value:D,disabled:l,onChange:t=>L(t.target.value)})),r.createElement("input",{type:"file","aria-label":"\u9009\u62E9\u8D44\u6599\u9644\u4EF6",ref:f,disabled:l,onChange:t=>z(t.target.files[0])}),r.createElement("button",{disabled:l||A||!V},"\u5F52\u6863\u9644\u4EF6")),G&&r.createElement("p",{role:"status"},G),r.createElement(g,{rows:i.filter(t=>[t.name,t.well,t.category,X[t.kind]].join(" ").toLowerCase().includes(C.trim().toLowerCase())),cols:[["\u6587\u4EF6\u540D","name"],["\u7C7B\u578B",t=>t.category||X[t.kind]],["\u5173\u8054\u4E95\u53F7","well"],["\u5DE5\u4F5C\u8868","sheets"],["\u5F53\u524D\u8BB0\u5F55","rows_count"],["\u72B6\u6001",t=>t.archived?"\u5DF2\u6536\u8D77":"\u5728\u7528"],["\u5165\u5E93\u65F6\u95F4 / UTC","imported"],["\u539F\u4EF6",t=>t.has_original===0?"\u624B\u5DE5\u5F55\u5165":r.createElement("button",{onClick:()=>_(t)},"\u4E0B\u8F7D\u539F\u4EF6")],["\u7BA1\u7406",t=>r.createElement("button",{disabled:l||A,onClick:async()=>{Y(!0);try{await e("/sources/"+t.id,fe("PATCH",{archived:!t.archived})),m(),H(t.archived?"\u8D44\u6599\u5DF2\u6062\u590D":"\u8D44\u6599\u5DF2\u6536\u8D77\uFF0C\u539F\u4EF6\u4E0E\u5386\u53F2\u4FDD\u7559")}catch(N){H(N.message)}finally{Y(!1)}}},t.archived?"\u6062\u590D\u8D44\u6599":"\u6536\u8D77\u8D44\u6599")]]}))}var v=window.QwenPaw.host.React,T={x:77,y:25,w:672,h:290},ds=e=>Array.from(e).reduce((i,l)=>i+(l.charCodeAt(0)>255?12:7),0);function ps(e){let i=e.map(s=>s.xy[0]),l=e.map(s=>s.xy[1]),m=Math.min(...i),_=Math.max(...i),g=Math.min(...l),o=Math.max(...l);return{x:(m+_)/2,y:(g+o)/2,scale:Math.max((_-m)/T.w,(o-g)/T.h,.01)*1.15}}function Ve(e,i,l){let m=(i-e)/l,_=10**Math.floor(Math.log10(m)),g=([1,2,5,10].find(s=>s*_>=m)||10)*_,o=[];for(let s=Math.ceil(e/g);s<=Math.floor(i/g);s++)o.push(s*g);return o}function We({objects:e,selected:i,inspect:l,open:m,base:_,importFile:g,readOnly:o}){let[s,S]=v.useState(null),[P,d]=v.useState(!0),[C,b]=v.useState(!0),[D,L]=v.useState("quality"),[E,w]=v.useState(0),V=v.useRef(null),z=v.useRef(null),A=e.wells,Y=A.filter(a=>a.xy),G=v.useId().replace(/:/g,""),H=v.useMemo(()=>Y.length?ps(Y):null,[e]);v.useEffect(()=>S(null),[e.src,H?.x,H?.y,H?.scale]);let f=s||H,F=i?.type==="well"&&A.find(a=>a.name===i.name);function X(a){f&&S({...f,scale:Math.max(H.scale/128,Math.min(H.scale*4,f.scale*a))})}function t(a){let n=V.current.createSVGPoint();n.x=a.clientX,n.y=a.clientY;let U=V.current.getScreenCTM();return U?n.matrixTransform(U.inverse()):n}let N=f?f.x-T.w*f.scale/2:0,M=f?f.y-T.h*f.scale/2:0,Q=a=>T.x+(a-N)/f.scale,K=a=>T.y+T.h-(a-M)/f.scale,le=Y.filter(a=>{let n=Q(a.xy[0]),U=K(a.xy[1]);return n>=T.x&&n<=T.x+T.w&&U>=T.y&&U<=T.y+T.h}).sort((a,n)=>+(n.name===F?.name)-+(a.name===F?.name)||+(n.pending>0)-+(a.pending>0)),ee=[];function J(a,n,U,c){if(!P&&!c)return null;let O=ds(U);for(let[ne,ue]of[[8,-8],[8,15],[-O-8,-8],[-O-8,15]]){let ie=a+ne,ye=n+ue-12,Me=ie+O,ve=ye+14;if(!(ie<T.x||Me>T.x+T.w||ye<T.y||ve>T.y+T.h)&&!ee.some(we=>ie<we[2]+4&&Me>we[0]-4&&ye<we[3]+2&&ve>we[1]-2))return ee.push([ie,ye,Me,ve]),[ie,ve-2]}return c?[a+8,n-7]:null}let h=(_.issues||[]).filter(a=>a.selected==null),I=D==="quality"?h:A,Z=Math.max(1,Math.ceil(I.length/6)),oe=Math.min(E,Z-1),de=new Map(le.map(a=>[a.name,J(Q(a.xy[0]),K(a.xy[1]),a.name,a.name===F?.name)]));return v.createElement("div",{className:"se-mapdoc"},v.createElement("header",{className:"se-doc-head"},v.createElement("div",null,v.createElement("small",null,"\u5E93\u533A\u5DE5\u7A0B\u56FE\u4EF6"),v.createElement("h2",null,"\u5E93\u533A\u4E95\u4F4D\u56FE")),v.createElement("span",{className:"se-meta"},Y.length," / ",A.length," \u53E3\u4E95\u6709\u4E95\u4F4D")),v.createElement("div",{className:"se-canvas-tools"},v.createElement("span",null,v.createElement($,{name:"map"})," \u4E95\u53E3\u5750\u6807"),v.createElement("div",{className:"se-tools"},v.createElement("label",null,v.createElement("input",{type:"checkbox","aria-label":"\u663E\u793A\u4E95\u53F7\u6807\u7B7E",checked:P,onChange:a=>d(a.target.checked)}),"\u4E95\u53F7"),v.createElement("label",null,v.createElement("input",{type:"checkbox",checked:C,onChange:a=>b(a.target.checked)}),"\u5F85\u590D\u6838\u6807\u8BB0"),v.createElement("button",{"aria-label":"\u7F29\u5C0F\u4E95\u4F4D\u56FE",disabled:!f,onClick:()=>X(1.5)},"\u2212"),v.createElement("button",{"aria-label":"\u653E\u5927\u4E95\u4F4D\u56FE",disabled:!f,onClick:()=>X(1/1.5)},"\uFF0B"),v.createElement("button",{onClick:()=>S(null),disabled:!f},"\u5168\u56FE"))),f?v.createElement("div",{className:"se-map-plane"},v.createElement("svg",{ref:V,viewBox:"0 0 780 351",role:"group","aria-label":"\u4E95\u53E3\u5750\u6807\u5E73\u9762\u56FE",onPointerDown:a=>{if(a.button!==0||a.target.closest("[data-well]"))return;let n=t(a);z.current={p:n,v:f},a.currentTarget.setPointerCapture(a.pointerId)},onPointerMove:a=>{let n=z.current;if(!n)return;let U=t(a);S({...n.v,x:n.v.x-(U.x-n.p.x)*n.v.scale,y:n.v.y+(U.y-n.p.y)*n.v.scale})},onPointerUp:()=>z.current=null,onPointerCancel:()=>z.current=null},v.createElement("defs",null,v.createElement("clipPath",{id:G},v.createElement("rect",{x:T.x,y:T.y,width:T.w,height:T.h}))),v.createElement("rect",{className:"se-plot-bg",x:T.x,y:T.y,width:T.w,height:T.h}),Ve(N,N+T.w*f.scale,6).map(a=>v.createElement("g",{key:a},v.createElement("line",{className:"se-grid",x1:Q(a),x2:Q(a),y1:T.y,y2:T.y+T.h}),v.createElement("text",{className:"se-axis",x:Q(a),y:T.y+T.h+19,textAnchor:"middle"},Number(a.toFixed(4))))),Ve(M,M+T.h*f.scale,5).map(a=>v.createElement("g",{key:a},v.createElement("line",{className:"se-grid",x1:T.x,x2:T.x+T.w,y1:K(a),y2:K(a)}),v.createElement("text",{className:"se-axis",x:T.x-8,y:K(a)+4,textAnchor:"end"},Number(a.toFixed(4))))),v.createElement("text",{className:"se-axis",x:T.x-8,y:T.y-9,textAnchor:"end"},"Y"),v.createElement("text",{className:"se-axis",x:T.x+T.w+8,y:T.y+T.h+19},"X"),v.createElement("g",{clipPath:"url(#"+G+")"},le.slice().reverse().map(a=>{let n=a.name===F?.name,U=Q(a.xy[0]),c=K(a.xy[1]),O=de.get(a.name),ne=()=>l({type:"well",name:a.name});return v.createElement("g",{"data-well":a.name,key:a.name,className:"se-wellpoint"+(n?" selected":""),role:"button",tabIndex:0,"aria-label":"\u4E95\u4F4D "+a.name,onClick:ne,onDoubleClick:()=>m({type:"well",name:a.name}),onKeyDown:ue=>{ue.key==="Enter"&&m({type:"well",name:a.name}),ue.key===" "&&(ue.preventDefault(),ne())}},v.createElement("title",null,a.name+" \xB7 "+(a.days?"\u6709\u751F\u4EA7\u65E5\u62A5":"\u57FA\u7840\u8D44\u6599")+(a.pending?" \xB7 "+a.pending+" \u7EC4\u5F85\u590D\u6838":"")),(n||C&&a.pending>0)&&v.createElement("circle",{cx:U,cy:c,r:n?9:6.4,fill:"none",stroke:n?"#194c9a":"#b66a24",strokeWidth:n?2.5:1.4}),v.createElement("circle",{className:"se-hit",cx:U,cy:c,r:"7",fill:"transparent"}),v.createElement("circle",{cx:U,cy:c,r:3.25,fill:a.days?"#087366":"white",stroke:a.days?"#065d52":"#647a8c",strokeWidth:"1.5"}),O&&v.createElement("text",{className:"se-point-label",x:O[0],y:O[1]},a.name))})))):v.createElement("div",{className:"se-no-map"},v.createElement($,{name:"map"}),v.createElement("h3",null,A.length?"\u5F53\u524D\u4E95\u6863\u7F3A\u5C11\u53EF\u5B9A\u4F4D\u7684\u4E95\u53E3\u5750\u6807":"\u9879\u76EE\u4E2D\u5C1A\u65E0\u4E95\u4F4D\u8D44\u6599"),v.createElement("p",null,"\u5BFC\u5165\u542B\u4E95\u53F7\u3001\u4E95\u53E3\u5750\u6807 X \u548C Y \u7684\u5355\u4E95\u57FA\u7840\u5DE5\u4F5C\u7C3F\u3002"),v.createElement("button",{disabled:o,onClick:g},"\u5BFC\u5165\u4E95\u6863")),v.createElement("div",{className:"se-legend"},v.createElement("span",null,v.createElement("i",{className:"producing"}),"\u6709\u751F\u4EA7\u65E5\u62A5"),v.createElement("span",null,v.createElement("i",null),"\u4EC5\u4E95\u6863\u6216\u5B8C\u4E95\u8D44\u6599"),C&&v.createElement("span",null,v.createElement("i",{className:"flagged"}),"\u5F85\u590D\u6838\u4E95"),v.createElement("span",{className:"se-muted"},"\u539F\u8868 X / Y \u5750\u6807")),v.createElement("div",{className:"se-map-index"},v.createElement("div",{className:"se-section-head"},v.createElement("div",{className:"se-index-tabs"},[["quality","\u5F85\u590D\u6838\u4E95\u65E5",h.length],["wells","\u4E95\u4F4D\u660E\u7EC6",A.length]].map(([a,n,U])=>v.createElement("button",{key:a,"aria-pressed":D===a,onClick:()=>{L(a),w(0)}},n," ",v.createElement("small",null,U)))),v.createElement("div",{className:"se-tools"},v.createElement("button",{"aria-label":"\u660E\u7EC6\u4E0A\u4E00\u9875",disabled:!oe,onClick:()=>w(oe-1)},"\u2039"),v.createElement("span",null,oe+1," / ",Z),v.createElement("button",{"aria-label":"\u660E\u7EC6\u4E0B\u4E00\u9875",disabled:oe>=Z-1,onClick:()=>w(oe+1)},"\u203A"))),v.createElement(re,{rows:I.slice(oe*6,oe*6+6),empty:D==="quality"?"\u5F53\u524D\u751F\u4EA7\u7248\u672C\u6CA1\u6709\u5F85\u590D\u6838\u4E95\u65E5":"\u9879\u76EE\u4E2D\u5C1A\u65E0\u4E95\u6863",cols:D==="quality"?[["\u4E95\u53F7",a=>v.createElement("button",{className:"sl-link",onClick:()=>m({type:"well",name:a.well,date:a.day})},a.well)],["\u751F\u4EA7\u65E5","day"],["\u5019\u9009\u884C\u6570","candidates"],["\u590D\u6838",a=>v.createElement("button",{className:"sl-link",onClick:()=>m({type:"quality",well:a.well,day:a.day})},"\u6838\u5BF9\u6765\u6E90\u884C \u203A")]]:[["\u4E95\u53F7",a=>v.createElement("button",{className:"sl-link",onClick:()=>l({type:"well",name:a.name})},a.name)],["\u4E95\u53E3 X",a=>B(a.xy?.[0])],["\u4E95\u53E3 Y",a=>B(a.xy?.[1])],["\u4E95\u6863",a=>v.createElement("button",{className:"sl-link",onClick:()=>m({type:"well",name:a.name})},"\u6253\u5F00\u6863\u6848 \u203A")]]})))}var R=window.QwenPaw.host.React,Pe={inj:["\u65E5\u6CE8\u6C14","\u4E07\u65B9"],prod:["\u65E5\u91C7\u6C14","\u4E07\u65B9"],tubing:["\u6CB9\u538B","MPa"],casing:["\u5957\u538B","MPa"]},us=["#047969","#cb762e","#3a66af","#8f5399"],Be=864e5,he=e=>Date.parse(e+"T00:00:00Z")/Be,ms=e=>new Date(Math.round(e)*Be).toISOString().slice(0,10);function cs(e,i,l,m){let _=null,g=0,o=null,s="",S=[];for(let P of e){let d=he(P.day);(P[i]==null||_===null||d!==_+1)&&(g===1&&S.push(o),g=0),P[i]!=null&&(o=[l(d),m(P[i])],s+=(g?"L":"M")+o.map(C=>C.toFixed(2)).join(" "),g++),_=d}return g===1&&S.push(o),{path:s,dots:S}}function bs(e,i,l){let m=l==="gas"?["inj","prod"]:["tubing","casing"],_=new Set,g=[],o=0,s=0,S=0;for(let[L,E]of i.entries()){let w=e.series[E]||[],V=new Map(w.map(z=>[z.day,z]));for(let z of V.keys())_.add(z);for(let[z,A]of m.entries()){for(let Y of w)Y[A]!=null&&(o=Math.min(o,Y[A]),s=Math.max(s,Y[A]),S++);g.push({name:E,key:A,color:us[2*L+z],points:w,byDate:V})}}s===o&&(s=o+1);let P=he(e.start),d=he(e.end),C=L=>56+(d>P?(L-P)/(d-P):.5)*668,b=L=>213-(L-o)/(s-o)*178,D=g.map(L=>({...L,geometry:cs(L.points,L.key,C,b)}));return{min:o,max:s,n:S,t0:P,t1:d,px:C,py:b,rows:D,dates:[..._].sort(),keys:m}}function Ye({data:e,wells:i,metric:l,cursor:m,select:_}){let g=R.useRef(null),[o,s]=i,{min:S,max:P,n:d,t0:C,t1:b,px:D,py:L,rows:E,dates:w,keys:V}=R.useMemo(()=>bs(e,s?[o,s]:[o],l),[e,o,s,l]),[z,A]=R.useState("");if(!w.length)return R.createElement("div",{className:"sl-empty"},"\u6240\u9009\u65F6\u6BB5\u6CA1\u6709\u4E95\u65E5\u62A5\u3002\u53EF\u66F4\u6539\u622A\u6B62\u65E5\u6216\u67E5\u770B\u5168\u65F6\u6BB5\u3002");function Y(f){let F=g.current,X=F.createSVGPoint();X.x=f.clientX,X.y=f.clientY;let t=C+(X.matrixTransform(F.getScreenCTM().inverse()).x-56)/668*(b-C),N=0,M=w.length-1;for(;N<M;){let Q=Math.floor((N+M)/2);he(w[Q])<t?N=Q+1:M=Q}return N>0&&Math.abs(he(w[N-1])-t)<Math.abs(he(w[N])-t)?w[N-1]:w[N]}let G=z||m,H=G&&G>=e.start&&G<=e.end;return R.createElement("div",{className:"se-curve"},R.createElement("div",{className:"se-series-legend"},E.map(f=>R.createElement("span",{key:f.name+f.key},R.createElement("i",{style:{background:f.color}}),f.name," \xB7 ",Pe[f.key][0]))),R.createElement("svg",{viewBox:"0 0 758 245",ref:g,"aria-label":(l==="gas"?"\u6CE8\u91C7\u6C14\u91CF":"\u6CB9\u5957\u538B\u529B")+"\u5386\u53F2\u66F2\u7EBF",role:"img",onPointerMove:f=>A(Y(f)),onPointerLeave:()=>A(""),onClick:f=>_(Y(f))},R.createElement("text",{className:"se-axis",x:"16",y:"18"},Pe[V[0]][1]),[0,1,2,3,4].map(f=>{let F=S+(P-S)*f/4;return R.createElement("g",{key:f},R.createElement("line",{className:"se-grid",x1:"56",x2:"724",y1:L(F),y2:L(F)}),R.createElement("text",{className:"se-axis",x:"48",y:L(F)+4,textAnchor:"end"},B(Number(F.toPrecision(4)))))}),(C===b?[.5]:[0,.25,.5,.75,1]).map((f,F)=>R.createElement("g",{key:F},R.createElement("line",{className:"se-grid",x1:56+668*f,x2:56+668*f,y1:"35",y2:"213"}),R.createElement("text",{className:"se-axis",x:56+668*f,y:"234",textAnchor:"middle"},ms(C+f*(b-C))))),E.map(f=>{let F=f.geometry;return R.createElement("g",{key:f.name+f.key,fill:f.color},R.createElement("path",{d:F.path,stroke:f.color,strokeWidth:"1.8",fill:"none"}),F.dots.map(([X,t],N)=>R.createElement("circle",{key:N,cx:X,cy:t,r:2.2})))}),H&&R.createElement("line",{x1:D(he(G)),x2:D(he(G)),y1:"30",y2:"215",stroke:"#455365",strokeDasharray:"4 3"})),!d&&R.createElement("p",null,"\u5F53\u524D\u66F2\u7EBF\u901A\u9053\u6CA1\u6709\u53EF\u91C7\u7528\u7684\u6570\u503C\u3002"),R.createElement("div",{className:"se-readout"},R.createElement("strong",null,H?G:"\u8BFB\u6570"),H?E.map(f=>{let F=f.byDate.get(G);return R.createElement("span",{key:f.name+f.key,style:{borderColor:f.color}},f.name," ",Pe[f.key][0]," ",F?.row_no==null&&F?.candidates.length?"\u5F85\u590D\u6838":B(F?.[f.key]))}):R.createElement("span",null,"\u79FB\u52A8\u6307\u9488\u8BFB\u53D6\u6570\u503C\uFF0C\u5355\u51FB\u65E5\u671F\u67E5\u770B\u6765\u6E90\u884C\u3002")))}var x=window.QwenPaw.host.React;function fs({well:e,trace:i}){let l=e.strings;function m(s){return typeof s=="number"||typeof s=="string"&&/^\s*\d+(\.\d+)?\s*$/.test(s)?Number(s):null}let _=l.map(s=>({...s,z:m(s.depth)})).filter(s=>s.z!=null&&s.z>=0),g=Math.max(1,..._.map(s=>s.z)),o=s=>32+198*s/g;return x.createElement(x.Fragment,null,x.createElement("h3",null,"\u5957\u7BA1\u978B\u6DF1\u5EA6"),_.length>0&&x.createElement("div",{className:"se-casing-scroll"},x.createElement("svg",{viewBox:"0 0 "+Math.max(560,125+_.length*108)+" 273",role:"img","aria-label":e.name+"\u5957\u7BA1\u978B\u4E0B\u6DF1\u793A\u610F\u56FE"},x.createElement("text",{x:"7",y:"17",className:"se-axis"},"\u4E0B\u6DF1 / m"),[0,.25,.5,.75,1].map(s=>x.createElement("g",{key:s},x.createElement("line",{x1:"65",x2:110+_.length*105,y1:o(s*g),y2:o(s*g),className:"se-grid"}),x.createElement("text",{className:"se-axis",x:"58",y:o(s*g)+3,textAnchor:"end"},B(Math.round(s*g))))),_.map((s,S)=>{let P=116+105*S,d=o(s.z);return x.createElement("g",{key:s.sheet+s.row_no,tabIndex:0,role:"button","aria-label":s.name+" \u7B2C "+s.row_no+" \u884C",onClick:()=>i("casing",s),onKeyDown:C=>C.key==="Enter"&&i("casing",s)},x.createElement("line",{x1:P,x2:P,y1:"32",y2:"232",stroke:"#a9b9c3",strokeDasharray:"2 5"}),x.createElement("path",{d:"M"+(P-12)+" "+(d-8)+"v8h24v-8",stroke:"#147c76",strokeWidth:"3",fill:"none"}),x.createElement("text",{x:P+16,y:d+3,className:"se-axis"},B(s.z)),x.createElement("text",{x:P,y:"252",textAnchor:"middle"},s.name))}))),x.createElement(re,{rows:l,cols:[["\u5957\u7BA1\u540D\u79F0","name"],["\u5916\u5F84 / mm","diameter"],["\u4E0B\u6DF1 / m","depth"],["\u6C34\u6CE5\u8FD4\u6DF1\uFF08\u539F\u6587\uFF09","cement"],["\u56FA\u4E95\u8D28\u91CF","quality"],["\u6765\u6E90\u884C",s=>x.createElement("button",{className:"sl-link",onClick:()=>i("casing",s)},s.sheet," \xB7 ",s.row_no)]],empty:"\u5F53\u524D\u4E95\u6CA1\u6709\u5B8C\u4E95\u5957\u7BA1\u8BB0\u5F55"}))}function Xe({doc:e,well:i,objects:l,base:m,api:_,revision:g,open:o,inspect:s,download:S}){let[P,d]=x.useState("\u66F2\u7EBF\u4E0E\u65E5\u62A5"),[C,b]=x.useState(""),[D,L]=x.useState(365),[E,w]=x.useState("gas"),[V,z]=x.useState(e.date||m.day||""),[A,Y]=x.useState(e.date||""),[G,H]=x.useState(0);x.useEffect(()=>{e.date&&(z(e.date),Y(e.date),L(90),d("\u66F2\u7EBF\u4E0E\u65E5\u62A5"))},[e.date,e.jump]);let f=e.type==="well"&&P==="\u66F2\u7EBF\u4E0E\u65E5\u62A5",F=new URLSearchParams({well:e.name,span:D,end:V});m.src&&F.set("src",m.src),C&&F.append("well",C);let X=ce(_,f&&m.src?"/series?"+F:"",g),t=X.data;function N(h,I){s({type:"record",area:h,src:I.src,row_no:I.row_no,sheet:I.sheet})}function M(h){Y(h);let I=t?.series[e.name]?.find(Z=>Z.day===h)||t?.series[C]?.find(Z=>Z.day===h);I?.row_no!=null?N("daily",{src:t.src,row_no:I.row_no}):I?.candidates.length&&s({type:"issue",name:t?.series[e.name]?.includes(I)?e.name:C,day:h,rows:I.candidates,src:t.src})}let Q=t?.series[e.name]||[],K=[e.name,C].filter(Boolean).map(h=>({name:h,point:t?.series[h]?.find(I=>I.day===A)})).filter(h=>h.point),le=x.useMemo(()=>Q.slice().reverse(),[Q]),ee=(m.issues||[]).filter(h=>h.well===e.name&&h.selected==null);x.useEffect(()=>H(0),[D,V,m.src,e.name]);let J=Math.min(G,Math.max(0,Math.ceil(Q.length/40)-1));return i?x.createElement("div",{className:"se-paper"},x.createElement("header",{className:"se-doc-head"},x.createElement("div",null,x.createElement("small",null,"\u5355\u4E95\u5DE5\u7A0B\u6863\u6848"),x.createElement("h2",null,i.name)),x.createElement("span",{className:"se-meta"},i.masters[0]?.kind||"\u5355\u4E95"," \xB7 ",B(i.days)," \u4E2A\u751F\u4EA7\u65E5")),x.createElement("div",{className:"se-subtabs"},["\u66F2\u7EBF\u4E0E\u65E5\u62A5","\u4E95\u7B52\u7ED3\u6784","\u4E95\u6863\u8D44\u6599"].map(h=>x.createElement("button",{key:h,"aria-pressed":h===P,onClick:()=>d(h)},h))),P==="\u4E95\u7B52\u7ED3\u6784"&&x.createElement(fs,{well:i,trace:N}),P==="\u4E95\u6863\u8D44\u6599"&&x.createElement(x.Fragment,null,x.createElement("h3",null,"\u5355\u4E95\u57FA\u7840\u6570\u636E"),x.createElement(re,{rows:i.masters,cols:[["\u4E95\u53F7","well"],["\u4E95 ID","external_id"],["\u4E95\u522B","kind"],["\u7AD9\u5E93","station"],["\u7BA1\u7EBF","line"],["\u4E95\u53E3 X",h=>B(h.xy?.[0])],["\u4E95\u53E3 Y",h=>B(h.xy?.[1])],["\u6765\u6E90\u884C",h=>x.createElement("button",{className:"sl-link",onClick:()=>N("master",h)},h.row_no)]]}),x.createElement("h3",null,"\u5173\u8054\u4E95\u8D44\u6599"),x.createElement(re,{rows:m.sources.filter(h=>h.well===i.name&&!h.archived),cols:[["\u6587\u4EF6","name"],["\u7C7B\u522B","category"],["\u539F\u4EF6",h=>x.createElement("button",{className:"sl-link",onClick:()=>S(h)},"\u4E0B\u8F7D\u539F\u4EF6")]]})),f&&x.createElement(x.Fragment,null,x.createElement("div",{className:"se-filter-grid"},x.createElement("label",null,"\u66F2\u7EBF\u901A\u9053",x.createElement("select",{value:E,onChange:h=>w(h.target.value)},x.createElement("option",{value:"gas"},"\u6CE8\u6C14 / \u91C7\u6C14\u91CF"),x.createElement("option",{value:"pressure"},"\u6CB9\u538B / \u5957\u538B"))),x.createElement("label",null,"\u5BF9\u6BD4\u4E95",x.createElement("select",{value:C,onChange:h=>b(h.target.value)},x.createElement("option",{value:""},"\u4EC5\u5F53\u524D\u4E95"),l.wells.filter(h=>h.name!==i.name&&h.days).map(h=>x.createElement("option",{key:h.name},h.name)))),x.createElement("label",null,"\u65F6\u6BB5",x.createElement("select",{value:D,onChange:h=>L(Number(h.target.value))},[[30,"30 \u5929"],[90,"90 \u5929"],[365,"\u4E00\u5E74"],[0,"\u5168\u65F6\u6BB5"]].map(([h,I])=>x.createElement("option",{key:h,value:h},I)))),x.createElement("label",null,"\u622A\u6B62\u65E5",x.createElement("input",{type:"date",value:V,onChange:h=>z(h.target.value),max:m.period?.last||void 0}))),X.error&&x.createElement("p",{role:"alert",className:"sl-alert"},X.error),t?x.createElement(Ye,{data:t,wells:[i.name,...C?[C]:[]],metric:E,cursor:A,select:M}):x.createElement("p",null,m.src?X.error?"":"\u6B63\u5728\u8BFB\u53D6\u66F2\u7EBF\u2026":"\u5F53\u524D\u9879\u76EE\u5C1A\u65E0\u751F\u4EA7\u65E5\u62A5\u3002"),K.map(({name:h,point:I})=>x.createElement("div",{key:h,className:"se-tools se-picked"},x.createElement("strong",null,A," \xB7 ",h),I.candidates.length>1&&x.createElement("button",{onClick:()=>o({type:"quality",well:h,day:A})},"\u6253\u5F00\u8BE5\u4E95\u65E5\u590D\u6838"),(I.candidates.length?I.candidates:[I.row_no]).map(Z=>x.createElement("button",{key:Z,onClick:()=>N("daily",{src:t.src,row_no:Z})},Z>0?"\u67E5\u770B\u7B2C "+Z+" \u884C":"\u67E5\u770B\u624B\u5DE5\u8BB0\u5F55")))),x.createElement("div",{className:"se-section-head"},x.createElement("h3",null,"\u5355\u4E95\u65E5\u62A5 ",x.createElement("small",null,B(Q.length)," \u4E2A\u4E95\u65E5")),ee.length>0&&x.createElement("button",{className:"sl-link",onClick:()=>o({type:"quality",well:i.name,day:ee[0].day})},"\u5F85\u590D\u6838 ",ee.length," \u7EC4 \u203A")),x.createElement(re,{rows:le.slice(J*40,J*40+40),cols:[["\u751F\u4EA7\u65E5",h=>x.createElement("button",{className:"sl-link",onClick:()=>M(h.day)},h.day)],...Object.entries(Pe).map(([h,[I,Z]])=>[I+" / "+Z,h]),["\u6765\u6E90\u884C",h=>h.row_no==null?x.createElement("button",{className:"se-warning",onClick:()=>o({type:"quality",well:i.name,day:h.day})},"\u5F85\u590D\u6838 \xB7 ",h.candidates.length," \u884C"):x.createElement("button",{className:"sl-link",onClick:()=>N("daily",{src:m.src,row_no:h.row_no})},h.row_no>0?h.row_no:"\u624B\u5DE5")]],empty:"\u6B64\u65F6\u6BB5\u6CA1\u6709\u5355\u4E95\u65E5\u62A5"}),Q.length>40&&x.createElement("div",{className:"se-pager"},x.createElement("button",{disabled:J===0,onClick:()=>H(J-1)},"\u4E0A\u4E00\u9875"),J+1," / ",Math.ceil(Q.length/40),x.createElement("button",{disabled:(J+1)*40>=Q.length,onClick:()=>H(J+1)},"\u4E0B\u4E00\u9875")))):x.createElement("div",{className:"sl-empty"},"\u5F53\u524D\u7248\u672C\u4E2D\u6CA1\u6709\u8FD9\u53E3\u4E95\u7684\u8D44\u6599\u3002")}var k=window.QwenPaw.host.React,{useState:Ne,useEffect:hs}=k;function gs({rows:e}){if(!e.length)return null;let i=Math.max(1,...e.flatMap(m=>[m.inj||0,m.prod||0])),l=900/e.length;return k.createElement("figure",{className:"sl-figure"},k.createElement("figcaption",null,k.createElement("strong",null,"\u533A\u5757\u6CE8\u91C7\u8D8B\u52BF"),k.createElement("span",null,k.createElement("i",null),"\u6CE8\u6C14",k.createElement("i",null),"\u91C7\u6C14\u3000\xB7\u3000\u4E07\u65B9")),k.createElement("svg",{viewBox:"0 0 900 100",preserveAspectRatio:"none",role:"img","aria-label":"\u6700\u8FD1\u4E5D\u5341\u6761\u533A\u5757\u65E5\u62A5\u6CE8\u91C7\u6C14\u91CF"},[25,50,75,99].map(m=>k.createElement("line",{key:m,x1:"0",x2:"900",y1:m,y2:m,stroke:"currentColor",opacity:".1"})),e.map((m,_)=>["inj","prod"].map((g,o)=>m[g]>0&&k.createElement("rect",{key:m.day+g,x:(_+o*.48)*l,y:98-m[g]/i*94,width:Math.max(.8,l*.46),height:m[g]/i*94,fill:o?"#bd753c":"#198576"},k.createElement("title",null,m.day," \xB7 ",o?"\u91C7\u6C14":"\u6CE8\u6C14"," ",B(m[g])," \u4E07\u65B9"))))),k.createElement("footer",null,k.createElement("span",null,e[0].day),k.createElement("span",null,e.at(-1).day)))}var Oe=(e,i)=>e==null||i==null?null:e-i;function Ke({doc:e,api:i,base:l,revision:m,onChange:_,open:g,update:o,inspect:s,project:S,download:P}){let d=e.type==="quality",[C,b]=Ne(0),[D,L]=Ne(""),[E,w]=Ne(""),[V,z]=Ne(!1),[A,Y]=Ne(""),[G,H]=Ne(""),f=e.well||"",F=new URLSearchParams;l.src&&F.set("src",l.src),e.day&&F.set("day",e.day),C&&F.set("notes_page",C);let X={notes_page:C},t=!!(e.day&&e.day!==l.day||C),N=ce(i,t?"/workspace?"+F:"",m),M=t?N.data:l,Q=M?.day||"",K=M?.balance,le=V||!M;hs(()=>{L(""),w(""),Y(""),H("")},[e.day,f,l.src]);function ee(n){"notes_page"in n?b(n.notes_page):o({day:n.day,well:""})}function J(n,U=""){U?(o({day:n,well:U}),s({type:"well",name:U})):g({type:"balance",day:n})}function h(n){g({type:"well",name:n,date:Q})}let I=(n,U)=>k.createElement("button",{className:"sl-link",onClick:U},n),Z=M?.issues.find(n=>n.well===f&&n.day===Q);async function oe(){if(!(!Z||!D||!E.trim())){z(!0),Y("");try{await i("/reviews",fe("POST",{src:M.src,day:Q,well:f,row_no:Number(D),note:E.trim(),previous:Z.selected})),w(""),L(""),H("\u5DF2\u4FDD\u5B58\u590D\u6838\u610F\u89C1\u5E76\u91CD\u65B0\u8BA1\u7B97\u5F53\u65E5\u5BF9\u8D26"),_()}catch(n){Y(n.message)}finally{z(!1)}}}let de=n=>n.contested?n.selected==null?"\u5F85\u590D\u6838":n.selected===n.row_no?"\u5DF2\u91C7\u7528":"\u4FDD\u7559\u539F\u884C":"\u5355\u6761\u8BB0\u5F55",a=[["\u6765\u6E90\u884C",n=>I(n.row_no>0?String(n.row_no):"\u624B\u5DE5",()=>s({type:"record",area:"daily",src:M.src,row_no:n.row_no}))],...[["\u65E5\u6CE8\u6C14 / \u4E07\u65B9","inj","\u65E5\u6CE8\u6C14\u91CF104m3"],["\u65E5\u91C7\u6C14 / \u4E07\u65B9","prod","\u65E5\u91C7\u6C14\u91CF104m3"],["\u751F\u4EA7 / h","hours","\u751F\u4EA7\u65F6\u95F4h"],["\u6CB9\u538B / MPa","tubing","\u6CB9\u538Bmpa"],["\u5957\u538B / MPa","casing","\u5957\u538Bmpa"]].map(([n,U,c])=>[n,O=>M.text_values?.[O.row_no]?.[c]??B(O[U])])];return k.createElement("div",{className:"se-paper"},k.createElement("header",{className:"se-doc-head"},k.createElement("div",null,k.createElement("small",null,"\u751F\u4EA7\u7BA1\u7406"),k.createElement("h2",null,d?"\u8D28\u63A7\u590D\u6838":"\u751F\u4EA7\u5BF9\u8D26")),k.createElement("label",null,"\u751F\u4EA7\u65E5"," ",k.createElement("input",{type:"date",value:e.day||l.day||"",min:l.period?.first||void 0,max:l.period?.last||void 0,onChange:n=>ee({day:n.target.value})}))),(A||N.error)&&k.createElement("p",{className:"sl-alert",role:"alert"},A||N.error),G&&k.createElement("p",{role:"status"},G),!M&&!N.error&&k.createElement("p",null,"\u6B63\u5728\u8BFB\u53D6\u65E5\u62A5\u2026"),M&&k.createElement(k.Fragment,null," ",!d&&(M.src?k.createElement(k.Fragment,null,k.createElement("div",{className:"sl-metrics"},[["\u533A\u5757\u65E5\u6CE8\u6C14",K?.block_inj,"\u4E07\u65B9"],["\u533A\u5757\u65E5\u91C7\u6C14",K?.block_prod,"\u4E07\u65B9"],["\u5F53\u65E5\u62A5\u8868\u4E95\u6570",new Set(M.daily.map(n=>n.well)).size,"\u53E3"],["\u5F53\u65E5\u5F85\u590D\u6838",K?.pending,"\u7EC4"]].map(([n,U,c])=>k.createElement("article",{key:n},k.createElement("span",null,n),k.createElement("div",null,B(U)," ",k.createElement("small",null,c))))),k.createElement(gs,{rows:M.trend}),k.createElement("div",{className:"se-section-head"},k.createElement("h2",null,"\u5F53\u65E5\u6C14\u91CF\u5BF9\u8D26"),M.block_row!=null&&I("\u67E5\u770B\u533A\u5757\u65E5\u62A5\u6765\u6E90\u884C",()=>s({type:"record",area:"block",src:M.src,row_no:M.block_row}))),k.createElement(re,{cols:[["\u65B9\u5411","kind"],["\u533A\u5757\u65E5\u62A5 / \u4E07\u65B9","block"],["\u5DF2\u91C7\u7528\u4E95\u91CF\u5408\u8BA1 / \u4E07\u65B9","sum"],["\u533A\u5757\u51CF\u4E95\u91CF / \u4E07\u65B9",n=>K?.pending?"\u5F85\u590D\u6838":B(Oe(n.block,n.sum))]],rows:K?[{kind:"\u6CE8\u6C14",block:K.block_inj,sum:K.inj},{kind:"\u91C7\u6C14",block:K.block_prod,sum:K.prod}]:[]}),k.createElement("h2",null,"\u5355\u4E95\u660E\u7EC6"),k.createElement(re,{cols:[["\u4E95\u53F7",n=>I(n.well,()=>h(n.well))],...a,["\u8BB0\u5F55\u72B6\u6001",de],["\u5907\u6CE8","memo"]],rows:M.daily})):k.createElement("div",{className:"sl-empty"},k.createElement("h2",null,"\u5BFC\u5165\u7B2C\u4E00\u4EFD\u6CE8\u91C7\u65E5\u62A5"),k.createElement("p",null,"\u9009\u62E9\u542B\u201C\u533A\u5757\u201D\u548C\u201C\u5355\u4E95\u201D\u5DE5\u4F5C\u8868\u7684\u6C47\u603B\u6587\u4EF6\uFF0C\u5373\u53EF\u67E5\u770B\u6CE8\u91C7\u8D8B\u52BF\u4E0E\u5355\u4E95\u660E\u7EC6\u3002"),I("\u4E0B\u8F7D\u5408\u6210\u793A\u4F8B",()=>P({name:"\u5408\u6210\u6CE8\u91C7\u65E5\u62A5.xlsx"})))),d&&k.createElement(k.Fragment,null,k.createElement("h2",null,"\u91CD\u590D\u4E95\u65E5\u8BB0\u5F55"," ",k.createElement("small",null,M.issues.filter(n=>n.selected==null).length," \u7EC4\u5F85\u590D\u6838")),Z&&k.createElement("div",{className:"sl-review"},k.createElement("h3",null,f," \xB7 ",Q),k.createElement("div",{className:"se-tools"},I("\u6253\u5F00\u5355\u4E95\u66F2\u7EBF",()=>h(f)),I("\u67E5\u770B\u5F53\u65E5\u5BF9\u8D26",()=>J(Q))),k.createElement(re,{rows:M.daily.filter(n=>n.well===f),cols:[["\u91C7\u7528",n=>k.createElement("input",{type:"radio",name:"candidate","aria-label":"\u91C7\u7528\u7B2C "+n.row_no+" \u884C",checked:D===String(n.row_no),onChange:()=>L(String(n.row_no))})],...a,["\u5907\u6CE8","memo"],["\u72B6\u6001",de]]}),k.createElement("label",null,"\u590D\u6838\u4F9D\u636E"," ",k.createElement("input",{value:E,maxLength:"500",onChange:n=>w(n.target.value),placeholder:"\u586B\u5199\u91C7\u7528\u8BE5\u884C\u7684\u4F9D\u636E"}))," ",k.createElement("button",{className:"sl-primary",disabled:le||S.archived||!D||!E.trim(),onClick:oe},"\u4FDD\u5B58\u5E76\u91CD\u7B97"),M.audit.filter(n=>n.well===f).map((n,U)=>k.createElement("p",{key:U},n.reviewed," UTC \xB7 \u7B2C ",n.row_no," \u884C \xB7 ",n.note))),k.createElement(re,{rows:M.issues,cols:[["\u751F\u4EA7\u65E5","day"],["\u4E95\u53F7",n=>I(n.well,()=>J(n.day,n.well))],["\u539F\u59CB\u884C\u6570","candidates"],["\u590D\u6838\u7ED3\u679C",n=>n.selected==null?"\u5F85\u590D\u6838":"\u91C7\u7528\u7B2C "+n.selected+" \u884C"],["\u4F9D\u636E","note"]]}),k.createElement("h2",null,"\u4E95\u91CF\u4E0E\u533A\u5757\u65E5\u62A5\u5DEE\u989D"),k.createElement("p",null,"\u4E24\u4FA7\u6709\u8BFB\u6570\u3001\u4E14\u4E95\u65E5\u51B2\u7A81\u5DF2\u5904\u7406\u65F6\u6BD4\u8F83\uFF0C\u7EDD\u5BF9\u5DEE\u8FBE\u5230 0.0001 \u4E07\u65B9\u5217\u51FA\u3002"),k.createElement(re,{rows:M.gaps,cols:[["\u751F\u4EA7\u65E5",n=>I(n.day,()=>J(n.day))],["\u6CE8\u6C14\u5DEE / \u4E07\u65B9",n=>B(Oe(n.block_inj,n.inj))],["\u91C7\u6C14\u5DEE / \u4E07\u65B9",n=>B(Oe(n.block_prod,n.prod))]]}),k.createElement("div",{className:"sl-section"},k.createElement("h2",null,"\u975E\u6807\u6570\u503C\u539F\u6587 ",k.createElement("small",null,B(M.notes_count)," \u9879")),M.notes_count>100&&k.createElement("div",null,k.createElement("button",{disabled:le||!Number(X.notes_page),onClick:()=>ee({notes_page:Number(X.notes_page)-1})},"\u4E0A\u4E00\u9875"),k.createElement("span",null,Number(X.notes_page||0)+1," /"," ",Math.ceil(M.notes_count/100)),k.createElement("button",{disabled:le||(Number(X.notes_page||0)+1)*100>=M.notes_count,onClick:()=>ee({notes_page:Number(X.notes_page||0)+1})},"\u4E0B\u4E00\u9875"))),k.createElement(re,{rows:M.reading_notes,cols:[["\u5DE5\u4F5C\u8868","sheet"],["\u539F\u8868\u884C",n=>I(n.row_no,()=>s({type:"record",area:n.sheet==="\u533A\u5757"?"block":"daily",src:M.src,row_no:n.row_no}))],["\u5B57\u6BB5","field"],["\u539F\u6587","value"]]}))))}var q=window.QwenPaw.host.React;function Ce(e,i){return e.filter(l=>[l.start_node,l.end_node].some(m=>m?.type===i.type&&m.name===i.name))}var je=e=>({type:"pipe",src:e.src,row_no:e.row_no,name:e.code||e.name||"\u7BA1\u7EBF "+e.row_no});function Je({doc:e,objects:i,open:l,inspect:m}){let[_,g]=q.useState(""),o=e.type==="pipe"&&i.pipes.find(b=>b.src===e.src&&b.row_no===e.row_no),s=e.type==="station"?Ce(i.pipes,e):e.type==="pipe"?o?[o]:[]:i.pipes,S=b=>b?.name&&b.type!=="endpoint"?q.createElement("button",{className:"sl-link",onClick:()=>l(b)},b.name):b?.name||"\u672A\u8BB0\u5F55",P=b=>m({type:"record",area:"pipe",src:b.src,row_no:b.row_no}),d=e.type==="station"||e.type==="pipe"?e.name:"\u5730\u9762\u7BA1\u7F51",C=s.filter(b=>[b.code,b.name,b.start,b.end].join(" ").toLowerCase().includes(_.toLowerCase().trim()));return q.createElement("div",{className:"se-paper"},q.createElement("header",{className:"se-doc-head"},q.createElement("div",null,q.createElement("small",null,e.type==="pipe"?"\u5730\u9762\u7BA1\u7EBF\u6863\u6848":e.type==="station"?"\u7AD9\u573A\u8FDE\u63A5\u5173\u7CFB":"\u5730\u9762\u96C6\u8F93\u7CFB\u7EDF"),q.createElement("h2",null,d)),q.createElement("span",{className:"se-meta"},s.length," \u6761\u7BA1\u7EBF")),o&&q.createElement(q.Fragment,null,q.createElement("div",{className:"se-pipeline"},q.createElement("div",null,q.createElement($,{name:o.start_node.type}),q.createElement("small",null,"\u7BA1\u7EBF\u8D77\u70B9"),S(o.start_node)),q.createElement("div",{className:"se-pipe-span"},q.createElement("span",null,B(o.length)," km"),q.createElement("hr",null),q.createElement("span",null,"\u5916\u5F84 ",B(o.diameter)," mm")),q.createElement("div",null,q.createElement($,{name:o.end_node.type}),q.createElement("small",null,"\u7BA1\u7EBF\u7EC8\u70B9"),S(o.end_node))),q.createElement("div",{className:"se-tools"},q.createElement("b",null,o.name),q.createElement("span",null,"\u8BBE\u8BA1\u538B\u529B ",B(o.pressure)," MPa"),q.createElement("button",{onClick:()=>P(o)},"\u67E5\u770B\u7BA1\u7EBF\u6765\u6E90\u884C"))),e.type==="surface"&&q.createElement(q.Fragment,null,q.createElement("h3",null,"\u7AD9\u573A\u8FDE\u63A5\u7D22\u5F15"),q.createElement("div",{className:"se-stations"},i.stations.map(b=>{let D={type:"station",name:b},L=Ce(i.pipes,D);return q.createElement("button",{key:b,onClick:()=>l(D)},q.createElement($,{name:"station"}),q.createElement("span",null,q.createElement("strong",null,b),q.createElement("small",null,L.length," \u6761\u5173\u8054\u7BA1\u7EBF")))}))),e.type==="station"&&q.createElement(q.Fragment,null,q.createElement("h3",null,"\u76F8\u90BB\u5BF9\u8C61"),q.createElement("div",{className:"se-stations"},[...new Map(s.flatMap(b=>[b.start_node,b.end_node]).filter(b=>b.name&&!(b.type===e.type&&b.name===e.name)).map(b=>[b.type+b.name,b])).values()].map(b=>q.createElement("button",{key:b.type+b.name,disabled:b.type==="endpoint",onClick:()=>l(b)},q.createElement($,{name:b.type}),b.name)))),q.createElement("div",{className:"se-section-head"},q.createElement("h3",null,"\u7BA1\u7EBF\u660E\u7EC6"),q.createElement("input",{type:"search","aria-label":"\u7B5B\u9009\u7BA1\u7EBF",placeholder:"\u7BA1\u7EBF\u3001\u7F16\u53F7\u6216\u7AD9\u540D",value:_,onChange:b=>g(b.target.value)})),q.createElement(re,{rows:C,cols:[["\u7BA1\u9053\u7F16\u53F7",b=>q.createElement("button",{className:"sl-link",onClick:()=>l(je(b))},b.code||"\u7BA1\u7EBF "+b.row_no)],["\u7BA1\u9053\u540D\u79F0","name"],["\u8D77\u70B9",b=>S(b.start_node)],["\u7EC8\u70B9",b=>S(b.end_node)],["\u957F\u5EA6 / km","length"],["\u5916\u5F84 / mm","diameter"],["\u8BBE\u8BA1\u538B\u529B / MPa","pressure"],["\u6765\u6E90\u884C",b=>q.createElement("button",{className:"sl-link",onClick:()=>P(b)},b.row_no)]],empty:"\u6CA1\u6709\u5339\u914D\u7684\u7BA1\u7EBF\u8BB0\u5F55"}))}var u=window.QwenPaw.host.React;function Ge({objects:e,open:i,selected:l}){let[m,_]=u.useState(""),[g,o]=u.useState({well:!0}),s=[["well","\u4E95",e.wells.map(d=>({type:"well",name:d.name,detail:d.pending?String(d.pending):""}))],["station","\u7AD9\u573A",e.stations.map(d=>({type:"station",name:d}))],["pipe","\u7BA1\u7EBF",e.pipes.map(d=>({...je(d),alias:[d.name,d.start,d.end].join(" ")}))]],S=m.trim().toLowerCase(),P=d=>[d.name,d.alias||""].join(" ").toLowerCase().includes(S);return u.createElement("aside",{className:"se-explorer","aria-label":"\u9879\u76EE\u6D4F\u89C8\u5668"},u.createElement("div",{className:"se-dock-title"},u.createElement($,{name:"panel"}),u.createElement("b",null,"\u9879\u76EE\u6D4F\u89C8\u5668")),u.createElement("label",{className:"se-search"},u.createElement($,{name:"search"}),u.createElement("input",{type:"search","aria-label":"\u641C\u7D22\u5DE5\u7A0B\u5BF9\u8C61",placeholder:"\u67E5\u627E\u4E95\u3001\u7AD9\u6216\u7BA1\u7EBF",value:m,onChange:d=>_(d.target.value)})),u.createElement("div",{className:"se-tree"},u.createElement("div",{className:"se-tree-root"},u.createElement($,{name:"project"})," \u5DE5\u7A0B\u5BF9\u8C61"),s.map(([d,C,b])=>{let D=b.filter(P),L=S||g[d];return S&&!D.length?null:u.createElement("div",{key:d},u.createElement("button",{className:"se-branch","aria-expanded":!!L,onClick:()=>o({...g,[d]:!g[d]})},u.createElement("span",null,L?"\u25BE":"\u25B8"),u.createElement($,{name:d}),C,u.createElement("em",null,D.length)),L&&u.createElement("div",{className:"se-leaves"},D.map(E=>u.createElement("button",{key:d==="pipe"?E.src+":"+E.row_no:E.name,className:l?.type===d&&(d==="pipe"?l.src===E.src&&l.row_no===E.row_no:l?.name===E.name)?"current":"","aria-label":"\u6253\u5F00"+xe[d]+" "+E.name,onClick:()=>i(E)},u.createElement($,{name:d}),u.createElement("span",null,E.name),E.detail&&u.createElement("em",{title:"\u5F85\u590D\u6838\u4E95\u65E5"},E.detail)))))}),S&&!s.some(d=>d[2].some(P))&&u.createElement("p",null,"\u672A\u627E\u5230\u5DE5\u7A0B\u5BF9\u8C61")))}function ge({items:e}){return u.createElement("dl",{className:"se-properties"},e.map(([i,l])=>u.createElement(u.Fragment,{key:i},u.createElement("dt",null,i),u.createElement("dd",null,l===0?"0":l||"\u2014"))))}var xs={inj:"\u65E5\u6CE8\u6C14\u91CF104m3",prod:"\u65E5\u91C7\u6C14\u91CF104m3",hours:"\u751F\u4EA7\u65F6\u95F4h",tubing:"\u6CB9\u538Bmpa",casing:"\u5957\u538Bmpa"},ys={daily:"\u5355\u4E95\u65E5\u62A5",block:"\u533A\u5757\u65E5\u62A5",master:"\u4E95\u6863",pipe:"\u7BA1\u7EBF",casing:"\u5B8C\u4E95\u5361\u7247"};function vs({s:e,api:i,revision:l,open:m,download:_}){let g=new URLSearchParams({src:e.src,row_no:e.row_no});e.sheet&&g.set("sheet",e.sheet);let o=ce(i,"/trace/"+e.area+"?"+g,l),s=o.data;if(!s)return u.createElement("p",{role:o.error?"alert":"status"},o.error||"\u6B63\u5728\u5B9A\u4F4D\u6765\u6E90\u884C\u2026");let S=s.row.well,P=s.row.day;return u.createElement(u.Fragment,null,u.createElement("h3",null,ys[e.area],"\u6765\u6E90"),u.createElement(ge,{items:[["\u8D44\u6599\u540D\u79F0",s.source.name],["\u5DE5\u4F5C\u8868",s.line>0?s.sheet:"\u624B\u5DE5\u5F55\u5165"],["\u539F\u8868\u884C",s.line>0?s.line:"\u624B\u5DE5\u5F55\u5165"],...e.src!==s.source.id?[["\u6C47\u7F16\u884C",e.row_no]]:[]]}),s.line>0&&s.source.has_original>0&&u.createElement("button",{onClick:()=>_(s.source)},u.createElement($,{name:"import"}),"\u4E0B\u8F7D\u6765\u6E90\u539F\u4EF6"),u.createElement("h4",null,"\u5F53\u524D\u53F0\u8D26\u503C"),u.createElement(ge,{items:Object.entries(s.fields).map(([d,C])=>[C,s.raw[xs[d]]??B(s.row[d])])}),s.changes.length>0&&u.createElement(u.Fragment,null,u.createElement("h4",null,"\u4FEE\u8BA2\u8BB0\u5F55"),s.changes.map((d,C)=>u.createElement("p",{key:C},d.created," UTC",u.createElement("br",null),d.reason))),u.createElement("div",{className:"se-prop-actions"},S&&u.createElement("button",{onClick:()=>m({type:"well",name:S,date:P})},"\u6253\u5F00\u5355\u4E95\u6863\u6848"),P&&u.createElement("button",{onClick:()=>m({type:"balance",day:P})},"\u67E5\u770B\u5F53\u65E5\u5BF9\u8D26")))}function Ze({selected:e,objects:i,base:l,api:m,revision:_,project:g,inspect:o,open:s,download:S,close:P}){let d=e?.type==="well"&&i.wells.find(w=>w.name===e.name),C=e?.type==="pipe"&&i.pipes.find(w=>w.src===e.src&&w.row_no===e.row_no),b=l.sources.find(w=>w.id===l.src),D=(w,V)=>u.createElement("button",{className:"sl-link",onClick:V},w),L=d&&l.issues.find(w=>w.well===d.name&&w.selected==null),E=(w,V)=>o({type:"record",area:w,src:V.src,row_no:V.row_no,sheet:V.sheet});return u.createElement("aside",{className:"se-inspector","aria-label":"\u5C5E\u6027\u4E0E\u6765\u6E90"},u.createElement("div",{className:"se-dock-title"},u.createElement($,{name:"inspector"}),u.createElement("b",null,"\u5C5E\u6027\u4E0E\u6765\u6E90"),u.createElement("button",{className:"se-x","aria-label":"\u6536\u8D77\u5C5E\u6027",onClick:P},"\xD7")),u.createElement("div",{className:"se-prop-body"},e?.type==="record"?u.createElement(vs,{s:e,api:m,revision:_,open:s,download:S}):e?.type==="issue"?u.createElement(u.Fragment,null,u.createElement("small",null,"\u91CD\u590D\u4E95\u65E5"),u.createElement("h3",null,e.name),u.createElement(ge,{items:[["\u751F\u4EA7\u65E5",e.day],["\u72B6\u6001","\u5F85\u590D\u6838"]]}),e.rows.map(w=>u.createElement("div",{key:w},D("\u6765\u6E90\u884C "+w,()=>E("daily",{src:e.src,row_no:w})))),D("\u6253\u5F00\u590D\u6838",()=>s({type:"quality",well:e.name,day:e.day}))):d?u.createElement(u.Fragment,null,u.createElement("small",null,"\u5355\u4E95\u5C5E\u6027"),u.createElement("h3",null,d.name),u.createElement(ge,{items:[["\u4E95\u522B",d.masters[0]?.kind],["\u4E95 ID",d.masters[0]?.external_id],["\u4E95\u53E3 X",B(d.xy?.[0])],["\u4E95\u53E3 Y",B(d.xy?.[1])],["\u9996\u4E2A\u751F\u4EA7\u65E5",d.first],["\u672B\u4E2A\u751F\u4EA7\u65E5",d.last],["\u4E95\u7B52\u8BB0\u5F55",d.strings.length],["\u5F85\u590D\u6838\u4E95\u65E5",d.pending]]}),d.coordinate_conflict&&u.createElement("p",null,"\u540C\u540D\u4E95\u6709\u591A\u7EC4\u4E95\u53E3\u5750\u6807\uFF0C\u9700\u6838\u5BF9\u4E95\u6863\u3002"),u.createElement("div",{className:"se-prop-actions"},u.createElement("button",{onClick:()=>s({type:"well",name:d.name})},"\u6253\u5F00\u5355\u4E95\u6863\u6848"),L&&u.createElement("button",{onClick:()=>s({type:"quality",day:L.day,well:d.name})},"\u5B9A\u4F4D\u5F85\u590D\u6838\u4E95\u65E5")),u.createElement("h4",null,"\u57FA\u7840\u8D44\u6599\u6765\u6E90"),d.masters.length?d.masters.map(w=>u.createElement("div",{key:w.row_no},D("\u4E95\u6863 \xB7 "+(w.row_no>0?"\u7B2C "+w.row_no+" \u884C":"\u624B\u5DE5\u8BB0\u5F55"),()=>E("master",w)))):u.createElement("p",null,"\u6682\u65E0\u5355\u4E95\u57FA\u7840\u8BB0\u5F55"),u.createElement("h4",null,"\u5173\u8054\u7BA1\u7EBF"),Ce(i.pipes,e).map(w=>u.createElement("div",{key:w.row_no},D(w.name||w.code,()=>s(je(w)))))):C?u.createElement(u.Fragment,null,u.createElement("small",null,"\u5730\u9762\u7BA1\u7EBF"),u.createElement("h3",null,C.code||C.name),u.createElement(ge,{items:[["\u7BA1\u9053\u540D\u79F0",C.name],["\u8D77\u70B9",C.start],["\u7EC8\u70B9",C.end],["\u957F\u5EA6 / km",B(C.length)],["\u5916\u5F84 / mm",B(C.diameter)],["\u8BBE\u8BA1\u538B\u529B / MPa",B(C.pressure)]]}),D("\u5B9A\u4F4D\u7BA1\u7EBF\u6765\u6E90\u884C",()=>E("pipe",C))):e?.type==="station"?u.createElement(u.Fragment,null,u.createElement("small",null,"\u7AD9\u573A\u5C5E\u6027"),u.createElement("h3",null,e.name),u.createElement(ge,{items:[["\u76F8\u8FDE\u7BA1\u7EBF",Ce(i.pipes,e).length]]}),u.createElement("h4",null,"\u5173\u8054\u7BA1\u7EBF"),Ce(i.pipes,e).map(w=>u.createElement("div",{key:w.row_no},D(w.name||w.code,()=>s(je(w)))))):u.createElement(u.Fragment,null,u.createElement("small",null,"\u9879\u76EE\u5C5E\u6027"),u.createElement("h3",null,g.name),u.createElement(ge,{items:[["\u6240\u5728\u5730\u533A",g.region],["\u8FD0\u8425\u5355\u4F4D",g.operator],["\u4F7F\u7528\u72B6\u6001",g.archived?"\u5DF2\u5F52\u6863":"\u4F7F\u7528\u4E2D"],["\u4E95",i.wells.length],["\u7AD9\u573A",i.stations.length],["\u7BA1\u7EBF",i.pipes.length]]}),u.createElement("h4",null,"\u751F\u4EA7\u6570\u636E\u8303\u56F4"),u.createElement(ge,{items:[["\u7248\u672C",b?.name],["\u8D77\u59CB\u65E5",l.period?.first],["\u622A\u6B62\u65E5",l.period?.last],["\u8986\u76D6\u5929\u6570",B(l.period?.days)]]}),b?.has_original>0&&D("\u4E0B\u8F7D\u751F\u4EA7\u539F\u4EF6",()=>S(b)))))}var y=window.QwenPaw.host.React,Le={type:"map",key:"map"},ws={wells:[],stations:[],pipes:[]},ks=["map","surface","balance","quality","data","files"],Ns=e=>e.type==="pipe"?JSON.stringify([e.type,e.src,e.row_no]):e.type==="well"||e.type==="station"?JSON.stringify([e.type,e.name]):e.type;function $e({project:e,apiHost:i,close:l,css:m}){let _=y.useCallback((p,W={})=>i(p,{...W,headers:{...W.headers,"X-Ledger-Project":e.id}}),[e.id,i]),[g,o]=y.useState([Le]),[s,S]=y.useState(Le.key),[P,d]=y.useState(""),[C,b]=y.useState(0),[D,L]=y.useState(null),[E,w]=y.useState(null),[V,z]=y.useState(1200),[A,Y]=y.useState(!1),[G,H]=y.useState({}),[f,F]=y.useState(""),[X,t]=y.useState(""),[N,M]=y.useState(!1),Q=y.useRef(null),K=y.useRef(null),le=y.useRef(null),ee=ce(_,"/workspace?"+(P?"src="+P:""),C),J=ee.data,h=ce(_,J?"/objects"+(J.src?"?src="+J.src:""):"",C),I=h.data||ws,Z=g.find(p=>p.key===s)||Le,oe=D??V>=680,de=E??V>=1090,a=G[s]||(["well","station","pipe"].includes(Z.type)?Z:{type:"project"});y.useEffect(()=>{if(!Q.current||typeof ResizeObserver>"u")return;let p=new ResizeObserver(W=>z(W[0].contentRect.width));return p.observe(Q.current),()=>p.disconnect()},[]),y.useEffect(()=>{if(!A)return;function p(W){W.key==="Escape"&&(W.stopPropagation(),Y(!1))}return window.addEventListener("keydown",p,!0),()=>window.removeEventListener("keydown",p,!0)},[A]),y.useEffect(()=>{le.current?.querySelector('[aria-selected="true"]')?.scrollIntoView?.({block:"nearest",inline:"nearest"})},[s]);function n(p){let W=Ns(p),se=p.day||p.date;o(ae=>ae.find(ke=>ke.key===W)?se?ae.map(ke=>ke.key===W?{...ke,...p,jump:(ke.jump||0)+1}:ke):ae:[...ae,{...p,key:W}]),["well","station","pipe"].includes(p.type)&&H(ae=>({...ae,[W]:p})),p.well&&p.type==="quality"&&H(ae=>({...ae,[W]:{type:"well",name:p.well}})),S(W),V<680&&L(!1),V<960&&w(!1)}function U(p){let W=g.filter(se=>se.key!==p.key);p.key===s&&S(W[Math.max(0,g.indexOf(p)-1)]?.key||Le.key),o(W.length?W:[Le]),H(se=>{let ae={...se};return delete ae[p.key],ae})}function c(p){H(W=>({...W,[s]:p})),w(!0),V<680&&L(!1)}function O(p){o(W=>W.map(se=>se.key===s?{...se,...p}:se))}let ne=()=>b(p=>p+1);async function ue(p){try{await Se(await _(p.id?"/sources/"+p.id:"/sample"),p.name)}catch(W){t(W.message)}}async function ie(p){let W=p.target.files?.[0];if(p.target.value="",!!W){M(!0),t(""),F("");try{let se=new FormData;se.append("file",W);let ae=await(await _("/imports",{method:"POST",body:se})).json();F(ae.duplicate?"\u8BE5\u7248\u672C\u5DF2\u7ECF\u5165\u5E93\u3002":W.name+" \xB7 \u5DF2\u5BFC\u5165 "+B(ae.count)+" \u6761\u8BB0\u5F55"),ae.kind==="production"&&d(String(ae.id)),ne()}catch(se){t(se.message)}finally{M(!1)}}}function ye(p){d(p),H({}),o(W=>W.map(se=>({...se,well:se.type==="quality"?"":se.well})))}let Me=()=>{d(""),ne()};function ve(p){let W=g.findIndex(ae=>ae.key===s),se={ArrowLeft:(W-1+g.length)%g.length,ArrowRight:(W+1)%g.length,Home:0,End:g.length-1}[p.key];se!==void 0&&(p.preventDefault(),S(g[se].key),le.current.querySelectorAll('[role="tab"]')[se].focus())}let we=p=>({doc:p,project:e,api:_,base:J,objects:I,revision:C,open:n,inspect:c,download:ue,onChange:ne,update:O});function ss(p){let W=we(p);return p.type==="map"?y.createElement(We,{...W,selected:G[p.key],importFile:()=>K.current.click(),readOnly:e.archived>0}):p.type==="well"?y.createElement(Xe,{...W,well:I.wells.find(se=>se.name===p.name)}):["surface","pipe","station"].includes(p.type)?y.createElement(Je,{...W}):["balance","quality"].includes(p.type)?y.createElement(Ke,{...W}):p.type==="data"?y.createElement("div",{className:"se-paper"},y.createElement(Ue,{api:_,sources:J.sources,generation:C,readOnly:e.archived,onChange:ne,inspect:c})):y.createElement("div",{className:"se-paper"},y.createElement(Qe,{api:_,sources:J.sources,readOnly:e.archived,onChange:Me,download:ue,Table:re}))}let Ee=J?.issues?.filter(p=>p.selected==null).length,Te=J?.sources.filter(p=>p.kind==="production"&&!p.archived)||[];return y.createElement("main",{ref:Q,className:"sl-app se-studio"+(A?" se-focus":""),"aria-label":"\u50A8\u6C14\u5E93\u5DE5\u7A0B\u9879\u76EE"},y.createElement("style",null,m),y.createElement("header",{className:"se-titlebar"},y.createElement("div",{className:"se-appmark"},y.createElement($,{name:"well"})),y.createElement("div",{className:"se-titletext"},y.createElement("small",null,"\u50A8\u6C14\u5E93\u6570\u636E\u7BA1\u7406"),y.createElement("h1",null,e.name)),y.createElement("div",{className:"se-title-actions"},y.createElement("button",{onClick:l},y.createElement($,{name:"project"})," \u9879\u76EE\u5E93"),y.createElement("button",{title:A?"\u9000\u51FA\u4E13\u6CE8\u89C6\u56FE\uFF08Esc\uFF09":"\u4E13\u6CE8\u89C6\u56FE","aria-label":A?"\u9000\u51FA\u4E13\u6CE8\u89C6\u56FE":"\u4E13\u6CE8\u89C6\u56FE","aria-pressed":A,onClick:()=>Y(!A)},y.createElement($,{name:"focus"})))),y.createElement("div",{className:"se-ribbon","aria-label":"\u5DE5\u7A0B\u547D\u4EE4"},y.createElement("div",{className:"se-command-group"},y.createElement("button",{className:"se-import",disabled:N||e.archived>0,onClick:()=>K.current.click()},y.createElement($,{name:"import"}),N?"\u5BFC\u5165\u4E2D\u2026":"\u5BFC\u5165\u5DE5\u4F5C\u7C3F")),y.createElement("div",{className:"se-command-group"},ks.map(p=>y.createElement("button",{key:p,onClick:()=>n({type:p}),className:Z.type===p?"selected":""},y.createElement($,{name:p}),xe[p]))),y.createElement("div",{className:"se-command-group se-dock-tools"},y.createElement("button",{"aria-label":"\u9879\u76EE\u6D4F\u89C8\u5668\u5F00\u5173",title:"\u9879\u76EE\u6D4F\u89C8\u5668","aria-pressed":oe,onClick:()=>{L(!oe),V<680&&w(!1)}},y.createElement($,{name:"panel"})),y.createElement("button",{"aria-label":"\u5C5E\u6027\u7A97\u683C\u5F00\u5173",title:"\u5C5E\u6027\u4E0E\u6765\u6E90","aria-pressed":de,onClick:()=>{w(!de),V<680&&L(!1)}},y.createElement($,{name:"inspector"})))),y.createElement("input",{type:"file",ref:K,hidden:!0,"aria-label":"\u5BFC\u5165\u5DE5\u4F5C\u7C3F\u6587\u4EF6",accept:".xls,.xlsx",onChange:ie}),(X||ee.error||h.error)&&y.createElement("div",{className:"sl-alert se-notice",role:"alert"},X||ee.error||h.error,y.createElement("button",{onClick:()=>{t(""),ne()}},"\u5237\u65B0")),f&&y.createElement("div",{className:"se-notice",role:"status"},f,y.createElement("button",{"aria-label":"\u5173\u95ED\u63D0\u793A",onClick:()=>F("")},"\xD7")),y.createElement("div",{className:"se-workarea"+(oe?" has-tree":"")+(de?" has-props":"")},oe&&y.createElement(Ge,{objects:I,open:n,selected:a}),y.createElement("section",{className:"se-editor"},y.createElement("div",{className:"se-tabbar",ref:le,role:"tablist","aria-label":"\u5DF2\u6253\u5F00\u7684\u5DE5\u7A0B\u6587\u6863"},g.map(p=>y.createElement("span",{key:p.key,className:p.key===s?"active":""},y.createElement("button",{role:"tab",tabIndex:p.key===s?0:-1,"aria-selected":p.key===s,onKeyDown:ve,onClick:()=>S(p.key)},y.createElement($,{name:p.type}),p.name||xe[p.type]),(g.length>1||p.type!=="map")&&y.createElement("button",{className:"se-close","aria-label":"\u5173\u95ED "+(p.name||xe[p.type]),onClick:()=>U(p)},"\xD7")))),J?g.map(p=>y.createElement("div",{key:p.key,className:"se-document",role:"tabpanel","aria-label":p.name||xe[p.type],hidden:p.key!==s},!h.data&&!h.error&&["map","well","surface","pipe","station"].includes(p.type)?y.createElement("div",{className:"se-loading"},"\u6B63\u5728\u8BFB\u53D6\u5DE5\u7A0B\u5BF9\u8C61\u2026"):ss(p))):y.createElement("div",{className:"se-loading"},ee.error?"\u5DE5\u7A0B\u6570\u636E\u8BFB\u53D6\u5931\u8D25":"\u6B63\u5728\u6253\u5F00\u5DE5\u7A0B\u6570\u636E\u5E93\u2026")),de&&J&&y.createElement(Ze,{selected:a,objects:I,base:J,api:_,revision:C,project:e,inspect:c,open:n,download:ue,close:()=>w(!1)})),y.createElement("footer",{className:"se-status"},y.createElement("strong",null,y.createElement("i",null),e.archived?"\u5F52\u6863\u53EA\u8BFB":"\u9879\u76EE\u5DF2\u6253\u5F00"),y.createElement("label",null,"\u751F\u4EA7\u7248\u672C"," ",y.createElement("select",{"aria-label":"\u751F\u4EA7\u6570\u636E\u7248\u672C",value:J?.src||"",disabled:!Te.length||N,onChange:p=>ye(p.target.value)},!Te.length&&y.createElement("option",{value:""},"\u5C1A\u65E0\u65E5\u62A5"),Te.map(p=>y.createElement("option",{key:p.id,value:p.id},p.name)))),y.createElement("span",null,Ee==null?"":Ee+" \u7EC4\u5F85\u590D\u6838")))}var qe=window.QwenPaw,_e=qe.host.React,Re=Fe+`
`+Ie;async function es(e,i){let l=await qe.host.fetch("/storage-ledger"+e,i);if(!l.ok){let m=await l.json().catch(()=>({}));throw Error(typeof m.detail=="string"?m.detail:"\u8BF7\u6C42\u5931\u8D25 \xB7 "+l.status)}return l}function Cs(){let[e,i]=_e.useState(null),[l]=_e.useState(()=>new URLSearchParams(location.search).get("project"));function m(s){i(s);let S=new URL(location.href);s?S.searchParams.set("project",s.id):S.searchParams.delete("project"),window.history.replaceState(window.history.state,"",S)}let[_,g]=_e.useState(!0);function o(s){g(!1),m(s)}return e?_e.createElement($e,{key:e.id,project:e,apiHost:es,css:Re,close:()=>m(null)}):_e.createElement(Ae,{api:es,css:Re,open:o,initialId:_?l:null})}function _s(){let e=qe.host.useSelectedAgent?.();return _e.createElement(Cs,{key:e?.id||"default"})}qe.registerRoutes("storage-ledger",[{path:"/apps/storage-ledger",label:"\u50A8\u6C14\u5E93\u6570\u636E\u7BA1\u7406",icon:"\u25A5",component:_s}]);})();
