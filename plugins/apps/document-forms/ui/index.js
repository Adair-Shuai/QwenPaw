(()=>{var Ne=`.df-app {
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
`;var b=window.QwenPaw.host.React,{useEffect:Le,useState:Y}=b;function De({artifact:d,children:g}){let[m,c]=Y("print"),[l,y]=Y([]),[p,k]=Y(0),[r,o]=Y(""),[x,E]=Y(0),[A,L]=Y(100);return Le(()=>{if(m!=="print")return;let v=new AbortController,h=[];return y([]),k(0),o(""),window.QwenPaw.host.fetch(d.printUrl+"?pages=true",{headers:d.agentId?{"X-Agent-Id":d.agentId}:{},signal:v.signal}).then(async j=>{if(!j.ok){let O=await j.json().catch(()=>({}));throw new Error(typeof O.detail=="string"?O.detail:"\u6253\u5370\u9884\u89C8\u6682\u4E0D\u53EF\u7528\uFF0C\u53EF\u5207\u6362\u6587\u5B57\u9884\u89C8\u6216\u4E0B\u8F7D Word \u67E5\u770B")}let{pages:N}=await j.json();if(!v.signal.aborted){if(!Number.isInteger(N)||N<1||N>40)throw new Error("\u672A\u83B7\u5F97\u6709\u6548\u7684 Word \u9875\u6570");k(N);for(let O=1;O<=N;O++){let D=await window.QwenPaw.host.fetch(d.printUrl+"?page="+O,{headers:d.agentId?{"X-Agent-Id":d.agentId}:{},signal:v.signal});if(!D.ok)throw new Error(`\u7B2C ${O} \u9875\u672A\u80FD\u6E32\u67D3\uFF0C\u8BF7\u91CD\u65B0\u9884\u89C8`);let $=await D.blob();if(v.signal.aborted)return;let Z=URL.createObjectURL($);h.push(Z),y(w=>[...w,Z])}}}).catch(j=>{v.signal.aborted||o(j.message||"\u6253\u5370\u9884\u89C8\u672A\u5B8C\u6210")}),()=>{v.abort(),h.forEach(j=>URL.revokeObjectURL(j))}},[d.id,d.printUrl,d.agentId,m,x]),b.createElement("div",{className:"df-print-preview"},b.createElement("div",{className:"df-print-toolbar"},b.createElement("div",null,b.createElement("button",{"aria-pressed":m==="print",onClick:()=>c("print")},"\u6253\u5370\u7248\u5F0F"),b.createElement("button",{"aria-pressed":m==="text",onClick:()=>c("text")},"\u6587\u5B57\u9884\u89C8")),m==="print"&&b.createElement("div",null,p>0&&b.createElement("span",null,"\u5171 ",p," \u9875"),b.createElement("select",{"aria-label":"\u9884\u89C8\u6BD4\u4F8B",value:A,onChange:v=>L(Number(v.target.value))},b.createElement("option",{value:100},"\u9002\u5408\u5BBD\u5EA6"),b.createElement("option",{value:125},"125%"),b.createElement("option",{value:150},"150%"),b.createElement("option",{value:200},"200%")))),m==="text"?b.createElement("div",{className:"df-text-preview"},g):r?b.createElement("div",{className:"df-preview-message",role:"alert"},b.createElement("p",null,r),b.createElement("button",{onClick:()=>E(v=>v+1)},"\u91CD\u65B0\u9884\u89C8")):l.length?b.createElement("div",{className:"df-print-scroll"},b.createElement("div",{className:"df-print-pages",style:{width:A+"%"}},l.map((v,h)=>b.createElement("figure",{key:h},b.createElement("figcaption",null,"\u7B2C ",h+1," \u9875"),b.createElement("img",{src:v,alt:d.title+` \xB7 \u6253\u5370\u7248\u5F0F \xB7 \u7B2C ${h+1} \u9875`}))),l.length<p&&b.createElement("p",{role:"status"},"\u6B63\u5728\u6392\u7248\u7B2C ",l.length+1," \u9875\u2026"))):b.createElement("div",{className:"df-preview-message",role:"status"},"\u6B63\u5728\u6392\u7248\u6253\u5370\u9875\u9762\u2026"))}function se({artifact:d}){let[g,m]=Y(null),[c,l]=Y(""),[y,p]=Y(0);if(Le(()=>{let r=new AbortController;return m(null),l(""),window.QwenPaw.host.fetch("/workspace/convert-office",{method:"POST",headers:{"Content-Type":"application/json",...d.agentId?{"X-Agent-Id":d.agentId}:{}},signal:r.signal,body:JSON.stringify({url:d.binaryUrl,mime_type:d.mimeType})}).then(async o=>{let x=await o.json();if(!o.ok)throw new Error(typeof x.detail=="string"?x.detail:"\u6587\u4EF6\u9884\u89C8\u672A\u5B8C\u6210");r.signal.aborted||m(x)}).catch(o=>{r.signal.aborted||l(o.message||"\u6587\u4EF6\u9884\u89C8\u672A\u5B8C\u6210")}),()=>r.abort()},[d.id,d.binaryUrl,d.mimeType,d.agentId,y]),c)return b.createElement("div",{className:"df-preview-message",role:"alert"},b.createElement("p",null,c),b.createElement("button",{onClick:()=>p(r=>r+1)},"\u91CD\u65B0\u9884\u89C8"),b.createElement("p",null,"\u4E5F\u53EF\u4EE5\u4ECE\u6587\u4EF6\u6E05\u5355\u4E0B\u8F7D\u540E\u67E5\u770B\u3002"));if(!g)return b.createElement("div",{className:"df-preview-message",role:"status"},"\u6B63\u5728\u6253\u5F00\u6587\u4EF6\u2026");let k=g.engine==="officecli"?g.html:`<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;color:#333;background:#fff;padding:24px 32px;line-height:1.7;max-width:900px;margin:0 auto}table{border-collapse:collapse;width:100%;margin:12px 0}td,th{border:1px solid #ddd;padding:8px 12px}img{max-width:100%;height:auto}h1{font-size:1.6em}h2{font-size:1.3em}.docx-page-break{border-top:2px dashed #ccc;margin:32px 0}</style></head><body>${g.html||""}</body></html>`;return b.createElement("iframe",{className:"df-office-frame",title:d.title,srcDoc:k,sandbox:g.engine==="officecli"?"allow-scripts":"allow-same-origin"})}var de=window.QwenPaw,e=de.host.React,{useState:P,useEffect:ce,useRef:le}=e,Pe={pending:"\u672A\u5F00\u59CB",in_progress:"\u8FDB\u884C\u4E2D",submitted:"\u5DF2\u63D0\u4EA4",completed:"\u5DF2\u5B8C\u6210"},Te={pending:"\u5F85\u51C6\u5907",preparing:"\u6574\u7406\u4E2D",ready:"\u5F85\u63D0\u4EA4",submitted:"\u5DF2\u63D0\u4EA4",done:"\u5DF2\u5B8C\u6210",na:"\u4E0D\u9002\u7528"},qe=["\u4E0A\u62A5\u8BA1\u5212","\u9009\u5546\u8BBA\u8BC1","\u5546\u52A1\u8C08\u5224","\u5F00\u9898\u8BBA\u8BC1","\u7ED3\u9898\u9A8C\u6536","\u5F52\u6863\u4ED8\u6B3E"],Ue=d=>d?new Date(d).toLocaleString("zh-CN",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}):"";function Ce({title:d,children:g,onClose:m,error:c,busy:l=!1}){let y=le(null);return ce(()=>{let p=document.activeElement;return y.current?.querySelector("input,select,textarea,button")?.focus(),()=>{p?.isConnected&&p.focus()}},[]),e.createElement("div",{className:"df-dialog-backdrop"},e.createElement("section",{ref:y,className:"df-dialog df-paper",role:"dialog","aria-modal":"true","aria-label":d,onKeyDown:p=>{if(p.key==="Escape"&&!l&&(p.stopPropagation(),m()),p.key==="Tab"){let k=[...y.current.querySelectorAll("button,input,textarea,select,a[href]")].filter(r=>!r.disabled);p.shiftKey&&document.activeElement===k[0]&&(p.preventDefault(),k.at(-1)?.focus()),!p.shiftKey&&document.activeElement===k.at(-1)&&(p.preventDefault(),k[0]?.focus())}}},e.createElement("div",{className:"df-section-head"},e.createElement("h2",null,d),e.createElement("button",{type:"button",disabled:l,onClick:m,"aria-label":"\u5173\u95ED"+d},"\xD7")),c&&e.createElement("p",{role:"alert",className:"df-alert error"},c),g))}function Be({file:d,projectId:g,download:m,onClose:c}){let[l,y]=P(null),[p,k]=P(""),[r,o]=P(""),x=d.name.split(".").pop().toLowerCase(),E=["pdf","png","jpg","jpeg"].includes(x)&&!de.workspace?.loadPreview;ce(()=>{let L=!0,v;return E?de.host.fetch(`/document-forms/projects/${g}/files/${d.id}`).then(async h=>{if(!h.ok)throw new Error("\u9884\u89C8\u672A\u80FD\u6253\u5F00\uFF0C\u8BF7\u4E0B\u8F7D\u67E5\u770B");let j=await h.blob();L&&(v=URL.createObjectURL(new Blob([j],{type:d.mime})),k(v))}).catch(h=>L&&o(h.message)):de.workspace?.loadPreview||["doc","docx","xls","xlsx","ppt","pptx"].includes(x)?(de.workspace?.loadPreview?de.workspace.loadPreview():Promise.resolve(se)).then(h=>L&&y(()=>h)).catch(()=>L&&y(()=>se)):o("\u6B64\u683C\u5F0F\u8BF7\u4E0B\u8F7D\u540E\u67E5\u770B\u3002"),()=>{L=!1,v&&URL.revokeObjectURL(v)}},[d.id]);let A={id:d.id,title:d.name,source:"uploaded",extension:x,mimeType:d.mime,binaryUrl:d.preview_url,agentId:de.host.getSelectedAgentId?.(),createdAt:Date.parse(d.uploaded_at)};return e.createElement(Ce,{title:d.name,onClose:c},e.createElement("div",{className:"df-attachment-preview"},r?e.createElement("p",{role:"alert"},r):E&&p?x==="pdf"?e.createElement("iframe",{title:d.name,src:p,sandbox:"allow-same-origin"}):e.createElement("img",{src:p,alt:d.name}):l?e.createElement(l,{artifact:A,readOnly:!0,hostControls:!0}):e.createElement("p",{role:"status"},"\u6B63\u5728\u6253\u5F00\u9884\u89C8\u2026")),e.createElement("div",{className:"df-actions"},e.createElement("button",{onClick:()=>m(`/projects/${g}/files/${d.id}`,d.name)},"\u4E0B\u8F7D\u539F\u6587\u4EF6"),e.createElement("button",{onClick:c},"\u5173\u95ED\u9884\u89C8")))}function $e({Editor:d,services:g}){let{request:m,json:c,download:l,Field:y}=g,[p,k]=P([]),[r,o]=P(null),[x,E]=P("overview"),[A,L]=P(""),[v,h]=P(null),[j,N]=P(!1),[O,D]=P(!1),[$,Z]=P(""),[w,z]=P(""),[R,B]=P(""),[re,ee]=P(""),[W,C]=P(null),[f,S]=P({}),[pe,ue]=P(null),I=le(!0),X=le(0),q=le(null),we=le(null),J=le(""),T=le(null);ce(()=>{T.current?.scrollTo?.({top:0})},[r?.id,x,v?.id]);let V=de.host.useTheme?.()||"light",u=r?.stages.find(i=>i.id===x),fe=r?.forms.filter(i=>i.stage_id===x)||[],F=()=>!j&&!O||window.confirm("\u8D44\u6599\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\uFF0C\u662F\u5426\u653E\u5F03\u8FD9\u4E9B\u4FEE\u6539\u5E76\u79BB\u5F00\uFF1F");async function te(){let i=await m("/projects");return I.current&&k(i),i}async function M(i=r?.id){let t=i?await m("/projects/"+i):null;return I.current&&t&&o(t),await te(),t}ce(()=>(I.current=!0,z("\u8F7D\u5165\u9879\u76EE"),te().then(async i=>{if(i.length&&I.current){let t=await m("/projects/"+i[0].id);I.current&&o(t)}}).catch(i=>I.current&&B(i.message)).finally(()=>I.current&&z("")),()=>{I.current=!1,X.current++}),[]),ce(()=>{let i=t=>{(j||O)&&(t.preventDefault(),t.returnValue="")};return window.addEventListener("beforeunload",i),()=>window.removeEventListener("beforeunload",i)},[j,O]);async function U(i,t){if(w)return;let n=++X.current;z(i),B(""),ee("");try{await t()}catch(s){I.current&&n===X.current&&B(s.message)}finally{I.current&&n===X.current&&z("")}}async function ae(i){F()&&await U("\u6253\u5F00\u9879\u76EE",async()=>{await M(i),h(null),N(!1),D(!1),E("overview")})}function H(i){F()&&(E(i),h(null),N(!1),D(!1),ee(""),B(""))}function ie(i,t){S(t),C(i),B("")}async function me(i,t,n="POST"){let s=await m(i,{...c({...t,revision:r.revision}),method:n});return I.current&&(o(s),C(null)),await te(),s}function ge(i){return U(i?"\u8BFB\u53D6\u9636\u6BB5 Excel":"\u51C6\u5907\u8C08\u5224\u8868\u5355",async()=>{let t;if(i){let n=new FormData;n.append("revision",r.revision),n.append("stage_id",x),n.append("workbook",i),t=await m(`/projects/${r.id}/cases/import`,{method:"POST",body:n})}else t=await m(`/projects/${r.id}/cases`,c({revision:r.revision,stage_id:x}));await M(),h({id:t.id,view:"edit"}),N(!1),i&&ee(t.templates.length?"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\uFF0C\u5E76\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002":"\u5DF2\u8BFB\u53D6\u672C\u9636\u6BB5\u53D8\u91CF\u914D\u7F6E\uFF0C\u8BF7\u6DFB\u52A0\u5BF9\u5E94\u7684 Word \u6A21\u677F\u3002")})}function _e(i){if(!i)return;let t=J.current;return U("\u4FDD\u5B58\u6750\u6599",async()=>{let n=new FormData;n.append("revision",r.revision),n.append("file",i);let s=await m(`/projects/${r.id}/stages/${x}/materials/${t}/files`,{method:"POST",body:n});o(s),await te(),ee("\u6750\u6599\u5DF2\u4FDD\u5B58\uFF0C\u539F\u6709\u7248\u672C\u7EE7\u7EED\u4FDD\u7559\u3002\u8BF7\u6838\u5BF9\u540E\u66F4\u65B0\u6750\u6599\u72B6\u6001\u3002")})}let ne=r?`/projects/${r.id}`:"",ye=i=>{i.preventDefault(),U("\u4FDD\u5B58\u6750\u6599\u4FE1\u606F",()=>me(`${ne}/stages/${x}/materials${f.id?"/"+f.id:""}`,f,f.id?"PUT":"POST"))},ke=i=>U("\u6574\u7406\u4E0B\u8F7D\u5305",()=>l(ne+"/bundle"+(i?"?stage_id="+i:""),`${r.name}_${i?u.title:"\u5168\u6D41\u7A0B\u6750\u6599"}.zip`));return e.createElement("main",{className:"df-app df-project-app","data-theme":V},e.createElement("style",null,Ne),e.createElement("input",{ref:q,type:"file",accept:".xlsx",hidden:!0,"aria-label":"\u5BFC\u5165\u9636\u6BB5 Excel",onChange:i=>{let t=i.target.files[0];i.target.value="",t&&ge(t)}}),e.createElement("input",{ref:we,type:"file",accept:".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.png,.jpg,.jpeg,.zip,.txt,.csv",hidden:!0,"aria-label":"\u4E0A\u4F20\u9636\u6BB5\u6750\u6599",onChange:i=>{let t=i.target.files[0];i.target.value="",_e(t)}}),e.createElement("aside",{className:"df-sidebar df-project-sidebar"},e.createElement("div",{className:"df-brand"},"UGSci ",e.createElement("span",null,"\u9879\u76EE\u6750\u6599")),e.createElement("button",{className:"df-primary df-new",disabled:!!w||!!$,onClick:()=>{F()&&ie("create",{name:"",code:"",owner:""})}},"\uFF0B \u65B0\u5EFA\u9879\u76EE"),e.createElement("label",{className:"df-project-search"},e.createElement("span",{className:"df-sr-only"},"\u641C\u7D22\u9879\u76EE"),e.createElement("input",{"aria-label":"\u641C\u7D22\u9879\u76EE",placeholder:"\u641C\u7D22\u9879\u76EE\u540D\u79F0\u6216\u7F16\u53F7",value:A,onChange:i=>L(i.target.value)})),e.createElement("div",{className:"df-caption"},"\u6211\u7684\u9879\u76EE ",e.createElement("span",null,p.length)),e.createElement("nav",{"aria-label":"\u9879\u76EE\u5217\u8868"},p.filter(i=>(i.name+" "+i.code).toLowerCase().includes(A.toLowerCase())).map(i=>e.createElement("button",{key:i.id,disabled:!!w||!!$,"aria-current":r?.id===i.id?"page":void 0,onClick:()=>ae(i.id)},e.createElement("b",null,i.name),e.createElement("small",null,i.code||"\u672A\u8BBE\u7F16\u53F7"," \xB7 ",i.completed,"/6 \u9636\u6BB5\u5B8C\u6210")))),e.createElement("div",{className:"df-sidebar-foot"},e.createElement("b",null,"\u914D\u5957\u6A21\u677F"),e.createElement("p",null,"\u5546\u52A1\u8C08\u5224\u9636\u6BB5\u5DF2\u914D\u597D\u4E94\u4EFD Word \u6A21\u677F\uFF0C\u5176\u4F59\u9636\u6BB5\u53EF\u63A5\u5165\u5404\u81EA\u7684\u7EDF\u4E00\u6A21\u677F\u3002"),e.createElement("button",{disabled:!!w||!!$,onClick:()=>U("\u4E0B\u8F7D\u914D\u5957\u6A21\u677F",()=>l("/starter","\u6587\u4E66\u586B\u62A5_\u914D\u5957\u6A21\u677F.zip"))},"\u4E0B\u8F7D\u914D\u5957\u6A21\u677F \u2197"),e.createElement("small",null,"\u7A7A\u767D Excel \u4E0E 5 \u4EFD\u6807\u51C6 Word"))),e.createElement("section",{className:"df-main df-project-main",ref:T},e.createElement("header",{className:"df-header"},e.createElement("div",null,e.createElement("span",{className:"df-eyebrow"},"UGSCI / \u9879\u76EE\u6750\u6599"),e.createElement("h1",null,r?.name||"\u9879\u76EE\u5DE5\u4F5C\u53F0"),e.createElement("p",null,r?[r.code||"\u672A\u8BBE\u9879\u76EE\u7F16\u53F7",r.owner&&"\u7ECF\u529E\u4EBA\uFF1A"+r.owner].filter(Boolean).join("\u3000\xB7\u3000"):"\u4ECE\u4E0A\u62A5\u8BA1\u5212\u5230\u5F52\u6863\u4ED8\u6B3E\uFF0C\u628A\u540C\u4E00\u9879\u76EE\u7684\u8D44\u6599\u653E\u5728\u4E00\u8D77\u3002")),r&&e.createElement("div",{className:"df-actions"},e.createElement("button",{disabled:!!w||!!$||!!v,onClick:()=>H("profile")},"\u9879\u76EE\u8D44\u6599"),e.createElement("button",{disabled:!!w||!!$,onClick:()=>ke()},"\u4E0B\u8F7D\u9879\u76EE\u6750\u6599"))),R&&e.createElement("div",{role:"alert",className:"df-alert error"},R,e.createElement("button",{"aria-label":"\u5173\u95ED\u9519\u8BEF\u63D0\u793A",onClick:()=>B("")},"\xD7")),re&&e.createElement("div",{className:"df-alert",role:"status"},re),w&&e.createElement("div",{className:"df-progress",role:"status"},w,"\u2026"),r?e.createElement(e.Fragment,null,e.createElement("nav",{className:"df-project-tabs","aria-label":"\u9879\u76EE\u9636\u6BB5"},e.createElement("button",{className:x==="overview"?"active":"",disabled:!!w||!!$,onClick:()=>H("overview")},"\u9879\u76EE\u603B\u89C8"),r.stages.map((i,t)=>e.createElement("button",{key:i.id,"aria-current":x===i.id?"step":void 0,className:x===i.id?"active":"",disabled:!!w||!!$,onClick:()=>H(i.id)},e.createElement("small",null,String(t+1).padStart(2,"0")),i.title,e.createElement("span",{className:"df-state df-state-"+i.status},i.upstream_changed.length||i.documents_changed?"\u5F85\u590D\u6838":Pe[i.status])))),v?e.createElement(d,{key:r.id+":"+v.id,project:r,workflowStage:u,initialCaseId:v.id,initialView:v.view,onDirtyChange:N,onBusyChange:Z,onViewChange:()=>T.current?.scrollTo?.({top:0}),onBack:()=>{h(null),N(!1),M().catch(i=>B(i.message))},onChanged:()=>M()}):e.createElement("fieldset",{className:"df-content",disabled:!!w||!!$},x==="overview"&&e.createElement(e.Fragment,null,r.migrated&&e.createElement("p",{className:"df-muted df-migration-note"},"\u5386\u53F2\u586B\u62A5\u5DF2\u6309\u9879\u76EE\u540D\u79F0\u6216\u7F16\u53F7\u5F52\u5165\u5546\u52A1\u8C08\u5224\u9636\u6BB5\uFF0C\u539F\u8868\u5355\u3001\u751F\u6210\u6279\u6B21\u548C\u6587\u4EF6\u5747\u4FDD\u7559\u3002"),e.createElement("section",{className:"df-project-metrics"},e.createElement("div",null,e.createElement("b",null,r.stages.filter(i=>i.status==="completed").length,e.createElement("small",null,"/ 6")),e.createElement("span",null,"\u5DF2\u5B8C\u6210\u9636\u6BB5")),e.createElement("div",null,e.createElement("b",null,r.stages.reduce((i,t)=>i+t.materials.filter(n=>!["done","na"].includes(n.status)).length,0)),e.createElement("span",null,"\u5F85\u6574\u7406\u6750\u6599")),e.createElement("div",null,e.createElement("b",null,r.forms.reduce((i,t)=>i+t.outputs,0)),e.createElement("span",null,"\u5DF2\u751F\u6210\u6587\u4EF6")),e.createElement("div",null,e.createElement("b",null,r.stages.filter(i=>i.upstream_changed.length||i.documents_changed).length),e.createElement("span",null,"\u5F85\u590D\u6838\u9636\u6BB5"))),e.createElement("div",{className:"df-project-stage-grid"},r.stages.map((i,t)=>e.createElement("button",{className:"df-paper df-stage-card",key:i.id,onClick:()=>H(i.id)},e.createElement("div",{className:"df-section-head"},e.createElement("small",null,"\u9636\u6BB5 ",String(t+1).padStart(2,"0")),e.createElement("span",{className:"df-state df-state-"+i.status},Pe[i.status])),e.createElement("h2",null,i.title),e.createElement("p",null,i.purpose),e.createElement("footer",null,e.createElement("span",null,i.materials.filter(n=>["done","na"].includes(n.status)).length,"/",i.materials.length," \u9879\u6750\u6599\u5DF2\u5904\u7406"),e.createElement("span",null,i.upstream_changed.length||i.documents_changed?"\u6709\u53D8\u66F4\u5F85\u590D\u6838":i.due_date?"\u8BA1\u5212 "+i.due_date:"\u8FDB\u5165\u9636\u6BB5 \u2192"))))),e.createElement("section",{className:"df-paper df-project-hint"},e.createElement("h2",null,"\u4E00\u4EFD\u9879\u76EE\u5E95\u7A3F\uFF0C\u8D2F\u7A7F\u5404\u9636\u6BB5"),e.createElement("p",null,"\u9879\u76EE\u540D\u79F0\u3001\u7814\u7A76\u5185\u5BB9\u3001\u6210\u679C\u6307\u6807\u548C\u9884\u7B97\u7B49\u53EF\u5728\u201C\u9879\u76EE\u8D44\u6599\u201D\u7EDF\u4E00\u7EF4\u62A4\u3002\u9636\u6BB5\u8868\u5355\u4ECE\u5E95\u7A3F\u53D6\u503C\uFF0C\u540E\u7EED\u53D8\u66F4\u4F1A\u63D0\u9192\u6838\u5BF9\uFF1B\u5DF2\u6709\u751F\u6210\u6587\u4EF6\u4FDD\u7559\u539F\u6837\u3002"),e.createElement("button",{onClick:()=>H("profile")},"\u6574\u7406\u9879\u76EE\u8D44\u6599"))),x==="profile"&&e.createElement(Fe,{onDirtyChange:D,key:r.id+":"+r.revision,project:r,Field:y,onSave:i=>U("\u4FDD\u5B58\u9879\u76EE\u8D44\u6599",async()=>{await me(ne,i,"PUT"),ee("\u9879\u76EE\u8D44\u6599\u5DF2\u66F4\u65B0\u3002\u5DF2\u6709\u8868\u5355\u53EF\u9010\u9879\u6838\u5BF9\u540E\u540C\u6B65\uFF0C\u539F\u751F\u6210\u6587\u4EF6\u4E0D\u53D8\u3002")})}),u&&e.createElement(e.Fragment,null,e.createElement("section",{className:"df-paper df-stage-header"},e.createElement("div",null,e.createElement("div",{className:"df-eyebrow"},"\u9636\u6BB5\u6750\u6599"),e.createElement("h2",null,u.title),e.createElement("p",null,u.purpose),e.createElement("p",{className:"df-muted"},u.id==="negotiation"?"\u4E94\u4EFD\u6807\u51C6\u6A21\u677F\u5DF2\u63A5\u5165\uFF0C\u53EF\u76F4\u63A5\u586B\u5199\uFF0C\u4E5F\u53EF\u5BFC\u5165\u73B0\u6709 Excel\u3002":"\u7EDF\u4E00\u6A21\u677F\u5F85\u8865\u5145\uFF1B\u73B0\u9636\u6BB5\u53EF\u6574\u7406\u6750\u6599\u3001\u4E0A\u4F20\u6587\u4EF6\uFF0C\u6216\u5BFC\u5165\u5DF2\u6709 Excel \u4E0E Word \u6A21\u677F\u3002")),e.createElement("div",{className:"df-actions"},e.createElement("button",{onClick:()=>ke(u.id)},"\u4E0B\u8F7D\u672C\u9636\u6BB5\u6750\u6599"),e.createElement("button",{onClick:()=>ie("stage",{...u,confirmed:!1})},"\u529E\u7406\u4FE1\u606F\u4E0E\u72B6\u6001"))),(u.upstream_changed.length>0||u.documents_changed)&&e.createElement("div",{className:"df-alert df-stage-warning"},e.createElement("div",null,e.createElement("b",null,"\u672C\u9636\u6BB5\u6709\u8D44\u6599\u9700\u8981\u590D\u6838"),e.createElement("p",null,u.upstream_changed.length>0&&"\u524D\u5E8F\u9636\u6BB5\u5DF2\u66F4\u65B0\uFF1A"+u.upstream_changed.join("\u3001")+"\u3002",u.documents_changed&&"\u672C\u9636\u6BB5\u8868\u5355\u6216\u751F\u6210\u6587\u4EF6\u6709\u66F4\u65B0\u3002","\u8BF7\u6838\u5BF9\u5DF2\u63D0\u4EA4\u7684\u6750\u6599\u662F\u5426\u9700\u8981\u8C03\u6574\u3002")),e.createElement("button",{onClick:()=>U("\u8BB0\u5F55\u590D\u6838",()=>me(`${ne}/stages/${u.id}/acknowledge`,{}))},"\u5DF2\u6838\u5BF9\u53D8\u66F4")),(u.system_name||u.due_date||u.submission_ref||u.notes)&&e.createElement("section",{className:"df-paper df-stage-details"},e.createElement("dl",null,e.createElement("div",null,e.createElement("dt",null,"\u8BA1\u5212\u65E5\u671F"),e.createElement("dd",null,u.due_date||"\u672A\u8BBE\u7F6E")),e.createElement("div",null,e.createElement("dt",null,"\u529E\u7406\u7CFB\u7EDF"),e.createElement("dd",null,u.system_url?e.createElement("a",{href:u.system_url,target:"_blank",rel:"noopener noreferrer"},u.system_name||"\u6253\u5F00\u529E\u7406\u7CFB\u7EDF"," \u2197"):u.system_name||"\u672A\u8BB0\u5F55")),e.createElement("div",null,e.createElement("dt",null,"\u63D0\u4EA4\u7F16\u53F7 / \u56DE\u6267"),e.createElement("dd",null,u.submission_ref||"\u672A\u8BB0\u5F55"))),u.notes&&e.createElement("p",null,u.notes)),e.createElement("section",{className:"df-paper df-stage-forms"},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,"\u586B\u5199\u4E0E\u751F\u6210"),e.createElement("p",{className:"df-muted"},"\u8868\u5355\u6CBF\u7528\u9879\u76EE\u5E95\u7A3F\uFF0C\u6838\u5BF9\u540E\u751F\u6210\u3002\u5DF2\u6709\u6279\u6B21\u4FDD\u7559\u751F\u6210\u65F6\u7684\u5185\u5BB9\u3002")),e.createElement("div",{className:"df-actions"},u.id==="negotiation"&&e.createElement("button",{className:"df-primary",onClick:()=>ge()},"\u586B\u5199\u8C08\u5224\u6750\u6599"),e.createElement("button",{onClick:()=>q.current.click()},"\u5BFC\u5165 Excel \u8868\u5355"))),fe.length?e.createElement("div",{className:"df-project-forms"},fe.map(i=>e.createElement("div",{key:i.case_id},e.createElement("div",null,e.createElement("b",null,i.name),e.createElement("small",null,Ue(i.updated_at)," \xB7"," ",i.outputs?i.outputs+" \u4EFD\u6587\u4EF6":"\u586B\u5199\u4E2D",i.shared_changes.length>0&&" \xB7 \u9879\u76EE\u8D44\u6599\u6709\u66F4\u65B0")),e.createElement("div",{className:"df-actions"},e.createElement("button",{onClick:()=>h({id:i.case_id,view:"edit"})},"\u6253\u5F00\u8868\u5355"),i.outputs>0&&e.createElement("button",{onClick:()=>h({id:i.case_id,view:"files"})},"\u67E5\u770B\u751F\u6210\u6587\u4EF6"))))):e.createElement("p",{className:"df-empty"},"\u672C\u9636\u6BB5\u8FD8\u6CA1\u6709\u8868\u5355\u3002\u5DF2\u6709\u6210\u54C1\u6587\u4EF6\u53EF\u76F4\u63A5\u4E0A\u4F20\u5230\u4E0B\u9762\u7684\u6750\u6599\u6E05\u5355\u3002")),e.createElement("section",{className:"df-paper df-material-panel"},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,"\u6750\u6599\u6E05\u5355 ",e.createElement("small",null,u.materials.length)),e.createElement("p",{className:"df-muted"},"\u5148\u6309\u5E38\u7528\u6750\u6599\u5217\u51FA\uFF0C\u53EF\u4FEE\u6539\u540D\u79F0\u3001\u589E\u8865\u6750\u6599\u6216\u6807\u4E3A\u4E0D\u9002\u7528\u3002\u201C\u5DF2\u63D0\u4EA4\u201D\u7531\u7ECF\u529E\u4EBA\u6838\u5B9E\u540E\u8BB0\u5F55\u3002")),e.createElement("button",{onClick:()=>ie("material",{name:"",status:"pending",required:!1,note:""})},"\uFF0B \u6DFB\u52A0\u6750\u6599")),e.createElement("div",{className:"df-materials"},u.materials.map(i=>{let t=fe.reduce((n,s)=>n+(s.generations[0]?.files.filter(_=>_.name.includes(i.name)).length||0),0);return e.createElement("article",{className:"df-material-row",key:i.id},e.createElement("div",{className:"df-material-name"},e.createElement("b",null,i.name),i.required&&e.createElement("span",{className:"df-required-tag"},"\u5FC5\u5907"),e.createElement("span",{className:"df-state df-material-state-"+i.status},Te[i.status]),t>0&&e.createElement("small",null,"\u5DF2\u6709 ",t," \u4EFD\u751F\u6210\u7A3F \xB7 \u5728\u4E0A\u65B9\u8868\u5355\u67E5\u770B"),i.note&&e.createElement("p",null,i.note)),e.createElement("div",{className:"df-material-files"},i.files.length>0?e.createElement("details",null,e.createElement("summary",null,i.files.length," \u4EFD\u6587\u4EF6 / \u7248\u672C \xB7 \u6700\u65B0\uFF1A",i.files[i.files.length-1].name),[...i.files].reverse().map((n,s)=>e.createElement("div",{className:"df-material-file",key:n.id},e.createElement("div",null,e.createElement("b",null,"V",i.files.length-s," \xB7"," ",n.name),e.createElement("small",null,Ue(n.uploaded_at)," \xB7"," ",Math.max(1,Math.round(n.size/1024))," ","KB")),e.createElement("button",{onClick:()=>ue(n)},"\u9884\u89C8"),e.createElement("button",{"aria-label":"\u4E0B\u8F7D"+n.name+"\u7248\u672C"+(i.files.length-s),onClick:()=>U("\u4E0B\u8F7D\u6750\u6599",()=>l(`${ne}/files/${n.id}`,n.name))},"\u4E0B\u8F7D")))):e.createElement("span",{className:"df-muted"},"\u5C1A\u672A\u4E0A\u4F20\u6587\u4EF6")),e.createElement("div",{className:"df-actions"},e.createElement("button",{"aria-label":"\u4E0A\u4F20"+i.name,onClick:()=>{J.current=i.id,we.current.click()}},"\u4E0A\u4F20\u6587\u4EF6"),e.createElement("button",{"aria-label":"\u7F16\u8F91"+i.name,onClick:()=>ie("material",{...i})},"\u7F16\u8F91")))}))),e.createElement("div",{className:"df-stage-tail"},e.createElement("p",null,"\u5404\u9636\u6BB5\u53EF\u5E76\u884C\u51C6\u5907\uFF1B\u524D\u5E8F\u8D44\u6599\u53D8\u5316\u540E\uFF0C\u540E\u7EED\u9636\u6BB5\u4F1A\u63D0\u793A\u590D\u6838\u3002\u9636\u6BB5\u5B8C\u6210\u7531\u7ECF\u529E\u4EBA\u786E\u8BA4\u3002"),e.createElement("button",{onClick:()=>ie("stage",{...u,confirmed:!1})},"\u66F4\u65B0\u529E\u7406\u72B6\u6001"))))):e.createElement("section",{className:"df-paper df-project-welcome"},e.createElement("h2",null,"\u5148\u5EFA\u4E00\u4E2A\u9879\u76EE"),e.createElement("p",null,"\u5171\u7528\u8D44\u6599\u53EA\u6574\u7406\u4E00\u6B21\uFF0C\u8868\u5355\u4E0E\u9644\u4EF6\u6309\u9636\u6BB5\u5F52\u96C6\uFF0C\u751F\u6210\u7A3F\u4E0E\u5B9A\u7A3F\u5206\u522B\u7559\u75D5\u3002"),e.createElement("div",{className:"df-welcome-stages"},qe.map((i,t)=>e.createElement("span",{key:i},e.createElement("small",null,String(t+1).padStart(2,"0")),i))),e.createElement("button",{className:"df-primary",onClick:()=>ie("create",{name:"",code:"",owner:""})},"\u5EFA\u7ACB\u7B2C\u4E00\u4E2A\u9879\u76EE"))),W==="create"&&e.createElement(Ce,{title:"\u65B0\u5EFA\u9879\u76EE",busy:!!w,error:R,onClose:()=>C(null)},e.createElement("form",{onSubmit:i=>{i.preventDefault(),U("\u5EFA\u7ACB\u9879\u76EE",async()=>{let t=await m("/projects",c(f));o(t),E("overview"),h(null),N(!1),C(null),await te()})}},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u540D\u79F0"),e.createElement("input",{"aria-label":"\u65B0\u9879\u76EE\u540D\u79F0",required:!0,maxLength:120,value:f.name,onChange:i=>S({...f,name:i.target.value})})),e.createElement("div",{className:"df-fields"},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u7F16\u53F7"),e.createElement("input",{"aria-label":"\u65B0\u9879\u76EE\u7F16\u53F7",maxLength:100,value:f.code,onChange:i=>S({...f,code:i.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u7ECF\u529E\u4EBA"),e.createElement("input",{"aria-label":"\u65B0\u9879\u76EE\u7ECF\u529E\u4EBA",maxLength:100,value:f.owner,onChange:i=>S({...f,owner:i.target.value})}))),e.createElement("p",{className:"df-muted"},"\u5EFA\u7ACB\u9879\u76EE\u540E\uFF0C\u53EF\u6574\u7406\u5171\u7528\u8D44\u6599\uFF0C\u518D\u6309\u516D\u4E2A\u9636\u6BB5\u51C6\u5907\u6750\u6599\u3002"),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",disabled:!!w||!!$,onClick:()=>C(null)},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!w||!f.name?.trim(),type:"submit"},"\u5EFA\u7ACB\u9879\u76EE")))),W==="material"&&e.createElement(Ce,{title:"\u6750\u6599\u4FE1\u606F",busy:!!w,error:R,onClose:()=>C(null)},e.createElement("form",{onSubmit:ye},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u6750\u6599\u540D\u79F0"),e.createElement("input",{"aria-label":"\u6750\u6599\u540D\u79F0",required:!0,maxLength:150,value:f.name,onChange:i=>S({...f,name:i.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u6750\u6599\u72B6\u6001"),e.createElement("select",{"aria-label":"\u6750\u6599\u72B6\u6001",value:f.status,onChange:i=>S({...f,status:i.target.value})},Object.entries(Te).map(([i,t])=>e.createElement("option",{key:i,value:i},t)))),e.createElement("label",{className:"df-checkbox"},e.createElement("input",{type:"checkbox",checked:f.required,onChange:i=>S({...f,required:i.target.checked})}),"\u672C\u9879\u76EE\u7684\u5FC5\u5907\u6750\u6599\uFF0C\u9636\u6BB5\u5B8C\u6210\u524D\u9700\u786E\u8BA4\u5DF2\u5B8C\u6210\u6216\u4E0D\u9002\u7528"),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u6750\u6599\u8BF4\u660E"),e.createElement("textarea",{"aria-label":"\u6750\u6599\u8BF4\u660E",rows:3,maxLength:3e3,value:f.note,onChange:i=>S({...f,note:i.target.value})})),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",onClick:()=>C(null),disabled:!!w||!!$},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!w||!!$,type:"submit"},"\u4FDD\u5B58\u6750\u6599\u4FE1\u606F")))),W==="stage"&&e.createElement(Ce,{title:u.title+"\u529E\u7406\u4FE1\u606F",busy:!!w,error:R,onClose:()=>C(null)},e.createElement("form",{onSubmit:i=>{i.preventDefault(),U("\u4FDD\u5B58\u529E\u7406\u4FE1\u606F",()=>me(`${ne}/stages/${x}`,f,"PUT"))}},e.createElement("div",{className:"df-fields"},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9636\u6BB5\u72B6\u6001"),e.createElement("select",{"aria-label":"\u9636\u6BB5\u72B6\u6001",value:f.status,onChange:i=>S({...f,status:i.target.value})},Object.entries(Pe).map(([i,t])=>e.createElement("option",{key:i,value:i},t)))),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u8BA1\u5212\u65E5\u671F"),e.createElement("input",{"aria-label":"\u9636\u6BB5\u8BA1\u5212\u65E5\u671F",type:"date",value:f.due_date,onChange:i=>S({...f,due_date:i.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u529E\u7406\u7CFB\u7EDF"),e.createElement("input",{"aria-label":"\u529E\u7406\u7CFB\u7EDF",maxLength:150,value:f.system_name,onChange:i=>S({...f,system_name:i.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u7CFB\u7EDF\u5730\u5740"),e.createElement("input",{"aria-label":"\u7CFB\u7EDF\u5730\u5740",type:"url",placeholder:"https://",maxLength:1e3,value:f.system_url,onChange:i=>S({...f,system_url:i.target.value})}))),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u63D0\u4EA4\u7F16\u53F7 / \u56DE\u6267\u4FE1\u606F"),e.createElement("input",{"aria-label":"\u63D0\u4EA4\u7F16\u53F7",maxLength:500,value:f.submission_ref,onChange:i=>S({...f,submission_ref:i.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u529E\u7406\u8BF4\u660E"),e.createElement("textarea",{"aria-label":"\u529E\u7406\u8BF4\u660E",rows:4,maxLength:5e3,value:f.notes,onChange:i=>S({...f,notes:i.target.value})})),e.createElement("p",{className:"df-muted"},"\u8BB0\u5F55\u7EBF\u4E0B\u6216\u4E1A\u52A1\u7CFB\u7EDF\u7684\u5B9E\u9645\u529E\u7406\u7ED3\u679C\uFF0C\u56DE\u6267\u6587\u4EF6\u53EF\u4E0A\u4F20\u5230\u6750\u6599\u6E05\u5355\u3002"),f.status==="completed"&&e.createElement(e.Fragment,null,e.createElement("p",{className:"df-muted"},u.missing_required.length>0?"\u5C1A\u672A\u529E\u7ED3\u7684\u5FC5\u5907\u6750\u6599\uFF1A"+u.missing_required.join("\u3001"):"\u8BF7\u786E\u8BA4\u9636\u6BB5\u6750\u6599\u548C\u524D\u5E8F\u53D8\u66F4\u5DF2\u6838\u5BF9\u3002"),e.createElement("label",{className:"df-checkbox"},e.createElement("input",{"aria-label":"\u786E\u8BA4\u672C\u9636\u6BB5\u5DF2\u529E\u7ED3",type:"checkbox",checked:f.confirmed,onChange:i=>S({...f,confirmed:i.target.checked})}),"\u5DF2\u6838\u5BF9\u672C\u9636\u6BB5\u6750\u6599\u53CA\u524D\u5E8F\u53D8\u66F4\uFF0C\u786E\u8BA4\u672C\u9636\u6BB5\u5DF2\u529E\u7ED3")),e.createElement("div",{className:"df-actions"},e.createElement("button",{type:"button",onClick:()=>C(null),disabled:!!w||!!$},"\u53D6\u6D88"),e.createElement("button",{className:"df-primary",disabled:!!w||f.status==="completed"&&!f.confirmed,type:"submit"},"\u4FDD\u5B58\u529E\u7406\u4FE1\u606F")))),pe&&e.createElement(Be,{key:pe.id,file:pe,projectId:r.id,download:(i,t)=>U("\u4E0B\u8F7D\u539F\u6587\u4EF6",()=>l(i,t)),onClose:()=>ue(null)}))}function Fe({project:d,Field:g,onSave:m,onDirtyChange:c}){let[l,y]=P(d.fields),[p,k]=P({name:d.name,code:d.code,owner:d.owner});return ce(()=>{c(JSON.stringify(l)!==JSON.stringify(d.fields)||p.name!==d.name||p.code!==d.code||p.owner!==d.owner)},[l,p]),e.createElement("form",{className:"df-paper df-project-profile",onSubmit:r=>{r.preventDefault(),m({...p,values:Object.fromEntries(l.map(o=>[o.key,o.value]))})}},e.createElement("div",{className:"df-section-head"},e.createElement("div",null,e.createElement("h2",null,"\u9879\u76EE\u8D44\u6599\u5E95\u7A3F"),e.createElement("p",{className:"df-muted"},"\u5404\u9636\u6BB5\u8868\u5355\u590D\u7528\u8FD9\u91CC\u7684\u8D44\u6599\uFF1B\u9636\u6BB5\u65E5\u671F\u3001\u8BC4\u5BA1\u5206\u6570\u548C\u4ED8\u6B3E\u7ED3\u679C\u5206\u522B\u8BB0\u5F55\u3002")),e.createElement("button",{className:"df-primary",type:"submit"},"\u4FDD\u5B58\u9879\u76EE\u8D44\u6599")),e.createElement("div",{className:"df-fields"},e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u540D\u79F0"),e.createElement("input",{"aria-label":"\u9879\u76EE\u540D\u79F0",required:!0,value:p.name,maxLength:120,onChange:r=>k({...p,name:r.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u9879\u76EE\u7F16\u53F7"),e.createElement("input",{"aria-label":"\u9879\u76EE\u7F16\u53F7",value:p.code,maxLength:100,onChange:r=>k({...p,code:r.target.value})})),e.createElement("label",{className:"df-field"},e.createElement("span",null,"\u7ECF\u529E\u4EBA"),e.createElement("input",{"aria-label":"\u7ECF\u529E\u4EBA",value:p.owner,maxLength:100,onChange:r=>k({...p,owner:r.target.value})}))),[...new Set(l.filter(r=>!["project.name","project.code"].includes(r.key)).map(r=>r.group))].map(r=>e.createElement("section",{className:"df-group",key:r},e.createElement("h3",null,r),e.createElement("div",{className:"df-fields"},l.filter(o=>o.group===r&&!["project.name","project.code"].includes(o.key)).map(o=>e.createElement(g,{key:o.key,field:{...o,required:!1},onChange:x=>y(l.map(E=>E.key===o.key?{...E,value:x}:E))}))))),e.createElement("div",{className:"df-actions"},e.createElement("button",{className:"df-primary",type:"submit"},"\u4FDD\u5B58\u9879\u76EE\u8D44\u6599")))}var G=window.QwenPaw,a=G.host.React,{useState:Q,useEffect:xe,useLayoutEffect:Me,useRef:ve}=a,Se="/document-forms",Qe="application/vnd.openxmlformats-officedocument.wordprocessingml.document";async function K(d,g){let m=await G.host.fetch(Se+d,g);if(!m.ok){let c=await m.json().catch(()=>({}));throw new Error(typeof c.detail=="string"?c.detail:Array.isArray(c.detail)?c.detail.map(l=>`${l.loc?.slice(1).join(".")||"\u8D44\u6599"}\uFF1A${l.msg}`).join("\uFF1B"):`\u64CD\u4F5C\u672A\u5B8C\u6210\uFF08${m.status}\uFF09\uFF0C\u8BF7\u68C0\u67E5\u586B\u5199\u5185\u5BB9`)}return m.json()}async function ze(d,g){let m=await G.host.fetch(Se+d);if(!m.ok)throw new Error("\u6587\u4EF6\u4E0B\u8F7D\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5");let c=URL.createObjectURL(await m.blob()),l=document.createElement("a");l.href=c,l.download=g,document.body.appendChild(l);try{l.click()}finally{l.remove(),setTimeout(()=>URL.revokeObjectURL(c),1e3)}}var oe=d=>({method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)}),he=d=>new Date(d).toLocaleString("zh-CN",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}),Oe=d=>d.kind==="textarea"||d.value.length>100||d.value.includes(`
`)||d.label.includes("\u6574\u6BB5"),Ke=d=>/^(research\.contents|deliverables\.|metrics\.|milestones\.)/.test(d.key)||/主要研究内容|预期成果|考核指标|进度安排/.test(d.label);function je(d){return d.map((g,m)=>{let c={...g};for(let l of["start","end"]){let y="follow_"+l;c[y]=m>0&&(typeof c[y]=="boolean"?c[y]:!c[l]),c[y]&&(c[l]=d[0][l])}return c})}function Ie({field:d,displayValue:g,onChange:m}){let c=Oe(d),l=Ke(d),y=["date","datetime-local"].includes(d.kind)?d.value:g??d.value,p=ve(null);return Me(()=>{if(!p.current)return;let k=p.current.scrollTop;p.current.style.height="auto",p.current.style.height=Math.max(l?104:192,p.current.scrollHeight)+"px",p.current.scrollTop=k},[y,c,l]),a.createElement("label",{className:"df-field"+(c?" df-field-paragraph":"")+(l?" df-field-compact":""),id:"df-"+d.key},a.createElement("span",null,d.label,d.required&&a.createElement("em",null,"\u5FC5\u586B")),c?a.createElement("textarea",{ref:p,"aria-label":d.label,rows:l?3:8,value:y,onChange:k=>m(k.target.value)}):a.createElement("input",{"aria-label":d.label,type:d.kind,step:d.kind==="number"?"any":void 0,value:y,onChange:k=>m(k.target.value)}),a.createElement("small",null,d.key))}function Ve({project:d,workflowStage:g,initialCaseId:m,initialView:c,onBack:l,onChanged:y,onDirtyChange:p,onBusyChange:k,onViewChange:r}){let[o,x]=Q(null),[E,A]=Q(null),[L,v]=Q([]),[h,j]=Q("import"),[N,O]=Q(!1),[D,$]=Q(null),[Z,w]=Q(!1),[z,R]=Q(""),[B,re]=Q(""),[ee,W]=Q(""),[C,f]=Q(null),[S,pe]=Q(null),ue=ve(null),I=ve(null),X=ve(0),q=ve(!0),we=G.host.useTheme?.()||"light",J=()=>y?.()||Promise.resolve();xe(()=>(q.current=!0,K("/cases/"+m).then(t=>{q.current&&(V(t),j(c==="files"&&t.generations.length?"files":"edit"),c==="files"&&t.generations.length&&f({file:t.generations[0].files[0],generation:t.generations[0]}))}).catch(t=>q.current&&re(t.message)),(G.workspace?.loadPreview?G.workspace.loadPreview():Promise.resolve(se)).then(t=>{q.current&&pe(()=>t)}).catch(t=>{q.current&&pe(()=>se)}),()=>{q.current=!1,X.current++}),[]),xe(()=>{p?.(N)},[N]),xe(()=>{k?.(z)},[z]),xe(()=>{r?.()},[h]),xe(()=>{let t=n=>{N&&(n.preventDefault(),n.returnValue="")};return window.addEventListener("beforeunload",t),()=>window.removeEventListener("beforeunload",t)},[N]);async function T(t,n){if(z)return;let s=++X.current;R(t),re(""),W("");try{await n()}catch(_){q.current&&s===X.current&&re(_.message)}finally{q.current&&s===X.current&&R("")}}function V(t){q.current&&(x({...t,recipients:je(t.recipients),presentation_sources:Object.fromEntries(t.fields.map(n=>[n.key,n.value]))}),O(!1),$(null),w(!1))}function u(t){x(t),O(!0),$(null),w(!1),W("")}function fe(t,n,s,_=!1){let be=o.recipients.map((Ee,Ae)=>Ae===t?{...Ee,[n]:s,...n!=="name"?{["follow_"+n]:_}:{}}:Ee);u({...o,recipients:je(be)})}async function F(){if(!N)return o;let t={revision:o.revision,name:o.name.trim()||"\u672A\u547D\u540D\u586B\u62A5",values:Object.fromEntries(o.fields.map(s=>[s.key,s.value])),recipients:o.recipients},n=await K("/cases/"+o.id,{...oe(t),method:"PUT"});return V(n),n}function te(){return!N||window.confirm("\u5F53\u524D\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\u3002\u79BB\u5F00\u6B64\u8BB0\u5F55\uFF1F")}let M=o?.templates||[],U=M.reduce((t,n)=>t+(n.per_recipient?o.recipients.length:1),0),ae=o?.generations[0],H=D?.checks.filter(t=>t.status!=="ok")||[];async function ie(t){!t||!te()||await T("\u8BFB\u53D6 Excel",async()=>{let n=new FormData;n.append("workbook",t),n.append("revision",d.revision),n.append("stage_id",g.id);let s=await K(`/projects/${d.id}/cases/import`,{method:"POST",body:n});V(s),f(null),j("edit"),await J(),W(s.templates.length?"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\uFF0C\u5E76\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002":s.template_notice||"\u5DF2\u8BFB\u53D6\u53D8\u91CF\u914D\u7F6E\u3002\u8BF7\u6DFB\u52A0\u5BF9\u5E94\u7684 Word \u6A21\u677F\u3002")})}async function me(t){t=Array.from(t),t.length&&await T("\u8BFB\u53D6 Word \u6A21\u677F",async()=>{let n=await F(),s=new FormData;s.append("revision",String(n.revision)),Array.from(t).forEach(_=>s.append("files",_)),V(await K("/cases/"+n.id+"/templates",{method:"POST",body:s})),await J(),W("Word \u6A21\u677F\u5DF2\u6DFB\u52A0\uFF0C\u751F\u6210\u65F6\u4F1A\u4FDD\u7559\u539F\u6709\u6392\u7248\u3002")})}async function ge(){await T("\u6838\u5BF9\u8D44\u6599",async()=>{let t=await F(),n=await K("/cases/"+t.id+"/review",oe({revision:t.revision}));q.current&&($(n),w(!1),j("review"),await J())})}async function _e(){await T("\u751F\u6210\u6587\u4E66",async()=>{let t=await K("/cases/"+o.id+"/generate",oe({revision:o.revision,review_token:D.review_token,confirmed:Z}));V(t),j("files"),f({file:t.generations[0].files[0],generation:t.generations[0]}),await J()})}function ne(t){j("edit"),requestAnimationFrame(()=>{let n=document.getElementById("df-"+t);n?.scrollIntoView({behavior:"smooth",block:"center"}),n?.querySelector("input,textarea")?.focus()})}let ye=(t,n)=>`/cases/${o.id}/outputs/${t.id}/${encodeURIComponent(n)}`;function ke(t){return T("\u6B63\u5728\u4E0B\u8F7D\u538B\u7F29\u5305",async()=>{await ze(ye(t,"\u5168\u90E8\u6587\u4E66.zip"),t.bundle_name||o.name+"_\u6587\u4E66.zip"),W(`\u5DF2\u5F00\u59CB\u4E0B\u8F7D\u8BE5\u6279\u6B21\u7684 ${t.files.length} \u4EFD\u6587\u4E66\u538B\u7F29\u5305\u3002`)})}let i=C?{id:C.generation.id+C.file.name,title:C.file.name,source:"generated",mimeType:Qe,extension:"docx",binaryUrl:C.file.preview_url,printUrl:Se+`/cases/${o.id}/print/${C.generation.id}/${encodeURIComponent(C.file.name)}`,agentId:G.host.getSelectedAgentId?.(),createdAt:Date.parse(C.generation.created_at)}:null;return a.createElement("div",{className:"df-app df-embedded-editor","data-theme":we},a.createElement("style",null,Ne),a.createElement("input",{ref:ue,type:"file",accept:".xlsx",hidden:!0,"aria-label":"\u5BFC\u5165 Excel \u53D8\u91CF\u8868",onChange:t=>{ie(t.target.files[0]),t.target.value=""}}),a.createElement("input",{ref:I,type:"file",accept:".docx",multiple:!0,hidden:!0,"aria-label":"\u5BFC\u5165 Word \u6A21\u677F",onChange:t=>{me(t.target.files),t.target.value=""}}),a.createElement("section",{className:"df-main"},a.createElement("div",{className:"df-editor-context"},a.createElement("button",{disabled:!!z,onClick:()=>{te()&&l()}},"\u2190 \u8FD4\u56DE",g.title),a.createElement("span",null,d.name," / ",g.title),o&&a.createElement("div",{className:"df-actions"},a.createElement("button",{disabled:!!z,onClick:()=>{A("adopt"),v([])}},"\u6838\u5BF9\u9879\u76EE\u8D44\u6599\u5DEE\u5F02"),a.createElement("button",{disabled:!!z,onClick:()=>{A("publish"),v([])}},"\u5B58\u5165\u9879\u76EE\u5E95\u7A3F"))),a.createElement("header",{className:"df-header"},a.createElement("div",null,a.createElement("span",{className:"df-eyebrow"},g.title," / \u586B\u5199\u4E0E\u751F\u6210"),a.createElement("h1",null,o?o.name:"\u628A\u91CD\u590D\u586B\u5199\u7684\u8D44\u6599\uFF0C\u6574\u7406\u6210\u4E00\u5F20\u8868\u3002"),a.createElement("p",null,o?N?"\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539":`\u8349\u7A3F\u5DF2\u4FDD\u5B58 \xB7 ${he(o.updated_at)}`:"\u5BFC\u5165\u53D8\u91CF\u8868\u4E0E Word \u6A21\u677F\uFF0C\u586B\u5199\u3001\u6838\u5BF9\uFF0C\u518D\u751F\u6210\u6587\u4E66\u3002")),o&&a.createElement("button",{disabled:!!z||!N,onClick:()=>T("\u4FDD\u5B58\u8349\u7A3F",async()=>{await F(),await J(),W("\u8349\u7A3F\u5DF2\u4FDD\u5B58")})},"\u4FDD\u5B58\u8349\u7A3F")),a.createElement("div",{className:"df-steps","aria-label":"\u586B\u5199\u6D41\u7A0B"},[["import","01","\u5BFC\u5165\u6A21\u677F"],["edit","02","\u586B\u5199\u8D44\u6599"],["review","03","\u6838\u5BF9\u751F\u6210"],["files","04","\u6587\u4EF6\u9884\u89C8"]].map(([t,n,s])=>a.createElement("button",{key:t,className:h===t?"active":"",disabled:!!z||!o&&t!=="import"||t==="files"&&!ae,onClick:()=>t==="review"?ge():j(t)},a.createElement("span",null,n),s))),B&&a.createElement("div",{className:"df-alert error",role:"alert"},B,a.createElement("button",{"aria-label":"\u5173\u95ED\u9519\u8BEF\u63D0\u793A",onClick:()=>re("")},"\xD7")),ee&&a.createElement("div",{className:"df-alert",role:"status"},ee),z&&a.createElement("div",{className:"df-progress",role:"status"},z,"\u2026"),a.createElement("fieldset",{className:"df-content",disabled:!!z},h==="import"&&a.createElement("div",{className:"df-import"},a.createElement("section",{className:"df-paper df-drop"},a.createElement("div",{className:"df-file-mark"},"XLSX"),a.createElement("h2",null,"\u4ECE Excel \u53D8\u91CF\u8868\u5F00\u59CB"),a.createElement("p",null,"\u201C\u53D8\u91CF\u914D\u7F6E\u201D\u5DE5\u4F5C\u8868\u4FDD\u7559\u4E09\u5217\uFF1A",a.createElement("br",null),a.createElement("b",null,"\u53D8\u91CF\u540D\u79F0\u3000\u4E2D\u6587\u540D\u79F0\u3000\u503C")),a.createElement("button",{className:"df-primary",onClick:()=>ue.current.click()},"\u9009\u62E9 Excel \u53D8\u91CF\u8868"),a.createElement("small",null,"\u652F\u6301 .xlsx \xB7 \u5355\u4E2A\u6587\u4EF6\u4E0D\u8D85\u8FC7 15 MB")),a.createElement("section",{className:"df-paper df-import-note"},a.createElement("span",{className:"df-eyebrow"},"\u5982\u4F55\u51C6\u5907"),a.createElement("h2",null,"\u4E00\u4EFD\u6570\u636E\uFF0C\u591A\u4EFD\u6587\u4E66"),a.createElement("ol",null,a.createElement("li",null,a.createElement("b",null,"\u6574\u7406\u53D8\u91CF"),a.createElement("p",null,"\u4F8B\u5982 project.name / \u9879\u76EE\u540D\u79F0 / \u5B9E\u9645\u540D\u79F0\u3002\u652F\u6301\u5206\u7EC4\u3001\u7C7B\u578B\u548C\u5FC5\u586B\u5217\u3002")),a.createElement("li",null,a.createElement("b",null,"\u81EA\u52A8\u8F7D\u5165\u6A21\u677F"),a.createElement("p",null,"\u5E94\u7528\u81EA\u5E26 5 \u4EFD\u6807\u51C6 Word \u6A21\u677F\uFF0C\u4F7F\u7528\u914D\u5957 Excel \u5373\u53EF\u81EA\u52A8\u8F7D\u5165\uFF1B \u4E5F\u53EF\u6DFB\u52A0\u81EA\u5DF1\u7684\u6A21\u677F\u3002")),a.createElement("li",null,a.createElement("b",null,"\u5206\u522B\u751F\u6210\u9080\u8BF7\u51FD"),a.createElement("p",null,"\u5728\u201C\u53D7\u9080\u5355\u4F4D\u201D\u8868\u8BB0\u5F55\u5355\u4F4D\u540D\u79F0\u3001\u9886\u53D6\u5F00\u59CB\u65F6\u95F4\u548C\u9886\u53D6\u7ED3\u675F\u65F6\u95F4\u3002"))),a.createElement("p",{className:"df-muted"},"\u201C\u65E5\u671F\u6821\u6838\u201D\u8868\u4E2D\u7684\u65E7\u7ED3\u679C\u4E0D\u4F1A\u4F5C\u4E3A\u5224\u65AD\u4F9D\u636E\uFF1B\u5E94\u7528\u4F1A\u6839\u636E\u5F53\u524D\u586B\u5199\u5185\u5BB9\u91CD\u65B0\u6838\u5BF9\u3002\u201C\u6821\u6838\u89C4\u5219\u201D\u8868\u53EF\u8865\u5145\u81EA\u5B9A\u4E49\u5148\u540E\u5173\u7CFB\u3002"))),o&&h==="edit"&&a.createElement("div",{className:"df-edit-layout"},a.createElement("section",{className:"df-paper"},a.createElement("div",{className:"df-section-head"},a.createElement("h2",null,"\u586B\u5199\u4FE1\u606F"),a.createElement("button",{onClick:()=>T("\u5BFC\u51FA Excel",async()=>{let t=await F();await ze(`/cases/${t.id}/excel`,(t.fields.find(n=>n.key==="project.name")?.value||t.name).replace(/[<>:"/\\|?*\x00-\x1f]/g,"_").slice(0,80)+"_\u586B\u5199\u6570\u636E.xlsx")})},"\u5BFC\u51FA\u5F53\u524D Excel")),a.createElement("label",{className:"df-field df-title-field"},a.createElement("span",null,"\u8868\u5355\u540D\u79F0"),a.createElement("input",{"aria-label":"\u8868\u5355\u540D\u79F0",maxLength:120,value:o.name,onChange:t=>u({...o,name:t.target.value})})),[...new Set(o.fields.map(t=>t.group))].map(t=>a.createElement("section",{className:"df-group",key:t},a.createElement("h3",null,t),t==="\u65E5\u671F\u5B89\u6392"&&a.createElement("p",{className:"df-muted"},"\u6587\u4E66\u7EDF\u4E00\u4F7F\u7528\u4E2D\u6587\u65E5\u671F\uFF0C\u4F8B\u5982\u201C2026\u5E7410\u670822\u65E5\u4E0B\u534814:30\u201D\u3002\u65E5\u671F\u9009\u62E9\u5668\u4FDD\u7559\u539F\u6765\u7684\u586B\u5199\u65B9\u5F0F\u3002"),a.createElement("div",{className:"df-fields"},o.fields.filter(n=>n.group===t).map(n=>a.createElement(Ie,{key:n.key,field:n,displayValue:o.presentation_sources?.[n.key]===n.value?o.document_values?.[n.key]:void 0,onChange:s=>u({...o,fields:o.fields.map(_=>_.key===n.key?{..._,value:s}:_)})})))))),a.createElement("section",{className:"df-paper"},a.createElement("div",{className:"df-section-head"},a.createElement("div",null,a.createElement("h2",null,"\u53D7\u9080\u5355\u4F4D"," ",a.createElement("span",{className:"df-count"},o.recipients.length)),a.createElement("p",null,"\u6309\u5355\u4F4D\u6587\u4E66\u5206\u522B\u751F\u6210\uFF0C\u5171\u7528\u9879\u76EE\u4E0E\u843D\u6B3E\u4FE1\u606F\u3002")),a.createElement("button",{onClick:()=>u({...o,recipients:je([...o.recipients,{name:"",start:"",end:""}])}),disabled:o.recipients.length>=200},"\uFF0B \u6DFB\u52A0\u5355\u4F4D")),o.recipients.map((t,n)=>a.createElement("div",{className:"df-recipient",key:n,id:"df-recipient-"+n},a.createElement("div",{className:"df-recipient-title"},a.createElement("b",null,String(n+1).padStart(2,"0")),a.createElement("button",{"aria-label":`\u79FB\u9664\u7B2C${n+1}\u5BB6\u5355\u4F4D`,onClick:()=>u({...o,recipients:je(o.recipients.filter((s,_)=>_!==n))})},"\u79FB\u9664")),a.createElement("div",{className:"df-fields"},[["name","\u5355\u4F4D\u540D\u79F0"],["start","\u9886\u53D6\u5F00\u59CB\u65F6\u95F4"],["end","\u9886\u53D6\u7ED3\u675F\u65F6\u95F4"]].map(([s,_])=>a.createElement("label",{className:"df-field "+(s==="name"?"df-span":""),key:s},a.createElement("span",null,_),a.createElement("input",{"aria-label":`\u7B2C${n+1}\u5BB6${_}`,type:s==="name"?"text":"datetime-local",value:s==="name"?t[s]:t[s].replace(" ","T"),onChange:be=>fe(n,s,be.target.value)}),n>0&&s!=="name"&&a.createElement("small",{className:"df-follow-state"},t["follow_"+s]?"\u8DDF\u968F\u7B2C1\u5BB6":"\u5DF2\u5355\u72EC\u8BBE\u7F6E",!t["follow_"+s]&&a.createElement("button",{type:"button","aria-label":`\u7B2C${n+1}\u5BB6${_}\u6062\u590D\u8DDF\u968F`,onClick:be=>{be.preventDefault(),fe(n,s,o.recipients[0][s],!0)}},"\u6062\u590D\u8DDF\u968F")))))))),a.createElement("section",{className:"df-paper df-template-panel","aria-label":"Word \u6A21\u677F"},a.createElement("div",{className:"df-section-head"},a.createElement("h2",null,"Word \u6A21\u677F"),a.createElement("div",{className:"df-template-actions"},M.length>0?a.createElement("button",{onClick:()=>T("\u4FDD\u5B58\u9ED8\u8BA4\u6A21\u677F",async()=>{let t=await F();await K(`/cases/${t.id}/defaults`,oe({revision:t.revision})),W(g.id==="negotiation"?"\u5DF2\u8BBE\u4E3A\u672C\u673A\u9ED8\u8BA4\u6A21\u677F\uFF0C\u4EE5\u540E\u65B0\u5EFA\u586B\u62A5\u4F1A\u81EA\u52A8\u8F7D\u5165\u3002":"\u5DF2\u8BBE\u4E3A\u672C\u9636\u6BB5\u9ED8\u8BA4\u6A21\u677F\uFF0C\u4EE5\u540E\u65B0\u5EFA\u8BE5\u9636\u6BB5\u8868\u5355\u4F1A\u81EA\u52A8\u8F7D\u5165\u3002")})},g.id==="negotiation"?"\u8BBE\u4E3A\u9ED8\u8BA4\u6A21\u677F":"\u8BBE\u4E3A\u672C\u9636\u6BB5\u9ED8\u8BA4\u6A21\u677F"):a.createElement("button",{onClick:()=>T("\u8F7D\u5165\u9ED8\u8BA4\u6A21\u677F",async()=>{let t=await F();V(await K(`/cases/${t.id}/defaults/apply`,oe({revision:t.revision}))),W("\u5DF2\u8F7D\u5165\u9ED8\u8BA4 Word \u6A21\u677F\u3002")})},"\u4F7F\u7528\u9ED8\u8BA4\u6A21\u677F"),a.createElement("button",{onClick:()=>I.current.click()},"\uFF0B \u6DFB\u52A0"))),!M.length&&a.createElement("p",{className:"df-muted"},"\u6DFB\u52A0\u4E0E\u4F60\u7684\u53D8\u91CF\u8868\u5BF9\u5E94\u7684 .docx \u6A21\u677F\u3002"),M.map(t=>a.createElement("div",{className:"df-template",key:t.id},a.createElement("b",null,t.name),t.from_builtin&&a.createElement("small",null,"\u5E94\u7528\u81EA\u5E26\u6A21\u677F"),a.createElement("span",null,t.per_recipient?"\u6309\u53D7\u9080\u5355\u4F4D\u5206\u522B\u751F\u6210":"\u5171\u7528\u6587\u4EF6 \xB7 \u751F\u6210\u4E00\u4EFD"),t.print_copies>1&&a.createElement("small",null,"\u5EFA\u8BAE\u6253\u5370 ",t.print_copies," \u4EFD \xB7 ",t.print_note),a.createElement("small",null,t.keys.length," \u4E2A\u5F15\u7528\u53D8\u91CF"),a.createElement("button",{"aria-label":"\u79FB\u9664\u6A21\u677F"+t.name,onClick:()=>T("\u79FB\u9664\u6A21\u677F",async()=>{let n=await F();V(await K(`/cases/${n.id}/templates/${t.id}?revision=${n.revision}`,{method:"DELETE"}))})},"\u79FB\u9664")))),a.createElement("section",{className:"df-paper df-edit-footer","aria-label":"\u6838\u5BF9\u4E0E\u751F\u6210"},a.createElement("div",{className:"df-generation-plan"},a.createElement("h2",null,"\u6838\u5BF9\u4E0E\u751F\u6210"),a.createElement("p",null,"\u672C\u6B21\u8BA1\u5212\u751F\u6210 ",a.createElement("b",null,U)," \u4EFD\u6587\u4E66"),a.createElement("small",null,M.filter(t=>!t.per_recipient).length," ","\u4EFD\u5171\u7528\u6587\u4EF6 \xB7"," ",M.filter(t=>t.per_recipient).length," ","\u7C7B\u6309\u5355\u4F4D\u6587\u4E66 \xD7 ",o.recipients.length," \u5BB6\u5355\u4F4D")),a.createElement("div",{className:"df-next-action"},a.createElement("button",{className:"df-primary",onClick:ge},"\u6838\u5BF9\u586B\u5199\u5185\u5BB9 \u2192"),a.createElement("small",null,"\u5148\u6838\u5BF9\u7F3A\u9879\u4E0E\u65E5\u671F\uFF0C\u518D\u786E\u8BA4\u751F\u6210")))),o&&h==="review"&&D&&a.createElement("div",{className:"df-review"},a.createElement("section",{className:"df-paper"},a.createElement("span",{className:"df-eyebrow"},"\u586B\u5199\u6838\u5BF9"),a.createElement("h2",null,D.can_generate?"\u8D44\u6599\u5DF2\u9F50\u5907\uFF0C\u8BF7\u786E\u8BA4\u672C\u6B21\u5185\u5BB9\u3002":`\u8FD8\u6709 ${H.length} \u9879\u9700\u8981\u5904\u7406`),a.createElement("p",null,"\u672C\u6B21\u4F7F\u7528\u4FEE\u8BA2 ",o.revision," \u7684\u6570\u636E\uFF0C\u8BA1\u5212\u751F\u6210 ",U," ","\u4EFD\u6587\u4E66\u3002"),H.length>0&&a.createElement("div",{className:"df-checks"},H.map((t,n)=>a.createElement("div",{key:n,className:"df-check "+t.status},a.createElement("span",null,t.status==="ok"?"\u901A\u8FC7":t.status==="missing"?"\u5F85\u8865\u5145":"\u51B2\u7A81"),a.createElement("div",null,a.createElement("b",null,t.label),a.createElement("p",null,t.detail)),t.status!=="ok"&&t.field&&a.createElement("button",{onClick:()=>ne(t.field)},"\u4FEE\u6539")))),D.checks.some(t=>t.status==="ok")&&a.createElement("details",{className:"df-passed"},a.createElement("summary",null,D.checks.filter(t=>t.status==="ok").length," ","\u9879\u65E5\u671F\u6821\u6838\u901A\u8FC7 \xB7 \u67E5\u770B\u660E\u7EC6"),D.checks.filter(t=>t.status==="ok").map((t,n)=>a.createElement("p",{key:n},a.createElement("b",null,t.label),a.createElement("br",null),t.detail.replaceAll("T"," ")))),a.createElement("div",{className:"df-review-data"},a.createElement("h3",null,"\u5171\u7528\u4FE1\u606F"),a.createElement("dl",null,o.fields.map(t=>a.createElement("div",{key:t.key,className:Oe(t)?"df-span":void 0},a.createElement("dt",null,t.label),a.createElement("dd",null,(o.document_values?.[t.key]??t.value)||"\u5C1A\u672A\u586B\u5199")))),o.recipients.length>0&&a.createElement(a.Fragment,null,a.createElement("h3",null,"\u53D7\u9080\u5355\u4F4D"),o.recipients.map((t,n)=>a.createElement("p",{key:n},n+1,". ",t.name||"\u5C1A\u672A\u586B\u5199",o.recipient_document_times?.[n]??`${t.start.replace("T"," ")} \u2014 ${t.end.replace("T"," ")}`)))),a.createElement("div",{className:"df-review-data"},a.createElement("h3",null,"\u8F93\u51FA\u6E05\u5355"),M.map(t=>a.createElement("p",{key:t.id},t.name," \xB7"," ",t.per_recipient?o.recipients.map(n=>n.name||"\u5F85\u586B\u5355\u4F4D").join("\u3001"):"\u5171\u7528\u6587\u4EF6",t.print_copies>1&&` \xB7 \u5EFA\u8BAE\u6253\u5370 ${t.print_copies} \u4EFD\uFF0C\u6BCF\u4F4D\u4E13\u5BB6\u4E00\u4EFD`))),a.createElement("div",{className:"df-confirm"},a.createElement("label",null,a.createElement("input",{type:"checkbox",checked:Z,disabled:!D.can_generate,onChange:t=>w(t.target.checked)}),"\u6211\u5DF2\u6838\u5BF9\u586B\u5199\u5185\u5BB9\u3001\u53D7\u9080\u5355\u4F4D\u548C\u65E5\u671F\u5B89\u6392"),a.createElement("p",null,"\u6821\u6838\u68C0\u67E5\u8D44\u6599\u5B8C\u6574\u6027\u53CA\u65F6\u95F4\u987A\u5E8F\u3002\u4E1A\u52A1\u6761\u6B3E\u4E0E Word \u6A21\u677F\u8BF7\u7531\u7ECF\u529E\u4EBA\u590D\u6838\u3002"),a.createElement("div",null,a.createElement("button",{onClick:()=>{j("edit"),w(!1)}},"\u8FD4\u56DE\u4FEE\u6539"),a.createElement("button",{className:"df-primary",disabled:!D.can_generate||!Z,onClick:_e},"\u786E\u8BA4\u5E76\u751F\u6210 ",U," \u4EFD\u6587\u4E66"))))),o&&h==="files"&&ae&&a.createElement("div",{className:"df-results"},a.createElement("section",{className:"df-paper df-output-list"},a.createElement("span",{className:"df-eyebrow"},"\u751F\u6210\u8BB0\u5F55"),a.createElement("h2",null,ae.files.length," \u4EFD\u6587\u4EF6\u5DF2\u751F\u6210"),a.createElement("p",null,he(ae.created_at)," \xB7 \u4FEE\u8BA2 ",ae.revision),a.createElement("p",{className:"df-muted"},"\u538B\u7F29\u5305\u5305\u542B Word\u3001\u586B\u5199\u6570\u636E\u548C\u6838\u5BF9\u8BB0\u5F55"),(N||ae.revision!==o.revision)&&a.createElement("div",{className:"df-alert"},"\u586B\u5199\u5185\u5BB9\u5DF2\u6709\u4FEE\u6539\uFF0C\u4E0B\u5217\u6587\u4EF6\u4FDD\u7559\u751F\u6210\u65F6\u7684\u5185\u5BB9\u3002\u8BF7\u91CD\u65B0\u6838\u5BF9\u5E76\u751F\u6210\u65B0\u7248\u3002"),o.generations.map(t=>a.createElement("div",{className:"df-generation",key:t.id},a.createElement("div",{className:"df-generation-heading"},a.createElement("h3",null,he(t.created_at)," \xB7 \u4FEE\u8BA2 ",t.revision,t.date_style!=="zh-CN"&&" \xB7 \u539F\u65E5\u671F\u683C\u5F0F",t.naming_style!=="formal"&&" \xB7 \u539F\u6587\u4EF6\u540D"),a.createElement("button",{"aria-label":`\u6253\u5305\u4E0B\u8F7D ${he(t.created_at)} \u4FEE\u8BA2 ${t.revision}`,onClick:()=>ke(t)},"\u6253\u5305\u4E0B\u8F7D")),t.files.map(n=>a.createElement("div",{className:"df-output "+(C?.file.name===n.name&&C?.generation.id===t.id?"selected":""),key:n.name},a.createElement("button",{onClick:()=>f({file:n,generation:t})},a.createElement("b",null,n.name),a.createElement("small",null,n.recipient," \xB7 ",(n.size/1024).toFixed(0)," KB",n.print_copies>1&&` \xB7 \u5EFA\u8BAE\u6253\u5370 ${n.print_copies} \u4EFD`)),a.createElement("button",{"aria-label":"\u4E0B\u8F7D"+n.name,onClick:()=>T("\u4E0B\u8F7D\u6587\u4EF6",()=>ze(ye(t,n.name),n.name))},"\u2193")))))),a.createElement("section",{className:"df-paper df-preview"},a.createElement("div",{className:"df-section-head"},a.createElement("h2",null,C?C.file.name:"\u9009\u62E9\u6587\u4EF6\u9884\u89C8"),a.createElement("span",null,"Office \u9884\u89C8")),a.createElement("div",{className:"df-preview-body"},i&&S?a.createElement(De,{key:i.id,artifact:i},a.createElement(S,{key:i.id,artifact:i,readOnly:!0,hostControls:!0})):a.createElement("p",{className:"df-muted"},i?"\u6B63\u5728\u6253\u5F00\u6587\u4EF6\u2026":"\u4ECE\u5DE6\u4FA7\u9009\u62E9\u4E00\u4EFD\u6587\u4EF6\u3002"))))),a.createElement("footer",{className:"df-footer"},a.createElement("span",null,"UGSci \xB7 \u6587\u4E66\u586B\u62A5"),a.createElement("span",null,"\u6570\u636E\u4E0E\u6587\u4E66\u4FDD\u5B58\u5728\u5F53\u524D\u670D\u52A1\u7AEF \xB7 \u65E0\u9700\u6A21\u578B\u670D\u52A1"))),E&&o&&a.createElement("div",{className:"df-dialog-backdrop"},a.createElement("section",{className:"df-dialog df-paper",role:"dialog","aria-modal":"true","aria-label":"\u6838\u5BF9\u5171\u7528\u8D44\u6599"},a.createElement("div",{className:"df-section-head"},a.createElement("h2",null,E==="adopt"?"\u91C7\u7528\u9879\u76EE\u5E95\u7A3F\u4E2D\u7684\u8D44\u6599":"\u5C06\u672C\u8868\u8D44\u6599\u5B58\u5165\u9879\u76EE\u5E95\u7A3F"),a.createElement("button",{disabled:!!z,onClick:()=>A(null),"aria-label":"\u5173\u95ED\u5171\u7528\u8D44\u6599\u6838\u5BF9"},"\xD7")),a.createElement("p",{className:"df-muted"},"\u53EA\u66F4\u65B0\u52FE\u9009\u9879\u3002\u539F\u751F\u6210\u6587\u4EF6\u4FDD\u7559\uFF0C\u540E\u7EED\u751F\u6210\u524D\u9700\u91CD\u65B0\u6838\u5BF9\u3002"),B&&a.createElement("p",{role:"alert",className:"df-alert error"},B),a.createElement("div",{className:"df-compare"},d.fields.filter(t=>o.fields.some(n=>n.key===t.key&&n.value!==t.value)).map(t=>{let n=o.fields.find(s=>s.key===t.key);return a.createElement("label",{key:t.key},a.createElement("input",{type:"checkbox",checked:L.includes(t.key),onChange:s=>v(s.target.checked?[...L,t.key]:L.filter(_=>_!==t.key))}),a.createElement("div",null,a.createElement("b",null,t.label),a.createElement("div",{className:"df-compare-values"},a.createElement("p",null,a.createElement("small",null,"\u5F53\u524D\u8868\u5355"),n.value||"\u7A7A\u767D"),a.createElement("p",null,a.createElement("small",null,"\u9879\u76EE\u5E95\u7A3F"),t.value||"\u7A7A\u767D"))))}),!d.fields.some(t=>o.fields.some(n=>n.key===t.key&&n.value!==t.value))&&a.createElement("p",null,"\u672C\u8868\u4E0E\u9879\u76EE\u5E95\u7A3F\u4E2D\u7684\u5171\u7528\u8D44\u6599\u4E00\u81F4\u3002")),a.createElement("div",{className:"df-actions"},a.createElement("button",{disabled:!!z,onClick:()=>A(null)},"\u53D6\u6D88"),a.createElement("button",{className:"df-primary",disabled:!!z||!L.length,onClick:()=>T("\u540C\u6B65\u5171\u7528\u8D44\u6599",async()=>{let t=await F();if(E==="adopt")V(await K(`/projects/${d.id}/cases/${t.id}/sync`,oe({revision:d.revision,case_revision:t.revision,keys:L})));else{let n=Object.fromEntries(t.fields.filter(s=>L.includes(s.key)).map(s=>[s.key,s.value]));await K(`/projects/${d.id}`,{...oe({revision:d.revision,name:n["project.name"]??d.name,code:n["project.code"]??d.code,owner:d.owner,values:n}),method:"PUT"})}await J(),A(null),W("\u6240\u9009\u8D44\u6599\u5DF2\u540C\u6B65\uFF0C\u8BF7\u91CD\u65B0\u6838\u5BF9\u540E\u751F\u6210\u65B0\u7248\u6587\u4E66\u3002")})},E==="adopt"?"\u91C7\u7528\u6240\u9009\u9879\u76EE\u8D44\u6599":"\u4FDD\u5B58\u6240\u9009\u8D44\u6599\u5230\u5E95\u7A3F")))))}function Ge(){let d=G.host.useSelectedAgent?.();return a.createElement($e,{key:d?.id||G.host.getSelectedAgentId?.()||"default",Editor:Ve,services:{request:K,json:oe,download:ze,time:he,Field:Ie}})}G.registerRoutes("document-forms",[{path:"/apps/document-forms",component:Ge,label:"\u6587\u4E66\u586B\u62A5",icon:"\u25A4"}]);})();
