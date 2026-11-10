(()=>{var We=`.sc-app {
  --sc-ink: var(--app-text, #182033);
  --sc-muted: var(--app-text-secondary, #667085);
  --sc-paper: var(--app-surface, #fff);
  --sc-soft: var(--app-surface-subtle, #f5f6fa);
  --sc-line: var(--app-border, #e6e9f0);
  --sc-accent: var(--app-accent);
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
  background: var(--app-accent-soft);
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
  color: var(--app-text-inverse);
  background: var(--sc-accent);
  border-color: var(--sc-accent);
}
.sc-app .sc-primary:hover {
  background: var(--app-accent-hover);
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
  background: var(--sc-paper);
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
  --sc-muted: var(--app-text-secondary);
  --sc-line: var(--app-border);
  --sc-accent: var(--app-accent);
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
  background: var(--app-surface-subtle);
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
  background: var(--app-surface-subtle);
  color: var(--app-text-secondary);
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
  color: var(--app-text-secondary);
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
  background: var(--app-surface-subtle);
}
.sc-workflow .sc-flow-nav button[aria-selected="true"] {
  background: var(--app-surface-subtle);
  color: var(--app-text-secondary);
}
.sc-workflow .sc-step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 21px;
  height: 21px;
  flex: 0 0 21px;
  font-size: 10px;
  border: 1px solid var(--app-border);
  border-radius: 50%;
  color: var(--app-text-secondary);
  background: var(--sc-paper);
}
.sc-workflow .sc-flow-nav button[aria-selected="true"] .sc-step-number {
  background: var(--app-surface-subtle);
  border-color: var(--app-border);
  color: var(--app-text-inverse);
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
  color: var(--app-text-secondary);
}
.sc-workflow .sc-step-done {
  font-size: 12px;
  color: var(--app-text-secondary);
}
.sc-workflow .sc-sidebar footer {
  padding: 12px 6px 0;
  font-size: 10px;
  line-height: 1.9;
  color: var(--app-text-secondary);
}
.sc-workflow .sc-header {
  padding: 12px 24px;
  min-height: 66px;
  background: var(--sc-paper);
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
  color: var(--app-text-secondary);
  background: transparent;
}
.sc-workflow .sc-header button:hover,
.sc-workflow .sc-header button[aria-pressed="true"] {
  background: var(--app-surface-subtle);
  color: var(--app-text-secondary);
}
.sc-workflow .sc-node-toolbar {
  padding: 17px 24px 8px;
  border: 0;
  gap: 10px;
  background: var(--app-surface-subtle);
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
  background: var(--app-surface-subtle);
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
  background: var(--app-surface-subtle);
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
  color: var(--app-text-secondary);
  border-bottom-color: var(--app-border);
  font-weight: 600;
}
.sc-content-tabs > span {
  margin-left: auto;
  font-size: 10px;
  color: var(--app-text-secondary);
}
.sc-workflow .sc-body {
  padding: 24px 26px 30px;
  background: var(--sc-paper);
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
  color: var(--app-text-secondary);
  font-size: 12px;
  gap: 6px;
}
.sc-workflow .sc-field input,
.sc-workflow .sc-field select,
.sc-workflow .sc-field textarea {
  background: var(--app-surface-subtle);
  border-color: var(--app-border);
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 13px;
}
.sc-workflow .sc-field input:focus,
.sc-workflow .sc-field textarea:focus {
  background: var(--sc-paper);
}
.sc-workflow .sc-unit-top {
  margin-bottom: 12px;
}
.sc-workflow .sc-unit-top > .sc-muted {
  font-size: 10px;
  padding: 2px 7px;
  background: var(--app-surface-subtle);
  border-radius: 4px;
}
.sc-method-context {
  font-size: 12px;
  color: var(--app-text-secondary);
  margin-bottom: 10px;
}
.sc-method-context summary {
  cursor: pointer;
  width: fit-content;
}
.sc-method-context summary > span {
  margin-left: 12px;
  font-size: 11px;
  color: var(--app-text-secondary);
}
.sc-method-context p {
  padding: 10px 12px;
  background: var(--app-surface-subtle);
  line-height: 1.8;
}
.sc-workflow .sc-formula {
  padding: 10px 13px;
  margin: 12px 0 20px;
  border: 0;
  border-left: 2px solid #c3d5e8;
  border-radius: 0 5px 5px 0;
  background: var(--app-surface-subtle);
  color: var(--app-text-secondary);
  font-size: 12px;
}
.sc-workflow .sc-note {
  background: var(--app-surface-subtle);
  font-size: 11px;
  color: var(--app-text-secondary);
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
  border-color: var(--app-border);
  color: var(--app-text-secondary);
  padding: 6px 10px;
  font-size: 11px;
}
.sc-workflow .sc-figure-tabs {
  gap: 4px;
  border: 0;
  margin: 0 0 16px;
  padding: 3px;
  background: var(--app-surface-subtle);
  border-radius: 6px;
  width: fit-content;
  max-width: 100%;
}
.sc-workflow .sc-figure-tabs button {
  padding: 6px 12px;
  border: 0;
  color: var(--app-text-secondary);
  font-size: 11px;
}
.sc-workflow .sc-figure-tabs button[aria-selected="true"] {
  background: var(--sc-paper);
  color: var(--app-text-secondary);
  box-shadow: 0 1px 4px #132e4b12;
  border-radius: 4px;
}
.sc-workflow .sc-node-figures > .sc-figure {
  border: 1px solid var(--app-border);
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
  color: var(--app-text-secondary);
  font-size: 11px;
}
.sc-workflow .sc-figure-tools button:hover {
  background: var(--app-surface-subtle);
  color: var(--app-text-secondary);
}
.sc-workflow .sc-chart-legend button {
  padding: 3px 5px;
  color: var(--app-text-secondary);
}
.sc-workflow .sc-chart-note {
  font-size: 10px;
  line-height: 1.7;
  padding-top: 7px;
  margin-top: 6px;
  color: var(--app-text-secondary);
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
  background: var(--app-surface-subtle);
  border: 1px solid var(--app-border);
}
.sc-workflow .sc-node-values dd {
  font-size: 24px;
  font-weight: 600;
  color: var(--app-text-secondary);
}
.sc-workflow .sc-results-workspace {
  background: var(--app-surface-subtle);
  border-top-color: var(--app-border);
}
.sc-workflow .sc-results-header {
  padding: 9px 14px;
  min-height: 44px;
  background: var(--app-surface-subtle);
  border-bottom-color: var(--app-border);
}
.sc-workflow .sc-results-header > strong {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: var(--app-text-secondary);
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
  background: var(--app-surface-subtle);
  font-size: 10px;
  color: var(--app-text-secondary);
}
.sc-workflow .sc-results-header .sc-actions {
  gap: 3px;
}
.sc-workflow .sc-results-header button {
  background: transparent;
  border-color: transparent;
  padding: 4px 7px;
  color: var(--app-text-secondary);
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
  color: var(--app-text-secondary);
  font-size: 10px;
  padding: 3px 7px;
}
.sc-workflow .sc-result-window-strip button[aria-pressed="true"] {
  background: var(--app-surface-subtle);
  color: var(--app-text-secondary);
}
.sc-workflow .sc-result-canvas {
  background: var(--app-surface-subtle);
}
.sc-workflow .sc-result-window {
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background: var(--sc-paper);
  box-shadow: 0 2px 5px #263f5b08;
}
.sc-workflow .sc-result-window:focus-within {
  border-color: var(--app-border);
  box-shadow: 0 2px 8px #263f5b10;
}
.sc-workflow .sc-result-titlebar {
  min-height: 39px;
  padding: 6px 9px 6px 13px;
  background: var(--sc-paper);
  border-color: var(--app-border);
}
.sc-workflow .sc-result-titlebar strong {
  font-weight: 600;
  color: var(--app-text-secondary);
}
.sc-workflow .sc-result-titlebar small {
  background: var(--app-surface-subtle);
  color: var(--app-text-secondary);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
}
.sc-workflow .sc-result-titlebar button {
  padding: 3px;
  min-width: 22px;
  width: 22px;
  height: 22px;
  color: var(--app-text-secondary);
}
.sc-workflow .sc-result-titlebar button:hover {
  color: var(--app-text-secondary);
  background: var(--app-surface-subtle);
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
  background: var(--app-surface-subtle);
  border-color: var(--app-border);
  font-size: 10px;
  color: var(--app-text-secondary);
}
.sc-result-window footer time {
  white-space: nowrap;
}
.sc-result-window footer .outdated {
  color: var(--app-text-secondary);
}
.sc-workflow .sc-window-resizer {
  color: var(--app-text-secondary);
}
.sc-workflow .sc-dock-resizer {
  height: 5px;
  top: -3px;
}
.sc-workflow .sc-dock-resizer:focus-visible {
  outline: 1px solid var(--app-border);
}
.sc-workflow .sc-assistant {
  background: var(--app-surface-subtle);
  border-color: var(--app-border);
}
.sc-workflow .sc-assistant > header {
  padding: 18px 85px 15px 18px;
  min-height: 75px;
  background: var(--sc-paper);
}
.sc-workflow .sc-assistant header strong {
  font-size: 13px;
  font-weight: 600;
}
.sc-workflow .sc-assistant header small {
  margin-top: 3px;
  font-size: 10px;
  color: var(--app-text-secondary);
}
.sc-workflow .sc-chat-history {
  padding: 22px 18px;
}
.sc-workflow .sc-chat-welcome p {
  font-size: 12px;
  line-height: 1.8;
  margin: 0 0 17px;
  color: var(--app-text-secondary);
}
.sc-workflow .sc-chat-welcome button {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  border-color: var(--app-border);
  color: var(--app-text-secondary);
  background: var(--app-surface-subtle);
  padding: 9px 11px;
  border-radius: 6px;
}
.sc-workflow .sc-chat-welcome button::after {
  content: "\u2197";
  color: var(--app-text-secondary);
}
.sc-workflow .sc-chat-compose {
  padding: 12px 14px 16px;
  border-top-color: var(--app-border);
}
.sc-workflow .sc-chat-compose > .sc-link {
  margin-bottom: 9px;
  font-size: 11px;
  color: var(--app-text-secondary);
}
.sc-compose-box {
  border: 1px solid var(--app-border);
  border-radius: 10px;
  background: var(--app-surface-subtle);
  box-shadow: 0 2px 5px #18385804;
  padding: 2px;
}
.sc-compose-box:focus-within {
  border-color: var(--app-border);
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
  color: var(--app-text-secondary);
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

/* Shared workbench density and surfaces. */
.sc-app {
  font-size: var(--app-font-body, 14px);
}
.sc-app button {
  min-height: var(--app-hit-target, 32px);
  border-radius: var(--app-radius, 10px);
}
.sc-workflow .sc-sidebar {
  background: var(--app-surface-subtle);
}
.sc-flow-nav button[aria-selected="true"] {
  background: var(--app-accent-soft);
  border-color: transparent;
  color: var(--app-accent-text);
}
.sc-workflow .sc-header {
  background: var(--app-bg);
}
.sc-alert {
  background: var(--app-warning-bg);
  color: var(--app-warning-text);
  border-color: var(--app-warning-border);
}
.sc-error {
  color: var(--app-error-text);
}
.sc-warning {
  color: var(--app-warning-text);
}
.sc-ok,
.sc-step-done {
  color: var(--app-success-text);
}

.sc-workflow .sc-step-number {
  background: var(--app-surface);
}
.sc-workflow .sc-flow-nav button[aria-selected="true"] .sc-step-number {
  background: var(--app-accent);
  border-color: var(--app-accent);
  color: var(--app-text-inverse);
}
.sc-workflow .sc-content-tabs button[aria-selected="true"] {
  color: var(--app-accent-text);
  border-bottom-color: var(--app-accent);
}
.sc-workflow .sc-step-done {
  color: var(--app-success-text);
}

.sc-workflow .sc-flow-nav button[aria-selected="true"] {
  color: var(--app-accent-text);
  background: var(--app-accent-soft);
}
`;var Ue={effective_inventory:"\u6709\u6548\u5E93\u5B58",book_inventory:"\u8D26\u9762\u5E93\u5B58",inactive_inventory:"\u672A\u52A8\u7528\u5E93\u5B58",geological_swing:"\u5730\u5C42\u8C03\u5CF0\u6C14\u91CF",movable_cushion:"\u53EF\u52A8\u57AB\u6C14",working_gas:"\u5DE5\u4F5C\u6C14\u91CF",capacity:"\u4E0A\u9650\u5E93\u5BB9\u91CF",effective_capacity:"\u6709\u6548\u5E93\u5BB9\u91CF",cushion:"\u4E0B\u9650\u6C14\u91CF",deliverable_swing:"\u7EFC\u5408\u8C03\u5CF0\u80FD\u529B",peak_rate:"\u51B2\u5CF0\u80FD\u529B"},Z=s=>s!=null&&s!==""&&typeof s!="boolean"&&Number.isFinite(Number(s))?Number(s):null,V=(s,d,f,n,t={})=>({name:s,points:d.map((o,u)=>({x:Z(f(o,u)),y:Z(n(o,u)),label:o.name||o.\u72B6\u6001||""})),...t}),oe=(s,d,f,n,t,o="")=>({id:s,title:d,type:"bar",labels:f,series:n,xLabel:"",yLabel:t,note:o}),ee=(s,d,f,n,t,o="")=>({id:s,title:d,type:"line",series:f,xLabel:n,yLabel:t,note:o}),He=(s,d,f,n,t="")=>({id:s,title:d,type:"table",columns:f,rows:n,note:t}),se=(s,d)=>({name:s,points:d.map((f,n)=>({x:n,y:Z(f)}))}),hs=s=>s.type==="table"?s.rows.length:s.series.reduce((d,f)=>d+f.points.filter(n=>n.x!==null&&n.y!==null).length,0),Be=(s,d)=>Array.isArray(s[d])?s[d].length:null;function bs({node:s,project:d,unit:f,run:n,evaluation:t,cat:o}){let u=d||{},p=f||{},x=n||{},m=x.resolved_parameters||p.parameters||{},_=x.values||{},i=x.rows||[],y=[],r=N=>{hs(N)&&y.push(N)},A=N=>Ue[N]||o?.fields?.[N]?.label||N,P=(N,c="\u6307\u6807")=>{let S=Object.entries(N).filter(([j,H])=>j in Ue&&j!=="peak_rate"&&Z(H)!==null);S.length&&r(oe("volumes",c+"\u5BF9\u6BD4",S.map(([j])=>A(j)),[se("\u6C14\u91CF",S.map(([,j])=>j))],"\u4EBF\u6807\u51C6 m\xB3","\u6307\u6807\u5BF9\u5E94\u7684\u72B6\u6001\u4E0E\u7EA6\u675F\u4E0D\u540C\uFF0C\u4E0D\u4F5C\u5806\u53E0\u6216\u76F8\u52A0\u3002")),Z(N.peak_rate)!==null&&r(oe("peak","\u51B2\u5CF0\u80FD\u529B",["\u672C\u6B21\u5DE5\u51B5"],[se("\u65E5\u91C7\u6C14\u80FD\u529B",[N.peak_rate])],"\u4E07\u6807\u51C6 m\xB3/d"))};if(s==="scope")r(He("boundary","\u8BC4\u4F30\u5355\u5143\u4E0E\u65B9\u6CD5",["\u5355\u5143","\u4E3B\u65B9\u6CD5","\u8FB9\u754C\u4F9D\u636E"],(u.units||[]).map(N=>[N.name,o?.methods?.find(c=>c.id===N.method)?.name||"\u5F85\u5224\u65AD",N.source||"\u5F85\u586B\u5199"]),"\u6309\u5C42\u7CFB\u3001\u8FDE\u901A\u533A\u6216\u72EC\u7ACB\u76D0\u7A74\u5212\u5206\uFF1B\u672C\u8868\u4E0D\u4EE3\u66FF\u5730\u8D28\u5E73\u9762\u56FE\u3002"));else if(s==="data"){let N=u.documents||[];r(oe("sources","\u8D44\u6599\u63D0\u53D6\u6982\u51B5",N.map(c=>c.name),[se("\u8868\u683C",N.map(c=>Be(c,"tables"))),se("\u6587\u672C\u6BB5",N.map(c=>Be(c,"pages")))],"\u6570\u91CF","\u63D0\u53D6\u6570\u91CF\u4E0D\u4EE3\u8868\u8D44\u6599\u8D28\u91CF\uFF0C\u626B\u63CF\u56FE\u7247\u4E0E\u516C\u5F0F\u4ECD\u9700\u6838\u5BF9\u539F\u4EF6\u3002"))}else if(s==="accounting"){let N=u.ledger||{},c=["initial_inventory","injected","withdrawn","metered_loss","equivalent_gas"];u.book_inventory==null&&c.every(S=>Z(N[S])!==null)&&r(oe("ledger","\u8BA1\u91CF\u6536\u652F\u5206\u9879",["\u671F\u521D\u5E93\u5B58","\u6CE8\u6C14","\u91C7\u6C14\u6263\u51CF","\u635F\u8017\u6263\u51CF","\u5F53\u91CF\u6C14\u6263\u51CF"],[se("\u8BA1\u91CF\u5206\u9879",c.map((S,j)=>(j<2?1:-1)*Number(N[S])))],"\u4EBF\u6807\u51C6 m\xB3","\u6B63\u503C\u4E3A\u589E\u52A0\uFF0C\u8D1F\u503C\u4E3A\u6263\u51CF\uFF1B\u8D26\u9762\u5E93\u5B58\u91C7\u7528\u8BA1\u91CF\u8282\u70B9\u7ED3\u679C\u3002")),P(_,"\u8D26\u9762\u5E93\u5B58")}else if(s==="pvt"){let N=[...p.pvt||[]].sort((c,S)=>Number(c.pressure)-Number(S.pressure));r(ee("pz-property","\u538B\u529B\u2014Z \u56E0\u5B50",[V("\u5B9E\u9A8C\u8868",N,c=>c.pressure,c=>c.z),V("\u72B6\u6001\u91C7\u7528\u503C",i,c=>c["\u538B\u529B MPa"],c=>c.Z,{scatter:!0})],"\u538B\u529B\uFF08MPa\uFF09","Z\uFF08\u65E0\u91CF\u7EB2\uFF09","\u53C2\u8003\u547C\u56FE\u58C1\u6C47\u62A5\u7B2C 45 \u9875\u7684\u7269\u6027\u5BF9\u7167\uFF1B\u4EC5\u663E\u793A\u540C\u6E29\u6837\u54C1\u7684\u6570\u636E\uFF0C\u4E0D\u5916\u63A8\u3002")),r(ee("bg","\u538B\u529B\u2014\u6C14\u4F53\u4F53\u79EF\u7CFB\u6570",[V("\u72B6\u6001\u6362\u7B97",i,c=>c["\u538B\u529B MPa"],c=>c["Bg \u5730\u5C42m\xB3/\u6807\u51C6m\xB3"],{scatter:!0})],"\u7EDD\u5BF9\u538B\u529B\uFF08MPa\uFF09","Bg\uFF08\u5730\u5C42 m\xB3/\u6807\u51C6 m\xB3\uFF09"))}else if(s==="pressure"){let N=i.length?i:[...(p.start_pressures||[]).map(c=>({...c,\u72B6\u6001:"\u8D77\u59CB",\u4E95:c.name,"\u539F\u59CB\u538B\u529B MPa":c.pressure})),...(p.end_pressures||[]).map(c=>({...c,\u72B6\u6001:"\u672B\u671F",\u4E95:c.name,"\u539F\u59CB\u538B\u529B MPa":c.pressure}))];r(oe("well-pressure","\u6D4B\u538B\u4E0E\u91C7\u7528\u538B\u529B",N.map(c=>`${c.\u4E95||"\u5355\u5143"}\xB7${c.\u72B6\u6001}`),[se("\u5B9E\u6D4B\u503C",N.map(c=>c["\u539F\u59CB\u538B\u529B MPa"])),se("\u5904\u7406\u540E\u91C7\u7528\u503C",N.map(c=>c["\u91C7\u7528\u538B\u529B MPa"]))],"\u538B\u529B\uFF08MPa\uFF09","\u53C2\u8003\u547C\u56FE\u58C1\u7B2C 41\u201344 \u9875\u3002\u5B9E\u6D4B\u3001\u89E3\u91CA\u4E0E\u52A0\u6743\u503C\u5206\u5F00\uFF1B\u77ED\u5173\u4E95\u503C\u4E0D\u7B49\u4E8E\u5E73\u8861\u538B\u529B\u3002")),r(oe("representative","\u5355\u5143\u4EE3\u8868\u538B\u529B",["\u8D77\u59CB","\u672B\u671F"],[se("\u4EE3\u8868\u538B\u529B",[_.injection_end_pressure,_.evaluation_pressure])],"\u538B\u529B\uFF08MPa\uFF09"))}else if(s==="connectivity"){let N=p.connectivity?.series||[];r(ee("response","\u4E95\u95F4\u540C\u6B65\u538B\u529B\u54CD\u5E94",[V("\u4E95 A",N,c=>c.time,c=>c.x),V("\u4E95 B",N,c=>c.time,c=>c.y)],"\u76F8\u5BF9\u65F6\u95F4\uFF08\u539F\u8D44\u6599\u5355\u4F4D\uFF09","\u538B\u529B\uFF08MPa\uFF09","\u53C2\u8003\u547C\u56FE\u58C1\u7B2C 16\u300141 \u9875\u3002\u65E0\u4E95\u4F4D\u5750\u6807\u548C\u7F51\u683C\u65F6\u4E0D\u7ED8\u5236\u538B\u529B\u573A\u3002")),r(ee("lag","\u6EDE\u540E\u76F8\u5173\u8BCA\u65AD",[V("\u76F8\u5173\u7CFB\u6570",i,c=>c.\u6EDE\u540E\u65F6\u95F4,c=>c.\u76F8\u5173\u7CFB\u6570)],"\u6EDE\u540E\u65F6\u95F4\uFF08\u539F\u8D44\u6599\u5355\u4F4D\uFF09","\u76F8\u5173\u7CFB\u6570","\u76F8\u5173\u6027\u4E0D\u80FD\u5355\u72EC\u8BC1\u660E\u5730\u8D28\u8FDE\u901A\uFF1B\u987B\u7ED3\u5408\u5730\u8D28\u548C\u8BD5\u4E95\u89E3\u91CA\u3002"))}else if(s==="methods")r(He("applicability","\u65B9\u6CD5\u9002\u7528\u6027\u5BF9\u7167",["\u65B9\u6CD5","\u6761\u4EF6\u68C0\u67E5"],i.map(N=>[N.\u65B9\u6CD5,N.\u9002\u7528\u68C0\u67E5]),"\u53EA\u5C55\u793A\u660E\u786E\u6761\u4EF6\uFF0C\u4E0D\u751F\u6210\u4EFB\u610F\u8BC4\u5206\u6216\u7F6E\u4FE1\u5EA6\u3002"));else if(s==="inventory"){x.plot?.length?(r(ee("material-balance","p/Z\u2014\u7D2F\u91C7\u91CF",[V("\u89C2\u6D4B",x.plot,c=>c.x,c=>c.y,{scatter:!0}),V("\u56DE\u5F52",x.plot,c=>c.x,c=>c.fitted)],"\u672C\u6BB5\u7D2F\u91C7\u91CF\uFF08\u4EBF\u6807\u51C6 m\xB3\uFF09","p/Z\uFF08MPa\uFF09","\u62DF\u5408\u6765\u81EA\u8BA1\u7B97\u8282\u70B9\uFF1B\u4E0D\u8DE8\u6CE8\u91C7\u6BB5\u8FDE\u7EBF\u3002")),r(ee("residual","\u56DE\u5F52\u6B8B\u5DEE",[V("\u89C2\u6D4B\u51CF\u62DF\u5408",x.plot,c=>c.x,c=>Z(c.y)!==null&&Z(c.fitted)!==null?c.y-c.fitted:null)],"\u672C\u6BB5\u7D2F\u91C7\u91CF\uFF08\u4EBF\u6807\u51C6 m\xB3\uFF09","\u6B8B\u5DEE\uFF08MPa\uFF09"))):Z(x.diagnostics?.start_pz)!==null&&Z(m.produced_gas)!==null&&r(ee("material-balance","\u4E24\u72B6\u6001 p/Z\u2014\u7D2F\u91C7\u91CF",[{name:"\u8BC4\u4F30\u72B6\u6001",points:[{x:0,y:x.diagnostics.start_pz,label:"\u8D77\u59CB"},{x:Number(m.produced_gas),y:Z(x.diagnostics.end_pz),label:"\u672B\u671F"}]}],"\u672C\u6BB5\u7D2F\u91C7\u91CF\uFF08\u4EBF\u6807\u51C6 m\xB3\uFF09","p/Z\uFF08MPa\uFF09","\u4E24\u70B9\u8FDE\u7EBF\u4EC5\u5C55\u793A\u4E24\u72B6\u6001\u5173\u7CFB\uFF0C\u4E0D\u4F5C\u4E3A\u591A\u70B9\u62DF\u5408\u8D28\u91CF\u8BC1\u636E\u3002")),P(_,"\u6709\u6548\u5E93\u5B58"),x.sensitivity?.rows&&r(oe("sensitivity","\u8F93\u5165\u654F\u611F\u6027",x.sensitivity.rows.map(c=>c.parameter),[se(`\u2212${x.sensitivity.percent}%`,x.sensitivity.rows.map(c=>c.minus)),se(`+${x.sensitivity.percent}%`,x.sensitivity.rows.map(c=>c.plus))],"\u6709\u6548\u5E93\u5B58\uFF08\u4EBF\u6807\u51C6 m\xB3\uFF09","\u5355\u56E0\u7D20\u6270\u52A8\uFF0C\u975E\u6982\u7387\u7F6E\u4FE1\u533A\u95F4\u3002"));let N=p.external?.history_match||[];r(ee("history-match","\u5916\u90E8\u6210\u679C\u5386\u53F2\u62DF\u5408",[V("\u89C2\u6D4B",N,(c,S)=>S+1,c=>c.observed),V("\u6A21\u62DF",N,(c,S)=>S+1,c=>c.simulated)],"\u539F\u6210\u679C\u6837\u672C\u5E8F\u53F7",p.external?.match_unit||"\u539F\u6210\u679C\u5355\u4F4D\uFF08\u5F85\u6838\u5BF9\uFF09","\u4EC5\u5C55\u793A\u5BFC\u5165\u7684\u4E13\u4E1A\u8F6F\u4EF6\u6210\u679C\uFF0C\u4E0D\u4EE3\u8868\u5DE5\u4F5C\u53F0\u8FD0\u884C\u4E86\u6A21\u62DF\u5668\u3002"))}else if(s==="window")r(oe("pressure-limits","\u8FD0\u884C\u538B\u529B\u4E0E\u8BC4\u4F30\u72B6\u6001",["\u4E0B\u9650","\u672B\u671F","\u8D77\u59CB","\u4E0A\u9650"],[se("\u538B\u529B",[m.minimum_pressure,m.evaluation_pressure,m.injection_end_pressure,m.maximum_pressure])],"\u538B\u529B\uFF08MPa\uFF09","\u538B\u529B\u987A\u5E8F\u548C\u53E3\u5F84\u4EE5\u91C7\u7528\u53C2\u6570\u4E3A\u51C6\uFF0C\u4E0D\u628A\u89C6\u5730\u5C42\u538B\u529B\u8F6C\u6362\u4E3A\u7EDD\u538B\u3002")),P(_,"\u538B\u529B\u7A97\u53E3\u6307\u6807");else if(s==="deliverability"){let N=i.filter(c=>c.\u65E5!==void 0);N.length?(r(ee("rate","\u91C7\u6C14\u80FD\u529B\u9884\u6D4B",[V("\u65E5\u5747\u91C7\u6C14\u91CF",N,c=>c.\u65E5,c=>c["\u65E5\u5747\u91CF \u4E07m\xB3/d"])],"\u91C7\u6C14\u65F6\u95F4\uFF08d\uFF09","\u4E07\u6807\u51C6 m\xB3/d","\u53C2\u8003\u547C\u56FE\u58C1\u7B2C 34 \u9875\uFF1B\u91C7\u7528\u8282\u70B9\u65E5\u6B65\u957F\u8BA1\u7B97\uFF0C\u5747\u503C\u4E0D\u7B49\u4E8E\u77AC\u65F6\u51B2\u5CF0\u80FD\u529B\u3002")),r(ee("forecast-pressure","\u91C7\u6C14\u671F\u5730\u5C42\u538B\u529B",[V("\u5730\u5C42\u538B\u529B",N,c=>c.\u65E5,c=>c["\u672B\u671F\u538B\u529B MPa"])],"\u91C7\u6C14\u65F6\u95F4\uFF08d\uFF09","\u7EDD\u5BF9\u538B\u529B\uFF08MPa\uFF09")),r(ee("cumulative","\u7D2F\u8BA1\u91C7\u6C14\u4E0E\u5269\u4F59\u5E93\u5B58",[V("\u7D2F\u8BA1\u91C7\u6C14",N,c=>c.\u65E5,c=>c["\u7D2F\u8BA1\u91C7\u6C14 \u4EBFm\xB3"]),V("\u5269\u4F59\u6709\u6548\u5E93\u5B58",N,c=>c.\u65E5,c=>c["\u5269\u4F59\u6709\u6548\u5E93\u5B58 \u4EBFm\xB3"])],"\u91C7\u6C14\u65F6\u95F4\uFF08d\uFF09","\u4EBF\u6807\u51C6 m\xB3"))):(r(ee("rate","\u5BFC\u5165\u91C7\u6C14\u9884\u6D4B",[V("\u533A\u95F4\u5E73\u5747\u65E5\u91CF",p.schedule||[],c=>c.day,c=>c.rate,{scatter:!0})],"\u533A\u95F4\u7ED3\u675F\u65E5\uFF08d\uFF09","\u4E07\u6807\u51C6 m\xB3/d","\u5404\u70B9\u662F\u533A\u95F4\u5E73\u5747\u91CF\uFF0C\u4E0D\u6309\u77AC\u65F6\u503C\u8FDE\u7EBF\u79EF\u5206\u3002")),r(oe("wells","\u5355\u4E95\u4EA7\u80FD",(x.well_results||[]).map(c=>c.name),[se("\u4EA7\u80FD",(x.well_results||[]).map(c=>c.rate))],"\u4E07\u6807\u51C6 m\xB3/d")))}else if(s==="results"||s==="report"){let N=t?.metrics||i.map(j=>({label:j.\u6307\u6807,value:j.\u503C,unit:j.\u5355\u4F4D})),c=new Map;N.forEach(j=>{let H=j.unit||"\u672A\u6CE8\u660E\u5355\u4F4D";c.has(H)||c.set(H,[]),c.get(H).push(j)}),c.forEach((j,H)=>r(oe("summary-"+H,"\u8BC4\u4F30\u6307\u6807 \xB7 "+H,j.map(I=>I.label),[se("\u672C\u6B21\u7ED3\u679C",j.map(I=>I.value))],H,"\u5404\u6307\u6807\u6309\u72B6\u6001\u5206\u522B\u89E3\u91CA\uFF1B\u4E0D\u540C\u91CF\u7EB2\u5206\u56FE\u5C55\u793A\u3002")));let S=u.history||[];r({...ee("cycles","\u591A\u5468\u671F\u5E93\u5B58\u4E0E\u8C03\u5CF0",[V("\u8D26\u9762\u5E93\u5B58",S,(j,H)=>H,j=>j.book_inventory),V("\u6709\u6548\u5E93\u5B58",S,(j,H)=>H,j=>j.effective_inventory),V("\u7EFC\u5408\u8C03\u5CF0\u80FD\u529B",S,(j,H)=>H,j=>j.deliverable_swing)],"\u8BC4\u4F30\u5468\u671F","\u4EBF\u6807\u51C6 m\xB3","\u53C2\u8003\u547C\u56FE\u58C1\u7B2C 35 \u9875\u53CA\u677F\u4E2D\u5317\u5468\u671F\u8BCA\u65AD\uFF1B\u5386\u53F2\u6210\u679C\u672A\u91CD\u65B0\u8BA1\u7B97\u3002"),labels:S.map(j=>j.cycle_id)}),s==="report"&&r(He("report-register","\u62A5\u544A\u56FE\u8868\u4E0E\u4F9D\u636E",["\u5185\u5BB9","\u672C\u6B21\u72B6\u6001"],[["\u8BC4\u4EF7\u5468\u671F",u.cycle_id||"\u672A\u586B\u5199"],["\u8BA1\u7B97\u7248\u672C",t?.engine_version||"\u8282\u70B9\u7ED3\u679C"],["\u62A5\u544A\u72B6\u6001",t?"\u5DF2\u5F62\u6210\u8BA1\u7B97\u5FEB\u7167":"\u8BF7\u8FD0\u884C\u6574\u5E93\u8BA1\u7B97"],["\u539F\u59CB\u8D44\u6599",`${(u.documents||[]).length} \u4EFD`]],"\u62A5\u544A\u4ECD\u7531\u539F\u6709\u9884\u89C8\u4E0E\u5BFC\u51FA\u5165\u53E3\u751F\u6210\uFF1B\u56FE\u8868\u53EF\u53E6\u5B58 SVG \u548C CSV\u3002"))}return y}function Ve({record:s,node:d,index:f,state:n,evaluation:t,cat:o,dirty:u}){let p=n?.run,x=["scope","data","accounting","results","report"].includes(d),m=s?.case.units[f],_=p?.chart_context,i=u||n?.status==="stale",y=["results","report"].includes(d)&&t,r=!p||!i?s?.case:null,A=y?t.case:_?.project||r,P=y?null:_?.unit||(!p||!i?m:null),N=p?.status==="blocked"?null:p;return{projectId:s?.id,node:d,index:x?null:f,title:n?.name||d,scope:x?"\u5168\u9879\u76EE":_?.unit?.name||m?.name||"\u5F85\u9009\u5355\u5143",revision:s?.revision,inputHash:y?t.fingerprint:p?.input_hash,runId:y?t.run_id:p?.run_id,createdAt:y?t.created_at:p?.created_at,basis:y?"\u6574\u5E93\u8BA1\u7B97\u7ED3\u679C":p?.status==="blocked"?"\u8F93\u5165\u8D44\u6599\u9884\u89C8 \xB7 \u8282\u70B9\u672A\u901A\u8FC7":p?"\u8282\u70B9\u8BA1\u7B97\u5FEB\u7167":"\u8F93\u5165\u8D44\u6599\u9884\u89C8",stale:y?!!(u||s?.stale):!!p&&!!i,charts:bs({node:d,project:A,unit:P,run:N,evaluation:y?t:null,cat:o}),missing:p?.errors?.join("\uFF1B")||"\u5F53\u524D\u8D44\u6599\u4E0D\u8DB3\u4EE5\u7ED8\u56FE\u3002\u8865\u5145\u672C\u8282\u70B9\u6570\u636E\u5E76\u8FD0\u884C\u540E\u663E\u793A\u56FE\u8868\uFF1B\u7F3A\u6D4B\u4E0D\u4F1A\u586B\u6210\u96F6\u3002"}}function Ze(s){let d=n=>{let t=String(n??"");return'"'+(/^[=+@\-]/.test(t)&&typeof n!="number"?"'":"")+t.replaceAll('"','""')+'"'};return"\uFEFF"+(s.type==="table"?[s.columns,...s.rows]:[["\u7CFB\u5217",s.xLabel||"\u7C7B\u522B",s.yLabel||"\u503C"],...s.series.flatMap(n=>n.points.map(t=>[n.name,s.labels?.[t.x]??t.x,t.y]))]).map(n=>n.map(d).join(",")).join(`\r
`)}var Fe=window.QwenPaw.host.React,Ke={chart:"M3 3v14h14M6 12l3-4 4 2 4-6",fields:"M3 5h14M3 10h14M3 15h14M7 3v4M13 8v4M8 13v4",open:"M11 3h6v6M17 3l-8 8M8 3H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4",table:"M3 3h14v14H3zM3 8h14M8 8v9",download:"M10 3v9M6 8l4 4 4-4M3 14v3h14v-3",image:"M3 3h14v14H3zM3 13l4-4 3 3 3-5 4 6M6 6h.01",grid:"M3 3h6v6H3zM12 3h5v6h-5zM3 12h6v5H3zM12 12h5v5h-5z",layers:"M3 3h10v10H3zM7 15v2h10V7h-2",expand:"M3 8V3h5M12 3h5v5M17 12v5h-5M8 17H3v-5",collapse:"M7 3v4H3M17 7h-4V3M13 17v-4h4M3 13h4v4",close:"M5 5l10 10M15 5L5 15",minus:"M4 10h12",panel:"M3 3h14v14H3zM12 3v14",plus:"M10 4v12M4 10h12"};function B({name:s,size:d=16}){return Fe.createElement("svg",{className:"sc-icon",width:d,height:d,viewBox:"0 0 20 20",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true"},Fe.createElement("path",{d:Ke[s]||Ke.chart}))}var g=window.QwenPaw.host.React,{useState:le,useEffect:ve,useRef:xe}=g,je=["#3478ad","#bf884f","#428e7b","#8875ac","#ae6576"],ge=s=>Z(s)===null?"\u2014":Math.abs(s)>0&&Math.abs(s)<.001?Number(s).toExponential(2):Number(s).toLocaleString("zh-CN",{maximumFractionDigits:4}),Je=s=>JSON.parse(JSON.stringify(s));function qe(s,d,f){let n=URL.createObjectURL(new Blob([s],{type:f})),t=document.createElement("a");t.href=n,t.download=d.replace(/[<>:"/\\|?*]/g,"_"),t.click(),setTimeout(()=>URL.revokeObjectURL(n),1e3)}function Ye({chart:s,context:d,exportable:f=!0}){let n=[d?.scope,s.title].filter(Boolean).join(" \xB7 "),[t,o]=le([]),[u,p]=le("chart"),x=xe(),m=xe(),[_,i]=le({width:740,height:315});ve(()=>{let k=m.current;if(!k||typeof ResizeObserver>"u")return;let w=k.closest(".sc-window-body"),$=()=>{if(!k.clientWidth)return;let G={width:Math.max(280,k.clientWidth),height:w?Math.max(180,Math.min(520,w.clientHeight-100)):315};i(T=>T.width===G.width&&T.height===G.height?T:G)};$();let L=new ResizeObserver($);return L.observe(k),w&&L.observe(w),()=>L.disconnect()},[]),ve(()=>{o([]),p("chart")},[s.id]);let y=(s.series||[]).map((k,w)=>({...k,color:je[w%je.length]})).filter(k=>!t.includes(k.name)),r=y.flatMap(k=>k.points).filter(k=>Z(k.x)!==null&&Z(k.y)!==null),A=s.type==="table"||u==="table",P=s.type==="table"?s.columns:["\u7CFB\u5217",s.xLabel||"\u7C7B\u522B",s.yLabel],N=s.type==="table"?s.rows:(s.series||[]).flatMap(k=>k.points.map(w=>[k.name,s.labels?.[w.x]??ge(w.x),ge(w.y)])),[c,S]=le(0),j=60;ve(()=>S(0),[s.id,s.rows,s.series]);let H=Math.max(1,Math.ceil(N.length/j)),I=0,X=1,E=0,a=1;if(r.length){if(I=Math.min(...r.map(w=>w.x)),X=Math.max(...r.map(w=>w.x)),E=Math.min(...r.map(w=>w.y)),a=Math.max(...r.map(w=>w.y)),s.type==="bar"&&(E=Math.min(0,E),a=Math.max(0,a)),I===X&&(I-=.5,X+=.5),E===a){let w=Math.abs(E)*.1||1;E-=w,a+=w}let k=(a-E)*.08;a+=k,s.type!=="bar"&&(E-=k)}let v=_.width,h=_.height,z=82,O=22,K=28,J=62,Y=v-z-O,ce=h-K-J,re=k=>z+(k-I)/(X-I)*Y,Q=k=>h-J-(k-E)/(a-E)*ce,te=s.labels||[],ue=Y/Math.max(1,te.length),fe=Math.max(1,Math.ceil(te.length/Math.max(2,Math.floor(Y/75)))),Me=()=>{let k=x.current?.cloneNode(!0);if(!k)return;let w="http://www.w3.org/2000/svg",$=document.createElementNS(w,"svg"),L=Math.max(1,Math.floor((v-52)/200)),G=84+Math.ceil(y.length/L)*22;$.setAttribute("xmlns",w),$.setAttribute("viewBox",`0 0 ${v} ${h+G}`),$.setAttribute("width",v),$.setAttribute("height",h+G),$.style.fontFamily="Microsoft YaHei, sans-serif";let T=(me,R,he)=>{let ie=document.createElementNS(w,me);Object.entries(R).forEach(([Ee,Le])=>ie.setAttribute(Ee,Le)),he!==void 0&&(ie.textContent=he),$.appendChild(ie)};T("rect",{width:v,height:h+G,fill:"white"}),T("text",{x:26,y:30,fill:"#293444","font-size":18},n),T("text",{x:26,y:51,fill:"#536278","font-size":10},[d?.basis,d?.createdAt,d?.inputHash?.slice(0,12)].filter(Boolean).join(" \xB7 ")),y.forEach((me,R)=>{let he=26+R%L*((v-52)/L),ie=77+Math.floor(R/L)*22;T("rect",{x:he,y:ie-8,width:12,height:8,fill:me.color}),T("text",{x:he+19,y:ie,fill:"#536278","font-size":12},me.name)}),k.setAttribute("y",G),k.setAttribute("width",v),k.setAttribute("height",h),$.appendChild(k),qe(new XMLSerializer().serializeToString($),n+".svg","image/svg+xml;charset=utf-8")};return g.createElement("div",{ref:m,className:"sc-figure","aria-label":s.title},g.createElement("div",{className:"sc-figure-tools"},s.type!=="table"&&g.createElement("div",{className:"sc-chart-legend"},(s.series||[]).map((k,w)=>g.createElement("button",{key:k.name,"aria-pressed":!t.includes(k.name),onClick:()=>o($=>$.includes(k.name)?$.filter(L=>L!==k.name):[...$,k.name])},g.createElement("i",{style:{background:je[w%je.length]}}),k.name))),g.createElement("div",{className:"sc-actions"},s.type!=="table"&&g.createElement("button",{onClick:()=>p(k=>k==="chart"?"table":"chart")},g.createElement(B,{name:u==="chart"?"table":"chart",size:14}),u==="chart"?"\u6570\u636E\u8868":"\u56FE\u5F62"),f&&g.createElement(g.Fragment,null,g.createElement("button",{className:"sc-icon-button","aria-label":"\u5BFC\u51FA\u6570\u636E",title:"\u5BFC\u51FA\u6570\u636E \xB7 CSV",onClick:()=>qe(Ze(s),n+".csv","text/csv;charset=utf-8")},g.createElement(B,{name:"download"})),s.type!=="table"&&g.createElement("button",{className:"sc-icon-button","aria-label":"\u4FDD\u5B58\u56FE\u5F62",title:"\u4FDD\u5B58\u56FE\u5F62 \xB7 SVG",disabled:A||!r.length,onClick:Me},g.createElement(B,{name:"image"}))))),A?g.createElement("div",{className:"sc-chart-table"},g.createElement("table",{className:"sc-table"},g.createElement("thead",null,g.createElement("tr",null,P.map((k,w)=>g.createElement("th",{key:w},k)))),g.createElement("tbody",null,N.slice(c*j,(c+1)*j).map((k,w)=>g.createElement("tr",{key:w},k.map(($,L)=>g.createElement("td",{key:L},$??"\u2014")))))),H>1&&g.createElement("div",{className:"sc-actions"},g.createElement("button",{disabled:c===0,onClick:()=>S(k=>k-1)},"\u4E0A\u4E00\u9875"),g.createElement("span",null,c+1," / ",H," \xB7 \u5171 ",N.length," \u884C"),g.createElement("button",{disabled:c>=H-1,onClick:()=>S(k=>k+1)},"\u4E0B\u4E00\u9875"))):r.length?g.createElement("svg",{ref:x,className:"sc-chart-svg",viewBox:`0 0 ${v} ${h}`,height:h,role:"img","aria-label":s.title,style:{background:"white",fontFamily:"Microsoft YaHei, sans-serif",fontSize:11,color:"#293444"}},g.createElement("title",null,s.title),g.createElement("desc",null,s.note," \u6A2A\u8F74\uFF1A",s.xLabel,"\uFF1B\u7EB5\u8F74\uFF1A",s.yLabel),g.createElement("rect",{width:v,height:h,fill:"white"}),g.createElement("text",{x:z,y:15,fill:"#536278"},s.yLabel),Array.from({length:5},(k,w)=>{let $=E+(a-E)*w/4;return g.createElement("g",{key:w},g.createElement("line",{x1:z,y1:Q($),x2:v-O,y2:Q($),stroke:"#e5eaf0"}),g.createElement("text",{x:z-9,y:Q($)+4,textAnchor:"end",fill:"#536278"},ge($)))}),s.type==="bar"?te.map((k,w)=>w%fe===0&&g.createElement("text",{key:w,x:z+ue*(w+.5),y:h-J+20,textAnchor:"middle",fill:"#536278"},g.createElement("title",null,k),String(k).length>10?String(k).slice(0,9)+"\u2026":k)):Array.from({length:te.length?te.length:5},(k,w)=>{if(te.length&&w%fe)return null;let $=te.length?w:I+(X-I)*w/4;return g.createElement("text",{key:w,x:re($),y:h-J+20,textAnchor:"middle",fill:"#536278"},te[w]||ge($))}),g.createElement("line",{x1:z,y1:h-J,x2:v-O,y2:h-J,stroke:"#94a3b8"}),g.createElement("line",{x1:z,y1:K,x2:z,y2:h-J,stroke:"#94a3b8"}),E<0&&a>0&&g.createElement("line",{x1:z,y1:Q(0),x2:v-O,y2:Q(0),stroke:"#94a3b8",strokeDasharray:"4 3"}),y.map((k,w)=>g.createElement("g",{key:k.name},s.type!=="bar"&&!k.scatter&&g.createElement("path",{d:k.points.reduce(($,L)=>Z(L.x)===null||Z(L.y)===null?{path:$.path,pen:!1}:{path:$.path+`${$.pen?"L":"M"}${re(L.x)},${Q(L.y)} `,pen:!0},{path:"",pen:!1}).path,fill:"none",stroke:k.color,strokeWidth:"2"}),k.points.map(($,L)=>Z($.x)===null||Z($.y)===null?null:s.type==="bar"?g.createElement("rect",{key:L,x:z+ue*$.x+ue*.15+w*ue*.7/y.length,y:Math.min(Q(0),Q($.y)),width:Math.max(.5,ue*.7/y.length-2),height:Math.max(.7,Math.abs(Q($.y)-Q(0))),fill:k.color},g.createElement("title",null,k.name," \xB7 ",te[$.x],"\uFF1A",ge($.y)," ",s.yLabel)):g.createElement("circle",{key:L,cx:re($.x),cy:Q($.y),r:k.scatter?4:k.points.length>150?1.5:3,fill:k.color},g.createElement("title",null,k.name," \xB7 ",$.label||ge($.x),"\uFF1A",ge($.y)," ",s.yLabel))))),g.createElement("text",{x:z+Y/2,y:h-10,textAnchor:"middle",fill:"#536278"},s.xLabel)):g.createElement("div",{className:"sc-chart-empty"},"\u672A\u9009\u62E9\u53EF\u663E\u793A\u7684\u6570\u636E\u7CFB\u5217\u3002"),s.note&&g.createElement("p",{className:"sc-chart-note"},s.note))}function Qe({model:s,open:d}){let[f,n]=le(0);ve(()=>n(0),[s.node,s.scope]);let t=s.charts[Math.min(f,s.charts.length-1)];return g.createElement("section",{className:"sc-node-figures","aria-label":"\u8282\u70B9\u56FE\u8868"},g.createElement("div",{className:"sc-section-head"},g.createElement("div",null,g.createElement("h3",null,t?.title||"\u8282\u70B9\u56FE\u8868"),g.createElement("small",null,s.basis,s.stale?" \xB7 \u8F93\u5165\u5DF2\u6539\u53D8\uFF0C\u5F53\u524D\u663E\u793A\u65E7\u6210\u679C":"")),t&&g.createElement("button",{className:"sc-open-figure",onClick:()=>d(s,t)},g.createElement(B,{name:"open"}),"\u5728\u7ED3\u679C\u89C6\u7A97\u6253\u5F00")),t?g.createElement(g.Fragment,null,g.createElement("div",{className:"sc-figure-tabs",role:"tablist","aria-label":"\u56FE\u8868\u9009\u62E9"},s.charts.map((o,u)=>g.createElement("button",{key:o.id,role:"tab","aria-selected":t.id===o.id,onClick:()=>n(u)},o.title))),g.createElement(Ye,{key:t.id,chart:t,context:s})):g.createElement("div",{className:"sc-chart-empty"},s.missing))}function Xe(s,d){if(!s)return"";if(d.index===null)return JSON.stringify(s.case);let f=s.case;return JSON.stringify({unit:f.units[d.index],cycle:f.cycle_id,start:f.start_state,end:f.end_state,pressure:f.pressure_basis,standard:f.standard,storage:f.storage_type})}var ae=(s,d,f)=>Math.max(d,Math.min(Math.max(d,f),s));function Ge({record:s,openRequest:d,visible:f,hide:n,expanded:t,setExpanded:o}){let[u,p]=le([]),[x,m]=le(450),[_,i]=le(350),y=xe(),[r,A]=le({width:900,height:350}),P=xe(),N=xe(0),c=xe();ve(()=>{if(!y.current||!f)return;let a=()=>{let h=y.current.getBoundingClientRect();h.width>0&&A({width:h.width,height:h.height})};a();let v=typeof ResizeObserver>"u"?null:new ResizeObserver(a);return v?.observe(y.current),()=>v?.disconnect()},[f,t,_,x]),ve(()=>{!d||c.current===d.token||d.model.projectId!==s.id||(c.current=d.token,p(a=>{if(a.length>=12)return a;let v=++N.current;return[...a,{id:v,model:Je(d.model),chart:Je(d.chart),dependency:Xe(s,d.model),x:16+a.length%4*24,y:12+a.length%4*24,width:Math.min(600,r.width-32),height:350,z:v,minimized:!1}]}))},[d,s.id]);let S=(a,v)=>p(h=>h.map(z=>z.id===a?{...z,...v}:z)),j=a=>p(v=>v.map(h=>h.id===a?{...h,z:Math.max(0,...v.map(z=>z.z))+1}:h)),H=(a,v,h)=>{h==="move"&&a.target.closest("button")||(a.preventDefault(),a.stopPropagation(),a.currentTarget.setPointerCapture?.(a.pointerId),j(v.id),P.current={id:v.id,x:a.clientX,y:a.clientY,w:v,mode:h})},I=a=>{let v=P.current;if(!v)return;let h=a.clientX-v.x,z=a.clientY-v.y;if(v.mode==="panel"){m(ae(v.w.height-z,240,780));return}v.mode==="move"?S(v.id,{x:ae(v.w.x+h,0,r.width-Math.min(v.w.width,r.width)),y:ae(v.w.y+z,0,r.height-Math.min(v.w.height,r.height))}):S(v.id,{width:ae(v.w.width+h,Math.min(300,r.width),r.width-v.w.x),height:ae(v.w.height+z,220,r.height-v.w.y)})},X=()=>{y.current?.parentElement&&(y.current.parentElement.scrollTop=0);let a=u.filter(J=>!J.minimized),v=r.width>=720&&a.length>1?2:1,h=Math.max(1,Math.ceil(a.length/v)),z=y.current?.parentElement?.clientHeight||r.height,O=ae((z-12)/h-12,300,560),K=(r.width-24)/v;i(Math.max(350,Math.ceil(a.length/v)*(O+12)+12)),p(J=>J.map(Y=>{let ce=a.findIndex(re=>re.id===Y.id);return ce<0?Y:{...Y,maximized:!1,x:12+ce%v*K,y:12+Math.floor(ce/v)*(O+12),width:K-12,height:O}}))},E=(a,v,h=!1)=>{if(!a.key.startsWith("Arrow"))return;a.preventDefault();let z=a.shiftKey?40:10,O=a.key==="ArrowRight"?z:a.key==="ArrowLeft"?-z:0,K=a.key==="ArrowDown"?z:a.key==="ArrowUp"?-z:0;S(v.id,h?{width:ae(v.width+O,Math.min(300,r.width),r.width-v.x),height:ae(v.height+K,220,r.height-v.y)}:{x:ae(v.x+O,0,r.width-Math.min(v.width,r.width)),y:ae(v.y+K,0,r.height-Math.min(v.height,r.height))})};return g.createElement("section",{className:`sc-results-workspace${t?" expanded":""}`,style:{display:f?"flex":"none",height:t?"100%":x},"aria-label":"\u7ED3\u679C\u5DE5\u4F5C\u533A"},!t&&g.createElement("div",{role:"separator",tabIndex:0,"aria-label":"\u8C03\u6574\u7ED3\u679C\u5DE5\u4F5C\u533A\u9AD8\u5EA6","aria-orientation":"horizontal","aria-valuenow":x,"aria-valuemin":240,"aria-valuemax":780,className:"sc-dock-resizer",onPointerDown:a=>{a.currentTarget.setPointerCapture?.(a.pointerId),P.current={mode:"panel",y:a.clientY,x:a.clientX,w:{height:x}}},onPointerMove:I,onPointerUp:()=>{P.current=null},onPointerCancel:()=>{P.current=null},onKeyDown:a=>{["ArrowUp","ArrowDown"].includes(a.key)&&(a.preventDefault(),m(v=>ae(v+(a.key==="ArrowUp"?20:-20),240,780)))}}),g.createElement("header",{className:"sc-results-header"},g.createElement("strong",null,g.createElement(B,{name:"layers"}),"\u7ED3\u679C\u5DE5\u4F5C\u533A ",g.createElement("small",null,u.length)),g.createElement("div",{className:"sc-actions"},g.createElement("button",{disabled:!u.length,onClick:X},g.createElement(B,{name:"grid",size:14}),"\u5E73\u94FA"),g.createElement("button",{disabled:!u.length,onClick:()=>{y.current?.parentElement&&(y.current.parentElement.scrollTop=0),i(450),p(a=>a.map((v,h)=>({...v,maximized:!1,minimized:!1,x:12+h%5*24,y:12+h%5*24,width:Math.min(600,r.width-120),height:300})))}},g.createElement(B,{name:"layers",size:14}),"\u5C42\u53E0"),g.createElement("button",{onClick:()=>o(!t)},g.createElement(B,{name:t?"collapse":"expand",size:14}),t?"\u8FD4\u56DE\u8868\u5355\u5E03\u5C40":"\u653E\u5927\u5DE5\u4F5C\u533A"),g.createElement("button",{className:"sc-icon-button","aria-label":"\u6536\u8D77\u7ED3\u679C\u533A",title:"\u6536\u8D77\u7ED3\u679C\u533A",onClick:n},g.createElement(B,{name:"minus"})))),g.createElement("div",{className:"sc-result-window-strip"},u.map(a=>g.createElement("button",{key:a.id,"aria-pressed":!a.minimized,title:a.chart.title+" \xB7 "+a.model.scope,onClick:()=>{S(a.id,{minimized:!1}),j(a.id)}},a.chart.title," \xB7 ",a.model.scope)),!u.length&&g.createElement("span",null,"\u4ECE\u5404\u8282\u70B9\u7684\u201C\u56FE\u8868\u201D\u6253\u5F00\u89C6\u7A97\uFF0C\u53EF\u540C\u65F6\u5BF9\u7167\u4E0D\u540C\u8282\u70B9\u3001\u5355\u5143\u4E0E\u8BA1\u7B97\u7248\u672C\u3002"),u.length>=12&&g.createElement("span",null,"\u5DF2\u8FBE 12 \u4E2A\u89C6\u7A97\uFF0C\u8BF7\u5173\u95ED\u4E0D\u518D\u4F7F\u7528\u7684\u7A97\u53E3\u540E\u518D\u6253\u5F00\u3002")),g.createElement("div",{className:"sc-result-canvas-scroll"},g.createElement("div",{ref:y,className:"sc-result-canvas",style:{minHeight:_}},u.map(a=>{let v=Math.min(a.width,r.width),h=ae(a.x,0,r.width-v),z=a.model.stale||Xe(s,a.model)!==a.dependency;return g.createElement("article",{key:a.id,className:"sc-result-window","aria-label":`\u7ED3\u679C\u89C6\u7A97\uFF1A${a.chart.title} \xB7 ${a.model.scope}`,onPointerDown:()=>j(a.id),style:{display:a.minimized?"none":"flex",left:a.maximized?0:h,top:a.maximized?0:a.y,width:a.maximized?"100%":v,height:a.maximized?Math.max(350,r.height):a.height,zIndex:a.z}},g.createElement("div",{className:"sc-result-titlebar",tabIndex:0,"aria-label":`\u79FB\u52A8\u89C6\u7A97 ${a.chart.title}`,onPointerDown:O=>!a.maximized&&H(O,a,"move"),onPointerMove:I,onPointerUp:()=>{P.current=null},onPointerCancel:()=>{P.current=null},onKeyDown:O=>!a.maximized&&E(O,a)},g.createElement("strong",{title:a.chart.title+" \xB7 "+a.model.scope},a.chart.title,g.createElement("small",null,a.model.scope)),g.createElement("div",{className:"sc-actions"},g.createElement("button",{"aria-label":`\u6700\u5C0F\u5316 ${a.chart.title}`,onClick:()=>S(a.id,{minimized:!0})},g.createElement(B,{name:"minus",size:14})),g.createElement("button",{"aria-label":`${a.maximized?"\u8FD8\u539F":"\u6700\u5927\u5316"} ${a.chart.title}`,onClick:()=>S(a.id,{maximized:!a.maximized})},g.createElement(B,{name:a.maximized?"collapse":"expand",size:14})),g.createElement("button",{"aria-label":`\u5173\u95ED ${a.chart.title}`,onClick:()=>p(O=>O.filter(K=>K.id!==a.id))},g.createElement(B,{name:"close",size:14})))),g.createElement("div",{className:"sc-window-body"},g.createElement(Ye,{chart:a.chart,context:a.model})),g.createElement("footer",{title:a.model.inputHash?`\u7A97\u53E3 #${a.id} \xB7 \u8F93\u5165 ${a.model.inputHash}`:"\u8F93\u5165\u8D44\u6599\u9884\u89C8\uFF0C\u4E0D\u4F5C\u4E3A\u8BA1\u7B97\u7ED3\u8BBA"},g.createElement("span",{role:"status",className:z?"outdated":""},z?"\u5386\u53F2\u5FEB\u7167 \xB7 \u8F93\u5165\u5DF2\u6709\u53D8\u5316\uFF0C\u8BF7\u91CD\u7B97\u540E\u53E6\u5F00\u89C6\u7A97":a.model.basis),g.createElement("time",null,a.model.createdAt?new Date(a.model.createdAt).toLocaleString("zh-CN"):"\u672A\u8FD0\u884C")),!a.maximized&&g.createElement("button",{className:"sc-window-resizer","aria-label":`\u8C03\u6574\u89C6\u7A97\u5927\u5C0F ${a.chart.title}`,onPointerDown:O=>H(O,a,"resize"),onPointerMove:I,onPointerUp:()=>{P.current=null},onPointerCancel:()=>{P.current=null},onKeyDown:O=>E(O,a,!0)},"\u25E2"))}))))}var l=window.QwenPaw.host.React,{useState:_e,useRef:Te,useEffect:Re}=l,Ne=[["scope","\u8BC4\u4F30\u8303\u56F4","\u51C6\u5907"],["data","\u8D44\u6599\u6574\u7406","\u51C6\u5907"],["accounting","\u8BA1\u91CF\u4E0E\u8D26\u9762\u5E93\u5B58","\u51C6\u5907"],["pvt","\u6D41\u4F53\u4E0E PVT","\u5206\u6790"],["pressure","\u5730\u5C42\u538B\u529B","\u5206\u6790"],["connectivity","\u8FDE\u901A\u6027\u4E0E\u5355\u5143","\u5206\u6790"],["methods","\u7279\u5F81\u4E0E\u65B9\u6CD5","\u5206\u6790"],["inventory","\u6709\u6548\u5E93\u5B58","\u8BA1\u7B97"],["window","\u538B\u529B\u7A97\u53E3\u4E0E\u5E93\u5BB9","\u8BA1\u7B97"],["deliverability","\u6CE8\u91C7\u4E0E\u8C03\u5CF0\u80FD\u529B","\u8BA1\u7B97"],["results","\u6821\u9A8C\u4E0E\u7ED3\u679C\u91C7\u7528","\u6210\u679C"],["report","\u62A5\u544A\u4E0E\u5F52\u6863","\u6210\u679C"]],ts={ready:"\u53EF\u68C0\u67E5",missing:"\u5F85\u5355\u5143",calculated:"\u5DF2\u8BA1\u7B97",blocked:"\u7F3A\u8D44\u6599",review:"\u5F85\u590D\u6838",stale:"\u9700\u91CD\u7B97",not_applicable:"\u4E0D\u9002\u7528"},gs=new Set(["scope","data","accounting","results","report"]),fs={sandstone:"\u7802\u5CA9",carbonate:"\u78B3\u9178\u76D0\u5CA9",fractured:"\u88C2\u7F1D\u6027\u50A8\u5C42",salt:"\u76D0\u5CA9",auto:"\u6839\u636E\u8D44\u6599\u5224\u65AD",unknown:"\u5F85\u5224\u65AD",depleted_gas:"\u67AF\u7AED\u6C14\u85CF",depleted_oil:"\u67AF\u7AED\u6CB9\u85CF",aquifer:"\u542B\u6C34\u5C42",salt_cavern:"\u76D0\u7A74",pz:"\u4E24\u70B9 p/Z",pz_regression:"\u591A\u70B9 p/Z",volumetric:"\u4F53\u79EF\u4E0E\u538B\u529B\u7A97\u53E3",numerical:"\u6570\u503C\u6A21\u62DF\u6210\u679C\u590D\u6838",rta:"RTA \u6210\u679C\u590D\u6838"},es=s=>fs[s]||String(s),ss=s=>s==null?"\u2014":typeof s=="number"?s.toLocaleString("zh-CN",{maximumFractionDigits:6}):String(s);function as({active:s,select:d,nodes:f,dirty:n,busy:t}){return l.createElement("nav",{className:"sc-flow-nav",role:"tablist","aria-label":"\u8BC4\u4F30\u6B65\u9AA4","aria-orientation":"vertical"},Ne.map(([o,u,p],x)=>{let m=f?.find(_=>_.id===o);return l.createElement(l.Fragment,{key:o},(!x||Ne[x-1][2]!==p)&&l.createElement("div",{className:"sc-flow-group"},p),l.createElement("button",{role:"tab","aria-selected":s===o,"data-status":n?"stale":m?.status,disabled:t,onClick:()=>d(o)},l.createElement("span",{className:"sc-step-number"},String(x+1).padStart(2,"0")),l.createElement("span",{className:"sc-step-text"},u,l.createElement("small",null,n?"\u4FEE\u6539\u5F85\u4FDD\u5B58":ts[m?.status]||"\u5F85\u5904\u7406")),m?.status==="calculated"&&!n&&l.createElement("span",{className:"sc-step-done","aria-label":"\u5DF2\u8BA1\u7B97"},"\u2713")))}))}function ns({node:s,data:d,index:f,edit:n,cat:t,Field:o,Check:u,TableEditor:p}){let x=d.units[f];if(!x)return l.createElement("p",{className:"sc-note"},"\u8BF7\u5728\u8BC4\u4F30\u8303\u56F4\u4E2D\u6DFB\u52A0\u8BC4\u4F30\u5355\u5143\uFF0C\u518D\u5F00\u59CB\u6B64\u8282\u70B9\u3002");let m=r=>n({units:d.units.map((A,P)=>P===f?{...A,...r}:A)}),_=(r,A)=>m({parameters:{...x.parameters,[r]:A}}),i=(r,A,P)=>m({[r]:{...x[r],[A]:P}}),y=r=>l.createElement(o,{key:r,label:`${t.fields[r]?.label||r}\uFF08${t.fields[r]?.unit||""}\uFF09`,type:"number",value:x.parameters[r],onChange:A=>_(r,A)});return s==="pvt"?l.createElement("section",{className:"sc-section"},l.createElement("h3",null,"\u5B9E\u9A8C\u7269\u6027\u4E0E\u72B6\u6001\u53C2\u6570"),l.createElement("p",{className:"sc-muted"},"\u586B\u5199\u5B9E\u9A8C\u6216\u4E13\u4E1A\u7269\u6027\u8F6F\u4EF6\u6210\u679C\u3002\u9009\u62E9\u8868\u63D2\u503C\u540E\uFF0C\u4E0B\u6E38\u4F7F\u7528\u540C\u4E00\u6E29\u5EA6\u3001\u6837\u54C1\u7684\u8868\u5185\u8BA1\u7B97\u503C\uFF1B\u539F\u59CB\u624B\u586B\u503C\u4ECD\u4FDD\u7559\u3002"),l.createElement("div",{className:"sc-grid"},l.createElement(o,{label:"\u7269\u6027\u53D6\u503C\u65B9\u5F0F",value:x.pvt_config?.mode||"missing",options:[["missing","\u91C7\u7528\u5DF2\u586B Z\uFF0C\u7F3A\u9879\u65F6\u67E5\u8868"],["table","\u7EDF\u4E00\u4F7F\u7528\u5B9E\u9A8C\u8868\u63D2\u503C"]],onChange:r=>i("pvt_config","mode",r)}),l.createElement(o,{label:"PVT \u6837\u54C1\uFF0F\u7EC4\u5206\u7248\u672C",value:x.pvt_config?.sample,onChange:r=>i("pvt_config","sample",r)}),l.createElement(o,{label:"PVT \u8868\u6E29\u5EA6\uFF08K\uFF09",type:"number",value:x.pvt_config?.temperature,onChange:r=>i("pvt_config","temperature",r)}),y("temperature"),l.createElement(o,{label:"\u7269\u6027\u6765\u6E90\u4E0E\u9002\u7528\u8303\u56F4",value:x.pvt_config?.source,onChange:r=>i("pvt_config","source",r),wide:!0})),l.createElement(p,{title:"\u5B9E\u9A8C PVT \u8868",columns:["pressure","z"],rows:x.pvt||[],onChange:r=>m({pvt:r})}),l.createElement("div",{className:"sc-grid"},["injection_end","evaluation","minimum","maximum"].flatMap(r=>[y(r+"_pressure"),y(r+"_z")])),l.createElement("p",{className:"sc-note"},"\u8FD0\u884C\u672C\u8282\u70B9\u5F97\u5230\u5404\u72B6\u6001 Z\uFF1B\u7EDD\u538B\u3001\u7EDD\u6E29\u548C\u6807\u51C6\u72B6\u6001\u9F50\u5168\u65F6\u540C\u65F6\u8BA1\u7B97 Bg\u3002\u590D\u6742\u76F8\u6001\u4F7F\u7528\u6709\u4F9D\u636E\u7684\u5916\u90E8\u6210\u679C\u3002")):s==="pressure"?l.createElement("section",{className:"sc-section"},l.createElement("h3",null,"\u539F\u59CB\u6D4B\u538B\u3001\u89E3\u91CA\u503C\u4E0E\u91C7\u7528\u503C"),l.createElement("div",{className:"sc-grid"},l.createElement(o,{label:"\u538B\u529B\u5904\u7406\u65B9\u5F0F",value:x.pressure_config?.mode||"adopted",options:[["adopted","\u5DF2\u7EDF\u4E00\u57FA\u51C6\uFF0F\u91C7\u7528\u89E3\u91CA\u538B\u529B"],["datum","\u6309\u5DF2\u77E5\u68AF\u5EA6\u6298\u7B97\u57FA\u51C6\u6DF1\u5EA6"]],onChange:r=>i("pressure_config","mode",r)}),l.createElement(o,{label:"\u539F\u59CB\u6D4B\u538B\u57FA\u51C6",value:x.pressure_config?.reference||"declared",options:[["declared","\u6CBF\u7528\u9879\u76EE\u5DF2\u58F0\u660E\u53E3\u5F84"],["gauge","\u8868\u538B\uFF0C\u663E\u5F0F\u52A0\u5F53\u5730\u5927\u6C14\u538B"]],onChange:r=>i("pressure_config","reference",r)}),x.pressure_config?.reference==="gauge"&&l.createElement(o,{label:"\u5F53\u5730\u5927\u6C14\u538B\uFF08MPa\uFF09",type:"number",value:x.pressure_config.atmospheric_pressure,onChange:r=>i("pressure_config","atmospheric_pressure",r)}),x.pressure_config?.mode==="datum"&&l.createElement(l.Fragment,null,l.createElement(o,{label:"\u57FA\u51C6\u5782\u6DF1\uFF08m\uFF0C\u5411\u4E0B\u4E3A\u6B63\uFF09",type:"number",value:x.pressure_config.datum_depth,onChange:r=>i("pressure_config","datum_depth",r)}),l.createElement(o,{label:"\u5DF2\u77E5\u538B\u529B\u68AF\u5EA6\uFF08MPa/m\uFF09",type:"number",value:x.pressure_config.gradient,onChange:r=>i("pressure_config","gradient",r)})),l.createElement(o,{label:"\u6743\u91CD\u4F9D\u636E",value:x.pressure_weight_basis,onChange:r=>m({pressure_weight_basis:r})}),l.createElement(o,{label:"\u6D4B\u538B\u72B6\u6001\u4E0E\u6765\u6E90",value:x.pressure_source,onChange:r=>m({pressure_source:r})})),l.createElement("p",{className:"sc-note"},"\u89E3\u91CA\u538B\u529B\u586B\u5199\u540E\u987B\u6709\u9010\u4E95\u6765\u6E90\u3002\u5173\u4E95\u65F6\u957F\u4FDD\u7559\u4F5C\u4EE3\u8868\u6027\u68C0\u67E5\uFF0C\u4E0D\u81EA\u52A8\u52A0\u51CF\u5386\u53F2\u538B\u5DEE\u3002"),["start_pressures","end_pressures"].map((r,A)=>l.createElement(p,{key:r,title:A?"\u672B\u671F\u72B6\u6001\u6D4B\u538B":"\u8D77\u59CB\u72B6\u6001\u6D4B\u538B",columns:["name","pressure","interpreted_pressure","weight","depth","shut_in_days","source"],rows:x[r]||[],onChange:P=>m({[r]:P})})),l.createElement("details",null,l.createElement("summary",null,"\u76F4\u63A5\u91C7\u7528\u4EE3\u8868\u538B\u529B"),l.createElement("div",{className:"sc-grid"},y("injection_end_pressure"),y("evaluation_pressure")),l.createElement("p",null,"\u6709\u6D4B\u538B\u8BB0\u5F55\u65F6\u6309\u8BB0\u5F55\u5904\u7406\u5E76\u52A0\u6743\uFF0C\u7ED3\u679C\u4F20\u9012\u81F3\u5E93\u5B58\u8282\u70B9\u3002"))):s==="connectivity"?l.createElement("section",{className:"sc-section"},l.createElement("h3",null,"\u4E95\u95F4\u54CD\u5E94\u4E0E\u8BC4\u4EF7\u8FB9\u754C"),d.storage_type==="salt_cavern"?l.createElement("p",{className:"sc-note"},"\u76D0\u7A74\u6309\u72EC\u7ACB\u8154\u4F53\u8BC4\u4EF7\uFF0C\u672C\u8282\u70B9\u6807\u8BB0\u4E0D\u9002\u7528\u3002\u8154\u4F53\u51C0\u5BB9\u79EF\u5728\u538B\u529B\u7A97\u53E3\u8282\u70B9\u5F55\u5165\u3002"):l.createElement(l.Fragment,null,l.createElement(o,{label:"\u4E95\u5BF9\u3001\u89C2\u6D4B\u65F6\u6BB5\u4E0E\u8D44\u6599\u6765\u6E90",value:x.connectivity?.source,onChange:r=>i("connectivity","source",r),wide:!0}),l.createElement("div",{className:"sc-grid"},l.createElement(o,{label:"\u6700\u5927\u6EDE\u540E\u70B9\u6570",type:"number",value:x.connectivity?.max_lag??2,onChange:r=>i("connectivity","max_lag",r)}),l.createElement(u,{label:"\u5148\u5BF9\u538B\u529B\u5E8F\u5217\u4F5C\u4E00\u9636\u5DEE\u5206",value:x.connectivity?.difference!==!1,onChange:r=>i("connectivity","difference",r)})),l.createElement(p,{title:"\u540C\u6B65\u538B\u529B\u54CD\u5E94",columns:["time","x","y"],rows:x.connectivity?.series||[],onChange:r=>i("connectivity","series",r)}),l.createElement(o,{label:"\u5730\u8D28\u3001\u8BD5\u4E95\u8BC1\u636E\u4E0E\u5206\u533A\u89E3\u91CA",type:"textarea",value:x.connectivity?.interpretation,onChange:r=>i("connectivity","interpretation",r),wide:!0}),l.createElement("p",{className:"sc-note"},"\u9700\u8981\u81F3\u5C115\u4E2A\u7B49\u95F4\u9694\u540C\u6B65\u89C2\u6D4B\u70B9\u3002\u76F8\u5173\u6027\u548C\u6EDE\u540E\u53EA\u4F5C\u54CD\u5E94\u8BC1\u636E\uFF0C\u5206\u533A\u987B\u7ED3\u5408\u5730\u8D28\u3001\u8BD5\u4E95\u4E0E\u8BA1\u91CF\u8FB9\u754C\u3002")),l.createElement(o,{label:"\u672C\u5355\u5143\u8303\u56F4\u4E0E\u53C2\u6570\u6765\u6E90",value:x.source,onChange:r=>m({source:r}),wide:!0}),l.createElement(u,{label:"\u5404\u5355\u5143\u8303\u56F4\u4E0D\u91CD\u53E0\uFF0C\u6C14\u91CF\u91C7\u7528\u4E00\u81F4\u6807\u51C6\u72B6\u6001\u548C\u65F6\u95F4\u8FB9\u754C",value:d.non_overlapping,onChange:r=>n({non_overlapping:r})})):null}function rs({result:s,dirty:d,cat:f,onMethod:n}){if(!s?.run)return l.createElement("div",{className:"sc-node-empty"},"\u586B\u5199\u672C\u8282\u70B9\u6240\u9700\u8D44\u6599\u540E\uFF0C\u70B9\u51FB\u201C\u8FD0\u884C\u672C\u8282\u70B9\u201D\u3002\u5176\u4ED6\u8282\u70B9\u7F3A\u9879\u4E0D\u4F1A\u963B\u6B62\u672C\u8282\u70B9\u8FD0\u884C\u3002");let t=s.run,o=d||s.status==="stale",u=t.rows||[],p=Array.from(new Set(u.flatMap(m=>Object.keys(m)))),x={...Object.fromEntries((f?.terms||[]).map(m=>[m.key,m.name])),...Object.fromEntries(Object.entries(f?.fields||{}).map(([m,_])=>[m,_.label])),response_correlation:"\u54CD\u5E94\u76F8\u5173\u7CFB\u6570",response_lag:"\u54CD\u5E94\u6EDE\u540E\u65F6\u95F4",effective_capacity:"\u6709\u6548\u5E93\u5BB9\u91CF",cushion:"\u4E0B\u9650\u6C14\u91CF"};return l.createElement("section",{className:"sc-node-result","aria-label":"\u8282\u70B9\u8BA1\u7B97\u7ED3\u679C"},l.createElement("div",{className:"sc-section-head"},l.createElement("h3",null,"\u672C\u8282\u70B9\u7ED3\u679C"),l.createElement("span",{className:o?"sc-warning":"sc-muted"},o?"\u8F93\u5165\u5DF2\u6539\u53D8\uFF0C\u9700\u91CD\u7B97":ts[t.status])),t.errors?.map((m,_)=>l.createElement("p",{className:"sc-alert",key:_},m)),!!Object.keys(t.values||{}).length&&l.createElement("dl",{className:"sc-node-values"},Object.entries(t.values).map(([m,_])=>l.createElement("div",{key:m},l.createElement("dt",null,x[m]||m),l.createElement("dd",null,ss(_),l.createElement("small",null,f?.fields?.[m]?.unit||(m.endsWith("_inventory")||["geological_swing","working_gas","capacity","effective_capacity","movable_cushion","deliverable_swing","cushion"].includes(m)?"\u4EBFm\xB3":m==="peak_rate"?"\u4E07m\xB3/d":"")))))),t.recommendation&&l.createElement("div",{className:"sc-note"},"\u63A8\u8350\uFF1A",f.methods.find(m=>m.id===t.recommendation.method)?.name,"\u3002",t.recommendation.reason,l.createElement("button",{disabled:o,onClick:()=>n(t.recommendation.method)},"\u91C7\u7528\u63A8\u8350\u65B9\u6CD5")),t.steps?.map((m,_)=>l.createElement("p",{key:_},m)),t.warnings?.map((m,_)=>l.createElement("p",{key:_,className:"sc-muted"},m)),u.length>0&&l.createElement("details",{open:u.length<20},l.createElement("summary",null,"\u660E\u7EC6\u8BB0\u5F55\uFF08",u.length,"\uFF09"),l.createElement("div",{className:"sc-table-wrap sc-result-table"},l.createElement("table",{className:"sc-table"},l.createElement("thead",null,l.createElement("tr",null,p.map(m=>l.createElement("th",{key:m},m)))),l.createElement("tbody",null,u.map((m,_)=>l.createElement("tr",{key:_},p.map(i=>l.createElement("td",{key:i},ss(m[i]))))))))),l.createElement("small",{className:"sc-muted"},"\u8BA1\u7B97\u65F6\u95F4 ",t.created_at?.replace("T"," ").slice(0,19)," UTC \xB7 \u8F93\u5165\u7248\u672C"," ",t.input_hash?.slice(0,12)))}function xs(){try{return Math.max(280,Math.min(640,Number(localStorage.getItem("sc-assistant-width"))||350))}catch{return 350}}function os({record:s,node:d,index:f,busy:n,send:t,upload:o,adopt:u,undo:p,hidden:x,close:m,cat:_}){let[i,y]=_e(xs),[r,A]=_e(""),[P,N]=_e([]),[c,S]=_e([]),[j,H]=_e(!1),I=Te(),X=Te(),E=Te(null);if(Re(()=>{X.current?.scrollIntoView?.({block:"nearest"})},[s?.messages?.length,n]),Re(()=>{A(""),N([]),S([])},[s?.id]),!s||x)return null;let a=(s.proposals||[]).filter(h=>h.status==="pending"),v=h=>{let z=h.split(".").at(-1);return _?.fields?.[z]?.label||{storage_type:"\u5EFA\u5E93\u7C7B\u578B",method:"\u4E3B\u8BC4\u4F30\u65B9\u6CD5",rock_type:"\u5CA9\u6027",new_unit:"\u65B0\u5EFA\u5355\u5143",pressure_representative:"\u538B\u529B\u4EE3\u8868\u6027",water_drive:"\u6C34\u4F53\u5F71\u54CD"}[z]||h};return l.createElement("aside",{className:"sc-assistant",style:{width:i},"aria-label":"\u8BC4\u4F30\u52A9\u624B"},l.createElement("div",{className:"sc-resizer",role:"separator",tabIndex:0,"aria-label":"\u8C03\u6574\u8BC4\u4F30\u52A9\u624B\u5BBD\u5EA6","aria-orientation":"vertical","aria-valuemin":280,"aria-valuemax":640,"aria-valuenow":i,onPointerDown:h=>{E.current={x:h.clientX,width:i},h.currentTarget.setPointerCapture?.(h.pointerId)},onPointerMove:h=>{E.current&&y(Math.max(280,Math.min(640,E.current.width+E.current.x-h.clientX)))},onPointerUp:()=>{E.current=null;try{localStorage.setItem("sc-assistant-width",String(i))}catch{}},onPointerCancel:()=>{E.current=null},onKeyDown:h=>{if(["ArrowLeft","ArrowRight"].includes(h.key)){h.preventDefault();let z=Math.max(280,Math.min(640,i+(h.key==="ArrowLeft"?20:-20)));y(z);try{localStorage.setItem("sc-assistant-width",String(z))}catch{}}}}),l.createElement("header",null,l.createElement("div",null,l.createElement("strong",null,"\u8BC4\u4F30\u52A9\u624B"),l.createElement("small",null,Ne.find(h=>h[0]===d)?.[1],!gs.has(d)&&` \xB7 ${s.case.units[f]?.name||"\u5F85\u9009\u5355\u5143"}`)),l.createElement("button",{className:"sc-icon-button",onClick:m,"aria-label":"\u6536\u8D77\u8BC4\u4F30\u52A9\u624B",title:"\u6536\u8D77\u8BC4\u4F30\u52A9\u624B"},l.createElement(B,{name:"panel"}))),l.createElement("div",{className:"sc-chat-history","aria-live":"polite"},!s.messages?.length&&l.createElement("div",{className:"sc-chat-welcome"},l.createElement("p",null,"\u53EF\u4EE5\u4E0A\u4F20\u8D44\u6599\uFF0C\u6216\u544A\u8BC9\u6211\u9700\u8981\u586B\u5199\u3001\u6838\u5BF9\u7684\u5185\u5BB9\u3002"),l.createElement("button",{disabled:n,onClick:()=>A("\u68C0\u67E5\u5F53\u524D\u8282\u70B9\u8FD8\u7F3A\u54EA\u4E9B\u8D44\u6599\uFF0C\u5E76\u8BF4\u660E\u53D6\u503C\u4F9D\u636E\u3002")},"\u68C0\u67E5\u5F53\u524D\u8282\u70B9\u7F3A\u9879"),l.createElement("button",{disabled:n,onClick:()=>A("\u6839\u636E\u5DF2\u6709\u8D44\u6599\u5224\u65AD\u5EFA\u5E93\u7C7B\u578B\u3001\u5CA9\u6027\u4E0E\u65B9\u6CD5\uFF0C\u5217\u51FA\u4F9D\u636E\u548C\u5F85\u786E\u8BA4\u9879\u3002")},"\u5224\u65AD\u7C7B\u578B\u4E0E\u65B9\u6CD5")),(s.messages||[]).map((h,z)=>l.createElement("article",{key:z,className:`sc-message sc-message-${h.role}`},l.createElement("small",null,h.role==="user"?"\u4F60":"\u8BC4\u4F30\u52A9\u624B"),h.role==="assistant"&&(h.applied>0||h.pending>0)?l.createElement(l.Fragment,null,l.createElement("div",null,h.applied>0?`\u5DF2\u586B\u5199 ${h.applied} \u9879\u6570\u636E\u3002`:"\u5DF2\u6574\u7406\u5019\u9009\u53D6\u503C\uFF0C\u8BF7\u6838\u5BF9\u6765\u6E90\u540E\u91C7\u7528\u3002"),l.createElement("details",null,l.createElement("summary",null,"\u67E5\u770B\u8D44\u6599\u8BC6\u522B\u8BF4\u660E"),l.createElement("div",null,h.text))):l.createElement("div",null,h.text),h.applied>0&&l.createElement("small",null,"\u5DF2\u586B\u5199 ",h.applied," \u9879\uFF0C\u76F8\u5173\u7ED3\u679C\u9700\u66F4\u65B0"),h.pending>0&&l.createElement("small",null,"\u6709 ",h.pending," \u9879\u5019\u9009\uFF0C\u89C1\u4E0B\u65B9"),h.rejected?.map((O,K)=>l.createElement("small",{key:K,className:"sc-warning"},"\u672A\u91C7\u7528\uFF1A",O)))),a.length>0&&l.createElement("section",{className:"sc-proposals"},l.createElement("strong",null,"\u5019\u9009\u53D6\u503C\uFF08",a.length,"\uFF09"),a.map(h=>l.createElement("div",{key:h.id},l.createElement("b",null,v(h.path)),l.createElement("p",null,typeof h.value=="object"?`${h.value.length} \u6761\u8BB0\u5F55`:es(h.value)),h.previous!=null&&l.createElement("small",null,"\u539F\u503C\uFF1A",typeof h.previous=="object"?"\u5DF2\u6709\u8BB0\u5F55":es(h.previous)),l.createElement("small",null,h.reason),l.createElement("details",null,l.createElement("summary",null,"\u67E5\u770B\u6765\u6E90"),l.createElement("p",null,h.source.location,"\uFF1A",h.source.quote)),l.createElement("button",{disabled:n,onClick:()=>u([h.id])},"\u91C7\u7528\u6B64\u9879"))),l.createElement("button",{disabled:n,onClick:()=>u(a.map(h=>h.id))},"\u91C7\u7528\u4EE5\u4E0A\u5019\u9009")),s.last_edit&&l.createElement("button",{className:"sc-link",disabled:n,onClick:p},"\u64A4\u9500\u6700\u8FD1\u4E00\u6B21\u5BF9\u8BDD\u586B\u8868"),n&&l.createElement("p",{className:"sc-muted",role:"status"},"\u6B63\u5728\u5904\u7406\uFF0C\u8BF7\u7A0D\u5019\u2026"),l.createElement("div",{ref:X})),l.createElement("div",{className:"sc-chat-compose"},l.createElement("button",{className:"sc-link",onClick:()=>H(h=>!h)},"\u53C2\u8003\u9879\u76EE\u8D44\u6599\uFF08",c.length,"\uFF09"),j&&l.createElement("div",{className:"sc-chat-sources"},s.case.documents?.map(h=>l.createElement("label",{key:h.id},l.createElement("input",{type:"checkbox",disabled:n,checked:c.includes(h.id),onChange:z=>S(O=>z.target.checked?[...O,h.id].slice(0,20):O.filter(K=>K!==h.id))}),h.name)),!s.case.documents?.length&&l.createElement("small",null,"\u53EF\u4ECE\u4E0B\u65B9\u4E0A\u4F20\u8D44\u6599\u3002")),P.length>0&&l.createElement("div",{className:"sc-attachments"},P.map((h,z)=>l.createElement("span",{key:z},h.name,l.createElement("button",{disabled:n,onClick:()=>N(O=>O.filter((K,J)=>J!==z)),"aria-label":`\u79FB\u9664\u9644\u4EF6${h.name}`},"\xD7")))),l.createElement("div",{className:"sc-compose-box"},l.createElement("textarea",{"aria-label":"\u4E0E\u8BC4\u4F30\u52A9\u624B\u5BF9\u8BDD",placeholder:"\u63CF\u8FF0\u95EE\u9898\u3001\u586B\u5199\u6570\u503C\uFF0C\u6216\u9644\u4E0A\u8D44\u6599\u2026",value:r,disabled:n,onChange:h=>A(h.target.value),onKeyDown:h=>{h.key==="Enter"&&(h.ctrlKey||h.metaKey)&&(h.preventDefault(),h.currentTarget.parentElement.querySelector("button.sc-primary")?.click())}}),l.createElement("div",{className:"sc-actions"},l.createElement("button",{disabled:n,onClick:()=>I.current.click()},l.createElement(B,{name:"plus"}),"\u6DFB\u52A0\u6587\u4EF6"),l.createElement("input",{ref:I,hidden:!0,type:"file",multiple:!0,"aria-label":"\u5BF9\u8BDD\u6295\u5582\u8D44\u6599",accept:".xlsx,.csv,.tsv,.json,.pptx,.pdf,.docx,.txt,.md",onChange:h=>{N(z=>[...z,...Array.from(h.target.files)].slice(0,20)),h.target.value=""}}),l.createElement("button",{className:"sc-primary",disabled:n||!r.trim()&&!P.length,onClick:async()=>{await t(r.trim()||"\u8BFB\u53D6\u672C\u6B21\u9644\u4EF6\uFF0C\u5C06\u672C\u5468\u671F\u6709\u660E\u786E\u4F9D\u636E\u7684\u6570\u636E\u586B\u5165\u5BF9\u5E94\u8868\u5355\uFF0C\u7C7B\u578B\u548C\u65B9\u6CD5\u7ED9\u51FA\u5019\u9009\u3002",P,c)&&(A(""),N([]))}},"\u53D1\u9001")))))}var Se=window.QwenPaw,e=Se.host.React,{useState:W,useEffect:ze,useRef:Pe,useId:vs}=e,ws=()=>e.createElement("svg",{width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.6",strokeLinejoin:"round",strokeLinecap:"round","aria-hidden":!0,style:{verticalAlign:"middle",flexShrink:0}},e.createElement("path",{d:"M5.6 10.2a6.4 6.4 0 0 1 12.8 0m-6.4-.1 2.9-3"}),e.createElement("path",{d:"M2.6 16.8c4.15-.35 5.65-4.15 9.4-4.15s5.25 3.8 9.4 4.15"}),e.createElement("path",{d:"M2.6 20.8c4.15-.35 5.65-4.15 9.4-4.15s5.25 3.8 9.4 4.15"})),ys="/storage-capacity",Ae=document.createElement("style");Ae.id="storage-capacity-styles";Ae.textContent=We;document.getElementById(Ae.id)?.remove();document.head.appendChild(Ae);var Ce=s=>JSON.parse(JSON.stringify(s));function ks(s,d){if(s?.schema_version!==2||!Array.isArray(s.units))throw Error("\u8BF7\u4F7F\u7528\u7B2C 2 \u7248\u8BC4\u4F30\u6570\u636E\u683C\u5F0F");let f={...s,documents:s.documents||[],history:s.history||[],benchmarks:s.benchmarks||[]};for(let n of["standard","design","ledger","sources"]){if(s[n]!==void 0&&(!s[n]||Array.isArray(s[n])||typeof s[n]!="object"))throw Error(`${n} \u683C\u5F0F\u65E0\u6548`);f[n]=s[n]||{}}return f.units=s.units.map(n=>{if(!n||typeof n!="object"||Array.isArray(n))throw Error("\u5355\u5143\u683C\u5F0F\u65E0\u6548");let t={...Ce(d),...n};for(let o of["parameters","conditions","external","evidence"]){if(n[o]!==void 0&&(!n[o]||Array.isArray(n[o])||typeof n[o]!="object"))throw Error(`${o} \u683C\u5F0F\u65E0\u6548`);t[o]={...d[o],...n[o]}}for(let o of["series","pvt","wells","schedule","start_pressures","end_pressures"])if(t[o]=n[o]||[],!Array.isArray(t[o]))throw Error(`${o} \u683C\u5F0F\u65E0\u6548`);return t}),f}var de=(s,d="POST")=>({method:d,headers:{"Content-Type":"application/json"},body:JSON.stringify(s)});async function F(s,d,f=!1){let n=await Se.host.fetch(ys+s,d);if(!n.ok){let t=await n.json().catch(()=>({}));throw Error(typeof t.detail=="string"?t.detail:`\u64CD\u4F5C\u672A\u5B8C\u6210\uFF08${n.status}\uFF09`)}return f?n:n.json()}async function is(s,d){let f=await F(s,void 0,!0),n=URL.createObjectURL(await f.blob()),t=document.createElement("a");t.href=n,t.download=d,document.body.appendChild(t),t.click(),t.remove(),setTimeout(()=>URL.revokeObjectURL(n),1e3)}var ne=s=>s==null||s===""?"\u672A\u8BA1\u7B97":Number(s).toLocaleString("zh-CN",{maximumFractionDigits:4}),Ie={name:"\u5355\u5143\uFF0F\u4E95\u540D",weight:"\u6743\u91CD",source:"\u6765\u6E90",interpreted_pressure:"\u89E3\u91CA\u538B\u529B\uFF08MPa\uFF09",depth:"\u6D4B\u70B9\u5782\u6DF1\uFF08m\uFF09",shut_in_days:"\u5173\u4E95\u5929\u6570",time:"\u76F8\u5BF9\u65F6\u95F4",x:"\u4E95 A \u538B\u529B\uFF08MPa\uFF09",y:"\u4E95 B \u538B\u529B\uFF08MPa\uFF09",pressure:"\u538B\u529B\uFF08MPa\uFF09",z:"Z \u56E0\u5B50",cumulative_produced:"\u672C\u6BB5\u7D2F\u91C7\u91CF\uFF08\u4EBFm\xB3\uFF09",phase:"\u9636\u6BB5 withdrawal",day:"\u533A\u95F4\u7ED3\u675F\u65E5",rate:"\u533A\u95F4\u5E73\u5747\u65E5\u91CF\uFF08\u4E07m\xB3/d\uFF09",a:"\u7CFB\u6570 A",b:"\u7CFB\u6570 B",reservoir_pressure:"\u5730\u5C42\u7EDD\u538B\uFF08MPa\uFF09",bottomhole_pressure:"\u4E95\u5E95\u7EDD\u538B\uFF08MPa\uFF09",observed:"\u89C2\u6D4B\u503C",simulated:"\u6A21\u62DF\u503C",cycle_id:"\u5468\u671F",book_inventory:"\u8D26\u9762\u5E93\u5B58",effective_inventory:"\u6709\u6548\u5E93\u5B58",geological_swing:"\u5730\u5C42\u8C03\u5CF0\u6C14\u91CF",deliverable_swing:"\u7EFC\u5408\u8C03\u5CF0\u80FD\u529B",peak_rate:"\u51B2\u5CF0\u80FD\u529B"};function M({label:s,value:d,onChange:f,type:n="text",options:t,help:o,wide:u=!1,disabled:p=!1}){let x=vs();return e.createElement("label",{className:"sc-field"+(u?" sc-span":""),htmlFor:x},e.createElement("span",null,s),t?e.createElement("select",{id:x,value:d??"",onChange:m=>f(m.target.value),disabled:p},t.map(m=>e.createElement("option",{key:m.value??m[0],value:m.value??m[0]},m.label??m[1]))):n==="textarea"?e.createElement("textarea",{id:x,value:d??"",onChange:m=>f(m.target.value),disabled:p}):e.createElement("input",{id:x,type:n,step:n==="number"?"any":void 0,value:d??"",onChange:m=>f(n==="number"?m.target.value===""?null:Number(m.target.value):m.target.value),disabled:p}),o&&e.createElement("small",null,o))}function pe({label:s,value:d,onChange:f}){return e.createElement("label",{className:"sc-check"},e.createElement("input",{type:"checkbox",checked:!!d,onChange:n=>f(n.target.checked)}),s)}function we({title:s,columns:d,rows:f,onChange:n}){return e.createElement("div",null,e.createElement("div",{className:"sc-section-head"},e.createElement("h4",null,s),e.createElement("button",{onClick:()=>n([...f,{}])},"\u6DFB\u52A0\u8BB0\u5F55")),f.length>0&&e.createElement("div",{className:"sc-table-wrap"},e.createElement("table",{className:"sc-table"},e.createElement("thead",null,e.createElement("tr",null,d.map(t=>e.createElement("th",{key:t},Ie[t]||t)),e.createElement("th",null))),e.createElement("tbody",null,f.map((t,o)=>e.createElement("tr",{key:o},d.map(u=>e.createElement("td",{key:u},e.createElement("input",{"aria-label":`${s} \u7B2C${o+1}\u884C ${Ie[u]||u}`,type:["name","cycle_id","phase","source"].includes(u)?"text":"number",step:"any",value:t[u]??"",onChange:p=>n(f.map((x,m)=>m===o?{...x,[u]:["name","cycle_id","phase","source"].includes(u)?p.target.value:p.target.value===""?null:Number(p.target.value)}:x))}))),e.createElement("td",null,e.createElement("button",{className:"sc-link",onClick:()=>n(f.filter((u,p)=>o!==p)),"aria-label":`\u5220\u9664${s}\u7B2C${o+1}\u884C`},"\u79FB\u9664"))))))))}function _s({points:s,xlabel:d="\u7D2F\u91C7\u91CF\uFF08\u4EBFm\xB3\uFF09",ylabel:f="p/Z\uFF08MPa\uFF09"}){if(s.length<2)return null;let n=720,t=230,o=s.map(r=>r.x),u=s.flatMap(r=>[r.y,r.fitted??r.y]),p=Math.min(...o),x=Math.max(...o),m=Math.min(...u),_=Math.max(...u),i=r=>58+(r-p)/(x-p||1)*630,y=r=>180-(r-m)/(_-m||1)*145;return e.createElement("svg",{className:"sc-chart",viewBox:`0 0 ${n} ${t}`,role:"img","aria-label":`${d}\u4E0E${f}\u5173\u7CFB\u66F2\u7EBF`},e.createElement("path",{d:"M58 25V180H690",fill:"none",stroke:"#adb6c3"}),[0,.5,1].map(r=>e.createElement("g",{key:r},e.createElement("text",{x:"48",y:y(m+r*(_-m))+4,textAnchor:"end"},ne(m+r*(_-m))),e.createElement("text",{x:i(p+r*(x-p)),y:"200",textAnchor:"middle"},ne(p+r*(x-p))))),e.createElement("polyline",{points:s.map(r=>`${i(r.x)},${y(r.fitted??r.y)}`).join(" "),stroke:"#0d76fd",strokeWidth:"1.5",fill:"none"}),s.map((r,A)=>e.createElement("circle",{key:A,cx:i(r.x),cy:y(r.y),r:"3",fill:"#0d76fd"})),e.createElement("text",{x:"70",y:"17"},f),e.createElement("text",{x:"380",y:"224",textAnchor:"middle"},d))}function Ns({doc:s,cat:d,record:f,apply:n,run:t}){let[o,u]=W(s.tables[0]?.id||""),[p,x]=W("units"),[m,_]=W(1),[i,y]=W(s.tables[0]?.rows.length||1),[r,A]=W({}),[P,N]=W({}),[c,S]=W(0),[j,H]=W([]),I=s.tables.find(a=>a.id===o),X=I?.rows[m-1]||[],E=()=>t(async()=>{let a=await F(`/cases/${f.id}/documents/${s.id}/map`,de({table_id:o,kind:p,start_row:m,end_row:i,mapping:r,factors:P}));H(a.errors),a.errors.length||n(p,a.records,Number(c))});return e.createElement("div",{className:"sc-source"},e.createElement("div",{className:"sc-section-head"},e.createElement("h3",null,s.name),e.createElement("button",{onClick:()=>t(()=>is(`/cases/${f.id}/documents/${s.id}/original`,s.name))},"\u4E0B\u8F7D\u539F\u4EF6")),s.warnings.map((a,v)=>e.createElement("p",{key:v,className:"sc-note"},a)),s.case_candidate&&e.createElement("div",{className:"sc-note"},"\u5305\u542B\u5B8C\u6574\u8BC4\u4F30\u53C2\u6570\u3002\u5BFC\u5165\u5C06\u66FF\u6362\u5F53\u524D\u586B\u5199\u5185\u5BB9\uFF0C\u539F\u59CB\u8D44\u6599\u4FDD\u7559\u3002",e.createElement("button",{onClick:()=>n("case",s.case_candidate)},"\u91C7\u7528\u8BE5\u8BC4\u4F30\u53C2\u6570")),I&&e.createElement(e.Fragment,null,e.createElement("div",{className:"sc-grid"},e.createElement(M,{label:"\u5DE5\u4F5C\u8868\uFF0F\u8868\u683C",value:o,options:s.tables.map(a=>[a.id,a.label]),onChange:a=>{u(a),y(s.tables.find(v=>v.id===a).rows.length),A({})}}),e.createElement(M,{label:"\u8868\u5934\u884C\u53F7",type:"number",value:m,onChange:a=>{_(Math.max(1,a||1)),A({})}}),e.createElement(M,{label:"\u6570\u636E\u7ED3\u675F\u884C\u53F7\uFF08\u542B\uFF09",type:"number",value:i,onChange:y})),e.createElement("div",{className:"sc-table-wrap"},e.createElement("table",{className:"sc-table"},e.createElement("tbody",null,I.rows.slice(Math.max(0,m-1),Math.min(i,m+11)).map((a,v)=>e.createElement("tr",{key:v},e.createElement("th",null,m+v),a.map((h,z)=>e.createElement("td",{key:z},String(h??"")))))))),e.createElement("p",{className:"sc-muted"},"\u9884\u89C8\u524D 12 \u884C\uFF1B\u6620\u5C04\u4F7F\u7528\u6240\u9009\u5B8C\u6574\u884C\u8303\u56F4\u3002\u8868\u5934\u4E4B\u540E\u4E3A\u6570\u636E\u884C\u3002\u5408\u5E76\u8868\u683C\u9700\u9009\u62E9\u542B\u5B57\u6BB5\u540D\u79F0\u7684\u884C\u3002"),e.createElement("div",{className:"sc-grid"},e.createElement(M,{label:"\u8D44\u6599\u7528\u9014",value:p,onChange:a=>{x(a),A({}),N({})},options:Object.keys(d.mapping_fields).map(a=>[a,{units:"\u5206\u5355\u5143\u53C2\u6570",series:"p/Z \u91C7\u6C14\u5E8F\u5217",pvt:"\u538B\u529B\u4E0E Z \u56E0\u5B50\u8868",wells:"\u4E8C\u9879\u5F0F\u4EA7\u80FD\u53C2\u6570",schedule:"\u91C7\u6C14\u9884\u6D4B\u66F2\u7EBF",history:"\u591A\u5468\u671F\u6210\u679C",history_match:"\u5386\u53F2\u62DF\u5408\u6570\u636E"}[a]])}),!["units","history"].includes(p)&&e.createElement(M,{label:"\u5E94\u7528\u5230\u8BC4\u4F30\u5355\u5143",value:c,onChange:S,options:f.case.units.map((a,v)=>[v,a.name])})),e.createElement("details",{open:!0},e.createElement("summary",null,"\u5B57\u6BB5\u5BF9\u5E94\u4E0E\u5355\u4F4D\u6362\u7B97"),e.createElement("div",{className:"sc-map-grid"},d.mapping_fields[p].map(a=>e.createElement("div",{className:"sc-map-field",key:a},e.createElement(M,{label:d.fields[a]?.label||Ie[a]||a,value:r[a]??"",options:[["","\u4E0D\u5BFC\u5165"],...X.map((v,h)=>[h,`\u7B2C ${h+1} \u5217 \xB7 ${String(v??"\u7A7A")}`])],onChange:v=>A(h=>{let z={...h};return v===""?delete z[a]:z[a]=Number(v),z})}),e.createElement(M,{label:"\u4E58\u6570",value:P[a]??1,options:[[1,"\xD71"],[1e-4,"\u4E07\u2192\u4EBF"],[1e-8,"m\xB3\u2192\u4EBF"],[.001,"kPa\u2192MPa"],[.01,"bar\u2192MPa"],[1e4,"\u4E07\u2192m\xB3"],[1e8,"\u4EBF\u2192m\xB3"]],onChange:v=>N({...P,[a]:Number(v)})})))),e.createElement("p",{className:"sc-note"},"\u76EE\u6807\u6C14\u91CF\u5355\u4F4D\u4E3A\u4EBF\u6807\u51C6 m\xB3\u3001\u538B\u529B\u4E3A MPa\u3002\u6C34\u4FB5\u548C\u8154\u4F53\u4F53\u79EF\u4E3A m\xB3\uFF0C\u4EA7\u80FD\u6D41\u91CF\u4E3A\u4E07 m\xB3/d\u3002\u6807\u51C6\u72B6\u6001\u4E0E\u538B\u529B\u57FA\u51C6\u9700\u5728\u8BC4\u4F30\u8303\u56F4\u4E2D\u5355\u72EC\u6838\u5BF9\u3002"),e.createElement("button",{className:"sc-primary",onClick:E,disabled:!Object.keys(r).length||!["units","history"].includes(p)&&!f.case.units.length},"\u5BFC\u5165\u6240\u9009\u5B57\u6BB5"),j.map((a,v)=>e.createElement("p",{className:"sc-error",key:v},a)))),s.pages.length>0&&e.createElement("details",{open:!I},e.createElement("summary",null,"\u63D0\u53D6\u7684\u539F\u6587\uFF08",s.pages.length," \u6BB5\uFF09"),s.pages.map((a,v)=>e.createElement("details",{key:v},e.createElement("summary",null,a.label),e.createElement("pre",null,a.text||"\u672A\u53D6\u5F97\u6587\u5B57\uFF0C\u8BF7\u67E5\u770B\u539F\u4EF6")))))}function zs({data:s,edit:d,cat:f}){return e.createElement("section",null,e.createElement("div",{className:"sc-section"},e.createElement("h3",null,"\u50A8\u6C14\u5E93\u4E0E\u8BC4\u4F30\u8FB9\u754C"),e.createElement("div",{className:"sc-grid"},e.createElement(M,{label:"\u50A8\u6C14\u5E93\uFF0F\u9879\u76EE\u540D\u79F0",value:s.case_name,onChange:n=>d({case_name:n})}),e.createElement(M,{label:"\u8BC4\u4F30\u5468\u671F",value:s.cycle_id,onChange:n=>d({cycle_id:n}),help:"\u4F8B\u5982 2025\u20132026\uFF0C\u4E0D\u80FD\u7528\u6587\u4EF6\u4E0A\u4F20\u65F6\u95F4\u4EE3\u66FF"}),e.createElement(M,{label:"\u8BC4\u4F30\u4EFB\u52A1",value:s.purpose,options:[["cycle","\u5468\u671F\u8BC4\u4F30"],["calibration","\u9636\u6BB5\u6807\u5B9A"],["design_review","\u8BBE\u8BA1\u590D\u6838"],["forecast","\u5269\u4F59\u80FD\u529B\u9884\u6D4B"]],onChange:n=>d({purpose:n})}),e.createElement(M,{label:"\u5EFA\u5E93\u7C7B\u578B",value:s.storage_type,options:[["auto","\u6839\u636E\u8D44\u6599\u5224\u65AD"],...f.storage_types.map(n=>[n.value,n.label])],onChange:n=>d({storage_type:n})}),e.createElement(M,{label:"\u5CA9\u6027",value:s.rock_type,options:[["auto","\u6839\u636E\u8D44\u6599\u5224\u65AD"],["sandstone","\u7802\u5CA9"],["carbonate","\u78B3\u9178\u76D0\u5CA9"],["fractured","\u88C2\u7F1D\uFF0F\u6D1E\u7A74"],["salt","\u76D0\u5CA9"],["other","\u5176\u4ED6"]],onChange:n=>d({rock_type:n})}),e.createElement(M,{label:"\u50A8\u96C6\u7A7A\u95F4",value:s.reservoir_medium||"auto",options:[["auto","\u6839\u636E\u8D44\u6599\u5224\u65AD"],["pore","\u5B54\u9699\u578B"],["fracture","\u88C2\u7F1D\u578B"],["cavity","\u5B54\u6D1E\u578B"],["mixed","\u590D\u5408\u578B"],["cavern","\u4EBA\u5DE5\u8154\u4F53"]],onChange:n=>d({reservoir_medium:n})}),e.createElement(M,{label:"\u8FD0\u884C\u9636\u6BB5",value:s.operating_stage||"auto",options:[["auto","\u6839\u636E\u8D44\u6599\u5224\u65AD"],["development","\u6269\u5BB9\u8FBE\u4EA7"],["stable","\u7A33\u5B9A\u8FD0\u884C"],["changed","\u4E95\u7F51\u6216\u5DE5\u827A\u8C03\u6574\u540E"]],onChange:n=>d({operating_stage:n})}),e.createElement(M,{label:"\u65B0\u5355\u5143\u65B9\u6CD5\u504F\u597D",value:s.method_preference||"auto",options:[["auto","\u6839\u636E\u8D44\u6599\u63A8\u8350"],...f.methods.map(n=>[n.id,n.name])],onChange:n=>d({method_preference:n})}),e.createElement(M,{label:"\u538B\u529B\u53E3\u5F84",value:s.pressure_basis,options:[["","\u8BF7\u9009\u62E9"],["absolute","\u7EDD\u5BF9\u538B\u529B"],["apparent_formation","\u89C6\u5730\u5C42\u538B\u529B"],["report_defined","\u62A5\u544A\u5B9A\u4E49\u53E3\u5F84"]],onChange:n=>d({pressure_basis:n})}),e.createElement(M,{label:"\u91C7\u6C14\u6BB5\u8D77\u59CB\u72B6\u6001",value:s.start_state,onChange:n=>d({start_state:n}),help:"\u65E5\u671F\u6216\u660E\u786E\u7684\u72B6\u6001\u7F16\u53F7"}),e.createElement(M,{label:"\u91C7\u6C14\u6BB5\u672B\u671F\u72B6\u6001",value:s.end_state,onChange:n=>d({end_state:n})}))),e.createElement("div",{className:"sc-section"},e.createElement("h3",null,"\u6807\u51C6\u72B6\u6001\u4E0E\u8BA1\u91CF\u8FB9\u754C"),e.createElement(M,{label:"\u6C14\u91CF\u53E3\u5F84\u786E\u8BA4\u65B9\u5F0F",value:s.standard.mode||"verified",options:[["verified","\u6309\u8BA1\u91CF\u6587\u4EF6\u786E\u8BA4\u6807\u51C6\u6E29\u538B"],["reported","\u6CBF\u7528\u540C\u4E00\u62A5\u544A\u6C14\u91CF\u53E3\u5F84\uFF0C\u6807\u51C6\u6E29\u538B\u5F85\u6838\u5B9E"]],onChange:n=>d({standard:{...s.standard,mode:n}}),help:"\u62A5\u544A\u53E3\u5F84\u4EC5\u652F\u6301\u7269\u8D28\u5E73\u8861\u7684\u6761\u4EF6\u590D\u7B97\uFF1B\u72B6\u6001\u65B9\u7A0B\u548C\u8DE8\u6765\u6E90\u6C14\u91CF\u6BD4\u8F83\u5FC5\u987B\u6838\u5B9E\u6807\u51C6\u6E29\u538B\u3002"}),e.createElement("div",{className:"sc-grid"},[["temperature","\u6807\u51C6\u6E29\u5EA6\uFF08K\uFF09"],["pressure","\u6807\u51C6\u7EDD\u538B\uFF08MPa\uFF09"],["z","\u6807\u51C6\u72B6\u6001 Z \u56E0\u5B50"]].map(([n,t])=>e.createElement(M,{key:n,label:t,type:"number",value:s.standard[n],onChange:o=>d({standard:{...s.standard,[n]:o}})})),e.createElement(M,{label:"\u6807\u51C6\u72B6\u6001\u4F9D\u636E",value:s.standard.source,onChange:n=>d({standard:{...s.standard,source:n}}),wide:!0,help:"\u6309\u8BA1\u91CF\u6587\u4EF6\u586B\u5199\uFF1B\u6E29\u6807\u3001\u4F53\u79EF\u57FA\u51C6\u6216\u7EC4\u5206\u4E0D\u540C\u7684\u8D44\u6599\u5148\u6362\u7B97\u518D\u6BD4\u8F83"}))),e.createElement("div",{className:"sc-section"},e.createElement("div",{className:"sc-section-head"},e.createElement("h3",null,"\u8BC4\u4F30\u5355\u5143"),e.createElement("button",{onClick:()=>d({units:[...s.units,{...Ce(f.unit_template),name:`\u8BC4\u4F30\u5355\u5143 ${s.units.length+1}`,method:s.method_preference||"auto"}]})},"\u6DFB\u52A0\u5355\u5143")),e.createElement("p",{className:"sc-muted"},"\u6309\u5C42\u7CFB\u3001\u8FDE\u901A\u533A\u3001\u4E95\u63A7\u8303\u56F4\u6216\u72EC\u7ACB\u76D0\u7A74\u5212\u5206\u3002\u4E00\u4E2A\u5355\u5143\u53EF\u91C7\u7528\u4E00\u79CD\u4E3B\u65B9\u6CD5\uFF0C\u5176\u4ED6\u6210\u679C\u7528\u4E8E\u4EA4\u53C9\u6BD4\u8F83\u3002"),s.units.map((n,t)=>e.createElement("div",{key:t,className:"sc-unit"},e.createElement("div",{className:"sc-grid"},e.createElement(M,{label:`\u5355\u5143 ${t+1} \u540D\u79F0`,value:n.name,onChange:o=>d({units:s.units.map((u,p)=>p===t?{...u,name:o}:u)})}),e.createElement(M,{label:"\u8303\u56F4\u4E0E\u53C2\u6570\u6765\u6E90",value:n.source,onChange:o=>d({units:s.units.map((u,p)=>p===t?{...u,source:o}:u)})}),e.createElement("button",{onClick:()=>d({units:s.units.filter((o,u)=>u!==t)})},"\u79FB\u9664\u5355\u5143")))),s.units.length===0&&e.createElement("p",{className:"sc-note"},"\u5148\u6DFB\u52A0\u4E00\u4E2A\u8BC4\u4F30\u5355\u5143\uFF0C\u6216\u5728\u8D44\u6599\u9875\u5BFC\u5165\u5206\u5355\u5143\u53C2\u6570\u8868\u3002"),s.units.length>1&&e.createElement(pe,{label:"\u5404\u5355\u5143\u8303\u56F4\u4E0D\u91CD\u53E0\uFF0C\u6C14\u91CF\u91C7\u7528\u4E00\u81F4\u6807\u51C6\u72B6\u6001\u548C\u65F6\u95F4\u8FB9\u754C",value:s.non_overlapping,onChange:n=>d({non_overlapping:n})})),e.createElement("details",null,e.createElement("summary",null,"\u6807\u51C6\u4E0E\u672F\u8BED"),e.createElement("div",{className:"sc-help"},f.standards.map(n=>e.createElement("p",{key:n.id},e.createElement("strong",null,n.id," ",n.name),e.createElement("br",null),n.basis,n.url&&e.createElement(e.Fragment,null," ",e.createElement("a",{href:n.url,target:"_blank",rel:"noreferrer"},"\u6807\u51C6\u76EE\u5F55")))),f.terms.map(n=>e.createElement("p",{key:n.key},e.createElement("strong",null,n.name),"\u3000",n.definition)))))}function Cs({data:s,edit:d}){let[f,n]=W(Object.keys(s.ledger||{}).length?"ledger":"direct");return e.createElement("div",{className:"sc-section"},e.createElement("h3",null,"\u5168\u5E93\u8BA1\u91CF\u4E0E\u8BBE\u8BA1\u6307\u6807"),e.createElement("div",{className:"sc-grid"},e.createElement(M,{label:"\u8D26\u9762\u5E93\u5B58\u6765\u6E90",value:f,options:[["direct","\u76F4\u63A5\u5F55\u5165\u5DF2\u6838\u5B9E\u503C"],["ledger","\u4ECE\u8BA1\u91CF\u5E73\u8861\u8BA1\u7B97"]],onChange:t=>{n(t),d({book_inventory:null,ledger:{}})}}),f==="direct"?e.createElement(e.Fragment,null,e.createElement(M,{label:"\u8D77\u59CB\u72B6\u6001\u8D26\u9762\u5E93\u5B58\uFF08\u4EBFm\xB3\uFF09",value:s.book_inventory,type:"number",onChange:t=>d({book_inventory:t})}),e.createElement(M,{label:"\u8D26\u9762\u5E93\u5B58\u4F9D\u636E",value:s.sources?.book_inventory,onChange:t=>d({sources:{...s.sources,book_inventory:t}})})):e.createElement(e.Fragment,null,[["initial_inventory","\u671F\u521D\u5E93\u5B58"],["injected","\u7D2F\u8BA1\u6CE8\u6C14"],["withdrawn","\u7D2F\u8BA1\u91C7\u6C14"],["metered_loss","\u5DF2\u6838\u5B9E\u635F\u8017"],["equivalent_gas","\u6DB2\u4F53\u5F53\u91CF\u6C14\u91C7\u51FA\u91CF"]].map(([t,o])=>e.createElement(M,{key:t,label:o+"\uFF08\u4EBFm\xB3\uFF09",value:s.ledger?.[t],type:"number",onChange:u=>d({ledger:{...s.ledger,[t]:u}})})),e.createElement(M,{label:"\u8BA1\u91CF\u533A\u95F4\u4E0E\u6765\u6E90",value:s.ledger?.source,onChange:t=>d({ledger:{...s.ledger,source:t}}),wide:!0})),e.createElement(M,{label:"\u8BBE\u8BA1\u5E93\u5BB9\u91CF\uFF08\u4EBFm\xB3\uFF09",value:s.design.capacity,type:"number",onChange:t=>d({design:{...s.design,capacity:t}})}),e.createElement(M,{label:"\u8BBE\u8BA1\u5DE5\u4F5C\u6C14\u91CF\uFF08\u4EBFm\xB3\uFF09",value:s.design.working_gas,type:"number",onChange:t=>d({design:{...s.design,working_gas:t}})}),e.createElement(M,{label:"\u8BBE\u8BA1\u51B2\u5CF0\u80FD\u529B\uFF08\u4E07m\xB3/d\uFF09",value:s.design.peak_rate,type:"number",onChange:t=>d({design:{...s.design,peak_rate:t}})}),e.createElement(M,{label:"\u8BBE\u8BA1\u4F9D\u636E",value:s.design.source,onChange:t=>d({design:{...s.design,source:t}}),wide:!0})),e.createElement("p",{className:"sc-note"},"\u8BA1\u91CF\u5E73\u8861\u5E94\u7ED3\u675F\u4E8E\u672C\u6B21\u91C7\u6C14\u6BB5\u8D77\u59CB\u72B6\u6001\u3002\u635F\u8017\u3001\u6DB2\u4F53\u5F53\u91CF\u6C14\u9700\u663E\u5F0F\u586B\u5199\u6838\u5B9E\u503C\u6216\u96F6\uFF1B\u5B83\u4EEC\u4E0E\u672A\u52A8\u7528\u5E93\u5B58\u5206\u5F00\u8BA1\u7B97\u3002"))}function Ms({data:s,edit:d,cat:f,stage:n="inventory"}){let t=(o,u)=>d({units:s.units.map((p,x)=>o===x?{...p,...u}:p)});return e.createElement("section",null,!s.units.length&&e.createElement("p",{className:"sc-note"},"\u8BF7\u5148\u5728\u8BC4\u4F30\u8303\u56F4\u4E2D\u6DFB\u52A0\u5355\u5143\u3002"),s.units.map((o,u)=>{let p=f.methods.find(i=>i.id===o.method)||{name:"\u5F85\u9009\u65B9\u6CD5",mode:"calculation",fields:[],required:[],condition:"\u8FD0\u884C\u65B9\u6CD5\u8282\u70B9\u67E5\u770B\u63A8\u8350\u53CA\u9002\u7528\u6027\uFF1B\u8D44\u6599\u4E0D\u8DB3\u65F6\u4FDD\u7559\u5F85\u5224\u3002",formula:"",reference:""},x=(i,y)=>t(u,{conditions:{...o.conditions,[i]:y}}),m=(i,y)=>t(u,{parameters:{...o.parameters,[i]:y},evidence:{...o.evidence,...o.evidence?.[i]?{[i]:{...o.evidence[i],edited:!0,location:"\u624B\u5DE5\u4FEE\u6539\uFF1B\u539F\u59CB\u5B9A\u4F4D\uFF1A"+(o.evidence[i].original_location||o.evidence[i].location),original_location:o.evidence[i].original_location||o.evidence[i].location}}:{}}}),_=(i,y)=>t(u,{external:{...o.external,[i]:y}});return e.createElement("div",{className:"sc-unit",key:u},e.createElement("div",{className:"sc-unit-top"},e.createElement("h3",null,o.name),e.createElement("span",{className:"sc-muted"},p.mode==="external"?"\u771F\u5B9E\u5916\u90E8\u6210\u679C\u590D\u6838":"\u786E\u5B9A\u6027\u8BA1\u7B97")),n==="methods"&&e.createElement(e.Fragment,null,e.createElement("div",{className:"sc-grid"},e.createElement(M,{label:"\u4E3B\u8BC4\u4F30\u65B9\u6CD5",value:o.method,options:[["auto","\u6839\u636E\u8D44\u6599\u63A8\u8350"],...f.methods.map(i=>[i.id,i.name])],onChange:i=>t(u,{method:i})}),e.createElement(M,{label:"\u6C34\u4F53\u5F71\u54CD",value:o.conditions.water_drive,options:[["unknown","\u5C1A\u672A\u5224\u65AD"],["none","\u65E0\u6C34\u4FB5"],["weak","\u5F31\u6C34\u4FB5\uFF0C\u5DF2\u8BBA\u8BC1\u53EF\u5FFD\u7565"],["moderate","\u4E2D\u7B49\u6C34\u4FB5"],["strong","\u5F3A\u6C34\u4FB5"]],onChange:i=>x("water_drive",i)}),e.createElement(M,{label:"\u6D41\u4F53\u4E0E\u76F8\u6001",value:o.conditions.fluid,options:[["unknown","\u5C1A\u672A\u5224\u65AD"],["dry_gas","\u5E72\u6C14\uFF0C\u6C14\u76F8\u4E3A\u4E3B"],["stable_gas","\u6CB9\u73AF\uFF0F\u51DD\u6790\u5F71\u54CD\u5DF2\u8BBA\u8BC1\u53EF\u5FFD\u7565"],["oil","\u6CB9\u73AF\u6216\u6CB9\u6C14\u6C34\u4F20\u8D28\u663E\u8457"],["condensate","\u51DD\u6790\u5F71\u54CD\u663E\u8457"]],onChange:i=>x("fluid",i)}),e.createElement(M,{label:"\u4E95\u95F4\u5E72\u6270",value:o.conditions.interference,options:[["unknown","\u5C1A\u672A\u5224\u65AD"],["none","\u65E0\u660E\u663E\u5E72\u6270"],["weak","\u5F31\u5E72\u6270\u3001\u4E95\u63A7\u8303\u56F4\u4E0D\u91CD\u53E0"],["strong","\u5F3A\u5E72\u6270"]],onChange:i=>x("interference",i)}),e.createElement(M,{label:"\u53C2\u6570\u4E0E\u9002\u7528\u6027\u4F9D\u636E",value:o.source,onChange:i=>t(u,{source:i}),wide:!0}),e.createElement(M,{label:"\u9002\u7528\u6761\u4EF6\u786E\u8BA4\u65B9\u5F0F",value:o.condition_basis||"verified",options:[["verified","\u7ECF\u8D44\u6599\u6838\u67E5\u786E\u8BA4"],["reported","\u6CBF\u7528\u539F\u62A5\u544A\u524D\u63D0\uFF0C\u4F5C\u6761\u4EF6\u590D\u7B97"]],onChange:i=>t(u,{condition_basis:i})})),e.createElement(pe,{label:"\u5DF2\u6838\u5B9E\u672C\u5355\u5143\u538B\u529B\uFF0F\u4F53\u79EF\u7684\u4EE3\u8868\u6027\u3001\u5355\u5143\u8FB9\u754C\u53CA\u53D6\u503C\u4F9D\u636E",value:o.conditions.pressure_representative,onChange:i=>x("pressure_representative",i)}),["pz","pz_regression","water_mbe"].includes(o.method)&&e.createElement(pe,{label:"\u672C\u6BB5\u5185\u65E0\u540C\u671F\u6CE8\u6C14\uFF0C\u5B54\u9699\u4F53\u79EF\u53EF\u8FD1\u4F3C\u4E0D\u53D8\uFF1B\u4E24\u72B6\u6001\u538B\u529B\u4F7F\u7528\u76F8\u540C\u53E3\u5F84",value:o.conditions.closed_during_segment,onChange:i=>x("closed_during_segment",i)}),o.method==="water_mbe"&&e.createElement(pe,{label:"\u6C34\u4FB5\u91CF\u3001\u4EA7\u6C34\u91CF\u4E0E\u6C34\u4F53\u79EF\u7CFB\u6570\u5DF2\u6709\u72EC\u7ACB\u6838\u5B9E\u4F9D\u636E",value:o.conditions.water_volume_verified,onChange:i=>x("water_volume_verified",i)})),e.createElement("details",{className:"sc-method-context"},e.createElement("summary",null,p.name,e.createElement("span",null,"\u9002\u7528\u6761\u4EF6\u4E0E\u4F9D\u636E")),e.createElement("p",null,p.condition,e.createElement("br",null),p.reference)),e.createElement("div",{className:"sc-formula"},p.formula),["inventory","window"].includes(n)&&e.createElement("div",{className:"sc-grid"},p.fields.filter(i=>n==="window"||!i.startsWith("minimum")&&!i.startsWith("maximum")).map(i=>e.createElement(M,{key:i,label:`${f.fields[i].label}\uFF08${f.fields[i].unit}\uFF09${p.required.includes(i)?" *":""}`,type:"number",value:o.parameters[i],onChange:y=>m(i,y)}))),n==="inventory"&&o.method==="pz_regression"&&e.createElement(we,{title:"\u540C\u4E00\u91C7\u6C14\u6BB5 p/Z \u5E8F\u5217",columns:["cumulative_produced","pressure","z"],rows:o.series||[],onChange:i=>t(u,{series:i})}),["inventory","window","deliverability"].includes(n)&&p.mode==="external"&&e.createElement(e.Fragment,null,e.createElement("div",{className:"sc-grid"},[["software","\u89E3\u91CA\uFF0F\u6A21\u62DF\u8F6F\u4EF6"],["model_version","\u6A21\u578B\u7248\u672C"],["run_id","\u8FD0\u884C\u7F16\u53F7"],["input_reference","\u8F93\u5165\u7248\u672C\uFF0F\u6821\u9A8C\u6458\u8981"],["source","\u6210\u679C\u6587\u4EF6\u4E0E\u4F4D\u7F6E"],["cycle_id","\u6210\u679C\u5468\u671F"],["state","\u6210\u679C\u8D77\u59CB\u72B6\u6001"],["match_metric","\u5386\u53F2\u62DF\u5408\u6307\u6807"],["match_unit","\u62DF\u5408\u6307\u6807\u5355\u4F4D"]].map(([i,y])=>e.createElement(M,{key:i,label:y,value:o.external?.[i],onChange:r=>_(i,r)})),["effective_inventory","geological_swing","deliverable_swing","movable_cushion","capacity","working_gas"].map(i=>e.createElement(M,{key:i,label:(f.terms.find(y=>y.key===i)?.name||i)+"\uFF08\u4EBFm\xB3\uFF09",value:o.external?.[i],type:"number",onChange:y=>_(i,y)}))),e.createElement(pe,{label:"\u5916\u90E8\u6C14\u91CF\u5DF2\u6362\u7B97\u4E3A\u4EBF\u6807\u51C6 m\xB3\uFF0C\u4E14\u6807\u51C6\u72B6\u6001\u4E0E\u5F53\u524D\u8BC4\u4F30\u4E00\u81F4",value:o.external?.gas_volume_unit==="1e8_sm3"&&JSON.stringify(o.external?.standard)===JSON.stringify(s.standard),onChange:i=>t(u,{external:{...o.external,gas_volume_unit:i?"1e8_sm3":"",standard:i?Ce(s.standard):null}})}),e.createElement(we,{title:"\u5386\u53F2\u62DF\u5408\u8BB0\u5F55",columns:["observed","simulated"],rows:o.external?.history_match||[],onChange:i=>_("history_match",i)})),n==="inventory"&&o.method==="pz"&&e.createElement("details",null,e.createElement("summary",null,"\u8F93\u5165\u654F\u611F\u6027"),e.createElement(M,{label:"\u5355\u56E0\u7D20\u6270\u52A8\u5E45\u5EA6\uFF08%\uFF0C\u4E0D\u5927\u4E8E 10\uFF09",type:"number",value:o.sensitivity_percent,onChange:i=>t(u,{sensitivity_percent:i})}),e.createElement("p",{className:"sc-muted"},"\u9010\u9879\u6270\u52A8\u91C7\u6C14\u91CF\u3001\u538B\u529B\u548C Z\uFF0C\u663E\u793A\u7ED3\u679C\u53D8\u5316\uFF1B\u4E0D\u4F5C\u4E3A\u6982\u7387\u7F6E\u4FE1\u533A\u95F4\u3002")),n==="deliverability"&&e.createElement("details",{open:!0},e.createElement("summary",null,"\u7EFC\u5408\u8C03\u5CF0\u4E0E\u51B2\u5CF0\u7EA6\u675F"),e.createElement(M,{label:"\u9884\u6D4B\u65B9\u5F0F",value:o.forecast?.mode||"schedule",options:[["schedule","\u5BFC\u5165\u9884\u6D4B\u66F2\u7EBF\uFF0F\u56FA\u5B9A\u5DE5\u51B5\u4EA7\u80FD"],["dynamic","\u65E5\u6B65\u957F\u5E93\u5B58\u2014\u538B\u529B\u2014\u4EA7\u80FD\u8026\u5408"]],onChange:i=>t(u,{forecast:{...o.forecast,mode:i}})}),o.forecast?.mode==="dynamic"&&e.createElement(pe,{label:"\u5DF2\u6838\u5B9E\u4E95\u5E95\u6D41\u538B\u7684\u4E95\u7B52\u4E0E\u5916\u8F93\u4F9D\u636E\uFF0C\u4EE5\u53CA\u4EA7\u80FD\u7CFB\u6570\u5355\u4F4D\u4E3A\u4E07m\xB3/d",value:o.forecast?.boundary_verified,onChange:i=>t(u,{forecast:{...o.forecast,boundary_verified:i}})}),e.createElement("div",{className:"sc-grid"},e.createElement(M,{label:"\u65B9\u6848\u91C7\u6C14\u671F\uFF08\u5929\uFF09",value:o.withdrawal_days,type:"number",onChange:i=>t(u,{withdrawal_days:i})}),e.createElement(M,{label:"\u5355\u5143\u5730\u9762\u5904\u7406\u9650\u989D\uFF08\u4E07m\xB3/d\uFF09",value:o.surface_limit,type:"number",onChange:i=>t(u,{surface_limit:i})}),e.createElement(M,{label:"\u9884\u6D4B\u66F2\u7EBF\u4F9D\u636E\u4E0E\u5916\u8F93\u6761\u4EF6",value:o.schedule_source,onChange:i=>t(u,{schedule_source:i})})),e.createElement("p",{className:"sc-note"},"\u66F2\u7EBF\u8F93\u5165\u4E3A\u5404\u65F6\u95F4\u6BB5\u5E73\u5747\u65E5\u91C7\u6C14\u91CF\uFF0C\u5FC5\u987B\u8986\u76D6\u5B8C\u6574\u91C7\u6C14\u671F\u3002\u7B97\u6CD5\u5206\u6BB5\u79EF\u5206\u5E76\u65BD\u52A0\u5730\u9762\u4E0A\u9650\uFF0C\u518D\u4E0E\u5730\u5C42\u8C03\u5CF0\u6C14\u91CF\u53D6\u5C0F\u503C\u3002\u4E95\u5E95\u538B\u529B\u9700\u6765\u81EA\u4E95\u7B52\uFF0F\u7BA1\u7F51\u8BA1\u7B97\uFF0C\u4E0D\u4EE5\u4E95\u53E3\u538B\u529B\u66FF\u4EE3\u3002"),e.createElement(we,{title:"\u91C7\u6C14\u9884\u6D4B",columns:["day","rate"],rows:o.schedule||[],onChange:i=>t(u,{schedule:i})}),e.createElement(we,{title:"\u4E8C\u9879\u5F0F\u4EA7\u80FD",columns:["name","a","b","reservoir_pressure","bottomhole_pressure"],rows:o.wells||[],onChange:i=>t(u,{wells:i})})))}),n==="deliverability"&&s.units.length>1&&e.createElement(pe,{label:"\u5404\u5355\u5143\u5730\u9762\u8BBE\u65BD\u53CA\u5916\u8F93\u901A\u9053\u5B8C\u5168\u72EC\u7ACB\uFF0C\u53EF\u6309\u540C\u5468\u671F\u6210\u679C\u6C47\u603B\u7EFC\u5408\u8C03\u5CF0\u80FD\u529B",value:s.independent_surface,onChange:o=>d({independent_surface:o})}),e.createElement(M,{label:"\u9879\u76EE\u5047\u8BBE\u4E0E\u5F85\u786E\u8BA4\u4E8B\u9879",type:"textarea",value:s.assumptions,onChange:o=>d({assumptions:o})}),s.units.length>1&&e.createElement(M,{label:"\u5168\u5E93\u5171\u7528\u5730\u9762\u5904\u7406\u80FD\u529B\uFF08\u4E07m\xB3/d\uFF09",type:"number",value:s.site_surface_limit,onChange:o=>d({site_surface_limit:o})}),e.createElement("p",{className:"sc-note"},"\u4FDD\u5B58\u540E\u8FD0\u884C\u8BA1\u7B97\u3002\u6761\u4EF6\u4E0D\u6EE1\u8DB3\u6216\u8D44\u6599\u4E0D\u9F50\u5168\u65F6\uFF0C\u5C55\u793A\u5177\u4F53\u7F3A\u9879\uFF0C\u5176\u4ED6\u5355\u5143\u53EF\u72EC\u7ACB\u5B8C\u6210\uFF1B\u5168\u5E93\u6307\u6807\u53EA\u5728\u5B8C\u6574\u8303\u56F4\u5177\u5907\u540C\u53E3\u5F84\u7ED3\u679C\u65F6\u6C47\u603B\u3002"))}function $s({evaluation:s,review:d,cat:f,stale:n,busy:t,onReview:o}){if(!s)return e.createElement("div",{className:"sc-empty"},e.createElement("h2",null,"\u5C1A\u672A\u8BA1\u7B97"),e.createElement("p",null,"\u786E\u8BA4\u8BC4\u4F30\u8303\u56F4\u548C\u8F93\u5165\u53C2\u6570\u540E\uFF0C\u8FD0\u884C\u8BA1\u7B97\u5373\u53EF\u67E5\u770B\u5206\u5355\u5143\u7ED3\u679C\u3001\u7F3A\u9879\u4E0E\u65B9\u6CD5\u5EFA\u8BAE\u3002"));let u=s;return e.createElement("section",null,e.createElement("div",{className:"sc-results-head"},e.createElement("div",null,e.createElement("h3",null,u.status==="calculated"?"\u8BA1\u7B97\u7ED3\u679C":"\u5F85\u8865\u5145\u8D44\u6599\u4E0E\u6761\u4EF6"),e.createElement("p",{className:"sc-muted"},u.summary)),e.createElement("button",{disabled:n||t,onClick:o},"\u65B9\u6CD5\u5BA1\u67E5")),n&&e.createElement("p",{className:"sc-note"},"\u8F93\u5165\u5DF2\u4FEE\u6539\uFF0C\u4EE5\u4E0B\u4E3A\u4E0A\u6B21\u8BA1\u7B97\u5FEB\u7167\u3002\u91CD\u65B0\u8BA1\u7B97\u540E\u624D\u80FD\u751F\u6210\u5F53\u524D\u62A5\u544A\u3002"),u.metrics.length>0&&e.createElement("div",{className:"sc-metrics"},u.metrics.filter(p=>["book_inventory","effective_inventory","deliverable_swing","capacity","working_gas"].includes(p.key)).slice(0,3).map(p=>e.createElement("div",{className:"sc-metric",key:p.key},e.createElement("span",null,p.label),e.createElement("strong",null,ne(p.value),e.createElement("small",null,p.unit))))),e.createElement("div",{className:"sc-table-wrap"},e.createElement("table",{className:"sc-table"},e.createElement("thead",null,e.createElement("tr",null,e.createElement("th",null,"\u6307\u6807"),e.createElement("th",null,"\u7ED3\u679C"),e.createElement("th",null,"\u5355\u4F4D"),e.createElement("th",null,"\u4F9D\u636E"))),e.createElement("tbody",null,u.metrics.map(p=>e.createElement("tr",{key:p.key},e.createElement("td",null,p.label),e.createElement("td",{className:"sc-number"},ne(p.value)),e.createElement("td",null,p.unit),e.createElement("td",null,p.source)))))),e.createElement("div",{className:"sc-section"},e.createElement("h3",null,"\u8D44\u6599\u4E0E\u53E3\u5F84\u68C0\u67E5"),e.createElement("div",{className:"sc-table-wrap"},e.createElement("table",{className:"sc-table"},e.createElement("tbody",null,u.checks.map((p,x)=>e.createElement("tr",{key:x},e.createElement("td",null,p.label),e.createElement("td",{className:"sc-"+(p.status==="passed"?"ok":p.status)},{passed:"\u901A\u8FC7",warning:"\u9700\u590D\u6838",error:"\u5F85\u8865\u5145"}[p.status]),e.createElement("td",null,p.detail))))))),u.comparisons?.length>0&&e.createElement("div",{className:"sc-section"},e.createElement("h3",null,"\u4EA4\u53C9\u6821\u9A8C"),e.createElement("div",{className:"sc-table-wrap"},e.createElement("table",{className:"sc-table"},e.createElement("thead",null,e.createElement("tr",null,e.createElement("th",null,"\u6307\u6807"),e.createElement("th",null,"\u8BA1\u7B97\u503C"),e.createElement("th",null,"\u5BF9\u6BD4\u503C"),e.createElement("th",null,"\u504F\u5DEE"),e.createElement("th",null,"\u4F9D\u636E"))),e.createElement("tbody",null,u.comparisons.map((p,x)=>e.createElement("tr",{key:x},e.createElement("td",null,f.terms.find(m=>m.key===p.metric)?.name||p.metric),e.createElement("td",null,ne(p.calculated)),e.createElement("td",null,ne(p.value)),e.createElement("td",null,ne(p.difference_percent),"%"),e.createElement("td",null,p.source))))))),u.units.map((p,x)=>e.createElement("div",{className:"sc-unit",key:x},e.createElement("div",{className:"sc-unit-top"},e.createElement("h3",null,p.name),e.createElement("span",{className:"sc-muted"},f.methods.find(m=>m.id===p.method)?.name," \xB7"," ",p.status==="calculated"?"\u5DF2\u8BA1\u7B97":"\u5F85\u8865\u5145")),p.errors.map((m,_)=>e.createElement("p",{className:"sc-error",key:_},m)),e.createElement("p",{className:"sc-note"},"\u65B9\u6CD5\u5EFA\u8BAE\uFF1A",f.methods.find(m=>m.id===p.recommendation.method)?.name,"\u3002",p.recommendation.reason),p.warnings?.map((m,_)=>e.createElement("p",{className:"sc-warning",key:_},m)),p.steps?.map((m,_)=>e.createElement("div",{className:"sc-formula",key:_},m)),p.plot&&e.createElement(_s,{points:p.plot}),e.createElement("div",{className:"sc-table-wrap"},e.createElement("table",{className:"sc-table"},e.createElement("tbody",null,Object.entries(p.values||{}).map(([m,_])=>e.createElement("tr",{key:m},e.createElement("td",null,f.terms.find(i=>i.key===m)?.name||{cushion:"\u538B\u529B\u7A97\u53E3\u4E0B\u9650\u6C14\u91CF",effective_capacity:"\u6709\u6548\u5E93\u5BB9\u91CF"}[m]||m),e.createElement("td",{className:"sc-number"},ne(_)),e.createElement("td",null,m==="peak_rate"?"\u4E07m\xB3/d":"\u4EBFm\xB3")))))),p.diagnostics&&e.createElement("details",null,e.createElement("summary",null,"\u62DF\u5408\u4E0E\u8BA1\u7B97\u8BCA\u65AD"),e.createElement("div",{className:"sc-table-wrap"},e.createElement("table",{className:"sc-table"},e.createElement("tbody",null,Object.entries(p.diagnostics).filter(([m])=>m!=="residuals").map(([m,_])=>e.createElement("tr",{key:m},e.createElement("td",null,{start_pz:"\u8D77\u59CB p/Z",end_pz:"\u672B\u671F p/Z",inverse_withdrawal_fraction:"\u64A4\u91C7\u6BD4\u4F8B\u5012\u6570",intercept:"\u56DE\u5F52\u622A\u8DDD",slope:"\u56DE\u5F52\u659C\u7387",r_squared:"\u62DF\u5408\u4F18\u5EA6 R\xB2",rmse:"\u5747\u65B9\u6839\u8BEF\u5DEE",mae:"\u5E73\u5747\u7EDD\u5BF9\u8BEF\u5DEE",n:"\u6837\u672C\u6570",metric:"\u6307\u6807",unit:"\u5355\u4F4D",schedule_integral:"\u91C7\u6C14\u66F2\u7EBF\u79EF\u5206\uFF08\u4EBFm\xB3\uFF09",net_water_reservoir_m3:"\u51C0\u6C34\u4FB5\u91CF\uFF08\u5730\u5C42m\xB3\uFF09",bg_depletion:"\u4F53\u79EF\u7CFB\u6570\u53D8\u5316"}[m]||m),e.createElement("td",null,typeof _=="number"?ne(_):String(_)))))))),p.sensitivity&&e.createElement("details",null,e.createElement("summary",null,"\u8F93\u5165\u6270\u52A8 \xB1",p.sensitivity.percent,"%"),e.createElement("p",{className:"sc-muted"},p.sensitivity.label),e.createElement("table",{className:"sc-table"},e.createElement("thead",null,e.createElement("tr",null,e.createElement("th",null,"\u8F93\u5165"),e.createElement("th",null,"\u8D1F\u5411\u6270\u52A8\u7ED3\u679C"),e.createElement("th",null,"\u6B63\u5411\u6270\u52A8\u7ED3\u679C"))),e.createElement("tbody",null,p.sensitivity.rows.map(m=>e.createElement("tr",{key:m.parameter},e.createElement("td",null,m.parameter),e.createElement("td",null,ne(m.minus)),e.createElement("td",null,ne(m.plus))))))))),e.createElement("div",{className:"sc-section"},e.createElement("h3",null,"\u5DE5\u7A0B\u65B9\u6CD5\u5BA1\u67E5"),e.createElement("div",{className:"sc-prose"},d?.status==="completed"?d.text:"\u5C1A\u672A\u8C03\u7528\u5E93\u5B58\u8BC4\u4EF7\u667A\u80FD\u4F53\u3002\u9700\u8981\u5224\u65AD\u65B9\u6CD5\u3001\u538B\u529B\u4EE3\u8868\u6027\u6216\u5DEE\u5F02\u539F\u56E0\u65F6\uFF0C\u70B9\u51FB\u201C\u65B9\u6CD5\u5BA1\u67E5\u201D\u3002\u8BA1\u7B97\u7ED3\u679C\u4E0D\u4F9D\u8D56\u667A\u80FD\u4F53\u53EF\u7528\u6027\u3002")),e.createElement("details",null,e.createElement("summary",null,"\u8BA1\u7B97\u8BB0\u5F55"),e.createElement("p",{className:"sc-muted"},"\u7248\u672C ",u.engine_version,"\uFF0C\u5B9E\u9645\u8BA1\u7B97\u8017\u65F6 ",u.duration_ms," ms\uFF0C",new Date(u.created_at).toLocaleString("zh-CN")),e.createElement("p",{className:"sc-prose"},"\u8F93\u5165 SHA-256\uFF1A",u.fingerprint)))}function js(){let[s,d]=W(null),[f,n]=W([]),[t,o]=W(null),[u,p]=W("scope"),[x,m]=W("inputs"),[_,i]=W(!1),[y,r]=W(!1),[A,P]=W(""),[N,c]=W(null),[S,j]=W(null),[H,I]=W(null),[X,E]=W(""),[a,v]=W(0),[h,z]=W(null),[O,K]=W(!1),[J,Y]=W(!1),[ce,re]=W(!1),[Q,te]=W(null),ue=Pe(0),fe=Pe(),Me=Pe(),k=Pe(0),w=t?.case;ze(()=>m("inputs"),[u]),ze(()=>{fe.current&&(fe.current.scrollTop=0)},[x,u,a]),ze(()=>{t&&a>=t.case.units.length&&v(0)},[t?.case.units.length,a]);let $=async(b=t,C=a)=>{if(!b)return;let D=await F(`/cases/${b.id}/workflow?unit_index=${C}`);z(D)};ze(()=>{if(!t?.id)return;let b=!0;return F(`/cases/${t.id}/workflow?unit_index=${a}`).then(C=>{b&&z(C)}).catch(C=>{b&&P(C.message)}),()=>{b=!1}},[t?.id,t?.revision,a]);let L=async b=>{if(!y){r(!0),P("");try{return await b()}catch(C){P(C.message)}finally{r(!1)}}},G=async()=>n((await F("/cases")).cases);ze(()=>{let b=!0;return Promise.all([F("/catalog"),F("/cases")]).then(([C,D])=>{b&&(d(C),n(D.cases))}).catch(C=>b&&P(C.message)),()=>{b=!1,k.current++}},[]);let T=b=>{y||(o(C=>({...C,case:{...C.case,...b},stale:!0})),i(!0),E(""))},me=b=>{m("inputs"),te(null),Y(!1),re(!1),o(b),i(!1),c(b.evaluation||null),j(b.review||null),I(null),E(""),v(0),z(null)},R=async()=>{if(!_)return t;let b=await F(`/cases/${t.id}`,de({revision:t.revision,case:t.case},"PUT"));return o(b),i(!1),await G(),b},he=b=>L(async()=>{t&&_&&await R();let C=++k.current,D=await F(`/cases/${b}`);C===k.current&&(me(D),p("scope"))}),ie=()=>L(async()=>{t&&_&&await R(),me(await F("/cases",de({}))),p("scope"),await G()}),Ee=()=>L(async()=>{let b=await R(),C=await F(`/cases/${b.id}/evaluate`,de({revision:b.revision}));c(C),j(null),o({...b,latest_run:C.run_id,stale:!1}),E(""),p("results")}),Le=()=>L(async()=>{let b=await R();await F(`/cases/${b.id}/nodes/${u}/run`,de({revision:b.revision,unit_index:a})),await $(b),m("charts")}),De=(b,C={})=>L(async()=>{let D=await R(),U=await F(`/cases/${D.id}/assistant/${b}`,de({revision:D.revision,...C}));return o({...U,stale:!0}),i(!1),E(""),await $(U),!0}),ls=(b,C,D)=>L(async()=>{let U=await R(),q=[...D];if(C.length){let ke=new FormData;ke.append("revision",U.revision),C.forEach(be=>ke.append("files",be)),U=await F(`/cases/${U.id}/documents`,{method:"POST",body:ke}),o({...U,stale:!0}),i(!1),E("");let us=new Set(C.map(be=>be.name));U.case.documents.filter(be=>us.has(be.name)).forEach(be=>q.push(be.id))}let ye=await F(`/cases/${U.id}/assistant`,de({revision:U.revision,node:u,unit_index:a,message:b,document_ids:[...new Set(q)].slice(0,20)}));return o({...ye,stale:!0}),i(!1),E(""),await $(ye),await G(),!0}),ps=b=>L(async()=>{if(!b.length)return;let C=await R(),D=new FormData;D.append("revision",C.revision),Array.from(b).forEach(q=>D.append("files",q));let U=await F(`/cases/${C.id}/documents`,{method:"POST",body:D});o({...U,stale:!0}),E(""),await G()}),cs=(b,C,D)=>{if(b==="case"){T({...ks(C,s.unit_template),documents:w.documents}),p("scope");return}if(b==="units"){let U=new Set(w.units.map(q=>q.name));if(C.some(q=>U.has(q.name))||new Set(C.map(q=>q.name)).size!==C.length){P("\u5355\u5143\u540D\u79F0\u91CD\u590D\uFF0C\u8BF7\u5148\u6838\u5BF9\u8303\u56F4\u6216\u4FEE\u6539\u540D\u79F0\u3002\u73B0\u6709\u5355\u5143\u672A\u8986\u76D6\u3002");return}T({units:[...w.units,...C]})}else if(b==="history")T({history:C});else{let U=Ce(w.units);if(!U[D]){P("\u8BF7\u5148\u521B\u5EFA\u76EE\u6807\u8BC4\u4F30\u5355\u5143");return}b==="history_match"?U[D].external.history_match=C:U[D][b]=C,T({units:U})}I(null),P("")},$e=_||t?.stale||!N,Oe=t&&Ve({record:t,node:u,index:a,state:h?.nodes?.find(b=>b.id===u),evaluation:N,cat:s,dirty:_}),ds=(b,C)=>{te({token:++ue.current,model:b,chart:C}),Y(!0),m("inputs")};return e.createElement("div",{className:"sc-app sc-workflow"},e.createElement("aside",{className:"sc-sidebar"},e.createElement("div",null,e.createElement("h1",{style:{display:"flex",alignItems:"center",gap:8}},e.createElement(ws,null),"\u5E93\u5BB9\u8BC4\u4F30"),e.createElement("span",{className:"sc-muted"},"UGSci \u5DE5\u7A0B\u5E94\u7528")),e.createElement("button",{className:"sc-create",disabled:y||!s,onClick:ie},e.createElement(B,{name:"plus"}),"\u65B0\u5EFA\u8BC4\u4F30"),e.createElement("label",{className:"sc-project-select"},"\u8BC4\u4F30\u9879\u76EE",e.createElement("select",{"aria-label":"\u9009\u62E9\u8BC4\u4F30\u9879\u76EE",disabled:y,value:t?.id||"",onChange:b=>b.target.value&&he(b.target.value)},e.createElement("option",{value:""},"\u9009\u62E9\u9879\u76EE"),f.map(b=>e.createElement("option",{key:b.id,value:b.id},b.name," \xB7 ",b.cycle||"\u5F85\u586B\u5468\u671F")))),t&&e.createElement(as,{active:u,select:b=>{p(b),re(!1)},nodes:h?.nodes,dirty:_,busy:y}),e.createElement("footer",null,"\u6309\u5355\u5143\u8BA1\u7B97\uFF0C\u6309\u5468\u671F\u7559\u5B58",e.createElement("br",null),"SY/T 7686-2023")),e.createElement("div",{className:"sc-center"},e.createElement("main",{className:"sc-main",style:{display:J&&ce?"none":"flex"}},e.createElement("header",{className:"sc-header"},e.createElement("div",null,e.createElement("h2",null,w?.case_name||"\u5E93\u5BB9\u8BC4\u4F30\u5DE5\u4F5C\u53F0"),e.createElement("span",{className:"sc-muted"},t?`${w.cycle_id||"\u8BC4\u4F30\u5468\u671F\u5F85\u586B\u5199"}\u3000${y?"\u6B63\u5728\u5904\u7406\u2026":_?"\u6709\u672A\u4FDD\u5B58\u4FEE\u6539":"\u5DF2\u4FDD\u5B58"}`:"\u5EFA\u7ACB\u8BC4\u4F30\u9879\u76EE\uFF0C\u6574\u7406\u8D44\u6599\u5E76\u5F62\u6210\u62A5\u544A")),t&&e.createElement("div",{className:"sc-actions"},e.createElement("button",{disabled:y||!_,onClick:()=>L(R)},"\u4FDD\u5B58"),e.createElement("button",{disabled:y,onClick:Ee},"\u8FD0\u884C\u8BA1\u7B97"),e.createElement("button",{"aria-pressed":J,onClick:()=>Y(b=>!b)},e.createElement(B,{name:"layers"}),"\u7ED3\u679C\u89C6\u7A97"),e.createElement("button",{onClick:()=>K(b=>!b)},e.createElement(B,{name:"panel"}),O?"\u5C55\u5F00\u8BC4\u4F30\u52A9\u624B":"\u6536\u8D77\u52A9\u624B"))),t&&e.createElement("div",{className:"sc-node-toolbar"},e.createElement("div",null,e.createElement("h2",null,Ne.find(b=>b[0]===u)?.[1]),e.createElement("small",{className:"sc-muted"},["scope","data","accounting","results","report"].includes(u)?"\u9879\u76EE\u7EA7\u6210\u679C":"\u6309\u5355\u5143\u5904\u7406\uFF0C\u53EF\u72EC\u7ACB\u8FD0\u884C")),e.createElement("div",{className:"sc-actions"},!["scope","data","accounting","results","report"].includes(u)&&e.createElement("select",{"aria-label":"\u5F53\u524D\u8BC4\u4F30\u5355\u5143",value:a,disabled:y,onChange:b=>{z(null),v(Number(b.target.value))}},w.units.map((b,C)=>e.createElement("option",{key:C,value:C},b.name))),e.createElement("button",{className:"sc-primary",disabled:y||!["scope","data","accounting","results","report"].includes(u)&&!w.units[a],onClick:Le},"\u8FD0\u884C\u672C\u8282\u70B9"))),t&&e.createElement("div",{className:"sc-content-tabs",role:"tablist","aria-label":"\u8282\u70B9\u89C6\u56FE"},e.createElement("button",{id:"sc-input-tab",role:"tab","aria-selected":x==="inputs","aria-controls":"sc-input-panel",onClick:()=>m("inputs")},e.createElement(B,{name:"fields"}),"\u53C2\u6570\u8D44\u6599"),e.createElement("button",{id:"sc-chart-tab",role:"tab","aria-selected":x==="charts","aria-controls":"sc-chart-panel",onClick:()=>m("charts")},e.createElement(B,{name:"chart"}),"\u56FE\u8868\u7ED3\u679C"),e.createElement("span",null,Oe?.charts.length?`${Oe.charts.length} \u9879\u56FE\u8868`:"\u8865\u5145\u8D44\u6599\u540E\u67E5\u770B\u56FE\u8868")),A&&e.createElement("div",{role:"alert",className:"sc-alert"},e.createElement("span",null,A),e.createElement("button",{className:"sc-link",onClick:()=>P("")},"\u5173\u95ED")),e.createElement("div",{ref:fe,className:"sc-body","aria-busy":y},s?t?e.createElement(e.Fragment,null,e.createElement("div",{id:"sc-input-panel",role:"tabpanel","aria-labelledby":"sc-input-tab",hidden:x!=="inputs"},u==="scope"&&e.createElement(zs,{data:w,edit:T,cat:s}),u==="data"&&e.createElement("section",null,e.createElement("div",{className:"sc-section"},e.createElement("div",{className:"sc-upload"},e.createElement("div",null,e.createElement("strong",null,"\u5BFC\u5165\u8BC4\u4F30\u8D44\u6599"),e.createElement("p",null,"Excel\u3001CSV\u3001JSON\u3001PPTX\u3001PDF\u3001Word\u3002\u4FDD\u7559\u539F\u4EF6\uFF0C\u9009\u62E9\u5B57\u6BB5\u540E\u5E94\u7528\u3002")),e.createElement("button",{disabled:y,onClick:()=>Me.current.click()},"\u9009\u62E9\u6587\u4EF6"),e.createElement("input",{ref:Me,type:"file",multiple:!0,accept:".xlsx,.csv,.tsv,.json,.pptx,.pdf,.docx,.txt,.md",hidden:!0,"aria-label":"\u4E0A\u4F20\u8BC4\u4F30\u8D44\u6599",onChange:b=>{ps(b.target.files),b.target.value=""}})),e.createElement("div",{className:"sc-table-wrap"},e.createElement("table",{className:"sc-table"},e.createElement("tbody",null,w.documents.map(b=>e.createElement("tr",{key:b.id},e.createElement("td",null,b.name),e.createElement("td",null,b.tables.length," \u5F20\u8868 / ",b.pages.length," ","\u6BB5\u6587\u5B57"),e.createElement("td",null,b.status==="manual_review"?"\u5F85\u4EBA\u5DE5\u8BFB\u53D6":"\u5DF2\u8BFB\u53D6\uFF0C\u5F85\u6838\u5BF9"),e.createElement("td",null,e.createElement("button",{className:"sc-link",disabled:y,onClick:()=>L(async()=>I(await F(`/cases/${t.id}/documents/${b.id}`)))},"\u67E5\u770B\u4E0E\u6620\u5C04"))))))),H&&e.createElement(Ns,{key:H.id,doc:H,cat:s,record:t,apply:cs,run:L})),e.createElement("details",null,e.createElement("summary",null,"\u591A\u5468\u671F\u6210\u679C"),e.createElement("p",{className:"sc-muted"},"\u53EF\u4ECE\u8868\u683C\u6620\u5C04\u5BFC\u5165\u6216\u586B\u5199\u5386\u53F2\u6210\u679C\uFF0C\u5355\u4F4D\u4E3A\u4EBFm\xB3\uFF1B\u51B2\u5CF0\u80FD\u529B\u4E3A\u4E07m\xB3/d\u3002\u5386\u53F2\u6210\u679C\u4E0D\u81EA\u52A8\u66FF\u4EE3\u672C\u6B21\u8BA1\u7B97\u3002"),e.createElement(we,{title:"\u5386\u53F2\u6307\u6807",columns:["cycle_id","book_inventory","effective_inventory","deliverable_swing","peak_rate","source"],rows:w.history||[],onChange:b=>T({history:b})}))),u==="accounting"&&e.createElement(Cs,{data:w,edit:T}),["pvt","pressure","connectivity"].includes(u)&&e.createElement(ns,{node:u,data:w,index:a,edit:T,cat:s,Field:M,Check:pe,TableEditor:we}),["methods","inventory","window","deliverability"].includes(u)&&e.createElement(Ms,{data:{...w,units:w.units[a]?[w.units[a]]:[]},edit:b=>{if(b.units){let C=Ce(w.units);C[a]=b.units[0],T({...b,units:C})}else T(b)},cat:s,stage:u}),u==="deliverability"&&w.units.length>1&&e.createElement("section",{className:"sc-card"},e.createElement("h3",null,"\u5168\u5E93\u5730\u9762\u80FD\u529B"),e.createElement(pe,{label:"\u5404\u5355\u5143\u5730\u9762\u8BBE\u65BD\u76F8\u4E92\u72EC\u7ACB",value:w.independent_surface,onChange:b=>T({independent_surface:b})}),e.createElement(M,{label:"\u5168\u5E93\u5171\u4EAB\u5730\u9762\u91C7\u6C14\u4E0A\u9650\uFF08\u4E07\u65B9/\u5929\uFF09",value:w.site_surface_limit,onChange:b=>T({site_surface_limit:b})})),u==="results"&&e.createElement(e.Fragment,null,e.createElement($s,{evaluation:N,review:S,cat:s,stale:$e,busy:y,onReview:()=>L(async()=>j(await F(`/cases/${t.id}/review`,de({revision:t.revision}))))}),e.createElement("details",null,e.createElement("summary",null,"\u5BF9\u6BD4\u6210\u679C\u4E0E\u9879\u76EE\u63D0\u793A\u9608\u503C"),e.createElement(M,{label:"\u504F\u5DEE\u63D0\u793A\u9608\u503C\uFF08%\uFF0C\u9879\u76EE\u8BBE\u7F6E\uFF0C\u975E\u884C\u4E1A\u6807\u51C6\uFF09",value:w.comparison_tolerance_percent,type:"number",onChange:b=>T({comparison_tolerance_percent:b})}),(w.benchmarks||[]).map((b,C)=>e.createElement("div",{className:"sc-unit",key:C},e.createElement("div",{className:"sc-grid"},[["metric","\u6307\u6807"],["value","\u62A5\u544A\uFF0F\u5176\u4ED6\u65B9\u6CD5\u503C"],["source","\u6210\u679C\u6765\u6E90"],["cycle_id","\u5468\u671F"],["state","\u72B6\u6001"]].map(([D,U])=>e.createElement(M,{key:D,label:U,type:D==="value"?"number":"text",value:b[D],options:D==="metric"?s.terms.filter(q=>["effective_inventory","geological_swing","deliverable_swing","capacity","working_gas","peak_rate"].includes(q.key)).map(q=>[q.key,q.name]):void 0,onChange:q=>T({benchmarks:w.benchmarks.map((ye,ke)=>ke===C?{...ye,[D]:q}:ye)})}))),e.createElement("button",{className:"sc-link",onClick:()=>T({benchmarks:w.benchmarks.filter((D,U)=>U!==C)})},"\u79FB\u9664\u5BF9\u6BD4\u6210\u679C"))),e.createElement("button",{onClick:()=>T({benchmarks:[...w.benchmarks||[],{metric:"effective_inventory",value:null,source:"",cycle_id:w.cycle_id,state:w.start_state}]})},"\u6DFB\u52A0\u5BF9\u6BD4\u6210\u679C"))),u==="report"&&e.createElement("section",null,e.createElement("div",{className:"sc-section"},e.createElement("h3",null,"\u5E93\u5BB9\u8BC4\u4F30\u62A5\u544A"),e.createElement("p",{className:"sc-muted"},"\u62A5\u544A\u5305\u542B\u8303\u56F4\u3001\u6570\u636E\u6765\u6E90\u3001\u9002\u7528\u6761\u4EF6\u3001\u5206\u5355\u5143\u8BA1\u7B97\u3001\u4EA4\u53C9\u6821\u9A8C\u3001\u8D44\u6599\u7F3A\u9879\u4E0E\u590D\u6838\u72B6\u6001\u3002\u8D44\u6599\u4E0D\u9F50\u65F6\u5BFC\u51FA\u5E26\u7F3A\u9879\u7684\u9636\u6BB5\u62A5\u544A\u3002"),e.createElement(M,{label:"\u9879\u76EE\u590D\u6838\u610F\u89C1",type:"textarea",value:w.review_notes,onChange:b=>T({review_notes:b}),wide:!0}),e.createElement("p",{className:"sc-note"},$e?"\u5C1A\u65E0\u5F53\u524D\u8F93\u5165\u7684\u8BA1\u7B97\u7ED3\u679C\u3002\u8BF7\u4FDD\u5B58\u5E76\u91CD\u65B0\u8BA1\u7B97\u3002":"\u5F53\u524D\u62A5\u544A\u7ED1\u5B9A\u672C\u6B21\u8BA1\u7B97\u5FEB\u7167\uFF1B\u66F4\u6539\u8F93\u5165\u540E\u9700\u91CD\u65B0\u8BA1\u7B97\u3002"),e.createElement("div",{className:"sc-actions"},e.createElement("button",{disabled:y||$e,onClick:()=>L(async()=>E(await(await F(`/cases/${t.id}/report?format=html`,void 0,!0)).text()))},"\u9884\u89C8\u62A5\u544A"),[["docx","\u5BFC\u51FA Word"],["html","\u5BFC\u51FA\u6253\u5370\u7248"],["zip","\u4E0B\u8F7D\u590D\u7B97\u5305"],["json","\u5BFC\u51FA\u8BA1\u7B97\u8BB0\u5F55"]].map(([b,C])=>e.createElement("button",{key:b,disabled:y||$e,onClick:()=>L(()=>is(`/cases/${t.id}/report?format=${b}`,`${w.case_name}-\u5E93\u5BB9\u8BC4\u4F30\u62A5\u544A.${b}`))},C)))),X&&e.createElement("iframe",{title:"\u5E93\u5BB9\u8BC4\u4F30\u62A5\u544A\u9884\u89C8",className:"sc-report-preview",sandbox:"",srcDoc:X}))),e.createElement("div",{id:"sc-chart-panel",role:"tabpanel","aria-labelledby":"sc-chart-tab",hidden:x!=="charts"},e.createElement(Qe,{model:Oe,open:ds}),u!=="results"&&u!=="report"&&e.createElement(rs,{result:h?.nodes?.find(b=>b.id===u),dirty:_,cat:s,onMethod:b=>T({units:w.units.map((C,D)=>D===a?{...C,method:b}:C)})})),w.field_sources&&e.createElement("details",{className:"sc-field-sources"},e.createElement("summary",null,"\u5BF9\u8BDD\u586B\u5199\u6765\u6E90\uFF08",Object.keys(w.field_sources).length,"\uFF09"),Object.entries(w.field_sources).map(([b,C])=>e.createElement("p",{key:b},e.createElement("strong",null,s.fields[b.split(".").at(-1)]?.label||b)," ","\xB7 ",C.location,e.createElement("br",null),C.quote)))):e.createElement("div",{className:"sc-empty"},e.createElement("h2",null,"\u4ECE\u4E00\u4EFD\u8BC4\u4F30\u9879\u76EE\u5F00\u59CB"),e.createElement("p",null,"\u6309\u50A8\u6C14\u5E93\u7C7B\u578B\u4E0E\u8D44\u6599\u6761\u4EF6\u9009\u62E9\u65B9\u6CD5\u3002\u652F\u6301 Excel\u3001CSV\u3001\u62A5\u544A\u53CA\u5916\u90E8\u6A21\u62DF\u6210\u679C\uFF0C\u4FDD\u7559\u8F93\u5165\u4F9D\u636E\u548C\u8BA1\u7B97\u8FC7\u7A0B\uFF0C\u751F\u6210\u53EF\u590D\u6838\u7684\u5E93\u5BB9\u8BC4\u4F30\u62A5\u544A\u3002"),e.createElement("button",{className:"sc-primary",onClick:ie,disabled:y},"\u65B0\u5EFA\u8BC4\u4F30")):e.createElement("p",{className:"sc-muted"},"\u6B63\u5728\u8BFB\u53D6\u5DE5\u4F5C\u53F0\u2026"))),t&&e.createElement(Ge,{key:t.id,record:t,openRequest:Q,visible:J,hide:()=>{Y(!1),re(!1)},expanded:ce,setExpanded:re})),e.createElement(os,{record:t,node:u,index:a,busy:y,cat:s,send:ls,adopt:b=>De("adopt",{ids:b}),undo:()=>De("undo"),hidden:O,close:()=>K(!0)}))}function Ps(){let s=Se.host.useSelectedAgent?.();return e.createElement(js,{key:s?.id||"default"})}Se.registerRoutes("storage-capacity",[{path:"/apps/storage-capacity",component:Ps,label:"\u5E93\u5BB9\u8BC4\u4F30\u5DE5\u4F5C\u53F0",icon:"SC"}]);})();
