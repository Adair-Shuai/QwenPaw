/** Scoped to the expert library/settings; team and workflow styles stay intact. */
export const EXPERT_STYLES = `
.ugsci-expert-page>div:first-child{border-color:var(--app-border)!important;gap:12px;flex-wrap:wrap;}
.ugsci-expert-library button[class*="-btn-link"],.ugsci-expert-settings button[class*="-btn-link"]{color:var(--expert-primary)!important;}
@media(max-width:680px){.ugsci-expert-page{padding:16px!important;}}

.ugsci-expert-library,.ugsci-expert-settings{color:var(--app-text,var(--app-card-text));--expert-line:var(--app-border,var(--app-border-subtle));--expert-muted:var(--app-text-secondary,var(--app-card-muted));--expert-surface:var(--app-surface,var(--app-surface));--expert-subtle:var(--app-surface-subtle,var(--app-fill-faint));--expert-primary:var(--app-action-link,var(--app-accent));}
.ugsci-expert-filters{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 18px;}
.ugsci-expert-filter{font:inherit;font-size:13px;padding:6px 11px;border:1px solid transparent;border-radius:6px;background:transparent;color:var(--expert-muted);cursor:pointer;}
.ugsci-expert-filter[aria-pressed=true]{color:var(--expert-primary);background:color-mix(in srgb,var(--expert-primary) 9%,var(--expert-surface));border-color:color-mix(in srgb,var(--expert-primary) 25%,var(--expert-line));}
.ugsci-expert-filter small{font-size:11px;margin-left:6px;}
.ugsci-expert-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr));gap:14px;align-items:stretch;}
.ugsci-expert-card{width:100%;height:100%;border-radius:11px!important;border-color:var(--expert-line)!important;background:var(--expert-surface)!important;box-shadow:none!important;}
.ugsci-expert-card .ugsci-expert-card-top{display:flex;gap:10px;align-items:flex-start;min-width:0;}
.ugsci-expert-card .ugsci-expert-identity{flex:1;min-width:0;}
.ugsci-expert-name{display:block;border:0;background:none;padding:0;text-align:left;cursor:pointer;color:inherit;font:inherit;font-size:14px;font-weight:600;line-height:1.5;overflow-wrap:anywhere;}
.ugsci-expert-name:hover{text-decoration:underline;text-underline-offset:3px;}
.ugsci-expert-specialty{font-size:12px;color:var(--expert-muted);margin-top:3px;overflow-wrap:anywhere;}
.ugsci-expert-status{white-space:nowrap;font-size:11px;flex-shrink:0;}
.ugsci-expert-summary{font-size:13px;line-height:1.7;margin:18px 0 12px;min-height:44px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere;}
.ugsci-expert-tags{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;min-height:23px;font-size:12px;color:var(--expert-muted);}
.ugsci-expert-tag{font-size:11px;border-radius:4px;padding:2px 7px;background:color-mix(in srgb,var(--expert-primary) 8%,var(--expert-surface));color:var(--expert-primary);max-width:100%;overflow-wrap:anywhere;}
.ugsci-expert-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;border-top:1px solid var(--expert-line);padding-top:12px;margin-top:auto;}
.ugsci-expert-actions>button:first-child{margin-right:auto;color:var(--expert-muted);}
.ugsci-expert-library button[class*="-btn-primary"],.ugsci-expert-settings button[class*="-btn-primary"]{background:var(--app-action-bg,var(--app-accent))!important;border-color:var(--app-action-bg,var(--app-accent))!important;color:var(--app-action-fg,#fff)!important;box-shadow:none!important;}
.ugsci-expert-library button[class*="-btn-primary"]:disabled,.ugsci-expert-settings button[class*="-btn-primary"]:disabled{background:var(--expert-subtle)!important;border-color:var(--expert-line)!important;color:var(--expert-muted)!important;}
.ugsci-expert-settings [class*="-modal-content"]{padding:0!important;overflow:hidden;border:1px solid var(--expert-line);border-radius:11px!important;background:var(--expert-surface)!important;}
.ugsci-expert-settings [class*="-modal-header"]{margin:0!important;padding:18px 24px;border-bottom:1px solid var(--expert-line);background:var(--expert-surface)!important;}
.ugsci-expert-settings [class*="-modal-body"]{padding:0!important;}
.ugsci-expert-settings-identity{display:flex;align-items:center;gap:12px;padding:18px 24px;border-bottom:1px solid var(--expert-line);}
.ugsci-expert-settings-identity strong{font-size:15px;font-weight:500;overflow-wrap:anywhere;}
.ugsci-expert-settings-identity small{display:block;color:var(--expert-muted);margin-top:4px;overflow-wrap:anywhere;}
.ugsci-expert-settings .ugsci-settings-tabs>[class*="-tabs-nav"]{background:var(--expert-subtle);width:165px;flex-shrink:0;padding:14px 8px;}
.ugsci-expert-settings .ugsci-settings-tabs>[class*="-tabs-nav"] :is(.ant-tabs-tab,.qwenpaw-tabs-tab){margin:3px 0!important;padding:10px 12px!important;border-radius:6px;}
.ugsci-expert-settings .ugsci-settings-tabs>[class*="-tabs-nav"] [class*="-tabs-tab-active"]{background:color-mix(in srgb,var(--expert-primary) 9%,var(--expert-surface));}
.ugsci-expert-settings .ugsci-settings-tabs>[class*="-tabs-content-holder"]{min-width:0;}
.ugsci-expert-settings .ugsci-settings-tabs [class*="-tabs-tabpane"]{padding:24px!important;min-height:400px;}
.ugsci-expert-settings h3{font-size:17px;font-weight:500;margin:0 0 6px;}
.ugsci-expert-settings .ugsci-settings-intro{font-size:12px;color:var(--expert-muted);margin:0 0 22px;}
.ugsci-expert-settings-grid,.ugsci-config-pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;min-width:0;}
.ugsci-expert-settings-grid label{display:flex;flex-direction:column;gap:7px;font-size:13px;min-width:0;}
.ugsci-expert-settings-grid .full{grid-column:1/-1;}
.ugsci-expert-settings .ugsci-config-section{border-bottom:1px solid var(--expert-line);margin-bottom:16px;}
.ugsci-expert-settings .ugsci-config-section>summary{font-size:14px;cursor:pointer;padding:14px 0;}
.ugsci-expert-settings .ugsci-settings-save{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;border-top:1px solid var(--expert-line);margin-top:24px;padding-top:16px;}
.ugsci-expert-settings .ugsci-settings-footer{padding:12px 24px;border-top:1px solid var(--expert-line);color:var(--expert-muted);font-size:12px;display:flex;justify-content:space-between;align-items:center;gap:12px;}
.ugsci-expert-settings [class*="-space"]{max-width:100%;flex-wrap:wrap;}
.ugsci-expert-settings input,.ugsci-expert-settings textarea{max-width:100%;}
.ugsci-expert-settings [class*="-list-item"]{flex-wrap:wrap;gap:8px;}
.ugsci-expert-settings [class*="-list-item-action"]{margin-inline-start:0;}
@media(max-width:680px){.ugsci-expert-settings .ugsci-settings-tabs [class*="-tabs-ink-bar"]{display:none;}.ugsci-expert-settings .ugsci-settings-tabs :is(.ant-tabs-tab-active,.qwenpaw-tabs-tab-active){box-shadow:inset 0 0 0 1px var(--expert-primary);background:color-mix(in srgb,var(--expert-primary) 12%,var(--expert-surface));}.ugsci-expert-settings .ugsci-settings-tabs>[class*="-tabs-nav"]{width:100%;padding:8px;}.ugsci-expert-settings .ugsci-settings-tabs>[class*="-tabs-nav"] [class*="-tabs-nav-list"]{flex-wrap:wrap;transform:none!important;width:100%;}.ugsci-expert-settings .ugsci-settings-tabs>[class*="-tabs-nav"] :is(.ant-tabs-tab,.qwenpaw-tabs-tab){margin:0!important;padding:8px 10px!important;}.ugsci-expert-settings .ugsci-settings-tabs [class*="-tabs-tabpane"]{padding:18px!important;min-height:0;}.ugsci-expert-settings-grid,.ugsci-config-pair{grid-template-columns:1fr!important;}.ugsci-expert-settings-identity{padding:16px 18px;}.ugsci-expert-settings [class*="-modal-header"]{padding-inline:18px;}.ugsci-expert-settings{max-width:calc(100vw - 16px)!important;}.ugsci-expert-settings .ugsci-settings-footer{padding-inline:18px;}}
`;
