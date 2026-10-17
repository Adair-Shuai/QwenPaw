(()=>{var me=Object.create;var qt=Object.defineProperty;var ge=Object.getOwnPropertyDescriptor;var we=Object.getOwnPropertyNames;var be=Object.getPrototypeOf,_e=Object.prototype.hasOwnProperty;var It=(e=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(e,{get:(v,u)=>(typeof require<"u"?require:v)[u]}):e)(function(e){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')});var ve=(e,v)=>()=>(v||e((v={exports:{}}).exports,v),v.exports);var xe=(e,v,u,s)=>{if(v&&typeof v=="object"||typeof v=="function")for(let i of we(v))!_e.call(e,i)&&i!==u&&qt(e,i,{get:()=>v[i],enumerable:!(s=ge(v,i))||s.enumerable});return e};var ye=(e,v,u)=>(u=e!=null?me(be(e)):{},xe(v||!e||!e.__esModule?qt(u,"default",{value:e,enumerable:!0}):u,e));var Rt=ve((Qt,$t)=>{(function(e){typeof Qt=="object"&&typeof $t<"u"?$t.exports=e():typeof define=="function"&&define.amd?define([],e):(typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:this).JSZip=e()})(function(){return(function e(v,u,s){function i(b,_){if(!u[b]){if(!v[b]){var c=typeof It=="function"&&It;if(!_&&c)return c(b,!0);if(n)return n(b,!0);var f=new Error("Cannot find module '"+b+"'");throw f.code="MODULE_NOT_FOUND",f}var o=u[b]={exports:{}};v[b][0].call(o.exports,function(m){var a=v[b][1][m];return i(a||m)},o,o.exports,e,v,u,s)}return u[b].exports}for(var n=typeof It=="function"&&It,l=0;l<s.length;l++)i(s[l]);return i})({1:[function(e,v,u){"use strict";var s=e("./utils"),i=e("./support"),n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";u.encode=function(l){for(var b,_,c,f,o,m,a,h=[],d=0,g=l.length,x=g,C=s.getTypeOf(l)!=="string";d<l.length;)x=g-d,c=C?(b=l[d++],_=d<g?l[d++]:0,d<g?l[d++]:0):(b=l.charCodeAt(d++),_=d<g?l.charCodeAt(d++):0,d<g?l.charCodeAt(d++):0),f=b>>2,o=(3&b)<<4|_>>4,m=1<x?(15&_)<<2|c>>6:64,a=2<x?63&c:64,h.push(n.charAt(f)+n.charAt(o)+n.charAt(m)+n.charAt(a));return h.join("")},u.decode=function(l){var b,_,c,f,o,m,a=0,h=0,d="data:";if(l.substr(0,d.length)===d)throw new Error("Invalid base64 input, it looks like a data url.");var g,x=3*(l=l.replace(/[^A-Za-z0-9+/=]/g,"")).length/4;if(l.charAt(l.length-1)===n.charAt(64)&&x--,l.charAt(l.length-2)===n.charAt(64)&&x--,x%1!=0)throw new Error("Invalid base64 input, bad content length.");for(g=i.uint8array?new Uint8Array(0|x):new Array(0|x);a<l.length;)b=n.indexOf(l.charAt(a++))<<2|(f=n.indexOf(l.charAt(a++)))>>4,_=(15&f)<<4|(o=n.indexOf(l.charAt(a++)))>>2,c=(3&o)<<6|(m=n.indexOf(l.charAt(a++))),g[h++]=b,o!==64&&(g[h++]=_),m!==64&&(g[h++]=c);return g}},{"./support":30,"./utils":32}],2:[function(e,v,u){"use strict";var s=e("./external"),i=e("./stream/DataWorker"),n=e("./stream/Crc32Probe"),l=e("./stream/DataLengthProbe");function b(_,c,f,o,m){this.compressedSize=_,this.uncompressedSize=c,this.crc32=f,this.compression=o,this.compressedContent=m}b.prototype={getContentWorker:function(){var _=new i(s.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new l("data_length")),c=this;return _.on("end",function(){if(this.streamInfo.data_length!==c.uncompressedSize)throw new Error("Bug : uncompressed data size mismatch")}),_},getCompressedWorker:function(){return new i(s.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize",this.compressedSize).withStreamInfo("uncompressedSize",this.uncompressedSize).withStreamInfo("crc32",this.crc32).withStreamInfo("compression",this.compression)}},b.createWorkerFrom=function(_,c,f){return _.pipe(new n).pipe(new l("uncompressedSize")).pipe(c.compressWorker(f)).pipe(new l("compressedSize")).withStreamInfo("compression",c)},v.exports=b},{"./external":6,"./stream/Crc32Probe":25,"./stream/DataLengthProbe":26,"./stream/DataWorker":27}],3:[function(e,v,u){"use strict";var s=e("./stream/GenericWorker");u.STORE={magic:"\0\0",compressWorker:function(){return new s("STORE compression")},uncompressWorker:function(){return new s("STORE decompression")}},u.DEFLATE=e("./flate")},{"./flate":7,"./stream/GenericWorker":28}],4:[function(e,v,u){"use strict";var s=e("./utils"),i=(function(){for(var n,l=[],b=0;b<256;b++){n=b;for(var _=0;_<8;_++)n=1&n?3988292384^n>>>1:n>>>1;l[b]=n}return l})();v.exports=function(n,l){return n!==void 0&&n.length?s.getTypeOf(n)!=="string"?(function(b,_,c,f){var o=i,m=f+c;b^=-1;for(var a=f;a<m;a++)b=b>>>8^o[255&(b^_[a])];return-1^b})(0|l,n,n.length,0):(function(b,_,c,f){var o=i,m=f+c;b^=-1;for(var a=f;a<m;a++)b=b>>>8^o[255&(b^_.charCodeAt(a))];return-1^b})(0|l,n,n.length,0):0}},{"./utils":32}],5:[function(e,v,u){"use strict";u.base64=!1,u.binary=!1,u.dir=!1,u.createFolders=!0,u.date=null,u.compression=null,u.compressionOptions=null,u.comment=null,u.unixPermissions=null,u.dosPermissions=null},{}],6:[function(e,v,u){"use strict";var s=null;s=typeof Promise<"u"?Promise:e("lie"),v.exports={Promise:s}},{lie:37}],7:[function(e,v,u){"use strict";var s=typeof Uint8Array<"u"&&typeof Uint16Array<"u"&&typeof Uint32Array<"u",i=e("pako"),n=e("./utils"),l=e("./stream/GenericWorker"),b=s?"uint8array":"array";function _(c,f){l.call(this,"FlateWorker/"+c),this._pako=null,this._pakoAction=c,this._pakoOptions=f,this.meta={}}u.magic="\b\0",n.inherits(_,l),_.prototype.processChunk=function(c){this.meta=c.meta,this._pako===null&&this._createPako(),this._pako.push(n.transformTo(b,c.data),!1)},_.prototype.flush=function(){l.prototype.flush.call(this),this._pako===null&&this._createPako(),this._pako.push([],!0)},_.prototype.cleanUp=function(){l.prototype.cleanUp.call(this),this._pako=null},_.prototype._createPako=function(){this._pako=new i[this._pakoAction]({raw:!0,level:this._pakoOptions.level||-1});var c=this;this._pako.onData=function(f){c.push({data:f,meta:c.meta})}},u.compressWorker=function(c){return new _("Deflate",c)},u.uncompressWorker=function(){return new _("Inflate",{})}},{"./stream/GenericWorker":28,"./utils":32,pako:38}],8:[function(e,v,u){"use strict";function s(o,m){var a,h="";for(a=0;a<m;a++)h+=String.fromCharCode(255&o),o>>>=8;return h}function i(o,m,a,h,d,g){var x,C,E=o.file,D=o.compression,B=g!==b.utf8encode,P=n.transformTo("string",g(E.name)),T=n.transformTo("string",b.utf8encode(E.name)),Z=E.comment,J=n.transformTo("string",g(Z)),y=n.transformTo("string",b.utf8encode(Z)),F=T.length!==E.name.length,r=y.length!==Z.length,I="",Q="",U="",rt=E.dir,$=E.date,et={crc32:0,compressedSize:0,uncompressedSize:0};m&&!a||(et.crc32=o.crc32,et.compressedSize=o.compressedSize,et.uncompressedSize=o.uncompressedSize);var A=0;m&&(A|=8),B||!F&&!r||(A|=2048);var k=0,R=0;rt&&(k|=16),d==="UNIX"?(R=798,k|=(function(G,ot){var pt=G;return G||(pt=ot?16893:33204),(65535&pt)<<16})(E.unixPermissions,rt)):(R=20,k|=(function(G){return 63&(G||0)})(E.dosPermissions)),x=$.getUTCHours(),x<<=6,x|=$.getUTCMinutes(),x<<=5,x|=$.getUTCSeconds()/2,C=$.getUTCFullYear()-1980,C<<=4,C|=$.getUTCMonth()+1,C<<=5,C|=$.getUTCDate(),F&&(Q=s(1,1)+s(_(P),4)+T,I+="up"+s(Q.length,2)+Q),r&&(U=s(1,1)+s(_(J),4)+y,I+="uc"+s(U.length,2)+U);var Y="";return Y+=`
\0`,Y+=s(A,2),Y+=D.magic,Y+=s(x,2),Y+=s(C,2),Y+=s(et.crc32,4),Y+=s(et.compressedSize,4),Y+=s(et.uncompressedSize,4),Y+=s(P.length,2),Y+=s(I.length,2),{fileRecord:c.LOCAL_FILE_HEADER+Y+P+I,dirRecord:c.CENTRAL_FILE_HEADER+s(R,2)+Y+s(J.length,2)+"\0\0\0\0"+s(k,4)+s(h,4)+P+I+J}}var n=e("../utils"),l=e("../stream/GenericWorker"),b=e("../utf8"),_=e("../crc32"),c=e("../signature");function f(o,m,a,h){l.call(this,"ZipFileWorker"),this.bytesWritten=0,this.zipComment=m,this.zipPlatform=a,this.encodeFileName=h,this.streamFiles=o,this.accumulate=!1,this.contentBuffer=[],this.dirRecords=[],this.currentSourceOffset=0,this.entriesCount=0,this.currentFile=null,this._sources=[]}n.inherits(f,l),f.prototype.push=function(o){var m=o.meta.percent||0,a=this.entriesCount,h=this._sources.length;this.accumulate?this.contentBuffer.push(o):(this.bytesWritten+=o.data.length,l.prototype.push.call(this,{data:o.data,meta:{currentFile:this.currentFile,percent:a?(m+100*(a-h-1))/a:100}}))},f.prototype.openedSource=function(o){this.currentSourceOffset=this.bytesWritten,this.currentFile=o.file.name;var m=this.streamFiles&&!o.file.dir;if(m){var a=i(o,m,!1,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);this.push({data:a.fileRecord,meta:{percent:0}})}else this.accumulate=!0},f.prototype.closedSource=function(o){this.accumulate=!1;var m=this.streamFiles&&!o.file.dir,a=i(o,m,!0,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);if(this.dirRecords.push(a.dirRecord),m)this.push({data:(function(h){return c.DATA_DESCRIPTOR+s(h.crc32,4)+s(h.compressedSize,4)+s(h.uncompressedSize,4)})(o),meta:{percent:100}});else for(this.push({data:a.fileRecord,meta:{percent:0}});this.contentBuffer.length;)this.push(this.contentBuffer.shift());this.currentFile=null},f.prototype.flush=function(){for(var o=this.bytesWritten,m=0;m<this.dirRecords.length;m++)this.push({data:this.dirRecords[m],meta:{percent:100}});var a=this.bytesWritten-o,h=(function(d,g,x,C,E){var D=n.transformTo("string",E(C));return c.CENTRAL_DIRECTORY_END+"\0\0\0\0"+s(d,2)+s(d,2)+s(g,4)+s(x,4)+s(D.length,2)+D})(this.dirRecords.length,a,o,this.zipComment,this.encodeFileName);this.push({data:h,meta:{percent:100}})},f.prototype.prepareNextSource=function(){this.previous=this._sources.shift(),this.openedSource(this.previous.streamInfo),this.isPaused?this.previous.pause():this.previous.resume()},f.prototype.registerPrevious=function(o){this._sources.push(o);var m=this;return o.on("data",function(a){m.processChunk(a)}),o.on("end",function(){m.closedSource(m.previous.streamInfo),m._sources.length?m.prepareNextSource():m.end()}),o.on("error",function(a){m.error(a)}),this},f.prototype.resume=function(){return!!l.prototype.resume.call(this)&&(!this.previous&&this._sources.length?(this.prepareNextSource(),!0):this.previous||this._sources.length||this.generatedError?void 0:(this.end(),!0))},f.prototype.error=function(o){var m=this._sources;if(!l.prototype.error.call(this,o))return!1;for(var a=0;a<m.length;a++)try{m[a].error(o)}catch{}return!0},f.prototype.lock=function(){l.prototype.lock.call(this);for(var o=this._sources,m=0;m<o.length;m++)o[m].lock()},v.exports=f},{"../crc32":4,"../signature":23,"../stream/GenericWorker":28,"../utf8":31,"../utils":32}],9:[function(e,v,u){"use strict";var s=e("../compressions"),i=e("./ZipFileWorker");u.generateWorker=function(n,l,b){var _=new i(l.streamFiles,b,l.platform,l.encodeFileName),c=0;try{n.forEach(function(f,o){c++;var m=(function(g,x){var C=g||x,E=s[C];if(!E)throw new Error(C+" is not a valid compression method !");return E})(o.options.compression,l.compression),a=o.options.compressionOptions||l.compressionOptions||{},h=o.dir,d=o.date;o._compressWorker(m,a).withStreamInfo("file",{name:f,dir:h,date:d,comment:o.comment||"",unixPermissions:o.unixPermissions,dosPermissions:o.dosPermissions}).pipe(_)}),_.entriesCount=c}catch(f){_.error(f)}return _}},{"../compressions":3,"./ZipFileWorker":8}],10:[function(e,v,u){"use strict";function s(){if(!(this instanceof s))return new s;if(arguments.length)throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");this.files=Object.create(null),this.comment=null,this.root="",this.clone=function(){var i=new s;for(var n in this)typeof this[n]!="function"&&(i[n]=this[n]);return i}}(s.prototype=e("./object")).loadAsync=e("./load"),s.support=e("./support"),s.defaults=e("./defaults"),s.version="3.10.1",s.loadAsync=function(i,n){return new s().loadAsync(i,n)},s.external=e("./external"),v.exports=s},{"./defaults":5,"./external":6,"./load":11,"./object":15,"./support":30}],11:[function(e,v,u){"use strict";var s=e("./utils"),i=e("./external"),n=e("./utf8"),l=e("./zipEntries"),b=e("./stream/Crc32Probe"),_=e("./nodejsUtils");function c(f){return new i.Promise(function(o,m){var a=f.decompressed.getContentWorker().pipe(new b);a.on("error",function(h){m(h)}).on("end",function(){a.streamInfo.crc32!==f.decompressed.crc32?m(new Error("Corrupted zip : CRC32 mismatch")):o()}).resume()})}v.exports=function(f,o){var m=this;return o=s.extend(o||{},{base64:!1,checkCRC32:!1,optimizedBinaryString:!1,createFolders:!1,decodeFileName:n.utf8decode}),_.isNode&&_.isStream(f)?i.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")):s.prepareContent("the loaded zip file",f,!0,o.optimizedBinaryString,o.base64).then(function(a){var h=new l(o);return h.load(a),h}).then(function(a){var h=[i.Promise.resolve(a)],d=a.files;if(o.checkCRC32)for(var g=0;g<d.length;g++)h.push(c(d[g]));return i.Promise.all(h)}).then(function(a){for(var h=a.shift(),d=h.files,g=0;g<d.length;g++){var x=d[g],C=x.fileNameStr,E=s.resolve(x.fileNameStr);m.file(E,x.decompressed,{binary:!0,optimizedBinaryString:!0,date:x.date,dir:x.dir,comment:x.fileCommentStr.length?x.fileCommentStr:null,unixPermissions:x.unixPermissions,dosPermissions:x.dosPermissions,createFolders:o.createFolders}),x.dir||(m.file(E).unsafeOriginalName=C)}return h.zipComment.length&&(m.comment=h.zipComment),m})}},{"./external":6,"./nodejsUtils":14,"./stream/Crc32Probe":25,"./utf8":31,"./utils":32,"./zipEntries":33}],12:[function(e,v,u){"use strict";var s=e("../utils"),i=e("../stream/GenericWorker");function n(l,b){i.call(this,"Nodejs stream input adapter for "+l),this._upstreamEnded=!1,this._bindStream(b)}s.inherits(n,i),n.prototype._bindStream=function(l){var b=this;(this._stream=l).pause(),l.on("data",function(_){b.push({data:_,meta:{percent:0}})}).on("error",function(_){b.isPaused?this.generatedError=_:b.error(_)}).on("end",function(){b.isPaused?b._upstreamEnded=!0:b.end()})},n.prototype.pause=function(){return!!i.prototype.pause.call(this)&&(this._stream.pause(),!0)},n.prototype.resume=function(){return!!i.prototype.resume.call(this)&&(this._upstreamEnded?this.end():this._stream.resume(),!0)},v.exports=n},{"../stream/GenericWorker":28,"../utils":32}],13:[function(e,v,u){"use strict";var s=e("readable-stream").Readable;function i(n,l,b){s.call(this,l),this._helper=n;var _=this;n.on("data",function(c,f){_.push(c)||_._helper.pause(),b&&b(f)}).on("error",function(c){_.emit("error",c)}).on("end",function(){_.push(null)})}e("../utils").inherits(i,s),i.prototype._read=function(){this._helper.resume()},v.exports=i},{"../utils":32,"readable-stream":16}],14:[function(e,v,u){"use strict";v.exports={isNode:typeof Buffer<"u",newBufferFrom:function(s,i){if(Buffer.from&&Buffer.from!==Uint8Array.from)return Buffer.from(s,i);if(typeof s=="number")throw new Error('The "data" argument must not be a number');return new Buffer(s,i)},allocBuffer:function(s){if(Buffer.alloc)return Buffer.alloc(s);var i=new Buffer(s);return i.fill(0),i},isBuffer:function(s){return Buffer.isBuffer(s)},isStream:function(s){return s&&typeof s.on=="function"&&typeof s.pause=="function"&&typeof s.resume=="function"}}},{}],15:[function(e,v,u){"use strict";function s(E,D,B){var P,T=n.getTypeOf(D),Z=n.extend(B||{},_);Z.date=Z.date||new Date,Z.compression!==null&&(Z.compression=Z.compression.toUpperCase()),typeof Z.unixPermissions=="string"&&(Z.unixPermissions=parseInt(Z.unixPermissions,8)),Z.unixPermissions&&16384&Z.unixPermissions&&(Z.dir=!0),Z.dosPermissions&&16&Z.dosPermissions&&(Z.dir=!0),Z.dir&&(E=d(E)),Z.createFolders&&(P=h(E))&&g.call(this,P,!0);var J=T==="string"&&Z.binary===!1&&Z.base64===!1;B&&B.binary!==void 0||(Z.binary=!J),(D instanceof c&&D.uncompressedSize===0||Z.dir||!D||D.length===0)&&(Z.base64=!1,Z.binary=!0,D="",Z.compression="STORE",T="string");var y=null;y=D instanceof c||D instanceof l?D:m.isNode&&m.isStream(D)?new a(E,D):n.prepareContent(E,D,Z.binary,Z.optimizedBinaryString,Z.base64);var F=new f(E,y,Z);this.files[E]=F}var i=e("./utf8"),n=e("./utils"),l=e("./stream/GenericWorker"),b=e("./stream/StreamHelper"),_=e("./defaults"),c=e("./compressedObject"),f=e("./zipObject"),o=e("./generate"),m=e("./nodejsUtils"),a=e("./nodejs/NodejsStreamInputAdapter"),h=function(E){E.slice(-1)==="/"&&(E=E.substring(0,E.length-1));var D=E.lastIndexOf("/");return 0<D?E.substring(0,D):""},d=function(E){return E.slice(-1)!=="/"&&(E+="/"),E},g=function(E,D){return D=D!==void 0?D:_.createFolders,E=d(E),this.files[E]||s.call(this,E,null,{dir:!0,createFolders:D}),this.files[E]};function x(E){return Object.prototype.toString.call(E)==="[object RegExp]"}var C={load:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},forEach:function(E){var D,B,P;for(D in this.files)P=this.files[D],(B=D.slice(this.root.length,D.length))&&D.slice(0,this.root.length)===this.root&&E(B,P)},filter:function(E){var D=[];return this.forEach(function(B,P){E(B,P)&&D.push(P)}),D},file:function(E,D,B){if(arguments.length!==1)return E=this.root+E,s.call(this,E,D,B),this;if(x(E)){var P=E;return this.filter(function(Z,J){return!J.dir&&P.test(Z)})}var T=this.files[this.root+E];return T&&!T.dir?T:null},folder:function(E){if(!E)return this;if(x(E))return this.filter(function(T,Z){return Z.dir&&E.test(T)});var D=this.root+E,B=g.call(this,D),P=this.clone();return P.root=B.name,P},remove:function(E){E=this.root+E;var D=this.files[E];if(D||(E.slice(-1)!=="/"&&(E+="/"),D=this.files[E]),D&&!D.dir)delete this.files[E];else for(var B=this.filter(function(T,Z){return Z.name.slice(0,E.length)===E}),P=0;P<B.length;P++)delete this.files[B[P].name];return this},generate:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},generateInternalStream:function(E){var D,B={};try{if((B=n.extend(E||{},{streamFiles:!1,compression:"STORE",compressionOptions:null,type:"",platform:"DOS",comment:null,mimeType:"application/zip",encodeFileName:i.utf8encode})).type=B.type.toLowerCase(),B.compression=B.compression.toUpperCase(),B.type==="binarystring"&&(B.type="string"),!B.type)throw new Error("No output type specified.");n.checkSupport(B.type),B.platform!=="darwin"&&B.platform!=="freebsd"&&B.platform!=="linux"&&B.platform!=="sunos"||(B.platform="UNIX"),B.platform==="win32"&&(B.platform="DOS");var P=B.comment||this.comment||"";D=o.generateWorker(this,B,P)}catch(T){(D=new l("error")).error(T)}return new b(D,B.type||"string",B.mimeType)},generateAsync:function(E,D){return this.generateInternalStream(E).accumulate(D)},generateNodeStream:function(E,D){return(E=E||{}).type||(E.type="nodebuffer"),this.generateInternalStream(E).toNodejsStream(D)}};v.exports=C},{"./compressedObject":2,"./defaults":5,"./generate":9,"./nodejs/NodejsStreamInputAdapter":12,"./nodejsUtils":14,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31,"./utils":32,"./zipObject":35}],16:[function(e,v,u){"use strict";v.exports=e("stream")},{stream:void 0}],17:[function(e,v,u){"use strict";var s=e("./DataReader");function i(n){s.call(this,n);for(var l=0;l<this.data.length;l++)n[l]=255&n[l]}e("../utils").inherits(i,s),i.prototype.byteAt=function(n){return this.data[this.zero+n]},i.prototype.lastIndexOfSignature=function(n){for(var l=n.charCodeAt(0),b=n.charCodeAt(1),_=n.charCodeAt(2),c=n.charCodeAt(3),f=this.length-4;0<=f;--f)if(this.data[f]===l&&this.data[f+1]===b&&this.data[f+2]===_&&this.data[f+3]===c)return f-this.zero;return-1},i.prototype.readAndCheckSignature=function(n){var l=n.charCodeAt(0),b=n.charCodeAt(1),_=n.charCodeAt(2),c=n.charCodeAt(3),f=this.readData(4);return l===f[0]&&b===f[1]&&_===f[2]&&c===f[3]},i.prototype.readData=function(n){if(this.checkOffset(n),n===0)return[];var l=this.data.slice(this.zero+this.index,this.zero+this.index+n);return this.index+=n,l},v.exports=i},{"../utils":32,"./DataReader":18}],18:[function(e,v,u){"use strict";var s=e("../utils");function i(n){this.data=n,this.length=n.length,this.index=0,this.zero=0}i.prototype={checkOffset:function(n){this.checkIndex(this.index+n)},checkIndex:function(n){if(this.length<this.zero+n||n<0)throw new Error("End of data reached (data length = "+this.length+", asked index = "+n+"). Corrupted zip ?")},setIndex:function(n){this.checkIndex(n),this.index=n},skip:function(n){this.setIndex(this.index+n)},byteAt:function(){},readInt:function(n){var l,b=0;for(this.checkOffset(n),l=this.index+n-1;l>=this.index;l--)b=(b<<8)+this.byteAt(l);return this.index+=n,b},readString:function(n){return s.transformTo("string",this.readData(n))},readData:function(){},lastIndexOfSignature:function(){},readAndCheckSignature:function(){},readDate:function(){var n=this.readInt(4);return new Date(Date.UTC(1980+(n>>25&127),(n>>21&15)-1,n>>16&31,n>>11&31,n>>5&63,(31&n)<<1))}},v.exports=i},{"../utils":32}],19:[function(e,v,u){"use strict";var s=e("./Uint8ArrayReader");function i(n){s.call(this,n)}e("../utils").inherits(i,s),i.prototype.readData=function(n){this.checkOffset(n);var l=this.data.slice(this.zero+this.index,this.zero+this.index+n);return this.index+=n,l},v.exports=i},{"../utils":32,"./Uint8ArrayReader":21}],20:[function(e,v,u){"use strict";var s=e("./DataReader");function i(n){s.call(this,n)}e("../utils").inherits(i,s),i.prototype.byteAt=function(n){return this.data.charCodeAt(this.zero+n)},i.prototype.lastIndexOfSignature=function(n){return this.data.lastIndexOf(n)-this.zero},i.prototype.readAndCheckSignature=function(n){return n===this.readData(4)},i.prototype.readData=function(n){this.checkOffset(n);var l=this.data.slice(this.zero+this.index,this.zero+this.index+n);return this.index+=n,l},v.exports=i},{"../utils":32,"./DataReader":18}],21:[function(e,v,u){"use strict";var s=e("./ArrayReader");function i(n){s.call(this,n)}e("../utils").inherits(i,s),i.prototype.readData=function(n){if(this.checkOffset(n),n===0)return new Uint8Array(0);var l=this.data.subarray(this.zero+this.index,this.zero+this.index+n);return this.index+=n,l},v.exports=i},{"../utils":32,"./ArrayReader":17}],22:[function(e,v,u){"use strict";var s=e("../utils"),i=e("../support"),n=e("./ArrayReader"),l=e("./StringReader"),b=e("./NodeBufferReader"),_=e("./Uint8ArrayReader");v.exports=function(c){var f=s.getTypeOf(c);return s.checkSupport(f),f!=="string"||i.uint8array?f==="nodebuffer"?new b(c):i.uint8array?new _(s.transformTo("uint8array",c)):new n(s.transformTo("array",c)):new l(c)}},{"../support":30,"../utils":32,"./ArrayReader":17,"./NodeBufferReader":19,"./StringReader":20,"./Uint8ArrayReader":21}],23:[function(e,v,u){"use strict";u.LOCAL_FILE_HEADER="PK",u.CENTRAL_FILE_HEADER="PK",u.CENTRAL_DIRECTORY_END="PK",u.ZIP64_CENTRAL_DIRECTORY_LOCATOR="PK\x07",u.ZIP64_CENTRAL_DIRECTORY_END="PK",u.DATA_DESCRIPTOR="PK\x07\b"},{}],24:[function(e,v,u){"use strict";var s=e("./GenericWorker"),i=e("../utils");function n(l){s.call(this,"ConvertWorker to "+l),this.destType=l}i.inherits(n,s),n.prototype.processChunk=function(l){this.push({data:i.transformTo(this.destType,l.data),meta:l.meta})},v.exports=n},{"../utils":32,"./GenericWorker":28}],25:[function(e,v,u){"use strict";var s=e("./GenericWorker"),i=e("../crc32");function n(){s.call(this,"Crc32Probe"),this.withStreamInfo("crc32",0)}e("../utils").inherits(n,s),n.prototype.processChunk=function(l){this.streamInfo.crc32=i(l.data,this.streamInfo.crc32||0),this.push(l)},v.exports=n},{"../crc32":4,"../utils":32,"./GenericWorker":28}],26:[function(e,v,u){"use strict";var s=e("../utils"),i=e("./GenericWorker");function n(l){i.call(this,"DataLengthProbe for "+l),this.propName=l,this.withStreamInfo(l,0)}s.inherits(n,i),n.prototype.processChunk=function(l){if(l){var b=this.streamInfo[this.propName]||0;this.streamInfo[this.propName]=b+l.data.length}i.prototype.processChunk.call(this,l)},v.exports=n},{"../utils":32,"./GenericWorker":28}],27:[function(e,v,u){"use strict";var s=e("../utils"),i=e("./GenericWorker");function n(l){i.call(this,"DataWorker");var b=this;this.dataIsReady=!1,this.index=0,this.max=0,this.data=null,this.type="",this._tickScheduled=!1,l.then(function(_){b.dataIsReady=!0,b.data=_,b.max=_&&_.length||0,b.type=s.getTypeOf(_),b.isPaused||b._tickAndRepeat()},function(_){b.error(_)})}s.inherits(n,i),n.prototype.cleanUp=function(){i.prototype.cleanUp.call(this),this.data=null},n.prototype.resume=function(){return!!i.prototype.resume.call(this)&&(!this._tickScheduled&&this.dataIsReady&&(this._tickScheduled=!0,s.delay(this._tickAndRepeat,[],this)),!0)},n.prototype._tickAndRepeat=function(){this._tickScheduled=!1,this.isPaused||this.isFinished||(this._tick(),this.isFinished||(s.delay(this._tickAndRepeat,[],this),this._tickScheduled=!0))},n.prototype._tick=function(){if(this.isPaused||this.isFinished)return!1;var l=null,b=Math.min(this.max,this.index+16384);if(this.index>=this.max)return this.end();switch(this.type){case"string":l=this.data.substring(this.index,b);break;case"uint8array":l=this.data.subarray(this.index,b);break;case"array":case"nodebuffer":l=this.data.slice(this.index,b)}return this.index=b,this.push({data:l,meta:{percent:this.max?this.index/this.max*100:0}})},v.exports=n},{"../utils":32,"./GenericWorker":28}],28:[function(e,v,u){"use strict";function s(i){this.name=i||"default",this.streamInfo={},this.generatedError=null,this.extraStreamInfo={},this.isPaused=!0,this.isFinished=!1,this.isLocked=!1,this._listeners={data:[],end:[],error:[]},this.previous=null}s.prototype={push:function(i){this.emit("data",i)},end:function(){if(this.isFinished)return!1;this.flush();try{this.emit("end"),this.cleanUp(),this.isFinished=!0}catch(i){this.emit("error",i)}return!0},error:function(i){return!this.isFinished&&(this.isPaused?this.generatedError=i:(this.isFinished=!0,this.emit("error",i),this.previous&&this.previous.error(i),this.cleanUp()),!0)},on:function(i,n){return this._listeners[i].push(n),this},cleanUp:function(){this.streamInfo=this.generatedError=this.extraStreamInfo=null,this._listeners=[]},emit:function(i,n){if(this._listeners[i])for(var l=0;l<this._listeners[i].length;l++)this._listeners[i][l].call(this,n)},pipe:function(i){return i.registerPrevious(this)},registerPrevious:function(i){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.streamInfo=i.streamInfo,this.mergeStreamInfo(),this.previous=i;var n=this;return i.on("data",function(l){n.processChunk(l)}),i.on("end",function(){n.end()}),i.on("error",function(l){n.error(l)}),this},pause:function(){return!this.isPaused&&!this.isFinished&&(this.isPaused=!0,this.previous&&this.previous.pause(),!0)},resume:function(){if(!this.isPaused||this.isFinished)return!1;var i=this.isPaused=!1;return this.generatedError&&(this.error(this.generatedError),i=!0),this.previous&&this.previous.resume(),!i},flush:function(){},processChunk:function(i){this.push(i)},withStreamInfo:function(i,n){return this.extraStreamInfo[i]=n,this.mergeStreamInfo(),this},mergeStreamInfo:function(){for(var i in this.extraStreamInfo)Object.prototype.hasOwnProperty.call(this.extraStreamInfo,i)&&(this.streamInfo[i]=this.extraStreamInfo[i])},lock:function(){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.isLocked=!0,this.previous&&this.previous.lock()},toString:function(){var i="Worker "+this.name;return this.previous?this.previous+" -> "+i:i}},v.exports=s},{}],29:[function(e,v,u){"use strict";var s=e("../utils"),i=e("./ConvertWorker"),n=e("./GenericWorker"),l=e("../base64"),b=e("../support"),_=e("../external"),c=null;if(b.nodestream)try{c=e("../nodejs/NodejsStreamOutputAdapter")}catch{}function f(m,a){return new _.Promise(function(h,d){var g=[],x=m._internalType,C=m._outputType,E=m._mimeType;m.on("data",function(D,B){g.push(D),a&&a(B)}).on("error",function(D){g=[],d(D)}).on("end",function(){try{var D=(function(B,P,T){switch(B){case"blob":return s.newBlob(s.transformTo("arraybuffer",P),T);case"base64":return l.encode(P);default:return s.transformTo(B,P)}})(C,(function(B,P){var T,Z=0,J=null,y=0;for(T=0;T<P.length;T++)y+=P[T].length;switch(B){case"string":return P.join("");case"array":return Array.prototype.concat.apply([],P);case"uint8array":for(J=new Uint8Array(y),T=0;T<P.length;T++)J.set(P[T],Z),Z+=P[T].length;return J;case"nodebuffer":return Buffer.concat(P);default:throw new Error("concat : unsupported type '"+B+"'")}})(x,g),E);h(D)}catch(B){d(B)}g=[]}).resume()})}function o(m,a,h){var d=a;switch(a){case"blob":case"arraybuffer":d="uint8array";break;case"base64":d="string"}try{this._internalType=d,this._outputType=a,this._mimeType=h,s.checkSupport(d),this._worker=m.pipe(new i(d)),m.lock()}catch(g){this._worker=new n("error"),this._worker.error(g)}}o.prototype={accumulate:function(m){return f(this,m)},on:function(m,a){var h=this;return m==="data"?this._worker.on(m,function(d){a.call(h,d.data,d.meta)}):this._worker.on(m,function(){s.delay(a,arguments,h)}),this},resume:function(){return s.delay(this._worker.resume,[],this._worker),this},pause:function(){return this._worker.pause(),this},toNodejsStream:function(m){if(s.checkSupport("nodestream"),this._outputType!=="nodebuffer")throw new Error(this._outputType+" is not supported by this method");return new c(this,{objectMode:this._outputType!=="nodebuffer"},m)}},v.exports=o},{"../base64":1,"../external":6,"../nodejs/NodejsStreamOutputAdapter":13,"../support":30,"../utils":32,"./ConvertWorker":24,"./GenericWorker":28}],30:[function(e,v,u){"use strict";if(u.base64=!0,u.array=!0,u.string=!0,u.arraybuffer=typeof ArrayBuffer<"u"&&typeof Uint8Array<"u",u.nodebuffer=typeof Buffer<"u",u.uint8array=typeof Uint8Array<"u",typeof ArrayBuffer>"u")u.blob=!1;else{var s=new ArrayBuffer(0);try{u.blob=new Blob([s],{type:"application/zip"}).size===0}catch{try{var i=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);i.append(s),u.blob=i.getBlob("application/zip").size===0}catch{u.blob=!1}}}try{u.nodestream=!!e("readable-stream").Readable}catch{u.nodestream=!1}},{"readable-stream":16}],31:[function(e,v,u){"use strict";for(var s=e("./utils"),i=e("./support"),n=e("./nodejsUtils"),l=e("./stream/GenericWorker"),b=new Array(256),_=0;_<256;_++)b[_]=252<=_?6:248<=_?5:240<=_?4:224<=_?3:192<=_?2:1;b[254]=b[254]=1;function c(){l.call(this,"utf-8 decode"),this.leftOver=null}function f(){l.call(this,"utf-8 encode")}u.utf8encode=function(o){return i.nodebuffer?n.newBufferFrom(o,"utf-8"):(function(m){var a,h,d,g,x,C=m.length,E=0;for(g=0;g<C;g++)(64512&(h=m.charCodeAt(g)))==55296&&g+1<C&&(64512&(d=m.charCodeAt(g+1)))==56320&&(h=65536+(h-55296<<10)+(d-56320),g++),E+=h<128?1:h<2048?2:h<65536?3:4;for(a=i.uint8array?new Uint8Array(E):new Array(E),g=x=0;x<E;g++)(64512&(h=m.charCodeAt(g)))==55296&&g+1<C&&(64512&(d=m.charCodeAt(g+1)))==56320&&(h=65536+(h-55296<<10)+(d-56320),g++),h<128?a[x++]=h:(h<2048?a[x++]=192|h>>>6:(h<65536?a[x++]=224|h>>>12:(a[x++]=240|h>>>18,a[x++]=128|h>>>12&63),a[x++]=128|h>>>6&63),a[x++]=128|63&h);return a})(o)},u.utf8decode=function(o){return i.nodebuffer?s.transformTo("nodebuffer",o).toString("utf-8"):(function(m){var a,h,d,g,x=m.length,C=new Array(2*x);for(a=h=0;a<x;)if((d=m[a++])<128)C[h++]=d;else if(4<(g=b[d]))C[h++]=65533,a+=g-1;else{for(d&=g===2?31:g===3?15:7;1<g&&a<x;)d=d<<6|63&m[a++],g--;1<g?C[h++]=65533:d<65536?C[h++]=d:(d-=65536,C[h++]=55296|d>>10&1023,C[h++]=56320|1023&d)}return C.length!==h&&(C.subarray?C=C.subarray(0,h):C.length=h),s.applyFromCharCode(C)})(o=s.transformTo(i.uint8array?"uint8array":"array",o))},s.inherits(c,l),c.prototype.processChunk=function(o){var m=s.transformTo(i.uint8array?"uint8array":"array",o.data);if(this.leftOver&&this.leftOver.length){if(i.uint8array){var a=m;(m=new Uint8Array(a.length+this.leftOver.length)).set(this.leftOver,0),m.set(a,this.leftOver.length)}else m=this.leftOver.concat(m);this.leftOver=null}var h=(function(g,x){var C;for((x=x||g.length)>g.length&&(x=g.length),C=x-1;0<=C&&(192&g[C])==128;)C--;return C<0||C===0?x:C+b[g[C]]>x?C:x})(m),d=m;h!==m.length&&(i.uint8array?(d=m.subarray(0,h),this.leftOver=m.subarray(h,m.length)):(d=m.slice(0,h),this.leftOver=m.slice(h,m.length))),this.push({data:u.utf8decode(d),meta:o.meta})},c.prototype.flush=function(){this.leftOver&&this.leftOver.length&&(this.push({data:u.utf8decode(this.leftOver),meta:{}}),this.leftOver=null)},u.Utf8DecodeWorker=c,s.inherits(f,l),f.prototype.processChunk=function(o){this.push({data:u.utf8encode(o.data),meta:o.meta})},u.Utf8EncodeWorker=f},{"./nodejsUtils":14,"./stream/GenericWorker":28,"./support":30,"./utils":32}],32:[function(e,v,u){"use strict";var s=e("./support"),i=e("./base64"),n=e("./nodejsUtils"),l=e("./external");function b(a){return a}function _(a,h){for(var d=0;d<a.length;++d)h[d]=255&a.charCodeAt(d);return h}e("setimmediate"),u.newBlob=function(a,h){u.checkSupport("blob");try{return new Blob([a],{type:h})}catch{try{var d=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);return d.append(a),d.getBlob(h)}catch{throw new Error("Bug : can't construct the Blob.")}}};var c={stringifyByChunk:function(a,h,d){var g=[],x=0,C=a.length;if(C<=d)return String.fromCharCode.apply(null,a);for(;x<C;)h==="array"||h==="nodebuffer"?g.push(String.fromCharCode.apply(null,a.slice(x,Math.min(x+d,C)))):g.push(String.fromCharCode.apply(null,a.subarray(x,Math.min(x+d,C)))),x+=d;return g.join("")},stringifyByChar:function(a){for(var h="",d=0;d<a.length;d++)h+=String.fromCharCode(a[d]);return h},applyCanBeUsed:{uint8array:(function(){try{return s.uint8array&&String.fromCharCode.apply(null,new Uint8Array(1)).length===1}catch{return!1}})(),nodebuffer:(function(){try{return s.nodebuffer&&String.fromCharCode.apply(null,n.allocBuffer(1)).length===1}catch{return!1}})()}};function f(a){var h=65536,d=u.getTypeOf(a),g=!0;if(d==="uint8array"?g=c.applyCanBeUsed.uint8array:d==="nodebuffer"&&(g=c.applyCanBeUsed.nodebuffer),g)for(;1<h;)try{return c.stringifyByChunk(a,d,h)}catch{h=Math.floor(h/2)}return c.stringifyByChar(a)}function o(a,h){for(var d=0;d<a.length;d++)h[d]=a[d];return h}u.applyFromCharCode=f;var m={};m.string={string:b,array:function(a){return _(a,new Array(a.length))},arraybuffer:function(a){return m.string.uint8array(a).buffer},uint8array:function(a){return _(a,new Uint8Array(a.length))},nodebuffer:function(a){return _(a,n.allocBuffer(a.length))}},m.array={string:f,array:b,arraybuffer:function(a){return new Uint8Array(a).buffer},uint8array:function(a){return new Uint8Array(a)},nodebuffer:function(a){return n.newBufferFrom(a)}},m.arraybuffer={string:function(a){return f(new Uint8Array(a))},array:function(a){return o(new Uint8Array(a),new Array(a.byteLength))},arraybuffer:b,uint8array:function(a){return new Uint8Array(a)},nodebuffer:function(a){return n.newBufferFrom(new Uint8Array(a))}},m.uint8array={string:f,array:function(a){return o(a,new Array(a.length))},arraybuffer:function(a){return a.buffer},uint8array:b,nodebuffer:function(a){return n.newBufferFrom(a)}},m.nodebuffer={string:f,array:function(a){return o(a,new Array(a.length))},arraybuffer:function(a){return m.nodebuffer.uint8array(a).buffer},uint8array:function(a){return o(a,new Uint8Array(a.length))},nodebuffer:b},u.transformTo=function(a,h){if(h=h||"",!a)return h;u.checkSupport(a);var d=u.getTypeOf(h);return m[d][a](h)},u.resolve=function(a){for(var h=a.split("/"),d=[],g=0;g<h.length;g++){var x=h[g];x==="."||x===""&&g!==0&&g!==h.length-1||(x===".."?d.pop():d.push(x))}return d.join("/")},u.getTypeOf=function(a){return typeof a=="string"?"string":Object.prototype.toString.call(a)==="[object Array]"?"array":s.nodebuffer&&n.isBuffer(a)?"nodebuffer":s.uint8array&&a instanceof Uint8Array?"uint8array":s.arraybuffer&&a instanceof ArrayBuffer?"arraybuffer":void 0},u.checkSupport=function(a){if(!s[a.toLowerCase()])throw new Error(a+" is not supported by this platform")},u.MAX_VALUE_16BITS=65535,u.MAX_VALUE_32BITS=-1,u.pretty=function(a){var h,d,g="";for(d=0;d<(a||"").length;d++)g+="\\x"+((h=a.charCodeAt(d))<16?"0":"")+h.toString(16).toUpperCase();return g},u.delay=function(a,h,d){setImmediate(function(){a.apply(d||null,h||[])})},u.inherits=function(a,h){function d(){}d.prototype=h.prototype,a.prototype=new d},u.extend=function(){var a,h,d={};for(a=0;a<arguments.length;a++)for(h in arguments[a])Object.prototype.hasOwnProperty.call(arguments[a],h)&&d[h]===void 0&&(d[h]=arguments[a][h]);return d},u.prepareContent=function(a,h,d,g,x){return l.Promise.resolve(h).then(function(C){return s.blob&&(C instanceof Blob||["[object File]","[object Blob]"].indexOf(Object.prototype.toString.call(C))!==-1)&&typeof FileReader<"u"?new l.Promise(function(E,D){var B=new FileReader;B.onload=function(P){E(P.target.result)},B.onerror=function(P){D(P.target.error)},B.readAsArrayBuffer(C)}):C}).then(function(C){var E=u.getTypeOf(C);return E?(E==="arraybuffer"?C=u.transformTo("uint8array",C):E==="string"&&(x?C=i.decode(C):d&&g!==!0&&(C=(function(D){return _(D,s.uint8array?new Uint8Array(D.length):new Array(D.length))})(C))),C):l.Promise.reject(new Error("Can't read the data of '"+a+"'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"))})}},{"./base64":1,"./external":6,"./nodejsUtils":14,"./support":30,setimmediate:54}],33:[function(e,v,u){"use strict";var s=e("./reader/readerFor"),i=e("./utils"),n=e("./signature"),l=e("./zipEntry"),b=e("./support");function _(c){this.files=[],this.loadOptions=c}_.prototype={checkSignature:function(c){if(!this.reader.readAndCheckSignature(c)){this.reader.index-=4;var f=this.reader.readString(4);throw new Error("Corrupted zip or bug: unexpected signature ("+i.pretty(f)+", expected "+i.pretty(c)+")")}},isSignature:function(c,f){var o=this.reader.index;this.reader.setIndex(c);var m=this.reader.readString(4)===f;return this.reader.setIndex(o),m},readBlockEndOfCentral:function(){this.diskNumber=this.reader.readInt(2),this.diskWithCentralDirStart=this.reader.readInt(2),this.centralDirRecordsOnThisDisk=this.reader.readInt(2),this.centralDirRecords=this.reader.readInt(2),this.centralDirSize=this.reader.readInt(4),this.centralDirOffset=this.reader.readInt(4),this.zipCommentLength=this.reader.readInt(2);var c=this.reader.readData(this.zipCommentLength),f=b.uint8array?"uint8array":"array",o=i.transformTo(f,c);this.zipComment=this.loadOptions.decodeFileName(o)},readBlockZip64EndOfCentral:function(){this.zip64EndOfCentralSize=this.reader.readInt(8),this.reader.skip(4),this.diskNumber=this.reader.readInt(4),this.diskWithCentralDirStart=this.reader.readInt(4),this.centralDirRecordsOnThisDisk=this.reader.readInt(8),this.centralDirRecords=this.reader.readInt(8),this.centralDirSize=this.reader.readInt(8),this.centralDirOffset=this.reader.readInt(8),this.zip64ExtensibleData={};for(var c,f,o,m=this.zip64EndOfCentralSize-44;0<m;)c=this.reader.readInt(2),f=this.reader.readInt(4),o=this.reader.readData(f),this.zip64ExtensibleData[c]={id:c,length:f,value:o}},readBlockZip64EndOfCentralLocator:function(){if(this.diskWithZip64CentralDirStart=this.reader.readInt(4),this.relativeOffsetEndOfZip64CentralDir=this.reader.readInt(8),this.disksCount=this.reader.readInt(4),1<this.disksCount)throw new Error("Multi-volumes zip are not supported")},readLocalFiles:function(){var c,f;for(c=0;c<this.files.length;c++)f=this.files[c],this.reader.setIndex(f.localHeaderOffset),this.checkSignature(n.LOCAL_FILE_HEADER),f.readLocalPart(this.reader),f.handleUTF8(),f.processAttributes()},readCentralDir:function(){var c;for(this.reader.setIndex(this.centralDirOffset);this.reader.readAndCheckSignature(n.CENTRAL_FILE_HEADER);)(c=new l({zip64:this.zip64},this.loadOptions)).readCentralPart(this.reader),this.files.push(c);if(this.centralDirRecords!==this.files.length&&this.centralDirRecords!==0&&this.files.length===0)throw new Error("Corrupted zip or bug: expected "+this.centralDirRecords+" records in central dir, got "+this.files.length)},readEndOfCentral:function(){var c=this.reader.lastIndexOfSignature(n.CENTRAL_DIRECTORY_END);if(c<0)throw this.isSignature(0,n.LOCAL_FILE_HEADER)?new Error("Corrupted zip: can't find end of central directory"):new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html");this.reader.setIndex(c);var f=c;if(this.checkSignature(n.CENTRAL_DIRECTORY_END),this.readBlockEndOfCentral(),this.diskNumber===i.MAX_VALUE_16BITS||this.diskWithCentralDirStart===i.MAX_VALUE_16BITS||this.centralDirRecordsOnThisDisk===i.MAX_VALUE_16BITS||this.centralDirRecords===i.MAX_VALUE_16BITS||this.centralDirSize===i.MAX_VALUE_32BITS||this.centralDirOffset===i.MAX_VALUE_32BITS){if(this.zip64=!0,(c=this.reader.lastIndexOfSignature(n.ZIP64_CENTRAL_DIRECTORY_LOCATOR))<0)throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");if(this.reader.setIndex(c),this.checkSignature(n.ZIP64_CENTRAL_DIRECTORY_LOCATOR),this.readBlockZip64EndOfCentralLocator(),!this.isSignature(this.relativeOffsetEndOfZip64CentralDir,n.ZIP64_CENTRAL_DIRECTORY_END)&&(this.relativeOffsetEndOfZip64CentralDir=this.reader.lastIndexOfSignature(n.ZIP64_CENTRAL_DIRECTORY_END),this.relativeOffsetEndOfZip64CentralDir<0))throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir),this.checkSignature(n.ZIP64_CENTRAL_DIRECTORY_END),this.readBlockZip64EndOfCentral()}var o=this.centralDirOffset+this.centralDirSize;this.zip64&&(o+=20,o+=12+this.zip64EndOfCentralSize);var m=f-o;if(0<m)this.isSignature(f,n.CENTRAL_FILE_HEADER)||(this.reader.zero=m);else if(m<0)throw new Error("Corrupted zip: missing "+Math.abs(m)+" bytes.")},prepareReader:function(c){this.reader=s(c)},load:function(c){this.prepareReader(c),this.readEndOfCentral(),this.readCentralDir(),this.readLocalFiles()}},v.exports=_},{"./reader/readerFor":22,"./signature":23,"./support":30,"./utils":32,"./zipEntry":34}],34:[function(e,v,u){"use strict";var s=e("./reader/readerFor"),i=e("./utils"),n=e("./compressedObject"),l=e("./crc32"),b=e("./utf8"),_=e("./compressions"),c=e("./support");function f(o,m){this.options=o,this.loadOptions=m}f.prototype={isEncrypted:function(){return(1&this.bitFlag)==1},useUTF8:function(){return(2048&this.bitFlag)==2048},readLocalPart:function(o){var m,a;if(o.skip(22),this.fileNameLength=o.readInt(2),a=o.readInt(2),this.fileName=o.readData(this.fileNameLength),o.skip(a),this.compressedSize===-1||this.uncompressedSize===-1)throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");if((m=(function(h){for(var d in _)if(Object.prototype.hasOwnProperty.call(_,d)&&_[d].magic===h)return _[d];return null})(this.compressionMethod))===null)throw new Error("Corrupted zip : compression "+i.pretty(this.compressionMethod)+" unknown (inner file : "+i.transformTo("string",this.fileName)+")");this.decompressed=new n(this.compressedSize,this.uncompressedSize,this.crc32,m,o.readData(this.compressedSize))},readCentralPart:function(o){this.versionMadeBy=o.readInt(2),o.skip(2),this.bitFlag=o.readInt(2),this.compressionMethod=o.readString(2),this.date=o.readDate(),this.crc32=o.readInt(4),this.compressedSize=o.readInt(4),this.uncompressedSize=o.readInt(4);var m=o.readInt(2);if(this.extraFieldsLength=o.readInt(2),this.fileCommentLength=o.readInt(2),this.diskNumberStart=o.readInt(2),this.internalFileAttributes=o.readInt(2),this.externalFileAttributes=o.readInt(4),this.localHeaderOffset=o.readInt(4),this.isEncrypted())throw new Error("Encrypted zip are not supported");o.skip(m),this.readExtraFields(o),this.parseZIP64ExtraField(o),this.fileComment=o.readData(this.fileCommentLength)},processAttributes:function(){this.unixPermissions=null,this.dosPermissions=null;var o=this.versionMadeBy>>8;this.dir=!!(16&this.externalFileAttributes),o==0&&(this.dosPermissions=63&this.externalFileAttributes),o==3&&(this.unixPermissions=this.externalFileAttributes>>16&65535),this.dir||this.fileNameStr.slice(-1)!=="/"||(this.dir=!0)},parseZIP64ExtraField:function(){if(this.extraFields[1]){var o=s(this.extraFields[1].value);this.uncompressedSize===i.MAX_VALUE_32BITS&&(this.uncompressedSize=o.readInt(8)),this.compressedSize===i.MAX_VALUE_32BITS&&(this.compressedSize=o.readInt(8)),this.localHeaderOffset===i.MAX_VALUE_32BITS&&(this.localHeaderOffset=o.readInt(8)),this.diskNumberStart===i.MAX_VALUE_32BITS&&(this.diskNumberStart=o.readInt(4))}},readExtraFields:function(o){var m,a,h,d=o.index+this.extraFieldsLength;for(this.extraFields||(this.extraFields={});o.index+4<d;)m=o.readInt(2),a=o.readInt(2),h=o.readData(a),this.extraFields[m]={id:m,length:a,value:h};o.setIndex(d)},handleUTF8:function(){var o=c.uint8array?"uint8array":"array";if(this.useUTF8())this.fileNameStr=b.utf8decode(this.fileName),this.fileCommentStr=b.utf8decode(this.fileComment);else{var m=this.findExtraFieldUnicodePath();if(m!==null)this.fileNameStr=m;else{var a=i.transformTo(o,this.fileName);this.fileNameStr=this.loadOptions.decodeFileName(a)}var h=this.findExtraFieldUnicodeComment();if(h!==null)this.fileCommentStr=h;else{var d=i.transformTo(o,this.fileComment);this.fileCommentStr=this.loadOptions.decodeFileName(d)}}},findExtraFieldUnicodePath:function(){var o=this.extraFields[28789];if(o){var m=s(o.value);return m.readInt(1)!==1||l(this.fileName)!==m.readInt(4)?null:b.utf8decode(m.readData(o.length-5))}return null},findExtraFieldUnicodeComment:function(){var o=this.extraFields[25461];if(o){var m=s(o.value);return m.readInt(1)!==1||l(this.fileComment)!==m.readInt(4)?null:b.utf8decode(m.readData(o.length-5))}return null}},v.exports=f},{"./compressedObject":2,"./compressions":3,"./crc32":4,"./reader/readerFor":22,"./support":30,"./utf8":31,"./utils":32}],35:[function(e,v,u){"use strict";function s(m,a,h){this.name=m,this.dir=h.dir,this.date=h.date,this.comment=h.comment,this.unixPermissions=h.unixPermissions,this.dosPermissions=h.dosPermissions,this._data=a,this._dataBinary=h.binary,this.options={compression:h.compression,compressionOptions:h.compressionOptions}}var i=e("./stream/StreamHelper"),n=e("./stream/DataWorker"),l=e("./utf8"),b=e("./compressedObject"),_=e("./stream/GenericWorker");s.prototype={internalStream:function(m){var a=null,h="string";try{if(!m)throw new Error("No output type specified.");var d=(h=m.toLowerCase())==="string"||h==="text";h!=="binarystring"&&h!=="text"||(h="string"),a=this._decompressWorker();var g=!this._dataBinary;g&&!d&&(a=a.pipe(new l.Utf8EncodeWorker)),!g&&d&&(a=a.pipe(new l.Utf8DecodeWorker))}catch(x){(a=new _("error")).error(x)}return new i(a,h,"")},async:function(m,a){return this.internalStream(m).accumulate(a)},nodeStream:function(m,a){return this.internalStream(m||"nodebuffer").toNodejsStream(a)},_compressWorker:function(m,a){if(this._data instanceof b&&this._data.compression.magic===m.magic)return this._data.getCompressedWorker();var h=this._decompressWorker();return this._dataBinary||(h=h.pipe(new l.Utf8EncodeWorker)),b.createWorkerFrom(h,m,a)},_decompressWorker:function(){return this._data instanceof b?this._data.getContentWorker():this._data instanceof _?this._data:new n(this._data)}};for(var c=["asText","asBinary","asNodeBuffer","asUint8Array","asArrayBuffer"],f=function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},o=0;o<c.length;o++)s.prototype[c[o]]=f;v.exports=s},{"./compressedObject":2,"./stream/DataWorker":27,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31}],36:[function(e,v,u){(function(s){"use strict";var i,n,l=s.MutationObserver||s.WebKitMutationObserver;if(l){var b=0,_=new l(m),c=s.document.createTextNode("");_.observe(c,{characterData:!0}),i=function(){c.data=b=++b%2}}else if(s.setImmediate||s.MessageChannel===void 0)i="document"in s&&"onreadystatechange"in s.document.createElement("script")?function(){var a=s.document.createElement("script");a.onreadystatechange=function(){m(),a.onreadystatechange=null,a.parentNode.removeChild(a),a=null},s.document.documentElement.appendChild(a)}:function(){setTimeout(m,0)};else{var f=new s.MessageChannel;f.port1.onmessage=m,i=function(){f.port2.postMessage(0)}}var o=[];function m(){var a,h;n=!0;for(var d=o.length;d;){for(h=o,o=[],a=-1;++a<d;)h[a]();d=o.length}n=!1}v.exports=function(a){o.push(a)!==1||n||i()}}).call(this,typeof global<"u"?global:typeof self<"u"?self:typeof window<"u"?window:{})},{}],37:[function(e,v,u){"use strict";var s=e("immediate");function i(){}var n={},l=["REJECTED"],b=["FULFILLED"],_=["PENDING"];function c(d){if(typeof d!="function")throw new TypeError("resolver must be a function");this.state=_,this.queue=[],this.outcome=void 0,d!==i&&a(this,d)}function f(d,g,x){this.promise=d,typeof g=="function"&&(this.onFulfilled=g,this.callFulfilled=this.otherCallFulfilled),typeof x=="function"&&(this.onRejected=x,this.callRejected=this.otherCallRejected)}function o(d,g,x){s(function(){var C;try{C=g(x)}catch(E){return n.reject(d,E)}C===d?n.reject(d,new TypeError("Cannot resolve promise with itself")):n.resolve(d,C)})}function m(d){var g=d&&d.then;if(d&&(typeof d=="object"||typeof d=="function")&&typeof g=="function")return function(){g.apply(d,arguments)}}function a(d,g){var x=!1;function C(B){x||(x=!0,n.reject(d,B))}function E(B){x||(x=!0,n.resolve(d,B))}var D=h(function(){g(E,C)});D.status==="error"&&C(D.value)}function h(d,g){var x={};try{x.value=d(g),x.status="success"}catch(C){x.status="error",x.value=C}return x}(v.exports=c).prototype.finally=function(d){if(typeof d!="function")return this;var g=this.constructor;return this.then(function(x){return g.resolve(d()).then(function(){return x})},function(x){return g.resolve(d()).then(function(){throw x})})},c.prototype.catch=function(d){return this.then(null,d)},c.prototype.then=function(d,g){if(typeof d!="function"&&this.state===b||typeof g!="function"&&this.state===l)return this;var x=new this.constructor(i);return this.state!==_?o(x,this.state===b?d:g,this.outcome):this.queue.push(new f(x,d,g)),x},f.prototype.callFulfilled=function(d){n.resolve(this.promise,d)},f.prototype.otherCallFulfilled=function(d){o(this.promise,this.onFulfilled,d)},f.prototype.callRejected=function(d){n.reject(this.promise,d)},f.prototype.otherCallRejected=function(d){o(this.promise,this.onRejected,d)},n.resolve=function(d,g){var x=h(m,g);if(x.status==="error")return n.reject(d,x.value);var C=x.value;if(C)a(d,C);else{d.state=b,d.outcome=g;for(var E=-1,D=d.queue.length;++E<D;)d.queue[E].callFulfilled(g)}return d},n.reject=function(d,g){d.state=l,d.outcome=g;for(var x=-1,C=d.queue.length;++x<C;)d.queue[x].callRejected(g);return d},c.resolve=function(d){return d instanceof this?d:n.resolve(new this(i),d)},c.reject=function(d){var g=new this(i);return n.reject(g,d)},c.all=function(d){var g=this;if(Object.prototype.toString.call(d)!=="[object Array]")return this.reject(new TypeError("must be an array"));var x=d.length,C=!1;if(!x)return this.resolve([]);for(var E=new Array(x),D=0,B=-1,P=new this(i);++B<x;)T(d[B],B);return P;function T(Z,J){g.resolve(Z).then(function(y){E[J]=y,++D!==x||C||(C=!0,n.resolve(P,E))},function(y){C||(C=!0,n.reject(P,y))})}},c.race=function(d){var g=this;if(Object.prototype.toString.call(d)!=="[object Array]")return this.reject(new TypeError("must be an array"));var x=d.length,C=!1;if(!x)return this.resolve([]);for(var E=-1,D=new this(i);++E<x;)B=d[E],g.resolve(B).then(function(P){C||(C=!0,n.resolve(D,P))},function(P){C||(C=!0,n.reject(D,P))});var B;return D}},{immediate:36}],38:[function(e,v,u){"use strict";var s={};(0,e("./lib/utils/common").assign)(s,e("./lib/deflate"),e("./lib/inflate"),e("./lib/zlib/constants")),v.exports=s},{"./lib/deflate":39,"./lib/inflate":40,"./lib/utils/common":41,"./lib/zlib/constants":44}],39:[function(e,v,u){"use strict";var s=e("./zlib/deflate"),i=e("./utils/common"),n=e("./utils/strings"),l=e("./zlib/messages"),b=e("./zlib/zstream"),_=Object.prototype.toString,c=0,f=-1,o=0,m=8;function a(d){if(!(this instanceof a))return new a(d);this.options=i.assign({level:f,method:m,chunkSize:16384,windowBits:15,memLevel:8,strategy:o,to:""},d||{});var g=this.options;g.raw&&0<g.windowBits?g.windowBits=-g.windowBits:g.gzip&&0<g.windowBits&&g.windowBits<16&&(g.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new b,this.strm.avail_out=0;var x=s.deflateInit2(this.strm,g.level,g.method,g.windowBits,g.memLevel,g.strategy);if(x!==c)throw new Error(l[x]);if(g.header&&s.deflateSetHeader(this.strm,g.header),g.dictionary){var C;if(C=typeof g.dictionary=="string"?n.string2buf(g.dictionary):_.call(g.dictionary)==="[object ArrayBuffer]"?new Uint8Array(g.dictionary):g.dictionary,(x=s.deflateSetDictionary(this.strm,C))!==c)throw new Error(l[x]);this._dict_set=!0}}function h(d,g){var x=new a(g);if(x.push(d,!0),x.err)throw x.msg||l[x.err];return x.result}a.prototype.push=function(d,g){var x,C,E=this.strm,D=this.options.chunkSize;if(this.ended)return!1;C=g===~~g?g:g===!0?4:0,typeof d=="string"?E.input=n.string2buf(d):_.call(d)==="[object ArrayBuffer]"?E.input=new Uint8Array(d):E.input=d,E.next_in=0,E.avail_in=E.input.length;do{if(E.avail_out===0&&(E.output=new i.Buf8(D),E.next_out=0,E.avail_out=D),(x=s.deflate(E,C))!==1&&x!==c)return this.onEnd(x),!(this.ended=!0);E.avail_out!==0&&(E.avail_in!==0||C!==4&&C!==2)||(this.options.to==="string"?this.onData(n.buf2binstring(i.shrinkBuf(E.output,E.next_out))):this.onData(i.shrinkBuf(E.output,E.next_out)))}while((0<E.avail_in||E.avail_out===0)&&x!==1);return C===4?(x=s.deflateEnd(this.strm),this.onEnd(x),this.ended=!0,x===c):C!==2||(this.onEnd(c),!(E.avail_out=0))},a.prototype.onData=function(d){this.chunks.push(d)},a.prototype.onEnd=function(d){d===c&&(this.options.to==="string"?this.result=this.chunks.join(""):this.result=i.flattenChunks(this.chunks)),this.chunks=[],this.err=d,this.msg=this.strm.msg},u.Deflate=a,u.deflate=h,u.deflateRaw=function(d,g){return(g=g||{}).raw=!0,h(d,g)},u.gzip=function(d,g){return(g=g||{}).gzip=!0,h(d,g)}},{"./utils/common":41,"./utils/strings":42,"./zlib/deflate":46,"./zlib/messages":51,"./zlib/zstream":53}],40:[function(e,v,u){"use strict";var s=e("./zlib/inflate"),i=e("./utils/common"),n=e("./utils/strings"),l=e("./zlib/constants"),b=e("./zlib/messages"),_=e("./zlib/zstream"),c=e("./zlib/gzheader"),f=Object.prototype.toString;function o(a){if(!(this instanceof o))return new o(a);this.options=i.assign({chunkSize:16384,windowBits:0,to:""},a||{});var h=this.options;h.raw&&0<=h.windowBits&&h.windowBits<16&&(h.windowBits=-h.windowBits,h.windowBits===0&&(h.windowBits=-15)),!(0<=h.windowBits&&h.windowBits<16)||a&&a.windowBits||(h.windowBits+=32),15<h.windowBits&&h.windowBits<48&&(15&h.windowBits)==0&&(h.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new _,this.strm.avail_out=0;var d=s.inflateInit2(this.strm,h.windowBits);if(d!==l.Z_OK)throw new Error(b[d]);this.header=new c,s.inflateGetHeader(this.strm,this.header)}function m(a,h){var d=new o(h);if(d.push(a,!0),d.err)throw d.msg||b[d.err];return d.result}o.prototype.push=function(a,h){var d,g,x,C,E,D,B=this.strm,P=this.options.chunkSize,T=this.options.dictionary,Z=!1;if(this.ended)return!1;g=h===~~h?h:h===!0?l.Z_FINISH:l.Z_NO_FLUSH,typeof a=="string"?B.input=n.binstring2buf(a):f.call(a)==="[object ArrayBuffer]"?B.input=new Uint8Array(a):B.input=a,B.next_in=0,B.avail_in=B.input.length;do{if(B.avail_out===0&&(B.output=new i.Buf8(P),B.next_out=0,B.avail_out=P),(d=s.inflate(B,l.Z_NO_FLUSH))===l.Z_NEED_DICT&&T&&(D=typeof T=="string"?n.string2buf(T):f.call(T)==="[object ArrayBuffer]"?new Uint8Array(T):T,d=s.inflateSetDictionary(this.strm,D)),d===l.Z_BUF_ERROR&&Z===!0&&(d=l.Z_OK,Z=!1),d!==l.Z_STREAM_END&&d!==l.Z_OK)return this.onEnd(d),!(this.ended=!0);B.next_out&&(B.avail_out!==0&&d!==l.Z_STREAM_END&&(B.avail_in!==0||g!==l.Z_FINISH&&g!==l.Z_SYNC_FLUSH)||(this.options.to==="string"?(x=n.utf8border(B.output,B.next_out),C=B.next_out-x,E=n.buf2string(B.output,x),B.next_out=C,B.avail_out=P-C,C&&i.arraySet(B.output,B.output,x,C,0),this.onData(E)):this.onData(i.shrinkBuf(B.output,B.next_out)))),B.avail_in===0&&B.avail_out===0&&(Z=!0)}while((0<B.avail_in||B.avail_out===0)&&d!==l.Z_STREAM_END);return d===l.Z_STREAM_END&&(g=l.Z_FINISH),g===l.Z_FINISH?(d=s.inflateEnd(this.strm),this.onEnd(d),this.ended=!0,d===l.Z_OK):g!==l.Z_SYNC_FLUSH||(this.onEnd(l.Z_OK),!(B.avail_out=0))},o.prototype.onData=function(a){this.chunks.push(a)},o.prototype.onEnd=function(a){a===l.Z_OK&&(this.options.to==="string"?this.result=this.chunks.join(""):this.result=i.flattenChunks(this.chunks)),this.chunks=[],this.err=a,this.msg=this.strm.msg},u.Inflate=o,u.inflate=m,u.inflateRaw=function(a,h){return(h=h||{}).raw=!0,m(a,h)},u.ungzip=m},{"./utils/common":41,"./utils/strings":42,"./zlib/constants":44,"./zlib/gzheader":47,"./zlib/inflate":49,"./zlib/messages":51,"./zlib/zstream":53}],41:[function(e,v,u){"use strict";var s=typeof Uint8Array<"u"&&typeof Uint16Array<"u"&&typeof Int32Array<"u";u.assign=function(l){for(var b=Array.prototype.slice.call(arguments,1);b.length;){var _=b.shift();if(_){if(typeof _!="object")throw new TypeError(_+"must be non-object");for(var c in _)_.hasOwnProperty(c)&&(l[c]=_[c])}}return l},u.shrinkBuf=function(l,b){return l.length===b?l:l.subarray?l.subarray(0,b):(l.length=b,l)};var i={arraySet:function(l,b,_,c,f){if(b.subarray&&l.subarray)l.set(b.subarray(_,_+c),f);else for(var o=0;o<c;o++)l[f+o]=b[_+o]},flattenChunks:function(l){var b,_,c,f,o,m;for(b=c=0,_=l.length;b<_;b++)c+=l[b].length;for(m=new Uint8Array(c),b=f=0,_=l.length;b<_;b++)o=l[b],m.set(o,f),f+=o.length;return m}},n={arraySet:function(l,b,_,c,f){for(var o=0;o<c;o++)l[f+o]=b[_+o]},flattenChunks:function(l){return[].concat.apply([],l)}};u.setTyped=function(l){l?(u.Buf8=Uint8Array,u.Buf16=Uint16Array,u.Buf32=Int32Array,u.assign(u,i)):(u.Buf8=Array,u.Buf16=Array,u.Buf32=Array,u.assign(u,n))},u.setTyped(s)},{}],42:[function(e,v,u){"use strict";var s=e("./common"),i=!0,n=!0;try{String.fromCharCode.apply(null,[0])}catch{i=!1}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch{n=!1}for(var l=new s.Buf8(256),b=0;b<256;b++)l[b]=252<=b?6:248<=b?5:240<=b?4:224<=b?3:192<=b?2:1;function _(c,f){if(f<65537&&(c.subarray&&n||!c.subarray&&i))return String.fromCharCode.apply(null,s.shrinkBuf(c,f));for(var o="",m=0;m<f;m++)o+=String.fromCharCode(c[m]);return o}l[254]=l[254]=1,u.string2buf=function(c){var f,o,m,a,h,d=c.length,g=0;for(a=0;a<d;a++)(64512&(o=c.charCodeAt(a)))==55296&&a+1<d&&(64512&(m=c.charCodeAt(a+1)))==56320&&(o=65536+(o-55296<<10)+(m-56320),a++),g+=o<128?1:o<2048?2:o<65536?3:4;for(f=new s.Buf8(g),a=h=0;h<g;a++)(64512&(o=c.charCodeAt(a)))==55296&&a+1<d&&(64512&(m=c.charCodeAt(a+1)))==56320&&(o=65536+(o-55296<<10)+(m-56320),a++),o<128?f[h++]=o:(o<2048?f[h++]=192|o>>>6:(o<65536?f[h++]=224|o>>>12:(f[h++]=240|o>>>18,f[h++]=128|o>>>12&63),f[h++]=128|o>>>6&63),f[h++]=128|63&o);return f},u.buf2binstring=function(c){return _(c,c.length)},u.binstring2buf=function(c){for(var f=new s.Buf8(c.length),o=0,m=f.length;o<m;o++)f[o]=c.charCodeAt(o);return f},u.buf2string=function(c,f){var o,m,a,h,d=f||c.length,g=new Array(2*d);for(o=m=0;o<d;)if((a=c[o++])<128)g[m++]=a;else if(4<(h=l[a]))g[m++]=65533,o+=h-1;else{for(a&=h===2?31:h===3?15:7;1<h&&o<d;)a=a<<6|63&c[o++],h--;1<h?g[m++]=65533:a<65536?g[m++]=a:(a-=65536,g[m++]=55296|a>>10&1023,g[m++]=56320|1023&a)}return _(g,m)},u.utf8border=function(c,f){var o;for((f=f||c.length)>c.length&&(f=c.length),o=f-1;0<=o&&(192&c[o])==128;)o--;return o<0||o===0?f:o+l[c[o]]>f?o:f}},{"./common":41}],43:[function(e,v,u){"use strict";v.exports=function(s,i,n,l){for(var b=65535&s|0,_=s>>>16&65535|0,c=0;n!==0;){for(n-=c=2e3<n?2e3:n;_=_+(b=b+i[l++]|0)|0,--c;);b%=65521,_%=65521}return b|_<<16|0}},{}],44:[function(e,v,u){"use strict";v.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}},{}],45:[function(e,v,u){"use strict";var s=(function(){for(var i,n=[],l=0;l<256;l++){i=l;for(var b=0;b<8;b++)i=1&i?3988292384^i>>>1:i>>>1;n[l]=i}return n})();v.exports=function(i,n,l,b){var _=s,c=b+l;i^=-1;for(var f=b;f<c;f++)i=i>>>8^_[255&(i^n[f])];return-1^i}},{}],46:[function(e,v,u){"use strict";var s,i=e("../utils/common"),n=e("./trees"),l=e("./adler32"),b=e("./crc32"),_=e("./messages"),c=0,f=4,o=0,m=-2,a=-1,h=4,d=2,g=8,x=9,C=286,E=30,D=19,B=2*C+1,P=15,T=3,Z=258,J=Z+T+1,y=42,F=113,r=1,I=2,Q=3,U=4;function rt(t,M){return t.msg=_[M],M}function $(t){return(t<<1)-(4<t?9:0)}function et(t){for(var M=t.length;0<=--M;)t[M]=0}function A(t){var M=t.state,O=M.pending;O>t.avail_out&&(O=t.avail_out),O!==0&&(i.arraySet(t.output,M.pending_buf,M.pending_out,O,t.next_out),t.next_out+=O,M.pending_out+=O,t.total_out+=O,t.avail_out-=O,M.pending-=O,M.pending===0&&(M.pending_out=0))}function k(t,M){n._tr_flush_block(t,0<=t.block_start?t.block_start:-1,t.strstart-t.block_start,M),t.block_start=t.strstart,A(t.strm)}function R(t,M){t.pending_buf[t.pending++]=M}function Y(t,M){t.pending_buf[t.pending++]=M>>>8&255,t.pending_buf[t.pending++]=255&M}function G(t,M){var O,w,p=t.max_chain_length,z=t.strstart,j=t.prev_length,W=t.nice_match,N=t.strstart>t.w_size-J?t.strstart-(t.w_size-J):0,H=t.window,q=t.w_mask,V=t.prev,tt=t.strstart+Z,dt=H[z+j-1],at=H[z+j];t.prev_length>=t.good_match&&(p>>=2),W>t.lookahead&&(W=t.lookahead);do if(H[(O=M)+j]===at&&H[O+j-1]===dt&&H[O]===H[z]&&H[++O]===H[z+1]){z+=2,O++;do;while(H[++z]===H[++O]&&H[++z]===H[++O]&&H[++z]===H[++O]&&H[++z]===H[++O]&&H[++z]===H[++O]&&H[++z]===H[++O]&&H[++z]===H[++O]&&H[++z]===H[++O]&&z<tt);if(w=Z-(tt-z),z=tt-Z,j<w){if(t.match_start=M,W<=(j=w))break;dt=H[z+j-1],at=H[z+j]}}while((M=V[M&q])>N&&--p!=0);return j<=t.lookahead?j:t.lookahead}function ot(t){var M,O,w,p,z,j,W,N,H,q,V=t.w_size;do{if(p=t.window_size-t.lookahead-t.strstart,t.strstart>=V+(V-J)){for(i.arraySet(t.window,t.window,V,V,0),t.match_start-=V,t.strstart-=V,t.block_start-=V,M=O=t.hash_size;w=t.head[--M],t.head[M]=V<=w?w-V:0,--O;);for(M=O=V;w=t.prev[--M],t.prev[M]=V<=w?w-V:0,--O;);p+=V}if(t.strm.avail_in===0)break;if(j=t.strm,W=t.window,N=t.strstart+t.lookahead,H=p,q=void 0,q=j.avail_in,H<q&&(q=H),O=q===0?0:(j.avail_in-=q,i.arraySet(W,j.input,j.next_in,q,N),j.state.wrap===1?j.adler=l(j.adler,W,q,N):j.state.wrap===2&&(j.adler=b(j.adler,W,q,N)),j.next_in+=q,j.total_in+=q,q),t.lookahead+=O,t.lookahead+t.insert>=T)for(z=t.strstart-t.insert,t.ins_h=t.window[z],t.ins_h=(t.ins_h<<t.hash_shift^t.window[z+1])&t.hash_mask;t.insert&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[z+T-1])&t.hash_mask,t.prev[z&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=z,z++,t.insert--,!(t.lookahead+t.insert<T)););}while(t.lookahead<J&&t.strm.avail_in!==0)}function pt(t,M){for(var O,w;;){if(t.lookahead<J){if(ot(t),t.lookahead<J&&M===c)return r;if(t.lookahead===0)break}if(O=0,t.lookahead>=T&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+T-1])&t.hash_mask,O=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),O!==0&&t.strstart-O<=t.w_size-J&&(t.match_length=G(t,O)),t.match_length>=T)if(w=n._tr_tally(t,t.strstart-t.match_start,t.match_length-T),t.lookahead-=t.match_length,t.match_length<=t.max_lazy_match&&t.lookahead>=T){for(t.match_length--;t.strstart++,t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+T-1])&t.hash_mask,O=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart,--t.match_length!=0;);t.strstart++}else t.strstart+=t.match_length,t.match_length=0,t.ins_h=t.window[t.strstart],t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+1])&t.hash_mask;else w=n._tr_tally(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++;if(w&&(k(t,!1),t.strm.avail_out===0))return r}return t.insert=t.strstart<T-1?t.strstart:T-1,M===f?(k(t,!0),t.strm.avail_out===0?Q:U):t.last_lit&&(k(t,!1),t.strm.avail_out===0)?r:I}function it(t,M){for(var O,w,p;;){if(t.lookahead<J){if(ot(t),t.lookahead<J&&M===c)return r;if(t.lookahead===0)break}if(O=0,t.lookahead>=T&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+T-1])&t.hash_mask,O=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),t.prev_length=t.match_length,t.prev_match=t.match_start,t.match_length=T-1,O!==0&&t.prev_length<t.max_lazy_match&&t.strstart-O<=t.w_size-J&&(t.match_length=G(t,O),t.match_length<=5&&(t.strategy===1||t.match_length===T&&4096<t.strstart-t.match_start)&&(t.match_length=T-1)),t.prev_length>=T&&t.match_length<=t.prev_length){for(p=t.strstart+t.lookahead-T,w=n._tr_tally(t,t.strstart-1-t.prev_match,t.prev_length-T),t.lookahead-=t.prev_length-1,t.prev_length-=2;++t.strstart<=p&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+T-1])&t.hash_mask,O=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),--t.prev_length!=0;);if(t.match_available=0,t.match_length=T-1,t.strstart++,w&&(k(t,!1),t.strm.avail_out===0))return r}else if(t.match_available){if((w=n._tr_tally(t,0,t.window[t.strstart-1]))&&k(t,!1),t.strstart++,t.lookahead--,t.strm.avail_out===0)return r}else t.match_available=1,t.strstart++,t.lookahead--}return t.match_available&&(w=n._tr_tally(t,0,t.window[t.strstart-1]),t.match_available=0),t.insert=t.strstart<T-1?t.strstart:T-1,M===f?(k(t,!0),t.strm.avail_out===0?Q:U):t.last_lit&&(k(t,!1),t.strm.avail_out===0)?r:I}function lt(t,M,O,w,p){this.good_length=t,this.max_lazy=M,this.nice_length=O,this.max_chain=w,this.func=p}function ht(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=g,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new i.Buf16(2*B),this.dyn_dtree=new i.Buf16(2*(2*E+1)),this.bl_tree=new i.Buf16(2*(2*D+1)),et(this.dyn_ltree),et(this.dyn_dtree),et(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new i.Buf16(P+1),this.heap=new i.Buf16(2*C+1),et(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new i.Buf16(2*C+1),et(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function ut(t){var M;return t&&t.state?(t.total_in=t.total_out=0,t.data_type=d,(M=t.state).pending=0,M.pending_out=0,M.wrap<0&&(M.wrap=-M.wrap),M.status=M.wrap?y:F,t.adler=M.wrap===2?0:1,M.last_flush=c,n._tr_init(M),o):rt(t,m)}function wt(t){var M=ut(t);return M===o&&(function(O){O.window_size=2*O.w_size,et(O.head),O.max_lazy_match=s[O.level].max_lazy,O.good_match=s[O.level].good_length,O.nice_match=s[O.level].nice_length,O.max_chain_length=s[O.level].max_chain,O.strstart=0,O.block_start=0,O.lookahead=0,O.insert=0,O.match_length=O.prev_length=T-1,O.match_available=0,O.ins_h=0})(t.state),M}function ct(t,M,O,w,p,z){if(!t)return m;var j=1;if(M===a&&(M=6),w<0?(j=0,w=-w):15<w&&(j=2,w-=16),p<1||x<p||O!==g||w<8||15<w||M<0||9<M||z<0||h<z)return rt(t,m);w===8&&(w=9);var W=new ht;return(t.state=W).strm=t,W.wrap=j,W.gzhead=null,W.w_bits=w,W.w_size=1<<W.w_bits,W.w_mask=W.w_size-1,W.hash_bits=p+7,W.hash_size=1<<W.hash_bits,W.hash_mask=W.hash_size-1,W.hash_shift=~~((W.hash_bits+T-1)/T),W.window=new i.Buf8(2*W.w_size),W.head=new i.Buf16(W.hash_size),W.prev=new i.Buf16(W.w_size),W.lit_bufsize=1<<p+6,W.pending_buf_size=4*W.lit_bufsize,W.pending_buf=new i.Buf8(W.pending_buf_size),W.d_buf=1*W.lit_bufsize,W.l_buf=3*W.lit_bufsize,W.level=M,W.strategy=z,W.method=O,wt(t)}s=[new lt(0,0,0,0,function(t,M){var O=65535;for(O>t.pending_buf_size-5&&(O=t.pending_buf_size-5);;){if(t.lookahead<=1){if(ot(t),t.lookahead===0&&M===c)return r;if(t.lookahead===0)break}t.strstart+=t.lookahead,t.lookahead=0;var w=t.block_start+O;if((t.strstart===0||t.strstart>=w)&&(t.lookahead=t.strstart-w,t.strstart=w,k(t,!1),t.strm.avail_out===0)||t.strstart-t.block_start>=t.w_size-J&&(k(t,!1),t.strm.avail_out===0))return r}return t.insert=0,M===f?(k(t,!0),t.strm.avail_out===0?Q:U):(t.strstart>t.block_start&&(k(t,!1),t.strm.avail_out),r)}),new lt(4,4,8,4,pt),new lt(4,5,16,8,pt),new lt(4,6,32,32,pt),new lt(4,4,16,16,it),new lt(8,16,32,32,it),new lt(8,16,128,128,it),new lt(8,32,128,256,it),new lt(32,128,258,1024,it),new lt(32,258,258,4096,it)],u.deflateInit=function(t,M){return ct(t,M,g,15,8,0)},u.deflateInit2=ct,u.deflateReset=wt,u.deflateResetKeep=ut,u.deflateSetHeader=function(t,M){return t&&t.state?t.state.wrap!==2?m:(t.state.gzhead=M,o):m},u.deflate=function(t,M){var O,w,p,z;if(!t||!t.state||5<M||M<0)return t?rt(t,m):m;if(w=t.state,!t.output||!t.input&&t.avail_in!==0||w.status===666&&M!==f)return rt(t,t.avail_out===0?-5:m);if(w.strm=t,O=w.last_flush,w.last_flush=M,w.status===y)if(w.wrap===2)t.adler=0,R(w,31),R(w,139),R(w,8),w.gzhead?(R(w,(w.gzhead.text?1:0)+(w.gzhead.hcrc?2:0)+(w.gzhead.extra?4:0)+(w.gzhead.name?8:0)+(w.gzhead.comment?16:0)),R(w,255&w.gzhead.time),R(w,w.gzhead.time>>8&255),R(w,w.gzhead.time>>16&255),R(w,w.gzhead.time>>24&255),R(w,w.level===9?2:2<=w.strategy||w.level<2?4:0),R(w,255&w.gzhead.os),w.gzhead.extra&&w.gzhead.extra.length&&(R(w,255&w.gzhead.extra.length),R(w,w.gzhead.extra.length>>8&255)),w.gzhead.hcrc&&(t.adler=b(t.adler,w.pending_buf,w.pending,0)),w.gzindex=0,w.status=69):(R(w,0),R(w,0),R(w,0),R(w,0),R(w,0),R(w,w.level===9?2:2<=w.strategy||w.level<2?4:0),R(w,3),w.status=F);else{var j=g+(w.w_bits-8<<4)<<8;j|=(2<=w.strategy||w.level<2?0:w.level<6?1:w.level===6?2:3)<<6,w.strstart!==0&&(j|=32),j+=31-j%31,w.status=F,Y(w,j),w.strstart!==0&&(Y(w,t.adler>>>16),Y(w,65535&t.adler)),t.adler=1}if(w.status===69)if(w.gzhead.extra){for(p=w.pending;w.gzindex<(65535&w.gzhead.extra.length)&&(w.pending!==w.pending_buf_size||(w.gzhead.hcrc&&w.pending>p&&(t.adler=b(t.adler,w.pending_buf,w.pending-p,p)),A(t),p=w.pending,w.pending!==w.pending_buf_size));)R(w,255&w.gzhead.extra[w.gzindex]),w.gzindex++;w.gzhead.hcrc&&w.pending>p&&(t.adler=b(t.adler,w.pending_buf,w.pending-p,p)),w.gzindex===w.gzhead.extra.length&&(w.gzindex=0,w.status=73)}else w.status=73;if(w.status===73)if(w.gzhead.name){p=w.pending;do{if(w.pending===w.pending_buf_size&&(w.gzhead.hcrc&&w.pending>p&&(t.adler=b(t.adler,w.pending_buf,w.pending-p,p)),A(t),p=w.pending,w.pending===w.pending_buf_size)){z=1;break}z=w.gzindex<w.gzhead.name.length?255&w.gzhead.name.charCodeAt(w.gzindex++):0,R(w,z)}while(z!==0);w.gzhead.hcrc&&w.pending>p&&(t.adler=b(t.adler,w.pending_buf,w.pending-p,p)),z===0&&(w.gzindex=0,w.status=91)}else w.status=91;if(w.status===91)if(w.gzhead.comment){p=w.pending;do{if(w.pending===w.pending_buf_size&&(w.gzhead.hcrc&&w.pending>p&&(t.adler=b(t.adler,w.pending_buf,w.pending-p,p)),A(t),p=w.pending,w.pending===w.pending_buf_size)){z=1;break}z=w.gzindex<w.gzhead.comment.length?255&w.gzhead.comment.charCodeAt(w.gzindex++):0,R(w,z)}while(z!==0);w.gzhead.hcrc&&w.pending>p&&(t.adler=b(t.adler,w.pending_buf,w.pending-p,p)),z===0&&(w.status=103)}else w.status=103;if(w.status===103&&(w.gzhead.hcrc?(w.pending+2>w.pending_buf_size&&A(t),w.pending+2<=w.pending_buf_size&&(R(w,255&t.adler),R(w,t.adler>>8&255),t.adler=0,w.status=F)):w.status=F),w.pending!==0){if(A(t),t.avail_out===0)return w.last_flush=-1,o}else if(t.avail_in===0&&$(M)<=$(O)&&M!==f)return rt(t,-5);if(w.status===666&&t.avail_in!==0)return rt(t,-5);if(t.avail_in!==0||w.lookahead!==0||M!==c&&w.status!==666){var W=w.strategy===2?(function(N,H){for(var q;;){if(N.lookahead===0&&(ot(N),N.lookahead===0)){if(H===c)return r;break}if(N.match_length=0,q=n._tr_tally(N,0,N.window[N.strstart]),N.lookahead--,N.strstart++,q&&(k(N,!1),N.strm.avail_out===0))return r}return N.insert=0,H===f?(k(N,!0),N.strm.avail_out===0?Q:U):N.last_lit&&(k(N,!1),N.strm.avail_out===0)?r:I})(w,M):w.strategy===3?(function(N,H){for(var q,V,tt,dt,at=N.window;;){if(N.lookahead<=Z){if(ot(N),N.lookahead<=Z&&H===c)return r;if(N.lookahead===0)break}if(N.match_length=0,N.lookahead>=T&&0<N.strstart&&(V=at[tt=N.strstart-1])===at[++tt]&&V===at[++tt]&&V===at[++tt]){dt=N.strstart+Z;do;while(V===at[++tt]&&V===at[++tt]&&V===at[++tt]&&V===at[++tt]&&V===at[++tt]&&V===at[++tt]&&V===at[++tt]&&V===at[++tt]&&tt<dt);N.match_length=Z-(dt-tt),N.match_length>N.lookahead&&(N.match_length=N.lookahead)}if(N.match_length>=T?(q=n._tr_tally(N,1,N.match_length-T),N.lookahead-=N.match_length,N.strstart+=N.match_length,N.match_length=0):(q=n._tr_tally(N,0,N.window[N.strstart]),N.lookahead--,N.strstart++),q&&(k(N,!1),N.strm.avail_out===0))return r}return N.insert=0,H===f?(k(N,!0),N.strm.avail_out===0?Q:U):N.last_lit&&(k(N,!1),N.strm.avail_out===0)?r:I})(w,M):s[w.level].func(w,M);if(W!==Q&&W!==U||(w.status=666),W===r||W===Q)return t.avail_out===0&&(w.last_flush=-1),o;if(W===I&&(M===1?n._tr_align(w):M!==5&&(n._tr_stored_block(w,0,0,!1),M===3&&(et(w.head),w.lookahead===0&&(w.strstart=0,w.block_start=0,w.insert=0))),A(t),t.avail_out===0))return w.last_flush=-1,o}return M!==f?o:w.wrap<=0?1:(w.wrap===2?(R(w,255&t.adler),R(w,t.adler>>8&255),R(w,t.adler>>16&255),R(w,t.adler>>24&255),R(w,255&t.total_in),R(w,t.total_in>>8&255),R(w,t.total_in>>16&255),R(w,t.total_in>>24&255)):(Y(w,t.adler>>>16),Y(w,65535&t.adler)),A(t),0<w.wrap&&(w.wrap=-w.wrap),w.pending!==0?o:1)},u.deflateEnd=function(t){var M;return t&&t.state?(M=t.state.status)!==y&&M!==69&&M!==73&&M!==91&&M!==103&&M!==F&&M!==666?rt(t,m):(t.state=null,M===F?rt(t,-3):o):m},u.deflateSetDictionary=function(t,M){var O,w,p,z,j,W,N,H,q=M.length;if(!t||!t.state||(z=(O=t.state).wrap)===2||z===1&&O.status!==y||O.lookahead)return m;for(z===1&&(t.adler=l(t.adler,M,q,0)),O.wrap=0,q>=O.w_size&&(z===0&&(et(O.head),O.strstart=0,O.block_start=0,O.insert=0),H=new i.Buf8(O.w_size),i.arraySet(H,M,q-O.w_size,O.w_size,0),M=H,q=O.w_size),j=t.avail_in,W=t.next_in,N=t.input,t.avail_in=q,t.next_in=0,t.input=M,ot(O);O.lookahead>=T;){for(w=O.strstart,p=O.lookahead-(T-1);O.ins_h=(O.ins_h<<O.hash_shift^O.window[w+T-1])&O.hash_mask,O.prev[w&O.w_mask]=O.head[O.ins_h],O.head[O.ins_h]=w,w++,--p;);O.strstart=w,O.lookahead=T-1,ot(O)}return O.strstart+=O.lookahead,O.block_start=O.strstart,O.insert=O.lookahead,O.lookahead=0,O.match_length=O.prev_length=T-1,O.match_available=0,t.next_in=W,t.input=N,t.avail_in=j,O.wrap=z,o},u.deflateInfo="pako deflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./messages":51,"./trees":52}],47:[function(e,v,u){"use strict";v.exports=function(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}},{}],48:[function(e,v,u){"use strict";v.exports=function(s,i){var n,l,b,_,c,f,o,m,a,h,d,g,x,C,E,D,B,P,T,Z,J,y,F,r,I;n=s.state,l=s.next_in,r=s.input,b=l+(s.avail_in-5),_=s.next_out,I=s.output,c=_-(i-s.avail_out),f=_+(s.avail_out-257),o=n.dmax,m=n.wsize,a=n.whave,h=n.wnext,d=n.window,g=n.hold,x=n.bits,C=n.lencode,E=n.distcode,D=(1<<n.lenbits)-1,B=(1<<n.distbits)-1;t:do{x<15&&(g+=r[l++]<<x,x+=8,g+=r[l++]<<x,x+=8),P=C[g&D];e:for(;;){if(g>>>=T=P>>>24,x-=T,(T=P>>>16&255)===0)I[_++]=65535&P;else{if(!(16&T)){if((64&T)==0){P=C[(65535&P)+(g&(1<<T)-1)];continue e}if(32&T){n.mode=12;break t}s.msg="invalid literal/length code",n.mode=30;break t}Z=65535&P,(T&=15)&&(x<T&&(g+=r[l++]<<x,x+=8),Z+=g&(1<<T)-1,g>>>=T,x-=T),x<15&&(g+=r[l++]<<x,x+=8,g+=r[l++]<<x,x+=8),P=E[g&B];r:for(;;){if(g>>>=T=P>>>24,x-=T,!(16&(T=P>>>16&255))){if((64&T)==0){P=E[(65535&P)+(g&(1<<T)-1)];continue r}s.msg="invalid distance code",n.mode=30;break t}if(J=65535&P,x<(T&=15)&&(g+=r[l++]<<x,(x+=8)<T&&(g+=r[l++]<<x,x+=8)),o<(J+=g&(1<<T)-1)){s.msg="invalid distance too far back",n.mode=30;break t}if(g>>>=T,x-=T,(T=_-c)<J){if(a<(T=J-T)&&n.sane){s.msg="invalid distance too far back",n.mode=30;break t}if(F=d,(y=0)===h){if(y+=m-T,T<Z){for(Z-=T;I[_++]=d[y++],--T;);y=_-J,F=I}}else if(h<T){if(y+=m+h-T,(T-=h)<Z){for(Z-=T;I[_++]=d[y++],--T;);if(y=0,h<Z){for(Z-=T=h;I[_++]=d[y++],--T;);y=_-J,F=I}}}else if(y+=h-T,T<Z){for(Z-=T;I[_++]=d[y++],--T;);y=_-J,F=I}for(;2<Z;)I[_++]=F[y++],I[_++]=F[y++],I[_++]=F[y++],Z-=3;Z&&(I[_++]=F[y++],1<Z&&(I[_++]=F[y++]))}else{for(y=_-J;I[_++]=I[y++],I[_++]=I[y++],I[_++]=I[y++],2<(Z-=3););Z&&(I[_++]=I[y++],1<Z&&(I[_++]=I[y++]))}break}}break}}while(l<b&&_<f);l-=Z=x>>3,g&=(1<<(x-=Z<<3))-1,s.next_in=l,s.next_out=_,s.avail_in=l<b?b-l+5:5-(l-b),s.avail_out=_<f?f-_+257:257-(_-f),n.hold=g,n.bits=x}},{}],49:[function(e,v,u){"use strict";var s=e("../utils/common"),i=e("./adler32"),n=e("./crc32"),l=e("./inffast"),b=e("./inftrees"),_=1,c=2,f=0,o=-2,m=1,a=852,h=592;function d(y){return(y>>>24&255)+(y>>>8&65280)+((65280&y)<<8)+((255&y)<<24)}function g(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new s.Buf16(320),this.work=new s.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function x(y){var F;return y&&y.state?(F=y.state,y.total_in=y.total_out=F.total=0,y.msg="",F.wrap&&(y.adler=1&F.wrap),F.mode=m,F.last=0,F.havedict=0,F.dmax=32768,F.head=null,F.hold=0,F.bits=0,F.lencode=F.lendyn=new s.Buf32(a),F.distcode=F.distdyn=new s.Buf32(h),F.sane=1,F.back=-1,f):o}function C(y){var F;return y&&y.state?((F=y.state).wsize=0,F.whave=0,F.wnext=0,x(y)):o}function E(y,F){var r,I;return y&&y.state?(I=y.state,F<0?(r=0,F=-F):(r=1+(F>>4),F<48&&(F&=15)),F&&(F<8||15<F)?o:(I.window!==null&&I.wbits!==F&&(I.window=null),I.wrap=r,I.wbits=F,C(y))):o}function D(y,F){var r,I;return y?(I=new g,(y.state=I).window=null,(r=E(y,F))!==f&&(y.state=null),r):o}var B,P,T=!0;function Z(y){if(T){var F;for(B=new s.Buf32(512),P=new s.Buf32(32),F=0;F<144;)y.lens[F++]=8;for(;F<256;)y.lens[F++]=9;for(;F<280;)y.lens[F++]=7;for(;F<288;)y.lens[F++]=8;for(b(_,y.lens,0,288,B,0,y.work,{bits:9}),F=0;F<32;)y.lens[F++]=5;b(c,y.lens,0,32,P,0,y.work,{bits:5}),T=!1}y.lencode=B,y.lenbits=9,y.distcode=P,y.distbits=5}function J(y,F,r,I){var Q,U=y.state;return U.window===null&&(U.wsize=1<<U.wbits,U.wnext=0,U.whave=0,U.window=new s.Buf8(U.wsize)),I>=U.wsize?(s.arraySet(U.window,F,r-U.wsize,U.wsize,0),U.wnext=0,U.whave=U.wsize):(I<(Q=U.wsize-U.wnext)&&(Q=I),s.arraySet(U.window,F,r-I,Q,U.wnext),(I-=Q)?(s.arraySet(U.window,F,r-I,I,0),U.wnext=I,U.whave=U.wsize):(U.wnext+=Q,U.wnext===U.wsize&&(U.wnext=0),U.whave<U.wsize&&(U.whave+=Q))),0}u.inflateReset=C,u.inflateReset2=E,u.inflateResetKeep=x,u.inflateInit=function(y){return D(y,15)},u.inflateInit2=D,u.inflate=function(y,F){var r,I,Q,U,rt,$,et,A,k,R,Y,G,ot,pt,it,lt,ht,ut,wt,ct,t,M,O,w,p=0,z=new s.Buf8(4),j=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!y||!y.state||!y.output||!y.input&&y.avail_in!==0)return o;(r=y.state).mode===12&&(r.mode=13),rt=y.next_out,Q=y.output,et=y.avail_out,U=y.next_in,I=y.input,$=y.avail_in,A=r.hold,k=r.bits,R=$,Y=et,M=f;t:for(;;)switch(r.mode){case m:if(r.wrap===0){r.mode=13;break}for(;k<16;){if($===0)break t;$--,A+=I[U++]<<k,k+=8}if(2&r.wrap&&A===35615){z[r.check=0]=255&A,z[1]=A>>>8&255,r.check=n(r.check,z,2,0),k=A=0,r.mode=2;break}if(r.flags=0,r.head&&(r.head.done=!1),!(1&r.wrap)||(((255&A)<<8)+(A>>8))%31){y.msg="incorrect header check",r.mode=30;break}if((15&A)!=8){y.msg="unknown compression method",r.mode=30;break}if(k-=4,t=8+(15&(A>>>=4)),r.wbits===0)r.wbits=t;else if(t>r.wbits){y.msg="invalid window size",r.mode=30;break}r.dmax=1<<t,y.adler=r.check=1,r.mode=512&A?10:12,k=A=0;break;case 2:for(;k<16;){if($===0)break t;$--,A+=I[U++]<<k,k+=8}if(r.flags=A,(255&r.flags)!=8){y.msg="unknown compression method",r.mode=30;break}if(57344&r.flags){y.msg="unknown header flags set",r.mode=30;break}r.head&&(r.head.text=A>>8&1),512&r.flags&&(z[0]=255&A,z[1]=A>>>8&255,r.check=n(r.check,z,2,0)),k=A=0,r.mode=3;case 3:for(;k<32;){if($===0)break t;$--,A+=I[U++]<<k,k+=8}r.head&&(r.head.time=A),512&r.flags&&(z[0]=255&A,z[1]=A>>>8&255,z[2]=A>>>16&255,z[3]=A>>>24&255,r.check=n(r.check,z,4,0)),k=A=0,r.mode=4;case 4:for(;k<16;){if($===0)break t;$--,A+=I[U++]<<k,k+=8}r.head&&(r.head.xflags=255&A,r.head.os=A>>8),512&r.flags&&(z[0]=255&A,z[1]=A>>>8&255,r.check=n(r.check,z,2,0)),k=A=0,r.mode=5;case 5:if(1024&r.flags){for(;k<16;){if($===0)break t;$--,A+=I[U++]<<k,k+=8}r.length=A,r.head&&(r.head.extra_len=A),512&r.flags&&(z[0]=255&A,z[1]=A>>>8&255,r.check=n(r.check,z,2,0)),k=A=0}else r.head&&(r.head.extra=null);r.mode=6;case 6:if(1024&r.flags&&($<(G=r.length)&&(G=$),G&&(r.head&&(t=r.head.extra_len-r.length,r.head.extra||(r.head.extra=new Array(r.head.extra_len)),s.arraySet(r.head.extra,I,U,G,t)),512&r.flags&&(r.check=n(r.check,I,G,U)),$-=G,U+=G,r.length-=G),r.length))break t;r.length=0,r.mode=7;case 7:if(2048&r.flags){if($===0)break t;for(G=0;t=I[U+G++],r.head&&t&&r.length<65536&&(r.head.name+=String.fromCharCode(t)),t&&G<$;);if(512&r.flags&&(r.check=n(r.check,I,G,U)),$-=G,U+=G,t)break t}else r.head&&(r.head.name=null);r.length=0,r.mode=8;case 8:if(4096&r.flags){if($===0)break t;for(G=0;t=I[U+G++],r.head&&t&&r.length<65536&&(r.head.comment+=String.fromCharCode(t)),t&&G<$;);if(512&r.flags&&(r.check=n(r.check,I,G,U)),$-=G,U+=G,t)break t}else r.head&&(r.head.comment=null);r.mode=9;case 9:if(512&r.flags){for(;k<16;){if($===0)break t;$--,A+=I[U++]<<k,k+=8}if(A!==(65535&r.check)){y.msg="header crc mismatch",r.mode=30;break}k=A=0}r.head&&(r.head.hcrc=r.flags>>9&1,r.head.done=!0),y.adler=r.check=0,r.mode=12;break;case 10:for(;k<32;){if($===0)break t;$--,A+=I[U++]<<k,k+=8}y.adler=r.check=d(A),k=A=0,r.mode=11;case 11:if(r.havedict===0)return y.next_out=rt,y.avail_out=et,y.next_in=U,y.avail_in=$,r.hold=A,r.bits=k,2;y.adler=r.check=1,r.mode=12;case 12:if(F===5||F===6)break t;case 13:if(r.last){A>>>=7&k,k-=7&k,r.mode=27;break}for(;k<3;){if($===0)break t;$--,A+=I[U++]<<k,k+=8}switch(r.last=1&A,k-=1,3&(A>>>=1)){case 0:r.mode=14;break;case 1:if(Z(r),r.mode=20,F!==6)break;A>>>=2,k-=2;break t;case 2:r.mode=17;break;case 3:y.msg="invalid block type",r.mode=30}A>>>=2,k-=2;break;case 14:for(A>>>=7&k,k-=7&k;k<32;){if($===0)break t;$--,A+=I[U++]<<k,k+=8}if((65535&A)!=(A>>>16^65535)){y.msg="invalid stored block lengths",r.mode=30;break}if(r.length=65535&A,k=A=0,r.mode=15,F===6)break t;case 15:r.mode=16;case 16:if(G=r.length){if($<G&&(G=$),et<G&&(G=et),G===0)break t;s.arraySet(Q,I,U,G,rt),$-=G,U+=G,et-=G,rt+=G,r.length-=G;break}r.mode=12;break;case 17:for(;k<14;){if($===0)break t;$--,A+=I[U++]<<k,k+=8}if(r.nlen=257+(31&A),A>>>=5,k-=5,r.ndist=1+(31&A),A>>>=5,k-=5,r.ncode=4+(15&A),A>>>=4,k-=4,286<r.nlen||30<r.ndist){y.msg="too many length or distance symbols",r.mode=30;break}r.have=0,r.mode=18;case 18:for(;r.have<r.ncode;){for(;k<3;){if($===0)break t;$--,A+=I[U++]<<k,k+=8}r.lens[j[r.have++]]=7&A,A>>>=3,k-=3}for(;r.have<19;)r.lens[j[r.have++]]=0;if(r.lencode=r.lendyn,r.lenbits=7,O={bits:r.lenbits},M=b(0,r.lens,0,19,r.lencode,0,r.work,O),r.lenbits=O.bits,M){y.msg="invalid code lengths set",r.mode=30;break}r.have=0,r.mode=19;case 19:for(;r.have<r.nlen+r.ndist;){for(;lt=(p=r.lencode[A&(1<<r.lenbits)-1])>>>16&255,ht=65535&p,!((it=p>>>24)<=k);){if($===0)break t;$--,A+=I[U++]<<k,k+=8}if(ht<16)A>>>=it,k-=it,r.lens[r.have++]=ht;else{if(ht===16){for(w=it+2;k<w;){if($===0)break t;$--,A+=I[U++]<<k,k+=8}if(A>>>=it,k-=it,r.have===0){y.msg="invalid bit length repeat",r.mode=30;break}t=r.lens[r.have-1],G=3+(3&A),A>>>=2,k-=2}else if(ht===17){for(w=it+3;k<w;){if($===0)break t;$--,A+=I[U++]<<k,k+=8}k-=it,t=0,G=3+(7&(A>>>=it)),A>>>=3,k-=3}else{for(w=it+7;k<w;){if($===0)break t;$--,A+=I[U++]<<k,k+=8}k-=it,t=0,G=11+(127&(A>>>=it)),A>>>=7,k-=7}if(r.have+G>r.nlen+r.ndist){y.msg="invalid bit length repeat",r.mode=30;break}for(;G--;)r.lens[r.have++]=t}}if(r.mode===30)break;if(r.lens[256]===0){y.msg="invalid code -- missing end-of-block",r.mode=30;break}if(r.lenbits=9,O={bits:r.lenbits},M=b(_,r.lens,0,r.nlen,r.lencode,0,r.work,O),r.lenbits=O.bits,M){y.msg="invalid literal/lengths set",r.mode=30;break}if(r.distbits=6,r.distcode=r.distdyn,O={bits:r.distbits},M=b(c,r.lens,r.nlen,r.ndist,r.distcode,0,r.work,O),r.distbits=O.bits,M){y.msg="invalid distances set",r.mode=30;break}if(r.mode=20,F===6)break t;case 20:r.mode=21;case 21:if(6<=$&&258<=et){y.next_out=rt,y.avail_out=et,y.next_in=U,y.avail_in=$,r.hold=A,r.bits=k,l(y,Y),rt=y.next_out,Q=y.output,et=y.avail_out,U=y.next_in,I=y.input,$=y.avail_in,A=r.hold,k=r.bits,r.mode===12&&(r.back=-1);break}for(r.back=0;lt=(p=r.lencode[A&(1<<r.lenbits)-1])>>>16&255,ht=65535&p,!((it=p>>>24)<=k);){if($===0)break t;$--,A+=I[U++]<<k,k+=8}if(lt&&(240&lt)==0){for(ut=it,wt=lt,ct=ht;lt=(p=r.lencode[ct+((A&(1<<ut+wt)-1)>>ut)])>>>16&255,ht=65535&p,!(ut+(it=p>>>24)<=k);){if($===0)break t;$--,A+=I[U++]<<k,k+=8}A>>>=ut,k-=ut,r.back+=ut}if(A>>>=it,k-=it,r.back+=it,r.length=ht,lt===0){r.mode=26;break}if(32&lt){r.back=-1,r.mode=12;break}if(64&lt){y.msg="invalid literal/length code",r.mode=30;break}r.extra=15&lt,r.mode=22;case 22:if(r.extra){for(w=r.extra;k<w;){if($===0)break t;$--,A+=I[U++]<<k,k+=8}r.length+=A&(1<<r.extra)-1,A>>>=r.extra,k-=r.extra,r.back+=r.extra}r.was=r.length,r.mode=23;case 23:for(;lt=(p=r.distcode[A&(1<<r.distbits)-1])>>>16&255,ht=65535&p,!((it=p>>>24)<=k);){if($===0)break t;$--,A+=I[U++]<<k,k+=8}if((240&lt)==0){for(ut=it,wt=lt,ct=ht;lt=(p=r.distcode[ct+((A&(1<<ut+wt)-1)>>ut)])>>>16&255,ht=65535&p,!(ut+(it=p>>>24)<=k);){if($===0)break t;$--,A+=I[U++]<<k,k+=8}A>>>=ut,k-=ut,r.back+=ut}if(A>>>=it,k-=it,r.back+=it,64&lt){y.msg="invalid distance code",r.mode=30;break}r.offset=ht,r.extra=15&lt,r.mode=24;case 24:if(r.extra){for(w=r.extra;k<w;){if($===0)break t;$--,A+=I[U++]<<k,k+=8}r.offset+=A&(1<<r.extra)-1,A>>>=r.extra,k-=r.extra,r.back+=r.extra}if(r.offset>r.dmax){y.msg="invalid distance too far back",r.mode=30;break}r.mode=25;case 25:if(et===0)break t;if(G=Y-et,r.offset>G){if((G=r.offset-G)>r.whave&&r.sane){y.msg="invalid distance too far back",r.mode=30;break}ot=G>r.wnext?(G-=r.wnext,r.wsize-G):r.wnext-G,G>r.length&&(G=r.length),pt=r.window}else pt=Q,ot=rt-r.offset,G=r.length;for(et<G&&(G=et),et-=G,r.length-=G;Q[rt++]=pt[ot++],--G;);r.length===0&&(r.mode=21);break;case 26:if(et===0)break t;Q[rt++]=r.length,et--,r.mode=21;break;case 27:if(r.wrap){for(;k<32;){if($===0)break t;$--,A|=I[U++]<<k,k+=8}if(Y-=et,y.total_out+=Y,r.total+=Y,Y&&(y.adler=r.check=r.flags?n(r.check,Q,Y,rt-Y):i(r.check,Q,Y,rt-Y)),Y=et,(r.flags?A:d(A))!==r.check){y.msg="incorrect data check",r.mode=30;break}k=A=0}r.mode=28;case 28:if(r.wrap&&r.flags){for(;k<32;){if($===0)break t;$--,A+=I[U++]<<k,k+=8}if(A!==(4294967295&r.total)){y.msg="incorrect length check",r.mode=30;break}k=A=0}r.mode=29;case 29:M=1;break t;case 30:M=-3;break t;case 31:return-4;case 32:default:return o}return y.next_out=rt,y.avail_out=et,y.next_in=U,y.avail_in=$,r.hold=A,r.bits=k,(r.wsize||Y!==y.avail_out&&r.mode<30&&(r.mode<27||F!==4))&&J(y,y.output,y.next_out,Y-y.avail_out)?(r.mode=31,-4):(R-=y.avail_in,Y-=y.avail_out,y.total_in+=R,y.total_out+=Y,r.total+=Y,r.wrap&&Y&&(y.adler=r.check=r.flags?n(r.check,Q,Y,y.next_out-Y):i(r.check,Q,Y,y.next_out-Y)),y.data_type=r.bits+(r.last?64:0)+(r.mode===12?128:0)+(r.mode===20||r.mode===15?256:0),(R==0&&Y===0||F===4)&&M===f&&(M=-5),M)},u.inflateEnd=function(y){if(!y||!y.state)return o;var F=y.state;return F.window&&(F.window=null),y.state=null,f},u.inflateGetHeader=function(y,F){var r;return y&&y.state?(2&(r=y.state).wrap)==0?o:((r.head=F).done=!1,f):o},u.inflateSetDictionary=function(y,F){var r,I=F.length;return y&&y.state?(r=y.state).wrap!==0&&r.mode!==11?o:r.mode===11&&i(1,F,I,0)!==r.check?-3:J(y,F,I,I)?(r.mode=31,-4):(r.havedict=1,f):o},u.inflateInfo="pako inflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./inffast":48,"./inftrees":50}],50:[function(e,v,u){"use strict";var s=e("../utils/common"),i=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],n=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],l=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],b=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];v.exports=function(_,c,f,o,m,a,h,d){var g,x,C,E,D,B,P,T,Z,J=d.bits,y=0,F=0,r=0,I=0,Q=0,U=0,rt=0,$=0,et=0,A=0,k=null,R=0,Y=new s.Buf16(16),G=new s.Buf16(16),ot=null,pt=0;for(y=0;y<=15;y++)Y[y]=0;for(F=0;F<o;F++)Y[c[f+F]]++;for(Q=J,I=15;1<=I&&Y[I]===0;I--);if(I<Q&&(Q=I),I===0)return m[a++]=20971520,m[a++]=20971520,d.bits=1,0;for(r=1;r<I&&Y[r]===0;r++);for(Q<r&&(Q=r),y=$=1;y<=15;y++)if($<<=1,($-=Y[y])<0)return-1;if(0<$&&(_===0||I!==1))return-1;for(G[1]=0,y=1;y<15;y++)G[y+1]=G[y]+Y[y];for(F=0;F<o;F++)c[f+F]!==0&&(h[G[c[f+F]]++]=F);if(B=_===0?(k=ot=h,19):_===1?(k=i,R-=257,ot=n,pt-=257,256):(k=l,ot=b,-1),y=r,D=a,rt=F=A=0,C=-1,E=(et=1<<(U=Q))-1,_===1&&852<et||_===2&&592<et)return 1;for(;;){for(P=y-rt,Z=h[F]<B?(T=0,h[F]):h[F]>B?(T=ot[pt+h[F]],k[R+h[F]]):(T=96,0),g=1<<y-rt,r=x=1<<U;m[D+(A>>rt)+(x-=g)]=P<<24|T<<16|Z|0,x!==0;);for(g=1<<y-1;A&g;)g>>=1;if(g!==0?(A&=g-1,A+=g):A=0,F++,--Y[y]==0){if(y===I)break;y=c[f+h[F]]}if(Q<y&&(A&E)!==C){for(rt===0&&(rt=Q),D+=r,$=1<<(U=y-rt);U+rt<I&&!(($-=Y[U+rt])<=0);)U++,$<<=1;if(et+=1<<U,_===1&&852<et||_===2&&592<et)return 1;m[C=A&E]=Q<<24|U<<16|D-a|0}}return A!==0&&(m[D+A]=y-rt<<24|64<<16|0),d.bits=Q,0}},{"../utils/common":41}],51:[function(e,v,u){"use strict";v.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},{}],52:[function(e,v,u){"use strict";var s=e("../utils/common"),i=0,n=1;function l(p){for(var z=p.length;0<=--z;)p[z]=0}var b=0,_=29,c=256,f=c+1+_,o=30,m=19,a=2*f+1,h=15,d=16,g=7,x=256,C=16,E=17,D=18,B=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],P=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],T=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],Z=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],J=new Array(2*(f+2));l(J);var y=new Array(2*o);l(y);var F=new Array(512);l(F);var r=new Array(256);l(r);var I=new Array(_);l(I);var Q,U,rt,$=new Array(o);function et(p,z,j,W,N){this.static_tree=p,this.extra_bits=z,this.extra_base=j,this.elems=W,this.max_length=N,this.has_stree=p&&p.length}function A(p,z){this.dyn_tree=p,this.max_code=0,this.stat_desc=z}function k(p){return p<256?F[p]:F[256+(p>>>7)]}function R(p,z){p.pending_buf[p.pending++]=255&z,p.pending_buf[p.pending++]=z>>>8&255}function Y(p,z,j){p.bi_valid>d-j?(p.bi_buf|=z<<p.bi_valid&65535,R(p,p.bi_buf),p.bi_buf=z>>d-p.bi_valid,p.bi_valid+=j-d):(p.bi_buf|=z<<p.bi_valid&65535,p.bi_valid+=j)}function G(p,z,j){Y(p,j[2*z],j[2*z+1])}function ot(p,z){for(var j=0;j|=1&p,p>>>=1,j<<=1,0<--z;);return j>>>1}function pt(p,z,j){var W,N,H=new Array(h+1),q=0;for(W=1;W<=h;W++)H[W]=q=q+j[W-1]<<1;for(N=0;N<=z;N++){var V=p[2*N+1];V!==0&&(p[2*N]=ot(H[V]++,V))}}function it(p){var z;for(z=0;z<f;z++)p.dyn_ltree[2*z]=0;for(z=0;z<o;z++)p.dyn_dtree[2*z]=0;for(z=0;z<m;z++)p.bl_tree[2*z]=0;p.dyn_ltree[2*x]=1,p.opt_len=p.static_len=0,p.last_lit=p.matches=0}function lt(p){8<p.bi_valid?R(p,p.bi_buf):0<p.bi_valid&&(p.pending_buf[p.pending++]=p.bi_buf),p.bi_buf=0,p.bi_valid=0}function ht(p,z,j,W){var N=2*z,H=2*j;return p[N]<p[H]||p[N]===p[H]&&W[z]<=W[j]}function ut(p,z,j){for(var W=p.heap[j],N=j<<1;N<=p.heap_len&&(N<p.heap_len&&ht(z,p.heap[N+1],p.heap[N],p.depth)&&N++,!ht(z,W,p.heap[N],p.depth));)p.heap[j]=p.heap[N],j=N,N<<=1;p.heap[j]=W}function wt(p,z,j){var W,N,H,q,V=0;if(p.last_lit!==0)for(;W=p.pending_buf[p.d_buf+2*V]<<8|p.pending_buf[p.d_buf+2*V+1],N=p.pending_buf[p.l_buf+V],V++,W===0?G(p,N,z):(G(p,(H=r[N])+c+1,z),(q=B[H])!==0&&Y(p,N-=I[H],q),G(p,H=k(--W),j),(q=P[H])!==0&&Y(p,W-=$[H],q)),V<p.last_lit;);G(p,x,z)}function ct(p,z){var j,W,N,H=z.dyn_tree,q=z.stat_desc.static_tree,V=z.stat_desc.has_stree,tt=z.stat_desc.elems,dt=-1;for(p.heap_len=0,p.heap_max=a,j=0;j<tt;j++)H[2*j]!==0?(p.heap[++p.heap_len]=dt=j,p.depth[j]=0):H[2*j+1]=0;for(;p.heap_len<2;)H[2*(N=p.heap[++p.heap_len]=dt<2?++dt:0)]=1,p.depth[N]=0,p.opt_len--,V&&(p.static_len-=q[2*N+1]);for(z.max_code=dt,j=p.heap_len>>1;1<=j;j--)ut(p,H,j);for(N=tt;j=p.heap[1],p.heap[1]=p.heap[p.heap_len--],ut(p,H,1),W=p.heap[1],p.heap[--p.heap_max]=j,p.heap[--p.heap_max]=W,H[2*N]=H[2*j]+H[2*W],p.depth[N]=(p.depth[j]>=p.depth[W]?p.depth[j]:p.depth[W])+1,H[2*j+1]=H[2*W+1]=N,p.heap[1]=N++,ut(p,H,1),2<=p.heap_len;);p.heap[--p.heap_max]=p.heap[1],(function(at,mt){var St,L,X,K,gt,_t,bt=mt.dyn_tree,Yt=mt.max_code,pe=mt.stat_desc.static_tree,ce=mt.stat_desc.has_stree,fe=mt.stat_desc.extra_bits,Xt=mt.stat_desc.extra_base,At=mt.stat_desc.max_length,Dt=0;for(K=0;K<=h;K++)at.bl_count[K]=0;for(bt[2*at.heap[at.heap_max]+1]=0,St=at.heap_max+1;St<a;St++)At<(K=bt[2*bt[2*(L=at.heap[St])+1]+1]+1)&&(K=At,Dt++),bt[2*L+1]=K,Yt<L||(at.bl_count[K]++,gt=0,Xt<=L&&(gt=fe[L-Xt]),_t=bt[2*L],at.opt_len+=_t*(K+gt),ce&&(at.static_len+=_t*(pe[2*L+1]+gt)));if(Dt!==0){do{for(K=At-1;at.bl_count[K]===0;)K--;at.bl_count[K]--,at.bl_count[K+1]+=2,at.bl_count[At]--,Dt-=2}while(0<Dt);for(K=At;K!==0;K--)for(L=at.bl_count[K];L!==0;)Yt<(X=at.heap[--St])||(bt[2*X+1]!==K&&(at.opt_len+=(K-bt[2*X+1])*bt[2*X],bt[2*X+1]=K),L--)}})(p,z),pt(H,dt,p.bl_count)}function t(p,z,j){var W,N,H=-1,q=z[1],V=0,tt=7,dt=4;for(q===0&&(tt=138,dt=3),z[2*(j+1)+1]=65535,W=0;W<=j;W++)N=q,q=z[2*(W+1)+1],++V<tt&&N===q||(V<dt?p.bl_tree[2*N]+=V:N!==0?(N!==H&&p.bl_tree[2*N]++,p.bl_tree[2*C]++):V<=10?p.bl_tree[2*E]++:p.bl_tree[2*D]++,H=N,dt=(V=0)===q?(tt=138,3):N===q?(tt=6,3):(tt=7,4))}function M(p,z,j){var W,N,H=-1,q=z[1],V=0,tt=7,dt=4;for(q===0&&(tt=138,dt=3),W=0;W<=j;W++)if(N=q,q=z[2*(W+1)+1],!(++V<tt&&N===q)){if(V<dt)for(;G(p,N,p.bl_tree),--V!=0;);else N!==0?(N!==H&&(G(p,N,p.bl_tree),V--),G(p,C,p.bl_tree),Y(p,V-3,2)):V<=10?(G(p,E,p.bl_tree),Y(p,V-3,3)):(G(p,D,p.bl_tree),Y(p,V-11,7));H=N,dt=(V=0)===q?(tt=138,3):N===q?(tt=6,3):(tt=7,4)}}l($);var O=!1;function w(p,z,j,W){Y(p,(b<<1)+(W?1:0),3),(function(N,H,q,V){lt(N),V&&(R(N,q),R(N,~q)),s.arraySet(N.pending_buf,N.window,H,q,N.pending),N.pending+=q})(p,z,j,!0)}u._tr_init=function(p){O||((function(){var z,j,W,N,H,q=new Array(h+1);for(N=W=0;N<_-1;N++)for(I[N]=W,z=0;z<1<<B[N];z++)r[W++]=N;for(r[W-1]=N,N=H=0;N<16;N++)for($[N]=H,z=0;z<1<<P[N];z++)F[H++]=N;for(H>>=7;N<o;N++)for($[N]=H<<7,z=0;z<1<<P[N]-7;z++)F[256+H++]=N;for(j=0;j<=h;j++)q[j]=0;for(z=0;z<=143;)J[2*z+1]=8,z++,q[8]++;for(;z<=255;)J[2*z+1]=9,z++,q[9]++;for(;z<=279;)J[2*z+1]=7,z++,q[7]++;for(;z<=287;)J[2*z+1]=8,z++,q[8]++;for(pt(J,f+1,q),z=0;z<o;z++)y[2*z+1]=5,y[2*z]=ot(z,5);Q=new et(J,B,c+1,f,h),U=new et(y,P,0,o,h),rt=new et(new Array(0),T,0,m,g)})(),O=!0),p.l_desc=new A(p.dyn_ltree,Q),p.d_desc=new A(p.dyn_dtree,U),p.bl_desc=new A(p.bl_tree,rt),p.bi_buf=0,p.bi_valid=0,it(p)},u._tr_stored_block=w,u._tr_flush_block=function(p,z,j,W){var N,H,q=0;0<p.level?(p.strm.data_type===2&&(p.strm.data_type=(function(V){var tt,dt=4093624447;for(tt=0;tt<=31;tt++,dt>>>=1)if(1&dt&&V.dyn_ltree[2*tt]!==0)return i;if(V.dyn_ltree[18]!==0||V.dyn_ltree[20]!==0||V.dyn_ltree[26]!==0)return n;for(tt=32;tt<c;tt++)if(V.dyn_ltree[2*tt]!==0)return n;return i})(p)),ct(p,p.l_desc),ct(p,p.d_desc),q=(function(V){var tt;for(t(V,V.dyn_ltree,V.l_desc.max_code),t(V,V.dyn_dtree,V.d_desc.max_code),ct(V,V.bl_desc),tt=m-1;3<=tt&&V.bl_tree[2*Z[tt]+1]===0;tt--);return V.opt_len+=3*(tt+1)+5+5+4,tt})(p),N=p.opt_len+3+7>>>3,(H=p.static_len+3+7>>>3)<=N&&(N=H)):N=H=j+5,j+4<=N&&z!==-1?w(p,z,j,W):p.strategy===4||H===N?(Y(p,2+(W?1:0),3),wt(p,J,y)):(Y(p,4+(W?1:0),3),(function(V,tt,dt,at){var mt;for(Y(V,tt-257,5),Y(V,dt-1,5),Y(V,at-4,4),mt=0;mt<at;mt++)Y(V,V.bl_tree[2*Z[mt]+1],3);M(V,V.dyn_ltree,tt-1),M(V,V.dyn_dtree,dt-1)})(p,p.l_desc.max_code+1,p.d_desc.max_code+1,q+1),wt(p,p.dyn_ltree,p.dyn_dtree)),it(p),W&&lt(p)},u._tr_tally=function(p,z,j){return p.pending_buf[p.d_buf+2*p.last_lit]=z>>>8&255,p.pending_buf[p.d_buf+2*p.last_lit+1]=255&z,p.pending_buf[p.l_buf+p.last_lit]=255&j,p.last_lit++,z===0?p.dyn_ltree[2*j]++:(p.matches++,z--,p.dyn_ltree[2*(r[j]+c+1)]++,p.dyn_dtree[2*k(z)]++),p.last_lit===p.lit_bufsize-1},u._tr_align=function(p){Y(p,2,3),G(p,x,J),(function(z){z.bi_valid===16?(R(z,z.bi_buf),z.bi_buf=0,z.bi_valid=0):8<=z.bi_valid&&(z.pending_buf[z.pending++]=255&z.bi_buf,z.bi_buf>>=8,z.bi_valid-=8)})(p)}},{"../utils/common":41}],53:[function(e,v,u){"use strict";v.exports=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}},{}],54:[function(e,v,u){(function(s){(function(i,n){"use strict";if(!i.setImmediate){var l,b,_,c,f=1,o={},m=!1,a=i.document,h=Object.getPrototypeOf&&Object.getPrototypeOf(i);h=h&&h.setTimeout?h:i,l={}.toString.call(i.process)==="[object process]"?function(C){process.nextTick(function(){g(C)})}:(function(){if(i.postMessage&&!i.importScripts){var C=!0,E=i.onmessage;return i.onmessage=function(){C=!1},i.postMessage("","*"),i.onmessage=E,C}})()?(c="setImmediate$"+Math.random()+"$",i.addEventListener?i.addEventListener("message",x,!1):i.attachEvent("onmessage",x),function(C){i.postMessage(c+C,"*")}):i.MessageChannel?((_=new MessageChannel).port1.onmessage=function(C){g(C.data)},function(C){_.port2.postMessage(C)}):a&&"onreadystatechange"in a.createElement("script")?(b=a.documentElement,function(C){var E=a.createElement("script");E.onreadystatechange=function(){g(C),E.onreadystatechange=null,b.removeChild(E),E=null},b.appendChild(E)}):function(C){setTimeout(g,0,C)},h.setImmediate=function(C){typeof C!="function"&&(C=new Function(""+C));for(var E=new Array(arguments.length-1),D=0;D<E.length;D++)E[D]=arguments[D+1];var B={callback:C,args:E};return o[f]=B,l(f),f++},h.clearImmediate=d}function d(C){delete o[C]}function g(C){if(m)setTimeout(g,0,C);else{var E=o[C];if(E){m=!0;try{(function(D){var B=D.callback,P=D.args;switch(P.length){case 0:B();break;case 1:B(P[0]);break;case 2:B(P[0],P[1]);break;case 3:B(P[0],P[1],P[2]);break;default:B.apply(n,P)}})(E)}finally{d(C),m=!1}}}}function x(C){C.source===i&&typeof C.data=="string"&&C.data.indexOf(c)===0&&g(+C.data.slice(c.length))}})(typeof self>"u"?s===void 0?this:s:self)}).call(this,typeof global<"u"?global:typeof self<"u"?self:typeof window<"u"?window:{})},{}]},{},[10])(10)})});var zt=Object.freeze({pressure:8,temperature:300,depth:1e3,diameter:.08,rate:5e4,roughness:1e-5,angle:90,z:.9}),xt=[["pressure","\u4E95\u53E3\u7EDD\u5BF9\u538B\u529B","MPa",.1,100,.1],["temperature","\u4E95\u53E3\u6E29\u5EA6","K",200,500,1],["depth","\u6CBF\u4E95\u7B52\u957F\u5EA6","m",1,1e4,1],["diameter","\u6CB9\u7BA1\u5185\u5F84","m",.001,1,.001],["rate","\u6807\u51B5\u4EA7\u6C14\u91CF","m\xB3/d",1,1e8,1e3],["roughness","\u7BA1\u58C1\u7C97\u7CD9\u5EA6","m",1e-7,.01,1e-6],["angle","\u4E0E\u6C34\u5E73\u9762\u5939\u89D2","\xB0",0,90,1],["z","\u538B\u7F29\u56E0\u5B50 Z","\u2014",.1,2,.01]],vt=["Orkiszewski","Beggs-Brill"],jt=["\u4E95\u6DF1_m","\u538B\u529B_MPa","\u6E29\u5EA6_K","\u6C14\u4F53\u5BC6\u5EA6_kgm3","\u6D41\u901F_ms","\u6469\u963B\u538B\u964D\u68AF\u5EA6_kPam","\u91CD\u529B\u538B\u964D\u68AF\u5EA6_kPam"];function Pt(e){let v={};for(let[u,s,i,n,l]of xt)(typeof e?.[u]!="number"||!Number.isFinite(e[u])||e[u]<n||e[u]>l)&&(v[u]=`${s}\u987B\u4E3A ${n}\uFF5E${l} ${i} \u4E4B\u95F4\u7684\u6709\u6548\u6570\u503C\u3002`);return!v.roughness&&!v.diameter&&e.roughness>=e.diameter&&(v.roughness="\u7BA1\u58C1\u7C97\u7CD9\u5EA6\u5FC5\u987B\u5C0F\u4E8E\u6CB9\u7BA1\u5185\u5F84\u3002"),v}function Et(e){let v=Object.values(Pt(e))[0];if(v)throw new Error(v)}function Ot(e,v,u){return e*.018/(u*8.314*v)}function Wt(e,v,u){return e=Math.max(e,1),e<2e3?64/e:.25/Math.log10(v/(3.7*u)+5.74/e**.9)**2}function Zt(e){let v=Math.floor(e);return e-v===.5?v%2?v+1:v:Math.round(e)}function Jt(e,v="Orkiszewski",u=Math.max(300,Zt(e.depth))){if(Et(e),!vt.includes(v))throw new Error("\u4E0D\u652F\u6301\u7684\u8BA1\u7B97\u6A21\u578B\u3002");if(!Number.isInteger(u)||u<2||u>5e4)throw new Error("\u8BA1\u7B97\u7F51\u683C\u6570\u987B\u4E3A 2\uFF5E50000 \u7684\u6574\u6570\u3002");let s=e.depth/u,i=e.angle*Math.PI/180,n=Ot(101325,293.15,1)*e.rate/86400,l=Math.PI*e.diameter**2/4,b=v==="Beggs-Brill"?1+.08*Math.sin(i)**2:1,_=e.pressure*1e6,c=0,f=0,o=[];for(let a=0;a<=u;a++){let h=a*s,d=e.temperature+.025*h,g=Ot(_,d,e.z),x=n/(g*l),C=12e-6*(d/300)**.7,E=Wt(g*x*e.diameter/C,e.roughness,e.diameter)*b,D=g*9.81*Math.sin(i),B=E*g*x**2/(2*e.diameter),P=[h,_/1e6,d,g,x,a===u?o[a-1][5]:B/1e3,a===u?o[a-1][6]:D/1e3];if(!P.every(Number.isFinite))throw new Error("\u5F53\u524D\u53C2\u6570\u5BFC\u81F4\u8BA1\u7B97\u6EA2\u51FA\uFF0C\u8BF7\u8C03\u6574\u5DE5\u51B5\u3002");o.push(P),a<u&&(_+=(D+B)*s,c+=D*s/1e6,f+=B*s/1e6)}let m=Math.max(...o.map(a=>a[4]));return{model:v,params:{...e},steps:u,rows:o,samples:ke(o),bottom:o.at(-1)[1],gravity:c,friction:f,maxVelocity:m}}function ke(e,v=100){if(!(v>0)||!Number.isFinite(v)||e.length<2||e.at(-1)[0]/v>2e4)throw new Error("\u91C7\u6837\u95F4\u9694\u548C\u8BA1\u7B97\u7ED3\u679C\u65E0\u6548\uFF0C\u6700\u591A\u652F\u6301 20001 \u4E2A\u91C7\u6837\u70B9\u3002");let u=e.at(-1)[0],s=[];for(let n=0;n*v<u-Math.max(1,u)*1e-12;n++)s.push(n*v);s.push(u);let i=0;return s.map(n=>{for(;i<e.length-2&&e[i+1][0]<n;)i++;let l=e[i],b=e[i+1],_=(n-l[0])/(b[0]-l[0]);return l.map((c,f)=>f===0?n:c+_*(b[f]-c))})}var oe=ye(Rt(),1);function Ct(e){return[{name:"\u5168\u4E95\u6BB5",end:e.depth,diameter:e.diameter,angle:e.angle,roughness:e.roughness}]}function yt(e,v){if(typeof v!="number"||!Number.isFinite(v)||v<1||v>1e4)throw new Error("\u8BF7\u5148\u5C06\u603B\u4E95\u6DF1\u8BBE\u7F6E\u4E3A 1\uFF5E10000 m \u7684\u6709\u6548\u6570\u503C\u3002");if(!Array.isArray(e)||!e.length||e.length>30)throw new Error("\u4E95\u8EAB\u7ED3\u6784\u987B\u5305\u542B 1\uFF5E30 \u4E2A\u8FDE\u7EED\u4E95\u6BB5\u3002");let u=0;return e.map((s,i)=>{let n=`\u7B2C ${i+1} \u4E95\u6BB5`;for(let b of["end","diameter","angle","roughness"])if(typeof s?.[b]!="number"||!Number.isFinite(s[b]))throw new Error(`${n}\u5B58\u5728\u7A7A\u503C\u6216\u65E0\u6548\u6570\u503C\u3002`);if(s.end-u<.1||s.end>v+1e-8)throw new Error(`${n}\u7EC8\u70B9\u4E95\u6DF1\u987B\u9012\u589E\uFF0C\u6BCF\u6BB5\u81F3\u5C11 0.1 m\uFF0C\u4E14\u4E0D\u8D85\u8FC7\u603B\u4E95\u6DF1\u3002`);if(i===e.length-1&&Math.abs(s.end-v)>1e-8)throw new Error(`\u6700\u540E\u4E95\u6BB5\u987B\u5230\u8FBE\u603B\u4E95\u6DF1 ${v} m\u3002`);if(s.diameter<.001||s.diameter>1)throw new Error(`${n}\u5185\u5F84\u987B\u5728 1\uFF5E1000 mm \u4E4B\u95F4\u3002`);if(s.angle<0||s.angle>90)throw new Error(`${n}\u5939\u89D2\u987B\u5728 0\uFF5E90\xB0 \u4E4B\u95F4\uFF08\u76F8\u5BF9\u6C34\u5E73\u9762\uFF09\u3002`);if(s.roughness<1e-7||s.roughness>.01||s.roughness>=s.diameter)throw new Error(`${n}\u7C97\u7CD9\u5EA6\u987B\u5728 0.0001\uFF5E10 mm \u4E4B\u95F4\u4E14\u5C0F\u4E8E\u5185\u5F84\u3002`);let l={name:String(s.name||n).slice(0,30),end:i===e.length-1?v:s.end,diameter:s.diameter,angle:s.angle,roughness:s.roughness};return u=l.end,l})}function Bt(e,v){return e.findIndex((u,s)=>v<u.end-1e-8||s===e.length-1)}function te(e){let v=0,u=0;for(let s of e)u+=(s.end-v)*Math.sin(s.angle*Math.PI/180),v=s.end;return u}function Mt(e,v,u,s=null){Et(e);let i=yt(s||Ct(e),e.depth);if(!s||i.length===1){let a=i[0];return{...Jt({...e,diameter:a.diameter,angle:a.angle,roughness:a.roughness},v,u),params:{...e},segments:i}}if(!vt.includes(v))throw new Error("\u4E0D\u652F\u6301\u7684\u8BA1\u7B97\u6A21\u578B\u3002");if(!Number.isInteger(u)||u<2||u>5e4)throw new Error("\u8BA1\u7B97\u7F51\u683C\u6570\u987B\u4E3A 2\uFF5E50000 \u7684\u6574\u6570\u3002");let n=Ot(101325,293.15,1)*e.rate/86400,l=e.pressure*1e6,b=0,_=0,c=0,f=[];function o(a,h){let d=e.temperature+.025*a,g=Ot(l,d,e.z),x=n/(g*Math.PI*h.diameter**2/4),C=12e-6*(d/300)**.7,E=Math.sin(h.angle*Math.PI/180),D=Wt(g*x*h.diameter/C,h.roughness,h.diameter)*(v==="Beggs-Brill"?1+.08*E**2:1),B=[a,l/1e6,d,g,x,D*g*x**2/(2*h.diameter)/1e3,g*9.81*E/1e3];if(!B.every(Number.isFinite))throw new Error("\u5F53\u524D\u4E95\u8EAB\u7ED3\u6784\u5BFC\u81F4\u8BA1\u7B97\u6EA2\u51FA\uFF0C\u8BF7\u8C03\u6574\u5DE5\u51B5\u3002");return B}for(let a of i){let h=Math.max(1,Math.ceil(u*(a.end-c)/e.depth)),d=(a.end-c)/h;for(let g=0;g<h;g++){let x=o(c+g*d,a);f.push(x),l+=(x[5]+x[6])*1e3*d,b+=x[6]*d/1e3,_+=x[5]*d/1e3}c=a.end}let m=o(e.depth,i.at(-1));return m[5]=f.at(-1)[5],m[6]=f.at(-1)[6],f.push(m),{model:v,params:{...e},segments:i,steps:f.length-1,rows:f,samples:Lt(f,i),bottom:m[1],gravity:b,friction:_,maxVelocity:Math.max(...f.map(a=>a[4]))}}function Lt(e,v,u=100){let s=e.at(-1)[0];if(!(u>0)||!Number.isFinite(u)||s/u>2e4)throw new Error("\u91C7\u6837\u95F4\u9694\u65E0\u6548\u3002");let i=[];for(let l=0;l*u<s-Math.max(1,s)*1e-12;l++)i.push(l*u);i.push(s);let n=0;return i.map(l=>{for(;n<e.length-2&&e[n+1][0]<=l;)n++;let b=e[n],_=e[n+1],c=(l-b[0])/(_[0]-b[0]),f=Bt(v,b[0])!==Bt(v,_[0]);return b.map((o,m)=>m===0?l:f&&m>=4&&c<1?o:o+c*(_[m]-o))})}var ee=["\u7EC8\u70B9\u4E95\u6DF1_m","\u5185\u5F84_mm","\u5939\u89D2_deg","\u7C97\u7CD9\u5EA6_mm","\u4E95\u6BB5\u540D\u79F0"];function Se(e){let v=[],u=[],s="",i=!1;for(let n=0;n<e.length;n++){let l=e[n];l==='"'?i&&e[n+1]==='"'?(s+='"',n++):i=!i:!i&&(l===","||l===`
`)?(u.push(s.replace(/\r$/,"")),s="",l===`
`&&(u.some(b=>b.trim())&&v.push(u),u=[])):s+=l}if(i)throw new Error("CSV\u5F15\u53F7\u672A\u95ED\u5408\u3002");return u.push(s.replace(/\r$/,"")),u.some(n=>n.trim())&&v.push(u),v}function re(e,v){if(e=e.replace(/^\uFEFF/,"").trim(),e.startsWith("{")||e.startsWith("[")){let i=JSON.parse(e);return yt(Array.isArray(i)?i:i.segments,v)}let[u,...s]=Se(e);if(!u||ee.some((i,n)=>u[n]?.trim()!==i))throw new Error("CSV\u8868\u5934\u6216\u5355\u4F4D\u4E0D\u5339\u914D\uFF0C\u8BF7\u4F7F\u7528\u672C\u5E94\u7528\u7684\u7ED3\u6784\u6A21\u677F\u3002");return yt(s.map(i=>{if(i.length!==5||i.slice(0,4).some(n=>!n.trim()))throw new Error("CSV\u6BCF\u884C\u987B\u5305\u542B\u56DB\u4E2A\u6570\u503C\u53CA\u4E95\u6BB5\u540D\u79F0\uFF0C\u4E0D\u80FD\u6709\u7A7A\u6570\u503C\u3002");return{end:Number(i[0]),diameter:Number(i[1])/1e3,angle:Number(i[2]),roughness:Number(i[3])/1e3,name:i[4]}}),v)}function Ht(e){let v=u=>`"${String(u).replaceAll('"','""')}"`;return"\uFEFF"+[ee,...e.map(u=>[u.end,u.diameter*1e3,u.angle,u.roughness*1e3,u.name])].map(u=>u.map(v).join(",")).join(`\r
`)}var Tt="1.2.0",Ut=[25,50,100,200,500];function Ft(e,v,u=1,s=null){let i=s?yt(s,e.depth):null;if(i){let f=i[0];e={...e,diameter:f.diameter,angle:f.angle,roughness:f.roughness}}if(Et(e),![1,2].includes(u))throw new Error("\u7F51\u683C\u6A21\u5F0F\u65E0\u6548\u3002");let n=Math.max(300,Zt(e.depth))*u,l=Mt(e,v,n,i),b=Mt(e,vt.find(f=>f!==v),n,i),_=Mt(e,v,n*2,i),c=Math.abs(_.bottom-l.bottom);return{result:l,comparison:b,gridFactor:u,structure:i,quality:{refinedSteps:_.steps,refinedBottom:_.bottom,difference:c,relativePercent:c/Math.abs(_.bottom)*100}}}function ne(e,v){if(!Ut.includes(v))throw new Error("\u91C7\u6837\u95F4\u9694\u65E0\u6548\u3002");return{...e,interval:v,result:{...e.result,samples:Lt(e.result.rows,e.result.segments,v)},comparison:{...e.comparison,samples:Lt(e.comparison.rows,e.comparison.segments,v)}}}function ie(e,v){return{app:"wellbore-pressure",version:3,appVersion:Tt,model:e.result.model,parameters:e.result.params,gridFactor:e.gridFactor,interval:v,structure:e.structure}}function ae(e){if(!e||e.app!=="wellbore-pressure"||![1,2,3].includes(e.version)||!vt.includes(e.model))throw new Error("\u4E0D\u662F\u53D7\u652F\u6301\u7684\u4E95\u7B52\u538B\u529B\u65B9\u6848\u6587\u4EF6\u3002");let v=Object.fromEntries(xt.map(([n])=>[n,e.parameters?.[n]]));Et(v);let u=e.version===1?1:e.gridFactor,s=e.version===1?100:e.interval;if(![1,2].includes(u)||!Ut.includes(s))throw new Error("\u65B9\u6848\u4E2D\u7684\u7F51\u683C\u6A21\u5F0F\u6216\u91C7\u6837\u95F4\u9694\u65E0\u6548\u3002");let i=e.version===3&&e.structure!==null?yt(e.structure,v.depth):null;return{parameters:v,model:e.model,gridFactor:u,interval:s,...e.version===3?{structure:i}:{}}}function se(e,v){return xt.filter(([u])=>e[u]!==v[u]).map(([u,s,i])=>({key:u,label:s,unit:i,before:e[u],after:v[u]}))}var ze=e=>String(e).replace(/[&<>"']/g,v=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"})[v]);async function le(e,v,{interval:u=100,quality:s=null,baseline:i=null}={}){let n=new oe.default,l=[["\u8BA1\u7B97\u8BF4\u660E\u4E0E\u53C2\u6570",[["\u4E95\u7B52\u538B\u529B\u8BA1\u7B97",Tt],["\u8BA1\u7B97\u6A21\u578B",e.model+"\uFF08\u539F\u7A0B\u5E8F\u5355\u6C14\u76F8\u7B80\u5316\u7248\uFF09"],["\u8BA1\u7B97\u7F51\u683C\u6570",e.steps],["\u91C7\u6837\u95F4\u9694",u,"m"],...xt.map(([c,f,o])=>[f,e.params[c],o]),["\u4E95\u5E95\u538B\u529B",e.bottom,"MPa"],["\u91CD\u529B\u7D2F\u8BA1\u538B\u5DEE",e.gravity,"MPa"],["\u6469\u963B\u7D2F\u8BA1\u538B\u5DEE",e.friction,"MPa"],["\u89D2\u5EA6\u5B9A\u4E49","\u6C34\u5E73\u4E3A0\xB0\uFF0C\u5782\u76F4\u4E3A90\xB0"],["\u9002\u7528\u8303\u56F4","\u5355\u6C14\u76F8\u91C7\u6C14\uFF1B\u4E0D\u542B\u591A\u76F8\u6D41\u3001\u6CE8\u6C14\u65B9\u5411\u548C\u52A0\u901F\u9879"],["\u6E29\u5EA6\u68AF\u5EA6",.025,"K/m"],["\u6C14\u4F53\u6469\u5C14\u8D28\u91CF",.018,"kg/mol"],["\u6807\u51B5\u538B\u529B",101325,"Pa"],["\u6807\u51B5\u6E29\u5EA6",293.15,"K"],["\u8BA1\u7B97\u65B9\u6CD5","\u663E\u5F0F\u9010\u6BB5\u79EF\u5206\uFF1B\u6C14\u4F53\u9ECF\u5EA6=1.2e-5\xD7(T/300)^0.7 Pa\xB7s\uFF1B\u5E38Z"],["Beggs-Brill\u5DEE\u5F02","\u539F\u4EE3\u7801\u4EC5\u5C06\u6469\u963B\u4E58\u4EE51+0.08\xD7sin\xB2(\u03B8)"]]],[`${u}m\u91C7\u6837`,[jt,...e.samples]],["\u5B8C\u6574\u5256\u9762",[jt,...e.rows]],["\u6A21\u578B\u5BF9\u6BD4",[["\u4E95\u6DF1_m",`${e.model}_MPa`,`${v.model}_MPa`],...e.samples.map((c,f)=>[c[0],c[1],v.samples[f][1]])]]];if(e.segments){let c=0;l.push(["\u4E95\u8EAB\u7ED3\u6784",[["\u4E95\u6BB5\u540D\u79F0","\u8D77\u70B9\u4E95\u6DF1_m","\u7EC8\u70B9\u4E95\u6DF1_m","\u5185\u5F84_mm","\u5939\u89D2_deg","\u7C97\u7CD9\u5EA6_mm"],...e.segments.map(f=>{let o=[f.name,c,f.end,f.diameter*1e3,f.angle,f.roughness*1e3];return c=f.end,o})]]),l[0][1].push(["\u4E95\u8EAB\u7ED3\u6784\u8BF4\u660E","\u6D41\u52A8\u901A\u9053\u5185\u5F84\u53CA\u4E95\u6BB5\u53C2\u6570\u4EE5\u4E95\u8EAB\u7ED3\u6784\u8868\u4E3A\u51C6\uFF1B\u5206\u6BB5\u8BA1\u7B97\u4E0D\u542B\u7BA1\u5F84\u7A81\u53D8\u5C40\u90E8\u635F\u5931"])}if(s&&l.push(["\u8BA1\u7B97\u68C0\u67E5",[["\u9879\u76EE","\u6570\u503C","\u5355\u4F4D"],["\u5F53\u524D\u7F51\u683C\u6570",e.steps,""],["\u52A0\u5BC6\u7F51\u683C\u6570",s.refinedSteps,""],["\u5F53\u524D\u4E95\u5E95\u538B\u529B",e.bottom,"MPa"],["\u52A0\u5BC6\u4E95\u5E95\u538B\u529B",s.refinedBottom,"MPa"],["\u7EDD\u5BF9\u5DEE\u5F02",s.difference,"MPa"],["\u76F8\u5BF9\u5DEE\u5F02",s.relativePercent,"%"],["\u8BF4\u660E","\u4EC5\u68C0\u67E5\u6570\u503C\u79BB\u6563\u8BEF\u5DEE\uFF0C\u4E0D\u7B49\u4E8E\u73B0\u573A\u7CBE\u5EA6\u9A8C\u8BC1",""]]]),i&&l.push(["\u5DE5\u51B5\u5BF9\u6BD4",[["\u9879\u76EE","\u56FA\u5B9A\u57FA\u51C6","\u5F53\u524D\u7ED3\u679C","\u5355\u4F4D"],["\u6A21\u578B",i.model,e.model,""],["\u7F51\u683C\u6570",i.steps,e.steps,""],...xt.map(([c,f,o])=>[f,i.params[c],e.params[c],o]),["\u4E95\u5E95\u538B\u529B",i.bottom,e.bottom,"MPa"],["\u91CD\u529B\u538B\u5DEE",i.gravity,e.gravity,"MPa"],["\u6469\u963B\u538B\u5DEE",i.friction,e.friction,"MPa"]]]),i?.segments){let c=[["\u5DE5\u51B5","\u4E95\u6BB5\u540D\u79F0","\u8D77\u70B9\u4E95\u6DF1_m","\u7EC8\u70B9\u4E95\u6DF1_m","\u5185\u5F84_mm","\u5939\u89D2_deg","\u7C97\u7CD9\u5EA6_mm"]];for(let[f,o]of[["\u56FA\u5B9A\u57FA\u51C6",i.segments],["\u5F53\u524D\u7ED3\u679C",e.segments]]){let m=0;for(let a of o)c.push([f,a.name,m,a.end,a.diameter*1e3,a.angle,a.roughness*1e3]),m=a.end}l.push(["\u7ED3\u6784\u5BF9\u6BD4",c])}let b="http://schemas.openxmlformats.org/spreadsheetml/2006/main",_="http://schemas.openxmlformats.org/officeDocument/2006/relationships";return n.file("[Content_Types].xml",`<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${l.map((c,f)=>`<Override PartName="/xl/worksheets/sheet${f+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}</Types>`),n.file("_rels/.rels",`<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${_}/officeDocument" Target="xl/workbook.xml"/></Relationships>`),n.file("xl/workbook.xml",`<workbook xmlns="${b}" xmlns:r="${_}"><sheets>${l.map(([c],f)=>`<sheet name="${c}" sheetId="${f+1}" r:id="rId${f+1}"/>`).join("")}</sheets></workbook>`),n.file("xl/_rels/workbook.xml.rels",`<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${l.map((c,f)=>`<Relationship Id="rId${f+1}" Type="${_}/worksheet" Target="worksheets/sheet${f+1}.xml"/>`).join("")}</Relationships>`),l.forEach(([,c],f)=>n.file(`xl/worksheets/sheet${f+1}.xml`,`<worksheet xmlns="${b}"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols><col min="1" max="1" width="27" customWidth="1"/><col min="2" max="8" width="25" customWidth="1"/></cols><sheetData>${c.map((o,m)=>`<row r="${m+1}">${o.map((a,h)=>typeof a=="number"?`<c r="${String.fromCharCode(65+h)}${m+1}"><v>${a}</v></c>`:`<c r="${String.fromCharCode(65+h)}${m+1}" t="inlineStr"><is><t>${ze(a)}</t></is></c>`).join("")}</row>`).join("")}</sheetData></worksheet>`)),n.generateAsync({type:"uint8array",compression:"DEFLATE"})}function kt(e,v,u){let s=URL.createObjectURL(new Blob([e],{type:u})),i=document.createElement("a");i.href=s,i.download=v,document.body.append(i),i.click(),i.remove(),setTimeout(()=>URL.revokeObjectURL(s),1e4)}var nt=(e,v=4)=>e!==0&&Math.abs(e)<.5*10**-v?Number(e).toExponential(2):Number(e).toLocaleString("zh-CN",{maximumFractionDigits:v,minimumFractionDigits:v});var st=window.QwenPaw.host.React,{useState:Ce,useRef:Ee}=st;function Vt({result:e,comparison:v,compare:u,metric:s,interval:i,disabled:n}){let[l,b]=Ce(0),_=Ee(null),c={pressure:1,temperature:2,velocity:4}[s],f={pressure:"\u538B\u529B / MPa",temperature:"\u6E29\u5EA6 / K",velocity:"\u6D41\u901F / m\xB7s\u207B\xB9"}[s],o=[...e.rows,...u?v.rows:[]].map(I=>I[c]),m=Math.min(...o),a=Math.max(...o),h=Math.max((a-m)*.12,.01),d=m-h,g=a+h,x=640,C=620,E=78,D=28,B=44,P=38,T=I=>E+(I-d)/(g-d)*(x-E-D),Z=I=>B+I/e.params.depth*(C-B-P),J=I=>I.filter((Q,U)=>U%Math.max(1,Math.floor(I.length/700))===0||U===I.length-1).map((Q,U)=>`${U?"L":"M"}${T(Q[c]).toFixed(3)},${Z(Q[0]).toFixed(3)}`).join(" ");function y(I){let Q=I.currentTarget,U=Q.getScreenCTM();if(!U)return;let rt=Q.createSVGPoint();rt.x=I.clientX,rt.y=I.clientY;let $=rt.matrixTransform(U.inverse()).y,et=Math.max(0,Math.min(e.params.depth,($-B)/(C-B-P)*e.params.depth)),A=0,k=e.rows.length-1;for(;A<k;){let R=Math.floor((A+k)/2);e.rows[R][0]<et?A=R+1:k=R}b(A>0&&et-e.rows[A-1][0]<e.rows[A][0]-et?A-1:A)}function F(){let I=_.current.cloneNode(!0);I.setAttribute("xmlns","http://www.w3.org/2000/svg"),I.setAttribute("width",x),I.setAttribute("height",C);let Q=document.createElementNS("http://www.w3.org/2000/svg","title");Q.textContent=`${e.model} \xB7 ${f} \xB7 \u4E95\u6DF1${e.params.depth}m`,I.prepend(Q),kt(new XMLSerializer().serializeToString(I),`\u4E95\u7B52\u5256\u9762_${s}_${e.model}.svg`,"image/svg+xml;charset=utf-8")}let r=l==null?null:e.rows[l];return st.createElement(st.Fragment,null,st.createElement("svg",{ref:_,className:"wp-chart","data-testid":"pressure-chart",viewBox:`0 0 ${x} ${C}`,role:"img","aria-label":`${f}\u4E0E\u4E95\u6DF1\u66F2\u7EBF\uFF0C\u4E95\u6DF1\u5411\u4E0B\u589E\u52A0`,onPointerMove:y},st.createElement("rect",{width:x,height:C,fill:"white"}),Array.from({length:6},(I,Q)=>{let U=e.params.depth*Q/5,rt=d+(g-d)*Q/5;return st.createElement("g",{key:Q,fontFamily:"Microsoft YaHei, sans-serif",fontSize:"11",fill:"#7b8d9f"},st.createElement("line",{x1:E,x2:x-D,y1:Z(U),y2:Z(U),stroke:"#e9eff4"}),st.createElement("text",{x:E-12,y:Z(U)+4,textAnchor:"end"},nt(U,0)),st.createElement("line",{x1:T(rt),x2:T(rt),y1:B,y2:C-P,stroke:"#edf2f6"}),st.createElement("text",{x:T(rt),y:B-13,textAnchor:"middle"},nt(rt,2)))}),st.createElement("text",{x:(E+x-D)/2,y:"13",textAnchor:"middle",fontSize:"11",fill:"#6d8298"},f),st.createElement("text",{x:"18",y:"255",transform:"rotate(-90 18 255)",textAnchor:"middle",fontSize:"11",fill:"#6d8298"},"\u4E95\u6DF1 / m"),e.segments?.slice(0,-1).map((I,Q)=>st.createElement("g",{key:`section-${Q}`},st.createElement("line",{x1:E,x2:x-D,y1:Z(I.end),y2:Z(I.end),stroke:"#b6c8d7",strokeDasharray:"5 4"}),st.createElement("text",{x:x-D-3,y:Z(I.end)-5,textAnchor:"end",fontSize:"10",fill:"#718a9f"},"\u4E95\u6BB5\u754C\u9762 ",nt(I.end,0)," m"))),u&&st.createElement("path",{d:J(v.rows),fill:"none",stroke:"#278b89",strokeWidth:"2.5",strokeDasharray:"7 5"}),st.createElement("path",{d:J(e.rows),fill:"none",stroke:"#2365a4",strokeWidth:"3"}),e.samples.length<60&&e.samples.map((I,Q)=>st.createElement("circle",{key:Q,cx:T(I[c]),cy:Z(I[0]),r:"3",fill:"white",stroke:"#2365a4",strokeWidth:"1.7"})),r&&st.createElement("g",null,st.createElement("line",{x1:E,x2:x-D,y1:Z(r[0]),y2:Z(r[0]),stroke:"#a8b8c6",strokeDasharray:"3 3"}),st.createElement("circle",{cx:T(r[c]),cy:Z(r[0]),r:"5",fill:"#2365a4",stroke:"white",strokeWidth:"2"})),st.createElement("text",{x:x-D,y:C-7,textAnchor:"end",fontSize:"10",fill:"#90a0ad"},"\u4E95\u6DF1\u5411\u4E0B\u589E\u52A0 \xB7 \u5355\u6C14\u76F8\u91C7\u6C14")),st.createElement("div",{className:"wp-legend"},st.createElement("span",null,st.createElement("i",{className:"wp-key"}),e.model),u&&st.createElement("span",null,st.createElement("i",{className:"wp-key alt"}),v.model),st.createElement("span",null,"\u25CB ",i," m \u91C7\u6837\u70B9")),st.createElement("div",{className:"wp-chart-status"},r?`\u4E95\u6DF1 ${nt(r[0],1)} m \xB7 ${f.split(" / ")[0]} ${nt(r[c])}${u?` \xB7 \u5BF9\u6BD4 ${nt(v.rows[l][c])}`:""}`:"\u9009\u62E9\u4E95\u6DF1\u67E5\u770B\u8BA1\u7B97\u503C"),st.createElement("div",{className:"wp-probe"},st.createElement("label",null,"\u67E5\u8BE2\u4E95\u6DF1 / m",st.createElement("input",{"aria-label":"\u67E5\u8BE2\u4E95\u6DF1",type:"range",min:"0",max:e.steps,step:"1",value:l??0,onChange:I=>b(Number(I.target.value))})),st.createElement("span",null,nt(r?.[0]??0,1)," m"),st.createElement("button",{disabled:n,onClick:F},"\u5BFC\u51FA\u66F2\u7EBF SVG")))}var de=`.wp-app {
  --ink: #243a50;
  --muted: #7e8e9e;
  --line: #e2e9ef;
  --blue: #2167ad;
  --teal: #29918d;
  background: #f1f5f9;
  color: var(--ink);
  font:
    13px/1.6 Inter,
    "Microsoft YaHei",
    sans-serif;
  color-scheme: light;
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
  background: white;
  border-radius: 7px;
  cursor: pointer;
  padding: 6px 11px;
  white-space: nowrap;
}
.wp-app button:hover {
  background: #f0f6fc;
}
.wp-app button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.wp-app button:focus-visible,
.wp-app summary:focus-visible {
  outline: 3px solid #8bbbe7;
  outline-offset: 2px;
}
.wp-app input,
.wp-app select {
  border: 1px solid #dbe4ed;
  background: #fbfdff;
  padding: 7px 9px;
  border-radius: 6px;
  width: 100%;
  min-width: 0;
  outline: none;
  font-variant-numeric: tabular-nums;
}
.wp-app input:focus,
.wp-app select:focus {
  border-color: #4b8fc5;
  box-shadow: 0 0 0 2px #e5f0fa;
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
  font-size: 23px;
  letter-spacing: 0.02em;
}
.wp-app h2 {
  font-size: 14px;
}
.wp-shell {
  height: calc(100dvh - 32px);
  min-height: 780px;
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
  border: 1px solid #d5e1ed;
  width: 42px;
  height: 46px;
  display: grid;
  place-items: center;
  color: var(--blue);
  border-radius: 11px;
  background: white;
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
  background: white;
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
  border-bottom: 1px solid #edf1f5;
  flex: none;
}
.wp-heading {
  display: flex;
  align-items: center;
  gap: 8px;
}
.wp-index {
  font-size: 10px;
  color: #93a6b7;
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
  color: #93a3b3;
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
  color: white;
  border-color: var(--blue);
  font-weight: 600;
  padding: 9px 15px;
}
.wp-app .wp-primary:hover {
  background: #19588f;
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
  border-bottom: 1px solid #edf1f5;
  flex-wrap: wrap;
}
.wp-modes {
  display: flex;
  padding: 2px;
  background: #edf2f7;
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
  background: white;
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
  border: 1px solid #dce7f1;
  border-radius: 9px;
  padding: 10px 12px;
  margin-bottom: 10px;
  background: #fcfdff;
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
  color: #a45e50;
  font-size: 11px;
}
.wp-segment-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px 12px;
}
.wp-structure-footer {
  padding: 10px 16px;
  border-top: 1px solid #edf1f5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.wp-app .wp-add {
  border: 1px dashed #a7c5df;
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
  border-bottom: 1px solid #edf1f5;
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
  border-bottom: 1px solid #edf1f5;
  gap: 12px;
}
.wp-stat {
  padding-left: 15px;
  border-left: 1px solid #e7edf3;
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
  color: #8b9bad;
}
.wp-stat-note {
  font-size: 10px;
  color: #8c9dad;
}
.wp-tabs-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 18px;
  gap: 8px;
  border-bottom: 1px solid #edf1f5;
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
  color: #8393a3;
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
  border-right: 1px solid #edf1f5;
  background: #fbfdff;
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
  color: #92a3b2;
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
  color: #5f7f98;
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
  background: #f5f8fb;
  color: #768da2;
  font-weight: 500;
  position: sticky;
  top: 0;
  z-index: 1;
}
.wp-app th,
.wp-app td {
  padding: 10px 13px;
  border-bottom: 1px solid #edf1f5;
}
.wp-app td {
  text-align: right;
}
.wp-app td:first-child,
.wp-app th:first-child {
  text-align: left;
}
.wp-app tbody tr:hover {
  background: #f2f8fd;
}
.wp-app tbody tr:last-child {
  background: #eff6fc;
}
.wp-table-empty {
  display: grid;
  place-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
  color: #7f93a7;
  gap: 12px;
}
.wp-visual-footer {
  border-top: 1px solid #e7edf3;
  flex: none;
}
.wp-quality-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 9px 17px;
  font-size: 10px;
  color: #7b90a4;
  flex-wrap: wrap;
}
.wp-app .wp-quality-line button {
  font-size: 10px;
  padding: 4px 7px;
}
.wp-details {
  font-size: 10px;
  color: #7a8c9e;
  padding: 0 17px 10px;
}
.wp-details summary {
  cursor: pointer;
  display: inline-block;
  color: #63809a;
}
.wp-details p {
  margin-top: 7px;
  line-height: 1.9;
}
.wp-foot {
  font-size: 9px;
  color: #91a1b1;
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
`;var he=window.QwenPaw,S=he.host.React,{useState:ft,useRef:Gt,useMemo:Ae}=S,ue=(e,v)=>JSON.stringify(e)===JSON.stringify(v);function Nt({label:e,unit:v,value:u,onChange:s,error:i,name:n,scale:l=1,...b}){let _=typeof u=="number"&&Number.isFinite(u)?Number((u*l).toPrecision(12)):u;return S.createElement("label",{className:"wp-field"},S.createElement("span",{className:"wp-field-title"},e,S.createElement("span",{className:"wp-unit"},v)),S.createElement("input",{type:"number",step:"any",name:n,"aria-label":e,"aria-invalid":!!i,"aria-describedby":i?`wp-error-${n}`:void 0,value:_,onChange:c=>s(c.target.value===""?"":Number(c.target.value)/l),...b}),i&&S.createElement("span",{id:`wp-error-${n}`,className:"wp-field-error"},i))}function Ie({segments:e,depth:v}){let u=0,s=Math.max(...e.map(n=>n.diameter)),i=["#377db6","#278d98","#7198b7","#5787a6"];return S.createElement("aside",{className:"wp-schematic","aria-label":"\u4E95\u8EAB\u7ED3\u6784\u793A\u610F"},S.createElement("h3",null,"\u4E95\u8EAB\u7ED3\u6784"),S.createElement("div",{className:"wp-sub"},e.length," \u4E2A\u4E95\u6BB5 \xB7 MD"),S.createElement("svg",{viewBox:"0 0 150 490",role:"img","aria-label":"\u6309\u5185\u5F84\u7F29\u653E\u7684\u4E95\u8EAB\u7ED3\u6784\u5C55\u5F00\u56FE"},S.createElement("rect",{x:"0",y:"0",width:"150",height:"490",fill:"#fbfdff"}),S.createElement("line",{x1:"65",x2:"65",y1:"30",y2:"440",stroke:"#d9e4ed",strokeDasharray:"3 3"}),S.createElement("text",{x:"65",y:"17",textAnchor:"middle",fill:"#8296a8",fontSize:"10"},"\u4E95\u53E3 \xB7 0 m"),e.map((n,l)=>{let b=u;u=n.end;let _=30+b/v*410,c=(n.end-b)/v*410,f=28+54*n.diameter/s;return S.createElement("g",{key:l},S.createElement("title",null,n.name,"\uFF1A",b,"\uFF5E",n.end," m\uFF0C\u5185\u5F84 ",n.diameter*1e3," mm\uFF0C\u5939\u89D2"," ",n.angle,"\xB0"),S.createElement("rect",{x:65-f/2,y:_,width:f,height:Math.max(c,1),fill:i[l%4],fillOpacity:".13",stroke:i[l%4],strokeWidth:"1.7"}),S.createElement("line",{x1:65-f/2+4,x2:65-f/2+4,y1:_,y2:_+c,stroke:"white",strokeWidth:"2"}),S.createElement("text",{x:"65",y:_+c/2-2,textAnchor:"middle",fill:i[l%4],fontSize:"11",fontWeight:"600"},"\xD8 ",nt(n.diameter*1e3,0)),c>55&&S.createElement("text",{x:"65",y:_+c/2+14,textAnchor:"middle",fill:"#7a93a7",fontSize:"9"},nt(n.angle,0),"\xB0"),S.createElement("line",{x1:"110",x2:"117",y1:_+c,y2:_+c,stroke:"#9bb0c1"}),S.createElement("text",{x:"120",y:_+c+3,fill:"#8ba1b3",fontSize:"8"},nt(n.end,0)))}),S.createElement("text",{x:"65",y:"463",textAnchor:"middle",fill:"#61849d",fontSize:"10"},"\u4E95\u5E95 ",nt(v,0)," m"),S.createElement("text",{x:"65",y:"480",textAnchor:"middle",fill:"#91a5b5",fontSize:"9"},"\u5185\u5F84 / mm")),S.createElement("div",{className:"wp-schematic-note"},"\u6CBF\u6D4B\u6DF1\u5C55\u5F00\uFF0C\u6A2A\u5411\u653E\u5927\u3002",S.createElement("br",null),"\u5782\u6DF1\u7EA6 ",nt(te(e),1)," m",S.createElement("br",null),"\u4E0D\u8868\u793A\u5B9E\u9645\u4E95\u773C\u8F68\u8FF9\u3002"))}function Kt({headers:e,rows:v}){return S.createElement("div",{className:"wp-table-wrap"},S.createElement("table",null,S.createElement("thead",null,S.createElement("tr",null,e.map((u,s)=>S.createElement("th",{key:s,scope:"col"},u)))),S.createElement("tbody",null,v.map((u,s)=>S.createElement("tr",{key:s},u.map((i,n)=>S.createElement("td",{key:n},i)))))))}function Oe(){let[e,v]=ft({...zt}),[u,s]=ft(vt[0]),[i,n]=ft(1),[l,b]=ft(100),[_,c]=ft("uniform"),[f,o]=ft(()=>Ct(zt)),[m,a]=ft(()=>Ft(zt,vt[0])),[h,d]=ft("chart"),[g,x]=ft("pressure"),[C,E]=ft("profile"),[D,B]=ft(!0),[P,T]=ft(null),[Z,J]=ft(""),[y,F]=ft(""),[r,I]=ft(!1),[Q,U]=ft(!1),rt=Gt(null),$=Gt(null),et=Gt(null),A=Ae(()=>ne(m,l),[m,l]),{result:k,comparison:R,quality:Y}=A,G=_==="segmented"?f:null,ot=xt.some(([L])=>e[L]!==k.params[L])||u!==k.model||i!==m.gridFactor||!ue(G,m.structure),pt=r?Pt(e):{},it=()=>{J(""),F("")};function lt(L,X){v(K=>({...K,[L]:X})),it()}function ht(L){L?.preventDefault(),I(!0);try{let X=Ft(e,u,i,G);a(X),v(X.result.params),X.structure&&o(X.structure),J(""),F("\u8BA1\u7B97\u5B8C\u6210\uFF0C\u4E95\u8EAB\u7ED3\u6784\u4E0E\u7ED3\u679C\u5DF2\u540C\u6B65\u3002")}catch(X){J(X.message),F("");let K=Object.keys(Pt(e))[0];K&&et.current?.closest(".wp-app")?.querySelector(`[name="${K}"]`)?.focus()}}function ut(){v({...zt}),s(vt[0]),n(1),b(100),c("uniform"),o(Ct(zt)),a(Ft(zt,vt[0])),T(null),I(!1),J(""),F("\u5DF2\u6062\u590D\u5355\u4E95\u6BB5\u793A\u4F8B\u3002")}function wt(L){if(L!==_){if(L==="segmented")o(Ct(e));else{let X=f[0];v(K=>({...K,diameter:X.diameter,angle:X.angle,roughness:X.roughness}))}c(L),it()}}function ct(L,X,K){o(gt=>gt.map((_t,bt)=>bt===L?{..._t,[X]:K}:_t)),it()}function t(){try{let L=yt(f,e.depth),X=L.at(-1),K=L.length>1?L.at(-2).end:0;if(L.length>=30)throw new Error("\u6700\u591A\u652F\u630130\u4E2A\u4E95\u6BB5\u3002");if(X.end-K<.2)throw new Error("\u6700\u540E\u4E95\u6BB5\u8FC7\u77ED\uFF0C\u65E0\u6CD5\u7EE7\u7EED\u62C6\u5206\u3002");o([...L.slice(0,-1),{...X,end:Math.round((K+X.end)/2*1e4)/1e4},{...X,name:`\u4E95\u6BB5 ${L.length+1}`}]),it()}catch(L){J(L.message)}}function M(L){f.length!==1&&(o(X=>{let K=X.filter((gt,_t)=>L!==_t).map(gt=>({...gt}));return L===X.length-1&&(K.at(-1).end=e.depth),K}),it())}function O(){let L=Number(e.depth);if(!(L>=1&&L<=1e4)){J("\u8BF7\u5148\u8BBE\u7F6E\u6709\u6548\u7684\u603B\u4E95\u6DF1\u3002");return}c("segmented"),o([{name:"\u4E0A\u90E8\u4E95\u6BB5",end:L*.3,diameter:.114,angle:90,roughness:1e-5},{name:"\u4E2D\u90E8\u4E95\u6BB5",end:L*.7,diameter:.089,angle:75,roughness:1e-5},{name:"\u4E0B\u90E8\u4E95\u6BB5",end:L,diameter:.076,angle:60,roughness:1e-5}]),F("\u5DF2\u586B\u5165\u4E09\u6BB5\u793A\u4F8B\uFF0C\u70B9\u51FB\u8BA1\u7B97\u5E94\u7528\u65B0\u7ED3\u6784\u3002"),J("")}async function w(L){let X=L.target.files?.[0];if(L.target.value="",!!X)try{if(X.size>1e5)throw new Error("\u65B9\u6848\u6587\u4EF6\u8D85\u8FC7100 KB\u3002");let K=ae(JSON.parse(await X.text())),gt=Ft(K.parameters,K.model,K.gridFactor,K.structure||null);v(K.parameters),s(K.model),n(K.gridFactor),b(K.interval),c(K.structure?"segmented":"uniform"),o(K.structure||Ct(K.parameters)),a(gt),J(""),I(!1),F("\u65B9\u6848\u5DF2\u8F7D\u5165\u5E76\u91CD\u65B0\u8BA1\u7B97\u3002")}catch(K){J("\u8F7D\u5165\u5931\u8D25\uFF1A"+K.message)}}async function p(L){let X=L.target.files?.[0];if(L.target.value="",!!X)try{if(X.size>1e5)throw new Error("\u7ED3\u6784\u6587\u4EF6\u8D85\u8FC7100 KB\u3002");let K=re(await X.text(),e.depth);o(K),c("segmented"),J(""),F(`\u5DF2\u5BFC\u5165 ${K.length} \u4E2A\u4E95\u6BB5\uFF0C\u70B9\u51FB\u8BA1\u7B97\u5E94\u7528\u7ED3\u6784\u3002`)}catch(K){J("\u7ED3\u6784\u5BFC\u5165\u5931\u8D25\uFF1A"+K.message)}}function z(){try{let L=yt(_==="segmented"?f:Ct(e),e.depth);kt(Ht(L),"\u4E95\u8EAB\u7ED3\u6784\u6A21\u677F.csv","text/csv;charset=utf-8"),F("\u7ED3\u6784\u6A21\u677F\u5DF2\u5BFC\u51FA\uFF1A\u6D4B\u6DF1m\u3001\u5185\u5F84mm\u3001\u5939\u89D2\u5EA6\u3001\u7C97\u7CD9\u5EA6mm\u3002"),J("")}catch(L){J(L.message)}}async function j(){U(!0);try{kt(await le(k,R,{interval:l,quality:Y,baseline:P}),"\u4E95\u7B52\u538B\u529B_"+k.model+".xlsx","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),F("Excel\u5DF2\u5BFC\u51FA\uFF0C\u5305\u542B\u4E95\u8EAB\u7ED3\u6784\u3001\u5B8C\u6574\u5256\u9762\u548C\u8BA1\u7B97\u68C0\u67E5\u3002")}catch(L){J("\u5BFC\u51FA\u5931\u8D25\uFF1A"+L.message)}finally{U(!1)}}function W(){if(C==="structure"){kt(Ht(k.segments),"\u4E95\u8EAB\u7ED3\u6784.csv","text/csv;charset=utf-8"),F("\u4E95\u8EAB\u7ED3\u6784CSV\u5DF2\u5BFC\u51FA\uFF0C\u53EF\u91CD\u65B0\u5BFC\u5165\u3002");return}if(C==="baseline"&&!P)return;let L=C==="baseline"?[["\u6BD4\u8F83\u9879\u76EE","\u56FA\u5B9A\u57FA\u51C6","\u5F53\u524D\u7ED3\u679C"],["\u4E95\u5E95\u538B\u529B_MPa",P.bottom,k.bottom],["\u6469\u963B\u538B\u5DEE_MPa",P.friction,k.friction],["\u6A21\u578B",P.model,k.model],["\u4E95\u6BB5\u6570",P.segments.length,k.segments.length],...xt.map(([X,K])=>[K,P.params[X],k.params[X]])]:[at,...k.samples.map(X=>[X[0],k.segments[Bt(k.segments,X[0])].name,...X.slice(1)])];kt("\uFEFF"+L.map(X=>X.map(K=>`"${String(K).replaceAll('"','""')}"`).join(",")).join(`\r
`),C==="baseline"?"\u4E95\u7B52\u5DE5\u51B5\u5BF9\u6BD4.csv":`\u4E95\u7B52\u538B\u529B_${l}m.csv`,"text/csv;charset=utf-8"),F("\u5F53\u524D\u6570\u636E\u8868CSV\u5DF2\u5BFC\u51FA\u3002")}function N(){kt(JSON.stringify(ie(m,l),null,2),"\u4E95\u7B52\u538B\u529B_\u8BA1\u7B97\u65B9\u6848.json","application/json"),F("\u65B9\u6848\u5DF2\u4FDD\u5B58\uFF0C\u542B\u4E95\u8EAB\u7ED3\u6784\u3001\u7F51\u683C\u548C\u91C7\u6837\u8BBE\u7F6E\u3002")}function H(){T(k),F("\u5DF2\u56FA\u5B9A\u5F53\u524D\u7ED3\u679C\uFF0C\u4FEE\u6539\u53C2\u6570\u6216\u4E95\u8EAB\u7ED3\u6784\u5E76\u8BA1\u7B97\u540E\u53EF\u6BD4\u8F83\u3002")}let q=k.bottom-k.params.pressure,V=P?se(P.params,k.params):[],tt=P&&!ue(P.segments,k.segments),dt=[["diameter","\u6CB9\u7BA1\u5185\u5F84","mm",1e3],["angle","\u4E0E\u6C34\u5E73\u9762\u5939\u89D2","\xB0",1],["roughness","\u7BA1\u58C1\u7C97\u7CD9\u5EA6","mm",1e3]],at=["\u4E95\u6DF1 / m","\u4E95\u6BB5","\u538B\u529B / MPa","\u6E29\u5EA6 / K","\u5BC6\u5EA6 / kg\xB7m\u207B\xB3","\u6D41\u901F / m\xB7s\u207B\xB9","\u6469\u963B / kPa\xB7m\u207B\xB9","\u91CD\u529B / kPa\xB7m\u207B\xB9"],mt=0,St=k.segments.map(L=>{let X=[L.name,nt(mt,1),nt(L.end,1),nt(L.diameter*1e3,2),nt(L.angle,1),nt(L.roughness*1e3,4)];return mt=L.end,X});return S.createElement("main",{className:"wp-app"},S.createElement("style",null,de),S.createElement("div",{className:"wp-shell"},S.createElement("header",{className:"wp-top"},S.createElement("div",{className:"wp-brand"},S.createElement("div",{className:"wp-logo","aria-hidden":"true"},"\u21A7"),S.createElement("div",null,S.createElement("div",{className:"wp-eyebrow"},"UGSCI \xB7 WELLBORE WORKBENCH"),S.createElement("h1",null,"\u4E95\u7B52\u538B\u529B\u8BA1\u7B97"),S.createElement("div",{className:"wp-sub"},"\u914D\u7F6E\u4E95\u7B52\u4E0E\u4E95\u8EAB\u7ED3\u6784\uFF0C\u67E5\u770B\u6CBF\u4E95\u6DF1\u7684\u6D41\u52A8\u53D8\u5316"))),S.createElement("div",{className:"wp-toolbar"},S.createElement("span",{className:"wp-badge"},"\u672C\u5730\u8BA1\u7B97"),S.createElement("button",{onClick:()=>rt.current.click()},"\u8F7D\u5165\u65B9\u6848"),S.createElement("button",{disabled:ot,onClick:N},"\u4FDD\u5B58\u65B9\u6848"),S.createElement("input",{className:"wp-hidden",type:"file",ref:rt,accept:".json,application/json",onChange:w,"aria-label":"\u8F7D\u5165\u8BA1\u7B97\u65B9\u6848\u6587\u4EF6"}))),(Z||y||ot)&&S.createElement("div",{className:`wp-notice ${Z?"wp-error":ot?"wp-stale":""}`,role:Z?"alert":"status"},Z||(ot?"\u53C2\u6570\u6216\u7ED3\u6784\u5DF2\u4FEE\u6539\uFF0C\u53F3\u4FA7\u4FDD\u7559\u4E0A\u6B21\u7ED3\u679C\u3002\u70B9\u51FB\u8BA1\u7B97\u66F4\u65B0\u3002":y)),S.createElement("div",{className:"wp-layout"},S.createElement("aside",{className:"wp-left"},S.createElement("section",{className:"wp-panel","aria-label":"\u4E95\u7B52\u53C2\u6570\u8BBE\u7F6E"},S.createElement("div",{className:"wp-panel-head"},S.createElement("h2",null,S.createElement("span",{className:"wp-index"},"01 / "),"\u4E95\u7B52\u53C2\u6570"),S.createElement("button",{className:"wp-link",onClick:ut},"\u6062\u590D\u793A\u4F8B")),S.createElement("form",{ref:et,className:"wp-form",onSubmit:ht,noValidate:!0},S.createElement("label",{className:"wp-field"},S.createElement("span",{className:"wp-field-title"},"\u8BA1\u7B97\u6A21\u578B"),S.createElement("select",{"aria-label":"\u8BA1\u7B97\u6A21\u578B",value:u,onChange:L=>{s(L.target.value),it()}},vt.map(L=>S.createElement("option",{key:L},L)))),S.createElement("label",{className:"wp-field"},S.createElement("span",{className:"wp-field-title"},"\u8BA1\u7B97\u7CBE\u5EA6"),S.createElement("select",{"aria-label":"\u7F51\u683C\u6A21\u5F0F",value:i,onChange:L=>{n(Number(L.target.value)),it()}},S.createElement("option",{value:"1"},"\u6807\u51C6\u7F51\u683C"),S.createElement("option",{value:"2"},"\u52A0\u5BC6\u7F51\u683C\uFF082\u500D\uFF09"))),xt.filter(([L])=>!["diameter","roughness","angle"].includes(L)).map(([L,X,K,gt,_t])=>S.createElement(Nt,{key:L,label:L==="depth"?"\u603B\u4E95\u6DF1\uFF08\u6D4B\u6DF1\uFF09":X,unit:K,name:L,value:e[L],error:pt[L],min:gt,max:_t,onChange:bt=>lt(L,bt)})),S.createElement("div",{className:"wp-field"},S.createElement("div",{className:"wp-field-title"},"\u6E29\u5EA6\u6362\u7B97",S.createElement("span",{className:"wp-unit"},"\xB0C")),S.createElement("div",{style:{padding:"7px 0",color:"#7b91a6"}},Number.isFinite(e.temperature)?nt(e.temperature-273.15,2):"\u2014"," ","\xB0C")),S.createElement("div",{className:"wp-wide wp-calc-footer"},S.createElement("span",{className:"wp-hint"},"\u7EDD\u5BF9\u538B\u529B \xB7 \u5355\u6C14\u76F8\u91C7\u6C14",S.createElement("br",null),"\u6BCF\u6B21\u8BA1\u7B97\u540C\u65F6\u6267\u884C\u7F51\u683C\u52A0\u5BC6\u68C0\u67E5"),S.createElement("button",{type:"submit",className:"wp-primary"},"\u8BA1\u7B97\u4E95\u7B52\u538B\u529B ",S.createElement("span",{"aria-hidden":"true"},"\u2192"))))),S.createElement("section",{className:"wp-panel wp-structure","aria-label":"\u4E95\u8EAB\u7ED3\u6784\u8BBE\u7F6E"},S.createElement("div",{className:"wp-panel-head"},S.createElement("h2",null,S.createElement("span",{className:"wp-index"},"02 / "),"\u4E95\u8EAB\u7ED3\u6784"),S.createElement("span",{className:"wp-sub"},_==="segmented"?f.length:1," \u4E2A\u4E95\u6BB5")),S.createElement("div",{className:"wp-structure-tools"},S.createElement("div",{className:"wp-modes","aria-label":"\u4E95\u8EAB\u7ED3\u6784\u6A21\u5F0F"},S.createElement("button",{"aria-pressed":_==="uniform",onClick:()=>wt("uniform")},"\u7EDF\u4E00\u4E95\u7B52"),S.createElement("button",{"aria-pressed":_==="segmented",onClick:()=>wt("segmented")},"\u5206\u6BB5\u7ED3\u6784")),S.createElement("div",{className:"wp-toolbar"},S.createElement("button",{className:"wp-import",onClick:()=>$.current.click()},"\u5BFC\u5165\u7ED3\u6784"),S.createElement("button",{className:"wp-link",onClick:z},"CSV\u6A21\u677F")),S.createElement("input",{className:"wp-hidden",type:"file",ref:$,accept:".csv,.json,text/csv,application/json",onChange:p,"aria-label":"\u5BFC\u5165\u4E95\u8EAB\u7ED3\u6784\u6587\u4EF6"})),S.createElement("div",{className:"wp-structure-content"},_==="uniform"?S.createElement(S.Fragment,null,S.createElement("div",{className:"wp-form"},dt.map(([L,X,K,gt])=>S.createElement(Nt,{key:L,label:X,unit:K,name:L,value:e[L],scale:gt,error:pt[L],onChange:_t=>lt(L,_t)}))),S.createElement("p",{className:"wp-hint",style:{marginTop:12}},"\u5168\u4E95\u91C7\u7528\u76F8\u540C\u5185\u5F84\u548C\u503E\u89D2\u3002\u5939\u89D2\u76F8\u5BF9\u6C34\u5E73\u9762\uFF0C\u5782\u76F4\u4E95\u4E3A90\xB0\u3002\u5207\u6362\u201C\u5206\u6BB5\u7ED3\u6784\u201D\u53EF\u8BBE\u7F6E\u4E0D\u540C\u4E95\u6BB5\u3002")):S.createElement(S.Fragment,null,f.map((L,X)=>S.createElement("div",{className:"wp-segment",key:X},S.createElement("div",{className:"wp-segment-head"},S.createElement("span",{className:"wp-index"},String(X+1).padStart(2,"0")),S.createElement("input",{"aria-label":`\u7B2C${X+1}\u6BB5\u540D\u79F0`,maxLength:30,value:L.name,onChange:K=>ct(X,"name",K.target.value)}),S.createElement("span",{className:"wp-unit"},nt(X?f[X-1].end:0,1)," m \u8D77"),S.createElement("button",{disabled:f.length===1,"aria-label":`\u5220\u9664\u7B2C${X+1}\u6BB5`,onClick:()=>M(X)},"\xD7")),S.createElement("div",{className:"wp-segment-grid"},S.createElement(Nt,{label:`\u7B2C${X+1}\u6BB5\u7EC8\u70B9\u4E95\u6DF1`,unit:"m",value:L.end,onChange:K=>ct(X,"end",K)}),S.createElement(Nt,{label:`\u7B2C${X+1}\u6BB5\u5185\u5F84`,unit:"mm",scale:1e3,value:L.diameter,onChange:K=>ct(X,"diameter",K)}),S.createElement(Nt,{label:`\u7B2C${X+1}\u6BB5\u5939\u89D2`,unit:"\xB0",value:L.angle,onChange:K=>ct(X,"angle",K)}),S.createElement(Nt,{label:`\u7B2C${X+1}\u6BB5\u7C97\u7CD9\u5EA6`,unit:"mm",scale:1e3,value:L.roughness,onChange:K=>ct(X,"roughness",K)})))),S.createElement("button",{className:"wp-add",onClick:t,disabled:f.length>=30},"\uFF0B \u6DFB\u52A0\u4E95\u6BB5"),S.createElement("p",{className:"wp-hint",style:{marginTop:9}},"\u6309\u6D4B\u6DF1\u4ECE\u6D45\u5230\u6DF1\u8FDE\u7EED\u6392\u5217\uFF0C\u6700\u540E\u7EC8\u70B9\u7B49\u4E8E\u603B\u4E95\u6DF1\u3002\u7ED3\u6784\u6539\u53D8\u540E\u8BF7\u91CD\u65B0\u8BA1\u7B97\u3002"))),S.createElement("div",{className:"wp-structure-footer"},S.createElement("span",{className:"wp-small"},"CSV / JSON \xB7 \u6700\u591A30\u6BB5"),S.createElement("button",{className:"wp-link",onClick:O},"\u586B\u5165\u4E09\u6BB5\u793A\u4F8B")))),S.createElement("section",{className:"wp-panel wp-visual","aria-label":"\u4E95\u7B52\u53EF\u89C6\u5316\u89C6\u56FE"},S.createElement("div",{className:"wp-visual-head"},S.createElement("div",null,S.createElement("h2",null,"\u4E95\u7B52\u53EF\u89C6\u5316"),S.createElement("div",{className:"wp-sub"},k.model," \xB7 ",k.segments.length," \u4E2A\u4E95\u6BB5 \xB7"," ",k.steps.toLocaleString()," \u4E2A\u7F51\u683C")),S.createElement("div",{className:"wp-toolbar"},S.createElement("span",{className:`wp-badge ${ot?"wp-stale":""}`},S.createElement("i",{className:"wp-live"}),ot?"\u5F85\u66F4\u65B0":"\u8BA1\u7B97\u5DF2\u540C\u6B65"),S.createElement("button",{disabled:ot||Q,onClick:j},Q?"\u6B63\u5728\u5BFC\u51FA\u2026":"\u5BFC\u51FA Excel"))),S.createElement("div",{className:"wp-summary"},S.createElement("div",{className:"wp-stat"},S.createElement("div",{className:"wp-stat-label"},"\u4E95\u5E95\u6D41\u538B"),S.createElement("div",{className:"wp-stat-value","data-testid":"bottom-pressure"},nt(k.bottom),S.createElement("span",{className:"wp-stat-unit"},"MPa")),S.createElement("div",{className:"wp-stat-note"},"\u4E95\u5E95 ",nt(k.params.depth,0)," m")),S.createElement("div",{className:"wp-stat"},S.createElement("div",{className:"wp-stat-label"},"\u4E95\u5E95\uFF0D\u4E95\u53E3\u538B\u5DEE"),S.createElement("div",{className:"wp-stat-value"},nt(q),S.createElement("span",{className:"wp-stat-unit"},"MPa")),S.createElement("div",{className:"wp-stat-note"},"\u4E95\u53E3 ",nt(k.params.pressure,2)," MPa")),S.createElement("div",{className:"wp-stat"},S.createElement("div",{className:"wp-stat-label"},"\u6469\u963B / \u603B\u538B\u5DEE"),S.createElement("div",{className:"wp-stat-value"},nt(k.friction/(k.friction+k.gravity)*100,1),S.createElement("span",{className:"wp-stat-unit"},"%")),S.createElement("div",{className:"wp-stat-note"},"\u6469\u963B ",nt(k.friction,3)," MPa"))),S.createElement("div",{className:"wp-tabs-row"},S.createElement("div",{className:"wp-tabs",role:"tablist","aria-label":"\u53EF\u89C6\u5316\u89C6\u56FE\u5207\u6362"},S.createElement("button",{id:"wp-chart-tab",className:"wp-tab",role:"tab","aria-selected":h==="chart","aria-controls":"wp-result-view",onClick:()=>d("chart")},"\u56FE\u8868\u89C6\u56FE"),S.createElement("button",{id:"wp-table-tab",className:"wp-tab",role:"tab","aria-selected":h==="table","aria-controls":"wp-result-view",onClick:()=>d("table")},"\u6570\u636E\u8868")),S.createElement("div",{className:"wp-toolbar"},h==="chart"?S.createElement(S.Fragment,null,S.createElement("label",{className:"wp-check"},S.createElement("input",{type:"checkbox",checked:D,onChange:L=>B(L.target.checked)}),"\u6A21\u578B\u5BF9\u6BD4"),S.createElement("select",{className:"wp-head-select","aria-label":"\u66F2\u7EBF\u6307\u6807",value:g,onChange:L=>x(L.target.value)},S.createElement("option",{value:"pressure"},"\u538B\u529B / MPa"),S.createElement("option",{value:"temperature"},"\u6E29\u5EA6 / K"),S.createElement("option",{value:"velocity"},"\u6D41\u901F / m\xB7s\u207B\xB9"))):S.createElement(S.Fragment,null,S.createElement("select",{className:"wp-head-select","aria-label":"\u6570\u636E\u8868\u7C7B\u578B",value:C,onChange:L=>E(L.target.value)},S.createElement("option",{value:"profile"},"\u6CBF\u4E95\u6DF1\u5256\u9762"),S.createElement("option",{value:"structure"},"\u4E95\u6BB5\u53C2\u6570"),S.createElement("option",{value:"baseline"},"\u5DE5\u51B5\u5BF9\u6BD4")),S.createElement("button",{disabled:ot||C==="baseline"&&!P,onClick:W},"\u5BFC\u51FACSV")),S.createElement("select",{className:"wp-head-select","aria-label":"\u91C7\u6837\u95F4\u9694",value:l,onChange:L=>b(Number(L.target.value))},Ut.map(L=>S.createElement("option",{key:L,value:L},L," m\u91C7\u6837"))))),S.createElement("div",{id:"wp-result-view",className:"wp-content",role:"tabpanel","aria-labelledby":h==="chart"?"wp-chart-tab":"wp-table-tab"},h==="chart"?S.createElement("div",{className:"wp-graph"},S.createElement(Ie,{segments:k.segments,depth:k.params.depth}),S.createElement("div",{className:"wp-plot"},S.createElement(Vt,{key:JSON.stringify(k.params)+JSON.stringify(k.segments)+k.steps+g+k.model,result:k,comparison:R,compare:D,metric:g,interval:l,disabled:ot}))):C==="profile"?S.createElement(Kt,{headers:at,rows:k.samples.map(L=>[nt(L[0],1),k.segments[Bt(k.segments,L[0])].name,...L.slice(1).map((X,K)=>nt(X,K===1?2:4))])}):C==="structure"?S.createElement(Kt,{headers:["\u4E95\u6BB5","\u8D77\u70B9 / m","\u7EC8\u70B9 / m","\u5185\u5F84 / mm","\u5939\u89D2 / \xB0","\u7C97\u7CD9\u5EA6 / mm"],rows:St}):P?S.createElement(Kt,{headers:["\u6BD4\u8F83\u9879\u76EE","\u56FA\u5B9A\u57FA\u51C6","\u5F53\u524D\u7ED3\u679C","\u53D8\u5316"],rows:[["\u4E95\u5E95\u538B\u529B / MPa",nt(P.bottom),nt(k.bottom),nt(k.bottom-P.bottom)],["\u6469\u963B\u538B\u5DEE / MPa",nt(P.friction),nt(k.friction),nt(k.friction-P.friction)],["\u6A21\u578B",P.model,k.model,"\u2014"],["\u4E95\u8EAB\u7ED3\u6784",`${P.segments.length} \u6BB5`,`${k.segments.length} \u6BB5`,tt?"\u5DF2\u6539\u53D8":"\u76F8\u540C"],["\u7F51\u683C\u6570",P.steps,k.steps,k.steps-P.steps],...V.map(L=>[L.label+" / "+L.unit,nt(L.before),nt(L.after),nt(L.after-L.before)])]}):S.createElement("div",{className:"wp-table-empty"},S.createElement("strong",null,"\u5C1A\u672A\u56FA\u5B9A\u5BF9\u6BD4\u5DE5\u51B5"),S.createElement("p",null,"\u5148\u56FA\u5B9A\u5F53\u524D\u7ED3\u679C\uFF0C\u518D\u4FEE\u6539\u53C2\u6570\u6216\u4E95\u8EAB\u7ED3\u6784\u5E76\u8BA1\u7B97\u3002"),S.createElement("button",{disabled:ot,onClick:H},"\u56FA\u5B9A\u5F53\u524D\u5DE5\u51B5"))),S.createElement("div",{className:"wp-visual-footer"},S.createElement("div",{className:"wp-quality-line"},S.createElement("span",null,Y.relativePercent<=.1?"\u2713 \u7F51\u683C\u5DEE\u5F02\u8F83\u5C0F":"\u25B3 \u5EFA\u8BAE\u52A0\u5BC6\u7F51\u683C"," ","\xB7 \u538B\u529B\u5DEE ",nt(Y.difference,6)," MPa"," ",S.createElement("span",{className:"wp-unit"}," ","/ ",nt(Y.relativePercent,4),"%")),S.createElement("div",{className:"wp-toolbar"},S.createElement("button",{disabled:ot,onClick:H},P?"\u66FF\u6362\u5BF9\u6BD4\u57FA\u51C6":"\u56FA\u5B9A\u5F53\u524D\u5DE5\u51B5"),P&&S.createElement("button",{onClick:()=>T(null)},"\u6E05\u9664\u57FA\u51C6"))),S.createElement("details",{className:"wp-details"},S.createElement("summary",null,"\u8BA1\u7B97\u68C0\u67E5\u4E0E\u9002\u7528\u8303\u56F4"),S.createElement("p",null,"\u52A0\u5BC6\u81F3",Y.refinedSteps.toLocaleString(),"\u4E2A\u7F51\u683C\uFF0C\u4E95\u5E95\u538B\u529B",nt(Y.refinedBottom)," MPa\u3002\u6700\u5927\u8BA1\u7B97\u6D41\u901F",nt(k.maxVelocity,3)," ","m/s\u3002\u7F51\u683C\u68C0\u67E5\u8861\u91CF\u79BB\u6563\u8BEF\u5DEE\uFF0C0.1%\u4E3A\u52A0\u5BC6\u63D0\u793A\u9608\u503C\u3002",D&&`${R.model}\u4E95\u5E95\u538B\u529B${nt(R.bottom)} MPa\u3002`),S.createElement("p",null,"\u6CBF\u7528\u539F\u7A0B\u5E8F\u5355\u6C14\u76F8\u91C7\u6C14\u7B80\u5316\u6A21\u578B\uFF1A\u91CD\u529B\u4E0EDarcy\u6469\u963B\uFF1B\u5206\u6BB5\u5185\u5F84\u3001\u503E\u89D2\u548C\u7C97\u7CD9\u5EA6\u9010\u6BB5\u53C2\u4E0E\u79EF\u5206\uFF0C\u4E95\u6BB5\u754C\u9762\u4E3A\u7F51\u683C\u8282\u70B9\u3002\u4E95\u6DF1\u4E3A\u6D4B\u6DF1\uFF0C\u503E\u89D2\u76F8\u5BF9\u6C34\u5E73\uFF1B\u6E29\u5EA6\u6309\u6D4B\u6DF10.025 K/m\u9012\u589E\uFF1B\u6469\u5C14\u8D28\u91CF0.018 kg/mol\uFF0C\u5E38Z\uFF0C\u6807\u51B5101325 Pa / 293.15 K\u3002Beggs-Brill\u4E3A\u539F\u7A0B\u5E8F\u7684\u7B80\u5316\u6469\u963B\u4FEE\u6B63\u3002\u672A\u8BA1\u591A\u76F8\u6D41\u3001\u52A0\u901F\u9879\u3001\u7BA1\u5F84\u7A81\u53D8\u5C40\u90E8\u635F\u5931\u6216\u6CE8\u6C14\u65B9\u5411\u3002\u5F53\u524D\u4E95\u8EAB\u56FE\u5C55\u793A\u6D41\u52A8\u901A\u9053\u5185\u5F84\u3002\u57FA\u51C6\u4FDD\u7559\u4E8E\u5F53\u524D\u9875\u9762\uFF0CExcel\u5305\u542B\u4E24\u7EC4\u7ED3\u6784\u3002"))))),S.createElement("footer",{className:"wp-foot"},S.createElement("span",null,"UGSci / \u4E95\u7B52\u538B\u529B\u8BA1\u7B97 \xB7 v",Tt),S.createElement("span",null,"\u53C2\u6570\u4E0E\u4E95\u8EAB\u7ED3\u6784 \u2192 \u5206\u6BB5\u8BA1\u7B97 \u2192 \u53EF\u89C6\u5316\u5206\u6790 \xB7 \u5168\u90E8\u5728\u672C\u673A\u5B8C\u6210"))))}he.registerRoutes("wellbore-pressure",[{path:"/apps/wellbore-pressure",component:Oe,label:"\u4E95\u7B52\u538B\u529B\u8BA1\u7B97",icon:"\u21A7"}]);})();
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
