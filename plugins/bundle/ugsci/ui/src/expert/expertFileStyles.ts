export const EXPERT_FILE_STYLES = `
.ugsci-file-list-toolbar,.ugsci-file-list-toolbar>div{display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:space-between;}
.ugsci-file-list-toolbar{margin-bottom:16px;font-size:13px;}
.ugsci-expert-files small{color:var(--expert-muted);font-size:12px;}
.ugsci-files-expanded [class*="-modal-content"]{height:calc(100dvh - 48px);max-height:1000px;}
.ugsci-files-expanded .ugsci-expert-settings-identity{padding:12px 24px;}
.ugsci-files-expanded .ugsci-settings-tabs>[class*="-tabs-nav"]{display:none;}
.ugsci-files-expanded .ugsci-settings-tabs>[class*="-tabs-content-holder"]{border:0;margin:0;}
.ugsci-files-expanded .ugsci-settings-tabs [class*="-tabs-tabpane"]{padding:0!important;overflow:hidden;scrollbar-gutter:auto;}
.ugsci-files-expanded .ugsci-settings-files,.ugsci-files-expanded .ugsci-settings-files>div{height:100%;display:flex;flex-direction:column;min-height:0;}
.ugsci-files-expanded .ugsci-settings-files>div>h3,.ugsci-files-expanded .ugsci-settings-files>div>.ugsci-settings-intro{display:none;}
.ugsci-file-workbench{display:flex;flex-direction:column;flex:1;min-height:0;min-width:0;}
.ugsci-file-workbench-toolbar{display:flex;align-items:center;gap:12px;padding:12px 24px;border-bottom:1px solid var(--expert-line);flex-shrink:0;flex-wrap:wrap;}
.ugsci-file-workbench-title{font-size:13px;color:var(--expert-muted);margin-right:auto;}
.ugsci-file-workbench-body{display:grid;grid-template-columns:230px minmax(0,1fr);flex:1;min-height:0;}
.ugsci-file-nav{background:var(--expert-subtle);border-right:1px solid var(--expert-line);min-height:0;display:flex;flex-direction:column;padding:16px 10px 10px;}
.ugsci-file-nav-heading{display:flex;justify-content:space-between;align-items:center;padding:0 8px 14px;font-size:12px;flex-shrink:0;}
.ugsci-file-nav-heading strong{font-weight:500;color:var(--expert-muted);}
.ugsci-file-nav nav{overflow:auto;flex:1;min-height:0;}
.ugsci-file-nav-item{display:block;width:100%;padding:12px 10px;margin:0 0 4px;text-align:left;border:1px solid transparent;background:transparent;border-radius:8px;font:inherit;font-size:13px;color:inherit;cursor:pointer;overflow-wrap:anywhere;}
.ugsci-file-nav-item>span{display:flex;align-items:start;justify-content:space-between;gap:6px;font-weight:500;}
.ugsci-file-nav-item>span>small{font-weight:400;font-size:10px;flex-shrink:0;line-height:20px;}
.ugsci-file-nav-item>small{display:block;margin-top:5px;font-size:11px;}
.ugsci-file-nav-item:hover{background:var(--expert-surface);}
.ugsci-file-nav-item[aria-current=page]{background:var(--expert-surface);border-color:var(--expert-line);box-shadow:inset 3px 0 var(--expert-primary);}
.ugsci-file-nav-item:focus-visible{outline:2px solid var(--expert-primary);outline-offset:-2px;}
.ugsci-file-nav>p{font-size:11px;line-height:1.6;color:var(--expert-muted);padding:14px 8px 0;margin:0;flex-shrink:0;}
.ugsci-file-document{display:flex;flex-direction:column;min-width:0;min-height:0;overflow:hidden;}
.ugsci-file-document-heading{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:22px 28px 16px;flex-shrink:0;}
.ugsci-file-document-heading h3{font-size:18px;margin:0!important;overflow-wrap:anywhere;}
.ugsci-file-document-heading p{font-size:12px;color:var(--expert-muted);margin:6px 0 0;}
.ugsci-file-mount{display:flex;align-items:center;gap:10px;font-size:12px;color:var(--expert-muted);}
.ugsci-file-name{display:flex;align-items:center;gap:10px;padding:0 28px 16px;font-size:12px;flex-wrap:wrap;}
.ugsci-file-name input{width:250px;}
.ugsci-file-viewbar{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:0 28px 16px;flex-shrink:0;}
.ugsci-file-editors{display:grid;grid-template-columns:minmax(0,1fr);flex:1;min-height:0;border-top:1px solid var(--expert-line);}
.ugsci-file-view-split{grid-template-columns:minmax(0,1fr) minmax(0,1fr);}
.ugsci-file-source{display:flex;min-height:0;min-width:0;background:var(--expert-subtle);}
.ugsci-file-source textarea{display:block;flex:1;width:100%;height:100%!important;min-height:0!important;resize:none;border:0;border-radius:0;box-shadow:none;padding:24px 28px;background:transparent;color:inherit;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:13px;line-height:1.9;tab-size:2;}
.ugsci-file-source textarea:focus-visible{box-shadow:inset 0 0 0 2px var(--expert-primary);}
.ugsci-file-preview{overflow:auto;min-width:0;min-height:0;padding:24px 32px;line-height:1.85;font-size:14px;overflow-wrap:anywhere;white-space:pre-wrap;}
.ugsci-file-view-split .ugsci-file-preview{border-left:1px solid var(--expert-line);}
.ugsci-file-preview>*{white-space:normal;}
.ugsci-file-preview h1{font-size:24px;line-height:1.4;margin:0 0 22px;}
.ugsci-file-preview h2{font-size:20px;margin:28px 0 14px;}
.ugsci-file-preview h3{font-size:16px;font-weight:600;margin:24px 0 12px;}
.ugsci-file-preview p{margin:0 0 14px;}
.ugsci-file-preview ul,.ugsci-file-preview ol{padding-left:24px;}
.ugsci-file-preview blockquote{border-left:3px solid var(--expert-line);padding:4px 16px;margin:16px 0;color:var(--expert-muted);}
.ugsci-file-preview pre{overflow:auto;padding:16px;border-radius:6px;background:var(--expert-subtle);white-space:pre;}
.ugsci-file-preview img{max-width:100%;}
.ugsci-file-preview table{border-collapse:collapse;display:block;max-width:100%;overflow:auto;}
.ugsci-file-preview td,.ugsci-file-preview th{padding:6px 10px;border:1px solid var(--expert-line);}
.ugsci-file-document-footer{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px 28px;border-top:1px solid var(--expert-line);flex-shrink:0;}
.ugsci-file-document-footer>span{font-size:11px;color:var(--expert-muted);}
.ugsci-file-feedback{display:flex;flex:1;min-height:0;align-items:center;justify-content:center;padding:24px;}
@media(max-width:900px){.ugsci-file-workbench-body{grid-template-columns:190px minmax(0,1fr);}.ugsci-file-document-heading{padding:18px;}.ugsci-file-viewbar,.ugsci-file-name{padding:0 18px 14px;}.ugsci-file-source textarea,.ugsci-file-preview{padding:18px;}}
@media(max-width:680px){.ugsci-files-expanded [class*="-modal-content"]{height:calc(100dvh - 24px);}.ugsci-files-expanded .ugsci-expert-settings-identity{padding:10px 14px;}.ugsci-file-workbench-toolbar{padding:10px 14px;gap:8px;}.ugsci-file-workbench-title{display:none;}.ugsci-file-workbench-toolbar>button:last-child{margin-left:auto;}.ugsci-file-workbench-body{grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr);}.ugsci-file-nav{padding:8px;border-right:0;border-bottom:1px solid var(--expert-line);}.ugsci-file-nav-heading,.ugsci-file-nav>p{display:none;}.ugsci-file-nav nav{display:flex;gap:6px;max-height:80px;}.ugsci-file-nav-item{width:auto;min-width:155px;flex-shrink:0;padding:8px;margin:0;}.ugsci-file-nav-item>small{display:none;}.ugsci-file-nav-item[aria-current=page]{box-shadow:inset 0 -2px var(--expert-primary);}.ugsci-file-document-heading{padding:12px 14px;}.ugsci-file-document-heading h3{font-size:16px;}.ugsci-file-viewbar{padding:0 14px 12px;}.ugsci-file-view-split{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(90px,1fr) minmax(90px,1fr);}.ugsci-file-view-split .ugsci-file-preview{border-left:0;border-top:1px solid var(--expert-line);}.ugsci-file-document-footer{padding:10px 14px;flex-wrap:wrap;}.ugsci-file-name{padding:0 14px 12px;}.ugsci-file-name input{width:100%;}.ugsci-file-source textarea,.ugsci-file-preview{padding:14px;}.ugsci-file-workbench :is(button,[class*="-segmented-item"]){min-height:36px;}.ugsci-file-workbench button[role=switch]{min-height:16px;}}
`;
