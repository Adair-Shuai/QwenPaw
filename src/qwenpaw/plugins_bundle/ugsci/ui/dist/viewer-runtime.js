var OilGasViewerRuntime=function(){"use strict";/**
 * @license
 * Copyright 2010-2023 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Is="160",Gn={ROTATE:0,DOLLY:1,PAN:2},Wn={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Yl=0,Zr=1,Kl=2,Qr=1,Jl=2,Kt=3,cn=0,Ct=1,Ft=2,hn=0,Xn=1,eo=2,to=3,no=4,Zl=5,yn=100,Ql=101,ec=102,io=103,so=104,tc=200,nc=201,ic=202,sc=203,Us=204,Ns=205,rc=206,oc=207,ac=208,lc=209,cc=210,hc=211,dc=212,uc=213,fc=214,pc=0,mc=1,gc=2,Vi=3,xc=4,_c=5,vc=6,yc=7,Os=0,Sc=1,bc=2,dn=0,Mc=1,Ec=2,Tc=3,wc=4,Ac=5,Cc=6,ro=300,jn=301,qn=302,Fs=303,Bs=304,Gi=306,ks=1e3,Vt=1001,zs=1002,Et=1003,oo=1004,Hs=1005,Bt=1006,Rc=1007,Ei=1008,un=1009,Lc=1010,Pc=1011,Vs=1012,ao=1013,fn=1014,pn=1015,Ti=1016,lo=1017,co=1018,Sn=1020,Dc=1021,Gt=1023,Ic=1024,Uc=1025,bn=1026,$n=1027,Nc=1028,ho=1029,Oc=1030,uo=1031,fo=1033,Gs=33776,Ws=33777,Xs=33778,js=33779,po=35840,mo=35841,go=35842,xo=35843,_o=36196,vo=37492,yo=37496,So=37808,bo=37809,Mo=37810,Eo=37811,To=37812,wo=37813,Ao=37814,Co=37815,Ro=37816,Lo=37817,Po=37818,Do=37819,Io=37820,Uo=37821,qs=36492,No=36494,Oo=36495,Fc=36283,Fo=36284,Bo=36285,ko=36286,zo=3e3,Mn=3001,Bc=3200,kc=3201,Ho=0,zc=1,kt="",xt="srgb",Jt="srgb-linear",$s="display-p3",Wi="display-p3-linear",Xi="linear",Ze="srgb",ji="rec709",qi="p3",Yn=7680,Vo=519,Hc=512,Vc=513,Gc=514,Go=515,Wc=516,Xc=517,jc=518,qc=519,Wo=35044,Xo="300 es",Ys=1035,Zt=2e3,$i=2001;class En{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const s=this._listeners[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const n=this._listeners[e.type];if(n!==void 0){e.target=this;const s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}}const _t=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let jo=1234567;const wi=Math.PI/180,Ai=180/Math.PI;function Kn(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(_t[i&255]+_t[i>>8&255]+_t[i>>16&255]+_t[i>>24&255]+"-"+_t[e&255]+_t[e>>8&255]+"-"+_t[e>>16&15|64]+_t[e>>24&255]+"-"+_t[t&63|128]+_t[t>>8&255]+"-"+_t[t>>16&255]+_t[t>>24&255]+_t[n&255]+_t[n>>8&255]+_t[n>>16&255]+_t[n>>24&255]).toLowerCase()}function ut(i,e,t){return Math.max(e,Math.min(t,i))}function Ks(i,e){return(i%e+e)%e}function $c(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function Yc(i,e,t){return i!==e?(t-i)/(e-i):0}function Ci(i,e,t){return(1-t)*i+t*e}function Kc(i,e,t,n){return Ci(i,e,1-Math.exp(-t*n))}function Jc(i,e=1){return e-Math.abs(Ks(i,e*2)-e)}function Zc(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function Qc(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function eh(i,e){return i+Math.floor(Math.random()*(e-i+1))}function th(i,e){return i+Math.random()*(e-i)}function nh(i){return i*(.5-Math.random())}function ih(i){i!==void 0&&(jo=i);let e=jo+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function sh(i){return i*wi}function rh(i){return i*Ai}function Js(i){return(i&i-1)===0&&i!==0}function oh(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function Yi(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function ah(i,e,t,n,s){const r=Math.cos,o=Math.sin,a=r(t/2),l=o(t/2),c=r((e+n)/2),h=o((e+n)/2),u=r((e-n)/2),d=o((e-n)/2),p=r((n-e)/2),g=o((n-e)/2);switch(s){case"XYX":i.set(a*h,l*u,l*d,a*c);break;case"YZY":i.set(l*d,a*h,l*u,a*c);break;case"ZXZ":i.set(l*u,l*d,a*h,a*c);break;case"XZX":i.set(a*h,l*g,l*p,a*c);break;case"YXY":i.set(l*p,a*h,l*g,a*c);break;case"ZYZ":i.set(l*g,l*p,a*h,a*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function Jn(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function Tt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}const Zs={DEG2RAD:wi,RAD2DEG:Ai,generateUUID:Kn,clamp:ut,euclideanModulo:Ks,mapLinear:$c,inverseLerp:Yc,lerp:Ci,damp:Kc,pingpong:Jc,smoothstep:Zc,smootherstep:Qc,randInt:eh,randFloat:th,randFloatSpread:nh,seededRandom:ih,degToRad:sh,radToDeg:rh,isPowerOfTwo:Js,ceilPowerOfTwo:oh,floorPowerOfTwo:Yi,setQuaternionFromProperEuler:ah,normalize:Tt,denormalize:Jn};class xe{constructor(e=0,t=0){xe.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(ut(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*s+e.x,this.y=r*s+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Ve{constructor(e,t,n,s,r,o,a,l,c){Ve.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c)}set(e,t,n,s,r,o,a,l,c){const h=this.elements;return h[0]=e,h[1]=s,h[2]=a,h[3]=t,h[4]=r,h[5]=l,h[6]=n,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],h=n[4],u=n[7],d=n[2],p=n[5],g=n[8],x=s[0],m=s[3],f=s[6],S=s[1],_=s[4],w=s[7],L=s[2],C=s[5],T=s[8];return r[0]=o*x+a*S+l*L,r[3]=o*m+a*_+l*C,r[6]=o*f+a*w+l*T,r[1]=c*x+h*S+u*L,r[4]=c*m+h*_+u*C,r[7]=c*f+h*w+u*T,r[2]=d*x+p*S+g*L,r[5]=d*m+p*_+g*C,r[8]=d*f+p*w+g*T,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8];return t*o*h-t*a*c-n*r*h+n*a*l+s*r*c-s*o*l}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=h*o-a*c,d=a*l-h*r,p=c*r-o*l,g=t*u+n*d+s*p;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const x=1/g;return e[0]=u*x,e[1]=(s*c-h*n)*x,e[2]=(a*n-s*o)*x,e[3]=d*x,e[4]=(h*t-s*l)*x,e[5]=(s*r-a*t)*x,e[6]=p*x,e[7]=(n*l-c*t)*x,e[8]=(o*t-n*r)*x,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,o,a){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-s*c,s*l,-s*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(Qs.makeScale(e,t)),this}rotate(e){return this.premultiply(Qs.makeRotation(-e)),this}translate(e,t){return this.premultiply(Qs.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Qs=new Ve;function qo(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Ki(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function lh(){const i=Ki("canvas");return i.style.display="block",i}const $o={};function Ri(i){i in $o||($o[i]=!0,console.warn(i))}const Yo=new Ve().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),Ko=new Ve().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),Ji={[Jt]:{transfer:Xi,primaries:ji,toReference:i=>i,fromReference:i=>i},[xt]:{transfer:Ze,primaries:ji,toReference:i=>i.convertSRGBToLinear(),fromReference:i=>i.convertLinearToSRGB()},[Wi]:{transfer:Xi,primaries:qi,toReference:i=>i.applyMatrix3(Ko),fromReference:i=>i.applyMatrix3(Yo)},[$s]:{transfer:Ze,primaries:qi,toReference:i=>i.convertSRGBToLinear().applyMatrix3(Ko),fromReference:i=>i.applyMatrix3(Yo).convertLinearToSRGB()}},ch=new Set([Jt,Wi]),Ye={enabled:!0,_workingColorSpace:Jt,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(i){if(!ch.has(i))throw new Error(`Unsupported working color space, "${i}".`);this._workingColorSpace=i},convert:function(i,e,t){if(this.enabled===!1||e===t||!e||!t)return i;const n=Ji[e].toReference,s=Ji[t].fromReference;return s(n(i))},fromWorkingColorSpace:function(i,e){return this.convert(i,this._workingColorSpace,e)},toWorkingColorSpace:function(i,e){return this.convert(i,e,this._workingColorSpace)},getPrimaries:function(i){return Ji[i].primaries},getTransfer:function(i){return i===kt?Xi:Ji[i].transfer}};function Zn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function er(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let Qn;class Jo{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Qn===void 0&&(Qn=Ki("canvas")),Qn.width=e.width,Qn.height=e.height;const n=Qn.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=Qn}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Ki("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=Zn(r[o]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Zn(t[n]/255)*255):t[n]=Zn(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let hh=0;class Zo{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:hh++}),this.uuid=Kn(),this.data=e,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(tr(s[o].image)):r.push(tr(s[o]))}else r=tr(s);n.url=r}return t||(e.images[this.uuid]=n),n}}function tr(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Jo.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let dh=0;class Pt extends En{constructor(e=Pt.DEFAULT_IMAGE,t=Pt.DEFAULT_MAPPING,n=Vt,s=Vt,r=Bt,o=Ei,a=Gt,l=un,c=Pt.DEFAULT_ANISOTROPY,h=kt){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:dh++}),this.uuid=Kn(),this.name="",this.source=new Zo(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new xe(0,0),this.repeat=new xe(1,1),this.center=new xe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ve,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,typeof h=="string"?this.colorSpace=h:(Ri("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=h===Mn?xt:kt),this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.needsPMREMUpdate=!1}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==ro)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case ks:e.x=e.x-Math.floor(e.x);break;case Vt:e.x=e.x<0?0:1;break;case zs:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case ks:e.y=e.y-Math.floor(e.y);break;case Vt:e.y=e.y<0?0:1;break;case zs:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}get encoding(){return Ri("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace===xt?Mn:zo}set encoding(e){Ri("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=e===Mn?xt:kt}}Pt.DEFAULT_IMAGE=null,Pt.DEFAULT_MAPPING=ro,Pt.DEFAULT_ANISOTROPY=1;class ft{constructor(e=0,t=0,n=0,s=1){ft.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*s+o[15]*r,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r;const l=e.elements,c=l[0],h=l[4],u=l[8],d=l[1],p=l[5],g=l[9],x=l[2],m=l[6],f=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-x)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+x)<.1&&Math.abs(g+m)<.1&&Math.abs(c+p+f-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const _=(c+1)/2,w=(p+1)/2,L=(f+1)/2,C=(h+d)/4,T=(u+x)/4,W=(g+m)/4;return _>w&&_>L?_<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(_),s=C/n,r=T/n):w>L?w<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(w),n=C/s,r=W/s):L<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(L),n=T/r,s=W/r),this.set(n,s,r,t),this}let S=Math.sqrt((m-g)*(m-g)+(u-x)*(u-x)+(d-h)*(d-h));return Math.abs(S)<.001&&(S=1),this.x=(m-g)/S,this.y=(u-x)/S,this.z=(d-h)/S,this.w=Math.acos((c+p+f-1)/2),this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class uh extends En{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new ft(0,0,e,t),this.scissorTest=!1,this.viewport=new ft(0,0,e,t);const s={width:e,height:t,depth:1};n.encoding!==void 0&&(Ri("THREE.WebGLRenderTarget: option.encoding has been replaced by option.colorSpace."),n.colorSpace=n.encoding===Mn?xt:kt),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Bt,depthBuffer:!0,stencilBuffer:!1,depthTexture:null,samples:0},n),this.texture=new Pt(s,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.flipY=!1,this.texture.generateMipmaps=n.generateMipmaps,this.texture.internalFormat=n.internalFormat,this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}setSize(e,t,n=1){(this.width!==e||this.height!==t||this.depth!==n)&&(this.width=e,this.height=t,this.depth=n,this.texture.image.width=e,this.texture.image.height=t,this.texture.image.depth=n,this.dispose()),this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.texture=e.texture.clone(),this.texture.isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new Zo(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Tn extends uh{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class Qo extends Pt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Et,this.minFilter=Et,this.wrapR=Vt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class fh extends Pt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Et,this.minFilter=Et,this.wrapR=Vt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class wn{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,o,a){let l=n[s+0],c=n[s+1],h=n[s+2],u=n[s+3];const d=r[o+0],p=r[o+1],g=r[o+2],x=r[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u;return}if(a===1){e[t+0]=d,e[t+1]=p,e[t+2]=g,e[t+3]=x;return}if(u!==x||l!==d||c!==p||h!==g){let m=1-a;const f=l*d+c*p+h*g+u*x,S=f>=0?1:-1,_=1-f*f;if(_>Number.EPSILON){const L=Math.sqrt(_),C=Math.atan2(L,f*S);m=Math.sin(m*C)/L,a=Math.sin(a*C)/L}const w=a*S;if(l=l*m+d*w,c=c*m+p*w,h=h*m+g*w,u=u*m+x*w,m===1-a){const L=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=L,c*=L,h*=L,u*=L}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,s,r,o){const a=n[s],l=n[s+1],c=n[s+2],h=n[s+3],u=r[o],d=r[o+1],p=r[o+2],g=r[o+3];return e[t]=a*g+h*u+l*p-c*d,e[t+1]=l*g+h*d+c*u-a*p,e[t+2]=c*g+h*p+a*d-l*u,e[t+3]=h*g-a*u-l*d-c*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),h=a(s/2),u=a(r/2),d=l(n/2),p=l(s/2),g=l(r/2);switch(o){case"XYZ":this._x=d*h*u+c*p*g,this._y=c*p*u-d*h*g,this._z=c*h*g+d*p*u,this._w=c*h*u-d*p*g;break;case"YXZ":this._x=d*h*u+c*p*g,this._y=c*p*u-d*h*g,this._z=c*h*g-d*p*u,this._w=c*h*u+d*p*g;break;case"ZXY":this._x=d*h*u-c*p*g,this._y=c*p*u+d*h*g,this._z=c*h*g+d*p*u,this._w=c*h*u-d*p*g;break;case"ZYX":this._x=d*h*u-c*p*g,this._y=c*p*u+d*h*g,this._z=c*h*g-d*p*u,this._w=c*h*u+d*p*g;break;case"YZX":this._x=d*h*u+c*p*g,this._y=c*p*u+d*h*g,this._z=c*h*g-d*p*u,this._w=c*h*u-d*p*g;break;case"XZY":this._x=d*h*u-c*p*g,this._y=c*p*u-d*h*g,this._z=c*h*g+d*p*u,this._w=c*h*u+d*p*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],s=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],h=t[6],u=t[10],d=n+a+u;if(d>0){const p=.5/Math.sqrt(d+1);this._w=.25/p,this._x=(h-l)*p,this._y=(r-c)*p,this._z=(o-s)*p}else if(n>a&&n>u){const p=2*Math.sqrt(1+n-a-u);this._w=(h-l)/p,this._x=.25*p,this._y=(s+o)/p,this._z=(r+c)/p}else if(a>u){const p=2*Math.sqrt(1+a-n-u);this._w=(r-c)/p,this._x=(s+o)/p,this._y=.25*p,this._z=(l+h)/p}else{const p=2*Math.sqrt(1+u-n-a);this._w=(o-s)/p,this._x=(r+c)/p,this._y=(l+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(ut(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,s=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+o*a+s*c-r*l,this._y=s*h+o*l+r*a-n*c,this._z=r*h+o*c+n*l-s*a,this._w=o*h-n*a-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,s=this._y,r=this._z,o=this._w;let a=o*e._w+n*e._x+s*e._y+r*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=s,this._z=r,this;const l=1-a*a;if(l<=Number.EPSILON){const p=1-t;return this._w=p*o+t*this._w,this._x=p*n+t*this._x,this._y=p*s+t*this._y,this._z=p*r+t*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,a),u=Math.sin((1-t)*h)/c,d=Math.sin(t*h)/c;return this._w=o*u+this._w*d,this._x=n*u+this._x*d,this._y=s*u+this._y*d,this._z=r*u+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=Math.random(),t=Math.sqrt(1-e),n=Math.sqrt(e),s=2*Math.PI*Math.random(),r=2*Math.PI*Math.random();return this.set(t*Math.cos(s),n*Math.sin(r),n*Math.cos(r),t*Math.sin(s))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class R{constructor(e=0,t=0,n=0){R.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(ea.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(ea.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(e){const t=this.x,n=this.y,s=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*s-a*n),h=2*(a*t-r*s),u=2*(r*n-o*t);return this.x=t+l*c+o*u-a*h,this.y=n+l*h+a*c-r*u,this.z=s+l*u+r*h-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,s=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=s*l-r*a,this.y=r*o-n*l,this.z=n*a-s*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return nr.copy(this).projectOnVector(e),this.sub(nr)}reflect(e){return this.sub(nr.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(ut(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=(Math.random()-.5)*2,t=Math.random()*Math.PI*2,n=Math.sqrt(1-e**2);return this.x=n*Math.cos(t),this.y=n*Math.sin(t),this.z=e,this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const nr=new R,ea=new wn;class An{constructor(e=new R(1/0,1/0,1/0),t=new R(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Wt.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Wt.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=Wt.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Wt):Wt.fromBufferAttribute(r,o),Wt.applyMatrix4(e.matrixWorld),this.expandByPoint(Wt);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Zi.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Zi.copy(n.boundingBox)),Zi.applyMatrix4(e.matrixWorld),this.union(Zi)}const s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return!(e.x<this.min.x||e.x>this.max.x||e.y<this.min.y||e.y>this.max.y||e.z<this.min.z||e.z>this.max.z)}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return!(e.max.x<this.min.x||e.min.x>this.max.x||e.max.y<this.min.y||e.min.y>this.max.y||e.max.z<this.min.z||e.min.z>this.max.z)}intersectsSphere(e){return this.clampPoint(e.center,Wt),Wt.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Li),Qi.subVectors(this.max,Li),ei.subVectors(e.a,Li),ti.subVectors(e.b,Li),ni.subVectors(e.c,Li),mn.subVectors(ti,ei),gn.subVectors(ni,ti),Cn.subVectors(ei,ni);let t=[0,-mn.z,mn.y,0,-gn.z,gn.y,0,-Cn.z,Cn.y,mn.z,0,-mn.x,gn.z,0,-gn.x,Cn.z,0,-Cn.x,-mn.y,mn.x,0,-gn.y,gn.x,0,-Cn.y,Cn.x,0];return!ir(t,ei,ti,ni,Qi)||(t=[1,0,0,0,1,0,0,0,1],!ir(t,ei,ti,ni,Qi))?!1:(es.crossVectors(mn,gn),t=[es.x,es.y,es.z],ir(t,ei,ti,ni,Qi))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Wt).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Wt).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Qt[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Qt[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Qt[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Qt[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Qt[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Qt[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Qt[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Qt[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Qt),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const Qt=[new R,new R,new R,new R,new R,new R,new R,new R],Wt=new R,Zi=new An,ei=new R,ti=new R,ni=new R,mn=new R,gn=new R,Cn=new R,Li=new R,Qi=new R,es=new R,Rn=new R;function ir(i,e,t,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){Rn.fromArray(i,r);const a=s.x*Math.abs(Rn.x)+s.y*Math.abs(Rn.y)+s.z*Math.abs(Rn.z),l=e.dot(Rn),c=t.dot(Rn),h=n.dot(Rn);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}const ph=new An,Pi=new R,sr=new R;class ts{constructor(e=new R,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):ph.setFromPoints(e).getCenter(n);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Pi.subVectors(e,this.center);const t=Pi.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(Pi,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(sr.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Pi.copy(e.center).add(sr)),this.expandByPoint(Pi.copy(e.center).sub(sr))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const en=new R,rr=new R,ns=new R,xn=new R,or=new R,is=new R,ar=new R;class ss{constructor(e=new R,t=new R(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,en)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=en.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(en.copy(this.origin).addScaledVector(this.direction,t),en.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){rr.copy(e).add(t).multiplyScalar(.5),ns.copy(t).sub(e).normalize(),xn.copy(this.origin).sub(rr);const r=e.distanceTo(t)*.5,o=-this.direction.dot(ns),a=xn.dot(this.direction),l=-xn.dot(ns),c=xn.lengthSq(),h=Math.abs(1-o*o);let u,d,p,g;if(h>0)if(u=o*l-a,d=o*a-l,g=r*h,u>=0)if(d>=-g)if(d<=g){const x=1/h;u*=x,d*=x,p=u*(u+o*d+2*a)+d*(o*u+d+2*l)+c}else d=r,u=Math.max(0,-(o*d+a)),p=-u*u+d*(d+2*l)+c;else d=-r,u=Math.max(0,-(o*d+a)),p=-u*u+d*(d+2*l)+c;else d<=-g?(u=Math.max(0,-(-o*r+a)),d=u>0?-r:Math.min(Math.max(-r,-l),r),p=-u*u+d*(d+2*l)+c):d<=g?(u=0,d=Math.min(Math.max(-r,-l),r),p=d*(d+2*l)+c):(u=Math.max(0,-(o*r+a)),d=u>0?r:Math.min(Math.max(-r,-l),r),p=-u*u+d*(d+2*l)+c);else d=o>0?-r:r,u=Math.max(0,-(o*d+a)),p=-u*u+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(rr).addScaledVector(ns,d),p}intersectSphere(e,t){en.subVectors(e.center,this.origin);const n=en.dot(this.direction),s=en.dot(en)-n*n,r=e.radius*e.radius;if(s>r)return null;const o=Math.sqrt(r-s),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,o,a,l;const c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,s=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,s=(e.min.x-d.x)*c),h>=0?(r=(e.min.y-d.y)*h,o=(e.max.y-d.y)*h):(r=(e.max.y-d.y)*h,o=(e.min.y-d.y)*h),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),u>=0?(a=(e.min.z-d.z)*u,l=(e.max.z-d.z)*u):(a=(e.max.z-d.z)*u,l=(e.min.z-d.z)*u),n>l||a>s)||((a>n||n!==n)&&(n=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,en)!==null}intersectTriangle(e,t,n,s,r){or.subVectors(t,e),is.subVectors(n,e),ar.crossVectors(or,is);let o=this.direction.dot(ar),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;xn.subVectors(this.origin,e);const l=a*this.direction.dot(is.crossVectors(xn,is));if(l<0)return null;const c=a*this.direction.dot(or.cross(xn));if(c<0||l+c>o)return null;const h=-a*xn.dot(ar);return h<0?null:this.at(h/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class et{constructor(e,t,n,s,r,o,a,l,c,h,u,d,p,g,x,m){et.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c,h,u,d,p,g,x,m)}set(e,t,n,s,r,o,a,l,c,h,u,d,p,g,x,m){const f=this.elements;return f[0]=e,f[4]=t,f[8]=n,f[12]=s,f[1]=r,f[5]=o,f[9]=a,f[13]=l,f[2]=c,f[6]=h,f[10]=u,f[14]=d,f[3]=p,f[7]=g,f[11]=x,f[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new et().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,s=1/ii.setFromMatrixColumn(e,0).length(),r=1/ii.setFromMatrixColumn(e,1).length(),o=1/ii.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,s=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){const d=o*h,p=o*u,g=a*h,x=a*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=p+g*c,t[5]=d-x*c,t[9]=-a*l,t[2]=x-d*c,t[6]=g+p*c,t[10]=o*l}else if(e.order==="YXZ"){const d=l*h,p=l*u,g=c*h,x=c*u;t[0]=d+x*a,t[4]=g*a-p,t[8]=o*c,t[1]=o*u,t[5]=o*h,t[9]=-a,t[2]=p*a-g,t[6]=x+d*a,t[10]=o*l}else if(e.order==="ZXY"){const d=l*h,p=l*u,g=c*h,x=c*u;t[0]=d-x*a,t[4]=-o*u,t[8]=g+p*a,t[1]=p+g*a,t[5]=o*h,t[9]=x-d*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){const d=o*h,p=o*u,g=a*h,x=a*u;t[0]=l*h,t[4]=g*c-p,t[8]=d*c+x,t[1]=l*u,t[5]=x*c+d,t[9]=p*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){const d=o*l,p=o*c,g=a*l,x=a*c;t[0]=l*h,t[4]=x-d*u,t[8]=g*u+p,t[1]=u,t[5]=o*h,t[9]=-a*h,t[2]=-c*h,t[6]=p*u+g,t[10]=d-x*u}else if(e.order==="XZY"){const d=o*l,p=o*c,g=a*l,x=a*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=d*u+x,t[5]=o*h,t[9]=p*u-g,t[2]=g*u-p,t[6]=a*h,t[10]=x*u+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(mh,e,gh)}lookAt(e,t,n){const s=this.elements;return Dt.subVectors(e,t),Dt.lengthSq()===0&&(Dt.z=1),Dt.normalize(),_n.crossVectors(n,Dt),_n.lengthSq()===0&&(Math.abs(n.z)===1?Dt.x+=1e-4:Dt.z+=1e-4,Dt.normalize(),_n.crossVectors(n,Dt)),_n.normalize(),rs.crossVectors(Dt,_n),s[0]=_n.x,s[4]=rs.x,s[8]=Dt.x,s[1]=_n.y,s[5]=rs.y,s[9]=Dt.y,s[2]=_n.z,s[6]=rs.z,s[10]=Dt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],h=n[1],u=n[5],d=n[9],p=n[13],g=n[2],x=n[6],m=n[10],f=n[14],S=n[3],_=n[7],w=n[11],L=n[15],C=s[0],T=s[4],W=s[8],v=s[12],M=s[1],I=s[5],X=s[9],J=s[13],D=s[2],U=s[6],k=s[10],K=s[14],Y=s[3],$=s[7],Z=s[11],ee=s[15];return r[0]=o*C+a*M+l*D+c*Y,r[4]=o*T+a*I+l*U+c*$,r[8]=o*W+a*X+l*k+c*Z,r[12]=o*v+a*J+l*K+c*ee,r[1]=h*C+u*M+d*D+p*Y,r[5]=h*T+u*I+d*U+p*$,r[9]=h*W+u*X+d*k+p*Z,r[13]=h*v+u*J+d*K+p*ee,r[2]=g*C+x*M+m*D+f*Y,r[6]=g*T+x*I+m*U+f*$,r[10]=g*W+x*X+m*k+f*Z,r[14]=g*v+x*J+m*K+f*ee,r[3]=S*C+_*M+w*D+L*Y,r[7]=S*T+_*I+w*U+L*$,r[11]=S*W+_*X+w*k+L*Z,r[15]=S*v+_*J+w*K+L*ee,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],h=e[2],u=e[6],d=e[10],p=e[14],g=e[3],x=e[7],m=e[11],f=e[15];return g*(+r*l*u-s*c*u-r*a*d+n*c*d+s*a*p-n*l*p)+x*(+t*l*p-t*c*d+r*o*d-s*o*p+s*c*h-r*l*h)+m*(+t*c*u-t*a*p-r*o*u+n*o*p+r*a*h-n*c*h)+f*(-s*a*h-t*l*u+t*a*d+s*o*u-n*o*d+n*l*h)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=e[9],d=e[10],p=e[11],g=e[12],x=e[13],m=e[14],f=e[15],S=u*m*c-x*d*c+x*l*p-a*m*p-u*l*f+a*d*f,_=g*d*c-h*m*c-g*l*p+o*m*p+h*l*f-o*d*f,w=h*x*c-g*u*c+g*a*p-o*x*p-h*a*f+o*u*f,L=g*u*l-h*x*l-g*a*d+o*x*d+h*a*m-o*u*m,C=t*S+n*_+s*w+r*L;if(C===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const T=1/C;return e[0]=S*T,e[1]=(x*d*r-u*m*r-x*s*p+n*m*p+u*s*f-n*d*f)*T,e[2]=(a*m*r-x*l*r+x*s*c-n*m*c-a*s*f+n*l*f)*T,e[3]=(u*l*r-a*d*r-u*s*c+n*d*c+a*s*p-n*l*p)*T,e[4]=_*T,e[5]=(h*m*r-g*d*r+g*s*p-t*m*p-h*s*f+t*d*f)*T,e[6]=(g*l*r-o*m*r-g*s*c+t*m*c+o*s*f-t*l*f)*T,e[7]=(o*d*r-h*l*r+h*s*c-t*d*c-o*s*p+t*l*p)*T,e[8]=w*T,e[9]=(g*u*r-h*x*r-g*n*p+t*x*p+h*n*f-t*u*f)*T,e[10]=(o*x*r-g*a*r+g*n*c-t*x*c-o*n*f+t*a*f)*T,e[11]=(h*a*r-o*u*r-h*n*c+t*u*c+o*n*p-t*a*p)*T,e[12]=L*T,e[13]=(h*x*s-g*u*s+g*n*d-t*x*d-h*n*m+t*u*m)*T,e[14]=(g*a*s-o*x*s-g*n*l+t*x*l+o*n*m-t*a*m)*T,e[15]=(o*u*s-h*a*s+h*n*l-t*u*l-o*n*d+t*a*d)*T,this}scale(e){const t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),s=Math.sin(t),r=1-n,o=e.x,a=e.y,l=e.z,c=r*o,h=r*a;return this.set(c*o+n,c*a-s*l,c*l+s*a,0,c*a+s*l,h*a+n,h*l-s*o,0,c*l-s*a,h*l+s*o,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,o){return this.set(1,n,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){const s=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,h=o+o,u=a+a,d=r*c,p=r*h,g=r*u,x=o*h,m=o*u,f=a*u,S=l*c,_=l*h,w=l*u,L=n.x,C=n.y,T=n.z;return s[0]=(1-(x+f))*L,s[1]=(p+w)*L,s[2]=(g-_)*L,s[3]=0,s[4]=(p-w)*C,s[5]=(1-(d+f))*C,s[6]=(m+S)*C,s[7]=0,s[8]=(g+_)*T,s[9]=(m-S)*T,s[10]=(1-(d+x))*T,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){const s=this.elements;let r=ii.set(s[0],s[1],s[2]).length();const o=ii.set(s[4],s[5],s[6]).length(),a=ii.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],Xt.copy(this);const c=1/r,h=1/o,u=1/a;return Xt.elements[0]*=c,Xt.elements[1]*=c,Xt.elements[2]*=c,Xt.elements[4]*=h,Xt.elements[5]*=h,Xt.elements[6]*=h,Xt.elements[8]*=u,Xt.elements[9]*=u,Xt.elements[10]*=u,t.setFromRotationMatrix(Xt),n.x=r,n.y=o,n.z=a,this}makePerspective(e,t,n,s,r,o,a=Zt){const l=this.elements,c=2*r/(t-e),h=2*r/(n-s),u=(t+e)/(t-e),d=(n+s)/(n-s);let p,g;if(a===Zt)p=-(o+r)/(o-r),g=-2*o*r/(o-r);else if(a===$i)p=-o/(o-r),g=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=h,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=p,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,s,r,o,a=Zt){const l=this.elements,c=1/(t-e),h=1/(n-s),u=1/(o-r),d=(t+e)*c,p=(n+s)*h;let g,x;if(a===Zt)g=(o+r)*u,x=-2*u;else if(a===$i)g=r*u,x=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-d,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-p,l[2]=0,l[6]=0,l[10]=x,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const ii=new R,Xt=new et,mh=new R(0,0,0),gh=new R(1,1,1),_n=new R,rs=new R,Dt=new R,ta=new et,na=new wn;class os{constructor(e=0,t=0,n=0,s=os.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const s=e.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],h=s[9],u=s[2],d=s[6],p=s[10];switch(t){case"XYZ":this._y=Math.asin(ut(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-ut(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(ut(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,p),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-ut(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,p),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(ut(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(a,p));break;case"XZY":this._z=Math.asin(-ut(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return ta.makeRotationFromQuaternion(e),this.setFromRotationMatrix(ta,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return na.setFromEuler(this),this.setFromQuaternion(na,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}os.DEFAULT_ORDER="XYZ";class lr{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let xh=0;const ia=new R,si=new wn,tn=new et,as=new R,Di=new R,_h=new R,vh=new wn,sa=new R(1,0,0),ra=new R(0,1,0),oa=new R(0,0,1),yh={type:"added"},Sh={type:"removed"};class pt extends En{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:xh++}),this.uuid=Kn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=pt.DEFAULT_UP.clone();const e=new R,t=new os,n=new wn,s=new R(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new et},normalMatrix:{value:new Ve}}),this.matrix=new et,this.matrixWorld=new et,this.matrixAutoUpdate=pt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=pt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new lr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return si.setFromAxisAngle(e,t),this.quaternion.multiply(si),this}rotateOnWorldAxis(e,t){return si.setFromAxisAngle(e,t),this.quaternion.premultiply(si),this}rotateX(e){return this.rotateOnAxis(sa,e)}rotateY(e){return this.rotateOnAxis(ra,e)}rotateZ(e){return this.rotateOnAxis(oa,e)}translateOnAxis(e,t){return ia.copy(e).applyQuaternion(this.quaternion),this.position.add(ia.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(sa,e)}translateY(e){return this.translateOnAxis(ra,e)}translateZ(e){return this.translateOnAxis(oa,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(tn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?as.copy(e):as.set(e,t,n);const s=this.parent;this.updateWorldMatrix(!0,!1),Di.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?tn.lookAt(Di,as,this.up):tn.lookAt(as,Di,this.up),this.quaternion.setFromRotationMatrix(tn),s&&(tn.extractRotation(s.matrixWorld),si.setFromRotationMatrix(tn),this.quaternion.premultiply(si.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.parent!==null&&e.parent.remove(e),e.parent=this,this.children.push(e),e.dispatchEvent(yh)):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Sh)),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),tn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),tn.multiply(e.parent.matrixWorld)),e.applyMatrix4(tn),this.add(e),e.updateWorldMatrix(!1,!0),this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){const o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Di,e,_h),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Di,vh,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,s=t.length;n<s;n++){const r=t[n];(r.matrixWorldAutoUpdate===!0||e===!0)&&r.updateMatrixWorld(e)}}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.matrixWorldAutoUpdate===!0&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),t===!0){const s=this.children;for(let r=0,o=s.length;r<o;r++){const a=s[r];a.matrixWorldAutoUpdate===!0&&a.updateWorldMatrix(!1,!0)}}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),s.maxGeometryCount=this._maxGeometryCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(e),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const u=l[c];r(e.shapes,u)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];s.animations.push(r(e.animations,l))}}if(t){const a=o(e.geometries),l=o(e.materials),c=o(e.textures),h=o(e.images),u=o(e.shapes),d=o(e.skeletons),p=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),p.length>0&&(n.animations=p),g.length>0&&(n.nodes=g)}return n.object=s,n;function o(a){const l=[];for(const c in a){const h=a[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const s=e.children[n];this.add(s.clone())}return this}}pt.DEFAULT_UP=new R(0,1,0),pt.DEFAULT_MATRIX_AUTO_UPDATE=!0,pt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const jt=new R,nn=new R,cr=new R,sn=new R,ri=new R,oi=new R,aa=new R,hr=new R,dr=new R,ur=new R;let ls=!1;class qt{constructor(e=new R,t=new R,n=new R){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),jt.subVectors(e,t),s.cross(jt);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){jt.subVectors(s,t),nn.subVectors(n,t),cr.subVectors(e,t);const o=jt.dot(jt),a=jt.dot(nn),l=jt.dot(cr),c=nn.dot(nn),h=nn.dot(cr),u=o*c-a*a;if(u===0)return r.set(0,0,0),null;const d=1/u,p=(c*l-a*h)*d,g=(o*h-a*l)*d;return r.set(1-p-g,g,p)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,sn)===null?!1:sn.x>=0&&sn.y>=0&&sn.x+sn.y<=1}static getUV(e,t,n,s,r,o,a,l){return ls===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),ls=!0),this.getInterpolation(e,t,n,s,r,o,a,l)}static getInterpolation(e,t,n,s,r,o,a,l){return this.getBarycoord(e,t,n,s,sn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,sn.x),l.addScaledVector(o,sn.y),l.addScaledVector(a,sn.z),l)}static isFrontFacing(e,t,n,s){return jt.subVectors(n,t),nn.subVectors(e,t),jt.cross(nn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return jt.subVectors(this.c,this.b),nn.subVectors(this.a,this.b),jt.cross(nn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(.3333333333333333)}getNormal(e){return qt.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return qt.getBarycoord(e,this.a,this.b,this.c,t)}getUV(e,t,n,s,r){return ls===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),ls=!0),qt.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}getInterpolation(e,t,n,s,r){return qt.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return qt.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return qt.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,s=this.b,r=this.c;let o,a;ri.subVectors(s,n),oi.subVectors(r,n),hr.subVectors(e,n);const l=ri.dot(hr),c=oi.dot(hr);if(l<=0&&c<=0)return t.copy(n);dr.subVectors(e,s);const h=ri.dot(dr),u=oi.dot(dr);if(h>=0&&u<=h)return t.copy(s);const d=l*u-h*c;if(d<=0&&l>=0&&h<=0)return o=l/(l-h),t.copy(n).addScaledVector(ri,o);ur.subVectors(e,r);const p=ri.dot(ur),g=oi.dot(ur);if(g>=0&&p<=g)return t.copy(r);const x=p*c-l*g;if(x<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(n).addScaledVector(oi,a);const m=h*g-p*u;if(m<=0&&u-h>=0&&p-g>=0)return aa.subVectors(r,s),a=(u-h)/(u-h+(p-g)),t.copy(s).addScaledVector(aa,a);const f=1/(m+x+d);return o=x*f,a=d*f,t.copy(n).addScaledVector(ri,o).addScaledVector(oi,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const la={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},vn={h:0,s:0,l:0},cs={h:0,s:0,l:0};function fr(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<.16666666666666666?i+(e-i)*6*t:t<.5?e:t<.6666666666666666?i+(e-i)*6*(.6666666666666666-t):i}class Ue{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=xt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ye.toWorkingColorSpace(this,t),this}setRGB(e,t,n,s=Ye.workingColorSpace){return this.r=e,this.g=t,this.b=n,Ye.toWorkingColorSpace(this,s),this}setHSL(e,t,n,s=Ye.workingColorSpace){if(e=Ks(e,1),t=ut(t,0,1),n=ut(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=fr(o,r,e+.3333333333333333),this.g=fr(o,r,e),this.b=fr(o,r,e-.3333333333333333)}return Ye.toWorkingColorSpace(this,s),this}setStyle(e,t=xt){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=xt){const n=la[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Zn(e.r),this.g=Zn(e.g),this.b=Zn(e.b),this}copyLinearToSRGB(e){return this.r=er(e.r),this.g=er(e.g),this.b=er(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=xt){return Ye.fromWorkingColorSpace(vt.copy(this),e),Math.round(ut(vt.r*255,0,255))*65536+Math.round(ut(vt.g*255,0,255))*256+Math.round(ut(vt.b*255,0,255))}getHexString(e=xt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ye.workingColorSpace){Ye.fromWorkingColorSpace(vt.copy(this),t);const n=vt.r,s=vt.g,r=vt.b,o=Math.max(n,s,r),a=Math.min(n,s,r);let l,c;const h=(a+o)/2;if(a===o)l=0,c=0;else{const u=o-a;switch(c=h<=.5?u/(o+a):u/(2-o-a),o){case n:l=(s-r)/u+(s<r?6:0);break;case s:l=(r-n)/u+2;break;case r:l=(n-s)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=Ye.workingColorSpace){return Ye.fromWorkingColorSpace(vt.copy(this),t),e.r=vt.r,e.g=vt.g,e.b=vt.b,e}getStyle(e=xt){Ye.fromWorkingColorSpace(vt.copy(this),e);const t=vt.r,n=vt.g,s=vt.b;return e!==xt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(vn),this.setHSL(vn.h+e,vn.s+t,vn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(vn),e.getHSL(cs);const n=Ci(vn.h,cs.h,t),s=Ci(vn.s,cs.s,t),r=Ci(vn.l,cs.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const vt=new Ue;Ue.NAMES=la;let bh=0;class ai extends En{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:bh++}),this.uuid=Kn(),this.name="",this.type="Material",this.blending=Xn,this.side=cn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Us,this.blendDst=Ns,this.blendEquation=yn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ue(0,0,0),this.blendAlpha=0,this.depthFunc=Vi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Vo,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Yn,this.stencilZFail=Yn,this.stencilZPass=Yn,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Xn&&(n.blending=this.blending),this.side!==cn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Us&&(n.blendSrc=this.blendSrc),this.blendDst!==Ns&&(n.blendDst=this.blendDst),this.blendEquation!==yn&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Vi&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Vo&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Yn&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Yn&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Yn&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const o=[];for(const a in r){const l=r[a];delete l.metadata,o.push(l)}return o}if(t){const r=s(e.textures),o=s(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class ca extends ai{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ue(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=Os,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const ot=new R,hs=new xe;class Je{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Wo,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.gpuType=pn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return console.warn("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)hs.fromBufferAttribute(this,t),hs.applyMatrix3(e),this.setXY(t,hs.x,hs.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)ot.fromBufferAttribute(this,t),ot.applyMatrix3(e),this.setXYZ(t,ot.x,ot.y,ot.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)ot.fromBufferAttribute(this,t),ot.applyMatrix4(e),this.setXYZ(t,ot.x,ot.y,ot.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)ot.fromBufferAttribute(this,t),ot.applyNormalMatrix(e),this.setXYZ(t,ot.x,ot.y,ot.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)ot.fromBufferAttribute(this,t),ot.transformDirection(e),this.setXYZ(t,ot.x,ot.y,ot.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Jn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Tt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Jn(t,this.array)),t}setX(e,t){return this.normalized&&(t=Tt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Jn(t,this.array)),t}setY(e,t){return this.normalized&&(t=Tt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Jn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Tt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Jn(t,this.array)),t}setW(e,t){return this.normalized&&(t=Tt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Tt(t,this.array),n=Tt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=Tt(t,this.array),n=Tt(n,this.array),s=Tt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=Tt(t,this.array),n=Tt(n,this.array),s=Tt(s,this.array),r=Tt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Wo&&(e.usage=this.usage),e}}class ha extends Je{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class da extends Je{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class yt extends Je{constructor(e,t,n){super(new Float32Array(e),t,n)}}let Mh=0;const zt=new et,pr=new pt,li=new R,It=new An,Ii=new An,mt=new R;class St extends En{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Mh++}),this.uuid=Kn(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(qo(e)?da:ha)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Ve().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return zt.makeRotationFromQuaternion(e),this.applyMatrix4(zt),this}rotateX(e){return zt.makeRotationX(e),this.applyMatrix4(zt),this}rotateY(e){return zt.makeRotationY(e),this.applyMatrix4(zt),this}rotateZ(e){return zt.makeRotationZ(e),this.applyMatrix4(zt),this}translate(e,t,n){return zt.makeTranslation(e,t,n),this.applyMatrix4(zt),this}scale(e,t,n){return zt.makeScale(e,t,n),this.applyMatrix4(zt),this}lookAt(e){return pr.lookAt(e),pr.updateMatrix(),this.applyMatrix4(pr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(li).negate(),this.translate(li.x,li.y,li.z),this}setFromPoints(e){const t=[];for(let n=0,s=e.length;n<s;n++){const r=e[n];t.push(r.x,r.y,r.z||0)}return this.setAttribute("position",new yt(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new An);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingBox.set(new R(-1/0,-1/0,-1/0),new R(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){const r=t[n];It.setFromBufferAttribute(r),this.morphTargetsRelative?(mt.addVectors(this.boundingBox.min,It.min),this.boundingBox.expandByPoint(mt),mt.addVectors(this.boundingBox.max,It.max),this.boundingBox.expandByPoint(mt)):(this.boundingBox.expandByPoint(It.min),this.boundingBox.expandByPoint(It.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ts);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingSphere.set(new R,1/0);return}if(e){const n=this.boundingSphere.center;if(It.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){const a=t[r];Ii.setFromBufferAttribute(a),this.morphTargetsRelative?(mt.addVectors(It.min,Ii.min),It.expandByPoint(mt),mt.addVectors(It.max,Ii.max),It.expandByPoint(mt)):(It.expandByPoint(Ii.min),It.expandByPoint(Ii.max))}It.getCenter(n);let s=0;for(let r=0,o=e.count;r<o;r++)mt.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(mt));if(t)for(let r=0,o=t.length;r<o;r++){const a=t[r],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)mt.fromBufferAttribute(a,c),l&&(li.fromBufferAttribute(e,c),mt.add(li)),s=Math.max(s,n.distanceToSquared(mt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=e.array,s=t.position.array,r=t.normal.array,o=t.uv.array,a=s.length/3;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Je(new Float32Array(4*a),4));const l=this.getAttribute("tangent").array,c=[],h=[];for(let M=0;M<a;M++)c[M]=new R,h[M]=new R;const u=new R,d=new R,p=new R,g=new xe,x=new xe,m=new xe,f=new R,S=new R;function _(M,I,X){u.fromArray(s,M*3),d.fromArray(s,I*3),p.fromArray(s,X*3),g.fromArray(o,M*2),x.fromArray(o,I*2),m.fromArray(o,X*2),d.sub(u),p.sub(u),x.sub(g),m.sub(g);const J=1/(x.x*m.y-m.x*x.y);isFinite(J)&&(f.copy(d).multiplyScalar(m.y).addScaledVector(p,-x.y).multiplyScalar(J),S.copy(p).multiplyScalar(x.x).addScaledVector(d,-m.x).multiplyScalar(J),c[M].add(f),c[I].add(f),c[X].add(f),h[M].add(S),h[I].add(S),h[X].add(S))}let w=this.groups;w.length===0&&(w=[{start:0,count:n.length}]);for(let M=0,I=w.length;M<I;++M){const X=w[M],J=X.start,D=X.count;for(let U=J,k=J+D;U<k;U+=3)_(n[U+0],n[U+1],n[U+2])}const L=new R,C=new R,T=new R,W=new R;function v(M){T.fromArray(r,M*3),W.copy(T);const I=c[M];L.copy(I),L.sub(T.multiplyScalar(T.dot(I))).normalize(),C.crossVectors(W,I);const J=C.dot(h[M])<0?-1:1;l[M*4]=L.x,l[M*4+1]=L.y,l[M*4+2]=L.z,l[M*4+3]=J}for(let M=0,I=w.length;M<I;++M){const X=w[M],J=X.start,D=X.count;for(let U=J,k=J+D;U<k;U+=3)v(n[U+0]),v(n[U+1]),v(n[U+2])}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Je(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,p=n.count;d<p;d++)n.setXYZ(d,0,0,0);const s=new R,r=new R,o=new R,a=new R,l=new R,c=new R,h=new R,u=new R;if(e)for(let d=0,p=e.count;d<p;d+=3){const g=e.getX(d+0),x=e.getX(d+1),m=e.getX(d+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,x),o.fromBufferAttribute(t,m),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,x),c.fromBufferAttribute(n,m),a.add(h),l.add(h),c.add(h),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(x,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let d=0,p=t.count;d<p;d+=3)s.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),o.fromBufferAttribute(t,d+2),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)mt.fromBufferAttribute(e,t),mt.normalize(),e.setXYZ(t,mt.x,mt.y,mt.z)}toNonIndexed(){function e(a,l){const c=a.array,h=a.itemSize,u=a.normalized,d=new c.constructor(l.length*h);let p=0,g=0;for(let x=0,m=l.length;x<m;x++){a.isInterleavedBufferAttribute?p=l[x]*a.data.stride+a.offset:p=l[x]*h;for(let f=0;f<h;f++)d[g++]=c[p++]}return new Je(d,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new St,n=this.index.array,s=this.attributes;for(const a in s){const l=s[a],c=e(l,n);t.setAttribute(a,c)}const r=this.morphAttributes;for(const a in r){const l=[],c=r[a];for(let h=0,u=c.length;h<u;h++){const d=c[h],p=e(d,n);l.push(p)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){const p=c[u];h.push(p.toJSON(e.data))}h.length>0&&(s[l]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone(t));const s=e.attributes;for(const c in s){const h=s[c];this.setAttribute(c,h.clone(t))}const r=e.morphAttributes;for(const c in r){const h=[],u=r[c];for(let d=0,p=u.length;d<p;d++)h.push(u[d].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let c=0,h=o.length;c<h;c++){const u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const ua=new et,Ln=new ss,ds=new ts,fa=new R,ci=new R,hi=new R,di=new R,mr=new R,us=new R,fs=new xe,ps=new xe,ms=new xe,pa=new R,ma=new R,ga=new R,gs=new R,xs=new R;class Rt extends pt{constructor(e=new St,t=new ca){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(s,e);const a=this.morphTargetInfluences;if(r&&a){us.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const h=a[l],u=r[l];h!==0&&(mr.fromBufferAttribute(u,e),o?us.addScaledVector(mr,h):us.addScaledVector(mr.sub(t),h))}t.add(us)}return t}raycast(e,t){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),ds.copy(n.boundingSphere),ds.applyMatrix4(r),Ln.copy(e.ray).recast(e.near),!(ds.containsPoint(Ln.origin)===!1&&(Ln.intersectSphere(ds,fa)===null||Ln.origin.distanceToSquared(fa)>(e.far-e.near)**2))&&(ua.copy(r).invert(),Ln.copy(e.ray).applyMatrix4(ua),!(n.boundingBox!==null&&Ln.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Ln)))}_computeIntersections(e,t,n){let s;const r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,p=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,x=d.length;g<x;g++){const m=d[g],f=o[m.materialIndex],S=Math.max(m.start,p.start),_=Math.min(a.count,Math.min(m.start+m.count,p.start+p.count));for(let w=S,L=_;w<L;w+=3){const C=a.getX(w),T=a.getX(w+1),W=a.getX(w+2);s=_s(this,f,e,n,c,h,u,C,T,W),s&&(s.faceIndex=Math.floor(w/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const g=Math.max(0,p.start),x=Math.min(a.count,p.start+p.count);for(let m=g,f=x;m<f;m+=3){const S=a.getX(m),_=a.getX(m+1),w=a.getX(m+2);s=_s(this,o,e,n,c,h,u,S,_,w),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,x=d.length;g<x;g++){const m=d[g],f=o[m.materialIndex],S=Math.max(m.start,p.start),_=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));for(let w=S,L=_;w<L;w+=3){const C=w,T=w+1,W=w+2;s=_s(this,f,e,n,c,h,u,C,T,W),s&&(s.faceIndex=Math.floor(w/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const g=Math.max(0,p.start),x=Math.min(l.count,p.start+p.count);for(let m=g,f=x;m<f;m+=3){const S=m,_=m+1,w=m+2;s=_s(this,o,e,n,c,h,u,S,_,w),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}}function Eh(i,e,t,n,s,r,o,a){let l;if(e.side===Ct?l=n.intersectTriangle(o,r,s,!0,a):l=n.intersectTriangle(s,r,o,e.side===cn,a),l===null)return null;xs.copy(a),xs.applyMatrix4(i.matrixWorld);const c=t.ray.origin.distanceTo(xs);return c<t.near||c>t.far?null:{distance:c,point:xs.clone(),object:i}}function _s(i,e,t,n,s,r,o,a,l,c){i.getVertexPosition(a,ci),i.getVertexPosition(l,hi),i.getVertexPosition(c,di);const h=Eh(i,e,t,n,ci,hi,di,gs);if(h){s&&(fs.fromBufferAttribute(s,a),ps.fromBufferAttribute(s,l),ms.fromBufferAttribute(s,c),h.uv=qt.getInterpolation(gs,ci,hi,di,fs,ps,ms,new xe)),r&&(fs.fromBufferAttribute(r,a),ps.fromBufferAttribute(r,l),ms.fromBufferAttribute(r,c),h.uv1=qt.getInterpolation(gs,ci,hi,di,fs,ps,ms,new xe),h.uv2=h.uv1),o&&(pa.fromBufferAttribute(o,a),ma.fromBufferAttribute(o,l),ga.fromBufferAttribute(o,c),h.normal=qt.getInterpolation(gs,ci,hi,di,pa,ma,ga,new R),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const u={a,b:l,c,normal:new R,materialIndex:0};qt.getNormal(ci,hi,di,u.normal),h.face=u}return h}class Ui extends St{constructor(e=1,t=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};const a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);const l=[],c=[],h=[],u=[];let d=0,p=0;g("z","y","x",-1,-1,n,t,e,o,r,0),g("z","y","x",1,-1,n,t,-e,o,r,1),g("x","z","y",1,1,e,n,t,s,o,2),g("x","z","y",1,-1,e,n,-t,s,o,3),g("x","y","z",1,-1,e,t,n,s,r,4),g("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new yt(c,3)),this.setAttribute("normal",new yt(h,3)),this.setAttribute("uv",new yt(u,2));function g(x,m,f,S,_,w,L,C,T,W,v){const M=w/T,I=L/W,X=w/2,J=L/2,D=C/2,U=T+1,k=W+1;let K=0,Y=0;const $=new R;for(let Z=0;Z<k;Z++){const ee=Z*I-J;for(let z=0;z<U;z++){const O=z*M-X;$[x]=O*S,$[m]=ee*_,$[f]=D,c.push($.x,$.y,$.z),$[x]=0,$[m]=0,$[f]=C>0?1:-1,h.push($.x,$.y,$.z),u.push(z/T),u.push(1-Z/W),K+=1}}for(let Z=0;Z<W;Z++)for(let ee=0;ee<T;ee++){const z=d+ee+U*Z,O=d+ee+U*(Z+1),Q=d+(ee+1)+U*(Z+1),oe=d+(ee+1)+U*Z;l.push(z,O,oe),l.push(O,Q,oe),Y+=6}a.addGroup(p,Y,v),p+=Y,d+=K}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ui(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function ui(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const s=i[t][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone():Array.isArray(s)?e[t][n]=s.slice():e[t][n]=s}}return e}function wt(i){const e={};for(let t=0;t<i.length;t++){const n=ui(i[t]);for(const s in n)e[s]=n[s]}return e}function Th(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function xa(i){return i.getRenderTarget()===null?i.outputColorSpace:Ye.workingColorSpace}const wh={clone:ui,merge:wt};var Ah=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Ch=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Pn extends ai{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Ah,this.fragmentShader=Ch,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1,clipCullDistance:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ui(e.uniforms),this.uniformsGroups=Th(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class _a extends pt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new et,this.projectionMatrix=new et,this.projectionMatrixInverse=new et,this.coordinateSystem=Zt}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}class Lt extends _a{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Ai*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(wi*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Ai*2*Math.atan(Math.tan(wi*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}setViewOffset(e,t,n,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(wi*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,t-=o.offsetY*n/c,s*=o.width/l,n*=o.height/c}const a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const fi=-90,pi=1;class Rh extends pt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new Lt(fi,pi,e,t);s.layers=this.layers,this.add(s);const r=new Lt(fi,pi,e,t);r.layers=this.layers,this.add(r);const o=new Lt(fi,pi,e,t);o.layers=this.layers,this.add(o);const a=new Lt(fi,pi,e,t);a.layers=this.layers,this.add(a);const l=new Lt(fi,pi,e,t);l.layers=this.layers,this.add(l);const c=new Lt(fi,pi,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,s,r,o,a,l]=t;for(const c of t)this.remove(c);if(e===Zt)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===$i)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,l,c,h]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const x=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,s),e.render(t,r),e.setRenderTarget(n,1,s),e.render(t,o),e.setRenderTarget(n,2,s),e.render(t,a),e.setRenderTarget(n,3,s),e.render(t,l),e.setRenderTarget(n,4,s),e.render(t,c),n.texture.generateMipmaps=x,e.setRenderTarget(n,5,s),e.render(t,h),e.setRenderTarget(u,d,p),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class va extends Pt{constructor(e,t,n,s,r,o,a,l,c,h){e=e!==void 0?e:[],t=t!==void 0?t:jn,super(e,t,n,s,r,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Lh extends Tn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];t.encoding!==void 0&&(Ri("THREE.WebGLCubeRenderTarget: option.encoding has been replaced by option.colorSpace."),t.colorSpace=t.encoding===Mn?xt:kt),this.texture=new va(s,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:Bt}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new Ui(5,5,5),r=new Pn({name:"CubemapFromEquirect",uniforms:ui(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Ct,blending:hn});r.uniforms.tEquirect.value=t;const o=new Rt(s,r),a=t.minFilter;return t.minFilter===Ei&&(t.minFilter=Bt),new Rh(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,n,s){const r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,s);e.setRenderTarget(r)}}const gr=new R,Ph=new R,Dh=new Ve;class rn{constructor(e=new R(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const s=gr.subVectors(n,t).cross(Ph.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(gr),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||Dh.getNormalMatrix(e),s=this.coplanarPoint(gr).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Dn=new ts,vs=new R;class xr{constructor(e=new rn,t=new rn,n=new rn,s=new rn,r=new rn,o=new rn){this.planes=[e,t,n,s,r,o]}set(e,t,n,s,r,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Zt){const n=this.planes,s=e.elements,r=s[0],o=s[1],a=s[2],l=s[3],c=s[4],h=s[5],u=s[6],d=s[7],p=s[8],g=s[9],x=s[10],m=s[11],f=s[12],S=s[13],_=s[14],w=s[15];if(n[0].setComponents(l-r,d-c,m-p,w-f).normalize(),n[1].setComponents(l+r,d+c,m+p,w+f).normalize(),n[2].setComponents(l+o,d+h,m+g,w+S).normalize(),n[3].setComponents(l-o,d-h,m-g,w-S).normalize(),n[4].setComponents(l-a,d-u,m-x,w-_).normalize(),t===Zt)n[5].setComponents(l+a,d+u,m+x,w+_).normalize();else if(t===$i)n[5].setComponents(a,u,x,_).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Dn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Dn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Dn)}intersectsSprite(e){return Dn.center.set(0,0,0),Dn.radius=.7071067811865476,Dn.applyMatrix4(e.matrixWorld),this.intersectsSphere(Dn)}intersectsSphere(e){const t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const s=t[n];if(vs.x=s.normal.x>0?e.max.x:e.min.x,vs.y=s.normal.y>0?e.max.y:e.min.y,vs.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(vs)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function ya(){let i=null,e=!1,t=null,n=null;function s(r,o){t(r,o),n=i.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function Ih(i,e){const t=e.isWebGL2,n=new WeakMap;function s(c,h){const u=c.array,d=c.usage,p=u.byteLength,g=i.createBuffer();i.bindBuffer(h,g),i.bufferData(h,u,d),c.onUploadCallback();let x;if(u instanceof Float32Array)x=i.FLOAT;else if(u instanceof Uint16Array)if(c.isFloat16BufferAttribute)if(t)x=i.HALF_FLOAT;else throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");else x=i.UNSIGNED_SHORT;else if(u instanceof Int16Array)x=i.SHORT;else if(u instanceof Uint32Array)x=i.UNSIGNED_INT;else if(u instanceof Int32Array)x=i.INT;else if(u instanceof Int8Array)x=i.BYTE;else if(u instanceof Uint8Array)x=i.UNSIGNED_BYTE;else if(u instanceof Uint8ClampedArray)x=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+u);return{buffer:g,type:x,bytesPerElement:u.BYTES_PER_ELEMENT,version:c.version,size:p}}function r(c,h,u){const d=h.array,p=h._updateRange,g=h.updateRanges;if(i.bindBuffer(u,c),p.count===-1&&g.length===0&&i.bufferSubData(u,0,d),g.length!==0){for(let x=0,m=g.length;x<m;x++){const f=g[x];t?i.bufferSubData(u,f.start*d.BYTES_PER_ELEMENT,d,f.start,f.count):i.bufferSubData(u,f.start*d.BYTES_PER_ELEMENT,d.subarray(f.start,f.start+f.count))}h.clearUpdateRanges()}p.count!==-1&&(t?i.bufferSubData(u,p.offset*d.BYTES_PER_ELEMENT,d,p.offset,p.count):i.bufferSubData(u,p.offset*d.BYTES_PER_ELEMENT,d.subarray(p.offset,p.offset+p.count)),p.count=-1),h.onUploadCallback()}function o(c){return c.isInterleavedBufferAttribute&&(c=c.data),n.get(c)}function a(c){c.isInterleavedBufferAttribute&&(c=c.data);const h=n.get(c);h&&(i.deleteBuffer(h.buffer),n.delete(c))}function l(c,h){if(c.isGLBufferAttribute){const d=n.get(c);(!d||d.version<c.version)&&n.set(c,{buffer:c.buffer,type:c.type,bytesPerElement:c.elementSize,version:c.version});return}c.isInterleavedBufferAttribute&&(c=c.data);const u=n.get(c);if(u===void 0)n.set(c,s(c,h));else if(u.version<c.version){if(u.size!==c.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");r(u.buffer,c,h),u.version=c.version}}return{get:o,remove:a,update:l}}class _r extends St{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};const r=e/2,o=t/2,a=Math.floor(n),l=Math.floor(s),c=a+1,h=l+1,u=e/a,d=t/l,p=[],g=[],x=[],m=[];for(let f=0;f<h;f++){const S=f*d-o;for(let _=0;_<c;_++){const w=_*u-r;g.push(w,-S,0),x.push(0,0,1),m.push(_/a),m.push(1-f/l)}}for(let f=0;f<l;f++)for(let S=0;S<a;S++){const _=S+c*f,w=S+c*(f+1),L=S+1+c*(f+1),C=S+1+c*f;p.push(_,w,C),p.push(w,L,C)}this.setIndex(p),this.setAttribute("position",new yt(g,3)),this.setAttribute("normal",new yt(x,3)),this.setAttribute("uv",new yt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new _r(e.width,e.height,e.widthSegments,e.heightSegments)}}var Uh=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Nh=`#ifdef USE_ALPHAHASH
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
#endif`,Oh=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Fh=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Bh=`#ifdef USE_ALPHATEST
	if ( diffuseColor.a < alphaTest ) discard;
#endif`,kh=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,zh=`#ifdef USE_AOMAP
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
#endif`,Hh=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Vh=`#ifdef USE_BATCHING
	attribute float batchId;
	uniform highp sampler2D batchingTexture;
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
#endif`,Gh=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( batchId );
#endif`,Wh=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Xh=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,jh=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,qh=`#ifdef USE_IRIDESCENCE
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
#endif`,$h=`#ifdef USE_BUMPMAP
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
#endif`,Yh=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
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
#endif`,Kh=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Jh=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Zh=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Qh=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,ed=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,td=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,nd=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,id=`#define PI 3.141592653589793
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
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
float luminance( const in vec3 rgb ) {
	const vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );
	return dot( weights, rgb );
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
} // validated`,sd=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,rd=`vec3 transformedNormal = objectNormal;
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
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,od=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,ad=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,ld=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,cd=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,hd="gl_FragColor = linearToOutputTexel( gl_FragColor );",dd=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}
vec4 LinearToLinear( in vec4 value ) {
	return value;
}
vec4 LinearTosRGB( in vec4 value ) {
	return sRGBTransferOETF( value );
}`,ud=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,fd=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif

#endif`,pd=`#ifdef USE_ENVMAP
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
#endif`,md=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS

		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,gd=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,xd=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,_d=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,vd=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,yd=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Sd=`#ifdef USE_GRADIENTMAP
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
}`,bd=`#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,Md=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Ed=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Td=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,wd=`uniform bool receiveShadow;
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
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	#if defined ( LEGACY_LIGHTS )
		if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) {
			return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );
		}
		return 1.0;
	#else
		float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
		if ( cutoffDistance > 0.0 ) {
			distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
		}
		return distanceFalloff;
	#endif
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
#endif`,Ad=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );
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
#endif`,Cd=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Rd=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Ld=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Pd=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Dd=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
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
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
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
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
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
#endif`,Id=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
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
		float v = 0.5 / ( gv + gl );
		return saturate(v);
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
	vec3 f0 = material.specularColor;
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
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
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
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
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
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
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
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Ud=`
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
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
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
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
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
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
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
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
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
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Nd=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
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
#endif`,Od=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Fd=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Bd=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,kd=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,zd=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,Hd=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );

	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Vd=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Gd=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Wd=`#if defined( USE_POINTS_UV )
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
#endif`,Xd=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,jd=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,qd=`#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,$d=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		objectNormal += morphNormal0 * morphTargetInfluences[ 0 ];
		objectNormal += morphNormal1 * morphTargetInfluences[ 1 ];
		objectNormal += morphNormal2 * morphTargetInfluences[ 2 ];
		objectNormal += morphNormal3 * morphTargetInfluences[ 3 ];
	#endif
#endif`,Yd=`#ifdef USE_MORPHTARGETS
	uniform float morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
		uniform sampler2DArray morphTargetsTexture;
		uniform ivec2 morphTargetsTextureSize;
		vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
			int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
			int y = texelIndex / morphTargetsTextureSize.x;
			int x = texelIndex - y * morphTargetsTextureSize.x;
			ivec3 morphUV = ivec3( x, y, morphTargetIndex );
			return texelFetch( morphTargetsTexture, morphUV, 0 );
		}
	#else
		#ifndef USE_MORPHNORMALS
			uniform float morphTargetInfluences[ 8 ];
		#else
			uniform float morphTargetInfluences[ 4 ];
		#endif
	#endif
#endif`,Kd=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		transformed += morphTarget0 * morphTargetInfluences[ 0 ];
		transformed += morphTarget1 * morphTargetInfluences[ 1 ];
		transformed += morphTarget2 * morphTargetInfluences[ 2 ];
		transformed += morphTarget3 * morphTargetInfluences[ 3 ];
		#ifndef USE_MORPHNORMALS
			transformed += morphTarget4 * morphTargetInfluences[ 4 ];
			transformed += morphTarget5 * morphTargetInfluences[ 5 ];
			transformed += morphTarget6 * morphTargetInfluences[ 6 ];
			transformed += morphTarget7 * morphTargetInfluences[ 7 ];
		#endif
	#endif
#endif`,Jd=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
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
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Zd=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Qd=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,eu=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,tu=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,nu=`#ifdef USE_NORMALMAP
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
#endif`,iu=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,su=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,ru=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,ou=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,au=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,lu=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
const float ShiftRight8 = 1. / 256.;
vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}
vec2 packDepthToRG( in highp float v ) {
	return packDepthToRGBA( v ).yx;
}
float unpackRGToDepth( const in highp vec2 v ) {
	return unpackRGBAToDepth( vec4( v.xy, 0.0, 0.0 ) );
}
vec4 pack2HalfToRGBA( vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,cu=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,hu=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,du=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,uu=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,fu=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,pu=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,mu=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return shadow;
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
		vec3 lightToPosition = shadowCoord.xyz;
		float dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );		dp += shadowBias;
		vec3 bd3D = normalize( lightToPosition );
		#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
			vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
			return (
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
			) * ( 1.0 / 9.0 );
		#else
			return texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
		#endif
	}
#endif`,gu=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
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
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,xu=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
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
#endif`,_u=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,vu=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,yu=`#ifdef USE_SKINNING
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
#endif`,Su=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,bu=`#ifdef USE_SKINNING
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
#endif`,Mu=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Eu=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Tu=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,wu=`#ifndef saturate
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
vec3 OptimizedCineonToneMapping( vec3 color ) {
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
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color *= toneMappingExposure;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	return color;
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Au=`#ifdef USE_TRANSMISSION
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
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Cu=`#ifdef USE_TRANSMISSION
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
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
		vec3 refractedRayExit = position + transmissionRay;
		vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
		vec2 refractionCoords = ndcPos.xy / ndcPos.w;
		refractionCoords += 1.0;
		refractionCoords /= 2.0;
		vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
		vec3 transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Ru=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Lu=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Pu=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Du=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Be={alphahash_fragment:Uh,alphahash_pars_fragment:Nh,alphamap_fragment:Oh,alphamap_pars_fragment:Fh,alphatest_fragment:Bh,alphatest_pars_fragment:kh,aomap_fragment:zh,aomap_pars_fragment:Hh,batching_pars_vertex:Vh,batching_vertex:Gh,begin_vertex:Wh,beginnormal_vertex:Xh,bsdfs:jh,iridescence_fragment:qh,bumpmap_pars_fragment:$h,clipping_planes_fragment:Yh,clipping_planes_pars_fragment:Kh,clipping_planes_pars_vertex:Jh,clipping_planes_vertex:Zh,color_fragment:Qh,color_pars_fragment:ed,color_pars_vertex:td,color_vertex:nd,common:id,cube_uv_reflection_fragment:sd,defaultnormal_vertex:rd,displacementmap_pars_vertex:od,displacementmap_vertex:ad,emissivemap_fragment:ld,emissivemap_pars_fragment:cd,colorspace_fragment:hd,colorspace_pars_fragment:dd,envmap_fragment:ud,envmap_common_pars_fragment:fd,envmap_pars_fragment:pd,envmap_pars_vertex:md,envmap_physical_pars_fragment:Ad,envmap_vertex:gd,fog_vertex:xd,fog_pars_vertex:_d,fog_fragment:vd,fog_pars_fragment:yd,gradientmap_pars_fragment:Sd,lightmap_fragment:bd,lightmap_pars_fragment:Md,lights_lambert_fragment:Ed,lights_lambert_pars_fragment:Td,lights_pars_begin:wd,lights_toon_fragment:Cd,lights_toon_pars_fragment:Rd,lights_phong_fragment:Ld,lights_phong_pars_fragment:Pd,lights_physical_fragment:Dd,lights_physical_pars_fragment:Id,lights_fragment_begin:Ud,lights_fragment_maps:Nd,lights_fragment_end:Od,logdepthbuf_fragment:Fd,logdepthbuf_pars_fragment:Bd,logdepthbuf_pars_vertex:kd,logdepthbuf_vertex:zd,map_fragment:Hd,map_pars_fragment:Vd,map_particle_fragment:Gd,map_particle_pars_fragment:Wd,metalnessmap_fragment:Xd,metalnessmap_pars_fragment:jd,morphcolor_vertex:qd,morphnormal_vertex:$d,morphtarget_pars_vertex:Yd,morphtarget_vertex:Kd,normal_fragment_begin:Jd,normal_fragment_maps:Zd,normal_pars_fragment:Qd,normal_pars_vertex:eu,normal_vertex:tu,normalmap_pars_fragment:nu,clearcoat_normal_fragment_begin:iu,clearcoat_normal_fragment_maps:su,clearcoat_pars_fragment:ru,iridescence_pars_fragment:ou,opaque_fragment:au,packing:lu,premultiplied_alpha_fragment:cu,project_vertex:hu,dithering_fragment:du,dithering_pars_fragment:uu,roughnessmap_fragment:fu,roughnessmap_pars_fragment:pu,shadowmap_pars_fragment:mu,shadowmap_pars_vertex:gu,shadowmap_vertex:xu,shadowmask_pars_fragment:_u,skinbase_vertex:vu,skinning_pars_vertex:yu,skinning_vertex:Su,skinnormal_vertex:bu,specularmap_fragment:Mu,specularmap_pars_fragment:Eu,tonemapping_fragment:Tu,tonemapping_pars_fragment:wu,transmission_fragment:Au,transmission_pars_fragment:Cu,uv_pars_fragment:Ru,uv_pars_vertex:Lu,uv_vertex:Pu,worldpos_vertex:Du,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
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
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
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
}`,depth_frag:`#if DEPTH_PACKING == 3200
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
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#endif
}`,distanceRGBA_vert:`#define DISTANCE
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
}`,distanceRGBA_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
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
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
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
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
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
}`,meshbasic_frag:`uniform vec3 diffuse;
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
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
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
}`,meshlambert_vert:`#define LAMBERT
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
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
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
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
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
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
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
}`,meshmatcap_vert:`#define MATCAP
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
}`,meshmatcap_frag:`#define MATCAP
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
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
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
}`,meshnormal_vert:`#define NORMAL
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
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), opacity );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
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
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
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
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
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
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
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
}`,meshphysical_vert:`#define STANDARD
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
}`,meshphysical_frag:`#define STANDARD
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
#include <packing>
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
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
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
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
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
}`,meshtoon_vert:`#define TOON
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
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
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
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
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
}`,points_vert:`uniform float size;
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
}`,points_frag:`uniform vec3 diffuse;
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
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
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
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
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
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
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
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
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
}`,sprite_frag:`uniform vec3 diffuse;
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
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
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
}`},ae={common:{diffuse:{value:new Ue(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ve},alphaMap:{value:null},alphaMapTransform:{value:new Ve},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ve}},envmap:{envMap:{value:null},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ve}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ve}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ve},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ve},normalScale:{value:new xe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ve},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ve}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ve}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ve}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ue(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ue(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ve},alphaTest:{value:0},uvTransform:{value:new Ve}},sprite:{diffuse:{value:new Ue(16777215)},opacity:{value:1},center:{value:new xe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ve},alphaMap:{value:null},alphaMapTransform:{value:new Ve},alphaTest:{value:0}}},$t={basic:{uniforms:wt([ae.common,ae.specularmap,ae.envmap,ae.aomap,ae.lightmap,ae.fog]),vertexShader:Be.meshbasic_vert,fragmentShader:Be.meshbasic_frag},lambert:{uniforms:wt([ae.common,ae.specularmap,ae.envmap,ae.aomap,ae.lightmap,ae.emissivemap,ae.bumpmap,ae.normalmap,ae.displacementmap,ae.fog,ae.lights,{emissive:{value:new Ue(0)}}]),vertexShader:Be.meshlambert_vert,fragmentShader:Be.meshlambert_frag},phong:{uniforms:wt([ae.common,ae.specularmap,ae.envmap,ae.aomap,ae.lightmap,ae.emissivemap,ae.bumpmap,ae.normalmap,ae.displacementmap,ae.fog,ae.lights,{emissive:{value:new Ue(0)},specular:{value:new Ue(1118481)},shininess:{value:30}}]),vertexShader:Be.meshphong_vert,fragmentShader:Be.meshphong_frag},standard:{uniforms:wt([ae.common,ae.envmap,ae.aomap,ae.lightmap,ae.emissivemap,ae.bumpmap,ae.normalmap,ae.displacementmap,ae.roughnessmap,ae.metalnessmap,ae.fog,ae.lights,{emissive:{value:new Ue(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Be.meshphysical_vert,fragmentShader:Be.meshphysical_frag},toon:{uniforms:wt([ae.common,ae.aomap,ae.lightmap,ae.emissivemap,ae.bumpmap,ae.normalmap,ae.displacementmap,ae.gradientmap,ae.fog,ae.lights,{emissive:{value:new Ue(0)}}]),vertexShader:Be.meshtoon_vert,fragmentShader:Be.meshtoon_frag},matcap:{uniforms:wt([ae.common,ae.bumpmap,ae.normalmap,ae.displacementmap,ae.fog,{matcap:{value:null}}]),vertexShader:Be.meshmatcap_vert,fragmentShader:Be.meshmatcap_frag},points:{uniforms:wt([ae.points,ae.fog]),vertexShader:Be.points_vert,fragmentShader:Be.points_frag},dashed:{uniforms:wt([ae.common,ae.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Be.linedashed_vert,fragmentShader:Be.linedashed_frag},depth:{uniforms:wt([ae.common,ae.displacementmap]),vertexShader:Be.depth_vert,fragmentShader:Be.depth_frag},normal:{uniforms:wt([ae.common,ae.bumpmap,ae.normalmap,ae.displacementmap,{opacity:{value:1}}]),vertexShader:Be.meshnormal_vert,fragmentShader:Be.meshnormal_frag},sprite:{uniforms:wt([ae.sprite,ae.fog]),vertexShader:Be.sprite_vert,fragmentShader:Be.sprite_frag},background:{uniforms:{uvTransform:{value:new Ve},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Be.background_vert,fragmentShader:Be.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1}},vertexShader:Be.backgroundCube_vert,fragmentShader:Be.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Be.cube_vert,fragmentShader:Be.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Be.equirect_vert,fragmentShader:Be.equirect_frag},distanceRGBA:{uniforms:wt([ae.common,ae.displacementmap,{referencePosition:{value:new R},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Be.distanceRGBA_vert,fragmentShader:Be.distanceRGBA_frag},shadow:{uniforms:wt([ae.lights,ae.fog,{color:{value:new Ue(0)},opacity:{value:1}}]),vertexShader:Be.shadow_vert,fragmentShader:Be.shadow_frag}};$t.physical={uniforms:wt([$t.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ve},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ve},clearcoatNormalScale:{value:new xe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ve},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ve},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ve},sheen:{value:0},sheenColor:{value:new Ue(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ve},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ve},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ve},transmissionSamplerSize:{value:new xe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ve},attenuationDistance:{value:0},attenuationColor:{value:new Ue(0)},specularColor:{value:new Ue(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ve},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ve},anisotropyVector:{value:new xe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ve}}]),vertexShader:Be.meshphysical_vert,fragmentShader:Be.meshphysical_frag};const ys={r:0,b:0,g:0};function Iu(i,e,t,n,s,r,o){const a=new Ue(0);let l=r===!0?0:1,c,h,u=null,d=0,p=null;function g(m,f){let S=!1,_=f.isScene===!0?f.background:null;_&&_.isTexture&&(_=(f.backgroundBlurriness>0?t:e).get(_)),_===null?x(a,l):_&&_.isColor&&(x(_,1),S=!0);const w=i.xr.getEnvironmentBlendMode();w==="additive"?n.buffers.color.setClear(0,0,0,1,o):w==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||S)&&i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil),_&&(_.isCubeTexture||_.mapping===Gi)?(h===void 0&&(h=new Rt(new Ui(1,1,1),new Pn({name:"BackgroundCubeMaterial",uniforms:ui($t.backgroundCube.uniforms),vertexShader:$t.backgroundCube.vertexShader,fragmentShader:$t.backgroundCube.fragmentShader,side:Ct,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(L,C,T){this.matrixWorld.copyPosition(T.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),h.material.uniforms.envMap.value=_,h.material.uniforms.flipEnvMap.value=_.isCubeTexture&&_.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=f.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=f.backgroundIntensity,h.material.toneMapped=Ye.getTransfer(_.colorSpace)!==Ze,(u!==_||d!==_.version||p!==i.toneMapping)&&(h.material.needsUpdate=!0,u=_,d=_.version,p=i.toneMapping),h.layers.enableAll(),m.unshift(h,h.geometry,h.material,0,0,null)):_&&_.isTexture&&(c===void 0&&(c=new Rt(new _r(2,2),new Pn({name:"BackgroundMaterial",uniforms:ui($t.background.uniforms),vertexShader:$t.background.vertexShader,fragmentShader:$t.background.fragmentShader,side:cn,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=_,c.material.uniforms.backgroundIntensity.value=f.backgroundIntensity,c.material.toneMapped=Ye.getTransfer(_.colorSpace)!==Ze,_.matrixAutoUpdate===!0&&_.updateMatrix(),c.material.uniforms.uvTransform.value.copy(_.matrix),(u!==_||d!==_.version||p!==i.toneMapping)&&(c.material.needsUpdate=!0,u=_,d=_.version,p=i.toneMapping),c.layers.enableAll(),m.unshift(c,c.geometry,c.material,0,0,null))}function x(m,f){m.getRGB(ys,xa(i)),n.buffers.color.setClear(ys.r,ys.g,ys.b,f,o)}return{getClearColor:function(){return a},setClearColor:function(m,f=1){a.set(m),l=f,x(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(m){l=m,x(a,l)},render:g}}function Uu(i,e,t,n){const s=i.getParameter(i.MAX_VERTEX_ATTRIBS),r=n.isWebGL2?null:e.get("OES_vertex_array_object"),o=n.isWebGL2||r!==null,a={},l=m(null);let c=l,h=!1;function u(D,U,k,K,Y){let $=!1;if(o){const Z=x(K,k,U);c!==Z&&(c=Z,p(c.object)),$=f(D,K,k,Y),$&&S(D,K,k,Y)}else{const Z=U.wireframe===!0;(c.geometry!==K.id||c.program!==k.id||c.wireframe!==Z)&&(c.geometry=K.id,c.program=k.id,c.wireframe=Z,$=!0)}Y!==null&&t.update(Y,i.ELEMENT_ARRAY_BUFFER),($||h)&&(h=!1,W(D,U,k,K),Y!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(Y).buffer))}function d(){return n.isWebGL2?i.createVertexArray():r.createVertexArrayOES()}function p(D){return n.isWebGL2?i.bindVertexArray(D):r.bindVertexArrayOES(D)}function g(D){return n.isWebGL2?i.deleteVertexArray(D):r.deleteVertexArrayOES(D)}function x(D,U,k){const K=k.wireframe===!0;let Y=a[D.id];Y===void 0&&(Y={},a[D.id]=Y);let $=Y[U.id];$===void 0&&($={},Y[U.id]=$);let Z=$[K];return Z===void 0&&(Z=m(d()),$[K]=Z),Z}function m(D){const U=[],k=[],K=[];for(let Y=0;Y<s;Y++)U[Y]=0,k[Y]=0,K[Y]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:U,enabledAttributes:k,attributeDivisors:K,object:D,attributes:{},index:null}}function f(D,U,k,K){const Y=c.attributes,$=U.attributes;let Z=0;const ee=k.getAttributes();for(const z in ee)if(ee[z].location>=0){const Q=Y[z];let oe=$[z];if(oe===void 0&&(z==="instanceMatrix"&&D.instanceMatrix&&(oe=D.instanceMatrix),z==="instanceColor"&&D.instanceColor&&(oe=D.instanceColor)),Q===void 0||Q.attribute!==oe||oe&&Q.data!==oe.data)return!0;Z++}return c.attributesNum!==Z||c.index!==K}function S(D,U,k,K){const Y={},$=U.attributes;let Z=0;const ee=k.getAttributes();for(const z in ee)if(ee[z].location>=0){let Q=$[z];Q===void 0&&(z==="instanceMatrix"&&D.instanceMatrix&&(Q=D.instanceMatrix),z==="instanceColor"&&D.instanceColor&&(Q=D.instanceColor));const oe={};oe.attribute=Q,Q&&Q.data&&(oe.data=Q.data),Y[z]=oe,Z++}c.attributes=Y,c.attributesNum=Z,c.index=K}function _(){const D=c.newAttributes;for(let U=0,k=D.length;U<k;U++)D[U]=0}function w(D){L(D,0)}function L(D,U){const k=c.newAttributes,K=c.enabledAttributes,Y=c.attributeDivisors;k[D]=1,K[D]===0&&(i.enableVertexAttribArray(D),K[D]=1),Y[D]!==U&&((n.isWebGL2?i:e.get("ANGLE_instanced_arrays"))[n.isWebGL2?"vertexAttribDivisor":"vertexAttribDivisorANGLE"](D,U),Y[D]=U)}function C(){const D=c.newAttributes,U=c.enabledAttributes;for(let k=0,K=U.length;k<K;k++)U[k]!==D[k]&&(i.disableVertexAttribArray(k),U[k]=0)}function T(D,U,k,K,Y,$,Z){Z===!0?i.vertexAttribIPointer(D,U,k,Y,$):i.vertexAttribPointer(D,U,k,K,Y,$)}function W(D,U,k,K){if(n.isWebGL2===!1&&(D.isInstancedMesh||K.isInstancedBufferGeometry)&&e.get("ANGLE_instanced_arrays")===null)return;_();const Y=K.attributes,$=k.getAttributes(),Z=U.defaultAttributeValues;for(const ee in $){const z=$[ee];if(z.location>=0){let O=Y[ee];if(O===void 0&&(ee==="instanceMatrix"&&D.instanceMatrix&&(O=D.instanceMatrix),ee==="instanceColor"&&D.instanceColor&&(O=D.instanceColor)),O!==void 0){const Q=O.normalized,oe=O.itemSize,ue=t.get(O);if(ue===void 0)continue;const he=ue.buffer,Te=ue.type,we=ue.bytesPerElement,ve=n.isWebGL2===!0&&(Te===i.INT||Te===i.UNSIGNED_INT||O.gpuType===ao);if(O.isInterleavedBufferAttribute){const ke=O.data,H=ke.stride,lt=O.offset;if(ke.isInstancedInterleavedBuffer){for(let Se=0;Se<z.locationSize;Se++)L(z.location+Se,ke.meshPerAttribute);D.isInstancedMesh!==!0&&K._maxInstanceCount===void 0&&(K._maxInstanceCount=ke.meshPerAttribute*ke.count)}else for(let Se=0;Se<z.locationSize;Se++)w(z.location+Se);i.bindBuffer(i.ARRAY_BUFFER,he);for(let Se=0;Se<z.locationSize;Se++)T(z.location+Se,oe/z.locationSize,Te,Q,H*we,(lt+oe/z.locationSize*Se)*we,ve)}else{if(O.isInstancedBufferAttribute){for(let ke=0;ke<z.locationSize;ke++)L(z.location+ke,O.meshPerAttribute);D.isInstancedMesh!==!0&&K._maxInstanceCount===void 0&&(K._maxInstanceCount=O.meshPerAttribute*O.count)}else for(let ke=0;ke<z.locationSize;ke++)w(z.location+ke);i.bindBuffer(i.ARRAY_BUFFER,he);for(let ke=0;ke<z.locationSize;ke++)T(z.location+ke,oe/z.locationSize,Te,Q,oe*we,oe/z.locationSize*ke*we,ve)}}else if(Z!==void 0){const Q=Z[ee];if(Q!==void 0)switch(Q.length){case 2:i.vertexAttrib2fv(z.location,Q);break;case 3:i.vertexAttrib3fv(z.location,Q);break;case 4:i.vertexAttrib4fv(z.location,Q);break;default:i.vertexAttrib1fv(z.location,Q)}}}}C()}function v(){X();for(const D in a){const U=a[D];for(const k in U){const K=U[k];for(const Y in K)g(K[Y].object),delete K[Y];delete U[k]}delete a[D]}}function M(D){if(a[D.id]===void 0)return;const U=a[D.id];for(const k in U){const K=U[k];for(const Y in K)g(K[Y].object),delete K[Y];delete U[k]}delete a[D.id]}function I(D){for(const U in a){const k=a[U];if(k[D.id]===void 0)continue;const K=k[D.id];for(const Y in K)g(K[Y].object),delete K[Y];delete k[D.id]}}function X(){J(),h=!0,c!==l&&(c=l,p(c.object))}function J(){l.geometry=null,l.program=null,l.wireframe=!1}return{setup:u,reset:X,resetDefaultState:J,dispose:v,releaseStatesOfGeometry:M,releaseStatesOfProgram:I,initAttributes:_,enableAttribute:w,disableUnusedAttributes:C}}function Nu(i,e,t,n){const s=n.isWebGL2;let r;function o(h){r=h}function a(h,u){i.drawArrays(r,h,u),t.update(u,r,1)}function l(h,u,d){if(d===0)return;let p,g;if(s)p=i,g="drawArraysInstanced";else if(p=e.get("ANGLE_instanced_arrays"),g="drawArraysInstancedANGLE",p===null){console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}p[g](r,h,u,d),t.update(u,r,d)}function c(h,u,d){if(d===0)return;const p=e.get("WEBGL_multi_draw");if(p===null)for(let g=0;g<d;g++)this.render(h[g],u[g]);else{p.multiDrawArraysWEBGL(r,h,0,u,0,d);let g=0;for(let x=0;x<d;x++)g+=u[x];t.update(g,r,1)}}this.setMode=o,this.render=a,this.renderInstances=l,this.renderMultiDraw=c}function Ou(i,e,t){let n;function s(){if(n!==void 0)return n;if(e.has("EXT_texture_filter_anisotropic")===!0){const T=e.get("EXT_texture_filter_anisotropic");n=i.getParameter(T.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function r(T){if(T==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";T="mediump"}return T==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}const o=typeof WebGL2RenderingContext<"u"&&i.constructor.name==="WebGL2RenderingContext";let a=t.precision!==void 0?t.precision:"highp";const l=r(a);l!==a&&(console.warn("THREE.WebGLRenderer:",a,"not supported, using",l,"instead."),a=l);const c=o||e.has("WEBGL_draw_buffers"),h=t.logarithmicDepthBuffer===!0,u=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),d=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),p=i.getParameter(i.MAX_TEXTURE_SIZE),g=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),x=i.getParameter(i.MAX_VERTEX_ATTRIBS),m=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),f=i.getParameter(i.MAX_VARYING_VECTORS),S=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),_=d>0,w=o||e.has("OES_texture_float"),L=_&&w,C=o?i.getParameter(i.MAX_SAMPLES):0;return{isWebGL2:o,drawBuffers:c,getMaxAnisotropy:s,getMaxPrecision:r,precision:a,logarithmicDepthBuffer:h,maxTextures:u,maxVertexTextures:d,maxTextureSize:p,maxCubemapSize:g,maxAttributes:x,maxVertexUniforms:m,maxVaryings:f,maxFragmentUniforms:S,vertexTextures:_,floatFragmentTextures:w,floatVertexTextures:L,maxSamples:C}}function Fu(i){const e=this;let t=null,n=0,s=!1,r=!1;const o=new rn,a=new Ve,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){const p=u.length!==0||d||n!==0||s;return s=d,n=u.length,p},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){t=h(u,d,0)},this.setState=function(u,d,p){const g=u.clippingPlanes,x=u.clipIntersection,m=u.clipShadows,f=i.get(u);if(!s||g===null||g.length===0||r&&!m)r?h(null):c();else{const S=r?0:n,_=S*4;let w=f.clippingState||null;l.value=w,w=h(g,d,_,p);for(let L=0;L!==_;++L)w[L]=t[L];f.clippingState=w,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=S}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,d,p,g){const x=u!==null?u.length:0;let m=null;if(x!==0){if(m=l.value,g!==!0||m===null){const f=p+x*4,S=d.matrixWorldInverse;a.getNormalMatrix(S),(m===null||m.length<f)&&(m=new Float32Array(f));for(let _=0,w=p;_!==x;++_,w+=4)o.copy(u[_]).applyMatrix4(S,a),o.normal.toArray(m,w),m[w+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,m}}function Bu(i){let e=new WeakMap;function t(o,a){return a===Fs?o.mapping=jn:a===Bs&&(o.mapping=qn),o}function n(o){if(o&&o.isTexture){const a=o.mapping;if(a===Fs||a===Bs)if(e.has(o)){const l=e.get(o).texture;return t(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new Lh(l.height/2);return c.fromEquirectangularTexture(i,o),e.set(o,c),o.addEventListener("dispose",s),t(c.texture,o.mapping)}else return null}}return o}function s(o){const a=o.target;a.removeEventListener("dispose",s);const l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}class Ss extends _a{constructor(e=-1,t=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-e,o=n+e,a=s+t,l=s-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const mi=4,Sa=[.125,.215,.35,.446,.526,.582],In=20,vr=new Ss,ba=new Ue;let yr=null,Sr=0,br=0;const Un=(1+Math.sqrt(5))/2,gi=1/Un,Ma=[new R(1,1,1),new R(-1,1,1),new R(1,1,-1),new R(-1,1,-1),new R(0,Un,gi),new R(0,Un,-gi),new R(gi,0,Un),new R(-gi,0,Un),new R(Un,gi,0),new R(-Un,gi,0)];class Ea{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,s=100){yr=this._renderer.getRenderTarget(),Sr=this._renderer.getActiveCubeFace(),br=this._renderer.getActiveMipmapLevel(),this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(e,n,s,r),t>0&&this._blur(r,0,0,t),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Aa(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=wa(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(yr,Sr,br),e.scissorTest=!1,bs(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===jn||e.mapping===qn?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),yr=this._renderer.getRenderTarget(),Sr=this._renderer.getActiveCubeFace(),br=this._renderer.getActiveMipmapLevel();const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Bt,minFilter:Bt,generateMipmaps:!1,type:Ti,format:Gt,colorSpace:Jt,depthBuffer:!1},s=Ta(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Ta(e,t,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=ku(r)),this._blurMaterial=zu(r,e,t)}return s}_compileMaterial(e){const t=new Rt(this._lodPlanes[0],e);this._renderer.compile(t,vr)}_sceneToCubeUV(e,t,n,s){const a=new Lt(90,1,t,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,d=h.toneMapping;h.getClearColor(ba),h.toneMapping=dn,h.autoClear=!1;const p=new ca({name:"PMREM.Background",side:Ct,depthWrite:!1,depthTest:!1}),g=new Rt(new Ui,p);let x=!1;const m=e.background;m?m.isColor&&(p.color.copy(m),e.background=null,x=!0):(p.color.copy(ba),x=!0);for(let f=0;f<6;f++){const S=f%3;S===0?(a.up.set(0,l[f],0),a.lookAt(c[f],0,0)):S===1?(a.up.set(0,0,l[f]),a.lookAt(0,c[f],0)):(a.up.set(0,l[f],0),a.lookAt(0,0,c[f]));const _=this._cubeSize;bs(s,S*_,f>2?_:0,_,_),h.setRenderTarget(s),x&&h.render(g,a),h.render(e,a)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=d,h.autoClear=u,e.background=m}_textureToCubeUV(e,t){const n=this._renderer,s=e.mapping===jn||e.mapping===qn;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Aa()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=wa());const r=s?this._cubemapMaterial:this._equirectMaterial,o=new Rt(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=e;const l=this._cubeSize;bs(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,vr)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;for(let s=1;s<this._lodPlanes.length;s++){const r=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),o=Ma[(s-1)%Ma.length];this._blur(e,s-1,s,r,o)}t.autoClear=n}_blur(e,t,n,s,r){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,s,"latitudinal",r),this._halfBlur(o,e,n,n,s,"longitudinal",r)}_halfBlur(e,t,n,s,r,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new Rt(this._lodPlanes[s],c),d=c.uniforms,p=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*p):2*Math.PI/(2*In-1),x=r/g,m=isFinite(r)?1+Math.floor(h*x):In;m>In&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${In}`);const f=[];let S=0;for(let T=0;T<In;++T){const W=T/x,v=Math.exp(-W*W/2);f.push(v),T===0?S+=v:T<m&&(S+=2*v)}for(let T=0;T<f.length;T++)f[T]=f[T]/S;d.envMap.value=e.texture,d.samples.value=m,d.weights.value=f,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);const{_lodMax:_}=this;d.dTheta.value=g,d.mipInt.value=_-n;const w=this._sizeLods[s],L=3*w*(s>_-mi?s-_+mi:0),C=4*(this._cubeSize-w);bs(t,L,C,3*w,2*w),l.setRenderTarget(t),l.render(u,vr)}}function ku(i){const e=[],t=[],n=[];let s=i;const r=i-mi+1+Sa.length;for(let o=0;o<r;o++){const a=Math.pow(2,s);t.push(a);let l=1/a;o>i-mi?l=Sa[o-i+mi-1]:o===0&&(l=0),n.push(l);const c=1/(a-2),h=-c,u=1+c,d=[h,h,u,h,u,u,h,h,u,u,h,u],p=6,g=6,x=3,m=2,f=1,S=new Float32Array(x*g*p),_=new Float32Array(m*g*p),w=new Float32Array(f*g*p);for(let C=0;C<p;C++){const T=C%3*2/3-1,W=C>2?0:-1,v=[T,W,0,T+2/3,W,0,T+2/3,W+1,0,T,W,0,T+2/3,W+1,0,T,W+1,0];S.set(v,x*g*C),_.set(d,m*g*C);const M=[C,C,C,C,C,C];w.set(M,f*g*C)}const L=new St;L.setAttribute("position",new Je(S,x)),L.setAttribute("uv",new Je(_,m)),L.setAttribute("faceIndex",new Je(w,f)),e.push(L),s>mi&&s--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function Ta(i,e,t){const n=new Tn(i,e,t);return n.texture.mapping=Gi,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function bs(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function zu(i,e,t){const n=new Float32Array(In),s=new R(0,1,0);return new Pn({name:"SphericalGaussianBlur",defines:{n:In,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Mr(),fragmentShader:`

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
		`,blending:hn,depthTest:!1,depthWrite:!1})}function wa(){return new Pn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Mr(),fragmentShader:`

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
		`,blending:hn,depthTest:!1,depthWrite:!1})}function Aa(){return new Pn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Mr(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:hn,depthTest:!1,depthWrite:!1})}function Mr(){return`

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
	`}function Hu(i){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){const l=a.mapping,c=l===Fs||l===Bs,h=l===jn||l===qn;if(c||h)if(a.isRenderTargetTexture&&a.needsPMREMUpdate===!0){a.needsPMREMUpdate=!1;let u=e.get(a);return t===null&&(t=new Ea(i)),u=c?t.fromEquirectangular(a,u):t.fromCubemap(a,u),e.set(a,u),u.texture}else{if(e.has(a))return e.get(a).texture;{const u=a.image;if(c&&u&&u.height>0||h&&u&&s(u)){t===null&&(t=new Ea(i));const d=c?t.fromEquirectangular(a):t.fromCubemap(a);return e.set(a,d),a.addEventListener("dispose",r),d.texture}else return null}}}return a}function s(a){let l=0;const c=6;for(let h=0;h<c;h++)a[h]!==void 0&&l++;return l===c}function r(a){const l=a.target;l.removeEventListener("dispose",r);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function Vu(i){const e={};function t(n){if(e[n]!==void 0)return e[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(n){n.isWebGL2?(t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance")):(t("WEBGL_depth_texture"),t("OES_texture_float"),t("OES_texture_half_float"),t("OES_texture_half_float_linear"),t("OES_standard_derivatives"),t("OES_element_index_uint"),t("OES_vertex_array_object"),t("ANGLE_instanced_arrays")),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture")},get:function(n){const s=t(n);return s===null&&console.warn("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function Gu(i,e,t,n){const s={},r=new WeakMap;function o(u){const d=u.target;d.index!==null&&e.remove(d.index);for(const g in d.attributes)e.remove(d.attributes[g]);for(const g in d.morphAttributes){const x=d.morphAttributes[g];for(let m=0,f=x.length;m<f;m++)e.remove(x[m])}d.removeEventListener("dispose",o),delete s[d.id];const p=r.get(d);p&&(e.remove(p),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function a(u,d){return s[d.id]===!0||(d.addEventListener("dispose",o),s[d.id]=!0,t.memory.geometries++),d}function l(u){const d=u.attributes;for(const g in d)e.update(d[g],i.ARRAY_BUFFER);const p=u.morphAttributes;for(const g in p){const x=p[g];for(let m=0,f=x.length;m<f;m++)e.update(x[m],i.ARRAY_BUFFER)}}function c(u){const d=[],p=u.index,g=u.attributes.position;let x=0;if(p!==null){const S=p.array;x=p.version;for(let _=0,w=S.length;_<w;_+=3){const L=S[_+0],C=S[_+1],T=S[_+2];d.push(L,C,C,T,T,L)}}else if(g!==void 0){const S=g.array;x=g.version;for(let _=0,w=S.length/3-1;_<w;_+=3){const L=_+0,C=_+1,T=_+2;d.push(L,C,C,T,T,L)}}else return;const m=new(qo(d)?da:ha)(d,1);m.version=x;const f=r.get(u);f&&e.remove(f),r.set(u,m)}function h(u){const d=r.get(u);if(d){const p=u.index;p!==null&&d.version<p.version&&c(u)}else c(u);return r.get(u)}return{get:a,update:l,getWireframeAttribute:h}}function Wu(i,e,t,n){const s=n.isWebGL2;let r;function o(p){r=p}let a,l;function c(p){a=p.type,l=p.bytesPerElement}function h(p,g){i.drawElements(r,g,a,p*l),t.update(g,r,1)}function u(p,g,x){if(x===0)return;let m,f;if(s)m=i,f="drawElementsInstanced";else if(m=e.get("ANGLE_instanced_arrays"),f="drawElementsInstancedANGLE",m===null){console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}m[f](r,g,a,p*l,x),t.update(g,r,x)}function d(p,g,x){if(x===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let f=0;f<x;f++)this.render(p[f]/l,g[f]);else{m.multiDrawElementsWEBGL(r,g,0,a,p,0,x);let f=0;for(let S=0;S<x;S++)f+=g[S];t.update(f,r,1)}}this.setMode=o,this.setIndex=c,this.render=h,this.renderInstances=u,this.renderMultiDraw=d}function Xu(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(r/3);break;case i.LINES:t.lines+=a*(r/2);break;case i.LINE_STRIP:t.lines+=a*(r-1);break;case i.LINE_LOOP:t.lines+=a*r;break;case i.POINTS:t.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function ju(i,e){return i[0]-e[0]}function qu(i,e){return Math.abs(e[1])-Math.abs(i[1])}function $u(i,e,t){const n={},s=new Float32Array(8),r=new WeakMap,o=new ft,a=[];for(let c=0;c<8;c++)a[c]=[c,0];function l(c,h,u){const d=c.morphTargetInfluences;if(e.isWebGL2===!0){const p=h.morphAttributes.position||h.morphAttributes.normal||h.morphAttributes.color,g=p!==void 0?p.length:0;let x=r.get(h);if(x===void 0||x.count!==g){let D=function(){X.dispose(),r.delete(h),h.removeEventListener("dispose",D)};x!==void 0&&x.texture.dispose();const S=h.morphAttributes.position!==void 0,_=h.morphAttributes.normal!==void 0,w=h.morphAttributes.color!==void 0,L=h.morphAttributes.position||[],C=h.morphAttributes.normal||[],T=h.morphAttributes.color||[];let W=0;S===!0&&(W=1),_===!0&&(W=2),w===!0&&(W=3);let v=h.attributes.position.count*W,M=1;v>e.maxTextureSize&&(M=Math.ceil(v/e.maxTextureSize),v=e.maxTextureSize);const I=new Float32Array(v*M*4*g),X=new Qo(I,v,M,g);X.type=pn,X.needsUpdate=!0;const J=W*4;for(let U=0;U<g;U++){const k=L[U],K=C[U],Y=T[U],$=v*M*4*U;for(let Z=0;Z<k.count;Z++){const ee=Z*J;S===!0&&(o.fromBufferAttribute(k,Z),I[$+ee+0]=o.x,I[$+ee+1]=o.y,I[$+ee+2]=o.z,I[$+ee+3]=0),_===!0&&(o.fromBufferAttribute(K,Z),I[$+ee+4]=o.x,I[$+ee+5]=o.y,I[$+ee+6]=o.z,I[$+ee+7]=0),w===!0&&(o.fromBufferAttribute(Y,Z),I[$+ee+8]=o.x,I[$+ee+9]=o.y,I[$+ee+10]=o.z,I[$+ee+11]=Y.itemSize===4?o.w:1)}}x={count:g,texture:X,size:new xe(v,M)},r.set(h,x),h.addEventListener("dispose",D)}let m=0;for(let S=0;S<d.length;S++)m+=d[S];const f=h.morphTargetsRelative?1:1-m;u.getUniforms().setValue(i,"morphTargetBaseInfluence",f),u.getUniforms().setValue(i,"morphTargetInfluences",d),u.getUniforms().setValue(i,"morphTargetsTexture",x.texture,t),u.getUniforms().setValue(i,"morphTargetsTextureSize",x.size)}else{const p=d===void 0?0:d.length;let g=n[h.id];if(g===void 0||g.length!==p){g=[];for(let _=0;_<p;_++)g[_]=[_,0];n[h.id]=g}for(let _=0;_<p;_++){const w=g[_];w[0]=_,w[1]=d[_]}g.sort(qu);for(let _=0;_<8;_++)_<p&&g[_][1]?(a[_][0]=g[_][0],a[_][1]=g[_][1]):(a[_][0]=Number.MAX_SAFE_INTEGER,a[_][1]=0);a.sort(ju);const x=h.morphAttributes.position,m=h.morphAttributes.normal;let f=0;for(let _=0;_<8;_++){const w=a[_],L=w[0],C=w[1];L!==Number.MAX_SAFE_INTEGER&&C?(x&&h.getAttribute("morphTarget"+_)!==x[L]&&h.setAttribute("morphTarget"+_,x[L]),m&&h.getAttribute("morphNormal"+_)!==m[L]&&h.setAttribute("morphNormal"+_,m[L]),s[_]=C,f+=C):(x&&h.hasAttribute("morphTarget"+_)===!0&&h.deleteAttribute("morphTarget"+_),m&&h.hasAttribute("morphNormal"+_)===!0&&h.deleteAttribute("morphNormal"+_),s[_]=0)}const S=h.morphTargetsRelative?1:1-f;u.getUniforms().setValue(i,"morphTargetBaseInfluence",S),u.getUniforms().setValue(i,"morphTargetInfluences",s)}}return{update:l}}function Yu(i,e,t,n){let s=new WeakMap;function r(l){const c=n.render.frame,h=l.geometry,u=e.get(l,h);if(s.get(u)!==c&&(e.update(u),s.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),s.get(l)!==c&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){const d=l.skeleton;s.get(d)!==c&&(d.update(),s.set(d,c))}return u}function o(){s=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:o}}class Ca extends Pt{constructor(e,t,n,s,r,o,a,l,c,h){if(h=h!==void 0?h:bn,h!==bn&&h!==$n)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===bn&&(n=fn),n===void 0&&h===$n&&(n=Sn),super(null,s,r,o,a,l,h,n,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:Et,this.minFilter=l!==void 0?l:Et,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const Ra=new Pt,La=new Ca(1,1);La.compareFunction=Go;const Pa=new Qo,Da=new fh,Ia=new va,Ua=[],Na=[],Oa=new Float32Array(16),Fa=new Float32Array(9),Ba=new Float32Array(4);function xi(i,e,t){const n=i[0];if(n<=0||n>0)return i;const s=e*t;let r=Ua[s];if(r===void 0&&(r=new Float32Array(s),Ua[s]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(r,a)}return r}function ht(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function dt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Ms(i,e){let t=Na[e];t===void 0&&(t=new Int32Array(e),Na[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function Ku(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function Ju(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(ht(t,e))return;i.uniform2fv(this.addr,e),dt(t,e)}}function Zu(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(ht(t,e))return;i.uniform3fv(this.addr,e),dt(t,e)}}function Qu(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(ht(t,e))return;i.uniform4fv(this.addr,e),dt(t,e)}}function ef(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(ht(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),dt(t,e)}else{if(ht(t,n))return;Ba.set(n),i.uniformMatrix2fv(this.addr,!1,Ba),dt(t,n)}}function tf(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(ht(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),dt(t,e)}else{if(ht(t,n))return;Fa.set(n),i.uniformMatrix3fv(this.addr,!1,Fa),dt(t,n)}}function nf(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(ht(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),dt(t,e)}else{if(ht(t,n))return;Oa.set(n),i.uniformMatrix4fv(this.addr,!1,Oa),dt(t,n)}}function sf(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function rf(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(ht(t,e))return;i.uniform2iv(this.addr,e),dt(t,e)}}function of(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(ht(t,e))return;i.uniform3iv(this.addr,e),dt(t,e)}}function af(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(ht(t,e))return;i.uniform4iv(this.addr,e),dt(t,e)}}function lf(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function cf(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(ht(t,e))return;i.uniform2uiv(this.addr,e),dt(t,e)}}function hf(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(ht(t,e))return;i.uniform3uiv(this.addr,e),dt(t,e)}}function df(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(ht(t,e))return;i.uniform4uiv(this.addr,e),dt(t,e)}}function uf(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);const r=this.type===i.SAMPLER_2D_SHADOW?La:Ra;t.setTexture2D(e||r,s)}function ff(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||Da,s)}function pf(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||Ia,s)}function mf(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||Pa,s)}function gf(i){switch(i){case 5126:return Ku;case 35664:return Ju;case 35665:return Zu;case 35666:return Qu;case 35674:return ef;case 35675:return tf;case 35676:return nf;case 5124:case 35670:return sf;case 35667:case 35671:return rf;case 35668:case 35672:return of;case 35669:case 35673:return af;case 5125:return lf;case 36294:return cf;case 36295:return hf;case 36296:return df;case 35678:case 36198:case 36298:case 36306:case 35682:return uf;case 35679:case 36299:case 36307:return ff;case 35680:case 36300:case 36308:case 36293:return pf;case 36289:case 36303:case 36311:case 36292:return mf}}function xf(i,e){i.uniform1fv(this.addr,e)}function _f(i,e){const t=xi(e,this.size,2);i.uniform2fv(this.addr,t)}function vf(i,e){const t=xi(e,this.size,3);i.uniform3fv(this.addr,t)}function yf(i,e){const t=xi(e,this.size,4);i.uniform4fv(this.addr,t)}function Sf(i,e){const t=xi(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function bf(i,e){const t=xi(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Mf(i,e){const t=xi(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Ef(i,e){i.uniform1iv(this.addr,e)}function Tf(i,e){i.uniform2iv(this.addr,e)}function wf(i,e){i.uniform3iv(this.addr,e)}function Af(i,e){i.uniform4iv(this.addr,e)}function Cf(i,e){i.uniform1uiv(this.addr,e)}function Rf(i,e){i.uniform2uiv(this.addr,e)}function Lf(i,e){i.uniform3uiv(this.addr,e)}function Pf(i,e){i.uniform4uiv(this.addr,e)}function Df(i,e,t){const n=this.cache,s=e.length,r=Ms(t,s);ht(n,r)||(i.uniform1iv(this.addr,r),dt(n,r));for(let o=0;o!==s;++o)t.setTexture2D(e[o]||Ra,r[o])}function If(i,e,t){const n=this.cache,s=e.length,r=Ms(t,s);ht(n,r)||(i.uniform1iv(this.addr,r),dt(n,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||Da,r[o])}function Uf(i,e,t){const n=this.cache,s=e.length,r=Ms(t,s);ht(n,r)||(i.uniform1iv(this.addr,r),dt(n,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||Ia,r[o])}function Nf(i,e,t){const n=this.cache,s=e.length,r=Ms(t,s);ht(n,r)||(i.uniform1iv(this.addr,r),dt(n,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||Pa,r[o])}function Of(i){switch(i){case 5126:return xf;case 35664:return _f;case 35665:return vf;case 35666:return yf;case 35674:return Sf;case 35675:return bf;case 35676:return Mf;case 5124:case 35670:return Ef;case 35667:case 35671:return Tf;case 35668:case 35672:return wf;case 35669:case 35673:return Af;case 5125:return Cf;case 36294:return Rf;case 36295:return Lf;case 36296:return Pf;case 35678:case 36198:case 36298:case 36306:case 35682:return Df;case 35679:case 36299:case 36307:return If;case 35680:case 36300:case 36308:case 36293:return Uf;case 36289:case 36303:case 36311:case 36292:return Nf}}class Ff{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=gf(t.type)}}class Bf{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Of(t.type)}}class kf{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const s=this.seq;for(let r=0,o=s.length;r!==o;++r){const a=s[r];a.setValue(e,t[a.id],n)}}}const Er=/(\w+)(\])?(\[|\.)?/g;function ka(i,e){i.seq.push(e),i.map[e.id]=e}function zf(i,e,t){const n=i.name,s=n.length;for(Er.lastIndex=0;;){const r=Er.exec(n),o=Er.lastIndex;let a=r[1];const l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){ka(t,c===void 0?new Ff(a,i,e):new Bf(a,i,e));break}else{let u=t.map[a];u===void 0&&(u=new kf(a),ka(t,u)),t=u}}}class Es{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){const r=e.getActiveUniform(t,s),o=e.getUniformLocation(t,r.name);zf(r,o,this)}}setValue(e,t,n,s){const r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){const s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,o=t.length;r!==o;++r){const a=t[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,s)}}static seqWithValue(e,t){const n=[];for(let s=0,r=e.length;s!==r;++s){const o=e[s];o.id in t&&n.push(o)}return n}}function za(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const Hf=37297;let Vf=0;function Gf(i,e){const t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){const a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}function Wf(i){const e=Ye.getPrimaries(Ye.workingColorSpace),t=Ye.getPrimaries(i);let n;switch(e===t?n="":e===qi&&t===ji?n="LinearDisplayP3ToLinearSRGB":e===ji&&t===qi&&(n="LinearSRGBToLinearDisplayP3"),i){case Jt:case Wi:return[n,"LinearTransferOETF"];case xt:case $s:return[n,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",i),[n,"LinearTransferOETF"]}}function Ha(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),s=i.getShaderInfoLog(e).trim();if(n&&s==="")return"";const r=/ERROR: 0:(\d+)/.exec(s);if(r){const o=parseInt(r[1]);return t.toUpperCase()+`

`+s+`

`+Gf(i.getShaderSource(e),o)}else return s}function Xf(i,e){const t=Wf(e);return`vec4 ${i}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`}function jf(i,e){let t;switch(e){case Mc:t="Linear";break;case Ec:t="Reinhard";break;case Tc:t="OptimizedCineon";break;case wc:t="ACESFilmic";break;case Cc:t="AgX";break;case Ac:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}function qf(i){return[i.extensionDerivatives||i.envMapCubeUVHeight||i.bumpMap||i.normalMapTangentSpace||i.clearcoatNormalMap||i.flatShading||i.shaderID==="physical"?"#extension GL_OES_standard_derivatives : enable":"",(i.extensionFragDepth||i.logarithmicDepthBuffer)&&i.rendererExtensionFragDepth?"#extension GL_EXT_frag_depth : enable":"",i.extensionDrawBuffers&&i.rendererExtensionDrawBuffers?"#extension GL_EXT_draw_buffers : require":"",(i.extensionShaderTextureLOD||i.envMap||i.transmission)&&i.rendererExtensionShaderTextureLod?"#extension GL_EXT_shader_texture_lod : enable":""].filter(_i).join(`
`)}function $f(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":""].filter(_i).join(`
`)}function Yf(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function Kf(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(e,s),o=r.name;let a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function _i(i){return i!==""}function Va(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Ga(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const Jf=/^[ \t]*#include +<([\w\d./]+)>/gm;function Tr(i){return i.replace(Jf,Qf)}const Zf=new Map([["encodings_fragment","colorspace_fragment"],["encodings_pars_fragment","colorspace_pars_fragment"],["output_fragment","opaque_fragment"]]);function Qf(i,e){let t=Be[e];if(t===void 0){const n=Zf.get(e);if(n!==void 0)t=Be[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Tr(t)}const ep=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Wa(i){return i.replace(ep,tp)}function tp(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Xa(i){let e="precision "+i.precision+` float;
precision `+i.precision+" int;";return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function np(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===Qr?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===Jl?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===Kt&&(e="SHADOWMAP_TYPE_VSM"),e}function ip(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case jn:case qn:e="ENVMAP_TYPE_CUBE";break;case Gi:e="ENVMAP_TYPE_CUBE_UV";break}return e}function sp(i){let e="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case qn:e="ENVMAP_MODE_REFRACTION";break}return e}function rp(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case Os:e="ENVMAP_BLENDING_MULTIPLY";break;case Sc:e="ENVMAP_BLENDING_MIX";break;case bc:e="ENVMAP_BLENDING_ADD";break}return e}function op(i){const e=i.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:n,maxMip:t}}function ap(i,e,t,n){const s=i.getContext(),r=t.defines;let o=t.vertexShader,a=t.fragmentShader;const l=np(t),c=ip(t),h=sp(t),u=rp(t),d=op(t),p=t.isWebGL2?"":qf(t),g=$f(t),x=Yf(r),m=s.createProgram();let f,S,_=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(f=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(_i).join(`
`),f.length>0&&(f+=`
`),S=[p,"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(_i).join(`
`),S.length>0&&(S+=`
`)):(f=[Xa(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors&&t.isWebGL2?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )","	attribute vec3 morphTarget0;","	attribute vec3 morphTarget1;","	attribute vec3 morphTarget2;","	attribute vec3 morphTarget3;","	#ifdef USE_MORPHNORMALS","		attribute vec3 morphNormal0;","		attribute vec3 morphNormal1;","		attribute vec3 morphNormal2;","		attribute vec3 morphNormal3;","	#else","		attribute vec3 morphTarget4;","		attribute vec3 morphTarget5;","		attribute vec3 morphTarget6;","		attribute vec3 morphTarget7;","	#endif","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(_i).join(`
`),S=[p,Xa(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==dn?"#define TONE_MAPPING":"",t.toneMapping!==dn?Be.tonemapping_pars_fragment:"",t.toneMapping!==dn?jf("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Be.colorspace_pars_fragment,Xf("linearToOutputTexel",t.outputColorSpace),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(_i).join(`
`)),o=Tr(o),o=Va(o,t),o=Ga(o,t),a=Tr(a),a=Va(a,t),a=Ga(a,t),o=Wa(o),a=Wa(a),t.isWebGL2&&t.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,f=[g,"precision mediump sampler2DArray;","#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+f,S=["precision mediump sampler2DArray;","#define varying in",t.glslVersion===Xo?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Xo?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+S);const w=_+f+o,L=_+S+a,C=za(s,s.VERTEX_SHADER,w),T=za(s,s.FRAGMENT_SHADER,L);s.attachShader(m,C),s.attachShader(m,T),t.index0AttributeName!==void 0?s.bindAttribLocation(m,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(m,0,"position"),s.linkProgram(m);function W(X){if(i.debug.checkShaderErrors){const J=s.getProgramInfoLog(m).trim(),D=s.getShaderInfoLog(C).trim(),U=s.getShaderInfoLog(T).trim();let k=!0,K=!0;if(s.getProgramParameter(m,s.LINK_STATUS)===!1)if(k=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,m,C,T);else{const Y=Ha(s,C,"vertex"),$=Ha(s,T,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(m,s.VALIDATE_STATUS)+`

Program Info Log: `+J+`
`+Y+`
`+$)}else J!==""?console.warn("THREE.WebGLProgram: Program Info Log:",J):(D===""||U==="")&&(K=!1);K&&(X.diagnostics={runnable:k,programLog:J,vertexShader:{log:D,prefix:f},fragmentShader:{log:U,prefix:S}})}s.deleteShader(C),s.deleteShader(T),v=new Es(s,m),M=Kf(s,m)}let v;this.getUniforms=function(){return v===void 0&&W(this),v};let M;this.getAttributes=function(){return M===void 0&&W(this),M};let I=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return I===!1&&(I=s.getProgramParameter(m,Hf)),I},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(m),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Vf++,this.cacheKey=e,this.usedTimes=1,this.program=m,this.vertexShader=C,this.fragmentShader=T,this}let lp=0;class cp{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new hp(e),t.set(e,n)),n}}class hp{constructor(e){this.id=lp++,this.code=e,this.usedTimes=0}}function dp(i,e,t,n,s,r,o){const a=new lr,l=new cp,c=[],h=s.isWebGL2,u=s.logarithmicDepthBuffer,d=s.vertexTextures;let p=s.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(v){return v===0?"uv":`uv${v}`}function m(v,M,I,X,J){const D=X.fog,U=J.geometry,k=v.isMeshStandardMaterial?X.environment:null,K=(v.isMeshStandardMaterial?t:e).get(v.envMap||k),Y=K&&K.mapping===Gi?K.image.height:null,$=g[v.type];v.precision!==null&&(p=s.getMaxPrecision(v.precision),p!==v.precision&&console.warn("THREE.WebGLProgram.getParameters:",v.precision,"not supported, using",p,"instead."));const Z=U.morphAttributes.position||U.morphAttributes.normal||U.morphAttributes.color,ee=Z!==void 0?Z.length:0;let z=0;U.morphAttributes.position!==void 0&&(z=1),U.morphAttributes.normal!==void 0&&(z=2),U.morphAttributes.color!==void 0&&(z=3);let O,Q,oe,ue;if($){const st=$t[$];O=st.vertexShader,Q=st.fragmentShader}else O=v.vertexShader,Q=v.fragmentShader,l.update(v),oe=l.getVertexShaderID(v),ue=l.getFragmentShaderID(v);const he=i.getRenderTarget(),Te=J.isInstancedMesh===!0,we=J.isBatchedMesh===!0,ve=!!v.map,ke=!!v.matcap,H=!!K,lt=!!v.aoMap,Se=!!v.lightMap,Re=!!v.bumpMap,_e=!!v.normalMap,Ke=!!v.displacementMap,Ae=!!v.emissiveMap,E=!!v.metalnessMap,y=!!v.roughnessMap,B=v.anisotropy>0,te=v.clearcoat>0,F=v.iridescence>0,q=v.sheen>0,ge=v.transmission>0,ce=B&&!!v.anisotropyMap,me=te&&!!v.clearcoatMap,Ce=te&&!!v.clearcoatNormalMap,Oe=te&&!!v.clearcoatRoughnessMap,ne=F&&!!v.iridescenceMap,$e=F&&!!v.iridescenceThicknessMap,ze=q&&!!v.sheenColorMap,De=q&&!!v.sheenRoughnessMap,Me=!!v.specularMap,de=!!v.specularColorMap,A=!!v.specularIntensityMap,se=ge&&!!v.transmissionMap,ye=ge&&!!v.thicknessMap,pe=!!v.gradientMap,ie=!!v.alphaMap,P=v.alphaTest>0,re=!!v.alphaHash,le=!!v.extensions,Le=!!U.attributes.uv1,Ee=!!U.attributes.uv2,Xe=!!U.attributes.uv3;let je=dn;return v.toneMapped&&(he===null||he.isXRRenderTarget===!0)&&(je=i.toneMapping),{isWebGL2:h,shaderID:$,shaderType:v.type,shaderName:v.name,vertexShader:O,fragmentShader:Q,defines:v.defines,customVertexShaderID:oe,customFragmentShaderID:ue,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:p,batching:we,instancing:Te,instancingColor:Te&&J.instanceColor!==null,supportsVertexTextures:d,outputColorSpace:he===null?i.outputColorSpace:he.isXRRenderTarget===!0?he.texture.colorSpace:Jt,map:ve,matcap:ke,envMap:H,envMapMode:H&&K.mapping,envMapCubeUVHeight:Y,aoMap:lt,lightMap:Se,bumpMap:Re,normalMap:_e,displacementMap:d&&Ke,emissiveMap:Ae,normalMapObjectSpace:_e&&v.normalMapType===zc,normalMapTangentSpace:_e&&v.normalMapType===Ho,metalnessMap:E,roughnessMap:y,anisotropy:B,anisotropyMap:ce,clearcoat:te,clearcoatMap:me,clearcoatNormalMap:Ce,clearcoatRoughnessMap:Oe,iridescence:F,iridescenceMap:ne,iridescenceThicknessMap:$e,sheen:q,sheenColorMap:ze,sheenRoughnessMap:De,specularMap:Me,specularColorMap:de,specularIntensityMap:A,transmission:ge,transmissionMap:se,thicknessMap:ye,gradientMap:pe,opaque:v.transparent===!1&&v.blending===Xn,alphaMap:ie,alphaTest:P,alphaHash:re,combine:v.combine,mapUv:ve&&x(v.map.channel),aoMapUv:lt&&x(v.aoMap.channel),lightMapUv:Se&&x(v.lightMap.channel),bumpMapUv:Re&&x(v.bumpMap.channel),normalMapUv:_e&&x(v.normalMap.channel),displacementMapUv:Ke&&x(v.displacementMap.channel),emissiveMapUv:Ae&&x(v.emissiveMap.channel),metalnessMapUv:E&&x(v.metalnessMap.channel),roughnessMapUv:y&&x(v.roughnessMap.channel),anisotropyMapUv:ce&&x(v.anisotropyMap.channel),clearcoatMapUv:me&&x(v.clearcoatMap.channel),clearcoatNormalMapUv:Ce&&x(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Oe&&x(v.clearcoatRoughnessMap.channel),iridescenceMapUv:ne&&x(v.iridescenceMap.channel),iridescenceThicknessMapUv:$e&&x(v.iridescenceThicknessMap.channel),sheenColorMapUv:ze&&x(v.sheenColorMap.channel),sheenRoughnessMapUv:De&&x(v.sheenRoughnessMap.channel),specularMapUv:Me&&x(v.specularMap.channel),specularColorMapUv:de&&x(v.specularColorMap.channel),specularIntensityMapUv:A&&x(v.specularIntensityMap.channel),transmissionMapUv:se&&x(v.transmissionMap.channel),thicknessMapUv:ye&&x(v.thicknessMap.channel),alphaMapUv:ie&&x(v.alphaMap.channel),vertexTangents:!!U.attributes.tangent&&(_e||B),vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!U.attributes.color&&U.attributes.color.itemSize===4,vertexUv1s:Le,vertexUv2s:Ee,vertexUv3s:Xe,pointsUvs:J.isPoints===!0&&!!U.attributes.uv&&(ve||ie),fog:!!D,useFog:v.fog===!0,fogExp2:D&&D.isFogExp2,flatShading:v.flatShading===!0,sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:u,skinning:J.isSkinnedMesh===!0,morphTargets:U.morphAttributes.position!==void 0,morphNormals:U.morphAttributes.normal!==void 0,morphColors:U.morphAttributes.color!==void 0,morphTargetsCount:ee,morphTextureStride:z,numDirLights:M.directional.length,numPointLights:M.point.length,numSpotLights:M.spot.length,numSpotLightMaps:M.spotLightMap.length,numRectAreaLights:M.rectArea.length,numHemiLights:M.hemi.length,numDirLightShadows:M.directionalShadowMap.length,numPointLightShadows:M.pointShadowMap.length,numSpotLightShadows:M.spotShadowMap.length,numSpotLightShadowsWithMaps:M.numSpotLightShadowsWithMaps,numLightProbes:M.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:v.dithering,shadowMapEnabled:i.shadowMap.enabled&&I.length>0,shadowMapType:i.shadowMap.type,toneMapping:je,useLegacyLights:i._useLegacyLights,decodeVideoTexture:ve&&v.map.isVideoTexture===!0&&Ye.getTransfer(v.map.colorSpace)===Ze,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===Ft,flipSided:v.side===Ct,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionDerivatives:le&&v.extensions.derivatives===!0,extensionFragDepth:le&&v.extensions.fragDepth===!0,extensionDrawBuffers:le&&v.extensions.drawBuffers===!0,extensionShaderTextureLOD:le&&v.extensions.shaderTextureLOD===!0,extensionClipCullDistance:le&&v.extensions.clipCullDistance&&n.has("WEBGL_clip_cull_distance"),rendererExtensionFragDepth:h||n.has("EXT_frag_depth"),rendererExtensionDrawBuffers:h||n.has("WEBGL_draw_buffers"),rendererExtensionShaderTextureLod:h||n.has("EXT_shader_texture_lod"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()}}function f(v){const M=[];if(v.shaderID?M.push(v.shaderID):(M.push(v.customVertexShaderID),M.push(v.customFragmentShaderID)),v.defines!==void 0)for(const I in v.defines)M.push(I),M.push(v.defines[I]);return v.isRawShaderMaterial===!1&&(S(M,v),_(M,v),M.push(i.outputColorSpace)),M.push(v.customProgramCacheKey),M.join()}function S(v,M){v.push(M.precision),v.push(M.outputColorSpace),v.push(M.envMapMode),v.push(M.envMapCubeUVHeight),v.push(M.mapUv),v.push(M.alphaMapUv),v.push(M.lightMapUv),v.push(M.aoMapUv),v.push(M.bumpMapUv),v.push(M.normalMapUv),v.push(M.displacementMapUv),v.push(M.emissiveMapUv),v.push(M.metalnessMapUv),v.push(M.roughnessMapUv),v.push(M.anisotropyMapUv),v.push(M.clearcoatMapUv),v.push(M.clearcoatNormalMapUv),v.push(M.clearcoatRoughnessMapUv),v.push(M.iridescenceMapUv),v.push(M.iridescenceThicknessMapUv),v.push(M.sheenColorMapUv),v.push(M.sheenRoughnessMapUv),v.push(M.specularMapUv),v.push(M.specularColorMapUv),v.push(M.specularIntensityMapUv),v.push(M.transmissionMapUv),v.push(M.thicknessMapUv),v.push(M.combine),v.push(M.fogExp2),v.push(M.sizeAttenuation),v.push(M.morphTargetsCount),v.push(M.morphAttributeCount),v.push(M.numDirLights),v.push(M.numPointLights),v.push(M.numSpotLights),v.push(M.numSpotLightMaps),v.push(M.numHemiLights),v.push(M.numRectAreaLights),v.push(M.numDirLightShadows),v.push(M.numPointLightShadows),v.push(M.numSpotLightShadows),v.push(M.numSpotLightShadowsWithMaps),v.push(M.numLightProbes),v.push(M.shadowMapType),v.push(M.toneMapping),v.push(M.numClippingPlanes),v.push(M.numClipIntersection),v.push(M.depthPacking)}function _(v,M){a.disableAll(),M.isWebGL2&&a.enable(0),M.supportsVertexTextures&&a.enable(1),M.instancing&&a.enable(2),M.instancingColor&&a.enable(3),M.matcap&&a.enable(4),M.envMap&&a.enable(5),M.normalMapObjectSpace&&a.enable(6),M.normalMapTangentSpace&&a.enable(7),M.clearcoat&&a.enable(8),M.iridescence&&a.enable(9),M.alphaTest&&a.enable(10),M.vertexColors&&a.enable(11),M.vertexAlphas&&a.enable(12),M.vertexUv1s&&a.enable(13),M.vertexUv2s&&a.enable(14),M.vertexUv3s&&a.enable(15),M.vertexTangents&&a.enable(16),M.anisotropy&&a.enable(17),M.alphaHash&&a.enable(18),M.batching&&a.enable(19),v.push(a.mask),a.disableAll(),M.fog&&a.enable(0),M.useFog&&a.enable(1),M.flatShading&&a.enable(2),M.logarithmicDepthBuffer&&a.enable(3),M.skinning&&a.enable(4),M.morphTargets&&a.enable(5),M.morphNormals&&a.enable(6),M.morphColors&&a.enable(7),M.premultipliedAlpha&&a.enable(8),M.shadowMapEnabled&&a.enable(9),M.useLegacyLights&&a.enable(10),M.doubleSided&&a.enable(11),M.flipSided&&a.enable(12),M.useDepthPacking&&a.enable(13),M.dithering&&a.enable(14),M.transmission&&a.enable(15),M.sheen&&a.enable(16),M.opaque&&a.enable(17),M.pointsUvs&&a.enable(18),M.decodeVideoTexture&&a.enable(19),v.push(a.mask)}function w(v){const M=g[v.type];let I;if(M){const X=$t[M];I=wh.clone(X.uniforms)}else I=v.uniforms;return I}function L(v,M){let I;for(let X=0,J=c.length;X<J;X++){const D=c[X];if(D.cacheKey===M){I=D,++I.usedTimes;break}}return I===void 0&&(I=new ap(i,M,v,r),c.push(I)),I}function C(v){if(--v.usedTimes===0){const M=c.indexOf(v);c[M]=c[c.length-1],c.pop(),v.destroy()}}function T(v){l.remove(v)}function W(){l.dispose()}return{getParameters:m,getProgramCacheKey:f,getUniforms:w,acquireProgram:L,releaseProgram:C,releaseShaderCache:T,programs:c,dispose:W}}function up(){let i=new WeakMap;function e(r){let o=i.get(r);return o===void 0&&(o={},i.set(r,o)),o}function t(r){i.delete(r)}function n(r,o,a){i.get(r)[o]=a}function s(){i=new WeakMap}return{get:e,remove:t,update:n,dispose:s}}function fp(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function ja(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function qa(){const i=[];let e=0;const t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function o(u,d,p,g,x,m){let f=i[e];return f===void 0?(f={id:u.id,object:u,geometry:d,material:p,groupOrder:g,renderOrder:u.renderOrder,z:x,group:m},i[e]=f):(f.id=u.id,f.object=u,f.geometry=d,f.material=p,f.groupOrder=g,f.renderOrder=u.renderOrder,f.z=x,f.group=m),e++,f}function a(u,d,p,g,x,m){const f=o(u,d,p,g,x,m);p.transmission>0?n.push(f):p.transparent===!0?s.push(f):t.push(f)}function l(u,d,p,g,x,m){const f=o(u,d,p,g,x,m);p.transmission>0?n.unshift(f):p.transparent===!0?s.unshift(f):t.unshift(f)}function c(u,d){t.length>1&&t.sort(u||fp),n.length>1&&n.sort(d||ja),s.length>1&&s.sort(d||ja)}function h(){for(let u=e,d=i.length;u<d;u++){const p=i[u];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:a,unshift:l,finish:h,sort:c}}function pp(){let i=new WeakMap;function e(n,s){const r=i.get(n);let o;return r===void 0?(o=new qa,i.set(n,[o])):s>=r.length?(o=new qa,r.push(o)):o=r[s],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function mp(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new R,color:new Ue};break;case"SpotLight":t={position:new R,direction:new R,color:new Ue,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new R,color:new Ue,distance:0,decay:0};break;case"HemisphereLight":t={direction:new R,skyColor:new Ue,groundColor:new Ue};break;case"RectAreaLight":t={color:new Ue,position:new R,halfWidth:new R,halfHeight:new R};break}return i[e.id]=t,t}}}function gp(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new xe};break;case"SpotLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new xe};break;case"PointLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new xe,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let xp=0;function _p(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function vp(i,e){const t=new mp,n=gp(),s={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let h=0;h<9;h++)s.probe.push(new R);const r=new R,o=new et,a=new et;function l(h,u){let d=0,p=0,g=0;for(let X=0;X<9;X++)s.probe[X].set(0,0,0);let x=0,m=0,f=0,S=0,_=0,w=0,L=0,C=0,T=0,W=0,v=0;h.sort(_p);const M=u===!0?Math.PI:1;for(let X=0,J=h.length;X<J;X++){const D=h[X],U=D.color,k=D.intensity,K=D.distance,Y=D.shadow&&D.shadow.map?D.shadow.map.texture:null;if(D.isAmbientLight)d+=U.r*k*M,p+=U.g*k*M,g+=U.b*k*M;else if(D.isLightProbe){for(let $=0;$<9;$++)s.probe[$].addScaledVector(D.sh.coefficients[$],k);v++}else if(D.isDirectionalLight){const $=t.get(D);if($.color.copy(D.color).multiplyScalar(D.intensity*M),D.castShadow){const Z=D.shadow,ee=n.get(D);ee.shadowBias=Z.bias,ee.shadowNormalBias=Z.normalBias,ee.shadowRadius=Z.radius,ee.shadowMapSize=Z.mapSize,s.directionalShadow[x]=ee,s.directionalShadowMap[x]=Y,s.directionalShadowMatrix[x]=D.shadow.matrix,w++}s.directional[x]=$,x++}else if(D.isSpotLight){const $=t.get(D);$.position.setFromMatrixPosition(D.matrixWorld),$.color.copy(U).multiplyScalar(k*M),$.distance=K,$.coneCos=Math.cos(D.angle),$.penumbraCos=Math.cos(D.angle*(1-D.penumbra)),$.decay=D.decay,s.spot[f]=$;const Z=D.shadow;if(D.map&&(s.spotLightMap[T]=D.map,T++,Z.updateMatrices(D),D.castShadow&&W++),s.spotLightMatrix[f]=Z.matrix,D.castShadow){const ee=n.get(D);ee.shadowBias=Z.bias,ee.shadowNormalBias=Z.normalBias,ee.shadowRadius=Z.radius,ee.shadowMapSize=Z.mapSize,s.spotShadow[f]=ee,s.spotShadowMap[f]=Y,C++}f++}else if(D.isRectAreaLight){const $=t.get(D);$.color.copy(U).multiplyScalar(k),$.halfWidth.set(D.width*.5,0,0),$.halfHeight.set(0,D.height*.5,0),s.rectArea[S]=$,S++}else if(D.isPointLight){const $=t.get(D);if($.color.copy(D.color).multiplyScalar(D.intensity*M),$.distance=D.distance,$.decay=D.decay,D.castShadow){const Z=D.shadow,ee=n.get(D);ee.shadowBias=Z.bias,ee.shadowNormalBias=Z.normalBias,ee.shadowRadius=Z.radius,ee.shadowMapSize=Z.mapSize,ee.shadowCameraNear=Z.camera.near,ee.shadowCameraFar=Z.camera.far,s.pointShadow[m]=ee,s.pointShadowMap[m]=Y,s.pointShadowMatrix[m]=D.shadow.matrix,L++}s.point[m]=$,m++}else if(D.isHemisphereLight){const $=t.get(D);$.skyColor.copy(D.color).multiplyScalar(k*M),$.groundColor.copy(D.groundColor).multiplyScalar(k*M),s.hemi[_]=$,_++}}S>0&&(e.isWebGL2?i.has("OES_texture_float_linear")===!0?(s.rectAreaLTC1=ae.LTC_FLOAT_1,s.rectAreaLTC2=ae.LTC_FLOAT_2):(s.rectAreaLTC1=ae.LTC_HALF_1,s.rectAreaLTC2=ae.LTC_HALF_2):i.has("OES_texture_float_linear")===!0?(s.rectAreaLTC1=ae.LTC_FLOAT_1,s.rectAreaLTC2=ae.LTC_FLOAT_2):i.has("OES_texture_half_float_linear")===!0?(s.rectAreaLTC1=ae.LTC_HALF_1,s.rectAreaLTC2=ae.LTC_HALF_2):console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")),s.ambient[0]=d,s.ambient[1]=p,s.ambient[2]=g;const I=s.hash;(I.directionalLength!==x||I.pointLength!==m||I.spotLength!==f||I.rectAreaLength!==S||I.hemiLength!==_||I.numDirectionalShadows!==w||I.numPointShadows!==L||I.numSpotShadows!==C||I.numSpotMaps!==T||I.numLightProbes!==v)&&(s.directional.length=x,s.spot.length=f,s.rectArea.length=S,s.point.length=m,s.hemi.length=_,s.directionalShadow.length=w,s.directionalShadowMap.length=w,s.pointShadow.length=L,s.pointShadowMap.length=L,s.spotShadow.length=C,s.spotShadowMap.length=C,s.directionalShadowMatrix.length=w,s.pointShadowMatrix.length=L,s.spotLightMatrix.length=C+T-W,s.spotLightMap.length=T,s.numSpotLightShadowsWithMaps=W,s.numLightProbes=v,I.directionalLength=x,I.pointLength=m,I.spotLength=f,I.rectAreaLength=S,I.hemiLength=_,I.numDirectionalShadows=w,I.numPointShadows=L,I.numSpotShadows=C,I.numSpotMaps=T,I.numLightProbes=v,s.version=xp++)}function c(h,u){let d=0,p=0,g=0,x=0,m=0;const f=u.matrixWorldInverse;for(let S=0,_=h.length;S<_;S++){const w=h[S];if(w.isDirectionalLight){const L=s.directional[d];L.direction.setFromMatrixPosition(w.matrixWorld),r.setFromMatrixPosition(w.target.matrixWorld),L.direction.sub(r),L.direction.transformDirection(f),d++}else if(w.isSpotLight){const L=s.spot[g];L.position.setFromMatrixPosition(w.matrixWorld),L.position.applyMatrix4(f),L.direction.setFromMatrixPosition(w.matrixWorld),r.setFromMatrixPosition(w.target.matrixWorld),L.direction.sub(r),L.direction.transformDirection(f),g++}else if(w.isRectAreaLight){const L=s.rectArea[x];L.position.setFromMatrixPosition(w.matrixWorld),L.position.applyMatrix4(f),a.identity(),o.copy(w.matrixWorld),o.premultiply(f),a.extractRotation(o),L.halfWidth.set(w.width*.5,0,0),L.halfHeight.set(0,w.height*.5,0),L.halfWidth.applyMatrix4(a),L.halfHeight.applyMatrix4(a),x++}else if(w.isPointLight){const L=s.point[p];L.position.setFromMatrixPosition(w.matrixWorld),L.position.applyMatrix4(f),p++}else if(w.isHemisphereLight){const L=s.hemi[m];L.direction.setFromMatrixPosition(w.matrixWorld),L.direction.transformDirection(f),m++}}}return{setup:l,setupView:c,state:s}}function $a(i,e){const t=new vp(i,e),n=[],s=[];function r(){n.length=0,s.length=0}function o(u){n.push(u)}function a(u){s.push(u)}function l(u){t.setup(n,u)}function c(u){t.setupView(n,u)}return{init:r,state:{lightsArray:n,shadowsArray:s,lights:t},setupLights:l,setupLightsView:c,pushLight:o,pushShadow:a}}function yp(i,e){let t=new WeakMap;function n(r,o=0){const a=t.get(r);let l;return a===void 0?(l=new $a(i,e),t.set(r,[l])):o>=a.length?(l=new $a(i,e),a.push(l)):l=a[o],l}function s(){t=new WeakMap}return{get:n,dispose:s}}class Sp extends ai{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Bc,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class bp extends ai{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const Mp=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Ep=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function Tp(i,e,t){let n=new xr;const s=new xe,r=new xe,o=new ft,a=new Sp({depthPacking:kc}),l=new bp,c={},h=t.maxTextureSize,u={[cn]:Ct,[Ct]:cn,[Ft]:Ft},d=new Pn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new xe},radius:{value:4}},vertexShader:Mp,fragmentShader:Ep}),p=d.clone();p.defines.HORIZONTAL_PASS=1;const g=new St;g.setAttribute("position",new Je(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const x=new Rt(g,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Qr;let f=this.type;this.render=function(C,T,W){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||C.length===0)return;const v=i.getRenderTarget(),M=i.getActiveCubeFace(),I=i.getActiveMipmapLevel(),X=i.state;X.setBlending(hn),X.buffers.color.setClear(1,1,1,1),X.buffers.depth.setTest(!0),X.setScissorTest(!1);const J=f!==Kt&&this.type===Kt,D=f===Kt&&this.type!==Kt;for(let U=0,k=C.length;U<k;U++){const K=C[U],Y=K.shadow;if(Y===void 0){console.warn("THREE.WebGLShadowMap:",K,"has no shadow.");continue}if(Y.autoUpdate===!1&&Y.needsUpdate===!1)continue;s.copy(Y.mapSize);const $=Y.getFrameExtents();if(s.multiply($),r.copy(Y.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/$.x),s.x=r.x*$.x,Y.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/$.y),s.y=r.y*$.y,Y.mapSize.y=r.y)),Y.map===null||J===!0||D===!0){const ee=this.type!==Kt?{minFilter:Et,magFilter:Et}:{};Y.map!==null&&Y.map.dispose(),Y.map=new Tn(s.x,s.y,ee),Y.map.texture.name=K.name+".shadowMap",Y.camera.updateProjectionMatrix()}i.setRenderTarget(Y.map),i.clear();const Z=Y.getViewportCount();for(let ee=0;ee<Z;ee++){const z=Y.getViewport(ee);o.set(r.x*z.x,r.y*z.y,r.x*z.z,r.y*z.w),X.viewport(o),Y.updateMatrices(K,ee),n=Y.getFrustum(),w(T,W,Y.camera,K,this.type)}Y.isPointLightShadow!==!0&&this.type===Kt&&S(Y,W),Y.needsUpdate=!1}f=this.type,m.needsUpdate=!1,i.setRenderTarget(v,M,I)};function S(C,T){const W=e.update(x);d.defines.VSM_SAMPLES!==C.blurSamples&&(d.defines.VSM_SAMPLES=C.blurSamples,p.defines.VSM_SAMPLES=C.blurSamples,d.needsUpdate=!0,p.needsUpdate=!0),C.mapPass===null&&(C.mapPass=new Tn(s.x,s.y)),d.uniforms.shadow_pass.value=C.map.texture,d.uniforms.resolution.value=C.mapSize,d.uniforms.radius.value=C.radius,i.setRenderTarget(C.mapPass),i.clear(),i.renderBufferDirect(T,null,W,d,x,null),p.uniforms.shadow_pass.value=C.mapPass.texture,p.uniforms.resolution.value=C.mapSize,p.uniforms.radius.value=C.radius,i.setRenderTarget(C.map),i.clear(),i.renderBufferDirect(T,null,W,p,x,null)}function _(C,T,W,v){let M=null;const I=W.isPointLight===!0?C.customDistanceMaterial:C.customDepthMaterial;if(I!==void 0)M=I;else if(M=W.isPointLight===!0?l:a,i.localClippingEnabled&&T.clipShadows===!0&&Array.isArray(T.clippingPlanes)&&T.clippingPlanes.length!==0||T.displacementMap&&T.displacementScale!==0||T.alphaMap&&T.alphaTest>0||T.map&&T.alphaTest>0){const X=M.uuid,J=T.uuid;let D=c[X];D===void 0&&(D={},c[X]=D);let U=D[J];U===void 0&&(U=M.clone(),D[J]=U,T.addEventListener("dispose",L)),M=U}if(M.visible=T.visible,M.wireframe=T.wireframe,v===Kt?M.side=T.shadowSide!==null?T.shadowSide:T.side:M.side=T.shadowSide!==null?T.shadowSide:u[T.side],M.alphaMap=T.alphaMap,M.alphaTest=T.alphaTest,M.map=T.map,M.clipShadows=T.clipShadows,M.clippingPlanes=T.clippingPlanes,M.clipIntersection=T.clipIntersection,M.displacementMap=T.displacementMap,M.displacementScale=T.displacementScale,M.displacementBias=T.displacementBias,M.wireframeLinewidth=T.wireframeLinewidth,M.linewidth=T.linewidth,W.isPointLight===!0&&M.isMeshDistanceMaterial===!0){const X=i.properties.get(M);X.light=W}return M}function w(C,T,W,v,M){if(C.visible===!1)return;if(C.layers.test(T.layers)&&(C.isMesh||C.isLine||C.isPoints)&&(C.castShadow||C.receiveShadow&&M===Kt)&&(!C.frustumCulled||n.intersectsObject(C))){C.modelViewMatrix.multiplyMatrices(W.matrixWorldInverse,C.matrixWorld);const J=e.update(C),D=C.material;if(Array.isArray(D)){const U=J.groups;for(let k=0,K=U.length;k<K;k++){const Y=U[k],$=D[Y.materialIndex];if($&&$.visible){const Z=_(C,$,v,M);C.onBeforeShadow(i,C,T,W,J,Z,Y),i.renderBufferDirect(W,null,J,Z,C,Y),C.onAfterShadow(i,C,T,W,J,Z,Y)}}}else if(D.visible){const U=_(C,D,v,M);C.onBeforeShadow(i,C,T,W,J,U,null),i.renderBufferDirect(W,null,J,U,C,null),C.onAfterShadow(i,C,T,W,J,U,null)}}const X=C.children;for(let J=0,D=X.length;J<D;J++)w(X[J],T,W,v,M)}function L(C){C.target.removeEventListener("dispose",L);for(const W in c){const v=c[W],M=C.target.uuid;M in v&&(v[M].dispose(),delete v[M])}}}function wp(i,e,t){const n=t.isWebGL2;function s(){let P=!1;const re=new ft;let le=null;const Le=new ft(0,0,0,0);return{setMask:function(Ee){le!==Ee&&!P&&(i.colorMask(Ee,Ee,Ee,Ee),le=Ee)},setLocked:function(Ee){P=Ee},setClear:function(Ee,Xe,je,nt,st){st===!0&&(Ee*=nt,Xe*=nt,je*=nt),re.set(Ee,Xe,je,nt),Le.equals(re)===!1&&(i.clearColor(Ee,Xe,je,nt),Le.copy(re))},reset:function(){P=!1,le=null,Le.set(-1,0,0,0)}}}function r(){let P=!1,re=null,le=null,Le=null;return{setTest:function(Ee){Ee?we(i.DEPTH_TEST):ve(i.DEPTH_TEST)},setMask:function(Ee){re!==Ee&&!P&&(i.depthMask(Ee),re=Ee)},setFunc:function(Ee){if(le!==Ee){switch(Ee){case pc:i.depthFunc(i.NEVER);break;case mc:i.depthFunc(i.ALWAYS);break;case gc:i.depthFunc(i.LESS);break;case Vi:i.depthFunc(i.LEQUAL);break;case xc:i.depthFunc(i.EQUAL);break;case _c:i.depthFunc(i.GEQUAL);break;case vc:i.depthFunc(i.GREATER);break;case yc:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}le=Ee}},setLocked:function(Ee){P=Ee},setClear:function(Ee){Le!==Ee&&(i.clearDepth(Ee),Le=Ee)},reset:function(){P=!1,re=null,le=null,Le=null}}}function o(){let P=!1,re=null,le=null,Le=null,Ee=null,Xe=null,je=null,nt=null,st=null;return{setTest:function(qe){P||(qe?we(i.STENCIL_TEST):ve(i.STENCIL_TEST))},setMask:function(qe){re!==qe&&!P&&(i.stencilMask(qe),re=qe)},setFunc:function(qe,ct,Yt){(le!==qe||Le!==ct||Ee!==Yt)&&(i.stencilFunc(qe,ct,Yt),le=qe,Le=ct,Ee=Yt)},setOp:function(qe,ct,Yt){(Xe!==qe||je!==ct||nt!==Yt)&&(i.stencilOp(qe,ct,Yt),Xe=qe,je=ct,nt=Yt)},setLocked:function(qe){P=qe},setClear:function(qe){st!==qe&&(i.clearStencil(qe),st=qe)},reset:function(){P=!1,re=null,le=null,Le=null,Ee=null,Xe=null,je=null,nt=null,st=null}}}const a=new s,l=new r,c=new o,h=new WeakMap,u=new WeakMap;let d={},p={},g=new WeakMap,x=[],m=null,f=!1,S=null,_=null,w=null,L=null,C=null,T=null,W=null,v=new Ue(0,0,0),M=0,I=!1,X=null,J=null,D=null,U=null,k=null;const K=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let Y=!1,$=0;const Z=i.getParameter(i.VERSION);Z.indexOf("WebGL")!==-1?($=parseFloat(/^WebGL (\d)/.exec(Z)[1]),Y=$>=1):Z.indexOf("OpenGL ES")!==-1&&($=parseFloat(/^OpenGL ES (\d)/.exec(Z)[1]),Y=$>=2);let ee=null,z={};const O=i.getParameter(i.SCISSOR_BOX),Q=i.getParameter(i.VIEWPORT),oe=new ft().fromArray(O),ue=new ft().fromArray(Q);function he(P,re,le,Le){const Ee=new Uint8Array(4),Xe=i.createTexture();i.bindTexture(P,Xe),i.texParameteri(P,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(P,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let je=0;je<le;je++)n&&(P===i.TEXTURE_3D||P===i.TEXTURE_2D_ARRAY)?i.texImage3D(re,0,i.RGBA,1,1,Le,0,i.RGBA,i.UNSIGNED_BYTE,Ee):i.texImage2D(re+je,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Ee);return Xe}const Te={};Te[i.TEXTURE_2D]=he(i.TEXTURE_2D,i.TEXTURE_2D,1),Te[i.TEXTURE_CUBE_MAP]=he(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),n&&(Te[i.TEXTURE_2D_ARRAY]=he(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Te[i.TEXTURE_3D]=he(i.TEXTURE_3D,i.TEXTURE_3D,1,1)),a.setClear(0,0,0,1),l.setClear(1),c.setClear(0),we(i.DEPTH_TEST),l.setFunc(Vi),Ae(!1),E(Zr),we(i.CULL_FACE),_e(hn);function we(P){d[P]!==!0&&(i.enable(P),d[P]=!0)}function ve(P){d[P]!==!1&&(i.disable(P),d[P]=!1)}function ke(P,re){return p[P]!==re?(i.bindFramebuffer(P,re),p[P]=re,n&&(P===i.DRAW_FRAMEBUFFER&&(p[i.FRAMEBUFFER]=re),P===i.FRAMEBUFFER&&(p[i.DRAW_FRAMEBUFFER]=re)),!0):!1}function H(P,re){let le=x,Le=!1;if(P)if(le=g.get(re),le===void 0&&(le=[],g.set(re,le)),P.isWebGLMultipleRenderTargets){const Ee=P.texture;if(le.length!==Ee.length||le[0]!==i.COLOR_ATTACHMENT0){for(let Xe=0,je=Ee.length;Xe<je;Xe++)le[Xe]=i.COLOR_ATTACHMENT0+Xe;le.length=Ee.length,Le=!0}}else le[0]!==i.COLOR_ATTACHMENT0&&(le[0]=i.COLOR_ATTACHMENT0,Le=!0);else le[0]!==i.BACK&&(le[0]=i.BACK,Le=!0);Le&&(t.isWebGL2?i.drawBuffers(le):e.get("WEBGL_draw_buffers").drawBuffersWEBGL(le))}function lt(P){return m!==P?(i.useProgram(P),m=P,!0):!1}const Se={[yn]:i.FUNC_ADD,[Ql]:i.FUNC_SUBTRACT,[ec]:i.FUNC_REVERSE_SUBTRACT};if(n)Se[io]=i.MIN,Se[so]=i.MAX;else{const P=e.get("EXT_blend_minmax");P!==null&&(Se[io]=P.MIN_EXT,Se[so]=P.MAX_EXT)}const Re={[tc]:i.ZERO,[nc]:i.ONE,[ic]:i.SRC_COLOR,[Us]:i.SRC_ALPHA,[cc]:i.SRC_ALPHA_SATURATE,[ac]:i.DST_COLOR,[rc]:i.DST_ALPHA,[sc]:i.ONE_MINUS_SRC_COLOR,[Ns]:i.ONE_MINUS_SRC_ALPHA,[lc]:i.ONE_MINUS_DST_COLOR,[oc]:i.ONE_MINUS_DST_ALPHA,[hc]:i.CONSTANT_COLOR,[dc]:i.ONE_MINUS_CONSTANT_COLOR,[uc]:i.CONSTANT_ALPHA,[fc]:i.ONE_MINUS_CONSTANT_ALPHA};function _e(P,re,le,Le,Ee,Xe,je,nt,st,qe){if(P===hn){f===!0&&(ve(i.BLEND),f=!1);return}if(f===!1&&(we(i.BLEND),f=!0),P!==Zl){if(P!==S||qe!==I){if((_!==yn||C!==yn)&&(i.blendEquation(i.FUNC_ADD),_=yn,C=yn),qe)switch(P){case Xn:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case eo:i.blendFunc(i.ONE,i.ONE);break;case to:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case no:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",P);break}else switch(P){case Xn:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case eo:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case to:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case no:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",P);break}w=null,L=null,T=null,W=null,v.set(0,0,0),M=0,S=P,I=qe}return}Ee=Ee||re,Xe=Xe||le,je=je||Le,(re!==_||Ee!==C)&&(i.blendEquationSeparate(Se[re],Se[Ee]),_=re,C=Ee),(le!==w||Le!==L||Xe!==T||je!==W)&&(i.blendFuncSeparate(Re[le],Re[Le],Re[Xe],Re[je]),w=le,L=Le,T=Xe,W=je),(nt.equals(v)===!1||st!==M)&&(i.blendColor(nt.r,nt.g,nt.b,st),v.copy(nt),M=st),S=P,I=!1}function Ke(P,re){P.side===Ft?ve(i.CULL_FACE):we(i.CULL_FACE);let le=P.side===Ct;re&&(le=!le),Ae(le),P.blending===Xn&&P.transparent===!1?_e(hn):_e(P.blending,P.blendEquation,P.blendSrc,P.blendDst,P.blendEquationAlpha,P.blendSrcAlpha,P.blendDstAlpha,P.blendColor,P.blendAlpha,P.premultipliedAlpha),l.setFunc(P.depthFunc),l.setTest(P.depthTest),l.setMask(P.depthWrite),a.setMask(P.colorWrite);const Le=P.stencilWrite;c.setTest(Le),Le&&(c.setMask(P.stencilWriteMask),c.setFunc(P.stencilFunc,P.stencilRef,P.stencilFuncMask),c.setOp(P.stencilFail,P.stencilZFail,P.stencilZPass)),B(P.polygonOffset,P.polygonOffsetFactor,P.polygonOffsetUnits),P.alphaToCoverage===!0?we(i.SAMPLE_ALPHA_TO_COVERAGE):ve(i.SAMPLE_ALPHA_TO_COVERAGE)}function Ae(P){X!==P&&(P?i.frontFace(i.CW):i.frontFace(i.CCW),X=P)}function E(P){P!==Yl?(we(i.CULL_FACE),P!==J&&(P===Zr?i.cullFace(i.BACK):P===Kl?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):ve(i.CULL_FACE),J=P}function y(P){P!==D&&(Y&&i.lineWidth(P),D=P)}function B(P,re,le){P?(we(i.POLYGON_OFFSET_FILL),(U!==re||k!==le)&&(i.polygonOffset(re,le),U=re,k=le)):ve(i.POLYGON_OFFSET_FILL)}function te(P){P?we(i.SCISSOR_TEST):ve(i.SCISSOR_TEST)}function F(P){P===void 0&&(P=i.TEXTURE0+K-1),ee!==P&&(i.activeTexture(P),ee=P)}function q(P,re,le){le===void 0&&(ee===null?le=i.TEXTURE0+K-1:le=ee);let Le=z[le];Le===void 0&&(Le={type:void 0,texture:void 0},z[le]=Le),(Le.type!==P||Le.texture!==re)&&(ee!==le&&(i.activeTexture(le),ee=le),i.bindTexture(P,re||Te[P]),Le.type=P,Le.texture=re)}function ge(){const P=z[ee];P!==void 0&&P.type!==void 0&&(i.bindTexture(P.type,null),P.type=void 0,P.texture=void 0)}function ce(){try{i.compressedTexImage2D.apply(i,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function me(){try{i.compressedTexImage3D.apply(i,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function Ce(){try{i.texSubImage2D.apply(i,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function Oe(){try{i.texSubImage3D.apply(i,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function ne(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function $e(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function ze(){try{i.texStorage2D.apply(i,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function De(){try{i.texStorage3D.apply(i,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function Me(){try{i.texImage2D.apply(i,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function de(){try{i.texImage3D.apply(i,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function A(P){oe.equals(P)===!1&&(i.scissor(P.x,P.y,P.z,P.w),oe.copy(P))}function se(P){ue.equals(P)===!1&&(i.viewport(P.x,P.y,P.z,P.w),ue.copy(P))}function ye(P,re){let le=u.get(re);le===void 0&&(le=new WeakMap,u.set(re,le));let Le=le.get(P);Le===void 0&&(Le=i.getUniformBlockIndex(re,P.name),le.set(P,Le))}function pe(P,re){const Le=u.get(re).get(P);h.get(re)!==Le&&(i.uniformBlockBinding(re,Le,P.__bindingPointIndex),h.set(re,Le))}function ie(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),n===!0&&(i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null)),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),d={},ee=null,z={},p={},g=new WeakMap,x=[],m=null,f=!1,S=null,_=null,w=null,L=null,C=null,T=null,W=null,v=new Ue(0,0,0),M=0,I=!1,X=null,J=null,D=null,U=null,k=null,oe.set(0,0,i.canvas.width,i.canvas.height),ue.set(0,0,i.canvas.width,i.canvas.height),a.reset(),l.reset(),c.reset()}return{buffers:{color:a,depth:l,stencil:c},enable:we,disable:ve,bindFramebuffer:ke,drawBuffers:H,useProgram:lt,setBlending:_e,setMaterial:Ke,setFlipSided:Ae,setCullFace:E,setLineWidth:y,setPolygonOffset:B,setScissorTest:te,activeTexture:F,bindTexture:q,unbindTexture:ge,compressedTexImage2D:ce,compressedTexImage3D:me,texImage2D:Me,texImage3D:de,updateUBOMapping:ye,uniformBlockBinding:pe,texStorage2D:ze,texStorage3D:De,texSubImage2D:Ce,texSubImage3D:Oe,compressedTexSubImage2D:ne,compressedTexSubImage3D:$e,scissor:A,viewport:se,reset:ie}}function Ap(i,e,t,n,s,r,o){const a=s.isWebGL2,l=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),h=new WeakMap;let u;const d=new WeakMap;let p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(E,y){return p?new OffscreenCanvas(E,y):Ki("canvas")}function x(E,y,B,te){let F=1;if((E.width>te||E.height>te)&&(F=te/Math.max(E.width,E.height)),F<1||y===!0)if(typeof HTMLImageElement<"u"&&E instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&E instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&E instanceof ImageBitmap){const q=y?Yi:Math.floor,ge=q(F*E.width),ce=q(F*E.height);u===void 0&&(u=g(ge,ce));const me=B?g(ge,ce):u;return me.width=ge,me.height=ce,me.getContext("2d").drawImage(E,0,0,ge,ce),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+E.width+"x"+E.height+") to ("+ge+"x"+ce+")."),me}else return"data"in E&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+E.width+"x"+E.height+")."),E;return E}function m(E){return Js(E.width)&&Js(E.height)}function f(E){return a?!1:E.wrapS!==Vt||E.wrapT!==Vt||E.minFilter!==Et&&E.minFilter!==Bt}function S(E,y){return E.generateMipmaps&&y&&E.minFilter!==Et&&E.minFilter!==Bt}function _(E){i.generateMipmap(E)}function w(E,y,B,te,F=!1){if(a===!1)return y;if(E!==null){if(i[E]!==void 0)return i[E];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+E+"'")}let q=y;if(y===i.RED&&(B===i.FLOAT&&(q=i.R32F),B===i.HALF_FLOAT&&(q=i.R16F),B===i.UNSIGNED_BYTE&&(q=i.R8)),y===i.RED_INTEGER&&(B===i.UNSIGNED_BYTE&&(q=i.R8UI),B===i.UNSIGNED_SHORT&&(q=i.R16UI),B===i.UNSIGNED_INT&&(q=i.R32UI),B===i.BYTE&&(q=i.R8I),B===i.SHORT&&(q=i.R16I),B===i.INT&&(q=i.R32I)),y===i.RG&&(B===i.FLOAT&&(q=i.RG32F),B===i.HALF_FLOAT&&(q=i.RG16F),B===i.UNSIGNED_BYTE&&(q=i.RG8)),y===i.RGBA){const ge=F?Xi:Ye.getTransfer(te);B===i.FLOAT&&(q=i.RGBA32F),B===i.HALF_FLOAT&&(q=i.RGBA16F),B===i.UNSIGNED_BYTE&&(q=ge===Ze?i.SRGB8_ALPHA8:i.RGBA8),B===i.UNSIGNED_SHORT_4_4_4_4&&(q=i.RGBA4),B===i.UNSIGNED_SHORT_5_5_5_1&&(q=i.RGB5_A1)}return(q===i.R16F||q===i.R32F||q===i.RG16F||q===i.RG32F||q===i.RGBA16F||q===i.RGBA32F)&&e.get("EXT_color_buffer_float"),q}function L(E,y,B){return S(E,B)===!0||E.isFramebufferTexture&&E.minFilter!==Et&&E.minFilter!==Bt?Math.log2(Math.max(y.width,y.height))+1:E.mipmaps!==void 0&&E.mipmaps.length>0?E.mipmaps.length:E.isCompressedTexture&&Array.isArray(E.image)?y.mipmaps.length:1}function C(E){return E===Et||E===oo||E===Hs?i.NEAREST:i.LINEAR}function T(E){const y=E.target;y.removeEventListener("dispose",T),v(y),y.isVideoTexture&&h.delete(y)}function W(E){const y=E.target;y.removeEventListener("dispose",W),I(y)}function v(E){const y=n.get(E);if(y.__webglInit===void 0)return;const B=E.source,te=d.get(B);if(te){const F=te[y.__cacheKey];F.usedTimes--,F.usedTimes===0&&M(E),Object.keys(te).length===0&&d.delete(B)}n.remove(E)}function M(E){const y=n.get(E);i.deleteTexture(y.__webglTexture);const B=E.source,te=d.get(B);delete te[y.__cacheKey],o.memory.textures--}function I(E){const y=E.texture,B=n.get(E),te=n.get(y);if(te.__webglTexture!==void 0&&(i.deleteTexture(te.__webglTexture),o.memory.textures--),E.depthTexture&&E.depthTexture.dispose(),E.isWebGLCubeRenderTarget)for(let F=0;F<6;F++){if(Array.isArray(B.__webglFramebuffer[F]))for(let q=0;q<B.__webglFramebuffer[F].length;q++)i.deleteFramebuffer(B.__webglFramebuffer[F][q]);else i.deleteFramebuffer(B.__webglFramebuffer[F]);B.__webglDepthbuffer&&i.deleteRenderbuffer(B.__webglDepthbuffer[F])}else{if(Array.isArray(B.__webglFramebuffer))for(let F=0;F<B.__webglFramebuffer.length;F++)i.deleteFramebuffer(B.__webglFramebuffer[F]);else i.deleteFramebuffer(B.__webglFramebuffer);if(B.__webglDepthbuffer&&i.deleteRenderbuffer(B.__webglDepthbuffer),B.__webglMultisampledFramebuffer&&i.deleteFramebuffer(B.__webglMultisampledFramebuffer),B.__webglColorRenderbuffer)for(let F=0;F<B.__webglColorRenderbuffer.length;F++)B.__webglColorRenderbuffer[F]&&i.deleteRenderbuffer(B.__webglColorRenderbuffer[F]);B.__webglDepthRenderbuffer&&i.deleteRenderbuffer(B.__webglDepthRenderbuffer)}if(E.isWebGLMultipleRenderTargets)for(let F=0,q=y.length;F<q;F++){const ge=n.get(y[F]);ge.__webglTexture&&(i.deleteTexture(ge.__webglTexture),o.memory.textures--),n.remove(y[F])}n.remove(y),n.remove(E)}let X=0;function J(){X=0}function D(){const E=X;return E>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+E+" texture units while this GPU supports only "+s.maxTextures),X+=1,E}function U(E){const y=[];return y.push(E.wrapS),y.push(E.wrapT),y.push(E.wrapR||0),y.push(E.magFilter),y.push(E.minFilter),y.push(E.anisotropy),y.push(E.internalFormat),y.push(E.format),y.push(E.type),y.push(E.generateMipmaps),y.push(E.premultiplyAlpha),y.push(E.flipY),y.push(E.unpackAlignment),y.push(E.colorSpace),y.join()}function k(E,y){const B=n.get(E);if(E.isVideoTexture&&Ke(E),E.isRenderTargetTexture===!1&&E.version>0&&B.__version!==E.version){const te=E.image;if(te===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(te.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{oe(B,E,y);return}}t.bindTexture(i.TEXTURE_2D,B.__webglTexture,i.TEXTURE0+y)}function K(E,y){const B=n.get(E);if(E.version>0&&B.__version!==E.version){oe(B,E,y);return}t.bindTexture(i.TEXTURE_2D_ARRAY,B.__webglTexture,i.TEXTURE0+y)}function Y(E,y){const B=n.get(E);if(E.version>0&&B.__version!==E.version){oe(B,E,y);return}t.bindTexture(i.TEXTURE_3D,B.__webglTexture,i.TEXTURE0+y)}function $(E,y){const B=n.get(E);if(E.version>0&&B.__version!==E.version){ue(B,E,y);return}t.bindTexture(i.TEXTURE_CUBE_MAP,B.__webglTexture,i.TEXTURE0+y)}const Z={[ks]:i.REPEAT,[Vt]:i.CLAMP_TO_EDGE,[zs]:i.MIRRORED_REPEAT},ee={[Et]:i.NEAREST,[oo]:i.NEAREST_MIPMAP_NEAREST,[Hs]:i.NEAREST_MIPMAP_LINEAR,[Bt]:i.LINEAR,[Rc]:i.LINEAR_MIPMAP_NEAREST,[Ei]:i.LINEAR_MIPMAP_LINEAR},z={[Hc]:i.NEVER,[qc]:i.ALWAYS,[Vc]:i.LESS,[Go]:i.LEQUAL,[Gc]:i.EQUAL,[jc]:i.GEQUAL,[Wc]:i.GREATER,[Xc]:i.NOTEQUAL};function O(E,y,B){if(B?(i.texParameteri(E,i.TEXTURE_WRAP_S,Z[y.wrapS]),i.texParameteri(E,i.TEXTURE_WRAP_T,Z[y.wrapT]),(E===i.TEXTURE_3D||E===i.TEXTURE_2D_ARRAY)&&i.texParameteri(E,i.TEXTURE_WRAP_R,Z[y.wrapR]),i.texParameteri(E,i.TEXTURE_MAG_FILTER,ee[y.magFilter]),i.texParameteri(E,i.TEXTURE_MIN_FILTER,ee[y.minFilter])):(i.texParameteri(E,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(E,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE),(E===i.TEXTURE_3D||E===i.TEXTURE_2D_ARRAY)&&i.texParameteri(E,i.TEXTURE_WRAP_R,i.CLAMP_TO_EDGE),(y.wrapS!==Vt||y.wrapT!==Vt)&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."),i.texParameteri(E,i.TEXTURE_MAG_FILTER,C(y.magFilter)),i.texParameteri(E,i.TEXTURE_MIN_FILTER,C(y.minFilter)),y.minFilter!==Et&&y.minFilter!==Bt&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")),y.compareFunction&&(i.texParameteri(E,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(E,i.TEXTURE_COMPARE_FUNC,z[y.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){const te=e.get("EXT_texture_filter_anisotropic");if(y.magFilter===Et||y.minFilter!==Hs&&y.minFilter!==Ei||y.type===pn&&e.has("OES_texture_float_linear")===!1||a===!1&&y.type===Ti&&e.has("OES_texture_half_float_linear")===!1)return;(y.anisotropy>1||n.get(y).__currentAnisotropy)&&(i.texParameterf(E,te.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(y.anisotropy,s.getMaxAnisotropy())),n.get(y).__currentAnisotropy=y.anisotropy)}}function Q(E,y){let B=!1;E.__webglInit===void 0&&(E.__webglInit=!0,y.addEventListener("dispose",T));const te=y.source;let F=d.get(te);F===void 0&&(F={},d.set(te,F));const q=U(y);if(q!==E.__cacheKey){F[q]===void 0&&(F[q]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,B=!0),F[q].usedTimes++;const ge=F[E.__cacheKey];ge!==void 0&&(F[E.__cacheKey].usedTimes--,ge.usedTimes===0&&M(y)),E.__cacheKey=q,E.__webglTexture=F[q].texture}return B}function oe(E,y,B){let te=i.TEXTURE_2D;(y.isDataArrayTexture||y.isCompressedArrayTexture)&&(te=i.TEXTURE_2D_ARRAY),y.isData3DTexture&&(te=i.TEXTURE_3D);const F=Q(E,y),q=y.source;t.bindTexture(te,E.__webglTexture,i.TEXTURE0+B);const ge=n.get(q);if(q.version!==ge.__version||F===!0){t.activeTexture(i.TEXTURE0+B);const ce=Ye.getPrimaries(Ye.workingColorSpace),me=y.colorSpace===kt?null:Ye.getPrimaries(y.colorSpace),Ce=y.colorSpace===kt||ce===me?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,y.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,y.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ce);const Oe=f(y)&&m(y.image)===!1;let ne=x(y.image,Oe,!1,s.maxTextureSize);ne=Ae(y,ne);const $e=m(ne)||a,ze=r.convert(y.format,y.colorSpace);let De=r.convert(y.type),Me=w(y.internalFormat,ze,De,y.colorSpace,y.isVideoTexture);O(te,y,$e);let de;const A=y.mipmaps,se=a&&y.isVideoTexture!==!0&&Me!==_o,ye=ge.__version===void 0||F===!0,pe=L(y,ne,$e);if(y.isDepthTexture)Me=i.DEPTH_COMPONENT,a?y.type===pn?Me=i.DEPTH_COMPONENT32F:y.type===fn?Me=i.DEPTH_COMPONENT24:y.type===Sn?Me=i.DEPTH24_STENCIL8:Me=i.DEPTH_COMPONENT16:y.type===pn&&console.error("WebGLRenderer: Floating point depth texture requires WebGL2."),y.format===bn&&Me===i.DEPTH_COMPONENT&&y.type!==Vs&&y.type!==fn&&(console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."),y.type=fn,De=r.convert(y.type)),y.format===$n&&Me===i.DEPTH_COMPONENT&&(Me=i.DEPTH_STENCIL,y.type!==Sn&&(console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."),y.type=Sn,De=r.convert(y.type))),ye&&(se?t.texStorage2D(i.TEXTURE_2D,1,Me,ne.width,ne.height):t.texImage2D(i.TEXTURE_2D,0,Me,ne.width,ne.height,0,ze,De,null));else if(y.isDataTexture)if(A.length>0&&$e){se&&ye&&t.texStorage2D(i.TEXTURE_2D,pe,Me,A[0].width,A[0].height);for(let ie=0,P=A.length;ie<P;ie++)de=A[ie],se?t.texSubImage2D(i.TEXTURE_2D,ie,0,0,de.width,de.height,ze,De,de.data):t.texImage2D(i.TEXTURE_2D,ie,Me,de.width,de.height,0,ze,De,de.data);y.generateMipmaps=!1}else se?(ye&&t.texStorage2D(i.TEXTURE_2D,pe,Me,ne.width,ne.height),t.texSubImage2D(i.TEXTURE_2D,0,0,0,ne.width,ne.height,ze,De,ne.data)):t.texImage2D(i.TEXTURE_2D,0,Me,ne.width,ne.height,0,ze,De,ne.data);else if(y.isCompressedTexture)if(y.isCompressedArrayTexture){se&&ye&&t.texStorage3D(i.TEXTURE_2D_ARRAY,pe,Me,A[0].width,A[0].height,ne.depth);for(let ie=0,P=A.length;ie<P;ie++)de=A[ie],y.format!==Gt?ze!==null?se?t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ie,0,0,0,de.width,de.height,ne.depth,ze,de.data,0,0):t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,ie,Me,de.width,de.height,ne.depth,0,de.data,0,0):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):se?t.texSubImage3D(i.TEXTURE_2D_ARRAY,ie,0,0,0,de.width,de.height,ne.depth,ze,De,de.data):t.texImage3D(i.TEXTURE_2D_ARRAY,ie,Me,de.width,de.height,ne.depth,0,ze,De,de.data)}else{se&&ye&&t.texStorage2D(i.TEXTURE_2D,pe,Me,A[0].width,A[0].height);for(let ie=0,P=A.length;ie<P;ie++)de=A[ie],y.format!==Gt?ze!==null?se?t.compressedTexSubImage2D(i.TEXTURE_2D,ie,0,0,de.width,de.height,ze,de.data):t.compressedTexImage2D(i.TEXTURE_2D,ie,Me,de.width,de.height,0,de.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):se?t.texSubImage2D(i.TEXTURE_2D,ie,0,0,de.width,de.height,ze,De,de.data):t.texImage2D(i.TEXTURE_2D,ie,Me,de.width,de.height,0,ze,De,de.data)}else if(y.isDataArrayTexture)se?(ye&&t.texStorage3D(i.TEXTURE_2D_ARRAY,pe,Me,ne.width,ne.height,ne.depth),t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ne.width,ne.height,ne.depth,ze,De,ne.data)):t.texImage3D(i.TEXTURE_2D_ARRAY,0,Me,ne.width,ne.height,ne.depth,0,ze,De,ne.data);else if(y.isData3DTexture)se?(ye&&t.texStorage3D(i.TEXTURE_3D,pe,Me,ne.width,ne.height,ne.depth),t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ne.width,ne.height,ne.depth,ze,De,ne.data)):t.texImage3D(i.TEXTURE_3D,0,Me,ne.width,ne.height,ne.depth,0,ze,De,ne.data);else if(y.isFramebufferTexture){if(ye)if(se)t.texStorage2D(i.TEXTURE_2D,pe,Me,ne.width,ne.height);else{let ie=ne.width,P=ne.height;for(let re=0;re<pe;re++)t.texImage2D(i.TEXTURE_2D,re,Me,ie,P,0,ze,De,null),ie>>=1,P>>=1}}else if(A.length>0&&$e){se&&ye&&t.texStorage2D(i.TEXTURE_2D,pe,Me,A[0].width,A[0].height);for(let ie=0,P=A.length;ie<P;ie++)de=A[ie],se?t.texSubImage2D(i.TEXTURE_2D,ie,0,0,ze,De,de):t.texImage2D(i.TEXTURE_2D,ie,Me,ze,De,de);y.generateMipmaps=!1}else se?(ye&&t.texStorage2D(i.TEXTURE_2D,pe,Me,ne.width,ne.height),t.texSubImage2D(i.TEXTURE_2D,0,0,0,ze,De,ne)):t.texImage2D(i.TEXTURE_2D,0,Me,ze,De,ne);S(y,$e)&&_(te),ge.__version=q.version,y.onUpdate&&y.onUpdate(y)}E.__version=y.version}function ue(E,y,B){if(y.image.length!==6)return;const te=Q(E,y),F=y.source;t.bindTexture(i.TEXTURE_CUBE_MAP,E.__webglTexture,i.TEXTURE0+B);const q=n.get(F);if(F.version!==q.__version||te===!0){t.activeTexture(i.TEXTURE0+B);const ge=Ye.getPrimaries(Ye.workingColorSpace),ce=y.colorSpace===kt?null:Ye.getPrimaries(y.colorSpace),me=y.colorSpace===kt||ge===ce?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,y.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,y.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,me);const Ce=y.isCompressedTexture||y.image[0].isCompressedTexture,Oe=y.image[0]&&y.image[0].isDataTexture,ne=[];for(let ie=0;ie<6;ie++)!Ce&&!Oe?ne[ie]=x(y.image[ie],!1,!0,s.maxCubemapSize):ne[ie]=Oe?y.image[ie].image:y.image[ie],ne[ie]=Ae(y,ne[ie]);const $e=ne[0],ze=m($e)||a,De=r.convert(y.format,y.colorSpace),Me=r.convert(y.type),de=w(y.internalFormat,De,Me,y.colorSpace),A=a&&y.isVideoTexture!==!0,se=q.__version===void 0||te===!0;let ye=L(y,$e,ze);O(i.TEXTURE_CUBE_MAP,y,ze);let pe;if(Ce){A&&se&&t.texStorage2D(i.TEXTURE_CUBE_MAP,ye,de,$e.width,$e.height);for(let ie=0;ie<6;ie++){pe=ne[ie].mipmaps;for(let P=0;P<pe.length;P++){const re=pe[P];y.format!==Gt?De!==null?A?t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,P,0,0,re.width,re.height,De,re.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,P,de,re.width,re.height,0,re.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):A?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,P,0,0,re.width,re.height,De,Me,re.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,P,de,re.width,re.height,0,De,Me,re.data)}}}else{pe=y.mipmaps,A&&se&&(pe.length>0&&ye++,t.texStorage2D(i.TEXTURE_CUBE_MAP,ye,de,ne[0].width,ne[0].height));for(let ie=0;ie<6;ie++)if(Oe){A?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,0,0,ne[ie].width,ne[ie].height,De,Me,ne[ie].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,de,ne[ie].width,ne[ie].height,0,De,Me,ne[ie].data);for(let P=0;P<pe.length;P++){const le=pe[P].image[ie].image;A?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,P+1,0,0,le.width,le.height,De,Me,le.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,P+1,de,le.width,le.height,0,De,Me,le.data)}}else{A?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,0,0,De,Me,ne[ie]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,de,De,Me,ne[ie]);for(let P=0;P<pe.length;P++){const re=pe[P];A?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,P+1,0,0,De,Me,re.image[ie]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,P+1,de,De,Me,re.image[ie])}}}S(y,ze)&&_(i.TEXTURE_CUBE_MAP),q.__version=F.version,y.onUpdate&&y.onUpdate(y)}E.__version=y.version}function he(E,y,B,te,F,q){const ge=r.convert(B.format,B.colorSpace),ce=r.convert(B.type),me=w(B.internalFormat,ge,ce,B.colorSpace);if(!n.get(y).__hasExternalTextures){const Oe=Math.max(1,y.width>>q),ne=Math.max(1,y.height>>q);F===i.TEXTURE_3D||F===i.TEXTURE_2D_ARRAY?t.texImage3D(F,q,me,Oe,ne,y.depth,0,ge,ce,null):t.texImage2D(F,q,me,Oe,ne,0,ge,ce,null)}t.bindFramebuffer(i.FRAMEBUFFER,E),_e(y)?l.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,te,F,n.get(B).__webglTexture,0,Re(y)):(F===i.TEXTURE_2D||F>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&F<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,te,F,n.get(B).__webglTexture,q),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Te(E,y,B){if(i.bindRenderbuffer(i.RENDERBUFFER,E),y.depthBuffer&&!y.stencilBuffer){let te=a===!0?i.DEPTH_COMPONENT24:i.DEPTH_COMPONENT16;if(B||_e(y)){const F=y.depthTexture;F&&F.isDepthTexture&&(F.type===pn?te=i.DEPTH_COMPONENT32F:F.type===fn&&(te=i.DEPTH_COMPONENT24));const q=Re(y);_e(y)?l.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,q,te,y.width,y.height):i.renderbufferStorageMultisample(i.RENDERBUFFER,q,te,y.width,y.height)}else i.renderbufferStorage(i.RENDERBUFFER,te,y.width,y.height);i.framebufferRenderbuffer(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.RENDERBUFFER,E)}else if(y.depthBuffer&&y.stencilBuffer){const te=Re(y);B&&_e(y)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,te,i.DEPTH24_STENCIL8,y.width,y.height):_e(y)?l.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,te,i.DEPTH24_STENCIL8,y.width,y.height):i.renderbufferStorage(i.RENDERBUFFER,i.DEPTH_STENCIL,y.width,y.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.RENDERBUFFER,E)}else{const te=y.isWebGLMultipleRenderTargets===!0?y.texture:[y.texture];for(let F=0;F<te.length;F++){const q=te[F],ge=r.convert(q.format,q.colorSpace),ce=r.convert(q.type),me=w(q.internalFormat,ge,ce,q.colorSpace),Ce=Re(y);B&&_e(y)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Ce,me,y.width,y.height):_e(y)?l.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Ce,me,y.width,y.height):i.renderbufferStorage(i.RENDERBUFFER,me,y.width,y.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function we(E,y){if(y&&y.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,E),!(y.depthTexture&&y.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!n.get(y.depthTexture).__webglTexture||y.depthTexture.image.width!==y.width||y.depthTexture.image.height!==y.height)&&(y.depthTexture.image.width=y.width,y.depthTexture.image.height=y.height,y.depthTexture.needsUpdate=!0),k(y.depthTexture,0);const te=n.get(y.depthTexture).__webglTexture,F=Re(y);if(y.depthTexture.format===bn)_e(y)?l.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,te,0,F):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,te,0);else if(y.depthTexture.format===$n)_e(y)?l.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,te,0,F):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,te,0);else throw new Error("Unknown depthTexture format")}function ve(E){const y=n.get(E),B=E.isWebGLCubeRenderTarget===!0;if(E.depthTexture&&!y.__autoAllocateDepthBuffer){if(B)throw new Error("target.depthTexture not supported in Cube render targets");we(y.__webglFramebuffer,E)}else if(B){y.__webglDepthbuffer=[];for(let te=0;te<6;te++)t.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer[te]),y.__webglDepthbuffer[te]=i.createRenderbuffer(),Te(y.__webglDepthbuffer[te],E,!1)}else t.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer),y.__webglDepthbuffer=i.createRenderbuffer(),Te(y.__webglDepthbuffer,E,!1);t.bindFramebuffer(i.FRAMEBUFFER,null)}function ke(E,y,B){const te=n.get(E);y!==void 0&&he(te.__webglFramebuffer,E,E.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),B!==void 0&&ve(E)}function H(E){const y=E.texture,B=n.get(E),te=n.get(y);E.addEventListener("dispose",W),E.isWebGLMultipleRenderTargets!==!0&&(te.__webglTexture===void 0&&(te.__webglTexture=i.createTexture()),te.__version=y.version,o.memory.textures++);const F=E.isWebGLCubeRenderTarget===!0,q=E.isWebGLMultipleRenderTargets===!0,ge=m(E)||a;if(F){B.__webglFramebuffer=[];for(let ce=0;ce<6;ce++)if(a&&y.mipmaps&&y.mipmaps.length>0){B.__webglFramebuffer[ce]=[];for(let me=0;me<y.mipmaps.length;me++)B.__webglFramebuffer[ce][me]=i.createFramebuffer()}else B.__webglFramebuffer[ce]=i.createFramebuffer()}else{if(a&&y.mipmaps&&y.mipmaps.length>0){B.__webglFramebuffer=[];for(let ce=0;ce<y.mipmaps.length;ce++)B.__webglFramebuffer[ce]=i.createFramebuffer()}else B.__webglFramebuffer=i.createFramebuffer();if(q)if(s.drawBuffers){const ce=E.texture;for(let me=0,Ce=ce.length;me<Ce;me++){const Oe=n.get(ce[me]);Oe.__webglTexture===void 0&&(Oe.__webglTexture=i.createTexture(),o.memory.textures++)}}else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");if(a&&E.samples>0&&_e(E)===!1){const ce=q?y:[y];B.__webglMultisampledFramebuffer=i.createFramebuffer(),B.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let me=0;me<ce.length;me++){const Ce=ce[me];B.__webglColorRenderbuffer[me]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,B.__webglColorRenderbuffer[me]);const Oe=r.convert(Ce.format,Ce.colorSpace),ne=r.convert(Ce.type),$e=w(Ce.internalFormat,Oe,ne,Ce.colorSpace,E.isXRRenderTarget===!0),ze=Re(E);i.renderbufferStorageMultisample(i.RENDERBUFFER,ze,$e,E.width,E.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+me,i.RENDERBUFFER,B.__webglColorRenderbuffer[me])}i.bindRenderbuffer(i.RENDERBUFFER,null),E.depthBuffer&&(B.__webglDepthRenderbuffer=i.createRenderbuffer(),Te(B.__webglDepthRenderbuffer,E,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(F){t.bindTexture(i.TEXTURE_CUBE_MAP,te.__webglTexture),O(i.TEXTURE_CUBE_MAP,y,ge);for(let ce=0;ce<6;ce++)if(a&&y.mipmaps&&y.mipmaps.length>0)for(let me=0;me<y.mipmaps.length;me++)he(B.__webglFramebuffer[ce][me],E,y,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,me);else he(B.__webglFramebuffer[ce],E,y,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,0);S(y,ge)&&_(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(q){const ce=E.texture;for(let me=0,Ce=ce.length;me<Ce;me++){const Oe=ce[me],ne=n.get(Oe);t.bindTexture(i.TEXTURE_2D,ne.__webglTexture),O(i.TEXTURE_2D,Oe,ge),he(B.__webglFramebuffer,E,Oe,i.COLOR_ATTACHMENT0+me,i.TEXTURE_2D,0),S(Oe,ge)&&_(i.TEXTURE_2D)}t.unbindTexture()}else{let ce=i.TEXTURE_2D;if((E.isWebGL3DRenderTarget||E.isWebGLArrayRenderTarget)&&(a?ce=E.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY:console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")),t.bindTexture(ce,te.__webglTexture),O(ce,y,ge),a&&y.mipmaps&&y.mipmaps.length>0)for(let me=0;me<y.mipmaps.length;me++)he(B.__webglFramebuffer[me],E,y,i.COLOR_ATTACHMENT0,ce,me);else he(B.__webglFramebuffer,E,y,i.COLOR_ATTACHMENT0,ce,0);S(y,ge)&&_(ce),t.unbindTexture()}E.depthBuffer&&ve(E)}function lt(E){const y=m(E)||a,B=E.isWebGLMultipleRenderTargets===!0?E.texture:[E.texture];for(let te=0,F=B.length;te<F;te++){const q=B[te];if(S(q,y)){const ge=E.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:i.TEXTURE_2D,ce=n.get(q).__webglTexture;t.bindTexture(ge,ce),_(ge),t.unbindTexture()}}}function Se(E){if(a&&E.samples>0&&_e(E)===!1){const y=E.isWebGLMultipleRenderTargets?E.texture:[E.texture],B=E.width,te=E.height;let F=i.COLOR_BUFFER_BIT;const q=[],ge=E.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ce=n.get(E),me=E.isWebGLMultipleRenderTargets===!0;if(me)for(let Ce=0;Ce<y.length;Ce++)t.bindFramebuffer(i.FRAMEBUFFER,ce.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ce,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,ce.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ce,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,ce.__webglMultisampledFramebuffer),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ce.__webglFramebuffer);for(let Ce=0;Ce<y.length;Ce++){q.push(i.COLOR_ATTACHMENT0+Ce),E.depthBuffer&&q.push(ge);const Oe=ce.__ignoreDepthValues!==void 0?ce.__ignoreDepthValues:!1;if(Oe===!1&&(E.depthBuffer&&(F|=i.DEPTH_BUFFER_BIT),E.stencilBuffer&&(F|=i.STENCIL_BUFFER_BIT)),me&&i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,ce.__webglColorRenderbuffer[Ce]),Oe===!0&&(i.invalidateFramebuffer(i.READ_FRAMEBUFFER,[ge]),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[ge])),me){const ne=n.get(y[Ce]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,ne,0)}i.blitFramebuffer(0,0,B,te,0,0,B,te,F,i.NEAREST),c&&i.invalidateFramebuffer(i.READ_FRAMEBUFFER,q)}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),me)for(let Ce=0;Ce<y.length;Ce++){t.bindFramebuffer(i.FRAMEBUFFER,ce.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ce,i.RENDERBUFFER,ce.__webglColorRenderbuffer[Ce]);const Oe=n.get(y[Ce]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,ce.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ce,i.TEXTURE_2D,Oe,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ce.__webglMultisampledFramebuffer)}}function Re(E){return Math.min(s.maxSamples,E.samples)}function _e(E){const y=n.get(E);return a&&E.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&y.__useRenderToTexture!==!1}function Ke(E){const y=o.render.frame;h.get(E)!==y&&(h.set(E,y),E.update())}function Ae(E,y){const B=E.colorSpace,te=E.format,F=E.type;return E.isCompressedTexture===!0||E.isVideoTexture===!0||E.format===Ys||B!==Jt&&B!==kt&&(Ye.getTransfer(B)===Ze?a===!1?e.has("EXT_sRGB")===!0&&te===Gt?(E.format=Ys,E.minFilter=Bt,E.generateMipmaps=!1):y=Jo.sRGBToLinear(y):(te!==Gt||F!==un)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",B)),y}this.allocateTextureUnit=D,this.resetTextureUnits=J,this.setTexture2D=k,this.setTexture2DArray=K,this.setTexture3D=Y,this.setTextureCube=$,this.rebindTextures=ke,this.setupRenderTarget=H,this.updateRenderTargetMipmap=lt,this.updateMultisampleRenderTarget=Se,this.setupDepthRenderbuffer=ve,this.setupFrameBufferTexture=he,this.useMultisampledRTT=_e}function Cp(i,e,t){const n=t.isWebGL2;function s(r,o=kt){let a;const l=Ye.getTransfer(o);if(r===un)return i.UNSIGNED_BYTE;if(r===lo)return i.UNSIGNED_SHORT_4_4_4_4;if(r===co)return i.UNSIGNED_SHORT_5_5_5_1;if(r===Lc)return i.BYTE;if(r===Pc)return i.SHORT;if(r===Vs)return i.UNSIGNED_SHORT;if(r===ao)return i.INT;if(r===fn)return i.UNSIGNED_INT;if(r===pn)return i.FLOAT;if(r===Ti)return n?i.HALF_FLOAT:(a=e.get("OES_texture_half_float"),a!==null?a.HALF_FLOAT_OES:null);if(r===Dc)return i.ALPHA;if(r===Gt)return i.RGBA;if(r===Ic)return i.LUMINANCE;if(r===Uc)return i.LUMINANCE_ALPHA;if(r===bn)return i.DEPTH_COMPONENT;if(r===$n)return i.DEPTH_STENCIL;if(r===Ys)return a=e.get("EXT_sRGB"),a!==null?a.SRGB_ALPHA_EXT:null;if(r===Nc)return i.RED;if(r===ho)return i.RED_INTEGER;if(r===Oc)return i.RG;if(r===uo)return i.RG_INTEGER;if(r===fo)return i.RGBA_INTEGER;if(r===Gs||r===Ws||r===Xs||r===js)if(l===Ze)if(a=e.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(r===Gs)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(r===Ws)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(r===Xs)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(r===js)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=e.get("WEBGL_compressed_texture_s3tc"),a!==null){if(r===Gs)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(r===Ws)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(r===Xs)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(r===js)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(r===po||r===mo||r===go||r===xo)if(a=e.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(r===po)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(r===mo)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(r===go)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(r===xo)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(r===_o)return a=e.get("WEBGL_compressed_texture_etc1"),a!==null?a.COMPRESSED_RGB_ETC1_WEBGL:null;if(r===vo||r===yo)if(a=e.get("WEBGL_compressed_texture_etc"),a!==null){if(r===vo)return l===Ze?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(r===yo)return l===Ze?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(r===So||r===bo||r===Mo||r===Eo||r===To||r===wo||r===Ao||r===Co||r===Ro||r===Lo||r===Po||r===Do||r===Io||r===Uo)if(a=e.get("WEBGL_compressed_texture_astc"),a!==null){if(r===So)return l===Ze?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(r===bo)return l===Ze?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(r===Mo)return l===Ze?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(r===Eo)return l===Ze?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(r===To)return l===Ze?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(r===wo)return l===Ze?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(r===Ao)return l===Ze?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(r===Co)return l===Ze?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(r===Ro)return l===Ze?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(r===Lo)return l===Ze?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(r===Po)return l===Ze?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(r===Do)return l===Ze?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(r===Io)return l===Ze?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(r===Uo)return l===Ze?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(r===qs||r===No||r===Oo)if(a=e.get("EXT_texture_compression_bptc"),a!==null){if(r===qs)return l===Ze?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(r===No)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(r===Oo)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(r===Fc||r===Fo||r===Bo||r===ko)if(a=e.get("EXT_texture_compression_rgtc"),a!==null){if(r===qs)return a.COMPRESSED_RED_RGTC1_EXT;if(r===Fo)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(r===Bo)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(r===ko)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return r===Sn?n?i.UNSIGNED_INT_24_8:(a=e.get("WEBGL_depth_texture"),a!==null?a.UNSIGNED_INT_24_8_WEBGL:null):i[r]!==void 0?i[r]:null}return{convert:s}}class Rp extends Lt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class Nn extends pt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Lp={type:"move"};class wr{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Nn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Nn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new R,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new R),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Nn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new R,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new R),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(const x of e.hand.values()){const m=t.getJointPose(x,n),f=this._getHandJoint(c,x);m!==null&&(f.matrix.fromArray(m.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=m.radius),f.visible=m!==null}const h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),p=.02,g=.005;c.inputState.pinching&&d>p+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=p-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Lp)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new Nn;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}class Pp extends En{constructor(e,t){super();const n=this;let s=null,r=1,o=null,a="local-floor",l=1,c=null,h=null,u=null,d=null,p=null,g=null;const x=t.getContextAttributes();let m=null,f=null;const S=[],_=[],w=new xe;let L=null;const C=new Lt;C.layers.enable(1),C.viewport=new ft;const T=new Lt;T.layers.enable(2),T.viewport=new ft;const W=[C,T],v=new Rp;v.layers.enable(1),v.layers.enable(2);let M=null,I=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(O){let Q=S[O];return Q===void 0&&(Q=new wr,S[O]=Q),Q.getTargetRaySpace()},this.getControllerGrip=function(O){let Q=S[O];return Q===void 0&&(Q=new wr,S[O]=Q),Q.getGripSpace()},this.getHand=function(O){let Q=S[O];return Q===void 0&&(Q=new wr,S[O]=Q),Q.getHandSpace()};function X(O){const Q=_.indexOf(O.inputSource);if(Q===-1)return;const oe=S[Q];oe!==void 0&&(oe.update(O.inputSource,O.frame,c||o),oe.dispatchEvent({type:O.type,data:O.inputSource}))}function J(){s.removeEventListener("select",X),s.removeEventListener("selectstart",X),s.removeEventListener("selectend",X),s.removeEventListener("squeeze",X),s.removeEventListener("squeezestart",X),s.removeEventListener("squeezeend",X),s.removeEventListener("end",J),s.removeEventListener("inputsourceschange",D);for(let O=0;O<S.length;O++){const Q=_[O];Q!==null&&(_[O]=null,S[O].disconnect(Q))}M=null,I=null,e.setRenderTarget(m),p=null,d=null,u=null,s=null,f=null,z.stop(),n.isPresenting=!1,e.setPixelRatio(L),e.setSize(w.width,w.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(O){r=O,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(O){a=O,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(O){c=O},this.getBaseLayer=function(){return d!==null?d:p},this.getBinding=function(){return u},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(O){if(s=O,s!==null){if(m=e.getRenderTarget(),s.addEventListener("select",X),s.addEventListener("selectstart",X),s.addEventListener("selectend",X),s.addEventListener("squeeze",X),s.addEventListener("squeezestart",X),s.addEventListener("squeezeend",X),s.addEventListener("end",J),s.addEventListener("inputsourceschange",D),x.xrCompatible!==!0&&await t.makeXRCompatible(),L=e.getPixelRatio(),e.getSize(w),s.renderState.layers===void 0||e.capabilities.isWebGL2===!1){const Q={antialias:s.renderState.layers===void 0?x.antialias:!0,alpha:!0,depth:x.depth,stencil:x.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,t,Q),s.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),f=new Tn(p.framebufferWidth,p.framebufferHeight,{format:Gt,type:un,colorSpace:e.outputColorSpace,stencilBuffer:x.stencil})}else{let Q=null,oe=null,ue=null;x.depth&&(ue=x.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Q=x.stencil?$n:bn,oe=x.stencil?Sn:fn);const he={colorFormat:t.RGBA8,depthFormat:ue,scaleFactor:r};u=new XRWebGLBinding(s,t),d=u.createProjectionLayer(he),s.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),f=new Tn(d.textureWidth,d.textureHeight,{format:Gt,type:un,depthTexture:new Ca(d.textureWidth,d.textureHeight,oe,void 0,void 0,void 0,void 0,void 0,void 0,Q),stencilBuffer:x.stencil,colorSpace:e.outputColorSpace,samples:x.antialias?4:0});const Te=e.properties.get(f);Te.__ignoreDepthValues=d.ignoreDepthValues}f.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),z.setContext(s),z.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode};function D(O){for(let Q=0;Q<O.removed.length;Q++){const oe=O.removed[Q],ue=_.indexOf(oe);ue>=0&&(_[ue]=null,S[ue].disconnect(oe))}for(let Q=0;Q<O.added.length;Q++){const oe=O.added[Q];let ue=_.indexOf(oe);if(ue===-1){for(let Te=0;Te<S.length;Te++)if(Te>=_.length){_.push(oe),ue=Te;break}else if(_[Te]===null){_[Te]=oe,ue=Te;break}if(ue===-1)break}const he=S[ue];he&&he.connect(oe)}}const U=new R,k=new R;function K(O,Q,oe){U.setFromMatrixPosition(Q.matrixWorld),k.setFromMatrixPosition(oe.matrixWorld);const ue=U.distanceTo(k),he=Q.projectionMatrix.elements,Te=oe.projectionMatrix.elements,we=he[14]/(he[10]-1),ve=he[14]/(he[10]+1),ke=(he[9]+1)/he[5],H=(he[9]-1)/he[5],lt=(he[8]-1)/he[0],Se=(Te[8]+1)/Te[0],Re=we*lt,_e=we*Se,Ke=ue/(-lt+Se),Ae=Ke*-lt;Q.matrixWorld.decompose(O.position,O.quaternion,O.scale),O.translateX(Ae),O.translateZ(Ke),O.matrixWorld.compose(O.position,O.quaternion,O.scale),O.matrixWorldInverse.copy(O.matrixWorld).invert();const E=we+Ke,y=ve+Ke,B=Re-Ae,te=_e+(ue-Ae),F=ke*ve/y*E,q=H*ve/y*E;O.projectionMatrix.makePerspective(B,te,F,q,E,y),O.projectionMatrixInverse.copy(O.projectionMatrix).invert()}function Y(O,Q){Q===null?O.matrixWorld.copy(O.matrix):O.matrixWorld.multiplyMatrices(Q.matrixWorld,O.matrix),O.matrixWorldInverse.copy(O.matrixWorld).invert()}this.updateCamera=function(O){if(s===null)return;v.near=T.near=C.near=O.near,v.far=T.far=C.far=O.far,(M!==v.near||I!==v.far)&&(s.updateRenderState({depthNear:v.near,depthFar:v.far}),M=v.near,I=v.far);const Q=O.parent,oe=v.cameras;Y(v,Q);for(let ue=0;ue<oe.length;ue++)Y(oe[ue],Q);oe.length===2?K(v,C,T):v.projectionMatrix.copy(C.projectionMatrix),$(O,v,Q)};function $(O,Q,oe){oe===null?O.matrix.copy(Q.matrixWorld):(O.matrix.copy(oe.matrixWorld),O.matrix.invert(),O.matrix.multiply(Q.matrixWorld)),O.matrix.decompose(O.position,O.quaternion,O.scale),O.updateMatrixWorld(!0),O.projectionMatrix.copy(Q.projectionMatrix),O.projectionMatrixInverse.copy(Q.projectionMatrixInverse),O.isPerspectiveCamera&&(O.fov=Ai*2*Math.atan(1/O.projectionMatrix.elements[5]),O.zoom=1)}this.getCamera=function(){return v},this.getFoveation=function(){if(!(d===null&&p===null))return l},this.setFoveation=function(O){l=O,d!==null&&(d.fixedFoveation=O),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=O)};let Z=null;function ee(O,Q){if(h=Q.getViewerPose(c||o),g=Q,h!==null){const oe=h.views;p!==null&&(e.setRenderTargetFramebuffer(f,p.framebuffer),e.setRenderTarget(f));let ue=!1;oe.length!==v.cameras.length&&(v.cameras.length=0,ue=!0);for(let he=0;he<oe.length;he++){const Te=oe[he];let we=null;if(p!==null)we=p.getViewport(Te);else{const ke=u.getViewSubImage(d,Te);we=ke.viewport,he===0&&(e.setRenderTargetTextures(f,ke.colorTexture,d.ignoreDepthValues?void 0:ke.depthStencilTexture),e.setRenderTarget(f))}let ve=W[he];ve===void 0&&(ve=new Lt,ve.layers.enable(he),ve.viewport=new ft,W[he]=ve),ve.matrix.fromArray(Te.transform.matrix),ve.matrix.decompose(ve.position,ve.quaternion,ve.scale),ve.projectionMatrix.fromArray(Te.projectionMatrix),ve.projectionMatrixInverse.copy(ve.projectionMatrix).invert(),ve.viewport.set(we.x,we.y,we.width,we.height),he===0&&(v.matrix.copy(ve.matrix),v.matrix.decompose(v.position,v.quaternion,v.scale)),ue===!0&&v.cameras.push(ve)}}for(let oe=0;oe<S.length;oe++){const ue=_[oe],he=S[oe];ue!==null&&he!==void 0&&he.update(ue,Q,c||o)}Z&&Z(O,Q),Q.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:Q}),g=null}const z=new ya;z.setAnimationLoop(ee),this.setAnimationLoop=function(O){Z=O},this.dispose=function(){}}}function Dp(i,e){function t(m,f){m.matrixAutoUpdate===!0&&m.updateMatrix(),f.value.copy(m.matrix)}function n(m,f){f.color.getRGB(m.fogColor.value,xa(i)),f.isFog?(m.fogNear.value=f.near,m.fogFar.value=f.far):f.isFogExp2&&(m.fogDensity.value=f.density)}function s(m,f,S,_,w){f.isMeshBasicMaterial||f.isMeshLambertMaterial?r(m,f):f.isMeshToonMaterial?(r(m,f),u(m,f)):f.isMeshPhongMaterial?(r(m,f),h(m,f)):f.isMeshStandardMaterial?(r(m,f),d(m,f),f.isMeshPhysicalMaterial&&p(m,f,w)):f.isMeshMatcapMaterial?(r(m,f),g(m,f)):f.isMeshDepthMaterial?r(m,f):f.isMeshDistanceMaterial?(r(m,f),x(m,f)):f.isMeshNormalMaterial?r(m,f):f.isLineBasicMaterial?(o(m,f),f.isLineDashedMaterial&&a(m,f)):f.isPointsMaterial?l(m,f,S,_):f.isSpriteMaterial?c(m,f):f.isShadowMaterial?(m.color.value.copy(f.color),m.opacity.value=f.opacity):f.isShaderMaterial&&(f.uniformsNeedUpdate=!1)}function r(m,f){m.opacity.value=f.opacity,f.color&&m.diffuse.value.copy(f.color),f.emissive&&m.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity),f.map&&(m.map.value=f.map,t(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.bumpMap&&(m.bumpMap.value=f.bumpMap,t(f.bumpMap,m.bumpMapTransform),m.bumpScale.value=f.bumpScale,f.side===Ct&&(m.bumpScale.value*=-1)),f.normalMap&&(m.normalMap.value=f.normalMap,t(f.normalMap,m.normalMapTransform),m.normalScale.value.copy(f.normalScale),f.side===Ct&&m.normalScale.value.negate()),f.displacementMap&&(m.displacementMap.value=f.displacementMap,t(f.displacementMap,m.displacementMapTransform),m.displacementScale.value=f.displacementScale,m.displacementBias.value=f.displacementBias),f.emissiveMap&&(m.emissiveMap.value=f.emissiveMap,t(f.emissiveMap,m.emissiveMapTransform)),f.specularMap&&(m.specularMap.value=f.specularMap,t(f.specularMap,m.specularMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest);const S=e.get(f).envMap;if(S&&(m.envMap.value=S,m.flipEnvMap.value=S.isCubeTexture&&S.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=f.reflectivity,m.ior.value=f.ior,m.refractionRatio.value=f.refractionRatio),f.lightMap){m.lightMap.value=f.lightMap;const _=i._useLegacyLights===!0?Math.PI:1;m.lightMapIntensity.value=f.lightMapIntensity*_,t(f.lightMap,m.lightMapTransform)}f.aoMap&&(m.aoMap.value=f.aoMap,m.aoMapIntensity.value=f.aoMapIntensity,t(f.aoMap,m.aoMapTransform))}function o(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,f.map&&(m.map.value=f.map,t(f.map,m.mapTransform))}function a(m,f){m.dashSize.value=f.dashSize,m.totalSize.value=f.dashSize+f.gapSize,m.scale.value=f.scale}function l(m,f,S,_){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.size.value=f.size*S,m.scale.value=_*.5,f.map&&(m.map.value=f.map,t(f.map,m.uvTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function c(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.rotation.value=f.rotation,f.map&&(m.map.value=f.map,t(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function h(m,f){m.specular.value.copy(f.specular),m.shininess.value=Math.max(f.shininess,1e-4)}function u(m,f){f.gradientMap&&(m.gradientMap.value=f.gradientMap)}function d(m,f){m.metalness.value=f.metalness,f.metalnessMap&&(m.metalnessMap.value=f.metalnessMap,t(f.metalnessMap,m.metalnessMapTransform)),m.roughness.value=f.roughness,f.roughnessMap&&(m.roughnessMap.value=f.roughnessMap,t(f.roughnessMap,m.roughnessMapTransform)),e.get(f).envMap&&(m.envMapIntensity.value=f.envMapIntensity)}function p(m,f,S){m.ior.value=f.ior,f.sheen>0&&(m.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen),m.sheenRoughness.value=f.sheenRoughness,f.sheenColorMap&&(m.sheenColorMap.value=f.sheenColorMap,t(f.sheenColorMap,m.sheenColorMapTransform)),f.sheenRoughnessMap&&(m.sheenRoughnessMap.value=f.sheenRoughnessMap,t(f.sheenRoughnessMap,m.sheenRoughnessMapTransform))),f.clearcoat>0&&(m.clearcoat.value=f.clearcoat,m.clearcoatRoughness.value=f.clearcoatRoughness,f.clearcoatMap&&(m.clearcoatMap.value=f.clearcoatMap,t(f.clearcoatMap,m.clearcoatMapTransform)),f.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=f.clearcoatRoughnessMap,t(f.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),f.clearcoatNormalMap&&(m.clearcoatNormalMap.value=f.clearcoatNormalMap,t(f.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(f.clearcoatNormalScale),f.side===Ct&&m.clearcoatNormalScale.value.negate())),f.iridescence>0&&(m.iridescence.value=f.iridescence,m.iridescenceIOR.value=f.iridescenceIOR,m.iridescenceThicknessMinimum.value=f.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=f.iridescenceThicknessRange[1],f.iridescenceMap&&(m.iridescenceMap.value=f.iridescenceMap,t(f.iridescenceMap,m.iridescenceMapTransform)),f.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=f.iridescenceThicknessMap,t(f.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),f.transmission>0&&(m.transmission.value=f.transmission,m.transmissionSamplerMap.value=S.texture,m.transmissionSamplerSize.value.set(S.width,S.height),f.transmissionMap&&(m.transmissionMap.value=f.transmissionMap,t(f.transmissionMap,m.transmissionMapTransform)),m.thickness.value=f.thickness,f.thicknessMap&&(m.thicknessMap.value=f.thicknessMap,t(f.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=f.attenuationDistance,m.attenuationColor.value.copy(f.attenuationColor)),f.anisotropy>0&&(m.anisotropyVector.value.set(f.anisotropy*Math.cos(f.anisotropyRotation),f.anisotropy*Math.sin(f.anisotropyRotation)),f.anisotropyMap&&(m.anisotropyMap.value=f.anisotropyMap,t(f.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=f.specularIntensity,m.specularColor.value.copy(f.specularColor),f.specularColorMap&&(m.specularColorMap.value=f.specularColorMap,t(f.specularColorMap,m.specularColorMapTransform)),f.specularIntensityMap&&(m.specularIntensityMap.value=f.specularIntensityMap,t(f.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,f){f.matcap&&(m.matcap.value=f.matcap)}function x(m,f){const S=e.get(f).light;m.referencePosition.value.setFromMatrixPosition(S.matrixWorld),m.nearDistance.value=S.shadow.camera.near,m.farDistance.value=S.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Ip(i,e,t,n){let s={},r={},o=[];const a=t.isWebGL2?i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS):0;function l(S,_){const w=_.program;n.uniformBlockBinding(S,w)}function c(S,_){let w=s[S.id];w===void 0&&(g(S),w=h(S),s[S.id]=w,S.addEventListener("dispose",m));const L=_.program;n.updateUBOMapping(S,L);const C=e.render.frame;r[S.id]!==C&&(d(S),r[S.id]=C)}function h(S){const _=u();S.__bindingPointIndex=_;const w=i.createBuffer(),L=S.__size,C=S.usage;return i.bindBuffer(i.UNIFORM_BUFFER,w),i.bufferData(i.UNIFORM_BUFFER,L,C),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,_,w),w}function u(){for(let S=0;S<a;S++)if(o.indexOf(S)===-1)return o.push(S),S;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(S){const _=s[S.id],w=S.uniforms,L=S.__cache;i.bindBuffer(i.UNIFORM_BUFFER,_);for(let C=0,T=w.length;C<T;C++){const W=Array.isArray(w[C])?w[C]:[w[C]];for(let v=0,M=W.length;v<M;v++){const I=W[v];if(p(I,C,v,L)===!0){const X=I.__offset,J=Array.isArray(I.value)?I.value:[I.value];let D=0;for(let U=0;U<J.length;U++){const k=J[U],K=x(k);typeof k=="number"||typeof k=="boolean"?(I.__data[0]=k,i.bufferSubData(i.UNIFORM_BUFFER,X+D,I.__data)):k.isMatrix3?(I.__data[0]=k.elements[0],I.__data[1]=k.elements[1],I.__data[2]=k.elements[2],I.__data[3]=0,I.__data[4]=k.elements[3],I.__data[5]=k.elements[4],I.__data[6]=k.elements[5],I.__data[7]=0,I.__data[8]=k.elements[6],I.__data[9]=k.elements[7],I.__data[10]=k.elements[8],I.__data[11]=0):(k.toArray(I.__data,D),D+=K.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,X,I.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(S,_,w,L){const C=S.value,T=_+"_"+w;if(L[T]===void 0)return typeof C=="number"||typeof C=="boolean"?L[T]=C:L[T]=C.clone(),!0;{const W=L[T];if(typeof C=="number"||typeof C=="boolean"){if(W!==C)return L[T]=C,!0}else if(W.equals(C)===!1)return W.copy(C),!0}return!1}function g(S){const _=S.uniforms;let w=0;const L=16;for(let T=0,W=_.length;T<W;T++){const v=Array.isArray(_[T])?_[T]:[_[T]];for(let M=0,I=v.length;M<I;M++){const X=v[M],J=Array.isArray(X.value)?X.value:[X.value];for(let D=0,U=J.length;D<U;D++){const k=J[D],K=x(k),Y=w%L;Y!==0&&L-Y<K.boundary&&(w+=L-Y),X.__data=new Float32Array(K.storage/Float32Array.BYTES_PER_ELEMENT),X.__offset=w,w+=K.storage}}}const C=w%L;return C>0&&(w+=L-C),S.__size=w,S.__cache={},this}function x(S){const _={boundary:0,storage:0};return typeof S=="number"||typeof S=="boolean"?(_.boundary=4,_.storage=4):S.isVector2?(_.boundary=8,_.storage=8):S.isVector3||S.isColor?(_.boundary=16,_.storage=12):S.isVector4?(_.boundary=16,_.storage=16):S.isMatrix3?(_.boundary=48,_.storage=48):S.isMatrix4?(_.boundary=64,_.storage=64):S.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",S),_}function m(S){const _=S.target;_.removeEventListener("dispose",m);const w=o.indexOf(_.__bindingPointIndex);o.splice(w,1),i.deleteBuffer(s[_.id]),delete s[_.id],delete r[_.id]}function f(){for(const S in s)i.deleteBuffer(s[S]);o=[],s={},r={}}return{bind:l,update:c,dispose:f}}class Ya{constructor(e={}){const{canvas:t=lh(),context:n=null,depth:s=!0,stencil:r=!0,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1}=e;this.isWebGLRenderer=!0;let d;n!==null?d=n.getContextAttributes().alpha:d=o;const p=new Uint32Array(4),g=new Int32Array(4);let x=null,m=null;const f=[],S=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=xt,this._useLegacyLights=!1,this.toneMapping=dn,this.toneMappingExposure=1;const _=this;let w=!1,L=0,C=0,T=null,W=-1,v=null;const M=new ft,I=new ft;let X=null;const J=new Ue(0);let D=0,U=t.width,k=t.height,K=1,Y=null,$=null;const Z=new ft(0,0,U,k),ee=new ft(0,0,U,k);let z=!1;const O=new xr;let Q=!1,oe=!1,ue=null;const he=new et,Te=new xe,we=new R,ve={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function ke(){return T===null?K:1}let H=n;function lt(b,N){for(let G=0;G<b.length;G++){const j=b[G],V=t.getContext(j,N);if(V!==null)return V}return null}try{const b={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Is}`),t.addEventListener("webglcontextlost",ie,!1),t.addEventListener("webglcontextrestored",P,!1),t.addEventListener("webglcontextcreationerror",re,!1),H===null){const N=["webgl2","webgl","experimental-webgl"];if(_.isWebGL1Renderer===!0&&N.shift(),H=lt(N,b),H===null)throw lt(N)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}typeof WebGLRenderingContext<"u"&&H instanceof WebGLRenderingContext&&console.warn("THREE.WebGLRenderer: WebGL 1 support was deprecated in r153 and will be removed in r163."),H.getShaderPrecisionFormat===void 0&&(H.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(b){throw console.error("THREE.WebGLRenderer: "+b.message),b}let Se,Re,_e,Ke,Ae,E,y,B,te,F,q,ge,ce,me,Ce,Oe,ne,$e,ze,De,Me,de,A,se;function ye(){Se=new Vu(H),Re=new Ou(H,Se,e),Se.init(Re),de=new Cp(H,Se,Re),_e=new wp(H,Se,Re),Ke=new Xu(H),Ae=new up,E=new Ap(H,Se,_e,Ae,Re,de,Ke),y=new Bu(_),B=new Hu(_),te=new Ih(H,Re),A=new Uu(H,Se,te,Re),F=new Gu(H,te,Ke,A),q=new Yu(H,F,te,Ke),ze=new $u(H,Re,E),Oe=new Fu(Ae),ge=new dp(_,y,B,Se,Re,A,Oe),ce=new Dp(_,Ae),me=new pp,Ce=new yp(Se,Re),$e=new Iu(_,y,B,_e,q,d,l),ne=new Tp(_,q,Re),se=new Ip(H,Ke,Re,_e),De=new Nu(H,Se,Ke,Re),Me=new Wu(H,Se,Ke,Re),Ke.programs=ge.programs,_.capabilities=Re,_.extensions=Se,_.properties=Ae,_.renderLists=me,_.shadowMap=ne,_.state=_e,_.info=Ke}ye();const pe=new Pp(_,H);this.xr=pe,this.getContext=function(){return H},this.getContextAttributes=function(){return H.getContextAttributes()},this.forceContextLoss=function(){const b=Se.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){const b=Se.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return K},this.setPixelRatio=function(b){b!==void 0&&(K=b,this.setSize(U,k,!1))},this.getSize=function(b){return b.set(U,k)},this.setSize=function(b,N,G=!0){if(pe.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}U=b,k=N,t.width=Math.floor(b*K),t.height=Math.floor(N*K),G===!0&&(t.style.width=b+"px",t.style.height=N+"px"),this.setViewport(0,0,b,N)},this.getDrawingBufferSize=function(b){return b.set(U*K,k*K).floor()},this.setDrawingBufferSize=function(b,N,G){U=b,k=N,K=G,t.width=Math.floor(b*G),t.height=Math.floor(N*G),this.setViewport(0,0,b,N)},this.getCurrentViewport=function(b){return b.copy(M)},this.getViewport=function(b){return b.copy(Z)},this.setViewport=function(b,N,G,j){b.isVector4?Z.set(b.x,b.y,b.z,b.w):Z.set(b,N,G,j),_e.viewport(M.copy(Z).multiplyScalar(K).floor())},this.getScissor=function(b){return b.copy(ee)},this.setScissor=function(b,N,G,j){b.isVector4?ee.set(b.x,b.y,b.z,b.w):ee.set(b,N,G,j),_e.scissor(I.copy(ee).multiplyScalar(K).floor())},this.getScissorTest=function(){return z},this.setScissorTest=function(b){_e.setScissorTest(z=b)},this.setOpaqueSort=function(b){Y=b},this.setTransparentSort=function(b){$=b},this.getClearColor=function(b){return b.copy($e.getClearColor())},this.setClearColor=function(){$e.setClearColor.apply($e,arguments)},this.getClearAlpha=function(){return $e.getClearAlpha()},this.setClearAlpha=function(){$e.setClearAlpha.apply($e,arguments)},this.clear=function(b=!0,N=!0,G=!0){let j=0;if(b){let V=!1;if(T!==null){const fe=T.texture.format;V=fe===fo||fe===uo||fe===ho}if(V){const fe=T.texture.type,be=fe===un||fe===fn||fe===Vs||fe===Sn||fe===lo||fe===co,Pe=$e.getClearColor(),Ie=$e.getClearAlpha(),He=Pe.r,Ne=Pe.g,Fe=Pe.b;be?(p[0]=He,p[1]=Ne,p[2]=Fe,p[3]=Ie,H.clearBufferuiv(H.COLOR,0,p)):(g[0]=He,g[1]=Ne,g[2]=Fe,g[3]=Ie,H.clearBufferiv(H.COLOR,0,g))}else j|=H.COLOR_BUFFER_BIT}N&&(j|=H.DEPTH_BUFFER_BIT),G&&(j|=H.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),H.clear(j)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",ie,!1),t.removeEventListener("webglcontextrestored",P,!1),t.removeEventListener("webglcontextcreationerror",re,!1),me.dispose(),Ce.dispose(),Ae.dispose(),y.dispose(),B.dispose(),q.dispose(),A.dispose(),se.dispose(),ge.dispose(),pe.dispose(),pe.removeEventListener("sessionstart",st),pe.removeEventListener("sessionend",qe),ue&&(ue.dispose(),ue=null),ct.stop()};function ie(b){b.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),w=!0}function P(){console.log("THREE.WebGLRenderer: Context Restored."),w=!1;const b=Ke.autoReset,N=ne.enabled,G=ne.autoUpdate,j=ne.needsUpdate,V=ne.type;ye(),Ke.autoReset=b,ne.enabled=N,ne.autoUpdate=G,ne.needsUpdate=j,ne.type=V}function re(b){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function le(b){const N=b.target;N.removeEventListener("dispose",le),Le(N)}function Le(b){Ee(b),Ae.remove(b)}function Ee(b){const N=Ae.get(b).programs;N!==void 0&&(N.forEach(function(G){ge.releaseProgram(G)}),b.isShaderMaterial&&ge.releaseShaderCache(b))}this.renderBufferDirect=function(b,N,G,j,V,fe){N===null&&(N=ve);const be=V.isMesh&&V.matrixWorld.determinant()<0,Pe=ug(b,N,G,j,V);_e.setMaterial(j,be);let Ie=G.index,He=1;if(j.wireframe===!0){if(Ie=F.getWireframeAttribute(G),Ie===void 0)return;He=2}const Ne=G.drawRange,Fe=G.attributes.position;let rt=Ne.start*He,Ot=(Ne.start+Ne.count)*He;fe!==null&&(rt=Math.max(rt,fe.start*He),Ot=Math.min(Ot,(fe.start+fe.count)*He)),Ie!==null?(rt=Math.max(rt,0),Ot=Math.min(Ot,Ie.count)):Fe!=null&&(rt=Math.max(rt,0),Ot=Math.min(Ot,Fe.count));const gt=Ot-rt;if(gt<0||gt===1/0)return;A.setup(V,j,Pe,G,Ie);let ln,tt=De;if(Ie!==null&&(ln=te.get(Ie),tt=Me,tt.setIndex(ln)),V.isMesh)j.wireframe===!0?(_e.setLineWidth(j.wireframeLinewidth*ke()),tt.setMode(H.LINES)):tt.setMode(H.TRIANGLES);else if(V.isLine){let Ge=j.linewidth;Ge===void 0&&(Ge=1),_e.setLineWidth(Ge*ke()),V.isLineSegments?tt.setMode(H.LINES):V.isLineLoop?tt.setMode(H.LINE_LOOP):tt.setMode(H.LINE_STRIP)}else V.isPoints?tt.setMode(H.POINTS):V.isSprite&&tt.setMode(H.TRIANGLES);if(V.isBatchedMesh)tt.renderMultiDraw(V._multiDrawStarts,V._multiDrawCounts,V._multiDrawCount);else if(V.isInstancedMesh)tt.renderInstances(rt,gt,V.count);else if(G.isInstancedBufferGeometry){const Ge=G._maxInstanceCount!==void 0?G._maxInstanceCount:1/0,$r=Math.min(G.instanceCount,Ge);tt.renderInstances(rt,gt,$r)}else tt.render(rt,gt)};function Xe(b,N,G){b.transparent===!0&&b.side===Ft&&b.forceSinglePass===!1?(b.side=Ct,b.needsUpdate=!0,Ds(b,N,G),b.side=cn,b.needsUpdate=!0,Ds(b,N,G),b.side=Ft):Ds(b,N,G)}this.compile=function(b,N,G=null){G===null&&(G=b),m=Ce.get(G),m.init(),S.push(m),G.traverseVisible(function(V){V.isLight&&V.layers.test(N.layers)&&(m.pushLight(V),V.castShadow&&m.pushShadow(V))}),b!==G&&b.traverseVisible(function(V){V.isLight&&V.layers.test(N.layers)&&(m.pushLight(V),V.castShadow&&m.pushShadow(V))}),m.setupLights(_._useLegacyLights);const j=new Set;return b.traverse(function(V){const fe=V.material;if(fe)if(Array.isArray(fe))for(let be=0;be<fe.length;be++){const Pe=fe[be];Xe(Pe,G,V),j.add(Pe)}else Xe(fe,G,V),j.add(fe)}),S.pop(),m=null,j},this.compileAsync=function(b,N,G=null){const j=this.compile(b,N,G);return new Promise(V=>{function fe(){if(j.forEach(function(be){Ae.get(be).currentProgram.isReady()&&j.delete(be)}),j.size===0){V(b);return}setTimeout(fe,10)}Se.get("KHR_parallel_shader_compile")!==null?fe():setTimeout(fe,10)})};let je=null;function nt(b){je&&je(b)}function st(){ct.stop()}function qe(){ct.start()}const ct=new ya;ct.setAnimationLoop(nt),typeof self<"u"&&ct.setContext(self),this.setAnimationLoop=function(b){je=b,pe.setAnimationLoop(b),b===null?ct.stop():ct.start()},pe.addEventListener("sessionstart",st),pe.addEventListener("sessionend",qe),this.render=function(b,N){if(N!==void 0&&N.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(w===!0)return;b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),pe.enabled===!0&&pe.isPresenting===!0&&(pe.cameraAutoUpdate===!0&&pe.updateCamera(N),N=pe.getCamera()),b.isScene===!0&&b.onBeforeRender(_,b,N,T),m=Ce.get(b,S.length),m.init(),S.push(m),he.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),O.setFromProjectionMatrix(he),oe=this.localClippingEnabled,Q=Oe.init(this.clippingPlanes,oe),x=me.get(b,f.length),x.init(),f.push(x),Yt(b,N,0,_.sortObjects),x.finish(),_.sortObjects===!0&&x.sort(Y,$),this.info.render.frame++,Q===!0&&Oe.beginShadows();const G=m.state.shadowsArray;if(ne.render(G,b,N),Q===!0&&Oe.endShadows(),this.info.autoReset===!0&&this.info.reset(),$e.render(x,b),m.setupLights(_._useLegacyLights),N.isArrayCamera){const j=N.cameras;for(let V=0,fe=j.length;V<fe;V++){const be=j[V];Gl(x,b,be,be.viewport)}}else Gl(x,b,N);T!==null&&(E.updateMultisampleRenderTarget(T),E.updateRenderTargetMipmap(T)),b.isScene===!0&&b.onAfterRender(_,b,N),A.resetDefaultState(),W=-1,v=null,S.pop(),S.length>0?m=S[S.length-1]:m=null,f.pop(),f.length>0?x=f[f.length-1]:x=null};function Yt(b,N,G,j){if(b.visible===!1)return;if(b.layers.test(N.layers)){if(b.isGroup)G=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(N);else if(b.isLight)m.pushLight(b),b.castShadow&&m.pushShadow(b);else if(b.isSprite){if(!b.frustumCulled||O.intersectsSprite(b)){j&&we.setFromMatrixPosition(b.matrixWorld).applyMatrix4(he);const be=q.update(b),Pe=b.material;Pe.visible&&x.push(b,be,Pe,G,we.z,null)}}else if((b.isMesh||b.isLine||b.isPoints)&&(!b.frustumCulled||O.intersectsObject(b))){const be=q.update(b),Pe=b.material;if(j&&(b.boundingSphere!==void 0?(b.boundingSphere===null&&b.computeBoundingSphere(),we.copy(b.boundingSphere.center)):(be.boundingSphere===null&&be.computeBoundingSphere(),we.copy(be.boundingSphere.center)),we.applyMatrix4(b.matrixWorld).applyMatrix4(he)),Array.isArray(Pe)){const Ie=be.groups;for(let He=0,Ne=Ie.length;He<Ne;He++){const Fe=Ie[He],rt=Pe[Fe.materialIndex];rt&&rt.visible&&x.push(b,be,rt,G,we.z,Fe)}}else Pe.visible&&x.push(b,be,Pe,G,we.z,null)}}const fe=b.children;for(let be=0,Pe=fe.length;be<Pe;be++)Yt(fe[be],N,G,j)}function Gl(b,N,G,j){const V=b.opaque,fe=b.transmissive,be=b.transparent;m.setupLightsView(G),Q===!0&&Oe.setGlobalState(_.clippingPlanes,G),fe.length>0&&dg(V,fe,N,G),j&&_e.viewport(M.copy(j)),V.length>0&&Ps(V,N,G),fe.length>0&&Ps(fe,N,G),be.length>0&&Ps(be,N,G),_e.buffers.depth.setTest(!0),_e.buffers.depth.setMask(!0),_e.buffers.color.setMask(!0),_e.setPolygonOffset(!1)}function dg(b,N,G,j){if((G.isScene===!0?G.overrideMaterial:null)!==null)return;const fe=Re.isWebGL2;ue===null&&(ue=new Tn(1,1,{generateMipmaps:!0,type:Se.has("EXT_color_buffer_half_float")?Ti:un,minFilter:Ei,samples:fe?4:0})),_.getDrawingBufferSize(Te),fe?ue.setSize(Te.x,Te.y):ue.setSize(Yi(Te.x),Yi(Te.y));const be=_.getRenderTarget();_.setRenderTarget(ue),_.getClearColor(J),D=_.getClearAlpha(),D<1&&_.setClearColor(16777215,.5),_.clear();const Pe=_.toneMapping;_.toneMapping=dn,Ps(b,G,j),E.updateMultisampleRenderTarget(ue),E.updateRenderTargetMipmap(ue);let Ie=!1;for(let He=0,Ne=N.length;He<Ne;He++){const Fe=N[He],rt=Fe.object,Ot=Fe.geometry,gt=Fe.material,ln=Fe.group;if(gt.side===Ft&&rt.layers.test(j.layers)){const tt=gt.side;gt.side=Ct,gt.needsUpdate=!0,Wl(rt,G,j,Ot,gt,ln),gt.side=tt,gt.needsUpdate=!0,Ie=!0}}Ie===!0&&(E.updateMultisampleRenderTarget(ue),E.updateRenderTargetMipmap(ue)),_.setRenderTarget(be),_.setClearColor(J,D),_.toneMapping=Pe}function Ps(b,N,G){const j=N.isScene===!0?N.overrideMaterial:null;for(let V=0,fe=b.length;V<fe;V++){const be=b[V],Pe=be.object,Ie=be.geometry,He=j===null?be.material:j,Ne=be.group;Pe.layers.test(G.layers)&&Wl(Pe,N,G,Ie,He,Ne)}}function Wl(b,N,G,j,V,fe){b.onBeforeRender(_,N,G,j,V,fe),b.modelViewMatrix.multiplyMatrices(G.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),V.onBeforeRender(_,N,G,j,b,fe),V.transparent===!0&&V.side===Ft&&V.forceSinglePass===!1?(V.side=Ct,V.needsUpdate=!0,_.renderBufferDirect(G,N,j,V,b,fe),V.side=cn,V.needsUpdate=!0,_.renderBufferDirect(G,N,j,V,b,fe),V.side=Ft):_.renderBufferDirect(G,N,j,V,b,fe),b.onAfterRender(_,N,G,j,V,fe)}function Ds(b,N,G){N.isScene!==!0&&(N=ve);const j=Ae.get(b),V=m.state.lights,fe=m.state.shadowsArray,be=V.state.version,Pe=ge.getParameters(b,V.state,fe,N,G),Ie=ge.getProgramCacheKey(Pe);let He=j.programs;j.environment=b.isMeshStandardMaterial?N.environment:null,j.fog=N.fog,j.envMap=(b.isMeshStandardMaterial?B:y).get(b.envMap||j.environment),He===void 0&&(b.addEventListener("dispose",le),He=new Map,j.programs=He);let Ne=He.get(Ie);if(Ne!==void 0){if(j.currentProgram===Ne&&j.lightsStateVersion===be)return jl(b,Pe),Ne}else Pe.uniforms=ge.getUniforms(b),b.onBuild(G,Pe,_),b.onBeforeCompile(Pe,_),Ne=ge.acquireProgram(Pe,Ie),He.set(Ie,Ne),j.uniforms=Pe.uniforms;const Fe=j.uniforms;return(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(Fe.clippingPlanes=Oe.uniform),jl(b,Pe),j.needsLights=pg(b),j.lightsStateVersion=be,j.needsLights&&(Fe.ambientLightColor.value=V.state.ambient,Fe.lightProbe.value=V.state.probe,Fe.directionalLights.value=V.state.directional,Fe.directionalLightShadows.value=V.state.directionalShadow,Fe.spotLights.value=V.state.spot,Fe.spotLightShadows.value=V.state.spotShadow,Fe.rectAreaLights.value=V.state.rectArea,Fe.ltc_1.value=V.state.rectAreaLTC1,Fe.ltc_2.value=V.state.rectAreaLTC2,Fe.pointLights.value=V.state.point,Fe.pointLightShadows.value=V.state.pointShadow,Fe.hemisphereLights.value=V.state.hemi,Fe.directionalShadowMap.value=V.state.directionalShadowMap,Fe.directionalShadowMatrix.value=V.state.directionalShadowMatrix,Fe.spotShadowMap.value=V.state.spotShadowMap,Fe.spotLightMatrix.value=V.state.spotLightMatrix,Fe.spotLightMap.value=V.state.spotLightMap,Fe.pointShadowMap.value=V.state.pointShadowMap,Fe.pointShadowMatrix.value=V.state.pointShadowMatrix),j.currentProgram=Ne,j.uniformsList=null,Ne}function Xl(b){if(b.uniformsList===null){const N=b.currentProgram.getUniforms();b.uniformsList=Es.seqWithValue(N.seq,b.uniforms)}return b.uniformsList}function jl(b,N){const G=Ae.get(b);G.outputColorSpace=N.outputColorSpace,G.batching=N.batching,G.instancing=N.instancing,G.instancingColor=N.instancingColor,G.skinning=N.skinning,G.morphTargets=N.morphTargets,G.morphNormals=N.morphNormals,G.morphColors=N.morphColors,G.morphTargetsCount=N.morphTargetsCount,G.numClippingPlanes=N.numClippingPlanes,G.numIntersection=N.numClipIntersection,G.vertexAlphas=N.vertexAlphas,G.vertexTangents=N.vertexTangents,G.toneMapping=N.toneMapping}function ug(b,N,G,j,V){N.isScene!==!0&&(N=ve),E.resetTextureUnits();const fe=N.fog,be=j.isMeshStandardMaterial?N.environment:null,Pe=T===null?_.outputColorSpace:T.isXRRenderTarget===!0?T.texture.colorSpace:Jt,Ie=(j.isMeshStandardMaterial?B:y).get(j.envMap||be),He=j.vertexColors===!0&&!!G.attributes.color&&G.attributes.color.itemSize===4,Ne=!!G.attributes.tangent&&(!!j.normalMap||j.anisotropy>0),Fe=!!G.morphAttributes.position,rt=!!G.morphAttributes.normal,Ot=!!G.morphAttributes.color;let gt=dn;j.toneMapped&&(T===null||T.isXRRenderTarget===!0)&&(gt=_.toneMapping);const ln=G.morphAttributes.position||G.morphAttributes.normal||G.morphAttributes.color,tt=ln!==void 0?ln.length:0,Ge=Ae.get(j),$r=m.state.lights;if(Q===!0&&(oe===!0||b!==v)){const Ht=b===v&&j.id===W;Oe.setState(j,b,Ht)}let it=!1;j.version===Ge.__version?(Ge.needsLights&&Ge.lightsStateVersion!==$r.state.version||Ge.outputColorSpace!==Pe||V.isBatchedMesh&&Ge.batching===!1||!V.isBatchedMesh&&Ge.batching===!0||V.isInstancedMesh&&Ge.instancing===!1||!V.isInstancedMesh&&Ge.instancing===!0||V.isSkinnedMesh&&Ge.skinning===!1||!V.isSkinnedMesh&&Ge.skinning===!0||V.isInstancedMesh&&Ge.instancingColor===!0&&V.instanceColor===null||V.isInstancedMesh&&Ge.instancingColor===!1&&V.instanceColor!==null||Ge.envMap!==Ie||j.fog===!0&&Ge.fog!==fe||Ge.numClippingPlanes!==void 0&&(Ge.numClippingPlanes!==Oe.numPlanes||Ge.numIntersection!==Oe.numIntersection)||Ge.vertexAlphas!==He||Ge.vertexTangents!==Ne||Ge.morphTargets!==Fe||Ge.morphNormals!==rt||Ge.morphColors!==Ot||Ge.toneMapping!==gt||Re.isWebGL2===!0&&Ge.morphTargetsCount!==tt)&&(it=!0):(it=!0,Ge.__version=j.version);let Hn=Ge.currentProgram;it===!0&&(Hn=Ds(j,N,V));let ql=!1,Hi=!1,Yr=!1;const Mt=Hn.getUniforms(),Vn=Ge.uniforms;if(_e.useProgram(Hn.program)&&(ql=!0,Hi=!0,Yr=!0),j.id!==W&&(W=j.id,Hi=!0),ql||v!==b){Mt.setValue(H,"projectionMatrix",b.projectionMatrix),Mt.setValue(H,"viewMatrix",b.matrixWorldInverse);const Ht=Mt.map.cameraPosition;Ht!==void 0&&Ht.setValue(H,we.setFromMatrixPosition(b.matrixWorld)),Re.logarithmicDepthBuffer&&Mt.setValue(H,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),(j.isMeshPhongMaterial||j.isMeshToonMaterial||j.isMeshLambertMaterial||j.isMeshBasicMaterial||j.isMeshStandardMaterial||j.isShaderMaterial)&&Mt.setValue(H,"isOrthographic",b.isOrthographicCamera===!0),v!==b&&(v=b,Hi=!0,Yr=!0)}if(V.isSkinnedMesh){Mt.setOptional(H,V,"bindMatrix"),Mt.setOptional(H,V,"bindMatrixInverse");const Ht=V.skeleton;Ht&&(Re.floatVertexTextures?(Ht.boneTexture===null&&Ht.computeBoneTexture(),Mt.setValue(H,"boneTexture",Ht.boneTexture,E)):console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."))}V.isBatchedMesh&&(Mt.setOptional(H,V,"batchingTexture"),Mt.setValue(H,"batchingTexture",V._matricesTexture,E));const Kr=G.morphAttributes;if((Kr.position!==void 0||Kr.normal!==void 0||Kr.color!==void 0&&Re.isWebGL2===!0)&&ze.update(V,G,Hn),(Hi||Ge.receiveShadow!==V.receiveShadow)&&(Ge.receiveShadow=V.receiveShadow,Mt.setValue(H,"receiveShadow",V.receiveShadow)),j.isMeshGouraudMaterial&&j.envMap!==null&&(Vn.envMap.value=Ie,Vn.flipEnvMap.value=Ie.isCubeTexture&&Ie.isRenderTargetTexture===!1?-1:1),Hi&&(Mt.setValue(H,"toneMappingExposure",_.toneMappingExposure),Ge.needsLights&&fg(Vn,Yr),fe&&j.fog===!0&&ce.refreshFogUniforms(Vn,fe),ce.refreshMaterialUniforms(Vn,j,K,k,ue),Es.upload(H,Xl(Ge),Vn,E)),j.isShaderMaterial&&j.uniformsNeedUpdate===!0&&(Es.upload(H,Xl(Ge),Vn,E),j.uniformsNeedUpdate=!1),j.isSpriteMaterial&&Mt.setValue(H,"center",V.center),Mt.setValue(H,"modelViewMatrix",V.modelViewMatrix),Mt.setValue(H,"normalMatrix",V.normalMatrix),Mt.setValue(H,"modelMatrix",V.matrixWorld),j.isShaderMaterial||j.isRawShaderMaterial){const Ht=j.uniformsGroups;for(let Jr=0,mg=Ht.length;Jr<mg;Jr++)if(Re.isWebGL2){const $l=Ht[Jr];se.update($l,Hn),se.bind($l,Hn)}else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.")}return Hn}function fg(b,N){b.ambientLightColor.needsUpdate=N,b.lightProbe.needsUpdate=N,b.directionalLights.needsUpdate=N,b.directionalLightShadows.needsUpdate=N,b.pointLights.needsUpdate=N,b.pointLightShadows.needsUpdate=N,b.spotLights.needsUpdate=N,b.spotLightShadows.needsUpdate=N,b.rectAreaLights.needsUpdate=N,b.hemisphereLights.needsUpdate=N}function pg(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return L},this.getActiveMipmapLevel=function(){return C},this.getRenderTarget=function(){return T},this.setRenderTargetTextures=function(b,N,G){Ae.get(b.texture).__webglTexture=N,Ae.get(b.depthTexture).__webglTexture=G;const j=Ae.get(b);j.__hasExternalTextures=!0,j.__hasExternalTextures&&(j.__autoAllocateDepthBuffer=G===void 0,j.__autoAllocateDepthBuffer||Se.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),j.__useRenderToTexture=!1))},this.setRenderTargetFramebuffer=function(b,N){const G=Ae.get(b);G.__webglFramebuffer=N,G.__useDefaultFramebuffer=N===void 0},this.setRenderTarget=function(b,N=0,G=0){T=b,L=N,C=G;let j=!0,V=null,fe=!1,be=!1;if(b){const Ie=Ae.get(b);Ie.__useDefaultFramebuffer!==void 0?(_e.bindFramebuffer(H.FRAMEBUFFER,null),j=!1):Ie.__webglFramebuffer===void 0?E.setupRenderTarget(b):Ie.__hasExternalTextures&&E.rebindTextures(b,Ae.get(b.texture).__webglTexture,Ae.get(b.depthTexture).__webglTexture);const He=b.texture;(He.isData3DTexture||He.isDataArrayTexture||He.isCompressedArrayTexture)&&(be=!0);const Ne=Ae.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(Array.isArray(Ne[N])?V=Ne[N][G]:V=Ne[N],fe=!0):Re.isWebGL2&&b.samples>0&&E.useMultisampledRTT(b)===!1?V=Ae.get(b).__webglMultisampledFramebuffer:Array.isArray(Ne)?V=Ne[G]:V=Ne,M.copy(b.viewport),I.copy(b.scissor),X=b.scissorTest}else M.copy(Z).multiplyScalar(K).floor(),I.copy(ee).multiplyScalar(K).floor(),X=z;if(_e.bindFramebuffer(H.FRAMEBUFFER,V)&&Re.drawBuffers&&j&&_e.drawBuffers(b,V),_e.viewport(M),_e.scissor(I),_e.setScissorTest(X),fe){const Ie=Ae.get(b.texture);H.framebufferTexture2D(H.FRAMEBUFFER,H.COLOR_ATTACHMENT0,H.TEXTURE_CUBE_MAP_POSITIVE_X+N,Ie.__webglTexture,G)}else if(be){const Ie=Ae.get(b.texture),He=N||0;H.framebufferTextureLayer(H.FRAMEBUFFER,H.COLOR_ATTACHMENT0,Ie.__webglTexture,G||0,He)}W=-1},this.readRenderTargetPixels=function(b,N,G,j,V,fe,be){if(!(b&&b.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Pe=Ae.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&be!==void 0&&(Pe=Pe[be]),Pe){_e.bindFramebuffer(H.FRAMEBUFFER,Pe);try{const Ie=b.texture,He=Ie.format,Ne=Ie.type;if(He!==Gt&&de.convert(He)!==H.getParameter(H.IMPLEMENTATION_COLOR_READ_FORMAT)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}const Fe=Ne===Ti&&(Se.has("EXT_color_buffer_half_float")||Re.isWebGL2&&Se.has("EXT_color_buffer_float"));if(Ne!==un&&de.convert(Ne)!==H.getParameter(H.IMPLEMENTATION_COLOR_READ_TYPE)&&!(Ne===pn&&(Re.isWebGL2||Se.has("OES_texture_float")||Se.has("WEBGL_color_buffer_float")))&&!Fe){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=b.width-j&&G>=0&&G<=b.height-V&&H.readPixels(N,G,j,V,de.convert(He),de.convert(Ne),fe)}finally{const Ie=T!==null?Ae.get(T).__webglFramebuffer:null;_e.bindFramebuffer(H.FRAMEBUFFER,Ie)}}},this.copyFramebufferToTexture=function(b,N,G=0){const j=Math.pow(2,-G),V=Math.floor(N.image.width*j),fe=Math.floor(N.image.height*j);E.setTexture2D(N,0),H.copyTexSubImage2D(H.TEXTURE_2D,G,0,0,b.x,b.y,V,fe),_e.unbindTexture()},this.copyTextureToTexture=function(b,N,G,j=0){const V=N.image.width,fe=N.image.height,be=de.convert(G.format),Pe=de.convert(G.type);E.setTexture2D(G,0),H.pixelStorei(H.UNPACK_FLIP_Y_WEBGL,G.flipY),H.pixelStorei(H.UNPACK_PREMULTIPLY_ALPHA_WEBGL,G.premultiplyAlpha),H.pixelStorei(H.UNPACK_ALIGNMENT,G.unpackAlignment),N.isDataTexture?H.texSubImage2D(H.TEXTURE_2D,j,b.x,b.y,V,fe,be,Pe,N.image.data):N.isCompressedTexture?H.compressedTexSubImage2D(H.TEXTURE_2D,j,b.x,b.y,N.mipmaps[0].width,N.mipmaps[0].height,be,N.mipmaps[0].data):H.texSubImage2D(H.TEXTURE_2D,j,b.x,b.y,be,Pe,N.image),j===0&&G.generateMipmaps&&H.generateMipmap(H.TEXTURE_2D),_e.unbindTexture()},this.copyTextureToTexture3D=function(b,N,G,j,V=0){if(_.isWebGL1Renderer){console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");return}const fe=b.max.x-b.min.x+1,be=b.max.y-b.min.y+1,Pe=b.max.z-b.min.z+1,Ie=de.convert(j.format),He=de.convert(j.type);let Ne;if(j.isData3DTexture)E.setTexture3D(j,0),Ne=H.TEXTURE_3D;else if(j.isDataArrayTexture||j.isCompressedArrayTexture)E.setTexture2DArray(j,0),Ne=H.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}H.pixelStorei(H.UNPACK_FLIP_Y_WEBGL,j.flipY),H.pixelStorei(H.UNPACK_PREMULTIPLY_ALPHA_WEBGL,j.premultiplyAlpha),H.pixelStorei(H.UNPACK_ALIGNMENT,j.unpackAlignment);const Fe=H.getParameter(H.UNPACK_ROW_LENGTH),rt=H.getParameter(H.UNPACK_IMAGE_HEIGHT),Ot=H.getParameter(H.UNPACK_SKIP_PIXELS),gt=H.getParameter(H.UNPACK_SKIP_ROWS),ln=H.getParameter(H.UNPACK_SKIP_IMAGES),tt=G.isCompressedTexture?G.mipmaps[V]:G.image;H.pixelStorei(H.UNPACK_ROW_LENGTH,tt.width),H.pixelStorei(H.UNPACK_IMAGE_HEIGHT,tt.height),H.pixelStorei(H.UNPACK_SKIP_PIXELS,b.min.x),H.pixelStorei(H.UNPACK_SKIP_ROWS,b.min.y),H.pixelStorei(H.UNPACK_SKIP_IMAGES,b.min.z),G.isDataTexture||G.isData3DTexture?H.texSubImage3D(Ne,V,N.x,N.y,N.z,fe,be,Pe,Ie,He,tt.data):G.isCompressedArrayTexture?(console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."),H.compressedTexSubImage3D(Ne,V,N.x,N.y,N.z,fe,be,Pe,Ie,tt.data)):H.texSubImage3D(Ne,V,N.x,N.y,N.z,fe,be,Pe,Ie,He,tt),H.pixelStorei(H.UNPACK_ROW_LENGTH,Fe),H.pixelStorei(H.UNPACK_IMAGE_HEIGHT,rt),H.pixelStorei(H.UNPACK_SKIP_PIXELS,Ot),H.pixelStorei(H.UNPACK_SKIP_ROWS,gt),H.pixelStorei(H.UNPACK_SKIP_IMAGES,ln),V===0&&j.generateMipmaps&&H.generateMipmap(Ne),_e.unbindTexture()},this.initTexture=function(b){b.isCubeTexture?E.setTextureCube(b,0):b.isData3DTexture?E.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?E.setTexture2DArray(b,0):E.setTexture2D(b,0),_e.unbindTexture()},this.resetState=function(){L=0,C=0,T=null,_e.reset(),A.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Zt}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=e===$s?"display-p3":"srgb",t.unpackColorSpace=Ye.workingColorSpace===Wi?"display-p3":"srgb"}get outputEncoding(){return console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace===xt?Mn:zo}set outputEncoding(e){console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace=e===Mn?xt:Jt}get useLegacyLights(){return console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights}set useLegacyLights(e){console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights=e}}class Up extends Ya{}Up.prototype.isWebGL1Renderer=!0;class Ni{constructor(e,t=1,n=1e3){this.isFog=!0,this.name="",this.color=new Ue(e),this.near=t,this.far=n}clone(){return new Ni(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class Np extends pt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t}}class On extends ai{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ue(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Ka=new R,Ja=new R,Za=new et,Ar=new ss,Ts=new ts;class Cr extends pt{constructor(e=new St,t=new On){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)Ka.fromBufferAttribute(t,s-1),Ja.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=Ka.distanceTo(Ja);e.setAttribute("lineDistance",new yt(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Ts.copy(n.boundingSphere),Ts.applyMatrix4(s),Ts.radius+=r,e.ray.intersectsSphere(Ts)===!1)return;Za.copy(s).invert(),Ar.copy(e.ray).applyMatrix4(Za);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=new R,h=new R,u=new R,d=new R,p=this.isLineSegments?2:1,g=n.index,m=n.attributes.position;if(g!==null){const f=Math.max(0,o.start),S=Math.min(g.count,o.start+o.count);for(let _=f,w=S-1;_<w;_+=p){const L=g.getX(_),C=g.getX(_+1);if(c.fromBufferAttribute(m,L),h.fromBufferAttribute(m,C),Ar.distanceSqToSegment(c,h,d,u)>l)continue;d.applyMatrix4(this.matrixWorld);const W=e.ray.origin.distanceTo(d);W<e.near||W>e.far||t.push({distance:W,point:u.clone().applyMatrix4(this.matrixWorld),index:_,face:null,faceIndex:null,object:this})}}else{const f=Math.max(0,o.start),S=Math.min(m.count,o.start+o.count);for(let _=f,w=S-1;_<w;_+=p){if(c.fromBufferAttribute(m,_),h.fromBufferAttribute(m,_+1),Ar.distanceSqToSegment(c,h,d,u)>l)continue;d.applyMatrix4(this.matrixWorld);const C=e.ray.origin.distanceTo(d);C<e.near||C>e.far||t.push({distance:C,point:u.clone().applyMatrix4(this.matrixWorld),index:_,face:null,faceIndex:null,object:this})}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}const Qa=new R,el=new R;class Fn extends Cr{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)Qa.fromBufferAttribute(t,s),el.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+Qa.distanceTo(el);e.setAttribute("lineDistance",new yt(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class on{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){const n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let n,s=this.getPoint(0),r=0;t.push(0);for(let o=1;o<=e;o++)n=this.getPoint(o/e),r+=n.distanceTo(s),t.push(r),s=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){const n=this.getLengths();let s=0;const r=n.length;let o;t?o=t:o=e*n[r-1];let a=0,l=r-1,c;for(;a<=l;)if(s=Math.floor(a+(l-a)/2),c=n[s]-o,c<0)a=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===o)return s/(r-1);const h=n[s],d=n[s+1]-h,p=(o-h)/d;return(s+p)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);const o=this.getPoint(s),a=this.getPoint(r),l=t||(o.isVector2?new xe:new R);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){const n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t){const n=new R,s=[],r=[],o=[],a=new R,l=new et;for(let p=0;p<=e;p++){const g=p/e;s[p]=this.getTangentAt(g,new R)}r[0]=new R,o[0]=new R;let c=Number.MAX_VALUE;const h=Math.abs(s[0].x),u=Math.abs(s[0].y),d=Math.abs(s[0].z);h<=c&&(c=h,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),a.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let p=1;p<=e;p++){if(r[p]=r[p-1].clone(),o[p]=o[p-1].clone(),a.crossVectors(s[p-1],s[p]),a.length()>Number.EPSILON){a.normalize();const g=Math.acos(ut(s[p-1].dot(s[p]),-1,1));r[p].applyMatrix4(l.makeRotationAxis(a,g))}o[p].crossVectors(s[p],r[p])}if(t===!0){let p=Math.acos(ut(r[0].dot(r[e]),-1,1));p/=e,s[0].dot(a.crossVectors(r[0],r[e]))>0&&(p=-p);for(let g=1;g<=e;g++)r[g].applyMatrix4(l.makeRotationAxis(s[g],p*g)),o[g].crossVectors(s[g],r[g])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class tl extends on{constructor(e=0,t=0,n=1,s=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t){const n=t||new xe,s=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);const a=this.aStartAngle+e*r;let l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){const h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=l-this.aX,p=c-this.aY;l=d*h-p*u+this.aX,c=d*u+p*h+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class Op extends tl{constructor(e,t,n,s,r,o){super(e,t,n,n,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}}function Rr(){let i=0,e=0,t=0,n=0;function s(r,o,a,l){i=r,e=a,t=-3*r+3*o-2*a-l,n=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){s(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,h,u){let d=(o-r)/c-(a-r)/(c+h)+(a-o)/h,p=(a-o)/h-(l-o)/(h+u)+(l-a)/u;d*=h,p*=h,s(o,a,d,p)},calc:function(r){const o=r*r,a=o*r;return i+e*r+t*o+n*a}}}const ws=new R,Lr=new Rr,Pr=new Rr,Dr=new Rr;class nl extends on{constructor(e=[],t=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=s}getPoint(e,t=new R){const n=t,s=this.points,r=s.length,o=(r-(this.closed?0:1))*e;let a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,h;this.closed||a>0?c=s[(a-1)%r]:(ws.subVectors(s[0],s[1]).add(s[0]),c=ws);const u=s[a%r],d=s[(a+1)%r];if(this.closed||a+2<r?h=s[(a+2)%r]:(ws.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=ws),this.curveType==="centripetal"||this.curveType==="chordal"){const p=this.curveType==="chordal"?.5:.25;let g=Math.pow(c.distanceToSquared(u),p),x=Math.pow(u.distanceToSquared(d),p),m=Math.pow(d.distanceToSquared(h),p);x<1e-4&&(x=1),g<1e-4&&(g=x),m<1e-4&&(m=x),Lr.initNonuniformCatmullRom(c.x,u.x,d.x,h.x,g,x,m),Pr.initNonuniformCatmullRom(c.y,u.y,d.y,h.y,g,x,m),Dr.initNonuniformCatmullRom(c.z,u.z,d.z,h.z,g,x,m)}else this.curveType==="catmullrom"&&(Lr.initCatmullRom(c.x,u.x,d.x,h.x,this.tension),Pr.initCatmullRom(c.y,u.y,d.y,h.y,this.tension),Dr.initCatmullRom(c.z,u.z,d.z,h.z,this.tension));return n.set(Lr.calc(l),Pr.calc(l),Dr.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(new R().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function il(i,e,t,n,s){const r=(n-e)*.5,o=(s-t)*.5,a=i*i,l=i*a;return(2*t-2*n+r+o)*l+(-3*t+3*n-2*r-o)*a+r*i+t}function Fp(i,e){const t=1-i;return t*t*e}function Bp(i,e){return 2*(1-i)*i*e}function kp(i,e){return i*i*e}function Oi(i,e,t,n){return Fp(i,e)+Bp(i,t)+kp(i,n)}function zp(i,e){const t=1-i;return t*t*t*e}function Hp(i,e){const t=1-i;return 3*t*t*i*e}function Vp(i,e){return 3*(1-i)*i*i*e}function Gp(i,e){return i*i*i*e}function Fi(i,e,t,n,s){return zp(i,e)+Hp(i,t)+Vp(i,n)+Gp(i,s)}class Wp extends on{constructor(e=new xe,t=new xe,n=new xe,s=new xe){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new xe){const n=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(Fi(e,s.x,r.x,o.x,a.x),Fi(e,s.y,r.y,o.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class Xp extends on{constructor(e=new R,t=new R,n=new R,s=new R){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new R){const n=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(Fi(e,s.x,r.x,o.x,a.x),Fi(e,s.y,r.y,o.y,a.y),Fi(e,s.z,r.z,o.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class jp extends on{constructor(e=new xe,t=new xe){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new xe){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new xe){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class qp extends on{constructor(e=new R,t=new R){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new R){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new R){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class $p extends on{constructor(e=new xe,t=new xe,n=new xe){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new xe){const n=t,s=this.v0,r=this.v1,o=this.v2;return n.set(Oi(e,s.x,r.x,o.x),Oi(e,s.y,r.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class sl extends on{constructor(e=new R,t=new R,n=new R){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new R){const n=t,s=this.v0,r=this.v1,o=this.v2;return n.set(Oi(e,s.x,r.x,o.x),Oi(e,s.y,r.y,o.y),Oi(e,s.z,r.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Yp extends on{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new xe){const n=t,s=this.points,r=(s.length-1)*e,o=Math.floor(r),a=r-o,l=s[o===0?o:o-1],c=s[o],h=s[o>s.length-2?s.length-1:o+1],u=s[o>s.length-3?s.length-1:o+2];return n.set(il(a,l.x,c.x,h.x,u.x),il(a,l.y,c.y,h.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(s.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(new xe().fromArray(s))}return this}}var Kp=Object.freeze({__proto__:null,ArcCurve:Op,CatmullRomCurve3:nl,CubicBezierCurve:Wp,CubicBezierCurve3:Xp,EllipseCurve:tl,LineCurve:jp,LineCurve3:qp,QuadraticBezierCurve:$p,QuadraticBezierCurve3:sl,SplineCurve:Yp});class Ir extends St{constructor(e=new sl(new R(-1,-1,0),new R(-1,1,0),new R(1,1,0)),t=64,n=1,s=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:s,closed:r};const o=e.computeFrenetFrames(t,r);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;const a=new R,l=new R,c=new xe;let h=new R;const u=[],d=[],p=[],g=[];x(),this.setIndex(g),this.setAttribute("position",new yt(u,3)),this.setAttribute("normal",new yt(d,3)),this.setAttribute("uv",new yt(p,2));function x(){for(let _=0;_<t;_++)m(_);m(r===!1?t:0),S(),f()}function m(_){h=e.getPointAt(_/t,h);const w=o.normals[_],L=o.binormals[_];for(let C=0;C<=s;C++){const T=C/s*Math.PI*2,W=Math.sin(T),v=-Math.cos(T);l.x=v*w.x+W*L.x,l.y=v*w.y+W*L.y,l.z=v*w.z+W*L.z,l.normalize(),d.push(l.x,l.y,l.z),a.x=h.x+n*l.x,a.y=h.y+n*l.y,a.z=h.z+n*l.z,u.push(a.x,a.y,a.z)}}function f(){for(let _=1;_<=t;_++)for(let w=1;w<=s;w++){const L=(s+1)*(_-1)+(w-1),C=(s+1)*_+(w-1),T=(s+1)*_+w,W=(s+1)*(_-1)+w;g.push(L,C,W),g.push(C,T,W)}}function S(){for(let _=0;_<=t;_++)for(let w=0;w<=s;w++)c.x=_/t,c.y=w/s,p.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new Ir(new Kp[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}}class vi extends ai{constructor(e){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new Ue(16777215),this.specular=new Ue(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ue(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Ho,this.normalScale=new xe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=Os,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class rl extends pt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ue(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),t}}const Ur=new et,ol=new R,al=new R;class Jp{constructor(e){this.camera=e,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new xe(512,512),this.map=null,this.mapPass=null,this.matrix=new et,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new xr,this._frameExtents=new xe(1,1),this._viewportCount=1,this._viewports=[new ft(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;ol.setFromMatrixPosition(e.matrixWorld),t.position.copy(ol),al.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(al),t.updateMatrixWorld(),Ur.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Ur),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Ur)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class Zp extends Jp{constructor(){super(new Ss(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class ll extends rl{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(pt.DEFAULT_UP),this.updateMatrix(),this.target=new pt,this.shadow=new Zp}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class Qp extends rl{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class em{constructor(e,t,n=0,s=1/0){this.ray=new ss(e,t),this.near=n,this.far=s,this.camera=null,this.layers=new lr,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}intersectObject(e,t=!0,n=[]){return Nr(e,this,n,t),n.sort(cl),n}intersectObjects(e,t=!0,n=[]){for(let s=0,r=e.length;s<r;s++)Nr(e[s],this,n,t);return n.sort(cl),n}}function cl(i,e){return i.distance-e.distance}function Nr(i,e,t,n){if(i.layers.test(e.layers)&&i.raycast(e,t),n===!0){const s=i.children;for(let r=0,o=s.length;r<o;r++)Nr(s[r],e,t,!0)}}class hl{constructor(e=1,t=0,n=0){return this.radius=e,this.phi=t,this.theta=n,this}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=Math.max(1e-6,Math.min(Math.PI-1e-6,this.phi)),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(ut(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}class tm extends Fn{constructor(e=10,t=10,n=4473924,s=8947848){n=new Ue(n),s=new Ue(s);const r=t/2,o=e/t,a=e/2,l=[],c=[];for(let d=0,p=0,g=-a;d<=t;d++,g+=o){l.push(-a,0,g,a,0,g),l.push(g,0,-a,g,0,a);const x=d===r?n:s;x.toArray(c,p),p+=3,x.toArray(c,p),p+=3,x.toArray(c,p),p+=3,x.toArray(c,p),p+=3}const h=new St;h.setAttribute("position",new yt(l,3)),h.setAttribute("color",new yt(c,3));const u=new On({vertexColors:!0,toneMapped:!1});super(h,u),this.type="GridHelper"}dispose(){this.geometry.dispose(),this.material.dispose()}}class nm extends Fn{constructor(e=1){const t=[0,0,0,e,0,0,0,0,0,0,e,0,0,0,0,0,0,e],n=[1,0,0,1,.6,0,0,1,0,.6,1,0,0,0,1,0,.6,1],s=new St;s.setAttribute("position",new yt(t,3)),s.setAttribute("color",new yt(n,3));const r=new On({vertexColors:!0,toneMapped:!1});super(s,r),this.type="AxesHelper"}setColors(e,t,n){const s=new Ue,r=this.geometry.attributes.color.array;return s.set(e),s.toArray(r,0),s.toArray(r,3),s.set(t),s.toArray(r,6),s.toArray(r,9),s.set(n),s.toArray(r,12),s.toArray(r,15),this.geometry.attributes.color.needsUpdate=!0,this}dispose(){this.geometry.dispose(),this.material.dispose()}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Is}})),typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Is);const dl={type:"change"},Or={type:"start"},ul={type:"end"},As=new ss,fl=new rn,im=Math.cos(70*Zs.DEG2RAD);class sm extends En{constructor(e,t){super(),this.object=e,this.domElement=t,this.domElement.style.touchAction="none",this.enabled=!0,this.target=new R,this.cursor=new R,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Gn.ROTATE,MIDDLE:Gn.DOLLY,RIGHT:Gn.PAN},this.touches={ONE:Wn.ROTATE,TWO:Wn.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this.getPolarAngle=function(){return a.phi},this.getAzimuthalAngle=function(){return a.theta},this.getDistance=function(){return this.object.position.distanceTo(this.target)},this.listenToKeyEvents=function(A){A.addEventListener("keydown",Ce),this._domElementKeyEvents=A},this.stopListenToKeyEvents=function(){this._domElementKeyEvents.removeEventListener("keydown",Ce),this._domElementKeyEvents=null},this.saveState=function(){n.target0.copy(n.target),n.position0.copy(n.object.position),n.zoom0=n.object.zoom},this.reset=function(){n.target.copy(n.target0),n.object.position.copy(n.position0),n.object.zoom=n.zoom0,n.object.updateProjectionMatrix(),n.dispatchEvent(dl),n.update(),r=s.NONE},this.update=function(){const A=new R,se=new wn().setFromUnitVectors(e.up,new R(0,1,0)),ye=se.clone().invert(),pe=new R,ie=new wn,P=new R,re=2*Math.PI;return function(Le=null){const Ee=n.object.position;A.copy(Ee).sub(n.target),A.applyQuaternion(se),a.setFromVector3(A),n.autoRotate&&r===s.NONE&&X(M(Le)),n.enableDamping?(a.theta+=l.theta*n.dampingFactor,a.phi+=l.phi*n.dampingFactor):(a.theta+=l.theta,a.phi+=l.phi);let Xe=n.minAzimuthAngle,je=n.maxAzimuthAngle;isFinite(Xe)&&isFinite(je)&&(Xe<-Math.PI?Xe+=re:Xe>Math.PI&&(Xe-=re),je<-Math.PI?je+=re:je>Math.PI&&(je-=re),Xe<=je?a.theta=Math.max(Xe,Math.min(je,a.theta)):a.theta=a.theta>(Xe+je)/2?Math.max(Xe,a.theta):Math.min(je,a.theta)),a.phi=Math.max(n.minPolarAngle,Math.min(n.maxPolarAngle,a.phi)),a.makeSafe(),n.enableDamping===!0?n.target.addScaledVector(h,n.dampingFactor):n.target.add(h),n.target.sub(n.cursor),n.target.clampLength(n.minTargetRadius,n.maxTargetRadius),n.target.add(n.cursor),n.zoomToCursor&&C||n.object.isOrthographicCamera?a.radius=Z(a.radius):a.radius=Z(a.radius*c),A.setFromSpherical(a),A.applyQuaternion(ye),Ee.copy(n.target).add(A),n.object.lookAt(n.target),n.enableDamping===!0?(l.theta*=1-n.dampingFactor,l.phi*=1-n.dampingFactor,h.multiplyScalar(1-n.dampingFactor)):(l.set(0,0,0),h.set(0,0,0));let nt=!1;if(n.zoomToCursor&&C){let st=null;if(n.object.isPerspectiveCamera){const qe=A.length();st=Z(qe*c);const ct=qe-st;n.object.position.addScaledVector(w,ct),n.object.updateMatrixWorld()}else if(n.object.isOrthographicCamera){const qe=new R(L.x,L.y,0);qe.unproject(n.object),n.object.zoom=Math.max(n.minZoom,Math.min(n.maxZoom,n.object.zoom/c)),n.object.updateProjectionMatrix(),nt=!0;const ct=new R(L.x,L.y,0);ct.unproject(n.object),n.object.position.sub(ct).add(qe),n.object.updateMatrixWorld(),st=A.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),n.zoomToCursor=!1;st!==null&&(this.screenSpacePanning?n.target.set(0,0,-1).transformDirection(n.object.matrix).multiplyScalar(st).add(n.object.position):(As.origin.copy(n.object.position),As.direction.set(0,0,-1).transformDirection(n.object.matrix),Math.abs(n.object.up.dot(As.direction))<im?e.lookAt(n.target):(fl.setFromNormalAndCoplanarPoint(n.object.up,n.target),As.intersectPlane(fl,n.target))))}else n.object.isOrthographicCamera&&(n.object.zoom=Math.max(n.minZoom,Math.min(n.maxZoom,n.object.zoom/c)),n.object.updateProjectionMatrix(),nt=!0);return c=1,C=!1,nt||pe.distanceToSquared(n.object.position)>o||8*(1-ie.dot(n.object.quaternion))>o||P.distanceToSquared(n.target)>0?(n.dispatchEvent(dl),pe.copy(n.object.position),ie.copy(n.object.quaternion),P.copy(n.target),!0):!1}}(),this.dispose=function(){n.domElement.removeEventListener("contextmenu",$e),n.domElement.removeEventListener("pointerdown",E),n.domElement.removeEventListener("pointercancel",B),n.domElement.removeEventListener("wheel",q),n.domElement.removeEventListener("pointermove",y),n.domElement.removeEventListener("pointerup",B),n._domElementKeyEvents!==null&&(n._domElementKeyEvents.removeEventListener("keydown",Ce),n._domElementKeyEvents=null)};const n=this,s={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6};let r=s.NONE;const o=1e-6,a=new hl,l=new hl;let c=1;const h=new R,u=new xe,d=new xe,p=new xe,g=new xe,x=new xe,m=new xe,f=new xe,S=new xe,_=new xe,w=new R,L=new xe;let C=!1;const T=[],W={};let v=!1;function M(A){return A!==null?2*Math.PI/60*n.autoRotateSpeed*A:2*Math.PI/60/60*n.autoRotateSpeed}function I(A){const se=Math.abs(A*.01);return Math.pow(.95,n.zoomSpeed*se)}function X(A){l.theta-=A}function J(A){l.phi-=A}const D=function(){const A=new R;return function(ye,pe){A.setFromMatrixColumn(pe,0),A.multiplyScalar(-ye),h.add(A)}}(),U=function(){const A=new R;return function(ye,pe){n.screenSpacePanning===!0?A.setFromMatrixColumn(pe,1):(A.setFromMatrixColumn(pe,0),A.crossVectors(n.object.up,A)),A.multiplyScalar(ye),h.add(A)}}(),k=function(){const A=new R;return function(ye,pe){const ie=n.domElement;if(n.object.isPerspectiveCamera){const P=n.object.position;A.copy(P).sub(n.target);let re=A.length();re*=Math.tan(n.object.fov/2*Math.PI/180),D(2*ye*re/ie.clientHeight,n.object.matrix),U(2*pe*re/ie.clientHeight,n.object.matrix)}else n.object.isOrthographicCamera?(D(ye*(n.object.right-n.object.left)/n.object.zoom/ie.clientWidth,n.object.matrix),U(pe*(n.object.top-n.object.bottom)/n.object.zoom/ie.clientHeight,n.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),n.enablePan=!1)}}();function K(A){n.object.isPerspectiveCamera||n.object.isOrthographicCamera?c/=A:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),n.enableZoom=!1)}function Y(A){n.object.isPerspectiveCamera||n.object.isOrthographicCamera?c*=A:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),n.enableZoom=!1)}function $(A,se){if(!n.zoomToCursor)return;C=!0;const ye=n.domElement.getBoundingClientRect(),pe=A-ye.left,ie=se-ye.top,P=ye.width,re=ye.height;L.x=pe/P*2-1,L.y=-(ie/re)*2+1,w.set(L.x,L.y,1).unproject(n.object).sub(n.object.position).normalize()}function Z(A){return Math.max(n.minDistance,Math.min(n.maxDistance,A))}function ee(A){u.set(A.clientX,A.clientY)}function z(A){$(A.clientX,A.clientX),f.set(A.clientX,A.clientY)}function O(A){g.set(A.clientX,A.clientY)}function Q(A){d.set(A.clientX,A.clientY),p.subVectors(d,u).multiplyScalar(n.rotateSpeed);const se=n.domElement;X(2*Math.PI*p.x/se.clientHeight),J(2*Math.PI*p.y/se.clientHeight),u.copy(d),n.update()}function oe(A){S.set(A.clientX,A.clientY),_.subVectors(S,f),_.y>0?K(I(_.y)):_.y<0&&Y(I(_.y)),f.copy(S),n.update()}function ue(A){x.set(A.clientX,A.clientY),m.subVectors(x,g).multiplyScalar(n.panSpeed),k(m.x,m.y),g.copy(x),n.update()}function he(A){$(A.clientX,A.clientY),A.deltaY<0?Y(I(A.deltaY)):A.deltaY>0&&K(I(A.deltaY)),n.update()}function Te(A){let se=!1;switch(A.code){case n.keys.UP:A.ctrlKey||A.metaKey||A.shiftKey?J(2*Math.PI*n.rotateSpeed/n.domElement.clientHeight):k(0,n.keyPanSpeed),se=!0;break;case n.keys.BOTTOM:A.ctrlKey||A.metaKey||A.shiftKey?J(-2*Math.PI*n.rotateSpeed/n.domElement.clientHeight):k(0,-n.keyPanSpeed),se=!0;break;case n.keys.LEFT:A.ctrlKey||A.metaKey||A.shiftKey?X(2*Math.PI*n.rotateSpeed/n.domElement.clientHeight):k(n.keyPanSpeed,0),se=!0;break;case n.keys.RIGHT:A.ctrlKey||A.metaKey||A.shiftKey?X(-2*Math.PI*n.rotateSpeed/n.domElement.clientHeight):k(-n.keyPanSpeed,0),se=!0;break}se&&(A.preventDefault(),n.update())}function we(A){if(T.length===1)u.set(A.pageX,A.pageY);else{const se=de(A),ye=.5*(A.pageX+se.x),pe=.5*(A.pageY+se.y);u.set(ye,pe)}}function ve(A){if(T.length===1)g.set(A.pageX,A.pageY);else{const se=de(A),ye=.5*(A.pageX+se.x),pe=.5*(A.pageY+se.y);g.set(ye,pe)}}function ke(A){const se=de(A),ye=A.pageX-se.x,pe=A.pageY-se.y,ie=Math.sqrt(ye*ye+pe*pe);f.set(0,ie)}function H(A){n.enableZoom&&ke(A),n.enablePan&&ve(A)}function lt(A){n.enableZoom&&ke(A),n.enableRotate&&we(A)}function Se(A){if(T.length==1)d.set(A.pageX,A.pageY);else{const ye=de(A),pe=.5*(A.pageX+ye.x),ie=.5*(A.pageY+ye.y);d.set(pe,ie)}p.subVectors(d,u).multiplyScalar(n.rotateSpeed);const se=n.domElement;X(2*Math.PI*p.x/se.clientHeight),J(2*Math.PI*p.y/se.clientHeight),u.copy(d)}function Re(A){if(T.length===1)x.set(A.pageX,A.pageY);else{const se=de(A),ye=.5*(A.pageX+se.x),pe=.5*(A.pageY+se.y);x.set(ye,pe)}m.subVectors(x,g).multiplyScalar(n.panSpeed),k(m.x,m.y),g.copy(x)}function _e(A){const se=de(A),ye=A.pageX-se.x,pe=A.pageY-se.y,ie=Math.sqrt(ye*ye+pe*pe);S.set(0,ie),_.set(0,Math.pow(S.y/f.y,n.zoomSpeed)),K(_.y),f.copy(S);const P=(A.pageX+se.x)*.5,re=(A.pageY+se.y)*.5;$(P,re)}function Ke(A){n.enableZoom&&_e(A),n.enablePan&&Re(A)}function Ae(A){n.enableZoom&&_e(A),n.enableRotate&&Se(A)}function E(A){n.enabled!==!1&&(T.length===0&&(n.domElement.setPointerCapture(A.pointerId),n.domElement.addEventListener("pointermove",y),n.domElement.addEventListener("pointerup",B)),ze(A),A.pointerType==="touch"?Oe(A):te(A))}function y(A){n.enabled!==!1&&(A.pointerType==="touch"?ne(A):F(A))}function B(A){De(A),T.length===0&&(n.domElement.releasePointerCapture(A.pointerId),n.domElement.removeEventListener("pointermove",y),n.domElement.removeEventListener("pointerup",B)),n.dispatchEvent(ul),r=s.NONE}function te(A){let se;switch(A.button){case 0:se=n.mouseButtons.LEFT;break;case 1:se=n.mouseButtons.MIDDLE;break;case 2:se=n.mouseButtons.RIGHT;break;default:se=-1}switch(se){case Gn.DOLLY:if(n.enableZoom===!1)return;z(A),r=s.DOLLY;break;case Gn.ROTATE:if(A.ctrlKey||A.metaKey||A.shiftKey){if(n.enablePan===!1)return;O(A),r=s.PAN}else{if(n.enableRotate===!1)return;ee(A),r=s.ROTATE}break;case Gn.PAN:if(A.ctrlKey||A.metaKey||A.shiftKey){if(n.enableRotate===!1)return;ee(A),r=s.ROTATE}else{if(n.enablePan===!1)return;O(A),r=s.PAN}break;default:r=s.NONE}r!==s.NONE&&n.dispatchEvent(Or)}function F(A){switch(r){case s.ROTATE:if(n.enableRotate===!1)return;Q(A);break;case s.DOLLY:if(n.enableZoom===!1)return;oe(A);break;case s.PAN:if(n.enablePan===!1)return;ue(A);break}}function q(A){n.enabled===!1||n.enableZoom===!1||r!==s.NONE||(A.preventDefault(),n.dispatchEvent(Or),he(ge(A)),n.dispatchEvent(ul))}function ge(A){const se=A.deltaMode,ye={clientX:A.clientX,clientY:A.clientY,deltaY:A.deltaY};switch(se){case 1:ye.deltaY*=16;break;case 2:ye.deltaY*=100;break}return A.ctrlKey&&!v&&(ye.deltaY*=10),ye}function ce(A){A.key==="Control"&&(v=!0,document.addEventListener("keyup",me,{passive:!0,capture:!0}))}function me(A){A.key==="Control"&&(v=!1,document.removeEventListener("keyup",me,{passive:!0,capture:!0}))}function Ce(A){n.enabled===!1||n.enablePan===!1||Te(A)}function Oe(A){switch(Me(A),T.length){case 1:switch(n.touches.ONE){case Wn.ROTATE:if(n.enableRotate===!1)return;we(A),r=s.TOUCH_ROTATE;break;case Wn.PAN:if(n.enablePan===!1)return;ve(A),r=s.TOUCH_PAN;break;default:r=s.NONE}break;case 2:switch(n.touches.TWO){case Wn.DOLLY_PAN:if(n.enableZoom===!1&&n.enablePan===!1)return;H(A),r=s.TOUCH_DOLLY_PAN;break;case Wn.DOLLY_ROTATE:if(n.enableZoom===!1&&n.enableRotate===!1)return;lt(A),r=s.TOUCH_DOLLY_ROTATE;break;default:r=s.NONE}break;default:r=s.NONE}r!==s.NONE&&n.dispatchEvent(Or)}function ne(A){switch(Me(A),r){case s.TOUCH_ROTATE:if(n.enableRotate===!1)return;Se(A),n.update();break;case s.TOUCH_PAN:if(n.enablePan===!1)return;Re(A),n.update();break;case s.TOUCH_DOLLY_PAN:if(n.enableZoom===!1&&n.enablePan===!1)return;Ke(A),n.update();break;case s.TOUCH_DOLLY_ROTATE:if(n.enableZoom===!1&&n.enableRotate===!1)return;Ae(A),n.update();break;default:r=s.NONE}}function $e(A){n.enabled!==!1&&A.preventDefault()}function ze(A){T.push(A.pointerId)}function De(A){delete W[A.pointerId];for(let se=0;se<T.length;se++)if(T[se]==A.pointerId){T.splice(se,1);return}}function Me(A){let se=W[A.pointerId];se===void 0&&(se=new xe,W[A.pointerId]=se),se.set(A.pageX,A.pageY)}function de(A){const se=A.pointerId===T[0]?T[1]:T[0];return W[se]}n.domElement.addEventListener("contextmenu",$e),n.domElement.addEventListener("pointerdown",E),n.domElement.addEventListener("pointercancel",B),n.domElement.addEventListener("wheel",q,{passive:!1}),document.addEventListener("keydown",ce,{passive:!0,capture:!0}),this.update()}}class rm extends pt{constructor(e=document.createElement("div")){super(),this.isCSS2DObject=!0,this.element=e,this.element.style.position="absolute",this.element.style.userSelect="none",this.element.setAttribute("draggable",!1),this.center=new xe(.5,.5),this.addEventListener("removed",function(){this.traverse(function(t){t.element instanceof Element&&t.element.parentNode!==null&&t.element.parentNode.removeChild(t.element)})})}copy(e,t){return super.copy(e,t),this.element=e.element.cloneNode(!0),this.center=e.center,this}}const yi=new R,pl=new et,ml=new et,gl=new R,xl=new R;class om{constructor(e={}){const t=this;let n,s,r,o;const a={objects:new WeakMap},l=e.element!==void 0?e.element:document.createElement("div");l.style.overflow="hidden",this.domElement=l,this.getSize=function(){return{width:n,height:s}},this.render=function(p,g){p.matrixWorldAutoUpdate===!0&&p.updateMatrixWorld(),g.parent===null&&g.matrixWorldAutoUpdate===!0&&g.updateMatrixWorld(),pl.copy(g.matrixWorldInverse),ml.multiplyMatrices(g.projectionMatrix,pl),c(p,p,g),d(p)},this.setSize=function(p,g){n=p,s=g,r=n/2,o=s/2,l.style.width=p+"px",l.style.height=g+"px"};function c(p,g,x){if(p.isCSS2DObject){yi.setFromMatrixPosition(p.matrixWorld),yi.applyMatrix4(ml);const m=p.visible===!0&&yi.z>=-1&&yi.z<=1&&p.layers.test(x.layers)===!0;if(p.element.style.display=m===!0?"":"none",m===!0){p.onBeforeRender(t,g,x);const S=p.element;S.style.transform="translate("+-100*p.center.x+"%,"+-100*p.center.y+"%)translate("+(yi.x*r+r)+"px,"+(-yi.y*o+o)+"px)",S.parentNode!==l&&l.appendChild(S),p.onAfterRender(t,g,x)}const f={distanceToCameraSquared:h(x,p)};a.objects.set(p,f)}for(let m=0,f=p.children.length;m<f;m++)c(p.children[m],g,x)}function h(p,g){return gl.setFromMatrixPosition(p.matrixWorld),xl.setFromMatrixPosition(g.matrixWorld),gl.distanceToSquared(xl)}function u(p){const g=[];return p.traverse(function(x){x.isCSS2DObject&&g.push(x)}),g}function d(p){const g=u(p).sort(function(m,f){if(m.renderOrder!==f.renderOrder)return f.renderOrder-m.renderOrder;const S=a.objects.get(m).distanceToCameraSquared,_=a.objects.get(f).distanceToCameraSquared;return S-_}),x=g.length;for(let m=0,f=g.length;m<f;m++)g[m].element.style.zIndex=x-m}}}const am={fps:0,frameTime:0,drawCalls:0,triangles:0,jsHeapMB:0},lm={name:"viridis",inverted:!1,range:[0,1]},_l={stage:"",progress:0,error:null};class cm{constructor(){this.state={dataset:null,activeView:"reservoir",selected:null,visibleObjectIds:new Set,property:null,timeStep:0,filters:[],colorMap:{...lm},loading:{..._l},metrics:{...am}},this.listeners=new Set}getState(){return this.state}subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}setState(e){this.state={...this.state,...e},this.listeners.forEach(t=>t(this.state))}setDataset(e){this.setState({dataset:e})}setActiveView(e){this.setState({activeView:e})}setSelection(e){this.setState({selected:e})}setProperty(e){this.setState({property:e})}setTimeStep(e){this.setState({timeStep:e})}addFilter(e){this.setState({filters:[...this.state.filters,e]})}setFilters(e){this.setState({filters:[...e]})}removeFilter(e){const t=[...this.state.filters];t.splice(e,1),this.setState({filters:t})}setColorMap(e){this.setState({colorMap:{...this.state.colorMap,...e}})}setLoading(e){this.setState({loading:{...this.state.loading,...e}})}setMetrics(e){this.setState({metrics:{...this.state.metrics,...e}})}toggleObjectVisibility(e){const t=new Set(this.state.visibleObjectIds);t.has(e)?t.delete(e):t.add(e),this.setState({visibleObjectIds:t})}reset(){this.setState({dataset:null,selected:null,visibleObjectIds:new Set,property:null,timeStep:0,filters:[],loading:{..._l}})}}const Qe=new cm,zn=class zn{constructor(e,t){this.currentView="reservoir",this.tabs=new Map,this.container=e,this.onChange=t||null}switchTo(e){var t;this.currentView=e,Qe.setActiveView(e);for(const[n,s]of this.tabs)s.style.background=n===e?"rgba(31,111,235,.28)":"rgba(22,27,34,0.6)",s.style.color=n===e?"#e6edf3":"#8b949e",s.setAttribute("aria-selected",String(n===e));(t=this.onChange)==null||t.call(this,e)}getActiveView(){return this.currentView}createTabs(){const e=document.createElement("div");Object.assign(e.style,{position:"absolute",top:"0",left:"280px",display:"flex",gap:"0",zIndex:"50"});for(const t of zn.VIEWS){const n=document.createElement("div");n.textContent=zn.VIEW_LABELS[t],Object.assign(n.style,{padding:"8px 16px",cursor:"pointer",background:"rgba(22,27,34,0.6)",border:"1px solid #30363d",borderRadius:"6px 6px 0 0",color:"#8b949e",fontSize:"13px",fontFamily:"-apple-system, sans-serif",userSelect:"none"}),n.addEventListener("click",()=>this.switchTo(t)),n.addEventListener("mouseenter",()=>{n.style.background="rgba(88,166,255,0.15)"}),n.addEventListener("mouseleave",()=>{const s=this.currentView===t;n.style.background=s?"rgba(31,111,235,.28)":"rgba(22,27,34,0.6)",n.style.color=s?"#e6edf3":"#8b949e"}),e.appendChild(n),this.tabs.set(t,n)}return this.switchTo(this.currentView),e}};zn.VIEW_LABELS={reservoir:"储层 3D",wellbore:"井筒 3D",intersection:"剖面",welllog:"测井",network:"管网",benchmark:"基准测试"},zn.VIEWS=Object.keys(zn.VIEW_LABELS);let Bi=zn;const vl=new Map;function hm(i,e){if(!i.trim())throw new Error("Rendering engine id must not be empty");vl.set(i,e)}function dm(i,e){const t=vl.get(i.id);if(!t)throw new Error(`Rendering engine is not registered: ${i.id}`);return t(e)}const yl={id:"three-reservoir",name:"Three.js Reservoir Engine",create(i){return dm(yl,i)}};function um(i,e){const t=yl.create({container:i,...e});return{executeCommand:(n,s)=>t.executeCommand?t.executeCommand(n,s):Promise.reject(new Error("Viewer command execution unavailable")),dispose(){t.dispose(),Qe.reset()},update(n){var s;(s=t.update)==null||s.call(t,n)}}}const Si={viridis:[[.267,.005,.329],[.282,.14,.457],[.254,.265,.53],[.207,.372,.553],[.164,.471,.558],[.138,.567,.55],[.135,.659,.518],[.157,.745,.467],[.215,.813,.398],[.35,.851,.333],[.536,.851,.261],[.737,.813,.185],[.921,.737,.089],[.993,.906,.144]],plasma:[[.051,.028,.528],[.184,.039,.606],[.31,.02,.653],[.431,.004,.678],[.55,.02,.682],[.665,.058,.662],[.773,.137,.616],[.867,.249,.541],[.937,.379,.448],[.98,.516,.345],[.993,.651,.25],[.969,.772,.169],[.921,.873,.102],[.886,.961,.09]],turbo:[[.189,0,.381],[.34,.06,.59],[.47,.08,.87],[.53,.22,.93],[.55,.34,.97],[.56,.45,.96],[.57,.55,.94],[.59,.65,.9],[.62,.73,.83],[.68,.8,.74],[.77,.86,.62],[.87,.91,.48],[.98,.95,.33],[.99,.98,.15]],rainbow:[[0,0,.515],[0,0,1],[0,1,1],[0,1,0],[1,1,0],[1,0,0],[.5,0,0]],gray:[[.1,.1,.1],[.3,.3,.3],[.5,.5,.5],[.7,.7,.7],[.9,.9,.9]]},fm=Object.keys(Si);function Fr(i,e){const t=Si[i]||Si.viridis,s=Math.max(0,Math.min(1,e))*(t.length-1),r=Math.floor(s),o=Math.min(t.length-1,r+1),a=s-r;return[t[r][0]+(t[o][0]-t[r][0])*a,t[r][1]+(t[o][1]-t[r][1])*a,t[r][2]+(t[o][2]-t[r][2])*a]}function pm(i){const e=Si[i]||Si.viridis;return"linear-gradient(90deg,"+e.map((n,s)=>{const r=s/Math.max(e.length-1,1)*100,o=Math.round(n[0]*255),a=Math.round(n[1]*255),l=Math.round(n[2]*255);return"rgb("+o+","+a+","+l+") "+r+"%"}).join(",")+")"}const At={treeWidth:256,treeCollapsed:36,inspectorWidth:300,inspectorCollapsed:36,slicePlayerHeight:32};function mm(i,e){return{left:i?At.treeCollapsed:At.treeWidth,right:e?At.inspectorCollapsed:At.inspectorWidth}}function gm(i){var l,c,h,u;const{left:e,right:t}=mm(i.treeCollapsed,i.inspectorCollapsed),n=8,s=`${e+n}px`,r=`${t+n}px`,o=8,a=At.slicePlayerHeight;i.tree.style.left="0",i.tree.style.right="auto",i.tree.style.width=`${i.treeCollapsed?At.treeCollapsed:At.treeWidth}px`,i.inspector.style.left="auto",i.inspector.style.right="0",i.inspector.style.width=`${i.inspectorCollapsed?At.inspectorCollapsed:At.inspectorWidth}px`,(l=i.toolbar)==null||l.style.setProperty("left",s),(c=i.toolbar)==null||c.style.setProperty("right",r),(h=i.tabs)==null||h.style.setProperty("left",s),(u=i.tabs)==null||u.style.setProperty("right",r),i.slicePlayer&&(i.slicePlayer.style.left=s,i.slicePlayer.style.right=r,i.slicePlayer.style.bottom=`${o}px`),i.info&&(i.info.style.left=s,i.info.style.right="auto",i.info.style.bottom=`${o+a+6}px`),i.wellMap&&(i.wellMap.style.left=s,i.wellMap.style.bottom=`${o+a+28}px`),i.viewCluster&&(i.viewCluster.style.left=s,i.viewCluster.style.top="88px"),i.compass&&(i.compass.style.left="auto",i.compass.style.right=r,i.compass.style.bottom=`${o+a+6}px`),i.readout&&(i.readout.style.right=r,i.readout.style.bottom=`${o+a+86}px`,i.readout.style.left="auto"),i.hud&&(i.hud.style.right=r,i.hud.style.top="88px",i.hud.style.left="auto"),i.legend&&(i.legend.style.right=r,i.legend.style.bottom="250px",i.legend.style.left="auto"),i.histogram&&(i.histogram.style.right=r,i.histogram.style.bottom="188px",i.histogram.style.left="auto"),i.details&&(i.details.style.right=r,i.details.style.bottom="120px",i.details.style.left="auto",i.details.style.width="270px"),i.wellLog&&(i.wellLog.style.right=r,i.wellLog.style.top="88px",i.wellLog.style.bottom="16px"),i.shortcuts&&(i.shortcuts.style.left=s)}const xm=new Set(["wellbore","las","dlis","well","trajectory"]);function _m(i){return xm.has(i||"")}function Sl(i){if(!_m(i.source))return null;const e=i.metadata||{};return e.placement==="spatial"||e.spatial===!0?"spatial":e.placement==="depth-only"||e.spatial===!1||i.source==="las"||i.source==="dlis"?"depth-only":"spatial"}function at(i){return Sl(i)==="spatial"}function Ut(i){return Sl(i)==="depth-only"}const vm=new Set(["las","dlis","network","network-tube","wellbore","well","trajectory","surface","intersection","well-intersection","slice"]);function Bn(i){return i.grid_dims&&i.grid_dims.length>=3?!0:!vm.has(i.source||"")}function an(i){const e=i.metadata||{};return typeof e.well_name=="string"&&e.well_name.trim()?e.well_name.trim():i.name.replace(/^Well:\s*/i,"").replace(/\s*\([^)]*\)\s*$/,"").trim()||i.id}function ym(i,e=256){if(i.length<=e)return i;const t=i.length-1,n=[];for(let s=0;s<e-1;s++)n.push(i[Math.round(s*t/(e-1))]);return n.push(i[t]),n}function Br(i,e=1e-4){const t=[],n=e*e;for(let s=0;s+2<i.length;s+=3){const r=[i[s],i[s+1],i[s+2]];if(!r.every(Number.isFinite))continue;const o=t[t.length-1];if(!o){t.push(r);continue}const a=r[0]-o[0],l=r[1]-o[1],c=r[2]-o[2];a*a+l*l+c*c>n&&t.push(r)}return t}function Sm(i){if(i.length<2)return 2;let e=0,t=i[0][0],n=i[0][0],s=i[0][1],r=i[0][1],o=i[0][2],a=i[0][2];for(let c=1;c<i.length;c++){const[h,u,d]=i[c],[p,g,x]=i[c-1],m=h-p,f=u-g,S=d-x;e+=Math.sqrt(m*m+f*f+S*S),t=Math.min(t,h),n=Math.max(n,h),s=Math.min(s,u),r=Math.max(r,u),o=Math.min(o,d),a=Math.max(a,d)}const l=Math.max(n-t,r-s,a-o,e,1);return Math.min(Math.max(l*.004,1.5),80)}const bl=[{id:"grids",title:"网格"},{id:"wells",title:"井"},{id:"logs",title:"测井"},{id:"surfaces",title:"层面 / 剖面"},{id:"networks",title:"管网"}];function bm(i){if(Bn(i))return"grids";if(at(i))return"wells";if(Ut(i))return"logs";const e=i.source||"";return["surface","intersection","well-intersection","slice"].includes(e)?"surfaces":["network","network-tube"].includes(e)?"networks":"other"}function Mm(i,e){var s;const t=e.trim().toLowerCase();if(!t)return!0;const n=typeof((s=i.metadata)==null?void 0:s.well_name)=="string"?i.metadata.well_name:"";return[i.id,i.name,n,i.source||"",an(i)].join(" ").toLowerCase().includes(t)}function bi(i){return at(i)||Ut(i)?an(i):i.name}function Em(i,e,t){var a;i.innerHTML="";const n=e.filter(l=>Mm(l,t.query)),s=new Map;for(const l of bl)s.set(l.id,[]);s.set("other",[]);for(const l of n){const c=bm(l);(a=s.get(c))==null||a.push(l)}let r=0;for(const l of bl){const c=s.get(l.id)||[];t.query.trim()&&c.length===0||(r+=c.length,i.appendChild(Ml(l.id,l.title,c,t)))}const o=s.get("other")||[];if(o.length>0&&(r+=o.length,i.appendChild(Ml("other","其他",o,t))),r===0){const l=document.createElement("div");l.textContent=t.query.trim()?"没有匹配的对象":"暂无对象",l.style.cssText="padding:10px 8px;color:#484f58;",i.appendChild(l)}}function Ml(i,e,t,n){const s=n.collapsedGroups.has(i),r=document.createElement("div");r.dataset.groupId=i,r.style.cssText="margin-bottom:6px;";const o=document.createElement("button");o.type="button",o.style.cssText=["display:flex;align-items:center;gap:6px;width:100%;","background:transparent;border:0;color:#8b949e;cursor:pointer;","font:600 11px/1.2 -apple-system,sans-serif;letter-spacing:.04em;","padding:6px 4px;text-align:left;"].join("");const a=document.createElement("span");a.textContent=s?">":"v",a.style.cssText="width:10px;color:#6e7681;";const l=document.createElement("span");l.textContent=e.toUpperCase();const c=document.createElement("span");if(c.textContent=String(t.length),c.style.cssText="margin-left:auto;color:#484f58;font-weight:500;",o.append(a,l,c),o.addEventListener("click",()=>n.onToggleGroup(i)),r.appendChild(o),s)return r;if(t.length===0){const h=document.createElement("div");return h.textContent="空",h.style.cssText="padding:2px 8px 8px 22px;color:#484f58;font-size:11px;",r.appendChild(h),r}for(const h of t)r.appendChild(Tm(h,n));return r}function Tm(i,e){const t=document.createElement("div"),n=i.id===e.activeId,s=i.id===e.selectedId,r=Ut(i);t.dataset.datasetId=i.id,t.dataset.selected=String(s||n),t.style.cssText=["display:flex;align-items:flex-start;gap:6px;","padding:5px 6px 5px 8px;margin:1px 0;border-radius:5px;cursor:pointer;",s||n?"background:rgba(31,111,235,.22);color:#e6edf3;":"background:transparent;color:#8b949e;",s||n?"box-shadow:inset 2px 0 #58a6ff;":"box-shadow:none;"].join("");const o=document.createElement("input");o.type="checkbox",o.checked=e.visibleIds.has(i.id),o.style.cssText="margin:3px 0 0;flex:0 0 auto;",r?(o.checked=!1,o.disabled=!0,o.title="纯深度测井无法在三维视图显示"):o.title="显示/隐藏 "+bi(i),o.setAttribute("aria-label","显示/隐藏 "+bi(i)),o.addEventListener("click",h=>h.stopPropagation()),o.addEventListener("change",()=>e.onToggleVisible(i,o.checked));const a=document.createElement("div");a.style.cssText="min-width:0;flex:1;";const l=document.createElement("div");l.textContent=r?bi(i)+"（仅深度）":bi(i),l.style.cssText="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12px;line-height:1.3;";const c=document.createElement("div");if(c.textContent=wm(i),c.style.cssText="color:#6e7681;font-size:10px;margin-top:1px;",a.append(l,c),t.append(o,a),e.onDelete){const h=document.createElement("button");h.type="button",h.textContent="×",h.title="移除 "+bi(i),h.setAttribute("aria-label","移除 "+bi(i)),h.style.cssText="flex:0 0 auto;width:18px;height:18px;margin-top:2px;padding:0;border:0;background:transparent;color:#6e7681;cursor:pointer;font-size:14px;line-height:18px;",h.addEventListener("click",u=>{u.stopPropagation(),e.onDelete(i)}),h.addEventListener("mouseenter",()=>{h.style.color="#f85149"}),h.addEventListener("mouseleave",()=>{h.style.color="#6e7681"}),t.appendChild(h)}return t.title=r?i.name+" · 仅深度，打开「测井」页签":i.name+" · "+i.n_cells.toLocaleString()+" cells",t.addEventListener("click",()=>e.onSelect(i)),t.addEventListener("dblclick",h=>{h.preventDefault(),e.onFocus(i)}),t.addEventListener("contextmenu",h=>{var u;h.preventDefault(),h.stopPropagation(),(u=e.onContextMenu)==null||u.call(e,i,h)}),t.addEventListener("mouseenter",()=>{t.dataset.selected!=="true"&&(t.style.color="#58a6ff")}),t.addEventListener("mouseleave",()=>{t.dataset.selected!=="true"&&(t.style.color="#8b949e")}),t}function wm(i){return Ut(i)?"测井曲线":at(i)?"井轨迹":i.grid_dims&&i.grid_dims.length>=3?i.grid_dims[0]+" x "+i.grid_dims[1]+" x "+i.grid_dims[2]:i.n_cells>0?i.n_cells.toLocaleString()+" cells":i.source||"对象"}const Cs=18;function El(i,e){let t=1/0,n=1/0,s=-1/0,r=-1/0;const o=(a,l)=>{!Number.isFinite(a)||!Number.isFinite(l)||(t=Math.min(t,a),n=Math.min(n,l),s=Math.max(s,a),r=Math.max(r,l))};for(const a of i){o(a.x,a.y);for(const[l,c]of a.path||[])o(l,c)}return e&&(o(e.minX,e.minY),o(e.maxX,e.maxY)),Number.isFinite(t)?(s-t<1&&(t-=250,s+=250),r-n<1&&(n-=250,r+=250),{minX:t,minY:n,maxX:s,maxY:r}):null}function Tl(i,e,t){const n=Math.max(i.maxX-i.minX,1),s=Math.max(i.maxY-i.minY,1),r=Math.max(e-Cs*2,1),o=Math.max(t-Cs*2,1),a=Math.min(r/n,o/s),l=Cs+(r-n*a)/2,c=Cs+(o-s*a)/2;return{toPixel(h,u){return[l+(h-i.minX)*a,t-(c+(u-i.minY)*a)]},fromPixel(h,u){return[i.minX+(h-l)/a,i.minY+(t-u-c)/a]}}}function Am(i,e,t,n,s,r,o=14){const a=Tl(e,t,n);let l=null,c=o*o;for(const h of i){const[u,d]=a.toPixel(h.x,h.y),p=u-s,g=d-r,x=p*p+g*g;x<=c&&(c=x,l=h.id)}return l}function Cm(){const i=document.createElement("div");i.className="oilgas-well-map",Object.assign(i.style,{position:"absolute",width:"228px",height:"176px",background:"rgba(13,17,23,.92)",border:"1px solid #30363d",borderRadius:"8px",zIndex:"16",overflow:"hidden",boxSizing:"border-box"});const e=document.createElement("div");e.textContent="井位平面图",e.style.cssText="position:absolute;top:6px;left:8px;font:600 11px/1 -apple-system,sans-serif;color:#8b949e;pointer-events:none;",i.appendChild(e);const t=document.createElement("canvas");return t.width=228,t.height=176,t.style.cssText="display:block;width:100%;height:100%;cursor:pointer;",t.title="点击井位以选中并聚焦",i.appendChild(t),{root:i,canvas:t}}function Rm(i,e,t,n){const s=i.getContext("2d");if(!s)return;const r=i.width,o=i.height;s.clearRect(0,0,r,o),s.fillStyle="#0d1117",s.fillRect(0,0,r,o);const a=El(e,n);if(!a){s.fillStyle="#484f58",s.font="11px sans-serif",s.fillText("暂无井位",16,o/2);return}const l=Tl(a,r,o);if(n){const[c,h]=l.toPixel(n.minX,n.minY),[u,d]=l.toPixel(n.maxX,n.maxY);s.strokeStyle="#30363d",s.lineWidth=1,s.strokeRect(Math.min(c,u),Math.min(h,d),Math.abs(u-c),Math.abs(d-h))}s.lineWidth=1.4;for(const c of e){const h=c.id===t;c.path&&c.path.length>1&&(s.beginPath(),c.path.forEach(([p,g],x)=>{const[m,f]=l.toPixel(p,g);x===0?s.moveTo(m,f):s.lineTo(m,f)}),s.strokeStyle=h?"#ffd166":"#6e7681",s.stroke());const[u,d]=l.toPixel(c.x,c.y);s.beginPath(),s.arc(u,d,h?5:3.5,0,Math.PI*2),s.fillStyle=h?"#ffd166":"#58a6ff",s.fill(),(h||e.length<=12)&&(s.fillStyle=h?"#e6edf3":"#8b949e",s.font="10px sans-serif",s.fillText(c.name,u+7,d+3))}}function Lm(){const i=document.createElement("div");return i.className="oilgas-readout",Object.assign(i.style,{position:"absolute",minWidth:"210px",maxWidth:"280px",background:"rgba(13,17,23,.92)",border:"1px solid #30363d",borderRadius:"8px",padding:"8px 10px",fontFamily:"ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",fontSize:"11px",color:"#c9d1d9",pointerEvents:"none",zIndex:"18",boxSizing:"border-box"}),i.innerHTML=['<div style="color:#8b949e;font:600 10px/1 -apple-system,sans-serif;letter-spacing:.06em;margin-bottom:6px;">SELECTED</div>','<div data-readout="selected" style="color:#e6edf3;font-weight:600;margin-bottom:2px;">—</div>','<div data-readout="meta" style="color:#8b949e;margin-bottom:8px;">将指针移到场景中拾取</div>','<div style="color:#8b949e;font:600 10px/1 -apple-system,sans-serif;letter-spacing:.06em;margin-bottom:6px;">READOUT</div>',kr("Easting","easting"),kr("Northing","northing"),kr("TVD","tvd")].join(""),i}function kr(i,e){return['<div style="display:flex;justify-content:space-between;gap:12px;margin:2px 0;">','<span style="color:#8b949e;">'+i+"</span>",'<span data-readout="'+e+'" style="color:#58a6ff;font-weight:600;">—</span>',"</div>"].join("")}function Pm(i,e){const t=i.querySelector('[data-readout="selected"]'),n=i.querySelector('[data-readout="meta"]');t&&(t.textContent=e.selectedLabel||"—"),n&&(n.textContent=e.selectedMeta||(e.pickKind?e.pickKind:"未选中对象"));const s=e.hover;zr(i,"easting",s?Hr(s[0]):"—"),zr(i,"northing",s?Hr(s[1]):"—"),zr(i,"tvd",s?Hr(s[2]):"—")}function zr(i,e,t){const n=i.querySelector('[data-readout="'+e+'"]');n&&(n.textContent=t)}function Hr(i){if(!Number.isFinite(i))return"—";const e=Math.abs(i);return e>=1e3?i.toFixed(1):e>=1?i.toFixed(2):i.toPrecision(4)}const wl=[{id:"controls",label:"Controls"},{id:"actions",label:"Actions"},{id:"addons",label:"Addons"}];function Dm(i){let e="controls";const t=document.createElement("div");t.className="oilgas-inspector-tabs",t.style.cssText=["display:flex;gap:4px;padding:0 0 8px;margin:0 0 8px;","border-bottom:1px solid #30363d;flex:0 0 auto;"].join("");const n={},s=new Map,r=new Map,o=()=>{for(const l of wl){const c=l.id===e,h=s.get(l.id),u=n[l.id];h&&(h.style.background=c?"rgba(31,111,235,.32)":"transparent",h.style.color=c?"#e6edf3":"#8b949e",h.setAttribute("aria-selected",String(c))),u&&(u.style.display=c?"block":"none")}};for(const l of wl){const c=document.createElement("button");c.type="button",c.dataset.tab=l.id,c.setAttribute("role","tab"),c.title=l.label,c.style.cssText=["flex:1;display:flex;align-items:center;justify-content:center;gap:6px;","padding:6px 4px;border:1px solid #30363d;border-radius:6px;","background:transparent;color:#8b949e;cursor:pointer;","font:600 11px/1 -apple-system,sans-serif;"].join("");const h=document.createElement("span");h.textContent=l.label;const u=document.createElement("span");u.dataset.badge=l.id,u.style.cssText=["min-width:16px;padding:1px 5px;border-radius:999px;","background:#21262d;color:#8b949e;font:600 10px/1.4 monospace;"].join(""),u.textContent="0",c.append(h,u),c.addEventListener("click",()=>{e=l.id,o()}),t.appendChild(c),s.set(l.id,c),r.set(l.id,u);const d=document.createElement("div");d.dataset.inspectorPane=l.id,d.style.cssText="display:none;padding-bottom:8px;",n[l.id]=d}const a=document.createElement("div");return a.className="oilgas-inspector-footer",a.style.cssText=["flex:0 0 auto;display:flex;align-items:center;gap:6px;","padding-top:8px;margin-top:8px;border-top:1px solid #30363d;"].join(""),o(),{tabBar:t,panes:n,footer:a,setTab:l=>{e=l,o()},setBadge:(l,c)=>{const h=r.get(l);h&&(h.textContent=String(c))},active:()=>e}}function Vr(){const i=document.createElement("div");i.style.cssText="display:flex;flex-direction:column;gap:0;";const e=document.createElement("div");e.style.cssText=["display:grid;grid-template-columns:42% 1fr;gap:8px;","padding:4px 2px 6px;color:#6e7681;font:600 10px/1 -apple-system,sans-serif;","letter-spacing:.06em;text-transform:uppercase;border-bottom:1px solid #21262d;"].join("");const t=document.createElement("div");t.textContent="Name";const n=document.createElement("div");n.textContent="Control",e.append(t,n);const s=document.createElement("div");return i.append(e,s),{table:i,body:s}}function We(i,e,t){const n=document.createElement("div");n.style.cssText=["display:grid;grid-template-columns:42% 1fr;gap:8px;align-items:center;","padding:7px 2px;border-bottom:1px solid rgba(48,54,61,.45);"].join("");const s=document.createElement("div");s.textContent=e,s.style.cssText="color:#8b949e;font-size:11px;word-break:break-word;";const r=document.createElement("div");return r.style.minWidth="0",r.appendChild(t),n.append(s,r),i.appendChild(n),n}function Nt(i,e,t){const n=document.createElement("div");n.style.cssText="display:flex;border:1px solid #30363d;border-radius:5px;overflow:hidden;height:24px;";const s=document.createElement("input");s.type="checkbox",s.id=i,s.checked=e,s.style.cssText="position:absolute;opacity:0;width:0;height:0;";const r=Al("False"),o=Al("True"),a=()=>{const c=s.checked;r.style.background=c?"transparent":"#1f6feb",r.style.color=c?"#8b949e":"#fff",o.style.background=c?"#1f6feb":"transparent",o.style.color=c?"#fff":"#8b949e"},l=c=>{s.checked=c,a(),t(c)};return r.addEventListener("click",()=>l(!1)),o.addEventListener("click",()=>l(!0)),s.addEventListener("change",()=>{a(),t(s.checked)}),s.addEventListener("ugsci-sync",()=>a()),n.append(s,r,o),a(),n}function Al(i){const e=document.createElement("button");return e.type="button",e.textContent=i,e.style.cssText=["flex:1;border:0;background:transparent;color:#8b949e;cursor:pointer;","font:600 11px/24px -apple-system,sans-serif;padding:0;"].join(""),e}function bt(i,e){const t=(e==null?void 0:e.tone)||"default",n=document.createElement("button");n.type="button",n.textContent=i;const s={default:{bg:"#30363d",fg:"#c9d1d9",bd:"#484f58"},primary:{bg:"#1f6feb",fg:"#fff",bd:"#388bfd"},danger:{bg:"#da3633",fg:"#fff",bd:"#f85149"}}[t];return Object.assign(n.style,{width:"100%",padding:"7px",background:s.bg,color:s.fg,border:"1px solid "+s.bd,borderRadius:"6px",cursor:"pointer",fontSize:"12px",marginBottom:"8px"}),n}const Cl=["egrid","grid","grdecl","init","unrst","roff","roffbin","dat","sr3","irf","data","model","tnav","tpr","las","las3","dlis","vtk","vtu","pvtu","vti","xdmf","csv","arrow","parquet","json"],Rl=["egrid","grid","grdecl","roff","roffbin","dat","sr3","data","model","tnav","tpr","las","las3","dlis","vtk","vtu","pvtu","vti","xdmf","csv","arrow","parquet","json"];function Gr(i){const e=i.trim(),t=e.lastIndexOf(".");return t<0||t===e.length-1?"":e.slice(t+1).toLowerCase()}function Ll(i){return Cl.includes(Gr(i))}function Im(){return Cl.map(i=>`.${i}`).join(",")}function Um(i){const e=Array.from(i).filter(n=>Ll(n.name));if(e.length===0)return null;const t=[...e].sort((n,s)=>{const r=Rl.indexOf(Gr(n.name)),o=Rl.indexOf(Gr(s.name));return(r<0?99:r)-(o<0?99:o)});return{primary:t[0],companion:t[1],extra:t.slice(2)}}async function Pl(i,e){var o,a,l;const t=(o=window.QwenPaw)==null?void 0:o.host;if(t!=null&&t.fetch)return t.fetch(i,e);const n=((a=t==null?void 0:t.getApiUrl)==null?void 0:a.call(t,i.replace(/^\//,"")))||i,s=((l=t==null?void 0:t.getApiToken)==null?void 0:l.call(t))||"",r=new Headers(e==null?void 0:e.headers);return s&&!r.has("Authorization")&&r.set("Authorization",`Bearer ${s}`),fetch(n,{...e,headers:r})}async function Nm(i){const e=new URLSearchParams;i.path&&e.set("path",i.path),e.set("root",i.root||"project"),i.cursor&&e.set("cursor",i.cursor);const t=await Pl(`/workspace/tree?${e.toString()}`);if(!t.ok){const n=await t.text().catch(()=>"");throw new Error(n||`工作区列表失败: HTTP ${t.status}`)}return t.json()}async function Dl(i){var t,n,s,r;const e=i.authToken?{Authorization:`Bearer ${i.authToken}`}:{};for(let o=0;o<240;o+=1){if((t=i.signal)!=null&&t.aborted)throw new Error("导入已取消");const a=await fetch(`${i.apiBase}/imports/${i.jobId}`,{headers:e,signal:i.signal});if(!a.ok)throw new Error(`导入状态查询失败: HTTP ${a.status}`);const l=await a.json();if((n=i.onProgress)==null||n.call(i,Number(l.progress||0),String(l.status||"")),l.status==="completed"){const c=(s=l.result)==null?void 0:s.id;if(!c)throw new Error("导入完成但未返回数据集 ID");return{id:c,name:((r=l.result)==null?void 0:r.name)||l.name}}if(l.status==="failed"||l.status==="cancelled")throw new Error(l.error||(l.status==="cancelled"?"导入已取消":"导入失败"));await new Promise(c=>window.setTimeout(c,750))}throw new Error("导入超时，请稍后在组件树中查看是否已出现新对象")}function Om(){return["position:absolute;inset:0;z-index:240;display:flex;align-items:center;justify-content:center;","background:rgba(1,4,9,.62);padding:18px;box-sizing:border-box;"].join("")}function Fm(){return["width:min(520px,100%);max-height:min(520px,100%);overflow:auto;","background:#161b22;border:1px solid #30363d;border-radius:10px;","color:#c9d1d9;font:13px/1.4 -apple-system,sans-serif;padding:14px;","box-shadow:0 12px 40px rgba(0,0,0,.45);"].join("")}function ki(i="default"){return`padding:6px 10px;border:1px solid;border-radius:6px;cursor:pointer;font-size:12px;${{default:"background:#21262d;color:#c9d1d9;border-color:#484f58;",primary:"background:#1f6feb;color:#fff;border-color:#388bfd;",ghost:"background:transparent;color:#8b949e;border-color:#30363d;"}[i]}`}function Bm(i){const e=document.createElement("input");return e.type="file",e.multiple=!0,e.accept=Im(),e.style.display="none",e.setAttribute("aria-hidden","true"),e.addEventListener("change",()=>{const t=Array.from(e.files||[]);e.value="",t.length&&i(t)}),e}function km(i,e){const t=s=>{var r;(r=s.dataTransfer)!=null&&r.types.includes("Files")&&(s.preventDefault(),s.dataTransfer.dropEffect="copy")},n=s=>{var r,o;(o=(r=s.dataTransfer)==null?void 0:r.files)!=null&&o.length&&(s.preventDefault(),e(Array.from(s.dataTransfer.files)))};return i.addEventListener("dragover",t),i.addEventListener("drop",n),()=>{i.removeEventListener("dragover",t),i.removeEventListener("drop",n)}}async function zm(i,e){const t=Um(e);if(!t){i.onStatus("没有可导入的油气文件（EGRID/GRDECL/DAT/SR3/LAS/ROFF 等）");return}const n=new FormData;n.append("file",t.primary,t.primary.name),n.append("name",t.primary.name.replace(/\.[^.]+$/,"")),t.companion&&n.append("companion_file",t.companion,t.companion.name),i.onStatus(t.companion?`正在上传 ${t.primary.name} + ${t.companion.name}...`:`正在上传 ${t.primary.name}...`);const s=i.authToken?{Authorization:`Bearer ${i.authToken}`}:{},r=await fetch(`${i.apiBase}/imports`,{method:"POST",headers:s,body:n});if(!r.ok){const l=await r.text().catch(()=>"");throw new Error(l||`导入失败: HTTP ${r.status}`)}const o=await r.json(),a=await Dl({apiBase:i.apiBase,authToken:i.authToken,jobId:o.job_id,onProgress:(l,c)=>{i.onStatus(`后台解析 ${t.primary.name}（${c} ${Math.round(l*100)}%）`)}});t.extra.length&&i.onStatus(`已导入 ${a.name||a.id}；同一次多选的其余文件请再导入一次，或改用「从工作区导入」自动匹配伴随文件`),await i.onImported(a.id)}async function Hm(i,e,t){const n=e.split("/").pop()||e;i.onStatus(`正在从工作区提交 ${n}...`);let s;try{s=await Pl("/ugsci/visualization/imports/workspace",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({path:e,root:t,name:n.replace(/\.[^.]+$/,"")})})}catch{s=await fetch(`${i.apiBase}/imports/workspace`,{method:"POST",headers:{"Content-Type":"application/json",...i.authToken?{Authorization:`Bearer ${i.authToken}`}:{}},body:JSON.stringify({path:e,root:t,name:n.replace(/\.[^.]+$/,"")})})}if(!s.ok){const a=await s.text().catch(()=>"");throw new Error(a||`工作区导入失败: HTTP ${s.status}`)}const r=await s.json(),o=await Dl({apiBase:i.apiBase,authToken:i.authToken,jobId:r.job_id,onProgress:(a,l)=>{i.onStatus(`后台解析 ${n}（${l} ${Math.round(a*100)}%）`)}});await i.onImported(o.id)}function Vm(i){const e=document.createElement("div");e.style.cssText=Om(),e.setAttribute("role","dialog"),e.setAttribute("aria-label","从工作区导入");const t=document.createElement("div");t.style.cssText=Fm();const n=document.createElement("div");n.textContent="从工作区导入",n.style.cssText="font-weight:600;color:#e6edf3;margin-bottom:6px;font-size:14px;";const s=document.createElement("div");s.textContent="Eclipse/CMG 的 INIT、UNRST、SR3 会在同目录自动匹配，不必手动多选。",s.style.cssText="color:#8b949e;font-size:11px;margin-bottom:10px;";const r=document.createElement("div");r.style.cssText="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap;align-items:center;";let o="project",a="";const l=document.createElement("div");l.style.cssText="flex:1;min-width:120px;color:#58a6ff;font-size:12px;word-break:break-all;";const c=document.createElement("div");c.style.cssText="border:1px solid #30363d;border-radius:8px;min-height:220px;max-height:280px;overflow:auto;background:#0d1117;";const h=document.createElement("div");h.style.cssText="color:#8b949e;font-size:11px;margin-top:8px;min-height:16px;";const u=()=>e.remove(),d=w=>{o=w,a="",S()},p=document.createElement("button");p.type="button",p.textContent="项目目录";const g=document.createElement("button");g.type="button",g.textContent="Agent 工作区";const x=()=>{p.style.cssText=ki(o==="project"?"primary":"ghost"),g.style.cssText=ki(o==="workspace"?"primary":"ghost")};p.addEventListener("click",()=>{d("project"),x()}),g.addEventListener("click",()=>{d("workspace"),x()}),x();const m=document.createElement("button");m.type="button",m.textContent="上级",m.style.cssText=ki(),m.addEventListener("click",()=>{if(!a)return;const w=a.split("/").filter(Boolean);w.pop(),a=w.join("/"),S()}),r.append(p,g,m,l);const f=(w,L)=>{L||(c.innerHTML="");const C=w.filter(T=>T.kind==="directory"||Ll(T.name));if(!L&&C.length===0){const T=document.createElement("div");T.style.cssText="padding:16px;color:#6e7681;",T.textContent="此目录没有可导入的油气文件",c.appendChild(T);return}for(const T of C){const W=document.createElement("button");W.type="button",W.style.cssText=["display:flex;width:100%;text-align:left;gap:8px;padding:8px 10px;","border:0;border-bottom:1px solid #21262d;background:transparent;color:#c9d1d9;cursor:pointer;"].join("");const v=document.createElement("span");v.textContent=T.kind==="directory"?"[目录]":"[文件]",v.style.cssText="color:#8b949e;flex:0 0 auto;font-size:11px;";const M=document.createElement("span");M.textContent=T.name,M.style.cssText="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;",W.append(v,M),W.addEventListener("click",()=>{if(T.kind==="directory"){a=T.path,S();return}u(),Hm(i,T.path,o).catch(I=>{i.onStatus(I instanceof Error?I.message:String(I))})}),c.appendChild(W)}},S=async w=>{h.textContent="正在读取工作区...",l.textContent=`${o==="project"?"项目":"工作区"} / ${a||""}`;try{const L=await Nm({path:a,root:o,cursor:w});if(f(L.entries,!!w),h.textContent=L.has_more?"还有更多条目，滚动到底部继续加载":"",L.has_more&&L.next_cursor){const C=document.createElement("button");C.type="button",C.textContent="加载更多",C.style.cssText=`${ki()};width:100%;margin:6px 0;`,C.addEventListener("click",()=>{C.remove(),S(L.next_cursor)}),c.appendChild(C)}}catch(L){c.innerHTML="",h.textContent=L instanceof Error?L.message:String(L)}},_=document.createElement("button");_.type="button",_.textContent="取消",_.style.cssText=`${ki()};margin-top:10px;`,_.addEventListener("click",u),e.addEventListener("click",w=>{w.target===e&&u()}),t.append(n,s,r,c,h,_),e.appendChild(t),i.container.appendChild(e),S()}const Il=[{id:"top",label:"Top",shortcut:"Alt+T"},{id:"bottom",label:"Bottom",shortcut:"Alt+B"},{id:"north",label:"North",shortcut:"Alt+N"},{id:"south",label:"South",shortcut:"Alt+S"},{id:"east",label:"East",shortcut:"Alt+E"},{id:"west",label:"West",shortcut:"Alt+W"},{id:"iso",label:"Iso",shortcut:"Alt+I"}];function Gm(i,e,t){const n=Math.max(t,1);switch(i){case"top":return{position:e.clone().add(new R(0,0,n)),up:new R(0,1,0)};case"bottom":return{position:e.clone().add(new R(0,0,-n)),up:new R(0,1,0)};case"north":return{position:e.clone().add(new R(0,n,0)),up:new R(0,0,1)};case"south":return{position:e.clone().add(new R(0,-n,0)),up:new R(0,0,1)};case"east":return{position:e.clone().add(new R(n,0,0)),up:new R(0,0,1)};case"west":return{position:e.clone().add(new R(-n,0,0)),up:new R(0,0,1)};default:return{position:e.clone().add(new R(1,1,.8).normalize().multiplyScalar(n)),up:new R(0,0,1)}}}function Wm(i,e,t){const n=i.getSize(new R),s=Zs.degToRad(t),r=2*Math.atan(Math.tan(s/2)*Math.max(e,.2)),o=Math.max(n.x,n.y,1),a=Math.max(n.z,1),l=o*.5/Math.tan(r/2),c=(a+.35*o)*.5/Math.tan(s/2);return Math.max(l,c,1)*1.2}function Xm(i,e,t){const n=Math.max(e*.42,1),s=n*Math.max(t,.2);i.left=-s,i.right=s,i.top=n,i.bottom=-n,i.near=.1,i.far=Math.max(e*40,2e4),i.updateProjectionMatrix()}function jm(i,e){const t=i.x-e.x,n=i.y-e.y;return Math.atan2(t,n)}function qm(i,e,t){if(t<=0)return 1;if(i instanceof Ss)return(i.top-i.bottom)/t;if(i instanceof Lt){const n=i.position.distanceTo(e),s=Zs.degToRad(i.fov);return 2*Math.tan(s/2)*n/t}return 1}const Ul="ugsci.visualization.userView";function $m(i,e,t,n,s){i.querySelectorAll(".oilgas-context-menu").forEach(h=>h.remove());const r=document.createElement("div");r.className="oilgas-context-menu",r.style.cssText=["position:fixed;z-index:400;min-width:168px;","background:#161b22;border:1px solid #30363d;border-radius:8px;","padding:4px;box-shadow:0 12px 32px rgba(0,0,0,.45);","font:12px/1.4 -apple-system,sans-serif;"].join("");const o=i.getBoundingClientRect();r.style.left=Math.min(e,o.right-180)+"px",r.style.top=Math.min(t,o.bottom-12-n.length*28)+"px";for(const h of n){const u=document.createElement("button");u.type="button",u.textContent=h.label,u.disabled=!!h.disabled,u.style.cssText=["display:block;width:100%;text-align:left;padding:7px 10px;border:0;border-radius:5px;","background:transparent;cursor:pointer;font:12px/1.3 -apple-system,sans-serif;",h.danger?"color:#f85149;":"color:#c9d1d9;",h.disabled?"opacity:.45;cursor:default;":""].join(""),u.addEventListener("mouseenter",()=>{h.disabled||(u.style.background="rgba(31,111,235,.28)")}),u.addEventListener("mouseleave",()=>{u.style.background="transparent"}),u.addEventListener("click",d=>{d.stopPropagation(),r.remove(),h.disabled||s(h.id)}),r.appendChild(u)}const a=()=>{r.remove(),window.removeEventListener("mousedown",l,!0),window.removeEventListener("keydown",c)},l=h=>{r.contains(h.target)||a()},c=h=>{h.key==="Escape"&&a()};window.addEventListener("mousedown",l,!0),window.addEventListener("keydown",c),i.appendChild(r)}function Ym(i){return[{id:"focus",label:"聚焦 / 适配",disabled:!i},{id:"isolate",label:"仅显示此项",disabled:!i},{id:"hide",label:"隐藏",disabled:!i},{id:"show-all",label:"显示全部"},{id:"delete",label:"删除",danger:!0,disabled:!i}]}function Wr(i){const e=Math.max(1,Math.round(i));return e+":"+e}function Km(i){let e=null,t=!1;const n={i:1,j:1,k:1},s=document.createElement("div");s.className="oilgas-slice-player",s.style.cssText=["position:absolute;height:32px;display:flex;align-items:center;gap:6px;","padding:0 8px;background:rgba(13,17,23,.82);border:1px solid #30363d;","border-radius:7px;z-index:19;box-sizing:border-box;pointer-events:auto;"].join("");const r=document.createElement("span");r.textContent="切片",r.style.cssText="font-size:11px;color:#8b949e;flex:0 0 auto;";const o=document.createElement("div");o.style.cssText="display:flex;gap:2px;flex:0 0 auto;";const a=new Map,l=()=>{for(const[x,m]of a){const f=x==="off"&&e===null||x===e;m.style.background=f?"#1f6feb":"#21262d",m.style.color=f?"#fff":"#8b949e"}},c=(x,m)=>{const f=document.createElement("button");f.type="button",f.textContent=m,f.style.cssText="width:28px;height:22px;padding:0;border:1px solid #30363d;border-radius:4px;cursor:pointer;font:600 11px/22px sans-serif;",f.addEventListener("click",()=>{e=x==="off"?null:x,t=!1,i.onPlay(!1),l(),p(),g(),i.onAxis(e)}),o.appendChild(f),a.set(x,f)};c("i","I"),c("j","J"),c("k","K"),c("off","全");const h=document.createElement("input");h.type="range",h.min="1",h.max="1",h.value="1",h.style.cssText="flex:1;min-width:80px;margin:0;",h.addEventListener("input",()=>{e&&(u.textContent=h.value,i.onIndex(e,Number(h.value)))});const u=document.createElement("span");u.style.cssText="font:600 11px/1 monospace;color:#c9d1d9;min-width:36px;text-align:right;",u.textContent="-";const d=document.createElement("button");d.type="button",d.style.cssText="width:28px;height:22px;padding:0;border:1px solid #30363d;border-radius:4px;background:#21262d;color:#c9d1d9;cursor:pointer;font-size:11px;";const p=()=>{d.textContent=t?"||":">",d.title=t?"停止播放":"沿 I/J/K 播放",d.disabled=!e};d.addEventListener("click",()=>{e&&(t=!t,p(),i.onPlay(t))});const g=()=>{const x=e?Math.max(1,n[e]):1;h.max=String(x),h.disabled=!e,Number(h.value)>x&&(h.value="1"),u.textContent=e?h.value:"-",p()};return l(),p(),s.append(r,o,h,u,d),{root:s,setDims:x=>{n.i=Math.max(1,Number(x==null?void 0:x[0])||1),n.j=Math.max(1,Number(x==null?void 0:x[1])||1),n.k=Math.max(1,Number(x==null?void 0:x[2])||1),g()},setPlaying:x=>{t=x,p()},setIndex:x=>{const m=e?Math.max(1,n[e]):1,f=Math.min(m,Math.max(1,Math.round(x)));h.value=String(f),u.textContent=e?h.value:"-",e&&i.onIndex(e,f)},axis:()=>e,index:()=>Number(h.value)||1}}function Jm(){const i=document.createElement("div");i.className="oilgas-compass",i.style.cssText=["position:absolute;width:72px;pointer-events:none;z-index:18;","display:flex;flex-direction:column;align-items:center;gap:6px;"].join("");const e=document.createElement("canvas");e.width=72,e.height=72,e.style.cssText="width:72px;height:72px;";const t=document.createElement("div");t.style.cssText=["color:#c9d1d9;font:600 10px/1.2 ui-monospace,Menlo,monospace;","background:rgba(13,17,23,.78);border:1px solid #30363d;border-radius:4px;","padding:3px 6px;text-align:center;min-width:64px;"].join(""),t.textContent="—",i.append(e,t);const n=r=>{const o=e.getContext("2d");if(!o)return;const a=36,l=36;o.clearRect(0,0,72,72),o.save(),o.translate(a,l),o.rotate(r),o.beginPath(),o.arc(0,0,30,0,Math.PI*2),o.fillStyle="rgba(13,17,23,.82)",o.fill(),o.strokeStyle="#30363d",o.stroke(),o.beginPath(),o.moveTo(0,22),o.lineTo(7,6),o.lineTo(0,10),o.lineTo(-7,6),o.closePath(),o.fillStyle="#8b949e",o.fill(),o.beginPath(),o.moveTo(0,-24),o.lineTo(8,-4),o.lineTo(0,-8),o.lineTo(-8,-4),o.closePath(),o.fillStyle="#f85149",o.fill(),o.fillStyle="#e6edf3",o.font="700 11px sans-serif",o.textAlign="center",o.fillText("N",0,-26),o.restore()},s=r=>{const o=Math.pow(10,Math.floor(Math.log10(Math.max(r,1e-6)))),a=[1,2,5,10].map(h=>h*o),l=a.find(h=>h>=r)||a[a.length-1]*10,c=l>=1e3?(l/1e3).toFixed(l%1e3===0?0:1)+" km":Math.round(l)+" m";return{meters:l,label:c}};return n(0),{root:i,setAzimuth:r=>n(r),setMetersPerPixel:r=>{const{label:o}=s(Math.max(r*48,1));t.textContent=o}}}function Zm(i){var s,r;const e=document.createElement("div");e.className="oilgas-view-cluster",e.style.cssText=["position:absolute;display:grid;grid-template-columns:repeat(3,24px);gap:3px;","padding:6px;background:rgba(13,17,23,.82);border:1px solid #30363d;","border-radius:8px;z-index:18;pointer-events:auto;"].join("");const t=[null,"north",null,"west","top","east",null,"south","iso","bottom",null,null],n={top:"T",bottom:"B",north:"N",south:"S",east:"E",west:"W",iso:"3D"};for(const o of t){if(!o){const l=document.createElement("span");l.style.cssText="width:24px;height:22px;",e.appendChild(l);continue}const a=document.createElement("button");a.type="button",a.textContent=n[o],a.title=((s=Il.find(l=>l.id===o))==null?void 0:s.label)+" ("+(((r=Il.find(l=>l.id===o))==null?void 0:r.shortcut)||"")+")",a.style.cssText=["width:24px;height:22px;padding:0;border:1px solid #30363d;border-radius:4px;","background:#21262d;color:#c9d1d9;cursor:pointer;font:600 10px/22px sans-serif;"].join(""),a.addEventListener("click",l=>{l.stopPropagation(),i(o)}),e.appendChild(a)}return e}function Qm(){const i=document.createElement("div");return i.className="oilgas-shortcuts",i.style.cssText=["display:none;position:absolute;inset:48px 24px auto 24px;max-width:420px;","background:rgba(13,17,23,.94);border:1px solid #30363d;border-radius:10px;","padding:14px 16px;z-index:80;color:#c9d1d9;","font:12px/1.5 -apple-system,sans-serif;box-shadow:0 16px 40px rgba(0,0,0,.4);"].join(""),i.innerHTML=["<div style='font-weight:700;margin-bottom:8px;color:#e6edf3;'>快捷键</div>","<div>Alt+T/B/N/S/E/W/I — 顶/底/北/南/东/西/三维视角</div>","<div>F 适配全部 · O 正交投影 · G 底板网格</div>","<div>I 仅显示当前 · H 隐藏 · A 显示全部</div>","<div>Delete 从目录移除 · ? 打开本列表</div>","<div>Esc 关闭菜单</div>"].join(""),i}function eg(i){i.style.display=i.style.display==="none"||!i.style.display?"block":"none"}function tg(i){i.style.display="none"}const ng=15778123;function ig(i,e){const t=ym(Br(i),256);if(t.length<2)return null;const n=new nl(t.map(([c,h,u])=>new R(c,h,u)),!1,"catmullrom",.15),s=Sm(t),r=Math.min(192,Math.max(12,(t.length-1)*4)),o=new Ir(n,r,s,8,!1),a=new vi({color:ng,emissive:new Ue(3811848),specular:new Ue(2236962),shininess:18}),l=new Rt(o,a);return l.name="oilgas-well-tube",l}const Nl=[0,1,3,2,4,5,7,6],Ol=[[0,1,2,3],[4,7,6,5],[0,1,5,4],[3,2,6,7],[0,3,7,4],[1,2,6,5]],Fl=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]],kn=8,Bl=5,Rs=6*Bl,sg=6*4*3,zi=14;function Ls(i,e,t){const n=(e*8+t)*3;return[i[n],i[n+1],i[n+2]]}function kl(i,e,t){const n=Ls(i,e,t[0]),s=Ls(i,e,t[1]),r=Ls(i,e,t[2]),o=Ls(i,e,t[3]),a=[(s[1]-n[1])*(r[2]-n[2])-(s[2]-n[2])*(r[1]-n[1]),(s[2]-n[2])*(r[0]-n[0])-(s[0]-n[0])*(r[2]-n[2]),(s[0]-n[0])*(r[1]-n[1])-(s[1]-n[1])*(r[0]-n[0])],l=[(r[1]-n[1])*(o[2]-n[2])-(r[2]-n[2])*(o[1]-n[1]),(r[2]-n[2])*(o[0]-n[0])-(r[0]-n[0])*(o[2]-n[2]),(r[0]-n[0])*(o[1]-n[1])-(r[1]-n[1])*(o[0]-n[0])],c=Math.hypot(a[0],a[1],a[2]),h=Math.hypot(l[0],l[1],l[2]);return c===0||h===0?0:(a[0]*l[0]+a[1]*l[1]+a[2]*l[2])/(c*h)}function Mi(i,e){return e<=0||i%e!==0?0:i/e}function Xr(i,e){const t=Mi(i,e);return t===kn||t===zi}function rg(i,e){const t=Mi(i,e);return t===kn||t===zi||t===Rs}function jr(i,e){const t=Mi(i.length/3,e);if(t===kn)return new Float32Array(i.subarray(0,e*24));if(t!==zi)throw new Error("hex corners require 8 or 14 vertices per cell");const n=new Float32Array(e*24);for(let s=0;s<e;s++){const r=s*zi*3;n.set(i.subarray(r,r+24),s*24)}return n}function og(i,e){if(!Xr(i.length/3,e))return!1;const t=Mi(i.length/3,e)===kn?i:jr(i,e),n=Math.min(e,32);let s=0,r=0;for(let o=0;o<n;o++)s+=kl(t,o,[0,1,2,3]),r+=kl(t,o,[0,1,3,2]);return r>s+.25*n}function ag(i,e){const t=new Float32Array(24);for(let n=0;n<e;n++){const s=n*24;t.set(i.subarray(s,s+24));for(let r=0;r<8;r++){const o=Nl[r]*3,a=s+r*3;i[a]=t[o],i[a+1]=t[o+1],i[a+2]=t[o+2]}}}function zl(i,e){if(!og(i,e))return!1;if(Mi(i.length/3,e)===kn)return ag(i,e),!0;const n=new Float32Array(24);for(let s=0;s<e;s++){const r=s*zi*3;n.set(i.subarray(r,r+24));for(let o=0;o<8;o++){const a=Nl[o]*3,l=r+o*3;i[l]=n[a],i[l+1]=n[a+1],i[l+2]=n[a+2]}}return!0}function Hl(i,e){if(Mi(i.length/3,e)!==kn)throw new Error("OPM hex fan requires 8 corners per cell");const t=new Float32Array(e*Rs*3),n=new Float32Array(e*Rs*3),s=new Uint32Array(e*sg);let r=0,o=0,a=0;for(let l=0;l<e;l++){const c=l*24,h=l*Rs;for(let u=0;u<Ol.length;u++){const d=Ol[u],p=i[c+d[0]*3],g=i[c+d[0]*3+1],x=i[c+d[0]*3+2],m=i[c+d[1]*3],f=i[c+d[1]*3+1],S=i[c+d[1]*3+2],_=i[c+d[2]*3],w=i[c+d[2]*3+1],L=i[c+d[2]*3+2],C=i[c+d[3]*3],T=i[c+d[3]*3+1],W=i[c+d[3]*3+2],v=(p+m+_+C)*.25,M=(g+f+w+T)*.25,I=(x+S+L+W)*.25;let X=C-v,J=T-M,D=W-I,U=0,k=0,K=0;const Y=[p,m,_,C],$=[g,f,w,T],Z=[x,S,L,W];for(let he=0;he<4;he++){const Te=Y[he]-v,we=$[he]-M,ve=Z[he]-I;U+=J*ve-D*we,k+=D*Te-X*ve,K+=X*we-J*Te,X=Te,J=we,D=ve}const ee=Math.hypot(U,k,K);ee===0?(U=0,k=0,K=1):(U/=ee,k/=ee,K/=ee);const z=[p,m,_,C,v],O=[g,f,w,T,M],Q=[x,S,L,W,I];for(let he=0;he<5;he++)t[r++]=z[he],t[r++]=O[he],t[r++]=Q[he],n[o++]=U,n[o++]=k,n[o++]=K;const oe=h+u*Bl,ue=oe+4;s[a++]=ue,s[a++]=oe,s[a++]=oe+1,s[a++]=ue,s[a++]=oe+1,s[a++]=oe+2,s[a++]=ue,s[a++]=oe+2,s[a++]=oe+3,s[a++]=ue,s[a++]=oe+3,s[a++]=oe}}return{positions:t,indices:s,normals:n}}function qr(i){const e=Array.from(i),t=new Uint32Array(e.length*Fl.length*2);let n=0;for(const s of e){const r=s*kn;for(const[o,a]of Fl)t[n++]=r+o,t[n++]=r+a}return t}class lg{constructor(){this.worker=null,this.workerUrl=null,this.pending=new Map,this.pendingColors=new Map,this.msgId=0;try{const e=`
        const colormaps = ${JSON.stringify(Si)};
        function colormap(name, t) {
          const cm = colormaps[name] || colormaps.viridis;
          const idx = Math.max(0, Math.min(cm.length-1, Math.floor(t*(cm.length-1))));
          const next = Math.min(cm.length-1, idx+1);
          const frac = t*(cm.length-1)-idx;
          return [cm[idx][0]+(cm[next][0]-cm[idx][0])*frac, cm[idx][1]+(cm[next][1]-cm[idx][1])*frac, cm[idx][2]+(cm[next][2]-cm[idx][2])*frac];
        }
        self.onmessage = async function(e) {
          const msg = e.data;
          if (msg.type === "decode") {
            try {
              const resp = await fetch(msg.url, { headers: msg.authToken ? {Authorization:"Bearer "+msg.authToken} : {} });
              if (!resp.ok) { self.postMessage({type:"error",id:msg.id,error:"HTTP "+resp.status}); return; }
              const buf = await resp.arrayBuffer();
              self.postMessage({type:"decoded",id:msg.id,buffer:buf}, [buf]);
            } catch(err) { self.postMessage({type:"error",id:msg.id,error:String(err)}); }
          } else if (msg.type === "compute-colors") {
            const scalars = msg.isFloat ? new Float32Array(msg.scalars) : new Uint32Array(msg.scalars);
            const indices = new Uint32Array(msg.indices);
            let smin=Infinity, smax=-Infinity;
            for (let i=0; i<scalars.length; i++) { if(scalars[i]<smin)smin=scalars[i]; if(scalars[i]>smax)smax=scalars[i]; }
            const srange = smax-smin || 1;
            const colors = new Float32Array(msg.nVerts*3);
            const vCount = new Float32Array(msg.nVerts);
            const ipc = indices.length / scalars.length;
            for (let c=0; c<scalars.length; c++) {
              const [r,g,b] = colormap(msg.colormap, (scalars[c]-smin)/srange);
              const start = c*ipc;
              for (let k=0; k<ipc; k++) { const vi=indices[start+k]; if(vi<msg.nVerts){colors[vi*3]+=r;colors[vi*3+1]+=g;colors[vi*3+2]+=b;vCount[vi]++;} }
            }
            for (let i=0; i<msg.nVerts; i++) { const count=vCount[i]||1; colors[i*3]/=count; colors[i*3+1]/=count; colors[i*3+2]/=count; }
            self.postMessage({type:"colors",id:msg.id,colors,smin,smax}, [colors.buffer]);
          }
        };
      `,t=new Blob([e],{type:"application/javascript"});this.workerUrl=URL.createObjectURL(t),this.worker=new Worker(this.workerUrl),this.worker.onmessage=n=>{var r,o,a,l;const s=n.data;s.type==="decoded"?((r=this.pending.get(s.id))==null||r(new Float32Array(s.buffer)),this.pending.delete(s.id)):s.type==="colors"?((o=this.pendingColors.get(s.id))==null||o({colors:s.colors,smin:s.smin,smax:s.smax}),this.pendingColors.delete(s.id)):s.type==="error"&&((a=this.pending.get(s.id))==null||a(null),(l=this.pendingColors.get(s.id))==null||l(null),this.pending.delete(s.id),this.pendingColors.delete(s.id))}}catch(e){console.warn("[oilgas-vis] Worker creation failed, falling back to main thread",e)}}isAvailable(){return this.worker!==null}decode(e,t){return this.worker?new Promise(n=>{const s=`decode-${this.msgId++}`;this.pending.set(s,n);try{this.worker.postMessage({type:"decode",id:s,url:e,authToken:t})}catch{this.pending.delete(s),n(null)}}):Promise.resolve(null)}computeColors(e,t,n,s,r){return this.worker?new Promise(o=>{const a=`colors-${this.msgId++}`;this.pendingColors.set(a,o);try{this.worker.postMessage({type:"compute-colors",id:a,scalars:e,indices:t,colormap:n,nVerts:s,isFloat:r},[e,t])}catch{this.pendingColors.delete(a),o(null)}}):Promise.resolve(null)}dispose(){var e;(e=this.worker)==null||e.terminate(),this.worker=null,this.workerUrl&&URL.revokeObjectURL(this.workerUrl),this.workerUrl=null;for(const t of this.pending.values())t(null);for(const t of this.pendingColors.values())t(null);this.pending.clear(),this.pendingColors.clear()}}class cg{constructor(e){this.options=e,this.timer=null,this.polling=!1,this.apiBase=e.apiBase,this.authToken=e.authToken}start(){this.timer===null&&(this.poll(),this.timer=window.setInterval(()=>{this.poll()},this.options.intervalMs??750))}update(e){e.apiBase&&(this.apiBase=e.apiBase),e.authToken!==void 0&&(this.authToken=e.authToken)}dispose(){this.timer!==null&&window.clearInterval(this.timer),this.timer=null}headers(){return this.authToken?{Authorization:`Bearer ${this.authToken}`}:{}}async poll(){var e,t;if(!this.polling){this.polling=!0;try{const n=await fetch(`${this.apiBase}/commands?viewerId=${encodeURIComponent(this.options.viewerId)}`,{headers:this.headers()});if(!n.ok)throw new Error(`HTTP ${n.status}`);const s=await n.json();for(const r of s.commands||[])try{const o=await this.options.execute(r.command,r.args||{});await this.acknowledge(r.commandId,"completed",o??{ok:!0})}catch(o){const a=o instanceof Error?o.message:String(o);(t=(e=this.options).onCommandError)==null||t.call(e,a),await this.acknowledge(r.commandId,"failed",void 0,a)}}catch(n){console.debug("[oilgas-vis] Command polling unavailable:",n)}finally{this.polling=!1}}}async acknowledge(e,t,n,s){try{await fetch(`${this.apiBase}/commands/${encodeURIComponent(e)}/ack`,{method:"POST",headers:{...this.headers(),"Content-Type":"application/json"},body:JSON.stringify({status:t,result:n,error:s})})}catch(r){console.debug("[oilgas-vis] Command ACK unavailable:",r)}}}class hg{constructor(e,t){var h,u;this.mesh=null,this.hexEdgeLines=null,this.hexCornerPositions=null,this.isHexMesh=!1,this.overlayMeshes=new Map,this.overlayLoading=new Set,this.geometry=null,this.cellIds=null,this.baseIndices=null,this.visibleCellOffsets=[],this.currentScalarValues=null,this.cellCenters=null,this.raycaster=new em,this.mouse=new xe,this.animationId=null,this.frameTimes=[],this.lastFrameTime=0,this.fpsInterval=0,this.abortController=null,this.loadGeneration=0,this.colorRequest=0,this.timestepTimer=null,this.datasetLoading=!1,this.manifest=null,this.currentDataset=null,this.currentProperty="porosity",this.currentColormap="viridis",this.wireframe=!1,this.opacity=.85,this.currentTimeStep=0,this.viewerId=`viewer-${((u=(h=globalThis.crypto)==null?void 0:h.randomUUID)==null?void 0:u.call(h))||Math.random().toString(36).slice(2)}`,this.origin=[0,0,0],this.filterI=[0,1/0],this.filterJ=[0,1/0],this.filterK=[0,1/0],this.filterPropertyRange=[-1/0,1/0],this.filterPropertyExclude=!1,this.filterBounds=null,this.zScale=1,this.useOrtho=!1,this.wellLabelsVisible=!0,this.sliceTimer=null,this.filterUndoStack=[],this.filterRedoStack=[],this.lastFilterState="",this.restoringScene=!1,this.measureMode=!1,this.measurePoints=[],this.clipPlane=new rn(new R(0,0,-1),0),this.wellLogEl=null,this.histogramEl=null,this.workerManager=new lg,this.sidebarCollapsed=!1,this.objectTreeCollapsed=!1,this.wellPlanPoints=new Map,this.gridMapBounds=null,this.treeQuery="",this.collapsedGroups=new Set,this.selectedObjectId=null,this.hoverCoords=null,this.fileInput=null,this.dropUnbind=null,this.importBusy=!1,this.highlightedOverlayId=null,this.storeUnsubscribe=null,this.scalarMin=0,this.scalarMax=1,this.onSelectionCallback=null,this.iconButtonStyle={width:"24px",height:"24px",padding:"0",background:"#21262d",color:"#c9d1d9",border:"1px solid #484f58",borderRadius:"5px",cursor:"pointer",fontSize:"16px",lineHeight:"20px"},this.selectStyle={width:"100%",padding:"6px 8px",background:"#161b22",border:"1px solid #30363d",borderRadius:"6px",color:"#c9d1d9",fontSize:"13px",marginBottom:"4px",cursor:"pointer"},this.onViewerKeyDown=d=>{var x,m,f;const p=d.target;if(p&&["INPUT","TEXTAREA","SELECT"].includes(p.tagName))return;if(d.key==="Escape"){tg(this.shortcutsEl),this.container.querySelectorAll(".oilgas-context-menu").forEach(S=>S.remove());return}if(d.key==="?"||d.shiftKey&&d.key==="/"){d.preventDefault(),eg(this.shortcutsEl);return}if(d.key==="Delete"||d.key==="Backspace"){const S=this.datasetById(this.selectedObjectId||((x=this.currentDataset)==null?void 0:x.id)||"");if(!S)return;d.preventDefault(),this.deleteCatalogDataset(S);return}const g=d.key.toLowerCase();if(d.altKey){const S={t:"top",b:"bottom",n:"north",s:"south",e:"east",w:"west",i:"iso"};S[g]&&(d.preventDefault(),this.applyNamedView(S[g]));return}if(!(d.ctrlKey||d.metaKey))if(g==="f")d.preventDefault(),this.fitView();else if(g==="o")d.preventDefault(),this.setOrthographic(!this.useOrtho);else if(g==="g"){d.preventDefault(),this.gridHelper.visible=!this.gridHelper.visible;const S=this.sidebar.querySelector("#vis-show-grid");S&&(S.checked=this.gridHelper.visible,S.dispatchEvent(new Event("ugsci-sync")))}else if(g==="i"){d.preventDefault();const S=this.datasetById(this.selectedObjectId||((m=this.currentDataset)==null?void 0:m.id)||"");S&&this.isolateDataset(S)}else if(g==="h"){d.preventDefault();const S=this.datasetById(this.selectedObjectId||((f=this.currentDataset)==null?void 0:f.id)||"");S&&this.toggleDatasetVisibility(S,!1)}else g==="a"&&(d.preventDefault(),this.showAllVisible())},this.onCatalogKeyDown=this.onViewerKeyDown,this.onCanvasContextMenu=d=>{var x;d.preventDefault(),this.canvasNdc(d),this.raycaster.setFromCamera(this.mouse,this.camera);const p=this.raycaster.intersectObjects(this.pickables(),!0)[0],g=p?this.datasetFromHit(p.object):this.datasetById(this.selectedObjectId||((x=this.currentDataset)==null?void 0:x.id)||"")||null;this.openObjectContextMenu(g,d.clientX,d.clientY)},this.lastChromeKey="",this.onWellMapClick=d=>{const p=Array.from(this.wellPlanPoints.values()),g=El(p,this.gridMapBounds);if(!g)return;const x=this.wellMapCanvas.getBoundingClientRect(),m=this.wellMapCanvas.width/Math.max(x.width,1),f=this.wellMapCanvas.height/Math.max(x.height,1),S=Am(p,g,this.wellMapCanvas.width,this.wellMapCanvas.height,(d.clientX-x.left)*m,(d.clientY-x.top)*f);if(!S)return;const _=this.datasetById(S);_&&this.focusDataset(_)},this.onCanvasPointerMove=d=>{if(this.datasetLoading)return;this.canvasNdc(d),this.raycaster.setFromCamera(this.mouse,this.camera);const p=this.raycaster.intersectObjects(this.pickables(),!0)[0];if(!p){this.hoverCoords&&(this.hoverCoords=null,this.updateReadoutHud());return}const g=this.hitToModelPoint(p.point);this.hoverCoords=[g.x+this.origin[0],g.y+this.origin[1],g.z+this.origin[2]],this.updateReadoutHud()},this.onCanvasPointerLeave=()=>{this.hoverCoords=null,this.updateReadoutHud()},this.onCanvasDblClick=d=>{this.canvasNdc(d),this.raycaster.setFromCamera(this.mouse,this.camera);const p=this.raycaster.intersectObjects(this.pickables(),!0)[0];if(!p)return;const g=this.datasetFromHit(p.object);g&&this.focusDataset(g)},this.onCanvasClick=async d=>{var W,v,M;if(this.datasetLoading)return;this.canvasNdc(d),this.raycaster.setFromCamera(this.mouse,this.camera);const p=this.raycaster.intersectObjects(this.pickables(),!0)[0];if(!p)return;const g=this.datasetFromHit(p.object),x=this.hitToModelPoint(p.point),m=x.x+this.origin[0],f=x.y+this.origin[1],S=x.z+this.origin[2];if(this.hoverCoords=[m,f,S],this.measureMode){if(this.measurePoints.push(x.clone()),this.measurePoints.length===2){const I=this.measurePoints[0].distanceTo(this.measurePoints[1]);this.infoEl.textContent=`测距结果: ${I.toFixed(3)} | 再点击可重新测量`,this.measurePoints=[]}else this.infoEl.textContent="已选择第一个点，请选择第二个点";this.updateReadoutHud();return}if(g&&(at(g)||this.isLineDataset(g)||g.id!==((W=this.currentDataset)==null?void 0:W.id))){this.infoEl.textContent=`${g.name} | 真实坐标: (${m.toFixed(0)}, ${f.toFixed(0)}, ${S.toFixed(0)})`,this.publishSelection({type:this.selectionTypeFor(g),id:g.id,coordinates:[m,f,S]});return}if(!this.mesh||!this.geometry)return;const _=p.faceIndex??p.index??0,w=Math.max(1,(((v=this.geometry.getIndex())==null?void 0:v.count)||0)/Math.max(this.visibleCellOffsets.length,1)/(this.mesh instanceof Rt?3:1)),L=Math.floor(_/w),C=this.visibleCellOffsets[L]??L,T=((M=this.cellIds)==null?void 0:M[C])??C;if(this.infoEl.textContent=`Cell ID: ${T} | 真实坐标: (${m.toFixed(0)}, ${f.toFixed(0)}, ${S.toFixed(0)})`,this.currentDataset)try{const I=await this.fetchJson(`/datasets/${encodeURIComponent(this.currentDataset.id)}/cells/${T}`);this.showDetails([`Cell ${I.cell_id}`,I.ijk?`I/J/K: ${I.ijk.join(" / ")}`:"I/J/K: —",I.center?`中心: ${I.center.map(X=>Number(X).toFixed(2)).join(", ")}`:"中心: —",...Object.entries(I.properties||{}).map(([X,J])=>`${X}: ${Number(J).toPrecision(6)}`)].join(`
`))}catch{}this.publishSelection({type:"cell",id:String(T),coordinates:[m,f,S]})},this.onResize=()=>{const d=this.container.clientWidth,p=this.container.clientHeight;d<=0||p<=0||(this.renderer.setSize(d,p),this.labelRenderer.setSize(d,p),this.applyCameraProjection(),this.updatePanelOffsets())},this.container=e,this.apiBase=t.apiBase,this.authToken=t.authToken;const n=Math.max(e.clientWidth,1),s=Math.max(e.clientHeight,1);this.renderer=new Ya({antialias:!0,powerPreference:"high-performance"}),this.renderer.setSize(n,s),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)),this.renderer.localClippingEnabled=!0,e.appendChild(this.renderer.domElement),getComputedStyle(e).position==="static"&&(e.style.position="relative"),this.labelRenderer=new om,this.labelRenderer.setSize(n,s),Object.assign(this.labelRenderer.domElement.style,{position:"absolute",inset:"0",pointerEvents:"none"}),e.appendChild(this.labelRenderer.domElement),this.scene=new Np,this.scene.background=new Ue(856343),this.scene.fog=new Ni(856343,2e3,8e3),this.modelRoot=new Nn,this.modelRoot.name="oilgas-model",this.scene.add(this.modelRoot),this.perspectiveCamera=new Lt(50,n/s,1,2e4),this.perspectiveCamera.position.set(3e3,3e3,3e3),this.orthoCamera=new Ss(-n/2,n/2,s/2,-s/2,.1,2e4),this.orthoCamera.position.copy(this.perspectiveCamera.position),this.camera=this.perspectiveCamera,this.controls=new sm(this.camera,this.renderer.domElement),this.controls.enableDamping=!0,this.controls.dampingFactor=.08;const r=new Qp(4210784,1.5);this.scene.add(r);const o=new ll(16777215,1.2);o.position.set(1e3,1e3,1e3),this.scene.add(o);const a=new ll(8425727,.5);a.position.set(-500,-500,-500),this.scene.add(a),this.gridHelper=new tm(5e3,50,3159613,2172461),this.gridHelper.rotation.x=Math.PI/2,this.scene.add(this.gridHelper),this.axesHelper=new nm(2e3),this.scene.add(this.axesHelper),this.raycaster.params.Line={threshold:12},this.renderer.domElement.addEventListener("click",this.onCanvasClick),this.renderer.domElement.addEventListener("pointermove",this.onCanvasPointerMove),this.renderer.domElement.addEventListener("pointerleave",this.onCanvasPointerLeave),this.renderer.domElement.addEventListener("dblclick",this.onCanvasDblClick),this.renderer.domElement.addEventListener("contextmenu",this.onCanvasContextMenu),window.addEventListener("resize",this.onResize),this.sidebar=this.buildSidebar(),this.objectTree=this.buildObjectTree(),this.hudEl=this.buildHud(),this.infoEl=this.buildInfoBar(),this.detailsEl=this.buildDetailsPanel(),this.legendEl=this.buildLegend(),this.histogramEl=this.buildHistogram(),this.wellLogEl=this.buildWellLogPanel(),this.toolbarEl=this.buildToolbar(),this.readoutEl=this.buildReadout();const l=Cm();this.wellMapRoot=l.root,this.wellMapCanvas=l.canvas,this.wellMapCanvas.addEventListener("click",this.onWellMapClick),this.container.appendChild(this.wellMapRoot),this.slicePlayer=Km({onAxis:d=>this.applySliceAxis(d),onIndex:(d,p)=>this.applySliceIndex(d,p),onPlay:d=>this.setSlicePlaying(d)}),this.container.appendChild(this.slicePlayer.root),this.compassHud=Jm(),this.container.appendChild(this.compassHud.root),this.viewClusterEl=Zm(d=>this.applyNamedView(d)),this.container.appendChild(this.viewClusterEl),this.shortcutsEl=Qm(),this.container.appendChild(this.shortcutsEl),this.viewRouter=new Bi(this.container,d=>{this.applyActiveView(d)});const c=this.viewRouter.createTabs();c.className="oilgas-view-tabs",Object.assign(c.style,{top:"48px",left:"276px",right:"288px",overflowX:"auto"}),this.container.appendChild(c),this.storeUnsubscribe=Qe.subscribe(()=>this.syncChromeFromStore()),this.updatePanelOffsets(),this.commandBridge=new cg({apiBase:this.apiBase,authToken:this.authToken,viewerId:this.viewerId,execute:(d,p)=>this.executeCommand(d,p),onCommandError:d=>{this.infoEl.textContent=`Agent 命令失败: ${d}`}}),this.fileInput=Bm(d=>{this.handlePickedFiles(d)}),this.container.appendChild(this.fileInput),this.container.tabIndex=0,this.container.addEventListener("keydown",this.onViewerKeyDown),this.dropUnbind=km(this.container,d=>{this.handlePickedFiles(d)}),this.startLoop(),this.init(),this.commandBridge.start()}authHeaders(){return this.authToken?{Authorization:`Bearer ${this.authToken}`}:{}}async fetchJson(e,t){const n=await fetch(`${this.apiBase}${e}`,{headers:this.authHeaders(),signal:t});if(!n.ok)throw new Error(`HTTP ${n.status}`);return n.json()}async fetchBinary(e,t){const n=`${this.apiBase}/resource/${e}`;if(this.workerManager.isAvailable()){const r=await this.workerManager.decode(n,this.authToken);if(r)return new Uint8Array(r.buffer).slice().buffer}const s=await fetch(n,{headers:this.authHeaders(),signal:t});if(!s.ok)throw new Error(`HTTP ${s.status}`);return s.arrayBuffer()}buildSidebar(){const e=document.createElement("div");Object.assign(e.style,{position:"absolute",top:"0",right:"0",bottom:"0",left:"auto",width:String(At.inspectorWidth)+"px",background:"rgba(13,17,23,0.96)",borderLeft:"1px solid #30363d",borderRight:"0",overflow:"hidden",padding:"0",boxSizing:"border-box",zIndex:"100",fontFamily:"-apple-system, sans-serif",color:"#c9d1d9",fontSize:"13px",display:"flex",flexDirection:"column"}),e.className="oilgas-panel oilgas-inspector-panel";const t=document.createElement("button");t.type="button",t.textContent="<",t.title="收起属性面板",t.setAttribute("aria-label","收起属性面板"),Object.assign(t.style,this.iconButtonStyle),t.style.position="absolute",t.style.top="8px",t.style.left="6px",t.style.right="auto",t.style.zIndex="2",t.addEventListener("click",()=>this.toggleSidebar(t)),e.appendChild(t);const n=document.createElement("div");n.id="vis-inspector-body",n.style.cssText="flex:1;min-height:0;display:flex;flex-direction:column;padding:12px 10px 8px;overflow:hidden;";const s=document.createElement("div");Object.assign(s.style,{fontSize:"15px",fontWeight:"600",marginBottom:"10px",color:"#58a6ff",padding:"0 0 8px 28px",borderBottom:"1px solid #30363d"}),s.textContent="属性",n.appendChild(s);const r=document.createElement("div");r.id="vis-inspector-object",r.style.cssText="margin:0 0 10px;padding:8px;background:#161b22;border:1px solid #30363d;border-radius:7px;flex:0 0 auto;";const o=document.createElement("div");o.dataset.objectName="true",o.style.cssText="font-weight:600;color:#e6edf3;margin-bottom:4px;",o.textContent="未选中对象";const a=document.createElement("div");a.dataset.objectMeta="true",a.style.cssText="font-size:11px;color:#8b949e;margin-bottom:6px;",a.textContent="在组件树或三维视图中点选";const l=Nt("vis-inspector-visible",!0,F=>{var ge;const q=this.datasetById(this.selectedObjectId||((ge=this.currentDataset)==null?void 0:ge.id)||"");q&&this.toggleDatasetVisibility(q,F)}),c=document.createElement("div");c.style.cssText="display:grid;grid-template-columns:42% 1fr;gap:8px;align-items:center;";const h=document.createElement("div");h.textContent="visible",h.style.cssText="color:#8b949e;font-size:11px;",c.append(h,l),r.append(o,a,c),n.appendChild(r);const u=Dm();n.appendChild(u.tabBar);const d=document.createElement("div");d.style.cssText="flex:1;min-height:0;overflow:auto;";const p=Vr(),g=Vr();u.panes.controls.appendChild(p.table),u.panes.actions.appendChild(g.table),d.append(u.panes.controls,u.panes.actions,u.panes.addons),n.appendChild(d);const x=F=>(Object.assign(F.style,this.selectStyle,{marginBottom:"0"}),F),m=document.createElement("select");x(m),m.id="vis-dataset",m.setAttribute("aria-label","数据集"),m.addEventListener("change",()=>this.loadDataset(m.value)),We(p.body,"dataset",m);const f=document.createElement("select");x(f),f.id="vis-property",f.setAttribute("aria-label","属性");for(const F of["porosity","permeability","facies"]){const q=document.createElement("option");q.value=F,q.textContent=F,f.appendChild(q)}f.addEventListener("change",()=>{this.currentProperty=f.value,Qe.setProperty({name:this.currentProperty,displayName:this.currentProperty,range:[this.scalarMin,this.scalarMax]}),this.reloadPropertyColors()}),We(p.body,"property",f);const S=document.createElement("select");x(S),S.id="vis-timestep",S.setAttribute("aria-label","时间步"),S.innerHTML='<option value="0">静态</option>',S.addEventListener("change",()=>{this.currentTimeStep=parseInt(S.value),Qe.setTimeStep(this.currentTimeStep),this.reloadPropertyColors()}),We(p.body,"timeStep",S);const _=bt("播放时间步");_.title="播放/暂停动态结果时间步",_.style.marginBottom="0",_.addEventListener("click",()=>{if(this.timestepTimer!==null){window.clearInterval(this.timestepTimer),this.timestepTimer=null,_.textContent="播放时间步",this.infoEl.textContent="已暂停时间步播放";return}const F=Array.from(S.options).filter(q=>q.value!=="0");if(F.length<1){this.infoEl.textContent="当前数据集没有可播放的时间步";return}_.textContent="暂停时间步",this.timestepTimer=window.setInterval(()=>{const q=this.currentTimeStep>=F.length?1:this.currentTimeStep+1;this.executeCommand("set-timestep",{timeStep:q})},700)}),We(p.body,"play",_);const w=document.createElement("select");x(w),w.id="vis-colormap",w.setAttribute("aria-label","色图");for(const F of fm){const q=document.createElement("option");q.value=F,q.textContent=F,w.appendChild(q)}w.addEventListener("change",()=>{this.currentColormap=w.value,Qe.setColorMap({name:this.currentColormap}),this.reloadPropertyColors()}),We(p.body,"colorRamp",w);const L=document.createElement("div"),C=document.createElement("input");C.type="range",C.min="10",C.max="100",C.value="85",C.id="vis-opacity",Object.assign(C.style,{width:"100%",margin:"0"});const T=document.createElement("div");T.id="vis-opacity-value",T.style.cssText="font-size:11px;color:#8b949e;font-family:monospace;text-align:right;",T.textContent="0.85",C.addEventListener("input",()=>{this.applyOpacity(parseInt(C.value,10)/100)}),L.append(C,T),We(p.body,"opacity",L),We(p.body,"wireframe",Nt("vis-wireframe",!1,F=>{this.wireframe=F,this.applyWireframeMode()}));const W=document.createElement("div");W.style.cssText="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;";for(const F of["I","J","K"]){const q=document.createElement("input");q.type="text",q.placeholder=F,q.id="vis-filter-"+F.toLowerCase(),q.style.cssText="width:100%;padding:4px;background:#161b22;border:1px solid #30363d;border-radius:4px;color:#c9d1d9;font-size:11px;text-align:center;box-sizing:border-box;",q.addEventListener("input",()=>this.applyFilters()),q.addEventListener("change",()=>this.applyFilters()),W.appendChild(q)}We(p.body,"filterIJK",W);const v=document.createElement("div");v.style.cssText="display:flex;gap:4px;";const M=document.createElement("input");M.type="number",M.placeholder="min",M.step="0.01",M.id="vis-filter-prop-min",x(M),M.addEventListener("input",()=>this.applyFilters()),M.addEventListener("change",()=>this.applyFilters());const I=document.createElement("input");I.type="number",I.placeholder="max",I.step="0.01",I.id="vis-filter-prop-max",x(I),I.addEventListener("input",()=>this.applyFilters()),I.addEventListener("change",()=>this.applyFilters()),v.append(M,I),We(p.body,"propertyRange",v),We(p.body,"excludeRange",Nt("vis-filter-prop-exclude",!1,F=>{this.filterPropertyExclude=F,this.applyFilters()}));const X=document.createElement("input");X.type="range",X.min="1",X.max="1",X.value="1",X.id="vis-k-layer",Object.assign(X.style,{width:"100%",margin:"0"}),X.addEventListener("input",()=>{var ge;const F=this.sidebar.querySelector("#vis-filter-k"),q=(ge=this.sidebar.querySelector("#vis-isolate-k"))==null?void 0:ge.checked;F&&q&&(F.value=X.value+":"+X.value,this.applyFilters())}),We(p.body,"isolateK",Nt("vis-isolate-k",!1,F=>{const q=this.sidebar.querySelector("#vis-filter-k");q&&(q.value=F?X.value+":"+X.value:"",this.applyFilters())})),We(p.body,"kLayer",X);const J=document.createElement("div"),D=document.createElement("input");D.type="range",D.min="10",D.max="800",D.value="100",D.id="vis-z-scale",Object.assign(D.style,{width:"100%",margin:"0"});const U=document.createElement("div");U.id="vis-z-scale-value",U.style.cssText="font-size:11px;color:#8b949e;font-family:monospace;text-align:right;",U.textContent="1.00x",D.addEventListener("input",()=>{this.setZScale(parseInt(D.value,10)/100)}),J.append(D,U),We(p.body,"zScale",J),We(p.body,"orthographic",Nt("vis-ortho",!1,F=>this.setOrthographic(F)));const k=document.createElement("input");k.type="range",k.min="0",k.max="100",k.value="50",k.id="vis-clip-depth",Object.assign(k.style,{width:"100%",margin:"0"});const K=()=>{const F=this.sidebar.querySelector("#vis-clip");this.applyClipPlane(!!(F!=null&&F.checked),Number(k.value)/100)};k.addEventListener("input",K),We(p.body,"clipPlane",Nt("vis-clip",!1,()=>K())),We(p.body,"clipDepth",k);const Y=document.createElement("input");Y.type="text",Y.placeholder="x,y; x,y; ...",Y.id="vis-polyline",x(Y),We(g.body,"polyline",Y);const $=document.createElement("div");$.style.cssText="display:flex;gap:4px;";const Z=document.createElement("input");Z.type="number",Z.placeholder="z min",Z.value="0",Z.id="vis-section-z-min",x(Z);const ee=document.createElement("input");ee.type="number",ee.placeholder="z max",ee.value="5000",ee.id="vis-section-z-max",x(ee),$.append(Z,ee),We(g.body,"zRange",$);const z=bt("生成垂直剖面");z.style.marginBottom="0",z.addEventListener("click",()=>this.createIntersectionFromUI()),We(g.body,"intersection",z);const O=bt("沿井生成剖面");O.style.marginBottom="0",O.addEventListener("click",()=>{this.createWellSectionFromUI()}),We(g.body,"wellSection",O);const Q=document.createElement("div");Q.style.cssText="display:flex;gap:4px;";const oe=document.createElement("select");oe.id="vis-slice-axis",x(oe);for(const F of["k","i","j"]){const q=document.createElement("option");q.value=F,q.textContent=F.toUpperCase(),oe.appendChild(q)}const ue=document.createElement("input");ue.type="number",ue.min="1",ue.value="1",ue.id="vis-slice-index",x(ue),Q.append(oe,ue),We(g.body,"slice",Q);const he=bt("提取切片");he.style.marginBottom="0",he.addEventListener("click",()=>{this.createSliceFromUI()}),We(g.body,"extractSlice",he);const Te=bt("截图",{tone:"primary"});Te.style.marginBottom="0",Te.addEventListener("click",()=>this.captureScreenshot()),We(g.body,"capture",Te);const we=bt("属性统计");we.style.marginBottom="0",we.addEventListener("click",()=>this.showDatasetStats()),We(g.body,"stats",we);const ve=bt("导出属性 CSV");ve.style.marginBottom="0",ve.addEventListener("click",()=>this.exportDataset()),We(g.body,"exportCsv",ve);const ke=bt("导出场景 JSON");ke.style.marginBottom="0",ke.addEventListener("click",()=>this.exportSceneState()),We(g.body,"exportScene",ke);const H=bt("导入本地文件",{tone:"primary"});H.addEventListener("click",()=>{var F;return(F=this.fileInput)==null?void 0:F.click()}),We(g.body,"importFile",H);const lt=bt("从工作区导入");lt.addEventListener("click",()=>this.openWorkspaceImport()),We(g.body,"importWorkspace",lt);const Se=bt("删除当前对象",{tone:"danger"});Se.addEventListener("click",()=>{var q;const F=this.datasetById(this.selectedObjectId||((q=this.currentDataset)==null?void 0:q.id)||"");F&&this.deleteCatalogDataset(F)}),We(g.body,"deleteObject",Se);const Re=bt("运行基准测试",{tone:"primary"});Re.addEventListener("click",()=>this.runBenchmark()),u.panes.addons.appendChild(this.createLabel("性能测试")),u.panes.addons.appendChild(Re);const _e=bt("内存泄漏测试 (10x)",{tone:"danger"});_e.addEventListener("click",()=>this.runLeakTest()),u.panes.addons.appendChild(_e);const Ke=bt("恢复内置示例");Ke.addEventListener("click",()=>{this.restoreBuiltinExamples()}),u.panes.addons.appendChild(this.createLabel("目录")),u.panes.addons.appendChild(Ke);const Ae=Vr();u.panes.addons.appendChild(this.createLabel("显示")),u.panes.addons.appendChild(Ae.table),We(Ae.body,"axes",Nt("vis-show-axes",!0,F=>{this.axesHelper.visible=F})),We(Ae.body,"floorGrid",Nt("vis-show-grid",!0,F=>{this.gridHelper.visible=F})),We(Ae.body,"wellLabels",Nt("vis-show-well-labels",!0,F=>{this.wellLabelsVisible=F,this.setWellLabelsVisible(F)})),We(Ae.body,"legend",Nt("vis-show-legend",!0,F=>{this.legendEl.style.display=F&&this.currentProperty?"block":"none"})),We(Ae.body,"histogram",Nt("vis-show-histogram",!0,F=>{this.histogramEl&&(this.histogramEl.style.display=F&&this.currentScalarValues?"block":"none")})),We(Ae.body,"wellMap",Nt("vis-show-wellmap",!0,F=>{this.wellMapRoot.style.display=F?"block":"none"})),We(Ae.body,"compass",Nt("vis-show-compass",!0,F=>{this.compassHud.root.style.display=F?"flex":"none"}));const E=document.createElement("input");E.type="color",E.id="vis-bg-color",E.value="#0d1117",E.style.cssText="width:100%;height:24px;padding:0;border:1px solid #30363d;background:#161b22;",E.addEventListener("input",()=>this.setBackgroundColor(E.value)),We(Ae.body,"background",E),u.setBadge("controls",p.body.childElementCount),u.setBadge("actions",g.body.childElementCount),u.setBadge("addons",u.panes.addons.childElementCount);const y=bt("Save",{tone:"primary"});y.style.cssText+="flex:1;margin:0;width:auto;",y.addEventListener("click",()=>this.saveScene());const B=bt("Reset");B.style.cssText+="flex:1;margin:0;width:auto;",B.addEventListener("click",()=>this.resetInspectorControls());const te=document.createElement("div");return te.style.cssText="color:#6e7681;font-size:10px;white-space:nowrap;",te.textContent="场景",u.footer.append(y,B,te),n.appendChild(u.footer),e.appendChild(n),this.container.appendChild(e),e}buildObjectTree(){const e=document.createElement("div");Object.assign(e.style,{position:"absolute",top:"0",left:"0",bottom:"0",width:String(At.treeWidth)+"px",background:"rgba(13,17,23,0.96)",borderRight:"1px solid #30363d",overflowY:"auto",padding:"8px",zIndex:"90",boxSizing:"border-box",fontFamily:"-apple-system, sans-serif",color:"#8b949e",fontSize:"12px"}),e.className="oilgas-panel oilgas-object-panel";const t=document.createElement("button");t.type="button",t.textContent="<",t.title="收起组件树",t.setAttribute("aria-label","收起组件树"),Object.assign(t.style,this.iconButtonStyle),t.style.position="absolute",t.style.top="8px",t.style.right="6px",t.addEventListener("click",()=>this.toggleObjectTree(t)),e.appendChild(t);const n=document.createElement("div");n.style.cssText="font-weight:600; color:#58a6ff; margin:2px 28px 8px 2px; font-size:13px; letter-spacing:.04em;",n.textContent="COMPONENTS",e.appendChild(n);const s=document.createElement("input");s.type="search",s.id="vis-object-search",s.placeholder="查找组件...",s.setAttribute("aria-label","查找组件"),s.style.cssText="width:100%;box-sizing:border-box;margin-bottom:8px;padding:6px 8px;background:#161b22;border:1px solid #30363d;border-radius:6px;color:#c9d1d9;font-size:12px;",s.addEventListener("input",()=>{this.treeQuery=s.value,this.updateObjectTree()}),e.appendChild(s);const r=document.createElement("div");r.style.cssText="display:flex;gap:6px;margin-bottom:8px;";const o=(l,c,h)=>{const u=document.createElement("button");u.type="button",u.textContent=l,u.title=c,u.style.cssText="flex:1;padding:4px 6px;background:#21262d;color:#c9d1d9;border:1px solid #30363d;border-radius:5px;cursor:pointer;font-size:11px;",u.addEventListener("click",h),r.appendChild(u)};o("文件","导入本地文件",()=>{var l;return(l=this.fileInput)==null?void 0:l.click()}),o("工作区","从工作区文件树导入",()=>this.openWorkspaceImport()),o("恢复","恢复已隐藏的内置示例",()=>{this.restoreBuiltinExamples()}),e.appendChild(r);const a=document.createElement("div");return a.id="vis-object-list",a.innerHTML='<div style="color:#484f58">加载中...</div>',e.appendChild(a),this.container.appendChild(e),e}createLabel(e){const t=document.createElement("div");return t.textContent=e,t.style.cssText="margin: 14px 0 5px; padding-top: 8px; border-top: 1px solid rgba(48,54,61,.55); font-size: 11px; letter-spacing: .04em; color: #8b949e;",t}toggleSidebar(e){this.sidebarCollapsed=!this.sidebarCollapsed;const t=this.sidebarCollapsed?String(At.inspectorCollapsed)+"px":String(At.inspectorWidth)+"px";this.sidebar.style.width=t;const n=this.sidebar.querySelector("#vis-inspector-body");n&&(n.style.display=this.sidebarCollapsed?"none":"flex"),e.style.display="block",e.textContent=this.sidebarCollapsed?"<":">",e.title=this.sidebarCollapsed?"展开属性面板":"收起属性面板",e.setAttribute("aria-label",e.title),this.updatePanelOffsets()}toggleObjectTree(e){this.objectTreeCollapsed=!this.objectTreeCollapsed;const t=this.objectTreeCollapsed?String(At.treeCollapsed)+"px":String(At.treeWidth)+"px";this.objectTree.style.width=t,this.objectTree.style.padding=this.objectTreeCollapsed?"0":"8px";for(const n of Array.from(this.objectTree.children))n!==e&&(n.style.display=this.objectTreeCollapsed?"none":"");e.style.display="block",e.style.right=this.objectTreeCollapsed?"5px":"6px",e.textContent=this.objectTreeCollapsed?">":"<",e.title=this.objectTreeCollapsed?"展开组件树":"收起组件树",e.setAttribute("aria-label",e.title),this.updatePanelOffsets()}updatePanelOffsets(){var e,t;gm({tree:this.objectTree,inspector:this.sidebar,toolbar:this.toolbarEl,tabs:this.container.querySelector(".oilgas-view-tabs"),info:this.infoEl,hud:this.hudEl,readout:this.readoutEl,wellMap:this.wellMapRoot,legend:this.legendEl,histogram:this.histogramEl,details:this.detailsEl,wellLog:this.wellLogEl,slicePlayer:(e=this.slicePlayer)==null?void 0:e.root,compass:(t=this.compassHud)==null?void 0:t.root,viewCluster:this.viewClusterEl,shortcuts:this.shortcutsEl,treeCollapsed:this.objectTreeCollapsed,inspectorCollapsed:this.sidebarCollapsed})}buildToolbar(){const e=document.createElement("div");Object.assign(e.style,{position:"absolute",top:"8px",left:"276px",right:"288px",height:"34px",display:"flex",alignItems:"center",gap:"6px",padding:"4px 8px",background:"rgba(13,17,23,.78)",border:"1px solid #30363d",borderRadius:"7px",zIndex:"20",pointerEvents:"none",boxSizing:"border-box"}),e.className="oilgas-toolbar";const t=document.createElement("span");t.textContent="场景",t.style.cssText="font-size:11px;color:#8b949e;margin-right:4px;",e.appendChild(t);const n=(o,a,l)=>{const c=document.createElement("button");c.type="button",c.textContent=o,c.title=a,c.setAttribute("aria-label",a),Object.assign(c.style,{...this.iconButtonStyle,width:"auto",padding:"0 8px",fontSize:"11px",pointerEvents:"auto"}),c.addEventListener("click",l),e.appendChild(c)};n("导入","导入本地油气文件",()=>{var o;return(o=this.fileInput)==null?void 0:o.click()}),n("工作区","从项目或 Agent 工作区导入",()=>this.openWorkspaceImport()),n("适配","适配当前数据",()=>this.fitView()),n("顶视","顶视 (Alt+T)",()=>this.applyNamedView("top")),n("重置","重置视图",()=>this.resetView()),n("存视角","保存用户视角",()=>this.storeUserView()),n("用视角","恢复用户视角",()=>this.recallUserView()),n("撤销","撤销上一次筛选",()=>this.undoFilter()),n("重做","重做筛选",()=>this.redoFilter()),n("保存","保存当前场景",()=>this.saveScene()),n("恢复","恢复已保存场景",()=>{this.restoreScene()}),n("隐藏","隐藏当前对象",()=>{this.mesh&&(this.mesh.visible=!1)}),n("显示","显示当前对象",()=>{this.mesh&&(this.mesh.visible=!0)}),n("测距","测量两点之间的三维距离",()=>{this.measureMode=!this.measureMode,this.measurePoints=[],this.infoEl.textContent=this.measureMode?"测距模式：依次点击两个点":"已退出测距模式"}),n("对象","切换组件树",()=>{const o=this.objectTree.querySelector("button");o&&this.toggleObjectTree(o)});const s=document.createElement("span");s.style.flex="1",e.appendChild(s);const r=document.createElement("span");return r.textContent="拖拽旋转 · 滚轮缩放 · 点击拾取 · 悬停读数",r.style.cssText="font-size:11px;color:#8b949e;white-space:nowrap;",e.appendChild(r),this.container.appendChild(e),e}fitView(){const e=this.worldModelBox();if(e){this.frameBox(e);return}if(!this.geometry)return;this.geometry.computeBoundingBox();const t=this.geometry.boundingBox;t&&this.frameBox(t)}worldModelBox(){var n;const e=new An;let t=!1;(n=this.mesh)!=null&&n.visible&&(e.expandByObject(this.mesh),t=!0);for(const s of this.overlayMeshes.values())s.visible&&(e.expandByObject(s),t=!0);return t&&!e.isEmpty()?e:null}viewportAspect(){return Math.max(this.container.clientWidth/Math.max(this.container.clientHeight,1),.2)}applyCameraProjection(){const e=this.viewportAspect();if(this.camera instanceof Lt){this.camera.aspect=e,this.camera.updateProjectionMatrix();return}Xm(this.camera,Math.max(this.camera.position.distanceTo(this.controls.target),1),e)}frameBox(e,t="iso"){const n=e.getCenter(new R),s=Wm(e,this.viewportAspect(),this.perspectiveCamera.fov),r=Gm(t,n,s);this.camera.up.copy(r.up),this.camera.position.copy(r.position),this.controls.target.copy(n),this.applyCameraProjection(),this.controls.update()}resetView(){this.fitView(),this.resetInspectorControls()}resetInspectorControls(){this.resetFilters(),this.applyOpacity(.85);const e=this.sidebar.querySelector("#vis-wireframe");e&&(e.checked=!1,e.dispatchEvent(new Event("change")));const t=this.sidebar.querySelector("#vis-clip");t&&(t.checked=!1,t.dispatchEvent(new Event("change")));const n=this.sidebar.querySelector("#vis-isolate-k");n&&(n.checked=!1,n.dispatchEvent(new Event("change"))),this.currentColormap="viridis";const s=this.sidebar.querySelector("#vis-colormap");s&&(s.value=this.currentColormap),this.reloadPropertyColors(),this.infoEl.textContent="已重置显示与过滤"}filterStateSnapshot(){const e=t=>{var n;return((n=this.sidebar.querySelector(t))==null?void 0:n.value)||""};return JSON.stringify({i:e("#vis-filter-i"),j:e("#vis-filter-j"),k:e("#vis-filter-k"),min:e("#vis-filter-prop-min"),max:e("#vis-filter-prop-max"),exclude:this.filterPropertyExclude,bounds:this.filterBounds})}restoreFilterSnapshot(e){const t=JSON.parse(e),n={"#vis-filter-i":t.i||"","#vis-filter-j":t.j||"","#vis-filter-k":t.k||"","#vis-filter-prop-min":t.min||"","#vis-filter-prop-max":t.max||""};for(const[r,o]of Object.entries(n)){const a=this.sidebar.querySelector(r);a&&(a.value=o)}this.filterPropertyExclude=!!t.exclude;const s=this.sidebar.querySelector("#vis-filter-prop-exclude");s&&(s.checked=this.filterPropertyExclude,s.dispatchEvent(new Event("ugsci-sync"))),this.filterBounds=Array.isArray(t.bounds)&&t.bounds.length===6?t.bounds:null}undoFilter(){if(!this.filterUndoStack.length)return;this.filterRedoStack.push(this.filterStateSnapshot());const e=this.filterUndoStack.pop();this.restoringScene=!0,this.restoreFilterSnapshot(e),this.lastFilterState=e,this.applyFilters(),this.restoringScene=!1}redoFilter(){if(!this.filterRedoStack.length)return;this.filterUndoStack.push(this.filterStateSnapshot());const e=this.filterRedoStack.pop();this.restoringScene=!0,this.restoreFilterSnapshot(e),this.lastFilterState=e,this.applyFilters(),this.restoringScene=!1}saveScene(){if(!this.currentDataset)return;const e={datasetId:this.currentDataset.id,property:this.currentProperty,colormap:this.currentColormap,opacity:this.opacity,wireframe:this.wireframe,timeStep:this.currentTimeStep,filters:this.filterStateSnapshot(),overlays:Array.from(this.overlayMeshes.entries()).filter(([,t])=>t.visible).map(([t])=>t),zScale:this.zScale,ortho:this.useOrtho,camera:{position:this.camera.position.toArray(),target:this.controls.target.toArray(),up:this.camera.up.toArray()}};localStorage.setItem("ugsci.visualization.scene",JSON.stringify(e)),this.infoEl.textContent="场景已保存"}async restoreScene(){var t,n,s,r;const e=localStorage.getItem("ugsci.visualization.scene");if(!e){this.infoEl.textContent="没有已保存场景";return}try{const o=JSON.parse(e);if(this.restoringScene=!0,o.datasetId&&await this.loadDataset(String(o.datasetId)),o.property&&await this.executeCommand("set-property",{property:o.property}),o.colormap&&await this.executeCommand("set-colormap",{colormap:o.colormap}),Number.isFinite(o.opacity)&&await this.executeCommand("set-opacity",{opacity:o.opacity}),typeof o.wireframe=="boolean"&&await this.executeCommand("set-wireframe",{enabled:o.wireframe}),Number.isInteger(o.timeStep)&&await this.executeCommand("set-timestep",{timeStep:o.timeStep}),o.filters&&(this.restoreFilterSnapshot(o.filters),this.lastFilterState=o.filters,this.applyFilters()),Array.isArray(o.overlays)&&this.manifest)for(const a of o.overlays){const l=this.manifest.datasets.find(c=>c.id===a);l&&l.id!==((t=this.currentDataset)==null?void 0:t.id)&&await this.toggleDatasetVisibility(l,!0)}Number.isFinite(o.zScale)&&this.setZScale(Number(o.zScale)),typeof o.ortho=="boolean"&&this.setOrthographic(o.ortho),Array.isArray((n=o.camera)==null?void 0:n.position)&&o.camera.position.length===3&&this.camera.position.fromArray(o.camera.position),Array.isArray((s=o.camera)==null?void 0:s.target)&&o.camera.target.length===3&&this.controls.target.fromArray(o.camera.target),Array.isArray((r=o.camera)==null?void 0:r.up)&&o.camera.up.length===3&&this.camera.up.fromArray(o.camera.up),this.controls.update(),this.infoEl.textContent="场景已恢复"}catch(o){this.showDetails(`场景恢复失败: ${o instanceof Error?o.message:String(o)}`)}finally{this.restoringScene=!1}}exportSceneState(){if(!this.currentDataset)return;const e={schema:"qwenpaw.oilgas-scene.v1",exportedAt:new Date().toISOString(),datasetId:this.currentDataset.id,property:this.currentProperty,colormap:this.currentColormap,opacity:this.opacity,wireframe:this.wireframe,timeStep:this.currentTimeStep,filters:JSON.parse(this.filterStateSnapshot()),overlays:Array.from(this.overlayMeshes.entries()).filter(([,s])=>s.visible).map(([s])=>s),zScale:this.zScale,ortho:this.useOrtho,camera:{position:this.camera.position.toArray(),target:this.controls.target.toArray(),up:this.camera.up.toArray()}},t=URL.createObjectURL(new Blob([JSON.stringify(e,null,2)],{type:"application/json"})),n=document.createElement("a");n.href=t,n.download=`${this.currentDataset.id}.oilgas-scene.json`,n.click(),window.setTimeout(()=>URL.revokeObjectURL(t),1e3),this.infoEl.textContent="场景 JSON 已导出"}buildHud(){const e=document.createElement("div");Object.assign(e.style,{position:"absolute",top:"88px",right:"288px",background:"rgba(22,27,34,0.85)",border:"1px solid #30363d",borderRadius:"8px",padding:"8px 12px",fontSize:"11px",fontFamily:"monospace",pointerEvents:"none",zIndex:"10",minWidth:"148px"});for(const t of["FPS","Frame","Draw Calls","Triangles","JS Heap"]){const n=document.createElement("div");n.style.cssText="display: flex; justify-content: space-between; gap: 16px; margin: 2px 0;";const s=document.createElement("span");s.textContent=t,s.style.color="#8b949e";const r=document.createElement("span");r.textContent="—",r.style.color="#58a6ff",r.style.fontWeight="600",r.dataset.metric=t,n.appendChild(s),n.appendChild(r),e.appendChild(n)}return this.container.appendChild(e),e}buildReadout(){const e=Lm();return this.container.appendChild(e),e}buildInfoBar(){const e=document.createElement("div");return Object.assign(e.style,{position:"absolute",bottom:"8px",left:"8px",background:"rgba(22,27,34,0.85)",border:"1px solid #30363d",borderRadius:"8px",padding:"8px 12px",fontSize:"12px",fontFamily:"monospace",color:"#8b949e",pointerEvents:"none",maxWidth:"500px",zIndex:"10"}),e.textContent="加载中...",this.container.appendChild(e),e}buildDetailsPanel(){const e=document.createElement("div");return Object.assign(e.style,{position:"absolute",right:"8px",bottom:"8px",width:"270px",maxHeight:"260px",overflowY:"auto",display:"none",background:"rgba(13,17,23,0.94)",border:"1px solid #30363d",borderRadius:"8px",padding:"10px",fontSize:"12px",lineHeight:"1.5",color:"#c9d1d9",zIndex:"12",whiteSpace:"pre-wrap"}),this.container.appendChild(e),e}buildLegend(){const e=document.createElement("div");Object.assign(e.style,{position:"absolute",right:"8px",bottom:"278px",width:"178px",padding:"9px 10px",background:"rgba(13,17,23,.88)",border:"1px solid #30363d",borderRadius:"7px",zIndex:"11",color:"#c9d1d9",fontSize:"11px",pointerEvents:"auto",cursor:"pointer",boxSizing:"border-box"}),e.title="点击编辑属性范围",e.addEventListener("click",()=>{const r=this.sidebar.querySelector("#vis-filter-prop-min");r==null||r.focus()});const t=document.createElement("div");t.dataset.legendTitle="true",t.style.cssText="display:flex;justify-content:space-between;gap:8px;margin-bottom:6px;color:#c9d1d9;font-weight:600;",e.appendChild(t);const n=document.createElement("div");n.dataset.legendGradient="true",n.style.cssText="height:8px;border-radius:4px;background:linear-gradient(90deg,#440154,#31688e,#35b779,#fde725);",e.appendChild(n);const s=document.createElement("div");return s.dataset.legendRange="true",s.style.cssText="display:flex;justify-content:space-between;margin-top:4px;color:#8b949e;font-family:monospace;",e.appendChild(s),this.container.appendChild(e),this.updateLegend(),e}updateLegend(){if(!this.legendEl)return;const e=this.legendEl.querySelector("[data-legend-title]"),t=this.legendEl.querySelector("[data-legend-range]");e&&(e.textContent=`${this.currentProperty||"统一颜色"} · ${this.currentColormap}`),t&&(t.textContent=`${this.scalarMin.toPrecision(4)}  —  ${this.scalarMax.toPrecision(4)}`);const n=this.legendEl.querySelector("[data-legend-gradient]");n&&(n.style.background=pm(this.currentColormap)),this.legendEl.style.display=this.currentProperty&&this.legendVisible()?"block":"none",this.renderHistogram()}legendVisible(){var e;return((e=this.sidebar.querySelector("#vis-show-legend"))==null?void 0:e.checked)!==!1}histogramVisible(){var e;return((e=this.sidebar.querySelector("#vis-show-histogram"))==null?void 0:e.checked)!==!1}buildHistogram(){const e=document.createElement("canvas");return e.width=220,e.height=72,Object.assign(e.style,{position:"absolute",right:"12px",bottom:"92px",width:"160px",height:"56px",background:"rgba(13,17,23,.82)",border:"1px solid #30363d",borderRadius:"6px",zIndex:"12"}),e.title="点击设最小值，Shift+点击设最大值，双击清除",e.addEventListener("click",t=>this.onHistogramClick(t)),e.addEventListener("dblclick",()=>{const t=this.sidebar.querySelector("#vis-filter-prop-min"),n=this.sidebar.querySelector("#vis-filter-prop-max");t&&(t.value=""),n&&(n.value=""),this.applyFilters()}),this.container.appendChild(e),e}buildWellLogPanel(){const e=document.createElement("canvas");return e.width=360,e.height=720,Object.assign(e.style,{position:"absolute",top:"88px",right:"12px",bottom:"16px",width:"280px",background:"rgba(13,17,23,.94)",border:"1px solid #30363d",borderRadius:"8px",zIndex:"25",display:"none"}),e.title="测井曲线",this.container.appendChild(e),e}renderHistogram(){const e=this.histogramEl;if(!e)return;const t=e.getContext("2d");if(!t)return;t.fillStyle="#0d1117",t.fillRect(0,0,e.width,e.height);const n=this.currentScalarValues;if(!n||n.length<2){e.style.display="none";return}e.style.display=this.histogramVisible()?"block":"none";const s=24,r=new Array(s).fill(0),o=this.scalarMin,l=this.scalarMax-o||1;for(const h of n){if(!Number.isFinite(h))continue;const u=Math.min(s-1,Math.max(0,Math.floor((h-o)/l*s)));r[u]+=1}const c=Math.max(...r,1);for(let h=0;h<s;h++){const[u,d,p]=Fr(this.currentColormap,(h+.5)/s);t.fillStyle=`rgb(${Math.round(u*255)},${Math.round(d*255)},${Math.round(p*255)})`;const g=r[h]/c*(e.height-8);t.fillRect(h*(e.width/s),e.height-g,e.width/s-1,g)}}renderWellLog(){var x;const e=this.wellLogEl;if(!e||!this.currentDataset)return;const t=e.getContext("2d");if(!t)return;const n=e.width,s=e.height;t.fillStyle="#0d1117",t.fillRect(0,0,n,s),t.fillStyle="#58a6ff",t.font="14px sans-serif",t.fillText(this.currentDataset.name,12,22);const r=this.currentDataset.files.scalars||{},o=Object.keys(r).slice(0,4);if(!this.currentScalarValues||o.length===0){t.fillStyle="#8b949e",t.fillText("当前数据集没有测井曲线",12,48);return}const a=(x=this.geometry)==null?void 0:x.getAttribute("position"),l=this.currentScalarValues.length,c=40,u=s-c-20,d=(n-20)/Math.max(o.length,1);t.strokeStyle="#30363d";for(let m=0;m<o.length;m++){const f=10+m*d;t.strokeRect(f,c,d-8,u),t.fillStyle="#8b949e",t.font="11px sans-serif",t.fillText(o[m],f+4,c-8)}const p=this.scalarMin,g=this.scalarMax-this.scalarMin||1;t.strokeStyle="#58a6ff",t.beginPath();for(let m=0;m<l;m++){const f=l<=1?0:m/(l-1),S=c+f*u,_=14+(this.currentScalarValues[m]-p)/g*(d-16);m===0?t.moveTo(_,S):t.lineTo(_,S)}if(t.stroke(),a){t.fillStyle="#8b949e",t.font="10px monospace";const m=Math.abs(a.getZ(0)+this.origin[2]),f=Math.abs(a.getZ(Math.max(0,a.count-1))+this.origin[2]);t.fillText(`${m.toFixed(1)}`,12,c+10),t.fillText(`${f.toFixed(1)}`,12,s-8)}}applyClipPlane(e,t){var o;if(!((o=this.geometry)!=null&&o.boundingBox)||!this.mesh)return;const n=this.geometry.boundingBox,s=n.min.z+(n.max.z-n.min.z)*(1-Math.min(1,Math.max(0,t)));this.clipPlane.setFromNormalAndCoplanarPoint(new R(0,0,-1),new R(0,0,s)),this.renderer.localClippingEnabled=e;const r=this.mesh.material;r&&"clippingPlanes"in r&&(r.clippingPlanes=e?[this.clipPlane]:[],r.needsUpdate=!0)}overlaySources(e){return e==="wellbore"||e==="welllog"?["wellbore","las","dlis"]:e==="intersection"?["intersection","well-intersection","slice","surface"]:e==="network"?["network","network-tube"]:[]}async applyActiveView(e){var r,o,a;if(Qe.setActiveView(e),this.infoEl.textContent=`当前视图: ${Bi.VIEW_LABELS[e]}`,this.wellLogEl&&(this.wellLogEl.style.display=e==="welllog"?"block":"none"),this.wellMapRoot&&(this.wellMapRoot.style.display=e==="welllog"?"none":"block"),!this.manifest)return;const t=l=>l.source||"",n=l=>this.manifest.datasets.find(c=>l.includes(t(c))),s=((r=this.currentDataset)==null?void 0:r.source)||"";if(e==="reservoir"){const l=this.manifest.datasets.find(c=>!this.overlaySources("wellbore").concat(this.overlaySources("intersection"),this.overlaySources("network"),["surface"]).includes(t(c)));l&&l.id!==((o=this.currentDataset)==null?void 0:o.id)&&await this.loadDataset(l.id)}else if(e==="wellbore"){if(!(this.currentDataset&&at(this.currentDataset))){const l=this.manifest.datasets.find(at);l?await this.loadDataset(l.id):this.infoEl.textContent="没有空间井轨迹。测井曲线请用「测井」页签；LAS 不会画在原点。"}}else if(e==="intersection"){if(!["intersection","well-intersection","slice"].includes(s)){const l=n(["intersection","well-intersection","slice"]);l?await this.loadDataset(l.id):this.infoEl.textContent="没有剖面。请生成垂直剖面、井剖面或 IJK 切片。"}}else if(e==="welllog"){const l=n(["las","dlis"]);l&&l.id!==((a=this.currentDataset)==null?void 0:a.id)&&await this.loadDataset(l.id),this.renderWellLog(),l||(this.infoEl.textContent="没有测井曲线。请导入 LAS/DLIS 文件。")}else if(e==="network"&&!["network","network-tube"].includes(s)){const l=n(["network","network-tube"]);l?await this.loadDataset(l.id):this.infoEl.textContent="没有管网数据。请导入 CSV/JSON 管网。"}}firstWellDataset(){var e;return(e=this.manifest)==null?void 0:e.datasets.find(at)}async createWellSectionFromUI(){var n;if(!this.currentDataset)return;const e=at(this.currentDataset)?this.currentDataset:this.firstWellDataset();if(!e){this.showDetails("没有空间井轨迹，无法生成井剖面。仅深度测井不能用来切三维剖面。");return}const t=((n=this.manifest)==null?void 0:n.datasets.find(s=>["cmg","egrid","roff","eclipse"].includes(s.source||"")||s.grid_dims))||this.currentDataset;try{const s=await fetch(`${this.apiBase}/datasets/${encodeURIComponent(t.id)}/well-sections`,{method:"POST",headers:{...this.authHeaders(),"Content-Type":"application/json"},body:JSON.stringify({well_dataset_id:e.id,offset:50,property:this.currentProperty,name:`wellsec_${Date.now()}`})});if(!s.ok){this.showDetails(`井剖面生成失败: HTTP ${s.status}`);return}const r=await s.json();this.manifest=await this.fetchJson("/manifest"),this.updateObjectTree(),await this.loadDataset(r.id),this.viewRouter.switchTo("intersection"),this.showDetails(`井剖面已生成：${r.name}`)}catch(s){this.showDetails(`井剖面生成失败：${s instanceof Error?s.message:String(s)}`)}}async createSliceFromUI(){var n,s;if(!this.currentDataset)return;const e=((n=this.sidebar.querySelector("#vis-slice-axis"))==null?void 0:n.value)||"k",t=Number(((s=this.sidebar.querySelector("#vis-slice-index"))==null?void 0:s.value)||1);try{const r=await fetch(`${this.apiBase}/datasets/${encodeURIComponent(this.currentDataset.id)}/slices`,{method:"POST",headers:{...this.authHeaders(),"Content-Type":"application/json"},body:JSON.stringify({axis:e,index:t,property:this.currentProperty,name:`slice_${e}${t}_${Date.now()}`})});if(!r.ok){this.showDetails(`切片生成失败: HTTP ${r.status}`);return}const o=await r.json();this.manifest=await this.fetchJson("/manifest"),this.updateObjectTree(),await this.loadDataset(o.id),this.viewRouter.switchTo("intersection"),this.showDetails(`切片已生成：${o.name}`)}catch(r){this.showDetails(`切片生成失败：${r instanceof Error?r.message:String(r)}`)}}showDetails(e){this.detailsEl.textContent=e,this.detailsEl.style.display="block"}async showDatasetStats(){if(!this.currentDataset||!this.currentProperty){this.showDetails("当前数据集没有可统计属性");return}try{const e=await this.fetchJson(`/datasets/${encodeURIComponent(this.currentDataset.id)}/stats?property=${encodeURIComponent(this.currentProperty)}`);this.showDetails([`属性统计 · ${e.property}`,`样本数: ${Number(e.count).toLocaleString()}`,`最小值: ${Number(e.min).toPrecision(6)}`,`P10: ${Number(e.p10).toPrecision(6)}`,`中位数: ${Number(e.p50).toPrecision(6)}`,`平均值: ${Number(e.mean).toPrecision(6)}`,`P90: ${Number(e.p90).toPrecision(6)}`,`最大值: ${Number(e.max).toPrecision(6)}`].join(`
`))}catch(e){this.showDetails(`统计失败: ${e instanceof Error?e.message:String(e)}`)}}async exportDataset(){if(!this.currentDataset)return;const e=`${this.apiBase}/datasets/${encodeURIComponent(this.currentDataset.id)}/export?format=csv`,t=await fetch(e,{headers:this.authHeaders()});if(!t.ok){this.showDetails(`导出失败: HTTP ${t.status}`);return}const n=await t.blob(),s=URL.createObjectURL(n),r=document.createElement("a");r.href=s,r.download=`${this.currentDataset.id}.csv`,r.click(),window.setTimeout(()=>URL.revokeObjectURL(s),1e3),this.showDetails("属性 CSV 已导出")}async createIntersectionFromUI(){var r,o;if(!this.currentDataset)return;const e=this.sidebar.querySelector("#vis-polyline"),t=Number(((r=this.sidebar.querySelector("#vis-section-z-min"))==null?void 0:r.value)||0),n=Number(((o=this.sidebar.querySelector("#vis-section-z-max"))==null?void 0:o.value)||5e3),s=((e==null?void 0:e.value)||"").split(";").map(a=>a.trim()).filter(Boolean).map(a=>{const[l,c]=a.split(",").map(Number);return[l,c]});if(s.length<2||s.some(([a,l])=>!Number.isFinite(a)||!Number.isFinite(l))||!Number.isFinite(t)||!Number.isFinite(n)||n<=t){this.showDetails("剖面参数无效：至少需要两个 x,y 点，且 z max > z min");return}try{const a=await fetch(`${this.apiBase}/datasets/${encodeURIComponent(this.currentDataset.id)}/intersections`,{method:"POST",headers:{...this.authHeaders(),"Content-Type":"application/json"},body:JSON.stringify({polyline_x:s.map(([c])=>c),polyline_y:s.map(([,c])=>c),z_min:t,z_max:n,name:`section_${Date.now()}`,property:this.currentProperty})});if(!a.ok){this.showDetails(`剖面生成失败: HTTP ${a.status}`);return}const l=await a.json();this.manifest=await this.fetchJson("/manifest"),this.updateObjectTree(),this.showDetails(`剖面已生成：${l.name}`),await this.loadDataset(l.id),this.viewRouter.switchTo("intersection")}catch(a){this.showDetails(`剖面生成失败：${a instanceof Error?a.message:String(a)}`)}}async init(){try{await this.refreshCatalog()}catch(e){this.infoEl.textContent=`加载失败: ${e instanceof Error?e.message:String(e)}`}}syncDatasetSelect(){const e=this.sidebar.querySelector("#vis-dataset");if(!e||!this.manifest)return;const t=e.value;e.innerHTML="";for(const n of this.manifest.datasets){const s=document.createElement("option");s.value=n.id,s.textContent=`${n.name} (${n.n_cells.toLocaleString()} cells)`,e.appendChild(s)}this.manifest.datasets.some(n=>n.id===t)&&(e.value=t)}preferredDatasetId(){return!this.manifest||this.manifest.datasets.length===0?null:(this.manifest.datasets.find(t=>Bn(t)&&Object.keys(t.files.scalars||{}).length>0)||this.manifest.datasets.find(Bn)||this.manifest.datasets.find(t=>!["intersection","well-intersection"].includes(t.source||"")&&!Ut(t)&&Object.keys(t.files.scalars||{}).length>0)||this.manifest.datasets[0]).id}async refreshCatalog(e){var r;this.manifest=await this.fetchJson("/manifest"),this.syncDatasetSelect(),this.updateObjectTree();const t=((r=this.manifest)==null?void 0:r.datasets)||[];if(t.length===0){this.clearSceneForEmptyCatalog(),this.infoEl.textContent="场景为空。可用工具栏「导入」或从工作区选择文件。";return}const n=e&&t.some(o=>o.id===e)?e:null;if(n){await this.loadDataset(n);return}if(this.currentDataset&&t.some(o=>{var a;return o.id===((a=this.currentDataset)==null?void 0:a.id)}))return;const s=this.preferredDatasetId();s&&await this.loadDataset(s)}clearSceneForEmptyCatalog(){this.currentDataset=null,this.selectedObjectId=null,this.disposeCurrentMesh(),this.clearOverlays(),Qe.setDataset(null),this.updateObjectTree()}importDialogHost(){return{apiBase:this.apiBase,authToken:this.authToken,container:this.container,onStatus:e=>{this.infoEl.textContent=e},onImported:async e=>{this.infoEl.textContent="导入完成，正在加载三维场景",await this.refreshCatalog(e)}}}openWorkspaceImport(){Vm(this.importDialogHost())}async handlePickedFiles(e){if(this.importBusy){this.infoEl.textContent="已有导入任务进行中";return}this.importBusy=!0;try{await zm(this.importDialogHost(),e)}catch(t){this.infoEl.textContent=t instanceof Error?t.message:String(t)}finally{this.importBusy=!1}}async deleteCatalogDataset(e){var s;const t=!!(e.metadata&&e.metadata.managed);if(window.confirm(t?`删除「${e.name}」及其缓存文件？此操作不可恢复。`:`从场景移除「${e.name}」？内置示例可在组件树「恢复」或 Addons 中重新显示。`))try{const r=await fetch(`${this.apiBase}/datasets/${encodeURIComponent(e.id)}`,{method:"DELETE",headers:this.authHeaders()});if(!r.ok)throw new Error(`删除失败: HTTP ${r.status}`);const o=await r.json();this.infoEl.textContent=o.status==="removed"?`已删除 ${e.name}`:`已从场景移除 ${e.name}（示例文件仍保留，可恢复）`,((s=this.currentDataset)==null?void 0:s.id)===e.id&&(this.currentDataset=null),this.selectedObjectId===e.id&&(this.selectedObjectId=null);const a=this.overlayMeshes.get(e.id);a&&(this.disposeObject3D(a),this.overlayMeshes.delete(e.id)),await this.refreshCatalog()}catch(r){this.infoEl.textContent=r instanceof Error?r.message:String(r)}}async restoreBuiltinExamples(){try{const e=await fetch(`${this.apiBase}/catalog/restore-examples`,{method:"POST",headers:this.authHeaders()});if(!e.ok)throw new Error(`恢复失败: HTTP ${e.status}`);const t=await e.json();await this.refreshCatalog(),this.infoEl.textContent=t.count?`已恢复 ${t.count} 个内置示例`:"没有已隐藏的内置示例"}catch(e){this.infoEl.textContent=e instanceof Error?e.message:String(e)}}updateObjectTree(){var n;const e=this.objectTree.querySelector("#vis-object-list");if(!e||!this.manifest)return;const t=this.collectVisibleIds();Em(e,this.manifest.datasets,{query:this.treeQuery,activeId:((n=this.currentDataset)==null?void 0:n.id)||null,selectedId:this.selectedObjectId,visibleIds:t,collapsedGroups:this.collapsedGroups,onToggleGroup:s=>{this.collapsedGroups.has(s)?this.collapsedGroups.delete(s):this.collapsedGroups.add(s),this.updateObjectTree()},onToggleVisible:(s,r)=>{this.toggleDatasetVisibility(s,r)},onSelect:s=>{this.selectDatasetFromTree(s)},onFocus:s=>{this.focusDataset(s)},onDelete:s=>{this.deleteCatalogDataset(s)},onContextMenu:(s,r)=>{this.openObjectContextMenu(s,r.clientX,r.clientY)}})}isLineDataset(e){return["network","network-tube"].includes(e.source||"")}datasetById(e){var t;return(t=this.manifest)==null?void 0:t.datasets.find(n=>n.id===e)}applyNamedView(e){const t=this.worldModelBox();if(!t){this.infoEl.textContent="没有可适配的对象";return}this.frameBox(t,e),this.infoEl.textContent="视角: "+e}setZScale(e){this.zScale=Math.min(8,Math.max(.1,e)),this.modelRoot.scale.set(1,1,this.zScale);const t=this.sidebar.querySelector("#vis-z-scale-value");t&&(t.textContent=this.zScale.toFixed(2)+"x");const n=this.sidebar.querySelector("#vis-z-scale");n&&(n.value=String(Math.round(this.zScale*100)))}setOrthographic(e){this.useOrtho=e;const t=this.camera,n=e?this.orthoCamera:this.perspectiveCamera;n.position.copy(t.position),n.up.copy(t.up),n.lookAt(this.controls.target),this.camera=n,this.controls.object=n,this.applyCameraProjection(),this.controls.update();const s=this.sidebar.querySelector("#vis-ortho");s&&s.checked!==e&&(s.checked=e,s.dispatchEvent(new Event("ugsci-sync"))),this.infoEl.textContent=e?"正交投影":"透视投影"}setBackgroundColor(e){const t=new Ue(e);this.scene.background=t;const n=this.scene.fog;n instanceof Ni&&n.color.copy(t)}setWellLabelsVisible(e){const t=n=>{n==null||n.traverse(s=>{s.name==="oilgas-well-label"&&(s.visible=e)})};t(this.mesh);for(const n of this.overlayMeshes.values())t(n)}applySliceAxis(e){const t=this.sidebar.querySelector("#vis-filter-i"),n=this.sidebar.querySelector("#vis-filter-j"),s=this.sidebar.querySelector("#vis-filter-k");if(!e){t&&(t.value=""),n&&(n.value=""),s&&(s.value=""),this.applyFilters();return}this.applySliceIndex(e,this.slicePlayer.index())}applySliceIndex(e,t){const n=this.sidebar.querySelector("#vis-filter-i"),s=this.sidebar.querySelector("#vis-filter-j"),r=this.sidebar.querySelector("#vis-filter-k");n&&(n.value=e==="i"?Wr(t):""),s&&(s.value=e==="j"?Wr(t):""),r&&(r.value=e==="k"?Wr(t):""),this.applyFilters()}setSlicePlaying(e){this.sliceTimer!==null&&(window.clearInterval(this.sliceTimer),this.sliceTimer=null),e&&(this.sliceTimer=window.setInterval(()=>{var a;const t=this.slicePlayer.axis();if(!t){this.slicePlayer.setPlaying(!1),this.setSlicePlaying(!1);return}const n=(a=this.currentDataset)==null?void 0:a.grid_dims,s=t==="i"?n==null?void 0:n[0]:t==="j"?n==null?void 0:n[1]:n==null?void 0:n[2],r=Math.max(1,Number(s)||1),o=this.slicePlayer.index()%r+1;this.slicePlayer.setIndex(o)},400))}storeUserView(){const e={position:this.camera.position.toArray(),target:this.controls.target.toArray(),up:this.camera.up.toArray(),zScale:this.zScale,ortho:this.useOrtho};localStorage.setItem(Ul,JSON.stringify(e)),this.infoEl.textContent="用户视角已保存"}recallUserView(){const e=localStorage.getItem(Ul);if(!e){this.infoEl.textContent="没有已保存视角";return}try{const t=JSON.parse(e);Number.isFinite(t.zScale)&&this.setZScale(Number(t.zScale)),typeof t.ortho=="boolean"&&this.setOrthographic(t.ortho),Array.isArray(t.position)&&this.camera.position.fromArray(t.position),Array.isArray(t.target)&&this.controls.target.fromArray(t.target),Array.isArray(t.up)&&this.camera.up.fromArray(t.up),this.applyCameraProjection(),this.controls.update(),this.infoEl.textContent="已恢复用户视角"}catch{this.infoEl.textContent="视角数据无效"}}openObjectContextMenu(e,t,n){$m(this.container,t,n,Ym(!!e),s=>{this.handleObjectContext(e,s)})}async handleObjectContext(e,t){if(t==="show-all"){this.showAllVisible();return}e&&(t==="focus"?await this.focusDataset(e):t==="isolate"?await this.isolateDataset(e):t==="hide"?await this.toggleDatasetVisibility(e,!1):t==="delete"&&await this.deleteCatalogDataset(e))}async isolateDataset(e){var t;this.mesh&&this.currentDataset&&(this.mesh.visible=this.currentDataset.id===e.id);for(const[n,s]of this.overlayMeshes)s.visible=n===e.id;if(e.id!==((t=this.currentDataset)==null?void 0:t.id)){await this.toggleDatasetVisibility(e,!0,{quiet:!0});const n=this.overlayMeshes.get(e.id);n&&(n.visible=!0),this.mesh&&(this.mesh.visible=!1)}this.infoEl.textContent="仅显示 "+e.name,this.updateObjectTree()}showAllVisible(){this.mesh&&(this.mesh.visible=!0);for(const e of this.overlayMeshes.values())e.visible=!0;this.updateObjectTree(),this.infoEl.textContent="已显示全部已加载对象"}hitToModelPoint(e){return this.modelRoot.worldToLocal(e.clone())}onHistogramClick(e){if(e.detail>1||!this.histogramEl)return;const t=this.scalarMax-this.scalarMin;if(!Number.isFinite(t)||t===0)return;const n=this.histogramEl.getBoundingClientRect(),s=Math.min(1,Math.max(0,(e.clientX-n.left)/Math.max(n.width,1))),r=this.scalarMin+s*t,o=this.sidebar.querySelector("#vis-filter-prop-min"),a=this.sidebar.querySelector("#vis-filter-prop-max");e.shiftKey?a&&(a.value=String(r)):o&&(o.value=String(r)),this.applyFilters()}updateCompassHud(){this.compassHud.setAzimuth(jm(this.camera.position,this.controls.target)),this.compassHud.setMetersPerPixel(qm(this.camera,this.controls.target,this.container.clientHeight))}collectVisibleIds(){var t;const e=new Set;(t=this.mesh)!=null&&t.visible&&this.currentDataset&&e.add(this.currentDataset.id);for(const[n,s]of this.overlayMeshes)s.visible&&e.add(n);return e}selectionTypeFor(e){return at(e)||Ut(e)?"well":this.isLineDataset(e)?"segment":(Bn(e),"surface")}tagSceneObject(e,t){e.userData.datasetId=t.id,e.userData.kind=this.selectionTypeFor(t)}applyOpacity(e){this.opacity=e;const t=this.sidebar.querySelector("#vis-opacity-value");t&&(t.textContent=e.toFixed(2));const n=this.sidebar.querySelector("#vis-opacity");n&&(n.value=String(Math.round(e*100)));const s=this.overlayMeshes.get(this.selectedObjectId||"")||this.mesh;this.visitObjectMaterials(s,r=>{r.opacity=e,r.transparent=e<.999,r.needsUpdate=!0})}visitObjectMaterials(e,t){e&&e.traverse(n=>{const s=n;s.material&&(Array.isArray(s.material)?s.material.forEach(t):t(s.material))})}publishSelection(e){var t;(e==null?void 0:e.type)==="cell"?this.selectedObjectId=((t=this.currentDataset)==null?void 0:t.id)||null:this.selectedObjectId=(e==null?void 0:e.id)||null,Qe.setSelection(e),e&&this.onSelectionCallback&&this.onSelectionCallback({type:e.type,id:e.id,coords:e.coordinates}),this.updateInspectorObject(),this.updateReadoutHud(),this.highlightSelection(),this.refreshWellMap(),this.updateObjectTree()}updateInspectorObject(){var o;const e=this.sidebar.querySelector("[data-object-name]"),t=this.sidebar.querySelector("[data-object-meta]"),n=this.sidebar.querySelector("#vis-inspector-visible"),s=Qe.getState().selected,r=this.datasetById(this.selectedObjectId||((o=this.currentDataset)==null?void 0:o.id)||"");if(!r){e&&(e.textContent="未选中对象"),t&&(t.textContent="在组件树或三维视图中点选");return}if(e&&(e.textContent=at(r)||Ut(r)?an(r):r.name),t){const a=[(s==null?void 0:s.type)==="cell"?"cell "+s.id:r.source||"object",r.n_cells?r.n_cells.toLocaleString()+" cells":"",s!=null&&s.coordinates?"E "+s.coordinates[0].toFixed(1)+"  N "+s.coordinates[1].toFixed(1):""].filter(Boolean);t.textContent=a.join(" · ")}n&&(n.checked=this.collectVisibleIds().has(r.id),n.disabled=Ut(r),n.dispatchEvent(new Event("ugsci-sync")))}updateReadoutHud(){var n;if(!this.readoutEl)return;const e=Qe.getState().selected,t=this.datasetById(this.selectedObjectId||((n=this.currentDataset)==null?void 0:n.id)||"");Pm(this.readoutEl,{hover:this.hoverCoords,selectedLabel:t?at(t)||Ut(t)?an(t):t.name:"—",selectedMeta:(e==null?void 0:e.type)==="cell"?"Cell "+e.id:(t==null?void 0:t.source)||"",pickKind:(e==null?void 0:e.type)||""})}highlightSelection(){if(this.highlightedOverlayId){const n=this.objectForId(this.highlightedOverlayId);this.setObjectHighlight(n,!1),this.highlightedOverlayId=null}const e=Qe.getState().selected;if(!e||e.type==="cell"||!this.selectedObjectId)return;const t=this.objectForId(this.selectedObjectId);t&&(this.setObjectHighlight(t,!0),this.highlightedOverlayId=this.selectedObjectId)}objectForId(e){var t;return this.overlayMeshes.has(e)?this.overlayMeshes.get(e)||null:((t=this.currentDataset)==null?void 0:t.id)===e?this.mesh:null}setObjectHighlight(e,t){this.visitObjectMaterials(e,n=>{const s=n;s.color&&(t?(s.userData._baseColor==null&&(s.userData._baseColor=s.color.getHex()),s.color.setHex(16765286),s.emissive&&s.emissive.setHex(3811840)):s.userData._baseColor!=null&&(s.color.setHex(s.userData._baseColor),s.emissive&&s.emissive.setHex(0)))})}recordWellPlan(e,t){const n=Br(t);if(!n.length)return;const s=this.origin,r=Math.max(1,Math.floor(n.length/48)),o=[];for(let h=0;h<n.length;h+=r)o.push([n[h][0]+s[0],n[h][1]+s[1]]);const a=n[n.length-1],l=[a[0]+s[0],a[1]+s[1]];(!o.length||o[o.length-1][0]!==l[0]||o[o.length-1][1]!==l[1])&&o.push(l);const c=n[0];this.wellPlanPoints.set(e.id,{id:e.id,name:an(e),x:c[0]+s[0],y:c[1]+s[1],z:c[2]+s[2],path:o}),this.refreshWellMap()}refreshWellMap(){this.wellMapCanvas&&Rm(this.wellMapCanvas,Array.from(this.wellPlanPoints.values()),this.selectedObjectId,this.gridMapBounds)}updateGridMapBounds(){if(!this.geometry){this.gridMapBounds=null;return}this.geometry.computeBoundingBox();const e=this.geometry.boundingBox;if(!e){this.gridMapBounds=null;return}this.gridMapBounds={minX:e.min.x+this.origin[0],minY:e.min.y+this.origin[1],maxX:e.max.x+this.origin[0],maxY:e.max.y+this.origin[1]},this.refreshWellMap()}syncChromeFromStore(){var n,s,r,o;const e=Qe.getState(),t=[((n=e.dataset)==null?void 0:n.id)||"",e.activeView,((s=e.selected)==null?void 0:s.type)||"",((r=e.selected)==null?void 0:r.id)||"",((o=e.property)==null?void 0:o.name)||""].join("|");t!==this.lastChromeKey&&(this.lastChromeKey=t,this.updateReadoutHud(),this.updateInspectorObject())}async focusDataset(e){await this.selectDatasetFromTree(e);const t=this.objectForId(e.id);t&&this.frameObject(t)}makeWellLabel(e){const t=document.createElement("div");t.textContent=e,t.style.cssText="color:#f0c14b;font:600 11px/1.2 sans-serif;white-space:nowrap;text-shadow:0 1px 2px #000;pointer-events:none;user-select:none;";const n=new rm(t);return n.name="oilgas-well-label",n.visible=this.wellLabelsVisible,n}buildWellObject(e,t){const n=ig(t);if(!n)return null;const s=new Nn;s.name=`oilgas-well-${e.id}`,s.add(n);const r=Br(t)[0],o=this.makeWellLabel(an(e));return r&&o.position.set(r[0],r[1],r[2]),s.add(o),s}disposeObject3D(e){var t;e.traverse(n=>{var o,a;const s=n;"element"in n&&s.element instanceof HTMLElement&&s.element.remove();const r=n;(o=r.geometry)==null||o.dispose(),Array.isArray(r.material)?r.material.forEach(l=>l.dispose()):(a=r.material)==null||a.dispose()}),(t=e.parent)==null||t.remove(e)}visitMaterials(e){var t;(t=this.mesh)==null||t.traverse(n=>{const s=n;s.material&&(Array.isArray(s.material)?s.material.forEach(e):e(s.material))})}frameObject(e){const t=new An().setFromObject(e);t.isEmpty()||this.frameBox(t)}async selectDatasetFromTree(e){if(Ut(e)){this.viewRouter.switchTo("welllog"),await this.loadDataset(e.id),this.publishSelection({type:"well",id:e.id});return}if(at(e)&&this.currentDataset&&Bn(this.currentDataset)){await this.toggleDatasetVisibility(e,!0,{quiet:!0});const t=this.overlayMeshes.get(e.id);t&&this.frameObject(t),this.infoEl.textContent=`井 ${an(e)}`,this.showDetails(`${e.name}
场图叠加（管子）`),this.publishSelection({type:"well",id:e.id});return}await this.loadDataset(e.id),this.publishSelection({type:this.selectionTypeFor(e),id:e.id})}lineRenderIndices(e,t,n){if(e.source==="network"&&t.length%3===0){const s=new Uint32Array(t.length/3*2);for(let r=0,o=0;r<t.length;r+=3,o+=2)s[o]=t[r],s[o+1]=t[r+1];return s}return Uint32Array.from({length:n},(s,r)=>r)}clearOverlays(){var e;for(const t of this.overlayMeshes.values())this.disposeObject3D(t);this.overlayMeshes.clear(),this.overlayLoading.clear(),this.wellPlanPoints.clear(),this.highlightedOverlayId=null;for(const t of Array.from(this.objectTree.querySelectorAll("[data-dataset-id]"))){const n=t.querySelector('input[type="checkbox"]');n&&(n.checked=t.dataset.datasetId===((e=this.currentDataset)==null?void 0:e.id))}}setTreeVisibility(e,t){const n=Array.from(this.objectTree.querySelectorAll("[data-dataset-id]")).find(r=>r.dataset.datasetId===e),s=n==null?void 0:n.querySelector('input[type="checkbox"]');s&&(s.checked=t)}async toggleDatasetVisibility(e,t,n){var r;if(Ut(e)){this.setTreeVisibility(e.id,!1),n!=null&&n.quiet||this.showDetails(`${e.name} 是仅深度测井，不在三维场图显示。请打开「测井」页签。`);return}if(e.id===((r=this.currentDataset)==null?void 0:r.id)){this.mesh&&(this.mesh.visible=t),this.setTreeVisibility(e.id,t);return}const s=this.overlayMeshes.get(e.id);if(s){s.visible=t,this.setTreeVisibility(e.id,t);return}if(!(!t||this.overlayLoading.has(e.id))){this.overlayLoading.add(e.id);try{const[o,a]=await Promise.all([this.fetchBinary(e.files.positions),this.fetchBinary(e.files.indices)]),l=new Float32Array(o),c=new Uint32Array(a);if(l.length<6||l.length%3!==0||c.length<2)throw new Error("几何缓冲区为空或格式无效");const h=Xr(l.length/3,e.n_cells);h&&zl(l,e.n_cells);const u=this.origin,d=h?jr(l,e.n_cells):null,p=d||l,g=new Float32Array(p.length);for(let m=0;m<p.length;m+=3)g[m]=p[m]-u[0],g[m+1]=p[m+1]-u[1],g[m+2]=p[m+2]-u[2];let x;if(at(e)){const m=this.buildWellObject(e,g);if(!m)throw new Error("井轨迹点数不足，无法生成管子");x=m}else if(d){const m=Hl(g,e.n_cells),f=new St;f.setAttribute("position",new Je(m.positions,3)),f.setAttribute("normal",new Je(m.normals,3)),f.setIndex(new Je(m.indices,1));const S=new vi({color:9147550,transparent:!0,opacity:.45,side:Ft});S.forceSinglePass=!0;const _=new Rt(f,S),w=new St;w.setAttribute("position",new Je(g,3)),w.setIndex(new Je(qr(Array.from({length:e.n_cells},(C,T)=>T)),1));const L=new Fn(w,new On({color:13686750,transparent:!0,opacity:.7}));x=new Nn,x.add(_),x.add(L)}else{const m=new St;m.setAttribute("position",new Je(g,3));const f=this.isLineDataset(e),S=f?this.lineRenderIndices(e,c,g.length/3):c;m.setIndex(new Je(S,1)),f||m.computeVertexNormals();const _=f?new On({color:e.source==="network"||e.source==="network-tube"?16758892:16739229,transparent:!0,opacity:.95}):new vi({color:9147550,transparent:!0,opacity:.45,side:Ft,wireframe:!0});x=f?e.source==="network"||e.source==="network-tube"?new Fn(m,_):new Cr(m,_):new Rt(m,_)}x.name=`oilgas-overlay-${e.id}`,x.visible=t,this.tagSceneObject(x,e),at(e)&&this.recordWellPlan(e,g),this.modelRoot.add(x),this.overlayMeshes.set(e.id,x),this.setTreeVisibility(e.id,t),n!=null&&n.quiet||this.showDetails(`已加入场景：${e.name}
对象类型：${e.source||"unknown"}`)}catch(o){this.showDetails(`对象加载失败：${o instanceof Error?o.message:String(o)}`)}finally{this.overlayLoading.delete(e.id)}}}async loadDataset(e){var Z,ee;if(!this.manifest)return;const t=this.manifest.datasets.find(z=>z.id===e);if(!t)return;this.currentDataset=t,Qe.setDataset(t),Qe.setLoading({stage:"loading-dataset",progress:.1,error:null}),this.clearOverlays(),this.resetFilters(),this.detailsEl.style.display="none";const n=this.sidebar.querySelector("#vis-dataset");n&&(n.value=e);for(const z of Array.from(this.objectTree.querySelectorAll("[data-dataset-id]"))){const O=z.dataset.datasetId===e;z.dataset.selected=String(O);const Q=z.querySelector('input[type="checkbox"]');Q&&(Q.checked=O),z.style.color=O?"#e6edf3":"#8b949e",z.style.background=O?"rgba(31,111,235,.24)":"transparent",z.style.boxShadow=O?"inset 2px 0 #58a6ff":"none"}const s=this.sidebar.querySelector("#vis-property"),r=new Set(Object.keys(t.files.scalars||{}));for(const z of t.time_steps||[])Object.keys(z.scalars||{}).forEach(O=>r.add(O));if(s)if(s.innerHTML="",r.size===0){const z=document.createElement("option");z.value="",z.textContent="无属性（统一颜色）",s.appendChild(z),s.disabled=!0,this.currentProperty=""}else{s.disabled=!1;for(const z of r){const O=document.createElement("option");O.value=z,O.textContent=z,s.appendChild(O)}r.has(this.currentProperty)||(this.currentProperty=r.values().next().value||""),s.value=this.currentProperty}const o=this.sidebar.querySelector("#vis-timestep");if(o&&(o.innerHTML='<option value="0">静态</option>',t.time_steps))for(const z of t.time_steps){const O=document.createElement("option");O.value=String(z.index+1),O.textContent=`Step ${z.index} (${z.step_number})`,o.appendChild(O)}this.currentTimeStep=0,this.infoEl.textContent=`正在加载 ${t.name}...`,this.abortController&&this.abortController.abort(),this.abortController=new AbortController;const a=++this.loadGeneration;this.datasetLoading=!0;const l=this.abortController.signal;let c,h,u;try{[c,h,u]=await Promise.all([this.fetchBinary(t.files.positions,l),this.fetchBinary(t.files.indices,l),this.fetchBinary(t.files.cell_ids,l)])}catch(z){a===this.loadGeneration&&(this.datasetLoading=!1,Qe.setLoading({stage:"failed",progress:0,error:z instanceof Error?z.message:String(z)}),this.infoEl.textContent=`加载失败：${z instanceof Error?z.message:String(z)}`);return}if(a!==this.loadGeneration)return;const d=new Float32Array(c),p=new Uint32Array(h),g=new Uint32Array(u);if(d.length<3||d.length%3!==0||p.length===0||g.length===0){this.datasetLoading=!1,this.infoEl.textContent="加载失败：数据集几何缓冲区为空或格式无效";return}zl(d,g.length);const x=Xr(d.length/3,g.length);this.isHexMesh=x||rg(d.length/3,g.length);const m=x?jr(d,g.length):null,f=m||d;let S=0,_=0,w=0;const L=f.length/3;for(let z=0;z<f.length;z+=3){if(!Number.isFinite(f[z])||!Number.isFinite(f[z+1])||!Number.isFinite(f[z+2])){this.datasetLoading=!1,this.infoEl.textContent="加载失败：坐标数据包含非有限值";return}S+=f[z],_+=f[z+1],w+=f[z+2]}S/=L,_/=L,w/=L;const C=Ut(t);C&&(S=0,_=0,w=0);const T=new Float32Array(f.length);for(let z=0;z<f.length;z+=3)T[z]=f[z]-S,T[z+1]=f[z+1]-_,T[z+2]=f[z+2]-w;const W=this.isLineDataset(t);let v=T,M=p,I=null;const X=m?T:null;if(m){const z=Hl(T,g.length);v=z.positions,M=z.indices,I=z.normals}const J=new St;J.setAttribute("position",new Je(v,3));const D=W?this.lineRenderIndices(t,M,v.length/3):M;J.setIndex(new Je(D,1)),I&&J.setAttribute("normal",new Je(I,3)),J.computeBoundingBox(),J.computeBoundingSphere(),!W&&!I&&J.computeVertexNormals();let U=!1;try{const z=await this.applyPropertyColors(J,t,M,a);if(z===null){if(a!==this.loadGeneration){J.dispose();return}U=!1}else U=z}catch(z){a===this.loadGeneration&&this.showDetails(`属性加载失败：${z instanceof Error?z.message:String(z)}`)}if(a!==this.loadGeneration){J.dispose();return}if(this.disposeCurrentMesh(),this.cellIds=g,this.baseIndices=M,this.hexCornerPositions=X,this.isHexMesh=!!X,this.cellCenters=null,this.visibleCellOffsets=Array.from({length:g.length},(z,O)=>O),this.origin=[S,_,w],this.geometry=J,this.datasetLoading=!1,Qe.setLoading({stage:"ready",progress:1,error:null}),Qe.setProperty({name:this.currentProperty,displayName:this.currentProperty,range:[this.scalarMin,this.scalarMax]}),Qe.setTimeStep(this.currentTimeStep),C)this.mesh=null;else if(at(t)){const z=this.buildWellObject(t,T);this.mesh=z,z&&this.modelRoot.add(z)}else if(W){const z=new On({vertexColors:U,color:U?16777215:5809919,transparent:!0,opacity:this.opacity});this.mesh=new Fn(this.geometry,z),this.modelRoot.add(this.mesh)}else{const z=new vi({vertexColors:U,side:Ft,transparent:!0,opacity:this.opacity,wireframe:this.isHexMesh?!1:this.wireframe,clippingPlanes:[]});z.forceSinglePass=!0,U||(z.color=new Ue(4491519)),this.mesh=new Rt(this.geometry,z),this.attachHexEdges(g.length),this.modelRoot.add(this.mesh)}this.mesh&&this.tagSceneObject(this.mesh,t),at(t)&&!C&&this.recordWellPlan(t,T),this.updateGridMapBounds();const k=this.geometry.boundingSphere,K=Math.max(k.radius,1);if(!C){const z=Math.max(K/1e4,.1),O=Math.max(K*20,2e4);this.perspectiveCamera.near=z,this.perspectiveCamera.far=O,this.orthoCamera.near=z,this.orthoCamera.far=O,this.applyCameraProjection();const Q=this.scene.background instanceof Ue?this.scene.background.clone():new Ue(856343);this.scene.fog=new Ni(Q,K*4,K*10),this.mesh&&at(t)?this.frameObject(this.mesh):this.geometry.boundingBox&&this.frameBox(this.geometry.boundingBox),this.controls.minDistance=K*.01,this.controls.maxDistance=K*20,this.controls.update()}this.slicePlayer.setDims(t.grid_dims),this.setWellLabelsVisible(this.wellLabelsVisible),this.infoEl.textContent=C?`${t.name} — 仅深度测井，不在三维场图显示`:`${t.name} — ${t.n_cells.toLocaleString()} cells | 原点: (${S.toFixed(0)}, ${_.toFixed(0)}, ${w.toFixed(0)})`;const Y=this.sidebar.querySelector("#vis-k-layer");Y&&((Z=t.grid_dims)!=null&&Z[2])&&(Y.max=String(t.grid_dims[2]),Y.value=Y.value||"1");const $=this.sidebar.querySelector("#vis-slice-index");$&&((ee=t.grid_dims)!=null&&ee[2])&&($.max=String(t.grid_dims[2])),Bn(t)&&await this.attachSpatialWellOverlays(a),this.updateObjectTree(),this.updateInspectorObject(),this.updateReadoutHud(),this.refreshWellMap(),a===this.loadGeneration&&this.publishSelection({type:this.selectionTypeFor(t),id:t.id}),this.viewRouter.getActiveView()==="welllog"&&this.renderWellLog()}async attachSpatialWellOverlays(e){var n;if(!this.manifest)return;const t=this.manifest.datasets.filter(at);for(const s of t){if(e!==this.loadGeneration)return;s.id!==((n=this.currentDataset)==null?void 0:n.id)&&await this.toggleDatasetVisibility(s,!0,{quiet:!0})}t.length&&e===this.loadGeneration&&(this.infoEl.textContent=`${this.infoEl.textContent} · 已叠加 ${t.length} 口井`)}resetFilters(){for(const t of["#vis-filter-i","#vis-filter-j","#vis-filter-k","#vis-filter-prop-min","#vis-filter-prop-max"]){const n=this.sidebar.querySelector(t);n&&(n.value="")}this.filterI=[0,1/0],this.filterJ=[0,1/0],this.filterK=[0,1/0],this.filterPropertyRange=[-1/0,1/0],this.filterPropertyExclude=!1;const e=this.sidebar.querySelector("#vis-filter-prop-exclude");e&&(e.checked=!1,e.dispatchEvent(new Event("ugsci-sync"))),this.filterBounds=null,this.filterUndoStack=[],this.filterRedoStack=[],this.lastFilterState=this.filterStateSnapshot()}async applyPropertyColors(e,t,n,s=this.loadGeneration,r=++this.colorRequest){var W;if(!e||!t)return!1;e.deleteAttribute("color"),this.currentScalarValues=null,this.scalarMin=0,this.scalarMax=1;const o=this.currentProperty,a=this.currentTimeStep,l=this.currentColormap;let c;const h=a;if(h>0&&t.time_steps){const v=t.time_steps.find(M=>M.index===h-1);v&&(c=v.scalars[o])}if(c||(c=t.files.scalars[o]),!c)return this.updateLegend(),!1;const u=await this.fetchBinary(c,(W=this.abortController)==null?void 0:W.signal);if(s!==this.loadGeneration||r!==this.colorRequest)return null;const d=c.endsWith(".f32"),p=u.slice(0);this.currentScalarValues=d?new Float32Array(p):new Uint32Array(p);const g=e.getAttribute("position").count;if(["las","dlis","network","wellbore"].includes(t.source||"")&&this.currentScalarValues.length===g){let v=1/0,M=-1/0;for(const J of this.currentScalarValues)v=Math.min(v,J),M=Math.max(M,J);this.scalarMin=v,this.scalarMax=M,Qe.setProperty({name:o,displayName:o,range:[v,M]});const I=M-v||1,X=new Float32Array(g*3);for(let J=0;J<g;J++){const[D,U,k]=Fr(l,(this.currentScalarValues[J]-v)/I);X[J*3]=D,X[J*3+1]=U,X[J*3+2]=k}return e.setAttribute("color",new Je(X,3)),this.updateLegend(),!0}if(this.workerManager.isAvailable()){const v=await this.workerManager.computeColors(u.slice(0),n.slice().buffer,l,e.getAttribute("position").count,d);if(v)return s!==this.loadGeneration||r!==this.colorRequest?null:(this.scalarMin=v.smin,this.scalarMax=v.smax,Qe.setProperty({name:o,displayName:o,range:[v.smin,v.smax]}),e.setAttribute("color",new Je(v.colors,3)),this.updateLegend(),!0)}const x=d?new Float32Array(u):new Uint32Array(u);let m=1/0,f=-1/0;for(let v=0;v<x.length;v++){const M=x[v];M<m&&(m=M),M>f&&(f=M)}const S=f-m||1;if(this.scalarMin=m,this.scalarMax=f,Qe.setProperty({name:o,displayName:o,range:[m,f]}),s!==this.loadGeneration||r!==this.colorRequest)return null;const w=e.getAttribute("position").count,L=new Float32Array(w*3),C=new Float32Array(w),T=n.length/x.length;for(let v=0;v<x.length;v++){const M=(x[v]-m)/S,[I,X,J]=Fr(l,M),D=v*T;for(let U=0;U<T;U++){const k=n[D+U];k<w&&(L[k*3]+=I,L[k*3+1]+=X,L[k*3+2]+=J,C[k]++)}}for(let v=0;v<w;v++){const M=C[v]||1;L[v*3]/=M,L[v*3+1]/=M,L[v*3+2]/=M}return e.setAttribute("color",new Je(L,3)),this.updateLegend(),!0}async reloadPropertyColors(){if(this.datasetLoading||!this.mesh||!this.currentDataset||!this.geometry)return;const e=this.baseIndices||this.geometry.getIndex().array;let t=!1;try{const n=await this.applyPropertyColors(this.geometry,this.currentDataset,e);if(n===null)return;t=n}catch(n){this.showDetails(`属性加载失败：${n instanceof Error?n.message:String(n)}`);return}this.visitMaterials(n=>{const s=n;"vertexColors"in s&&(s.vertexColors=t,!t&&"color"in s&&s.color.set(4491519),s.needsUpdate=!0)}),this.applyFilters()}getCellCenters(e){if(this.cellCenters)return this.cellCenters;if(!this.geometry||!this.baseIndices||!this.cellIds||!Number.isInteger(e)||e<=0)return null;const t=this.geometry.getAttribute("position"),n=new Float32Array(this.cellIds.length*3);for(let s=0;s<this.cellIds.length;s++){const r=s*e;let o=0,a=0,l=0,c=0;for(let h=r;h<r+e;h++){const u=this.baseIndices[h];u>=t.count||(a+=t.getX(u),l+=t.getY(u),c+=t.getZ(u),o++)}o&&(n[s*3]=a/o+this.origin[0],n[s*3+1]=l/o+this.origin[1],n[s*3+2]=c/o+this.origin[2])}return this.cellCenters=n,n}applyFilters(){var d,p,g,x,m,f;if(this.datasetLoading||!this.geometry||!this.currentDataset||!this.cellIds||!this.baseIndices)return;const e=this.filterStateSnapshot();!this.restoringScene&&this.lastFilterState&&e!==this.lastFilterState&&(this.filterUndoStack.push(this.lastFilterState),this.filterUndoStack.length>50&&this.filterUndoStack.shift(),this.filterRedoStack=[]),this.lastFilterState=e;const t=(d=this.sidebar.querySelector("#vis-filter-i"))==null?void 0:d.value,n=(p=this.sidebar.querySelector("#vis-filter-j"))==null?void 0:p.value,s=(g=this.sidebar.querySelector("#vis-filter-k"))==null?void 0:g.value,r=(x=this.sidebar.querySelector("#vis-filter-prop-min"))==null?void 0:x.value,o=(m=this.sidebar.querySelector("#vis-filter-prop-max"))==null?void 0:m.value;if(this.filterI=this.parseRange(t),this.filterJ=this.parseRange(n),this.filterK=this.parseRange(s),this.filterPropertyRange=[r?parseFloat(r):-1/0,o?parseFloat(o):1/0],Qe.setFilters([{type:"ijk",enabled:!0,values:[t||"",n||"",s||""]},{type:"property-range",enabled:!!(r||o),min:this.filterPropertyRange[0],max:this.filterPropertyRange[1]}]),this.filterPropertyRange[0]>this.filterPropertyRange[1]){this.infoEl.textContent="属性范围无效：最小值不能大于最大值";return}const a=this.currentDataset.grid_dims,l=this.cellIds.length?this.baseIndices.length/this.cellIds.length:0;if(!Number.isInteger(l)||l<=0){this.infoEl.textContent="当前数据结构不支持单元过滤";return}const c=this.filterBounds?this.getCellCenters(l):null,h=[],u=[];for(let S=0;S<this.cellIds.length;S++){const _=this.cellIds[S];let w=!0;if((a==null?void 0:a.length)===3){const[v,M]=a,I=_%v+1,X=Math.floor(_/v)%M+1,J=Math.floor(_/(v*M))+1;w=I>=this.filterI[0]&&I<=this.filterI[1]&&X>=this.filterJ[0]&&X<=this.filterJ[1]&&J>=this.filterK[0]&&J<=this.filterK[1]}const L=(f=this.currentScalarValues)==null?void 0:f[S],C=L===void 0||(L>=this.filterPropertyRange[0]&&L<=this.filterPropertyRange[1])!==this.filterPropertyExclude;let T=!0;if(this.filterBounds&&c){const v=c[S*3],M=c[S*3+1],I=c[S*3+2],[X,J,D,U,k,K]=this.filterBounds;T=v>=X&&v<=J&&M>=D&&M<=U&&I>=k&&I<=K}if(!w||!C||!T)continue;h.push(S);const W=S*l;for(let v=W;v<W+l;v++)u.push(this.baseIndices[v])}this.visibleCellOffsets=h,this.geometry.setIndex(u),this.geometry.index.needsUpdate=!0,this.updateHexEdges(),this.infoEl.textContent=`过滤结果: ${h.length.toLocaleString()} / ${this.cellIds.length.toLocaleString()} cells`}parseRange(e){if(!e||e.trim()==="")return[0,1/0];const t=e.split(":");if(t.length===2){const s=Number.parseInt(t[0],10),r=Number.parseInt(t[1],10);return[Math.min(Number.isFinite(s)?s:0,Number.isFinite(r)?r:1/0),Math.max(Number.isFinite(s)?s:0,Number.isFinite(r)?r:1/0)]}const n=parseInt(t[0]);return isNaN(n)?[0,1/0]:[n,n]}async runBenchmark(){this.infoEl.textContent="运行基准测试中... (5秒)";const e=[],t=performance.now();let n=0;const s=()=>{var o,a;const r=performance.now();if(n>0&&e.push(r-n),n=r,r-t<5e3)requestAnimationFrame(s);else{e.sort((g,x)=>g-x);const l=e[Math.floor(e.length*.5)]||0,c=e[Math.floor(e.length*.95)]||0,h=e.length?e.reduce((g,x)=>g+x,0)/e.length:1/0,u=Number.isFinite(h)?1e3/h:0,d=(o=performance.memory)==null?void 0:o.usedJSHeapSize,p=d?`${(d/1024/1024).toFixed(0)} MB`:"N/A";this.infoEl.textContent=`基准: P50=${l.toFixed(1)}ms P95=${c.toFixed(1)}ms FPS=${u.toFixed(0)} Heap=${p}`,fetch(`${this.apiBase}/benchmarks`,{method:"POST",headers:{...this.authHeaders(),"Content-Type":"application/json"},body:JSON.stringify({datasetId:((a=this.currentDataset)==null?void 0:a.id)||"unknown",p50:l,p95:c,p99:e[Math.floor(e.length*.99)]||0,fps:u,drawCalls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,jsHeapMB:d?d/1024/1024:0,duration:5e3})}).catch(()=>{})}};requestAnimationFrame(s)}async runLeakTest(){var a,l;this.infoEl.textContent="内存泄漏测试中... (10次加载/卸载)";const e=((a=performance.memory)==null?void 0:a.usedJSHeapSize)||0,t=this.renderer.info.memory.geometries;for(let c=0;c<10;c++)this.disposeCurrentMesh(),this.currentDataset&&await this.loadDataset(this.currentDataset.id),await new Promise(h=>setTimeout(h,200));this.renderer.renderLists.dispose();const n=[];for(let c=0;c<4;c++)await new Promise(h=>setTimeout(h,500)),n.push(((l=performance.memory)==null?void 0:l.usedJSHeapSize)||0);const r=((n.filter(Boolean).length?Math.min(...n.filter(Boolean)):0)-e)/1024/1024,o=this.renderer.info.memory.geometries-t;this.infoEl.textContent=`泄漏测试: retained ${r.toFixed(1)} MiB · GPU geometry ${o>=0?"+":""}${o} (阈值 ≤100 MiB / +1)`}captureScreenshot(){this.renderer.render(this.scene,this.camera);const e=this.renderer.domElement.toDataURL("image/png"),t=document.createElement("a");t.download=`oilgas-screenshot-${Date.now()}.png`;const n=atob(e.split(",",2)[1]),s=new Uint8Array(n.length);for(let o=0;o<n.length;o++)s[o]=n.charCodeAt(o);const r=URL.createObjectURL(new Blob([s],{type:"image/png"}));t.href=r,t.click(),window.setTimeout(()=>URL.revokeObjectURL(r),1e3),this.infoEl.textContent="截图已保存"}startLoop(){const e=t=>{if(this.animationId=requestAnimationFrame(e),this.controls.update(),this.renderer.render(this.scene,this.camera),this.labelRenderer.render(this.scene,this.camera),this.lastFrameTime>0){const n=t-this.lastFrameTime;this.frameTimes.push(n),this.frameTimes.length>60&&this.frameTimes.shift()}this.lastFrameTime=t,++this.fpsInterval>=30&&(this.fpsInterval=0,this.updateHud(),this.updateCompassHud())};e(0)}updateHud(){var r;const e=this.renderer.info,t=this.frameTimes,n=(o,a)=>{const l=this.hudEl.querySelector(`[data-metric="${o}"]`);l&&(l.textContent=a)};if(t.length>0){const o=t.reduce((a,l)=>a+l,0)/t.length;n("FPS",(1e3/o).toFixed(0)),n("Frame",o.toFixed(1)+"ms")}n("Draw Calls",String(e.render.calls)),n("Triangles",e.render.triangles.toLocaleString());const s=(r=performance.memory)==null?void 0:r.usedJSHeapSize;s&&n("JS Heap",(s/1024/1024).toFixed(0)+" MB"),Qe.setMetrics({fps:t.length>0?1e3/(t.reduce((o,a)=>o+a,0)/t.length):0,frameTime:t.length>0?t.reduce((o,a)=>o+a,0)/t.length:0,drawCalls:e.render.calls,triangles:e.render.triangles,jsHeapMB:s?s/1024/1024:0})}canvasNdc(e){const t=this.renderer.domElement.getBoundingClientRect();this.mouse.x=(e.clientX-t.left)/Math.max(t.width,1)*2-1,this.mouse.y=-((e.clientY-t.top)/Math.max(t.height,1))*2+1}pickables(){var t;const e=[];(t=this.mesh)!=null&&t.visible&&e.push(this.mesh);for(const n of this.overlayMeshes.values())n.visible&&e.push(n);return e}datasetFromHit(e){var n;let t=e;for(;t;){const s=(n=t.userData)==null?void 0:n.datasetId;if(s)return this.datasetById(s)||null;t=t.parent}return this.currentDataset}setOnSelection(e){this.onSelectionCallback=e}focusCell(e){var h,u;if(!this.geometry||!this.cellIds)return!1;const t=Number(e);if(!Number.isInteger(t))return!1;const n=this.cellIds.indexOf(t);if(n<0)return!1;const s=this.geometry.getAttribute("position"),r=this.hexCornerPositions;if(r&&r.length>=(n+1)*24){const d=new R,p=n*24;for(let x=0;x<8;x++)d.x+=r[p+x*3],d.y+=r[p+x*3+1],d.z+=r[p+x*3+2];d.multiplyScalar(.125);const g=Math.max(((h=this.geometry.boundingSphere)==null?void 0:h.radius)||1,1);return this.controls.target.copy(d),this.camera.position.copy(d).addScalar(g*.08),this.controls.update(),this.infoEl.textContent=`已聚焦 Cell ID: ${t}`,!0}const o=this.cellIds.length?Math.floor(s.count/this.cellIds.length):0,a=n*Math.min(8,Math.max(1,o));if(a+7>=s.count)return!1;const l=new R;for(let d=a;d<a+8;d++)l.x+=s.getX(d),l.y+=s.getY(d),l.z+=s.getZ(d);l.multiplyScalar(.125);const c=Math.max(((u=this.geometry.boundingSphere)==null?void 0:u.radius)||1,1);return this.controls.target.copy(l),this.camera.position.copy(l).addScalar(c*.08),this.controls.update(),this.infoEl.textContent=`已聚焦 Cell ID: ${t}`,!0}async focusDatasetObject(e,t){var d,p,g;if(!this.manifest)return!1;const n=t.trim().toLowerCase(),s=e==="well"?new Set(["wellbore","las","dlis"]):new Set(["network","network-tube"]),r=this.manifest.datasets.filter(x=>{var f;if(!s.has(x.source||""))return!1;if(!n)return!0;const m=typeof((f=x.metadata)==null?void 0:f.well_name)=="string"?x.metadata.well_name:"";return[x.id,x.name,m].some(S=>S.toLowerCase()===n)});if(r.length>1)return!1;const o=r[0];if(!o)return!1;if(e==="well"&&Ut(o))return this.viewRouter.switchTo("welllog"),o.id!==((d=this.currentDataset)==null?void 0:d.id)&&await this.loadDataset(o.id),this.infoEl.textContent=`已打开测井: ${an(o)}`,!0;if(e==="well"&&at(o)&&this.currentDataset&&Bn(this.currentDataset)){await this.toggleDatasetVisibility(o,!0,{quiet:!0});const x=this.overlayMeshes.get(o.id);return x?(this.frameObject(x),this.infoEl.textContent=`已聚焦井: ${an(o)}`,this.publishSelection({type:"well",id:o.id}),!0):!1}if(o.id!==((p=this.currentDataset)==null?void 0:p.id)&&await this.loadDataset(o.id),e==="well"&&this.mesh&&at(this.currentDataset||o))return this.frameObject(this.mesh),this.infoEl.textContent=`已聚焦井: ${t}`,!0;if(!this.currentDataset||!s.has(this.currentDataset.source||"")||!this.geometry||!this.cellIds||!this.baseIndices)return!1;const a=this.geometry.getAttribute("position"),l=new Set,c=Number(t);if(!Number.isFinite(c)&&o)for(let x=0;x<a.count;x++)l.add(x);else{const x=this.baseIndices.length/this.cellIds.length;if(!Number.isInteger(x)||!Number.isFinite(c))return!1;for(let m=0;m<this.cellIds.length;m++){if(this.cellIds[m]!==c)continue;const f=m*x;for(let S=f;S<f+x;S++){const _=this.baseIndices[S];_<a.count&&l.add(_)}}}if(l.size===0)return!1;const h=new R;for(const x of l)h.x+=a.getX(x),h.y+=a.getY(x),h.z+=a.getZ(x);h.multiplyScalar(1/l.size);const u=Math.max(((g=this.geometry.boundingSphere)==null?void 0:g.radius)||1,1);return this.controls.target.copy(h),this.camera.position.copy(h).addScalar(u*.08),this.controls.update(),this.infoEl.textContent=`已聚焦 ${e==="well"?"井":"管段"}: ${t}`,!0}async executeCommand(e,t){var n,s,r,o,a,l,c;switch(e){case"open":if(t.datasetId){if(!((n=this.manifest)!=null&&n.datasets.some(u=>u.id===t.datasetId)))throw new Error(`数据集不存在: ${t.datasetId}`);await this.loadDataset(t.datasetId)}break;case"set-property":if(t.datasetId&&t.datasetId!==((s=this.currentDataset)==null?void 0:s.id)&&await this.loadDataset(t.datasetId),t.property){const u=this.sidebar.querySelector("#vis-property");if(!(u?Array.from(u.options).some(p=>p.value===t.property):!1))throw this.infoEl.textContent=`属性不存在: ${t.property}`,new Error(`属性不存在: ${t.property}`);this.currentProperty=t.property,u.value=t.property,await this.reloadPropertyColors()}break;case"set-timestep":if(t.timeStep!==void 0){this.currentTimeStep=t.timeStep;const u=this.sidebar.querySelector("#vis-timestep"),d=String(t.timeStep);if(!u||!Array.from(u.options).some(p=>p.value===d))throw this.infoEl.textContent=`时间步不存在: ${t.timeStep}`,new Error(`时间步不存在: ${t.timeStep}`);u.value=d,await this.reloadPropertyColors()}break;case"set-colormap":{const u=this.sidebar.querySelector("#vis-colormap"),d=String(t.colormap||"");if(!u||!Array.from(u.options).some(p=>p.value===d))throw this.infoEl.textContent=`色图不存在: ${d}`,new Error(`色图不存在: ${d}`);this.currentColormap=d,u.value=d,await this.reloadPropertyColors();break}case"set-opacity":{const u=Number(t.opacity);if(!Number.isFinite(u))break;this.applyOpacity(Math.max(.1,Math.min(1,u>1?u/100:u)));break}case"set-wireframe":{this.wireframe=!!t.enabled,this.applyWireframeMode();break}case"set-view":if(Bi.VIEWS.includes(String(t.view||"reservoir")))this.viewRouter.switchTo(String(t.view||"reservoir"));else throw new Error(`视图不存在: ${String(t.view||"")}`);break;case"set-filter":{t.datasetId&&t.datasetId!==((r=this.currentDataset)==null?void 0:r.id)&&await this.loadDataset(t.datasetId);const u=this.sidebar.querySelector("#vis-property");t.property&&u&&Array.from(u.options).some(p=>p.value===t.property)&&(this.currentProperty=t.property,u.value=t.property,await this.reloadPropertyColors());const d={"#vis-filter-i":t.i,"#vis-filter-j":t.j,"#vis-filter-k":t.k,"#vis-filter-prop-min":t.propertyMin==null?"":String(t.propertyMin),"#vis-filter-prop-max":t.propertyMax==null?"":String(t.propertyMax)};for(const[p,g]of Object.entries(d)){const x=this.sidebar.querySelector(p);x&&g!==void 0&&(x.value=g)}this.filterBounds=Array.isArray(t.bounds)&&t.bounds.length===6?t.bounds:null,this.applyFilters();break}case"show-report":this.showDetails([t.title||"油气可视化分析报告",`数据集: ${t.dataset||t.dataset_id||"—"}`,`属性: ${t.property||"—"}`,...Object.entries(t.stats||{}).map(([u,d])=>`${u}: ${d==null?"—":Number(d).toPrecision(6)}`)].join(`
`));break;case"focus":let h=!1;if(t.objectType==="cell"?h=this.focusCell(String(t.objectId)):(t.objectType==="well"||t.objectType==="segment")&&(h=await this.focusDatasetObject(t.objectType,String(t.objectId))),!h)throw this.infoEl.textContent=`无法聚焦 ${t.objectType||"object"}: ${t.objectId||""}`,new Error(`无法聚焦 ${t.objectType||"object"}: ${t.objectId||""}`);break;case"create-intersection":{const u=t.datasetId||((o=this.currentDataset)==null?void 0:o.id);if(!u)break;const d=await fetch(`${this.apiBase}/datasets/${encodeURIComponent(u)}/intersections`,{method:"POST",headers:{...this.authHeaders(),"Content-Type":"application/json"},body:JSON.stringify({polyline_x:t.polyline_x,polyline_y:t.polyline_y,z_min:t.z_min,z_max:t.z_max,name:t.name,property:t.property||this.currentProperty})});if(!d.ok)throw this.infoEl.textContent=`剖面生成失败: HTTP ${d.status}`,new Error(`剖面生成失败: HTTP ${d.status}`);const p=await d.json();this.manifest=await this.fetchJson("/manifest"),this.updateObjectTree(),this.infoEl.textContent=`剖面已生成: ${p.name||t.name||"section"}`,p.id&&await this.loadDataset(p.id),this.viewRouter.switchTo("intersection");break}case"create-well-section":{const u=t.datasetId||((a=this.currentDataset)==null?void 0:a.id);if(!u)break;const d=await fetch(`${this.apiBase}/datasets/${encodeURIComponent(u)}/well-sections`,{method:"POST",headers:{...this.authHeaders(),"Content-Type":"application/json"},body:JSON.stringify({well_dataset_id:t.wellDatasetId,offset:t.offset??50,name:t.name,property:t.property||this.currentProperty})});if(!d.ok)throw new Error(`井剖面生成失败: HTTP ${d.status}`);const p=await d.json();this.manifest=await this.fetchJson("/manifest"),this.updateObjectTree(),p.id&&await this.loadDataset(p.id),this.viewRouter.switchTo("intersection");break}case"create-slice":{const u=t.datasetId||((l=this.currentDataset)==null?void 0:l.id);if(!u)break;const d=await fetch(`${this.apiBase}/datasets/${encodeURIComponent(u)}/slices`,{method:"POST",headers:{...this.authHeaders(),"Content-Type":"application/json"},body:JSON.stringify({axis:t.axis||"k",index:t.index,name:t.name,property:t.property||this.currentProperty})});if(!d.ok)throw new Error(`切片生成失败: HTTP ${d.status}`);const p=await d.json();this.manifest=await this.fetchJson("/manifest"),this.updateObjectTree(),p.id&&await this.loadDataset(p.id),this.viewRouter.switchTo("intersection");break}case"capture":return this.captureScreenshot();case"benchmark":return this.runBenchmark();default:throw new Error(`未知命令: ${e}`)}return{ok:!0,command:e,datasetId:((c=this.currentDataset)==null?void 0:c.id)||null}}applyWireframeMode(){if(this.hexEdgeLines){this.hexEdgeLines.visible=this.wireframe,this.visitMaterials(e=>{e instanceof vi&&(e.wireframe=!1,e.needsUpdate=!0)});return}this.visitMaterials(e=>{e instanceof vi&&(e.wireframe=this.wireframe,e.needsUpdate=!0)})}attachHexEdges(e){this.disposeHexEdges();const t=this.hexCornerPositions;if(!t||t.length!==e*24){this.isHexMesh=!1;return}this.isHexMesh=!0;const n=new St;n.setAttribute("position",new Je(t,3));const s=this.visibleCellOffsets.length?this.visibleCellOffsets:Array.from({length:e},(r,o)=>o);n.setIndex(new Je(qr(s),1)),this.hexEdgeLines=new Fn(n,new On({color:13686750,transparent:!0,opacity:.85})),this.hexEdgeLines.name="oilgas-hex-edges",this.hexEdgeLines.visible=this.wireframe,this.mesh?this.mesh.add(this.hexEdgeLines):this.modelRoot.add(this.hexEdgeLines)}updateHexEdges(){this.hexEdgeLines&&this.hexEdgeLines.geometry.setIndex(new Je(qr(this.visibleCellOffsets),1))}disposeHexEdges(){var t;if(!this.hexEdgeLines)return;(t=this.hexEdgeLines.parent)==null||t.remove(this.hexEdgeLines),this.hexEdgeLines.geometry.dispose();const e=this.hexEdgeLines.material;Array.isArray(e)?e.forEach(n=>n.dispose()):e.dispose(),this.hexEdgeLines=null}disposeSceneResources(){this.scene.traverse(e=>{var n,s;const t=e;(n=t.geometry)==null||n.dispose(),Array.isArray(t.material)?t.material.forEach(r=>r.dispose()):(s=t.material)==null||s.dispose()})}disposeCurrentMesh(){this.disposeHexEdges();const e=this.mesh,t=this.geometry;e&&this.disposeObject3D(e);const n=e instanceof Rt||e instanceof Cr||e instanceof Fn?e.geometry:null;t&&t!==n&&t.dispose(),this.mesh=null,this.geometry=null,this.cellIds=null,this.baseIndices=null,this.currentScalarValues=null,this.cellCenters=null,this.visibleCellOffsets=[],this.isHexMesh=!1,this.hexCornerPositions=null,this.renderer.renderLists.dispose()}dispose(){var e,t,n;for(this.loadGeneration++,this.commandBridge.dispose(),this.timestepTimer!==null&&(window.clearInterval(this.timestepTimer),this.timestepTimer=null),this.sliceTimer!==null&&(window.clearInterval(this.sliceTimer),this.sliceTimer=null),this.animationId&&cancelAnimationFrame(this.animationId),this.abortController&&this.abortController.abort(),this.renderer.domElement.removeEventListener("click",this.onCanvasClick),this.renderer.domElement.removeEventListener("pointermove",this.onCanvasPointerMove),this.renderer.domElement.removeEventListener("pointerleave",this.onCanvasPointerLeave),this.renderer.domElement.removeEventListener("dblclick",this.onCanvasDblClick),this.renderer.domElement.removeEventListener("contextmenu",this.onCanvasContextMenu),(e=this.wellMapCanvas)==null||e.removeEventListener("click",this.onWellMapClick),this.container.removeEventListener("keydown",this.onViewerKeyDown),(t=this.dropUnbind)==null||t.call(this),this.dropUnbind=null,(n=this.storeUnsubscribe)==null||n.call(this),window.removeEventListener("resize",this.onResize),this.workerManager.dispose(),this.disposeCurrentMesh(),this.clearOverlays(),this.disposeSceneResources(),this.controls.dispose(),this.renderer.dispose();this.container.firstChild;)this.container.removeChild(this.container.firstChild);console.info("[oilgas-vis] Viewer disposed")}update(e){e.authToken!==void 0&&(this.authToken=e.authToken),e.apiBase&&(this.apiBase=e.apiBase),this.commandBridge.update(e)}}hm("three-reservoir",i=>{const e=new hg(i.container,{apiBase:i.apiBase,authToken:i.authToken}),t=(n,s)=>e.executeCommand(n,s);return{loadDataset:async n=>{await t("open",{datasetId:n})},setProperty:n=>{t("set-property",{property:n})},setColorMap:n=>{t("set-colormap",{colormap:n})},setOpacity:n=>{t("set-opacity",{opacity:n})},setWireframe:n=>{t("set-wireframe",{enabled:n})},setView:n=>{t("set-view",{view:n})},focusObject:(n,s)=>{t("focus",{objectType:n,objectId:s})},captureScreenshot:()=>(t("capture",{}),null),runBenchmark:async()=>await t("benchmark",{})||{datasetId:"unknown",p50:0,p95:0,p99:0,fps:0,drawCalls:0,triangles:0,jsHeapMB:0,duration:5e3},executeCommand:t,update:n=>e.update(n),dispose:()=>e.dispose()}});const Vl={version:"0.3.6",mount(i,e){return um(i,e)}};return window.OilGasViewerRuntime=Vl,Vl}();
