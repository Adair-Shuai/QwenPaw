/** Scoped product styles follow the host theme; no independent palette. */
export const CAPABILITY_STYLES = `
.ugsci-capabilities { padding:24px; color:var(--app-text); min-width:0; }
.ugsci-capability-context { display:flex; align-items:center; gap:10px; margin:20px 0; flex-wrap:wrap; }
.ugsci-capability-context label { color:var(--app-text-secondary); font-size:12px; }
.ugsci-capability-section[data-focused="true"] > :not(.ugsci-capability-focus) { display:none!important; }
.ugsci-capability-focus { max-width:760px; margin:0 auto; min-width:0; }
.ugsci-capability-detail { margin-top:16px; border:1px solid var(--app-border-subtle, var(--app-border)); border-radius:14px; padding:24px; background:var(--app-surface); }
.ugsci-capability-detail-heading { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:22px; }
.ugsci-capability-detail-heading h2 { font-size:18px; margin:0; overflow-wrap:anywhere; }
.ugsci-capability-detail-footer { display:flex; justify-content:flex-end; margin-top:22px; padding-top:16px; border-top:1px solid var(--app-border-subtle); }
.ugsci-capability-card { border-radius:12px; background:var(--app-surface); height:100%; width:100%; min-width:0; }
.ugsci-capability-card > :is(.ant-card-body,.qwenpaw-card-body) { padding:12px!important; height:100%; display:flex; flex-direction:column; gap:7px; }
.ugsci-capability-card-title { display:flex; align-items:center; gap:10px; min-width:0; }
.ugsci-capability-card-title button { padding:0; border:0; background:transparent; color:inherit; text-align:left; font:inherit; font-size:15px; font-weight:600; overflow-wrap:anywhere; cursor:pointer; }
.ugsci-capability-avatar { width:36px; height:36px; flex-shrink:0; border-radius:9px; display:grid; place-items:center; background:var(--app-fill-faint,var(--app-fill-subtle)); font-size:21px; }
.ugsci-capability-avatar img { width:36px; height:36px; object-fit:contain; border-radius:8px; }
.ugsci-capability-card-footer { display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap; margin-top:auto; padding-top:4px; }
.ugsci-capability-card-copy { color:var(--app-text-secondary); font-size:12px; line-height:1.5; overflow-wrap:anywhere; }
.ugsci-capability-card-meta { display:flex; align-items:center; gap:5px; flex-wrap:wrap; color:var(--app-text-tertiary); font-size:11px; }
.ugsci-capabilities :is(.ant-tabs-nav,.qwenpaw-tabs-nav) { margin-bottom:20px; }
.ugsci-engine-tabs > :is(.ant-tabs-nav,.qwenpaw-tabs-nav) :is(.ant-tabs-tab,.qwenpaw-tabs-tab) { padding:8px 12px; border:1px solid var(--app-border-subtle); border-radius:9px; margin:0 8px 0 0; }
.ugsci-engine-tabs > :is(.ant-tabs-nav,.qwenpaw-tabs-nav) :is(.ant-tabs-tab-active,.qwenpaw-tabs-tab-active) { background:var(--app-accent-faint); border-color:var(--app-accent); }
.ugsci-engine-tabs > :is(.ant-tabs-nav,.qwenpaw-tabs-nav)::before { border:0; }
.ugsci-engine-tabs > :is(.ant-tabs-nav,.qwenpaw-tabs-nav) :is(.ant-tabs-ink-bar,.qwenpaw-tabs-ink-bar) { display:none; }
.ugsci-capability-detail-footer :is(.ant-btn-primary,.qwenpaw-btn-primary):not(:disabled) { color:var(--app-action-fg,#fff)!important; }
.ugsci-capability-advanced summary { cursor:pointer; padding:12px 0; font-weight:500; }
.ugsci-capability-card-title button:focus-visible { outline:2px solid var(--app-accent); outline-offset:3px; border-radius:4px; }
@media(max-width:680px) { .ugsci-capabilities { padding:16px; } .ugsci-capability-detail { padding:16px; } }
`;
