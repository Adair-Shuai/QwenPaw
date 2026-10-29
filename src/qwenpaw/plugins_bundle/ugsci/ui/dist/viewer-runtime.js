var OilGasViewerRuntime=function(){"use strict";/**
 * @license
 * Copyright 2010-2023 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const ks="160",qn={ROTATE:0,DOLLY:1,PAN:2},$n={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},lc=0,io=1,cc=2,so=1,hc=2,Jt=3,hn=0,Rt=1,Bt=2,dn=0,Yn=1,ro=2,oo=3,ao=4,dc=5,Mn=100,uc=101,fc=102,lo=103,co=104,pc=200,mc=201,gc=202,xc=203,zs=204,Hs=205,_c=206,vc=207,yc=208,bc=209,Sc=210,Ec=211,Mc=212,wc=213,Tc=214,Ac=0,Cc=1,Rc=2,ji=3,Lc=4,Pc=5,Dc=6,Ic=7,Gs=0,Uc=1,Nc=2,un=0,Oc=1,Fc=2,Bc=3,kc=4,zc=5,Hc=6,ho=300,Kn=301,Jn=302,Vs=303,Ws=304,qi=306,Xs=1e3,Vt=1001,js=1002,Et=1003,uo=1004,qs=1005,kt=1006,Gc=1007,Ri=1008,fn=1009,Vc=1010,Wc=1011,$s=1012,fo=1013,pn=1014,mn=1015,Li=1016,po=1017,mo=1018,wn=1020,Xc=1021,Wt=1023,jc=1024,qc=1025,Tn=1026,Zn=1027,$c=1028,go=1029,Yc=1030,xo=1031,_o=1033,Ys=33776,Ks=33777,Js=33778,Zs=33779,vo=35840,yo=35841,bo=35842,So=35843,Eo=36196,Mo=37492,wo=37496,To=37808,Ao=37809,Co=37810,Ro=37811,Lo=37812,Po=37813,Do=37814,Io=37815,Uo=37816,No=37817,Oo=37818,Fo=37819,Bo=37820,ko=37821,Qs=36492,zo=36494,Ho=36495,Kc=36283,Go=36284,Vo=36285,Wo=36286,Xo=3e3,An=3001,Jc=3200,Zc=3201,jo=0,Qc=1,zt="",gt="srgb",Zt="srgb-linear",er="display-p3",$i="display-p3-linear",Yi="linear",Ze="srgb",Ki="rec709",Ji="p3",Qn=7680,qo=519,eh=512,th=513,nh=514,$o=515,ih=516,sh=517,rh=518,oh=519,Yo=35044,Ko="300 es",tr=1035,Qt=2e3,Zi=2001;class Cn{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const s=this._listeners[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const n=this._listeners[e.type];if(n!==void 0){e.target=this;const s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}}const xt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let Jo=1234567;const Pi=Math.PI/180,Di=180/Math.PI;function ei(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(xt[i&255]+xt[i>>8&255]+xt[i>>16&255]+xt[i>>24&255]+"-"+xt[e&255]+xt[e>>8&255]+"-"+xt[e>>16&15|64]+xt[e>>24&255]+"-"+xt[t&63|128]+xt[t>>8&255]+"-"+xt[t>>16&255]+xt[t>>24&255]+xt[n&255]+xt[n>>8&255]+xt[n>>16&255]+xt[n>>24&255]).toLowerCase()}function dt(i,e,t){return Math.max(e,Math.min(t,i))}function nr(i,e){return(i%e+e)%e}function ah(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function lh(i,e,t){return i!==e?(t-i)/(e-i):0}function Ii(i,e,t){return(1-t)*i+t*e}function ch(i,e,t,n){return Ii(i,e,1-Math.exp(-t*n))}function hh(i,e=1){return e-Math.abs(nr(i,e*2)-e)}function dh(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function uh(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function fh(i,e){return i+Math.floor(Math.random()*(e-i+1))}function ph(i,e){return i+Math.random()*(e-i)}function mh(i){return i*(.5-Math.random())}function gh(i){i!==void 0&&(Jo=i);let e=Jo+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function xh(i){return i*Pi}function _h(i){return i*Di}function ir(i){return(i&i-1)===0&&i!==0}function vh(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function Qi(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function yh(i,e,t,n,s){const r=Math.cos,a=Math.sin,o=r(t/2),l=a(t/2),c=r((e+n)/2),h=a((e+n)/2),d=r((e-n)/2),f=a((e-n)/2),u=r((n-e)/2),g=a((n-e)/2);switch(s){case"XYX":i.set(o*h,l*d,l*f,o*c);break;case"YZY":i.set(l*f,o*h,l*d,o*c);break;case"ZXZ":i.set(l*d,l*f,o*h,o*c);break;case"XZX":i.set(o*h,l*g,l*u,o*c);break;case"YXY":i.set(l*u,o*h,l*g,o*c);break;case"ZYZ":i.set(l*g,l*u,o*h,o*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function ti(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function Mt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}const sr={DEG2RAD:Pi,RAD2DEG:Di,generateUUID:ei,clamp:dt,euclideanModulo:nr,mapLinear:ah,inverseLerp:lh,lerp:Ii,damp:ch,pingpong:hh,smoothstep:dh,smootherstep:uh,randInt:fh,randFloat:ph,randFloatSpread:mh,seededRandom:gh,degToRad:xh,radToDeg:_h,isPowerOfTwo:ir,ceilPowerOfTwo:vh,floorPowerOfTwo:Qi,setQuaternionFromProperEuler:yh,normalize:Mt,denormalize:ti};class xe{constructor(e=0,t=0){xe.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(dt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Ge{constructor(e,t,n,s,r,a,o,l,c){Ge.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c)}set(e,t,n,s,r,a,o,l,c){const h=this.elements;return h[0]=e,h[1]=s,h[2]=o,h[3]=t,h[4]=r,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],d=n[7],f=n[2],u=n[5],g=n[8],x=s[0],m=s[3],p=s[6],v=s[1],_=s[4],w=s[7],P=s[2],C=s[5],T=s[8];return r[0]=a*x+o*v+l*P,r[3]=a*m+o*_+l*C,r[6]=a*p+o*w+l*T,r[1]=c*x+h*v+d*P,r[4]=c*m+h*_+d*C,r[7]=c*p+h*w+d*T,r[2]=f*x+u*v+g*P,r[5]=f*m+u*_+g*C,r[8]=f*p+u*w+g*T,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8];return t*a*h-t*o*c-n*r*h+n*o*l+s*r*c-s*a*l}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],d=h*a-o*c,f=o*l-h*r,u=c*r-a*l,g=t*d+n*f+s*u;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const x=1/g;return e[0]=d*x,e[1]=(s*c-h*n)*x,e[2]=(o*n-s*a)*x,e[3]=f*x,e[4]=(h*t-s*l)*x,e[5]=(s*r-o*t)*x,e[6]=u*x,e[7]=(n*l-c*t)*x,e[8]=(a*t-n*r)*x,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-s*c,s*l,-s*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(rr.makeScale(e,t)),this}rotate(e){return this.premultiply(rr.makeRotation(-e)),this}translate(e,t){return this.premultiply(rr.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const rr=new Ge;function Zo(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function es(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function bh(){const i=es("canvas");return i.style.display="block",i}const Qo={};function Ui(i){i in Qo||(Qo[i]=!0,console.warn(i))}const ea=new Ge().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),ta=new Ge().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),ts={[Zt]:{transfer:Yi,primaries:Ki,toReference:i=>i,fromReference:i=>i},[gt]:{transfer:Ze,primaries:Ki,toReference:i=>i.convertSRGBToLinear(),fromReference:i=>i.convertLinearToSRGB()},[$i]:{transfer:Yi,primaries:Ji,toReference:i=>i.applyMatrix3(ta),fromReference:i=>i.applyMatrix3(ea)},[er]:{transfer:Ze,primaries:Ji,toReference:i=>i.convertSRGBToLinear().applyMatrix3(ta),fromReference:i=>i.applyMatrix3(ea).convertLinearToSRGB()}},Sh=new Set([Zt,$i]),Ye={enabled:!0,_workingColorSpace:Zt,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(i){if(!Sh.has(i))throw new Error(`Unsupported working color space, "${i}".`);this._workingColorSpace=i},convert:function(i,e,t){if(this.enabled===!1||e===t||!e||!t)return i;const n=ts[e].toReference,s=ts[t].fromReference;return s(n(i))},fromWorkingColorSpace:function(i,e){return this.convert(i,this._workingColorSpace,e)},toWorkingColorSpace:function(i,e){return this.convert(i,e,this._workingColorSpace)},getPrimaries:function(i){return ts[i].primaries},getTransfer:function(i){return i===zt?Yi:ts[i].transfer}};function ni(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function or(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let ii;class na{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{ii===void 0&&(ii=es("canvas")),ii.width=e.width,ii.height=e.height;const n=ii.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=ii}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=es("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=ni(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(ni(t[n]/255)*255):t[n]=ni(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Eh=0;class ia{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Eh++}),this.uuid=ei(),this.data=e,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(ar(s[a].image)):r.push(ar(s[a]))}else r=ar(s);n.url=r}return t||(e.images[this.uuid]=n),n}}function ar(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?na.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Mh=0;class Dt extends Cn{constructor(e=Dt.DEFAULT_IMAGE,t=Dt.DEFAULT_MAPPING,n=Vt,s=Vt,r=kt,a=Ri,o=Wt,l=fn,c=Dt.DEFAULT_ANISOTROPY,h=zt){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Mh++}),this.uuid=ei(),this.name="",this.source=new ia(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new xe(0,0),this.repeat=new xe(1,1),this.center=new xe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ge,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,typeof h=="string"?this.colorSpace=h:(Ui("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=h===An?gt:zt),this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.needsPMREMUpdate=!1}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==ho)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Xs:e.x=e.x-Math.floor(e.x);break;case Vt:e.x=e.x<0?0:1;break;case js:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Xs:e.y=e.y-Math.floor(e.y);break;case Vt:e.y=e.y<0?0:1;break;case js:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}get encoding(){return Ui("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace===gt?An:Xo}set encoding(e){Ui("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=e===An?gt:zt}}Dt.DEFAULT_IMAGE=null,Dt.DEFAULT_MAPPING=ho,Dt.DEFAULT_ANISOTROPY=1;class ut{constructor(e=0,t=0,n=0,s=1){ut.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r;const l=e.elements,c=l[0],h=l[4],d=l[8],f=l[1],u=l[5],g=l[9],x=l[2],m=l[6],p=l[10];if(Math.abs(h-f)<.01&&Math.abs(d-x)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+f)<.1&&Math.abs(d+x)<.1&&Math.abs(g+m)<.1&&Math.abs(c+u+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const _=(c+1)/2,w=(u+1)/2,P=(p+1)/2,C=(h+f)/4,T=(d+x)/4,H=(g+m)/4;return _>w&&_>P?_<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(_),s=C/n,r=T/n):w>P?w<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(w),n=C/s,r=H/s):P<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(P),n=T/r,s=H/r),this.set(n,s,r,t),this}let v=Math.sqrt((m-g)*(m-g)+(d-x)*(d-x)+(f-h)*(f-h));return Math.abs(v)<.001&&(v=1),this.x=(m-g)/v,this.y=(d-x)/v,this.z=(f-h)/v,this.w=Math.acos((c+u+p-1)/2),this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class wh extends Cn{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new ut(0,0,e,t),this.scissorTest=!1,this.viewport=new ut(0,0,e,t);const s={width:e,height:t,depth:1};n.encoding!==void 0&&(Ui("THREE.WebGLRenderTarget: option.encoding has been replaced by option.colorSpace."),n.colorSpace=n.encoding===An?gt:zt),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:kt,depthBuffer:!0,stencilBuffer:!1,depthTexture:null,samples:0},n),this.texture=new Dt(s,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.flipY=!1,this.texture.generateMipmaps=n.generateMipmaps,this.texture.internalFormat=n.internalFormat,this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}setSize(e,t,n=1){(this.width!==e||this.height!==t||this.depth!==n)&&(this.width=e,this.height=t,this.depth=n,this.texture.image.width=e,this.texture.image.height=t,this.texture.image.depth=n,this.dispose()),this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.texture=e.texture.clone(),this.texture.isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new ia(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Rn extends wh{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class sa extends Dt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Et,this.minFilter=Et,this.wrapR=Vt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Th extends Dt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Et,this.minFilter=Et,this.wrapR=Vt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Ln{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let l=n[s+0],c=n[s+1],h=n[s+2],d=n[s+3];const f=r[a+0],u=r[a+1],g=r[a+2],x=r[a+3];if(o===0){e[t+0]=l,e[t+1]=c,e[t+2]=h,e[t+3]=d;return}if(o===1){e[t+0]=f,e[t+1]=u,e[t+2]=g,e[t+3]=x;return}if(d!==x||l!==f||c!==u||h!==g){let m=1-o;const p=l*f+c*u+h*g+d*x,v=p>=0?1:-1,_=1-p*p;if(_>Number.EPSILON){const P=Math.sqrt(_),C=Math.atan2(P,p*v);m=Math.sin(m*C)/P,o=Math.sin(o*C)/P}const w=o*v;if(l=l*m+f*w,c=c*m+u*w,h=h*m+g*w,d=d*m+x*w,m===1-o){const P=1/Math.sqrt(l*l+c*c+h*h+d*d);l*=P,c*=P,h*=P,d*=P}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=d}static multiplyQuaternionsFlat(e,t,n,s,r,a){const o=n[s],l=n[s+1],c=n[s+2],h=n[s+3],d=r[a],f=r[a+1],u=r[a+2],g=r[a+3];return e[t]=o*g+h*d+l*u-c*f,e[t+1]=l*g+h*f+c*d-o*u,e[t+2]=c*g+h*u+o*f-l*d,e[t+3]=h*g-o*d-l*f-c*u,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(s/2),d=o(r/2),f=l(n/2),u=l(s/2),g=l(r/2);switch(a){case"XYZ":this._x=f*h*d+c*u*g,this._y=c*u*d-f*h*g,this._z=c*h*g+f*u*d,this._w=c*h*d-f*u*g;break;case"YXZ":this._x=f*h*d+c*u*g,this._y=c*u*d-f*h*g,this._z=c*h*g-f*u*d,this._w=c*h*d+f*u*g;break;case"ZXY":this._x=f*h*d-c*u*g,this._y=c*u*d+f*h*g,this._z=c*h*g+f*u*d,this._w=c*h*d-f*u*g;break;case"ZYX":this._x=f*h*d-c*u*g,this._y=c*u*d+f*h*g,this._z=c*h*g-f*u*d,this._w=c*h*d+f*u*g;break;case"YZX":this._x=f*h*d+c*u*g,this._y=c*u*d+f*h*g,this._z=c*h*g-f*u*d,this._w=c*h*d-f*u*g;break;case"XZY":this._x=f*h*d-c*u*g,this._y=c*u*d-f*h*g,this._z=c*h*g+f*u*d,this._w=c*h*d+f*u*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],h=t[6],d=t[10],f=n+o+d;if(f>0){const u=.5/Math.sqrt(f+1);this._w=.25/u,this._x=(h-l)*u,this._y=(r-c)*u,this._z=(a-s)*u}else if(n>o&&n>d){const u=2*Math.sqrt(1+n-o-d);this._w=(h-l)/u,this._x=.25*u,this._y=(s+a)/u,this._z=(r+c)/u}else if(o>d){const u=2*Math.sqrt(1+o-n-d);this._w=(r-c)/u,this._x=(s+a)/u,this._y=.25*u,this._z=(l+h)/u}else{const u=2*Math.sqrt(1+d-n-o);this._w=(a-s)/u,this._x=(r+c)/u,this._y=(l+h)/u,this._z=.25*u}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(dt(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+a*o+s*c-r*l,this._y=s*h+a*l+r*o-n*c,this._z=r*h+a*c+n*l-s*o,this._w=a*h-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,s=this._y,r=this._z,a=this._w;let o=a*e._w+n*e._x+s*e._y+r*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=s,this._z=r,this;const l=1-o*o;if(l<=Number.EPSILON){const u=1-t;return this._w=u*a+t*this._w,this._x=u*n+t*this._x,this._y=u*s+t*this._y,this._z=u*r+t*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,o),d=Math.sin((1-t)*h)/c,f=Math.sin(t*h)/c;return this._w=a*d+this._w*f,this._x=n*d+this._x*f,this._y=s*d+this._y*f,this._z=r*d+this._z*f,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=Math.random(),t=Math.sqrt(1-e),n=Math.sqrt(e),s=2*Math.PI*Math.random(),r=2*Math.PI*Math.random();return this.set(t*Math.cos(s),n*Math.sin(r),n*Math.cos(r),t*Math.sin(s))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class L{constructor(e=0,t=0,n=0){L.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(ra.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(ra.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){const t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*s-o*n),h=2*(o*t-r*s),d=2*(r*n-a*t);return this.x=t+l*c+a*d-o*h,this.y=n+l*h+o*c-r*d,this.z=s+l*d+r*h-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return lr.copy(this).projectOnVector(e),this.sub(lr)}reflect(e){return this.sub(lr.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(dt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=(Math.random()-.5)*2,t=Math.random()*Math.PI*2,n=Math.sqrt(1-e**2);return this.x=n*Math.cos(t),this.y=n*Math.sin(t),this.z=e,this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const lr=new L,ra=new Ln;class Pn{constructor(e=new L(1/0,1/0,1/0),t=new L(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Xt.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Xt.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=Xt.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,Xt):Xt.fromBufferAttribute(r,a),Xt.applyMatrix4(e.matrixWorld),this.expandByPoint(Xt);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ns.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),ns.copy(n.boundingBox)),ns.applyMatrix4(e.matrixWorld),this.union(ns)}const s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return!(e.x<this.min.x||e.x>this.max.x||e.y<this.min.y||e.y>this.max.y||e.z<this.min.z||e.z>this.max.z)}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return!(e.max.x<this.min.x||e.min.x>this.max.x||e.max.y<this.min.y||e.min.y>this.max.y||e.max.z<this.min.z||e.min.z>this.max.z)}intersectsSphere(e){return this.clampPoint(e.center,Xt),Xt.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Ni),is.subVectors(this.max,Ni),si.subVectors(e.a,Ni),ri.subVectors(e.b,Ni),oi.subVectors(e.c,Ni),gn.subVectors(ri,si),xn.subVectors(oi,ri),Dn.subVectors(si,oi);let t=[0,-gn.z,gn.y,0,-xn.z,xn.y,0,-Dn.z,Dn.y,gn.z,0,-gn.x,xn.z,0,-xn.x,Dn.z,0,-Dn.x,-gn.y,gn.x,0,-xn.y,xn.x,0,-Dn.y,Dn.x,0];return!cr(t,si,ri,oi,is)||(t=[1,0,0,0,1,0,0,0,1],!cr(t,si,ri,oi,is))?!1:(ss.crossVectors(gn,xn),t=[ss.x,ss.y,ss.z],cr(t,si,ri,oi,is))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Xt).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Xt).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(en[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),en[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),en[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),en[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),en[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),en[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),en[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),en[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(en),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const en=[new L,new L,new L,new L,new L,new L,new L,new L],Xt=new L,ns=new Pn,si=new L,ri=new L,oi=new L,gn=new L,xn=new L,Dn=new L,Ni=new L,is=new L,ss=new L,In=new L;function cr(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){In.fromArray(i,r);const o=s.x*Math.abs(In.x)+s.y*Math.abs(In.y)+s.z*Math.abs(In.z),l=e.dot(In),c=t.dot(In),h=n.dot(In);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}const Ah=new Pn,Oi=new L,hr=new L;class rs{constructor(e=new L,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):Ah.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Oi.subVectors(e,this.center);const t=Oi.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(Oi,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(hr.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Oi.copy(e.center).add(hr)),this.expandByPoint(Oi.copy(e.center).sub(hr))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const tn=new L,dr=new L,os=new L,_n=new L,ur=new L,as=new L,fr=new L;class ls{constructor(e=new L,t=new L(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,tn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=tn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(tn.copy(this.origin).addScaledVector(this.direction,t),tn.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){dr.copy(e).add(t).multiplyScalar(.5),os.copy(t).sub(e).normalize(),_n.copy(this.origin).sub(dr);const r=e.distanceTo(t)*.5,a=-this.direction.dot(os),o=_n.dot(this.direction),l=-_n.dot(os),c=_n.lengthSq(),h=Math.abs(1-a*a);let d,f,u,g;if(h>0)if(d=a*l-o,f=a*o-l,g=r*h,d>=0)if(f>=-g)if(f<=g){const x=1/h;d*=x,f*=x,u=d*(d+a*f+2*o)+f*(a*d+f+2*l)+c}else f=r,d=Math.max(0,-(a*f+o)),u=-d*d+f*(f+2*l)+c;else f=-r,d=Math.max(0,-(a*f+o)),u=-d*d+f*(f+2*l)+c;else f<=-g?(d=Math.max(0,-(-a*r+o)),f=d>0?-r:Math.min(Math.max(-r,-l),r),u=-d*d+f*(f+2*l)+c):f<=g?(d=0,f=Math.min(Math.max(-r,-l),r),u=f*(f+2*l)+c):(d=Math.max(0,-(a*r+o)),f=d>0?r:Math.min(Math.max(-r,-l),r),u=-d*d+f*(f+2*l)+c);else f=a>0?-r:r,d=Math.max(0,-(a*f+o)),u=-d*d+f*(f+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,d),s&&s.copy(dr).addScaledVector(os,f),u}intersectSphere(e,t){tn.subVectors(e.center,this.origin);const n=tn.dot(this.direction),s=tn.dot(tn)-n*n,r=e.radius*e.radius;if(s>r)return null;const a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,l;const c=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,f=this.origin;return c>=0?(n=(e.min.x-f.x)*c,s=(e.max.x-f.x)*c):(n=(e.max.x-f.x)*c,s=(e.min.x-f.x)*c),h>=0?(r=(e.min.y-f.y)*h,a=(e.max.y-f.y)*h):(r=(e.max.y-f.y)*h,a=(e.min.y-f.y)*h),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),d>=0?(o=(e.min.z-f.z)*d,l=(e.max.z-f.z)*d):(o=(e.max.z-f.z)*d,l=(e.min.z-f.z)*d),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,tn)!==null}intersectTriangle(e,t,n,s,r){ur.subVectors(t,e),as.subVectors(n,e),fr.crossVectors(ur,as);let a=this.direction.dot(fr),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;_n.subVectors(this.origin,e);const l=o*this.direction.dot(as.crossVectors(_n,as));if(l<0)return null;const c=o*this.direction.dot(ur.cross(_n));if(c<0||l+c>a)return null;const h=-o*_n.dot(fr);return h<0?null:this.at(h/a,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Qe{constructor(e,t,n,s,r,a,o,l,c,h,d,f,u,g,x,m){Qe.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c,h,d,f,u,g,x,m)}set(e,t,n,s,r,a,o,l,c,h,d,f,u,g,x,m){const p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=s,p[1]=r,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=h,p[10]=d,p[14]=f,p[3]=u,p[7]=g,p[11]=x,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Qe().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,s=1/ai.setFromMatrixColumn(e,0).length(),r=1/ai.setFromMatrixColumn(e,1).length(),a=1/ai.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),d=Math.sin(r);if(e.order==="XYZ"){const f=a*h,u=a*d,g=o*h,x=o*d;t[0]=l*h,t[4]=-l*d,t[8]=c,t[1]=u+g*c,t[5]=f-x*c,t[9]=-o*l,t[2]=x-f*c,t[6]=g+u*c,t[10]=a*l}else if(e.order==="YXZ"){const f=l*h,u=l*d,g=c*h,x=c*d;t[0]=f+x*o,t[4]=g*o-u,t[8]=a*c,t[1]=a*d,t[5]=a*h,t[9]=-o,t[2]=u*o-g,t[6]=x+f*o,t[10]=a*l}else if(e.order==="ZXY"){const f=l*h,u=l*d,g=c*h,x=c*d;t[0]=f-x*o,t[4]=-a*d,t[8]=g+u*o,t[1]=u+g*o,t[5]=a*h,t[9]=x-f*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){const f=a*h,u=a*d,g=o*h,x=o*d;t[0]=l*h,t[4]=g*c-u,t[8]=f*c+x,t[1]=l*d,t[5]=x*c+f,t[9]=u*c-g,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){const f=a*l,u=a*c,g=o*l,x=o*c;t[0]=l*h,t[4]=x-f*d,t[8]=g*d+u,t[1]=d,t[5]=a*h,t[9]=-o*h,t[2]=-c*h,t[6]=u*d+g,t[10]=f-x*d}else if(e.order==="XZY"){const f=a*l,u=a*c,g=o*l,x=o*c;t[0]=l*h,t[4]=-d,t[8]=c*h,t[1]=f*d+x,t[5]=a*h,t[9]=u*d-g,t[2]=g*d-u,t[6]=o*h,t[10]=x*d+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Ch,e,Rh)}lookAt(e,t,n){const s=this.elements;return It.subVectors(e,t),It.lengthSq()===0&&(It.z=1),It.normalize(),vn.crossVectors(n,It),vn.lengthSq()===0&&(Math.abs(n.z)===1?It.x+=1e-4:It.z+=1e-4,It.normalize(),vn.crossVectors(n,It)),vn.normalize(),cs.crossVectors(It,vn),s[0]=vn.x,s[4]=cs.x,s[8]=It.x,s[1]=vn.y,s[5]=cs.y,s[9]=It.y,s[2]=vn.z,s[6]=cs.z,s[10]=It.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],d=n[5],f=n[9],u=n[13],g=n[2],x=n[6],m=n[10],p=n[14],v=n[3],_=n[7],w=n[11],P=n[15],C=s[0],T=s[4],H=s[8],y=s[12],E=s[1],N=s[5],G=s[9],J=s[13],R=s[2],U=s[6],B=s[10],$=s[14],q=s[3],K=s[7],Q=s[11],ee=s[15];return r[0]=a*C+o*E+l*R+c*q,r[4]=a*T+o*N+l*U+c*K,r[8]=a*H+o*G+l*B+c*Q,r[12]=a*y+o*J+l*$+c*ee,r[1]=h*C+d*E+f*R+u*q,r[5]=h*T+d*N+f*U+u*K,r[9]=h*H+d*G+f*B+u*Q,r[13]=h*y+d*J+f*$+u*ee,r[2]=g*C+x*E+m*R+p*q,r[6]=g*T+x*N+m*U+p*K,r[10]=g*H+x*G+m*B+p*Q,r[14]=g*y+x*J+m*$+p*ee,r[3]=v*C+_*E+w*R+P*q,r[7]=v*T+_*N+w*U+P*K,r[11]=v*H+_*G+w*B+P*Q,r[15]=v*y+_*J+w*$+P*ee,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],h=e[2],d=e[6],f=e[10],u=e[14],g=e[3],x=e[7],m=e[11],p=e[15];return g*(+r*l*d-s*c*d-r*o*f+n*c*f+s*o*u-n*l*u)+x*(+t*l*u-t*c*f+r*a*f-s*a*u+s*c*h-r*l*h)+m*(+t*c*d-t*o*u-r*a*d+n*a*u+r*o*h-n*c*h)+p*(-s*o*h-t*l*d+t*o*f+s*a*d-n*a*f+n*l*h)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],d=e[9],f=e[10],u=e[11],g=e[12],x=e[13],m=e[14],p=e[15],v=d*m*c-x*f*c+x*l*u-o*m*u-d*l*p+o*f*p,_=g*f*c-h*m*c-g*l*u+a*m*u+h*l*p-a*f*p,w=h*x*c-g*d*c+g*o*u-a*x*u-h*o*p+a*d*p,P=g*d*l-h*x*l-g*o*f+a*x*f+h*o*m-a*d*m,C=t*v+n*_+s*w+r*P;if(C===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const T=1/C;return e[0]=v*T,e[1]=(x*f*r-d*m*r-x*s*u+n*m*u+d*s*p-n*f*p)*T,e[2]=(o*m*r-x*l*r+x*s*c-n*m*c-o*s*p+n*l*p)*T,e[3]=(d*l*r-o*f*r-d*s*c+n*f*c+o*s*u-n*l*u)*T,e[4]=_*T,e[5]=(h*m*r-g*f*r+g*s*u-t*m*u-h*s*p+t*f*p)*T,e[6]=(g*l*r-a*m*r-g*s*c+t*m*c+a*s*p-t*l*p)*T,e[7]=(a*f*r-h*l*r+h*s*c-t*f*c-a*s*u+t*l*u)*T,e[8]=w*T,e[9]=(g*d*r-h*x*r-g*n*u+t*x*u+h*n*p-t*d*p)*T,e[10]=(a*x*r-g*o*r+g*n*c-t*x*c-a*n*p+t*o*p)*T,e[11]=(h*o*r-a*d*r-h*n*c+t*d*c+a*n*u-t*o*u)*T,e[12]=P*T,e[13]=(h*x*s-g*d*s+g*n*f-t*x*f-h*n*m+t*d*m)*T,e[14]=(g*o*s-a*x*s-g*n*l+t*x*l+a*n*m-t*o*m)*T,e[15]=(a*d*s-h*o*s+h*n*l-t*d*l-a*n*f+t*o*f)*T,this}scale(e){const t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,l=e.z,c=r*a,h=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,h*o+n,h*l-s*a,0,c*l-s*o,h*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){const s=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,h=a+a,d=o+o,f=r*c,u=r*h,g=r*d,x=a*h,m=a*d,p=o*d,v=l*c,_=l*h,w=l*d,P=n.x,C=n.y,T=n.z;return s[0]=(1-(x+p))*P,s[1]=(u+w)*P,s[2]=(g-_)*P,s[3]=0,s[4]=(u-w)*C,s[5]=(1-(f+p))*C,s[6]=(m+v)*C,s[7]=0,s[8]=(g+_)*T,s[9]=(m-v)*T,s[10]=(1-(f+x))*T,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){const s=this.elements;let r=ai.set(s[0],s[1],s[2]).length();const a=ai.set(s[4],s[5],s[6]).length(),o=ai.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],jt.copy(this);const c=1/r,h=1/a,d=1/o;return jt.elements[0]*=c,jt.elements[1]*=c,jt.elements[2]*=c,jt.elements[4]*=h,jt.elements[5]*=h,jt.elements[6]*=h,jt.elements[8]*=d,jt.elements[9]*=d,jt.elements[10]*=d,t.setFromRotationMatrix(jt),n.x=r,n.y=a,n.z=o,this}makePerspective(e,t,n,s,r,a,o=Qt){const l=this.elements,c=2*r/(t-e),h=2*r/(n-s),d=(t+e)/(t-e),f=(n+s)/(n-s);let u,g;if(o===Qt)u=-(a+r)/(a-r),g=-2*a*r/(a-r);else if(o===Zi)u=-a/(a-r),g=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=c,l[4]=0,l[8]=d,l[12]=0,l[1]=0,l[5]=h,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=u,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=Qt){const l=this.elements,c=1/(t-e),h=1/(n-s),d=1/(a-r),f=(t+e)*c,u=(n+s)*h;let g,x;if(o===Qt)g=(a+r)*d,x=-2*d;else if(o===Zi)g=r*d,x=-1*d;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-f,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-u,l[2]=0,l[6]=0,l[10]=x,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const ai=new L,jt=new Qe,Ch=new L(0,0,0),Rh=new L(1,1,1),vn=new L,cs=new L,It=new L,oa=new Qe,aa=new Ln;class hs{constructor(e=0,t=0,n=0,s=hs.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const s=e.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],h=s[9],d=s[2],f=s[6],u=s[10];switch(t){case"XYZ":this._y=Math.asin(dt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,u),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-dt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,u),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(dt(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-d,u),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-dt(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(f,u),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(dt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(o,u));break;case"XZY":this._z=Math.asin(-dt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,u),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return oa.makeRotationFromQuaternion(e),this.setFromRotationMatrix(oa,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return aa.setFromEuler(this),this.setFromQuaternion(aa,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}hs.DEFAULT_ORDER="XYZ";class pr{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Lh=0;const la=new L,li=new Ln,nn=new Qe,ds=new L,Fi=new L,Ph=new L,Dh=new Ln,ca=new L(1,0,0),ha=new L(0,1,0),da=new L(0,0,1),Ih={type:"added"},Uh={type:"removed"};class ft extends Cn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Lh++}),this.uuid=ei(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=ft.DEFAULT_UP.clone();const e=new L,t=new hs,n=new Ln,s=new L(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Qe},normalMatrix:{value:new Ge}}),this.matrix=new Qe,this.matrixWorld=new Qe,this.matrixAutoUpdate=ft.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=ft.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new pr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return li.setFromAxisAngle(e,t),this.quaternion.multiply(li),this}rotateOnWorldAxis(e,t){return li.setFromAxisAngle(e,t),this.quaternion.premultiply(li),this}rotateX(e){return this.rotateOnAxis(ca,e)}rotateY(e){return this.rotateOnAxis(ha,e)}rotateZ(e){return this.rotateOnAxis(da,e)}translateOnAxis(e,t){return la.copy(e).applyQuaternion(this.quaternion),this.position.add(la.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(ca,e)}translateY(e){return this.translateOnAxis(ha,e)}translateZ(e){return this.translateOnAxis(da,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(nn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?ds.copy(e):ds.set(e,t,n);const s=this.parent;this.updateWorldMatrix(!0,!1),Fi.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?nn.lookAt(Fi,ds,this.up):nn.lookAt(ds,Fi,this.up),this.quaternion.setFromRotationMatrix(nn),s&&(nn.extractRotation(s.matrixWorld),li.setFromRotationMatrix(nn),this.quaternion.premultiply(li.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.parent!==null&&e.parent.remove(e),e.parent=this,this.children.push(e),e.dispatchEvent(Ih)):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Uh)),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),nn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),nn.multiply(e.parent.matrixWorld)),e.applyMatrix4(nn),this.add(e),e.updateWorldMatrix(!1,!0),this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){const a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Fi,e,Ph),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Fi,Dh,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,s=t.length;n<s;n++){const r=t[n];(r.matrixWorldAutoUpdate===!0||e===!0)&&r.updateMatrixWorld(e)}}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.matrixWorldAutoUpdate===!0&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),t===!0){const s=this.children;for(let r=0,a=s.length;r<a;r++){const o=s[r];o.matrixWorldAutoUpdate===!0&&o.updateWorldMatrix(!1,!0)}}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),s.maxGeometryCount=this._maxGeometryCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(e),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const d=l[c];r(e.shapes,d)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];s.animations.push(r(e.animations,l))}}if(t){const o=a(e.geometries),l=a(e.materials),c=a(e.textures),h=a(e.images),d=a(e.shapes),f=a(e.skeletons),u=a(e.animations),g=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),d.length>0&&(n.shapes=d),f.length>0&&(n.skeletons=f),u.length>0&&(n.animations=u),g.length>0&&(n.nodes=g)}return n.object=s,n;function a(o){const l=[];for(const c in o){const h=o[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const s=e.children[n];this.add(s.clone())}return this}}ft.DEFAULT_UP=new L(0,1,0),ft.DEFAULT_MATRIX_AUTO_UPDATE=!0,ft.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const qt=new L,sn=new L,mr=new L,rn=new L,ci=new L,hi=new L,ua=new L,gr=new L,xr=new L,_r=new L;let us=!1;class $t{constructor(e=new L,t=new L,n=new L){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),qt.subVectors(e,t),s.cross(qt);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){qt.subVectors(s,t),sn.subVectors(n,t),mr.subVectors(e,t);const a=qt.dot(qt),o=qt.dot(sn),l=qt.dot(mr),c=sn.dot(sn),h=sn.dot(mr),d=a*c-o*o;if(d===0)return r.set(0,0,0),null;const f=1/d,u=(c*l-o*h)*f,g=(a*h-o*l)*f;return r.set(1-u-g,g,u)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,rn)===null?!1:rn.x>=0&&rn.y>=0&&rn.x+rn.y<=1}static getUV(e,t,n,s,r,a,o,l){return us===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),us=!0),this.getInterpolation(e,t,n,s,r,a,o,l)}static getInterpolation(e,t,n,s,r,a,o,l){return this.getBarycoord(e,t,n,s,rn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,rn.x),l.addScaledVector(a,rn.y),l.addScaledVector(o,rn.z),l)}static isFrontFacing(e,t,n,s){return qt.subVectors(n,t),sn.subVectors(e,t),qt.cross(sn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return qt.subVectors(this.c,this.b),sn.subVectors(this.a,this.b),qt.cross(sn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(.3333333333333333)}getNormal(e){return $t.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return $t.getBarycoord(e,this.a,this.b,this.c,t)}getUV(e,t,n,s,r){return us===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),us=!0),$t.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}getInterpolation(e,t,n,s,r){return $t.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return $t.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return $t.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,s=this.b,r=this.c;let a,o;ci.subVectors(s,n),hi.subVectors(r,n),gr.subVectors(e,n);const l=ci.dot(gr),c=hi.dot(gr);if(l<=0&&c<=0)return t.copy(n);xr.subVectors(e,s);const h=ci.dot(xr),d=hi.dot(xr);if(h>=0&&d<=h)return t.copy(s);const f=l*d-h*c;if(f<=0&&l>=0&&h<=0)return a=l/(l-h),t.copy(n).addScaledVector(ci,a);_r.subVectors(e,r);const u=ci.dot(_r),g=hi.dot(_r);if(g>=0&&u<=g)return t.copy(r);const x=u*c-l*g;if(x<=0&&c>=0&&g<=0)return o=c/(c-g),t.copy(n).addScaledVector(hi,o);const m=h*g-u*d;if(m<=0&&d-h>=0&&u-g>=0)return ua.subVectors(r,s),o=(d-h)/(d-h+(u-g)),t.copy(s).addScaledVector(ua,o);const p=1/(m+x+f);return a=x*p,o=f*p,t.copy(n).addScaledVector(ci,a).addScaledVector(hi,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const fa={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},yn={h:0,s:0,l:0},fs={h:0,s:0,l:0};function vr(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<.16666666666666666?i+(e-i)*6*t:t<.5?e:t<.6666666666666666?i+(e-i)*6*(.6666666666666666-t):i}class Ue{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=gt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ye.toWorkingColorSpace(this,t),this}setRGB(e,t,n,s=Ye.workingColorSpace){return this.r=e,this.g=t,this.b=n,Ye.toWorkingColorSpace(this,s),this}setHSL(e,t,n,s=Ye.workingColorSpace){if(e=nr(e,1),t=dt(t,0,1),n=dt(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=vr(a,r,e+.3333333333333333),this.g=vr(a,r,e),this.b=vr(a,r,e-.3333333333333333)}return Ye.toWorkingColorSpace(this,s),this}setStyle(e,t=gt){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=gt){const n=fa[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=ni(e.r),this.g=ni(e.g),this.b=ni(e.b),this}copyLinearToSRGB(e){return this.r=or(e.r),this.g=or(e.g),this.b=or(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=gt){return Ye.fromWorkingColorSpace(_t.copy(this),e),Math.round(dt(_t.r*255,0,255))*65536+Math.round(dt(_t.g*255,0,255))*256+Math.round(dt(_t.b*255,0,255))}getHexString(e=gt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ye.workingColorSpace){Ye.fromWorkingColorSpace(_t.copy(this),t);const n=_t.r,s=_t.g,r=_t.b,a=Math.max(n,s,r),o=Math.min(n,s,r);let l,c;const h=(o+a)/2;if(o===a)l=0,c=0;else{const d=a-o;switch(c=h<=.5?d/(a+o):d/(2-a-o),a){case n:l=(s-r)/d+(s<r?6:0);break;case s:l=(r-n)/d+2;break;case r:l=(n-s)/d+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=Ye.workingColorSpace){return Ye.fromWorkingColorSpace(_t.copy(this),t),e.r=_t.r,e.g=_t.g,e.b=_t.b,e}getStyle(e=gt){Ye.fromWorkingColorSpace(_t.copy(this),e);const t=_t.r,n=_t.g,s=_t.b;return e!==gt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(yn),this.setHSL(yn.h+e,yn.s+t,yn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(yn),e.getHSL(fs);const n=Ii(yn.h,fs.h,t),s=Ii(yn.s,fs.s,t),r=Ii(yn.l,fs.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const _t=new Ue;Ue.NAMES=fa;let Nh=0;class di extends Cn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Nh++}),this.uuid=ei(),this.name="",this.type="Material",this.blending=Yn,this.side=hn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=zs,this.blendDst=Hs,this.blendEquation=Mn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ue(0,0,0),this.blendAlpha=0,this.depthFunc=ji,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=qo,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Qn,this.stencilZFail=Qn,this.stencilZPass=Qn,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Yn&&(n.blending=this.blending),this.side!==hn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==zs&&(n.blendSrc=this.blendSrc),this.blendDst!==Hs&&(n.blendDst=this.blendDst),this.blendEquation!==Mn&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==ji&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==qo&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Qn&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Qn&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Qn&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const a=[];for(const o in r){const l=r[o];delete l.metadata,a.push(l)}return a}if(t){const r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class pa extends di{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ue(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=Gs,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const ot=new L,ps=new xe;class Je{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Yo,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.gpuType=mn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return console.warn("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)ps.fromBufferAttribute(this,t),ps.applyMatrix3(e),this.setXY(t,ps.x,ps.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)ot.fromBufferAttribute(this,t),ot.applyMatrix3(e),this.setXYZ(t,ot.x,ot.y,ot.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)ot.fromBufferAttribute(this,t),ot.applyMatrix4(e),this.setXYZ(t,ot.x,ot.y,ot.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)ot.fromBufferAttribute(this,t),ot.applyNormalMatrix(e),this.setXYZ(t,ot.x,ot.y,ot.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)ot.fromBufferAttribute(this,t),ot.transformDirection(e),this.setXYZ(t,ot.x,ot.y,ot.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=ti(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Mt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=ti(t,this.array)),t}setX(e,t){return this.normalized&&(t=Mt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=ti(t,this.array)),t}setY(e,t){return this.normalized&&(t=Mt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=ti(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Mt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=ti(t,this.array)),t}setW(e,t){return this.normalized&&(t=Mt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Mt(t,this.array),n=Mt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=Mt(t,this.array),n=Mt(n,this.array),s=Mt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=Mt(t,this.array),n=Mt(n,this.array),s=Mt(s,this.array),r=Mt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Yo&&(e.usage=this.usage),e}}class ma extends Je{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class ga extends Je{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class vt extends Je{constructor(e,t,n){super(new Float32Array(e),t,n)}}let Oh=0;const Ht=new Qe,yr=new ft,ui=new L,Ut=new Pn,Bi=new Pn,pt=new L;class yt extends Cn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Oh++}),this.uuid=ei(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Zo(e)?ga:ma)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Ge().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Ht.makeRotationFromQuaternion(e),this.applyMatrix4(Ht),this}rotateX(e){return Ht.makeRotationX(e),this.applyMatrix4(Ht),this}rotateY(e){return Ht.makeRotationY(e),this.applyMatrix4(Ht),this}rotateZ(e){return Ht.makeRotationZ(e),this.applyMatrix4(Ht),this}translate(e,t,n){return Ht.makeTranslation(e,t,n),this.applyMatrix4(Ht),this}scale(e,t,n){return Ht.makeScale(e,t,n),this.applyMatrix4(Ht),this}lookAt(e){return yr.lookAt(e),yr.updateMatrix(),this.applyMatrix4(yr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ui).negate(),this.translate(ui.x,ui.y,ui.z),this}setFromPoints(e){const t=[];for(let n=0,s=e.length;n<s;n++){const r=e[n];t.push(r.x,r.y,r.z||0)}return this.setAttribute("position",new vt(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Pn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingBox.set(new L(-1/0,-1/0,-1/0),new L(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){const r=t[n];Ut.setFromBufferAttribute(r),this.morphTargetsRelative?(pt.addVectors(this.boundingBox.min,Ut.min),this.boundingBox.expandByPoint(pt),pt.addVectors(this.boundingBox.max,Ut.max),this.boundingBox.expandByPoint(pt)):(this.boundingBox.expandByPoint(Ut.min),this.boundingBox.expandByPoint(Ut.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new rs);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingSphere.set(new L,1/0);return}if(e){const n=this.boundingSphere.center;if(Ut.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){const o=t[r];Bi.setFromBufferAttribute(o),this.morphTargetsRelative?(pt.addVectors(Ut.min,Bi.min),Ut.expandByPoint(pt),pt.addVectors(Ut.max,Bi.max),Ut.expandByPoint(pt)):(Ut.expandByPoint(Bi.min),Ut.expandByPoint(Bi.max))}Ut.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)pt.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(pt));if(t)for(let r=0,a=t.length;r<a;r++){const o=t[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)pt.fromBufferAttribute(o,c),l&&(ui.fromBufferAttribute(e,c),pt.add(ui)),s=Math.max(s,n.distanceToSquared(pt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=e.array,s=t.position.array,r=t.normal.array,a=t.uv.array,o=s.length/3;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Je(new Float32Array(4*o),4));const l=this.getAttribute("tangent").array,c=[],h=[];for(let E=0;E<o;E++)c[E]=new L,h[E]=new L;const d=new L,f=new L,u=new L,g=new xe,x=new xe,m=new xe,p=new L,v=new L;function _(E,N,G){d.fromArray(s,E*3),f.fromArray(s,N*3),u.fromArray(s,G*3),g.fromArray(a,E*2),x.fromArray(a,N*2),m.fromArray(a,G*2),f.sub(d),u.sub(d),x.sub(g),m.sub(g);const J=1/(x.x*m.y-m.x*x.y);isFinite(J)&&(p.copy(f).multiplyScalar(m.y).addScaledVector(u,-x.y).multiplyScalar(J),v.copy(u).multiplyScalar(x.x).addScaledVector(f,-m.x).multiplyScalar(J),c[E].add(p),c[N].add(p),c[G].add(p),h[E].add(v),h[N].add(v),h[G].add(v))}let w=this.groups;w.length===0&&(w=[{start:0,count:n.length}]);for(let E=0,N=w.length;E<N;++E){const G=w[E],J=G.start,R=G.count;for(let U=J,B=J+R;U<B;U+=3)_(n[U+0],n[U+1],n[U+2])}const P=new L,C=new L,T=new L,H=new L;function y(E){T.fromArray(r,E*3),H.copy(T);const N=c[E];P.copy(N),P.sub(T.multiplyScalar(T.dot(N))).normalize(),C.crossVectors(H,N);const J=C.dot(h[E])<0?-1:1;l[E*4]=P.x,l[E*4+1]=P.y,l[E*4+2]=P.z,l[E*4+3]=J}for(let E=0,N=w.length;E<N;++E){const G=w[E],J=G.start,R=G.count;for(let U=J,B=J+R;U<B;U+=3)y(n[U+0]),y(n[U+1]),y(n[U+2])}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Je(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let f=0,u=n.count;f<u;f++)n.setXYZ(f,0,0,0);const s=new L,r=new L,a=new L,o=new L,l=new L,c=new L,h=new L,d=new L;if(e)for(let f=0,u=e.count;f<u;f+=3){const g=e.getX(f+0),x=e.getX(f+1),m=e.getX(f+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,x),a.fromBufferAttribute(t,m),h.subVectors(a,r),d.subVectors(s,r),h.cross(d),o.fromBufferAttribute(n,g),l.fromBufferAttribute(n,x),c.fromBufferAttribute(n,m),o.add(h),l.add(h),c.add(h),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(x,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let f=0,u=t.count;f<u;f+=3)s.fromBufferAttribute(t,f+0),r.fromBufferAttribute(t,f+1),a.fromBufferAttribute(t,f+2),h.subVectors(a,r),d.subVectors(s,r),h.cross(d),n.setXYZ(f+0,h.x,h.y,h.z),n.setXYZ(f+1,h.x,h.y,h.z),n.setXYZ(f+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)pt.fromBufferAttribute(e,t),pt.normalize(),e.setXYZ(t,pt.x,pt.y,pt.z)}toNonIndexed(){function e(o,l){const c=o.array,h=o.itemSize,d=o.normalized,f=new c.constructor(l.length*h);let u=0,g=0;for(let x=0,m=l.length;x<m;x++){o.isInterleavedBufferAttribute?u=l[x]*o.data.stride+o.offset:u=l[x]*h;for(let p=0;p<h;p++)f[g++]=c[u++]}return new Je(f,h,d)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new yt,n=this.index.array,s=this.attributes;for(const o in s){const l=s[o],c=e(l,n);t.setAttribute(o,c)}const r=this.morphAttributes;for(const o in r){const l=[],c=r[o];for(let h=0,d=c.length;h<d;h++){const f=c[h],u=e(f,n);l.push(u)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let d=0,f=c.length;d<f;d++){const u=c[d];h.push(u.toJSON(e.data))}h.length>0&&(s[l]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone(t));const s=e.attributes;for(const c in s){const h=s[c];this.setAttribute(c,h.clone(t))}const r=e.morphAttributes;for(const c in r){const h=[],d=r[c];for(let f=0,u=d.length;f<u;f++)h.push(d[f].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let c=0,h=a.length;c<h;c++){const d=a[c];this.addGroup(d.start,d.count,d.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const xa=new Qe,Un=new ls,ms=new rs,_a=new L,fi=new L,pi=new L,mi=new L,br=new L,gs=new L,xs=new xe,_s=new xe,vs=new xe,va=new L,ya=new L,ba=new L,ys=new L,bs=new L;class wt extends ft{constructor(e=new yt,t=new pa){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);const o=this.morphTargetInfluences;if(r&&o){gs.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const h=o[l],d=r[l];h!==0&&(br.fromBufferAttribute(d,e),a?gs.addScaledVector(br,h):gs.addScaledVector(br.sub(t),h))}t.add(gs)}return t}raycast(e,t){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),ms.copy(n.boundingSphere),ms.applyMatrix4(r),Un.copy(e.ray).recast(e.near),!(ms.containsPoint(Un.origin)===!1&&(Un.intersectSphere(ms,_a)===null||Un.origin.distanceToSquared(_a)>(e.far-e.near)**2))&&(xa.copy(r).invert(),Un.copy(e.ray).applyMatrix4(xa),!(n.boundingBox!==null&&Un.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Un)))}_computeIntersections(e,t,n){let s;const r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,d=r.attributes.normal,f=r.groups,u=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,x=f.length;g<x;g++){const m=f[g],p=a[m.materialIndex],v=Math.max(m.start,u.start),_=Math.min(o.count,Math.min(m.start+m.count,u.start+u.count));for(let w=v,P=_;w<P;w+=3){const C=o.getX(w),T=o.getX(w+1),H=o.getX(w+2);s=Ss(this,p,e,n,c,h,d,C,T,H),s&&(s.faceIndex=Math.floor(w/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const g=Math.max(0,u.start),x=Math.min(o.count,u.start+u.count);for(let m=g,p=x;m<p;m+=3){const v=o.getX(m),_=o.getX(m+1),w=o.getX(m+2);s=Ss(this,a,e,n,c,h,d,v,_,w),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,x=f.length;g<x;g++){const m=f[g],p=a[m.materialIndex],v=Math.max(m.start,u.start),_=Math.min(l.count,Math.min(m.start+m.count,u.start+u.count));for(let w=v,P=_;w<P;w+=3){const C=w,T=w+1,H=w+2;s=Ss(this,p,e,n,c,h,d,C,T,H),s&&(s.faceIndex=Math.floor(w/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const g=Math.max(0,u.start),x=Math.min(l.count,u.start+u.count);for(let m=g,p=x;m<p;m+=3){const v=m,_=m+1,w=m+2;s=Ss(this,a,e,n,c,h,d,v,_,w),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}}function Fh(i,e,t,n,s,r,a,o){let l;if(e.side===Rt?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,e.side===hn,o),l===null)return null;bs.copy(o),bs.applyMatrix4(i.matrixWorld);const c=t.ray.origin.distanceTo(bs);return c<t.near||c>t.far?null:{distance:c,point:bs.clone(),object:i}}function Ss(i,e,t,n,s,r,a,o,l,c){i.getVertexPosition(o,fi),i.getVertexPosition(l,pi),i.getVertexPosition(c,mi);const h=Fh(i,e,t,n,fi,pi,mi,ys);if(h){s&&(xs.fromBufferAttribute(s,o),_s.fromBufferAttribute(s,l),vs.fromBufferAttribute(s,c),h.uv=$t.getInterpolation(ys,fi,pi,mi,xs,_s,vs,new xe)),r&&(xs.fromBufferAttribute(r,o),_s.fromBufferAttribute(r,l),vs.fromBufferAttribute(r,c),h.uv1=$t.getInterpolation(ys,fi,pi,mi,xs,_s,vs,new xe),h.uv2=h.uv1),a&&(va.fromBufferAttribute(a,o),ya.fromBufferAttribute(a,l),ba.fromBufferAttribute(a,c),h.normal=$t.getInterpolation(ys,fi,pi,mi,va,ya,ba,new L),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const d={a:o,b:l,c,normal:new L,materialIndex:0};$t.getNormal(fi,pi,mi,d.normal),h.face=d}return h}class ki extends yt{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};const o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);const l=[],c=[],h=[],d=[];let f=0,u=0;g("z","y","x",-1,-1,n,t,e,a,r,0),g("z","y","x",1,-1,n,t,-e,a,r,1),g("x","z","y",1,1,e,n,t,s,a,2),g("x","z","y",1,-1,e,n,-t,s,a,3),g("x","y","z",1,-1,e,t,n,s,r,4),g("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new vt(c,3)),this.setAttribute("normal",new vt(h,3)),this.setAttribute("uv",new vt(d,2));function g(x,m,p,v,_,w,P,C,T,H,y){const E=w/T,N=P/H,G=w/2,J=P/2,R=C/2,U=T+1,B=H+1;let $=0,q=0;const K=new L;for(let Q=0;Q<B;Q++){const ee=Q*N-J;for(let ae=0;ae<U;ae++){const X=ae*E-G;K[x]=X*v,K[m]=ee*_,K[p]=R,c.push(K.x,K.y,K.z),K[x]=0,K[m]=0,K[p]=C>0?1:-1,h.push(K.x,K.y,K.z),d.push(ae/T),d.push(1-Q/H),$+=1}}for(let Q=0;Q<H;Q++)for(let ee=0;ee<T;ee++){const ae=f+ee+U*Q,X=f+ee+U*(Q+1),I=f+(ee+1)+U*(Q+1),Z=f+(ee+1)+U*Q;l.push(ae,X,Z),l.push(X,I,Z),q+=6}o.addGroup(u,q,y),u+=q,f+=$}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ki(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function gi(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const s=i[t][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone():Array.isArray(s)?e[t][n]=s.slice():e[t][n]=s}}return e}function Tt(i){const e={};for(let t=0;t<i.length;t++){const n=gi(i[t]);for(const s in n)e[s]=n[s]}return e}function Bh(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Sa(i){return i.getRenderTarget()===null?i.outputColorSpace:Ye.workingColorSpace}const kh={clone:gi,merge:Tt};var zh=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Hh=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Nn extends di{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=zh,this.fragmentShader=Hh,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1,clipCullDistance:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=gi(e.uniforms),this.uniformsGroups=Bh(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class Ea extends ft{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Qe,this.projectionMatrix=new Qe,this.projectionMatrixInverse=new Qe,this.coordinateSystem=Qt}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}class Lt extends Ea{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Di*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Pi*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Di*2*Math.atan(Math.tan(Pi*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Pi*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,t-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}const o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const xi=-90,_i=1;class Gh extends ft{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new Lt(xi,_i,e,t);s.layers=this.layers,this.add(s);const r=new Lt(xi,_i,e,t);r.layers=this.layers,this.add(r);const a=new Lt(xi,_i,e,t);a.layers=this.layers,this.add(a);const o=new Lt(xi,_i,e,t);o.layers=this.layers,this.add(o);const l=new Lt(xi,_i,e,t);l.layers=this.layers,this.add(l);const c=new Lt(xi,_i,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,l]=t;for(const c of t)this.remove(c);if(e===Qt)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Zi)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,l,c,h]=this.children,d=e.getRenderTarget(),f=e.getActiveCubeFace(),u=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const x=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,s),e.render(t,r),e.setRenderTarget(n,1,s),e.render(t,a),e.setRenderTarget(n,2,s),e.render(t,o),e.setRenderTarget(n,3,s),e.render(t,l),e.setRenderTarget(n,4,s),e.render(t,c),n.texture.generateMipmaps=x,e.setRenderTarget(n,5,s),e.render(t,h),e.setRenderTarget(d,f,u),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class Ma extends Dt{constructor(e,t,n,s,r,a,o,l,c,h){e=e!==void 0?e:[],t=t!==void 0?t:Kn,super(e,t,n,s,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Vh extends Rn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];t.encoding!==void 0&&(Ui("THREE.WebGLCubeRenderTarget: option.encoding has been replaced by option.colorSpace."),t.colorSpace=t.encoding===An?gt:zt),this.texture=new Ma(s,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:kt}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new ki(5,5,5),r=new Nn({name:"CubemapFromEquirect",uniforms:gi(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Rt,blending:dn});r.uniforms.tEquirect.value=t;const a=new wt(s,r),o=t.minFilter;return t.minFilter===Ri&&(t.minFilter=kt),new Gh(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t,n,s){const r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}}const Sr=new L,Wh=new L,Xh=new Ge;class on{constructor(e=new L(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const s=Sr.subVectors(n,t).cross(Wh.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(Sr),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||Xh.getNormalMatrix(e),s=this.coplanarPoint(Sr).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const On=new rs,Es=new L;class Er{constructor(e=new on,t=new on,n=new on,s=new on,r=new on,a=new on){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Qt){const n=this.planes,s=e.elements,r=s[0],a=s[1],o=s[2],l=s[3],c=s[4],h=s[5],d=s[6],f=s[7],u=s[8],g=s[9],x=s[10],m=s[11],p=s[12],v=s[13],_=s[14],w=s[15];if(n[0].setComponents(l-r,f-c,m-u,w-p).normalize(),n[1].setComponents(l+r,f+c,m+u,w+p).normalize(),n[2].setComponents(l+a,f+h,m+g,w+v).normalize(),n[3].setComponents(l-a,f-h,m-g,w-v).normalize(),n[4].setComponents(l-o,f-d,m-x,w-_).normalize(),t===Qt)n[5].setComponents(l+o,f+d,m+x,w+_).normalize();else if(t===Zi)n[5].setComponents(o,d,x,_).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),On.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),On.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(On)}intersectsSprite(e){return On.center.set(0,0,0),On.radius=.7071067811865476,On.applyMatrix4(e.matrixWorld),this.intersectsSphere(On)}intersectsSphere(e){const t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const s=t[n];if(Es.x=s.normal.x>0?e.max.x:e.min.x,Es.y=s.normal.y>0?e.max.y:e.min.y,Es.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Es)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function wa(){let i=null,e=!1,t=null,n=null;function s(r,a){t(r,a),n=i.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function jh(i,e){const t=e.isWebGL2,n=new WeakMap;function s(c,h){const d=c.array,f=c.usage,u=d.byteLength,g=i.createBuffer();i.bindBuffer(h,g),i.bufferData(h,d,f),c.onUploadCallback();let x;if(d instanceof Float32Array)x=i.FLOAT;else if(d instanceof Uint16Array)if(c.isFloat16BufferAttribute)if(t)x=i.HALF_FLOAT;else throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");else x=i.UNSIGNED_SHORT;else if(d instanceof Int16Array)x=i.SHORT;else if(d instanceof Uint32Array)x=i.UNSIGNED_INT;else if(d instanceof Int32Array)x=i.INT;else if(d instanceof Int8Array)x=i.BYTE;else if(d instanceof Uint8Array)x=i.UNSIGNED_BYTE;else if(d instanceof Uint8ClampedArray)x=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+d);return{buffer:g,type:x,bytesPerElement:d.BYTES_PER_ELEMENT,version:c.version,size:u}}function r(c,h,d){const f=h.array,u=h._updateRange,g=h.updateRanges;if(i.bindBuffer(d,c),u.count===-1&&g.length===0&&i.bufferSubData(d,0,f),g.length!==0){for(let x=0,m=g.length;x<m;x++){const p=g[x];t?i.bufferSubData(d,p.start*f.BYTES_PER_ELEMENT,f,p.start,p.count):i.bufferSubData(d,p.start*f.BYTES_PER_ELEMENT,f.subarray(p.start,p.start+p.count))}h.clearUpdateRanges()}u.count!==-1&&(t?i.bufferSubData(d,u.offset*f.BYTES_PER_ELEMENT,f,u.offset,u.count):i.bufferSubData(d,u.offset*f.BYTES_PER_ELEMENT,f.subarray(u.offset,u.offset+u.count)),u.count=-1),h.onUploadCallback()}function a(c){return c.isInterleavedBufferAttribute&&(c=c.data),n.get(c)}function o(c){c.isInterleavedBufferAttribute&&(c=c.data);const h=n.get(c);h&&(i.deleteBuffer(h.buffer),n.delete(c))}function l(c,h){if(c.isGLBufferAttribute){const f=n.get(c);(!f||f.version<c.version)&&n.set(c,{buffer:c.buffer,type:c.type,bytesPerElement:c.elementSize,version:c.version});return}c.isInterleavedBufferAttribute&&(c=c.data);const d=n.get(c);if(d===void 0)n.set(c,s(c,h));else if(d.version<c.version){if(d.size!==c.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");r(d.buffer,c,h),d.version=c.version}}return{get:a,remove:o,update:l}}class Mr extends yt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};const r=e/2,a=t/2,o=Math.floor(n),l=Math.floor(s),c=o+1,h=l+1,d=e/o,f=t/l,u=[],g=[],x=[],m=[];for(let p=0;p<h;p++){const v=p*f-a;for(let _=0;_<c;_++){const w=_*d-r;g.push(w,-v,0),x.push(0,0,1),m.push(_/o),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let v=0;v<o;v++){const _=v+c*p,w=v+c*(p+1),P=v+1+c*(p+1),C=v+1+c*p;u.push(_,w,C),u.push(w,P,C)}this.setIndex(u),this.setAttribute("position",new vt(g,3)),this.setAttribute("normal",new vt(x,3)),this.setAttribute("uv",new vt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Mr(e.width,e.height,e.widthSegments,e.heightSegments)}}var qh=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,$h=`#ifdef USE_ALPHAHASH
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
#endif`,Yh=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Kh=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Jh=`#ifdef USE_ALPHATEST
	if ( diffuseColor.a < alphaTest ) discard;
#endif`,Zh=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Qh=`#ifdef USE_AOMAP
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
#endif`,ed=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,td=`#ifdef USE_BATCHING
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
#endif`,nd=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( batchId );
#endif`,id=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,sd=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,rd=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,od=`#ifdef USE_IRIDESCENCE
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
#endif`,ad=`#ifdef USE_BUMPMAP
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
#endif`,ld=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,cd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,hd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,dd=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,ud=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,fd=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,pd=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,md=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,gd=`#define PI 3.141592653589793
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
} // validated`,xd=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,_d=`vec3 transformedNormal = objectNormal;
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
#endif`,vd=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,yd=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,bd=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Sd=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Ed="gl_FragColor = linearToOutputTexel( gl_FragColor );",Md=`
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
}`,wd=`#ifdef USE_ENVMAP
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
#endif`,Td=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif

#endif`,Ad=`#ifdef USE_ENVMAP
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
#endif`,Cd=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS

		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Rd=`#ifdef USE_ENVMAP
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
#endif`,Ld=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Pd=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Dd=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Id=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Ud=`#ifdef USE_GRADIENTMAP
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
}`,Nd=`#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,Od=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Fd=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Bd=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,kd=`uniform bool receiveShadow;
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
#endif`,zd=`#ifdef USE_ENVMAP
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
#endif`,Hd=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Gd=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Vd=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Wd=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Xd=`PhysicalMaterial material;
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
#endif`,jd=`struct PhysicalMaterial {
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
}`,qd=`
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
#endif`,$d=`#if defined( RE_IndirectDiffuse )
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
#endif`,Yd=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Kd=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Jd=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Zd=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,Qd=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,eu=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );

	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,tu=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,nu=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,iu=`#if defined( USE_POINTS_UV )
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
#endif`,su=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,ru=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,ou=`#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,au=`#ifdef USE_MORPHNORMALS
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
#endif`,lu=`#ifdef USE_MORPHTARGETS
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
#endif`,cu=`#ifdef USE_MORPHTARGETS
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
#endif`,hu=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,du=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,uu=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,fu=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,pu=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,mu=`#ifdef USE_NORMALMAP
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
#endif`,gu=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,xu=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,_u=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,vu=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,yu=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,bu=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Su=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Eu=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Mu=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,wu=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Tu=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Au=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Cu=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Ru=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Lu=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Pu=`float getShadowMask() {
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
}`,Du=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Iu=`#ifdef USE_SKINNING
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
#endif`,Uu=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Nu=`#ifdef USE_SKINNING
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
#endif`,Ou=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Fu=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Bu=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,ku=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,zu=`#ifdef USE_TRANSMISSION
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
#endif`,Hu=`#ifdef USE_TRANSMISSION
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
#endif`,Gu=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Vu=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Wu=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Xu=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Be={alphahash_fragment:qh,alphahash_pars_fragment:$h,alphamap_fragment:Yh,alphamap_pars_fragment:Kh,alphatest_fragment:Jh,alphatest_pars_fragment:Zh,aomap_fragment:Qh,aomap_pars_fragment:ed,batching_pars_vertex:td,batching_vertex:nd,begin_vertex:id,beginnormal_vertex:sd,bsdfs:rd,iridescence_fragment:od,bumpmap_pars_fragment:ad,clipping_planes_fragment:ld,clipping_planes_pars_fragment:cd,clipping_planes_pars_vertex:hd,clipping_planes_vertex:dd,color_fragment:ud,color_pars_fragment:fd,color_pars_vertex:pd,color_vertex:md,common:gd,cube_uv_reflection_fragment:xd,defaultnormal_vertex:_d,displacementmap_pars_vertex:vd,displacementmap_vertex:yd,emissivemap_fragment:bd,emissivemap_pars_fragment:Sd,colorspace_fragment:Ed,colorspace_pars_fragment:Md,envmap_fragment:wd,envmap_common_pars_fragment:Td,envmap_pars_fragment:Ad,envmap_pars_vertex:Cd,envmap_physical_pars_fragment:zd,envmap_vertex:Rd,fog_vertex:Ld,fog_pars_vertex:Pd,fog_fragment:Dd,fog_pars_fragment:Id,gradientmap_pars_fragment:Ud,lightmap_fragment:Nd,lightmap_pars_fragment:Od,lights_lambert_fragment:Fd,lights_lambert_pars_fragment:Bd,lights_pars_begin:kd,lights_toon_fragment:Hd,lights_toon_pars_fragment:Gd,lights_phong_fragment:Vd,lights_phong_pars_fragment:Wd,lights_physical_fragment:Xd,lights_physical_pars_fragment:jd,lights_fragment_begin:qd,lights_fragment_maps:$d,lights_fragment_end:Yd,logdepthbuf_fragment:Kd,logdepthbuf_pars_fragment:Jd,logdepthbuf_pars_vertex:Zd,logdepthbuf_vertex:Qd,map_fragment:eu,map_pars_fragment:tu,map_particle_fragment:nu,map_particle_pars_fragment:iu,metalnessmap_fragment:su,metalnessmap_pars_fragment:ru,morphcolor_vertex:ou,morphnormal_vertex:au,morphtarget_pars_vertex:lu,morphtarget_vertex:cu,normal_fragment_begin:hu,normal_fragment_maps:du,normal_pars_fragment:uu,normal_pars_vertex:fu,normal_vertex:pu,normalmap_pars_fragment:mu,clearcoat_normal_fragment_begin:gu,clearcoat_normal_fragment_maps:xu,clearcoat_pars_fragment:_u,iridescence_pars_fragment:vu,opaque_fragment:yu,packing:bu,premultiplied_alpha_fragment:Su,project_vertex:Eu,dithering_fragment:Mu,dithering_pars_fragment:wu,roughnessmap_fragment:Tu,roughnessmap_pars_fragment:Au,shadowmap_pars_fragment:Cu,shadowmap_pars_vertex:Ru,shadowmap_vertex:Lu,shadowmask_pars_fragment:Pu,skinbase_vertex:Du,skinning_pars_vertex:Iu,skinning_vertex:Uu,skinnormal_vertex:Nu,specularmap_fragment:Ou,specularmap_pars_fragment:Fu,tonemapping_fragment:Bu,tonemapping_pars_fragment:ku,transmission_fragment:zu,transmission_pars_fragment:Hu,uv_pars_fragment:Gu,uv_pars_vertex:Vu,uv_vertex:Wu,worldpos_vertex:Xu,background_vert:`varying vec2 vUv;
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
}`},oe={common:{diffuse:{value:new Ue(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ge},alphaMap:{value:null},alphaMapTransform:{value:new Ge},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ge}},envmap:{envMap:{value:null},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ge}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ge}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ge},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ge},normalScale:{value:new xe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ge},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ge}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ge}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ge}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ue(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ue(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ge},alphaTest:{value:0},uvTransform:{value:new Ge}},sprite:{diffuse:{value:new Ue(16777215)},opacity:{value:1},center:{value:new xe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ge},alphaMap:{value:null},alphaMapTransform:{value:new Ge},alphaTest:{value:0}}},Yt={basic:{uniforms:Tt([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.fog]),vertexShader:Be.meshbasic_vert,fragmentShader:Be.meshbasic_frag},lambert:{uniforms:Tt([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,oe.lights,{emissive:{value:new Ue(0)}}]),vertexShader:Be.meshlambert_vert,fragmentShader:Be.meshlambert_frag},phong:{uniforms:Tt([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,oe.lights,{emissive:{value:new Ue(0)},specular:{value:new Ue(1118481)},shininess:{value:30}}]),vertexShader:Be.meshphong_vert,fragmentShader:Be.meshphong_frag},standard:{uniforms:Tt([oe.common,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.roughnessmap,oe.metalnessmap,oe.fog,oe.lights,{emissive:{value:new Ue(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Be.meshphysical_vert,fragmentShader:Be.meshphysical_frag},toon:{uniforms:Tt([oe.common,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.gradientmap,oe.fog,oe.lights,{emissive:{value:new Ue(0)}}]),vertexShader:Be.meshtoon_vert,fragmentShader:Be.meshtoon_frag},matcap:{uniforms:Tt([oe.common,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,{matcap:{value:null}}]),vertexShader:Be.meshmatcap_vert,fragmentShader:Be.meshmatcap_frag},points:{uniforms:Tt([oe.points,oe.fog]),vertexShader:Be.points_vert,fragmentShader:Be.points_frag},dashed:{uniforms:Tt([oe.common,oe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Be.linedashed_vert,fragmentShader:Be.linedashed_frag},depth:{uniforms:Tt([oe.common,oe.displacementmap]),vertexShader:Be.depth_vert,fragmentShader:Be.depth_frag},normal:{uniforms:Tt([oe.common,oe.bumpmap,oe.normalmap,oe.displacementmap,{opacity:{value:1}}]),vertexShader:Be.meshnormal_vert,fragmentShader:Be.meshnormal_frag},sprite:{uniforms:Tt([oe.sprite,oe.fog]),vertexShader:Be.sprite_vert,fragmentShader:Be.sprite_frag},background:{uniforms:{uvTransform:{value:new Ge},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Be.background_vert,fragmentShader:Be.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1}},vertexShader:Be.backgroundCube_vert,fragmentShader:Be.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Be.cube_vert,fragmentShader:Be.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Be.equirect_vert,fragmentShader:Be.equirect_frag},distanceRGBA:{uniforms:Tt([oe.common,oe.displacementmap,{referencePosition:{value:new L},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Be.distanceRGBA_vert,fragmentShader:Be.distanceRGBA_frag},shadow:{uniforms:Tt([oe.lights,oe.fog,{color:{value:new Ue(0)},opacity:{value:1}}]),vertexShader:Be.shadow_vert,fragmentShader:Be.shadow_frag}};Yt.physical={uniforms:Tt([Yt.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ge},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ge},clearcoatNormalScale:{value:new xe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ge},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ge},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ge},sheen:{value:0},sheenColor:{value:new Ue(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ge},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ge},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ge},transmissionSamplerSize:{value:new xe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ge},attenuationDistance:{value:0},attenuationColor:{value:new Ue(0)},specularColor:{value:new Ue(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ge},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ge},anisotropyVector:{value:new xe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ge}}]),vertexShader:Be.meshphysical_vert,fragmentShader:Be.meshphysical_frag};const Ms={r:0,b:0,g:0};function ju(i,e,t,n,s,r,a){const o=new Ue(0);let l=r===!0?0:1,c,h,d=null,f=0,u=null;function g(m,p){let v=!1,_=p.isScene===!0?p.background:null;_&&_.isTexture&&(_=(p.backgroundBlurriness>0?t:e).get(_)),_===null?x(o,l):_&&_.isColor&&(x(_,1),v=!0);const w=i.xr.getEnvironmentBlendMode();w==="additive"?n.buffers.color.setClear(0,0,0,1,a):w==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(i.autoClear||v)&&i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil),_&&(_.isCubeTexture||_.mapping===qi)?(h===void 0&&(h=new wt(new ki(1,1,1),new Nn({name:"BackgroundCubeMaterial",uniforms:gi(Yt.backgroundCube.uniforms),vertexShader:Yt.backgroundCube.vertexShader,fragmentShader:Yt.backgroundCube.fragmentShader,side:Rt,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(P,C,T){this.matrixWorld.copyPosition(T.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),h.material.uniforms.envMap.value=_,h.material.uniforms.flipEnvMap.value=_.isCubeTexture&&_.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=p.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=p.backgroundIntensity,h.material.toneMapped=Ye.getTransfer(_.colorSpace)!==Ze,(d!==_||f!==_.version||u!==i.toneMapping)&&(h.material.needsUpdate=!0,d=_,f=_.version,u=i.toneMapping),h.layers.enableAll(),m.unshift(h,h.geometry,h.material,0,0,null)):_&&_.isTexture&&(c===void 0&&(c=new wt(new Mr(2,2),new Nn({name:"BackgroundMaterial",uniforms:gi(Yt.background.uniforms),vertexShader:Yt.background.vertexShader,fragmentShader:Yt.background.fragmentShader,side:hn,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=_,c.material.uniforms.backgroundIntensity.value=p.backgroundIntensity,c.material.toneMapped=Ye.getTransfer(_.colorSpace)!==Ze,_.matrixAutoUpdate===!0&&_.updateMatrix(),c.material.uniforms.uvTransform.value.copy(_.matrix),(d!==_||f!==_.version||u!==i.toneMapping)&&(c.material.needsUpdate=!0,d=_,f=_.version,u=i.toneMapping),c.layers.enableAll(),m.unshift(c,c.geometry,c.material,0,0,null))}function x(m,p){m.getRGB(Ms,Sa(i)),n.buffers.color.setClear(Ms.r,Ms.g,Ms.b,p,a)}return{getClearColor:function(){return o},setClearColor:function(m,p=1){o.set(m),l=p,x(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(m){l=m,x(o,l)},render:g}}function qu(i,e,t,n){const s=i.getParameter(i.MAX_VERTEX_ATTRIBS),r=n.isWebGL2?null:e.get("OES_vertex_array_object"),a=n.isWebGL2||r!==null,o={},l=m(null);let c=l,h=!1;function d(R,U,B,$,q){let K=!1;if(a){const Q=x($,B,U);c!==Q&&(c=Q,u(c.object)),K=p(R,$,B,q),K&&v(R,$,B,q)}else{const Q=U.wireframe===!0;(c.geometry!==$.id||c.program!==B.id||c.wireframe!==Q)&&(c.geometry=$.id,c.program=B.id,c.wireframe=Q,K=!0)}q!==null&&t.update(q,i.ELEMENT_ARRAY_BUFFER),(K||h)&&(h=!1,H(R,U,B,$),q!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(q).buffer))}function f(){return n.isWebGL2?i.createVertexArray():r.createVertexArrayOES()}function u(R){return n.isWebGL2?i.bindVertexArray(R):r.bindVertexArrayOES(R)}function g(R){return n.isWebGL2?i.deleteVertexArray(R):r.deleteVertexArrayOES(R)}function x(R,U,B){const $=B.wireframe===!0;let q=o[R.id];q===void 0&&(q={},o[R.id]=q);let K=q[U.id];K===void 0&&(K={},q[U.id]=K);let Q=K[$];return Q===void 0&&(Q=m(f()),K[$]=Q),Q}function m(R){const U=[],B=[],$=[];for(let q=0;q<s;q++)U[q]=0,B[q]=0,$[q]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:U,enabledAttributes:B,attributeDivisors:$,object:R,attributes:{},index:null}}function p(R,U,B,$){const q=c.attributes,K=U.attributes;let Q=0;const ee=B.getAttributes();for(const ae in ee)if(ee[ae].location>=0){const I=q[ae];let Z=K[ae];if(Z===void 0&&(ae==="instanceMatrix"&&R.instanceMatrix&&(Z=R.instanceMatrix),ae==="instanceColor"&&R.instanceColor&&(Z=R.instanceColor)),I===void 0||I.attribute!==Z||Z&&I.data!==Z.data)return!0;Q++}return c.attributesNum!==Q||c.index!==$}function v(R,U,B,$){const q={},K=U.attributes;let Q=0;const ee=B.getAttributes();for(const ae in ee)if(ee[ae].location>=0){let I=K[ae];I===void 0&&(ae==="instanceMatrix"&&R.instanceMatrix&&(I=R.instanceMatrix),ae==="instanceColor"&&R.instanceColor&&(I=R.instanceColor));const Z={};Z.attribute=I,I&&I.data&&(Z.data=I.data),q[ae]=Z,Q++}c.attributes=q,c.attributesNum=Q,c.index=$}function _(){const R=c.newAttributes;for(let U=0,B=R.length;U<B;U++)R[U]=0}function w(R){P(R,0)}function P(R,U){const B=c.newAttributes,$=c.enabledAttributes,q=c.attributeDivisors;B[R]=1,$[R]===0&&(i.enableVertexAttribArray(R),$[R]=1),q[R]!==U&&((n.isWebGL2?i:e.get("ANGLE_instanced_arrays"))[n.isWebGL2?"vertexAttribDivisor":"vertexAttribDivisorANGLE"](R,U),q[R]=U)}function C(){const R=c.newAttributes,U=c.enabledAttributes;for(let B=0,$=U.length;B<$;B++)U[B]!==R[B]&&(i.disableVertexAttribArray(B),U[B]=0)}function T(R,U,B,$,q,K,Q){Q===!0?i.vertexAttribIPointer(R,U,B,q,K):i.vertexAttribPointer(R,U,B,$,q,K)}function H(R,U,B,$){if(n.isWebGL2===!1&&(R.isInstancedMesh||$.isInstancedBufferGeometry)&&e.get("ANGLE_instanced_arrays")===null)return;_();const q=$.attributes,K=B.getAttributes(),Q=U.defaultAttributeValues;for(const ee in K){const ae=K[ee];if(ae.location>=0){let X=q[ee];if(X===void 0&&(ee==="instanceMatrix"&&R.instanceMatrix&&(X=R.instanceMatrix),ee==="instanceColor"&&R.instanceColor&&(X=R.instanceColor)),X!==void 0){const I=X.normalized,Z=X.itemSize,he=t.get(X);if(he===void 0)continue;const de=he.buffer,we=he.type,Te=he.bytesPerElement,ve=n.isWebGL2===!0&&(we===i.INT||we===i.UNSIGNED_INT||X.gpuType===fo);if(X.isInterleavedBufferAttribute){const ke=X.data,z=ke.stride,at=X.offset;if(ke.isInstancedInterleavedBuffer){for(let be=0;be<ae.locationSize;be++)P(ae.location+be,ke.meshPerAttribute);R.isInstancedMesh!==!0&&$._maxInstanceCount===void 0&&($._maxInstanceCount=ke.meshPerAttribute*ke.count)}else for(let be=0;be<ae.locationSize;be++)w(ae.location+be);i.bindBuffer(i.ARRAY_BUFFER,de);for(let be=0;be<ae.locationSize;be++)T(ae.location+be,Z/ae.locationSize,we,I,z*Te,(at+Z/ae.locationSize*be)*Te,ve)}else{if(X.isInstancedBufferAttribute){for(let ke=0;ke<ae.locationSize;ke++)P(ae.location+ke,X.meshPerAttribute);R.isInstancedMesh!==!0&&$._maxInstanceCount===void 0&&($._maxInstanceCount=X.meshPerAttribute*X.count)}else for(let ke=0;ke<ae.locationSize;ke++)w(ae.location+ke);i.bindBuffer(i.ARRAY_BUFFER,de);for(let ke=0;ke<ae.locationSize;ke++)T(ae.location+ke,Z/ae.locationSize,we,I,Z*Te,Z/ae.locationSize*ke*Te,ve)}}else if(Q!==void 0){const I=Q[ee];if(I!==void 0)switch(I.length){case 2:i.vertexAttrib2fv(ae.location,I);break;case 3:i.vertexAttrib3fv(ae.location,I);break;case 4:i.vertexAttrib4fv(ae.location,I);break;default:i.vertexAttrib1fv(ae.location,I)}}}}C()}function y(){G();for(const R in o){const U=o[R];for(const B in U){const $=U[B];for(const q in $)g($[q].object),delete $[q];delete U[B]}delete o[R]}}function E(R){if(o[R.id]===void 0)return;const U=o[R.id];for(const B in U){const $=U[B];for(const q in $)g($[q].object),delete $[q];delete U[B]}delete o[R.id]}function N(R){for(const U in o){const B=o[U];if(B[R.id]===void 0)continue;const $=B[R.id];for(const q in $)g($[q].object),delete $[q];delete B[R.id]}}function G(){J(),h=!0,c!==l&&(c=l,u(c.object))}function J(){l.geometry=null,l.program=null,l.wireframe=!1}return{setup:d,reset:G,resetDefaultState:J,dispose:y,releaseStatesOfGeometry:E,releaseStatesOfProgram:N,initAttributes:_,enableAttribute:w,disableUnusedAttributes:C}}function $u(i,e,t,n){const s=n.isWebGL2;let r;function a(h){r=h}function o(h,d){i.drawArrays(r,h,d),t.update(d,r,1)}function l(h,d,f){if(f===0)return;let u,g;if(s)u=i,g="drawArraysInstanced";else if(u=e.get("ANGLE_instanced_arrays"),g="drawArraysInstancedANGLE",u===null){console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}u[g](r,h,d,f),t.update(d,r,f)}function c(h,d,f){if(f===0)return;const u=e.get("WEBGL_multi_draw");if(u===null)for(let g=0;g<f;g++)this.render(h[g],d[g]);else{u.multiDrawArraysWEBGL(r,h,0,d,0,f);let g=0;for(let x=0;x<f;x++)g+=d[x];t.update(g,r,1)}}this.setMode=a,this.render=o,this.renderInstances=l,this.renderMultiDraw=c}function Yu(i,e,t){let n;function s(){if(n!==void 0)return n;if(e.has("EXT_texture_filter_anisotropic")===!0){const T=e.get("EXT_texture_filter_anisotropic");n=i.getParameter(T.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function r(T){if(T==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";T="mediump"}return T==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}const a=typeof WebGL2RenderingContext<"u"&&i.constructor.name==="WebGL2RenderingContext";let o=t.precision!==void 0?t.precision:"highp";const l=r(o);l!==o&&(console.warn("THREE.WebGLRenderer:",o,"not supported, using",l,"instead."),o=l);const c=a||e.has("WEBGL_draw_buffers"),h=t.logarithmicDepthBuffer===!0,d=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),f=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),u=i.getParameter(i.MAX_TEXTURE_SIZE),g=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),x=i.getParameter(i.MAX_VERTEX_ATTRIBS),m=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),p=i.getParameter(i.MAX_VARYING_VECTORS),v=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),_=f>0,w=a||e.has("OES_texture_float"),P=_&&w,C=a?i.getParameter(i.MAX_SAMPLES):0;return{isWebGL2:a,drawBuffers:c,getMaxAnisotropy:s,getMaxPrecision:r,precision:o,logarithmicDepthBuffer:h,maxTextures:d,maxVertexTextures:f,maxTextureSize:u,maxCubemapSize:g,maxAttributes:x,maxVertexUniforms:m,maxVaryings:p,maxFragmentUniforms:v,vertexTextures:_,floatFragmentTextures:w,floatVertexTextures:P,maxSamples:C}}function Ku(i){const e=this;let t=null,n=0,s=!1,r=!1;const a=new on,o=new Ge,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,f){const u=d.length!==0||f||n!==0||s;return s=f,n=d.length,u},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,f){t=h(d,f,0)},this.setState=function(d,f,u){const g=d.clippingPlanes,x=d.clipIntersection,m=d.clipShadows,p=i.get(d);if(!s||g===null||g.length===0||r&&!m)r?h(null):c();else{const v=r?0:n,_=v*4;let w=p.clippingState||null;l.value=w,w=h(g,f,_,u);for(let P=0;P!==_;++P)w[P]=t[P];p.clippingState=w,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=v}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(d,f,u,g){const x=d!==null?d.length:0;let m=null;if(x!==0){if(m=l.value,g!==!0||m===null){const p=u+x*4,v=f.matrixWorldInverse;o.getNormalMatrix(v),(m===null||m.length<p)&&(m=new Float32Array(p));for(let _=0,w=u;_!==x;++_,w+=4)a.copy(d[_]).applyMatrix4(v,o),a.normal.toArray(m,w),m[w+3]=a.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,m}}function Ju(i){let e=new WeakMap;function t(a,o){return o===Vs?a.mapping=Kn:o===Ws&&(a.mapping=Jn),a}function n(a){if(a&&a.isTexture){const o=a.mapping;if(o===Vs||o===Ws)if(e.has(a)){const l=e.get(a).texture;return t(l,a.mapping)}else{const l=a.image;if(l&&l.height>0){const c=new Vh(l.height/2);return c.fromEquirectangularTexture(i,a),e.set(a,c),a.addEventListener("dispose",s),t(c.texture,a.mapping)}else return null}}return a}function s(a){const o=a.target;o.removeEventListener("dispose",s);const l=e.get(o);l!==void 0&&(e.delete(o),l.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}class ws extends Ea{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-e,a=n+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const vi=4,Ta=[.125,.215,.35,.446,.526,.582],Fn=20,wr=new ws,Aa=new Ue;let Tr=null,Ar=0,Cr=0;const Bn=(1+Math.sqrt(5))/2,yi=1/Bn,Ca=[new L(1,1,1),new L(-1,1,1),new L(1,1,-1),new L(-1,1,-1),new L(0,Bn,yi),new L(0,Bn,-yi),new L(yi,0,Bn),new L(-yi,0,Bn),new L(Bn,yi,0),new L(-Bn,yi,0)];class Ra{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,s=100){Tr=this._renderer.getRenderTarget(),Ar=this._renderer.getActiveCubeFace(),Cr=this._renderer.getActiveMipmapLevel(),this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(e,n,s,r),t>0&&this._blur(r,0,0,t),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Da(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Pa(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Tr,Ar,Cr),e.scissorTest=!1,Ts(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Kn||e.mapping===Jn?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Tr=this._renderer.getRenderTarget(),Ar=this._renderer.getActiveCubeFace(),Cr=this._renderer.getActiveMipmapLevel();const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:kt,minFilter:kt,generateMipmaps:!1,type:Li,format:Wt,colorSpace:Zt,depthBuffer:!1},s=La(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=La(e,t,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Zu(r)),this._blurMaterial=Qu(r,e,t)}return s}_compileMaterial(e){const t=new wt(this._lodPlanes[0],e);this._renderer.compile(t,wr)}_sceneToCubeUV(e,t,n,s){const o=new Lt(90,1,t,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,d=h.autoClear,f=h.toneMapping;h.getClearColor(Aa),h.toneMapping=un,h.autoClear=!1;const u=new pa({name:"PMREM.Background",side:Rt,depthWrite:!1,depthTest:!1}),g=new wt(new ki,u);let x=!1;const m=e.background;m?m.isColor&&(u.color.copy(m),e.background=null,x=!0):(u.color.copy(Aa),x=!0);for(let p=0;p<6;p++){const v=p%3;v===0?(o.up.set(0,l[p],0),o.lookAt(c[p],0,0)):v===1?(o.up.set(0,0,l[p]),o.lookAt(0,c[p],0)):(o.up.set(0,l[p],0),o.lookAt(0,0,c[p]));const _=this._cubeSize;Ts(s,v*_,p>2?_:0,_,_),h.setRenderTarget(s),x&&h.render(g,o),h.render(e,o)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=f,h.autoClear=d,e.background=m}_textureToCubeUV(e,t){const n=this._renderer,s=e.mapping===Kn||e.mapping===Jn;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Da()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Pa());const r=s?this._cubemapMaterial:this._equirectMaterial,a=new wt(this._lodPlanes[0],r),o=r.uniforms;o.envMap.value=e;const l=this._cubeSize;Ts(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(a,wr)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;for(let s=1;s<this._lodPlanes.length;s++){const r=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),a=Ca[(s-1)%Ca.length];this._blur(e,s-1,s,r,a)}t.autoClear=n}_blur(e,t,n,s,r){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,s,"latitudinal",r),this._halfBlur(a,e,n,n,s,"longitudinal",r)}_halfBlur(e,t,n,s,r,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,d=new wt(this._lodPlanes[s],c),f=c.uniforms,u=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*u):2*Math.PI/(2*Fn-1),x=r/g,m=isFinite(r)?1+Math.floor(h*x):Fn;m>Fn&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Fn}`);const p=[];let v=0;for(let T=0;T<Fn;++T){const H=T/x,y=Math.exp(-H*H/2);p.push(y),T===0?v+=y:T<m&&(v+=2*y)}for(let T=0;T<p.length;T++)p[T]=p[T]/v;f.envMap.value=e.texture,f.samples.value=m,f.weights.value=p,f.latitudinal.value=a==="latitudinal",o&&(f.poleAxis.value=o);const{_lodMax:_}=this;f.dTheta.value=g,f.mipInt.value=_-n;const w=this._sizeLods[s],P=3*w*(s>_-vi?s-_+vi:0),C=4*(this._cubeSize-w);Ts(t,P,C,3*w,2*w),l.setRenderTarget(t),l.render(d,wr)}}function Zu(i){const e=[],t=[],n=[];let s=i;const r=i-vi+1+Ta.length;for(let a=0;a<r;a++){const o=Math.pow(2,s);t.push(o);let l=1/o;a>i-vi?l=Ta[a-i+vi-1]:a===0&&(l=0),n.push(l);const c=1/(o-2),h=-c,d=1+c,f=[h,h,d,h,d,d,h,h,d,d,h,d],u=6,g=6,x=3,m=2,p=1,v=new Float32Array(x*g*u),_=new Float32Array(m*g*u),w=new Float32Array(p*g*u);for(let C=0;C<u;C++){const T=C%3*2/3-1,H=C>2?0:-1,y=[T,H,0,T+2/3,H,0,T+2/3,H+1,0,T,H,0,T+2/3,H+1,0,T,H+1,0];v.set(y,x*g*C),_.set(f,m*g*C);const E=[C,C,C,C,C,C];w.set(E,p*g*C)}const P=new yt;P.setAttribute("position",new Je(v,x)),P.setAttribute("uv",new Je(_,m)),P.setAttribute("faceIndex",new Je(w,p)),e.push(P),s>vi&&s--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function La(i,e,t){const n=new Rn(i,e,t);return n.texture.mapping=qi,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Ts(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function Qu(i,e,t){const n=new Float32Array(Fn),s=new L(0,1,0);return new Nn({name:"SphericalGaussianBlur",defines:{n:Fn,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Rr(),fragmentShader:`

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
		`,blending:dn,depthTest:!1,depthWrite:!1})}function Pa(){return new Nn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Rr(),fragmentShader:`

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
		`,blending:dn,depthTest:!1,depthWrite:!1})}function Da(){return new Nn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Rr(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:dn,depthTest:!1,depthWrite:!1})}function Rr(){return`

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
	`}function ef(i){let e=new WeakMap,t=null;function n(o){if(o&&o.isTexture){const l=o.mapping,c=l===Vs||l===Ws,h=l===Kn||l===Jn;if(c||h)if(o.isRenderTargetTexture&&o.needsPMREMUpdate===!0){o.needsPMREMUpdate=!1;let d=e.get(o);return t===null&&(t=new Ra(i)),d=c?t.fromEquirectangular(o,d):t.fromCubemap(o,d),e.set(o,d),d.texture}else{if(e.has(o))return e.get(o).texture;{const d=o.image;if(c&&d&&d.height>0||h&&d&&s(d)){t===null&&(t=new Ra(i));const f=c?t.fromEquirectangular(o):t.fromCubemap(o);return e.set(o,f),o.addEventListener("dispose",r),f.texture}else return null}}}return o}function s(o){let l=0;const c=6;for(let h=0;h<c;h++)o[h]!==void 0&&l++;return l===c}function r(o){const l=o.target;l.removeEventListener("dispose",r);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function a(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:a}}function tf(i){const e={};function t(n){if(e[n]!==void 0)return e[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(n){n.isWebGL2?(t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance")):(t("WEBGL_depth_texture"),t("OES_texture_float"),t("OES_texture_half_float"),t("OES_texture_half_float_linear"),t("OES_standard_derivatives"),t("OES_element_index_uint"),t("OES_vertex_array_object"),t("ANGLE_instanced_arrays")),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture")},get:function(n){const s=t(n);return s===null&&console.warn("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function nf(i,e,t,n){const s={},r=new WeakMap;function a(d){const f=d.target;f.index!==null&&e.remove(f.index);for(const g in f.attributes)e.remove(f.attributes[g]);for(const g in f.morphAttributes){const x=f.morphAttributes[g];for(let m=0,p=x.length;m<p;m++)e.remove(x[m])}f.removeEventListener("dispose",a),delete s[f.id];const u=r.get(f);u&&(e.remove(u),r.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function o(d,f){return s[f.id]===!0||(f.addEventListener("dispose",a),s[f.id]=!0,t.memory.geometries++),f}function l(d){const f=d.attributes;for(const g in f)e.update(f[g],i.ARRAY_BUFFER);const u=d.morphAttributes;for(const g in u){const x=u[g];for(let m=0,p=x.length;m<p;m++)e.update(x[m],i.ARRAY_BUFFER)}}function c(d){const f=[],u=d.index,g=d.attributes.position;let x=0;if(u!==null){const v=u.array;x=u.version;for(let _=0,w=v.length;_<w;_+=3){const P=v[_+0],C=v[_+1],T=v[_+2];f.push(P,C,C,T,T,P)}}else if(g!==void 0){const v=g.array;x=g.version;for(let _=0,w=v.length/3-1;_<w;_+=3){const P=_+0,C=_+1,T=_+2;f.push(P,C,C,T,T,P)}}else return;const m=new(Zo(f)?ga:ma)(f,1);m.version=x;const p=r.get(d);p&&e.remove(p),r.set(d,m)}function h(d){const f=r.get(d);if(f){const u=d.index;u!==null&&f.version<u.version&&c(d)}else c(d);return r.get(d)}return{get:o,update:l,getWireframeAttribute:h}}function sf(i,e,t,n){const s=n.isWebGL2;let r;function a(u){r=u}let o,l;function c(u){o=u.type,l=u.bytesPerElement}function h(u,g){i.drawElements(r,g,o,u*l),t.update(g,r,1)}function d(u,g,x){if(x===0)return;let m,p;if(s)m=i,p="drawElementsInstanced";else if(m=e.get("ANGLE_instanced_arrays"),p="drawElementsInstancedANGLE",m===null){console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}m[p](r,g,o,u*l,x),t.update(g,r,x)}function f(u,g,x){if(x===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<x;p++)this.render(u[p]/l,g[p]);else{m.multiDrawElementsWEBGL(r,g,0,o,u,0,x);let p=0;for(let v=0;v<x;v++)p+=g[v];t.update(p,r,1)}}this.setMode=a,this.setIndex=c,this.render=h,this.renderInstances=d,this.renderMultiDraw=f}function rf(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function of(i,e){return i[0]-e[0]}function af(i,e){return Math.abs(e[1])-Math.abs(i[1])}function lf(i,e,t){const n={},s=new Float32Array(8),r=new WeakMap,a=new ut,o=[];for(let c=0;c<8;c++)o[c]=[c,0];function l(c,h,d){const f=c.morphTargetInfluences;if(e.isWebGL2===!0){const u=h.morphAttributes.position||h.morphAttributes.normal||h.morphAttributes.color,g=u!==void 0?u.length:0;let x=r.get(h);if(x===void 0||x.count!==g){let R=function(){G.dispose(),r.delete(h),h.removeEventListener("dispose",R)};x!==void 0&&x.texture.dispose();const v=h.morphAttributes.position!==void 0,_=h.morphAttributes.normal!==void 0,w=h.morphAttributes.color!==void 0,P=h.morphAttributes.position||[],C=h.morphAttributes.normal||[],T=h.morphAttributes.color||[];let H=0;v===!0&&(H=1),_===!0&&(H=2),w===!0&&(H=3);let y=h.attributes.position.count*H,E=1;y>e.maxTextureSize&&(E=Math.ceil(y/e.maxTextureSize),y=e.maxTextureSize);const N=new Float32Array(y*E*4*g),G=new sa(N,y,E,g);G.type=mn,G.needsUpdate=!0;const J=H*4;for(let U=0;U<g;U++){const B=P[U],$=C[U],q=T[U],K=y*E*4*U;for(let Q=0;Q<B.count;Q++){const ee=Q*J;v===!0&&(a.fromBufferAttribute(B,Q),N[K+ee+0]=a.x,N[K+ee+1]=a.y,N[K+ee+2]=a.z,N[K+ee+3]=0),_===!0&&(a.fromBufferAttribute($,Q),N[K+ee+4]=a.x,N[K+ee+5]=a.y,N[K+ee+6]=a.z,N[K+ee+7]=0),w===!0&&(a.fromBufferAttribute(q,Q),N[K+ee+8]=a.x,N[K+ee+9]=a.y,N[K+ee+10]=a.z,N[K+ee+11]=q.itemSize===4?a.w:1)}}x={count:g,texture:G,size:new xe(y,E)},r.set(h,x),h.addEventListener("dispose",R)}let m=0;for(let v=0;v<f.length;v++)m+=f[v];const p=h.morphTargetsRelative?1:1-m;d.getUniforms().setValue(i,"morphTargetBaseInfluence",p),d.getUniforms().setValue(i,"morphTargetInfluences",f),d.getUniforms().setValue(i,"morphTargetsTexture",x.texture,t),d.getUniforms().setValue(i,"morphTargetsTextureSize",x.size)}else{const u=f===void 0?0:f.length;let g=n[h.id];if(g===void 0||g.length!==u){g=[];for(let _=0;_<u;_++)g[_]=[_,0];n[h.id]=g}for(let _=0;_<u;_++){const w=g[_];w[0]=_,w[1]=f[_]}g.sort(af);for(let _=0;_<8;_++)_<u&&g[_][1]?(o[_][0]=g[_][0],o[_][1]=g[_][1]):(o[_][0]=Number.MAX_SAFE_INTEGER,o[_][1]=0);o.sort(of);const x=h.morphAttributes.position,m=h.morphAttributes.normal;let p=0;for(let _=0;_<8;_++){const w=o[_],P=w[0],C=w[1];P!==Number.MAX_SAFE_INTEGER&&C?(x&&h.getAttribute("morphTarget"+_)!==x[P]&&h.setAttribute("morphTarget"+_,x[P]),m&&h.getAttribute("morphNormal"+_)!==m[P]&&h.setAttribute("morphNormal"+_,m[P]),s[_]=C,p+=C):(x&&h.hasAttribute("morphTarget"+_)===!0&&h.deleteAttribute("morphTarget"+_),m&&h.hasAttribute("morphNormal"+_)===!0&&h.deleteAttribute("morphNormal"+_),s[_]=0)}const v=h.morphTargetsRelative?1:1-p;d.getUniforms().setValue(i,"morphTargetBaseInfluence",v),d.getUniforms().setValue(i,"morphTargetInfluences",s)}}return{update:l}}function cf(i,e,t,n){let s=new WeakMap;function r(l){const c=n.render.frame,h=l.geometry,d=e.get(l,h);if(s.get(d)!==c&&(e.update(d),s.set(d,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),s.get(l)!==c&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){const f=l.skeleton;s.get(f)!==c&&(f.update(),s.set(f,c))}return d}function a(){s=new WeakMap}function o(l){const c=l.target;c.removeEventListener("dispose",o),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:a}}class Ia extends Dt{constructor(e,t,n,s,r,a,o,l,c,h){if(h=h!==void 0?h:Tn,h!==Tn&&h!==Zn)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===Tn&&(n=pn),n===void 0&&h===Zn&&(n=wn),super(null,s,r,a,o,l,h,n,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=o!==void 0?o:Et,this.minFilter=l!==void 0?l:Et,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const Ua=new Dt,Na=new Ia(1,1);Na.compareFunction=$o;const Oa=new sa,Fa=new Th,Ba=new Ma,ka=[],za=[],Ha=new Float32Array(16),Ga=new Float32Array(9),Va=new Float32Array(4);function bi(i,e,t){const n=i[0];if(n<=0||n>0)return i;const s=e*t;let r=ka[s];if(r===void 0&&(r=new Float32Array(s),ka[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function ct(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function ht(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function As(i,e){let t=za[e];t===void 0&&(t=new Int32Array(e),za[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function hf(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function df(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(ct(t,e))return;i.uniform2fv(this.addr,e),ht(t,e)}}function uf(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(ct(t,e))return;i.uniform3fv(this.addr,e),ht(t,e)}}function ff(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(ct(t,e))return;i.uniform4fv(this.addr,e),ht(t,e)}}function pf(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(ct(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),ht(t,e)}else{if(ct(t,n))return;Va.set(n),i.uniformMatrix2fv(this.addr,!1,Va),ht(t,n)}}function mf(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(ct(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),ht(t,e)}else{if(ct(t,n))return;Ga.set(n),i.uniformMatrix3fv(this.addr,!1,Ga),ht(t,n)}}function gf(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(ct(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),ht(t,e)}else{if(ct(t,n))return;Ha.set(n),i.uniformMatrix4fv(this.addr,!1,Ha),ht(t,n)}}function xf(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function _f(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(ct(t,e))return;i.uniform2iv(this.addr,e),ht(t,e)}}function vf(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(ct(t,e))return;i.uniform3iv(this.addr,e),ht(t,e)}}function yf(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(ct(t,e))return;i.uniform4iv(this.addr,e),ht(t,e)}}function bf(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function Sf(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(ct(t,e))return;i.uniform2uiv(this.addr,e),ht(t,e)}}function Ef(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(ct(t,e))return;i.uniform3uiv(this.addr,e),ht(t,e)}}function Mf(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(ct(t,e))return;i.uniform4uiv(this.addr,e),ht(t,e)}}function wf(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);const r=this.type===i.SAMPLER_2D_SHADOW?Na:Ua;t.setTexture2D(e||r,s)}function Tf(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||Fa,s)}function Af(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||Ba,s)}function Cf(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||Oa,s)}function Rf(i){switch(i){case 5126:return hf;case 35664:return df;case 35665:return uf;case 35666:return ff;case 35674:return pf;case 35675:return mf;case 35676:return gf;case 5124:case 35670:return xf;case 35667:case 35671:return _f;case 35668:case 35672:return vf;case 35669:case 35673:return yf;case 5125:return bf;case 36294:return Sf;case 36295:return Ef;case 36296:return Mf;case 35678:case 36198:case 36298:case 36306:case 35682:return wf;case 35679:case 36299:case 36307:return Tf;case 35680:case 36300:case 36308:case 36293:return Af;case 36289:case 36303:case 36311:case 36292:return Cf}}function Lf(i,e){i.uniform1fv(this.addr,e)}function Pf(i,e){const t=bi(e,this.size,2);i.uniform2fv(this.addr,t)}function Df(i,e){const t=bi(e,this.size,3);i.uniform3fv(this.addr,t)}function If(i,e){const t=bi(e,this.size,4);i.uniform4fv(this.addr,t)}function Uf(i,e){const t=bi(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Nf(i,e){const t=bi(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Of(i,e){const t=bi(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Ff(i,e){i.uniform1iv(this.addr,e)}function Bf(i,e){i.uniform2iv(this.addr,e)}function kf(i,e){i.uniform3iv(this.addr,e)}function zf(i,e){i.uniform4iv(this.addr,e)}function Hf(i,e){i.uniform1uiv(this.addr,e)}function Gf(i,e){i.uniform2uiv(this.addr,e)}function Vf(i,e){i.uniform3uiv(this.addr,e)}function Wf(i,e){i.uniform4uiv(this.addr,e)}function Xf(i,e,t){const n=this.cache,s=e.length,r=As(t,s);ct(n,r)||(i.uniform1iv(this.addr,r),ht(n,r));for(let a=0;a!==s;++a)t.setTexture2D(e[a]||Ua,r[a])}function jf(i,e,t){const n=this.cache,s=e.length,r=As(t,s);ct(n,r)||(i.uniform1iv(this.addr,r),ht(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||Fa,r[a])}function qf(i,e,t){const n=this.cache,s=e.length,r=As(t,s);ct(n,r)||(i.uniform1iv(this.addr,r),ht(n,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||Ba,r[a])}function $f(i,e,t){const n=this.cache,s=e.length,r=As(t,s);ct(n,r)||(i.uniform1iv(this.addr,r),ht(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||Oa,r[a])}function Yf(i){switch(i){case 5126:return Lf;case 35664:return Pf;case 35665:return Df;case 35666:return If;case 35674:return Uf;case 35675:return Nf;case 35676:return Of;case 5124:case 35670:return Ff;case 35667:case 35671:return Bf;case 35668:case 35672:return kf;case 35669:case 35673:return zf;case 5125:return Hf;case 36294:return Gf;case 36295:return Vf;case 36296:return Wf;case 35678:case 36198:case 36298:case 36306:case 35682:return Xf;case 35679:case 36299:case 36307:return jf;case 35680:case 36300:case 36308:case 36293:return qf;case 36289:case 36303:case 36311:case 36292:return $f}}class Kf{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Rf(t.type)}}class Jf{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Yf(t.type)}}class Zf{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const s=this.seq;for(let r=0,a=s.length;r!==a;++r){const o=s[r];o.setValue(e,t[o.id],n)}}}const Lr=/(\w+)(\])?(\[|\.)?/g;function Wa(i,e){i.seq.push(e),i.map[e.id]=e}function Qf(i,e,t){const n=i.name,s=n.length;for(Lr.lastIndex=0;;){const r=Lr.exec(n),a=Lr.lastIndex;let o=r[1];const l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){Wa(t,c===void 0?new Kf(o,i,e):new Jf(o,i,e));break}else{let d=t.map[o];d===void 0&&(d=new Zf(o),Wa(t,d)),t=d}}}class Cs{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){const r=e.getActiveUniform(t,s),a=e.getUniformLocation(t,r.name);Qf(r,a,this)}}setValue(e,t,n,s){const r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){const s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){const o=t[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){const n=[];for(let s=0,r=e.length;s!==r;++s){const a=e[s];a.id in t&&n.push(a)}return n}}function Xa(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const ep=37297;let tp=0;function np(i,e){const t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){const o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}function ip(i){const e=Ye.getPrimaries(Ye.workingColorSpace),t=Ye.getPrimaries(i);let n;switch(e===t?n="":e===Ji&&t===Ki?n="LinearDisplayP3ToLinearSRGB":e===Ki&&t===Ji&&(n="LinearSRGBToLinearDisplayP3"),i){case Zt:case $i:return[n,"LinearTransferOETF"];case gt:case er:return[n,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",i),[n,"LinearTransferOETF"]}}function ja(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),s=i.getShaderInfoLog(e).trim();if(n&&s==="")return"";const r=/ERROR: 0:(\d+)/.exec(s);if(r){const a=parseInt(r[1]);return t.toUpperCase()+`

`+s+`

`+np(i.getShaderSource(e),a)}else return s}function sp(i,e){const t=ip(e);return`vec4 ${i}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`}function rp(i,e){let t;switch(e){case Oc:t="Linear";break;case Fc:t="Reinhard";break;case Bc:t="OptimizedCineon";break;case kc:t="ACESFilmic";break;case Hc:t="AgX";break;case zc:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}function op(i){return[i.extensionDerivatives||i.envMapCubeUVHeight||i.bumpMap||i.normalMapTangentSpace||i.clearcoatNormalMap||i.flatShading||i.shaderID==="physical"?"#extension GL_OES_standard_derivatives : enable":"",(i.extensionFragDepth||i.logarithmicDepthBuffer)&&i.rendererExtensionFragDepth?"#extension GL_EXT_frag_depth : enable":"",i.extensionDrawBuffers&&i.rendererExtensionDrawBuffers?"#extension GL_EXT_draw_buffers : require":"",(i.extensionShaderTextureLOD||i.envMap||i.transmission)&&i.rendererExtensionShaderTextureLod?"#extension GL_EXT_shader_texture_lod : enable":""].filter(Si).join(`
`)}function ap(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":""].filter(Si).join(`
`)}function lp(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function cp(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(e,s),a=r.name;let o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function Si(i){return i!==""}function qa(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function $a(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const hp=/^[ \t]*#include +<([\w\d./]+)>/gm;function Pr(i){return i.replace(hp,up)}const dp=new Map([["encodings_fragment","colorspace_fragment"],["encodings_pars_fragment","colorspace_pars_fragment"],["output_fragment","opaque_fragment"]]);function up(i,e){let t=Be[e];if(t===void 0){const n=dp.get(e);if(n!==void 0)t=Be[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Pr(t)}const fp=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Ya(i){return i.replace(fp,pp)}function pp(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Ka(i){let e="precision "+i.precision+` float;
precision `+i.precision+" int;";return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function mp(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===so?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===hc?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===Jt&&(e="SHADOWMAP_TYPE_VSM"),e}function gp(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case Kn:case Jn:e="ENVMAP_TYPE_CUBE";break;case qi:e="ENVMAP_TYPE_CUBE_UV";break}return e}function xp(i){let e="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case Jn:e="ENVMAP_MODE_REFRACTION";break}return e}function _p(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case Gs:e="ENVMAP_BLENDING_MULTIPLY";break;case Uc:e="ENVMAP_BLENDING_MIX";break;case Nc:e="ENVMAP_BLENDING_ADD";break}return e}function vp(i){const e=i.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:n,maxMip:t}}function yp(i,e,t,n){const s=i.getContext(),r=t.defines;let a=t.vertexShader,o=t.fragmentShader;const l=mp(t),c=gp(t),h=xp(t),d=_p(t),f=vp(t),u=t.isWebGL2?"":op(t),g=ap(t),x=lp(r),m=s.createProgram();let p,v,_=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(Si).join(`
`),p.length>0&&(p+=`
`),v=[u,"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(Si).join(`
`),v.length>0&&(v+=`
`)):(p=[Ka(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors&&t.isWebGL2?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )","	attribute vec3 morphTarget0;","	attribute vec3 morphTarget1;","	attribute vec3 morphTarget2;","	attribute vec3 morphTarget3;","	#ifdef USE_MORPHNORMALS","		attribute vec3 morphNormal0;","		attribute vec3 morphNormal1;","		attribute vec3 morphNormal2;","		attribute vec3 morphNormal3;","	#else","		attribute vec3 morphTarget4;","		attribute vec3 morphTarget5;","		attribute vec3 morphTarget6;","		attribute vec3 morphTarget7;","	#endif","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Si).join(`
`),v=[u,Ka(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+d:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==un?"#define TONE_MAPPING":"",t.toneMapping!==un?Be.tonemapping_pars_fragment:"",t.toneMapping!==un?rp("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Be.colorspace_pars_fragment,sp("linearToOutputTexel",t.outputColorSpace),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Si).join(`
`)),a=Pr(a),a=qa(a,t),a=$a(a,t),o=Pr(o),o=qa(o,t),o=$a(o,t),a=Ya(a),o=Ya(o),t.isWebGL2&&t.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,p=[g,"precision mediump sampler2DArray;","#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,v=["precision mediump sampler2DArray;","#define varying in",t.glslVersion===Ko?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Ko?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+v);const w=_+p+a,P=_+v+o,C=Xa(s,s.VERTEX_SHADER,w),T=Xa(s,s.FRAGMENT_SHADER,P);s.attachShader(m,C),s.attachShader(m,T),t.index0AttributeName!==void 0?s.bindAttribLocation(m,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(m,0,"position"),s.linkProgram(m);function H(G){if(i.debug.checkShaderErrors){const J=s.getProgramInfoLog(m).trim(),R=s.getShaderInfoLog(C).trim(),U=s.getShaderInfoLog(T).trim();let B=!0,$=!0;if(s.getProgramParameter(m,s.LINK_STATUS)===!1)if(B=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,m,C,T);else{const q=ja(s,C,"vertex"),K=ja(s,T,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(m,s.VALIDATE_STATUS)+`

Program Info Log: `+J+`
`+q+`
`+K)}else J!==""?console.warn("THREE.WebGLProgram: Program Info Log:",J):(R===""||U==="")&&($=!1);$&&(G.diagnostics={runnable:B,programLog:J,vertexShader:{log:R,prefix:p},fragmentShader:{log:U,prefix:v}})}s.deleteShader(C),s.deleteShader(T),y=new Cs(s,m),E=cp(s,m)}let y;this.getUniforms=function(){return y===void 0&&H(this),y};let E;this.getAttributes=function(){return E===void 0&&H(this),E};let N=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return N===!1&&(N=s.getProgramParameter(m,ep)),N},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(m),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=tp++,this.cacheKey=e,this.usedTimes=1,this.program=m,this.vertexShader=C,this.fragmentShader=T,this}let bp=0;class Sp{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(s)===!1&&(a.add(s),s.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new Ep(e),t.set(e,n)),n}}class Ep{constructor(e){this.id=bp++,this.code=e,this.usedTimes=0}}function Mp(i,e,t,n,s,r,a){const o=new pr,l=new Sp,c=[],h=s.isWebGL2,d=s.logarithmicDepthBuffer,f=s.vertexTextures;let u=s.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(y){return y===0?"uv":`uv${y}`}function m(y,E,N,G,J){const R=G.fog,U=J.geometry,B=y.isMeshStandardMaterial?G.environment:null,$=(y.isMeshStandardMaterial?t:e).get(y.envMap||B),q=$&&$.mapping===qi?$.image.height:null,K=g[y.type];y.precision!==null&&(u=s.getMaxPrecision(y.precision),u!==y.precision&&console.warn("THREE.WebGLProgram.getParameters:",y.precision,"not supported, using",u,"instead."));const Q=U.morphAttributes.position||U.morphAttributes.normal||U.morphAttributes.color,ee=Q!==void 0?Q.length:0;let ae=0;U.morphAttributes.position!==void 0&&(ae=1),U.morphAttributes.normal!==void 0&&(ae=2),U.morphAttributes.color!==void 0&&(ae=3);let X,I,Z,he;if(K){const st=Yt[K];X=st.vertexShader,I=st.fragmentShader}else X=y.vertexShader,I=y.fragmentShader,l.update(y),Z=l.getVertexShaderID(y),he=l.getFragmentShaderID(y);const de=i.getRenderTarget(),we=J.isInstancedMesh===!0,Te=J.isBatchedMesh===!0,ve=!!y.map,ke=!!y.matcap,z=!!$,at=!!y.aoMap,be=!!y.lightMap,Re=!!y.bumpMap,_e=!!y.normalMap,Ke=!!y.displacementMap,Ae=!!y.emissiveMap,M=!!y.metalnessMap,b=!!y.roughnessMap,k=y.anisotropy>0,te=y.clearcoat>0,O=y.iridescence>0,Y=y.sheen>0,ge=y.transmission>0,ce=k&&!!y.anisotropyMap,me=te&&!!y.clearcoatMap,Ce=te&&!!y.clearcoatNormalMap,Oe=te&&!!y.clearcoatRoughnessMap,ne=O&&!!y.iridescenceMap,$e=O&&!!y.iridescenceThicknessMap,ze=Y&&!!y.sheenColorMap,De=Y&&!!y.sheenRoughnessMap,Ee=!!y.specularMap,ue=!!y.specularColorMap,A=!!y.specularIntensityMap,se=ge&&!!y.transmissionMap,ye=ge&&!!y.thicknessMap,pe=!!y.gradientMap,ie=!!y.alphaMap,D=y.alphaTest>0,re=!!y.alphaHash,le=!!y.extensions,Le=!!U.attributes.uv1,Me=!!U.attributes.uv2,Xe=!!U.attributes.uv3;let je=un;return y.toneMapped&&(de===null||de.isXRRenderTarget===!0)&&(je=i.toneMapping),{isWebGL2:h,shaderID:K,shaderType:y.type,shaderName:y.name,vertexShader:X,fragmentShader:I,defines:y.defines,customVertexShaderID:Z,customFragmentShaderID:he,isRawShaderMaterial:y.isRawShaderMaterial===!0,glslVersion:y.glslVersion,precision:u,batching:Te,instancing:we,instancingColor:we&&J.instanceColor!==null,supportsVertexTextures:f,outputColorSpace:de===null?i.outputColorSpace:de.isXRRenderTarget===!0?de.texture.colorSpace:Zt,map:ve,matcap:ke,envMap:z,envMapMode:z&&$.mapping,envMapCubeUVHeight:q,aoMap:at,lightMap:be,bumpMap:Re,normalMap:_e,displacementMap:f&&Ke,emissiveMap:Ae,normalMapObjectSpace:_e&&y.normalMapType===Qc,normalMapTangentSpace:_e&&y.normalMapType===jo,metalnessMap:M,roughnessMap:b,anisotropy:k,anisotropyMap:ce,clearcoat:te,clearcoatMap:me,clearcoatNormalMap:Ce,clearcoatRoughnessMap:Oe,iridescence:O,iridescenceMap:ne,iridescenceThicknessMap:$e,sheen:Y,sheenColorMap:ze,sheenRoughnessMap:De,specularMap:Ee,specularColorMap:ue,specularIntensityMap:A,transmission:ge,transmissionMap:se,thicknessMap:ye,gradientMap:pe,opaque:y.transparent===!1&&y.blending===Yn,alphaMap:ie,alphaTest:D,alphaHash:re,combine:y.combine,mapUv:ve&&x(y.map.channel),aoMapUv:at&&x(y.aoMap.channel),lightMapUv:be&&x(y.lightMap.channel),bumpMapUv:Re&&x(y.bumpMap.channel),normalMapUv:_e&&x(y.normalMap.channel),displacementMapUv:Ke&&x(y.displacementMap.channel),emissiveMapUv:Ae&&x(y.emissiveMap.channel),metalnessMapUv:M&&x(y.metalnessMap.channel),roughnessMapUv:b&&x(y.roughnessMap.channel),anisotropyMapUv:ce&&x(y.anisotropyMap.channel),clearcoatMapUv:me&&x(y.clearcoatMap.channel),clearcoatNormalMapUv:Ce&&x(y.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Oe&&x(y.clearcoatRoughnessMap.channel),iridescenceMapUv:ne&&x(y.iridescenceMap.channel),iridescenceThicknessMapUv:$e&&x(y.iridescenceThicknessMap.channel),sheenColorMapUv:ze&&x(y.sheenColorMap.channel),sheenRoughnessMapUv:De&&x(y.sheenRoughnessMap.channel),specularMapUv:Ee&&x(y.specularMap.channel),specularColorMapUv:ue&&x(y.specularColorMap.channel),specularIntensityMapUv:A&&x(y.specularIntensityMap.channel),transmissionMapUv:se&&x(y.transmissionMap.channel),thicknessMapUv:ye&&x(y.thicknessMap.channel),alphaMapUv:ie&&x(y.alphaMap.channel),vertexTangents:!!U.attributes.tangent&&(_e||k),vertexColors:y.vertexColors,vertexAlphas:y.vertexColors===!0&&!!U.attributes.color&&U.attributes.color.itemSize===4,vertexUv1s:Le,vertexUv2s:Me,vertexUv3s:Xe,pointsUvs:J.isPoints===!0&&!!U.attributes.uv&&(ve||ie),fog:!!R,useFog:y.fog===!0,fogExp2:R&&R.isFogExp2,flatShading:y.flatShading===!0,sizeAttenuation:y.sizeAttenuation===!0,logarithmicDepthBuffer:d,skinning:J.isSkinnedMesh===!0,morphTargets:U.morphAttributes.position!==void 0,morphNormals:U.morphAttributes.normal!==void 0,morphColors:U.morphAttributes.color!==void 0,morphTargetsCount:ee,morphTextureStride:ae,numDirLights:E.directional.length,numPointLights:E.point.length,numSpotLights:E.spot.length,numSpotLightMaps:E.spotLightMap.length,numRectAreaLights:E.rectArea.length,numHemiLights:E.hemi.length,numDirLightShadows:E.directionalShadowMap.length,numPointLightShadows:E.pointShadowMap.length,numSpotLightShadows:E.spotShadowMap.length,numSpotLightShadowsWithMaps:E.numSpotLightShadowsWithMaps,numLightProbes:E.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:y.dithering,shadowMapEnabled:i.shadowMap.enabled&&N.length>0,shadowMapType:i.shadowMap.type,toneMapping:je,useLegacyLights:i._useLegacyLights,decodeVideoTexture:ve&&y.map.isVideoTexture===!0&&Ye.getTransfer(y.map.colorSpace)===Ze,premultipliedAlpha:y.premultipliedAlpha,doubleSided:y.side===Bt,flipSided:y.side===Rt,useDepthPacking:y.depthPacking>=0,depthPacking:y.depthPacking||0,index0AttributeName:y.index0AttributeName,extensionDerivatives:le&&y.extensions.derivatives===!0,extensionFragDepth:le&&y.extensions.fragDepth===!0,extensionDrawBuffers:le&&y.extensions.drawBuffers===!0,extensionShaderTextureLOD:le&&y.extensions.shaderTextureLOD===!0,extensionClipCullDistance:le&&y.extensions.clipCullDistance&&n.has("WEBGL_clip_cull_distance"),rendererExtensionFragDepth:h||n.has("EXT_frag_depth"),rendererExtensionDrawBuffers:h||n.has("WEBGL_draw_buffers"),rendererExtensionShaderTextureLod:h||n.has("EXT_shader_texture_lod"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:y.customProgramCacheKey()}}function p(y){const E=[];if(y.shaderID?E.push(y.shaderID):(E.push(y.customVertexShaderID),E.push(y.customFragmentShaderID)),y.defines!==void 0)for(const N in y.defines)E.push(N),E.push(y.defines[N]);return y.isRawShaderMaterial===!1&&(v(E,y),_(E,y),E.push(i.outputColorSpace)),E.push(y.customProgramCacheKey),E.join()}function v(y,E){y.push(E.precision),y.push(E.outputColorSpace),y.push(E.envMapMode),y.push(E.envMapCubeUVHeight),y.push(E.mapUv),y.push(E.alphaMapUv),y.push(E.lightMapUv),y.push(E.aoMapUv),y.push(E.bumpMapUv),y.push(E.normalMapUv),y.push(E.displacementMapUv),y.push(E.emissiveMapUv),y.push(E.metalnessMapUv),y.push(E.roughnessMapUv),y.push(E.anisotropyMapUv),y.push(E.clearcoatMapUv),y.push(E.clearcoatNormalMapUv),y.push(E.clearcoatRoughnessMapUv),y.push(E.iridescenceMapUv),y.push(E.iridescenceThicknessMapUv),y.push(E.sheenColorMapUv),y.push(E.sheenRoughnessMapUv),y.push(E.specularMapUv),y.push(E.specularColorMapUv),y.push(E.specularIntensityMapUv),y.push(E.transmissionMapUv),y.push(E.thicknessMapUv),y.push(E.combine),y.push(E.fogExp2),y.push(E.sizeAttenuation),y.push(E.morphTargetsCount),y.push(E.morphAttributeCount),y.push(E.numDirLights),y.push(E.numPointLights),y.push(E.numSpotLights),y.push(E.numSpotLightMaps),y.push(E.numHemiLights),y.push(E.numRectAreaLights),y.push(E.numDirLightShadows),y.push(E.numPointLightShadows),y.push(E.numSpotLightShadows),y.push(E.numSpotLightShadowsWithMaps),y.push(E.numLightProbes),y.push(E.shadowMapType),y.push(E.toneMapping),y.push(E.numClippingPlanes),y.push(E.numClipIntersection),y.push(E.depthPacking)}function _(y,E){o.disableAll(),E.isWebGL2&&o.enable(0),E.supportsVertexTextures&&o.enable(1),E.instancing&&o.enable(2),E.instancingColor&&o.enable(3),E.matcap&&o.enable(4),E.envMap&&o.enable(5),E.normalMapObjectSpace&&o.enable(6),E.normalMapTangentSpace&&o.enable(7),E.clearcoat&&o.enable(8),E.iridescence&&o.enable(9),E.alphaTest&&o.enable(10),E.vertexColors&&o.enable(11),E.vertexAlphas&&o.enable(12),E.vertexUv1s&&o.enable(13),E.vertexUv2s&&o.enable(14),E.vertexUv3s&&o.enable(15),E.vertexTangents&&o.enable(16),E.anisotropy&&o.enable(17),E.alphaHash&&o.enable(18),E.batching&&o.enable(19),y.push(o.mask),o.disableAll(),E.fog&&o.enable(0),E.useFog&&o.enable(1),E.flatShading&&o.enable(2),E.logarithmicDepthBuffer&&o.enable(3),E.skinning&&o.enable(4),E.morphTargets&&o.enable(5),E.morphNormals&&o.enable(6),E.morphColors&&o.enable(7),E.premultipliedAlpha&&o.enable(8),E.shadowMapEnabled&&o.enable(9),E.useLegacyLights&&o.enable(10),E.doubleSided&&o.enable(11),E.flipSided&&o.enable(12),E.useDepthPacking&&o.enable(13),E.dithering&&o.enable(14),E.transmission&&o.enable(15),E.sheen&&o.enable(16),E.opaque&&o.enable(17),E.pointsUvs&&o.enable(18),E.decodeVideoTexture&&o.enable(19),y.push(o.mask)}function w(y){const E=g[y.type];let N;if(E){const G=Yt[E];N=kh.clone(G.uniforms)}else N=y.uniforms;return N}function P(y,E){let N;for(let G=0,J=c.length;G<J;G++){const R=c[G];if(R.cacheKey===E){N=R,++N.usedTimes;break}}return N===void 0&&(N=new yp(i,E,y,r),c.push(N)),N}function C(y){if(--y.usedTimes===0){const E=c.indexOf(y);c[E]=c[c.length-1],c.pop(),y.destroy()}}function T(y){l.remove(y)}function H(){l.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:w,acquireProgram:P,releaseProgram:C,releaseShaderCache:T,programs:c,dispose:H}}function wp(){let i=new WeakMap;function e(r){let a=i.get(r);return a===void 0&&(a={},i.set(r,a)),a}function t(r){i.delete(r)}function n(r,a,o){i.get(r)[a]=o}function s(){i=new WeakMap}return{get:e,remove:t,update:n,dispose:s}}function Tp(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function Ja(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Za(){const i=[];let e=0;const t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(d,f,u,g,x,m){let p=i[e];return p===void 0?(p={id:d.id,object:d,geometry:f,material:u,groupOrder:g,renderOrder:d.renderOrder,z:x,group:m},i[e]=p):(p.id=d.id,p.object=d,p.geometry=f,p.material=u,p.groupOrder=g,p.renderOrder=d.renderOrder,p.z=x,p.group=m),e++,p}function o(d,f,u,g,x,m){const p=a(d,f,u,g,x,m);u.transmission>0?n.push(p):u.transparent===!0?s.push(p):t.push(p)}function l(d,f,u,g,x,m){const p=a(d,f,u,g,x,m);u.transmission>0?n.unshift(p):u.transparent===!0?s.unshift(p):t.unshift(p)}function c(d,f){t.length>1&&t.sort(d||Tp),n.length>1&&n.sort(f||Ja),s.length>1&&s.sort(f||Ja)}function h(){for(let d=e,f=i.length;d<f;d++){const u=i[d];if(u.id===null)break;u.id=null,u.object=null,u.geometry=null,u.material=null,u.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:o,unshift:l,finish:h,sort:c}}function Ap(){let i=new WeakMap;function e(n,s){const r=i.get(n);let a;return r===void 0?(a=new Za,i.set(n,[a])):s>=r.length?(a=new Za,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function Cp(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new L,color:new Ue};break;case"SpotLight":t={position:new L,direction:new L,color:new Ue,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new L,color:new Ue,distance:0,decay:0};break;case"HemisphereLight":t={direction:new L,skyColor:new Ue,groundColor:new Ue};break;case"RectAreaLight":t={color:new Ue,position:new L,halfWidth:new L,halfHeight:new L};break}return i[e.id]=t,t}}}function Rp(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new xe};break;case"SpotLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new xe};break;case"PointLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new xe,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let Lp=0;function Pp(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function Dp(i,e){const t=new Cp,n=Rp(),s={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let h=0;h<9;h++)s.probe.push(new L);const r=new L,a=new Qe,o=new Qe;function l(h,d){let f=0,u=0,g=0;for(let G=0;G<9;G++)s.probe[G].set(0,0,0);let x=0,m=0,p=0,v=0,_=0,w=0,P=0,C=0,T=0,H=0,y=0;h.sort(Pp);const E=d===!0?Math.PI:1;for(let G=0,J=h.length;G<J;G++){const R=h[G],U=R.color,B=R.intensity,$=R.distance,q=R.shadow&&R.shadow.map?R.shadow.map.texture:null;if(R.isAmbientLight)f+=U.r*B*E,u+=U.g*B*E,g+=U.b*B*E;else if(R.isLightProbe){for(let K=0;K<9;K++)s.probe[K].addScaledVector(R.sh.coefficients[K],B);y++}else if(R.isDirectionalLight){const K=t.get(R);if(K.color.copy(R.color).multiplyScalar(R.intensity*E),R.castShadow){const Q=R.shadow,ee=n.get(R);ee.shadowBias=Q.bias,ee.shadowNormalBias=Q.normalBias,ee.shadowRadius=Q.radius,ee.shadowMapSize=Q.mapSize,s.directionalShadow[x]=ee,s.directionalShadowMap[x]=q,s.directionalShadowMatrix[x]=R.shadow.matrix,w++}s.directional[x]=K,x++}else if(R.isSpotLight){const K=t.get(R);K.position.setFromMatrixPosition(R.matrixWorld),K.color.copy(U).multiplyScalar(B*E),K.distance=$,K.coneCos=Math.cos(R.angle),K.penumbraCos=Math.cos(R.angle*(1-R.penumbra)),K.decay=R.decay,s.spot[p]=K;const Q=R.shadow;if(R.map&&(s.spotLightMap[T]=R.map,T++,Q.updateMatrices(R),R.castShadow&&H++),s.spotLightMatrix[p]=Q.matrix,R.castShadow){const ee=n.get(R);ee.shadowBias=Q.bias,ee.shadowNormalBias=Q.normalBias,ee.shadowRadius=Q.radius,ee.shadowMapSize=Q.mapSize,s.spotShadow[p]=ee,s.spotShadowMap[p]=q,C++}p++}else if(R.isRectAreaLight){const K=t.get(R);K.color.copy(U).multiplyScalar(B),K.halfWidth.set(R.width*.5,0,0),K.halfHeight.set(0,R.height*.5,0),s.rectArea[v]=K,v++}else if(R.isPointLight){const K=t.get(R);if(K.color.copy(R.color).multiplyScalar(R.intensity*E),K.distance=R.distance,K.decay=R.decay,R.castShadow){const Q=R.shadow,ee=n.get(R);ee.shadowBias=Q.bias,ee.shadowNormalBias=Q.normalBias,ee.shadowRadius=Q.radius,ee.shadowMapSize=Q.mapSize,ee.shadowCameraNear=Q.camera.near,ee.shadowCameraFar=Q.camera.far,s.pointShadow[m]=ee,s.pointShadowMap[m]=q,s.pointShadowMatrix[m]=R.shadow.matrix,P++}s.point[m]=K,m++}else if(R.isHemisphereLight){const K=t.get(R);K.skyColor.copy(R.color).multiplyScalar(B*E),K.groundColor.copy(R.groundColor).multiplyScalar(B*E),s.hemi[_]=K,_++}}v>0&&(e.isWebGL2?i.has("OES_texture_float_linear")===!0?(s.rectAreaLTC1=oe.LTC_FLOAT_1,s.rectAreaLTC2=oe.LTC_FLOAT_2):(s.rectAreaLTC1=oe.LTC_HALF_1,s.rectAreaLTC2=oe.LTC_HALF_2):i.has("OES_texture_float_linear")===!0?(s.rectAreaLTC1=oe.LTC_FLOAT_1,s.rectAreaLTC2=oe.LTC_FLOAT_2):i.has("OES_texture_half_float_linear")===!0?(s.rectAreaLTC1=oe.LTC_HALF_1,s.rectAreaLTC2=oe.LTC_HALF_2):console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")),s.ambient[0]=f,s.ambient[1]=u,s.ambient[2]=g;const N=s.hash;(N.directionalLength!==x||N.pointLength!==m||N.spotLength!==p||N.rectAreaLength!==v||N.hemiLength!==_||N.numDirectionalShadows!==w||N.numPointShadows!==P||N.numSpotShadows!==C||N.numSpotMaps!==T||N.numLightProbes!==y)&&(s.directional.length=x,s.spot.length=p,s.rectArea.length=v,s.point.length=m,s.hemi.length=_,s.directionalShadow.length=w,s.directionalShadowMap.length=w,s.pointShadow.length=P,s.pointShadowMap.length=P,s.spotShadow.length=C,s.spotShadowMap.length=C,s.directionalShadowMatrix.length=w,s.pointShadowMatrix.length=P,s.spotLightMatrix.length=C+T-H,s.spotLightMap.length=T,s.numSpotLightShadowsWithMaps=H,s.numLightProbes=y,N.directionalLength=x,N.pointLength=m,N.spotLength=p,N.rectAreaLength=v,N.hemiLength=_,N.numDirectionalShadows=w,N.numPointShadows=P,N.numSpotShadows=C,N.numSpotMaps=T,N.numLightProbes=y,s.version=Lp++)}function c(h,d){let f=0,u=0,g=0,x=0,m=0;const p=d.matrixWorldInverse;for(let v=0,_=h.length;v<_;v++){const w=h[v];if(w.isDirectionalLight){const P=s.directional[f];P.direction.setFromMatrixPosition(w.matrixWorld),r.setFromMatrixPosition(w.target.matrixWorld),P.direction.sub(r),P.direction.transformDirection(p),f++}else if(w.isSpotLight){const P=s.spot[g];P.position.setFromMatrixPosition(w.matrixWorld),P.position.applyMatrix4(p),P.direction.setFromMatrixPosition(w.matrixWorld),r.setFromMatrixPosition(w.target.matrixWorld),P.direction.sub(r),P.direction.transformDirection(p),g++}else if(w.isRectAreaLight){const P=s.rectArea[x];P.position.setFromMatrixPosition(w.matrixWorld),P.position.applyMatrix4(p),o.identity(),a.copy(w.matrixWorld),a.premultiply(p),o.extractRotation(a),P.halfWidth.set(w.width*.5,0,0),P.halfHeight.set(0,w.height*.5,0),P.halfWidth.applyMatrix4(o),P.halfHeight.applyMatrix4(o),x++}else if(w.isPointLight){const P=s.point[u];P.position.setFromMatrixPosition(w.matrixWorld),P.position.applyMatrix4(p),u++}else if(w.isHemisphereLight){const P=s.hemi[m];P.direction.setFromMatrixPosition(w.matrixWorld),P.direction.transformDirection(p),m++}}}return{setup:l,setupView:c,state:s}}function Qa(i,e){const t=new Dp(i,e),n=[],s=[];function r(){n.length=0,s.length=0}function a(d){n.push(d)}function o(d){s.push(d)}function l(d){t.setup(n,d)}function c(d){t.setupView(n,d)}return{init:r,state:{lightsArray:n,shadowsArray:s,lights:t},setupLights:l,setupLightsView:c,pushLight:a,pushShadow:o}}function Ip(i,e){let t=new WeakMap;function n(r,a=0){const o=t.get(r);let l;return o===void 0?(l=new Qa(i,e),t.set(r,[l])):a>=o.length?(l=new Qa(i,e),o.push(l)):l=o[a],l}function s(){t=new WeakMap}return{get:n,dispose:s}}class Up extends di{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Jc,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class Np extends di{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const Op=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Fp=`uniform sampler2D shadow_pass;
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
}`;function Bp(i,e,t){let n=new Er;const s=new xe,r=new xe,a=new ut,o=new Up({depthPacking:Zc}),l=new Np,c={},h=t.maxTextureSize,d={[hn]:Rt,[Rt]:hn,[Bt]:Bt},f=new Nn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new xe},radius:{value:4}},vertexShader:Op,fragmentShader:Fp}),u=f.clone();u.defines.HORIZONTAL_PASS=1;const g=new yt;g.setAttribute("position",new Je(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const x=new wt(g,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=so;let p=this.type;this.render=function(C,T,H){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||C.length===0)return;const y=i.getRenderTarget(),E=i.getActiveCubeFace(),N=i.getActiveMipmapLevel(),G=i.state;G.setBlending(dn),G.buffers.color.setClear(1,1,1,1),G.buffers.depth.setTest(!0),G.setScissorTest(!1);const J=p!==Jt&&this.type===Jt,R=p===Jt&&this.type!==Jt;for(let U=0,B=C.length;U<B;U++){const $=C[U],q=$.shadow;if(q===void 0){console.warn("THREE.WebGLShadowMap:",$,"has no shadow.");continue}if(q.autoUpdate===!1&&q.needsUpdate===!1)continue;s.copy(q.mapSize);const K=q.getFrameExtents();if(s.multiply(K),r.copy(q.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/K.x),s.x=r.x*K.x,q.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/K.y),s.y=r.y*K.y,q.mapSize.y=r.y)),q.map===null||J===!0||R===!0){const ee=this.type!==Jt?{minFilter:Et,magFilter:Et}:{};q.map!==null&&q.map.dispose(),q.map=new Rn(s.x,s.y,ee),q.map.texture.name=$.name+".shadowMap",q.camera.updateProjectionMatrix()}i.setRenderTarget(q.map),i.clear();const Q=q.getViewportCount();for(let ee=0;ee<Q;ee++){const ae=q.getViewport(ee);a.set(r.x*ae.x,r.y*ae.y,r.x*ae.z,r.y*ae.w),G.viewport(a),q.updateMatrices($,ee),n=q.getFrustum(),w(T,H,q.camera,$,this.type)}q.isPointLightShadow!==!0&&this.type===Jt&&v(q,H),q.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(y,E,N)};function v(C,T){const H=e.update(x);f.defines.VSM_SAMPLES!==C.blurSamples&&(f.defines.VSM_SAMPLES=C.blurSamples,u.defines.VSM_SAMPLES=C.blurSamples,f.needsUpdate=!0,u.needsUpdate=!0),C.mapPass===null&&(C.mapPass=new Rn(s.x,s.y)),f.uniforms.shadow_pass.value=C.map.texture,f.uniforms.resolution.value=C.mapSize,f.uniforms.radius.value=C.radius,i.setRenderTarget(C.mapPass),i.clear(),i.renderBufferDirect(T,null,H,f,x,null),u.uniforms.shadow_pass.value=C.mapPass.texture,u.uniforms.resolution.value=C.mapSize,u.uniforms.radius.value=C.radius,i.setRenderTarget(C.map),i.clear(),i.renderBufferDirect(T,null,H,u,x,null)}function _(C,T,H,y){let E=null;const N=H.isPointLight===!0?C.customDistanceMaterial:C.customDepthMaterial;if(N!==void 0)E=N;else if(E=H.isPointLight===!0?l:o,i.localClippingEnabled&&T.clipShadows===!0&&Array.isArray(T.clippingPlanes)&&T.clippingPlanes.length!==0||T.displacementMap&&T.displacementScale!==0||T.alphaMap&&T.alphaTest>0||T.map&&T.alphaTest>0){const G=E.uuid,J=T.uuid;let R=c[G];R===void 0&&(R={},c[G]=R);let U=R[J];U===void 0&&(U=E.clone(),R[J]=U,T.addEventListener("dispose",P)),E=U}if(E.visible=T.visible,E.wireframe=T.wireframe,y===Jt?E.side=T.shadowSide!==null?T.shadowSide:T.side:E.side=T.shadowSide!==null?T.shadowSide:d[T.side],E.alphaMap=T.alphaMap,E.alphaTest=T.alphaTest,E.map=T.map,E.clipShadows=T.clipShadows,E.clippingPlanes=T.clippingPlanes,E.clipIntersection=T.clipIntersection,E.displacementMap=T.displacementMap,E.displacementScale=T.displacementScale,E.displacementBias=T.displacementBias,E.wireframeLinewidth=T.wireframeLinewidth,E.linewidth=T.linewidth,H.isPointLight===!0&&E.isMeshDistanceMaterial===!0){const G=i.properties.get(E);G.light=H}return E}function w(C,T,H,y,E){if(C.visible===!1)return;if(C.layers.test(T.layers)&&(C.isMesh||C.isLine||C.isPoints)&&(C.castShadow||C.receiveShadow&&E===Jt)&&(!C.frustumCulled||n.intersectsObject(C))){C.modelViewMatrix.multiplyMatrices(H.matrixWorldInverse,C.matrixWorld);const J=e.update(C),R=C.material;if(Array.isArray(R)){const U=J.groups;for(let B=0,$=U.length;B<$;B++){const q=U[B],K=R[q.materialIndex];if(K&&K.visible){const Q=_(C,K,y,E);C.onBeforeShadow(i,C,T,H,J,Q,q),i.renderBufferDirect(H,null,J,Q,C,q),C.onAfterShadow(i,C,T,H,J,Q,q)}}}else if(R.visible){const U=_(C,R,y,E);C.onBeforeShadow(i,C,T,H,J,U,null),i.renderBufferDirect(H,null,J,U,C,null),C.onAfterShadow(i,C,T,H,J,U,null)}}const G=C.children;for(let J=0,R=G.length;J<R;J++)w(G[J],T,H,y,E)}function P(C){C.target.removeEventListener("dispose",P);for(const H in c){const y=c[H],E=C.target.uuid;E in y&&(y[E].dispose(),delete y[E])}}}function kp(i,e,t){const n=t.isWebGL2;function s(){let D=!1;const re=new ut;let le=null;const Le=new ut(0,0,0,0);return{setMask:function(Me){le!==Me&&!D&&(i.colorMask(Me,Me,Me,Me),le=Me)},setLocked:function(Me){D=Me},setClear:function(Me,Xe,je,nt,st){st===!0&&(Me*=nt,Xe*=nt,je*=nt),re.set(Me,Xe,je,nt),Le.equals(re)===!1&&(i.clearColor(Me,Xe,je,nt),Le.copy(re))},reset:function(){D=!1,le=null,Le.set(-1,0,0,0)}}}function r(){let D=!1,re=null,le=null,Le=null;return{setTest:function(Me){Me?Te(i.DEPTH_TEST):ve(i.DEPTH_TEST)},setMask:function(Me){re!==Me&&!D&&(i.depthMask(Me),re=Me)},setFunc:function(Me){if(le!==Me){switch(Me){case Ac:i.depthFunc(i.NEVER);break;case Cc:i.depthFunc(i.ALWAYS);break;case Rc:i.depthFunc(i.LESS);break;case ji:i.depthFunc(i.LEQUAL);break;case Lc:i.depthFunc(i.EQUAL);break;case Pc:i.depthFunc(i.GEQUAL);break;case Dc:i.depthFunc(i.GREATER);break;case Ic:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}le=Me}},setLocked:function(Me){D=Me},setClear:function(Me){Le!==Me&&(i.clearDepth(Me),Le=Me)},reset:function(){D=!1,re=null,le=null,Le=null}}}function a(){let D=!1,re=null,le=null,Le=null,Me=null,Xe=null,je=null,nt=null,st=null;return{setTest:function(qe){D||(qe?Te(i.STENCIL_TEST):ve(i.STENCIL_TEST))},setMask:function(qe){re!==qe&&!D&&(i.stencilMask(qe),re=qe)},setFunc:function(qe,lt,Kt){(le!==qe||Le!==lt||Me!==Kt)&&(i.stencilFunc(qe,lt,Kt),le=qe,Le=lt,Me=Kt)},setOp:function(qe,lt,Kt){(Xe!==qe||je!==lt||nt!==Kt)&&(i.stencilOp(qe,lt,Kt),Xe=qe,je=lt,nt=Kt)},setLocked:function(qe){D=qe},setClear:function(qe){st!==qe&&(i.clearStencil(qe),st=qe)},reset:function(){D=!1,re=null,le=null,Le=null,Me=null,Xe=null,je=null,nt=null,st=null}}}const o=new s,l=new r,c=new a,h=new WeakMap,d=new WeakMap;let f={},u={},g=new WeakMap,x=[],m=null,p=!1,v=null,_=null,w=null,P=null,C=null,T=null,H=null,y=new Ue(0,0,0),E=0,N=!1,G=null,J=null,R=null,U=null,B=null;const $=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let q=!1,K=0;const Q=i.getParameter(i.VERSION);Q.indexOf("WebGL")!==-1?(K=parseFloat(/^WebGL (\d)/.exec(Q)[1]),q=K>=1):Q.indexOf("OpenGL ES")!==-1&&(K=parseFloat(/^OpenGL ES (\d)/.exec(Q)[1]),q=K>=2);let ee=null,ae={};const X=i.getParameter(i.SCISSOR_BOX),I=i.getParameter(i.VIEWPORT),Z=new ut().fromArray(X),he=new ut().fromArray(I);function de(D,re,le,Le){const Me=new Uint8Array(4),Xe=i.createTexture();i.bindTexture(D,Xe),i.texParameteri(D,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(D,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let je=0;je<le;je++)n&&(D===i.TEXTURE_3D||D===i.TEXTURE_2D_ARRAY)?i.texImage3D(re,0,i.RGBA,1,1,Le,0,i.RGBA,i.UNSIGNED_BYTE,Me):i.texImage2D(re+je,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Me);return Xe}const we={};we[i.TEXTURE_2D]=de(i.TEXTURE_2D,i.TEXTURE_2D,1),we[i.TEXTURE_CUBE_MAP]=de(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),n&&(we[i.TEXTURE_2D_ARRAY]=de(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),we[i.TEXTURE_3D]=de(i.TEXTURE_3D,i.TEXTURE_3D,1,1)),o.setClear(0,0,0,1),l.setClear(1),c.setClear(0),Te(i.DEPTH_TEST),l.setFunc(ji),Ae(!1),M(io),Te(i.CULL_FACE),_e(dn);function Te(D){f[D]!==!0&&(i.enable(D),f[D]=!0)}function ve(D){f[D]!==!1&&(i.disable(D),f[D]=!1)}function ke(D,re){return u[D]!==re?(i.bindFramebuffer(D,re),u[D]=re,n&&(D===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=re),D===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=re)),!0):!1}function z(D,re){let le=x,Le=!1;if(D)if(le=g.get(re),le===void 0&&(le=[],g.set(re,le)),D.isWebGLMultipleRenderTargets){const Me=D.texture;if(le.length!==Me.length||le[0]!==i.COLOR_ATTACHMENT0){for(let Xe=0,je=Me.length;Xe<je;Xe++)le[Xe]=i.COLOR_ATTACHMENT0+Xe;le.length=Me.length,Le=!0}}else le[0]!==i.COLOR_ATTACHMENT0&&(le[0]=i.COLOR_ATTACHMENT0,Le=!0);else le[0]!==i.BACK&&(le[0]=i.BACK,Le=!0);Le&&(t.isWebGL2?i.drawBuffers(le):e.get("WEBGL_draw_buffers").drawBuffersWEBGL(le))}function at(D){return m!==D?(i.useProgram(D),m=D,!0):!1}const be={[Mn]:i.FUNC_ADD,[uc]:i.FUNC_SUBTRACT,[fc]:i.FUNC_REVERSE_SUBTRACT};if(n)be[lo]=i.MIN,be[co]=i.MAX;else{const D=e.get("EXT_blend_minmax");D!==null&&(be[lo]=D.MIN_EXT,be[co]=D.MAX_EXT)}const Re={[pc]:i.ZERO,[mc]:i.ONE,[gc]:i.SRC_COLOR,[zs]:i.SRC_ALPHA,[Sc]:i.SRC_ALPHA_SATURATE,[yc]:i.DST_COLOR,[_c]:i.DST_ALPHA,[xc]:i.ONE_MINUS_SRC_COLOR,[Hs]:i.ONE_MINUS_SRC_ALPHA,[bc]:i.ONE_MINUS_DST_COLOR,[vc]:i.ONE_MINUS_DST_ALPHA,[Ec]:i.CONSTANT_COLOR,[Mc]:i.ONE_MINUS_CONSTANT_COLOR,[wc]:i.CONSTANT_ALPHA,[Tc]:i.ONE_MINUS_CONSTANT_ALPHA};function _e(D,re,le,Le,Me,Xe,je,nt,st,qe){if(D===dn){p===!0&&(ve(i.BLEND),p=!1);return}if(p===!1&&(Te(i.BLEND),p=!0),D!==dc){if(D!==v||qe!==N){if((_!==Mn||C!==Mn)&&(i.blendEquation(i.FUNC_ADD),_=Mn,C=Mn),qe)switch(D){case Yn:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case ro:i.blendFunc(i.ONE,i.ONE);break;case oo:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case ao:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}else switch(D){case Yn:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case ro:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case oo:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case ao:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}w=null,P=null,T=null,H=null,y.set(0,0,0),E=0,v=D,N=qe}return}Me=Me||re,Xe=Xe||le,je=je||Le,(re!==_||Me!==C)&&(i.blendEquationSeparate(be[re],be[Me]),_=re,C=Me),(le!==w||Le!==P||Xe!==T||je!==H)&&(i.blendFuncSeparate(Re[le],Re[Le],Re[Xe],Re[je]),w=le,P=Le,T=Xe,H=je),(nt.equals(y)===!1||st!==E)&&(i.blendColor(nt.r,nt.g,nt.b,st),y.copy(nt),E=st),v=D,N=!1}function Ke(D,re){D.side===Bt?ve(i.CULL_FACE):Te(i.CULL_FACE);let le=D.side===Rt;re&&(le=!le),Ae(le),D.blending===Yn&&D.transparent===!1?_e(dn):_e(D.blending,D.blendEquation,D.blendSrc,D.blendDst,D.blendEquationAlpha,D.blendSrcAlpha,D.blendDstAlpha,D.blendColor,D.blendAlpha,D.premultipliedAlpha),l.setFunc(D.depthFunc),l.setTest(D.depthTest),l.setMask(D.depthWrite),o.setMask(D.colorWrite);const Le=D.stencilWrite;c.setTest(Le),Le&&(c.setMask(D.stencilWriteMask),c.setFunc(D.stencilFunc,D.stencilRef,D.stencilFuncMask),c.setOp(D.stencilFail,D.stencilZFail,D.stencilZPass)),k(D.polygonOffset,D.polygonOffsetFactor,D.polygonOffsetUnits),D.alphaToCoverage===!0?Te(i.SAMPLE_ALPHA_TO_COVERAGE):ve(i.SAMPLE_ALPHA_TO_COVERAGE)}function Ae(D){G!==D&&(D?i.frontFace(i.CW):i.frontFace(i.CCW),G=D)}function M(D){D!==lc?(Te(i.CULL_FACE),D!==J&&(D===io?i.cullFace(i.BACK):D===cc?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):ve(i.CULL_FACE),J=D}function b(D){D!==R&&(q&&i.lineWidth(D),R=D)}function k(D,re,le){D?(Te(i.POLYGON_OFFSET_FILL),(U!==re||B!==le)&&(i.polygonOffset(re,le),U=re,B=le)):ve(i.POLYGON_OFFSET_FILL)}function te(D){D?Te(i.SCISSOR_TEST):ve(i.SCISSOR_TEST)}function O(D){D===void 0&&(D=i.TEXTURE0+$-1),ee!==D&&(i.activeTexture(D),ee=D)}function Y(D,re,le){le===void 0&&(ee===null?le=i.TEXTURE0+$-1:le=ee);let Le=ae[le];Le===void 0&&(Le={type:void 0,texture:void 0},ae[le]=Le),(Le.type!==D||Le.texture!==re)&&(ee!==le&&(i.activeTexture(le),ee=le),i.bindTexture(D,re||we[D]),Le.type=D,Le.texture=re)}function ge(){const D=ae[ee];D!==void 0&&D.type!==void 0&&(i.bindTexture(D.type,null),D.type=void 0,D.texture=void 0)}function ce(){try{i.compressedTexImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function me(){try{i.compressedTexImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Ce(){try{i.texSubImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Oe(){try{i.texSubImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ne(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function $e(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ze(){try{i.texStorage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function De(){try{i.texStorage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Ee(){try{i.texImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ue(){try{i.texImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function A(D){Z.equals(D)===!1&&(i.scissor(D.x,D.y,D.z,D.w),Z.copy(D))}function se(D){he.equals(D)===!1&&(i.viewport(D.x,D.y,D.z,D.w),he.copy(D))}function ye(D,re){let le=d.get(re);le===void 0&&(le=new WeakMap,d.set(re,le));let Le=le.get(D);Le===void 0&&(Le=i.getUniformBlockIndex(re,D.name),le.set(D,Le))}function pe(D,re){const Le=d.get(re).get(D);h.get(re)!==Le&&(i.uniformBlockBinding(re,Le,D.__bindingPointIndex),h.set(re,Le))}function ie(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),n===!0&&(i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null)),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),f={},ee=null,ae={},u={},g=new WeakMap,x=[],m=null,p=!1,v=null,_=null,w=null,P=null,C=null,T=null,H=null,y=new Ue(0,0,0),E=0,N=!1,G=null,J=null,R=null,U=null,B=null,Z.set(0,0,i.canvas.width,i.canvas.height),he.set(0,0,i.canvas.width,i.canvas.height),o.reset(),l.reset(),c.reset()}return{buffers:{color:o,depth:l,stencil:c},enable:Te,disable:ve,bindFramebuffer:ke,drawBuffers:z,useProgram:at,setBlending:_e,setMaterial:Ke,setFlipSided:Ae,setCullFace:M,setLineWidth:b,setPolygonOffset:k,setScissorTest:te,activeTexture:O,bindTexture:Y,unbindTexture:ge,compressedTexImage2D:ce,compressedTexImage3D:me,texImage2D:Ee,texImage3D:ue,updateUBOMapping:ye,uniformBlockBinding:pe,texStorage2D:ze,texStorage3D:De,texSubImage2D:Ce,texSubImage3D:Oe,compressedTexSubImage2D:ne,compressedTexSubImage3D:$e,scissor:A,viewport:se,reset:ie}}function zp(i,e,t,n,s,r,a){const o=s.isWebGL2,l=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),h=new WeakMap;let d;const f=new WeakMap;let u=!1;try{u=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(M,b){return u?new OffscreenCanvas(M,b):es("canvas")}function x(M,b,k,te){let O=1;if((M.width>te||M.height>te)&&(O=te/Math.max(M.width,M.height)),O<1||b===!0)if(typeof HTMLImageElement<"u"&&M instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&M instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&M instanceof ImageBitmap){const Y=b?Qi:Math.floor,ge=Y(O*M.width),ce=Y(O*M.height);d===void 0&&(d=g(ge,ce));const me=k?g(ge,ce):d;return me.width=ge,me.height=ce,me.getContext("2d").drawImage(M,0,0,ge,ce),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+M.width+"x"+M.height+") to ("+ge+"x"+ce+")."),me}else return"data"in M&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+M.width+"x"+M.height+")."),M;return M}function m(M){return ir(M.width)&&ir(M.height)}function p(M){return o?!1:M.wrapS!==Vt||M.wrapT!==Vt||M.minFilter!==Et&&M.minFilter!==kt}function v(M,b){return M.generateMipmaps&&b&&M.minFilter!==Et&&M.minFilter!==kt}function _(M){i.generateMipmap(M)}function w(M,b,k,te,O=!1){if(o===!1)return b;if(M!==null){if(i[M]!==void 0)return i[M];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+M+"'")}let Y=b;if(b===i.RED&&(k===i.FLOAT&&(Y=i.R32F),k===i.HALF_FLOAT&&(Y=i.R16F),k===i.UNSIGNED_BYTE&&(Y=i.R8)),b===i.RED_INTEGER&&(k===i.UNSIGNED_BYTE&&(Y=i.R8UI),k===i.UNSIGNED_SHORT&&(Y=i.R16UI),k===i.UNSIGNED_INT&&(Y=i.R32UI),k===i.BYTE&&(Y=i.R8I),k===i.SHORT&&(Y=i.R16I),k===i.INT&&(Y=i.R32I)),b===i.RG&&(k===i.FLOAT&&(Y=i.RG32F),k===i.HALF_FLOAT&&(Y=i.RG16F),k===i.UNSIGNED_BYTE&&(Y=i.RG8)),b===i.RGBA){const ge=O?Yi:Ye.getTransfer(te);k===i.FLOAT&&(Y=i.RGBA32F),k===i.HALF_FLOAT&&(Y=i.RGBA16F),k===i.UNSIGNED_BYTE&&(Y=ge===Ze?i.SRGB8_ALPHA8:i.RGBA8),k===i.UNSIGNED_SHORT_4_4_4_4&&(Y=i.RGBA4),k===i.UNSIGNED_SHORT_5_5_5_1&&(Y=i.RGB5_A1)}return(Y===i.R16F||Y===i.R32F||Y===i.RG16F||Y===i.RG32F||Y===i.RGBA16F||Y===i.RGBA32F)&&e.get("EXT_color_buffer_float"),Y}function P(M,b,k){return v(M,k)===!0||M.isFramebufferTexture&&M.minFilter!==Et&&M.minFilter!==kt?Math.log2(Math.max(b.width,b.height))+1:M.mipmaps!==void 0&&M.mipmaps.length>0?M.mipmaps.length:M.isCompressedTexture&&Array.isArray(M.image)?b.mipmaps.length:1}function C(M){return M===Et||M===uo||M===qs?i.NEAREST:i.LINEAR}function T(M){const b=M.target;b.removeEventListener("dispose",T),y(b),b.isVideoTexture&&h.delete(b)}function H(M){const b=M.target;b.removeEventListener("dispose",H),N(b)}function y(M){const b=n.get(M);if(b.__webglInit===void 0)return;const k=M.source,te=f.get(k);if(te){const O=te[b.__cacheKey];O.usedTimes--,O.usedTimes===0&&E(M),Object.keys(te).length===0&&f.delete(k)}n.remove(M)}function E(M){const b=n.get(M);i.deleteTexture(b.__webglTexture);const k=M.source,te=f.get(k);delete te[b.__cacheKey],a.memory.textures--}function N(M){const b=M.texture,k=n.get(M),te=n.get(b);if(te.__webglTexture!==void 0&&(i.deleteTexture(te.__webglTexture),a.memory.textures--),M.depthTexture&&M.depthTexture.dispose(),M.isWebGLCubeRenderTarget)for(let O=0;O<6;O++){if(Array.isArray(k.__webglFramebuffer[O]))for(let Y=0;Y<k.__webglFramebuffer[O].length;Y++)i.deleteFramebuffer(k.__webglFramebuffer[O][Y]);else i.deleteFramebuffer(k.__webglFramebuffer[O]);k.__webglDepthbuffer&&i.deleteRenderbuffer(k.__webglDepthbuffer[O])}else{if(Array.isArray(k.__webglFramebuffer))for(let O=0;O<k.__webglFramebuffer.length;O++)i.deleteFramebuffer(k.__webglFramebuffer[O]);else i.deleteFramebuffer(k.__webglFramebuffer);if(k.__webglDepthbuffer&&i.deleteRenderbuffer(k.__webglDepthbuffer),k.__webglMultisampledFramebuffer&&i.deleteFramebuffer(k.__webglMultisampledFramebuffer),k.__webglColorRenderbuffer)for(let O=0;O<k.__webglColorRenderbuffer.length;O++)k.__webglColorRenderbuffer[O]&&i.deleteRenderbuffer(k.__webglColorRenderbuffer[O]);k.__webglDepthRenderbuffer&&i.deleteRenderbuffer(k.__webglDepthRenderbuffer)}if(M.isWebGLMultipleRenderTargets)for(let O=0,Y=b.length;O<Y;O++){const ge=n.get(b[O]);ge.__webglTexture&&(i.deleteTexture(ge.__webglTexture),a.memory.textures--),n.remove(b[O])}n.remove(b),n.remove(M)}let G=0;function J(){G=0}function R(){const M=G;return M>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+M+" texture units while this GPU supports only "+s.maxTextures),G+=1,M}function U(M){const b=[];return b.push(M.wrapS),b.push(M.wrapT),b.push(M.wrapR||0),b.push(M.magFilter),b.push(M.minFilter),b.push(M.anisotropy),b.push(M.internalFormat),b.push(M.format),b.push(M.type),b.push(M.generateMipmaps),b.push(M.premultiplyAlpha),b.push(M.flipY),b.push(M.unpackAlignment),b.push(M.colorSpace),b.join()}function B(M,b){const k=n.get(M);if(M.isVideoTexture&&Ke(M),M.isRenderTargetTexture===!1&&M.version>0&&k.__version!==M.version){const te=M.image;if(te===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(te.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Z(k,M,b);return}}t.bindTexture(i.TEXTURE_2D,k.__webglTexture,i.TEXTURE0+b)}function $(M,b){const k=n.get(M);if(M.version>0&&k.__version!==M.version){Z(k,M,b);return}t.bindTexture(i.TEXTURE_2D_ARRAY,k.__webglTexture,i.TEXTURE0+b)}function q(M,b){const k=n.get(M);if(M.version>0&&k.__version!==M.version){Z(k,M,b);return}t.bindTexture(i.TEXTURE_3D,k.__webglTexture,i.TEXTURE0+b)}function K(M,b){const k=n.get(M);if(M.version>0&&k.__version!==M.version){he(k,M,b);return}t.bindTexture(i.TEXTURE_CUBE_MAP,k.__webglTexture,i.TEXTURE0+b)}const Q={[Xs]:i.REPEAT,[Vt]:i.CLAMP_TO_EDGE,[js]:i.MIRRORED_REPEAT},ee={[Et]:i.NEAREST,[uo]:i.NEAREST_MIPMAP_NEAREST,[qs]:i.NEAREST_MIPMAP_LINEAR,[kt]:i.LINEAR,[Gc]:i.LINEAR_MIPMAP_NEAREST,[Ri]:i.LINEAR_MIPMAP_LINEAR},ae={[eh]:i.NEVER,[oh]:i.ALWAYS,[th]:i.LESS,[$o]:i.LEQUAL,[nh]:i.EQUAL,[rh]:i.GEQUAL,[ih]:i.GREATER,[sh]:i.NOTEQUAL};function X(M,b,k){if(k?(i.texParameteri(M,i.TEXTURE_WRAP_S,Q[b.wrapS]),i.texParameteri(M,i.TEXTURE_WRAP_T,Q[b.wrapT]),(M===i.TEXTURE_3D||M===i.TEXTURE_2D_ARRAY)&&i.texParameteri(M,i.TEXTURE_WRAP_R,Q[b.wrapR]),i.texParameteri(M,i.TEXTURE_MAG_FILTER,ee[b.magFilter]),i.texParameteri(M,i.TEXTURE_MIN_FILTER,ee[b.minFilter])):(i.texParameteri(M,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(M,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE),(M===i.TEXTURE_3D||M===i.TEXTURE_2D_ARRAY)&&i.texParameteri(M,i.TEXTURE_WRAP_R,i.CLAMP_TO_EDGE),(b.wrapS!==Vt||b.wrapT!==Vt)&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."),i.texParameteri(M,i.TEXTURE_MAG_FILTER,C(b.magFilter)),i.texParameteri(M,i.TEXTURE_MIN_FILTER,C(b.minFilter)),b.minFilter!==Et&&b.minFilter!==kt&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")),b.compareFunction&&(i.texParameteri(M,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(M,i.TEXTURE_COMPARE_FUNC,ae[b.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){const te=e.get("EXT_texture_filter_anisotropic");if(b.magFilter===Et||b.minFilter!==qs&&b.minFilter!==Ri||b.type===mn&&e.has("OES_texture_float_linear")===!1||o===!1&&b.type===Li&&e.has("OES_texture_half_float_linear")===!1)return;(b.anisotropy>1||n.get(b).__currentAnisotropy)&&(i.texParameterf(M,te.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(b.anisotropy,s.getMaxAnisotropy())),n.get(b).__currentAnisotropy=b.anisotropy)}}function I(M,b){let k=!1;M.__webglInit===void 0&&(M.__webglInit=!0,b.addEventListener("dispose",T));const te=b.source;let O=f.get(te);O===void 0&&(O={},f.set(te,O));const Y=U(b);if(Y!==M.__cacheKey){O[Y]===void 0&&(O[Y]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,k=!0),O[Y].usedTimes++;const ge=O[M.__cacheKey];ge!==void 0&&(O[M.__cacheKey].usedTimes--,ge.usedTimes===0&&E(b)),M.__cacheKey=Y,M.__webglTexture=O[Y].texture}return k}function Z(M,b,k){let te=i.TEXTURE_2D;(b.isDataArrayTexture||b.isCompressedArrayTexture)&&(te=i.TEXTURE_2D_ARRAY),b.isData3DTexture&&(te=i.TEXTURE_3D);const O=I(M,b),Y=b.source;t.bindTexture(te,M.__webglTexture,i.TEXTURE0+k);const ge=n.get(Y);if(Y.version!==ge.__version||O===!0){t.activeTexture(i.TEXTURE0+k);const ce=Ye.getPrimaries(Ye.workingColorSpace),me=b.colorSpace===zt?null:Ye.getPrimaries(b.colorSpace),Ce=b.colorSpace===zt||ce===me?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,b.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,b.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ce);const Oe=p(b)&&m(b.image)===!1;let ne=x(b.image,Oe,!1,s.maxTextureSize);ne=Ae(b,ne);const $e=m(ne)||o,ze=r.convert(b.format,b.colorSpace);let De=r.convert(b.type),Ee=w(b.internalFormat,ze,De,b.colorSpace,b.isVideoTexture);X(te,b,$e);let ue;const A=b.mipmaps,se=o&&b.isVideoTexture!==!0&&Ee!==Eo,ye=ge.__version===void 0||O===!0,pe=P(b,ne,$e);if(b.isDepthTexture)Ee=i.DEPTH_COMPONENT,o?b.type===mn?Ee=i.DEPTH_COMPONENT32F:b.type===pn?Ee=i.DEPTH_COMPONENT24:b.type===wn?Ee=i.DEPTH24_STENCIL8:Ee=i.DEPTH_COMPONENT16:b.type===mn&&console.error("WebGLRenderer: Floating point depth texture requires WebGL2."),b.format===Tn&&Ee===i.DEPTH_COMPONENT&&b.type!==$s&&b.type!==pn&&(console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."),b.type=pn,De=r.convert(b.type)),b.format===Zn&&Ee===i.DEPTH_COMPONENT&&(Ee=i.DEPTH_STENCIL,b.type!==wn&&(console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."),b.type=wn,De=r.convert(b.type))),ye&&(se?t.texStorage2D(i.TEXTURE_2D,1,Ee,ne.width,ne.height):t.texImage2D(i.TEXTURE_2D,0,Ee,ne.width,ne.height,0,ze,De,null));else if(b.isDataTexture)if(A.length>0&&$e){se&&ye&&t.texStorage2D(i.TEXTURE_2D,pe,Ee,A[0].width,A[0].height);for(let ie=0,D=A.length;ie<D;ie++)ue=A[ie],se?t.texSubImage2D(i.TEXTURE_2D,ie,0,0,ue.width,ue.height,ze,De,ue.data):t.texImage2D(i.TEXTURE_2D,ie,Ee,ue.width,ue.height,0,ze,De,ue.data);b.generateMipmaps=!1}else se?(ye&&t.texStorage2D(i.TEXTURE_2D,pe,Ee,ne.width,ne.height),t.texSubImage2D(i.TEXTURE_2D,0,0,0,ne.width,ne.height,ze,De,ne.data)):t.texImage2D(i.TEXTURE_2D,0,Ee,ne.width,ne.height,0,ze,De,ne.data);else if(b.isCompressedTexture)if(b.isCompressedArrayTexture){se&&ye&&t.texStorage3D(i.TEXTURE_2D_ARRAY,pe,Ee,A[0].width,A[0].height,ne.depth);for(let ie=0,D=A.length;ie<D;ie++)ue=A[ie],b.format!==Wt?ze!==null?se?t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ie,0,0,0,ue.width,ue.height,ne.depth,ze,ue.data,0,0):t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,ie,Ee,ue.width,ue.height,ne.depth,0,ue.data,0,0):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):se?t.texSubImage3D(i.TEXTURE_2D_ARRAY,ie,0,0,0,ue.width,ue.height,ne.depth,ze,De,ue.data):t.texImage3D(i.TEXTURE_2D_ARRAY,ie,Ee,ue.width,ue.height,ne.depth,0,ze,De,ue.data)}else{se&&ye&&t.texStorage2D(i.TEXTURE_2D,pe,Ee,A[0].width,A[0].height);for(let ie=0,D=A.length;ie<D;ie++)ue=A[ie],b.format!==Wt?ze!==null?se?t.compressedTexSubImage2D(i.TEXTURE_2D,ie,0,0,ue.width,ue.height,ze,ue.data):t.compressedTexImage2D(i.TEXTURE_2D,ie,Ee,ue.width,ue.height,0,ue.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):se?t.texSubImage2D(i.TEXTURE_2D,ie,0,0,ue.width,ue.height,ze,De,ue.data):t.texImage2D(i.TEXTURE_2D,ie,Ee,ue.width,ue.height,0,ze,De,ue.data)}else if(b.isDataArrayTexture)se?(ye&&t.texStorage3D(i.TEXTURE_2D_ARRAY,pe,Ee,ne.width,ne.height,ne.depth),t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ne.width,ne.height,ne.depth,ze,De,ne.data)):t.texImage3D(i.TEXTURE_2D_ARRAY,0,Ee,ne.width,ne.height,ne.depth,0,ze,De,ne.data);else if(b.isData3DTexture)se?(ye&&t.texStorage3D(i.TEXTURE_3D,pe,Ee,ne.width,ne.height,ne.depth),t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ne.width,ne.height,ne.depth,ze,De,ne.data)):t.texImage3D(i.TEXTURE_3D,0,Ee,ne.width,ne.height,ne.depth,0,ze,De,ne.data);else if(b.isFramebufferTexture){if(ye)if(se)t.texStorage2D(i.TEXTURE_2D,pe,Ee,ne.width,ne.height);else{let ie=ne.width,D=ne.height;for(let re=0;re<pe;re++)t.texImage2D(i.TEXTURE_2D,re,Ee,ie,D,0,ze,De,null),ie>>=1,D>>=1}}else if(A.length>0&&$e){se&&ye&&t.texStorage2D(i.TEXTURE_2D,pe,Ee,A[0].width,A[0].height);for(let ie=0,D=A.length;ie<D;ie++)ue=A[ie],se?t.texSubImage2D(i.TEXTURE_2D,ie,0,0,ze,De,ue):t.texImage2D(i.TEXTURE_2D,ie,Ee,ze,De,ue);b.generateMipmaps=!1}else se?(ye&&t.texStorage2D(i.TEXTURE_2D,pe,Ee,ne.width,ne.height),t.texSubImage2D(i.TEXTURE_2D,0,0,0,ze,De,ne)):t.texImage2D(i.TEXTURE_2D,0,Ee,ze,De,ne);v(b,$e)&&_(te),ge.__version=Y.version,b.onUpdate&&b.onUpdate(b)}M.__version=b.version}function he(M,b,k){if(b.image.length!==6)return;const te=I(M,b),O=b.source;t.bindTexture(i.TEXTURE_CUBE_MAP,M.__webglTexture,i.TEXTURE0+k);const Y=n.get(O);if(O.version!==Y.__version||te===!0){t.activeTexture(i.TEXTURE0+k);const ge=Ye.getPrimaries(Ye.workingColorSpace),ce=b.colorSpace===zt?null:Ye.getPrimaries(b.colorSpace),me=b.colorSpace===zt||ge===ce?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,b.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,b.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,me);const Ce=b.isCompressedTexture||b.image[0].isCompressedTexture,Oe=b.image[0]&&b.image[0].isDataTexture,ne=[];for(let ie=0;ie<6;ie++)!Ce&&!Oe?ne[ie]=x(b.image[ie],!1,!0,s.maxCubemapSize):ne[ie]=Oe?b.image[ie].image:b.image[ie],ne[ie]=Ae(b,ne[ie]);const $e=ne[0],ze=m($e)||o,De=r.convert(b.format,b.colorSpace),Ee=r.convert(b.type),ue=w(b.internalFormat,De,Ee,b.colorSpace),A=o&&b.isVideoTexture!==!0,se=Y.__version===void 0||te===!0;let ye=P(b,$e,ze);X(i.TEXTURE_CUBE_MAP,b,ze);let pe;if(Ce){A&&se&&t.texStorage2D(i.TEXTURE_CUBE_MAP,ye,ue,$e.width,$e.height);for(let ie=0;ie<6;ie++){pe=ne[ie].mipmaps;for(let D=0;D<pe.length;D++){const re=pe[D];b.format!==Wt?De!==null?A?t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,D,0,0,re.width,re.height,De,re.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,D,ue,re.width,re.height,0,re.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):A?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,D,0,0,re.width,re.height,De,Ee,re.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,D,ue,re.width,re.height,0,De,Ee,re.data)}}}else{pe=b.mipmaps,A&&se&&(pe.length>0&&ye++,t.texStorage2D(i.TEXTURE_CUBE_MAP,ye,ue,ne[0].width,ne[0].height));for(let ie=0;ie<6;ie++)if(Oe){A?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,0,0,ne[ie].width,ne[ie].height,De,Ee,ne[ie].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,ue,ne[ie].width,ne[ie].height,0,De,Ee,ne[ie].data);for(let D=0;D<pe.length;D++){const le=pe[D].image[ie].image;A?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,D+1,0,0,le.width,le.height,De,Ee,le.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,D+1,ue,le.width,le.height,0,De,Ee,le.data)}}else{A?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,0,0,De,Ee,ne[ie]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,ue,De,Ee,ne[ie]);for(let D=0;D<pe.length;D++){const re=pe[D];A?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,D+1,0,0,De,Ee,re.image[ie]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,D+1,ue,De,Ee,re.image[ie])}}}v(b,ze)&&_(i.TEXTURE_CUBE_MAP),Y.__version=O.version,b.onUpdate&&b.onUpdate(b)}M.__version=b.version}function de(M,b,k,te,O,Y){const ge=r.convert(k.format,k.colorSpace),ce=r.convert(k.type),me=w(k.internalFormat,ge,ce,k.colorSpace);if(!n.get(b).__hasExternalTextures){const Oe=Math.max(1,b.width>>Y),ne=Math.max(1,b.height>>Y);O===i.TEXTURE_3D||O===i.TEXTURE_2D_ARRAY?t.texImage3D(O,Y,me,Oe,ne,b.depth,0,ge,ce,null):t.texImage2D(O,Y,me,Oe,ne,0,ge,ce,null)}t.bindFramebuffer(i.FRAMEBUFFER,M),_e(b)?l.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,te,O,n.get(k).__webglTexture,0,Re(b)):(O===i.TEXTURE_2D||O>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&O<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,te,O,n.get(k).__webglTexture,Y),t.bindFramebuffer(i.FRAMEBUFFER,null)}function we(M,b,k){if(i.bindRenderbuffer(i.RENDERBUFFER,M),b.depthBuffer&&!b.stencilBuffer){let te=o===!0?i.DEPTH_COMPONENT24:i.DEPTH_COMPONENT16;if(k||_e(b)){const O=b.depthTexture;O&&O.isDepthTexture&&(O.type===mn?te=i.DEPTH_COMPONENT32F:O.type===pn&&(te=i.DEPTH_COMPONENT24));const Y=Re(b);_e(b)?l.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Y,te,b.width,b.height):i.renderbufferStorageMultisample(i.RENDERBUFFER,Y,te,b.width,b.height)}else i.renderbufferStorage(i.RENDERBUFFER,te,b.width,b.height);i.framebufferRenderbuffer(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.RENDERBUFFER,M)}else if(b.depthBuffer&&b.stencilBuffer){const te=Re(b);k&&_e(b)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,te,i.DEPTH24_STENCIL8,b.width,b.height):_e(b)?l.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,te,i.DEPTH24_STENCIL8,b.width,b.height):i.renderbufferStorage(i.RENDERBUFFER,i.DEPTH_STENCIL,b.width,b.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.RENDERBUFFER,M)}else{const te=b.isWebGLMultipleRenderTargets===!0?b.texture:[b.texture];for(let O=0;O<te.length;O++){const Y=te[O],ge=r.convert(Y.format,Y.colorSpace),ce=r.convert(Y.type),me=w(Y.internalFormat,ge,ce,Y.colorSpace),Ce=Re(b);k&&_e(b)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Ce,me,b.width,b.height):_e(b)?l.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Ce,me,b.width,b.height):i.renderbufferStorage(i.RENDERBUFFER,me,b.width,b.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Te(M,b){if(b&&b.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,M),!(b.depthTexture&&b.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!n.get(b.depthTexture).__webglTexture||b.depthTexture.image.width!==b.width||b.depthTexture.image.height!==b.height)&&(b.depthTexture.image.width=b.width,b.depthTexture.image.height=b.height,b.depthTexture.needsUpdate=!0),B(b.depthTexture,0);const te=n.get(b.depthTexture).__webglTexture,O=Re(b);if(b.depthTexture.format===Tn)_e(b)?l.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,te,0,O):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,te,0);else if(b.depthTexture.format===Zn)_e(b)?l.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,te,0,O):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,te,0);else throw new Error("Unknown depthTexture format")}function ve(M){const b=n.get(M),k=M.isWebGLCubeRenderTarget===!0;if(M.depthTexture&&!b.__autoAllocateDepthBuffer){if(k)throw new Error("target.depthTexture not supported in Cube render targets");Te(b.__webglFramebuffer,M)}else if(k){b.__webglDepthbuffer=[];for(let te=0;te<6;te++)t.bindFramebuffer(i.FRAMEBUFFER,b.__webglFramebuffer[te]),b.__webglDepthbuffer[te]=i.createRenderbuffer(),we(b.__webglDepthbuffer[te],M,!1)}else t.bindFramebuffer(i.FRAMEBUFFER,b.__webglFramebuffer),b.__webglDepthbuffer=i.createRenderbuffer(),we(b.__webglDepthbuffer,M,!1);t.bindFramebuffer(i.FRAMEBUFFER,null)}function ke(M,b,k){const te=n.get(M);b!==void 0&&de(te.__webglFramebuffer,M,M.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),k!==void 0&&ve(M)}function z(M){const b=M.texture,k=n.get(M),te=n.get(b);M.addEventListener("dispose",H),M.isWebGLMultipleRenderTargets!==!0&&(te.__webglTexture===void 0&&(te.__webglTexture=i.createTexture()),te.__version=b.version,a.memory.textures++);const O=M.isWebGLCubeRenderTarget===!0,Y=M.isWebGLMultipleRenderTargets===!0,ge=m(M)||o;if(O){k.__webglFramebuffer=[];for(let ce=0;ce<6;ce++)if(o&&b.mipmaps&&b.mipmaps.length>0){k.__webglFramebuffer[ce]=[];for(let me=0;me<b.mipmaps.length;me++)k.__webglFramebuffer[ce][me]=i.createFramebuffer()}else k.__webglFramebuffer[ce]=i.createFramebuffer()}else{if(o&&b.mipmaps&&b.mipmaps.length>0){k.__webglFramebuffer=[];for(let ce=0;ce<b.mipmaps.length;ce++)k.__webglFramebuffer[ce]=i.createFramebuffer()}else k.__webglFramebuffer=i.createFramebuffer();if(Y)if(s.drawBuffers){const ce=M.texture;for(let me=0,Ce=ce.length;me<Ce;me++){const Oe=n.get(ce[me]);Oe.__webglTexture===void 0&&(Oe.__webglTexture=i.createTexture(),a.memory.textures++)}}else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");if(o&&M.samples>0&&_e(M)===!1){const ce=Y?b:[b];k.__webglMultisampledFramebuffer=i.createFramebuffer(),k.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,k.__webglMultisampledFramebuffer);for(let me=0;me<ce.length;me++){const Ce=ce[me];k.__webglColorRenderbuffer[me]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,k.__webglColorRenderbuffer[me]);const Oe=r.convert(Ce.format,Ce.colorSpace),ne=r.convert(Ce.type),$e=w(Ce.internalFormat,Oe,ne,Ce.colorSpace,M.isXRRenderTarget===!0),ze=Re(M);i.renderbufferStorageMultisample(i.RENDERBUFFER,ze,$e,M.width,M.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+me,i.RENDERBUFFER,k.__webglColorRenderbuffer[me])}i.bindRenderbuffer(i.RENDERBUFFER,null),M.depthBuffer&&(k.__webglDepthRenderbuffer=i.createRenderbuffer(),we(k.__webglDepthRenderbuffer,M,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(O){t.bindTexture(i.TEXTURE_CUBE_MAP,te.__webglTexture),X(i.TEXTURE_CUBE_MAP,b,ge);for(let ce=0;ce<6;ce++)if(o&&b.mipmaps&&b.mipmaps.length>0)for(let me=0;me<b.mipmaps.length;me++)de(k.__webglFramebuffer[ce][me],M,b,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,me);else de(k.__webglFramebuffer[ce],M,b,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,0);v(b,ge)&&_(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Y){const ce=M.texture;for(let me=0,Ce=ce.length;me<Ce;me++){const Oe=ce[me],ne=n.get(Oe);t.bindTexture(i.TEXTURE_2D,ne.__webglTexture),X(i.TEXTURE_2D,Oe,ge),de(k.__webglFramebuffer,M,Oe,i.COLOR_ATTACHMENT0+me,i.TEXTURE_2D,0),v(Oe,ge)&&_(i.TEXTURE_2D)}t.unbindTexture()}else{let ce=i.TEXTURE_2D;if((M.isWebGL3DRenderTarget||M.isWebGLArrayRenderTarget)&&(o?ce=M.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY:console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")),t.bindTexture(ce,te.__webglTexture),X(ce,b,ge),o&&b.mipmaps&&b.mipmaps.length>0)for(let me=0;me<b.mipmaps.length;me++)de(k.__webglFramebuffer[me],M,b,i.COLOR_ATTACHMENT0,ce,me);else de(k.__webglFramebuffer,M,b,i.COLOR_ATTACHMENT0,ce,0);v(b,ge)&&_(ce),t.unbindTexture()}M.depthBuffer&&ve(M)}function at(M){const b=m(M)||o,k=M.isWebGLMultipleRenderTargets===!0?M.texture:[M.texture];for(let te=0,O=k.length;te<O;te++){const Y=k[te];if(v(Y,b)){const ge=M.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:i.TEXTURE_2D,ce=n.get(Y).__webglTexture;t.bindTexture(ge,ce),_(ge),t.unbindTexture()}}}function be(M){if(o&&M.samples>0&&_e(M)===!1){const b=M.isWebGLMultipleRenderTargets?M.texture:[M.texture],k=M.width,te=M.height;let O=i.COLOR_BUFFER_BIT;const Y=[],ge=M.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ce=n.get(M),me=M.isWebGLMultipleRenderTargets===!0;if(me)for(let Ce=0;Ce<b.length;Ce++)t.bindFramebuffer(i.FRAMEBUFFER,ce.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ce,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,ce.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ce,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,ce.__webglMultisampledFramebuffer),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ce.__webglFramebuffer);for(let Ce=0;Ce<b.length;Ce++){Y.push(i.COLOR_ATTACHMENT0+Ce),M.depthBuffer&&Y.push(ge);const Oe=ce.__ignoreDepthValues!==void 0?ce.__ignoreDepthValues:!1;if(Oe===!1&&(M.depthBuffer&&(O|=i.DEPTH_BUFFER_BIT),M.stencilBuffer&&(O|=i.STENCIL_BUFFER_BIT)),me&&i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,ce.__webglColorRenderbuffer[Ce]),Oe===!0&&(i.invalidateFramebuffer(i.READ_FRAMEBUFFER,[ge]),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[ge])),me){const ne=n.get(b[Ce]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,ne,0)}i.blitFramebuffer(0,0,k,te,0,0,k,te,O,i.NEAREST),c&&i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Y)}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),me)for(let Ce=0;Ce<b.length;Ce++){t.bindFramebuffer(i.FRAMEBUFFER,ce.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ce,i.RENDERBUFFER,ce.__webglColorRenderbuffer[Ce]);const Oe=n.get(b[Ce]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,ce.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ce,i.TEXTURE_2D,Oe,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ce.__webglMultisampledFramebuffer)}}function Re(M){return Math.min(s.maxSamples,M.samples)}function _e(M){const b=n.get(M);return o&&M.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&b.__useRenderToTexture!==!1}function Ke(M){const b=a.render.frame;h.get(M)!==b&&(h.set(M,b),M.update())}function Ae(M,b){const k=M.colorSpace,te=M.format,O=M.type;return M.isCompressedTexture===!0||M.isVideoTexture===!0||M.format===tr||k!==Zt&&k!==zt&&(Ye.getTransfer(k)===Ze?o===!1?e.has("EXT_sRGB")===!0&&te===Wt?(M.format=tr,M.minFilter=kt,M.generateMipmaps=!1):b=na.sRGBToLinear(b):(te!==Wt||O!==fn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",k)),b}this.allocateTextureUnit=R,this.resetTextureUnits=J,this.setTexture2D=B,this.setTexture2DArray=$,this.setTexture3D=q,this.setTextureCube=K,this.rebindTextures=ke,this.setupRenderTarget=z,this.updateRenderTargetMipmap=at,this.updateMultisampleRenderTarget=be,this.setupDepthRenderbuffer=ve,this.setupFrameBufferTexture=de,this.useMultisampledRTT=_e}function Hp(i,e,t){const n=t.isWebGL2;function s(r,a=zt){let o;const l=Ye.getTransfer(a);if(r===fn)return i.UNSIGNED_BYTE;if(r===po)return i.UNSIGNED_SHORT_4_4_4_4;if(r===mo)return i.UNSIGNED_SHORT_5_5_5_1;if(r===Vc)return i.BYTE;if(r===Wc)return i.SHORT;if(r===$s)return i.UNSIGNED_SHORT;if(r===fo)return i.INT;if(r===pn)return i.UNSIGNED_INT;if(r===mn)return i.FLOAT;if(r===Li)return n?i.HALF_FLOAT:(o=e.get("OES_texture_half_float"),o!==null?o.HALF_FLOAT_OES:null);if(r===Xc)return i.ALPHA;if(r===Wt)return i.RGBA;if(r===jc)return i.LUMINANCE;if(r===qc)return i.LUMINANCE_ALPHA;if(r===Tn)return i.DEPTH_COMPONENT;if(r===Zn)return i.DEPTH_STENCIL;if(r===tr)return o=e.get("EXT_sRGB"),o!==null?o.SRGB_ALPHA_EXT:null;if(r===$c)return i.RED;if(r===go)return i.RED_INTEGER;if(r===Yc)return i.RG;if(r===xo)return i.RG_INTEGER;if(r===_o)return i.RGBA_INTEGER;if(r===Ys||r===Ks||r===Js||r===Zs)if(l===Ze)if(o=e.get("WEBGL_compressed_texture_s3tc_srgb"),o!==null){if(r===Ys)return o.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(r===Ks)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(r===Js)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(r===Zs)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(o=e.get("WEBGL_compressed_texture_s3tc"),o!==null){if(r===Ys)return o.COMPRESSED_RGB_S3TC_DXT1_EXT;if(r===Ks)return o.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(r===Js)return o.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(r===Zs)return o.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(r===vo||r===yo||r===bo||r===So)if(o=e.get("WEBGL_compressed_texture_pvrtc"),o!==null){if(r===vo)return o.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(r===yo)return o.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(r===bo)return o.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(r===So)return o.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(r===Eo)return o=e.get("WEBGL_compressed_texture_etc1"),o!==null?o.COMPRESSED_RGB_ETC1_WEBGL:null;if(r===Mo||r===wo)if(o=e.get("WEBGL_compressed_texture_etc"),o!==null){if(r===Mo)return l===Ze?o.COMPRESSED_SRGB8_ETC2:o.COMPRESSED_RGB8_ETC2;if(r===wo)return l===Ze?o.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:o.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(r===To||r===Ao||r===Co||r===Ro||r===Lo||r===Po||r===Do||r===Io||r===Uo||r===No||r===Oo||r===Fo||r===Bo||r===ko)if(o=e.get("WEBGL_compressed_texture_astc"),o!==null){if(r===To)return l===Ze?o.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:o.COMPRESSED_RGBA_ASTC_4x4_KHR;if(r===Ao)return l===Ze?o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:o.COMPRESSED_RGBA_ASTC_5x4_KHR;if(r===Co)return l===Ze?o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:o.COMPRESSED_RGBA_ASTC_5x5_KHR;if(r===Ro)return l===Ze?o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:o.COMPRESSED_RGBA_ASTC_6x5_KHR;if(r===Lo)return l===Ze?o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:o.COMPRESSED_RGBA_ASTC_6x6_KHR;if(r===Po)return l===Ze?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:o.COMPRESSED_RGBA_ASTC_8x5_KHR;if(r===Do)return l===Ze?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:o.COMPRESSED_RGBA_ASTC_8x6_KHR;if(r===Io)return l===Ze?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:o.COMPRESSED_RGBA_ASTC_8x8_KHR;if(r===Uo)return l===Ze?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:o.COMPRESSED_RGBA_ASTC_10x5_KHR;if(r===No)return l===Ze?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:o.COMPRESSED_RGBA_ASTC_10x6_KHR;if(r===Oo)return l===Ze?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:o.COMPRESSED_RGBA_ASTC_10x8_KHR;if(r===Fo)return l===Ze?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:o.COMPRESSED_RGBA_ASTC_10x10_KHR;if(r===Bo)return l===Ze?o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:o.COMPRESSED_RGBA_ASTC_12x10_KHR;if(r===ko)return l===Ze?o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:o.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(r===Qs||r===zo||r===Ho)if(o=e.get("EXT_texture_compression_bptc"),o!==null){if(r===Qs)return l===Ze?o.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:o.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(r===zo)return o.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(r===Ho)return o.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(r===Kc||r===Go||r===Vo||r===Wo)if(o=e.get("EXT_texture_compression_rgtc"),o!==null){if(r===Qs)return o.COMPRESSED_RED_RGTC1_EXT;if(r===Go)return o.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(r===Vo)return o.COMPRESSED_RED_GREEN_RGTC2_EXT;if(r===Wo)return o.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return r===wn?n?i.UNSIGNED_INT_24_8:(o=e.get("WEBGL_depth_texture"),o!==null?o.UNSIGNED_INT_24_8_WEBGL:null):i[r]!==void 0?i[r]:null}return{convert:s}}class Gp extends Lt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class kn extends ft{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Vp={type:"move"};class Dr{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new kn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new kn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new L,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new L),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new kn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new L,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new L),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(const x of e.hand.values()){const m=t.getJointPose(x,n),p=this._getHandJoint(c,x);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const h=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],f=h.position.distanceTo(d.position),u=.02,g=.005;c.inputState.pinching&&f>u+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&f<=u-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Vp)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new kn;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}class Wp extends Cn{constructor(e,t){super();const n=this;let s=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,d=null,f=null,u=null,g=null;const x=t.getContextAttributes();let m=null,p=null;const v=[],_=[],w=new xe;let P=null;const C=new Lt;C.layers.enable(1),C.viewport=new ut;const T=new Lt;T.layers.enable(2),T.viewport=new ut;const H=[C,T],y=new Gp;y.layers.enable(1),y.layers.enable(2);let E=null,N=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(X){let I=v[X];return I===void 0&&(I=new Dr,v[X]=I),I.getTargetRaySpace()},this.getControllerGrip=function(X){let I=v[X];return I===void 0&&(I=new Dr,v[X]=I),I.getGripSpace()},this.getHand=function(X){let I=v[X];return I===void 0&&(I=new Dr,v[X]=I),I.getHandSpace()};function G(X){const I=_.indexOf(X.inputSource);if(I===-1)return;const Z=v[I];Z!==void 0&&(Z.update(X.inputSource,X.frame,c||a),Z.dispatchEvent({type:X.type,data:X.inputSource}))}function J(){s.removeEventListener("select",G),s.removeEventListener("selectstart",G),s.removeEventListener("selectend",G),s.removeEventListener("squeeze",G),s.removeEventListener("squeezestart",G),s.removeEventListener("squeezeend",G),s.removeEventListener("end",J),s.removeEventListener("inputsourceschange",R);for(let X=0;X<v.length;X++){const I=_[X];I!==null&&(_[X]=null,v[X].disconnect(I))}E=null,N=null,e.setRenderTarget(m),u=null,f=null,d=null,s=null,p=null,ae.stop(),n.isPresenting=!1,e.setPixelRatio(P),e.setSize(w.width,w.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(X){r=X,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(X){o=X,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(X){c=X},this.getBaseLayer=function(){return f!==null?f:u},this.getBinding=function(){return d},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(X){if(s=X,s!==null){if(m=e.getRenderTarget(),s.addEventListener("select",G),s.addEventListener("selectstart",G),s.addEventListener("selectend",G),s.addEventListener("squeeze",G),s.addEventListener("squeezestart",G),s.addEventListener("squeezeend",G),s.addEventListener("end",J),s.addEventListener("inputsourceschange",R),x.xrCompatible!==!0&&await t.makeXRCompatible(),P=e.getPixelRatio(),e.getSize(w),s.renderState.layers===void 0||e.capabilities.isWebGL2===!1){const I={antialias:s.renderState.layers===void 0?x.antialias:!0,alpha:!0,depth:x.depth,stencil:x.stencil,framebufferScaleFactor:r};u=new XRWebGLLayer(s,t,I),s.updateRenderState({baseLayer:u}),e.setPixelRatio(1),e.setSize(u.framebufferWidth,u.framebufferHeight,!1),p=new Rn(u.framebufferWidth,u.framebufferHeight,{format:Wt,type:fn,colorSpace:e.outputColorSpace,stencilBuffer:x.stencil})}else{let I=null,Z=null,he=null;x.depth&&(he=x.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,I=x.stencil?Zn:Tn,Z=x.stencil?wn:pn);const de={colorFormat:t.RGBA8,depthFormat:he,scaleFactor:r};d=new XRWebGLBinding(s,t),f=d.createProjectionLayer(de),s.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),p=new Rn(f.textureWidth,f.textureHeight,{format:Wt,type:fn,depthTexture:new Ia(f.textureWidth,f.textureHeight,Z,void 0,void 0,void 0,void 0,void 0,void 0,I),stencilBuffer:x.stencil,colorSpace:e.outputColorSpace,samples:x.antialias?4:0});const we=e.properties.get(p);we.__ignoreDepthValues=f.ignoreDepthValues}p.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),ae.setContext(s),ae.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode};function R(X){for(let I=0;I<X.removed.length;I++){const Z=X.removed[I],he=_.indexOf(Z);he>=0&&(_[he]=null,v[he].disconnect(Z))}for(let I=0;I<X.added.length;I++){const Z=X.added[I];let he=_.indexOf(Z);if(he===-1){for(let we=0;we<v.length;we++)if(we>=_.length){_.push(Z),he=we;break}else if(_[we]===null){_[we]=Z,he=we;break}if(he===-1)break}const de=v[he];de&&de.connect(Z)}}const U=new L,B=new L;function $(X,I,Z){U.setFromMatrixPosition(I.matrixWorld),B.setFromMatrixPosition(Z.matrixWorld);const he=U.distanceTo(B),de=I.projectionMatrix.elements,we=Z.projectionMatrix.elements,Te=de[14]/(de[10]-1),ve=de[14]/(de[10]+1),ke=(de[9]+1)/de[5],z=(de[9]-1)/de[5],at=(de[8]-1)/de[0],be=(we[8]+1)/we[0],Re=Te*at,_e=Te*be,Ke=he/(-at+be),Ae=Ke*-at;I.matrixWorld.decompose(X.position,X.quaternion,X.scale),X.translateX(Ae),X.translateZ(Ke),X.matrixWorld.compose(X.position,X.quaternion,X.scale),X.matrixWorldInverse.copy(X.matrixWorld).invert();const M=Te+Ke,b=ve+Ke,k=Re-Ae,te=_e+(he-Ae),O=ke*ve/b*M,Y=z*ve/b*M;X.projectionMatrix.makePerspective(k,te,O,Y,M,b),X.projectionMatrixInverse.copy(X.projectionMatrix).invert()}function q(X,I){I===null?X.matrixWorld.copy(X.matrix):X.matrixWorld.multiplyMatrices(I.matrixWorld,X.matrix),X.matrixWorldInverse.copy(X.matrixWorld).invert()}this.updateCamera=function(X){if(s===null)return;y.near=T.near=C.near=X.near,y.far=T.far=C.far=X.far,(E!==y.near||N!==y.far)&&(s.updateRenderState({depthNear:y.near,depthFar:y.far}),E=y.near,N=y.far);const I=X.parent,Z=y.cameras;q(y,I);for(let he=0;he<Z.length;he++)q(Z[he],I);Z.length===2?$(y,C,T):y.projectionMatrix.copy(C.projectionMatrix),K(X,y,I)};function K(X,I,Z){Z===null?X.matrix.copy(I.matrixWorld):(X.matrix.copy(Z.matrixWorld),X.matrix.invert(),X.matrix.multiply(I.matrixWorld)),X.matrix.decompose(X.position,X.quaternion,X.scale),X.updateMatrixWorld(!0),X.projectionMatrix.copy(I.projectionMatrix),X.projectionMatrixInverse.copy(I.projectionMatrixInverse),X.isPerspectiveCamera&&(X.fov=Di*2*Math.atan(1/X.projectionMatrix.elements[5]),X.zoom=1)}this.getCamera=function(){return y},this.getFoveation=function(){if(!(f===null&&u===null))return l},this.setFoveation=function(X){l=X,f!==null&&(f.fixedFoveation=X),u!==null&&u.fixedFoveation!==void 0&&(u.fixedFoveation=X)};let Q=null;function ee(X,I){if(h=I.getViewerPose(c||a),g=I,h!==null){const Z=h.views;u!==null&&(e.setRenderTargetFramebuffer(p,u.framebuffer),e.setRenderTarget(p));let he=!1;Z.length!==y.cameras.length&&(y.cameras.length=0,he=!0);for(let de=0;de<Z.length;de++){const we=Z[de];let Te=null;if(u!==null)Te=u.getViewport(we);else{const ke=d.getViewSubImage(f,we);Te=ke.viewport,de===0&&(e.setRenderTargetTextures(p,ke.colorTexture,f.ignoreDepthValues?void 0:ke.depthStencilTexture),e.setRenderTarget(p))}let ve=H[de];ve===void 0&&(ve=new Lt,ve.layers.enable(de),ve.viewport=new ut,H[de]=ve),ve.matrix.fromArray(we.transform.matrix),ve.matrix.decompose(ve.position,ve.quaternion,ve.scale),ve.projectionMatrix.fromArray(we.projectionMatrix),ve.projectionMatrixInverse.copy(ve.projectionMatrix).invert(),ve.viewport.set(Te.x,Te.y,Te.width,Te.height),de===0&&(y.matrix.copy(ve.matrix),y.matrix.decompose(y.position,y.quaternion,y.scale)),he===!0&&y.cameras.push(ve)}}for(let Z=0;Z<v.length;Z++){const he=_[Z],de=v[Z];he!==null&&de!==void 0&&de.update(he,I,c||a)}Q&&Q(X,I),I.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:I}),g=null}const ae=new wa;ae.setAnimationLoop(ee),this.setAnimationLoop=function(X){Q=X},this.dispose=function(){}}}function Xp(i,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,Sa(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,v,_,w){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(m,p):p.isMeshToonMaterial?(r(m,p),d(m,p)):p.isMeshPhongMaterial?(r(m,p),h(m,p)):p.isMeshStandardMaterial?(r(m,p),f(m,p),p.isMeshPhysicalMaterial&&u(m,p,w)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),x(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(a(m,p),p.isLineDashedMaterial&&o(m,p)):p.isPointsMaterial?l(m,p,v,_):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===Rt&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===Rt&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const v=e.get(p).envMap;if(v&&(m.envMap.value=v,m.flipEnvMap.value=v.isCubeTexture&&v.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap){m.lightMap.value=p.lightMap;const _=i._useLegacyLights===!0?Math.PI:1;m.lightMapIntensity.value=p.lightMapIntensity*_,t(p.lightMap,m.lightMapTransform)}p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function a(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function o(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,v,_){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*v,m.scale.value=_*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function d(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function f(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),e.get(p).envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function u(m,p,v){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Rt&&m.clearcoatNormalScale.value.negate())),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=v.texture,m.transmissionSamplerSize.value.set(v.width,v.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function x(m,p){const v=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(v.matrixWorld),m.nearDistance.value=v.shadow.camera.near,m.farDistance.value=v.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function jp(i,e,t,n){let s={},r={},a=[];const o=t.isWebGL2?i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS):0;function l(v,_){const w=_.program;n.uniformBlockBinding(v,w)}function c(v,_){let w=s[v.id];w===void 0&&(g(v),w=h(v),s[v.id]=w,v.addEventListener("dispose",m));const P=_.program;n.updateUBOMapping(v,P);const C=e.render.frame;r[v.id]!==C&&(f(v),r[v.id]=C)}function h(v){const _=d();v.__bindingPointIndex=_;const w=i.createBuffer(),P=v.__size,C=v.usage;return i.bindBuffer(i.UNIFORM_BUFFER,w),i.bufferData(i.UNIFORM_BUFFER,P,C),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,_,w),w}function d(){for(let v=0;v<o;v++)if(a.indexOf(v)===-1)return a.push(v),v;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(v){const _=s[v.id],w=v.uniforms,P=v.__cache;i.bindBuffer(i.UNIFORM_BUFFER,_);for(let C=0,T=w.length;C<T;C++){const H=Array.isArray(w[C])?w[C]:[w[C]];for(let y=0,E=H.length;y<E;y++){const N=H[y];if(u(N,C,y,P)===!0){const G=N.__offset,J=Array.isArray(N.value)?N.value:[N.value];let R=0;for(let U=0;U<J.length;U++){const B=J[U],$=x(B);typeof B=="number"||typeof B=="boolean"?(N.__data[0]=B,i.bufferSubData(i.UNIFORM_BUFFER,G+R,N.__data)):B.isMatrix3?(N.__data[0]=B.elements[0],N.__data[1]=B.elements[1],N.__data[2]=B.elements[2],N.__data[3]=0,N.__data[4]=B.elements[3],N.__data[5]=B.elements[4],N.__data[6]=B.elements[5],N.__data[7]=0,N.__data[8]=B.elements[6],N.__data[9]=B.elements[7],N.__data[10]=B.elements[8],N.__data[11]=0):(B.toArray(N.__data,R),R+=$.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,G,N.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function u(v,_,w,P){const C=v.value,T=_+"_"+w;if(P[T]===void 0)return typeof C=="number"||typeof C=="boolean"?P[T]=C:P[T]=C.clone(),!0;{const H=P[T];if(typeof C=="number"||typeof C=="boolean"){if(H!==C)return P[T]=C,!0}else if(H.equals(C)===!1)return H.copy(C),!0}return!1}function g(v){const _=v.uniforms;let w=0;const P=16;for(let T=0,H=_.length;T<H;T++){const y=Array.isArray(_[T])?_[T]:[_[T]];for(let E=0,N=y.length;E<N;E++){const G=y[E],J=Array.isArray(G.value)?G.value:[G.value];for(let R=0,U=J.length;R<U;R++){const B=J[R],$=x(B),q=w%P;q!==0&&P-q<$.boundary&&(w+=P-q),G.__data=new Float32Array($.storage/Float32Array.BYTES_PER_ELEMENT),G.__offset=w,w+=$.storage}}}const C=w%P;return C>0&&(w+=P-C),v.__size=w,v.__cache={},this}function x(v){const _={boundary:0,storage:0};return typeof v=="number"||typeof v=="boolean"?(_.boundary=4,_.storage=4):v.isVector2?(_.boundary=8,_.storage=8):v.isVector3||v.isColor?(_.boundary=16,_.storage=12):v.isVector4?(_.boundary=16,_.storage=16):v.isMatrix3?(_.boundary=48,_.storage=48):v.isMatrix4?(_.boundary=64,_.storage=64):v.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",v),_}function m(v){const _=v.target;_.removeEventListener("dispose",m);const w=a.indexOf(_.__bindingPointIndex);a.splice(w,1),i.deleteBuffer(s[_.id]),delete s[_.id],delete r[_.id]}function p(){for(const v in s)i.deleteBuffer(s[v]);a=[],s={},r={}}return{bind:l,update:c,dispose:p}}class el{constructor(e={}){const{canvas:t=bh(),context:n=null,depth:s=!0,stencil:r=!0,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1}=e;this.isWebGLRenderer=!0;let f;n!==null?f=n.getContextAttributes().alpha:f=a;const u=new Uint32Array(4),g=new Int32Array(4);let x=null,m=null;const p=[],v=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=gt,this._useLegacyLights=!1,this.toneMapping=un,this.toneMappingExposure=1;const _=this;let w=!1,P=0,C=0,T=null,H=-1,y=null;const E=new ut,N=new ut;let G=null;const J=new Ue(0);let R=0,U=t.width,B=t.height,$=1,q=null,K=null;const Q=new ut(0,0,U,B),ee=new ut(0,0,U,B);let ae=!1;const X=new Er;let I=!1,Z=!1,he=null;const de=new Qe,we=new xe,Te=new L,ve={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function ke(){return T===null?$:1}let z=n;function at(S,F){for(let W=0;W<S.length;W++){const j=S[W],V=t.getContext(j,F);if(V!==null)return V}return null}try{const S={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${ks}`),t.addEventListener("webglcontextlost",ie,!1),t.addEventListener("webglcontextrestored",D,!1),t.addEventListener("webglcontextcreationerror",re,!1),z===null){const F=["webgl2","webgl","experimental-webgl"];if(_.isWebGL1Renderer===!0&&F.shift(),z=at(F,S),z===null)throw at(F)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}typeof WebGLRenderingContext<"u"&&z instanceof WebGLRenderingContext&&console.warn("THREE.WebGLRenderer: WebGL 1 support was deprecated in r153 and will be removed in r163."),z.getShaderPrecisionFormat===void 0&&(z.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(S){throw console.error("THREE.WebGLRenderer: "+S.message),S}let be,Re,_e,Ke,Ae,M,b,k,te,O,Y,ge,ce,me,Ce,Oe,ne,$e,ze,De,Ee,ue,A,se;function ye(){be=new tf(z),Re=new Yu(z,be,e),be.init(Re),ue=new Hp(z,be,Re),_e=new kp(z,be,Re),Ke=new rf(z),Ae=new wp,M=new zp(z,be,_e,Ae,Re,ue,Ke),b=new Ju(_),k=new ef(_),te=new jh(z,Re),A=new qu(z,be,te,Re),O=new nf(z,te,Ke,A),Y=new cf(z,O,te,Ke),ze=new lf(z,Re,M),Oe=new Ku(Ae),ge=new Mp(_,b,k,be,Re,A,Oe),ce=new Xp(_,Ae),me=new Ap,Ce=new Ip(be,Re),$e=new ju(_,b,k,_e,Y,f,l),ne=new Bp(_,Y,Re),se=new jp(z,Ke,Re,_e),De=new $u(z,be,Ke,Re),Ee=new sf(z,be,Ke,Re),Ke.programs=ge.programs,_.capabilities=Re,_.extensions=be,_.properties=Ae,_.renderLists=me,_.shadowMap=ne,_.state=_e,_.info=Ke}ye();const pe=new Wp(_,z);this.xr=pe,this.getContext=function(){return z},this.getContextAttributes=function(){return z.getContextAttributes()},this.forceContextLoss=function(){const S=be.get("WEBGL_lose_context");S&&S.loseContext()},this.forceContextRestore=function(){const S=be.get("WEBGL_lose_context");S&&S.restoreContext()},this.getPixelRatio=function(){return $},this.setPixelRatio=function(S){S!==void 0&&($=S,this.setSize(U,B,!1))},this.getSize=function(S){return S.set(U,B)},this.setSize=function(S,F,W=!0){if(pe.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}U=S,B=F,t.width=Math.floor(S*$),t.height=Math.floor(F*$),W===!0&&(t.style.width=S+"px",t.style.height=F+"px"),this.setViewport(0,0,S,F)},this.getDrawingBufferSize=function(S){return S.set(U*$,B*$).floor()},this.setDrawingBufferSize=function(S,F,W){U=S,B=F,$=W,t.width=Math.floor(S*W),t.height=Math.floor(F*W),this.setViewport(0,0,S,F)},this.getCurrentViewport=function(S){return S.copy(E)},this.getViewport=function(S){return S.copy(Q)},this.setViewport=function(S,F,W,j){S.isVector4?Q.set(S.x,S.y,S.z,S.w):Q.set(S,F,W,j),_e.viewport(E.copy(Q).multiplyScalar($).floor())},this.getScissor=function(S){return S.copy(ee)},this.setScissor=function(S,F,W,j){S.isVector4?ee.set(S.x,S.y,S.z,S.w):ee.set(S,F,W,j),_e.scissor(N.copy(ee).multiplyScalar($).floor())},this.getScissorTest=function(){return ae},this.setScissorTest=function(S){_e.setScissorTest(ae=S)},this.setOpaqueSort=function(S){q=S},this.setTransparentSort=function(S){K=S},this.getClearColor=function(S){return S.copy($e.getClearColor())},this.setClearColor=function(){$e.setClearColor.apply($e,arguments)},this.getClearAlpha=function(){return $e.getClearAlpha()},this.setClearAlpha=function(){$e.setClearAlpha.apply($e,arguments)},this.clear=function(S=!0,F=!0,W=!0){let j=0;if(S){let V=!1;if(T!==null){const fe=T.texture.format;V=fe===_o||fe===xo||fe===go}if(V){const fe=T.texture.type,Se=fe===fn||fe===pn||fe===$s||fe===wn||fe===po||fe===mo,Pe=$e.getClearColor(),Ie=$e.getClearAlpha(),He=Pe.r,Ne=Pe.g,Fe=Pe.b;Se?(u[0]=He,u[1]=Ne,u[2]=Fe,u[3]=Ie,z.clearBufferuiv(z.COLOR,0,u)):(g[0]=He,g[1]=Ne,g[2]=Fe,g[3]=Ie,z.clearBufferiv(z.COLOR,0,g))}else j|=z.COLOR_BUFFER_BIT}F&&(j|=z.DEPTH_BUFFER_BIT),W&&(j|=z.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),z.clear(j)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",ie,!1),t.removeEventListener("webglcontextrestored",D,!1),t.removeEventListener("webglcontextcreationerror",re,!1),me.dispose(),Ce.dispose(),Ae.dispose(),b.dispose(),k.dispose(),Y.dispose(),A.dispose(),se.dispose(),ge.dispose(),pe.dispose(),pe.removeEventListener("sessionstart",st),pe.removeEventListener("sessionend",qe),he&&(he.dispose(),he=null),lt.stop()};function ie(S){S.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),w=!0}function D(){console.log("THREE.WebGLRenderer: Context Restored."),w=!1;const S=Ke.autoReset,F=ne.enabled,W=ne.autoUpdate,j=ne.needsUpdate,V=ne.type;ye(),Ke.autoReset=S,ne.enabled=F,ne.autoUpdate=W,ne.needsUpdate=j,ne.type=V}function re(S){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",S.statusMessage)}function le(S){const F=S.target;F.removeEventListener("dispose",le),Le(F)}function Le(S){Me(S),Ae.remove(S)}function Me(S){const F=Ae.get(S).programs;F!==void 0&&(F.forEach(function(W){ge.releaseProgram(W)}),S.isShaderMaterial&&ge.releaseShaderCache(S))}this.renderBufferDirect=function(S,F,W,j,V,fe){F===null&&(F=ve);const Se=V.isMesh&&V.matrixWorld.determinant()<0,Pe=Rg(S,F,W,j,V);_e.setMaterial(j,Se);let Ie=W.index,He=1;if(j.wireframe===!0){if(Ie=O.getWireframeAttribute(W),Ie===void 0)return;He=2}const Ne=W.drawRange,Fe=W.attributes.position;let rt=Ne.start*He,Ft=(Ne.start+Ne.count)*He;fe!==null&&(rt=Math.max(rt,fe.start*He),Ft=Math.min(Ft,(fe.start+fe.count)*He)),Ie!==null?(rt=Math.max(rt,0),Ft=Math.min(Ft,Ie.count)):Fe!=null&&(rt=Math.max(rt,0),Ft=Math.min(Ft,Fe.count));const mt=Ft-rt;if(mt<0||mt===1/0)return;A.setup(V,j,Pe,W,Ie);let cn,et=De;if(Ie!==null&&(cn=te.get(Ie),et=Ee,et.setIndex(cn)),V.isMesh)j.wireframe===!0?(_e.setLineWidth(j.wireframeLinewidth*ke()),et.setMode(z.LINES)):et.setMode(z.TRIANGLES);else if(V.isLine){let Ve=j.linewidth;Ve===void 0&&(Ve=1),_e.setLineWidth(Ve*ke()),V.isLineSegments?et.setMode(z.LINES):V.isLineLoop?et.setMode(z.LINE_LOOP):et.setMode(z.LINE_STRIP)}else V.isPoints?et.setMode(z.POINTS):V.isSprite&&et.setMode(z.TRIANGLES);if(V.isBatchedMesh)et.renderMultiDraw(V._multiDrawStarts,V._multiDrawCounts,V._multiDrawCount);else if(V.isInstancedMesh)et.renderInstances(rt,mt,V.count);else if(W.isInstancedBufferGeometry){const Ve=W._maxInstanceCount!==void 0?W._maxInstanceCount:1/0,Qr=Math.min(W.instanceCount,Ve);et.renderInstances(rt,mt,Qr)}else et.render(rt,mt)};function Xe(S,F,W){S.transparent===!0&&S.side===Bt&&S.forceSinglePass===!1?(S.side=Rt,S.needsUpdate=!0,Bs(S,F,W),S.side=hn,S.needsUpdate=!0,Bs(S,F,W),S.side=Bt):Bs(S,F,W)}this.compile=function(S,F,W=null){W===null&&(W=S),m=Ce.get(W),m.init(),v.push(m),W.traverseVisible(function(V){V.isLight&&V.layers.test(F.layers)&&(m.pushLight(V),V.castShadow&&m.pushShadow(V))}),S!==W&&S.traverseVisible(function(V){V.isLight&&V.layers.test(F.layers)&&(m.pushLight(V),V.castShadow&&m.pushShadow(V))}),m.setupLights(_._useLegacyLights);const j=new Set;return S.traverse(function(V){const fe=V.material;if(fe)if(Array.isArray(fe))for(let Se=0;Se<fe.length;Se++){const Pe=fe[Se];Xe(Pe,W,V),j.add(Pe)}else Xe(fe,W,V),j.add(fe)}),v.pop(),m=null,j},this.compileAsync=function(S,F,W=null){const j=this.compile(S,F,W);return new Promise(V=>{function fe(){if(j.forEach(function(Se){Ae.get(Se).currentProgram.isReady()&&j.delete(Se)}),j.size===0){V(S);return}setTimeout(fe,10)}be.get("KHR_parallel_shader_compile")!==null?fe():setTimeout(fe,10)})};let je=null;function nt(S){je&&je(S)}function st(){lt.stop()}function qe(){lt.start()}const lt=new wa;lt.setAnimationLoop(nt),typeof self<"u"&&lt.setContext(self),this.setAnimationLoop=function(S){je=S,pe.setAnimationLoop(S),S===null?lt.stop():lt.start()},pe.addEventListener("sessionstart",st),pe.addEventListener("sessionend",qe),this.render=function(S,F){if(F!==void 0&&F.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(w===!0)return;S.matrixWorldAutoUpdate===!0&&S.updateMatrixWorld(),F.parent===null&&F.matrixWorldAutoUpdate===!0&&F.updateMatrixWorld(),pe.enabled===!0&&pe.isPresenting===!0&&(pe.cameraAutoUpdate===!0&&pe.updateCamera(F),F=pe.getCamera()),S.isScene===!0&&S.onBeforeRender(_,S,F,T),m=Ce.get(S,v.length),m.init(),v.push(m),de.multiplyMatrices(F.projectionMatrix,F.matrixWorldInverse),X.setFromProjectionMatrix(de),Z=this.localClippingEnabled,I=Oe.init(this.clippingPlanes,Z),x=me.get(S,p.length),x.init(),p.push(x),Kt(S,F,0,_.sortObjects),x.finish(),_.sortObjects===!0&&x.sort(q,K),this.info.render.frame++,I===!0&&Oe.beginShadows();const W=m.state.shadowsArray;if(ne.render(W,S,F),I===!0&&Oe.endShadows(),this.info.autoReset===!0&&this.info.reset(),$e.render(x,S),m.setupLights(_._useLegacyLights),F.isArrayCamera){const j=F.cameras;for(let V=0,fe=j.length;V<fe;V++){const Se=j[V];nc(x,S,Se,Se.viewport)}}else nc(x,S,F);T!==null&&(M.updateMultisampleRenderTarget(T),M.updateRenderTargetMipmap(T)),S.isScene===!0&&S.onAfterRender(_,S,F),A.resetDefaultState(),H=-1,y=null,v.pop(),v.length>0?m=v[v.length-1]:m=null,p.pop(),p.length>0?x=p[p.length-1]:x=null};function Kt(S,F,W,j){if(S.visible===!1)return;if(S.layers.test(F.layers)){if(S.isGroup)W=S.renderOrder;else if(S.isLOD)S.autoUpdate===!0&&S.update(F);else if(S.isLight)m.pushLight(S),S.castShadow&&m.pushShadow(S);else if(S.isSprite){if(!S.frustumCulled||X.intersectsSprite(S)){j&&Te.setFromMatrixPosition(S.matrixWorld).applyMatrix4(de);const Se=Y.update(S),Pe=S.material;Pe.visible&&x.push(S,Se,Pe,W,Te.z,null)}}else if((S.isMesh||S.isLine||S.isPoints)&&(!S.frustumCulled||X.intersectsObject(S))){const Se=Y.update(S),Pe=S.material;if(j&&(S.boundingSphere!==void 0?(S.boundingSphere===null&&S.computeBoundingSphere(),Te.copy(S.boundingSphere.center)):(Se.boundingSphere===null&&Se.computeBoundingSphere(),Te.copy(Se.boundingSphere.center)),Te.applyMatrix4(S.matrixWorld).applyMatrix4(de)),Array.isArray(Pe)){const Ie=Se.groups;for(let He=0,Ne=Ie.length;He<Ne;He++){const Fe=Ie[He],rt=Pe[Fe.materialIndex];rt&&rt.visible&&x.push(S,Se,rt,W,Te.z,Fe)}}else Pe.visible&&x.push(S,Se,Pe,W,Te.z,null)}}const fe=S.children;for(let Se=0,Pe=fe.length;Se<Pe;Se++)Kt(fe[Se],F,W,j)}function nc(S,F,W,j){const V=S.opaque,fe=S.transmissive,Se=S.transparent;m.setupLightsView(W),I===!0&&Oe.setGlobalState(_.clippingPlanes,W),fe.length>0&&Cg(V,fe,F,W),j&&_e.viewport(E.copy(j)),V.length>0&&Fs(V,F,W),fe.length>0&&Fs(fe,F,W),Se.length>0&&Fs(Se,F,W),_e.buffers.depth.setTest(!0),_e.buffers.depth.setMask(!0),_e.buffers.color.setMask(!0),_e.setPolygonOffset(!1)}function Cg(S,F,W,j){if((W.isScene===!0?W.overrideMaterial:null)!==null)return;const fe=Re.isWebGL2;he===null&&(he=new Rn(1,1,{generateMipmaps:!0,type:be.has("EXT_color_buffer_half_float")?Li:fn,minFilter:Ri,samples:fe?4:0})),_.getDrawingBufferSize(we),fe?he.setSize(we.x,we.y):he.setSize(Qi(we.x),Qi(we.y));const Se=_.getRenderTarget();_.setRenderTarget(he),_.getClearColor(J),R=_.getClearAlpha(),R<1&&_.setClearColor(16777215,.5),_.clear();const Pe=_.toneMapping;_.toneMapping=un,Fs(S,W,j),M.updateMultisampleRenderTarget(he),M.updateRenderTargetMipmap(he);let Ie=!1;for(let He=0,Ne=F.length;He<Ne;He++){const Fe=F[He],rt=Fe.object,Ft=Fe.geometry,mt=Fe.material,cn=Fe.group;if(mt.side===Bt&&rt.layers.test(j.layers)){const et=mt.side;mt.side=Rt,mt.needsUpdate=!0,ic(rt,W,j,Ft,mt,cn),mt.side=et,mt.needsUpdate=!0,Ie=!0}}Ie===!0&&(M.updateMultisampleRenderTarget(he),M.updateRenderTargetMipmap(he)),_.setRenderTarget(Se),_.setClearColor(J,R),_.toneMapping=Pe}function Fs(S,F,W){const j=F.isScene===!0?F.overrideMaterial:null;for(let V=0,fe=S.length;V<fe;V++){const Se=S[V],Pe=Se.object,Ie=Se.geometry,He=j===null?Se.material:j,Ne=Se.group;Pe.layers.test(W.layers)&&ic(Pe,F,W,Ie,He,Ne)}}function ic(S,F,W,j,V,fe){S.onBeforeRender(_,F,W,j,V,fe),S.modelViewMatrix.multiplyMatrices(W.matrixWorldInverse,S.matrixWorld),S.normalMatrix.getNormalMatrix(S.modelViewMatrix),V.onBeforeRender(_,F,W,j,S,fe),V.transparent===!0&&V.side===Bt&&V.forceSinglePass===!1?(V.side=Rt,V.needsUpdate=!0,_.renderBufferDirect(W,F,j,V,S,fe),V.side=hn,V.needsUpdate=!0,_.renderBufferDirect(W,F,j,V,S,fe),V.side=Bt):_.renderBufferDirect(W,F,j,V,S,fe),S.onAfterRender(_,F,W,j,V,fe)}function Bs(S,F,W){F.isScene!==!0&&(F=ve);const j=Ae.get(S),V=m.state.lights,fe=m.state.shadowsArray,Se=V.state.version,Pe=ge.getParameters(S,V.state,fe,F,W),Ie=ge.getProgramCacheKey(Pe);let He=j.programs;j.environment=S.isMeshStandardMaterial?F.environment:null,j.fog=F.fog,j.envMap=(S.isMeshStandardMaterial?k:b).get(S.envMap||j.environment),He===void 0&&(S.addEventListener("dispose",le),He=new Map,j.programs=He);let Ne=He.get(Ie);if(Ne!==void 0){if(j.currentProgram===Ne&&j.lightsStateVersion===Se)return rc(S,Pe),Ne}else Pe.uniforms=ge.getUniforms(S),S.onBuild(W,Pe,_),S.onBeforeCompile(Pe,_),Ne=ge.acquireProgram(Pe,Ie),He.set(Ie,Ne),j.uniforms=Pe.uniforms;const Fe=j.uniforms;return(!S.isShaderMaterial&&!S.isRawShaderMaterial||S.clipping===!0)&&(Fe.clippingPlanes=Oe.uniform),rc(S,Pe),j.needsLights=Pg(S),j.lightsStateVersion=Se,j.needsLights&&(Fe.ambientLightColor.value=V.state.ambient,Fe.lightProbe.value=V.state.probe,Fe.directionalLights.value=V.state.directional,Fe.directionalLightShadows.value=V.state.directionalShadow,Fe.spotLights.value=V.state.spot,Fe.spotLightShadows.value=V.state.spotShadow,Fe.rectAreaLights.value=V.state.rectArea,Fe.ltc_1.value=V.state.rectAreaLTC1,Fe.ltc_2.value=V.state.rectAreaLTC2,Fe.pointLights.value=V.state.point,Fe.pointLightShadows.value=V.state.pointShadow,Fe.hemisphereLights.value=V.state.hemi,Fe.directionalShadowMap.value=V.state.directionalShadowMap,Fe.directionalShadowMatrix.value=V.state.directionalShadowMatrix,Fe.spotShadowMap.value=V.state.spotShadowMap,Fe.spotLightMatrix.value=V.state.spotLightMatrix,Fe.spotLightMap.value=V.state.spotLightMap,Fe.pointShadowMap.value=V.state.pointShadowMap,Fe.pointShadowMatrix.value=V.state.pointShadowMatrix),j.currentProgram=Ne,j.uniformsList=null,Ne}function sc(S){if(S.uniformsList===null){const F=S.currentProgram.getUniforms();S.uniformsList=Cs.seqWithValue(F.seq,S.uniforms)}return S.uniformsList}function rc(S,F){const W=Ae.get(S);W.outputColorSpace=F.outputColorSpace,W.batching=F.batching,W.instancing=F.instancing,W.instancingColor=F.instancingColor,W.skinning=F.skinning,W.morphTargets=F.morphTargets,W.morphNormals=F.morphNormals,W.morphColors=F.morphColors,W.morphTargetsCount=F.morphTargetsCount,W.numClippingPlanes=F.numClippingPlanes,W.numIntersection=F.numClipIntersection,W.vertexAlphas=F.vertexAlphas,W.vertexTangents=F.vertexTangents,W.toneMapping=F.toneMapping}function Rg(S,F,W,j,V){F.isScene!==!0&&(F=ve),M.resetTextureUnits();const fe=F.fog,Se=j.isMeshStandardMaterial?F.environment:null,Pe=T===null?_.outputColorSpace:T.isXRRenderTarget===!0?T.texture.colorSpace:Zt,Ie=(j.isMeshStandardMaterial?k:b).get(j.envMap||Se),He=j.vertexColors===!0&&!!W.attributes.color&&W.attributes.color.itemSize===4,Ne=!!W.attributes.tangent&&(!!j.normalMap||j.anisotropy>0),Fe=!!W.morphAttributes.position,rt=!!W.morphAttributes.normal,Ft=!!W.morphAttributes.color;let mt=un;j.toneMapped&&(T===null||T.isXRRenderTarget===!0)&&(mt=_.toneMapping);const cn=W.morphAttributes.position||W.morphAttributes.normal||W.morphAttributes.color,et=cn!==void 0?cn.length:0,Ve=Ae.get(j),Qr=m.state.lights;if(I===!0&&(Z===!0||S!==y)){const Gt=S===y&&j.id===H;Oe.setState(j,S,Gt)}let it=!1;j.version===Ve.__version?(Ve.needsLights&&Ve.lightsStateVersion!==Qr.state.version||Ve.outputColorSpace!==Pe||V.isBatchedMesh&&Ve.batching===!1||!V.isBatchedMesh&&Ve.batching===!0||V.isInstancedMesh&&Ve.instancing===!1||!V.isInstancedMesh&&Ve.instancing===!0||V.isSkinnedMesh&&Ve.skinning===!1||!V.isSkinnedMesh&&Ve.skinning===!0||V.isInstancedMesh&&Ve.instancingColor===!0&&V.instanceColor===null||V.isInstancedMesh&&Ve.instancingColor===!1&&V.instanceColor!==null||Ve.envMap!==Ie||j.fog===!0&&Ve.fog!==fe||Ve.numClippingPlanes!==void 0&&(Ve.numClippingPlanes!==Oe.numPlanes||Ve.numIntersection!==Oe.numIntersection)||Ve.vertexAlphas!==He||Ve.vertexTangents!==Ne||Ve.morphTargets!==Fe||Ve.morphNormals!==rt||Ve.morphColors!==Ft||Ve.toneMapping!==mt||Re.isWebGL2===!0&&Ve.morphTargetsCount!==et)&&(it=!0):(it=!0,Ve.__version=j.version);let Xn=Ve.currentProgram;it===!0&&(Xn=Bs(j,F,V));let oc=!1,Xi=!1,eo=!1;const St=Xn.getUniforms(),jn=Ve.uniforms;if(_e.useProgram(Xn.program)&&(oc=!0,Xi=!0,eo=!0),j.id!==H&&(H=j.id,Xi=!0),oc||y!==S){St.setValue(z,"projectionMatrix",S.projectionMatrix),St.setValue(z,"viewMatrix",S.matrixWorldInverse);const Gt=St.map.cameraPosition;Gt!==void 0&&Gt.setValue(z,Te.setFromMatrixPosition(S.matrixWorld)),Re.logarithmicDepthBuffer&&St.setValue(z,"logDepthBufFC",2/(Math.log(S.far+1)/Math.LN2)),(j.isMeshPhongMaterial||j.isMeshToonMaterial||j.isMeshLambertMaterial||j.isMeshBasicMaterial||j.isMeshStandardMaterial||j.isShaderMaterial)&&St.setValue(z,"isOrthographic",S.isOrthographicCamera===!0),y!==S&&(y=S,Xi=!0,eo=!0)}if(V.isSkinnedMesh){St.setOptional(z,V,"bindMatrix"),St.setOptional(z,V,"bindMatrixInverse");const Gt=V.skeleton;Gt&&(Re.floatVertexTextures?(Gt.boneTexture===null&&Gt.computeBoneTexture(),St.setValue(z,"boneTexture",Gt.boneTexture,M)):console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."))}V.isBatchedMesh&&(St.setOptional(z,V,"batchingTexture"),St.setValue(z,"batchingTexture",V._matricesTexture,M));const to=W.morphAttributes;if((to.position!==void 0||to.normal!==void 0||to.color!==void 0&&Re.isWebGL2===!0)&&ze.update(V,W,Xn),(Xi||Ve.receiveShadow!==V.receiveShadow)&&(Ve.receiveShadow=V.receiveShadow,St.setValue(z,"receiveShadow",V.receiveShadow)),j.isMeshGouraudMaterial&&j.envMap!==null&&(jn.envMap.value=Ie,jn.flipEnvMap.value=Ie.isCubeTexture&&Ie.isRenderTargetTexture===!1?-1:1),Xi&&(St.setValue(z,"toneMappingExposure",_.toneMappingExposure),Ve.needsLights&&Lg(jn,eo),fe&&j.fog===!0&&ce.refreshFogUniforms(jn,fe),ce.refreshMaterialUniforms(jn,j,$,B,he),Cs.upload(z,sc(Ve),jn,M)),j.isShaderMaterial&&j.uniformsNeedUpdate===!0&&(Cs.upload(z,sc(Ve),jn,M),j.uniformsNeedUpdate=!1),j.isSpriteMaterial&&St.setValue(z,"center",V.center),St.setValue(z,"modelViewMatrix",V.modelViewMatrix),St.setValue(z,"normalMatrix",V.normalMatrix),St.setValue(z,"modelMatrix",V.matrixWorld),j.isShaderMaterial||j.isRawShaderMaterial){const Gt=j.uniformsGroups;for(let no=0,Dg=Gt.length;no<Dg;no++)if(Re.isWebGL2){const ac=Gt[no];se.update(ac,Xn),se.bind(ac,Xn)}else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.")}return Xn}function Lg(S,F){S.ambientLightColor.needsUpdate=F,S.lightProbe.needsUpdate=F,S.directionalLights.needsUpdate=F,S.directionalLightShadows.needsUpdate=F,S.pointLights.needsUpdate=F,S.pointLightShadows.needsUpdate=F,S.spotLights.needsUpdate=F,S.spotLightShadows.needsUpdate=F,S.rectAreaLights.needsUpdate=F,S.hemisphereLights.needsUpdate=F}function Pg(S){return S.isMeshLambertMaterial||S.isMeshToonMaterial||S.isMeshPhongMaterial||S.isMeshStandardMaterial||S.isShadowMaterial||S.isShaderMaterial&&S.lights===!0}this.getActiveCubeFace=function(){return P},this.getActiveMipmapLevel=function(){return C},this.getRenderTarget=function(){return T},this.setRenderTargetTextures=function(S,F,W){Ae.get(S.texture).__webglTexture=F,Ae.get(S.depthTexture).__webglTexture=W;const j=Ae.get(S);j.__hasExternalTextures=!0,j.__hasExternalTextures&&(j.__autoAllocateDepthBuffer=W===void 0,j.__autoAllocateDepthBuffer||be.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),j.__useRenderToTexture=!1))},this.setRenderTargetFramebuffer=function(S,F){const W=Ae.get(S);W.__webglFramebuffer=F,W.__useDefaultFramebuffer=F===void 0},this.setRenderTarget=function(S,F=0,W=0){T=S,P=F,C=W;let j=!0,V=null,fe=!1,Se=!1;if(S){const Ie=Ae.get(S);Ie.__useDefaultFramebuffer!==void 0?(_e.bindFramebuffer(z.FRAMEBUFFER,null),j=!1):Ie.__webglFramebuffer===void 0?M.setupRenderTarget(S):Ie.__hasExternalTextures&&M.rebindTextures(S,Ae.get(S.texture).__webglTexture,Ae.get(S.depthTexture).__webglTexture);const He=S.texture;(He.isData3DTexture||He.isDataArrayTexture||He.isCompressedArrayTexture)&&(Se=!0);const Ne=Ae.get(S).__webglFramebuffer;S.isWebGLCubeRenderTarget?(Array.isArray(Ne[F])?V=Ne[F][W]:V=Ne[F],fe=!0):Re.isWebGL2&&S.samples>0&&M.useMultisampledRTT(S)===!1?V=Ae.get(S).__webglMultisampledFramebuffer:Array.isArray(Ne)?V=Ne[W]:V=Ne,E.copy(S.viewport),N.copy(S.scissor),G=S.scissorTest}else E.copy(Q).multiplyScalar($).floor(),N.copy(ee).multiplyScalar($).floor(),G=ae;if(_e.bindFramebuffer(z.FRAMEBUFFER,V)&&Re.drawBuffers&&j&&_e.drawBuffers(S,V),_e.viewport(E),_e.scissor(N),_e.setScissorTest(G),fe){const Ie=Ae.get(S.texture);z.framebufferTexture2D(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_CUBE_MAP_POSITIVE_X+F,Ie.__webglTexture,W)}else if(Se){const Ie=Ae.get(S.texture),He=F||0;z.framebufferTextureLayer(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,Ie.__webglTexture,W||0,He)}H=-1},this.readRenderTargetPixels=function(S,F,W,j,V,fe,Se){if(!(S&&S.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Pe=Ae.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&Se!==void 0&&(Pe=Pe[Se]),Pe){_e.bindFramebuffer(z.FRAMEBUFFER,Pe);try{const Ie=S.texture,He=Ie.format,Ne=Ie.type;if(He!==Wt&&ue.convert(He)!==z.getParameter(z.IMPLEMENTATION_COLOR_READ_FORMAT)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}const Fe=Ne===Li&&(be.has("EXT_color_buffer_half_float")||Re.isWebGL2&&be.has("EXT_color_buffer_float"));if(Ne!==fn&&ue.convert(Ne)!==z.getParameter(z.IMPLEMENTATION_COLOR_READ_TYPE)&&!(Ne===mn&&(Re.isWebGL2||be.has("OES_texture_float")||be.has("WEBGL_color_buffer_float")))&&!Fe){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}F>=0&&F<=S.width-j&&W>=0&&W<=S.height-V&&z.readPixels(F,W,j,V,ue.convert(He),ue.convert(Ne),fe)}finally{const Ie=T!==null?Ae.get(T).__webglFramebuffer:null;_e.bindFramebuffer(z.FRAMEBUFFER,Ie)}}},this.copyFramebufferToTexture=function(S,F,W=0){const j=Math.pow(2,-W),V=Math.floor(F.image.width*j),fe=Math.floor(F.image.height*j);M.setTexture2D(F,0),z.copyTexSubImage2D(z.TEXTURE_2D,W,0,0,S.x,S.y,V,fe),_e.unbindTexture()},this.copyTextureToTexture=function(S,F,W,j=0){const V=F.image.width,fe=F.image.height,Se=ue.convert(W.format),Pe=ue.convert(W.type);M.setTexture2D(W,0),z.pixelStorei(z.UNPACK_FLIP_Y_WEBGL,W.flipY),z.pixelStorei(z.UNPACK_PREMULTIPLY_ALPHA_WEBGL,W.premultiplyAlpha),z.pixelStorei(z.UNPACK_ALIGNMENT,W.unpackAlignment),F.isDataTexture?z.texSubImage2D(z.TEXTURE_2D,j,S.x,S.y,V,fe,Se,Pe,F.image.data):F.isCompressedTexture?z.compressedTexSubImage2D(z.TEXTURE_2D,j,S.x,S.y,F.mipmaps[0].width,F.mipmaps[0].height,Se,F.mipmaps[0].data):z.texSubImage2D(z.TEXTURE_2D,j,S.x,S.y,Se,Pe,F.image),j===0&&W.generateMipmaps&&z.generateMipmap(z.TEXTURE_2D),_e.unbindTexture()},this.copyTextureToTexture3D=function(S,F,W,j,V=0){if(_.isWebGL1Renderer){console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");return}const fe=S.max.x-S.min.x+1,Se=S.max.y-S.min.y+1,Pe=S.max.z-S.min.z+1,Ie=ue.convert(j.format),He=ue.convert(j.type);let Ne;if(j.isData3DTexture)M.setTexture3D(j,0),Ne=z.TEXTURE_3D;else if(j.isDataArrayTexture||j.isCompressedArrayTexture)M.setTexture2DArray(j,0),Ne=z.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}z.pixelStorei(z.UNPACK_FLIP_Y_WEBGL,j.flipY),z.pixelStorei(z.UNPACK_PREMULTIPLY_ALPHA_WEBGL,j.premultiplyAlpha),z.pixelStorei(z.UNPACK_ALIGNMENT,j.unpackAlignment);const Fe=z.getParameter(z.UNPACK_ROW_LENGTH),rt=z.getParameter(z.UNPACK_IMAGE_HEIGHT),Ft=z.getParameter(z.UNPACK_SKIP_PIXELS),mt=z.getParameter(z.UNPACK_SKIP_ROWS),cn=z.getParameter(z.UNPACK_SKIP_IMAGES),et=W.isCompressedTexture?W.mipmaps[V]:W.image;z.pixelStorei(z.UNPACK_ROW_LENGTH,et.width),z.pixelStorei(z.UNPACK_IMAGE_HEIGHT,et.height),z.pixelStorei(z.UNPACK_SKIP_PIXELS,S.min.x),z.pixelStorei(z.UNPACK_SKIP_ROWS,S.min.y),z.pixelStorei(z.UNPACK_SKIP_IMAGES,S.min.z),W.isDataTexture||W.isData3DTexture?z.texSubImage3D(Ne,V,F.x,F.y,F.z,fe,Se,Pe,Ie,He,et.data):W.isCompressedArrayTexture?(console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."),z.compressedTexSubImage3D(Ne,V,F.x,F.y,F.z,fe,Se,Pe,Ie,et.data)):z.texSubImage3D(Ne,V,F.x,F.y,F.z,fe,Se,Pe,Ie,He,et),z.pixelStorei(z.UNPACK_ROW_LENGTH,Fe),z.pixelStorei(z.UNPACK_IMAGE_HEIGHT,rt),z.pixelStorei(z.UNPACK_SKIP_PIXELS,Ft),z.pixelStorei(z.UNPACK_SKIP_ROWS,mt),z.pixelStorei(z.UNPACK_SKIP_IMAGES,cn),V===0&&j.generateMipmaps&&z.generateMipmap(Ne),_e.unbindTexture()},this.initTexture=function(S){S.isCubeTexture?M.setTextureCube(S,0):S.isData3DTexture?M.setTexture3D(S,0):S.isDataArrayTexture||S.isCompressedArrayTexture?M.setTexture2DArray(S,0):M.setTexture2D(S,0),_e.unbindTexture()},this.resetState=function(){P=0,C=0,T=null,_e.reset(),A.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Qt}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=e===er?"display-p3":"srgb",t.unpackColorSpace=Ye.workingColorSpace===$i?"display-p3":"srgb"}get outputEncoding(){return console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace===gt?An:Xo}set outputEncoding(e){console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace=e===An?gt:Zt}get useLegacyLights(){return console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights}set useLegacyLights(e){console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights=e}}class qp extends el{}qp.prototype.isWebGL1Renderer=!0;class zi{constructor(e,t=1,n=1e3){this.isFog=!0,this.name="",this.color=new Ue(e),this.near=t,this.far=n}clone(){return new zi(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class $p extends ft{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t}}class zn extends di{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ue(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const tl=new L,nl=new L,il=new Qe,Ir=new ls,Rs=new rs;class Ur extends ft{constructor(e=new yt,t=new zn){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)tl.fromBufferAttribute(t,s-1),nl.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=tl.distanceTo(nl);e.setAttribute("lineDistance",new vt(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Rs.copy(n.boundingSphere),Rs.applyMatrix4(s),Rs.radius+=r,e.ray.intersectsSphere(Rs)===!1)return;il.copy(s).invert(),Ir.copy(e.ray).applyMatrix4(il);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=new L,h=new L,d=new L,f=new L,u=this.isLineSegments?2:1,g=n.index,m=n.attributes.position;if(g!==null){const p=Math.max(0,a.start),v=Math.min(g.count,a.start+a.count);for(let _=p,w=v-1;_<w;_+=u){const P=g.getX(_),C=g.getX(_+1);if(c.fromBufferAttribute(m,P),h.fromBufferAttribute(m,C),Ir.distanceSqToSegment(c,h,f,d)>l)continue;f.applyMatrix4(this.matrixWorld);const H=e.ray.origin.distanceTo(f);H<e.near||H>e.far||t.push({distance:H,point:d.clone().applyMatrix4(this.matrixWorld),index:_,face:null,faceIndex:null,object:this})}}else{const p=Math.max(0,a.start),v=Math.min(m.count,a.start+a.count);for(let _=p,w=v-1;_<w;_+=u){if(c.fromBufferAttribute(m,_),h.fromBufferAttribute(m,_+1),Ir.distanceSqToSegment(c,h,f,d)>l)continue;f.applyMatrix4(this.matrixWorld);const C=e.ray.origin.distanceTo(f);C<e.near||C>e.far||t.push({distance:C,point:d.clone().applyMatrix4(this.matrixWorld),index:_,face:null,faceIndex:null,object:this})}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}const sl=new L,rl=new L;class Hn extends Ur{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)sl.fromBufferAttribute(t,s),rl.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+sl.distanceTo(rl);e.setAttribute("lineDistance",new vt(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class an{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){const n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let n,s=this.getPoint(0),r=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),r+=n.distanceTo(s),t.push(r),s=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){const n=this.getLengths();let s=0;const r=n.length;let a;t?a=t:a=e*n[r-1];let o=0,l=r-1,c;for(;o<=l;)if(s=Math.floor(o+(l-o)/2),c=n[s]-a,c<0)o=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===a)return s/(r-1);const h=n[s],f=n[s+1]-h,u=(a-h)/f;return(s+u)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);const a=this.getPoint(s),o=this.getPoint(r),l=t||(a.isVector2?new xe:new L);return l.copy(o).sub(a).normalize(),l}getTangentAt(e,t){const n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t){const n=new L,s=[],r=[],a=[],o=new L,l=new Qe;for(let u=0;u<=e;u++){const g=u/e;s[u]=this.getTangentAt(g,new L)}r[0]=new L,a[0]=new L;let c=Number.MAX_VALUE;const h=Math.abs(s[0].x),d=Math.abs(s[0].y),f=Math.abs(s[0].z);h<=c&&(c=h,n.set(1,0,0)),d<=c&&(c=d,n.set(0,1,0)),f<=c&&n.set(0,0,1),o.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let u=1;u<=e;u++){if(r[u]=r[u-1].clone(),a[u]=a[u-1].clone(),o.crossVectors(s[u-1],s[u]),o.length()>Number.EPSILON){o.normalize();const g=Math.acos(dt(s[u-1].dot(s[u]),-1,1));r[u].applyMatrix4(l.makeRotationAxis(o,g))}a[u].crossVectors(s[u],r[u])}if(t===!0){let u=Math.acos(dt(r[0].dot(r[e]),-1,1));u/=e,s[0].dot(o.crossVectors(r[0],r[e]))>0&&(u=-u);for(let g=1;g<=e;g++)r[g].applyMatrix4(l.makeRotationAxis(s[g],u*g)),a[g].crossVectors(s[g],r[g])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class ol extends an{constructor(e=0,t=0,n=1,s=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(e,t){const n=t||new xe,s=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);const o=this.aStartAngle+e*r;let l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){const h=Math.cos(this.aRotation),d=Math.sin(this.aRotation),f=l-this.aX,u=c-this.aY;l=f*h-u*d+this.aX,c=f*d+u*h+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class Yp extends ol{constructor(e,t,n,s,r,a){super(e,t,n,n,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}}function Nr(){let i=0,e=0,t=0,n=0;function s(r,a,o,l){i=r,e=o,t=-3*r+3*a-2*o-l,n=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){s(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,h,d){let f=(a-r)/c-(o-r)/(c+h)+(o-a)/h,u=(o-a)/h-(l-a)/(h+d)+(l-o)/d;f*=h,u*=h,s(a,o,f,u)},calc:function(r){const a=r*r,o=a*r;return i+e*r+t*a+n*o}}}const Ls=new L,Or=new Nr,Fr=new Nr,Br=new Nr;class al extends an{constructor(e=[],t=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=s}getPoint(e,t=new L){const n=t,s=this.points,r=s.length,a=(r-(this.closed?0:1))*e;let o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,h;this.closed||o>0?c=s[(o-1)%r]:(Ls.subVectors(s[0],s[1]).add(s[0]),c=Ls);const d=s[o%r],f=s[(o+1)%r];if(this.closed||o+2<r?h=s[(o+2)%r]:(Ls.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=Ls),this.curveType==="centripetal"||this.curveType==="chordal"){const u=this.curveType==="chordal"?.5:.25;let g=Math.pow(c.distanceToSquared(d),u),x=Math.pow(d.distanceToSquared(f),u),m=Math.pow(f.distanceToSquared(h),u);x<1e-4&&(x=1),g<1e-4&&(g=x),m<1e-4&&(m=x),Or.initNonuniformCatmullRom(c.x,d.x,f.x,h.x,g,x,m),Fr.initNonuniformCatmullRom(c.y,d.y,f.y,h.y,g,x,m),Br.initNonuniformCatmullRom(c.z,d.z,f.z,h.z,g,x,m)}else this.curveType==="catmullrom"&&(Or.initCatmullRom(c.x,d.x,f.x,h.x,this.tension),Fr.initCatmullRom(c.y,d.y,f.y,h.y,this.tension),Br.initCatmullRom(c.z,d.z,f.z,h.z,this.tension));return n.set(Or.calc(l),Fr.calc(l),Br.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(new L().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function ll(i,e,t,n,s){const r=(n-e)*.5,a=(s-t)*.5,o=i*i,l=i*o;return(2*t-2*n+r+a)*l+(-3*t+3*n-2*r-a)*o+r*i+t}function Kp(i,e){const t=1-i;return t*t*e}function Jp(i,e){return 2*(1-i)*i*e}function Zp(i,e){return i*i*e}function Hi(i,e,t,n){return Kp(i,e)+Jp(i,t)+Zp(i,n)}function Qp(i,e){const t=1-i;return t*t*t*e}function em(i,e){const t=1-i;return 3*t*t*i*e}function tm(i,e){return 3*(1-i)*i*i*e}function nm(i,e){return i*i*i*e}function Gi(i,e,t,n,s){return Qp(i,e)+em(i,t)+tm(i,n)+nm(i,s)}class im extends an{constructor(e=new xe,t=new xe,n=new xe,s=new xe){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new xe){const n=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(Gi(e,s.x,r.x,a.x,o.x),Gi(e,s.y,r.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class sm extends an{constructor(e=new L,t=new L,n=new L,s=new L){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new L){const n=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(Gi(e,s.x,r.x,a.x,o.x),Gi(e,s.y,r.y,a.y,o.y),Gi(e,s.z,r.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class rm extends an{constructor(e=new xe,t=new xe){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new xe){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new xe){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class om extends an{constructor(e=new L,t=new L){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new L){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new L){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class am extends an{constructor(e=new xe,t=new xe,n=new xe){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new xe){const n=t,s=this.v0,r=this.v1,a=this.v2;return n.set(Hi(e,s.x,r.x,a.x),Hi(e,s.y,r.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class cl extends an{constructor(e=new L,t=new L,n=new L){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new L){const n=t,s=this.v0,r=this.v1,a=this.v2;return n.set(Hi(e,s.x,r.x,a.x),Hi(e,s.y,r.y,a.y),Hi(e,s.z,r.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class lm extends an{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new xe){const n=t,s=this.points,r=(s.length-1)*e,a=Math.floor(r),o=r-a,l=s[a===0?a:a-1],c=s[a],h=s[a>s.length-2?s.length-1:a+1],d=s[a>s.length-3?s.length-1:a+2];return n.set(ll(o,l.x,c.x,h.x,d.x),ll(o,l.y,c.y,h.y,d.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(s.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(new xe().fromArray(s))}return this}}var cm=Object.freeze({__proto__:null,ArcCurve:Yp,CatmullRomCurve3:al,CubicBezierCurve:im,CubicBezierCurve3:sm,EllipseCurve:ol,LineCurve:rm,LineCurve3:om,QuadraticBezierCurve:am,QuadraticBezierCurve3:cl,SplineCurve:lm});class kr extends yt{constructor(e=new cl(new L(-1,-1,0),new L(-1,1,0),new L(1,1,0)),t=64,n=1,s=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:s,closed:r};const a=e.computeFrenetFrames(t,r);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;const o=new L,l=new L,c=new xe;let h=new L;const d=[],f=[],u=[],g=[];x(),this.setIndex(g),this.setAttribute("position",new vt(d,3)),this.setAttribute("normal",new vt(f,3)),this.setAttribute("uv",new vt(u,2));function x(){for(let _=0;_<t;_++)m(_);m(r===!1?t:0),v(),p()}function m(_){h=e.getPointAt(_/t,h);const w=a.normals[_],P=a.binormals[_];for(let C=0;C<=s;C++){const T=C/s*Math.PI*2,H=Math.sin(T),y=-Math.cos(T);l.x=y*w.x+H*P.x,l.y=y*w.y+H*P.y,l.z=y*w.z+H*P.z,l.normalize(),f.push(l.x,l.y,l.z),o.x=h.x+n*l.x,o.y=h.y+n*l.y,o.z=h.z+n*l.z,d.push(o.x,o.y,o.z)}}function p(){for(let _=1;_<=t;_++)for(let w=1;w<=s;w++){const P=(s+1)*(_-1)+(w-1),C=(s+1)*_+(w-1),T=(s+1)*_+w,H=(s+1)*(_-1)+w;g.push(P,C,H),g.push(C,T,H)}}function v(){for(let _=0;_<=t;_++)for(let w=0;w<=s;w++)c.x=_/t,c.y=w/s,u.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new kr(new cm[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}}class Ei extends di{constructor(e){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new Ue(16777215),this.specular=new Ue(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ue(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=jo,this.normalScale=new xe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=Gs,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class hl extends ft{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ue(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),t}}const zr=new Qe,dl=new L,ul=new L;class hm{constructor(e){this.camera=e,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new xe(512,512),this.map=null,this.mapPass=null,this.matrix=new Qe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Er,this._frameExtents=new xe(1,1),this._viewportCount=1,this._viewports=[new ut(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;dl.setFromMatrixPosition(e.matrixWorld),t.position.copy(dl),ul.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(ul),t.updateMatrixWorld(),zr.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(zr),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(zr)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class dm extends hm{constructor(){super(new ws(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class fl extends hl{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(ft.DEFAULT_UP),this.updateMatrix(),this.target=new ft,this.shadow=new dm}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class um extends hl{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class fm{constructor(e,t,n=0,s=1/0){this.ray=new ls(e,t),this.near=n,this.far=s,this.camera=null,this.layers=new pr,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}intersectObject(e,t=!0,n=[]){return Hr(e,this,n,t),n.sort(pl),n}intersectObjects(e,t=!0,n=[]){for(let s=0,r=e.length;s<r;s++)Hr(e[s],this,n,t);return n.sort(pl),n}}function pl(i,e){return i.distance-e.distance}function Hr(i,e,t,n){if(i.layers.test(e.layers)&&i.raycast(e,t),n===!0){const s=i.children;for(let r=0,a=s.length;r<a;r++)Hr(s[r],e,t,!0)}}class ml{constructor(e=1,t=0,n=0){return this.radius=e,this.phi=t,this.theta=n,this}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=Math.max(1e-6,Math.min(Math.PI-1e-6,this.phi)),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(dt(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}class pm extends Hn{constructor(e=10,t=10,n=4473924,s=8947848){n=new Ue(n),s=new Ue(s);const r=t/2,a=e/t,o=e/2,l=[],c=[];for(let f=0,u=0,g=-o;f<=t;f++,g+=a){l.push(-o,0,g,o,0,g),l.push(g,0,-o,g,0,o);const x=f===r?n:s;x.toArray(c,u),u+=3,x.toArray(c,u),u+=3,x.toArray(c,u),u+=3,x.toArray(c,u),u+=3}const h=new yt;h.setAttribute("position",new vt(l,3)),h.setAttribute("color",new vt(c,3));const d=new zn({vertexColors:!0,toneMapped:!1});super(h,d),this.type="GridHelper"}dispose(){this.geometry.dispose(),this.material.dispose()}}class mm extends Hn{constructor(e=1){const t=[0,0,0,e,0,0,0,0,0,0,e,0,0,0,0,0,0,e],n=[1,0,0,1,.6,0,0,1,0,.6,1,0,0,0,1,0,.6,1],s=new yt;s.setAttribute("position",new vt(t,3)),s.setAttribute("color",new vt(n,3));const r=new zn({vertexColors:!0,toneMapped:!1});super(s,r),this.type="AxesHelper"}setColors(e,t,n){const s=new Ue,r=this.geometry.attributes.color.array;return s.set(e),s.toArray(r,0),s.toArray(r,3),s.set(t),s.toArray(r,6),s.toArray(r,9),s.set(n),s.toArray(r,12),s.toArray(r,15),this.geometry.attributes.color.needsUpdate=!0,this}dispose(){this.geometry.dispose(),this.material.dispose()}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:ks}})),typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=ks);const gl={type:"change"},Gr={type:"start"},xl={type:"end"},Ps=new ls,_l=new on,gm=Math.cos(70*sr.DEG2RAD);class xm extends Cn{constructor(e,t){super(),this.object=e,this.domElement=t,this.domElement.style.touchAction="none",this.enabled=!0,this.target=new L,this.cursor=new L,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:qn.ROTATE,MIDDLE:qn.DOLLY,RIGHT:qn.PAN},this.touches={ONE:$n.ROTATE,TWO:$n.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this.getPolarAngle=function(){return o.phi},this.getAzimuthalAngle=function(){return o.theta},this.getDistance=function(){return this.object.position.distanceTo(this.target)},this.listenToKeyEvents=function(A){A.addEventListener("keydown",Ce),this._domElementKeyEvents=A},this.stopListenToKeyEvents=function(){this._domElementKeyEvents.removeEventListener("keydown",Ce),this._domElementKeyEvents=null},this.saveState=function(){n.target0.copy(n.target),n.position0.copy(n.object.position),n.zoom0=n.object.zoom},this.reset=function(){n.target.copy(n.target0),n.object.position.copy(n.position0),n.object.zoom=n.zoom0,n.object.updateProjectionMatrix(),n.dispatchEvent(gl),n.update(),r=s.NONE},this.update=function(){const A=new L,se=new Ln().setFromUnitVectors(e.up,new L(0,1,0)),ye=se.clone().invert(),pe=new L,ie=new Ln,D=new L,re=2*Math.PI;return function(Le=null){const Me=n.object.position;A.copy(Me).sub(n.target),A.applyQuaternion(se),o.setFromVector3(A),n.autoRotate&&r===s.NONE&&G(E(Le)),n.enableDamping?(o.theta+=l.theta*n.dampingFactor,o.phi+=l.phi*n.dampingFactor):(o.theta+=l.theta,o.phi+=l.phi);let Xe=n.minAzimuthAngle,je=n.maxAzimuthAngle;isFinite(Xe)&&isFinite(je)&&(Xe<-Math.PI?Xe+=re:Xe>Math.PI&&(Xe-=re),je<-Math.PI?je+=re:je>Math.PI&&(je-=re),Xe<=je?o.theta=Math.max(Xe,Math.min(je,o.theta)):o.theta=o.theta>(Xe+je)/2?Math.max(Xe,o.theta):Math.min(je,o.theta)),o.phi=Math.max(n.minPolarAngle,Math.min(n.maxPolarAngle,o.phi)),o.makeSafe(),n.enableDamping===!0?n.target.addScaledVector(h,n.dampingFactor):n.target.add(h),n.target.sub(n.cursor),n.target.clampLength(n.minTargetRadius,n.maxTargetRadius),n.target.add(n.cursor),n.zoomToCursor&&C||n.object.isOrthographicCamera?o.radius=Q(o.radius):o.radius=Q(o.radius*c),A.setFromSpherical(o),A.applyQuaternion(ye),Me.copy(n.target).add(A),n.object.lookAt(n.target),n.enableDamping===!0?(l.theta*=1-n.dampingFactor,l.phi*=1-n.dampingFactor,h.multiplyScalar(1-n.dampingFactor)):(l.set(0,0,0),h.set(0,0,0));let nt=!1;if(n.zoomToCursor&&C){let st=null;if(n.object.isPerspectiveCamera){const qe=A.length();st=Q(qe*c);const lt=qe-st;n.object.position.addScaledVector(w,lt),n.object.updateMatrixWorld()}else if(n.object.isOrthographicCamera){const qe=new L(P.x,P.y,0);qe.unproject(n.object),n.object.zoom=Math.max(n.minZoom,Math.min(n.maxZoom,n.object.zoom/c)),n.object.updateProjectionMatrix(),nt=!0;const lt=new L(P.x,P.y,0);lt.unproject(n.object),n.object.position.sub(lt).add(qe),n.object.updateMatrixWorld(),st=A.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),n.zoomToCursor=!1;st!==null&&(this.screenSpacePanning?n.target.set(0,0,-1).transformDirection(n.object.matrix).multiplyScalar(st).add(n.object.position):(Ps.origin.copy(n.object.position),Ps.direction.set(0,0,-1).transformDirection(n.object.matrix),Math.abs(n.object.up.dot(Ps.direction))<gm?e.lookAt(n.target):(_l.setFromNormalAndCoplanarPoint(n.object.up,n.target),Ps.intersectPlane(_l,n.target))))}else n.object.isOrthographicCamera&&(n.object.zoom=Math.max(n.minZoom,Math.min(n.maxZoom,n.object.zoom/c)),n.object.updateProjectionMatrix(),nt=!0);return c=1,C=!1,nt||pe.distanceToSquared(n.object.position)>a||8*(1-ie.dot(n.object.quaternion))>a||D.distanceToSquared(n.target)>0?(n.dispatchEvent(gl),pe.copy(n.object.position),ie.copy(n.object.quaternion),D.copy(n.target),!0):!1}}(),this.dispose=function(){n.domElement.removeEventListener("contextmenu",$e),n.domElement.removeEventListener("pointerdown",M),n.domElement.removeEventListener("pointercancel",k),n.domElement.removeEventListener("wheel",Y),n.domElement.removeEventListener("pointermove",b),n.domElement.removeEventListener("pointerup",k),n._domElementKeyEvents!==null&&(n._domElementKeyEvents.removeEventListener("keydown",Ce),n._domElementKeyEvents=null)};const n=this,s={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6};let r=s.NONE;const a=1e-6,o=new ml,l=new ml;let c=1;const h=new L,d=new xe,f=new xe,u=new xe,g=new xe,x=new xe,m=new xe,p=new xe,v=new xe,_=new xe,w=new L,P=new xe;let C=!1;const T=[],H={};let y=!1;function E(A){return A!==null?2*Math.PI/60*n.autoRotateSpeed*A:2*Math.PI/60/60*n.autoRotateSpeed}function N(A){const se=Math.abs(A*.01);return Math.pow(.95,n.zoomSpeed*se)}function G(A){l.theta-=A}function J(A){l.phi-=A}const R=function(){const A=new L;return function(ye,pe){A.setFromMatrixColumn(pe,0),A.multiplyScalar(-ye),h.add(A)}}(),U=function(){const A=new L;return function(ye,pe){n.screenSpacePanning===!0?A.setFromMatrixColumn(pe,1):(A.setFromMatrixColumn(pe,0),A.crossVectors(n.object.up,A)),A.multiplyScalar(ye),h.add(A)}}(),B=function(){const A=new L;return function(ye,pe){const ie=n.domElement;if(n.object.isPerspectiveCamera){const D=n.object.position;A.copy(D).sub(n.target);let re=A.length();re*=Math.tan(n.object.fov/2*Math.PI/180),R(2*ye*re/ie.clientHeight,n.object.matrix),U(2*pe*re/ie.clientHeight,n.object.matrix)}else n.object.isOrthographicCamera?(R(ye*(n.object.right-n.object.left)/n.object.zoom/ie.clientWidth,n.object.matrix),U(pe*(n.object.top-n.object.bottom)/n.object.zoom/ie.clientHeight,n.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),n.enablePan=!1)}}();function $(A){n.object.isPerspectiveCamera||n.object.isOrthographicCamera?c/=A:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),n.enableZoom=!1)}function q(A){n.object.isPerspectiveCamera||n.object.isOrthographicCamera?c*=A:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),n.enableZoom=!1)}function K(A,se){if(!n.zoomToCursor)return;C=!0;const ye=n.domElement.getBoundingClientRect(),pe=A-ye.left,ie=se-ye.top,D=ye.width,re=ye.height;P.x=pe/D*2-1,P.y=-(ie/re)*2+1,w.set(P.x,P.y,1).unproject(n.object).sub(n.object.position).normalize()}function Q(A){return Math.max(n.minDistance,Math.min(n.maxDistance,A))}function ee(A){d.set(A.clientX,A.clientY)}function ae(A){K(A.clientX,A.clientX),p.set(A.clientX,A.clientY)}function X(A){g.set(A.clientX,A.clientY)}function I(A){f.set(A.clientX,A.clientY),u.subVectors(f,d).multiplyScalar(n.rotateSpeed);const se=n.domElement;G(2*Math.PI*u.x/se.clientHeight),J(2*Math.PI*u.y/se.clientHeight),d.copy(f),n.update()}function Z(A){v.set(A.clientX,A.clientY),_.subVectors(v,p),_.y>0?$(N(_.y)):_.y<0&&q(N(_.y)),p.copy(v),n.update()}function he(A){x.set(A.clientX,A.clientY),m.subVectors(x,g).multiplyScalar(n.panSpeed),B(m.x,m.y),g.copy(x),n.update()}function de(A){K(A.clientX,A.clientY),A.deltaY<0?q(N(A.deltaY)):A.deltaY>0&&$(N(A.deltaY)),n.update()}function we(A){let se=!1;switch(A.code){case n.keys.UP:A.ctrlKey||A.metaKey||A.shiftKey?J(2*Math.PI*n.rotateSpeed/n.domElement.clientHeight):B(0,n.keyPanSpeed),se=!0;break;case n.keys.BOTTOM:A.ctrlKey||A.metaKey||A.shiftKey?J(-2*Math.PI*n.rotateSpeed/n.domElement.clientHeight):B(0,-n.keyPanSpeed),se=!0;break;case n.keys.LEFT:A.ctrlKey||A.metaKey||A.shiftKey?G(2*Math.PI*n.rotateSpeed/n.domElement.clientHeight):B(n.keyPanSpeed,0),se=!0;break;case n.keys.RIGHT:A.ctrlKey||A.metaKey||A.shiftKey?G(-2*Math.PI*n.rotateSpeed/n.domElement.clientHeight):B(-n.keyPanSpeed,0),se=!0;break}se&&(A.preventDefault(),n.update())}function Te(A){if(T.length===1)d.set(A.pageX,A.pageY);else{const se=ue(A),ye=.5*(A.pageX+se.x),pe=.5*(A.pageY+se.y);d.set(ye,pe)}}function ve(A){if(T.length===1)g.set(A.pageX,A.pageY);else{const se=ue(A),ye=.5*(A.pageX+se.x),pe=.5*(A.pageY+se.y);g.set(ye,pe)}}function ke(A){const se=ue(A),ye=A.pageX-se.x,pe=A.pageY-se.y,ie=Math.sqrt(ye*ye+pe*pe);p.set(0,ie)}function z(A){n.enableZoom&&ke(A),n.enablePan&&ve(A)}function at(A){n.enableZoom&&ke(A),n.enableRotate&&Te(A)}function be(A){if(T.length==1)f.set(A.pageX,A.pageY);else{const ye=ue(A),pe=.5*(A.pageX+ye.x),ie=.5*(A.pageY+ye.y);f.set(pe,ie)}u.subVectors(f,d).multiplyScalar(n.rotateSpeed);const se=n.domElement;G(2*Math.PI*u.x/se.clientHeight),J(2*Math.PI*u.y/se.clientHeight),d.copy(f)}function Re(A){if(T.length===1)x.set(A.pageX,A.pageY);else{const se=ue(A),ye=.5*(A.pageX+se.x),pe=.5*(A.pageY+se.y);x.set(ye,pe)}m.subVectors(x,g).multiplyScalar(n.panSpeed),B(m.x,m.y),g.copy(x)}function _e(A){const se=ue(A),ye=A.pageX-se.x,pe=A.pageY-se.y,ie=Math.sqrt(ye*ye+pe*pe);v.set(0,ie),_.set(0,Math.pow(v.y/p.y,n.zoomSpeed)),$(_.y),p.copy(v);const D=(A.pageX+se.x)*.5,re=(A.pageY+se.y)*.5;K(D,re)}function Ke(A){n.enableZoom&&_e(A),n.enablePan&&Re(A)}function Ae(A){n.enableZoom&&_e(A),n.enableRotate&&be(A)}function M(A){n.enabled!==!1&&(T.length===0&&(n.domElement.setPointerCapture(A.pointerId),n.domElement.addEventListener("pointermove",b),n.domElement.addEventListener("pointerup",k)),ze(A),A.pointerType==="touch"?Oe(A):te(A))}function b(A){n.enabled!==!1&&(A.pointerType==="touch"?ne(A):O(A))}function k(A){De(A),T.length===0&&(n.domElement.releasePointerCapture(A.pointerId),n.domElement.removeEventListener("pointermove",b),n.domElement.removeEventListener("pointerup",k)),n.dispatchEvent(xl),r=s.NONE}function te(A){let se;switch(A.button){case 0:se=n.mouseButtons.LEFT;break;case 1:se=n.mouseButtons.MIDDLE;break;case 2:se=n.mouseButtons.RIGHT;break;default:se=-1}switch(se){case qn.DOLLY:if(n.enableZoom===!1)return;ae(A),r=s.DOLLY;break;case qn.ROTATE:if(A.ctrlKey||A.metaKey||A.shiftKey){if(n.enablePan===!1)return;X(A),r=s.PAN}else{if(n.enableRotate===!1)return;ee(A),r=s.ROTATE}break;case qn.PAN:if(A.ctrlKey||A.metaKey||A.shiftKey){if(n.enableRotate===!1)return;ee(A),r=s.ROTATE}else{if(n.enablePan===!1)return;X(A),r=s.PAN}break;default:r=s.NONE}r!==s.NONE&&n.dispatchEvent(Gr)}function O(A){switch(r){case s.ROTATE:if(n.enableRotate===!1)return;I(A);break;case s.DOLLY:if(n.enableZoom===!1)return;Z(A);break;case s.PAN:if(n.enablePan===!1)return;he(A);break}}function Y(A){n.enabled===!1||n.enableZoom===!1||r!==s.NONE||(A.preventDefault(),n.dispatchEvent(Gr),de(ge(A)),n.dispatchEvent(xl))}function ge(A){const se=A.deltaMode,ye={clientX:A.clientX,clientY:A.clientY,deltaY:A.deltaY};switch(se){case 1:ye.deltaY*=16;break;case 2:ye.deltaY*=100;break}return A.ctrlKey&&!y&&(ye.deltaY*=10),ye}function ce(A){A.key==="Control"&&(y=!0,document.addEventListener("keyup",me,{passive:!0,capture:!0}))}function me(A){A.key==="Control"&&(y=!1,document.removeEventListener("keyup",me,{passive:!0,capture:!0}))}function Ce(A){n.enabled===!1||n.enablePan===!1||we(A)}function Oe(A){switch(Ee(A),T.length){case 1:switch(n.touches.ONE){case $n.ROTATE:if(n.enableRotate===!1)return;Te(A),r=s.TOUCH_ROTATE;break;case $n.PAN:if(n.enablePan===!1)return;ve(A),r=s.TOUCH_PAN;break;default:r=s.NONE}break;case 2:switch(n.touches.TWO){case $n.DOLLY_PAN:if(n.enableZoom===!1&&n.enablePan===!1)return;z(A),r=s.TOUCH_DOLLY_PAN;break;case $n.DOLLY_ROTATE:if(n.enableZoom===!1&&n.enableRotate===!1)return;at(A),r=s.TOUCH_DOLLY_ROTATE;break;default:r=s.NONE}break;default:r=s.NONE}r!==s.NONE&&n.dispatchEvent(Gr)}function ne(A){switch(Ee(A),r){case s.TOUCH_ROTATE:if(n.enableRotate===!1)return;be(A),n.update();break;case s.TOUCH_PAN:if(n.enablePan===!1)return;Re(A),n.update();break;case s.TOUCH_DOLLY_PAN:if(n.enableZoom===!1&&n.enablePan===!1)return;Ke(A),n.update();break;case s.TOUCH_DOLLY_ROTATE:if(n.enableZoom===!1&&n.enableRotate===!1)return;Ae(A),n.update();break;default:r=s.NONE}}function $e(A){n.enabled!==!1&&A.preventDefault()}function ze(A){T.push(A.pointerId)}function De(A){delete H[A.pointerId];for(let se=0;se<T.length;se++)if(T[se]==A.pointerId){T.splice(se,1);return}}function Ee(A){let se=H[A.pointerId];se===void 0&&(se=new xe,H[A.pointerId]=se),se.set(A.pageX,A.pageY)}function ue(A){const se=A.pointerId===T[0]?T[1]:T[0];return H[se]}n.domElement.addEventListener("contextmenu",$e),n.domElement.addEventListener("pointerdown",M),n.domElement.addEventListener("pointercancel",k),n.domElement.addEventListener("wheel",Y,{passive:!1}),document.addEventListener("keydown",ce,{passive:!0,capture:!0}),this.update()}}class _m extends ft{constructor(e=document.createElement("div")){super(),this.isCSS2DObject=!0,this.element=e,this.element.style.position="absolute",this.element.style.userSelect="none",this.element.setAttribute("draggable",!1),this.center=new xe(.5,.5),this.addEventListener("removed",function(){this.traverse(function(t){t.element instanceof Element&&t.element.parentNode!==null&&t.element.parentNode.removeChild(t.element)})})}copy(e,t){return super.copy(e,t),this.element=e.element.cloneNode(!0),this.center=e.center,this}}const Mi=new L,vl=new Qe,yl=new Qe,bl=new L,Sl=new L;class vm{constructor(e={}){const t=this;let n,s,r,a;const o={objects:new WeakMap},l=e.element!==void 0?e.element:document.createElement("div");l.style.overflow="hidden",this.domElement=l,this.getSize=function(){return{width:n,height:s}},this.render=function(u,g){u.matrixWorldAutoUpdate===!0&&u.updateMatrixWorld(),g.parent===null&&g.matrixWorldAutoUpdate===!0&&g.updateMatrixWorld(),vl.copy(g.matrixWorldInverse),yl.multiplyMatrices(g.projectionMatrix,vl),c(u,u,g),f(u)},this.setSize=function(u,g){n=u,s=g,r=n/2,a=s/2,l.style.width=u+"px",l.style.height=g+"px"};function c(u,g,x){if(u.isCSS2DObject){Mi.setFromMatrixPosition(u.matrixWorld),Mi.applyMatrix4(yl);const m=u.visible===!0&&Mi.z>=-1&&Mi.z<=1&&u.layers.test(x.layers)===!0;if(u.element.style.display=m===!0?"":"none",m===!0){u.onBeforeRender(t,g,x);const v=u.element;v.style.transform="translate("+-100*u.center.x+"%,"+-100*u.center.y+"%)translate("+(Mi.x*r+r)+"px,"+(-Mi.y*a+a)+"px)",v.parentNode!==l&&l.appendChild(v),u.onAfterRender(t,g,x)}const p={distanceToCameraSquared:h(x,u)};o.objects.set(u,p)}for(let m=0,p=u.children.length;m<p;m++)c(u.children[m],g,x)}function h(u,g){return bl.setFromMatrixPosition(u.matrixWorld),Sl.setFromMatrixPosition(g.matrixWorld),bl.distanceToSquared(Sl)}function d(u){const g=[];return u.traverse(function(x){x.isCSS2DObject&&g.push(x)}),g}function f(u){const g=d(u).sort(function(m,p){if(m.renderOrder!==p.renderOrder)return p.renderOrder-m.renderOrder;const v=o.objects.get(m).distanceToCameraSquared,_=o.objects.get(p).distanceToCameraSquared;return v-_}),x=g.length;for(let m=0,p=g.length;m<p;m++)g[m].element.style.zIndex=x-m}}}const ym={fps:0,frameTime:0,drawCalls:0,triangles:0,jsHeapMB:0},El={name:"viridis",inverted:!1,range:[0,1]},Ml={stage:"",progress:0,error:null};class wl{constructor(){this.state={dataset:null,activeView:"reservoir",selected:null,visibleObjectIds:new Set,property:null,timeStep:0,filters:[],colorMap:{...El,range:[...El.range]},loading:{...Ml},metrics:{...ym}},this.listeners=new Set}getState(){return this.state}subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}setState(e){this.state={...this.state,...e},this.listeners.forEach(t=>t(this.state))}setDataset(e){this.setState({dataset:e})}setActiveView(e){this.setState({activeView:e})}setSelection(e){this.setState({selected:e})}setProperty(e){this.setState({property:e})}setTimeStep(e){this.setState({timeStep:e})}addFilter(e){this.setState({filters:[...this.state.filters,e]})}setFilters(e){this.setState({filters:[...e]})}removeFilter(e){const t=[...this.state.filters];t.splice(e,1),this.setState({filters:t})}setColorMap(e){this.setState({colorMap:{...this.state.colorMap,...e}})}setLoading(e){this.setState({loading:{...this.state.loading,...e}})}setMetrics(e){this.setState({metrics:{...this.state.metrics,...e}})}toggleObjectVisibility(e){const t=new Set(this.state.visibleObjectIds);t.has(e)?t.delete(e):t.add(e),this.setState({visibleObjectIds:t})}reset(){this.setState({dataset:null,selected:null,visibleObjectIds:new Set,property:null,timeStep:0,filters:[],loading:{...Ml}})}}const Pt=class Pt{constructor(e,t,n=new wl){this.currentView="reservoir",this.tabs=new Map,this.store=n,this.onChange=t||null}switchTo(e,t=!0){var n;this.currentView=e,this.store.setActiveView(e);for(const[s,r]of this.tabs)r.style.background=s===e?"rgba(31,111,235,.28)":"rgba(22,27,34,0.6)",r.style.color=s===e?"#e6edf3":"#8b949e",r.setAttribute("aria-selected",String(s===e)),r.tabIndex=s===e?0:-1;t&&((n=this.onChange)==null||n.call(this,e))}getActiveView(){return this.currentView}createTabs(){const e=document.createElement("div");e.setAttribute("role","tablist"),e.setAttribute("aria-label","可视化视图"),Object.assign(e.style,{position:"absolute",top:"0",left:"280px",display:"flex",gap:"0",zIndex:"50"});for(const t of Pt.VIEWS){const n=document.createElement("button");n.type="button",n.setAttribute("role","tab"),n.textContent=Pt.VIEW_LABELS[t],Object.assign(n.style,{padding:"8px 16px",cursor:"pointer",background:"rgba(22,27,34,0.6)",border:"1px solid #30363d",borderRadius:"6px 6px 0 0",color:"#8b949e",fontSize:"13px",fontFamily:"-apple-system, sans-serif",userSelect:"none"}),n.addEventListener("click",()=>this.switchTo(t)),n.addEventListener("keydown",s=>{var o;const r=Pt.VIEWS.indexOf(t),a=s.key==="ArrowRight"?(r+1)%Pt.VIEWS.length:s.key==="ArrowLeft"?(r+Pt.VIEWS.length-1)%Pt.VIEWS.length:s.key==="Home"?0:s.key==="End"?Pt.VIEWS.length-1:-1;a<0||(s.preventDefault(),s.stopPropagation(),this.switchTo(Pt.VIEWS[a]),(o=this.tabs.get(Pt.VIEWS[a]))==null||o.focus())}),n.addEventListener("mouseenter",()=>{n.style.background="rgba(88,166,255,0.15)"}),n.addEventListener("mouseleave",()=>{const s=this.currentView===t;n.style.background=s?"rgba(31,111,235,.28)":"rgba(22,27,34,0.6)",n.style.color=s?"#e6edf3":"#8b949e"}),e.appendChild(n),this.tabs.set(t,n)}return this.switchTo(this.currentView,!1),e}};Pt.VIEW_LABELS={reservoir:"储层 3D",wellbore:"井筒 3D",intersection:"剖面",welllog:"测井",network:"管网",benchmark:"基准测试"},Pt.VIEWS=Object.keys(Pt.VIEW_LABELS);let Vi=Pt;const bm=["x-agent-id","x-chat-id","x-project-id","x-project-dir","x-session-project-dir"];function Gn(i,e){var l;const t=`ugsci.visualization.${e}`,n=new Map(Object.entries(i.headers??{}).map(([c,h])=>[c.toLowerCase(),h.trim()])),s=bm.flatMap(c=>{let h=n.get(c);if(c==="x-agent-id"&&h){const d=h.split(",").map(f=>f.trim()).filter(Boolean);h=d[d.length-1]}return h?[[c,h]]:[]}),r=((l=i.persistenceKey)==null?void 0:l.trim())||"";if(!s.length&&!r)return t;const a=i.apiBase.trim();let o=a.split(/[?#]/,1)[0].replace(/\/+$/,"");try{const c=new URL(a,"https://viewer.invalid");o=`${/^[a-z][a-z\d+.-]*:\/\//i.test(a)||a.startsWith("//")?c.origin:""}${c.pathname.replace(/\/+$/,"")}`}catch{o=o.replace(/^(.*?:\/\/)[^/]*@/,"$1")}return`${t}:v1:${encodeURIComponent(JSON.stringify([o,s,r]))}`}class wi{constructor(e,t,n={}){this.options={apiBase:e,authToken:t,...n}}update(e){this.options={...this.options,...e}}async request(e,t={}){const n=this.options.apiBase.replace(/\/$/,""),s=e.startsWith(`${n}/`)?e:`${n}/${e.replace(/^\//,"")}`,r=new Headers(this.options.headers);this.options.authToken&&!r.has("Authorization")&&r.set("Authorization",`Bearer ${this.options.authToken}`),new Headers(t.headers).forEach((o,l)=>r.set(l,o));const a=await(this.options.request||fetch)(s,{...t,headers:r});if(!a.ok){let o="";try{const l=await a.json();o=typeof l.detail=="string"?l.detail:typeof l.error=="string"?l.error:""}catch{}throw new Error(`请求失败（HTTP ${a.status}）${o?`：${o}`:""}`)}return a}async fetchJson(e,t){return(await this.request(e,{signal:t})).json()}async getCapabilities(){return(await this.fetchJson("/capabilities")).capabilities}getManifest(e){return this.fetchJson("/manifest",e)}async fetchBinary(e,t){const n=e.replace(/\\/g,"/").split("/");if(n.some(s=>!s||s==="."||s==="..")||/[:?#]/.test(e))throw new Error("数据资源路径无效");return(await this.request(`/resource/${n.map(encodeURIComponent).join("/")}`,{signal:t})).arrayBuffer()}async createImport(e,t,n,s){const r=new FormData;return r.append("file",e),r.append("name",t),n&&r.append("property_file",n),s&&r.append("companion_file",s),(await this.request("/imports",{method:"POST",body:r})).json()}async createWorkspaceImport(e,t="project",n="",s){const r=await(await this.request("/imports/workspace",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({path:e,root:t,name:n}),signal:s})).json();if(typeof r.job_id!="string"||!r.job_id)throw new Error("导入请求未返回有效任务编号");return r}async deleteDataset(e){return(await this.request(`/datasets/${encodeURIComponent(e)}`,{method:"DELETE"})).json()}async restoreExamples(){return(await this.request("/catalog/restore-examples",{method:"POST"})).json()}getJobStatus(e,t){return this.fetchJson(`/imports/${encodeURIComponent(e)}`,t)}async cancelJob(e){await this.request(`/imports/${encodeURIComponent(e)}/cancel`,{method:"POST"})}async*subscribeToJobEvents(e,t){const n=await this.request(`/imports/${encodeURIComponent(e)}/events`,{signal:t});if(!n.body)throw new Error("服务器未返回任务事件流");const s=n.body.getReader(),r=new TextDecoder;let a="";try{for(;;){const{done:o,value:l}=await s.read();a+=o?r.decode():r.decode(l,{stream:!0});const c=a.split(`
`);a=c.pop()||"",o&&a&&c.push(a);for(const h of c){if(!h.startsWith("data:"))continue;let d;try{d=JSON.parse(h.slice(5).trim())}catch{continue}if(yield d,d.type==="done")return}if(o)return}}finally{try{await s.cancel()}catch{}s.releaseLock()}}}function Tl(i){var t;const e=(t=i.metadata)==null?void 0:t.geometry_primitive;return e==="lines"||e==="triangles"?e:i.source==="network"?"lines":"triangles"}function Sm(i,e,t,n){var r,a,o;const s=((a=(r=i.properties)==null?void 0:r[e])==null?void 0:a.association)??((o=i.metadata)==null?void 0:o.scalar_association);return s==="cell"||s==="point"?s:["las","dlis","wellbore","network"].includes(i.source||"")&&t===n?"point":"cell"}function Al(i,e,t,n){var c;const s=["las","dlis"].includes(i.source||"")&&i.n_indices===0&&i.n_cells===0;if(!e.byteLength||e.byteLength%12!==0||!s&&!t.byteLength||t.byteLength%4!==0)throw new Error("几何缓冲区为空或字节长度无效");const r=new Float32Array(e),a=new Uint32Array(t),o=r.length/3;if(o!==i.n_vertices||a.length!==i.n_indices)throw new Error("几何缓冲区长度与数据目录声明不一致");for(const h of r)if(!Number.isFinite(h))throw new Error("坐标数据包含非有限值");for(const h of a)if(h>=o)throw new Error("几何索引超出顶点范围");if((c=i.metadata)!=null&&c.geometry_primitive&&a.length%(Tl(i)==="lines"?2:3)!==0)throw new Error("几何索引数量与图元类型不一致");let l;if(n){if(!s&&!n.byteLength||n.byteLength%4!==0)throw new Error("单元编号缓冲区无效");if(l=new Uint32Array(n),l.length!==i.n_cells)throw new Error("单元编号数量与数据目录声明不一致")}return{positions:r,indices:a,cellIds:l}}const Vn={viridis:[[.267,.005,.329],[.282,.14,.457],[.254,.265,.53],[.207,.372,.553],[.164,.471,.558],[.138,.567,.55],[.135,.659,.518],[.157,.745,.467],[.215,.813,.398],[.35,.851,.333],[.536,.851,.261],[.737,.813,.185],[.921,.737,.089],[.993,.906,.144]],plasma:[[.051,.028,.528],[.184,.039,.606],[.31,.02,.653],[.431,.004,.678],[.55,.02,.682],[.665,.058,.662],[.773,.137,.616],[.867,.249,.541],[.937,.379,.448],[.98,.516,.345],[.993,.651,.25],[.969,.772,.169],[.921,.873,.102],[.886,.961,.09]],turbo:[[.189,0,.381],[.34,.06,.59],[.47,.08,.87],[.53,.22,.93],[.55,.34,.97],[.56,.45,.96],[.57,.55,.94],[.59,.65,.9],[.62,.73,.83],[.68,.8,.74],[.77,.86,.62],[.87,.91,.48],[.98,.95,.33],[.99,.98,.15]],rainbow:[[0,0,.515],[0,0,1],[0,1,1],[0,1,0],[1,1,0],[1,0,0],[.5,0,0]],gray:[[.1,.1,.1],[.3,.3,.3],[.5,.5,.5],[.7,.7,.7],[.9,.9,.9]]},Em=Object.keys(Vn);function Mm(i,e){const t=Vn[i]||Vn.viridis,s=(Number.isFinite(e)?Math.max(0,Math.min(1,e)):0)*(t.length-1),r=Math.floor(s),a=Math.min(t.length-1,r+1),o=s-r;return[t[r][0]+(t[a][0]-t[r][0])*o,t[r][1]+(t[a][1]-t[r][1])*o,t[r][2]+(t[a][2]-t[r][2])*o]}function wm(i){const e=Vn[i]||Vn.viridis;return"linear-gradient(90deg,"+e.map((n,s)=>{const r=s/Math.max(e.length-1,1)*100,a=Math.round(n[0]*255),o=Math.round(n[1]*255),l=Math.round(n[2]*255);return"rgb("+a+","+o+","+l+") "+r+"%"}).join(",")+")"}function Cl(i,e,t,n,s="cell",r=Vn){if(!Number.isSafeInteger(n)||n<=0||!i.length)throw new Error("属性数据为空或顶点数量无效");if(s==="point"&&i.length!==n)throw new Error("点属性数量与顶点数量不一致");if(s==="cell"&&(!e.length||e.length%i.length!==0))throw new Error("单元属性数量与网格拓扑不一致");const a=r[t]||r.viridis;let o=1/0,l=-1/0,c=0;for(const g of i)Number.isFinite(g)&&(o=Math.min(o,g),l=Math.max(l,g),c++);c||(o=0,l=1);const h=l-o||1,d=new Float32Array(n*3),f=new Uint32Array(n),u=s==="point"?1:e.length/i.length;for(let g=0;g<i.length;g++){if(!Number.isFinite(i[g]))continue;const x=Math.max(0,Math.min(1,(i[g]-o)/h))*(a.length-1),m=Math.floor(x),p=Math.min(a.length-1,m+1),v=x-m;for(let _=0;_<u;_++){const w=s==="point"?g:e[g*u+_];if(w>=n)throw new Error("属性拓扑索引超出顶点范围");for(let P=0;P<3;P++)d[w*3+P]+=a[m][P]+(a[p][P]-a[m][P])*v;f[w]++}}for(let g=0;g<n;g++)for(let x=0;x<3;x++)d[g*3+x]=f[g]?d[g*3+x]/f[g]:.45;return{colors:d,smin:o,smax:l,validCount:c}}const Tm={dataset:"数据集",property:"着色属性",timeStep:"时间步",play:"动态播放",colorRamp:"色带",opacity:"不透明度",wireframe:"网格边线",filterIJK:"网格范围",propertyRange:"属性范围",excludeRange:"排除范围",isolateK:"单层显示",kLayer:"K 层",zScale:"垂向放大",orthographic:"正交投影",clipPlane:"水平裁切",clipDepth:"裁切位置",polyline:"剖面折线",zRange:"高程范围",intersection:"生成剖面",wellSection:"井剖面",slice:"切片位置",extractSlice:"提取切片",capture:"场景截图",stats:"属性统计",exportCsv:"导出数据",exportScene:"导出场景",importFile:"本地导入",importWorkspace:"工作区导入",deleteObject:"移除对象",axes:"坐标轴",floorGrid:"参考网格",wellLabels:"井名标签",legend:"色带图例",histogram:"属性分布",wellMap:"井位平面图",compass:"指北针",background:"背景颜色"},Am={porosity:"孔隙度",poro:"孔隙度",permeability:"渗透率",permi:"I 向渗透率",permj:"J 向渗透率",permk:"K 向渗透率",permx:"X 向渗透率",permy:"Y 向渗透率",permz:"Z 向渗透率",facies:"岩相",pressure:"压力",pres:"压力",temperature:"温度",flow_rate:"流量",diameter:"管径",velocity:"流速",mass_flow:"质量流量",density:"密度",sgas:"含气饱和度",swat:"含水饱和度",soil:"含油饱和度",depth:"深度",md:"测深",gr:"自然伽马",gk:"自然伽马",rhob:"密度测井",nphi:"中子孔隙度"};function Cm(i){return Tm[i]||i}function bn(i,e){var s;const t=(s=e==null?void 0:e.properties)==null?void 0:s[i],n=(t==null?void 0:t.label)||Am[i.toLowerCase()]||i;return t!=null&&t.unit?`${n}（${t.unit}）`:n}function Rl(i){return{viridis:"蓝绿黄",plasma:"紫红黄",turbo:"高对比彩色",rainbow:"彩虹",gray:"灰度"}[i]||i}const At={treeWidth:256,treeCollapsed:36,inspectorWidth:300,inspectorCollapsed:36,slicePlayerHeight:32};function Ll(i,e){return{left:i?At.treeCollapsed:At.treeWidth,right:e?At.inspectorCollapsed:At.inspectorWidth}}function Rm(i){return{treeCollapsed:i>0&&i<760,inspectorCollapsed:i>0&&i<1100}}function Lm(i){var u,g,x,m,p,v;const{left:e,right:t}=Ll(i.treeCollapsed,i.inspectorCollapsed),n=8,s=`${e+n}px`,r=`${t+n}px`,a=8,o=At.slicePlayerHeight,l=i.containerWidth||((u=i.tree.parentElement)==null?void 0:u.clientWidth)||1/0,c=i.containerHeight||((g=i.tree.parentElement)==null?void 0:g.clientHeight)||1/0,h=Math.max(0,l-e-t-n*2),d=h<640||c<540,f=h<420;i.tree.style.left="0",i.tree.style.right="auto",i.tree.style.width=`${i.treeCollapsed?At.treeCollapsed:At.treeWidth}px`,i.inspector.style.left="auto",i.inspector.style.right="0",i.inspector.style.width=`${i.inspectorCollapsed?At.inspectorCollapsed:At.inspectorWidth}px`,(x=i.toolbar)==null||x.style.setProperty("left",s),(m=i.toolbar)==null||m.style.setProperty("right",r),(p=i.tabs)==null||p.style.setProperty("left",s),(v=i.tabs)==null||v.style.setProperty("right",r);for(const _ of[i.toolbar,i.tabs])if(_){_.style.whiteSpace="nowrap",_.style.overflowX="auto",_.style.overflowY="hidden",_.style.flexWrap="nowrap",_.style.minWidth="0",_.style.pointerEvents="auto";for(const w of Array.from(_.children))w.style.flexShrink="0",w.style.whiteSpace="nowrap"}for(const _ of[i.wellMap,i.readout,i.hud,i.histogram])_&&(_.style.visibility=d?"hidden":"");if(i.compass&&(i.compass.style.visibility=f?"hidden":""),i.slicePlayer){i.slicePlayer.style.left=s,i.slicePlayer.style.right=r,i.slicePlayer.style.bottom=`${a}px`,i.slicePlayer.style.overflowX="auto";const _=i.slicePlayer.querySelector('input[type="range"]');_&&(_.style.minWidth="24px")}i.info&&(i.info.style.left=s,i.info.style.right=r,i.info.style.maxWidth="none",i.info.style.whiteSpace="nowrap",i.info.style.overflow="hidden",i.info.style.textOverflow="ellipsis",i.info.style.bottom=`${a+o+6}px`),i.wellMap&&(i.wellMap.style.left=s,i.wellMap.style.bottom=`${a+o+28}px`),i.viewCluster&&(i.viewCluster.style.left=s,i.viewCluster.style.top="88px"),i.compass&&(i.compass.style.left="auto",i.compass.style.right=r,i.compass.style.bottom=`${a+o+6}px`),i.readout&&(i.readout.style.right="auto",i.readout.style.bottom="252px",i.readout.style.left=s),i.hud&&(i.hud.style.right="auto",i.hud.style.top="88px",i.hud.style.left=`${e+n+104}px`),i.legend&&(i.legend.style.right=r,i.legend.style.left="auto",i.legend.style.maxWidth=`max(0px, calc(100% - ${e+t+n*2}px))`,i.legend.style.bottom=`${a+o+114}px`),i.histogram&&(i.histogram.style.right=r,i.histogram.style.bottom=`${a+o+182}px`,i.histogram.style.left="auto"),i.details&&(i.details.style.right=r,i.details.style.left="auto",i.details.style.width="270px",i.details.style.maxWidth=`max(0px, calc(100% - ${e+t+n*2}px))`,i.details.style.boxSizing="border-box",i.details.style.maxHeight=d?"40%":"min(260px, calc(100% - 370px))",i.details.style.overflowY="auto",i.details.style.bottom=`${a+o+(d?186:246)}px`),i.wellLog&&(i.wellLog.style.right=r,i.wellLog.style.top="88px",i.wellLog.style.bottom="16px",i.wellLog.style.maxWidth=`max(0px, calc(100% - ${e+t+n*2}px))`),i.shortcuts&&(i.shortcuts.style.left=s,i.shortcuts.style.right=r,i.shortcuts.style.maxHeight="calc(100% - 100px)",i.shortcuts.style.overflowY="auto")}const Pm=new Set(["wellbore","las","dlis","well","trajectory"]);function Dm(i){return Pm.has(i||"")}function Pl(i){if(!Dm(i.source))return null;const e=i.metadata||{};return e.placement==="spatial"||e.spatial===!0?"spatial":e.placement==="depth-only"||e.spatial===!1||i.source==="las"||i.source==="dlis"?"depth-only":"spatial"}function tt(i){return Pl(i)==="spatial"}function Ct(i){return Pl(i)==="depth-only"}const Im=new Set(["las","dlis","network","network-tube","wellbore","well","trajectory","surface","intersection","well-intersection","slice"]);function Nt(i){return i.grid_dims&&i.grid_dims.length>=3?!0:!Im.has(i.source||"")}function ln(i){const e=i.metadata||{};return typeof e.well_name=="string"&&e.well_name.trim()?e.well_name.trim():i.name.replace(/^Well:\s*/i,"").replace(/\s*\([^)]*\)\s*$/,"").trim()||i.id}function Um(i,e=256){if(i.length<=e)return i;const t=i.length-1,n=[];for(let s=0;s<e-1;s++)n.push(i[Math.round(s*t/(e-1))]);return n.push(i[t]),n}function Vr(i,e=1e-4){const t=[],n=e*e;for(let s=0;s+2<i.length;s+=3){const r=[i[s],i[s+1],i[s+2]];if(!r.every(Number.isFinite))continue;const a=t[t.length-1];if(!a){t.push(r);continue}const o=r[0]-a[0],l=r[1]-a[1],c=r[2]-a[2];o*o+l*l+c*c>n&&t.push(r)}return t}function Nm(i){if(i.length<2)return 2;let e=0,t=i[0][0],n=i[0][0],s=i[0][1],r=i[0][1],a=i[0][2],o=i[0][2];for(let c=1;c<i.length;c++){const[h,d,f]=i[c],[u,g,x]=i[c-1],m=h-u,p=d-g,v=f-x;e+=Math.sqrt(m*m+p*p+v*v),t=Math.min(t,h),n=Math.max(n,h),s=Math.min(s,d),r=Math.max(r,d),a=Math.min(a,f),o=Math.max(o,f)}const l=Math.max(n-t,r-s,o-a,e,1);return Math.min(Math.max(l*.004,1.5),80)}const Dl=[{id:"grids",title:"网格"},{id:"wells",title:"井"},{id:"logs",title:"测井"},{id:"surfaces",title:"层面 / 剖面"},{id:"networks",title:"管网"}];function Om(i){if(Nt(i))return"grids";if(tt(i))return"wells";if(Ct(i))return"logs";const e=i.source||"";return["surface","intersection","well-intersection","slice"].includes(e)?"surfaces":["network","network-tube"].includes(e)?"networks":"other"}function Fm(i,e){var s;const t=e.trim().toLowerCase();if(!t)return!0;const n=typeof((s=i.metadata)==null?void 0:s.well_name)=="string"?i.metadata.well_name:"";return[i.id,i.name,n,i.source||"",ln(i)].join(" ").toLowerCase().includes(t)}function Sn(i){return tt(i)||Ct(i)?ln(i):i.name}function Bm(i,e,t){var o;i.innerHTML="";const n=e.filter(l=>Fm(l,t.query)),s=new Map;for(const l of Dl)s.set(l.id,[]);s.set("other",[]);for(const l of n){const c=Om(l);(o=s.get(c))==null||o.push(l)}let r=0;for(const l of Dl){const c=s.get(l.id)||[];t.query.trim()&&c.length===0||(r+=c.length,i.appendChild(Il(l.id,l.title,c,t)))}const a=s.get("other")||[];if(a.length>0&&(r+=a.length,i.appendChild(Il("other","其他",a,t))),r===0){const l=document.createElement("div");l.textContent=t.query.trim()?"没有匹配的对象":"暂无对象",l.style.cssText="padding:10px 8px;color:#484f58;",i.appendChild(l)}}function Il(i,e,t,n){const s=!n.query.trim()&&n.collapsedGroups.has(i),r=document.createElement("div");r.dataset.groupId=i,r.style.cssText="margin-bottom:6px;";const a=document.createElement("button");a.type="button",a.setAttribute("aria-expanded",String(!s)),a.style.cssText=["display:flex;align-items:center;gap:6px;width:100%;","background:transparent;border:0;color:#8b949e;cursor:pointer;","font:600 11px/1.2 -apple-system,sans-serif;letter-spacing:.04em;","padding:6px 4px;text-align:left;"].join("");const o=document.createElement("span");o.textContent=s?">":"v",o.style.cssText="width:10px;color:#6e7681;";const l=document.createElement("span");l.textContent=e.toUpperCase();const c=document.createElement("span");if(c.textContent=String(t.length),c.style.cssText="margin-left:auto;color:#484f58;font-weight:500;",a.append(o,l,c),a.addEventListener("click",()=>n.onToggleGroup(i)),r.appendChild(a),s)return r;if(t.length===0){const h=document.createElement("div");return h.textContent="空",h.style.cssText="padding:2px 8px 8px 22px;color:#484f58;font-size:11px;",r.appendChild(h),r}for(const h of t)r.appendChild(km(h,n));return r}function km(i,e){const t=document.createElement("div");t.setAttribute("role","group"),t.setAttribute("aria-label",Sn(i));const n=i.id===e.activeId,s=i.id===e.selectedId,r=Ct(i);t.dataset.datasetId=i.id,t.dataset.selected=String(s||n),t.style.cssText=["display:flex;align-items:flex-start;gap:6px;","padding:5px 6px 5px 8px;margin:1px 0;border-radius:5px;cursor:pointer;",s||n?"background:rgba(31,111,235,.22);color:#e6edf3;":"background:transparent;color:#8b949e;",s||n?"box-shadow:inset 2px 0 #58a6ff;":"box-shadow:none;"].join("");const a=document.createElement("input");a.type="checkbox",a.checked=e.visibleIds.has(i.id),a.style.cssText="margin:3px 0 0;flex:0 0 auto;",r?(a.checked=!1,a.disabled=!0,a.title="纯深度测井无法在三维视图显示"):a.title="显示/隐藏 "+Sn(i),a.setAttribute("aria-label","显示/隐藏 "+Sn(i)),a.addEventListener("click",h=>h.stopPropagation()),a.addEventListener("change",()=>e.onToggleVisible(i,a.checked));const o=document.createElement("button");o.type="button",o.setAttribute("aria-label","选择 "+Sn(i)),o.setAttribute("aria-pressed",String(s||n)),o.style.cssText="min-width:0;flex:1;border:0;padding:0;background:transparent;text-align:left;color:inherit;cursor:pointer;";const l=document.createElement("div");l.textContent=r?Sn(i)+"（仅深度）":Sn(i),l.style.cssText="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12px;line-height:1.3;";const c=document.createElement("div");if(c.textContent=zm(i),c.style.cssText="color:#6e7681;font-size:10px;margin-top:1px;",o.append(l,c),t.append(a,o),e.onDelete){const h=document.createElement("button");h.type="button",h.textContent="×",h.title="移除 "+Sn(i),h.setAttribute("aria-label","移除 "+Sn(i)),h.style.cssText="flex:0 0 auto;width:18px;height:18px;margin-top:2px;padding:0;border:0;background:transparent;color:#6e7681;cursor:pointer;font-size:14px;line-height:18px;",h.addEventListener("click",d=>{d.stopPropagation(),e.onDelete(i)}),h.addEventListener("mouseenter",()=>{h.style.color="#f85149"}),h.addEventListener("mouseleave",()=>{h.style.color="#6e7681"}),t.appendChild(h)}return t.title=r?i.name+" · 仅深度，打开「测井」页签":i.name+" · "+i.n_cells.toLocaleString()+" 单元",t.addEventListener("click",()=>e.onSelect(i)),t.addEventListener("dblclick",h=>{h.preventDefault(),e.onFocus(i)}),t.addEventListener("contextmenu",h=>{var d;h.preventDefault(),h.stopPropagation(),(d=e.onContextMenu)==null||d.call(e,i,h)}),t.addEventListener("mouseenter",()=>{t.dataset.selected!=="true"&&(t.style.color="#58a6ff")}),t.addEventListener("mouseleave",()=>{t.dataset.selected!=="true"&&(t.style.color="#8b949e")}),t}function zm(i){return Ct(i)?"测井曲线":tt(i)?"井轨迹":i.grid_dims&&i.grid_dims.length>=3?i.grid_dims[0]+" x "+i.grid_dims[1]+" x "+i.grid_dims[2]:i.n_cells>0?i.n_cells.toLocaleString()+" 单元":i.source||"对象"}const Ds=18;function Ul(i,e){let t=1/0,n=1/0,s=-1/0,r=-1/0;const a=(o,l)=>{!Number.isFinite(o)||!Number.isFinite(l)||(t=Math.min(t,o),n=Math.min(n,l),s=Math.max(s,o),r=Math.max(r,l))};for(const o of i){a(o.x,o.y);for(const[l,c]of o.path||[])a(l,c)}return e&&(a(e.minX,e.minY),a(e.maxX,e.maxY)),Number.isFinite(t)?(s-t<1&&(t-=250,s+=250),r-n<1&&(n-=250,r+=250),{minX:t,minY:n,maxX:s,maxY:r}):null}function Nl(i,e,t){const n=Math.max(i.maxX-i.minX,1),s=Math.max(i.maxY-i.minY,1),r=Math.max(e-Ds*2,1),a=Math.max(t-Ds*2,1),o=Math.min(r/n,a/s),l=Ds+(r-n*o)/2,c=Ds+(a-s*o)/2;return{toPixel(h,d){return[l+(h-i.minX)*o,t-(c+(d-i.minY)*o)]},fromPixel(h,d){return[i.minX+(h-l)/o,i.minY+(t-d-c)/o]}}}function Hm(i,e,t,n,s,r,a=14){const o=Nl(e,t,n);let l=null,c=a*a;for(const h of i){const[d,f]=o.toPixel(h.x,h.y),u=d-s,g=f-r,x=u*u+g*g;x<=c&&(c=x,l=h.id)}return l}function Gm(){const i=document.createElement("div");i.className="oilgas-well-map",Object.assign(i.style,{position:"absolute",width:"228px",height:"176px",background:"rgba(13,17,23,.92)",border:"1px solid #30363d",borderRadius:"8px",zIndex:"16",overflow:"hidden",boxSizing:"border-box"});const e=document.createElement("div");e.textContent="井位平面图",e.style.cssText="position:absolute;top:6px;left:8px;font:600 11px/1 -apple-system,sans-serif;color:#8b949e;pointer-events:none;",i.appendChild(e);const t=document.createElement("canvas");return t.width=228,t.height=176,t.style.cssText="display:block;width:100%;height:100%;cursor:pointer;",t.title="点击井位以选中并聚焦",i.appendChild(t),{root:i,canvas:t}}function Vm(i,e,t,n){const s=i.getContext("2d");if(!s)return;const r=i.width,a=i.height;s.clearRect(0,0,r,a),s.fillStyle="#0d1117",s.fillRect(0,0,r,a);const o=Ul(e,n);if(!o){s.fillStyle="#484f58",s.font="11px sans-serif",s.fillText("暂无井位",16,a/2);return}const l=Nl(o,r,a);if(n){const[c,h]=l.toPixel(n.minX,n.minY),[d,f]=l.toPixel(n.maxX,n.maxY);s.strokeStyle="#30363d",s.lineWidth=1,s.strokeRect(Math.min(c,d),Math.min(h,f),Math.abs(d-c),Math.abs(f-h))}s.lineWidth=1.4;for(const c of e){const h=c.id===t;c.path&&c.path.length>1&&(s.beginPath(),c.path.forEach(([u,g],x)=>{const[m,p]=l.toPixel(u,g);x===0?s.moveTo(m,p):s.lineTo(m,p)}),s.strokeStyle=h?"#ffd166":"#6e7681",s.stroke());const[d,f]=l.toPixel(c.x,c.y);s.beginPath(),s.arc(d,f,h?5:3.5,0,Math.PI*2),s.fillStyle=h?"#ffd166":"#58a6ff",s.fill(),(h||e.length<=12)&&(s.fillStyle=h?"#e6edf3":"#8b949e",s.font="10px sans-serif",s.fillText(c.name,d+7,f+3))}}function Wm(){const i=document.createElement("div");return i.className="oilgas-readout",Object.assign(i.style,{position:"absolute",minWidth:"210px",maxWidth:"280px",background:"rgba(13,17,23,.92)",border:"1px solid #30363d",borderRadius:"8px",padding:"8px 10px",fontFamily:"ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",fontSize:"11px",color:"#c9d1d9",pointerEvents:"none",zIndex:"18",boxSizing:"border-box"}),i.innerHTML=['<div style="color:#8b949e;font:600 10px/1 -apple-system,sans-serif;letter-spacing:.06em;margin-bottom:6px;">选中对象</div>','<div data-readout="selected" style="color:#e6edf3;font-weight:600;margin-bottom:2px;">—</div>','<div data-readout="meta" style="color:#8b949e;margin-bottom:8px;">将指针移到场景中拾取</div>','<div style="color:#8b949e;font:600 10px/1 -apple-system,sans-serif;letter-spacing:.06em;margin-bottom:6px;">拾取坐标</div>',Wr("东向 X","easting"),Wr("北向 Y","northing"),Wr("垂向 Z","tvd")].join(""),i}function Wr(i,e){return['<div style="display:flex;justify-content:space-between;gap:12px;margin:2px 0;">','<span style="color:#8b949e;">'+i+"</span>",'<span data-readout="'+e+'" style="color:#58a6ff;font-weight:600;">—</span>',"</div>"].join("")}function Xm(i,e){const t=i.querySelector('[data-readout="selected"]'),n=i.querySelector('[data-readout="meta"]');t&&(t.textContent=e.selectedLabel||"—"),n&&(n.textContent=e.selectedMeta||(e.pickKind?e.pickKind:"未选中对象"));const s=e.hover;Xr(i,"easting",s?jr(s[0]):"—"),Xr(i,"northing",s?jr(s[1]):"—"),Xr(i,"tvd",s?jr(s[2]):"—")}function Xr(i,e,t){const n=i.querySelector('[data-readout="'+e+'"]');n&&(n.textContent=t)}function jr(i){if(!Number.isFinite(i))return"—";const e=Math.abs(i);return e>=1e3?i.toFixed(1):e>=1?i.toFixed(2):i.toPrecision(4)}const En=[{id:"controls",label:"属性"},{id:"actions",label:"操作"},{id:"addons",label:"扩展"}];let jm=0;function qm(i){let e="controls";const t=`oilgas-inspector-${++jm}`,n=document.createElement("div");n.className="oilgas-inspector-tabs",n.setAttribute("role","tablist"),n.setAttribute("aria-label","场景属性面板"),n.style.cssText=["display:flex;gap:4px;padding:0 0 8px;margin:0 0 8px;","border-bottom:1px solid #30363d;flex:0 0 auto;"].join("");const s={},r=new Map,a=new Map,o=()=>{for(const c of En){const h=c.id===e,d=r.get(c.id),f=s[c.id];d&&(d.style.background=h?"rgba(31,111,235,.32)":"transparent",d.style.color=h?"#e6edf3":"#8b949e",d.setAttribute("aria-selected",String(h)),d.tabIndex=h?0:-1),f&&(f.style.display=h?"block":"none")}};for(const c of En){const h=document.createElement("button");h.type="button",h.dataset.tab=c.id,h.setAttribute("role","tab"),h.id=`${t}-${c.id}-tab`,h.setAttribute("aria-controls",`${t}-${c.id}-pane`),h.title=c.label,h.style.cssText=["flex:1;display:flex;align-items:center;justify-content:center;gap:6px;","padding:6px 4px;border:1px solid #30363d;border-radius:6px;","background:transparent;color:#8b949e;cursor:pointer;","font:600 11px/1 -apple-system,sans-serif;"].join("");const d=document.createElement("span");d.textContent=c.label;const f=document.createElement("span");f.dataset.badge=c.id,f.style.cssText=["min-width:16px;padding:1px 5px;border-radius:999px;","background:#21262d;color:#8b949e;font:600 10px/1.4 monospace;"].join(""),f.textContent="0",h.append(d,f),h.addEventListener("click",()=>{e=c.id,o()}),h.addEventListener("keydown",g=>{var p;const x=En.findIndex(v=>v.id===e),m=g.key==="ArrowRight"?(x+1)%En.length:g.key==="ArrowLeft"?(x+En.length-1)%En.length:g.key==="Home"?0:g.key==="End"?En.length-1:-1;m<0||(g.preventDefault(),g.stopPropagation(),e=En[m].id,o(),(p=r.get(e))==null||p.focus())}),n.appendChild(h),r.set(c.id,h),a.set(c.id,f);const u=document.createElement("div");u.id=`${t}-${c.id}-pane`,u.setAttribute("role","tabpanel"),u.setAttribute("aria-labelledby",h.id),u.dataset.inspectorPane=c.id,u.style.cssText="display:none;padding-bottom:8px;",s[c.id]=u}const l=document.createElement("div");return l.className="oilgas-inspector-footer",l.style.cssText=["flex:0 0 auto;display:flex;align-items:center;gap:6px;","padding-top:8px;margin-top:8px;border-top:1px solid #30363d;"].join(""),o(),{tabBar:n,panes:s,footer:l,setTab:c=>{e=c,o()},setBadge:(c,h)=>{const d=a.get(c);d&&(d.textContent=String(Number.isFinite(h)?Math.max(0,Math.floor(h)):0))},active:()=>e}}function qr(){const i=document.createElement("div");i.style.cssText="display:flex;flex-direction:column;gap:0;";const e=document.createElement("div");e.style.cssText=["display:grid;grid-template-columns:42% 1fr;gap:8px;","padding:4px 2px 6px;color:#6e7681;font:600 10px/1 -apple-system,sans-serif;","letter-spacing:.06em;text-transform:uppercase;border-bottom:1px solid #21262d;"].join("");const t=document.createElement("div");t.textContent="项目";const n=document.createElement("div");n.textContent="设置",e.append(t,n);const s=document.createElement("div");return i.append(e,s),{table:i,body:s}}function We(i,e,t){e=Cm(e);const n=document.createElement("div");n.style.cssText=["display:grid;grid-template-columns:42% 1fr;gap:8px;align-items:center;","padding:7px 2px;border-bottom:1px solid rgba(48,54,61,.45);"].join("");const s=document.createElement("div");s.textContent=e,s.style.cssText="color:#8b949e;font-size:11px;word-break:break-word;";const r=document.createElement("div");r.style.minWidth="0";const a=t.matches("input,select,textarea")?[t]:Array.from(t.querySelectorAll("input,select,textarea"));for(const o of a)!o.hasAttribute("aria-label")&&!o.hasAttribute("aria-labelledby")&&o.setAttribute("aria-label",e);return t.getAttribute("role")==="group"&&t.setAttribute("aria-label",e),r.appendChild(t),n.append(s,r),i.appendChild(n),n}function Ot(i,e,t){const n=document.createElement("div");n.setAttribute("role","group"),n.style.cssText="display:flex;border:1px solid #30363d;border-radius:5px;overflow:hidden;height:24px;";const s=document.createElement("input");s.type="checkbox",s.id=i,s.checked=e,s.style.cssText="position:absolute;opacity:0;width:0;height:0;",s.tabIndex=-1,s.setAttribute("aria-hidden","true");const r=Ol("关闭"),a=Ol("开启"),o=()=>{const c=s.checked;r.style.background=c?"transparent":"#1f6feb",r.style.color=c?"#8b949e":"#fff",a.style.background=c?"#1f6feb":"transparent",a.style.color=c?"#fff":"#8b949e",r.setAttribute("aria-pressed",String(!c)),a.setAttribute("aria-pressed",String(c))},l=c=>{s.checked!==c&&(s.checked=c,o(),t(c))};return r.addEventListener("click",()=>l(!1)),a.addEventListener("click",()=>l(!0)),s.addEventListener("change",()=>{o(),t(s.checked)}),s.addEventListener("ugsci-sync",()=>o()),n.append(s,r,a),o(),n}function Ol(i){const e=document.createElement("button");return e.type="button",e.textContent=i,e.style.cssText=["flex:1;border:0;background:transparent;color:#8b949e;cursor:pointer;","font:600 11px/24px -apple-system,sans-serif;padding:0;"].join(""),e}function bt(i,e){const t=(e==null?void 0:e.tone)||"default",n=document.createElement("button");n.type="button",n.textContent=i;const s={default:{bg:"#30363d",fg:"#c9d1d9",bd:"#484f58"},primary:{bg:"#1f6feb",fg:"#fff",bd:"#388bfd"},danger:{bg:"#da3633",fg:"#fff",bd:"#f85149"}}[t];return Object.assign(n.style,{width:"100%",padding:"7px",background:s.bg,color:s.fg,border:"1px solid "+s.bd,borderRadius:"6px",cursor:"pointer",fontSize:"12px",marginBottom:"8px"}),n}const Fl=["egrid","grid","grdecl","init","unrst","roff","roffbin","dat","sr3","irf","data","model","tnav","tpr","las","las3","dlis","vtk","vtu","pvtu","vti","xdmf","csv","arrow","parquet","json"],Bl=["egrid","grid","grdecl","roff","roffbin","dat","sr3","data","model","tnav","tpr","las","las3","dlis","vtk","vtu","pvtu","vti","xdmf","csv","arrow","parquet","json"];function Ti(i){const e=i.trim(),t=e.lastIndexOf(".");return t<0||t===e.length-1?"":e.slice(t+1).toLowerCase()}function kl(i){return Fl.includes(Ti(i))}function $m(){return Fl.map(i=>`.${i}`).join(",")}function Ym(i){const e=Array.from(i).filter(l=>kl(l.name));if(e.length===0)return null;const t=[...e].sort((l,c)=>{const h=Bl.indexOf(Ti(l.name)),d=Bl.indexOf(Ti(c.name));return(h<0?99:h)-(d<0?99:d)}),n=t[0],s=Ti(n.name),r=n.name.replace(/\.[^.]+$/,"").toLowerCase(),a=["egrid","grid","grdecl","data"].includes(s)?["init","unrst"]:["dat","sr3"].includes(s)?["dat","sr3","irf"]:[],o=t.slice(1).find(l=>l.name.replace(/\.[^.]+$/,"").toLowerCase()===r&&Ti(l.name)!==s&&a.includes(Ti(l.name)));return{primary:n,companion:o,extra:t.slice(1).filter(l=>l!==o)}}async function Km(i,e){var a,o,l;const t=(a=window.QwenPaw)==null?void 0:a.host;if(t!=null&&t.fetch)return t.fetch(i,e);const n=((o=t==null?void 0:t.getApiUrl)==null?void 0:o.call(t,i.replace(/^\//,"")))||i,s=((l=t==null?void 0:t.getApiToken)==null?void 0:l.call(t))||"",r=new Headers(e==null?void 0:e.headers);return s&&!r.has("Authorization")&&r.set("Authorization",`Bearer ${s}`),fetch(n,{...e,headers:r})}async function Jm(i){const e=new URLSearchParams;i.path&&e.set("path",i.path),e.set("root",i.root||"project"),i.cursor&&e.set("cursor",i.cursor);const t=i.apiBase?await new wi(i.apiBase.replace(/\/ugsci\/visualization\/?$/,"")+"/workspace",i.authToken,{headers:i.headers,request:i.request}).request(`/tree?${e.toString()}`,{signal:i.signal}):await Km(`/workspace/tree?${e.toString()}`,{signal:i.signal});if(!t.ok){const n=await t.text().catch(()=>"");throw new Error(n||`工作区列表失败: HTTP ${t.status}`)}return t.json()}async function zl(i){var t,n,s,r;if(!i.jobId||typeof i.jobId!="string")throw new Error("导入任务未返回有效编号，请重试");const e=new wi(i.apiBase,i.authToken,i);for(let a=0;a<240;a+=1){if((t=i.signal)!=null&&t.aborted)throw new Error("导入已取消");const o=await e.getJobStatus(i.jobId,i.signal),l=Number(o.progress),c={pending:"等待处理",queued:"排队中",running:"处理中",completed:"已完成",failed:"失败",cancelled:"已取消"};if((n=i.onProgress)==null||n.call(i,Number.isFinite(l)?Math.max(0,Math.min(1,l)):0,c[String(o.status)]||"处理中"),o.status==="completed"){const h=(s=o.result)==null?void 0:s.id;if(!h)throw new Error("导入完成但未返回数据集 ID");return{id:h,name:((r=o.result)==null?void 0:r.name)||o.name}}if(o.status==="failed"||o.status==="cancelled")throw new Error(o.error||(o.status==="cancelled"?"导入已取消":"导入失败"));await new Promise(h=>window.setTimeout(h,750))}throw new Error("导入超时，请稍后在组件树中查看是否已出现新对象")}function Zm(){return["position:absolute;inset:0;z-index:240;display:flex;align-items:center;justify-content:center;","background:rgba(1,4,9,.62);padding:18px;box-sizing:border-box;"].join("")}function Qm(){return["width:min(520px,100%);max-height:min(520px,100%);overflow:auto;","background:#161b22;border:1px solid #30363d;border-radius:10px;","color:#c9d1d9;font:13px/1.4 -apple-system,sans-serif;padding:14px;","box-shadow:0 12px 40px rgba(0,0,0,.45);"].join("")}function Ai(i="default"){return`padding:6px 10px;border:1px solid;border-radius:6px;cursor:pointer;font-size:12px;${{default:"background:#21262d;color:#c9d1d9;border-color:#484f58;",primary:"background:#1f6feb;color:#fff;border-color:#388bfd;",ghost:"background:transparent;color:#8b949e;border-color:#30363d;"}[i]}`}function eg(i){const e=document.createElement("input");return e.type="file",e.multiple=!0,e.accept=$m(),e.style.display="none",e.setAttribute("aria-hidden","true"),e.addEventListener("change",()=>{const t=Array.from(e.files||[]);e.value="",t.length&&i(t)}),e}function tg(i,e){const t=s=>{var r;(r=s.dataTransfer)!=null&&r.types.includes("Files")&&(s.preventDefault(),s.dataTransfer.dropEffect="copy")},n=s=>{var r,a;(a=(r=s.dataTransfer)==null?void 0:r.files)!=null&&a.length&&(s.preventDefault(),e(Array.from(s.dataTransfer.files)))};return i.addEventListener("dragover",t),i.addEventListener("drop",n),()=>{i.removeEventListener("dragover",t),i.removeEventListener("drop",n)}}async function ng(i,e){const t=Ym(e);if(!t){i.onStatus("没有可导入的油气文件（EGRID/GRDECL/DAT/SR3/LAS/ROFF 等）");return}i.onStatus(t.companion?`正在上传 ${t.primary.name} + ${t.companion.name}...`:`正在上传 ${t.primary.name}...`);const s=await new wi(i.apiBase,i.authToken,i).createImport(t.primary,t.primary.name.replace(/\.[^.]+$/,""),void 0,t.companion),r=await zl({apiBase:i.apiBase,authToken:i.authToken,headers:i.headers,request:i.request,jobId:s.job_id,onProgress:(a,o)=>{i.onStatus(`后台解析 ${t.primary.name}（${o} ${Math.round(a*100)}%）`)}});await i.onImported(r.id),t.extra.length&&i.onStatus(`已导入 ${r.name||r.id}；其余 ${t.extra.length} 个文件未导入，请逐个导入，或使用「从工作区导入」自动匹配伴随文件`)}async function ig(i,e,t){const n=e.split("/").pop()||e;i.onStatus(`正在从工作区提交 ${n}...`);const r=await new wi(i.apiBase,i.authToken,i).createWorkspaceImport(e,t,n.replace(/\.[^.]+$/,"")),a=await zl({apiBase:i.apiBase,authToken:i.authToken,headers:i.headers,request:i.request,jobId:r.job_id,onProgress:(o,l)=>{i.onStatus(`后台解析 ${n}（${l} ${Math.round(o*100)}%）`)}});await i.onImported(a.id)}const $r=new WeakMap;function sg(i){var H;(H=$r.get(i.container))==null||H();const e=document.activeElement instanceof HTMLElement?document.activeElement:null;let t=!1,n=0,s=null;const r=document.createElement("div");r.style.cssText=Zm(),r.setAttribute("role","dialog"),r.setAttribute("aria-label","从工作区导入"),r.setAttribute("aria-modal","true");const a=document.createElement("div");a.style.cssText=Qm();const o=document.createElement("div");o.textContent="从工作区导入",o.style.cssText="font-weight:600;color:#e6edf3;margin-bottom:6px;font-size:14px;";const l=document.createElement("div");l.textContent="Eclipse/CMG 的 INIT、UNRST、SR3 会在同目录自动匹配，不必手动多选。",l.style.cssText="color:#8b949e;font-size:11px;margin-bottom:10px;";const c=document.createElement("div");c.style.cssText="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap;align-items:center;";let h="project",d="";const f=document.createElement("div");f.style.cssText="flex:1;min-width:120px;color:#58a6ff;font-size:12px;word-break:break-all;";const u=document.createElement("div");u.style.cssText="border:1px solid #30363d;border-radius:8px;min-height:220px;max-height:280px;overflow:auto;background:#0d1117;";const g=document.createElement("div");g.setAttribute("role","status"),g.style.cssText="color:#8b949e;font-size:11px;margin-top:8px;min-height:16px;";const x=()=>{t||(t=!0,n++,s==null||s.abort(),r.remove(),$r.delete(i.container),e!=null&&e.isConnected&&e.focus())},m=y=>{h=y,d="",C()},p=document.createElement("button");p.type="button",p.textContent="项目目录";const v=document.createElement("button");v.type="button",v.textContent="Agent 工作区";const _=()=>{p.style.cssText=Ai(h==="project"?"primary":"ghost"),v.style.cssText=Ai(h==="workspace"?"primary":"ghost"),p.setAttribute("aria-pressed",String(h==="project")),v.setAttribute("aria-pressed",String(h==="workspace"))};p.addEventListener("click",()=>{m("project"),_()}),v.addEventListener("click",()=>{m("workspace"),_()}),_();const w=document.createElement("button");w.type="button",w.textContent="上级",w.style.cssText=Ai(),w.addEventListener("click",()=>{if(!d)return;const y=d.split("/").filter(Boolean);y.pop(),d=y.join("/"),C()}),c.append(p,v,w,f);const P=(y,E,N)=>{var J;E||(u.innerHTML=""),(J=u.querySelector("[data-empty]"))==null||J.remove();const G=y.filter(R=>R.kind==="directory"||kl(R.name));if(u.childElementCount===0&&G.length===0){const R=document.createElement("div");R.dataset.empty="true",R.style.cssText="padding:16px;color:#6e7681;",R.textContent="此目录没有可导入的油气文件",u.appendChild(R);return}for(const R of G){const U=document.createElement("button");U.type="button",U.style.cssText=["display:flex;width:100%;text-align:left;gap:8px;padding:8px 10px;","border:0;border-bottom:1px solid #21262d;background:transparent;color:#c9d1d9;cursor:pointer;"].join("");const B=document.createElement("span");B.textContent=R.kind==="directory"?"[目录]":"[文件]",B.style.cssText="color:#8b949e;flex:0 0 auto;font-size:11px;";const $=document.createElement("span");$.textContent=R.name,$.style.cssText="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;",U.append(B,$),U.addEventListener("click",()=>{if(R.kind==="directory"){d=R.path,C();return}x(),ig(i,R.path,N).catch(q=>{i.onStatus(q instanceof Error?q.message:String(q))})}),u.appendChild(U)}},C=async y=>{const E=++n,N=h,G=d;s==null||s.abort(),s=new AbortController,y||u.replaceChildren(),u.setAttribute("aria-busy","true"),g.textContent="正在读取工作区...",f.textContent=`${h==="project"?"项目":"工作区"} / ${d||""}`,w.disabled=!d;try{const J=await Jm({path:G,root:N,cursor:y,signal:s.signal,apiBase:i.apiBase,authToken:i.authToken,headers:i.headers,request:i.request});if(t||E!==n)return;if(P(J.entries,!!y,N),g.textContent=J.has_more?"还有更多条目，请点击「加载更多」":"",J.has_more&&J.next_cursor){const R=document.createElement("button");R.type="button",R.textContent="加载更多",R.style.cssText=`${Ai()};width:100%;margin:6px 0;`,R.addEventListener("click",()=>{R.remove(),C(J.next_cursor)}),u.appendChild(R)}}catch(J){if(t||E!==n)return;g.textContent=J instanceof Error?J.message:String(J);const R=document.createElement("button");R.type="button",R.textContent="重试读取",R.style.cssText=`${Ai()};width:100%;margin:6px 0;`,R.addEventListener("click",()=>{R.remove(),C(y)}),u.appendChild(R)}finally{!t&&E===n&&u.setAttribute("aria-busy","false")}},T=document.createElement("button");return T.type="button",T.textContent="取消",T.style.cssText=`${Ai()};margin-top:10px;`,T.addEventListener("click",x),r.addEventListener("click",y=>{y.target===r&&x()}),r.addEventListener("keydown",y=>{if(y.stopPropagation(),y.key==="Escape")y.preventDefault(),x();else if(y.key==="Tab"){const E=Array.from(a.querySelectorAll("button:not(:disabled),input:not(:disabled),select:not(:disabled),[tabindex='0']")),N=E[0],G=E[E.length-1];y.shiftKey&&document.activeElement===N?(y.preventDefault(),G==null||G.focus()):!y.shiftKey&&document.activeElement===G&&(y.preventDefault(),N==null||N.focus())}}),a.append(o,l,c,u,g,T),r.appendChild(a),i.container.appendChild(r),$r.set(i.container,x),p.focus(),C(),x}const Hl=[{id:"top",label:"顶视",shortcut:"Alt+T"},{id:"bottom",label:"底视",shortcut:"Alt+B"},{id:"north",label:"北视",shortcut:"Alt+N"},{id:"south",label:"南视",shortcut:"Alt+S"},{id:"east",label:"东视",shortcut:"Alt+E"},{id:"west",label:"西视",shortcut:"Alt+W"},{id:"iso",label:"立体视角",shortcut:"Alt+I"}];function rg(i,e,t){const n=Math.max(t,1);switch(i){case"top":return{position:e.clone().add(new L(0,0,n)),up:new L(0,1,0)};case"bottom":return{position:e.clone().add(new L(0,0,-n)),up:new L(0,1,0)};case"north":return{position:e.clone().add(new L(0,n,0)),up:new L(0,0,1)};case"south":return{position:e.clone().add(new L(0,-n,0)),up:new L(0,0,1)};case"east":return{position:e.clone().add(new L(n,0,0)),up:new L(0,0,1)};case"west":return{position:e.clone().add(new L(-n,0,0)),up:new L(0,0,1)};default:return{position:e.clone().add(new L(1,1,.8).normalize().multiplyScalar(n)),up:new L(0,0,1)}}}function og(i,e,t){const n=i.getSize(new L),s=sr.degToRad(t),r=2*Math.atan(Math.tan(s/2)*Math.max(e,.2));return Math.max(n.length()/2,.5)/Math.sin(Math.min(r,s)/2)*1.1}function ag(i,e,t){const n=Math.max(e*.42,1),s=n*Math.max(t,.2);i.left=-s,i.right=s,i.top=n,i.bottom=-n,i.near=.1,i.far=Math.max(e*40,2e4),i.updateProjectionMatrix()}function lg(i,e){const t=i.x-e.x,n=i.y-e.y;return Math.atan2(t,n)}function cg(i,e,t){if(t<=0)return 1;if(i instanceof ws)return(i.top-i.bottom)/t;if(i instanceof Lt){const n=i.position.distanceTo(e),s=sr.degToRad(i.fov);return 2*Math.tan(s/2)*n/t}return 1}const Is=new WeakMap;function Us(i){var e;(e=Is.get(i))==null||e()}function hg(i,e,t,n,s){Us(i);const r=document.activeElement instanceof HTMLElement?document.activeElement:null,a=document.createElement("div");a.className="oilgas-context-menu",a.setAttribute("role","menu"),a.setAttribute("aria-label","对象操作"),a.tabIndex=-1,a.style.cssText=["position:fixed;z-index:400;width:180px;max-width:calc(100vw - 16px);max-height:calc(100vh - 16px);overflow:auto;box-sizing:border-box;","background:#161b22;border:1px solid #30363d;border-radius:8px;","padding:4px;box-shadow:0 12px 32px rgba(0,0,0,.45);","font:12px/1.4 -apple-system,sans-serif;"].join("");const o=i.getBoundingClientRect(),l=Math.max(8,o.left),c=Math.max(8,o.top);a.style.left=Math.max(l,Math.min(e,Math.min(o.right,window.innerWidth)-188))+"px",a.style.top=Math.max(c,Math.min(t,Math.min(o.bottom,window.innerHeight)-12-n.length*32))+"px";for(const g of n){const x=document.createElement("button");x.type="button",x.setAttribute("role","menuitem"),x.textContent=g.label,x.disabled=!!g.disabled,x.style.cssText=["display:block;width:100%;text-align:left;padding:7px 10px;border:0;border-radius:5px;","background:transparent;cursor:pointer;font:12px/1.3 -apple-system,sans-serif;",g.danger?"color:#f85149;":"color:#c9d1d9;",g.disabled?"opacity:.45;cursor:default;":""].join(""),x.addEventListener("mouseenter",()=>{g.disabled||(x.style.background="rgba(31,111,235,.28)")}),x.addEventListener("mouseleave",()=>{x.style.background="transparent"}),x.addEventListener("click",m=>{m.stopPropagation(),h(),g.disabled||s(g.id)}),a.appendChild(x)}const h=()=>{a.remove(),u.disconnect(),window.removeEventListener("mousedown",d,!0),a.removeEventListener("keydown",f),Is.get(i)===h&&Is.delete(i),r!=null&&r.isConnected&&(document.activeElement===document.body||a.contains(document.activeElement))&&r.focus()},d=g=>{a.contains(g.target)||h()},f=g=>{var x;if(g.stopPropagation(),g.key==="Escape")g.preventDefault(),g.stopPropagation(),h();else if(["ArrowDown","ArrowUp","Home","End"].includes(g.key)){g.preventDefault(),g.stopPropagation();const m=Array.from(a.querySelectorAll("button:not(:disabled)")),p=m.indexOf(document.activeElement),v=g.key==="Home"?0:g.key==="End"?m.length-1:(p+(g.key==="ArrowDown"?1:-1)+m.length)%m.length;(x=m[v])==null||x.focus()}else g.key==="Tab"&&h()},u=new MutationObserver(()=>{a.isConnected||h()});return u.observe(i,{childList:!0}),window.addEventListener("mousedown",d,!0),a.addEventListener("keydown",f),i.appendChild(a),Is.set(i,h),(a.querySelector("button:not(:disabled)")||a).focus(),h}function dg(i){return[{id:"focus",label:"聚焦 / 适配",disabled:!i},{id:"isolate",label:"仅显示此项",disabled:!i},{id:"hide",label:"隐藏",disabled:!i},{id:"show-all",label:"显示全部"},{id:"delete",label:"删除",danger:!0,disabled:!i}]}function Yr(i){const e=Number.isFinite(i)?Math.max(1,Math.round(i)):1;return e+":"+e}function ug(i){let e=null,t=!1,n=!1;const s={i:1,j:1,k:1},r=document.createElement("div");r.className="oilgas-slice-player",r.setAttribute("role","group"),r.setAttribute("aria-label","网格切片播放"),r.style.cssText=["position:absolute;height:32px;display:flex;align-items:center;gap:6px;","padding:0 8px;background:rgba(13,17,23,.82);border:1px solid #30363d;","border-radius:7px;z-index:19;box-sizing:border-box;pointer-events:auto;"].join("");const a=document.createElement("span");a.textContent="切片",a.style.cssText="font-size:11px;color:#8b949e;flex:0 0 auto;";const o=document.createElement("div");o.style.cssText="display:flex;gap:2px;flex:0 0 auto;";const l=new Map,c=()=>{for(const[m,p]of l){const v=m==="off"&&e===null||m===e;p.style.background=v?"#1f6feb":"#21262d",p.style.color=v?"#fff":"#8b949e",p.setAttribute("aria-pressed",String(v)),p.disabled=m!=="off"&&!n}},h=(m,p)=>{const v=document.createElement("button");v.type="button",v.textContent=p,v.setAttribute("aria-label",m==="off"?"显示完整网格":`沿 ${p} 方向切片`),v.style.cssText="width:28px;height:22px;padding:0;border:1px solid #30363d;border-radius:4px;cursor:pointer;font:600 11px/22px sans-serif;",v.addEventListener("click",()=>{e=m==="off"?null:m,t=!1,i.onPlay(!1),c(),g(),x(),i.onAxis(e)}),o.appendChild(v),l.set(m,v)};h("i","I"),h("j","J"),h("k","K"),h("off","全");const d=document.createElement("input");d.type="range",d.min="1",d.max="1",d.value="1",d.step="1",d.disabled=!0,d.setAttribute("aria-label","切片层号"),d.style.cssText="flex:1;min-width:80px;margin:0;",d.addEventListener("input",()=>{e&&(f.textContent=d.value,i.onIndex(e,Number(d.value)))});const f=document.createElement("span");f.style.cssText="font:600 11px/1 monospace;color:#c9d1d9;min-width:36px;text-align:right;",f.textContent="-";const u=document.createElement("button");u.type="button",u.style.cssText="width:28px;height:22px;padding:0;border:1px solid #30363d;border-radius:4px;background:#21262d;color:#c9d1d9;cursor:pointer;font-size:11px;";const g=()=>{u.textContent=t?"||":">",u.title=t?"停止播放":"沿 I/J/K 播放",u.setAttribute("aria-label",u.title),u.setAttribute("aria-pressed",String(t)),u.disabled=!e||!n||s[e]<=1};u.addEventListener("click",()=>{!e||!n||s[e]<=1||(t=!t,g(),i.onPlay(t))});const x=()=>{const m=e?Math.max(1,s[e]):1;d.max=String(m),d.disabled=!e||!n,Number(d.value)>m&&(d.value="1"),f.textContent=e?d.value:"-",g()};return c(),g(),r.append(a,o,d,f,u),{root:r,setDims:m=>{n=!!(m&&m.length>=3&&m.slice(0,3).every(p=>Number.isSafeInteger(p)&&p>0)),s.i=n?m[0]:1,s.j=n?m[1]:1,s.k=n?m[2]:1,t&&(t=!1,i.onPlay(!1)),!n&&e&&(e=null,i.onAxis(null)),c(),x()},setPlaying:m=>{t=m&&n&&e!==null&&s[e]>1,g()},setIndex:m=>{const p=e?Math.max(1,s[e]):1,v=Number.isFinite(m)?Math.min(p,Math.max(1,Math.round(m))):1;d.value=String(v),f.textContent=e?d.value:"-",e&&i.onIndex(e,v)},axis:()=>e,index:()=>Number(d.value)||1}}function fg(){const i=document.createElement("div");i.className="oilgas-compass",i.style.cssText=["position:absolute;width:72px;pointer-events:none;z-index:18;","display:flex;flex-direction:column;align-items:center;gap:6px;"].join("");const e=document.createElement("canvas");e.width=72,e.height=72,e.style.cssText="width:72px;height:72px;";const t=document.createElement("div");t.style.cssText=["color:#c9d1d9;font:600 10px/1.2 ui-monospace,Menlo,monospace;","background:rgba(13,17,23,.78);border:1px solid #30363d;border-radius:4px;","padding:3px 6px;text-align:center;min-width:64px;"].join(""),t.textContent="—",i.append(e,t);const n=r=>{const a=e.getContext("2d");if(!a)return;const o=36,l=36;a.clearRect(0,0,72,72),a.save(),a.translate(o,l),a.rotate(r),a.beginPath(),a.arc(0,0,30,0,Math.PI*2),a.fillStyle="rgba(13,17,23,.82)",a.fill(),a.strokeStyle="#30363d",a.stroke(),a.beginPath(),a.moveTo(0,22),a.lineTo(7,6),a.lineTo(0,10),a.lineTo(-7,6),a.closePath(),a.fillStyle="#8b949e",a.fill(),a.beginPath(),a.moveTo(0,-24),a.lineTo(8,-4),a.lineTo(0,-8),a.lineTo(-8,-4),a.closePath(),a.fillStyle="#f85149",a.fill(),a.fillStyle="#e6edf3",a.font="700 11px sans-serif",a.textAlign="center",a.fillText("N",0,-26),a.restore()},s=r=>{const a=Math.pow(10,Math.floor(Math.log10(Math.max(r,1e-6)))),o=[1,2,5,10].map(h=>h*a),l=o.find(h=>h>=r)||o[o.length-1]*10,c=l>=1e3?(l/1e3).toFixed(l%1e3===0?0:1)+" km":Math.round(l)+" m";return{meters:l,label:c}};return n(0),{root:i,setAzimuth:r=>n(r),setMetersPerPixel:r=>{const{label:a}=s(Math.max(r*48,1));t.textContent=a}}}function pg(i){var s,r;const e=document.createElement("div");e.className="oilgas-view-cluster",e.style.cssText=["position:absolute;display:grid;grid-template-columns:repeat(3,24px);gap:3px;","padding:6px;background:rgba(13,17,23,.82);border:1px solid #30363d;","border-radius:8px;z-index:18;pointer-events:auto;"].join("");const t=[null,"north",null,"west","top","east",null,"south","iso","bottom",null,null],n={top:"顶",bottom:"底",north:"北",south:"南",east:"东",west:"西",iso:"3D"};for(const a of t){if(!a){const l=document.createElement("span");l.style.cssText="width:24px;height:22px;",e.appendChild(l);continue}const o=document.createElement("button");o.type="button",o.textContent=n[a],o.title=((s=Hl.find(l=>l.id===a))==null?void 0:s.label)+" ("+(((r=Hl.find(l=>l.id===a))==null?void 0:r.shortcut)||"")+")",o.setAttribute("aria-label",o.title),o.style.cssText=["width:24px;height:22px;padding:0;border:1px solid #30363d;border-radius:4px;","background:#21262d;color:#c9d1d9;cursor:pointer;font:600 10px/22px sans-serif;"].join(""),o.addEventListener("click",l=>{l.stopPropagation(),i(a)}),e.appendChild(o)}return e}function mg(){const i=document.createElement("div");return i.className="oilgas-shortcuts",i.style.cssText=["display:none;position:absolute;inset:48px 24px auto 24px;max-width:420px;","background:rgba(13,17,23,.94);border:1px solid #30363d;border-radius:10px;","padding:14px 16px;z-index:80;color:#c9d1d9;","font:12px/1.5 -apple-system,sans-serif;box-shadow:0 16px 40px rgba(0,0,0,.4);"].join(""),i.innerHTML=["<div style='font-weight:700;margin-bottom:8px;color:#e6edf3;'>快捷键</div>","<div>Alt+T/B/N/S/E/W/I — 顶/底/北/南/东/西/三维视角</div>","<div>F 适配全部 · O 正交投影 · G 底板网格</div>","<div>I 仅显示当前 · H 隐藏 · A 显示全部</div>","<div>Delete 从目录移除 · ? 打开本列表</div>","<div>Esc 关闭菜单</div>"].join(""),i}function gg(i){i.style.display=i.style.display==="none"||!i.style.display?"block":"none"}function xg(i){i.style.display="none"}const Gl=15778123;function Vl(i,e,t){const n=i.material,s=i.geometry.getAttribute("uv");if(!t||!s||t.count!==e.count){i.geometry.deleteAttribute("color"),n.vertexColors=!1,n.color.setHex(Gl),n.needsUpdate=!0;return}const r=new Float64Array(e.count);for(let c=1;c<e.count;c++)r[c]=r[c-1]+Math.hypot(e.getX(c)-e.getX(c-1),e.getY(c)-e.getY(c-1),e.getZ(c)-e.getZ(c-1));const a=r[r.length-1]||1,o=new Float32Array(s.count*3);let l=0;for(let c=0;c<s.count;c++){const h=s.getX(c)*a;for(;l<r.length-2&&r[l+1]<h;)l++;const d=Math.min(l+1,t.count-1),f=Math.max(0,Math.min(1,(h-r[l])/(r[d]-r[l]||1)));for(let u=0;u<3;u++)o[c*3+u]=t.array[l*3+u]*(1-f)+t.array[d*3+u]*f}i.geometry.setAttribute("color",new Je(o,3)),n.vertexColors=!0,n.color.setHex(16777215),n.needsUpdate=!0}function _g(i,e){const t=Um(Vr(i),256);if(t.length<2)return null;const n=new al(t.map(([c,h,d])=>new L(c,h,d)),!1,"catmullrom",.15),s=Nm(t),r=Math.min(192,Math.max(12,(t.length-1)*4)),a=new kr(n,r,s,8,!1),o=new Ei({color:Gl,emissive:new Ue(3811848),specular:new Ue(2236962),shininess:18}),l=new wt(a,o);return l.name="oilgas-well-tube",l}const Wl=[0,1,3,2,4,5,7,6],Xl=[[0,1,2,3],[4,7,6,5],[0,1,5,4],[3,2,6,7],[0,3,7,4],[1,2,6,5]],jl=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]],Wn=8,ql=5,Ns=6*ql,vg=6*4*3,Wi=14;function Os(i,e,t){const n=(e*8+t)*3;return[i[n],i[n+1],i[n+2]]}function $l(i,e,t){const n=Os(i,e,t[0]),s=Os(i,e,t[1]),r=Os(i,e,t[2]),a=Os(i,e,t[3]),o=[(s[1]-n[1])*(r[2]-n[2])-(s[2]-n[2])*(r[1]-n[1]),(s[2]-n[2])*(r[0]-n[0])-(s[0]-n[0])*(r[2]-n[2]),(s[0]-n[0])*(r[1]-n[1])-(s[1]-n[1])*(r[0]-n[0])],l=[(r[1]-n[1])*(a[2]-n[2])-(r[2]-n[2])*(a[1]-n[1]),(r[2]-n[2])*(a[0]-n[0])-(r[0]-n[0])*(a[2]-n[2]),(r[0]-n[0])*(a[1]-n[1])-(r[1]-n[1])*(a[0]-n[0])],c=Math.hypot(o[0],o[1],o[2]),h=Math.hypot(l[0],l[1],l[2]);return c===0||h===0?0:(o[0]*l[0]+o[1]*l[1]+o[2]*l[2])/(c*h)}function Ci(i,e){return e<=0||i%e!==0?0:i/e}function Kr(i,e){const t=Ci(i,e);return t===Wn||t===Wi}function yg(i,e){const t=Ci(i,e);return t===Wn||t===Wi||t===Ns}function Jr(i,e){const t=Ci(i.length/3,e);if(t===Wn)return new Float32Array(i.subarray(0,e*24));if(t!==Wi)throw new Error("hex corners require 8 or 14 vertices per cell");const n=new Float32Array(e*24);for(let s=0;s<e;s++){const r=s*Wi*3;n.set(i.subarray(r,r+24),s*24)}return n}function bg(i,e){if(!Kr(i.length/3,e))return!1;const t=Ci(i.length/3,e)===Wn?i:Jr(i,e),n=Math.min(e,32);let s=0,r=0;for(let a=0;a<n;a++)s+=$l(t,a,[0,1,2,3]),r+=$l(t,a,[0,1,3,2]);return r>s+.25*n}function Sg(i,e){const t=new Float32Array(24);for(let n=0;n<e;n++){const s=n*24;t.set(i.subarray(s,s+24));for(let r=0;r<8;r++){const a=Wl[r]*3,o=s+r*3;i[o]=t[a],i[o+1]=t[a+1],i[o+2]=t[a+2]}}}function Yl(i,e){if(!bg(i,e))return!1;if(Ci(i.length/3,e)===Wn)return Sg(i,e),!0;const n=new Float32Array(24);for(let s=0;s<e;s++){const r=s*Wi*3;n.set(i.subarray(r,r+24));for(let a=0;a<8;a++){const o=Wl[a]*3,l=r+a*3;i[l]=n[o],i[l+1]=n[o+1],i[l+2]=n[o+2]}}return!0}function Kl(i,e){if(Ci(i.length/3,e)!==Wn)throw new Error("OPM hex fan requires 8 corners per cell");const t=new Float32Array(e*Ns*3),n=new Float32Array(e*Ns*3),s=new Uint32Array(e*vg);let r=0,a=0,o=0;for(let l=0;l<e;l++){const c=l*24,h=l*Ns;for(let d=0;d<Xl.length;d++){const f=Xl[d],u=i[c+f[0]*3],g=i[c+f[0]*3+1],x=i[c+f[0]*3+2],m=i[c+f[1]*3],p=i[c+f[1]*3+1],v=i[c+f[1]*3+2],_=i[c+f[2]*3],w=i[c+f[2]*3+1],P=i[c+f[2]*3+2],C=i[c+f[3]*3],T=i[c+f[3]*3+1],H=i[c+f[3]*3+2],y=(u+m+_+C)*.25,E=(g+p+w+T)*.25,N=(x+v+P+H)*.25;let G=C-y,J=T-E,R=H-N,U=0,B=0,$=0;const q=[u,m,_,C],K=[g,p,w,T],Q=[x,v,P,H];for(let de=0;de<4;de++){const we=q[de]-y,Te=K[de]-E,ve=Q[de]-N;U+=J*ve-R*Te,B+=R*we-G*ve,$+=G*Te-J*we,G=we,J=Te,R=ve}const ee=Math.hypot(U,B,$);ee===0?(U=0,B=0,$=1):(U/=ee,B/=ee,$/=ee);const ae=[u,m,_,C,y],X=[g,p,w,T,E],I=[x,v,P,H,N];for(let de=0;de<5;de++)t[r++]=ae[de],t[r++]=X[de],t[r++]=I[de],n[a++]=U,n[a++]=B,n[a++]=$;const Z=h+d*ql,he=Z+4;s[o++]=he,s[o++]=Z,s[o++]=Z+1,s[o++]=he,s[o++]=Z+1,s[o++]=Z+2,s[o++]=he,s[o++]=Z+2,s[o++]=Z+3,s[o++]=he,s[o++]=Z+3,s[o++]=Z}}return{positions:t,indices:s,normals:n}}function Zr(i){const e=Array.from(i),t=new Uint32Array(e.length*jl.length*2);let n=0;for(const s of e){const r=s*Wn;for(const[a,o]of jl)t[n++]=r+a,t[n++]=r+o}return t}class Eg{constructor(){this.worker=null,this.workerUrl=null,this.pending=new Map,this.msgId=0;try{const e=`
        const palettes = ${JSON.stringify(Vn)};
        const compute = ${Cl.toString()};
        self.onmessage = function(event) {
          const msg = event.data;
          try {
            const scalars = msg.isFloat ? new Float32Array(msg.scalars) : new Uint32Array(msg.scalars);
            const result = compute(scalars, new Uint32Array(msg.indices), msg.colormap, msg.nVerts, msg.association, palettes);
            self.postMessage({ id: msg.id, result }, [result.colors.buffer]);
          } catch (error) { self.postMessage({ id: msg.id, error: String(error) }); }
        };
      `;this.workerUrl=URL.createObjectURL(new Blob([e],{type:"application/javascript"})),this.worker=new Worker(this.workerUrl),this.worker.onmessage=t=>{const n=this.pending.get(t.data.id);n&&(clearTimeout(n.timer),this.pending.delete(t.data.id),n.resolve(t.data.error?null:t.data.result))},this.worker.onerror=()=>this.dispose(),this.worker.onmessageerror=()=>this.dispose()}catch{this.dispose()}}isAvailable(){return this.worker!==null}computeColors(e,t,n,s,r,a="cell"){return this.worker?new Promise(o=>{const l=`colors-${this.msgId++}`,c=setTimeout(()=>this.dispose(),3e4);this.pending.set(l,{resolve:o,timer:c});try{this.worker.postMessage({id:l,scalars:e,indices:t,colormap:n,nVerts:s,isFloat:r,association:a},[e,t])}catch{clearTimeout(c),this.pending.delete(l),o(null)}}):Promise.resolve(null)}dispose(){var e;(e=this.worker)==null||e.terminate(),this.worker=null,this.workerUrl&&URL.revokeObjectURL(this.workerUrl),this.workerUrl=null;for(const t of this.pending.values())clearTimeout(t.timer),t.resolve(null);this.pending.clear()}}class Mg{constructor(e){this.timer=null,this.controller=new AbortController,this.polling=!1,this.active=!1,this.outcomes=new Map,this.pendingAcknowledgements=new Map,this.options=e,this.api=new wi(e.apiBase,e.authToken,e)}start(){this.active||(this.active=!0,this.controller.signal.aborted&&(this.controller=new AbortController),this.poll(),this.timer=window.setInterval(()=>{this.poll()},this.options.intervalMs??750))}update(e){this.controller.abort(),this.controller=new AbortController,this.polling=!1,this.outcomes.clear(),this.pendingAcknowledgements.clear(),this.api.update(e)}dispose(){this.active=!1,this.controller.abort(),this.timer!==null&&window.clearInterval(this.timer),this.timer=null,this.outcomes.clear(),this.pendingAcknowledgements.clear()}async flushAcknowledgements(e){for(const[t,n]of this.pendingAcknowledgements){if(e.signal.aborted||!this.active)return;try{await this.api.request(`/commands/${encodeURIComponent(t)}/ack`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n),signal:e.signal}),e===this.controller&&this.pendingAcknowledgements.delete(t)}catch(s){e.signal.aborted||console.debug("[oilgas-vis] Command acknowledgement pending:",s)}}}async poll(){var t,n;if(!this.active||this.polling)return;const e=this.controller;this.polling=!0;try{if(this.pendingAcknowledgements.size&&await this.flushAcknowledgements(e),e.signal.aborted||!this.active)return;const s=await this.api.fetchJson(`/commands?viewerId=${encodeURIComponent(this.options.viewerId)}`,e.signal);for(const r of s.commands||[]){if(e.signal.aborted||!this.active)return;if(!r.commandId||typeof r.command!="string")continue;let a=this.outcomes.get(r.commandId);if(!a){try{a={status:"completed",result:await this.options.execute(r.command,r.args||{})??{ok:!0}}}catch(o){const l=o instanceof Error?o.message:String(o);a={status:"failed",error:l},e.signal.aborted||(n=(t=this.options).onCommandError)==null||n.call(t,l)}if(e.signal.aborted||!this.active)return;this.outcomes.set(r.commandId,a),this.outcomes.size>256&&this.outcomes.delete(this.outcomes.keys().next().value)}this.pendingAcknowledgements.set(r.commandId,a)}await this.flushAcknowledgements(e)}catch(s){e.signal.aborted||console.debug("[oilgas-vis] Command polling unavailable:",s)}finally{e===this.controller&&(this.polling=!1)}}}class wg{constructor(e,t){var h,d;this.store=new wl,this.disposed=!1,this.lifetimeController=new AbortController,this.catalogGeneration=0,this.responsiveTier="",this.resizeObserver=null,this.overlayVisibility=new Map,this.benchmarkAnimation=null,this.cancelBenchmark=null,this.mesh=null,this.hexEdgeLines=null,this.hexCornerPositions=null,this.isHexMesh=!1,this.overlayMeshes=new Map,this.overlayLoading=new Set,this.geometry=null,this.cellIds=null,this.baseIndices=null,this.visibleCellOffsets=[],this.currentScalarValues=null,this.cellCenters=null,this.raycaster=new fm,this.mouse=new xe,this.animationId=null,this.frameTimes=[],this.lastFrameTime=0,this.fpsInterval=0,this.abortController=null,this.loadGeneration=0,this.colorRequest=0,this.timestepTimer=null,this.datasetLoading=!1,this.manifest=null,this.currentDataset=null,this.currentProperty="porosity",this.currentColormap="viridis",this.wireframe=!1,this.opacity=.85,this.currentTimeStep=0,this.viewerId=`viewer-${((d=(h=globalThis.crypto)==null?void 0:h.randomUUID)==null?void 0:d.call(h))||Math.random().toString(36).slice(2)}`,this.origin=[0,0,0],this.filterI=[0,1/0],this.filterJ=[0,1/0],this.filterK=[0,1/0],this.filterPropertyRange=[-1/0,1/0],this.filterPropertyExclude=!1,this.filterBounds=null,this.zScale=1,this.useOrtho=!1,this.wellLabelsVisible=!0,this.sliceTimer=null,this.filterUndoStack=[],this.filterRedoStack=[],this.lastFilterState="",this.restoringScene=!1,this.measureMode=!1,this.measurePoints=[],this.clipPlane=new on(new L(0,0,-1),0),this.wellLogEl=null,this.histogramEl=null,this.sidebarCollapsed=!1,this.objectTreeCollapsed=!1,this.wellPlanPoints=new Map,this.gridMapBounds=null,this.treeQuery="",this.collapsedGroups=new Set,this.selectedObjectId=null,this.hoverCoords=null,this.fileInput=null,this.dropUnbind=null,this.importBusy=!1,this.closeWorkspacePicker=null,this.highlightedOverlayId=null,this.storeUnsubscribe=null,this.scalarValidCount=0,this.scalarMin=0,this.scalarMax=1,this.onSelectionCallback=null,this.iconButtonStyle={width:"24px",height:"24px",padding:"0",background:"#21262d",color:"#c9d1d9",border:"1px solid #484f58",borderRadius:"5px",cursor:"pointer",fontSize:"16px",lineHeight:"20px"},this.selectStyle={width:"100%",padding:"6px 8px",background:"#161b22",border:"1px solid #30363d",borderRadius:"6px",color:"#c9d1d9",fontSize:"13px",marginBottom:"4px",cursor:"pointer"},this.onViewerKeyDown=f=>{var x,m,p;const u=f.target;if(u&&["INPUT","TEXTAREA","SELECT"].includes(u.tagName))return;if(f.key==="Escape"){xg(this.shortcutsEl),Us(this.container);return}if(f.key==="?"||f.shiftKey&&f.key==="/"){f.preventDefault(),gg(this.shortcutsEl);return}if(f.key==="Delete"||f.key==="Backspace"){const v=this.datasetById(this.selectedObjectId||((x=this.currentDataset)==null?void 0:x.id)||"");if(!v)return;f.preventDefault(),this.deleteCatalogDataset(v);return}const g=f.key.toLowerCase();if(f.altKey){const v={t:"top",b:"bottom",n:"north",s:"south",e:"east",w:"west",i:"iso"};v[g]&&(f.preventDefault(),this.applyNamedView(v[g]));return}if(!(f.ctrlKey||f.metaKey))if(g==="f")f.preventDefault(),this.fitView();else if(g==="o")f.preventDefault(),this.setOrthographic(!this.useOrtho);else if(g==="g"){f.preventDefault(),this.gridHelper.visible=!this.gridHelper.visible;const v=this.sidebar.querySelector('[id="vis-show-grid"]');v&&(v.checked=this.gridHelper.visible,v.dispatchEvent(new Event("ugsci-sync")))}else if(g==="i"){f.preventDefault();const v=this.datasetById(this.selectedObjectId||((m=this.currentDataset)==null?void 0:m.id)||"");v&&this.isolateDataset(v)}else if(g==="h"){f.preventDefault();const v=this.datasetById(this.selectedObjectId||((p=this.currentDataset)==null?void 0:p.id)||"");v&&this.toggleDatasetVisibility(v,!1)}else g==="a"&&(f.preventDefault(),this.showAllVisible())},this.onCanvasContextMenu=f=>{var x;f.preventDefault(),this.canvasNdc(f),this.raycaster.setFromCamera(this.mouse,this.camera);const u=this.raycaster.intersectObjects(this.pickables(),!0)[0],g=u?this.datasetFromHit(u.object):this.datasetById(this.selectedObjectId||((x=this.currentDataset)==null?void 0:x.id)||"")||null;this.openObjectContextMenu(g,f.clientX,f.clientY)},this.lastChromeKey="",this.onWellMapClick=f=>{const u=Array.from(this.wellPlanPoints.values()),g=Ul(u,this.gridMapBounds);if(!g)return;const x=this.wellMapCanvas.getBoundingClientRect(),m=this.wellMapCanvas.width/Math.max(x.width,1),p=this.wellMapCanvas.height/Math.max(x.height,1),v=Hm(u,g,this.wellMapCanvas.width,this.wellMapCanvas.height,(f.clientX-x.left)*m,(f.clientY-x.top)*p);if(!v)return;const _=this.datasetById(v);_&&this.focusDataset(_).catch(w=>this.reportError(w))},this.onCanvasPointerMove=f=>{if(this.datasetLoading)return;this.canvasNdc(f),this.raycaster.setFromCamera(this.mouse,this.camera);const u=this.raycaster.intersectObjects(this.pickables(),!0)[0];if(!u){this.hoverCoords&&(this.hoverCoords=null,this.updateReadoutHud());return}const g=this.hitToModelPoint(u.point);this.hoverCoords=[g.x+this.origin[0],g.y+this.origin[1],g.z+this.origin[2]],this.updateReadoutHud()},this.onCanvasPointerLeave=()=>{this.hoverCoords=null,this.updateReadoutHud()},this.onCanvasDblClick=f=>{this.canvasNdc(f),this.raycaster.setFromCamera(this.mouse,this.camera);const u=this.raycaster.intersectObjects(this.pickables(),!0)[0];if(!u)return;const g=this.datasetFromHit(u.object);g&&this.focusDataset(g).catch(x=>this.reportError(x))},this.onCanvasClick=async f=>{var H,y,E,N,G;if(this.datasetLoading)return;this.canvasNdc(f),this.raycaster.setFromCamera(this.mouse,this.camera);const u=this.raycaster.intersectObjects(this.pickables(),!0)[0];if(!u)return;const g=this.datasetFromHit(u.object),x=this.hitToModelPoint(u.point),m=x.x+this.origin[0],p=x.y+this.origin[1],v=x.z+this.origin[2];if(this.hoverCoords=[m,p,v],this.measureMode){if(this.measurePoints.push(x.clone()),this.measurePoints.length===2){const J=this.measurePoints[0].distanceTo(this.measurePoints[1]);this.infoEl.textContent=`测距结果: ${J.toFixed(3)} | 再点击可重新测量`,this.measurePoints=[]}else this.infoEl.textContent="已选择第一个点，请选择第二个点";this.updateReadoutHud();return}if(g&&(tt(g)||g.id!==((H=this.currentDataset)==null?void 0:H.id))){this.infoEl.textContent=`${g.name} | 真实坐标: (${m.toFixed(0)}, ${p.toFixed(0)}, ${v.toFixed(0)})`,this.publishSelection({type:this.selectionTypeFor(g),id:g.id,coordinates:[m,p,v]});return}if(!this.mesh||!this.geometry)return;const _=u.faceIndex??u.index??0,w=Math.max(1,(((y=this.geometry.getIndex())==null?void 0:y.count)||0)/Math.max(this.visibleCellOffsets.length,1)/(this.mesh instanceof wt?3:1)),P=Math.floor(_/w),C=this.visibleCellOffsets[P]??P,T=((E=this.cellIds)==null?void 0:E[C])??C;if(this.infoEl.textContent=`Cell ID: ${T} | 真实坐标: (${m.toFixed(0)}, ${p.toFixed(0)}, ${v.toFixed(0)})`,this.currentDataset)try{const J=await this.fetchJson(`/datasets/${encodeURIComponent(this.currentDataset.id)}/cells/${T}?time_step=${this.currentTimeStep}`);this.showDetails([`Cell ${J.cell_id}`,J.ijk?`I/J/K: ${J.ijk.join(" / ")}`:"I/J/K: —",J.center?`中心: ${J.center.map(R=>Number(R).toFixed(2)).join(", ")}`:"中心: —",...Object.entries(J.properties||{}).map(([R,U])=>`${bn(R,this.currentDataset)}: ${U==null||!Number.isFinite(Number(U))?"缺测":Number(U).toPrecision(6)}`)].join(`
`))}catch{}this.publishSelection({type:["network","network-tube"].includes(((N=this.currentDataset)==null?void 0:N.source)||"")?"segment":"cell",datasetId:(G=this.currentDataset)==null?void 0:G.id,id:String(T),coordinates:[m,p,v]})},this.simulationRefreshGeneration=0,this.onResize=()=>{if(this.disposed)return;this.applyResponsiveChrome();const f=this.container.clientWidth,u=this.container.clientHeight;f<=0||u<=0||(this.renderer.setSize(f,u),this.labelRenderer.setSize(f,u),this.applyCameraProjection(),this.updatePanelOffsets())},this.container=e,this.options={...t},this.apiBase=t.apiBase,this.authToken=t.authToken,this.api=new wi(t.apiBase,t.authToken,t);const n=Math.max(e.clientWidth,1),s=Math.max(e.clientHeight,1);this.renderer=new el({antialias:!0,powerPreference:"high-performance"}),this.renderer.setSize(n,s),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)),this.renderer.localClippingEnabled=!0,e.appendChild(this.renderer.domElement),getComputedStyle(e).position==="static"&&(e.style.position="relative"),this.labelRenderer=new vm,this.labelRenderer.setSize(n,s),Object.assign(this.labelRenderer.domElement.style,{position:"absolute",inset:"0",pointerEvents:"none"}),e.appendChild(this.labelRenderer.domElement),this.scene=new $p,this.scene.background=new Ue(856343),this.scene.fog=new zi(856343,2e3,8e3),this.modelRoot=new kn,this.modelRoot.name="oilgas-model",this.scene.add(this.modelRoot),this.perspectiveCamera=new Lt(50,n/s,1,2e4),this.perspectiveCamera.position.set(3e3,3e3,3e3),this.orthoCamera=new ws(-n/2,n/2,s/2,-s/2,.1,2e4),this.orthoCamera.position.copy(this.perspectiveCamera.position),this.camera=this.perspectiveCamera,this.controls=new xm(this.camera,this.renderer.domElement),this.controls.enableDamping=!0,this.controls.dampingFactor=.08;const r=new um(4210784,1.5);this.scene.add(r);const a=new fl(16777215,1.2);a.position.set(1e3,1e3,1e3),this.scene.add(a);const o=new fl(8425727,.5);o.position.set(-500,-500,-500),this.scene.add(o),this.gridHelper=new pm(5e3,50,3159613,2172461),this.gridHelper.rotation.x=Math.PI/2,this.scene.add(this.gridHelper),this.axesHelper=new mm(2e3),this.scene.add(this.axesHelper),this.raycaster.params.Line={threshold:12},this.renderer.domElement.addEventListener("click",this.onCanvasClick),this.renderer.domElement.addEventListener("pointermove",this.onCanvasPointerMove),this.renderer.domElement.addEventListener("pointerleave",this.onCanvasPointerLeave),this.renderer.domElement.addEventListener("dblclick",this.onCanvasDblClick),this.renderer.domElement.addEventListener("contextmenu",this.onCanvasContextMenu),window.addEventListener("resize",this.onResize),typeof ResizeObserver<"u"&&(this.resizeObserver=new ResizeObserver(this.onResize),this.resizeObserver.observe(e)),this.sidebar=this.buildSidebar(),this.objectTree=this.buildObjectTree(),this.hudEl=this.buildHud(),this.infoEl=this.buildInfoBar(),this.detailsEl=this.buildDetailsPanel(),this.legendEl=this.buildLegend(),this.histogramEl=this.buildHistogram(),this.wellLogEl=this.buildWellLogPanel(),this.toolbarEl=this.buildToolbar(),this.readoutEl=this.buildReadout();const l=Gm();this.wellMapRoot=l.root,this.wellMapCanvas=l.canvas,this.wellMapCanvas.addEventListener("click",this.onWellMapClick),this.container.appendChild(this.wellMapRoot),this.slicePlayer=ug({onAxis:f=>this.applySliceAxis(f),onIndex:(f,u)=>this.applySliceIndex(f,u),onPlay:f=>this.setSlicePlaying(f)}),this.container.appendChild(this.slicePlayer.root),this.compassHud=fg(),this.container.appendChild(this.compassHud.root),this.viewClusterEl=pg(f=>this.applyNamedView(f)),this.container.appendChild(this.viewClusterEl),this.shortcutsEl=mg(),this.container.appendChild(this.shortcutsEl),this.viewRouter=new Vi(this.container,f=>{this.applyActiveView(f).catch(u=>this.reportError(u))},this.store);const c=this.viewRouter.createTabs();c.className="oilgas-view-tabs",Object.assign(c.style,{top:"48px",left:"276px",right:"288px",overflowX:"auto"}),this.container.appendChild(c),this.storeUnsubscribe=this.store.subscribe(()=>this.syncChromeFromStore()),this.applyResponsiveChrome(),this.updatePanelOffsets(),this.commandBridge=new Mg({...t,apiBase:this.apiBase,authToken:this.authToken,viewerId:this.viewerId,execute:(f,u)=>this.executeCommand(f,u),onCommandError:f=>{this.infoEl.textContent=`Agent 命令失败: ${f}`}}),this.fileInput=eg(f=>{this.handlePickedFiles(f)}),this.container.appendChild(this.fileInput),this.container.tabIndex=0,this.container.addEventListener("keydown",this.onViewerKeyDown),this.dropUnbind=tg(this.container,f=>{this.handlePickedFiles(f)}),this.workerManager=new Eg,this.startLoop(),this.ready=this.init(),this.ready.catch(f=>this.reportError(f)),t.enableCommands&&this.commandBridge.start()}authHeaders(){return{...this.options.headers,...this.authToken?{Authorization:`Bearer ${this.authToken}`}:{}}}request(e,t={}){return this.disposed?Promise.reject(new Error("可视化引擎已关闭")):this.api.request(e,{...t,signal:t.signal||this.lifetimeController.signal})}async fetchJson(e,t){return this.api.fetchJson(e,t||this.lifetimeController.signal)}async fetchBinary(e,t){return this.api.fetchBinary(e,t||this.lifetimeController.signal)}reportError(e){this.disposed||e instanceof Error&&e.name==="AbortError"||(this.infoEl.textContent=`加载失败：${e instanceof Error?e.message:String(e)}`)}buildSidebar(){const e=document.createElement("div");Object.assign(e.style,{position:"absolute",top:"0",right:"0",bottom:"0",left:"auto",width:String(At.inspectorWidth)+"px",background:"rgba(13,17,23,0.96)",borderLeft:"1px solid #30363d",borderRight:"0",overflow:"hidden",padding:"0",boxSizing:"border-box",zIndex:"100",fontFamily:"-apple-system, sans-serif",color:"#c9d1d9",fontSize:"13px",display:"flex",flexDirection:"column"}),e.className="oilgas-panel oilgas-inspector-panel";const t=document.createElement("button");t.type="button",t.textContent="<",t.title="收起属性面板",t.setAttribute("aria-label","收起属性面板"),Object.assign(t.style,this.iconButtonStyle),t.style.position="absolute",t.style.top="8px",t.style.left="6px",t.style.right="auto",t.style.zIndex="2",t.addEventListener("click",()=>this.toggleSidebar(t)),e.appendChild(t);const n=document.createElement("div");n.id="vis-inspector-body",n.style.cssText="flex:1;min-height:0;display:flex;flex-direction:column;padding:12px 10px 8px;overflow:hidden;";const s=document.createElement("div");Object.assign(s.style,{fontSize:"15px",fontWeight:"600",marginBottom:"10px",color:"#58a6ff",padding:"0 0 8px 28px",borderBottom:"1px solid #30363d"}),s.textContent="属性",n.appendChild(s);const r=document.createElement("div");r.id="vis-inspector-object",r.style.cssText="margin:0 0 10px;padding:8px;background:#161b22;border:1px solid #30363d;border-radius:7px;flex:0 0 auto;";const a=document.createElement("div");a.dataset.objectName="true",a.style.cssText="font-weight:600;color:#e6edf3;margin-bottom:4px;",a.textContent="未选中对象";const o=document.createElement("div");o.dataset.objectMeta="true",o.style.cssText="font-size:11px;color:#8b949e;margin-bottom:6px;",o.textContent="在组件树或三维视图中点选";const l=Ot("vis-inspector-visible",!0,O=>{var ge;const Y=this.datasetById(this.selectedObjectId||((ge=this.currentDataset)==null?void 0:ge.id)||"");Y&&this.toggleDatasetVisibility(Y,O)}),c=document.createElement("div");c.style.cssText="display:grid;grid-template-columns:42% 1fr;gap:8px;align-items:center;";const h=document.createElement("div");h.textContent="显示对象",h.style.cssText="color:#8b949e;font-size:11px;",c.append(h,l),r.append(a,o,c),n.appendChild(r);const d=qm();n.appendChild(d.tabBar);const f=document.createElement("div");f.style.cssText="flex:1;min-height:0;overflow:auto;";const u=qr(),g=qr();d.panes.controls.appendChild(u.table),d.panes.actions.appendChild(g.table),f.append(d.panes.controls,d.panes.actions,d.panes.addons),n.appendChild(f);const x=O=>(Object.assign(O.style,this.selectStyle,{marginBottom:"0"}),O),m=document.createElement("select");x(m),m.id="vis-dataset",m.setAttribute("aria-label","数据集"),m.addEventListener("change",()=>{this.loadDataset(m.value).catch(O=>this.reportError(O))}),We(u.body,"dataset",m);const p=document.createElement("select");x(p),p.id="vis-property",p.setAttribute("aria-label","属性");for(const O of["porosity","permeability","facies"]){const Y=document.createElement("option");Y.value=O,Y.textContent=bn(O),p.appendChild(Y)}p.addEventListener("change",()=>{this.currentProperty=p.value,this.store.setProperty({name:this.currentProperty,displayName:bn(this.currentProperty,this.currentDataset),range:[this.scalarMin,this.scalarMax]}),this.reloadPropertyColors().catch(O=>this.reportError(O))}),We(u.body,"property",p);const v=document.createElement("select");x(v),v.id="vis-timestep",v.setAttribute("aria-label","时间步"),v.innerHTML='<option value="0">静态</option>',v.addEventListener("change",()=>{this.currentTimeStep=parseInt(v.value),this.store.setTimeStep(this.currentTimeStep),this.reloadPropertyColors().catch(O=>this.reportError(O))}),We(u.body,"timeStep",v);const _=bt("播放时间步");_.title="播放/暂停动态结果时间步",_.style.marginBottom="0",_.addEventListener("click",()=>{if(this.timestepTimer!==null){window.clearInterval(this.timestepTimer),this.timestepTimer=null,_.textContent="播放时间步",this.infoEl.textContent="已暂停时间步播放";return}const O=Array.from(v.options).filter(Y=>Y.value!=="0");if(O.length<1){this.infoEl.textContent="当前数据集没有可播放的时间步";return}_.textContent="暂停时间步",this.timestepTimer=window.setInterval(()=>{const Y=this.currentTimeStep>=O.length?1:this.currentTimeStep+1;this.executeCommand("set-timestep",{timeStep:Y})},700)}),We(u.body,"play",_);const w=document.createElement("select");x(w),w.id="vis-colormap",w.setAttribute("aria-label","色图");for(const O of Em){const Y=document.createElement("option");Y.value=O,Y.textContent=Rl(O),w.appendChild(Y)}w.addEventListener("change",()=>{this.currentColormap=w.value,this.store.setColorMap({name:this.currentColormap}),this.reloadPropertyColors().catch(O=>this.reportError(O))}),We(u.body,"colorRamp",w);const P=document.createElement("div"),C=document.createElement("input");C.type="range",C.min="10",C.max="100",C.value="85",C.id="vis-opacity",Object.assign(C.style,{width:"100%",margin:"0"});const T=document.createElement("div");T.id="vis-opacity-value",T.style.cssText="font-size:11px;color:#8b949e;font-family:monospace;text-align:right;",T.textContent="0.85",C.addEventListener("input",()=>{this.applyOpacity(parseInt(C.value,10)/100)}),P.append(C,T),We(u.body,"opacity",P),We(u.body,"wireframe",Ot("vis-wireframe",!1,O=>{this.wireframe=O,this.applyWireframeMode()}));const H=document.createElement("div");H.style.cssText="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;";for(const O of["I","J","K"]){const Y=document.createElement("input");Y.type="text",Y.placeholder=O,Y.id="vis-filter-"+O.toLowerCase(),Y.style.cssText="width:100%;padding:4px;background:#161b22;border:1px solid #30363d;border-radius:4px;color:#c9d1d9;font-size:11px;text-align:center;box-sizing:border-box;",Y.addEventListener("input",()=>this.applyFilters()),Y.addEventListener("change",()=>this.applyFilters()),H.appendChild(Y)}We(u.body,"filterIJK",H);const y=document.createElement("div");y.style.cssText="display:flex;gap:4px;";const E=document.createElement("input");E.type="number",E.placeholder="min",E.step="0.01",E.id="vis-filter-prop-min",x(E),E.addEventListener("input",()=>this.applyFilters()),E.addEventListener("change",()=>this.applyFilters());const N=document.createElement("input");N.type="number",N.placeholder="max",N.step="0.01",N.id="vis-filter-prop-max",x(N),N.addEventListener("input",()=>this.applyFilters()),N.addEventListener("change",()=>this.applyFilters()),y.append(E,N),We(u.body,"propertyRange",y),We(u.body,"excludeRange",Ot("vis-filter-prop-exclude",!1,O=>{this.filterPropertyExclude=O,this.applyFilters()}));const G=document.createElement("input");G.type="range",G.min="1",G.max="1",G.value="1",G.id="vis-k-layer",Object.assign(G.style,{width:"100%",margin:"0"}),G.addEventListener("input",()=>{var ge;const O=this.sidebar.querySelector('[id="vis-filter-k"]'),Y=(ge=this.sidebar.querySelector('[id="vis-isolate-k"]'))==null?void 0:ge.checked;O&&Y&&(O.value=G.value+":"+G.value,this.applyFilters())}),We(u.body,"isolateK",Ot("vis-isolate-k",!1,O=>{const Y=this.sidebar.querySelector('[id="vis-filter-k"]');Y&&(Y.value=O?G.value+":"+G.value:"",this.applyFilters())})),We(u.body,"kLayer",G);const J=document.createElement("div"),R=document.createElement("input");R.type="range",R.min="10",R.max="800",R.value="100",R.id="vis-z-scale",Object.assign(R.style,{width:"100%",margin:"0"});const U=document.createElement("div");U.id="vis-z-scale-value",U.style.cssText="font-size:11px;color:#8b949e;font-family:monospace;text-align:right;",U.textContent="1.00x",R.addEventListener("input",()=>{this.setZScale(parseInt(R.value,10)/100)}),J.append(R,U),We(u.body,"zScale",J),We(u.body,"orthographic",Ot("vis-ortho",!1,O=>this.setOrthographic(O)));const B=document.createElement("input");B.type="range",B.min="0",B.max="100",B.value="50",B.id="vis-clip-depth",Object.assign(B.style,{width:"100%",margin:"0"});const $=()=>{const O=this.sidebar.querySelector('[id="vis-clip"]');this.applyClipPlane(!!(O!=null&&O.checked),Number(B.value)/100)};B.addEventListener("input",$),We(u.body,"clipPlane",Ot("vis-clip",!1,()=>$())),We(u.body,"clipDepth",B);const q=document.createElement("input");q.type="text",q.placeholder="x,y; x,y; ...",q.id="vis-polyline",x(q),We(g.body,"polyline",q);const K=document.createElement("div");K.style.cssText="display:flex;gap:4px;";const Q=document.createElement("input");Q.type="number",Q.placeholder="z min",Q.value="0",Q.id="vis-section-z-min",x(Q);const ee=document.createElement("input");ee.type="number",ee.placeholder="z max",ee.value="5000",ee.id="vis-section-z-max",x(ee),K.append(Q,ee),We(g.body,"zRange",K);const ae=bt("生成垂直剖面");ae.style.marginBottom="0",ae.addEventListener("click",()=>this.createIntersectionFromUI()),We(g.body,"intersection",ae);const X=bt("沿井生成剖面");X.style.marginBottom="0",X.addEventListener("click",()=>{this.createWellSectionFromUI()}),We(g.body,"wellSection",X);const I=document.createElement("div");I.style.cssText="display:flex;gap:4px;";const Z=document.createElement("select");Z.id="vis-slice-axis",x(Z);for(const O of["k","i","j"]){const Y=document.createElement("option");Y.value=O,Y.textContent=O.toUpperCase(),Z.appendChild(Y)}const he=document.createElement("input");he.type="number",he.min="1",he.value="1",he.id="vis-slice-index",x(he),I.append(Z,he),We(g.body,"slice",I);const de=bt("提取切片");de.style.marginBottom="0",de.addEventListener("click",()=>{this.createSliceFromUI()}),We(g.body,"extractSlice",de);const we=bt("截图",{tone:"primary"});we.style.marginBottom="0",we.addEventListener("click",()=>this.captureScreenshot()),We(g.body,"capture",we);const Te=bt("属性统计");Te.style.marginBottom="0",Te.addEventListener("click",()=>this.showDatasetStats()),We(g.body,"stats",Te);const ve=bt("导出属性 CSV");ve.style.marginBottom="0",ve.addEventListener("click",()=>this.exportDataset()),We(g.body,"exportCsv",ve);const ke=bt("导出场景 JSON");ke.style.marginBottom="0",ke.addEventListener("click",()=>this.exportSceneState()),We(g.body,"exportScene",ke);const z=bt("导入本地文件",{tone:"primary"});z.addEventListener("click",()=>{var O;return(O=this.fileInput)==null?void 0:O.click()}),We(g.body,"importFile",z);const at=bt("从工作区导入");at.addEventListener("click",()=>this.openWorkspaceImport()),We(g.body,"importWorkspace",at);const be=bt("删除当前对象",{tone:"danger"});be.addEventListener("click",()=>{var Y;const O=this.datasetById(this.selectedObjectId||((Y=this.currentDataset)==null?void 0:Y.id)||"");O&&this.deleteCatalogDataset(O)}),We(g.body,"deleteObject",be);const Re=bt("运行基准测试",{tone:"primary"});Re.addEventListener("click",()=>{this.runBenchmark().catch(O=>this.reportError(O))}),d.panes.addons.appendChild(this.createLabel("性能测试")),d.panes.addons.appendChild(Re);const _e=bt("内存泄漏测试 (10x)",{tone:"danger"});_e.addEventListener("click",()=>this.runLeakTest()),d.panes.addons.appendChild(_e);const Ke=bt("恢复内置示例");Ke.addEventListener("click",()=>{this.restoreBuiltinExamples()}),d.panes.addons.appendChild(this.createLabel("目录")),d.panes.addons.appendChild(Ke);const Ae=qr();d.panes.addons.appendChild(this.createLabel("显示")),d.panes.addons.appendChild(Ae.table),We(Ae.body,"axes",Ot("vis-show-axes",!0,O=>{this.axesHelper.visible=O})),We(Ae.body,"floorGrid",Ot("vis-show-grid",!0,O=>{this.gridHelper.visible=O})),We(Ae.body,"wellLabels",Ot("vis-show-well-labels",!0,O=>{this.wellLabelsVisible=O,this.setWellLabelsVisible(O)})),We(Ae.body,"legend",Ot("vis-show-legend",!0,O=>{this.legendEl.style.display=O&&this.currentProperty?"block":"none"})),We(Ae.body,"histogram",Ot("vis-show-histogram",!0,O=>{this.histogramEl&&(this.histogramEl.style.display=O&&this.currentScalarValues?"block":"none")})),We(Ae.body,"wellMap",Ot("vis-show-wellmap",!0,O=>{this.wellMapRoot.style.display=O?"block":"none"})),We(Ae.body,"compass",Ot("vis-show-compass",!0,O=>{this.compassHud.root.style.display=O?"flex":"none"}));const M=document.createElement("input");M.type="color",M.id="vis-bg-color",M.value="#0d1117",M.style.cssText="width:100%;height:24px;padding:0;border:1px solid #30363d;background:#161b22;",M.addEventListener("input",()=>this.setBackgroundColor(M.value)),We(Ae.body,"background",M),d.setBadge("controls",u.body.childElementCount),d.setBadge("actions",g.body.childElementCount),d.setBadge("addons",d.panes.addons.childElementCount);const b=bt("保存场景",{tone:"primary"});b.style.cssText+="flex:1;margin:0;width:auto;",b.addEventListener("click",()=>this.saveScene());const k=bt("重置设置");k.style.cssText+="flex:1;margin:0;width:auto;",k.addEventListener("click",()=>this.resetInspectorControls());const te=document.createElement("div");return te.style.cssText="color:#6e7681;font-size:10px;white-space:nowrap;",te.textContent="场景",d.footer.append(b,k,te),n.appendChild(d.footer),e.appendChild(n),this.container.appendChild(e),e}buildObjectTree(){const e=document.createElement("div");Object.assign(e.style,{position:"absolute",top:"0",left:"0",bottom:"0",width:String(At.treeWidth)+"px",background:"rgba(13,17,23,0.96)",borderRight:"1px solid #30363d",overflowY:"auto",padding:"8px",zIndex:"90",boxSizing:"border-box",fontFamily:"-apple-system, sans-serif",color:"#8b949e",fontSize:"12px"}),e.className="oilgas-panel oilgas-object-panel";const t=document.createElement("button");t.type="button",t.textContent="<",t.title="收起组件树",t.setAttribute("aria-label","收起组件树"),Object.assign(t.style,this.iconButtonStyle),t.style.position="absolute",t.style.top="8px",t.style.right="6px",t.addEventListener("click",()=>this.toggleObjectTree(t)),e.appendChild(t);const n=document.createElement("div");n.style.cssText="font-weight:600; color:#58a6ff; margin:2px 28px 8px 2px; font-size:13px; letter-spacing:.04em;",n.textContent="场景组件",e.appendChild(n);const s=document.createElement("input");s.type="search",s.id="vis-object-search",s.placeholder="查找组件...",s.setAttribute("aria-label","查找组件"),s.style.cssText="width:100%;box-sizing:border-box;margin-bottom:8px;padding:6px 8px;background:#161b22;border:1px solid #30363d;border-radius:6px;color:#c9d1d9;font-size:12px;",s.addEventListener("input",()=>{this.treeQuery=s.value,this.updateObjectTree()}),e.appendChild(s);const r=document.createElement("div");r.style.cssText="display:flex;gap:6px;margin-bottom:8px;";const a=(l,c,h)=>{const d=document.createElement("button");d.type="button",d.textContent=l,d.title=c,d.style.cssText="flex:1;padding:4px 6px;background:#21262d;color:#c9d1d9;border:1px solid #30363d;border-radius:5px;cursor:pointer;font-size:11px;",d.addEventListener("click",h),r.appendChild(d)};a("文件","导入本地文件",()=>{var l;return(l=this.fileInput)==null?void 0:l.click()}),a("工作区","从工作区文件树导入",()=>this.openWorkspaceImport()),a("恢复","恢复已隐藏的内置示例",()=>{this.restoreBuiltinExamples()}),e.appendChild(r);const o=document.createElement("div");return o.id="vis-object-list",o.innerHTML='<div style="color:#484f58">加载中...</div>',e.appendChild(o),this.container.appendChild(e),e}createLabel(e){const t=document.createElement("div");return t.textContent=e,t.style.cssText="margin: 14px 0 5px; padding-top: 8px; border-top: 1px solid rgba(48,54,61,.55); font-size: 11px; letter-spacing: .04em; color: #8b949e;",t}toggleSidebar(e){this.sidebarCollapsed=!this.sidebarCollapsed;const t=this.sidebarCollapsed?String(At.inspectorCollapsed)+"px":String(At.inspectorWidth)+"px";this.sidebar.style.width=t;const n=this.sidebar.querySelector('[id="vis-inspector-body"]');n&&(n.style.display=this.sidebarCollapsed?"none":"flex"),e.style.display="block",e.textContent=this.sidebarCollapsed?"<":">",e.title=this.sidebarCollapsed?"展开属性面板":"收起属性面板",e.setAttribute("aria-label",e.title),this.updatePanelOffsets()}toggleObjectTree(e){this.objectTreeCollapsed=!this.objectTreeCollapsed;const t=this.objectTreeCollapsed?String(At.treeCollapsed)+"px":String(At.treeWidth)+"px";this.objectTree.style.width=t,this.objectTree.style.padding=this.objectTreeCollapsed?"0":"8px";for(const n of Array.from(this.objectTree.children))n!==e&&(n.style.display=this.objectTreeCollapsed?"none":"");e.style.display="block",e.style.right=this.objectTreeCollapsed?"5px":"6px",e.textContent=this.objectTreeCollapsed?">":"<",e.title=this.objectTreeCollapsed?"展开组件树":"收起组件树",e.setAttribute("aria-label",e.title),this.updatePanelOffsets()}updatePanelOffsets(){var e,t;Lm({tree:this.objectTree,inspector:this.sidebar,toolbar:this.toolbarEl,tabs:this.container.querySelector(".oilgas-view-tabs"),info:this.infoEl,hud:this.hudEl,readout:this.readoutEl,wellMap:this.wellMapRoot,legend:this.legendEl,histogram:this.histogramEl,details:this.detailsEl,wellLog:this.wellLogEl,slicePlayer:(e=this.slicePlayer)==null?void 0:e.root,compass:(t=this.compassHud)==null?void 0:t.root,viewCluster:this.viewClusterEl,shortcuts:this.shortcutsEl,treeCollapsed:this.objectTreeCollapsed,inspectorCollapsed:this.sidebarCollapsed})}buildToolbar(){const e=document.createElement("div");Object.assign(e.style,{position:"absolute",top:"8px",left:"276px",right:"288px",height:"34px",display:"flex",alignItems:"center",gap:"6px",padding:"4px 8px",background:"rgba(13,17,23,.78)",border:"1px solid #30363d",borderRadius:"7px",zIndex:"20",pointerEvents:"none",boxSizing:"border-box"}),e.className="oilgas-toolbar";const t=document.createElement("span");t.textContent="场景",t.style.cssText="font-size:11px;color:#8b949e;margin-right:4px;",e.appendChild(t);const n=(a,o,l)=>{const c=document.createElement("button");c.type="button",c.textContent=a,c.title=o,c.setAttribute("aria-label",o),Object.assign(c.style,{...this.iconButtonStyle,width:"auto",padding:"0 8px",fontSize:"11px",pointerEvents:"auto"}),c.addEventListener("click",l),e.appendChild(c)};n("导入","导入本地油气文件",()=>{var a;return(a=this.fileInput)==null?void 0:a.click()}),n("工作区","从项目或 Agent 工作区导入",()=>this.openWorkspaceImport()),n("适配","适配当前数据",()=>this.fitView()),n("顶视","顶视 (Alt+T)",()=>this.applyNamedView("top")),n("重置","重置视图",()=>this.resetView()),n("存视角","保存用户视角",()=>this.storeUserView()),n("用视角","恢复用户视角",()=>this.recallUserView()),n("撤销","撤销上一次筛选",()=>this.undoFilter()),n("重做","重做筛选",()=>this.redoFilter()),n("保存","保存当前场景",()=>this.saveScene()),n("恢复","恢复已保存场景",()=>{this.restoreScene()}),n("隐藏","隐藏当前对象",()=>{this.mesh&&(this.mesh.visible=!1)}),n("显示","显示当前对象",()=>{this.mesh&&(this.mesh.visible=!0)}),n("测距","测量两点之间的三维距离",()=>{this.measureMode=!this.measureMode,this.measurePoints=[],this.infoEl.textContent=this.measureMode?"测距模式：依次点击两个点":"已退出测距模式"}),n("对象","切换组件树",()=>{const a=this.objectTree.querySelector("button");a&&this.toggleObjectTree(a)});const s=document.createElement("span");s.style.flex="1",e.appendChild(s);const r=document.createElement("span");return r.textContent="拖拽旋转 · 滚轮缩放 · 点击拾取 · 悬停读数",r.style.cssText="font-size:11px;color:#8b949e;white-space:nowrap;",e.appendChild(r),this.container.appendChild(e),e}fitView(){const e=this.worldModelBox();if(e){this.frameBox(e);return}if(!this.geometry)return;this.geometry.computeBoundingBox();const t=this.geometry.boundingBox;t&&this.frameBox(t)}worldModelBox(){var n;const e=new Pn;let t=!1;(n=this.mesh)!=null&&n.visible&&(e.expandByObject(this.mesh),t=!0);for(const s of this.overlayMeshes.values())s.visible&&(e.expandByObject(s),t=!0);return t&&!e.isEmpty()?e:null}viewportAspect(){return Math.max(this.container.clientWidth/Math.max(this.container.clientHeight,1),.2)}applyCameraProjection(){const e=this.viewportAspect();if(this.camera instanceof Lt){this.camera.aspect=e,this.camera.updateProjectionMatrix();return}ag(this.camera,Math.max(this.camera.position.distanceTo(this.controls.target),1),e)}frameBox(e,t="iso"){const n=e.getCenter(new L),s=Ll(this.objectTreeCollapsed,this.sidebarCollapsed),r=Math.max(80,this.container.clientWidth-s.left-s.right-16),a=Math.max(80,this.container.clientHeight-140),o=og(e,r/a,this.perspectiveCamera.fov)*Math.max(1,this.container.clientHeight/a),l=rg(t,n,o);this.camera.up.copy(l.up),this.camera.position.copy(l.position),this.controls.target.copy(n),this.applyCameraProjection(),this.controls.update()}resetView(){this.fitView(),this.resetInspectorControls()}resetInspectorControls(){this.resetFilters(),this.applyOpacity(.85);const e=this.sidebar.querySelector('[id="vis-wireframe"]');e&&(e.checked=!1,e.dispatchEvent(new Event("change")));const t=this.sidebar.querySelector('[id="vis-clip"]');t&&(t.checked=!1,t.dispatchEvent(new Event("change")));const n=this.sidebar.querySelector('[id="vis-isolate-k"]');n&&(n.checked=!1,n.dispatchEvent(new Event("change"))),this.currentColormap="viridis";const s=this.sidebar.querySelector('[id="vis-colormap"]');s&&(s.value=this.currentColormap),this.reloadPropertyColors().catch(r=>this.reportError(r)),this.infoEl.textContent="已重置显示与过滤"}filterStateSnapshot(){const e=t=>{var n;return((n=this.sidebar.querySelector(t))==null?void 0:n.value)||""};return JSON.stringify({i:e("#vis-filter-i"),j:e("#vis-filter-j"),k:e("#vis-filter-k"),min:e("#vis-filter-prop-min"),max:e("#vis-filter-prop-max"),exclude:this.filterPropertyExclude,bounds:this.filterBounds})}restoreFilterSnapshot(e){const t=JSON.parse(e),n={"#vis-filter-i":t.i||"","#vis-filter-j":t.j||"","#vis-filter-k":t.k||"","#vis-filter-prop-min":t.min||"","#vis-filter-prop-max":t.max||""};for(const[r,a]of Object.entries(n)){const o=this.sidebar.querySelector(r);o&&(o.value=a)}this.filterPropertyExclude=!!t.exclude;const s=this.sidebar.querySelector('[id="vis-filter-prop-exclude"]');s&&(s.checked=this.filterPropertyExclude,s.dispatchEvent(new Event("ugsci-sync"))),this.filterBounds=Array.isArray(t.bounds)&&t.bounds.length===6?t.bounds:null}undoFilter(){if(!this.filterUndoStack.length)return;this.filterRedoStack.push(this.filterStateSnapshot());const e=this.filterUndoStack.pop();this.restoringScene=!0,this.restoreFilterSnapshot(e),this.lastFilterState=e,this.applyFilters(),this.restoringScene=!1}redoFilter(){if(!this.filterRedoStack.length)return;this.filterUndoStack.push(this.filterStateSnapshot());const e=this.filterRedoStack.pop();this.restoringScene=!0,this.restoreFilterSnapshot(e),this.lastFilterState=e,this.applyFilters(),this.restoringScene=!1}saveScene(){if(!this.currentDataset)return;const e={datasetId:this.currentDataset.id,property:this.currentProperty,colormap:this.currentColormap,opacity:this.opacity,wireframe:this.wireframe,timeStep:this.currentTimeStep,filters:this.filterStateSnapshot(),overlays:Array.from(this.overlayMeshes.entries()).filter(([,t])=>t.visible).map(([t])=>t),zScale:this.zScale,ortho:this.useOrtho,camera:{position:this.camera.position.toArray(),target:this.controls.target.toArray(),up:this.camera.up.toArray()}};localStorage.setItem(Gn(this.options,"scene"),JSON.stringify(e)),this.infoEl.textContent="场景已保存"}async restoreScene(){var o,l,c,h;const e=this.lifetimeController,t=Gn(this.options,"scene"),n=()=>!this.disposed&&!e.signal.aborted&&e===this.lifetimeController&&t===Gn(this.options,"scene"),s=()=>{if(!n())throw new DOMException("场景恢复作用域已变化","AbortError")},r=async d=>{s(),await d(),s()};if(!n())return;const a=localStorage.getItem(t);if(!a){this.infoEl.textContent="没有已保存场景";return}try{const d=JSON.parse(a);if(this.restoringScene=!0,d.datasetId&&await r(()=>this.loadDataset(String(d.datasetId))),d.property&&await r(()=>this.executeCommand("set-property",{property:d.property})),d.colormap&&await r(()=>this.executeCommand("set-colormap",{colormap:d.colormap})),Number.isFinite(d.opacity)&&await r(()=>this.executeCommand("set-opacity",{opacity:d.opacity})),typeof d.wireframe=="boolean"&&await r(()=>this.executeCommand("set-wireframe",{enabled:d.wireframe})),Number.isInteger(d.timeStep)&&await r(()=>this.executeCommand("set-timestep",{timeStep:d.timeStep})),s(),d.filters&&(this.restoreFilterSnapshot(d.filters),this.lastFilterState=d.filters,this.applyFilters()),Array.isArray(d.overlays)&&this.manifest)for(const f of d.overlays){const u=this.manifest.datasets.find(g=>g.id===f);u&&u.id!==((o=this.currentDataset)==null?void 0:o.id)&&await r(()=>this.toggleDatasetVisibility(u,!0))}s(),Number.isFinite(d.zScale)&&this.setZScale(Number(d.zScale)),typeof d.ortho=="boolean"&&this.setOrthographic(d.ortho),Array.isArray((l=d.camera)==null?void 0:l.position)&&d.camera.position.length===3&&this.camera.position.fromArray(d.camera.position),Array.isArray((c=d.camera)==null?void 0:c.target)&&d.camera.target.length===3&&this.controls.target.fromArray(d.camera.target),Array.isArray((h=d.camera)==null?void 0:h.up)&&d.camera.up.length===3&&this.camera.up.fromArray(d.camera.up),this.controls.update(),this.infoEl.textContent="场景已恢复"}catch(d){n()&&!(d instanceof Error&&d.name==="AbortError")&&this.showDetails(`场景恢复失败: ${d instanceof Error?d.message:String(d)}`)}finally{n()&&(this.restoringScene=!1)}}exportSceneState(){if(!this.currentDataset)return;const e={schema:"qwenpaw.oilgas-scene.v1",exportedAt:new Date().toISOString(),datasetId:this.currentDataset.id,property:this.currentProperty,colormap:this.currentColormap,opacity:this.opacity,wireframe:this.wireframe,timeStep:this.currentTimeStep,filters:JSON.parse(this.filterStateSnapshot()),overlays:Array.from(this.overlayMeshes.entries()).filter(([,s])=>s.visible).map(([s])=>s),zScale:this.zScale,ortho:this.useOrtho,camera:{position:this.camera.position.toArray(),target:this.controls.target.toArray(),up:this.camera.up.toArray()}},t=URL.createObjectURL(new Blob([JSON.stringify(e,null,2)],{type:"application/json"})),n=document.createElement("a");n.href=t,n.download=`${this.currentDataset.id}.oilgas-scene.json`,n.click(),window.setTimeout(()=>URL.revokeObjectURL(t),1e3),this.infoEl.textContent="场景 JSON 已导出"}buildHud(){const e=document.createElement("div");Object.assign(e.style,{position:"absolute",top:"88px",right:"288px",background:"rgba(22,27,34,0.85)",border:"1px solid #30363d",borderRadius:"8px",padding:"8px 12px",fontSize:"11px",fontFamily:"monospace",pointerEvents:"none",zIndex:"10",minWidth:"148px"});for(const t of["FPS","Frame","Draw Calls","Triangles","JS Heap"]){const n=document.createElement("div");n.style.cssText="display: flex; justify-content: space-between; gap: 16px; margin: 2px 0;";const s=document.createElement("span");s.textContent={FPS:"帧率",Frame:"每帧耗时","Draw Calls":"绘制调用",Triangles:"三角面","JS Heap":"内存"}[t],s.style.color="#8b949e";const r=document.createElement("span");r.textContent="—",r.style.color="#58a6ff",r.style.fontWeight="600",r.dataset.metric=t,n.appendChild(s),n.appendChild(r),e.appendChild(n)}return this.container.appendChild(e),e}buildReadout(){const e=Wm();return this.container.appendChild(e),e}buildInfoBar(){const e=document.createElement("div");return Object.assign(e.style,{position:"absolute",bottom:"8px",left:"8px",background:"rgba(22,27,34,0.85)",border:"1px solid #30363d",borderRadius:"8px",padding:"8px 12px",fontSize:"12px",fontFamily:"monospace",color:"#8b949e",pointerEvents:"none",maxWidth:"500px",zIndex:"10"}),e.textContent="加载中...",this.container.appendChild(e),e}buildDetailsPanel(){const e=document.createElement("div");return Object.assign(e.style,{position:"absolute",right:"8px",bottom:"8px",width:"270px",maxHeight:"260px",overflowY:"auto",display:"none",background:"rgba(13,17,23,0.94)",border:"1px solid #30363d",borderRadius:"8px",padding:"10px",fontSize:"12px",lineHeight:"1.5",color:"#c9d1d9",zIndex:"12",whiteSpace:"pre-wrap"}),this.container.appendChild(e),e}buildLegend(){const e=document.createElement("div");Object.assign(e.style,{position:"absolute",right:"8px",bottom:"278px",width:"178px",padding:"9px 10px",background:"rgba(13,17,23,.88)",border:"1px solid #30363d",borderRadius:"7px",zIndex:"11",color:"#c9d1d9",fontSize:"11px",pointerEvents:"auto",cursor:"pointer",boxSizing:"border-box"}),e.title="点击编辑属性范围",e.addEventListener("click",()=>{const r=this.sidebar.querySelector('[id="vis-filter-prop-min"]');r==null||r.focus()});const t=document.createElement("div");t.dataset.legendTitle="true",t.style.cssText="display:flex;justify-content:space-between;gap:8px;margin-bottom:6px;color:#c9d1d9;font-weight:600;",e.appendChild(t);const n=document.createElement("div");n.dataset.legendGradient="true",n.style.cssText="height:8px;border-radius:4px;background:linear-gradient(90deg,#440154,#31688e,#35b779,#fde725);",e.appendChild(n);const s=document.createElement("div");return s.dataset.legendRange="true",s.style.cssText="display:flex;justify-content:space-between;margin-top:4px;color:#8b949e;font-family:monospace;",e.appendChild(s),this.container.appendChild(e),this.updateLegend(),e}updateLegend(){if(!this.legendEl)return;const e=this.legendEl.querySelector("[data-legend-title]"),t=this.legendEl.querySelector("[data-legend-range]");e&&(e.textContent=`${bn(this.currentProperty,this.currentDataset)||"统一颜色"} · ${Rl(this.currentColormap)}`),t&&(t.textContent=this.scalarValidCount?`${this.scalarMin.toPrecision(4)}  —  ${this.scalarMax.toPrecision(4)}`:"全部缺测");const n=this.legendEl.querySelector("[data-legend-gradient]");n&&(n.style.background=this.scalarValidCount?wm(this.currentColormap):"#737373"),this.legendEl.style.display=this.currentProperty&&this.legendVisible()?"block":"none",this.renderHistogram()}legendVisible(){var e;return((e=this.sidebar.querySelector('[id="vis-show-legend"]'))==null?void 0:e.checked)!==!1}histogramVisible(){var e;return((e=this.sidebar.querySelector('[id="vis-show-histogram"]'))==null?void 0:e.checked)!==!1}buildHistogram(){const e=document.createElement("canvas");return e.width=220,e.height=72,Object.assign(e.style,{position:"absolute",right:"12px",bottom:"92px",width:"160px",height:"56px",background:"rgba(13,17,23,.82)",border:"1px solid #30363d",borderRadius:"6px",zIndex:"12"}),e.title="点击设最小值，Shift+点击设最大值，双击清除",e.addEventListener("click",t=>this.onHistogramClick(t)),e.addEventListener("dblclick",()=>{const t=this.sidebar.querySelector('[id="vis-filter-prop-min"]'),n=this.sidebar.querySelector('[id="vis-filter-prop-max"]');t&&(t.value=""),n&&(n.value=""),this.applyFilters()}),this.container.appendChild(e),e}buildWellLogPanel(){const e=document.createElement("canvas");return e.width=360,e.height=720,Object.assign(e.style,{position:"absolute",top:"88px",right:"12px",bottom:"16px",width:"280px",background:"rgba(13,17,23,.94)",border:"1px solid #30363d",borderRadius:"8px",zIndex:"25",display:"none"}),e.title="测井曲线",this.container.appendChild(e),e}renderHistogram(){const e=this.histogramEl;if(!e)return;const t=e.getContext("2d");if(!t)return;t.fillStyle="#0d1117",t.fillRect(0,0,e.width,e.height);const n=this.currentScalarValues;if(!n||n.length<2){e.style.display="none";return}e.style.display=this.histogramVisible()?"block":"none";const s=24,r=new Array(s).fill(0),a=this.scalarMin,l=this.scalarMax-a||1;for(const h of n){if(!Number.isFinite(h))continue;const d=Math.min(s-1,Math.max(0,Math.floor((h-a)/l*s)));r[d]+=1}const c=Math.max(...r,1);for(let h=0;h<s;h++){const[d,f,u]=Mm(this.currentColormap,(h+.5)/s);t.fillStyle=`rgb(${Math.round(d*255)},${Math.round(f*255)},${Math.round(u*255)})`;const g=r[h]/c*(e.height-8);t.fillRect(h*(e.width/s),e.height-g,e.width/s-1,g)}}renderWellLog(){var p,v,_;const e=this.wellLogEl;if(!e||!this.currentDataset)return;const t=e.getContext("2d");if(!t)return;const n=e.width,s=e.height;t.fillStyle="#0d1117",t.fillRect(0,0,n,s),t.fillStyle="#58a6ff",t.font="14px sans-serif",t.fillText(this.currentDataset.name,12,22);const r=this.currentProperty?[((v=(p=this.currentDataset.properties)==null?void 0:p[this.currentProperty])==null?void 0:v.label)||this.currentProperty]:[];if(!this.currentScalarValues||r.length===0){t.fillStyle="#8b949e",t.fillText("当前数据集没有测井曲线",12,48);return}const a=(_=this.geometry)==null?void 0:_.getAttribute("position"),o=this.currentScalarValues.length,l=40,h=s-l-20,d=(n-20)/Math.max(r.length,1);t.strokeStyle="#30363d";for(let w=0;w<r.length;w++){const P=10+w*d;t.strokeRect(P,l,d-8,h),t.fillStyle="#8b949e",t.font="11px sans-serif",t.fillText(r[w],P+4,l-8)}const f=this.scalarMin,u=this.scalarMax-this.scalarMin||1;t.strokeStyle="#58a6ff",t.beginPath();let g=!1;const x=(a==null?void 0:a.getZ(0))??0,m=a?a.getZ(a.count-1)-x:0;for(let w=0;w<o;w++){const P=this.currentScalarValues[w];if(!Number.isFinite(P)){g=!1;continue}const C=a&&m!==0&&w<a.count?(a.getZ(w)-x)/m:o<=1?0:w/(o-1),T=l+C*h,H=14+(P-f)/u*(d-16);g?t.lineTo(H,T):t.moveTo(H,T),g=!0}if(t.stroke(),a){t.fillStyle="#8b949e",t.font="10px monospace";const w=Math.abs(a.getZ(0)+this.origin[2]),P=Math.abs(a.getZ(Math.max(0,a.count-1))+this.origin[2]);t.fillText(`${w.toFixed(1)}`,12,l+10),t.fillText(`${P.toFixed(1)}`,12,s-8)}}applyClipPlane(e,t){var a;if(!((a=this.geometry)!=null&&a.boundingBox)||!this.mesh)return;const n=this.geometry.boundingBox,s=n.min.z+(n.max.z-n.min.z)*(1-Math.min(1,Math.max(0,t)));this.clipPlane.setFromNormalAndCoplanarPoint(new L(0,0,-1),new L(0,0,s)),this.renderer.localClippingEnabled=e;const r=this.mesh.material;r&&"clippingPlanes"in r&&(r.clippingPlanes=e?[this.clipPlane]:[],r.needsUpdate=!0)}overlaySources(e){return e==="wellbore"||e==="welllog"?["wellbore","las","dlis"]:e==="intersection"?["intersection","well-intersection","slice","surface"]:e==="network"?["network","network-tube"]:[]}async applyActiveView(e){var r,a,o;if(this.store.setActiveView(e),this.infoEl.textContent=`当前视图: ${Vi.VIEW_LABELS[e]}`,this.wellLogEl&&(this.wellLogEl.style.display=e==="welllog"?"block":"none"),this.wellMapRoot&&(this.wellMapRoot.style.display=e==="welllog"?"none":"block"),!this.manifest)return;const t=l=>l.source||"",n=l=>this.manifest.datasets.find(c=>l.includes(t(c))),s=((r=this.currentDataset)==null?void 0:r.source)||"";if(e==="reservoir"){const l=this.currentDataset&&Nt(this.currentDataset)?this.currentDataset:this.manifest.datasets.find(Nt);l&&l.id!==((a=this.currentDataset)==null?void 0:a.id)&&await this.loadDataset(l.id)}else if(e==="wellbore"){if(!(this.currentDataset&&tt(this.currentDataset))){const l=this.manifest.datasets.find(tt);l?await this.loadDataset(l.id):this.infoEl.textContent="没有空间井轨迹。测井曲线请用「测井」页签；LAS 不会画在原点。"}}else if(e==="intersection"){if(!this.overlaySources("intersection").includes(s)){const l=n(this.overlaySources("intersection"));l?await this.loadDataset(l.id):this.infoEl.textContent="没有剖面。请生成垂直剖面、井剖面或 IJK 切片。"}}else if(e==="welllog"){const l=h=>Ct(h)||["las","dlis"].includes(t(h)),c=this.currentDataset&&l(this.currentDataset)?this.currentDataset:this.manifest.datasets.find(l);c&&c.id!==((o=this.currentDataset)==null?void 0:o.id)&&await this.loadDataset(c.id),this.renderWellLog(),c||(this.infoEl.textContent="没有测井曲线。请导入 LAS/DLIS 文件。")}else if(e==="network"&&!["network","network-tube"].includes(s)){const l=n(["network","network-tube"]);l?await this.loadDataset(l.id):this.infoEl.textContent="没有管网数据。请导入 CSV/JSON 管网。"}}firstWellDataset(){var e;return(e=this.manifest)==null?void 0:e.datasets.find(tt)}async createWellSectionFromUI(){var n;if(!this.currentDataset)return;const e=tt(this.currentDataset)?this.currentDataset:this.firstWellDataset();if(!e){this.showDetails("没有空间井轨迹，无法生成井剖面。仅深度测井不能用来切三维剖面。");return}const t=((n=this.manifest)==null?void 0:n.datasets.find(s=>["cmg","egrid","roff","eclipse"].includes(s.source||"")||s.grid_dims))||this.currentDataset;try{const s=await this.request(`${this.apiBase}/datasets/${encodeURIComponent(t.id)}/well-sections`,{method:"POST",headers:{...this.authHeaders(),"Content-Type":"application/json"},body:JSON.stringify({well_dataset_id:e.id,offset:50,property:this.currentProperty,name:`wellsec_${Date.now()}`})});if(!s.ok){this.showDetails(`井剖面生成失败: HTTP ${s.status}`);return}const r=await s.json();this.manifest=await this.fetchJson("/manifest"),this.updateObjectTree(),await this.loadDataset(r.id),this.viewRouter.switchTo("intersection"),this.showDetails(`井剖面已生成：${r.name}`)}catch(s){this.showDetails(`井剖面生成失败：${s instanceof Error?s.message:String(s)}`)}}async createSliceFromUI(){var n,s;if(!this.currentDataset)return;const e=((n=this.sidebar.querySelector('[id="vis-slice-axis"]'))==null?void 0:n.value)||"k",t=Number(((s=this.sidebar.querySelector('[id="vis-slice-index"]'))==null?void 0:s.value)||1);try{const r=await this.request(`${this.apiBase}/datasets/${encodeURIComponent(this.currentDataset.id)}/slices`,{method:"POST",headers:{...this.authHeaders(),"Content-Type":"application/json"},body:JSON.stringify({axis:e,index:t,property:this.currentProperty,name:`slice_${e}${t}_${Date.now()}`})});if(!r.ok){this.showDetails(`切片生成失败: HTTP ${r.status}`);return}const a=await r.json();this.manifest=await this.fetchJson("/manifest"),this.updateObjectTree(),await this.loadDataset(a.id),this.viewRouter.switchTo("intersection"),this.showDetails(`切片已生成：${a.name}`)}catch(r){this.showDetails(`切片生成失败：${r instanceof Error?r.message:String(r)}`)}}showDetails(e){this.detailsEl.textContent=e,this.detailsEl.style.display="block"}async showDatasetStats(){if(!this.currentDataset||!this.currentProperty){this.showDetails("当前数据集没有可统计属性");return}try{const e=await this.fetchJson(`/datasets/${encodeURIComponent(this.currentDataset.id)}/stats?property=${encodeURIComponent(this.currentProperty)}&time_step=${this.currentTimeStep}`);this.showDetails([`属性统计 · ${bn(e.property,this.currentDataset)}`,`样本数: ${Number(e.count).toLocaleString()}`,`最小值: ${Number(e.min).toPrecision(6)}`,`P10: ${Number(e.p10).toPrecision(6)}`,`中位数: ${Number(e.p50).toPrecision(6)}`,`平均值: ${Number(e.mean).toPrecision(6)}`,`P90: ${Number(e.p90).toPrecision(6)}`,`最大值: ${Number(e.max).toPrecision(6)}`].join(`
`))}catch(e){this.showDetails(`统计失败: ${e instanceof Error?e.message:String(e)}`)}}async exportDataset(){if(!this.currentDataset)return;const e=`${this.apiBase}/datasets/${encodeURIComponent(this.currentDataset.id)}/export?format=csv&time_step=${this.currentTimeStep}`,t=await this.request(e,{headers:this.authHeaders()});if(!t.ok){this.showDetails(`导出失败: HTTP ${t.status}`);return}const n=await t.blob(),s=URL.createObjectURL(n),r=document.createElement("a");r.href=s,r.download=`${this.currentDataset.id}.csv`,r.click(),window.setTimeout(()=>URL.revokeObjectURL(s),1e3),this.showDetails("属性 CSV 已导出")}async createIntersectionFromUI(){var r,a;if(!this.currentDataset)return;const e=this.sidebar.querySelector('[id="vis-polyline"]'),t=Number(((r=this.sidebar.querySelector('[id="vis-section-z-min"]'))==null?void 0:r.value)||0),n=Number(((a=this.sidebar.querySelector('[id="vis-section-z-max"]'))==null?void 0:a.value)||5e3),s=((e==null?void 0:e.value)||"").split(";").map(o=>o.trim()).filter(Boolean).map(o=>{const[l,c]=o.split(",").map(Number);return[l,c]});if(s.length<2||s.some(([o,l])=>!Number.isFinite(o)||!Number.isFinite(l))||!Number.isFinite(t)||!Number.isFinite(n)||n<=t){this.showDetails("剖面参数无效：至少需要两个 x,y 点，且 z max > z min");return}try{const o=await this.request(`${this.apiBase}/datasets/${encodeURIComponent(this.currentDataset.id)}/intersections`,{method:"POST",headers:{...this.authHeaders(),"Content-Type":"application/json"},body:JSON.stringify({polyline_x:s.map(([c])=>c),polyline_y:s.map(([,c])=>c),z_min:t,z_max:n,name:`section_${Date.now()}`,property:this.currentProperty})});if(!o.ok){this.showDetails(`剖面生成失败: HTTP ${o.status}`);return}const l=await o.json();this.manifest=await this.fetchJson("/manifest"),this.updateObjectTree(),this.showDetails(`剖面已生成：${l.name}`),await this.loadDataset(l.id),this.viewRouter.switchTo("intersection")}catch(o){this.showDetails(`剖面生成失败：${o instanceof Error?o.message:String(o)}`)}}async init(){await this.refreshCatalog(this.options.initialDatasetId,this.options.autoLoad!==!1)}syncDatasetSelect(){const e=this.sidebar.querySelector('[id="vis-dataset"]');if(!e||!this.manifest)return;const t=e.value;e.innerHTML="";for(const n of this.manifest.datasets){const s=document.createElement("option");s.value=n.id,s.textContent=`${n.name}（${n.n_cells.toLocaleString()} 单元）`,e.appendChild(s)}this.manifest.datasets.some(n=>n.id===t)&&(e.value=t)}preferredDatasetId(){return!this.manifest||this.manifest.datasets.length===0?null:(this.manifest.datasets.find(t=>Nt(t)&&Object.keys(t.files.scalars||{}).length>0)||this.manifest.datasets.find(Nt)||this.manifest.datasets.find(t=>!["intersection","well-intersection"].includes(t.source||"")&&!Ct(t)&&Object.keys(t.files.scalars||{}).length>0)||this.manifest.datasets[0]).id}async refreshCatalog(e,t=!0){var l;const n=++this.catalogGeneration,s=await this.fetchJson("/manifest");if(this.disposed||n!==this.catalogGeneration)return;if(!s||!Array.isArray(s.datasets))throw new Error("数据目录格式无效");this.manifest=s,this.syncDatasetSelect(),this.updateObjectTree();const r=((l=this.manifest)==null?void 0:l.datasets)||[];if(r.length===0){this.clearSceneForEmptyCatalog(),this.infoEl.textContent="场景为空。可用工具栏「导入」或从工作区选择文件。";return}if(e&&!r.some(c=>c.id===e))throw new Error(`数据集不存在：${e}`);if(!t&&!e)return;const a=e&&r.some(c=>c.id===e)?e:null;if(a){await this.loadDataset(a);return}if(this.currentDataset&&r.some(c=>{var h;return c.id===((h=this.currentDataset)==null?void 0:h.id)}))return;const o=this.preferredDatasetId();o&&await this.loadDataset(o)}clearSceneForEmptyCatalog(){var e;this.loadGeneration++,(e=this.abortController)==null||e.abort(),this.datasetLoading=!1,this.currentDataset=null,this.selectedObjectId=null,this.disposeCurrentMesh(),this.clearOverlays(),this.store.setDataset(null),this.updateObjectTree()}importDialogHost(){return{...this.options,apiBase:this.apiBase,authToken:this.authToken,container:this.container,onStatus:e=>{this.infoEl.textContent=e},onImported:async e=>{this.infoEl.textContent="导入完成，正在加载三维场景",await this.refreshCatalog(e)}}}openWorkspaceImport(){var e;(e=this.closeWorkspacePicker)==null||e.call(this),this.closeWorkspacePicker=sg(this.importDialogHost())}async handlePickedFiles(e){if(this.importBusy){this.infoEl.textContent="已有导入任务进行中";return}this.importBusy=!0;try{await ng(this.importDialogHost(),e)}catch(t){this.infoEl.textContent=t instanceof Error?t.message:String(t)}finally{this.importBusy=!1}}async deleteCatalogDataset(e){var s;const t=!!(e.metadata&&e.metadata.managed);if(window.confirm(t?`删除「${e.name}」及其缓存文件？此操作不可恢复。`:`从场景移除「${e.name}」？内置示例可在组件树「恢复」或 Addons 中重新显示。`))try{const r=await this.request(`${this.apiBase}/datasets/${encodeURIComponent(e.id)}`,{method:"DELETE",headers:this.authHeaders()});if(!r.ok)throw new Error(`删除失败: HTTP ${r.status}`);const a=await r.json();this.infoEl.textContent=a.status==="removed"?`已删除 ${e.name}`:`已从场景移除 ${e.name}（示例文件仍保留，可恢复）`,((s=this.currentDataset)==null?void 0:s.id)===e.id&&(this.currentDataset=null),this.selectedObjectId===e.id&&(this.selectedObjectId=null);const o=this.overlayMeshes.get(e.id);o&&(this.disposeObject3D(o),this.overlayMeshes.delete(e.id)),await this.refreshCatalog()}catch(r){this.infoEl.textContent=r instanceof Error?r.message:String(r)}}async restoreBuiltinExamples(){try{const e=await this.request(`${this.apiBase}/catalog/restore-examples`,{method:"POST",headers:this.authHeaders()});if(!e.ok)throw new Error(`恢复失败: HTTP ${e.status}`);const t=await e.json();await this.refreshCatalog(),this.infoEl.textContent=t.count?`已恢复 ${t.count} 个内置示例`:"没有已隐藏的内置示例"}catch(e){this.infoEl.textContent=e instanceof Error?e.message:String(e)}}updateObjectTree(){var n;const e=this.objectTree.querySelector('[id="vis-object-list"]');if(!e||!this.manifest)return;const t=this.collectVisibleIds();Bm(e,this.manifest.datasets,{query:this.treeQuery,activeId:((n=this.currentDataset)==null?void 0:n.id)||null,selectedId:this.selectedObjectId,visibleIds:t,collapsedGroups:this.collapsedGroups,onToggleGroup:s=>{this.collapsedGroups.has(s)?this.collapsedGroups.delete(s):this.collapsedGroups.add(s),this.updateObjectTree()},onToggleVisible:(s,r)=>{this.toggleDatasetVisibility(s,r)},onSelect:s=>{this.selectDatasetFromTree(s).catch(r=>this.reportError(r))},onFocus:s=>{this.focusDataset(s).catch(r=>this.reportError(r))},onDelete:s=>{this.deleteCatalogDataset(s)},onContextMenu:(s,r)=>{this.openObjectContextMenu(s,r.clientX,r.clientY)}})}isLineDataset(e){return Tl(e)==="lines"}datasetById(e){var t;return(t=this.manifest)==null?void 0:t.datasets.find(n=>n.id===e)}applyNamedView(e){const t=this.worldModelBox();if(!t){this.infoEl.textContent="没有可适配的对象";return}this.frameBox(t,e),this.infoEl.textContent="视角: "+e}setZScale(e){this.zScale=Math.min(8,Math.max(.1,e)),this.modelRoot.scale.set(1,1,this.zScale);const t=this.sidebar.querySelector('[id="vis-z-scale-value"]');t&&(t.textContent=this.zScale.toFixed(2)+"x");const n=this.sidebar.querySelector('[id="vis-z-scale"]');n&&(n.value=String(Math.round(this.zScale*100)))}setOrthographic(e){this.useOrtho=e;const t=this.camera,n=e?this.orthoCamera:this.perspectiveCamera;n.position.copy(t.position),n.up.copy(t.up),n.lookAt(this.controls.target),this.camera=n,this.controls.object=n,this.applyCameraProjection(),this.controls.update();const s=this.sidebar.querySelector('[id="vis-ortho"]');s&&s.checked!==e&&(s.checked=e,s.dispatchEvent(new Event("ugsci-sync"))),this.infoEl.textContent=e?"正交投影":"透视投影"}setBackgroundColor(e){const t=new Ue(e);this.scene.background=t;const n=this.scene.fog;n instanceof zi&&n.color.copy(t)}setWellLabelsVisible(e){const t=n=>{n==null||n.traverse(s=>{s.name==="oilgas-well-label"&&(s.visible=e)})};t(this.mesh);for(const n of this.overlayMeshes.values())t(n)}applySliceAxis(e){const t=this.sidebar.querySelector('[id="vis-filter-i"]'),n=this.sidebar.querySelector('[id="vis-filter-j"]'),s=this.sidebar.querySelector('[id="vis-filter-k"]');if(!e){t&&(t.value=""),n&&(n.value=""),s&&(s.value=""),this.applyFilters();return}this.applySliceIndex(e,this.slicePlayer.index())}applySliceIndex(e,t){const n=this.sidebar.querySelector('[id="vis-filter-i"]'),s=this.sidebar.querySelector('[id="vis-filter-j"]'),r=this.sidebar.querySelector('[id="vis-filter-k"]');n&&(n.value=e==="i"?Yr(t):""),s&&(s.value=e==="j"?Yr(t):""),r&&(r.value=e==="k"?Yr(t):""),this.applyFilters()}setSlicePlaying(e){this.sliceTimer!==null&&(window.clearInterval(this.sliceTimer),this.sliceTimer=null),e&&(this.sliceTimer=window.setInterval(()=>{var o;const t=this.slicePlayer.axis();if(!t){this.slicePlayer.setPlaying(!1),this.setSlicePlaying(!1);return}const n=(o=this.currentDataset)==null?void 0:o.grid_dims,s=t==="i"?n==null?void 0:n[0]:t==="j"?n==null?void 0:n[1]:n==null?void 0:n[2],r=Math.max(1,Number(s)||1),a=this.slicePlayer.index()%r+1;this.slicePlayer.setIndex(a)},400))}storeUserView(){const e={position:this.camera.position.toArray(),target:this.controls.target.toArray(),up:this.camera.up.toArray(),zScale:this.zScale,ortho:this.useOrtho};localStorage.setItem(Gn(this.options,"userView"),JSON.stringify(e)),this.infoEl.textContent="用户视角已保存"}recallUserView(){const e=localStorage.getItem(Gn(this.options,"userView"));if(!e){this.infoEl.textContent="没有已保存视角";return}try{const t=JSON.parse(e);Number.isFinite(t.zScale)&&this.setZScale(Number(t.zScale)),typeof t.ortho=="boolean"&&this.setOrthographic(t.ortho),Array.isArray(t.position)&&this.camera.position.fromArray(t.position),Array.isArray(t.target)&&this.controls.target.fromArray(t.target),Array.isArray(t.up)&&this.camera.up.fromArray(t.up),this.applyCameraProjection(),this.controls.update(),this.infoEl.textContent="已恢复用户视角"}catch{this.infoEl.textContent="视角数据无效"}}openObjectContextMenu(e,t,n){hg(this.container,t,n,dg(!!e),s=>{this.handleObjectContext(e,s)})}async handleObjectContext(e,t){if(t==="show-all"){this.showAllVisible();return}e&&(t==="focus"?await this.focusDataset(e):t==="isolate"?await this.isolateDataset(e):t==="hide"?await this.toggleDatasetVisibility(e,!1):t==="delete"&&await this.deleteCatalogDataset(e))}async isolateDataset(e){var t;this.mesh&&this.currentDataset&&(this.mesh.visible=this.currentDataset.id===e.id);for(const[n,s]of this.overlayMeshes)s.visible=n===e.id;if(e.id!==((t=this.currentDataset)==null?void 0:t.id)){await this.toggleDatasetVisibility(e,!0,{quiet:!0});const n=this.overlayMeshes.get(e.id);n&&(n.visible=!0),this.mesh&&(this.mesh.visible=!1)}this.infoEl.textContent="仅显示 "+e.name,this.updateObjectTree()}showAllVisible(){this.mesh&&(this.mesh.visible=!0);for(const e of this.overlayMeshes.values())e.visible=!0;this.updateObjectTree(),this.infoEl.textContent="已显示全部已加载对象"}hitToModelPoint(e){return this.modelRoot.worldToLocal(e.clone())}onHistogramClick(e){if(e.detail>1||!this.histogramEl)return;const t=this.scalarMax-this.scalarMin;if(!Number.isFinite(t)||t===0)return;const n=this.histogramEl.getBoundingClientRect(),s=Math.min(1,Math.max(0,(e.clientX-n.left)/Math.max(n.width,1))),r=this.scalarMin+s*t,a=this.sidebar.querySelector('[id="vis-filter-prop-min"]'),o=this.sidebar.querySelector('[id="vis-filter-prop-max"]');e.shiftKey?o&&(o.value=String(r)):a&&(a.value=String(r)),this.applyFilters()}updateCompassHud(){this.compassHud.setAzimuth(lg(this.camera.position,this.controls.target)),this.compassHud.setMetersPerPixel(cg(this.camera,this.controls.target,this.container.clientHeight))}collectVisibleIds(){var t;const e=new Set;(t=this.mesh)!=null&&t.visible&&this.currentDataset&&e.add(this.currentDataset.id);for(const[n,s]of this.overlayMeshes)s.visible&&e.add(n);return e}selectionTypeFor(e){return tt(e)||Ct(e)?"well":["network","network-tube"].includes(e.source||"")||this.isLineDataset(e)?"segment":(Nt(e),"surface")}tagSceneObject(e,t){e.userData.datasetId=t.id,e.userData.kind=this.selectionTypeFor(t)}applyOpacity(e){this.opacity=e;const t=this.sidebar.querySelector('[id="vis-opacity-value"]');t&&(t.textContent=e.toFixed(2));const n=this.sidebar.querySelector('[id="vis-opacity"]');n&&(n.value=String(Math.round(e*100)));const s=this.overlayMeshes.get(this.selectedObjectId||"")||this.mesh;this.visitObjectMaterials(s,r=>{r.opacity=e,r.transparent=e<.999,r.needsUpdate=!0})}visitObjectMaterials(e,t){e&&e.traverse(n=>{const s=n;s.material&&(Array.isArray(s.material)?s.material.forEach(t):t(s.material))})}publishSelection(e){var t,n,s;e!=null&&e.datasetId?this.selectedObjectId=e.datasetId:(e==null?void 0:e.type)==="cell"?this.selectedObjectId=((t=this.currentDataset)==null?void 0:t.id)||null:this.selectedObjectId=(e==null?void 0:e.id)||null,this.store.setSelection(e);try{(s=(n=this.options).onSelection)==null||s.call(n,e)}catch(r){console.error("[oilgas-vis] Selection listener failed",r)}e&&this.onSelectionCallback&&this.onSelectionCallback({type:e.type,id:e.id,coords:e.coordinates}),this.updateInspectorObject(),this.updateReadoutHud(),this.highlightSelection(),this.refreshWellMap(),this.updateObjectTree()}updateInspectorObject(){var a;const e=this.sidebar.querySelector("[data-object-name]"),t=this.sidebar.querySelector("[data-object-meta]"),n=this.sidebar.querySelector('[id="vis-inspector-visible"]'),s=this.store.getState().selected,r=this.datasetById(this.selectedObjectId||((a=this.currentDataset)==null?void 0:a.id)||"");if(!r){e&&(e.textContent="未选中对象"),t&&(t.textContent="在组件树或三维视图中点选");return}if(e&&(e.textContent=tt(r)||Ct(r)?ln(r):r.name),t){const o=[(s==null?void 0:s.type)==="cell"?"cell "+s.id:r.source||"object",r.n_cells?r.n_cells.toLocaleString()+" 单元":"",s!=null&&s.coordinates?"E "+s.coordinates[0].toFixed(1)+"  N "+s.coordinates[1].toFixed(1):""].filter(Boolean);t.textContent=o.join(" · ")}n&&(n.checked=this.collectVisibleIds().has(r.id),n.disabled=Ct(r),n.dispatchEvent(new Event("ugsci-sync")))}updateReadoutHud(){var n;if(!this.readoutEl)return;const e=this.store.getState().selected,t=this.datasetById(this.selectedObjectId||((n=this.currentDataset)==null?void 0:n.id)||"");Xm(this.readoutEl,{hover:this.hoverCoords,selectedLabel:t?tt(t)||Ct(t)?ln(t):t.name:"—",selectedMeta:(e==null?void 0:e.type)==="cell"?"Cell "+e.id:(t==null?void 0:t.source)||"",pickKind:(e==null?void 0:e.type)||""})}highlightSelection(){if(this.highlightedOverlayId){const n=this.objectForId(this.highlightedOverlayId);this.setObjectHighlight(n,!1),this.highlightedOverlayId=null}const e=this.store.getState().selected;if(!e||e.type==="cell"||!this.selectedObjectId)return;const t=this.objectForId(this.selectedObjectId);t&&(this.setObjectHighlight(t,!0),this.highlightedOverlayId=this.selectedObjectId)}objectForId(e){var t;return this.overlayMeshes.has(e)?this.overlayMeshes.get(e)||null:((t=this.currentDataset)==null?void 0:t.id)===e?this.mesh:null}setObjectHighlight(e,t){this.visitObjectMaterials(e,n=>{const s=n;if(s.color){if(s.vertexColors){s.color.setHex(16777215),s.emissive&&s.emissive.setHex(0);return}t?(s.userData._baseColor==null&&(s.userData._baseColor=s.color.getHex()),s.color.setHex(16765286),s.emissive&&s.emissive.setHex(3811840)):s.userData._baseColor!=null&&(s.color.setHex(s.userData._baseColor),s.emissive&&s.emissive.setHex(0))}})}recordWellPlan(e,t){const n=Vr(t);if(!n.length)return;const s=this.origin,r=Math.max(1,Math.floor(n.length/48)),a=[];for(let h=0;h<n.length;h+=r)a.push([n[h][0]+s[0],n[h][1]+s[1]]);const o=n[n.length-1],l=[o[0]+s[0],o[1]+s[1]];(!a.length||a[a.length-1][0]!==l[0]||a[a.length-1][1]!==l[1])&&a.push(l);const c=n[0];this.wellPlanPoints.set(e.id,{id:e.id,name:ln(e),x:c[0]+s[0],y:c[1]+s[1],z:c[2]+s[2],path:a}),this.refreshWellMap()}refreshWellMap(){this.wellMapCanvas&&Vm(this.wellMapCanvas,Array.from(this.wellPlanPoints.values()),this.selectedObjectId,this.gridMapBounds)}updateGridMapBounds(){if(!this.geometry){this.gridMapBounds=null;return}this.geometry.computeBoundingBox();const e=this.geometry.boundingBox;if(!e){this.gridMapBounds=null;return}this.gridMapBounds={minX:e.min.x+this.origin[0],minY:e.min.y+this.origin[1],maxX:e.max.x+this.origin[0],maxY:e.max.y+this.origin[1]},this.refreshWellMap()}syncChromeFromStore(){var n,s,r,a;const e=this.store.getState(),t=[((n=e.dataset)==null?void 0:n.id)||"",e.activeView,((s=e.selected)==null?void 0:s.type)||"",((r=e.selected)==null?void 0:r.id)||"",((a=e.property)==null?void 0:a.name)||""].join("|");t!==this.lastChromeKey&&(this.lastChromeKey=t,this.updateReadoutHud(),this.updateInspectorObject())}async focusDataset(e){await this.selectDatasetFromTree(e);const t=this.objectForId(e.id);t&&this.frameObject(t)}makeWellLabel(e){const t=document.createElement("div");t.textContent=e,t.style.cssText="color:#f0c14b;font:600 11px/1.2 sans-serif;white-space:nowrap;text-shadow:0 1px 2px #000;pointer-events:none;user-select:none;";const n=new _m(t);return n.name="oilgas-well-label",n.visible=this.wellLabelsVisible,n}buildWellObject(e,t,n){const s=_g(t);if(!s)return null;n&&Vl(s,new Je(t,3),n);const r=new kn;r.name=`oilgas-well-${e.id}`,r.add(s);const a=Vr(t)[0],o=this.makeWellLabel(ln(e));return a&&o.position.set(a[0],a[1],a[2]),r.add(o),r}disposeObject3D(e){var t;e.traverse(n=>{var a,o;const s=n;"element"in n&&s.element instanceof HTMLElement&&s.element.remove();const r=n;(a=r.geometry)==null||a.dispose(),Array.isArray(r.material)?r.material.forEach(l=>l.dispose()):(o=r.material)==null||o.dispose()}),(t=e.parent)==null||t.remove(e)}visitMaterials(e){var t;(t=this.mesh)==null||t.traverse(n=>{const s=n;s.material&&(Array.isArray(s.material)?s.material.forEach(e):e(s.material))})}frameObject(e){const t=new Pn().setFromObject(e);t.isEmpty()||this.frameBox(t)}async selectDatasetFromTree(e){if(Ct(e)){await this.loadDataset(e.id),this.publishSelection({type:"well",id:e.id});return}if(tt(e)&&this.currentDataset&&Nt(this.currentDataset)){await this.toggleDatasetVisibility(e,!0,{quiet:!0});const t=this.overlayMeshes.get(e.id);t&&this.frameObject(t),this.infoEl.textContent=`井 ${ln(e)}`,this.showDetails(`${e.name}
场图叠加（管子）`),this.publishSelection({type:"well",id:e.id});return}await this.loadDataset(e.id),this.publishSelection({type:this.selectionTypeFor(e),id:e.id})}lineRenderIndices(e,t,n){var s;if(((s=e.metadata)==null?void 0:s.geometry_primitive)==="lines")return t;if(e.source==="network"&&t.length%3===0&&t.every((r,a)=>a%3!==2||r===t[a-2])){const r=new Uint32Array(t.length/3*2);for(let a=0,o=0;a<t.length;a+=3,o+=2)r[o]=t[a],r[o+1]=t[a+1];return r}return e.source==="network"?t:Uint32Array.from({length:n},(r,a)=>a)}clearOverlays(){var e;for(const t of this.overlayMeshes.values())this.disposeObject3D(t);this.overlayMeshes.clear(),this.overlayLoading.clear(),this.overlayVisibility.clear(),this.wellPlanPoints.clear(),this.highlightedOverlayId=null;for(const t of Array.from(this.objectTree.querySelectorAll("[data-dataset-id]"))){const n=t.querySelector('input[type="checkbox"]');n&&(n.checked=t.dataset.datasetId===((e=this.currentDataset)==null?void 0:e.id))}}setTreeVisibility(e,t){const n=Array.from(this.objectTree.querySelectorAll("[data-dataset-id]")).find(r=>r.dataset.datasetId===e),s=n==null?void 0:n.querySelector('input[type="checkbox"]');s&&(s.checked=t)}async toggleDatasetVisibility(e,t,n){var a,o,l;if(this.disposed)return;if(this.overlayVisibility.set(e.id,t),Ct(e)){this.setTreeVisibility(e.id,!1),n!=null&&n.quiet||this.showDetails(`${e.name} 是仅深度测井，不在三维场图显示。请打开「测井」页签。`);return}if(e.id===((a=this.currentDataset)==null?void 0:a.id)){this.mesh&&(this.mesh.visible=t),this.setTreeVisibility(e.id,t);return}const s=this.overlayMeshes.get(e.id);if(s){s.visible=t,this.setTreeVisibility(e.id,t);return}if(!t||this.overlayLoading.has(e.id))return;this.overlayLoading.add(e.id);const r=this.loadGeneration;try{const[c,h]=await Promise.all([this.fetchBinary(e.files.positions,(o=this.abortController)==null?void 0:o.signal),this.fetchBinary(e.files.indices,(l=this.abortController)==null?void 0:l.signal)]);if(this.disposed||r!==this.loadGeneration||!this.overlayVisibility.get(e.id))return;const{positions:d,indices:f}=Al(e,c,h),u=Nt(e)&&Kr(d.length/3,e.n_cells);u&&Yl(d,e.n_cells);const g=this.origin,x=u?Jr(d,e.n_cells):null,m=x||d,p=new Float32Array(m.length);for(let _=0;_<m.length;_+=3)p[_]=m[_]-g[0],p[_+1]=m[_+1]-g[1],p[_+2]=m[_+2]-g[2];let v;if(tt(e)){const _=this.buildWellObject(e,p);if(!_)throw new Error("井轨迹点数不足，无法生成管子");v=_}else if(x){const _=Kl(p,e.n_cells),w=new yt;w.setAttribute("position",new Je(_.positions,3)),w.setAttribute("normal",new Je(_.normals,3)),w.setIndex(new Je(_.indices,1));const P=new Ei({color:9147550,transparent:!0,opacity:.45,side:Bt});P.forceSinglePass=!0;const C=new wt(w,P),T=new yt;T.setAttribute("position",new Je(p,3)),T.setIndex(new Je(Zr(Array.from({length:e.n_cells},(y,E)=>E)),1));const H=new Hn(T,new zn({color:13686750,transparent:!0,opacity:.7}));v=new kn,v.add(C),v.add(H)}else{const _=new yt;_.setAttribute("position",new Je(p,3));const w=this.isLineDataset(e),P=w?this.lineRenderIndices(e,f,p.length/3):f;_.setIndex(new Je(P,1)),w||_.computeVertexNormals();const C=w?new zn({color:e.source==="network"||e.source==="network-tube"?16758892:16739229,transparent:!0,opacity:.95}):new Ei({color:9147550,transparent:!0,opacity:.45,side:Bt,wireframe:!0});v=w?e.source==="network"||e.source==="network-tube"?new Hn(_,C):new Ur(_,C):new wt(_,C)}v.name=`oilgas-overlay-${e.id}`,v.visible=t,this.tagSceneObject(v,e),tt(e)&&this.recordWellPlan(e,p),this.modelRoot.add(v),this.overlayMeshes.set(e.id,v),this.setTreeVisibility(e.id,t),n!=null&&n.quiet||this.showDetails(`已加入场景：${e.name}
对象类型：${e.source||"unknown"}`)}catch(c){!this.disposed&&r===this.loadGeneration&&!(c instanceof Error&&c.name==="AbortError")&&(this.showDetails(`对象加载失败：${c instanceof Error?c.message:String(c)}`),this.setTreeVisibility(e.id,!1))}finally{r===this.loadGeneration&&this.overlayLoading.delete(e.id)}}async loadDataset(e){var ee,ae,X;if(this.disposed)throw new Error("可视化引擎已关闭");const t=(ee=this.manifest)==null?void 0:ee.datasets.find(I=>I.id===e);if(!t)throw new Error(`数据集不存在：${e}`);this.disposeCurrentMesh(),this.currentDataset=t,this.store.setDataset(t),this.store.setLoading({stage:"loading-dataset",progress:.1,error:null}),this.clearOverlays(),this.resetFilters(),this.detailsEl.style.display="none";const n=this.sidebar.querySelector('[id="vis-dataset"]');n&&(n.value=e);for(const I of Array.from(this.objectTree.querySelectorAll("[data-dataset-id]"))){const Z=I.dataset.datasetId===e;I.dataset.selected=String(Z);const he=I.querySelector('input[type="checkbox"]');he&&(he.checked=Z),I.style.color=Z?"#e6edf3":"#8b949e",I.style.background=Z?"rgba(31,111,235,.24)":"transparent",I.style.boxShadow=Z?"inset 2px 0 #58a6ff":"none"}const s=this.sidebar.querySelector('[id="vis-property"]'),r=new Set(Object.keys(t.files.scalars||{}));for(const I of t.time_steps||[])Object.keys(I.scalars||{}).forEach(Z=>r.add(Z));if(s)if(s.innerHTML="",r.size===0){const I=document.createElement("option");I.value="",I.textContent="无属性（统一颜色）",s.appendChild(I),s.disabled=!0,this.currentProperty=""}else{s.disabled=!1;for(const I of r){const Z=document.createElement("option");Z.value=I,Z.textContent=bn(I,t),s.appendChild(Z)}r.has(this.currentProperty)||(this.currentProperty=r.values().next().value||""),s.value=this.currentProperty}const a=this.sidebar.querySelector('[id="vis-timestep"]');if(a&&(a.innerHTML='<option value="0">静态</option>',t.time_steps))for(const I of t.time_steps){const Z=document.createElement("option");Z.value=String(I.index+1),Z.textContent=`时间步 ${I.index}（${I.step_number}）`,a.appendChild(Z)}this.currentTimeStep=0,this.infoEl.textContent=`正在加载 ${t.name}...`,this.abortController&&this.abortController.abort(),this.abortController=new AbortController;const o=++this.loadGeneration;this.datasetLoading=!0;const l=this.abortController.signal;let c,h,d;try{[c,h,d]=await Promise.all([this.fetchBinary(t.files.positions,l),this.fetchBinary(t.files.indices,l),this.fetchBinary(t.files.cell_ids,l)])}catch(I){if(o===this.loadGeneration&&(this.datasetLoading=!1,this.store.setLoading({stage:"failed",progress:0,error:I instanceof Error?I.message:String(I)}),this.infoEl.textContent=`加载失败：${I instanceof Error?I.message:String(I)}`),o===this.loadGeneration)throw I;return}if(o!==this.loadGeneration||this.disposed)return;let f;try{f=Al(t,c,h,d)}catch(I){throw this.datasetLoading=!1,this.store.setLoading({stage:"failed",progress:0,error:String(I)}),I}const{positions:u,indices:g}=f,x=f.cellIds;Nt(t)&&Yl(u,x.length);const m=Nt(t)&&Kr(u.length/3,x.length);this.isHexMesh=m||Nt(t)&&yg(u.length/3,x.length);const p=m?Jr(u,x.length):null,v=p||u;let _=0,w=0,P=0;const C=v.length/3;for(let I=0;I<v.length;I+=3){if(!Number.isFinite(v[I])||!Number.isFinite(v[I+1])||!Number.isFinite(v[I+2])){this.datasetLoading=!1,this.infoEl.textContent="加载失败：坐标数据包含非有限值";return}_+=v[I],w+=v[I+1],P+=v[I+2]}_/=C,w/=C,P/=C;const T=Ct(t);T&&(_=0,w=0,P=0);const H=new Float32Array(v.length);for(let I=0;I<v.length;I+=3)H[I]=v[I]-_,H[I+1]=v[I+1]-w,H[I+2]=v[I+2]-P;const y=this.isLineDataset(t);let E=H,N=g,G=null;const J=p?H:null;if(p){const I=Kl(H,x.length);E=I.positions,N=I.indices,G=I.normals}const R=new yt;R.setAttribute("position",new Je(E,3));const U=y?this.lineRenderIndices(t,N,E.length/3):N;R.setIndex(new Je(U,1)),G&&R.setAttribute("normal",new Je(G,3)),R.computeBoundingBox(),R.computeBoundingSphere(),!y&&!G&&R.computeVertexNormals();let B=!1;try{const I=await this.applyPropertyColors(R,t,U,o);if(I===null){if(o!==this.loadGeneration){R.dispose();return}B=!1}else B=I}catch(I){o===this.loadGeneration&&this.showDetails(`属性加载失败：${I instanceof Error?I.message:String(I)}`)}if(o!==this.loadGeneration){R.dispose();return}if(this.cellIds=x,this.baseIndices=U,this.hexCornerPositions=J,this.isHexMesh=!!J,this.cellCenters=null,this.visibleCellOffsets=Array.from({length:x.length},(I,Z)=>Z),this.origin=[_,w,P],this.geometry=R,this.datasetLoading=!1,this.renderHistogram(),this.store.setLoading({stage:"ready",progress:1,error:null}),this.store.setProperty({name:this.currentProperty,displayName:bn(this.currentProperty,this.currentDataset),range:[this.scalarMin,this.scalarMax]}),this.store.setTimeStep(this.currentTimeStep),T)this.mesh=null;else if(tt(t)){const I=this.buildWellObject(t,H,this.geometry.getAttribute("color"));this.mesh=I,I&&this.modelRoot.add(I)}else if(y){const I=new zn({vertexColors:B,color:B?16777215:5809919,transparent:!0,opacity:this.opacity});this.mesh=new Hn(this.geometry,I),this.modelRoot.add(this.mesh)}else{const I=new Ei({vertexColors:B,side:Bt,transparent:!0,opacity:this.opacity,wireframe:this.isHexMesh?!1:this.wireframe,clippingPlanes:[]});I.forceSinglePass=!0,B||(I.color=new Ue(4491519)),this.mesh=new wt(this.geometry,I),this.attachHexEdges(x.length),this.modelRoot.add(this.mesh)}this.mesh&&this.tagSceneObject(this.mesh,t),tt(t)&&!T&&this.recordWellPlan(t,H),this.updateGridMapBounds();const $=this.geometry.boundingSphere,q=Math.max($.radius,1);if(!T){const I=Math.max(q/1e4,.1),Z=Math.max(q*20,2e4);this.perspectiveCamera.near=I,this.perspectiveCamera.far=Z,this.orthoCamera.near=I,this.orthoCamera.far=Z,this.applyCameraProjection();const he=this.scene.background instanceof Ue?this.scene.background.clone():new Ue(856343);this.scene.fog=new zi(he,q*4,q*10),this.mesh&&tt(t)?this.frameObject(this.mesh):this.geometry.boundingBox&&this.frameBox(this.geometry.boundingBox),this.controls.minDistance=q*.01,this.controls.maxDistance=q*20,this.controls.update()}this.slicePlayer.setDims(t.grid_dims),this.setWellLabelsVisible(this.wellLabelsVisible),this.infoEl.textContent=T?`${t.name} — 仅深度测井，不在三维场图显示`:`${t.name} — ${t.n_cells.toLocaleString()} 单元 | 原点：(${_.toFixed(0)}, ${w.toFixed(0)}, ${P.toFixed(0)})`;const K=this.sidebar.querySelector('[id="vis-k-layer"]');K&&((ae=t.grid_dims)!=null&&ae[2])&&(K.max=String(t.grid_dims[2]),K.value=K.value||"1");const Q=this.sidebar.querySelector('[id="vis-slice-index"]');if(Q&&((X=t.grid_dims)!=null&&X[2])&&(Q.max=String(t.grid_dims[2])),Nt(t)&&await this.attachSpatialWellOverlays(o),this.updateObjectTree(),this.updateInspectorObject(),this.updateReadoutHud(),this.refreshWellMap(),o===this.loadGeneration){const I=t.source||"",Z=Ct(t)?"welllog":tt(t)?this.viewRouter.getActiveView()==="welllog"&&["las","dlis"].includes(I)?"welllog":"wellbore":this.overlaySources("network").includes(I)?"network":this.overlaySources("intersection").includes(I)?"intersection":"reservoir";this.viewRouter.switchTo(Z,!1),this.wellLogEl&&(this.wellLogEl.style.display=Z==="welllog"?"block":"none"),this.wellMapRoot&&(this.wellMapRoot.style.display=Z==="welllog"?"none":"block"),this.publishSelection({type:this.selectionTypeFor(t),id:t.id}),Z==="welllog"&&this.renderWellLog()}}async attachSpatialWellOverlays(e){var n;if(!this.manifest)return;const t=this.manifest.datasets.filter(tt);for(const s of t){if(e!==this.loadGeneration)return;s.id!==((n=this.currentDataset)==null?void 0:n.id)&&await this.toggleDatasetVisibility(s,!0,{quiet:!0})}t.length&&e===this.loadGeneration&&(this.infoEl.textContent=`${this.infoEl.textContent} · 已叠加 ${t.length} 口井`)}resetFilters(){for(const t of["#vis-filter-i","#vis-filter-j","#vis-filter-k","#vis-filter-prop-min","#vis-filter-prop-max"]){const n=this.sidebar.querySelector(t);n&&(n.value="")}this.filterI=[0,1/0],this.filterJ=[0,1/0],this.filterK=[0,1/0],this.filterPropertyRange=[-1/0,1/0],this.filterPropertyExclude=!1;const e=this.sidebar.querySelector('[id="vis-filter-prop-exclude"]');e&&(e.checked=!1,e.dispatchEvent(new Event("ugsci-sync"))),this.filterBounds=null,this.filterUndoStack=[],this.filterRedoStack=[],this.lastFilterState=this.filterStateSnapshot()}async applyPropertyColors(e,t,n,s=this.loadGeneration,r=++this.colorRequest){var v;if(!e||!t)return!1;const a=this.currentProperty,o=this.currentTimeStep,l=this.currentColormap;let c;const h=o;if(h>0&&t.time_steps){const _=t.time_steps.find(w=>w.index===h-1);_&&(c=_.scalars[a])}if(c||(c=t.files.scalars[a]),!c)return e.deleteAttribute("color"),this.currentScalarValues=null,this.scalarValidCount=0,this.scalarMin=0,this.scalarMax=1,this.updateLegend(),!1;const d=await this.fetchBinary(c,(v=this.abortController)==null?void 0:v.signal);if(this.disposed||s!==this.loadGeneration||r!==this.colorRequest)return null;if(!d.byteLength||d.byteLength%4!==0)throw new Error("属性缓冲区字节长度无效");const f=c.endsWith(".f32");if(!f&&!c.endsWith(".u32"))throw new Error("不支持的属性数据类型");const u=f?new Float32Array(d):new Uint32Array(d),g=e.getAttribute("position").count,x=Sm(t,a,u.length,g),m=x==="point"?g:t.n_cells;if(u.length!==m)throw new Error("属性数量与点／单元数量不一致");let p=this.workerManager.isAvailable()?await this.workerManager.computeColors(d.slice(0),n.slice().buffer,l,g,f,x):null;return this.disposed||s!==this.loadGeneration||r!==this.colorRequest?null:(p||(p=Cl(u,n,l,g,x)),this.currentScalarValues=u,this.scalarValidCount=p.validCount,this.scalarMin=p.smin,this.scalarMax=p.smax,this.store.setProperty({name:a,displayName:bn(a,t),range:[p.smin,p.smax]}),e.setAttribute("color",new Je(p.colors,3)),this.updateLegend(),!0)}async reloadPropertyColors(){var n;if(this.datasetLoading||!this.currentDataset||!this.geometry)return;const e=this.baseIndices||this.geometry.getIndex().array;let t=!1;try{const s=await this.applyPropertyColors(this.geometry,this.currentDataset,e);if(s===null)return;t=s}catch(s){throw this.showDetails(`属性加载失败：${s instanceof Error?s.message:String(s)}`),s}if(tt(this.currentDataset)){const s=this.geometry.getAttribute("position"),r=this.geometry.getAttribute("color");(n=this.mesh)==null||n.traverse(a=>{a instanceof wt&&a.name==="oilgas-well-tube"&&Vl(a,s,r)})}this.visitMaterials(s=>{const r=s;"vertexColors"in r&&(r.vertexColors=t,"color"in r&&r.color.set(t?16777215:4491519),r.needsUpdate=!0)}),this.applyFilters(),this.renderHistogram(),this.viewRouter.getActiveView()==="welllog"&&this.renderWellLog()}getCellCenters(e){if(this.cellCenters)return this.cellCenters;if(!this.geometry||!this.baseIndices||!this.cellIds||!Number.isInteger(e)||e<=0)return null;const t=this.geometry.getAttribute("position"),n=new Float32Array(this.cellIds.length*3);for(let s=0;s<this.cellIds.length;s++){const r=s*e;let a=0,o=0,l=0,c=0;for(let h=r;h<r+e;h++){const d=this.baseIndices[h];d>=t.count||(o+=t.getX(d),l+=t.getY(d),c+=t.getZ(d),a++)}a&&(n[s*3]=o/a+this.origin[0],n[s*3+1]=l/a+this.origin[1],n[s*3+2]=c/a+this.origin[2])}return this.cellCenters=n,n}applyFilters(){var f,u,g,x,m,p;if(this.datasetLoading||!this.geometry||!this.currentDataset||!this.cellIds||!this.baseIndices)return;const e=this.filterStateSnapshot();!this.restoringScene&&this.lastFilterState&&e!==this.lastFilterState&&(this.filterUndoStack.push(this.lastFilterState),this.filterUndoStack.length>50&&this.filterUndoStack.shift(),this.filterRedoStack=[]),this.lastFilterState=e;const t=(f=this.sidebar.querySelector('[id="vis-filter-i"]'))==null?void 0:f.value,n=(u=this.sidebar.querySelector('[id="vis-filter-j"]'))==null?void 0:u.value,s=(g=this.sidebar.querySelector('[id="vis-filter-k"]'))==null?void 0:g.value,r=(x=this.sidebar.querySelector('[id="vis-filter-prop-min"]'))==null?void 0:x.value,a=(m=this.sidebar.querySelector('[id="vis-filter-prop-max"]'))==null?void 0:m.value;if(this.filterI=this.parseRange(t),this.filterJ=this.parseRange(n),this.filterK=this.parseRange(s),this.filterPropertyRange=[r?parseFloat(r):-1/0,a?parseFloat(a):1/0],this.store.setFilters([{type:"ijk",enabled:!0,values:[t||"",n||"",s||""]},{type:"property-range",enabled:!!(r||a),min:this.filterPropertyRange[0],max:this.filterPropertyRange[1]}]),this.filterPropertyRange[0]>this.filterPropertyRange[1]){this.infoEl.textContent="属性范围无效：最小值不能大于最大值";return}const o=this.currentDataset.grid_dims,l=this.cellIds.length?this.baseIndices.length/this.cellIds.length:0;if(!Number.isInteger(l)||l<=0){this.infoEl.textContent="当前数据结构不支持单元过滤";return}const c=this.filterBounds?this.getCellCenters(l):null,h=[],d=[];for(let v=0;v<this.cellIds.length;v++){const _=this.cellIds[v];let w=!0;if((o==null?void 0:o.length)===3){const[E,N]=o,G=_%E+1,J=Math.floor(_/E)%N+1,R=Math.floor(_/(E*N))+1;w=G>=this.filterI[0]&&G<=this.filterI[1]&&J>=this.filterJ[0]&&J<=this.filterJ[1]&&R>=this.filterK[0]&&R<=this.filterK[1]}const P=(p=this.currentScalarValues)==null?void 0:p[v],T=!(Number.isFinite(this.filterPropertyRange[0])||Number.isFinite(this.filterPropertyRange[1]))||P!==void 0&&Number.isFinite(P)&&(P>=this.filterPropertyRange[0]&&P<=this.filterPropertyRange[1])!==this.filterPropertyExclude;let H=!0;if(this.filterBounds&&c){const E=c[v*3],N=c[v*3+1],G=c[v*3+2],[J,R,U,B,$,q]=this.filterBounds;H=E>=J&&E<=R&&N>=U&&N<=B&&G>=$&&G<=q}if(!w||!T||!H)continue;h.push(v);const y=v*l;for(let E=y;E<y+l;E++)d.push(this.baseIndices[E])}this.visibleCellOffsets=h,this.geometry.setIndex(d),this.geometry.index.needsUpdate=!0,this.updateHexEdges(),this.infoEl.textContent=`筛选结果：${h.length.toLocaleString()} / ${this.cellIds.length.toLocaleString()} 单元`}parseRange(e){if(!e||e.trim()==="")return[0,1/0];const t=e.split(":");if(t.length===2){const s=Number.parseInt(t[0],10),r=Number.parseInt(t[1],10);return[Math.min(Number.isFinite(s)?s:0,Number.isFinite(r)?r:1/0),Math.max(Number.isFinite(s)?s:0,Number.isFinite(r)?r:1/0)]}const n=parseInt(t[0]);return isNaN(n)?[0,1/0]:[n,n]}runBenchmark(){var r,a;if(this.disposed)return Promise.reject(new Error("可视化引擎已关闭"));(r=this.cancelBenchmark)==null||r.call(this),this.infoEl.textContent="运行基准测试中... (5秒)";const e=[],t=performance.now(),n=((a=this.currentDataset)==null?void 0:a.id)||"unknown";let s=0;return new Promise((o,l)=>{this.cancelBenchmark=()=>{this.benchmarkAnimation!==null&&cancelAnimationFrame(this.benchmarkAnimation),this.benchmarkAnimation=null,this.cancelBenchmark=null,l(new DOMException("基准测试已取消","AbortError"))};const c=()=>{var u,g;if(this.disposed){(u=this.cancelBenchmark)==null||u.call(this);return}const h=performance.now();if(s>0&&e.push(h-s),s=h,h-t<5e3){this.benchmarkAnimation=requestAnimationFrame(c);return}this.benchmarkAnimation=null,this.cancelBenchmark=null,e.sort((x,m)=>x-m);const d=e.length?e.reduce((x,m)=>x+m,0)/e.length:1/0,f={datasetId:n,p50:e[Math.floor(e.length*.5)]||0,p95:e[Math.floor(e.length*.95)]||0,p99:e[Math.floor(e.length*.99)]||0,fps:Number.isFinite(d)&&d>0?1e3/d:0,drawCalls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,jsHeapMB:(((g=performance.memory)==null?void 0:g.usedJSHeapSize)||0)/1024/1024,duration:h-t};this.infoEl.textContent=`基准: P50=${f.p50.toFixed(1)}ms P95=${f.p95.toFixed(1)}ms FPS=${f.fps.toFixed(0)}`,this.request("/benchmarks",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(f)}).catch(()=>{}),o(f)};this.benchmarkAnimation=requestAnimationFrame(c)})}async runLeakTest(){var o,l;this.infoEl.textContent="内存泄漏测试中... (10次加载/卸载)";const e=((o=performance.memory)==null?void 0:o.usedJSHeapSize)||0,t=this.renderer.info.memory.geometries;for(let c=0;c<10;c++){if(this.disposed)return;this.disposeCurrentMesh(),this.currentDataset&&await this.loadDataset(this.currentDataset.id),await new Promise(h=>setTimeout(h,200))}if(this.disposed)return;this.renderer.renderLists.dispose();const n=[];for(let c=0;c<4;c++){if(await new Promise(h=>setTimeout(h,500)),this.disposed)return;n.push(((l=performance.memory)==null?void 0:l.usedJSHeapSize)||0)}const r=((n.filter(Boolean).length?Math.min(...n.filter(Boolean)):0)-e)/1024/1024,a=this.renderer.info.memory.geometries-t;this.infoEl.textContent=`泄漏测试: retained ${r.toFixed(1)} MiB · GPU geometry ${a>=0?"+":""}${a} (阈值 ≤100 MiB / +1)`}captureScreenshot(e=!0){if(this.disposed)throw new Error("可视化引擎已关闭");this.renderer.render(this.scene,this.camera);const t=this.renderer.domElement.toDataURL("image/png");if(!e)return t;const n=document.createElement("a");n.download=`oilgas-screenshot-${Date.now()}.png`;const s=atob(t.split(",",2)[1]),r=new Uint8Array(s.length);for(let o=0;o<s.length;o++)r[o]=s.charCodeAt(o);const a=URL.createObjectURL(new Blob([r],{type:"image/png"}));return n.href=a,n.click(),window.setTimeout(()=>URL.revokeObjectURL(a),1e3),this.infoEl.textContent="截图已保存",t}startLoop(){const e=t=>{if(!this.disposed){if(this.animationId=requestAnimationFrame(e),this.controls.update(),this.renderer.render(this.scene,this.camera),this.labelRenderer.render(this.scene,this.camera),this.lastFrameTime>0){const n=t-this.lastFrameTime;this.frameTimes.push(n),this.frameTimes.length>60&&this.frameTimes.shift()}this.lastFrameTime=t,++this.fpsInterval>=30&&(this.fpsInterval=0,this.updateHud(),this.updateCompassHud())}};e(0)}updateHud(){var r;const e=this.renderer.info,t=this.frameTimes,n=(a,o)=>{const l=this.hudEl.querySelector(`[data-metric="${a}"]`);l&&(l.textContent=o)};if(t.length>0){const a=t.reduce((o,l)=>o+l,0)/t.length;n("FPS",(1e3/a).toFixed(0)),n("Frame",a.toFixed(1)+"ms")}n("Draw Calls",String(e.render.calls)),n("Triangles",e.render.triangles.toLocaleString());const s=(r=performance.memory)==null?void 0:r.usedJSHeapSize;s&&n("JS Heap",(s/1024/1024).toFixed(0)+" MB"),this.store.setMetrics({fps:t.length>0?1e3/(t.reduce((a,o)=>a+o,0)/t.length):0,frameTime:t.length>0?t.reduce((a,o)=>a+o,0)/t.length:0,drawCalls:e.render.calls,triangles:e.render.triangles,jsHeapMB:s?s/1024/1024:0})}canvasNdc(e){const t=this.renderer.domElement.getBoundingClientRect();this.mouse.x=(e.clientX-t.left)/Math.max(t.width,1)*2-1,this.mouse.y=-((e.clientY-t.top)/Math.max(t.height,1))*2+1}pickables(){var t;const e=[];(t=this.mesh)!=null&&t.visible&&e.push(this.mesh);for(const n of this.overlayMeshes.values())n.visible&&e.push(n);return e}datasetFromHit(e){var n;let t=e;for(;t;){const s=(n=t.userData)==null?void 0:n.datasetId;if(s)return this.datasetById(s)||null;t=t.parent}return this.currentDataset}setOnSelection(e){this.onSelectionCallback=e}focusCell(e){var h,d;if(!this.geometry||!this.cellIds)return!1;const t=Number(e);if(!Number.isInteger(t))return!1;const n=this.cellIds.indexOf(t);if(n<0)return!1;const s=this.geometry.getAttribute("position"),r=this.hexCornerPositions;if(r&&r.length>=(n+1)*24){const f=new L,u=n*24;for(let x=0;x<8;x++)f.x+=r[u+x*3],f.y+=r[u+x*3+1],f.z+=r[u+x*3+2];f.multiplyScalar(.125);const g=Math.max(((h=this.geometry.boundingSphere)==null?void 0:h.radius)||1,1);return this.controls.target.copy(f),this.camera.position.copy(f).addScalar(g*.08),this.controls.update(),this.infoEl.textContent=`已聚焦 Cell ID: ${t}`,!0}const a=this.cellIds.length?Math.floor(s.count/this.cellIds.length):0,o=n*Math.min(8,Math.max(1,a));if(o+7>=s.count)return!1;const l=new L;for(let f=o;f<o+8;f++)l.x+=s.getX(f),l.y+=s.getY(f),l.z+=s.getZ(f);l.multiplyScalar(.125);const c=Math.max(((d=this.geometry.boundingSphere)==null?void 0:d.radius)||1,1);return this.controls.target.copy(l),this.camera.position.copy(l).addScalar(c*.08),this.controls.update(),this.infoEl.textContent=`已聚焦 Cell ID: ${t}`,!0}async focusDatasetObject(e,t){var f,u,g;if(!this.manifest)return!1;const n=t.trim().toLowerCase(),s=e==="well"?new Set(["wellbore","las","dlis"]):new Set(["network","network-tube"]),r=this.manifest.datasets.filter(x=>{var p;if(!s.has(x.source||""))return!1;if(!n)return!0;const m=typeof((p=x.metadata)==null?void 0:p.well_name)=="string"?x.metadata.well_name:"";return[x.id,x.name,m].some(v=>v.toLowerCase()===n)});if(r.length>1)return!1;const a=r[0];if(!a)return!1;if(e==="well"&&Ct(a))return this.viewRouter.switchTo("welllog"),a.id!==((f=this.currentDataset)==null?void 0:f.id)&&await this.loadDataset(a.id),this.infoEl.textContent=`已打开测井: ${ln(a)}`,!0;if(e==="well"&&tt(a)&&this.currentDataset&&Nt(this.currentDataset)){await this.toggleDatasetVisibility(a,!0,{quiet:!0});const x=this.overlayMeshes.get(a.id);return x?(this.frameObject(x),this.infoEl.textContent=`已聚焦井: ${ln(a)}`,this.publishSelection({type:"well",id:a.id}),!0):!1}if(a.id!==((u=this.currentDataset)==null?void 0:u.id)&&await this.loadDataset(a.id),e==="well"&&this.mesh&&tt(this.currentDataset||a))return this.frameObject(this.mesh),this.infoEl.textContent=`已聚焦井: ${t}`,!0;if(!this.currentDataset||!s.has(this.currentDataset.source||"")||!this.geometry||!this.cellIds||!this.baseIndices)return!1;const o=this.geometry.getAttribute("position"),l=new Set,c=Number(t);if(!Number.isFinite(c)&&a)for(let x=0;x<o.count;x++)l.add(x);else{const x=this.baseIndices.length/this.cellIds.length;if(!Number.isInteger(x)||!Number.isFinite(c))return!1;for(let m=0;m<this.cellIds.length;m++){if(this.cellIds[m]!==c)continue;const p=m*x;for(let v=p;v<p+x;v++){const _=this.baseIndices[v];_<o.count&&l.add(_)}}}if(l.size===0)return!1;const h=new L;for(const x of l)h.x+=o.getX(x),h.y+=o.getY(x),h.z+=o.getZ(x);h.multiplyScalar(1/l.size);const d=Math.max(((g=this.geometry.boundingSphere)==null?void 0:g.radius)||1,1);return this.controls.target.copy(h),this.camera.position.copy(h).addScalar(d*.08),this.controls.update(),this.infoEl.textContent=`已聚焦 ${e==="well"?"井":"管段"}: ${t}`,!0}async refreshSimulationDataset(e,t){var w,P,C,T,H,y,E,N,G,J,R,U,B;const n=this.lifetimeController,s=(this.simulationRefreshGeneration||0)+1;this.simulationRefreshGeneration=s;const r=(w=this.currentDataset)==null?void 0:w.id,a=()=>!this.disposed&&n===this.lifetimeController&&!n.signal.aborted&&s===this.simulationRefreshGeneration,o=await this.fetchJson("/manifest");if(!a()||((P=this.currentDataset)==null?void 0:P.id)!==r)return;const l=o.datasets.find($=>$.id===e);if(!l)throw new Error(`数据集不存在: ${e}`);this.manifest=o,this.syncDatasetSelect(),this.updateObjectTree();const c=this.currentDataset;if(c&&c.id!==e)return;const h=(C=c==null?void 0:c.time_steps)==null?void 0:C.find($=>$.index+1===this.currentTimeStep),d=t?(((y=(H=l.time_steps)==null?void 0:H[(((T=l.time_steps)==null?void 0:T.length)||0)-1])==null?void 0:y.index)??-1)+1:h?(((N=(E=l.time_steps)==null?void 0:E.find($=>$.step_number===h.step_number))==null?void 0:N.index)??-1)+1:0;if(((G=c==null?void 0:c.metadata)==null?void 0:G.revision)!=null&&c.metadata.revision===((J=l.metadata)==null?void 0:J.revision)){d!==this.currentTimeStep&&await this.executeCommand("set-timestep",{timeStep:d});return}const u={position:this.camera.position.clone(),up:this.camera.up.clone(),target:this.controls.target.clone(),zoom:this.camera.zoom},g=this.currentProperty,x=this.currentColormap,m=c?this.filterStateSnapshot():null,p=this.store.getState().selected;if(await this.loadDataset(e),!a()||((R=this.currentDataset)==null?void 0:R.id)!==e)return;this.currentColormap=x,new Set([...Object.keys(l.files.scalars||{}),...(l.time_steps||[]).flatMap($=>Object.keys($.scalars||{}))]).has(g)&&(this.currentProperty=g);const _=this.sidebar.querySelector('[id="vis-property"]');if(_&&(_.value=this.currentProperty),await this.executeCommand("set-timestep",{timeStep:d}),!(!a()||((U=this.currentDataset)==null?void 0:U.id)!==e))return m&&(this.restoreFilterSnapshot(m),this.lastFilterState=m,this.applyFilters()),c&&(this.camera.position.copy(u.position),this.camera.up.copy(u.up),this.camera.zoom=u.zoom,this.camera.updateProjectionMatrix(),this.controls.target.copy(u.target),this.controls.update(),this.store.setSelection(p)),{datasetId:e,revision:(B=l.metadata)==null?void 0:B.revision,timeStep:d}}async executeCommand(e,t){var s,r,a,o,l,c,h,d;const n=this.lifetimeController;if(await this.ready,n!==this.lifetimeController)throw new DOMException("可视化作用域已变化","AbortError");if(this.disposed)throw new Error("可视化引擎已关闭");switch(e){case"refresh-dataset":return this.refreshSimulationDataset(String(t.datasetId||((s=this.currentDataset)==null?void 0:s.id)||""),t.followLatest===!0);case"open":if(t.datasetId){if(!((r=this.manifest)!=null&&r.datasets.some(u=>u.id===t.datasetId)))throw new Error(`数据集不存在: ${t.datasetId}`);await this.loadDataset(t.datasetId)}break;case"set-property":if(t.datasetId&&t.datasetId!==((a=this.currentDataset)==null?void 0:a.id)&&await this.loadDataset(t.datasetId),t.property){const u=this.sidebar.querySelector('[id="vis-property"]');if(!(u?Array.from(u.options).some(x=>x.value===t.property):!1))throw this.infoEl.textContent=`属性不存在: ${t.property}`,new Error(`属性不存在: ${t.property}`);this.currentProperty=t.property,u.value=t.property,await this.reloadPropertyColors()}break;case"set-timestep":if(t.timeStep!==void 0){const u=this.sidebar.querySelector('[id="vis-timestep"]'),g=String(t.timeStep);if(!u||!Array.from(u.options).some(x=>x.value===g))throw this.infoEl.textContent=`时间步不存在: ${t.timeStep}`,new Error(`时间步不存在: ${t.timeStep}`);this.currentTimeStep=Number(t.timeStep),this.store.setTimeStep(this.currentTimeStep),u.value=g,await this.reloadPropertyColors()}break;case"set-colormap":{const u=this.sidebar.querySelector('[id="vis-colormap"]'),g=String(t.colormap||"");if(!u||!Array.from(u.options).some(x=>x.value===g))throw this.infoEl.textContent=`色图不存在: ${g}`,new Error(`色图不存在: ${g}`);this.currentColormap=g,u.value=g,await this.reloadPropertyColors();break}case"set-opacity":{const u=Number(t.opacity);if(!Number.isFinite(u))break;this.applyOpacity(Math.max(.1,Math.min(1,u>1?u/100:u)));break}case"set-wireframe":{this.wireframe=!!t.enabled,this.applyWireframeMode();break}case"set-view":if(Vi.VIEWS.includes(String(t.view||"reservoir")))this.viewRouter.switchTo(String(t.view||"reservoir"));else throw new Error(`视图不存在: ${String(t.view||"")}`);break;case"set-filter":{t.datasetId&&t.datasetId!==((o=this.currentDataset)==null?void 0:o.id)&&await this.loadDataset(t.datasetId);const u=this.sidebar.querySelector('[id="vis-property"]');t.property&&u&&Array.from(u.options).some(x=>x.value===t.property)&&(this.currentProperty=t.property,u.value=t.property,await this.reloadPropertyColors());const g={"#vis-filter-i":t.i,"#vis-filter-j":t.j,"#vis-filter-k":t.k,"#vis-filter-prop-min":t.propertyMin==null?"":String(t.propertyMin),"#vis-filter-prop-max":t.propertyMax==null?"":String(t.propertyMax)};for(const[x,m]of Object.entries(g)){const p=this.sidebar.querySelector(x);p&&m!==void 0&&(p.value=m)}this.filterBounds=Array.isArray(t.bounds)&&t.bounds.length===6?t.bounds:null,this.applyFilters();break}case"show-report":this.showDetails([t.title||"油气可视化分析报告",`数据集: ${t.dataset||t.dataset_id||"—"}`,`属性: ${t.property||"—"}`,...Object.entries(t.stats||{}).map(([u,g])=>`${u}: ${g==null?"—":Number(g).toPrecision(6)}`)].join(`
`));break;case"focus":let f=!1;if(t.objectType==="cell"?f=this.focusCell(String(t.objectId)):(t.objectType==="well"||t.objectType==="segment")&&(f=await this.focusDatasetObject(t.objectType,String(t.objectId))),!f)throw this.infoEl.textContent=`无法聚焦 ${t.objectType||"object"}: ${t.objectId||""}`,new Error(`无法聚焦 ${t.objectType||"object"}: ${t.objectId||""}`);break;case"create-intersection":{const u=t.datasetId||((l=this.currentDataset)==null?void 0:l.id);if(!u)break;const g=await this.request(`${this.apiBase}/datasets/${encodeURIComponent(u)}/intersections`,{method:"POST",headers:{...this.authHeaders(),"Content-Type":"application/json"},body:JSON.stringify({polyline_x:t.polyline_x,polyline_y:t.polyline_y,z_min:t.z_min,z_max:t.z_max,name:t.name,property:t.property||this.currentProperty,time_step:t.timeStep??this.currentTimeStep})});if(!g.ok)throw this.infoEl.textContent=`剖面生成失败: HTTP ${g.status}`,new Error(`剖面生成失败: HTTP ${g.status}`);const x=await g.json();this.manifest=await this.fetchJson("/manifest"),this.updateObjectTree(),this.infoEl.textContent=`剖面已生成: ${x.name||t.name||"section"}`,x.id&&await this.loadDataset(x.id),this.viewRouter.switchTo("intersection");break}case"create-well-section":{const u=t.datasetId||((c=this.currentDataset)==null?void 0:c.id);if(!u)break;const g=await this.request(`${this.apiBase}/datasets/${encodeURIComponent(u)}/well-sections`,{method:"POST",headers:{...this.authHeaders(),"Content-Type":"application/json"},body:JSON.stringify({well_dataset_id:t.wellDatasetId,offset:t.offset??50,name:t.name,property:t.property||this.currentProperty,time_step:t.timeStep??this.currentTimeStep})});if(!g.ok)throw new Error(`井剖面生成失败: HTTP ${g.status}`);const x=await g.json();this.manifest=await this.fetchJson("/manifest"),this.updateObjectTree(),x.id&&await this.loadDataset(x.id),this.viewRouter.switchTo("intersection");break}case"create-slice":{const u=t.datasetId||((h=this.currentDataset)==null?void 0:h.id);if(!u)break;const g=await this.request(`${this.apiBase}/datasets/${encodeURIComponent(u)}/slices`,{method:"POST",headers:{...this.authHeaders(),"Content-Type":"application/json"},body:JSON.stringify({axis:t.axis||"k",index:t.index,name:t.name,property:t.property||this.currentProperty,time_step:t.timeStep??this.currentTimeStep})});if(!g.ok)throw new Error(`切片生成失败: HTTP ${g.status}`);const x=await g.json();this.manifest=await this.fetchJson("/manifest"),this.updateObjectTree(),x.id&&await this.loadDataset(x.id),this.viewRouter.switchTo("intersection");break}case"capture":return this.captureScreenshot();case"benchmark":return this.runBenchmark();default:throw new Error(`未知命令: ${e}`)}return{ok:!0,command:e,datasetId:((d=this.currentDataset)==null?void 0:d.id)||null}}applyResponsiveChrome(){const e=this.container.clientWidth;if(e<=0)return;const t=this.options.compact||e<760?"small":e<1100?"medium":"large";if(t===this.responsiveTier)return;this.responsiveTier=t;const n=Rm(this.options.compact?600:e),s=this.objectTree.querySelector("button"),r=this.sidebar.querySelector("button");s&&this.objectTreeCollapsed!==n.treeCollapsed&&this.toggleObjectTree(s),r&&this.sidebarCollapsed!==n.inspectorCollapsed&&this.toggleSidebar(r)}applyWireframeMode(){if(this.hexEdgeLines){this.hexEdgeLines.visible=this.wireframe,this.visitMaterials(e=>{e instanceof Ei&&(e.wireframe=!1,e.needsUpdate=!0)});return}this.visitMaterials(e=>{e instanceof Ei&&(e.wireframe=this.wireframe,e.needsUpdate=!0)})}attachHexEdges(e){this.disposeHexEdges();const t=this.hexCornerPositions;if(!t||t.length!==e*24){this.isHexMesh=!1;return}this.isHexMesh=!0;const n=new yt;n.setAttribute("position",new Je(t,3));const s=this.visibleCellOffsets.length?this.visibleCellOffsets:Array.from({length:e},(r,a)=>a);n.setIndex(new Je(Zr(s),1)),this.hexEdgeLines=new Hn(n,new zn({color:13686750,transparent:!0,opacity:.85})),this.hexEdgeLines.name="oilgas-hex-edges",this.hexEdgeLines.visible=this.wireframe,this.mesh?this.mesh.add(this.hexEdgeLines):this.modelRoot.add(this.hexEdgeLines)}updateHexEdges(){this.hexEdgeLines&&this.hexEdgeLines.geometry.setIndex(new Je(Zr(this.visibleCellOffsets),1))}disposeHexEdges(){var t;if(!this.hexEdgeLines)return;(t=this.hexEdgeLines.parent)==null||t.remove(this.hexEdgeLines),this.hexEdgeLines.geometry.dispose();const e=this.hexEdgeLines.material;Array.isArray(e)?e.forEach(n=>n.dispose()):e.dispose(),this.hexEdgeLines=null}disposeSceneResources(){this.scene.traverse(e=>{var n,s;const t=e;(n=t.geometry)==null||n.dispose(),Array.isArray(t.material)?t.material.forEach(r=>r.dispose()):(s=t.material)==null||s.dispose()})}disposeCurrentMesh(){this.disposeHexEdges();const e=this.mesh,t=this.geometry;e&&this.disposeObject3D(e);const n=e instanceof wt||e instanceof Ur||e instanceof Hn?e.geometry:null;t&&t!==n&&t.dispose(),this.mesh=null,this.geometry=null,this.cellIds=null,this.baseIndices=null,this.currentScalarValues=null,this.cellCenters=null,this.visibleCellOffsets=[],this.isHexMesh=!1,this.hexCornerPositions=null,this.renderer.renderLists.dispose()}dispose(){var e,t,n,s,r,a;if(!this.disposed){for(this.disposed=!0,this.catalogGeneration++,this.loadGeneration++,this.lifetimeController.abort(),(e=this.resizeObserver)==null||e.disconnect(),(t=this.cancelBenchmark)==null||t.call(this),this.commandBridge.dispose(),this.timestepTimer!==null&&(window.clearInterval(this.timestepTimer),this.timestepTimer=null),this.sliceTimer!==null&&(window.clearInterval(this.sliceTimer),this.sliceTimer=null),this.animationId!==null&&cancelAnimationFrame(this.animationId),this.abortController&&this.abortController.abort(),this.renderer.domElement.removeEventListener("click",this.onCanvasClick),this.renderer.domElement.removeEventListener("pointermove",this.onCanvasPointerMove),this.renderer.domElement.removeEventListener("pointerleave",this.onCanvasPointerLeave),this.renderer.domElement.removeEventListener("dblclick",this.onCanvasDblClick),this.renderer.domElement.removeEventListener("contextmenu",this.onCanvasContextMenu),(n=this.wellMapCanvas)==null||n.removeEventListener("click",this.onWellMapClick),this.container.removeEventListener("keydown",this.onViewerKeyDown),(s=this.dropUnbind)==null||s.call(this),this.dropUnbind=null,Us(this.container),(r=this.closeWorkspacePicker)==null||r.call(this),this.closeWorkspacePicker=null,(a=this.storeUnsubscribe)==null||a.call(this),window.removeEventListener("resize",this.onResize),this.workerManager.dispose(),this.disposeCurrentMesh(),this.clearOverlays(),this.disposeSceneResources(),this.controls.dispose(),this.renderer.dispose();this.container.firstChild;)this.container.removeChild(this.container.firstChild);console.info("[oilgas-vis] Viewer disposed")}}update(e){var s,r,a;if(this.disposed)return;const t=Gn(this.options,"scene"),n=e.apiBase!==void 0&&e.apiBase!==this.apiBase||Object.prototype.hasOwnProperty.call(e,"authToken")&&e.authToken!==this.authToken||e.headers!==void 0&&JSON.stringify(e.headers)!==JSON.stringify(this.options.headers)||e.request!==void 0&&e.request!==this.options.request;this.options={...this.options,...e},(n||t!==Gn(this.options,"scene"))&&(this.restoringScene=!1),this.authToken=this.options.authToken,this.apiBase=this.options.apiBase,this.api.update(e),n&&this.commandBridge.update(e),this.options.enableCommands?this.commandBridge.start():this.commandBridge.dispose(),this.applyResponsiveChrome(),n?((s=this.cancelBenchmark)==null||s.call(this),Us(this.container),(r=this.closeWorkspacePicker)==null||r.call(this),this.closeWorkspacePicker=null,this.lifetimeController.abort(),this.lifetimeController=new AbortController,this.clearSceneForEmptyCatalog(),this.manifest=null,this.store.reset(),this.ready=this.init(),this.ready.catch(o=>this.reportError(o))):e.initialDatasetId&&e.initialDatasetId!==((a=this.currentDataset)==null?void 0:a.id)&&this.executeCommand("open",{datasetId:e.initialDatasetId}).catch(o=>this.reportError(o))}}const Jl=new Map;function Zl(i,e){if(!i.trim())throw new Error("Rendering engine id must not be empty");Jl.set(i,e)}function Tg(i,e){return Ql(i.id,e)}function Ql(i,e){const t=Jl.get(i);if(!t)throw new Error(`尚未注册可视化引擎：${i}`);return t(e)}const ec={id:"three-reservoir",name:"Three.js Reservoir Engine",create(i){return Tg(ec,i)}};function Ag(i,e){const t=e.engineId?Ql(e.engineId,{container:i,...e}):ec.create({container:i,...e});let n=!1;return{get ready(){return t.ready},executeCommand:(s,r)=>n?Promise.reject(new Error("查看器已关闭")):t.executeCommand?t.executeCommand(s,r):Promise.reject(new Error("查看器暂不支持命令执行")),dispose(){n||(n=!0,t.dispose())},update(s){var r;n||(r=t.update)==null||r.call(t,s)}}}Zl("three-reservoir",i=>{const e=new wg(i.container,i),t=(n,s)=>e.executeCommand(n,s);return{get ready(){return e.ready},loadDataset:async n=>{await t("open",{datasetId:n})},setProperty:n=>{t("set-property",{property:n})},setColorMap:n=>{t("set-colormap",{colormap:n})},setOpacity:n=>{t("set-opacity",{opacity:n})},setWireframe:n=>{t("set-wireframe",{enabled:n})},setView:n=>{t("set-view",{view:n})},focusObject:(n,s)=>{t("focus",{objectType:n,objectId:s})},captureScreenshot:()=>e.captureScreenshot(!1),runBenchmark:async()=>t("benchmark",{}),executeCommand:t,update:n=>e.update(n),dispose:()=>e.dispose()}});const tc={version:"0.4.0",registerEngine:Zl,mount(i,e){return Ag(i,e)}};return window.OilGasViewerRuntime=tc,tc}();
