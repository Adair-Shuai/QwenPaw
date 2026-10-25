(()=>{var We=`.sc-app {
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

/* Workflow shell: keep navigation stable while forms and conversation scroll. */
.sc-workflow {
  position: relative;
  overflow: hidden;
  min-height: 0;
  height: 100%;
}
.sc-workflow .sc-sidebar {
  width: 220px;
  padding: 18px 12px 10px;
  gap: 12px;
  overflow: auto;
}
.sc-workflow .sc-sidebar h1 {
  font-size: 19px;
  margin: 0;
}
.sc-workflow .sc-sidebar footer {
  font-size: 11px;
  padding-top: 10px;
}
.sc-project-select {
  display: grid;
  gap: 5px;
  font-size: 12px;
  color: var(--sc-muted);
}
.sc-project-select select,
.sc-node-toolbar select {
  min-width: 0;
  width: 100%;
  border: 1px solid var(--sc-line);
  border-radius: 6px;
  padding: 7px;
  background: var(--sc-paper);
}
.sc-flow-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.sc-flow-group {
  color: var(--sc-muted);
  font-size: 11px;
  padding: 9px 10px 3px;
}
.sc-flow-nav button {
  display: flex;
  align-items: center;
  gap: 9px;
  border-color: transparent;
  padding: 7px 9px;
  background: transparent;
  text-align: left;
}
.sc-flow-nav button[aria-selected="true"] {
  background: var(--sc-paper);
  border-color: var(--sc-line);
  color: var(--sc-accent);
}
.sc-step-number {
  color: var(--sc-muted);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}
.sc-step-text {
  flex: 1;
  font-size: 13px;
}
.sc-step-text small {
  display: block;
  font-size: 10px;
  color: var(--sc-muted);
  line-height: 1.2;
}
.sc-step-done {
  color: #23815c;
}
.sc-workflow .sc-main {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.sc-workflow .sc-header {
  padding: 15px 22px;
  flex-shrink: 0;
  gap: 12px;
  flex-wrap: wrap;
}
.sc-workflow .sc-header h2 {
  font-size: 16px;
}
.sc-node-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--sc-line);
  padding: 12px 22px;
  flex-shrink: 0;
  flex-wrap: wrap;
}
.sc-node-toolbar h2 {
  font-size: 18px;
  margin: 0;
}
.sc-node-toolbar select {
  width: auto;
  max-width: 220px;
}
.sc-workflow .sc-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 20px 22px 40px;
}
.sc-workflow .sc-grid {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
}
.sc-workflow .sc-unit {
  padding: 0;
  border: none;
}
.sc-workflow .sc-unit-top h3 {
  font-size: 14px;
}
.sc-node-result {
  border-top: 1px solid var(--sc-line);
  margin-top: 25px;
  padding-top: 16px;
}
.sc-node-empty {
  padding: 15px;
  margin-top: 20px;
  color: var(--sc-muted);
  background: var(--sc-soft);
  border-radius: 6px;
  font-size: 12px;
}
.sc-node-values {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  padding: 14px;
  background: var(--sc-soft);
  border-radius: 6px;
}
.sc-node-values dt {
  font-size: 12px;
  color: var(--sc-muted);
}
.sc-node-values dd {
  margin: 3px 0 0;
  font-size: 22px;
  font-variant-numeric: tabular-nums;
}
.sc-node-values dd small {
  font-size: 11px;
  margin-left: 5px;
  color: var(--sc-muted);
}
.sc-warning {
  color: #9b6500;
}
.sc-result-table {
  max-height: 400px;
  overflow: auto;
}
.sc-field-sources {
  margin-top: 20px;
  font-size: 12px;
  overflow-wrap: anywhere;
}
.sc-assistant {
  position: relative;
  flex-shrink: 0;
  border-left: 1px solid var(--sc-line);
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--sc-paper);
}
.sc-assistant > header {
  padding: 16px 88px 16px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--sc-line);
  gap: 10px;
}
.sc-assistant header small {
  display: block;
  font-size: 11px;
  color: var(--sc-muted);
}
.sc-resizer {
  position: absolute;
  top: 0;
  left: -4px;
  bottom: 0;
  width: 8px;
  cursor: col-resize;
  touch-action: none;
  z-index: 2;
}
.sc-resizer:hover,
.sc-resizer:focus-visible {
  background: #0d76fd22;
  outline: none;
}
.sc-chat-history {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 16px;
}
.sc-chat-welcome {
  color: var(--sc-muted);
  font-size: 13px;
}
.sc-chat-welcome button {
  display: block;
  margin: 8px 0;
  white-space: normal;
  width: 100%;
  text-align: left;
  font-size: 12px;
}
.sc-message {
  margin-bottom: 18px;
  font-size: 13px;
  overflow-wrap: anywhere;
}
.sc-message > small {
  display: block;
  font-size: 11px;
  color: var(--sc-muted);
  margin-bottom: 5px;
}
.sc-message > div {
  white-space: pre-wrap;
}
.sc-message-user {
  padding: 10px 12px;
  background: var(--sc-soft);
  border-radius: 7px;
}
.sc-chat-compose {
  border-top: 1px solid var(--sc-line);
  padding: 12px;
}
.sc-chat-compose textarea {
  display: block;
  width: 100%;
  min-height: 95px;
  max-height: 220px;
  resize: vertical;
  border: 1px solid var(--sc-line);
  border-radius: 7px;
  padding: 10px;
  background: var(--sc-paper);
}
.sc-chat-compose .sc-actions {
  margin-top: 9px;
  justify-content: space-between;
}
.sc-chat-sources {
  max-height: 150px;
  overflow: auto;
  font-size: 12px;
  padding: 6px 0;
}
.sc-chat-sources label {
  display: flex;
  gap: 6px;
  overflow-wrap: anywhere;
  margin: 5px 0;
}
.sc-attachments {
  max-height: 90px;
  overflow: auto;
  font-size: 11px;
}
.sc-attachments span {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  overflow-wrap: anywhere;
}
.sc-attachments button {
  padding: 0 4px;
}
.sc-proposals {
  border-top: 1px solid var(--sc-line);
  padding: 12px 0;
  font-size: 12px;
}
.sc-proposals > div {
  border: 1px solid var(--sc-line);
  border-radius: 6px;
  padding: 10px;
  margin: 8px 0;
}
.sc-proposals small {
  display: block;
  color: var(--sc-muted);
}
.sc-proposals p {
  margin: 4px 0;
  overflow-wrap: anywhere;
}
.sc-proposals button {
  margin-top: 6px;
  font-size: 12px;
}
@container capacity (max-width: 1100px) {
  .sc-workflow .sc-sidebar {
    width: 185px;
  }
  .sc-assistant {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    max-width: calc(100% - 40px);
    box-shadow: -6px 0 18px #00000010;
    z-index: 5;
  }
}
@container capacity (max-width: 700px) {
  .sc-workflow .sc-sidebar {
    display: flex;
    width: 155px;
    padding: 12px 8px;
  }
  .sc-step-text {
    font-size: 12px;
  }
  .sc-step-number {
    display: none;
  }
  .sc-workflow .sc-body,
  .sc-workflow .sc-header,
  .sc-node-toolbar {
    padding: 12px;
  }
  .sc-workflow .sc-actions {
    flex-wrap: wrap;
  }
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

/* Keep app actions clear of the host fullscreen toolbar. */
.sc-workflow .sc-header {
  padding-right: 108px;
}
.sc-workflow:has(.sc-assistant) .sc-header {
  padding-right: 22px;
}

/* Editing surface with a separate, bounded results desktop. */
.sc-center {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}
.sc-center > .sc-main {
  min-height: 180px;
}
.sc-node-figures {
  border-top: 1px solid var(--sc-line);
  margin-top: 24px;
  padding-top: 18px;
}
.sc-node-figures h3 {
  margin: 0;
}
.sc-node-figures small {
  color: var(--sc-muted);
  font-size: 11px;
}
.sc-figure-tabs {
  display: flex;
  gap: 5px;
  overflow: auto;
  border-bottom: 1px solid var(--sc-line);
  margin: 12px 0;
  padding-bottom: 6px;
}
.sc-figure-tabs button {
  white-space: nowrap;
  font-size: 12px;
  border-color: transparent;
  background: transparent;
}
.sc-figure-tabs button[aria-selected="true"] {
  color: var(--sc-accent);
  border-color: var(--sc-line);
  background: var(--sc-paper);
}
.sc-figure-tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 6px 0;
}
.sc-figure-tools button {
  padding: 3px 7px;
  font-size: 11px;
}
.sc-chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.sc-chart-legend button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: none;
}
.sc-chart-legend i {
  height: 3px;
  width: 15px;
  display: inline-block;
}
.sc-chart-legend button[aria-pressed="false"] {
  opacity: 0.4;
  text-decoration: line-through;
}
.sc-chart-svg {
  display: block;
  width: 100%;
  min-height: 180px;
}
.sc-chart-note {
  color: var(--sc-muted);
  font-size: 11px;
  margin: 5px 0;
  line-height: 1.6;
}
.sc-chart-empty {
  padding: 26px 16px;
  background: var(--sc-soft);
  color: var(--sc-muted);
  font-size: 12px;
}
.sc-chart-table {
  overflow: auto;
  max-height: 370px;
  font-size: 12px;
}
.sc-chart-table .sc-table td {
  white-space: normal;
  overflow-wrap: anywhere;
}
.sc-results-workspace {
  position: relative;
  flex-direction: column;
  flex-shrink: 0;
  min-height: 240px;
  max-height: calc(100% - 180px);
  border-top: 1px solid var(--sc-line);
  background: var(--sc-soft);
}
.sc-results-workspace.expanded {
  flex: 1;
  max-height: 100%;
}
.sc-dock-resizer {
  position: absolute;
  top: -4px;
  height: 7px;
  width: 100%;
  cursor: ns-resize;
  z-index: 3;
  touch-action: none;
}
.sc-dock-resizer:hover,
.sc-dock-resizer:focus {
  background: var(--sc-accent);
  opacity: 0.35;
}
.sc-results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding: 9px 12px;
  border-bottom: 1px solid var(--sc-line);
  background: var(--sc-paper);
}
.sc-results-header strong {
  font-size: 13px;
}
.sc-results-header small {
  margin-left: 8px;
  font-size: 11px;
  font-weight: normal;
  color: var(--sc-muted);
}
.sc-results-header button {
  font-size: 11px;
  padding: 4px 8px;
}
.sc-result-window-strip {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 6px 12px;
  overflow: auto;
  min-height: 34px;
  flex-shrink: 0;
}
.sc-result-window-strip button {
  max-width: 230px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
  padding: 2px 7px;
}
.sc-result-window-strip button[aria-pressed="false"] {
  opacity: 0.6;
}
.sc-result-window-strip span {
  font-size: 11px;
  color: var(--sc-muted);
}
.sc-result-canvas-scroll {
  flex: 1;
  overflow: auto;
  overflow-anchor: none;
  min-height: 0;
}
.sc-result-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  background: var(--sc-soft);
}
.sc-result-window {
  position: absolute;
  display: flex;
  flex-direction: column;
  min-width: 0;
  border: 1px solid #bcc9d6;
  border-radius: 5px;
  background: var(--sc-paper);
  box-shadow: 0 4px 16px #172b4d15;
  overflow: hidden;
}
.sc-result-window:focus-within {
  border-color: var(--sc-accent);
}
.sc-result-titlebar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 7px 5px 11px;
  min-height: 37px;
  border-bottom: 1px solid var(--sc-line);
  background: var(--sc-paper);
  cursor: move;
  touch-action: none;
  user-select: none;
}
.sc-result-titlebar strong {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
}
.sc-result-titlebar small {
  margin-left: 7px;
  font-size: 10px;
  font-weight: normal;
  color: var(--sc-muted);
}
.sc-result-titlebar .sc-actions {
  flex-wrap: nowrap;
  gap: 2px;
}
.sc-result-titlebar button {
  padding: 0 7px;
  height: 25px;
  min-width: 25px;
  font-size: 12px;
  border: none;
  background: transparent;
}
.sc-window-basis {
  padding: 3px 10px;
  font-size: 10px;
  color: var(--sc-muted);
  background: var(--sc-soft);
}
.sc-window-basis.outdated {
  color: #966019;
  background: #fff7e8;
}
.sc-window-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 5px 10px;
}
.sc-window-body .sc-chart-svg {
  min-height: 150px;
}
.sc-result-window footer {
  margin: 0;
  padding: 3px 25px 3px 10px;
  border-top: 1px solid var(--sc-line);
  font-size: 10px;
  color: var(--sc-muted);
}
.sc-window-resizer {
  position: absolute;
  bottom: 0;
  right: 0;
  height: 22px;
  width: 22px;
  padding: 0 !important;
  border: 0 !important;
  background: transparent !important;
  color: #8395aa;
  cursor: nwse-resize;
  touch-action: none;
}
.sc-results-workspace.expanded .sc-results-header {
  padding-right: 102px;
}
.sc-workflow:has(.sc-assistant)
  .sc-results-workspace.expanded
  .sc-results-header {
  padding-right: 12px;
}

/* A quiet application shell: one editing surface and a separate comparison dock. */
.sc-workflow {
  --sc-muted: #697586;
  --sc-line: #e3e7ed;
  --sc-accent: #1769c2;
}
.sc-workflow [hidden] {
  display: none !important;
}
.sc-icon {
  flex: 0 0 auto;
  vertical-align: middle;
}
.sc-workflow button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
}
.sc-workflow .sc-icon-button {
  padding: 5px;
  width: 28px;
  height: 28px;
  border-color: transparent;
  background: transparent;
}
.sc-workflow .sc-sidebar {
  width: 210px;
  padding: 20px 14px 12px;
  gap: 17px;
  background: #f7f8fa;
}
.sc-workflow .sc-sidebar h1 {
  font-size: 18px;
  font-weight: 650;
  letter-spacing: -0.3px;
}
.sc-workflow .sc-sidebar > div:first-child {
  padding: 0 6px;
}
.sc-workflow .sc-sidebar > div:first-child > span {
  font-size: 10px;
  letter-spacing: 0.8px;
}
.sc-workflow .sc-create {
  justify-content: flex-start;
  padding: 8px 11px;
  background: white;
  color: #344054;
  box-shadow: 0 1px 2px #172b4d04;
}
.sc-workflow .sc-project-select {
  font-size: 11px;
  padding: 0 3px;
  gap: 6px;
}
.sc-workflow .sc-project-select select {
  font-size: 12px;
  padding: 8px 6px;
  background: transparent;
}
.sc-workflow .sc-flow-group {
  padding: 12px 9px 6px;
  font-size: 10px;
  letter-spacing: 1px;
  color: #8a93a1;
}
.sc-workflow .sc-flow-nav {
  gap: 3px;
}
.sc-workflow .sc-flow-nav button {
  background: transparent;
  border: 0;
  min-height: 38px;
  padding: 7px 9px;
  border-radius: 6px;
  gap: 10px;
  justify-content: flex-start;
}
.sc-workflow .sc-flow-nav button:hover {
  background: #eceff3;
}
.sc-workflow .sc-flow-nav button[aria-selected="true"] {
  background: #e8f0fa;
  color: #175b9c;
}
.sc-workflow .sc-step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 21px;
  height: 21px;
  flex: 0 0 21px;
  font-size: 10px;
  border: 1px solid #d9e0e8;
  border-radius: 50%;
  color: #7c8795;
  background: #fff;
}
.sc-workflow .sc-flow-nav button[aria-selected="true"] .sc-step-number {
  background: #276aa9;
  border-color: #276aa9;
  color: white;
}
.sc-workflow .sc-step-text {
  font-size: 12px;
  font-weight: 500;
}
.sc-workflow .sc-step-text small {
  display: none;
  margin-top: 3px;
  font-size: 10px;
  font-weight: normal;
}
.sc-workflow .sc-flow-nav button[aria-selected="true"] small,
.sc-workflow .sc-flow-nav button[data-status="blocked"] small,
.sc-workflow .sc-flow-nav button[data-status="stale"] small {
  display: block;
}
.sc-workflow .sc-flow-nav button[data-status="blocked"] small,
.sc-workflow .sc-flow-nav button[data-status="stale"] small {
  color: #a27236;
}
.sc-workflow .sc-step-done {
  font-size: 12px;
  color: #699482;
}
.sc-workflow .sc-sidebar footer {
  padding: 12px 6px 0;
  font-size: 10px;
  line-height: 1.9;
  color: #929aa5;
}
.sc-workflow .sc-header {
  padding: 12px 24px;
  min-height: 66px;
  background: #fff;
  gap: 10px;
}
.sc-workflow .sc-header h2 {
  font-size: 14px;
  margin-bottom: 2px;
}
.sc-workflow:not(:has(.sc-assistant)) .sc-header {
  padding-right: 104px;
}
.sc-workflow .sc-header > div:first-child {
  min-width: 180px;
  flex: 1;
}
.sc-workflow .sc-header .sc-muted {
  font-size: 11px;
}
.sc-workflow .sc-header .sc-actions {
  gap: 5px;
}
.sc-workflow .sc-header button {
  padding: 5px 8px;
  border-color: transparent;
  color: #536174;
  background: transparent;
}
.sc-workflow .sc-header button:hover,
.sc-workflow .sc-header button[aria-pressed="true"] {
  background: #edf3f9;
  color: #175b9c;
}
.sc-workflow .sc-node-toolbar {
  padding: 17px 24px 8px;
  border: 0;
  gap: 10px;
  background: white;
}
.sc-workflow .sc-node-toolbar h2 {
  font-size: 21px;
  font-weight: 650;
  letter-spacing: -0.4px;
}
.sc-workflow .sc-node-toolbar small {
  font-size: 11px;
}
.sc-workflow .sc-node-toolbar select {
  font-size: 12px;
  padding: 6px 9px;
  min-width: 90px;
  background: white;
}
.sc-workflow .sc-node-toolbar .sc-primary {
  padding: 7px 13px;
}
.sc-content-tabs {
  display: flex;
  align-items: center;
  gap: 22px;
  padding: 0 24px;
  border-bottom: 1px solid var(--sc-line);
  flex-shrink: 0;
  background: white;
}
.sc-workflow .sc-content-tabs button {
  padding: 11px 0 10px;
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  border-radius: 0;
  color: var(--sc-muted);
  font-size: 12px;
}
.sc-workflow .sc-content-tabs button[aria-selected="true"] {
  color: #175b9c;
  border-bottom-color: #276aa9;
  font-weight: 600;
}
.sc-content-tabs > span {
  margin-left: auto;
  font-size: 10px;
  color: #8b95a3;
}
.sc-workflow .sc-body {
  padding: 24px 26px 30px;
  background: #fff;
}
.sc-workflow .sc-body > [role="tabpanel"],
.sc-workflow .sc-body [role="tabpanel"] {
  max-width: 1120px;
  margin: 0 auto;
}
.sc-workflow .sc-grid {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: 18px 22px;
}
.sc-workflow .sc-field {
  color: #526071;
  font-size: 12px;
  gap: 6px;
}
.sc-workflow .sc-field input,
.sc-workflow .sc-field select,
.sc-workflow .sc-field textarea {
  background: #fcfdfe;
  border-color: #d9e0e8;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 13px;
}
.sc-workflow .sc-field input:focus,
.sc-workflow .sc-field textarea:focus {
  background: #fff;
}
.sc-workflow .sc-unit-top {
  margin-bottom: 12px;
}
.sc-workflow .sc-unit-top > .sc-muted {
  font-size: 10px;
  padding: 2px 7px;
  background: #f2f5f7;
  border-radius: 4px;
}
.sc-method-context {
  font-size: 12px;
  color: #526071;
  margin-bottom: 10px;
}
.sc-method-context summary {
  cursor: pointer;
  width: fit-content;
}
.sc-method-context summary > span {
  margin-left: 12px;
  font-size: 11px;
  color: #8b95a3;
}
.sc-method-context p {
  padding: 10px 12px;
  background: #f6f8fa;
  line-height: 1.8;
}
.sc-workflow .sc-formula {
  padding: 10px 13px;
  margin: 12px 0 20px;
  border: 0;
  border-left: 2px solid #c3d5e8;
  border-radius: 0 5px 5px 0;
  background: #f6f8fb;
  color: #3c5067;
  font-size: 12px;
}
.sc-workflow .sc-note {
  background: #f7f9fb;
  font-size: 11px;
  color: #728093;
  padding: 9px 12px;
}
.sc-workflow .sc-node-figures {
  border: 0;
  padding: 0;
  margin: 0;
}
.sc-workflow .sc-node-figures .sc-section-head {
  align-items: center;
  margin-bottom: 16px;
}
.sc-workflow .sc-node-figures h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 3px;
}
.sc-workflow .sc-node-figures .sc-section-head small {
  font-size: 11px;
}
.sc-workflow .sc-open-figure {
  border-color: #d6e1ed;
  color: #336b9a;
  padding: 6px 10px;
  font-size: 11px;
}
.sc-workflow .sc-figure-tabs {
  gap: 4px;
  border: 0;
  margin: 0 0 16px;
  padding: 3px;
  background: #f3f5f8;
  border-radius: 6px;
  width: fit-content;
  max-width: 100%;
}
.sc-workflow .sc-figure-tabs button {
  padding: 6px 12px;
  border: 0;
  color: #758195;
  font-size: 11px;
}
.sc-workflow .sc-figure-tabs button[aria-selected="true"] {
  background: #fff;
  color: #254f78;
  box-shadow: 0 1px 4px #132e4b12;
  border-radius: 4px;
}
.sc-workflow .sc-node-figures > .sc-figure {
  border: 1px solid #e8edf2;
  border-radius: 8px;
  padding: 10px 16px 8px;
}
.sc-workflow .sc-figure-tools {
  padding: 2px 0 10px;
  gap: 6px;
}
.sc-workflow .sc-figure-tools .sc-actions {
  gap: 3px;
}
.sc-workflow .sc-figure-tools button {
  background: transparent;
  border-color: transparent;
  color: #6b7b8d;
  font-size: 11px;
}
.sc-workflow .sc-figure-tools button:hover {
  background: #f0f4f8;
  color: #285c8e;
}
.sc-workflow .sc-chart-legend button {
  padding: 3px 5px;
  color: #506076;
}
.sc-workflow .sc-chart-note {
  font-size: 10px;
  line-height: 1.7;
  padding-top: 7px;
  margin-top: 6px;
  color: #8a95a3;
}
.sc-workflow .sc-node-result {
  margin-top: 24px;
  padding-top: 18px;
}
.sc-workflow .sc-node-values {
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 200px), 1fr));
  padding: 0;
  gap: 12px;
  background: transparent;
  border: 0;
}
.sc-workflow .sc-node-values > div {
  padding: 14px 17px;
  border-radius: 6px;
  background: #f5f8fb;
  border: 1px solid #e6ecf2;
}
.sc-workflow .sc-node-values dd {
  font-size: 24px;
  font-weight: 600;
  color: #284c70;
}
.sc-workflow .sc-results-workspace {
  background: #f1f4f8;
  border-top-color: #ccd6e1;
}
.sc-workflow .sc-results-header {
  padding: 9px 14px;
  min-height: 44px;
  background: #f8fafc;
  border-bottom-color: #e3e9f0;
}
.sc-workflow .sc-results-header > strong {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: #3f536b;
  font-weight: 600;
}
.sc-workflow .sc-results-header small {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 19px;
  height: 18px;
  margin: 0;
  border-radius: 4px;
  background: #e7edf4;
  font-size: 10px;
  color: #64768a;
}
.sc-workflow .sc-results-header .sc-actions {
  gap: 3px;
}
.sc-workflow .sc-results-header button {
  background: transparent;
  border-color: transparent;
  padding: 4px 7px;
  color: #6b7b8d;
  font-size: 11px;
}
.sc-workflow .sc-result-window-strip {
  padding: 6px 14px;
  min-height: 32px;
  gap: 6px;
}
.sc-workflow .sc-result-window-strip button {
  border-color: transparent;
  background: transparent;
  color: #8a95a3;
  font-size: 10px;
  padding: 3px 7px;
}
.sc-workflow .sc-result-window-strip button[aria-pressed="true"] {
  background: #e3eaf3;
  color: #46617f;
}
.sc-workflow .sc-result-canvas {
  background: #f1f4f8;
}
.sc-workflow .sc-result-window {
  border: 1px solid #d4dee8;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 5px #263f5b08;
}
.sc-workflow .sc-result-window:focus-within {
  border-color: #91aec9;
  box-shadow: 0 2px 8px #263f5b10;
}
.sc-workflow .sc-result-titlebar {
  min-height: 39px;
  padding: 6px 9px 6px 13px;
  background: #fff;
  border-color: #edf1f5;
}
.sc-workflow .sc-result-titlebar strong {
  font-weight: 600;
  color: #3c526c;
}
.sc-workflow .sc-result-titlebar small {
  background: #eef3f8;
  color: #64809c;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
}
.sc-workflow .sc-result-titlebar button {
  padding: 3px;
  min-width: 22px;
  width: 22px;
  height: 22px;
  color: #95a1b0;
}
.sc-workflow .sc-result-titlebar button:hover {
  color: #3b5f83;
  background: #eef3f8;
}
.sc-workflow .sc-window-body {
  padding: 8px 13px 4px;
}
.sc-workflow .sc-result-window footer {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  padding: 5px 24px 5px 13px;
  background: #fafbfd;
  border-color: #eef2f6;
  font-size: 10px;
  color: #8a97a8;
}
.sc-result-window footer time {
  white-space: nowrap;
}
.sc-result-window footer .outdated {
  color: #aa742f;
}
.sc-workflow .sc-window-resizer {
  color: #a9b8c8;
}
.sc-workflow .sc-dock-resizer {
  height: 5px;
  top: -3px;
}
.sc-workflow .sc-dock-resizer:focus-visible {
  outline: 1px solid #84a5c8;
}
.sc-workflow .sc-assistant {
  background: #fbfcfe;
  border-color: #e1e7ef;
}
.sc-workflow .sc-assistant > header {
  padding: 18px 85px 15px 18px;
  min-height: 75px;
  background: #fff;
}
.sc-workflow .sc-assistant header strong {
  font-size: 13px;
  font-weight: 600;
}
.sc-workflow .sc-assistant header small {
  margin-top: 3px;
  font-size: 10px;
  color: #91a0b1;
}
.sc-workflow .sc-chat-history {
  padding: 22px 18px;
}
.sc-workflow .sc-chat-welcome p {
  font-size: 12px;
  line-height: 1.8;
  margin: 0 0 17px;
  color: #7d8b9d;
}
.sc-workflow .sc-chat-welcome button {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  border-color: #e3eaf2;
  color: #667c95;
  background: white;
  padding: 9px 11px;
  border-radius: 6px;
}
.sc-workflow .sc-chat-welcome button::after {
  content: "\u2197";
  color: #8da3ba;
}
.sc-workflow .sc-chat-compose {
  padding: 12px 14px 16px;
  border-top-color: #edf1f5;
}
.sc-workflow .sc-chat-compose > .sc-link {
  margin-bottom: 9px;
  font-size: 11px;
  color: #6b7f96;
}
.sc-compose-box {
  border: 1px solid #d5e0eb;
  border-radius: 10px;
  background: white;
  box-shadow: 0 2px 5px #18385804;
  padding: 2px;
}
.sc-compose-box:focus-within {
  border-color: #8eacc9;
}
.sc-workflow .sc-compose-box textarea {
  padding: 10px 11px;
  min-height: 86px;
  border: 0;
  background: transparent;
  outline: none;
  font-size: 12px;
}
.sc-workflow .sc-compose-box .sc-actions {
  padding: 3px 7px 7px;
  margin: 0;
}
.sc-workflow .sc-compose-box button {
  padding: 5px 8px;
  font-size: 11px;
  border-color: transparent;
}
.sc-workflow .sc-compose-box button:not(.sc-primary) {
  color: #728399;
}
@container capacity (max-width: 1100px) {
  .sc-workflow .sc-sidebar {
    width: 178px;
    padding: 16px 10px;
  }
  .sc-workflow .sc-header {
    padding-right: 100px;
  }
  .sc-workflow .sc-body {
    padding: 18px;
  }
}
@container capacity (max-width: 700px) {
  .sc-workflow .sc-sidebar {
    width: 148px;
    padding: 14px 8px;
  }
  .sc-workflow .sc-step-number {
    display: none;
  }
  .sc-workflow .sc-content-tabs {
    padding: 0 14px;
    gap: 15px;
  }
  .sc-content-tabs > span {
    display: none;
  }
  .sc-workflow .sc-node-toolbar {
    padding: 12px 14px 7px;
  }
  .sc-workflow .sc-header h2 {
    font-size: 12px;
  }
  .sc-workflow .sc-node-toolbar h2 {
    font-size: 18px;
  }
  .sc-result-window footer time {
    display: none;
  }
}
`;var Ue={effective_inventory:"\u6709\u6548\u5E93\u5B58",book_inventory:"\u8D26\u9762\u5E93\u5B58",inactive_inventory:"\u672A\u52A8\u7528\u5E93\u5B58",geological_swing:"\u5730\u5C42\u8C03\u5CF0\u6C14\u91CF",movable_cushion:"\u53EF\u52A8\u57AB\u6C14",working_gas:"\u5DE5\u4F5C\u6C14\u91CF",capacity:"\u4E0A\u9650\u5E93\u5BB9\u91CF",effective_capacity:"\u6709\u6548\u5E93\u5BB9\u91CF",cushion:"\u4E0B\u9650\u6C14\u91CF",deliverable_swing:"\u7EFC\u5408\u8C03\u5CF0\u80FD\u529B",peak_rate:"\u51B2\u5CF0\u80FD\u529B"},Z=s=>s!=null&&s!==""&&typeof s!="boolean"&&Number.isFinite(Number(s))?Number(s):null,B=(s,p,g,o,t={})=>({name:s,points:p.map((a,u)=>({x:Z(g(a,u)),y:Z(o(a,u)),label:a.name||a.\u72B6\u6001||""})),...t}),ae=(s,p,g,o,t,a="")=>({id:s,title:p,type:"bar",labels:g,series:o,xLabel:"",yLabel:t,note:a}),ee=(s,p,g,o,t,a="")=>({id:s,title:p,type:"line",series:g,xLabel:o,yLabel:t,note:a}),He=(s,p,g,o,t="")=>({id:s,title:p,type:"table",columns:g,rows:o,note:t}),se=(s,p)=>({name:s,points:p.map((g,o)=>({x:o,y:Z(g)}))}),fs=s=>s.type==="table"?s.rows.length:s.series.reduce((p,g)=>p+g.points.filter(o=>o.x!==null&&o.y!==null).length,0),Ve=(s,p)=>Array.isArray(s[p])?s[p].length:null;function hs({node:s,project:p,unit:g,run:o,evaluation:t,cat:a}){let u=p||{},c=g||{},x=o||{},m=x.resolved_parameters||c.parameters||{},_=x.values||{},r=x.rows||[],y=[],i=N=>{fs(N)&&y.push(N)},A=N=>Ue[N]||a?.fields?.[N]?.label||N,P=(N,d="\u6307\u6807")=>{let S=Object.entries(N).filter(([j,H])=>j in Ue&&j!=="peak_rate"&&Z(H)!==null);S.length&&i(ae("volumes",d+"\u5BF9\u6BD4",S.map(([j])=>A(j)),[se("\u6C14\u91CF",S.map(([,j])=>j))],"\u4EBF\u6807\u51C6 m\xB3","\u6307\u6807\u5BF9\u5E94\u7684\u72B6\u6001\u4E0E\u7EA6\u675F\u4E0D\u540C\uFF0C\u4E0D\u4F5C\u5806\u53E0\u6216\u76F8\u52A0\u3002")),Z(N.peak_rate)!==null&&i(ae("peak","\u51B2\u5CF0\u80FD\u529B",["\u672C\u6B21\u5DE5\u51B5"],[se("\u65E5\u91C7\u6C14\u80FD\u529B",[N.peak_rate])],"\u4E07\u6807\u51C6 m\xB3/d"))};if(s==="scope")i(He("boundary","\u8BC4\u4F30\u5355\u5143\u4E0E\u65B9\u6CD5",["\u5355\u5143","\u4E3B\u65B9\u6CD5","\u8FB9\u754C\u4F9D\u636E"],(u.units||[]).map(N=>[N.name,a?.methods?.find(d=>d.id===N.method)?.name||"\u5F85\u5224\u65AD",N.source||"\u5F85\u586B\u5199"]),"\u6309\u5C42\u7CFB\u3001\u8FDE\u901A\u533A\u6216\u72EC\u7ACB\u76D0\u7A74\u5212\u5206\uFF1B\u672C\u8868\u4E0D\u4EE3\u66FF\u5730\u8D28\u5E73\u9762\u56FE\u3002"));else if(s==="data"){let N=u.documents||[];i(ae("sources","\u8D44\u6599\u63D0\u53D6\u6982\u51B5",N.map(d=>d.name),[se("\u8868\u683C",N.map(d=>Ve(d,"tables"))),se("\u6587\u672C\u6BB5",N.map(d=>Ve(d,"pages")))],"\u6570\u91CF","\u63D0\u53D6\u6570\u91CF\u4E0D\u4EE3\u8868\u8D44\u6599\u8D28\u91CF\uFF0C\u626B\u63CF\u56FE\u7247\u4E0E\u516C\u5F0F\u4ECD\u9700\u6838\u5BF9\u539F\u4EF6\u3002"))}else if(s==="accounting"){let N=u.ledger||{},d=["initial_inventory","injected","withdrawn","metered_loss","equivalent_gas"];u.book_inventory==null&&d.every(S=>Z(N[S])!==null)&&i(ae("ledger","\u8BA1\u91CF\u6536\u652F\u5206\u9879",["\u671F\u521D\u5E93\u5B58","\u6CE8\u6C14","\u91C7\u6C14\u6263\u51CF","\u635F\u8017\u6263\u51CF","\u5F53\u91CF\u6C14\u6263\u51CF"],[se("\u8BA1\u91CF\u5206\u9879",d.map((S,j)=>(j<2?1:-1)*Number(N[S])))],"\u4EBF\u6807\u51C6 m\xB3","\u6B63\u503C\u4E3A\u589E\u52A0\uFF0C\u8D1F\u503C\u4E3A\u6263\u51CF\uFF1B\u8D26\u9762\u5E93\u5B58\u91C7\u7528\u8BA1\u91CF\u8282\u70B9\u7ED3\u679C\u3002")),P(_,"\u8D26\u9762\u5E93\u5B58")}else if(s==="pvt"){let N=[...c.pvt||[]].sort((d,S)=>Number(d.pressure)-Number(S.pressure));i(ee("pz-property","\u538B\u529B\u2014Z \u56E0\u5B50",[B("\u5B9E\u9A8C\u8868",N,d=>d.pressure,d=>d.z),B("\u72B6\u6001\u91C7\u7528\u503C",r,d=>d["\u538B\u529B MPa"],d=>d.Z,{scatter:!0})],"\u538B\u529B\uFF08MPa\uFF09","Z\uFF08\u65E0\u91CF\u7EB2\uFF09","\u53C2\u8003\u547C\u56FE\u58C1\u6C47\u62A5\u7B2C 45 \u9875\u7684\u7269\u6027\u5BF9\u7167\uFF1B\u4EC5\u663E\u793A\u540C\u6E29\u6837\u54C1\u7684\u6570\u636E\uFF0C\u4E0D\u5916\u63A8\u3002")),i(ee("bg","\u538B\u529B\u2014\u6C14\u4F53\u4F53\u79EF\u7CFB\u6570",[B("\u72B6\u6001\u6362\u7B97",r,d=>d["\u538B\u529B MPa"],d=>d["Bg \u5730\u5C42m\xB3/\u6807\u51C6m\xB3"],{scatter:!0})],"\u7EDD\u5BF9\u538B\u529B\uFF08MPa\uFF09","Bg\uFF08\u5730\u5C42 m\xB3/\u6807\u51C6 m\xB3\uFF09"))}else if(s==="pressure"){let N=r.length?r:[...(c.start_pressures||[]).map(d=>({...d,\u72B6\u6001:"\u8D77\u59CB",\u4E95:d.name,"\u539F\u59CB\u538B\u529B MPa":d.pressure})),...(c.end_pressures||[]).map(d=>({...d,\u72B6\u6001:"\u672B\u671F",\u4E95:d.name,"\u539F\u59CB\u538B\u529B MPa":d.pressure}))];i(ae("well-pressure","\u6D4B\u538B\u4E0E\u91C7\u7528\u538B\u529B",N.map(d=>`${d.\u4E95||"\u5355\u5143"}\xB7${d.\u72B6\u6001}`),[se("\u5B9E\u6D4B\u503C",N.map(d=>d["\u539F\u59CB\u538B\u529B MPa"])),se("\u5904\u7406\u540E\u91C7\u7528\u503C",N.map(d=>d["\u91C7\u7528\u538B\u529B MPa"]))],"\u538B\u529B\uFF08MPa\uFF09","\u53C2\u8003\u547C\u56FE\u58C1\u7B2C 41\u201344 \u9875\u3002\u5B9E\u6D4B\u3001\u89E3\u91CA\u4E0E\u52A0\u6743\u503C\u5206\u5F00\uFF1B\u77ED\u5173\u4E95\u503C\u4E0D\u7B49\u4E8E\u5E73\u8861\u538B\u529B\u3002")),i(ae("representative","\u5355\u5143\u4EE3\u8868\u538B\u529B",["\u8D77\u59CB","\u672B\u671F"],[se("\u4EE3\u8868\u538B\u529B",[_.injection_end_pressure,_.evaluation_pressure])],"\u538B\u529B\uFF08MPa\uFF09"))}else if(s==="connectivity"){let N=c.connectivity?.series||[];i(ee("response","\u4E95\u95F4\u540C\u6B65\u538B\u529B\u54CD\u5E94",[B("\u4E95 A",N,d=>d.time,d=>d.x),B("\u4E95 B",N,d=>d.time,d=>d.y)],"\u76F8\u5BF9\u65F6\u95F4\uFF08\u539F\u8D44\u6599\u5355\u4F4D\uFF09","\u538B\u529B\uFF08MPa\uFF09","\u53C2\u8003\u547C\u56FE\u58C1\u7B2C 16\u300141 \u9875\u3002\u65E0\u4E95\u4F4D\u5750\u6807\u548C\u7F51\u683C\u65F6\u4E0D\u7ED8\u5236\u538B\u529B\u573A\u3002")),i(ee("lag","\u6EDE\u540E\u76F8\u5173\u8BCA\u65AD",[B("\u76F8\u5173\u7CFB\u6570",r,d=>d.\u6EDE\u540E\u65F6\u95F4,d=>d.\u76F8\u5173\u7CFB\u6570)],"\u6EDE\u540E\u65F6\u95F4\uFF08\u539F\u8D44\u6599\u5355\u4F4D\uFF09","\u76F8\u5173\u7CFB\u6570","\u76F8\u5173\u6027\u4E0D\u80FD\u5355\u72EC\u8BC1\u660E\u5730\u8D28\u8FDE\u901A\uFF1B\u987B\u7ED3\u5408\u5730\u8D28\u548C\u8BD5\u4E95\u89E3\u91CA\u3002"))}else if(s==="methods")i(He("applicability","\u65B9\u6CD5\u9002\u7528\u6027\u5BF9\u7167",["\u65B9\u6CD5","\u6761\u4EF6\u68C0\u67E5"],r.map(N=>[N.\u65B9\u6CD5,N.\u9002\u7528\u68C0\u67E5]),"\u53EA\u5C55\u793A\u660E\u786E\u6761\u4EF6\uFF0C\u4E0D\u751F\u6210\u4EFB\u610F\u8BC4\u5206\u6216\u7F6E\u4FE1\u5EA6\u3002"));else if(s==="inventory"){x.plot?.length?(i(ee("material-balance","p/Z\u2014\u7D2F\u91C7\u91CF",[B("\u89C2\u6D4B",x.plot,d=>d.x,d=>d.y,{scatter:!0}),B("\u56DE\u5F52",x.plot,d=>d.x,d=>d.fitted)],"\u672C\u6BB5\u7D2F\u91C7\u91CF\uFF08\u4EBF\u6807\u51C6 m\xB3\uFF09","p/Z\uFF08MPa\uFF09","\u62DF\u5408\u6765\u81EA\u8BA1\u7B97\u8282\u70B9\uFF1B\u4E0D\u8DE8\u6CE8\u91C7\u6BB5\u8FDE\u7EBF\u3002")),i(ee("residual","\u56DE\u5F52\u6B8B\u5DEE",[B("\u89C2\u6D4B\u51CF\u62DF\u5408",x.plot,d=>d.x,d=>Z(d.y)!==null&&Z(d.fitted)!==null?d.y-d.fitted:null)],"\u672C\u6BB5\u7D2F\u91C7\u91CF\uFF08\u4EBF\u6807\u51C6 m\xB3\uFF09","\u6B8B\u5DEE\uFF08MPa\uFF09"))):Z(x.diagnostics?.start_pz)!==null&&Z(m.produced_gas)!==null&&i(ee("material-balance","\u4E24\u72B6\u6001 p/Z\u2014\u7D2F\u91C7\u91CF",[{name:"\u8BC4\u4F30\u72B6\u6001",points:[{x:0,y:x.diagnostics.start_pz,label:"\u8D77\u59CB"},{x:Number(m.produced_gas),y:Z(x.diagnostics.end_pz),label:"\u672B\u671F"}]}],"\u672C\u6BB5\u7D2F\u91C7\u91CF\uFF08\u4EBF\u6807\u51C6 m\xB3\uFF09","p/Z\uFF08MPa\uFF09","\u4E24\u70B9\u8FDE\u7EBF\u4EC5\u5C55\u793A\u4E24\u72B6\u6001\u5173\u7CFB\uFF0C\u4E0D\u4F5C\u4E3A\u591A\u70B9\u62DF\u5408\u8D28\u91CF\u8BC1\u636E\u3002")),P(_,"\u6709\u6548\u5E93\u5B58"),x.sensitivity?.rows&&i(ae("sensitivity","\u8F93\u5165\u654F\u611F\u6027",x.sensitivity.rows.map(d=>d.parameter),[se(`\u2212${x.sensitivity.percent}%`,x.sensitivity.rows.map(d=>d.minus)),se(`+${x.sensitivity.percent}%`,x.sensitivity.rows.map(d=>d.plus))],"\u6709\u6548\u5E93\u5B58\uFF08\u4EBF\u6807\u51C6 m\xB3\uFF09","\u5355\u56E0\u7D20\u6270\u52A8\uFF0C\u975E\u6982\u7387\u7F6E\u4FE1\u533A\u95F4\u3002"));let N=c.external?.history_match||[];i(ee("history-match","\u5916\u90E8\u6210\u679C\u5386\u53F2\u62DF\u5408",[B("\u89C2\u6D4B",N,(d,S)=>S+1,d=>d.observed),B("\u6A21\u62DF",N,(d,S)=>S+1,d=>d.simulated)],"\u539F\u6210\u679C\u6837\u672C\u5E8F\u53F7",c.external?.match_unit||"\u539F\u6210\u679C\u5355\u4F4D\uFF08\u5F85\u6838\u5BF9\uFF09","\u4EC5\u5C55\u793A\u5BFC\u5165\u7684\u4E13\u4E1A\u8F6F\u4EF6\u6210\u679C\uFF0C\u4E0D\u4EE3\u8868\u5DE5\u4F5C\u53F0\u8FD0\u884C\u4E86\u6A21\u62DF\u5668\u3002"))}else if(s==="window")i(ae("pressure-limits","\u8FD0\u884C\u538B\u529B\u4E0E\u8BC4\u4F30\u72B6\u6001",["\u4E0B\u9650","\u672B\u671F","\u8D77\u59CB","\u4E0A\u9650"],[se("\u538B\u529B",[m.minimum_pressure,m.evaluation_pressure,m.injection_end_pressure,m.maximum_pressure])],"\u538B\u529B\uFF08MPa\uFF09","\u538B\u529B\u987A\u5E8F\u548C\u53E3\u5F84\u4EE5\u91C7\u7528\u53C2\u6570\u4E3A\u51C6\uFF0C\u4E0D\u628A\u89C6\u5730\u5C42\u538B\u529B\u8F6C\u6362\u4E3A\u7EDD\u538B\u3002")),P(_,"\u538B\u529B\u7A97\u53E3\u6307\u6807");else if(s==="deliverability"){let N=r.filter(d=>d.\u65E5!==void 0);N.length?(i(ee("rate","\u91C7\u6C14\u80FD\u529B\u9884\u6D4B",[B("\u65E5\u5747\u91C7\u6C14\u91CF",N,d=>d.\u65E5,d=>d["\u65E5\u5747\u91CF \u4E07m\xB3/d"])],"\u91C7\u6C14\u65F6\u95F4\uFF08d\uFF09","\u4E07\u6807\u51C6 m\xB3/d","\u53C2\u8003\u547C\u56FE\u58C1\u7B2C 34 \u9875\uFF1B\u91C7\u7528\u8282\u70B9\u65E5\u6B65\u957F\u8BA1\u7B97\uFF0C\u5747\u503C\u4E0D\u7B49\u4E8E\u77AC\u65F6\u51B2\u5CF0\u80FD\u529B\u3002")),i(ee("forecast-pressure","\u91C7\u6C14\u671F\u5730\u5C42\u538B\u529B",[B("\u5730\u5C42\u538B\u529B",N,d=>d.\u65E5,d=>d["\u672B\u671F\u538B\u529B MPa"])],"\u91C7\u6C14\u65F6\u95F4\uFF08d\uFF09","\u7EDD\u5BF9\u538B\u529B\uFF08MPa\uFF09")),i(ee("cumulative","\u7D2F\u8BA1\u91C7\u6C14\u4E0E\u5269\u4F59\u5E93\u5B58",[B("\u7D2F\u8BA1\u91C7\u6C14",N,d=>d.\u65E5,d=>d["\u7D2F\u8BA1\u91C7\u6C14 \u4EBFm\xB3"]),B("\u5269\u4F59\u6709\u6548\u5E93\u5B58",N,d=>d.\u65E5,d=>d["\u5269\u4F59\u6709\u6548\u5E93\u5B58 \u4EBFm\xB3"])],"\u91C7\u6C14\u65F6\u95F4\uFF08d\uFF09","\u4EBF\u6807\u51C6 m\xB3"))):(i(ee("rate","\u5BFC\u5165\u91C7\u6C14\u9884\u6D4B",[B("\u533A\u95F4\u5E73\u5747\u65E5\u91CF",c.schedule||[],d=>d.day,d=>d.rate,{scatter:!0})],"\u533A\u95F4\u7ED3\u675F\u65E5\uFF08d\uFF09","\u4E07\u6807\u51C6 m\xB3/d","\u5404\u70B9\u662F\u533A\u95F4\u5E73\u5747\u91CF\uFF0C\u4E0D\u6309\u77AC\u65F6\u503C\u8FDE\u7EBF\u79EF\u5206\u3002")),i(ae("wells","\u5355\u4E95\u4EA7\u80FD",(x.well_results||[]).map(d=>d.name),[se("\u4EA7\u80FD",(x.well_results||[]).map(d=>d.rate))],"\u4E07\u6807\u51C6 m\xB3/d")))}else if(s==="results"||s==="report"){let N=t?.metrics||r.map(j=>({label:j.\u6307\u6807,value:j.\u503C,unit:j.\u5355\u4F4D})),d=new Map;N.forEach(j=>{let H=j.unit||"\u672A\u6CE8\u660E\u5355\u4F4D";d.has(H)||d.set(H,[]),d.get(H).push(j)}),d.forEach((j,H)=>i(ae("summary-"+H,"\u8BC4\u4F30\u6307\u6807 \xB7 "+H,j.map(D=>D.label),[se("\u672C\u6B21\u7ED3\u679C",j.map(D=>D.value))],H,"\u5404\u6307\u6807\u6309\u72B6\u6001\u5206\u522B\u89E3\u91CA\uFF1B\u4E0D\u540C\u91CF\u7EB2\u5206\u56FE\u5C55\u793A\u3002")));let S=u.history||[];i({...ee("cycles","\u591A\u5468\u671F\u5E93\u5B58\u4E0E\u8C03\u5CF0",[B("\u8D26\u9762\u5E93\u5B58",S,(j,H)=>H,j=>j.book_inventory),B("\u6709\u6548\u5E93\u5B58",S,(j,H)=>H,j=>j.effective_inventory),B("\u7EFC\u5408\u8C03\u5CF0\u80FD\u529B",S,(j,H)=>H,j=>j.deliverable_swing)],"\u8BC4\u4F30\u5468\u671F","\u4EBF\u6807\u51C6 m\xB3","\u53C2\u8003\u547C\u56FE\u58C1\u7B2C 35 \u9875\u53CA\u677F\u4E2D\u5317\u5468\u671F\u8BCA\u65AD\uFF1B\u5386\u53F2\u6210\u679C\u672A\u91CD\u65B0\u8BA1\u7B97\u3002"),labels:S.map(j=>j.cycle_id)}),s==="report"&&i(He("report-register","\u62A5\u544A\u56FE\u8868\u4E0E\u4F9D\u636E",["\u5185\u5BB9","\u672C\u6B21\u72B6\u6001"],[["\u8BC4\u4EF7\u5468\u671F",u.cycle_id||"\u672A\u586B\u5199"],["\u8BA1\u7B97\u7248\u672C",t?.engine_version||"\u8282\u70B9\u7ED3\u679C"],["\u62A5\u544A\u72B6\u6001",t?"\u5DF2\u5F62\u6210\u8BA1\u7B97\u5FEB\u7167":"\u8BF7\u8FD0\u884C\u6574\u5E93\u8BA1\u7B97"],["\u539F\u59CB\u8D44\u6599",`${(u.documents||[]).length} \u4EFD`]],"\u62A5\u544A\u4ECD\u7531\u539F\u6709\u9884\u89C8\u4E0E\u5BFC\u51FA\u5165\u53E3\u751F\u6210\uFF1B\u56FE\u8868\u53EF\u53E6\u5B58 SVG \u548C CSV\u3002"))}return y}function Be({record:s,node:p,index:g,state:o,evaluation:t,cat:a,dirty:u}){let c=o?.run,x=["scope","data","accounting","results","report"].includes(p),m=s?.case.units[g],_=c?.chart_context,r=u||o?.status==="stale",y=["results","report"].includes(p)&&t,i=!c||!r?s?.case:null,A=y?t.case:_?.project||i,P=y?null:_?.unit||(!c||!r?m:null),N=c?.status==="blocked"?null:c;return{projectId:s?.id,node:p,index:x?null:g,title:o?.name||p,scope:x?"\u5168\u9879\u76EE":_?.unit?.name||m?.name||"\u5F85\u9009\u5355\u5143",revision:s?.revision,inputHash:y?t.fingerprint:c?.input_hash,runId:y?t.run_id:c?.run_id,createdAt:y?t.created_at:c?.created_at,basis:y?"\u6574\u5E93\u8BA1\u7B97\u7ED3\u679C":c?.status==="blocked"?"\u8F93\u5165\u8D44\u6599\u9884\u89C8 \xB7 \u8282\u70B9\u672A\u901A\u8FC7":c?"\u8282\u70B9\u8BA1\u7B97\u5FEB\u7167":"\u8F93\u5165\u8D44\u6599\u9884\u89C8",stale:y?!!(u||s?.stale):!!c&&!!r,charts:hs({node:p,project:A,unit:P,run:N,evaluation:y?t:null,cat:a}),missing:c?.errors?.join("\uFF1B")||"\u5F53\u524D\u8D44\u6599\u4E0D\u8DB3\u4EE5\u7ED8\u56FE\u3002\u8865\u5145\u672C\u8282\u70B9\u6570\u636E\u5E76\u8FD0\u884C\u540E\u663E\u793A\u56FE\u8868\uFF1B\u7F3A\u6D4B\u4E0D\u4F1A\u586B\u6210\u96F6\u3002"}}function Ze(s){let p=o=>{let t=String(o??"");return'"'+(/^[=+@\-]/.test(t)&&typeof o!="number"?"'":"")+t.replaceAll('"','""')+'"'};return"\uFEFF"+(s.type==="table"?[s.columns,...s.rows]:[["\u7CFB\u5217",s.xLabel||"\u7C7B\u522B",s.yLabel||"\u503C"],...s.series.flatMap(o=>o.points.map(t=>[o.name,s.labels?.[t.x]??t.x,t.y]))]).map(o=>o.map(p).join(",")).join(`\r
`)}var Fe=window.QwenPaw.host.React,Ke={chart:"M3 3v14h14M6 12l3-4 4 2 4-6",fields:"M3 5h14M3 10h14M3 15h14M7 3v4M13 8v4M8 13v4",open:"M11 3h6v6M17 3l-8 8M8 3H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4",table:"M3 3h14v14H3zM3 8h14M8 8v9",download:"M10 3v9M6 8l4 4 4-4M3 14v3h14v-3",image:"M3 3h14v14H3zM3 13l4-4 3 3 3-5 4 6M6 6h.01",grid:"M3 3h6v6H3zM12 3h5v6h-5zM3 12h6v5H3zM12 12h5v5h-5z",layers:"M3 3h10v10H3zM7 15v2h10V7h-2",expand:"M3 8V3h5M12 3h5v5M17 12v5h-5M8 17H3v-5",collapse:"M7 3v4H3M17 7h-4V3M13 17v-4h4M3 13h4v4",close:"M5 5l10 10M15 5L5 15",minus:"M4 10h12",panel:"M3 3h14v14H3zM12 3v14",plus:"M10 4v12M4 10h12"};function V({name:s,size:p=16}){return Fe.createElement("svg",{className:"sc-icon",width:p,height:p,viewBox:"0 0 20 20",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true"},Fe.createElement("path",{d:Ke[s]||Ke.chart}))}var b=window.QwenPaw.host.React,{useState:le,useEffect:we,useRef:xe}=b,je=["#3478ad","#bf884f","#428e7b","#8875ac","#ae6576"],be=s=>Z(s)===null?"\u2014":Math.abs(s)>0&&Math.abs(s)<.001?Number(s).toExponential(2):Number(s).toLocaleString("zh-CN",{maximumFractionDigits:4}),Je=s=>JSON.parse(JSON.stringify(s));function qe(s,p,g){let o=URL.createObjectURL(new Blob([s],{type:g})),t=document.createElement("a");t.href=o,t.download=p.replace(/[<>:"/\\|?*]/g,"_"),t.click(),setTimeout(()=>URL.revokeObjectURL(o),1e3)}function Ye({chart:s,context:p,exportable:g=!0}){let o=[p?.scope,s.title].filter(Boolean).join(" \xB7 "),[t,a]=le([]),[u,c]=le("chart"),x=xe(),m=xe(),[_,r]=le({width:740,height:315});we(()=>{let k=m.current;if(!k||typeof ResizeObserver>"u")return;let v=k.closest(".sc-window-body"),$=()=>{if(!k.clientWidth)return;let G={width:Math.max(280,k.clientWidth),height:v?Math.max(180,Math.min(520,v.clientHeight-100)):315};r(T=>T.width===G.width&&T.height===G.height?T:G)};$();let L=new ResizeObserver($);return L.observe(k),v&&L.observe(v),()=>L.disconnect()},[]),we(()=>{a([]),c("chart")},[s.id]);let y=(s.series||[]).map((k,v)=>({...k,color:je[v%je.length]})).filter(k=>!t.includes(k.name)),i=y.flatMap(k=>k.points).filter(k=>Z(k.x)!==null&&Z(k.y)!==null),A=s.type==="table"||u==="table",P=s.type==="table"?s.columns:["\u7CFB\u5217",s.xLabel||"\u7C7B\u522B",s.yLabel],N=s.type==="table"?s.rows:(s.series||[]).flatMap(k=>k.points.map(v=>[k.name,s.labels?.[v.x]??be(v.x),be(v.y)])),[d,S]=le(0),j=60;we(()=>S(0),[s.id,s.rows,s.series]);let H=Math.max(1,Math.ceil(N.length/j)),D=0,X=1,E=0,n=1;if(i.length){if(D=Math.min(...i.map(v=>v.x)),X=Math.max(...i.map(v=>v.x)),E=Math.min(...i.map(v=>v.y)),n=Math.max(...i.map(v=>v.y)),s.type==="bar"&&(E=Math.min(0,E),n=Math.max(0,n)),D===X&&(D-=.5,X+=.5),E===n){let v=Math.abs(E)*.1||1;E-=v,n+=v}let k=(n-E)*.08;n+=k,s.type!=="bar"&&(E-=k)}let w=_.width,f=_.height,z=82,O=22,K=28,J=62,Y=w-z-O,de=f-K-J,ie=k=>z+(k-D)/(X-D)*Y,Q=k=>f-J-(k-E)/(n-E)*de,te=s.labels||[],ue=Y/Math.max(1,te.length),ge=Math.max(1,Math.ceil(te.length/Math.max(2,Math.floor(Y/75)))),Me=()=>{let k=x.current?.cloneNode(!0);if(!k)return;let v="http://www.w3.org/2000/svg",$=document.createElementNS(v,"svg"),L=Math.max(1,Math.floor((w-52)/200)),G=84+Math.ceil(y.length/L)*22;$.setAttribute("xmlns",v),$.setAttribute("viewBox",`0 0 ${w} ${f+G}`),$.setAttribute("width",w),$.setAttribute("height",f+G),$.style.fontFamily="Microsoft YaHei, sans-serif";let T=(me,R,fe)=>{let re=document.createElementNS(v,me);Object.entries(R).forEach(([Ee,Le])=>re.setAttribute(Ee,Le)),fe!==void 0&&(re.textContent=fe),$.appendChild(re)};T("rect",{width:w,height:f+G,fill:"white"}),T("text",{x:26,y:30,fill:"#293444","font-size":18},o),T("text",{x:26,y:51,fill:"#536278","font-size":10},[p?.basis,p?.createdAt,p?.inputHash?.slice(0,12)].filter(Boolean).join(" \xB7 ")),y.forEach((me,R)=>{let fe=26+R%L*((w-52)/L),re=77+Math.floor(R/L)*22;T("rect",{x:fe,y:re-8,width:12,height:8,fill:me.color}),T("text",{x:fe+19,y:re,fill:"#536278","font-size":12},me.name)}),k.setAttribute("y",G),k.setAttribute("width",w),k.setAttribute("height",f),$.appendChild(k),qe(new XMLSerializer().serializeToString($),o+".svg","image/svg+xml;charset=utf-8")};return b.createElement("div",{ref:m,className:"sc-figure","aria-label":s.title},b.createElement("div",{className:"sc-figure-tools"},s.type!=="table"&&b.createElement("div",{className:"sc-chart-legend"},(s.series||[]).map((k,v)=>b.createElement("button",{key:k.name,"aria-pressed":!t.includes(k.name),onClick:()=>a($=>$.includes(k.name)?$.filter(L=>L!==k.name):[...$,k.name])},b.createElement("i",{style:{background:je[v%je.length]}}),k.name))),b.createElement("div",{className:"sc-actions"},s.type!=="table"&&b.createElement("button",{onClick:()=>c(k=>k==="chart"?"table":"chart")},b.createElement(V,{name:u==="chart"?"table":"chart",size:14}),u==="chart"?"\u6570\u636E\u8868":"\u56FE\u5F62"),g&&b.createElement(b.Fragment,null,b.createElement("button",{className:"sc-icon-button","aria-label":"\u5BFC\u51FA\u6570\u636E",title:"\u5BFC\u51FA\u6570\u636E \xB7 CSV",onClick:()=>qe(Ze(s),o+".csv","text/csv;charset=utf-8")},b.createElement(V,{name:"download"})),s.type!=="table"&&b.createElement("button",{className:"sc-icon-button","aria-label":"\u4FDD\u5B58\u56FE\u5F62",title:"\u4FDD\u5B58\u56FE\u5F62 \xB7 SVG",disabled:A||!i.length,onClick:Me},b.createElement(V,{name:"image"}))))),A?b.createElement("div",{className:"sc-chart-table"},b.createElement("table",{className:"sc-table"},b.createElement("thead",null,b.createElement("tr",null,P.map((k,v)=>b.createElement("th",{key:v},k)))),b.createElement("tbody",null,N.slice(d*j,(d+1)*j).map((k,v)=>b.createElement("tr",{key:v},k.map(($,L)=>b.createElement("td",{key:L},$??"\u2014")))))),H>1&&b.createElement("div",{className:"sc-actions"},b.createElement("button",{disabled:d===0,onClick:()=>S(k=>k-1)},"\u4E0A\u4E00\u9875"),b.createElement("span",null,d+1," / ",H," \xB7 \u5171 ",N.length," \u884C"),b.createElement("button",{disabled:d>=H-1,onClick:()=>S(k=>k+1)},"\u4E0B\u4E00\u9875"))):i.length?b.createElement("svg",{ref:x,className:"sc-chart-svg",viewBox:`0 0 ${w} ${f}`,height:f,role:"img","aria-label":s.title,style:{background:"white",fontFamily:"Microsoft YaHei, sans-serif",fontSize:11,color:"#293444"}},b.createElement("title",null,s.title),b.createElement("desc",null,s.note," \u6A2A\u8F74\uFF1A",s.xLabel,"\uFF1B\u7EB5\u8F74\uFF1A",s.yLabel),b.createElement("rect",{width:w,height:f,fill:"white"}),b.createElement("text",{x:z,y:15,fill:"#536278"},s.yLabel),Array.from({length:5},(k,v)=>{let $=E+(n-E)*v/4;return b.createElement("g",{key:v},b.createElement("line",{x1:z,y1:Q($),x2:w-O,y2:Q($),stroke:"#e5eaf0"}),b.createElement("text",{x:z-9,y:Q($)+4,textAnchor:"end",fill:"#536278"},be($)))}),s.type==="bar"?te.map((k,v)=>v%ge===0&&b.createElement("text",{key:v,x:z+ue*(v+.5),y:f-J+20,textAnchor:"middle",fill:"#536278"},b.createElement("title",null,k),String(k).length>10?String(k).slice(0,9)+"\u2026":k)):Array.from({length:te.length?te.length:5},(k,v)=>{if(te.length&&v%ge)return null;let $=te.length?v:D+(X-D)*v/4;return b.createElement("text",{key:v,x:ie($),y:f-J+20,textAnchor:"middle",fill:"#536278"},te[v]||be($))}),b.createElement("line",{x1:z,y1:f-J,x2:w-O,y2:f-J,stroke:"#94a3b8"}),b.createElement("line",{x1:z,y1:K,x2:z,y2:f-J,stroke:"#94a3b8"}),E<0&&n>0&&b.createElement("line",{x1:z,y1:Q(0),x2:w-O,y2:Q(0),stroke:"#94a3b8",strokeDasharray:"4 3"}),y.map((k,v)=>b.createElement("g",{key:k.name},s.type!=="bar"&&!k.scatter&&b.createElement("path",{d:k.points.reduce(($,L)=>Z(L.x)===null||Z(L.y)===null?{path:$.path,pen:!1}:{path:$.path+`${$.pen?"L":"M"}${ie(L.x)},${Q(L.y)} `,pen:!0},{path:"",pen:!1}).path,fill:"none",stroke:k.color,strokeWidth:"2"}),k.points.map(($,L)=>Z($.x)===null||Z($.y)===null?null:s.type==="bar"?b.createElement("rect",{key:L,x:z+ue*$.x+ue*.15+v*ue*.7/y.length,y:Math.min(Q(0),Q($.y)),width:Math.max(.5,ue*.7/y.length-2),height:Math.max(.7,Math.abs(Q($.y)-Q(0))),fill:k.color},b.createElement("title",null,k.name," \xB7 ",te[$.x],"\uFF1A",be($.y)," ",s.yLabel)):b.createElement("circle",{key:L,cx:ie($.x),cy:Q($.y),r:k.scatter?4:k.points.length>150?1.5:3,fill:k.color},b.createElement("title",null,k.name," \xB7 ",$.label||be($.x),"\uFF1A",be($.y)," ",s.yLabel))))),b.createElement("text",{x:z+Y/2,y:f-10,textAnchor:"middle",fill:"#536278"},s.xLabel)):b.createElement("div",{className:"sc-chart-empty"},"\u672A\u9009\u62E9\u53EF\u663E\u793A\u7684\u6570\u636E\u7CFB\u5217\u3002"),s.note&&b.createElement("p",{className:"sc-chart-note"},s.note))}function Qe({model:s,open:p}){let[g,o]=le(0);we(()=>o(0),[s.node,s.scope]);let t=s.charts[Math.min(g,s.charts.length-1)];return b.createElement("section",{className:"sc-node-figures","aria-label":"\u8282\u70B9\u56FE\u8868"},b.createElement("div",{className:"sc-section-head"},b.createElement("div",null,b.createElement("h3",null,t?.title||"\u8282\u70B9\u56FE\u8868"),b.createElement("small",null,s.basis,s.stale?" \xB7 \u8F93\u5165\u5DF2\u6539\u53D8\uFF0C\u5F53\u524D\u663E\u793A\u65E7\u6210\u679C":"")),t&&b.createElement("button",{className:"sc-open-figure",onClick:()=>p(s,t)},b.createElement(V,{name:"open"}),"\u5728\u7ED3\u679C\u89C6\u7A97\u6253\u5F00")),t?b.createElement(b.Fragment,null,b.createElement("div",{className:"sc-figure-tabs",role:"tablist","aria-label":"\u56FE\u8868\u9009\u62E9"},s.charts.map((a,u)=>b.createElement("button",{key:a.id,role:"tab","aria-selected":t.id===a.id,onClick:()=>o(u)},a.title))),b.createElement(Ye,{key:t.id,chart:t,context:s})):b.createElement("div",{className:"sc-chart-empty"},s.missing))}function Xe(s,p){if(!s)return"";if(p.index===null)return JSON.stringify(s.case);let g=s.case;return JSON.stringify({unit:g.units[p.index],cycle:g.cycle_id,start:g.start_state,end:g.end_state,pressure:g.pressure_basis,standard:g.standard,storage:g.storage_type})}var ne=(s,p,g)=>Math.max(p,Math.min(Math.max(p,g),s));function Ge({record:s,openRequest:p,visible:g,hide:o,expanded:t,setExpanded:a}){let[u,c]=le([]),[x,m]=le(450),[_,r]=le(350),y=xe(),[i,A]=le({width:900,height:350}),P=xe(),N=xe(0),d=xe();we(()=>{if(!y.current||!g)return;let n=()=>{let f=y.current.getBoundingClientRect();f.width>0&&A({width:f.width,height:f.height})};n();let w=typeof ResizeObserver>"u"?null:new ResizeObserver(n);return w?.observe(y.current),()=>w?.disconnect()},[g,t,_,x]),we(()=>{!p||d.current===p.token||p.model.projectId!==s.id||(d.current=p.token,c(n=>{if(n.length>=12)return n;let w=++N.current;return[...n,{id:w,model:Je(p.model),chart:Je(p.chart),dependency:Xe(s,p.model),x:16+n.length%4*24,y:12+n.length%4*24,width:Math.min(600,i.width-32),height:350,z:w,minimized:!1}]}))},[p,s.id]);let S=(n,w)=>c(f=>f.map(z=>z.id===n?{...z,...w}:z)),j=n=>c(w=>w.map(f=>f.id===n?{...f,z:Math.max(0,...w.map(z=>z.z))+1}:f)),H=(n,w,f)=>{f==="move"&&n.target.closest("button")||(n.preventDefault(),n.stopPropagation(),n.currentTarget.setPointerCapture?.(n.pointerId),j(w.id),P.current={id:w.id,x:n.clientX,y:n.clientY,w,mode:f})},D=n=>{let w=P.current;if(!w)return;let f=n.clientX-w.x,z=n.clientY-w.y;if(w.mode==="panel"){m(ne(w.w.height-z,240,780));return}w.mode==="move"?S(w.id,{x:ne(w.w.x+f,0,i.width-Math.min(w.w.width,i.width)),y:ne(w.w.y+z,0,i.height-Math.min(w.w.height,i.height))}):S(w.id,{width:ne(w.w.width+f,Math.min(300,i.width),i.width-w.w.x),height:ne(w.w.height+z,220,i.height-w.w.y)})},X=()=>{y.current?.parentElement&&(y.current.parentElement.scrollTop=0);let n=u.filter(J=>!J.minimized),w=i.width>=720&&n.length>1?2:1,f=Math.max(1,Math.ceil(n.length/w)),z=y.current?.parentElement?.clientHeight||i.height,O=ne((z-12)/f-12,300,560),K=(i.width-24)/w;r(Math.max(350,Math.ceil(n.length/w)*(O+12)+12)),c(J=>J.map(Y=>{let de=n.findIndex(ie=>ie.id===Y.id);return de<0?Y:{...Y,maximized:!1,x:12+de%w*K,y:12+Math.floor(de/w)*(O+12),width:K-12,height:O}}))},E=(n,w,f=!1)=>{if(!n.key.startsWith("Arrow"))return;n.preventDefault();let z=n.shiftKey?40:10,O=n.key==="ArrowRight"?z:n.key==="ArrowLeft"?-z:0,K=n.key==="ArrowDown"?z:n.key==="ArrowUp"?-z:0;S(w.id,f?{width:ne(w.width+O,Math.min(300,i.width),i.width-w.x),height:ne(w.height+K,220,i.height-w.y)}:{x:ne(w.x+O,0,i.width-Math.min(w.width,i.width)),y:ne(w.y+K,0,i.height-Math.min(w.height,i.height))})};return b.createElement("section",{className:`sc-results-workspace${t?" expanded":""}`,style:{display:g?"flex":"none",height:t?"100%":x},"aria-label":"\u7ED3\u679C\u5DE5\u4F5C\u533A"},!t&&b.createElement("div",{role:"separator",tabIndex:0,"aria-label":"\u8C03\u6574\u7ED3\u679C\u5DE5\u4F5C\u533A\u9AD8\u5EA6","aria-orientation":"horizontal","aria-valuenow":x,"aria-valuemin":240,"aria-valuemax":780,className:"sc-dock-resizer",onPointerDown:n=>{n.currentTarget.setPointerCapture?.(n.pointerId),P.current={mode:"panel",y:n.clientY,x:n.clientX,w:{height:x}}},onPointerMove:D,onPointerUp:()=>{P.current=null},onPointerCancel:()=>{P.current=null},onKeyDown:n=>{["ArrowUp","ArrowDown"].includes(n.key)&&(n.preventDefault(),m(w=>ne(w+(n.key==="ArrowUp"?20:-20),240,780)))}}),b.createElement("header",{className:"sc-results-header"},b.createElement("strong",null,b.createElement(V,{name:"layers"}),"\u7ED3\u679C\u5DE5\u4F5C\u533A ",b.createElement("small",null,u.length)),b.createElement("div",{className:"sc-actions"},b.createElement("button",{disabled:!u.length,onClick:X},b.createElement(V,{name:"grid",size:14}),"\u5E73\u94FA"),b.createElement("button",{disabled:!u.length,onClick:()=>{y.current?.parentElement&&(y.current.parentElement.scrollTop=0),r(450),c(n=>n.map((w,f)=>({...w,maximized:!1,minimized:!1,x:12+f%5*24,y:12+f%5*24,width:Math.min(600,i.width-120),height:300})))}},b.createElement(V,{name:"layers",size:14}),"\u5C42\u53E0"),b.createElement("button",{onClick:()=>a(!t)},b.createElement(V,{name:t?"collapse":"expand",size:14}),t?"\u8FD4\u56DE\u8868\u5355\u5E03\u5C40":"\u653E\u5927\u5DE5\u4F5C\u533A"),b.createElement("button",{className:"sc-icon-button","aria-label":"\u6536\u8D77\u7ED3\u679C\u533A",title:"\u6536\u8D77\u7ED3\u679C\u533A",onClick:o},b.createElement(V,{name:"minus"})))),b.createElement("div",{className:"sc-result-window-strip"},u.map(n=>b.createElement("button",{key:n.id,"aria-pressed":!n.minimized,title:n.chart.title+" \xB7 "+n.model.scope,onClick:()=>{S(n.id,{minimized:!1}),j(n.id)}},n.chart.title," \xB7 ",n.model.scope)),!u.length&&b.createElement("span",null,"\u4ECE\u5404\u8282\u70B9\u7684\u201C\u56FE\u8868\u201D\u6253\u5F00\u89C6\u7A97\uFF0C\u53EF\u540C\u65F6\u5BF9\u7167\u4E0D\u540C\u8282\u70B9\u3001\u5355\u5143\u4E0E\u8BA1\u7B97\u7248\u672C\u3002"),u.length>=12&&b.createElement("span",null,"\u5DF2\u8FBE 12 \u4E2A\u89C6\u7A97\uFF0C\u8BF7\u5173\u95ED\u4E0D\u518D\u4F7F\u7528\u7684\u7A97\u53E3\u540E\u518D\u6253\u5F00\u3002")),b.createElement("div",{className:"sc-result-canvas-scroll"},b.createElement("div",{ref:y,className:"sc-result-canvas",style:{minHeight:_}},u.map(n=>{let w=Math.min(n.width,i.width),f=ne(n.x,0,i.width-w),z=n.model.stale||Xe(s,n.model)!==n.dependency;return b.createElement("article",{key:n.id,className:"sc-result-window","aria-label":`\u7ED3\u679C\u89C6\u7A97\uFF1A${n.chart.title} \xB7 ${n.model.scope}`,onPointerDown:()=>j(n.id),style:{display:n.minimized?"none":"flex",left:n.maximized?0:f,top:n.maximized?0:n.y,width:n.maximized?"100%":w,height:n.maximized?Math.max(350,i.height):n.height,zIndex:n.z}},b.createElement("div",{className:"sc-result-titlebar",tabIndex:0,"aria-label":`\u79FB\u52A8\u89C6\u7A97 ${n.chart.title}`,onPointerDown:O=>!n.maximized&&H(O,n,"move"),onPointerMove:D,onPointerUp:()=>{P.current=null},onPointerCancel:()=>{P.current=null},onKeyDown:O=>!n.maximized&&E(O,n)},b.createElement("strong",{title:n.chart.title+" \xB7 "+n.model.scope},n.chart.title,b.createElement("small",null,n.model.scope)),b.createElement("div",{className:"sc-actions"},b.createElement("button",{"aria-label":`\u6700\u5C0F\u5316 ${n.chart.title}`,onClick:()=>S(n.id,{minimized:!0})},b.createElement(V,{name:"minus",size:14})),b.createElement("button",{"aria-label":`${n.maximized?"\u8FD8\u539F":"\u6700\u5927\u5316"} ${n.chart.title}`,onClick:()=>S(n.id,{maximized:!n.maximized})},b.createElement(V,{name:n.maximized?"collapse":"expand",size:14})),b.createElement("button",{"aria-label":`\u5173\u95ED ${n.chart.title}`,onClick:()=>c(O=>O.filter(K=>K.id!==n.id))},b.createElement(V,{name:"close",size:14})))),b.createElement("div",{className:"sc-window-body"},b.createElement(Ye,{chart:n.chart,context:n.model})),b.createElement("footer",{title:n.model.inputHash?`\u7A97\u53E3 #${n.id} \xB7 \u8F93\u5165 ${n.model.inputHash}`:"\u8F93\u5165\u8D44\u6599\u9884\u89C8\uFF0C\u4E0D\u4F5C\u4E3A\u8BA1\u7B97\u7ED3\u8BBA"},b.createElement("span",{role:"status",className:z?"outdated":""},z?"\u5386\u53F2\u5FEB\u7167 \xB7 \u8F93\u5165\u5DF2\u6709\u53D8\u5316\uFF0C\u8BF7\u91CD\u7B97\u540E\u53E6\u5F00\u89C6\u7A97":n.model.basis),b.createElement("time",null,n.model.createdAt?new Date(n.model.createdAt).toLocaleString("zh-CN"):"\u672A\u8FD0\u884C")),!n.maximized&&b.createElement("button",{className:"sc-window-resizer","aria-label":`\u8C03\u6574\u89C6\u7A97\u5927\u5C0F ${n.chart.title}`,onPointerDown:O=>H(O,n,"resize"),onPointerMove:D,onPointerUp:()=>{P.current=null},onPointerCancel:()=>{P.current=null},onKeyDown:O=>E(O,n,!0)},"\u25E2"))}))))}var l=window.QwenPaw.host.React,{useState:_e,useRef:Te,useEffect:Re}=l,Ne=[["scope","\u8BC4\u4F30\u8303\u56F4","\u51C6\u5907"],["data","\u8D44\u6599\u6574\u7406","\u51C6\u5907"],["accounting","\u8BA1\u91CF\u4E0E\u8D26\u9762\u5E93\u5B58","\u51C6\u5907"],["pvt","\u6D41\u4F53\u4E0E PVT","\u5206\u6790"],["pressure","\u5730\u5C42\u538B\u529B","\u5206\u6790"],["connectivity","\u8FDE\u901A\u6027\u4E0E\u5355\u5143","\u5206\u6790"],["methods","\u7279\u5F81\u4E0E\u65B9\u6CD5","\u5206\u6790"],["inventory","\u6709\u6548\u5E93\u5B58","\u8BA1\u7B97"],["window","\u538B\u529B\u7A97\u53E3\u4E0E\u5E93\u5BB9","\u8BA1\u7B97"],["deliverability","\u6CE8\u91C7\u4E0E\u8C03\u5CF0\u80FD\u529B","\u8BA1\u7B97"],["results","\u6821\u9A8C\u4E0E\u7ED3\u679C\u91C7\u7528","\u6210\u679C"],["report","\u62A5\u544A\u4E0E\u5F52\u6863","\u6210\u679C"]],ts={ready:"\u53EF\u68C0\u67E5",missing:"\u5F85\u5355\u5143",calculated:"\u5DF2\u8BA1\u7B97",blocked:"\u7F3A\u8D44\u6599",review:"\u5F85\u590D\u6838",stale:"\u9700\u91CD\u7B97",not_applicable:"\u4E0D\u9002\u7528"},bs=new Set(["scope","data","accounting","results","report"]),gs={sandstone:"\u7802\u5CA9",carbonate:"\u78B3\u9178\u76D0\u5CA9",fractured:"\u88C2\u7F1D\u6027\u50A8\u5C42",salt:"\u76D0\u5CA9",auto:"\u6839\u636E\u8D44\u6599\u5224\u65AD",unknown:"\u5F85\u5224\u65AD",depleted_gas:"\u67AF\u7AED\u6C14\u85CF",depleted_oil:"\u67AF\u7AED\u6CB9\u85CF",aquifer:"\u542B\u6C34\u5C42",salt_cavern:"\u76D0\u7A74",pz:"\u4E24\u70B9 p/Z",pz_regression:"\u591A\u70B9 p/Z",volumetric:"\u4F53\u79EF\u4E0E\u538B\u529B\u7A97\u53E3",numerical:"\u6570\u503C\u6A21\u62DF\u6210\u679C\u590D\u6838",rta:"RTA \u6210\u679C\u590D\u6838"},es=s=>gs[s]||String(s),ss=s=>s==null?"\u2014":typeof s=="number"?s.toLocaleString("zh-CN",{maximumFractionDigits:6}):String(s);function ns({active:s,select:p,nodes:g,dirty:o,busy:t}){return l.createElement("nav",{className:"sc-flow-nav",role:"tablist","aria-label":"\u8BC4\u4F30\u6B65\u9AA4","aria-orientation":"vertical"},Ne.map(([a,u,c],x)=>{let m=g?.find(_=>_.id===a);return l.createElement(l.Fragment,{key:a},(!x||Ne[x-1][2]!==c)&&l.createElement("div",{className:"sc-flow-group"},c),l.createElement("button",{role:"tab","aria-selected":s===a,"data-status":o?"stale":m?.status,disabled:t,onClick:()=>p(a)},l.createElement("span",{className:"sc-step-number"},String(x+1).padStart(2,"0")),l.createElement("span",{className:"sc-step-text"},u,l.createElement("small",null,o?"\u4FEE\u6539\u5F85\u4FDD\u5B58":ts[m?.status]||"\u5F85\u5904\u7406")),m?.status==="calculated"&&!o&&l.createElement("span",{className:"sc-step-done","aria-label":"\u5DF2\u8BA1\u7B97"},"\u2713")))}))}function os({node:s,data:p,index:g,edit:o,cat:t,Field:a,Check:u,TableEditor:c}){let x=p.units[g];if(!x)return l.createElement("p",{className:"sc-note"},"\u8BF7\u5728\u8BC4\u4F30\u8303\u56F4\u4E2D\u6DFB\u52A0\u8BC4\u4F30\u5355\u5143\uFF0C\u518D\u5F00\u59CB\u6B64\u8282\u70B9\u3002");let m=i=>o({units:p.units.map((A,P)=>P===g?{...A,...i}:A)}),_=(i,A)=>m({parameters:{...x.parameters,[i]:A}}),r=(i,A,P)=>m({[i]:{...x[i],[A]:P}}),y=i=>l.createElement(a,{key:i,label:`${t.fields[i]?.label||i}\uFF08${t.fields[i]?.unit||""}\uFF09`,type:"number",value:x.parameters[i],onChange:A=>_(i,A)});return s==="pvt"?l.createElement("section",{className:"sc-section"},l.createElement("h3",null,"\u5B9E\u9A8C\u7269\u6027\u4E0E\u72B6\u6001\u53C2\u6570"),l.createElement("p",{className:"sc-muted"},"\u586B\u5199\u5B9E\u9A8C\u6216\u4E13\u4E1A\u7269\u6027\u8F6F\u4EF6\u6210\u679C\u3002\u9009\u62E9\u8868\u63D2\u503C\u540E\uFF0C\u4E0B\u6E38\u4F7F\u7528\u540C\u4E00\u6E29\u5EA6\u3001\u6837\u54C1\u7684\u8868\u5185\u8BA1\u7B97\u503C\uFF1B\u539F\u59CB\u624B\u586B\u503C\u4ECD\u4FDD\u7559\u3002"),l.createElement("div",{className:"sc-grid"},l.createElement(a,{label:"\u7269\u6027\u53D6\u503C\u65B9\u5F0F",value:x.pvt_config?.mode||"missing",options:[["missing","\u91C7\u7528\u5DF2\u586B Z\uFF0C\u7F3A\u9879\u65F6\u67E5\u8868"],["table","\u7EDF\u4E00\u4F7F\u7528\u5B9E\u9A8C\u8868\u63D2\u503C"]],onChange:i=>r("pvt_config","mode",i)}),l.createElement(a,{label:"PVT \u6837\u54C1\uFF0F\u7EC4\u5206\u7248\u672C",value:x.pvt_config?.sample,onChange:i=>r("pvt_config","sample",i)}),l.createElement(a,{label:"PVT \u8868\u6E29\u5EA6\uFF08K\uFF09",type:"number",value:x.pvt_config?.temperature,onChange:i=>r("pvt_config","temperature",i)}),y("temperature"),l.createElement(a,{label:"\u7269\u6027\u6765\u6E90\u4E0E\u9002\u7528\u8303\u56F4",value:x.pvt_config?.source,onChange:i=>r("pvt_config","source",i),wide:!0})),l.createElement(c,{title:"\u5B9E\u9A8C PVT \u8868",columns:["pressure","z"],rows:x.pvt||[],onChange:i=>m({pvt:i})}),l.createElement("div",{className:"sc-grid"},["injection_end","evaluation","minimum","maximum"].flatMap(i=>[y(i+"_pressure"),y(i+"_z")])),l.createElement("p",{className:"sc-note"},"\u8FD0\u884C\u672C\u8282\u70B9\u5F97\u5230\u5404\u72B6\u6001 Z\uFF1B\u7EDD\u538B\u3001\u7EDD\u6E29\u548C\u6807\u51C6\u72B6\u6001\u9F50\u5168\u65F6\u540C\u65F6\u8BA1\u7B97 Bg\u3002\u590D\u6742\u76F8\u6001\u4F7F\u7528\u6709\u4F9D\u636E\u7684\u5916\u90E8\u6210\u679C\u3002")):s==="pressure"?l.createElement("section",{className:"sc-section"},l.createElement("h3",null,"\u539F\u59CB\u6D4B\u538B\u3001\u89E3\u91CA\u503C\u4E0E\u91C7\u7528\u503C"),l.createElement("div",{className:"sc-grid"},l.createElement(a,{label:"\u538B\u529B\u5904\u7406\u65B9\u5F0F",value:x.pressure_config?.mode||"adopted",options:[["adopted","\u5DF2\u7EDF\u4E00\u57FA\u51C6\uFF0F\u91C7\u7528\u89E3\u91CA\u538B\u529B"],["datum","\u6309\u5DF2\u77E5\u68AF\u5EA6\u6298\u7B97\u57FA\u51C6\u6DF1\u5EA6"]],onChange:i=>r("pressure_config","mode",i)}),l.createElement(a,{label:"\u539F\u59CB\u6D4B\u538B\u57FA\u51C6",value:x.pressure_config?.reference||"declared",options:[["declared","\u6CBF\u7528\u9879\u76EE\u5DF2\u58F0\u660E\u53E3\u5F84"],["gauge","\u8868\u538B\uFF0C\u663E\u5F0F\u52A0\u5F53\u5730\u5927\u6C14\u538B"]],onChange:i=>r("pressure_config","reference",i)}),x.pressure_config?.reference==="gauge"&&l.createElement(a,{label:"\u5F53\u5730\u5927\u6C14\u538B\uFF08MPa\uFF09",type:"number",value:x.pressure_config.atmospheric_pressure,onChange:i=>r("pressure_config","atmospheric_pressure",i)}),x.pressure_config?.mode==="datum"&&l.createElement(l.Fragment,null,l.createElement(a,{label:"\u57FA\u51C6\u5782\u6DF1\uFF08m\uFF0C\u5411\u4E0B\u4E3A\u6B63\uFF09",type:"number",value:x.pressure_config.datum_depth,onChange:i=>r("pressure_config","datum_depth",i)}),l.createElement(a,{label:"\u5DF2\u77E5\u538B\u529B\u68AF\u5EA6\uFF08MPa/m\uFF09",type:"number",value:x.pressure_config.gradient,onChange:i=>r("pressure_config","gradient",i)})),l.createElement(a,{label:"\u6743\u91CD\u4F9D\u636E",value:x.pressure_weight_basis,onChange:i=>m({pressure_weight_basis:i})}),l.createElement(a,{label:"\u6D4B\u538B\u72B6\u6001\u4E0E\u6765\u6E90",value:x.pressure_source,onChange:i=>m({pressure_source:i})})),l.createElement("p",{className:"sc-note"},"\u89E3\u91CA\u538B\u529B\u586B\u5199\u540E\u987B\u6709\u9010\u4E95\u6765\u6E90\u3002\u5173\u4E95\u65F6\u957F\u4FDD\u7559\u4F5C\u4EE3\u8868\u6027\u68C0\u67E5\uFF0C\u4E0D\u81EA\u52A8\u52A0\u51CF\u5386\u53F2\u538B\u5DEE\u3002"),["start_pressures","end_pressures"].map((i,A)=>l.createElement(c,{key:i,title:A?"\u672B\u671F\u72B6\u6001\u6D4B\u538B":"\u8D77\u59CB\u72B6\u6001\u6D4B\u538B",columns:["name","pressure","interpreted_pressure","weight","depth","shut_in_days","source"],rows:x[i]||[],onChange:P=>m({[i]:P})})),l.createElement("details",null,l.createElement("summary",null,"\u76F4\u63A5\u91C7\u7528\u4EE3\u8868\u538B\u529B"),l.createElement("div",{className:"sc-grid"},y("injection_end_pressure"),y("evaluation_pressure")),l.createElement("p",null,"\u6709\u6D4B\u538B\u8BB0\u5F55\u65F6\u6309\u8BB0\u5F55\u5904\u7406\u5E76\u52A0\u6743\uFF0C\u7ED3\u679C\u4F20\u9012\u81F3\u5E93\u5B58\u8282\u70B9\u3002"))):s==="connectivity"?l.createElement("section",{className:"sc-section"},l.createElement("h3",null,"\u4E95\u95F4\u54CD\u5E94\u4E0E\u8BC4\u4EF7\u8FB9\u754C"),p.storage_type==="salt_cavern"?l.createElement("p",{className:"sc-note"},"\u76D0\u7A74\u6309\u72EC\u7ACB\u8154\u4F53\u8BC4\u4EF7\uFF0C\u672C\u8282\u70B9\u6807\u8BB0\u4E0D\u9002\u7528\u3002\u8154\u4F53\u51C0\u5BB9\u79EF\u5728\u538B\u529B\u7A97\u53E3\u8282\u70B9\u5F55\u5165\u3002"):l.createElement(l.Fragment,null,l.createElement(a,{label:"\u4E95\u5BF9\u3001\u89C2\u6D4B\u65F6\u6BB5\u4E0E\u8D44\u6599\u6765\u6E90",value:x.connectivity?.source,onChange:i=>r("connectivity","source",i),wide:!0}),l.createElement("div",{className:"sc-grid"},l.createElement(a,{label:"\u6700\u5927\u6EDE\u540E\u70B9\u6570",type:"number",value:x.connectivity?.max_lag??2,onChange:i=>r("connectivity","max_lag",i)}),l.createElement(u,{label:"\u5148\u5BF9\u538B\u529B\u5E8F\u5217\u4F5C\u4E00\u9636\u5DEE\u5206",value:x.connectivity?.difference!==!1,onChange:i=>r("connectivity","difference",i)})),l.createElement(c,{title:"\u540C\u6B65\u538B\u529B\u54CD\u5E94",columns:["time","x","y"],rows:x.connectivity?.series||[],onChange:i=>r("connectivity","series",i)}),l.createElement(a,{label:"\u5730\u8D28\u3001\u8BD5\u4E95\u8BC1\u636E\u4E0E\u5206\u533A\u89E3\u91CA",type:"textarea",value:x.connectivity?.interpretation,onChange:i=>r("connectivity","interpretation",i),wide:!0}),l.createElement("p",{className:"sc-note"},"\u9700\u8981\u81F3\u5C115\u4E2A\u7B49\u95F4\u9694\u540C\u6B65\u89C2\u6D4B\u70B9\u3002\u76F8\u5173\u6027\u548C\u6EDE\u540E\u53EA\u4F5C\u54CD\u5E94\u8BC1\u636E\uFF0C\u5206\u533A\u987B\u7ED3\u5408\u5730\u8D28\u3001\u8BD5\u4E95\u4E0E\u8BA1\u91CF\u8FB9\u754C\u3002")),l.createElement(a,{label:"\u672C\u5355\u5143\u8303\u56F4\u4E0E\u53C2\u6570\u6765\u6E90",value:x.source,onChange:i=>m({source:i}),wide:!0}),l.createElement(u,{label:"\u5404\u5355\u5143\u8303\u56F4\u4E0D\u91CD\u53E0\uFF0C\u6C14\u91CF\u91C7\u7528\u4E00\u81F4\u6807\u51C6\u72B6\u6001\u548C\u65F6\u95F4\u8FB9\u754C",value:p.non_overlapping,onChange:i=>o({non_overlapping:i})})):null}function is({result:s,dirty:p,cat:g,onMethod:o}){if(!s?.run)return l.createElement("div",{className:"sc-node-empty"},"\u586B\u5199\u672C\u8282\u70B9\u6240\u9700\u8D44\u6599\u540E\uFF0C\u70B9\u51FB\u201C\u8FD0\u884C\u672C\u8282\u70B9\u201D\u3002\u5176\u4ED6\u8282\u70B9\u7F3A\u9879\u4E0D\u4F1A\u963B\u6B62\u672C\u8282\u70B9\u8FD0\u884C\u3002");let t=s.run,a=p||s.status==="stale",u=t.rows||[],c=Array.from(new Set(u.flatMap(m=>Object.keys(m)))),x={...Object.fromEntries((g?.terms||[]).map(m=>[m.key,m.name])),...Object.fromEntries(Object.entries(g?.fields||{}).map(([m,_])=>[m,_.label])),response_correlation:"\u54CD\u5E94\u76F8\u5173\u7CFB\u6570",response_lag:"\u54CD\u5E94\u6EDE\u540E\u65F6\u95F4",effective_capacity:"\u6709\u6548\u5E93\u5BB9\u91CF",cushion:"\u4E0B\u9650\u6C14\u91CF"};return l.createElement("section",{className:"sc-node-result","aria-label":"\u8282\u70B9\u8BA1\u7B97\u7ED3\u679C"},l.createElement("div",{className:"sc-section-head"},l.createElement("h3",null,"\u672C\u8282\u70B9\u7ED3\u679C"),l.createElement("span",{className:a?"sc-warning":"sc-muted"},a?"\u8F93\u5165\u5DF2\u6539\u53D8\uFF0C\u9700\u91CD\u7B97":ts[t.status])),t.errors?.map((m,_)=>l.createElement("p",{className:"sc-alert",key:_},m)),!!Object.keys(t.values||{}).length&&l.createElement("dl",{className:"sc-node-values"},Object.entries(t.values).map(([m,_])=>l.createElement("div",{key:m},l.createElement("dt",null,x[m]||m),l.createElement("dd",null,ss(_),l.createElement("small",null,g?.fields?.[m]?.unit||(m.endsWith("_inventory")||["geological_swing","working_gas","capacity","effective_capacity","movable_cushion","deliverable_swing","cushion"].includes(m)?"\u4EBFm\xB3":m==="peak_rate"?"\u4E07m\xB3/d":"")))))),t.recommendation&&l.createElement("div",{className:"sc-note"},"\u63A8\u8350\uFF1A",g.methods.find(m=>m.id===t.recommendation.method)?.name,"\u3002",t.recommendation.reason,l.createElement("button",{disabled:a,onClick:()=>o(t.recommendation.method)},"\u91C7\u7528\u63A8\u8350\u65B9\u6CD5")),t.steps?.map((m,_)=>l.createElement("p",{key:_},m)),t.warnings?.map((m,_)=>l.createElement("p",{key:_,className:"sc-muted"},m)),u.length>0&&l.createElement("details",{open:u.length<20},l.createElement("summary",null,"\u660E\u7EC6\u8BB0\u5F55\uFF08",u.length,"\uFF09"),l.createElement("div",{className:"sc-table-wrap sc-result-table"},l.createElement("table",{className:"sc-table"},l.createElement("thead",null,l.createElement("tr",null,c.map(m=>l.createElement("th",{key:m},m)))),l.createElement("tbody",null,u.map((m,_)=>l.createElement("tr",{key:_},c.map(r=>l.createElement("td",{key:r},ss(m[r]))))))))),l.createElement("small",{className:"sc-muted"},"\u8BA1\u7B97\u65F6\u95F4 ",t.created_at?.replace("T"," ").slice(0,19)," UTC \xB7 \u8F93\u5165\u7248\u672C"," ",t.input_hash?.slice(0,12)))}function xs(){try{return Math.max(280,Math.min(640,Number(localStorage.getItem("sc-assistant-width"))||350))}catch{return 350}}function as({record:s,node:p,index:g,busy:o,send:t,upload:a,adopt:u,undo:c,hidden:x,close:m,cat:_}){let[r,y]=_e(xs),[i,A]=_e(""),[P,N]=_e([]),[d,S]=_e([]),[j,H]=_e(!1),D=Te(),X=Te(),E=Te(null);if(Re(()=>{X.current?.scrollIntoView?.({block:"nearest"})},[s?.messages?.length,o]),Re(()=>{A(""),N([]),S([])},[s?.id]),!s||x)return null;let n=(s.proposals||[]).filter(f=>f.status==="pending"),w=f=>{let z=f.split(".").at(-1);return _?.fields?.[z]?.label||{storage_type:"\u5EFA\u5E93\u7C7B\u578B",method:"\u4E3B\u8BC4\u4F30\u65B9\u6CD5",rock_type:"\u5CA9\u6027",new_unit:"\u65B0\u5EFA\u5355\u5143",pressure_representative:"\u538B\u529B\u4EE3\u8868\u6027",water_drive:"\u6C34\u4F53\u5F71\u54CD"}[z]||f};return l.createElement("aside",{className:"sc-assistant",style:{width:r},"aria-label":"\u8BC4\u4F30\u52A9\u624B"},l.createElement("div",{className:"sc-resizer",role:"separator",tabIndex:0,"aria-label":"\u8C03\u6574\u8BC4\u4F30\u52A9\u624B\u5BBD\u5EA6","aria-orientation":"vertical","aria-valuemin":280,"aria-valuemax":640,"aria-valuenow":r,onPointerDown:f=>{E.current={x:f.clientX,width:r},f.currentTarget.setPointerCapture?.(f.pointerId)},onPointerMove:f=>{E.current&&y(Math.max(280,Math.min(640,E.current.width+E.current.x-f.clientX)))},onPointerUp:()=>{E.current=null;try{localStorage.setItem("sc-assistant-width",String(r))}catch{}},onPointerCancel:()=>{E.current=null},onKeyDown:f=>{if(["ArrowLeft","ArrowRight"].includes(f.key)){f.preventDefault();let z=Math.max(280,Math.min(640,r+(f.key==="ArrowLeft"?20:-20)));y(z);try{localStorage.setItem("sc-assistant-width",String(z))}catch{}}}}),l.createElement("header",null,l.createElement("div",null,l.createElement("strong",null,"\u8BC4\u4F30\u52A9\u624B"),l.createElement("small",null,Ne.find(f=>f[0]===p)?.[1],!bs.has(p)&&` \xB7 ${s.case.units[g]?.name||"\u5F85\u9009\u5355\u5143"}`)),l.createElement("button",{className:"sc-icon-button",onClick:m,"aria-label":"\u6536\u8D77\u8BC4\u4F30\u52A9\u624B",title:"\u6536\u8D77\u8BC4\u4F30\u52A9\u624B"},l.createElement(V,{name:"panel"}))),l.createElement("div",{className:"sc-chat-history","aria-live":"polite"},!s.messages?.length&&l.createElement("div",{className:"sc-chat-welcome"},l.createElement("p",null,"\u53EF\u4EE5\u4E0A\u4F20\u8D44\u6599\uFF0C\u6216\u544A\u8BC9\u6211\u9700\u8981\u586B\u5199\u3001\u6838\u5BF9\u7684\u5185\u5BB9\u3002"),l.createElement("button",{disabled:o,onClick:()=>A("\u68C0\u67E5\u5F53\u524D\u8282\u70B9\u8FD8\u7F3A\u54EA\u4E9B\u8D44\u6599\uFF0C\u5E76\u8BF4\u660E\u53D6\u503C\u4F9D\u636E\u3002")},"\u68C0\u67E5\u5F53\u524D\u8282\u70B9\u7F3A\u9879"),l.createElement("button",{disabled:o,onClick:()=>A("\u6839\u636E\u5DF2\u6709\u8D44\u6599\u5224\u65AD\u5EFA\u5E93\u7C7B\u578B\u3001\u5CA9\u6027\u4E0E\u65B9\u6CD5\uFF0C\u5217\u51FA\u4F9D\u636E\u548C\u5F85\u786E\u8BA4\u9879\u3002")},"\u5224\u65AD\u7C7B\u578B\u4E0E\u65B9\u6CD5")),(s.messages||[]).map((f,z)=>l.createElement("article",{key:z,className:`sc-message sc-message-${f.role}`},l.createElement("small",null,f.role==="user"?"\u4F60":"\u8BC4\u4F30\u52A9\u624B"),f.role==="assistant"&&(f.applied>0||f.pending>0)?l.createElement(l.Fragment,null,l.createElement("div",null,f.applied>0?`\u5DF2\u586B\u5199 ${f.applied} \u9879\u6570\u636E\u3002`:"\u5DF2\u6574\u7406\u5019\u9009\u53D6\u503C\uFF0C\u8BF7\u6838\u5BF9\u6765\u6E90\u540E\u91C7\u7528\u3002"),l.createElement("details",null,l.createElement("summary",null,"\u67E5\u770B\u8D44\u6599\u8BC6\u522B\u8BF4\u660E"),l.createElement("div",null,f.text))):l.createElement("div",null,f.text),f.applied>0&&l.createElement("small",null,"\u5DF2\u586B\u5199 ",f.applied," \u9879\uFF0C\u76F8\u5173\u7ED3\u679C\u9700\u66F4\u65B0"),f.pending>0&&l.createElement("small",null,"\u6709 ",f.pending," \u9879\u5019\u9009\uFF0C\u89C1\u4E0B\u65B9"),f.rejected?.map((O,K)=>l.createElement("small",{key:K,className:"sc-warning"},"\u672A\u91C7\u7528\uFF1A",O)))),n.length>0&&l.createElement("section",{className:"sc-proposals"},l.createElement("strong",null,"\u5019\u9009\u53D6\u503C\uFF08",n.length,"\uFF09"),n.map(f=>l.createElement("div",{key:f.id},l.createElement("b",null,w(f.path)),l.createElement("p",null,typeof f.value=="object"?`${f.value.length} \u6761\u8BB0\u5F55`:es(f.value)),f.previous!=null&&l.createElement("small",null,"\u539F\u503C\uFF1A",typeof f.previous=="object"?"\u5DF2\u6709\u8BB0\u5F55":es(f.previous)),l.createElement("small",null,f.reason),l.createElement("details",null,l.createElement("summary",null,"\u67E5\u770B\u6765\u6E90"),l.createElement("p",null,f.source.location,"\uFF1A",f.source.quote)),l.createElement("button",{disabled:o,onClick:()=>u([f.id])},"\u91C7\u7528\u6B64\u9879"))),l.createElement("button",{disabled:o,onClick:()=>u(n.map(f=>f.id))},"\u91C7\u7528\u4EE5\u4E0A\u5019\u9009")),s.last_edit&&l.createElement("button",{className:"sc-link",disabled:o,onClick:c},"\u64A4\u9500\u6700\u8FD1\u4E00\u6B21\u5BF9\u8BDD\u586B\u8868"),o&&l.createElement("p",{className:"sc-muted",role:"status"},"\u6B63\u5728\u5904\u7406\uFF0C\u8BF7\u7A0D\u5019\u2026"),l.createElement("div",{ref:X})),l.createElement("div",{className:"sc-chat-compose"},l.createElement("button",{className:"sc-link",onClick:()=>H(f=>!f)},"\u53C2\u8003\u9879\u76EE\u8D44\u6599\uFF08",d.length,"\uFF09"),j&&l.createElement("div",{className:"sc-chat-sources"},s.case.documents?.map(f=>l.createElement("label",{key:f.id},l.createElement("input",{type:"checkbox",disabled:o,checked:d.includes(f.id),onChange:z=>S(O=>z.target.checked?[...O,f.id].slice(0,20):O.filter(K=>K!==f.id))}),f.name)),!s.case.documents?.length&&l.createElement("small",null,"\u53EF\u4ECE\u4E0B\u65B9\u4E0A\u4F20\u8D44\u6599\u3002")),P.length>0&&l.createElement("div",{className:"sc-attachments"},P.map((f,z)=>l.createElement("span",{key:z},f.name,l.createElement("button",{disabled:o,onClick:()=>N(O=>O.filter((K,J)=>J!==z)),"aria-label":`\u79FB\u9664\u9644\u4EF6${f.name}`},"\xD7")))),l.createElement("div",{className:"sc-compose-box"},l.createElement("textarea",{"aria-label":"\u4E0E\u8BC4\u4F30\u52A9\u624B\u5BF9\u8BDD",placeholder:"\u63CF\u8FF0\u95EE\u9898\u3001\u586B\u5199\u6570\u503C\uFF0C\u6216\u9644\u4E0A\u8D44\u6599\u2026",value:i,disabled:o,onChange:f=>A(f.target.value),onKeyDown:f=>{f.key==="Enter"&&(f.ctrlKey||f.metaKey)&&(f.preventDefault(),f.currentTarget.parentElement.querySelector("button.sc-primary")?.click())}}),l.createElement("div",{className:"sc-actions"},l.createElement("button",{disabled:o,onClick:()=>D.current.click()},l.createElement(V,{name:"plus"}),"\u6DFB\u52A0\u6587\u4EF6"),l.createElement("input",{ref:D,hidden:!0,type:"file",multiple:!0,"aria-label":"\u5BF9\u8BDD\u6295\u5582\u8D44\u6599",accept:".xlsx,.csv,.tsv,.json,.pptx,.pdf,.docx,.txt,.md",onChange:f=>{N(z=>[...z,...Array.from(f.target.files)].slice(0,20)),f.target.value=""}}),l.createElement("button",{className:"sc-primary",disabled:o||!i.trim()&&!P.length,onClick:async()=>{await t(i.trim()||"\u8BFB\u53D6\u672C\u6B21\u9644\u4EF6\uFF0C\u5C06\u672C\u5468\u671F\u6709\u660E\u786E\u4F9D\u636E\u7684\u6570\u636E\u586B\u5165\u5BF9\u5E94\u8868\u5355\uFF0C\u7C7B\u578B\u548C\u65B9\u6CD5\u7ED9\u51FA\u5019\u9009\u3002",P,d)&&(A(""),N([]))}},"\u53D1\u9001")))))}var Se=window.QwenPaw,e=Se.host.React,{useState:W,useEffect:ze,useRef:Pe,useId:ws}=e,vs="/storage-capacity",Ae=document.createElement("style");Ae.id="storage-capacity-styles";Ae.textContent=We;document.getElementById(Ae.id)?.remove();document.head.appendChild(Ae);var Ce=s=>JSON.parse(JSON.stringify(s));function ys(s,p){if(s?.schema_version!==2||!Array.isArray(s.units))throw Error("\u8BF7\u4F7F\u7528\u7B2C 2 \u7248\u8BC4\u4F30\u6570\u636E\u683C\u5F0F");let g={...s,documents:s.documents||[],history:s.history||[],benchmarks:s.benchmarks||[]};for(let o of["standard","design","ledger","sources"]){if(s[o]!==void 0&&(!s[o]||Array.isArray(s[o])||typeof s[o]!="object"))throw Error(`${o} \u683C\u5F0F\u65E0\u6548`);g[o]=s[o]||{}}return g.units=s.units.map(o=>{if(!o||typeof o!="object"||Array.isArray(o))throw Error("\u5355\u5143\u683C\u5F0F\u65E0\u6548");let t={...Ce(p),...o};for(let a of["parameters","conditions","external","evidence"]){if(o[a]!==void 0&&(!o[a]||Array.isArray(o[a])||typeof o[a]!="object"))throw Error(`${a} \u683C\u5F0F\u65E0\u6548`);t[a]={...p[a],...o[a]}}for(let a of["series","pvt","wells","schedule","start_pressures","end_pressures"])if(t[a]=o[a]||[],!Array.isArray(t[a]))throw Error(`${a} \u683C\u5F0F\u65E0\u6548`);return t}),g}var pe=(s,p="POST")=>({method:p,headers:{"Content-Type":"application/json"},body:JSON.stringify(s)});async function F(s,p,g=!1){let o=await Se.host.fetch(vs+s,p);if(!o.ok){let t=await o.json().catch(()=>({}));throw Error(typeof t.detail=="string"?t.detail:`\u64CD\u4F5C\u672A\u5B8C\u6210\uFF08${o.status}\uFF09`)}return g?o:o.json()}async function rs(s,p){let g=await F(s,void 0,!0),o=URL.createObjectURL(await g.blob()),t=document.createElement("a");t.href=o,t.download=p,document.body.appendChild(t),t.click(),t.remove(),setTimeout(()=>URL.revokeObjectURL(o),1e3)}var oe=s=>s==null||s===""?"\u672A\u8BA1\u7B97":Number(s).toLocaleString("zh-CN",{maximumFractionDigits:4}),De={name:"\u5355\u5143\uFF0F\u4E95\u540D",weight:"\u6743\u91CD",source:"\u6765\u6E90",interpreted_pressure:"\u89E3\u91CA\u538B\u529B\uFF08MPa\uFF09",depth:"\u6D4B\u70B9\u5782\u6DF1\uFF08m\uFF09",shut_in_days:"\u5173\u4E95\u5929\u6570",time:"\u76F8\u5BF9\u65F6\u95F4",x:"\u4E95 A \u538B\u529B\uFF08MPa\uFF09",y:"\u4E95 B \u538B\u529B\uFF08MPa\uFF09",pressure:"\u538B\u529B\uFF08MPa\uFF09",z:"Z \u56E0\u5B50",cumulative_produced:"\u672C\u6BB5\u7D2F\u91C7\u91CF\uFF08\u4EBFm\xB3\uFF09",phase:"\u9636\u6BB5 withdrawal",day:"\u533A\u95F4\u7ED3\u675F\u65E5",rate:"\u533A\u95F4\u5E73\u5747\u65E5\u91CF\uFF08\u4E07m\xB3/d\uFF09",a:"\u7CFB\u6570 A",b:"\u7CFB\u6570 B",reservoir_pressure:"\u5730\u5C42\u7EDD\u538B\uFF08MPa\uFF09",bottomhole_pressure:"\u4E95\u5E95\u7EDD\u538B\uFF08MPa\uFF09",observed:"\u89C2\u6D4B\u503C",simulated:"\u6A21\u62DF\u503C",cycle_id:"\u5468\u671F",book_inventory:"\u8D26\u9762\u5E93\u5B58",effective_inventory:"\u6709\u6548\u5E93\u5B58",geological_swing:"\u5730\u5C42\u8C03\u5CF0\u6C14\u91CF",deliverable_swing:"\u7EFC\u5408\u8C03\u5CF0\u80FD\u529B",peak_rate:"\u51B2\u5CF0\u80FD\u529B"};function M({label:s,value:p,onChange:g,type:o="text",options:t,help:a,wide:u=!1,disabled:c=!1}){let x=ws();return e.createElement("label",{className:"sc-field"+(u?" sc-span":""),htmlFor:x},e.createElement("span",null,s),t?e.createElement("select",{id:x,value:p??"",onChange:m=>g(m.target.value),disabled:c},t.map(m=>e.createElement("option",{key:m.value??m[0],value:m.value??m[0]},m.label??m[1]))):o==="textarea"?e.createElement("textarea",{id:x,value:p??"",onChange:m=>g(m.target.value),disabled:c}):e.createElement("input",{id:x,type:o,step:o==="number"?"any":void 0,value:p??"",onChange:m=>g(o==="number"?m.target.value===""?null:Number(m.target.value):m.target.value),disabled:c}),a&&e.createElement("small",null,a))}function ce({label:s,value:p,onChange:g}){return e.createElement("label",{className:"sc-check"},e.createElement("input",{type:"checkbox",checked:!!p,onChange:o=>g(o.target.checked)}),s)}function ve({title:s,columns:p,rows:g,onChange:o}){return e.createElement("div",null,e.createElement("div",{className:"sc-section-head"},e.createElement("h4",null,s),e.createElement("button",{onClick:()=>o([...g,{}])},"\u6DFB\u52A0\u8BB0\u5F55")),g.length>0&&e.createElement("div",{className:"sc-table-wrap"},e.createElement("table",{className:"sc-table"},e.createElement("thead",null,e.createElement("tr",null,p.map(t=>e.createElement("th",{key:t},De[t]||t)),e.createElement("th",null))),e.createElement("tbody",null,g.map((t,a)=>e.createElement("tr",{key:a},p.map(u=>e.createElement("td",{key:u},e.createElement("input",{"aria-label":`${s} \u7B2C${a+1}\u884C ${De[u]||u}`,type:["name","cycle_id","phase","source"].includes(u)?"text":"number",step:"any",value:t[u]??"",onChange:c=>o(g.map((x,m)=>m===a?{...x,[u]:["name","cycle_id","phase","source"].includes(u)?c.target.value:c.target.value===""?null:Number(c.target.value)}:x))}))),e.createElement("td",null,e.createElement("button",{className:"sc-link",onClick:()=>o(g.filter((u,c)=>a!==c)),"aria-label":`\u5220\u9664${s}\u7B2C${a+1}\u884C`},"\u79FB\u9664"))))))))}function ks({points:s,xlabel:p="\u7D2F\u91C7\u91CF\uFF08\u4EBFm\xB3\uFF09",ylabel:g="p/Z\uFF08MPa\uFF09"}){if(s.length<2)return null;let o=720,t=230,a=s.map(i=>i.x),u=s.flatMap(i=>[i.y,i.fitted??i.y]),c=Math.min(...a),x=Math.max(...a),m=Math.min(...u),_=Math.max(...u),r=i=>58+(i-c)/(x-c||1)*630,y=i=>180-(i-m)/(_-m||1)*145;return e.createElement("svg",{className:"sc-chart",viewBox:`0 0 ${o} ${t}`,role:"img","aria-label":`${p}\u4E0E${g}\u5173\u7CFB\u66F2\u7EBF`},e.createElement("path",{d:"M58 25V180H690",fill:"none",stroke:"#adb6c3"}),[0,.5,1].map(i=>e.createElement("g",{key:i},e.createElement("text",{x:"48",y:y(m+i*(_-m))+4,textAnchor:"end"},oe(m+i*(_-m))),e.createElement("text",{x:r(c+i*(x-c)),y:"200",textAnchor:"middle"},oe(c+i*(x-c))))),e.createElement("polyline",{points:s.map(i=>`${r(i.x)},${y(i.fitted??i.y)}`).join(" "),stroke:"#0d76fd",strokeWidth:"1.5",fill:"none"}),s.map((i,A)=>e.createElement("circle",{key:A,cx:r(i.x),cy:y(i.y),r:"3",fill:"#0d76fd"})),e.createElement("text",{x:"70",y:"17"},g),e.createElement("text",{x:"380",y:"224",textAnchor:"middle"},p))}function _s({doc:s,cat:p,record:g,apply:o,run:t}){let[a,u]=W(s.tables[0]?.id||""),[c,x]=W("units"),[m,_]=W(1),[r,y]=W(s.tables[0]?.rows.length||1),[i,A]=W({}),[P,N]=W({}),[d,S]=W(0),[j,H]=W([]),D=s.tables.find(n=>n.id===a),X=D?.rows[m-1]||[],E=()=>t(async()=>{let n=await F(`/cases/${g.id}/documents/${s.id}/map`,pe({table_id:a,kind:c,start_row:m,end_row:r,mapping:i,factors:P}));H(n.errors),n.errors.length||o(c,n.records,Number(d))});return e.createElement("div",{className:"sc-source"},e.createElement("div",{className:"sc-section-head"},e.createElement("h3",null,s.name),e.createElement("button",{onClick:()=>t(()=>rs(`/cases/${g.id}/documents/${s.id}/original`,s.name))},"\u4E0B\u8F7D\u539F\u4EF6")),s.warnings.map((n,w)=>e.createElement("p",{key:w,className:"sc-note"},n)),s.case_candidate&&e.createElement("div",{className:"sc-note"},"\u5305\u542B\u5B8C\u6574\u8BC4\u4F30\u53C2\u6570\u3002\u5BFC\u5165\u5C06\u66FF\u6362\u5F53\u524D\u586B\u5199\u5185\u5BB9\uFF0C\u539F\u59CB\u8D44\u6599\u4FDD\u7559\u3002",e.createElement("button",{onClick:()=>o("case",s.case_candidate)},"\u91C7\u7528\u8BE5\u8BC4\u4F30\u53C2\u6570")),D&&e.createElement(e.Fragment,null,e.createElement("div",{className:"sc-grid"},e.createElement(M,{label:"\u5DE5\u4F5C\u8868\uFF0F\u8868\u683C",value:a,options:s.tables.map(n=>[n.id,n.label]),onChange:n=>{u(n),y(s.tables.find(w=>w.id===n).rows.length),A({})}}),e.createElement(M,{label:"\u8868\u5934\u884C\u53F7",type:"number",value:m,onChange:n=>{_(Math.max(1,n||1)),A({})}}),e.createElement(M,{label:"\u6570\u636E\u7ED3\u675F\u884C\u53F7\uFF08\u542B\uFF09",type:"number",value:r,onChange:y})),e.createElement("div",{className:"sc-table-wrap"},e.createElement("table",{className:"sc-table"},e.createElement("tbody",null,D.rows.slice(Math.max(0,m-1),Math.min(r,m+11)).map((n,w)=>e.createElement("tr",{key:w},e.createElement("th",null,m+w),n.map((f,z)=>e.createElement("td",{key:z},String(f??"")))))))),e.createElement("p",{className:"sc-muted"},"\u9884\u89C8\u524D 12 \u884C\uFF1B\u6620\u5C04\u4F7F\u7528\u6240\u9009\u5B8C\u6574\u884C\u8303\u56F4\u3002\u8868\u5934\u4E4B\u540E\u4E3A\u6570\u636E\u884C\u3002\u5408\u5E76\u8868\u683C\u9700\u9009\u62E9\u542B\u5B57\u6BB5\u540D\u79F0\u7684\u884C\u3002"),e.createElement("div",{className:"sc-grid"},e.createElement(M,{label:"\u8D44\u6599\u7528\u9014",value:c,onChange:n=>{x(n),A({}),N({})},options:Object.keys(p.mapping_fields).map(n=>[n,{units:"\u5206\u5355\u5143\u53C2\u6570",series:"p/Z \u91C7\u6C14\u5E8F\u5217",pvt:"\u538B\u529B\u4E0E Z \u56E0\u5B50\u8868",wells:"\u4E8C\u9879\u5F0F\u4EA7\u80FD\u53C2\u6570",schedule:"\u91C7\u6C14\u9884\u6D4B\u66F2\u7EBF",history:"\u591A\u5468\u671F\u6210\u679C",history_match:"\u5386\u53F2\u62DF\u5408\u6570\u636E"}[n]])}),!["units","history"].includes(c)&&e.createElement(M,{label:"\u5E94\u7528\u5230\u8BC4\u4F30\u5355\u5143",value:d,onChange:S,options:g.case.units.map((n,w)=>[w,n.name])})),e.createElement("details",{open:!0},e.createElement("summary",null,"\u5B57\u6BB5\u5BF9\u5E94\u4E0E\u5355\u4F4D\u6362\u7B97"),e.createElement("div",{className:"sc-map-grid"},p.mapping_fields[c].map(n=>e.createElement("div",{className:"sc-map-field",key:n},e.createElement(M,{label:p.fields[n]?.label||De[n]||n,value:i[n]??"",options:[["","\u4E0D\u5BFC\u5165"],...X.map((w,f)=>[f,`\u7B2C ${f+1} \u5217 \xB7 ${String(w??"\u7A7A")}`])],onChange:w=>A(f=>{let z={...f};return w===""?delete z[n]:z[n]=Number(w),z})}),e.createElement(M,{label:"\u4E58\u6570",value:P[n]??1,options:[[1,"\xD71"],[1e-4,"\u4E07\u2192\u4EBF"],[1e-8,"m\xB3\u2192\u4EBF"],[.001,"kPa\u2192MPa"],[.01,"bar\u2192MPa"],[1e4,"\u4E07\u2192m\xB3"],[1e8,"\u4EBF\u2192m\xB3"]],onChange:w=>N({...P,[n]:Number(w)})})))),e.createElement("p",{className:"sc-note"},"\u76EE\u6807\u6C14\u91CF\u5355\u4F4D\u4E3A\u4EBF\u6807\u51C6 m\xB3\u3001\u538B\u529B\u4E3A MPa\u3002\u6C34\u4FB5\u548C\u8154\u4F53\u4F53\u79EF\u4E3A m\xB3\uFF0C\u4EA7\u80FD\u6D41\u91CF\u4E3A\u4E07 m\xB3/d\u3002\u6807\u51C6\u72B6\u6001\u4E0E\u538B\u529B\u57FA\u51C6\u9700\u5728\u8BC4\u4F30\u8303\u56F4\u4E2D\u5355\u72EC\u6838\u5BF9\u3002"),e.createElement("button",{className:"sc-primary",onClick:E,disabled:!Object.keys(i).length||!["units","history"].includes(c)&&!g.case.units.length},"\u5BFC\u5165\u6240\u9009\u5B57\u6BB5"),j.map((n,w)=>e.createElement("p",{className:"sc-error",key:w},n)))),s.pages.length>0&&e.createElement("details",{open:!D},e.createElement("summary",null,"\u63D0\u53D6\u7684\u539F\u6587\uFF08",s.pages.length," \u6BB5\uFF09"),s.pages.map((n,w)=>e.createElement("details",{key:w},e.createElement("summary",null,n.label),e.createElement("pre",null,n.text||"\u672A\u53D6\u5F97\u6587\u5B57\uFF0C\u8BF7\u67E5\u770B\u539F\u4EF6")))))}function Ns({data:s,edit:p,cat:g}){return e.createElement("section",null,e.createElement("div",{className:"sc-section"},e.createElement("h3",null,"\u50A8\u6C14\u5E93\u4E0E\u8BC4\u4F30\u8FB9\u754C"),e.createElement("div",{className:"sc-grid"},e.createElement(M,{label:"\u50A8\u6C14\u5E93\uFF0F\u9879\u76EE\u540D\u79F0",value:s.case_name,onChange:o=>p({case_name:o})}),e.createElement(M,{label:"\u8BC4\u4F30\u5468\u671F",value:s.cycle_id,onChange:o=>p({cycle_id:o}),help:"\u4F8B\u5982 2025\u20132026\uFF0C\u4E0D\u80FD\u7528\u6587\u4EF6\u4E0A\u4F20\u65F6\u95F4\u4EE3\u66FF"}),e.createElement(M,{label:"\u8BC4\u4F30\u4EFB\u52A1",value:s.purpose,options:[["cycle","\u5468\u671F\u8BC4\u4F30"],["calibration","\u9636\u6BB5\u6807\u5B9A"],["design_review","\u8BBE\u8BA1\u590D\u6838"],["forecast","\u5269\u4F59\u80FD\u529B\u9884\u6D4B"]],onChange:o=>p({purpose:o})}),e.createElement(M,{label:"\u5EFA\u5E93\u7C7B\u578B",value:s.storage_type,options:[["auto","\u6839\u636E\u8D44\u6599\u5224\u65AD"],...g.storage_types.map(o=>[o.value,o.label])],onChange:o=>p({storage_type:o})}),e.createElement(M,{label:"\u5CA9\u6027",value:s.rock_type,options:[["auto","\u6839\u636E\u8D44\u6599\u5224\u65AD"],["sandstone","\u7802\u5CA9"],["carbonate","\u78B3\u9178\u76D0\u5CA9"],["fractured","\u88C2\u7F1D\uFF0F\u6D1E\u7A74"],["salt","\u76D0\u5CA9"],["other","\u5176\u4ED6"]],onChange:o=>p({rock_type:o})}),e.createElement(M,{label:"\u50A8\u96C6\u7A7A\u95F4",value:s.reservoir_medium||"auto",options:[["auto","\u6839\u636E\u8D44\u6599\u5224\u65AD"],["pore","\u5B54\u9699\u578B"],["fracture","\u88C2\u7F1D\u578B"],["cavity","\u5B54\u6D1E\u578B"],["mixed","\u590D\u5408\u578B"],["cavern","\u4EBA\u5DE5\u8154\u4F53"]],onChange:o=>p({reservoir_medium:o})}),e.createElement(M,{label:"\u8FD0\u884C\u9636\u6BB5",value:s.operating_stage||"auto",options:[["auto","\u6839\u636E\u8D44\u6599\u5224\u65AD"],["development","\u6269\u5BB9\u8FBE\u4EA7"],["stable","\u7A33\u5B9A\u8FD0\u884C"],["changed","\u4E95\u7F51\u6216\u5DE5\u827A\u8C03\u6574\u540E"]],onChange:o=>p({operating_stage:o})}),e.createElement(M,{label:"\u65B0\u5355\u5143\u65B9\u6CD5\u504F\u597D",value:s.method_preference||"auto",options:[["auto","\u6839\u636E\u8D44\u6599\u63A8\u8350"],...g.methods.map(o=>[o.id,o.name])],onChange:o=>p({method_preference:o})}),e.createElement(M,{label:"\u538B\u529B\u53E3\u5F84",value:s.pressure_basis,options:[["","\u8BF7\u9009\u62E9"],["absolute","\u7EDD\u5BF9\u538B\u529B"],["apparent_formation","\u89C6\u5730\u5C42\u538B\u529B"],["report_defined","\u62A5\u544A\u5B9A\u4E49\u53E3\u5F84"]],onChange:o=>p({pressure_basis:o})}),e.createElement(M,{label:"\u91C7\u6C14\u6BB5\u8D77\u59CB\u72B6\u6001",value:s.start_state,onChange:o=>p({start_state:o}),help:"\u65E5\u671F\u6216\u660E\u786E\u7684\u72B6\u6001\u7F16\u53F7"}),e.createElement(M,{label:"\u91C7\u6C14\u6BB5\u672B\u671F\u72B6\u6001",value:s.end_state,onChange:o=>p({end_state:o})}))),e.createElement("div",{className:"sc-section"},e.createElement("h3",null,"\u6807\u51C6\u72B6\u6001\u4E0E\u8BA1\u91CF\u8FB9\u754C"),e.createElement(M,{label:"\u6C14\u91CF\u53E3\u5F84\u786E\u8BA4\u65B9\u5F0F",value:s.standard.mode||"verified",options:[["verified","\u6309\u8BA1\u91CF\u6587\u4EF6\u786E\u8BA4\u6807\u51C6\u6E29\u538B"],["reported","\u6CBF\u7528\u540C\u4E00\u62A5\u544A\u6C14\u91CF\u53E3\u5F84\uFF0C\u6807\u51C6\u6E29\u538B\u5F85\u6838\u5B9E"]],onChange:o=>p({standard:{...s.standard,mode:o}}),help:"\u62A5\u544A\u53E3\u5F84\u4EC5\u652F\u6301\u7269\u8D28\u5E73\u8861\u7684\u6761\u4EF6\u590D\u7B97\uFF1B\u72B6\u6001\u65B9\u7A0B\u548C\u8DE8\u6765\u6E90\u6C14\u91CF\u6BD4\u8F83\u5FC5\u987B\u6838\u5B9E\u6807\u51C6\u6E29\u538B\u3002"}),e.createElement("div",{className:"sc-grid"},[["temperature","\u6807\u51C6\u6E29\u5EA6\uFF08K\uFF09"],["pressure","\u6807\u51C6\u7EDD\u538B\uFF08MPa\uFF09"],["z","\u6807\u51C6\u72B6\u6001 Z \u56E0\u5B50"]].map(([o,t])=>e.createElement(M,{key:o,label:t,type:"number",value:s.standard[o],onChange:a=>p({standard:{...s.standard,[o]:a}})})),e.createElement(M,{label:"\u6807\u51C6\u72B6\u6001\u4F9D\u636E",value:s.standard.source,onChange:o=>p({standard:{...s.standard,source:o}}),wide:!0,help:"\u6309\u8BA1\u91CF\u6587\u4EF6\u586B\u5199\uFF1B\u6E29\u6807\u3001\u4F53\u79EF\u57FA\u51C6\u6216\u7EC4\u5206\u4E0D\u540C\u7684\u8D44\u6599\u5148\u6362\u7B97\u518D\u6BD4\u8F83"}))),e.createElement("div",{className:"sc-section"},e.createElement("div",{className:"sc-section-head"},e.createElement("h3",null,"\u8BC4\u4F30\u5355\u5143"),e.createElement("button",{onClick:()=>p({units:[...s.units,{...Ce(g.unit_template),name:`\u8BC4\u4F30\u5355\u5143 ${s.units.length+1}`,method:s.method_preference||"auto"}]})},"\u6DFB\u52A0\u5355\u5143")),e.createElement("p",{className:"sc-muted"},"\u6309\u5C42\u7CFB\u3001\u8FDE\u901A\u533A\u3001\u4E95\u63A7\u8303\u56F4\u6216\u72EC\u7ACB\u76D0\u7A74\u5212\u5206\u3002\u4E00\u4E2A\u5355\u5143\u53EF\u91C7\u7528\u4E00\u79CD\u4E3B\u65B9\u6CD5\uFF0C\u5176\u4ED6\u6210\u679C\u7528\u4E8E\u4EA4\u53C9\u6BD4\u8F83\u3002"),s.units.map((o,t)=>e.createElement("div",{key:t,className:"sc-unit"},e.createElement("div",{className:"sc-grid"},e.createElement(M,{label:`\u5355\u5143 ${t+1} \u540D\u79F0`,value:o.name,onChange:a=>p({units:s.units.map((u,c)=>c===t?{...u,name:a}:u)})}),e.createElement(M,{label:"\u8303\u56F4\u4E0E\u53C2\u6570\u6765\u6E90",value:o.source,onChange:a=>p({units:s.units.map((u,c)=>c===t?{...u,source:a}:u)})}),e.createElement("button",{onClick:()=>p({units:s.units.filter((a,u)=>u!==t)})},"\u79FB\u9664\u5355\u5143")))),s.units.length===0&&e.createElement("p",{className:"sc-note"},"\u5148\u6DFB\u52A0\u4E00\u4E2A\u8BC4\u4F30\u5355\u5143\uFF0C\u6216\u5728\u8D44\u6599\u9875\u5BFC\u5165\u5206\u5355\u5143\u53C2\u6570\u8868\u3002"),s.units.length>1&&e.createElement(ce,{label:"\u5404\u5355\u5143\u8303\u56F4\u4E0D\u91CD\u53E0\uFF0C\u6C14\u91CF\u91C7\u7528\u4E00\u81F4\u6807\u51C6\u72B6\u6001\u548C\u65F6\u95F4\u8FB9\u754C",value:s.non_overlapping,onChange:o=>p({non_overlapping:o})})),e.createElement("details",null,e.createElement("summary",null,"\u6807\u51C6\u4E0E\u672F\u8BED"),e.createElement("div",{className:"sc-help"},g.standards.map(o=>e.createElement("p",{key:o.id},e.createElement("strong",null,o.id," ",o.name),e.createElement("br",null),o.basis,o.url&&e.createElement(e.Fragment,null," ",e.createElement("a",{href:o.url,target:"_blank",rel:"noreferrer"},"\u6807\u51C6\u76EE\u5F55")))),g.terms.map(o=>e.createElement("p",{key:o.key},e.createElement("strong",null,o.name),"\u3000",o.definition)))))}function zs({data:s,edit:p}){let[g,o]=W(Object.keys(s.ledger||{}).length?"ledger":"direct");return e.createElement("div",{className:"sc-section"},e.createElement("h3",null,"\u5168\u5E93\u8BA1\u91CF\u4E0E\u8BBE\u8BA1\u6307\u6807"),e.createElement("div",{className:"sc-grid"},e.createElement(M,{label:"\u8D26\u9762\u5E93\u5B58\u6765\u6E90",value:g,options:[["direct","\u76F4\u63A5\u5F55\u5165\u5DF2\u6838\u5B9E\u503C"],["ledger","\u4ECE\u8BA1\u91CF\u5E73\u8861\u8BA1\u7B97"]],onChange:t=>{o(t),p({book_inventory:null,ledger:{}})}}),g==="direct"?e.createElement(e.Fragment,null,e.createElement(M,{label:"\u8D77\u59CB\u72B6\u6001\u8D26\u9762\u5E93\u5B58\uFF08\u4EBFm\xB3\uFF09",value:s.book_inventory,type:"number",onChange:t=>p({book_inventory:t})}),e.createElement(M,{label:"\u8D26\u9762\u5E93\u5B58\u4F9D\u636E",value:s.sources?.book_inventory,onChange:t=>p({sources:{...s.sources,book_inventory:t}})})):e.createElement(e.Fragment,null,[["initial_inventory","\u671F\u521D\u5E93\u5B58"],["injected","\u7D2F\u8BA1\u6CE8\u6C14"],["withdrawn","\u7D2F\u8BA1\u91C7\u6C14"],["metered_loss","\u5DF2\u6838\u5B9E\u635F\u8017"],["equivalent_gas","\u6DB2\u4F53\u5F53\u91CF\u6C14\u91C7\u51FA\u91CF"]].map(([t,a])=>e.createElement(M,{key:t,label:a+"\uFF08\u4EBFm\xB3\uFF09",value:s.ledger?.[t],type:"number",onChange:u=>p({ledger:{...s.ledger,[t]:u}})})),e.createElement(M,{label:"\u8BA1\u91CF\u533A\u95F4\u4E0E\u6765\u6E90",value:s.ledger?.source,onChange:t=>p({ledger:{...s.ledger,source:t}}),wide:!0})),e.createElement(M,{label:"\u8BBE\u8BA1\u5E93\u5BB9\u91CF\uFF08\u4EBFm\xB3\uFF09",value:s.design.capacity,type:"number",onChange:t=>p({design:{...s.design,capacity:t}})}),e.createElement(M,{label:"\u8BBE\u8BA1\u5DE5\u4F5C\u6C14\u91CF\uFF08\u4EBFm\xB3\uFF09",value:s.design.working_gas,type:"number",onChange:t=>p({design:{...s.design,working_gas:t}})}),e.createElement(M,{label:"\u8BBE\u8BA1\u51B2\u5CF0\u80FD\u529B\uFF08\u4E07m\xB3/d\uFF09",value:s.design.peak_rate,type:"number",onChange:t=>p({design:{...s.design,peak_rate:t}})}),e.createElement(M,{label:"\u8BBE\u8BA1\u4F9D\u636E",value:s.design.source,onChange:t=>p({design:{...s.design,source:t}}),wide:!0})),e.createElement("p",{className:"sc-note"},"\u8BA1\u91CF\u5E73\u8861\u5E94\u7ED3\u675F\u4E8E\u672C\u6B21\u91C7\u6C14\u6BB5\u8D77\u59CB\u72B6\u6001\u3002\u635F\u8017\u3001\u6DB2\u4F53\u5F53\u91CF\u6C14\u9700\u663E\u5F0F\u586B\u5199\u6838\u5B9E\u503C\u6216\u96F6\uFF1B\u5B83\u4EEC\u4E0E\u672A\u52A8\u7528\u5E93\u5B58\u5206\u5F00\u8BA1\u7B97\u3002"))}function Cs({data:s,edit:p,cat:g,stage:o="inventory"}){let t=(a,u)=>p({units:s.units.map((c,x)=>a===x?{...c,...u}:c)});return e.createElement("section",null,!s.units.length&&e.createElement("p",{className:"sc-note"},"\u8BF7\u5148\u5728\u8BC4\u4F30\u8303\u56F4\u4E2D\u6DFB\u52A0\u5355\u5143\u3002"),s.units.map((a,u)=>{let c=g.methods.find(r=>r.id===a.method)||{name:"\u5F85\u9009\u65B9\u6CD5",mode:"calculation",fields:[],required:[],condition:"\u8FD0\u884C\u65B9\u6CD5\u8282\u70B9\u67E5\u770B\u63A8\u8350\u53CA\u9002\u7528\u6027\uFF1B\u8D44\u6599\u4E0D\u8DB3\u65F6\u4FDD\u7559\u5F85\u5224\u3002",formula:"",reference:""},x=(r,y)=>t(u,{conditions:{...a.conditions,[r]:y}}),m=(r,y)=>t(u,{parameters:{...a.parameters,[r]:y},evidence:{...a.evidence,...a.evidence?.[r]?{[r]:{...a.evidence[r],edited:!0,location:"\u624B\u5DE5\u4FEE\u6539\uFF1B\u539F\u59CB\u5B9A\u4F4D\uFF1A"+(a.evidence[r].original_location||a.evidence[r].location),original_location:a.evidence[r].original_location||a.evidence[r].location}}:{}}}),_=(r,y)=>t(u,{external:{...a.external,[r]:y}});return e.createElement("div",{className:"sc-unit",key:u},e.createElement("div",{className:"sc-unit-top"},e.createElement("h3",null,a.name),e.createElement("span",{className:"sc-muted"},c.mode==="external"?"\u771F\u5B9E\u5916\u90E8\u6210\u679C\u590D\u6838":"\u786E\u5B9A\u6027\u8BA1\u7B97")),o==="methods"&&e.createElement(e.Fragment,null,e.createElement("div",{className:"sc-grid"},e.createElement(M,{label:"\u4E3B\u8BC4\u4F30\u65B9\u6CD5",value:a.method,options:[["auto","\u6839\u636E\u8D44\u6599\u63A8\u8350"],...g.methods.map(r=>[r.id,r.name])],onChange:r=>t(u,{method:r})}),e.createElement(M,{label:"\u6C34\u4F53\u5F71\u54CD",value:a.conditions.water_drive,options:[["unknown","\u5C1A\u672A\u5224\u65AD"],["none","\u65E0\u6C34\u4FB5"],["weak","\u5F31\u6C34\u4FB5\uFF0C\u5DF2\u8BBA\u8BC1\u53EF\u5FFD\u7565"],["moderate","\u4E2D\u7B49\u6C34\u4FB5"],["strong","\u5F3A\u6C34\u4FB5"]],onChange:r=>x("water_drive",r)}),e.createElement(M,{label:"\u6D41\u4F53\u4E0E\u76F8\u6001",value:a.conditions.fluid,options:[["unknown","\u5C1A\u672A\u5224\u65AD"],["dry_gas","\u5E72\u6C14\uFF0C\u6C14\u76F8\u4E3A\u4E3B"],["stable_gas","\u6CB9\u73AF\uFF0F\u51DD\u6790\u5F71\u54CD\u5DF2\u8BBA\u8BC1\u53EF\u5FFD\u7565"],["oil","\u6CB9\u73AF\u6216\u6CB9\u6C14\u6C34\u4F20\u8D28\u663E\u8457"],["condensate","\u51DD\u6790\u5F71\u54CD\u663E\u8457"]],onChange:r=>x("fluid",r)}),e.createElement(M,{label:"\u4E95\u95F4\u5E72\u6270",value:a.conditions.interference,options:[["unknown","\u5C1A\u672A\u5224\u65AD"],["none","\u65E0\u660E\u663E\u5E72\u6270"],["weak","\u5F31\u5E72\u6270\u3001\u4E95\u63A7\u8303\u56F4\u4E0D\u91CD\u53E0"],["strong","\u5F3A\u5E72\u6270"]],onChange:r=>x("interference",r)}),e.createElement(M,{label:"\u53C2\u6570\u4E0E\u9002\u7528\u6027\u4F9D\u636E",value:a.source,onChange:r=>t(u,{source:r}),wide:!0}),e.createElement(M,{label:"\u9002\u7528\u6761\u4EF6\u786E\u8BA4\u65B9\u5F0F",value:a.condition_basis||"verified",options:[["verified","\u7ECF\u8D44\u6599\u6838\u67E5\u786E\u8BA4"],["reported","\u6CBF\u7528\u539F\u62A5\u544A\u524D\u63D0\uFF0C\u4F5C\u6761\u4EF6\u590D\u7B97"]],onChange:r=>t(u,{condition_basis:r})})),e.createElement(ce,{label:"\u5DF2\u6838\u5B9E\u672C\u5355\u5143\u538B\u529B\uFF0F\u4F53\u79EF\u7684\u4EE3\u8868\u6027\u3001\u5355\u5143\u8FB9\u754C\u53CA\u53D6\u503C\u4F9D\u636E",value:a.conditions.pressure_representative,onChange:r=>x("pressure_representative",r)}),["pz","pz_regression","water_mbe"].includes(a.method)&&e.createElement(ce,{label:"\u672C\u6BB5\u5185\u65E0\u540C\u671F\u6CE8\u6C14\uFF0C\u5B54\u9699\u4F53\u79EF\u53EF\u8FD1\u4F3C\u4E0D\u53D8\uFF1B\u4E24\u72B6\u6001\u538B\u529B\u4F7F\u7528\u76F8\u540C\u53E3\u5F84",value:a.conditions.closed_during_segment,onChange:r=>x("closed_during_segment",r)}),a.method==="water_mbe"&&e.createElement(ce,{label:"\u6C34\u4FB5\u91CF\u3001\u4EA7\u6C34\u91CF\u4E0E\u6C34\u4F53\u79EF\u7CFB\u6570\u5DF2\u6709\u72EC\u7ACB\u6838\u5B9E\u4F9D\u636E",value:a.conditions.water_volume_verified,onChange:r=>x("water_volume_verified",r)})),e.createElement("details",{className:"sc-method-context"},e.createElement("summary",null,c.name,e.createElement("span",null,"\u9002\u7528\u6761\u4EF6\u4E0E\u4F9D\u636E")),e.createElement("p",null,c.condition,e.createElement("br",null),c.reference)),e.createElement("div",{className:"sc-formula"},c.formula),["inventory","window"].includes(o)&&e.createElement("div",{className:"sc-grid"},c.fields.filter(r=>o==="window"||!r.startsWith("minimum")&&!r.startsWith("maximum")).map(r=>e.createElement(M,{key:r,label:`${g.fields[r].label}\uFF08${g.fields[r].unit}\uFF09${c.required.includes(r)?" *":""}`,type:"number",value:a.parameters[r],onChange:y=>m(r,y)}))),o==="inventory"&&a.method==="pz_regression"&&e.createElement(ve,{title:"\u540C\u4E00\u91C7\u6C14\u6BB5 p/Z \u5E8F\u5217",columns:["cumulative_produced","pressure","z"],rows:a.series||[],onChange:r=>t(u,{series:r})}),["inventory","window","deliverability"].includes(o)&&c.mode==="external"&&e.createElement(e.Fragment,null,e.createElement("div",{className:"sc-grid"},[["software","\u89E3\u91CA\uFF0F\u6A21\u62DF\u8F6F\u4EF6"],["model_version","\u6A21\u578B\u7248\u672C"],["run_id","\u8FD0\u884C\u7F16\u53F7"],["input_reference","\u8F93\u5165\u7248\u672C\uFF0F\u6821\u9A8C\u6458\u8981"],["source","\u6210\u679C\u6587\u4EF6\u4E0E\u4F4D\u7F6E"],["cycle_id","\u6210\u679C\u5468\u671F"],["state","\u6210\u679C\u8D77\u59CB\u72B6\u6001"],["match_metric","\u5386\u53F2\u62DF\u5408\u6307\u6807"],["match_unit","\u62DF\u5408\u6307\u6807\u5355\u4F4D"]].map(([r,y])=>e.createElement(M,{key:r,label:y,value:a.external?.[r],onChange:i=>_(r,i)})),["effective_inventory","geological_swing","deliverable_swing","movable_cushion","capacity","working_gas"].map(r=>e.createElement(M,{key:r,label:(g.terms.find(y=>y.key===r)?.name||r)+"\uFF08\u4EBFm\xB3\uFF09",value:a.external?.[r],type:"number",onChange:y=>_(r,y)}))),e.createElement(ce,{label:"\u5916\u90E8\u6C14\u91CF\u5DF2\u6362\u7B97\u4E3A\u4EBF\u6807\u51C6 m\xB3\uFF0C\u4E14\u6807\u51C6\u72B6\u6001\u4E0E\u5F53\u524D\u8BC4\u4F30\u4E00\u81F4",value:a.external?.gas_volume_unit==="1e8_sm3"&&JSON.stringify(a.external?.standard)===JSON.stringify(s.standard),onChange:r=>t(u,{external:{...a.external,gas_volume_unit:r?"1e8_sm3":"",standard:r?Ce(s.standard):null}})}),e.createElement(ve,{title:"\u5386\u53F2\u62DF\u5408\u8BB0\u5F55",columns:["observed","simulated"],rows:a.external?.history_match||[],onChange:r=>_("history_match",r)})),o==="inventory"&&a.method==="pz"&&e.createElement("details",null,e.createElement("summary",null,"\u8F93\u5165\u654F\u611F\u6027"),e.createElement(M,{label:"\u5355\u56E0\u7D20\u6270\u52A8\u5E45\u5EA6\uFF08%\uFF0C\u4E0D\u5927\u4E8E 10\uFF09",type:"number",value:a.sensitivity_percent,onChange:r=>t(u,{sensitivity_percent:r})}),e.createElement("p",{className:"sc-muted"},"\u9010\u9879\u6270\u52A8\u91C7\u6C14\u91CF\u3001\u538B\u529B\u548C Z\uFF0C\u663E\u793A\u7ED3\u679C\u53D8\u5316\uFF1B\u4E0D\u4F5C\u4E3A\u6982\u7387\u7F6E\u4FE1\u533A\u95F4\u3002")),o==="deliverability"&&e.createElement("details",{open:!0},e.createElement("summary",null,"\u7EFC\u5408\u8C03\u5CF0\u4E0E\u51B2\u5CF0\u7EA6\u675F"),e.createElement(M,{label:"\u9884\u6D4B\u65B9\u5F0F",value:a.forecast?.mode||"schedule",options:[["schedule","\u5BFC\u5165\u9884\u6D4B\u66F2\u7EBF\uFF0F\u56FA\u5B9A\u5DE5\u51B5\u4EA7\u80FD"],["dynamic","\u65E5\u6B65\u957F\u5E93\u5B58\u2014\u538B\u529B\u2014\u4EA7\u80FD\u8026\u5408"]],onChange:r=>t(u,{forecast:{...a.forecast,mode:r}})}),a.forecast?.mode==="dynamic"&&e.createElement(ce,{label:"\u5DF2\u6838\u5B9E\u4E95\u5E95\u6D41\u538B\u7684\u4E95\u7B52\u4E0E\u5916\u8F93\u4F9D\u636E\uFF0C\u4EE5\u53CA\u4EA7\u80FD\u7CFB\u6570\u5355\u4F4D\u4E3A\u4E07m\xB3/d",value:a.forecast?.boundary_verified,onChange:r=>t(u,{forecast:{...a.forecast,boundary_verified:r}})}),e.createElement("div",{className:"sc-grid"},e.createElement(M,{label:"\u65B9\u6848\u91C7\u6C14\u671F\uFF08\u5929\uFF09",value:a.withdrawal_days,type:"number",onChange:r=>t(u,{withdrawal_days:r})}),e.createElement(M,{label:"\u5355\u5143\u5730\u9762\u5904\u7406\u9650\u989D\uFF08\u4E07m\xB3/d\uFF09",value:a.surface_limit,type:"number",onChange:r=>t(u,{surface_limit:r})}),e.createElement(M,{label:"\u9884\u6D4B\u66F2\u7EBF\u4F9D\u636E\u4E0E\u5916\u8F93\u6761\u4EF6",value:a.schedule_source,onChange:r=>t(u,{schedule_source:r})})),e.createElement("p",{className:"sc-note"},"\u66F2\u7EBF\u8F93\u5165\u4E3A\u5404\u65F6\u95F4\u6BB5\u5E73\u5747\u65E5\u91C7\u6C14\u91CF\uFF0C\u5FC5\u987B\u8986\u76D6\u5B8C\u6574\u91C7\u6C14\u671F\u3002\u7B97\u6CD5\u5206\u6BB5\u79EF\u5206\u5E76\u65BD\u52A0\u5730\u9762\u4E0A\u9650\uFF0C\u518D\u4E0E\u5730\u5C42\u8C03\u5CF0\u6C14\u91CF\u53D6\u5C0F\u503C\u3002\u4E95\u5E95\u538B\u529B\u9700\u6765\u81EA\u4E95\u7B52\uFF0F\u7BA1\u7F51\u8BA1\u7B97\uFF0C\u4E0D\u4EE5\u4E95\u53E3\u538B\u529B\u66FF\u4EE3\u3002"),e.createElement(ve,{title:"\u91C7\u6C14\u9884\u6D4B",columns:["day","rate"],rows:a.schedule||[],onChange:r=>t(u,{schedule:r})}),e.createElement(ve,{title:"\u4E8C\u9879\u5F0F\u4EA7\u80FD",columns:["name","a","b","reservoir_pressure","bottomhole_pressure"],rows:a.wells||[],onChange:r=>t(u,{wells:r})})))}),o==="deliverability"&&s.units.length>1&&e.createElement(ce,{label:"\u5404\u5355\u5143\u5730\u9762\u8BBE\u65BD\u53CA\u5916\u8F93\u901A\u9053\u5B8C\u5168\u72EC\u7ACB\uFF0C\u53EF\u6309\u540C\u5468\u671F\u6210\u679C\u6C47\u603B\u7EFC\u5408\u8C03\u5CF0\u80FD\u529B",value:s.independent_surface,onChange:a=>p({independent_surface:a})}),e.createElement(M,{label:"\u9879\u76EE\u5047\u8BBE\u4E0E\u5F85\u786E\u8BA4\u4E8B\u9879",type:"textarea",value:s.assumptions,onChange:a=>p({assumptions:a})}),s.units.length>1&&e.createElement(M,{label:"\u5168\u5E93\u5171\u7528\u5730\u9762\u5904\u7406\u80FD\u529B\uFF08\u4E07m\xB3/d\uFF09",type:"number",value:s.site_surface_limit,onChange:a=>p({site_surface_limit:a})}),e.createElement("p",{className:"sc-note"},"\u4FDD\u5B58\u540E\u8FD0\u884C\u8BA1\u7B97\u3002\u6761\u4EF6\u4E0D\u6EE1\u8DB3\u6216\u8D44\u6599\u4E0D\u9F50\u5168\u65F6\uFF0C\u5C55\u793A\u5177\u4F53\u7F3A\u9879\uFF0C\u5176\u4ED6\u5355\u5143\u53EF\u72EC\u7ACB\u5B8C\u6210\uFF1B\u5168\u5E93\u6307\u6807\u53EA\u5728\u5B8C\u6574\u8303\u56F4\u5177\u5907\u540C\u53E3\u5F84\u7ED3\u679C\u65F6\u6C47\u603B\u3002"))}function Ms({evaluation:s,review:p,cat:g,stale:o,busy:t,onReview:a}){if(!s)return e.createElement("div",{className:"sc-empty"},e.createElement("h2",null,"\u5C1A\u672A\u8BA1\u7B97"),e.createElement("p",null,"\u786E\u8BA4\u8BC4\u4F30\u8303\u56F4\u548C\u8F93\u5165\u53C2\u6570\u540E\uFF0C\u8FD0\u884C\u8BA1\u7B97\u5373\u53EF\u67E5\u770B\u5206\u5355\u5143\u7ED3\u679C\u3001\u7F3A\u9879\u4E0E\u65B9\u6CD5\u5EFA\u8BAE\u3002"));let u=s;return e.createElement("section",null,e.createElement("div",{className:"sc-results-head"},e.createElement("div",null,e.createElement("h3",null,u.status==="calculated"?"\u8BA1\u7B97\u7ED3\u679C":"\u5F85\u8865\u5145\u8D44\u6599\u4E0E\u6761\u4EF6"),e.createElement("p",{className:"sc-muted"},u.summary)),e.createElement("button",{disabled:o||t,onClick:a},"\u65B9\u6CD5\u5BA1\u67E5")),o&&e.createElement("p",{className:"sc-note"},"\u8F93\u5165\u5DF2\u4FEE\u6539\uFF0C\u4EE5\u4E0B\u4E3A\u4E0A\u6B21\u8BA1\u7B97\u5FEB\u7167\u3002\u91CD\u65B0\u8BA1\u7B97\u540E\u624D\u80FD\u751F\u6210\u5F53\u524D\u62A5\u544A\u3002"),u.metrics.length>0&&e.createElement("div",{className:"sc-metrics"},u.metrics.filter(c=>["book_inventory","effective_inventory","deliverable_swing","capacity","working_gas"].includes(c.key)).slice(0,3).map(c=>e.createElement("div",{className:"sc-metric",key:c.key},e.createElement("span",null,c.label),e.createElement("strong",null,oe(c.value),e.createElement("small",null,c.unit))))),e.createElement("div",{className:"sc-table-wrap"},e.createElement("table",{className:"sc-table"},e.createElement("thead",null,e.createElement("tr",null,e.createElement("th",null,"\u6307\u6807"),e.createElement("th",null,"\u7ED3\u679C"),e.createElement("th",null,"\u5355\u4F4D"),e.createElement("th",null,"\u4F9D\u636E"))),e.createElement("tbody",null,u.metrics.map(c=>e.createElement("tr",{key:c.key},e.createElement("td",null,c.label),e.createElement("td",{className:"sc-number"},oe(c.value)),e.createElement("td",null,c.unit),e.createElement("td",null,c.source)))))),e.createElement("div",{className:"sc-section"},e.createElement("h3",null,"\u8D44\u6599\u4E0E\u53E3\u5F84\u68C0\u67E5"),e.createElement("div",{className:"sc-table-wrap"},e.createElement("table",{className:"sc-table"},e.createElement("tbody",null,u.checks.map((c,x)=>e.createElement("tr",{key:x},e.createElement("td",null,c.label),e.createElement("td",{className:"sc-"+(c.status==="passed"?"ok":c.status)},{passed:"\u901A\u8FC7",warning:"\u9700\u590D\u6838",error:"\u5F85\u8865\u5145"}[c.status]),e.createElement("td",null,c.detail))))))),u.comparisons?.length>0&&e.createElement("div",{className:"sc-section"},e.createElement("h3",null,"\u4EA4\u53C9\u6821\u9A8C"),e.createElement("div",{className:"sc-table-wrap"},e.createElement("table",{className:"sc-table"},e.createElement("thead",null,e.createElement("tr",null,e.createElement("th",null,"\u6307\u6807"),e.createElement("th",null,"\u8BA1\u7B97\u503C"),e.createElement("th",null,"\u5BF9\u6BD4\u503C"),e.createElement("th",null,"\u504F\u5DEE"),e.createElement("th",null,"\u4F9D\u636E"))),e.createElement("tbody",null,u.comparisons.map((c,x)=>e.createElement("tr",{key:x},e.createElement("td",null,g.terms.find(m=>m.key===c.metric)?.name||c.metric),e.createElement("td",null,oe(c.calculated)),e.createElement("td",null,oe(c.value)),e.createElement("td",null,oe(c.difference_percent),"%"),e.createElement("td",null,c.source))))))),u.units.map((c,x)=>e.createElement("div",{className:"sc-unit",key:x},e.createElement("div",{className:"sc-unit-top"},e.createElement("h3",null,c.name),e.createElement("span",{className:"sc-muted"},g.methods.find(m=>m.id===c.method)?.name," \xB7"," ",c.status==="calculated"?"\u5DF2\u8BA1\u7B97":"\u5F85\u8865\u5145")),c.errors.map((m,_)=>e.createElement("p",{className:"sc-error",key:_},m)),e.createElement("p",{className:"sc-note"},"\u65B9\u6CD5\u5EFA\u8BAE\uFF1A",g.methods.find(m=>m.id===c.recommendation.method)?.name,"\u3002",c.recommendation.reason),c.warnings?.map((m,_)=>e.createElement("p",{className:"sc-warning",key:_},m)),c.steps?.map((m,_)=>e.createElement("div",{className:"sc-formula",key:_},m)),c.plot&&e.createElement(ks,{points:c.plot}),e.createElement("div",{className:"sc-table-wrap"},e.createElement("table",{className:"sc-table"},e.createElement("tbody",null,Object.entries(c.values||{}).map(([m,_])=>e.createElement("tr",{key:m},e.createElement("td",null,g.terms.find(r=>r.key===m)?.name||{cushion:"\u538B\u529B\u7A97\u53E3\u4E0B\u9650\u6C14\u91CF",effective_capacity:"\u6709\u6548\u5E93\u5BB9\u91CF"}[m]||m),e.createElement("td",{className:"sc-number"},oe(_)),e.createElement("td",null,m==="peak_rate"?"\u4E07m\xB3/d":"\u4EBFm\xB3")))))),c.diagnostics&&e.createElement("details",null,e.createElement("summary",null,"\u62DF\u5408\u4E0E\u8BA1\u7B97\u8BCA\u65AD"),e.createElement("div",{className:"sc-table-wrap"},e.createElement("table",{className:"sc-table"},e.createElement("tbody",null,Object.entries(c.diagnostics).filter(([m])=>m!=="residuals").map(([m,_])=>e.createElement("tr",{key:m},e.createElement("td",null,{start_pz:"\u8D77\u59CB p/Z",end_pz:"\u672B\u671F p/Z",inverse_withdrawal_fraction:"\u64A4\u91C7\u6BD4\u4F8B\u5012\u6570",intercept:"\u56DE\u5F52\u622A\u8DDD",slope:"\u56DE\u5F52\u659C\u7387",r_squared:"\u62DF\u5408\u4F18\u5EA6 R\xB2",rmse:"\u5747\u65B9\u6839\u8BEF\u5DEE",mae:"\u5E73\u5747\u7EDD\u5BF9\u8BEF\u5DEE",n:"\u6837\u672C\u6570",metric:"\u6307\u6807",unit:"\u5355\u4F4D",schedule_integral:"\u91C7\u6C14\u66F2\u7EBF\u79EF\u5206\uFF08\u4EBFm\xB3\uFF09",net_water_reservoir_m3:"\u51C0\u6C34\u4FB5\u91CF\uFF08\u5730\u5C42m\xB3\uFF09",bg_depletion:"\u4F53\u79EF\u7CFB\u6570\u53D8\u5316"}[m]||m),e.createElement("td",null,typeof _=="number"?oe(_):String(_)))))))),c.sensitivity&&e.createElement("details",null,e.createElement("summary",null,"\u8F93\u5165\u6270\u52A8 \xB1",c.sensitivity.percent,"%"),e.createElement("p",{className:"sc-muted"},c.sensitivity.label),e.createElement("table",{className:"sc-table"},e.createElement("thead",null,e.createElement("tr",null,e.createElement("th",null,"\u8F93\u5165"),e.createElement("th",null,"\u8D1F\u5411\u6270\u52A8\u7ED3\u679C"),e.createElement("th",null,"\u6B63\u5411\u6270\u52A8\u7ED3\u679C"))),e.createElement("tbody",null,c.sensitivity.rows.map(m=>e.createElement("tr",{key:m.parameter},e.createElement("td",null,m.parameter),e.createElement("td",null,oe(m.minus)),e.createElement("td",null,oe(m.plus))))))))),e.createElement("div",{className:"sc-section"},e.createElement("h3",null,"\u5DE5\u7A0B\u65B9\u6CD5\u5BA1\u67E5"),e.createElement("div",{className:"sc-prose"},p?.status==="completed"?p.text:"\u5C1A\u672A\u8C03\u7528\u5E93\u5B58\u8BC4\u4EF7\u667A\u80FD\u4F53\u3002\u9700\u8981\u5224\u65AD\u65B9\u6CD5\u3001\u538B\u529B\u4EE3\u8868\u6027\u6216\u5DEE\u5F02\u539F\u56E0\u65F6\uFF0C\u70B9\u51FB\u201C\u65B9\u6CD5\u5BA1\u67E5\u201D\u3002\u8BA1\u7B97\u7ED3\u679C\u4E0D\u4F9D\u8D56\u667A\u80FD\u4F53\u53EF\u7528\u6027\u3002")),e.createElement("details",null,e.createElement("summary",null,"\u8BA1\u7B97\u8BB0\u5F55"),e.createElement("p",{className:"sc-muted"},"\u7248\u672C ",u.engine_version,"\uFF0C\u5B9E\u9645\u8BA1\u7B97\u8017\u65F6 ",u.duration_ms," ms\uFF0C",new Date(u.created_at).toLocaleString("zh-CN")),e.createElement("p",{className:"sc-prose"},"\u8F93\u5165 SHA-256\uFF1A",u.fingerprint)))}function $s(){let[s,p]=W(null),[g,o]=W([]),[t,a]=W(null),[u,c]=W("scope"),[x,m]=W("inputs"),[_,r]=W(!1),[y,i]=W(!1),[A,P]=W(""),[N,d]=W(null),[S,j]=W(null),[H,D]=W(null),[X,E]=W(""),[n,w]=W(0),[f,z]=W(null),[O,K]=W(!1),[J,Y]=W(!1),[de,ie]=W(!1),[Q,te]=W(null),ue=Pe(0),ge=Pe(),Me=Pe(),k=Pe(0),v=t?.case;ze(()=>m("inputs"),[u]),ze(()=>{ge.current&&(ge.current.scrollTop=0)},[x,u,n]),ze(()=>{t&&n>=t.case.units.length&&w(0)},[t?.case.units.length,n]);let $=async(h=t,C=n)=>{if(!h)return;let I=await F(`/cases/${h.id}/workflow?unit_index=${C}`);z(I)};ze(()=>{if(!t?.id)return;let h=!0;return F(`/cases/${t.id}/workflow?unit_index=${n}`).then(C=>{h&&z(C)}).catch(C=>{h&&P(C.message)}),()=>{h=!1}},[t?.id,t?.revision,n]);let L=async h=>{if(!y){i(!0),P("");try{return await h()}catch(C){P(C.message)}finally{i(!1)}}},G=async()=>o((await F("/cases")).cases);ze(()=>{let h=!0;return Promise.all([F("/catalog"),F("/cases")]).then(([C,I])=>{h&&(p(C),o(I.cases))}).catch(C=>h&&P(C.message)),()=>{h=!1,k.current++}},[]);let T=h=>{y||(a(C=>({...C,case:{...C.case,...h},stale:!0})),r(!0),E(""))},me=h=>{m("inputs"),te(null),Y(!1),ie(!1),a(h),r(!1),d(h.evaluation||null),j(h.review||null),D(null),E(""),w(0),z(null)},R=async()=>{if(!_)return t;let h=await F(`/cases/${t.id}`,pe({revision:t.revision,case:t.case},"PUT"));return a(h),r(!1),await G(),h},fe=h=>L(async()=>{t&&_&&await R();let C=++k.current,I=await F(`/cases/${h}`);C===k.current&&(me(I),c("scope"))}),re=()=>L(async()=>{t&&_&&await R(),me(await F("/cases",pe({}))),c("scope"),await G()}),Ee=()=>L(async()=>{let h=await R(),C=await F(`/cases/${h.id}/evaluate`,pe({revision:h.revision}));d(C),j(null),a({...h,latest_run:C.run_id,stale:!1}),E(""),c("results")}),Le=()=>L(async()=>{let h=await R();await F(`/cases/${h.id}/nodes/${u}/run`,pe({revision:h.revision,unit_index:n})),await $(h),m("charts")}),Ie=(h,C={})=>L(async()=>{let I=await R(),U=await F(`/cases/${I.id}/assistant/${h}`,pe({revision:I.revision,...C}));return a({...U,stale:!0}),r(!1),E(""),await $(U),!0}),ls=(h,C,I)=>L(async()=>{let U=await R(),q=[...I];if(C.length){let ke=new FormData;ke.append("revision",U.revision),C.forEach(he=>ke.append("files",he)),U=await F(`/cases/${U.id}/documents`,{method:"POST",body:ke}),a({...U,stale:!0}),r(!1),E("");let us=new Set(C.map(he=>he.name));U.case.documents.filter(he=>us.has(he.name)).forEach(he=>q.push(he.id))}let ye=await F(`/cases/${U.id}/assistant`,pe({revision:U.revision,node:u,unit_index:n,message:h,document_ids:[...new Set(q)].slice(0,20)}));return a({...ye,stale:!0}),r(!1),E(""),await $(ye),await G(),!0}),cs=h=>L(async()=>{if(!h.length)return;let C=await R(),I=new FormData;I.append("revision",C.revision),Array.from(h).forEach(q=>I.append("files",q));let U=await F(`/cases/${C.id}/documents`,{method:"POST",body:I});a({...U,stale:!0}),E(""),await G()}),ds=(h,C,I)=>{if(h==="case"){T({...ys(C,s.unit_template),documents:v.documents}),c("scope");return}if(h==="units"){let U=new Set(v.units.map(q=>q.name));if(C.some(q=>U.has(q.name))||new Set(C.map(q=>q.name)).size!==C.length){P("\u5355\u5143\u540D\u79F0\u91CD\u590D\uFF0C\u8BF7\u5148\u6838\u5BF9\u8303\u56F4\u6216\u4FEE\u6539\u540D\u79F0\u3002\u73B0\u6709\u5355\u5143\u672A\u8986\u76D6\u3002");return}T({units:[...v.units,...C]})}else if(h==="history")T({history:C});else{let U=Ce(v.units);if(!U[I]){P("\u8BF7\u5148\u521B\u5EFA\u76EE\u6807\u8BC4\u4F30\u5355\u5143");return}h==="history_match"?U[I].external.history_match=C:U[I][h]=C,T({units:U})}D(null),P("")},$e=_||t?.stale||!N,Oe=t&&Be({record:t,node:u,index:n,state:f?.nodes?.find(h=>h.id===u),evaluation:N,cat:s,dirty:_}),ps=(h,C)=>{te({token:++ue.current,model:h,chart:C}),Y(!0),m("inputs")};return e.createElement("div",{className:"sc-app sc-workflow"},e.createElement("aside",{className:"sc-sidebar"},e.createElement("div",null,e.createElement("h1",null,"\u5E93\u5BB9\u8BC4\u4F30"),e.createElement("span",{className:"sc-muted"},"UGSci \u5DE5\u7A0B\u5E94\u7528")),e.createElement("button",{className:"sc-create",disabled:y||!s,onClick:re},e.createElement(V,{name:"plus"}),"\u65B0\u5EFA\u8BC4\u4F30"),e.createElement("label",{className:"sc-project-select"},"\u8BC4\u4F30\u9879\u76EE",e.createElement("select",{"aria-label":"\u9009\u62E9\u8BC4\u4F30\u9879\u76EE",disabled:y,value:t?.id||"",onChange:h=>h.target.value&&fe(h.target.value)},e.createElement("option",{value:""},"\u9009\u62E9\u9879\u76EE"),g.map(h=>e.createElement("option",{key:h.id,value:h.id},h.name," \xB7 ",h.cycle||"\u5F85\u586B\u5468\u671F")))),t&&e.createElement(ns,{active:u,select:h=>{c(h),ie(!1)},nodes:f?.nodes,dirty:_,busy:y}),e.createElement("footer",null,"\u6309\u5355\u5143\u8BA1\u7B97\uFF0C\u6309\u5468\u671F\u7559\u5B58",e.createElement("br",null),"SY/T 7686-2023")),e.createElement("div",{className:"sc-center"},e.createElement("main",{className:"sc-main",style:{display:J&&de?"none":"flex"}},e.createElement("header",{className:"sc-header"},e.createElement("div",null,e.createElement("h2",null,v?.case_name||"\u5E93\u5BB9\u8BC4\u4F30\u5DE5\u4F5C\u53F0"),e.createElement("span",{className:"sc-muted"},t?`${v.cycle_id||"\u8BC4\u4F30\u5468\u671F\u5F85\u586B\u5199"}\u3000${y?"\u6B63\u5728\u5904\u7406\u2026":_?"\u6709\u672A\u4FDD\u5B58\u4FEE\u6539":"\u5DF2\u4FDD\u5B58"}`:"\u5EFA\u7ACB\u8BC4\u4F30\u9879\u76EE\uFF0C\u6574\u7406\u8D44\u6599\u5E76\u5F62\u6210\u62A5\u544A")),t&&e.createElement("div",{className:"sc-actions"},e.createElement("button",{disabled:y||!_,onClick:()=>L(R)},"\u4FDD\u5B58"),e.createElement("button",{disabled:y,onClick:Ee},"\u8FD0\u884C\u8BA1\u7B97"),e.createElement("button",{"aria-pressed":J,onClick:()=>Y(h=>!h)},e.createElement(V,{name:"layers"}),"\u7ED3\u679C\u89C6\u7A97"),e.createElement("button",{onClick:()=>K(h=>!h)},e.createElement(V,{name:"panel"}),O?"\u5C55\u5F00\u8BC4\u4F30\u52A9\u624B":"\u6536\u8D77\u52A9\u624B"))),t&&e.createElement("div",{className:"sc-node-toolbar"},e.createElement("div",null,e.createElement("h2",null,Ne.find(h=>h[0]===u)?.[1]),e.createElement("small",{className:"sc-muted"},["scope","data","accounting","results","report"].includes(u)?"\u9879\u76EE\u7EA7\u6210\u679C":"\u6309\u5355\u5143\u5904\u7406\uFF0C\u53EF\u72EC\u7ACB\u8FD0\u884C")),e.createElement("div",{className:"sc-actions"},!["scope","data","accounting","results","report"].includes(u)&&e.createElement("select",{"aria-label":"\u5F53\u524D\u8BC4\u4F30\u5355\u5143",value:n,disabled:y,onChange:h=>{z(null),w(Number(h.target.value))}},v.units.map((h,C)=>e.createElement("option",{key:C,value:C},h.name))),e.createElement("button",{className:"sc-primary",disabled:y||!["scope","data","accounting","results","report"].includes(u)&&!v.units[n],onClick:Le},"\u8FD0\u884C\u672C\u8282\u70B9"))),t&&e.createElement("div",{className:"sc-content-tabs",role:"tablist","aria-label":"\u8282\u70B9\u89C6\u56FE"},e.createElement("button",{id:"sc-input-tab",role:"tab","aria-selected":x==="inputs","aria-controls":"sc-input-panel",onClick:()=>m("inputs")},e.createElement(V,{name:"fields"}),"\u53C2\u6570\u8D44\u6599"),e.createElement("button",{id:"sc-chart-tab",role:"tab","aria-selected":x==="charts","aria-controls":"sc-chart-panel",onClick:()=>m("charts")},e.createElement(V,{name:"chart"}),"\u56FE\u8868\u7ED3\u679C"),e.createElement("span",null,Oe?.charts.length?`${Oe.charts.length} \u9879\u56FE\u8868`:"\u8865\u5145\u8D44\u6599\u540E\u67E5\u770B\u56FE\u8868")),A&&e.createElement("div",{role:"alert",className:"sc-alert"},e.createElement("span",null,A),e.createElement("button",{className:"sc-link",onClick:()=>P("")},"\u5173\u95ED")),e.createElement("div",{ref:ge,className:"sc-body","aria-busy":y},s?t?e.createElement(e.Fragment,null,e.createElement("div",{id:"sc-input-panel",role:"tabpanel","aria-labelledby":"sc-input-tab",hidden:x!=="inputs"},u==="scope"&&e.createElement(Ns,{data:v,edit:T,cat:s}),u==="data"&&e.createElement("section",null,e.createElement("div",{className:"sc-section"},e.createElement("div",{className:"sc-upload"},e.createElement("div",null,e.createElement("strong",null,"\u5BFC\u5165\u8BC4\u4F30\u8D44\u6599"),e.createElement("p",null,"Excel\u3001CSV\u3001JSON\u3001PPTX\u3001PDF\u3001Word\u3002\u4FDD\u7559\u539F\u4EF6\uFF0C\u9009\u62E9\u5B57\u6BB5\u540E\u5E94\u7528\u3002")),e.createElement("button",{disabled:y,onClick:()=>Me.current.click()},"\u9009\u62E9\u6587\u4EF6"),e.createElement("input",{ref:Me,type:"file",multiple:!0,accept:".xlsx,.csv,.tsv,.json,.pptx,.pdf,.docx,.txt,.md",hidden:!0,"aria-label":"\u4E0A\u4F20\u8BC4\u4F30\u8D44\u6599",onChange:h=>{cs(h.target.files),h.target.value=""}})),e.createElement("div",{className:"sc-table-wrap"},e.createElement("table",{className:"sc-table"},e.createElement("tbody",null,v.documents.map(h=>e.createElement("tr",{key:h.id},e.createElement("td",null,h.name),e.createElement("td",null,h.tables.length," \u5F20\u8868 / ",h.pages.length," ","\u6BB5\u6587\u5B57"),e.createElement("td",null,h.status==="manual_review"?"\u5F85\u4EBA\u5DE5\u8BFB\u53D6":"\u5DF2\u8BFB\u53D6\uFF0C\u5F85\u6838\u5BF9"),e.createElement("td",null,e.createElement("button",{className:"sc-link",disabled:y,onClick:()=>L(async()=>D(await F(`/cases/${t.id}/documents/${h.id}`)))},"\u67E5\u770B\u4E0E\u6620\u5C04"))))))),H&&e.createElement(_s,{key:H.id,doc:H,cat:s,record:t,apply:ds,run:L})),e.createElement("details",null,e.createElement("summary",null,"\u591A\u5468\u671F\u6210\u679C"),e.createElement("p",{className:"sc-muted"},"\u53EF\u4ECE\u8868\u683C\u6620\u5C04\u5BFC\u5165\u6216\u586B\u5199\u5386\u53F2\u6210\u679C\uFF0C\u5355\u4F4D\u4E3A\u4EBFm\xB3\uFF1B\u51B2\u5CF0\u80FD\u529B\u4E3A\u4E07m\xB3/d\u3002\u5386\u53F2\u6210\u679C\u4E0D\u81EA\u52A8\u66FF\u4EE3\u672C\u6B21\u8BA1\u7B97\u3002"),e.createElement(ve,{title:"\u5386\u53F2\u6307\u6807",columns:["cycle_id","book_inventory","effective_inventory","deliverable_swing","peak_rate","source"],rows:v.history||[],onChange:h=>T({history:h})}))),u==="accounting"&&e.createElement(zs,{data:v,edit:T}),["pvt","pressure","connectivity"].includes(u)&&e.createElement(os,{node:u,data:v,index:n,edit:T,cat:s,Field:M,Check:ce,TableEditor:ve}),["methods","inventory","window","deliverability"].includes(u)&&e.createElement(Cs,{data:{...v,units:v.units[n]?[v.units[n]]:[]},edit:h=>{if(h.units){let C=Ce(v.units);C[n]=h.units[0],T({...h,units:C})}else T(h)},cat:s,stage:u}),u==="deliverability"&&v.units.length>1&&e.createElement("section",{className:"sc-card"},e.createElement("h3",null,"\u5168\u5E93\u5730\u9762\u80FD\u529B"),e.createElement(ce,{label:"\u5404\u5355\u5143\u5730\u9762\u8BBE\u65BD\u76F8\u4E92\u72EC\u7ACB",value:v.independent_surface,onChange:h=>T({independent_surface:h})}),e.createElement(M,{label:"\u5168\u5E93\u5171\u4EAB\u5730\u9762\u91C7\u6C14\u4E0A\u9650\uFF08\u4E07\u65B9/\u5929\uFF09",value:v.site_surface_limit,onChange:h=>T({site_surface_limit:h})})),u==="results"&&e.createElement(e.Fragment,null,e.createElement(Ms,{evaluation:N,review:S,cat:s,stale:$e,busy:y,onReview:()=>L(async()=>j(await F(`/cases/${t.id}/review`,pe({revision:t.revision}))))}),e.createElement("details",null,e.createElement("summary",null,"\u5BF9\u6BD4\u6210\u679C\u4E0E\u9879\u76EE\u63D0\u793A\u9608\u503C"),e.createElement(M,{label:"\u504F\u5DEE\u63D0\u793A\u9608\u503C\uFF08%\uFF0C\u9879\u76EE\u8BBE\u7F6E\uFF0C\u975E\u884C\u4E1A\u6807\u51C6\uFF09",value:v.comparison_tolerance_percent,type:"number",onChange:h=>T({comparison_tolerance_percent:h})}),(v.benchmarks||[]).map((h,C)=>e.createElement("div",{className:"sc-unit",key:C},e.createElement("div",{className:"sc-grid"},[["metric","\u6307\u6807"],["value","\u62A5\u544A\uFF0F\u5176\u4ED6\u65B9\u6CD5\u503C"],["source","\u6210\u679C\u6765\u6E90"],["cycle_id","\u5468\u671F"],["state","\u72B6\u6001"]].map(([I,U])=>e.createElement(M,{key:I,label:U,type:I==="value"?"number":"text",value:h[I],options:I==="metric"?s.terms.filter(q=>["effective_inventory","geological_swing","deliverable_swing","capacity","working_gas","peak_rate"].includes(q.key)).map(q=>[q.key,q.name]):void 0,onChange:q=>T({benchmarks:v.benchmarks.map((ye,ke)=>ke===C?{...ye,[I]:q}:ye)})}))),e.createElement("button",{className:"sc-link",onClick:()=>T({benchmarks:v.benchmarks.filter((I,U)=>U!==C)})},"\u79FB\u9664\u5BF9\u6BD4\u6210\u679C"))),e.createElement("button",{onClick:()=>T({benchmarks:[...v.benchmarks||[],{metric:"effective_inventory",value:null,source:"",cycle_id:v.cycle_id,state:v.start_state}]})},"\u6DFB\u52A0\u5BF9\u6BD4\u6210\u679C"))),u==="report"&&e.createElement("section",null,e.createElement("div",{className:"sc-section"},e.createElement("h3",null,"\u5E93\u5BB9\u8BC4\u4F30\u62A5\u544A"),e.createElement("p",{className:"sc-muted"},"\u62A5\u544A\u5305\u542B\u8303\u56F4\u3001\u6570\u636E\u6765\u6E90\u3001\u9002\u7528\u6761\u4EF6\u3001\u5206\u5355\u5143\u8BA1\u7B97\u3001\u4EA4\u53C9\u6821\u9A8C\u3001\u8D44\u6599\u7F3A\u9879\u4E0E\u590D\u6838\u72B6\u6001\u3002\u8D44\u6599\u4E0D\u9F50\u65F6\u5BFC\u51FA\u5E26\u7F3A\u9879\u7684\u9636\u6BB5\u62A5\u544A\u3002"),e.createElement(M,{label:"\u9879\u76EE\u590D\u6838\u610F\u89C1",type:"textarea",value:v.review_notes,onChange:h=>T({review_notes:h}),wide:!0}),e.createElement("p",{className:"sc-note"},$e?"\u5C1A\u65E0\u5F53\u524D\u8F93\u5165\u7684\u8BA1\u7B97\u7ED3\u679C\u3002\u8BF7\u4FDD\u5B58\u5E76\u91CD\u65B0\u8BA1\u7B97\u3002":"\u5F53\u524D\u62A5\u544A\u7ED1\u5B9A\u672C\u6B21\u8BA1\u7B97\u5FEB\u7167\uFF1B\u66F4\u6539\u8F93\u5165\u540E\u9700\u91CD\u65B0\u8BA1\u7B97\u3002"),e.createElement("div",{className:"sc-actions"},e.createElement("button",{disabled:y||$e,onClick:()=>L(async()=>E(await(await F(`/cases/${t.id}/report?format=html`,void 0,!0)).text()))},"\u9884\u89C8\u62A5\u544A"),[["docx","\u5BFC\u51FA Word"],["html","\u5BFC\u51FA\u6253\u5370\u7248"],["zip","\u4E0B\u8F7D\u590D\u7B97\u5305"],["json","\u5BFC\u51FA\u8BA1\u7B97\u8BB0\u5F55"]].map(([h,C])=>e.createElement("button",{key:h,disabled:y||$e,onClick:()=>L(()=>rs(`/cases/${t.id}/report?format=${h}`,`${v.case_name}-\u5E93\u5BB9\u8BC4\u4F30\u62A5\u544A.${h}`))},C)))),X&&e.createElement("iframe",{title:"\u5E93\u5BB9\u8BC4\u4F30\u62A5\u544A\u9884\u89C8",className:"sc-report-preview",sandbox:"",srcDoc:X}))),e.createElement("div",{id:"sc-chart-panel",role:"tabpanel","aria-labelledby":"sc-chart-tab",hidden:x!=="charts"},e.createElement(Qe,{model:Oe,open:ps}),u!=="results"&&u!=="report"&&e.createElement(is,{result:f?.nodes?.find(h=>h.id===u),dirty:_,cat:s,onMethod:h=>T({units:v.units.map((C,I)=>I===n?{...C,method:h}:C)})})),v.field_sources&&e.createElement("details",{className:"sc-field-sources"},e.createElement("summary",null,"\u5BF9\u8BDD\u586B\u5199\u6765\u6E90\uFF08",Object.keys(v.field_sources).length,"\uFF09"),Object.entries(v.field_sources).map(([h,C])=>e.createElement("p",{key:h},e.createElement("strong",null,s.fields[h.split(".").at(-1)]?.label||h)," ","\xB7 ",C.location,e.createElement("br",null),C.quote)))):e.createElement("div",{className:"sc-empty"},e.createElement("h2",null,"\u4ECE\u4E00\u4EFD\u8BC4\u4F30\u9879\u76EE\u5F00\u59CB"),e.createElement("p",null,"\u6309\u50A8\u6C14\u5E93\u7C7B\u578B\u4E0E\u8D44\u6599\u6761\u4EF6\u9009\u62E9\u65B9\u6CD5\u3002\u652F\u6301 Excel\u3001CSV\u3001\u62A5\u544A\u53CA\u5916\u90E8\u6A21\u62DF\u6210\u679C\uFF0C\u4FDD\u7559\u8F93\u5165\u4F9D\u636E\u548C\u8BA1\u7B97\u8FC7\u7A0B\uFF0C\u751F\u6210\u53EF\u590D\u6838\u7684\u5E93\u5BB9\u8BC4\u4F30\u62A5\u544A\u3002"),e.createElement("button",{className:"sc-primary",onClick:re,disabled:y},"\u65B0\u5EFA\u8BC4\u4F30")):e.createElement("p",{className:"sc-muted"},"\u6B63\u5728\u8BFB\u53D6\u5DE5\u4F5C\u53F0\u2026"))),t&&e.createElement(Ge,{key:t.id,record:t,openRequest:Q,visible:J,hide:()=>{Y(!1),ie(!1)},expanded:de,setExpanded:ie})),e.createElement(as,{record:t,node:u,index:n,busy:y,cat:s,send:ls,adopt:h=>Ie("adopt",{ids:h}),undo:()=>Ie("undo"),hidden:O,close:()=>K(!0)}))}function js(){let s=Se.host.useSelectedAgent?.();return e.createElement($s,{key:s?.id||"default"})}Se.registerRoutes("storage-capacity",[{path:"/apps/storage-capacity",component:js,label:"\u5E93\u5BB9\u8BC4\u4F30\u5DE5\u4F5C\u53F0",icon:"SC"}]);})();
