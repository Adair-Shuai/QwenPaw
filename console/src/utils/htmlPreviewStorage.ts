// ─────────────────────────────────────────────────────────────────────────────
// 模块级常量（避免每次渲染重新创建）
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 当 sandbox 不含 allow-same-origin 时，iframe 获得不透明 origin，
 * window.localStorage / sessionStorage / document.cookie 访问会抛
 * SecurityError，导致 HTML 内 JS 中断。
 *
 * 此脚本在任何业务 JS 之前执行，尝试访问原生 storage / cookie；
 * 若失败则用 Object.defineProperty 安装内存级 polyfill。
 *
 * polyfill 行为说明：
 * - localStorage / sessionStorage：内存级实现，数据不跨刷新持久化
 *   （对预览场景可接受；原生 API 在沙箱中同样不持久化）
 * - 不 polyfill document.cookie：该属性在 HTML 规范中为
 *   [LegacyUnforgeable]，某些浏览器拒绝 Object.defineProperty
 *   覆盖会抛 TypeError 导致脚本中断；Chrome/Edge 下访问返回空
 *   字符串不抛错，无需 polyfill
 */

export const STORAGE_POLYFILL =
  "<script>" +
  "(function(){" +
  "function makeStorage(){var s={};return{" +
  "getItem:function(k){return k in s?s[k]:null;}," +
  "setItem:function(k,v){s[k]=String(v);}," +
  "removeItem:function(k){delete s[k];}," +
  // clear() 重新赋值 s={}；由于所有方法共享同一闭包变量 s，
  // 其他方法会看到新的空对象（JavaScript 闭包按变量引用捕获）
  "clear:function(){s={};}," +
  "key:function(i){var ks=Object.keys(s);return i>=0&&i<ks.length?ks[i]:null;}," +
  "get length(){return Object.keys(s).length;}" +
  "};}" +
  // localStorage
  'try{window.localStorage.getItem("__p_test");}' +
  'catch(e){Object.defineProperty(window,"localStorage",{configurable:true,value:makeStorage()});}' +
  // sessionStorage
  'try{window.sessionStorage.getItem("__p_test");}' +
  'catch(e){Object.defineProperty(window,"sessionStorage",{configurable:true,value:makeStorage()});}' +
  "})();" +
  "</script>";
