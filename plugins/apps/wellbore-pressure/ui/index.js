(()=>{var Je=Object.create;var xe=Object.defineProperty;var qe=Object.getOwnPropertyDescriptor;var Qe=Object.getOwnPropertyNames;var Re=Object.getPrototypeOf,tr=Object.prototype.hasOwnProperty;var Ht=(t=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(t,{get:(h,l)=>(typeof require<"u"?require:h)[l]}):t)(function(t){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+t+'" is not supported')});var er=(t,h)=>()=>(h||t((h={exports:{}}).exports,h),h.exports);var rr=(t,h,l,i)=>{if(h&&typeof h=="object"||typeof h=="function")for(let n of Qe(h))!tr.call(t,n)&&n!==l&&xe(t,n,{get:()=>h[n],enumerable:!(i=qe(h,n))||i.enumerable});return t};var ye=(t,h,l)=>(l=t!=null?Je(Re(t)):{},rr(h||!t||!t.__esModule?xe(l,"default",{value:t,enumerable:!0}):l,t));var ue=er((ke,de)=>{(function(t){typeof ke=="object"&&typeof de<"u"?de.exports=t():typeof define=="function"&&define.amd?define([],t):(typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:this).JSZip=t()})(function(){return(function t(h,l,i){function n(w,x){if(!l[w]){if(!h[w]){var c=typeof Ht=="function"&&Ht;if(!x&&c)return c(w,!0);if(r)return r(w,!0);var m=new Error("Cannot find module '"+w+"'");throw m.code="MODULE_NOT_FOUND",m}var p=l[w]={exports:{}};h[w][0].call(p.exports,function(f){var s=h[w][1][f];return n(s||f)},p,p.exports,t,h,l,i)}return l[w].exports}for(var r=typeof Ht=="function"&&Ht,o=0;o<i.length;o++)n(i[o]);return n})({1:[function(t,h,l){"use strict";var i=t("./utils"),n=t("./support"),r="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";l.encode=function(o){for(var w,x,c,m,p,f,s,d=[],u=0,g=o.length,y=g,z=i.getTypeOf(o)!=="string";u<o.length;)y=g-u,c=z?(w=o[u++],x=u<g?o[u++]:0,u<g?o[u++]:0):(w=o.charCodeAt(u++),x=u<g?o.charCodeAt(u++):0,u<g?o.charCodeAt(u++):0),m=w>>2,p=(3&w)<<4|x>>4,f=1<y?(15&x)<<2|c>>6:64,s=2<y?63&c:64,d.push(r.charAt(m)+r.charAt(p)+r.charAt(f)+r.charAt(s));return d.join("")},l.decode=function(o){var w,x,c,m,p,f,s=0,d=0,u="data:";if(o.substr(0,u.length)===u)throw new Error("Invalid base64 input, it looks like a data url.");var g,y=3*(o=o.replace(/[^A-Za-z0-9+/=]/g,"")).length/4;if(o.charAt(o.length-1)===r.charAt(64)&&y--,o.charAt(o.length-2)===r.charAt(64)&&y--,y%1!=0)throw new Error("Invalid base64 input, bad content length.");for(g=n.uint8array?new Uint8Array(0|y):new Array(0|y);s<o.length;)w=r.indexOf(o.charAt(s++))<<2|(m=r.indexOf(o.charAt(s++)))>>4,x=(15&m)<<4|(p=r.indexOf(o.charAt(s++)))>>2,c=(3&p)<<6|(f=r.indexOf(o.charAt(s++))),g[d++]=w,p!==64&&(g[d++]=x),f!==64&&(g[d++]=c);return g}},{"./support":30,"./utils":32}],2:[function(t,h,l){"use strict";var i=t("./external"),n=t("./stream/DataWorker"),r=t("./stream/Crc32Probe"),o=t("./stream/DataLengthProbe");function w(x,c,m,p,f){this.compressedSize=x,this.uncompressedSize=c,this.crc32=m,this.compression=p,this.compressedContent=f}w.prototype={getContentWorker:function(){var x=new n(i.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new o("data_length")),c=this;return x.on("end",function(){if(this.streamInfo.data_length!==c.uncompressedSize)throw new Error("Bug : uncompressed data size mismatch")}),x},getCompressedWorker:function(){return new n(i.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize",this.compressedSize).withStreamInfo("uncompressedSize",this.uncompressedSize).withStreamInfo("crc32",this.crc32).withStreamInfo("compression",this.compression)}},w.createWorkerFrom=function(x,c,m){return x.pipe(new r).pipe(new o("uncompressedSize")).pipe(c.compressWorker(m)).pipe(new o("compressedSize")).withStreamInfo("compression",c)},h.exports=w},{"./external":6,"./stream/Crc32Probe":25,"./stream/DataLengthProbe":26,"./stream/DataWorker":27}],3:[function(t,h,l){"use strict";var i=t("./stream/GenericWorker");l.STORE={magic:"\0\0",compressWorker:function(){return new i("STORE compression")},uncompressWorker:function(){return new i("STORE decompression")}},l.DEFLATE=t("./flate")},{"./flate":7,"./stream/GenericWorker":28}],4:[function(t,h,l){"use strict";var i=t("./utils"),n=(function(){for(var r,o=[],w=0;w<256;w++){r=w;for(var x=0;x<8;x++)r=1&r?3988292384^r>>>1:r>>>1;o[w]=r}return o})();h.exports=function(r,o){return r!==void 0&&r.length?i.getTypeOf(r)!=="string"?(function(w,x,c,m){var p=n,f=m+c;w^=-1;for(var s=m;s<f;s++)w=w>>>8^p[255&(w^x[s])];return-1^w})(0|o,r,r.length,0):(function(w,x,c,m){var p=n,f=m+c;w^=-1;for(var s=m;s<f;s++)w=w>>>8^p[255&(w^x.charCodeAt(s))];return-1^w})(0|o,r,r.length,0):0}},{"./utils":32}],5:[function(t,h,l){"use strict";l.base64=!1,l.binary=!1,l.dir=!1,l.createFolders=!0,l.date=null,l.compression=null,l.compressionOptions=null,l.comment=null,l.unixPermissions=null,l.dosPermissions=null},{}],6:[function(t,h,l){"use strict";var i=null;i=typeof Promise<"u"?Promise:t("lie"),h.exports={Promise:i}},{lie:37}],7:[function(t,h,l){"use strict";var i=typeof Uint8Array<"u"&&typeof Uint16Array<"u"&&typeof Uint32Array<"u",n=t("pako"),r=t("./utils"),o=t("./stream/GenericWorker"),w=i?"uint8array":"array";function x(c,m){o.call(this,"FlateWorker/"+c),this._pako=null,this._pakoAction=c,this._pakoOptions=m,this.meta={}}l.magic="\b\0",r.inherits(x,o),x.prototype.processChunk=function(c){this.meta=c.meta,this._pako===null&&this._createPako(),this._pako.push(r.transformTo(w,c.data),!1)},x.prototype.flush=function(){o.prototype.flush.call(this),this._pako===null&&this._createPako(),this._pako.push([],!0)},x.prototype.cleanUp=function(){o.prototype.cleanUp.call(this),this._pako=null},x.prototype._createPako=function(){this._pako=new n[this._pakoAction]({raw:!0,level:this._pakoOptions.level||-1});var c=this;this._pako.onData=function(m){c.push({data:m,meta:c.meta})}},l.compressWorker=function(c){return new x("Deflate",c)},l.uncompressWorker=function(){return new x("Inflate",{})}},{"./stream/GenericWorker":28,"./utils":32,pako:38}],8:[function(t,h,l){"use strict";function i(p,f){var s,d="";for(s=0;s<f;s++)d+=String.fromCharCode(255&p),p>>>=8;return d}function n(p,f,s,d,u,g){var y,z,S=p.file,B=p.compression,N=g!==w.utf8encode,P=r.transformTo("string",g(S.name)),O=r.transformTo("string",w.utf8encode(S.name)),$=S.comment,Q=r.transformTo("string",g($)),k=r.transformTo("string",w.utf8encode($)),F=O.length!==S.name.length,a=k.length!==$.length,C="",R="",L="",et=S.dir,V=S.date,tt={crc32:0,compressedSize:0,uncompressedSize:0};f&&!s||(tt.crc32=p.crc32,tt.compressedSize=p.compressedSize,tt.uncompressedSize=p.uncompressedSize);var M=0;f&&(M|=8),N||!F&&!a||(M|=2048);var A=0,rt=0;et&&(A|=16),u==="UNIX"?(rt=798,A|=(function(K,ht){var mt=K;return K||(mt=ht?16893:33204),(65535&mt)<<16})(S.unixPermissions,et)):(rt=20,A|=(function(K){return 63&(K||0)})(S.dosPermissions)),y=V.getUTCHours(),y<<=6,y|=V.getUTCMinutes(),y<<=5,y|=V.getUTCSeconds()/2,z=V.getUTCFullYear()-1980,z<<=4,z|=V.getUTCMonth()+1,z<<=5,z|=V.getUTCDate(),F&&(R=i(1,1)+i(x(P),4)+O,C+="up"+i(R.length,2)+R),a&&(L=i(1,1)+i(x(Q),4)+k,C+="uc"+i(L.length,2)+L);var J="";return J+=`
\0`,J+=i(M,2),J+=B.magic,J+=i(y,2),J+=i(z,2),J+=i(tt.crc32,4),J+=i(tt.compressedSize,4),J+=i(tt.uncompressedSize,4),J+=i(P.length,2),J+=i(C.length,2),{fileRecord:c.LOCAL_FILE_HEADER+J+P+C,dirRecord:c.CENTRAL_FILE_HEADER+i(rt,2)+J+i(Q.length,2)+"\0\0\0\0"+i(A,4)+i(d,4)+P+C+Q}}var r=t("../utils"),o=t("../stream/GenericWorker"),w=t("../utf8"),x=t("../crc32"),c=t("../signature");function m(p,f,s,d){o.call(this,"ZipFileWorker"),this.bytesWritten=0,this.zipComment=f,this.zipPlatform=s,this.encodeFileName=d,this.streamFiles=p,this.accumulate=!1,this.contentBuffer=[],this.dirRecords=[],this.currentSourceOffset=0,this.entriesCount=0,this.currentFile=null,this._sources=[]}r.inherits(m,o),m.prototype.push=function(p){var f=p.meta.percent||0,s=this.entriesCount,d=this._sources.length;this.accumulate?this.contentBuffer.push(p):(this.bytesWritten+=p.data.length,o.prototype.push.call(this,{data:p.data,meta:{currentFile:this.currentFile,percent:s?(f+100*(s-d-1))/s:100}}))},m.prototype.openedSource=function(p){this.currentSourceOffset=this.bytesWritten,this.currentFile=p.file.name;var f=this.streamFiles&&!p.file.dir;if(f){var s=n(p,f,!1,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);this.push({data:s.fileRecord,meta:{percent:0}})}else this.accumulate=!0},m.prototype.closedSource=function(p){this.accumulate=!1;var f=this.streamFiles&&!p.file.dir,s=n(p,f,!0,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);if(this.dirRecords.push(s.dirRecord),f)this.push({data:(function(d){return c.DATA_DESCRIPTOR+i(d.crc32,4)+i(d.compressedSize,4)+i(d.uncompressedSize,4)})(p),meta:{percent:100}});else for(this.push({data:s.fileRecord,meta:{percent:0}});this.contentBuffer.length;)this.push(this.contentBuffer.shift());this.currentFile=null},m.prototype.flush=function(){for(var p=this.bytesWritten,f=0;f<this.dirRecords.length;f++)this.push({data:this.dirRecords[f],meta:{percent:100}});var s=this.bytesWritten-p,d=(function(u,g,y,z,S){var B=r.transformTo("string",S(z));return c.CENTRAL_DIRECTORY_END+"\0\0\0\0"+i(u,2)+i(u,2)+i(g,4)+i(y,4)+i(B.length,2)+B})(this.dirRecords.length,s,p,this.zipComment,this.encodeFileName);this.push({data:d,meta:{percent:100}})},m.prototype.prepareNextSource=function(){this.previous=this._sources.shift(),this.openedSource(this.previous.streamInfo),this.isPaused?this.previous.pause():this.previous.resume()},m.prototype.registerPrevious=function(p){this._sources.push(p);var f=this;return p.on("data",function(s){f.processChunk(s)}),p.on("end",function(){f.closedSource(f.previous.streamInfo),f._sources.length?f.prepareNextSource():f.end()}),p.on("error",function(s){f.error(s)}),this},m.prototype.resume=function(){return!!o.prototype.resume.call(this)&&(!this.previous&&this._sources.length?(this.prepareNextSource(),!0):this.previous||this._sources.length||this.generatedError?void 0:(this.end(),!0))},m.prototype.error=function(p){var f=this._sources;if(!o.prototype.error.call(this,p))return!1;for(var s=0;s<f.length;s++)try{f[s].error(p)}catch{}return!0},m.prototype.lock=function(){o.prototype.lock.call(this);for(var p=this._sources,f=0;f<p.length;f++)p[f].lock()},h.exports=m},{"../crc32":4,"../signature":23,"../stream/GenericWorker":28,"../utf8":31,"../utils":32}],9:[function(t,h,l){"use strict";var i=t("../compressions"),n=t("./ZipFileWorker");l.generateWorker=function(r,o,w){var x=new n(o.streamFiles,w,o.platform,o.encodeFileName),c=0;try{r.forEach(function(m,p){c++;var f=(function(g,y){var z=g||y,S=i[z];if(!S)throw new Error(z+" is not a valid compression method !");return S})(p.options.compression,o.compression),s=p.options.compressionOptions||o.compressionOptions||{},d=p.dir,u=p.date;p._compressWorker(f,s).withStreamInfo("file",{name:m,dir:d,date:u,comment:p.comment||"",unixPermissions:p.unixPermissions,dosPermissions:p.dosPermissions}).pipe(x)}),x.entriesCount=c}catch(m){x.error(m)}return x}},{"../compressions":3,"./ZipFileWorker":8}],10:[function(t,h,l){"use strict";function i(){if(!(this instanceof i))return new i;if(arguments.length)throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");this.files=Object.create(null),this.comment=null,this.root="",this.clone=function(){var n=new i;for(var r in this)typeof this[r]!="function"&&(n[r]=this[r]);return n}}(i.prototype=t("./object")).loadAsync=t("./load"),i.support=t("./support"),i.defaults=t("./defaults"),i.version="3.10.1",i.loadAsync=function(n,r){return new i().loadAsync(n,r)},i.external=t("./external"),h.exports=i},{"./defaults":5,"./external":6,"./load":11,"./object":15,"./support":30}],11:[function(t,h,l){"use strict";var i=t("./utils"),n=t("./external"),r=t("./utf8"),o=t("./zipEntries"),w=t("./stream/Crc32Probe"),x=t("./nodejsUtils");function c(m){return new n.Promise(function(p,f){var s=m.decompressed.getContentWorker().pipe(new w);s.on("error",function(d){f(d)}).on("end",function(){s.streamInfo.crc32!==m.decompressed.crc32?f(new Error("Corrupted zip : CRC32 mismatch")):p()}).resume()})}h.exports=function(m,p){var f=this;return p=i.extend(p||{},{base64:!1,checkCRC32:!1,optimizedBinaryString:!1,createFolders:!1,decodeFileName:r.utf8decode}),x.isNode&&x.isStream(m)?n.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")):i.prepareContent("the loaded zip file",m,!0,p.optimizedBinaryString,p.base64).then(function(s){var d=new o(p);return d.load(s),d}).then(function(s){var d=[n.Promise.resolve(s)],u=s.files;if(p.checkCRC32)for(var g=0;g<u.length;g++)d.push(c(u[g]));return n.Promise.all(d)}).then(function(s){for(var d=s.shift(),u=d.files,g=0;g<u.length;g++){var y=u[g],z=y.fileNameStr,S=i.resolve(y.fileNameStr);f.file(S,y.decompressed,{binary:!0,optimizedBinaryString:!0,date:y.date,dir:y.dir,comment:y.fileCommentStr.length?y.fileCommentStr:null,unixPermissions:y.unixPermissions,dosPermissions:y.dosPermissions,createFolders:p.createFolders}),y.dir||(f.file(S).unsafeOriginalName=z)}return d.zipComment.length&&(f.comment=d.zipComment),f})}},{"./external":6,"./nodejsUtils":14,"./stream/Crc32Probe":25,"./utf8":31,"./utils":32,"./zipEntries":33}],12:[function(t,h,l){"use strict";var i=t("../utils"),n=t("../stream/GenericWorker");function r(o,w){n.call(this,"Nodejs stream input adapter for "+o),this._upstreamEnded=!1,this._bindStream(w)}i.inherits(r,n),r.prototype._bindStream=function(o){var w=this;(this._stream=o).pause(),o.on("data",function(x){w.push({data:x,meta:{percent:0}})}).on("error",function(x){w.isPaused?this.generatedError=x:w.error(x)}).on("end",function(){w.isPaused?w._upstreamEnded=!0:w.end()})},r.prototype.pause=function(){return!!n.prototype.pause.call(this)&&(this._stream.pause(),!0)},r.prototype.resume=function(){return!!n.prototype.resume.call(this)&&(this._upstreamEnded?this.end():this._stream.resume(),!0)},h.exports=r},{"../stream/GenericWorker":28,"../utils":32}],13:[function(t,h,l){"use strict";var i=t("readable-stream").Readable;function n(r,o,w){i.call(this,o),this._helper=r;var x=this;r.on("data",function(c,m){x.push(c)||x._helper.pause(),w&&w(m)}).on("error",function(c){x.emit("error",c)}).on("end",function(){x.push(null)})}t("../utils").inherits(n,i),n.prototype._read=function(){this._helper.resume()},h.exports=n},{"../utils":32,"readable-stream":16}],14:[function(t,h,l){"use strict";h.exports={isNode:typeof Buffer<"u",newBufferFrom:function(i,n){if(Buffer.from&&Buffer.from!==Uint8Array.from)return Buffer.from(i,n);if(typeof i=="number")throw new Error('The "data" argument must not be a number');return new Buffer(i,n)},allocBuffer:function(i){if(Buffer.alloc)return Buffer.alloc(i);var n=new Buffer(i);return n.fill(0),n},isBuffer:function(i){return Buffer.isBuffer(i)},isStream:function(i){return i&&typeof i.on=="function"&&typeof i.pause=="function"&&typeof i.resume=="function"}}},{}],15:[function(t,h,l){"use strict";function i(S,B,N){var P,O=r.getTypeOf(B),$=r.extend(N||{},x);$.date=$.date||new Date,$.compression!==null&&($.compression=$.compression.toUpperCase()),typeof $.unixPermissions=="string"&&($.unixPermissions=parseInt($.unixPermissions,8)),$.unixPermissions&&16384&$.unixPermissions&&($.dir=!0),$.dosPermissions&&16&$.dosPermissions&&($.dir=!0),$.dir&&(S=u(S)),$.createFolders&&(P=d(S))&&g.call(this,P,!0);var Q=O==="string"&&$.binary===!1&&$.base64===!1;N&&N.binary!==void 0||($.binary=!Q),(B instanceof c&&B.uncompressedSize===0||$.dir||!B||B.length===0)&&($.base64=!1,$.binary=!0,B="",$.compression="STORE",O="string");var k=null;k=B instanceof c||B instanceof o?B:f.isNode&&f.isStream(B)?new s(S,B):r.prepareContent(S,B,$.binary,$.optimizedBinaryString,$.base64);var F=new m(S,k,$);this.files[S]=F}var n=t("./utf8"),r=t("./utils"),o=t("./stream/GenericWorker"),w=t("./stream/StreamHelper"),x=t("./defaults"),c=t("./compressedObject"),m=t("./zipObject"),p=t("./generate"),f=t("./nodejsUtils"),s=t("./nodejs/NodejsStreamInputAdapter"),d=function(S){S.slice(-1)==="/"&&(S=S.substring(0,S.length-1));var B=S.lastIndexOf("/");return 0<B?S.substring(0,B):""},u=function(S){return S.slice(-1)!=="/"&&(S+="/"),S},g=function(S,B){return B=B!==void 0?B:x.createFolders,S=u(S),this.files[S]||i.call(this,S,null,{dir:!0,createFolders:B}),this.files[S]};function y(S){return Object.prototype.toString.call(S)==="[object RegExp]"}var z={load:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},forEach:function(S){var B,N,P;for(B in this.files)P=this.files[B],(N=B.slice(this.root.length,B.length))&&B.slice(0,this.root.length)===this.root&&S(N,P)},filter:function(S){var B=[];return this.forEach(function(N,P){S(N,P)&&B.push(P)}),B},file:function(S,B,N){if(arguments.length!==1)return S=this.root+S,i.call(this,S,B,N),this;if(y(S)){var P=S;return this.filter(function($,Q){return!Q.dir&&P.test($)})}var O=this.files[this.root+S];return O&&!O.dir?O:null},folder:function(S){if(!S)return this;if(y(S))return this.filter(function(O,$){return $.dir&&S.test(O)});var B=this.root+S,N=g.call(this,B),P=this.clone();return P.root=N.name,P},remove:function(S){S=this.root+S;var B=this.files[S];if(B||(S.slice(-1)!=="/"&&(S+="/"),B=this.files[S]),B&&!B.dir)delete this.files[S];else for(var N=this.filter(function(O,$){return $.name.slice(0,S.length)===S}),P=0;P<N.length;P++)delete this.files[N[P].name];return this},generate:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},generateInternalStream:function(S){var B,N={};try{if((N=r.extend(S||{},{streamFiles:!1,compression:"STORE",compressionOptions:null,type:"",platform:"DOS",comment:null,mimeType:"application/zip",encodeFileName:n.utf8encode})).type=N.type.toLowerCase(),N.compression=N.compression.toUpperCase(),N.type==="binarystring"&&(N.type="string"),!N.type)throw new Error("No output type specified.");r.checkSupport(N.type),N.platform!=="darwin"&&N.platform!=="freebsd"&&N.platform!=="linux"&&N.platform!=="sunos"||(N.platform="UNIX"),N.platform==="win32"&&(N.platform="DOS");var P=N.comment||this.comment||"";B=p.generateWorker(this,N,P)}catch(O){(B=new o("error")).error(O)}return new w(B,N.type||"string",N.mimeType)},generateAsync:function(S,B){return this.generateInternalStream(S).accumulate(B)},generateNodeStream:function(S,B){return(S=S||{}).type||(S.type="nodebuffer"),this.generateInternalStream(S).toNodejsStream(B)}};h.exports=z},{"./compressedObject":2,"./defaults":5,"./generate":9,"./nodejs/NodejsStreamInputAdapter":12,"./nodejsUtils":14,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31,"./utils":32,"./zipObject":35}],16:[function(t,h,l){"use strict";h.exports=t("stream")},{stream:void 0}],17:[function(t,h,l){"use strict";var i=t("./DataReader");function n(r){i.call(this,r);for(var o=0;o<this.data.length;o++)r[o]=255&r[o]}t("../utils").inherits(n,i),n.prototype.byteAt=function(r){return this.data[this.zero+r]},n.prototype.lastIndexOfSignature=function(r){for(var o=r.charCodeAt(0),w=r.charCodeAt(1),x=r.charCodeAt(2),c=r.charCodeAt(3),m=this.length-4;0<=m;--m)if(this.data[m]===o&&this.data[m+1]===w&&this.data[m+2]===x&&this.data[m+3]===c)return m-this.zero;return-1},n.prototype.readAndCheckSignature=function(r){var o=r.charCodeAt(0),w=r.charCodeAt(1),x=r.charCodeAt(2),c=r.charCodeAt(3),m=this.readData(4);return o===m[0]&&w===m[1]&&x===m[2]&&c===m[3]},n.prototype.readData=function(r){if(this.checkOffset(r),r===0)return[];var o=this.data.slice(this.zero+this.index,this.zero+this.index+r);return this.index+=r,o},h.exports=n},{"../utils":32,"./DataReader":18}],18:[function(t,h,l){"use strict";var i=t("../utils");function n(r){this.data=r,this.length=r.length,this.index=0,this.zero=0}n.prototype={checkOffset:function(r){this.checkIndex(this.index+r)},checkIndex:function(r){if(this.length<this.zero+r||r<0)throw new Error("End of data reached (data length = "+this.length+", asked index = "+r+"). Corrupted zip ?")},setIndex:function(r){this.checkIndex(r),this.index=r},skip:function(r){this.setIndex(this.index+r)},byteAt:function(){},readInt:function(r){var o,w=0;for(this.checkOffset(r),o=this.index+r-1;o>=this.index;o--)w=(w<<8)+this.byteAt(o);return this.index+=r,w},readString:function(r){return i.transformTo("string",this.readData(r))},readData:function(){},lastIndexOfSignature:function(){},readAndCheckSignature:function(){},readDate:function(){var r=this.readInt(4);return new Date(Date.UTC(1980+(r>>25&127),(r>>21&15)-1,r>>16&31,r>>11&31,r>>5&63,(31&r)<<1))}},h.exports=n},{"../utils":32}],19:[function(t,h,l){"use strict";var i=t("./Uint8ArrayReader");function n(r){i.call(this,r)}t("../utils").inherits(n,i),n.prototype.readData=function(r){this.checkOffset(r);var o=this.data.slice(this.zero+this.index,this.zero+this.index+r);return this.index+=r,o},h.exports=n},{"../utils":32,"./Uint8ArrayReader":21}],20:[function(t,h,l){"use strict";var i=t("./DataReader");function n(r){i.call(this,r)}t("../utils").inherits(n,i),n.prototype.byteAt=function(r){return this.data.charCodeAt(this.zero+r)},n.prototype.lastIndexOfSignature=function(r){return this.data.lastIndexOf(r)-this.zero},n.prototype.readAndCheckSignature=function(r){return r===this.readData(4)},n.prototype.readData=function(r){this.checkOffset(r);var o=this.data.slice(this.zero+this.index,this.zero+this.index+r);return this.index+=r,o},h.exports=n},{"../utils":32,"./DataReader":18}],21:[function(t,h,l){"use strict";var i=t("./ArrayReader");function n(r){i.call(this,r)}t("../utils").inherits(n,i),n.prototype.readData=function(r){if(this.checkOffset(r),r===0)return new Uint8Array(0);var o=this.data.subarray(this.zero+this.index,this.zero+this.index+r);return this.index+=r,o},h.exports=n},{"../utils":32,"./ArrayReader":17}],22:[function(t,h,l){"use strict";var i=t("../utils"),n=t("../support"),r=t("./ArrayReader"),o=t("./StringReader"),w=t("./NodeBufferReader"),x=t("./Uint8ArrayReader");h.exports=function(c){var m=i.getTypeOf(c);return i.checkSupport(m),m!=="string"||n.uint8array?m==="nodebuffer"?new w(c):n.uint8array?new x(i.transformTo("uint8array",c)):new r(i.transformTo("array",c)):new o(c)}},{"../support":30,"../utils":32,"./ArrayReader":17,"./NodeBufferReader":19,"./StringReader":20,"./Uint8ArrayReader":21}],23:[function(t,h,l){"use strict";l.LOCAL_FILE_HEADER="PK",l.CENTRAL_FILE_HEADER="PK",l.CENTRAL_DIRECTORY_END="PK",l.ZIP64_CENTRAL_DIRECTORY_LOCATOR="PK\x07",l.ZIP64_CENTRAL_DIRECTORY_END="PK",l.DATA_DESCRIPTOR="PK\x07\b"},{}],24:[function(t,h,l){"use strict";var i=t("./GenericWorker"),n=t("../utils");function r(o){i.call(this,"ConvertWorker to "+o),this.destType=o}n.inherits(r,i),r.prototype.processChunk=function(o){this.push({data:n.transformTo(this.destType,o.data),meta:o.meta})},h.exports=r},{"../utils":32,"./GenericWorker":28}],25:[function(t,h,l){"use strict";var i=t("./GenericWorker"),n=t("../crc32");function r(){i.call(this,"Crc32Probe"),this.withStreamInfo("crc32",0)}t("../utils").inherits(r,i),r.prototype.processChunk=function(o){this.streamInfo.crc32=n(o.data,this.streamInfo.crc32||0),this.push(o)},h.exports=r},{"../crc32":4,"../utils":32,"./GenericWorker":28}],26:[function(t,h,l){"use strict";var i=t("../utils"),n=t("./GenericWorker");function r(o){n.call(this,"DataLengthProbe for "+o),this.propName=o,this.withStreamInfo(o,0)}i.inherits(r,n),r.prototype.processChunk=function(o){if(o){var w=this.streamInfo[this.propName]||0;this.streamInfo[this.propName]=w+o.data.length}n.prototype.processChunk.call(this,o)},h.exports=r},{"../utils":32,"./GenericWorker":28}],27:[function(t,h,l){"use strict";var i=t("../utils"),n=t("./GenericWorker");function r(o){n.call(this,"DataWorker");var w=this;this.dataIsReady=!1,this.index=0,this.max=0,this.data=null,this.type="",this._tickScheduled=!1,o.then(function(x){w.dataIsReady=!0,w.data=x,w.max=x&&x.length||0,w.type=i.getTypeOf(x),w.isPaused||w._tickAndRepeat()},function(x){w.error(x)})}i.inherits(r,n),r.prototype.cleanUp=function(){n.prototype.cleanUp.call(this),this.data=null},r.prototype.resume=function(){return!!n.prototype.resume.call(this)&&(!this._tickScheduled&&this.dataIsReady&&(this._tickScheduled=!0,i.delay(this._tickAndRepeat,[],this)),!0)},r.prototype._tickAndRepeat=function(){this._tickScheduled=!1,this.isPaused||this.isFinished||(this._tick(),this.isFinished||(i.delay(this._tickAndRepeat,[],this),this._tickScheduled=!0))},r.prototype._tick=function(){if(this.isPaused||this.isFinished)return!1;var o=null,w=Math.min(this.max,this.index+16384);if(this.index>=this.max)return this.end();switch(this.type){case"string":o=this.data.substring(this.index,w);break;case"uint8array":o=this.data.subarray(this.index,w);break;case"array":case"nodebuffer":o=this.data.slice(this.index,w)}return this.index=w,this.push({data:o,meta:{percent:this.max?this.index/this.max*100:0}})},h.exports=r},{"../utils":32,"./GenericWorker":28}],28:[function(t,h,l){"use strict";function i(n){this.name=n||"default",this.streamInfo={},this.generatedError=null,this.extraStreamInfo={},this.isPaused=!0,this.isFinished=!1,this.isLocked=!1,this._listeners={data:[],end:[],error:[]},this.previous=null}i.prototype={push:function(n){this.emit("data",n)},end:function(){if(this.isFinished)return!1;this.flush();try{this.emit("end"),this.cleanUp(),this.isFinished=!0}catch(n){this.emit("error",n)}return!0},error:function(n){return!this.isFinished&&(this.isPaused?this.generatedError=n:(this.isFinished=!0,this.emit("error",n),this.previous&&this.previous.error(n),this.cleanUp()),!0)},on:function(n,r){return this._listeners[n].push(r),this},cleanUp:function(){this.streamInfo=this.generatedError=this.extraStreamInfo=null,this._listeners=[]},emit:function(n,r){if(this._listeners[n])for(var o=0;o<this._listeners[n].length;o++)this._listeners[n][o].call(this,r)},pipe:function(n){return n.registerPrevious(this)},registerPrevious:function(n){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.streamInfo=n.streamInfo,this.mergeStreamInfo(),this.previous=n;var r=this;return n.on("data",function(o){r.processChunk(o)}),n.on("end",function(){r.end()}),n.on("error",function(o){r.error(o)}),this},pause:function(){return!this.isPaused&&!this.isFinished&&(this.isPaused=!0,this.previous&&this.previous.pause(),!0)},resume:function(){if(!this.isPaused||this.isFinished)return!1;var n=this.isPaused=!1;return this.generatedError&&(this.error(this.generatedError),n=!0),this.previous&&this.previous.resume(),!n},flush:function(){},processChunk:function(n){this.push(n)},withStreamInfo:function(n,r){return this.extraStreamInfo[n]=r,this.mergeStreamInfo(),this},mergeStreamInfo:function(){for(var n in this.extraStreamInfo)Object.prototype.hasOwnProperty.call(this.extraStreamInfo,n)&&(this.streamInfo[n]=this.extraStreamInfo[n])},lock:function(){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.isLocked=!0,this.previous&&this.previous.lock()},toString:function(){var n="Worker "+this.name;return this.previous?this.previous+" -> "+n:n}},h.exports=i},{}],29:[function(t,h,l){"use strict";var i=t("../utils"),n=t("./ConvertWorker"),r=t("./GenericWorker"),o=t("../base64"),w=t("../support"),x=t("../external"),c=null;if(w.nodestream)try{c=t("../nodejs/NodejsStreamOutputAdapter")}catch{}function m(f,s){return new x.Promise(function(d,u){var g=[],y=f._internalType,z=f._outputType,S=f._mimeType;f.on("data",function(B,N){g.push(B),s&&s(N)}).on("error",function(B){g=[],u(B)}).on("end",function(){try{var B=(function(N,P,O){switch(N){case"blob":return i.newBlob(i.transformTo("arraybuffer",P),O);case"base64":return o.encode(P);default:return i.transformTo(N,P)}})(z,(function(N,P){var O,$=0,Q=null,k=0;for(O=0;O<P.length;O++)k+=P[O].length;switch(N){case"string":return P.join("");case"array":return Array.prototype.concat.apply([],P);case"uint8array":for(Q=new Uint8Array(k),O=0;O<P.length;O++)Q.set(P[O],$),$+=P[O].length;return Q;case"nodebuffer":return Buffer.concat(P);default:throw new Error("concat : unsupported type '"+N+"'")}})(y,g),S);d(B)}catch(N){u(N)}g=[]}).resume()})}function p(f,s,d){var u=s;switch(s){case"blob":case"arraybuffer":u="uint8array";break;case"base64":u="string"}try{this._internalType=u,this._outputType=s,this._mimeType=d,i.checkSupport(u),this._worker=f.pipe(new n(u)),f.lock()}catch(g){this._worker=new r("error"),this._worker.error(g)}}p.prototype={accumulate:function(f){return m(this,f)},on:function(f,s){var d=this;return f==="data"?this._worker.on(f,function(u){s.call(d,u.data,u.meta)}):this._worker.on(f,function(){i.delay(s,arguments,d)}),this},resume:function(){return i.delay(this._worker.resume,[],this._worker),this},pause:function(){return this._worker.pause(),this},toNodejsStream:function(f){if(i.checkSupport("nodestream"),this._outputType!=="nodebuffer")throw new Error(this._outputType+" is not supported by this method");return new c(this,{objectMode:this._outputType!=="nodebuffer"},f)}},h.exports=p},{"../base64":1,"../external":6,"../nodejs/NodejsStreamOutputAdapter":13,"../support":30,"../utils":32,"./ConvertWorker":24,"./GenericWorker":28}],30:[function(t,h,l){"use strict";if(l.base64=!0,l.array=!0,l.string=!0,l.arraybuffer=typeof ArrayBuffer<"u"&&typeof Uint8Array<"u",l.nodebuffer=typeof Buffer<"u",l.uint8array=typeof Uint8Array<"u",typeof ArrayBuffer>"u")l.blob=!1;else{var i=new ArrayBuffer(0);try{l.blob=new Blob([i],{type:"application/zip"}).size===0}catch{try{var n=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);n.append(i),l.blob=n.getBlob("application/zip").size===0}catch{l.blob=!1}}}try{l.nodestream=!!t("readable-stream").Readable}catch{l.nodestream=!1}},{"readable-stream":16}],31:[function(t,h,l){"use strict";for(var i=t("./utils"),n=t("./support"),r=t("./nodejsUtils"),o=t("./stream/GenericWorker"),w=new Array(256),x=0;x<256;x++)w[x]=252<=x?6:248<=x?5:240<=x?4:224<=x?3:192<=x?2:1;w[254]=w[254]=1;function c(){o.call(this,"utf-8 decode"),this.leftOver=null}function m(){o.call(this,"utf-8 encode")}l.utf8encode=function(p){return n.nodebuffer?r.newBufferFrom(p,"utf-8"):(function(f){var s,d,u,g,y,z=f.length,S=0;for(g=0;g<z;g++)(64512&(d=f.charCodeAt(g)))==55296&&g+1<z&&(64512&(u=f.charCodeAt(g+1)))==56320&&(d=65536+(d-55296<<10)+(u-56320),g++),S+=d<128?1:d<2048?2:d<65536?3:4;for(s=n.uint8array?new Uint8Array(S):new Array(S),g=y=0;y<S;g++)(64512&(d=f.charCodeAt(g)))==55296&&g+1<z&&(64512&(u=f.charCodeAt(g+1)))==56320&&(d=65536+(d-55296<<10)+(u-56320),g++),d<128?s[y++]=d:(d<2048?s[y++]=192|d>>>6:(d<65536?s[y++]=224|d>>>12:(s[y++]=240|d>>>18,s[y++]=128|d>>>12&63),s[y++]=128|d>>>6&63),s[y++]=128|63&d);return s})(p)},l.utf8decode=function(p){return n.nodebuffer?i.transformTo("nodebuffer",p).toString("utf-8"):(function(f){var s,d,u,g,y=f.length,z=new Array(2*y);for(s=d=0;s<y;)if((u=f[s++])<128)z[d++]=u;else if(4<(g=w[u]))z[d++]=65533,s+=g-1;else{for(u&=g===2?31:g===3?15:7;1<g&&s<y;)u=u<<6|63&f[s++],g--;1<g?z[d++]=65533:u<65536?z[d++]=u:(u-=65536,z[d++]=55296|u>>10&1023,z[d++]=56320|1023&u)}return z.length!==d&&(z.subarray?z=z.subarray(0,d):z.length=d),i.applyFromCharCode(z)})(p=i.transformTo(n.uint8array?"uint8array":"array",p))},i.inherits(c,o),c.prototype.processChunk=function(p){var f=i.transformTo(n.uint8array?"uint8array":"array",p.data);if(this.leftOver&&this.leftOver.length){if(n.uint8array){var s=f;(f=new Uint8Array(s.length+this.leftOver.length)).set(this.leftOver,0),f.set(s,this.leftOver.length)}else f=this.leftOver.concat(f);this.leftOver=null}var d=(function(g,y){var z;for((y=y||g.length)>g.length&&(y=g.length),z=y-1;0<=z&&(192&g[z])==128;)z--;return z<0||z===0?y:z+w[g[z]]>y?z:y})(f),u=f;d!==f.length&&(n.uint8array?(u=f.subarray(0,d),this.leftOver=f.subarray(d,f.length)):(u=f.slice(0,d),this.leftOver=f.slice(d,f.length))),this.push({data:l.utf8decode(u),meta:p.meta})},c.prototype.flush=function(){this.leftOver&&this.leftOver.length&&(this.push({data:l.utf8decode(this.leftOver),meta:{}}),this.leftOver=null)},l.Utf8DecodeWorker=c,i.inherits(m,o),m.prototype.processChunk=function(p){this.push({data:l.utf8encode(p.data),meta:p.meta})},l.Utf8EncodeWorker=m},{"./nodejsUtils":14,"./stream/GenericWorker":28,"./support":30,"./utils":32}],32:[function(t,h,l){"use strict";var i=t("./support"),n=t("./base64"),r=t("./nodejsUtils"),o=t("./external");function w(s){return s}function x(s,d){for(var u=0;u<s.length;++u)d[u]=255&s.charCodeAt(u);return d}t("setimmediate"),l.newBlob=function(s,d){l.checkSupport("blob");try{return new Blob([s],{type:d})}catch{try{var u=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);return u.append(s),u.getBlob(d)}catch{throw new Error("Bug : can't construct the Blob.")}}};var c={stringifyByChunk:function(s,d,u){var g=[],y=0,z=s.length;if(z<=u)return String.fromCharCode.apply(null,s);for(;y<z;)d==="array"||d==="nodebuffer"?g.push(String.fromCharCode.apply(null,s.slice(y,Math.min(y+u,z)))):g.push(String.fromCharCode.apply(null,s.subarray(y,Math.min(y+u,z)))),y+=u;return g.join("")},stringifyByChar:function(s){for(var d="",u=0;u<s.length;u++)d+=String.fromCharCode(s[u]);return d},applyCanBeUsed:{uint8array:(function(){try{return i.uint8array&&String.fromCharCode.apply(null,new Uint8Array(1)).length===1}catch{return!1}})(),nodebuffer:(function(){try{return i.nodebuffer&&String.fromCharCode.apply(null,r.allocBuffer(1)).length===1}catch{return!1}})()}};function m(s){var d=65536,u=l.getTypeOf(s),g=!0;if(u==="uint8array"?g=c.applyCanBeUsed.uint8array:u==="nodebuffer"&&(g=c.applyCanBeUsed.nodebuffer),g)for(;1<d;)try{return c.stringifyByChunk(s,u,d)}catch{d=Math.floor(d/2)}return c.stringifyByChar(s)}function p(s,d){for(var u=0;u<s.length;u++)d[u]=s[u];return d}l.applyFromCharCode=m;var f={};f.string={string:w,array:function(s){return x(s,new Array(s.length))},arraybuffer:function(s){return f.string.uint8array(s).buffer},uint8array:function(s){return x(s,new Uint8Array(s.length))},nodebuffer:function(s){return x(s,r.allocBuffer(s.length))}},f.array={string:m,array:w,arraybuffer:function(s){return new Uint8Array(s).buffer},uint8array:function(s){return new Uint8Array(s)},nodebuffer:function(s){return r.newBufferFrom(s)}},f.arraybuffer={string:function(s){return m(new Uint8Array(s))},array:function(s){return p(new Uint8Array(s),new Array(s.byteLength))},arraybuffer:w,uint8array:function(s){return new Uint8Array(s)},nodebuffer:function(s){return r.newBufferFrom(new Uint8Array(s))}},f.uint8array={string:m,array:function(s){return p(s,new Array(s.length))},arraybuffer:function(s){return s.buffer},uint8array:w,nodebuffer:function(s){return r.newBufferFrom(s)}},f.nodebuffer={string:m,array:function(s){return p(s,new Array(s.length))},arraybuffer:function(s){return f.nodebuffer.uint8array(s).buffer},uint8array:function(s){return p(s,new Uint8Array(s.length))},nodebuffer:w},l.transformTo=function(s,d){if(d=d||"",!s)return d;l.checkSupport(s);var u=l.getTypeOf(d);return f[u][s](d)},l.resolve=function(s){for(var d=s.split("/"),u=[],g=0;g<d.length;g++){var y=d[g];y==="."||y===""&&g!==0&&g!==d.length-1||(y===".."?u.pop():u.push(y))}return u.join("/")},l.getTypeOf=function(s){return typeof s=="string"?"string":Object.prototype.toString.call(s)==="[object Array]"?"array":i.nodebuffer&&r.isBuffer(s)?"nodebuffer":i.uint8array&&s instanceof Uint8Array?"uint8array":i.arraybuffer&&s instanceof ArrayBuffer?"arraybuffer":void 0},l.checkSupport=function(s){if(!i[s.toLowerCase()])throw new Error(s+" is not supported by this platform")},l.MAX_VALUE_16BITS=65535,l.MAX_VALUE_32BITS=-1,l.pretty=function(s){var d,u,g="";for(u=0;u<(s||"").length;u++)g+="\\x"+((d=s.charCodeAt(u))<16?"0":"")+d.toString(16).toUpperCase();return g},l.delay=function(s,d,u){setImmediate(function(){s.apply(u||null,d||[])})},l.inherits=function(s,d){function u(){}u.prototype=d.prototype,s.prototype=new u},l.extend=function(){var s,d,u={};for(s=0;s<arguments.length;s++)for(d in arguments[s])Object.prototype.hasOwnProperty.call(arguments[s],d)&&u[d]===void 0&&(u[d]=arguments[s][d]);return u},l.prepareContent=function(s,d,u,g,y){return o.Promise.resolve(d).then(function(z){return i.blob&&(z instanceof Blob||["[object File]","[object Blob]"].indexOf(Object.prototype.toString.call(z))!==-1)&&typeof FileReader<"u"?new o.Promise(function(S,B){var N=new FileReader;N.onload=function(P){S(P.target.result)},N.onerror=function(P){B(P.target.error)},N.readAsArrayBuffer(z)}):z}).then(function(z){var S=l.getTypeOf(z);return S?(S==="arraybuffer"?z=l.transformTo("uint8array",z):S==="string"&&(y?z=n.decode(z):u&&g!==!0&&(z=(function(B){return x(B,i.uint8array?new Uint8Array(B.length):new Array(B.length))})(z))),z):o.Promise.reject(new Error("Can't read the data of '"+s+"'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"))})}},{"./base64":1,"./external":6,"./nodejsUtils":14,"./support":30,setimmediate:54}],33:[function(t,h,l){"use strict";var i=t("./reader/readerFor"),n=t("./utils"),r=t("./signature"),o=t("./zipEntry"),w=t("./support");function x(c){this.files=[],this.loadOptions=c}x.prototype={checkSignature:function(c){if(!this.reader.readAndCheckSignature(c)){this.reader.index-=4;var m=this.reader.readString(4);throw new Error("Corrupted zip or bug: unexpected signature ("+n.pretty(m)+", expected "+n.pretty(c)+")")}},isSignature:function(c,m){var p=this.reader.index;this.reader.setIndex(c);var f=this.reader.readString(4)===m;return this.reader.setIndex(p),f},readBlockEndOfCentral:function(){this.diskNumber=this.reader.readInt(2),this.diskWithCentralDirStart=this.reader.readInt(2),this.centralDirRecordsOnThisDisk=this.reader.readInt(2),this.centralDirRecords=this.reader.readInt(2),this.centralDirSize=this.reader.readInt(4),this.centralDirOffset=this.reader.readInt(4),this.zipCommentLength=this.reader.readInt(2);var c=this.reader.readData(this.zipCommentLength),m=w.uint8array?"uint8array":"array",p=n.transformTo(m,c);this.zipComment=this.loadOptions.decodeFileName(p)},readBlockZip64EndOfCentral:function(){this.zip64EndOfCentralSize=this.reader.readInt(8),this.reader.skip(4),this.diskNumber=this.reader.readInt(4),this.diskWithCentralDirStart=this.reader.readInt(4),this.centralDirRecordsOnThisDisk=this.reader.readInt(8),this.centralDirRecords=this.reader.readInt(8),this.centralDirSize=this.reader.readInt(8),this.centralDirOffset=this.reader.readInt(8),this.zip64ExtensibleData={};for(var c,m,p,f=this.zip64EndOfCentralSize-44;0<f;)c=this.reader.readInt(2),m=this.reader.readInt(4),p=this.reader.readData(m),this.zip64ExtensibleData[c]={id:c,length:m,value:p}},readBlockZip64EndOfCentralLocator:function(){if(this.diskWithZip64CentralDirStart=this.reader.readInt(4),this.relativeOffsetEndOfZip64CentralDir=this.reader.readInt(8),this.disksCount=this.reader.readInt(4),1<this.disksCount)throw new Error("Multi-volumes zip are not supported")},readLocalFiles:function(){var c,m;for(c=0;c<this.files.length;c++)m=this.files[c],this.reader.setIndex(m.localHeaderOffset),this.checkSignature(r.LOCAL_FILE_HEADER),m.readLocalPart(this.reader),m.handleUTF8(),m.processAttributes()},readCentralDir:function(){var c;for(this.reader.setIndex(this.centralDirOffset);this.reader.readAndCheckSignature(r.CENTRAL_FILE_HEADER);)(c=new o({zip64:this.zip64},this.loadOptions)).readCentralPart(this.reader),this.files.push(c);if(this.centralDirRecords!==this.files.length&&this.centralDirRecords!==0&&this.files.length===0)throw new Error("Corrupted zip or bug: expected "+this.centralDirRecords+" records in central dir, got "+this.files.length)},readEndOfCentral:function(){var c=this.reader.lastIndexOfSignature(r.CENTRAL_DIRECTORY_END);if(c<0)throw this.isSignature(0,r.LOCAL_FILE_HEADER)?new Error("Corrupted zip: can't find end of central directory"):new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html");this.reader.setIndex(c);var m=c;if(this.checkSignature(r.CENTRAL_DIRECTORY_END),this.readBlockEndOfCentral(),this.diskNumber===n.MAX_VALUE_16BITS||this.diskWithCentralDirStart===n.MAX_VALUE_16BITS||this.centralDirRecordsOnThisDisk===n.MAX_VALUE_16BITS||this.centralDirRecords===n.MAX_VALUE_16BITS||this.centralDirSize===n.MAX_VALUE_32BITS||this.centralDirOffset===n.MAX_VALUE_32BITS){if(this.zip64=!0,(c=this.reader.lastIndexOfSignature(r.ZIP64_CENTRAL_DIRECTORY_LOCATOR))<0)throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");if(this.reader.setIndex(c),this.checkSignature(r.ZIP64_CENTRAL_DIRECTORY_LOCATOR),this.readBlockZip64EndOfCentralLocator(),!this.isSignature(this.relativeOffsetEndOfZip64CentralDir,r.ZIP64_CENTRAL_DIRECTORY_END)&&(this.relativeOffsetEndOfZip64CentralDir=this.reader.lastIndexOfSignature(r.ZIP64_CENTRAL_DIRECTORY_END),this.relativeOffsetEndOfZip64CentralDir<0))throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir),this.checkSignature(r.ZIP64_CENTRAL_DIRECTORY_END),this.readBlockZip64EndOfCentral()}var p=this.centralDirOffset+this.centralDirSize;this.zip64&&(p+=20,p+=12+this.zip64EndOfCentralSize);var f=m-p;if(0<f)this.isSignature(m,r.CENTRAL_FILE_HEADER)||(this.reader.zero=f);else if(f<0)throw new Error("Corrupted zip: missing "+Math.abs(f)+" bytes.")},prepareReader:function(c){this.reader=i(c)},load:function(c){this.prepareReader(c),this.readEndOfCentral(),this.readCentralDir(),this.readLocalFiles()}},h.exports=x},{"./reader/readerFor":22,"./signature":23,"./support":30,"./utils":32,"./zipEntry":34}],34:[function(t,h,l){"use strict";var i=t("./reader/readerFor"),n=t("./utils"),r=t("./compressedObject"),o=t("./crc32"),w=t("./utf8"),x=t("./compressions"),c=t("./support");function m(p,f){this.options=p,this.loadOptions=f}m.prototype={isEncrypted:function(){return(1&this.bitFlag)==1},useUTF8:function(){return(2048&this.bitFlag)==2048},readLocalPart:function(p){var f,s;if(p.skip(22),this.fileNameLength=p.readInt(2),s=p.readInt(2),this.fileName=p.readData(this.fileNameLength),p.skip(s),this.compressedSize===-1||this.uncompressedSize===-1)throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");if((f=(function(d){for(var u in x)if(Object.prototype.hasOwnProperty.call(x,u)&&x[u].magic===d)return x[u];return null})(this.compressionMethod))===null)throw new Error("Corrupted zip : compression "+n.pretty(this.compressionMethod)+" unknown (inner file : "+n.transformTo("string",this.fileName)+")");this.decompressed=new r(this.compressedSize,this.uncompressedSize,this.crc32,f,p.readData(this.compressedSize))},readCentralPart:function(p){this.versionMadeBy=p.readInt(2),p.skip(2),this.bitFlag=p.readInt(2),this.compressionMethod=p.readString(2),this.date=p.readDate(),this.crc32=p.readInt(4),this.compressedSize=p.readInt(4),this.uncompressedSize=p.readInt(4);var f=p.readInt(2);if(this.extraFieldsLength=p.readInt(2),this.fileCommentLength=p.readInt(2),this.diskNumberStart=p.readInt(2),this.internalFileAttributes=p.readInt(2),this.externalFileAttributes=p.readInt(4),this.localHeaderOffset=p.readInt(4),this.isEncrypted())throw new Error("Encrypted zip are not supported");p.skip(f),this.readExtraFields(p),this.parseZIP64ExtraField(p),this.fileComment=p.readData(this.fileCommentLength)},processAttributes:function(){this.unixPermissions=null,this.dosPermissions=null;var p=this.versionMadeBy>>8;this.dir=!!(16&this.externalFileAttributes),p==0&&(this.dosPermissions=63&this.externalFileAttributes),p==3&&(this.unixPermissions=this.externalFileAttributes>>16&65535),this.dir||this.fileNameStr.slice(-1)!=="/"||(this.dir=!0)},parseZIP64ExtraField:function(){if(this.extraFields[1]){var p=i(this.extraFields[1].value);this.uncompressedSize===n.MAX_VALUE_32BITS&&(this.uncompressedSize=p.readInt(8)),this.compressedSize===n.MAX_VALUE_32BITS&&(this.compressedSize=p.readInt(8)),this.localHeaderOffset===n.MAX_VALUE_32BITS&&(this.localHeaderOffset=p.readInt(8)),this.diskNumberStart===n.MAX_VALUE_32BITS&&(this.diskNumberStart=p.readInt(4))}},readExtraFields:function(p){var f,s,d,u=p.index+this.extraFieldsLength;for(this.extraFields||(this.extraFields={});p.index+4<u;)f=p.readInt(2),s=p.readInt(2),d=p.readData(s),this.extraFields[f]={id:f,length:s,value:d};p.setIndex(u)},handleUTF8:function(){var p=c.uint8array?"uint8array":"array";if(this.useUTF8())this.fileNameStr=w.utf8decode(this.fileName),this.fileCommentStr=w.utf8decode(this.fileComment);else{var f=this.findExtraFieldUnicodePath();if(f!==null)this.fileNameStr=f;else{var s=n.transformTo(p,this.fileName);this.fileNameStr=this.loadOptions.decodeFileName(s)}var d=this.findExtraFieldUnicodeComment();if(d!==null)this.fileCommentStr=d;else{var u=n.transformTo(p,this.fileComment);this.fileCommentStr=this.loadOptions.decodeFileName(u)}}},findExtraFieldUnicodePath:function(){var p=this.extraFields[28789];if(p){var f=i(p.value);return f.readInt(1)!==1||o(this.fileName)!==f.readInt(4)?null:w.utf8decode(f.readData(p.length-5))}return null},findExtraFieldUnicodeComment:function(){var p=this.extraFields[25461];if(p){var f=i(p.value);return f.readInt(1)!==1||o(this.fileComment)!==f.readInt(4)?null:w.utf8decode(f.readData(p.length-5))}return null}},h.exports=m},{"./compressedObject":2,"./compressions":3,"./crc32":4,"./reader/readerFor":22,"./support":30,"./utf8":31,"./utils":32}],35:[function(t,h,l){"use strict";function i(f,s,d){this.name=f,this.dir=d.dir,this.date=d.date,this.comment=d.comment,this.unixPermissions=d.unixPermissions,this.dosPermissions=d.dosPermissions,this._data=s,this._dataBinary=d.binary,this.options={compression:d.compression,compressionOptions:d.compressionOptions}}var n=t("./stream/StreamHelper"),r=t("./stream/DataWorker"),o=t("./utf8"),w=t("./compressedObject"),x=t("./stream/GenericWorker");i.prototype={internalStream:function(f){var s=null,d="string";try{if(!f)throw new Error("No output type specified.");var u=(d=f.toLowerCase())==="string"||d==="text";d!=="binarystring"&&d!=="text"||(d="string"),s=this._decompressWorker();var g=!this._dataBinary;g&&!u&&(s=s.pipe(new o.Utf8EncodeWorker)),!g&&u&&(s=s.pipe(new o.Utf8DecodeWorker))}catch(y){(s=new x("error")).error(y)}return new n(s,d,"")},async:function(f,s){return this.internalStream(f).accumulate(s)},nodeStream:function(f,s){return this.internalStream(f||"nodebuffer").toNodejsStream(s)},_compressWorker:function(f,s){if(this._data instanceof w&&this._data.compression.magic===f.magic)return this._data.getCompressedWorker();var d=this._decompressWorker();return this._dataBinary||(d=d.pipe(new o.Utf8EncodeWorker)),w.createWorkerFrom(d,f,s)},_decompressWorker:function(){return this._data instanceof w?this._data.getContentWorker():this._data instanceof x?this._data:new r(this._data)}};for(var c=["asText","asBinary","asNodeBuffer","asUint8Array","asArrayBuffer"],m=function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},p=0;p<c.length;p++)i.prototype[c[p]]=m;h.exports=i},{"./compressedObject":2,"./stream/DataWorker":27,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31}],36:[function(t,h,l){(function(i){"use strict";var n,r,o=i.MutationObserver||i.WebKitMutationObserver;if(o){var w=0,x=new o(f),c=i.document.createTextNode("");x.observe(c,{characterData:!0}),n=function(){c.data=w=++w%2}}else if(i.setImmediate||i.MessageChannel===void 0)n="document"in i&&"onreadystatechange"in i.document.createElement("script")?function(){var s=i.document.createElement("script");s.onreadystatechange=function(){f(),s.onreadystatechange=null,s.parentNode.removeChild(s),s=null},i.document.documentElement.appendChild(s)}:function(){setTimeout(f,0)};else{var m=new i.MessageChannel;m.port1.onmessage=f,n=function(){m.port2.postMessage(0)}}var p=[];function f(){var s,d;r=!0;for(var u=p.length;u;){for(d=p,p=[],s=-1;++s<u;)d[s]();u=p.length}r=!1}h.exports=function(s){p.push(s)!==1||r||n()}}).call(this,typeof global<"u"?global:typeof self<"u"?self:typeof window<"u"?window:{})},{}],37:[function(t,h,l){"use strict";var i=t("immediate");function n(){}var r={},o=["REJECTED"],w=["FULFILLED"],x=["PENDING"];function c(u){if(typeof u!="function")throw new TypeError("resolver must be a function");this.state=x,this.queue=[],this.outcome=void 0,u!==n&&s(this,u)}function m(u,g,y){this.promise=u,typeof g=="function"&&(this.onFulfilled=g,this.callFulfilled=this.otherCallFulfilled),typeof y=="function"&&(this.onRejected=y,this.callRejected=this.otherCallRejected)}function p(u,g,y){i(function(){var z;try{z=g(y)}catch(S){return r.reject(u,S)}z===u?r.reject(u,new TypeError("Cannot resolve promise with itself")):r.resolve(u,z)})}function f(u){var g=u&&u.then;if(u&&(typeof u=="object"||typeof u=="function")&&typeof g=="function")return function(){g.apply(u,arguments)}}function s(u,g){var y=!1;function z(N){y||(y=!0,r.reject(u,N))}function S(N){y||(y=!0,r.resolve(u,N))}var B=d(function(){g(S,z)});B.status==="error"&&z(B.value)}function d(u,g){var y={};try{y.value=u(g),y.status="success"}catch(z){y.status="error",y.value=z}return y}(h.exports=c).prototype.finally=function(u){if(typeof u!="function")return this;var g=this.constructor;return this.then(function(y){return g.resolve(u()).then(function(){return y})},function(y){return g.resolve(u()).then(function(){throw y})})},c.prototype.catch=function(u){return this.then(null,u)},c.prototype.then=function(u,g){if(typeof u!="function"&&this.state===w||typeof g!="function"&&this.state===o)return this;var y=new this.constructor(n);return this.state!==x?p(y,this.state===w?u:g,this.outcome):this.queue.push(new m(y,u,g)),y},m.prototype.callFulfilled=function(u){r.resolve(this.promise,u)},m.prototype.otherCallFulfilled=function(u){p(this.promise,this.onFulfilled,u)},m.prototype.callRejected=function(u){r.reject(this.promise,u)},m.prototype.otherCallRejected=function(u){p(this.promise,this.onRejected,u)},r.resolve=function(u,g){var y=d(f,g);if(y.status==="error")return r.reject(u,y.value);var z=y.value;if(z)s(u,z);else{u.state=w,u.outcome=g;for(var S=-1,B=u.queue.length;++S<B;)u.queue[S].callFulfilled(g)}return u},r.reject=function(u,g){u.state=o,u.outcome=g;for(var y=-1,z=u.queue.length;++y<z;)u.queue[y].callRejected(g);return u},c.resolve=function(u){return u instanceof this?u:r.resolve(new this(n),u)},c.reject=function(u){var g=new this(n);return r.reject(g,u)},c.all=function(u){var g=this;if(Object.prototype.toString.call(u)!=="[object Array]")return this.reject(new TypeError("must be an array"));var y=u.length,z=!1;if(!y)return this.resolve([]);for(var S=new Array(y),B=0,N=-1,P=new this(n);++N<y;)O(u[N],N);return P;function O($,Q){g.resolve($).then(function(k){S[Q]=k,++B!==y||z||(z=!0,r.resolve(P,S))},function(k){z||(z=!0,r.reject(P,k))})}},c.race=function(u){var g=this;if(Object.prototype.toString.call(u)!=="[object Array]")return this.reject(new TypeError("must be an array"));var y=u.length,z=!1;if(!y)return this.resolve([]);for(var S=-1,B=new this(n);++S<y;)N=u[S],g.resolve(N).then(function(P){z||(z=!0,r.resolve(B,P))},function(P){z||(z=!0,r.reject(B,P))});var N;return B}},{immediate:36}],38:[function(t,h,l){"use strict";var i={};(0,t("./lib/utils/common").assign)(i,t("./lib/deflate"),t("./lib/inflate"),t("./lib/zlib/constants")),h.exports=i},{"./lib/deflate":39,"./lib/inflate":40,"./lib/utils/common":41,"./lib/zlib/constants":44}],39:[function(t,h,l){"use strict";var i=t("./zlib/deflate"),n=t("./utils/common"),r=t("./utils/strings"),o=t("./zlib/messages"),w=t("./zlib/zstream"),x=Object.prototype.toString,c=0,m=-1,p=0,f=8;function s(u){if(!(this instanceof s))return new s(u);this.options=n.assign({level:m,method:f,chunkSize:16384,windowBits:15,memLevel:8,strategy:p,to:""},u||{});var g=this.options;g.raw&&0<g.windowBits?g.windowBits=-g.windowBits:g.gzip&&0<g.windowBits&&g.windowBits<16&&(g.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new w,this.strm.avail_out=0;var y=i.deflateInit2(this.strm,g.level,g.method,g.windowBits,g.memLevel,g.strategy);if(y!==c)throw new Error(o[y]);if(g.header&&i.deflateSetHeader(this.strm,g.header),g.dictionary){var z;if(z=typeof g.dictionary=="string"?r.string2buf(g.dictionary):x.call(g.dictionary)==="[object ArrayBuffer]"?new Uint8Array(g.dictionary):g.dictionary,(y=i.deflateSetDictionary(this.strm,z))!==c)throw new Error(o[y]);this._dict_set=!0}}function d(u,g){var y=new s(g);if(y.push(u,!0),y.err)throw y.msg||o[y.err];return y.result}s.prototype.push=function(u,g){var y,z,S=this.strm,B=this.options.chunkSize;if(this.ended)return!1;z=g===~~g?g:g===!0?4:0,typeof u=="string"?S.input=r.string2buf(u):x.call(u)==="[object ArrayBuffer]"?S.input=new Uint8Array(u):S.input=u,S.next_in=0,S.avail_in=S.input.length;do{if(S.avail_out===0&&(S.output=new n.Buf8(B),S.next_out=0,S.avail_out=B),(y=i.deflate(S,z))!==1&&y!==c)return this.onEnd(y),!(this.ended=!0);S.avail_out!==0&&(S.avail_in!==0||z!==4&&z!==2)||(this.options.to==="string"?this.onData(r.buf2binstring(n.shrinkBuf(S.output,S.next_out))):this.onData(n.shrinkBuf(S.output,S.next_out)))}while((0<S.avail_in||S.avail_out===0)&&y!==1);return z===4?(y=i.deflateEnd(this.strm),this.onEnd(y),this.ended=!0,y===c):z!==2||(this.onEnd(c),!(S.avail_out=0))},s.prototype.onData=function(u){this.chunks.push(u)},s.prototype.onEnd=function(u){u===c&&(this.options.to==="string"?this.result=this.chunks.join(""):this.result=n.flattenChunks(this.chunks)),this.chunks=[],this.err=u,this.msg=this.strm.msg},l.Deflate=s,l.deflate=d,l.deflateRaw=function(u,g){return(g=g||{}).raw=!0,d(u,g)},l.gzip=function(u,g){return(g=g||{}).gzip=!0,d(u,g)}},{"./utils/common":41,"./utils/strings":42,"./zlib/deflate":46,"./zlib/messages":51,"./zlib/zstream":53}],40:[function(t,h,l){"use strict";var i=t("./zlib/inflate"),n=t("./utils/common"),r=t("./utils/strings"),o=t("./zlib/constants"),w=t("./zlib/messages"),x=t("./zlib/zstream"),c=t("./zlib/gzheader"),m=Object.prototype.toString;function p(s){if(!(this instanceof p))return new p(s);this.options=n.assign({chunkSize:16384,windowBits:0,to:""},s||{});var d=this.options;d.raw&&0<=d.windowBits&&d.windowBits<16&&(d.windowBits=-d.windowBits,d.windowBits===0&&(d.windowBits=-15)),!(0<=d.windowBits&&d.windowBits<16)||s&&s.windowBits||(d.windowBits+=32),15<d.windowBits&&d.windowBits<48&&(15&d.windowBits)==0&&(d.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new x,this.strm.avail_out=0;var u=i.inflateInit2(this.strm,d.windowBits);if(u!==o.Z_OK)throw new Error(w[u]);this.header=new c,i.inflateGetHeader(this.strm,this.header)}function f(s,d){var u=new p(d);if(u.push(s,!0),u.err)throw u.msg||w[u.err];return u.result}p.prototype.push=function(s,d){var u,g,y,z,S,B,N=this.strm,P=this.options.chunkSize,O=this.options.dictionary,$=!1;if(this.ended)return!1;g=d===~~d?d:d===!0?o.Z_FINISH:o.Z_NO_FLUSH,typeof s=="string"?N.input=r.binstring2buf(s):m.call(s)==="[object ArrayBuffer]"?N.input=new Uint8Array(s):N.input=s,N.next_in=0,N.avail_in=N.input.length;do{if(N.avail_out===0&&(N.output=new n.Buf8(P),N.next_out=0,N.avail_out=P),(u=i.inflate(N,o.Z_NO_FLUSH))===o.Z_NEED_DICT&&O&&(B=typeof O=="string"?r.string2buf(O):m.call(O)==="[object ArrayBuffer]"?new Uint8Array(O):O,u=i.inflateSetDictionary(this.strm,B)),u===o.Z_BUF_ERROR&&$===!0&&(u=o.Z_OK,$=!1),u!==o.Z_STREAM_END&&u!==o.Z_OK)return this.onEnd(u),!(this.ended=!0);N.next_out&&(N.avail_out!==0&&u!==o.Z_STREAM_END&&(N.avail_in!==0||g!==o.Z_FINISH&&g!==o.Z_SYNC_FLUSH)||(this.options.to==="string"?(y=r.utf8border(N.output,N.next_out),z=N.next_out-y,S=r.buf2string(N.output,y),N.next_out=z,N.avail_out=P-z,z&&n.arraySet(N.output,N.output,y,z,0),this.onData(S)):this.onData(n.shrinkBuf(N.output,N.next_out)))),N.avail_in===0&&N.avail_out===0&&($=!0)}while((0<N.avail_in||N.avail_out===0)&&u!==o.Z_STREAM_END);return u===o.Z_STREAM_END&&(g=o.Z_FINISH),g===o.Z_FINISH?(u=i.inflateEnd(this.strm),this.onEnd(u),this.ended=!0,u===o.Z_OK):g!==o.Z_SYNC_FLUSH||(this.onEnd(o.Z_OK),!(N.avail_out=0))},p.prototype.onData=function(s){this.chunks.push(s)},p.prototype.onEnd=function(s){s===o.Z_OK&&(this.options.to==="string"?this.result=this.chunks.join(""):this.result=n.flattenChunks(this.chunks)),this.chunks=[],this.err=s,this.msg=this.strm.msg},l.Inflate=p,l.inflate=f,l.inflateRaw=function(s,d){return(d=d||{}).raw=!0,f(s,d)},l.ungzip=f},{"./utils/common":41,"./utils/strings":42,"./zlib/constants":44,"./zlib/gzheader":47,"./zlib/inflate":49,"./zlib/messages":51,"./zlib/zstream":53}],41:[function(t,h,l){"use strict";var i=typeof Uint8Array<"u"&&typeof Uint16Array<"u"&&typeof Int32Array<"u";l.assign=function(o){for(var w=Array.prototype.slice.call(arguments,1);w.length;){var x=w.shift();if(x){if(typeof x!="object")throw new TypeError(x+"must be non-object");for(var c in x)x.hasOwnProperty(c)&&(o[c]=x[c])}}return o},l.shrinkBuf=function(o,w){return o.length===w?o:o.subarray?o.subarray(0,w):(o.length=w,o)};var n={arraySet:function(o,w,x,c,m){if(w.subarray&&o.subarray)o.set(w.subarray(x,x+c),m);else for(var p=0;p<c;p++)o[m+p]=w[x+p]},flattenChunks:function(o){var w,x,c,m,p,f;for(w=c=0,x=o.length;w<x;w++)c+=o[w].length;for(f=new Uint8Array(c),w=m=0,x=o.length;w<x;w++)p=o[w],f.set(p,m),m+=p.length;return f}},r={arraySet:function(o,w,x,c,m){for(var p=0;p<c;p++)o[m+p]=w[x+p]},flattenChunks:function(o){return[].concat.apply([],o)}};l.setTyped=function(o){o?(l.Buf8=Uint8Array,l.Buf16=Uint16Array,l.Buf32=Int32Array,l.assign(l,n)):(l.Buf8=Array,l.Buf16=Array,l.Buf32=Array,l.assign(l,r))},l.setTyped(i)},{}],42:[function(t,h,l){"use strict";var i=t("./common"),n=!0,r=!0;try{String.fromCharCode.apply(null,[0])}catch{n=!1}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch{r=!1}for(var o=new i.Buf8(256),w=0;w<256;w++)o[w]=252<=w?6:248<=w?5:240<=w?4:224<=w?3:192<=w?2:1;function x(c,m){if(m<65537&&(c.subarray&&r||!c.subarray&&n))return String.fromCharCode.apply(null,i.shrinkBuf(c,m));for(var p="",f=0;f<m;f++)p+=String.fromCharCode(c[f]);return p}o[254]=o[254]=1,l.string2buf=function(c){var m,p,f,s,d,u=c.length,g=0;for(s=0;s<u;s++)(64512&(p=c.charCodeAt(s)))==55296&&s+1<u&&(64512&(f=c.charCodeAt(s+1)))==56320&&(p=65536+(p-55296<<10)+(f-56320),s++),g+=p<128?1:p<2048?2:p<65536?3:4;for(m=new i.Buf8(g),s=d=0;d<g;s++)(64512&(p=c.charCodeAt(s)))==55296&&s+1<u&&(64512&(f=c.charCodeAt(s+1)))==56320&&(p=65536+(p-55296<<10)+(f-56320),s++),p<128?m[d++]=p:(p<2048?m[d++]=192|p>>>6:(p<65536?m[d++]=224|p>>>12:(m[d++]=240|p>>>18,m[d++]=128|p>>>12&63),m[d++]=128|p>>>6&63),m[d++]=128|63&p);return m},l.buf2binstring=function(c){return x(c,c.length)},l.binstring2buf=function(c){for(var m=new i.Buf8(c.length),p=0,f=m.length;p<f;p++)m[p]=c.charCodeAt(p);return m},l.buf2string=function(c,m){var p,f,s,d,u=m||c.length,g=new Array(2*u);for(p=f=0;p<u;)if((s=c[p++])<128)g[f++]=s;else if(4<(d=o[s]))g[f++]=65533,p+=d-1;else{for(s&=d===2?31:d===3?15:7;1<d&&p<u;)s=s<<6|63&c[p++],d--;1<d?g[f++]=65533:s<65536?g[f++]=s:(s-=65536,g[f++]=55296|s>>10&1023,g[f++]=56320|1023&s)}return x(g,f)},l.utf8border=function(c,m){var p;for((m=m||c.length)>c.length&&(m=c.length),p=m-1;0<=p&&(192&c[p])==128;)p--;return p<0||p===0?m:p+o[c[p]]>m?p:m}},{"./common":41}],43:[function(t,h,l){"use strict";h.exports=function(i,n,r,o){for(var w=65535&i|0,x=i>>>16&65535|0,c=0;r!==0;){for(r-=c=2e3<r?2e3:r;x=x+(w=w+n[o++]|0)|0,--c;);w%=65521,x%=65521}return w|x<<16|0}},{}],44:[function(t,h,l){"use strict";h.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}},{}],45:[function(t,h,l){"use strict";var i=(function(){for(var n,r=[],o=0;o<256;o++){n=o;for(var w=0;w<8;w++)n=1&n?3988292384^n>>>1:n>>>1;r[o]=n}return r})();h.exports=function(n,r,o,w){var x=i,c=w+o;n^=-1;for(var m=w;m<c;m++)n=n>>>8^x[255&(n^r[m])];return-1^n}},{}],46:[function(t,h,l){"use strict";var i,n=t("../utils/common"),r=t("./trees"),o=t("./adler32"),w=t("./crc32"),x=t("./messages"),c=0,m=4,p=0,f=-2,s=-1,d=4,u=2,g=8,y=9,z=286,S=30,B=19,N=2*z+1,P=15,O=3,$=258,Q=$+O+1,k=42,F=113,a=1,C=2,R=3,L=4;function et(e,j){return e.msg=x[j],j}function V(e){return(e<<1)-(4<e?9:0)}function tt(e){for(var j=e.length;0<=--j;)e[j]=0}function M(e){var j=e.state,T=j.pending;T>e.avail_out&&(T=e.avail_out),T!==0&&(n.arraySet(e.output,j.pending_buf,j.pending_out,T,e.next_out),e.next_out+=T,j.pending_out+=T,e.total_out+=T,e.avail_out-=T,j.pending-=T,j.pending===0&&(j.pending_out=0))}function A(e,j){r._tr_flush_block(e,0<=e.block_start?e.block_start:-1,e.strstart-e.block_start,j),e.block_start=e.strstart,M(e.strm)}function rt(e,j){e.pending_buf[e.pending++]=j}function J(e,j){e.pending_buf[e.pending++]=j>>>8&255,e.pending_buf[e.pending++]=255&j}function K(e,j){var T,v,b=e.max_chain_length,E=e.strstart,U=e.prev_length,Z=e.nice_match,I=e.strstart>e.w_size-Q?e.strstart-(e.w_size-Q):0,H=e.window,it=e.w_mask,G=e.prev,st=e.strstart+$,ct=H[E+U-1],pt=H[E+U];e.prev_length>=e.good_match&&(b>>=2),Z>e.lookahead&&(Z=e.lookahead);do if(H[(T=j)+U]===pt&&H[T+U-1]===ct&&H[T]===H[E]&&H[++T]===H[E+1]){E+=2,T++;do;while(H[++E]===H[++T]&&H[++E]===H[++T]&&H[++E]===H[++T]&&H[++E]===H[++T]&&H[++E]===H[++T]&&H[++E]===H[++T]&&H[++E]===H[++T]&&H[++E]===H[++T]&&E<st);if(v=$-(st-E),E=st-$,U<v){if(e.match_start=j,Z<=(U=v))break;ct=H[E+U-1],pt=H[E+U]}}while((j=G[j&it])>I&&--b!=0);return U<=e.lookahead?U:e.lookahead}function ht(e){var j,T,v,b,E,U,Z,I,H,it,G=e.w_size;do{if(b=e.window_size-e.lookahead-e.strstart,e.strstart>=G+(G-Q)){for(n.arraySet(e.window,e.window,G,G,0),e.match_start-=G,e.strstart-=G,e.block_start-=G,j=T=e.hash_size;v=e.head[--j],e.head[j]=G<=v?v-G:0,--T;);for(j=T=G;v=e.prev[--j],e.prev[j]=G<=v?v-G:0,--T;);b+=G}if(e.strm.avail_in===0)break;if(U=e.strm,Z=e.window,I=e.strstart+e.lookahead,H=b,it=void 0,it=U.avail_in,H<it&&(it=H),T=it===0?0:(U.avail_in-=it,n.arraySet(Z,U.input,U.next_in,it,I),U.state.wrap===1?U.adler=o(U.adler,Z,it,I):U.state.wrap===2&&(U.adler=w(U.adler,Z,it,I)),U.next_in+=it,U.total_in+=it,it),e.lookahead+=T,e.lookahead+e.insert>=O)for(E=e.strstart-e.insert,e.ins_h=e.window[E],e.ins_h=(e.ins_h<<e.hash_shift^e.window[E+1])&e.hash_mask;e.insert&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[E+O-1])&e.hash_mask,e.prev[E&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=E,E++,e.insert--,!(e.lookahead+e.insert<O)););}while(e.lookahead<Q&&e.strm.avail_in!==0)}function mt(e,j){for(var T,v;;){if(e.lookahead<Q){if(ht(e),e.lookahead<Q&&j===c)return a;if(e.lookahead===0)break}if(T=0,e.lookahead>=O&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+O-1])&e.hash_mask,T=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),T!==0&&e.strstart-T<=e.w_size-Q&&(e.match_length=K(e,T)),e.match_length>=O)if(v=r._tr_tally(e,e.strstart-e.match_start,e.match_length-O),e.lookahead-=e.match_length,e.match_length<=e.max_lazy_match&&e.lookahead>=O){for(e.match_length--;e.strstart++,e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+O-1])&e.hash_mask,T=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart,--e.match_length!=0;);e.strstart++}else e.strstart+=e.match_length,e.match_length=0,e.ins_h=e.window[e.strstart],e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+1])&e.hash_mask;else v=r._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++;if(v&&(A(e,!1),e.strm.avail_out===0))return a}return e.insert=e.strstart<O-1?e.strstart:O-1,j===m?(A(e,!0),e.strm.avail_out===0?R:L):e.last_lit&&(A(e,!1),e.strm.avail_out===0)?a:C}function ot(e,j){for(var T,v,b;;){if(e.lookahead<Q){if(ht(e),e.lookahead<Q&&j===c)return a;if(e.lookahead===0)break}if(T=0,e.lookahead>=O&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+O-1])&e.hash_mask,T=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),e.prev_length=e.match_length,e.prev_match=e.match_start,e.match_length=O-1,T!==0&&e.prev_length<e.max_lazy_match&&e.strstart-T<=e.w_size-Q&&(e.match_length=K(e,T),e.match_length<=5&&(e.strategy===1||e.match_length===O&&4096<e.strstart-e.match_start)&&(e.match_length=O-1)),e.prev_length>=O&&e.match_length<=e.prev_length){for(b=e.strstart+e.lookahead-O,v=r._tr_tally(e,e.strstart-1-e.prev_match,e.prev_length-O),e.lookahead-=e.prev_length-1,e.prev_length-=2;++e.strstart<=b&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+O-1])&e.hash_mask,T=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),--e.prev_length!=0;);if(e.match_available=0,e.match_length=O-1,e.strstart++,v&&(A(e,!1),e.strm.avail_out===0))return a}else if(e.match_available){if((v=r._tr_tally(e,0,e.window[e.strstart-1]))&&A(e,!1),e.strstart++,e.lookahead--,e.strm.avail_out===0)return a}else e.match_available=1,e.strstart++,e.lookahead--}return e.match_available&&(v=r._tr_tally(e,0,e.window[e.strstart-1]),e.match_available=0),e.insert=e.strstart<O-1?e.strstart:O-1,j===m?(A(e,!0),e.strm.avail_out===0?R:L):e.last_lit&&(A(e,!1),e.strm.avail_out===0)?a:C}function W(e,j,T,v,b){this.good_length=e,this.max_lazy=j,this.nice_length=T,this.max_chain=v,this.func=b}function ft(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=g,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new n.Buf16(2*N),this.dyn_dtree=new n.Buf16(2*(2*S+1)),this.bl_tree=new n.Buf16(2*(2*B+1)),tt(this.dyn_ltree),tt(this.dyn_dtree),tt(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new n.Buf16(P+1),this.heap=new n.Buf16(2*z+1),tt(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new n.Buf16(2*z+1),tt(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function ut(e){var j;return e&&e.state?(e.total_in=e.total_out=0,e.data_type=u,(j=e.state).pending=0,j.pending_out=0,j.wrap<0&&(j.wrap=-j.wrap),j.status=j.wrap?k:F,e.adler=j.wrap===2?0:1,j.last_flush=c,r._tr_init(j),p):et(e,f)}function nt(e){var j=ut(e);return j===p&&(function(T){T.window_size=2*T.w_size,tt(T.head),T.max_lazy_match=i[T.level].max_lazy,T.good_match=i[T.level].good_length,T.nice_match=i[T.level].nice_length,T.max_chain_length=i[T.level].max_chain,T.strstart=0,T.block_start=0,T.lookahead=0,T.insert=0,T.match_length=T.prev_length=O-1,T.match_available=0,T.ins_h=0})(e.state),j}function lt(e,j,T,v,b,E){if(!e)return f;var U=1;if(j===s&&(j=6),v<0?(U=0,v=-v):15<v&&(U=2,v-=16),b<1||y<b||T!==g||v<8||15<v||j<0||9<j||E<0||d<E)return et(e,f);v===8&&(v=9);var Z=new ft;return(e.state=Z).strm=e,Z.wrap=U,Z.gzhead=null,Z.w_bits=v,Z.w_size=1<<Z.w_bits,Z.w_mask=Z.w_size-1,Z.hash_bits=b+7,Z.hash_size=1<<Z.hash_bits,Z.hash_mask=Z.hash_size-1,Z.hash_shift=~~((Z.hash_bits+O-1)/O),Z.window=new n.Buf8(2*Z.w_size),Z.head=new n.Buf16(Z.hash_size),Z.prev=new n.Buf16(Z.w_size),Z.lit_bufsize=1<<b+6,Z.pending_buf_size=4*Z.lit_bufsize,Z.pending_buf=new n.Buf8(Z.pending_buf_size),Z.d_buf=1*Z.lit_bufsize,Z.l_buf=3*Z.lit_bufsize,Z.level=j,Z.strategy=E,Z.method=T,nt(e)}i=[new W(0,0,0,0,function(e,j){var T=65535;for(T>e.pending_buf_size-5&&(T=e.pending_buf_size-5);;){if(e.lookahead<=1){if(ht(e),e.lookahead===0&&j===c)return a;if(e.lookahead===0)break}e.strstart+=e.lookahead,e.lookahead=0;var v=e.block_start+T;if((e.strstart===0||e.strstart>=v)&&(e.lookahead=e.strstart-v,e.strstart=v,A(e,!1),e.strm.avail_out===0)||e.strstart-e.block_start>=e.w_size-Q&&(A(e,!1),e.strm.avail_out===0))return a}return e.insert=0,j===m?(A(e,!0),e.strm.avail_out===0?R:L):(e.strstart>e.block_start&&(A(e,!1),e.strm.avail_out),a)}),new W(4,4,8,4,mt),new W(4,5,16,8,mt),new W(4,6,32,32,mt),new W(4,4,16,16,ot),new W(8,16,32,32,ot),new W(8,16,128,128,ot),new W(8,32,128,256,ot),new W(32,128,258,1024,ot),new W(32,258,258,4096,ot)],l.deflateInit=function(e,j){return lt(e,j,g,15,8,0)},l.deflateInit2=lt,l.deflateReset=nt,l.deflateResetKeep=ut,l.deflateSetHeader=function(e,j){return e&&e.state?e.state.wrap!==2?f:(e.state.gzhead=j,p):f},l.deflate=function(e,j){var T,v,b,E;if(!e||!e.state||5<j||j<0)return e?et(e,f):f;if(v=e.state,!e.output||!e.input&&e.avail_in!==0||v.status===666&&j!==m)return et(e,e.avail_out===0?-5:f);if(v.strm=e,T=v.last_flush,v.last_flush=j,v.status===k)if(v.wrap===2)e.adler=0,rt(v,31),rt(v,139),rt(v,8),v.gzhead?(rt(v,(v.gzhead.text?1:0)+(v.gzhead.hcrc?2:0)+(v.gzhead.extra?4:0)+(v.gzhead.name?8:0)+(v.gzhead.comment?16:0)),rt(v,255&v.gzhead.time),rt(v,v.gzhead.time>>8&255),rt(v,v.gzhead.time>>16&255),rt(v,v.gzhead.time>>24&255),rt(v,v.level===9?2:2<=v.strategy||v.level<2?4:0),rt(v,255&v.gzhead.os),v.gzhead.extra&&v.gzhead.extra.length&&(rt(v,255&v.gzhead.extra.length),rt(v,v.gzhead.extra.length>>8&255)),v.gzhead.hcrc&&(e.adler=w(e.adler,v.pending_buf,v.pending,0)),v.gzindex=0,v.status=69):(rt(v,0),rt(v,0),rt(v,0),rt(v,0),rt(v,0),rt(v,v.level===9?2:2<=v.strategy||v.level<2?4:0),rt(v,3),v.status=F);else{var U=g+(v.w_bits-8<<4)<<8;U|=(2<=v.strategy||v.level<2?0:v.level<6?1:v.level===6?2:3)<<6,v.strstart!==0&&(U|=32),U+=31-U%31,v.status=F,J(v,U),v.strstart!==0&&(J(v,e.adler>>>16),J(v,65535&e.adler)),e.adler=1}if(v.status===69)if(v.gzhead.extra){for(b=v.pending;v.gzindex<(65535&v.gzhead.extra.length)&&(v.pending!==v.pending_buf_size||(v.gzhead.hcrc&&v.pending>b&&(e.adler=w(e.adler,v.pending_buf,v.pending-b,b)),M(e),b=v.pending,v.pending!==v.pending_buf_size));)rt(v,255&v.gzhead.extra[v.gzindex]),v.gzindex++;v.gzhead.hcrc&&v.pending>b&&(e.adler=w(e.adler,v.pending_buf,v.pending-b,b)),v.gzindex===v.gzhead.extra.length&&(v.gzindex=0,v.status=73)}else v.status=73;if(v.status===73)if(v.gzhead.name){b=v.pending;do{if(v.pending===v.pending_buf_size&&(v.gzhead.hcrc&&v.pending>b&&(e.adler=w(e.adler,v.pending_buf,v.pending-b,b)),M(e),b=v.pending,v.pending===v.pending_buf_size)){E=1;break}E=v.gzindex<v.gzhead.name.length?255&v.gzhead.name.charCodeAt(v.gzindex++):0,rt(v,E)}while(E!==0);v.gzhead.hcrc&&v.pending>b&&(e.adler=w(e.adler,v.pending_buf,v.pending-b,b)),E===0&&(v.gzindex=0,v.status=91)}else v.status=91;if(v.status===91)if(v.gzhead.comment){b=v.pending;do{if(v.pending===v.pending_buf_size&&(v.gzhead.hcrc&&v.pending>b&&(e.adler=w(e.adler,v.pending_buf,v.pending-b,b)),M(e),b=v.pending,v.pending===v.pending_buf_size)){E=1;break}E=v.gzindex<v.gzhead.comment.length?255&v.gzhead.comment.charCodeAt(v.gzindex++):0,rt(v,E)}while(E!==0);v.gzhead.hcrc&&v.pending>b&&(e.adler=w(e.adler,v.pending_buf,v.pending-b,b)),E===0&&(v.status=103)}else v.status=103;if(v.status===103&&(v.gzhead.hcrc?(v.pending+2>v.pending_buf_size&&M(e),v.pending+2<=v.pending_buf_size&&(rt(v,255&e.adler),rt(v,e.adler>>8&255),e.adler=0,v.status=F)):v.status=F),v.pending!==0){if(M(e),e.avail_out===0)return v.last_flush=-1,p}else if(e.avail_in===0&&V(j)<=V(T)&&j!==m)return et(e,-5);if(v.status===666&&e.avail_in!==0)return et(e,-5);if(e.avail_in!==0||v.lookahead!==0||j!==c&&v.status!==666){var Z=v.strategy===2?(function(I,H){for(var it;;){if(I.lookahead===0&&(ht(I),I.lookahead===0)){if(H===c)return a;break}if(I.match_length=0,it=r._tr_tally(I,0,I.window[I.strstart]),I.lookahead--,I.strstart++,it&&(A(I,!1),I.strm.avail_out===0))return a}return I.insert=0,H===m?(A(I,!0),I.strm.avail_out===0?R:L):I.last_lit&&(A(I,!1),I.strm.avail_out===0)?a:C})(v,j):v.strategy===3?(function(I,H){for(var it,G,st,ct,pt=I.window;;){if(I.lookahead<=$){if(ht(I),I.lookahead<=$&&H===c)return a;if(I.lookahead===0)break}if(I.match_length=0,I.lookahead>=O&&0<I.strstart&&(G=pt[st=I.strstart-1])===pt[++st]&&G===pt[++st]&&G===pt[++st]){ct=I.strstart+$;do;while(G===pt[++st]&&G===pt[++st]&&G===pt[++st]&&G===pt[++st]&&G===pt[++st]&&G===pt[++st]&&G===pt[++st]&&G===pt[++st]&&st<ct);I.match_length=$-(ct-st),I.match_length>I.lookahead&&(I.match_length=I.lookahead)}if(I.match_length>=O?(it=r._tr_tally(I,1,I.match_length-O),I.lookahead-=I.match_length,I.strstart+=I.match_length,I.match_length=0):(it=r._tr_tally(I,0,I.window[I.strstart]),I.lookahead--,I.strstart++),it&&(A(I,!1),I.strm.avail_out===0))return a}return I.insert=0,H===m?(A(I,!0),I.strm.avail_out===0?R:L):I.last_lit&&(A(I,!1),I.strm.avail_out===0)?a:C})(v,j):i[v.level].func(v,j);if(Z!==R&&Z!==L||(v.status=666),Z===a||Z===R)return e.avail_out===0&&(v.last_flush=-1),p;if(Z===C&&(j===1?r._tr_align(v):j!==5&&(r._tr_stored_block(v,0,0,!1),j===3&&(tt(v.head),v.lookahead===0&&(v.strstart=0,v.block_start=0,v.insert=0))),M(e),e.avail_out===0))return v.last_flush=-1,p}return j!==m?p:v.wrap<=0?1:(v.wrap===2?(rt(v,255&e.adler),rt(v,e.adler>>8&255),rt(v,e.adler>>16&255),rt(v,e.adler>>24&255),rt(v,255&e.total_in),rt(v,e.total_in>>8&255),rt(v,e.total_in>>16&255),rt(v,e.total_in>>24&255)):(J(v,e.adler>>>16),J(v,65535&e.adler)),M(e),0<v.wrap&&(v.wrap=-v.wrap),v.pending!==0?p:1)},l.deflateEnd=function(e){var j;return e&&e.state?(j=e.state.status)!==k&&j!==69&&j!==73&&j!==91&&j!==103&&j!==F&&j!==666?et(e,f):(e.state=null,j===F?et(e,-3):p):f},l.deflateSetDictionary=function(e,j){var T,v,b,E,U,Z,I,H,it=j.length;if(!e||!e.state||(E=(T=e.state).wrap)===2||E===1&&T.status!==k||T.lookahead)return f;for(E===1&&(e.adler=o(e.adler,j,it,0)),T.wrap=0,it>=T.w_size&&(E===0&&(tt(T.head),T.strstart=0,T.block_start=0,T.insert=0),H=new n.Buf8(T.w_size),n.arraySet(H,j,it-T.w_size,T.w_size,0),j=H,it=T.w_size),U=e.avail_in,Z=e.next_in,I=e.input,e.avail_in=it,e.next_in=0,e.input=j,ht(T);T.lookahead>=O;){for(v=T.strstart,b=T.lookahead-(O-1);T.ins_h=(T.ins_h<<T.hash_shift^T.window[v+O-1])&T.hash_mask,T.prev[v&T.w_mask]=T.head[T.ins_h],T.head[T.ins_h]=v,v++,--b;);T.strstart=v,T.lookahead=O-1,ht(T)}return T.strstart+=T.lookahead,T.block_start=T.strstart,T.insert=T.lookahead,T.lookahead=0,T.match_length=T.prev_length=O-1,T.match_available=0,e.next_in=Z,e.input=I,e.avail_in=U,T.wrap=E,p},l.deflateInfo="pako deflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./messages":51,"./trees":52}],47:[function(t,h,l){"use strict";h.exports=function(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}},{}],48:[function(t,h,l){"use strict";h.exports=function(i,n){var r,o,w,x,c,m,p,f,s,d,u,g,y,z,S,B,N,P,O,$,Q,k,F,a,C;r=i.state,o=i.next_in,a=i.input,w=o+(i.avail_in-5),x=i.next_out,C=i.output,c=x-(n-i.avail_out),m=x+(i.avail_out-257),p=r.dmax,f=r.wsize,s=r.whave,d=r.wnext,u=r.window,g=r.hold,y=r.bits,z=r.lencode,S=r.distcode,B=(1<<r.lenbits)-1,N=(1<<r.distbits)-1;t:do{y<15&&(g+=a[o++]<<y,y+=8,g+=a[o++]<<y,y+=8),P=z[g&B];e:for(;;){if(g>>>=O=P>>>24,y-=O,(O=P>>>16&255)===0)C[x++]=65535&P;else{if(!(16&O)){if((64&O)==0){P=z[(65535&P)+(g&(1<<O)-1)];continue e}if(32&O){r.mode=12;break t}i.msg="invalid literal/length code",r.mode=30;break t}$=65535&P,(O&=15)&&(y<O&&(g+=a[o++]<<y,y+=8),$+=g&(1<<O)-1,g>>>=O,y-=O),y<15&&(g+=a[o++]<<y,y+=8,g+=a[o++]<<y,y+=8),P=S[g&N];r:for(;;){if(g>>>=O=P>>>24,y-=O,!(16&(O=P>>>16&255))){if((64&O)==0){P=S[(65535&P)+(g&(1<<O)-1)];continue r}i.msg="invalid distance code",r.mode=30;break t}if(Q=65535&P,y<(O&=15)&&(g+=a[o++]<<y,(y+=8)<O&&(g+=a[o++]<<y,y+=8)),p<(Q+=g&(1<<O)-1)){i.msg="invalid distance too far back",r.mode=30;break t}if(g>>>=O,y-=O,(O=x-c)<Q){if(s<(O=Q-O)&&r.sane){i.msg="invalid distance too far back",r.mode=30;break t}if(F=u,(k=0)===d){if(k+=f-O,O<$){for($-=O;C[x++]=u[k++],--O;);k=x-Q,F=C}}else if(d<O){if(k+=f+d-O,(O-=d)<$){for($-=O;C[x++]=u[k++],--O;);if(k=0,d<$){for($-=O=d;C[x++]=u[k++],--O;);k=x-Q,F=C}}}else if(k+=d-O,O<$){for($-=O;C[x++]=u[k++],--O;);k=x-Q,F=C}for(;2<$;)C[x++]=F[k++],C[x++]=F[k++],C[x++]=F[k++],$-=3;$&&(C[x++]=F[k++],1<$&&(C[x++]=F[k++]))}else{for(k=x-Q;C[x++]=C[k++],C[x++]=C[k++],C[x++]=C[k++],2<($-=3););$&&(C[x++]=C[k++],1<$&&(C[x++]=C[k++]))}break}}break}}while(o<w&&x<m);o-=$=y>>3,g&=(1<<(y-=$<<3))-1,i.next_in=o,i.next_out=x,i.avail_in=o<w?w-o+5:5-(o-w),i.avail_out=x<m?m-x+257:257-(x-m),r.hold=g,r.bits=y}},{}],49:[function(t,h,l){"use strict";var i=t("../utils/common"),n=t("./adler32"),r=t("./crc32"),o=t("./inffast"),w=t("./inftrees"),x=1,c=2,m=0,p=-2,f=1,s=852,d=592;function u(k){return(k>>>24&255)+(k>>>8&65280)+((65280&k)<<8)+((255&k)<<24)}function g(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new i.Buf16(320),this.work=new i.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function y(k){var F;return k&&k.state?(F=k.state,k.total_in=k.total_out=F.total=0,k.msg="",F.wrap&&(k.adler=1&F.wrap),F.mode=f,F.last=0,F.havedict=0,F.dmax=32768,F.head=null,F.hold=0,F.bits=0,F.lencode=F.lendyn=new i.Buf32(s),F.distcode=F.distdyn=new i.Buf32(d),F.sane=1,F.back=-1,m):p}function z(k){var F;return k&&k.state?((F=k.state).wsize=0,F.whave=0,F.wnext=0,y(k)):p}function S(k,F){var a,C;return k&&k.state?(C=k.state,F<0?(a=0,F=-F):(a=1+(F>>4),F<48&&(F&=15)),F&&(F<8||15<F)?p:(C.window!==null&&C.wbits!==F&&(C.window=null),C.wrap=a,C.wbits=F,z(k))):p}function B(k,F){var a,C;return k?(C=new g,(k.state=C).window=null,(a=S(k,F))!==m&&(k.state=null),a):p}var N,P,O=!0;function $(k){if(O){var F;for(N=new i.Buf32(512),P=new i.Buf32(32),F=0;F<144;)k.lens[F++]=8;for(;F<256;)k.lens[F++]=9;for(;F<280;)k.lens[F++]=7;for(;F<288;)k.lens[F++]=8;for(w(x,k.lens,0,288,N,0,k.work,{bits:9}),F=0;F<32;)k.lens[F++]=5;w(c,k.lens,0,32,P,0,k.work,{bits:5}),O=!1}k.lencode=N,k.lenbits=9,k.distcode=P,k.distbits=5}function Q(k,F,a,C){var R,L=k.state;return L.window===null&&(L.wsize=1<<L.wbits,L.wnext=0,L.whave=0,L.window=new i.Buf8(L.wsize)),C>=L.wsize?(i.arraySet(L.window,F,a-L.wsize,L.wsize,0),L.wnext=0,L.whave=L.wsize):(C<(R=L.wsize-L.wnext)&&(R=C),i.arraySet(L.window,F,a-C,R,L.wnext),(C-=R)?(i.arraySet(L.window,F,a-C,C,0),L.wnext=C,L.whave=L.wsize):(L.wnext+=R,L.wnext===L.wsize&&(L.wnext=0),L.whave<L.wsize&&(L.whave+=R))),0}l.inflateReset=z,l.inflateReset2=S,l.inflateResetKeep=y,l.inflateInit=function(k){return B(k,15)},l.inflateInit2=B,l.inflate=function(k,F){var a,C,R,L,et,V,tt,M,A,rt,J,K,ht,mt,ot,W,ft,ut,nt,lt,e,j,T,v,b=0,E=new i.Buf8(4),U=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!k||!k.state||!k.output||!k.input&&k.avail_in!==0)return p;(a=k.state).mode===12&&(a.mode=13),et=k.next_out,R=k.output,tt=k.avail_out,L=k.next_in,C=k.input,V=k.avail_in,M=a.hold,A=a.bits,rt=V,J=tt,j=m;t:for(;;)switch(a.mode){case f:if(a.wrap===0){a.mode=13;break}for(;A<16;){if(V===0)break t;V--,M+=C[L++]<<A,A+=8}if(2&a.wrap&&M===35615){E[a.check=0]=255&M,E[1]=M>>>8&255,a.check=r(a.check,E,2,0),A=M=0,a.mode=2;break}if(a.flags=0,a.head&&(a.head.done=!1),!(1&a.wrap)||(((255&M)<<8)+(M>>8))%31){k.msg="incorrect header check",a.mode=30;break}if((15&M)!=8){k.msg="unknown compression method",a.mode=30;break}if(A-=4,e=8+(15&(M>>>=4)),a.wbits===0)a.wbits=e;else if(e>a.wbits){k.msg="invalid window size",a.mode=30;break}a.dmax=1<<e,k.adler=a.check=1,a.mode=512&M?10:12,A=M=0;break;case 2:for(;A<16;){if(V===0)break t;V--,M+=C[L++]<<A,A+=8}if(a.flags=M,(255&a.flags)!=8){k.msg="unknown compression method",a.mode=30;break}if(57344&a.flags){k.msg="unknown header flags set",a.mode=30;break}a.head&&(a.head.text=M>>8&1),512&a.flags&&(E[0]=255&M,E[1]=M>>>8&255,a.check=r(a.check,E,2,0)),A=M=0,a.mode=3;case 3:for(;A<32;){if(V===0)break t;V--,M+=C[L++]<<A,A+=8}a.head&&(a.head.time=M),512&a.flags&&(E[0]=255&M,E[1]=M>>>8&255,E[2]=M>>>16&255,E[3]=M>>>24&255,a.check=r(a.check,E,4,0)),A=M=0,a.mode=4;case 4:for(;A<16;){if(V===0)break t;V--,M+=C[L++]<<A,A+=8}a.head&&(a.head.xflags=255&M,a.head.os=M>>8),512&a.flags&&(E[0]=255&M,E[1]=M>>>8&255,a.check=r(a.check,E,2,0)),A=M=0,a.mode=5;case 5:if(1024&a.flags){for(;A<16;){if(V===0)break t;V--,M+=C[L++]<<A,A+=8}a.length=M,a.head&&(a.head.extra_len=M),512&a.flags&&(E[0]=255&M,E[1]=M>>>8&255,a.check=r(a.check,E,2,0)),A=M=0}else a.head&&(a.head.extra=null);a.mode=6;case 6:if(1024&a.flags&&(V<(K=a.length)&&(K=V),K&&(a.head&&(e=a.head.extra_len-a.length,a.head.extra||(a.head.extra=new Array(a.head.extra_len)),i.arraySet(a.head.extra,C,L,K,e)),512&a.flags&&(a.check=r(a.check,C,K,L)),V-=K,L+=K,a.length-=K),a.length))break t;a.length=0,a.mode=7;case 7:if(2048&a.flags){if(V===0)break t;for(K=0;e=C[L+K++],a.head&&e&&a.length<65536&&(a.head.name+=String.fromCharCode(e)),e&&K<V;);if(512&a.flags&&(a.check=r(a.check,C,K,L)),V-=K,L+=K,e)break t}else a.head&&(a.head.name=null);a.length=0,a.mode=8;case 8:if(4096&a.flags){if(V===0)break t;for(K=0;e=C[L+K++],a.head&&e&&a.length<65536&&(a.head.comment+=String.fromCharCode(e)),e&&K<V;);if(512&a.flags&&(a.check=r(a.check,C,K,L)),V-=K,L+=K,e)break t}else a.head&&(a.head.comment=null);a.mode=9;case 9:if(512&a.flags){for(;A<16;){if(V===0)break t;V--,M+=C[L++]<<A,A+=8}if(M!==(65535&a.check)){k.msg="header crc mismatch",a.mode=30;break}A=M=0}a.head&&(a.head.hcrc=a.flags>>9&1,a.head.done=!0),k.adler=a.check=0,a.mode=12;break;case 10:for(;A<32;){if(V===0)break t;V--,M+=C[L++]<<A,A+=8}k.adler=a.check=u(M),A=M=0,a.mode=11;case 11:if(a.havedict===0)return k.next_out=et,k.avail_out=tt,k.next_in=L,k.avail_in=V,a.hold=M,a.bits=A,2;k.adler=a.check=1,a.mode=12;case 12:if(F===5||F===6)break t;case 13:if(a.last){M>>>=7&A,A-=7&A,a.mode=27;break}for(;A<3;){if(V===0)break t;V--,M+=C[L++]<<A,A+=8}switch(a.last=1&M,A-=1,3&(M>>>=1)){case 0:a.mode=14;break;case 1:if($(a),a.mode=20,F!==6)break;M>>>=2,A-=2;break t;case 2:a.mode=17;break;case 3:k.msg="invalid block type",a.mode=30}M>>>=2,A-=2;break;case 14:for(M>>>=7&A,A-=7&A;A<32;){if(V===0)break t;V--,M+=C[L++]<<A,A+=8}if((65535&M)!=(M>>>16^65535)){k.msg="invalid stored block lengths",a.mode=30;break}if(a.length=65535&M,A=M=0,a.mode=15,F===6)break t;case 15:a.mode=16;case 16:if(K=a.length){if(V<K&&(K=V),tt<K&&(K=tt),K===0)break t;i.arraySet(R,C,L,K,et),V-=K,L+=K,tt-=K,et+=K,a.length-=K;break}a.mode=12;break;case 17:for(;A<14;){if(V===0)break t;V--,M+=C[L++]<<A,A+=8}if(a.nlen=257+(31&M),M>>>=5,A-=5,a.ndist=1+(31&M),M>>>=5,A-=5,a.ncode=4+(15&M),M>>>=4,A-=4,286<a.nlen||30<a.ndist){k.msg="too many length or distance symbols",a.mode=30;break}a.have=0,a.mode=18;case 18:for(;a.have<a.ncode;){for(;A<3;){if(V===0)break t;V--,M+=C[L++]<<A,A+=8}a.lens[U[a.have++]]=7&M,M>>>=3,A-=3}for(;a.have<19;)a.lens[U[a.have++]]=0;if(a.lencode=a.lendyn,a.lenbits=7,T={bits:a.lenbits},j=w(0,a.lens,0,19,a.lencode,0,a.work,T),a.lenbits=T.bits,j){k.msg="invalid code lengths set",a.mode=30;break}a.have=0,a.mode=19;case 19:for(;a.have<a.nlen+a.ndist;){for(;W=(b=a.lencode[M&(1<<a.lenbits)-1])>>>16&255,ft=65535&b,!((ot=b>>>24)<=A);){if(V===0)break t;V--,M+=C[L++]<<A,A+=8}if(ft<16)M>>>=ot,A-=ot,a.lens[a.have++]=ft;else{if(ft===16){for(v=ot+2;A<v;){if(V===0)break t;V--,M+=C[L++]<<A,A+=8}if(M>>>=ot,A-=ot,a.have===0){k.msg="invalid bit length repeat",a.mode=30;break}e=a.lens[a.have-1],K=3+(3&M),M>>>=2,A-=2}else if(ft===17){for(v=ot+3;A<v;){if(V===0)break t;V--,M+=C[L++]<<A,A+=8}A-=ot,e=0,K=3+(7&(M>>>=ot)),M>>>=3,A-=3}else{for(v=ot+7;A<v;){if(V===0)break t;V--,M+=C[L++]<<A,A+=8}A-=ot,e=0,K=11+(127&(M>>>=ot)),M>>>=7,A-=7}if(a.have+K>a.nlen+a.ndist){k.msg="invalid bit length repeat",a.mode=30;break}for(;K--;)a.lens[a.have++]=e}}if(a.mode===30)break;if(a.lens[256]===0){k.msg="invalid code -- missing end-of-block",a.mode=30;break}if(a.lenbits=9,T={bits:a.lenbits},j=w(x,a.lens,0,a.nlen,a.lencode,0,a.work,T),a.lenbits=T.bits,j){k.msg="invalid literal/lengths set",a.mode=30;break}if(a.distbits=6,a.distcode=a.distdyn,T={bits:a.distbits},j=w(c,a.lens,a.nlen,a.ndist,a.distcode,0,a.work,T),a.distbits=T.bits,j){k.msg="invalid distances set",a.mode=30;break}if(a.mode=20,F===6)break t;case 20:a.mode=21;case 21:if(6<=V&&258<=tt){k.next_out=et,k.avail_out=tt,k.next_in=L,k.avail_in=V,a.hold=M,a.bits=A,o(k,J),et=k.next_out,R=k.output,tt=k.avail_out,L=k.next_in,C=k.input,V=k.avail_in,M=a.hold,A=a.bits,a.mode===12&&(a.back=-1);break}for(a.back=0;W=(b=a.lencode[M&(1<<a.lenbits)-1])>>>16&255,ft=65535&b,!((ot=b>>>24)<=A);){if(V===0)break t;V--,M+=C[L++]<<A,A+=8}if(W&&(240&W)==0){for(ut=ot,nt=W,lt=ft;W=(b=a.lencode[lt+((M&(1<<ut+nt)-1)>>ut)])>>>16&255,ft=65535&b,!(ut+(ot=b>>>24)<=A);){if(V===0)break t;V--,M+=C[L++]<<A,A+=8}M>>>=ut,A-=ut,a.back+=ut}if(M>>>=ot,A-=ot,a.back+=ot,a.length=ft,W===0){a.mode=26;break}if(32&W){a.back=-1,a.mode=12;break}if(64&W){k.msg="invalid literal/length code",a.mode=30;break}a.extra=15&W,a.mode=22;case 22:if(a.extra){for(v=a.extra;A<v;){if(V===0)break t;V--,M+=C[L++]<<A,A+=8}a.length+=M&(1<<a.extra)-1,M>>>=a.extra,A-=a.extra,a.back+=a.extra}a.was=a.length,a.mode=23;case 23:for(;W=(b=a.distcode[M&(1<<a.distbits)-1])>>>16&255,ft=65535&b,!((ot=b>>>24)<=A);){if(V===0)break t;V--,M+=C[L++]<<A,A+=8}if((240&W)==0){for(ut=ot,nt=W,lt=ft;W=(b=a.distcode[lt+((M&(1<<ut+nt)-1)>>ut)])>>>16&255,ft=65535&b,!(ut+(ot=b>>>24)<=A);){if(V===0)break t;V--,M+=C[L++]<<A,A+=8}M>>>=ut,A-=ut,a.back+=ut}if(M>>>=ot,A-=ot,a.back+=ot,64&W){k.msg="invalid distance code",a.mode=30;break}a.offset=ft,a.extra=15&W,a.mode=24;case 24:if(a.extra){for(v=a.extra;A<v;){if(V===0)break t;V--,M+=C[L++]<<A,A+=8}a.offset+=M&(1<<a.extra)-1,M>>>=a.extra,A-=a.extra,a.back+=a.extra}if(a.offset>a.dmax){k.msg="invalid distance too far back",a.mode=30;break}a.mode=25;case 25:if(tt===0)break t;if(K=J-tt,a.offset>K){if((K=a.offset-K)>a.whave&&a.sane){k.msg="invalid distance too far back",a.mode=30;break}ht=K>a.wnext?(K-=a.wnext,a.wsize-K):a.wnext-K,K>a.length&&(K=a.length),mt=a.window}else mt=R,ht=et-a.offset,K=a.length;for(tt<K&&(K=tt),tt-=K,a.length-=K;R[et++]=mt[ht++],--K;);a.length===0&&(a.mode=21);break;case 26:if(tt===0)break t;R[et++]=a.length,tt--,a.mode=21;break;case 27:if(a.wrap){for(;A<32;){if(V===0)break t;V--,M|=C[L++]<<A,A+=8}if(J-=tt,k.total_out+=J,a.total+=J,J&&(k.adler=a.check=a.flags?r(a.check,R,J,et-J):n(a.check,R,J,et-J)),J=tt,(a.flags?M:u(M))!==a.check){k.msg="incorrect data check",a.mode=30;break}A=M=0}a.mode=28;case 28:if(a.wrap&&a.flags){for(;A<32;){if(V===0)break t;V--,M+=C[L++]<<A,A+=8}if(M!==(4294967295&a.total)){k.msg="incorrect length check",a.mode=30;break}A=M=0}a.mode=29;case 29:j=1;break t;case 30:j=-3;break t;case 31:return-4;case 32:default:return p}return k.next_out=et,k.avail_out=tt,k.next_in=L,k.avail_in=V,a.hold=M,a.bits=A,(a.wsize||J!==k.avail_out&&a.mode<30&&(a.mode<27||F!==4))&&Q(k,k.output,k.next_out,J-k.avail_out)?(a.mode=31,-4):(rt-=k.avail_in,J-=k.avail_out,k.total_in+=rt,k.total_out+=J,a.total+=J,a.wrap&&J&&(k.adler=a.check=a.flags?r(a.check,R,J,k.next_out-J):n(a.check,R,J,k.next_out-J)),k.data_type=a.bits+(a.last?64:0)+(a.mode===12?128:0)+(a.mode===20||a.mode===15?256:0),(rt==0&&J===0||F===4)&&j===m&&(j=-5),j)},l.inflateEnd=function(k){if(!k||!k.state)return p;var F=k.state;return F.window&&(F.window=null),k.state=null,m},l.inflateGetHeader=function(k,F){var a;return k&&k.state?(2&(a=k.state).wrap)==0?p:((a.head=F).done=!1,m):p},l.inflateSetDictionary=function(k,F){var a,C=F.length;return k&&k.state?(a=k.state).wrap!==0&&a.mode!==11?p:a.mode===11&&n(1,F,C,0)!==a.check?-3:Q(k,F,C,C)?(a.mode=31,-4):(a.havedict=1,m):p},l.inflateInfo="pako inflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./inffast":48,"./inftrees":50}],50:[function(t,h,l){"use strict";var i=t("../utils/common"),n=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],r=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],o=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],w=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];h.exports=function(x,c,m,p,f,s,d,u){var g,y,z,S,B,N,P,O,$,Q=u.bits,k=0,F=0,a=0,C=0,R=0,L=0,et=0,V=0,tt=0,M=0,A=null,rt=0,J=new i.Buf16(16),K=new i.Buf16(16),ht=null,mt=0;for(k=0;k<=15;k++)J[k]=0;for(F=0;F<p;F++)J[c[m+F]]++;for(R=Q,C=15;1<=C&&J[C]===0;C--);if(C<R&&(R=C),C===0)return f[s++]=20971520,f[s++]=20971520,u.bits=1,0;for(a=1;a<C&&J[a]===0;a++);for(R<a&&(R=a),k=V=1;k<=15;k++)if(V<<=1,(V-=J[k])<0)return-1;if(0<V&&(x===0||C!==1))return-1;for(K[1]=0,k=1;k<15;k++)K[k+1]=K[k]+J[k];for(F=0;F<p;F++)c[m+F]!==0&&(d[K[c[m+F]]++]=F);if(N=x===0?(A=ht=d,19):x===1?(A=n,rt-=257,ht=r,mt-=257,256):(A=o,ht=w,-1),k=a,B=s,et=F=M=0,z=-1,S=(tt=1<<(L=R))-1,x===1&&852<tt||x===2&&592<tt)return 1;for(;;){for(P=k-et,$=d[F]<N?(O=0,d[F]):d[F]>N?(O=ht[mt+d[F]],A[rt+d[F]]):(O=96,0),g=1<<k-et,a=y=1<<L;f[B+(M>>et)+(y-=g)]=P<<24|O<<16|$|0,y!==0;);for(g=1<<k-1;M&g;)g>>=1;if(g!==0?(M&=g-1,M+=g):M=0,F++,--J[k]==0){if(k===C)break;k=c[m+d[F]]}if(R<k&&(M&S)!==z){for(et===0&&(et=R),B+=a,V=1<<(L=k-et);L+et<C&&!((V-=J[L+et])<=0);)L++,V<<=1;if(tt+=1<<L,x===1&&852<tt||x===2&&592<tt)return 1;f[z=M&S]=R<<24|L<<16|B-s|0}}return M!==0&&(f[B+M]=k-et<<24|64<<16|0),u.bits=R,0}},{"../utils/common":41}],51:[function(t,h,l){"use strict";h.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},{}],52:[function(t,h,l){"use strict";var i=t("../utils/common"),n=0,r=1;function o(b){for(var E=b.length;0<=--E;)b[E]=0}var w=0,x=29,c=256,m=c+1+x,p=30,f=19,s=2*m+1,d=15,u=16,g=7,y=256,z=16,S=17,B=18,N=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],P=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],O=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],$=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],Q=new Array(2*(m+2));o(Q);var k=new Array(2*p);o(k);var F=new Array(512);o(F);var a=new Array(256);o(a);var C=new Array(x);o(C);var R,L,et,V=new Array(p);function tt(b,E,U,Z,I){this.static_tree=b,this.extra_bits=E,this.extra_base=U,this.elems=Z,this.max_length=I,this.has_stree=b&&b.length}function M(b,E){this.dyn_tree=b,this.max_code=0,this.stat_desc=E}function A(b){return b<256?F[b]:F[256+(b>>>7)]}function rt(b,E){b.pending_buf[b.pending++]=255&E,b.pending_buf[b.pending++]=E>>>8&255}function J(b,E,U){b.bi_valid>u-U?(b.bi_buf|=E<<b.bi_valid&65535,rt(b,b.bi_buf),b.bi_buf=E>>u-b.bi_valid,b.bi_valid+=U-u):(b.bi_buf|=E<<b.bi_valid&65535,b.bi_valid+=U)}function K(b,E,U){J(b,U[2*E],U[2*E+1])}function ht(b,E){for(var U=0;U|=1&b,b>>>=1,U<<=1,0<--E;);return U>>>1}function mt(b,E,U){var Z,I,H=new Array(d+1),it=0;for(Z=1;Z<=d;Z++)H[Z]=it=it+U[Z-1]<<1;for(I=0;I<=E;I++){var G=b[2*I+1];G!==0&&(b[2*I]=ht(H[G]++,G))}}function ot(b){var E;for(E=0;E<m;E++)b.dyn_ltree[2*E]=0;for(E=0;E<p;E++)b.dyn_dtree[2*E]=0;for(E=0;E<f;E++)b.bl_tree[2*E]=0;b.dyn_ltree[2*y]=1,b.opt_len=b.static_len=0,b.last_lit=b.matches=0}function W(b){8<b.bi_valid?rt(b,b.bi_buf):0<b.bi_valid&&(b.pending_buf[b.pending++]=b.bi_buf),b.bi_buf=0,b.bi_valid=0}function ft(b,E,U,Z){var I=2*E,H=2*U;return b[I]<b[H]||b[I]===b[H]&&Z[E]<=Z[U]}function ut(b,E,U){for(var Z=b.heap[U],I=U<<1;I<=b.heap_len&&(I<b.heap_len&&ft(E,b.heap[I+1],b.heap[I],b.depth)&&I++,!ft(E,Z,b.heap[I],b.depth));)b.heap[U]=b.heap[I],U=I,I<<=1;b.heap[U]=Z}function nt(b,E,U){var Z,I,H,it,G=0;if(b.last_lit!==0)for(;Z=b.pending_buf[b.d_buf+2*G]<<8|b.pending_buf[b.d_buf+2*G+1],I=b.pending_buf[b.l_buf+G],G++,Z===0?K(b,I,E):(K(b,(H=a[I])+c+1,E),(it=N[H])!==0&&J(b,I-=C[H],it),K(b,H=A(--Z),U),(it=P[H])!==0&&J(b,Z-=V[H],it)),G<b.last_lit;);K(b,y,E)}function lt(b,E){var U,Z,I,H=E.dyn_tree,it=E.stat_desc.static_tree,G=E.stat_desc.has_stree,st=E.stat_desc.elems,ct=-1;for(b.heap_len=0,b.heap_max=s,U=0;U<st;U++)H[2*U]!==0?(b.heap[++b.heap_len]=ct=U,b.depth[U]=0):H[2*U+1]=0;for(;b.heap_len<2;)H[2*(I=b.heap[++b.heap_len]=ct<2?++ct:0)]=1,b.depth[I]=0,b.opt_len--,G&&(b.static_len-=it[2*I+1]);for(E.max_code=ct,U=b.heap_len>>1;1<=U;U--)ut(b,H,U);for(I=st;U=b.heap[1],b.heap[1]=b.heap[b.heap_len--],ut(b,H,1),Z=b.heap[1],b.heap[--b.heap_max]=U,b.heap[--b.heap_max]=Z,H[2*I]=H[2*U]+H[2*Z],b.depth[I]=(b.depth[U]>=b.depth[Z]?b.depth[U]:b.depth[Z])+1,H[2*U+1]=H[2*Z+1]=I,b.heap[1]=I++,ut(b,H,1),2<=b.heap_len;);b.heap[--b.heap_max]=b.heap[1],(function(pt,xt){var Tt,_t,Bt,gt,jt,Lt,St=xt.dyn_tree,qt=xt.max_code,se=xt.stat_desc.static_tree,oe=xt.stat_desc.has_stree,Qt=xt.stat_desc.extra_bits,Zt=xt.stat_desc.extra_base,Dt=xt.stat_desc.max_length,D=0;for(gt=0;gt<=d;gt++)pt.bl_count[gt]=0;for(St[2*pt.heap[pt.heap_max]+1]=0,Tt=pt.heap_max+1;Tt<s;Tt++)Dt<(gt=St[2*St[2*(_t=pt.heap[Tt])+1]+1]+1)&&(gt=Dt,D++),St[2*_t+1]=gt,qt<_t||(pt.bl_count[gt]++,jt=0,Zt<=_t&&(jt=Qt[_t-Zt]),Lt=St[2*_t],pt.opt_len+=Lt*(gt+jt),oe&&(pt.static_len+=Lt*(se[2*_t+1]+jt)));if(D!==0){do{for(gt=Dt-1;pt.bl_count[gt]===0;)gt--;pt.bl_count[gt]--,pt.bl_count[gt+1]+=2,pt.bl_count[Dt]--,D-=2}while(0<D);for(gt=Dt;gt!==0;gt--)for(_t=pt.bl_count[gt];_t!==0;)qt<(Bt=pt.heap[--Tt])||(St[2*Bt+1]!==gt&&(pt.opt_len+=(gt-St[2*Bt+1])*St[2*Bt],St[2*Bt+1]=gt),_t--)}})(b,E),mt(H,ct,b.bl_count)}function e(b,E,U){var Z,I,H=-1,it=E[1],G=0,st=7,ct=4;for(it===0&&(st=138,ct=3),E[2*(U+1)+1]=65535,Z=0;Z<=U;Z++)I=it,it=E[2*(Z+1)+1],++G<st&&I===it||(G<ct?b.bl_tree[2*I]+=G:I!==0?(I!==H&&b.bl_tree[2*I]++,b.bl_tree[2*z]++):G<=10?b.bl_tree[2*S]++:b.bl_tree[2*B]++,H=I,ct=(G=0)===it?(st=138,3):I===it?(st=6,3):(st=7,4))}function j(b,E,U){var Z,I,H=-1,it=E[1],G=0,st=7,ct=4;for(it===0&&(st=138,ct=3),Z=0;Z<=U;Z++)if(I=it,it=E[2*(Z+1)+1],!(++G<st&&I===it)){if(G<ct)for(;K(b,I,b.bl_tree),--G!=0;);else I!==0?(I!==H&&(K(b,I,b.bl_tree),G--),K(b,z,b.bl_tree),J(b,G-3,2)):G<=10?(K(b,S,b.bl_tree),J(b,G-3,3)):(K(b,B,b.bl_tree),J(b,G-11,7));H=I,ct=(G=0)===it?(st=138,3):I===it?(st=6,3):(st=7,4)}}o(V);var T=!1;function v(b,E,U,Z){J(b,(w<<1)+(Z?1:0),3),(function(I,H,it,G){W(I),G&&(rt(I,it),rt(I,~it)),i.arraySet(I.pending_buf,I.window,H,it,I.pending),I.pending+=it})(b,E,U,!0)}l._tr_init=function(b){T||((function(){var E,U,Z,I,H,it=new Array(d+1);for(I=Z=0;I<x-1;I++)for(C[I]=Z,E=0;E<1<<N[I];E++)a[Z++]=I;for(a[Z-1]=I,I=H=0;I<16;I++)for(V[I]=H,E=0;E<1<<P[I];E++)F[H++]=I;for(H>>=7;I<p;I++)for(V[I]=H<<7,E=0;E<1<<P[I]-7;E++)F[256+H++]=I;for(U=0;U<=d;U++)it[U]=0;for(E=0;E<=143;)Q[2*E+1]=8,E++,it[8]++;for(;E<=255;)Q[2*E+1]=9,E++,it[9]++;for(;E<=279;)Q[2*E+1]=7,E++,it[7]++;for(;E<=287;)Q[2*E+1]=8,E++,it[8]++;for(mt(Q,m+1,it),E=0;E<p;E++)k[2*E+1]=5,k[2*E]=ht(E,5);R=new tt(Q,N,c+1,m,d),L=new tt(k,P,0,p,d),et=new tt(new Array(0),O,0,f,g)})(),T=!0),b.l_desc=new M(b.dyn_ltree,R),b.d_desc=new M(b.dyn_dtree,L),b.bl_desc=new M(b.bl_tree,et),b.bi_buf=0,b.bi_valid=0,ot(b)},l._tr_stored_block=v,l._tr_flush_block=function(b,E,U,Z){var I,H,it=0;0<b.level?(b.strm.data_type===2&&(b.strm.data_type=(function(G){var st,ct=4093624447;for(st=0;st<=31;st++,ct>>>=1)if(1&ct&&G.dyn_ltree[2*st]!==0)return n;if(G.dyn_ltree[18]!==0||G.dyn_ltree[20]!==0||G.dyn_ltree[26]!==0)return r;for(st=32;st<c;st++)if(G.dyn_ltree[2*st]!==0)return r;return n})(b)),lt(b,b.l_desc),lt(b,b.d_desc),it=(function(G){var st;for(e(G,G.dyn_ltree,G.l_desc.max_code),e(G,G.dyn_dtree,G.d_desc.max_code),lt(G,G.bl_desc),st=f-1;3<=st&&G.bl_tree[2*$[st]+1]===0;st--);return G.opt_len+=3*(st+1)+5+5+4,st})(b),I=b.opt_len+3+7>>>3,(H=b.static_len+3+7>>>3)<=I&&(I=H)):I=H=U+5,U+4<=I&&E!==-1?v(b,E,U,Z):b.strategy===4||H===I?(J(b,2+(Z?1:0),3),nt(b,Q,k)):(J(b,4+(Z?1:0),3),(function(G,st,ct,pt){var xt;for(J(G,st-257,5),J(G,ct-1,5),J(G,pt-4,4),xt=0;xt<pt;xt++)J(G,G.bl_tree[2*$[xt]+1],3);j(G,G.dyn_ltree,st-1),j(G,G.dyn_dtree,ct-1)})(b,b.l_desc.max_code+1,b.d_desc.max_code+1,it+1),nt(b,b.dyn_ltree,b.dyn_dtree)),ot(b),Z&&W(b)},l._tr_tally=function(b,E,U){return b.pending_buf[b.d_buf+2*b.last_lit]=E>>>8&255,b.pending_buf[b.d_buf+2*b.last_lit+1]=255&E,b.pending_buf[b.l_buf+b.last_lit]=255&U,b.last_lit++,E===0?b.dyn_ltree[2*U]++:(b.matches++,E--,b.dyn_ltree[2*(a[U]+c+1)]++,b.dyn_dtree[2*A(E)]++),b.last_lit===b.lit_bufsize-1},l._tr_align=function(b){J(b,2,3),K(b,y,Q),(function(E){E.bi_valid===16?(rt(E,E.bi_buf),E.bi_buf=0,E.bi_valid=0):8<=E.bi_valid&&(E.pending_buf[E.pending++]=255&E.bi_buf,E.bi_buf>>=8,E.bi_valid-=8)})(b)}},{"../utils/common":41}],53:[function(t,h,l){"use strict";h.exports=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}},{}],54:[function(t,h,l){(function(i){(function(n,r){"use strict";if(!n.setImmediate){var o,w,x,c,m=1,p={},f=!1,s=n.document,d=Object.getPrototypeOf&&Object.getPrototypeOf(n);d=d&&d.setTimeout?d:n,o={}.toString.call(n.process)==="[object process]"?function(z){process.nextTick(function(){g(z)})}:(function(){if(n.postMessage&&!n.importScripts){var z=!0,S=n.onmessage;return n.onmessage=function(){z=!1},n.postMessage("","*"),n.onmessage=S,z}})()?(c="setImmediate$"+Math.random()+"$",n.addEventListener?n.addEventListener("message",y,!1):n.attachEvent("onmessage",y),function(z){n.postMessage(c+z,"*")}):n.MessageChannel?((x=new MessageChannel).port1.onmessage=function(z){g(z.data)},function(z){x.port2.postMessage(z)}):s&&"onreadystatechange"in s.createElement("script")?(w=s.documentElement,function(z){var S=s.createElement("script");S.onreadystatechange=function(){g(z),S.onreadystatechange=null,w.removeChild(S),S=null},w.appendChild(S)}):function(z){setTimeout(g,0,z)},d.setImmediate=function(z){typeof z!="function"&&(z=new Function(""+z));for(var S=new Array(arguments.length-1),B=0;B<S.length;B++)S[B]=arguments[B+1];var N={callback:z,args:S};return p[m]=N,o(m),m++},d.clearImmediate=u}function u(z){delete p[z]}function g(z){if(f)setTimeout(g,0,z);else{var S=p[z];if(S){f=!0;try{(function(B){var N=B.callback,P=B.args;switch(P.length){case 0:N();break;case 1:N(P[0]);break;case 2:N(P[0],P[1]);break;case 3:N(P[0],P[1],P[2]);break;default:N.apply(r,P)}})(S)}finally{u(z),f=!1}}}}function y(z){z.source===n&&typeof z.data=="string"&&z.data.indexOf(c)===0&&g(+z.data.slice(c.length))}})(typeof self>"u"?i===void 0?this:i:self)}).call(this,typeof global<"u"?global:typeof self<"u"?self:typeof window<"u"?window:{})},{}]},{},[10])(10)})});var Ft=Object.freeze({pressure:8,temperature:300,depth:1e3,diameter:.08,rate:5e4,roughness:1e-5,angle:90,z:.9}),zt=[["pressure","\u4E95\u53E3\u7EDD\u5BF9\u538B\u529B","MPa",.1,100,.1],["temperature","\u4E95\u53E3\u6E29\u5EA6","K",200,500,1],["depth","\u6CBF\u4E95\u7B52\u957F\u5EA6","m",1,1e4,1],["diameter","\u6CB9\u7BA1\u5185\u5F84","m",.001,1,.001],["rate","\u6807\u51B5\u4EA7\u6C14\u91CF","m\xB3/d",1,1e8,1e3],["roughness","\u7BA1\u58C1\u7C97\u7CD9\u5EA6","m",1e-7,.01,1e-6],["angle","\u4E0E\u6C34\u5E73\u9762\u5939\u89D2","\xB0",0,90,1],["z","\u538B\u7F29\u56E0\u5B50 Z","\u2014",.1,2,.01]],kt=["Orkiszewski","Beggs-Brill"],le=["\u4E95\u6DF1_m","\u538B\u529B_MPa","\u6E29\u5EA6_K","\u6C14\u4F53\u5BC6\u5EA6_kgm3","\u6D41\u901F_ms","\u6469\u963B\u538B\u964D\u68AF\u5EA6_kPam","\u91CD\u529B\u538B\u964D\u68AF\u5EA6_kPam"];function Rt(t){let h={};for(let[l,i,n,r,o]of zt)(typeof t?.[l]!="number"||!Number.isFinite(t[l])||t[l]<r||t[l]>o)&&(h[l]=`${i}\u987B\u4E3A ${r}\uFF5E${o} ${n} \u4E4B\u95F4\u7684\u6709\u6548\u6570\u503C\u3002`);return!h.roughness&&!h.diameter&&t.roughness>=t.diameter&&(h.roughness="\u7BA1\u58C1\u7C97\u7CD9\u5EA6\u5FC5\u987B\u5C0F\u4E8E\u6CB9\u7BA1\u5185\u5F84\u3002"),h}function Ut(t){let h=Object.values(Rt(t))[0];if(h)throw new Error(h)}function It(t,h,l){return t*.018/(l*8.314*h)}function Gt(t,h,l){return t=Math.max(t,1),t<2e3?64/t:.25/Math.log10(h/(3.7*l)+5.74/t**.9)**2}function pe(t){let h=Math.floor(t);return t-h===.5?h%2?h+1:h:Math.round(t)}function _e(t,h="Orkiszewski",l=Math.max(300,pe(t.depth))){if(Ut(t),!kt.includes(h))throw new Error("\u4E0D\u652F\u6301\u7684\u8BA1\u7B97\u6A21\u578B\u3002");if(!Number.isInteger(l)||l<2||l>5e4)throw new Error("\u8BA1\u7B97\u7F51\u683C\u6570\u987B\u4E3A 2\uFF5E50000 \u7684\u6574\u6570\u3002");let i=t.depth/l,n=t.angle*Math.PI/180,r=It(101325,293.15,1)*t.rate/86400,o=Math.PI*t.diameter**2/4,w=h==="Beggs-Brill"?1+.08*Math.sin(n)**2:1,x=t.pressure*1e6,c=0,m=0,p=[];for(let s=0;s<=l;s++){let d=s*i,u=t.temperature+.025*d,g=It(x,u,t.z),y=r/(g*o),z=12e-6*(u/300)**.7,S=Gt(g*y*t.diameter/z,t.roughness,t.diameter)*w,B=g*9.81*Math.sin(n),N=S*g*y**2/(2*t.diameter),P=[d,x/1e6,u,g,y,s===l?p[s-1][5]:N/1e3,s===l?p[s-1][6]:B/1e3];if(!P.every(Number.isFinite))throw new Error("\u5F53\u524D\u53C2\u6570\u5BFC\u81F4\u8BA1\u7B97\u6EA2\u51FA\uFF0C\u8BF7\u8C03\u6574\u5DE5\u51B5\u3002");p.push(P),s<l&&(x+=(B+N)*i,c+=B*i/1e6,m+=N*i/1e6)}let f=Math.max(...p.map(s=>s[4]));return{model:h,params:{...t},steps:l,rows:p,samples:nr(p),bottom:p.at(-1)[1],gravity:c,friction:m,maxVelocity:f}}function nr(t,h=100){if(!(h>0)||!Number.isFinite(h)||t.length<2||t.at(-1)[0]/h>2e4)throw new Error("\u91C7\u6837\u95F4\u9694\u548C\u8BA1\u7B97\u7ED3\u679C\u65E0\u6548\uFF0C\u6700\u591A\u652F\u6301 20001 \u4E2A\u91C7\u6837\u70B9\u3002");let l=t.at(-1)[0],i=[];for(let r=0;r*h<l-Math.max(1,l)*1e-12;r++)i.push(r*h);i.push(l);let n=0;return i.map(r=>{for(;n<t.length-2&&t[n+1][0]<r;)n++;let o=t[n],w=t[n+1],x=(r-o[0])/(w[0]-o[0]);return o.map((c,m)=>m===0?r:c+x*(w[m]-c))})}var Ue=ye(ue(),1);function Pt(t){return[{name:"\u5168\u4E95\u6BB5",end:t.depth,diameter:t.diameter,angle:t.angle,roughness:t.roughness}]}function Et(t,h){if(typeof h!="number"||!Number.isFinite(h)||h<1||h>1e4)throw new Error("\u8BF7\u5148\u5C06\u603B\u4E95\u6DF1\u8BBE\u7F6E\u4E3A 1\uFF5E10000 m \u7684\u6709\u6548\u6570\u503C\u3002");if(!Array.isArray(t)||!t.length||t.length>30)throw new Error("\u4E95\u8EAB\u7ED3\u6784\u987B\u5305\u542B 1\uFF5E30 \u4E2A\u8FDE\u7EED\u4E95\u6BB5\u3002");let l=0;return t.map((i,n)=>{let r=`\u7B2C ${n+1} \u4E95\u6BB5`;for(let w of["end","diameter","angle","roughness"])if(typeof i?.[w]!="number"||!Number.isFinite(i[w]))throw new Error(`${r}\u5B58\u5728\u7A7A\u503C\u6216\u65E0\u6548\u6570\u503C\u3002`);if(i.end-l<.1||i.end>h+1e-8)throw new Error(`${r}\u7EC8\u70B9\u4E95\u6DF1\u987B\u9012\u589E\uFF0C\u6BCF\u6BB5\u81F3\u5C11 0.1 m\uFF0C\u4E14\u4E0D\u8D85\u8FC7\u603B\u4E95\u6DF1\u3002`);if(n===t.length-1&&Math.abs(i.end-h)>1e-8)throw new Error(`\u6700\u540E\u4E95\u6BB5\u987B\u5230\u8FBE\u603B\u4E95\u6DF1 ${h} m\u3002`);if(i.diameter<.001||i.diameter>1)throw new Error(`${r}\u5185\u5F84\u987B\u5728 1\uFF5E1000 mm \u4E4B\u95F4\u3002`);if(i.angle<0||i.angle>90)throw new Error(`${r}\u5939\u89D2\u987B\u5728 0\uFF5E90\xB0 \u4E4B\u95F4\uFF08\u76F8\u5BF9\u6C34\u5E73\u9762\uFF09\u3002`);if(i.roughness<1e-7||i.roughness>.01||i.roughness>=i.diameter)throw new Error(`${r}\u7C97\u7CD9\u5EA6\u987B\u5728 0.0001\uFF5E10 mm \u4E4B\u95F4\u4E14\u5C0F\u4E8E\u5185\u5F84\u3002`);let o={name:String(i.name||r).slice(0,30),end:n===t.length-1?h:i.end,diameter:i.diameter,angle:i.angle,roughness:i.roughness};return l=o.end,o})}function Ct(t,h){return t.findIndex((l,i)=>h<l.end-1e-8||i===t.length-1)}function Se(t){let h=0,l=0;for(let i of t)l+=(i.end-h)*Math.sin(i.angle*Math.PI/180),h=i.end;return l}function ze(t,h,l,i=null){Ut(t);let n=Et(i||Pt(t),t.depth);if(!i||n.length===1){let s=n[0];return{..._e({...t,diameter:s.diameter,angle:s.angle,roughness:s.roughness},h,l),params:{...t},segments:n}}if(!kt.includes(h))throw new Error("\u4E0D\u652F\u6301\u7684\u8BA1\u7B97\u6A21\u578B\u3002");if(!Number.isInteger(l)||l<2||l>5e4)throw new Error("\u8BA1\u7B97\u7F51\u683C\u6570\u987B\u4E3A 2\uFF5E50000 \u7684\u6574\u6570\u3002");let r=It(101325,293.15,1)*t.rate/86400,o=t.pressure*1e6,w=0,x=0,c=0,m=[];function p(s,d){let u=t.temperature+.025*s,g=It(o,u,t.z),y=r/(g*Math.PI*d.diameter**2/4),z=12e-6*(u/300)**.7,S=Math.sin(d.angle*Math.PI/180),B=Gt(g*y*d.diameter/z,d.roughness,d.diameter)*(h==="Beggs-Brill"?1+.08*S**2:1),N=[s,o/1e6,u,g,y,B*g*y**2/(2*d.diameter)/1e3,g*9.81*S/1e3];if(!N.every(Number.isFinite))throw new Error("\u5F53\u524D\u4E95\u8EAB\u7ED3\u6784\u5BFC\u81F4\u8BA1\u7B97\u6EA2\u51FA\uFF0C\u8BF7\u8C03\u6574\u5DE5\u51B5\u3002");return N}for(let s of n){let d=Math.max(1,Math.ceil(l*(s.end-c)/t.depth)),u=(s.end-c)/d;for(let g=0;g<d;g++){let y=p(c+g*u,s);m.push(y),o+=(y[5]+y[6])*1e3*u,w+=y[6]*u/1e3,x+=y[5]*u/1e3}c=s.end}let f=p(t.depth,n.at(-1));return f[5]=m.at(-1)[5],f[6]=m.at(-1)[6],m.push(f),{model:h,params:{...t},segments:n,steps:m.length-1,rows:m,samples:Wt(m,n),bottom:f[1],gravity:w,friction:x,maxVelocity:Math.max(...m.map(s=>s[4]))}}function Wt(t,h,l=100){let i=t.at(-1)[0];if(!(l>0)||!Number.isFinite(l)||i/l>2e4)throw new Error("\u91C7\u6837\u95F4\u9694\u65E0\u6548\u3002");let n=[];for(let o=0;o*l<i-Math.max(1,i)*1e-12;o++)n.push(o*l);n.push(i);let r=0;return n.map(o=>{for(;r<t.length-2&&t[r+1][0]<=o;)r++;let w=t[r],x=t[r+1],c=(o-w[0])/(x[0]-w[0]),m=Ct(h,w[0])!==Ct(h,x[0]);return w.map((p,f)=>f===0?o:m&&f>=4&&c<1?p:p+c*(x[f]-p))})}var Ee=["\u7EC8\u70B9\u4E95\u6DF1_m","\u5185\u5F84_mm","\u5939\u89D2_deg","\u7C97\u7CD9\u5EA6_mm","\u4E95\u6BB5\u540D\u79F0"];function ce(t,h=","){let l=[],i=[],n="",r=!1;for(let o=0;o<t.length;o++){let w=t[o];w==='"'?r&&t[o+1]==='"'?(n+='"',o++):r=!r:!r&&(w===h||w===`
`)?(i.push(n.replace(/\r$/,"")),n="",w===`
`&&(i.some(x=>x.trim())&&l.push(i),i=[])):n+=w}if(r)throw new Error("CSV\u5F15\u53F7\u672A\u95ED\u5408\u3002");return i.push(n.replace(/\r$/,"")),i.some(o=>o.trim())&&l.push(i),l}function Ce(t,h){if(t=t.replace(/^\uFEFF/,"").trim(),t.startsWith("{")||t.startsWith("[")){let n=JSON.parse(t);return Et(Array.isArray(n)?n:n.segments,h)}let[l,...i]=ce(t);if(!l||Ee.some((n,r)=>l[r]?.trim()!==n))throw new Error("CSV\u8868\u5934\u6216\u5355\u4F4D\u4E0D\u5339\u914D\uFF0C\u8BF7\u4F7F\u7528\u672C\u5E94\u7528\u7684\u7ED3\u6784\u6A21\u677F\u3002");return Et(i.map(n=>{if(n.length!==5||n.slice(0,4).some(r=>!r.trim()))throw new Error("CSV\u6BCF\u884C\u987B\u5305\u542B\u56DB\u4E2A\u6570\u503C\u53CA\u4E95\u6BB5\u540D\u79F0\uFF0C\u4E0D\u80FD\u6709\u7A7A\u6570\u503C\u3002");return{end:Number(n[0]),diameter:Number(n[1])/1e3,angle:Number(n[2]),roughness:Number(n[3])/1e3,name:n[4]}}),h)}function he(t){let h=l=>`"${String(l).replaceAll('"','""')}"`;return"\uFEFF"+[Ee,...t.map(l=>[l.end,l.diameter*1e3,l.angle,l.roughness*1e3,l.name])].map(l=>l.map(h).join(",")).join(`\r
`)}var Mt=Math.PI/180,Ae=t=>Math.max(-1,Math.min(1,t)),Ie=t=>Math.abs(t)<1e-10?0:t,ir=["MD_m","Inc_deg","Azi_deg"],ar=t=>String(t).trim().toLowerCase().replace(/[\s_()（）°\[\]【】]/g,""),sr=[["md","mdm","measureddepth","measureddepthm","\u6D4B\u6DF1","\u6D4B\u6DF1m","\u4E95\u6DF1","\u4E95\u6DF1m"],["inc","incdeg","inclination","inclinationdeg","\u4E95\u659C","\u4E95\u659C\u89D2","\u4E95\u659C\u89D2deg","\u4E95\u659C\u89D2\u5EA6"],["azi","azideg","azimuth","azimuthdeg","\u65B9\u4F4D","\u65B9\u4F4D\u89D2","\u65B9\u4F4D\u89D2deg","\u65B9\u4F4D\u89D2\u5EA6"]];function fe(t){if(t&&typeof t=="object"&&t.formula)throw new Error("\u6D4B\u6DF1\u3001\u4E95\u659C\u89D2\u6216\u65B9\u4F4D\u89D2\u5217\u542B\u516C\u5F0F\uFF0C\u8BF7\u5148\u7C98\u8D34\u4E3A\u6570\u503C\u540E\u5BFC\u5165\u3002");if(typeof t=="number")return t;let h=String(t??"").trim();return/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(h)?Number(h):NaN}function te(t){let h=t.filter(n=>n.some(r=>String(r??"").trim()));if(h.length<3||h.length>2002)throw new Error("\u4E95\u659C\u8868\u987B\u542B\u8868\u5934\u53CA2\uFF5E2001\u4E2A\u6D4B\u70B9\u3002");let l=h[0].map(ar),i=sr.map(n=>{let r=l.map((o,w)=>n.includes(o)?w:-1).filter(o=>o>=0);if(r.length!==1)throw new Error("\u987B\u6709\u552F\u4E00\u7684\u6D4B\u6DF1MD(m)\u3001\u4E95\u659C\u89D2Inc(\xB0)\u3001\u65B9\u4F4D\u89D2Azi(\xB0)\u5217\uFF0C\u8BF7\u4F7F\u7528\u4E95\u659C\u6A21\u677F\u3002");return r[0]});return ee(h.slice(1).map(n=>({md:fe(n[i[0]]),inc:fe(n[i[1]]),azi:fe(n[i[2]])})))}function Me(t){if(t=t.replace(/^\uFEFF/,"").trim(),t.startsWith("{")||t.startsWith("[")){let h=JSON.parse(t),l=Array.isArray(h)?h:h.stations;if(!Array.isArray(l)||!l.length)throw new Error("JSON\u987B\u5305\u542Bstations\u6D4B\u70B9\u6570\u7EC4\u3002");let i=Object.keys(l[0]);return te([i,...l.map(n=>i.map(r=>n[r]))])}return te(ce(t,t.split(`
`)[0].includes("	")?"	":","))}function ee(t){if(!Array.isArray(t)||t.length<2||t.length>2001)throw new Error("\u4E95\u659C\u6570\u636E\u987B\u5305\u542B2\uFF5E2001\u4E2A\u6D4B\u70B9\u3002");let h=t.map((l,i)=>{if(!l||["md","inc","azi"].some(n=>typeof l[n]!="number"||!Number.isFinite(l[n])))throw new Error(`\u7B2C${i+1}\u6D4B\u70B9\u5B58\u5728\u7A7A\u503C\u6216\u65E0\u6548\u6570\u503C\u3002`);if(l.md<0||l.md>1e4||i&&l.md-t[i-1].md<.001)throw new Error(`\u7B2C${i+1}\u6D4B\u70B9\u6D4B\u6DF1\u987B\u9012\u589E\u4E14\u95F4\u8DDD\u4E0D\u5C11\u4E8E0.001 m\uFF0C\u6700\u592710000 m\u3002`);if(l.inc<0||l.inc>180||l.azi<0||l.azi>360)throw new Error(`\u7B2C${i+1}\u6D4B\u70B9\u4E95\u659C\u89D2\u987B\u4E3A0\uFF5E180\xB0\uFF0C\u65B9\u4F4D\u89D2\u987B\u4E3A0\uFF5E360\xB0\u3002`);return{md:i===0&&Math.abs(l.md)<1e-8?0:l.md,inc:l.inc,azi:l.azi===360?0:l.azi}});if(h[0].md!==0)throw new Error("\u9996\u6D4B\u70B9\u987B\u4E3A\u4E95\u53E3MD=0 m\uFF1B\u8BF7\u8865\u5145\u4E95\u53E3\u6D4B\u70B9\uFF0C\u4E0D\u81EA\u52A8\u63A8\u6D4B\u7F3A\u5931\u8F68\u8FF9\u3002");if(h.at(-1).md<1)throw new Error("\u672B\u6D4B\u70B9\u6D4B\u6DF1\u987B\u4E0D\u5C11\u4E8E1 m\u3002");return h}function Ne(t){return[Math.sin(t.inc*Mt)*Math.cos(t.azi*Mt),Math.sin(t.inc*Mt)*Math.sin(t.azi*Mt),Math.cos(t.inc*Mt)]}function or(t){return t<1e-5?1+t*t/12+t**4/120:2*Math.tan(t/2)/t}function Oe(t,h){let{a:l,b:i,beta:n}=t;if(n<1e-8)return l;let r=Math.sin(n);return l.map((o,w)=>(Math.sin((1-h)*n)*o+Math.sin(h*n)*i[w])/r)}function Te(t,h){let l=Oe(t,h),i=t.length*h/2*or(t.beta*h);return t.a.map((n,r)=>i*(n+l[r]))}function Ot(t){let h=ee(t),l=[],i=[],n=[0,0,0];l.push({...h[0],north:0,east:0,tvd:0,dls:0});for(let r=1;r<h.length;r++){let o=h[r-1],w=h[r],x=Ne(o),c=Ne(w),m=Math.acos(Ae(x.reduce((s,d,u)=>s+d*c[u],0)));if(m>Math.PI-1e-5)throw new Error(`\u7B2C${r}\uFF5E${r+1}\u6D4B\u70B9\u65B9\u5411\u8FD1\u4E4E\u76F8\u53CD\uFF0C\u8BF7\u8865\u5145\u4E2D\u95F4\u6D4B\u70B9\u4EE5\u786E\u5B9A\u5F2F\u66F2\u65B9\u5411\u3002`);let p={start:o.md,end:w.md,length:w.md-o.md,a:x,b:c,beta:m,position:[...n],azi:o.azi};i.push(p);let f=Te(p,1);n=n.map((s,d)=>Ie(s+f[d])),l.push({...w,north:n[0],east:n[1],tvd:n[2],dls:m/Mt/p.length*30})}return{survey:h,stations:l,intervals:i,depth:h.at(-1).md}}function Nt(t,h){if(!Number.isFinite(h)||h<-1e-8||h>t.depth+1e-8)throw new Error("\u67E5\u8BE2\u6D4B\u6DF1\u8D85\u51FA\u4E95\u659C\u6570\u636E\u8986\u76D6\u8303\u56F4\u3002");let l=0,i=t.intervals.length-1;for(;l<i;){let c=Math.floor((l+i)/2);t.intervals[c].end<h?l=c+1:i=c}let n=t.intervals[l],r=Math.max(0,Math.min(1,(h-n.start)/n.length)),o=Oe(n,r),w=Te(n,r),x=n.position.map((c,m)=>Ie(c+w[m]));return{md:h,north:x[0],east:x[1],tvd:x[2],inc:Math.acos(Ae(o[2]))/Mt,azi:Math.hypot(o[0],o[1])<1e-10?n.azi:(Math.atan2(o[1],o[0])/Mt+360)%360,vertical:o[2]}}function Be(t,h=[]){let l=new Set(t.survey.map(i=>i.md));for(let i of h)l.add(i);for(let i=0;i<=600;i++)l.add(t.depth*i/600);return[...l].sort((i,n)=>i-n).map(i=>Nt(t,i))}function me(t){return"\uFEFF"+[ir,...t.map(h=>[h.md,h.inc,h.azi])].map(h=>h.join(",")).join(`\r
`)}var ge=[{md:0,inc:0,azi:0},{md:200,inc:0,azi:0},{md:400,inc:20,azi:30},{md:600,inc:40,azi:45},{md:800,inc:60,azi:65},{md:1e3,inc:75,azi:85}];function De(t,h,l,i,n,r){if(Math.abs(n.depth-t.depth)>1e-8)throw new Error(`\u4E95\u659C\u672B\u6D4B\u6DF1${n.depth} m\u4E0E\u603B\u4E95\u6DF1${t.depth} m\u4E0D\u4E00\u81F4\uFF0C\u8BF7\u91CD\u65B0\u5BFC\u5165\u6216\u4FEE\u6B63\u3002`);if(!["md","tvd"].includes(r))throw new Error("\u5730\u6E29\u68AF\u5EA6\u57FA\u51C6\u65E0\u6548\u3002");let o=[0,t.depth,...i.map(d=>d.end),...n.survey.map(d=>d.md)];for(let d=1;d<l;d++)o.push(t.depth*d/l);o.sort((d,u)=>d-u);let w=o.filter((d,u)=>!u||d-o[u-1]>1e-8),x=It(101325,293.15,1)*t.rate/86400,c=w.map(d=>Nt(n,d)),m=t.pressure*1e6,p=0,f=0,s=[];for(let d=0;d<w.length;d++){let u=w[d],g=c[d],y=i[Ct(i,u)],z=t.temperature+.025*(r==="tvd"?g.tvd:u);if(!(z>0)||!(m>0))throw new Error("\u8F68\u8FF9\u4E0E\u5DE5\u51B5\u5BFC\u81F4\u975E\u6B63\u6E29\u5EA6\u6216\u538B\u529B\uFF0C\u8BF7\u68C0\u67E5\u8F93\u5165\u548C\u6A21\u578B\u9002\u7528\u8303\u56F4\u3002");let S=It(m,z,t.z),B=x/(S*Math.PI*y.diameter**2/4),N=12e-6*(z/300)**.7,P=d<w.length-1?Nt(n,(u+w[d+1])/2).vertical:g.vertical,$=Gt(S*B*y.diameter/N,y.roughness,y.diameter)*(h==="Beggs-Brill"?1+.08*P**2:1)*S*B**2/(2*y.diameter),Q=d<w.length-1?(c[d+1].tvd-g.tvd)/(w[d+1]-u):P,k=S*9.81*Q,F=[u,m/1e6,z,S,B,$/1e3,k/1e3];if(!F.every(Number.isFinite))throw new Error("\u8F68\u8FF9\u538B\u529B\u8BA1\u7B97\u51FA\u73B0\u6570\u503C\u6EA2\u51FA\u3002");if(d===w.length-1&&(F[5]=s.at(-1)[5],F[6]=s.at(-1)[6]),s.push(F),d<w.length-1){let a=w[d+1]-u,C=S*9.81*(c[d+1].tvd-g.tvd),R=$*a;m+=C+R,p+=C/1e6,f+=R/1e6}}return{model:h,params:{...t},steps:s.length-1,segments:i,rows:s,samples:Wt(s,i),bottom:s.at(-1)[1],gravity:p,friction:f,maxVelocity:Math.max(...s.map(d=>d[4])),survey:n.survey,stations:n.stations,trajectory:Be(n,i.map(d=>d.end)),positions:c,temperatureBasis:r}}var Kt="1.3.0",re=[25,50,100,200,500];function Yt(t,h,l=1,i=null,n=null,r="tvd"){let o=i?Et(i,t.depth):null;if(o){let g=o[0];t={...t,diameter:g.diameter,angle:g.angle,roughness:g.roughness}}if(Ut(t),![1,2].includes(l))throw new Error("\u7F51\u683C\u6A21\u5F0F\u65E0\u6548\u3002");let w=Math.max(300,pe(t.depth))*l,x=n?Ot(n):null,c=x?r:"md",m=o||[{name:"\u5168\u4E95\u6BB5",end:t.depth,diameter:t.diameter,angle:t.angle,roughness:t.roughness}],p=(g,y)=>x?De(t,g,y,m,x,c):ze(t,g,y,o),f=p(h,w),s=p(kt.find(g=>g!==h),w),d=p(h,w*2),u=Math.abs(d.bottom-f.bottom);return{result:f,comparison:s,gridFactor:l,structure:o,survey:x?.survey||null,temperatureBasis:c,quality:{refinedSteps:d.steps,refinedBottom:d.bottom,difference:u,relativePercent:u/Math.abs(d.bottom)*100}}}function Fe(t,h){if(!re.includes(h))throw new Error("\u91C7\u6837\u95F4\u9694\u65E0\u6548\u3002");return{...t,interval:h,result:{...t.result,samples:Wt(t.result.rows,t.result.segments,h)},comparison:{...t.comparison,samples:Wt(t.comparison.rows,t.comparison.segments,h)}}}function Pe(t,h){return{app:"wellbore-pressure",version:4,appVersion:Kt,model:t.result.model,parameters:t.result.params,gridFactor:t.gridFactor,interval:h,structure:t.structure,survey:t.survey,temperatureBasis:t.temperatureBasis}}function je(t){if(!t||t.app!=="wellbore-pressure"||![1,2,3,4].includes(t.version)||!kt.includes(t.model))throw new Error("\u4E0D\u662F\u53D7\u652F\u6301\u7684\u4E95\u7B52\u538B\u529B\u65B9\u6848\u6587\u4EF6\u3002");let h=Object.fromEntries(zt.map(([o])=>[o,t.parameters?.[o]]));Ut(h);let l=t.version===1?1:t.gridFactor,i=t.version===1?100:t.interval;if(![1,2].includes(l)||!re.includes(i))throw new Error("\u65B9\u6848\u4E2D\u7684\u7F51\u683C\u6A21\u5F0F\u6216\u91C7\u6837\u95F4\u9694\u65E0\u6548\u3002");let n=t.version>=3&&t.structure!==null?Et(t.structure,h.depth):null,r=t.version===4&&t.survey!==null?ee(t.survey):null;if(r&&Math.abs(r.at(-1).md-h.depth)>1e-8)throw new Error("\u65B9\u6848\u4E95\u659C\u672B\u6D4B\u6DF1\u4E0E\u603B\u4E95\u6DF1\u4E0D\u4E00\u81F4\u3002");if(t.version===4&&!["md","tvd"].includes(t.temperatureBasis))throw new Error("\u65B9\u6848\u5730\u6E29\u68AF\u5EA6\u57FA\u51C6\u65E0\u6548\u3002");return{parameters:h,model:t.model,gridFactor:l,interval:i,...t.version>=3?{structure:n}:{},...t.version===4?{survey:r,temperatureBasis:t.temperatureBasis}:{}}}function Le(t,h){return zt.filter(([l])=>t[l]!==h[l]).map(([l,i,n])=>({key:l,label:i,unit:n,before:t[l],after:h[l]}))}var lr=t=>String(t).replace(/[&<>"']/g,h=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"})[h]);async function We(t,h,{interval:l=100,quality:i=null,baseline:n=null}={}){let r=new Ue.default,o=[["\u8BA1\u7B97\u8BF4\u660E\u4E0E\u53C2\u6570",[["\u4E95\u7B52\u538B\u529B\u8BA1\u7B97",Kt],["\u8BA1\u7B97\u6A21\u578B",t.model+"\uFF08\u539F\u7A0B\u5E8F\u5355\u6C14\u76F8\u7B80\u5316\u7248\uFF09"],["\u8BA1\u7B97\u7F51\u683C\u6570",t.steps],["\u91C7\u6837\u95F4\u9694",l,"m"],...zt.map(([c,m,p])=>[m,t.params[c],p]),["\u4E95\u5E95\u538B\u529B",t.bottom,"MPa"],["\u91CD\u529B\u7D2F\u8BA1\u538B\u5DEE",t.gravity,"MPa"],["\u6469\u963B\u7D2F\u8BA1\u538B\u5DEE",t.friction,"MPa"],["\u89D2\u5EA6\u5B9A\u4E49","\u6C34\u5E73\u4E3A0\xB0\uFF0C\u5782\u76F4\u4E3A90\xB0"],["\u9002\u7528\u8303\u56F4","\u5355\u6C14\u76F8\u91C7\u6C14\uFF1B\u4E0D\u542B\u591A\u76F8\u6D41\u3001\u6CE8\u6C14\u65B9\u5411\u548C\u52A0\u901F\u9879"],["\u6E29\u5EA6\u68AF\u5EA6",.025,"K/m"],["\u6C14\u4F53\u6469\u5C14\u8D28\u91CF",.018,"kg/mol"],["\u6807\u51B5\u538B\u529B",101325,"Pa"],["\u6807\u51B5\u6E29\u5EA6",293.15,"K"],["\u8BA1\u7B97\u65B9\u6CD5","\u663E\u5F0F\u9010\u6BB5\u79EF\u5206\uFF1B\u6C14\u4F53\u9ECF\u5EA6=1.2e-5\xD7(T/300)^0.7 Pa\xB7s\uFF1B\u5E38Z"],["Beggs-Brill\u5DEE\u5F02","\u539F\u4EE3\u7801\u4EC5\u5C06\u6469\u963B\u4E58\u4EE51+0.08\xD7sin\xB2(\u03B8)"]]],[`${l}m\u91C7\u6837`,[le,...t.samples]],["\u5B8C\u6574\u5256\u9762",[le,...t.rows]],["\u6A21\u578B\u5BF9\u6BD4",[["\u4E95\u6DF1_m",`${t.model}_MPa`,`${h.model}_MPa`],...t.samples.map((c,m)=>[c[0],c[1],h.samples[m][1]])]]];if(t.survey&&(o[0][1].push(["\u4E95\u8F68\u8FF9\u65B9\u6CD5","\u6700\u5C0F\u66F2\u7387\uFF1B\u4E95\u659C\u89D2\u4ECE\u5782\u76F4\u5411\u4E0B\u8BA1\uFF1B\u65B9\u4F4D\u89D2\u6309\u539F\u59CB\u6570\u636E\u5317\u5411\u987A\u65F6\u9488"],["\u5750\u6807\u57FA\u51C6","\u4E95\u53E3\u539F\u70B9\uFF0C\u5C40\u90E8N/E/TVD\uFF1B\u672A\u505A\u78C1\u504F\u89D2\u6216\u5730\u7406\u5750\u6807\u8F6C\u6362"],["\u5730\u6E29\u68AF\u5EA6\u57FA\u51C6",t.temperatureBasis==="tvd"?"\u5782\u6DF1TVD":"\u6D4B\u6DF1MD"],["\u503E\u89D2\u6765\u6E90","\u4E95\u659C\u6570\u636E\u8986\u76D6\u7ED3\u6784\u4E2D\u624B\u5DE5\u8BBE\u7F6E\u7684\u5939\u89D2\uFF0C\u7ED3\u6784\u63D0\u4F9B\u5185\u5F84\u4E0E\u7C97\u7CD9\u5EA6"]),o.push(["\u4E95\u659C\u6D4B\u70B9",[["MD_m","Inc_deg","Azi_deg","TVD_m","North_m","East_m","DLS_deg_per_30m"],...t.stations.map(c=>[c.md,c.inc,c.azi,c.tvd,c.north,c.east,c.dls])]]),o.push(["\u8F68\u8FF9\u538B\u529B\u5256\u9762",[["MD_m","TVD_m","North_m","East_m","Inc_deg","Azi_deg","Pressure_MPa","Temperature_K","Velocity_ms"],...t.positions.map((c,m)=>[c.md,c.tvd,c.north,c.east,c.inc,c.azi,t.rows[m][1],t.rows[m][2],t.rows[m][4]])]])),t.segments){let c=0;o.push(["\u4E95\u8EAB\u7ED3\u6784",[["\u4E95\u6BB5\u540D\u79F0","\u8D77\u70B9\u4E95\u6DF1_m","\u7EC8\u70B9\u4E95\u6DF1_m","\u5185\u5F84_mm","\u5939\u89D2_deg","\u7C97\u7CD9\u5EA6_mm"],...t.segments.map(m=>{let p=[m.name,c,m.end,m.diameter*1e3,m.angle,m.roughness*1e3];return c=m.end,p})]]),o[0][1].push(["\u4E95\u8EAB\u7ED3\u6784\u8BF4\u660E","\u6D41\u52A8\u901A\u9053\u5185\u5F84\u53CA\u4E95\u6BB5\u53C2\u6570\u4EE5\u4E95\u8EAB\u7ED3\u6784\u8868\u4E3A\u51C6\uFF1B\u5206\u6BB5\u8BA1\u7B97\u4E0D\u542B\u7BA1\u5F84\u7A81\u53D8\u5C40\u90E8\u635F\u5931"])}if(i&&o.push(["\u8BA1\u7B97\u68C0\u67E5",[["\u9879\u76EE","\u6570\u503C","\u5355\u4F4D"],["\u5F53\u524D\u7F51\u683C\u6570",t.steps,""],["\u52A0\u5BC6\u7F51\u683C\u6570",i.refinedSteps,""],["\u5F53\u524D\u4E95\u5E95\u538B\u529B",t.bottom,"MPa"],["\u52A0\u5BC6\u4E95\u5E95\u538B\u529B",i.refinedBottom,"MPa"],["\u7EDD\u5BF9\u5DEE\u5F02",i.difference,"MPa"],["\u76F8\u5BF9\u5DEE\u5F02",i.relativePercent,"%"],["\u8BF4\u660E","\u4EC5\u68C0\u67E5\u6570\u503C\u79BB\u6563\u8BEF\u5DEE\uFF0C\u4E0D\u7B49\u4E8E\u73B0\u573A\u7CBE\u5EA6\u9A8C\u8BC1",""]]]),n&&o.push(["\u5DE5\u51B5\u5BF9\u6BD4",[["\u9879\u76EE","\u56FA\u5B9A\u57FA\u51C6","\u5F53\u524D\u7ED3\u679C","\u5355\u4F4D"],["\u6A21\u578B",n.model,t.model,""],["\u7F51\u683C\u6570",n.steps,t.steps,""],...zt.map(([c,m,p])=>[m,n.params[c],t.params[c],p]),["\u4E95\u5E95\u538B\u529B",n.bottom,t.bottom,"MPa"],["\u91CD\u529B\u538B\u5DEE",n.gravity,t.gravity,"MPa"],["\u6469\u963B\u538B\u5DEE",n.friction,t.friction,"MPa"]]]),n?.segments){let c=[["\u5DE5\u51B5","\u4E95\u6BB5\u540D\u79F0","\u8D77\u70B9\u4E95\u6DF1_m","\u7EC8\u70B9\u4E95\u6DF1_m","\u5185\u5F84_mm","\u5939\u89D2_deg","\u7C97\u7CD9\u5EA6_mm"]];for(let[m,p]of[["\u56FA\u5B9A\u57FA\u51C6",n.segments],["\u5F53\u524D\u7ED3\u679C",t.segments]]){let f=0;for(let s of p)c.push([m,s.name,f,s.end,s.diameter*1e3,s.angle,s.roughness*1e3]),f=s.end}o.push(["\u7ED3\u6784\u5BF9\u6BD4",c])}let w="http://schemas.openxmlformats.org/spreadsheetml/2006/main";if(n&&(t.survey||n.survey)){let c=[["\u5DE5\u51B5","MD_m","Inc_deg","Azi_deg","TVD_m","North_m","East_m"]];for(let[m,p]of[["\u56FA\u5B9A\u57FA\u51C6",n],["\u5F53\u524D\u7ED3\u679C",t]])if(p.stations)for(let f of p.stations)c.push([m,f.md,f.inc,f.azi,f.tvd,f.north,f.east]);else c.push([m,"\u672A\u4F7F\u7528\u4E95\u659C\u6570\u636E","","","","",""]);o.push(["\u8F68\u8FF9\u5BF9\u6BD4",c])}let x="http://schemas.openxmlformats.org/officeDocument/2006/relationships";return r.file("[Content_Types].xml",`<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${o.map((c,m)=>`<Override PartName="/xl/worksheets/sheet${m+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}</Types>`),r.file("_rels/.rels",`<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${x}/officeDocument" Target="xl/workbook.xml"/></Relationships>`),r.file("xl/workbook.xml",`<workbook xmlns="${w}" xmlns:r="${x}"><sheets>${o.map(([c],m)=>`<sheet name="${c}" sheetId="${m+1}" r:id="rId${m+1}"/>`).join("")}</sheets></workbook>`),r.file("xl/_rels/workbook.xml.rels",`<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${o.map((c,m)=>`<Relationship Id="rId${m+1}" Type="${x}/worksheet" Target="worksheets/sheet${m+1}.xml"/>`).join("")}</Relationships>`),o.forEach(([,c],m)=>r.file(`xl/worksheets/sheet${m+1}.xml`,`<worksheet xmlns="${w}"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols><col min="1" max="1" width="27" customWidth="1"/><col min="2" max="8" width="25" customWidth="1"/></cols><sheetData>${c.map((p,f)=>`<row r="${f+1}">${p.map((s,d)=>typeof s=="number"?`<c r="${String.fromCharCode(65+d)}${f+1}"><v>${s}</v></c>`:`<c r="${String.fromCharCode(65+d)}${f+1}" t="inlineStr"><is><t>${lr(s)}</t></is></c>`).join("")}</row>`).join("")}</sheetData></worksheet>`)),r.generateAsync({type:"uint8array",compression:"DEFLATE"})}function yt(t,h,l){let i=URL.createObjectURL(new Blob([t],{type:l})),n=document.createElement("a");n.href=i,n.download=h,document.body.append(n),n.click(),n.remove(),setTimeout(()=>URL.revokeObjectURL(i),1e4)}var X=(t,h=4)=>t!==0&&Math.abs(t)<.5*10**-h?Number(t).toExponential(2):Number(t).toLocaleString("zh-CN",{maximumFractionDigits:h,minimumFractionDigits:h});var dt=window.QwenPaw.host.React,{useState:pr,useRef:dr}=dt;function we({result:t,comparison:h,compare:l,metric:i,interval:n,disabled:r}){let[o,w]=pr(0),x=dr(null),c={pressure:1,temperature:2,velocity:4}[i],m={pressure:"\u538B\u529B / MPa",temperature:"\u6E29\u5EA6 / K",velocity:"\u6D41\u901F / m\xB7s\u207B\xB9"}[i],p=[...t.rows,...l?h.rows:[]].map(C=>C[c]),f=Math.min(...p),s=Math.max(...p),d=Math.max((s-f)*.12,.01),u=f-d,g=s+d,y=640,z=620,S=78,B=28,N=44,P=38,O=C=>S+(C-u)/(g-u)*(y-S-B),$=C=>N+C/t.params.depth*(z-N-P),Q=C=>C.filter((R,L)=>L%Math.max(1,Math.floor(C.length/700))===0||L===C.length-1).map((R,L)=>`${L?"L":"M"}${O(R[c]).toFixed(3)},${$(R[0]).toFixed(3)}`).join(" ");function k(C){let R=C.currentTarget,L=R.getScreenCTM();if(!L)return;let et=R.createSVGPoint();et.x=C.clientX,et.y=C.clientY;let V=et.matrixTransform(L.inverse()).y,tt=Math.max(0,Math.min(t.params.depth,(V-N)/(z-N-P)*t.params.depth)),M=0,A=t.rows.length-1;for(;M<A;){let rt=Math.floor((M+A)/2);t.rows[rt][0]<tt?M=rt+1:A=rt}w(M>0&&tt-t.rows[M-1][0]<t.rows[M][0]-tt?M-1:M)}function F(){let C=x.current.cloneNode(!0);C.setAttribute("xmlns","http://www.w3.org/2000/svg"),C.setAttribute("width",y),C.setAttribute("height",z);let R=document.createElementNS("http://www.w3.org/2000/svg","title");R.textContent=`${t.model} \xB7 ${m} \xB7 \u4E95\u6DF1${t.params.depth}m`,C.prepend(R),yt(new XMLSerializer().serializeToString(C),`\u4E95\u7B52\u5256\u9762_${i}_${t.model}.svg`,"image/svg+xml;charset=utf-8")}let a=o==null?null:t.rows[o];return dt.createElement(dt.Fragment,null,dt.createElement("svg",{ref:x,className:"wp-chart","data-testid":"pressure-chart",viewBox:`0 0 ${y} ${z}`,role:"img","aria-label":`${m}\u4E0E\u4E95\u6DF1\u66F2\u7EBF\uFF0C\u4E95\u6DF1\u5411\u4E0B\u589E\u52A0`,onPointerMove:k},dt.createElement("rect",{width:y,height:z,fill:"white"}),Array.from({length:6},(C,R)=>{let L=t.params.depth*R/5,et=u+(g-u)*R/5;return dt.createElement("g",{key:R,fontFamily:"Microsoft YaHei, sans-serif",fontSize:"11",fill:"#7b8d9f"},dt.createElement("line",{x1:S,x2:y-B,y1:$(L),y2:$(L),stroke:"#e9eff4"}),dt.createElement("text",{x:S-12,y:$(L)+4,textAnchor:"end"},X(L,0)),dt.createElement("line",{x1:O(et),x2:O(et),y1:N,y2:z-P,stroke:"#edf2f6"}),dt.createElement("text",{x:O(et),y:N-13,textAnchor:"middle"},X(et,2)))}),dt.createElement("text",{x:(S+y-B)/2,y:"13",textAnchor:"middle",fontSize:"11",fill:"#6d8298"},m),dt.createElement("text",{x:"18",y:"255",transform:"rotate(-90 18 255)",textAnchor:"middle",fontSize:"11",fill:"#6d8298"},"\u4E95\u6DF1 / m"),t.segments?.slice(0,-1).map((C,R)=>dt.createElement("g",{key:`section-${R}`},dt.createElement("line",{x1:S,x2:y-B,y1:$(C.end),y2:$(C.end),stroke:"#b6c8d7",strokeDasharray:"5 4"}),dt.createElement("text",{x:y-B-3,y:$(C.end)-5,textAnchor:"end",fontSize:"10",fill:"#718a9f"},"\u4E95\u6BB5\u754C\u9762 ",X(C.end,0)," m"))),l&&dt.createElement("path",{d:Q(h.rows),fill:"none",stroke:"#278b89",strokeWidth:"2.5",strokeDasharray:"7 5"}),dt.createElement("path",{d:Q(t.rows),fill:"none",stroke:"#2365a4",strokeWidth:"3"}),t.samples.length<60&&t.samples.map((C,R)=>dt.createElement("circle",{key:R,cx:O(C[c]),cy:$(C[0]),r:"3",fill:"white",stroke:"#2365a4",strokeWidth:"1.7"})),a&&dt.createElement("g",null,dt.createElement("line",{x1:S,x2:y-B,y1:$(a[0]),y2:$(a[0]),stroke:"#a8b8c6",strokeDasharray:"3 3"}),dt.createElement("circle",{cx:O(a[c]),cy:$(a[0]),r:"5",fill:"#2365a4",stroke:"white",strokeWidth:"2"})),dt.createElement("text",{x:y-B,y:z-7,textAnchor:"end",fontSize:"10",fill:"#90a0ad"},"\u4E95\u6DF1\u5411\u4E0B\u589E\u52A0 \xB7 \u5355\u6C14\u76F8\u91C7\u6C14")),dt.createElement("div",{className:"wp-legend"},dt.createElement("span",null,dt.createElement("i",{className:"wp-key"}),t.model),l&&dt.createElement("span",null,dt.createElement("i",{className:"wp-key alt"}),h.model),dt.createElement("span",null,"\u25CB ",n," m \u91C7\u6837\u70B9")),dt.createElement("div",{className:"wp-chart-status"},a?`\u4E95\u6DF1 ${X(a[0],1)} m \xB7 ${m.split(" / ")[0]} ${X(a[c])}${l?` \xB7 \u5BF9\u6BD4 ${X(h.rows[o][c])}`:""}`:"\u9009\u62E9\u4E95\u6DF1\u67E5\u770B\u8BA1\u7B97\u503C"),dt.createElement("div",{className:"wp-probe"},dt.createElement("label",null,"\u67E5\u8BE2\u4E95\u6DF1 / m",dt.createElement("input",{"aria-label":"\u67E5\u8BE2\u4E95\u6DF1",type:"range",min:"0",max:t.steps,step:"1",value:o??0,onChange:C=>w(Number(C.target.value))})),dt.createElement("span",null,X(a?.[0]??0,1)," m"),dt.createElement("button",{disabled:r,onClick:F},"\u5BFC\u51FA\u66F2\u7EBF SVG")))}var $e=`.wp-app {
  --ink: var(--app-text);
  --muted: var(--app-text-secondary);
  --line: var(--app-border);
  --blue: var(--app-accent-text);
  --teal: var(--app-info-text);
  background: var(--app-bg);
  color: var(--ink);
  font:
    13px/1.6 Inter,
    "Microsoft YaHei",
    sans-serif;

  min-height: 100%;
  overflow: auto;
}
.wp-app * {
  box-sizing: border-box;
}
.wp-app button,
.wp-app input,
.wp-app select {
  font: inherit;
  color: inherit;
}
.wp-app button {
  border: 1px solid var(--line);
  background: var(--app-surface);
  border-radius: 7px;
  cursor: pointer;
  padding: 6px 11px;
  white-space: nowrap;
}
.wp-app button:hover {
  background: var(--app-fill-subtle);
}
.wp-app button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.wp-app button:focus-visible,
.wp-app summary:focus-visible {
  outline: 3px solid var(--app-focus-ring);
  outline-offset: 2px;
}
.wp-app input,
.wp-app select {
  border: 1px solid var(--app-border);
  background: var(--app-surface-subtle);
  padding: 7px 9px;
  border-radius: 6px;
  width: 100%;
  min-width: 0;
  outline: none;
  font-variant-numeric: tabular-nums;
}
.wp-app input:focus,
.wp-app select:focus {
  border-color: var(--app-accent);
  box-shadow: 0 0 0 2px var(--app-accent-soft);
}
.wp-app [aria-invalid="true"] {
  border-color: #c87968;
  background: #fff8f5;
}
.wp-app input[type="checkbox"] {
  width: auto;
  accent-color: var(--blue);
}
.wp-app input[type="range"] {
  padding: 0;
  accent-color: var(--blue);
  box-shadow: none;
}
.wp-app h1,
.wp-app h2,
.wp-app p {
  margin: 0;
}
.wp-app h1 {
  font-size: calc(24px * var(--app-font-scale, 1));
  letter-spacing: 0.02em;
}
.wp-app h2 {
  font-size: 14px;
}
.wp-shell {
  height: calc(100dvh - 32px);
  min-height: 640px;
  max-width: 1920px;
  margin: auto;
  padding: 20px 24px 12px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.wp-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding-right: 76px;
  flex: none;
}
.wp-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.wp-logo {
  border: 1px solid var(--app-border);
  width: 42px;
  height: 46px;
  display: grid;
  place-items: center;
  color: var(--blue);
  border-radius: 11px;
  background: var(--app-surface);
  font-size: 26px;
}
.wp-eyebrow {
  font-size: 9px;
  letter-spacing: 2px;
  font-weight: 700;
  color: var(--blue);
}
.wp-sub {
  font-size: 11px;
  color: var(--muted);
}
.wp-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.wp-badge {
  font-size: 10px;
  color: #4d8074;
  background: #e8f4ee;
  border: 1px solid #d3e8df;
  padding: 3px 9px;
  border-radius: 20px;
  white-space: nowrap;
}
.wp-layout {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 390px minmax(0, 1fr);
  gap: 16px;
}
.wp-left {
  display: grid;
  grid-template-rows: auto minmax(250px, 1fr);
  gap: 14px;
  min-height: 0;
}
.wp-panel {
  background: var(--app-surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  min-width: 0;
  overflow: hidden;
}
.wp-panel-head {
  padding: 13px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--app-border-subtle);
  flex: none;
}
.wp-heading {
  display: flex;
  align-items: center;
  gap: 8px;
}
.wp-index {
  font-size: 10px;
  color: var(--app-text-tertiary);
  letter-spacing: 0.07em;
}
.wp-app .wp-link {
  border: 0;
  background: none;
  padding: 0;
  font-size: 11px;
  color: var(--blue);
}
.wp-form {
  padding: 14px 16px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 14px;
}
.wp-field {
  display: block;
  min-width: 0;
}
.wp-field-title {
  display: flex;
  justify-content: space-between;
  gap: 5px;
  font-size: 11px;
  margin-bottom: 4px;
}
.wp-unit {
  color: var(--app-text-tertiary);
  font-size: 10px;
  white-space: nowrap;
}
.wp-wide {
  grid-column: 1/-1;
}
.wp-field-error {
  display: block;
  font-size: 10px;
  color: #ac5340;
  margin-top: 3px;
}
.wp-small {
  font-size: 10px;
  color: var(--muted);
}
.wp-hint {
  color: var(--muted);
  font-size: 10px;
  line-height: 1.7;
}
.wp-app .wp-primary {
  background: var(--blue);
  color: var(--app-text-inverse);
  border-color: var(--blue);
  font-weight: 600;
  padding: 9px 15px;
}
.wp-app .wp-primary:hover {
  background: var(--app-accent-hover);
}
.wp-calc-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 9px;
  padding-top: 2px;
}
.wp-structure {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.wp-structure-tools {
  padding: 10px 16px;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  border-bottom: 1px solid var(--app-border-subtle);
  flex-wrap: wrap;
}
.wp-modes {
  display: flex;
  padding: 2px;
  background: var(--app-fill-subtle);
  border-radius: 6px;
  gap: 2px;
}
.wp-app .wp-modes button {
  background: transparent;
  border: 0;
  font-size: 11px;
  padding: 4px 9px;
}
.wp-app .wp-modes button[aria-pressed="true"] {
  background: var(--app-surface);
  box-shadow: 0 1px 4px #183c6020;
  color: var(--blue);
  font-weight: 600;
}
.wp-structure-content {
  padding: 12px 16px;
  overflow: auto;
  min-height: 0;
  flex: 1;
}
.wp-structure-content .wp-form {
  padding: 0;
}
.wp-segment {
  border: 1px solid var(--app-border);
  border-radius: 9px;
  padding: 10px 12px;
  margin-bottom: 10px;
  background: var(--app-surface-subtle);
}
.wp-segment-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 9px;
}
.wp-segment-head input {
  border: 0;
  padding: 2px;
  background: none;
  font-size: 11px;
  font-weight: 600;
}
.wp-segment-head .wp-unit {
  font-size: 9px;
}
.wp-segment-head button {
  padding: 0 5px;
  color: var(--app-error-text);
  font-size: 11px;
}
.wp-segment-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px 12px;
}
.wp-structure-footer {
  padding: 10px 16px;
  border-top: 1px solid var(--app-border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.wp-app .wp-add {
  border: 1px dashed var(--app-border);
  color: var(--blue);
  font-size: 11px;
  padding: 5px 10px;
}
.wp-app .wp-import {
  font-size: 11px;
  padding: 4px 7px;
}
.wp-notice {
  border: 1px solid #cddfea;
  border-radius: 7px;
  background: #edf5fc;
  color: #52768f;
  font-size: 11px;
  padding: 7px 12px;
  flex: none;
}
.wp-error {
  background: #fff3ef;
  border-color: #ebc6bd;
  color: #a25442;
}
.wp-stale {
  background: #fff8e8;
  border-color: #ecdcae;
  color: #927332;
}
.wp-visual {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.wp-visual-head {
  padding: 14px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--app-border-subtle);
  gap: 12px;
}
.wp-live {
  width: 6px;
  height: 6px;
  display: inline-block;
  background: #3d9a85;
  border-radius: 50%;
  margin-right: 5px;
}
.wp-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  padding: 17px 20px;
  border-bottom: 1px solid var(--app-border-subtle);
  gap: 12px;
}
.wp-stat {
  padding-left: 15px;
  border-left: 1px solid var(--app-border);
  min-width: 0;
}
.wp-stat:first-child {
  padding-left: 0;
  border: 0;
}
.wp-stat-label {
  font-size: 10px;
  color: var(--muted);
}
.wp-stat-value {
  font-size: 26px;
  font-weight: 650;
  letter-spacing: -0.8px;
  line-height: 1.4;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.wp-stat-unit {
  font-size: 10px;
  letter-spacing: 0;
  font-weight: 400;
  margin-left: 5px;
  color: var(--app-text-tertiary);
}
.wp-stat-note {
  font-size: 10px;
  color: var(--app-text-tertiary);
}
.wp-tabs-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 18px;
  gap: 8px;
  border-bottom: 1px solid var(--app-border-subtle);
  flex-wrap: wrap;
}
.wp-tabs {
  display: flex;
  gap: 17px;
}
.wp-app .wp-tab {
  border: 0;
  background: none;
  border-radius: 0;
  padding: 5px 2px 7px;
  font-size: 12px;
  color: var(--app-text-secondary);
  border-bottom: 2px solid transparent;
}
.wp-app .wp-tab[aria-selected="true"] {
  color: var(--blue);
  border-bottom-color: var(--blue);
  font-weight: 600;
}
.wp-head-select {
  width: auto !important;
  max-width: 170px;
  font-size: 11px !important;
  padding: 5px 8px !important;
}
.wp-check {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  white-space: nowrap;
}
.wp-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
}
.wp-graph {
  display: grid;
  grid-template-columns: 156px minmax(0, 1fr);
  height: 100%;
  min-height: 390px;
}
.wp-schematic {
  border-right: 1px solid var(--app-border-subtle);
  background: var(--app-surface-subtle);
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.wp-schematic h3 {
  font-size: 11px;
  margin: 0 0 4px;
  font-weight: 600;
}
.wp-schematic svg {
  width: 100%;
  flex: 1;
  min-height: 260px;
  max-height: 580px;
}
.wp-schematic-note {
  font-size: 9px;
  color: var(--app-text-tertiary);
  line-height: 1.7;
}
.wp-plot {
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.wp-chart {
  width: 100%;
  height: 100%;
  min-height: 230px;
  flex: 1;
  display: block;
  touch-action: pan-y;
}
.wp-legend {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 9px;
  color: var(--muted);
  padding: 2px 7px;
}
.wp-key {
  width: 15px;
  display: inline-block;
  border-top: 2px solid var(--blue);
  margin-right: 5px;
  vertical-align: middle;
}
.wp-key.alt {
  border-color: var(--teal);
  border-top-style: dashed;
}
.wp-chart-status {
  font-size: 10px;
  color: var(--app-text-secondary);
  padding: 4px 7px;
  font-variant-numeric: tabular-nums;
  min-height: 24px;
}
.wp-probe {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 10px;
  padding: 5px 7px;
}
.wp-probe label {
  flex: 1;
  min-width: 80px;
}
.wp-probe input {
  display: block;
  width: 100%;
}
.wp-probe button {
  font-size: 10px;
  padding: 4px 6px;
}
.wp-table-wrap {
  overflow: auto;
  max-height: 100%;
  height: 100%;
}
.wp-app table {
  border-collapse: collapse;
  width: 100%;
  font-size: 11px;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.wp-app th {
  text-align: right;
  background: var(--app-surface-subtle);
  color: var(--app-text-secondary);
  font-weight: 500;
  position: sticky;
  top: 0;
  z-index: 1;
}
.wp-app th,
.wp-app td {
  padding: 10px 13px;
  border-bottom: 1px solid var(--app-border-subtle);
}
.wp-app td {
  text-align: right;
}
.wp-app td:first-child,
.wp-app th:first-child {
  text-align: left;
}
.wp-app tbody tr:hover {
  background: var(--app-surface-subtle);
}
.wp-app tbody tr:last-child {
  background: var(--app-surface-subtle);
}
.wp-table-empty {
  display: grid;
  place-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
  color: var(--app-text-secondary);
  gap: 12px;
}
.wp-visual-footer {
  border-top: 1px solid var(--app-border);
  flex: none;
}
.wp-quality-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 9px 17px;
  font-size: 10px;
  color: var(--app-text-secondary);
  flex-wrap: wrap;
}
.wp-app .wp-quality-line button {
  font-size: 10px;
  padding: 4px 7px;
}
.wp-details {
  font-size: 10px;
  color: var(--app-text-secondary);
  padding: 0 17px 10px;
}
.wp-details summary {
  cursor: pointer;
  display: inline-block;
  color: var(--app-text-secondary);
}
.wp-details p {
  margin-top: 7px;
  line-height: 1.9;
}
.wp-foot {
  font-size: 9px;
  color: var(--app-text-secondary);
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex: none;
}
.wp-hidden {
  display: none;
}
@media (min-width: 1500px) {
  .wp-layout {
    grid-template-columns: 440px minmax(0, 1fr);
  }
  .wp-graph {
    grid-template-columns: 190px minmax(0, 1fr);
  }
}
@media (max-width: 1100px) {
  .wp-layout {
    grid-template-columns: 350px minmax(0, 1fr);
    gap: 12px;
  }
  .wp-shell {
    padding: 16px 16px 10px;
  }
  .wp-graph {
    grid-template-columns: 122px minmax(0, 1fr);
  }
  .wp-stat-value {
    font-size: 22px;
  }
  .wp-summary {
    padding: 14px;
  }
  .wp-plot {
    padding: 8px;
  }
  .wp-visual-head {
    flex-wrap: wrap;
  }
  .wp-top .wp-badge {
    display: none;
  }
}
@media (max-width: 820px) {
  .wp-shell {
    height: auto;
    min-height: 100dvh;
  }
  .wp-layout {
    grid-template-columns: 1fr;
    flex: none;
  }
  .wp-left {
    grid-template-rows: auto auto;
  }
  .wp-structure-content {
    max-height: 350px;
  }
  .wp-visual {
    min-height: 680px;
  }
  .wp-content {
    min-height: 410px;
    flex: auto;
  }
  .wp-top {
    align-items: flex-start;
  }
  .wp-top .wp-toolbar {
    gap: 5px;
  }
  .wp-top button {
    font-size: 10px;
    padding: 5px 7px;
  }
  .wp-app h1 {
    font-size: 20px;
  }
  .wp-sub {
    font-size: 10px;
  }
  .wp-graph {
    min-height: 410px;
  }
  .wp-table-wrap {
    max-height: 470px;
  }
  .wp-graph .wp-schematic {
    min-height: 380px;
  }
  .wp-chart {
    min-height: 270px;
  }
  .wp-foot {
    flex-wrap: wrap;
  }
}
@media (max-width: 480px) {
  .wp-top {
    flex-direction: column;
    gap: 8px;
  }
  .wp-shell {
    padding: 14px 10px;
    gap: 12px;
  }
  .wp-visual-head,
  .wp-tabs-row {
    padding: 10px 12px;
  }
  .wp-summary {
    gap: 8px;
  }
  .wp-stat {
    padding-left: 9px;
  }
  .wp-stat-value {
    font-size: 19px;
  }
  .wp-stat-note {
    font-size: 9px;
  }
  .wp-graph {
    grid-template-columns: 95px minmax(0, 1fr);
  }
  .wp-schematic {
    padding: 10px 6px;
  }
  .wp-probe {
    flex-wrap: wrap;
  }
  .wp-probe label {
    flex-basis: 100%;
  }
  .wp-legend {
    gap: 6px;
    font-size: 8px;
  }
  .wp-tabs {
    gap: 12px;
  }
  .wp-app h2 {
    font-size: 13px;
  }
  .wp-head-select {
    max-width: 130px;
  }
  .wp-quality-line {
    padding: 8px 12px;
  }
  .wp-details {
    padding: 0 12px 9px;
  }
}
.wp-survey-box {
  border-bottom: 1px solid var(--app-border);
  background: var(--app-surface-subtle);
  padding: 10px 16px;
  flex: none;
}
.wp-survey-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 5px;
}
.wp-survey-heading strong {
  font-size: 11px;
}
.wp-survey-loaded {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: space-between;
  font-size: 10px;
  color: var(--app-text-secondary);
  margin-bottom: 3px;
}
.wp-survey-box .wp-hint {
  font-size: 9px;
  margin-top: 3px;
}
.wp-trajectory {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 430px;
  padding: 12px 16px;
  gap: 8px;
}
.wp-trajectory-tools {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.wp-trajectory-tools button {
  font-size: 10px;
}
.wp-trajectory-caption {
  font-size: 10px;
  color: var(--app-text-secondary);
}
.wp-trajectory-svg {
  width: 100%;
  height: 0;
  flex: 1;
  min-height: 235px;
  display: block;
  touch-action: pan-y;
}
.wp-trajectory-controls {
  display: flex;
  gap: 18px;
  align-items: center;
  flex-wrap: wrap;
  padding: 0 9px;
  font-size: 10px;
  color: var(--app-text-secondary);
}
.wp-trajectory-controls label {
  flex: 1;
  min-width: 100px;
}
.wp-trajectory-controls input {
  display: block;
  width: 100%;
}
.wp-coordinate-card {
  display: flex;
  gap: 6px 17px;
  flex-wrap: wrap;
  border: 1px solid var(--app-border);
  background: var(--app-surface-subtle);
  border-radius: 7px;
  padding: 8px 11px;
  font-size: 10px;
  color: var(--app-text-secondary);
  font-variant-numeric: tabular-nums;
}
.wp-coordinate-card b {
  color: var(--app-text);
  font-weight: 600;
}
.wp-trajectory-legend {
  display: flex;
  gap: 8px 15px;
  flex-wrap: wrap;
  max-height: 46px;
  overflow: auto;
  font-size: 10px;
  color: var(--app-text-secondary);
}
.wp-trajectory-legend i {
  display: inline-block;
  width: 12px;
  height: 3px;
  vertical-align: middle;
  margin-right: 6px;
}
.wp-trajectory-legend .wp-pressure-gradient {
  width: 50px;
  background: linear-gradient(90deg, rgb(39, 112, 179), rgb(217, 134, 84));
}
.wp-plot {
  min-height: 0;
}
.wp-plot .wp-chart {
  height: 0;
  min-height: 230px;
  flex: 1;
}
.wp-graph {
  grid-template-rows: minmax(0, 1fr);
}
@media (max-width: 820px) {
  .wp-survey-heading {
    flex-wrap: wrap;
  }
  .wp-trajectory {
    height: 600px;
    min-height: 540px;
    padding: 10px;
  }
  .wp-trajectory-controls {
    gap: 8px;
  }
  .wp-tabs {
    gap: 12px;
  }
}
@media (max-width: 480px) {
  .wp-survey-box {
    padding: 9px 12px;
  }
  .wp-tabs-row .wp-toolbar {
    gap: 6px;
  }
  .wp-trajectory-tools .wp-modes button {
    font-size: 10px;
    padding: 4px 6px;
  }
  .wp-coordinate-card {
    gap: 5px 10px;
  }
}

/* Host-theme workbench chrome, independent of scientific series colors. */
.wp-app {
  font-size: var(--app-font-secondary, 13px);
  container-type: inline-size;
}
.wp-shell {
  padding: 24px 28px 16px;
}
.wp-panel {
  border-radius: var(--app-radius-card, 16px);
}
.wp-app button {
  min-height: var(--app-hit-target, 32px);
  border-radius: var(--app-radius, 10px);
}
.wp-app .wp-tab {
  border-radius: 0;
}
.wp-app .wp-primary {
  background: var(--app-accent);
  border-color: var(--app-accent);
}
.wp-logo {
  background: var(--app-accent-soft);
  border-color: var(--app-accent-border);
}
.wp-notice {
  background: var(--app-info-bg);
  border-color: var(--app-info-border);
  color: var(--app-info-text);
}
.wp-error {
  background: var(--app-error-bg);
  border-color: var(--app-error-border);
  color: var(--app-error-text);
}
.wp-stale {
  background: var(--app-warning-bg);
  border-color: var(--app-warning-border);
  color: var(--app-warning-text);
}
.wp-badge {
  background: var(--app-success-bg);
  border-color: var(--app-success-border);
  color: var(--app-success-text);
}
@container (max-width: 900px) {
  .wp-layout {
    grid-template-columns: 1fr;
  }
  .wp-shell {
    height: auto;
    padding: 20px 16px;
  }
  .wp-top {
    flex-wrap: wrap;
    padding-right: 0;
  }
  .wp-visual {
    min-height: 560px;
  }
}
`;var Ze=ye(ue(),1);function cr(t){if(/<!DOCTYPE/i.test(t))throw new Error("Excel\u6587\u4EF6\u5305\u542B\u4E0D\u652F\u6301\u7684XML\u58F0\u660E\u3002");let h=new DOMParser().parseFromString(t,"application/xml");if(h.getElementsByTagName("parsererror").length)throw new Error("Excel\u5185\u90E8\u6570\u636E\u65E0\u6CD5\u8BFB\u53D6\u3002");return h}function At(t,h){return[...t.getElementsByTagNameNS("*",h)]}async function ne(t,h,l=!0){let i=t.file(h);if(!i){if(l)throw new Error("Excel\u6587\u4EF6\u7F3A\u5C11\u5FC5\u8981\u6570\u636E\uFF1A"+h);return null}return cr(await i.async("string"))}async function Ve(t){if(t.size>2*1024*1024)throw new Error("\u4E95\u659C\u6587\u4EF6\u4E0D\u80FD\u8D85\u8FC72 MB\u3002");let h=t.name.split(".").at(-1).toLowerCase();if(h==="xls")throw new Error("\u8BF7\u5C06\u65E7\u7248.xls\u53E6\u5B58\u4E3A.xlsx\u6216CSV\u540E\u5BFC\u5165\u3002");if(h!=="xlsx")return Me(await t.text());let l=await Ze.default.loadAsync(await t.arrayBuffer()),i=Object.values(l.files);if(i.length>1024||i.reduce((g,y)=>g+(y._data?.uncompressedSize||0),0)>20*1024*1024)throw new Error("Excel\u5C55\u5F00\u6570\u636E\u8D85\u8FC720 MB\u6216\u6587\u4EF6\u9879\u8FC7\u591A\u3002");let n=await ne(l,"xl/workbook.xml"),r=await ne(l,"xl/_rels/workbook.xml.rels"),o=At(n,"sheet").find(g=>!["hidden","veryHidden"].includes(g.getAttribute("state")));if(!o)throw new Error("Excel\u6CA1\u6709\u53EF\u89C1\u5DE5\u4F5C\u8868\u3002");let w=o.getAttribute("r:id")||o.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships","id"),x=At(r,"Relationship").find(g=>g.getAttribute("Id")===w),c=x?.getAttribute("Target")||"";if(!c||c.includes("..")||c.includes("\\")||x.getAttribute("TargetMode")==="External")throw new Error("Excel\u5DE5\u4F5C\u8868\u5173\u7CFB\u65E0\u6548\u3002");let m=c.startsWith("/")?c.slice(1):"xl/"+c;if(!m.startsWith("xl/worksheets/"))throw new Error("Excel\u5DE5\u4F5C\u8868\u8DEF\u5F84\u65E0\u6548\u3002");let p=await ne(l,m),f=await ne(l,"xl/sharedStrings.xml",!1),s=f?At(f,"si").map(g=>At(g,"t").map(y=>y.textContent).join("")):[],d=At(p,"row");if(d.length>5e3)throw new Error("Excel\u5DE5\u4F5C\u8868\u8D85\u8FC75000\u884C\uFF0C\u8BF7\u4EC5\u4FDD\u7559\u4E95\u659C\u6D4B\u70B9\u3002");let u=d.map(g=>{let y=[];for(let z of At(g,"c")){let S=z.getAttribute("r")?.match(/^[A-Z]+/i)?.[0];if(!S)throw new Error("Excel\u5355\u5143\u683C\u5750\u6807\u65E0\u6548\u3002");let B=[...S.toUpperCase()].reduce((O,$)=>O*26+$.charCodeAt(0)-64,0)-1;if(B>255)throw new Error("Excel\u5217\u6570\u8FC7\u591A\u3002");if(At(z,"f").length){y[B]={formula:!0};continue}let N=At(z,"v")[0]?.textContent??"",P=z.getAttribute("t");y[B]=P==="s"?s[Number(N)]??"":P==="inlineStr"?At(z,"t").map(O=>O.textContent).join(""):N}return y});return te(u)}var q=window.QwenPaw.host.React,{useMemo:hr,useState:Xt,useRef:fr}=q,be=["#2d78b7","#259b98","#7f8db5","#bd8b55"];function He(t,h){let l=0,i=t.rows.length-1;for(;l<i;){let w=Math.floor((l+i)/2);t.rows[w][0]<h?l=w+1:i=w}if(!l)return t.rows[0][1];let n=t.rows[l-1],r=t.rows[l],o=(h-n[0])/(r[0]-n[0]);return n[1]+o*(r[1]-n[1])}function Ge(t){let h=Math.max(1,Math.ceil(t.trajectory.length/850)),l=new Set([...t.survey.map(i=>i.md),...t.segments.map(i=>i.end)]);return t.trajectory.filter((i,n,r)=>l.has(i.md)||n%h===0||n===r.length-1)}function Ke({result:t}){let h=Ge(t),l=h.at(-1),i=Math.atan2(l.east,l.north),n=d=>d.north*Math.cos(i)+d.east*Math.sin(i),r=h.map(n),o=h.map(d=>d.tvd),w=Math.min(0,...r),x=Math.max(1,...r),c=Math.min(0,...o),m=Math.max(1,...o),p=Math.min(112/(x-w),390/(m-c)),f=d=>18+(112-(x-w)*p)/2+(n(d)-w)*p,s=d=>40+(d.tvd-c)*p;return q.createElement("aside",{className:"wp-schematic","aria-label":"\u4E95\u8F68\u8FF9\u5256\u9762\u9884\u89C8"},q.createElement("h3",null,"\u4E95\u8F68\u8FF9\u5256\u9762"),q.createElement("div",{className:"wp-sub"},"\u6700\u5C0F\u66F2\u7387 \xB7 \u7B49\u6BD4\u4F8B"),q.createElement("svg",{viewBox:"0 0 150 490",role:"img","aria-label":"\u7531\u6D4B\u659C\u6570\u636E\u751F\u6210\u7684\u4E95\u8F68\u8FF9\u5256\u9762"},q.createElement("rect",{width:"150",height:"490",fill:"#fbfdff"}),q.createElement("line",{x1:f(h[0]),x2:f(h[0]),y1:"32",y2:"448",stroke:"#dbe5ee",strokeDasharray:"3 3"}),h.slice(1).map((d,u)=>q.createElement("line",{key:u,x1:f(h[u]),y1:s(h[u]),x2:f(d),y2:s(d),stroke:be[Ct(t.segments,(d.md+h[u].md)/2)%4],strokeWidth:"4",strokeLinecap:"round"})),q.createElement("circle",{cx:f(h[0]),cy:s(h[0]),r:"4",fill:"#2d78b7"}),q.createElement("text",{x:f(h[0]),y:s(h[0])-12,fontSize:"10",textAnchor:"middle",fill:"#71899f"},"\u4E95\u53E3"),q.createElement("circle",{cx:f(l),cy:s(l),r:"4",fill:"#d39a56"}),q.createElement("text",{x:"75",y:"466",textAnchor:"middle",fontSize:"10",fill:"#6f8ba1"},"\u5782\u6DF1 ",X(l.tvd,1)," m")),q.createElement("div",{className:"wp-schematic-note"},"MD ",X(l.md,0)," m",q.createElement("br",null),"\u6295\u5F71\u65B9\u4F4D ",X((i*180/Math.PI+360)%360,1),"\xB0",q.createElement("br",null),"\u989C\u8272\u533A\u5206\u6D41\u52A8\u4E95\u6BB5\u3002"))}function ve({result:t,disabled:h,onImport:l,pending:i,onCompute:n}){let[r,o]=Xt("3d"),[w,x]=Xt(35),[c,m]=Xt(30),[p,f]=Xt("structure"),[s,d]=Xt(0),u=fr(null),g=hr(()=>t.survey?Ot(t.survey):null,[t.survey]);if(!g)return q.createElement("div",{className:"wp-table-empty"},q.createElement("strong",null,i?"\u4E95\u659C\u6570\u636E\u5DF2\u5BFC\u5165\uFF0C\u70B9\u51FB\u8BA1\u7B97\u751F\u6210\u8F68\u8FF9":"\u5BFC\u5165\u4E95\u659C\u6570\u636E\uFF0C\u91CD\u5EFA\u4E95\u8F68\u8FF9"),q.createElement("p",null,"\u6D4B\u6DF1MD(m) \xB7 \u4E95\u659C\u89D2Inc(\xB0) \xB7 \u65B9\u4F4D\u89D2Azi(\xB0)"),q.createElement("p",null,"\u652F\u6301CSV\u3001TSV\u3001JSON\u548CExcel .xlsx\uFF1B\u4E95\u659C\u89D2\u4ECE\u5782\u76F4\u5411\u4E0B\u8BA1\u3002"),q.createElement("button",{onClick:i?n:l},i?"\u8BA1\u7B97\u4E95\u7B52\u538B\u529B":"\u5BFC\u5165\u4E95\u659C\u6570\u636E"));let y=Ge(t),z=y.at(-1),S=Nt(g,Math.min(s,g.depth)),B=840,N=490,P=55,O=w*Math.PI/180,$=c*Math.PI/180,Q=nt=>r==="plan"?[nt.east,-nt.north]:r==="section"?[nt.north*Math.cos(O)+nt.east*Math.sin(O),nt.tvd]:[nt.east*Math.cos(O)-nt.north*Math.sin(O),nt.tvd*Math.cos($)-(nt.east*Math.sin(O)+nt.north*Math.cos(O))*Math.sin($)],k=Math.max(100,g.depth*.18),F={north:0,east:0,tvd:0},a=r==="3d"?[[{north:k,east:0,tvd:0},"N"],[{north:0,east:k,tvd:0},"E"],[{north:0,east:0,tvd:k},"TVD"]]:r==="plan"?[[{north:k,east:0,tvd:0},"N"],[{north:0,east:k,tvd:0},"E"]]:[[{north:k*Math.cos(O),east:k*Math.sin(O),tvd:0},"\u6C34\u5E73"],[{north:0,east:0,tvd:k},"TVD"]],C=[...y.map(Q),Q(F),...a.map(([nt])=>Q(nt))],R=C.map(nt=>nt[0]),L=C.map(nt=>nt[1]),et=Math.min(...R),V=Math.max(...R),tt=Math.min(...L),M=Math.max(...L),A=Math.min((B-2*P)/Math.max(V-et,1),(N-2*P)/Math.max(M-tt,1)),rt=nt=>{let[lt,e]=Q(nt);return[B/2+(lt-(et+V)/2)*A,N/2+(e-(tt+M)/2)*A]},J=rt(F),K=rt(S),ht=t.rows.map(nt=>nt[1]),mt=Math.min(...ht),ot=Math.max(...ht);function W(nt,lt=nt){if(p==="structure")return be[Ct(t.segments,(nt.md+lt.md)/2)%4];let e=(He(t,nt.md)-mt)/Math.max(ot-mt,1e-12);return`rgb(${Math.round(39+178*e)},${Math.round(112+22*e)},${Math.round(179-95*e)})`}function ft(){let nt=u.current.cloneNode(!0);nt.setAttribute("xmlns","http://www.w3.org/2000/svg"),nt.setAttribute("width",B),nt.setAttribute("height",N),yt(new XMLSerializer().serializeToString(nt),`\u4E95\u8F68\u8FF9_${r}.svg`,"image/svg+xml;charset=utf-8")}function ut(nt){if(nt.pointerType==="touch")return;let lt=nt.currentTarget.getScreenCTM();if(!lt)return;let e=nt.currentTarget.createSVGPoint();e.x=nt.clientX,e.y=nt.clientY;let j=e.matrixTransform(lt.inverse()),T=y[0],v=1/0;for(let b of y){let E=rt(b),U=(E[0]-j.x)**2+(E[1]-j.y)**2;U<v&&(v=U,T=b)}d(T.md)}return q.createElement("div",{className:"wp-trajectory"},q.createElement("div",{className:"wp-trajectory-tools"},q.createElement("div",{className:"wp-modes","aria-label":"\u8F68\u8FF9\u6295\u5F71\u65B9\u5F0F"},[["3d","\u4E09\u7EF4\u8F68\u8FF9"],["section","\u5782\u76F4\u5256\u9762"],["plan","\u5E73\u9762\u8F68\u8FF9"]].map(([nt,lt])=>q.createElement("button",{key:nt,"aria-pressed":r===nt,onClick:()=>o(nt)},lt))),q.createElement("div",{className:"wp-toolbar"},q.createElement("select",{className:"wp-head-select","aria-label":"\u8F68\u8FF9\u7740\u8272",value:p,onChange:nt=>f(nt.target.value)},q.createElement("option",{value:"structure"},"\u6309\u4E95\u6BB5\u7740\u8272"),q.createElement("option",{value:"pressure"},"\u6309\u538B\u529B\u7740\u8272")),q.createElement("button",{disabled:h,onClick:ft},"\u5BFC\u51FA\u8F68\u8FF9SVG"))),q.createElement("div",{className:"wp-trajectory-caption"},"\u6700\u5C0F\u66F2\u7387\u6CD5 \xB7 \u4E95\u53E3\u4E3A\u5C40\u90E8\u5750\u6807\u539F\u70B9 \xB7 ",t.survey.length," \u4E2A\u6D4B\u70B9 \xB7 \u672B\u70B9\u5782\u6DF1 ",X(z.tvd,1)," m \xB7 \u6C34\u5E73\u4F4D\u79FB"," ",X(Math.hypot(z.north,z.east),1)," m"),q.createElement("svg",{ref:u,className:"wp-trajectory-svg",viewBox:`0 0 ${B} ${N}`,role:"img","aria-label":r==="3d"?"\u6D4B\u659C\u6570\u636E\u4E09\u7EF4\u4E95\u8F68\u8FF9":r==="plan"?"\u4E95\u8F68\u8FF9\u5E73\u9762\u56FE":"\u4E95\u8F68\u8FF9\u5782\u76F4\u5256\u9762\u56FE",onPointerMove:ut},q.createElement("rect",{width:B,height:N,fill:"white"}),Array.from({length:7},(nt,lt)=>q.createElement("g",{key:lt},q.createElement("line",{x1:P,x2:B-P,y1:P+lt*(N-2*P)/6,y2:P+lt*(N-2*P)/6,stroke:"#f0f4f8"}),q.createElement("line",{x1:P+lt*(B-2*P)/6,x2:P+lt*(B-2*P)/6,y1:P,y2:N-P,stroke:"#f4f7fa"}))),a.map(([nt,lt])=>{let e=rt(nt);return q.createElement("g",{key:lt},q.createElement("line",{x1:J[0],y1:J[1],x2:e[0],y2:e[1],stroke:"#b2c4d4",strokeWidth:"1.4"}),q.createElement("text",{x:e[0]+7,y:e[1]+3,fontSize:"11",fill:"#8298ab"},lt))}),y.slice(1).map((nt,lt)=>{let e=rt(y[lt]),j=rt(nt);return q.createElement("line",{key:lt,x1:e[0],y1:e[1],x2:j[0],y2:j[1],stroke:W(nt,y[lt]),strokeWidth:"4.5",strokeLinecap:"round"})}),q.createElement("circle",{cx:J[0],cy:J[1],r:"5",fill:"#214f79",stroke:"white",strokeWidth:"2"}),q.createElement("text",{x:J[0]+9,y:J[1]-9,fontSize:"11",fill:"#56728a"},"\u4E95\u53E3"),q.createElement("circle",{cx:rt(z)[0],cy:rt(z)[1],r:"5",fill:"#cf9652",stroke:"white",strokeWidth:"2"}),q.createElement("text",{x:rt(z)[0]+9,y:rt(z)[1]+14,fontSize:"11",fill:"#7c8fa0"},"\u4E95\u5E95 MD ",X(z.md,0)," m"),q.createElement("circle",{cx:K[0],cy:K[1],r:"7",fill:"white",stroke:"#1c78b4",strokeWidth:"2.5"}),q.createElement("text",{x:P,y:"24",fontSize:"11",fill:"#69859b"},r==="3d"?"\u4E09\u7EF4\u6295\u5F71\uFF08\u7B49\u6BD4\u4F8B\uFF09":r==="plan"?"E\u5411\u53F3\uFF0CN\u5411\u4E0A \xB7 \u5355\u4F4Dm":`\u5256\u9762\u65B9\u4F4D ${w}\xB0 \xB7 \u6C34\u5E73\u4F4D\u79FB\u4E0E\u5782\u6DF1\uFF08m\uFF09`),q.createElement("line",{x1:B-180,x2:B-60,y1:N-20,y2:N-20,stroke:"#8299ad"}),q.createElement("text",{x:B-120,y:N-28,textAnchor:"middle",fontSize:"10",fill:"#8299ad"},X(120/A,0)," m")),q.createElement("div",{className:"wp-trajectory-controls"},r!=="plan"&&q.createElement("label",null,r==="section"?"\u5256\u9762\u65B9\u4F4D\u89D2":"\u6C34\u5E73\u65CB\u8F6C"," ",w,"\xB0",q.createElement("input",{"aria-label":"\u8F68\u8FF9\u6C34\u5E73\u65CB\u8F6C",type:"range",min:"0",max:"360",value:w,onChange:nt=>x(Number(nt.target.value))})),r==="3d"&&q.createElement("label",null,"\u4FEF\u89C6\u89D2 ",c,"\xB0",q.createElement("input",{"aria-label":"\u8F68\u8FF9\u4FEF\u89C6\u89D2",type:"range",min:"10",max:"80",value:c,onChange:nt=>m(Number(nt.target.value))})),q.createElement("label",null,"\u67E5\u8BE2\u6D4B\u6DF1 ",X(s,1)," m",q.createElement("input",{"aria-label":"\u8F68\u8FF9\u67E5\u8BE2\u6D4B\u6DF1",type:"range",min:"0",max:g.depth,step:g.depth/1e3,value:s,onChange:nt=>d(Number(nt.target.value))}))),q.createElement("div",{className:"wp-coordinate-card"},q.createElement("span",null,"MD ",q.createElement("b",null,X(S.md,1))," m"),q.createElement("span",null,"TVD ",q.createElement("b",null,X(S.tvd,1))," m"),q.createElement("span",null,"N ",q.createElement("b",null,X(S.north,1))," m"),q.createElement("span",null,"E ",q.createElement("b",null,X(S.east,1))," m"),q.createElement("span",null,"Inc ",q.createElement("b",null,X(S.inc,1)),"\xB0"),q.createElement("span",null,"Azi ",q.createElement("b",null,X(S.azi,1)),"\xB0"),q.createElement("span",null,"\u538B\u529B ",q.createElement("b",null,X(He(t,S.md)))," MPa")),q.createElement("div",{className:"wp-trajectory-legend"},p==="structure"?t.segments.map((nt,lt)=>q.createElement("span",{key:lt},q.createElement("i",{style:{background:be[lt%4]}}),nt.name)):q.createElement("span",null,q.createElement("i",{className:"wp-pressure-gradient"}),X(mt)," \uFF5E ",X(ot)," MPa")))}var Xe=window.QwenPaw,_=Xe.host.React,mr=()=>_.createElement("svg",{width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.6",strokeLinejoin:"round",strokeLinecap:"round","aria-hidden":!0,style:{verticalAlign:"middle",flexShrink:0}},_.createElement("path",{d:"M2.25 3.55h7.35M4 3.55v6.55c0 6.35 4.1 10.45 10.45 10.45h6.4"}),_.createElement("path",{d:"M7.9 3.55v6.55c0 4.05 2.55 6.55 6.55 6.55h6.4"}),_.createElement("circle",{cx:"16.55",cy:"7.45",r:"4.4"}),_.createElement("path",{d:"m16.55 7.45 1.7-1.75m-1.7 6.15v4.8"})),{useState:bt,useRef:ie,useMemo:Ye}=_,ae=(t,h)=>JSON.stringify(t)===JSON.stringify(h);function $t({label:t,unit:h,value:l,onChange:i,error:n,name:r,scale:o=1,...w}){let x=typeof l=="number"&&Number.isFinite(l)?Number((l*o).toPrecision(12)):l;return _.createElement("label",{className:"wp-field"},_.createElement("span",{className:"wp-field-title"},t,_.createElement("span",{className:"wp-unit"},h)),_.createElement("input",{type:"number",step:"any",name:r,"aria-label":t,"aria-invalid":!!n,"aria-describedby":n?`wp-error-${r}`:void 0,value:x,onChange:c=>i(c.target.value===""?"":Number(c.target.value)/o),...w}),n&&_.createElement("span",{id:`wp-error-${r}`,className:"wp-field-error"},n))}function gr({segments:t,depth:h}){let l=0,i=Math.max(...t.map(r=>r.diameter)),n=["#377db6","#278d98","#7198b7","#5787a6"];return _.createElement("aside",{className:"wp-schematic","aria-label":"\u4E95\u8EAB\u7ED3\u6784\u793A\u610F"},_.createElement("h3",null,"\u4E95\u8EAB\u7ED3\u6784"),_.createElement("div",{className:"wp-sub"},t.length," \u4E2A\u4E95\u6BB5 \xB7 MD"),_.createElement("svg",{viewBox:"0 0 150 490",role:"img","aria-label":"\u6309\u5185\u5F84\u7F29\u653E\u7684\u4E95\u8EAB\u7ED3\u6784\u5C55\u5F00\u56FE"},_.createElement("rect",{x:"0",y:"0",width:"150",height:"490",fill:"#fbfdff"}),_.createElement("line",{x1:"65",x2:"65",y1:"30",y2:"440",stroke:"#d9e4ed",strokeDasharray:"3 3"}),_.createElement("text",{x:"65",y:"17",textAnchor:"middle",fill:"#8296a8",fontSize:"10"},"\u4E95\u53E3 \xB7 0 m"),t.map((r,o)=>{let w=l;l=r.end;let x=30+w/h*410,c=(r.end-w)/h*410,m=28+54*r.diameter/i;return _.createElement("g",{key:o},_.createElement("title",null,r.name,"\uFF1A",w,"\uFF5E",r.end," m\uFF0C\u5185\u5F84 ",r.diameter*1e3," mm\uFF0C\u5939\u89D2"," ",r.angle,"\xB0"),_.createElement("rect",{x:65-m/2,y:x,width:m,height:Math.max(c,1),fill:n[o%4],fillOpacity:".13",stroke:n[o%4],strokeWidth:"1.7"}),_.createElement("line",{x1:65-m/2+4,x2:65-m/2+4,y1:x,y2:x+c,stroke:"white",strokeWidth:"2"}),_.createElement("text",{x:"65",y:x+c/2-2,textAnchor:"middle",fill:n[o%4],fontSize:"11",fontWeight:"600"},"\xD8 ",X(r.diameter*1e3,0)),c>55&&_.createElement("text",{x:"65",y:x+c/2+14,textAnchor:"middle",fill:"#7a93a7",fontSize:"9"},X(r.angle,0),"\xB0"),_.createElement("line",{x1:"110",x2:"117",y1:x+c,y2:x+c,stroke:"#9bb0c1"}),_.createElement("text",{x:"120",y:x+c+3,fill:"#8ba1b3",fontSize:"8"},X(r.end,0)))}),_.createElement("text",{x:"65",y:"463",textAnchor:"middle",fill:"#61849d",fontSize:"10"},"\u4E95\u5E95 ",X(h,0)," m"),_.createElement("text",{x:"65",y:"480",textAnchor:"middle",fill:"#91a5b5",fontSize:"9"},"\u5185\u5F84 / mm")),_.createElement("div",{className:"wp-schematic-note"},"\u6CBF\u6D4B\u6DF1\u5C55\u5F00\uFF0C\u6A2A\u5411\u653E\u5927\u3002",_.createElement("br",null),"\u5782\u6DF1\u7EA6 ",X(Se(t),1)," m",_.createElement("br",null),"\u4E0D\u8868\u793A\u5B9E\u9645\u4E95\u773C\u8F68\u8FF9\u3002"))}function Jt({headers:t,rows:h}){return _.createElement("div",{className:"wp-table-wrap"},_.createElement("table",null,_.createElement("thead",null,_.createElement("tr",null,t.map((l,i)=>_.createElement("th",{key:i,scope:"col"},l)))),_.createElement("tbody",null,h.map((l,i)=>_.createElement("tr",{key:i},l.map((n,r)=>_.createElement("td",{key:r},n)))))))}function wr(){let[t,h]=bt({...Ft}),[l,i]=bt(kt[0]),[n,r]=bt(1),[o,w]=bt(100),[x,c]=bt("uniform"),[m,p]=bt(()=>Pt(Ft)),[f,s]=bt(null),[d,u]=bt("tvd"),[g,y]=bt(!1),z=ie(null),[S,B]=bt(()=>Yt(Ft,kt[0])),[N,P]=bt("chart"),[O,$]=bt("pressure"),[Q,k]=bt("profile"),[F,a]=bt(!0),[C,R]=bt(null),[L,et]=bt(""),[V,tt]=bt(""),[M,A]=bt(!1),[rt,J]=bt(!1),K=ie(null),ht=ie(null),mt=ie(null),ot=Ye(()=>Fe(S,o),[S,o]),{result:W,comparison:ft,quality:ut}=ot,nt=Ye(()=>W.survey?Ot(W.survey):null,[W.survey]),lt=x==="segmented"?m:null,e=zt.some(([D])=>t[D]!==W.params[D])||l!==W.model||n!==S.gridFactor||!ae(lt,S.structure)||!ae(f,S.survey)||f&&d!==S.temperatureBasis,j=M?Rt(t):{},T=()=>{et(""),tt("")};function v(D,Y){h(at=>({...at,[D]:Y})),T()}function b(D){D?.preventDefault(),A(!0);try{let Y=Yt(t,l,n,lt,f,d);B(Y),h(Y.result.params),Y.structure&&p(Y.structure),et(""),tt("\u8BA1\u7B97\u5B8C\u6210\uFF0C\u4E95\u8EAB\u7ED3\u6784\u4E0E\u7ED3\u679C\u5DF2\u540C\u6B65\u3002")}catch(Y){et(Y.message),tt("");let at=Object.keys(Rt(t))[0];at&&mt.current?.closest(".wp-app")?.querySelector(`[name="${at}"]`)?.focus()}}function E(){h({...Ft}),i(kt[0]),r(1),w(100),c("uniform"),p(Pt(Ft)),B(Yt(Ft,kt[0])),R(null),s(null),u("tvd"),A(!1),et(""),tt("\u5DF2\u6062\u590D\u5355\u4E95\u6BB5\u793A\u4F8B\u3002")}function U(D){if(D!==x){if(D==="segmented")p(Pt(t));else{let Y=m[0];h(at=>({...at,diameter:Y.diameter,angle:Y.angle,roughness:Y.roughness}))}c(D),T()}}function Z(D,Y,at){p(wt=>wt.map((vt,Vt)=>Vt===D?{...vt,[Y]:at}:vt)),T()}function I(){try{let D=Et(m,t.depth),Y=D.at(-1),at=D.length>1?D.at(-2).end:0;if(D.length>=30)throw new Error("\u6700\u591A\u652F\u630130\u4E2A\u4E95\u6BB5\u3002");if(Y.end-at<.2)throw new Error("\u6700\u540E\u4E95\u6BB5\u8FC7\u77ED\uFF0C\u65E0\u6CD5\u7EE7\u7EED\u62C6\u5206\u3002");p([...D.slice(0,-1),{...Y,end:Math.round((at+Y.end)/2*1e4)/1e4},{...Y,name:`\u4E95\u6BB5 ${D.length+1}`}]),T()}catch(D){et(D.message)}}function H(D){m.length!==1&&(p(Y=>{let at=Y.filter((wt,vt)=>D!==vt).map(wt=>({...wt}));return D===Y.length-1&&(at.at(-1).end=t.depth),at}),T())}function it(){let D=Number(t.depth);if(!(D>=1&&D<=1e4)){et("\u8BF7\u5148\u8BBE\u7F6E\u6709\u6548\u7684\u603B\u4E95\u6DF1\u3002");return}c("segmented"),p([{name:"\u4E0A\u90E8\u4E95\u6BB5",end:D*.3,diameter:.114,angle:90,roughness:1e-5},{name:"\u4E2D\u90E8\u4E95\u6BB5",end:D*.7,diameter:.089,angle:75,roughness:1e-5},{name:"\u4E0B\u90E8\u4E95\u6BB5",end:D,diameter:.076,angle:60,roughness:1e-5}]),tt("\u5DF2\u586B\u5165\u4E09\u6BB5\u793A\u4F8B\uFF0C\u70B9\u51FB\u8BA1\u7B97\u5E94\u7528\u65B0\u7ED3\u6784\u3002"),et("")}function G(D){let Y=Ot(D),at=Y.depth;if(x==="segmented"){let wt=m.map((vt,Vt)=>Vt===m.length-1?{...vt,end:at}:vt);Et(wt,at),p(wt)}s(Y.survey),h(wt=>({...wt,depth:at})),u("tvd"),et(""),P("trajectory"),tt(`\u5DF2\u5BFC\u5165${D.length}\u4E2A\u6D4B\u70B9\uFF0C\u603B\u6D4B\u6DF1\u540C\u6B65\u4E3A${at} m\uFF1B\u70B9\u51FB\u8BA1\u7B97\u751F\u6210\u8F68\u8FF9\u548C\u538B\u529B\u3002`)}async function st(D){let Y=D.target.files?.[0];if(D.target.value="",!!Y){y(!0);try{G(await Ve(Y))}catch(at){et("\u4E95\u659C\u5BFC\u5165\u5931\u8D25\uFF1A"+at.message)}finally{y(!1)}}}function ct(){try{G(ge)}catch(D){et(D.message)}}function pt(){yt(me(ge),"\u4E95\u659C\u6570\u636E\u6A21\u677F.csv","text/csv;charset=utf-8"),tt("\u6A21\u677F\u5DF2\u4E0B\u8F7D\uFF1AMD\u4E3A\u7C73\uFF0CInc\u4ECE\u5782\u76F4\u5411\u4E0B\u8BA1\uFF0CAzi\u4ECE\u6570\u636E\u5317\u5411\u987A\u65F6\u9488\u8BA1\uFF0C\u89D2\u5EA6\u5355\u4F4D\u4E3A\u5EA6\u3002")}async function xt(D){let Y=D.target.files?.[0];if(D.target.value="",!!Y)try{if(Y.size>1e5)throw new Error("\u65B9\u6848\u6587\u4EF6\u8D85\u8FC7100 KB\u3002");let at=je(JSON.parse(await Y.text())),wt=Yt(at.parameters,at.model,at.gridFactor,at.structure||null,at.survey||null,at.temperatureBasis||"md");h(wt.result.params),s(at.survey||null),u(at.temperatureBasis||"md"),i(at.model),r(at.gridFactor),w(at.interval),c(at.structure?"segmented":"uniform"),p(at.structure||Pt(at.parameters)),B(wt),et(""),A(!1),tt("\u65B9\u6848\u5DF2\u8F7D\u5165\u5E76\u91CD\u65B0\u8BA1\u7B97\u3002")}catch(at){et("\u8F7D\u5165\u5931\u8D25\uFF1A"+at.message)}}async function Tt(D){let Y=D.target.files?.[0];if(D.target.value="",!!Y)try{if(Y.size>1e5)throw new Error("\u7ED3\u6784\u6587\u4EF6\u8D85\u8FC7100 KB\u3002");let at=Ce(await Y.text(),t.depth);p(at),c("segmented"),et(""),tt(`\u5DF2\u5BFC\u5165 ${at.length} \u4E2A\u4E95\u6BB5\uFF0C\u70B9\u51FB\u8BA1\u7B97\u5E94\u7528\u7ED3\u6784\u3002`)}catch(at){et("\u7ED3\u6784\u5BFC\u5165\u5931\u8D25\uFF1A"+at.message)}}function _t(){try{let D=Et(x==="segmented"?m:Pt(t),t.depth);yt(he(D),"\u4E95\u8EAB\u7ED3\u6784\u6A21\u677F.csv","text/csv;charset=utf-8"),tt("\u7ED3\u6784\u6A21\u677F\u5DF2\u5BFC\u51FA\uFF1A\u6D4B\u6DF1m\u3001\u5185\u5F84mm\u3001\u5939\u89D2\u5EA6\u3001\u7C97\u7CD9\u5EA6mm\u3002"),et("")}catch(D){et(D.message)}}async function Bt(){J(!0);try{yt(await We(W,ft,{interval:o,quality:ut,baseline:C}),"\u4E95\u7B52\u538B\u529B_"+W.model+".xlsx","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),tt("Excel\u5DF2\u5BFC\u51FA\uFF0C\u5305\u542B\u4E95\u8EAB\u7ED3\u6784\u3001\u5B8C\u6574\u5256\u9762\u548C\u8BA1\u7B97\u68C0\u67E5\u3002")}catch(D){et("\u5BFC\u51FA\u5931\u8D25\uFF1A"+D.message)}finally{J(!1)}}function gt(){if(Q==="structure"){yt(he(W.segments),"\u4E95\u8EAB\u7ED3\u6784.csv","text/csv;charset=utf-8"),tt("\u4E95\u8EAB\u7ED3\u6784CSV\u5DF2\u5BFC\u51FA\uFF0C\u53EF\u91CD\u65B0\u5BFC\u5165\u3002");return}if(Q==="survey"){if(!W.survey)return;yt(me(W.survey),"\u4E95\u659C\u6570\u636E.csv","text/csv;charset=utf-8"),tt("\u539F\u59CB\u4E95\u659C\u6D4B\u70B9CSV\u5DF2\u5BFC\u51FA\uFF0C\u53EF\u91CD\u65B0\u5BFC\u5165\u3002");return}if(Q==="trajectory"){if(!W.survey)return;let Y=Ot(W.survey),at=[["MD_m","TVD_m","North_m","East_m","Inc_deg","Azi_deg","Pressure_MPa"],...W.samples.map(wt=>{let vt=Nt(Y,wt[0]);return[wt[0],vt.tvd,vt.north,vt.east,vt.inc,vt.azi,wt[1]]})];yt("\uFEFF"+at.map(wt=>wt.join(",")).join(`\r
`),"\u4E95\u8F68\u8FF9\u538B\u529B\u5256\u9762.csv","text/csv;charset=utf-8"),tt("\u4E95\u8F68\u8FF9\u4E0E\u538B\u529B\u6570\u636E\u5DF2\u5BFC\u51FA\u3002");return}if(Q==="baseline"&&!C)return;let D=Q==="baseline"?[["\u6BD4\u8F83\u9879\u76EE","\u56FA\u5B9A\u57FA\u51C6","\u5F53\u524D\u7ED3\u679C"],["\u4E95\u5E95\u538B\u529B_MPa",C.bottom,W.bottom],["\u6469\u963B\u538B\u5DEE_MPa",C.friction,W.friction],["\u6A21\u578B",C.model,W.model],["\u4E95\u6BB5\u6570",C.segments.length,W.segments.length],...zt.map(([Y,at])=>[at,C.params[Y],W.params[Y]])]:[Qt,...W.samples.map(Y=>[Y[0],W.segments[Ct(W.segments,Y[0])].name,...Y.slice(1)])];yt("\uFEFF"+D.map(Y=>Y.map(at=>`"${String(at).replaceAll('"','""')}"`).join(",")).join(`\r
`),Q==="baseline"?"\u4E95\u7B52\u5DE5\u51B5\u5BF9\u6BD4.csv":`\u4E95\u7B52\u538B\u529B_${o}m.csv`,"text/csv;charset=utf-8"),tt("\u5F53\u524D\u6570\u636E\u8868CSV\u5DF2\u5BFC\u51FA\u3002")}function jt(){yt(JSON.stringify(Pe(S,o),null,2),"\u4E95\u7B52\u538B\u529B_\u8BA1\u7B97\u65B9\u6848.json","application/json"),tt("\u65B9\u6848\u5DF2\u4FDD\u5B58\uFF0C\u542B\u4E95\u8EAB\u7ED3\u6784\u3001\u7F51\u683C\u548C\u91C7\u6837\u8BBE\u7F6E\u3002")}function Lt(){R(W),tt("\u5DF2\u56FA\u5B9A\u5F53\u524D\u7ED3\u679C\uFF0C\u4FEE\u6539\u53C2\u6570\u6216\u4E95\u8EAB\u7ED3\u6784\u5E76\u8BA1\u7B97\u540E\u53EF\u6BD4\u8F83\u3002")}let St=W.bottom-W.params.pressure,qt=C?Le(C.params,W.params):[],se=C&&!ae(C.segments,W.segments),oe=[["diameter","\u6CB9\u7BA1\u5185\u5F84","mm",1e3],["angle","\u4E0E\u6C34\u5E73\u9762\u5939\u89D2","\xB0",1],["roughness","\u7BA1\u58C1\u7C97\u7CD9\u5EA6","mm",1e3]],Qt=["\u4E95\u6DF1 / m","\u4E95\u6BB5","\u538B\u529B / MPa","\u6E29\u5EA6 / K","\u5BC6\u5EA6 / kg\xB7m\u207B\xB3","\u6D41\u901F / m\xB7s\u207B\xB9","\u6469\u963B / kPa\xB7m\u207B\xB9","\u91CD\u529B / kPa\xB7m\u207B\xB9"],Zt=0,Dt=W.segments.map(D=>{let Y=[D.name,X(Zt,1),X(D.end,1),X(D.diameter*1e3,2),X(D.angle,1),X(D.roughness*1e3,4)];return Zt=D.end,Y});return _.createElement("main",{className:"wp-app"},_.createElement("style",null,$e),_.createElement("div",{className:"wp-shell"},_.createElement("header",{className:"wp-top"},_.createElement("div",{className:"wp-brand"},_.createElement("div",{className:"wp-logo","aria-hidden":"true"},_.createElement(mr,null)),_.createElement("div",null,_.createElement("div",{className:"wp-eyebrow"},"UGSCI \xB7 WELLBORE WORKBENCH"),_.createElement("h1",null,"\u4E95\u7B52\u538B\u529B\u8BA1\u7B97"),_.createElement("div",{className:"wp-sub"},"\u914D\u7F6E\u4E95\u7B52\u4E0E\u4E95\u8EAB\u7ED3\u6784\uFF0C\u67E5\u770B\u6CBF\u4E95\u6DF1\u7684\u6D41\u52A8\u53D8\u5316"))),_.createElement("div",{className:"wp-toolbar"},_.createElement("span",{className:"wp-badge"},"\u672C\u5730\u8BA1\u7B97"),_.createElement("button",{onClick:()=>K.current.click()},"\u8F7D\u5165\u65B9\u6848"),_.createElement("button",{disabled:e,onClick:jt},"\u4FDD\u5B58\u65B9\u6848"),_.createElement("input",{className:"wp-hidden",type:"file",ref:K,accept:".json,application/json",onChange:xt,"aria-label":"\u8F7D\u5165\u8BA1\u7B97\u65B9\u6848\u6587\u4EF6"}))),(L||V||e)&&_.createElement("div",{className:`wp-notice ${L?"wp-error":e?"wp-stale":""}`,role:L?"alert":"status"},L||(e?"\u53C2\u6570\u3001\u7ED3\u6784\u6216\u4E95\u659C\u5DF2\u4FEE\u6539\uFF0C\u53F3\u4FA7\u4FDD\u7559\u4E0A\u6B21\u7ED3\u679C\u3002\u70B9\u51FB\u8BA1\u7B97\u66F4\u65B0\u3002":V)),_.createElement("div",{className:"wp-layout"},_.createElement("aside",{className:"wp-left"},_.createElement("section",{className:"wp-panel","aria-label":"\u4E95\u7B52\u53C2\u6570\u8BBE\u7F6E"},_.createElement("div",{className:"wp-panel-head"},_.createElement("h2",null,_.createElement("span",{className:"wp-index"},"01 / "),"\u4E95\u7B52\u53C2\u6570"),_.createElement("button",{className:"wp-link",onClick:E},"\u6062\u590D\u793A\u4F8B")),_.createElement("form",{ref:mt,className:"wp-form",onSubmit:b,noValidate:!0},_.createElement("label",{className:"wp-field"},_.createElement("span",{className:"wp-field-title"},"\u8BA1\u7B97\u6A21\u578B"),_.createElement("select",{"aria-label":"\u8BA1\u7B97\u6A21\u578B",value:l,onChange:D=>{i(D.target.value),T()}},kt.map(D=>_.createElement("option",{key:D},D)))),_.createElement("label",{className:"wp-field"},_.createElement("span",{className:"wp-field-title"},"\u8BA1\u7B97\u7CBE\u5EA6"),_.createElement("select",{"aria-label":"\u7F51\u683C\u6A21\u5F0F",value:n,onChange:D=>{r(Number(D.target.value)),T()}},_.createElement("option",{value:"1"},"\u6807\u51C6\u7F51\u683C"),_.createElement("option",{value:"2"},"\u52A0\u5BC6\u7F51\u683C\uFF082\u500D\uFF09"))),zt.filter(([D])=>!["diameter","roughness","angle"].includes(D)).map(([D,Y,at,wt,vt])=>_.createElement($t,{key:D,label:D==="depth"?"\u603B\u4E95\u6DF1\uFF08\u6D4B\u6DF1\uFF09":Y,unit:at,name:D,value:t[D],error:j[D],min:wt,max:vt,onChange:Vt=>v(D,Vt)})),f?_.createElement("label",{className:"wp-field"},_.createElement("span",{className:"wp-field-title"},"\u5730\u6E29\u68AF\u5EA6\u57FA\u51C6"),_.createElement("select",{"aria-label":"\u5730\u6E29\u68AF\u5EA6\u57FA\u51C6",value:d,onChange:D=>{u(D.target.value),T()}},_.createElement("option",{value:"tvd"},"\u6309\u5782\u6DF1TVD"),_.createElement("option",{value:"md"},"\u6309\u6D4B\u6DF1MD\uFF08\u65E7\u7248\uFF09"))):_.createElement("div",{className:"wp-field"},_.createElement("div",{className:"wp-field-title"},"\u6E29\u5EA6\u6362\u7B97",_.createElement("span",{className:"wp-unit"},"\xB0C")),_.createElement("div",{style:{padding:"7px 0",color:"#7b91a6"}},Number.isFinite(t.temperature)?X(t.temperature-273.15,2):"\u2014"," ","\xB0C")),_.createElement("div",{className:"wp-wide wp-calc-footer"},_.createElement("span",{className:"wp-hint"},"\u7EDD\u5BF9\u538B\u529B \xB7 \u5355\u6C14\u76F8\u91C7\u6C14",_.createElement("br",null),"\u6BCF\u6B21\u8BA1\u7B97\u540C\u65F6\u6267\u884C\u7F51\u683C\u52A0\u5BC6\u68C0\u67E5"),_.createElement("button",{type:"submit",className:"wp-primary"},"\u8BA1\u7B97\u4E95\u7B52\u538B\u529B ",_.createElement("span",{"aria-hidden":"true"},"\u2192"))))),_.createElement("section",{className:"wp-panel wp-structure","aria-label":"\u4E95\u8EAB\u7ED3\u6784\u8BBE\u7F6E"},_.createElement("div",{className:"wp-panel-head"},_.createElement("h2",null,_.createElement("span",{className:"wp-index"},"02 / "),"\u4E95\u8EAB\u7ED3\u6784"),_.createElement("span",{className:"wp-sub"},x==="segmented"?m.length:1," \u4E2A\u4E95\u6BB5")),_.createElement("div",{className:"wp-structure-tools"},_.createElement("div",{className:"wp-modes","aria-label":"\u4E95\u8EAB\u7ED3\u6784\u6A21\u5F0F"},_.createElement("button",{"aria-pressed":x==="uniform",onClick:()=>U("uniform")},"\u7EDF\u4E00\u4E95\u7B52"),_.createElement("button",{"aria-pressed":x==="segmented",onClick:()=>U("segmented")},"\u5206\u6BB5\u7ED3\u6784")),_.createElement("div",{className:"wp-toolbar"},_.createElement("button",{className:"wp-import",onClick:()=>ht.current.click()},"\u5BFC\u5165\u7ED3\u6784"),_.createElement("button",{className:"wp-link",onClick:_t},"CSV\u6A21\u677F")),_.createElement("input",{className:"wp-hidden",type:"file",ref:ht,accept:".csv,.json,text/csv,application/json",onChange:Tt,"aria-label":"\u5BFC\u5165\u4E95\u8EAB\u7ED3\u6784\u6587\u4EF6"})),_.createElement("div",{className:"wp-survey-box"},_.createElement("div",{className:"wp-survey-heading"},_.createElement("strong",null,"\u4E95\u659C\u6570\u636E"),_.createElement("div",{className:"wp-toolbar"},_.createElement("button",{disabled:g,className:"wp-import",onClick:()=>z.current.click()},g?"\u8BFB\u53D6\u4E2D\u2026":"\u5BFC\u5165\u4E95\u659C"),_.createElement("button",{className:"wp-link",onClick:pt},"\u4E95\u659C\u6A21\u677F"),_.createElement("button",{className:"wp-link",onClick:ct},"\u793A\u4F8B"))),_.createElement("input",{ref:z,className:"wp-hidden",type:"file",accept:".csv,.tsv,.json,.xlsx,.xls",onChange:st,"aria-label":"\u5BFC\u5165\u4E95\u659C\u6570\u636E\u6587\u4EF6"}),f?_.createElement("div",{className:"wp-survey-loaded"},_.createElement("span",null,f.length,"\u6D4B\u70B9 \xB7 MD ",X(f.at(-1).md,0)," m \xB7 \u6700\u5927Inc ",X(Math.max(...f.map(D=>D.inc)),1),"\xB0"),_.createElement("button",{className:"wp-link",onClick:()=>{s(null),T()}},"\u6E05\u9664\u4E95\u659C")):_.createElement("p",{className:"wp-hint"},"CSV / JSON / XLSX \xB7 MD(m)\u3001Inc(\xB0)\u3001Azi(\xB0)"),_.createElement("p",{className:"wp-hint"},f?"\u503E\u89D2\u4F7F\u7528\u4E95\u659C\u6570\u636E\uFF1B\u4E0B\u65B9\u7ED3\u6784\u8BBE\u7F6E\u5185\u5F84\u4E0E\u7C97\u7CD9\u5EA6\u3002":"Inc\u4ECE\u5782\u76F4\u5411\u4E0B\u8BA1\uFF080\xB0\u5782\u76F4\u300190\xB0\u6C34\u5E73\uFF09\u3002"," ","\u9996\u70B9MD=0\uFF0C\u4F4D\u7F6E\u4EE5\u4E95\u53E3\u4E3A\u539F\u70B9\u3002")),_.createElement("div",{className:"wp-structure-content"},x==="uniform"?_.createElement(_.Fragment,null,_.createElement("div",{className:"wp-form"},oe.filter(([D])=>!(f&&D==="angle")).map(([D,Y,at,wt])=>_.createElement($t,{key:D,label:Y,unit:at,name:D,value:t[D],scale:wt,error:j[D],onChange:vt=>v(D,vt)}))),_.createElement("p",{className:"wp-hint",style:{marginTop:12}},f?"\u5168\u4E95\u91C7\u7528\u7EDF\u4E00\u5185\u5F84\u4E0E\u7C97\u7CD9\u5EA6\uFF1B\u503E\u89D2\u968F\u5BFC\u5165\u4E95\u8F68\u8FF9\u53D8\u5316\u3002":"\u5168\u4E95\u91C7\u7528\u76F8\u540C\u5185\u5F84\u548C\u503E\u89D2\u3002\u5939\u89D2\u76F8\u5BF9\u6C34\u5E73\u9762\uFF0C\u5782\u76F4\u4E95\u4E3A90\xB0\u3002\u5207\u6362\u201C\u5206\u6BB5\u7ED3\u6784\u201D\u53EF\u8BBE\u7F6E\u4E0D\u540C\u4E95\u6BB5\u3002")):_.createElement(_.Fragment,null,m.map((D,Y)=>_.createElement("div",{className:"wp-segment",key:Y},_.createElement("div",{className:"wp-segment-head"},_.createElement("span",{className:"wp-index"},String(Y+1).padStart(2,"0")),_.createElement("input",{"aria-label":`\u7B2C${Y+1}\u6BB5\u540D\u79F0`,maxLength:30,value:D.name,onChange:at=>Z(Y,"name",at.target.value)}),_.createElement("span",{className:"wp-unit"},X(Y?m[Y-1].end:0,1)," m \u8D77"),_.createElement("button",{disabled:m.length===1,"aria-label":`\u5220\u9664\u7B2C${Y+1}\u6BB5`,onClick:()=>H(Y)},"\xD7")),_.createElement("div",{className:"wp-segment-grid"},_.createElement($t,{label:`\u7B2C${Y+1}\u6BB5\u7EC8\u70B9\u4E95\u6DF1`,unit:"m",value:D.end,onChange:at=>Z(Y,"end",at)}),_.createElement($t,{label:`\u7B2C${Y+1}\u6BB5\u5185\u5F84`,unit:"mm",scale:1e3,value:D.diameter,onChange:at=>Z(Y,"diameter",at)}),f?_.createElement("div",{className:"wp-hint"},"\u4E95\u6BB5\u503E\u89D2",_.createElement("br",null),"\u7531\u4E95\u659C\u6570\u636E\u786E\u5B9A"):_.createElement($t,{label:`\u7B2C${Y+1}\u6BB5\u5939\u89D2`,unit:"\xB0",value:D.angle,onChange:at=>Z(Y,"angle",at)}),_.createElement($t,{label:`\u7B2C${Y+1}\u6BB5\u7C97\u7CD9\u5EA6`,unit:"mm",scale:1e3,value:D.roughness,onChange:at=>Z(Y,"roughness",at)})))),_.createElement("button",{className:"wp-add",onClick:I,disabled:m.length>=30},"\uFF0B \u6DFB\u52A0\u4E95\u6BB5"),_.createElement("p",{className:"wp-hint",style:{marginTop:9}},"\u6309\u6D4B\u6DF1\u4ECE\u6D45\u5230\u6DF1\u8FDE\u7EED\u6392\u5217\uFF0C\u6700\u540E\u7EC8\u70B9\u7B49\u4E8E\u603B\u4E95\u6DF1\u3002\u7ED3\u6784\u6539\u53D8\u540E\u8BF7\u91CD\u65B0\u8BA1\u7B97\u3002"))),_.createElement("div",{className:"wp-structure-footer"},_.createElement("span",{className:"wp-small"},"CSV / JSON \xB7 \u6700\u591A30\u6BB5"),_.createElement("button",{className:"wp-link",onClick:it},"\u586B\u5165\u4E09\u6BB5\u793A\u4F8B")))),_.createElement("section",{className:"wp-panel wp-visual","aria-label":"\u4E95\u7B52\u53EF\u89C6\u5316\u89C6\u56FE"},_.createElement("div",{className:"wp-visual-head"},_.createElement("div",null,_.createElement("h2",null,"\u4E95\u7B52\u53EF\u89C6\u5316"),_.createElement("div",{className:"wp-sub"},W.model," \xB7 ",W.segments.length," \u4E2A\u4E95\u6BB5 \xB7"," ",W.steps.toLocaleString()," \u4E2A\u7F51\u683C")),_.createElement("div",{className:"wp-toolbar"},_.createElement("span",{className:`wp-badge ${e?"wp-stale":""}`},_.createElement("i",{className:"wp-live"}),e?"\u5F85\u66F4\u65B0":"\u8BA1\u7B97\u5DF2\u540C\u6B65"),_.createElement("button",{disabled:e||rt,onClick:Bt},rt?"\u6B63\u5728\u5BFC\u51FA\u2026":"\u5BFC\u51FA Excel"))),_.createElement("div",{className:"wp-summary"},_.createElement("div",{className:"wp-stat"},_.createElement("div",{className:"wp-stat-label"},"\u4E95\u5E95\u6D41\u538B"),_.createElement("div",{className:"wp-stat-value","data-testid":"bottom-pressure"},X(W.bottom),_.createElement("span",{className:"wp-stat-unit"},"MPa")),_.createElement("div",{className:"wp-stat-note"},"MD ",X(W.params.depth,0)," m"," ",W.survey&&` \xB7 TVD ${X(W.stations.at(-1).tvd,1)} m`)),_.createElement("div",{className:"wp-stat"},_.createElement("div",{className:"wp-stat-label"},"\u4E95\u5E95\uFF0D\u4E95\u53E3\u538B\u5DEE"),_.createElement("div",{className:"wp-stat-value"},X(St),_.createElement("span",{className:"wp-stat-unit"},"MPa")),_.createElement("div",{className:"wp-stat-note"},"\u4E95\u53E3 ",X(W.params.pressure,2)," MPa")),_.createElement("div",{className:"wp-stat"},_.createElement("div",{className:"wp-stat-label"},"\u6469\u963B / \u603B\u538B\u5DEE"),_.createElement("div",{className:"wp-stat-value"},X(W.friction/(W.friction+W.gravity)*100,1),_.createElement("span",{className:"wp-stat-unit"},"%")),_.createElement("div",{className:"wp-stat-note"},"\u6469\u963B ",X(W.friction,3)," MPa"))),_.createElement("div",{className:"wp-tabs-row"},_.createElement("div",{className:"wp-tabs",role:"tablist","aria-label":"\u53EF\u89C6\u5316\u89C6\u56FE\u5207\u6362"},_.createElement("button",{id:"wp-chart-tab",className:"wp-tab",role:"tab","aria-selected":N==="chart","aria-controls":"wp-result-view",onClick:()=>P("chart")},"\u56FE\u8868\u89C6\u56FE"),_.createElement("button",{id:"wp-trajectory-tab",className:"wp-tab",role:"tab","aria-selected":N==="trajectory","aria-controls":"wp-result-view",onClick:()=>P("trajectory")},"\u4E95\u8F68\u8FF9"),_.createElement("button",{id:"wp-table-tab",className:"wp-tab",role:"tab","aria-selected":N==="table","aria-controls":"wp-result-view",onClick:()=>P("table")},"\u6570\u636E\u8868")),_.createElement("div",{className:"wp-toolbar"},N==="chart"?_.createElement(_.Fragment,null,_.createElement("label",{className:"wp-check"},_.createElement("input",{type:"checkbox",checked:F,onChange:D=>a(D.target.checked)}),"\u6A21\u578B\u5BF9\u6BD4"),_.createElement("select",{className:"wp-head-select","aria-label":"\u66F2\u7EBF\u6307\u6807",value:O,onChange:D=>$(D.target.value)},_.createElement("option",{value:"pressure"},"\u538B\u529B / MPa"),_.createElement("option",{value:"temperature"},"\u6E29\u5EA6 / K"),_.createElement("option",{value:"velocity"},"\u6D41\u901F / m\xB7s\u207B\xB9"))):N==="table"?_.createElement(_.Fragment,null,_.createElement("select",{className:"wp-head-select","aria-label":"\u6570\u636E\u8868\u7C7B\u578B",value:Q,onChange:D=>k(D.target.value)},_.createElement("option",{value:"profile"},"\u6CBF\u4E95\u6DF1\u5256\u9762"),_.createElement("option",{value:"structure"},"\u4E95\u6BB5\u53C2\u6570"),_.createElement("option",{value:"baseline"},"\u5DE5\u51B5\u5BF9\u6BD4"),_.createElement("option",{value:"survey",disabled:!W.survey},"\u4E95\u659C\u6D4B\u70B9"),_.createElement("option",{value:"trajectory",disabled:!W.survey},"\u4E95\u8F68\u8FF9\u4E0E\u538B\u529B")),_.createElement("button",{disabled:e||Q==="baseline"&&!C,onClick:gt},"\u5BFC\u51FACSV")):_.createElement("span",{className:"wp-small"},"\u6D4B\u659C\u91CD\u5EFA \xB7 \u5C40\u90E8\u5750\u6807"),_.createElement("select",{className:"wp-head-select","aria-label":"\u91C7\u6837\u95F4\u9694",value:o,onChange:D=>w(Number(D.target.value))},re.map(D=>_.createElement("option",{key:D,value:D},D," m\u91C7\u6837"))))),_.createElement("div",{id:"wp-result-view",className:"wp-content",role:"tabpanel","aria-labelledby":N==="chart"?"wp-chart-tab":N==="trajectory"?"wp-trajectory-tab":"wp-table-tab"},N==="chart"?_.createElement("div",{className:"wp-graph"},W.survey?_.createElement(Ke,{result:W}):_.createElement(gr,{segments:W.segments,depth:W.params.depth}),_.createElement("div",{className:"wp-plot"},_.createElement(we,{key:JSON.stringify(W.params)+JSON.stringify(W.segments)+W.steps+O+W.model,result:W,comparison:ft,compare:F,metric:O,interval:o,disabled:e}))):N==="trajectory"?_.createElement(ve,{result:W,disabled:e,onImport:()=>z.current.click(),pending:!!f,onCompute:b}):Q==="survey"?W.survey?_.createElement(Jt,{headers:["MD / m","Inc / \xB0","Azi / \xB0","TVD / m","N / m","E / m","\u72D7\u817F\u5EA6 \xB0/30m"],rows:W.stations.map(D=>[X(D.md,1),X(D.inc,2),X(D.azi,2),X(D.tvd,2),X(D.north,2),X(D.east,2),X(D.dls,3)])}):_.createElement("div",{className:"wp-table-empty"},"\u8BF7\u5148\u5BFC\u5165\u4E95\u659C\u5E76\u8BA1\u7B97\u3002"):Q==="trajectory"?W.survey?_.createElement(Jt,{headers:["MD / m","TVD / m","N / m","E / m","Inc / \xB0","Azi / \xB0","\u538B\u529B / MPa"],rows:W.samples.map(D=>{let Y=Nt(nt,D[0]);return[X(D[0],1),X(Y.tvd,2),X(Y.north,2),X(Y.east,2),X(Y.inc,2),X(Y.azi,2),X(D[1])]})}):_.createElement("div",{className:"wp-table-empty"},"\u8BF7\u5148\u5BFC\u5165\u4E95\u659C\u5E76\u8BA1\u7B97\u3002"):Q==="profile"?_.createElement(Jt,{headers:Qt,rows:W.samples.map(D=>[X(D[0],1),W.segments[Ct(W.segments,D[0])].name,...D.slice(1).map((Y,at)=>X(Y,at===1?2:4))])}):Q==="structure"?_.createElement(Jt,{headers:["\u4E95\u6BB5","\u8D77\u70B9 / m","\u7EC8\u70B9 / m","\u5185\u5F84 / mm",W.survey?"\u7ED3\u6784\u5939\u89D2\uFF08\u5DF2\u8986\u76D6\uFF09":"\u5939\u89D2 / \xB0","\u7C97\u7CD9\u5EA6 / mm"],rows:Dt}):C?_.createElement(Jt,{headers:["\u6BD4\u8F83\u9879\u76EE","\u56FA\u5B9A\u57FA\u51C6","\u5F53\u524D\u7ED3\u679C","\u53D8\u5316"],rows:[["\u4E95\u5E95\u538B\u529B / MPa",X(C.bottom),X(W.bottom),X(W.bottom-C.bottom)],["\u6469\u963B\u538B\u5DEE / MPa",X(C.friction),X(W.friction),X(W.friction-C.friction)],["\u6A21\u578B",C.model,W.model,"\u2014"],["\u8F68\u8FF9\u4E0E\u6E29\u5EA6\u57FA\u51C6",C.survey?`${C.survey.length}\u6D4B\u70B9 / ${C.temperatureBasis==="tvd"?"\u5782\u6DF1":"\u6D4B\u6DF1"}`:"\u7ED3\u6784\u89D2\u5EA6 / MD",W.survey?`${W.survey.length}\u6D4B\u70B9 / ${W.temperatureBasis==="tvd"?"\u5782\u6DF1":"\u6D4B\u6DF1"}`:"\u7ED3\u6784\u89D2\u5EA6 / MD",ae(C.survey,W.survey)&&C.temperatureBasis===W.temperatureBasis?"\u76F8\u540C":"\u5DF2\u6539\u53D8"],["\u4E95\u8EAB\u7ED3\u6784",`${C.segments.length} \u6BB5`,`${W.segments.length} \u6BB5`,se?"\u5DF2\u6539\u53D8":"\u76F8\u540C"],["\u7F51\u683C\u6570",C.steps,W.steps,W.steps-C.steps],...qt.map(D=>[D.label+" / "+D.unit,X(D.before),X(D.after),X(D.after-D.before)])]}):_.createElement("div",{className:"wp-table-empty"},_.createElement("strong",null,"\u5C1A\u672A\u56FA\u5B9A\u5BF9\u6BD4\u5DE5\u51B5"),_.createElement("p",null,"\u5148\u56FA\u5B9A\u5F53\u524D\u7ED3\u679C\uFF0C\u518D\u4FEE\u6539\u53C2\u6570\u6216\u4E95\u8EAB\u7ED3\u6784\u5E76\u8BA1\u7B97\u3002"),_.createElement("button",{disabled:e,onClick:Lt},"\u56FA\u5B9A\u5F53\u524D\u5DE5\u51B5"))),_.createElement("div",{className:"wp-visual-footer"},_.createElement("div",{className:"wp-quality-line"},_.createElement("span",null,ut.relativePercent<=.1?"\u2713 \u7F51\u683C\u5DEE\u5F02\u8F83\u5C0F":"\u25B3 \u5EFA\u8BAE\u52A0\u5BC6\u7F51\u683C"," ","\xB7 \u538B\u529B\u5DEE ",X(ut.difference,6)," MPa"," ",_.createElement("span",{className:"wp-unit"}," ","/ ",X(ut.relativePercent,4),"%")),_.createElement("div",{className:"wp-toolbar"},_.createElement("button",{disabled:e,onClick:Lt},C?"\u66FF\u6362\u5BF9\u6BD4\u57FA\u51C6":"\u56FA\u5B9A\u5F53\u524D\u5DE5\u51B5"),C&&_.createElement("button",{onClick:()=>R(null)},"\u6E05\u9664\u57FA\u51C6"))),_.createElement("details",{className:"wp-details"},_.createElement("summary",null,"\u8BA1\u7B97\u68C0\u67E5\u4E0E\u9002\u7528\u8303\u56F4"),_.createElement("p",null,"\u52A0\u5BC6\u81F3",ut.refinedSteps.toLocaleString(),"\u4E2A\u7F51\u683C\uFF0C\u4E95\u5E95\u538B\u529B",X(ut.refinedBottom)," MPa\u3002\u6700\u5927\u8BA1\u7B97\u6D41\u901F",X(W.maxVelocity,3)," ","m/s\u3002\u7F51\u683C\u68C0\u67E5\u8861\u91CF\u79BB\u6563\u8BEF\u5DEE\uFF0C0.1%\u4E3A\u52A0\u5BC6\u63D0\u793A\u9608\u503C\u3002",F&&`${ft.model}\u4E95\u5E95\u538B\u529B${X(ft.bottom)} MPa\u3002`),_.createElement("p",null,W.survey&&`\u4E95\u8F68\u8FF9\u91C7\u7528\u6700\u5C0F\u66F2\u7387\u6CD5\uFF1B\u4E95\u659C\u89D2\u4ECE\u5782\u76F4\u5411\u4E0B\u8BA1\uFF0C\u65B9\u4F4D\u89D2\u6CBF\u5BFC\u5165\u6570\u636E\u5317\u5411\u987A\u65F6\u9488\u3002\u672A\u505A\u78C1\u504F\u89D2\u3001\u4E95\u53E3\u6D77\u62D4\u6216\u5730\u7406\u5750\u6807\u6362\u7B97\u3002\u91CD\u529B\u4F7F\u7528\u5B9E\u9645\u5782\u6DF1\u589E\u91CF\uFF0C\u6469\u963B\u4F7F\u7528\u6CBF\u4E95\u6D4B\u6DF1\u589E\u91CF\uFF0C\u5730\u6E29\u68AF\u5EA6\u6309${W.temperatureBasis==="tvd"?"\u5782\u6DF1":"\u6D4B\u6DF1"}0.025 K/m\u3002`,"\u6CBF\u7528\u539F\u7A0B\u5E8F\u5355\u6C14\u76F8\u91C7\u6C14\u7B80\u5316\u6A21\u578B\uFF1A\u91CD\u529B\u4E0EDarcy\u6469\u963B\uFF1B\u5206\u6BB5\u5185\u5F84\u3001\u503E\u89D2\u548C\u7C97\u7CD9\u5EA6\u9010\u6BB5\u53C2\u4E0E\u79EF\u5206\uFF0C\u4E95\u6BB5\u754C\u9762\u4E3A\u7F51\u683C\u8282\u70B9\u3002\u4E95\u6DF1\u4E3A\u6D4B\u6DF1\uFF0C\u503E\u89D2\u76F8\u5BF9\u6C34\u5E73\uFF1B\u6E29\u5EA6\u6309\u6D4B\u6DF10.025 K/m\u9012\u589E\uFF1B\u6469\u5C14\u8D28\u91CF0.018 kg/mol\uFF0C\u5E38Z\uFF0C\u6807\u51B5101325 Pa / 293.15 K\u3002Beggs-Brill\u4E3A\u539F\u7A0B\u5E8F\u7684\u7B80\u5316\u6469\u963B\u4FEE\u6B63\u3002\u672A\u8BA1\u591A\u76F8\u6D41\u3001\u52A0\u901F\u9879\u3001\u7BA1\u5F84\u7A81\u53D8\u5C40\u90E8\u635F\u5931\u6216\u6CE8\u6C14\u65B9\u5411\u3002\u672A\u5BFC\u5165\u4E95\u659C\u65F6\u7ED3\u6784\u56FE\u5C55\u793A\u6D41\u52A8\u901A\u9053\u5185\u5F84\u3002\u57FA\u51C6\u4FDD\u7559\u4E8E\u5F53\u524D\u9875\u9762\uFF0CExcel\u5305\u542B\u4E24\u7EC4\u7ED3\u6784\u3002"))))),_.createElement("footer",{className:"wp-foot"},_.createElement("span",null,"UGSci / \u4E95\u7B52\u538B\u529B\u8BA1\u7B97 \xB7 v",Kt),_.createElement("span",null,"\u53C2\u6570\u4E0E\u4E95\u8EAB\u7ED3\u6784 \u2192 \u5206\u6BB5\u8BA1\u7B97 \u2192 \u53EF\u89C6\u5316\u5206\u6790 \xB7 \u5168\u90E8\u5728\u672C\u673A\u5B8C\u6210"))))}Xe.registerRoutes("wellbore-pressure",[{path:"/apps/wellbore-pressure",component:wr,label:"\u4E95\u7B52\u538B\u529B\u8BA1\u7B97",icon:"\u21A7"}]);})();
/*! Bundled license information:

jszip/dist/jszip.min.js:
  (*!

  JSZip v3.10.1 - A JavaScript class for generating and reading zip files
  <http://stuartk.com/jszip>

  (c) 2009-2016 Stuart Knightley <stuart [at] stuartk.com>
  Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/main/LICENSE.markdown.

  JSZip uses the library pako released under the MIT license :
  https://github.com/nodeca/pako/blob/main/LICENSE
  *)
*/
