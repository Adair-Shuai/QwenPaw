(()=>{var uh=window.QwenPaw.host.React,pf={minus:"M4 10h12",plus:"M4 10h12M10 4v12",network:"M2 4h4v4H2zM2 12h4v4H2zM14 8h4v4h-4zM6 6h3l3 4h2M6 14h3l3-4",field:"M2 3.5h4v4H2zM2 12.5h4v4H2zM14 8h4v4h-4zM6 5.5h3l3 4.5h2M6 14.5h3l3-4.5",station:"M2 16.5h16M3 16V9l5-3v3l5-3v10M15 16l.6-13h2l.5 13M5.5 12h1M10 12h1",file:"M5 2.5h7l4 4v11H5zM12 2.5v4h4M7.5 11h6M7.5 14h4",folder:"M2.5 5h5l2 2H17.5v9h-15z",register:"M10 5C8 3.5 5 3.5 2.5 4.5v11c2.7-1 5.3-1 7.5.5 2.2-1.5 4.8-1.5 7.5-.5v-11C15 3.5 12 3.5 10 5zM10 5v11",upload:"M10 13V3M6 7l4-4 4 4M3 14v3h14v-3",download:"M10 3v9M6 8l4 4 4-4M3 14v3h14v-3",table:"M3 3h14v14H3zM3 8h14M8 8v9",adjustments:"M3 5h14M3 10h14M3 15h14M7 3v4M13 8v4M8 13v4",diagram:"M2.5 3.5h15v13h-15zM5 12l3-4 3 2 4-4",cube:"M10 2l7.5 4.3v7.5L10 18l-7.5-4.2V6.3zM2.8 6.5l7.2 4 7.2-4M10 10.5V18",expand:"M3 8V3h5M12 3h5v5M17 12v5h-5M8 17H3v-5",collapse:"M7 3v4H3M17 7h-4V3M13 17v-4h4M3 13h4v4",properties:"M3 3h14v14H3zM11.5 3v14M5.5 7h3M5.5 10h3",search:"M13.5 8a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0zM12 12l5 5",time:"M17.5 10a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0zM10 5.5V10l3 1.5",arrow:"M5 15 15 5M7 5h8v8"};function je({name:i}){return uh.createElement("svg",{className:"sn-icon",viewBox:"0 0 20 20",fill:"none",stroke:"currentColor",strokeWidth:"1.55",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true"},uh.createElement("path",{d:pf[i]}))}var dh={},hl={},ul=34,Fs=10,dl=13;function ph(i){return new Function("d","return {"+i.map(function(e,t){return JSON.stringify(e)+": d["+t+'] || ""'}).join(",")+"}")}function mf(i,e){var t=ph(i);return function(n,s){return e(t(n),s,i)}}function fh(i){var e=Object.create(null),t=[];return i.forEach(function(n){for(var s in n)s in e||t.push(e[s]=s)}),t}function Kt(i,e){var t=i+"",n=t.length;return n<e?new Array(e-n+1).join(0)+t:t}function gf(i){return i<0?"-"+Kt(-i,6):i>9999?"+"+Kt(i,6):Kt(i,4)}function xf(i){var e=i.getUTCHours(),t=i.getUTCMinutes(),n=i.getUTCSeconds(),s=i.getUTCMilliseconds();return isNaN(i)?"Invalid Date":gf(i.getUTCFullYear(),4)+"-"+Kt(i.getUTCMonth()+1,2)+"-"+Kt(i.getUTCDate(),2)+(s?"T"+Kt(e,2)+":"+Kt(t,2)+":"+Kt(n,2)+"."+Kt(s,3)+"Z":n?"T"+Kt(e,2)+":"+Kt(t,2)+":"+Kt(n,2)+"Z":t||e?"T"+Kt(e,2)+":"+Kt(t,2)+"Z":"")}function mh(i){var e=new RegExp('["'+i+`
\r]`),t=i.charCodeAt(0);function n(f,h){var d,_,y=s(f,function(x,p){if(d)return d(x,p-1);_=x,d=h?mf(x,h):ph(x)});return y.columns=_||[],y}function s(f,h){var d=[],_=f.length,y=0,x=0,p,C=_<=0,w=!1;f.charCodeAt(_-1)===Fs&&--_,f.charCodeAt(_-1)===dl&&--_;function b(){if(C)return hl;if(w)return w=!1,dh;var v,M=y,m;if(f.charCodeAt(M)===ul){for(;y++<_&&f.charCodeAt(y)!==ul||f.charCodeAt(++y)===ul;);return(v=y)>=_?C=!0:(m=f.charCodeAt(y++))===Fs?w=!0:m===dl&&(w=!0,f.charCodeAt(y)===Fs&&++y),f.slice(M+1,v-1).replace(/""/g,'"')}for(;y<_;){if((m=f.charCodeAt(v=y++))===Fs)w=!0;else if(m===dl)w=!0,f.charCodeAt(y)===Fs&&++y;else if(m!==t)continue;return f.slice(M,v)}return C=!0,f.slice(M,_)}for(;(p=b())!==hl;){for(var S=[];p!==dh&&p!==hl;)S.push(p),p=b();h&&(S=h(S,x++))==null||d.push(S)}return d}function r(f,h){return f.map(function(d){return h.map(function(_){return u(d[_])}).join(i)})}function a(f,h){return h==null&&(h=fh(f)),[h.map(u).join(i)].concat(r(f,h)).join(`
`)}function o(f,h){return h==null&&(h=fh(f)),r(f,h).join(`
`)}function c(f){return f.map(l).join(`
`)}function l(f){return f.map(u).join(i)}function u(f){return f==null?"":f instanceof Date?xf(f):e.test(f+="")?'"'+f.replace(/"/g,'""')+'"':f}return{parse:n,parseRows:s,format:a,formatBody:o,formatRows:c,formatRow:l,formatValue:u}}var Di=mh(","),_f=Di.parse,fl=Di.parseRows,vf=Di.format,yf=Di.formatBody,pl=Di.formatRows,bf=Di.formatRow,Mf=Di.formatValue;var Ht={pressure:{name:"\u8282\u70B9\u7EDD\u538B",unit:"MPa(a)",field:"pressureMPa"},temperature:{name:"\u8282\u70B9\u6E29\u5EA6",unit:"\xB0C",field:"temperatureC"},flow:{name:"\u7BA1\u6BB5\u6D41\u91CF",unit:"\u4E07\u6807\u65B9/\u65E5",field:"flow10kSm3d"},differential:{name:"\u7BA1\u6BB5\u538B\u5DEE",unit:"MPa"}},ml=["\u4F4D\u53F7","\u5BF9\u8C61","\u6D4B\u91CF\u91CF","\u65F6\u95F4","\u5B9E\u6D4B\u503C","\u5355\u4F4D","\u8D28\u91CF","\u7528\u9014","\u6C14\u91CF\u6807\u51B5"],Sf=/^[A-Za-z0-9][A-Za-z0-9_.-]{0,39}$/,gl=i=>typeof i=="string"&&/^\d{4}-\d\d-\d\dT\d\d:\d\d(?::\d\d(?:\.\d{1,3})?)?(?:Z|[+-]\d\d:\d\d)$/.test(i)?Date.parse(i):NaN;function Os(i){let e=i.sensors??[];if(!Array.isArray(e))throw Error("\u6D4B\u70B9\u6E05\u5355\u987B\u4E3A\u6570\u7EC4");let t=new Set(i.nodes.map(r=>r.id)),n=new Set(i.pipes.map(r=>r.id)),s=new Map;for(let r of e){if(!r||typeof r.tag!="string"||!Sf.test(r.tag)||s.has(r.tag)||r.tag in Object.prototype||!Object.hasOwn(Ht,r.kind))throw Error("\u6D4B\u70B9\u4F4D\u53F7\u6216\u6D4B\u91CF\u91CF\u6709\u8BEF");if(!(r.kind==="flow"||r.kind==="differential"?n:t).has(r.target))throw Error(r.tag+" \u7684\u7ED1\u5B9A\u5BF9\u8C61\u6709\u8BEF");if(r.role!==void 0&&!["\u6821\u6838","\u8FB9\u754C"].includes(r.role))throw Error(r.tag+" \u7684\u7528\u9014\u6709\u8BEF");for(let[a,o]of[[r.diagram,2],[r.enuM,3]])if(a!==void 0&&!(Array.isArray(a)&&a.length===o&&a.every(Number.isFinite)))throw Error(r.tag+" \u7684\u6D4B\u70B9\u5750\u6807\u6709\u8BEF");s.set(r.tag,r)}for(let r of i.cases){if(r.time!==void 0&&!Number.isFinite(gl(r.time)))throw Error("\u5DE5\u51B5\u65F6\u95F4\u987B\u91C7\u7528\u5E26\u65F6\u533A\u7684 ISO \u65F6\u95F4");if(r.observations!==void 0&&(!r.time||!r.observations||typeof r.observations!="object"||Array.isArray(r.observations)))throw Error("\u5B9E\u6D4B\u8BB0\u5F55\u5FC5\u987B\u5173\u8054\u5E26\u65F6\u95F4\u7684\u5DE5\u51B5");for(let[a,o]of Object.entries(r.observations??{})){if(!s.has(a)||!o||!["\u6709\u6548","\u53EF\u7591","\u65E0\u6548"].includes(o.quality)||!Number.isFinite(o.value)||o.source!==void 0&&typeof o.source!="string")throw Error("\u5B9E\u6D4B\u503C\u6216\u8D28\u91CF\u7801\u6709\u8BEF\uFF1A"+a);if(s.get(a).kind==="pressure"&&o.value<=0)throw Error(a+" \u7684\u7EDD\u538B\u987B\u4E3A\u6B63\u6570")}if(r.temperatureC!==void 0&&(!r.temperatureC||typeof r.temperatureC!="object"||Array.isArray(r.temperatureC)||Object.entries(r.temperatureC).some(([a,o])=>!t.has(a)||!Number.isFinite(o))))throw Error("\u6A21\u578B\u8282\u70B9\u6E29\u5EA6\u6709\u8BEF")}}function Bs(i,e,t){let n=e.observations?.[t.tag],s=t.kind==="differential"?i.pipes.find(o=>o.id===t.target):null,r=s?e.pressureMPa[s.from]-e.pressureMPa[s.to]:e[Ht[t.kind].field]?.[t.target],a=n?Number.isFinite(r)?n.quality!=="\u6709\u6548"?n.quality:t.role==="\u8FB9\u754C"?"\u8FB9\u754C\u91CF":"\u53EF\u6BD4":"\u7F3A\u6A21\u578B\u503C":"\u7F3A\u5B9E\u6D4B";return{predicted:r,measured:n,status:a,delta:a==="\u53EF\u6BD4"?r-n.value:null}}function xl(i,e=!1){let t=[e?[...ml,"\u6A21\u578B\u503C","\u504F\u5DEE\uFF08\u6A21\u578B\u2212\u5B9E\u6D4B\uFF09","\u72B6\u6001","\u5B9E\u6D4B\u6765\u6E90"]:ml];for(let n of i.cases)for(let s of i.sensors??[]){let r=Ht[s.kind],a=Bs(i,n,s),o=[s.tag,s.target,r.name,n.time??"",e?a.measured?.value??"":"",r.unit,a.measured?.quality??"\u6709\u6548",s.role??"\u6821\u6838",s.kind==="flow"?i.standard:""];t.push(e?[...o,a.predicted??"",a.delta===null?"":Number(a.delta.toPrecision(12)),a.status,a.measured?.source??""]:o)}if(t.length===1&&!e){let n=i.cases[0];t.push(["PT-001",i.nodes[0].id,Ht.pressure.name,n.time??"","","MPa(a)","\u6709\u6548","\u6821\u6838",""])}return"\uFEFF"+pl(t)}function gh(i,e,t="\u5BFC\u5165 CSV"){let[n,...s]=fl(e.replace(/^\uFEFF/,"")),r=ml.map(h=>n?.indexOf(h)??-1);if(r.includes(-1))throw Error("\u8868\u5934\u4E0D\u5B8C\u6574\uFF0C\u8BF7\u4F7F\u7528\u6D4B\u70B9\u6A21\u677F");let a=i.cases.map(h=>({...h,observations:{...h.observations}})),o=new Map;for(let h of a){if(!h.time)continue;let d=gl(h.time);if(o.has(d))throw Error("\u591A\u4E2A\u5DE5\u51B5\u5171\u7528\u540C\u4E00\u65F6\u95F4\uFF0C\u8BF7\u5206\u5F00\u5BFC\u5165\u6A21\u578B");o.set(d,h)}if(!o.size)throw Error("\u8BF7\u5148\u5728\u6A21\u578B cases[].time \u586B\u5199\u5E26\u65F6\u533A\u7684\u5DE5\u51B5\u65F6\u95F4");let c=new Map((i.sensors??[]).map(h=>[h.tag,h])),l=new Set,u=0;for(let[h,d]of s.entries()){if(d.every(V=>!V.trim()))continue;let[_,y,x,p,C,w,b,S,v]=r.map(V=>(d[V]??"").trim()),M=V=>{throw Error("\u7B2C "+(h+2)+" \u884C\uFF1A"+V)},m=Object.keys(Ht).find(V=>Ht[V].name===x);(!m||Ht[m].unit!==w)&&M("\u6D4B\u91CF\u91CF\u548C\u5355\u4F4D\u4E0D\u5339\u914D"),m==="flow"&&v!==i.standard&&M("\u6C14\u91CF\u6807\u51B5\u4E0E\u6A21\u578B\u4E0D\u7B26");let T=gl(p),P=o.get(T);P||M("\u627E\u4E0D\u5230\u540C\u4E00\u65F6\u523B\u7684\u6A21\u578B\u5DE5\u51B5");let I=T+"|"+_;l.has(I)&&M("\u540C\u4E00\u65F6\u523B\u7684\u4F4D\u53F7\u91CD\u590D"),l.add(I);let L={tag:_,target:y,kind:m,role:S||"\u6821\u6838"},N=c.get(_);N&&(N.target!==y||N.kind!==m||(N.role??"\u6821\u6838")!==L.role)&&M("\u4F4D\u53F7\u5DF2\u6709\u4E0D\u540C\u7ED1\u5B9A\u6216\u7528\u9014"),c.set(_,N??L),C&&((!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(C)||!Number.isFinite(Number(C)))&&M("\u5B9E\u6D4B\u503C\u4E0D\u662F\u6709\u9650\u6570\u5B57"),P.observations[_]={value:Number(C),quality:b||"\u6709\u6548",source:t}),u++}if(!u)throw Error("\u6587\u4EF6\u6CA1\u6709\u6D4B\u70B9\u8BB0\u5F55");for(let h of a)Object.keys(h.observations).length||delete h.observations;let f={...i,sensors:[...c.values()],cases:a};return Os(f),f}function zr(i,e,t,n){let s=["2026-01-15T08:00:00+08:00","2026-07-15T08:00:00+08:00"];return{sensors:i.map(([r,a,o,c="\u6821\u6838"])=>({tag:r,target:a,kind:o,role:c})),cases:n.map((r,a)=>({...r,time:s[a],temperatureC:t[a],observations:Object.fromEntries(i.map(([o],c)=>[o,{value:e[a][c],quality:"\u6709\u6548",source:"\u5408\u6210\u793A\u4F8B"}]))}))}}var sn=window.QwenPaw.host.React,wf={\u538B\u529B\u8868:"pressure",\u538B\u529B\u53D8\u9001\u5668:"pressure",\u6E29\u5EA6\u8BA1:"temperature",\u6E29\u5EA6\u53D8\u9001\u5668:"temperature",\u5DEE\u538B\u53D8\u9001\u5668:"differential",\u6D41\u91CF\u8BA1:"flow",\u6D41\u91CF\u53D8\u9001\u5668:"flow"};function xh({fields:i,source:e,model:t,apply:n}){let s=wf[i.TYPE??i.\u7C7B\u578B],r=(i.TYPE??i.\u7C7B\u578B)==="\u7AD9\u5185\u7BA1\u7EBF",a=/^DN\s*(\d+(?:\.\d+)?)$/i.exec((i.\u7BA1\u5F84??"").trim()),[o,c]=sn.useState(""),[l,u]=sn.useState(""),[f,h]=sn.useState(i.\u4F4D\u53F7??"");if(!s&&!(r&&a&&Number(a[1])>0))return null;let d=r||s==="flow"||s==="differential"?t.pipes:t.nodes;function _(){if(o)try{if(r)n({...t,pipes:t.pipes.map(y=>y.id===o?{...y,dn:Number(a[1]),ezwalker:e}:y)});else{let y=(t.sensors??[]).find(C=>C.tag===f);if(y&&(y.target!==o||y.kind!==s))throw Error("\u8BE5\u4F4D\u53F7\u5DF2\u7ED1\u5B9A\u5230\u5176\u4ED6\u4F4D\u7F6E\u6216\u6D4B\u91CF\u91CF");let x={...y,tag:f,target:o,kind:s,role:y?.role??"\u6821\u6838",ezwalker:e},p={...t,sensors:[...(t.sensors??[]).filter(C=>C.tag!==f),x]};Os(p),n(p)}u("\u5DF2\u5E94\u7528\u5230 "+o+"\uFF0C\u53EF\u4ECE\u7BA1\u7F51\u56FE\u9875\u5BFC\u51FA\u6A21\u578B\u4FDD\u5B58\u3002")}catch(y){u(y.message)}}return sn.createElement("details",null,sn.createElement("summary",null,r?"\u5F15\u7528\u6E90\u7BA1\u5F84":"\u7ED1\u5B9A\u5230\u6D4B\u70B9\u5BF9\u6BD4"),sn.createElement("p",null,"\u76EE\u6807\u7BA1\u7F51\u3000",t.name,"\u3000",r?"DN "+a[1]:Ht[s].name),sn.createElement("div",{className:"sn-ez-controls"},!r&&sn.createElement("input",{"aria-label":"\u62DF\u5408\u6D4B\u70B9\u4F4D\u53F7",value:f,onChange:y=>h(y.target.value)}),sn.createElement("select",{"aria-label":"\u76EE\u6807\u7BA1\u7F51\u5BF9\u8C61",value:o,onChange:y=>c(y.target.value)},sn.createElement("option",{value:""},"\u9009\u62E9\u5BF9\u5E94\u5BF9\u8C61"),d.map(y=>sn.createElement("option",{key:y.id,value:y.id},y.id,"\u3000",y.name??y.from+" \u2192 "+y.to))),sn.createElement("button",{disabled:!o,onClick:_},r?"\u91C7\u7528\u7BA1\u5F84":"\u767B\u8BB0\u6D4B\u70B9")),l&&sn.createElement("p",{role:"status"},l))}var Pn={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},In={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},$h=0,tc=1,Qh=2;var br=1,eu=2,As=3,ni=0,Jt=1,vn=2,Hn=0,Vi=1,nc=2,ic=3,sc=4,tu=5;var Mi=100,nu=101,iu=102,su=103,ru=104,au=200,ou=201,lu=202,cu=203,fa=204,pa=205,hu=206,uu=207,du=208,fu=209,pu=210,mu=211,gu=212,xu=213,_u=214,ma=0,ga=1,xa=2,Hi=3,_a=4,va=5,ya=6,ba=7,rc=0,vu=1,yu=2,Rn=0,ac=1,oc=2,lc=3,cc=4,hc=5,uc=6,dc=7;var fc=300,Ai=301,Ji=302,no=303,io=304,Mr=306,Ma=1e3,Fn=1001,Sa=1002,kt=1003,bu=1004;var Sr=1005;var zt=1006,so=1007;var Ci=1008;var Qt=1009,pc=1010,mc=1011,Cs=1012,ro=1013,Ln=1014,yn=1015,Gn=1016,ao=1017,oo=1018,Ps=1020,gc=35902,xc=35899,_c=1021,vc=1022,bn=1023,On=1026,Pi=1027,Is=1028,lo=1029,Ii=1030,co=1031;var ho=1033,wr=33776,Tr=33777,Er=33778,Ar=33779,uo=35840,fo=35841,po=35842,mo=35843,go=36196,xo=37492,_o=37496,vo=37488,yo=37489,Cr=37490,bo=37491,Mo=37808,So=37809,wo=37810,To=37811,Eo=37812,Ao=37813,Co=37814,Po=37815,Io=37816,Ro=37817,Lo=37818,No=37819,Do=37820,Uo=37821,Fo=36492,Oo=36494,Bo=36495,ko=36283,zo=36284,Pr=36285,Vo=36286;var Js=2300,wa=2301,da=2302,Wl=2303,Xl=2400,ql=2401,Yl=2402;var Mu=3200;var Ho=0,Su=1,Nn="",on="srgb",Ks="srgb-linear",$s="linear",pt="srgb";var ki=7680;var Zl=519,wu=512,Tu=513,Eu=514,Go=515,Au=516,Cu=517,Wo=518,Pu=519,Ta=35044;var yc="300 es",An=2e3,xs=2001;function Tf(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Ef(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function Qs(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Iu(){let i=Qs("canvas");return i.style.display="block",i}var _h={},_s=null;function er(...i){let e="THREE."+i.shift();_s?_s("log",e,...i):console.log(e,...i)}function Ru(i){let e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function qe(...i){i=Ru(i);let e="THREE."+i.shift();if(_s)_s("warn",e,...i);else{let t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function Je(...i){i=Ru(i);let e="THREE."+i.shift();if(_s)_s("error",e,...i);else{let t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function zi(...i){let e=i.join(" ");e in _h||(_h[e]=!0,qe(...i))}function Lu(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var Nu={[ma]:ga,[xa]:ya,[_a]:ba,[Hi]:va,[ga]:ma,[ya]:xa,[ba]:_a,[va]:Hi},Cn=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let s=n[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}},Gt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],vh=1234567,qs=Math.PI/180,vs=180/Math.PI;function ei(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Gt[i&255]+Gt[i>>8&255]+Gt[i>>16&255]+Gt[i>>24&255]+"-"+Gt[e&255]+Gt[e>>8&255]+"-"+Gt[e>>16&15|64]+Gt[e>>24&255]+"-"+Gt[t&63|128]+Gt[t>>8&255]+"-"+Gt[t>>16&255]+Gt[t>>24&255]+Gt[n&255]+Gt[n>>8&255]+Gt[n>>16&255]+Gt[n>>24&255]).toLowerCase()}function rt(i,e,t){return Math.max(e,Math.min(t,i))}function bc(i,e){return(i%e+e)%e}function Af(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function Cf(i,e,t){return i!==e?(t-i)/(e-i):0}function Ys(i,e,t){return(1-t)*i+t*e}function Pf(i,e,t,n){return Ys(i,e,1-Math.exp(-t*n))}function If(i,e=1){return e-Math.abs(bc(i,e*2)-e)}function Rf(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function Lf(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function Nf(i,e){return i+Math.floor(Math.random()*(e-i+1))}function Df(i,e){return i+Math.random()*(e-i)}function Uf(i){return i*(.5-Math.random())}function Ff(i){i!==void 0&&(vh=i);let e=vh+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Of(i){return i*qs}function Bf(i){return i*vs}function kf(i){return(i&i-1)===0&&i!==0}function zf(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function Vf(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Hf(i,e,t,n,s){let r=Math.cos,a=Math.sin,o=r(t/2),c=a(t/2),l=r((e+n)/2),u=a((e+n)/2),f=r((e-n)/2),h=a((e-n)/2),d=r((n-e)/2),_=a((n-e)/2);switch(s){case"XYX":i.set(o*u,c*f,c*h,o*l);break;case"YZY":i.set(c*h,o*u,c*f,o*l);break;case"ZXZ":i.set(c*f,c*h,o*u,o*l);break;case"XZX":i.set(o*u,c*_,c*d,o*l);break;case"YXY":i.set(c*d,o*u,c*_,o*l);break;case"ZYZ":i.set(c*_,c*d,o*u,o*l);break;default:qe("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function En(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function gt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var Ir={DEG2RAD:qs,RAD2DEG:vs,generateUUID:ei,clamp:rt,euclideanModulo:bc,mapLinear:Af,inverseLerp:Cf,lerp:Ys,damp:Pf,pingpong:If,smoothstep:Rf,smootherstep:Lf,randInt:Nf,randFloat:Df,randFloatSpread:Uf,seededRandom:Ff,degToRad:Of,radToDeg:Bf,isPowerOfTwo:kf,ceilPowerOfTwo:zf,floorPowerOfTwo:Vf,setQuaternionFromProperEuler:Hf,normalize:gt,denormalize:En},Re=class i{static{i.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=rt(this.x,e.x,t.x),this.y=rt(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=rt(this.x,e,t),this.y=rt(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(rt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(rt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},ln=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let c=n[s+0],l=n[s+1],u=n[s+2],f=n[s+3],h=r[a+0],d=r[a+1],_=r[a+2],y=r[a+3];if(f!==y||c!==h||l!==d||u!==_){let x=c*h+l*d+u*_+f*y;x<0&&(h=-h,d=-d,_=-_,y=-y,x=-x);let p=1-o;if(x<.9995){let C=Math.acos(x),w=Math.sin(C);p=Math.sin(p*C)/w,o=Math.sin(o*C)/w,c=c*p+h*o,l=l*p+d*o,u=u*p+_*o,f=f*p+y*o}else{c=c*p+h*o,l=l*p+d*o,u=u*p+_*o,f=f*p+y*o;let C=1/Math.sqrt(c*c+l*l+u*u+f*f);c*=C,l*=C,u*=C,f*=C}}e[t]=c,e[t+1]=l,e[t+2]=u,e[t+3]=f}static multiplyQuaternionsFlat(e,t,n,s,r,a){let o=n[s],c=n[s+1],l=n[s+2],u=n[s+3],f=r[a],h=r[a+1],d=r[a+2],_=r[a+3];return e[t]=o*_+u*f+c*d-l*h,e[t+1]=c*_+u*h+l*f-o*d,e[t+2]=l*_+u*d+o*h-c*f,e[t+3]=u*_-o*f-c*h-l*d,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,c=Math.sin,l=o(n/2),u=o(s/2),f=o(r/2),h=c(n/2),d=c(s/2),_=c(r/2);switch(a){case"XYZ":this._x=h*u*f+l*d*_,this._y=l*d*f-h*u*_,this._z=l*u*_+h*d*f,this._w=l*u*f-h*d*_;break;case"YXZ":this._x=h*u*f+l*d*_,this._y=l*d*f-h*u*_,this._z=l*u*_-h*d*f,this._w=l*u*f+h*d*_;break;case"ZXY":this._x=h*u*f-l*d*_,this._y=l*d*f+h*u*_,this._z=l*u*_+h*d*f,this._w=l*u*f-h*d*_;break;case"ZYX":this._x=h*u*f-l*d*_,this._y=l*d*f+h*u*_,this._z=l*u*_-h*d*f,this._w=l*u*f+h*d*_;break;case"YZX":this._x=h*u*f+l*d*_,this._y=l*d*f+h*u*_,this._z=l*u*_-h*d*f,this._w=l*u*f-h*d*_;break;case"XZY":this._x=h*u*f-l*d*_,this._y=l*d*f-h*u*_,this._z=l*u*_+h*d*f,this._w=l*u*f+h*d*_;break;default:qe("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],c=t[9],l=t[2],u=t[6],f=t[10],h=n+o+f;if(h>0){let d=.5/Math.sqrt(h+1);this._w=.25/d,this._x=(u-c)*d,this._y=(r-l)*d,this._z=(a-s)*d}else if(n>o&&n>f){let d=2*Math.sqrt(1+n-o-f);this._w=(u-c)/d,this._x=.25*d,this._y=(s+a)/d,this._z=(r+l)/d}else if(o>f){let d=2*Math.sqrt(1+o-n-f);this._w=(r-l)/d,this._x=(s+a)/d,this._y=.25*d,this._z=(c+u)/d}else{let d=2*Math.sqrt(1+f-n-o);this._w=(a-s)/d,this._x=(r+l)/d,this._y=(c+u)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(rt(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,c=t._y,l=t._z,u=t._w;return this._x=n*u+a*o+s*l-r*c,this._y=s*u+a*c+r*o-n*l,this._z=r*u+a*l+n*c-s*o,this._w=a*u-n*o-s*c-r*l,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let c=1-t;if(o<.9995){let l=Math.acos(o),u=Math.sin(l);c=Math.sin(c*l)/u,t=Math.sin(t*l)/u,this._x=this._x*c+n*t,this._y=this._y*c+s*t,this._z=this._z*c+r*t,this._w=this._w*c+a*t,this._onChangeCallback()}else this._x=this._x*c+n*t,this._y=this._y*c+s*t,this._z=this._z*c+r*t,this._w=this._w*c+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},R=class i{static{i.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(yh.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(yh.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,c=e.w,l=2*(a*s-o*n),u=2*(o*t-r*s),f=2*(r*n-a*t);return this.x=t+c*l+a*f-o*u,this.y=n+c*u+o*l-r*f,this.z=s+c*f+r*u-a*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=rt(this.x,e.x,t.x),this.y=rt(this.y,e.y,t.y),this.z=rt(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=rt(this.x,e,t),this.y=rt(this.y,e,t),this.z=rt(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(rt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,c=t.z;return this.x=s*c-r*o,this.y=r*a-n*c,this.z=n*o-s*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return _l.copy(this).projectOnVector(e),this.sub(_l)}reflect(e){return this.sub(_l.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(rt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},_l=new R,yh=new ln,Qe=class i{static{i.prototype.isMatrix3=!0}constructor(e,t,n,s,r,a,o,c,l){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,c,l)}set(e,t,n,s,r,a,o,c,l){let u=this.elements;return u[0]=e,u[1]=s,u[2]=o,u[3]=t,u[4]=r,u[5]=c,u[6]=n,u[7]=a,u[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],c=n[6],l=n[1],u=n[4],f=n[7],h=n[2],d=n[5],_=n[8],y=s[0],x=s[3],p=s[6],C=s[1],w=s[4],b=s[7],S=s[2],v=s[5],M=s[8];return r[0]=a*y+o*C+c*S,r[3]=a*x+o*w+c*v,r[6]=a*p+o*b+c*M,r[1]=l*y+u*C+f*S,r[4]=l*x+u*w+f*v,r[7]=l*p+u*b+f*M,r[2]=h*y+d*C+_*S,r[5]=h*x+d*w+_*v,r[8]=h*p+d*b+_*M,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],u=e[8];return t*a*u-t*o*l-n*r*u+n*o*c+s*r*l-s*a*c}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],u=e[8],f=u*a-o*l,h=o*c-u*r,d=l*r-a*c,_=t*f+n*h+s*d;if(_===0)return this.set(0,0,0,0,0,0,0,0,0);let y=1/_;return e[0]=f*y,e[1]=(s*l-u*n)*y,e[2]=(o*n-s*a)*y,e[3]=h*y,e[4]=(u*t-s*c)*y,e[5]=(s*r-o*t)*y,e[6]=d*y,e[7]=(n*c-l*t)*y,e[8]=(a*t-n*r)*y,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){let c=Math.cos(r),l=Math.sin(r);return this.set(n*c,n*l,-n*(c*a+l*o)+a+e,-s*l,s*c,-s*(-l*a+c*o)+o+t,0,0,1),this}scale(e,t){return zi("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(vl.makeScale(e,t)),this}rotate(e){return zi("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(vl.makeRotation(-e)),this}translate(e,t){return zi("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(vl.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},vl=new Qe,bh=new Qe().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Mh=new Qe().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Gf(){let i={enabled:!0,workingColorSpace:Ks,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===pt&&(s.r=ti(s.r),s.g=ti(s.g),s.b=ti(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===pt&&(s.r=gs(s.r),s.g=gs(s.g),s.b=gs(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Nn?$s:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return zi("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return zi("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[Ks]:{primaries:e,whitePoint:n,transfer:$s,toXYZ:bh,fromXYZ:Mh,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:on},outputColorSpaceConfig:{drawingBufferColorSpace:on}},[on]:{primaries:e,whitePoint:n,transfer:pt,toXYZ:bh,fromXYZ:Mh,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:on}}}),i}var ct=Gf();function ti(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function gs(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var is,Ea=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{is===void 0&&(is=Qs("canvas")),is.width=e.width,is.height=e.height;let s=is.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=is}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Qs("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=ti(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(ti(t[n]/255)*255):t[n]=ti(t[n]);return{data:t,width:e.width,height:e.height}}else return qe("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Wf=0,ys=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Wf++}),this.uuid=ei(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(yl(s[a].image)):r.push(yl(s[a]))}else r=yl(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function yl(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Ea.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(qe("Texture: Unable to serialize Texture."),{})}var Xf=0,bl=new R,$t=class i extends Cn{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=Fn,s=Fn,r=zt,a=Ci,o=bn,c=Qt,l=i.DEFAULT_ANISOTROPY,u=Nn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Xf++}),this.uuid=ei(),this.name="",this.source=new ys(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=l,this.format=o,this.internalFormat=null,this.type=c,this.offset=new Re(0,0),this.repeat=new Re(1,1),this.center=new Re(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Qe,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(bl).x}get height(){return this.source.getSize(bl).y}get depth(){return this.source.getSize(bl).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){qe(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){qe(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==fc)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Ma:e.x=e.x-Math.floor(e.x);break;case Fn:e.x=e.x<0?0:1;break;case Sa:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Ma:e.y=e.y-Math.floor(e.y);break;case Fn:e.y=e.y<0?0:1;break;case Sa:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};$t.DEFAULT_IMAGE=null;$t.DEFAULT_MAPPING=fc;$t.DEFAULT_ANISOTROPY=1;var wt=class i{static{i.prototype.isVector4=!0}constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,c=e.elements,l=c[0],u=c[4],f=c[8],h=c[1],d=c[5],_=c[9],y=c[2],x=c[6],p=c[10];if(Math.abs(u-h)<.01&&Math.abs(f-y)<.01&&Math.abs(_-x)<.01){if(Math.abs(u+h)<.1&&Math.abs(f+y)<.1&&Math.abs(_+x)<.1&&Math.abs(l+d+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let w=(l+1)/2,b=(d+1)/2,S=(p+1)/2,v=(u+h)/4,M=(f+y)/4,m=(_+x)/4;return w>b&&w>S?w<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(w),s=v/n,r=M/n):b>S?b<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(b),n=v/s,r=m/s):S<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(S),n=M/r,s=m/r),this.set(n,s,r,t),this}let C=Math.sqrt((x-_)*(x-_)+(f-y)*(f-y)+(h-u)*(h-u));return Math.abs(C)<.001&&(C=1),this.x=(x-_)/C,this.y=(f-y)/C,this.z=(h-u)/C,this.w=Math.acos((l+d+p-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=rt(this.x,e.x,t.x),this.y=rt(this.y,e.y,t.y),this.z=rt(this.z,e.z,t.z),this.w=rt(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=rt(this.x,e,t),this.y=rt(this.y,e,t),this.z=rt(this.z,e,t),this.w=rt(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(rt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Aa=class extends Cn{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:zt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new wt(0,0,e,t),this.scissorTest=!1,this.viewport=new wt(0,0,e,t),this.textures=[];let s={width:e,height:t,depth:n.depth},r=new $t(s),a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:zt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new ys(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Zt=class extends Aa{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},tr=class extends $t{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=kt,this.minFilter=kt,this.wrapR=Fn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var Ca=class extends $t{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=kt,this.minFilter=kt,this.wrapR=Fn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var ft=class i{static{i.prototype.isMatrix4=!0}constructor(e,t,n,s,r,a,o,c,l,u,f,h,d,_,y,x){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,c,l,u,f,h,d,_,y,x)}set(e,t,n,s,r,a,o,c,l,u,f,h,d,_,y,x){let p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=s,p[1]=r,p[5]=a,p[9]=o,p[13]=c,p[2]=l,p[6]=u,p[10]=f,p[14]=h,p[3]=d,p[7]=_,p[11]=y,p[15]=x,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,s=1/ss.setFromMatrixColumn(e,0).length(),r=1/ss.setFromMatrixColumn(e,1).length(),a=1/ss.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),c=Math.cos(s),l=Math.sin(s),u=Math.cos(r),f=Math.sin(r);if(e.order==="XYZ"){let h=a*u,d=a*f,_=o*u,y=o*f;t[0]=c*u,t[4]=-c*f,t[8]=l,t[1]=d+_*l,t[5]=h-y*l,t[9]=-o*c,t[2]=y-h*l,t[6]=_+d*l,t[10]=a*c}else if(e.order==="YXZ"){let h=c*u,d=c*f,_=l*u,y=l*f;t[0]=h+y*o,t[4]=_*o-d,t[8]=a*l,t[1]=a*f,t[5]=a*u,t[9]=-o,t[2]=d*o-_,t[6]=y+h*o,t[10]=a*c}else if(e.order==="ZXY"){let h=c*u,d=c*f,_=l*u,y=l*f;t[0]=h-y*o,t[4]=-a*f,t[8]=_+d*o,t[1]=d+_*o,t[5]=a*u,t[9]=y-h*o,t[2]=-a*l,t[6]=o,t[10]=a*c}else if(e.order==="ZYX"){let h=a*u,d=a*f,_=o*u,y=o*f;t[0]=c*u,t[4]=_*l-d,t[8]=h*l+y,t[1]=c*f,t[5]=y*l+h,t[9]=d*l-_,t[2]=-l,t[6]=o*c,t[10]=a*c}else if(e.order==="YZX"){let h=a*c,d=a*l,_=o*c,y=o*l;t[0]=c*u,t[4]=y-h*f,t[8]=_*f+d,t[1]=f,t[5]=a*u,t[9]=-o*u,t[2]=-l*u,t[6]=d*f+_,t[10]=h-y*f}else if(e.order==="XZY"){let h=a*c,d=a*l,_=o*c,y=o*l;t[0]=c*u,t[4]=-f,t[8]=l*u,t[1]=h*f+y,t[5]=a*u,t[9]=d*f-_,t[2]=_*f-d,t[6]=o*u,t[10]=y*f+h}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(qf,e,Yf)}lookAt(e,t,n){let s=this.elements;return rn.subVectors(e,t),rn.lengthSq()===0&&(rn.z=1),rn.normalize(),mi.crossVectors(n,rn),mi.lengthSq()===0&&(Math.abs(n.z)===1?rn.x+=1e-4:rn.z+=1e-4,rn.normalize(),mi.crossVectors(n,rn)),mi.normalize(),Vr.crossVectors(rn,mi),s[0]=mi.x,s[4]=Vr.x,s[8]=rn.x,s[1]=mi.y,s[5]=Vr.y,s[9]=rn.y,s[2]=mi.z,s[6]=Vr.z,s[10]=rn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],c=n[8],l=n[12],u=n[1],f=n[5],h=n[9],d=n[13],_=n[2],y=n[6],x=n[10],p=n[14],C=n[3],w=n[7],b=n[11],S=n[15],v=s[0],M=s[4],m=s[8],T=s[12],P=s[1],I=s[5],L=s[9],N=s[13],V=s[2],F=s[6],X=s[10],H=s[14],$=s[3],Q=s[7],de=s[11],fe=s[15];return r[0]=a*v+o*P+c*V+l*$,r[4]=a*M+o*I+c*F+l*Q,r[8]=a*m+o*L+c*X+l*de,r[12]=a*T+o*N+c*H+l*fe,r[1]=u*v+f*P+h*V+d*$,r[5]=u*M+f*I+h*F+d*Q,r[9]=u*m+f*L+h*X+d*de,r[13]=u*T+f*N+h*H+d*fe,r[2]=_*v+y*P+x*V+p*$,r[6]=_*M+y*I+x*F+p*Q,r[10]=_*m+y*L+x*X+p*de,r[14]=_*T+y*N+x*H+p*fe,r[3]=C*v+w*P+b*V+S*$,r[7]=C*M+w*I+b*F+S*Q,r[11]=C*m+w*L+b*X+S*de,r[15]=C*T+w*N+b*H+S*fe,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],c=e[9],l=e[13],u=e[2],f=e[6],h=e[10],d=e[14],_=e[3],y=e[7],x=e[11],p=e[15],C=c*d-l*h,w=o*d-l*f,b=o*h-c*f,S=a*d-l*u,v=a*h-c*u,M=a*f-o*u;return t*(y*C-x*w+p*b)-n*(_*C-x*S+p*v)+s*(_*w-y*S+p*M)-r*(_*b-y*v+x*M)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[1],a=e[5],o=e[9],c=e[2],l=e[6],u=e[10];return t*(a*u-o*l)-n*(r*u-o*c)+s*(r*l-a*c)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],u=e[8],f=e[9],h=e[10],d=e[11],_=e[12],y=e[13],x=e[14],p=e[15],C=t*o-n*a,w=t*c-s*a,b=t*l-r*a,S=n*c-s*o,v=n*l-r*o,M=s*l-r*c,m=u*y-f*_,T=u*x-h*_,P=u*p-d*_,I=f*x-h*y,L=f*p-d*y,N=h*p-d*x,V=C*N-w*L+b*I+S*P-v*T+M*m;if(V===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let F=1/V;return e[0]=(o*N-c*L+l*I)*F,e[1]=(s*L-n*N-r*I)*F,e[2]=(y*M-x*v+p*S)*F,e[3]=(h*v-f*M-d*S)*F,e[4]=(c*P-a*N-l*T)*F,e[5]=(t*N-s*P+r*T)*F,e[6]=(x*b-_*M-p*w)*F,e[7]=(u*M-h*b+d*w)*F,e[8]=(a*L-o*P+l*m)*F,e[9]=(n*P-t*L-r*m)*F,e[10]=(_*v-y*b+p*C)*F,e[11]=(f*b-u*v-d*C)*F,e[12]=(o*T-a*I-c*m)*F,e[13]=(t*I-n*T+s*m)*F,e[14]=(y*w-_*S-x*C)*F,e[15]=(u*S-f*w+h*C)*F,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,c=e.z,l=r*a,u=r*o;return this.set(l*a+n,l*o-s*c,l*c+s*o,0,l*o+s*c,u*o+n,u*c-s*a,0,l*c-s*o,u*c+s*a,r*c*c+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,a=t._y,o=t._z,c=t._w,l=r+r,u=a+a,f=o+o,h=r*l,d=r*u,_=r*f,y=a*u,x=a*f,p=o*f,C=c*l,w=c*u,b=c*f,S=n.x,v=n.y,M=n.z;return s[0]=(1-(y+p))*S,s[1]=(d+b)*S,s[2]=(_-w)*S,s[3]=0,s[4]=(d-b)*v,s[5]=(1-(h+p))*v,s[6]=(x+C)*v,s[7]=0,s[8]=(_+w)*M,s[9]=(x-C)*M,s[10]=(1-(h+y))*M,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let a=ss.set(s[0],s[1],s[2]).length(),o=ss.set(s[4],s[5],s[6]).length(),c=ss.set(s[8],s[9],s[10]).length();r<0&&(a=-a),Sn.copy(this);let l=1/a,u=1/o,f=1/c;return Sn.elements[0]*=l,Sn.elements[1]*=l,Sn.elements[2]*=l,Sn.elements[4]*=u,Sn.elements[5]*=u,Sn.elements[6]*=u,Sn.elements[8]*=f,Sn.elements[9]*=f,Sn.elements[10]*=f,t.setFromRotationMatrix(Sn),n.x=a,n.y=o,n.z=c,this}makePerspective(e,t,n,s,r,a,o=An,c=!1){let l=this.elements,u=2*r/(t-e),f=2*r/(n-s),h=(t+e)/(t-e),d=(n+s)/(n-s),_,y;if(c)_=r/(a-r),y=a*r/(a-r);else if(o===An)_=-(a+r)/(a-r),y=-2*a*r/(a-r);else if(o===xs)_=-a/(a-r),y=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=u,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=f,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=_,l[14]=y,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=An,c=!1){let l=this.elements,u=2/(t-e),f=2/(n-s),h=-(t+e)/(t-e),d=-(n+s)/(n-s),_,y;if(c)_=1/(a-r),y=a/(a-r);else if(o===An)_=-2/(a-r),y=-(a+r)/(a-r);else if(o===xs)_=-1/(a-r),y=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=u,l[4]=0,l[8]=0,l[12]=h,l[1]=0,l[5]=f,l[9]=0,l[13]=d,l[2]=0,l[6]=0,l[10]=_,l[14]=y,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},ss=new R,Sn=new ft,qf=new R(0,0,0),Yf=new R(1,1,1),mi=new R,Vr=new R,rn=new R,Sh=new ft,wh=new ln,ii=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],a=s[4],o=s[8],c=s[1],l=s[5],u=s[9],f=s[2],h=s[6],d=s[10];switch(t){case"XYZ":this._y=Math.asin(rt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,d),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(h,l),this._z=0);break;case"YXZ":this._x=Math.asin(-rt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,d),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-f,r),this._z=0);break;case"ZXY":this._x=Math.asin(rt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-f,d),this._z=Math.atan2(-a,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-rt(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(h,d),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-a,l));break;case"YZX":this._z=Math.asin(rt(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-u,l),this._y=Math.atan2(-f,r)):(this._x=0,this._y=Math.atan2(o,d));break;case"XZY":this._z=Math.asin(-rt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(h,l),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-u,d),this._y=0);break;default:qe("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Sh.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Sh,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return wh.setFromEuler(this),this.setFromQuaternion(wh,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};ii.DEFAULT_ORDER="XYZ";var bs=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},Zf=0,Th=new R,rs=new ln,Zn=new ft,Hr=new R,ks=new R,jf=new R,Jf=new ln,Eh=new R(1,0,0),Ah=new R(0,1,0),Ch=new R(0,0,1),Ph={type:"added"},Kf={type:"removed"},as={type:"childadded",child:null},Ml={type:"childremoved",child:null},It=class i extends Cn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Zf++}),this.uuid=ei(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new R,t=new ii,n=new ln,s=new R(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new ft},normalMatrix:{value:new Qe}}),this.matrix=new ft,this.matrixWorld=new ft,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new bs,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return rs.setFromAxisAngle(e,t),this.quaternion.multiply(rs),this}rotateOnWorldAxis(e,t){return rs.setFromAxisAngle(e,t),this.quaternion.premultiply(rs),this}rotateX(e){return this.rotateOnAxis(Eh,e)}rotateY(e){return this.rotateOnAxis(Ah,e)}rotateZ(e){return this.rotateOnAxis(Ch,e)}translateOnAxis(e,t){return Th.copy(e).applyQuaternion(this.quaternion),this.position.add(Th.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Eh,e)}translateY(e){return this.translateOnAxis(Ah,e)}translateZ(e){return this.translateOnAxis(Ch,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Zn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Hr.copy(e):Hr.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),ks.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Zn.lookAt(ks,Hr,this.up):Zn.lookAt(Hr,ks,this.up),this.quaternion.setFromRotationMatrix(Zn),s&&(Zn.extractRotation(s.matrixWorld),rs.setFromRotationMatrix(Zn),this.quaternion.premultiply(rs.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Je("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Ph),as.child=e,this.dispatchEvent(as),as.child=null):Je("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Kf),Ml.child=e,this.dispatchEvent(Ml),Ml.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Zn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Zn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Zn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Ph),as.child=e,this.dispatchEvent(as),as.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ks,e,jf),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ks,Jf,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*s,r[13]+=n-r[1]*t-r[5]*n-r[9]*s,r[14]+=s-r[2]*t-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),this.static!==!1&&(s.static=this.static),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let c=o.shapes;if(Array.isArray(c))for(let l=0,u=c.length;l<u;l++){let f=c[l];r(e.shapes,f)}else r(e.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let c=0,l=this.material.length;c<l;c++)o.push(r(e.materials,this.material[c]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let c=this.animations[o];s.animations.push(r(e.animations,c))}}if(t){let o=a(e.geometries),c=a(e.materials),l=a(e.textures),u=a(e.images),f=a(e.shapes),h=a(e.skeletons),d=a(e.animations),_=a(e.nodes);o.length>0&&(n.geometries=o),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),u.length>0&&(n.images=u),f.length>0&&(n.shapes=f),h.length>0&&(n.skeletons=h),d.length>0&&(n.animations=d),_.length>0&&(n.nodes=_)}return n.object=s,n;function a(o){let c=[];for(let l in o){let u=o[l];delete u.metadata,c.push(u)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}};It.DEFAULT_UP=new R(0,1,0);It.DEFAULT_MATRIX_AUTO_UPDATE=!0;It.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Qn=class extends It{constructor(){super(),this.isGroup=!0,this.type="Group"}},$f={type:"move"},Ms=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Qn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Qn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new R,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new R),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Qn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new R,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new R,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null,o=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){a=!0;for(let y of e.hand.values()){let x=t.getJointPose(y,n),p=this._getHandJoint(l,y);x!==null&&(p.matrix.fromArray(x.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=x.radius),p.visible=x!==null}let u=l.joints["index-finger-tip"],f=l.joints["thumb-tip"],h=u.position.distanceTo(f.position),d=.02,_=.005;l.inputState.pinching&&h>d+_?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&h<=d-_&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1,c.eventsEnabled&&c.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent($f)))}return o!==null&&(o.visible=s!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Qn;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Du={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},gi={h:0,s:0,l:0},Gr={h:0,s:0,l:0};function Sl(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var et=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=on){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,ct.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=ct.workingColorSpace){return this.r=e,this.g=t,this.b=n,ct.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=ct.workingColorSpace){if(e=bc(e,1),t=rt(t,0,1),n=rt(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=Sl(a,r,e+1/3),this.g=Sl(a,r,e),this.b=Sl(a,r,e-1/3)}return ct.colorSpaceToWorking(this,s),this}setStyle(e,t=on){function n(r){r!==void 0&&parseFloat(r)<1&&qe("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:qe("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);qe("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=on){let n=Du[e.toLowerCase()];return n!==void 0?this.setHex(n,t):qe("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=ti(e.r),this.g=ti(e.g),this.b=ti(e.b),this}copyLinearToSRGB(e){return this.r=gs(e.r),this.g=gs(e.g),this.b=gs(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=on){return ct.workingToColorSpace(Wt.copy(this),e),Math.round(rt(Wt.r*255,0,255))*65536+Math.round(rt(Wt.g*255,0,255))*256+Math.round(rt(Wt.b*255,0,255))}getHexString(e=on){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=ct.workingColorSpace){ct.workingToColorSpace(Wt.copy(this),t);let n=Wt.r,s=Wt.g,r=Wt.b,a=Math.max(n,s,r),o=Math.min(n,s,r),c,l,u=(o+a)/2;if(o===a)c=0,l=0;else{let f=a-o;switch(l=u<=.5?f/(a+o):f/(2-a-o),a){case n:c=(s-r)/f+(s<r?6:0);break;case s:c=(r-n)/f+2;break;case r:c=(n-s)/f+4;break}c/=6}return e.h=c,e.s=l,e.l=u,e}getRGB(e,t=ct.workingColorSpace){return ct.workingToColorSpace(Wt.copy(this),t),e.r=Wt.r,e.g=Wt.g,e.b=Wt.b,e}getStyle(e=on){ct.workingToColorSpace(Wt.copy(this),e);let t=Wt.r,n=Wt.g,s=Wt.b;return e!==on?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(gi),this.setHSL(gi.h+e,gi.s+t,gi.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(gi),e.getHSL(Gr);let n=Ys(gi.h,Gr.h,t),s=Ys(gi.s,Gr.s,t),r=Ys(gi.l,Gr.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Wt=new et;et.NAMES=Du;var gn=class extends It{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new ii,this.environmentIntensity=1,this.environmentRotation=new ii,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},wn=new R,jn=new R,wl=new R,Jn=new R,os=new R,ls=new R,Ih=new R,Tl=new R,El=new R,Al=new R,Cl=new wt,Pl=new wt,Il=new wt,bi=class i{constructor(e=new R,t=new R,n=new R){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),wn.subVectors(e,t),s.cross(wn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){wn.subVectors(s,t),jn.subVectors(n,t),wl.subVectors(e,t);let a=wn.dot(wn),o=wn.dot(jn),c=wn.dot(wl),l=jn.dot(jn),u=jn.dot(wl),f=a*l-o*o;if(f===0)return r.set(0,0,0),null;let h=1/f,d=(l*c-o*u)*h,_=(a*u-o*c)*h;return r.set(1-d-_,_,d)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,Jn)===null?!1:Jn.x>=0&&Jn.y>=0&&Jn.x+Jn.y<=1}static getInterpolation(e,t,n,s,r,a,o,c){return this.getBarycoord(e,t,n,s,Jn)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,Jn.x),c.addScaledVector(a,Jn.y),c.addScaledVector(o,Jn.z),c)}static getInterpolatedAttribute(e,t,n,s,r,a){return Cl.setScalar(0),Pl.setScalar(0),Il.setScalar(0),Cl.fromBufferAttribute(e,t),Pl.fromBufferAttribute(e,n),Il.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(Cl,r.x),a.addScaledVector(Pl,r.y),a.addScaledVector(Il,r.z),a}static isFrontFacing(e,t,n,s){return wn.subVectors(n,t),jn.subVectors(e,t),wn.cross(jn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return wn.subVectors(this.c,this.b),jn.subVectors(this.a,this.b),wn.cross(jn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,a,o;os.subVectors(s,n),ls.subVectors(r,n),Tl.subVectors(e,n);let c=os.dot(Tl),l=ls.dot(Tl);if(c<=0&&l<=0)return t.copy(n);El.subVectors(e,s);let u=os.dot(El),f=ls.dot(El);if(u>=0&&f<=u)return t.copy(s);let h=c*f-u*l;if(h<=0&&c>=0&&u<=0)return a=c/(c-u),t.copy(n).addScaledVector(os,a);Al.subVectors(e,r);let d=os.dot(Al),_=ls.dot(Al);if(_>=0&&d<=_)return t.copy(r);let y=d*l-c*_;if(y<=0&&l>=0&&_<=0)return o=l/(l-_),t.copy(n).addScaledVector(ls,o);let x=u*_-d*f;if(x<=0&&f-u>=0&&d-_>=0)return Ih.subVectors(r,s),o=(f-u)/(f-u+(d-_)),t.copy(s).addScaledVector(Ih,o);let p=1/(x+y+h);return a=y*p,o=h*p,t.copy(n).addScaledVector(os,a).addScaledVector(ls,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Rt=class{constructor(e=new R(1/0,1/0,1/0),t=new R(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Tn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Tn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Tn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,Tn):Tn.fromBufferAttribute(r,a),Tn.applyMatrix4(e.matrixWorld),this.expandByPoint(Tn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Wr.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Wr.copy(n.boundingBox)),Wr.applyMatrix4(e.matrixWorld),this.union(Wr)}let s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Tn),Tn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(zs),Xr.subVectors(this.max,zs),cs.subVectors(e.a,zs),hs.subVectors(e.b,zs),us.subVectors(e.c,zs),xi.subVectors(hs,cs),_i.subVectors(us,hs),Ui.subVectors(cs,us);let t=[0,-xi.z,xi.y,0,-_i.z,_i.y,0,-Ui.z,Ui.y,xi.z,0,-xi.x,_i.z,0,-_i.x,Ui.z,0,-Ui.x,-xi.y,xi.x,0,-_i.y,_i.x,0,-Ui.y,Ui.x,0];return!Rl(t,cs,hs,us,Xr)||(t=[1,0,0,0,1,0,0,0,1],!Rl(t,cs,hs,us,Xr))?!1:(qr.crossVectors(xi,_i),t=[qr.x,qr.y,qr.z],Rl(t,cs,hs,us,Xr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Tn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Tn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Kn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Kn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Kn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Kn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Kn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Kn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Kn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Kn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Kn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Kn=[new R,new R,new R,new R,new R,new R,new R,new R],Tn=new R,Wr=new Rt,cs=new R,hs=new R,us=new R,xi=new R,_i=new R,Ui=new R,zs=new R,Xr=new R,qr=new R,Fi=new R;function Rl(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){Fi.fromArray(i,r);let o=s.x*Math.abs(Fi.x)+s.y*Math.abs(Fi.y)+s.z*Math.abs(Fi.z),c=e.dot(Fi),l=t.dot(Fi),u=n.dot(Fi);if(Math.max(-Math.max(c,l,u),Math.min(c,l,u))>o)return!1}return!0}var Pt=new R,Yr=new Re,Qf=0,Yt=class extends Cn{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Qf++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Ta,this.updateRanges=[],this.gpuType=yn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Yr.fromBufferAttribute(this,t),Yr.applyMatrix3(e),this.setXY(t,Yr.x,Yr.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Pt.fromBufferAttribute(this,t),Pt.applyMatrix3(e),this.setXYZ(t,Pt.x,Pt.y,Pt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Pt.fromBufferAttribute(this,t),Pt.applyMatrix4(e),this.setXYZ(t,Pt.x,Pt.y,Pt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Pt.fromBufferAttribute(this,t),Pt.applyNormalMatrix(e),this.setXYZ(t,Pt.x,Pt.y,Pt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Pt.fromBufferAttribute(this,t),Pt.transformDirection(e),this.setXYZ(t,Pt.x,Pt.y,Pt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=En(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=gt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=En(t,this.array)),t}setX(e,t){return this.normalized&&(t=gt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=En(t,this.array)),t}setY(e,t){return this.normalized&&(t=gt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=En(t,this.array)),t}setZ(e,t){return this.normalized&&(t=gt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=En(t,this.array)),t}setW(e,t){return this.normalized&&(t=gt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=gt(t,this.array),n=gt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=gt(t,this.array),n=gt(n,this.array),s=gt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=gt(t,this.array),n=gt(n,this.array),s=gt(s,this.array),r=gt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Ta&&(e.usage=this.usage),e}dispose(){this.dispatchEvent({type:"dispose"})}};var Gi=class extends Yt{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var nr=class extends Yt{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var mt=class extends Yt{constructor(e,t,n){super(new Float32Array(e),t,n)}},ep=new Rt,Vs=new R,Ll=new R,xn=class{constructor(e=new R,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):ep.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Vs.subVectors(e,this.center);let t=Vs.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(Vs,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Ll.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Vs.copy(e.center).add(Ll)),this.expandByPoint(Vs.copy(e.center).sub(Ll))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},tp=0,pn=new ft,Nl=new It,ds=new R,an=new Rt,Hs=new Rt,Ot=new R,Lt=class i extends Cn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:tp++}),this.uuid=ei(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Tf(e)?nr:Gi)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Qe().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return pn.makeRotationFromQuaternion(e),this.applyMatrix4(pn),this}rotateX(e){return pn.makeRotationX(e),this.applyMatrix4(pn),this}rotateY(e){return pn.makeRotationY(e),this.applyMatrix4(pn),this}rotateZ(e){return pn.makeRotationZ(e),this.applyMatrix4(pn),this}translate(e,t,n){return pn.makeTranslation(e,t,n),this.applyMatrix4(pn),this}scale(e,t,n){return pn.makeScale(e,t,n),this.applyMatrix4(pn),this}lookAt(e){return Nl.lookAt(e),Nl.updateMatrix(),this.applyMatrix4(Nl.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ds).negate(),this.translate(ds.x,ds.y,ds.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let a=e[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new mt(n,3))}else{let n=Math.min(e.length,t.count);for(let s=0;s<n;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&qe("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Rt);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Je("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new R(-1/0,-1/0,-1/0),new R(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];an.setFromBufferAttribute(r),this.morphTargetsRelative?(Ot.addVectors(this.boundingBox.min,an.min),this.boundingBox.expandByPoint(Ot),Ot.addVectors(this.boundingBox.max,an.max),this.boundingBox.expandByPoint(Ot)):(this.boundingBox.expandByPoint(an.min),this.boundingBox.expandByPoint(an.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Je('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new xn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Je("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new R,1/0);return}if(e){let n=this.boundingSphere.center;if(an.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){let o=t[r];Hs.setFromBufferAttribute(o),this.morphTargetsRelative?(Ot.addVectors(an.min,Hs.min),an.expandByPoint(Ot),Ot.addVectors(an.max,Hs.max),an.expandByPoint(Ot)):(an.expandByPoint(Hs.min),an.expandByPoint(Hs.max))}an.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)Ot.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(Ot));if(t)for(let r=0,a=t.length;r<a;r++){let o=t[r],c=this.morphTargetsRelative;for(let l=0,u=o.count;l<u;l++)Ot.fromBufferAttribute(o,l),c&&(ds.fromBufferAttribute(e,l),Ot.add(ds)),s=Math.max(s,n.distanceToSquared(Ot))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Je('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Je("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new Yt(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));let o=[],c=[];for(let m=0;m<n.count;m++)o[m]=new R,c[m]=new R;let l=new R,u=new R,f=new R,h=new Re,d=new Re,_=new Re,y=new R,x=new R;function p(m,T,P){l.fromBufferAttribute(n,m),u.fromBufferAttribute(n,T),f.fromBufferAttribute(n,P),h.fromBufferAttribute(r,m),d.fromBufferAttribute(r,T),_.fromBufferAttribute(r,P),u.sub(l),f.sub(l),d.sub(h),_.sub(h);let I=1/(d.x*_.y-_.x*d.y);isFinite(I)&&(y.copy(u).multiplyScalar(_.y).addScaledVector(f,-d.y).multiplyScalar(I),x.copy(f).multiplyScalar(d.x).addScaledVector(u,-_.x).multiplyScalar(I),o[m].add(y),o[T].add(y),o[P].add(y),c[m].add(x),c[T].add(x),c[P].add(x))}let C=this.groups;C.length===0&&(C=[{start:0,count:e.count}]);for(let m=0,T=C.length;m<T;++m){let P=C[m],I=P.start,L=P.count;for(let N=I,V=I+L;N<V;N+=3)p(e.getX(N+0),e.getX(N+1),e.getX(N+2))}let w=new R,b=new R,S=new R,v=new R;function M(m){S.fromBufferAttribute(s,m),v.copy(S);let T=o[m];w.copy(T),w.sub(S.multiplyScalar(S.dot(T))).normalize(),b.crossVectors(v,T);let I=b.dot(c[m])<0?-1:1;a.setXYZW(m,w.x,w.y,w.z,I)}for(let m=0,T=C.length;m<T;++m){let P=C[m],I=P.start,L=P.count;for(let N=I,V=I+L;N<V;N+=3)M(e.getX(N+0)),M(e.getX(N+1)),M(e.getX(N+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new Yt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let h=0,d=n.count;h<d;h++)n.setXYZ(h,0,0,0);let s=new R,r=new R,a=new R,o=new R,c=new R,l=new R,u=new R,f=new R;if(e)for(let h=0,d=e.count;h<d;h+=3){let _=e.getX(h+0),y=e.getX(h+1),x=e.getX(h+2);s.fromBufferAttribute(t,_),r.fromBufferAttribute(t,y),a.fromBufferAttribute(t,x),u.subVectors(a,r),f.subVectors(s,r),u.cross(f),o.fromBufferAttribute(n,_),c.fromBufferAttribute(n,y),l.fromBufferAttribute(n,x),o.add(u),c.add(u),l.add(u),n.setXYZ(_,o.x,o.y,o.z),n.setXYZ(y,c.x,c.y,c.z),n.setXYZ(x,l.x,l.y,l.z)}else for(let h=0,d=t.count;h<d;h+=3)s.fromBufferAttribute(t,h+0),r.fromBufferAttribute(t,h+1),a.fromBufferAttribute(t,h+2),u.subVectors(a,r),f.subVectors(s,r),u.cross(f),n.setXYZ(h+0,u.x,u.y,u.z),n.setXYZ(h+1,u.x,u.y,u.z),n.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Ot.fromBufferAttribute(e,t),Ot.normalize(),e.setXYZ(t,Ot.x,Ot.y,Ot.z)}toNonIndexed(){function e(o,c){let l=o.array,u=o.itemSize,f=o.normalized,h=new l.constructor(c.length*u),d=0,_=0;for(let y=0,x=c.length;y<x;y++){o.isInterleavedBufferAttribute?d=c[y]*o.data.stride+o.offset:d=c[y]*u;for(let p=0;p<u;p++)h[_++]=l[d++]}return new Yt(h,u,f)}if(this.index===null)return qe("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let o in s){let c=s[o],l=e(c,n);t.setAttribute(o,l)}let r=this.morphAttributes;for(let o in r){let c=[],l=r[o];for(let u=0,f=l.length;u<f;u++){let h=l[u],d=e(h,n);c.push(d)}t.morphAttributes[o]=c}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,c=a.length;o<c;o++){let l=a[o];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let c=this.parameters;for(let l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let c in n){let l=n[c];e.data.attributes[c]=l.toJSON(e.data)}let s={},r=!1;for(let c in this.morphAttributes){let l=this.morphAttributes[c],u=[];for(let f=0,h=l.length;f<h;f++){let d=l[f];u.push(d.toJSON(e.data))}u.length>0&&(s[c]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let s=e.attributes;for(let l in s){let u=s[l];this.setAttribute(l,u.clone(t))}let r=e.morphAttributes;for(let l in r){let u=[],f=r[l];for(let h=0,d=f.length;h<d;h++)u.push(f[h].clone(t));this.morphAttributes[l]=u}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let l=0,u=a.length;l<u;l++){let f=a[l];this.addGroup(f.start,f.count,f.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},Ss=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Ta,this.updateRanges=[],this.version=0,this.uuid=ei()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[n+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=ei()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=ei()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},qt=new R,Wi=class i{constructor(e,t,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)qt.fromBufferAttribute(this,t),qt.applyMatrix4(e),this.setXYZ(t,qt.x,qt.y,qt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)qt.fromBufferAttribute(this,t),qt.applyNormalMatrix(e),this.setXYZ(t,qt.x,qt.y,qt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)qt.fromBufferAttribute(this,t),qt.transformDirection(e),this.setXYZ(t,qt.x,qt.y,qt.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=En(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=gt(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=gt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=gt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=gt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=gt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=En(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=En(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=En(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=En(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=gt(t,this.array),n=gt(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=gt(t,this.array),n=gt(n,this.array),s=gt(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=gt(t,this.array),n=gt(n,this.array),s=gt(s,this.array),r=gt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){er("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new Yt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new i(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){er("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},np=0,Bn=class extends Cn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:np++}),this.uuid=ei(),this.name="",this.type="Material",this.blending=Vi,this.side=ni,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=fa,this.blendDst=pa,this.blendEquation=Mi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new et(0,0,0),this.blendAlpha=0,this.depthFunc=Hi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Zl,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ki,this.stencilZFail=ki,this.stencilZPass=ki,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){qe(`Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){qe(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Vi&&(n.blending=this.blending),this.side!==ni&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==fa&&(n.blendSrc=this.blendSrc),this.blendDst!==pa&&(n.blendDst=this.blendDst),this.blendEquation!==Mi&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Hi&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Zl&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==ki&&(n.stencilFail=this.stencilFail),this.stencilZFail!==ki&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==ki&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.allowOverride===!1&&(n.allowOverride=!1),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let c=r[o];delete c.metadata,a.push(c)}return a}if(t){let r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new et().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new Re().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Re().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};var $n=new R,Dl=new R,Zr=new R,vi=new R,Ul=new R,jr=new R,Fl=new R,si=class{constructor(e=new R,t=new R(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,$n)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=$n.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):($n.copy(this.origin).addScaledVector(this.direction,t),$n.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){Dl.copy(e).add(t).multiplyScalar(.5),Zr.copy(t).sub(e).normalize(),vi.copy(this.origin).sub(Dl);let r=e.distanceTo(t)*.5,a=-this.direction.dot(Zr),o=vi.dot(this.direction),c=-vi.dot(Zr),l=vi.lengthSq(),u=Math.abs(1-a*a),f,h,d,_;if(u>0)if(f=a*c-o,h=a*o-c,_=r*u,f>=0)if(h>=-_)if(h<=_){let y=1/u;f*=y,h*=y,d=f*(f+a*h+2*o)+h*(a*f+h+2*c)+l}else h=r,f=Math.max(0,-(a*h+o)),d=-f*f+h*(h+2*c)+l;else h=-r,f=Math.max(0,-(a*h+o)),d=-f*f+h*(h+2*c)+l;else h<=-_?(f=Math.max(0,-(-a*r+o)),h=f>0?-r:Math.min(Math.max(-r,-c),r),d=-f*f+h*(h+2*c)+l):h<=_?(f=0,h=Math.min(Math.max(-r,-c),r),d=h*(h+2*c)+l):(f=Math.max(0,-(a*r+o)),h=f>0?r:Math.min(Math.max(-r,-c),r),d=-f*f+h*(h+2*c)+l);else h=a>0?-r:r,f=Math.max(0,-(a*h+o)),d=-f*f+h*(h+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,f),s&&s.copy(Dl).addScaledVector(Zr,h),d}intersectSphere(e,t){$n.subVectors(e.center,this.origin);let n=$n.dot(this.direction),s=$n.dot($n)-n*n,r=e.radius*e.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,c=n+a;return c<0?null:o<0?this.at(c,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,c,l=1/this.direction.x,u=1/this.direction.y,f=1/this.direction.z,h=this.origin;return l>=0?(n=(e.min.x-h.x)*l,s=(e.max.x-h.x)*l):(n=(e.max.x-h.x)*l,s=(e.min.x-h.x)*l),u>=0?(r=(e.min.y-h.y)*u,a=(e.max.y-h.y)*u):(r=(e.max.y-h.y)*u,a=(e.min.y-h.y)*u),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),f>=0?(o=(e.min.z-h.z)*f,c=(e.max.z-h.z)*f):(o=(e.max.z-h.z)*f,c=(e.min.z-h.z)*f),n>c||o>s)||((o>n||n!==n)&&(n=o),(c<s||s!==s)&&(s=c),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,$n)!==null}intersectTriangle(e,t,n,s,r){Ul.subVectors(t,e),jr.subVectors(n,e),Fl.crossVectors(Ul,jr);let a=this.direction.dot(Fl),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;vi.subVectors(this.origin,e);let c=o*this.direction.dot(jr.crossVectors(vi,jr));if(c<0)return null;let l=o*this.direction.dot(Ul.cross(vi));if(l<0||c+l>a)return null;let u=-o*vi.dot(Fl);return u<0?null:this.at(u/a,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Xi=class extends Bn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new et(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ii,this.combine=rc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Rh=new ft,Oi=new si,Jr=new xn,Lh=new R,Kr=new R,$r=new R,Qr=new R,Ol=new R,ea=new R,Nh=new R,ta=new R,St=class extends It{constructor(e=new Lt,t=new Xi){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let o=this.morphTargetInfluences;if(r&&o){ea.set(0,0,0);for(let c=0,l=r.length;c<l;c++){let u=o[c],f=r[c];u!==0&&(Ol.fromBufferAttribute(f,e),a?ea.addScaledVector(Ol,u):ea.addScaledVector(Ol.sub(t),u))}t.add(ea)}return t}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Jr.copy(n.boundingSphere),Jr.applyMatrix4(r),Oi.copy(e.ray).recast(e.near),!(Jr.containsPoint(Oi.origin)===!1&&(Oi.intersectSphere(Jr,Lh)===null||Oi.origin.distanceToSquared(Lh)>(e.far-e.near)**2))&&(Rh.copy(r).invert(),Oi.copy(e.ray).applyMatrix4(Rh),!(n.boundingBox!==null&&Oi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Oi)))}_computeIntersections(e,t,n){let s,r=this.geometry,a=this.material,o=r.index,c=r.attributes.position,l=r.attributes.uv,u=r.attributes.uv1,f=r.attributes.normal,h=r.groups,d=r.drawRange;if(o!==null)if(Array.isArray(a))for(let _=0,y=h.length;_<y;_++){let x=h[_],p=a[x.materialIndex],C=Math.max(x.start,d.start),w=Math.min(o.count,Math.min(x.start+x.count,d.start+d.count));for(let b=C,S=w;b<S;b+=3){let v=o.getX(b),M=o.getX(b+1),m=o.getX(b+2);s=na(this,p,e,n,l,u,f,v,M,m),s&&(s.faceIndex=Math.floor(b/3),s.face.materialIndex=x.materialIndex,t.push(s))}}else{let _=Math.max(0,d.start),y=Math.min(o.count,d.start+d.count);for(let x=_,p=y;x<p;x+=3){let C=o.getX(x),w=o.getX(x+1),b=o.getX(x+2);s=na(this,a,e,n,l,u,f,C,w,b),s&&(s.faceIndex=Math.floor(x/3),t.push(s))}}else if(c!==void 0)if(Array.isArray(a))for(let _=0,y=h.length;_<y;_++){let x=h[_],p=a[x.materialIndex],C=Math.max(x.start,d.start),w=Math.min(c.count,Math.min(x.start+x.count,d.start+d.count));for(let b=C,S=w;b<S;b+=3){let v=b,M=b+1,m=b+2;s=na(this,p,e,n,l,u,f,v,M,m),s&&(s.faceIndex=Math.floor(b/3),s.face.materialIndex=x.materialIndex,t.push(s))}}else{let _=Math.max(0,d.start),y=Math.min(c.count,d.start+d.count);for(let x=_,p=y;x<p;x+=3){let C=x,w=x+1,b=x+2;s=na(this,a,e,n,l,u,f,C,w,b),s&&(s.faceIndex=Math.floor(x/3),t.push(s))}}}};function ip(i,e,t,n,s,r,a,o){let c;if(e.side===Jt?c=n.intersectTriangle(a,r,s,!0,o):c=n.intersectTriangle(s,r,a,e.side===ni,o),c===null)return null;ta.copy(o),ta.applyMatrix4(i.matrixWorld);let l=t.ray.origin.distanceTo(ta);return l<t.near||l>t.far?null:{distance:l,point:ta.clone(),object:i}}function na(i,e,t,n,s,r,a,o,c,l){i.getVertexPosition(o,Kr),i.getVertexPosition(c,$r),i.getVertexPosition(l,Qr);let u=ip(i,e,t,n,Kr,$r,Qr,Nh);if(u){let f=new R;bi.getBarycoord(Nh,Kr,$r,Qr,f),s&&(u.uv=bi.getInterpolatedAttribute(s,o,c,l,f,new Re)),r&&(u.uv1=bi.getInterpolatedAttribute(r,o,c,l,f,new Re)),a&&(u.normal=bi.getInterpolatedAttribute(a,o,c,l,f,new R),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));let h={a:o,b:c,c:l,normal:new R,materialIndex:0};bi.getNormal(Kr,$r,Qr,h.normal),u.face=h,u.barycoord=f}return u}var qi=class extends $t{constructor(e=null,t=1,n=1,s,r,a,o,c,l=kt,u=kt,f,h){super(null,a,o,c,l,u,s,r,f,h),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Yi=class extends Yt{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},fs=new ft,Dh=new ft,ia=[],Uh=new Rt,sp=new ft,Gs=new St,Ws=new xn,ir=class extends St{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Yi(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,sp)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Rt),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,fs),Uh.copy(e.boundingBox).applyMatrix4(fs),this.boundingBox.union(Uh)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new xn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,fs),Ws.copy(e.boundingSphere).applyMatrix4(fs),this.boundingSphere.union(Ws)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,a=e*r+1;for(let o=0;o<n.length;o++)n[o]=s[a+o]}raycast(e,t){let n=this.matrixWorld,s=this.count;if(Gs.geometry=this.geometry,Gs.material=this.material,Gs.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Ws.copy(this.boundingSphere),Ws.applyMatrix4(n),e.ray.intersectsSphere(Ws)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,fs),Dh.multiplyMatrices(n,fs),Gs.matrixWorld=Dh,Gs.raycast(e,ia);for(let a=0,o=ia.length;a<o;a++){let c=ia[a];c.instanceId=r,c.object=this,t.push(c)}ia.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new Yi(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new qi(new Float32Array(s*this.count),s,this.count,Is,yn));let r=this.morphTexture.source.data.data,a=0;for(let l=0;l<n.length;l++)a+=n[l];let o=this.geometry.morphTargetsRelative?1:1-a,c=s*e;return r[c]=o,r.set(n,c+1),this}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Bl=new R,rp=new R,ap=new Qe,mn=class{constructor(e=new R(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=Bl.subVectors(n,t).cross(rp.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let s=e.delta(Bl),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(s,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||ap.getNormalMatrix(e),s=this.coplanarPoint(Bl).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},Bi=new xn,op=new Re(.5,.5),sa=new R,Si=class{constructor(e=new mn,t=new mn,n=new mn,s=new mn,r=new mn,a=new mn){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=An,n=!1){let s=this.planes,r=e.elements,a=r[0],o=r[1],c=r[2],l=r[3],u=r[4],f=r[5],h=r[6],d=r[7],_=r[8],y=r[9],x=r[10],p=r[11],C=r[12],w=r[13],b=r[14],S=r[15];if(s[0].setComponents(l-a,d-u,p-_,S-C).normalize(),s[1].setComponents(l+a,d+u,p+_,S+C).normalize(),s[2].setComponents(l+o,d+f,p+y,S+w).normalize(),s[3].setComponents(l-o,d-f,p-y,S-w).normalize(),n)s[4].setComponents(c,h,x,b).normalize(),s[5].setComponents(l-c,d-h,p-x,S-b).normalize();else if(s[4].setComponents(l-c,d-h,p-x,S-b).normalize(),t===An)s[5].setComponents(l+c,d+h,p+x,S+b).normalize();else if(t===xs)s[5].setComponents(c,h,x,b).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Bi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Bi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Bi)}intersectsSprite(e){Bi.center.set(0,0,0);let t=op.distanceTo(e.center);return Bi.radius=.7071067811865476+t,Bi.applyMatrix4(e.matrixWorld),this.intersectsSphere(Bi)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(sa.x=s.normal.x>0?e.max.x:e.min.x,sa.y=s.normal.y>0?e.max.y:e.min.y,sa.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(sa)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var sr=class extends Bn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new et(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},Pa=new R,Ia=new R,Fh=new ft,Xs=new si,ra=new xn,kl=new R,Oh=new R,Ra=class extends It{constructor(e=new Lt,t=new sr){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)Pa.fromBufferAttribute(t,s-1),Ia.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=Pa.distanceTo(Ia);e.setAttribute("lineDistance",new mt(n,1))}else qe("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ra.copy(n.boundingSphere),ra.applyMatrix4(s),ra.radius+=r,e.ray.intersectsSphere(ra)===!1)return;Fh.copy(s).invert(),Xs.copy(e.ray).applyMatrix4(Fh);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,l=this.isLineSegments?2:1,u=n.index,h=n.attributes.position;if(u!==null){let d=Math.max(0,a.start),_=Math.min(u.count,a.start+a.count);for(let y=d,x=_-1;y<x;y+=l){let p=u.getX(y),C=u.getX(y+1),w=aa(this,e,Xs,c,p,C,y);w&&t.push(w)}if(this.isLineLoop){let y=u.getX(_-1),x=u.getX(d),p=aa(this,e,Xs,c,y,x,_-1);p&&t.push(p)}}else{let d=Math.max(0,a.start),_=Math.min(h.count,a.start+a.count);for(let y=d,x=_-1;y<x;y+=l){let p=aa(this,e,Xs,c,y,y+1,y);p&&t.push(p)}if(this.isLineLoop){let y=aa(this,e,Xs,c,_-1,d,_-1);y&&t.push(y)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function aa(i,e,t,n,s,r,a){let o=i.geometry.attributes.position;if(Pa.fromBufferAttribute(o,s),Ia.fromBufferAttribute(o,r),t.distanceSqToSegment(Pa,Ia,kl,Oh)>n)return;kl.applyMatrix4(i.matrixWorld);let l=e.ray.origin.distanceTo(kl);if(!(l<e.near||l>e.far))return{distance:l,point:Oh.clone().applyMatrix4(i.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:i}}var Bh=new R,kh=new R,ws=class extends Ra{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)Bh.fromBufferAttribute(t,s),kh.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+Bh.distanceTo(kh);e.setAttribute("lineDistance",new mt(n,1))}else qe("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var La=class extends Bn{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new et(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},zh=new ft,jl=new si,oa=new xn,la=new R,rr=class extends It{constructor(e=new Lt,t=new La){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),oa.copy(n.boundingSphere),oa.applyMatrix4(s),oa.radius+=r,e.ray.intersectsSphere(oa)===!1)return;zh.copy(s).invert(),jl.copy(e.ray).applyMatrix4(zh);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,l=n.index,f=n.attributes.position;if(l!==null){let h=Math.max(0,a.start),d=Math.min(l.count,a.start+a.count);for(let _=h,y=d;_<y;_++){let x=l.getX(_);la.fromBufferAttribute(f,x),Vh(la,x,c,s,e,t,this)}}else{let h=Math.max(0,a.start),d=Math.min(f.count,a.start+a.count);for(let _=h,y=d;_<y;_++)la.fromBufferAttribute(f,_),Vh(la,_,c,s,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function Vh(i,e,t,n,s,r,a){let o=jl.distanceSqToPoint(i);if(o<t){let c=new R;jl.closestPointToPoint(i,c),c.applyMatrix4(n);let l=s.ray.origin.distanceTo(c);if(l<s.near||l>s.far)return;r.push({distance:l,distanceToRay:Math.sqrt(o),point:c,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}var ar=class extends $t{constructor(e=[],t=Ai,n,s,r,a,o,c,l,u){super(e,t,n,s,r,a,o,c,l,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}};var ri=class extends $t{constructor(e,t,n=Ln,s,r,a,o=kt,c=kt,l,u=On,f=1){if(u!==On&&u!==Pi)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let h={width:e,height:t,depth:f};super(h,s,r,a,o,c,u,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new ys(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},Na=class extends ri{constructor(e,t=Ln,n=Ai,s,r,a=kt,o=kt,c,l=On){let u={width:e,height:e,depth:1},f=[u,u,u,u,u,u];super(e,e,t,n,s,r,a,o,c,l),this.image=f,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},or=class extends $t{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},kn=class i extends Lt{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let c=[],l=[],u=[],f=[],h=0,d=0;_("z","y","x",-1,-1,n,t,e,a,r,0),_("z","y","x",1,-1,n,t,-e,a,r,1),_("x","z","y",1,1,e,n,t,s,a,2),_("x","z","y",1,-1,e,n,-t,s,a,3),_("x","y","z",1,-1,e,t,n,s,r,4),_("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(c),this.setAttribute("position",new mt(l,3)),this.setAttribute("normal",new mt(u,3)),this.setAttribute("uv",new mt(f,2));function _(y,x,p,C,w,b,S,v,M,m,T){let P=b/M,I=S/m,L=b/2,N=S/2,V=v/2,F=M+1,X=m+1,H=0,$=0,Q=new R;for(let de=0;de<X;de++){let fe=de*I-N;for(let ge=0;ge<F;ge++){let ze=ge*P-L;Q[y]=ze*C,Q[x]=fe*w,Q[p]=V,l.push(Q.x,Q.y,Q.z),Q[y]=0,Q[x]=0,Q[p]=v>0?1:-1,u.push(Q.x,Q.y,Q.z),f.push(ge/M),f.push(1-de/m),H+=1}}for(let de=0;de<m;de++)for(let fe=0;fe<M;fe++){let ge=h+fe+F*de,ze=h+fe+F*(de+1),he=h+(fe+1)+F*(de+1),Ie=h+(fe+1)+F*de;c.push(ge,ze,Ie),c.push(ze,he,Ie),$+=6}o.addGroup(d,$,T),d+=$,h+=H}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var zn=class i extends Lt{constructor(e=1,t=1,n=1,s=32,r=1,a=!1,o=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:c};let l=this;s=Math.floor(s),r=Math.floor(r);let u=[],f=[],h=[],d=[],_=0,y=[],x=n/2,p=0;C(),a===!1&&(e>0&&w(!0),t>0&&w(!1)),this.setIndex(u),this.setAttribute("position",new mt(f,3)),this.setAttribute("normal",new mt(h,3)),this.setAttribute("uv",new mt(d,2));function C(){let b=new R,S=new R,v=0,M=(t-e)/n;for(let m=0;m<=r;m++){let T=[],P=m/r,I=P*(t-e)+e;for(let L=0;L<=s;L++){let N=L/s,V=N*c+o,F=Math.sin(V),X=Math.cos(V);S.x=I*F,S.y=-P*n+x,S.z=I*X,f.push(S.x,S.y,S.z),b.set(F,M,X).normalize(),h.push(b.x,b.y,b.z),d.push(N,1-P),T.push(_++)}y.push(T)}for(let m=0;m<s;m++)for(let T=0;T<r;T++){let P=y[T][m],I=y[T+1][m],L=y[T+1][m+1],N=y[T][m+1];(e>0||T!==0)&&(u.push(P,I,N),v+=3),(t>0||T!==r-1)&&(u.push(I,L,N),v+=3)}l.addGroup(p,v,0),p+=v}function w(b){let S=_,v=new Re,M=new R,m=0,T=b===!0?e:t,P=b===!0?1:-1;for(let L=1;L<=s;L++)f.push(0,x*P,0),h.push(0,P,0),d.push(.5,.5),_++;let I=_;for(let L=0;L<=s;L++){let V=L/s*c+o,F=Math.cos(V),X=Math.sin(V);M.x=T*X,M.y=x*P,M.z=T*F,f.push(M.x,M.y,M.z),h.push(0,P,0),v.x=F*.5+.5,v.y=X*.5*P+.5,d.push(v.x,v.y),_++}for(let L=0;L<s;L++){let N=S+L,V=I+L;b===!0?u.push(V,V+1,N):u.push(V+1,V,N),m+=3}l.addGroup(p,m,b===!0?1:2),p+=m}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},lr=class i extends zn{constructor(e=1,t=1,n=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,e,t,n,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(e){return new i(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var _n=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){qe("Curve: .getPoint() not implemented.")}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,s=this.getPoint(0),r=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),r+=n.distanceTo(s),t.push(r),s=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),s=0,r=n.length,a;t?a=t:a=e*n[r-1];let o=0,c=r-1,l;for(;o<=c;)if(s=Math.floor(o+(c-o)/2),l=n[s]-a,l<0)o=s+1;else if(l>0)c=s-1;else{c=s;break}if(s=c,n[s]===a)return s/(r-1);let u=n[s],h=n[s+1]-u,d=(a-u)/h;return(s+d)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);let a=this.getPoint(s),o=this.getPoint(r),c=t||(a.isVector2?new Re:new R);return c.copy(o).sub(a).normalize(),c}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new R,s=[],r=[],a=[],o=new R,c=new ft;for(let d=0;d<=e;d++){let _=d/e;s[d]=this.getTangentAt(_,new R)}r[0]=new R,a[0]=new R;let l=Number.MAX_VALUE,u=Math.abs(s[0].x),f=Math.abs(s[0].y),h=Math.abs(s[0].z);u<=l&&(l=u,n.set(1,0,0)),f<=l&&(l=f,n.set(0,1,0)),h<=l&&n.set(0,0,1),o.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let d=1;d<=e;d++){if(r[d]=r[d-1].clone(),a[d]=a[d-1].clone(),o.crossVectors(s[d-1],s[d]),o.length()>Number.EPSILON){o.normalize();let _=Math.acos(rt(s[d-1].dot(s[d]),-1,1));r[d].applyMatrix4(c.makeRotationAxis(o,_))}a[d].crossVectors(s[d],r[d])}if(t===!0){let d=Math.acos(rt(r[0].dot(r[e]),-1,1));d/=e,s[0].dot(o.crossVectors(r[0],r[e]))>0&&(d=-d);for(let _=1;_<=e;_++)r[_].applyMatrix4(c.makeRotationAxis(s[_],d*_)),a[_].crossVectors(s[_],r[_])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},cr=class extends _n{constructor(e=0,t=0,n=1,s=1,r=0,a=Math.PI*2,o=!1,c=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=c}getPoint(e,t=new Re){let n=t,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);let o=this.aStartAngle+e*r,c=this.aX+this.xRadius*Math.cos(o),l=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let u=Math.cos(this.aRotation),f=Math.sin(this.aRotation),h=c-this.aX,d=l-this.aY;c=h*u-d*f+this.aX,l=h*f+d*u+this.aY}return n.set(c,l)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Da=class extends cr{constructor(e,t,n,s,r,a){super(e,t,n,n,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}};function Mc(){let i=0,e=0,t=0,n=0;function s(r,a,o,c){i=r,e=o,t=-3*r+3*a-2*o-c,n=2*r-2*a+o+c}return{initCatmullRom:function(r,a,o,c,l){s(a,o,l*(o-r),l*(c-a))},initNonuniformCatmullRom:function(r,a,o,c,l,u,f){let h=(a-r)/l-(o-r)/(l+u)+(o-a)/u,d=(o-a)/u-(c-a)/(u+f)+(c-o)/f;h*=u,d*=u,s(a,o,h,d)},calc:function(r){let a=r*r,o=a*r;return i+e*r+t*a+n*o}}}var Hh=new R,Gh=new R,zl=new Mc,Vl=new Mc,Hl=new Mc,Ua=class extends _n{constructor(e=[],t=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=s}getPoint(e,t=new R){let n=t,s=this.points,r=s.length,a=(r-(this.closed?0:1))*e,o=Math.floor(a),c=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:c===0&&o===r-1&&(o=r-2,c=1);let l,u;this.closed||o>0?l=s[(o-1)%r]:(Gh.subVectors(s[0],s[1]).add(s[0]),l=Gh);let f=s[o%r],h=s[(o+1)%r];if(this.closed||o+2<r?u=s[(o+2)%r]:(Hh.subVectors(s[r-1],s[r-2]).add(s[r-1]),u=Hh),this.curveType==="centripetal"||this.curveType==="chordal"){let d=this.curveType==="chordal"?.5:.25,_=Math.pow(l.distanceToSquared(f),d),y=Math.pow(f.distanceToSquared(h),d),x=Math.pow(h.distanceToSquared(u),d);y<1e-4&&(y=1),_<1e-4&&(_=y),x<1e-4&&(x=y),zl.initNonuniformCatmullRom(l.x,f.x,h.x,u.x,_,y,x),Vl.initNonuniformCatmullRom(l.y,f.y,h.y,u.y,_,y,x),Hl.initNonuniformCatmullRom(l.z,f.z,h.z,u.z,_,y,x)}else this.curveType==="catmullrom"&&(zl.initCatmullRom(l.x,f.x,h.x,u.x,this.tension),Vl.initCatmullRom(l.y,f.y,h.y,u.y,this.tension),Hl.initCatmullRom(l.z,f.z,h.z,u.z,this.tension));return n.set(zl.calc(c),Vl.calc(c),Hl.calc(c)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new R().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Wh(i,e,t,n,s){let r=(n-e)*.5,a=(s-t)*.5,o=i*i,c=i*o;return(2*t-2*n+r+a)*c+(-3*t+3*n-2*r-a)*o+r*i+t}function lp(i,e){let t=1-i;return t*t*e}function cp(i,e){return 2*(1-i)*i*e}function hp(i,e){return i*i*e}function Zs(i,e,t,n){return lp(i,e)+cp(i,t)+hp(i,n)}function up(i,e){let t=1-i;return t*t*t*e}function dp(i,e){let t=1-i;return 3*t*t*i*e}function fp(i,e){return 3*(1-i)*i*i*e}function pp(i,e){return i*i*i*e}function js(i,e,t,n,s){return up(i,e)+dp(i,t)+fp(i,n)+pp(i,s)}var Fa=class extends _n{constructor(e=new Re,t=new Re,n=new Re,s=new Re){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new Re){let n=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(js(e,s.x,r.x,a.x,o.x),js(e,s.y,r.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Ts=class extends _n{constructor(e=new R,t=new R,n=new R,s=new R){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new R){let n=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(js(e,s.x,r.x,a.x,o.x),js(e,s.y,r.y,a.y,o.y),js(e,s.z,r.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Oa=class extends _n{constructor(e=new Re,t=new Re){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new Re){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new Re){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ba=class extends _n{constructor(e=new R,t=new R){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new R){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new R){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ka=class extends _n{constructor(e=new Re,t=new Re,n=new Re){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new Re){let n=t,s=this.v0,r=this.v1,a=this.v2;return n.set(Zs(e,s.x,r.x,a.x),Zs(e,s.y,r.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},hr=class extends _n{constructor(e=new R,t=new R,n=new R){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new R){let n=t,s=this.v0,r=this.v1,a=this.v2;return n.set(Zs(e,s.x,r.x,a.x),Zs(e,s.y,r.y,a.y),Zs(e,s.z,r.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},za=class extends _n{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new Re){let n=t,s=this.points,r=(s.length-1)*e,a=Math.floor(r),o=r-a,c=s[a===0?a:a-1],l=s[a],u=s[a>s.length-2?s.length-1:a+1],f=s[a>s.length-3?s.length-1:a+2];return n.set(Wh(o,c.x,l.x,u.x,f.x),Wh(o,c.y,l.y,u.y,f.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new Re().fromArray(s))}return this}},mp=Object.freeze({__proto__:null,ArcCurve:Da,CatmullRomCurve3:Ua,CubicBezierCurve:Fa,CubicBezierCurve3:Ts,EllipseCurve:cr,LineCurve:Oa,LineCurve3:Ba,QuadraticBezierCurve:ka,QuadraticBezierCurve3:hr,SplineCurve:za});var ur=class i extends Lt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,a=t/2,o=Math.floor(n),c=Math.floor(s),l=o+1,u=c+1,f=e/o,h=t/c,d=[],_=[],y=[],x=[];for(let p=0;p<u;p++){let C=p*h-a;for(let w=0;w<l;w++){let b=w*f-r;_.push(b,-C,0),y.push(0,0,1),x.push(w/o),x.push(1-p/c)}}for(let p=0;p<c;p++)for(let C=0;C<o;C++){let w=C+l*p,b=C+l*(p+1),S=C+1+l*(p+1),v=C+1+l*p;d.push(w,b,v),d.push(b,S,v)}this.setIndex(d),this.setAttribute("position",new mt(_,3)),this.setAttribute("normal",new mt(y,3)),this.setAttribute("uv",new mt(x,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}};var dr=class i extends Lt{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let c=Math.min(a+o,Math.PI),l=0,u=[],f=new R,h=new R,d=[],_=[],y=[],x=[];for(let p=0;p<=n;p++){let C=[],w=p/n,b=a+w*o,S=e*Math.cos(b),v=Math.sqrt(e*e-S*S),M=0;p===0&&a===0?M=.5/t:p===n&&c===Math.PI&&(M=-.5/t);for(let m=0;m<=t;m++){let T=m/t,P=s+T*r;f.x=-v*Math.cos(P),f.y=S,f.z=v*Math.sin(P),_.push(f.x,f.y,f.z),h.copy(f).normalize(),y.push(h.x,h.y,h.z),x.push(T+M,1-w),C.push(l++)}u.push(C)}for(let p=0;p<n;p++)for(let C=0;C<t;C++){let w=u[p][C+1],b=u[p][C],S=u[p+1][C],v=u[p+1][C+1];(p!==0||a>0)&&d.push(w,b,v),(p!==n-1||c<Math.PI)&&d.push(b,S,v)}this.setIndex(d),this.setAttribute("position",new mt(_,3)),this.setAttribute("normal",new mt(y,3)),this.setAttribute("uv",new mt(x,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var Zi=class i extends Lt{constructor(e=1,t=.4,n=12,s=48,r=Math.PI*2,a=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:s,arc:r,thetaStart:a,thetaLength:o},n=Math.floor(n),s=Math.floor(s);let c=[],l=[],u=[],f=[],h=new R,d=new R,_=new R;for(let y=0;y<=n;y++){let x=a+y/n*o;for(let p=0;p<=s;p++){let C=p/s*r;d.x=(e+t*Math.cos(x))*Math.cos(C),d.y=(e+t*Math.cos(x))*Math.sin(C),d.z=t*Math.sin(x),l.push(d.x,d.y,d.z),h.x=e*Math.cos(C),h.y=e*Math.sin(C),_.subVectors(d,h).normalize(),u.push(_.x,_.y,_.z),f.push(p/s),f.push(y/n)}}for(let y=1;y<=n;y++)for(let x=1;x<=s;x++){let p=(s+1)*y+x-1,C=(s+1)*(y-1)+x-1,w=(s+1)*(y-1)+x,b=(s+1)*y+x;c.push(p,C,b),c.push(C,w,b)}this.setIndex(c),this.setAttribute("position",new mt(l,3)),this.setAttribute("normal",new mt(u,3)),this.setAttribute("uv",new mt(f,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}};var fr=class i extends Lt{constructor(e=new hr(new R(-1,-1,0),new R(-1,1,0),new R(1,1,0)),t=64,n=1,s=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:s,closed:r};let a=e.computeFrenetFrames(t,r);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;let o=new R,c=new R,l=new Re,u=new R,f=[],h=[],d=[],_=[];y(),this.setIndex(_),this.setAttribute("position",new mt(f,3)),this.setAttribute("normal",new mt(h,3)),this.setAttribute("uv",new mt(d,2));function y(){for(let w=0;w<t;w++)x(w);x(r===!1?t:0),C(),p()}function x(w){u=e.getPointAt(w/t,u);let b=a.normals[w],S=a.binormals[w];for(let v=0;v<=s;v++){let M=v/s*Math.PI*2,m=Math.sin(M),T=-Math.cos(M);c.x=T*b.x+m*S.x,c.y=T*b.y+m*S.y,c.z=T*b.z+m*S.z,c.normalize(),h.push(c.x,c.y,c.z),o.x=u.x+n*c.x,o.y=u.y+n*c.y,o.z=u.z+n*c.z,f.push(o.x,o.y,o.z)}}function p(){for(let w=1;w<=t;w++)for(let b=1;b<=s;b++){let S=(s+1)*(w-1)+(b-1),v=(s+1)*w+(b-1),M=(s+1)*w+b,m=(s+1)*(w-1)+b;_.push(S,v,m),_.push(v,M,m)}}function C(){for(let w=0;w<=t;w++)for(let b=0;b<=s;b++)l.x=w/t,l.y=b/s,d.push(l.x,l.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new i(new mp[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}};function Ki(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];if(Xh(s))s.isRenderTargetTexture?(qe("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if(Xh(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[t][n]=r}else e[t][n]=s.slice();else e[t][n]=s}}return e}function Xt(i){let e={};for(let t=0;t<i.length;t++){let n=Ki(i[t]);for(let s in n)e[s]=n[s]}return e}function Xh(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function gp(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Sc(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:ct.workingColorSpace}var Uu={clone:Ki,merge:Xt},xp=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,_p=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,jt=class extends Bn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=xp,this.fragmentShader=_p,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ki(e.uniforms),this.uniformsGroups=gp(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let s=e.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=t[s.value]||null;break;case"c":this.uniforms[n].value=new et().setHex(s.value);break;case"v2":this.uniforms[n].value=new Re().fromArray(s.value);break;case"v3":this.uniforms[n].value=new R().fromArray(s.value);break;case"v4":this.uniforms[n].value=new wt().fromArray(s.value);break;case"m3":this.uniforms[n].value=new Qe().fromArray(s.value);break;case"m4":this.uniforms[n].value=new ft().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},Va=class extends jt{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},ai=class extends Bn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new et(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new et(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Ho,this.normalScale=new Re(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ii,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};var Ha=class extends Bn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Mu,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Ga=class extends Bn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function ca(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}var wi=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let a;t:{i:if(!(e<s)){for(let o=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=t[++n],e<s)break e}a=t.length;break t}if(!(e>=r)){let o=t[1];e<o&&(n=2,r=o);for(let c=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(s=r,r=t[--n-1],e>=r)break e}a=n,n=0;break t}break n}for(;n<a;){let o=n+a>>>1;e<t[o]?a=o:n=o+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let a=0;a!==s;++a)t[a]=n[r+a];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},Wa=class extends wi{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Xl,endingEnd:Xl}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,a=e+1,o=s[r],c=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case ql:r=e,o=2*t-n;break;case Yl:r=s.length-2,o=t+s[r]-s[r+1];break;default:r=e,o=n}if(c===void 0)switch(this.getSettings_().endingEnd){case ql:a=e,c=2*n-t;break;case Yl:a=1,c=n+s[1]-s[0];break;default:a=e-1,c=t}let l=(n-t)*.5,u=this.valueSize;this._weightPrev=l/(t-o),this._weightNext=l/(c-n),this._offsetPrev=r*u,this._offsetNext=a*u}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,u=this._offsetPrev,f=this._offsetNext,h=this._weightPrev,d=this._weightNext,_=(n-t)/(s-t),y=_*_,x=y*_,p=-h*x+2*h*y-h*_,C=(1+h)*x+(-1.5-2*h)*y+(-.5+h)*_+1,w=(-1-d)*x+(1.5+d)*y+.5*_,b=d*x-d*y;for(let S=0;S!==o;++S)r[S]=p*a[u+S]+C*a[l+S]+w*a[c+S]+b*a[f+S];return r}},Xa=class extends wi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,u=(n-t)/(s-t),f=1-u;for(let h=0;h!==o;++h)r[h]=a[l+h]*f+a[c+h]*u;return r}},qa=class extends wi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},Ya=class extends wi{interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,u=this.inTangents,f=this.outTangents;if(!u||!f){let _=(n-t)/(s-t),y=1-_;for(let x=0;x!==o;++x)r[x]=a[l+x]*y+a[c+x]*_;return r}let h=o*2,d=e-1;for(let _=0;_!==o;++_){let y=a[l+_],x=a[c+_],p=d*h+_*2,C=f[p],w=f[p+1],b=e*h+_*2,S=u[b],v=u[b+1],M=(n-t)/(s-t),m,T,P,I,L;for(let N=0;N<8;N++){m=M*M,T=m*M,P=1-M,I=P*P,L=I*P;let F=L*t+3*I*M*C+3*P*m*S+T*s-n;if(Math.abs(F)<1e-10)break;let X=3*I*(C-t)+6*P*M*(S-C)+3*m*(s-S);if(Math.abs(X)<1e-10)break;M=M-F/X,M=Math.max(0,Math.min(1,M))}r[_]=L*y+3*I*M*w+3*P*m*v+T*x}return r}},cn=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=ca(t,this.TimeBufferType),this.values=ca(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:ca(e.times,Array),values:ca(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new qa(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Xa(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Wa(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new Ya(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Js:t=this.InterpolantFactoryMethodDiscrete;break;case wa:t=this.InterpolantFactoryMethodLinear;break;case da:t=this.InterpolantFactoryMethodSmooth;break;case Wl:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return qe("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Js;case this.InterpolantFactoryMethodLinear:return wa;case this.InterpolantFactoryMethodSmooth:return da;case this.InterpolantFactoryMethodBezier:return Wl}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e}return this}trim(e,t){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<e;)++r;for(;a!==-1&&n[a]>t;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(Je("KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(Je("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){let c=n[o];if(typeof c=="number"&&isNaN(c)){Je("KeyframeTrack: Time is not a valid number.",this,o,c),e=!1;break}if(a!==null&&a>c){Je("KeyframeTrack: Out of order keys.",this,o,c,a),e=!1;break}a=c}if(s!==void 0&&Ef(s))for(let o=0,c=s.length;o!==c;++o){let l=s[o];if(isNaN(l)){Je("KeyframeTrack: Value is not a valid number.",this,o,l),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===da,r=e.length-1,a=1;for(let o=1;o<r;++o){let c=!1,l=e[o],u=e[o+1];if(l!==u&&(o!==1||l!==e[0]))if(s)c=!0;else{let f=o*n,h=f-n,d=f+n;for(let _=0;_!==n;++_){let y=t[f+_];if(y!==t[h+_]||y!==t[d+_]){c=!0;break}}}if(c){if(o!==a){e[a]=e[o];let f=o*n,h=a*n;for(let d=0;d!==n;++d)t[h+d]=t[f+d]}++a}}if(r>0){e[a]=e[r];for(let o=r*n,c=a*n,l=0;l!==n;++l)t[c+l]=t[o+l];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,s}};cn.prototype.ValueTypeName="";cn.prototype.TimeBufferType=Float32Array;cn.prototype.ValueBufferType=Float32Array;cn.prototype.DefaultInterpolation=wa;var Ti=class extends cn{constructor(e,t,n){super(e,t,n)}};Ti.prototype.ValueTypeName="bool";Ti.prototype.ValueBufferType=Array;Ti.prototype.DefaultInterpolation=Js;Ti.prototype.InterpolantFactoryMethodLinear=void 0;Ti.prototype.InterpolantFactoryMethodSmooth=void 0;var Za=class extends cn{constructor(e,t,n,s){super(e,t,n,s)}};Za.prototype.ValueTypeName="color";var ja=class extends cn{constructor(e,t,n,s){super(e,t,n,s)}};ja.prototype.ValueTypeName="number";var Ja=class extends wi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=(n-t)/(s-t),l=e*o;for(let u=l+o;l!==u;l+=4)ln.slerpFlat(r,0,a,l-o,a,l,c);return r}},pr=class extends cn{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new Ja(this.times,this.values,this.getValueSize(),e)}};pr.prototype.ValueTypeName="quaternion";pr.prototype.InterpolantFactoryMethodSmooth=void 0;var Ei=class extends cn{constructor(e,t,n){super(e,t,n)}};Ei.prototype.ValueTypeName="string";Ei.prototype.ValueBufferType=Array;Ei.prototype.DefaultInterpolation=Js;Ei.prototype.InterpolantFactoryMethodLinear=void 0;Ei.prototype.InterpolantFactoryMethodSmooth=void 0;var Ka=class extends cn{constructor(e,t,n,s){super(e,t,n,s)}};Ka.prototype.ValueTypeName="vector";var $a=class{constructor(e,t,n){let s=this,r=!1,a=0,o=0,c,l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(u){o++,r===!1&&s.onStart!==void 0&&s.onStart(u,a,o),r=!0},this.itemEnd=function(u){a++,s.onProgress!==void 0&&s.onProgress(u,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return u=u.normalize("NFC"),c?c(u):u},this.setURLModifier=function(u){return c=u,this},this.addHandler=function(u,f){return l.push(u,f),this},this.removeHandler=function(u){let f=l.indexOf(u);return f!==-1&&l.splice(f,2),this},this.getHandler=function(u){for(let f=0,h=l.length;f<h;f+=2){let d=l[f],_=l[f+1];if(d.global&&(d.lastIndex=0),d.test(u))return _}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Fu=new $a,Qa=class{constructor(e){this.manager=e!==void 0?e:Fu,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};Qa.DEFAULT_MATERIAL_NAME="__DEFAULT";var mr=class extends It{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new et(e),this.intensity=t}dispose(){this.dispatchEvent({type:"dispose"})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},oi=class extends mr{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(It.DEFAULT_UP),this.updateMatrix(),this.groundColor=new et(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},Gl=new ft,qh=new R,Yh=new R,Jl=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Re(512,512),this.mapType=Qt,this.map=null,this.mapPass=null,this.matrix=new ft,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Si,this._frameExtents=new Re(1,1),this._viewportCount=1,this._viewports=[new wt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;qh.setFromMatrixPosition(e.matrixWorld),t.position.copy(qh),Yh.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Yh),t.updateMatrixWorld(),Gl.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Gl,t.coordinateSystem,t.reversedDepth),t.coordinateSystem===xs||t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Gl)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},ha=new R,ua=new ln,Un=new R,gr=class extends It{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ft,this.projectionMatrix=new ft,this.projectionMatrixInverse=new ft,this.coordinateSystem=An,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(ha,ua,Un),Un.x===1&&Un.y===1&&Un.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ha,ua,Un.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(ha,ua,Un),Un.x===1&&Un.y===1&&Un.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ha,ua,Un.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},yi=new R,Zh=new Re,jh=new Re,Bt=class extends gr{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=vs*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(qs*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return vs*2*Math.atan(Math.tan(qs*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){yi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(yi.x,yi.y).multiplyScalar(-e/yi.z),yi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(yi.x,yi.y).multiplyScalar(-e/yi.z)}getViewSize(e,t){return this.getViewBounds(e,Zh,jh),t.subVectors(jh,Zh)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(qs*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let c=a.fullWidth,l=a.fullHeight;r+=a.offsetX*s/c,t-=a.offsetY*n/l,s*=a.width/c,n*=a.height/l}let o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}};var Vn=class extends gr{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,a=n+e,o=s+t,c=s-t;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,a=r+l*this.view.width,o-=u*this.view.offsetY,c=o-u*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Kl=class extends Jl{constructor(){super(new Vn(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},li=class extends mr{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(It.DEFAULT_UP),this.updateMatrix(),this.target=new It,this.shadow=new Kl}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var xr=class extends Lt{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(e){return super.copy(e),this.instanceCount=e.instanceCount,this}toJSON(){let e=super.toJSON();return e.instanceCount=this.instanceCount,e.isInstancedBufferGeometry=!0,e}};var ps=-90,ms=1,eo=class extends It{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Bt(ps,ms,e,t);s.layers=this.layers,this.add(s);let r=new Bt(ps,ms,e,t);r.layers=this.layers,this.add(r);let a=new Bt(ps,ms,e,t);a.layers=this.layers,this.add(a);let o=new Bt(ps,ms,e,t);o.layers=this.layers,this.add(o);let c=new Bt(ps,ms,e,t);c.layers=this.layers,this.add(c);let l=new Bt(ps,ms,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,c]=t;for(let l of t)this.remove(l);if(e===An)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===xs)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,c,l,u]=this.children,f=e.getRenderTarget(),h=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),_=e.xr.enabled;e.xr.enabled=!1;let y=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let x=!1;e.isWebGLRenderer===!0?x=e.state.buffers.depth.getReversed():x=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),x&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,s),x&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,s),x&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,s),x&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),e.setRenderTarget(n,4,s),x&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),n.texture.generateMipmaps=y,e.setRenderTarget(n,5,s),x&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),e.setRenderTarget(f,h,d),e.xr.enabled=_,n.texture.needsPMREMUpdate=!0}},to=class extends Bt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var wc="\\[\\]\\.:\\/",vp=new RegExp("["+wc+"]","g"),Tc="[^"+wc+"]",yp="[^"+wc.replace("\\.","")+"]",bp=/((?:WC+[\/:])*)/.source.replace("WC",Tc),Mp=/(WCOD+)?/.source.replace("WCOD",yp),Sp=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Tc),wp=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Tc),Tp=new RegExp("^"+bp+Mp+Sp+wp+"$"),Ep=["material","materials","bones","map"],$l=class{constructor(e,t,n){let s=n||Mt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},Mt=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(vp,"")}static parseTrackName(e){let t=Tp.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);Ep.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===t||o.uuid===t)return o;let c=n(o.children);if(c)return c}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){qe("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let l=t.objectIndex;switch(n){case"materials":if(!e.material){Je("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){Je("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){Je("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===l){l=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){Je("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){Je("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){Je("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(l!==void 0){if(e[l]===void 0){Je("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[l]}}let a=e[s];if(a===void 0){let l=t.nodeName;Je("PropertyBinding: Trying to update property for track: "+l+"."+s+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){Je("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){Je("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(c=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Mt.Composite=$l;Mt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Mt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Mt.prototype.GetterByBindingType=[Mt.prototype._getValue_direct,Mt.prototype._getValue_array,Mt.prototype._getValue_arrayElement,Mt.prototype._getValue_toArray];Mt.prototype.SetterByBindingTypeAndVersioning=[[Mt.prototype._setValue_direct,Mt.prototype._setValue_direct_setNeedsUpdate,Mt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Mt.prototype._setValue_array,Mt.prototype._setValue_array_setNeedsUpdate,Mt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Mt.prototype._setValue_arrayElement,Mt.prototype._setValue_arrayElement_setNeedsUpdate,Mt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Mt.prototype._setValue_fromArray,Mt.prototype._setValue_fromArray_setNeedsUpdate,Mt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var hv=new Float32Array(1);var _r=class extends Ss{constructor(e,t,n=1){super(e,t),this.isInstancedInterleavedBuffer=!0,this.meshPerAttribute=n}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}clone(e){let t=super.clone(e);return t.meshPerAttribute=this.meshPerAttribute,t}toJSON(e){let t=super.toJSON(e);return t.isInstancedInterleavedBuffer=!0,t.meshPerAttribute=this.meshPerAttribute,t}};var Jh=new ft,vr=class{constructor(e,t,n=0,s=1/0){this.ray=new si(e,t),this.near=n,this.far=s,this.camera=null,this.layers=new bs,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):Je("Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Jh.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Jh),this}intersectObject(e,t=!0,n=[]){return Ql(e,this,n,t),n.sort(Kh),n}intersectObjects(e,t=!0,n=[]){for(let s=0,r=e.length;s<r;s++)Ql(e[s],this,n,t);return n.sort(Kh),n}};function Kh(i,e){return i.distance-e.distance}function Ql(i,e,t,n){let s=!0;if(i.layers.test(e.layers)&&i.raycast(e,t)===!1&&(s=!1),s===!0&&n===!0){let r=i.children;for(let a=0,o=r.length;a<o;a++)Ql(r[a],e,t,!0)}}var Es=class{constructor(e=1,t=0,n=0){this.radius=e,this.phi=t,this.theta=n}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=rt(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(rt(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var ec=class i{static{i.prototype.isMatrix2=!0}constructor(e,t,n,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,s){let r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=s,this}};var ji=class extends ws{constructor(e=10,t=10,n=4473924,s=8947848){n=new et(n),s=new et(s);let r=t/2,a=e/t,o=e/2,c=[],l=[];for(let h=0,d=0,_=-o;h<=t;h++,_+=a){c.push(-o,0,_,o,0,_),c.push(_,0,-o,_,0,o);let y=h===r?n:s;y.toArray(l,d),d+=3,y.toArray(l,d),d+=3,y.toArray(l,d),d+=3,y.toArray(l,d),d+=3}let u=new Lt;u.setAttribute("position",new mt(c,3)),u.setAttribute("color",new mt(l,3));let f=new sr({vertexColors:!0,toneMapped:!1});super(u,f),this.type="GridHelper"}dispose(){this.geometry.dispose(),this.material.dispose()}};var yr=class extends Cn{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){if(e===void 0){qe("Controls: connect() now requires an element.");return}this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}};function Ec(i,e,t,n){let s=Ap(n);switch(t){case _c:return i*e;case Is:return i*e/s.components*s.byteLength;case lo:return i*e/s.components*s.byteLength;case Ii:return i*e*2/s.components*s.byteLength;case co:return i*e*2/s.components*s.byteLength;case vc:return i*e*3/s.components*s.byteLength;case bn:return i*e*4/s.components*s.byteLength;case ho:return i*e*4/s.components*s.byteLength;case wr:case Tr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Er:case Ar:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case fo:case mo:return Math.max(i,16)*Math.max(e,8)/4;case uo:case po:return Math.max(i,8)*Math.max(e,8)/2;case go:case xo:case vo:case yo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case _o:case Cr:case bo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Mo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case So:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case wo:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case To:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case Eo:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Ao:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Co:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Po:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Io:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Ro:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case Lo:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case No:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Do:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case Uo:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Fo:case Oo:case Bo:return Math.ceil(i/4)*Math.ceil(e/4)*16;case ko:case zo:return Math.ceil(i/4)*Math.ceil(e/4)*8;case Pr:case Vo:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Ap(i){switch(i){case Qt:case pc:return{byteLength:1,components:1};case Cs:case mc:case Gn:return{byteLength:2,components:1};case ao:case oo:return{byteLength:2,components:4};case Ln:case ro:case yn:return{byteLength:4,components:1};case gc:case xc:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"185"}}));typeof window<"u"&&(window.__THREE__?qe("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="185");function rd(){let i=null,e=!1,t=null,n=null;function s(r,a){t(r,a),n=i.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function Pp(i){let e=new WeakMap;function t(o,c){let l=o.array,u=o.usage,f=l.byteLength,h=i.createBuffer();i.bindBuffer(c,h),i.bufferData(c,l,u),o.onUploadCallback();let d;if(l instanceof Float32Array)d=i.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)d=i.HALF_FLOAT;else if(l instanceof Uint16Array)o.isFloat16BufferAttribute?d=i.HALF_FLOAT:d=i.UNSIGNED_SHORT;else if(l instanceof Int16Array)d=i.SHORT;else if(l instanceof Uint32Array)d=i.UNSIGNED_INT;else if(l instanceof Int32Array)d=i.INT;else if(l instanceof Int8Array)d=i.BYTE;else if(l instanceof Uint8Array)d=i.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)d=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:h,type:d,bytesPerElement:l.BYTES_PER_ELEMENT,version:o.version,size:f}}function n(o,c,l){let u=c.array,f=c.updateRanges;if(i.bindBuffer(l,o),f.length===0)i.bufferSubData(l,0,u);else{f.sort((d,_)=>d.start-_.start);let h=0;for(let d=1;d<f.length;d++){let _=f[h],y=f[d];y.start<=_.start+_.count+1?_.count=Math.max(_.count,y.start+y.count-_.start):(++h,f[h]=y)}f.length=h+1;for(let d=0,_=f.length;d<_;d++){let y=f[d];i.bufferSubData(l,y.start*u.BYTES_PER_ELEMENT,u,y.start,y.count)}c.clearUpdateRanges()}c.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let c=e.get(o);c&&(i.deleteBuffer(c.buffer),e.delete(o))}function a(o,c){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let u=e.get(o);(!u||u.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let l=e.get(o);if(l===void 0)e.set(o,t(o,c));else if(l.version<o.version){if(l.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(l.buffer,o,c),l.version=o.version}}return{get:s,remove:r,update:a}}var Ip=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Rp=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Lp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Np=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Dp=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Up=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Fp=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Op=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Bp=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,kp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,zp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Vp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Hp=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Gp=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Wp=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Xp=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,qp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Yp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Zp=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,jp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Jp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Kp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,$p=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,Qp=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,em=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,tm=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,nm=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,im=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,sm=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,rm=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,am="gl_FragColor = linearToOutputTexel( gl_FragColor );",om=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,lm=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,cm=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,hm=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,um=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,dm=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fm=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,pm=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,mm=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,gm=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,xm=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,_m=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,vm=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,ym=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,bm=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Mm=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Sm=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,wm=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Tm=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Em=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Am=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Cm=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Pm=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Im=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Rm=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Lm=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,Nm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Dm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Um=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Fm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Om=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Bm=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,km=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,zm=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Vm=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Hm=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Gm=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Wm=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Xm=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,qm=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Ym=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Zm=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,jm=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Jm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Km=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,$m=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Qm=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,eg=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,tg=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,ng=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,ig=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,sg=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,rg=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,ag=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,og=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,lg=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,cg=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,hg=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,ug=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,dg=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,fg=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,pg=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,mg=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,gg=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,xg=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,_g=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,vg=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,yg=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,bg=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Mg=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Sg=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,wg=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Tg=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Eg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Ag=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Cg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Pg=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Ig=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Rg=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Lg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Ng=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Dg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Ug=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Fg=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Og=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Bg=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,kg=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,zg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Vg=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Hg=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Gg=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Wg=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Xg=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,qg=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Yg=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Zg=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,jg=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Jg=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Kg=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,$g=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Qg=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,e0=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,t0=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,n0=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,i0=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,s0=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,r0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,a0=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,o0=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,l0=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,c0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,at={alphahash_fragment:Ip,alphahash_pars_fragment:Rp,alphamap_fragment:Lp,alphamap_pars_fragment:Np,alphatest_fragment:Dp,alphatest_pars_fragment:Up,aomap_fragment:Fp,aomap_pars_fragment:Op,batching_pars_vertex:Bp,batching_vertex:kp,begin_vertex:zp,beginnormal_vertex:Vp,bsdfs:Hp,iridescence_fragment:Gp,bumpmap_pars_fragment:Wp,clipping_planes_fragment:Xp,clipping_planes_pars_fragment:qp,clipping_planes_pars_vertex:Yp,clipping_planes_vertex:Zp,color_fragment:jp,color_pars_fragment:Jp,color_pars_vertex:Kp,color_vertex:$p,common:Qp,cube_uv_reflection_fragment:em,defaultnormal_vertex:tm,displacementmap_pars_vertex:nm,displacementmap_vertex:im,emissivemap_fragment:sm,emissivemap_pars_fragment:rm,colorspace_fragment:am,colorspace_pars_fragment:om,envmap_fragment:lm,envmap_common_pars_fragment:cm,envmap_pars_fragment:hm,envmap_pars_vertex:um,envmap_physical_pars_fragment:Mm,envmap_vertex:dm,fog_vertex:fm,fog_pars_vertex:pm,fog_fragment:mm,fog_pars_fragment:gm,gradientmap_pars_fragment:xm,lightmap_pars_fragment:_m,lights_lambert_fragment:vm,lights_lambert_pars_fragment:ym,lights_pars_begin:bm,lights_toon_fragment:Sm,lights_toon_pars_fragment:wm,lights_phong_fragment:Tm,lights_phong_pars_fragment:Em,lights_physical_fragment:Am,lights_physical_pars_fragment:Cm,lights_fragment_begin:Pm,lights_fragment_maps:Im,lights_fragment_end:Rm,lightprobes_pars_fragment:Lm,logdepthbuf_fragment:Nm,logdepthbuf_pars_fragment:Dm,logdepthbuf_pars_vertex:Um,logdepthbuf_vertex:Fm,map_fragment:Om,map_pars_fragment:Bm,map_particle_fragment:km,map_particle_pars_fragment:zm,metalnessmap_fragment:Vm,metalnessmap_pars_fragment:Hm,morphinstance_vertex:Gm,morphcolor_vertex:Wm,morphnormal_vertex:Xm,morphtarget_pars_vertex:qm,morphtarget_vertex:Ym,normal_fragment_begin:Zm,normal_fragment_maps:jm,normal_pars_fragment:Jm,normal_pars_vertex:Km,normal_vertex:$m,normalmap_pars_fragment:Qm,clearcoat_normal_fragment_begin:eg,clearcoat_normal_fragment_maps:tg,clearcoat_pars_fragment:ng,iridescence_pars_fragment:ig,opaque_fragment:sg,packing:rg,premultiplied_alpha_fragment:ag,project_vertex:og,dithering_fragment:lg,dithering_pars_fragment:cg,roughnessmap_fragment:hg,roughnessmap_pars_fragment:ug,shadowmap_pars_fragment:dg,shadowmap_pars_vertex:fg,shadowmap_vertex:pg,shadowmask_pars_fragment:mg,skinbase_vertex:gg,skinning_pars_vertex:xg,skinning_vertex:_g,skinnormal_vertex:vg,specularmap_fragment:yg,specularmap_pars_fragment:bg,tonemapping_fragment:Mg,tonemapping_pars_fragment:Sg,transmission_fragment:wg,transmission_pars_fragment:Tg,uv_pars_fragment:Eg,uv_pars_vertex:Ag,uv_vertex:Cg,worldpos_vertex:Pg,background_vert:Ig,background_frag:Rg,backgroundCube_vert:Lg,backgroundCube_frag:Ng,cube_vert:Dg,cube_frag:Ug,depth_vert:Fg,depth_frag:Og,distance_vert:Bg,distance_frag:kg,equirect_vert:zg,equirect_frag:Vg,linedashed_vert:Hg,linedashed_frag:Gg,meshbasic_vert:Wg,meshbasic_frag:Xg,meshlambert_vert:qg,meshlambert_frag:Yg,meshmatcap_vert:Zg,meshmatcap_frag:jg,meshnormal_vert:Jg,meshnormal_frag:Kg,meshphong_vert:$g,meshphong_frag:Qg,meshphysical_vert:e0,meshphysical_frag:t0,meshtoon_vert:n0,meshtoon_frag:i0,points_vert:s0,points_frag:r0,shadow_vert:a0,shadow_frag:o0,sprite_vert:l0,sprite_frag:c0},Te={common:{diffuse:{value:new et(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Qe},alphaMap:{value:null},alphaMapTransform:{value:new Qe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Qe}},envmap:{envMap:{value:null},envMapRotation:{value:new Qe},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Qe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Qe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Qe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Qe},normalScale:{value:new Re(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Qe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Qe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Qe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Qe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new et(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new R},probesMax:{value:new R},probesResolution:{value:new R}},points:{diffuse:{value:new et(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Qe},alphaTest:{value:0},uvTransform:{value:new Qe}},sprite:{diffuse:{value:new et(16777215)},opacity:{value:1},center:{value:new Re(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Qe},alphaMap:{value:null},alphaMapTransform:{value:new Qe},alphaTest:{value:0}}},Xn={basic:{uniforms:Xt([Te.common,Te.specularmap,Te.envmap,Te.aomap,Te.lightmap,Te.fog]),vertexShader:at.meshbasic_vert,fragmentShader:at.meshbasic_frag},lambert:{uniforms:Xt([Te.common,Te.specularmap,Te.envmap,Te.aomap,Te.lightmap,Te.emissivemap,Te.bumpmap,Te.normalmap,Te.displacementmap,Te.fog,Te.lights,{emissive:{value:new et(0)},envMapIntensity:{value:1}}]),vertexShader:at.meshlambert_vert,fragmentShader:at.meshlambert_frag},phong:{uniforms:Xt([Te.common,Te.specularmap,Te.envmap,Te.aomap,Te.lightmap,Te.emissivemap,Te.bumpmap,Te.normalmap,Te.displacementmap,Te.fog,Te.lights,{emissive:{value:new et(0)},specular:{value:new et(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:at.meshphong_vert,fragmentShader:at.meshphong_frag},standard:{uniforms:Xt([Te.common,Te.envmap,Te.aomap,Te.lightmap,Te.emissivemap,Te.bumpmap,Te.normalmap,Te.displacementmap,Te.roughnessmap,Te.metalnessmap,Te.fog,Te.lights,{emissive:{value:new et(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:at.meshphysical_vert,fragmentShader:at.meshphysical_frag},toon:{uniforms:Xt([Te.common,Te.aomap,Te.lightmap,Te.emissivemap,Te.bumpmap,Te.normalmap,Te.displacementmap,Te.gradientmap,Te.fog,Te.lights,{emissive:{value:new et(0)}}]),vertexShader:at.meshtoon_vert,fragmentShader:at.meshtoon_frag},matcap:{uniforms:Xt([Te.common,Te.bumpmap,Te.normalmap,Te.displacementmap,Te.fog,{matcap:{value:null}}]),vertexShader:at.meshmatcap_vert,fragmentShader:at.meshmatcap_frag},points:{uniforms:Xt([Te.points,Te.fog]),vertexShader:at.points_vert,fragmentShader:at.points_frag},dashed:{uniforms:Xt([Te.common,Te.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:at.linedashed_vert,fragmentShader:at.linedashed_frag},depth:{uniforms:Xt([Te.common,Te.displacementmap]),vertexShader:at.depth_vert,fragmentShader:at.depth_frag},normal:{uniforms:Xt([Te.common,Te.bumpmap,Te.normalmap,Te.displacementmap,{opacity:{value:1}}]),vertexShader:at.meshnormal_vert,fragmentShader:at.meshnormal_frag},sprite:{uniforms:Xt([Te.sprite,Te.fog]),vertexShader:at.sprite_vert,fragmentShader:at.sprite_frag},background:{uniforms:{uvTransform:{value:new Qe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:at.background_vert,fragmentShader:at.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Qe}},vertexShader:at.backgroundCube_vert,fragmentShader:at.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:at.cube_vert,fragmentShader:at.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:at.equirect_vert,fragmentShader:at.equirect_frag},distance:{uniforms:Xt([Te.common,Te.displacementmap,{referencePosition:{value:new R},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:at.distance_vert,fragmentShader:at.distance_frag},shadow:{uniforms:Xt([Te.lights,Te.fog,{color:{value:new et(0)},opacity:{value:1}}]),vertexShader:at.shadow_vert,fragmentShader:at.shadow_frag}};Xn.physical={uniforms:Xt([Xn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Qe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Qe},clearcoatNormalScale:{value:new Re(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Qe},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Qe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Qe},sheen:{value:0},sheenColor:{value:new et(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Qe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Qe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Qe},transmissionSamplerSize:{value:new Re},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Qe},attenuationDistance:{value:0},attenuationColor:{value:new et(0)},specularColor:{value:new et(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Qe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Qe},anisotropyVector:{value:new Re},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Qe}}]),vertexShader:at.meshphysical_vert,fragmentShader:at.meshphysical_frag};var Xo={r:0,b:0,g:0},h0=new ft,ad=new Qe;ad.set(-1,0,0,0,1,0,0,0,1);function u0(i,e,t,n,s,r){let a=new et(0),o=s===!0?0:1,c,l,u=null,f=0,h=null;function d(C){let w=C.isScene===!0?C.background:null;if(w&&w.isTexture){let b=C.backgroundBlurriness>0;w=e.get(w,b)}return w}function _(C){let w=!1,b=d(C);b===null?x(a,o):b&&b.isColor&&(x(b,1),w=!0);let S=i.xr.getEnvironmentBlendMode();S==="additive"?t.buffers.color.setClear(0,0,0,1,r):S==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(i.autoClear||w)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function y(C,w){let b=d(w);b&&(b.isCubeTexture||b.mapping===Mr)?(l===void 0&&(l=new St(new kn(1,1,1),new jt({name:"BackgroundCubeMaterial",uniforms:Ki(Xn.backgroundCube.uniforms),vertexShader:Xn.backgroundCube.vertexShader,fragmentShader:Xn.backgroundCube.fragmentShader,side:Jt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),l.geometry.deleteAttribute("uv"),l.onBeforeRender=function(S,v,M){this.matrixWorld.copyPosition(M.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(l)),l.material.uniforms.envMap.value=b,l.material.uniforms.backgroundBlurriness.value=w.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=w.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(h0.makeRotationFromEuler(w.backgroundRotation)).transpose(),b.isCubeTexture&&b.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(ad),l.material.toneMapped=ct.getTransfer(b.colorSpace)!==pt,(u!==b||f!==b.version||h!==i.toneMapping)&&(l.material.needsUpdate=!0,u=b,f=b.version,h=i.toneMapping),l.layers.enableAll(),C.unshift(l,l.geometry,l.material,0,0,null)):b&&b.isTexture&&(c===void 0&&(c=new St(new ur(2,2),new jt({name:"BackgroundMaterial",uniforms:Ki(Xn.background.uniforms),vertexShader:Xn.background.vertexShader,fragmentShader:Xn.background.fragmentShader,side:ni,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(c)),c.material.uniforms.t2D.value=b,c.material.uniforms.backgroundIntensity.value=w.backgroundIntensity,c.material.toneMapped=ct.getTransfer(b.colorSpace)!==pt,b.matrixAutoUpdate===!0&&b.updateMatrix(),c.material.uniforms.uvTransform.value.copy(b.matrix),(u!==b||f!==b.version||h!==i.toneMapping)&&(c.material.needsUpdate=!0,u=b,f=b.version,h=i.toneMapping),c.layers.enableAll(),C.unshift(c,c.geometry,c.material,0,0,null))}function x(C,w){C.getRGB(Xo,Sc(i)),t.buffers.color.setClear(Xo.r,Xo.g,Xo.b,w,r)}function p(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(C,w=1){a.set(C),o=w,x(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(C){o=C,x(a,o)},render:_,addToRenderList:y,dispose:p}}function d0(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=h(null),r=s,a=!1;function o(I,L,N,V,F){let X=!1,H=f(I,V,N,L);r!==H&&(r=H,l(r.object)),X=d(I,V,N,F),X&&_(I,V,N,F),F!==null&&e.update(F,i.ELEMENT_ARRAY_BUFFER),(X||a)&&(a=!1,b(I,L,N,V),F!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(F).buffer))}function c(){return i.createVertexArray()}function l(I){return i.bindVertexArray(I)}function u(I){return i.deleteVertexArray(I)}function f(I,L,N,V){let F=V.wireframe===!0,X=n[L.id];X===void 0&&(X={},n[L.id]=X);let H=I.isInstancedMesh===!0?I.id:0,$=X[H];$===void 0&&($={},X[H]=$);let Q=$[N.id];Q===void 0&&(Q={},$[N.id]=Q);let de=Q[F];return de===void 0&&(de=h(c()),Q[F]=de),de}function h(I){let L=[],N=[],V=[];for(let F=0;F<t;F++)L[F]=0,N[F]=0,V[F]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:L,enabledAttributes:N,attributeDivisors:V,object:I,attributes:{},index:null}}function d(I,L,N,V){let F=r.attributes,X=L.attributes,H=0,$=N.getAttributes();for(let Q in $)if($[Q].location>=0){let fe=F[Q],ge=X[Q];if(ge===void 0&&(Q==="instanceMatrix"&&I.instanceMatrix&&(ge=I.instanceMatrix),Q==="instanceColor"&&I.instanceColor&&(ge=I.instanceColor)),fe===void 0||fe.attribute!==ge||ge&&fe.data!==ge.data)return!0;H++}return r.attributesNum!==H||r.index!==V}function _(I,L,N,V){let F={},X=L.attributes,H=0,$=N.getAttributes();for(let Q in $)if($[Q].location>=0){let fe=X[Q];fe===void 0&&(Q==="instanceMatrix"&&I.instanceMatrix&&(fe=I.instanceMatrix),Q==="instanceColor"&&I.instanceColor&&(fe=I.instanceColor));let ge={};ge.attribute=fe,fe&&fe.data&&(ge.data=fe.data),F[Q]=ge,H++}r.attributes=F,r.attributesNum=H,r.index=V}function y(){let I=r.newAttributes;for(let L=0,N=I.length;L<N;L++)I[L]=0}function x(I){p(I,0)}function p(I,L){let N=r.newAttributes,V=r.enabledAttributes,F=r.attributeDivisors;N[I]=1,V[I]===0&&(i.enableVertexAttribArray(I),V[I]=1),F[I]!==L&&(i.vertexAttribDivisor(I,L),F[I]=L)}function C(){let I=r.newAttributes,L=r.enabledAttributes;for(let N=0,V=L.length;N<V;N++)L[N]!==I[N]&&(i.disableVertexAttribArray(N),L[N]=0)}function w(I,L,N,V,F,X,H){H===!0?i.vertexAttribIPointer(I,L,N,F,X):i.vertexAttribPointer(I,L,N,V,F,X)}function b(I,L,N,V){y();let F=V.attributes,X=N.getAttributes(),H=L.defaultAttributeValues;for(let $ in X){let Q=X[$];if(Q.location>=0){let de=F[$];if(de===void 0&&($==="instanceMatrix"&&I.instanceMatrix&&(de=I.instanceMatrix),$==="instanceColor"&&I.instanceColor&&(de=I.instanceColor)),de!==void 0){let fe=de.normalized,ge=de.itemSize,ze=e.get(de);if(ze===void 0)continue;let he=ze.buffer,Ie=ze.type,q=ze.bytesPerElement,O=Ie===i.INT||Ie===i.UNSIGNED_INT||de.gpuType===ro;if(de.isInterleavedBufferAttribute){let z=de.data,j=z.stride,se=de.offset;if(z.isInstancedInterleavedBuffer){for(let oe=0;oe<Q.locationSize;oe++)p(Q.location+oe,z.meshPerAttribute);I.isInstancedMesh!==!0&&V._maxInstanceCount===void 0&&(V._maxInstanceCount=z.meshPerAttribute*z.count)}else for(let oe=0;oe<Q.locationSize;oe++)x(Q.location+oe);i.bindBuffer(i.ARRAY_BUFFER,he);for(let oe=0;oe<Q.locationSize;oe++)w(Q.location+oe,ge/Q.locationSize,Ie,fe,j*q,(se+ge/Q.locationSize*oe)*q,O)}else{if(de.isInstancedBufferAttribute){for(let z=0;z<Q.locationSize;z++)p(Q.location+z,de.meshPerAttribute);I.isInstancedMesh!==!0&&V._maxInstanceCount===void 0&&(V._maxInstanceCount=de.meshPerAttribute*de.count)}else for(let z=0;z<Q.locationSize;z++)x(Q.location+z);i.bindBuffer(i.ARRAY_BUFFER,he);for(let z=0;z<Q.locationSize;z++)w(Q.location+z,ge/Q.locationSize,Ie,fe,ge*q,ge/Q.locationSize*z*q,O)}}else if(H!==void 0){let fe=H[$];if(fe!==void 0)switch(fe.length){case 2:i.vertexAttrib2fv(Q.location,fe);break;case 3:i.vertexAttrib3fv(Q.location,fe);break;case 4:i.vertexAttrib4fv(Q.location,fe);break;default:i.vertexAttrib1fv(Q.location,fe)}}}}C()}function S(){T();for(let I in n){let L=n[I];for(let N in L){let V=L[N];for(let F in V){let X=V[F];for(let H in X)u(X[H].object),delete X[H];delete V[F]}}delete n[I]}}function v(I){if(n[I.id]===void 0)return;let L=n[I.id];for(let N in L){let V=L[N];for(let F in V){let X=V[F];for(let H in X)u(X[H].object),delete X[H];delete V[F]}}delete n[I.id]}function M(I){for(let L in n){let N=n[L];for(let V in N){let F=N[V];if(F[I.id]===void 0)continue;let X=F[I.id];for(let H in X)u(X[H].object),delete X[H];delete F[I.id]}}}function m(I){for(let L in n){let N=n[L],V=I.isInstancedMesh===!0?I.id:0,F=N[V];if(F!==void 0){for(let X in F){let H=F[X];for(let $ in H)u(H[$].object),delete H[$];delete F[X]}delete N[V],Object.keys(N).length===0&&delete n[L]}}}function T(){P(),a=!0,r!==s&&(r=s,l(r.object))}function P(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:T,resetDefaultState:P,dispose:S,releaseStatesOfGeometry:v,releaseStatesOfObject:m,releaseStatesOfProgram:M,initAttributes:y,enableAttribute:x,disableUnusedAttributes:C}}function f0(i,e,t){let n;function s(c){n=c}function r(c,l){i.drawArrays(n,c,l),t.update(l,n,1)}function a(c,l,u){u!==0&&(i.drawArraysInstanced(n,c,l,u),t.update(l,n,u))}function o(c,l,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,l,0,u);let h=0;for(let d=0;d<u;d++)h+=l[d];t.update(h,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function p0(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let M=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(M.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(M){return!(M!==bn&&n.convert(M)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(M){let m=M===Gn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(M!==Qt&&n.convert(M)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&M!==yn&&!m)}function c(M){if(M==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";M="mediump"}return M==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp",u=c(l);u!==l&&(qe("WebGLRenderer:",l,"not supported, using",u,"instead."),l=u);let f=t.logarithmicDepthBuffer===!0,h=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&h===!1&&qe("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let d=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),y=i.getParameter(i.MAX_TEXTURE_SIZE),x=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),C=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),w=i.getParameter(i.MAX_VARYING_VECTORS),b=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),S=i.getParameter(i.MAX_SAMPLES),v=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:a,textureTypeReadable:o,precision:l,logarithmicDepthBuffer:f,reversedDepthBuffer:h,maxTextures:d,maxVertexTextures:_,maxTextureSize:y,maxCubemapSize:x,maxAttributes:p,maxVertexUniforms:C,maxVaryings:w,maxFragmentUniforms:b,maxSamples:S,samples:v}}function m0(i){let e=this,t=null,n=0,s=!1,r=!1,a=new mn,o=new Qe,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(f,h){let d=f.length!==0||h||n!==0||s;return s=h,n=f.length,d},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(f,h){t=u(f,h,0)},this.setState=function(f,h,d){let _=f.clippingPlanes,y=f.clipIntersection,x=f.clipShadows,p=i.get(f);if(!s||_===null||_.length===0||r&&!x)r?u(null):l();else{let C=r?0:n,w=C*4,b=p.clippingState||null;c.value=b,b=u(_,h,w,d);for(let S=0;S!==w;++S)b[S]=t[S];p.clippingState=b,this.numIntersection=y?this.numPlanes:0,this.numPlanes+=C}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(f,h,d,_){let y=f!==null?f.length:0,x=null;if(y!==0){if(x=c.value,_!==!0||x===null){let p=d+y*4,C=h.matrixWorldInverse;o.getNormalMatrix(C),(x===null||x.length<p)&&(x=new Float32Array(p));for(let w=0,b=d;w!==y;++w,b+=4)a.copy(f[w]).applyMatrix4(C,o),a.normal.toArray(x,b),x[b+3]=a.constant}c.value=x,c.needsUpdate=!0}return e.numPlanes=y,e.numIntersection=0,x}}var Ri=4,Ou=[.125,.215,.35,.446,.526,.582],$i=20,g0=256,Rr=new Vn,Bu=new et,Ac=null,Cc=0,Pc=0,Ic=!1,x0=new R,Yo=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){let{size:a=256,position:o=x0}=r;Ac=this._renderer.getRenderTarget(),Cc=this._renderer.getActiveCubeFace(),Pc=this._renderer.getActiveMipmapLevel(),Ic=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(e,n,s,c,o),t>0&&this._blur(c,0,0,t),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Vu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=zu(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Ac,Cc,Pc),this._renderer.xr.enabled=Ic,e.scissorTest=!1,Rs(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Ai||e.mapping===Ji?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Ac=this._renderer.getRenderTarget(),Cc=this._renderer.getActiveCubeFace(),Pc=this._renderer.getActiveMipmapLevel(),Ic=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:zt,minFilter:zt,generateMipmaps:!1,type:Gn,format:bn,colorSpace:Ks,depthBuffer:!1},s=ku(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=ku(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=_0(r)),this._blurMaterial=y0(r,e,t),this._ggxMaterial=v0(r,e,t)}return s}_compileMaterial(e){let t=new St(new Lt,e);this._renderer.compile(t,Rr)}_sceneToCubeUV(e,t,n,s,r){let c=new Bt(90,1,t,n),l=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],f=this._renderer,h=f.autoClear,d=f.toneMapping;f.getClearColor(Bu),f.toneMapping=Rn,f.autoClear=!1,f.state.buffers.depth.getReversed()&&(f.setRenderTarget(s),f.clearDepth(),f.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new St(new kn,new Xi({name:"PMREM.Background",side:Jt,depthWrite:!1,depthTest:!1})));let y=this._backgroundBox,x=y.material,p=!1,C=e.background;C?C.isColor&&(x.color.copy(C),e.background=null,p=!0):(x.color.copy(Bu),p=!0);for(let w=0;w<6;w++){let b=w%3;b===0?(c.up.set(0,l[w],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x+u[w],r.y,r.z)):b===1?(c.up.set(0,0,l[w]),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y+u[w],r.z)):(c.up.set(0,l[w],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y,r.z+u[w]));let S=this._cubeSize;Rs(s,b*S,w>2?S:0,S,S),f.setRenderTarget(s),p&&f.render(y,c),f.render(e,c)}f.toneMapping=d,f.autoClear=h,e.background=C}_textureToCubeUV(e,t){let n=this._renderer,s=e.mapping===Ai||e.mapping===Ji;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Vu()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=zu());let r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=e;let c=this._cubeSize;Rs(t,0,0,3*c,2*c),n.setRenderTarget(t),n.render(a,Rr)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=n}_applyGGXFilter(e,t,n){let s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let c=a.uniforms,l=n/(this._lodMeshes.length-1),u=t/(this._lodMeshes.length-1),f=Math.sqrt(l*l-u*u),h=0+l*1.25,d=f*h,{_lodMax:_}=this,y=this._sizeLods[n],x=3*y*(n>_-Ri?n-_+Ri:0),p=4*(this._cubeSize-y);c.envMap.value=e.texture,c.roughness.value=d,c.mipInt.value=_-t,Rs(r,x,p,3*y,2*y),s.setRenderTarget(r),s.render(o,Rr),c.envMap.value=r.texture,c.roughness.value=0,c.mipInt.value=_-n,Rs(e,x,p,3*y,2*y),s.setRenderTarget(e),s.render(o,Rr)}_blur(e,t,n,s,r){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,s,"latitudinal",r),this._halfBlur(a,e,n,n,s,"longitudinal",r)}_halfBlur(e,t,n,s,r,a,o){let c=this._renderer,l=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&Je("blur direction must be either latitudinal or longitudinal!");let u=3,f=this._lodMeshes[s];f.material=l;let h=l.uniforms,d=this._sizeLods[n]-1,_=isFinite(r)?Math.PI/(2*d):2*Math.PI/(2*$i-1),y=r/_,x=isFinite(r)?1+Math.floor(u*y):$i;x>$i&&qe(`sigmaRadians, ${r}, is too large and will clip, as it requested ${x} samples when the maximum is set to ${$i}`);let p=[],C=0;for(let M=0;M<$i;++M){let m=M/y,T=Math.exp(-m*m/2);p.push(T),M===0?C+=T:M<x&&(C+=2*T)}for(let M=0;M<p.length;M++)p[M]=p[M]/C;h.envMap.value=e.texture,h.samples.value=x,h.weights.value=p,h.latitudinal.value=a==="latitudinal",o&&(h.poleAxis.value=o);let{_lodMax:w}=this;h.dTheta.value=_,h.mipInt.value=w-n;let b=this._sizeLods[s],S=3*b*(s>w-Ri?s-w+Ri:0),v=4*(this._cubeSize-b);Rs(t,S,v,3*b,2*b),c.setRenderTarget(t),c.render(f,Rr)}};function _0(i){let e=[],t=[],n=[],s=i,r=i-Ri+1+Ou.length;for(let a=0;a<r;a++){let o=Math.pow(2,s);e.push(o);let c=1/o;a>i-Ri?c=Ou[a-i+Ri-1]:a===0&&(c=0),t.push(c);let l=1/(o-2),u=-l,f=1+l,h=[u,u,f,u,f,f,u,u,f,f,u,f],d=6,_=6,y=3,x=2,p=1,C=new Float32Array(y*_*d),w=new Float32Array(x*_*d),b=new Float32Array(p*_*d);for(let v=0;v<d;v++){let M=v%3*2/3-1,m=v>2?0:-1,T=[M,m,0,M+2/3,m,0,M+2/3,m+1,0,M,m,0,M+2/3,m+1,0,M,m+1,0];C.set(T,y*_*v),w.set(h,x*_*v);let P=[v,v,v,v,v,v];b.set(P,p*_*v)}let S=new Lt;S.setAttribute("position",new Yt(C,y)),S.setAttribute("uv",new Yt(w,x)),S.setAttribute("faceIndex",new Yt(b,p)),n.push(new St(S,null)),s>Ri&&s--}return{lodMeshes:n,sizeLods:e,sigmas:t}}function ku(i,e,t){let n=new Zt(i,e,t);return n.texture.mapping=Mr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Rs(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function v0(i,e,t){return new jt({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:g0,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:jo(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:Hn,depthTest:!1,depthWrite:!1})}function y0(i,e,t){let n=new Float32Array($i),s=new R(0,1,0);return new jt({name:"SphericalGaussianBlur",defines:{n:$i,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:jo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Hn,depthTest:!1,depthWrite:!1})}function zu(){return new jt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:jo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Hn,depthTest:!1,depthWrite:!1})}function Vu(){return new jt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:jo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Hn,depthTest:!1,depthWrite:!1})}function jo(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}var Zo=class extends Zt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new ar(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new kn(5,5,5),r=new jt({name:"CubemapFromEquirect",uniforms:Ki(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Jt,blending:Hn});r.uniforms.tEquirect.value=t;let a=new St(s,r),o=t.minFilter;return t.minFilter===Ci&&(t.minFilter=zt),new eo(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){let r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}};function b0(i){let e=new WeakMap,t=new WeakMap,n=null;function s(h,d=!1){return h==null?null:d?a(h):r(h)}function r(h){if(h&&h.isTexture){let d=h.mapping;if(d===no||d===io)if(e.has(h)){let _=e.get(h).texture;return o(_,h.mapping)}else{let _=h.image;if(_&&_.height>0){let y=new Zo(_.height);return y.fromEquirectangularTexture(i,h),e.set(h,y),h.addEventListener("dispose",l),o(y.texture,h.mapping)}else return null}}return h}function a(h){if(h&&h.isTexture){let d=h.mapping,_=d===no||d===io,y=d===Ai||d===Ji;if(_||y){let x=t.get(h),p=x!==void 0?x.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==p)return n===null&&(n=new Yo(i)),x=_?n.fromEquirectangular(h,x):n.fromCubemap(h,x),x.texture.pmremVersion=h.pmremVersion,t.set(h,x),x.texture;if(x!==void 0)return x.texture;{let C=h.image;return _&&C&&C.height>0||y&&C&&c(C)?(n===null&&(n=new Yo(i)),x=_?n.fromEquirectangular(h):n.fromCubemap(h),x.texture.pmremVersion=h.pmremVersion,t.set(h,x),h.addEventListener("dispose",u),x.texture):null}}}return h}function o(h,d){return d===no?h.mapping=Ai:d===io&&(h.mapping=Ji),h}function c(h){let d=0,_=6;for(let y=0;y<_;y++)h[y]!==void 0&&d++;return d===_}function l(h){let d=h.target;d.removeEventListener("dispose",l);let _=e.get(d);_!==void 0&&(e.delete(d),_.dispose())}function u(h){let d=h.target;d.removeEventListener("dispose",u);let _=t.get(d);_!==void 0&&(t.delete(d),_.dispose())}function f(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:f}}function M0(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&zi("WebGLRenderer: "+n+" extension not supported."),s}}}function S0(i,e,t,n){let s={},r=new WeakMap;function a(f){let h=f.target;h.index!==null&&e.remove(h.index);for(let _ in h.attributes)e.remove(h.attributes[_]);h.removeEventListener("dispose",a),delete s[h.id];let d=r.get(h);d&&(e.remove(d),r.delete(h)),n.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,t.memory.geometries--}function o(f,h){return s[h.id]===!0||(h.addEventListener("dispose",a),s[h.id]=!0,t.memory.geometries++),h}function c(f){let h=f.attributes;for(let d in h)e.update(h[d],i.ARRAY_BUFFER)}function l(f){let h=[],d=f.index,_=f.attributes.position,y=0;if(_===void 0)return;if(d!==null){let C=d.array;y=d.version;for(let w=0,b=C.length;w<b;w+=3){let S=C[w+0],v=C[w+1],M=C[w+2];h.push(S,v,v,M,M,S)}}else{let C=_.array;y=_.version;for(let w=0,b=C.length/3-1;w<b;w+=3){let S=w+0,v=w+1,M=w+2;h.push(S,v,v,M,M,S)}}let x=new(_.count>=65535?nr:Gi)(h,1);x.version=y;let p=r.get(f);p&&e.remove(p),r.set(f,x)}function u(f){let h=r.get(f);if(h){let d=f.index;d!==null&&h.version<d.version&&l(f)}else l(f);return r.get(f)}return{get:o,update:c,getWireframeAttribute:u}}function w0(i,e,t){let n;function s(f){n=f}let r,a;function o(f){r=f.type,a=f.bytesPerElement}function c(f,h){i.drawElements(n,h,r,f*a),t.update(h,n,1)}function l(f,h,d){d!==0&&(i.drawElementsInstanced(n,h,r,f*a,d),t.update(h,n,d))}function u(f,h,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,h,0,r,f,0,d);let y=0;for(let x=0;x<d;x++)y+=h[x];t.update(y,n,1)}this.setMode=s,this.setIndex=o,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function T0(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:Je("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function E0(i,e,t){let n=new WeakMap,s=new wt;function r(a,o,c){let l=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,f=u!==void 0?u.length:0,h=n.get(o);if(h===void 0||h.count!==f){let T=function(){M.dispose(),n.delete(o),o.removeEventListener("dispose",T)};h!==void 0&&h.texture.dispose();let d=o.morphAttributes.position!==void 0,_=o.morphAttributes.normal!==void 0,y=o.morphAttributes.color!==void 0,x=o.morphAttributes.position||[],p=o.morphAttributes.normal||[],C=o.morphAttributes.color||[],w=0;d===!0&&(w=1),_===!0&&(w=2),y===!0&&(w=3);let b=o.attributes.position.count*w,S=1;b>e.maxTextureSize&&(S=Math.ceil(b/e.maxTextureSize),b=e.maxTextureSize);let v=new Float32Array(b*S*4*f),M=new tr(v,b,S,f);M.type=yn,M.needsUpdate=!0;let m=w*4;for(let P=0;P<f;P++){let I=x[P],L=p[P],N=C[P],V=b*S*4*P;for(let F=0;F<I.count;F++){let X=F*m;d===!0&&(s.fromBufferAttribute(I,F),v[V+X+0]=s.x,v[V+X+1]=s.y,v[V+X+2]=s.z,v[V+X+3]=0),_===!0&&(s.fromBufferAttribute(L,F),v[V+X+4]=s.x,v[V+X+5]=s.y,v[V+X+6]=s.z,v[V+X+7]=0),y===!0&&(s.fromBufferAttribute(N,F),v[V+X+8]=s.x,v[V+X+9]=s.y,v[V+X+10]=s.z,v[V+X+11]=N.itemSize===4?s.w:1)}}h={count:f,texture:M,size:new Re(b,S)},n.set(o,h),o.addEventListener("dispose",T)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)c.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let d=0;for(let y=0;y<l.length;y++)d+=l[y];let _=o.morphTargetsRelative?1:1-d;c.getUniforms().setValue(i,"morphTargetBaseInfluence",_),c.getUniforms().setValue(i,"morphTargetInfluences",l)}c.getUniforms().setValue(i,"morphTargetsTexture",h.texture,t),c.getUniforms().setValue(i,"morphTargetsTextureSize",h.size)}return{update:r}}function A0(i,e,t,n,s){let r=new WeakMap;function a(l){let u=s.render.frame,f=l.geometry,h=e.get(l,f);if(r.get(h)!==u&&(e.update(h),r.set(h,u)),l.isInstancedMesh&&(l.hasEventListener("dispose",c)===!1&&l.addEventListener("dispose",c),r.get(l)!==u&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),r.set(l,u))),l.isSkinnedMesh){let d=l.skeleton;r.get(d)!==u&&(d.update(),r.set(d,u))}return h}function o(){r=new WeakMap}function c(l){let u=l.target;u.removeEventListener("dispose",c),n.releaseStatesOfObject(u),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:a,dispose:o}}var C0={[ac]:"LINEAR_TONE_MAPPING",[oc]:"REINHARD_TONE_MAPPING",[lc]:"CINEON_TONE_MAPPING",[cc]:"ACES_FILMIC_TONE_MAPPING",[uc]:"AGX_TONE_MAPPING",[dc]:"NEUTRAL_TONE_MAPPING",[hc]:"CUSTOM_TONE_MAPPING"};function P0(i,e,t,n,s,r){let a=new Zt(e,t,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,depthTexture:s?new ri(e,t):void 0}),o=new Zt(e,t,{type:Gn,depthBuffer:!1,stencilBuffer:!1}),c=new Lt;c.setAttribute("position",new mt([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new mt([0,2,0,0,2,0],2));let l=new Va({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),u=new St(c,l),f=new Vn(-1,1,1,-1,0,1),h=null,d=null,_=!1,y,x=null,p=[],C=!1;this.setSize=function(w,b){a.setSize(w,b),o.setSize(w,b);for(let S=0;S<p.length;S++){let v=p[S];v.setSize&&v.setSize(w,b)}},this.setEffects=function(w){p=w,C=p.length>0&&p[0].isRenderPass===!0;let b=a.width,S=a.height;for(let v=0;v<p.length;v++){let M=p[v];M.setSize&&M.setSize(b,S)}},this.begin=function(w,b){if(_||w.toneMapping===Rn&&p.length===0)return!1;if(x=b,b!==null){let S=b.width,v=b.height;(a.width!==S||a.height!==v)&&this.setSize(S,v)}return C===!1&&w.setRenderTarget(a),y=w.toneMapping,w.toneMapping=Rn,!0},this.hasRenderPass=function(){return C},this.end=function(w,b){w.toneMapping=y,_=!0;let S=a,v=o;for(let M=0;M<p.length;M++){let m=p[M];if(m.enabled!==!1&&(m.render(w,v,S,b),m.needsSwap!==!1)){let T=S;S=v,v=T}}if(h!==w.outputColorSpace||d!==w.toneMapping){h=w.outputColorSpace,d=w.toneMapping,l.defines={},ct.getTransfer(h)===pt&&(l.defines.SRGB_TRANSFER="");let M=C0[d];M&&(l.defines[M]=""),l.needsUpdate=!0}l.uniforms.tDiffuse.value=S.texture,w.setRenderTarget(x),w.render(u,f),x=null,_=!1},this.isCompositing=function(){return _},this.dispose=function(){a.depthTexture&&a.depthTexture.dispose(),a.dispose(),o.dispose(),c.dispose(),l.dispose()}}var od=new $t,Nc=new ri(1,1),ld=new tr,cd=new Ca,hd=new ar,Hu=[],Gu=[],Wu=new Float32Array(16),Xu=new Float32Array(9),qu=new Float32Array(4);function Ns(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=Hu[s];if(r===void 0&&(r=new Float32Array(s),Hu[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function Dt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Ut(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Jo(i,e){let t=Gu[e];t===void 0&&(t=new Int32Array(e),Gu[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function I0(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function R0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Dt(t,e))return;i.uniform2fv(this.addr,e),Ut(t,e)}}function L0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Dt(t,e))return;i.uniform3fv(this.addr,e),Ut(t,e)}}function N0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Dt(t,e))return;i.uniform4fv(this.addr,e),Ut(t,e)}}function D0(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Dt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Ut(t,e)}else{if(Dt(t,n))return;qu.set(n),i.uniformMatrix2fv(this.addr,!1,qu),Ut(t,n)}}function U0(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Dt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Ut(t,e)}else{if(Dt(t,n))return;Xu.set(n),i.uniformMatrix3fv(this.addr,!1,Xu),Ut(t,n)}}function F0(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Dt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Ut(t,e)}else{if(Dt(t,n))return;Wu.set(n),i.uniformMatrix4fv(this.addr,!1,Wu),Ut(t,n)}}function O0(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function B0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Dt(t,e))return;i.uniform2iv(this.addr,e),Ut(t,e)}}function k0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Dt(t,e))return;i.uniform3iv(this.addr,e),Ut(t,e)}}function z0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Dt(t,e))return;i.uniform4iv(this.addr,e),Ut(t,e)}}function V0(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function H0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Dt(t,e))return;i.uniform2uiv(this.addr,e),Ut(t,e)}}function G0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Dt(t,e))return;i.uniform3uiv(this.addr,e),Ut(t,e)}}function W0(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Dt(t,e))return;i.uniform4uiv(this.addr,e),Ut(t,e)}}function X0(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Nc.compareFunction=t.isReversedDepthBuffer()?Wo:Go,r=Nc):r=od,t.setTexture2D(e||r,s)}function q0(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||cd,s)}function Y0(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||hd,s)}function Z0(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||ld,s)}function j0(i){switch(i){case 5126:return I0;case 35664:return R0;case 35665:return L0;case 35666:return N0;case 35674:return D0;case 35675:return U0;case 35676:return F0;case 5124:case 35670:return O0;case 35667:case 35671:return B0;case 35668:case 35672:return k0;case 35669:case 35673:return z0;case 5125:return V0;case 36294:return H0;case 36295:return G0;case 36296:return W0;case 35678:case 36198:case 36298:case 36306:case 35682:return X0;case 35679:case 36299:case 36307:return q0;case 35680:case 36300:case 36308:case 36293:return Y0;case 36289:case 36303:case 36311:case 36292:return Z0}}function J0(i,e){i.uniform1fv(this.addr,e)}function K0(i,e){let t=Ns(e,this.size,2);i.uniform2fv(this.addr,t)}function $0(i,e){let t=Ns(e,this.size,3);i.uniform3fv(this.addr,t)}function Q0(i,e){let t=Ns(e,this.size,4);i.uniform4fv(this.addr,t)}function ex(i,e){let t=Ns(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function tx(i,e){let t=Ns(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function nx(i,e){let t=Ns(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function ix(i,e){i.uniform1iv(this.addr,e)}function sx(i,e){i.uniform2iv(this.addr,e)}function rx(i,e){i.uniform3iv(this.addr,e)}function ax(i,e){i.uniform4iv(this.addr,e)}function ox(i,e){i.uniform1uiv(this.addr,e)}function lx(i,e){i.uniform2uiv(this.addr,e)}function cx(i,e){i.uniform3uiv(this.addr,e)}function hx(i,e){i.uniform4uiv(this.addr,e)}function ux(i,e,t){let n=this.cache,s=e.length,r=Jo(t,s);Dt(n,r)||(i.uniform1iv(this.addr,r),Ut(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=Nc:a=od;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function dx(i,e,t){let n=this.cache,s=e.length,r=Jo(t,s);Dt(n,r)||(i.uniform1iv(this.addr,r),Ut(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||cd,r[a])}function fx(i,e,t){let n=this.cache,s=e.length,r=Jo(t,s);Dt(n,r)||(i.uniform1iv(this.addr,r),Ut(n,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||hd,r[a])}function px(i,e,t){let n=this.cache,s=e.length,r=Jo(t,s);Dt(n,r)||(i.uniform1iv(this.addr,r),Ut(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||ld,r[a])}function mx(i){switch(i){case 5126:return J0;case 35664:return K0;case 35665:return $0;case 35666:return Q0;case 35674:return ex;case 35675:return tx;case 35676:return nx;case 5124:case 35670:return ix;case 35667:case 35671:return sx;case 35668:case 35672:return rx;case 35669:case 35673:return ax;case 5125:return ox;case 36294:return lx;case 36295:return cx;case 36296:return hx;case 35678:case 36198:case 36298:case 36306:case 35682:return ux;case 35679:case 36299:case 36307:return dx;case 35680:case 36300:case 36308:case 36293:return fx;case 36289:case 36303:case 36311:case 36292:return px}}var Dc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=j0(t.type)}},Uc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=mx(t.type)}},Fc=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(e,t[o.id],n)}}},Rc=/(\w+)(\])?(\[|\.)?/g;function Yu(i,e){i.seq.push(e),i.map[e.id]=e}function gx(i,e,t){let n=i.name,s=n.length;for(Rc.lastIndex=0;;){let r=Rc.exec(n),a=Rc.lastIndex,o=r[1],c=r[2]==="]",l=r[3];if(c&&(o=o|0),l===void 0||l==="["&&a+2===s){Yu(t,l===void 0?new Dc(o,i,e):new Uc(o,i,e));break}else{let f=t.map[o];f===void 0&&(f=new Fc(o),Yu(t,f)),t=f}}}var Ls=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){let o=e.getActiveUniform(t,a),c=e.getUniformLocation(t,o.name);gx(o,c,this)}let s=[],r=[];for(let a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){let o=t[r],c=n[o.id];c.needsUpdate!==!1&&o.setValue(e,c.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let a=e[s];a.id in t&&n.push(a)}return n}};function Zu(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var xx=37297,_x=0;function vx(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}var ju=new Qe;function yx(i){ct._getMatrix(ju,ct.workingColorSpace,i);let e=`mat3( ${ju.elements.map(t=>t.toFixed(4))} )`;switch(ct.getTransfer(i)){case $s:return[e,"LinearTransferOETF"];case pt:return[e,"sRGBTransferOETF"];default:return qe("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function Ju(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+vx(i.getShaderSource(e),o)}else return r}function bx(i,e){let t=yx(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}var Mx={[ac]:"Linear",[oc]:"Reinhard",[lc]:"Cineon",[cc]:"ACESFilmic",[uc]:"AgX",[dc]:"Neutral",[hc]:"Custom"};function Sx(i,e){let t=Mx[e];return t===void 0?(qe("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var qo=new R;function wx(){ct.getLuminanceCoefficients(qo);let i=qo.x.toFixed(4),e=qo.y.toFixed(4),t=qo.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Tx(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Nr).join(`
`)}function Ex(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function Ax(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function Nr(i){return i!==""}function Ku(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function $u(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var Cx=/^[ \t]*#include +<([\w\d./]+)>/gm;function Oc(i){return i.replace(Cx,Ix)}var Px=new Map;function Ix(i,e){let t=at[e];if(t===void 0){let n=Px.get(e);if(n!==void 0)t=at[n],qe('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return Oc(t)}var Rx=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Qu(i){return i.replace(Rx,Lx)}function Lx(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function ed(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}var Nx={[br]:"SHADOWMAP_TYPE_PCF",[As]:"SHADOWMAP_TYPE_VSM"};function Dx(i){return Nx[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var Ux={[Ai]:"ENVMAP_TYPE_CUBE",[Ji]:"ENVMAP_TYPE_CUBE",[Mr]:"ENVMAP_TYPE_CUBE_UV"};function Fx(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":Ux[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var Ox={[Ji]:"ENVMAP_MODE_REFRACTION"};function Bx(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":Ox[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var kx={[rc]:"ENVMAP_BLENDING_MULTIPLY",[vu]:"ENVMAP_BLENDING_MIX",[yu]:"ENVMAP_BLENDING_ADD"};function zx(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":kx[i.combine]||"ENVMAP_BLENDING_NONE"}function Vx(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function Hx(i,e,t,n){let s=i.getContext(),r=t.defines,a=t.vertexShader,o=t.fragmentShader,c=Dx(t),l=Fx(t),u=Bx(t),f=zx(t),h=Vx(t),d=Tx(t),_=Ex(r),y=s.createProgram(),x,p,C=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(x=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter(Nr).join(`
`),x.length>0&&(x+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter(Nr).join(`
`),p.length>0&&(p+=`
`)):(x=[ed(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Nr).join(`
`),p=[ed(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+u:"",t.envMap?"#define "+f:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Rn?"#define TONE_MAPPING":"",t.toneMapping!==Rn?at.tonemapping_pars_fragment:"",t.toneMapping!==Rn?Sx("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",at.colorspace_pars_fragment,bx("linearToOutputTexel",t.outputColorSpace),wx(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Nr).join(`
`)),a=Oc(a),a=Ku(a,t),a=$u(a,t),o=Oc(o),o=Ku(o,t),o=$u(o,t),a=Qu(a),o=Qu(o),t.isRawShaderMaterial!==!0&&(C=`#version 300 es
`,x=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+x,p=["#define varying in",t.glslVersion===yc?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===yc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let w=C+x+a,b=C+p+o,S=Zu(s,s.VERTEX_SHADER,w),v=Zu(s,s.FRAGMENT_SHADER,b);s.attachShader(y,S),s.attachShader(y,v),t.index0AttributeName!==void 0?s.bindAttribLocation(y,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(y,0,"position"),s.linkProgram(y);function M(I){if(i.debug.checkShaderErrors){let L=s.getProgramInfoLog(y)||"",N=s.getShaderInfoLog(S)||"",V=s.getShaderInfoLog(v)||"",F=L.trim(),X=N.trim(),H=V.trim(),$=!0,Q=!0;if(s.getProgramParameter(y,s.LINK_STATUS)===!1)if($=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,y,S,v);else{let de=Ju(s,S,"vertex"),fe=Ju(s,v,"fragment");Je("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(y,s.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+F+`
`+de+`
`+fe)}else F!==""?qe("WebGLProgram: Program Info Log:",F):(X===""||H==="")&&(Q=!1);Q&&(I.diagnostics={runnable:$,programLog:F,vertexShader:{log:X,prefix:x},fragmentShader:{log:H,prefix:p}})}s.deleteShader(S),s.deleteShader(v),m=new Ls(s,y),T=Ax(s,y)}let m;this.getUniforms=function(){return m===void 0&&M(this),m};let T;this.getAttributes=function(){return T===void 0&&M(this),T};let P=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return P===!1&&(P=s.getProgramParameter(y,xx)),P},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(y),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=_x++,this.cacheKey=e,this.usedTimes=1,this.program=y,this.vertexShader=S,this.fragmentShader=v,this}var Gx=0,Bc=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new kc(e),t.set(e,n)),n}},kc=class{constructor(e){this.id=Gx++,this.code=e,this.usedTimes=0}};function Wx(i){return i===Ii||i===Cr||i===Pr}function Xx(i,e,t,n,s,r){let a=new bs,o=new Bc,c=new Set,l=[],u=new Map,f=n.logarithmicDepthBuffer,h=n.precision,d={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(m){return c.add(m),m===0?"uv":`uv${m}`}function y(m,T,P,I,L,N){let V=I.fog,F=L.geometry,X=m.isMeshStandardMaterial||m.isMeshLambertMaterial||m.isMeshPhongMaterial?I.environment:null,H=m.isMeshStandardMaterial||m.isMeshLambertMaterial&&!m.envMap||m.isMeshPhongMaterial&&!m.envMap,$=e.get(m.envMap||X,H),Q=$&&$.mapping===Mr?$.image.height:null,de=d[m.type];m.precision!==null&&(h=n.getMaxPrecision(m.precision),h!==m.precision&&qe("WebGLProgram.getParameters:",m.precision,"not supported, using",h,"instead."));let fe=F.morphAttributes.position||F.morphAttributes.normal||F.morphAttributes.color,ge=fe!==void 0?fe.length:0,ze=0;F.morphAttributes.position!==void 0&&(ze=1),F.morphAttributes.normal!==void 0&&(ze=2),F.morphAttributes.color!==void 0&&(ze=3);let he,Ie,q,O;if(de){let De=Xn[de];he=De.vertexShader,Ie=De.fragmentShader}else{he=m.vertexShader,Ie=m.fragmentShader;let De=o.getVertexShaderStage(m),ht=o.getFragmentShaderStage(m);o.update(m,De,ht),q=De.id,O=ht.id}let z=i.getRenderTarget(),j=i.state.buffers.depth.getReversed(),se=L.isInstancedMesh===!0,oe=L.isBatchedMesh===!0,ue=!!m.map,me=!!m.matcap,pe=!!$,_e=!!m.aoMap,ee=!!m.lightMap,Me=!!m.bumpMap&&m.wireframe===!1,We=!!m.normalMap,Ke=!!m.displacementMap,Xe=!!m.emissiveMap,it=!!m.metalnessMap,ut=!!m.roughnessMap,k=m.anisotropy>0,Tt=m.clearcoat>0,lt=m.dispersion>0,A=m.iridescence>0,g=m.sheen>0,D=m.transmission>0,U=k&&!!m.anisotropyMap,W=Tt&&!!m.clearcoatMap,ie=Tt&&!!m.clearcoatNormalMap,ce=Tt&&!!m.clearcoatRoughnessMap,K=A&&!!m.iridescenceMap,te=A&&!!m.iridescenceThicknessMap,ve=g&&!!m.sheenColorMap,Ne=g&&!!m.sheenRoughnessMap,ye=!!m.specularMap,Se=!!m.specularColorMap,Ve=!!m.specularIntensityMap,Ye=D&&!!m.transmissionMap,$e=D&&!!m.thicknessMap,B=!!m.gradientMap,be=!!m.alphaMap,ne=m.alphaTest>0,xe=!!m.alphaHash,Ee=!!m.extensions,ae=Rn;m.toneMapped&&(z===null||z.isXRRenderTarget===!0)&&(ae=i.toneMapping);let Oe={shaderID:de,shaderType:m.type,shaderName:m.name,vertexShader:he,fragmentShader:Ie,defines:m.defines,customVertexShaderID:q,customFragmentShaderID:O,isRawShaderMaterial:m.isRawShaderMaterial===!0,glslVersion:m.glslVersion,precision:h,batching:oe,batchingColor:oe&&L._colorsTexture!==null,instancing:se,instancingColor:se&&L.instanceColor!==null,instancingMorph:se&&L.morphTexture!==null,outputColorSpace:z===null?i.outputColorSpace:z.isXRRenderTarget===!0?z.texture.colorSpace:ct.workingColorSpace,alphaToCoverage:!!m.alphaToCoverage,map:ue,matcap:me,envMap:pe,envMapMode:pe&&$.mapping,envMapCubeUVHeight:Q,aoMap:_e,lightMap:ee,bumpMap:Me,normalMap:We,displacementMap:Ke,emissiveMap:Xe,normalMapObjectSpace:We&&m.normalMapType===Su,normalMapTangentSpace:We&&m.normalMapType===Ho,packedNormalMap:We&&m.normalMapType===Ho&&Wx(m.normalMap.format),metalnessMap:it,roughnessMap:ut,anisotropy:k,anisotropyMap:U,clearcoat:Tt,clearcoatMap:W,clearcoatNormalMap:ie,clearcoatRoughnessMap:ce,dispersion:lt,iridescence:A,iridescenceMap:K,iridescenceThicknessMap:te,sheen:g,sheenColorMap:ve,sheenRoughnessMap:Ne,specularMap:ye,specularColorMap:Se,specularIntensityMap:Ve,transmission:D,transmissionMap:Ye,thicknessMap:$e,gradientMap:B,opaque:m.transparent===!1&&m.blending===Vi&&m.alphaToCoverage===!1,alphaMap:be,alphaTest:ne,alphaHash:xe,combine:m.combine,mapUv:ue&&_(m.map.channel),aoMapUv:_e&&_(m.aoMap.channel),lightMapUv:ee&&_(m.lightMap.channel),bumpMapUv:Me&&_(m.bumpMap.channel),normalMapUv:We&&_(m.normalMap.channel),displacementMapUv:Ke&&_(m.displacementMap.channel),emissiveMapUv:Xe&&_(m.emissiveMap.channel),metalnessMapUv:it&&_(m.metalnessMap.channel),roughnessMapUv:ut&&_(m.roughnessMap.channel),anisotropyMapUv:U&&_(m.anisotropyMap.channel),clearcoatMapUv:W&&_(m.clearcoatMap.channel),clearcoatNormalMapUv:ie&&_(m.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ce&&_(m.clearcoatRoughnessMap.channel),iridescenceMapUv:K&&_(m.iridescenceMap.channel),iridescenceThicknessMapUv:te&&_(m.iridescenceThicknessMap.channel),sheenColorMapUv:ve&&_(m.sheenColorMap.channel),sheenRoughnessMapUv:Ne&&_(m.sheenRoughnessMap.channel),specularMapUv:ye&&_(m.specularMap.channel),specularColorMapUv:Se&&_(m.specularColorMap.channel),specularIntensityMapUv:Ve&&_(m.specularIntensityMap.channel),transmissionMapUv:Ye&&_(m.transmissionMap.channel),thicknessMapUv:$e&&_(m.thicknessMap.channel),alphaMapUv:be&&_(m.alphaMap.channel),vertexTangents:!!F.attributes.tangent&&(We||k),vertexNormals:!!F.attributes.normal,vertexColors:m.vertexColors,vertexAlphas:m.vertexColors===!0&&!!F.attributes.color&&F.attributes.color.itemSize===4,pointsUvs:L.isPoints===!0&&!!F.attributes.uv&&(ue||be),fog:!!V,useFog:m.fog===!0,fogExp2:!!V&&V.isFogExp2,flatShading:m.wireframe===!1&&(m.flatShading===!0||F.attributes.normal===void 0&&We===!1&&(m.isMeshLambertMaterial||m.isMeshPhongMaterial||m.isMeshStandardMaterial||m.isMeshPhysicalMaterial)),sizeAttenuation:m.sizeAttenuation===!0,logarithmicDepthBuffer:f,reversedDepthBuffer:j,skinning:L.isSkinnedMesh===!0,hasPositionAttribute:F.attributes.position!==void 0,morphTargets:F.morphAttributes.position!==void 0,morphNormals:F.morphAttributes.normal!==void 0,morphColors:F.morphAttributes.color!==void 0,morphTargetsCount:ge,morphTextureStride:ze,numDirLights:T.directional.length,numPointLights:T.point.length,numSpotLights:T.spot.length,numSpotLightMaps:T.spotLightMap.length,numRectAreaLights:T.rectArea.length,numHemiLights:T.hemi.length,numDirLightShadows:T.directionalShadowMap.length,numPointLightShadows:T.pointShadowMap.length,numSpotLightShadows:T.spotShadowMap.length,numSpotLightShadowsWithMaps:T.numSpotLightShadowsWithMaps,numLightProbes:T.numLightProbes,numLightProbeGrids:N.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:m.dithering,shadowMapEnabled:i.shadowMap.enabled&&P.length>0,shadowMapType:i.shadowMap.type,toneMapping:ae,decodeVideoTexture:ue&&m.map.isVideoTexture===!0&&ct.getTransfer(m.map.colorSpace)===pt,decodeVideoTextureEmissive:Xe&&m.emissiveMap.isVideoTexture===!0&&ct.getTransfer(m.emissiveMap.colorSpace)===pt,premultipliedAlpha:m.premultipliedAlpha,doubleSided:m.side===vn,flipSided:m.side===Jt,useDepthPacking:m.depthPacking>=0,depthPacking:m.depthPacking||0,index0AttributeName:m.index0AttributeName,extensionClipCullDistance:Ee&&m.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ee&&m.extensions.multiDraw===!0||oe)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:m.customProgramCacheKey()};return Oe.vertexUv1s=c.has(1),Oe.vertexUv2s=c.has(2),Oe.vertexUv3s=c.has(3),c.clear(),Oe}function x(m){let T=[];if(m.shaderID?T.push(m.shaderID):(T.push(m.customVertexShaderID),T.push(m.customFragmentShaderID)),m.defines!==void 0)for(let P in m.defines)T.push(P),T.push(m.defines[P]);return m.isRawShaderMaterial===!1&&(p(T,m),C(T,m),T.push(i.outputColorSpace)),T.push(m.customProgramCacheKey),T.join()}function p(m,T){m.push(T.precision),m.push(T.outputColorSpace),m.push(T.envMapMode),m.push(T.envMapCubeUVHeight),m.push(T.mapUv),m.push(T.alphaMapUv),m.push(T.lightMapUv),m.push(T.aoMapUv),m.push(T.bumpMapUv),m.push(T.normalMapUv),m.push(T.displacementMapUv),m.push(T.emissiveMapUv),m.push(T.metalnessMapUv),m.push(T.roughnessMapUv),m.push(T.anisotropyMapUv),m.push(T.clearcoatMapUv),m.push(T.clearcoatNormalMapUv),m.push(T.clearcoatRoughnessMapUv),m.push(T.iridescenceMapUv),m.push(T.iridescenceThicknessMapUv),m.push(T.sheenColorMapUv),m.push(T.sheenRoughnessMapUv),m.push(T.specularMapUv),m.push(T.specularColorMapUv),m.push(T.specularIntensityMapUv),m.push(T.transmissionMapUv),m.push(T.thicknessMapUv),m.push(T.combine),m.push(T.fogExp2),m.push(T.sizeAttenuation),m.push(T.morphTargetsCount),m.push(T.morphAttributeCount),m.push(T.numDirLights),m.push(T.numPointLights),m.push(T.numSpotLights),m.push(T.numSpotLightMaps),m.push(T.numHemiLights),m.push(T.numRectAreaLights),m.push(T.numDirLightShadows),m.push(T.numPointLightShadows),m.push(T.numSpotLightShadows),m.push(T.numSpotLightShadowsWithMaps),m.push(T.numLightProbes),m.push(T.shadowMapType),m.push(T.toneMapping),m.push(T.numClippingPlanes),m.push(T.numClipIntersection),m.push(T.depthPacking)}function C(m,T){a.disableAll(),T.instancing&&a.enable(0),T.instancingColor&&a.enable(1),T.instancingMorph&&a.enable(2),T.matcap&&a.enable(3),T.envMap&&a.enable(4),T.normalMapObjectSpace&&a.enable(5),T.normalMapTangentSpace&&a.enable(6),T.clearcoat&&a.enable(7),T.iridescence&&a.enable(8),T.alphaTest&&a.enable(9),T.vertexColors&&a.enable(10),T.vertexAlphas&&a.enable(11),T.vertexUv1s&&a.enable(12),T.vertexUv2s&&a.enable(13),T.vertexUv3s&&a.enable(14),T.vertexTangents&&a.enable(15),T.anisotropy&&a.enable(16),T.alphaHash&&a.enable(17),T.batching&&a.enable(18),T.dispersion&&a.enable(19),T.batchingColor&&a.enable(20),T.gradientMap&&a.enable(21),T.packedNormalMap&&a.enable(22),T.vertexNormals&&a.enable(23),m.push(a.mask),a.disableAll(),T.fog&&a.enable(0),T.useFog&&a.enable(1),T.flatShading&&a.enable(2),T.logarithmicDepthBuffer&&a.enable(3),T.reversedDepthBuffer&&a.enable(4),T.skinning&&a.enable(5),T.morphTargets&&a.enable(6),T.morphNormals&&a.enable(7),T.morphColors&&a.enable(8),T.premultipliedAlpha&&a.enable(9),T.shadowMapEnabled&&a.enable(10),T.doubleSided&&a.enable(11),T.flipSided&&a.enable(12),T.useDepthPacking&&a.enable(13),T.dithering&&a.enable(14),T.transmission&&a.enable(15),T.sheen&&a.enable(16),T.opaque&&a.enable(17),T.pointsUvs&&a.enable(18),T.decodeVideoTexture&&a.enable(19),T.decodeVideoTextureEmissive&&a.enable(20),T.alphaToCoverage&&a.enable(21),T.numLightProbeGrids>0&&a.enable(22),T.hasPositionAttribute&&a.enable(23),m.push(a.mask)}function w(m){let T=d[m.type],P;if(T){let I=Xn[T];P=Uu.clone(I.uniforms)}else P=m.uniforms;return P}function b(m,T){let P=u.get(T);return P!==void 0?++P.usedTimes:(P=new Hx(i,T,m,s),l.push(P),u.set(T,P)),P}function S(m){if(--m.usedTimes===0){let T=l.indexOf(m);l[T]=l[l.length-1],l.pop(),u.delete(m.cacheKey),m.destroy()}}function v(m){o.remove(m)}function M(){o.dispose()}return{getParameters:y,getProgramCacheKey:x,getUniforms:w,acquireProgram:b,releaseProgram:S,releaseShaderCache:v,programs:l,dispose:M}}function qx(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,c){i.get(a)[o]=c}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function Yx(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function td(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function nd(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(h){let d=0;return h.isInstancedMesh&&(d+=2),h.isSkinnedMesh&&(d+=1),d}function o(h,d,_,y,x,p){let C=i[e];return C===void 0?(C={id:h.id,object:h,geometry:d,material:_,materialVariant:a(h),groupOrder:y,renderOrder:h.renderOrder,z:x,group:p},i[e]=C):(C.id=h.id,C.object=h,C.geometry=d,C.material=_,C.materialVariant=a(h),C.groupOrder=y,C.renderOrder=h.renderOrder,C.z=x,C.group=p),e++,C}function c(h,d,_,y,x,p){let C=o(h,d,_,y,x,p);_.transmission>0?n.push(C):_.transparent===!0?s.push(C):t.push(C)}function l(h,d,_,y,x,p){let C=o(h,d,_,y,x,p);_.transmission>0?n.unshift(C):_.transparent===!0?s.unshift(C):t.unshift(C)}function u(h,d,_){t.length>1&&t.sort(h||Yx),n.length>1&&n.sort(d||td),s.length>1&&s.sort(d||td),_&&(t.reverse(),n.reverse(),s.reverse())}function f(){for(let h=e,d=i.length;h<d;h++){let _=i[h];if(_.id===null)break;_.id=null,_.object=null,_.geometry=null,_.material=null,_.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:c,unshift:l,finish:f,sort:u}}function Zx(){let i=new WeakMap;function e(n,s){let r=i.get(n),a;return r===void 0?(a=new nd,i.set(n,[a])):s>=r.length?(a=new nd,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function jx(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new R,color:new et};break;case"SpotLight":t={position:new R,direction:new R,color:new et,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new R,color:new et,distance:0,decay:0};break;case"HemisphereLight":t={direction:new R,skyColor:new et,groundColor:new et};break;case"RectAreaLight":t={color:new et,position:new R,halfWidth:new R,halfHeight:new R};break}return i[e.id]=t,t}}}function Jx(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Re};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Re};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Re,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var Kx=0;function $x(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function Qx(i){let e=new jx,t=Jx(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)n.probe.push(new R);let s=new R,r=new ft,a=new ft;function o(l){let u=0,f=0,h=0;for(let T=0;T<9;T++)n.probe[T].set(0,0,0);let d=0,_=0,y=0,x=0,p=0,C=0,w=0,b=0,S=0,v=0,M=0;l.sort($x);for(let T=0,P=l.length;T<P;T++){let I=l[T],L=I.color,N=I.intensity,V=I.distance,F=null;if(I.shadow&&I.shadow.map&&(I.shadow.map.texture.format===Ii?F=I.shadow.map.texture:F=I.shadow.map.depthTexture||I.shadow.map.texture),I.isAmbientLight)u+=L.r*N,f+=L.g*N,h+=L.b*N;else if(I.isLightProbe){for(let X=0;X<9;X++)n.probe[X].addScaledVector(I.sh.coefficients[X],N);M++}else if(I.isDirectionalLight){let X=e.get(I);if(X.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let H=I.shadow,$=t.get(I);$.shadowIntensity=H.intensity,$.shadowBias=H.bias,$.shadowNormalBias=H.normalBias,$.shadowRadius=H.radius,$.shadowMapSize=H.mapSize,n.directionalShadow[d]=$,n.directionalShadowMap[d]=F,n.directionalShadowMatrix[d]=I.shadow.matrix,C++}n.directional[d]=X,d++}else if(I.isSpotLight){let X=e.get(I);X.position.setFromMatrixPosition(I.matrixWorld),X.color.copy(L).multiplyScalar(N),X.distance=V,X.coneCos=Math.cos(I.angle),X.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),X.decay=I.decay,n.spot[y]=X;let H=I.shadow;if(I.map&&(n.spotLightMap[S]=I.map,S++,H.updateMatrices(I),I.castShadow&&v++),n.spotLightMatrix[y]=H.matrix,I.castShadow){let $=t.get(I);$.shadowIntensity=H.intensity,$.shadowBias=H.bias,$.shadowNormalBias=H.normalBias,$.shadowRadius=H.radius,$.shadowMapSize=H.mapSize,n.spotShadow[y]=$,n.spotShadowMap[y]=F,b++}y++}else if(I.isRectAreaLight){let X=e.get(I);X.color.copy(L).multiplyScalar(N),X.halfWidth.set(I.width*.5,0,0),X.halfHeight.set(0,I.height*.5,0),n.rectArea[x]=X,x++}else if(I.isPointLight){let X=e.get(I);if(X.color.copy(I.color).multiplyScalar(I.intensity),X.distance=I.distance,X.decay=I.decay,I.castShadow){let H=I.shadow,$=t.get(I);$.shadowIntensity=H.intensity,$.shadowBias=H.bias,$.shadowNormalBias=H.normalBias,$.shadowRadius=H.radius,$.shadowMapSize=H.mapSize,$.shadowCameraNear=H.camera.near,$.shadowCameraFar=H.camera.far,n.pointShadow[_]=$,n.pointShadowMap[_]=F,n.pointShadowMatrix[_]=I.shadow.matrix,w++}n.point[_]=X,_++}else if(I.isHemisphereLight){let X=e.get(I);X.skyColor.copy(I.color).multiplyScalar(N),X.groundColor.copy(I.groundColor).multiplyScalar(N),n.hemi[p]=X,p++}}x>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Te.LTC_FLOAT_1,n.rectAreaLTC2=Te.LTC_FLOAT_2):(n.rectAreaLTC1=Te.LTC_HALF_1,n.rectAreaLTC2=Te.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=f,n.ambient[2]=h;let m=n.hash;(m.directionalLength!==d||m.pointLength!==_||m.spotLength!==y||m.rectAreaLength!==x||m.hemiLength!==p||m.numDirectionalShadows!==C||m.numPointShadows!==w||m.numSpotShadows!==b||m.numSpotMaps!==S||m.numLightProbes!==M)&&(n.directional.length=d,n.spot.length=y,n.rectArea.length=x,n.point.length=_,n.hemi.length=p,n.directionalShadow.length=C,n.directionalShadowMap.length=C,n.pointShadow.length=w,n.pointShadowMap.length=w,n.spotShadow.length=b,n.spotShadowMap.length=b,n.directionalShadowMatrix.length=C,n.pointShadowMatrix.length=w,n.spotLightMatrix.length=b+S-v,n.spotLightMap.length=S,n.numSpotLightShadowsWithMaps=v,n.numLightProbes=M,m.directionalLength=d,m.pointLength=_,m.spotLength=y,m.rectAreaLength=x,m.hemiLength=p,m.numDirectionalShadows=C,m.numPointShadows=w,m.numSpotShadows=b,m.numSpotMaps=S,m.numLightProbes=M,n.version=Kx++)}function c(l,u){let f=0,h=0,d=0,_=0,y=0,x=u.matrixWorldInverse;for(let p=0,C=l.length;p<C;p++){let w=l[p];if(w.isDirectionalLight){let b=n.directional[f];b.direction.setFromMatrixPosition(w.matrixWorld),s.setFromMatrixPosition(w.target.matrixWorld),b.direction.sub(s),b.direction.transformDirection(x),f++}else if(w.isSpotLight){let b=n.spot[d];b.position.setFromMatrixPosition(w.matrixWorld),b.position.applyMatrix4(x),b.direction.setFromMatrixPosition(w.matrixWorld),s.setFromMatrixPosition(w.target.matrixWorld),b.direction.sub(s),b.direction.transformDirection(x),d++}else if(w.isRectAreaLight){let b=n.rectArea[_];b.position.setFromMatrixPosition(w.matrixWorld),b.position.applyMatrix4(x),a.identity(),r.copy(w.matrixWorld),r.premultiply(x),a.extractRotation(r),b.halfWidth.set(w.width*.5,0,0),b.halfHeight.set(0,w.height*.5,0),b.halfWidth.applyMatrix4(a),b.halfHeight.applyMatrix4(a),_++}else if(w.isPointLight){let b=n.point[h];b.position.setFromMatrixPosition(w.matrixWorld),b.position.applyMatrix4(x),h++}else if(w.isHemisphereLight){let b=n.hemi[y];b.direction.setFromMatrixPosition(w.matrixWorld),b.direction.transformDirection(x),y++}}}return{setup:o,setupView:c,state:n}}function id(i){let e=new Qx(i),t=[],n=[],s=[];function r(h){f.camera=h,t.length=0,n.length=0,s.length=0}function a(h){t.push(h)}function o(h){n.push(h)}function c(h){s.push(h)}function l(){e.setup(t)}function u(h){e.setupView(t,h)}let f={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:f,setupLights:l,setupLightsView:u,pushLight:a,pushShadow:o,pushLightProbeGrid:c}}function e_(i){let e=new WeakMap;function t(s,r=0){let a=e.get(s),o;return a===void 0?(o=new id(i),e.set(s,[o])):r>=a.length?(o=new id(i),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}var t_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,n_=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,i_=[new R(1,0,0),new R(-1,0,0),new R(0,1,0),new R(0,-1,0),new R(0,0,1),new R(0,0,-1)],s_=[new R(0,-1,0),new R(0,-1,0),new R(0,0,1),new R(0,0,-1),new R(0,-1,0),new R(0,-1,0)],sd=new ft,Lr=new R,Lc=new R;function r_(i,e,t){let n=new Si,s=new Re,r=new Re,a=new wt,o=new Ha,c=new Ga,l={},u=t.maxTextureSize,f={[ni]:Jt,[Jt]:ni,[vn]:vn},h=new jt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Re},radius:{value:4}},vertexShader:t_,fragmentShader:n_}),d=h.clone();d.defines.HORIZONTAL_PASS=1;let _=new Lt;_.setAttribute("position",new Yt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let y=new St(_,h),x=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=br;let p=this.type;this.render=function(v,M,m){if(x.enabled===!1||x.autoUpdate===!1&&x.needsUpdate===!1||v.length===0)return;this.type===eu&&(qe("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=br);let T=i.getRenderTarget(),P=i.getActiveCubeFace(),I=i.getActiveMipmapLevel(),L=i.state;L.setBlending(Hn),L.buffers.depth.getReversed()===!0?L.buffers.color.setClear(0,0,0,0):L.buffers.color.setClear(1,1,1,1),L.buffers.depth.setTest(!0),L.setScissorTest(!1);let N=p!==this.type;N&&M.traverse(function(V){V.material&&(Array.isArray(V.material)?V.material.forEach(F=>F.needsUpdate=!0):V.material.needsUpdate=!0)});for(let V=0,F=v.length;V<F;V++){let X=v[V],H=X.shadow;if(H===void 0){qe("WebGLShadowMap:",X,"has no shadow.");continue}if(H.autoUpdate===!1&&H.needsUpdate===!1)continue;s.copy(H.mapSize);let $=H.getFrameExtents();s.multiply($),r.copy(H.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/$.x),s.x=r.x*$.x,H.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/$.y),s.y=r.y*$.y,H.mapSize.y=r.y));let Q=i.state.buffers.depth.getReversed();if(H.camera._reversedDepth=Q,H.map===null||N===!0){if(H.map!==null&&(H.map.depthTexture!==null&&(H.map.depthTexture.dispose(),H.map.depthTexture=null),H.map.dispose()),this.type===As){if(X.isPointLight){qe("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}H.map=new Zt(s.x,s.y,{format:Ii,type:Gn,minFilter:zt,magFilter:zt,generateMipmaps:!1}),H.map.texture.name=X.name+".shadowMap",H.map.depthTexture=new ri(s.x,s.y,yn),H.map.depthTexture.name=X.name+".shadowMapDepth",H.map.depthTexture.format=On,H.map.depthTexture.compareFunction=null,H.map.depthTexture.minFilter=kt,H.map.depthTexture.magFilter=kt}else X.isPointLight?(H.map=new Zo(s.x),H.map.depthTexture=new Na(s.x,Ln)):(H.map=new Zt(s.x,s.y),H.map.depthTexture=new ri(s.x,s.y,Ln)),H.map.depthTexture.name=X.name+".shadowMap",H.map.depthTexture.format=On,this.type===br?(H.map.depthTexture.compareFunction=Q?Wo:Go,H.map.depthTexture.minFilter=zt,H.map.depthTexture.magFilter=zt):(H.map.depthTexture.compareFunction=null,H.map.depthTexture.minFilter=kt,H.map.depthTexture.magFilter=kt);H.camera.updateProjectionMatrix()}let de=H.map.isWebGLCubeRenderTarget?6:1;for(let fe=0;fe<de;fe++){if(H.map.isWebGLCubeRenderTarget)i.setRenderTarget(H.map,fe),i.clear();else{fe===0&&(i.setRenderTarget(H.map),i.clear());let ge=H.getViewport(fe);a.set(r.x*ge.x,r.y*ge.y,r.x*ge.z,r.y*ge.w),L.viewport(a)}if(X.isPointLight){let ge=H.camera,ze=H.matrix,he=X.distance||ge.far;he!==ge.far&&(ge.far=he,ge.updateProjectionMatrix()),Lr.setFromMatrixPosition(X.matrixWorld),ge.position.copy(Lr),Lc.copy(ge.position),Lc.add(i_[fe]),ge.up.copy(s_[fe]),ge.lookAt(Lc),ge.updateMatrixWorld(),ze.makeTranslation(-Lr.x,-Lr.y,-Lr.z),sd.multiplyMatrices(ge.projectionMatrix,ge.matrixWorldInverse),H._frustum.setFromProjectionMatrix(sd,ge.coordinateSystem,ge.reversedDepth)}else H.updateMatrices(X);n=H.getFrustum(),b(M,m,H.camera,X,this.type)}H.isPointLightShadow!==!0&&this.type===As&&C(H,m),H.needsUpdate=!1}p=this.type,x.needsUpdate=!1,i.setRenderTarget(T,P,I)};function C(v,M){let m=e.update(y);h.defines.VSM_SAMPLES!==v.blurSamples&&(h.defines.VSM_SAMPLES=v.blurSamples,d.defines.VSM_SAMPLES=v.blurSamples,h.needsUpdate=!0,d.needsUpdate=!0),v.mapPass===null&&(v.mapPass=new Zt(s.x,s.y,{format:Ii,type:Gn})),h.uniforms.shadow_pass.value=v.map.depthTexture,h.uniforms.resolution.value=v.mapSize,h.uniforms.radius.value=v.radius,i.setRenderTarget(v.mapPass),i.clear(),i.renderBufferDirect(M,null,m,h,y,null),d.uniforms.shadow_pass.value=v.mapPass.texture,d.uniforms.resolution.value=v.mapSize,d.uniforms.radius.value=v.radius,i.setRenderTarget(v.map),i.clear(),i.renderBufferDirect(M,null,m,d,y,null)}function w(v,M,m,T){let P=null,I=m.isPointLight===!0?v.customDistanceMaterial:v.customDepthMaterial;if(I!==void 0)P=I;else if(P=m.isPointLight===!0?c:o,i.localClippingEnabled&&M.clipShadows===!0&&Array.isArray(M.clippingPlanes)&&M.clippingPlanes.length!==0||M.displacementMap&&M.displacementScale!==0||M.alphaMap&&M.alphaTest>0||M.map&&M.alphaTest>0||M.alphaToCoverage===!0){let L=P.uuid,N=M.uuid,V=l[L];V===void 0&&(V={},l[L]=V);let F=V[N];F===void 0&&(F=P.clone(),V[N]=F,M.addEventListener("dispose",S)),P=F}if(P.visible=M.visible,P.wireframe=M.wireframe,T===As?P.side=M.shadowSide!==null?M.shadowSide:M.side:P.side=M.shadowSide!==null?M.shadowSide:f[M.side],P.alphaMap=M.alphaMap,P.alphaTest=M.alphaToCoverage===!0?.5:M.alphaTest,P.map=M.map,P.clipShadows=M.clipShadows,P.clippingPlanes=M.clippingPlanes,P.clipIntersection=M.clipIntersection,P.displacementMap=M.displacementMap,P.displacementScale=M.displacementScale,P.displacementBias=M.displacementBias,P.wireframeLinewidth=M.wireframeLinewidth,P.linewidth=M.linewidth,m.isPointLight===!0&&P.isMeshDistanceMaterial===!0){let L=i.properties.get(P);L.light=m}return P}function b(v,M,m,T,P){if(v.visible===!1)return;if(v.layers.test(M.layers)&&(v.isMesh||v.isLine||v.isPoints)&&(v.castShadow||v.receiveShadow&&P===As)&&(!v.frustumCulled||n.intersectsObject(v))){v.modelViewMatrix.multiplyMatrices(m.matrixWorldInverse,v.matrixWorld);let N=e.update(v),V=v.material;if(Array.isArray(V)){let F=N.groups;for(let X=0,H=F.length;X<H;X++){let $=F[X],Q=V[$.materialIndex];if(Q&&Q.visible){let de=w(v,Q,T,P);v.onBeforeShadow(i,v,M,m,N,de,$),i.renderBufferDirect(m,null,N,de,v,$),v.onAfterShadow(i,v,M,m,N,de,$)}}}else if(V.visible){let F=w(v,V,T,P);v.onBeforeShadow(i,v,M,m,N,F,null),i.renderBufferDirect(m,null,N,F,v,null),v.onAfterShadow(i,v,M,m,N,F,null)}}let L=v.children;for(let N=0,V=L.length;N<V;N++)b(L[N],M,m,T,P)}function S(v){v.target.removeEventListener("dispose",S);for(let m in l){let T=l[m],P=v.target.uuid;P in T&&(T[P].dispose(),delete T[P])}}}function a_(i,e){function t(){let B=!1,be=new wt,ne=null,xe=new wt(0,0,0,0);return{setMask:function(Ee){ne!==Ee&&!B&&(i.colorMask(Ee,Ee,Ee,Ee),ne=Ee)},setLocked:function(Ee){B=Ee},setClear:function(Ee,ae,Oe,De,ht){ht===!0&&(Ee*=De,ae*=De,Oe*=De),be.set(Ee,ae,Oe,De),xe.equals(be)===!1&&(i.clearColor(Ee,ae,Oe,De),xe.copy(be))},reset:function(){B=!1,ne=null,xe.set(-1,0,0,0)}}}function n(){let B=!1,be=!1,ne=null,xe=null,Ee=null;return{setReversed:function(ae){if(be!==ae){let Oe=e.get("EXT_clip_control");ae?Oe.clipControlEXT(Oe.LOWER_LEFT_EXT,Oe.ZERO_TO_ONE_EXT):Oe.clipControlEXT(Oe.LOWER_LEFT_EXT,Oe.NEGATIVE_ONE_TO_ONE_EXT),be=ae;let De=Ee;Ee=null,this.setClear(De)}},getReversed:function(){return be},setTest:function(ae){ae?z(i.DEPTH_TEST):j(i.DEPTH_TEST)},setMask:function(ae){ne!==ae&&!B&&(i.depthMask(ae),ne=ae)},setFunc:function(ae){if(be&&(ae=Nu[ae]),xe!==ae){switch(ae){case ma:i.depthFunc(i.NEVER);break;case ga:i.depthFunc(i.ALWAYS);break;case xa:i.depthFunc(i.LESS);break;case Hi:i.depthFunc(i.LEQUAL);break;case _a:i.depthFunc(i.EQUAL);break;case va:i.depthFunc(i.GEQUAL);break;case ya:i.depthFunc(i.GREATER);break;case ba:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}xe=ae}},setLocked:function(ae){B=ae},setClear:function(ae){Ee!==ae&&(Ee=ae,be&&(ae=1-ae),i.clearDepth(ae))},reset:function(){B=!1,ne=null,xe=null,Ee=null,be=!1}}}function s(){let B=!1,be=null,ne=null,xe=null,Ee=null,ae=null,Oe=null,De=null,ht=null;return{setTest:function(tt){B||(tt?z(i.STENCIL_TEST):j(i.STENCIL_TEST))},setMask:function(tt){be!==tt&&!B&&(i.stencilMask(tt),be=tt)},setFunc:function(tt,un,dn){(ne!==tt||xe!==un||Ee!==dn)&&(i.stencilFunc(tt,un,dn),ne=tt,xe=un,Ee=dn)},setOp:function(tt,un,dn){(ae!==tt||Oe!==un||De!==dn)&&(i.stencilOp(tt,un,dn),ae=tt,Oe=un,De=dn)},setLocked:function(tt){B=tt},setClear:function(tt){ht!==tt&&(i.clearStencil(tt),ht=tt)},reset:function(){B=!1,be=null,ne=null,xe=null,Ee=null,ae=null,Oe=null,De=null,ht=null}}}let r=new t,a=new n,o=new s,c=new WeakMap,l=new WeakMap,u={},f={},h={},d=new WeakMap,_=[],y=null,x=!1,p=null,C=null,w=null,b=null,S=null,v=null,M=null,m=new et(0,0,0),T=0,P=!1,I=null,L=null,N=null,V=null,F=null,X=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),H=!1,$=0,Q=i.getParameter(i.VERSION);Q.indexOf("WebGL")!==-1?($=parseFloat(/^WebGL (\d)/.exec(Q)[1]),H=$>=1):Q.indexOf("OpenGL ES")!==-1&&($=parseFloat(/^OpenGL ES (\d)/.exec(Q)[1]),H=$>=2);let de=null,fe={},ge=i.getParameter(i.SCISSOR_BOX),ze=i.getParameter(i.VIEWPORT),he=new wt().fromArray(ge),Ie=new wt().fromArray(ze);function q(B,be,ne,xe){let Ee=new Uint8Array(4),ae=i.createTexture();i.bindTexture(B,ae),i.texParameteri(B,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(B,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Oe=0;Oe<ne;Oe++)B===i.TEXTURE_3D||B===i.TEXTURE_2D_ARRAY?i.texImage3D(be,0,i.RGBA,1,1,xe,0,i.RGBA,i.UNSIGNED_BYTE,Ee):i.texImage2D(be+Oe,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Ee);return ae}let O={};O[i.TEXTURE_2D]=q(i.TEXTURE_2D,i.TEXTURE_2D,1),O[i.TEXTURE_CUBE_MAP]=q(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),O[i.TEXTURE_2D_ARRAY]=q(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),O[i.TEXTURE_3D]=q(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),z(i.DEPTH_TEST),a.setFunc(Hi),Me(!1),We(tc),z(i.CULL_FACE),_e(Hn);function z(B){u[B]!==!0&&(i.enable(B),u[B]=!0)}function j(B){u[B]!==!1&&(i.disable(B),u[B]=!1)}function se(B,be){return h[B]!==be?(i.bindFramebuffer(B,be),h[B]=be,B===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=be),B===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=be),!0):!1}function oe(B,be){let ne=_,xe=!1;if(B){ne=d.get(be),ne===void 0&&(ne=[],d.set(be,ne));let Ee=B.textures;if(ne.length!==Ee.length||ne[0]!==i.COLOR_ATTACHMENT0){for(let ae=0,Oe=Ee.length;ae<Oe;ae++)ne[ae]=i.COLOR_ATTACHMENT0+ae;ne.length=Ee.length,xe=!0}}else ne[0]!==i.BACK&&(ne[0]=i.BACK,xe=!0);xe&&i.drawBuffers(ne)}function ue(B){return y!==B?(i.useProgram(B),y=B,!0):!1}let me={[Mi]:i.FUNC_ADD,[nu]:i.FUNC_SUBTRACT,[iu]:i.FUNC_REVERSE_SUBTRACT};me[su]=i.MIN,me[ru]=i.MAX;let pe={[au]:i.ZERO,[ou]:i.ONE,[lu]:i.SRC_COLOR,[fa]:i.SRC_ALPHA,[pu]:i.SRC_ALPHA_SATURATE,[du]:i.DST_COLOR,[hu]:i.DST_ALPHA,[cu]:i.ONE_MINUS_SRC_COLOR,[pa]:i.ONE_MINUS_SRC_ALPHA,[fu]:i.ONE_MINUS_DST_COLOR,[uu]:i.ONE_MINUS_DST_ALPHA,[mu]:i.CONSTANT_COLOR,[gu]:i.ONE_MINUS_CONSTANT_COLOR,[xu]:i.CONSTANT_ALPHA,[_u]:i.ONE_MINUS_CONSTANT_ALPHA};function _e(B,be,ne,xe,Ee,ae,Oe,De,ht,tt){if(B===Hn){x===!0&&(j(i.BLEND),x=!1);return}if(x===!1&&(z(i.BLEND),x=!0),B!==tu){if(B!==p||tt!==P){if((C!==Mi||S!==Mi)&&(i.blendEquation(i.FUNC_ADD),C=Mi,S=Mi),tt)switch(B){case Vi:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case nc:i.blendFunc(i.ONE,i.ONE);break;case ic:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case sc:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:Je("WebGLState: Invalid blending: ",B);break}else switch(B){case Vi:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case nc:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case ic:Je("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case sc:Je("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Je("WebGLState: Invalid blending: ",B);break}w=null,b=null,v=null,M=null,m.set(0,0,0),T=0,p=B,P=tt}return}Ee=Ee||be,ae=ae||ne,Oe=Oe||xe,(be!==C||Ee!==S)&&(i.blendEquationSeparate(me[be],me[Ee]),C=be,S=Ee),(ne!==w||xe!==b||ae!==v||Oe!==M)&&(i.blendFuncSeparate(pe[ne],pe[xe],pe[ae],pe[Oe]),w=ne,b=xe,v=ae,M=Oe),(De.equals(m)===!1||ht!==T)&&(i.blendColor(De.r,De.g,De.b,ht),m.copy(De),T=ht),p=B,P=!1}function ee(B,be){B.side===vn?j(i.CULL_FACE):z(i.CULL_FACE);let ne=B.side===Jt;be&&(ne=!ne),Me(ne),B.blending===Vi&&B.transparent===!1?_e(Hn):_e(B.blending,B.blendEquation,B.blendSrc,B.blendDst,B.blendEquationAlpha,B.blendSrcAlpha,B.blendDstAlpha,B.blendColor,B.blendAlpha,B.premultipliedAlpha),a.setFunc(B.depthFunc),a.setTest(B.depthTest),a.setMask(B.depthWrite),r.setMask(B.colorWrite);let xe=B.stencilWrite;o.setTest(xe),xe&&(o.setMask(B.stencilWriteMask),o.setFunc(B.stencilFunc,B.stencilRef,B.stencilFuncMask),o.setOp(B.stencilFail,B.stencilZFail,B.stencilZPass)),Xe(B.polygonOffset,B.polygonOffsetFactor,B.polygonOffsetUnits),B.alphaToCoverage===!0?z(i.SAMPLE_ALPHA_TO_COVERAGE):j(i.SAMPLE_ALPHA_TO_COVERAGE)}function Me(B){I!==B&&(B?i.frontFace(i.CW):i.frontFace(i.CCW),I=B)}function We(B){B!==$h?(z(i.CULL_FACE),B!==L&&(B===tc?i.cullFace(i.BACK):B===Qh?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):j(i.CULL_FACE),L=B}function Ke(B){B!==N&&(H&&i.lineWidth(B),N=B)}function Xe(B,be,ne){B?(z(i.POLYGON_OFFSET_FILL),(V!==be||F!==ne)&&(V=be,F=ne,a.getReversed()&&(be=-be),i.polygonOffset(be,ne))):j(i.POLYGON_OFFSET_FILL)}function it(B){B?z(i.SCISSOR_TEST):j(i.SCISSOR_TEST)}function ut(B){B===void 0&&(B=i.TEXTURE0+X-1),de!==B&&(i.activeTexture(B),de=B)}function k(B,be,ne){ne===void 0&&(de===null?ne=i.TEXTURE0+X-1:ne=de);let xe=fe[ne];xe===void 0&&(xe={type:void 0,texture:void 0},fe[ne]=xe),(xe.type!==B||xe.texture!==be)&&(de!==ne&&(i.activeTexture(ne),de=ne),i.bindTexture(B,be||O[B]),xe.type=B,xe.texture=be)}function Tt(){let B=fe[de];B!==void 0&&B.type!==void 0&&(i.bindTexture(B.type,null),B.type=void 0,B.texture=void 0)}function lt(){try{i.compressedTexImage2D(...arguments)}catch(B){Je("WebGLState:",B)}}function A(){try{i.compressedTexImage3D(...arguments)}catch(B){Je("WebGLState:",B)}}function g(){try{i.texSubImage2D(...arguments)}catch(B){Je("WebGLState:",B)}}function D(){try{i.texSubImage3D(...arguments)}catch(B){Je("WebGLState:",B)}}function U(){try{i.compressedTexSubImage2D(...arguments)}catch(B){Je("WebGLState:",B)}}function W(){try{i.compressedTexSubImage3D(...arguments)}catch(B){Je("WebGLState:",B)}}function ie(){try{i.texStorage2D(...arguments)}catch(B){Je("WebGLState:",B)}}function ce(){try{i.texStorage3D(...arguments)}catch(B){Je("WebGLState:",B)}}function K(){try{i.texImage2D(...arguments)}catch(B){Je("WebGLState:",B)}}function te(){try{i.texImage3D(...arguments)}catch(B){Je("WebGLState:",B)}}function ve(B){return f[B]!==void 0?f[B]:i.getParameter(B)}function Ne(B,be){f[B]!==be&&(i.pixelStorei(B,be),f[B]=be)}function ye(B){he.equals(B)===!1&&(i.scissor(B.x,B.y,B.z,B.w),he.copy(B))}function Se(B){Ie.equals(B)===!1&&(i.viewport(B.x,B.y,B.z,B.w),Ie.copy(B))}function Ve(B,be){let ne=l.get(be);ne===void 0&&(ne=new WeakMap,l.set(be,ne));let xe=ne.get(B);xe===void 0&&(xe=i.getUniformBlockIndex(be,B.name),ne.set(B,xe))}function Ye(B,be){let xe=l.get(be).get(B);c.get(be)!==xe&&(i.uniformBlockBinding(be,xe,B.__bindingPointIndex),c.set(be,xe))}function $e(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),u={},f={},de=null,fe={},h={},d=new WeakMap,_=[],y=null,x=!1,p=null,C=null,w=null,b=null,S=null,v=null,M=null,m=new et(0,0,0),T=0,P=!1,I=null,L=null,N=null,V=null,F=null,he.set(0,0,i.canvas.width,i.canvas.height),Ie.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:z,disable:j,bindFramebuffer:se,drawBuffers:oe,useProgram:ue,setBlending:_e,setMaterial:ee,setFlipSided:Me,setCullFace:We,setLineWidth:Ke,setPolygonOffset:Xe,setScissorTest:it,activeTexture:ut,bindTexture:k,unbindTexture:Tt,compressedTexImage2D:lt,compressedTexImage3D:A,texImage2D:K,texImage3D:te,pixelStorei:Ne,getParameter:ve,updateUBOMapping:Ve,uniformBlockBinding:Ye,texStorage2D:ie,texStorage3D:ce,texSubImage2D:g,texSubImage3D:D,compressedTexSubImage2D:U,compressedTexSubImage3D:W,scissor:ye,viewport:Se,reset:$e}}function o_(i,e,t,n,s,r,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new Re,u=new WeakMap,f=new Set,h,d=new WeakMap,_=!1;try{_=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function y(A,g){return _?new OffscreenCanvas(A,g):Qs("canvas")}function x(A,g,D){let U=1,W=lt(A);if((W.width>D||W.height>D)&&(U=D/Math.max(W.width,W.height)),U<1)if(typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&A instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&A instanceof ImageBitmap||typeof VideoFrame<"u"&&A instanceof VideoFrame){let ie=Math.floor(U*W.width),ce=Math.floor(U*W.height);h===void 0&&(h=y(ie,ce));let K=g?y(ie,ce):h;return K.width=ie,K.height=ce,K.getContext("2d").drawImage(A,0,0,ie,ce),qe("WebGLRenderer: Texture has been resized from ("+W.width+"x"+W.height+") to ("+ie+"x"+ce+")."),K}else return"data"in A&&qe("WebGLRenderer: Image in DataTexture is too big ("+W.width+"x"+W.height+")."),A;return A}function p(A){return A.generateMipmaps}function C(A){i.generateMipmap(A)}function w(A){return A.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:A.isWebGL3DRenderTarget?i.TEXTURE_3D:A.isWebGLArrayRenderTarget||A.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function b(A,g,D,U,W,ie=!1){if(A!==null){if(i[A]!==void 0)return i[A];qe("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+A+"'")}let ce;U&&(ce=e.get("EXT_texture_norm16"),ce||qe("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let K=g;if(g===i.RED&&(D===i.FLOAT&&(K=i.R32F),D===i.HALF_FLOAT&&(K=i.R16F),D===i.UNSIGNED_BYTE&&(K=i.R8),D===i.UNSIGNED_SHORT&&ce&&(K=ce.R16_EXT),D===i.SHORT&&ce&&(K=ce.R16_SNORM_EXT)),g===i.RED_INTEGER&&(D===i.UNSIGNED_BYTE&&(K=i.R8UI),D===i.UNSIGNED_SHORT&&(K=i.R16UI),D===i.UNSIGNED_INT&&(K=i.R32UI),D===i.BYTE&&(K=i.R8I),D===i.SHORT&&(K=i.R16I),D===i.INT&&(K=i.R32I)),g===i.RG&&(D===i.FLOAT&&(K=i.RG32F),D===i.HALF_FLOAT&&(K=i.RG16F),D===i.UNSIGNED_BYTE&&(K=i.RG8),D===i.UNSIGNED_SHORT&&ce&&(K=ce.RG16_EXT),D===i.SHORT&&ce&&(K=ce.RG16_SNORM_EXT)),g===i.RG_INTEGER&&(D===i.UNSIGNED_BYTE&&(K=i.RG8UI),D===i.UNSIGNED_SHORT&&(K=i.RG16UI),D===i.UNSIGNED_INT&&(K=i.RG32UI),D===i.BYTE&&(K=i.RG8I),D===i.SHORT&&(K=i.RG16I),D===i.INT&&(K=i.RG32I)),g===i.RGB_INTEGER&&(D===i.UNSIGNED_BYTE&&(K=i.RGB8UI),D===i.UNSIGNED_SHORT&&(K=i.RGB16UI),D===i.UNSIGNED_INT&&(K=i.RGB32UI),D===i.BYTE&&(K=i.RGB8I),D===i.SHORT&&(K=i.RGB16I),D===i.INT&&(K=i.RGB32I)),g===i.RGBA_INTEGER&&(D===i.UNSIGNED_BYTE&&(K=i.RGBA8UI),D===i.UNSIGNED_SHORT&&(K=i.RGBA16UI),D===i.UNSIGNED_INT&&(K=i.RGBA32UI),D===i.BYTE&&(K=i.RGBA8I),D===i.SHORT&&(K=i.RGBA16I),D===i.INT&&(K=i.RGBA32I)),g===i.RGB&&(D===i.UNSIGNED_SHORT&&ce&&(K=ce.RGB16_EXT),D===i.SHORT&&ce&&(K=ce.RGB16_SNORM_EXT),D===i.UNSIGNED_INT_5_9_9_9_REV&&(K=i.RGB9_E5),D===i.UNSIGNED_INT_10F_11F_11F_REV&&(K=i.R11F_G11F_B10F)),g===i.RGBA){let te=ie?$s:ct.getTransfer(W);D===i.FLOAT&&(K=i.RGBA32F),D===i.HALF_FLOAT&&(K=i.RGBA16F),D===i.UNSIGNED_BYTE&&(K=te===pt?i.SRGB8_ALPHA8:i.RGBA8),D===i.UNSIGNED_SHORT&&ce&&(K=ce.RGBA16_EXT),D===i.SHORT&&ce&&(K=ce.RGBA16_SNORM_EXT),D===i.UNSIGNED_SHORT_4_4_4_4&&(K=i.RGBA4),D===i.UNSIGNED_SHORT_5_5_5_1&&(K=i.RGB5_A1)}return(K===i.R16F||K===i.R32F||K===i.RG16F||K===i.RG32F||K===i.RGBA16F||K===i.RGBA32F)&&e.get("EXT_color_buffer_float"),K}function S(A,g){let D;return A?g===null||g===Ln||g===Ps?D=i.DEPTH24_STENCIL8:g===yn?D=i.DEPTH32F_STENCIL8:g===Cs&&(D=i.DEPTH24_STENCIL8,qe("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):g===null||g===Ln||g===Ps?D=i.DEPTH_COMPONENT24:g===yn?D=i.DEPTH_COMPONENT32F:g===Cs&&(D=i.DEPTH_COMPONENT16),D}function v(A,g){return p(A)===!0||A.isFramebufferTexture&&A.minFilter!==kt&&A.minFilter!==zt?Math.log2(Math.max(g.width,g.height))+1:A.mipmaps!==void 0&&A.mipmaps.length>0?A.mipmaps.length:A.isCompressedTexture&&Array.isArray(A.image)?g.mipmaps.length:1}function M(A){let g=A.target;g.removeEventListener("dispose",M),T(g),g.isVideoTexture&&u.delete(g),g.isHTMLTexture&&f.delete(g)}function m(A){let g=A.target;g.removeEventListener("dispose",m),I(g)}function T(A){let g=n.get(A);if(g.__webglInit===void 0)return;let D=A.source,U=d.get(D);if(U){let W=U[g.__cacheKey];W.usedTimes--,W.usedTimes===0&&P(A),Object.keys(U).length===0&&d.delete(D)}n.remove(A)}function P(A){let g=n.get(A);i.deleteTexture(g.__webglTexture);let D=A.source,U=d.get(D);delete U[g.__cacheKey],a.memory.textures--}function I(A){let g=n.get(A);if(A.depthTexture&&(A.depthTexture.dispose(),n.remove(A.depthTexture)),A.isWebGLCubeRenderTarget)for(let U=0;U<6;U++){if(Array.isArray(g.__webglFramebuffer[U]))for(let W=0;W<g.__webglFramebuffer[U].length;W++)i.deleteFramebuffer(g.__webglFramebuffer[U][W]);else i.deleteFramebuffer(g.__webglFramebuffer[U]);g.__webglDepthbuffer&&i.deleteRenderbuffer(g.__webglDepthbuffer[U])}else{if(Array.isArray(g.__webglFramebuffer))for(let U=0;U<g.__webglFramebuffer.length;U++)i.deleteFramebuffer(g.__webglFramebuffer[U]);else i.deleteFramebuffer(g.__webglFramebuffer);if(g.__webglDepthbuffer&&i.deleteRenderbuffer(g.__webglDepthbuffer),g.__webglMultisampledFramebuffer&&i.deleteFramebuffer(g.__webglMultisampledFramebuffer),g.__webglColorRenderbuffer)for(let U=0;U<g.__webglColorRenderbuffer.length;U++)g.__webglColorRenderbuffer[U]&&i.deleteRenderbuffer(g.__webglColorRenderbuffer[U]);g.__webglDepthRenderbuffer&&i.deleteRenderbuffer(g.__webglDepthRenderbuffer)}let D=A.textures;for(let U=0,W=D.length;U<W;U++){let ie=n.get(D[U]);ie.__webglTexture&&(i.deleteTexture(ie.__webglTexture),a.memory.textures--),n.remove(D[U])}n.remove(A)}let L=0;function N(){L=0}function V(){return L}function F(A){L=A}function X(){let A=L;return A>=s.maxTextures&&qe("WebGLTextures: Trying to use "+A+" texture units while this GPU supports only "+s.maxTextures),L+=1,A}function H(A){let g=[];return g.push(A.wrapS),g.push(A.wrapT),g.push(A.wrapR||0),g.push(A.magFilter),g.push(A.minFilter),g.push(A.anisotropy),g.push(A.internalFormat),g.push(A.format),g.push(A.type),g.push(A.generateMipmaps),g.push(A.premultiplyAlpha),g.push(A.flipY),g.push(A.unpackAlignment),g.push(A.colorSpace),g.join()}function $(A,g){let D=n.get(A);if(A.isVideoTexture&&k(A),A.isRenderTargetTexture===!1&&A.isExternalTexture!==!0&&A.version>0&&D.__version!==A.version){let U=A.image;if(U===null)qe("WebGLRenderer: Texture marked for update but no image data found.");else if(U.complete===!1)qe("WebGLRenderer: Texture marked for update but image is incomplete");else{j(D,A,g);return}}else A.isExternalTexture&&(D.__webglTexture=A.sourceTexture?A.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,D.__webglTexture,i.TEXTURE0+g)}function Q(A,g){let D=n.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&D.__version!==A.version){j(D,A,g);return}else A.isExternalTexture&&(D.__webglTexture=A.sourceTexture?A.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,D.__webglTexture,i.TEXTURE0+g)}function de(A,g){let D=n.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&D.__version!==A.version){j(D,A,g);return}t.bindTexture(i.TEXTURE_3D,D.__webglTexture,i.TEXTURE0+g)}function fe(A,g){let D=n.get(A);if(A.isCubeDepthTexture!==!0&&A.version>0&&D.__version!==A.version){se(D,A,g);return}t.bindTexture(i.TEXTURE_CUBE_MAP,D.__webglTexture,i.TEXTURE0+g)}let ge={[Ma]:i.REPEAT,[Fn]:i.CLAMP_TO_EDGE,[Sa]:i.MIRRORED_REPEAT},ze={[kt]:i.NEAREST,[bu]:i.NEAREST_MIPMAP_NEAREST,[Sr]:i.NEAREST_MIPMAP_LINEAR,[zt]:i.LINEAR,[so]:i.LINEAR_MIPMAP_NEAREST,[Ci]:i.LINEAR_MIPMAP_LINEAR},he={[wu]:i.NEVER,[Pu]:i.ALWAYS,[Tu]:i.LESS,[Go]:i.LEQUAL,[Eu]:i.EQUAL,[Wo]:i.GEQUAL,[Au]:i.GREATER,[Cu]:i.NOTEQUAL};function Ie(A,g){if(g.type===yn&&e.has("OES_texture_float_linear")===!1&&(g.magFilter===zt||g.magFilter===so||g.magFilter===Sr||g.magFilter===Ci||g.minFilter===zt||g.minFilter===so||g.minFilter===Sr||g.minFilter===Ci)&&qe("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(A,i.TEXTURE_WRAP_S,ge[g.wrapS]),i.texParameteri(A,i.TEXTURE_WRAP_T,ge[g.wrapT]),(A===i.TEXTURE_3D||A===i.TEXTURE_2D_ARRAY)&&i.texParameteri(A,i.TEXTURE_WRAP_R,ge[g.wrapR]),i.texParameteri(A,i.TEXTURE_MAG_FILTER,ze[g.magFilter]),i.texParameteri(A,i.TEXTURE_MIN_FILTER,ze[g.minFilter]),g.compareFunction&&(i.texParameteri(A,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(A,i.TEXTURE_COMPARE_FUNC,he[g.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(g.magFilter===kt||g.minFilter!==Sr&&g.minFilter!==Ci||g.type===yn&&e.has("OES_texture_float_linear")===!1)return;if(g.anisotropy>1||n.get(g).__currentAnisotropy){let D=e.get("EXT_texture_filter_anisotropic");i.texParameterf(A,D.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(g.anisotropy,s.getMaxAnisotropy())),n.get(g).__currentAnisotropy=g.anisotropy}}}function q(A,g){let D=!1;A.__webglInit===void 0&&(A.__webglInit=!0,g.addEventListener("dispose",M));let U=g.source,W=d.get(U);W===void 0&&(W={},d.set(U,W));let ie=H(g);if(ie!==A.__cacheKey){W[ie]===void 0&&(W[ie]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,D=!0),W[ie].usedTimes++;let ce=W[A.__cacheKey];ce!==void 0&&(W[A.__cacheKey].usedTimes--,ce.usedTimes===0&&P(g)),A.__cacheKey=ie,A.__webglTexture=W[ie].texture}return D}function O(A,g,D){return Math.floor(Math.floor(A/D)/g)}function z(A,g,D,U){let ie=A.updateRanges;if(ie.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,g.width,g.height,D,U,g.data);else{ie.sort((Ne,ye)=>Ne.start-ye.start);let ce=0;for(let Ne=1;Ne<ie.length;Ne++){let ye=ie[ce],Se=ie[Ne],Ve=ye.start+ye.count,Ye=O(Se.start,g.width,4),$e=O(ye.start,g.width,4);Se.start<=Ve+1&&Ye===$e&&O(Se.start+Se.count-1,g.width,4)===Ye?ye.count=Math.max(ye.count,Se.start+Se.count-ye.start):(++ce,ie[ce]=Se)}ie.length=ce+1;let K=t.getParameter(i.UNPACK_ROW_LENGTH),te=t.getParameter(i.UNPACK_SKIP_PIXELS),ve=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,g.width);for(let Ne=0,ye=ie.length;Ne<ye;Ne++){let Se=ie[Ne],Ve=Math.floor(Se.start/4),Ye=Math.ceil(Se.count/4),$e=Ve%g.width,B=Math.floor(Ve/g.width),be=Ye,ne=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,$e),t.pixelStorei(i.UNPACK_SKIP_ROWS,B),t.texSubImage2D(i.TEXTURE_2D,0,$e,B,be,ne,D,U,g.data)}A.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,K),t.pixelStorei(i.UNPACK_SKIP_PIXELS,te),t.pixelStorei(i.UNPACK_SKIP_ROWS,ve)}}function j(A,g,D){let U=i.TEXTURE_2D;(g.isDataArrayTexture||g.isCompressedArrayTexture)&&(U=i.TEXTURE_2D_ARRAY),g.isData3DTexture&&(U=i.TEXTURE_3D);let W=q(A,g),ie=g.source;t.bindTexture(U,A.__webglTexture,i.TEXTURE0+D);let ce=n.get(ie);if(ie.version!==ce.__version||W===!0){if(t.activeTexture(i.TEXTURE0+D),(typeof ImageBitmap<"u"&&g.image instanceof ImageBitmap)===!1){let ne=ct.getPrimaries(ct.workingColorSpace),xe=g.colorSpace===Nn?null:ct.getPrimaries(g.colorSpace),Ee=g.colorSpace===Nn||ne===xe?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,g.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,g.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ee)}t.pixelStorei(i.UNPACK_ALIGNMENT,g.unpackAlignment);let te=x(g.image,!1,s.maxTextureSize);te=Tt(g,te);let ve=r.convert(g.format,g.colorSpace),Ne=r.convert(g.type),ye=b(g.internalFormat,ve,Ne,g.normalized,g.colorSpace,g.isVideoTexture);Ie(U,g);let Se,Ve=g.mipmaps,Ye=g.isVideoTexture!==!0,$e=ce.__version===void 0||W===!0,B=ie.dataReady,be=v(g,te);if(g.isDepthTexture)ye=S(g.format===Pi,g.type),$e&&(Ye?t.texStorage2D(i.TEXTURE_2D,1,ye,te.width,te.height):t.texImage2D(i.TEXTURE_2D,0,ye,te.width,te.height,0,ve,Ne,null));else if(g.isDataTexture)if(Ve.length>0){Ye&&$e&&t.texStorage2D(i.TEXTURE_2D,be,ye,Ve[0].width,Ve[0].height);for(let ne=0,xe=Ve.length;ne<xe;ne++)Se=Ve[ne],Ye?B&&t.texSubImage2D(i.TEXTURE_2D,ne,0,0,Se.width,Se.height,ve,Ne,Se.data):t.texImage2D(i.TEXTURE_2D,ne,ye,Se.width,Se.height,0,ve,Ne,Se.data);g.generateMipmaps=!1}else Ye?($e&&t.texStorage2D(i.TEXTURE_2D,be,ye,te.width,te.height),B&&z(g,te,ve,Ne)):t.texImage2D(i.TEXTURE_2D,0,ye,te.width,te.height,0,ve,Ne,te.data);else if(g.isCompressedTexture)if(g.isCompressedArrayTexture){Ye&&$e&&t.texStorage3D(i.TEXTURE_2D_ARRAY,be,ye,Ve[0].width,Ve[0].height,te.depth);for(let ne=0,xe=Ve.length;ne<xe;ne++)if(Se=Ve[ne],g.format!==bn)if(ve!==null)if(Ye){if(B)if(g.layerUpdates.size>0){let Ee=Ec(Se.width,Se.height,g.format,g.type);for(let ae of g.layerUpdates){let Oe=Se.data.subarray(ae*Ee/Se.data.BYTES_PER_ELEMENT,(ae+1)*Ee/Se.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ne,0,0,ae,Se.width,Se.height,1,ve,Oe)}g.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ne,0,0,0,Se.width,Se.height,te.depth,ve,Se.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,ne,ye,Se.width,Se.height,te.depth,0,Se.data,0,0);else qe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ye?B&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,ne,0,0,0,Se.width,Se.height,te.depth,ve,Ne,Se.data):t.texImage3D(i.TEXTURE_2D_ARRAY,ne,ye,Se.width,Se.height,te.depth,0,ve,Ne,Se.data)}else{Ye&&$e&&t.texStorage2D(i.TEXTURE_2D,be,ye,Ve[0].width,Ve[0].height);for(let ne=0,xe=Ve.length;ne<xe;ne++)Se=Ve[ne],g.format!==bn?ve!==null?Ye?B&&t.compressedTexSubImage2D(i.TEXTURE_2D,ne,0,0,Se.width,Se.height,ve,Se.data):t.compressedTexImage2D(i.TEXTURE_2D,ne,ye,Se.width,Se.height,0,Se.data):qe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ye?B&&t.texSubImage2D(i.TEXTURE_2D,ne,0,0,Se.width,Se.height,ve,Ne,Se.data):t.texImage2D(i.TEXTURE_2D,ne,ye,Se.width,Se.height,0,ve,Ne,Se.data)}else if(g.isDataArrayTexture)if(Ye){if($e&&t.texStorage3D(i.TEXTURE_2D_ARRAY,be,ye,te.width,te.height,te.depth),B)if(g.layerUpdates.size>0){let ne=Ec(te.width,te.height,g.format,g.type);for(let xe of g.layerUpdates){let Ee=te.data.subarray(xe*ne/te.data.BYTES_PER_ELEMENT,(xe+1)*ne/te.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,xe,te.width,te.height,1,ve,Ne,Ee)}g.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,te.width,te.height,te.depth,ve,Ne,te.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,ye,te.width,te.height,te.depth,0,ve,Ne,te.data);else if(g.isData3DTexture)Ye?($e&&t.texStorage3D(i.TEXTURE_3D,be,ye,te.width,te.height,te.depth),B&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,te.width,te.height,te.depth,ve,Ne,te.data)):t.texImage3D(i.TEXTURE_3D,0,ye,te.width,te.height,te.depth,0,ve,Ne,te.data);else if(g.isFramebufferTexture){if($e)if(Ye)t.texStorage2D(i.TEXTURE_2D,be,ye,te.width,te.height);else{let ne=te.width,xe=te.height;for(let Ee=0;Ee<be;Ee++)t.texImage2D(i.TEXTURE_2D,Ee,ye,ne,xe,0,ve,Ne,null),ne>>=1,xe>>=1}}else if(g.isHTMLTexture){if("texElementImage2D"in i){let ne=i.canvas;if(ne.hasAttribute("layoutsubtree")||ne.setAttribute("layoutsubtree","true"),te.parentNode!==ne){ne.appendChild(te),f.add(g),ne.onpaint=xe=>{let Ee=xe.changedElements;for(let ae of f)Ee.includes(ae.image)&&(ae.needsUpdate=!0)},ne.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,te);else{let Ee=i.RGBA,ae=i.RGBA,Oe=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,Ee,ae,Oe,te)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Ve.length>0){if(Ye&&$e){let ne=lt(Ve[0]);t.texStorage2D(i.TEXTURE_2D,be,ye,ne.width,ne.height)}for(let ne=0,xe=Ve.length;ne<xe;ne++)Se=Ve[ne],Ye?B&&t.texSubImage2D(i.TEXTURE_2D,ne,0,0,ve,Ne,Se):t.texImage2D(i.TEXTURE_2D,ne,ye,ve,Ne,Se);g.generateMipmaps=!1}else if(Ye){if($e){let ne=lt(te);t.texStorage2D(i.TEXTURE_2D,be,ye,ne.width,ne.height)}B&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,ve,Ne,te)}else t.texImage2D(i.TEXTURE_2D,0,ye,ve,Ne,te);p(g)&&C(U),ce.__version=ie.version,g.onUpdate&&g.onUpdate(g)}A.__version=g.version}function se(A,g,D){if(g.image.length!==6)return;let U=q(A,g),W=g.source;t.bindTexture(i.TEXTURE_CUBE_MAP,A.__webglTexture,i.TEXTURE0+D);let ie=n.get(W);if(W.version!==ie.__version||U===!0){t.activeTexture(i.TEXTURE0+D);let ce=ct.getPrimaries(ct.workingColorSpace),K=g.colorSpace===Nn?null:ct.getPrimaries(g.colorSpace),te=g.colorSpace===Nn||ce===K?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,g.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,g.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,g.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,te);let ve=g.isCompressedTexture||g.image[0].isCompressedTexture,Ne=g.image[0]&&g.image[0].isDataTexture,ye=[];for(let ae=0;ae<6;ae++)!ve&&!Ne?ye[ae]=x(g.image[ae],!0,s.maxCubemapSize):ye[ae]=Ne?g.image[ae].image:g.image[ae],ye[ae]=Tt(g,ye[ae]);let Se=ye[0],Ve=r.convert(g.format,g.colorSpace),Ye=r.convert(g.type),$e=b(g.internalFormat,Ve,Ye,g.normalized,g.colorSpace),B=g.isVideoTexture!==!0,be=ie.__version===void 0||U===!0,ne=W.dataReady,xe=v(g,Se);Ie(i.TEXTURE_CUBE_MAP,g);let Ee;if(ve){B&&be&&t.texStorage2D(i.TEXTURE_CUBE_MAP,xe,$e,Se.width,Se.height);for(let ae=0;ae<6;ae++){Ee=ye[ae].mipmaps;for(let Oe=0;Oe<Ee.length;Oe++){let De=Ee[Oe];g.format!==bn?Ve!==null?B?ne&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,Oe,0,0,De.width,De.height,Ve,De.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,Oe,$e,De.width,De.height,0,De.data):qe("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):B?ne&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,Oe,0,0,De.width,De.height,Ve,Ye,De.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,Oe,$e,De.width,De.height,0,Ve,Ye,De.data)}}}else{if(Ee=g.mipmaps,B&&be){Ee.length>0&&xe++;let ae=lt(ye[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,xe,$e,ae.width,ae.height)}for(let ae=0;ae<6;ae++)if(Ne){B?ne&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0,0,0,ye[ae].width,ye[ae].height,Ve,Ye,ye[ae].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0,$e,ye[ae].width,ye[ae].height,0,Ve,Ye,ye[ae].data);for(let Oe=0;Oe<Ee.length;Oe++){let ht=Ee[Oe].image[ae].image;B?ne&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,Oe+1,0,0,ht.width,ht.height,Ve,Ye,ht.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,Oe+1,$e,ht.width,ht.height,0,Ve,Ye,ht.data)}}else{B?ne&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0,0,0,Ve,Ye,ye[ae]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0,$e,Ve,Ye,ye[ae]);for(let Oe=0;Oe<Ee.length;Oe++){let De=Ee[Oe];B?ne&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,Oe+1,0,0,Ve,Ye,De.image[ae]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,Oe+1,$e,Ve,Ye,De.image[ae])}}}p(g)&&C(i.TEXTURE_CUBE_MAP),ie.__version=W.version,g.onUpdate&&g.onUpdate(g)}A.__version=g.version}function oe(A,g,D,U,W,ie){let ce=r.convert(D.format,D.colorSpace),K=r.convert(D.type),te=b(D.internalFormat,ce,K,D.normalized,D.colorSpace),ve=n.get(g),Ne=n.get(D);if(Ne.__renderTarget=g,!ve.__hasExternalTextures){let ye=Math.max(1,g.width>>ie),Se=Math.max(1,g.height>>ie);W===i.TEXTURE_3D||W===i.TEXTURE_2D_ARRAY?t.texImage3D(W,ie,te,ye,Se,g.depth,0,ce,K,null):t.texImage2D(W,ie,te,ye,Se,0,ce,K,null)}t.bindFramebuffer(i.FRAMEBUFFER,A),ut(g)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,U,W,Ne.__webglTexture,0,it(g)):(W===i.TEXTURE_2D||W>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&W<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,U,W,Ne.__webglTexture,ie),t.bindFramebuffer(i.FRAMEBUFFER,null)}function ue(A,g,D){if(i.bindRenderbuffer(i.RENDERBUFFER,A),g.depthBuffer){let U=g.depthTexture,W=U&&U.isDepthTexture?U.type:null,ie=S(g.stencilBuffer,W),ce=g.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;ut(g)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,it(g),ie,g.width,g.height):D?i.renderbufferStorageMultisample(i.RENDERBUFFER,it(g),ie,g.width,g.height):i.renderbufferStorage(i.RENDERBUFFER,ie,g.width,g.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,ce,i.RENDERBUFFER,A)}else{let U=g.textures;for(let W=0;W<U.length;W++){let ie=U[W],ce=r.convert(ie.format,ie.colorSpace),K=r.convert(ie.type),te=b(ie.internalFormat,ce,K,ie.normalized,ie.colorSpace);ut(g)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,it(g),te,g.width,g.height):D?i.renderbufferStorageMultisample(i.RENDERBUFFER,it(g),te,g.width,g.height):i.renderbufferStorage(i.RENDERBUFFER,te,g.width,g.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function me(A,g,D){let U=g.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,A),!(g.depthTexture&&g.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let W=n.get(g.depthTexture);if(W.__renderTarget=g,(!W.__webglTexture||g.depthTexture.image.width!==g.width||g.depthTexture.image.height!==g.height)&&(g.depthTexture.image.width=g.width,g.depthTexture.image.height=g.height,g.depthTexture.needsUpdate=!0),U){if(W.__webglInit===void 0&&(W.__webglInit=!0,g.depthTexture.addEventListener("dispose",M)),W.__webglTexture===void 0){W.__webglTexture=i.createTexture(),t.bindTexture(i.TEXTURE_CUBE_MAP,W.__webglTexture),Ie(i.TEXTURE_CUBE_MAP,g.depthTexture);let ve=r.convert(g.depthTexture.format),Ne=r.convert(g.depthTexture.type),ye;g.depthTexture.format===On?ye=i.DEPTH_COMPONENT24:g.depthTexture.format===Pi&&(ye=i.DEPTH24_STENCIL8);for(let Se=0;Se<6;Se++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Se,0,ye,g.width,g.height,0,ve,Ne,null)}}else $(g.depthTexture,0);let ie=W.__webglTexture,ce=it(g),K=U?i.TEXTURE_CUBE_MAP_POSITIVE_X+D:i.TEXTURE_2D,te=g.depthTexture.format===Pi?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(g.depthTexture.format===On)ut(g)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,te,K,ie,0,ce):i.framebufferTexture2D(i.FRAMEBUFFER,te,K,ie,0);else if(g.depthTexture.format===Pi)ut(g)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,te,K,ie,0,ce):i.framebufferTexture2D(i.FRAMEBUFFER,te,K,ie,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function pe(A){let g=n.get(A),D=A.isWebGLCubeRenderTarget===!0;if(g.__boundDepthTexture!==A.depthTexture){let U=A.depthTexture;if(g.__depthDisposeCallback&&g.__depthDisposeCallback(),U){let W=()=>{delete g.__boundDepthTexture,delete g.__depthDisposeCallback,U.removeEventListener("dispose",W)};U.addEventListener("dispose",W),g.__depthDisposeCallback=W}g.__boundDepthTexture=U}if(A.depthTexture&&!g.__autoAllocateDepthBuffer)if(D)for(let U=0;U<6;U++)me(g.__webglFramebuffer[U],A,U);else{let U=A.texture.mipmaps;U&&U.length>0?me(g.__webglFramebuffer[0],A,0):me(g.__webglFramebuffer,A,0)}else if(D){g.__webglDepthbuffer=[];for(let U=0;U<6;U++)if(t.bindFramebuffer(i.FRAMEBUFFER,g.__webglFramebuffer[U]),g.__webglDepthbuffer[U]===void 0)g.__webglDepthbuffer[U]=i.createRenderbuffer(),ue(g.__webglDepthbuffer[U],A,!1);else{let W=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ie=g.__webglDepthbuffer[U];i.bindRenderbuffer(i.RENDERBUFFER,ie),i.framebufferRenderbuffer(i.FRAMEBUFFER,W,i.RENDERBUFFER,ie)}}else{let U=A.texture.mipmaps;if(U&&U.length>0?t.bindFramebuffer(i.FRAMEBUFFER,g.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,g.__webglFramebuffer),g.__webglDepthbuffer===void 0)g.__webglDepthbuffer=i.createRenderbuffer(),ue(g.__webglDepthbuffer,A,!1);else{let W=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ie=g.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,ie),i.framebufferRenderbuffer(i.FRAMEBUFFER,W,i.RENDERBUFFER,ie)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function _e(A,g,D){let U=n.get(A);g!==void 0&&oe(U.__webglFramebuffer,A,A.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),D!==void 0&&pe(A)}function ee(A){let g=A.texture,D=n.get(A),U=n.get(g);A.addEventListener("dispose",m);let W=A.textures,ie=A.isWebGLCubeRenderTarget===!0,ce=W.length>1;if(ce||(U.__webglTexture===void 0&&(U.__webglTexture=i.createTexture()),U.__version=g.version,a.memory.textures++),ie){D.__webglFramebuffer=[];for(let K=0;K<6;K++)if(g.mipmaps&&g.mipmaps.length>0){D.__webglFramebuffer[K]=[];for(let te=0;te<g.mipmaps.length;te++)D.__webglFramebuffer[K][te]=i.createFramebuffer()}else D.__webglFramebuffer[K]=i.createFramebuffer()}else{if(g.mipmaps&&g.mipmaps.length>0){D.__webglFramebuffer=[];for(let K=0;K<g.mipmaps.length;K++)D.__webglFramebuffer[K]=i.createFramebuffer()}else D.__webglFramebuffer=i.createFramebuffer();if(ce)for(let K=0,te=W.length;K<te;K++){let ve=n.get(W[K]);ve.__webglTexture===void 0&&(ve.__webglTexture=i.createTexture(),a.memory.textures++)}if(A.samples>0&&ut(A)===!1){D.__webglMultisampledFramebuffer=i.createFramebuffer(),D.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,D.__webglMultisampledFramebuffer);for(let K=0;K<W.length;K++){let te=W[K];D.__webglColorRenderbuffer[K]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,D.__webglColorRenderbuffer[K]);let ve=r.convert(te.format,te.colorSpace),Ne=r.convert(te.type),ye=b(te.internalFormat,ve,Ne,te.normalized,te.colorSpace,A.isXRRenderTarget===!0),Se=it(A);i.renderbufferStorageMultisample(i.RENDERBUFFER,Se,ye,A.width,A.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+K,i.RENDERBUFFER,D.__webglColorRenderbuffer[K])}i.bindRenderbuffer(i.RENDERBUFFER,null),A.depthBuffer&&(D.__webglDepthRenderbuffer=i.createRenderbuffer(),ue(D.__webglDepthRenderbuffer,A,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(ie){t.bindTexture(i.TEXTURE_CUBE_MAP,U.__webglTexture),Ie(i.TEXTURE_CUBE_MAP,g);for(let K=0;K<6;K++)if(g.mipmaps&&g.mipmaps.length>0)for(let te=0;te<g.mipmaps.length;te++)oe(D.__webglFramebuffer[K][te],A,g,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+K,te);else oe(D.__webglFramebuffer[K],A,g,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0);p(g)&&C(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(ce){for(let K=0,te=W.length;K<te;K++){let ve=W[K],Ne=n.get(ve),ye=i.TEXTURE_2D;(A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(ye=A.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(ye,Ne.__webglTexture),Ie(ye,ve),oe(D.__webglFramebuffer,A,ve,i.COLOR_ATTACHMENT0+K,ye,0),p(ve)&&C(ye)}t.unbindTexture()}else{let K=i.TEXTURE_2D;if((A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(K=A.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(K,U.__webglTexture),Ie(K,g),g.mipmaps&&g.mipmaps.length>0)for(let te=0;te<g.mipmaps.length;te++)oe(D.__webglFramebuffer[te],A,g,i.COLOR_ATTACHMENT0,K,te);else oe(D.__webglFramebuffer,A,g,i.COLOR_ATTACHMENT0,K,0);p(g)&&C(K),t.unbindTexture()}A.depthBuffer&&pe(A)}function Me(A){let g=A.textures;for(let D=0,U=g.length;D<U;D++){let W=g[D];if(p(W)){let ie=w(A),ce=n.get(W).__webglTexture;t.bindTexture(ie,ce),C(ie),t.unbindTexture()}}}let We=[],Ke=[];function Xe(A){if(A.samples>0){if(ut(A)===!1){let g=A.textures,D=A.width,U=A.height,W=i.COLOR_BUFFER_BIT,ie=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ce=n.get(A),K=g.length>1;if(K)for(let ve=0;ve<g.length;ve++)t.bindFramebuffer(i.FRAMEBUFFER,ce.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ve,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,ce.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ve,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,ce.__webglMultisampledFramebuffer);let te=A.texture.mipmaps;te&&te.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ce.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ce.__webglFramebuffer);for(let ve=0;ve<g.length;ve++){if(A.resolveDepthBuffer&&(A.depthBuffer&&(W|=i.DEPTH_BUFFER_BIT),A.stencilBuffer&&A.resolveStencilBuffer&&(W|=i.STENCIL_BUFFER_BIT)),K){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,ce.__webglColorRenderbuffer[ve]);let Ne=n.get(g[ve]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Ne,0)}i.blitFramebuffer(0,0,D,U,0,0,D,U,W,i.NEAREST),c===!0&&(We.length=0,Ke.length=0,We.push(i.COLOR_ATTACHMENT0+ve),A.depthBuffer&&A.resolveDepthBuffer===!1&&(We.push(ie),Ke.push(ie),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,Ke)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,We))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),K)for(let ve=0;ve<g.length;ve++){t.bindFramebuffer(i.FRAMEBUFFER,ce.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ve,i.RENDERBUFFER,ce.__webglColorRenderbuffer[ve]);let Ne=n.get(g[ve]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,ce.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ve,i.TEXTURE_2D,Ne,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ce.__webglMultisampledFramebuffer)}else if(A.depthBuffer&&A.resolveDepthBuffer===!1&&c){let g=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[g])}}}function it(A){return Math.min(s.maxSamples,A.samples)}function ut(A){let g=n.get(A);return A.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&g.__useRenderToTexture!==!1}function k(A){let g=a.render.frame;u.get(A)!==g&&(u.set(A,g),A.update())}function Tt(A,g){let D=A.colorSpace,U=A.format,W=A.type;return A.isCompressedTexture===!0||A.isVideoTexture===!0||D!==Ks&&D!==Nn&&(ct.getTransfer(D)===pt?(U!==bn||W!==Qt)&&qe("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Je("WebGLTextures: Unsupported texture color space:",D)),g}function lt(A){return typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement?(l.width=A.naturalWidth||A.width,l.height=A.naturalHeight||A.height):typeof VideoFrame<"u"&&A instanceof VideoFrame?(l.width=A.displayWidth,l.height=A.displayHeight):(l.width=A.width,l.height=A.height),l}this.allocateTextureUnit=X,this.resetTextureUnits=N,this.getTextureUnits=V,this.setTextureUnits=F,this.setTexture2D=$,this.setTexture2DArray=Q,this.setTexture3D=de,this.setTextureCube=fe,this.rebindTextures=_e,this.setupRenderTarget=ee,this.updateRenderTargetMipmap=Me,this.updateMultisampleRenderTarget=Xe,this.setupDepthRenderbuffer=pe,this.setupFrameBufferTexture=oe,this.useMultisampledRTT=ut,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function l_(i,e){function t(n,s=Nn){let r,a=ct.getTransfer(s);if(n===Qt)return i.UNSIGNED_BYTE;if(n===ao)return i.UNSIGNED_SHORT_4_4_4_4;if(n===oo)return i.UNSIGNED_SHORT_5_5_5_1;if(n===gc)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===xc)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===pc)return i.BYTE;if(n===mc)return i.SHORT;if(n===Cs)return i.UNSIGNED_SHORT;if(n===ro)return i.INT;if(n===Ln)return i.UNSIGNED_INT;if(n===yn)return i.FLOAT;if(n===Gn)return i.HALF_FLOAT;if(n===_c)return i.ALPHA;if(n===vc)return i.RGB;if(n===bn)return i.RGBA;if(n===On)return i.DEPTH_COMPONENT;if(n===Pi)return i.DEPTH_STENCIL;if(n===Is)return i.RED;if(n===lo)return i.RED_INTEGER;if(n===Ii)return i.RG;if(n===co)return i.RG_INTEGER;if(n===ho)return i.RGBA_INTEGER;if(n===wr||n===Tr||n===Er||n===Ar)if(a===pt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===wr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Tr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Er)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Ar)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===wr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Tr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Er)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Ar)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===uo||n===fo||n===po||n===mo)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===uo)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===fo)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===po)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===mo)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===go||n===xo||n===_o||n===vo||n===yo||n===Cr||n===bo)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===go||n===xo)return a===pt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===_o)return a===pt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===vo)return r.COMPRESSED_R11_EAC;if(n===yo)return r.COMPRESSED_SIGNED_R11_EAC;if(n===Cr)return r.COMPRESSED_RG11_EAC;if(n===bo)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Mo||n===So||n===wo||n===To||n===Eo||n===Ao||n===Co||n===Po||n===Io||n===Ro||n===Lo||n===No||n===Do||n===Uo)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Mo)return a===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===So)return a===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===wo)return a===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===To)return a===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Eo)return a===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Ao)return a===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Co)return a===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Po)return a===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Io)return a===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Ro)return a===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Lo)return a===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===No)return a===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Do)return a===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Uo)return a===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Fo||n===Oo||n===Bo)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Fo)return a===pt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Oo)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Bo)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===ko||n===zo||n===Pr||n===Vo)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===ko)return r.COMPRESSED_RED_RGTC1_EXT;if(n===zo)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Pr)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Vo)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Ps?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var c_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,h_=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,zc=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new or(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new jt({vertexShader:c_,fragmentShader:h_,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new St(new ur(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Vc=class extends Cn{constructor(e,t){super();let n=this,s=null,r=1,a=null,o="local-floor",c=1,l=null,u=null,f=null,h=null,d=null,_=null,y=typeof XRWebGLBinding<"u",x=new zc,p={},C=t.getContextAttributes(),w=null,b=null,S=[],v=[],M=new Re,m=null,T=new Bt;T.viewport=new wt;let P=new Bt;P.viewport=new wt;let I=[T,P],L=new to,N=null,V=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(q){let O=S[q];return O===void 0&&(O=new Ms,S[q]=O),O.getTargetRaySpace()},this.getControllerGrip=function(q){let O=S[q];return O===void 0&&(O=new Ms,S[q]=O),O.getGripSpace()},this.getHand=function(q){let O=S[q];return O===void 0&&(O=new Ms,S[q]=O),O.getHandSpace()};function F(q){let O=v.indexOf(q.inputSource);if(O===-1)return;let z=S[O];z!==void 0&&(z.update(q.inputSource,q.frame,l||a),z.dispatchEvent({type:q.type,data:q.inputSource}))}function X(){s.removeEventListener("select",F),s.removeEventListener("selectstart",F),s.removeEventListener("selectend",F),s.removeEventListener("squeeze",F),s.removeEventListener("squeezestart",F),s.removeEventListener("squeezeend",F),s.removeEventListener("end",X),s.removeEventListener("inputsourceschange",H);for(let q=0;q<S.length;q++){let O=v[q];O!==null&&(v[q]=null,S[q].disconnect(O))}N=null,V=null,x.reset();for(let q in p)delete p[q];e.setRenderTarget(w),d=null,h=null,f=null,s=null,b=null,Ie.stop(),n.isPresenting=!1,e.setPixelRatio(m),e.setSize(M.width,M.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(q){r=q,n.isPresenting===!0&&qe("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(q){o=q,n.isPresenting===!0&&qe("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||a},this.setReferenceSpace=function(q){l=q},this.getBaseLayer=function(){return h!==null?h:d},this.getBinding=function(){return f===null&&y&&(f=new XRWebGLBinding(s,t)),f},this.getFrame=function(){return _},this.getSession=function(){return s},this.setSession=async function(q){if(s=q,s!==null){if(w=e.getRenderTarget(),s.addEventListener("select",F),s.addEventListener("selectstart",F),s.addEventListener("selectend",F),s.addEventListener("squeeze",F),s.addEventListener("squeezestart",F),s.addEventListener("squeezeend",F),s.addEventListener("end",X),s.addEventListener("inputsourceschange",H),C.xrCompatible!==!0&&await t.makeXRCompatible(),m=e.getPixelRatio(),e.getSize(M),y&&"createProjectionLayer"in XRWebGLBinding.prototype){let z=null,j=null,se=null;C.depth&&(se=C.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,z=C.stencil?Pi:On,j=C.stencil?Ps:Ln);let oe={colorFormat:t.RGBA8,depthFormat:se,scaleFactor:r};f=this.getBinding(),h=f.createProjectionLayer(oe),s.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),b=new Zt(h.textureWidth,h.textureHeight,{format:bn,type:Qt,depthTexture:new ri(h.textureWidth,h.textureHeight,j,void 0,void 0,void 0,void 0,void 0,void 0,z),stencilBuffer:C.stencil,colorSpace:e.outputColorSpace,samples:C.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1})}else{let z={antialias:C.antialias,alpha:!0,depth:C.depth,stencil:C.stencil,framebufferScaleFactor:r};d=new XRWebGLLayer(s,t,z),s.updateRenderState({baseLayer:d}),e.setPixelRatio(1),e.setSize(d.framebufferWidth,d.framebufferHeight,!1),b=new Zt(d.framebufferWidth,d.framebufferHeight,{format:bn,type:Qt,colorSpace:e.outputColorSpace,stencilBuffer:C.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}b.isXRRenderTarget=!0,this.setFoveation(c),l=null,a=await s.requestReferenceSpace(o),Ie.setContext(s),Ie.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return x.getDepthTexture()};function H(q){for(let O=0;O<q.removed.length;O++){let z=q.removed[O],j=v.indexOf(z);j>=0&&(v[j]=null,S[j].disconnect(z))}for(let O=0;O<q.added.length;O++){let z=q.added[O],j=v.indexOf(z);if(j===-1){for(let oe=0;oe<S.length;oe++)if(oe>=v.length){v.push(z),j=oe;break}else if(v[oe]===null){v[oe]=z,j=oe;break}if(j===-1)break}let se=S[j];se&&se.connect(z)}}let $=new R,Q=new R;function de(q,O,z){$.setFromMatrixPosition(O.matrixWorld),Q.setFromMatrixPosition(z.matrixWorld);let j=$.distanceTo(Q),se=O.projectionMatrix.elements,oe=z.projectionMatrix.elements,ue=se[14]/(se[10]-1),me=se[14]/(se[10]+1),pe=(se[9]+1)/se[5],_e=(se[9]-1)/se[5],ee=(se[8]-1)/se[0],Me=(oe[8]+1)/oe[0],We=ue*ee,Ke=ue*Me,Xe=j/(-ee+Me),it=Xe*-ee;if(O.matrixWorld.decompose(q.position,q.quaternion,q.scale),q.translateX(it),q.translateZ(Xe),q.matrixWorld.compose(q.position,q.quaternion,q.scale),q.matrixWorldInverse.copy(q.matrixWorld).invert(),se[10]===-1)q.projectionMatrix.copy(O.projectionMatrix),q.projectionMatrixInverse.copy(O.projectionMatrixInverse);else{let ut=ue+Xe,k=me+Xe,Tt=We-it,lt=Ke+(j-it),A=pe*me/k*ut,g=_e*me/k*ut;q.projectionMatrix.makePerspective(Tt,lt,A,g,ut,k),q.projectionMatrixInverse.copy(q.projectionMatrix).invert()}}function fe(q,O){O===null?q.matrixWorld.copy(q.matrix):q.matrixWorld.multiplyMatrices(O.matrixWorld,q.matrix),q.matrixWorldInverse.copy(q.matrixWorld).invert()}this.updateCamera=function(q){if(s===null)return;let O=q.near,z=q.far;x.texture!==null&&(x.depthNear>0&&(O=x.depthNear),x.depthFar>0&&(z=x.depthFar)),L.near=P.near=T.near=O,L.far=P.far=T.far=z,(N!==L.near||V!==L.far)&&(s.updateRenderState({depthNear:L.near,depthFar:L.far}),N=L.near,V=L.far),L.layers.mask=q.layers.mask|6,T.layers.mask=L.layers.mask&-5,P.layers.mask=L.layers.mask&-3;let j=q.parent,se=L.cameras;fe(L,j);for(let oe=0;oe<se.length;oe++)fe(se[oe],j);se.length===2?de(L,T,P):L.projectionMatrix.copy(T.projectionMatrix),ge(q,L,j)};function ge(q,O,z){z===null?q.matrix.copy(O.matrixWorld):(q.matrix.copy(z.matrixWorld),q.matrix.invert(),q.matrix.multiply(O.matrixWorld)),q.matrix.decompose(q.position,q.quaternion,q.scale),q.updateMatrixWorld(!0),q.projectionMatrix.copy(O.projectionMatrix),q.projectionMatrixInverse.copy(O.projectionMatrixInverse),q.isPerspectiveCamera&&(q.fov=vs*2*Math.atan(1/q.projectionMatrix.elements[5]),q.zoom=1)}this.getCamera=function(){return L},this.getFoveation=function(){if(!(h===null&&d===null))return c},this.setFoveation=function(q){c=q,h!==null&&(h.fixedFoveation=q),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=q)},this.hasDepthSensing=function(){return x.texture!==null},this.getDepthSensingMesh=function(){return x.getMesh(L)},this.getCameraTexture=function(q){return p[q]};let ze=null;function he(q,O){if(u=O.getViewerPose(l||a),_=O,u!==null){let z=u.views;d!==null&&(e.setRenderTargetFramebuffer(b,d.framebuffer),e.setRenderTarget(b));let j=!1;z.length!==L.cameras.length&&(L.cameras.length=0,j=!0);for(let me=0;me<z.length;me++){let pe=z[me],_e=null;if(d!==null)_e=d.getViewport(pe);else{let Me=f.getViewSubImage(h,pe);_e=Me.viewport,me===0&&(e.setRenderTargetTextures(b,Me.colorTexture,Me.depthStencilTexture),e.setRenderTarget(b))}let ee=I[me];ee===void 0&&(ee=new Bt,ee.layers.enable(me),ee.viewport=new wt,I[me]=ee),ee.matrix.fromArray(pe.transform.matrix),ee.matrix.decompose(ee.position,ee.quaternion,ee.scale),ee.projectionMatrix.fromArray(pe.projectionMatrix),ee.projectionMatrixInverse.copy(ee.projectionMatrix).invert(),ee.viewport.set(_e.x,_e.y,_e.width,_e.height),me===0&&(L.matrix.copy(ee.matrix),L.matrix.decompose(L.position,L.quaternion,L.scale)),j===!0&&L.cameras.push(ee)}let se=s.enabledFeatures;if(se&&se.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&y){f=n.getBinding();let me=f.getDepthInformation(z[0]);me&&me.isValid&&me.texture&&x.init(me,s.renderState)}if(se&&se.includes("camera-access")&&y){e.state.unbindTexture(),f=n.getBinding();for(let me=0;me<z.length;me++){let pe=z[me].camera;if(pe){let _e=p[pe];_e||(_e=new or,p[pe]=_e);let ee=f.getCameraImage(pe);_e.sourceTexture=ee}}}}for(let z=0;z<S.length;z++){let j=v[z],se=S[z];j!==null&&se!==void 0&&se.update(j,O,l||a)}ze&&ze(q,O),O.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:O}),_=null}let Ie=new rd;Ie.setAnimationLoop(he),this.setAnimationLoop=function(q){ze=q},this.dispose=function(){}}},u_=new ft,ud=new Qe;ud.set(-1,0,0,0,1,0,0,0,1);function d_(i,e){function t(x,p){x.matrixAutoUpdate===!0&&x.updateMatrix(),p.value.copy(x.matrix)}function n(x,p){p.color.getRGB(x.fogColor.value,Sc(i)),p.isFog?(x.fogNear.value=p.near,x.fogFar.value=p.far):p.isFogExp2&&(x.fogDensity.value=p.density)}function s(x,p,C,w,b){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?r(x,p):p.isMeshLambertMaterial?(r(x,p),p.envMap&&(x.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(r(x,p),f(x,p)):p.isMeshPhongMaterial?(r(x,p),u(x,p),p.envMap&&(x.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(r(x,p),h(x,p),p.isMeshPhysicalMaterial&&d(x,p,b)):p.isMeshMatcapMaterial?(r(x,p),_(x,p)):p.isMeshDepthMaterial?r(x,p):p.isMeshDistanceMaterial?(r(x,p),y(x,p)):p.isMeshNormalMaterial?r(x,p):p.isLineBasicMaterial?(a(x,p),p.isLineDashedMaterial&&o(x,p)):p.isPointsMaterial?c(x,p,C,w):p.isSpriteMaterial?l(x,p):p.isShadowMaterial?(x.color.value.copy(p.color),x.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(x,p){x.opacity.value=p.opacity,p.color&&x.diffuse.value.copy(p.color),p.emissive&&x.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(x.map.value=p.map,t(p.map,x.mapTransform)),p.alphaMap&&(x.alphaMap.value=p.alphaMap,t(p.alphaMap,x.alphaMapTransform)),p.bumpMap&&(x.bumpMap.value=p.bumpMap,t(p.bumpMap,x.bumpMapTransform),x.bumpScale.value=p.bumpScale,p.side===Jt&&(x.bumpScale.value*=-1)),p.normalMap&&(x.normalMap.value=p.normalMap,t(p.normalMap,x.normalMapTransform),x.normalScale.value.copy(p.normalScale),p.side===Jt&&x.normalScale.value.negate()),p.displacementMap&&(x.displacementMap.value=p.displacementMap,t(p.displacementMap,x.displacementMapTransform),x.displacementScale.value=p.displacementScale,x.displacementBias.value=p.displacementBias),p.emissiveMap&&(x.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,x.emissiveMapTransform)),p.specularMap&&(x.specularMap.value=p.specularMap,t(p.specularMap,x.specularMapTransform)),p.alphaTest>0&&(x.alphaTest.value=p.alphaTest);let C=e.get(p),w=C.envMap,b=C.envMapRotation;w&&(x.envMap.value=w,x.envMapRotation.value.setFromMatrix4(u_.makeRotationFromEuler(b)).transpose(),w.isCubeTexture&&w.isRenderTargetTexture===!1&&x.envMapRotation.value.premultiply(ud),x.reflectivity.value=p.reflectivity,x.ior.value=p.ior,x.refractionRatio.value=p.refractionRatio),p.lightMap&&(x.lightMap.value=p.lightMap,x.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,x.lightMapTransform)),p.aoMap&&(x.aoMap.value=p.aoMap,x.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,x.aoMapTransform))}function a(x,p){x.diffuse.value.copy(p.color),x.opacity.value=p.opacity,p.map&&(x.map.value=p.map,t(p.map,x.mapTransform))}function o(x,p){x.dashSize.value=p.dashSize,x.totalSize.value=p.dashSize+p.gapSize,x.scale.value=p.scale}function c(x,p,C,w){x.diffuse.value.copy(p.color),x.opacity.value=p.opacity,x.size.value=p.size*C,x.scale.value=w*.5,p.map&&(x.map.value=p.map,t(p.map,x.uvTransform)),p.alphaMap&&(x.alphaMap.value=p.alphaMap,t(p.alphaMap,x.alphaMapTransform)),p.alphaTest>0&&(x.alphaTest.value=p.alphaTest)}function l(x,p){x.diffuse.value.copy(p.color),x.opacity.value=p.opacity,x.rotation.value=p.rotation,p.map&&(x.map.value=p.map,t(p.map,x.mapTransform)),p.alphaMap&&(x.alphaMap.value=p.alphaMap,t(p.alphaMap,x.alphaMapTransform)),p.alphaTest>0&&(x.alphaTest.value=p.alphaTest)}function u(x,p){x.specular.value.copy(p.specular),x.shininess.value=Math.max(p.shininess,1e-4)}function f(x,p){p.gradientMap&&(x.gradientMap.value=p.gradientMap)}function h(x,p){x.metalness.value=p.metalness,p.metalnessMap&&(x.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,x.metalnessMapTransform)),x.roughness.value=p.roughness,p.roughnessMap&&(x.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,x.roughnessMapTransform)),p.envMap&&(x.envMapIntensity.value=p.envMapIntensity)}function d(x,p,C){x.ior.value=p.ior,p.sheen>0&&(x.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),x.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(x.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,x.sheenColorMapTransform)),p.sheenRoughnessMap&&(x.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,x.sheenRoughnessMapTransform))),p.clearcoat>0&&(x.clearcoat.value=p.clearcoat,x.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(x.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,x.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(x.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,x.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(x.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,x.clearcoatNormalMapTransform),x.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Jt&&x.clearcoatNormalScale.value.negate())),p.dispersion>0&&(x.dispersion.value=p.dispersion),p.iridescence>0&&(x.iridescence.value=p.iridescence,x.iridescenceIOR.value=p.iridescenceIOR,x.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],x.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(x.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,x.iridescenceMapTransform)),p.iridescenceThicknessMap&&(x.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,x.iridescenceThicknessMapTransform))),p.transmission>0&&(x.transmission.value=p.transmission,x.transmissionSamplerMap.value=C.texture,x.transmissionSamplerSize.value.set(C.width,C.height),p.transmissionMap&&(x.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,x.transmissionMapTransform)),x.thickness.value=p.thickness,p.thicknessMap&&(x.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,x.thicknessMapTransform)),x.attenuationDistance.value=p.attenuationDistance,x.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(x.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(x.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,x.anisotropyMapTransform))),x.specularIntensity.value=p.specularIntensity,x.specularColor.value.copy(p.specularColor),p.specularColorMap&&(x.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,x.specularColorMapTransform)),p.specularIntensityMap&&(x.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,x.specularIntensityMapTransform))}function _(x,p){p.matcap&&(x.matcap.value=p.matcap)}function y(x,p){let C=e.get(p).light;x.referencePosition.value.setFromMatrixPosition(C.matrixWorld),x.nearDistance.value=C.shadow.camera.near,x.farDistance.value=C.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function f_(i,e,t,n){let s={},r={},a=[],o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function c(b,S){let v=S.program;n.uniformBlockBinding(b,v)}function l(b,S){let v=s[b.id];v===void 0&&(x(b),v=u(b),s[b.id]=v,b.addEventListener("dispose",C));let M=S.program;n.updateUBOMapping(b,M);let m=e.render.frame;r[b.id]!==m&&(h(b),r[b.id]=m)}function u(b){let S=f();b.__bindingPointIndex=S;let v=i.createBuffer(),M=b.__size,m=b.usage;return i.bindBuffer(i.UNIFORM_BUFFER,v),i.bufferData(i.UNIFORM_BUFFER,M,m),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,S,v),v}function f(){for(let b=0;b<o;b++)if(a.indexOf(b)===-1)return a.push(b),b;return Je("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(b){let S=s[b.id],v=b.uniforms,M=b.__cache;i.bindBuffer(i.UNIFORM_BUFFER,S);for(let m=0,T=v.length;m<T;m++){let P=v[m];if(Array.isArray(P))for(let I=0,L=P.length;I<L;I++)d(P[I],m,I,M);else d(P,m,0,M)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function d(b,S,v,M){if(y(b,S,v,M)===!0){let m=b.__offset,T=b.value;if(Array.isArray(T)){let P=0;for(let I=0;I<T.length;I++){let L=T[I],N=p(L);_(L,b.__data,P),typeof L!="number"&&typeof L!="boolean"&&!L.isMatrix3&&!ArrayBuffer.isView(L)&&(P+=N.storage/Float32Array.BYTES_PER_ELEMENT)}}else _(T,b.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,m,b.__data)}}function _(b,S,v){typeof b=="number"||typeof b=="boolean"?S[0]=b:b.isMatrix3?(S[0]=b.elements[0],S[1]=b.elements[1],S[2]=b.elements[2],S[3]=0,S[4]=b.elements[3],S[5]=b.elements[4],S[6]=b.elements[5],S[7]=0,S[8]=b.elements[6],S[9]=b.elements[7],S[10]=b.elements[8],S[11]=0):ArrayBuffer.isView(b)?S.set(new b.constructor(b.buffer,b.byteOffset,S.length)):b.toArray(S,v)}function y(b,S,v,M){let m=b.value,T=S+"_"+v;if(M[T]===void 0)return typeof m=="number"||typeof m=="boolean"?M[T]=m:ArrayBuffer.isView(m)?M[T]=m.slice():M[T]=m.clone(),!0;{let P=M[T];if(typeof m=="number"||typeof m=="boolean"){if(P!==m)return M[T]=m,!0}else{if(ArrayBuffer.isView(m))return!0;if(P.equals(m)===!1)return P.copy(m),!0}}return!1}function x(b){let S=b.uniforms,v=0,M=16;for(let T=0,P=S.length;T<P;T++){let I=Array.isArray(S[T])?S[T]:[S[T]];for(let L=0,N=I.length;L<N;L++){let V=I[L],F=Array.isArray(V.value)?V.value:[V.value];for(let X=0,H=F.length;X<H;X++){let $=F[X],Q=p($),de=v%M,fe=de%Q.boundary,ge=de+fe;v+=fe,ge!==0&&M-ge<Q.storage&&(v+=M-ge),V.__data=new Float32Array(Q.storage/Float32Array.BYTES_PER_ELEMENT),V.__offset=v,v+=Q.storage}}}let m=v%M;return m>0&&(v+=M-m),b.__size=v,b.__cache={},this}function p(b){let S={boundary:0,storage:0};return typeof b=="number"||typeof b=="boolean"?(S.boundary=4,S.storage=4):b.isVector2?(S.boundary=8,S.storage=8):b.isVector3||b.isColor?(S.boundary=16,S.storage=12):b.isVector4?(S.boundary=16,S.storage=16):b.isMatrix3?(S.boundary=48,S.storage=48):b.isMatrix4?(S.boundary=64,S.storage=64):b.isTexture?qe("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(b)?(S.boundary=16,S.storage=b.byteLength):qe("WebGLRenderer: Unsupported uniform value type.",b),S}function C(b){let S=b.target;S.removeEventListener("dispose",C);let v=a.indexOf(S.__bindingPointIndex);a.splice(v,1),i.deleteBuffer(s[S.id]),delete s[S.id],delete r[S.id]}function w(){for(let b in s)i.deleteBuffer(s[b]);a=[],s={},r={}}return{bind:c,update:l,dispose:w}}var p_=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Wn=null;function m_(){return Wn===null&&(Wn=new qi(p_,16,16,Ii,Gn),Wn.name="DFG_LUT",Wn.minFilter=zt,Wn.magFilter=zt,Wn.wrapS=Fn,Wn.wrapT=Fn,Wn.generateMipmaps=!1,Wn.needsUpdate=!0),Wn}var qn=class{constructor(e={}){let{canvas:t=Iu(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:f=!1,reversedDepthBuffer:h=!1,outputBufferType:d=Qt}=e;this.isWebGLRenderer=!0;let _;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");_=n.getContextAttributes().alpha}else _=a;let y=d,x=new Set([ho,co,lo]),p=new Set([Qt,Ln,Cs,Ps,ao,oo]),C=new Uint32Array(4),w=new Int32Array(4),b=new R,S=null,v=null,M=[],m=[],T=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Rn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let P=this,I=!1,L=null,N=null,V=null,F=null;this._outputColorSpace=on;let X=0,H=0,$=null,Q=-1,de=null,fe=new wt,ge=new wt,ze=null,he=new et(0),Ie=0,q=t.width,O=t.height,z=1,j=null,se=null,oe=new wt(0,0,q,O),ue=new wt(0,0,q,O),me=!1,pe=new Si,_e=!1,ee=!1,Me=new ft,We=new R,Ke=new wt,Xe={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},it=!1;function ut(){return $===null?z:1}let k=n;function Tt(E,G){return t.getContext(E,G)}try{let E={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:u,failIfMajorPerformanceCaveat:f};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"185"}`),t.addEventListener("webglcontextlost",ht,!1),t.addEventListener("webglcontextrestored",tt,!1),t.addEventListener("webglcontextcreationerror",un,!1),k===null){let G="webgl2";if(k=Tt(G,E),k===null)throw Tt(G)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}}catch(E){throw Je("WebGLRenderer: "+E.message),E}let lt,A,g,D,U,W,ie,ce,K,te,ve,Ne,ye,Se,Ve,Ye,$e,B,be,ne,xe,Ee,ae;function Oe(){lt=new M0(k),lt.init(),xe=new l_(k,lt),A=new p0(k,lt,e,xe),g=new a_(k,lt),A.reversedDepthBuffer&&h&&g.buffers.depth.setReversed(!0),N=k.createFramebuffer(),V=k.createFramebuffer(),F=k.createFramebuffer(),D=new T0(k),U=new qx,W=new o_(k,lt,g,U,A,xe,D),ie=new b0(P),ce=new Pp(k),Ee=new d0(k,ce),K=new S0(k,ce,D,Ee),te=new A0(k,K,ce,Ee,D),B=new E0(k,A,W),Ve=new m0(U),ve=new Xx(P,ie,lt,A,Ee,Ve),Ne=new d_(P,U),ye=new Zx,Se=new e_(lt),$e=new u0(P,ie,g,te,_,c),Ye=new r_(P,te,A),ae=new f_(k,D,A,g),be=new f0(k,lt,D),ne=new w0(k,lt,D),D.programs=ve.programs,P.capabilities=A,P.extensions=lt,P.properties=U,P.renderLists=ye,P.shadowMap=Ye,P.state=g,P.info=D}Oe(),y!==Qt&&(T=new P0(y,t.width,t.height,o,s,r));let De=new Vc(P,k);this.xr=De,this.getContext=function(){return k},this.getContextAttributes=function(){return k.getContextAttributes()},this.forceContextLoss=function(){let E=lt.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){let E=lt.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return z},this.setPixelRatio=function(E){E!==void 0&&(z=E,this.setSize(q,O,!1))},this.getSize=function(E){return E.set(q,O)},this.setSize=function(E,G,J=!0){if(De.isPresenting){qe("WebGLRenderer: Can't change size while VR device is presenting.");return}q=E,O=G,t.width=Math.floor(E*z),t.height=Math.floor(G*z),J===!0&&(t.style.width=E+"px",t.style.height=G+"px"),T!==null&&T.setSize(t.width,t.height),this.setViewport(0,0,E,G)},this.getDrawingBufferSize=function(E){return E.set(q*z,O*z).floor()},this.setDrawingBufferSize=function(E,G,J){q=E,O=G,z=J,t.width=Math.floor(E*J),t.height=Math.floor(G*J),this.setViewport(0,0,E,G)},this.setEffects=function(E){if(y===Qt){Je("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(E){for(let G=0;G<E.length;G++)if(E[G].isOutputPass===!0){qe("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}T.setEffects(E||[])},this.getCurrentViewport=function(E){return E.copy(fe)},this.getViewport=function(E){return E.copy(oe)},this.setViewport=function(E,G,J,Y){E.isVector4?oe.set(E.x,E.y,E.z,E.w):oe.set(E,G,J,Y),g.viewport(fe.copy(oe).multiplyScalar(z).round())},this.getScissor=function(E){return E.copy(ue)},this.setScissor=function(E,G,J,Y){E.isVector4?ue.set(E.x,E.y,E.z,E.w):ue.set(E,G,J,Y),g.scissor(ge.copy(ue).multiplyScalar(z).round())},this.getScissorTest=function(){return me},this.setScissorTest=function(E){g.setScissorTest(me=E)},this.setOpaqueSort=function(E){j=E},this.setTransparentSort=function(E){se=E},this.getClearColor=function(E){return E.copy($e.getClearColor())},this.setClearColor=function(){$e.setClearColor(...arguments)},this.getClearAlpha=function(){return $e.getClearAlpha()},this.setClearAlpha=function(){$e.setClearAlpha(...arguments)},this.clear=function(E=!0,G=!0,J=!0){let Y=0;if(E){let Z=!1;if($!==null){let Pe=$.texture.format;Z=x.has(Pe)}if(Z){let Pe=$.texture.type,Be=p.has(Pe),Ae=$e.getClearColor(),ke=$e.getClearAlpha(),He=Ae.r,nt=Ae.g,ot=Ae.b;Be?(C[0]=He,C[1]=nt,C[2]=ot,C[3]=ke,k.clearBufferuiv(k.COLOR,0,C)):(w[0]=He,w[1]=nt,w[2]=ot,w[3]=ke,k.clearBufferiv(k.COLOR,0,w))}else Y|=k.COLOR_BUFFER_BIT}G&&(Y|=k.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),J&&(Y|=k.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),Y!==0&&k.clear(Y)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(E){E.setRenderer(this),L=E},this.dispose=function(){t.removeEventListener("webglcontextlost",ht,!1),t.removeEventListener("webglcontextrestored",tt,!1),t.removeEventListener("webglcontextcreationerror",un,!1),$e.dispose(),ye.dispose(),Se.dispose(),U.dispose(),ie.dispose(),te.dispose(),Ee.dispose(),ae.dispose(),ve.dispose(),De.dispose(),De.removeEventListener("sessionstart",ih),De.removeEventListener("sessionend",sh),Ni.stop()};function ht(E){E.preventDefault(),er("WebGLRenderer: Context Lost."),I=!0}function tt(){er("WebGLRenderer: Context Restored."),I=!1;let E=D.autoReset,G=Ye.enabled,J=Ye.autoUpdate,Y=Ye.needsUpdate,Z=Ye.type;Oe(),D.autoReset=E,Ye.enabled=G,Ye.autoUpdate=J,Ye.needsUpdate=Y,Ye.type=Z}function un(E){Je("WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function dn(E){let G=E.target;G.removeEventListener("dispose",dn),of(G)}function of(E){lf(E),U.remove(E)}function lf(E){let G=U.get(E).programs;G!==void 0&&(G.forEach(function(J){ve.releaseProgram(J)}),E.isShaderMaterial&&ve.releaseShaderCache(E))}this.renderBufferDirect=function(E,G,J,Y,Z,Pe){G===null&&(G=Xe);let Be=Z.isMesh&&Z.matrixWorld.determinantAffine()<0,Ae=uf(E,G,J,Y,Z);g.setMaterial(Y,Be);let ke=J.index,He=1;if(Y.wireframe===!0){if(ke=K.getWireframeAttribute(J),ke===void 0)return;He=2}let nt=J.drawRange,ot=J.attributes.position,Ge=nt.start*He,xt=(nt.start+nt.count)*He;Pe!==null&&(Ge=Math.max(Ge,Pe.start*He),xt=Math.min(xt,(Pe.start+Pe.count)*He)),ke!==null?(Ge=Math.max(Ge,0),xt=Math.min(xt,ke.count)):ot!=null&&(Ge=Math.max(Ge,0),xt=Math.min(xt,ot.count));let At=xt-Ge;if(At<0||At===1/0)return;Ee.setup(Z,Y,Ae,J,ke);let Et,vt=be;if(ke!==null&&(Et=ce.get(ke),vt=ne,vt.setIndex(Et)),Z.isMesh)Y.wireframe===!0?(g.setLineWidth(Y.wireframeLinewidth*ut()),vt.setMode(k.LINES)):vt.setMode(k.TRIANGLES);else if(Z.isLine){let Vt=Y.linewidth;Vt===void 0&&(Vt=1),g.setLineWidth(Vt*ut()),Z.isLineSegments?vt.setMode(k.LINES):Z.isLineLoop?vt.setMode(k.LINE_LOOP):vt.setMode(k.LINE_STRIP)}else Z.isPoints?vt.setMode(k.POINTS):Z.isSprite&&vt.setMode(k.TRIANGLES);if(Z.isBatchedMesh)if(lt.get("WEBGL_multi_draw"))vt.renderMultiDraw(Z._multiDrawStarts,Z._multiDrawCounts,Z._multiDrawCount);else{let Vt=Z._multiDrawStarts,Ue=Z._multiDrawCounts,nn=Z._multiDrawCount,dt=ke?ce.get(ke).bytesPerElement:1,fn=U.get(Y).currentProgram.getUniforms();for(let Dn=0;Dn<nn;Dn++)fn.setValue(k,"_gl_DrawID",Dn),vt.render(Vt[Dn]/dt,Ue[Dn])}else if(Z.isInstancedMesh)vt.renderInstances(Ge,At,Z.count);else if(J.isInstancedBufferGeometry){let Vt=J._maxInstanceCount!==void 0?J._maxInstanceCount:1/0,Ue=Math.min(J.instanceCount,Vt);vt.renderInstances(Ge,At,Ue)}else vt.render(Ge,At)};function nh(E,G,J){E.transparent===!0&&E.side===vn&&E.forceSinglePass===!1?(E.side=Jt,E.needsUpdate=!0,kr(E,G,J),E.side=ni,E.needsUpdate=!0,kr(E,G,J),E.side=vn):kr(E,G,J)}this.compile=function(E,G,J=null){J===null&&(J=E),v=Se.get(J),v.init(G),m.push(v),J.traverseVisible(function(Z){Z.isLight&&Z.layers.test(G.layers)&&(v.pushLight(Z),Z.castShadow&&v.pushShadow(Z))}),E!==J&&E.traverseVisible(function(Z){Z.isLight&&Z.layers.test(G.layers)&&(v.pushLight(Z),Z.castShadow&&v.pushShadow(Z))}),v.setupLights();let Y=new Set;return E.traverse(function(Z){if(!(Z.isMesh||Z.isPoints||Z.isLine||Z.isSprite))return;let Pe=Z.material;if(Pe)if(Array.isArray(Pe))for(let Be=0;Be<Pe.length;Be++){let Ae=Pe[Be];nh(Ae,J,Z),Y.add(Ae)}else nh(Pe,J,Z),Y.add(Pe)}),v=m.pop(),Y},this.compileAsync=function(E,G,J=null){let Y=this.compile(E,G,J);return new Promise(Z=>{function Pe(){if(Y.forEach(function(Be){U.get(Be).currentProgram.isReady()&&Y.delete(Be)}),Y.size===0){Z(E);return}setTimeout(Pe,10)}lt.get("KHR_parallel_shader_compile")!==null?Pe():setTimeout(Pe,10)})};let ll=null;function cf(E){ll&&ll(E)}function ih(){Ni.stop()}function sh(){Ni.start()}let Ni=new rd;Ni.setAnimationLoop(cf),typeof self<"u"&&Ni.setContext(self),this.setAnimationLoop=function(E){ll=E,De.setAnimationLoop(E),E===null?Ni.stop():Ni.start()},De.addEventListener("sessionstart",ih),De.addEventListener("sessionend",sh),this.render=function(E,G){if(G!==void 0&&G.isCamera!==!0){Je("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(I===!0)return;L!==null&&L.renderStart(E,G);let J=De.enabled===!0&&De.isPresenting===!0,Y=T!==null&&($===null||J)&&T.begin(P,$);if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),G.parent===null&&G.matrixWorldAutoUpdate===!0&&G.updateMatrixWorld(),De.enabled===!0&&De.isPresenting===!0&&(T===null||T.isCompositing()===!1)&&(De.cameraAutoUpdate===!0&&De.updateCamera(G),G=De.getCamera()),E.isScene===!0&&E.onBeforeRender(P,E,G,$),v=Se.get(E,m.length),v.init(G),v.state.textureUnits=W.getTextureUnits(),m.push(v),Me.multiplyMatrices(G.projectionMatrix,G.matrixWorldInverse),pe.setFromProjectionMatrix(Me,An,G.reversedDepth),ee=this.localClippingEnabled,_e=Ve.init(this.clippingPlanes,ee),S=ye.get(E,M.length),S.init(),M.push(S),De.enabled===!0&&De.isPresenting===!0){let Be=P.xr.getDepthSensingMesh();Be!==null&&cl(Be,G,-1/0,P.sortObjects)}cl(E,G,0,P.sortObjects),S.finish(),P.sortObjects===!0&&S.sort(j,se,G.reversedDepth),it=De.enabled===!1||De.isPresenting===!1||De.hasDepthSensing()===!1,it&&$e.addToRenderList(S,E),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),_e===!0&&Ve.beginShadows();let Z=v.state.shadowsArray;if(Ye.render(Z,E,G),_e===!0&&Ve.endShadows(),(Y&&T.hasRenderPass())===!1){let Be=S.opaque,Ae=S.transmissive;if(v.setupLights(),G.isArrayCamera){let ke=G.cameras;if(Ae.length>0)for(let He=0,nt=ke.length;He<nt;He++){let ot=ke[He];ah(Be,Ae,E,ot)}it&&$e.render(E);for(let He=0,nt=ke.length;He<nt;He++){let ot=ke[He];rh(S,E,ot,ot.viewport)}}else Ae.length>0&&ah(Be,Ae,E,G),it&&$e.render(E),rh(S,E,G)}$!==null&&H===0&&(W.updateMultisampleRenderTarget($),W.updateRenderTargetMipmap($)),Y&&T.end(P),E.isScene===!0&&E.onAfterRender(P,E,G),Ee.resetDefaultState(),Q=-1,de=null,m.pop(),m.length>0?(v=m[m.length-1],W.setTextureUnits(v.state.textureUnits),_e===!0&&Ve.setGlobalState(P.clippingPlanes,v.state.camera)):v=null,M.pop(),M.length>0?S=M[M.length-1]:S=null,L!==null&&L.renderEnd()};function cl(E,G,J,Y){if(E.visible===!1)return;if(E.layers.test(G.layers)){if(E.isGroup)J=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(G);else if(E.isLightProbeGrid)v.pushLightProbeGrid(E);else if(E.isLight)v.pushLight(E),E.castShadow&&v.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||pe.intersectsSprite(E)){Y&&Ke.setFromMatrixPosition(E.matrixWorld).applyMatrix4(Me);let Be=te.update(E),Ae=E.material;Ae.visible&&S.push(E,Be,Ae,J,Ke.z,null)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||pe.intersectsObject(E))){let Be=te.update(E),Ae=E.material;if(Y&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),Ke.copy(E.boundingSphere.center)):(Be.boundingSphere===null&&Be.computeBoundingSphere(),Ke.copy(Be.boundingSphere.center)),Ke.applyMatrix4(E.matrixWorld).applyMatrix4(Me)),Array.isArray(Ae)){let ke=Be.groups;for(let He=0,nt=ke.length;He<nt;He++){let ot=ke[He],Ge=Ae[ot.materialIndex];Ge&&Ge.visible&&S.push(E,Be,Ge,J,Ke.z,ot)}}else Ae.visible&&S.push(E,Be,Ae,J,Ke.z,null)}}let Pe=E.children;for(let Be=0,Ae=Pe.length;Be<Ae;Be++)cl(Pe[Be],G,J,Y)}function rh(E,G,J,Y){let{opaque:Z,transmissive:Pe,transparent:Be}=E;v.setupLightsView(J),_e===!0&&Ve.setGlobalState(P.clippingPlanes,J),Y&&g.viewport(fe.copy(Y)),Z.length>0&&Br(Z,G,J),Pe.length>0&&Br(Pe,G,J),Be.length>0&&Br(Be,G,J),g.buffers.depth.setTest(!0),g.buffers.depth.setMask(!0),g.buffers.color.setMask(!0),g.setPolygonOffset(!1)}function ah(E,G,J,Y){if((J.isScene===!0?J.overrideMaterial:null)!==null)return;if(v.state.transmissionRenderTarget[Y.id]===void 0){let Ge=lt.has("EXT_color_buffer_half_float")||lt.has("EXT_color_buffer_float");v.state.transmissionRenderTarget[Y.id]=new Zt(1,1,{generateMipmaps:!0,type:Ge?Gn:Qt,minFilter:Ci,samples:Math.max(4,A.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:ct.workingColorSpace})}let Pe=v.state.transmissionRenderTarget[Y.id],Be=Y.viewport||fe;Pe.setSize(Be.z*P.transmissionResolutionScale,Be.w*P.transmissionResolutionScale);let Ae=P.getRenderTarget(),ke=P.getActiveCubeFace(),He=P.getActiveMipmapLevel();P.setRenderTarget(Pe),P.getClearColor(he),Ie=P.getClearAlpha(),Ie<1&&P.setClearColor(16777215,.5),P.clear(),it&&$e.render(J);let nt=P.toneMapping;P.toneMapping=Rn;let ot=Y.viewport;if(Y.viewport!==void 0&&(Y.viewport=void 0),v.setupLightsView(Y),_e===!0&&Ve.setGlobalState(P.clippingPlanes,Y),Br(E,J,Y),W.updateMultisampleRenderTarget(Pe),W.updateRenderTargetMipmap(Pe),lt.has("WEBGL_multisampled_render_to_texture")===!1){let Ge=!1;for(let xt=0,At=G.length;xt<At;xt++){let Et=G[xt],{object:vt,geometry:Vt,material:Ue,group:nn}=Et;if(Ue.side===vn&&vt.layers.test(Y.layers)){let dt=Ue.side;Ue.side=Jt,Ue.needsUpdate=!0,oh(vt,J,Y,Vt,Ue,nn),Ue.side=dt,Ue.needsUpdate=!0,Ge=!0}}Ge===!0&&(W.updateMultisampleRenderTarget(Pe),W.updateRenderTargetMipmap(Pe))}P.setRenderTarget(Ae,ke,He),P.setClearColor(he,Ie),ot!==void 0&&(Y.viewport=ot),P.toneMapping=nt}function Br(E,G,J){let Y=G.isScene===!0?G.overrideMaterial:null;for(let Z=0,Pe=E.length;Z<Pe;Z++){let Be=E[Z],{object:Ae,geometry:ke,group:He}=Be,nt=Be.material;nt.allowOverride===!0&&Y!==null&&(nt=Y),Ae.layers.test(J.layers)&&oh(Ae,G,J,ke,nt,He)}}function oh(E,G,J,Y,Z,Pe){E.onBeforeRender(P,G,J,Y,Z,Pe),E.modelViewMatrix.multiplyMatrices(J.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),Z.onBeforeRender(P,G,J,Y,E,Pe),Z.transparent===!0&&Z.side===vn&&Z.forceSinglePass===!1?(Z.side=Jt,Z.needsUpdate=!0,P.renderBufferDirect(J,G,Y,Z,E,Pe),Z.side=ni,Z.needsUpdate=!0,P.renderBufferDirect(J,G,Y,Z,E,Pe),Z.side=vn):P.renderBufferDirect(J,G,Y,Z,E,Pe),E.onAfterRender(P,G,J,Y,Z,Pe)}function kr(E,G,J){G.isScene!==!0&&(G=Xe);let Y=U.get(E),Z=v.state.lights,Pe=v.state.shadowsArray,Be=Z.state.version,Ae=ve.getParameters(E,Z.state,Pe,G,J,v.state.lightProbeGridArray),ke=ve.getProgramCacheKey(Ae),He=Y.programs;Y.environment=E.isMeshStandardMaterial||E.isMeshLambertMaterial||E.isMeshPhongMaterial?G.environment:null,Y.fog=G.fog;let nt=E.isMeshStandardMaterial||E.isMeshLambertMaterial&&!E.envMap||E.isMeshPhongMaterial&&!E.envMap;Y.envMap=ie.get(E.envMap||Y.environment,nt),Y.envMapRotation=Y.environment!==null&&E.envMap===null?G.environmentRotation:E.envMapRotation,He===void 0&&(E.addEventListener("dispose",dn),He=new Map,Y.programs=He);let ot=He.get(ke);if(ot!==void 0){if(Y.currentProgram===ot&&Y.lightsStateVersion===Be)return ch(E,Ae),ot}else Ae.uniforms=ve.getUniforms(E),L!==null&&E.isNodeMaterial&&L.build(E,J,Ae),E.onBeforeCompile(Ae,P),ot=ve.acquireProgram(Ae,ke),He.set(ke,ot),Y.uniforms=Ae.uniforms;let Ge=Y.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(Ge.clippingPlanes=Ve.uniform),ch(E,Ae),Y.needsLights=ff(E),Y.lightsStateVersion=Be,Y.needsLights&&(Ge.ambientLightColor.value=Z.state.ambient,Ge.lightProbe.value=Z.state.probe,Ge.directionalLights.value=Z.state.directional,Ge.directionalLightShadows.value=Z.state.directionalShadow,Ge.spotLights.value=Z.state.spot,Ge.spotLightShadows.value=Z.state.spotShadow,Ge.rectAreaLights.value=Z.state.rectArea,Ge.ltc_1.value=Z.state.rectAreaLTC1,Ge.ltc_2.value=Z.state.rectAreaLTC2,Ge.pointLights.value=Z.state.point,Ge.pointLightShadows.value=Z.state.pointShadow,Ge.hemisphereLights.value=Z.state.hemi,Ge.directionalShadowMatrix.value=Z.state.directionalShadowMatrix,Ge.spotLightMatrix.value=Z.state.spotLightMatrix,Ge.spotLightMap.value=Z.state.spotLightMap,Ge.pointShadowMatrix.value=Z.state.pointShadowMatrix),Y.lightProbeGrid=v.state.lightProbeGridArray.length>0,Y.currentProgram=ot,Y.uniformsList=null,ot}function lh(E){if(E.uniformsList===null){let G=E.currentProgram.getUniforms();E.uniformsList=Ls.seqWithValue(G.seq,E.uniforms)}return E.uniformsList}function ch(E,G){let J=U.get(E);J.outputColorSpace=G.outputColorSpace,J.batching=G.batching,J.batchingColor=G.batchingColor,J.instancing=G.instancing,J.instancingColor=G.instancingColor,J.instancingMorph=G.instancingMorph,J.skinning=G.skinning,J.morphTargets=G.morphTargets,J.morphNormals=G.morphNormals,J.morphColors=G.morphColors,J.morphTargetsCount=G.morphTargetsCount,J.numClippingPlanes=G.numClippingPlanes,J.numIntersection=G.numClipIntersection,J.vertexAlphas=G.vertexAlphas,J.vertexTangents=G.vertexTangents,J.toneMapping=G.toneMapping}function hf(E,G){if(E.length===0)return null;if(E.length===1)return E[0].texture!==null?E[0]:null;b.setFromMatrixPosition(G.matrixWorld);for(let J=0,Y=E.length;J<Y;J++){let Z=E[J];if(Z.texture!==null&&Z.boundingBox.containsPoint(b))return Z}return null}function uf(E,G,J,Y,Z){G.isScene!==!0&&(G=Xe),W.resetTextureUnits();let Pe=G.fog,Be=Y.isMeshStandardMaterial||Y.isMeshLambertMaterial||Y.isMeshPhongMaterial?G.environment:null,Ae=$===null?P.outputColorSpace:$.isXRRenderTarget===!0?$.texture.colorSpace:ct.workingColorSpace,ke=Y.isMeshStandardMaterial||Y.isMeshLambertMaterial&&!Y.envMap||Y.isMeshPhongMaterial&&!Y.envMap,He=ie.get(Y.envMap||Be,ke),nt=Y.vertexColors===!0&&!!J.attributes.color&&J.attributes.color.itemSize===4,ot=!!J.attributes.tangent&&(!!Y.normalMap||Y.anisotropy>0),Ge=!!J.morphAttributes.position,xt=!!J.morphAttributes.normal,At=!!J.morphAttributes.color,Et=Rn;Y.toneMapped&&($===null||$.isXRRenderTarget===!0)&&(Et=P.toneMapping);let vt=J.morphAttributes.position||J.morphAttributes.normal||J.morphAttributes.color,Vt=vt!==void 0?vt.length:0,Ue=U.get(Y),nn=v.state.lights;if(_e===!0&&(ee===!0||E!==de)){let bt=E===de&&Y.id===Q;Ve.setState(Y,E,bt)}let dt=!1;Y.version===Ue.__version?(Ue.needsLights&&Ue.lightsStateVersion!==nn.state.version||Ue.outputColorSpace!==Ae||Z.isBatchedMesh&&Ue.batching===!1||!Z.isBatchedMesh&&Ue.batching===!0||Z.isBatchedMesh&&Ue.batchingColor===!0&&Z.colorTexture===null||Z.isBatchedMesh&&Ue.batchingColor===!1&&Z.colorTexture!==null||Z.isInstancedMesh&&Ue.instancing===!1||!Z.isInstancedMesh&&Ue.instancing===!0||Z.isSkinnedMesh&&Ue.skinning===!1||!Z.isSkinnedMesh&&Ue.skinning===!0||Z.isInstancedMesh&&Ue.instancingColor===!0&&Z.instanceColor===null||Z.isInstancedMesh&&Ue.instancingColor===!1&&Z.instanceColor!==null||Z.isInstancedMesh&&Ue.instancingMorph===!0&&Z.morphTexture===null||Z.isInstancedMesh&&Ue.instancingMorph===!1&&Z.morphTexture!==null||Ue.envMap!==He||Y.fog===!0&&Ue.fog!==Pe||Ue.numClippingPlanes!==void 0&&(Ue.numClippingPlanes!==Ve.numPlanes||Ue.numIntersection!==Ve.numIntersection)||Ue.vertexAlphas!==nt||Ue.vertexTangents!==ot||Ue.morphTargets!==Ge||Ue.morphNormals!==xt||Ue.morphColors!==At||Ue.toneMapping!==Et||Ue.morphTargetsCount!==Vt||!!Ue.lightProbeGrid!=v.state.lightProbeGridArray.length>0)&&(dt=!0):(dt=!0,Ue.__version=Y.version);let fn=Ue.currentProgram;dt===!0&&(fn=kr(Y,G,Z),L&&Y.isNodeMaterial&&L.onUpdateProgram(Y,fn,Ue));let Dn=!1,di=!1,ts=!1,yt=fn.getUniforms(),Ct=Ue.uniforms;if(g.useProgram(fn.program)&&(Dn=!0,di=!0,ts=!0),Y.id!==Q&&(Q=Y.id,di=!0),Ue.needsLights){let bt=hf(v.state.lightProbeGridArray,Z);Ue.lightProbeGrid!==bt&&(Ue.lightProbeGrid=bt,di=!0)}if(Dn||de!==E){g.buffers.depth.getReversed()&&E.reversedDepth!==!0&&(E._reversedDepth=!0,E.updateProjectionMatrix()),yt.setValue(k,"projectionMatrix",E.projectionMatrix),yt.setValue(k,"viewMatrix",E.matrixWorldInverse);let pi=yt.map.cameraPosition;pi!==void 0&&pi.setValue(k,We.setFromMatrixPosition(E.matrixWorld)),A.logarithmicDepthBuffer&&yt.setValue(k,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(Y.isMeshPhongMaterial||Y.isMeshToonMaterial||Y.isMeshLambertMaterial||Y.isMeshBasicMaterial||Y.isMeshStandardMaterial||Y.isShaderMaterial)&&yt.setValue(k,"isOrthographic",E.isOrthographicCamera===!0),de!==E&&(de=E,di=!0,ts=!0)}if(Ue.needsLights&&(nn.state.directionalShadowMap.length>0&&yt.setValue(k,"directionalShadowMap",nn.state.directionalShadowMap,W),nn.state.spotShadowMap.length>0&&yt.setValue(k,"spotShadowMap",nn.state.spotShadowMap,W),nn.state.pointShadowMap.length>0&&yt.setValue(k,"pointShadowMap",nn.state.pointShadowMap,W)),Z.isSkinnedMesh){yt.setOptional(k,Z,"bindMatrix"),yt.setOptional(k,Z,"bindMatrixInverse");let bt=Z.skeleton;bt&&(bt.boneTexture===null&&bt.computeBoneTexture(),yt.setValue(k,"boneTexture",bt.boneTexture,W))}Z.isBatchedMesh&&(yt.setOptional(k,Z,"batchingTexture"),yt.setValue(k,"batchingTexture",Z._matricesTexture,W),yt.setOptional(k,Z,"batchingIdTexture"),yt.setValue(k,"batchingIdTexture",Z._indirectTexture,W),yt.setOptional(k,Z,"batchingColorTexture"),Z._colorsTexture!==null&&yt.setValue(k,"batchingColorTexture",Z._colorsTexture,W));let fi=J.morphAttributes;if((fi.position!==void 0||fi.normal!==void 0||fi.color!==void 0)&&B.update(Z,J,fn),(di||Ue.receiveShadow!==Z.receiveShadow)&&(Ue.receiveShadow=Z.receiveShadow,yt.setValue(k,"receiveShadow",Z.receiveShadow)),(Y.isMeshStandardMaterial||Y.isMeshLambertMaterial||Y.isMeshPhongMaterial)&&Y.envMap===null&&G.environment!==null&&(Ct.envMapIntensity.value=G.environmentIntensity),Ct.dfgLUT!==void 0&&(Ct.dfgLUT.value=m_()),di){if(yt.setValue(k,"toneMappingExposure",P.toneMappingExposure),Ue.needsLights&&df(Ct,ts),Pe&&Y.fog===!0&&Ne.refreshFogUniforms(Ct,Pe),Ne.refreshMaterialUniforms(Ct,Y,z,O,v.state.transmissionRenderTarget[E.id]),Ue.needsLights&&Ue.lightProbeGrid){let bt=Ue.lightProbeGrid;Ct.probesSH.value=bt.texture,Ct.probesMin.value.copy(bt.boundingBox.min),Ct.probesMax.value.copy(bt.boundingBox.max),Ct.probesResolution.value.copy(bt.resolution)}Ls.upload(k,lh(Ue),Ct,W)}if(Y.isShaderMaterial&&Y.uniformsNeedUpdate===!0&&(Ls.upload(k,lh(Ue),Ct,W),Y.uniformsNeedUpdate=!1),Y.isSpriteMaterial&&yt.setValue(k,"center",Z.center),yt.setValue(k,"modelViewMatrix",Z.modelViewMatrix),yt.setValue(k,"normalMatrix",Z.normalMatrix),yt.setValue(k,"modelMatrix",Z.matrixWorld),Y.uniformsGroups!==void 0){let bt=Y.uniformsGroups;for(let pi=0,ns=bt.length;pi<ns;pi++){let hh=bt[pi];ae.update(hh,fn),ae.bind(hh,fn)}}return fn}function df(E,G){E.ambientLightColor.needsUpdate=G,E.lightProbe.needsUpdate=G,E.directionalLights.needsUpdate=G,E.directionalLightShadows.needsUpdate=G,E.pointLights.needsUpdate=G,E.pointLightShadows.needsUpdate=G,E.spotLights.needsUpdate=G,E.spotLightShadows.needsUpdate=G,E.rectAreaLights.needsUpdate=G,E.hemisphereLights.needsUpdate=G}function ff(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return X},this.getActiveMipmapLevel=function(){return H},this.getRenderTarget=function(){return $},this.setRenderTargetTextures=function(E,G,J){let Y=U.get(E);Y.__autoAllocateDepthBuffer=E.resolveDepthBuffer===!1,Y.__autoAllocateDepthBuffer===!1&&(Y.__useRenderToTexture=!1),U.get(E.texture).__webglTexture=G,U.get(E.depthTexture).__webglTexture=Y.__autoAllocateDepthBuffer?void 0:J,Y.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(E,G){let J=U.get(E);J.__webglFramebuffer=G,J.__useDefaultFramebuffer=G===void 0},this.setRenderTarget=function(E,G=0,J=0){$=E,X=G,H=J;let Y=null,Z=!1,Pe=!1;if(E){let Ae=U.get(E);if(Ae.__useDefaultFramebuffer!==void 0){g.bindFramebuffer(k.FRAMEBUFFER,Ae.__webglFramebuffer),fe.copy(E.viewport),ge.copy(E.scissor),ze=E.scissorTest,g.viewport(fe),g.scissor(ge),g.setScissorTest(ze),Q=-1;return}else if(Ae.__webglFramebuffer===void 0)W.setupRenderTarget(E);else if(Ae.__hasExternalTextures)W.rebindTextures(E,U.get(E.texture).__webglTexture,U.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){let nt=E.depthTexture;if(Ae.__boundDepthTexture!==nt){if(nt!==null&&U.has(nt)&&(E.width!==nt.image.width||E.height!==nt.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");W.setupDepthRenderbuffer(E)}}let ke=E.texture;(ke.isData3DTexture||ke.isDataArrayTexture||ke.isCompressedArrayTexture)&&(Pe=!0);let He=U.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(He[G])?Y=He[G][J]:Y=He[G],Z=!0):E.samples>0&&W.useMultisampledRTT(E)===!1?Y=U.get(E).__webglMultisampledFramebuffer:Array.isArray(He)?Y=He[J]:Y=He,fe.copy(E.viewport),ge.copy(E.scissor),ze=E.scissorTest}else fe.copy(oe).multiplyScalar(z).floor(),ge.copy(ue).multiplyScalar(z).floor(),ze=me;if(J!==0&&(Y=N),g.bindFramebuffer(k.FRAMEBUFFER,Y)&&g.drawBuffers(E,Y),g.viewport(fe),g.scissor(ge),g.setScissorTest(ze),Z){let Ae=U.get(E.texture);k.framebufferTexture2D(k.FRAMEBUFFER,k.COLOR_ATTACHMENT0,k.TEXTURE_CUBE_MAP_POSITIVE_X+G,Ae.__webglTexture,J)}else if(Pe){let Ae=G;for(let ke=0;ke<E.textures.length;ke++){let He=U.get(E.textures[ke]);k.framebufferTextureLayer(k.FRAMEBUFFER,k.COLOR_ATTACHMENT0+ke,He.__webglTexture,J,Ae)}}else if(E!==null&&J!==0){let Ae=U.get(E.texture);k.framebufferTexture2D(k.FRAMEBUFFER,k.COLOR_ATTACHMENT0,k.TEXTURE_2D,Ae.__webglTexture,J)}Q=-1},this.readRenderTargetPixels=function(E,G,J,Y,Z,Pe,Be,Ae=0){if(!(E&&E.isWebGLRenderTarget)){Je("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ke=U.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&Be!==void 0&&(ke=ke[Be]),ke){g.bindFramebuffer(k.FRAMEBUFFER,ke);try{let He=E.textures[Ae],nt=He.format,ot=He.type;if(E.textures.length>1&&k.readBuffer(k.COLOR_ATTACHMENT0+Ae),!A.textureFormatReadable(nt)){Je("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!A.textureTypeReadable(ot)){Je("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}G>=0&&G<=E.width-Y&&J>=0&&J<=E.height-Z&&k.readPixels(G,J,Y,Z,xe.convert(nt),xe.convert(ot),Pe)}finally{let He=$!==null?U.get($).__webglFramebuffer:null;g.bindFramebuffer(k.FRAMEBUFFER,He)}}},this.readRenderTargetPixelsAsync=async function(E,G,J,Y,Z,Pe,Be,Ae=0){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let ke=U.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&Be!==void 0&&(ke=ke[Be]),ke)if(G>=0&&G<=E.width-Y&&J>=0&&J<=E.height-Z){g.bindFramebuffer(k.FRAMEBUFFER,ke);let He=E.textures[Ae],nt=He.format,ot=He.type;if(E.textures.length>1&&k.readBuffer(k.COLOR_ATTACHMENT0+Ae),!A.textureFormatReadable(nt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!A.textureTypeReadable(ot))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Ge=k.createBuffer();k.bindBuffer(k.PIXEL_PACK_BUFFER,Ge),k.bufferData(k.PIXEL_PACK_BUFFER,Pe.byteLength,k.STREAM_READ),k.readPixels(G,J,Y,Z,xe.convert(nt),xe.convert(ot),0);let xt=$!==null?U.get($).__webglFramebuffer:null;g.bindFramebuffer(k.FRAMEBUFFER,xt);let At=k.fenceSync(k.SYNC_GPU_COMMANDS_COMPLETE,0);return k.flush(),await Lu(k,At,4),k.bindBuffer(k.PIXEL_PACK_BUFFER,Ge),k.getBufferSubData(k.PIXEL_PACK_BUFFER,0,Pe),k.deleteBuffer(Ge),k.deleteSync(At),Pe}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(E,G=null,J=0){let Y=Math.pow(2,-J),Z=Math.floor(E.image.width*Y),Pe=Math.floor(E.image.height*Y),Be=G!==null?G.x:0,Ae=G!==null?G.y:0;W.setTexture2D(E,0),k.copyTexSubImage2D(k.TEXTURE_2D,J,0,0,Be,Ae,Z,Pe),g.unbindTexture()},this.copyTextureToTexture=function(E,G,J=null,Y=null,Z=0,Pe=0){let Be,Ae,ke,He,nt,ot,Ge,xt,At,Et=E.isCompressedTexture?E.mipmaps[Pe]:E.image;if(J!==null)Be=J.max.x-J.min.x,Ae=J.max.y-J.min.y,ke=J.isBox3?J.max.z-J.min.z:1,He=J.min.x,nt=J.min.y,ot=J.isBox3?J.min.z:0;else{let Ct=Math.pow(2,-Z);Be=Math.floor(Et.width*Ct),Ae=Math.floor(Et.height*Ct),E.isDataArrayTexture?ke=Et.depth:E.isData3DTexture?ke=Math.floor(Et.depth*Ct):ke=1,He=0,nt=0,ot=0}Y!==null?(Ge=Y.x,xt=Y.y,At=Y.z):(Ge=0,xt=0,At=0);let vt=xe.convert(G.format),Vt=xe.convert(G.type),Ue;G.isData3DTexture?(W.setTexture3D(G,0),Ue=k.TEXTURE_3D):G.isDataArrayTexture||G.isCompressedArrayTexture?(W.setTexture2DArray(G,0),Ue=k.TEXTURE_2D_ARRAY):(W.setTexture2D(G,0),Ue=k.TEXTURE_2D),g.activeTexture(k.TEXTURE0),g.pixelStorei(k.UNPACK_FLIP_Y_WEBGL,G.flipY),g.pixelStorei(k.UNPACK_PREMULTIPLY_ALPHA_WEBGL,G.premultiplyAlpha),g.pixelStorei(k.UNPACK_ALIGNMENT,G.unpackAlignment);let nn=g.getParameter(k.UNPACK_ROW_LENGTH),dt=g.getParameter(k.UNPACK_IMAGE_HEIGHT),fn=g.getParameter(k.UNPACK_SKIP_PIXELS),Dn=g.getParameter(k.UNPACK_SKIP_ROWS),di=g.getParameter(k.UNPACK_SKIP_IMAGES);g.pixelStorei(k.UNPACK_ROW_LENGTH,Et.width),g.pixelStorei(k.UNPACK_IMAGE_HEIGHT,Et.height),g.pixelStorei(k.UNPACK_SKIP_PIXELS,He),g.pixelStorei(k.UNPACK_SKIP_ROWS,nt),g.pixelStorei(k.UNPACK_SKIP_IMAGES,ot);let ts=E.isDataArrayTexture||E.isData3DTexture,yt=G.isDataArrayTexture||G.isData3DTexture;if(E.isDepthTexture){let Ct=U.get(E),fi=U.get(G),bt=U.get(Ct.__renderTarget),pi=U.get(fi.__renderTarget);g.bindFramebuffer(k.READ_FRAMEBUFFER,bt.__webglFramebuffer),g.bindFramebuffer(k.DRAW_FRAMEBUFFER,pi.__webglFramebuffer);for(let ns=0;ns<ke;ns++)ts&&(k.framebufferTextureLayer(k.READ_FRAMEBUFFER,k.COLOR_ATTACHMENT0,U.get(E).__webglTexture,Z,ot+ns),k.framebufferTextureLayer(k.DRAW_FRAMEBUFFER,k.COLOR_ATTACHMENT0,U.get(G).__webglTexture,Pe,At+ns)),k.blitFramebuffer(He,nt,Be,Ae,Ge,xt,Be,Ae,k.DEPTH_BUFFER_BIT,k.NEAREST);g.bindFramebuffer(k.READ_FRAMEBUFFER,null),g.bindFramebuffer(k.DRAW_FRAMEBUFFER,null)}else if(Z!==0||E.isRenderTargetTexture||U.has(E)){let Ct=U.get(E),fi=U.get(G);g.bindFramebuffer(k.READ_FRAMEBUFFER,V),g.bindFramebuffer(k.DRAW_FRAMEBUFFER,F);for(let bt=0;bt<ke;bt++)ts?k.framebufferTextureLayer(k.READ_FRAMEBUFFER,k.COLOR_ATTACHMENT0,Ct.__webglTexture,Z,ot+bt):k.framebufferTexture2D(k.READ_FRAMEBUFFER,k.COLOR_ATTACHMENT0,k.TEXTURE_2D,Ct.__webglTexture,Z),yt?k.framebufferTextureLayer(k.DRAW_FRAMEBUFFER,k.COLOR_ATTACHMENT0,fi.__webglTexture,Pe,At+bt):k.framebufferTexture2D(k.DRAW_FRAMEBUFFER,k.COLOR_ATTACHMENT0,k.TEXTURE_2D,fi.__webglTexture,Pe),Z!==0?k.blitFramebuffer(He,nt,Be,Ae,Ge,xt,Be,Ae,k.COLOR_BUFFER_BIT,k.NEAREST):yt?k.copyTexSubImage3D(Ue,Pe,Ge,xt,At+bt,He,nt,Be,Ae):k.copyTexSubImage2D(Ue,Pe,Ge,xt,He,nt,Be,Ae);g.bindFramebuffer(k.READ_FRAMEBUFFER,null),g.bindFramebuffer(k.DRAW_FRAMEBUFFER,null)}else yt?E.isDataTexture||E.isData3DTexture?k.texSubImage3D(Ue,Pe,Ge,xt,At,Be,Ae,ke,vt,Vt,Et.data):G.isCompressedArrayTexture?k.compressedTexSubImage3D(Ue,Pe,Ge,xt,At,Be,Ae,ke,vt,Et.data):k.texSubImage3D(Ue,Pe,Ge,xt,At,Be,Ae,ke,vt,Vt,Et):E.isDataTexture?k.texSubImage2D(k.TEXTURE_2D,Pe,Ge,xt,Be,Ae,vt,Vt,Et.data):E.isCompressedTexture?k.compressedTexSubImage2D(k.TEXTURE_2D,Pe,Ge,xt,Et.width,Et.height,vt,Et.data):k.texSubImage2D(k.TEXTURE_2D,Pe,Ge,xt,Be,Ae,vt,Vt,Et);g.pixelStorei(k.UNPACK_ROW_LENGTH,nn),g.pixelStorei(k.UNPACK_IMAGE_HEIGHT,dt),g.pixelStorei(k.UNPACK_SKIP_PIXELS,fn),g.pixelStorei(k.UNPACK_SKIP_ROWS,Dn),g.pixelStorei(k.UNPACK_SKIP_IMAGES,di),Pe===0&&G.generateMipmaps&&k.generateMipmap(Ue),g.unbindTexture()},this.initRenderTarget=function(E){U.get(E).__webglFramebuffer===void 0&&W.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?W.setTextureCube(E,0):E.isData3DTexture?W.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?W.setTexture2DArray(E,0):W.setTexture2D(E,0),g.unbindTexture()},this.resetState=function(){X=0,H=0,$=null,g.reset(),Ee.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return An}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=ct._getDrawingBufferColorSpace(e),t.unpackColorSpace=ct._getUnpackColorSpace()}};var dd={type:"change"},Gc={type:"start"},pd={type:"end"},Ko=new si,fd=new mn,g_=Math.cos(70*Ir.DEG2RAD),Ft=new R,en=2*Math.PI,_t={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},Hc=1e-6,Yn=class extends yr{constructor(e,t=null){super(e,t),this.state=_t.NONE,this.target=new R,this.cursor=new R,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Pn.ROTATE,MIDDLE:Pn.DOLLY,RIGHT:Pn.PAN},this.touches={ONE:In.ROTATE,TWO:In.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new R,this._lastQuaternion=new ln,this._lastTargetPosition=new R,this._quat=new ln().setFromUnitVectors(e.up,new R(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Es,this._sphericalDelta=new Es,this._scale=1,this._panOffset=new R,this._rotateStart=new Re,this._rotateEnd=new Re,this._rotateDelta=new Re,this._panStart=new Re,this._panEnd=new Re,this._panDelta=new Re,this._dollyStart=new Re,this._dollyEnd=new Re,this._dollyDelta=new Re,this._dollyDirection=new R,this._mouse=new Re,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=__.bind(this),this._onPointerDown=x_.bind(this),this._onPointerUp=v_.bind(this),this._onContextMenu=E_.bind(this),this._onMouseWheel=M_.bind(this),this._onKeyDown=S_.bind(this),this._onTouchStart=w_.bind(this),this._onTouchMove=T_.bind(this),this._onMouseDown=y_.bind(this),this._onMouseMove=b_.bind(this),this._interceptControlDown=A_.bind(this),this._interceptControlUp=C_.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(e){this._cursorStyle=e,e==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction=""}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(dd),this.update(),this.state=_t.NONE}pan(e,t){this._pan(e,t),this.update()}dollyIn(e){this._dollyIn(e),this.update()}dollyOut(e){this._dollyOut(e),this.update()}rotateLeft(e){this._rotateLeft(e),this.update()}rotateUp(e){this._rotateUp(e),this.update()}update(e=null){let t=this.object.position;Ft.copy(t).sub(this.target),Ft.applyQuaternion(this._quat),this._spherical.setFromVector3(Ft),this.autoRotate&&this.state===_t.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(n)&&isFinite(s)&&(n<-Math.PI?n+=en:n>Math.PI&&(n-=en),s<-Math.PI?s+=en:s>Math.PI&&(s-=en),n<=s?this._spherical.theta=Math.max(n,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+s)/2?Math.max(n,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let a=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=a!=this._spherical.radius}if(Ft.setFromSpherical(this._spherical),Ft.applyQuaternion(this._quatInverse),t.copy(this.target).add(Ft),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let a=null;if(this.object.isPerspectiveCamera){let o=Ft.length();a=this._clampDistance(o*this._scale);let c=o-a;this.object.position.addScaledVector(this._dollyDirection,c),this.object.updateMatrixWorld(),r=!!c}else if(this.object.isOrthographicCamera){let o=new R(this._mouse.x,this._mouse.y,0);o.unproject(this.object);let c=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=c!==this.object.zoom;let l=new R(this._mouse.x,this._mouse.y,0);l.unproject(this.object),this.object.position.sub(l).add(o),this.object.updateMatrixWorld(),a=Ft.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;a!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position):(Ko.origin.copy(this.object.position),Ko.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Ko.direction))<g_?this.object.lookAt(this.target):(fd.setFromNormalAndCoplanarPoint(this.object.up,this.target),Ko.intersectPlane(fd,this.target))))}else if(this.object.isOrthographicCamera){let a=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),a!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>Hc||8*(1-this._lastQuaternion.dot(this.object.quaternion))>Hc||this._lastTargetPosition.distanceToSquared(this.target)>Hc?(this.dispatchEvent(dd),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?en/60*this.autoRotateSpeed*e:en/60/60*this.autoRotateSpeed}_getZoomScale(e){let t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){Ft.setFromMatrixColumn(t,0),Ft.multiplyScalar(-e),this._panOffset.add(Ft)}_panUp(e,t){this.screenSpacePanning===!0?Ft.setFromMatrixColumn(t,1):(Ft.setFromMatrixColumn(t,0),Ft.crossVectors(this.object.up,Ft)),Ft.multiplyScalar(e),this._panOffset.add(Ft)}_pan(e,t){let n=this.domElement;if(this.object.isPerspectiveCamera){let s=this.object.position;Ft.copy(s).sub(this.target);let r=Ft.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*r/n.clientHeight,this.object.matrix),this._panUp(2*t*r/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let n=this.domElement.getBoundingClientRect(),s=e-n.left,r=t-n.top,a=n.width,o=n.height;this._mouse.x=s/a*2-1,this._mouse.y=-(r/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(en*this._rotateDelta.x/t.clientHeight),this._rotateUp(en*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(en*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-en*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(en*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-en*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._rotateStart.set(n,s)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panStart.set(n,s)}}_handleTouchStartDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(n*n+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{let n=this._getSecondPointerPosition(e),s=.5*(e.pageX+n.x),r=.5*(e.pageY+n.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(en*this._rotateDelta.x/t.clientHeight),this._rotateUp(en*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panEnd.set(n,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(n*n+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let a=(e.pageX+t.x)*.5,o=(e.pageY+t.y)*.5;this._updateZoomParameters(a,o)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new Re,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){let t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){let t=e.deltaMode,n={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}};function x_(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function __(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function v_(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(pd),this.state=_t.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:let e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function y_(i){let e;switch(i.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case Pn.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=_t.DOLLY;break;case Pn.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=_t.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=_t.ROTATE}break;case Pn.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=_t.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=_t.PAN}break;default:this.state=_t.NONE}this.state!==_t.NONE&&this.dispatchEvent(Gc)}function b_(i){switch(this.state){case _t.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case _t.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case _t.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function M_(i){this.enabled===!1||this.enableZoom===!1||this.state!==_t.NONE||(i.preventDefault(),this.dispatchEvent(Gc),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(pd))}function S_(i){this.enabled!==!1&&this._handleKeyDown(i)}function w_(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case In.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(i),this.state=_t.TOUCH_ROTATE;break;case In.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(i),this.state=_t.TOUCH_PAN;break;default:this.state=_t.NONE}break;case 2:switch(this.touches.TWO){case In.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=_t.TOUCH_DOLLY_PAN;break;case In.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=_t.TOUCH_DOLLY_ROTATE;break;default:this.state=_t.NONE}break;default:this.state=_t.NONE}this.state!==_t.NONE&&this.dispatchEvent(Gc)}function T_(i){switch(this._trackPointer(i),this.state){case _t.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case _t.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case _t.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case _t.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=_t.NONE}}function E_(i){this.enabled!==!1&&i.preventDefault()}function A_(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function C_(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}var tn=window.QwenPaw.host.React;function md({encoded:i}){let e=tn.useRef(null),[t,n]=tn.useState(!1),[s,r]=tn.useState("");return tn.useEffect(()=>{if(!i)return;let a=e.current,o=Uint8Array.from(atob(i),N=>N.charCodeAt(0)),c=new Float32Array(o.buffer),l=c.length/7,u;try{u=new qn({antialias:!0,alpha:!0})}catch{r("\u4E09\u7EF4\u663E\u793A\u9700\u8981 WebGL 2");return}r(""),u.setPixelRatio(Math.min(2,devicePixelRatio)),u.setClearColor(0,0),a.appendChild(u.domElement);let f=new gn,h=new Vn(-1,1,1,-1,.001,1e3),d=new Yn(h,u.domElement),_=new ai({color:5535108,roughness:.6}),y=new zn(1,1,1,16),x=new ir(y,_,l),p=new Rt,C=new R,w=new R,b=new R,S=new R(0,1,0),v=new It;for(let N=0;N<l;N++){let V=N*7,F=c[V+6];C.fromArray(c,V),w.fromArray(c,V+3),p.union(new Rt().setFromPoints([C,w]).expandByScalar(F)),b.subVectors(w,C),v.position.copy(C).lerp(w,.5),v.scale.set(F,b.length(),F),v.quaternion.setFromUnitVectors(S,b.normalize()),v.updateMatrix(),x.setMatrixAt(N,v.matrix)}let M=p.getCenter(new R),m=Math.max(p.getSize(new R).length(),.001);x.position.copy(M).negate(),f.add(x,new oi(16777215,9279907,2));let T=new li(16777215,2);T.position.set(2,4,3),f.add(T),h.near=m*.001,h.far=m*20,h.up.set(0,t?0:1,t?-1:0),h.position.copy(t?new R(0,1,0):new R(1,.85,1)).normalize().multiplyScalar(m*2),d.enableRotate=!t,d.update();function P(){u.render(f,h)}function I(){let{clientWidth:N,clientHeight:V}=a;if(!N||!V)return;let F=N/V,X=m*.55;h.left=-X*Math.max(1,F),h.right=-h.left,h.top=X*Math.max(1,1/F),h.bottom=-h.top,h.updateProjectionMatrix(),u.setSize(N,V),P()}d.addEventListener("change",P);let L=new ResizeObserver(I);return L.observe(a),I(),()=>{L.disconnect(),d.dispose(),y.dispose(),_.dispose(),x.dispose(),u.dispose(),u.forceContextLoss(),a.replaceChildren()}},[i,t]),i?tn.createElement(tn.Fragment,null,tn.createElement("div",{className:"sn-ez-controls"},tn.createElement("strong",null,"\u539F\u6A21\u578B\u6784\u4EF6"),tn.createElement("select",{"aria-label":"\u6784\u4EF6\u89C6\u56FE",value:t?"plan":"3d",onChange:a=>n(a.target.value==="plan")},tn.createElement("option",{value:"3d"},"\u4E09\u7EF4\u8F74\u6D4B"),tn.createElement("option",{value:"plan"},"\u4FEF\u89C6\u6295\u5F71"))),tn.createElement("div",{className:"sn-ez-scene",ref:e}),s&&tn.createElement("p",{role:"alert"},s)):tn.createElement("p",{className:"sn-empty"},"\u6B64\u5BF9\u8C61\u6CA1\u6709\u53EF\u9884\u89C8\u7684\u540C\u5750\u6807\u7CFB\u5706\u67F1\u6784\u4EF6\u3002")}var Ce=window.QwenPaw.host.React,P_={resolved:"\u5DF2\u5B9A\u4F4D",ambiguous:"\u540C\u540D\u5F85\u6838\u5BF9",unresolved:"\u5F85\u5339\u914D",candidate:"\u7AEF\u9762\u543B\u5408 \xB7 \u5F85\u6838\u5BF9"},I_=i=>[i.tree,i.node],Wc=i=>i?.tag||i?.name||(i?i.tree+":"+i.node:"");function Xc({asset:i,onPick:e}){return i?Ce.createElement("button",{className:"sn-table-link",onClick:()=>e(I_(i)),title:i.name||void 0},Wc(i)):null}function gd(i){return P_[i.status]||i.status}function xd({record:i,selected:e,onPick:t,onPair:n,onShowAll:s}){return i?.available?Ce.createElement("section",{className:"sn-related","aria-label":"\u9009\u4E2D\u5BF9\u8C61\u5173\u8054"},Ce.createElement("header",null,Ce.createElement("h4",null,"\u5173\u8054\u8BB0\u5F55 ",Ce.createElement("small",null,i.count.toLocaleString())),i.count>0&&Ce.createElement("button",{onClick:s},"\u67E5\u770B\u5168\u90E8")),i.count>0?Ce.createElement("ul",null,i.rows.slice(0,4).map(r=>{let a=r.owner.tree===e[0]&&r.owner.node===e[1],o=a?r.target:r.owner;return Ce.createElement("li",{key:r.id},Ce.createElement("span",{className:"sn-related-role"},r.label," \xB7 ",r.role),Ce.createElement("div",null,Ce.createElement("span",null,o?Ce.createElement(Xc,{asset:o,onPick:t}):r.text),r.target&&Ce.createElement("button",{onClick:()=>n(r)},"\u56FE\u4E0A\u5BF9\u7167")),Ce.createElement("small",null,gd(r)))})):Ce.createElement("p",null,"\u672A\u68C0\u7D22\u5230\u8BE5\u5BF9\u8C61\u7684\u7AEF\u70B9\u6216\u6E90\u5F15\u7528\u8BB0\u5F55\u3002")):null}function _d({api:i,active:e=!0,info:t,selected:n,onPick:s,onPair:r,scope:a,setScope:o,tableRef:c}){let[l,u]=Ce.useState(""),[f,h]=Ce.useState(""),[d,_]=Ce.useState(0),[y,x]=Ce.useState(null),[p,C]=Ce.useState(""),[w,b]=Ce.useReducer(N=>N+1,0),[S,v]=Ce.useState(t.topology?.types||[]),M=a==="object"?n:null,m=M?.[0],T=M?.[1],P=JSON.stringify([m,T,l,f,a]),I=Ce.useRef(P),L=I.current===P?d:0;return Ce.useEffect(()=>{I.current!==P&&(I.current=P,_(0))},[P]),Ce.useEffect(()=>{if(!e)return;let N=!0,V=new AbortController;x(null),C("");let F=new URLSearchParams({q:l,kind:f,page:L,revision:t.revision});m!==void 0&&(F.set("tree",m),F.set("node",T));let X=setTimeout(()=>i("/topology?"+F,{signal:V.signal}).then(H=>{N&&(x(H),H.types&&v(H.types))}).catch(H=>{N&&C(H.message)}),l?140:0);return()=>{N=!1,V.abort(),clearTimeout(X)}},[e,i,t.revision,l,f,L,m,T,w]),Ce.createElement("section",{className:"sn-panel sn-relations",ref:c,"aria-label":"\u5DE5\u533A\u8FDE\u63A5\u8BB0\u5F55"},Ce.createElement("header",{className:"sn-pane-head"},Ce.createElement("h3",null,Ce.createElement(je,{name:"network"}),"\u8FDE\u63A5\u8BB0\u5F55"),Ce.createElement("small",null,y?.available?y.count.toLocaleString()+" \u6761":"")),t.topology?.types?.some(N=>N.id==="process"&&N.count===0)&&!t.topology.centerlineRows&&Ce.createElement("p",{className:"sn-relation-note"},"\u6E90\u5DE5\u533A\u672A\u5217\u51FA\u5DE5\u827A\u8D77\u7EC8\u70B9\u3002\u7AEF\u9762\u543B\u5408\u8BB0\u5F55\u53EF\u5B9A\u4F4D\u5230\u4E24\u4FA7\u5BF9\u8C61\uFF0C\u4F9B\u6838\u5BF9\u5DE5\u827A\u8FDE\u63A5\u3002"),Ce.createElement("div",{className:"sn-ez-controls"},Ce.createElement("label",{className:"sn-search"},Ce.createElement(je,{name:"search"}),Ce.createElement("input",{type:"search","aria-label":"\u67E5\u627E\u8FDE\u63A5\u8BB0\u5F55",value:l,onChange:N=>u(N.target.value),placeholder:"\u67E5\u4F4D\u53F7\u3001\u7AEF\u70B9\u6216\u6E90\u8BB0\u5F55"})),Ce.createElement("select",{"aria-label":"\u8FDE\u63A5\u8BB0\u5F55\u7C7B\u578B",value:f,onChange:N=>h(N.target.value)},Ce.createElement("option",{value:""},"\u5168\u90E8\u5173\u7CFB\u7C7B\u578B"),S.map(N=>Ce.createElement("option",{key:N.id,value:N.id},N.label))),Ce.createElement("select",{"aria-label":"\u8FDE\u63A5\u8BB0\u5F55\u8303\u56F4",value:a,onChange:N=>o(N.target.value)},Ce.createElement("option",{value:"project"},"\u6574\u4E2A\u5DE5\u533A"),Ce.createElement("option",{value:"object",disabled:!n},"\u4EC5\u5F53\u524D\u5BF9\u8C61"))),p?Ce.createElement("p",{className:"sn-empty",role:"alert"},p," ",Ce.createElement("button",{onClick:b},"\u91CD\u8BD5")):y?y.available?y.count?Ce.createElement(Ce.Fragment,null,Ce.createElement("div",{className:"sn-relation-scroll"},Ce.createElement("table",{"aria-label":"\u6E90\u6587\u4EF6\u8FDE\u63A5\u8BB0\u5F55"},Ce.createElement("thead",null,Ce.createElement("tr",null,["\u6E90\u5BF9\u8C61","\u5173\u7CFB / \u7AEF\u70B9","\u5BF9\u5E94\u5BF9\u8C61\u6216\u6E90\u6587","\u5339\u914D\u60C5\u51B5","\u6765\u6E90",""].map((N,V)=>Ce.createElement("th",{key:V,scope:"col"},N)))),Ce.createElement("tbody",null,y.rows.map(N=>Ce.createElement("tr",{key:N.id},Ce.createElement("td",null,Ce.createElement(Xc,{asset:N.owner,onPick:s})),Ce.createElement("td",null,N.label,Ce.createElement("small",null,N.role)),Ce.createElement("td",null,N.target?Ce.createElement(Xc,{asset:N.target,onPick:s}):N.text),Ce.createElement("td",null,gd(N),N.status==="ambiguous"&&N.matches>1&&Ce.createElement("small",null,N.matches," \u4E2A\u540C\u540D\u5BF9\u8C61")),Ce.createElement("td",null,Ce.createElement("details",null,Ce.createElement("summary",null,N.field||"\u6E90\u8BB0\u5F55"),Ce.createElement("span",null,N.evidence||N.text))),Ce.createElement("td",null,N.target&&Ce.createElement("button",{title:Wc(N.owner)+" / "+Wc(N.target),onClick:()=>r(N)},"\u56FE\u4E0A\u5BF9\u7167"))))))),Ce.createElement("div",{className:"sn-pager"},Ce.createElement("span",null,"\u7B2C ",L+1," / ",Math.ceil(y.count/y.pageSize)," \u9875"),Ce.createElement("div",{className:"sn-actions"},Ce.createElement("button",{disabled:!L,onClick:()=>_(N=>N-1),"aria-label":"\u8FDE\u63A5\u8BB0\u5F55\u4E0A\u4E00\u9875"},"\u4E0A\u4E00\u9875"),Ce.createElement("button",{disabled:(L+1)*y.pageSize>=y.count,onClick:()=>_(N=>N+1),"aria-label":"\u8FDE\u63A5\u8BB0\u5F55\u4E0B\u4E00\u9875"},"\u4E0B\u4E00\u9875")))):Ce.createElement("p",{className:"sn-empty"},"\u5F53\u524D\u8303\u56F4\u5185\u6CA1\u6709\u5339\u914D\u7684\u5173\u7CFB\u8BB0\u5F55\u3002"):Ce.createElement("p",{className:"sn-empty"},"\u5F53\u524D\u5DE5\u533A\u5C1A\u672A\u5EFA\u7ACB\u5173\u7CFB\u7D22\u5F15\u3002"):Ce.createElement("p",{className:"sn-empty",role:"status"},"\u6B63\u5728\u8BFB\u53D6\u5173\u7CFB\u8BB0\u5F55\u2026"))}var qc=Math.PI*2,$o=48;function Ds(i,e,t){let n=Math.max(Math.PI/24,Math.min(Math.PI/3,2*Math.acos(Math.max(-1,1-Math.max(1e-12,t*.32)/i))));return Math.min($o,Math.max(2,Math.ceil(Math.abs(e)/n)))}function Li(i,e){return Math.hypot(i[e+5],i[e+6],i[e+7])}function Qo(i,e,t,n){for(let s=0;s<=t;s++){let r=i[e+11]*(s/t),a=Math.cos(r),o=Math.sin(r);n(i[e+2]+i[e+5]*a+i[e+8]*o,i[e+3]+i[e+6]*a+i[e+9]*o,i[e+4]+i[e+7]*a+i[e+10]*o,s)}}function vd(i,e){let t=i[e+11],n=i[e+12],s=[[],[]],r=a=>(Math.sign(t)*a%qc+qc)%qc<=Math.abs(t)+1e-12;for(let a=0;a<3;a++){let o=i[e+2+a],c=i[e+5+a],l=i[e+8+a],u=Math.atan2(l,c),f=Math.hypot(c,l),h=o+c*Math.cos(t)+l*Math.sin(t);s[0][a]=Math.min(o+c,h,r(u+Math.PI)?o-f:1/0)-n,s[1][a]=Math.max(o+c,h,r(u)?o+f:-1/0)+n}return s}var R_=4294967295;function yd(){return[[1/0,1/0,1/0],[-1/0,-1/0,-1/0]]}function el(i,e,t,n,s){let[r,a]=i;r[0]=Math.min(r[0],e-s),r[1]=Math.min(r[1],t-s),r[2]=Math.min(r[2],n-s),a[0]=Math.max(a[0],e+s),a[1]=Math.max(a[1],t+s),a[2]=Math.max(a[2],n+s)}function Qi(i){return Array.isArray(i)&&i.length===2&&i.every(e=>Array.isArray(e)&&e.length===3&&e.every(Number.isFinite))&&i[1].every((e,t)=>e>=i[0][t])}function bd(i){let e=i.byteLength>=16&&new DataView(i,0,16);if(!e||e.getUint32(0)!==1163547441)throw Error("\u573A\u666F\u7D22\u5F15\u7248\u672C\u65E0\u6CD5\u8BC6\u522B");let t=e.getUint32(4,!0),n=e.getUint32(8,!0),s=e.getUint32(12,!0);if(i.byteLength!==16+t*36+n*44+s*52)throw Error("\u573A\u666F\u6784\u4EF6\u8BB0\u5F55\u4E0D\u5B8C\u6574");if(!t&&!n&&!s)throw Error("\u6CA1\u6709\u53EF\u88C5\u914D\u5230\u5DE5\u533A\u5750\u6807\u7684\u6784\u4EF6");let r=new Float32Array(i,16),a=new Uint32Array(i,16),o=[null],c=new Map,l=yd();function u(b,S){if(S===R_)return 0;let v=c.get(b);v||(v=new Map,c.set(b,v));let M=v.get(S);return M===void 0&&(M=o.length,v.set(S,M),o.push({key:[b,S],bounds:yd()})),M}let f=new Float32Array(i,16,t*9),h=new Float32Array(t),d=new Float32Array(n*9),_=new Float32Array(n*3);function y(b,S,v){let M=r[b],m=r[b+1],T=r[b+2];if(!Number.isFinite(M)||!Number.isFinite(m)||!Number.isFinite(T))throw Error("\u573A\u666F\u7D22\u5F15\u542B\u65E0\u6548\u5750\u6807");el(l,M,m,T,S),v&&el(v,M,m,T,S)}for(let b=0,S=0;b<t;b++,S+=9){let v=u(a[S],a[S+1]),M=r[S+8];if(!Number.isFinite(M)||M<=0)throw Error("\u573A\u666F\u7D22\u5F15\u542B\u65E0\u6548\u6784\u4EF6\u534A\u5F84");h[b]=v;let m=o[v]?.bounds;y(S+2,M,m),y(S+5,M,m)}for(let b=0,S=t*9;b<n;b++,S+=11){let v=u(a[S],a[S+1]),M=o[v]?.bounds;for(let m=0;m<3;m++){let T=S+2+3*m,P=b*9+3*m;d[P]=r[T],d[P+1]=r[T+1],d[P+2]=r[T+2],_[b*3+m]=v,y(T,0,M)}}let x=t*9+n*11,p=new Float32Array(i,16+x*4,s*13),C=new Float32Array(s),w=new Float32Array(s*6);for(let b=0,S=0;b<s;b++,S+=13){for(let T=2;T<13;T++)if(!Number.isFinite(p[S+T]))throw Error("\u573A\u666F\u5706\u5F27\u5750\u6807\u65E0\u6548");if(!(Li(p,S)>0&&p[S+12]>0&&p[S+11]))throw Error("\u573A\u666F\u5706\u5F27\u53C2\u6570\u65E0\u6548");let v=u(a[x+S],a[x+S+1]);C[b]=v;let[M,m]=vd(p,S);w.set(M,b*6),w.set(m,b*6+3);for(let T of[l,o[v]?.bounds])T&&(el(T,...M,0),el(T,...m,0))}return{tubeCoords:f,tubeOwners:h,faceCoords:d,faceOwners:_,arcCoords:p,arcOwners:C,arcExtents:w,owners:o,bounds:l,idFor(b){return b?c.get(b[0])?.get(b[1])??0:0}}}var Le=window.QwenPaw.host.React;function Md({info:i}){let e=i.scene,t=e?.bounds;return Le.createElement("section",{className:"sn-panel sn-overview-aside","aria-label":"\u5DE5\u533A\u8303\u56F4"},Le.createElement("header",{className:"sn-pane-head"},Le.createElement("h3",null,Le.createElement(je,{name:"properties"}),"\u5DE5\u533A\u8303\u56F4")),Le.createElement("dl",{className:"sn-extent-spec"},Le.createElement("dt",null,"\u5750\u6807\u5355\u4F4D"),Le.createElement("dd",null,i.unit||"\u6E90\u6587\u4EF6\u672A\u58F0\u660E"),e?.objects>0&&Le.createElement(Le.Fragment,null,Le.createElement("dt",null,"\u6709\u603B\u56FE\u51E0\u4F55\u7684\u5BF9\u8C61"),Le.createElement("dd",null,e.objects.toLocaleString()," / ",i.objects?.toLocaleString())),e?.locatableObjects>e?.objects&&Le.createElement(Le.Fragment,null,Le.createElement("dt",null,"\u53EF\u6309\u5B50\u4EF6\u5B9A\u4F4D\u7684\u5BF9\u8C61"),Le.createElement("dd",null,(e.locatableObjects-e.objects).toLocaleString())),Qi(t)&&["X \u8DE8\u5EA6","Y \u8DE8\u5EA6","Z \u8DE8\u5EA6"].map((n,s)=>Le.createElement(Le.Fragment,{key:n},Le.createElement("dt",null,n),Le.createElement("dd",null,(t[1][s]-t[0][s]).toLocaleString(void 0,{maximumFractionDigits:2})," ",i.unit))),e?.segments>0&&Le.createElement(Le.Fragment,null,Le.createElement("dt",null,"\u5706\u67F1\u6784\u4EF6"),Le.createElement("dd",null,e.segments.toLocaleString())),e?.triangles>0&&Le.createElement(Le.Fragment,null,Le.createElement("dt",null,"\u603B\u56FE\u8F7B\u91CF\u9762\u7247"),Le.createElement("dd",null,e.triangles.toLocaleString())),e?.arcs>0&&Le.createElement(Le.Fragment,null,Le.createElement("dt",null,"\u539F\u751F\u5706\u5F27\u6784\u4EF6"),Le.createElement("dd",null,e.arcs.toLocaleString())),e?.groups?.length>0&&Le.createElement(Le.Fragment,null,Le.createElement("dt",null,"\u53EF\u5B9A\u4F4D\u5206\u533A"),Le.createElement("dd",null,e.groups.length))),Le.createElement("p",{className:"sn-empty"},"\u70B9\u9009\u56FE\u4E2D\u8BBE\u5907\u6216\u7BA1\u6BB5\uFF0C\u53EF\u67E5\u770B\u6E90\u4F4D\u53F7\u548C\u5173\u8054\u8BB0\u5F55\u3002"))}function Yc({info:i,item:e,selected:t,model:n,apply:s,compact:r,onShowObject:a,onShowLocation:o,onShowAll:c,onPick:l,onPair:u}){let f=e?.attributes||[],h=Object.fromEntries(f),d=h.\u540D\u79F0||h.TYPE||"\u5DE5\u7A0B\u5BF9\u8C61",_=h.\u4F4D\u53F7||t?.join(":");return Le.createElement("section",{className:"sn-panel sn-object-detail"+(r?" sn-overview-aside":""),"aria-label":"\u5DE5\u7A0B\u5BF9\u8C61\u8BE6\u60C5"},e&&t?Le.createElement(Le.Fragment,null,Le.createElement("header",{className:"sn-pane-head"},Le.createElement("div",null,Le.createElement("small",null,"\u5BF9\u8C61\u8BE6\u60C5"),Le.createElement("h3",null,d)),Le.createElement("code",null,_)),Le.createElement("div",{className:"sn-ez-controls"},r?Le.createElement("button",{onClick:a},Le.createElement(je,{name:"properties"}),"\u6253\u5F00\u5BF9\u8C61\u8D44\u6599"):Le.createElement("button",{onClick:o},Le.createElement(je,{name:"diagram"}),"\u5728\u5DE5\u533A\u603B\u56FE\u5B9A\u4F4D")),r?Le.createElement("dl",{className:"sn-extent-spec"},[["\u7C7B\u578B",h.TYPE||h.\u7C7B\u578B],["\u5B89\u88C5\u5730\u70B9",h.\u5B89\u88C5\u5730\u70B9||h.\u5355\u5143\u540D\u79F0],["\u6E90\u5BF9\u8C61",t.join(" / ")]].filter(y=>y[1]).map(([y,x])=>Le.createElement(Le.Fragment,{key:y},Le.createElement("dt",null,y),Le.createElement("dd",null,String(x))))):Le.createElement(xh,{key:i.revision+t.join(":"),fields:h,source:{project:i.name,tree:t[0],node:t[1],tag:h.\u4F4D\u53F7??""},model:n,apply:s}),Le.createElement(xd,{record:e.related,selected:t,onPick:l,onPair:u,onShowAll:c}),!r&&Le.createElement(Le.Fragment,null,Le.createElement(md,{encoded:e.cylinders}),e.cylinders&&Le.createElement("div",{className:"sn-ez-caption"},"\u5BF9\u8C61\u5C40\u90E8\u5750\u6807 \xB7 ",i.unit||"\u6E90\u5355\u4F4D\u672A\u58F0\u660E"," \xB7 \u5706\u67F1\u6784\u4EF6\u9884\u89C8"),Le.createElement("div",{className:"sn-attribute-head"},Le.createElement("h4",null,"\u6E90\u5DE5\u7A0B\u5C5E\u6027"),Le.createElement("span",null,f.length," \u9879")),Le.createElement("div",{className:"sn-ez-attributes"},Le.createElement("table",{"aria-label":"\u6E90\u5DE5\u7A0B\u5C5E\u6027"},Le.createElement("tbody",null,f.map(([y,x],p)=>Le.createElement("tr",{key:p},Le.createElement("th",{scope:"row"},y),Le.createElement("td",null,String(x??""))))))))):Le.createElement("p",{className:"sn-empty"},t?"\u6B63\u5728\u8BFB\u53D6\u5BF9\u8C61\u8BE6\u60C5\u2026":"\u5F53\u524D\u6CA1\u6709\u9009\u4E2D\u5BF9\u8C61"))}var Zc=new Uint32Array(1024);for(let i=0;i<Zc.length;i++)for(let e=0;e<10;e++)Zc[i]|=(i>>e&1)<<3*e;function jc(i,e,t,n){let s=i.length/e,r=new Uint32Array(s),a=new Uint32Array(s),[o,c]=n,l=1023/(Math.max(...c.map((f,h)=>f-o[h]))||1),u=(f,h)=>Zc[Math.max(0,Math.min(1023,Math.floor((f-o[h])*l)))];for(let f=0,h=0;f<s;f++,h+=e){let d,_,y;t==="face"?(d=(i[h]+i[h+3]+i[h+6])/3,_=(i[h+1]+i[h+4]+i[h+7])/3,y=(i[h+2]+i[h+5]+i[h+8])/3):t==="arc"?(d=i[h+2],_=i[h+3],y=i[h+4]):(d=(i[h+2]+i[h+5])/2,_=(i[h+3]+i[h+6])/2,y=(i[h+4]+i[h+7])/2),r[f]=u(d,0)|u(_,1)<<1|u(y,2)<<2,a[f]=f}return a.sort((f,h)=>r[f]-r[h])}function Sd(i,e){let{tubeCoords:t,tubeOwners:n,faceCoords:s,faceOwners:r,arcCoords:a,arcOwners:o,arcExtents:c}=i,l=[],u=[],f=[],h=[],d=[],[_,y]=i.bounds,x=e/2,p=1+Math.floor((y[0]-_[0])/x),C=1+Math.floor((y[1]-_[1])/x),w=new Map;function b(S,v,M,m){let T=w.get(S);T||(T=new Set,w.set(S,T));let P=Math.floor((v-_[0])/x),I=Math.floor((M-_[1])/x),L=Math.floor((m-_[2])/x),N=P+p*(I+C*L);T.has(N)||(T.add(N),l.push(v,M,m,S))}for(let S=0,v=0;S<n.length;S++,v+=9){let M=n[S],m=t[v+2],T=t[v+3],P=t[v+4],I=t[v+5],L=t[v+6],N=t[v+7];2*t[v+8]>=e?h.push(S):Math.max(Math.abs(I-m),Math.abs(L-T),Math.abs(N-P))<x?b(M,(m+I)/2,(T+L)/2,(P+N)/2):(u.push(m,T,P,M,I,L,N,M),b(M,m,T,P))}for(let S=0,v=0;S<o.length;S++,v+=13){let M=o[S],m=S*6;if(2*a[v+12]>=e){d.push(S);continue}if(Math.max(...[0,1,2].map(L=>c[m+L+3]-c[m+L]))<x){b(M,a[v+2]+a[v+5],a[v+3]+a[v+6],a[v+4]+a[v+7]);continue}let T,P,I;Qo(a,v,Ds(Li(a,v),a[v+11],e),(L,N,V,F)=>{F?u.push(T,P,I,M,L,N,V,M):b(M,L,N,V),T=L,P=N,I=V})}for(let S=0,v=0;v<s.length;S++,v+=9){let M=r[S*3],m=s[v],T=s[v+1],P=s[v+2],I=s[v+3],L=s[v+4],N=s[v+5],V=s[v+6],F=s[v+7],X=s[v+8];Math.max(Math.max(m,I,V)-Math.min(m,I,V),Math.max(T,L,F)-Math.min(T,L,F),Math.max(P,N,X)-Math.min(P,N,X))<x?b(M,(m+I+V)/3,(T+L+F)/3,(P+N+X)/3):f.push(m,T,P,M,I,L,N,M,V,F,X,M)}return{points:new Float32Array(l),lines:new Float32Array(u),faces:new Float32Array(f),thickTubes:h,thickArcs:d}}var Ed=`
attribute float radius; attribute float asset;
uniform float pixel; uniform bool picking; uniform bool hideContext;
varying vec4 shape; varying vec3 point; varying vec2 orientation; varying float objectId;
`,Ad=`
  objectId=asset;
  if(hideContext && asset==0.0) {gl_Position=vec4(2.,2.,2.,1.);return;}
  vec3 a=(modelViewMatrix*vec4(start,1.)).xyz, b=(modelViewMatrix*vec4(end,1.)).xyz;
  vec3 axis=b-a;
  float length3=max(length(axis),1.e-15), xy=length(axis.xy);
  vec2 along=xy>1.e-12 ? axis.xy/xy : vec2(1.,0.);
  vec2 side=vec2(-along.y,along.x);
  float r=max(radius,pixel*(picking?2.8:0.55));
  float px=mix(-r,xy+r,position.x);
  vec2 offset=along*px+side*(position.y*r);
  shape=vec4(xy/length3,axis.z/length3,length3/r,r);
  point=vec3(px/r,position.y,a.z); orientation=along;
  gl_Position=projectionMatrix*vec4(a.xy+offset,mix(a.z,b.z,position.x),1.);
}`,L_=Ed+`
attribute vec3 start; attribute vec3 end;
void main() {`+Ad,N_=Ed+`
attribute vec3 arcCenter; attribute vec3 basisU; attribute vec3 basisV; attribute float sweep;
varying vec2 joinEnds;
void main() {
  float stepAngle=clamp(2.*acos(clamp(1.-max(1.e-12,pixel*.32)/length(basisU),-1.,1.)),.13089969,1.04719755);
  float n=clamp(ceil(abs(sweep)/stepAngle),2.,48.);
  if(position.z>=n) {gl_Position=vec4(2.,2.,2.,1.);return;}
  float t0=sweep*position.z/n, t1=sweep*(position.z+1.)/n;
  vec3 start=arcCenter+basisU*cos(t0)+basisV*sin(t0);
  vec3 end=arcCenter+basisU*cos(t1)+basisV*sin(t1);
  joinEnds=vec2(position.z>0. ? 1. : 0., position.z+1.<n ? 1. : 0.);
`+Ad,Jc=`
uniform float selected; uniform float partner;
uniform bool groupedSelection; uniform highp sampler2D groupMembers;
uniform vec3 assetColor; uniform vec3 contextColor; uniform vec3 highlight;
uniform bool picking; varying float objectId;
vec3 surfaceColor() {
  if(objectId>0. && abs(objectId-selected)<.25) return highlight;
  if(objectId>0. && abs(objectId-partner)<.25) return vec3(.58,.38,.87);
  if(groupedSelection && objectId>0.) {
    int id=int(objectId+.5), width=textureSize(groupMembers,0).x;
    float role=texelFetch(groupMembers,ivec2(id%width,id/width),0).r*255.;
    if(abs(role-1.)<.25) return highlight;
    if(abs(role-2.)<.25) return vec3(.58,.38,.87);
  }
  return objectId>0. ? assetColor : contextColor;
}
vec4 pickColor() {return vec4(mod(objectId,256.),mod(floor(objectId/256.),256.),floor(objectId/65536.),255.)/255.;}
`,wd=Jc+`
uniform vec2 clip;
varying vec4 shape; varying vec3 point; varying vec2 orientation;
#ifdef CURVE_JOIN
varying vec2 joinEnds;
#endif
void main() {
  float x=point.x, y=point.y;
  if(abs(y)>1.) discard;
  float root=sqrt(max(0.,1.-y*y)), a=shape.x, b=shape.y, l=shape.z;
  float z=-1.e30;
  vec2 side=vec2(-orientation.y,orientation.x);
  vec3 normal=vec3(0.,0.,1.);
  if(a>1.e-6) {
    float s=(x+b*root)/a;
    if(s>=0. && s<=l) {
      z=s*b+a*root;
      normal=vec3(-orientation*b*root+side*y,a*root);
    }
  }
  if(abs(b)>1.e-6) {
    float s=b>=0. ? l : 0.;
    float dx=x-s*a;
    if(abs(dx)<=abs(b)*root) {
      float cz=s*b-a*dx/b;
      if(cz>z) { z=cz; normal=vec3(orientation*a,b)*sign(b); }
    }
  }
  #ifdef CURVE_JOIN
  for(int i=0;i<2;i++) {
    if(joinEnds[i]<.5) continue;
    float dx=x-float(i)*l*a, disc=1.-dx*dx-y*y;
    if(disc>=0.) {
      float top=sqrt(disc), cz=float(i)*l*b+top;
      if(cz>z) {z=cz;normal=vec3(orientation*dx+side*y,top);}
    }
  }
  #endif
  if(z< -1.e29) discard;
  gl_FragDepth=clamp((-(point.z+z*shape.w)-clip.x)/(clip.y-clip.x),0.,1.);
  float light=.80+.20*dot(normal,vec3(-.35,.55,.75));
  gl_FragColor=picking ? pickColor() : vec4(surfaceColor()*light,1.);
}`,D_=`
attribute float asset;
uniform bool hideContext;
varying float objectId; varying vec3 viewPoint;
void main() {
  objectId=asset;
  if(hideContext && asset==0.) {gl_Position=vec4(2.,2.,2.,1.);return;}
  vec4 p=modelViewMatrix*vec4(position,1.);
  viewPoint=p.xyz; gl_Position=projectionMatrix*p;
}`,U_=`
attribute float asset;
uniform bool hideContext;
uniform float pointSize;
varying float objectId;
void main() {
  objectId=asset; gl_PointSize=pointSize;
  gl_Position=hideContext && asset==0. ? vec4(2.,2.,2.,1.) : projectionMatrix*modelViewMatrix*vec4(position,1.);
}`,F_=Jc+`
void main() { gl_FragColor=vec4(surfaceColor()*.94,1.); }`,O_=Jc+`
varying vec3 viewPoint;
void main() {
  vec3 normal=normalize(cross(dFdx(viewPoint),dFdy(viewPoint)));
  float light=.70+.30*abs(dot(normal,vec3(-.35,.55,.75)));
  gl_FragColor=picking ? pickColor() : vec4(surfaceColor()*light,1.);
}`;function tl(i){return new Rt(new R(...i[0]),new R(...i[1]))}function Td(i){let e=[],t=[];for(let n=0;n<i;n++){let s=4*n;e.push(0,-1,n,1,-1,n,0,1,n,1,1,n),t.push(s,s+1,s+2,s+2,s+1,s+3)}return{position:new mt(e,3),index:new Gi(t,1)}}function Cd(i,e,t){let n=new qn({antialias:!0,alpha:!0,powerPreference:"high-performance"});n.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),n.setClearColor(0,0);let s=n.domElement;s.tabIndex=0,i.appendChild(s);let r=new Vn(-1,1,1,-1);r.up.set(0,0,1);let a=new Yn(r,s);a.enableDamping=!1,a.zoomToCursor=!0,a.screenSpacePanning=!0,a.minZoom=.02,a.maxZoom=1e7;let o=tl(e.bounds),c=o.getCenter(new R),l=o.getSize(new R).length()||1,u=new R(0,0,1),f="plan",h=e.bounds,d=0,_=!1,y=0,x=0,p=Math.min(1024,e.owners.length),C=Math.ceil(e.owners.length/p),w=new Uint8Array(p*C),b=new qi(w,p,C,Is);b.needsUpdate=!0;let S={pixel:{value:1},pointSize:{value:n.getPixelRatio()*1.25},picking:{value:!1},hideContext:{value:!1},clip:{value:new Re},selected:{value:0},partner:{value:0},groupedSelection:{value:!1},groupMembers:{value:b},assetColor:{value:new et},contextColor:{value:new et},highlight:{value:new et}},v=[b];function M(g,D){let U=new jt({vertexShader:g,fragmentShader:D,uniforms:S,side:vn});return v.push(U),U}let m=M(L_,wd),T=M(N_,`#define CURVE_JOIN
`+wd),P=M(D_,O_),I=Td(1),L=Td($o),N=new gn,V=[],F=new Si,X=new ft,H=new Rt,$=e.tubeOwners.length+e.arcOwners.length+e.faceOwners.length/3,Q=Math.max(...o.getSize(new R).toArray()),de=$>=24e3&&Q>0?[1024,4096].map(g=>({step:Q/g,scene:null})):[],fe=new Map([[N,[]]]),ge=!1;function ze(g,D,U){g===N&&(D.frustumCulled=!1,V.push([D,U])),g.add(D)}function he(g,D,U){let W=D?e.arcCoords:e.tubeCoords,ie=D?e.arcOwners:e.tubeOwners,ce=D?13:9,K=D?256:1024,te=D?L:I,ve=D?[["arcCenter",3,2],["basisU",3,5],["basisV",3,8],["sweep",1,11],["radius",1,12]]:[["start",3,2],["end",3,5],["radius",1,8]];for(let Ne=0;Ne<U.length;Ne+=K){let ye=Math.min(Ne+K,U.length),Se=ye-Ne,Ve=new Float32Array(Se*ce),Ye=new Float32Array(Se),$e=[1/0,1/0,1/0],B=[-1/0,-1/0,-1/0],be=0,ne=0;for(let Oe=Ne;Oe<ye;Oe++){let De=U[Oe],ht=De*ce;Ye[Oe-Ne]=ie[De];for(let tt=0;tt<ce;tt++)Ve[(Oe-Ne)*ce+tt]=W[ht+tt];D&&(be=Math.max(be,Li(W,ht)),ne=Math.max(ne,Math.abs(W[ht+11])));for(let tt=0;tt<3;tt++){let un=D?e.arcExtents[De*6+tt]:Math.min(W[ht+2+tt],W[ht+5+tt])-W[ht+8],dn=D?e.arcExtents[De*6+tt+3]:Math.max(W[ht+2+tt],W[ht+5+tt])+W[ht+8];$e[tt]=Math.min($e[tt],un),B[tt]=Math.max(B[tt],dn)}}let xe=new xr,Ee=new _r(Ve,ce);xe.setAttribute("position",te.position),xe.setIndex(te.index);for(let[Oe,De,ht]of ve)xe.setAttribute(Oe,new Wi(Ee,De,ht));xe.setAttribute("asset",new Yi(Ye,1)),xe.instanceCount=Se;let ae=tl([$e,B]);xe.boundingSphere=ae.getBoundingSphere(new xn),ze(g,new St(xe,D?T:m),ae),v.push(xe),D&&fe.get(g).push({geometry:xe,major:be,sweep:ne})}}function Ie(g,D,U,W){if(!D.length)return;let ie=new Lt,ce=new Ss(D,4);ie.setAttribute("position",new Wi(ce,3,0)),ie.setAttribute("asset",new Wi(ce,1,3)),ie.computeBoundingBox(),ze(g,new U(ie,W),ie.boundingBox),v.push(ie)}function q(){for(let U of[!1,!0]){let W=U?e.arcCoords:e.tubeCoords;he(N,U,jc(W,U?13:9,U?"arc":"tube",e.bounds))}let g=jc(e.faceCoords,9,"face",e.bounds),D=768;for(let U=0;U<g.length;U+=D){let W=Math.min(U+D,g.length),ie=new Float32Array((W-U)*12);for(let ce=U;ce<W;ce++){let K=g[ce],te=e.faceOwners[K*3];for(let ve=0;ve<3;ve++){let Ne=K*9+ve*3,ye=(ce-U)*12+ve*4;ie[ye]=e.faceCoords[Ne],ie[ye+1]=e.faceCoords[Ne+1],ie[ye+2]=e.faceCoords[Ne+2],ie[ye+3]=te}}Ie(N,ie,St,P)}ge=!0}function O(g,D){let U=!D&&de.find(W=>g>=W.step);if(U){if(!U.scene){let W=new gn,ie=Sd(e,U.step),ce=M(U_,F_);fe.set(W,[]),Ie(W,ie.faces,St,P),Ie(W,ie.lines,ws,ce),Ie(W,ie.points,rr,ce),he(W,!1,ie.thickTubes),he(W,!0,ie.thickArcs),U.scene=W}return U.scene}return ge||q(),N}function z(g=!1){let D=S.pixel.value,U=O(D,g);if(U===N){r.updateMatrixWorld(),F.setFromProjectionMatrix(X.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse));let W=(g?3:.65)*D;for(let[ie,ce]of V)ie.visible=F.intersectsBox(H.copy(ce).expandByScalar(W))}for(let{geometry:W,major:ie,sweep:ce}of fe.get(U))W.setDrawRange(0,6*Math.min($o,Ds(ie,ce,D)+1));n.render(U,r)}function j(){let g=document.documentElement.classList.contains("dark-mode");S.assetColor.value.setRGB(...g?[.53,.76,.81]:[.18,.41,.47]),S.contextColor.value.setRGB(...g?[.47,.52,.56]:[.59,.65,.68]),S.highlight.value.setRGB(...g?[1,.72,.24]:[.93,.41,.09]),ue()}function se(g){let D=new R(...g).project(r);return[(D.x+1)*y/2,(1-D.y)*x/2,D.z]}function oe(){_||!y||!x||!i.clientWidth||(S.pixel.value=(r.top-r.bottom)/r.zoom/x,S.clip.value.set(r.near,r.far),z(),t.onDraw(S.pixel.value,se,y,x))}function ue(){_||d||(d=requestAnimationFrame(()=>{d=0,oe()}))}function me(){if(!y||!x)return;let g=tl(h),D=g.getSize(new R);r.updateMatrixWorld(!0);let U=new R().setFromMatrixColumn(r.matrixWorld,0),W=new R().setFromMatrixColumn(r.matrixWorld,1),ie=K=>Math.abs(K.x*D.x)+Math.abs(K.y*D.y)+Math.abs(K.z*D.z),ce=Math.max(ie(W),ie(U)*x/y,l*1e-8)*1.12;r.top=ce/2,r.bottom=-ce/2,r.right=r.top*y/x,r.left=-r.right,r.updateProjectionMatrix()}function pe(g){h=g;let D=tl(g).getCenter(new R),U=f==="plan"?new R(0,0,1):r.position.clone().sub(a.target).normalize();f!=="plan"&&(!U.lengthSq()||Math.abs(U.z)>.999)&&U.set(.82,-1.38,.92).normalize(),a.target.copy(D),r.near=Math.max(l*1e-6,1e-6),r.far=l*5+1,r.position.copy(D).addScaledVector(U,l*2+.1),r.up.copy(f==="plan"?new R(0,1,0):u),r.lookAt(D),r.zoom=1,me(),a.update(),ue()}function _e(g){f=g,a.enableRotate=g==="spatial",a.mouseButtons.LEFT=g==="spatial"?Pn.ROTATE:Pn.PAN,a.touches.ONE=g==="spatial"?In.ROTATE:In.PAN,s.setAttribute("aria-label",g==="spatial"?"\u5DE5\u533A\u4E09\u7EF4\u88C5\u914D\u56FE":"\u5DE5\u533A\u4E8C\u7EF4\u603B\u5E73\u9762\u56FE"),g==="spatial"&&(r.up.copy(u),r.position.copy(a.target).add(new R(.82,-1.38,.92).normalize().multiplyScalar(l*2))),pe(h)}function ee(){let g=i.clientWidth,D=i.clientHeight;if(!(g<=0||D<=0)){if(g===y&&D===x){ue();return}y=g,x=D,n.setSize(g,D,!1),me(),ue()}}function Me(g){r.zoom=Ir.clamp(r.zoom*g,a.minZoom,a.maxZoom),r.updateProjectionMatrix(),a.update(),ue()}let We=new Zt(1,1,{colorSpace:Nn}),Ke=new Uint8Array(4),Xe=null;function it(g){g.isPrimary&&g.button===0&&(Xe=[g.clientX,g.clientY])}function ut(g){if(!Xe||!g.isPrimary||g.button!==0||Math.hypot(g.clientX-Xe[0],g.clientY-Xe[1])>4){Xe=null;return}Xe=null;let D=s.getBoundingClientRect(),U=Math.floor(g.clientX-D.left),W=Math.floor(g.clientY-D.top);if(U<0||U>=y||W<0||W>=x)return;S.picking.value=!0;try{r.setViewOffset(y,x,U,W,1,1),n.setRenderTarget(We),z(!0),n.readRenderTargetPixels(We,0,0,1,1,Ke)}finally{S.picking.value=!1,r.clearViewOffset(),n.setRenderTarget(null),ue()}let ie=Ke[0]+Ke[1]*256+Ke[2]*65536;e.owners[ie]&&t.onPick(e.owners[ie].key)}function k(g){if(g.key==="Home")t.onFit();else if(g.key==="+"||g.key==="=")Me(1.6);else if(g.key==="-")Me(1/1.6);else return;g.preventDefault()}function Tt(g){g.preventDefault(),t.onLost()}a.addEventListener("change",ue),s.addEventListener("pointerdown",it),s.addEventListener("pointerup",ut),s.addEventListener("pointercancel",()=>{Xe=null}),s.addEventListener("keydown",k),s.addEventListener("webglcontextlost",Tt);let lt=new MutationObserver(j),A=new ResizeObserver(ee);return lt.observe(document.documentElement,{attributes:!0,attributeFilter:["class","data-page-style","data-interface-style"]}),A.observe(i),a.target.copy(c),j(),ee(),_e("plan"),{fit:pe,zoom:Me,setMode:_e,refresh:ue,select(g,D=[]){if(S.selected.value=g.length===1?g[0]:0,S.partner.value=D.length===1?D[0]:0,S.groupedSelection.value=g.length>1||D.length>1,S.groupedSelection.value){w.fill(0);for(let U of D)w[U]=2;for(let U of g)w[U]=1;b.needsUpdate=!0}ue()},hideContext(g){S.hideContext.value=g,ue()},dispose(){_=!0,d&&cancelAnimationFrame(d),A.disconnect(),lt.disconnect(),a.dispose(),s.removeEventListener("pointerdown",it),s.removeEventListener("pointerup",ut),s.removeEventListener("keydown",k),s.removeEventListener("webglcontextlost",Tt);for(let g of v)g.dispose();We.dispose(),n.dispose(),n.forceContextLoss(),s.remove()}}}function Pd(i,e,t){let n=document.createElement("canvas"),s=n.getContext("2d");if(!s)throw Error("\u6B64\u73AF\u5883\u65E0\u6CD5\u7ED8\u5236\u5DE5\u533A\u56FE\u9762");n.tabIndex=0,n.setAttribute("aria-label","\u5DE5\u533A\u4E8C\u7EF4\u603B\u5E73\u9762\u56FE"),i.appendChild(n);let{tubeCoords:r,tubeOwners:a,faceCoords:o,faceOwners:c,arcCoords:l,arcOwners:u,arcExtents:f}=e;function h(he){let Ie=Array.from({length:2},()=>({trace:new Path2D,fill:new Path2D}));for(let q=0;q<a.length;q++){let O=a[q],z=9*q;if(he&&!he.has(O))continue;let j=Ie[O?1:0].trace,se=r[z+2],oe=r[z+3],ue=r[z+5],me=r[z+6];j.moveTo(se,oe),j.lineTo(ue,me),se===ue&&oe===me&&(j.moveTo(se+r[z+8],oe),j.arc(se,oe,r[z+8],0,Math.PI*2))}for(let q=0;q<u.length;q++){let O=u[q],z=13*q;if(he&&!he.has(O))continue;let j=new Path2D,se=l[z+11];j.arc(0,0,1,0,se,se<0),Ie[O?1:0].trace.addPath(j,new DOMMatrix([l[z+5],l[z+6],l[z+8],l[z+9],l[z+2],l[z+3]]))}for(let q=0;q<c.length;q+=3){let O=c[q],z=3*q;if(he&&!he.has(O))continue;let j=Ie[O?1:0].fill;j.moveTo(o[z],o[z+1]),j.lineTo(o[z+3],o[z+4]),j.lineTo(o[z+6],o[z+7]),j.closePath()}return Ie}let d=h(0),_=null,y=null,x=!1,p=0,C=!1,w=1,b=0,S=0,v=0,M=0,m=1,T=e.bounds;function P(he){return[(he[0]-v)/m+b/2,(M-he[1])/m+S/2,0]}function I(){if(C||!b||!S||!i.clientWidth)return;let[he,Ie]=T;m=Math.max((Ie[0]-he[0])/b,(Ie[1]-he[1])/S,1e-8)*1.12/w;let q=n.width/b,O=document.documentElement.classList.contains("dark-mode");s.setTransform(1,0,0,1,0,0),s.clearRect(0,0,n.width,n.height),s.setTransform(q/m,0,0,-q/m,(b/2-v/m)*q,(S/2+M/m)*q);for(let z=0;z<d.length;z++)x&&!z||(s.fillStyle=z?O?"#75acbc":"#456d7c":O?"#6c7278":"#aeb9bd",s.fill(d[z].fill),s.strokeStyle=s.fillStyle,s.lineWidth=m,s.stroke(d[z].trace));for(let[z,j]of[[_,O?"#ffb840":"#dd640d"],[y,"#9361dc"]])z&&(s.fillStyle=s.strokeStyle=j,s.fill(z.fill),s.lineWidth=2*m,s.stroke(z.trace));t.onDraw(m,P,b,S)}function L(){!C&&!p&&(p=requestAnimationFrame(()=>{p=0,I()}))}function N(){let he=i.clientWidth,Ie=i.clientHeight;if(!he||!Ie)return;let q=Math.min(window.devicePixelRatio||1,2);b=he,S=Ie,n.width=Math.round(b*q),n.height=Math.round(S*q),L()}function V(he){T=he,v=(he[0][0]+he[1][0])/2,M=(he[0][1]+he[1][1])/2,w=1,L()}function F(he,Ie=b/2,q=S/2){let O=Math.min(1e7,Math.max(.02,w*he)),z=m*w/O;v+=(Ie-b/2)*(m-z),M-=(q-S/2)*(m-z),w=O,L()}function X(he){he.preventDefault();let Ie=n.getBoundingClientRect();F(Math.exp(-Math.max(-300,Math.min(300,he.deltaY))*.002),he.clientX-Ie.left,he.clientY-Ie.top)}let H=null;function $(he){he.isPrimary&&he.button===0&&(H=[he.clientX,he.clientY,v,M],n.setPointerCapture(he.pointerId))}function Q(he){!H||!he.isPrimary||(v=H[2]-(he.clientX-H[0])*m,M=H[3]+(he.clientY-H[1])*m,L())}function de(he){if(!H||!he.isPrimary)return;let Ie=Math.hypot(H[0]-he.clientX,H[1]-he.clientY)<4;if(H=null,!Ie)return;let q=n.getBoundingClientRect(),O=v+(he.clientX-q.left-b/2)*m,z=M-(he.clientY-q.top-S/2)*m,j=6*m,se=0;for(let oe=0;oe<a.length;oe++){let ue=a[oe],me=9*oe;if(!ue)continue;let pe=r[me+2],_e=r[me+3],ee=r[me+5]-pe,Me=r[me+6]-_e,We=r[me+8],Ke=j+We;if(O<Math.min(pe,pe+ee)-Ke||O>Math.max(pe,pe+ee)+Ke||z<Math.min(_e,_e+Me)-Ke||z>Math.max(_e,_e+Me)+Ke)continue;let Xe=Math.max(0,Math.min(1,((O-pe)*ee+(z-_e)*Me)/(ee*ee+Me*Me||1))),it=Math.max(0,Math.hypot(O-pe-Xe*ee,z-_e-Xe*Me)-We);it<j&&(se=ue,j=it)}for(let oe=0;oe<u.length&&j>0;oe++){let ue=u[oe],me=13*oe,pe=6*oe;if(!ue||O<f[pe]-j||O>f[pe+3]+j||z<f[pe+1]-j||z>f[pe+4]+j)continue;let _e=Ds(Li(l,me),l[me+11],m),ee,Me;Qo(l,me,_e,(We,Ke,Xe,it)=>{if(it){let ut=We-ee,k=Ke-Me,Tt=Math.max(0,Math.min(1,((O-ee)*ut+(z-Me)*k)/(ut*ut+k*k||1))),lt=Math.max(0,Math.hypot(O-ee-Tt*ut,z-Me-Tt*k)-l[me+12]);lt<j&&(j=lt,se=ue)}ee=We,Me=Ke})}if(!se)for(let oe=0;oe<c.length;oe+=3){let ue=c[oe],me=3*oe;if(!ue)continue;let pe=o[me],_e=o[me+1],ee=o[me+3]-pe,Me=o[me+4]-_e,We=o[me+6]-pe,Ke=o[me+7]-_e,Xe=ee*Ke-Me*We;if(!Xe)continue;let it=((O-pe)*Ke-(z-_e)*We)/Xe,ut=(ee*(z-_e)-Me*(O-pe))/Xe;it>=0&&ut>=0&&it+ut<=1&&(se=ue)}se&&t.onPick(e.owners[se].key)}function fe(he){if(he.key==="Home")t.onFit();else if(he.key==="+"||he.key==="=")F(1.6);else if(he.key==="-")F(1/1.6);else if(he.key==="ArrowLeft")v-=m*b*.15;else if(he.key==="ArrowRight")v+=m*b*.15;else if(he.key==="ArrowUp")M+=m*S*.15;else if(he.key==="ArrowDown")M-=m*S*.15;else return;he.preventDefault(),L()}n.addEventListener("pointerdown",$),n.addEventListener("pointermove",Q),n.addEventListener("pointerup",de),n.addEventListener("pointercancel",()=>{H=null}),n.addEventListener("wheel",X,{passive:!1}),n.addEventListener("keydown",fe);let ge=new ResizeObserver(N),ze=new MutationObserver(L);return ge.observe(i),ze.observe(document.documentElement,{attributes:!0,attributeFilter:["class"]}),N(),V(T),{fit:V,zoom:F,setMode(){},refresh:L,select(he,Ie=[]){_=he.length?h(new Set(he))[1]:null,y=Ie.length?h(new Set(Ie))[1]:null,L()},hideContext(he){x=he,L()},dispose(){C=!0,p&&cancelAnimationFrame(p),ge.disconnect(),ze.disconnect(),n.remove()}}}var we=window.QwenPaw.host.React,Id=i=>i?.tag||i?.name||(i?i.tree+":"+i.node:""),Rd=i=>i&&[i.tree,i.node];function $c(i,e){return!i||!e?i||e:[i[0].map((t,n)=>Math.min(t,e[0][n])),i[1].map((t,n)=>Math.max(t,e[1][n]))]}function Ld(i,e,t){let n=i?.idFor(t);if(n)return{ids:[n],bounds:i.owners[n].bounds};let s=i&&t&&e?.assetChildren?.find(r=>r.tree===t[0]&&r.node===t[1]);if(s){let r=s.children.map(a=>i.idFor([s.tree,a])).filter(Boolean);if(r.length)return{ids:r,bounds:Qi(s.bounds)?s.bounds:r.reduce((a,o)=>$c(a,i.owners[o].bounds),null),children:!0}}return{ids:[],bounds:null}}function Kc(i,e){return i?e.children?"\uFF08\u6309 "+e.ids.length+" \u4E2A\u88C5\u914D\u5B50\u4EF6\u5B9A\u4F4D\uFF09":e.bounds?"":"\uFF08\u65E0\u88C5\u914D\u51E0\u4F55\uFF09":""}function B_(i,e,t){if(!i||!Number.isFinite(e)||e<=0)return;let n=10**Math.floor(Math.log10(96*e)),s=([5,2,1].find(r=>r*n<=96*e)??1)*n;i.style.width=s/e+"px",i.textContent=Number(s.toPrecision(4)).toLocaleString(void 0,{maximumSignificantDigits:4})+(t?" "+t:"")}function k_(i){let e=(i?.groups||[]).filter(t=>t.name&&Qi(t.bounds));return e.length?e:(i?.trees||[]).filter(t=>t.name&&Qi(t.bounds))}function Nd(i){return i.replace(/\.(?:rvm|wlkx)$/i,"").replace(/^\d+[-_]/,"").replace(/^(NG\d+)-(?=\d+号)/i,"").replace(/-逆向建模$/,"").replace(/^注采单井|^注采平台井/,"")}function z_(i,e,t,n,s){let r=[];for(let[a,o]of i){if(!a)continue;let[c,l]=o.bounds,u=c.map((C,w)=>(C+l[w])/2),[f,h,d]=e(u),_=Math.min(136,Math.max(54,Nd(o.name).length*11+10)),y=f+4,x=h-20,p=[y,x,y+_,x+19];if(d<-1||d>1||y<3||x<3||p[2]>t-4||p[3]>n-32||r.length>=9||Math.max(l[0]-c[0],l[1]-c[1])/s>Math.max(t,n)*1.35||r.some(C=>p[0]<C[2]+6&&p[2]>C[0]-6&&p[1]<C[3]+4&&p[3]>C[1]-4)){a.hidden=!0;continue}a.hidden=!1,a.style.left=y+"px",a.style.top=x+"px",r.push(p)}}function Dd({active:i,api:e,info:t,selected:n,selectedName:s,pair:r,onPick:a,onInspect:o,plotActions:c,focusRequest:l=0}){let[u,f]=we.useState(null),[h,d]=we.useState("plan"),[_,y]=we.useState(""),[x,p]=we.useState(""),[C,w]=we.useState(!1),[b,S]=we.useState("all"),[v,M]=we.useState(!0),[m,T]=we.useState(0),[P,I]=we.useState(i),[L,N]=we.useState(!0),V=we.useRef(null),F=we.useRef(null),X=we.useRef([]),H=we.useRef(null),$=we.useRef(0),Q=t.scene,de=we.useMemo(()=>k_(Q),[Q]),fe=we.useMemo(()=>Ld(u,Q,r?Rd(r.owner):n),[u,Q,r,n]),ge=we.useMemo(()=>Ld(u,Q,Rd(r?.target)),[u,Q,r]),ze=we.useMemo(()=>{let j=new Set(de.map(ue=>ue.parent).filter(Boolean)),se=ue=>Math.max(ue[1][0]-ue[0][0],ue[1][1]-ue[0][1]),oe=Qi(Q?.bounds)?se(Q.bounds):0;return de.map((ue,me)=>({g:ue,i:me})).filter(({g:ue})=>!j.has(ue.id)||/集注站\.wlkx$/i.test(ue.name)&&se(ue.bounds)<oe/3).sort((ue,me)=>(me.g.segments??0)-(ue.g.segments??0)).slice(0,120)},[de,Q]),he=we.useRef({});he.current={onPick:a,main:fe,partner:ge,mode:h,labels:v,context:L,candidates:ze,regions:de,frameName:b};let Ie=Q&&Q.available!==!1&&(Q.segments||0)+(Q.triangles||0)+(Q.arcs||0)>0;we.useEffect(()=>{i&&I(!0)},[i]),we.useEffect(()=>{if(!P||!Ie)return;let j=new AbortController,se=!0;return f(null),y(""),e("/scene?revision="+encodeURIComponent(t.revision),{signal:j.signal},!0).then(oe=>{se&&f(bd(oe))}).catch(oe=>{se&&y(oe.message)}),()=>{se=!1,j.abort()}},[e,t.revision,P,Ie,m]);function q(){S("all"),u&&H.current?.fit(u.bounds)}function O(j){if(j==="all"){q();return}let se=de[Number(j)];se&&(H.current?.fit(se.bounds),S(String(j)))}function z(){let j=$c(fe.bounds,ge.bounds);j&&(H.current?.fit(j),S("picked"))}return we.useEffect(()=>()=>{H.current?.dispose(),H.current=null},[u,t.unit]),we.useEffect(()=>{if(!i||!u||!V.current)return;if(H.current){H.current.refresh();return}p("");let j={onPick:_e=>he.current.onPick(_e),onFit:()=>{H.current?.fit(u.bounds),S("all")},onLost:()=>p("\u56FE\u5F62\u4E0A\u4E0B\u6587\u5DF2\u4E2D\u65AD\uFF0C\u8BF7\u91CD\u65B0\u8F7D\u5165\u56FE\u9762\u3002"),onDraw:(_e,ee,Me,We)=>{B_(F.current,_e,t.unit),he.current.labels&&z_(he.current.candidates.map(({g:Ke},Xe)=>[X.current[Xe],Ke]),ee,Me,We,_e)}},se,oe=!1;try{se=Cd(V.current,u,j)}catch{try{se=Pd(V.current,u,j),oe=!0}catch{p("\u5F53\u524D\u73AF\u5883\u65E0\u6CD5\u7ED8\u5236\u5DE5\u533A\u573A\u666F\uFF0C\u53EF\u5728\u5BF9\u8C61\u76EE\u5F55\u4E2D\u67E5\u9605\u8FDE\u63A5\u8BB0\u5F55\u3002");return}}H.current=se,w(oe);let ue=he.current,me=oe?"plan":ue.mode;oe&&d("plan"),se.setMode(me),se.hideContext(!ue.context),se.select(ue.main.ids,ue.partner.ids);let pe=ue.frameName==="picked"?$c(ue.main.bounds,ue.partner.bounds):ue.regions[Number(ue.frameName)]?.bounds;pe&&se.fit(pe)},[u,i,t.unit]),we.useEffect(()=>{H.current?.setMode(h)},[h]),we.useEffect(()=>{H.current?.select(fe.ids,ge.ids)},[fe,ge]),we.useEffect(()=>{H.current?.hideContext(!L)},[L]),we.useEffect(()=>{!i||!H.current||!u||!l||$.current===l||($.current=l,z())},[i,u,l,fe,ge]),we.useEffect(()=>{if(v)H.current?.refresh();else for(let j of X.current)j&&(j.hidden=!0)},[v]),we.createElement("section",{className:"sn-panel sn-assembly","aria-label":"\u5DE5\u533A\u603B\u56FE",hidden:!i},we.createElement("header",{className:"sn-assembly-head"},we.createElement("div",{className:"sn-tabs",role:"group","aria-label":"\u5DE5\u533A\u89C6\u56FE"},we.createElement("button",{"aria-pressed":h==="plan",onClick:()=>d("plan")},we.createElement(je,{name:"diagram"}),"\u4E8C\u7EF4\u603B\u5E73"),we.createElement("button",{"aria-pressed":h==="spatial",disabled:C,title:C?"\u5F53\u524D\u8BBE\u5907\u672A\u542F\u7528 WebGL 2":void 0,onClick:()=>d("spatial")},we.createElement(je,{name:"cube"}),"\u4E09\u7EF4\u5168\u8C8C")),Ie&&we.createElement("div",{className:"sn-assembly-tools"},!!de.length&&we.createElement("label",null,"\u5B9A\u4F4D\u8303\u56F4",we.createElement("select",{"aria-label":"\u5DE5\u533A\u5B9A\u4F4D\u8303\u56F4",value:b,onChange:j=>O(j.target.value)},we.createElement("option",{value:"all"},"\u5168\u5DE5\u533A"),b==="picked"&&we.createElement("option",{value:"picked"},r?"\u5173\u7CFB\u4E24\u7AEF":"\u9009\u4E2D\u5BF9\u8C61"),de.map((j,se)=>we.createElement("option",{key:se,value:se},j.name)))),we.createElement("button",{disabled:!u,onClick:q},we.createElement(je,{name:"expand"}),"\u9002\u5408\u5168\u56FE"),c)),Ie?we.createElement(we.Fragment,null,we.createElement("div",{className:"sn-assembly-stage"},we.createElement("div",{className:"sn-assembly-canvas",ref:V}),we.createElement("div",{className:"sn-assembly-labels",hidden:!v||!!_||!!x},ze.map(({g:j,i:se},oe)=>we.createElement("button",{key:se,ref:ue=>{X.current[oe]=ue},hidden:!0,title:j.name,"aria-label":"\u5B9A\u4F4D\u5206\u533A "+j.name,onClick:()=>O(se)},Nd(j.name)))),_||x?we.createElement("div",{className:"sn-assembly-state",role:"alert"},we.createElement("p",null,_||x),we.createElement("button",{onClick:()=>{p(""),T(j=>j+1)}},"\u91CD\u65B0\u8F7D\u5165\u56FE\u9762")):u?we.createElement(we.Fragment,null,we.createElement("div",{className:"sn-assembly-scale",ref:F,"aria-label":"\u6BD4\u4F8B\u5C3A"}),we.createElement("div",{className:"sn-zoom",role:"group","aria-label":"\u5DE5\u533A\u7F29\u653E"},we.createElement("button",{"aria-label":"\u7F29\u5C0F\u5DE5\u533A\u56FE",onClick:()=>H.current?.zoom(1/1.6)},we.createElement(je,{name:"minus"})),we.createElement("button",{"aria-label":"\u653E\u5927\u5DE5\u533A\u56FE",onClick:()=>H.current?.zoom(1.6)},we.createElement(je,{name:"plus"})))):we.createElement("div",{className:"sn-assembly-state",role:"status"},"\u6B63\u5728\u8BFB\u53D6\u5168\u7AD9\u88C5\u914D\u2026")),we.createElement("div",{className:"sn-assembly-strip"},we.createElement("div",{className:"sn-assembly-tools"},we.createElement("label",null,we.createElement("input",{type:"checkbox",checked:L,onChange:j=>N(j.target.checked)}),"\u80CC\u666F\u6784\u4EF6"),!!de.length&&we.createElement("label",null,we.createElement("input",{type:"checkbox",checked:v,onChange:j=>M(j.target.checked)}),"\u5206\u533A\u6807\u6CE8")),we.createElement("span",null,C?"\u4E8C\u7EF4\u7EBF\u6846 \xB7 ":h==="plan"?"XY \u5E73\u9762 \xB7 ":"Z \u5411\u4E0A \xB7 ",h==="plan"?"\u62D6\u52A8\u5E73\u79FB":"\u62D6\u52A8\u65CB\u8F6C\uFF0C\u53F3\u952E\u5E73\u79FB"," \xB7 \u6EDA\u8F6E\u7F29\u653E")),r?we.createElement("div",{className:"sn-pair-legend","aria-label":"\u56FE\u4E0A\u5BF9\u7167"},we.createElement("strong",null,r.label," \xB7"," ",r.status==="candidate"?"\u5F85\u6838\u5BF9":"\u56FE\u4E0A\u5BF9\u7167"),we.createElement("span",{className:"sn-owner-a"},Id(r.owner),Kc(u,fe)),we.createElement("span",{className:"sn-owner-b"},Id(r.target),Kc(u,ge)),we.createElement("button",{disabled:!fe.bounds&&!ge.bounds,onClick:z},"\u5B9A\u4F4D\u4E24\u7AEF")):n&&we.createElement("div",{className:"sn-pair-legend"},we.createElement("span",{className:"sn-owner-a"},"\u5DF2\u9009\u5BF9\u8C61\u3000",s||n.join(" / "),Kc(u,fe)),we.createElement("button",{disabled:!fe.bounds,onClick:z},"\u5B9A\u4F4D\u9009\u4E2D\u5BF9\u8C61"),we.createElement("button",{onClick:o},"\u67E5\u770B\u5BF9\u8C61\u8D44\u6599"))):we.createElement("div",{className:"sn-assembly-state sn-assembly-missing"},we.createElement("h3",null,"\u5DE5\u533A\u7F3A\u5C11\u88C5\u914D\u51E0\u4F55"),we.createElement("p",null,Q?.requiresSource?"\u6B64\u5DE5\u533A\u7531\u65E7\u7248\u5BFC\u5165\u3002\u91CD\u65B0\u9009\u62E9\u539F WLKX \u6216\u540C\u7EC4 data.db\u3001model.package \u5E76\u5BFC\u5165\uFF0C\u5373\u53EF\u751F\u6210\u603B\u56FE\u3002":"\u53EF\u9009\u62E9\u5E26\u88C5\u914D\u51E0\u4F55\u7684 WLKX\uFF0C\u6216\u540C\u65F6\u9009\u62E9\u540C\u4E00\u5DE5\u533A\u7684 data.db \u4E0E model.package\u3002")))}var Ud=`.sn-ez[hidden],
.sn-ez .sn-project-views[hidden],
.sn-ez .sn-ez-columns[hidden],
.sn-overview-grid[hidden],
.sn-assembly[hidden] {
  display: none;
}
.sn-overview-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) clamp(215px, 22%, 285px);
  gap: 12px;
  align-items: stretch;
  margin-top: 12px;
}
.sn-assembly {
  min-width: 0;
  align-self: start;
}
.sn-assembly-head,
.sn-assembly-strip,
.sn-pair-legend,
.sn-assembly-tools,
.sn-related header,
.sn-related li > div {
  display: flex;
  align-items: center;
  gap: 8px;
}
.sn-assembly-head,
.sn-assembly-strip {
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 8px 11px;
  border-bottom: 1px solid var(--sn-line);
}
.sn-assembly-head .sn-tabs,
.sn-assembly-head .sn-tabs button {
  flex-shrink: 0;
}
.sn-assembly-tools {
  flex-wrap: wrap;
}
.sn-assembly-tools label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--sn-muted);
  font-size: var(--sn-caption);
}
.sn-assembly-tools input {
  margin: 0;
  accent-color: var(--sn-accent);
}
.sn-assembly-tools button,
.sn-ez .sn-actions > button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.sn-assembly-tools select {
  max-width: clamp(124px, 16vw, 260px);
}
.sn-assembly-stage {
  position: relative;
  height: clamp(350px, 47vh, 660px);
  min-width: 0;
  overflow: hidden;
  background: var(--sn-sheet);
}
.sn-assembly-canvas,
.sn-assembly-canvas canvas,
.sn-assembly-labels {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}
.sn-assembly-canvas canvas {
  touch-action: none;
  cursor: grab;
  outline-offset: -3px;
}
.sn-assembly-canvas canvas:active {
  cursor: grabbing;
}
.sn-assembly-labels {
  pointer-events: none;
  overflow: hidden;
}
.sn-app .sn-assembly-labels button {
  position: absolute;
  min-height: 17px;
  max-width: 136px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  pointer-events: auto;
  padding: 1px 5px;
  line-height: 1.3;
  border-radius: 3px;
  color: var(--sn-draw-ink);
  background: var(--sn-card);
  font-size: var(--sn-caption);
}
.sn-assembly-scale {
  position: absolute;
  bottom: 10px;
  left: 12px;
  min-height: 15px;
  min-width: 10px;
  border: solid var(--sn-muted);
  border-width: 0 1px 1px;
  color: var(--sn-muted);
  font: var(--sn-caption) / 1.1 var(--sn-mono);
  text-align: center;
  pointer-events: none;
  background: color-mix(in srgb, var(--sn-sheet) 80%, transparent);
}
.sn-assembly-state {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  gap: 10px;
  text-align: center;
  color: var(--sn-muted);
  font-size: var(--sn-secondary);
}
.sn-assembly-missing {
  position: static;
  min-height: 230px;
}
.sn-assembly-strip {
  border-bottom: 0;
  border-top: 1px solid var(--sn-line);
  font-size: var(--sn-caption);
  color: var(--sn-muted);
}
.sn-pair-legend {
  flex-wrap: wrap;
  border-top: 1px solid var(--sn-line);
  padding: 6px 11px;
  color: var(--sn-muted);
  font-size: var(--sn-caption);
}
.sn-pair-legend strong {
  color: var(--sn-ink);
}
.sn-pair-legend button,
.sn-related button:not(.sn-table-link) {
  min-height: 24px;
  padding: 2px 6px;
  font-size: var(--sn-caption);
}
.sn-owner-a::before,
.sn-owner-b::before {
  content: "";
  display: inline-block;
  width: 7px;
  height: 7px;
  margin-right: 5px;
  border-radius: 50%;
  background: #e77428;
}
.sn-owner-b::before {
  background: #9463db;
}
.sn-extent-spec {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: baseline;
  gap: 0 8px;
  padding: 8px 13px;
  font-size: var(--sn-secondary);
}
.sn-extent-spec dt,
.sn-extent-spec dd {
  margin: 0;
  padding: 5px 0;
  overflow-wrap: anywhere;
}
.sn-extent-spec dt {
  color: var(--sn-muted);
}
.sn-extent-spec dd {
  text-align: right;
}
.sn-overview-aside {
  max-height: clamp(422px, calc(47vh + 112px), 775px);
  overflow: auto;
}
.sn-overview-aside .sn-pane-head {
  flex-wrap: wrap;
}
.sn-overview-aside .sn-pane-head > code {
  max-width: 100%;
}
.sn-overview-aside .sn-empty {
  padding-top: 8px;
}
.sn-related {
  padding: 8px 12px;
  border-block: 1px solid var(--sn-rule);
  font-size: var(--sn-secondary);
}
.sn-related header,
.sn-related li > div {
  justify-content: space-between;
}
.sn-related h4 {
  font-size: var(--sn-secondary);
}
.sn-related header small {
  margin-left: 3px;
}
.sn-relation-note {
  margin: 8px 12px 0;
  font-size: var(--sn-caption);
  color: var(--sn-muted);
}
.sn-related ul {
  list-style: none;
  padding: 0;
  margin: 4px 0 0;
}
.sn-related li {
  padding: 6px 0;
  border-top: 1px solid var(--sn-rule);
  min-width: 0;
}
.sn-related li > div {
  align-items: baseline;
  gap: 4px;
  flex-wrap: wrap;
}
.sn-related li > div > span {
  min-width: 0;
  overflow-wrap: anywhere;
}
.sn-related-role,
.sn-related small {
  display: inline-block;
  color: var(--sn-muted);
  font-size: var(--sn-caption);
}
.sn-related p {
  color: var(--sn-muted);
  font-size: var(--sn-caption);
  padding: 7px 0;
}
.sn-relations {
  margin-top: 12px;
}
.sn-relations .sn-ez-controls .sn-search {
  max-width: 360px;
}
.sn-relation-scroll {
  overflow: auto;
  max-height: 315px;
}
.sn-relation-scroll table {
  min-width: 695px;
}
.sn-relation-scroll small {
  display: block;
  color: var(--sn-muted);
}
.sn-relation-scroll details {
  max-width: 260px;
}
.sn-relation-scroll summary {
  white-space: nowrap;
}
.sn-relation-scroll details span {
  display: block;
  overflow-wrap: anywhere;
  font-size: var(--sn-caption);
}
.sn-relation-scroll .sn-table-link {
  white-space: normal;
}
@container sn-workbench (max-width:970px) {
  .sn-overview-grid {
    grid-template-columns: minmax(0, 1fr) 206px;
    gap: 8px;
  }
  .sn-assembly-tools select {
    max-width: 175px;
  }
}
@container sn-workbench (max-width:740px) {
  .sn-overview-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .sn-overview-aside {
    max-height: 360px;
  }
  .sn-assembly-stage {
    height: clamp(290px, 55cqw, 400px);
  }
}
@container sn-workbench (max-width:460px) {
  .sn-assembly-head {
    padding: 7px 8px;
  }
  .sn-assembly-tools {
    gap: 5px;
  }
  .sn-assembly-tools select {
    max-width: 150px;
  }
  .sn-assembly-strip {
    gap: 3px;
  }
  .sn-relations .sn-ez-controls select {
    max-width: 46%;
  }
}
`;var nl=window.QwenPaw,re=nl.host.React;function H_({points:i,onSelect:e}){let t=i.map(l=>l[3]),n=i.map(l=>l[4]),s=Math.min(...t),r=Math.max(...t),a=Math.min(...n),o=Math.max(...n),c=Math.min(660/Math.max(r-s,1),260/Math.max(o-a,1));return re.createElement("details",null,re.createElement("summary",null,"\u4E95\u4F4D\u5750\u6807\u56FE\uFF08",i.length," \u4E2A\u5BF9\u8C61\uFF09"),re.createElement("svg",{className:"sn-ez-wells",viewBox:"0 0 720 304","aria-label":"\u539F\u59CB\u5927\u5730\u5750\u6807\u5E73\u9762\u56FE"},re.createElement("text",{x:"10",y:"18"},"\u7EB5\u8F74 Y \xB7 \u6A2A\u8F74 X"),i.map(([l,u,f,h,d])=>re.createElement("g",{key:l+":"+u,role:"button",tabIndex:"0","aria-label":f+" "+l+":"+u,onClick:()=>e([l,u]),onKeyDown:_=>{(_.key==="Enter"||_.key===" ")&&(_.preventDefault(),e([l,u]))}},re.createElement("title",null,f," \xB7 X ",h," \xB7 Y ",d),re.createElement("circle",{cx:30+(h-s)*c,cy:284-(d-a)*c,r:"5",className:"sn-well-point"})))))}function Fd({files:i,onFiles:e,agentId:t,model:n,apply:s,page:r,onPageChange:a,onProjectChange:o,initialInfo:c,visible:l=!0,plotActions:u}){let[f,h]=re.useState("overview"),[d,_]=re.useState(c),[y,x]=re.useState(""),[p,C]=re.useState(""),[w,b]=re.useReducer(A=>A+1,0),[S,v]=re.useState(!1),[M,m]=re.useState(""),[T,P]=re.useState(""),[I,L]=re.useState(0),[N,V]=re.useState(null),[F,X]=re.useState(null),[H,$]=re.useState(null),[Q,de]=re.useState(null),[fe,ge]=re.useReducer(A=>A+1,0),[ze,he]=re.useState("project"),Ie=re.useRef(null),q=re.useRef(0),O=re.useRef(0),z=re.useRef(null),j=re.useRef(null),se=re.useRef(!1),oe=re.useRef(o),ue=re.useRef(l);ue.current=l,oe.current=o;let me=r??f,pe=me==="overview",_e=A=>{h(A),a?.(A)},ee=re.useCallback(A=>{A?.join(":")!==z.current?.join(":")&&$(null),z.current=A,X(A),de(null),A||he("project")},[]),Me=re.useCallback(async(A,g,D=!1)=>{if(!nl.host.fetch)throw Error("\u8BF7\u5728 UGSci \u8F6F\u4EF6\u5185\u6253\u5F00 eZWalker \u5DE5\u533A");let U="/surface-network/ezwalker"+A+(A.includes("?")?"&":"?")+"agent_id="+encodeURIComponent(t),W=await nl.host.fetch(U,g);if(!W.ok){let ie=await W.json().catch(()=>({}));throw W.status===409&&!g?.signal?.aborted&&!se.current&&(se.current=!0,_(void 0),ee(null),$(null),V(null),b()),Error(W.status===409?"\u5DE5\u533A\u7248\u672C\u5DF2\u66F4\u65B0\uFF0C\u6B63\u5728\u8BFB\u53D6\u5F53\u524D\u5DE5\u533A\u3002\u8BF7\u6838\u5BF9\u6587\u4EF6\u540E\u518D\u5BFC\u5165\u3002":typeof ie.detail=="string"?ie.detail:"\u5DE5\u533A\u670D\u52A1\u9519\u8BEF "+W.status)}return D?W.arrayBuffer():W.json()},[t,ee]);re.useEffect(()=>()=>{q.current++},[t]);let We=c?.revision,Ke=c!==void 0;re.useEffect(()=>{if(w===0&&c!==void 0){_(c);return}let A=!0,g=O.current,D=new AbortController;return C(""),Me("",{signal:D.signal}).then(U=>{A&&g===O.current&&(_(U),oe.current?.(U),se.current=!1)}).catch(U=>{A&&g===O.current&&C(U.message)}),()=>{A=!1,D.abort()}},[Me,w,We,Ke]),re.useEffect(()=>{if(!d||pe||!l)return;let A=!0,g=new AbortController;V(null);let D=setTimeout(()=>Me("/objects?"+new URLSearchParams({q:M,kind:T,page:I,revision:d.revision}),{signal:g.signal}).then(U=>{A&&(V(U),z.current||ee(U.rows[0]?.slice(0,2)??null))}).catch(U=>{A&&x(U.message)}),M?120:0);return()=>{A=!1,g.abort(),clearTimeout(D)}},[d,M,T,I,pe,l,Me,ee]),re.useEffect(()=>{let A=!0,g=new AbortController;return $(null),F&&d&&Me("/object/"+F.join("/")+"?revision="+encodeURIComponent(d.revision),{signal:g.signal}).then(D=>{A&&$(D)}).catch(D=>{A&&x(D.message)}),()=>{A=!1,g.abort()}},[F,d,Me]);function Xe(A){if(!A.owner||!A.target)return;let g=[A.owner.tree,A.owner.node];z.current=g,X(g),de(A),_e("overview"),ge(),it()}function it(){requestAnimationFrame(()=>{let A=Ie.current?.closest(".sn-content");A&&(A.scrollTop=0)})}function ut(){_e("overview"),ge(),it()}function k(){he("object"),requestAnimationFrame(()=>j.current?.scrollIntoView({block:"start"}))}async function Tt(){let A=++q.current;v(!0),x("");try{let g=new FormData;i.forEach(W=>g.append("files",W));let D=d?.revision?"?expected_revision="+encodeURIComponent(d.revision):"",U=await Me(D,{method:"POST",body:g});if(A!==q.current)return;if(U.projectOnly){x("WLP \u5F15\u7528 "+(U.references.join("\u3001")||"\uFF08\u65E0\u6A21\u578B\uFF09")+"\u3002\u8BF7\u9009\u62E9\u5BF9\u5E94 WLKX\u3002");return}O.current++,_(U),oe.current?.(U),ue.current&&_e("overview"),m(""),P(""),L(0),ee(null),x("\u5DF2\u4FDD\u5B58\u5230\u672C\u673A\u5DE5\u533A"),e([])}catch(g){A===q.current&&x(g.message)}finally{A===q.current&&v(!1)}}let lt={info:d,item:H,selected:F,model:n,apply:s,onShowObject:()=>_e("objects"),onShowLocation:ut,onShowAll:k,onPick:ee,onPair:Xe};return re.createElement("section",{className:"sn-ez","aria-label":"eZWalker \u5DE5\u533A",hidden:!l},re.createElement("style",null,Ud),re.createElement("header",{className:"sn-page-head"},re.createElement("div",null,re.createElement("div",{className:"sn-context"},re.createElement(je,{name:"folder"}),pe&&d?"\u5DE5\u7A0B\u56FE\u7EB8":"\u5DE5\u7A0B\u8D44\u6599"),re.createElement("h2",null,pe&&d?"\u5DE5\u533A\u603B\u56FE":"eZWalker \u5DE5\u533A")),re.createElement("div",{className:"sn-actions"},d&&re.createElement("button",{onClick:()=>_e(pe?"objects":"overview")},re.createElement(je,{name:pe?"table":"diagram"}),pe?"\u6253\u5F00\u5BF9\u8C61\u76EE\u5F55":"\u8FD4\u56DE\u5DE5\u533A\u603B\u56FE"),re.createElement("input",{type:"file",hidden:!0,multiple:!0,"aria-label":"eZWalker \u6587\u4EF6",ref:Ie,accept:".wlkx,.wlp,.db,.package",onChange:A=>{e(Array.from(A.target.files)),A.target.value=""}}),re.createElement("button",{disabled:S,onClick:()=>Ie.current.click()},re.createElement(je,{name:"folder"}),"\u9009\u62E9\u5DE5\u533A\u6587\u4EF6"),i.length>0&&re.createElement("button",{className:"sn-primary",disabled:S||d===void 0&&!i.every(A=>/\.wlp$/i.test(A.name)),onClick:Tt},re.createElement(je,{name:"upload"}),S?"\u6B63\u5728\u8BFB\u53D6\u6A21\u578B\u2026":d?"\u66FF\u6362\u5F53\u524D\u5DE5\u533A":"\u5BFC\u5165\u5DE5\u533A"))),i.length>0&&re.createElement("div",{className:"sn-staged"},re.createElement("span",null,"\u5F85\u5BFC\u5165\u3000",i.map(A=>A.name).join("\u3001")),re.createElement("button",{disabled:S,onClick:()=>e([])},"\u53D6\u6D88\u9009\u62E9")),y&&re.createElement("p",{className:"sn-notice",role:"status"},y),p&&!d&&re.createElement("div",{className:"sn-staged",role:"alert"},re.createElement("span",null,p),nl.host.fetch&&re.createElement("button",{disabled:S,onClick:b},"\u91CD\u65B0\u8BFB\u53D6\u5DE5\u533A")),d?re.createElement(re.Fragment,null,re.createElement("section",{className:"sn-project-strip","aria-label":"\u5DE5\u533A\u6982\u51B5"},re.createElement("div",{className:"sn-project-id"},re.createElement(je,{name:"folder"}),re.createElement("div",null,re.createElement("small",null,"\u5F53\u524D\u5DE5\u533A"),re.createElement("h3",null,d.name))),re.createElement("dl",null,[["\u5DE5\u7A0B\u5BF9\u8C61",d.objects],["\u5C5E\u6027\u5B57\u6BB5",d.fields],["\u53EF\u67E5\u5C40\u90E8\u9884\u89C8",d.geometryObjects]].map(([A,g])=>re.createElement("div",{key:A},re.createElement("dt",null,A),re.createElement("dd",null,g?.toLocaleString()??"\u2014"))))),re.createElement("div",{className:"sn-project-views",hidden:pe},d.views?.length>0&&re.createElement("span",null,"\u5DE5\u7A0B\u89C6\u70B9\u3000",d.views.join("\u3001")),d.wells?.length>0&&re.createElement(H_,{points:d.wells,onSelect:ee})),re.createElement("div",{className:"sn-overview-grid",hidden:!pe},re.createElement(Dd,{key:d.revision,active:l&&pe,api:Me,info:d,selected:F,selectedName:H?.attributes?.find(([A])=>A==="\u4F4D\u53F7")?.[1],pair:Q,onPick:ee,onInspect:()=>_e("objects"),focusRequest:fe,plotActions:u}),pe&&(F?re.createElement(Yc,{...lt,compact:!0}):re.createElement(Md,{info:d}))),re.createElement("div",{className:"sn-ez-columns",hidden:pe},re.createElement("section",{className:"sn-panel sn-object-list","aria-label":"\u5DE5\u7A0B\u5BF9\u8C61"},re.createElement("header",{className:"sn-pane-head"},re.createElement("h3",null,re.createElement(je,{name:"table"}),"\u5DE5\u7A0B\u5BF9\u8C61"),N&&re.createElement("small",null,N.count.toLocaleString()," \u9879")),re.createElement("div",{className:"sn-ez-controls"},re.createElement("label",{className:"sn-search"},re.createElement(je,{name:"search"}),re.createElement("input",{type:"search","aria-label":"\u67E5\u627E\u5DE5\u7A0B\u5BF9\u8C61",placeholder:"\u67E5\u4F4D\u53F7\u3001\u540D\u79F0\u6216\u5B89\u88C5\u5730\u70B9",value:M,onChange:A=>{ee(null),m(A.target.value),L(0)}})),re.createElement("select",{"aria-label":"\u5BF9\u8C61\u7C7B\u578B",value:T,onChange:A=>{ee(null),P(A.target.value),L(0)}},re.createElement("option",{value:""},"\u5168\u90E8\u7C7B\u578B"),(d.types||[]).filter(([A])=>A).map(([A,g])=>re.createElement("option",{key:A,value:A},A,"\uFF08",g,"\uFF09")))),re.createElement("div",{className:"sn-ez-scroll"},re.createElement("table",{"aria-label":"\u5DE5\u7A0B\u5BF9\u8C61\u76EE\u5F55"},re.createElement("thead",null,re.createElement("tr",null,re.createElement("th",{scope:"col"},"\u6E90\u4F4D\u53F7"),re.createElement("th",{scope:"col"},"\u540D\u79F0"),re.createElement("th",{scope:"col"},"\u7C7B\u578B"))),re.createElement("tbody",null,N?.rows.map(([A,g,D,U,W])=>re.createElement("tr",{key:A+":"+g,className:F?.[0]===A&&F?.[1]===g?"sel":"",onClick:()=>ee([A,g])},re.createElement("td",null,re.createElement("button",{className:"sn-table-link"},D||A+":"+g)),re.createElement("td",null,U),re.createElement("td",null,W))))),!N?.rows.length&&re.createElement("p",{className:"sn-empty",role:"status"},N?"\u6CA1\u6709\u5339\u914D\u7684\u5DE5\u7A0B\u5BF9\u8C61":"\u6B63\u5728\u8BFB\u53D6\u5BF9\u8C61\u76EE\u5F55\u2026")),re.createElement("div",{className:"sn-pager"},re.createElement("span",null,N?.count?"\u7B2C "+(I+1)+" / "+Math.ceil(N.count/50)+" \u9875":"\u2014"),re.createElement("div",{className:"sn-actions"},re.createElement("button",{disabled:!N||!I,onClick:()=>{ee(null),L(I-1)}},"\u4E0A\u4E00\u9875"),re.createElement("button",{disabled:!N||(I+1)*50>=N.count,onClick:()=>{ee(null),L(I+1)}},"\u4E0B\u4E00\u9875")))),!pe&&re.createElement(Yc,{...lt,compact:!1})),re.createElement(_d,{active:l,key:"relations-"+d.revision,api:Me,info:d,selected:F,onPick:A=>{ee(A),pe&&ge(),it()},onPair:Xe,scope:ze,setScope:he,tableRef:j})):re.createElement("section",{className:"sn-panel sn-ez-empty"},re.createElement(je,{name:"folder"}),re.createElement("h3",null,d===void 0&&!p?"\u6B63\u5728\u8BFB\u53D6\u672C\u673A\u5DE5\u533A\u2026":"\u5DE5\u533A\u6587\u4EF6"),re.createElement("p",null,"\u9009\u62E9 WLKX \u6A21\u578B\u53CA\u5BF9\u5E94\u7684 WLP \u5DE5\u7A0B\u6587\u4EF6\uFF0C\u4E5F\u53EF\u540C\u65F6\u9009\u62E9\u89E3\u5305\u540E\u7684 data.db \u4E0E model.package\u3002")))}var Fe=window.QwenPaw.host.React;function es(i){return Number.isFinite(i)?Number(i.toFixed(5)).toString():"\u2014"}function G_({model:i,c:e,selected:t,onPick:n}){let s=new Map(i.nodes.map(r=>[r.id,r.name]));return Fe.createElement("div",{className:"sn-scroll"},Fe.createElement("table",{className:"sn-pipe-table","aria-label":"\u7BA1\u6BB5\u660E\u7EC6"},Fe.createElement("thead",null,Fe.createElement("tr",null,["\u7BA1\u6BB5","\u53C2\u8003\u8D77\u70B9 \u2192 \u7EC8\u70B9","\u516C\u79F0\u76F4\u5F84","\u8D77\u70B9\u7EDD\u538B / MPa(a)","\u7EC8\u70B9\u7EDD\u538B / MPa(a)","\u6709\u7B26\u53F7\u6D41\u91CF / \u4E07\u6807\u65B9\xB7\u65E5\u207B\xB9"].map(r=>Fe.createElement("th",{key:r,scope:"col"},r)))),Fe.createElement("tbody",null,i.pipes.map(r=>Fe.createElement("tr",{key:r.id,className:t===r.id?"sel":"",onClick:()=>n(r.id)},Fe.createElement("td",null,Fe.createElement("button",{className:"sn-table-link","aria-label":"\u5B9A\u4F4D\u7BA1\u6BB5 "+r.id},r.id)),Fe.createElement("td",null,s.get(r.from)," \u2192 ",s.get(r.to)),Fe.createElement("td",null,"DN ",r.dn),Fe.createElement("td",null,e.pressureMPa[r.from].toFixed(2)),Fe.createElement("td",null,e.pressureMPa[r.to].toFixed(2)),Fe.createElement("td",null,e.flow10kSm3d[r.id].toFixed(1)))))))}function W_({model:i,c:e,sensorTag:t,onSensor:n}){return Fe.createElement("div",{className:"sn-scroll"},Fe.createElement("table",{className:"sn-sensor-table","aria-label":"\u5DE5\u51B5\u6D4B\u70B9\u8BB0\u5F55"},Fe.createElement("thead",null,Fe.createElement("tr",null,["\u4F4D\u53F7","\u7ED1\u5B9A\u5BF9\u8C61","\u6D4B\u91CF\u91CF","\u5355\u4F4D","\u5B9E\u6D4B\u503C","\u6A21\u578B\u503C","\u504F\u5DEE","\u72B6\u6001","\u5B9E\u6D4B\u6765\u6E90"].map(s=>Fe.createElement("th",{key:s,scope:"col"},s)))),Fe.createElement("tbody",null,i.sensors.map(s=>{let r=Bs(i,e,s),a=Ht[s.kind];return Fe.createElement("tr",{key:s.tag,className:t===s.tag?"sel":"",onClick:()=>n(s)},Fe.createElement("td",null,Fe.createElement("button",{className:"sn-table-link","aria-label":"\u5B9A\u4F4D\u6D4B\u70B9 "+s.tag},s.tag)),Fe.createElement("td",null,Fe.createElement("code",null,s.target)),Fe.createElement("td",null,a.name),Fe.createElement("td",null,a.unit),Fe.createElement("td",null,es(r.measured?.value)),Fe.createElement("td",null,es(r.predicted)),Fe.createElement("td",null,es(r.delta)),Fe.createElement("td",null,Fe.createElement("span",{className:"sn-status","data-comparable":r.status==="\u53EF\u6BD4"},r.status)),Fe.createElement("td",null,r.measured?.source??"\u2014"))}))))}function Od({model:i,c:e,selected:t,onPick:n,sensorTag:s,onSensor:r,apply:a,download:o}){let[c,l]=Fe.useState("sensors"),[u,f]=Fe.useState(""),h=Fe.useId(),d=Fe.useRef(null),_=Fe.useRef(0);Fe.useEffect(()=>()=>{_.current++},[i]);async function y(C){let w=C.target.files[0];if(C.target.value="",!w)return;let b=++_.current;try{if(w.size>5*1024*1024)throw Error("\u6587\u4EF6\u8D85\u8FC7 5 MB");let S=await w.text();if(_.current!==b)return;a(gh(i,S,w.name)),f("\u5DF2\u5BFC\u5165 "+w.name+"\u3002\u5BFC\u51FA\u6A21\u578B\u53EF\u4FDD\u5B58\u672C\u6B21\u8BB0\u5F55\u3002")}catch(S){b===_.current&&f("\u5BFC\u5165\u5931\u8D25 \xB7 "+S.message)}}let x=[["sensors","\u6D4B\u70B9\u5BF9\u6BD4",i.sensors?.length??0],["pipes","\u7BA1\u6BB5\u660E\u7EC6",i.pipes.length]];function p(C,w){let b={ArrowRight:1-w,ArrowLeft:1-w,Home:0,End:1}[C.key];b!==void 0&&(C.preventDefault(),l(x[b][0]),C.currentTarget.parentElement.querySelectorAll('[role="tab"]')[b].focus())}return Fe.createElement("section",{className:"sn-panel sn-dock","aria-label":"\u5DE5\u51B5\u6570\u636E\u8868"},Fe.createElement("header",{className:"sn-dock-head"},Fe.createElement("div",{className:"sn-data-tabs",role:"tablist","aria-label":"\u6570\u636E\u8868"},x.map(([C,w,b],S)=>Fe.createElement("button",{key:C,id:h+C,role:"tab","aria-label":w,"aria-selected":c===C,"aria-controls":h+C+"-panel",tabIndex:c===C?0:-1,onClick:()=>l(C),onKeyDown:v=>p(v,S)},w,Fe.createElement("span",null,b)))),Fe.createElement("div",{className:"sn-actions",hidden:c!=="sensors"},Fe.createElement("button",{onClick:()=>o("\u6D4B\u70B9\u6A21\u677F.csv",xl(i),"text/csv;charset=utf-8")},"\u6D4B\u70B9\u6A21\u677F"),Fe.createElement("button",{onClick:()=>d.current.click()},Fe.createElement(je,{name:"upload"}),"\u5BFC\u5165\u5B9E\u6D4B CSV"),Fe.createElement("input",{type:"file",hidden:!0,"aria-label":"\u5B9E\u6D4B CSV \u6587\u4EF6",accept:".csv",ref:d,onChange:y}),Fe.createElement("button",{disabled:!i.sensors?.length,onClick:()=>o("\u6D4B\u70B9\u5BF9\u6BD4.csv",xl(i,!0),"text/csv;charset=utf-8")},Fe.createElement(je,{name:"download"}),"\u5BFC\u51FA\u5BF9\u6BD4"))),Fe.createElement("div",{role:"tabpanel",id:h+"sensors-panel","aria-labelledby":h+"sensors",hidden:c!=="sensors"},Fe.createElement("section",{className:"sn-measurements","aria-label":"\u6D4B\u70B9\u5BF9\u6BD4"},Fe.createElement("div",{className:"sn-meas-time"},Fe.createElement("span",null,Fe.createElement(je,{name:"time"}),e.name," ",Fe.createElement("time",{dateTime:e.time??void 0},e.time?.replace("T"," ")??"\u5DE5\u51B5\u672A\u8BBE\u7F6E\u65F6\u95F4")),Fe.createElement("span",null,"\u504F\u5DEE = \u6A21\u578B\u503C \u2212 \u5B9E\u6D4B\u503C")),u&&Fe.createElement("p",{className:"sn-notice",role:"status"},u),i.sensors?.length?Fe.createElement(W_,{model:i,c:e,sensorTag:s,onSensor:r}):Fe.createElement("p",{className:"sn-empty"},"\u672C\u56FE\u5C1A\u672A\u767B\u8BB0\u6D4B\u70B9\u3002\u53EF\u7528\u6D4B\u70B9\u6A21\u677F\u586B\u5199\u4F4D\u53F7\u4E0E\u7ED1\u5B9A\u5BF9\u8C61\u3002"))),Fe.createElement("div",{role:"tabpanel",id:h+"pipes-panel","aria-labelledby":h+"pipes",hidden:c!=="pipes"},Fe.createElement("div",{className:"sn-meas-time"},Fe.createElement("span",null,Fe.createElement(je,{name:"time"}),e.name),Fe.createElement("span",null,"\u6B63\u6D41\u91CF\u6CBF\u53C2\u8003\u8D77\u70B9\u81F3\u7EC8\u70B9")),Fe.createElement(G_,{model:i,c:e,selected:t,onPick:n})))}var Bd=[["\u4E95\u573A\u4E0E\u7AD9\u573A","well","WH","\u4E95\u53E3\u91C7\u6C14\u6811","\u7FFC\u9600\u3001\u4E3B\u9600\u4E0E\u4E95\u53E3\u5782\u76F4\u901A\u9053","M0 13V-13M-12 -6H12M-10 -9V-3M10 -9V-3M-4 2L4 8V2L-4 8ZM-8 13H8"],["\u4E95\u573A\u4E0E\u7AD9\u573A","manifold","MF","\u6C47\u7BA1\u9600\u7EC4","\u591A\u6761\u4E95\u652F\u7EBF\u6C47\u5165\u540C\u4E00\u6839\u6C47\u7BA1","M-16 3H16V7H-16ZM-10 3V-10M0 3V-10M10 3V-10M-13 -6H-7M-3 -6H3M7 -6H13"],["\u4E95\u573A\u4E0E\u7AD9\u573A","station","GS","\u96C6\u6CE8\u7AD9","\u6CE8\u91C7\u5207\u6362\u3001\u5904\u7406\u4E0E\u589E\u538B\u5355\u5143\u7684\u7AD9\u7EA7\u8282\u70B9","M-15 -10H15V10H-15ZM-11 -3H-4L2 3H11M-11 3H-4L2 -3H11"],["\u4E95\u573A\u4E0E\u7AD9\u573A","terminal","MS","\u5916\u8F93\u8BA1\u91CF\u7AD9","\u7AD9\u754C\u4EA4\u63A5\u8BA1\u91CF\u4E0E\u5916\u8F93\u63A5\u53E3","M-16 -10H16V10H-16ZM-12 0H-6A6 6 0 1 1 6 0H12M0 0L4 -4"],["\u7BA1\u7EBF\u4E0E\u8FDE\u63A5","pipe","PL","\u76F4\u7BA1\u6BB5","\u540C\u5F84\u76F4\u7BA1\uFF0C\u4E24\u7AEF\u5BF9\u63A5","M-17 -3H17M-17 3H17"],["\u7BA1\u7EBF\u4E0E\u8FDE\u63A5","elbow","EL","\u5F2F\u5934","\u6539\u53D8\u7BA1\u9053\u8D70\u5411","M-16 3H-5Q3 3 3 -5V-14M-16 8H-5Q8 8 8 -5V-14"],["\u7BA1\u7EBF\u4E0E\u8FDE\u63A5","tee","TE","\u4E09\u901A","\u5E72\u7BA1\u4E0E\u652F\u7BA1\u8FDE\u63A5","M-16 -2H-3V-13H3V-2H16M-16 4H16"],["\u7BA1\u7EBF\u4E0E\u8FDE\u63A5","cross","CR","\u56DB\u901A","\u4E24\u7EC4\u76F8\u4EA4\u7684\u7BA1\u9053\u5171\u7528\u8FDE\u63A5\u8154","M-15 -3H-3V-14M3 -14V-3H15M15 3H3V14M-3 14V3H-15"],["\u7BA1\u7EBF\u4E0E\u8FDE\u63A5","reducer","RD","\u5F02\u5F84\u7BA1","\u540C\u8F74\u8FDE\u63A5\u4E24\u79CD\u7BA1\u5F84","M-16 -7H-9L10 -3H16M-16 7H-9L10 3H16"],["\u7BA1\u7EBF\u4E0E\u8FDE\u63A5","flange","FL","\u6CD5\u5170\u8FDE\u63A5","\u4E00\u5BF9\u6CD5\u5170\u4E0E\u5BC6\u5C01\u57AB\u7247","M-16 0H-3M3 0H16M-3 -10V10M3 -10V10"],["\u7BA1\u7EBF\u4E0E\u8FDE\u63A5","blind","BL","\u76F2\u677F\u6CD5\u5170","\u5C01\u95ED\u7BA1\u9053\u7AEF\u90E8","M-16 0H-2M-2 -10V10M2 -11V11M2 -8L7 -12"],["\u9600\u95E8\u4E0E\u4FDD\u62A4","gate","GV","\u95F8\u9600","\u95F8\u677F\u5207\u65AD\u76F4\u901A\u6D41\u9053","M-13 -7L13 7V-7L-13 7ZM0 0V-12M-5 -12H5"],["\u9600\u95E8\u4E0E\u4FDD\u62A4","ball","BV","\u7403\u9600","\u7403\u82AF\u65CB\u8F6C\u542F\u95ED","M-14 -7L0 0L-14 7ZM14 -7L0 0L14 7ZM-3 0A3 3 0 1 0 3 0A3 3 0 1 0 -3 0M0 -3V-11H8"],["\u9600\u95E8\u4E0E\u4FDD\u62A4","globe","GLV","\u622A\u6B62\u9600","\u9600\u74E3\u538B\u5411\u9600\u5EA7","M-13 -7L13 7V-7L-13 7ZM0 0V-11M-5 -11H5M-3 1H3V4H-3Z"],["\u9600\u95E8\u4E0E\u4FDD\u62A4","check","CV","\u6B62\u56DE\u9600","\u6309\u5B89\u88C5\u65B9\u5411\u9650\u5236\u5012\u6D41","M-13 -7L9 0L-13 7ZM10 -8V8"],["\u9600\u95E8\u4E0E\u4FDD\u62A4","regulator","PCV","\u8C03\u538B\u9600","\u53D6\u538B\u819C\u5934\u9A71\u52A8\u8282\u6D41\u9600\u82AF","M-13 -7L13 7V-7L-13 7ZM0 0V-8M-7 -8Q0 -20 7 -8ZM7 -8H15V0"],["\u9600\u95E8\u4E0E\u4FDD\u62A4","esd","ESDV","\u7D27\u6025\u5207\u65AD\u9600","\u6267\u884C\u673A\u6784\u4E0E\u5207\u65AD\u9600\u7EC4\u5408","M-13 -7L13 7V-7L-13 7ZM0 0V-7M-6 -14H6V-7H-6ZM-4 -9L4 -12"],["\u9600\u95E8\u4E0E\u4FDD\u62A4","choke","CH","\u8282\u6D41\u9600","\u53EF\u8C03\u8282\u6D41\u622A\u9762","M-13 -7L13 7V-7L-13 7ZM-8 11L8 -12M3 -10L8 -12L8 -7"],["\u9600\u95E8\u4E0E\u4FDD\u62A4","relief","PSV","\u5B89\u5168\u6CC4\u538B\u9600","\u5F39\u7C27\u52A0\u8F7D\uFF0C\u8D85\u538B\u65F6\u5411\u6CC4\u653E\u4FA7\u5F00\u542F","M-14 7H0V-3H14M-6 4L0 -4L6 4ZM0 -4L-3 -6L3 -8L-3 -10L3 -12"],["\u7AD9\u5185\u5904\u7406","separator","V","\u6C14\u6DB2\u5206\u79BB\u5668","\u7ACB\u5F0F\u5BB9\u5668\uFF0C\u4E0A\u90E8\u51FA\u6C14\u3001\u4E0B\u90E8\u6392\u6DB2","M-7 -8Q0 -16 7 -8V8Q0 16 -7 8ZM-15 0H-7M7 -5H15M0 12V16"],["\u7AD9\u5185\u5904\u7406","filter","F","\u8FC7\u6EE4\u5668","\u6EE4\u82AF\u622A\u7559\u9897\u7C92\u6742\u8D28","M-10 -8H10V8H-10ZM-8 6L7 -6M-4 7L9 -3M-16 0H-10M10 0H16"],["\u7AD9\u5185\u5904\u7406","dehydrator","T","\u8131\u6C34\u5438\u6536\u5854","\u7ACB\u5F0F\u5854\u5668\u5185\u6C14\u6DB2\u63A5\u89E6\u8131\u6C34","M-5 -12Q0 -16 5 -12V11Q0 15 -5 11ZM-5 -6H3M-3 -2H5M-5 2H3M-3 6H5M-13 8H-5M5 -8H13"],["\u7AD9\u5185\u5904\u7406","heater","H","\u52A0\u70ED\u7089","\u52A0\u70ED\u8282\u6D41\u524D\u7684\u5929\u7136\u6C14","M-12 -9H12V10H-12ZM-16 0H-7V-5H6V3H16M-4 8L0 4L3 8"],["\u7AD9\u5185\u5904\u7406","exchanger","E","\u6362\u70ED\u5668","\u4E24\u80A1\u4ECB\u8D28\u7ECF\u6362\u70ED\u9762\u4F20\u70ED","M-9 0A9 9 0 1 0 9 0A9 9 0 1 0 -9 0M-16 0H-8L-4 -5L4 5L8 0H16M0 -9V-14M0 9V14"],["\u7AD9\u5185\u5904\u7406","cooler","AC","\u7A7A\u51B7\u5668","\u98CE\u673A\u4E0E\u7FC5\u7247\u7BA1\u675F\u51B7\u5374\u6392\u6C14","M-13 -8H13V8H-13ZM-10 5L-5 -5L0 5L5 -5L10 5M-16 0H-13M13 0H16"],["\u589E\u538B\u4E0E\u8BA1\u91CF","compressor","K","\u79BB\u5FC3\u538B\u7F29\u673A","\u79BB\u5FC3\u53F6\u8F6E\u4E0E\u8717\u58F3\u589E\u538B","M-11 -9L10 -5V5L-11 9ZM-16 0H-11M10 0H16"],["\u589E\u538B\u4E0E\u8BA1\u91CF","recip","RC","\u5F80\u590D\u538B\u7F29\u673A","\u66F2\u8F74\u9A71\u52A8\u6C14\u7F38\u5F80\u590D\u538B\u7F29","M-15 -6H-5V6H-15ZM-5 0H1L5 5M5 5A5 5 0 1 0 15 5A5 5 0 1 0 5 5M-11 -6V-12H0"],["\u589E\u538B\u4E0E\u8BA1\u91CF","meter","FE","\u8D85\u58F0\u6D41\u91CF\u8BA1","\u6D4B\u91CF\u7BA1\u6BB5\u4E0E\u6210\u5BF9\u7684\u6362\u80FD\u5668","M-14 -5H14V5H-14ZM-8 -7L6 7M-6 7L8 -7"],["\u589E\u538B\u4E0E\u8BA1\u91CF","orifice","FO","\u5B54\u677F\u6D41\u91CF\u8BA1","\u8282\u6D41\u5B54\u677F\u4E0E\u4E0A\u4E0B\u6E38\u53D6\u538B\u53E3","M-16 0H16M-1 -9V9M2 -9V9M-8 0V-11M8 0V-11"],["\u4EEA\u8868","pressure","PT","\u538B\u529B\u53D8\u9001\u5668","\u7BA1\u9053\u53D6\u538B\u53E3\u3001\u8868\u5934\u548C\u53D8\u9001\u5668","M0 12V4M-8 -4A8 8 0 1 0 8 -4A8 8 0 1 0 -8 -4M-4 0L4 -8"],["\u4EEA\u8868","temperature","TT","\u6E29\u5EA6\u53D8\u9001\u5668","\u6E29\u5957\u7BA1\u4E0E\u6E29\u5EA6\u5143\u4EF6","M0 13V4M-8 -4A8 8 0 1 0 8 -4A8 8 0 1 0 -8 -4M-4 -7H4M0 -7V0"],["\u4EEA\u8868","differential","PDT","\u5DEE\u538B\u53D8\u9001\u5668","\u9AD8\u4F4E\u538B\u4E24\u6839\u5F15\u538B\u7BA1\u63A5\u5165\u8868\u5934","M-9 12V4H-4M9 12V4H4M-7 -3A7 7 0 1 0 7 -3A7 7 0 1 0 -7 -3M-4 -3H0M-2 -5V-1M2 -3H5"],["\u6E05\u7BA1\u4E0E\u8F85\u52A9","launcher","PLR","\u6E05\u7BA1\u53D1\u7403\u7B52","\u5927\u7AEF\u5FEB\u5F00\u76F2\u677F\u3001\u5C0F\u7AEF\u63A5\u4E3B\u7BA1","M-14 -7H4L10 -3H16M-14 7H4L10 3H16M-14 -9V9M-8 7V12M2 7V12"],["\u6E05\u7BA1\u4E0E\u8F85\u52A9","receiver","PRR","\u6E05\u7BA1\u6536\u7403\u7B52","\u63A5\u6536\u6E05\u7BA1\u5668\uFF0C\u7AEF\u90E8\u8BBE\u5FEB\u5F00\u76F2\u677F","M14 -7H-4L-10 -3H-16M14 7H-4L-10 3H-16M14 -9V9M8 7V12M-2 7V12"],["\u6E05\u7BA1\u4E0E\u8F85\u52A9","tank","TK","\u51DD\u6DB2\u50A8\u7F50","\u50A8\u5B58\u5206\u79BB\u51FA\u7684\u51DD\u6790\u6DB2","M-12 10V-7Q0 -14 12 -7V10ZM-12 10H12M12 6H17"],["\u6E05\u7BA1\u4E0E\u8F85\u52A9","drain","DR","\u6392\u6C61\u7F50","\u63A5\u6536\u7AD9\u5185\u8BBE\u5907\u6392\u6C61\u4E0E\u4F4E\u70B9\u6392\u6DB2","M-10 -5Q-17 0 -10 5H10Q17 0 10 -5ZM-6 -5V-12M6 -5V-10M-9 7H9"],["\u6E05\u7BA1\u4E0E\u8F85\u52A9","vent","VS","\u653E\u7A7A\u7ACB\u7BA1","\u653E\u7A7A\u6C14\u4F53\u7ECF\u7ACB\u7BA1\u5F15\u51FA","M-13 10H-2V-12M2 10V-12M-5 -8L0 -14L5 -8"],["\u6E05\u7BA1\u4E0E\u8F85\u52A9","pump","P","\u51DD\u6DB2\u6CF5","\u8F93\u9001\u5206\u79BB\u3001\u6392\u6C61\u7CFB\u7EDF\u4E2D\u7684\u6DB2\u4F53","M-8 0A8 8 0 1 0 8 0A8 8 0 1 0 -8 0M-5 5L6 0L-5 -5ZM6 -6H15M-6 11H6"],["\u9600\u95E8\u4E0E\u4FDD\u62A4","blowdown","BDV","\u653E\u7A7A\u9600","\u5207\u65AD\u9600\u4E0E\u6CC4\u538B\u652F\u8DEF\u8FDE\u63A5","M-14 7H-5L5 -3V7L-5 -3V7M5 2H12V-10M8 -7L12 -12L16 -7M0 2V-9H-7"],["\u9600\u95E8\u4E0E\u4FDD\u62A4","arrestor","FA","\u963B\u706B\u5668","\u58F3\u4F53\u5185\u7684\u963B\u706B\u5143\u4EF6\u4E0E\u4E24\u7AEF\u6CD5\u5170","M-16 0H-9M9 0H16M-9 -6H9V6H-9ZM-6 -5L-3 5L0 -5L3 5L6 -5"],["\u6E05\u7BA1\u4E0E\u8F85\u52A9","flare","FS","\u706B\u70AC\u7ACB\u7BA1","\u706B\u70AC\u5934\u3001\u5F15\u71C3\u7BA1\u4E0E\u652F\u6491\u7ACB\u7BA1","M-10 12H-2V-6M2 12V-6M-5 -6H5L3 -2H-3ZM-2 -8Q-7 -11 0 -16Q0 -12 4 -12Q5 -9 1 -8"],["\u4EEA\u8868","level","LT","\u6DB2\u4F4D\u53D8\u9001\u5668","\u5BB9\u5668\u6DB2\u4F4D\u6D4B\u91CF\u7528\u63A2\u6746\u4E0E\u8868\u5934","M0 13V4M-8 -4A8 8 0 1 0 8 -4A8 8 0 1 0 -8 -4M-2 -8V-1H3M-4 10H4"],["\u7BA1\u7EBF\u4E0E\u8FDE\u63A5","support","PS","\u7BA1\u6258","\u7BA1\u978B\u7ECF\u7ACB\u67F1\u56FA\u5B9A\u5728\u5E95\u677F\u4E0A","M-14 -3H14M-14 1H14M-6 2V5H6V2M0 5V11M-7 11H7"]],ci=Object.fromEntries(Bd.map(([i,e,t,n,s,r])=>[e,{group:i,type:e,tag:t,name:n,detail:s,path:r}])),Qc=[...new Set(Bd.map(i=>i[0]))];var Fr=Object.fromEntries(Object.entries(ci).map(([i,e])=>[i,e.name])),Hd=[["W01","\u5317\u4E00\u4E95","well",100,80,0,1300,156],["W02","\u5317\u4E8C\u4E95","well",100,175,630,950,138],["W03","\u5357\u4E00\u4E95","well",100,300,50,350,124],["W04","\u5357\u4E8C\u4E95","well",100,395,440,0,117],["V01","\u5317\u533A\u9600\u7EC4","manifold",340,124,1020,1080,131],["V02","\u5357\u533A\u9600\u7EC4","manifold",340,345,1120,340,120],["CS01","\u4E2D\u5FC3\u96C6\u6CE8\u7AD9","station",575,235,1910,760,126],["M01","\u5916\u8F93\u8BA1\u91CF\u7AD9","terminal",808,235,2680,590,119]],Gd=[["P-01","W01","V01",150],["P-02","W02","V01",150],["P-03","W03","V02",150],["P-04","W04","V02",150],["P-05","V01","CS01",250],["P-06","V02","CS01",250],["P-07","CS01","M01",350]];function kd(i,e,t){return{name:i,pressureMPa:Object.fromEntries(Hd.map(([n],s)=>[n,e[s]])),flow10kSm3d:Object.fromEntries(Gd.map(([n],s)=>[n,t[s]]))}}var zd={version:1,name:"\u9752\u5C9A\u50A8\u6C14\u5E93",source:"\u5408\u6210\u793A\u4F8B",standard:"20 \xB0C \xB7 101.325 kPa(a)",nodes:Hd.map(([i,e,t,n,s,r,a,o])=>({id:i,name:e,type:t,diagram:[n,s],enuM:[r,a,o]})),pipes:Gd.map(([i,e,t,n],s)=>({id:i,from:e,to:t,dn:n,viaM:[[[360,1350,149],[720,1170,137]],[[810,950,136]],[[430,420,129],[830,420,126]],[[680,90,120]],[[1310,1080,131],[1530,870,128]],[[1380,345,123],[1660,590,125]],[[2130,760,125],[2450,595,121]]][s]})),cases:[kd("\u51AC\u5B63\u91C7\u6C14",[8.64,8.58,8.51,8.47,8.43,8.36,8.12,8.06],[28,24,22,18,52,40,92]),kd("\u590F\u5B63\u6CE8\u6C14",[9.05,9.1,9.14,9.18,9.3,9.34,9.57,9.64],[-20,-17,-16,-14,-37,-30,-67])]},Or={...zd,...zr([["PT-101","W01","pressure"],["PT-201","V01","pressure"],["FT-201","P-05","flow","\u8FB9\u754C"],["PDT-301","P-07","differential"],["TT-301","CS01","temperature"]],[[8.6,8.47,52,.07,18.7],[9.02,9.34,-37,-.09,23.8]],[{CS01:18.4},{CS01:24.1}],zd.cases)},Ur=Number.isFinite;function Wd(i){let e=r=>{throw new Error(r)};(i?.version!==1||![i.name,i.standard,i.source].every(r=>typeof r=="string"&&r.trim()))&&e("\u8BF7\u586B\u5199\u7248\u672C\u3001\u9879\u76EE\u540D\u3001\u6765\u6E90\u548C\u6C14\u91CF\u6807\u51C6\u72B6\u6001"),[i.nodes,i.pipes,i.cases].every(r=>Array.isArray(r)&&r.length)||e("\u7F3A\u5C11\u8282\u70B9\u3001\u7BA1\u6BB5\u6216\u5DE5\u51B5");let t=new Set,n=new Set,s=r=>typeof r=="string"&&/^[A-Za-z0-9][\w.-]{0,63}$/.test(r)&&!Object.hasOwn(Object.prototype,r)&&!t.has(r);for(let r of i.nodes)(!r||!s(r.id)||!Object.hasOwn(Fr,r.type)||typeof r.name!="string"||!r.name.trim())&&e("\u8282\u70B9\u7F16\u53F7\u91CD\u590D\u6216\u8282\u70B9\u5C5E\u6027\u6709\u8BEF"),[[r.diagram,2],[r.enuM,3]].every(([a,o])=>Array.isArray(a)&&a.length===o&&a.every(Ur))||e(r.id+" \u5750\u6807\u6709\u8BEF"),t.add(r.id),n.add(r.id);for(let r of i.pipes)(!r||!s(r.id)||!n.has(r.from)||!n.has(r.to)||r.from===r.to||!Ur(r.dn)||r.dn<=0)&&e("\u7BA1\u6BB5\u7F16\u53F7\u3001\u7AEF\u70B9\u6216\u516C\u79F0\u76F4\u5F84\u6709\u8BEF"),r.viaM!==void 0&&!(Array.isArray(r.viaM)&&r.viaM.every(a=>Array.isArray(a)&&a.length===3&&a.every(Ur)))&&e(r.id+" \u7BA1\u6BB5\u8F6C\u6298\u70B9\u5750\u6807\u6709\u8BEF"),t.add(r.id);for(let r of i.cases)(!r||typeof r.name!="string"||!r.name.trim()||!i.nodes.every(a=>Ur(r.pressureMPa?.[a.id])&&r.pressureMPa[a.id]>0)||!i.pipes.every(a=>Ur(r.flow10kSm3d?.[a.id])))&&e("\u5DE5\u51B5\u7F3A\u5C11\u6709\u6548\u7EDD\u538B\u6216\u6709\u7B26\u53F7\u6D41\u91CF");return Os(i),i}function Vd(i,e,t){return t==="pressure"?(e.pressureMPa[i.from]+e.pressureMPa[i.to])/2:Math.abs(e.flow10kSm3d[i.id])}var eh=["#3679ad","#18899a","#23967d","#b38537"];function Xd(i,e,t){let n=i.pipes.map(a=>Vd(a,e,t)),s=Math.min(...n),r=Math.max(...n);return{lo:s,hi:r,color:a=>eh[r===s?0:Math.min(3,Math.floor(4*(Vd(a,e,t)-s)/(r-s)))]}}function il(i){return[0,1,2].map(e=>{let t=i.map(n=>n[e]??0);return[Math.min(...t),Math.max(...t)]})}function qd(i,e){return e.flow10kSm3d[i.id]<0?[i.to,i.from]:[i.from,i.to]}function Yd(i,e){let t=s=>'"'+String(s).replaceAll('"','""')+'"';return"\uFEFF"+[["\u5DE5\u51B5","\u7BA1\u6BB5","\u53C2\u8003\u8D77\u70B9","\u53C2\u8003\u7EC8\u70B9","\u8D77\u70B9\u7EDD\u538B_MPa","\u7EC8\u70B9\u7EDD\u538B_MPa","\u6709\u7B26\u53F7\u6D41\u91CF_\u4E07\u6807\u65B9\u6BCF\u5929","\u6C14\u91CF\u6807\u51C6\u72B6\u6001"],...i.pipes.map(s=>[e.name,s.id,s.from,s.to,e.pressureMPa[s.from],e.pressureMPa[s.to],e.flow10kSm3d[s.id],i.standard])].map(s=>s.map(t).join(",")).join(`\r
`)}var st=window.QwenPaw.host.React;function Mn({label:i,children:e}){return st.createElement("div",{className:"sn-row"},st.createElement("dt",null,i),st.createElement("dd",null,e))}function Zd({model:i,c:e,selected:t,sensorTag:n,pick:s,openRegister:r}){let a=i.pipes.find(d=>d.id===t),o=new Map(i.nodes.map(d=>[d.id,d])),c=o.get(t),l=i.sensors?.find(d=>d.tag===n),u=l&&Bs(i,e,l),f=a&&e.flow10kSm3d[a.id],h=a?[a.from,a.to]:i.pipes.filter(d=>d.from===t||d.to===t).map(d=>d.id);return st.createElement("aside",{className:"sn-panel sn-inspector","aria-label":"\u5BF9\u8C61\u5C5E\u6027"},st.createElement("header",{className:"sn-pane-head"},st.createElement("h2",null,st.createElement(je,{name:"properties"}),"\u5BF9\u8C61\u5C5E\u6027"),st.createElement("small",null,a?"\u7BA1\u6BB5":Fr[c.type])),st.createElement("div",{className:"sn-detail","aria-live":"polite"},st.createElement("code",{className:"sn-code"},t),st.createElement("h3",null,a?o.get(a.from).name+" \u2014 "+o.get(a.to).name:c.name),l&&st.createElement("section",{className:"sn-instrument"},st.createElement("h4",null,"\u6D4B\u70B9\u6821\u6838 ",st.createElement("code",null,l.tag)),st.createElement("dl",null,st.createElement(Mn,{label:"\u6D4B\u91CF\u91CF"},Ht[l.kind].name),st.createElement(Mn,{label:"\u5B9E\u6D4B\u503C"},es(u.measured?.value)," ",Ht[l.kind].unit),st.createElement(Mn,{label:"\u6A21\u578B\u503C"},es(u.predicted)," ",Ht[l.kind].unit),st.createElement(Mn,{label:"\u504F\u5DEE"},es(u.delta)," ",l.kind==="pressure"?"MPa":Ht[l.kind].unit),st.createElement(Mn,{label:"\u72B6\u6001"},u.status),st.createElement(Mn,{label:"\u5B9E\u6D4B\u6765\u6E90"},u.measured?.source??"\u2014"))),st.createElement("div",{className:"sn-reading"},st.createElement("small",null,a?"\u7BA1\u6BB5\u6D41\u91CF":"\u8282\u70B9\u7EDD\u538B"),st.createElement("strong",null,a?Math.abs(f).toFixed(1):e.pressureMPa[c.id].toFixed(2)," ",st.createElement("em",null,a?"\u4E07\u6807\u65B9/\u65E5":"MPa(a)"))),st.createElement("dl",null,a?st.createElement(st.Fragment,null,st.createElement(Mn,{label:"\u6D41\u52A8\u65B9\u5411"},f?qd(a,e).join(" \u2192 "):"\u505C\u6D41"),st.createElement(Mn,{label:"\u516C\u79F0\u76F4\u5F84"},"DN ",a.dn),st.createElement(Mn,{label:"\u53C2\u8003\u8D77\u70B9\u7EDD\u538B"},e.pressureMPa[a.from].toFixed(2)," MPa(a)"),st.createElement(Mn,{label:"\u53C2\u8003\u7EC8\u70B9\u7EDD\u538B"},e.pressureMPa[a.to].toFixed(2)," MPa(a)"),st.createElement(Mn,{label:"\u8D77\u70B9\u51CF\u7EC8\u70B9"},(e.pressureMPa[a.from]-e.pressureMPa[a.to]).toFixed(2)," ","MPa")):["\u4E1C\u5411\u5750\u6807","\u5317\u5411\u5750\u6807","\u9AD8\u7A0B"].map((d,_)=>st.createElement(Mn,{key:d,label:d},c.enuM[_]," m"))),st.createElement("h4",{className:"sn-link-title"},a?"\u5173\u8054\u8282\u70B9":"\u76F8\u8FDE\u7BA1\u6BB5"),st.createElement("div",{className:"sn-chips"},h.map(d=>st.createElement("button",{key:d,"aria-label":d+" \u2197",onClick:()=>s(d)},st.createElement("code",null,d),st.createElement(je,{name:"arrow"})))),c&&st.createElement("button",{className:"sn-manual",onClick:()=>r(c.type)},st.createElement(je,{name:"register"}),"\u67E5\u770B\u8BBE\u5907\u56FE\u4F8B")))}function sl(i){let e=new Qn,t=8885914,n=4283751,s=3622476,r=5533300,a=9663302,o=10768954,c=new Map;function l(v,M,m,T,P){c.has(M)||c.set(M,new ai({color:M,metalness:.25,roughness:.49}));let I=new St(v,c.get(M));return I.position.set(m,T,P),e.add(I),I}function u(v,M,m,T,P,I,L=n){return l(new kn(T,P,I),L,v,M,m)}function f(v,M,m,T=t,P=m){let I=new R(...v),L=new R(...M).sub(I),N=l(new zn(P,m,L.length(),24),T,0,0,0);return N.position.copy(I).addScaledVector(L,.5),N.quaternion.setFromUnitVectors(new R(0,1,0),L.normalize()),N}function h(v,M,m=.26,T=0,P=0,I=t){return f([v,T,P],[M,T,P],m,I)}function d(v,M,m,T,P,I=t){return f([v,m,M],[v,T,M],P,I)}function _(v,M,m,T,P=n,I=[1,1,1]){let L=l(new dr(T,24,16),P,v,M,m);return L.scale.set(...I),L}function y(v,M=.48,m=0,T=0){h(v-.065,v+.065,M,m,T,n);for(let P=0;P<8;P++){let I=P*Math.PI/4;h(v-.09,v+.09,.043,m+Math.sin(I)*M*.78,T+Math.cos(I)*M*.78,s)}}function x(){h(-1.65,1.65),y(-1.48),y(1.48)}function p(v,M,m,T=.48){let P=l(new Zi(T,.06,8,32),o,v,M,m);P.rotation.x=Math.PI/2;for(let I=0;I<3;I++){let L=I*2*Math.PI/3;f([v,M,m],[v+T*Math.cos(L),M,m+T*Math.sin(L)],.035,o)}}function C(){for(let v of[-.85,.85])u(v,-.73,0,.26,.55,.88,s)}function w(v,M,m=t){d(0,0,-.48,v,M,m),_(0,v,0,M,m,[1,.45,1]),_(0,-.48,0,M,m,[1,.45,1]);for(let T of[-1,1])for(let P of[-1,1])u(T*M*.56,-.88,P*M*.56,.12,.7,.12,s);h(-1.45,-M*.85,.18,-.05),y(-1.36,.31,-.05),d(0,0,v+.15*M,v+.65*M,.17),h(0,1.45,.16,v+.65*M)}function b(v,M,m){h(v-.65,v+.65,.44,M,m,n);for(let T=0;T<8;T++)h(v-.56+T*.15,v-.51+T*.15,.48,M,m,s);u(v,M+.48,m,.43,.2,.36,n)}function S(v,M,m,T=t){let P=f([v,M,m-.12],[v,M,m+.12],.38,s);return f([v,M,m+.12],[v,M,m+.14],.315,T),f([v,M,m+.16],[v+.19,M+.14,m+.16],.023,s),P}switch(i){case"pipe":h(-1.65,1.65,.31);break;case"elbow":{let v=new Ts(new R(-1.55,0,0),new R(.25,0,0),new R(.45,0,.15),new R(.45,0,1.65));l(new fr(v,28,.29,20,!1),t,0,0,0);break}case"tee":case"cross":h(-1.65,1.65,.32),f([0,0,i==="cross"?-1.25:0],[0,0,1.25],.3);break;case"reducer":h(-1.5,-.65,.49),f([-.65,0,0],[.65,0,0],.49,t,.24),h(.65,1.5,.24);break;case"flange":x(),y(-.09,.59),y(.09,.59);break;case"blind":h(-1.45,0,.36),y(-.08,.68),y(.08,.68);break;case"well":d(0,0,-1,1.32,.34,n);for(let v of[-.65,-.22,.46,1])d(0,0,v,v+.13,.54,t);for(let v of[.18,.8])h(-1.1,1.18,.24,v,0,n),y(-.8,.37,v),y(.8,.37,v);d(0,0,1.32,1.59,.12),p(0,1.62,0);break;case"manifold":h(-1.65,1.65,.41),C();for(let v of[-1,0,1])f([v,0,0],[v,0,.99],.21),d(v,.61,0,.64,.13),p(v,.66,.61,.25);y(-1.54,.58),y(1.54,.58);break;case"station":case"terminal":u(0,-.57,0,3.35,.19,1.99,s);for(let v of[-.52,.52])h(-1.6,1.6,.18,0,v),y(-1.28,.31,0,v),y(1.28,.31,0,v),i==="terminal"?(d(.2,v,0,.62,.08),S(.2,.84,v)):(_(-.4,.01,v,.37),d(-.4,v,.17,.55,.1),p(-.4,.56,v,.29));f([-1.5,0,-.52],[-1.5,0,.52],.2),f([1.5,0,-.52],[1.5,0,.52],.2);break;case"gate":case"globe":case"ball":case"choke":case"regulator":case"check":case"esd":case"relief":if(i==="relief"){h(-1.6,0,.29),d(0,0,0,.85,.3),h(0,1.3,.26,.67),d(0,0,.64,1.37,.29,o),y(1.2,.4,.67);break}if(x(),i==="gate"?u(0,.13,0,.78,.83,.69,n):_(0,.02,0,i==="ball"?.62:.5,n,i==="globe"?[1.35,.9,1]:[1,1,1]),i==="check"){d(0,0,.24,.59,.43);break}d(0,0,.28,.66,.28,n),d(0,0,.66,1,.085),i==="ball"?u(.38,1,0,1.05,.11,.19,a):i==="esd"?(u(0,1.03,0,1.25,.54,.61,a),u(.57,1.34,0,.44,.32,.42,s)):i==="regulator"?(_(0,1.02,0,.62,a,[1,.43,1]),f([1.08,0,.1],[1.08,.84,.1],.04),h(.35,1.08,.04,.84,.1)):i==="choke"?(f([0,.4,0],[.56,1.16,0],.16),p(.56,1.16,0,.31)):p(0,1,0);break;case"separator":case"dehydrator":case"filter":{let v=i==="dehydrator"?2.1:i==="separator"?1.13:.8,M=i==="filter"?.62:.7;if(w(v,M),i==="filter")d(0,0,v-.02,v+.11,M*1.13,s),d(0,0,v+.11,v+.19,M*1.12);else if(i==="dehydrator"){for(let m of[-.2,.2])d(m,M+.1,-.65,v+.25,.035,s);for(let m=-.57;m<v+.24;m+=.22)h(-.2,.2,.027,m,M+.1,s)}else d(.62,.32,-.22,.86,.074,a),d(0,0,-1,-.5,.11);break}case"heater":u(0,.05,0,2.8,1.52,1.15,n),d(.92,0,.8,1.78,.19,s);for(let v of[-.9,-.34,.22])_(v,0,.6,.2,s,[1,1,.4]);C();break;case"cooler":u(0,0,0,3,.47,1.72,t);for(let v=-1.3;v<=1.31;v+=.18)u(v,.25,0,.035,.06,1.58,s);for(let v of[-.72,.72]){d(v,0,.27,.47,.58,n);for(let M=0;M<3;M++){let m=u(v,.49,0,.98,.05,.13,s);m.rotation.y=M*Math.PI/3}}C();break;case"exchanger":case"launcher":case"receiver":case"drain":{let v=i==="receiver"?-1:1;h(-1,1,.52),C(),_(-1,0,0,.52,t,[.4,1,1]),_(1,0,0,.52,t,[.4,1,1]),(i==="launcher"||i==="receiver")&&(y(-v*1.04,.65),f([v*.9,0,0],[v*1.55,0,0],.51,t,.23),d(-.47*v,0,.4,.85,.16)),i==="exchanger"&&(y(-.87,.61),y(.87,.61),d(-.66,0,.4,.86,.18),d(.66,0,-.88,-.4,.18),h(-1.55,-1,.19),h(1,1.55,.19)),i==="drain"&&(d(-.6,0,.42,.88,.16),d(.5,0,.42,.77,.26));break}case"tank":d(0,0,-.93,.83,.97),f([0,.83,0],[0,1.17,0],.98,t,.06),h(.84,1.35,.15,-.65);break;case"compressor":case"pump":case"recip":if(u(0,-.68,0,3.52,.18,1.67,s),b(-.83,-.02,0),i==="recip"){u(.68,-.05,0,1.12,.82,.86,n);for(let v of[-1,1])f([.66,.13,v*.18],[.66,.68,v*.86],.33),u(.66,.72,v*.86,.72,.26,.49,s)}else _(.69,.07,0,i==="pump"?.57:.79,n,[.81,1,1]),h(1,1.65,.24,.06),y(1.54,.4,.06),d(.73,0,.39,i==="pump"?.83:1.14,.21),i==="compressor"&&h(.73,1.38,.21,1.14);break;case"meter":case"orifice":if(x(),i==="orifice"){y(-.07,.57),y(.07,.57);for(let v of[-.45,.45])d(v,0,.2,.76,.06)}else{for(let v of[-.54,.54])f([v,.09,-.22],[v+.19,.4,.28],.105,a);u(0,.72,0,.59,.48,.35,n),d(0,0,0,.55,.08)}break;case"pressure":case"temperature":case"differential":if(i==="differential"){for(let v of[-.27,.27])d(v,0,-.67,.25,.066);u(0,.15,0,.84,.35,.36,n)}else d(0,0,-.72,.35,i==="temperature"?.065:.13),d(0,0,-.28,-.15,.24,s);i==="temperature"?(u(0,.57,0,.61,.44,.43,a),u(.35,.57,0,.22,.18,.18,s)):S(0,.59,0);break;case"vent":d(0,0,-.65,2.02,.17),h(-1.26,0,.17,-.51),d(0,0,-.73,-.6,.46,s);break;case"arrestor":x(),f([-.9,0,0],[-.5,0,0],.25,t,.61),h(-.5,.5,.61),f([.5,0,0],[.9,0,0],.61,t,.25),y(-.08,.73),y(.08,.73);break;case"blowdown":x(),_(0,0,0,.48,n),d(0,0,.32,.84,.2),u(0,1,0,.92,.4,.52,a),d(1.34,0,0,.8,.23);break;case"flare":d(0,0,-1,1.5,.21),f([0,1.5,0],[0,1.94,0],.22,s,.38),d(.24,0,-.72,1.79,.052,a);for(let v of[-.6,.6])f([-.42,-1,v],[0,.65,0],.06,s);h(-1.25,0,.2,-.78);break;case"level":d(0,0,-1.35,.25,.055),d(0,0,-.18,.02,.35),u(0,.48,0,.55,.45,.43,n),_(0,-.86,0,.16,t,[1,1.5,1]);break;case"support":h(-1.47,1.47,.35),u(0,-.38,0,.79,.19,.52,n),u(0,-.66,0,.37,.49,.38),u(0,-.96,0,1.08,.13,.78,s);break;default:throw Error("\u672A\u767B\u8BB0\u7684\u8BBE\u5907\u7C7B\u578B "+i)}return e}var hn=window.QwenPaw.host.React,rl=[1,1.25,1.5,2,3,4,6],hi=(i,e,t)=>Math.max(e,Math.min(t,i));function jd({extent:i,children:e}){let[t,n]=hn.useState(0),[s,r]=hn.useState([.5,.5]),a=hn.useRef(null),o=hn.useRef(!1),c=rl[t],l=.5/c,[u,f,h,d]=i,_=hi(s[0],l,1-l),y=hi(s[1],l,1-l),x=[u+(_-l)*h,f+(y-l)*d,h/c,d/c];function p(v){let M=hi(v,0,rl.length-1),m=.5/rl[M];r([hi(_,m,1-m),hi(y,m,1-m)]),n(M)}function C(v){if(o.current=!1,!t||!v.isPrimary||v.button!==0)return;let M=v.currentTarget.getScreenCTM()?.a;M&&(a.current={id:v.pointerId,x:v.clientX,y:v.clientY,cx:_,cy:y,factor:M})}function w(v){let M=a.current;if(!M||M.id!==v.pointerId)return;let m=v.clientX-M.x,T=v.clientY-M.y;!o.current&&Math.hypot(m,T)<4||(o.current||v.currentTarget.setPointerCapture(M.id),o.current=!0,r([hi(M.cx-m/(M.factor*h),l,1-l),hi(M.cy-T/(M.factor*d),l,1-l)]))}function b(v){a.current?.id===v.pointerId&&(v.currentTarget.hasPointerCapture(v.pointerId)&&v.currentTarget.releasePointerCapture(v.pointerId),a.current=null)}function S(v){if(v.target!==v.currentTarget)return;let M={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[v.key];if(M&&t)r([hi(_+M[0]*l/3,l,1-l),hi(y+M[1]*l/3,l,1-l)]);else if(v.key==="+"||v.key==="=")p(t+1);else if(v.key==="-")p(t-1);else if(v.key==="Home")p(0);else return;v.preventDefault()}return hn.createElement(hn.Fragment,null,hn.createElement("svg",{className:"sn-diagram",role:"group","aria-label":"\u4E8C\u7EF4\u7BA1\u7F51\u5DE5\u827A\u56FE",tabIndex:"0",viewBox:x.join(" "),"data-zoomed":t>0,onKeyDown:S,onPointerDown:C,onPointerMove:w,onPointerUp:b,onPointerCancel:b,onPointerLeave:v=>{v.currentTarget.hasPointerCapture?.(v.pointerId)||(a.current=null)},onClickCapture:v=>{o.current&&v.detail!==0&&(o.current=!1,v.stopPropagation())}},e),hn.createElement("div",{className:"sn-zoom",role:"group","aria-label":"\u56FE\u9762\u7F29\u653E"},hn.createElement("button",{disabled:t===0,onClick:()=>p(t-1),"aria-label":"\u7F29\u5C0F\u4E00\u7EA7",title:"\u7F29\u5C0F\u4E00\u7EA7"},hn.createElement(je,{name:"minus"})),hn.createElement("button",{onClick:()=>p(0),"aria-label":"\u9002\u5408\u56FE\u9762",title:"\u9002\u5408\u56FE\u9762"},Math.round(c*100),"%"),hn.createElement("button",{disabled:t===rl.length-1,onClick:()=>p(t+1),"aria-label":"\u653E\u5927\u4E00\u7EA7",title:"\u653E\u5927\u4E00\u7EA7\uFF0C\u53EF\u62D6\u52A8\u5E73\u79FB"},hn.createElement(je,{name:"plus"}))))}var Nt=window.QwenPaw.host.React;function al({type:i}){return Nt.createElement("g",{fill:"none",stroke:"currentColor",strokeWidth:"1.8",strokeLinejoin:"round",strokeLinecap:"round"},Nt.createElement("path",{d:ci[i].path}))}function Jd({model:i,c:e,colors:t,selected:n,onPick:s,showSensors:r,sensorTag:a,onSensor:o}){let c=new Map(i.nodes.map(w=>[w.id,w])),[[l,u],[f,h]]=il([...i.nodes.map(w=>w.diagram),...r?(i.sensors??[]).map(w=>w.diagram).filter(Boolean):[]]),d=new Map(i.pipes.map(w=>[w.id,w])),_=new Map,y=(r?i.sensors??[]:[]).map(w=>{let b=d.get(w.target),S=w.diagram??c.get(w.target)?.diagram??[0,1].map(M=>(c.get(b.from).diagram[M]+c.get(b.to).diagram[M])/2),v=_.get(w.target)??0;return _.set(w.target,v+1),{s:w,xy:S,y:-36-v*21,w:Math.max(46,w.tag.length*7.2+10)}}),x=y.reduce((w,b)=>Math.max(w,b.xy[0]+b.w+28),u+72),p=y.reduce((w,b)=>Math.min(w,b.xy[1]+b.y-10),f-57),C=(w,b)=>{(w.key==="Enter"||w.key===" ")&&(w.preventDefault(),s(b))};return Nt.createElement(jd,{extent:[l-72,p,x-l+72,h+70-p]},i.pipes.map(w=>{let[b,S]=c.get(w.from).diagram,[v,M]=c.get(w.to).diagram,m=v-b,T=M-S,P=M-Math.sign(T)*7,I=(b+v)/2,L=(S+P)/2,N=`M ${b} ${S} L ${b+m*.31} ${S} L ${b+m*.69} ${P} L ${v} ${P}`,V=Math.atan2(T,m*.38)*180/Math.PI+(e.flow10kSm3d[w.id]<0?180:0);return Nt.createElement("g",{key:w.id,role:"button",tabIndex:"0","aria-label":w.id,"aria-pressed":n===w.id,onKeyDown:F=>C(F,w.id),onClick:()=>s(w.id),className:"sn-hit"},n===w.id&&Nt.createElement("path",{d:N,fill:"none",className:"sn-pipe-halo",strokeWidth:"15"}),Nt.createElement("path",{d:N,fill:"none",stroke:t.color(w),strokeWidth:1.5+w.dn/220,strokeDasharray:e.flow10kSm3d[w.id]===0?"5 3":void 0,strokeLinejoin:"round"}),Nt.createElement("path",{d:N,fill:"none",stroke:"transparent",strokeWidth:"18"}),e.flow10kSm3d[w.id]!==0&&Nt.createElement("path",{d:"M-5 -5L5 0L-5 5",transform:`translate(${I} ${L}) rotate(${V})`,fill:t.color(w),stroke:"var(--sn-sheet)",strokeWidth:"1"}),Nt.createElement("text",{x:I,y:L-12,textAnchor:"middle",className:"sn-pipe-id"},w.id))}),i.nodes.map(w=>Nt.createElement("g",{key:w.id,className:"sn-hit",transform:`translate(${w.diagram.join(" ")})`,role:"button",tabIndex:"0","aria-label":w.name,"aria-pressed":w.id===n,onKeyDown:b=>C(b,w.id),onClick:()=>s(w.id)},Nt.createElement("title",null,w.name," \xB7 ",Fr[w.type]," \xB7 ",e.pressureMPa[w.id]," MPa(a)"),Nt.createElement("rect",{x:"-20",y:"-19",width:"40",height:"38",rx:"3",className:"sn-node-back",strokeWidth:"1"}),Nt.createElement(al,{type:w.type}),Nt.createElement("text",{textAnchor:"middle",y:"37",className:"sn-node-name"},w.name),Nt.createElement("text",{textAnchor:"middle",y:"52",className:"sn-pipe-id"},w.id))),y.map(({s:w,xy:b,y:S,w:v})=>Nt.createElement("g",{key:w.tag,transform:`translate(${b.join(" ")})`,role:"button",tabIndex:"0","aria-label":"\u6D4B\u70B9 "+w.tag,"aria-pressed":a===w.tag,className:"sn-instrument-tag",onClick:()=>o(w),onKeyDown:M=>{(M.key==="Enter"||M.key===" ")&&(M.preventDefault(),o(w))}},Nt.createElement("circle",{r:"2"}),Nt.createElement("path",{d:`M0 0 l10 ${S+8} h11`,fill:"none",strokeWidth:".8"}),Nt.createElement("rect",{x:"21",y:S-4,width:v,height:"18",rx:"2"}),Nt.createElement("text",{x:"25",y:S+9},w.tag))))}var Ze=window.QwenPaw.host.React;function X_({type:i}){let e=Ze.useRef(null),[t,n]=Ze.useState("");return Ze.useEffect(()=>{let s=e.current,r;try{r=new qn({antialias:!0,alpha:!0})}catch{n("\u4E09\u7EF4\u89C6\u56FE\u9700\u8981 WebGL 2");return}n(""),r.setPixelRatio(Math.min(devicePixelRatio,2)),r.setClearColor(0,0),s.appendChild(r.domElement);let a=new gn,o=new Bt(32,1,.05,100),c=sl(i);a.add(c);let l=new Rt().setFromObject(c),u=l.getCenter(new R),f=l.getSize(new R).length(),h=new ji(12,24,7504786,9279649);h.material.transparent=!0,h.material.opacity=.33,h.position.y=l.min.y-.04,a.add(h),a.add(new oi(16777215,10068905,2.15));let d=new li(16777215,2.6);d.position.set(-4,7,5),a.add(d);let _=new Yn(o,r.domElement);_.target.copy(u),_.maxPolarAngle=Math.PI*.85,_.minDistance=f*.54,_.maxDistance=f*4.8;function y(){let{clientWidth:w,clientHeight:b}=s;!w||!b||(o.aspect=w/b,o.updateProjectionMatrix(),r.setSize(w,b),x())}function x(){r.render(a,o)}o.position.copy(u).addScaledVector(new R(1.2,.83,1.75).normalize(),f*1.85),_.update(),_.addEventListener("change",x);let p=new ResizeObserver(y);p.observe(s),y();let C=w=>{w.preventDefault(),n("\u4E09\u7EF4\u4E0A\u4E0B\u6587\u4E2D\u65AD\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9\u8BBE\u5907")};return r.domElement.addEventListener("webglcontextlost",C),()=>{p.disconnect(),_.dispose(),a.traverse(w=>{w.geometry?.dispose(),w.material?.dispose()}),r.domElement.removeEventListener("webglcontextlost",C),r.dispose(),r.forceContextLoss(),s.replaceChildren()}},[i]),Ze.createElement("div",{className:"sn-part-webgl","aria-label":ci[i].name+"\u4E09\u7EF4\u6A21\u578B",ref:e},t&&Ze.createElement("span",{role:"alert"},t))}function Kd({initial:i="well"}){let[e,t]=Ze.useState(i),[n,s]=Ze.useState(""),r=Ze.useRef(null);Ze.useLayoutEffect(()=>{let c=r.current,l=c.querySelector('[aria-pressed="true"]');if(!l)return;let u=l.getBoundingClientRect(),f=c.getBoundingClientRect();(u.top<f.top||u.bottom>f.bottom)&&(c.scrollTop+=u.top-f.top-c.clientHeight*.35)},[e,n]);let a=ci[e],o=Object.values(ci).filter(c=>(c.name+c.tag+c.group).toLowerCase().includes(n.trim().toLowerCase()));return Ze.createElement("section",{className:"sn-library","aria-label":"\u8BBE\u5907\u56FE\u518C"},Ze.createElement("header",{className:"sn-page-head"},Ze.createElement("div",null,Ze.createElement("div",{className:"sn-context"},Ze.createElement(je,{name:"register"}),"\u5DE5\u7A0B\u8D44\u6599"),Ze.createElement("h2",null,"\u8BBE\u5907\u56FE\u518C")),Ze.createElement("span",{className:"sn-library-count"},Qc.length," \u4E2A\u5206\u7C7B \xB7 ",Object.keys(ci).length," \u7C7B\u8BBE\u5907")),Ze.createElement("div",{className:"sn-register"},Ze.createElement("nav",{"aria-label":"\u8BBE\u5907\u5206\u7C7B"},Ze.createElement("div",{className:"sn-index-head"},Ze.createElement("h3",null,"\u8BBE\u5907\u7D22\u5F15"),Ze.createElement("label",{className:"sn-search"},Ze.createElement(je,{name:"search"}),Ze.createElement("input",{type:"search","aria-label":"\u67E5\u627E\u8BBE\u5907",placeholder:"\u540D\u79F0\u6216\u4EE3\u53F7",value:n,onChange:c=>s(c.target.value)}))),Ze.createElement("div",{className:"sn-index-scroll",ref:r},Qc.map(c=>{let l=o.filter(u=>u.group===c);return l.length>0&&Ze.createElement("div",{key:c},Ze.createElement("h3",null,c),l.map(u=>Ze.createElement("button",{key:u.type,"aria-pressed":e===u.type,onClick:()=>t(u.type)},Ze.createElement("svg",{viewBox:"-18 -16 36 32","aria-hidden":"true"},Ze.createElement(al,{type:u.type})),u.name,Ze.createElement("code",null,u.tag))))}),!o.length&&Ze.createElement("p",{className:"sn-empty"},"\u65E0\u5339\u914D\u8BBE\u5907"))),Ze.createElement("article",null,Ze.createElement("header",null,Ze.createElement("div",null,Ze.createElement("small",null,a.group),Ze.createElement("h3",null,a.name)),Ze.createElement("code",null,a.tag)),Ze.createElement("div",{className:"sn-plates"},Ze.createElement("figure",null,Ze.createElement("figcaption",null,Ze.createElement(je,{name:"diagram"}),"\u4E8C\u7EF4\u56FE\u4F8B"),Ze.createElement("svg",{className:"sn-drawing",viewBox:"-38 -32 76 64","aria-label":a.name+"\u4E8C\u7EF4\u7B26\u53F7"},Ze.createElement("path",{d:"M-35 0H35M0 -29V29",fill:"none",stroke:"#b6bdbf",strokeDasharray:"3 1 .5 1",strokeWidth:".28"}),Ze.createElement(al,{type:e}))),Ze.createElement("figure",null,Ze.createElement("figcaption",null,Ze.createElement(je,{name:"cube"}),"\u4E09\u7EF4\u5916\u5F62"),Ze.createElement(X_,{type:e}))),Ze.createElement("dl",{className:"sn-spec"},Ze.createElement("dt",null,"\u7ED3\u6784\u7279\u5F81"),Ze.createElement("dd",null,a.detail),Ze.createElement("dt",null,"\u5C3A\u5BF8\u8BF4\u660E"),Ze.createElement("dd",null,"\u793A\u610F\u5916\u5F62\uFF0C\u975E\u6BD4\u4F8B\u7ED8\u5236")))))}var q_=[["WH-01","\u4E95\u573A\u6C47\u7BA1","manifold",70,185,0,80,126],["XV-01","\u91C7\u6C14\u5207\u65AD","esd",180,90,160,160,126],["V-01","\u6C14\u6DB2\u5206\u79BB","separator",317,90,310,160,126],["T-01","\u8131\u6C34\u5854","dehydrator",454,90,405,160,126],["PCV-01","\u5916\u8F93\u8C03\u538B","regulator",591,90,505,145,126],["FE-01","\u53CC\u5411\u8BA1\u91CF","meter",737,185,690,92,126],["BL-01","\u7AD9\u754C\u63A5\u53E3","flange",859,185,815,92,126],["CV-01","\u6CE8\u6C14\u6B62\u56DE","check",180,275,155,0,126],["AC-01","\u6392\u6C14\u7A7A\u51B7","cooler",317,275,281,12,126],["K-01","\u6CE8\u6C14\u538B\u7F29","compressor",454,275,405,0,126],["F-01","\u5438\u6C14\u8FC7\u6EE4","filter",591,275,543,12,126]],Y_=[["WH-01","XV-01"],["XV-01","V-01"],["V-01","T-01"],["T-01","PCV-01"],["PCV-01","FE-01"],["FE-01","BL-01"],["FE-01","F-01"],["F-01","K-01"],["K-01","AC-01"],["AC-01","CV-01"],["CV-01","WH-01"]],ef=q_.map(([i,e,t,n,s,r,a,o])=>({id:i,name:e,type:t,diagram:[n,s],enuM:[r,a,o]})),tf=Y_.map(([i,e],t)=>({id:"L-"+String(t+1).padStart(2,"0"),from:i,to:e,dn:t===5?350:250}));function $d(i,e,t){return{name:i,pressureMPa:Object.fromEntries(ef.map((n,s)=>[n.id,e[s]])),flow10kSm3d:Object.fromEntries(tf.map((n,s)=>[n.id,t[s]]))}}var Qd={version:1,name:"\u96C6\u6CE8\u7AD9\u5DE5\u827A\u6D41\u7A0B",source:"\u793A\u4F8B\u5DE5\u51B5",standard:"20 \xB0C \xB7 101.325 kPa(a)",nodes:ef,pipes:tf,cases:[$d("\u51AC\u5B63\u91C7\u6C14",[8.45,8.44,8.4,8.33,7.7,7.68,7.64,8.45,8.45,8.45,7.68],[92,92,92,92,92,92,0,0,0,0,0]),$d("\u590F\u5B63\u6CE8\u6C14",[9.42,9.42,9.42,9.42,7.69,7.69,7.73,9.46,9.49,9.54,7.66],[0,0,0,0,0,-67,67,67,67,67,67])]},nf={...Qd,...zr([["PT-411","V-01","pressure"],["FT-401","L-06","flow"],["TT-412","AC-01","temperature"],["PDT-413","L-03","differential"]],[[8.38,91.7,16.1,.08],[9.4,-67.3,29.8,0]],[{"AC-01":16},{"AC-01":30.2}],Qd.cases)};var ui=window.QwenPaw.host.React,ol=new R(0,1,0);function Z_(i,e,t,n,s){let r=t.clone().sub(e),a=new St(new zn(n,n,Math.max(r.length(),.001),14),s);return a.position.copy(e).lerp(t,.5),a.quaternion.setFromUnitVectors(ol,r.normalize()),i.add(a),a}function j_(i,e,t,n,s){let r=new qn({antialias:!0,alpha:!0});r.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),r.setClearColor(0,0),i.appendChild(r.domElement);let a=new gn,o=new Bt(37,1,.1,2e3),c=new Yn(o,r.domElement);c.maxPolarAngle=Math.PI*.48,c.minDistance=3,c.maxDistance=330;let[[l,u],[f,h],[d,_]]=il([...e.nodes.map(O=>O.enuM),...(e.sensors??[]).map(O=>O.enuM).filter(Boolean),...e.pipes.flatMap(O=>O.viaM??[])]),y=80/Math.max(u-l,h-f,_-d,1),x=-1,p=([O,z,j])=>new R((O-(l+u)/2)*y,(j-d)*y+1.3,((f+h)/2-z)*y),C=new Map(e.nodes.map(O=>[O.id,p(O.enuM)])),w=O=>new ai({color:O,roughness:.55}),b=new ji(120,30,7504786,9279649);b.material.transparent=!0,b.material.opacity=.33,b.position.y=x,a.add(b),a.add(new oi(16777215,11257783,2));let S=new li(16775403,2.2);S.position.set(-30,80,30),a.add(S);let v=[],M=[],m=[],T=[],P=(O,z)=>(O.userData.id=z,v.push(O),O);function I(O,z,j,se,oe,ue,me,pe=0){let _e=new St(new kn(j,se,oe),w(me));return _e.position.copy(z),_e.position.x+=pe,_e.position.y+=ue,a.add(_e),P(_e,O)}let L=new Map(C),N=[],V=new Map;for(let O of e.nodes){let z=C.get(O.id),j=sl(O.type);j.scale.setScalar(1.28),j.position.copy(z);let se=e.pipes.find(pe=>pe.from===O.id||pe.to===O.id);if(se){let pe=se.from===O.id,_e=pe?se.viaM?.[0]:se.viaM?.at(-1),Me=(_e?p(_e):C.get(pe?se.to:se.from)).clone().sub(z).multiplyScalar(pe?1:-1);j.rotation.y=Math.atan2(-Me.z,Me.x)}j.traverse(pe=>{pe.isMesh&&P(pe,O.id)}),a.add(j);let oe=new Rt().setFromObject(j).min.y,ue=I(O.id,z,4.8,.18,2.9,oe-z.y-.09,12107712);T.push([O.id,ue]),V.set(O.id,{part:j,type:O.type});let me=document.createElement("span");me.textContent=O.id,me.className="sn-tag",i.appendChild(me),M.push([me,z.clone().addScaledVector(ol,4.4)])}function F(O,z){let{part:j,type:se}=V.get(O),oe={separator:[[-1.45,-.05,0],[1.45,1.585,0]],dehydrator:[[-1.45,-.05,0],[1.45,2.555,0]],filter:[[-1.45,-.05,0],[1.45,1.203,0]],well:[[-1.1,.18,0],[1.18,.18,0]],manifold:[[-1.65,0,0],[1.65,0,0],[-1,0,.99],[0,0,.99],[1,0,.99]],compressor:[[1.65,.06,0],[1.38,1.14,0]],blind:[[-1.45,0,0]],flange:[[-1.65,0,0],[1.65,0,0]]},ue=["pipe","tee","cross","gate","ball","globe","check","regulator","esd","choke","meter","orifice","support","blowdown","arrestor"];return(oe[se]??(ue.includes(se)?[[-1.45,0,0],[1.45,0,0]]:[[0,0,0]])).map(pe=>j.localToWorld(new R(...pe))).reduce((pe,_e)=>pe.distanceToSquared(z)<=_e.distanceToSquared(z)?pe:_e)}for(let O of e.pipes){let z=[C.get(O.from),...(O.viaM??[]).map(p),C.get(O.to)],j=z[1],se=z.at(-2);z[0]=F(O.from,j),z[z.length-1]=F(O.to,se);let oe=w(16777215),ue=Math.min(.39,Math.max(.14,O.dn/950)),me=0,pe=z[0],_e=z.at(-1);for(let We=1;We<z.length;We++){let Ke=z[We-1],Xe=z[We],it=Ke.distanceTo(Xe);it>me&&(me=it,pe=Ke,_e=Xe),it>0&&P(Z_(a,Ke,Xe,ue,oe),O.id)}let ee=_e.clone().sub(pe).normalize(),Me=new St(new lr(ue*2.35,ue*5.8,12),w(16777215));Me.position.copy(pe).lerp(_e,.52),a.add(Me),P(Me,O.id),m.push([O,oe,Me,ee]),L.set(O.id,Me.position)}let X=new Map;for(let O of e.sensors??[]){let z=O.enuM?p(O.enuM):L.get(O.target),j=document.createElement("button");j.className="sn-tag sn-sensor3d",j.textContent=O.tag,j.setAttribute("aria-label","\u6D4B\u70B9 "+O.tag),j.onclick=()=>n(O),i.appendChild(j);let se=X.get(O.target)??0;X.set(O.target,se+1),j.style.marginTop=-15-17*se+"px",M.push([j,z.clone().addScaledVector(ol,2.2)]),N.push([j,O.tag])}let H=new St(new Zi(2.7,.13,8,48),new Xi({color:1334354}));H.rotation.x=Math.PI/2,a.add(H);function $(){r.render(a,o);for(let[O,z]of M){let j=z.clone().project(o);O.style.left=50+50*j.x+"%",O.style.top=50-50*j.y+"%",O.hidden=Math.abs(j.x)>1||Math.abs(j.y)>1||Math.abs(j.z)>1}}function Q(){let O=i.clientWidth,z=i.clientHeight;!O||!z||(o.aspect=O/z,o.updateProjectionMatrix(),r.setSize(O,z),$())}function de(){c.target.set(0,(_-d)*y*.45,0),o.position.copy(c.target).add(new R(24,42,58).multiplyScalar(Math.max(1,1.75/o.aspect))),c.update()}c.addEventListener("change",$);let fe=new ResizeObserver(Q);fe.observe(i),Q(),de();let ge=null,ze=r.domElement;function he(O){ge=[O.clientX,O.clientY]}function Ie(O){if(!ge||Math.hypot(O.clientX-ge[0],O.clientY-ge[1])>5)return;let z=ze.getBoundingClientRect(),j=new vr;j.setFromCamera(new Re(2*(O.clientX-z.left)/z.width-1,1-2*(O.clientY-z.top)/z.height),o);let se=j.intersectObjects(v,!1)[0];se&&t(se.object.userData.id)}let q=O=>{O.preventDefault(),s("\u4E09\u7EF4\u56FE\u5F62\u4E0A\u4E0B\u6587\u4E2D\u65AD\uFF0C\u53EF\u5207\u56DE\u4E8C\u7EF4\u540E\u91CD\u8BD5\u3002")};return ze.addEventListener("pointerdown",he),ze.addEventListener("pointerup",Ie),ze.addEventListener("webglcontextlost",q),{reset:de,update(O,z,j,se,oe){for(let[ue,me]of N)ue.style.display=se?"":"none",ue.setAttribute("aria-pressed",String(oe===me));for(let[ue,me,pe,_e]of m)me.color.set(z.color(ue)),me.emissive.set(ue.id===j?1393725:0),pe.material.color.copy(me.color),pe.visible=O.flow10kSm3d[ue.id]!==0,pe.quaternion.setFromUnitVectors(ol,_e.clone().multiplyScalar(O.flow10kSm3d[ue.id]<0?-1:1)),ue.id===j&&H.position.copy(pe.position);for(let[ue,me]of T)me.material.color.set(ue===j?5552540:13030860),ue===j&&H.position.copy(C.get(ue));$()},dispose(){fe.disconnect(),c.dispose(),ze.removeEventListener("webglcontextlost",q),ze.removeEventListener("pointerdown",he),ze.removeEventListener("pointerup",Ie),a.traverse(O=>{O.geometry?.dispose(),O.material?.dispose()}),r.dispose(),r.forceContextLoss(),i.replaceChildren()}}}function sf({model:i,c:e,colors:t,selected:n,onPick:s,onSensor:r,showSensors:a,sensorTag:o}){let c=ui.useRef(null),l=ui.useRef(null),[u,f]=ui.useState("");return ui.useEffect(()=>{f("");try{l.current=j_(c.current,i,s,r,f)}catch{f("\u5F53\u524D\u73AF\u5883\u65E0\u6CD5\u542F\u7528 WebGL 2\uFF0C\u53EF\u4F7F\u7528\u4E8C\u7EF4\u5DE5\u827A\u56FE\u67E5\u770B\u540C\u4E00\u7EC4\u6570\u636E\u3002")}return()=>{l.current?.dispose(),l.current=null}},[i,s,r]),ui.useEffect(()=>{l.current?.update(e,t,n,a,o)},[e,t,n,i,a,o]),ui.createElement("div",{className:"sn-space"},ui.createElement("div",{className:"sn-webgl",ref:c}),u?ui.createElement("p",{role:"alert"},u):ui.createElement("button",{className:"sn-reset",onClick:()=>l.current?.reset()},"\u590D\u4F4D\u89C6\u89D2"))}var rf=`/* Workbench chrome shares the console's theme, density and type scale. */
.sn-app {
  --sn-bg: var(--app-bg, #f5f6f8);
  --sn-card: var(--app-surface, #fff);
  --sn-soft: var(--app-surface-subtle, #f7f8fa);
  --sn-inset: var(--app-surface-sunken, #f2f4f6);
  --sn-ink: var(--app-text, #25292e);
  --sn-muted: var(--app-card-muted, var(--app-text-secondary, #626b74));
  --sn-line: var(--app-border, #e0e3e7);
  --sn-rule: var(--app-border-subtle, #ecedef);
  --sn-control-border: var(--app-border-strong, #cbd0d6);
  --sn-accent: var(--app-action-link, var(--app-accent-text, #245caa));
  --sn-selected: color-mix(in srgb, var(--sn-accent) 9%, var(--sn-card));
  --sn-hover: var(--app-state-hover-bg, #eff1f4);
  --sn-caption: var(--app-font-caption, 12px);
  --sn-secondary: var(--app-font-secondary, 13px);
  --sn-body: var(--app-font-body, 14px);
  --sn-subtitle: var(--app-font-subtitle, 16px);
  --sn-title: var(--app-font-title, 20px);
  --sn-control: var(--app-control-sm, 32px);
  --sn-round: min(var(--app-radius, 10px), 9px);
  --sn-mono: "Cascadia Code", Consolas, "SFMono-Regular", monospace;
  --sn-sheet: color-mix(in srgb, var(--sn-card) 96%, #798da1);
  --sn-gridline: color-mix(in srgb, var(--sn-muted) 10%, transparent);
  --sn-draw-ink: color-mix(in srgb, var(--sn-ink) 78%, #4e6c80);
  --sn-tag-ink: color-mix(in srgb, var(--sn-ink) 73%, #3b7088);
  display: block;
  width: 100%;
  min-width: 0;
  height: 100%;
  min-height: 0;
  color: var(--sn-ink);
  background: var(--sn-card);
  font:
    var(--sn-body) / 1.5 -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    "Microsoft YaHei UI",
    sans-serif;
  font-variant-numeric: tabular-nums;
  container: sn-workbench / inline-size;
}
.sn-app *,
.sn-app *::before,
.sn-app *::after {
  box-sizing: border-box;
}
.sn-app [hidden] {
  display: none !important;
}
.sn-app :is(h1, h2, h3, h4, p, dl, dt, dd, figure) {
  margin: 0;
}
.sn-app :is(button, select, input) {
  font: inherit;
  color: inherit;
}
.sn-app button,
.sn-app select,
.sn-app input:is([type="search"], :not([type])) {
  border: 1px solid var(--sn-control-border);
  border-radius: 6px;
  background: var(--sn-card);
  min-height: var(--sn-control);
  min-width: 0;
  padding: 4px 9px;
  font-size: var(--sn-secondary);
}
.sn-app button {
  cursor: pointer;
  line-height: 1.4;
}
.sn-app button:enabled:hover {
  background: var(--sn-hover);
}
.sn-app button:disabled {
  opacity: var(--app-disabled-opacity, 0.5);
  cursor: default;
}
.sn-app :is(button, select, input, summary, [tabindex]):focus-visible {
  outline: 2px solid var(--app-focus-ring, var(--sn-accent));
  outline-offset: 2px;
}
.sn-app button.sn-primary {
  background: var(--app-action-bg, var(--sn-accent));
  border-color: transparent;
  color: var(--app-action-fg, #fff);
}
.sn-app button.sn-primary:hover {
  background: var(--app-action-hover, var(--sn-accent));
}
.sn-app select {
  cursor: pointer;
}
.sn-app small {
  color: var(--sn-muted);
  font-size: var(--sn-caption);
}
.sn-app code,
.sn-code,
.sn-table-link {
  font-family: var(--sn-mono);
}
.sn-icon {
  width: var(--app-icon-md, 16px);
  height: var(--app-icon-md, 16px);
  flex: none;
  vertical-align: middle;
}
.sn-layout {
  display: grid;
  grid-template-columns: 184px minmax(0, 1fr);
  height: 100%;
  min-height: 0;
}
.sn-rail {
  display: flex;
  flex-direction: column;
  background: var(--sn-card);
  border-right: 1px solid var(--sn-line);
  padding: 0 12px 14px;
  min-height: 0;
  overflow: auto;
}
.sn-brand {
  display: flex;
  gap: 10px;
  align-items: center;
  min-height: 78px;
  padding: 8px 6px;
  border-bottom: 1px solid var(--sn-rule);
}
.sn-brand-mark {
  color: var(--sn-card);
  background: var(--sn-ink);
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: grid;
  place-items: center;
}
.sn-brand-mark .sn-icon {
  width: 22px;
  height: 22px;
}
.sn-brand h1 {
  font-size: var(--sn-subtitle);
  font-weight: 680;
  letter-spacing: 0.03em;
}
.sn-nav {
  display: grid;
  gap: 24px;
  padding: 21px 0;
}
.sn-nav-group,
.sn-files {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.sn-nav h2,
.sn-files h2 {
  font-size: var(--sn-caption);
  color: var(--sn-muted);
  font-weight: 550;
  line-height: 1.5;
  padding: 0 9px 5px;
}
.sn-nav button,
.sn-files button {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  min-height: var(--app-control-md, 36px);
  border: 0;
  background: transparent;
  text-align: left;
  padding: 7px 10px;
}
.sn-nav button[aria-pressed="true"],
.sn-nav button[aria-pressed="true"]:hover {
  color: var(--sn-accent);
  background: var(--sn-selected);
  font-weight: 650;
}
.sn-files {
  margin-top: auto;
  border-top: 1px solid var(--sn-rule);
  padding-top: 14px;
}
.sn-files button {
  font-size: var(--sn-secondary);
  min-height: var(--sn-control);
}
.sn-content {
  min-width: 0;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
  padding: 0 clamp(14px, 1.6vw, 26px) 14px;
  background: var(--sn-bg);
}
.sn-page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px 16px;
  padding: 15px 87px 16px 0;
  min-height: 80px;
}
.sn-page-head h2 {
  font-size: calc(var(--sn-title) * 1.13);
  font-weight: 660;
  letter-spacing: 0.01em;
  line-height: 1.35;
  margin-top: 4px;
}
.sn-context,
.sn-case,
.sn-actions,
.sn-tabs,
.sn-plot-tools,
.sn-meas-toggle,
.sn-chips,
.sn-pane-head h2,
.sn-pane-head h3,
.sn-plates figcaption,
.sn-meas-time > span {
  display: flex;
  align-items: center;
  gap: 7px;
}
.sn-context,
.sn-case,
.sn-library-count {
  font-size: var(--sn-secondary);
  color: var(--sn-muted);
}
.sn-context .sn-icon {
  width: 15px;
  height: 15px;
}
.sn-source {
  border-inline-start: 1px solid var(--sn-control-border);
  line-height: 1;
  padding-inline-start: 9px;
  margin-inline-start: 2px;
}
.sn-case {
  gap: 9px;
}
.sn-case select {
  min-width: 112px;
}
.sn-actions {
  gap: 6px;
  flex-wrap: wrap;
}
.sn-actions button,
.sn-manual,
.sn-chips button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}
.sn-panel,
.sn-project-strip,
.sn-register {
  border: 1px solid var(--sn-line);
  border-radius: var(--sn-round);
  background: var(--sn-card);
  overflow: hidden;
  min-width: 0;
}
.sn-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) clamp(234px, 21%, 295px);
  gap: 12px;
  align-items: stretch;
}
.sn-pane-head,
.sn-plot-head,
.sn-dock-head,
.sn-legend,
.sn-meas-time,
.sn-sheet-footer,
.sn-pager,
.sn-attribute-head,
.sn-staged {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px 12px;
}
.sn-pane-head,
.sn-plot-head {
  min-height: 51px;
  border-bottom: 1px solid var(--sn-line);
  padding: 9px 12px;
}
.sn-pane-head h2,
.sn-pane-head h3,
.sn-index-head h3 {
  font-size: var(--sn-body);
  font-weight: 640;
}
.sn-plot-head {
  flex-wrap: wrap;
}
.sn-tabs {
  border: 1px solid var(--sn-line);
  border-radius: 7px;
  padding: 2px;
  background: var(--sn-inset);
  gap: 1px;
}
.sn-tabs button {
  display: flex;
  align-items: center;
  gap: 5px;
  min-height: 26px;
  border: 1px solid transparent;
  background: transparent;
  border-radius: 5px;
  padding: 3px 8px;
  font-size: var(--sn-secondary);
  color: var(--sn-muted);
}
.sn-tabs button[aria-pressed="true"] {
  background: var(--sn-card);
  border-color: var(--sn-control-border);
  color: var(--sn-ink);
  font-weight: 630;
}
.sn-plot-tools {
  gap: 9px;
  flex-wrap: wrap;
}
.sn-plot-tools select {
  max-width: 12em;
}
.sn-meas-toggle {
  font-size: var(--sn-secondary);
  white-space: nowrap;
  cursor: pointer;
  gap: 4px;
}
.sn-meas-toggle input {
  margin: 0;
  accent-color: var(--app-action-bg, var(--sn-accent));
}
.sn-app button.sn-icon-button {
  display: grid;
  place-items: center;
  width: var(--sn-control);
  padding: 0;
}
.sn-plot {
  display: flex;
  flex-direction: column;
}
.sn-canvas {
  position: relative;
  min-height: 0;
  height: clamp(316px, 44vh, 520px);
}
.sn-legend {
  margin-top: auto;
  border-top: 1px solid var(--sn-line);
  flex-wrap: wrap;
  min-height: 34px;
  padding: 6px 12px;
  color: var(--sn-muted);
  font-size: var(--sn-caption);
}
.sn-legend > div {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.sn-legend b {
  font: inherit;
  font-family: var(--sn-mono);
  color: var(--sn-ink);
}
.sn-legend i {
  display: inline-flex;
  overflow: hidden;
  border-radius: 2px;
}
.sn-legend u {
  width: 10px;
  height: 5px;
}
.sn-inspector {
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 0;
}
.sn-inspector .sn-pane-head {
  padding-inline: 15px;
}
.sn-detail {
  padding: 13px 15px 15px;
  overflow: auto;
  flex: 1 1 0;
  min-height: 0;
  scrollbar-width: thin;
}
.sn-code,
.sn-register article header > code,
.sn-object-detail header > code {
  display: inline-block;
  max-width: 100%;
  color: var(--sn-accent);
  background: var(--sn-selected);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: var(--sn-secondary);
  font-weight: 650;
  overflow-wrap: anywhere;
}
.sn-detail h3 {
  font-size: var(--sn-subtitle);
  font-weight: 630;
  line-height: 1.45;
  margin: 6px 0 12px;
}
.sn-reading {
  border-block: 1px solid var(--sn-rule);
  padding: 9px 0 10px;
  margin-bottom: 4px;
}
.sn-reading small {
  display: block;
}
.sn-reading strong {
  display: block;
  font: 600 calc(var(--sn-title) * 1.32) / 1.4 var(--sn-mono);
  letter-spacing: -0.035em;
}
.sn-reading em {
  font:
    normal 400 var(--sn-caption) / 1.4 "Segoe UI",
    "Microsoft YaHei UI",
    sans-serif;
  color: var(--sn-muted);
  letter-spacing: 0;
  white-space: nowrap;
}
.sn-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: baseline;
  gap: 6px;
  padding: 5px 0;
  font-size: var(--sn-secondary);
}
.sn-row dt,
.sn-link-title {
  color: var(--sn-muted);
}
.sn-row dd {
  text-align: right;
  overflow-wrap: anywhere;
}
.sn-detail h4,
.sn-attribute-head h4 {
  font-size: var(--sn-secondary);
  font-weight: 610;
}
.sn-link-title {
  border-top: 1px solid var(--sn-rule);
  padding: 10px 0 6px;
  margin-top: 5px !important;
}
.sn-chips {
  gap: 5px;
  flex-wrap: wrap;
}
.sn-chips button {
  min-height: 26px;
  font-size: var(--sn-caption);
  padding: 2px 7px;
}
.sn-chips .sn-icon {
  width: 11px;
  height: 11px;
  color: var(--sn-muted);
}
.sn-manual {
  margin-top: 10px;
}
.sn-instrument {
  padding: 9px;
  background: var(--sn-selected);
  border-radius: 6px;
  margin-bottom: 10px;
}
.sn-instrument h4 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 7px;
  margin-bottom: 4px;
}
.sn-instrument .sn-row {
  padding: 2px 0;
}
.sn-dock {
  margin-top: 12px;
}
.sn-dock-head {
  flex-wrap: wrap;
  border-bottom: 1px solid var(--sn-line);
  padding: 0 12px;
  min-height: 47px;
}
.sn-data-tabs {
  display: flex;
  align-self: stretch;
  gap: 15px;
}
.sn-data-tabs button {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 43px;
  padding: 0 2px;
  border: 0;
  border-radius: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  font-size: var(--sn-body);
  color: var(--sn-muted);
}
.sn-data-tabs button[aria-selected="true"] {
  color: var(--sn-ink);
  border-bottom-color: var(--sn-accent);
  font-weight: 630;
}
.sn-data-tabs span {
  background: var(--sn-inset);
  color: var(--sn-muted);
  font: 500 var(--sn-caption) / 1.5 var(--sn-mono);
  border-radius: 4px;
  padding: 0 5px;
}
.sn-dock .sn-actions {
  padding: 5px 0;
}
.sn-meas-time,
.sn-ez-caption,
.sn-sheet-footer,
.sn-pager {
  color: var(--sn-muted);
  font-size: var(--sn-caption);
}
.sn-meas-time {
  padding: 7px 12px;
  flex-wrap: wrap;
}
.sn-meas-time > span {
  flex-wrap: wrap;
}
.sn-meas-time time {
  font-variant-numeric: tabular-nums;
}
.sn-sheet-footer {
  padding: 10px 1px;
  flex-wrap: wrap;
}
.sn-scroll,
.sn-ez-scroll,
.sn-ez-attributes {
  overflow: auto;
}
.sn-app table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: var(--sn-secondary);
  line-height: 1.45;
  white-space: nowrap;
}
.sn-app td,
.sn-app th {
  padding: 6px 12px;
  text-align: left;
  height: var(--app-row-compact, 36px);
  border: 0;
  border-bottom: 1px solid var(--sn-rule);
}
.sn-app th {
  color: var(--sn-muted);
  font-weight: 540;
  background: var(--sn-soft);
}
.sn-app thead th {
  position: sticky;
  top: 0;
  z-index: 1;
}
.sn-app tbody tr:last-child > * {
  border-bottom: 0;
}
.sn-scroll tbody tr,
.sn-object-list tbody tr {
  cursor: pointer;
}
.sn-scroll tbody tr:hover,
.sn-object-list tbody tr:hover {
  background: var(--sn-hover);
}
.sn-app tr.sel {
  background: var(--sn-selected);
}
.sn-app tr.sel td:first-child {
  box-shadow: inset 2px 0 var(--sn-accent);
}
.sn-app .sn-table-link {
  padding: 0;
  min-height: 24px;
  border: 0;
  border-radius: 1px;
  background: transparent;
  color: var(--sn-accent);
  font: 550 var(--sn-secondary) / 1.4 var(--sn-mono);
  text-align: left;
}
.sn-sensor-table :is(th, td):nth-child(n + 5):nth-child(-n + 7),
.sn-pipe-table :is(th, td):nth-child(n + 3) {
  text-align: right;
}
.sn-status {
  white-space: nowrap;
}
.sn-status[data-comparable="true"]::before {
  content: "";
  display: inline-block;
  width: 5px;
  height: 5px;
  background: var(--app-success-text, #39815d);
  border-radius: 50%;
  margin-right: 5px;
  vertical-align: 0.18em;
}
.sn-notice,
.sn-staged {
  padding: 9px 13px;
  border: 1px solid var(--sn-line);
  border-radius: 6px;
  margin-block: 6px !important;
  background: var(--sn-card);
  overflow-wrap: anywhere;
  font-size: var(--sn-secondary);
}
.sn-error {
  color: var(--app-error-text, #bb372a);
}
.sn-empty {
  padding: 20px 14px;
  font-size: var(--sn-secondary);
  color: var(--sn-muted);
}
.sn-layout[data-focus="true"] {
  grid-template-columns: minmax(0, 1fr);
}
.sn-layout[data-focus="true"]
  :is(.sn-rail, .sn-summary, .sn-inspector, .sn-dock, .sn-sheet-footer) {
  display: none;
}
.sn-layout[data-focus="true"] .sn-grid {
  grid-template-columns: minmax(0, 1fr);
}
.sn-layout[data-focus="true"] .sn-content {
  padding-top: 8px;
}
.sn-layout[data-focus="true"] .sn-canvas {
  height: max(310px, calc(100dvh - 156px));
}
.sn-layout[data-focus="true"] .sn-plot-head {
  padding-right: 92px;
}
.sn-layout[data-focus="true"]
  .sn-ez
  > :is(.sn-page-head, .sn-project-strip, .sn-project-views, .sn-relations),
.sn-layout[data-focus="true"] .sn-overview-aside {
  display: none;
}
.sn-layout[data-focus="true"] .sn-ez .sn-overview-grid {
  grid-template-columns: minmax(0, 1fr);
}
.sn-layout[data-focus="true"] .sn-ez .sn-assembly-stage {
  height: max(310px, calc(100dvh - 170px));
}
.sn-layout[data-focus="true"] .sn-assembly-head {
  padding-inline-end: 92px;
}
@container sn-workbench (max-width:1120px) {
  .sn-layout {
    grid-template-columns: 150px minmax(0, 1fr);
  }
  .sn-rail {
    padding-inline: 8px;
  }
  .sn-content {
    padding-inline: 12px;
  }
  .sn-grid {
    grid-template-columns: minmax(0, 1fr) 218px;
    gap: 8px;
  }
  .sn-plot-tools {
    gap: 5px;
  }
  .sn-plot-head {
    padding: 7px 8px;
    gap: 6px;
  }
  .sn-inspector .sn-pane-head,
  .sn-detail {
    padding-inline: 10px;
  }
}
@container sn-workbench (max-width:920px) {
  .sn-layout {
    display: flex;
    flex-direction: column;
  }
  .sn-rail {
    flex: none;
    overflow: visible;
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px 12px;
    border: 0;
    border-bottom: 1px solid var(--sn-line);
    padding: 8px 88px 8px 12px;
  }
  .sn-brand {
    min-height: 0;
    padding: 0;
    border: 0;
  }
  .sn-brand-mark {
    width: 27px;
    height: 27px;
  }
  .sn-nav,
  .sn-nav-group,
  .sn-files {
    display: flex;
    flex-direction: row;
    gap: 3px;
    align-items: center;
    padding: 0;
    margin: 0;
    border: 0;
    flex-wrap: wrap;
  }
  .sn-nav h2,
  .sn-files h2 {
    display: none;
  }
  .sn-nav button,
  .sn-files button {
    width: auto;
    padding: 3px 7px;
    min-height: 31px;
    gap: 4px;
  }
  .sn-files .sn-icon {
    display: none;
  }
  .sn-content {
    flex: 1;
  }
  .sn-page-head {
    padding-right: 0;
    min-height: 68px;
  }
  .sn-detail {
    padding: 10px;
  }
}
@container sn-workbench (max-width:710px) {
  .sn-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .sn-detail {
    flex: auto;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr);
    align-content: start;
    align-items: start;
    gap: 4px 15px;
  }
  .sn-detail > :is(.sn-code, h3, .sn-reading) {
    grid-column: 1;
    justify-self: start;
  }
  .sn-detail h3 {
    margin: 0;
  }
  .sn-reading {
    width: 100%;
    border: 0;
  }
  .sn-detail > dl {
    grid-column: 2;
    grid-row: 1 / span 3;
  }
  .sn-row {
    padding: 3px 0;
  }
  .sn-instrument {
    grid-column: 1/-1;
    grid-row: 4;
  }
  .sn-link-title {
    padding: 0;
    border: 0;
    justify-self: start;
  }
  .sn-chips {
    justify-content: end;
  }
  .sn-canvas {
    height: clamp(260px, 43vh, 380px);
  }
  .sn-content {
    padding-inline: 8px;
  }
  .sn-dock {
    margin-top: 8px;
  }
  .sn-dock-head {
    padding-inline: 9px;
    gap: 0 10px;
  }
}
@container sn-workbench (max-width:480px) {
  .sn-rail {
    display: grid;
    gap: 5px;
    padding: 9px;
  }
  .sn-nav {
    flex-wrap: wrap;
  }
  .sn-nav-group {
    display: contents;
  }
  .sn-nav .sn-icon {
    display: none;
  }
  .sn-canvas {
    height: clamp(230px, 62cqw, 300px);
  }
  .sn-nav button,
  .sn-files button {
    white-space: nowrap;
  }
  .sn-files {
    border-top: 1px solid var(--sn-rule);
    padding-top: 3px;
  }
  .sn-page-head {
    padding-block: 11px;
  }
  .sn-legend {
    gap: 4px;
  }
  .sn-meas-time {
    gap: 4px;
  }
  .sn-case {
    gap: 4px;
    font-size: var(--sn-caption);
  }
  .sn-case select {
    min-width: 0;
  }
  .sn-tabs button {
    padding: 4px 6px;
  }
  .sn-layout[data-focus="true"] .sn-plot-head {
    padding-top: 48px;
    padding-right: 8px;
  }
}
`;var af=`/* Drafting surfaces, the component register and the source-object browser. */
.sn-canvas,
.sn-drawing,
.sn-ez-wells {
  background-color: var(--sn-sheet);
  background-image: linear-gradient(var(--sn-gridline) 1px, transparent 1px),
    linear-gradient(90deg, var(--sn-gridline) 1px, transparent 1px);
  background-size: 32px 32px;
  background-position: center;
}
.sn-diagram,
.sn-space,
.sn-webgl {
  display: block;
  width: 100%;
  height: 100%;
}
.sn-diagram,
.sn-drawing {
  color: var(--sn-draw-ink);
}
.sn-hit,
.sn-instrument-tag {
  cursor: pointer;
}
.sn-node-name {
  font:
    600 14px "Segoe UI",
    "Microsoft YaHei UI",
    sans-serif;
  fill: var(--sn-draw-ink);
}
.sn-pipe-id {
  font: 12px var(--sn-mono);
  fill: var(--sn-muted);
}
.sn-diagram .sn-pipe-id,
.sn-diagram .sn-node-name {
  paint-order: stroke;
  stroke: var(--sn-sheet);
  stroke-width: 2.5;
  stroke-linejoin: round;
}
.sn-node-back {
  fill: var(--sn-sheet);
  stroke: transparent;
}
.sn-hit[aria-pressed="true"] .sn-node-back {
  fill: var(--sn-selected);
  stroke: var(--sn-accent);
}
.sn-pipe-halo {
  stroke: var(--sn-accent);
  opacity: 0.19;
}
.sn-instrument-tag path,
.sn-instrument-tag rect {
  stroke: var(--sn-tag-ink);
}
.sn-instrument-tag circle,
.sn-instrument-tag text {
  fill: var(--sn-tag-ink);
}
.sn-instrument-tag rect {
  fill: var(--sn-sheet);
  stroke-width: 0.7;
}
.sn-instrument-tag text {
  font: 12px var(--sn-mono);
}
.sn-instrument-tag[aria-pressed="true"] rect {
  fill: var(--sn-selected);
  stroke: var(--sn-accent);
  stroke-width: 1.6;
}
.sn-instrument-tag[aria-pressed="true"] text {
  fill: var(--sn-accent);
}
.sn-space,
.sn-webgl,
.sn-part-webgl,
.sn-ez-scene {
  position: relative;
  overflow: hidden;
  background: var(--sn-sheet);
}
.sn-space canvas,
.sn-part-webgl canvas,
.sn-ez-scene canvas {
  display: block;
  touch-action: none;
}
.sn-reset,
.sn-space p {
  position: absolute;
  top: 9px;
  right: 10px;
}
.sn-space p,
.sn-part-webgl [role="alert"] {
  padding: 8px 12px;
  background: var(--sn-card);
  color: var(--sn-ink);
  font-size: var(--sn-secondary);
}
.sn-tag {
  position: absolute;
  transform: translate(-50%, -75%);
  padding: 1px 4px;
  border: 1px solid var(--sn-control-border);
  border-radius: 3px;
  color: var(--sn-draw-ink);
  background: var(--sn-card);
  font: 550 11px var(--sn-mono);
  pointer-events: none;
}
.sn-app button.sn-sensor3d {
  pointer-events: auto;
  min-height: 0;
  color: var(--sn-tag-ink);
  background: var(--sn-sheet);
  border-color: var(--sn-tag-ink);
  font: 11px var(--sn-mono);
  padding: 2px 4px;
  border-radius: 3px;
  transform: translate(8px, -100%);
  z-index: 1;
}
.sn-app button.sn-sensor3d[aria-pressed="true"] {
  background: var(--sn-selected);
  border-color: var(--sn-accent);
  color: var(--sn-accent);
}
.sn-register {
  display: grid;
  grid-template-columns: clamp(190px, 23%, 264px) minmax(0, 1fr);
}
.sn-register nav {
  border-right: 1px solid var(--sn-line);
  min-width: 0;
}
.sn-index-head {
  padding: 14px 12px 11px;
  border-bottom: 1px solid var(--sn-line);
}
.sn-index-head h3 {
  margin-bottom: 8px;
}
.sn-search {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 9px;
  border: 1px solid var(--sn-control-border);
  border-radius: 6px;
  background: var(--sn-card);
  min-width: 0;
  color: var(--sn-muted);
}
.sn-search:focus-within {
  outline: 2px solid var(--sn-accent);
  outline-offset: 1px;
}
.sn-app .sn-search input {
  min-width: 0;
  width: 100%;
  border: 0;
  padding: 4px 0;
  background: transparent;
  outline: none;
  color: var(--sn-ink);
}
.sn-index-scroll {
  max-height: clamp(315px, calc(100dvh - 235px), 920px);
  overflow: auto;
  padding: 0 7px 12px;
  scrollbar-width: thin;
}
.sn-index-scroll h3 {
  padding: 14px 8px 4px;
  color: var(--sn-muted);
  font-size: var(--sn-caption);
  font-weight: 560;
}
.sn-index-scroll button {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  border: 0;
  min-height: var(--app-row-compact, 36px);
  padding: 5px 7px;
  text-align: left;
  background: transparent;
}
.sn-index-scroll button svg {
  flex: none;
  width: 24px;
  height: 21px;
  color: var(--sn-draw-ink);
}
.sn-index-scroll button code {
  margin-left: auto;
  font-size: var(--sn-caption);
  color: var(--sn-muted);
}
.sn-index-scroll button[aria-pressed="true"] {
  background: var(--sn-selected);
  color: var(--sn-accent);
  font-weight: 620;
}
.sn-index-scroll button[aria-pressed="true"] :is(code, svg) {
  color: inherit;
}
.sn-register article {
  padding: clamp(12px, 2vw, 25px);
  min-width: 0;
}
.sn-register article header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}
.sn-register article header h3 {
  font-size: var(--sn-title);
  margin-top: 3px;
}
.sn-plates {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
  border: 1px solid var(--sn-line);
  border-radius: 6px;
  overflow: hidden;
}
.sn-plates figure {
  min-width: 0;
}
.sn-plates figure + figure {
  border-left: 1px solid var(--sn-line);
}
.sn-plates figcaption {
  padding: 9px 12px;
  border-bottom: 1px solid var(--sn-line);
  font-size: var(--sn-secondary);
  font-weight: 580;
}
.sn-drawing,
.sn-part-webgl {
  display: block;
  width: 100%;
  height: clamp(230px, 35vh, 420px);
}
.sn-drawing g {
  stroke-width: 1.1;
  stroke-linecap: butt;
}
.sn-spec {
  display: grid;
  grid-template-columns: auto 1fr;
  margin-top: 13px !important;
  font-size: var(--sn-secondary);
}
.sn-spec > * {
  padding: 9px 7px;
  border-bottom: 1px solid var(--sn-rule);
}
.sn-spec dt {
  color: var(--sn-muted);
  padding-right: 16px;
}
.sn-project-strip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 20px;
  padding: 15px 17px;
}
.sn-project-id {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.sn-project-id > .sn-icon {
  width: 26px;
  height: 26px;
  color: var(--sn-muted);
}
.sn-project-id h3 {
  font-size: var(--sn-subtitle);
  font-weight: 610;
  overflow-wrap: anywhere;
}
.sn-project-strip dl {
  display: flex;
  gap: clamp(12px, 2vw, 32px);
}
.sn-project-strip dl div {
  border-left: 1px solid var(--sn-line);
  padding-left: clamp(10px, 1.3vw, 22px);
}
.sn-project-strip dt,
.sn-attribute-head span {
  color: var(--sn-muted);
  font-size: var(--sn-caption);
}
.sn-project-strip dd {
  font: 600 var(--sn-title) / 1.4 var(--sn-mono);
}
.sn-project-views {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px 14px;
  margin: 8px 2px 12px;
  color: var(--sn-muted);
  font-size: var(--sn-secondary);
}
.sn-project-views details[open] {
  width: 100%;
}
.sn-ez summary {
  cursor: pointer;
  padding: 3px 0;
}
.sn-ez-wells {
  display: block;
  border: 1px solid var(--sn-line);
  border-radius: 6px;
  width: 100%;
  height: 230px;
  margin-top: 6px;
}
.sn-ez-wells text {
  font: 12px sans-serif;
  fill: var(--sn-muted);
}
.sn-ez-wells g {
  cursor: pointer;
}
.sn-well-point {
  fill: var(--sn-tag-ink);
  stroke: var(--sn-sheet);
}
.sn-ez-columns {
  display: grid;
  grid-template-columns: minmax(0, 1.02fr) minmax(0, 1fr);
  gap: 12px;
  align-items: start;
}
.sn-object-list .sn-pane-head,
.sn-object-detail .sn-pane-head {
  padding: 11px 14px;
}
.sn-ez-controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
  padding: 9px 12px;
}
.sn-ez-controls .sn-search {
  flex: 1 1 145px;
}
.sn-ez-controls select {
  max-width: 100%;
}
.sn-object-list .sn-ez-controls select {
  min-width: 112px;
  max-width: 48%;
}
.sn-ez-scroll {
  height: clamp(290px, calc(100dvh - 370px), 740px);
}
.sn-ez table {
  white-space: normal;
  overflow-wrap: anywhere;
}
.sn-ez td,
.sn-ez th {
  padding: 6px 11px;
}
.sn-ez-scroll table {
  table-layout: fixed;
}
.sn-ez-scroll th:first-child {
  width: 43%;
}
.sn-ez-scroll th:last-child {
  width: 21%;
}
.sn-ez .sn-table-link {
  word-break: break-word;
}
.sn-pager,
.sn-attribute-head {
  padding: 8px 12px;
  border-top: 1px solid var(--sn-line);
}
.sn-object-detail .sn-pane-head > code {
  max-width: 53%;
}
.sn-object-detail details {
  border-bottom: 1px solid var(--sn-rule);
  padding: 6px 13px;
  font-size: var(--sn-secondary);
}
.sn-object-detail details p {
  padding-block: 5px;
  color: var(--sn-muted);
}
.sn-object-detail details .sn-ez-controls {
  padding-inline: 0;
}
.sn-object-detail > .sn-ez-controls {
  justify-content: space-between;
  font-size: var(--sn-secondary);
}
.sn-ez-scene {
  height: clamp(170px, 23vh, 330px);
}
.sn-ez-caption {
  padding: 5px 12px;
}
.sn-ez-attributes {
  max-height: 280px;
}
.sn-ez-attributes th {
  width: 32%;
}
.sn-ez-empty {
  display: grid;
  justify-items: center;
  gap: 10px;
  padding: 45px 20px;
  text-align: center;
}
.sn-ez-empty > .sn-icon {
  width: 32px;
  height: 32px;
  color: var(--sn-muted);
}
.sn-ez-empty p {
  color: var(--sn-muted);
  font-size: var(--sn-secondary);
}
@container sn-workbench (max-width:970px) {
  .sn-register {
    grid-template-columns: 182px minmax(0, 1fr);
  }
  .sn-ez-columns {
    gap: 8px;
  }
}
@container sn-workbench (max-width:710px) {
  .sn-ez-columns {
    grid-template-columns: minmax(0, 1fr);
  }
  .sn-ez-scroll {
    height: 270px;
  }
  .sn-project-strip {
    padding: 12px;
  }
  .sn-register {
    grid-template-columns: 155px minmax(0, 1fr);
  }
  .sn-index-scroll button {
    gap: 4px;
  }
  .sn-index-scroll button svg {
    width: 19px;
  }
  .sn-plates {
    grid-template-columns: minmax(0, 1fr);
  }
  .sn-plates figure + figure {
    border-left: 0;
    border-top: 1px solid var(--sn-line);
  }
  .sn-drawing,
  .sn-part-webgl {
    height: 200px;
  }
}
@container sn-workbench (max-width:500px) {
  .sn-register {
    grid-template-columns: minmax(0, 1fr);
  }
  .sn-register nav {
    border: 0;
    border-bottom: 1px solid var(--sn-line);
  }
  .sn-index-scroll {
    max-height: 155px;
  }
  .sn-index-head {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
  }
  .sn-index-head h3 {
    margin: 0;
  }
  .sn-project-strip dl {
    flex-wrap: wrap;
  }
  .sn-project-strip dl div:first-child {
    border: 0;
    padding-inline-start: 0;
  }
}

.sn-diagram[data-zoomed="true"] {
  touch-action: none;
  cursor: grab;
  user-select: none;
}
.sn-diagram[data-zoomed="true"]:active {
  cursor: grabbing;
}
.sn-zoom {
  display: flex;
  align-items: stretch;
  position: absolute;
  right: 10px;
  bottom: 9px;
  padding: 1px;
  border-radius: 6px;
  border: 1px solid var(--sn-control-border);
  background: var(--sn-card);
}
.sn-app .sn-zoom button {
  display: grid;
  place-items: center;
  border: 0;
  min-height: 26px;
  min-width: 27px;
  border-radius: 4px;
  padding: 2px 4px;
  font: var(--sn-caption) var(--sn-mono);
}
.sn-app .sn-zoom .sn-icon {
  width: 13px;
  height: 13px;
}
`;var Us=window.QwenPaw,le=Us.host.React;function th(i,e,t){let n=URL.createObjectURL(new Blob([e],{type:t})),s=document.createElement("a");s.href=n,s.download=i,s.click(),setTimeout(()=>URL.revokeObjectURL(n),2e3)}function $_(){let i=Us.host.useSelectedAgent?.()?.id??"default";return le.createElement(Q_,{key:i,agentId:i})}function Q_({agentId:i}){let[e,t]=le.useState(Or),[n,s]=le.useState("2D"),[r,a]=le.useState(0),[o,c]=le.useState("pressure"),[l,u]=le.useState("P-05"),[f,h]=le.useState(""),[d,_]=le.useState(null),[y,x]=le.useState(!0),[p,C]=le.useState(Us.host.fetch?"opening":"plan"),[w,b]=le.useState(void 0),[S,v]=le.useState("well"),[M,m]=le.useState(null),[T,P]=le.useState([]),[I,L]=le.useState(!1),N=le.useRef(Or),V=le.useRef(new Map),F=le.useRef(null),X=le.useRef(0),H=le.useRef(0),$=le.useRef(null),Q=le.useRef(null);le.useEffect(()=>{if(!Us.host.fetch)return;let ee=!0;async function Me(){try{let We=await Us.host.fetch("/surface-network/ezwalker?agent_id="+encodeURIComponent(i));if(!We.ok)throw Error("\u65E0\u6CD5\u8BFB\u53D6\u672C\u673A\u5DE5\u533A");let Ke=await We.json();if(!ee)return;b(Xe=>Xe===void 0?Ke:Xe),C(Xe=>Xe==="opening"?Ke?"overview":"plan":Xe)}catch{ee&&C(We=>We==="opening"?"overview":We)}}return Me(),()=>{ee=!1}},[i]);let de=le.useCallback(ee=>{u(ee),_(null)},[]),fe=le.useCallback(ee=>{u(ee.target),_(ee.tag),x(!0)},[]);function ge(ee){V.current.set(N.current,ee),t(ee)}let ze=le.useCallback(ee=>{C(ee),L(!1),h(""),Q.current&&(Q.current.scrollTop=0)},[]),he=le.useCallback(ee=>{ze(ee==="objects"?"ez":"overview")},[ze]);function Ie(ee){ze("plan"),N.current!==ee&&(N.current=ee,t(V.current.get(ee)??ee),a(0),de(ee===Or?"P-05":ee.pipes[0].id))}le.useEffect(()=>{if(!I)return;function ee(Me){Me.key!=="Escape"||Me.target!==window&&Me.target!==document.body&&!Q.current?.contains(Me.target)||(Me.preventDefault(),Me.stopImmediatePropagation(),L(!1),$.current?.focus())}return window.addEventListener("keydown",ee,!0),()=>window.removeEventListener("keydown",ee,!0)},[I]);async function q(ee){let Me=Array.from(ee.target.files),We=Me[0];if(ee.target.value="",!We)return;let Ke=++X.current;if(Me.some(Xe=>/\.(wlkx|wlp|db|package)$/i.test(Xe.name))){P(Me),ze("ez");return}try{if(Me.length!==1)throw Error("\u8BF7\u9009\u62E9\u4E00\u4E2A JSON \u6A21\u578B");if(We.size>5*1024*1024)throw Error("\u6587\u4EF6\u8D85\u8FC7 5 MB");let Xe=Wd(JSON.parse(await We.text()));if(Ke!==X.current)return;M&&V.current.delete(M),H.current++,m(Xe),Ie(Xe)}catch(Xe){Ke===X.current&&h("\u5BFC\u5165\u5931\u8D25 \xB7 "+Xe.message)}}let O=[[Or,"\u4E95\u573A\u96C6\u8F93","field"],[nf,"\u7AD9\u5185\u5DE5\u827A","station"],...M?[[M,"\u5BFC\u5165\u56FE\u7EB8","file"]]:[]],z=O.find(([ee])=>ee===N.current),j=N.current===M?"import-"+H.current:z[1],se=e.cases[r],oe=Xd(e,se,o),ue=n==="2D"?Jd:sf,me=le.createElement("button",{ref:$,className:"sn-icon-button",title:I?"\u8FD8\u539F\u5DE5\u4F5C\u53F0\uFF08Esc\uFF09":"\u653E\u5927\u56FE\u9762","aria-label":I?"\u8FD8\u539F\u5DE5\u4F5C\u53F0":"\u653E\u5927\u56FE\u9762","aria-pressed":I,onClick:()=>{L(ee=>!ee),Q.current&&(Q.current.scrollTop=0)}},le.createElement(je,{name:I?"collapse":"expand"})),pe=p==="plan",_e=p==="overview"||p==="ez";return le.createElement("main",{className:"sn-app","aria-label":"\u5730\u9762\u7BA1\u7F51"},le.createElement("style",null,rf+af),le.createElement("div",{className:"sn-layout","data-focus":I},le.createElement("div",{className:"sn-rail"},le.createElement("div",{className:"sn-brand"},le.createElement("span",{className:"sn-brand-mark"},le.createElement(je,{name:"network"})),le.createElement("h1",null,"\u5730\u9762\u7BA1\u7F51")),le.createElement("nav",{className:"sn-nav","aria-label":"\u5DE5\u7A0B\u5BFC\u822A"},le.createElement("div",{className:"sn-nav-group"},le.createElement("h2",null,"\u5DE5\u7A0B\u56FE\u7EB8"),w&&le.createElement("button",{"aria-pressed":p==="overview",onClick:()=>ze("overview")},le.createElement(je,{name:"network"}),"\u5DE5\u533A\u603B\u56FE"),O.map(([ee,Me,We])=>le.createElement("button",{key:Me,"aria-pressed":pe&&N.current===ee,onClick:()=>Ie(ee)},le.createElement(je,{name:We}),Me))),le.createElement("div",{className:"sn-nav-group"},le.createElement("h2",null,"\u5DE5\u7A0B\u8D44\u6599"),le.createElement("button",{"aria-pressed":p==="ez",onClick:()=>ze("ez")},le.createElement(je,{name:"folder"}),"eZWalker \u5DE5\u533A"),le.createElement("button",{"aria-pressed":p==="register",onClick:()=>ze("register")},le.createElement(je,{name:"register"}),"\u8BBE\u5907\u56FE\u518C"))),le.createElement("div",{className:"sn-files"},le.createElement("h2",null,"\u6A21\u578B\u6587\u4EF6"),le.createElement("input",{type:"file",multiple:!0,hidden:!0,accept:".json,.wlkx,.wlp,.db,.package","aria-label":"\u7BA1\u7F51\u6A21\u578B\u6587\u4EF6",ref:F,onChange:q}),le.createElement("button",{onClick:()=>F.current.click()},le.createElement(je,{name:"upload"}),"\u5BFC\u5165\u6A21\u578B"),le.createElement("button",{disabled:_e||p==="opening",onClick:()=>th("\u7BA1\u7F51\u6A21\u578B.json",JSON.stringify(e,null,2),"application/json")},le.createElement(je,{name:"download"}),"\u5BFC\u51FA\u6A21\u578B"),le.createElement("button",{disabled:_e||p==="opening",onClick:()=>th(se.name+"-\u7BA1\u6BB5.csv",Yd(e,se),"text/csv;charset=utf-8")},le.createElement(je,{name:"table"}),"\u5BFC\u51FA\u5DE5\u51B5 CSV"))),le.createElement("div",{className:"sn-content",ref:Q},f&&le.createElement("p",{className:"sn-notice sn-error",role:"alert"},f),(_e||w)&&le.createElement(Fd,{visible:_e,plotActions:me,initialInfo:w,page:p==="ez"?"objects":"overview",onPageChange:he,onProjectChange:b,files:T,onFiles:P,agentId:i,model:e,apply:ge}),p==="opening"?le.createElement("p",{className:"sn-empty",role:"status"},"\u6B63\u5728\u6253\u5F00\u672C\u673A\u5DE5\u533A\u2026"):_e?null:p==="register"?le.createElement(Kd,{initial:S}):le.createElement(le.Fragment,null,le.createElement("header",{className:"sn-page-head sn-summary"},le.createElement("div",null,le.createElement("div",{className:"sn-context"},le.createElement(je,{name:"folder"}),le.createElement("span",null,e.name),le.createElement("span",{className:"sn-source"},e.source)),le.createElement("h2",null,z[1])),le.createElement("label",{className:"sn-case"},"\u8FD0\u884C\u5DE5\u51B5",le.createElement("select",{value:r,onChange:ee=>a(+ee.target.value)},e.cases.map((ee,Me)=>le.createElement("option",{value:Me,key:Me},ee.name))))),le.createElement("div",{className:"sn-grid"},le.createElement("section",{className:"sn-panel sn-plot","aria-label":"\u7BA1\u7F51\u89C6\u56FE"},le.createElement("header",{className:"sn-plot-head"},le.createElement("div",{className:"sn-tabs",role:"group","aria-label":"\u56FE\u7EB8\u89C6\u56FE"},[["2D","\u4E8C\u7EF4\u5DE5\u827A\u56FE","diagram"],["3D","\u4E09\u7EF4\u7A7A\u95F4\u56FE","cube"]].map(([ee,Me,We])=>le.createElement("button",{key:ee,"aria-pressed":ee===n,onClick:()=>s(ee)},le.createElement(je,{name:We}),Me))),le.createElement("div",{className:"sn-plot-tools"},le.createElement("label",{className:"sn-meas-toggle"},le.createElement("input",{type:"checkbox",checked:y,onChange:ee=>x(ee.target.checked)}),"\u6D4B\u70B9\u4F4D\u53F7"),le.createElement("select",{"aria-label":"\u7BA1\u6BB5\u7740\u8272",value:o,onChange:ee=>c(ee.target.value)},le.createElement("option",{value:"pressure"},"\u5E73\u5747\u7AEF\u538B"),le.createElement("option",{value:"flow"},"\u6D41\u91CF\u7EDD\u5BF9\u503C")),me)),le.createElement("div",{className:"sn-canvas"},le.createElement(ue,{key:j,model:e,c:se,colors:oe,selected:l,onPick:de,showSensors:y,sensorTag:d,onSensor:fe})),le.createElement("div",{className:"sn-legend"},le.createElement("div",null,le.createElement("span",null,o==="pressure"?"\u5E73\u5747\u7AEF\u538B / MPa(a)":"\u6D41\u91CF / \u4E07\u6807\u65B9\xB7\u65E5\u207B\xB9"),le.createElement("b",null,oe.lo.toFixed(2)),le.createElement("i",null,eh.map(ee=>le.createElement("u",{key:ee,style:{background:ee}}))),le.createElement("b",null,oe.hi.toFixed(2))),le.createElement("span",null,n==="2D"?"\u7BAD\u5934\u793A\u6D41\u5411 \xB7 \u865A\u7EBF\u793A\u505C\u6D41":"\u5C40\u90E8 ENU\uFF08m\uFF09 \xB7 \u62D6\u52A8\u65CB\u8F6C / \u6EDA\u8F6E\u7F29\u653E"))),le.createElement(Zd,{model:e,c:se,selected:l,sensorTag:d,pick:de,openRegister:ee=>{v(ee),ze("register")}})),le.createElement(Od,{key:j,model:e,c:se,selected:l,onPick:de,sensorTag:d,onSensor:fe,apply:ge,download:th}),le.createElement("footer",{className:"sn-sheet-footer"},le.createElement("span",null,e.nodes.length," \u4E2A\u8282\u70B9 \xB7 ",e.pipes.length," \u6761\u7BA1\u6BB5"),le.createElement("span",null,"\u6C14\u91CF\u6807\u51B5\u3000",e.standard))))))}Us.registerRoutes("surface-network",[{path:"/apps/surface-network",component:$_,label:"\u5730\u9762\u7BA1\u7F51",icon:"\u25C7"}]);})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
