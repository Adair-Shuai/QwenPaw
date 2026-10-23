(()=>{var ze=`.df-app {
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
`;var C=window.QwenPaw.host.React,{useEffect:Oe,useState:de}=C;function Ie({artifact:d,children:v}){let[g,u]=de("print"),[c,j]=de([]),[p,z]=de(0),[o,r]=de(""),[h,D]=de(0),[O,I]=de(100);return Oe(()=>{if(g!=="print")return;let w=new AbortController,k=[];return j([]),z(0),r(""),window.QwenPaw.host.fetch(d.printUrl+"?pages=true",{headers:d.agentId?{"X-Agent-Id":d.agentId}:{},signal:w.signal}).then(async $=>{if(!$.ok){let A=await $.json().catch(()=>({}));throw new Error(typeof A.detail=="string"?A.detail:"\u6253\u5370\u9884\u89C8\u6682\u4E0D\u53EF\u7528\uFF0C\u53EF\u5207\u6362\u6587\u5B57\u9884\u89C8\u6216\u4E0B\u8F7D Word \u67E5\u770B")}let{pages:S}=await $.json();if(!w.signal.aborted){if(!Number.isInteger(S)||S<1||S>40)throw new Error("\u672A\u83B7\u5F97\u6709\u6548\u7684 Word \u9875\u6570");z(S);for(let A=1;A<=S;A++){let T=await window.QwenPaw.host.fetch(d.printUrl+"?page="+A,{headers:d.agentId?{"X-Agent-Id":d.agentId}:{},signal:w.signal});if(!T.ok)throw new Error(`\u7B2C ${A} \u9875\u672A\u80FD\u6E32\u67D3\uFF0C\u8BF7\u91CD\u65B0\u9884\u89C8`);let E=await T.blob();if(w.signal.aborted)return;let F=URL.createObjectURL(E);k.push(F),j(N=>[...N,F])}}}).catch($=>{w.signal.aborted||r($.message||"\u6253\u5370\u9884\u89C8\u672A\u5B8C\u6210")}),()=>{w.abort(),k.forEach($=>URL.revokeObjectURL($))}},[d.id,d.printUrl,d.agentId,g,h]),C.createElement("div",{className:"df-print-preview"},C.createElement("div",{className:"df-print-toolbar"},C.createElement("div",null,C.createElement("button",{"aria-pressed":g==="print",onClick:()=>u("print")},"\u6253\u5370\u7248\u5F0F"),C.createElement("button",{"aria-pressed":g==="text",onClick:()=>u("text")},"\u6587\u5B57\u9884\u89C8")),g==="print"&&C.createElement("div",null,p>0&&C.createElement("span",null,"\u5171 ",p," \u9875"),C.createElement("select",{"aria-label":"\u9884\u89C8\u6BD4\u4F8B",value:O,onChange:w=>I(Number(w.target.value))},C.createElement("option",{value:100},"\u9002\u5408\u5BBD\u5EA6"),C.createElement("option",{value:125},"125%"),C.createElement("option",{value:150},"150%"),C.createElement("option",{value:200},"200%")))),g==="text"?C.createElement("div",{className:"df-text-preview"},v):o?C.createElement("div",{className:"df-preview-message",role:"alert"},C.createElement("p",null,o),C.createElement("button",{onClick:()=>D(w=>w+1)},"\u91CD\u65B0\u9884\u89C8")):c.length?C.createElement("div",{className:"df-print-scroll"},C.createElement("div",{className:"df-print-pages",style:{width:O+"%"}},c.map((w,k)=>C.createElement("figure",{key:k},C.createElement("figcaption",null,"\u7B2C ",k+1," \u9875"),C.createElement("img",{src:w,alt:d.title+` \xB7 \u6253\u5370\u7248\u5F0F \xB7 \u7B2C ${k+1} \u9875`}))),c.length<p&&C.createElement("p",{role:"status"},"\u6B63\u5728\u6392\u7248\u7B2C ",c.length+1," \u9875\u2026"))):C.createElement("div",{className:"df-preview-message",role:"status"},"\u6B63\u5728\u6392\u7248\u6253\u5370\u9875\u9762\u2026"))}function me({artifact:d}){let[v,g]=de(null),[u,c]=de(""),[j,p]=de(0);if(Oe(()=>{let o=new AbortController;return g(null),c(""),window.QwenPaw.host.fetch("/workspace/convert-office",{method:"POST",headers:{"Content-Type":"application/json",...d.agentId?{"X-Agent-Id":d.agentId}:{}},signal:o.signal,body:JSON.stringify({url:d.binaryUrl,mime_type:d.mimeType})}).then(async r=>{let h=await r.json();if(!r.ok)throw new Error(typeof h.detail=="string"?h.detail:"\u6587\u4EF6\u9884\u89C8\u672A\u5B8C\u6210");o.signal.aborted||g(h)}).catch(r=>{o.signal.aborted||c(r.message||"\u6587\u4EF6\u9884\u89C8\u672A\u5B8C\u6210")}),()=>o.abort()},[d.id,d.binaryUrl,d.mimeType,d.agentId,j]),u)return C.createElement("div",{className:"df-preview-message",role:"alert"},C.createElement("p",null,u),C.createElement("button",{onClick:()=>p(o=>o+1)},"\u91CD\u65B0\u9884\u89C8"),C.createElement("p",null,"\u4E5F\u53EF\u4EE5\u4ECE\u6587\u4EF6\u6E05\u5355\u4E0B\u8F7D\u540E\u67E5\u770B\u3002"));if(!v)return C.createElement("div",{className:"df-preview-message",role:"status"},"\u6B63\u5728\u6253\u5F00\u6587\u4EF6\u2026");let z=v.engine==="officecli"?v.html:`<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;color:#333;background:#fff;padding:24px 32px;line-height:1.7;max-width:900px;margin:0 auto}table{border-collapse:collapse;width:100%;margin:12px 0}td,th{border:1px solid #ddd;padding:8px 12px}img{max-width:100%;height:auto}h1{font-size:1.6em}h2{font-size:1.3em}.docx-page-break{border-top:2px dashed #ccc;margin:32px 0}</style></head><body>${v.html||""}</body></html>`;return C.createElement("iframe",{className:"df-office-frame",title:d.title,srcDoc:z,sandbox:v.engine==="officecli"?"allow-scripts":"allow-same-origin"})}var _e=window.QwenPaw,f=_e.host.React,{useState:re,useEffect:Ke}=f,Ae={running:"\u6B63\u5728\u6838\u67E5",completed:"\u6838\u67E5\u5B8C\u6210",failed:"\u672A\u5B8C\u6210",interrupted:"\u5DF2\u4E2D\u65AD"},qe=".doc,.docx,.pdf,.xls,.xlsx,.png,.jpg,.jpeg";function Ee({project:d,services:v,onChanged:g}){let{request:u,download:c,time:j}=v,[p,z]=re(null),[o,r]=re(""),[h,D]=re(null),[O,I]=re([]),[w,k]=re(""),[$,S]=re(""),[A,T]=re(!1),[E,F]=re(""),[N,P]=re(0);Ke(()=>{let s=!0,x,m=!1;async function _(){try{let J=await u(`/projects/${d.id}/response-reviews`);if(!s)return;z(J),F("");let ee=J.records.some(q=>q.status==="running");m&&!ee&&g(),m=ee,ee&&(x=setTimeout(_,3e3))}catch(J){s&&F(J.message)}}return _(),()=>{s=!1,clearTimeout(x)}},[d.id,N]);let X=p?.records.some(s=>s.status==="running"),y=p?.records.find(s=>s.id===$)||p?.records[0],H=_e.host.ReactMarkdown;async function Y(s){s.preventDefault(),F(""),T(!0);try{let x=new FormData;o?x.set("reference_id",o):h&&x.set("reference",h);for(let _ of O)x.append("responses",_);x.set("focus",w);let m=await u(`/projects/${d.id}/response-reviews`,{method:"POST",body:x});S(m.id),z(_=>({..._,records:[m,..._?.records||[]]})),P(_=>_+1)}catch(x){F(x.message)}finally{T(!1)}}return f.createElement("div",{className:"df-response-review"},f.createElement("p",{className:"df-muted"},"\u5BF9\u7167\u8C08\u5224\u6587\u4EF6\uFF0C\u9010\u5BB6\u68C0\u67E5\u8D44\u8D28\u3001\u6280\u672F\u54CD\u5E94\u3001\u62A5\u4EF7\u3001\u65E5\u671F\u4E0E\u7B7E\u7AE0\u9644\u4EF6\u3002\u6838\u67E5\u610F\u89C1\u4F9B\u7ECF\u529E\u4EBA\u548C\u4E13\u5BB6\u590D\u6838\u3002"),E&&f.createElement("div",{className:"df-alert error",role:"alert"},E,f.createElement("button",{onClick:()=>P(s=>s+1)},"\u91CD\u65B0\u52A0\u8F7D")),p?f.createElement(f.Fragment,null,f.createElement("form",{onSubmit:Y},f.createElement("fieldset",{disabled:A||X},f.createElement("label",{className:"df-field"},f.createElement("span",null,"\u6838\u67E5\u4F9D\u636E"),f.createElement("select",{"aria-label":"\u6838\u67E5\u4F9D\u636E",value:o,onChange:s=>{r(s.target.value),D(null)}},f.createElement("option",{value:""},"\u4E0A\u4F20\u6B63\u5F0F\u8C08\u5224\u6587\u4EF6"),p.references.map(s=>f.createElement("option",{key:s.id,value:s.id},s.label)))),!o&&f.createElement("label",{className:"df-field"},f.createElement("span",null,"\u6B63\u5F0F\u8C08\u5224\u6587\u4EF6"),f.createElement("input",{"aria-label":"\u4E0A\u4F20\u6838\u67E5\u4F9D\u636E",type:"file",accept:qe,required:!0,onChange:s=>D(s.target.files[0]||null)})),f.createElement("label",{className:"df-field"},f.createElement("span",null,"\u5404\u5355\u4F4D\u54CD\u5E94\u6750\u6599"),f.createElement("input",{"aria-label":"\u4E0A\u4F20\u54CD\u5E94\u6750\u6599",type:"file",multiple:!0,required:!0,accept:qe,onChange:s=>I([...s.target.files])})),O.length>0&&f.createElement("ul",{className:"df-review-files"},O.map((s,x)=>f.createElement("li",{key:x},s.name))),f.createElement("p",{className:"df-muted"},"\u652F\u6301 Word\u3001PDF\u3001Excel \u548C\u56FE\u7247\uFF1B\u53EF\u4E00\u6B21\u9009\u62E9\u591A\u5BB6\u6750\u6599\u3002\u6BCF\u4EFD\u4E0D\u8D85\u8FC7 15 MB\uFF0C\u6BCF\u6B21\u6700\u591A 20 \u4EFD\u3001\u5408\u8BA1 100 MB\u3002\u538B\u7F29\u5305\u8BF7\u5148\u89E3\u538B\u3002"),f.createElement("label",{className:"df-field"},f.createElement("span",null,"\u8865\u5145\u5173\u6CE8\u70B9\uFF08\u9009\u586B\uFF09"),f.createElement("textarea",{"aria-label":"\u8865\u5145\u6838\u67E5\u5173\u6CE8\u70B9",rows:3,maxLength:3e3,value:w,onChange:s=>k(s.target.value),placeholder:"\u4F8B\u5982\uFF1A\u91CD\u70B9\u6838\u5BF9\u62A5\u4EF7\u5927\u5C0F\u5199\u3001\u6210\u679C\u4EA4\u4ED8\u65F6\u95F4\u548C\u8D44\u8D28\u6709\u6548\u671F"})),f.createElement("div",{className:"df-actions"},f.createElement("button",{className:"df-primary",disabled:A||X||!(o||h)||!O.length},A?"\u6B63\u5728\u63D0\u4EA4\u2026":"\u5F00\u59CB\u6838\u67E5"),f.createElement("span",{className:"df-muted"},"\u4F7F\u7528\u201C\u54CD\u5E94\u6587\u4EF6\u6838\u67E5\u201D\u667A\u80FD\u4F53\uFF0C\u6CBF\u7528\u8F6F\u4EF6\u4E2D\u7684\u6A21\u578B\u914D\u7F6E\u3002")))),p.records.length>0&&f.createElement("section",{className:"df-review-history"},f.createElement("div",{className:"df-section-head"},f.createElement("h3",null,"\u6838\u67E5\u8BB0\u5F55"),f.createElement("button",{onClick:()=>P(s=>s+1)},"\u5237\u65B0\u8BB0\u5F55")),f.createElement("div",{className:"df-review-records"},p.records.map(s=>f.createElement("button",{key:s.id,"aria-pressed":y?.id===s.id,onClick:()=>S(s.id)},j(s.created_at)," \xB7 ",Ae[s.status]))),y&&f.createElement("article",{"aria-label":"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5\u7ED3\u679C"},f.createElement("div",{className:"df-section-head"},f.createElement("div",null,f.createElement("b",null,Ae[y.status]),f.createElement("p",{className:"df-muted"},"\u57FA\u4E8E\u9879\u76EE\u4FEE\u8BA2 ",y.project_revision," \xB7"," ",y.files.length," \u4EFD\u6750\u6599\uFF1B\u540E\u7EED\u6750\u6599\u4FEE\u6539\u8BF7\u91CD\u65B0\u6838\u67E5\u3002")),y.status==="completed"&&f.createElement("button",{onClick:async()=>{try{await c(`/projects/${d.id}/response-reviews/${y.id}/report`,`${d.name}_\u54CD\u5E94\u6587\u4EF6\u6838\u67E5\u8BB0\u5F55_${y.id.slice(0,8)}.md`)}catch(s){F(s.message)}}},"\u4E0B\u8F7D\u6838\u67E5\u8BB0\u5F55")),f.createElement("details",null,f.createElement("summary",null,"\u672C\u6B21\u6838\u67E5\u6750\u6599\u4E0E\u5173\u6CE8\u70B9"),f.createElement("ul",null,y.files.map((s,x)=>f.createElement("li",{key:x},s.role,"\uFF1A",s.name))),f.createElement("p",null,y.focus||"\u65E0\u8865\u5145\u5173\u6CE8\u70B9")),y.status==="running"&&f.createElement("p",{role:"status",className:"df-alert"},"\u6B63\u5728\u8BFB\u53D6\u5E76\u6838\u67E5\u6750\u6599\uFF0C\u53EF\u5173\u95ED\u6B64\u7A97\u53E3\uFF0C\u7A0D\u540E\u56DE\u5230\u672C\u9879\u76EE\u67E5\u770B\u7ED3\u679C\u3002"),y.error&&f.createElement("p",{role:"alert",className:"df-alert error"},y.error),y.report&&f.createElement("div",{className:"df-review-report"},H?f.createElement(H,{remarkPlugins:_e.host.remarkGfm?[_e.host.remarkGfm]:[],components:{a:({children:s})=>f.createElement("span",null,s),img:()=>null}},y.report):f.createElement("div",{style:{whiteSpace:"pre-wrap"}},y.report))))):f.createElement("p",{role:"status"},"\u6B63\u5728\u8BFB\u53D6\u6838\u67E5\u8BB0\u5F55\u2026"))}var pe=window.QwenPaw,e=pe.host.React,{useState:U,useEffect:be,useRef:ce}=e,De={pending:"\u672A\u5F00\u59CB",in_progress:"\u8FDB\u884C\u4E2D",submitted:"\u5DF2\u63D0\u4EA4",completed:"\u5DF2\u5B8C\u6210"},We={pending:"\u5F85\u51C6\u5907",preparing:"\u6574\u7406\u4E2D",ready:"\u5F85\u63D0\u4EA4",submitted:"\u5DF2\u63D0\u4EA4",done:"\u5DF2\u5B8C\u6210",na:"\u4E0D\u9002\u7528"},Ve=["\u4E0A\u62A5\u8BA1\u5212","\u9009\u5546\u8BBA\u8BC1","\u5546\u52A1\u8C08\u5224","\u5F00\u9898\u8BBA\u8BC1","\u7ED3\u9898\u9A8C\u6536","\u5F52\u6863\u4ED8\u6B3E"],Be=d=>d?new Date(d).toLocaleString("zh-CN",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}):"";function he({title:d,children:v,onClose:g,error:u,busy:c=!1}){let j=ce(null);return be(()=>{let p=document.activeElement;return j.current?.querySelector("input,select,textarea,button")?.focus(),()=>{p?.isConnected&&p.focus()}},[]),e.createElement("div",{className:"df-dialog-backdrop"},e.createElement("section",{ref:j,className:"df-dialog df-paper",role:"dialog","aria-modal":"true","aria-label":d,onKeyDown:p=>{if(p.key==="Escape"&&!c&&(p.stopPropagation(),g()),p.key==="Tab"){let z=[...j.current.querySelectorAll("button,input,textarea,select,a[href]")].filter(o=>!o.disabled);p.shiftKey&&document.activeElement===z[0]&&(p.preventDefault(),z.at(-1)?.focus()),!p.shiftKey&&document.activeElement===z.at(-1)&&(p.preventDefault(),z[0]?.focus())}}},e.createElement("div",{className:"df-section-head"},e.createElement("h2",null,d),e.createElement("button",{type:"button",disabled:c,onClick:g,"aria-label":"\u5173\u95ED"+d},"\xD7")),u&&e.createElement("p",{role:"alert",className:"df-alert error"},u),v))}function Xe({file:d,projectId:v,download:g,onClose:u}){let[c,j]=U(null),[p,z]=U(""),[o,r]=U(""),h=d.name.split(".").pop().toLowerCase(),D=["pdf","png","jpg","jpeg"].includes(h)&&!pe.workspace?.loadPreview;be(()=>{let I=!0,w;return D?pe.host.fetch(`/document-forms/projects/${v}/files/${d.id}`).then(async k=>{if(!k.ok)throw new Error("\u9884\u89C8\u672A\u80FD\u6253\u5F00\uFF0C\u8BF7\u4E0B\u8F7D\u67E5\u770B");let $=await k.blob();I&&(w=URL.createObjectURL(new Blob([$],{type:d.mime})),z(w))}).catch(k=>I&&r(k.message)):pe.workspace?.loadPreview||["doc","docx","xls","xlsx","ppt","pptx"].includes(h)?(pe.workspace?.loadPreview?pe.workspace.loadPreview():Promise.resolve(me)).then(k=>I&&j(()=>k)).catch(()=>I&&j(()=>me)):r("\u6B64\u683C\u5F0F\u8BF7\u4E0B\u8F7D\u540E\u67E5\u770B\u3002"),()=>{I=!1,w&&URL.revokeObjectURL(w)}},[d.id]);let O={id:d.id,title:d.name,source:"uploaded",extension:h,mimeType:d.mime,binaryUrl:d.preview_url,agentId:pe.host.getSelectedAgentId?.(),createdAt:Date.parse(d.uploaded_at)};return e.createElement(he,{title:d.name,onClose:u},e.createElement("div",{className:"df-attachment-preview"},o?e.createElement("p",{role:"alert"},o):D&&p?h==="pdf"?e.createElement("iframe",{title:d.name,src:p,sandbox:"allow-same-origin"}):e.createElement("img",{src:p,alt:d.name}):c?e.createElement(c,{artifact:O,readOnly:!0,hostControls:!0}):e.createElement("p",{role:"status"},"\u6B63\u5728\u6253\u5F00\u9884\u89C8\u2026")),e.createElement("div",{className:"df-actions"},e.createElement("button",{onClick:()=>g(`/projects/${v}/files/${d.id}`,d.name)},"\u4E0B\u8F7D\u539F\u6587\u4EF6"),e.createElement("button",{onClick:u},"\u5173\u95ED\u9884\u89C8")))}function Te({Editor:d,services:v}){let{request:g,json:u,download:c,Field:j}=v,[p,z]=U([]),[o,r]=U(null),[h,D]=U("overview"),[O,I]=U(""),[w,k]=U(null),[$,S]=U(!1),[A,T]=U(!1),[E,F]=U(""),[N,P]=U(""),[X,y]=U(""),[H,Y]=U(""),[s,x]=U(null),[m,_]=U({}),[J,ee]=U(null),q=ce(!0),te=ce(0),Q=ce(null),Ne=ce(null),ae=ce(""),W=ce(null);be(()=>{W.current?.scrollTo?.({top:0})},[o?.id,h,w?.id]);let Z=pe.host.useTheme?.()||"light",b=o?.stages.find(i=>i.id===h),ue=o?.forms.filter(i=>i.stage_id===h)||[],G=()=>!$&&!A||window.confirm("\u8D44\u6599\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\uFF0C\u662F\u5426\u653E\u5F03\u8FD9\u4E9B\u4FEE\u6539\u5E76\u79BB\u5F00\uFF1F");async function oe(){let i=await g("/projects");return q.current&&z(i),i}async function M(i=o?.id){let t=i?await g("/projects/"+i):null;return q.current&&t&&r(t),await oe(),t}be(()=>(q.current=!0,P("\u8F7D\u5165\u9879\u76EE"),oe().then(async i=>{if(i.length&&q.current){let t=await g("/projects/"+i[0].id);q.current&&r(t)}}).catch(i=>q.current&&y(i.message)).finally(()=>q.current&&P("")),()=>{q.current=!1,te.current++}),[]),be(()=>{let i=t=>{($||A)&&(t.preventDefault(),t.returnValue="")};return window.addEventListener("beforeunload",i),()=>window.removeEventListener("beforeunload",i)},[$,A]);async function B(i,t){if(N)return;let n=++te.current;P(i),y(""),Y("");try{await t()}catch(l){q.current&&n===te.current&&y(l.message)}finally{q.current&&n===te.current&&P("")}}async function se(i){G()&&await B("\u6253\u5F00\u9879\u76EE",async()=>{await M(i),k(null),S(!1),T(!1),D("overview")})}function ie(i){G()&&(D(i),k(null),S(!1),T(!1),Y(""),y(""))}function ne(i,t){_(t),x(i),y("")}async function ge(i,t,n="POST"){let l=await g(i,{...u({...t,revision:o.revision}),method:n});return q.current&&(r(l),x(null)),await oe(),l}function xe(i){return B(i?"\u8BFB\u53D6\u9636\u6BB5 Excel":"\u51C6\u5907\u8C08\u5224\u8868\u5355",async()=>{let t;if(i){let n=new FormData;n.append("revision",o.revision),n.append("stage_id",h),n.append("workbook",i),t=await g(`/projects/${o.id}/cases/import`,{method:"POST",body:n})}else t=await g(`/projects/${o.id}/cases`,u({revision:o.revision,stage_id:h}));await M(),k({id:t.id,view:"edit"}),S(!1),i&&Y(t.templates.length?"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\uFF0C\u5E76\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002":"\u5DF2\u8BFB\u53D6\u672C\u9636\u6BB5\u53D8\u91CF\u914D\u7F6E\uFF0C\u8BF7\u6DFB\u52A0\u5BF9\u5E94\u7684 Word \u6A21\u677F\u3002")})}function Pe(i){if(!i)return;let t=ae.current;return B("\u4FDD\u5B58\u6750\u6599",async()=>{let n=new FormData;n.append("revision",o.revision),n.append("file",i);let l=await g(`/projects/${o.id}/stages/${h}/materials/${t}/files`,{method:"POST",body:n});r(l),await oe(),Y("\u6750\u6599\u5DF2\u4FDD\u5B58\uFF0C\u539F\u6709\u7248\u672C\u7EE7\u7EED\u4FDD\u7559\u3002\u8BF7\u6838\u5BF9\u540E\u66F4\u65B0\u6750\u6599\u72B6\u6001\u3002")})}let le=o?`/projects/${o.id}`:"",Ce=i=>{i.preventDefault(),B("\u4FDD\u5B58\u6750\u6599\u4FE1\u606F",()=>ge(`${le}/stages/${h}/materials${m.id?"/"+m.id:""}`,m,m.id?"PUT":"POST"))},je=i=>B("\u6574\u7406\u4E0B\u8F7D\u5305",()=>c(le+"/bundle"+(i?"?stage_id="+i:""),`${o.name}_${i?b.title:"\u5168\u6D41\u7A0B\u6750\u6599"}.zip`));return e.createElement("main",{className:"df-app df-project-app","data-theme":Z},e.createElement("style",null,ze),e.createElement("input",{ref:Q,type:"file",accept:".xlsx",hidden:!0,"aria-label":"\u5BFC\u5165\u9636\u6BB5 Excel",onChange:i=>{let t=i.target.files[0];i.target.value="",t&&xe(t)}}),e.createElement("input",{ref:Ne,type:"file",accept:".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.png,.jpg,.jpeg,.zip,.txt,.csv",hidden:!0,"aria-label":"\u4E0A\u4F20\u9636\u6BB5\u6750\u6599",onChange:i=>{let t=i.target.files[0];i.target.value="",Pe(t)}}),e.createElement("aside",{className:"df-sidebar df-project-sidebar"},e.createElement("div",{className:"df-brand"},"UGSci ",e.createElement("span",null,"\u9879\u76EE\u6750\u6599")),e.createElement("button",{className:"df-primary df-new",disabled:!!N||!!E,onClick:()=>{G()&&ne("create",{name:"",code:"",owner:""})}},"\uFF0B \u65B0\u5EFA\u9879\u76EE"),e.createElement("label",{className:"df-project-search"},e.createElement("span",{className:"df-sr-only"},"\u641C\u7D22\u9879\u76EE"),e.createElement("input",{"aria-label":"\u641C\u7D22\u9879\u76EE",placeholder:"\u641C\u7D22\u9879\u76EE\u540D\u79F0\u6216\u7F16\u53F7",value:O,onChange:i=>I(i.target.value)})),e.createElement("div",{className:"df-caption"},"\u6211\u7684\u9879\u76EE ",e.createElement("span",null,p.length)),e.createElement("nav",{"aria-label":"\u9879\u76EE\u5217\u8868"},p.filter(i=>(i.name+" "+i.code).toLowerCase().includes(O.toLowerCase())).map(i=>e.createElement("button",{key:i.id,disabled:!!N||!!E,"aria-current":o?.id===i.id?"page":void 0,onClick:()=>se(i.id)},e.createElement("b",null,i.name),e.createElement("small",null,i.code||"\u672A\u8BBE\u7F16\u53F7"," \xB7 ",i.completed,"/6 \u9636\u6BB5\u5B8C\u6210")))),e.createElement("div",{className:"df-sidebar-foot"},e.createElement("b",null,"\u914D\u5957\u6A21\u677F"),e.createElement("p",null,"\u5546\u52A1\u8C08\u5224\u9636\u6BB5\u5DF2\u914D\u597D\u4E94\u4EFD Word \u6A21\u677F\uFF0C\u5176\u4F59\u9636\u6BB5\u53EF\u63A5\u5165\u5404\u81EA\u7684\u7EDF\u4E00\u6A21\u677F\u3002"),e.createElement("button",{disabled:!!N||!!E,onClick:()=>B("\u4E0B\u8F7D\u914D\u5957\u6A21\u677F",()=>c("/starter","\u6587\u4E66\u586B\u62A5_\u914D\u5957\u6A21\u677F.zip"))},"\u4E0B\u8F7D\u914D\u5957\u6A21\u677F \u2197"),e.createElement("small",null,"\u7A7A\u767D Excel \u4E0E 5 \u4EFD\u6807\u51C6 Word"))),e.createElement("section",{className:"df-main df-project-main",ref:W},e.createElement("header",{className:"df-header"},e.createElement("div",null,e.createElement("span",{className:"df-eyebrow"},"UGSCI / \u9879\u76EE\u6750\u6599"),e.createElement("h1",null,o?.name||"\u9879\u76EE\u5DE5\u4F5C\u53F0"),e.createElement("p",null,o?[o.code||"\u672A\u8BBE\u9879\u76EE\u7F16\u53F7",o.owner&&"\u7ECF\u529E\u4EBA\uFF1A"+o.owner].filter(Boolean).join("\u3000\xB7\u3000"):"\u4ECE\u4E0A\u62A5\u8BA1\u5212\u5230\u5F52\u6863\u4ED8\u6B3E\uFF0C\u628A\u540C\u4E00\u9879\u76EE\u7684\u8D44\u6599\u653E\u5728\u4E00\u8D77\u3002")),o&&e.createElement("div",{className:"df-actions"},e.createElement("button",{disabled:!!N||!!E||!!w,onClick:()=>ie("profile")},"\u9879\u76EE\u8D44\u6599"),e.createElement("button",{disabled:!!N||!!E,onClick:()=>je()},"\u4E0B\u8F7D\u9879\u76EE\u6750\u6599"))),X&&e.createElement("div",{role:"alert",className:"df-alert error"},X,e.createElement("button",{"aria-label":"\u5173\u95ED\u9519\u8BEF\u63D0\u793A",onClick:()=>y("")},"\xD7")),H&&e.createElement("div",{className:"df-alert",role:"status"},H),N&&e.createElement("div",{className:"df-progress",role:"status"},N,"\u2026"),o?e.createElement(e.Fragment,null,e.createElement("nav",{className:"df-project-tabs","aria-label":"\u9879\u76EE\u9636\u6BB5"},e.createElement("button",{className:h==="overview"?"active":"",disabled:!!N||!!E,onClick:()=>ie("overview")},"\u9879\u76EE\u603B\u89C8"),o.stages.map((i,t)=>e.createElement("button",{key:i.id,"aria-current":h===i.id?"step":void 0,className:h===i.id?"active":"",disabled:!!N||!!E,onClick:()=>ie(i.id)},e.createElement("small",null,String(t+1).padStart(2,"0")),i.title,e.createElement("span",{className:"df-state df-state-"+i.status},i.upstream_changed.length||i.documents_changed?"\u5F85\u590D\u6838":De[i.status])))),w?e.createElement(d,{key:o.id+":"+w.id,project:o,workflowStage:b,initialCaseId:w.id,initialView:w.view,onDirtyChange:S,onBusyChange:F,onViewChange:()=>W.current?.scrollTo?.({top:0}),onBack:()=>{k(null),S(!1),M().catch(i=>y(i.message))},onChanged:()=>M()}):e.createElement("fieldset",{className:"df-content",disabled:!!N||!!E},h==="overview"&&e.createElement(e.Fragment,null,o.migrated&&e.createElement("p",{className:"df-muted df-migration-note"},"\u5386\u53F2\u586B\u62A5\u5DF2\u6309\u9879\u76EE\u540D\u79F0\u6216\u7F16\u53F7\u5F52\u5165\u5546\u52A1\u8C08\u5224\u9636\u6BB5\uFF0C\u539F\u8868\u5355\u3001\u751F\u6210\u6279\u6B21\u548C\u6587\u4EF6\u5747\u4FDD\u7559\u3002"),e.createElement("section",{className:"df-project-metrics"},e.createElement("div",null,e.createElement("b",null,o.stages.filter(i=>i.status==="completed").length,e.createElement("small",null,"/ 6")),e.createElement("span",null,"\u5DF2\u5B8C\u6210\u9636\u6BB5")),e.createElement("div",null,e.createElement("b",null,o.stages.reduce((i,t)=>i+t.materials.filter(n=>!["done","na"].includes(n.status)).length,0)),e.createElement("span",null,"\u5F85\u6574\u7406\u6750\u6599")),e.createElement("div",null,e.createElement("b",null,o.forms.reduce((i,t)=>i+t.outputs,0)),e.createElement("span",null,"\u5DF2\u751F\u6210\u6587\u4EF6")),e.createElement("div",null,e.createElement("b",null,o.stages.filter(i=>i.upstream_changed.length||i.documents_changed).length),e.createElement("span",null,"\u5F85\u590D\u6838\u9636\u6BB5"))),e.createElement("div",{className:"df-project-stage-grid"},o.stages.map((i,t)=>e.createElement("button",{className:"df-paper df-stage-card",key:i.id,onClick:()=>ie(i.id)},e.createElement("div",{className:"df-section-head"},e.createElement("small",null,"\u9636\u6BB5 ",String(t+1).padStart(2,"0")),e.createElement("span",{className:"df-state df-state-"+i.status},De[i.status])),e.createElement("h2",null,i.title),e.createElement("p",null,i.purpose),e.createElement("footer",null,e.createElement("span",null,i.materials.filter(n=>["done","na"].includes(n.status)).length,"/",i.materials.length," \u9879\u6750\u6599\u5DF2\u5904\u7406"),e.createElement("span",null,i.upstream_changed.length||i.documents_changed?"\u6709\u53D8\u66F4\u5F85\u590D\u6838":i.due_date?"\u8BA1\u5212 "+i.due_date:"\u8FDB\u5165\u9636\u6BB5 \u2192"))))),e.createElement("section",{className:"df-paper df-project-hint"},e.createElement("h2",null,"\u4E00\u4EFD\u9879\u76EE\u5E95\u7A3F\uFF0C\u8D2F\u7A7F\u5404\u9636\u6BB5"),e.createElement("p",null,"\u9879\u76EE\u540D\u79F0\u3001\u7814\u7A76\u5185\u5BB9\u3001\u6210\u679C\u6307\u6807\u548C\u9884\u7B97\u7B49\u53EF\u5728\u201C\u9879\u76EE\u8D44\u6599\u201D\u7EDF\u4E00\u7EF4\u62A4\u3002\u9636\u6BB5\u8868\u5355\u4ECE\u5E95\u7A3F\u53D6\u503C\uFF0C\u540E\u7EED\u53D8\u66F4\u4F1A\u63D0\u9192\u6838\u5BF9\uFF1B\u5DF2\u6709\u751F\u6210\u6587\u4EF6\u4FDD\u7559\u539F\u6837\u3002"),e.createElement("button",{onClick:()=>ie("profile")},"\u6574\u7406\u9879\u76EE\u8D44\u6599"))),h==="profile"&&e.createElement(Je,{onDirtyChange:T,key:o.id+":"+o.revision,project:o,Field:j,onSave:i=>B("\u4FDD\u5B58\u9879\u76EE\u8D44\u6599",async()=>{await ge(le,i,"PUT"),Y("\u9879\u76EE\u8D44\u6599\u5DF2\u66F4\u65B0\u3002\u5DF2\u6709\u8868\u5355\u53EF\u9010\u9879\u6838\u5BF9\u540E\u540C\u6B65\uFF0C\u539F\u751F\u6210\u6587\u4EF6\u4E0D\u53D8\u3002")})}),b&&e.createElement(e.Fragment,null,e.createElement("section",{className:"df-paper df-stage-header"},e.createElement("div",null,e.createElement("div",{className:"df-eyebrow"},"\u9636\u6BB5\u6750\u6599"),e.createElement("h2",null,b.title),e.createElement("p",null,b.purpose),e.createElement("p",{className:"df-muted"},b.id==="negotiation"?"\u4E94\u4EFD\u6807\u51C6\u6A21\u677F\u5DF2\u63A5\u5165\uFF0C\u53EF\u76F4\u63A5\u586B\u5199\uFF0C\u4E5F\u53EF\u5BFC\u5165\u73B0\u6709 Excel\u3002":"\u7EDF\u4E00\u6A21\u677F\u5F85\u8865\u5145\uFF1B\u73B0\u9636\u6BB5\u53EF\u6574\u7406\u6750\u6599\u3001\u4E0A\u4F20\u6587\u4EF6\uFF0C\u6216\u5BFC\u5165\u5DF2\u6709 Excel \u4E0E Word \u6A21\u677F\u3002")),e.createElement("div",{className:"df-actions"},e.createElement("button",{onClick:()=>je(b.id)},"\u4E0B\u8F7D\u672C\u9636\u6BB5\u6750\u6599"),e.createElement("button",{onClick:()=>ne("stage",{...b,confirmed:!1})},"\u529E\u7406\u4FE1\u606F\u4E0E\u72B6\u6001"))),(b.upstream_changed.length>0||b.documents_changed)&&e.createElement("div",{className:"df-alert df-stage-warning"},e.createElement("div",null,e.createElement("b",null,"\u672C\u9636\u6BB5\u6709\u8D44\u6599\u9700\u8981\u590D\u6838"),e.createElement("p",null,b.upstream_changed.length>0&&"\u524D\u5E8F\u9636\u6BB5\u5DF2\u66F4\u65B0\uFF1A"+b.upstream_changed.join("\u3001")+"\u3002",b.documents_changed&&"\u672C\u9636\u6BB5\u8868\u5355\u6216\u751F\u6210\u6587\u4EF6\u6709\u66F4\u65B0\u3002","\u8BF7\u6838\u5BF9\u5DF2\u63D0\u4EA4\u7684\u6750\u6599\u662F\u5426\u9700\u8981\u8C03\u6574\u3002")),e.createElement("button",{onClick:()=>B("\u8BB0\u5F55\u590D\u6838",()=>ge(`${le}/stages/${b.id}/acknowledge`,{}))},"\u5DF2\u6838\u5BF9\u53D8\u66F4")),(b.system_name||b.due_date||b.submission_ref||b.notes)&&e.createElement("section",{className:"df-paper df-stage-details"},e.createElement("dl",null,e.createElement("div",null,e.createElement("dt",null,"\u8BA1\u5212\u65E5\u671F"),e.createElement("dd",null,b.due_date||"\u672A\u8BBE\u7F6E")),e.createElement("div",null,e.createElement("dt",null,"\u529E\u7406\u7CFB\u7EDF"),e.createElement("dd",null,b.system_url?e.createElement("a",{href:b.system_url,target:"_blank",rel:"noopener noreferrer"},b.system_name||"\u6253\u5F00\u529E\u7406\u7CFB\u7EDF"," \u2197"):b.system_name||"\u672A\u8BB0\u5F55")),e.createElement("div",null,e.createElement("dt",null,"\u63D0\u4EA4\u7F16\u53F7 / \u56DE\u6267"),e.createElement("dd",null,b.submission_ref||"\u672A\u8BB0\u5F55"))),b.notes&&e.createElement("p",null,b.notes)),e.createElement("section",{className:"df-paper df-stage-forms"},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,"\u586B\u5199\u4E0E\u751F\u6210"),e.createElement("p",{className:"df-muted"},"\u8868\u5355\u6CBF\u7528\u9879\u76EE\u5E95\u7A3F\uFF0C\u6838\u5BF9\u540E\u751F\u6210\u3002\u5DF2\u6709\u6279\u6B21\u4FDD\u7559\u751F\u6210\u65F6\u7684\u5185\u5BB9\u3002")),e.createElement("div",{className:"df-actions"},b.id==="negotiation"&&e.createElement("button",{className:"df-primary",onClick:()=>xe()},"\u586B\u5199\u8C08\u5224\u6750\u6599"),e.createElement("button",{onClick:()=>Q.current.click()},"\u5BFC\u5165 Excel \u8868\u5355"))),ue.length?e.createElement("div",{className:"df-project-forms"},ue.map(i=>e.createElement("div",{key:i.case_id},e.createElement("div",null,e.createElement("b",null,i.name),e.createElement("small",null,Be(i.updated_at)," \xB7"," ",i.outputs?i.outputs+" \u4EFD\u6587\u4EF6":"\u586B\u5199\u4E2D",i.shared_changes.length>0&&" \xB7 \u9879\u76EE\u8D44\u6599\u6709\u66F4\u65B0")),e.createElement("div",{className:"df-actions"},e.createElement("button",{onClick:()=>k({id:i.case_id,view:"edit"})},"\u6253\u5F00\u8868\u5355"),i.outputs>0&&e.createElement("button",{onClick:()=>k({id:i.case_id,view:"files"})},"\u67E5\u770B\u751F\u6210\u6587\u4EF6"))))):e.createElement("p",{className:"df-empty"},"\u672C\u9636\u6BB5\u8FD8\u6CA1\u6709\u8868\u5355\u3002\u5DF2\u6709\u6210\u54C1\u6587\u4EF6\u53EF\u76F4\u63A5\u4E0A\u4F20\u5230\u4E0B\u9762\u7684\u6750\u6599\u6E05\u5355\u3002")),b.id==="negotiation"&&e.createElement("section",{className:"df-paper df-review-entry"},e.createElement("div",null,e.createElement("h2",null,"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5"),e.createElement("p",{className:"df-muted"},"\u5BF9\u7167\u6B63\u5F0F\u8C08\u5224\u6587\u4EF6\uFF0C\u68C0\u67E5\u5404\u5355\u4F4D\u54CD\u5E94\u6750\u6599\uFF0C\u6C47\u603B\u95EE\u9898\u3001\u4F9D\u636E\u548C\u5F85\u786E\u8BA4\u4E8B\u9879\u3002")),e.createElement("button",{onClick:()=>ne("response-review",{})},"\u6253\u5F00\u6838\u67E5\u667A\u80FD\u4F53 \u2192")),e.createElement("section",{className:"df-paper df-material-panel"},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,"\u6750\u6599\u6E05\u5355 ",e.createElement("small",null,b.materials.length)),e.createElement("p",{className:"df-muted"},"\u5148\u6309\u5E38\u7528\u6750\u6599\u5217\u51FA\uFF0C\u53EF\u4FEE\u6539\u540D\u79F0\u3001\u589E\u8865\u6750\u6599\u6216\u6807\u4E3A\u4E0D\u9002\u7528\u3002\u201C\u5DF2\u63D0\u4EA4\u201D\u7531\u7ECF\u529E\u4EBA\u6838\u5B9E\u540E\u8BB0\u5F55\u3002")),e.createElement("button",{onClick:()=>ne("material",{name:"",status:"pending",required:!1,note:""})},"\uFF0B \u6DFB\u52A0\u6750\u6599")),e.createElement("div",{className:"df-materials"},b.materials.map(i=>{let t=ue.reduce((n,l)=>n+(l.generations[0]?.files.filter(L=>L.name.includes(i.name)).length||0),0);return e.createElement("article",{className:"df-material-row",key:i.id},e.createElement("div",{className:"df-material-name"},e.createElement("b",null,i.name),i.required&&e.createElement("span",{className:"df-required-tag"},"\u5FC5\u5907"),e.createElement("span",{className:"df-state df-material-state-"+i.status},We[i.status]),t>0&&e.createElement("small",null,"\u5DF2\u6709 ",t," \u4EFD\u751F\u6210\u7A3F \xB7 \u5728\u4E0A\u65B9\u8868\u5355\u67E5\u770B"),i.note&&e.createElement("p",null,i.note)),e.createElement("div",{className:"df-material-files"},i.files.length>0?e.createElement("details",null,e.createElement("summary",null,i.files.length," \u4EFD\u6587\u4EF6 / \u7248\u672C \xB7 \u6700\u65B0\uFF1A",i.files[i.files.length-1].name),[...i.files].reverse().map((n,l)=>e.createElement("div",{className:"df-material-file",key:n.id},e.createElement("div",null,e.createElement("b",null,"V",i.files.length-l," \xB7"," ",n.name),e.createElement("small",null,Be(n.uploaded_at)," \xB7"," ",Math.max(1,Math.round(n.size/1024))," ","KB")),e.createElement("button",{onClick:()=>ee(n)},"\u9884\u89C8"),e.createElement("button",{"aria-label":"\u4E0B\u8F7D"+n.name+"\u7248\u672C"+(i.files.length-l),onClick:()=>B("\u4E0B\u8F7D\u6750\u6599",()=>c(`${le}/files/${n.id}`,n.name))},"\u4E0B\u8F7D")))):e.createElement("span",{className:"df-muted"},"\u5C1A\u672A\u4E0A\u4F20\u6587\u4EF6")),e.createElement("div",{className:"df-actions"},e.createElement("button",{"aria-label":"\u4E0A\u4F20"+i.name,onClick:()=>{ae.current=i.id,Ne.current.click()}},"\u4E0A\u4F20\u6587\u4EF6"),e.createElement("button",{"aria-label":"\u7F16\u8F91"+i.name,onClick:()=>ne("material",{...i})},"\u7F16\u8F91")))}))),e.createElement("div",{className:"df-stage-tail"},e.createElement("p",null,"\u5404\u9636\u6BB5\u53EF\u5E76\u884C\u51C6\u5907\uFF1B\u524D\u5E8F\u8D44\u6599\u53D8\u5316\u540E\uFF0C\u540E\u7EED\u9636\u6BB5\u4F1A\u63D0\u793A\u590D\u6838\u3002\u9636\u6BB5\u5B8C\u6210\u7531\u7ECF\u529E\u4EBA\u786E\u8BA4\u3002"),e.createElement("button",{onClick:()=>ne("stage",{...b,confirmed:!1})},"\u66F4\u65B0\u529E\u7406\u72B6\u6001"))))):e.createElement("section",{className:"df-paper df-project-welcome"},e.createElement("h2",null,"\u5148\u5EFA\u4E00\u4E2A\u9879\u76EE"),e.createElement("p",null,"\u5171\u7528\u8D44\u6599\u53EA\u6574\u7406\u4E00\u6B21\uFF0C\u8868\u5355\u4E0E\u9644\u4EF6\u6309\u9636\u6BB5\u5F52\u96C6\uFF0C\u751F\u6210\u7A3F\u4E0E\u5B9A\u7A3F\u5206\u522B\u7559\u75D5\u3002"),e.createElement("div",{className:"df-welcome-stages"},Ve.map((i,t)=>e.createElement("span",{key:i},e.createElement("small",null,String(t+1).padStart(2,"0")),i))),e.createElement("button",{className:"df-primary",onClick:()=>ne("create",{name:"",code:"",owner:""})},"\u5EFA\u7ACB\u7B2C\u4E00\u4E2A\u9879\u76EE"))),s==="response-review"&&e.createElement(he,{title:"\u54CD\u5E94\u6587\u4EF6\u6838\u67E5",onClose:()=>{x(null),M().catch(i=>y(i.message))}},e.createElement(Ee,{project:o,services:v,onChanged:()=>M().catch(i=>y(i.message))})),s==="create"&&e.createElement(he,{title:"\u65B0\u5EFA\u9879\u76EE",busy:!!N,error:X,onClose:()=>x(null)},e.createElement("form",{onSubmit:i=>{i.preventDefault(),B("\u5EFA\u7ACB\u9879\u76EE",async()=>{let t=await g("/projects",u(m));r(t),D("overview"),k(null),S(!1),x(null),await oe()})}},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u540D\u79F0"),e.createElement("input",{"aria-label":"\u65B0\u9879\u76EE\u540D\u79F0",required:!0,maxLength:120,value:m.name,onChange:i=>_({...m,name:i.target.value})})),e.createElement("div",{className:"df-fields"},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u7F16\u53F7"),e.createElement("input",{"aria-label":"\u65B0\u9879\u76EE\u7F16\u53F7",maxLength:100,value:m.code,onChange:i=>_({...m,code:i.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u7ECF\u529E\u4EBA"),e.createElement("input",{"aria-label":"\u65B0\u9879\u76EE\u7ECF\u529E\u4EBA",maxLength:100,value:m.owner,onChange:i=>_({...m,owner:i.target.value})}))),e.createElement("p",{className:"df-muted"},"\u5EFA\u7ACB\u9879\u76EE\u540E\uFF0C\u53EF\u6574\u7406\u5171\u7528\u8D44\u6599\uFF0C\u518D\u6309\u516D\u4E2A\u9636\u6BB5\u51C6\u5907\u6750\u6599\u3002"),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",disabled:!!N||!!E,onClick:()=>x(null)},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!N||!m.name?.trim(),type:"submit"},"\u5EFA\u7ACB\u9879\u76EE")))),s==="material"&&e.createElement(he,{title:"\u6750\u6599\u4FE1\u606F",busy:!!N,error:X,onClose:()=>x(null)},e.createElement("form",{onSubmit:Ce},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u6750\u6599\u540D\u79F0"),e.createElement("input",{"aria-label":"\u6750\u6599\u540D\u79F0",required:!0,maxLength:150,value:m.name,onChange:i=>_({...m,name:i.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u6750\u6599\u72B6\u6001"),e.createElement("select",{"aria-label":"\u6750\u6599\u72B6\u6001",value:m.status,onChange:i=>_({...m,status:i.target.value})},Object.entries(We).map(([i,t])=>e.createElement("option",{key:i,value:i},t)))),e.createElement("label",{className:"df-checkbox"},e.createElement("input",{type:"checkbox",checked:m.required,onChange:i=>_({...m,required:i.target.checked})}),"\u672C\u9879\u76EE\u7684\u5FC5\u5907\u6750\u6599\uFF0C\u9636\u6BB5\u5B8C\u6210\u524D\u9700\u786E\u8BA4\u5DF2\u5B8C\u6210\u6216\u4E0D\u9002\u7528"),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u6750\u6599\u8BF4\u660E"),e.createElement("textarea",{"aria-label":"\u6750\u6599\u8BF4\u660E",rows:3,maxLength:3e3,value:m.note,onChange:i=>_({...m,note:i.target.value})})),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",onClick:()=>x(null),disabled:!!N||!!E},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!N||!!E,type:"submit"},"\u4FDD\u5B58\u6750\u6599\u4FE1\u606F")))),s==="stage"&&e.createElement(he,{title:b.title+"\u529E\u7406\u4FE1\u606F",busy:!!N,error:X,onClose:()=>x(null)},e.createElement("form",{onSubmit:i=>{i.preventDefault(),B("\u4FDD\u5B58\u529E\u7406\u4FE1\u606F",()=>ge(`${le}/stages/${h}`,m,"PUT"))}},e.createElement("div",{className:"df-fields"},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9636\u6BB5\u72B6\u6001"),e.createElement("select",{"aria-label":"\u9636\u6BB5\u72B6\u6001",value:m.status,onChange:i=>_({...m,status:i.target.value})},Object.entries(De).map(([i,t])=>e.createElement("option",{key:i,value:i},t)))),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u8BA1\u5212\u65E5\u671F"),e.createElement("input",{"aria-label":"\u9636\u6BB5\u8BA1\u5212\u65E5\u671F",type:"date",value:m.due_date,onChange:i=>_({...m,due_date:i.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u529E\u7406\u7CFB\u7EDF"),e.createElement("input",{"aria-label":"\u529E\u7406\u7CFB\u7EDF",maxLength:150,value:m.system_name,onChange:i=>_({...m,system_name:i.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u7CFB\u7EDF\u5730\u5740"),e.createElement("input",{"aria-label":"\u7CFB\u7EDF\u5730\u5740",type:"url",placeholder:"https://",maxLength:1e3,value:m.system_url,onChange:i=>_({...m,system_url:i.target.value})}))),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u63D0\u4EA4\u7F16\u53F7 / \u56DE\u6267\u4FE1\u606F"),e.createElement("input",{"aria-label":"\u63D0\u4EA4\u7F16\u53F7",maxLength:500,value:m.submission_ref,onChange:i=>_({...m,submission_ref:i.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u529E\u7406\u8BF4\u660E"),e.createElement("textarea",{"aria-label":"\u529E\u7406\u8BF4\u660E",rows:4,maxLength:5e3,value:m.notes,onChange:i=>_({...m,notes:i.target.value})})),e.createElement("p",{className:"df-muted"},"\u8BB0\u5F55\u7EBF\u4E0B\u6216\u4E1A\u52A1\u7CFB\u7EDF\u7684\u5B9E\u9645\u529E\u7406\u7ED3\u679C\uFF0C\u56DE\u6267\u6587\u4EF6\u53EF\u4E0A\u4F20\u5230\u6750\u6599\u6E05\u5355\u3002"),m.status==="completed"&&e.createElement(e.Fragment,null,e.createElement("p",{className:"df-muted"},b.missing_required.length>0?"\u5C1A\u672A\u529E\u7ED3\u7684\u5FC5\u5907\u6750\u6599\uFF1A"+b.missing_required.join("\u3001"):"\u8BF7\u786E\u8BA4\u9636\u6BB5\u6750\u6599\u548C\u524D\u5E8F\u53D8\u66F4\u5DF2\u6838\u5BF9\u3002"),e.createElement("label",{className:"df-checkbox"},e.createElement("input",{"aria-label":"\u786E\u8BA4\u672C\u9636\u6BB5\u5DF2\u529E\u7ED3",type:"checkbox",checked:m.confirmed,onChange:i=>_({...m,confirmed:i.target.checked})}),"\u5DF2\u6838\u5BF9\u672C\u9636\u6BB5\u6750\u6599\u53CA\u524D\u5E8F\u53D8\u66F4\uFF0C\u786E\u8BA4\u672C\u9636\u6BB5\u5DF2\u529E\u7ED3")),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",onClick:()=>x(null),disabled:!!N||!!E},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!N||m.status==="completed"&&!m.confirmed,type:"submit"},"\u4FDD\u5B58\u529E\u7406\u4FE1\u606F")))),J&&e.createElement(Xe,{key:J.id,file:J,projectId:o.id,download:(i,t)=>B("\u4E0B\u8F7D\u539F\u6587\u4EF6",()=>c(i,t)),onClose:()=>ee(null)}))}function Je({project:d,Field:v,onSave:g,onDirtyChange:u}){let[c,j]=U(d.fields),[p,z]=U({name:d.name,code:d.code,owner:d.owner});return be(()=>{u(JSON.stringify(c)!==JSON.stringify(d.fields)||p.name!==d.name||p.code!==d.code||p.owner!==d.owner)},[c,p]),e.createElement("form",{className:"df-paper df-project-profile",onSubmit:o=>{o.preventDefault(),g({...p,values:Object.fromEntries(c.map(r=>[r.key,r.value]))})}},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,"\u9879\u76EE\u8D44\u6599\u5E95\u7A3F"),e.createElement("p",{className:"df-muted"},"\u5404\u9636\u6BB5\u8868\u5355\u590D\u7528\u8FD9\u91CC\u7684\u8D44\u6599\uFF1B\u9636\u6BB5\u65E5\u671F\u3001\u8BC4\u5BA1\u5206\u6570\u548C\u4ED8\u6B3E\u7ED3\u679C\u5206\u522B\u8BB0\u5F55\u3002")),e.createElement("button",{className:"df-primary",type:"submit"},"\u4FDD\u5B58\u9879\u76EE\u8D44\u6599")),e.createElement("div",{className:"df-fields"},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u540D\u79F0"),e.createElement("input",{"aria-label":"\u9879\u76EE\u540D\u79F0",required:!0,value:p.name,maxLength:120,onChange:o=>z({...p,name:o.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u7F16\u53F7"),e.createElement("input",{"aria-label":"\u9879\u76EE\u7F16\u53F7",value:p.code,maxLength:100,onChange:o=>z({...p,code:o.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u7ECF\u529E\u4EBA"),e.createElement("input",{"aria-label":"\u7ECF\u529E\u4EBA",value:p.owner,maxLength:100,onChange:o=>z({...p,owner:o.target.value})}))),[...new Set(c.filter(o=>!["project.name","project.code"].includes(o.key)).map(o=>o.group))].map(o=>e.createElement("section",{className:"df-group",key:o},e.createElement("h3",null,o),e.createElement("div",{className:"df-fields"},c.filter(r=>r.group===o&&!["project.name","project.code"].includes(r.key)).map(r=>e.createElement(v,{key:r.key,field:{...r,required:!1},onChange:h=>j(c.map(D=>D.key===r.key?{...D,value:h}:D))}))))),e.createElement("div",{className:"df-actions"},e.createElement("button",{className:"df-primary",type:"submit"},"\u4FDD\u5B58\u9879\u76EE\u8D44\u6599")))}var R=window.QwenPaw,a=R.host.React,{useState:K,useEffect:we,useLayoutEffect:He,useRef:ye}=a,Le="/document-forms",Ye="application/vnd.openxmlformats-officedocument.wordprocessingml.document";async function V(d,v){let g=await R.host.fetch(Le+d,v);if(!g.ok){let u=await g.json().catch(()=>({}));throw new Error(typeof u.detail=="string"?u.detail:Array.isArray(u.detail)?u.detail.map(c=>`${c.loc?.slice(1).join(".")||"\u8D44\u6599"}\uFF1A${c.msg}`).join("\uFF1B"):`\u64CD\u4F5C\u672A\u5B8C\u6210\uFF08${g.status}\uFF09\uFF0C\u8BF7\u68C0\u67E5\u586B\u5199\u5185\u5BB9`)}return g.json()}async function $e(d,v){let g=await R.host.fetch(Le+d);if(!g.ok)throw new Error("\u6587\u4EF6\u4E0B\u8F7D\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5");let u=URL.createObjectURL(await g.blob()),c=document.createElement("a");c.href=u,c.download=v,document.body.appendChild(c);try{c.click()}finally{c.remove(),setTimeout(()=>URL.revokeObjectURL(u),1e3)}}var fe=d=>({method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)}),ke=d=>new Date(d).toLocaleString("zh-CN",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}),Fe=d=>d.kind==="textarea"||d.value.length>100||d.value.includes(`
`)||d.label.includes("\u6574\u6BB5"),Ze=d=>/^(research\.contents|deliverables\.|metrics\.|milestones\.)/.test(d.key)||/主要研究内容|预期成果|考核指标|进度安排/.test(d.label);function Se(d){return d.map((v,g)=>{let u={...v};for(let c of["start","end"]){let j="follow_"+c;u[j]=g>0&&(typeof u[j]=="boolean"?u[j]:!u[c]),u[j]&&(u[c]=d[0][c])}return u})}function Me({field:d,displayValue:v,onChange:g}){let u=Fe(d),c=Ze(d),j=["date","datetime-local"].includes(d.kind)?d.value:v??d.value,p=ye(null);return He(()=>{if(!p.current)return;let z=p.current.scrollTop;p.current.style.height="auto",p.current.style.height=Math.max(c?104:192,p.current.scrollHeight)+"px",p.current.scrollTop=z},[j,u,c]),a.createElement("label",{className:"df-field"+(u?" df-field-paragraph":"")+(c?" df-field-compact":""),id:"df-"+d.key},a.createElement("span",null,d.label,d.required&&a.createElement("em",null,"\u5FC5\u586B")),u?a.createElement("textarea",{ref:p,"aria-label":d.label,rows:c?3:8,value:j,onChange:z=>g(z.target.value)}):a.createElement("input",{"aria-label":d.label,type:d.kind,step:d.kind==="number"?"any":void 0,value:j,onChange:z=>g(z.target.value)}),a.createElement("small",null,d.key))}function Re({project:d,workflowStage:v,initialCaseId:g,initialView:u,onBack:c,onChanged:j,onDirtyChange:p,onBusyChange:z,onViewChange:o}){let[r,h]=K(null),[D,O]=K(null),[I,w]=K([]),[k,$]=K("import"),[S,A]=K(!1),[T,E]=K(null),[F,N]=K(!1),[P,X]=K(""),[y,H]=K(""),[Y,s]=K(""),[x,m]=K(null),[_,J]=K(null),ee=ye(null),q=ye(null),te=ye(0),Q=ye(!0),Ne=R.host.useTheme?.()||"light",ae=()=>j?.()||Promise.resolve();we(()=>(Q.current=!0,V("/cases/"+g).then(t=>{Q.current&&(Z(t),$(u==="files"&&t.generations.length?"files":"edit"),u==="files"&&t.generations.length&&m({file:t.generations[0].files[0],generation:t.generations[0]}))}).catch(t=>Q.current&&H(t.message)),(R.workspace?.loadPreview?R.workspace.loadPreview():Promise.resolve(me)).then(t=>{Q.current&&J(()=>t)}).catch(t=>{Q.current&&J(()=>me)}),()=>{Q.current=!1,te.current++}),[]),we(()=>{p?.(S)},[S]),we(()=>{z?.(P)},[P]),we(()=>{o?.()},[k]),we(()=>{let t=n=>{S&&(n.preventDefault(),n.returnValue="")};return window.addEventListener("beforeunload",t),()=>window.removeEventListener("beforeunload",t)},[S]);async function W(t,n){if(P)return;let l=++te.current;X(t),H(""),s("");try{await n()}catch(L){Q.current&&l===te.current&&H(L.message)}finally{Q.current&&l===te.current&&X("")}}function Z(t){Q.current&&(h({...t,recipients:Se(t.recipients),presentation_sources:Object.fromEntries(t.fields.map(n=>[n.key,n.value]))}),A(!1),E(null),N(!1))}function b(t){h(t),A(!0),E(null),N(!1),s("")}function ue(t,n,l,L=!1){let ve=r.recipients.map((Ue,Qe)=>Qe===t?{...Ue,[n]:l,...n!=="name"?{["follow_"+n]:L}:{}}:Ue);b({...r,recipients:Se(ve)})}async function G(){if(!S)return r;let t={revision:r.revision,name:r.name.trim()||"\u672A\u547D\u540D\u586B\u62A5",values:Object.fromEntries(r.fields.map(l=>[l.key,l.value])),recipients:r.recipients},n=await V("/cases/"+r.id,{...fe(t),method:"PUT"});return Z(n),n}function oe(){return!S||window.confirm("\u5F53\u524D\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\u3002\u79BB\u5F00\u6B64\u8BB0\u5F55\uFF1F")}let M=r?.templates||[],B=M.reduce((t,n)=>t+(n.per_recipient?r.recipients.length:1),0),se=r?.generations[0],ie=T?.checks.filter(t=>t.status!=="ok")||[];async function ne(t){!t||!oe()||await W("\u8BFB\u53D6 Excel",async()=>{let n=new FormData;n.append("workbook",t),n.append("revision",d.revision),n.append("stage_id",v.id);let l=await V(`/projects/${d.id}/cases/import`,{method:"POST",body:n});Z(l),m(null),$("edit"),await ae(),s(l.templates.length?"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\uFF0C\u5E76\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002":l.template_notice||"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\u3002\u8BF7\u6DFB\u52A0\u5BF9\u5E94\u7684 Word \u6A21\u677F\u3002")})}async function ge(t){t=Array.from(t),t.length&&await W("\u8BFB\u53D6 Word \u6A21\u677F",async()=>{let n=await G(),l=new FormData;l.append("revision",String(n.revision)),Array.from(t).forEach(L=>l.append("files",L)),Z(await V("/cases/"+n.id+"/templates",{method:"POST",body:l})),await ae(),s("Word \u6A21\u677F\u5DF2\u6DFB\u52A0\uFF0C\u751F\u6210\u65F6\u4F1A\u4FDD\u7559\u539F\u6709\u6392\u7248\u3002")})}async function xe(){await W("\u6838\u5BF9\u8D44\u6599",async()=>{let t=await G(),n=await V("/cases/"+t.id+"/review",fe({revision:t.revision}));Q.current&&(E(n),N(!1),$("review"),await ae())})}async function Pe(){await W("\u751F\u6210\u6587\u4E66",async()=>{let t=await V("/cases/"+r.id+"/generate",fe({revision:r.revision,review_token:T.review_token,confirmed:F}));Z(t),$("files"),m({file:t.generations[0].files[0],generation:t.generations[0]}),await ae()})}function le(t){$("edit"),requestAnimationFrame(()=>{let n=document.getElementById("df-"+t);n?.scrollIntoView({behavior:"smooth",block:"center"}),n?.querySelector("input,textarea")?.focus()})}let Ce=(t,n)=>`/cases/${r.id}/outputs/${t.id}/${encodeURIComponent(n)}`;function je(t){return W("\u6B63\u5728\u4E0B\u8F7D\u538B\u7F29\u5305",async()=>{await $e(Ce(t,"\u5168\u90E8\u6587\u4E66.zip"),t.bundle_name||r.name+"_\u6587\u4E66.zip"),s(`\u5DF2\u5F00\u59CB\u4E0B\u8F7D\u8BE5\u6279\u6B21\u7684 ${t.files.length} \u4EFD\u6587\u4E66\u538B\u7F29\u5305\u3002`)})}let i=x?{id:x.generation.id+x.file.name,title:x.file.name,source:"generated",mimeType:Ye,extension:"docx",binaryUrl:x.file.preview_url,printUrl:Le+`/cases/${r.id}/print/${x.generation.id}/${encodeURIComponent(x.file.name)}`,agentId:R.host.getSelectedAgentId?.(),createdAt:Date.parse(x.generation.created_at)}:null;return a.createElement("div",{className:"df-app df-embedded-editor","data-theme":Ne},a.createElement("style",null,ze),a.createElement("input",{ref:ee,type:"file",accept:".xlsx",hidden:!0,"aria-label":"\u5BFC\u5165 Excel \u53D8\u91CF\u8868",onChange:t=>{ne(t.target.files[0]),t.target.value=""}}),a.createElement("input",{ref:q,type:"file",accept:".docx",multiple:!0,hidden:!0,"aria-label":"\u5BFC\u5165 Word \u6A21\u677F",onChange:t=>{ge(t.target.files),t.target.value=""}}),a.createElement("section",{className:"df-main"},a.createElement("div",{className:"df-editor-context"},a.createElement("button",{disabled:!!P,onClick:()=>{oe()&&c()}},"\u2190 \u8FD4\u56DE",v.title),a.createElement("span",null,d.name," / ",v.title),r&&a.createElement("div",{className:"df-actions"},a.createElement("button",{disabled:!!P,onClick:()=>{O("adopt"),w([])}},"\u6838\u5BF9\u9879\u76EE\u8D44\u6599\u5DEE\u5F02"),a.createElement("button",{disabled:!!P,onClick:()=>{O("publish"),w([])}},"\u5B58\u5165\u9879\u76EE\u5E95\u7A3F"))),a.createElement("header",{className:"df-header"},a.createElement("div",null,a.createElement("span",{className:"df-eyebrow"},v.title," / \u586B\u5199\u4E0E\u751F\u6210"),a.createElement("h1",null,r?r.name:"\u628A\u91CD\u590D\u586B\u5199\u7684\u8D44\u6599\uFF0C\u6574\u7406\u6210\u4E00\u5F20\u8868\u3002"),a.createElement("p",null,r?S?"\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539":`\u8349\u7A3F\u5DF2\u4FDD\u5B58 \xB7 ${ke(r.updated_at)}`:"\u5BFC\u5165\u53D8\u91CF\u8868\u4E0E Word \u6A21\u677F\uFF0C\u586B\u5199\u3001\u6838\u5BF9\uFF0C\u518D\u751F\u6210\u6587\u4E66\u3002")),r&&a.createElement("button",{disabled:!!P||!S,onClick:()=>W("\u4FDD\u5B58\u8349\u7A3F",async()=>{await G(),await ae(),s("\u8349\u7A3F\u5DF2\u4FDD\u5B58")})},"\u4FDD\u5B58\u8349\u7A3F")),a.createElement("div",{className:"df-steps","aria-label":"\u586B\u5199\u6D41\u7A0B"},[["import","01","\u5BFC\u5165\u6A21\u677F"],["edit","02","\u586B\u5199\u8D44\u6599"],["review","03","\u6838\u5BF9\u751F\u6210"],["files","04","\u6587\u4EF6\u9884\u89C8"]].map(([t,n,l])=>a.createElement("button",{key:t,className:k===t?"active":"",disabled:!!P||!r&&t!=="import"||t==="files"&&!se,onClick:()=>t==="review"?xe():$(t)},a.createElement("span",null,n),l))),y&&a.createElement("div",{className:"df-alert error",role:"alert"},y,a.createElement("button",{"aria-label":"\u5173\u95ED\u9519\u8BEF\u63D0\u793A",onClick:()=>H("")},"\xD7")),Y&&a.createElement("div",{className:"df-alert",role:"status"},Y),P&&a.createElement("div",{className:"df-progress",role:"status"},P,"\u2026"),a.createElement("fieldset",{className:"df-content",disabled:!!P},k==="import"&&a.createElement("div",{className:"df-import"},a.createElement("section",{className:"df-paper df-drop"},a.createElement("div",{className:"df-file-mark"},"XLSX"),a.createElement("h2",null,"\u4ECE Excel \u53D8\u91CF\u8868\u5F00\u59CB"),a.createElement("p",null,"\u201C\u53D8\u91CF\u914D\u7F6E\u201D\u5DE5\u4F5C\u8868\u4FDD\u7559\u4E09\u5217\uFF1A",a.createElement("br",null),a.createElement("b",null,"\u53D8\u91CF\u540D\u79F0\u3000\u4E2D\u6587\u540D\u79F0\u3000\u503C")),a.createElement("button",{className:"df-primary",onClick:()=>ee.current.click()},"\u9009\u62E9 Excel \u53D8\u91CF\u8868"),a.createElement("small",null,"\u652F\u6301 .xlsx \xB7 \u5355\u4E2A\u6587\u4EF6\u4E0D\u8D85\u8FC7 15 MB")),a.createElement("section",{className:"df-paper df-import-note"},a.createElement("span",{className:"df-eyebrow"},"\u5982\u4F55\u51C6\u5907"),a.createElement("h2",null,"\u4E00\u4EFD\u6570\u636E\uFF0C\u591A\u4EFD\u6587\u4E66"),a.createElement("ol",null,a.createElement("li",null,a.createElement("b",null,"\u6574\u7406\u53D8\u91CF"),a.createElement("p",null,"\u4F8B\u5982 project.name / \u9879\u76EE\u540D\u79F0 / \u5B9E\u9645\u540D\u79F0\u3002\u652F\u6301\u5206\u7EC4\u3001\u7C7B\u578B\u548C\u5FC5\u586B\u5217\u3002")),a.createElement("li",null,a.createElement("b",null,"\u81EA\u52A8\u8F7D\u5165\u6A21\u677F"),a.createElement("p",null,"\u5E94\u7528\u81EA\u5E26 5 \u4EFD\u6807\u51C6 Word \u6A21\u677F\uFF0C\u4F7F\u7528\u914D\u5957 Excel \u5373\u53EF\u81EA\u52A8\u8F7D\u5165\uFF1B \u4E5F\u53EF\u6DFB\u52A0\u81EA\u5DF1\u7684\u6A21\u677F\u3002")),a.createElement("li",null,a.createElement("b",null,"\u5206\u522B\u751F\u6210\u9080\u8BF7\u51FD"),a.createElement("p",null,"\u5728\u201C\u53D7\u9080\u5355\u4F4D\u201D\u8868\u8BB0\u5F55\u5355\u4F4D\u540D\u79F0\u3001\u9886\u53D6\u5F00\u59CB\u65F6\u95F4\u548C\u9886\u53D6\u7ED3\u675F\u65F6\u95F4\u3002"))),a.createElement("p",{className:"df-muted"},"\u201C\u65E5\u671F\u6821\u6838\u201D\u8868\u4E2D\u7684\u65E7\u7ED3\u679C\u4E0D\u4F1A\u4F5C\u4E3A\u5224\u65AD\u4F9D\u636E\uFF1B\u5E94\u7528\u4F1A\u6839\u636E\u5F53\u524D\u586B\u5199\u5185\u5BB9\u91CD\u65B0\u6838\u5BF9\u3002\u201C\u6821\u6838\u89C4\u5219\u201D\u8868\u53EF\u8865\u5145\u81EA\u5B9A\u4E49\u5148\u540E\u5173\u7CFB\u3002"))),r&&k==="edit"&&a.createElement("div",{className:"df-edit-layout"},a.createElement("section",{className:"df-paper"},a.createElement("div",{className:"df-section-head"},a.createElement("h2",null,"\u586B\u5199\u4FE1\u606F"),a.createElement("button",{onClick:()=>W("\u5BFC\u51FA Excel",async()=>{let t=await G();await $e(`/cases/${t.id}/excel`,(t.fields.find(n=>n.key==="project.name")?.value||t.name).replace(/[<>:"/\\|?*\x00-\x1f]/g,"_").slice(0,80)+"_\u586B\u5199\u6570\u636E.xlsx")})},"\u5BFC\u51FA\u5F53\u524D Excel")),a.createElement("label",{className:"df-field df-title-field"},a.createElement("span",null,"\u8868\u5355\u540D\u79F0"),a.createElement("input",{"aria-label":"\u8868\u5355\u540D\u79F0",maxLength:120,value:r.name,onChange:t=>b({...r,name:t.target.value})})),[...new Set(r.fields.map(t=>t.group))].map(t=>a.createElement("section",{className:"df-group",key:t},a.createElement("h3",null,t),t==="\u65E5\u671F\u5B89\u6392"&&a.createElement("p",{className:"df-muted"},"\u6587\u4E66\u7EDF\u4E00\u4F7F\u7528\u4E2D\u6587\u65E5\u671F\uFF0C\u4F8B\u5982\u201C2026\u5E7410\u670822\u65E5\u4E0B\u534814:30\u201D\u3002\u65E5\u671F\u9009\u62E9\u5668\u4FDD\u7559\u539F\u6765\u7684\u586B\u5199\u65B9\u5F0F\u3002"),a.createElement("div",{className:"df-fields"},r.fields.filter(n=>n.group===t).map(n=>a.createElement(Me,{key:n.key,field:n,displayValue:r.presentation_sources?.[n.key]===n.value?r.document_values?.[n.key]:void 0,onChange:l=>b({...r,fields:r.fields.map(L=>L.key===n.key?{...L,value:l}:L)})})))))),a.createElement("section",{className:"df-paper"},a.createElement("div",{className:"df-section-head"},a.createElement("div",null,a.createElement("h2",null,"\u53D7\u9080\u5355\u4F4D"," ",a.createElement("span",{className:"df-count"},r.recipients.length)),a.createElement("p",null,"\u6309\u5355\u4F4D\u6587\u4E66\u5206\u522B\u751F\u6210\uFF0C\u5171\u7528\u9879\u76EE\u4E0E\u843D\u6B3E\u4FE1\u606F\u3002")),a.createElement("button",{onClick:()=>b({...r,recipients:Se([...r.recipients,{name:"",start:"",end:""}])}),disabled:r.recipients.length>=200},"\uFF0B \u6DFB\u52A0\u5355\u4F4D")),r.recipients.map((t,n)=>a.createElement("div",{className:"df-recipient",key:n,id:"df-recipient-"+n},a.createElement("div",{className:"df-recipient-title"},a.createElement("b",null,String(n+1).padStart(2,"0")),a.createElement("button",{"aria-label":`\u79FB\u9664\u7B2C${n+1}\u5BB6\u5355\u4F4D`,onClick:()=>b({...r,recipients:Se(r.recipients.filter((l,L)=>L!==n))})},"\u79FB\u9664")),a.createElement("div",{className:"df-fields"},[["name","\u5355\u4F4D\u540D\u79F0"],["start","\u9886\u53D6\u5F00\u59CB\u65F6\u95F4"],["end","\u9886\u53D6\u7ED3\u675F\u65F6\u95F4"]].map(([l,L])=>a.createElement("label",{className:"df-field "+(l==="name"?"df-span":""),key:l},a.createElement("span",null,L),a.createElement("input",{"aria-label":`\u7B2C${n+1}\u5BB6${L}`,type:l==="name"?"text":"datetime-local",value:l==="name"?t[l]:t[l].replace(" ","T"),onChange:ve=>ue(n,l,ve.target.value)}),n>0&&l!=="name"&&a.createElement("small",{className:"df-follow-state"},t["follow_"+l]?"\u8DDF\u968F\u7B2C1\u5BB6":"\u5DF2\u5355\u72EC\u8BBE\u7F6E",!t["follow_"+l]&&a.createElement("button",{type:"button","aria-label":`\u7B2C${n+1}\u5BB6${L}\u6062\u590D\u8DDF\u968F`,onClick:ve=>{ve.preventDefault(),ue(n,l,r.recipients[0][l],!0)}},"\u6062\u590D\u8DDF\u968F")))))))),a.createElement("section",{className:"df-paper df-template-panel","aria-label":"Word \u6A21\u677F"},a.createElement("div",{className:"df-section-head"},a.createElement("h2",null,"Word \u6A21\u677F"),a.createElement("div",{className:"df-template-actions"},M.length>0?a.createElement("button",{onClick:()=>W("\u4FDD\u5B58\u9ED8\u8BA4\u6A21\u677F",async()=>{let t=await G();await V(`/cases/${t.id}/defaults`,fe({revision:t.revision})),s(v.id==="negotiation"?"\u5DF2\u8BBE\u4E3A\u672C\u673A\u9ED8\u8BA4\u6A21\u677F\uFF0C\u4EE5\u540E\u65B0\u5EFA\u586B\u62A5\u4F1A\u81EA\u52A8\u8F7D\u5165\u3002":"\u5DF2\u8BBE\u4E3A\u672C\u9636\u6BB5\u9ED8\u8BA4\u6A21\u677F\uFF0C\u4EE5\u540E\u65B0\u5EFA\u8BE5\u9636\u6BB5\u8868\u5355\u4F1A\u81EA\u52A8\u8F7D\u5165\u3002")})},v.id==="negotiation"?"\u8BBE\u4E3A\u9ED8\u8BA4\u6A21\u677F":"\u8BBE\u4E3A\u672C\u9636\u6BB5\u9ED8\u8BA4\u6A21\u677F"):a.createElement("button",{onClick:()=>W("\u8F7D\u5165\u9ED8\u8BA4\u6A21\u677F",async()=>{let t=await G();Z(await V(`/cases/${t.id}/defaults/apply`,fe({revision:t.revision}))),s("\u5DF2\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002")})},"\u4F7F\u7528\u9ED8\u8BA4\u6A21\u677F"),a.createElement("button",{onClick:()=>q.current.click()},"\uFF0B \u6DFB\u52A0"))),!M.length&&a.createElement("p",{className:"df-muted"},"\u6DFB\u52A0\u4E0E\u4F60\u7684\u53D8\u91CF\u8868\u5BF9\u5E94\u7684 .docx \u6A21\u677F\u3002"),M.map(t=>a.createElement("div",{className:"df-template",key:t.id},a.createElement("b",null,t.name),t.from_builtin&&a.createElement("small",null,"\u5E94\u7528\u81EA\u5E26\u6A21\u677F"),a.createElement("span",null,t.per_recipient?"\u6309\u53D7\u9080\u5355\u4F4D\u5206\u522B\u751F\u6210":"\u5171\u7528\u6587\u4EF6 \xB7 \u751F\u6210\u4E00\u4EFD"),t.print_copies>1&&a.createElement("small",null,"\u5EFA\u8BAE\u6253\u5370 ",t.print_copies," \u4EFD \xB7 ",t.print_note),a.createElement("small",null,t.keys.length," \u4E2A\u5F15\u7528\u53D8\u91CF"),a.createElement("button",{"aria-label":"\u79FB\u9664\u6A21\u677F"+t.name,onClick:()=>W("\u79FB\u9664\u6A21\u677F",async()=>{let n=await G();Z(await V(`/cases/${n.id}/templates/${t.id}?revision=${n.revision}`,{method:"DELETE"}))})},"\u79FB\u9664")))),a.createElement("section",{className:"df-paper df-edit-footer","aria-label":"\u6838\u5BF9\u4E0E\u751F\u6210"},a.createElement("div",{className:"df-generation-plan"},a.createElement("h2",null,"\u6838\u5BF9\u4E0E\u751F\u6210"),a.createElement("p",null,"\u672C\u6B21\u8BA1\u5212\u751F\u6210 ",a.createElement("b",null,B)," \u4EFD\u6587\u4E66"),a.createElement("small",null,M.filter(t=>!t.per_recipient).length," ","\u4EFD\u5171\u7528\u6587\u4EF6 \xB7"," ",M.filter(t=>t.per_recipient).length," ","\u7C7B\u6309\u5355\u4F4D\u6587\u4E66 \xD7 ",r.recipients.length," \u5BB6\u5355\u4F4D")),a.createElement("div",{className:"df-next-action"},a.createElement("button",{className:"df-primary",onClick:xe},"\u6838\u5BF9\u586B\u5199\u5185\u5BB9 \u2192"),a.createElement("small",null,"\u5148\u6838\u5BF9\u7F3A\u9879\u4E0E\u65E5\u671F\uFF0C\u518D\u786E\u8BA4\u751F\u6210")))),r&&k==="review"&&T&&a.createElement("div",{className:"df-review"},a.createElement("section",{className:"df-paper"},a.createElement("span",{className:"df-eyebrow"},"\u586B\u5199\u6838\u5BF9"),a.createElement("h2",null,T.can_generate?"\u8D44\u6599\u5DF2\u9F50\u5907\uFF0C\u8BF7\u786E\u8BA4\u672C\u6B21\u5185\u5BB9\u3002":`\u8FD8\u6709 ${ie.length} \u9879\u9700\u8981\u5904\u7406`),a.createElement("p",null,"\u672C\u6B21\u4F7F\u7528\u4FEE\u8BA2 ",r.revision," \u7684\u6570\u636E\uFF0C\u8BA1\u5212\u751F\u6210 ",B," ","\u4EFD\u6587\u4E66\u3002"),ie.length>0&&a.createElement("div",{className:"df-checks"},ie.map((t,n)=>a.createElement("div",{key:n,className:"df-check "+t.status},a.createElement("span",null,t.status==="ok"?"\u901A\u8FC7":t.status==="missing"?"\u5F85\u8865\u5145":"\u51B2\u7A81"),a.createElement("div",null,a.createElement("b",null,t.label),a.createElement("p",null,t.detail)),t.status!=="ok"&&t.field&&a.createElement("button",{onClick:()=>le(t.field)},"\u4FEE\u6539")))),T.checks.some(t=>t.status==="ok")&&a.createElement("details",{className:"df-passed"},a.createElement("summary",null,T.checks.filter(t=>t.status==="ok").length," ","\u9879\u65E5\u671F\u6821\u6838\u901A\u8FC7 \xB7 \u67E5\u770B\u660E\u7EC6"),T.checks.filter(t=>t.status==="ok").map((t,n)=>a.createElement("p",{key:n},a.createElement("b",null,t.label),a.createElement("br",null),t.detail.replaceAll("T"," ")))),a.createElement("div",{className:"df-review-data"},a.createElement("h3",null,"\u5171\u7528\u4FE1\u606F"),a.createElement("dl",null,r.fields.map(t=>a.createElement("div",{key:t.key,className:Fe(t)?"df-span":void 0},a.createElement("dt",null,t.label),a.createElement("dd",null,(r.document_values?.[t.key]??t.value)||"\u5C1A\u672A\u586B\u5199")))),r.recipients.length>0&&a.createElement(a.Fragment,null,a.createElement("h3",null,"\u53D7\u9080\u5355\u4F4D"),r.recipients.map((t,n)=>a.createElement("p",{key:n},n+1,". ",t.name||"\u5C1A\u672A\u586B\u5199",r.recipient_document_times?.[n]??`${t.start.replace("T"," ")} \u2014 ${t.end.replace("T"," ")}`)))),a.createElement("div",{className:"df-review-data"},a.createElement("h3",null,"\u8F93\u51FA\u6E05\u5355"),M.map(t=>a.createElement("p",{key:t.id},t.name," \xB7"," ",t.per_recipient?r.recipients.map(n=>n.name||"\u5F85\u586B\u5355\u4F4D").join("\u3001"):"\u5171\u7528\u6587\u4EF6",t.print_copies>1&&` \xB7 \u5EFA\u8BAE\u6253\u5370 ${t.print_copies} \u4EFD\uFF0C\u6BCF\u4F4D\u4E13\u5BB6\u4E00\u4EFD`))),a.createElement("div",{className:"df-confirm"},a.createElement("label",null,a.createElement("input",{type:"checkbox",checked:F,disabled:!T.can_generate,onChange:t=>N(t.target.checked)}),"\u6211\u5DF2\u6838\u5BF9\u586B\u5199\u5185\u5BB9\u3001\u53D7\u9080\u5355\u4F4D\u548C\u65E5\u671F\u5B89\u6392"),a.createElement("p",null,"\u6821\u6838\u68C0\u67E5\u8D44\u6599\u5B8C\u6574\u6027\u53CA\u65F6\u95F4\u987A\u5E8F\u3002\u4E1A\u52A1\u6761\u6B3E\u4E0E Word \u6A21\u677F\u8BF7\u7531\u7ECF\u529E\u4EBA\u590D\u6838\u3002"),a.createElement("div",null,a.createElement("button",{onClick:()=>{$("edit"),N(!1)}},"\u8FD4\u56DE\u4FEE\u6539"),a.createElement("button",{className:"df-primary",disabled:!T.can_generate||!F,onClick:Pe},"\u786E\u8BA4\u5E76\u751F\u6210 ",B," \u4EFD\u6587\u4E66"))))),r&&k==="files"&&se&&a.createElement("div",{className:"df-results"},a.createElement("section",{className:"df-paper df-output-list"},a.createElement("span",{className:"df-eyebrow"},"\u751F\u6210\u8BB0\u5F55"),a.createElement("h2",null,se.files.length," \u4EFD\u6587\u4EF6\u5DF2\u751F\u6210"),a.createElement("p",null,ke(se.created_at)," \xB7 \u4FEE\u8BA2 ",se.revision),a.createElement("p",{className:"df-muted"},"\u538B\u7F29\u5305\u5305\u542B Word\u3001\u586B\u5199\u6570\u636E\u548C\u6838\u5BF9\u8BB0\u5F55"),(S||se.revision!==r.revision)&&a.createElement("div",{className:"df-alert"},"\u586B\u5199\u5185\u5BB9\u5DF2\u6709\u4FEE\u6539\uFF0C\u4E0B\u5217\u6587\u4EF6\u4FDD\u7559\u751F\u6210\u65F6\u7684\u5185\u5BB9\u3002\u8BF7\u91CD\u65B0\u6838\u5BF9\u5E76\u751F\u6210\u65B0\u7248\u3002"),r.generations.map(t=>a.createElement("div",{className:"df-generation",key:t.id},a.createElement("div",{className:"df-generation-heading"},a.createElement("h3",null,ke(t.created_at)," \xB7 \u4FEE\u8BA2 ",t.revision,t.date_style!=="zh-CN"&&" \xB7 \u539F\u65E5\u671F\u683C\u5F0F",t.naming_style!=="formal"&&" \xB7 \u539F\u6587\u4EF6\u540D"),a.createElement("button",{"aria-label":`\u6253\u5305\u4E0B\u8F7D ${ke(t.created_at)} \u4FEE\u8BA2 ${t.revision}`,onClick:()=>je(t)},"\u6253\u5305\u4E0B\u8F7D")),t.files.map(n=>a.createElement("div",{className:"df-output "+(x?.file.name===n.name&&x?.generation.id===t.id?"selected":""),key:n.name},a.createElement("button",{onClick:()=>m({file:n,generation:t})},a.createElement("b",null,n.name),a.createElement("small",null,n.recipient," \xB7 ",(n.size/1024).toFixed(0)," KB",n.print_copies>1&&` \xB7 \u5EFA\u8BAE\u6253\u5370 ${n.print_copies} \u4EFD`)),a.createElement("button",{"aria-label":"\u4E0B\u8F7D"+n.name,onClick:()=>W("\u4E0B\u8F7D\u6587\u4EF6",()=>$e(Ce(t,n.name),n.name))},"\u2193")))))),a.createElement("section",{className:"df-paper df-preview"},a.createElement("div",{className:"df-section-head"},a.createElement("h2",null,x?x.file.name:"\u9009\u62E9\u6587\u4EF6\u9884\u89C8"),a.createElement("span",null,"Office \u9884\u89C8")),a.createElement("div",{className:"df-preview-body"},i&&_?a.createElement(Ie,{key:i.id,artifact:i},a.createElement(_,{key:i.id,artifact:i,readOnly:!0,hostControls:!0})):a.createElement("p",{className:"df-muted"},i?"\u6B63\u5728\u6253\u5F00\u6587\u4EF6\u2026":"\u4ECE\u5DE6\u4FA7\u9009\u62E9\u4E00\u4EFD\u6587\u4EF6\u3002"))))),a.createElement("footer",{className:"df-footer"},a.createElement("span",null,"UGSci \xB7 \u6587\u4E66\u586B\u62A5"),a.createElement("span",null,"\u6570\u636E\u4E0E\u6587\u4E66\u4FDD\u5B58\u5728\u5F53\u524D\u670D\u52A1\u7AEF \xB7 \u65E0\u9700\u6A21\u578B\u670D\u52A1"))),D&&r&&a.createElement("div",{className:"df-dialog-backdrop"},a.createElement("section",{className:"df-dialog df-paper",role:"dialog","aria-modal":"true","aria-label":"\u6838\u5BF9\u5171\u7528\u8D44\u6599"},a.createElement("div",{className:"df-section-head"},a.createElement("h2",null,D==="adopt"?"\u91C7\u7528\u9879\u76EE\u5E95\u7A3F\u4E2D\u7684\u8D44\u6599":"\u5C06\u672C\u8868\u8D44\u6599\u5B58\u5165\u9879\u76EE\u5E95\u7A3F"),a.createElement("button",{disabled:!!P,onClick:()=>O(null),"aria-label":"\u5173\u95ED\u5171\u7528\u8D44\u6599\u6838\u5BF9"},"\xD7")),a.createElement("p",{className:"df-muted"},"\u53EA\u66F4\u65B0\u52FE\u9009\u9879\u3002\u539F\u751F\u6210\u6587\u4EF6\u4FDD\u7559\uFF0C\u540E\u7EED\u751F\u6210\u524D\u9700\u91CD\u65B0\u6838\u5BF9\u3002"),y&&a.createElement("p",{role:"alert",className:"df-alert error"},y),a.createElement("div",{className:"df-compare"},d.fields.filter(t=>r.fields.some(n=>n.key===t.key&&n.value!==t.value)).map(t=>{let n=r.fields.find(l=>l.key===t.key);return a.createElement("label",{key:t.key},a.createElement("input",{type:"checkbox",checked:I.includes(t.key),onChange:l=>w(l.target.checked?[...I,t.key]:I.filter(L=>L!==t.key))}),a.createElement("div",null,a.createElement("b",null,t.label),a.createElement("div",{className:"df-compare-values"},a.createElement("p",null,a.createElement("small",null,"\u5F53\u524D\u8868\u5355"),n.value||"\u7A7A\u767D"),a.createElement("p",null,a.createElement("small",null,"\u9879\u76EE\u5E95\u7A3F"),t.value||"\u7A7A\u767D"))))}),!d.fields.some(t=>r.fields.some(n=>n.key===t.key&&n.value!==t.value))&&a.createElement("p",null,"\u672C\u8868\u4E0E\u9879\u76EE\u5E95\u7A3F\u4E2D\u7684\u5171\u7528\u8D44\u6599\u4E00\u81F4\u3002")),a.createElement("div",{className:"df-actions"},a.createElement("button",{disabled:!!P,onClick:()=>O(null)},"\u53D6\u6D88"),a.createElement("button",{className:"df-primary",disabled:!!P||!I.length,onClick:()=>W("\u540C\u6B65\u5171\u7528\u8D44\u6599",async()=>{let t=await G();if(D==="adopt")Z(await V(`/projects/${d.id}/cases/${t.id}/sync`,fe({revision:d.revision,case_revision:t.revision,keys:I})));else{let n=Object.fromEntries(t.fields.filter(l=>I.includes(l.key)).map(l=>[l.key,l.value]));await V(`/projects/${d.id}`,{...fe({revision:d.revision,name:n["project.name"]??d.name,code:n["project.code"]??d.code,owner:d.owner,values:n}),method:"PUT"})}await ae(),O(null),s("\u6240\u9009\u8D44\u6599\u5DF2\u540C\u6B65\uFF0C\u8BF7\u91CD\u65B0\u6838\u5BF9\u540E\u751F\u6210\u65B0\u7248\u6587\u4E66\u3002")})},D==="adopt"?"\u91C7\u7528\u6240\u9009\u9879\u76EE\u8D44\u6599":"\u4FDD\u5B58\u6240\u9009\u8D44\u6599\u5230\u5E95\u7A3F")))))}function et(){let d=R.host.useSelectedAgent?.();return a.createElement(Te,{key:d?.id||R.host.getSelectedAgentId?.()||"default",Editor:Re,services:{request:V,json:fe,download:$e,time:ke,Field:Me}})}R.registerRoutes("document-forms",[{path:"/apps/document-forms",component:et,label:"\u6587\u4E66\u586B\u62A5",icon:"\u25A4"}]);})();
