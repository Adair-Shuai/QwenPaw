/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
var Of = function(t, e) {
  return Of = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(r, n) {
    r.__proto__ = n;
  } || function(r, n) {
    for (var i in n) Object.prototype.hasOwnProperty.call(n, i) && (r[i] = n[i]);
  }, Of(t, e);
};
function V(t, e) {
  if (typeof e != "function" && e !== null)
    throw new TypeError("Class extends value " + String(e) + " is not a constructor or null");
  Of(t, e);
  function r() {
    this.constructor = t;
  }
  t.prototype = e === null ? Object.create(e) : (r.prototype = e.prototype, new r());
}
var TS = /* @__PURE__ */ function() {
  function t() {
    this.firefox = !1, this.ie = !1, this.edge = !1, this.newEdge = !1, this.weChat = !1;
  }
  return t;
}(), xS = /* @__PURE__ */ function() {
  function t() {
    this.browser = new TS(), this.node = !1, this.wxa = !1, this.worker = !1, this.svgSupported = !1, this.touchEventsSupported = !1, this.pointerEventsSupported = !1, this.domSupported = !1, this.transformSupported = !1, this.transform3dSupported = !1, this.hasGlobalWindow = typeof window < "u";
  }
  return t;
}(), re = new xS();
typeof wx == "object" && typeof wx.getSystemInfoSync == "function" ? (re.wxa = !0, re.touchEventsSupported = !0) : typeof document > "u" && typeof self < "u" ? re.worker = !0 : !re.hasGlobalWindow || "Deno" in window || typeof navigator < "u" && typeof navigator.userAgent == "string" && navigator.userAgent.indexOf("Node.js") > -1 ? (re.node = !0, re.svgSupported = !0) : CS(navigator.userAgent, re);
function CS(t, e) {
  var r = e.browser, n = t.match(/Firefox\/([\d.]+)/), i = t.match(/MSIE\s([\d.]+)/) || t.match(/Trident\/.+?rv:(([\d.]+))/), a = t.match(/Edge?\/([\d.]+)/), o = /micromessenger/i.test(t);
  n && (r.firefox = !0, r.version = n[1]), i && (r.ie = !0, r.version = i[1]), a && (r.edge = !0, r.version = a[1], r.newEdge = +a[1].split(".")[0] > 18), o && (r.weChat = !0), e.svgSupported = typeof SVGRect < "u", e.touchEventsSupported = "ontouchstart" in window && !r.ie && !r.edge, e.pointerEventsSupported = "onpointerdown" in window && (r.edge || r.ie && +r.version >= 11);
  var s = e.domSupported = typeof document < "u";
  if (s) {
    var u = document.documentElement.style;
    e.transform3dSupported = (r.ie && "transition" in u || r.edge || "WebKitCSSMatrix" in window && "m11" in new WebKitCSSMatrix() || "MozPerspective" in u) && !("OTransition" in u), e.transformSupported = e.transform3dSupported || r.ie && +r.version >= 9;
  }
}
var Kh = 12, Xm = "sans-serif", gr = Kh + "px " + Xm, DS = 20, MS = 100, ES = "007LLmW'55;N0500LLLLLLLLLL00NNNLzWW\\\\WQb\\0FWLg\\bWb\\WQ\\WrWWQ000CL5LLFLL0LL**F*gLLLL5F0LF\\FFF5.5N";
function AS(t) {
  var e = {};
  if (typeof JSON > "u")
    return e;
  for (var r = 0; r < t.length; r++) {
    var n = String.fromCharCode(r + 32), i = (t.charCodeAt(r) - DS) / MS;
    e[n] = i;
  }
  return e;
}
var IS = AS(ES), Zt = {
  createCanvas: function() {
    return typeof document < "u" && document.createElement("canvas");
  },
  measureText: /* @__PURE__ */ function() {
    var t, e;
    return function(r, n) {
      if (!t) {
        var i = Zt.createCanvas();
        t = i && i.getContext("2d");
      }
      if (t)
        return e !== n && (e = t.font = n || gr), t.measureText(r);
      r = r || "", n = n || gr;
      var a = /((?:\d+)?\.?\d*)px/.exec(n), o = a && +a[1] || Kh, s = 0;
      if (n.indexOf("mono") >= 0)
        s = o * r.length;
      else
        for (var u = 0; u < r.length; u++) {
          var l = IS[r[u]];
          s += l == null ? o : l * o;
        }
      return { width: s };
    };
  }(),
  loadImage: function(t, e, r) {
    var n = new Image();
    return n.onload = e, n.onerror = r, n.src = t, n;
  },
  getTime: function() {
    return Date.now ? Date.now() : +/* @__PURE__ */ new Date();
  }
}, Zm = ki([
  "Function",
  "RegExp",
  "Date",
  "Error",
  "CanvasGradient",
  "CanvasPattern",
  "Image",
  "Canvas"
], function(t, e) {
  return t["[object " + e + "]"] = !0, t;
}, {}), $m = ki([
  "Int8",
  "Uint8",
  "Uint8Clamped",
  "Int16",
  "Uint16",
  "Int32",
  "Uint32",
  "Float32",
  "Float64"
], function(t, e) {
  return t["[object " + e + "Array]"] = !0, t;
}, {}), Ri = Object.prototype.toString, bu = Array.prototype, OS = bu.forEach, LS = bu.filter, Qh = bu.slice, PS = bu.map, Mv = function() {
}.constructor, bo = Mv ? Mv.prototype : null, jh = "__proto__", tl = 2311, NS = Math.pow(2, 53) - 1;
function qm() {
  return tl >= NS && (tl = 0), tl++;
}
function _i() {
  for (var t = [], e = 0; e < arguments.length; e++)
    t[e] = arguments[e];
  typeof console < "u" && console.error.apply(console, t);
}
function ae(t) {
  if (t == null || typeof t != "object")
    return t;
  var e = t, r = Ri.call(t);
  if (r === "[object Array]") {
    if (!Ta(t)) {
      e = [];
      for (var n = 0, i = t.length; n < i; n++)
        e[n] = ae(t[n]);
    }
  } else if ($m[r]) {
    if (!Ta(t)) {
      var a = t.constructor;
      if (a.from)
        e = a.from(t);
      else {
        e = new a(t.length);
        for (var n = 0, i = t.length; n < i; n++)
          e[n] = t[n];
      }
    }
  } else if (!Zm[r] && !Ta(t) && !Si(t)) {
    e = {};
    for (var o in t)
      t.hasOwnProperty(o) && o !== jh && (e[o] = ae(t[o]));
  }
  return e;
}
function Se(t, e, r) {
  if (!q(e) || !q(t))
    return r ? ae(e) : t;
  for (var n in e)
    if (e.hasOwnProperty(n) && n !== jh) {
      var i = t[n], a = e[n];
      q(a) && q(i) && !H(a) && !H(i) && !Si(a) && !Si(i) && !Ev(a) && !Ev(i) && !Ta(a) && !Ta(i) ? Se(i, a, r) : (r || !(n in t)) && (t[n] = ae(e[n]));
    }
  return t;
}
function R(t, e) {
  if (Object.assign)
    Object.assign(t, e);
  else
    for (var r in e)
      e.hasOwnProperty(r) && r !== jh && (t[r] = e[r]);
  return t;
}
function RS(t, e, r) {
  t = t || {};
  for (var n = 0; n < r.length; n++) {
    var i = r[n];
    t[i] = e[i];
  }
  return t;
}
function ge(t, e, r) {
  for (var n = le(e), i = 0, a = n.length; i < a; i++) {
    var o = n[i];
    t[o] == null && (t[o] = e[o]);
  }
  return t;
}
function fe(t, e) {
  if (t) {
    if (t.indexOf)
      return t.indexOf(e);
    for (var r = 0, n = t.length; r < n; r++)
      if (t[r] === e)
        return r;
  }
  return -1;
}
function kS(t, e) {
  var r = t.prototype;
  function n() {
  }
  n.prototype = e.prototype, t.prototype = new n();
  for (var i in r)
    r.hasOwnProperty(i) && (t.prototype[i] = r[i]);
  t.prototype.constructor = t, t.superClass = e;
}
function ir(t, e, r) {
  if (t = "prototype" in t ? t.prototype : t, e = "prototype" in e ? e.prototype : e, Object.getOwnPropertyNames)
    for (var n = Object.getOwnPropertyNames(e), i = 0; i < n.length; i++) {
      var a = n[i];
      a !== "constructor" && t[a] == null && (t[a] = e[a]);
    }
  else
    ge(t, e);
}
function ot(t) {
  return !t || typeof t == "string" ? !1 : typeof t.length == "number";
}
function x(t, e, r) {
  if (t && e)
    if (t.forEach && t.forEach === OS)
      t.forEach(e, r);
    else if (t.length === +t.length)
      for (var n = 0, i = t.length; n < i; n++)
        e.call(r, t[n], n, t);
    else
      for (var a in t)
        t.hasOwnProperty(a) && e.call(r, t[a], a, t);
}
function X(t, e, r) {
  if (!t)
    return [];
  if (!e)
    return ec(t);
  if (t.map && t.map === PS)
    return t.map(e, r);
  for (var n = [], i = 0, a = t.length; i < a; i++)
    n.push(e.call(r, t[i], i, t));
  return n;
}
function ki(t, e, r, n) {
  if (t && e) {
    for (var i = 0, a = t.length; i < a; i++)
      r = e.call(n, r, t[i], i, t);
    return r;
  }
}
function He(t, e, r) {
  if (!t)
    return [];
  if (!e)
    return ec(t);
  if (t.filter && t.filter === LS)
    return t.filter(e, r);
  for (var n = [], i = 0, a = t.length; i < a; i++)
    e.call(r, t[i], i, t) && n.push(t[i]);
  return n;
}
function BS(t, e, r) {
  if (t && e) {
    for (var n = 0, i = t.length; n < i; n++)
      if (e.call(r, t[n], n, t))
        return t[n];
  }
}
function le(t) {
  if (!t)
    return [];
  if (Object.keys)
    return Object.keys(t);
  var e = [];
  for (var r in t)
    t.hasOwnProperty(r) && e.push(r);
  return e;
}
function VS(t, e) {
  for (var r = [], n = 2; n < arguments.length; n++)
    r[n - 2] = arguments[n];
  return function() {
    return t.apply(e, r.concat(Qh.call(arguments)));
  };
}
var te = bo && Q(bo.bind) ? bo.call.bind(bo.bind) : VS;
function Ae(t) {
  for (var e = [], r = 1; r < arguments.length; r++)
    e[r - 1] = arguments[r];
  return function() {
    return t.apply(this, e.concat(Qh.call(arguments)));
  };
}
function H(t) {
  return Array.isArray ? Array.isArray(t) : Ri.call(t) === "[object Array]";
}
function Q(t) {
  return typeof t == "function";
}
function z(t) {
  return typeof t == "string";
}
function As(t) {
  return Ri.call(t) === "[object String]";
}
function Te(t) {
  return typeof t == "number";
}
function q(t) {
  var e = typeof t;
  return e === "function" || !!t && e === "object";
}
function Ev(t) {
  return !!Zm[Ri.call(t)];
}
function je(t) {
  return !!$m[Ri.call(t)];
}
function Si(t) {
  return typeof t == "object" && typeof t.nodeType == "number" && typeof t.ownerDocument == "object";
}
function Jh(t) {
  return t.colorStops != null;
}
function FS(t) {
  return Ri.call(t) === "[object RegExp]";
}
function bi(t) {
  return t !== t;
}
function wi() {
  for (var t = [], e = 0; e < arguments.length; e++)
    t[e] = arguments[e];
  for (var r = 0, n = t.length; r < n; r++)
    if (t[r] != null)
      return t[r];
}
function W(t, e) {
  return t ?? e;
}
function Rr(t, e, r) {
  return t ?? e ?? r;
}
function ec(t) {
  for (var e = [], r = 1; r < arguments.length; r++)
    e[r - 1] = arguments[r];
  return Qh.apply(t, e);
}
function tc(t) {
  if (typeof t == "number")
    return [t, t, t, t];
  var e = t.length;
  return e === 2 ? [t[0], t[1], t[0], t[1]] : e === 3 ? [t[0], t[1], t[2], t[1]] : t;
}
function N(t, e) {
  if (!t)
    throw new Error(e);
}
function Yt(t) {
  return t == null ? null : typeof t.trim == "function" ? t.trim() : t.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
}
var Km = "__ec_primitive__";
function Lf(t) {
  t[Km] = !0;
}
function Ta(t) {
  return t[Km];
}
var zS = function() {
  function t() {
    this.data = {};
  }
  return t.prototype.delete = function(e) {
    var r = this.has(e);
    return r && delete this.data[e], r;
  }, t.prototype.has = function(e) {
    return this.data.hasOwnProperty(e);
  }, t.prototype.get = function(e) {
    return this.data[e];
  }, t.prototype.set = function(e, r) {
    return this.data[e] = r, this;
  }, t.prototype.keys = function() {
    return le(this.data);
  }, t.prototype.forEach = function(e) {
    var r = this.data;
    for (var n in r)
      r.hasOwnProperty(n) && e(r[n], n);
  }, t;
}(), Qm = typeof Map == "function";
function HS() {
  return Qm ? /* @__PURE__ */ new Map() : new zS();
}
var GS = function() {
  function t(e) {
    var r = H(e);
    this.data = HS();
    var n = this;
    e instanceof t ? e.each(i) : e && x(e, i);
    function i(a, o) {
      r ? n.set(a, o) : n.set(o, a);
    }
  }
  return t.prototype.hasKey = function(e) {
    return this.data.has(e);
  }, t.prototype.get = function(e) {
    return this.data.get(e);
  }, t.prototype.set = function(e, r) {
    return this.data.set(e, r), r;
  }, t.prototype.each = function(e, r) {
    this.data.forEach(function(n, i) {
      e.call(r, n, i);
    });
  }, t.prototype.keys = function() {
    var e = this.data.keys();
    return Qm ? Array.from(e) : e;
  }, t.prototype.removeKey = function(e) {
    this.data.delete(e);
  }, t;
}();
function Z(t) {
  return new GS(t);
}
function US(t, e) {
  for (var r = new t.constructor(t.length + e.length), n = 0; n < t.length; n++)
    r[n] = t[n];
  for (var i = t.length, n = 0; n < e.length; n++)
    r[n + i] = e[n];
  return r;
}
function wu(t, e) {
  var r;
  if (Object.create)
    r = Object.create(t);
  else {
    var n = function() {
    };
    n.prototype = t, r = new n();
  }
  return e && R(r, e), r;
}
function at(t, e) {
  return t.hasOwnProperty(e);
}
function Fe() {
}
var us = 180 / Math.PI;
function Bi(t, e) {
  return t == null && (t = 0), e == null && (e = 0), [t, e];
}
function WS(t) {
  return [t[0], t[1]];
}
function rl(t, e, r) {
  return t[0] = e, t[1] = r, t;
}
function Av(t, e, r) {
  return t[0] = e[0] + r[0], t[1] = e[1] + r[1], t;
}
function YS(t, e, r) {
  return t[0] = e[0] - r[0], t[1] = e[1] - r[1], t;
}
function XS(t) {
  return Math.sqrt(ZS(t));
}
function ZS(t) {
  return t[0] * t[0] + t[1] * t[1];
}
function nl(t, e, r) {
  return t[0] = e[0] * r, t[1] = e[1] * r, t;
}
function $S(t, e) {
  var r = XS(e);
  return r === 0 ? (t[0] = 0, t[1] = 0) : (t[0] = e[0] / r, t[1] = e[1] / r), t;
}
function Pf(t, e) {
  return Math.sqrt((t[0] - e[0]) * (t[0] - e[0]) + (t[1] - e[1]) * (t[1] - e[1]));
}
var qS = Pf;
function KS(t, e) {
  return (t[0] - e[0]) * (t[0] - e[0]) + (t[1] - e[1]) * (t[1] - e[1]);
}
var pi = KS;
function Ct(t, e, r) {
  var n = e[0], i = e[1];
  return t[0] = r[0] * n + r[2] * i + r[4], t[1] = r[1] * n + r[3] * i + r[5], t;
}
function ui(t, e, r) {
  return t[0] = Math.min(e[0], r[0]), t[1] = Math.min(e[1], r[1]), t;
}
function li(t, e, r) {
  return t[0] = Math.max(e[0], r[0]), t[1] = Math.max(e[1], r[1]), t;
}
var Hn = /* @__PURE__ */ function() {
  function t(e, r) {
    this.target = e, this.topTarget = r && r.topTarget;
  }
  return t;
}(), QS = function() {
  function t(e) {
    this.handler = e, e.on("mousedown", this._dragStart, this), e.on("mousemove", this._drag, this), e.on("mouseup", this._dragEnd, this);
  }
  return t.prototype._dragStart = function(e) {
    for (var r = e.target; r && !r.draggable; )
      r = r.parent || r.__hostTarget;
    r && (this._draggingTarget = r, r.dragging = !0, this._x = e.offsetX, this._y = e.offsetY, this.handler.dispatchToElement(new Hn(r, e), "dragstart", e.event));
  }, t.prototype._drag = function(e) {
    var r = this._draggingTarget;
    if (r) {
      var n = e.offsetX, i = e.offsetY, a = n - this._x, o = i - this._y;
      this._x = n, this._y = i, r.drift(a, o, e), this.handler.dispatchToElement(new Hn(r, e), "drag", e.event);
      var s = this.handler.findHover(n, i, r).target, u = this._dropTarget;
      this._dropTarget = s, r !== s && (u && s !== u && this.handler.dispatchToElement(new Hn(u, e), "dragleave", e.event), s && s !== u && this.handler.dispatchToElement(new Hn(s, e), "dragenter", e.event));
    }
  }, t.prototype._dragEnd = function(e) {
    var r = this._draggingTarget;
    r && (r.dragging = !1), this.handler.dispatchToElement(new Hn(r, e), "dragend", e.event), this._dropTarget && this.handler.dispatchToElement(new Hn(this._dropTarget, e), "drop", e.event), this._draggingTarget = null, this._dropTarget = null;
  }, t;
}(), ar = function() {
  function t(e) {
    e && (this._$eventProcessor = e);
  }
  return t.prototype.on = function(e, r, n, i) {
    this._$handlers || (this._$handlers = {});
    var a = this._$handlers;
    if (typeof r == "function" && (i = n, n = r, r = null), !n || !e)
      return this;
    var o = this._$eventProcessor;
    r != null && o && o.normalizeQuery && (r = o.normalizeQuery(r)), a[e] || (a[e] = []);
    for (var s = 0; s < a[e].length; s++)
      if (a[e][s].h === n)
        return this;
    var u = {
      h: n,
      query: r,
      ctx: i || this,
      callAtLast: n.zrEventfulCallAtLast
    }, l = a[e].length - 1, f = a[e][l];
    return f && f.callAtLast ? a[e].splice(l, 0, u) : a[e].push(u), this;
  }, t.prototype.isSilent = function(e) {
    var r = this._$handlers;
    return !r || !r[e] || !r[e].length;
  }, t.prototype.off = function(e, r) {
    var n = this._$handlers;
    if (!n)
      return this;
    if (!e)
      return this._$handlers = {}, this;
    if (r) {
      if (n[e]) {
        for (var i = [], a = 0, o = n[e].length; a < o; a++)
          n[e][a].h !== r && i.push(n[e][a]);
        n[e] = i;
      }
      n[e] && n[e].length === 0 && delete n[e];
    } else
      delete n[e];
    return this;
  }, t.prototype.trigger = function(e) {
    for (var r = [], n = 1; n < arguments.length; n++)
      r[n - 1] = arguments[n];
    if (!this._$handlers)
      return this;
    var i = this._$handlers[e], a = this._$eventProcessor;
    if (i)
      for (var o = r.length, s = i.length, u = 0; u < s; u++) {
        var l = i[u];
        if (!(a && a.filter && l.query != null && !a.filter(e, l.query)))
          switch (o) {
            case 0:
              l.h.call(l.ctx);
              break;
            case 1:
              l.h.call(l.ctx, r[0]);
              break;
            case 2:
              l.h.call(l.ctx, r[0], r[1]);
              break;
            default:
              l.h.apply(l.ctx, r);
              break;
          }
      }
    return a && a.afterTrigger && a.afterTrigger(e), this;
  }, t.prototype.triggerWithContext = function(e) {
    for (var r = [], n = 1; n < arguments.length; n++)
      r[n - 1] = arguments[n];
    if (!this._$handlers)
      return this;
    var i = this._$handlers[e], a = this._$eventProcessor;
    if (i)
      for (var o = r.length, s = r[o - 1], u = i.length, l = 0; l < u; l++) {
        var f = i[l];
        if (!(a && a.filter && f.query != null && !a.filter(e, f.query)))
          switch (o) {
            case 0:
              f.h.call(s);
              break;
            case 1:
              f.h.call(s, r[0]);
              break;
            case 2:
              f.h.call(s, r[0], r[1]);
              break;
            default:
              f.h.apply(s, r.slice(1, o - 1));
              break;
          }
      }
    return a && a.afterTrigger && a.afterTrigger(e), this;
  }, t;
}(), jS = Math.log(2);
function Nf(t, e, r, n, i, a) {
  var o = n + "-" + i, s = t.length;
  if (a.hasOwnProperty(o))
    return a[o];
  if (e === 1) {
    var u = Math.round(Math.log((1 << s) - 1 & ~i) / jS);
    return t[r][u];
  }
  for (var l = n | 1 << r, f = r + 1; n & 1 << f; )
    f++;
  for (var h = 0, c = 0, v = 0; c < s; c++) {
    var d = 1 << c;
    d & i || (h += (v % 2 ? -1 : 1) * t[r][c] * Nf(t, e - 1, f, l, i | d, a), v++);
  }
  return a[o] = h, h;
}
function Iv(t, e) {
  var r = [
    [t[0], t[1], 1, 0, 0, 0, -e[0] * t[0], -e[0] * t[1]],
    [0, 0, 0, t[0], t[1], 1, -e[1] * t[0], -e[1] * t[1]],
    [t[2], t[3], 1, 0, 0, 0, -e[2] * t[2], -e[2] * t[3]],
    [0, 0, 0, t[2], t[3], 1, -e[3] * t[2], -e[3] * t[3]],
    [t[4], t[5], 1, 0, 0, 0, -e[4] * t[4], -e[4] * t[5]],
    [0, 0, 0, t[4], t[5], 1, -e[5] * t[4], -e[5] * t[5]],
    [t[6], t[7], 1, 0, 0, 0, -e[6] * t[6], -e[6] * t[7]],
    [0, 0, 0, t[6], t[7], 1, -e[7] * t[6], -e[7] * t[7]]
  ], n = {}, i = Nf(r, 8, 0, 0, 0, n);
  if (i !== 0) {
    for (var a = [], o = 0; o < 8; o++)
      for (var s = 0; s < 8; s++)
        a[s] == null && (a[s] = 0), a[s] += ((o + s) % 2 ? -1 : 1) * Nf(r, 7, o === 0 ? 1 : 0, 1 << o, 1 << s, n) / i * e[o];
    return function(u, l, f) {
      var h = l * a[6] + f * a[7] + 1;
      u[0] = (l * a[0] + f * a[1] + a[2]) / h, u[1] = (l * a[3] + f * a[4] + a[5]) / h;
    };
  }
}
var Is = "___zrEVENTSAVED", il = [];
function JS(t, e, r, n, i) {
  return Rf(il, e, n, i, !0) && Rf(t, r, il[0], il[1]);
}
function eb(t, e) {
  t && r(t), e && r(e);
  function r(n) {
    var i = n[Is];
    i && (i.clearMarkers && i.clearMarkers(), delete n[Is]);
  }
}
function Rf(t, e, r, n, i) {
  if (e.getBoundingClientRect && re.domSupported && !jm(e)) {
    var a = e[Is] || (e[Is] = {}), o = tb(e, a), s = rb(o, a, i);
    if (s)
      return s(t, r, n), !0;
  }
  return !1;
}
function tb(t, e) {
  var r = e.markers;
  if (r)
    return r;
  r = e.markers = [];
  for (var n = ["left", "right"], i = ["top", "bottom"], a = 0; a < 4; a++) {
    var o = document.createElement("div"), s = o.style, u = a % 2, l = (a >> 1) % 2;
    s.cssText = [
      "position: absolute",
      "visibility: hidden",
      "padding: 0",
      "margin: 0",
      "border-width: 0",
      "user-select: none",
      "width:0",
      "height:0",
      n[u] + ":0",
      i[l] + ":0",
      n[1 - u] + ":auto",
      i[1 - l] + ":auto",
      ""
    ].join("!important;"), t.appendChild(o), r.push(o);
  }
  return e.clearMarkers = function() {
    x(r, function(f) {
      f.parentNode && f.parentNode.removeChild(f);
    });
  }, r;
}
function rb(t, e, r) {
  for (var n = r ? "invTrans" : "trans", i = e[n], a = e.srcCoords, o = [], s = [], u = !0, l = 0; l < 4; l++) {
    var f = t[l].getBoundingClientRect(), h = 2 * l, c = f.left, v = f.top;
    o.push(c, v), u = u && a && c === a[h] && v === a[h + 1], s.push(t[l].offsetLeft, t[l].offsetTop);
  }
  return u && i ? i : (e.srcCoords = o, e[n] = r ? Iv(s, o) : Iv(o, s));
}
function jm(t) {
  return t.nodeName.toUpperCase() === "CANVAS";
}
var nb = /([&<>"'])/g, ib = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};
function $e(t) {
  return t == null ? "" : (t + "").replace(nb, function(e, r) {
    return ib[r];
  });
}
var ab = /^(?:mouse|pointer|contextmenu|drag|drop)|click/, al = [], ob = re.browser.firefox && +re.browser.version.split(".")[0] < 39;
function kf(t, e, r, n) {
  return r = r || {}, n ? Ov(t, e, r) : ob && e.layerX != null && e.layerX !== e.offsetX ? (r.zrX = e.layerX, r.zrY = e.layerY) : e.offsetX != null ? (r.zrX = e.offsetX, r.zrY = e.offsetY) : Ov(t, e, r), r;
}
function Ov(t, e, r) {
  if (re.domSupported && t.getBoundingClientRect) {
    var n = e.clientX, i = e.clientY;
    if (jm(t)) {
      var a = t.getBoundingClientRect();
      r.zrX = n - a.left, r.zrY = i - a.top;
      return;
    } else if (Rf(al, t, n, i)) {
      r.zrX = al[0], r.zrY = al[1];
      return;
    }
  }
  r.zrX = r.zrY = 0;
}
function rc(t) {
  return t || window.event;
}
function pt(t, e, r) {
  if (e = rc(e), e.zrX != null)
    return e;
  var n = e.type, i = n && n.indexOf("touch") >= 0;
  if (i) {
    var o = n !== "touchend" ? e.targetTouches[0] : e.changedTouches[0];
    o && kf(t, o, e, r);
  } else {
    kf(t, e, e, r);
    var a = sb(e);
    e.zrDelta = a ? a / 120 : -(e.detail || 0) / 3;
  }
  var s = e.button;
  return e.which == null && s !== void 0 && ab.test(e.type) && (e.which = s & 1 ? 1 : s & 2 ? 3 : s & 4 ? 2 : 0), e;
}
function sb(t) {
  var e = t.wheelDelta;
  if (e)
    return e;
  var r = t.deltaX, n = t.deltaY;
  if (r == null || n == null)
    return e;
  var i = Math.abs(n !== 0 ? n : r), a = n > 0 ? -1 : n < 0 ? 1 : r > 0 ? -1 : 1;
  return 3 * i * a;
}
function ub(t, e, r, n) {
  t.addEventListener(e, r, n);
}
function lb(t, e, r, n) {
  t.removeEventListener(e, r, n);
}
var Ti = function(t) {
  t.preventDefault(), t.stopPropagation(), t.cancelBubble = !0;
};
function Lv(t) {
  return t.which === 2 || t.which === 3;
}
var fb = function() {
  function t() {
    this._track = [];
  }
  return t.prototype.recognize = function(e, r, n) {
    return this._doTrack(e, r, n), this._recognize(e);
  }, t.prototype.clear = function() {
    return this._track.length = 0, this;
  }, t.prototype._doTrack = function(e, r, n) {
    var i = e.touches;
    if (i) {
      for (var a = {
        points: [],
        touches: [],
        target: r,
        event: e
      }, o = 0, s = i.length; o < s; o++) {
        var u = i[o], l = kf(n, u, {});
        a.points.push([l.zrX, l.zrY]), a.touches.push(u);
      }
      this._track.push(a);
    }
  }, t.prototype._recognize = function(e) {
    for (var r in ol)
      if (ol.hasOwnProperty(r)) {
        var n = ol[r](this._track, e);
        if (n)
          return n;
      }
  }, t;
}();
function Pv(t) {
  var e = t[1][0] - t[0][0], r = t[1][1] - t[0][1];
  return Math.sqrt(e * e + r * r);
}
function hb(t) {
  return [
    (t[0][0] + t[1][0]) / 2,
    (t[0][1] + t[1][1]) / 2
  ];
}
var ol = {
  pinch: function(t, e) {
    var r = t.length;
    if (r) {
      var n = (t[r - 1] || {}).points, i = (t[r - 2] || {}).points || n;
      if (i && i.length > 1 && n && n.length > 1) {
        var a = Pv(n) / Pv(i);
        !isFinite(a) && (a = 1), e.pinchScale = a;
        var o = hb(n);
        return e.pinchX = o[0], e.pinchY = o[1], {
          type: "pinch",
          target: t[0].target,
          event: e
        };
      }
    }
  }
};
function $t() {
  return [1, 0, 0, 1, 0, 0];
}
function io(t) {
  return t[0] = 1, t[1] = 0, t[2] = 0, t[3] = 1, t[4] = 0, t[5] = 0, t;
}
function nc(t, e) {
  return t[0] = e[0], t[1] = e[1], t[2] = e[2], t[3] = e[3], t[4] = e[4], t[5] = e[5], t;
}
function xa(t, e, r) {
  var n = e[0] * r[0] + e[2] * r[1], i = e[1] * r[0] + e[3] * r[1], a = e[0] * r[2] + e[2] * r[3], o = e[1] * r[2] + e[3] * r[3], s = e[0] * r[4] + e[2] * r[5] + e[4], u = e[1] * r[4] + e[3] * r[5] + e[5];
  return t[0] = n, t[1] = i, t[2] = a, t[3] = o, t[4] = s, t[5] = u, t;
}
function Bf(t, e, r) {
  return t[0] = e[0], t[1] = e[1], t[2] = e[2], t[3] = e[3], t[4] = e[4] + r[0], t[5] = e[5] + r[1], t;
}
function ic(t, e, r, n) {
  n === void 0 && (n = [0, 0]);
  var i = e[0], a = e[2], o = e[4], s = e[1], u = e[3], l = e[5], f = Math.sin(r), h = Math.cos(r);
  return t[0] = i * h + s * f, t[1] = -i * f + s * h, t[2] = a * h + u * f, t[3] = -a * f + h * u, t[4] = h * (o - n[0]) + f * (l - n[1]) + n[0], t[5] = h * (l - n[1]) - f * (o - n[0]) + n[1], t;
}
function cb(t, e, r) {
  var n = r[0], i = r[1];
  return t[0] = e[0] * n, t[1] = e[1] * i, t[2] = e[2] * n, t[3] = e[3] * i, t[4] = e[4] * n, t[5] = e[5] * i, t;
}
function ao(t, e) {
  var r = e[0], n = e[2], i = e[4], a = e[1], o = e[3], s = e[5], u = r * o - a * n;
  return u ? (u = 1 / u, t[0] = o * u, t[1] = -a * u, t[2] = -n * u, t[3] = r * u, t[4] = (n * s - o * i) * u, t[5] = (a * i - r * s) * u, t) : null;
}
var _e = function() {
  function t(e, r) {
    this.x = e || 0, this.y = r || 0;
  }
  return t.prototype.copy = function(e) {
    return this.x = e.x, this.y = e.y, this;
  }, t.prototype.clone = function() {
    return new t(this.x, this.y);
  }, t.prototype.set = function(e, r) {
    return this.x = e, this.y = r, this;
  }, t.prototype.equal = function(e) {
    return e.x === this.x && e.y === this.y;
  }, t.prototype.add = function(e) {
    return this.x += e.x, this.y += e.y, this;
  }, t.prototype.scale = function(e) {
    this.x *= e, this.y *= e;
  }, t.prototype.scaleAndAdd = function(e, r) {
    this.x += e.x * r, this.y += e.y * r;
  }, t.prototype.sub = function(e) {
    return this.x -= e.x, this.y -= e.y, this;
  }, t.prototype.dot = function(e) {
    return this.x * e.x + this.y * e.y;
  }, t.prototype.len = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }, t.prototype.lenSquare = function() {
    return this.x * this.x + this.y * this.y;
  }, t.prototype.normalize = function() {
    var e = this.len();
    return this.x /= e, this.y /= e, this;
  }, t.prototype.distance = function(e) {
    var r = this.x - e.x, n = this.y - e.y;
    return Math.sqrt(r * r + n * n);
  }, t.prototype.distanceSquare = function(e) {
    var r = this.x - e.x, n = this.y - e.y;
    return r * r + n * n;
  }, t.prototype.negate = function() {
    return this.x = -this.x, this.y = -this.y, this;
  }, t.prototype.transform = function(e) {
    if (e) {
      var r = this.x, n = this.y;
      return this.x = e[0] * r + e[2] * n + e[4], this.y = e[1] * r + e[3] * n + e[5], this;
    }
  }, t.prototype.toArray = function(e) {
    return e[0] = this.x, e[1] = this.y, e;
  }, t.prototype.fromArray = function(e) {
    this.x = e[0], this.y = e[1];
  }, t.set = function(e, r, n) {
    e.x = r, e.y = n;
  }, t.copy = function(e, r) {
    e.x = r.x, e.y = r.y;
  }, t.len = function(e) {
    return Math.sqrt(e.x * e.x + e.y * e.y);
  }, t.lenSquare = function(e) {
    return e.x * e.x + e.y * e.y;
  }, t.dot = function(e, r) {
    return e.x * r.x + e.y * r.y;
  }, t.add = function(e, r, n) {
    e.x = r.x + n.x, e.y = r.y + n.y;
  }, t.sub = function(e, r, n) {
    e.x = r.x - n.x, e.y = r.y - n.y;
  }, t.scale = function(e, r, n) {
    e.x = r.x * n, e.y = r.y * n;
  }, t.scaleAndAdd = function(e, r, n, i) {
    e.x = r.x + n.x * i, e.y = r.y + n.y * i;
  }, t.lerp = function(e, r, n, i) {
    var a = 1 - i;
    e.x = a * r.x + i * n.x, e.y = a * r.y + i * n.y;
  }, t;
}(), xn = Math.min, fi = Math.max, Vf = Math.abs, Nv = ["x", "y"], vb = ["width", "height"], $r = new _e(), qr = new _e(), Kr = new _e(), Qr = new _e(), lt = Jm(), da = lt.minTv, Ff = lt.maxTv, Ca = [0, 0], ie = function() {
  function t(e, r, n, i) {
    sl(this, e, r, n, i);
  }
  return t.set = function(e, r, n, i, a) {
    return i < 0 && (r = r + i, i = -i), a < 0 && (n = n + a, a = -a), e.x = r, e.y = n, e.width = i, e.height = a, e;
  }, t.prototype.union = function(e) {
    var r = xn(e.x, this.x), n = xn(e.y, this.y);
    isFinite(this.x) && isFinite(this.width) ? this.width = fi(e.x + e.width, this.x + this.width) - r : this.width = e.width, isFinite(this.y) && isFinite(this.height) ? this.height = fi(e.y + e.height, this.y + this.height) - n : this.height = e.height, this.x = r, this.y = n;
  }, t.prototype.applyTransform = function(e) {
    t.applyTransform(this, this, e);
  }, t.prototype.calculateTransform = function(e) {
    return db($t(), this, e);
  }, t.prototype.intersect = function(e, r, n) {
    return t.intersect(this, e, r, n);
  }, t.intersect = function(e, r, n, i) {
    n && _e.set(n, 0, 0);
    var a = i && i.outIntersectRect || null, o = i && i.clamp;
    if (a && (a.x = a.y = a.width = a.height = NaN), !e || !r)
      return !1;
    e instanceof t || (e = sl(pb, e.x, e.y, e.width, e.height)), r instanceof t || (r = sl(gb, r.x, r.y, r.width, r.height));
    var s = !!n;
    lt.reset(i, s);
    var u = lt.touchThreshold, l = e.x + u, f = e.x + e.width - u, h = e.y + u, c = e.y + e.height - u, v = r.x + u, d = r.x + r.width - u, p = r.y + u, m = r.y + r.height - u;
    if (l > f || h > c || v > d || p > m)
      return !1;
    var g = !(f < v || d < l || c < p || m < h);
    return (s || a) && (Ca[0] = 1 / 0, Ca[1] = 0, kv(l, f, v, d, 0, s, a, o), kv(h, c, p, m, 1, s, a, o), s && _e.copy(n, g ? lt.useDir ? lt.dirMinTv : da : Ff)), g;
  }, t.contain = function(e, r, n) {
    return r >= e.x && r <= e.x + e.width && n >= e.y && n <= e.y + e.height;
  }, t.prototype.contain = function(e, r) {
    return t.contain(this, e, r);
  }, t.prototype.clone = function() {
    return new t(this.x, this.y, this.width, this.height);
  }, t.prototype.copy = function(e) {
    Rv(this, e);
  }, t.prototype.plain = function() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }, t.prototype.isFinite = function() {
    return isFinite(this.x) && isFinite(this.y) && isFinite(this.width) && isFinite(this.height);
  }, t.prototype.isZero = function() {
    return this.width === 0 || this.height === 0;
  }, t.create = function(e) {
    return new t(e ? e.x : 0, e ? e.y : 0, e ? e.width : 0, e ? e.height : 0);
  }, t.copy = function(e, r) {
    return e.x = r.x, e.y = r.y, e.width = r.width, e.height = r.height, e;
  }, t.applyTransform = function(e, r, n) {
    if (!n) {
      e !== r && Rv(e, r);
      return;
    }
    if (n[1] < 1e-5 && n[1] > -1e-5 && n[2] < 1e-5 && n[2] > -1e-5) {
      var i = n[0], a = n[3], o = n[4], s = n[5];
      e.x = r.x * i + o, e.y = r.y * a + s, e.width = r.width * i, e.height = r.height * a, e.width < 0 && (e.x += e.width, e.width = -e.width), e.height < 0 && (e.y += e.height, e.height = -e.height);
      return;
    }
    $r.x = Kr.x = r.x, $r.y = Qr.y = r.y, qr.x = Qr.x = r.x + r.width, qr.y = Kr.y = r.y + r.height, $r.transform(n), Qr.transform(n), qr.transform(n), Kr.transform(n), e.x = xn($r.x, qr.x, Kr.x, Qr.x), e.y = xn($r.y, qr.y, Kr.y, Qr.y);
    var u = fi($r.x, qr.x, Kr.x, Qr.x), l = fi($r.y, qr.y, Kr.y, Qr.y);
    e.width = u - e.x, e.height = l - e.y;
  }, t.calculateTransform = function(e, r, n) {
    var i = n.width / r.width, a = n.height / r.height;
    return e = io(e || []), Bf(e, e, rl(ul, -r.x, -r.y)), cb(e, e, rl(ul, i, a)), Bf(e, e, rl(ul, n.x, n.y)), e;
  }, t;
}();
ie.create;
var sl = ie.set, Rv = ie.copy, db = ie.calculateTransform;
ie.applyTransform;
ie.contain;
var pb = new ie(0, 0, 0, 0), gb = new ie(0, 0, 0, 0), ul = [];
function kv(t, e, r, n, i, a, o, s) {
  var u = Vf(e - r), l = Vf(n - t), f = xn(u, l), h = Nv[i], c = Nv[1 - i], v = vb[i];
  e < r || n < t ? u < l ? (a && (Ff[h] = -u), s && (o[h] = e, o[v] = 0)) : (a && (Ff[h] = l), s && (o[h] = t, o[v] = 0)) : (o && (o[h] = fi(t, r), o[v] = xn(e, n) - o[h]), a && (f < Ca[0] || lt.useDir) && (Ca[0] = xn(f, Ca[0]), (u < l || !lt.bidirectional) && (da[h] = u, da[c] = 0, lt.useDir && lt.calcDirMTV()), (u >= l || !lt.bidirectional) && (da[h] = -l, da[c] = 0, lt.useDir && lt.calcDirMTV())));
}
function Jm() {
  var t = 0, e = new _e(), r = new _e(), n = {
    minTv: new _e(),
    maxTv: new _e(),
    useDir: !1,
    dirMinTv: new _e(),
    touchThreshold: 0,
    bidirectional: !0,
    negativeSize: !1,
    reset: function(a, o) {
      n.touchThreshold = 0, a && a.touchThreshold != null && (n.touchThreshold = fi(0, a.touchThreshold)), n.negativeSize = !1, o && (n.minTv.set(1 / 0, 1 / 0), n.maxTv.set(0, 0), n.useDir = !1, a && a.direction != null && (n.useDir = !0, n.dirMinTv.copy(n.minTv), r.copy(n.minTv), t = a.direction, n.bidirectional = a.bidirectional == null || !!a.bidirectional, n.bidirectional || e.set(Math.cos(t), Math.sin(t))));
    },
    calcDirMTV: function() {
      var a = n.minTv, o = n.dirMinTv, s = a.y * a.y + a.x * a.x, u = Math.sin(t), l = Math.cos(t), f = u * a.y + l * a.x;
      if (i(f)) {
        i(a.x) && i(a.y) && o.set(0, 0);
        return;
      }
      if (r.x = s * l / f, r.y = s * u / f, i(r.x) && i(r.y)) {
        o.set(0, 0);
        return;
      }
      (n.bidirectional || e.dot(r) > 0) && r.len() < o.len() && o.copy(r);
    }
  };
  function i(a) {
    return Vf(a) < 1e-10;
  }
  return n;
}
var ey = "silent";
function mb(t, e, r) {
  return {
    type: t,
    event: r,
    target: e.target,
    topTarget: e.topTarget,
    cancelBubble: !1,
    offsetX: r.zrX,
    offsetY: r.zrY,
    gestureEvent: r.gestureEvent,
    pinchX: r.pinchX,
    pinchY: r.pinchY,
    pinchScale: r.pinchScale,
    wheelDelta: r.zrDelta,
    zrByTouch: r.zrByTouch,
    which: r.which,
    stop: yb
  };
}
function yb() {
  Ti(this.event);
}
var _b = function(t) {
  V(e, t);
  function e() {
    var r = t !== null && t.apply(this, arguments) || this;
    return r.handler = null, r;
  }
  return e.prototype.dispose = function() {
  }, e.prototype.setCursor = function() {
  }, e;
}(ar), Wi = /* @__PURE__ */ function() {
  function t(e, r) {
    this.x = e, this.y = r;
  }
  return t;
}(), Sb = [
  "click",
  "dblclick",
  "mousewheel",
  "mouseout",
  "mouseup",
  "mousedown",
  "mousemove",
  "contextmenu"
], ll = new ie(0, 0, 0, 0), ty = function(t) {
  V(e, t);
  function e(r, n, i, a, o) {
    var s = t.call(this) || this;
    return s._hovered = new Wi(0, 0), s.storage = r, s.painter = n, s.painterRoot = a, s._pointerSize = o, i = i || new _b(), s.proxy = null, s.setHandlerProxy(i), s._draggingMgr = new QS(s), s;
  }
  return e.prototype.setHandlerProxy = function(r) {
    this.proxy && this.proxy.dispose(), r && (x(Sb, function(n) {
      r.on && r.on(n, this[n], this);
    }, this), r.handler = this), this.proxy = r;
  }, e.prototype.mousemove = function(r) {
    var n = r.zrX, i = r.zrY, a = ry(this, n, i), o = this._hovered, s = o.target;
    s && !s.__zr && (o = this.findHover(o.x, o.y), s = o.target);
    var u = this._hovered = a ? new Wi(n, i) : this.findHover(n, i), l = u.target, f = this.proxy;
    f.setCursor && f.setCursor(l ? l.cursor : "default"), s && l !== s && this.dispatchToElement(o, "mouseout", r), this.dispatchToElement(u, "mousemove", r), l && l !== s && this.dispatchToElement(u, "mouseover", r);
  }, e.prototype.mouseout = function(r) {
    var n = r.zrEventControl;
    n !== "only_globalout" && this.dispatchToElement(this._hovered, "mouseout", r), n !== "no_globalout" && this.trigger("globalout", { type: "globalout", event: r });
  }, e.prototype.resize = function() {
    this._hovered = new Wi(0, 0);
  }, e.prototype.dispatch = function(r, n) {
    var i = this[r];
    i && i.call(this, n);
  }, e.prototype.dispose = function() {
    this.proxy.dispose(), this.storage = null, this.proxy = null, this.painter = null;
  }, e.prototype.setCursorStyle = function(r) {
    var n = this.proxy;
    n.setCursor && n.setCursor(r);
  }, e.prototype.dispatchToElement = function(r, n, i) {
    r = r || {};
    var a = r.target;
    if (!(a && a.silent)) {
      for (var o = "on" + n, s = mb(n, r, i); a && (a[o] && (s.cancelBubble = !!a[o].call(a, s)), a.trigger(n, s), a = a.__hostTarget ? a.__hostTarget : a.parent, !s.cancelBubble); )
        ;
      s.cancelBubble || (this.trigger(n, s), this.painter && this.painter.eachOtherLayer && this.painter.eachOtherLayer(function(u) {
        typeof u[o] == "function" && u[o].call(u, s), u.trigger && u.trigger(n, s);
      }));
    }
  }, e.prototype.findHover = function(r, n, i) {
    var a = this.storage.getDisplayList(), o = new Wi(r, n);
    if (Bv(a, o, r, n, i), this._pointerSize && !o.target) {
      for (var s = [], u = this._pointerSize, l = u / 2, f = new ie(r - l, n - l, u, u), h = a.length - 1; h >= 0; h--) {
        var c = a[h];
        c !== i && !c.ignore && !c.ignoreCoarsePointer && (!c.parent || !c.parent.ignoreCoarsePointer) && (ll.copy(c.getBoundingRect()), c.transform && ll.applyTransform(c.transform), ll.intersect(f) && s.push(c));
      }
      if (s.length)
        for (var v = 4, d = Math.PI / 12, p = Math.PI * 2, m = 0; m < l; m += v)
          for (var g = 0; g < p; g += d) {
            var y = r + m * Math.cos(g), _ = n + m * Math.sin(g);
            if (Bv(s, o, y, _, i), o.target)
              return o;
          }
    }
    return o;
  }, e.prototype.processGesture = function(r, n) {
    this._gestureMgr || (this._gestureMgr = new fb());
    var i = this._gestureMgr;
    n === "start" && i.clear();
    var a = i.recognize(r, this.findHover(r.zrX, r.zrY, null).target, this.proxy.dom);
    if (n === "end" && i.clear(), a) {
      var o = a.type;
      r.gestureEvent = o;
      var s = new Wi();
      s.target = a.target, this.dispatchToElement(s, o, a.event);
    }
  }, e;
}(ar);
x(["click", "mousedown", "mouseup", "mousewheel", "dblclick", "contextmenu"], function(t) {
  ty.prototype[t] = function(e) {
    var r = e.zrX, n = e.zrY, i = ry(this, r, n), a, o;
    if ((t !== "mouseup" || !i) && (a = this.findHover(r, n), o = a.target), t === "mousedown")
      this._downEl = o, this._downPoint = [e.zrX, e.zrY], this._upEl = o;
    else if (t === "mouseup")
      this._upEl = o;
    else if (t === "click") {
      if (this._downEl !== this._upEl || !this._downPoint || qS(this._downPoint, [e.zrX, e.zrY]) > 4)
        return;
      this._downPoint = null;
    }
    this.dispatchToElement(a, t, e);
  };
});
function bb(t, e, r) {
  if (t[t.rectHover ? "rectContain" : "contain"](e, r)) {
    for (var n = t, i = void 0, a = !1; n; ) {
      if (n.ignoreClip && (a = !0), !a) {
        var o = n.getClipPath();
        if (o && !o.contain(e, r))
          return !1;
      }
      n.silent && (i = !0);
      var s = n.__hostTarget;
      n = s ? n.ignoreHostSilent ? null : s : n.parent;
    }
    return i ? ey : !0;
  }
  return !1;
}
function Bv(t, e, r, n, i) {
  for (var a = t.length - 1; a >= 0; a--) {
    var o = t[a], s = void 0;
    if (o !== i && !o.ignore && (s = bb(o, r, n)) && (!e.topTarget && (e.topTarget = o), s !== ey)) {
      e.target = o;
      break;
    }
  }
}
function ry(t, e, r) {
  var n = t.painter;
  return e < 0 || e > n.getWidth() || r < 0 || r > n.getHeight();
}
var ny = 32, Yi = 7;
function wb(t) {
  for (var e = 0; t >= ny; )
    e |= t & 1, t >>= 1;
  return t + e;
}
function Vv(t, e, r, n) {
  var i = e + 1;
  if (i === r)
    return 1;
  if (n(t[i++], t[e]) < 0) {
    for (; i < r && n(t[i], t[i - 1]) < 0; )
      i++;
    Tb(t, e, i);
  } else
    for (; i < r && n(t[i], t[i - 1]) >= 0; )
      i++;
  return i - e;
}
function Tb(t, e, r) {
  for (r--; e < r; ) {
    var n = t[e];
    t[e++] = t[r], t[r--] = n;
  }
}
function Fv(t, e, r, n, i) {
  for (n === e && n++; n < r; n++) {
    for (var a = t[n], o = e, s = n, u; o < s; )
      u = o + s >>> 1, i(a, t[u]) < 0 ? s = u : o = u + 1;
    var l = n - o;
    switch (l) {
      case 3:
        t[o + 3] = t[o + 2];
      case 2:
        t[o + 2] = t[o + 1];
      case 1:
        t[o + 1] = t[o];
        break;
      default:
        for (; l > 0; )
          t[o + l] = t[o + l - 1], l--;
    }
    t[o] = a;
  }
}
function fl(t, e, r, n, i, a) {
  var o = 0, s = 0, u = 1;
  if (a(t, e[r + i]) > 0) {
    for (s = n - i; u < s && a(t, e[r + i + u]) > 0; )
      o = u, u = (u << 1) + 1, u <= 0 && (u = s);
    u > s && (u = s), o += i, u += i;
  } else {
    for (s = i + 1; u < s && a(t, e[r + i - u]) <= 0; )
      o = u, u = (u << 1) + 1, u <= 0 && (u = s);
    u > s && (u = s);
    var l = o;
    o = i - u, u = i - l;
  }
  for (o++; o < u; ) {
    var f = o + (u - o >>> 1);
    a(t, e[r + f]) > 0 ? o = f + 1 : u = f;
  }
  return u;
}
function hl(t, e, r, n, i, a) {
  var o = 0, s = 0, u = 1;
  if (a(t, e[r + i]) < 0) {
    for (s = i + 1; u < s && a(t, e[r + i - u]) < 0; )
      o = u, u = (u << 1) + 1, u <= 0 && (u = s);
    u > s && (u = s);
    var l = o;
    o = i - u, u = i - l;
  } else {
    for (s = n - i; u < s && a(t, e[r + i + u]) >= 0; )
      o = u, u = (u << 1) + 1, u <= 0 && (u = s);
    u > s && (u = s), o += i, u += i;
  }
  for (o++; o < u; ) {
    var f = o + (u - o >>> 1);
    a(t, e[r + f]) < 0 ? u = f : o = f + 1;
  }
  return u;
}
function xb(t, e) {
  var r = Yi, n, i, a = 0, o = [];
  n = [], i = [];
  function s(v, d) {
    n[a] = v, i[a] = d, a += 1;
  }
  function u() {
    for (; a > 1; ) {
      var v = a - 2;
      if (v >= 1 && i[v - 1] <= i[v] + i[v + 1] || v >= 2 && i[v - 2] <= i[v] + i[v - 1])
        i[v - 1] < i[v + 1] && v--;
      else if (i[v] > i[v + 1])
        break;
      f(v);
    }
  }
  function l() {
    for (; a > 1; ) {
      var v = a - 2;
      v > 0 && i[v - 1] < i[v + 1] && v--, f(v);
    }
  }
  function f(v) {
    var d = n[v], p = i[v], m = n[v + 1], g = i[v + 1];
    i[v] = p + g, v === a - 3 && (n[v + 1] = n[v + 2], i[v + 1] = i[v + 2]), a--;
    var y = hl(t[m], t, d, p, 0, e);
    d += y, p -= y, p !== 0 && (g = fl(t[d + p - 1], t, m, g, g - 1, e), g !== 0 && (p <= g ? h(d, p, m, g) : c(d, p, m, g)));
  }
  function h(v, d, p, m) {
    var g = 0;
    for (g = 0; g < d; g++)
      o[g] = t[v + g];
    var y = 0, _ = p, S = v;
    if (t[S++] = t[_++], --m === 0) {
      for (g = 0; g < d; g++)
        t[S + g] = o[y + g];
      return;
    }
    if (d === 1) {
      for (g = 0; g < m; g++)
        t[S + g] = t[_ + g];
      t[S + m] = o[y];
      return;
    }
    for (var b = r, w, T, M; ; ) {
      w = 0, T = 0, M = !1;
      do
        if (e(t[_], o[y]) < 0) {
          if (t[S++] = t[_++], T++, w = 0, --m === 0) {
            M = !0;
            break;
          }
        } else if (t[S++] = o[y++], w++, T = 0, --d === 1) {
          M = !0;
          break;
        }
      while ((w | T) < b);
      if (M)
        break;
      do {
        if (w = hl(t[_], o, y, d, 0, e), w !== 0) {
          for (g = 0; g < w; g++)
            t[S + g] = o[y + g];
          if (S += w, y += w, d -= w, d <= 1) {
            M = !0;
            break;
          }
        }
        if (t[S++] = t[_++], --m === 0) {
          M = !0;
          break;
        }
        if (T = fl(o[y], t, _, m, 0, e), T !== 0) {
          for (g = 0; g < T; g++)
            t[S + g] = t[_ + g];
          if (S += T, _ += T, m -= T, m === 0) {
            M = !0;
            break;
          }
        }
        if (t[S++] = o[y++], --d === 1) {
          M = !0;
          break;
        }
        b--;
      } while (w >= Yi || T >= Yi);
      if (M)
        break;
      b < 0 && (b = 0), b += 2;
    }
    if (r = b, r < 1 && (r = 1), d === 1) {
      for (g = 0; g < m; g++)
        t[S + g] = t[_ + g];
      t[S + m] = o[y];
    } else {
      if (d === 0)
        throw new Error();
      for (g = 0; g < d; g++)
        t[S + g] = o[y + g];
    }
  }
  function c(v, d, p, m) {
    var g = 0;
    for (g = 0; g < m; g++)
      o[g] = t[p + g];
    var y = v + d - 1, _ = m - 1, S = p + m - 1, b = 0, w = 0;
    if (t[S--] = t[y--], --d === 0) {
      for (b = S - (m - 1), g = 0; g < m; g++)
        t[b + g] = o[g];
      return;
    }
    if (m === 1) {
      for (S -= d, y -= d, w = S + 1, b = y + 1, g = d - 1; g >= 0; g--)
        t[w + g] = t[b + g];
      t[S] = o[_];
      return;
    }
    for (var T = r; ; ) {
      var M = 0, D = 0, C = !1;
      do
        if (e(o[_], t[y]) < 0) {
          if (t[S--] = t[y--], M++, D = 0, --d === 0) {
            C = !0;
            break;
          }
        } else if (t[S--] = o[_--], D++, M = 0, --m === 1) {
          C = !0;
          break;
        }
      while ((M | D) < T);
      if (C)
        break;
      do {
        if (M = d - hl(o[_], t, v, d, d - 1, e), M !== 0) {
          for (S -= M, y -= M, d -= M, w = S + 1, b = y + 1, g = M - 1; g >= 0; g--)
            t[w + g] = t[b + g];
          if (d === 0) {
            C = !0;
            break;
          }
        }
        if (t[S--] = o[_--], --m === 1) {
          C = !0;
          break;
        }
        if (D = m - fl(t[y], o, 0, m, m - 1, e), D !== 0) {
          for (S -= D, _ -= D, m -= D, w = S + 1, b = _ + 1, g = 0; g < D; g++)
            t[w + g] = o[b + g];
          if (m <= 1) {
            C = !0;
            break;
          }
        }
        if (t[S--] = t[y--], --d === 0) {
          C = !0;
          break;
        }
        T--;
      } while (M >= Yi || D >= Yi);
      if (C)
        break;
      T < 0 && (T = 0), T += 2;
    }
    if (r = T, r < 1 && (r = 1), m === 1) {
      for (S -= d, y -= d, w = S + 1, b = y + 1, g = d - 1; g >= 0; g--)
        t[w + g] = t[b + g];
      t[S] = o[_];
    } else {
      if (m === 0)
        throw new Error();
      for (b = S - (m - 1), g = 0; g < m; g++)
        t[b + g] = o[g];
    }
  }
  return {
    mergeRuns: u,
    forceMergeRuns: l,
    pushRun: s
  };
}
function ls(t, e, r, n) {
  r || (r = 0), n || (n = t.length);
  var i = n - r;
  if (!(i < 2)) {
    var a = 0;
    if (i < ny) {
      a = Vv(t, r, n, e), Fv(t, r, n, r + a, e);
      return;
    }
    var o = xb(t, e), s = wb(i);
    do {
      if (a = Vv(t, r, n, e), a < s) {
        var u = i;
        u > s && (u = s), Fv(t, r, r + u, r + a, e), a = u;
      }
      o.pushRun(r, a), o.mergeRuns(), i -= a, r += a;
    } while (i !== 0);
    o.forceMergeRuns();
  }
}
var Ot = 1, pa = 2, ai = 4, zv = !1;
function cl() {
  zv || (zv = !0, console.warn("z / z2 / zlevel of displayable is invalid, which may cause unexpected errors"));
}
function Hv(t, e) {
  return t.zlevel === e.zlevel ? t.z === e.z ? t.z2 - e.z2 : t.z - e.z : t.zlevel - e.zlevel;
}
var Cb = function() {
  function t() {
    this._roots = [], this._displayList = [], this._displayListLen = 0, this.displayableSortFunc = Hv;
  }
  return t.prototype.traverse = function(e, r) {
    for (var n = 0; n < this._roots.length; n++)
      this._roots[n].traverse(e, r);
  }, t.prototype.getDisplayList = function(e, r) {
    r = r || !1;
    var n = this._displayList;
    return (e || !n.length) && this.updateDisplayList(r), n;
  }, t.prototype.updateDisplayList = function(e) {
    this._displayListLen = 0;
    for (var r = this._roots, n = this._displayList, i = 0, a = r.length; i < a; i++)
      this._updateAndAddDisplayable(r[i], null, e);
    n.length = this._displayListLen, ls(n, Hv);
  }, t.prototype._updateAndAddDisplayable = function(e, r, n) {
    if (!(e.ignore && !n)) {
      e.beforeUpdate(), e.update(), e.afterUpdate();
      var i = e.getClipPath(), a = r && r.length, o = 0, s = e.__clipPaths;
      if (!e.ignoreClip && (a || i)) {
        if (s || (s = e.__clipPaths = []), a)
          for (var u = 0; u < r.length; u++)
            s[o++] = r[u];
        for (var l = i, f = e; l; )
          l.parent = f, l.updateTransform(), s[o++] = l, f = l, l = l.getClipPath();
      }
      if (s && (s.length = o), e.childrenRef) {
        for (var h = e.childrenRef(), c = 0; c < h.length; c++) {
          var v = h[c];
          e.__dirty && (v.__dirty |= Ot), this._updateAndAddDisplayable(v, s, n);
        }
        e.__dirty = 0;
      } else {
        var d = e;
        isNaN(d.z) && (cl(), d.z = 0), isNaN(d.z2) && (cl(), d.z2 = 0), isNaN(d.zlevel) && (cl(), d.zlevel = 0), this._displayList[this._displayListLen++] = d;
      }
      var p = e.getDecalElement && e.getDecalElement();
      p && this._updateAndAddDisplayable(p, s, n);
      var m = e.getTextGuideLine();
      m && this._updateAndAddDisplayable(m, s, n);
      var g = e.getTextContent();
      g && this._updateAndAddDisplayable(g, s, n);
    }
  }, t.prototype.addRoot = function(e) {
    e.__zr && e.__zr.storage === this || this._roots.push(e);
  }, t.prototype.delRoot = function(e) {
    if (e instanceof Array) {
      for (var r = 0, n = e.length; r < n; r++)
        this.delRoot(e[r]);
      return;
    }
    var i = fe(this._roots, e);
    i >= 0 && this._roots.splice(i, 1);
  }, t.prototype.delAllRoots = function() {
    this._roots = [], this._displayList = [], this._displayListLen = 0;
  }, t.prototype.getRoots = function() {
    return this._roots;
  }, t.prototype.dispose = function() {
    this._displayList = null, this._roots = null;
  }, t;
}(), zf;
zf = re.hasGlobalWindow && (window.requestAnimationFrame && window.requestAnimationFrame.bind(window) || window.msRequestAnimationFrame && window.msRequestAnimationFrame.bind(window) || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame) || function(t) {
  return setTimeout(t, 16);
};
var Da = {
  linear: function(t) {
    return t;
  },
  quadraticIn: function(t) {
    return t * t;
  },
  quadraticOut: function(t) {
    return t * (2 - t);
  },
  quadraticInOut: function(t) {
    return (t *= 2) < 1 ? 0.5 * t * t : -0.5 * (--t * (t - 2) - 1);
  },
  cubicIn: function(t) {
    return t * t * t;
  },
  cubicOut: function(t) {
    return --t * t * t + 1;
  },
  cubicInOut: function(t) {
    return (t *= 2) < 1 ? 0.5 * t * t * t : 0.5 * ((t -= 2) * t * t + 2);
  },
  quarticIn: function(t) {
    return t * t * t * t;
  },
  quarticOut: function(t) {
    return 1 - --t * t * t * t;
  },
  quarticInOut: function(t) {
    return (t *= 2) < 1 ? 0.5 * t * t * t * t : -0.5 * ((t -= 2) * t * t * t - 2);
  },
  quinticIn: function(t) {
    return t * t * t * t * t;
  },
  quinticOut: function(t) {
    return --t * t * t * t * t + 1;
  },
  quinticInOut: function(t) {
    return (t *= 2) < 1 ? 0.5 * t * t * t * t * t : 0.5 * ((t -= 2) * t * t * t * t + 2);
  },
  sinusoidalIn: function(t) {
    return 1 - Math.cos(t * Math.PI / 2);
  },
  sinusoidalOut: function(t) {
    return Math.sin(t * Math.PI / 2);
  },
  sinusoidalInOut: function(t) {
    return 0.5 * (1 - Math.cos(Math.PI * t));
  },
  exponentialIn: function(t) {
    return t === 0 ? 0 : Math.pow(1024, t - 1);
  },
  exponentialOut: function(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  },
  exponentialInOut: function(t) {
    return t === 0 ? 0 : t === 1 ? 1 : (t *= 2) < 1 ? 0.5 * Math.pow(1024, t - 1) : 0.5 * (-Math.pow(2, -10 * (t - 1)) + 2);
  },
  circularIn: function(t) {
    return 1 - Math.sqrt(1 - t * t);
  },
  circularOut: function(t) {
    return Math.sqrt(1 - --t * t);
  },
  circularInOut: function(t) {
    return (t *= 2) < 1 ? -0.5 * (Math.sqrt(1 - t * t) - 1) : 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
  },
  elasticIn: function(t) {
    var e, r = 0.1, n = 0.4;
    return t === 0 ? 0 : t === 1 ? 1 : (!r || r < 1 ? (r = 1, e = n / 4) : e = n * Math.asin(1 / r) / (2 * Math.PI), -(r * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - e) * (2 * Math.PI) / n)));
  },
  elasticOut: function(t) {
    var e, r = 0.1, n = 0.4;
    return t === 0 ? 0 : t === 1 ? 1 : (!r || r < 1 ? (r = 1, e = n / 4) : e = n * Math.asin(1 / r) / (2 * Math.PI), r * Math.pow(2, -10 * t) * Math.sin((t - e) * (2 * Math.PI) / n) + 1);
  },
  elasticInOut: function(t) {
    var e, r = 0.1, n = 0.4;
    return t === 0 ? 0 : t === 1 ? 1 : (!r || r < 1 ? (r = 1, e = n / 4) : e = n * Math.asin(1 / r) / (2 * Math.PI), (t *= 2) < 1 ? -0.5 * (r * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - e) * (2 * Math.PI) / n)) : r * Math.pow(2, -10 * (t -= 1)) * Math.sin((t - e) * (2 * Math.PI) / n) * 0.5 + 1);
  },
  backIn: function(t) {
    var e = 1.70158;
    return t * t * ((e + 1) * t - e);
  },
  backOut: function(t) {
    var e = 1.70158;
    return --t * t * ((e + 1) * t + e) + 1;
  },
  backInOut: function(t) {
    var e = 2.5949095;
    return (t *= 2) < 1 ? 0.5 * (t * t * ((e + 1) * t - e)) : 0.5 * ((t -= 2) * t * ((e + 1) * t + e) + 2);
  },
  bounceIn: function(t) {
    return 1 - Da.bounceOut(1 - t);
  },
  bounceOut: function(t) {
    return t < 1 / 2.75 ? 7.5625 * t * t : t < 2 / 2.75 ? 7.5625 * (t -= 1.5 / 2.75) * t + 0.75 : t < 2.5 / 2.75 ? 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375 : 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
  },
  bounceInOut: function(t) {
    return t < 0.5 ? Da.bounceIn(t * 2) * 0.5 : Da.bounceOut(t * 2 - 1) * 0.5 + 0.5;
  }
}, wo = Math.pow, kr = Math.sqrt, Os = 1e-8, iy = 1e-4, Gv = kr(3), To = 1 / 3, Wt = Bi(), yt = Bi(), gi = Bi();
function Ir(t) {
  return t > -Os && t < Os;
}
function ay(t) {
  return t > Os || t < -Os;
}
function Ge(t, e, r, n, i) {
  var a = 1 - i;
  return a * a * (a * t + 3 * i * e) + i * i * (i * n + 3 * a * r);
}
function Uv(t, e, r, n, i) {
  var a = 1 - i;
  return 3 * (((e - t) * a + 2 * (r - e) * i) * a + (n - r) * i * i);
}
function Ls(t, e, r, n, i, a) {
  var o = n + 3 * (e - r) - t, s = 3 * (r - e * 2 + t), u = 3 * (e - t), l = t - i, f = s * s - 3 * o * u, h = s * u - 9 * o * l, c = u * u - 3 * s * l, v = 0;
  if (Ir(f) && Ir(h))
    if (Ir(s))
      a[0] = 0;
    else {
      var d = -u / s;
      d >= 0 && d <= 1 && (a[v++] = d);
    }
  else {
    var p = h * h - 4 * f * c;
    if (Ir(p)) {
      var m = h / f, d = -s / o + m, g = -m / 2;
      d >= 0 && d <= 1 && (a[v++] = d), g >= 0 && g <= 1 && (a[v++] = g);
    } else if (p > 0) {
      var y = kr(p), _ = f * s + 1.5 * o * (-h + y), S = f * s + 1.5 * o * (-h - y);
      _ < 0 ? _ = -wo(-_, To) : _ = wo(_, To), S < 0 ? S = -wo(-S, To) : S = wo(S, To);
      var d = (-s - (_ + S)) / (3 * o);
      d >= 0 && d <= 1 && (a[v++] = d);
    } else {
      var b = (2 * f * s - 3 * o * h) / (2 * kr(f * f * f)), w = Math.acos(b) / 3, T = kr(f), M = Math.cos(w), d = (-s - 2 * T * M) / (3 * o), g = (-s + T * (M + Gv * Math.sin(w))) / (3 * o), D = (-s + T * (M - Gv * Math.sin(w))) / (3 * o);
      d >= 0 && d <= 1 && (a[v++] = d), g >= 0 && g <= 1 && (a[v++] = g), D >= 0 && D <= 1 && (a[v++] = D);
    }
  }
  return v;
}
function oy(t, e, r, n, i) {
  var a = 6 * r - 12 * e + 6 * t, o = 9 * e + 3 * n - 3 * t - 9 * r, s = 3 * e - 3 * t, u = 0;
  if (Ir(o)) {
    if (ay(a)) {
      var l = -s / a;
      l >= 0 && l <= 1 && (i[u++] = l);
    }
  } else {
    var f = a * a - 4 * o * s;
    if (Ir(f))
      i[0] = -a / (2 * o);
    else if (f > 0) {
      var h = kr(f), l = (-a + h) / (2 * o), c = (-a - h) / (2 * o);
      l >= 0 && l <= 1 && (i[u++] = l), c >= 0 && c <= 1 && (i[u++] = c);
    }
  }
  return u;
}
function Ps(t, e, r, n, i, a) {
  var o = (e - t) * i + t, s = (r - e) * i + e, u = (n - r) * i + r, l = (s - o) * i + o, f = (u - s) * i + s, h = (f - l) * i + l;
  a[0] = t, a[1] = o, a[2] = l, a[3] = h, a[4] = h, a[5] = f, a[6] = u, a[7] = n;
}
function Db(t, e, r, n, i, a, o, s, u, l, f) {
  var h, c = 5e-3, v = 1 / 0, d, p, m, g;
  Wt[0] = u, Wt[1] = l;
  for (var y = 0; y < 1; y += 0.05)
    yt[0] = Ge(t, r, i, o, y), yt[1] = Ge(e, n, a, s, y), m = pi(Wt, yt), m < v && (h = y, v = m);
  v = 1 / 0;
  for (var _ = 0; _ < 32 && !(c < iy); _++)
    d = h - c, p = h + c, yt[0] = Ge(t, r, i, o, d), yt[1] = Ge(e, n, a, s, d), m = pi(yt, Wt), d >= 0 && m < v ? (h = d, v = m) : (gi[0] = Ge(t, r, i, o, p), gi[1] = Ge(e, n, a, s, p), g = pi(gi, Wt), p <= 1 && g < v ? (h = p, v = g) : c *= 0.5);
  return kr(v);
}
function Mb(t, e, r, n, i, a, o, s, u) {
  for (var l = t, f = e, h = 0, c = 1 / u, v = 1; v <= u; v++) {
    var d = v * c, p = Ge(t, r, i, o, d), m = Ge(e, n, a, s, d), g = p - l, y = m - f;
    h += Math.sqrt(g * g + y * y), l = p, f = m;
  }
  return h;
}
function rt(t, e, r, n) {
  var i = 1 - n;
  return i * (i * t + 2 * n * e) + n * n * r;
}
function Wv(t, e, r, n) {
  return 2 * ((1 - n) * (e - t) + n * (r - e));
}
function Eb(t, e, r, n, i) {
  var a = t - 2 * e + r, o = 2 * (e - t), s = t - n, u = 0;
  if (Ir(a)) {
    if (ay(o)) {
      var l = -s / o;
      l >= 0 && l <= 1 && (i[u++] = l);
    }
  } else {
    var f = o * o - 4 * a * s;
    if (Ir(f)) {
      var l = -o / (2 * a);
      l >= 0 && l <= 1 && (i[u++] = l);
    } else if (f > 0) {
      var h = kr(f), l = (-o + h) / (2 * a), c = (-o - h) / (2 * a);
      l >= 0 && l <= 1 && (i[u++] = l), c >= 0 && c <= 1 && (i[u++] = c);
    }
  }
  return u;
}
function sy(t, e, r) {
  var n = t + r - 2 * e;
  return n === 0 ? 0.5 : (t - e) / n;
}
function Ns(t, e, r, n, i) {
  var a = (e - t) * n + t, o = (r - e) * n + e, s = (o - a) * n + a;
  i[0] = t, i[1] = a, i[2] = s, i[3] = s, i[4] = o, i[5] = r;
}
function Ab(t, e, r, n, i, a, o, s, u) {
  var l, f = 5e-3, h = 1 / 0;
  Wt[0] = o, Wt[1] = s;
  for (var c = 0; c < 1; c += 0.05) {
    yt[0] = rt(t, r, i, c), yt[1] = rt(e, n, a, c);
    var v = pi(Wt, yt);
    v < h && (l = c, h = v);
  }
  h = 1 / 0;
  for (var d = 0; d < 32 && !(f < iy); d++) {
    var p = l - f, m = l + f;
    yt[0] = rt(t, r, i, p), yt[1] = rt(e, n, a, p);
    var v = pi(yt, Wt);
    if (p >= 0 && v < h)
      l = p, h = v;
    else {
      gi[0] = rt(t, r, i, m), gi[1] = rt(e, n, a, m);
      var g = pi(gi, Wt);
      m <= 1 && g < h ? (l = m, h = g) : f *= 0.5;
    }
  }
  return kr(h);
}
function Ib(t, e, r, n, i, a, o) {
  for (var s = t, u = e, l = 0, f = 1 / o, h = 1; h <= o; h++) {
    var c = h * f, v = rt(t, r, i, c), d = rt(e, n, a, c), p = v - s, m = d - u;
    l += Math.sqrt(p * p + m * m), s = v, u = d;
  }
  return l;
}
var Ob = /cubic-bezier\(([0-9,\.e ]+)\)/;
function ac(t) {
  var e = t && Ob.exec(t);
  if (e) {
    var r = e[1].split(","), n = +Yt(r[0]), i = +Yt(r[1]), a = +Yt(r[2]), o = +Yt(r[3]);
    if (isNaN(n + i + a + o))
      return;
    var s = [];
    return function(u) {
      return u <= 0 ? 0 : u >= 1 ? 1 : Ls(0, n, a, 1, u, s) && Ge(0, i, o, 1, s[0]);
    };
  }
}
var Lb = function() {
  function t(e) {
    this._inited = !1, this._startTime = 0, this._pausedTime = 0, this._paused = !1, this._life = e.life || 1e3, this._delay = e.delay || 0, this.loop = e.loop || !1, this.onframe = e.onframe || Fe, this.ondestroy = e.ondestroy || Fe, this.onrestart = e.onrestart || Fe, e.easing && this.setEasing(e.easing);
  }
  return t.prototype.step = function(e, r) {
    if (this._inited || (this._startTime = e + this._delay, this._inited = !0), this._paused) {
      this._pausedTime += r;
      return;
    }
    var n = this._life, i = e - this._startTime - this._pausedTime, a = i / n;
    a < 0 && (a = 0), a = Math.min(a, 1);
    var o = this.easingFunc, s = o ? o(a) : a;
    if (this.onframe(s), a === 1)
      if (this.loop) {
        var u = i % n;
        this._startTime = e - u, this._pausedTime = 0, this.onrestart();
      } else
        return !0;
    return !1;
  }, t.prototype.pause = function() {
    this._paused = !0;
  }, t.prototype.resume = function() {
    this._paused = !1;
  }, t.prototype.setEasing = function(e) {
    this.easing = e, this.easingFunc = Q(e) ? e : Da[e] || ac(e);
  }, t;
}(), uy = /* @__PURE__ */ function() {
  function t(e) {
    this.value = e;
  }
  return t;
}(), Pb = function() {
  function t() {
    this._len = 0;
  }
  return t.prototype.insert = function(e) {
    var r = new uy(e);
    return this.insertEntry(r), r;
  }, t.prototype.insertEntry = function(e) {
    this.head ? (this.tail.next = e, e.prev = this.tail, e.next = null, this.tail = e) : this.head = this.tail = e, this._len++;
  }, t.prototype.remove = function(e) {
    var r = e.prev, n = e.next;
    r ? r.next = n : this.head = n, n ? n.prev = r : this.tail = r, e.next = e.prev = null, this._len--;
  }, t.prototype.len = function() {
    return this._len;
  }, t.prototype.clear = function() {
    this.head = this.tail = null, this._len = 0;
  }, t;
}(), xi = function() {
  function t(e) {
    this._list = new Pb(), this._maxSize = 10, this._map = {}, this._maxSize = e;
  }
  return t.prototype.put = function(e, r) {
    var n = this._list, i = this._map, a = null;
    if (i[e] == null) {
      var o = n.len(), s = this._lastRemovedEntry;
      if (o >= this._maxSize && o > 0) {
        var u = n.head;
        n.remove(u), delete i[u.key], a = u.value, this._lastRemovedEntry = u;
      }
      s ? s.value = r : s = new uy(r), s.key = e, n.insertEntry(s), i[e] = s;
    }
    return a;
  }, t.prototype.get = function(e) {
    var r = this._map[e], n = this._list;
    if (r != null)
      return r !== n.tail && (n.remove(r), n.insertEntry(r)), r.value;
  }, t.prototype.clear = function() {
    this._list.clear(), this._map = {};
  }, t.prototype.len = function() {
    return this._list.len();
  }, t;
}(), Yv = {
  transparent: [0, 0, 0, 0],
  aliceblue: [240, 248, 255, 1],
  antiquewhite: [250, 235, 215, 1],
  aqua: [0, 255, 255, 1],
  aquamarine: [127, 255, 212, 1],
  azure: [240, 255, 255, 1],
  beige: [245, 245, 220, 1],
  bisque: [255, 228, 196, 1],
  black: [0, 0, 0, 1],
  blanchedalmond: [255, 235, 205, 1],
  blue: [0, 0, 255, 1],
  blueviolet: [138, 43, 226, 1],
  brown: [165, 42, 42, 1],
  burlywood: [222, 184, 135, 1],
  cadetblue: [95, 158, 160, 1],
  chartreuse: [127, 255, 0, 1],
  chocolate: [210, 105, 30, 1],
  coral: [255, 127, 80, 1],
  cornflowerblue: [100, 149, 237, 1],
  cornsilk: [255, 248, 220, 1],
  crimson: [220, 20, 60, 1],
  cyan: [0, 255, 255, 1],
  darkblue: [0, 0, 139, 1],
  darkcyan: [0, 139, 139, 1],
  darkgoldenrod: [184, 134, 11, 1],
  darkgray: [169, 169, 169, 1],
  darkgreen: [0, 100, 0, 1],
  darkgrey: [169, 169, 169, 1],
  darkkhaki: [189, 183, 107, 1],
  darkmagenta: [139, 0, 139, 1],
  darkolivegreen: [85, 107, 47, 1],
  darkorange: [255, 140, 0, 1],
  darkorchid: [153, 50, 204, 1],
  darkred: [139, 0, 0, 1],
  darksalmon: [233, 150, 122, 1],
  darkseagreen: [143, 188, 143, 1],
  darkslateblue: [72, 61, 139, 1],
  darkslategray: [47, 79, 79, 1],
  darkslategrey: [47, 79, 79, 1],
  darkturquoise: [0, 206, 209, 1],
  darkviolet: [148, 0, 211, 1],
  deeppink: [255, 20, 147, 1],
  deepskyblue: [0, 191, 255, 1],
  dimgray: [105, 105, 105, 1],
  dimgrey: [105, 105, 105, 1],
  dodgerblue: [30, 144, 255, 1],
  firebrick: [178, 34, 34, 1],
  floralwhite: [255, 250, 240, 1],
  forestgreen: [34, 139, 34, 1],
  fuchsia: [255, 0, 255, 1],
  gainsboro: [220, 220, 220, 1],
  ghostwhite: [248, 248, 255, 1],
  gold: [255, 215, 0, 1],
  goldenrod: [218, 165, 32, 1],
  gray: [128, 128, 128, 1],
  green: [0, 128, 0, 1],
  greenyellow: [173, 255, 47, 1],
  grey: [128, 128, 128, 1],
  honeydew: [240, 255, 240, 1],
  hotpink: [255, 105, 180, 1],
  indianred: [205, 92, 92, 1],
  indigo: [75, 0, 130, 1],
  ivory: [255, 255, 240, 1],
  khaki: [240, 230, 140, 1],
  lavender: [230, 230, 250, 1],
  lavenderblush: [255, 240, 245, 1],
  lawngreen: [124, 252, 0, 1],
  lemonchiffon: [255, 250, 205, 1],
  lightblue: [173, 216, 230, 1],
  lightcoral: [240, 128, 128, 1],
  lightcyan: [224, 255, 255, 1],
  lightgoldenrodyellow: [250, 250, 210, 1],
  lightgray: [211, 211, 211, 1],
  lightgreen: [144, 238, 144, 1],
  lightgrey: [211, 211, 211, 1],
  lightpink: [255, 182, 193, 1],
  lightsalmon: [255, 160, 122, 1],
  lightseagreen: [32, 178, 170, 1],
  lightskyblue: [135, 206, 250, 1],
  lightslategray: [119, 136, 153, 1],
  lightslategrey: [119, 136, 153, 1],
  lightsteelblue: [176, 196, 222, 1],
  lightyellow: [255, 255, 224, 1],
  lime: [0, 255, 0, 1],
  limegreen: [50, 205, 50, 1],
  linen: [250, 240, 230, 1],
  magenta: [255, 0, 255, 1],
  maroon: [128, 0, 0, 1],
  mediumaquamarine: [102, 205, 170, 1],
  mediumblue: [0, 0, 205, 1],
  mediumorchid: [186, 85, 211, 1],
  mediumpurple: [147, 112, 219, 1],
  mediumseagreen: [60, 179, 113, 1],
  mediumslateblue: [123, 104, 238, 1],
  mediumspringgreen: [0, 250, 154, 1],
  mediumturquoise: [72, 209, 204, 1],
  mediumvioletred: [199, 21, 133, 1],
  midnightblue: [25, 25, 112, 1],
  mintcream: [245, 255, 250, 1],
  mistyrose: [255, 228, 225, 1],
  moccasin: [255, 228, 181, 1],
  navajowhite: [255, 222, 173, 1],
  navy: [0, 0, 128, 1],
  oldlace: [253, 245, 230, 1],
  olive: [128, 128, 0, 1],
  olivedrab: [107, 142, 35, 1],
  orange: [255, 165, 0, 1],
  orangered: [255, 69, 0, 1],
  orchid: [218, 112, 214, 1],
  palegoldenrod: [238, 232, 170, 1],
  palegreen: [152, 251, 152, 1],
  paleturquoise: [175, 238, 238, 1],
  palevioletred: [219, 112, 147, 1],
  papayawhip: [255, 239, 213, 1],
  peachpuff: [255, 218, 185, 1],
  peru: [205, 133, 63, 1],
  pink: [255, 192, 203, 1],
  plum: [221, 160, 221, 1],
  powderblue: [176, 224, 230, 1],
  purple: [128, 0, 128, 1],
  red: [255, 0, 0, 1],
  rosybrown: [188, 143, 143, 1],
  royalblue: [65, 105, 225, 1],
  saddlebrown: [139, 69, 19, 1],
  salmon: [250, 128, 114, 1],
  sandybrown: [244, 164, 96, 1],
  seagreen: [46, 139, 87, 1],
  seashell: [255, 245, 238, 1],
  sienna: [160, 82, 45, 1],
  silver: [192, 192, 192, 1],
  skyblue: [135, 206, 235, 1],
  slateblue: [106, 90, 205, 1],
  slategray: [112, 128, 144, 1],
  slategrey: [112, 128, 144, 1],
  snow: [255, 250, 250, 1],
  springgreen: [0, 255, 127, 1],
  steelblue: [70, 130, 180, 1],
  tan: [210, 180, 140, 1],
  teal: [0, 128, 128, 1],
  thistle: [216, 191, 216, 1],
  tomato: [255, 99, 71, 1],
  turquoise: [64, 224, 208, 1],
  violet: [238, 130, 238, 1],
  wheat: [245, 222, 179, 1],
  white: [255, 255, 255, 1],
  whitesmoke: [245, 245, 245, 1],
  yellow: [255, 255, 0, 1],
  yellowgreen: [154, 205, 50, 1]
};
function Br(t) {
  return t = Math.round(t), t < 0 ? 0 : t > 255 ? 255 : t;
}
function Hf(t) {
  return t < 0 ? 0 : t > 1 ? 1 : t;
}
function vl(t) {
  var e = t;
  return e.length && e.charAt(e.length - 1) === "%" ? Br(parseFloat(e) / 100 * 255) : Br(parseInt(e, 10));
}
function Mn(t) {
  var e = t;
  return e.length && e.charAt(e.length - 1) === "%" ? Hf(parseFloat(e) / 100) : Hf(parseFloat(e));
}
function dl(t, e, r) {
  return r < 0 ? r += 1 : r > 1 && (r -= 1), r * 6 < 1 ? t + (e - t) * r * 6 : r * 2 < 1 ? e : r * 3 < 2 ? t + (e - t) * (2 / 3 - r) * 6 : t;
}
function xo(t, e, r) {
  return t + (e - t) * r;
}
function vt(t, e, r, n, i) {
  return t[0] = e, t[1] = r, t[2] = n, t[3] = i, t;
}
function Gf(t, e) {
  return t[0] = e[0], t[1] = e[1], t[2] = e[2], t[3] = e[3], t;
}
var ly = new xi(20), Co = null;
function Gn(t, e) {
  Co && Gf(Co, e), Co = ly.put(t, Co || e.slice());
}
function Lt(t, e) {
  if (t) {
    e = e || [];
    var r = ly.get(t);
    if (r)
      return Gf(e, r);
    t = t + "";
    var n = t.replace(/ /g, "").toLowerCase();
    if (n in Yv)
      return Gf(e, Yv[n]), Gn(t, e), e;
    var i = n.length;
    if (n.charAt(0) === "#") {
      if (i === 4 || i === 5) {
        var a = parseInt(n.slice(1, 4), 16);
        if (!(a >= 0 && a <= 4095)) {
          vt(e, 0, 0, 0, 1);
          return;
        }
        return vt(e, (a & 3840) >> 4 | (a & 3840) >> 8, a & 240 | (a & 240) >> 4, a & 15 | (a & 15) << 4, i === 5 ? parseInt(n.slice(4), 16) / 15 : 1), Gn(t, e), e;
      } else if (i === 7 || i === 9) {
        var a = parseInt(n.slice(1, 7), 16);
        if (!(a >= 0 && a <= 16777215)) {
          vt(e, 0, 0, 0, 1);
          return;
        }
        return vt(e, (a & 16711680) >> 16, (a & 65280) >> 8, a & 255, i === 9 ? parseInt(n.slice(7), 16) / 255 : 1), Gn(t, e), e;
      }
      return;
    }
    var o = n.indexOf("("), s = n.indexOf(")");
    if (o !== -1 && s + 1 === i) {
      var u = n.substr(0, o), l = n.substr(o + 1, s - (o + 1)).split(","), f = 1;
      switch (u) {
        case "rgba":
          if (l.length !== 4)
            return l.length === 3 ? vt(e, +l[0], +l[1], +l[2], 1) : vt(e, 0, 0, 0, 1);
          f = Mn(l.pop());
        case "rgb":
          if (l.length >= 3)
            return vt(e, vl(l[0]), vl(l[1]), vl(l[2]), l.length === 3 ? f : Mn(l[3])), Gn(t, e), e;
          vt(e, 0, 0, 0, 1);
          return;
        case "hsla":
          if (l.length !== 4) {
            vt(e, 0, 0, 0, 1);
            return;
          }
          return l[3] = Mn(l[3]), Uf(l, e), Gn(t, e), e;
        case "hsl":
          if (l.length !== 3) {
            vt(e, 0, 0, 0, 1);
            return;
          }
          return Uf(l, e), Gn(t, e), e;
        default:
          return;
      }
    }
    vt(e, 0, 0, 0, 1);
  }
}
function Uf(t, e) {
  var r = (parseFloat(t[0]) % 360 + 360) % 360 / 360, n = Mn(t[1]), i = Mn(t[2]), a = i <= 0.5 ? i * (n + 1) : i + n - i * n, o = i * 2 - a;
  return e = e || [], vt(e, Br(dl(o, a, r + 1 / 3) * 255), Br(dl(o, a, r) * 255), Br(dl(o, a, r - 1 / 3) * 255), 1), t.length === 4 && (e[3] = t[3]), e;
}
function Nb(t) {
  if (t) {
    var e = t[0] / 255, r = t[1] / 255, n = t[2] / 255, i = Math.min(e, r, n), a = Math.max(e, r, n), o = a - i, s = (a + i) / 2, u, l;
    if (o === 0)
      u = 0, l = 0;
    else {
      s < 0.5 ? l = o / (a + i) : l = o / (2 - a - i);
      var f = ((a - e) / 6 + o / 2) / o, h = ((a - r) / 6 + o / 2) / o, c = ((a - n) / 6 + o / 2) / o;
      e === a ? u = c - h : r === a ? u = 1 / 3 + f - c : n === a && (u = 2 / 3 + h - f), u < 0 && (u += 1), u > 1 && (u -= 1);
    }
    var v = [u * 360, l, s];
    return t[3] != null && v.push(t[3]), v;
  }
}
function Xv(t, e) {
  var r = Lt(t);
  if (r) {
    for (var n = 0; n < 3; n++)
      r[n] = r[n] * (1 - e) | 0, r[n] > 255 ? r[n] = 255 : r[n] < 0 && (r[n] = 0);
    return oo(r, r.length === 4 ? "rgba" : "rgb");
  }
}
function Rb(t, e, r) {
  if (!(!(e && e.length) || !(t >= 0 && t <= 1))) {
    var n = t * (e.length - 1), i = Math.floor(n), a = Math.ceil(n), o = Lt(e[i]), s = Lt(e[a]), u = n - i, l = oo([
      Br(xo(o[0], s[0], u)),
      Br(xo(o[1], s[1], u)),
      Br(xo(o[2], s[2], u)),
      Hf(xo(o[3], s[3], u))
    ], "rgba");
    return r ? {
      color: l,
      leftIndex: i,
      rightIndex: a,
      value: n
    } : l;
  }
}
function Wf(t, e, r, n) {
  var i = Lt(t);
  if (t)
    return i = Nb(i), r != null && (i[1] = Mn(Q(r) ? r(i[1]) : r)), n != null && (i[2] = Mn(Q(n) ? n(i[2]) : n)), oo(Uf(i), "rgba");
}
function oo(t, e) {
  if (!(!t || !t.length)) {
    var r = t[0] + "," + t[1] + "," + t[2];
    return (e === "rgba" || e === "hsva" || e === "hsla") && (r += "," + t[3]), e + "(" + r + ")";
  }
}
function Rs(t, e) {
  var r = Lt(t);
  return r ? (0.299 * r[0] + 0.587 * r[1] + 0.114 * r[2]) * r[3] / 255 + (1 - r[3]) * e : 0;
}
var Zv = new xi(100);
function Yf(t) {
  if (z(t)) {
    var e = Zv.get(t);
    return e || (e = Xv(t, -0.1), Zv.put(t, e)), e;
  } else if (Jh(t)) {
    var r = R({}, t);
    return r.colorStops = X(t.colorStops, function(n) {
      return {
        offset: n.offset,
        color: Xv(n.color, -0.1)
      };
    }), r;
  }
  return t;
}
var ks = Math.round;
function ka(t) {
  var e;
  if (!t || t === "transparent")
    t = "none";
  else if (typeof t == "string" && t.indexOf("rgba") > -1) {
    var r = Lt(t);
    r && (t = "rgb(" + r[0] + "," + r[1] + "," + r[2] + ")", e = r[3]);
  }
  return {
    color: t,
    opacity: e ?? 1
  };
}
var $v = 1e-4;
function Or(t) {
  return t < $v && t > -$v;
}
function Do(t) {
  return ks(t * 1e3) / 1e3;
}
function Xf(t) {
  return ks(t * 1e4) / 1e4;
}
function kb(t) {
  return "matrix(" + Do(t[0]) + "," + Do(t[1]) + "," + Do(t[2]) + "," + Do(t[3]) + "," + Xf(t[4]) + "," + Xf(t[5]) + ")";
}
var Bb = {
  left: "start",
  right: "end",
  center: "middle",
  middle: "middle"
};
function Vb(t, e, r) {
  return r === "top" ? t += e / 2 : r === "bottom" && (t -= e / 2), t;
}
function Fb(t) {
  return t && (t.shadowBlur || t.shadowOffsetX || t.shadowOffsetY);
}
function zb(t) {
  var e = t.style, r = t.getGlobalScale();
  return [
    e.shadowColor,
    (e.shadowBlur || 0).toFixed(2),
    (e.shadowOffsetX || 0).toFixed(2),
    (e.shadowOffsetY || 0).toFixed(2),
    r[0],
    r[1]
  ].join(",");
}
function fy(t) {
  return t && !!t.image;
}
function Hb(t) {
  return t && !!t.svgElement;
}
function oc(t) {
  return fy(t) || Hb(t);
}
function hy(t) {
  return t.type === "linear";
}
function cy(t) {
  return t.type === "radial";
}
function vy(t) {
  return t && (t.type === "linear" || t.type === "radial");
}
function Tu(t) {
  return "url(#" + t + ")";
}
function dy(t) {
  var e = t.getGlobalScale(), r = Math.max(e[0], e[1]);
  return Math.max(Math.ceil(Math.log(r) / Math.log(10)), 1);
}
function py(t) {
  var e = t.x || 0, r = t.y || 0, n = (t.rotation || 0) * us, i = W(t.scaleX, 1), a = W(t.scaleY, 1), o = t.skewX || 0, s = t.skewY || 0, u = [];
  return (e || r) && u.push("translate(" + e + "px," + r + "px)"), n && u.push("rotate(" + n + ")"), (i !== 1 || a !== 1) && u.push("scale(" + i + "," + a + ")"), (o || s) && u.push("skew(" + ks(o * us) + "deg, " + ks(s * us) + "deg)"), u.join(" ");
}
var Gb = function() {
  return typeof Buffer < "u" && typeof Buffer.from == "function" ? function(t) {
    return Buffer.from(t).toString("base64");
  } : typeof btoa == "function" && typeof unescape == "function" && typeof encodeURIComponent == "function" ? function(t) {
    return btoa(unescape(encodeURIComponent(t)));
  } : function(t) {
    return process.env.NODE_ENV !== "production" && _i("Base64 isn't natively supported in the current environment."), null;
  };
}(), Zf = Array.prototype.slice;
function cr(t, e, r) {
  return (e - t) * r + t;
}
function pl(t, e, r, n) {
  for (var i = e.length, a = 0; a < i; a++)
    t[a] = cr(e[a], r[a], n);
  return t;
}
function Ub(t, e, r, n) {
  for (var i = e.length, a = i && e[0].length, o = 0; o < i; o++) {
    t[o] || (t[o] = []);
    for (var s = 0; s < a; s++)
      t[o][s] = cr(e[o][s], r[o][s], n);
  }
  return t;
}
function Mo(t, e, r, n) {
  for (var i = e.length, a = 0; a < i; a++)
    t[a] = e[a] + r[a] * n;
  return t;
}
function qv(t, e, r, n) {
  for (var i = e.length, a = i && e[0].length, o = 0; o < i; o++) {
    t[o] || (t[o] = []);
    for (var s = 0; s < a; s++)
      t[o][s] = e[o][s] + r[o][s] * n;
  }
  return t;
}
function Wb(t, e) {
  for (var r = t.length, n = e.length, i = r > n ? e : t, a = Math.min(r, n), o = i[a - 1] || { color: [0, 0, 0, 0], offset: 0 }, s = a; s < Math.max(r, n); s++)
    i.push({
      offset: o.offset,
      color: o.color.slice()
    });
}
function Yb(t, e, r) {
  var n = t, i = e;
  if (!(!n.push || !i.push)) {
    var a = n.length, o = i.length;
    if (a !== o) {
      var s = a > o;
      if (s)
        n.length = o;
      else
        for (var u = a; u < o; u++)
          n.push(r === 1 ? i[u] : Zf.call(i[u]));
    }
    for (var l = n[0] && n[0].length, u = 0; u < n.length; u++)
      if (r === 1)
        isNaN(n[u]) && (n[u] = i[u]);
      else
        for (var f = 0; f < l; f++)
          isNaN(n[u][f]) && (n[u][f] = i[u][f]);
  }
}
function fs(t) {
  if (ot(t)) {
    var e = t.length;
    if (ot(t[0])) {
      for (var r = [], n = 0; n < e; n++)
        r.push(Zf.call(t[n]));
      return r;
    }
    return Zf.call(t);
  }
  return t;
}
function hs(t) {
  return t[0] = Math.floor(t[0]) || 0, t[1] = Math.floor(t[1]) || 0, t[2] = Math.floor(t[2]) || 0, t[3] = t[3] == null ? 1 : t[3], "rgba(" + t.join(",") + ")";
}
function Xb(t) {
  return ot(t && t[0]) ? 2 : 1;
}
var Eo = 0, cs = 1, gy = 2, ga = 3, $f = 4, qf = 5, Kv = 6;
function Qv(t) {
  return t === $f || t === qf;
}
function Ao(t) {
  return t === cs || t === gy;
}
var Xi = [0, 0, 0, 0], Zb = function() {
  function t(e) {
    this.keyframes = [], this.discrete = !1, this._invalid = !1, this._needsSort = !1, this._lastFr = 0, this._lastFrP = 0, this.propName = e;
  }
  return t.prototype.isFinished = function() {
    return this._finished;
  }, t.prototype.setFinished = function() {
    this._finished = !0, this._additiveTrack && this._additiveTrack.setFinished();
  }, t.prototype.needsAnimate = function() {
    return this.keyframes.length >= 1;
  }, t.prototype.getAdditiveTrack = function() {
    return this._additiveTrack;
  }, t.prototype.addKeyframe = function(e, r, n) {
    this._needsSort = !0;
    var i = this.keyframes, a = i.length, o = !1, s = Kv, u = r;
    if (ot(r)) {
      var l = Xb(r);
      s = l, (l === 1 && !Te(r[0]) || l === 2 && !Te(r[0][0])) && (o = !0);
    } else if (Te(r) && !bi(r))
      s = Eo;
    else if (z(r))
      if (!isNaN(+r))
        s = Eo;
      else {
        var f = Lt(r);
        f && (u = f, s = ga);
      }
    else if (Jh(r)) {
      var h = R({}, u);
      h.colorStops = X(r.colorStops, function(v) {
        return {
          offset: v.offset,
          color: Lt(v.color)
        };
      }), hy(r) ? s = $f : cy(r) && (s = qf), u = h;
    }
    a === 0 ? this.valType = s : (s !== this.valType || s === Kv) && (o = !0), this.discrete = this.discrete || o;
    var c = {
      time: e,
      value: u,
      rawValue: r,
      percent: 0
    };
    return n && (c.easing = n, c.easingFunc = Q(n) ? n : Da[n] || ac(n)), i.push(c), c;
  }, t.prototype.prepare = function(e, r) {
    var n = this.keyframes;
    this._needsSort && n.sort(function(p, m) {
      return p.time - m.time;
    });
    for (var i = this.valType, a = n.length, o = n[a - 1], s = this.discrete, u = Ao(i), l = Qv(i), f = 0; f < a; f++) {
      var h = n[f], c = h.value, v = o.value;
      h.percent = h.time / e, s || (u && f !== a - 1 ? Yb(c, v, i) : l && Wb(c.colorStops, v.colorStops));
    }
    if (!s && i !== qf && r && this.needsAnimate() && r.needsAnimate() && i === r.valType && !r._finished) {
      this._additiveTrack = r;
      for (var d = n[0].value, f = 0; f < a; f++)
        i === Eo ? n[f].additiveValue = n[f].value - d : i === ga ? n[f].additiveValue = Mo([], n[f].value, d, -1) : Ao(i) && (n[f].additiveValue = i === cs ? Mo([], n[f].value, d, -1) : qv([], n[f].value, d, -1));
    }
  }, t.prototype.step = function(e, r) {
    if (!this._finished) {
      this._additiveTrack && this._additiveTrack._finished && (this._additiveTrack = null);
      var n = this._additiveTrack != null, i = n ? "additiveValue" : "value", a = this.valType, o = this.keyframes, s = o.length, u = this.propName, l = a === ga, f, h = this._lastFr, c = Math.min, v, d;
      if (s === 1)
        v = d = o[0];
      else {
        if (r < 0)
          f = 0;
        else if (r < this._lastFrP) {
          var p = c(h + 1, s - 1);
          for (f = p; f >= 0 && !(o[f].percent <= r); f--)
            ;
          f = c(f, s - 2);
        } else {
          for (f = h; f < s && !(o[f].percent > r); f++)
            ;
          f = c(f - 1, s - 2);
        }
        d = o[f + 1], v = o[f];
      }
      if (v && d) {
        this._lastFr = f, this._lastFrP = r;
        var m = d.percent - v.percent, g = m === 0 ? 1 : c((r - v.percent) / m, 1);
        d.easingFunc && (g = d.easingFunc(g));
        var y = n ? this._additiveValue : l ? Xi : e[u];
        if ((Ao(a) || l) && !y && (y = this._additiveValue = []), this.discrete)
          e[u] = g < 1 ? v.rawValue : d.rawValue;
        else if (Ao(a))
          a === cs ? pl(y, v[i], d[i], g) : Ub(y, v[i], d[i], g);
        else if (Qv(a)) {
          var _ = v[i], S = d[i], b = a === $f;
          e[u] = {
            type: b ? "linear" : "radial",
            x: cr(_.x, S.x, g),
            y: cr(_.y, S.y, g),
            colorStops: X(_.colorStops, function(T, M) {
              var D = S.colorStops[M];
              return {
                offset: cr(T.offset, D.offset, g),
                color: hs(pl([], T.color, D.color, g))
              };
            }),
            global: S.global
          }, b ? (e[u].x2 = cr(_.x2, S.x2, g), e[u].y2 = cr(_.y2, S.y2, g)) : e[u].r = cr(_.r, S.r, g);
        } else if (l)
          pl(y, v[i], d[i], g), n || (e[u] = hs(y));
        else {
          var w = cr(v[i], d[i], g);
          n ? this._additiveValue = w : e[u] = w;
        }
        n && this._addToTarget(e);
      }
    }
  }, t.prototype._addToTarget = function(e) {
    var r = this.valType, n = this.propName, i = this._additiveValue;
    r === Eo ? e[n] = e[n] + i : r === ga ? (Lt(e[n], Xi), Mo(Xi, Xi, i, 1), e[n] = hs(Xi)) : r === cs ? Mo(e[n], e[n], i, 1) : r === gy && qv(e[n], e[n], i, 1);
  }, t;
}(), sc = function() {
  function t(e, r, n, i) {
    if (this._tracks = {}, this._trackKeys = [], this._maxTime = 0, this._started = 0, this._clip = null, this._target = e, this._loop = r, r && i) {
      _i("Can' use additive animation on looped animation.");
      return;
    }
    this._additiveAnimators = i, this._allowDiscrete = n;
  }
  return t.prototype.getMaxTime = function() {
    return this._maxTime;
  }, t.prototype.getDelay = function() {
    return this._delay;
  }, t.prototype.getLoop = function() {
    return this._loop;
  }, t.prototype.getTarget = function() {
    return this._target;
  }, t.prototype.changeTarget = function(e) {
    this._target = e;
  }, t.prototype.when = function(e, r, n) {
    return this.whenWithKeys(e, r, le(r), n);
  }, t.prototype.whenWithKeys = function(e, r, n, i) {
    for (var a = this._tracks, o = 0; o < n.length; o++) {
      var s = n[o], u = a[s];
      if (!u) {
        u = a[s] = new Zb(s);
        var l = void 0, f = this._getAdditiveTrack(s);
        if (f) {
          var h = f.keyframes, c = h[h.length - 1];
          l = c && c.value, f.valType === ga && l && (l = hs(l));
        } else
          l = this._target[s];
        if (l == null)
          continue;
        e > 0 && u.addKeyframe(0, fs(l), i), this._trackKeys.push(s);
      }
      u.addKeyframe(e, fs(r[s]), i);
    }
    return this._maxTime = Math.max(this._maxTime, e), this;
  }, t.prototype.pause = function() {
    this._clip.pause(), this._paused = !0;
  }, t.prototype.resume = function() {
    this._clip.resume(), this._paused = !1;
  }, t.prototype.isPaused = function() {
    return !!this._paused;
  }, t.prototype.duration = function(e) {
    return this._maxTime = e, this._force = !0, this;
  }, t.prototype._doneCallback = function() {
    this._setTracksFinished(), this._clip = null;
    var e = this._doneCbs;
    if (e)
      for (var r = e.length, n = 0; n < r; n++)
        e[n].call(this);
  }, t.prototype._abortedCallback = function() {
    this._setTracksFinished();
    var e = this.animation, r = this._abortedCbs;
    if (e && e.removeClip(this._clip), this._clip = null, r)
      for (var n = 0; n < r.length; n++)
        r[n].call(this);
  }, t.prototype._setTracksFinished = function() {
    for (var e = this._tracks, r = this._trackKeys, n = 0; n < r.length; n++)
      e[r[n]].setFinished();
  }, t.prototype._getAdditiveTrack = function(e) {
    var r, n = this._additiveAnimators;
    if (n)
      for (var i = 0; i < n.length; i++) {
        var a = n[i].getTrack(e);
        a && (r = a);
      }
    return r;
  }, t.prototype.start = function(e) {
    if (!(this._started > 0)) {
      this._started = 1;
      for (var r = this, n = [], i = this._maxTime || 0, a = 0; a < this._trackKeys.length; a++) {
        var o = this._trackKeys[a], s = this._tracks[o], u = this._getAdditiveTrack(o), l = s.keyframes, f = l.length;
        if (s.prepare(i, u), s.needsAnimate())
          if (!this._allowDiscrete && s.discrete) {
            var h = l[f - 1];
            h && (r._target[s.propName] = h.rawValue), s.setFinished();
          } else
            n.push(s);
      }
      if (n.length || this._force) {
        var c = new Lb({
          life: i,
          loop: this._loop,
          delay: this._delay || 0,
          onframe: function(v) {
            r._started = 2;
            var d = r._additiveAnimators;
            if (d) {
              for (var p = !1, m = 0; m < d.length; m++)
                if (d[m]._clip) {
                  p = !0;
                  break;
                }
              p || (r._additiveAnimators = null);
            }
            for (var m = 0; m < n.length; m++)
              n[m].step(r._target, v);
            var g = r._onframeCbs;
            if (g)
              for (var m = 0; m < g.length; m++)
                g[m](r._target, v);
          },
          ondestroy: function() {
            r._doneCallback();
          }
        });
        this._clip = c, this.animation && this.animation.addClip(c), e && c.setEasing(e);
      } else
        this._doneCallback();
      return this;
    }
  }, t.prototype.stop = function(e) {
    if (this._clip) {
      var r = this._clip;
      e && r.onframe(1), this._abortedCallback();
    }
  }, t.prototype.delay = function(e) {
    return this._delay = e, this;
  }, t.prototype.during = function(e) {
    return e && (this._onframeCbs || (this._onframeCbs = []), this._onframeCbs.push(e)), this;
  }, t.prototype.done = function(e) {
    return e && (this._doneCbs || (this._doneCbs = []), this._doneCbs.push(e)), this;
  }, t.prototype.aborted = function(e) {
    return e && (this._abortedCbs || (this._abortedCbs = []), this._abortedCbs.push(e)), this;
  }, t.prototype.getClip = function() {
    return this._clip;
  }, t.prototype.getTrack = function(e) {
    return this._tracks[e];
  }, t.prototype.getTracks = function() {
    var e = this;
    return X(this._trackKeys, function(r) {
      return e._tracks[r];
    });
  }, t.prototype.stopTracks = function(e, r) {
    if (!e.length || !this._clip)
      return !0;
    for (var n = this._tracks, i = this._trackKeys, a = 0; a < e.length; a++) {
      var o = n[e[a]];
      o && !o.isFinished() && (r ? o.step(this._target, 1) : this._started === 1 && o.step(this._target, 0), o.setFinished());
    }
    for (var s = !0, a = 0; a < i.length; a++)
      if (!n[i[a]].isFinished()) {
        s = !1;
        break;
      }
    return s && this._abortedCallback(), s;
  }, t.prototype.saveTo = function(e, r, n) {
    if (e) {
      r = r || this._trackKeys;
      for (var i = 0; i < r.length; i++) {
        var a = r[i], o = this._tracks[a];
        if (!(!o || o.isFinished())) {
          var s = o.keyframes, u = s[n ? 0 : s.length - 1];
          u && (e[a] = fs(u.rawValue));
        }
      }
    }
  }, t.prototype.__changeFinalValue = function(e, r) {
    r = r || le(e);
    for (var n = 0; n < r.length; n++) {
      var i = r[n], a = this._tracks[i];
      if (a) {
        var o = a.keyframes;
        if (o.length > 1) {
          var s = o.pop();
          a.addKeyframe(s.time, e[i]), a.prepare(this._maxTime, a.getAdditiveTrack());
        }
      }
    }
  }, t;
}();
function hi() {
  return (/* @__PURE__ */ new Date()).getTime();
}
var $b = function(t) {
  V(e, t);
  function e(r) {
    var n = t.call(this) || this;
    return n._running = !1, n._time = 0, n._pausedTime = 0, n._pauseStart = 0, n._paused = !1, r = r || {}, n.stage = r.stage || {}, n;
  }
  return e.prototype.addClip = function(r) {
    r.animation && this.removeClip(r), this._head ? (this._tail.next = r, r.prev = this._tail, r.next = null, this._tail = r) : this._head = this._tail = r, r.animation = this;
  }, e.prototype.addAnimator = function(r) {
    r.animation = this;
    var n = r.getClip();
    n && this.addClip(n);
  }, e.prototype.removeClip = function(r) {
    if (r.animation) {
      var n = r.prev, i = r.next;
      n ? n.next = i : this._head = i, i ? i.prev = n : this._tail = n, r.next = r.prev = r.animation = null;
    }
  }, e.prototype.removeAnimator = function(r) {
    var n = r.getClip();
    n && this.removeClip(n), r.animation = null;
  }, e.prototype.update = function(r) {
    for (var n = hi() - this._pausedTime, i = n - this._time, a = this._head; a; ) {
      var o = a.next, s = a.step(n, i);
      s && (a.ondestroy(), this.removeClip(a)), a = o;
    }
    this._time = n, r || (this.trigger("frame", i), this.stage.update && this.stage.update());
  }, e.prototype._startLoop = function() {
    var r = this;
    this._running = !0;
    function n() {
      r._running && (zf(n), !r._paused && r.update());
    }
    zf(n);
  }, e.prototype.start = function() {
    this._running || (this._time = hi(), this._pausedTime = 0, this._startLoop());
  }, e.prototype.stop = function() {
    this._running = !1;
  }, e.prototype.pause = function() {
    this._paused || (this._pauseStart = hi(), this._paused = !0);
  }, e.prototype.resume = function() {
    this._paused && (this._pausedTime += hi() - this._pauseStart, this._paused = !1);
  }, e.prototype.clear = function() {
    for (var r = this._head; r; ) {
      var n = r.next;
      r.prev = r.next = r.animation = null, r = n;
    }
    this._head = this._tail = null;
  }, e.prototype.isFinished = function() {
    return this._head == null;
  }, e.prototype.animate = function(r, n) {
    n = n || {}, this.start();
    var i = new sc(r, n.loop);
    return this.addAnimator(i), i;
  }, e;
}(ar), qb = 300, gl = re.domSupported, ml = function() {
  var t = [
    "click",
    "dblclick",
    "mousewheel",
    "wheel",
    "mouseout",
    "mouseup",
    "mousedown",
    "mousemove",
    "contextmenu"
  ], e = [
    "touchstart",
    "touchend",
    "touchmove"
  ], r = {
    pointerdown: 1,
    pointerup: 1,
    pointermove: 1,
    pointerout: 1
  }, n = X(t, function(i) {
    var a = i.replace("mouse", "pointer");
    return r.hasOwnProperty(a) ? a : i;
  });
  return {
    mouse: t,
    touch: e,
    pointer: n
  };
}(), jv = {
  mouse: ["mousemove", "mouseup"],
  pointer: ["pointermove", "pointerup"]
}, Jv = !1;
function Kf(t) {
  var e = t.pointerType;
  return e === "pen" || e === "touch";
}
function Kb(t) {
  t.touching = !0, t.touchTimer != null && (clearTimeout(t.touchTimer), t.touchTimer = null), t.touchTimer = setTimeout(function() {
    t.touching = !1, t.touchTimer = null;
  }, 700);
}
function yl(t) {
  t && (t.zrByTouch = !0);
}
function Qb(t, e) {
  return pt(t.dom, new jb(t, e), !0);
}
function my(t, e) {
  for (var r = e, n = !1; r && r.nodeType !== 9 && !(n = r.domBelongToZr || r !== e && r === t.painterRoot); )
    r = r.parentNode;
  return n;
}
var jb = /* @__PURE__ */ function() {
  function t(e, r) {
    this.stopPropagation = Fe, this.stopImmediatePropagation = Fe, this.preventDefault = Fe, this.type = r.type, this.target = this.currentTarget = e.dom, this.pointerType = r.pointerType, this.clientX = r.clientX, this.clientY = r.clientY;
  }
  return t;
}(), It = {
  mousedown: function(t) {
    t = pt(this.dom, t), this.__mayPointerCapture = [t.zrX, t.zrY], this.trigger("mousedown", t);
  },
  mousemove: function(t) {
    t = pt(this.dom, t);
    var e = this.__mayPointerCapture;
    e && (t.zrX !== e[0] || t.zrY !== e[1]) && this.__togglePointerCapture(!0), this.trigger("mousemove", t);
  },
  mouseup: function(t) {
    t = pt(this.dom, t), this.__togglePointerCapture(!1), this.trigger("mouseup", t);
  },
  mouseout: function(t) {
    t = pt(this.dom, t);
    var e = t.toElement || t.relatedTarget;
    my(this, e) || (this.__pointerCapturing && (t.zrEventControl = "no_globalout"), this.trigger("mouseout", t));
  },
  wheel: function(t) {
    Jv = !0, t = pt(this.dom, t), this.trigger("mousewheel", t);
  },
  mousewheel: function(t) {
    Jv || (t = pt(this.dom, t), this.trigger("mousewheel", t));
  },
  touchstart: function(t) {
    t = pt(this.dom, t), yl(t), this.__lastTouchMoment = /* @__PURE__ */ new Date(), this.handler.processGesture(t, "start"), It.mousemove.call(this, t), It.mousedown.call(this, t);
  },
  touchmove: function(t) {
    t = pt(this.dom, t), yl(t), this.handler.processGesture(t, "change"), It.mousemove.call(this, t);
  },
  touchend: function(t) {
    t = pt(this.dom, t), yl(t), this.handler.processGesture(t, "end"), It.mouseup.call(this, t), +/* @__PURE__ */ new Date() - +this.__lastTouchMoment < qb && It.click.call(this, t);
  },
  pointerdown: function(t) {
    It.mousedown.call(this, t);
  },
  pointermove: function(t) {
    Kf(t) || It.mousemove.call(this, t);
  },
  pointerup: function(t) {
    It.mouseup.call(this, t);
  },
  pointerout: function(t) {
    Kf(t) || It.mouseout.call(this, t);
  }
};
x(["click", "dblclick", "contextmenu"], function(t) {
  It[t] = function(e) {
    e = pt(this.dom, e), this.trigger(t, e);
  };
});
var Qf = {
  pointermove: function(t) {
    Kf(t) || Qf.mousemove.call(this, t);
  },
  pointerup: function(t) {
    Qf.mouseup.call(this, t);
  },
  mousemove: function(t) {
    this.trigger("mousemove", t);
  },
  mouseup: function(t) {
    var e = this.__pointerCapturing;
    this.__togglePointerCapture(!1), this.trigger("mouseup", t), e && (t.zrEventControl = "only_globalout", this.trigger("mouseout", t));
  }
};
function Jb(t, e) {
  var r = e.domHandlers;
  re.pointerEventsSupported ? x(ml.pointer, function(n) {
    vs(e, n, function(i) {
      r[n].call(t, i);
    });
  }) : (re.touchEventsSupported && x(ml.touch, function(n) {
    vs(e, n, function(i) {
      r[n].call(t, i), Kb(e);
    });
  }), x(ml.mouse, function(n) {
    vs(e, n, function(i) {
      i = rc(i), e.touching || r[n].call(t, i);
    });
  }));
}
function ew(t, e) {
  re.pointerEventsSupported ? x(jv.pointer, r) : re.touchEventsSupported || x(jv.mouse, r);
  function r(n) {
    function i(a) {
      a = rc(a), my(t, a.target) || (a = Qb(t, a), e.domHandlers[n].call(t, a));
    }
    vs(e, n, i, { capture: !0 });
  }
}
function vs(t, e, r, n) {
  t.mounted[e] = r, t.listenerOpts[e] = n, ub(t.domTarget, e, r, n);
}
function _l(t) {
  var e = t.mounted;
  for (var r in e)
    e.hasOwnProperty(r) && lb(t.domTarget, r, e[r], t.listenerOpts[r]);
  t.mounted = {};
}
var ed = /* @__PURE__ */ function() {
  function t(e, r) {
    this.mounted = {}, this.listenerOpts = {}, this.touching = !1, this.domTarget = e, this.domHandlers = r;
  }
  return t;
}(), tw = function(t) {
  V(e, t);
  function e(r, n) {
    var i = t.call(this) || this;
    return i.__pointerCapturing = !1, i.dom = r, i.painterRoot = n, i._localHandlerScope = new ed(r, It), gl && (i._globalHandlerScope = new ed(document, Qf)), Jb(i, i._localHandlerScope), i;
  }
  return e.prototype.dispose = function() {
    _l(this._localHandlerScope), gl && _l(this._globalHandlerScope);
  }, e.prototype.setCursor = function(r) {
    this.dom.style && (this.dom.style.cursor = r || "default");
  }, e.prototype.__togglePointerCapture = function(r) {
    if (this.__mayPointerCapture = null, gl && +this.__pointerCapturing ^ +r) {
      this.__pointerCapturing = r;
      var n = this._globalHandlerScope;
      r ? ew(this, n) : _l(n);
    }
  }, e;
}(ar), yy = 1;
re.hasGlobalWindow && (yy = Math.max(window.devicePixelRatio || window.screen && window.screen.deviceXDPI / window.screen.logicalXDPI || 1, 1));
var td = yy, jf = 0.4, Jf = "#333", eh = "#ccc", rw = "#eee", rd = io, nd = 5e-5;
function jr(t) {
  return t > nd || t < -nd;
}
var Jr = [], Un = [], Sl = $t(), bl = Math.abs, so = function() {
  function t() {
  }
  return t.prototype.getLocalTransform = function(e) {
    return nw(this, e);
  }, t.prototype.setPosition = function(e) {
    this.x = e[0], this.y = e[1];
  }, t.prototype.setScale = function(e) {
    this.scaleX = e[0], this.scaleY = e[1];
  }, t.prototype.setSkew = function(e) {
    this.skewX = e[0], this.skewY = e[1];
  }, t.prototype.setOrigin = function(e) {
    this.originX = e[0], this.originY = e[1];
  }, t.prototype.needLocalTransform = function() {
    return jr(this.rotation) || jr(this.x) || jr(this.y) || jr(this.scaleX - 1) || jr(this.scaleY - 1) || jr(this.skewX) || jr(this.skewY);
  }, t.prototype.updateTransform = function() {
    var e = this.parent && this.parent.transform, r = this.needLocalTransform(), n = this.transform;
    if (!(r || e)) {
      n && (rd(n), this.invTransform = null);
      return;
    }
    n = n || $t(), r ? this.getLocalTransform(n) : rd(n), e && (r ? xa(n, e, n) : nc(n, e)), this.transform = n, this._resolveGlobalScaleRatio(n), this.invTransform = this.invTransform || $t(), ao(this.invTransform, n);
  }, t.prototype._resolveGlobalScaleRatio = function(e) {
    var r = this.globalScaleRatio;
    if (r != null && r !== 1) {
      this.getGlobalScale(Jr);
      var n = Jr[0] < 0 ? -1 : 1, i = Jr[1] < 0 ? -1 : 1, a = ((Jr[0] - n) * r + n) / Jr[0] || 0, o = ((Jr[1] - i) * r + i) / Jr[1] || 0;
      e[0] *= a, e[1] *= a, e[2] *= o, e[3] *= o;
    }
  }, t.prototype.getComputedTransform = function() {
    for (var e = this, r = []; e; )
      r.push(e), e = e.parent;
    for (; e = r.pop(); )
      e.updateTransform();
    return this.transform;
  }, t.prototype.setLocalTransform = function(e) {
    if (e) {
      var r = e[0] * e[0] + e[1] * e[1], n = e[2] * e[2] + e[3] * e[3], i = Math.atan2(e[1], e[0]), a = Math.PI / 2 + i - Math.atan2(e[3], e[2]);
      n = Math.sqrt(n) * Math.cos(a), r = Math.sqrt(r), this.skewX = a, this.skewY = 0, this.rotation = -i, this.x = +e[4], this.y = +e[5], this.scaleX = r, this.scaleY = n, this.originX = 0, this.originY = 0;
    }
  }, t.prototype.decomposeTransform = function() {
    if (this.transform) {
      var e = this.parent, r = this.transform;
      e && e.transform && (e.invTransform = e.invTransform || $t(), xa(Un, e.invTransform, r), r = Un);
      var n = this.originX, i = this.originY;
      (n || i) && (Sl[4] = n, Sl[5] = i, xa(Un, r, Sl), Un[4] -= n, Un[5] -= i, r = Un), this.setLocalTransform(r);
    }
  }, t.prototype.getGlobalScale = function(e) {
    var r = this.transform;
    return e = e || [], r ? (e[0] = Math.sqrt(r[0] * r[0] + r[1] * r[1]), e[1] = Math.sqrt(r[2] * r[2] + r[3] * r[3]), r[0] < 0 && (e[0] = -e[0]), r[3] < 0 && (e[1] = -e[1]), e) : (e[0] = 1, e[1] = 1, e);
  }, t.prototype.transformCoordToLocal = function(e, r) {
    var n = [e, r], i = this.invTransform;
    return i && Ct(n, n, i), n;
  }, t.prototype.transformCoordToGlobal = function(e, r) {
    var n = [e, r], i = this.transform;
    return i && Ct(n, n, i), n;
  }, t.prototype.getLineScale = function() {
    var e = this.transform;
    return e && bl(e[0] - 1) > 1e-10 && bl(e[3] - 1) > 1e-10 ? Math.sqrt(bl(e[0] * e[3] - e[2] * e[1])) : 1;
  }, t.prototype.copyTransform = function(e) {
    Ba(this, e);
  }, t.getLocalTransform = function(e, r) {
    r = r || [];
    var n = e.originX || 0, i = e.originY || 0, a = e.scaleX, o = e.scaleY, s = e.anchorX, u = e.anchorY, l = e.rotation || 0, f = e.x, h = e.y, c = e.skewX ? Math.tan(e.skewX) : 0, v = e.skewY ? Math.tan(-e.skewY) : 0;
    if (n || i || s || u) {
      var d = n + s, p = i + u;
      r[4] = -d * a - c * p * o, r[5] = -p * o - v * d * a;
    } else
      r[4] = r[5] = 0;
    return r[0] = a, r[3] = o, r[1] = v * a, r[2] = c * o, l && ic(r, r, l), r[4] += n + f, r[5] += i + h, r;
  }, t.initDefaultProps = function() {
    var e = t.prototype;
    e.scaleX = e.scaleY = e.globalScaleRatio = 1, e.x = e.y = e.originX = e.originY = e.skewX = e.skewY = e.rotation = e.anchorX = e.anchorY = 0;
  }(), t;
}(), nw = so.getLocalTransform, xu = [
  "x",
  "y",
  "originX",
  "originY",
  "anchorX",
  "anchorY",
  "rotation",
  "scaleX",
  "scaleY",
  "skewX",
  "skewY"
];
function Ba(t, e) {
  return RS(t, e, xu);
}
function qt(t) {
  Io || (Io = new xi(100)), t = t || gr;
  var e = Io.get(t);
  return e || (e = {
    font: t,
    strWidthCache: new xi(500),
    asciiWidthMap: null,
    asciiWidthMapTried: !1,
    stWideCharWidth: Zt.measureText("国", t).width,
    asciiCharWidth: Zt.measureText("a", t).width
  }, Io.put(t, e)), e;
}
var Io;
function iw(t) {
  if (!(wl >= id)) {
    t = t || gr;
    for (var e = [], r = +/* @__PURE__ */ new Date(), n = 0; n <= 127; n++)
      e[n] = Zt.measureText(String.fromCharCode(n), t).width;
    var i = +/* @__PURE__ */ new Date() - r;
    return i > 16 ? wl = id : i > 2 && wl++, e;
  }
}
var wl = 0, id = 5;
function _y(t, e) {
  return t.asciiWidthMapTried || (t.asciiWidthMap = iw(t.font), t.asciiWidthMapTried = !0), 0 <= e && e <= 127 ? t.asciiWidthMap != null ? t.asciiWidthMap[e] : t.asciiCharWidth : t.stWideCharWidth;
}
function Kt(t, e) {
  var r = t.strWidthCache, n = r.get(e);
  return n == null && (n = Zt.measureText(e, t.font).width, r.put(e, n)), n;
}
function ad(t, e, r, n) {
  var i = Kt(qt(e), t), a = uo(e), o = Ci(0, i, r), s = En(0, a, n), u = new ie(o, s, i, a);
  return u;
}
function Sy(t, e, r, n) {
  var i = ((t || "") + "").split(`
`), a = i.length;
  if (a === 1)
    return ad(i[0], e, r, n);
  for (var o = new ie(0, 0, 0, 0), s = 0; s < i.length; s++) {
    var u = ad(i[s], e, r, n);
    s === 0 ? o.copy(u) : o.union(u);
  }
  return o;
}
function Ci(t, e, r, n) {
  return r === "right" ? n ? t += e : t -= e : r === "center" && (n ? t += e / 2 : t -= e / 2), t;
}
function En(t, e, r, n) {
  return r === "middle" ? n ? t += e / 2 : t -= e / 2 : r === "bottom" && (n ? t += e : t -= e), t;
}
function uo(t) {
  return qt(t).stWideCharWidth;
}
function Di(t, e) {
  return typeof t == "string" ? t.lastIndexOf("%") >= 0 ? parseFloat(t) / 100 * e : parseFloat(t) : t;
}
function by(t, e, r) {
  var n = e.position || "inside", i = e.distance != null ? e.distance : 5, a = r.height, o = r.width, s = a / 2, u = r.x, l = r.y, f = "left", h = "top";
  if (n instanceof Array)
    u += Di(n[0], r.width), l += Di(n[1], r.height), f = null, h = null;
  else
    switch (n) {
      case "left":
        u -= i, l += s, f = "right", h = "middle";
        break;
      case "right":
        u += i + o, l += s, h = "middle";
        break;
      case "top":
        u += o / 2, l -= i, f = "center", h = "bottom";
        break;
      case "bottom":
        u += o / 2, l += a + i, f = "center";
        break;
      case "inside":
        u += o / 2, l += s, f = "center", h = "middle";
        break;
      case "insideLeft":
        u += i, l += s, h = "middle";
        break;
      case "insideRight":
        u += o - i, l += s, f = "right", h = "middle";
        break;
      case "insideTop":
        u += o / 2, l += i, f = "center";
        break;
      case "insideBottom":
        u += o / 2, l += a - i, f = "center", h = "bottom";
        break;
      case "insideTopLeft":
        u += i, l += i;
        break;
      case "insideTopRight":
        u += o - i, l += i, f = "right";
        break;
      case "insideBottomLeft":
        u += i, l += a - i, h = "bottom";
        break;
      case "insideBottomRight":
        u += o - i, l += a - i, f = "right", h = "bottom";
        break;
    }
  return t = t || {}, t.x = u, t.y = l, t.align = f, t.verticalAlign = h, t;
}
var Tl = "__zr_normal__", xl = xu.concat(["ignore"]), aw = ki(xu, function(t, e) {
  return t[e] = !0, t;
}, { ignore: !1 }), Wn = {}, ow = new ie(0, 0, 0, 0), Oo = [], ds = 0, Cu = 1, Du = function() {
  function t(e) {
    this.id = qm(), this.animators = [], this.currentStates = [], this.states = {}, this._init(e);
  }
  return t.prototype._init = function(e) {
    this.attr(e);
  }, t.prototype.drift = function(e, r, n) {
    switch (this.draggable) {
      case "horizontal":
        r = 0;
        break;
      case "vertical":
        e = 0;
        break;
    }
    var i = this.transform;
    i || (i = this.transform = [1, 0, 0, 1, 0, 0]), i[4] += e, i[5] += r, this.decomposeTransform(), this.markRedraw();
  }, t.prototype.beforeUpdate = function() {
  }, t.prototype.afterUpdate = function() {
  }, t.prototype.update = function() {
    this.updateTransform(), this.__dirty && this.updateInnerText();
  }, t.prototype.updateInnerText = function(e) {
    var r = this._textContent;
    if (r && (!r.ignore || e)) {
      this.textConfig || (this.textConfig = {});
      var n = this.textConfig, i = n.local, a = r.innerTransformable, o = void 0, s = void 0, u = !1;
      a.parent = i ? this : null;
      var l = !1;
      a.copyTransform(r);
      var f = n.position != null, h = n.autoOverflowArea, c = void 0;
      if ((h || f) && (c = ow, n.layoutRect ? c.copy(n.layoutRect) : c.copy(this.getBoundingRect()), i || c.applyTransform(this.transform)), f) {
        this.calculateTextPosition ? this.calculateTextPosition(Wn, n, c) : by(Wn, n, c), a.x = Wn.x, a.y = Wn.y, o = Wn.align, s = Wn.verticalAlign;
        var v = n.origin;
        if (v && n.rotation != null) {
          var d = void 0, p = void 0;
          v === "center" ? (d = c.width * 0.5, p = c.height * 0.5) : (d = Di(v[0], c.width), p = Di(v[1], c.height)), l = !0, a.originX = -a.x + d + (i ? 0 : c.x), a.originY = -a.y + p + (i ? 0 : c.y);
        }
      }
      n.rotation != null && (a.rotation = n.rotation);
      var m = n.offset;
      m && (a.x += m[0], a.y += m[1], l || (a.originX = -m[0], a.originY = -m[1]));
      var g = this._innerTextDefaultStyle || (this._innerTextDefaultStyle = {});
      if (h) {
        var y = g.overflowRect = g.overflowRect || new ie(0, 0, 0, 0);
        a.getLocalTransform(Oo), ao(Oo, Oo), ie.copy(y, c), y.applyTransform(Oo);
      } else
        g.overflowRect = null;
      var _ = n.inside == null ? typeof n.position == "string" && n.position.indexOf("inside") >= 0 : n.inside, S = void 0, b = void 0, w = void 0;
      _ && this.canBeInsideText() ? (S = n.insideFill, b = n.insideStroke, (S == null || S === "auto") && (S = this.getInsideTextFill()), (b == null || b === "auto") && (b = this.getInsideTextStroke(S), w = !0)) : (S = n.outsideFill, b = n.outsideStroke, (S == null || S === "auto") && (S = this.getOutsideFill()), (b == null || b === "auto") && (b = this.getOutsideStroke(S), w = !0)), S = S || "#000", (S !== g.fill || b !== g.stroke || w !== g.autoStroke || o !== g.align || s !== g.verticalAlign) && (u = !0, g.fill = S, g.stroke = b, g.autoStroke = w, g.align = o, g.verticalAlign = s, r.setDefaultTextStyle(g)), r.__dirty |= Ot, u && r.dirtyStyle(!0);
    }
  }, t.prototype.canBeInsideText = function() {
    return !0;
  }, t.prototype.getInsideTextFill = function() {
    return "#fff";
  }, t.prototype.getInsideTextStroke = function(e) {
    return "#000";
  }, t.prototype.getOutsideFill = function() {
    return this.__zr && this.__zr.isDarkMode() ? eh : Jf;
  }, t.prototype.getOutsideStroke = function(e) {
    var r = this.__zr && this.__zr.getBackgroundColor(), n = typeof r == "string" && Lt(r);
    n || (n = [255, 255, 255, 1]);
    for (var i = n[3], a = this.__zr.isDarkMode(), o = 0; o < 3; o++)
      n[o] = n[o] * i + (a ? 0 : 255) * (1 - i);
    return n[3] = 1, oo(n, "rgba");
  }, t.prototype.traverse = function(e, r) {
  }, t.prototype.attrKV = function(e, r) {
    e === "textConfig" ? this.setTextConfig(r) : e === "textContent" ? this.setTextContent(r) : e === "clipPath" ? this.setClipPath(r) : e === "extra" ? (this.extra = this.extra || {}, R(this.extra, r)) : this[e] = r;
  }, t.prototype.hide = function() {
    this.ignore = !0, this.markRedraw();
  }, t.prototype.show = function() {
    this.ignore = !1, this.markRedraw();
  }, t.prototype.attr = function(e, r) {
    if (typeof e == "string")
      this.attrKV(e, r);
    else if (q(e))
      for (var n = e, i = le(n), a = 0; a < i.length; a++) {
        var o = i[a];
        this.attrKV(o, e[o]);
      }
    return this.markRedraw(), this;
  }, t.prototype.saveCurrentToNormalState = function(e) {
    this._innerSaveToNormal(e);
    for (var r = this._normalState, n = 0; n < this.animators.length; n++) {
      var i = this.animators[n], a = i.__fromStateTransition;
      if (!(i.getLoop() || a && a !== Tl)) {
        var o = i.targetName, s = o ? r[o] : r;
        i.saveTo(s);
      }
    }
  }, t.prototype._innerSaveToNormal = function(e) {
    var r = this._normalState;
    r || (r = this._normalState = {}), e.textConfig && !r.textConfig && (r.textConfig = this.textConfig), this._savePrimaryToNormal(e, r, xl);
  }, t.prototype._savePrimaryToNormal = function(e, r, n) {
    for (var i = 0; i < n.length; i++) {
      var a = n[i];
      e[a] != null && !(a in r) && (r[a] = this[a]);
    }
  }, t.prototype.hasState = function() {
    return this.currentStates.length > 0;
  }, t.prototype.getState = function(e) {
    return this.states[e];
  }, t.prototype.ensureState = function(e) {
    var r = this.states;
    return r[e] || (r[e] = {}), r[e];
  }, t.prototype.clearStates = function(e) {
    this.useState(Tl, !1, e);
  }, t.prototype.useState = function(e, r, n, i) {
    var a = e === Tl, o = this.hasState();
    if (!(!o && a)) {
      var s = this.currentStates, u = this.stateTransition;
      if (!(fe(s, e) >= 0 && (r || s.length === 1))) {
        var l;
        if (this.stateProxy && !a && (l = this.stateProxy(e)), l || (l = this.states && this.states[e]), !l && !a) {
          _i("State " + e + " not exists.");
          return;
        }
        a || this.saveCurrentToNormalState(l);
        var f = this._textContent, h = od(this, f, l, i);
        h && !this.__inHover && (this.__inHover = h), this._applyStateObj(e, l, this._normalState, r, ud(this, n, u), u);
        var c = this._textGuide;
        return f && f.useState(e, r, n, !!h), c && c.useState(e, r, n, !!h), a ? (this.currentStates = [], this._normalState = {}) : r ? this.currentStates.push(e) : this.currentStates = [e], this._updateAnimationTargets(), this.markRedraw(), !h && this.__inHover && (this.__inHover = ds, this.__dirty &= ~Ot), l;
      }
    }
  }, t.prototype.useStates = function(e, r, n) {
    if (!e.length)
      this.clearStates();
    else {
      var i = [], a = this.currentStates, o = e.length, s = o === a.length;
      if (s) {
        for (var u = 0; u < o; u++)
          if (e[u] !== a[u]) {
            s = !1;
            break;
          }
      }
      if (s)
        return;
      for (var u = 0; u < o; u++) {
        var l = e[u], f = void 0;
        this.stateProxy && (f = this.stateProxy(l, e)), f || (f = this.states[l]), f && i.push(f);
      }
      var h = i[o - 1], c = this._textContent, v = od(this, c, h, n);
      v && !this.__inHover && (this.__inHover = v);
      var d = this._mergeStates(i), p = this.stateTransition;
      this.saveCurrentToNormalState(d), this._applyStateObj(e.join(","), d, this._normalState, !1, ud(this, r, p), p);
      var m = this._textGuide;
      c && c.useStates(e, r, !!v), m && m.useStates(e, r, !!v), this._updateAnimationTargets(), this.currentStates = e.slice(), this.markRedraw(), !v && this.__inHover && (this.__inHover = ds, this.__dirty &= ~Ot);
    }
  }, t.prototype.isSilent = function() {
    for (var e = this; e; ) {
      if (e.silent)
        return !0;
      var r = e.__hostTarget;
      e = r ? e.ignoreHostSilent ? null : r : e.parent;
    }
    return !1;
  }, t.prototype._updateAnimationTargets = function() {
    for (var e = 0; e < this.animators.length; e++) {
      var r = this.animators[e];
      r.targetName && r.changeTarget(this[r.targetName]);
    }
  }, t.prototype.removeState = function(e) {
    var r = fe(this.currentStates, e);
    if (r >= 0) {
      var n = this.currentStates.slice();
      n.splice(r, 1), this.useStates(n);
    }
  }, t.prototype.replaceState = function(e, r, n) {
    var i = this.currentStates.slice(), a = fe(i, e), o = fe(i, r) >= 0;
    a >= 0 ? o ? i.splice(a, 1) : i[a] = r : n && !o && i.push(r), this.useStates(i);
  }, t.prototype.toggleState = function(e, r) {
    r ? this.useState(e, !0) : this.removeState(e);
  }, t.prototype._mergeStates = function(e) {
    for (var r = {}, n, i = 0; i < e.length; i++) {
      var a = e[i];
      R(r, a), a.textConfig && (n = n || {}, R(n, a.textConfig));
    }
    return n && (r.textConfig = n), r;
  }, t.prototype._applyStateObj = function(e, r, n, i, a, o) {
    if (this.__inHover !== Cu) {
      var s = !(r && i);
      r && r.textConfig ? (this.textConfig = R({}, i ? this.textConfig : n.textConfig), R(this.textConfig, r.textConfig)) : s && n.textConfig && (this.textConfig = n.textConfig);
      for (var u = {}, l = !1, f = 0; f < xl.length; f++) {
        var h = xl[f], c = a && aw[h];
        r && r[h] != null ? c ? (l = !0, u[h] = r[h]) : this[h] = r[h] : s && n[h] != null && (c ? (l = !0, u[h] = n[h]) : this[h] = n[h]);
      }
      if (!a)
        for (var f = 0; f < this.animators.length; f++) {
          var v = this.animators[f], d = v.targetName;
          v.getLoop() || v.__changeFinalValue(d ? (r || n)[d] : r || n);
        }
      l && this._transitionState(e, u, o);
    }
  }, t.prototype._attachComponent = function(e) {
    if (e.__zr && !e.__hostTarget) {
      if (process.env.NODE_ENV !== "production")
        throw new Error("Text element has been added to zrender.");
      return;
    }
    if (e === this) {
      if (process.env.NODE_ENV !== "production")
        throw new Error("Recursive component attachment.");
      return;
    }
    var r = this.__zr;
    r && e.addSelfToZr(r), e.__zr = r, e.__hostTarget = this;
  }, t.prototype._detachComponent = function(e) {
    e.__zr && e.removeSelfFromZr(e.__zr), e.__zr = null, e.__hostTarget = null;
  }, t.prototype.getClipPath = function() {
    return this._clipPath;
  }, t.prototype.setClipPath = function(e) {
    this._clipPath && this._clipPath !== e && this.removeClipPath(), this._attachComponent(e), this._clipPath = e, this.markRedraw();
  }, t.prototype.removeClipPath = function() {
    var e = this._clipPath;
    e && (this._detachComponent(e), this._clipPath = null, this.markRedraw());
  }, t.prototype.getTextContent = function() {
    return this._textContent;
  }, t.prototype.setTextContent = function(e) {
    var r = this._textContent;
    if (r !== e) {
      if (r && r !== e && this.removeTextContent(), process.env.NODE_ENV !== "production" && e.__zr && !e.__hostTarget)
        throw new Error("Text element has been added to zrender.");
      e.innerTransformable = new so(), this._attachComponent(e), this._textContent = e, this.markRedraw();
    }
  }, t.prototype.setTextConfig = function(e) {
    this.textConfig || (this.textConfig = {}), R(this.textConfig, e), this.markRedraw();
  }, t.prototype.removeTextConfig = function() {
    this.textConfig = null, this.markRedraw();
  }, t.prototype.removeTextContent = function() {
    var e = this._textContent;
    e && (e.innerTransformable = null, this._detachComponent(e), this._textContent = null, this._innerTextDefaultStyle = null, this.markRedraw());
  }, t.prototype.getTextGuideLine = function() {
    return this._textGuide;
  }, t.prototype.setTextGuideLine = function(e) {
    this._textGuide && this._textGuide !== e && this.removeTextGuideLine(), this._attachComponent(e), this._textGuide = e, this.markRedraw();
  }, t.prototype.removeTextGuideLine = function() {
    var e = this._textGuide;
    e && (this._detachComponent(e), this._textGuide = null, this.markRedraw());
  }, t.prototype.markRedraw = function() {
    this.__dirty |= Ot;
    var e = this.__zr;
    e && (this.__inHover ? e.refreshHover() : e.refresh()), this.__hostTarget && this.__hostTarget.markRedraw();
  }, t.prototype.dirty = function() {
    this.markRedraw();
  }, t.prototype.addSelfToZr = function(e) {
    if (this.__zr !== e) {
      this.__zr = e;
      var r = this.animators;
      if (r)
        for (var n = 0; n < r.length; n++)
          e.animation.addAnimator(r[n]);
      this._clipPath && this._clipPath.addSelfToZr(e), this._textContent && this._textContent.addSelfToZr(e), this._textGuide && this._textGuide.addSelfToZr(e);
    }
  }, t.prototype.removeSelfFromZr = function(e) {
    if (this.__zr) {
      this.__zr = null;
      var r = this.animators;
      if (r)
        for (var n = 0; n < r.length; n++)
          e.animation.removeAnimator(r[n]);
      this._clipPath && this._clipPath.removeSelfFromZr(e), this._textContent && this._textContent.removeSelfFromZr(e), this._textGuide && this._textGuide.removeSelfFromZr(e);
    }
  }, t.prototype.animate = function(e, r, n) {
    var i = e ? this[e] : this;
    if (process.env.NODE_ENV !== "production" && !i) {
      _i('Property "' + e + '" is not existed in element ' + this.id);
      return;
    }
    var a = new sc(i, r, n);
    return e && (a.targetName = e), this.addAnimator(a, e), a;
  }, t.prototype.addAnimator = function(e, r) {
    var n = this.__zr, i = this;
    e.during(function() {
      i.updateDuringAnimation(r);
    }).done(function() {
      var a = i.animators, o = fe(a, e);
      o >= 0 && a.splice(o, 1);
    }), this.animators.push(e), n && n.animation.addAnimator(e), n && n.wakeUp();
  }, t.prototype.updateDuringAnimation = function(e) {
    this.markRedraw();
  }, t.prototype.stopAnimation = function(e, r) {
    for (var n = this.animators, i = n.length, a = [], o = 0; o < i; o++) {
      var s = n[o];
      !e || e === s.scope ? s.stop(r) : a.push(s);
    }
    return this.animators = a, this;
  }, t.prototype.animateTo = function(e, r, n) {
    Cl(this, e, r, n);
  }, t.prototype.animateFrom = function(e, r, n) {
    Cl(this, e, r, n, !0);
  }, t.prototype._transitionState = function(e, r, n, i) {
    for (var a = Cl(this, r, n, i), o = 0; o < a.length; o++)
      a[o].__fromStateTransition = e;
  }, t.prototype.getBoundingRect = function() {
    return null;
  }, t.prototype.getPaintRect = function() {
    return null;
  }, t.initDefaultProps = function() {
    var e = t.prototype;
    e.type = "element", e.name = "", e.ignore = e.silent = e.ignoreHostSilent = e.isGroup = e.draggable = e.dragging = e.ignoreClip = !1, e.__inHover = ds, e.__dirty = Ot;
    var r = {};
    function n(a, o, s) {
      r[a + o + s] || (console.warn("DEPRECATED: '" + a + "' has been deprecated. use '" + o + "', '" + s + "' instead"), r[a + o + s] = !0);
    }
    function i(a, o, s, u) {
      Object.defineProperty(e, a, {
        get: function() {
          if (process.env.NODE_ENV !== "production" && n(a, s, u), !this[o]) {
            var f = this[o] = [];
            l(this, f);
          }
          return this[o];
        },
        set: function(f) {
          process.env.NODE_ENV !== "production" && n(a, s, u), this[s] = f[0], this[u] = f[1], this[o] = f, l(this, f);
        }
      });
      function l(f, h) {
        Object.defineProperty(h, 0, {
          get: function() {
            return f[s];
          },
          set: function(c) {
            f[s] = c;
          }
        }), Object.defineProperty(h, 1, {
          get: function() {
            return f[u];
          },
          set: function(c) {
            f[u] = c;
          }
        });
      }
    }
    Object.defineProperty && (i("position", "_legacyPos", "x", "y"), i("scale", "_legacyScale", "scaleX", "scaleY"), i("origin", "_legacyOrigin", "originX", "originY"));
  }(), t;
}();
ir(Du, ar);
ir(Du, so);
function Cl(t, e, r, n, i) {
  r = r || {};
  var a = [];
  wy(t, "", t, e, r, n, a, i);
  var o = a.length, s = !1, u = r.done, l = r.aborted, f = function() {
    s = !0, o--, o <= 0 && (s ? u && u() : l && l());
  }, h = function() {
    o--, o <= 0 && (s ? u && u() : l && l());
  };
  o || u && u(), a.length > 0 && r.during && a[0].during(function(d, p) {
    r.during(p);
  });
  for (var c = 0; c < a.length; c++) {
    var v = a[c];
    f && v.done(f), h && v.aborted(h), r.force && v.duration(r.duration), v.start(r.easing);
  }
  return a;
}
function Dl(t, e, r) {
  for (var n = 0; n < r; n++)
    t[n] = e[n];
}
function sw(t) {
  return ot(t[0]);
}
function uw(t, e, r) {
  if (ot(e[r]))
    if (ot(t[r]) || (t[r] = []), je(e[r])) {
      var n = e[r].length;
      t[r].length !== n && (t[r] = new e[r].constructor(n), Dl(t[r], e[r], n));
    } else {
      var i = e[r], a = t[r], o = i.length;
      if (sw(i))
        for (var s = i[0].length, u = 0; u < o; u++)
          a[u] ? Dl(a[u], i[u], s) : a[u] = Array.prototype.slice.call(i[u]);
      else
        Dl(a, i, o);
      a.length = i.length;
    }
  else
    t[r] = e[r];
}
function lw(t, e) {
  return t === e || ot(t) && ot(e) && fw(t, e);
}
function fw(t, e) {
  var r = t.length;
  if (r !== e.length)
    return !1;
  for (var n = 0; n < r; n++)
    if (t[n] !== e[n])
      return !1;
  return !0;
}
function wy(t, e, r, n, i, a, o, s) {
  for (var u = le(n), l = i.duration, f = i.delay, h = i.additive, c = i.setToFinal, v = !q(a), d = t.animators, p = [], m = 0; m < u.length; m++) {
    var g = u[m], y = n[g];
    if (y != null && r[g] != null && (v || a[g]))
      if (q(y) && !ot(y) && !Jh(y)) {
        if (e) {
          s || (r[g] = y, t.updateDuringAnimation(e));
          continue;
        }
        wy(t, g, r[g], y, i, a && a[g], o, s);
      } else
        p.push(g);
    else s || (r[g] = y, t.updateDuringAnimation(e), p.push(g));
  }
  var _ = p.length;
  if (!h && _)
    for (var S = 0; S < d.length; S++) {
      var b = d[S];
      if (b.targetName === e) {
        var w = b.stopTracks(p);
        if (w) {
          var T = fe(d, b);
          d.splice(T, 1);
        }
      }
    }
  if (i.force || (p = He(p, function(E) {
    return !lw(n[E], r[E]);
  }), _ = p.length), _ > 0 || i.force && !o.length) {
    var M = void 0, D = void 0, C = void 0;
    if (s) {
      D = {}, c && (M = {});
      for (var S = 0; S < _; S++) {
        var g = p[S];
        D[g] = r[g], c ? M[g] = n[g] : r[g] = n[g];
      }
    } else if (c) {
      C = {};
      for (var S = 0; S < _; S++) {
        var g = p[S];
        C[g] = fs(r[g]), uw(r, n, g);
      }
    }
    var b = new sc(r, !1, !1, h ? He(d, function(I) {
      return I.targetName === e;
    }) : null);
    b.targetName = e, i.scope && (b.scope = i.scope), c && M && b.whenWithKeys(0, M, p), C && b.whenWithKeys(0, C, p), b.whenWithKeys(l ?? 500, s ? D : n, p).delay(f || 0), t.addAnimator(b, e), o.push(b);
  }
}
function od(t, e, r, n) {
  return !(r && r.hoverLayer || n) || sd(t) || e && sd(e) ? ds : Cu;
}
function sd(t) {
  return t.type === "text" || t.type === "tspan";
}
function ud(t, e, r) {
  return !e && !t.__inHover && r && r.duration > 0;
}
var Re = function(t) {
  V(e, t);
  function e(r) {
    var n = t.call(this) || this;
    return n.isGroup = !0, n._children = [], n.attr(r), n;
  }
  return e.prototype.childrenRef = function() {
    return this._children;
  }, e.prototype.children = function() {
    return this._children.slice();
  }, e.prototype.childAt = function(r) {
    return this._children[r];
  }, e.prototype.childOfName = function(r) {
    for (var n = this._children, i = 0; i < n.length; i++)
      if (n[i].name === r)
        return n[i];
  }, e.prototype.childCount = function() {
    return this._children.length;
  }, e.prototype.add = function(r) {
    if (r && (r !== this && r.parent !== this && (this._children.push(r), this._doAdd(r)), process.env.NODE_ENV !== "production" && r.__hostTarget))
      throw "This elemenet has been used as an attachment";
    return this;
  }, e.prototype.addBefore = function(r, n) {
    if (r && r !== this && r.parent !== this && n && n.parent === this) {
      var i = this._children, a = i.indexOf(n);
      a >= 0 && (i.splice(a, 0, r), this._doAdd(r));
    }
    return this;
  }, e.prototype.replace = function(r, n) {
    var i = fe(this._children, r);
    return i >= 0 && this.replaceAt(n, i), this;
  }, e.prototype.replaceAt = function(r, n) {
    var i = this._children, a = i[n];
    if (r && r !== this && r.parent !== this && r !== a) {
      i[n] = r, a.parent = null;
      var o = this.__zr;
      o && a.removeSelfFromZr(o), this._doAdd(r);
    }
    return this;
  }, e.prototype._doAdd = function(r) {
    r.parent && r.parent.remove(r), r.parent = this;
    var n = this.__zr;
    n && n !== r.__zr && r.addSelfToZr(n), n && n.refresh();
  }, e.prototype.remove = function(r) {
    var n = this.__zr, i = this._children, a = fe(i, r);
    return a < 0 ? this : (i.splice(a, 1), r.parent = null, n && r.removeSelfFromZr(n), n && n.refresh(), this);
  }, e.prototype.removeAll = function() {
    for (var r = this._children, n = this.__zr, i = 0; i < r.length; i++) {
      var a = r[i];
      n && a.removeSelfFromZr(n), a.parent = null;
    }
    return r.length = 0, this;
  }, e.prototype.eachChild = function(r, n) {
    for (var i = this._children, a = 0; a < i.length; a++) {
      var o = i[a];
      r.call(n, o, a);
    }
    return this;
  }, e.prototype.traverse = function(r, n) {
    for (var i = 0; i < this._children.length; i++) {
      var a = this._children[i], o = r.call(n, a);
      a.isGroup && !o && a.traverse(r, n);
    }
    return this;
  }, e.prototype.addSelfToZr = function(r) {
    t.prototype.addSelfToZr.call(this, r);
    for (var n = 0; n < this._children.length; n++) {
      var i = this._children[n];
      i.addSelfToZr(r);
    }
  }, e.prototype.removeSelfFromZr = function(r) {
    t.prototype.removeSelfFromZr.call(this, r);
    for (var n = 0; n < this._children.length; n++) {
      var i = this._children[n];
      i.removeSelfFromZr(r);
    }
  }, e.prototype.getBoundingRect = function(r) {
    for (var n = new ie(0, 0, 0, 0), i = r || this._children, a = [], o = null, s = 0; s < i.length; s++) {
      var u = i[s];
      if (!(u.ignore || u.invisible)) {
        var l = u.getBoundingRect(), f = u.getLocalTransform(a);
        f ? (ie.applyTransform(n, l, f), o = o || n.clone(), o.union(n)) : (o = o || l.clone(), o.union(l));
      }
    }
    return o || n;
  }, e;
}(Du);
Re.prototype.type = "group";
/*!
* ZRender, a high performance 2d drawing library.
*
* Copyright (c) 2013, Baidu Inc.
* All rights reserved.
*
* LICENSE
* https://github.com/ecomfe/zrender/blob/master/LICENSE
*/
var ma = {}, Ty = {};
function hw(t) {
  delete Ty[t];
}
function cw(t) {
  if (!t)
    return !1;
  if (typeof t == "string")
    return Rs(t, 1) < jf;
  if (t.colorStops) {
    for (var e = t.colorStops, r = 0, n = e.length, i = 0; i < n; i++)
      r += Rs(e[i].color, 1);
    return r /= n, r < jf;
  }
  return !1;
}
var vw = function() {
  function t(e, r, n) {
    var i = this;
    this._sleepAfterStill = 10, this._stillFrameAccum = 0, this._needsRefresh = !0, this._needsRefreshHover = !1, this._darkMode = !1, n = n || {}, this.dom = r, this.id = e;
    var a = new Cb(), o = n.renderer || "canvas";
    if (ma[o] || (o = le(ma)[0]), process.env.NODE_ENV !== "production" && !ma[o])
      throw new Error("Renderer '" + o + "' is not imported. Please import it first.");
    n.useDirtyRect = n.useDirtyRect == null ? !1 : n.useDirtyRect;
    var s = new ma[o](r, a, n, e), u = n.ssr || s.ssrOnly;
    this.storage = a, this.painter = s;
    var l = !re.node && !re.worker && !u ? new tw(s.getViewportRoot(), s.root) : null, f = n.useCoarsePointer, h = f == null || f === "auto" ? re.touchEventsSupported : !!f, c = 44, v;
    h && (v = W(n.pointerSize, c)), this.handler = new ty(a, s, l, s.root, v), this.animation = new $b({
      stage: {
        update: u ? null : function() {
          return i._flush(!1);
        }
      }
    }), u || this.animation.start();
  }
  return t.prototype.add = function(e) {
    this._disposed || !e || (this.storage.addRoot(e), e.addSelfToZr(this), this.refresh());
  }, t.prototype.remove = function(e) {
    this._disposed || !e || (this.storage.delRoot(e), e.removeSelfFromZr(this), this.refresh());
  }, t.prototype.configLayer = function(e, r) {
    this._disposed || (this.painter.configLayer && this.painter.configLayer(e, r), this.refresh());
  }, t.prototype.setBackgroundColor = function(e) {
    this._disposed || (this.painter.setBackgroundColor && this.painter.setBackgroundColor(e), this.refresh(), this._backgroundColor = e, this._darkMode = cw(e));
  }, t.prototype.getBackgroundColor = function() {
    return this._backgroundColor;
  }, t.prototype.setDarkMode = function(e) {
    this._darkMode = e;
  }, t.prototype.isDarkMode = function() {
    return this._darkMode;
  }, t.prototype.refreshImmediately = function(e) {
    this._disposed || this._refresh({
      animUpdate: !e,
      refresh: !0,
      refreshHover: !1
    });
  }, t.prototype._refresh = function(e) {
    e.animUpdate && this.animation.update(!0), this._needsRefresh = this._needsRefreshHover = !1, this.painter.refresh({
      refresh: e.refresh,
      refreshHover: e.refreshHover
    }), this._needsRefresh = this._needsRefreshHover = !1;
  }, t.prototype.refresh = function() {
    this._disposed || (this._needsRefresh = !0, this.animation.start());
  }, t.prototype.flush = function() {
    this._disposed || this._flush(!0);
  }, t.prototype._flush = function(e) {
    var r, n = hi(), i = this._needsRefresh, a = this._needsRefreshHover;
    (i || a) && (r = !0, this._refresh({
      animUpdate: e,
      refresh: i,
      refreshHover: a
    }));
    var o = hi();
    r ? (this._stillFrameAccum = 0, this.trigger("rendered", {
      elapsedTime: o - n
    })) : this._sleepAfterStill > 0 && (this._stillFrameAccum++, this._stillFrameAccum > this._sleepAfterStill && this.animation.stop());
  }, t.prototype.setSleepAfterStill = function(e) {
    this._sleepAfterStill = e;
  }, t.prototype.wakeUp = function() {
    this._disposed || (this.animation.start(), this._stillFrameAccum = 0);
  }, t.prototype.refreshHover = function() {
    this._needsRefreshHover = !0;
  }, t.prototype.refreshHoverImmediately = function() {
    this._disposed || this._refresh({
      animUpdate: !1,
      refresh: !1,
      refreshHover: !0
    });
  }, t.prototype.resize = function(e) {
    this._disposed || (e = e || {}, this.painter.resize(e.width, e.height), this.handler.resize());
  }, t.prototype.clearAnimation = function() {
    this._disposed || this.animation.clear();
  }, t.prototype.getWidth = function() {
    if (!this._disposed)
      return this.painter.getWidth();
  }, t.prototype.getHeight = function() {
    if (!this._disposed)
      return this.painter.getHeight();
  }, t.prototype.setCursorStyle = function(e) {
    this._disposed || this.handler.setCursorStyle(e);
  }, t.prototype.findHover = function(e, r) {
    if (!this._disposed)
      return this.handler.findHover(e, r);
  }, t.prototype.on = function(e, r, n) {
    return this._disposed || this.handler.on(e, r, n), this;
  }, t.prototype.off = function(e, r) {
    this._disposed || this.handler.off(e, r);
  }, t.prototype.trigger = function(e, r) {
    this._disposed || this.handler.trigger(e, r);
  }, t.prototype.clear = function() {
    if (!this._disposed) {
      for (var e = this.storage.getRoots(), r = 0; r < e.length; r++)
        e[r] instanceof Re && e[r].removeSelfFromZr(this);
      this.storage.delAllRoots(), this.painter.clear();
    }
  }, t.prototype.dispose = function() {
    this._disposed || (this.animation.stop(), this.clear(), this.storage.dispose(), this.painter.dispose(), this.handler.dispose(), this.animation = this.storage = this.painter = this.handler = null, this._disposed = !0, hw(this.id));
  }, t;
}();
function ld(t, e) {
  var r = new vw(qm(), t, e);
  return Ty[r.id] = r, r;
}
function dw(t, e) {
  ma[t] = e;
}
var th;
function pw(t) {
  if (typeof th == "function")
    return th(t);
}
function gw(t) {
  th = t;
}
var fd = 1e-4, xy = 20;
function mw(t) {
  return t.replace(/^\s+|\s+$/g, "");
}
var st = Math.min, ye = Math.max, Pe = Math.abs, mr = Math.round, Ln = Math.floor, Vi = Math.ceil, Fi = Math.pow, Va = Math.log, rh = Math.LN10, yw = Math.PI, _w = Math.random;
function Oe(t, e, r, n) {
  var i = e[0], a = e[1], o = r[0], s = r[1], u = a - i, l = s - o;
  if (u === 0)
    return l === 0 ? o : (o + s) / 2;
  if (n)
    if (u > 0) {
      if (t <= i)
        return o;
      if (t >= a)
        return s;
    } else {
      if (t >= i)
        return o;
      if (t <= a)
        return s;
    }
  else {
    if (t === i)
      return o;
    if (t === a)
      return s;
  }
  return (t - i) / u * l + o;
}
var _t = Sw;
function Sw(t, e, r) {
  switch (t) {
    case "center":
    case "middle":
      t = "50%";
      break;
    case "left":
    case "top":
      t = "0%";
      break;
    case "right":
    case "bottom":
      t = "100%";
      break;
  }
  return nh(t, e, r);
}
function nh(t, e, r) {
  return z(t) ? bw(t) ? parseFloat(t) / 100 * e + (r || 0) : parseFloat(t) : t == null ? NaN : +t;
}
function bw(t) {
  return !!mw(t).match(/%$/);
}
function ue(t, e, r) {
  return process.env.NODE_ENV !== "production" && N(e != null), isNaN(e) ? r ? "" + t : +t : (e = st(ye(0, e), xy), t = (+t).toFixed(e), r ? t : +t);
}
function Lr(t) {
  return t.sort(function(e, r) {
    return e - r;
  }), t;
}
function vr(t) {
  if (t = +t, isNaN(t))
    return 0;
  if (t > 1e-14) {
    for (var e = 1, r = 0; r < 15; r++, e *= 10)
      if (mr(t * e) / e === t)
        return r;
  }
  return ww(t);
}
function ww(t) {
  var e = t.toString().toLowerCase(), r = e.indexOf("e"), n = r > 0 ? +e.slice(r + 1) : 0, i = r > 0 ? r : e.length, a = e.indexOf("."), o = a < 0 ? 0 : i - 1 - a;
  return ye(0, o - n);
}
function Cy(t, e, r) {
  var n = Pe(t[1] - t[0]);
  if (!isFinite(n) || n === 0)
    return NaN;
  var i = Va(2 * Pe(r || 1) * Pe(n)) / rh, a = Va(Pe(e)) / rh, o = ye(0, Vi(-i + a));
  return isFinite(o) || (o = NaN), o;
}
function _n(t, e) {
  var r = ye(vr(t), vr(e)), n = t + e;
  return r > xy ? n : ue(n, r);
}
var hd = Fi(2, 53) - 1;
function Dy(t) {
  var e = yw * 2;
  return (t % e + e) % e;
}
function Bs(t) {
  return t > -fd && t < fd;
}
var Tw = /^(?:(\d{4})(?:[-\/](\d{1,2})(?:[-\/](\d{1,2})(?:[T ](\d{1,2})(?::(\d{1,2})(?::(\d{1,2})(?:[.,](\d+))?)?)?(Z|[\+\-]\d\d:?\d\d)?)?)?)?)?$/;
function zi(t) {
  if (t instanceof Date)
    return t;
  if (z(t)) {
    var e = Tw.exec(t);
    if (!e)
      return /* @__PURE__ */ new Date(NaN);
    if (e[8]) {
      var r = +e[4] || 0;
      return e[8].toUpperCase() !== "Z" && (r -= +e[8].slice(0, 3)), new Date(Date.UTC(+e[1], +(e[2] || 1) - 1, +e[3] || 1, r, +(e[5] || 0), +e[6] || 0, e[7] ? +e[7].substring(0, 3) : 0));
    } else
      return new Date(+e[1], +(e[2] || 1) - 1, +e[3] || 1, +e[4] || 0, +(e[5] || 0), +e[6] || 0, e[7] ? +e[7].substring(0, 3) : 0);
  } else if (t == null)
    return /* @__PURE__ */ new Date(NaN);
  return new Date(mr(t));
}
function My(t) {
  return Fi(10, uc(t));
}
function uc(t) {
  if (t === 0)
    return 0;
  var e = Ln(Va(t) / rh);
  return t / Fi(10, e) >= 10 && e++, e;
}
var Ey = 2;
function lc(t, e) {
  var r = uc(t), n = Fi(10, r), i = t / n, a;
  return e === Ey ? a = 1 : e ? i < 1.5 ? a = 1 : i < 2.5 ? a = 2 : i < 4 ? a = 3 : i < 7 ? a = 5 : a = 10 : i < 1 ? a = 1 : i < 2 ? a = 2 : i < 3 ? a = 3 : i < 5 ? a = 5 : a = 10, t = a * n, ue(t, -r);
}
function Vs(t) {
  var e = parseFloat(t);
  return e == t && (e !== 0 || !z(t) || t.indexOf("x") <= 0) ? e : NaN;
}
function Ay(t) {
  return !isNaN(Vs(t));
}
function fc() {
  return mr(_w() * 9);
}
function Iy(t, e) {
  return e === 0 ? t : Iy(e, t % e);
}
function cd(t, e) {
  return t == null ? e : e == null ? t : t * e / Iy(t, e);
}
function er(t) {
  return t != null && isFinite(t);
}
var xw = "[ECharts] ", vd = {}, Cw = typeof console < "u" && console.warn && console.log;
function Mu(t, e, r) {
  if (Cw) {
    if (r) {
      if (vd[e])
        return;
      vd[e] = !0;
    }
    console[t](xw + e);
  }
}
function Oy(t, e) {
  Mu("log", t, e);
}
function nt(t, e) {
  Mu("warn", t, e);
}
function he(t, e) {
  Mu("error", t, e);
}
function tr(t) {
  process.env.NODE_ENV !== "production" && Mu("warn", "DEPRECATED: " + t, !0);
}
function Ve(t, e, r) {
  process.env.NODE_ENV !== "production" && tr((r ? "[" + r + "]" : "") + (t + " is deprecated; use " + e + " instead."));
}
function Fs() {
  for (var t = [], e = 0; e < arguments.length; e++)
    t[e] = arguments[e];
  var r = "";
  if (process.env.NODE_ENV !== "production") {
    var n = function(i) {
      return i === void 0 ? "undefined" : i === 1 / 0 ? "Infinity" : i === -1 / 0 ? "-Infinity" : bi(i) ? "NaN" : i instanceof Date ? "Date(" + i.toISOString() + ")" : Q(i) ? "function () { ... }" : FS(i) ? i + "" : null;
    };
    r = X(t, function(i) {
      if (z(i))
        return i;
      var a = n(i);
      if (a != null)
        return a;
      if (typeof JSON < "u" && JSON.stringify)
        try {
          return JSON.stringify(i, function(o, s) {
            var u = n(s);
            return u ?? s;
          });
        } catch {
          return "?";
        }
      else
        return "?";
    }).join(" ");
  }
  return r;
}
function it(t) {
  throw new Error(t);
}
function dd(t, e, r) {
  return (e - t) * r + t;
}
var Ly = "series\0", Dw = "\0_ec_\0";
function Qe(t) {
  return t instanceof Array ? t : t == null ? [] : [t];
}
function pd(t, e, r) {
  if (t) {
    t[e] = t[e] || {}, t.emphasis = t.emphasis || {}, t.emphasis[e] = t.emphasis[e] || {};
    for (var n = 0, i = r.length; n < i; n++) {
      var a = r[n];
      !t.emphasis[e].hasOwnProperty(a) && t[e].hasOwnProperty(a) && (t.emphasis[e][a] = t[e][a]);
    }
  }
}
var gd = ["fontStyle", "fontWeight", "fontSize", "fontFamily", "rich", "tag", "color", "textBorderColor", "textBorderWidth", "width", "height", "lineHeight", "align", "verticalAlign", "baseline", "shadowColor", "shadowBlur", "shadowOffsetX", "shadowOffsetY", "textShadowColor", "textShadowBlur", "textShadowOffsetX", "textShadowOffsetY", "backgroundColor", "borderColor", "borderWidth", "borderRadius", "padding"];
function lo(t) {
  return q(t) && !H(t) && !(t instanceof Date) ? t.value : t;
}
function Mw(t) {
  return q(t) && !(t instanceof Array);
}
function Ew(t, e, r) {
  var n = r === "normalMerge", i = r === "replaceMerge", a = r === "replaceAll";
  t = t || [], e = (e || []).slice();
  var o = Z();
  x(e, function(u, l) {
    if (!q(u)) {
      e[l] = null;
      return;
    }
    process.env.NODE_ENV !== "production" && (u.id != null && !yd(u.id) && md(u.id), u.name != null && !yd(u.name) && md(u.name));
  });
  var s = Aw(t, o, r);
  return (n || i) && Iw(s, t, o, e), n && Ow(s, e), n || i ? Lw(s, e, i) : a && Pw(s, e), Nw(s), s;
}
function Aw(t, e, r) {
  var n = [];
  if (r === "replaceAll")
    return n;
  for (var i = 0; i < t.length; i++) {
    var a = t[i];
    a && a.id != null && e.set(a.id, i), n.push({
      existing: r === "replaceMerge" || Mi(a) ? null : a,
      newOption: null,
      keyInfo: null,
      brandNew: null
    });
  }
  return n;
}
function Iw(t, e, r, n) {
  x(n, function(i, a) {
    if (!(!i || i.id == null)) {
      var o = Ma(i.id), s = r.get(o);
      if (s != null) {
        var u = t[s];
        N(!u.newOption, 'Duplicated option on id "' + o + '".'), u.newOption = i, u.existing = e[s], n[a] = null;
      }
    }
  });
}
function Ow(t, e) {
  x(e, function(r, n) {
    if (!(!r || r.name == null))
      for (var i = 0; i < t.length; i++) {
        var a = t[i].existing;
        if (!t[i].newOption && a && (a.id == null || r.id == null) && !Mi(r) && !Mi(a) && Py("name", a, r)) {
          t[i].newOption = r, e[n] = null;
          return;
        }
      }
  });
}
function Lw(t, e, r) {
  x(e, function(n) {
    if (n) {
      for (
        var i, a = 0;
        // Be `!resultItem` only when `nextIdx >= result.length`.
        (i = t[a]) && (i.newOption || Mi(i.existing) || // In mode "replaceMerge", here no not-mapped-non-internal-existing.
        i.existing && n.id != null && !Py("id", n, i.existing));
      )
        a++;
      i ? (i.newOption = n, i.brandNew = r) : t.push({
        newOption: n,
        brandNew: r,
        existing: null,
        keyInfo: null
      }), a++;
    }
  });
}
function Pw(t, e) {
  x(e, function(r) {
    t.push({
      newOption: r,
      brandNew: !0,
      existing: null,
      keyInfo: null
    });
  });
}
function Nw(t) {
  var e = Z();
  x(t, function(r) {
    var n = r.existing;
    n && e.set(n.id, r);
  }), x(t, function(r) {
    var n = r.newOption;
    N(!n || n.id == null || !e.get(n.id) || e.get(n.id) === r, "id duplicates: " + (n && n.id)), n && n.id != null && e.set(n.id, r), !r.keyInfo && (r.keyInfo = {});
  }), x(t, function(r, n) {
    var i = r.existing, a = r.newOption, o = r.keyInfo;
    if (q(a)) {
      if (o.name = a.name != null ? Ma(a.name) : i ? i.name : Ly + n, i)
        o.id = Ma(i.id);
      else if (a.id != null)
        o.id = Ma(a.id);
      else {
        var s = 0;
        do
          o.id = "\0" + o.name + "\0" + s++;
        while (e.get(o.id));
      }
      e.set(o.id, r);
    }
  });
}
function Py(t, e, r) {
  var n = Qt(e[t], null), i = Qt(r[t], null);
  return n != null && i != null && n === i;
}
function Ma(t) {
  if (process.env.NODE_ENV !== "production" && t == null)
    throw new Error();
  return Qt(t, "");
}
function Qt(t, e) {
  return t == null ? e : z(t) ? t : Te(t) || As(t) ? t + "" : e;
}
function md(t) {
  process.env.NODE_ENV !== "production" && nt("`" + t + "` is invalid id or name. Must be a string or number.");
}
function yd(t) {
  return As(t) || Ay(t);
}
function hc(t) {
  var e = t.name;
  return !!(e && e.indexOf(Ly));
}
function Mi(t) {
  return t && t.id != null && Ma(t.id).indexOf(Dw) === 0;
}
function Rw(t, e, r) {
  x(t, function(n) {
    var i = n.newOption;
    q(i) && (n.keyInfo.mainType = e, n.keyInfo.subType = kw(e, i, n.existing, r));
  });
}
function kw(t, e, r, n) {
  var i = e.type ? e.type : r ? r.subType : n.determineSubType(t, e);
  return i;
}
function Pn(t, e) {
  if (e.dataIndexInside != null)
    return e.dataIndexInside;
  if (e.dataIndex != null)
    return H(e.dataIndex) ? X(e.dataIndex, function(r) {
      return t.indexOfRawIndex(r);
    }) : t.indexOfRawIndex(e.dataIndex);
  if (e.name != null)
    return H(e.name) ? X(e.name, function(r) {
      return t.indexOfName(r);
    }) : t.indexOfName(e.name);
}
function ve() {
  var t = "__ec_inner_" + Bw++;
  return function(e) {
    return e[t] || (e[t] = {});
  };
}
var Bw = fc();
function Ml(t, e, r) {
  var n = cc(e, r), i = n.mainTypeSpecified, a = n.queryOptionMap, o = n.others, s = o, u = r ? r.defaultMainType : null;
  return !i && u && a.set(u, {}), a.each(function(l, f) {
    var h = fo(t, f, l, {
      useDefault: u === f,
      enableAll: r && r.enableAll != null ? r.enableAll : !0,
      enableNone: r && r.enableNone != null ? r.enableNone : !0
    });
    s[f + "Models"] = h.models, s[f + "Model"] = h.models[0];
  }), s;
}
function cc(t, e) {
  var r;
  if (z(t)) {
    var n = {};
    n[t + "Index"] = 0, r = n;
  } else
    r = t;
  var i = Z(), a = {}, o = !1;
  return x(r, function(s, u) {
    if (u === "dataIndex" || u === "dataIndexInside") {
      a[u] = s;
      return;
    }
    var l = u.match(/^(\w+)(Index|Id|Name)$/) || [], f = l[1], h = (l[2] || "").toLowerCase();
    if (!(!f || !h || e && e.includeMainTypes && fe(e.includeMainTypes, f) < 0)) {
      o = o || !!f;
      var c = i.get(f) || i.set(f, {});
      c[h] = s;
    }
  }), {
    mainTypeSpecified: o,
    queryOptionMap: i,
    others: a
  };
}
var qe = {
  useDefault: !0,
  enableAll: !1,
  enableNone: !1
}, Vw = {
  useDefault: !1,
  enableAll: !0,
  enableNone: !0
};
function fo(t, e, r, n) {
  n = n || qe;
  var i = r.index, a = r.id, o = r.name, s = {
    models: null,
    specified: i != null || a != null || o != null
  };
  if (!s.specified) {
    var u = void 0;
    return s.models = n.useDefault && (u = t.getComponent(e)) ? [u] : [], s;
  }
  if (i === "none" || i === !1) {
    if (n.enableNone)
      return s.models = [], s;
    process.env.NODE_ENV !== "production" && he('`"none"` or `false` is not a valid value on index option.'), i = -1;
  }
  return i === "all" && (n.enableAll ? i = a = o = null : (process.env.NODE_ENV !== "production" && he('`"all"` is not a valid value on index option.'), i = -1)), s.models = t.queryComponents({
    mainType: e,
    index: i,
    id: a,
    name: o
  }), s;
}
function Fw(t, e, r) {
  process.env.NODE_ENV !== "production" && N(e);
  var n = {};
  n[e + "Id"] = t[e + "Id"], n[e + "Index"] = t[e + "Index"], n[e + "Name"] = t[e + "Name"];
  var i = {
    mainType: e,
    query: n
  };
  return r && (i.subType = r), i;
}
function Ny(t, e, r) {
  t.setAttribute ? t.setAttribute(e, r) : t[e] = r;
}
function zw(t, e) {
  return t.getAttribute ? t.getAttribute(e) : t[e];
}
function Hw(t) {
  return t === "auto" ? re.domSupported ? "html" : "richText" : t || "html";
}
function Gw(t, e, r, n, i) {
  var a = e == null || e === "auto";
  if (n == null)
    return n;
  if (Te(n)) {
    var o = dd(r || 0, n, i);
    return ue(o, a ? Math.max(vr(r || 0), vr(n)) : e);
  } else {
    if (z(n))
      return i < 1 ? r : n;
    for (var s = [], u = r, l = n, f = Math.max(u ? u.length : 0, l.length), h = 0; h < f; ++h) {
      var c = t.getDimensionInfo(h);
      if (c && c.type === "ordinal")
        s[h] = (i < 1 && u ? u : l)[h];
      else {
        var v = u && u[h] ? u[h] : 0, d = l[h], o = dd(v, d, i);
        s[h] = ue(o, a ? Math.max(vr(v), vr(d)) : e);
      }
    }
    return s;
  }
}
function St() {
  return [1 / 0, -1 / 0];
}
function ih(t, e) {
  yr(e) && (e < t[0] && (t[0] = e), e > t[1] && (t[1] = e));
}
function Ry(t, e) {
  yr(e) && e < t[0] && (t[0] = e);
}
function ky(t, e) {
  yr(e) && e > t[1] && (t[1] = e);
}
function Uw(t, e) {
  Ei(e[0], e[1]) && (e[0] < t[0] && (t[0] = e[0]), e[1] > t[1] && (t[1] = e[1]));
}
function yr(t) {
  return t != null && isFinite(t);
}
function Ei(t, e) {
  return yr(t) && yr(e) && t <= e;
}
function Ww(t) {
  var e = t[1] - t[0];
  return isFinite(e) && e >= 0;
}
function ps(t) {
  Ei(t[0], t[1]) && t[0] > t[1] && (t[0] = t[1]);
}
function By() {
  var t = "__ec_once_" + Yw++;
  return function(e, r) {
    process.env.NODE_ENV !== "production" && N(e), at(e, t) || (e[t] = 1, r());
  };
}
var Yw = fc();
function vc(t, e, r) {
  var n = Z(), i = 0;
  x(t, function(a) {
    var o = e(a);
    process.env.NODE_ENV !== "production" && N(z(o));
    var s = n.get(o) || 0;
    r && r(a, s), !s && !r && (t[i++] = a), n.set(o, s + 1);
  }), r || (t.length = i);
}
function Xw(t) {
  return process.env.NODE_ENV !== "production" && N(t.value != null), t.value + "";
}
function Zw(t) {
  return process.env.NODE_ENV !== "production" && N(t != null), t + "";
}
function $w(t, e, r) {
  var n = t.getData().count();
  return {
    progressiveRender: r.progressiveEnabled && e.incrementalPrepareRender && n >= r.threshold,
    large: t.get("large") && n >= t.get("largeThreshold"),
    // TODO: modDataCount should not updated if `appendData`, otherwise cause whole repaint.
    // see `test/candlestick-large3.html`
    modDataCount: t.get("progressiveChunkMode") === "mod" ? t.getData().count() : null
  };
}
function dc(t) {
  return {
    overallReset: t
  };
}
var qw = ".", en = "___EC__COMPONENT__CONTAINER___", Vy = "___EC__EXTENDED_CLASS___";
function Xt(t) {
  var e = {
    main: "",
    sub: ""
  };
  if (t) {
    var r = t.split(qw);
    e.main = r[0] || "", e.sub = r[1] || "";
  }
  return e;
}
function Kw(t) {
  N(/^[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)?$/.test(t), 'componentType "' + t + '" illegal');
}
function Qw(t) {
  return !!(t && t[Vy]);
}
function pc(t, e) {
  t.$constructor = t, t.extend = function(r) {
    process.env.NODE_ENV !== "production" && x(e, function(a) {
      r[a] || console.warn("Method `" + a + "` should be implemented" + (r.type ? " in " + r.type : "") + ".");
    });
    var n = this, i;
    return jw(n) ? i = /** @class */
    function(a) {
      V(o, a);
      function o() {
        return a.apply(this, arguments) || this;
      }
      return o;
    }(n) : (i = function() {
      (r.$constructor || n).apply(this, arguments);
    }, kS(i, this)), R(i.prototype, r), i[Vy] = !0, i.extend = this.extend, i.superCall = tT, i.superApply = rT, i.superClass = n, i;
  };
}
function jw(t) {
  return Q(t) && /^class\s/.test(Function.prototype.toString.call(t));
}
function Fy(t, e) {
  t.extend = e.extend;
}
var Jw = Math.round(Math.random() * 10);
function eT(t) {
  var e = ["__\0is_clz", Jw++].join("_");
  t.prototype[e] = !0, process.env.NODE_ENV !== "production" && N(!t.isInstance, 'The method "is" can not be defined.'), t.isInstance = function(r) {
    return !!(r && r[e]);
  };
}
function tT(t, e) {
  for (var r = [], n = 2; n < arguments.length; n++)
    r[n - 2] = arguments[n];
  return this.superClass.prototype[e].apply(t, r);
}
function rT(t, e, r) {
  return this.superClass.prototype[e].apply(t, r);
}
function Eu(t) {
  var e = {};
  t.registerClass = function(n) {
    var i = n.type || n.prototype.type;
    if (i) {
      Kw(i), n.prototype.type = i;
      var a = Xt(i);
      if (!a.sub)
        process.env.NODE_ENV !== "production" && e[a.main] && console.warn(a.main + " exists."), e[a.main] = n;
      else if (a.sub !== en) {
        var o = r(a);
        o[a.sub] = n;
      }
    }
    return n;
  }, t.getClass = function(n, i, a) {
    var o = e[n];
    if (o && o[en] && (o = i ? o[i] : null), a && !o)
      throw new Error(i ? "Component " + n + "." + (i || "") + " is used but not imported." : n + ".type should be specified.");
    return o;
  }, t.getClassesByMainType = function(n) {
    var i = Xt(n), a = [], o = e[i.main];
    return o && o[en] ? x(o, function(s, u) {
      u !== en && a.push(s);
    }) : a.push(o), a;
  }, t.hasClass = function(n) {
    var i = Xt(n);
    return !!e[i.main];
  }, t.getAllClassMainTypes = function() {
    var n = [];
    return x(e, function(i, a) {
      n.push(a);
    }), n;
  }, t.hasSubTypes = function(n) {
    var i = Xt(n), a = e[i.main];
    return a && a[en];
  };
  function r(n) {
    var i = e[n.main];
    return (!i || !i[en]) && (i = e[n.main] = {}, i[en] = !0), i;
  }
}
function Fa(t, e) {
  for (var r = 0; r < t.length; r++)
    t[r][1] || (t[r][1] = t[r][0]);
  return e = e || !1, function(n, i, a) {
    for (var o = {}, s = 0; s < t.length; s++) {
      var u = t[s][1];
      if (!(i && fe(i, u) >= 0 || a && fe(a, u) < 0)) {
        var l = n.getShallow(u, e);
        l != null && (o[t[s][0]] = l);
      }
    }
    return o;
  };
}
var nT = [
  ["fill", "color"],
  ["shadowBlur"],
  ["shadowOffsetX"],
  ["shadowOffsetY"],
  ["opacity"],
  ["shadowColor"]
  // Option decal is in `DecalObject` but style.decal is in `PatternObject`.
  // So do not transfer decal directly.
], iT = Fa(nT), aT = (
  /** @class */
  function() {
    function t() {
    }
    return t.prototype.getAreaStyle = function(e, r) {
      return iT(this, e, r);
    }, t;
  }()
), ah = new xi(50);
function oT(t) {
  if (typeof t == "string") {
    var e = ah.get(t);
    return e && e.image;
  } else
    return t;
}
function gc(t, e, r, n, i) {
  if (t)
    if (typeof t == "string") {
      if (e && e.__zrImageSrc === t || !r)
        return e;
      var a = ah.get(t), o = { hostEl: r, cb: n, cbPayload: i };
      return a ? (e = a.image, !Au(e) && a.pending.push(o)) : (e = Zt.loadImage(t, _d, _d), e.__zrImageSrc = t, ah.put(t, e.__cachedImgObj = {
        image: e,
        pending: [o]
      })), e;
    } else
      return t;
  else return e;
}
function _d() {
  var t = this.__cachedImgObj;
  this.onload = this.onerror = this.__cachedImgObj = null;
  for (var e = 0; e < t.pending.length; e++) {
    var r = t.pending[e], n = r.cb;
    n && n(this, r.cbPayload), r.hostEl.dirty();
  }
  t.pending.length = 0;
}
function Au(t) {
  return t && t.width && t.height;
}
var El = /\{([a-zA-Z0-9_]+)\|([^}]*)\}/g;
function sT(t, e, r, n, i, a) {
  if (!r) {
    t.text = "", t.isTruncated = !1;
    return;
  }
  var o = (e + "").split(`
`);
  a = zy(r, n, i, a);
  for (var s = !1, u = {}, l = 0, f = o.length; l < f; l++)
    Hy(u, o[l], a), o[l] = u.textLine, s = s || u.isTruncated;
  t.text = o.join(`
`), t.isTruncated = s;
}
function zy(t, e, r, n) {
  n = n || {};
  var i = R({}, n);
  r = W(r, "..."), i.maxIterations = W(n.maxIterations, 2);
  var a = i.minChar = W(n.minChar, 0), o = i.fontMeasureInfo = qt(e), s = o.asciiCharWidth;
  i.placeholder = W(n.placeholder, "");
  for (var u = t = Math.max(0, t - 1), l = 0; l < a && u >= s; l++)
    u -= s;
  var f = Kt(o, r);
  return f > u && (r = "", f = 0), u = t - f, i.ellipsis = r, i.ellipsisWidth = f, i.contentWidth = u, i.containerWidth = t, i;
}
function Hy(t, e, r) {
  var n = r.containerWidth, i = r.contentWidth, a = r.fontMeasureInfo;
  if (!n) {
    t.textLine = "", t.isTruncated = !1;
    return;
  }
  var o = Kt(a, e);
  if (o <= n) {
    t.textLine = e, t.isTruncated = !1;
    return;
  }
  for (var s = 0; ; s++) {
    if (o <= i || s >= r.maxIterations) {
      e += r.ellipsis;
      break;
    }
    var u = s === 0 ? uT(e, i, a) : o > 0 ? Math.floor(e.length * i / o) : 0;
    e = e.substr(0, u), o = Kt(a, e);
  }
  e === "" && (e = r.placeholder), t.textLine = e, t.isTruncated = !0;
}
function uT(t, e, r) {
  for (var n = 0, i = 0, a = t.length; i < a && n < e; i++)
    n += _y(r, t.charCodeAt(i));
  return i;
}
function lT(t, e, r, n) {
  var i = mc(t), a = e.overflow, o = e.padding, s = o ? o[1] + o[3] : 0, u = o ? o[0] + o[2] : 0, l = e.font, f = a === "truncate", h = uo(l), c = W(e.lineHeight, h), v = e.lineOverflow === "truncate", d = !1, p = e.width;
  p == null && r != null && (p = r - s);
  var m = e.height;
  m == null && n != null && (m = n - u);
  var g;
  p != null && (a === "break" || a === "breakAll") ? g = i ? Gy(i, e.font, p, a === "breakAll", 0).lines : [] : g = i ? i.split(`
`) : [];
  var y = g.length * c;
  if (m == null && (m = y), y > m && v) {
    var _ = Math.floor(m / c);
    d = d || g.length > _, g = g.slice(0, _), y = g.length * c;
  }
  if (i && f && p != null)
    for (var S = zy(p, l, e.ellipsis, {
      minChar: e.truncateMinChar,
      placeholder: e.placeholder
    }), b = {}, w = 0; w < g.length; w++)
      Hy(b, g[w], S), g[w] = b.textLine, d = d || b.isTruncated;
  for (var T = m, M = 0, D = qt(l), w = 0; w < g.length; w++)
    M = Math.max(Kt(D, g[w]), M);
  p == null && (p = M);
  var C = p;
  return T += u, C += s, {
    lines: g,
    height: m,
    outerWidth: C,
    outerHeight: T,
    lineHeight: c,
    calculatedLineHeight: h,
    contentWidth: M,
    contentHeight: y,
    width: p,
    isTruncated: d
  };
}
var fT = /* @__PURE__ */ function() {
  function t() {
  }
  return t;
}(), Sd = /* @__PURE__ */ function() {
  function t(e) {
    this.tokens = [], e && (this.tokens = e);
  }
  return t;
}(), hT = /* @__PURE__ */ function() {
  function t() {
    this.width = 0, this.height = 0, this.contentWidth = 0, this.contentHeight = 0, this.outerWidth = 0, this.outerHeight = 0, this.lines = [], this.isTruncated = !1;
  }
  return t;
}();
function cT(t, e, r, n, i) {
  var a = new hT(), o = mc(t);
  if (!o)
    return a;
  var s = e.padding, u = s ? s[1] + s[3] : 0, l = s ? s[0] + s[2] : 0, f = e.width;
  f == null && r != null && (f = r - u);
  var h = e.height;
  h == null && n != null && (h = n - l);
  for (var c = e.overflow, v = (c === "break" || c === "breakAll") && f != null ? { width: f, accumWidth: 0, breakAll: c === "breakAll" } : null, d = El.lastIndex = 0, p; (p = El.exec(o)) != null; ) {
    var m = p.index;
    m > d && Al(a, o.substring(d, m), e, v), Al(a, p[2], e, v, p[1]), d = El.lastIndex;
  }
  d < o.length && Al(a, o.substring(d, o.length), e, v);
  var g = [], y = 0, _ = 0, S = c === "truncate", b = e.lineOverflow === "truncate", w = {};
  function T(oe, ze, Ue) {
    oe.width = ze, oe.lineHeight = Ue, y += Ue, _ = Math.max(_, ze);
  }
  e: for (var M = 0; M < a.lines.length; M++) {
    for (var D = a.lines[M], C = 0, E = 0, I = 0; I < D.tokens.length; I++) {
      var A = D.tokens[I], O = A.styleName && e.rich[A.styleName] || {}, P = A.textPadding = O.padding, L = P ? P[1] + P[3] : 0, B = A.font = O.font || e.font;
      A.contentHeight = uo(B);
      var U = W(O.height, A.contentHeight);
      if (A.innerHeight = U, P && (U += P[0] + P[2]), A.height = U, A.lineHeight = Rr(O.lineHeight, e.lineHeight, U), A.align = O && O.align || i, A.verticalAlign = O && O.verticalAlign || "middle", b && h != null && y + A.lineHeight > h) {
        var Y = a.lines.length;
        I > 0 ? (D.tokens = D.tokens.slice(0, I), T(D, E, C), a.lines = a.lines.slice(0, M + 1)) : a.lines = a.lines.slice(0, M), a.isTruncated = a.isTruncated || a.lines.length < Y;
        break e;
      }
      var j = O.width, K = j == null || j === "auto";
      if (typeof j == "string" && j.charAt(j.length - 1) === "%")
        A.percentWidth = j, g.push(A), A.contentWidth = Kt(qt(B), A.text);
      else {
        if (K) {
          var J = O.backgroundColor, $ = J && J.image;
          $ && ($ = oT($), Au($) && (A.width = Math.max(A.width, $.width * U / $.height)));
        }
        var F = S && f != null ? f - E : null;
        F != null && F < A.width ? !K || F < L ? (A.text = "", A.width = A.contentWidth = 0) : (sT(w, A.text, F - L, B, e.ellipsis, { minChar: e.truncateMinChar }), A.text = w.text, a.isTruncated = a.isTruncated || w.isTruncated, A.width = A.contentWidth = Kt(qt(B), A.text)) : A.contentWidth = Kt(qt(B), A.text);
      }
      A.width += L, E += A.width, O && (C = Math.max(C, A.lineHeight));
    }
    T(D, E, C);
  }
  a.outerWidth = a.width = W(f, _), a.outerHeight = a.height = W(h, y), a.contentHeight = y, a.contentWidth = _, a.outerWidth += u, a.outerHeight += l;
  for (var M = 0; M < g.length; M++) {
    var A = g[M], ne = A.percentWidth;
    A.width = parseInt(ne, 10) / 100 * a.width;
  }
  return a;
}
function Al(t, e, r, n, i) {
  var a = e === "", o = i && r.rich[i] || {}, s = t.lines, u = o.font || r.font, l = !1, f, h;
  if (n) {
    var c = o.padding, v = c ? c[1] + c[3] : 0;
    if (o.width != null && o.width !== "auto") {
      var d = Di(o.width, n.width) + v;
      s.length > 0 && d + n.accumWidth > n.width && (f = e.split(`
`), l = !0), n.accumWidth = d;
    } else {
      var p = Gy(e, u, n.width, n.breakAll, n.accumWidth);
      n.accumWidth = p.accumWidth + v, h = p.linesWidths, f = p.lines;
    }
  }
  f || (f = e.split(`
`));
  for (var m = qt(u), g = 0; g < f.length; g++) {
    var y = f[g], _ = new fT();
    if (_.styleName = i, _.text = y, _.isLineHolder = !y && !a, typeof o.width == "number" ? _.width = o.width : _.width = h ? h[g] : Kt(m, y), !g && !l) {
      var S = (s[s.length - 1] || (s[0] = new Sd())).tokens, b = S.length;
      b === 1 && S[0].isLineHolder ? S[0] = _ : (y || !b || a) && S.push(_);
    } else
      s.push(new Sd([_]));
  }
}
function vT(t) {
  var e = t.charCodeAt(0);
  return e >= 32 && e <= 591 || e >= 880 && e <= 4351 || e >= 4608 && e <= 5119 || e >= 7680 && e <= 8303;
}
var dT = ki(",&?/;] ".split(""), function(t, e) {
  return t[e] = !0, t;
}, {});
function pT(t) {
  return vT(t) ? !!dT[t] : !0;
}
function Gy(t, e, r, n, i) {
  for (var a = [], o = [], s = "", u = "", l = 0, f = 0, h = qt(e), c = 0; c < t.length; c++) {
    var v = t.charAt(c);
    if (v === `
`) {
      u && (s += u, f += l), a.push(s), o.push(f), s = "", u = "", l = 0, f = 0;
      continue;
    }
    var d = _y(h, v.charCodeAt(0)), p = n ? !1 : !pT(v);
    if (a.length ? f + d > r : i + f + d > r) {
      f ? (s || u) && (p ? (s || (s = u, u = "", l = 0, f = l), a.push(s), o.push(f - l), u += v, l += d, s = "", f = l) : (u && (s += u, u = "", l = 0), a.push(s), o.push(f), s = v, f = d)) : p ? (a.push(u), o.push(l), u = v, l = d) : (a.push(v), o.push(d));
      continue;
    }
    f += d, p ? (u += v, l += d) : (u && (s += u, u = "", l = 0), s += v);
  }
  return u && (s += u), s && (a.push(s), o.push(f)), a.length === 1 && (f += i), {
    accumWidth: f,
    lines: a,
    linesWidths: o
  };
}
function bd(t, e, r, n, i, a) {
  if (t.baseX = r, t.baseY = n, t.outerWidth = t.outerHeight = null, !!e) {
    var o = e.width * 2, s = e.height * 2;
    ie.set(wd, Ci(r, o, i), En(n, s, a), o, s), ie.intersect(e, wd, null, Td);
    var u = Td.outIntersectRect;
    t.outerWidth = u.width, t.outerHeight = u.height, t.baseX = Ci(u.x, u.width, i, !0), t.baseY = En(u.y, u.height, a, !0);
  }
}
var wd = new ie(0, 0, 0, 0), Td = { outIntersectRect: {}, clamp: !0 };
function mc(t) {
  return t != null ? t += "" : t = "";
}
function gT(t) {
  var e = mc(t.text), r = t.font, n = Kt(qt(r), e), i = uo(r);
  return oh(t, n, i, null);
}
function oh(t, e, r, n) {
  var i = new ie(Ci(t.x || 0, e, t.textAlign), En(t.y || 0, r, t.textBaseline), e, r), a = n ?? (Uy(t) ? t.lineWidth : 0);
  return a > 0 && (i.x -= a / 2, i.y -= a / 2, i.width += a, i.height += a), i;
}
function Uy(t) {
  var e = t.stroke;
  return e != null && e !== "none" && t.lineWidth > 0;
}
var sh = "__zr_style_" + Math.round(Math.random() * 10), An = {
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  shadowColor: "#000",
  opacity: 1,
  blend: "source-over"
}, Iu = {
  style: {
    shadowBlur: !0,
    shadowOffsetX: !0,
    shadowOffsetY: !0,
    shadowColor: !0,
    opacity: !0
  }
};
An[sh] = !0;
var xd = ["z", "z2", "invisible"], mT = ["invisible"], ho = function(t) {
  V(e, t);
  function e(r) {
    return t.call(this, r) || this;
  }
  return e.prototype._init = function(r) {
    for (var n = le(r), i = 0; i < n.length; i++) {
      var a = n[i];
      a === "style" ? this.useStyle(r[a]) : t.prototype.attrKV.call(this, a, r[a]);
    }
    this.style || this.useStyle({});
  }, e.prototype.beforeBrush = function(r) {
  }, e.prototype.afterBrush = function() {
  }, e.prototype.innerBeforeBrush = function() {
  }, e.prototype.innerAfterBrush = function() {
  }, e.prototype.shouldBePainted = function(r, n, i, a) {
    var o = this.transform;
    if (this.ignore || this.invisible || this.style.opacity === 0 || this.culling && yT(this, r, n) || o && !o[0] && !o[3])
      return !1;
    if (i && this.__clipPaths && this.__clipPaths.length) {
      for (var s = 0; s < this.__clipPaths.length; ++s)
        if (this.__clipPaths[s].isZeroArea())
          return !1;
    }
    if (a && this.parent)
      for (var u = this.parent; u; ) {
        if (u.ignore)
          return !1;
        u = u.parent;
      }
    return !0;
  }, e.prototype.contain = function(r, n) {
    return this.rectContain(r, n);
  }, e.prototype.traverse = function(r, n) {
    r.call(n, this);
  }, e.prototype.rectContain = function(r, n) {
    var i = this.transformCoordToLocal(r, n), a = this.getBoundingRect();
    return a.contain(i[0], i[1]);
  }, e.prototype.getPaintRect = function() {
    var r = this._paintRect;
    if (!this._paintRect || this.__dirty) {
      var n = this.transform, i = this.getBoundingRect(), a = this.style, o = a.shadowBlur || 0, s = a.shadowOffsetX || 0, u = a.shadowOffsetY || 0;
      r = this._paintRect || (this._paintRect = new ie(0, 0, 0, 0)), n ? ie.applyTransform(r, i, n) : r.copy(i), (o || s || u) && (r.width += o * 2 + Math.abs(s), r.height += o * 2 + Math.abs(u), r.x = Math.min(r.x, r.x + s - o), r.y = Math.min(r.y, r.y + u - o));
      var l = this.dirtyRectTolerance;
      r.isZero() || (r.x = Math.floor(r.x - l), r.y = Math.floor(r.y - l), r.width = Math.ceil(r.width + 1 + l * 2), r.height = Math.ceil(r.height + 1 + l * 2));
    }
    return r;
  }, e.prototype.setPrevPaintRect = function(r) {
    r ? (this._prevPaintRect = this._prevPaintRect || new ie(0, 0, 0, 0), this._prevPaintRect.copy(r)) : this._prevPaintRect = null;
  }, e.prototype.getPrevPaintRect = function() {
    return this._prevPaintRect;
  }, e.prototype.animateStyle = function(r) {
    return this.animate("style", r);
  }, e.prototype.updateDuringAnimation = function(r) {
    r === "style" ? this.dirtyStyle() : this.markRedraw();
  }, e.prototype.attrKV = function(r, n) {
    r !== "style" ? t.prototype.attrKV.call(this, r, n) : this.style ? this.setStyle(n) : this.useStyle(n);
  }, e.prototype.setStyle = function(r, n) {
    return typeof r == "string" ? this.style[r] = n : R(this.style, r), this.dirtyStyle(), this;
  }, e.prototype.dirtyStyle = function(r) {
    r || this.markRedraw(), this.__dirty |= pa, this._rect && (this._rect = null);
  }, e.prototype.dirty = function() {
    this.dirtyStyle();
  }, e.prototype.styleChanged = function() {
    return !!(this.__dirty & pa);
  }, e.prototype.styleUpdated = function() {
    this.__dirty &= ~pa;
  }, e.prototype.createStyle = function(r) {
    return wu(An, r);
  }, e.prototype.useStyle = function(r) {
    r[sh] || (r = this.createStyle(r)), this.style = r, this.dirtyStyle();
  }, e.prototype._useHoverStyle = function(r) {
    this.__hoverStyle = r;
  }, e.prototype.isStyleObject = function(r) {
    return r[sh];
  }, e.prototype._innerSaveToNormal = function(r) {
    t.prototype._innerSaveToNormal.call(this, r);
    var n = this._normalState;
    r.style && !n.style && (n.style = this._mergeStyle(this.createStyle(), this.style)), this._savePrimaryToNormal(r, n, xd);
  }, e.prototype._applyStateObj = function(r, n, i, a, o, s) {
    t.prototype._applyStateObj.call(this, r, n, i, a, o, s);
    var u = !(n && a), l = this.__inHover === Cu, f;
    if (n && n.style ? o ? a ? f = n.style : (f = this._mergeStyle(this.createStyle(), i.style), this._mergeStyle(f, n.style)) : (f = this._mergeStyle(this.createStyle(), a ? this.style : i.style), this._mergeStyle(f, n.style)) : u && (f = i.style), f)
      if (o) {
        var h = this.style;
        if (this.style = this.createStyle(u ? {} : h), u)
          for (var c = le(h), v = 0; v < c.length; v++) {
            var d = c[v];
            d in f && (f[d] = f[d], this.style[d] = h[d]);
          }
        for (var p = le(f), v = 0; v < p.length; v++) {
          var d = p[v];
          this.style[d] = this.style[d];
        }
        this._transitionState(r, {
          style: f
        }, s, this.getAnimationStyleProps());
      } else
        l ? this._useHoverStyle(f) : this.useStyle(f);
    if (!l)
      for (var m = this.__inHover ? mT : xd, v = 0; v < m.length; v++) {
        var d = m[v];
        n && n[d] != null ? this[d] = n[d] : u && i[d] != null && (this[d] = i[d]);
      }
  }, e.prototype._mergeStates = function(r) {
    for (var n = t.prototype._mergeStates.call(this, r), i, a = 0; a < r.length; a++) {
      var o = r[a];
      o.style && (i = i || {}, this._mergeStyle(i, o.style));
    }
    return i && (n.style = i), n;
  }, e.prototype._mergeStyle = function(r, n) {
    return R(r, n), r;
  }, e.prototype.getAnimationStyleProps = function() {
    return Iu;
  }, e.initDefaultProps = function() {
    var r = e.prototype;
    r.type = "displayable", r.invisible = !1, r.z = 0, r.z2 = 0, r.zlevel = 0, r.culling = !1, r.cursor = "pointer", r.rectHover = !1, r.incremental = 0, r._rect = null, r.dirtyRectTolerance = 0, r.__dirty = Ot | pa;
  }(), e;
}(Du), Il = new ie(0, 0, 0, 0), Ol = new ie(0, 0, 0, 0);
function yT(t, e, r) {
  return Il.copy(t.getBoundingRect()), t.transform && Il.applyTransform(t.transform), Ol.width = e, Ol.height = r, !Il.intersect(Ol);
}
var bt = Math.min, wt = Math.max, Ll = Math.sin, Pl = Math.cos, tn = Math.PI * 2, Lo = Bi(), Po = Bi(), No = Bi();
function Cd(t, e, r, n, i, a) {
  i[0] = bt(t, r), i[1] = bt(e, n), a[0] = wt(t, r), a[1] = wt(e, n);
}
var Dd = [], Md = [];
function _T(t, e, r, n, i, a, o, s, u, l) {
  var f = oy, h = Ge, c = f(t, r, i, o, Dd);
  u[0] = 1 / 0, u[1] = 1 / 0, l[0] = -1 / 0, l[1] = -1 / 0;
  for (var v = 0; v < c; v++) {
    var d = h(t, r, i, o, Dd[v]);
    u[0] = bt(d, u[0]), l[0] = wt(d, l[0]);
  }
  c = f(e, n, a, s, Md);
  for (var v = 0; v < c; v++) {
    var p = h(e, n, a, s, Md[v]);
    u[1] = bt(p, u[1]), l[1] = wt(p, l[1]);
  }
  u[0] = bt(t, u[0]), l[0] = wt(t, l[0]), u[0] = bt(o, u[0]), l[0] = wt(o, l[0]), u[1] = bt(e, u[1]), l[1] = wt(e, l[1]), u[1] = bt(s, u[1]), l[1] = wt(s, l[1]);
}
function ST(t, e, r, n, i, a, o, s) {
  var u = sy, l = rt, f = wt(bt(u(t, r, i), 1), 0), h = wt(bt(u(e, n, a), 1), 0), c = l(t, r, i, f), v = l(e, n, a, h);
  o[0] = bt(t, i, c), o[1] = bt(e, a, v), s[0] = wt(t, i, c), s[1] = wt(e, a, v);
}
function bT(t, e, r, n, i, a, o, s, u) {
  var l = ui, f = li, h = Math.abs(i - a);
  if (h % tn < 1e-4 && h > 1e-4) {
    s[0] = t - r, s[1] = e - n, u[0] = t + r, u[1] = e + n;
    return;
  }
  if (Lo[0] = Pl(i) * r + t, Lo[1] = Ll(i) * n + e, Po[0] = Pl(a) * r + t, Po[1] = Ll(a) * n + e, l(s, Lo, Po), f(u, Lo, Po), i = i % tn, i < 0 && (i = i + tn), a = a % tn, a < 0 && (a = a + tn), i > a && !o ? a += tn : i < a && o && (i += tn), o) {
    var c = a;
    a = i, i = c;
  }
  for (var v = 0; v < a; v += Math.PI / 2)
    v > i && (No[0] = Pl(v) * r + t, No[1] = Ll(v) * n + e, l(s, No, s), f(u, No, u));
}
var pe = {
  M: 1,
  L: 2,
  C: 3,
  Q: 4,
  A: 5,
  Z: 6,
  R: 7
}, rn = [], nn = [], Vt = [], Sr = [], Ft = [], zt = [], Nl = Math.min, Rl = Math.max, an = Math.cos, on = Math.sin, ur = Math.abs, uh = Math.PI, Er = uh * 2, kl = typeof Float32Array < "u", Zi = [];
function Bl(t) {
  var e = Math.round(t / uh * 1e8) / 1e8;
  return e % 2 * uh;
}
function wT(t, e) {
  var r = Bl(t[0]);
  r < 0 && (r += Er);
  var n = r - t[0], i = t[1];
  i += n, !e && i - r >= Er ? i = r + Er : e && r - i >= Er ? i = r - Er : !e && r > i ? i = r + (Er - Bl(r - i)) : e && r < i && (i = r - (Er - Bl(i - r))), t[0] = r, t[1] = i;
}
var zr = function() {
  function t(e) {
    this.dpr = 1, this._xi = 0, this._yi = 0, this._x0 = 0, this._y0 = 0, this._len = 0, e && (this._saveData = !1), this._saveData && (this.data = []);
  }
  return t.prototype.increaseVersion = function() {
    this._version++;
  }, t.prototype.getVersion = function() {
    return this._version;
  }, t.prototype.setScale = function(e, r, n) {
    n = n || 0, n > 0 && (this._ux = ur(n / td / e) || 0, this._uy = ur(n / td / r) || 0);
  }, t.prototype.setDPR = function(e) {
    this.dpr = e;
  }, t.prototype.setContext = function(e) {
    this._ctx = e;
  }, t.prototype.getContext = function() {
    return this._ctx;
  }, t.prototype.beginPath = function() {
    return this._ctx && this._ctx.beginPath(), this.reset(), this;
  }, t.prototype.reset = function() {
    this._saveData && (this._len = 0), this._pathSegLen && (this._pathSegLen = null, this._pathLen = 0), this._version++;
  }, t.prototype.moveTo = function(e, r) {
    return this._drawPendingPt(), this.addData(pe.M, e, r), this._ctx && this._ctx.moveTo(e, r), this._x0 = e, this._y0 = r, this._xi = e, this._yi = r, this;
  }, t.prototype.lineTo = function(e, r) {
    var n = ur(e - this._xi), i = ur(r - this._yi), a = n > this._ux || i > this._uy;
    if (this.addData(pe.L, e, r), this._ctx && a && this._ctx.lineTo(e, r), a)
      this._xi = e, this._yi = r, this._pendingPtDist = 0;
    else {
      var o = n * n + i * i;
      o > this._pendingPtDist && (this._pendingPtX = e, this._pendingPtY = r, this._pendingPtDist = o);
    }
    return this;
  }, t.prototype.bezierCurveTo = function(e, r, n, i, a, o) {
    return this._drawPendingPt(), this.addData(pe.C, e, r, n, i, a, o), this._ctx && this._ctx.bezierCurveTo(e, r, n, i, a, o), this._xi = a, this._yi = o, this;
  }, t.prototype.quadraticCurveTo = function(e, r, n, i) {
    return this._drawPendingPt(), this.addData(pe.Q, e, r, n, i), this._ctx && this._ctx.quadraticCurveTo(e, r, n, i), this._xi = n, this._yi = i, this;
  }, t.prototype.arc = function(e, r, n, i, a, o) {
    this._drawPendingPt(), Zi[0] = i, Zi[1] = a, wT(Zi, o), i = Zi[0], a = Zi[1];
    var s = a - i;
    return this.addData(pe.A, e, r, n, n, i, s, 0, o ? 0 : 1), this._ctx && this._ctx.arc(e, r, n, i, a, o), this._xi = an(a) * n + e, this._yi = on(a) * n + r, this;
  }, t.prototype.arcTo = function(e, r, n, i, a) {
    return this._drawPendingPt(), this._ctx && this._ctx.arcTo(e, r, n, i, a), this;
  }, t.prototype.rect = function(e, r, n, i) {
    return this._drawPendingPt(), this._ctx && this._ctx.rect(e, r, n, i), this.addData(pe.R, e, r, n, i), this;
  }, t.prototype.closePath = function() {
    this._drawPendingPt(), this.addData(pe.Z);
    var e = this._ctx, r = this._x0, n = this._y0;
    return e && e.closePath(), this._xi = r, this._yi = n, this;
  }, t.prototype.fill = function(e) {
    e && e.fill(), this.toStatic();
  }, t.prototype.stroke = function(e) {
    e && e.stroke(), this.toStatic();
  }, t.prototype.len = function() {
    return this._len;
  }, t.prototype.setData = function(e) {
    if (this._saveData) {
      var r = e.length;
      !(this.data && this.data.length === r) && kl && (this.data = new Float32Array(r));
      for (var n = 0; n < r; n++)
        this.data[n] = e[n];
      this._len = r;
    }
  }, t.prototype.appendPath = function(e) {
    if (this._saveData) {
      e instanceof Array || (e = [e]);
      for (var r = e.length, n = 0, i = this._len, a = 0; a < r; a++)
        n += e[a].len();
      var o = this.data;
      if (kl && (o instanceof Float32Array || !o) && (this.data = new Float32Array(i + n), i > 0 && o))
        for (var s = 0; s < i; s++)
          this.data[s] = o[s];
      for (var a = 0; a < r; a++)
        for (var u = e[a].data, s = 0; s < u.length; s++)
          this.data[i++] = u[s];
      this._len = i;
    }
  }, t.prototype.addData = function(e, r, n, i, a, o, s, u, l) {
    if (this._saveData) {
      var f = this.data;
      this._len + arguments.length > f.length && (this._expandData(), f = this.data);
      for (var h = 0; h < arguments.length; h++)
        f[this._len++] = arguments[h];
    }
  }, t.prototype._drawPendingPt = function() {
    this._pendingPtDist > 0 && (this._ctx && this._ctx.lineTo(this._pendingPtX, this._pendingPtY), this._pendingPtDist = 0);
  }, t.prototype._expandData = function() {
    if (!(this.data instanceof Array)) {
      for (var e = [], r = 0; r < this._len; r++)
        e[r] = this.data[r];
      this.data = e;
    }
  }, t.prototype.toStatic = function() {
    if (this._saveData) {
      this._drawPendingPt();
      var e = this.data;
      e instanceof Array && (e.length = this._len, kl && this._len > 11 && (this.data = new Float32Array(e)));
    }
  }, t.prototype.getBoundingRect = function() {
    Vt[0] = Vt[1] = Ft[0] = Ft[1] = Number.MAX_VALUE, Sr[0] = Sr[1] = zt[0] = zt[1] = -Number.MAX_VALUE;
    var e = this.data, r = 0, n = 0, i = 0, a = 0, o;
    for (o = 0; o < this._len; ) {
      var s = e[o++], u = o === 1;
      switch (u && (r = e[o], n = e[o + 1], i = r, a = n), s) {
        case pe.M:
          r = i = e[o++], n = a = e[o++], Ft[0] = i, Ft[1] = a, zt[0] = i, zt[1] = a;
          break;
        case pe.L:
          Cd(r, n, e[o], e[o + 1], Ft, zt), r = e[o++], n = e[o++];
          break;
        case pe.C:
          _T(r, n, e[o++], e[o++], e[o++], e[o++], e[o], e[o + 1], Ft, zt), r = e[o++], n = e[o++];
          break;
        case pe.Q:
          ST(r, n, e[o++], e[o++], e[o], e[o + 1], Ft, zt), r = e[o++], n = e[o++];
          break;
        case pe.A:
          var l = e[o++], f = e[o++], h = e[o++], c = e[o++], v = e[o++], d = e[o++] + v;
          o += 1;
          var p = !e[o++];
          u && (i = an(v) * h + l, a = on(v) * c + f), bT(l, f, h, c, v, d, p, Ft, zt), r = an(d) * h + l, n = on(d) * c + f;
          break;
        case pe.R:
          i = r = e[o++], a = n = e[o++];
          var m = e[o++], g = e[o++];
          Cd(i, a, i + m, a + g, Ft, zt);
          break;
        case pe.Z:
          r = i, n = a;
          break;
      }
      ui(Vt, Vt, Ft), li(Sr, Sr, zt);
    }
    return o === 0 && (Vt[0] = Vt[1] = Sr[0] = Sr[1] = 0), new ie(Vt[0], Vt[1], Sr[0] - Vt[0], Sr[1] - Vt[1]);
  }, t.prototype._calculateLength = function() {
    var e = this.data, r = this._len, n = this._ux, i = this._uy, a = 0, o = 0, s = 0, u = 0;
    this._pathSegLen || (this._pathSegLen = []);
    for (var l = this._pathSegLen, f = 0, h = 0, c = 0; c < r; ) {
      var v = e[c++], d = c === 1;
      d && (a = e[c], o = e[c + 1], s = a, u = o);
      var p = -1;
      switch (v) {
        case pe.M:
          a = s = e[c++], o = u = e[c++];
          break;
        case pe.L: {
          var m = e[c++], g = e[c++], y = m - a, _ = g - o;
          (ur(y) > n || ur(_) > i || c === r - 1) && (p = Math.sqrt(y * y + _ * _), a = m, o = g);
          break;
        }
        case pe.C: {
          var S = e[c++], b = e[c++], m = e[c++], g = e[c++], w = e[c++], T = e[c++];
          p = Mb(a, o, S, b, m, g, w, T, 10), a = w, o = T;
          break;
        }
        case pe.Q: {
          var S = e[c++], b = e[c++], m = e[c++], g = e[c++];
          p = Ib(a, o, S, b, m, g, 10), a = m, o = g;
          break;
        }
        case pe.A:
          var M = e[c++], D = e[c++], C = e[c++], E = e[c++], I = e[c++], A = e[c++], O = A + I;
          c += 1, d && (s = an(I) * C + M, u = on(I) * E + D), p = Rl(C, E) * Nl(Er, Math.abs(A)), a = an(O) * C + M, o = on(O) * E + D;
          break;
        case pe.R: {
          s = a = e[c++], u = o = e[c++];
          var P = e[c++], L = e[c++];
          p = P * 2 + L * 2;
          break;
        }
        case pe.Z: {
          var y = s - a, _ = u - o;
          p = Math.sqrt(y * y + _ * _), a = s, o = u;
          break;
        }
      }
      p >= 0 && (l[h++] = p, f += p);
    }
    return this._pathLen = f, f;
  }, t.prototype.rebuildPath = function(e, r) {
    var n = this.data, i = this._ux, a = this._uy, o = this._len, s, u, l, f, h, c, v = r < 1, d, p, m = 0, g = 0, y, _ = 0, S, b;
    if (!(v && (this._pathSegLen || this._calculateLength(), d = this._pathSegLen, p = this._pathLen, y = r * p, !y)))
      e: for (var w = 0; w < o; ) {
        var T = n[w++], M = w === 1;
        switch (M && (l = n[w], f = n[w + 1], s = l, u = f), T !== pe.L && _ > 0 && (e.lineTo(S, b), _ = 0), T) {
          case pe.M:
            s = l = n[w++], u = f = n[w++], e.moveTo(l, f);
            break;
          case pe.L: {
            h = n[w++], c = n[w++];
            var D = ur(h - l), C = ur(c - f);
            if (D > i || C > a) {
              if (v) {
                var E = d[g++];
                if (m + E > y) {
                  var I = (y - m) / E;
                  e.lineTo(l * (1 - I) + h * I, f * (1 - I) + c * I);
                  break e;
                }
                m += E;
              }
              e.lineTo(h, c), l = h, f = c, _ = 0;
            } else {
              var A = D * D + C * C;
              A > _ && (S = h, b = c, _ = A);
            }
            break;
          }
          case pe.C: {
            var O = n[w++], P = n[w++], L = n[w++], B = n[w++], U = n[w++], Y = n[w++];
            if (v) {
              var E = d[g++];
              if (m + E > y) {
                var I = (y - m) / E;
                Ps(l, O, L, U, I, rn), Ps(f, P, B, Y, I, nn), e.bezierCurveTo(rn[1], nn[1], rn[2], nn[2], rn[3], nn[3]);
                break e;
              }
              m += E;
            }
            e.bezierCurveTo(O, P, L, B, U, Y), l = U, f = Y;
            break;
          }
          case pe.Q: {
            var O = n[w++], P = n[w++], L = n[w++], B = n[w++];
            if (v) {
              var E = d[g++];
              if (m + E > y) {
                var I = (y - m) / E;
                Ns(l, O, L, I, rn), Ns(f, P, B, I, nn), e.quadraticCurveTo(rn[1], nn[1], rn[2], nn[2]);
                break e;
              }
              m += E;
            }
            e.quadraticCurveTo(O, P, L, B), l = L, f = B;
            break;
          }
          case pe.A:
            var j = n[w++], K = n[w++], J = n[w++], $ = n[w++], F = n[w++], ne = n[w++], oe = n[w++], ze = !n[w++], Ue = J > $ ? J : $, de = ur(J - $) > 1e-3, De = F + ne, ee = !1;
            if (v) {
              var E = d[g++];
              m + E > y && (De = F + ne * (y - m) / E, ee = !0), m += E;
            }
            if (de && e.ellipse ? e.ellipse(j, K, J, $, oe, F, De, ze) : e.arc(j, K, Ue, F, De, ze), ee)
              break e;
            M && (s = an(F) * J + j, u = on(F) * $ + K), l = an(De) * J + j, f = on(De) * $ + K;
            break;
          case pe.R:
            s = l = n[w], u = f = n[w + 1], h = n[w++], c = n[w++];
            var se = n[w++], Et = n[w++];
            if (v) {
              var E = d[g++];
              if (m + E > y) {
                var Le = y - m;
                e.moveTo(h, c), e.lineTo(h + Nl(Le, se), c), Le -= se, Le > 0 && e.lineTo(h + se, c + Nl(Le, Et)), Le -= Et, Le > 0 && e.lineTo(h + Rl(se - Le, 0), c + Et), Le -= se, Le > 0 && e.lineTo(h, c + Rl(Et - Le, 0));
                break e;
              }
              m += E;
            }
            e.rect(h, c, se, Et);
            break;
          case pe.Z:
            if (v) {
              var E = d[g++];
              if (m + E > y) {
                var I = (y - m) / E;
                e.lineTo(l * (1 - I) + s * I, f * (1 - I) + u * I);
                break e;
              }
              m += E;
            }
            e.closePath(), l = s, f = u;
        }
      }
  }, t.prototype.clone = function() {
    var e = new t(), r = this.data;
    return e.data = r.slice ? r.slice() : Array.prototype.slice.call(r), e._len = this._len, e;
  }, t.prototype.canSave = function() {
    return !!this._saveData;
  }, t.CMD = pe, t.initDefaultProps = function() {
    var e = t.prototype;
    e._saveData = !0, e._ux = 0, e._uy = 0, e._pendingPtDist = 0, e._version = 0;
  }(), t;
}();
function Yn(t, e, r, n, i, a, o) {
  if (i === 0)
    return !1;
  var s = i, u = 0, l = t;
  if (o > e + s && o > n + s || o < e - s && o < n - s || a > t + s && a > r + s || a < t - s && a < r - s)
    return !1;
  if (t !== r)
    u = (e - n) / (t - r), l = (t * n - r * e) / (t - r);
  else
    return Math.abs(a - t) <= s / 2;
  var f = u * a - o + l, h = f * f / (u * u + 1);
  return h <= s / 2 * s / 2;
}
function TT(t, e, r, n, i, a, o, s, u, l, f) {
  if (u === 0)
    return !1;
  var h = u;
  if (f > e + h && f > n + h && f > a + h && f > s + h || f < e - h && f < n - h && f < a - h && f < s - h || l > t + h && l > r + h && l > i + h && l > o + h || l < t - h && l < r - h && l < i - h && l < o - h)
    return !1;
  var c = Db(t, e, r, n, i, a, o, s, l, f);
  return c <= h / 2;
}
function xT(t, e, r, n, i, a, o, s, u) {
  if (o === 0)
    return !1;
  var l = o;
  if (u > e + l && u > n + l && u > a + l || u < e - l && u < n - l && u < a - l || s > t + l && s > r + l && s > i + l || s < t - l && s < r - l && s < i - l)
    return !1;
  var f = Ab(t, e, r, n, i, a, s, u);
  return f <= l / 2;
}
var Ed = Math.PI * 2;
function Ro(t) {
  return t %= Ed, t < 0 && (t += Ed), t;
}
var $i = Math.PI * 2;
function CT(t, e, r, n, i, a, o, s, u) {
  if (o === 0)
    return !1;
  var l = o;
  s -= t, u -= e;
  var f = Math.sqrt(s * s + u * u);
  if (f - l > r || f + l < r)
    return !1;
  if (Math.abs(n - i) % $i < 1e-4)
    return !0;
  if (a) {
    var h = n;
    n = Ro(i), i = Ro(h);
  } else
    n = Ro(n), i = Ro(i);
  n > i && (i += $i);
  var c = Math.atan2(u, s);
  return c < 0 && (c += $i), c >= n && c <= i || c + $i >= n && c + $i <= i;
}
function sn(t, e, r, n, i, a) {
  if (a > e && a > n || a < e && a < n || n === e)
    return 0;
  var o = (a - e) / (n - e), s = n < e ? 1 : -1;
  (o === 1 || o === 0) && (s = n < e ? 0.5 : -0.5);
  var u = o * (r - t) + t;
  return u === i ? 1 / 0 : u > i ? s : 0;
}
var br = zr.CMD, un = Math.PI * 2, DT = 1e-4;
function MT(t, e) {
  return Math.abs(t - e) < DT;
}
var Ze = [-1, -1, -1], mt = [-1, -1];
function ET() {
  var t = mt[0];
  mt[0] = mt[1], mt[1] = t;
}
function AT(t, e, r, n, i, a, o, s, u, l) {
  if (l > e && l > n && l > a && l > s || l < e && l < n && l < a && l < s)
    return 0;
  var f = Ls(e, n, a, s, l, Ze);
  if (f === 0)
    return 0;
  for (var h = 0, c = -1, v = void 0, d = void 0, p = 0; p < f; p++) {
    var m = Ze[p], g = m === 0 || m === 1 ? 0.5 : 1, y = Ge(t, r, i, o, m);
    y < u || (c < 0 && (c = oy(e, n, a, s, mt), mt[1] < mt[0] && c > 1 && ET(), v = Ge(e, n, a, s, mt[0]), c > 1 && (d = Ge(e, n, a, s, mt[1]))), c === 2 ? m < mt[0] ? h += v < e ? g : -g : m < mt[1] ? h += d < v ? g : -g : h += s < d ? g : -g : m < mt[0] ? h += v < e ? g : -g : h += s < v ? g : -g);
  }
  return h;
}
function IT(t, e, r, n, i, a, o, s) {
  if (s > e && s > n && s > a || s < e && s < n && s < a)
    return 0;
  var u = Eb(e, n, a, s, Ze);
  if (u === 0)
    return 0;
  var l = sy(e, n, a);
  if (l >= 0 && l <= 1) {
    for (var f = 0, h = rt(e, n, a, l), c = 0; c < u; c++) {
      var v = Ze[c] === 0 || Ze[c] === 1 ? 0.5 : 1, d = rt(t, r, i, Ze[c]);
      d < o || (Ze[c] < l ? f += h < e ? v : -v : f += a < h ? v : -v);
    }
    return f;
  } else {
    var v = Ze[0] === 0 || Ze[0] === 1 ? 0.5 : 1, d = rt(t, r, i, Ze[0]);
    return d < o ? 0 : a < e ? v : -v;
  }
}
function OT(t, e, r, n, i, a, o, s) {
  if (s -= e, s > r || s < -r)
    return 0;
  var u = Math.sqrt(r * r - s * s);
  Ze[0] = -u, Ze[1] = u;
  var l = Math.abs(n - i);
  if (l < 1e-4)
    return 0;
  if (l >= un - 1e-4) {
    n = 0, i = un;
    var f = a ? 1 : -1;
    return o >= Ze[0] + t && o <= Ze[1] + t ? f : 0;
  }
  if (n > i) {
    var h = n;
    n = i, i = h;
  }
  n < 0 && (n += un, i += un);
  for (var c = 0, v = 0; v < 2; v++) {
    var d = Ze[v];
    if (d + t > o) {
      var p = Math.atan2(s, d), f = a ? 1 : -1;
      p < 0 && (p = un + p), (p >= n && p <= i || p + un >= n && p + un <= i) && (p > Math.PI / 2 && p < Math.PI * 1.5 && (f = -f), c += f);
    }
  }
  return c;
}
function Wy(t, e, r, n, i) {
  for (var a = t.data, o = t.len(), s = 0, u = 0, l = 0, f = 0, h = 0, c, v, d = 0; d < o; ) {
    var p = a[d++], m = d === 1;
    switch (p === br.M && d > 1 && (r || (s += sn(u, l, f, h, n, i))), m && (u = a[d], l = a[d + 1], f = u, h = l), p) {
      case br.M:
        f = a[d++], h = a[d++], u = f, l = h;
        break;
      case br.L:
        if (r) {
          if (Yn(u, l, a[d], a[d + 1], e, n, i))
            return !0;
        } else
          s += sn(u, l, a[d], a[d + 1], n, i) || 0;
        u = a[d++], l = a[d++];
        break;
      case br.C:
        if (r) {
          if (TT(u, l, a[d++], a[d++], a[d++], a[d++], a[d], a[d + 1], e, n, i))
            return !0;
        } else
          s += AT(u, l, a[d++], a[d++], a[d++], a[d++], a[d], a[d + 1], n, i) || 0;
        u = a[d++], l = a[d++];
        break;
      case br.Q:
        if (r) {
          if (xT(u, l, a[d++], a[d++], a[d], a[d + 1], e, n, i))
            return !0;
        } else
          s += IT(u, l, a[d++], a[d++], a[d], a[d + 1], n, i) || 0;
        u = a[d++], l = a[d++];
        break;
      case br.A:
        var g = a[d++], y = a[d++], _ = a[d++], S = a[d++], b = a[d++], w = a[d++];
        d += 1;
        var T = !!(1 - a[d++]);
        c = Math.cos(b) * _ + g, v = Math.sin(b) * S + y, m ? (f = c, h = v) : s += sn(u, l, c, v, n, i);
        var M = (n - g) * S / _ + g;
        if (r) {
          if (CT(g, y, S, b, b + w, T, e, M, i))
            return !0;
        } else
          s += OT(g, y, S, b, b + w, T, M, i);
        u = Math.cos(b + w) * _ + g, l = Math.sin(b + w) * S + y;
        break;
      case br.R:
        f = u = a[d++], h = l = a[d++];
        var D = a[d++], C = a[d++];
        if (c = f + D, v = h + C, r) {
          if (Yn(f, h, c, h, e, n, i) || Yn(c, h, c, v, e, n, i) || Yn(c, v, f, v, e, n, i) || Yn(f, v, f, h, e, n, i))
            return !0;
        } else
          s += sn(c, h, c, v, n, i), s += sn(f, v, f, h, n, i);
        break;
      case br.Z:
        if (r) {
          if (Yn(u, l, f, h, e, n, i))
            return !0;
        } else
          s += sn(u, l, f, h, n, i);
        u = f, l = h;
        break;
    }
  }
  return !r && !MT(l, h) && (s += sn(u, l, f, h, n, i) || 0), s !== 0;
}
function LT(t, e, r) {
  return Wy(t, 0, !1, e, r);
}
function PT(t, e, r, n) {
  return Wy(t, e, !0, r, n);
}
var zs = ge({
  fill: "#000",
  stroke: null,
  strokePercent: 1,
  fillOpacity: 1,
  strokeOpacity: 1,
  lineDashOffset: 0,
  lineWidth: 1,
  lineCap: "butt",
  miterLimit: 10,
  strokeNoScale: !1,
  strokeFirst: !1
}, An), NT = {
  style: ge({
    fill: !0,
    stroke: !0,
    strokePercent: !0,
    fillOpacity: !0,
    strokeOpacity: !0,
    lineDashOffset: !0,
    lineWidth: !0,
    miterLimit: !0
  }, Iu.style)
}, Vl = xu.concat([
  "invisible",
  "culling",
  "z",
  "z2",
  "zlevel",
  "parent"
]), be = function(t) {
  V(e, t);
  function e(r) {
    return t.call(this, r) || this;
  }
  return e.prototype.update = function() {
    var r = this;
    t.prototype.update.call(this);
    var n = this.style;
    if (n.decal) {
      var i = this._decalEl = this._decalEl || new e();
      i.buildPath === e.prototype.buildPath && (i.buildPath = function(u) {
        r.buildPath(u, r.shape);
      }), i.silent = !0;
      var a = i.style;
      for (var o in n)
        a[o] !== n[o] && (a[o] = n[o]);
      a.fill = n.fill ? n.decal : null, a.decal = null, a.shadowColor = null, n.strokeFirst && (a.stroke = null);
      for (var s = 0; s < Vl.length; ++s)
        i[Vl[s]] = this[Vl[s]];
      i.__dirty |= Ot;
    } else this._decalEl && (this._decalEl = null);
  }, e.prototype.getDecalElement = function() {
    return this._decalEl;
  }, e.prototype._init = function(r) {
    var n = le(r);
    this.shape = this.getDefaultShape();
    var i = this.getDefaultStyle();
    i && this.useStyle(i);
    for (var a = 0; a < n.length; a++) {
      var o = n[a], s = r[o];
      o === "style" ? this.style ? R(this.style, s) : this.useStyle(s) : o === "shape" ? R(this.shape, s) : t.prototype.attrKV.call(this, o, s);
    }
    this.style || this.useStyle({});
  }, e.prototype.getDefaultStyle = function() {
    return null;
  }, e.prototype.getDefaultShape = function() {
    return {};
  }, e.prototype.canBeInsideText = function() {
    return this.hasFill();
  }, e.prototype.getInsideTextFill = function() {
    var r = this.style.fill;
    if (r !== "none") {
      if (z(r)) {
        var n = Rs(r, 0);
        return n > 0.5 ? Jf : n > 0.2 ? rw : eh;
      } else if (r)
        return eh;
    }
    return Jf;
  }, e.prototype.getInsideTextStroke = function(r) {
    var n = this.style.fill;
    if (z(n)) {
      var i = this.__zr, a = !!(i && i.isDarkMode()), o = Rs(r, 0) < jf;
      if (a === o)
        return n;
    }
  }, e.prototype.buildPath = function(r, n, i) {
  }, e.prototype.pathUpdated = function() {
    this.__dirty &= ~ai;
  }, e.prototype.getUpdatedPathProxy = function(r) {
    return !this.path && this.createPathProxy(), this.path.beginPath(), this.buildPath(this.path, this.shape, r), this.path;
  }, e.prototype.createPathProxy = function() {
    this.path = new zr(!1);
  }, e.prototype.hasStroke = function() {
    var r = this.style, n = r.stroke;
    return !(n == null || n === "none" || !(r.lineWidth > 0));
  }, e.prototype.hasFill = function() {
    var r = this.style, n = r.fill;
    return n != null && n !== "none";
  }, e.prototype.getBoundingRect = function() {
    var r = this._rect, n = this.style, i = !r;
    if (i) {
      var a = !1;
      this.path || (a = !0, this.createPathProxy());
      var o = this.path;
      (a || this.__dirty & ai) && (o.beginPath(), this.buildPath(o, this.shape, !1), this.pathUpdated()), r = o.getBoundingRect();
    }
    if (this._rect = r, this.hasStroke() && this.path && this.path.len() > 0) {
      var s = this._rectStroke || (this._rectStroke = r.clone());
      if (this.__dirty || i) {
        s.copy(r);
        var u = n.strokeNoScale ? this.getLineScale() : 1, l = n.lineWidth;
        if (!this.hasFill()) {
          var f = this.strokeContainThreshold;
          l = Math.max(l, f ?? 4);
        }
        u > 1e-10 && (s.width += l / u, s.height += l / u, s.x -= l / u / 2, s.y -= l / u / 2);
      }
      return s;
    }
    return r;
  }, e.prototype.contain = function(r, n) {
    var i = this.transformCoordToLocal(r, n), a = this.getBoundingRect(), o = this.style;
    if (r = i[0], n = i[1], a.contain(r, n)) {
      var s = this.path;
      if (this.hasStroke()) {
        var u = o.lineWidth, l = o.strokeNoScale ? this.getLineScale() : 1;
        if (l > 1e-10 && (this.hasFill() || (u = Math.max(u, this.strokeContainThreshold)), PT(s, u / l, r, n)))
          return !0;
      }
      if (this.hasFill())
        return LT(s, r, n);
    }
    return !1;
  }, e.prototype.dirtyShape = function() {
    this.__dirty |= ai, this._rect && (this._rect = null), this._decalEl && this._decalEl.dirtyShape(), this.markRedraw();
  }, e.prototype.dirty = function() {
    this.dirtyStyle(), this.dirtyShape();
  }, e.prototype.animateShape = function(r) {
    return this.animate("shape", r);
  }, e.prototype.updateDuringAnimation = function(r) {
    r === "style" ? this.dirtyStyle() : r === "shape" ? this.dirtyShape() : this.markRedraw();
  }, e.prototype.attrKV = function(r, n) {
    r === "shape" ? this.setShape(n) : t.prototype.attrKV.call(this, r, n);
  }, e.prototype.setShape = function(r, n) {
    var i = this.shape;
    return i || (i = this.shape = {}), typeof r == "string" ? i[r] = n : R(i, r), this.dirtyShape(), this;
  }, e.prototype.shapeChanged = function() {
    return !!(this.__dirty & ai);
  }, e.prototype.createStyle = function(r) {
    return wu(zs, r);
  }, e.prototype._innerSaveToNormal = function(r) {
    t.prototype._innerSaveToNormal.call(this, r);
    var n = this._normalState;
    r.shape && !n.shape && (n.shape = R({}, this.shape));
  }, e.prototype._applyStateObj = function(r, n, i, a, o, s) {
    if (t.prototype._applyStateObj.call(this, r, n, i, a, o, s), this.__inHover !== Cu) {
      var u = !(n && a), l;
      if (n && n.shape ? o ? a ? l = n.shape : (l = R({}, i.shape), R(l, n.shape)) : (l = R({}, a ? this.shape : i.shape), R(l, n.shape)) : u && (l = i.shape), l)
        if (o) {
          this.shape = R({}, this.shape);
          for (var f = {}, h = le(l), c = 0; c < h.length; c++) {
            var v = h[c];
            typeof l[v] == "object" ? this.shape[v] = l[v] : f[v] = l[v];
          }
          this._transitionState(r, {
            shape: f
          }, s);
        } else
          this.shape = l, this.dirtyShape();
    }
  }, e.prototype._mergeStates = function(r) {
    for (var n = t.prototype._mergeStates.call(this, r), i, a = 0; a < r.length; a++) {
      var o = r[a];
      o.shape && (i = i || {}, this._mergeStyle(i, o.shape));
    }
    return i && (n.shape = i), n;
  }, e.prototype.getAnimationStyleProps = function() {
    return NT;
  }, e.prototype.isZeroArea = function() {
    return !1;
  }, e.extend = function(r) {
    var n = function(a) {
      V(o, a);
      function o(s) {
        var u = a.call(this, s) || this;
        return r.init && r.init.call(u, s), u;
      }
      return o.prototype.getDefaultStyle = function() {
        return ae(r.style);
      }, o.prototype.getDefaultShape = function() {
        return ae(r.shape);
      }, o;
    }(e);
    for (var i in r)
      typeof r[i] == "function" && (n.prototype[i] = r[i]);
    return n;
  }, e.initDefaultProps = function() {
    var r = e.prototype;
    r.type = "path", r.strokeContainThreshold = 5, r.segmentIgnoreThreshold = 0, r.subPixelOptimize = !1, r.autoBatch = !1, r.__dirty = Ot | pa | ai;
  }(), e;
}(ho), RT = ge({
  strokeFirst: !0,
  font: gr,
  x: 0,
  y: 0,
  textAlign: "left",
  textBaseline: "top",
  miterLimit: 2
}, zs), za = function(t) {
  V(e, t);
  function e() {
    return t !== null && t.apply(this, arguments) || this;
  }
  return e.prototype.hasStroke = function() {
    return Uy(this.style);
  }, e.prototype.hasFill = function() {
    var r = this.style, n = r.fill;
    return n != null && n !== "none";
  }, e.prototype.createStyle = function(r) {
    return wu(RT, r);
  }, e.prototype.setBoundingRect = function(r) {
    this._rect = r;
  }, e.prototype.getBoundingRect = function() {
    return this._rect || (this._rect = gT(this.style)), this._rect;
  }, e.initDefaultProps = function() {
    var r = e.prototype;
    r.dirtyRectTolerance = 10;
  }(), e;
}(ho);
za.prototype.type = "tspan";
var kT = ge({
  x: 0,
  y: 0
}, An), BT = {
  style: ge({
    x: !0,
    y: !0,
    width: !0,
    height: !0,
    sx: !0,
    sy: !0,
    sWidth: !0,
    sHeight: !0
  }, Iu.style)
};
function VT(t) {
  return !!(t && typeof t != "string" && t.width && t.height);
}
var or = function(t) {
  V(e, t);
  function e() {
    return t !== null && t.apply(this, arguments) || this;
  }
  return e.prototype.createStyle = function(r) {
    return wu(kT, r);
  }, e.prototype._getSize = function(r) {
    var n = this.style, i = n[r];
    if (i != null)
      return i;
    var a = VT(n.image) ? n.image : this.__image;
    if (!a)
      return 0;
    var o = r === "width" ? "height" : "width", s = n[o];
    return s == null ? a[r] : a[r] / a[o] * s;
  }, e.prototype.getWidth = function() {
    return this._getSize("width");
  }, e.prototype.getHeight = function() {
    return this._getSize("height");
  }, e.prototype.getAnimationStyleProps = function() {
    return BT;
  }, e.prototype.getBoundingRect = function() {
    var r = this.style;
    return this._rect || (this._rect = new ie(r.x || 0, r.y || 0, this.getWidth(), this.getHeight())), this._rect;
  }, e;
}(ho);
or.prototype.type = "image";
function FT(t, e) {
  var r = e.x, n = e.y, i = e.width, a = e.height, o = e.r, s, u, l, f;
  i < 0 && (r = r + i, i = -i), a < 0 && (n = n + a, a = -a), typeof o == "number" ? s = u = l = f = o : o instanceof Array ? o.length === 1 ? s = u = l = f = o[0] : o.length === 2 ? (s = l = o[0], u = f = o[1]) : o.length === 3 ? (s = o[0], u = f = o[1], l = o[2]) : (s = o[0], u = o[1], l = o[2], f = o[3]) : s = u = l = f = 0;
  var h;
  s + u > i && (h = s + u, s *= i / h, u *= i / h), l + f > i && (h = l + f, l *= i / h, f *= i / h), u + l > a && (h = u + l, u *= a / h, l *= a / h), s + f > a && (h = s + f, s *= a / h, f *= a / h), t.moveTo(r + s, n), t.lineTo(r + i - u, n), u !== 0 && t.arc(r + i - u, n + u, u, -Math.PI / 2, 0), t.lineTo(r + i, n + a - l), l !== 0 && t.arc(r + i - l, n + a - l, l, 0, Math.PI / 2), t.lineTo(r + f, n + a), f !== 0 && t.arc(r + f, n + a - f, f, Math.PI / 2, Math.PI), t.lineTo(r, n + s), s !== 0 && t.arc(r + s, n + s, s, Math.PI, Math.PI * 1.5), t.closePath();
}
var ci = Math.round;
function Yy(t, e, r) {
  if (e) {
    var n = e.x1, i = e.x2, a = e.y1, o = e.y2;
    t.x1 = n, t.x2 = i, t.y1 = a, t.y2 = o;
    var s = r && r.lineWidth;
    return s && (ci(n * 2) === ci(i * 2) && (t.x1 = t.x2 = Cn(n, s, !0)), ci(a * 2) === ci(o * 2) && (t.y1 = t.y2 = Cn(a, s, !0))), t;
  }
}
function Xy(t, e, r) {
  if (e) {
    var n = e.x, i = e.y, a = e.width, o = e.height;
    t.x = n, t.y = i, t.width = a, t.height = o;
    var s = r && r.lineWidth;
    return s && (t.x = Cn(n, s, !0), t.y = Cn(i, s, !0), t.width = Math.max(Cn(n + a, s, !1) - t.x, a === 0 ? 0 : 1), t.height = Math.max(Cn(i + o, s, !1) - t.y, o === 0 ? 0 : 1)), t;
  }
}
function Cn(t, e, r) {
  if (!e)
    return t;
  var n = ci(t * 2);
  return (n + ci(e)) % 2 === 0 ? n / 2 : (n + (r ? 1 : -1)) / 2;
}
var zT = /* @__PURE__ */ function() {
  function t() {
    this.x = 0, this.y = 0, this.width = 0, this.height = 0;
  }
  return t;
}(), HT = {}, Ce = function(t) {
  V(e, t);
  function e(r) {
    return t.call(this, r) || this;
  }
  return e.prototype.getDefaultShape = function() {
    return new zT();
  }, e.prototype.buildPath = function(r, n) {
    var i, a, o, s;
    if (this.subPixelOptimize) {
      var u = Xy(HT, n, this.style);
      i = u.x, a = u.y, o = u.width, s = u.height, u.r = n.r, n = u;
    } else
      i = n.x, a = n.y, o = n.width, s = n.height;
    n.r ? FT(r, n) : r.rect(i, a, o, s);
  }, e.prototype.isZeroArea = function() {
    return !this.shape.width || !this.shape.height;
  }, e;
}(be);
Ce.prototype.type = "rect";
var Ad = {
  fill: "#000"
}, Id = 2, Ht = {}, GT = {
  style: ge({
    fill: !0,
    stroke: !0,
    fillOpacity: !0,
    strokeOpacity: !0,
    lineWidth: !0,
    fontSize: !0,
    lineHeight: !0,
    width: !0,
    height: !0,
    textShadowColor: !0,
    textShadowBlur: !0,
    textShadowOffsetX: !0,
    textShadowOffsetY: !0,
    backgroundColor: !0,
    padding: !0,
    borderColor: !0,
    borderWidth: !0,
    borderRadius: !0
  }, Iu.style)
}, Je = function(t) {
  V(e, t);
  function e(r) {
    var n = t.call(this) || this;
    return n.type = "text", n._children = [], n._defaultStyle = Ad, n.attr(r), n;
  }
  return e.prototype.childrenRef = function() {
    return this._children;
  }, e.prototype.update = function() {
    t.prototype.update.call(this), this.styleChanged() && this._updateSubTexts();
    for (var r = 0; r < this._children.length; r++) {
      var n = this._children[r];
      n.zlevel = this.zlevel, n.z = this.z, n.z2 = this.z2, n.culling = this.culling, n.cursor = this.cursor, n.invisible = this.invisible;
    }
  }, e.prototype.updateTransform = function() {
    var r = this.innerTransformable;
    r ? (r.updateTransform(), r.transform && (this.transform = r.transform)) : t.prototype.updateTransform.call(this);
  }, e.prototype.getLocalTransform = function(r) {
    var n = this.innerTransformable;
    return n ? n.getLocalTransform(r) : t.prototype.getLocalTransform.call(this, r);
  }, e.prototype.getComputedTransform = function() {
    return this.__hostTarget && (this.__hostTarget.getComputedTransform(), this.__hostTarget.updateInnerText(!0)), t.prototype.getComputedTransform.call(this);
  }, e.prototype._updateSubTexts = function() {
    this._childCursor = 0, YT(this.style), this.style.rich ? this._updateRichTexts() : this._updatePlainTexts(), this._children.length = this._childCursor, this.styleUpdated();
  }, e.prototype.addSelfToZr = function(r) {
    t.prototype.addSelfToZr.call(this, r);
    for (var n = 0; n < this._children.length; n++)
      this._children[n].__zr = r;
  }, e.prototype.removeSelfFromZr = function(r) {
    t.prototype.removeSelfFromZr.call(this, r);
    for (var n = 0; n < this._children.length; n++)
      this._children[n].__zr = null;
  }, e.prototype.getBoundingRect = function() {
    if (this.styleChanged() && this._updateSubTexts(), !this._rect) {
      for (var r = new ie(0, 0, 0, 0), n = this._children, i = [], a = null, o = 0; o < n.length; o++) {
        var s = n[o], u = s.getBoundingRect(), l = s.getLocalTransform(i);
        l ? (r.copy(u), r.applyTransform(l), a = a || r.clone(), a.union(r)) : (a = a || u.clone(), a.union(u));
      }
      this._rect = a || r;
    }
    return this._rect;
  }, e.prototype.setDefaultTextStyle = function(r) {
    this._defaultStyle = r || Ad;
  }, e.prototype.setTextContent = function(r) {
    if (process.env.NODE_ENV !== "production")
      throw new Error("Can't attach text on another text");
  }, e.prototype._mergeStyle = function(r, n) {
    if (!n)
      return r;
    var i = n.rich, a = r.rich || i && {};
    return R(r, n), i && a ? (this._mergeRich(a, i), r.rich = a) : a && (r.rich = a), r;
  }, e.prototype._mergeRich = function(r, n) {
    for (var i = le(n), a = 0; a < i.length; a++) {
      var o = i[a];
      r[o] = r[o] || {}, R(r[o], n[o]);
    }
  }, e.prototype.getAnimationStyleProps = function() {
    return GT;
  }, e.prototype._getOrCreateChild = function(r) {
    var n = this._children[this._childCursor];
    return (!n || !(n instanceof r)) && (n = new r()), this._children[this._childCursor++] = n, n.__zr = this.__zr, n.parent = this, n;
  }, e.prototype._updatePlainTexts = function() {
    var r = this.style, n = r.font || gr, i = r.padding, a = this._defaultStyle, o = r.x || 0, s = r.y || 0, u = r.align || a.align || "left", l = r.verticalAlign || a.verticalAlign || "top";
    bd(Ht, a.overflowRect, o, s, u, l), o = Ht.baseX, s = Ht.baseY;
    var f = Bd(r), h = lT(f, r, Ht.outerWidth, Ht.outerHeight), c = Fl(r), v = !!r.backgroundColor, d = h.outerHeight, p = h.outerWidth, m = h.lines, g = h.lineHeight;
    this.isTruncated = !!h.isTruncated;
    var y = o, _ = En(s, h.contentHeight, l);
    if (c || i) {
      var S = Ci(o, p, u), b = En(s, d, l);
      c && this._renderBackground(r, r, S, b, p, d);
    }
    _ += g / 2, i && (y = kd(o, u, i), l === "top" ? _ += i[0] : l === "bottom" && (_ -= i[2]));
    for (var w = 0, T = !1, M = !1, D = Rd("fill" in r ? r.fill : (M = !0, a.fill)), C = Nd("stroke" in r ? r.stroke : !v && (!a.autoStroke || M) ? (w = Id, T = !0, a.stroke) : null), E = r.textShadowBlur > 0, I = 0; I < m.length; I++) {
      var A = this._getOrCreateChild(za), O = A.createStyle();
      A.useStyle(O), O.text = m[I], O.x = y, O.y = _, O.textAlign = u, O.textBaseline = "middle", O.opacity = r.opacity, O.strokeFirst = !0, E && (O.shadowBlur = r.textShadowBlur || 0, O.shadowColor = r.textShadowColor || "transparent", O.shadowOffsetX = r.textShadowOffsetX || 0, O.shadowOffsetY = r.textShadowOffsetY || 0), O.stroke = C, O.fill = D, C && (O.lineWidth = r.lineWidth || w, O.lineDash = r.lineDash, O.lineDashOffset = r.lineDashOffset || 0), O.font = n, Ld(O, r), _ += g, A.setBoundingRect(oh(O, h.contentWidth, h.calculatedLineHeight, T ? 0 : null));
    }
  }, e.prototype._updateRichTexts = function() {
    var r = this.style, n = this._defaultStyle, i = r.align || n.align, a = r.verticalAlign || n.verticalAlign, o = r.x || 0, s = r.y || 0;
    bd(Ht, n.overflowRect, o, s, i, a), o = Ht.baseX, s = Ht.baseY;
    var u = Bd(r), l = cT(u, r, Ht.outerWidth, Ht.outerHeight, i), f = l.width, h = l.outerWidth, c = l.outerHeight, v = r.padding;
    this.isTruncated = !!l.isTruncated;
    var d = Ci(o, h, i), p = En(s, c, a), m = d, g = p;
    v && (m += v[3], g += v[0]);
    var y = m + f;
    Fl(r) && this._renderBackground(r, r, d, p, h, c);
    for (var _ = !!r.backgroundColor, S = 0; S < l.lines.length; S++) {
      for (var b = l.lines[S], w = b.tokens, T = w.length, M = b.lineHeight, D = b.width, C = 0, E = m, I = y, A = T - 1, O = void 0; C < T && (O = w[C], !O.align || O.align === "left"); )
        this._placeToken(O, r, M, g, E, "left", _), D -= O.width, E += O.width, C++;
      for (; A >= 0 && (O = w[A], O.align === "right"); )
        this._placeToken(O, r, M, g, I, "right", _), D -= O.width, I -= O.width, A--;
      for (E += (f - (E - m) - (y - I) - D) / 2; C <= A; )
        O = w[C], this._placeToken(O, r, M, g, E + O.width / 2, "center", _), E += O.width, C++;
      g += M;
    }
  }, e.prototype._placeToken = function(r, n, i, a, o, s, u) {
    var l = n.rich[r.styleName] || {};
    l.text = r.text;
    var f = r.verticalAlign, h = a + i / 2;
    f === "top" ? h = a + r.height / 2 : f === "bottom" && (h = a + i - r.height / 2);
    var c = !r.isLineHolder && Fl(l);
    c && this._renderBackground(l, n, s === "right" ? o - r.width : s === "center" ? o - r.width / 2 : o, h - r.height / 2, r.width, r.height);
    var v = !!l.backgroundColor, d = r.textPadding;
    d && (o = kd(o, s, d), h -= r.height / 2 - d[0] - r.innerHeight / 2);
    var p = this._getOrCreateChild(za), m = p.createStyle();
    p.useStyle(m);
    var g = this._defaultStyle, y = !1, _ = 0, S = !1, b = Rd("fill" in l ? l.fill : "fill" in n ? n.fill : (y = !0, g.fill)), w = Nd("stroke" in l ? l.stroke : "stroke" in n ? n.stroke : !v && !u && (!g.autoStroke || y) ? (_ = Id, S = !0, g.stroke) : null), T = l.textShadowBlur > 0 || n.textShadowBlur > 0;
    m.text = r.text, m.x = o, m.y = h, T && (m.shadowBlur = l.textShadowBlur || n.textShadowBlur || 0, m.shadowColor = l.textShadowColor || n.textShadowColor || "transparent", m.shadowOffsetX = l.textShadowOffsetX || n.textShadowOffsetX || 0, m.shadowOffsetY = l.textShadowOffsetY || n.textShadowOffsetY || 0), m.textAlign = s, m.textBaseline = "middle", m.font = r.font || gr, m.opacity = Rr(l.opacity, n.opacity, 1), Ld(m, l), w && (m.lineWidth = Rr(l.lineWidth, n.lineWidth, _), m.lineDash = W(l.lineDash, n.lineDash), m.lineDashOffset = n.lineDashOffset || 0, m.stroke = w), b && (m.fill = b), p.setBoundingRect(oh(m, r.contentWidth, r.contentHeight, S ? 0 : null));
  }, e.prototype._renderBackground = function(r, n, i, a, o, s) {
    var u = r.backgroundColor, l = r.borderWidth, f = r.borderColor, h = u && u.image, c = u && !h, v = r.borderRadius, d = this, p, m;
    if (c || r.lineHeight || l && f) {
      p = this._getOrCreateChild(Ce), p.useStyle(p.createStyle()), p.style.fill = null;
      var g = p.shape;
      g.x = i, g.y = a, g.width = o, g.height = s, g.r = v, p.dirtyShape();
    }
    if (c) {
      var y = p.style;
      y.fill = u || null, y.fillOpacity = W(r.fillOpacity, 1);
    } else if (h) {
      m = this._getOrCreateChild(or), m.onload = function() {
        d.dirtyStyle();
      };
      var _ = m.style;
      _.image = u.image, _.x = i, _.y = a, _.width = o, _.height = s;
    }
    if (l && f) {
      var y = p.style;
      y.lineWidth = l, y.stroke = f, y.strokeOpacity = W(r.strokeOpacity, 1), y.lineDash = r.borderDash, y.lineDashOffset = r.borderDashOffset || 0, p.strokeContainThreshold = 0, p.hasFill() && p.hasStroke() && (y.strokeFirst = !0, y.lineWidth *= 2);
    }
    var S = (p || m).style;
    S.shadowBlur = r.shadowBlur || 0, S.shadowColor = r.shadowColor || "transparent", S.shadowOffsetX = r.shadowOffsetX || 0, S.shadowOffsetY = r.shadowOffsetY || 0, S.opacity = Rr(r.opacity, n.opacity, 1);
  }, e.makeFont = function(r) {
    var n = "";
    return $y(r) && (n = [
      r.fontStyle,
      r.fontWeight,
      Zy(r.fontSize),
      r.fontFamily || "sans-serif"
    ].join(" ")), n && Yt(n) || r.textFont || r.font;
  }, e;
}(ho), UT = { left: !0, right: 1, center: 1 }, WT = { top: 1, bottom: 1, middle: 1 }, Od = ["fontStyle", "fontWeight", "fontSize", "fontFamily"];
function Zy(t) {
  return typeof t == "string" && (t.indexOf("px") !== -1 || t.indexOf("rem") !== -1 || t.indexOf("em") !== -1) ? t : isNaN(+t) ? Kh + "px" : t + "px";
}
function Ld(t, e) {
  for (var r = 0; r < Od.length; r++) {
    var n = Od[r], i = e[n];
    i != null && (t[n] = i);
  }
}
function $y(t) {
  return t.fontSize != null || t.fontFamily || t.fontWeight;
}
function YT(t) {
  return Pd(t), x(t.rich, Pd), t;
}
function Pd(t) {
  if (t) {
    t.font = Je.makeFont(t);
    var e = t.align;
    e === "middle" && (e = "center"), t.align = e == null || UT[e] ? e : "left";
    var r = t.verticalAlign;
    r === "center" && (r = "middle"), t.verticalAlign = r == null || WT[r] ? r : "top";
    var n = t.padding;
    n && (t.padding = tc(t.padding));
  }
}
function Nd(t, e) {
  return t == null || e <= 0 || t === "transparent" || t === "none" ? null : t.image || t.colorStops ? "#000" : t;
}
function Rd(t) {
  return t == null || t === "none" ? null : t.image || t.colorStops ? "#000" : t;
}
function kd(t, e, r) {
  return e === "right" ? t - r[1] : e === "center" ? t + r[3] / 2 - r[1] / 2 : t + r[3];
}
function Bd(t) {
  var e = t.text;
  return e != null && (e += ""), e;
}
function Fl(t) {
  return !!(t.backgroundColor || t.lineHeight || t.borderWidth && t.borderColor);
}
var me = ve(), XT = function(t, e, r, n) {
  if (n) {
    var i = me(n);
    i.dataIndex = r, i.dataType = e, i.seriesIndex = t, i.ssrType = "chart", n.type === "group" && n.traverse(function(a) {
      var o = me(a);
      o.seriesIndex = t, o.dataIndex = r, o.dataType = e, o.ssrType = "chart";
    });
  }
}, co = "undefined", qy = "series", lh = Z(["tooltip", "label", "itemName", "itemId", "itemGroupId", "itemChildGroupId", "seriesName"]), ft = "original", Xe = "arrayRows", Rt = "objectRows", sr = "keyedColumns", pr = "typedArray", Ky = "unknown", jt = "column", Vn = "row", ZT = [
  "getDom",
  "getZr",
  "getWidth",
  "getHeight",
  "getDevicePixelRatio",
  "dispatchAction",
  "isSSR",
  "isDisposed",
  "on",
  "off",
  "getDataURL",
  "getConnectedDataURL",
  // 'getModel',
  "getOption",
  // 'getViewOfComponentModel',
  // 'getViewOfSeriesModel',
  "getId",
  "updateLabelLayout"
], Qy = (
  /** @class */
  /* @__PURE__ */ function() {
    function t(e) {
      x(ZT, function(r) {
        this[r] = te(e[r], e);
      }, this);
    }
    return t;
  }()
);
function $T(t, e) {
  return e.mainType === qy ? t.getViewOfSeriesModel(e) : t.getViewOfComponentModel(e);
}
var Vd = 1, Fd = {}, jy = ve(), yc = ve(), _c = 0, Ou = 1, Lu = 2, rr = ["emphasis", "blur", "select"], zd = ["normal", "emphasis", "blur", "select"], qT = 10, KT = 9, In = "highlight", gs = "downplay", Hs = "select", fh = "unselect", Gs = "toggleSelect", Sc = "selectchanged";
function Xn(t) {
  return t != null && t !== "none";
}
function Pu(t, e, r) {
  t.onHoverStateChange && (t.hoverState || 0) !== r && t.onHoverStateChange(e), t.hoverState = r;
}
function Jy(t) {
  Pu(t, "emphasis", Lu);
}
function e0(t) {
  t.hoverState === Lu && Pu(t, "normal", _c);
}
function bc(t) {
  Pu(t, "blur", Ou);
}
function t0(t) {
  t.hoverState === Ou && Pu(t, "normal", _c);
}
function QT(t) {
  t.selected = !0;
}
function jT(t) {
  t.selected = !1;
}
function Hd(t, e, r) {
  e(t, r);
}
function _r(t, e, r) {
  Hd(t, e, r), t.isGroup && t.traverse(function(n) {
    Hd(n, e, r);
  });
}
function Gd(t, e) {
  switch (e) {
    case "emphasis":
      t.hoverState = Lu;
      break;
    case "normal":
      t.hoverState = _c;
      break;
    case "blur":
      t.hoverState = Ou;
      break;
    case "select":
      t.selected = !0;
  }
}
function JT(t, e, r, n) {
  for (var i = t.style, a = {}, o = 0; o < e.length; o++) {
    var s = e[o], u = i[s];
    a[s] = u ?? (n && n[s]);
  }
  for (var o = 0; o < t.animators.length; o++) {
    var l = t.animators[o];
    l.__fromStateTransition && l.__fromStateTransition.indexOf(r) < 0 && l.targetName === "style" && l.saveTo(a, e);
  }
  return a;
}
function ex(t, e, r, n) {
  var i = r && fe(r, "select") >= 0, a = !1;
  if (t instanceof be) {
    var o = jy(t), s = i && o.selectFill || o.normalFill, u = i && o.selectStroke || o.normalStroke;
    if (Xn(s) || Xn(u)) {
      n = n || {};
      var l = n.style || {};
      l.fill === "inherit" ? (a = !0, n = R({}, n), l = R({}, l), l.fill = s) : !Xn(l.fill) && Xn(s) ? (a = !0, n = R({}, n), l = R({}, l), l.fill = Yf(s)) : !Xn(l.stroke) && Xn(u) && (a || (n = R({}, n), l = R({}, l)), l.stroke = Yf(u)), n.style = l;
    }
  }
  if (n && n.z2 == null) {
    a || (n = R({}, n));
    var f = t.z2EmphasisLift;
    n.z2 = t.z2 + (f ?? qT);
  }
  return n;
}
function tx(t, e, r) {
  if (r && r.z2 == null) {
    r = R({}, r);
    var n = t.z2SelectLift;
    r.z2 = t.z2 + (n ?? KT);
  }
  return r;
}
function rx(t, e, r) {
  var n = fe(t.currentStates, e) >= 0, i = t.style.opacity, a = n ? null : JT(t, ["opacity"], e, {
    opacity: 1
  });
  r = r || {};
  var o = r.style || {};
  return o.opacity == null && (r = R({}, r), o = R({
    // Already being applied 'emphasis'. DON'T mul opacity multiple times.
    opacity: n ? i : a.opacity * 0.1
  }, o), r.style = o), r;
}
function zl(t, e) {
  var r = this.states[t];
  if (this.style) {
    if (t === "emphasis")
      return ex(this, t, e, r);
    if (t === "blur")
      return rx(this, t, r);
    if (t === "select")
      return tx(this, t, r);
  }
  return r;
}
function nx(t) {
  t.stateProxy = zl;
  var e = t.getTextContent(), r = t.getTextGuideLine();
  e && (e.stateProxy = zl), r && (r.stateProxy = zl);
}
function Ud(t, e) {
  !a0(t, e) && !t.__highByOuter && _r(t, Jy);
}
function Wd(t, e) {
  !a0(t, e) && !t.__highByOuter && _r(t, e0);
}
function Us(t, e) {
  t.__highByOuter |= 1 << (e || 0), _r(t, Jy);
}
function Ws(t, e) {
  !(t.__highByOuter &= ~(1 << (e || 0))) && _r(t, e0);
}
function ix(t) {
  _r(t, bc);
}
function r0(t) {
  _r(t, t0);
}
function n0(t) {
  _r(t, QT);
}
function i0(t) {
  _r(t, jT);
}
function a0(t, e) {
  return t.__highDownSilentOnTouch && e.zrByTouch;
}
function o0(t) {
  var e = t.getModel(), r = [], n = [];
  e.eachComponent(function(i, a) {
    var o = yc(a), s = $T(t, a), u = i === "series";
    !u && n.push(s), o.isBlured && (s.group.traverse(function(l) {
      t0(l);
    }), u && r.push(a)), o.isBlured = !1;
  }), x(n, function(i) {
    i && i.toggleBlurSeries && i.toggleBlurSeries(r, !1, e);
  });
}
function hh(t, e, r, n) {
  var i = n.getModel();
  r = r || "coordinateSystem";
  function a(l, f) {
    for (var h = 0; h < f.length; h++) {
      var c = l.getItemGraphicEl(f[h]);
      c && r0(c);
    }
  }
  if (t != null && !(!e || e === "none")) {
    var o = i.getSeriesByIndex(t), s = o.coordinateSystem;
    s && s.master && (s = s.master);
    var u = [];
    i.eachSeries(function(l) {
      var f = o === l, h = l.coordinateSystem;
      h && h.master && (h = h.master);
      var c = h && s ? h === s : f;
      if (!// Not blur other series if blurScope series
      (r === "series" && !f || r === "coordinateSystem" && !c || e === "series" && f)) {
        var v = n.getViewOfSeriesModel(l);
        if (v.group.traverse(function(m) {
          m.__highByOuter && f && e === "self" || bc(m);
        }), ot(e))
          a(l.getData(), e);
        else if (q(e))
          for (var d = le(e), p = 0; p < d.length; p++)
            a(l.getData(d[p]), e[d[p]]);
        u.push(l), yc(l).isBlured = !0;
      }
    }), i.eachComponent(function(l, f) {
      if (l !== "series") {
        var h = n.getViewOfComponentModel(f);
        h && h.toggleBlurSeries && h.toggleBlurSeries(u, !0, i);
      }
    });
  }
}
function ch(t, e, r) {
  if (!(t == null || e == null)) {
    var n = r.getModel().getComponent(t, e);
    if (n) {
      yc(n).isBlured = !0;
      var i = r.getViewOfComponentModel(n);
      !i || !i.focusBlurEnabled || i.group.traverse(function(a) {
        bc(a);
      });
    }
  }
}
function ax(t, e, r) {
  var n = t.seriesIndex, i = t.getData(e.dataType);
  if (!i) {
    process.env.NODE_ENV !== "production" && he("Unknown dataType " + e.dataType);
    return;
  }
  var a = Pn(i, e);
  a = (H(a) ? a[0] : a) || 0;
  var o = i.getItemGraphicEl(a);
  if (!o)
    for (var s = i.count(), u = 0; !o && u < s; )
      o = i.getItemGraphicEl(u++);
  if (o) {
    var l = me(o);
    hh(n, l.focus, l.blurScope, r);
  } else {
    var f = t.get(["emphasis", "focus"]), h = t.get(["emphasis", "blurScope"]);
    f != null && hh(n, f, h, r);
  }
}
function wc(t, e, r, n) {
  var i = {
    focusSelf: !1,
    dispatchers: null
  };
  if (t == null || t === "series" || e == null || r == null)
    return i;
  var a = n.getModel().getComponent(t, e);
  if (!a)
    return i;
  var o = n.getViewOfComponentModel(a);
  if (!o || !o.findHighDownDispatchers)
    return i;
  for (var s = o.findHighDownDispatchers(r), u, l = 0; l < s.length; l++)
    if (process.env.NODE_ENV !== "production" && !Ai(s[l]) && he("param should be highDownDispatcher"), me(s[l]).focus === "self") {
      u = !0;
      break;
    }
  return {
    focusSelf: u,
    dispatchers: s
  };
}
function ox(t, e, r) {
  process.env.NODE_ENV !== "production" && !Ai(t) && he("param should be highDownDispatcher");
  var n = me(t), i = wc(n.componentMainType, n.componentIndex, n.componentHighDownName, r), a = i.dispatchers, o = i.focusSelf;
  a ? (o && ch(n.componentMainType, n.componentIndex, r), x(a, function(s) {
    return Ud(s, e);
  })) : (hh(n.seriesIndex, n.focus, n.blurScope, r), n.focus === "self" && ch(n.componentMainType, n.componentIndex, r), Ud(t, e));
}
function sx(t, e, r) {
  process.env.NODE_ENV !== "production" && !Ai(t) && he("param should be highDownDispatcher"), o0(r);
  var n = me(t), i = wc(n.componentMainType, n.componentIndex, n.componentHighDownName, r).dispatchers;
  i ? x(i, function(a) {
    return Wd(a, e);
  }) : Wd(t, e);
}
function ux(t, e, r) {
  if (dh(e)) {
    var n = e.dataType, i = t.getData(n), a = Pn(i, e);
    H(a) || (a = [a]), t[e.type === Gs ? "toggleSelect" : e.type === Hs ? "select" : "unselect"](a, n);
  }
}
function Yd(t) {
  var e = t.getAllData();
  x(e, function(r) {
    var n = r.data, i = r.type;
    n.eachItemGraphicEl(function(a, o) {
      t.isSelected(o, i) ? n0(a) : i0(a);
    });
  });
}
function lx(t) {
  var e = [];
  return t.eachSeries(function(r) {
    var n = r.getAllData();
    x(n, function(i) {
      i.data;
      var a = i.type, o = r.getSelectedDataIndices();
      if (o.length > 0) {
        var s = {
          dataIndex: o,
          seriesIndex: r.seriesIndex
        };
        a != null && (s.dataType = a), e.push(s);
      }
    });
  }), e;
}
function Ys(t, e, r) {
  s0(t, !0), _r(t, nx), hx(t, e, r);
}
function fx(t) {
  s0(t, !1);
}
function vh(t, e, r, n) {
  n ? fx(t) : Ys(t, e, r);
}
function hx(t, e, r) {
  var n = me(t);
  e != null ? (n.focus = e, n.blurScope = r) : n.focus && (n.focus = null);
}
var Xd = ["emphasis", "blur", "select"], cx = {
  itemStyle: "getItemStyle",
  lineStyle: "getLineStyle",
  areaStyle: "getAreaStyle"
};
function Zd(t, e, r, n) {
  r = r || "itemStyle";
  for (var i = 0; i < Xd.length; i++) {
    var a = Xd[i], o = e.getModel([a, r]), s = t.ensureState(a);
    s.style = o[cx[r]]();
  }
}
function s0(t, e) {
  var r = e === !1, n = t;
  t.highDownSilentOnTouch && (n.__highDownSilentOnTouch = t.highDownSilentOnTouch), (!r || n.__highDownDispatcher) && (n.__highByOuter = n.__highByOuter || 0, n.__highDownDispatcher = !r);
}
function Ai(t) {
  return !!(t && t.__highDownDispatcher);
}
function vx(t) {
  var e = Fd[t];
  return e == null && Vd <= 32 && (e = Fd[t] = Vd++), e;
}
function dh(t) {
  var e = t.type;
  return e === Hs || e === fh || e === Gs;
}
function $d(t) {
  var e = t.type;
  return e === In || e === gs;
}
function dx(t) {
  var e = jy(t);
  e.normalFill = t.style.fill, e.normalStroke = t.style.stroke;
  var r = t.states.select || {};
  e.selectFill = r.style && r.style.fill || null, e.selectStroke = r.style && r.style.stroke || null;
}
var Zn = zr.CMD, px = [[], [], []], qd = Math.sqrt, gx = Math.atan2;
function mx(t, e) {
  if (e) {
    var r = t.data, n = t.len(), i, a, o, s, u, l, f = Zn.M, h = Zn.C, c = Zn.L, v = Zn.R, d = Zn.A, p = Zn.Q;
    for (o = 0, s = 0; o < n; ) {
      switch (i = r[o++], s = o, a = 0, i) {
        case f:
          a = 1;
          break;
        case c:
          a = 1;
          break;
        case h:
          a = 3;
          break;
        case p:
          a = 2;
          break;
        case d:
          var m = e[4], g = e[5], y = qd(e[0] * e[0] + e[1] * e[1]), _ = qd(e[2] * e[2] + e[3] * e[3]), S = gx(-e[1] / _, e[0] / y);
          r[o] *= y, r[o++] += m, r[o] *= _, r[o++] += g, r[o++] *= y, r[o++] *= _, r[o++] += S, r[o++] += S, o += 2, s = o;
          break;
        case v:
          l[0] = r[o++], l[1] = r[o++], Ct(l, l, e), r[s++] = l[0], r[s++] = l[1], l[0] += r[o++], l[1] += r[o++], Ct(l, l, e), r[s++] = l[0], r[s++] = l[1];
      }
      for (u = 0; u < a; u++) {
        var b = px[u];
        b[0] = r[o++], b[1] = r[o++], Ct(b, b, e), r[s++] = b[0], r[s++] = b[1];
      }
    }
    t.increaseVersion();
  }
}
var Hl = Math.sqrt, ko = Math.sin, Bo = Math.cos, qi = Math.PI;
function Kd(t) {
  return Math.sqrt(t[0] * t[0] + t[1] * t[1]);
}
function ph(t, e) {
  return (t[0] * e[0] + t[1] * e[1]) / (Kd(t) * Kd(e));
}
function Qd(t, e) {
  return (t[0] * e[1] < t[1] * e[0] ? -1 : 1) * Math.acos(ph(t, e));
}
function jd(t, e, r, n, i, a, o, s, u, l, f) {
  var h = u * (qi / 180), c = Bo(h) * (t - r) / 2 + ko(h) * (e - n) / 2, v = -1 * ko(h) * (t - r) / 2 + Bo(h) * (e - n) / 2, d = c * c / (o * o) + v * v / (s * s);
  d > 1 && (o *= Hl(d), s *= Hl(d));
  var p = (i === a ? -1 : 1) * Hl((o * o * (s * s) - o * o * (v * v) - s * s * (c * c)) / (o * o * (v * v) + s * s * (c * c))) || 0, m = p * o * v / s, g = p * -s * c / o, y = (t + r) / 2 + Bo(h) * m - ko(h) * g, _ = (e + n) / 2 + ko(h) * m + Bo(h) * g, S = Qd([1, 0], [(c - m) / o, (v - g) / s]), b = [(c - m) / o, (v - g) / s], w = [(-1 * c - m) / o, (-1 * v - g) / s], T = Qd(b, w);
  if (ph(b, w) <= -1 && (T = qi), ph(b, w) >= 1 && (T = 0), T < 0) {
    var M = Math.round(T / qi * 1e6) / 1e6;
    T = qi * 2 + M % 2 * qi;
  }
  f.addData(l, y, _, o, s, S, T, h, a);
}
var yx = /([mlvhzcqtsa])([^mlvhzcqtsa]*)/ig, _x = /-?([0-9]*\.)?[0-9]+([eE]-?[0-9]+)?/g;
function Sx(t) {
  var e = new zr();
  if (!t)
    return e;
  var r = 0, n = 0, i = r, a = n, o, s = zr.CMD, u = t.match(yx);
  if (!u)
    return e;
  for (var l = 0; l < u.length; l++) {
    for (var f = u[l], h = f.charAt(0), c = void 0, v = f.match(_x) || [], d = v.length, p = 0; p < d; p++)
      v[p] = parseFloat(v[p]);
    for (var m = 0; m < d; ) {
      var g = void 0, y = void 0, _ = void 0, S = void 0, b = void 0, w = void 0, T = void 0, M = r, D = n, C = void 0, E = void 0;
      switch (h) {
        case "l":
          r += v[m++], n += v[m++], c = s.L, e.addData(c, r, n);
          break;
        case "L":
          r = v[m++], n = v[m++], c = s.L, e.addData(c, r, n);
          break;
        case "m":
          r += v[m++], n += v[m++], c = s.M, e.addData(c, r, n), i = r, a = n, h = "l";
          break;
        case "M":
          r = v[m++], n = v[m++], c = s.M, e.addData(c, r, n), i = r, a = n, h = "L";
          break;
        case "h":
          r += v[m++], c = s.L, e.addData(c, r, n);
          break;
        case "H":
          r = v[m++], c = s.L, e.addData(c, r, n);
          break;
        case "v":
          n += v[m++], c = s.L, e.addData(c, r, n);
          break;
        case "V":
          n = v[m++], c = s.L, e.addData(c, r, n);
          break;
        case "C":
          c = s.C, e.addData(c, v[m++], v[m++], v[m++], v[m++], v[m++], v[m++]), r = v[m - 2], n = v[m - 1];
          break;
        case "c":
          c = s.C, e.addData(c, v[m++] + r, v[m++] + n, v[m++] + r, v[m++] + n, v[m++] + r, v[m++] + n), r += v[m - 2], n += v[m - 1];
          break;
        case "S":
          g = r, y = n, C = e.len(), E = e.data, o === s.C && (g += r - E[C - 4], y += n - E[C - 3]), c = s.C, M = v[m++], D = v[m++], r = v[m++], n = v[m++], e.addData(c, g, y, M, D, r, n);
          break;
        case "s":
          g = r, y = n, C = e.len(), E = e.data, o === s.C && (g += r - E[C - 4], y += n - E[C - 3]), c = s.C, M = r + v[m++], D = n + v[m++], r += v[m++], n += v[m++], e.addData(c, g, y, M, D, r, n);
          break;
        case "Q":
          M = v[m++], D = v[m++], r = v[m++], n = v[m++], c = s.Q, e.addData(c, M, D, r, n);
          break;
        case "q":
          M = v[m++] + r, D = v[m++] + n, r += v[m++], n += v[m++], c = s.Q, e.addData(c, M, D, r, n);
          break;
        case "T":
          g = r, y = n, C = e.len(), E = e.data, o === s.Q && (g += r - E[C - 4], y += n - E[C - 3]), r = v[m++], n = v[m++], c = s.Q, e.addData(c, g, y, r, n);
          break;
        case "t":
          g = r, y = n, C = e.len(), E = e.data, o === s.Q && (g += r - E[C - 4], y += n - E[C - 3]), r += v[m++], n += v[m++], c = s.Q, e.addData(c, g, y, r, n);
          break;
        case "A":
          _ = v[m++], S = v[m++], b = v[m++], w = v[m++], T = v[m++], M = r, D = n, r = v[m++], n = v[m++], c = s.A, jd(M, D, r, n, w, T, _, S, b, c, e);
          break;
        case "a":
          _ = v[m++], S = v[m++], b = v[m++], w = v[m++], T = v[m++], M = r, D = n, r += v[m++], n += v[m++], c = s.A, jd(M, D, r, n, w, T, _, S, b, c, e);
          break;
      }
    }
    (h === "z" || h === "Z") && (c = s.Z, e.addData(c), r = i, n = a), o = c;
  }
  return e.toStatic(), e;
}
var u0 = function(t) {
  V(e, t);
  function e() {
    return t !== null && t.apply(this, arguments) || this;
  }
  return e.prototype.applyTransform = function(r) {
  }, e;
}(be);
function l0(t) {
  return t.setData != null;
}
function f0(t, e) {
  var r = Sx(t), n = R({}, e);
  return n.buildPath = function(i) {
    var a = l0(i);
    if (a && i.canSave()) {
      i.appendPath(r);
      var o = i.getContext();
      o && i.rebuildPath(o, 1);
    } else {
      var o = a ? i.getContext() : i;
      o && r.rebuildPath(o, 1);
    }
  }, n.applyTransform = function(i) {
    mx(r, i), this.dirtyShape();
  }, n;
}
function bx(t, e) {
  return new u0(f0(t, e));
}
function Tx(t, e) {
  var r = f0(t, e), n = function(i) {
    V(a, i);
    function a(o) {
      var s = i.call(this, o) || this;
      return s.applyTransform = r.applyTransform, s.buildPath = r.buildPath, s;
    }
    return a;
  }(u0);
  return n;
}
function xx(t, e) {
  for (var r = [], n = t.length, i = 0; i < n; i++) {
    var a = t[i];
    r.push(a.getUpdatedPathProxy(!0));
  }
  var o = new be(e);
  return o.createPathProxy(), o.buildPath = function(s) {
    if (l0(s)) {
      s.appendPath(r);
      var u = s.getContext();
      u && s.rebuildPath(u, 1);
    }
  }, o;
}
var Cx = /* @__PURE__ */ function() {
  function t() {
    this.cx = 0, this.cy = 0, this.r = 0;
  }
  return t;
}(), Nu = function(t) {
  V(e, t);
  function e(r) {
    return t.call(this, r) || this;
  }
  return e.prototype.getDefaultShape = function() {
    return new Cx();
  }, e.prototype.buildPath = function(r, n) {
    r.moveTo(n.cx + n.r, n.cy), r.arc(n.cx, n.cy, n.r, 0, Math.PI * 2);
  }, e;
}(be);
Nu.prototype.type = "circle";
var Dx = /* @__PURE__ */ function() {
  function t() {
    this.cx = 0, this.cy = 0, this.rx = 0, this.ry = 0;
  }
  return t;
}(), Tc = function(t) {
  V(e, t);
  function e(r) {
    return t.call(this, r) || this;
  }
  return e.prototype.getDefaultShape = function() {
    return new Dx();
  }, e.prototype.buildPath = function(r, n) {
    var i = 0.5522848, a = n.cx, o = n.cy, s = n.rx, u = n.ry, l = s * i, f = u * i;
    r.moveTo(a - s, o), r.bezierCurveTo(a - s, o - f, a - l, o - u, a, o - u), r.bezierCurveTo(a + l, o - u, a + s, o - f, a + s, o), r.bezierCurveTo(a + s, o + f, a + l, o + u, a, o + u), r.bezierCurveTo(a - l, o + u, a - s, o + f, a - s, o), r.closePath();
  }, e;
}(be);
Tc.prototype.type = "ellipse";
var h0 = Math.PI, Gl = h0 * 2, ln = Math.sin, $n = Math.cos, Mx = Math.acos, We = Math.atan2, Jd = Math.abs, Ea = Math.sqrt, ya = Math.max, Gt = Math.min, At = 1e-4;
function Ex(t, e, r, n, i, a, o, s) {
  var u = r - t, l = n - e, f = o - i, h = s - a, c = h * u - f * l;
  if (!(c * c < At))
    return c = (f * (e - a) - h * (t - i)) / c, [t + c * u, e + c * l];
}
function Vo(t, e, r, n, i, a, o) {
  var s = t - r, u = e - n, l = (o ? a : -a) / Ea(s * s + u * u), f = l * u, h = -l * s, c = t + f, v = e + h, d = r + f, p = n + h, m = (c + d) / 2, g = (v + p) / 2, y = d - c, _ = p - v, S = y * y + _ * _, b = i - a, w = c * p - d * v, T = (_ < 0 ? -1 : 1) * Ea(ya(0, b * b * S - w * w)), M = (w * _ - y * T) / S, D = (-w * y - _ * T) / S, C = (w * _ + y * T) / S, E = (-w * y + _ * T) / S, I = M - m, A = D - g, O = C - m, P = E - g;
  return I * I + A * A > O * O + P * P && (M = C, D = E), {
    cx: M,
    cy: D,
    x0: -f,
    y0: -h,
    x1: M * (i / b - 1),
    y1: D * (i / b - 1)
  };
}
function Ax(t) {
  var e;
  if (H(t)) {
    var r = t.length;
    if (!r)
      return t;
    r === 1 ? e = [t[0], t[0], 0, 0] : r === 2 ? e = [t[0], t[0], t[1], t[1]] : r === 3 ? e = t.concat(t[2]) : e = t;
  } else
    e = [t, t, t, t];
  return e;
}
function Ix(t, e) {
  var r, n = ya(e.r, 0), i = ya(e.r0 || 0, 0), a = n > 0, o = i > 0;
  if (!(!a && !o)) {
    if (a || (n = i, i = 0), i > n) {
      var s = n;
      n = i, i = s;
    }
    var u = e.startAngle, l = e.endAngle;
    if (!(isNaN(u) || isNaN(l))) {
      var f = e.cx, h = e.cy, c = !!e.clockwise, v = Jd(l - u), d = v > Gl && v % Gl;
      if (d > At && (v = d), !(n > At))
        t.moveTo(f, h);
      else if (v > Gl - At)
        t.moveTo(f + n * $n(u), h + n * ln(u)), t.arc(f, h, n, u, l, !c), i > At && (t.moveTo(f + i * $n(l), h + i * ln(l)), t.arc(f, h, i, l, u, c));
      else {
        var p = void 0, m = void 0, g = void 0, y = void 0, _ = void 0, S = void 0, b = void 0, w = void 0, T = void 0, M = void 0, D = void 0, C = void 0, E = void 0, I = void 0, A = void 0, O = void 0, P = n * $n(u), L = n * ln(u), B = i * $n(l), U = i * ln(l), Y = v > At;
        if (Y) {
          var j = e.cornerRadius;
          j && (r = Ax(j), p = r[0], m = r[1], g = r[2], y = r[3]);
          var K = Jd(n - i) / 2;
          if (_ = Gt(K, g), S = Gt(K, y), b = Gt(K, p), w = Gt(K, m), D = T = ya(_, S), C = M = ya(b, w), (T > At || M > At) && (E = n * $n(l), I = n * ln(l), A = i * $n(u), O = i * ln(u), v < h0)) {
            var J = Ex(P, L, A, O, E, I, B, U);
            if (J) {
              var $ = P - J[0], F = L - J[1], ne = E - J[0], oe = I - J[1], ze = 1 / ln(Mx(($ * ne + F * oe) / (Ea($ * $ + F * F) * Ea(ne * ne + oe * oe))) / 2), Ue = Ea(J[0] * J[0] + J[1] * J[1]);
              D = Gt(T, (n - Ue) / (ze + 1)), C = Gt(M, (i - Ue) / (ze - 1));
            }
          }
        }
        if (!Y)
          t.moveTo(f + P, h + L);
        else if (D > At) {
          var de = Gt(g, D), De = Gt(y, D), ee = Vo(A, O, P, L, n, de, c), se = Vo(E, I, B, U, n, De, c);
          t.moveTo(f + ee.cx + ee.x0, h + ee.cy + ee.y0), D < T && de === De ? t.arc(f + ee.cx, h + ee.cy, D, We(ee.y0, ee.x0), We(se.y0, se.x0), !c) : (de > 0 && t.arc(f + ee.cx, h + ee.cy, de, We(ee.y0, ee.x0), We(ee.y1, ee.x1), !c), t.arc(f, h, n, We(ee.cy + ee.y1, ee.cx + ee.x1), We(se.cy + se.y1, se.cx + se.x1), !c), De > 0 && t.arc(f + se.cx, h + se.cy, De, We(se.y1, se.x1), We(se.y0, se.x0), !c));
        } else
          t.moveTo(f + P, h + L), t.arc(f, h, n, u, l, !c);
        if (!(i > At) || !Y)
          t.lineTo(f + B, h + U);
        else if (C > At) {
          var de = Gt(p, C), De = Gt(m, C), ee = Vo(B, U, E, I, i, -De, c), se = Vo(P, L, A, O, i, -de, c);
          t.lineTo(f + ee.cx + ee.x0, h + ee.cy + ee.y0), C < M && de === De ? t.arc(f + ee.cx, h + ee.cy, C, We(ee.y0, ee.x0), We(se.y0, se.x0), !c) : (De > 0 && t.arc(f + ee.cx, h + ee.cy, De, We(ee.y0, ee.x0), We(ee.y1, ee.x1), !c), t.arc(f, h, i, We(ee.cy + ee.y1, ee.cx + ee.x1), We(se.cy + se.y1, se.cx + se.x1), c), de > 0 && t.arc(f + se.cx, h + se.cy, de, We(se.y1, se.x1), We(se.y0, se.x0), !c));
        } else
          t.lineTo(f + B, h + U), t.arc(f, h, i, l, u, c);
      }
      t.closePath();
    }
  }
}
var Ox = /* @__PURE__ */ function() {
  function t() {
    this.cx = 0, this.cy = 0, this.r0 = 0, this.r = 0, this.startAngle = 0, this.endAngle = Math.PI * 2, this.clockwise = !0, this.cornerRadius = 0;
  }
  return t;
}(), Ru = function(t) {
  V(e, t);
  function e(r) {
    return t.call(this, r) || this;
  }
  return e.prototype.getDefaultShape = function() {
    return new Ox();
  }, e.prototype.buildPath = function(r, n) {
    Ix(r, n);
  }, e.prototype.isZeroArea = function() {
    return this.shape.startAngle === this.shape.endAngle || this.shape.r === this.shape.r0;
  }, e;
}(be);
Ru.prototype.type = "sector";
var Lx = /* @__PURE__ */ function() {
  function t() {
    this.cx = 0, this.cy = 0, this.r = 0, this.r0 = 0;
  }
  return t;
}(), xc = function(t) {
  V(e, t);
  function e(r) {
    return t.call(this, r) || this;
  }
  return e.prototype.getDefaultShape = function() {
    return new Lx();
  }, e.prototype.buildPath = function(r, n) {
    var i = n.cx, a = n.cy, o = Math.PI * 2;
    r.moveTo(i + n.r, a), r.arc(i, a, n.r, 0, o, !1), r.moveTo(i + n.r0, a), r.arc(i, a, n.r0, 0, o, !0);
  }, e;
}(be);
xc.prototype.type = "ring";
function Px(t, e, r, n) {
  var i = [], a = [], o = [], s = [], u, l, f, h;
  if (n) {
    f = [1 / 0, 1 / 0], h = [-1 / 0, -1 / 0];
    for (var c = 0, v = t.length; c < v; c++)
      ui(f, f, t[c]), li(h, h, t[c]);
    ui(f, f, n[0]), li(h, h, n[1]);
  }
  for (var c = 0, v = t.length; c < v; c++) {
    var d = t[c];
    if (r)
      u = t[c ? c - 1 : v - 1], l = t[(c + 1) % v];
    else if (c === 0 || c === v - 1) {
      i.push(WS(t[c]));
      continue;
    } else
      u = t[c - 1], l = t[c + 1];
    YS(a, l, u), nl(a, a, e);
    var p = Pf(d, u), m = Pf(d, l), g = p + m;
    g !== 0 && (p /= g, m /= g), nl(o, a, -p), nl(s, a, m);
    var y = Av([], d, o), _ = Av([], d, s);
    n && (li(y, y, f), ui(y, y, h), li(_, _, f), ui(_, _, h)), i.push(y), i.push(_);
  }
  return r && i.push(i.shift()), i;
}
function c0(t, e, r) {
  var n = e.smooth, i = e.points;
  if (i && i.length >= 2) {
    if (n) {
      var a = Px(i, n, r, e.smoothConstraint);
      t.moveTo(i[0][0], i[0][1]);
      for (var o = i.length, s = 0; s < (r ? o : o - 1); s++) {
        var u = a[s * 2], l = a[s * 2 + 1], f = i[(s + 1) % o];
        t.bezierCurveTo(u[0], u[1], l[0], l[1], f[0], f[1]);
      }
    } else {
      t.moveTo(i[0][0], i[0][1]);
      for (var s = 1, h = i.length; s < h; s++)
        t.lineTo(i[s][0], i[s][1]);
    }
    r && t.closePath();
  }
}
var Nx = /* @__PURE__ */ function() {
  function t() {
    this.points = null, this.smooth = 0, this.smoothConstraint = null;
  }
  return t;
}(), ku = function(t) {
  V(e, t);
  function e(r) {
    return t.call(this, r) || this;
  }
  return e.prototype.getDefaultShape = function() {
    return new Nx();
  }, e.prototype.buildPath = function(r, n) {
    c0(r, n, !0);
  }, e;
}(be);
ku.prototype.type = "polygon";
var Rx = /* @__PURE__ */ function() {
  function t() {
    this.points = null, this.percent = 1, this.smooth = 0, this.smoothConstraint = null;
  }
  return t;
}(), Bu = function(t) {
  V(e, t);
  function e(r) {
    return t.call(this, r) || this;
  }
  return e.prototype.getDefaultStyle = function() {
    return {
      stroke: "#000",
      fill: null
    };
  }, e.prototype.getDefaultShape = function() {
    return new Rx();
  }, e.prototype.buildPath = function(r, n) {
    c0(r, n, !1);
  }, e;
}(be);
Bu.prototype.type = "polyline";
var kx = {}, Bx = /* @__PURE__ */ function() {
  function t() {
    this.x1 = 0, this.y1 = 0, this.x2 = 0, this.y2 = 0, this.percent = 1;
  }
  return t;
}(), Hr = function(t) {
  V(e, t);
  function e(r) {
    return t.call(this, r) || this;
  }
  return e.prototype.getDefaultStyle = function() {
    return {
      stroke: "#000",
      fill: null
    };
  }, e.prototype.getDefaultShape = function() {
    return new Bx();
  }, e.prototype.buildPath = function(r, n) {
    var i, a, o, s;
    if (this.subPixelOptimize) {
      var u = Yy(kx, n, this.style);
      i = u.x1, a = u.y1, o = u.x2, s = u.y2;
    } else
      i = n.x1, a = n.y1, o = n.x2, s = n.y2;
    var l = n.percent;
    l !== 0 && (r.moveTo(i, a), l < 1 && (o = i * (1 - l) + o * l, s = a * (1 - l) + s * l), r.lineTo(o, s));
  }, e.prototype.pointAt = function(r) {
    var n = this.shape;
    return [
      n.x1 * (1 - r) + n.x2 * r,
      n.y1 * (1 - r) + n.y2 * r
    ];
  }, e;
}(be);
Hr.prototype.type = "line";
var et = [], Vx = /* @__PURE__ */ function() {
  function t() {
    this.x1 = 0, this.y1 = 0, this.x2 = 0, this.y2 = 0, this.cpx1 = 0, this.cpy1 = 0, this.percent = 1;
  }
  return t;
}();
function ep(t, e, r) {
  var n = t.cpx2, i = t.cpy2;
  return n != null || i != null ? [
    (r ? Uv : Ge)(t.x1, t.cpx1, t.cpx2, t.x2, e),
    (r ? Uv : Ge)(t.y1, t.cpy1, t.cpy2, t.y2, e)
  ] : [
    (r ? Wv : rt)(t.x1, t.cpx1, t.x2, e),
    (r ? Wv : rt)(t.y1, t.cpy1, t.y2, e)
  ];
}
var Cc = function(t) {
  V(e, t);
  function e(r) {
    return t.call(this, r) || this;
  }
  return e.prototype.getDefaultStyle = function() {
    return {
      stroke: "#000",
      fill: null
    };
  }, e.prototype.getDefaultShape = function() {
    return new Vx();
  }, e.prototype.buildPath = function(r, n) {
    var i = n.x1, a = n.y1, o = n.x2, s = n.y2, u = n.cpx1, l = n.cpy1, f = n.cpx2, h = n.cpy2, c = n.percent;
    c !== 0 && (r.moveTo(i, a), f == null || h == null ? (c < 1 && (Ns(i, u, o, c, et), u = et[1], o = et[2], Ns(a, l, s, c, et), l = et[1], s = et[2]), r.quadraticCurveTo(u, l, o, s)) : (c < 1 && (Ps(i, u, f, o, c, et), u = et[1], f = et[2], o = et[3], Ps(a, l, h, s, c, et), l = et[1], h = et[2], s = et[3]), r.bezierCurveTo(u, l, f, h, o, s)));
  }, e.prototype.pointAt = function(r) {
    return ep(this.shape, r, !1);
  }, e.prototype.tangentAt = function(r) {
    var n = ep(this.shape, r, !0);
    return $S(n, n);
  }, e;
}(be);
Cc.prototype.type = "bezier-curve";
var Fx = /* @__PURE__ */ function() {
  function t() {
    this.cx = 0, this.cy = 0, this.r = 0, this.startAngle = 0, this.endAngle = Math.PI * 2, this.clockwise = !0;
  }
  return t;
}(), Vu = function(t) {
  V(e, t);
  function e(r) {
    return t.call(this, r) || this;
  }
  return e.prototype.getDefaultStyle = function() {
    return {
      stroke: "#000",
      fill: null
    };
  }, e.prototype.getDefaultShape = function() {
    return new Fx();
  }, e.prototype.buildPath = function(r, n) {
    var i = n.cx, a = n.cy, o = Math.max(n.r, 0), s = n.startAngle, u = n.endAngle, l = n.clockwise, f = Math.cos(s), h = Math.sin(s);
    r.moveTo(f * o + i, h * o + a), r.arc(i, a, o, s, u, !l);
  }, e;
}(be);
Vu.prototype.type = "arc";
var v0 = function(t) {
  V(e, t);
  function e() {
    var r = t !== null && t.apply(this, arguments) || this;
    return r.type = "compound", r;
  }
  return e.prototype._updatePathDirty = function() {
    for (var r = this.shape.paths, n = this.shapeChanged(), i = 0; i < r.length; i++)
      n = n || r[i].shapeChanged();
    n && this.dirtyShape();
  }, e.prototype.beforeBrush = function() {
    this._updatePathDirty();
    for (var r = this.shape.paths || [], n = this.getGlobalScale(), i = 0; i < r.length; i++)
      r[i].path || r[i].createPathProxy(), r[i].path.setScale(n[0], n[1], r[i].segmentIgnoreThreshold);
  }, e.prototype.buildPath = function(r, n) {
    for (var i = n.paths || [], a = 0; a < i.length; a++)
      i[a].buildPath(r, i[a].shape, !0);
  }, e.prototype.afterBrush = function() {
    for (var r = this.shape.paths || [], n = 0; n < r.length; n++)
      r[n].pathUpdated();
  }, e.prototype.getBoundingRect = function() {
    return this._updatePathDirty.call(this), be.prototype.getBoundingRect.call(this);
  }, e;
}(be), d0 = function() {
  function t(e) {
    this.colorStops = e || [];
  }
  return t.prototype.addColorStop = function(e, r) {
    this.colorStops.push({
      offset: e,
      color: r
    });
  }, t;
}(), p0 = function(t) {
  V(e, t);
  function e(r, n, i, a, o, s) {
    var u = t.call(this, o) || this;
    return u.x = r ?? 0, u.y = n ?? 0, u.x2 = i ?? 1, u.y2 = a ?? 0, u.type = "linear", u.global = s || !1, u;
  }
  return e;
}(d0), zx = function(t) {
  V(e, t);
  function e(r, n, i, a, o) {
    var s = t.call(this, a) || this;
    return s.x = r ?? 0.5, s.y = n ?? 0.5, s.r = i ?? 0.5, s.type = "radial", s.global = o || !1, s;
  }
  return e;
}(d0), Ul = Math.min, Hx = Math.max, Fo = Math.abs, fn = [0, 0], hn = [0, 0], Be = Jm(), zo = Be.minTv, Ho = Be.maxTv, g0 = function() {
  function t(e, r) {
    this._corners = [], this._axes = [], this._origin = [0, 0];
    for (var n = 0; n < 4; n++)
      this._corners[n] = new _e();
    for (var n = 0; n < 2; n++)
      this._axes[n] = new _e();
    e && this.fromBoundingRect(e, r);
  }
  return t.prototype.fromBoundingRect = function(e, r) {
    var n = this._corners, i = this._axes, a = e.x, o = e.y, s = a + e.width, u = o + e.height;
    if (n[0].set(a, o), n[1].set(s, o), n[2].set(s, u), n[3].set(a, u), r)
      for (var l = 0; l < 4; l++)
        n[l].transform(r);
    _e.sub(i[0], n[1], n[0]), _e.sub(i[1], n[3], n[0]), i[0].normalize(), i[1].normalize();
    for (var l = 0; l < 2; l++)
      this._origin[l] = i[l].dot(n[0]);
  }, t.prototype.intersect = function(e, r, n) {
    var i = !0, a = !r;
    return r && _e.set(r, 0, 0), Be.reset(n, !a), !this._intersectCheckOneSide(this, e, a, 1) && (i = !1, a) || !this._intersectCheckOneSide(e, this, a, -1) && (i = !1, a) || !a && !Be.negativeSize && _e.copy(r, i ? Be.useDir ? Be.dirMinTv : zo : Ho), i;
  }, t.prototype._intersectCheckOneSide = function(e, r, n, i) {
    for (var a = !0, o = 0; o < 2; o++) {
      var s = e._axes[o];
      if (e._getProjMinMaxOnAxis(o, e._corners, fn), e._getProjMinMaxOnAxis(o, r._corners, hn), Be.negativeSize || fn[1] < hn[0] || fn[0] > hn[1]) {
        if (a = !1, Be.negativeSize || n)
          return a;
        var u = Fo(hn[0] - fn[1]), l = Fo(fn[0] - hn[1]);
        Ul(u, l) > Ho.len() && (u < l ? _e.scale(Ho, s, -u * i) : _e.scale(Ho, s, l * i));
      } else if (!n) {
        var u = Fo(hn[0] - fn[1]), l = Fo(fn[0] - hn[1]);
        (Be.useDir || Ul(u, l) < zo.len()) && ((u < l || !Be.bidirectional) && (_e.scale(zo, s, u * i), Be.useDir && Be.calcDirMTV()), (u >= l || !Be.bidirectional) && (_e.scale(zo, s, -l * i), Be.useDir && Be.calcDirMTV()));
      }
    }
    return a;
  }, t.prototype._getProjMinMaxOnAxis = function(e, r, n) {
    for (var i = this._axes[e], a = this._origin, o = r[0].dot(i) + a[e], s = o, u = o, l = 1; l < r.length; l++) {
      var f = r[l].dot(i) + a[e];
      s = Ul(f, s), u = Hx(f, u);
    }
    n[0] = s + Be.touchThreshold, n[1] = u - Be.touchThreshold, Be.negativeSize = n[1] < n[0];
  }, t;
}(), Gx = 1, Ux = [], Wx = function(t) {
  V(e, t);
  function e() {
    var r = t !== null && t.apply(this, arguments) || this;
    return r.notClear = !0, r.incremental = Gx, r._displayables = [], r._temporaryDisplayables = [], r._cursor = 0, r;
  }
  return e.prototype.traverse = function(r, n) {
    r.call(n, this);
  }, e.prototype.useStyle = function() {
    this.style = {};
  }, e.prototype._useHoverStyle = function() {
    this.__hoverStyle = null;
  }, e.prototype.getCursor = function() {
    return this._cursor;
  }, e.prototype.innerAfterBrush = function() {
    this._cursor = this._displayables.length;
  }, e.prototype.clearDisplaybles = function() {
    this._displayables = [], this._temporaryDisplayables = [], this._cursor = 0, this.markRedraw(), this.notClear = !1;
  }, e.prototype.clearTemporalDisplayables = function() {
    this._temporaryDisplayables = [];
  }, e.prototype.addDisplayable = function(r, n) {
    n ? this._temporaryDisplayables.push(r) : this._displayables.push(r), this.markRedraw();
  }, e.prototype.addDisplayables = function(r, n) {
    n = n || !1;
    for (var i = 0; i < r.length; i++)
      this.addDisplayable(r[i], n);
  }, e.prototype.getDisplayables = function() {
    return this._displayables;
  }, e.prototype.getTemporalDisplayables = function() {
    return this._temporaryDisplayables;
  }, e.prototype.eachPendingDisplayable = function(r) {
    for (var n = this._cursor; n < this._displayables.length; n++)
      r && r(this._displayables[n]);
    for (var n = 0; n < this._temporaryDisplayables.length; n++)
      r && r(this._temporaryDisplayables[n]);
  }, e.prototype.update = function() {
    this.updateTransform();
    for (var r = this._cursor; r < this._displayables.length; r++) {
      var n = this._displayables[r];
      n.parent = this, n.update(), n.parent = null;
    }
    for (var r = 0; r < this._temporaryDisplayables.length; r++) {
      var n = this._temporaryDisplayables[r];
      n.parent = this, n.update(), n.parent = null;
    }
  }, e.prototype.getBoundingRect = function() {
    if (!this._rect) {
      for (var r = new ie(1 / 0, 1 / 0, -1 / 0, -1 / 0), n = 0; n < this._displayables.length; n++) {
        var i = this._displayables[n], a = i.getBoundingRect().clone();
        i.needLocalTransform() && a.applyTransform(i.getLocalTransform(Ux)), r.union(a);
      }
      this._rect = r;
    }
    return this._rect;
  }, e.prototype.contain = function(r, n) {
    var i = this.transformCoordToLocal(r, n), a = this.getBoundingRect();
    if (a.contain(i[0], i[1]))
      for (var o = 0; o < this._displayables.length; o++) {
        var s = this._displayables[o];
        if (s.contain(r, n))
          return !0;
      }
    return !1;
  }, e;
}(ho), Yx = ve();
function Xx(t, e, r, n, i) {
  var a;
  if (e && e.ecModel) {
    var o = e.ecModel.getUpdatePayload();
    a = o && o.animation;
  }
  var s = e && e.isAnimationEnabled(), u = t === "update";
  if (s) {
    var l = void 0, f = void 0, h = void 0;
    n ? (l = W(n.duration, 200), f = W(n.easing, "cubicOut"), h = 0) : (l = e.getShallow(u ? "animationDurationUpdate" : "animationDuration"), f = e.getShallow(u ? "animationEasingUpdate" : "animationEasing"), h = e.getShallow(u ? "animationDelayUpdate" : "animationDelay")), a && (a.duration != null && (l = a.duration), a.easing != null && (f = a.easing), a.delay != null && (h = a.delay)), Q(h) && (h = h(r, i)), Q(l) && (l = l(r));
    var c = {
      duration: l || 0,
      delay: h,
      easing: f
    };
    return c;
  } else
    return null;
}
function Dc(t, e, r, n, i, a, o) {
  var s = !1, u;
  Q(i) ? (o = a, a = i, i = null) : q(i) && (a = i.cb, o = i.during, s = i.isFrom, u = i.removeOpt, i = i.dataIndex);
  var l = t === "leave";
  l || e.stopAnimation("leave");
  var f = Xx(t, n, i, l ? u || {} : null, n && n.getAnimationDelayParams ? n.getAnimationDelayParams(e, i) : null);
  if (f && f.duration > 0) {
    var h = f.duration, c = f.delay, v = f.easing, d = {
      duration: h,
      delay: c || 0,
      easing: v,
      done: a,
      force: !!a || !!o,
      // Set to final state in update/init animation.
      // So the post processing based on the path shape can be done correctly.
      setToFinal: !l,
      scope: t,
      during: o
    };
    s ? e.animateFrom(r, d) : e.animateTo(r, d);
  } else
    e.stopAnimation(), !s && e.attr(r), o && o(1), a && a();
}
function Gr(t, e, r, n, i, a) {
  Dc("update", t, e, r, n, i, a);
}
function vo(t, e, r, n, i, a) {
  Dc("enter", t, e, r, n, i, a);
}
function Aa(t) {
  if (!t.__zr)
    return !0;
  for (var e = 0; e < t.animators.length; e++) {
    var r = t.animators[e];
    if (r.scope === "leave")
      return !0;
  }
  return !1;
}
function Xs(t, e, r, n, i, a) {
  Aa(t) || Dc("leave", t, e, r, n, i, a);
}
function tp(t, e, r, n) {
  t.removeTextContent(), t.removeTextGuideLine(), Xs(t, {
    style: {
      opacity: 0
    }
  }, e, r, n);
}
function Zx(t, e, r) {
  function n() {
    t.parent && t.parent.remove(t);
  }
  t.isGroup ? t.traverse(function(i) {
    i.isGroup || tp(i, e, r, n);
  }) : tp(t, e, r, n);
}
function $x(t) {
  Yx(t).oldStyle = t.style;
}
var gh = {}, bn = ["x", "y"], Ha = ["width", "height"], m0 = 0, y0 = 1, Mc = 2;
function qx(t) {
  return be.extend(t);
}
var Kx = Tx;
function Qx(t, e) {
  return Kx(t, e);
}
function kt(t, e) {
  gh[t] = e;
}
function jx(t) {
  if (gh.hasOwnProperty(t))
    return gh[t];
}
function Ec(t, e, r, n) {
  var i = bx(t, e);
  return r && (n === "center" && (r = S0(r, i.getBoundingRect())), b0(i, r)), i;
}
function _0(t, e, r) {
  var n = new or({
    style: {
      image: t,
      x: e.x,
      y: e.y,
      width: e.width,
      height: e.height
    },
    onload: function(i) {
      if (r === "center") {
        var a = {
          width: i.width,
          height: i.height
        };
        n.setStyle(S0(e, a));
      }
    }
  });
  return n;
}
function S0(t, e) {
  var r = e.width / e.height, n = t.height * r, i;
  n <= t.width ? i = t.height : (n = t.width, i = n / r);
  var a = t.x + t.width / 2, o = t.y + t.height / 2;
  return {
    x: a - n / 2,
    y: o - i / 2,
    width: n,
    height: i
  };
}
var Jx = xx;
function b0(t, e) {
  if (t.applyTransform) {
    var r = t.getBoundingRect(), n = r.calculateTransform(e);
    t.applyTransform(n);
  }
}
function Ga(t, e) {
  return Yy(t, t, {
    lineWidth: e
  }), t;
}
function eC(t, e) {
  return Xy(t, t, e), t;
}
var tC = Cn;
function w0(t, e) {
  for (var r = io([]); t && t !== e; )
    xa(r, t.getLocalTransform(), r), t = t.parent;
  return r;
}
function Ua(t, e, r) {
  return e && !ot(e) && (e = so.getLocalTransform(e)), r && (e = ao([], e)), Ct([], t, e);
}
function T0(t, e, r) {
  var n = e[4] === 0 || e[5] === 0 || e[0] === 0 ? 1 : Pe(2 * e[4] / e[0]), i = e[4] === 0 || e[5] === 0 || e[2] === 0 ? 1 : Pe(2 * e[4] / e[2]), a = [t === "left" ? -n : t === "right" ? n : 0, t === "top" ? -i : t === "bottom" ? i : 0];
  return a = Ua(a, e, r), Pe(a[0]) > Pe(a[1]) ? a[0] > 0 ? "right" : "left" : a[1] > 0 ? "bottom" : "top";
}
function rp(t) {
  return !t.isGroup;
}
function rC(t) {
  return t.shape != null;
}
function x0(t, e, r) {
  if (!t || !e)
    return;
  function n(o) {
    var s = {};
    return o.traverse(function(u) {
      rp(u) && u.anid && (s[u.anid] = u);
    }), s;
  }
  function i(o) {
    var s = {
      x: o.x,
      y: o.y,
      rotation: o.rotation
    };
    return rC(o) && (s.shape = ae(o.shape)), s;
  }
  var a = n(t);
  e.traverse(function(o) {
    if (rp(o) && o.anid) {
      var s = a[o.anid];
      if (s) {
        var u = i(o);
        o.attr(i(s)), Gr(o, u, r, me(o).dataIndex);
      }
    }
  });
}
function nC(t, e) {
  return X(t, function(r) {
    var n = r[0];
    n = ye(n, e.x), n = st(n, e.x + e.width);
    var i = r[1];
    return i = ye(i, e.y), i = st(i, e.y + e.height), [n, i];
  });
}
function iC(t, e) {
  var r = ye(t.x, e.x), n = st(t.x + t.width, e.x + e.width), i = ye(t.y, e.y), a = st(t.y + t.height, e.y + e.height);
  if (n >= r && a >= i)
    return {
      x: r,
      y: i,
      width: n - r,
      height: a - i
    };
}
function Ac(t, e, r) {
  var n = R({
    rectHover: !0
  }, e), i = n.style = {
    strokeNoScale: !0
  };
  if (r = r || {
    x: -1,
    y: -1,
    width: 2,
    height: 2
  }, t)
    return t.indexOf("image://") === 0 ? (i.image = t.slice(8), ge(i, r), new or(n)) : Ec(t.replace("path://", ""), n, r, "center");
}
function aC(t, e, r, n, i) {
  for (var a = 0, o = i[i.length - 1]; a < i.length; a++) {
    var s = i[a];
    if (C0(t, e, r, n, s[0], s[1], o[0], o[1]))
      return !0;
    o = s;
  }
}
function C0(t, e, r, n, i, a, o, s) {
  var u = r - t, l = n - e, f = o - i, h = s - a, c = Wl(f, h, u, l);
  if (oC(c))
    return !1;
  var v = t - i, d = e - a, p = Wl(v, d, u, l) / c;
  if (p < 0 || p > 1)
    return !1;
  var m = Wl(v, d, f, h) / c;
  return !(m < 0 || m > 1);
}
function Wl(t, e, r, n) {
  return t * n - r * e;
}
function oC(t) {
  return t <= 1e-6 && t >= -1e-6;
}
function Zs(t, e, r, n, i) {
  return e == null || (Te(e) ? we[0] = we[1] = we[2] = we[3] = e : (process.env.NODE_ENV !== "production" && N(e.length === 4), we[0] = e[0], we[1] = e[1], we[2] = e[2], we[3] = e[3]), n && (we[0] = ye(0, we[0]), we[1] = ye(0, we[1]), we[2] = ye(0, we[2]), we[3] = ye(0, we[3])), r && (we[0] = -we[0], we[1] = -we[1], we[2] = -we[2], we[3] = -we[3]), np(t, we, "x", "width", 3, 1, i && i[0] || 0), np(t, we, "y", "height", 0, 2, i && i[1] || 0)), t;
}
var we = [0, 0, 0, 0];
function np(t, e, r, n, i, a, o) {
  var s = e[a] + e[i], u = t[n];
  t[n] += s, o = ye(0, st(o, u)), t[n] < o ? (t[n] = o, t[r] += e[i] >= 0 ? -e[i] : e[a] >= 0 ? u + e[a] : Pe(s) > 1e-8 ? (u - o) * e[i] / s : 0) : t[r] -= e[i];
}
function Fu(t) {
  var e = t.itemTooltipOption, r = t.componentModel, n = t.itemName, i = z(e) ? {
    formatter: e
  } : e, a = r.mainType, o = r.componentIndex, s = {
    componentType: a,
    name: n,
    $vars: ["name"]
  };
  s[a + "Index"] = o;
  var u = t.formatterParamsExtra;
  u && x(le(u), function(f) {
    at(s, f) || (s[f] = u[f], s.$vars.push(f));
  });
  var l = me(t.el);
  l.componentMainType = a, l.componentIndex = o, l.tooltipConfig = {
    name: n,
    option: ge({
      content: n,
      encodeHTMLContent: !0,
      formatterParams: s
    }, i)
  };
}
function mh(t, e) {
  var r;
  t.isGroup && (r = e(t)), r || t.traverse(e);
}
function Ic(t, e) {
  if (t)
    if (H(t))
      for (var r = 0; r < t.length; r++)
        mh(t[r], e);
    else
      mh(t, e);
}
function Oc(t) {
  return !t || Pe(t[1]) < Go && Pe(t[2]) < Go || Pe(t[0]) < Go && Pe(t[3]) < Go;
}
var Go = 1e-5;
function Wa(t, e) {
  return t ? ie.copy(t, e) : e.clone();
}
function Lc(t, e) {
  return e ? nc(t || $t(), e) : void 0;
}
function Ya(t) {
  return {
    z: t.get("z") || 0,
    zlevel: t.get("zlevel") || 0
  };
}
function sC(t) {
  var e = -1 / 0, r = 1 / 0;
  mh(t, function(a) {
    n(a), n(a.getTextContent()), n(a.getTextGuideLine());
  });
  function n(a) {
    if (!(!a || a.isGroup)) {
      var o = a.currentStates;
      if (o.length)
        for (var s = 0; s < o.length; s++)
          i(a.states[o[s]]);
      i(a);
    }
  }
  function i(a) {
    if (a) {
      var o = a.z2;
      o > e && (e = o), o < r && (r = o);
    }
  }
  return r > e && (r = e = 0), {
    min: r,
    max: e
  };
}
function D0(t, e, r) {
  M0(t, e, r, -1 / 0);
}
function M0(t, e, r, n) {
  if (t.ignoreModelZ)
    return n;
  var i = t.getTextContent(), a = t.getTextGuideLine(), o = t.isGroup;
  if (o)
    for (var s = t.childrenRef(), u = 0; u < s.length; u++)
      n = ye(M0(s[u], e, r, n), n);
  else
    t.z = e, t.zlevel = r, n = ye(t.z2 || 0, n);
  if (i && (i.z = e, i.zlevel = r, isFinite(n) && (i.z2 = n + 2)), a) {
    var l = t.textGuideLineConfig;
    a.z = e, a.zlevel = r, isFinite(n) && (a.z2 = n + (l && l.showAbove ? 1 : -1));
  }
  return n;
}
function uC(t) {
  return t.animation = {
    duration: 0
  }, t;
}
function lC(t, e) {
  return e ? nc(_a.transform, e) : io(_a.transform), _a.decomposeTransform(), Ba(t, _a), t;
}
var _a = new so();
_a.transform = $t();
function fC(t) {
  var e = t.getZr().painter;
  return e.getType() === "canvas" ? e : null;
}
kt("circle", Nu);
kt("ellipse", Tc);
kt("sector", Ru);
kt("ring", xc);
kt("polygon", ku);
kt("polyline", Bu);
kt("rect", Ce);
kt("line", Hr);
kt("bezierCurve", Cc);
kt("arc", Vu);
const hC = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Arc: Vu,
  BezierCurve: Cc,
  BoundingRect: ie,
  Circle: Nu,
  CompoundPath: v0,
  Ellipse: Tc,
  Group: Re,
  HOVER_LAYER_FOR_INCREMENTAL: Mc,
  HOVER_LAYER_FROM_THRESHOLD: y0,
  HOVER_LAYER_NO: m0,
  Image: or,
  IncrementalDisplayable: Wx,
  Line: Hr,
  LinearGradient: p0,
  OrientedBoundingRect: g0,
  Path: be,
  Point: _e,
  Polygon: ku,
  Polyline: Bu,
  RadialGradient: zx,
  Rect: Ce,
  Ring: xc,
  Sector: Ru,
  Text: Je,
  WH: Ha,
  XY: bn,
  applyTransform: Ua,
  calcZ2Range: sC,
  clipPointsByRect: nC,
  clipRectByRect: iC,
  createIcon: Ac,
  decomposeTransform: lC,
  ensureCopyRect: Wa,
  ensureCopyTransform: Lc,
  expandOrShrinkRect: Zs,
  extendPath: Qx,
  extendShape: qx,
  getCurrentCanvasPainter: fC,
  getShapeClass: jx,
  getTransform: w0,
  groupTransition: x0,
  initProps: vo,
  isBoundingRectAxisAligned: Oc,
  isElementRemoved: Aa,
  lineLineIntersect: C0,
  linePolygonIntersect: aC,
  makeImage: _0,
  makePath: Ec,
  mergePath: Jx,
  payloadDisableAnimation: uC,
  registerShape: kt,
  removeElement: Xs,
  removeElementWithFadeOut: Zx,
  resizePath: b0,
  retrieveZInfo: Ya,
  setTooltipConfig: Fu,
  subPixelOptimize: tC,
  subPixelOptimizeLine: Ga,
  subPixelOptimizeRect: eC,
  transformDirection: T0,
  traverseElements: Ic,
  traverseUpdateZ: D0,
  updateProps: Gr
}, Symbol.toStringTag, { value: "Module" }));
var zu = {};
function cC(t, e) {
  for (var r = 0; r < rr.length; r++) {
    var n = rr[r], i = e[n], a = t.ensureState(n);
    a.style = a.style || {}, a.style.text = i;
  }
  var o = t.currentStates.slice();
  t.clearStates(!0), t.setStyle({
    text: e.normal
  }), t.useStates(o, !0);
}
function ip(t, e, r) {
  var n = t.labelFetcher, i = t.labelDataIndex, a = t.labelDimIndex, o = e.normal, s;
  n && (s = n.getFormattedLabel(i, "normal", null, a, o && o.get("formatter"), r != null ? {
    interpolatedValue: r
  } : null)), s == null && (s = Q(t.defaultText) ? t.defaultText(i, t, r) : t.defaultText);
  for (var u = {
    normal: s
  }, l = 0; l < rr.length; l++) {
    var f = rr[l], h = e[f];
    u[f] = W(n ? n.getFormattedLabel(i, f, null, a, h && h.get("formatter")) : null, s);
  }
  return u;
}
function Pc(t, e, r, n) {
  r = r || zu;
  for (var i = t instanceof Je, a = !1, o = 0; o < zd.length; o++) {
    var s = e[zd[o]];
    if (s && s.getShallow("show")) {
      a = !0;
      break;
    }
  }
  var u = i ? t : t.getTextContent();
  if (a) {
    i || (u || (u = new Je(), t.setTextContent(u)), t.stateProxy && (u.stateProxy = t.stateProxy));
    var l = ip(r, e), f = e.normal, h = !!f.getShallow("show"), c = Nn(f, n && n.normal, r, !1, !i);
    c.text = l.normal, i || t.setTextConfig(ap(f, r, !1));
    for (var o = 0; o < rr.length; o++) {
      var v = rr[o], s = e[v];
      if (s) {
        var d = u.ensureState(v), p = !!W(s.getShallow("show"), h);
        if (p !== h && (d.ignore = !p), d.style = Nn(s, n && n[v], r, !0, !i), d.style.text = l[v], !i) {
          var m = t.ensureState(v);
          m.textConfig = ap(s, r, !0);
        }
      }
    }
    u.silent = !!f.getShallow("silent"), u.style.x != null && (c.x = u.style.x), u.style.y != null && (c.y = u.style.y), u.ignore = !h, u.useStyle(c), u.dirty(), r.enableTextSetter && (E0(u).setLabelText = function(g) {
      var y = ip(r, e, g);
      cC(u, y);
    });
  } else u && (u.ignore = !0);
  t.dirty();
}
function Nc(t, e) {
  e = e || "label";
  for (var r = {
    normal: t.getModel(e)
  }, n = 0; n < rr.length; n++) {
    var i = rr[n];
    r[i] = t.getModel([i, e]);
  }
  return r;
}
function Nn(t, e, r, n, i) {
  var a = {};
  return vC(a, t, r, n, i), e && R(a, e), a;
}
function ap(t, e, r) {
  e = e || {};
  var n = {}, i, a = t.getShallow("rotate"), o = W(t.getShallow("distance"), r ? null : 5), s = t.getShallow("offset");
  return i = t.getShallow("position") || (r ? null : "inside"), i === "outside" && (i = e.defaultOutsidePosition || "top"), i != null && (n.position = i), s != null && (n.offset = s), a != null && (a *= Math.PI / 180, n.rotation = a), o != null && (n.distance = o), n.outsideFill = t.get("color") === "inherit" ? e.inheritColor || null : "auto", e.autoOverflowArea != null && (n.autoOverflowArea = e.autoOverflowArea), e.layoutRect != null && (n.layoutRect = e.layoutRect), n;
}
function vC(t, e, r, n, i) {
  r = r || zu;
  var a = e.ecModel, o = a && a.option.textStyle, s = dC(e), u;
  if (s) {
    u = {};
    var l = "richInheritPlainLabel", f = W(e.get(l), a ? a.get(l) : void 0);
    for (var h in s)
      if (s.hasOwnProperty(h)) {
        var c = e.getModel(["rich", h]);
        lp(u[h] = {}, c, o, e, f, r, n, i, !1, !0);
      }
  }
  u && (t.rich = u);
  var v = e.get("overflow");
  v && (t.overflow = v);
  var d = e.get("lineOverflow");
  d && (t.lineOverflow = d);
  var p = t, m = e.get("minMargin");
  if (m != null)
    m = Te(m) ? m / 2 : 0, p.margin = [m, m, m, m], p.__marginType = vi.minMargin;
  else {
    var g = e.get("textMargin");
    g != null && (p.margin = tc(g), p.__marginType = vi.textMargin);
  }
  lp(t, e, o, null, null, r, n, i, !0, !1);
}
function dC(t) {
  for (var e; t && t !== t.ecModel; ) {
    var r = (t.option || zu).rich;
    if (r) {
      e = e || {};
      for (var n = le(r), i = 0; i < n.length; i++) {
        var a = n[i];
        e[a] = 1;
      }
    }
    t = t.parentModel;
  }
  return e;
}
var op = ["fontStyle", "fontWeight", "fontSize", "fontFamily", "textShadowColor", "textShadowBlur", "textShadowOffsetX", "textShadowOffsetY"], sp = ["align", "lineHeight", "width", "height", "tag", "verticalAlign", "ellipsis"], up = ["padding", "borderWidth", "borderRadius", "borderDashOffset", "backgroundColor", "borderColor", "shadowColor", "shadowBlur", "shadowOffsetX", "shadowOffsetY"];
function lp(t, e, r, n, i, a, o, s, u, l) {
  r = !o && r || zu;
  var f = a && a.inheritColor, h = e.getShallow("color"), c = e.getShallow("textBorderColor"), v = W(e.getShallow("opacity"), r.opacity);
  (h === "inherit" || h === "auto") && (process.env.NODE_ENV !== "production" && h === "auto" && Ve("color: 'auto'", "color: 'inherit'"), f ? h = f : h = null), (c === "inherit" || c === "auto") && (process.env.NODE_ENV !== "production" && c === "auto" && Ve("color: 'auto'", "color: 'inherit'"), f ? c = f : c = null), s || (h = h || r.color, c = c || r.textBorderColor), h != null && (t.fill = h), c != null && (t.stroke = c);
  var d = W(e.getShallow("textBorderWidth"), r.textBorderWidth);
  d != null && (t.lineWidth = d);
  var p = W(e.getShallow("textBorderType"), r.textBorderType);
  p != null && (t.lineDash = p);
  var m = W(e.getShallow("textBorderDashOffset"), r.textBorderDashOffset);
  m != null && (t.lineDashOffset = m), !o && v == null && !l && (v = a && a.defaultOpacity), v != null && (t.opacity = v), !o && !s && t.fill == null && a.inheritColor && (t.fill = a.inheritColor);
  for (var g = 0; g < op.length; g++) {
    var y = op[g], _ = i !== !1 && n ? Rr(e.getShallow(y), n.getShallow(y), r[y]) : W(e.getShallow(y), r[y]);
    _ != null && (t[y] = _);
  }
  for (var g = 0; g < sp.length; g++) {
    var y = sp[g], _ = e.getShallow(y);
    _ != null && (t[y] = _);
  }
  if (t.verticalAlign == null) {
    var S = e.getShallow("baseline");
    S != null && (t.verticalAlign = S);
  }
  if (!u || !a.disableBox) {
    for (var g = 0; g < up.length; g++) {
      var y = up[g], _ = e.getShallow(y);
      _ != null && (t[y] = _);
    }
    var b = e.getShallow("borderType");
    b != null && (t.borderDash = b), (t.backgroundColor === "auto" || t.backgroundColor === "inherit") && f && (process.env.NODE_ENV !== "production" && t.backgroundColor === "auto" && Ve("backgroundColor: 'auto'", "backgroundColor: 'inherit'"), t.backgroundColor = f), (t.borderColor === "auto" || t.borderColor === "inherit") && f && (process.env.NODE_ENV !== "production" && t.borderColor === "auto" && Ve("borderColor: 'auto'", "borderColor: 'inherit'"), t.borderColor = f);
  }
}
function pC(t, e) {
  var r = e && e.getModel("textStyle");
  return Yt([
    // FIXME in node-canvas fontWeight is before fontStyle
    t.fontStyle || r && r.getShallow("fontStyle") || "",
    t.fontWeight || r && r.getShallow("fontWeight") || "",
    (t.fontSize || r && r.getShallow("fontSize") || 12) + "px",
    t.fontFamily || r && r.getShallow("fontFamily") || "sans-serif"
  ].join(" "));
}
var E0 = ve(), vi = {
  minMargin: 1,
  textMargin: 2
}, gC = ["textStyle", "color"], Yl = ["fontStyle", "fontWeight", "fontSize", "fontFamily", "padding", "lineHeight", "rich", "width", "height", "overflow"], Xl = new Je(), mC = (
  /** @class */
  function() {
    function t() {
    }
    return t.prototype.getTextColor = function(e) {
      var r = this.ecModel;
      return this.getShallow("color") || (!e && r ? r.get(gC) : null);
    }, t.prototype.getFont = function() {
      return pC({
        fontStyle: this.getShallow("fontStyle"),
        fontWeight: this.getShallow("fontWeight"),
        fontSize: this.getShallow("fontSize"),
        fontFamily: this.getShallow("fontFamily")
      }, this.ecModel);
    }, t.prototype.getTextRect = function(e) {
      for (var r = {
        text: e,
        verticalAlign: this.getShallow("verticalAlign") || this.getShallow("baseline")
      }, n = 0; n < Yl.length; n++)
        r[Yl[n]] = this.getShallow(Yl[n]);
      return Xl.useStyle(r), Xl.update(), Xl.getBoundingRect();
    }, t;
  }()
), A0 = [
  ["lineWidth", "width"],
  ["stroke", "color"],
  ["opacity"],
  ["shadowBlur"],
  ["shadowOffsetX"],
  ["shadowOffsetY"],
  ["shadowColor"],
  ["lineDash", "type"],
  ["lineDashOffset", "dashOffset"],
  ["lineCap", "cap"],
  ["lineJoin", "join"],
  ["miterLimit"]
  // Option decal is in `DecalObject` but style.decal is in `PatternObject`.
  // So do not transfer decal directly.
], yC = Fa(A0), _C = (
  /** @class */
  function() {
    function t() {
    }
    return t.prototype.getLineStyle = function(e) {
      return yC(this, e);
    }, t;
  }()
), I0 = [
  ["fill", "color"],
  ["stroke", "borderColor"],
  ["lineWidth", "borderWidth"],
  ["opacity"],
  ["shadowBlur"],
  ["shadowOffsetX"],
  ["shadowOffsetY"],
  ["shadowColor"],
  ["lineDash", "borderType"],
  ["lineDashOffset", "borderDashOffset"],
  ["lineCap", "borderCap"],
  ["lineJoin", "borderJoin"],
  ["miterLimit", "borderMiterLimit"]
  // Option decal is in `DecalObject` but style.decal is in `PatternObject`.
  // So do not transfer decal directly.
], SC = Fa(I0), bC = (
  /** @class */
  function() {
    function t() {
    }
    return t.prototype.getItemStyle = function(e, r) {
      return SC(this, e, r);
    }, t;
  }()
), xe = (
  /** @class */
  function() {
    function t(e, r, n) {
      this.parentModel = r, this.ecModel = n, this.option = e;
    }
    return t.prototype.init = function(e, r, n) {
    }, t.prototype.mergeOption = function(e, r) {
      Se(this.option, e, !0);
    }, t.prototype.get = function(e, r) {
      return e == null ? this.option : this._doGet(this.parsePath(e), !r && this.parentModel);
    }, t.prototype.getShallow = function(e, r) {
      var n = this.option, i = n == null ? n : n[e];
      if (i == null && !r) {
        var a = this.parentModel;
        a && (i = a.getShallow(e));
      }
      return i;
    }, t.prototype.getModel = function(e, r) {
      var n = e != null, i = n ? this.parsePath(e) : null, a = n ? this._doGet(i) : this.option;
      return r = r || this.parentModel && this.parentModel.getModel(this.resolveParentPath(i)), new t(a, r, this.ecModel);
    }, t.prototype.isEmpty = function() {
      return this.option == null;
    }, t.prototype.restoreData = function() {
    }, t.prototype.clone = function() {
      var e = this.constructor;
      return new e(ae(this.option));
    }, t.prototype.parsePath = function(e) {
      return typeof e == "string" ? e.split(".") : e;
    }, t.prototype.resolveParentPath = function(e) {
      return e;
    }, t.prototype.isAnimationEnabled = function() {
      if (!re.node && this.option) {
        if (this.option.animation != null)
          return !!this.option.animation;
        if (this.parentModel)
          return this.parentModel.isAnimationEnabled();
      }
    }, t.prototype._doGet = function(e, r) {
      var n = this.option;
      if (!e)
        return n;
      for (var i = 0; i < e.length && !(e[i] && (n = n && typeof n == "object" ? n[e[i]] : null, n == null)); i++)
        ;
      return n == null && r && (n = r._doGet(this.resolveParentPath(e), r.parentModel)), n;
    }, t;
  }()
);
pc(xe);
eT(xe);
ir(xe, _C);
ir(xe, bC);
ir(xe, aT);
ir(xe, mC);
var wC = Math.round(Math.random() * 10);
function Hu(t) {
  return [t || "", wC++].join("_");
}
function TC(t) {
  var e = {};
  t.registerSubTypeDefaulter = function(r, n) {
    var i = Xt(r);
    e[i.main] = n;
  }, t.determineSubType = function(r, n) {
    var i = n.type;
    if (!i) {
      var a = Xt(r).main;
      t.hasSubTypes(r) && e[a] && (i = e[a](n));
    }
    return i;
  };
}
function xC(t, e) {
  t.topologicalTravel = function(a, o, s, u) {
    if (!a.length)
      return;
    var l = r(o), f = l.graph, h = l.noEntryList, c = {};
    for (x(a, function(y) {
      c[y] = !0;
    }); h.length; ) {
      var v = h.pop(), d = f[v], p = !!c[v];
      p && (s.call(u, v, d.originalDeps.slice()), delete c[v]), x(d.successor, p ? g : m);
    }
    x(c, function() {
      var y = "";
      throw process.env.NODE_ENV !== "production" && (y = Fs("Circular dependency may exists: ", c, a, o)), new Error(y);
    });
    function m(y) {
      f[y].entryCount--, f[y].entryCount === 0 && h.push(y);
    }
    function g(y) {
      c[y] = !0, m(y);
    }
  };
  function r(a) {
    var o = {}, s = [];
    return x(a, function(u) {
      var l = n(o, u), f = l.originalDeps = e(u), h = i(f, a);
      l.entryCount = h.length, l.entryCount === 0 && s.push(u), x(h, function(c) {
        fe(l.predecessor, c) < 0 && l.predecessor.push(c);
        var v = n(o, c);
        fe(v.successor, c) < 0 && v.successor.push(u);
      });
    }), {
      graph: o,
      noEntryList: s
    };
  }
  function n(a, o) {
    return a[o] || (a[o] = {
      predecessor: [],
      successor: []
    }), a[o];
  }
  function i(a, o) {
    var s = [];
    return x(a, function(u) {
      fe(o, u) >= 0 && s.push(u);
    }), s;
  }
}
function Rc(t, e) {
  return Se(Se({}, t, !0), e, !0);
}
const CC = {
  time: {
    month: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    monthAbbr: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    dayOfWeekAbbr: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  },
  legend: {
    selector: {
      all: "All",
      inverse: "Inv"
    }
  },
  toolbox: {
    brush: {
      title: {
        rect: "Box Select",
        polygon: "Lasso Select",
        lineX: "Horizontally Select",
        lineY: "Vertically Select",
        keep: "Keep Selections",
        clear: "Clear Selections"
      }
    },
    dataView: {
      title: "Data View",
      lang: ["Data View", "Close", "Refresh"]
    },
    dataZoom: {
      title: {
        zoom: "Zoom",
        back: "Zoom Reset"
      }
    },
    magicType: {
      title: {
        line: "Switch to Line Chart",
        bar: "Switch to Bar Chart",
        stack: "Stack",
        tiled: "Tile"
      }
    },
    restore: {
      title: "Restore"
    },
    saveAsImage: {
      title: "Save as Image",
      lang: ["Right Click to Save Image"]
    }
  },
  series: {
    typeNames: {
      pie: "Pie chart",
      bar: "Bar chart",
      line: "Line chart",
      scatter: "Scatter plot",
      effectScatter: "Ripple scatter plot",
      radar: "Radar chart",
      tree: "Tree",
      treemap: "Treemap",
      boxplot: "Boxplot",
      candlestick: "Candlestick",
      k: "K line chart",
      heatmap: "Heat map",
      map: "Map",
      parallel: "Parallel coordinate map",
      lines: "Line graph",
      graph: "Relationship graph",
      sankey: "Sankey diagram",
      funnel: "Funnel chart",
      gauge: "Gauge",
      pictorialBar: "Pictorial bar",
      themeRiver: "Theme River Map",
      sunburst: "Sunburst",
      custom: "Custom chart",
      chart: "Chart"
    }
  },
  aria: {
    general: {
      withTitle: 'This is a chart about "{title}"',
      withoutTitle: "This is a chart"
    },
    series: {
      single: {
        prefix: "",
        withName: " with type {seriesType} named {seriesName}.",
        withoutName: " with type {seriesType}."
      },
      multiple: {
        prefix: ". It consists of {seriesCount} series count.",
        withName: " The {seriesId} series is a {seriesType} representing {seriesName}.",
        withoutName: " The {seriesId} series is a {seriesType}.",
        separator: {
          middle: "",
          end: ""
        }
      }
    },
    data: {
      allData: "The data is as follows: ",
      partialData: "The first {displayCnt} items are: ",
      withName: "the data for {name} is {value}",
      withoutName: "{value}",
      separator: {
        middle: ", ",
        end: ". "
      }
    }
  }
}, DC = {
  time: {
    month: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
    monthAbbr: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
    dayOfWeek: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
    dayOfWeekAbbr: ["日", "一", "二", "三", "四", "五", "六"]
  },
  legend: {
    selector: {
      all: "全选",
      inverse: "反选"
    }
  },
  toolbox: {
    brush: {
      title: {
        rect: "矩形选择",
        polygon: "圈选",
        lineX: "横向选择",
        lineY: "纵向选择",
        keep: "保持选择",
        clear: "清除选择"
      }
    },
    dataView: {
      title: "数据视图",
      lang: ["数据视图", "关闭", "刷新"]
    },
    dataZoom: {
      title: {
        zoom: "区域缩放",
        back: "区域缩放还原"
      }
    },
    magicType: {
      title: {
        line: "切换为折线图",
        bar: "切换为柱状图",
        stack: "切换为堆叠",
        tiled: "切换为平铺"
      }
    },
    restore: {
      title: "还原"
    },
    saveAsImage: {
      title: "保存为图片",
      lang: ["右键另存为图片"]
    }
  },
  series: {
    typeNames: {
      pie: "饼图",
      bar: "柱状图",
      line: "折线图",
      scatter: "散点图",
      effectScatter: "涟漪散点图",
      radar: "雷达图",
      tree: "树图",
      treemap: "矩形树图",
      boxplot: "箱型图",
      candlestick: "K线图",
      k: "K线图",
      heatmap: "热力图",
      map: "地图",
      parallel: "平行坐标图",
      lines: "线图",
      graph: "关系图",
      sankey: "桑基图",
      funnel: "漏斗图",
      gauge: "仪表盘图",
      pictorialBar: "象形柱图",
      themeRiver: "主题河流图",
      sunburst: "旭日图",
      custom: "自定义图表",
      chart: "图表"
    }
  },
  aria: {
    general: {
      withTitle: "这是一个关于“{title}”的图表。",
      withoutTitle: "这是一个图表，"
    },
    series: {
      single: {
        prefix: "",
        withName: "图表类型是{seriesType}，表示{seriesName}。",
        withoutName: "图表类型是{seriesType}。"
      },
      multiple: {
        prefix: "它由{seriesCount}个图表系列组成。",
        withName: "第{seriesId}个系列是一个表示{seriesName}的{seriesType}，",
        withoutName: "第{seriesId}个系列是一个{seriesType}，",
        separator: {
          middle: "；",
          end: "。"
        }
      }
    },
    data: {
      allData: "其数据是——",
      partialData: "其中，前{displayCnt}项是——",
      withName: "{name}的数据是{value}",
      withoutName: "{value}",
      separator: {
        middle: "，",
        end: ""
      }
    }
  }
};
var $s = "ZH", kc = "EN", mi = kc, ms = {}, Bc = {}, O0 = re.domSupported ? function() {
  var t = (document.documentElement.lang || navigator.language || navigator.browserLanguage || mi).toUpperCase();
  return t.indexOf($s) > -1 ? $s : mi;
}() : mi;
function L0(t, e) {
  t = t.toUpperCase(), Bc[t] = new xe(e), ms[t] = e;
}
function MC(t) {
  if (z(t)) {
    var e = ms[t.toUpperCase()] || {};
    return t === $s || t === kc ? ae(e) : Se(ae(e), ae(ms[mi]), !1);
  } else
    return Se(ae(t), ae(ms[mi]), !1);
}
function EC(t) {
  return Bc[t];
}
function AC() {
  return Bc[mi];
}
L0(kc, CC);
L0($s, DC);
var IC = null;
function Gu() {
  return IC;
}
function P0(t, e) {
  e.breakOption;
  var r = e.breakParsed;
  return r;
}
function Vc(t) {
  var e = t.brk;
  return e ? e.breaks : [];
}
function Rn(t) {
  var e = t.brk;
  return e ? e.hasBreaks() : !1;
}
var Fc = 1e3, zc = Fc * 60, Ia = zc * 60, Tt = Ia * 24, fp = Tt * 365, OC = {
  year: /({yyyy}|{yy})/,
  month: /({MMMM}|{MMM}|{MM}|{M})/,
  day: /({dd}|{d})/,
  hour: /({HH}|{H}|{hh}|{h})/,
  minute: /({mm}|{m})/,
  second: /({ss}|{s})/,
  millisecond: /({SSS}|{S})/
}, ys = {
  year: "{yyyy}",
  month: "{MMM}",
  day: "{d}",
  hour: "{HH}:{mm}",
  minute: "{HH}:{mm}",
  second: "{HH}:{mm}:{ss}",
  millisecond: "{HH}:{mm}:{ss} {SSS}"
}, LC = "{yyyy}-{MM}-{dd} {HH}:{mm}:{ss} {SSS}", Uo = "{yyyy}-{MM}-{dd}", hp = {
  year: "{yyyy}",
  month: "{yyyy}-{MM}",
  day: Uo,
  hour: Uo + " " + ys.hour,
  minute: Uo + " " + ys.minute,
  second: Uo + " " + ys.second,
  millisecond: LC
}, On = ["year", "month", "day", "hour", "minute", "second", "millisecond"], PC = ["year", "half-year", "quarter", "month", "week", "half-week", "day", "half-day", "quarter-day", "hour", "minute", "second", "millisecond"];
function NC(t) {
  return !z(t) && !Q(t) ? RC(t) : t;
}
function RC(t) {
  t = t || {};
  var e = {}, r = !0;
  return x(On, function(n) {
    r && (r = t[n] == null);
  }), x(On, function(n, i) {
    var a = t[n];
    e[n] = {};
    for (var o = null, s = i; s >= 0; s--) {
      var u = On[s], l = q(a) && !H(a) ? a[u] : a, f = void 0;
      H(l) ? (f = l.slice(), o = f[0] || "") : z(l) ? (o = l, f = [o]) : (o == null ? o = ys[n] : OC[u].test(o) || (o = e[u][u][0] + " " + o), f = [o], r && (f[1] = "{primary|" + o + "}")), e[n][u] = f;
    }
  }), e;
}
function wr(t, e) {
  return t += "", "0000".substr(0, e - t.length) + t;
}
function Oa(t) {
  switch (t) {
    case "half-year":
    case "quarter":
      return "month";
    case "week":
    case "half-week":
      return "day";
    case "half-day":
    case "quarter-day":
      return "hour";
    default:
      return t;
  }
}
function kC(t) {
  return t === Oa(t);
}
function BC(t) {
  switch (t) {
    case "year":
    case "month":
      return "day";
    case "millisecond":
      return "millisecond";
    default:
      return "second";
  }
}
function Uu(t, e, r, n) {
  var i = zi(t), a = i[N0(r)](), o = i[Hc(r)]() + 1, s = Math.floor((o - 1) / 3) + 1, u = i[Gc(r)](), l = i["get" + (r ? "UTC" : "") + "Day"](), f = i[Uc(r)](), h = (f - 1) % 12 + 1, c = i[Wc(r)](), v = i[Yc(r)](), d = i[Xc(r)](), p = f >= 12 ? "pm" : "am", m = p.toUpperCase(), g = n instanceof xe ? n : EC(n || O0) || AC(), y = g.getModel("time"), _ = y.get("month"), S = y.get("monthAbbr"), b = y.get("dayOfWeek"), w = y.get("dayOfWeekAbbr");
  return (e || "").replace(/{a}/g, p + "").replace(/{A}/g, m + "").replace(/{yyyy}/g, a + "").replace(/{yy}/g, wr(a % 100 + "", 2)).replace(/{Q}/g, s + "").replace(/{MMMM}/g, _[o - 1]).replace(/{MMM}/g, S[o - 1]).replace(/{MM}/g, wr(o, 2)).replace(/{M}/g, o + "").replace(/{dd}/g, wr(u, 2)).replace(/{d}/g, u + "").replace(/{eeee}/g, b[l]).replace(/{ee}/g, w[l]).replace(/{e}/g, l + "").replace(/{HH}/g, wr(f, 2)).replace(/{H}/g, f + "").replace(/{hh}/g, wr(h + "", 2)).replace(/{h}/g, h + "").replace(/{mm}/g, wr(c, 2)).replace(/{m}/g, c + "").replace(/{ss}/g, wr(v, 2)).replace(/{s}/g, v + "").replace(/{SSS}/g, wr(d, 3)).replace(/{S}/g, d + "");
}
function VC(t, e, r, n, i) {
  var a = null;
  if (z(r))
    a = r;
  else if (Q(r)) {
    var o = {
      time: t.time,
      level: t.time ? t.time.level : 0
    }, s = Gu();
    s && s.makeAxisLabelFormatterParamBreak(o, t.break), a = r(t.value, e, o);
  } else {
    var u = t.time;
    if (u) {
      var l = r[u.lowerTimeUnit][u.upperTimeUnit];
      a = l[Math.min(u.level, l.length - 1)] || "";
    } else {
      var f = _s(t.value, i);
      a = r[f][f][0];
    }
  }
  return Uu(new Date(t.value), a, i, n);
}
function _s(t, e) {
  var r = zi(t), n = r[Hc(e)]() + 1, i = r[Gc(e)](), a = r[Uc(e)](), o = r[Wc(e)](), s = r[Yc(e)](), u = r[Xc(e)](), l = u === 0, f = l && s === 0, h = f && o === 0, c = h && a === 0, v = c && i === 1, d = v && n === 1;
  return d ? "year" : v ? "month" : c ? "day" : h ? "hour" : f ? "minute" : l ? "second" : "millisecond";
}
function yh(t, e, r) {
  switch (e) {
    case "year":
      t[R0(r)](0);
    case "month":
      t[k0(r)](1);
    case "day":
      t[B0(r)](0);
    case "hour":
      t[V0(r)](0);
    case "minute":
      t[F0(r)](0);
    case "second":
      t[z0(r)](0);
  }
  return t;
}
function N0(t) {
  return t ? "getUTCFullYear" : "getFullYear";
}
function Hc(t) {
  return t ? "getUTCMonth" : "getMonth";
}
function Gc(t) {
  return t ? "getUTCDate" : "getDate";
}
function Uc(t) {
  return t ? "getUTCHours" : "getHours";
}
function Wc(t) {
  return t ? "getUTCMinutes" : "getMinutes";
}
function Yc(t) {
  return t ? "getUTCSeconds" : "getSeconds";
}
function Xc(t) {
  return t ? "getUTCMilliseconds" : "getMilliseconds";
}
function FC(t) {
  return t ? "setUTCFullYear" : "setFullYear";
}
function R0(t) {
  return t ? "setUTCMonth" : "setMonth";
}
function k0(t) {
  return t ? "setUTCDate" : "setDate";
}
function B0(t) {
  return t ? "setUTCHours" : "setHours";
}
function V0(t) {
  return t ? "setUTCMinutes" : "setMinutes";
}
function F0(t) {
  return t ? "setUTCSeconds" : "setSeconds";
}
function z0(t) {
  return t ? "setUTCMilliseconds" : "setMilliseconds";
}
function H0(t) {
  if (!Ay(t))
    return z(t) ? t : "-";
  var e = (t + "").split(".");
  return e[0].replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, "$1,") + (e.length > 1 ? "." + e[1] : "");
}
function G0(t, e) {
  return t = (t || "").toLowerCase().replace(/-(.)/g, function(r, n) {
    return n.toUpperCase();
  }), e && t && (t = t.charAt(0).toUpperCase() + t.slice(1)), t;
}
var Wu = tc;
function _h(t, e, r) {
  var n = "{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}";
  function i(f) {
    return f && Yt(f) ? f : "-";
  }
  function a(f) {
    return er(f);
  }
  var o = e === "time", s = t instanceof Date;
  if (o || s) {
    var u = o ? zi(t) : t;
    if (isNaN(+u)) {
      if (s)
        return "-";
    } else return Uu(u, n, r);
  }
  if (e === "ordinal")
    return As(t) ? i(t) : Te(t) && a(t) ? t + "" : "-";
  var l = Vs(t);
  return a(l) ? H0(l) : As(t) ? i(t) : typeof t == "boolean" ? t + "" : "-";
}
var cp = ["a", "b", "c", "d", "e", "f", "g"], Zl = function(t, e) {
  return "{" + t + (e ?? "") + "}";
};
function U0(t, e, r) {
  H(e) || (e = [e]);
  var n = e.length;
  if (!n)
    return "";
  for (var i = e[0].$vars || [], a = 0; a < i.length; a++) {
    var o = cp[a];
    t = t.replace(Zl(o), Zl(o, 0));
  }
  for (var s = 0; s < n; s++)
    for (var u = 0; u < i.length; u++) {
      var l = e[s][i[u]];
      t = t.replace(Zl(cp[u], s), r ? $e(l) : l);
    }
  return t;
}
function zC(t, e) {
  var r = z(t) ? {
    color: t,
    extraCssText: e
  } : t || {}, n = r.color, i = r.type;
  e = r.extraCssText;
  var a = r.renderMode || "html";
  if (!n)
    return "";
  if (a === "html")
    return i === "subItem" ? '<span style="display:inline-block;vertical-align:middle;margin-right:8px;margin-left:3px;border-radius:4px;width:4px;height:4px;background-color:' + $e(n) + ";" + (e || "") + '"></span>' : '<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:' + $e(n) + ";" + (e || "") + '"></span>';
  var o = r.markerId || "markerX";
  return {
    renderMode: a,
    content: "{" + o + "|}  ",
    style: i === "subItem" ? {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: n
    } : {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: n
    }
  };
}
function kn(t, e) {
  return e = e || "transparent", z(t) ? t : q(t) && t.colorStops && (t.colorStops[0] || {}).color || e;
}
var Ss = {}, $l = {}, Zc = (
  /** @class */
  function() {
    function t() {
      this._normalMasterList = [], this._nonSeriesBoxMasterList = [];
    }
    return t.prototype.create = function(e, r) {
      this._nonSeriesBoxMasterList = n(Ss, !0), this._normalMasterList = n($l, !1);
      function n(i, a) {
        var o = [];
        return x(i, function(s, u) {
          var l = s.create(e, r);
          o = o.concat(l || []), process.env.NODE_ENV !== "production" && a && x(l, function(f) {
            return N(!f.update);
          });
        }), o;
      }
    }, t.prototype.update = function(e, r) {
      x(this._normalMasterList, function(n) {
        n.update && n.update(e, r);
      });
    }, t.prototype.getCoordinateSystems = function() {
      return this._normalMasterList.concat(this._nonSeriesBoxMasterList);
    }, t.register = function(e, r) {
      if (e === "matrix" || e === "calendar") {
        Ss[e] = r;
        return;
      }
      $l[e] = r;
    }, t.get = function(e) {
      return $l[e] || Ss[e];
    }, t;
  }()
);
function HC(t) {
  return !!Ss[t];
}
var GC = 1, UC = 2, WC = Z();
function W0(t) {
  var e = t.getShallow("coord", !0), r = GC;
  if (e == null) {
    var n = WC.get(t.type);
    n && n.getCoord2 && (r = UC, e = n.getCoord2(t));
  }
  return {
    coord: e,
    from: r
  };
}
var yi = 0, bs = 1, YC = 2;
function XC(t, e) {
  var r = t.getShallow("coordinateSystem"), n = t.getShallow("coordinateSystemUsage", !0), i = n != null, a = yi;
  if (r) {
    var o = t.mainType === "series";
    n == null && (n = o ? "data" : "box"), n === "data" ? (a = bs, o || (process.env.NODE_ENV !== "production" && i && e && he('coordinateSystemUsage "data" is not supported in non-series components.'), a = yi)) : n === "box" && (a = YC, !o && !HC(r) && (process.env.NODE_ENV !== "production" && i && e && he('coordinateSystem "' + r + '" cannot be used' + (' as coordinateSystemUsage "box" for "' + t.type + '" yet.')), a = yi));
  }
  return {
    coordSysType: r,
    kind: a
  };
}
function ZC(t) {
  var e = t.targetModel, r = t.coordSysType, n = t.coordSysProvider, i = t.isDefaultDataCoordSys, a = t.allowNotFound;
  process.env.NODE_ENV !== "production" && N(!!r);
  var o = XC(e, !0), s = o.kind, u = o.coordSysType;
  if (i && s !== bs && (s = bs, u = r), s === yi || u !== r)
    return yi;
  var l = n(r, e);
  return l ? (s === bs ? (process.env.NODE_ENV !== "production" && N(e.mainType === "series"), e.coordinateSystem = l) : e.boxCoordinateSystem = l, s) : (process.env.NODE_ENV !== "production" && (a || he(r + " cannot be found for" + (" " + e.type + " (index: " + e.componentIndex + ")."))), yi);
}
var ws = x, $C = ["left", "right", "top", "bottom", "width", "height"], Wo = [["width", "left", "right"], ["height", "top", "bottom"]];
function $c(t, e, r, n, i) {
  var a = 0, o = 0;
  n == null && (n = 1 / 0), i == null && (i = 1 / 0);
  var s = 0;
  e.eachChild(function(u, l) {
    var f = u.getBoundingRect(), h = e.childAt(l + 1), c = h && h.getBoundingRect(), v, d;
    if (t === "horizontal") {
      var p = f.width + (c ? -c.x + f.x : 0);
      v = a + p, v > n || u.newline ? (a = 0, v = p, o += s + r, s = f.height) : s = Math.max(s, f.height);
    } else {
      var m = f.height + (c ? -c.y + f.y : 0);
      d = o + m, d > i || u.newline ? (a += s + r, o = 0, d = m, s = f.width) : s = Math.max(s, f.width);
    }
    u.newline || (u.x = a, u.y = o, u.markRedraw(), t === "horizontal" ? a = v + r : o = d + r);
  });
}
var La = $c;
Ae($c, "vertical");
Ae($c, "horizontal");
function qC(t, e) {
  return {
    left: t.getShallow("left", e),
    top: t.getShallow("top", e),
    right: t.getShallow("right", e),
    bottom: t.getShallow("bottom", e),
    width: t.getShallow("width", e),
    height: t.getShallow("height", e)
  };
}
function Ii(t, e, r) {
  r = Wu(r || 0);
  var n = e.width, i = e.height, a = _t(t.left, n), o = _t(t.top, i), s = _t(t.right, n), u = _t(t.bottom, i), l = _t(t.width, n), f = _t(t.height, i), h = r[2] + r[0], c = r[1] + r[3], v = t.aspect;
  switch (isNaN(l) && (l = n - s - c - a), isNaN(f) && (f = i - u - h - o), v != null && (isNaN(l) && isNaN(f) && (v > n / i ? l = n * 0.8 : f = i * 0.8), isNaN(l) && (l = v * f), isNaN(f) && (f = l / v)), isNaN(a) && (a = n - s - l - c), isNaN(o) && (o = i - u - f - h), t.left || t.right) {
    case "center":
      a = n / 2 - l / 2 - r[3];
      break;
    case "right":
      a = n - l - c;
      break;
  }
  switch (t.top || t.bottom) {
    case "middle":
    case "center":
      o = i / 2 - f / 2 - r[0];
      break;
    case "bottom":
      o = i - f - h;
      break;
  }
  a = a || 0, o = o || 0, isNaN(l) && (l = n - c - a - (s || 0)), isNaN(f) && (f = i - h - o - (u || 0));
  var d = new ie((e.x || 0) + a + r[3], (e.y || 0) + o + r[0], l, f);
  return d.margin = r, d;
}
var ql = {
  rect: 1
};
function qc(t, e, r) {
  var n, i, a, o = t.boxCoordinateSystem, s;
  if (o) {
    var u = W0(t), l = u.coord, f = u.from;
    if (o.dataToLayout) {
      a = ql.rect, s = f;
      var h = o.dataToLayout(l);
      n = h.contentRect || h.rect;
    } else
      process.env.NODE_ENV !== "production" && he(t.type + "[" + t.componentIndex + "]" + (" layout based on " + o.type + " is not supported."));
  }
  return a == null && (a = ql.rect), a === ql.rect && (n || (n = {
    x: 0,
    y: 0,
    width: e.getWidth(),
    height: e.getHeight()
  }), i = [n.x + n.width / 2, n.y + n.height / 2]), {
    type: a,
    refContainer: n,
    refPoint: i,
    boxCoordFrom: s
  };
}
function Xa(t) {
  var e = t.layoutMode || t.constructor.layoutMode;
  return q(e) ? e : e ? {
    type: e
  } : null;
}
function Ur(t, e, r) {
  var n = r && r.ignoreSize;
  !H(n) && (n = [n, n]);
  var i = o(Wo[0], 0), a = o(Wo[1], 1);
  u(Wo[0], t, i), u(Wo[1], t, a);
  function o(l, f) {
    var h = {}, c = 0, v = {}, d = 0, p = 2;
    if (ws(l, function(y) {
      v[y] = t[y];
    }), ws(l, function(y) {
      at(e, y) && (h[y] = v[y] = e[y]), s(h, y) && c++, s(v, y) && d++;
    }), n[f])
      return s(e, l[1]) ? v[l[2]] = null : s(e, l[2]) && (v[l[1]] = null), v;
    if (d === p || !c)
      return v;
    if (c >= p)
      return h;
    for (var m = 0; m < l.length; m++) {
      var g = l[m];
      if (!at(h, g) && at(t, g)) {
        h[g] = t[g];
        break;
      }
    }
    return h;
  }
  function s(l, f) {
    return l[f] != null && l[f] !== "auto";
  }
  function u(l, f, h) {
    ws(l, function(c) {
      f[c] = h[c];
    });
  }
}
function Hi(t) {
  return KC({}, t);
}
function KC(t, e) {
  return e && t && ws($C, function(r) {
    at(e, r) && (t[r] = e[r]);
  }), t;
}
var QC = ve(), ce = (
  /** @class */
  function(t) {
    V(e, t);
    function e(r, n, i) {
      var a = t.call(this, r, n, i) || this;
      return a.uid = Hu("ec_cpt_model"), a;
    }
    return e.prototype.init = function(r, n, i) {
      this.mergeDefaultAndTheme(r, i);
    }, e.prototype.mergeDefaultAndTheme = function(r, n) {
      var i = Xa(this), a = i ? Hi(r) : {}, o = n.getTheme();
      Se(r, o.get(this.mainType)), Se(r, this.getDefaultOption()), i && Ur(r, a, i);
    }, e.prototype.mergeOption = function(r, n) {
      Se(this.option, r, !0);
      var i = Xa(this);
      i && Ur(this.option, r, i);
    }, e.prototype.optionUpdated = function(r, n) {
    }, e.prototype.getDefaultOption = function() {
      var r = this.constructor;
      if (!Qw(r))
        return r.defaultOption;
      var n = QC(this);
      if (!n.defaultOption) {
        for (var i = [], a = r; a; ) {
          var o = a.prototype.defaultOption;
          o && i.push(o), a = a.superClass;
        }
        for (var s = {}, u = i.length - 1; u >= 0; u--)
          s = Se(s, i[u], !0);
        n.defaultOption = s;
      }
      return n.defaultOption;
    }, e.prototype.getReferringComponents = function(r, n) {
      var i = r + "Index", a = r + "Id";
      return fo(this.ecModel, r, {
        index: this.get(i, !0),
        id: this.get(a, !0)
      }, n);
    }, e.prototype.getBoxLayoutParams = function() {
      return qC(this, !1);
    }, e.prototype.getZLevelKey = function() {
      return "";
    }, e.prototype.setZLevel = function(r) {
      this.option.zlevel = r;
    }, e.protoInitialize = function() {
      var r = e.prototype;
      r.type = "component", r.id = "", r.name = "", r.mainType = "", r.subType = "", r.componentIndex = 0;
    }(), e;
  }(xe)
);
Fy(ce, xe);
Eu(ce);
TC(ce);
xC(ce, jC);
function jC(t) {
  var e = [];
  return x(ce.getClassesByMainType(t), function(r) {
    e = e.concat(r.dependencies || r.prototype.dependencies || []);
  }), e = X(e, function(r) {
    return Xt(r).main;
  }), t !== "dataset" && fe(e, "dataset") <= 0 && e.unshift("dataset"), e;
}
var G = {
  color: {},
  darkColor: {},
  size: {}
}, Me = G.color = {
  theme: ["#5070dd", "#b6d634", "#505372", "#ff994d", "#0ca8df", "#ffd10a", "#fb628b", "#785db0", "#3fbe95"],
  neutral00: "#fff",
  neutral05: "#f4f7fd",
  neutral10: "#e8ebf0",
  neutral15: "#dbdee4",
  neutral20: "#cfd2d7",
  neutral25: "#c3c5cb",
  neutral30: "#b7b9be",
  neutral35: "#aaacb2",
  neutral40: "#9ea0a5",
  neutral45: "#929399",
  neutral50: "#86878c",
  neutral55: "#797b7f",
  neutral60: "#6d6e73",
  neutral65: "#616266",
  neutral70: "#54555a",
  neutral75: "#48494d",
  neutral80: "#3c3c41",
  neutral85: "#303034",
  neutral90: "#232328",
  neutral95: "#17171b",
  neutral99: "#000",
  accent05: "#eff1f9",
  accent10: "#e0e4f2",
  accent15: "#d0d6ec",
  accent20: "#c0c9e6",
  accent25: "#b1bbdf",
  accent30: "#a1aed9",
  accent35: "#91a0d3",
  accent40: "#8292cc",
  accent45: "#7285c6",
  accent50: "#6578ba",
  accent55: "#5c6da9",
  accent60: "#536298",
  accent65: "#4a5787",
  accent70: "#404c76",
  accent75: "#374165",
  accent80: "#2e3654",
  accent85: "#252b43",
  accent90: "#1b2032",
  accent95: "#121521",
  transparent: "rgba(0,0,0,0)",
  highlight: "rgba(255,231,130,0.8)"
};
R(Me, {
  primary: Me.neutral80,
  secondary: Me.neutral70,
  tertiary: Me.neutral60,
  quaternary: Me.neutral50,
  disabled: Me.neutral20,
  border: Me.neutral30,
  borderTint: Me.neutral20,
  borderShade: Me.neutral40,
  background: Me.neutral05,
  backgroundTint: "rgba(234,237,245,0.5)",
  backgroundTransparent: "rgba(255,255,255,0)",
  backgroundShade: Me.neutral10,
  shadow: "rgba(0,0,0,0.2)",
  shadowTint: "rgba(129,130,136,0.2)",
  axisLine: Me.neutral70,
  axisLineTint: Me.neutral40,
  axisTick: Me.neutral70,
  axisTickMinor: Me.neutral60,
  axisLabel: Me.neutral70,
  axisSplitLine: Me.neutral15,
  axisMinorSplitLine: Me.neutral05
});
for (var cn in Me)
  if (Me.hasOwnProperty(cn)) {
    var vp = Me[cn];
    cn === "theme" ? G.darkColor.theme = Me.theme.slice() : cn === "highlight" ? G.darkColor.highlight = "rgba(255,231,130,0.4)" : cn.indexOf("accent") === 0 ? G.darkColor[cn] = Wf(vp, null, function(t) {
      return t * 0.5;
    }, function(t) {
      return Math.min(1, 1.3 - t);
    }) : G.darkColor[cn] = Wf(vp, null, function(t) {
      return t * 0.9;
    }, function(t) {
      return 1 - Math.pow(t, 1.5);
    });
  }
G.size = {
  xxs: 2,
  xs: 5,
  s: 10,
  m: 15,
  l: 20,
  xl: 30,
  xxl: 40,
  xxxl: 50
};
var Y0 = "";
typeof navigator < "u" && (Y0 = navigator.platform || "");
var qn = "rgba(0, 0, 0, 0.2)", X0 = G.color.theme[0], JC = Wf(X0, null, null, 0.9);
const Z0 = {
  darkMode: "auto",
  // backgroundColor: 'rgba(0,0,0,0)',
  colorBy: "series",
  color: G.color.theme,
  gradientColor: [JC, X0],
  aria: {
    decal: {
      decals: [{
        color: qn,
        dashArrayX: [1, 0],
        dashArrayY: [2, 5],
        symbolSize: 1,
        rotation: Math.PI / 6
      }, {
        color: qn,
        symbol: "circle",
        dashArrayX: [[8, 8], [0, 8, 8, 0]],
        dashArrayY: [6, 0],
        symbolSize: 0.8
      }, {
        color: qn,
        dashArrayX: [1, 0],
        dashArrayY: [4, 3],
        rotation: -Math.PI / 4
      }, {
        color: qn,
        dashArrayX: [[6, 6], [0, 6, 6, 0]],
        dashArrayY: [6, 0]
      }, {
        color: qn,
        dashArrayX: [[1, 0], [1, 6]],
        dashArrayY: [1, 0, 6, 0],
        rotation: Math.PI / 4
      }, {
        color: qn,
        symbol: "triangle",
        dashArrayX: [[9, 9], [0, 9, 9, 0]],
        dashArrayY: [7, 2],
        symbolSize: 0.75
      }]
    }
  },
  // If xAxis and yAxis declared, grid is created by default.
  // grid: {},
  textStyle: {
    // color: '#000',
    // decoration: 'none',
    // PENDING
    fontFamily: Y0.match(/^Win/) ? "Microsoft YaHei" : "sans-serif",
    // fontFamily: 'Arial, Verdana, sans-serif',
    fontSize: 12,
    fontStyle: "normal",
    fontWeight: "normal"
  },
  // http://blogs.adobe.com/webplatform/2014/02/24/using-blend-modes-in-html-canvas/
  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
  // Default is source-over
  blendMode: null,
  stateAnimation: {
    duration: 300,
    easing: "cubicOut"
  },
  animation: "auto",
  animationDuration: 1e3,
  animationDurationUpdate: 500,
  animationEasing: "cubicInOut",
  animationEasingUpdate: "cubicInOut",
  animationThreshold: 2e3,
  // Configuration for progressive/incremental rendering
  progressiveThreshold: 3e3,
  progressive: 400,
  // Threshold of if use single hover layer to optimize.
  // It is recommended that `hoverLayerThreshold` is equivalent to or less than
  // `progressiveThreshold`, otherwise hover will cause restart of progressive,
  // which is unexpected.
  // see example <echarts/test/heatmap-large.html>.
  hoverLayerThreshold: 3e3,
  // See: module:echarts/scale/Time
  useUTC: !1
};
var ut = {
  Must: 1,
  Might: 2,
  Not: 3
  // Other cases
}, $0 = ve();
function eD(t) {
  $0(t).datasetMap = Z();
}
function tD(t, e, r) {
  var n = {}, i = q0(e);
  if (!i || !t)
    return n;
  var a = [], o = [], s = e.ecModel, u = $0(s).datasetMap, l = i.uid + "_" + r.seriesLayoutBy, f, h;
  t = t.slice(), x(t, function(p, m) {
    var g = q(p) ? p : t[m] = {
      name: p
    };
    g.type === "ordinal" && f == null && (f = m, h = d(g)), n[g.name] = [];
  });
  var c = u.get(l) || u.set(l, {
    categoryWayDim: h,
    valueWayDim: 0
  });
  x(t, function(p, m) {
    var g = p.name, y = d(p);
    if (f == null) {
      var _ = c.valueWayDim;
      v(n[g], _, y), v(o, _, y), c.valueWayDim += y;
    } else if (f === m)
      v(n[g], 0, y), v(a, 0, y);
    else {
      var _ = c.categoryWayDim;
      v(n[g], _, y), v(o, _, y), c.categoryWayDim += y;
    }
  });
  function v(p, m, g) {
    for (var y = 0; y < g; y++)
      p.push(m + y);
  }
  function d(p) {
    var m = p.dimsDef;
    return m ? m.length : 1;
  }
  return a.length && (n.itemName = a), o.length && (n.seriesName = o), n;
}
function q0(t) {
  var e = t.get("data", !0);
  if (!e)
    return fo(t.ecModel, "dataset", {
      index: t.get("datasetIndex", !0),
      id: t.get("datasetId", !0)
    }, qe).models[0];
}
function rD(t) {
  return !t.get("transform", !0) && !t.get("fromTransformResult", !0) ? [] : fo(t.ecModel, "dataset", {
    index: t.get("fromDatasetIndex", !0),
    id: t.get("fromDatasetId", !0)
  }, qe).models;
}
function K0(t, e) {
  return nD(t.data, t.sourceFormat, t.seriesLayoutBy, t.dimensionsDefine, t.startIndex, e);
}
function nD(t, e, r, n, i, a) {
  var o, s = 5;
  if (je(t))
    return ut.Not;
  var u, l;
  if (n) {
    var f = n[a];
    q(f) ? (u = f.name, l = f.type) : z(f) && (u = f);
  }
  if (l != null)
    return l === "ordinal" ? ut.Must : ut.Not;
  if (e === Xe) {
    var h = t;
    if (r === Vn) {
      for (var c = h[a], v = 0; v < (c || []).length && v < s; v++)
        if ((o = S(c[i + v])) != null)
          return o;
    } else
      for (var v = 0; v < h.length && v < s; v++) {
        var d = h[i + v];
        if (d && (o = S(d[a])) != null)
          return o;
      }
  } else if (e === Rt) {
    var p = t;
    if (!u)
      return ut.Not;
    for (var v = 0; v < p.length && v < s; v++) {
      var m = p[v];
      if (m && (o = S(m[u])) != null)
        return o;
    }
  } else if (e === sr) {
    var g = t;
    if (!u)
      return ut.Not;
    var c = g[u];
    if (!c || je(c))
      return ut.Not;
    for (var v = 0; v < c.length && v < s; v++)
      if ((o = S(c[v])) != null)
        return o;
  } else if (e === ft)
    for (var y = t, v = 0; v < y.length && v < s; v++) {
      var m = y[v], _ = lo(m);
      if (!H(_))
        return ut.Not;
      if ((o = S(_[a])) != null)
        return o;
    }
  function S(b) {
    var w = z(b);
    if (b != null && isFinite(Number(b)) && b !== "")
      return w ? ut.Might : ut.Not;
    if (w && b !== "-")
      return ut.Must;
  }
  return ut.Not;
}
var iD = Z();
function aD(t, e, r) {
  var n = iD.get(e);
  if (!n)
    return r;
  var i = n(t);
  if (!i)
    return r;
  if (process.env.NODE_ENV !== "production")
    for (var a = 0; a < i.length; a++)
      N(Mi(i[a]));
  return r.concat(i);
}
var dp = ve();
ve();
var Kc = (
  /** @class */
  function() {
    function t() {
    }
    return t.prototype.getColorFromPalette = function(e, r, n) {
      var i = Qe(this.get("color", !0)), a = this.get("colorLayer", !0);
      return sD(this, dp, i, a, e, r, n);
    }, t.prototype.clearColorPalette = function() {
      uD(this, dp);
    }, t;
  }()
);
function oD(t, e) {
  for (var r = t.length, n = 0; n < r; n++)
    if (t[n].length > e)
      return t[n];
  return t[r - 1];
}
function sD(t, e, r, n, i, a, o) {
  a = a || t;
  var s = e(a), u = s.paletteIdx || 0, l = s.paletteNameMap = s.paletteNameMap || {};
  if (l.hasOwnProperty(i))
    return l[i];
  var f = o == null || !n ? r : oD(n, o);
  if (f = f || r, !(!f || !f.length)) {
    var h = f[u];
    return i && (l[i] = h), s.paletteIdx = (u + 1) % f.length, h;
  }
}
function uD(t, e) {
  e(t).paletteIdx = 0, e(t).paletteNameMap = {};
}
var Yo, Ki, pp, Kl = "\0_ec_inner", gp = 1, lD = {
  grid: "GridComponent",
  polar: "PolarComponent",
  geo: "GeoComponent",
  singleAxis: "SingleAxisComponent",
  parallel: "ParallelComponent",
  calendar: "CalendarComponent",
  matrix: "MatrixComponent",
  graphic: "GraphicComponent",
  toolbox: "ToolboxComponent",
  tooltip: "TooltipComponent",
  axisPointer: "AxisPointerComponent",
  brush: "BrushComponent",
  title: "TitleComponent",
  timeline: "TimelineComponent",
  markPoint: "MarkPointComponent",
  markLine: "MarkLineComponent",
  markArea: "MarkAreaComponent",
  legend: "LegendComponent",
  dataZoom: "DataZoomComponent",
  visualMap: "VisualMapComponent",
  // aria: 'AriaComponent',
  // dataset: 'DatasetComponent',
  // Dependencies
  xAxis: "GridComponent",
  yAxis: "GridComponent",
  angleAxis: "PolarComponent",
  radiusAxis: "PolarComponent"
}, fD = {
  line: "LineChart",
  bar: "BarChart",
  pie: "PieChart",
  scatter: "ScatterChart",
  radar: "RadarChart",
  map: "MapChart",
  tree: "TreeChart",
  treemap: "TreemapChart",
  graph: "GraphChart",
  chord: "ChordChart",
  gauge: "GaugeChart",
  funnel: "FunnelChart",
  parallel: "ParallelChart",
  sankey: "SankeyChart",
  boxplot: "BoxplotChart",
  candlestick: "CandlestickChart",
  effectScatter: "EffectScatterChart",
  lines: "LinesChart",
  heatmap: "HeatmapChart",
  pictorialBar: "PictorialBarChart",
  themeRiver: "ThemeRiverChart",
  sunburst: "SunburstChart",
  custom: "CustomChart"
}, qs = {};
function hD(t) {
  x(t, function(e, r) {
    if (!ce.hasClass(r)) {
      var n = lD[r];
      n && !qs[n] && (he("Component " + r + ` is used but not imported.
import { ` + n + ` } from 'echarts/components';
echarts.use([` + n + "]);"), qs[n] = !0);
    }
  });
}
var Qc = (
  /** @class */
  function(t) {
    V(e, t);
    function e() {
      return t !== null && t.apply(this, arguments) || this;
    }
    return e.prototype.init = function(r, n, i, a, o, s) {
      a = a || {}, this.option = null, this._theme = new xe(a), this._locale = new xe(o), this._optionManager = s;
    }, e.prototype.setOption = function(r, n, i) {
      process.env.NODE_ENV !== "production" && (N(r != null, "option is null/undefined"), N(r[Kl] !== gp, "please use chart.getOption()"));
      var a = _p(n);
      this._optionManager.setOption(r, i, a), this._resetOption(null, a);
    }, e.prototype.resetOption = function(r, n) {
      return this._resetOption(r, _p(n));
    }, e.prototype._resetOption = function(r, n) {
      var i = !1, a = this._optionManager;
      if (!r || r === "recreate") {
        var o = a.mountOption(r === "recreate");
        process.env.NODE_ENV !== "production" && hD(o), !this.option || r === "recreate" ? pp(this, o) : (this.restoreData(), this._mergeOption(o, n)), i = !0;
      }
      if ((r === "timeline" || r === "media") && this.restoreData(), !r || r === "recreate" || r === "timeline") {
        var s = a.getTimelineOption(this);
        s && (i = !0, this._mergeOption(s, n));
      }
      if (!r || r === "recreate" || r === "media") {
        var u = a.getMediaOption(this);
        u.length && x(u, function(l) {
          i = !0, this._mergeOption(l, n);
        }, this);
      }
      return i;
    }, e.prototype.mergeOption = function(r) {
      this._mergeOption(r, null);
    }, e.prototype._mergeOption = function(r, n) {
      var i = this.option, a = this._componentsMap, o = this._componentsCount, s = [], u = Z(), l = n && n.replaceMergeMainTypeMap;
      eD(this), x(r, function(h, c) {
        h != null && (ce.hasClass(c) ? c && (s.push(c), u.set(c, !0)) : i[c] = i[c] == null ? ae(h) : Se(i[c], h, !0));
      }), l && l.each(function(h, c) {
        ce.hasClass(c) && !u.get(c) && (s.push(c), u.set(c, !0));
      }), ce.topologicalTravel(s, ce.getAllClassMainTypes(), f, this);
      function f(h) {
        var c = aD(this, h, Qe(r[h])), v = a.get(h), d = (
          // `!oldCmptList` means init. See the comment in `mappingToExists`
          v ? l && l.get(h) ? "replaceMerge" : "normalMerge" : "replaceAll"
        ), p = Ew(v, c, d);
        Rw(p, h, ce), i[h] = null, a.set(h, null), o.set(h, 0);
        var m = [], g = [], y = 0, _, S;
        x(p, function(b, w) {
          var T = b.existing, M = b.newOption;
          if (!M)
            T && (T.mergeOption({}, this), T.optionUpdated({}, !1));
          else {
            var D = h === "series", C = ce.getClass(
              h,
              b.keyInfo.subType,
              !D
              // Give a more detailed warn later if series don't exists
            );
            if (!C) {
              if (process.env.NODE_ENV !== "production") {
                var E = b.keyInfo.subType, I = fD[E];
                qs[E] || (qs[E] = !0, he(I ? "Series " + E + ` is used but not imported.
import { ` + I + ` } from 'echarts/charts';
echarts.use([` + I + "]);" : "Unknown series " + E));
              }
              return;
            }
            if (h === "tooltip") {
              if (_) {
                process.env.NODE_ENV !== "production" && (S || (nt("Currently only one tooltip component is allowed."), S = !0));
                return;
              }
              _ = !0;
            }
            if (T && T.constructor === C)
              T.name = b.keyInfo.name, T.mergeOption(M, this), T.optionUpdated(M, !1);
            else {
              var A = R({
                componentIndex: w
              }, b.keyInfo);
              T = new C(M, this, this, A), R(T, A), b.brandNew && (T.__requireNewView = !0), T.init(M, this, this), T.optionUpdated(null, !0);
            }
          }
          T ? (m.push(T.option), g.push(T), y++) : (m.push(void 0), g.push(void 0));
        }, this), i[h] = m, a.set(h, g), o.set(h, y), h === "series" && Yo(this);
      }
      this._seriesIndices || Yo(this);
    }, e.prototype.getOption = function() {
      var r = ae(this.option);
      return x(r, function(n, i) {
        if (ce.hasClass(i)) {
          for (var a = Qe(n), o = a.length, s = !1, u = o - 1; u >= 0; u--)
            a[u] && !Mi(a[u]) ? s = !0 : (a[u] = null, !s && o--);
          a.length = o, r[i] = a;
        }
      }), delete r[Kl], r;
    }, e.prototype.setTheme = function(r) {
      this._theme = new xe(r), this._resetOption("recreate", null);
    }, e.prototype.getTheme = function() {
      return this._theme;
    }, e.prototype.getLocaleModel = function() {
      return this._locale;
    }, e.prototype.setUpdatePayload = function(r) {
      this._payload = r;
    }, e.prototype.getUpdatePayload = function() {
      return this._payload;
    }, e.prototype.getComponent = function(r, n) {
      var i = this._componentsMap.get(r);
      if (i) {
        var a = i[n || 0];
        if (a)
          return a;
        if (n == null) {
          for (var o = 0; o < i.length; o++)
            if (i[o])
              return i[o];
        }
      }
    }, e.prototype.queryComponents = function(r) {
      var n = r.mainType;
      if (!n)
        return [];
      var i = r.index, a = r.id, o = r.name, s = this._componentsMap.get(n);
      if (!s || !s.length)
        return [];
      var u;
      return i != null ? (u = [], x(Qe(i), function(l) {
        s[l] && u.push(s[l]);
      })) : a != null ? u = mp("id", a, s) : o != null ? u = mp("name", o, s) : u = He(s, function(l) {
        return !!l;
      }), yp(u, r);
    }, e.prototype.findComponents = function(r) {
      var n = r.query, i = r.mainType, a = s(n), o = a ? this.queryComponents(a) : He(this._componentsMap.get(i), function(l) {
        return !!l;
      });
      return u(yp(o, r));
      function s(l) {
        var f = i + "Index", h = i + "Id", c = i + "Name";
        return l && (l[f] != null || l[h] != null || l[c] != null) ? {
          mainType: i,
          // subType will be filtered finally.
          index: l[f],
          id: l[h],
          name: l[c]
        } : null;
      }
      function u(l) {
        return r.filter ? He(l, r.filter) : l;
      }
    }, e.prototype.eachComponent = function(r, n, i) {
      var a = this._componentsMap;
      if (Q(r)) {
        var o = n, s = r;
        a.each(function(h, c) {
          for (var v = 0; h && v < h.length; v++) {
            var d = h[v];
            d && s.call(o, c, d, d.componentIndex);
          }
        });
      } else
        for (var u = z(r) ? a.get(r) : q(r) ? this.findComponents(r) : null, l = 0; u && l < u.length; l++) {
          var f = u[l];
          f && n.call(i, f, f.componentIndex);
        }
    }, e.prototype.getSeriesByName = function(r) {
      var n = Qt(r, null);
      return He(this._componentsMap.get("series"), function(i) {
        return !!i && n != null && i.name === n;
      });
    }, e.prototype.getSeriesByIndex = function(r) {
      return this._componentsMap.get("series")[r];
    }, e.prototype.getSeriesByType = function(r) {
      return He(this._componentsMap.get("series"), function(n) {
        return !!n && n.subType === r;
      });
    }, e.prototype.getSeries = function() {
      return He(this._componentsMap.get("series"), function(r) {
        return !!r;
      });
    }, e.prototype.getSeriesCount = function() {
      return this._componentsCount.get("series");
    }, e.prototype.eachSeries = function(r, n) {
      Ki(this), x(this._seriesIndices, function(i) {
        var a = this._componentsMap.get("series")[i];
        r.call(n, a, i);
      }, this);
    }, e.prototype.eachRawSeries = function(r, n) {
      x(this._componentsMap.get("series"), function(i) {
        i && r.call(n, i, i.componentIndex);
      });
    }, e.prototype.eachSeriesByType = function(r, n, i) {
      Ki(this), x(this._seriesIndices, function(a) {
        var o = this._componentsMap.get("series")[a];
        o.subType === r && n.call(i, o, a);
      }, this);
    }, e.prototype.eachRawSeriesByType = function(r, n, i) {
      return x(this.getSeriesByType(r), n, i);
    }, e.prototype.isSeriesFiltered = function(r) {
      return Ki(this), this._seriesIndicesMap.get(r.componentIndex) == null;
    }, e.prototype.getCurrentSeriesIndices = function() {
      return (this._seriesIndices || []).slice();
    }, e.prototype.filterSeries = function(r, n) {
      Ki(this);
      var i = [];
      x(this._seriesIndices, function(a) {
        var o = this._componentsMap.get("series")[a];
        r.call(n, o, a) && i.push(a);
      }, this), this._seriesIndices = i, this._seriesIndicesMap = Z(i);
    }, e.prototype.restoreData = function(r) {
      Yo(this);
      var n = this._componentsMap, i = [];
      n.each(function(a, o) {
        ce.hasClass(o) && i.push(o);
      }), ce.topologicalTravel(i, ce.getAllClassMainTypes(), function(a) {
        x(n.get(a), function(o) {
          o && (a !== "series" || !cD(o, r)) && o.restoreData();
        });
      });
    }, e.internalField = function() {
      Yo = function(r) {
        var n = r._seriesIndices = [];
        x(r._componentsMap.get("series"), function(i) {
          i && n.push(i.componentIndex);
        }), r._seriesIndicesMap = Z(n);
      }, Ki = function(r) {
        if (process.env.NODE_ENV !== "production" && !r._seriesIndices)
          throw new Error("Option should contains series.");
      }, pp = function(r, n) {
        r.option = {}, r.option[Kl] = gp, r._componentsMap = Z({
          series: []
        }), r._componentsCount = Z();
        var i = n.aria;
        q(i) && i.enabled == null && (i.enabled = !0), vD(n, r._theme.option), Se(n, Z0, !1), r._mergeOption(n, null);
      };
    }(), e;
  }(xe)
);
function cD(t, e) {
  if (e) {
    var r = e.seriesIndex, n = e.seriesId, i = e.seriesName;
    return r != null && t.componentIndex !== r || n != null && t.id !== n || i != null && t.name !== i;
  }
}
function vD(t, e) {
  var r = t.color && !t.colorLayer;
  x(e, function(n, i) {
    i === "colorLayer" && r || i === "color" && t.color || ce.hasClass(i) || (typeof n == "object" ? t[i] = t[i] ? Se(t[i], n, !1) : ae(n) : t[i] == null && (t[i] = n));
  });
}
function mp(t, e, r) {
  if (H(e)) {
    var n = Z();
    return x(e, function(a) {
      if (a != null) {
        var o = Qt(a, null);
        o != null && n.set(a, !0);
      }
    }), He(r, function(a) {
      return a && n.get(a[t]);
    });
  } else {
    var i = Qt(e, null);
    return He(r, function(a) {
      return a && i != null && a[t] === i;
    });
  }
}
function yp(t, e) {
  return e.hasOwnProperty("subType") ? He(t, function(r) {
    return r && r.subType === e.subType;
  }) : t;
}
function _p(t) {
  var e = Z();
  return t && x(Qe(t.replaceMerge), function(r) {
    process.env.NODE_ENV !== "production" && N(ce.hasClass(r), '"' + r + '" is not valid component main type in "replaceMerge"'), e.set(r, !0);
  }), {
    replaceMergeMainTypeMap: e
  };
}
ir(Qc, Kc);
var dD = /^(min|max)?(.+)$/, pD = (
  /** @class */
  function() {
    function t(e) {
      this._timelineOptions = [], this._mediaList = [], this._currentMediaIndices = [], this._api = e;
    }
    return t.prototype.setOption = function(e, r, n) {
      e && (x(Qe(e.series), function(o) {
        o && o.data && je(o.data) && Lf(o.data);
      }), x(Qe(e.dataset), function(o) {
        o && o.source && je(o.source) && Lf(o.source);
      })), e = ae(e);
      var i = this._optionBackup, a = gD(e, r, !i);
      this._newBaseOption = a.baseOption, i ? (a.timelineOptions.length && (i.timelineOptions = a.timelineOptions), a.mediaList.length && (i.mediaList = a.mediaList), a.mediaDefault && (i.mediaDefault = a.mediaDefault)) : this._optionBackup = a;
    }, t.prototype.mountOption = function(e) {
      var r = this._optionBackup;
      return this._timelineOptions = r.timelineOptions, this._mediaList = r.mediaList, this._mediaDefault = r.mediaDefault, this._currentMediaIndices = [], ae(e ? r.baseOption : this._newBaseOption);
    }, t.prototype.getTimelineOption = function(e) {
      var r, n = this._timelineOptions;
      if (n.length) {
        var i = e.getComponent("timeline");
        i && (r = ae(
          // FIXME:TS as TimelineModel or quivlant interface
          n[i.getCurrentIndex()]
        ));
      }
      return r;
    }, t.prototype.getMediaOption = function(e) {
      var r = this._api.getWidth(), n = this._api.getHeight(), i = this._mediaList, a = this._mediaDefault, o = [], s = [];
      if (!i.length && !a)
        return s;
      for (var u = 0, l = i.length; u < l; u++)
        mD(i[u].query, r, n) && o.push(u);
      return !o.length && a && (o = [-1]), o.length && !_D(o, this._currentMediaIndices) && (s = X(o, function(f) {
        return ae(f === -1 ? a.option : i[f].option);
      })), this._currentMediaIndices = o, s;
    }, t;
  }()
);
function gD(t, e, r) {
  var n = [], i, a, o = t.baseOption, s = t.timeline, u = t.options, l = t.media, f = !!t.media, h = !!(u || s || o && o.timeline);
  o ? (a = o, a.timeline || (a.timeline = s)) : ((h || f) && (t.options = t.media = null), a = t), f && (H(l) ? x(l, function(v) {
    process.env.NODE_ENV !== "production" && v && !v.option && q(v.query) && q(v.query.option) && he("Illegal media option. Must be like { media: [ { query: {}, option: {} } ] }"), v && v.option && (v.query ? n.push(v) : i || (i = v));
  }) : process.env.NODE_ENV !== "production" && he("Illegal media option. Must be an array. Like { media: [ {...}, {...} ] }")), c(a), x(u, function(v) {
    return c(v);
  }), x(n, function(v) {
    return c(v.option);
  });
  function c(v) {
    x(e, function(d) {
      d(v, r);
    });
  }
  return {
    baseOption: a,
    timelineOptions: u || [],
    mediaDefault: i,
    mediaList: n
  };
}
function mD(t, e, r) {
  var n = {
    width: e,
    height: r,
    aspectratio: e / r
    // lower case for convenience.
  }, i = !0;
  return x(t, function(a, o) {
    var s = o.match(dD);
    if (!(!s || !s[1] || !s[2])) {
      var u = s[1], l = s[2].toLowerCase();
      yD(n[l], a, u) || (i = !1);
    }
  }), i;
}
function yD(t, e, r) {
  return r === "min" ? t >= e : r === "max" ? t <= e : t === e;
}
function _D(t, e) {
  return t.join(",") === e.join(",");
}
var ht = x, Za = q, Sp = ["areaStyle", "lineStyle", "nodeStyle", "linkStyle", "chordStyle", "label", "labelLine"];
function Ql(t) {
  var e = t && t.itemStyle;
  if (e)
    for (var r = 0, n = Sp.length; r < n; r++) {
      var i = Sp[r], a = e.normal, o = e.emphasis;
      a && a[i] && (process.env.NODE_ENV !== "production" && Ve("itemStyle.normal." + i, i), t[i] = t[i] || {}, t[i].normal ? Se(t[i].normal, a[i]) : t[i].normal = a[i], a[i] = null), o && o[i] && (process.env.NODE_ENV !== "production" && Ve("itemStyle.emphasis." + i, "emphasis." + i), t[i] = t[i] || {}, t[i].emphasis ? Se(t[i].emphasis, o[i]) : t[i].emphasis = o[i], o[i] = null);
    }
}
function Ye(t, e, r) {
  if (t && t[e] && (t[e].normal || t[e].emphasis)) {
    var n = t[e].normal, i = t[e].emphasis;
    n && (process.env.NODE_ENV !== "production" && tr("'normal' hierarchy in " + e + " has been removed since 4.0. All style properties are configured in " + e + " directly now."), r ? (t[e].normal = t[e].emphasis = null, ge(t[e], n)) : t[e] = n), i && (process.env.NODE_ENV !== "production" && tr(e + ".emphasis has been changed to emphasis." + e + " since 4.0"), t.emphasis = t.emphasis || {}, t.emphasis[e] = i, i.focus && (t.emphasis.focus = i.focus), i.blurScope && (t.emphasis.blurScope = i.blurScope));
  }
}
function Sa(t) {
  Ye(t, "itemStyle"), Ye(t, "lineStyle"), Ye(t, "areaStyle"), Ye(t, "label"), Ye(t, "labelLine"), Ye(t, "upperLabel"), Ye(t, "edgeLabel");
}
function Ee(t, e) {
  var r = Za(t) && t[e], n = Za(r) && r.textStyle;
  if (n) {
    process.env.NODE_ENV !== "production" && tr("textStyle hierarchy in " + e + " has been removed since 4.0. All textStyle properties are configured in " + e + " directly now.");
    for (var i = 0, a = gd.length; i < a; i++) {
      var o = gd[i];
      n.hasOwnProperty(o) && (r[o] = n[o]);
    }
  }
}
function gt(t) {
  t && (Sa(t), Ee(t, "label"), t.emphasis && Ee(t.emphasis, "label"));
}
function SD(t) {
  if (Za(t)) {
    Ql(t), Sa(t), Ee(t, "label"), Ee(t, "upperLabel"), Ee(t, "edgeLabel"), t.emphasis && (Ee(t.emphasis, "label"), Ee(t.emphasis, "upperLabel"), Ee(t.emphasis, "edgeLabel"));
    var e = t.markPoint;
    e && (Ql(e), gt(e));
    var r = t.markLine;
    r && (Ql(r), gt(r));
    var n = t.markArea;
    n && gt(n);
    var i = t.data;
    if (t.type === "graph") {
      i = i || t.nodes;
      var a = t.links || t.edges;
      if (a && !je(a))
        for (var o = 0; o < a.length; o++)
          gt(a[o]);
      x(t.categories, function(l) {
        Sa(l);
      });
    }
    if (i && !je(i))
      for (var o = 0; o < i.length; o++)
        gt(i[o]);
    if (e = t.markPoint, e && e.data)
      for (var s = e.data, o = 0; o < s.length; o++)
        gt(s[o]);
    if (r = t.markLine, r && r.data)
      for (var u = r.data, o = 0; o < u.length; o++)
        H(u[o]) ? (gt(u[o][0]), gt(u[o][1])) : gt(u[o]);
    t.type === "gauge" ? (Ee(t, "axisLabel"), Ee(t, "title"), Ee(t, "detail")) : t.type === "treemap" ? (Ye(t.breadcrumb, "itemStyle"), x(t.levels, function(l) {
      Sa(l);
    })) : t.type === "tree" && Sa(t.leaves);
  }
}
function lr(t) {
  return H(t) ? t : t ? [t] : [];
}
function bp(t) {
  return (H(t) ? t[0] : t) || {};
}
function bD(t, e) {
  ht(lr(t.series), function(n) {
    Za(n) && SD(n);
  });
  var r = ["xAxis", "yAxis", "radiusAxis", "angleAxis", "singleAxis", "parallelAxis", "radar"];
  e && r.push("valueAxis", "categoryAxis", "logAxis", "timeAxis"), ht(r, function(n) {
    ht(lr(t[n]), function(i) {
      i && (Ee(i, "axisLabel"), Ee(i.axisPointer, "label"));
    });
  }), ht(lr(t.parallel), function(n) {
    var i = n && n.parallelAxisDefault;
    Ee(i, "axisLabel"), Ee(i && i.axisPointer, "label");
  }), ht(lr(t.calendar), function(n) {
    Ye(n, "itemStyle"), Ee(n, "dayLabel"), Ee(n, "monthLabel"), Ee(n, "yearLabel");
  }), ht(lr(t.radar), function(n) {
    Ee(n, "name"), n.name && n.axisName == null && (n.axisName = n.name, delete n.name, process.env.NODE_ENV !== "production" && tr("name property in radar component has been changed to axisName")), n.nameGap != null && n.axisNameGap == null && (n.axisNameGap = n.nameGap, delete n.nameGap, process.env.NODE_ENV !== "production" && tr("nameGap property in radar component has been changed to axisNameGap")), process.env.NODE_ENV !== "production" && ht(n.indicator, function(i) {
      i.text && Ve("text", "name", "radar.indicator");
    });
  }), ht(lr(t.geo), function(n) {
    Za(n) && (gt(n), ht(lr(n.regions), function(i) {
      gt(i);
    }));
  }), ht(lr(t.timeline), function(n) {
    gt(n), Ye(n, "label"), Ye(n, "itemStyle"), Ye(n, "controlStyle", !0);
    var i = n.data;
    H(i) && x(i, function(a) {
      q(a) && (Ye(a, "label"), Ye(a, "itemStyle"));
    });
  }), ht(lr(t.toolbox), function(n) {
    Ye(n, "iconStyle"), ht(n.feature, function(i) {
      Ye(i, "iconStyle");
    });
  }), Ee(bp(t.axisPointer), "label"), Ee(bp(t.tooltip).axisPointer, "label");
}
function wD(t, e) {
  for (var r = e.split(","), n = t, i = 0; i < r.length && (n = n && n[r[i]], n != null); i++)
    ;
  return n;
}
function TD(t, e, r, n) {
  for (var i = e.split(","), a = t, o, s = 0; s < i.length - 1; s++)
    o = i[s], a[o] == null && (a[o] = {}), a = a[o];
  a[i[s]] == null && (a[i[s]] = r);
}
function wp(t) {
  t && x(xD, function(e) {
    e[0] in t && !(e[1] in t) && (t[e[1]] = t[e[0]]);
  });
}
var xD = [["x", "left"], ["y", "top"], ["x2", "right"], ["y2", "bottom"]], CD = ["grid", "geo", "parallel", "legend", "toolbox", "title", "visualMap", "dataZoom", "timeline"], jl = [["borderRadius", "barBorderRadius"], ["borderColor", "barBorderColor"], ["borderWidth", "barBorderWidth"]];
function Qi(t) {
  var e = t && t.itemStyle;
  if (e)
    for (var r = 0; r < jl.length; r++) {
      var n = jl[r][1], i = jl[r][0];
      e[n] != null && (e[i] = e[n], process.env.NODE_ENV !== "production" && Ve(n, i));
    }
}
function Tp(t) {
  t && t.alignTo === "edge" && t.margin != null && t.edgeDistance == null && (process.env.NODE_ENV !== "production" && Ve("label.margin", "label.edgeDistance", "pie"), t.edgeDistance = t.margin);
}
function xp(t) {
  t && t.downplay && !t.blur && (t.blur = t.downplay, process.env.NODE_ENV !== "production" && Ve("downplay", "blur", "sunburst"));
}
function DD(t) {
  t && t.focusNodeAdjacency != null && (t.emphasis = t.emphasis || {}, t.emphasis.focus == null && (process.env.NODE_ENV !== "production" && Ve("focusNodeAdjacency", "emphasis: { focus: 'adjacency'}", "graph/sankey"), t.emphasis.focus = "adjacency"));
}
function Q0(t, e) {
  if (t)
    for (var r = 0; r < t.length; r++)
      e(t[r]), t[r] && Q0(t[r].children, e);
}
function j0(t, e) {
  bD(t, e), t.series = Qe(t.series), x(t.series, function(r) {
    if (q(r)) {
      var n = r.type;
      if (n === "line")
        r.clipOverflow != null && (r.clip = r.clipOverflow, process.env.NODE_ENV !== "production" && Ve("clipOverflow", "clip", "line"));
      else if (n === "pie" || n === "gauge") {
        r.clockWise != null && (r.clockwise = r.clockWise, process.env.NODE_ENV !== "production" && Ve("clockWise", "clockwise")), Tp(r.label);
        var i = r.data;
        if (i && !je(i))
          for (var a = 0; a < i.length; a++)
            Tp(i[a]);
        r.hoverOffset != null && (r.emphasis = r.emphasis || {}, (r.emphasis.scaleSize = null) && (process.env.NODE_ENV !== "production" && Ve("hoverOffset", "emphasis.scaleSize"), r.emphasis.scaleSize = r.hoverOffset));
      } else if (n === "gauge") {
        var o = wD(r, "pointer.color");
        o != null && TD(r, "itemStyle.color", o);
      } else if (n === "bar") {
        Qi(r), Qi(r.backgroundStyle), Qi(r.emphasis);
        var i = r.data;
        if (i && !je(i))
          for (var a = 0; a < i.length; a++)
            typeof i[a] == "object" && (Qi(i[a]), Qi(i[a] && i[a].emphasis));
      } else if (n === "sunburst") {
        var s = r.highlightPolicy;
        s && (r.emphasis = r.emphasis || {}, r.emphasis.focus || (r.emphasis.focus = s, process.env.NODE_ENV !== "production" && Ve("highlightPolicy", "emphasis.focus", "sunburst"))), xp(r), Q0(r.data, xp);
      } else n === "graph" || n === "sankey" ? DD(r) : n === "map" && (r.mapType && !r.map && (process.env.NODE_ENV !== "production" && Ve("mapType", "map", "map"), r.map = r.mapType), r.mapLocation && (process.env.NODE_ENV !== "production" && tr("`mapLocation` is not used anymore."), ge(r, r.mapLocation)));
      r.hoverAnimation != null && (r.emphasis = r.emphasis || {}, r.emphasis && r.emphasis.scale == null && (process.env.NODE_ENV !== "production" && Ve("hoverAnimation", "emphasis.scale"), r.emphasis.scale = r.hoverAnimation)), wp(r);
    }
  }), t.dataRange && (t.visualMap = t.dataRange), x(CD, function(r) {
    var n = t[r];
    n && (H(n) || (n = [n]), x(n, function(i) {
      wp(i);
    }));
  });
}
var MD = dc(ED);
function ED(t) {
  var e = Z();
  t.eachSeries(function(r) {
    var n = r.get("stack");
    if (n) {
      var i = e.get(n) || e.set(n, []), a = r.getData(), o = {
        // Used for calculate axis extent automatically.
        // TODO: Type getCalculationInfo return more specific type?
        stackResultDimension: a.getCalculationInfo("stackResultDimension"),
        stackedOverDimension: a.getCalculationInfo("stackedOverDimension"),
        stackedDimension: a.getCalculationInfo("stackedDimension"),
        stackedByDimension: a.getCalculationInfo("stackedByDimension"),
        isStackedByIndex: a.getCalculationInfo("isStackedByIndex"),
        data: a,
        seriesModel: r
      };
      if (!o.stackedDimension || !(o.isStackedByIndex || o.stackedByDimension))
        return;
      i.push(o);
    }
  }), e.each(function(r) {
    if (r.length !== 0) {
      var n = r[0].seriesModel, i = n.get("stackOrder") || "seriesAsc";
      i === "seriesDesc" && r.reverse(), x(r, function(a, o) {
        a.data.setCalculationInfo("stackedOnSeries", o > 0 ? r[o - 1].seriesModel : null);
      }), AD(r);
    }
  });
}
function AD(t) {
  x(t, function(e, r) {
    var n = [], i = [NaN, NaN], a = [e.stackResultDimension, e.stackedOverDimension], o = e.data, s = e.isStackedByIndex, u = e.seriesModel.get("stackStrategy") || "samesign";
    o.modify(a, function(l, f, h) {
      var c = o.get(e.stackedDimension, h);
      if (isNaN(c))
        return i;
      var v, d;
      s ? d = o.getRawIndex(h) : v = o.get(e.stackedByDimension, h);
      for (var p = NaN, m = r - 1; m >= 0; m--) {
        var g = t[m];
        if (s || (d = g.data.rawIndexOf(g.stackedByDimension, v)), d >= 0) {
          var y = g.data.getByRawIndex(g.stackResultDimension, d);
          if (u === "all" || u === "positive" && y > 0 || u === "negative" && y < 0 || u === "samesign" && c >= 0 && y > 0 || u === "samesign" && c <= 0 && y < 0) {
            c = _n(c, y), p = y;
            break;
          }
        }
      }
      return n[0] = c, n[1] = p, n;
    });
  });
}
var Yu = (
  /** @class */
  /* @__PURE__ */ function() {
    function t(e) {
      this.data = e.data || (e.sourceFormat === sr ? {} : []), this.sourceFormat = e.sourceFormat || Ky, this.seriesLayoutBy = e.seriesLayoutBy || jt, this.startIndex = e.startIndex || 0, this.dimensionsDetectedCount = e.dimensionsDetectedCount, this.metaRawOption = e.metaRawOption;
      var r = this.dimensionsDefine = e.dimensionsDefine;
      if (r)
        for (var n = 0; n < r.length; n++) {
          var i = r[n];
          i.type == null && K0(this, n) === ut.Must && (i.type = "ordinal");
        }
    }
    return t;
  }()
);
function jc(t) {
  return t instanceof Yu;
}
function Sh(t, e, r) {
  r = r || e_(t);
  var n = e.seriesLayoutBy, i = OD(t, r, n, e.sourceHeader, e.dimensions), a = new Yu({
    data: t,
    sourceFormat: r,
    seriesLayoutBy: n,
    dimensionsDefine: i.dimensionsDefine,
    startIndex: i.startIndex,
    dimensionsDetectedCount: i.dimensionsDetectedCount,
    metaRawOption: ae(e)
  });
  return a;
}
function J0(t) {
  return new Yu({
    data: t,
    sourceFormat: je(t) ? pr : ft
  });
}
function ID(t) {
  return new Yu({
    data: t.data,
    sourceFormat: t.sourceFormat,
    seriesLayoutBy: t.seriesLayoutBy,
    dimensionsDefine: ae(t.dimensionsDefine),
    startIndex: t.startIndex,
    dimensionsDetectedCount: t.dimensionsDetectedCount
  });
}
function e_(t) {
  var e = Ky;
  if (je(t))
    e = pr;
  else if (H(t)) {
    t.length === 0 && (e = Xe);
    for (var r = 0, n = t.length; r < n; r++) {
      var i = t[r];
      if (i != null) {
        if (H(i) || je(i)) {
          e = Xe;
          break;
        } else if (q(i)) {
          e = Rt;
          break;
        }
      }
    }
  } else if (q(t)) {
    for (var a in t)
      if (at(t, a) && ot(t[a])) {
        e = sr;
        break;
      }
  }
  return e;
}
function OD(t, e, r, n, i) {
  var a, o;
  if (!t)
    return {
      dimensionsDefine: Cp(i),
      startIndex: o,
      dimensionsDetectedCount: a
    };
  if (e === Xe) {
    var s = t;
    n === "auto" || n == null ? Dp(function(l) {
      l != null && l !== "-" && (z(l) ? o == null && (o = 1) : o = 0);
    }, r, s, 10) : o = Te(n) ? n : n ? 1 : 0, !i && o === 1 && (i = [], Dp(function(l, f) {
      i[f] = l != null ? l + "" : "";
    }, r, s, 1 / 0)), a = i ? i.length : r === Vn ? s.length : s[0] ? s[0].length : null;
  } else if (e === Rt)
    i || (i = LD(t));
  else if (e === sr)
    i || (i = [], x(t, function(l, f) {
      i.push(f);
    }));
  else if (e === ft) {
    var u = lo(t[0]);
    a = H(u) && u.length || 1;
  } else e === pr && process.env.NODE_ENV !== "production" && N(!!i, "dimensions must be given if data is TypedArray.");
  return {
    startIndex: o,
    dimensionsDefine: Cp(i),
    dimensionsDetectedCount: a
  };
}
function LD(t) {
  for (var e = 0, r; e < t.length && !(r = t[e++]); )
    ;
  if (r)
    return le(r);
}
function Cp(t) {
  if (t) {
    var e = Z();
    return X(t, function(r, n) {
      r = q(r) ? r : {
        name: r
      };
      var i = {
        name: r.name,
        displayName: r.displayName,
        type: r.type
      };
      if (i.name == null)
        return i;
      i.name += "", i.displayName == null && (i.displayName = i.name);
      var a = e.get(i.name);
      return a ? i.name += "-" + a.count++ : e.set(i.name, {
        count: 1
      }), i;
    });
  }
}
function Dp(t, e, r, n) {
  if (e === Vn)
    for (var i = 0; i < r.length && i < n; i++)
      t(r[i] ? r[i][0] : null, i);
  else
    for (var a = r[0] || [], i = 0; i < a.length && i < n; i++)
      t(a[i], i);
}
function t_(t) {
  var e = t.sourceFormat;
  return e === Rt || e === sr;
}
var vn, dn, pn, gn, Mp, Ep, r_ = (
  /** @class */
  function() {
    function t(e, r) {
      var n = jc(e) ? e : J0(e);
      this._source = n;
      var i = this._data = n.data, a = n.sourceFormat, o = n.seriesLayoutBy;
      if (a === pr) {
        if (process.env.NODE_ENV !== "production" && r == null)
          throw new Error("Typed array data must specify dimension size");
        this._offset = 0, this._dimSize = r, this._data = i;
      }
      if (process.env.NODE_ENV !== "production") {
        var s = PD[Ks(a, o)];
        s && s(i, n.dimensionsDefine);
      }
      Ep(this, i, n);
    }
    return t.prototype.getSource = function() {
      return this._source;
    }, t.prototype.count = function() {
      return 0;
    }, t.prototype.getItem = function(e, r) {
    }, t.prototype.appendData = function(e) {
    }, t.prototype.clean = function() {
    }, t.protoInitialize = function() {
      var e = t.prototype;
      e.pure = !1, e.persistent = !0;
    }(), t.internalField = function() {
      var e;
      Ep = function(o, s, u) {
        var l = u.sourceFormat, f = u.seriesLayoutBy, h = u.startIndex, c = u.dimensionsDefine, v = Mp[Ks(l, f)];
        if (process.env.NODE_ENV !== "production" && N(v, "Invalide sourceFormat: " + l), R(o, v), l === pr)
          o.getItem = r, o.count = i, o.fillStorage = n;
        else {
          var d = n_(l, f);
          o.getItem = te(d, null, s, h, c);
          var p = i_(l, f);
          o.count = te(p, null, s, h, c);
        }
      };
      var r = function(o, s) {
        o = o - this._offset, s = s || [];
        for (var u = this._data, l = this._dimSize, f = l * o, h = 0; h < l; h++)
          s[h] = u[f + h];
        return s;
      }, n = function(o, s, u, l) {
        for (var f = this._data, h = this._dimSize, c = 0; c < h; c++) {
          for (var v = l[c], d = v[0] == null ? 1 / 0 : v[0], p = v[1] == null ? -1 / 0 : v[1], m = s - o, g = u[c], y = 0; y < m; y++) {
            var _ = f[y * h + c];
            g[o + y] = _, _ < d && (d = _), _ > p && (p = _);
          }
          v[0] = d, v[1] = p;
        }
      }, i = function() {
        return this._data ? this._data.length / this._dimSize : 0;
      };
      Mp = (e = {}, e[Xe + "_" + jt] = {
        pure: !0,
        appendData: a
      }, e[Xe + "_" + Vn] = {
        pure: !0,
        appendData: function() {
          throw new Error('Do not support appendData when set seriesLayoutBy: "row".');
        }
      }, e[Rt] = {
        pure: !0,
        appendData: a
      }, e[sr] = {
        pure: !0,
        appendData: function(o) {
          var s = this._data;
          x(o, function(u, l) {
            for (var f = s[l] || (s[l] = []), h = 0; h < (u || []).length; h++)
              f.push(u[h]);
          });
        }
      }, e[ft] = {
        appendData: a
      }, e[pr] = {
        persistent: !1,
        pure: !0,
        appendData: function(o) {
          process.env.NODE_ENV !== "production" && N(je(o), "Added data must be TypedArray if data in initialization is TypedArray"), this._data = o;
        },
        // Clean self if data is already used.
        clean: function() {
          this._offset += this.count(), this._data = null;
        }
      }, e);
      function a(o) {
        for (var s = 0; s < o.length; s++)
          this._data.push(o[s]);
      }
    }(), t;
  }()
), Xo = function(t) {
  H(t) || he("series.data or dataset.source must be an array.");
}, PD = (vn = {}, vn[Xe + "_" + jt] = Xo, vn[Xe + "_" + Vn] = Xo, vn[Rt] = Xo, vn[sr] = function(t, e) {
  for (var r = 0; r < e.length; r++) {
    var n = e[r].name;
    n == null && he("dimension name must not be null/undefined.");
  }
}, vn[ft] = Xo, vn), Ap = function(t, e, r, n) {
  return t[n];
}, ND = (dn = {}, dn[Xe + "_" + jt] = function(t, e, r, n) {
  return t[n + e];
}, dn[Xe + "_" + Vn] = function(t, e, r, n, i) {
  n += e;
  for (var a = i || [], o = t, s = 0; s < o.length; s++) {
    var u = o[s];
    a[s] = u ? u[n] : null;
  }
  return a;
}, dn[Rt] = Ap, dn[sr] = function(t, e, r, n, i) {
  for (var a = i || [], o = 0; o < r.length; o++) {
    var s = r[o].name, u = s != null ? t[s] : null;
    a[o] = u ? u[n] : null;
  }
  return a;
}, dn[ft] = Ap, dn);
function n_(t, e) {
  var r = ND[Ks(t, e)];
  return process.env.NODE_ENV !== "production" && N(r, 'Do not support get item on "' + t + '", "' + e + '".'), r;
}
var Ip = function(t, e, r) {
  return t.length;
}, RD = (pn = {}, pn[Xe + "_" + jt] = function(t, e, r) {
  return Math.max(0, t.length - e);
}, pn[Xe + "_" + Vn] = function(t, e, r) {
  var n = t[0];
  return n ? Math.max(0, n.length - e) : 0;
}, pn[Rt] = Ip, pn[sr] = function(t, e, r) {
  var n = r[0].name, i = n != null ? t[n] : null;
  return i ? i.length : 0;
}, pn[ft] = Ip, pn);
function i_(t, e) {
  var r = RD[Ks(t, e)];
  return process.env.NODE_ENV !== "production" && N(r, 'Do not support count on "' + t + '", "' + e + '".'), r;
}
var Jl = function(t, e, r) {
  return t[e];
}, kD = (gn = {}, gn[Xe] = Jl, gn[Rt] = function(t, e, r) {
  return t[r];
}, gn[sr] = Jl, gn[ft] = function(t, e, r) {
  var n = lo(t);
  return n instanceof Array ? n[e] : n;
}, gn[pr] = Jl, gn);
function a_(t) {
  var e = kD[t];
  return process.env.NODE_ENV !== "production" && N(e, 'Do not support get value on "' + t + '".'), e;
}
function Ks(t, e) {
  return t === Xe ? t + "_" + e : t;
}
function Oi(t, e, r) {
  if (t) {
    var n = t.getRawDataItem(e);
    if (n != null) {
      var i = t.getStore(), a = i.getSource().sourceFormat;
      if (r != null) {
        var o = t.getDimensionIndex(r), s = i.getDimensionProperty(o);
        return a_(a)(n, o, s);
      } else {
        var u = n;
        return a === ft && (u = lo(n)), u;
      }
    }
  }
}
var BD = /\{@(.+?)\}/g, VD = (
  /** @class */
  function() {
    function t() {
    }
    return t.prototype.getDataParams = function(e, r) {
      var n = this.getData(r), i = this.getRawValue(e, r), a = n.getRawIndex(e), o = n.getName(e), s = n.getRawDataItem(e), u = n.getItemVisual(e, "style"), l = u && u[n.getItemVisual(e, "drawType") || "fill"], f = u && u.stroke, h = this.mainType, c = h === "series", v = n.userOutput && n.userOutput.get();
      return {
        componentType: h,
        componentSubType: this.subType,
        componentIndex: this.componentIndex,
        seriesType: c ? this.subType : null,
        seriesIndex: this.seriesIndex,
        seriesId: c ? this.id : null,
        seriesName: c ? this.name : null,
        name: o,
        dataIndex: a,
        data: s,
        dataType: r,
        value: i,
        color: l,
        borderColor: f,
        dimensionNames: v ? v.fullDimensions : null,
        encode: v ? v.encode : null,
        // Param name list for mapping `a`, `b`, `c`, `d`, `e`
        $vars: ["seriesName", "name", "value"]
      };
    }, t.prototype.getFormattedLabel = function(e, r, n, i, a, o) {
      r = r || "normal";
      var s = this.getData(n), u = this.getDataParams(e, n);
      if (o && (u.value = o.interpolatedValue), i != null && H(u.value) && (u.value = u.value[i]), !a) {
        var l = s.getItemModel(e);
        a = l.get(r === "normal" ? ["label", "formatter"] : [r, "label", "formatter"]);
      }
      if (Q(a))
        return u.status = r, u.dimensionIndex = i, a(u);
      if (z(a)) {
        var f = U0(a, u);
        return f.replace(BD, function(h, c) {
          var v = c.length, d = c;
          d.charAt(0) === "[" && d.charAt(v - 1) === "]" && (d = +d.slice(1, v - 1), process.env.NODE_ENV !== "production" && isNaN(d) && he("Invalide label formatter: @" + c + ", only support @[0], @[1], @[2], ..."));
          var p = Oi(s, e, d);
          if (o && H(o.interpolatedValue)) {
            var m = s.getDimensionIndex(d);
            m >= 0 && (p = o.interpolatedValue[m]);
          }
          return p != null ? p + "" : "";
        });
      }
    }, t.prototype.getRawValue = function(e, r) {
      return Oi(this.getData(r), e);
    }, t.prototype.formatTooltip = function(e, r, n) {
    }, t;
  }()
);
function Op(t) {
  var e, r;
  return q(t) ? t.type ? r = t : process.env.NODE_ENV !== "production" && console.warn("The return type of `formatTooltip` is not supported: " + Fs(t)) : e = t, {
    text: e,
    // markers: markers || markersExisting,
    frag: r
  };
}
function Pa(t) {
  return new FD(t);
}
var FD = (
  /** @class */
  function() {
    function t(e) {
      e = e || {}, this._reset = e.reset, this._plan = e.plan, this._count = e.count, this._onDirty = e.onDirty, this._dirty = !0;
    }
    return t.prototype.perform = function(e) {
      var r = this._upstream, n = e && e.skip;
      if (this._dirty && r) {
        var i = this.context;
        i.data = i.outputData = r.context.outputData;
      }
      this.__pipeline && (this.__pipeline.currentTask = this);
      var a;
      this._plan && !n && (a = this._plan(this.context));
      var o = f(this._modBy), s = this._modDataCount || 0, u = f(e && e.modBy), l = e && e.modDataCount || 0;
      (o !== u || s !== l) && (a = "reset");
      function f(y) {
        return !(y >= 1) && (y = 1), y;
      }
      var h;
      (this._dirty || a === "reset") && (this._dirty = !1, h = this._doReset(n)), this._modBy = u, this._modDataCount = l;
      var c = e && e.step;
      if (r ? (process.env.NODE_ENV !== "production" && N(r._outputDueEnd != null), this._dueEnd = r._outputDueEnd) : (process.env.NODE_ENV !== "production" && N(!this._progress || this._count), this._dueEnd = this._count ? this._count(this.context) : 1 / 0), this._progress) {
        var v = this._dueIndex, d = Math.min(c != null ? this._dueIndex + c : 1 / 0, this._dueEnd);
        if (!n && (h || v < d)) {
          var p = this._progress;
          if (H(p))
            for (var m = 0; m < p.length; m++)
              this._doProgress(p[m], v, d, u, l);
          else
            this._doProgress(p, v, d, u, l);
        }
        this._dueIndex = d;
        var g = this._settedOutputEnd != null ? this._settedOutputEnd : d;
        process.env.NODE_ENV !== "production" && N(g >= this._outputDueEnd), this._outputDueEnd = g;
      } else
        this._dueIndex = this._outputDueEnd = this._settedOutputEnd != null ? this._settedOutputEnd : this._dueEnd;
      return this.unfinished();
    }, t.prototype.dirty = function() {
      this._dirty = !0, this._onDirty && this._onDirty(this.context);
    }, t.prototype._doProgress = function(e, r, n, i, a) {
      Lp.reset(r, n, i, a), this._callingProgress = e, this._callingProgress({
        start: r,
        end: n,
        count: n - r,
        next: Lp.next
      }, this.context);
    }, t.prototype._doReset = function(e) {
      this._dueIndex = this._outputDueEnd = this._dueEnd = 0, this._settedOutputEnd = null;
      var r, n;
      !e && this._reset && (r = this._reset(this.context), r && r.progress && (n = r.forceFirstProgress, r = r.progress), H(r) && !r.length && (r = null)), this._progress = r, this._modBy = this._modDataCount = null;
      var i = this._downstream;
      return i && i.dirty(), n;
    }, t.prototype.unfinished = function() {
      return this._progress && this._dueIndex < this._dueEnd;
    }, t.prototype.pipe = function(e) {
      process.env.NODE_ENV !== "production" && N(e && !e._disposed && e !== this), (this._downstream !== e || this._dirty) && (this._downstream = e, e._upstream = this, e.dirty());
    }, t.prototype.dispose = function() {
      this._disposed || (this._upstream && (this._upstream._downstream = null), this._downstream && (this._downstream._upstream = null), this._dirty = !1, this._disposed = !0);
    }, t.prototype.getUpstream = function() {
      return this._upstream;
    }, t.prototype.getDownstream = function() {
      return this._downstream;
    }, t.prototype.setOutputEnd = function(e) {
      this._outputDueEnd = this._settedOutputEnd = e;
    }, t;
  }()
), Lp = /* @__PURE__ */ function() {
  var t, e, r, n, i, a = {
    reset: function(u, l, f, h) {
      e = u, t = l, r = f, n = h, i = Math.ceil(n / r), a.next = r > 1 && n > 0 ? s : o;
    }
  };
  return a;
  function o() {
    return e < t ? e++ : null;
  }
  function s() {
    var u = e % i * r + Math.ceil(e / i), l = e >= t ? null : u < n ? u : e;
    return e++, l;
  }
}();
function Ts(t, e) {
  var r = e && e.type;
  return r === "ordinal" ? t : (r === "time" && !Te(t) && t != null && t !== "-" && (t = +zi(t)), t == null || t === "" ? NaN : Number(t));
}
Z({
  number: function(t) {
    return parseFloat(t);
  },
  time: function(t) {
    return +zi(t);
  },
  trim: function(t) {
    return z(t) ? Yt(t) : t;
  }
});
var zD = (
  /** @class */
  function() {
    function t(e, r) {
      var n = e === "desc";
      this._resultLT = n ? 1 : -1, r == null && (r = n ? "min" : "max"), this._incomparable = r === "min" ? -1 / 0 : 1 / 0;
    }
    return t.prototype.evaluate = function(e, r) {
      var n = Te(e) ? e : Vs(e), i = Te(r) ? r : Vs(r), a = isNaN(n), o = isNaN(i);
      if (a && (n = this._incomparable), o && (i = this._incomparable), a && o) {
        var s = z(e), u = z(r);
        s && (n = u ? e : 0), u && (i = s ? r : 0);
      }
      return n < i ? this._resultLT : n > i ? -this._resultLT : 0;
    }, t;
  }()
);
function HD(t) {
  var e = "", r = -1 / 0, n = -1 / 0, i = 1 / 0, a = 1 / 0;
  return t && (t.g != null && (e += "G" + t.g, r = t.g), t.ge != null && (e += "GE" + t.ge, n = t.ge), t.l != null && (e += "L" + t.l, i = t.l), t.le != null && (e += "LE" + t.le, a = t.le)), {
    key: e,
    g: r,
    ge: n,
    l: i,
    le: a
  };
}
function GD(t, e) {
  return e > t.g && e >= t.ge && e < t.l && e <= t.le;
}
var UD = (
  /** @class */
  function() {
    function t() {
    }
    return t.prototype.getRawData = function() {
      throw new Error("not supported");
    }, t.prototype.getRawDataItem = function(e) {
      throw new Error("not supported");
    }, t.prototype.cloneRawData = function() {
    }, t.prototype.getDimensionInfo = function(e) {
    }, t.prototype.cloneAllDimensionInfo = function() {
    }, t.prototype.count = function() {
    }, t.prototype.retrieveValue = function(e, r) {
    }, t.prototype.retrieveValueFromItem = function(e, r) {
    }, t.prototype.convertValue = function(e, r) {
      return Ts(e, r);
    }, t;
  }()
);
function WD(t, e) {
  var r = new UD(), n = t.data, i = r.sourceFormat = t.sourceFormat, a = t.startIndex, o = "";
  t.seriesLayoutBy !== jt && (process.env.NODE_ENV !== "production" && (o = '`seriesLayoutBy` of upstream dataset can only be "column" in data transform.'), it(o));
  var s = [], u = {}, l = t.dimensionsDefine;
  if (l)
    x(l, function(p, m) {
      var g = p.name, y = {
        index: m,
        name: g,
        displayName: p.displayName
      };
      if (s.push(y), g != null) {
        var _ = "";
        at(u, g) && (process.env.NODE_ENV !== "production" && (_ = 'dimension name "' + g + '" duplicated.'), it(_)), u[g] = y;
      }
    });
  else
    for (var f = 0; f < t.dimensionsDetectedCount; f++)
      s.push({
        index: f
      });
  var h = n_(i, jt);
  e.__isBuiltIn && (r.getRawDataItem = function(p) {
    return h(n, a, s, p);
  }, r.getRawData = te(YD, null, t)), r.cloneRawData = te(XD, null, t);
  var c = i_(i, jt);
  r.count = te(c, null, n, a, s);
  var v = a_(i);
  r.retrieveValue = function(p, m) {
    var g = h(n, a, s, p);
    return d(g, m);
  };
  var d = r.retrieveValueFromItem = function(p, m) {
    if (p != null) {
      var g = s[m];
      if (g)
        return v(p, m, g.name);
    }
  };
  return r.getDimensionInfo = te(ZD, null, s, u), r.cloneAllDimensionInfo = te($D, null, s), r;
}
function YD(t) {
  var e = t.sourceFormat;
  if (!Jc(e)) {
    var r = "";
    process.env.NODE_ENV !== "production" && (r = "`getRawData` is not supported in source format " + e), it(r);
  }
  return t.data;
}
function XD(t) {
  var e = t.sourceFormat, r = t.data;
  if (!Jc(e)) {
    var n = "";
    process.env.NODE_ENV !== "production" && (n = "`cloneRawData` is not supported in source format " + e), it(n);
  }
  if (e === Xe) {
    for (var i = [], a = 0, o = r.length; a < o; a++)
      i.push(r[a].slice());
    return i;
  } else if (e === Rt) {
    for (var i = [], a = 0, o = r.length; a < o; a++)
      i.push(R({}, r[a]));
    return i;
  }
}
function ZD(t, e, r) {
  if (r != null) {
    if (Te(r) || !isNaN(r) && !at(e, r))
      return t[r];
    if (at(e, r))
      return e[r];
  }
}
function $D(t) {
  return ae(t);
}
var o_ = Z();
function qD(t) {
  t = ae(t);
  var e = t.type, r = "";
  e || (process.env.NODE_ENV !== "production" && (r = "Must have a `type` when `registerTransform`."), it(r));
  var n = e.split(":");
  n.length !== 2 && (process.env.NODE_ENV !== "production" && (r = 'Name must include namespace like "ns:regression".'), it(r));
  var i = !1;
  n[0] === "echarts" && (e = n[1], i = !0), t.__isBuiltIn = i, o_.set(e, t);
}
function KD(t, e, r) {
  var n = Qe(t), i = n.length, a = "";
  i || (process.env.NODE_ENV !== "production" && (a = "If `transform` declared, it should at least contain one transform."), it(a));
  for (var o = 0, s = i; o < s; o++) {
    var u = n[o];
    e = QD(u, e, r, i === 1 ? null : o), o !== s - 1 && (e.length = Math.max(e.length, 1));
  }
  return e;
}
function QD(t, e, r, n) {
  var i = "";
  e.length || (process.env.NODE_ENV !== "production" && (i = "Must have at least one upstream dataset."), it(i)), q(t) || (process.env.NODE_ENV !== "production" && (i = "transform declaration must be an object rather than " + typeof t + "."), it(i));
  var a = t.type, o = o_.get(a);
  o || (process.env.NODE_ENV !== "production" && (i = 'Can not find transform on type "' + a + '".'), it(i));
  var s = X(e, function(f) {
    return WD(f, o);
  }), u = Qe(o.transform({
    upstream: s[0],
    upstreamList: s,
    config: ae(t.config)
  }));
  if (process.env.NODE_ENV !== "production" && t.print) {
    var l = X(u, function(f) {
      var h = n != null ? " === pipe index: " + n : "";
      return ["=== dataset index: " + r.datasetIndex + h + " ===", "- transform result data:", Fs(f.data), "- transform result dimensions:", Fs(f.dimensions)].join(`
`);
    }).join(`
`);
    Oy(l);
  }
  return X(u, function(f, h) {
    var c = "";
    q(f) || (process.env.NODE_ENV !== "production" && (c = "A transform should not return some empty results."), it(c)), f.data || (process.env.NODE_ENV !== "production" && (c = "Transform result data should be not be null or undefined"), it(c));
    var v = e_(f.data);
    Jc(v) || (process.env.NODE_ENV !== "production" && (c = "Transform result data should be array rows or object rows."), it(c));
    var d, p = e[0];
    if (p && h === 0 && !f.dimensions) {
      var m = p.startIndex;
      m && (f.data = p.data.slice(0, m).concat(f.data)), d = {
        seriesLayoutBy: jt,
        sourceHeader: m,
        dimensions: p.metaRawOption.dimensions
      };
    } else
      d = {
        seriesLayoutBy: jt,
        sourceHeader: 0,
        dimensions: f.dimensions
      };
    return Sh(f.data, d, null);
  });
}
function Jc(t) {
  return t === Xe || t === Rt;
}
var jD = typeof Uint32Array === co ? Array : Uint32Array, JD = typeof Uint16Array === co ? Array : Uint16Array, s_ = typeof Int32Array === co ? Array : Int32Array, Pp = typeof Float64Array === co ? Array : Float64Array, u_ = {
  float: Pp,
  int: s_,
  // Ordinal data type can be string or int
  ordinal: Array,
  number: Array,
  time: Pp
}, ef;
function Kn(t) {
  return t > 65535 ? jD : JD;
}
function eM(t) {
  var e = t.constructor;
  return e === Array ? t.slice() : new e(t);
}
function Np(t, e, r, n, i) {
  var a = u_[r || "float"];
  if (i) {
    var o = t[e], s = o && o.length;
    if (s !== n) {
      for (var u = new a(n), l = 0; l < s; l++)
        u[l] = o[l];
      t[e] = u;
    }
  } else
    t[e] = new a(n);
}
var bh = (
  /** @class */
  function() {
    function t() {
      this._chunks = [], this._rawExtent = [], this._extent = [], this._count = 0, this._rawCount = 0, this._calcDimNameToIdx = Z();
    }
    return t.prototype.initData = function(e, r, n) {
      process.env.NODE_ENV !== "production" && N(Q(e.getItem) && Q(e.count), "Invalid data provider."), this._provider = e, this._chunks = [], this._indices = null, this.getRawIndex = this._getRawIdxIdentity;
      var i = e.getSource(), a = this.defaultDimValueGetter = ef[i.sourceFormat];
      this._dimValueGetter = n || a, this._rawExtent = [];
      var o = t_(i);
      this._dimensions = X(r, function(s) {
        return process.env.NODE_ENV !== "production" && o && N(s.property != null), {
          // Only pick these two props. Not leak other properties like orderMeta.
          type: s.type,
          property: s.property
        };
      }), this._initDataFromProvider(0, e.count());
    }, t.prototype.getProvider = function() {
      return this._provider;
    }, t.prototype.getSource = function() {
      return this._provider.getSource();
    }, t.prototype.ensureCalculationDimension = function(e, r) {
      var n = this._calcDimNameToIdx, i = this._dimensions, a = n.get(e);
      if (a != null) {
        if (i[a].type === r)
          return a;
      } else
        a = i.length;
      return i[a] = {
        type: r
      }, n.set(e, a), this._chunks[a] = new u_[r || "float"](this._rawCount), this._rawExtent[a] = St(), a;
    }, t.prototype.collectOrdinalMeta = function(e, r) {
      var n = this._chunks[e], i = this._dimensions[e], a = this._rawExtent, o = i.ordinalOffset || 0, s = n.length;
      o === 0 && (a[e] = St());
      for (var u = a[e], l = o; l < s; l++) {
        var f = n[l] = r.parseAndCollect(n[l]);
        isNaN(f) || (u[0] = Math.min(f, u[0]), u[1] = Math.max(f, u[1]));
      }
      i.ordinalMeta = r, i.ordinalOffset = s, i.type = "ordinal";
    }, t.prototype.getOrdinalMeta = function(e) {
      var r = this._dimensions[e], n = r.ordinalMeta;
      return n;
    }, t.prototype.getDimensionProperty = function(e) {
      var r = this._dimensions[e];
      return r && r.property;
    }, t.prototype.appendData = function(e) {
      process.env.NODE_ENV !== "production" && N(!this._indices, "appendData can only be called on raw data.");
      var r = this._provider, n = this.count();
      r.appendData(e);
      var i = r.count();
      return r.persistent || (i += n), n < i && this._initDataFromProvider(n, i, !0), [n, i];
    }, t.prototype.appendValues = function(e, r) {
      for (var n = this._chunks, i = this._dimensions, a = i.length, o = this._rawExtent, s = this.count(), u = s + Math.max(e.length, r || 0), l = 0; l < a; l++) {
        var f = i[l];
        Np(n, l, f.type, u, !0);
      }
      for (var h = [], c = s; c < u; c++)
        for (var v = c - s, d = 0; d < a; d++) {
          var f = i[d], p = ef.arrayRows.call(this, e[v] || h, f.property, v, d);
          n[d][c] = p;
          var m = o[d];
          p < m[0] && (m[0] = p), p > m[1] && (m[1] = p);
        }
      return this._rawCount = this._count = u, {
        start: s,
        end: u
      };
    }, t.prototype._initDataFromProvider = function(e, r, n) {
      for (var i = this._provider, a = this._chunks, o = this._dimensions, s = o.length, u = this._rawExtent, l = X(o, function(y) {
        return y.property;
      }), f = 0; f < s; f++) {
        var h = o[f];
        u[f] || (u[f] = St()), Np(a, f, h.type, r, n);
      }
      if (i.fillStorage)
        i.fillStorage(e, r, a, u);
      else
        for (var c = [], v = e; v < r; v++) {
          c = i.getItem(v, c);
          for (var d = 0; d < s; d++) {
            var p = a[d], m = this._dimValueGetter(c, l[d], v, d);
            p[v] = m;
            var g = u[d];
            m < g[0] && (g[0] = m), m > g[1] && (g[1] = m);
          }
        }
      !i.persistent && i.clean && i.clean(), this._rawCount = this._count = r, this._extent = [];
    }, t.prototype.count = function() {
      return this._count;
    }, t.prototype.get = function(e, r) {
      if (!(r >= 0 && r < this._count))
        return NaN;
      var n = this._chunks[e];
      return n ? n[this.getRawIndex(r)] : NaN;
    }, t.prototype.getValues = function(e, r) {
      var n = [], i = [];
      if (r == null) {
        r = e, e = [];
        for (var a = 0; a < this._dimensions.length; a++)
          i.push(a);
      } else
        i = e;
      for (var a = 0, o = i.length; a < o; a++)
        n.push(this.get(i[a], r));
      return n;
    }, t.prototype.getByRawIndex = function(e, r) {
      if (!(r >= 0 && r < this._rawCount))
        return NaN;
      var n = this._chunks[e];
      return n ? n[r] : NaN;
    }, t.prototype.getSum = function(e) {
      var r = this._chunks[e], n = 0;
      if (r)
        for (var i = 0, a = this.count(); i < a; i++) {
          var o = this.get(e, i);
          isNaN(o) || (n += o);
        }
      return n;
    }, t.prototype.getMedian = function(e) {
      var r = [];
      this.each([e], function(i) {
        isNaN(i) || r.push(i);
      }), Lr(r);
      var n = this.count();
      return n === 0 ? 0 : n % 2 === 1 ? r[(n - 1) / 2] : (r[n / 2] + r[n / 2 - 1]) / 2;
    }, t.prototype.indexOfRawIndex = function(e) {
      if (e >= this._rawCount || e < 0)
        return -1;
      if (!this._indices)
        return e;
      var r = this._indices, n = r[e];
      if (n != null && n < this._count && n === e)
        return e;
      for (var i = 0, a = this._count - 1; i <= a; ) {
        var o = (i + a) / 2 | 0;
        if (r[o] < e)
          i = o + 1;
        else if (r[o] > e)
          a = o - 1;
        else
          return o;
      }
      return -1;
    }, t.prototype.getIndices = function() {
      var e, r = this._indices;
      if (r) {
        var n = r.constructor, i = this._count;
        if (n === Array) {
          e = new n(i);
          for (var a = 0; a < i; a++)
            e[a] = r[a];
        } else
          e = new n(r.buffer, 0, i);
      } else {
        var n = Kn(this._rawCount);
        e = new n(this.count());
        for (var a = 0; a < e.length; a++)
          e[a] = a;
      }
      return e;
    }, t.prototype.filter = function(e, r) {
      if (!this._count)
        return this;
      for (var n = this.clone(), i = n.count(), a = Kn(n._rawCount), o = new a(i), s = [], u = e.length, l = 0, f = e[0], h = n._chunks, c = 0; c < i; c++) {
        var v = void 0, d = n.getRawIndex(c);
        if (u === 0)
          v = r(c);
        else if (u === 1) {
          var p = h[f][d];
          v = r(p, c);
        } else {
          for (var m = 0; m < u; m++)
            s[m] = h[e[m]][d];
          s[m] = c, v = r.apply(null, s);
        }
        v && (o[l++] = d);
      }
      return l < i && (n._indices = o), n._count = l, n._extent = [], n._updateGetRawIdx(), n;
    }, t.prototype.selectRange = function(e) {
      var r = this.clone(), n = r._count;
      if (!n)
        return this;
      var i = le(e), a = i.length;
      if (!a)
        return this;
      var o = r.count(), s = Kn(r._rawCount), u = new s(o), l = 0, f = i[0], h = e[f][0], c = e[f][1], v = r._chunks, d = !1;
      if (!r._indices) {
        var p = 0;
        if (a === 1) {
          for (var m = v[i[0]], g = 0; g < n; g++) {
            var y = m[g];
            (y >= h && y <= c || isNaN(y)) && (u[l++] = p), p++;
          }
          d = !0;
        } else if (a === 2) {
          for (var m = v[i[0]], _ = v[i[1]], S = e[i[1]][0], b = e[i[1]][1], g = 0; g < n; g++) {
            var y = m[g], w = _[g];
            (y >= h && y <= c || isNaN(y)) && (w >= S && w <= b || isNaN(w)) && (u[l++] = p), p++;
          }
          d = !0;
        }
      }
      if (!d)
        if (a === 1)
          for (var g = 0; g < o; g++) {
            var T = r.getRawIndex(g), y = v[i[0]][T];
            (y >= h && y <= c || isNaN(y)) && (u[l++] = T);
          }
        else
          for (var g = 0; g < o; g++) {
            for (var M = !0, T = r.getRawIndex(g), D = 0; D < a; D++) {
              var C = i[D], y = v[C][T];
              (y < e[C][0] || y > e[C][1]) && (M = !1);
            }
            M && (u[l++] = r.getRawIndex(g));
          }
      return l < o && (r._indices = u), r._count = l, r._extent = [], r._updateGetRawIdx(), r;
    }, t.prototype.map = function(e, r) {
      var n = this.clone(e);
      return this._updateDims(n, e, r), n;
    }, t.prototype.modify = function(e, r) {
      this._updateDims(this, e, r);
    }, t.prototype._updateDims = function(e, r, n) {
      for (var i = e._chunks, a = [], o = r.length, s = e.count(), u = [], l = e._rawExtent, f = 0; f < r.length; f++)
        l[r[f]] = St();
      for (var h = 0; h < s; h++) {
        for (var c = e.getRawIndex(h), v = 0; v < o; v++)
          u[v] = i[r[v]][c];
        u[o] = h;
        var d = n && n.apply(null, u);
        if (d != null) {
          typeof d != "object" && (a[0] = d, d = a);
          for (var f = 0; f < d.length; f++) {
            var p = r[f], m = d[f], g = l[p], y = i[p];
            y && (y[c] = m), m < g[0] && (g[0] = m), m > g[1] && (g[1] = m);
          }
        }
      }
    }, t.prototype.lttbDownSample = function(e, r) {
      var n = this.clone([e], !0), i = n._chunks, a = i[e], o = this.count(), s = 0, u = Math.floor(1 / r), l = this.getRawIndex(0), f, h, c, v = new (Kn(this._rawCount))(Math.min((Math.ceil(o / u) + 2) * 2, o));
      v[s++] = l;
      for (var d = 1; d < o - 1; d += u) {
        for (var p = Math.min(d + u, o - 1), m = Math.min(d + u * 2, o), g = (m + p) / 2, y = 0, _ = p; _ < m; _++) {
          var S = this.getRawIndex(_), b = a[S];
          isNaN(b) || (y += b);
        }
        y /= m - p;
        var w = d, T = Math.min(d + u, o), M = d - 1, D = a[l];
        f = -1, c = w;
        for (var C = -1, E = 0, _ = w; _ < T; _++) {
          var S = this.getRawIndex(_), b = a[S];
          if (isNaN(b)) {
            E++, C < 0 && (C = S);
            continue;
          }
          h = Math.abs((M - g) * (b - D) - (M - _) * (y - D)), h > f && (f = h, c = S);
        }
        E > 0 && E < T - w && (v[s++] = Math.min(C, c), c = Math.max(C, c)), v[s++] = c, l = c;
      }
      return v[s++] = this.getRawIndex(o - 1), n._count = s, n._indices = v, n.getRawIndex = this._getRawIdx, n;
    }, t.prototype.minmaxDownSample = function(e, r) {
      for (var n = this.clone([e], !0), i = n._chunks, a = Math.floor(1 / r), o = i[e], s = this.count(), u = new (Kn(this._rawCount))(Math.ceil(s / a) * 2), l = 0, f = 0; f < s; f += a) {
        var h = f, c = o[this.getRawIndex(h)], v = f, d = o[this.getRawIndex(v)], p = a;
        f + a > s && (p = s - f);
        for (var m = 0; m < p; m++) {
          var g = this.getRawIndex(f + m), y = o[g];
          y < c && (c = y, h = f + m), y > d && (d = y, v = f + m);
        }
        var _ = this.getRawIndex(h), S = this.getRawIndex(v);
        h < v ? (u[l++] = _, u[l++] = S) : (u[l++] = S, u[l++] = _);
      }
      return n._count = l, n._indices = u, n._updateGetRawIdx(), n;
    }, t.prototype.downSample = function(e, r, n, i) {
      for (var a = this.clone([e], !0), o = a._chunks, s = [], u = Math.floor(1 / r), l = o[e], f = this.count(), h = a._rawExtent[e] = St(), c = new (Kn(this._rawCount))(Math.ceil(f / u)), v = 0, d = 0; d < f; d += u) {
        u > f - d && (u = f - d, s.length = u);
        for (var p = 0; p < u; p++) {
          var m = this.getRawIndex(d + p);
          s[p] = l[m];
        }
        var g = n(s), y = this.getRawIndex(Math.min(d + i(s, g) || 0, f - 1));
        l[y] = g, g < h[0] && (h[0] = g), g > h[1] && (h[1] = g), c[v++] = y;
      }
      return a._count = v, a._indices = c, a._updateGetRawIdx(), a;
    }, t.prototype.each = function(e, r) {
      if (this._count)
        for (var n = e.length, i = this._chunks, a = 0, o = this.count(); a < o; a++) {
          var s = this.getRawIndex(a);
          switch (n) {
            case 0:
              r(a);
              break;
            case 1:
              r(i[e[0]][s], a);
              break;
            case 2:
              r(i[e[0]][s], i[e[1]][s], a);
              break;
            default:
              for (var u = 0, l = []; u < n; u++)
                l[u] = i[e[u]][s];
              l[u] = a, r.apply(null, l);
          }
        }
    }, t.prototype.getDataExtent = function(e, r) {
      var n = this._chunks[e], i = St();
      if (!n)
        return i;
      var a = this.count(), o = !this._indices && !r;
      if (o)
        return this._rawExtent[e].slice();
      var s = this._extent, u = s[e] || (s[e] = {}), l = HD(r), f = l.key, h = u[f];
      if (h)
        return h.slice();
      for (var c = i[0], v = i[1], d = 0; d < a; d++) {
        var p = this.getRawIndex(d), m = n[p];
        (!r || GD(l, m)) && (m < c && (c = m), m > v && (v = m));
      }
      return u[f] = [c, v];
    }, t.prototype.getRawDataItem = function(e) {
      var r = this.getRawIndex(e);
      if (this._provider.persistent)
        return this._provider.getItem(r);
      for (var n = [], i = this._chunks, a = 0; a < i.length; a++)
        n.push(i[a][r]);
      return n;
    }, t.prototype.clone = function(e, r) {
      var n = new t(), i = this._chunks, a = e && ki(e, function(s, u) {
        return s[u] = !0, s;
      }, {});
      if (a)
        for (var o = 0; o < i.length; o++)
          n._chunks[o] = a[o] ? eM(i[o]) : i[o];
      else
        n._chunks = i;
      return this._copyCommonProps(n), r || (n._indices = this._cloneIndices()), n._updateGetRawIdx(), n;
    }, t.prototype._copyCommonProps = function(e) {
      e._count = this._count, e._rawCount = this._rawCount, e._provider = this._provider, e._dimensions = this._dimensions, e._extent = ae(this._extent), e._rawExtent = ae(this._rawExtent);
    }, t.prototype._cloneIndices = function() {
      if (this._indices) {
        var e = this._indices.constructor, r = void 0;
        if (e === Array) {
          var n = this._indices.length;
          r = new e(n);
          for (var i = 0; i < n; i++)
            r[i] = this._indices[i];
        } else
          r = new e(this._indices);
        return r;
      }
      return null;
    }, t.prototype._getRawIdxIdentity = function(e) {
      return e;
    }, t.prototype._getRawIdx = function(e) {
      return e < this._count && e >= 0 ? this._indices[e] : -1;
    }, t.prototype._updateGetRawIdx = function() {
      this.getRawIndex = this._indices ? this._getRawIdx : this._getRawIdxIdentity;
    }, t.internalField = function() {
      function e(r, n, i, a) {
        return Ts(r[a], this._dimensions[a]);
      }
      ef = {
        arrayRows: e,
        objectRows: function(r, n, i, a) {
          return Ts(r[n], this._dimensions[a]);
        },
        keyedColumns: e,
        original: function(r, n, i, a) {
          var o = r && (r.value == null ? r : r.value);
          return Ts(o instanceof Array ? o[a] : o, this._dimensions[a]);
        },
        typedArray: function(r, n, i, a) {
          return r[a];
        }
      };
    }(), t;
  }()
), tM = (
  /** @class */
  function() {
    function t(e) {
      this._sourceList = [], this._storeList = [], this._upstreamSignList = [], this._versionSignBase = 0, this._dirty = !0, this._sourceHost = e;
    }
    return t.prototype.dirty = function() {
      this._setLocalSource([], []), this._storeList = [], this._dirty = !0;
    }, t.prototype._setLocalSource = function(e, r) {
      this._sourceList = e, this._upstreamSignList = r, this._versionSignBase++, this._versionSignBase > 9e10 && (this._versionSignBase = 0);
    }, t.prototype._getVersionSign = function() {
      return this._sourceHost.uid + "_" + this._versionSignBase;
    }, t.prototype.prepareSource = function() {
      this._isDirty() && (this._createSource(), this._dirty = !1);
    }, t.prototype._createSource = function() {
      this._setLocalSource([], []);
      var e = this._sourceHost, r = this._getUpstreamSourceManagers(), n = !!r.length, i, a;
      if (ji(e)) {
        var o = e, s = void 0, u = void 0, l = void 0;
        if (n) {
          var f = r[0];
          f.prepareSource(), l = f.getSource(), s = l.data, u = l.sourceFormat, a = [f._getVersionSign()];
        } else
          s = o.get("data", !0), u = je(s) ? pr : ft, a = [];
        var h = this._getSourceMetaRawOption() || {}, c = l && l.metaRawOption || {}, v = W(h.seriesLayoutBy, c.seriesLayoutBy) || null, d = W(h.sourceHeader, c.sourceHeader), p = W(h.dimensions, c.dimensions), m = v !== c.seriesLayoutBy || !!d != !!c.sourceHeader || p;
        i = m ? [Sh(s, {
          seriesLayoutBy: v,
          sourceHeader: d,
          dimensions: p
        }, u)] : [];
      } else {
        var g = e;
        if (n) {
          var y = this._applyTransform(r);
          i = y.sourceList, a = y.upstreamSignList;
        } else {
          var _ = g.get("source", !0);
          i = [Sh(_, this._getSourceMetaRawOption(), null)], a = [];
        }
      }
      process.env.NODE_ENV !== "production" && N(i && a), this._setLocalSource(i, a);
    }, t.prototype._applyTransform = function(e) {
      var r = this._sourceHost, n = r.get("transform", !0), i = r.get("fromTransformResult", !0);
      if (process.env.NODE_ENV !== "production" && N(i != null || n != null), i != null) {
        var a = "";
        e.length !== 1 && (process.env.NODE_ENV !== "production" && (a = "When using `fromTransformResult`, there should be only one upstream dataset"), Rp(a));
      }
      var o, s = [], u = [];
      return x(e, function(l) {
        l.prepareSource();
        var f = l.getSource(i || 0), h = "";
        i != null && !f && (process.env.NODE_ENV !== "production" && (h = "Can not retrieve result by `fromTransformResult`: " + i), Rp(h)), s.push(f), u.push(l._getVersionSign());
      }), n ? o = KD(n, s, {
        datasetIndex: r.componentIndex
      }) : i != null && (o = [ID(s[0])]), {
        sourceList: o,
        upstreamSignList: u
      };
    }, t.prototype._isDirty = function() {
      if (this._dirty)
        return !0;
      for (var e = this._getUpstreamSourceManagers(), r = 0; r < e.length; r++) {
        var n = e[r];
        if (
          // Consider the case that there is ancestor diry, call it recursively.
          // The performance is probably not an issue because usually the chain is not long.
          n._isDirty() || this._upstreamSignList[r] !== n._getVersionSign()
        )
          return !0;
      }
    }, t.prototype.getSource = function(e) {
      e = e || 0;
      var r = this._sourceList[e];
      if (!r) {
        var n = this._getUpstreamSourceManagers();
        return n[0] && n[0].getSource(e);
      }
      return r;
    }, t.prototype.getSharedDataStore = function(e) {
      process.env.NODE_ENV !== "production" && N(ji(this._sourceHost), "Can only call getDataStore on series source manager.");
      var r = e.makeStoreSchema();
      return this._innerGetDataStore(r.dimensions, e.source, r.hash);
    }, t.prototype._innerGetDataStore = function(e, r, n) {
      var i = 0, a = this._storeList, o = a[i];
      o || (o = a[i] = {});
      var s = o[n];
      if (!s) {
        var u = this._getUpstreamSourceManagers()[0];
        ji(this._sourceHost) && u ? s = u._innerGetDataStore(e, r, n) : (s = new bh(), s.initData(new r_(r, e.length), e)), o[n] = s;
      }
      return s;
    }, t.prototype._getUpstreamSourceManagers = function() {
      var e = this._sourceHost;
      if (ji(e)) {
        var r = q0(e);
        return r ? [r.getSourceManager()] : [];
      } else
        return X(rD(e), function(n) {
          return n.getSourceManager();
        });
    }, t.prototype._getSourceMetaRawOption = function() {
      var e = this._sourceHost, r, n, i;
      if (ji(e))
        r = e.get("seriesLayoutBy", !0), n = e.get("sourceHeader", !0), i = e.get("dimensions", !0);
      else if (!this._getUpstreamSourceManagers().length) {
        var a = e;
        r = a.get("seriesLayoutBy", !0), n = a.get("sourceHeader", !0), i = a.get("dimensions", !0);
      }
      return {
        seriesLayoutBy: r,
        sourceHeader: n,
        dimensions: i
      };
    }, t;
  }()
);
function ji(t) {
  return t.mainType === "series";
}
function Rp(t) {
  throw new Error(t);
}
var rM = "line-height:1";
function l_(t) {
  var e = t.lineHeight;
  return e == null ? rM : "line-height:" + $e(e + "") + "px";
}
function f_(t, e) {
  var r = t.color || G.color.tertiary, n = t.fontSize || 12, i = t.fontWeight || "400", a = t.color || G.color.secondary, o = t.fontSize || 14, s = t.fontWeight || "900";
  return e === "html" ? {
    // eslint-disable-next-line max-len
    nameStyle: "font-size:" + $e(n + "") + "px;color:" + $e(r) + ";font-weight:" + $e(i + ""),
    // eslint-disable-next-line max-len
    valueStyle: "font-size:" + $e(o + "") + "px;color:" + $e(a) + ";font-weight:" + $e(s + "")
  } : {
    nameStyle: {
      fontSize: n,
      fill: r,
      fontWeight: i
    },
    valueStyle: {
      fontSize: o,
      fill: a,
      fontWeight: s
    }
  };
}
var nM = [0, 10, 20, 30], iM = ["", `
`, `

`, `


`];
function $a(t, e) {
  return e.type = t, e;
}
function wh(t) {
  return t.type === "section";
}
function h_(t) {
  return wh(t) ? aM : oM;
}
function c_(t) {
  if (wh(t)) {
    var e = 0, r = t.blocks.length, n = r > 1 || r > 0 && !t.noHeader;
    return x(t.blocks, function(i) {
      var a = c_(i);
      a >= e && (e = a + +(n && // 0 always can not be readable gap level.
      (!a || wh(i) && !i.noHeader)));
    }), e;
  }
  return 0;
}
function aM(t, e, r, n) {
  var i = e.noHeader, a = sM(c_(e)), o = [], s = e.blocks || [];
  N(!s || H(s)), s = s || [];
  var u = t.orderMode;
  if (e.sortBlocks && u) {
    s = s.slice();
    var l = {
      valueAsc: "asc",
      valueDesc: "desc"
    };
    if (at(l, u)) {
      var f = new zD(l[u], null);
      s.sort(function(p, m) {
        return f.evaluate(p.sortParam, m.sortParam);
      });
    } else u === "seriesDesc" && s.reverse();
  }
  x(s, function(p, m) {
    var g = e.valueFormatter, y = h_(p)(
      // Inherit valueFormatter
      g ? R(R({}, t), {
        valueFormatter: g
      }) : t,
      p,
      m > 0 ? a.html : 0,
      n
    );
    y != null && o.push(y);
  });
  var h = t.renderMode === "richText" ? o.join(a.richText) : Th(n, o.join(""), i ? r : a.html);
  if (i)
    return h;
  var c = _h(e.header, "ordinal", t.useUTC), v = f_(n, t.renderMode).nameStyle, d = l_(n);
  return t.renderMode === "richText" ? v_(t, c, v) + a.richText + h : Th(n, '<div style="' + v + ";" + d + ';">' + $e(c) + "</div>" + h, r);
}
function oM(t, e, r, n) {
  var i = t.renderMode, a = e.noName, o = e.noValue, s = !e.markerType, u = e.name, l = t.useUTC, f = e.valueFormatter || t.valueFormatter || function(S) {
    return S = H(S) ? S : [S], X(S, function(b, w) {
      return _h(b, H(v) ? v[w] : v, l);
    });
  };
  if (!(a && o)) {
    var h = s ? "" : t.markupStyleCreator.makeTooltipMarker(e.markerType, e.markerColor || G.color.secondary, i), c = a ? "" : _h(u, "ordinal", l), v = e.valueType, d = o ? [] : f(e.value, e.rawDataIndex), p = !s || !a, m = !s && a, g = f_(n, i), y = g.nameStyle, _ = g.valueStyle;
    return i === "richText" ? (s ? "" : h) + (a ? "" : v_(t, c, y)) + (o ? "" : fM(t, d, p, m, _)) : Th(n, (s ? "" : h) + (a ? "" : uM(c, !s, y)) + (o ? "" : lM(d, p, m, _)), r);
  }
}
function kp(t, e, r, n, i, a) {
  if (t) {
    var o = h_(t), s = {
      useUTC: i,
      renderMode: r,
      orderMode: n,
      markupStyleCreator: e,
      valueFormatter: t.valueFormatter
    };
    return o(s, t, 0, a);
  }
}
function sM(t) {
  return {
    html: nM[t],
    richText: iM[t]
  };
}
function Th(t, e, r) {
  var n = '<div style="clear:both"></div>', i = "margin: " + r + "px 0 0", a = l_(t);
  return '<div style="' + i + ";" + a + ';">' + e + n + "</div>";
}
function uM(t, e, r) {
  var n = e ? "margin-left:2px" : "";
  return '<span style="' + r + ";" + n + '">' + $e(t) + "</span>";
}
function lM(t, e, r, n) {
  var i = r ? "10px" : "20px", a = e ? "float:right;margin-left:" + i : "";
  return t = H(t) ? t : [t], '<span style="' + a + ";" + n + '">' + X(t, function(o) {
    return $e(o);
  }).join("&nbsp;&nbsp;") + "</span>";
}
function v_(t, e, r) {
  return t.markupStyleCreator.wrapRichTextStyle(e, r);
}
function fM(t, e, r, n, i) {
  var a = [i], o = n ? 10 : 20;
  return r && a.push({
    padding: [0, 0, 0, o],
    align: "right"
  }), t.markupStyleCreator.wrapRichTextStyle(H(e) ? e.join("  ") : e, a);
}
function hM(t, e) {
  var r = t.getData().getItemVisual(e, "style"), n = r[t.visualDrawType];
  return kn(n);
}
function d_(t, e) {
  var r = t.get("padding");
  return r ?? (e === "richText" ? [8, 10] : 10);
}
var tf = (
  /** @class */
  function() {
    function t() {
      this.richTextStyles = {}, this._nextStyleNameId = fc();
    }
    return t.prototype._generateStyleName = function() {
      return "__EC_aUTo_" + this._nextStyleNameId++;
    }, t.prototype.makeTooltipMarker = function(e, r, n) {
      var i = n === "richText" ? this._generateStyleName() : null, a = zC({
        color: r,
        type: e,
        renderMode: n,
        markerId: i
      });
      return z(a) ? a : (process.env.NODE_ENV !== "production" && N(i), this.richTextStyles[i] = a.style, a.content);
    }, t.prototype.wrapRichTextStyle = function(e, r) {
      var n = {};
      H(r) ? x(r, function(a) {
        return R(n, a);
      }) : R(n, r);
      var i = this._generateStyleName();
      return this.richTextStyles[i] = n, "{" + i + "|" + e + "}";
    }, t;
  }()
);
function cM(t) {
  var e = t.series, r = t.dataIndex, n = t.multipleSeries, i = e.getData(), a = i.mapDimensionsAll("defaultedTooltip"), o = a.length, s = e.getRawValue(r), u = H(s), l = hM(e, r), f, h, c, v;
  if (o > 1 || u && !o) {
    var d = vM(s, e, r, a, l);
    f = d.inlineValues, h = d.inlineValueTypes, c = d.blocks, v = d.inlineValues[0];
  } else if (o) {
    var p = i.getDimensionInfo(a[0]);
    v = f = Oi(i, r, a[0]), h = p.type;
  } else
    v = f = u ? s[0] : s;
  var m = hc(e), g = m && e.name || "", y = i.getName(r), _ = n ? g : y;
  return $a("section", {
    header: g,
    // When series name is not specified, do not show a header line with only '-'.
    // This case always happens in tooltip.trigger: 'item'.
    noHeader: n || !m,
    sortParam: v,
    blocks: [$a("nameValue", {
      markerType: "item",
      markerColor: l,
      // Do not mix display seriesName and itemName in one tooltip,
      // which might confuses users.
      name: _,
      // name dimension might be auto assigned, where the name might
      // be not readable. So we check trim here.
      noName: !Yt(_),
      value: f,
      valueType: h,
      rawDataIndex: i.getRawIndex(r)
    })].concat(c || [])
  });
}
function vM(t, e, r, n, i) {
  var a = e.getData(), o = ki(t, function(h, c, v) {
    var d = a.getDimensionInfo(v);
    return h = h || d && d.tooltip !== !1 && d.displayName != null;
  }, !1), s = [], u = [], l = [];
  n.length ? x(n, function(h) {
    f(Oi(a, r, h), h);
  }) : x(t, f);
  function f(h, c) {
    var v = a.getDimensionInfo(c);
    !v || v.otherDims.tooltip === !1 || (o ? l.push($a("nameValue", {
      markerType: "subItem",
      markerColor: i,
      name: v.displayName,
      value: h,
      valueType: v.type
    })) : (s.push(h), u.push(v.type)));
  }
  return {
    inlineValues: s,
    inlineValueTypes: u,
    blocks: l
  };
}
var Tr = ve();
function Zo(t, e) {
  return t.getName(e) || t.getId(e);
}
var dM = "__universalTransitionEnabled", Wr = (
  /** @class */
  function(t) {
    V(e, t);
    function e() {
      var r = t !== null && t.apply(this, arguments) || this;
      return r._selectedDataIndicesMap = {}, r;
    }
    return e.prototype.init = function(r, n, i) {
      this.seriesIndex = this.componentIndex, this.dataTask = Pa({
        count: gM,
        reset: mM
      }), this.dataTask.context = {
        model: this
      }, this.mergeDefaultAndTheme(r, i);
      var a = Tr(this).sourceManager = new tM(this);
      a.prepareSource();
      var o = this.getInitialData(r, i);
      Vp(o, this), this.dataTask.context.data = o, process.env.NODE_ENV !== "production" && N(o, "getInitialData returned invalid data."), Tr(this).dataBeforeProcessed = o, Bp(this), this._initSelectedMapFromData(o);
    }, e.prototype.mergeDefaultAndTheme = function(r, n) {
      var i = Xa(this), a = i ? Hi(r) : {}, o = this.subType;
      ce.hasClass(o) && (o += "Series"), Se(r, n.getTheme().get(this.subType)), Se(r, this.getDefaultOption()), pd(r, "label", ["show"]), this.fillDataTextStyle(r.data), i && Ur(r, a, i);
    }, e.prototype.mergeOption = function(r, n) {
      r = Se(this.option, r, !0), this.fillDataTextStyle(r.data);
      var i = Xa(this);
      i && Ur(this.option, r, i);
      var a = Tr(this).sourceManager;
      a.dirty(), a.prepareSource();
      var o = this.getInitialData(r, n);
      Vp(o, this), this.dataTask.dirty(), this.dataTask.context.data = o, Tr(this).dataBeforeProcessed = o, Bp(this), this._initSelectedMapFromData(o);
    }, e.prototype.fillDataTextStyle = function(r) {
      if (r && !je(r))
        for (var n = ["show"], i = 0; i < r.length; i++)
          r[i] && r[i].label && pd(r[i], "label", n);
    }, e.prototype.getInitialData = function(r, n) {
    }, e.prototype.appendData = function(r) {
      var n = this.getRawData();
      n.appendData(r.data);
    }, e.prototype.getData = function(r) {
      var n = xh(this);
      if (n) {
        var i = n.context.data;
        return r == null || !i.getLinkedData ? i : i.getLinkedData(r);
      } else
        return Tr(this).data;
    }, e.prototype.getAllData = function() {
      var r = this.getData();
      return r && r.getLinkedDataAll ? r.getLinkedDataAll() : [{
        data: r
      }];
    }, e.prototype.setData = function(r) {
      var n = xh(this);
      if (n) {
        var i = n.context;
        i.outputData = r, n !== this.dataTask && (i.data = r);
      }
      Tr(this).data = r;
    }, e.prototype.getEncode = function() {
      var r = this.get("encode", !0);
      if (r)
        return Z(r);
    }, e.prototype.getSourceManager = function() {
      return Tr(this).sourceManager;
    }, e.prototype.getSource = function() {
      return this.getSourceManager().getSource();
    }, e.prototype.getRawData = function() {
      return Tr(this).dataBeforeProcessed;
    }, e.prototype.getColorBy = function() {
      var r = this.get("colorBy");
      return r || "series";
    }, e.prototype.isColorBySeries = function() {
      return this.getColorBy() === "series";
    }, e.prototype.getBaseAxis = function() {
      var r = this.coordinateSystem;
      return r && r.getBaseAxis && r.getBaseAxis();
    }, e.prototype.indicesOfNearest = function(r, n, i, a) {
      var o = this.getData(), s = this.coordinateSystem, u = s && s.getAxis(r);
      if (!s || !u)
        return [];
      var l = u.dataToCoord(i);
      a == null && (a = 1 / 0);
      for (var f = [], h = 1 / 0, c = -1, v = 0, d = o.getDimensionIndex(n), p = o.getStore(), m = 0, g = p.count(); m < g; m++) {
        var y = p.get(d, m), _ = u.dataToCoord(y), S = l - _, b = Math.abs(S);
        b <= a && ((b < h || b === h && S >= 0 && c < 0) && (h = b, c = S, v = 0), S === c && (f[v++] = m));
      }
      return f.length = v, f;
    }, e.prototype.formatTooltip = function(r, n, i) {
      return cM({
        series: this,
        dataIndex: r,
        multipleSeries: n
      });
    }, e.prototype.isAnimationEnabled = function() {
      var r = this.ecModel;
      if (re.node && !(r && r.ssr))
        return !1;
      var n = this.getShallow("animation");
      return n && this.getData().count() > this.getShallow("animationThreshold") && (n = !1), !!n;
    }, e.prototype.restoreData = function() {
      this.dataTask.dirty();
    }, e.prototype.getColorFromPalette = function(r, n, i) {
      var a = this.ecModel, o = Kc.prototype.getColorFromPalette.call(this, r, n, i);
      return o || (o = a.getColorFromPalette(r, n, i)), o;
    }, e.prototype.coordDimToDataDim = function(r) {
      return this.getRawData().mapDimensionsAll(r);
    }, e.prototype.getProgressive = function() {
      return this.get("progressive");
    }, e.prototype.getProgressiveThreshold = function() {
      return this.get("progressiveThreshold");
    }, e.prototype.select = function(r, n) {
      this._innerSelect(this.getData(n), r);
    }, e.prototype.unselect = function(r, n) {
      var i = this.option.selectedMap;
      if (i) {
        var a = this.option.selectedMode, o = this.getData(n);
        if (a === "series" || i === "all") {
          this.option.selectedMap = {}, this._selectedDataIndicesMap = {};
          return;
        }
        for (var s = 0; s < r.length; s++) {
          var u = r[s], l = Zo(o, u);
          i[l] = !1, this._selectedDataIndicesMap[l] = -1;
        }
      }
    }, e.prototype.toggleSelect = function(r, n) {
      for (var i = [], a = 0; a < r.length; a++)
        i[0] = r[a], this.isSelected(r[a], n) ? this.unselect(i, n) : this.select(i, n);
    }, e.prototype.getSelectedDataIndices = function() {
      if (this.option.selectedMap === "all")
        return [].slice.call(this.getData().getIndices());
      for (var r = this._selectedDataIndicesMap, n = le(r), i = [], a = 0; a < n.length; a++) {
        var o = r[n[a]];
        o >= 0 && i.push(o);
      }
      return i;
    }, e.prototype.isSelected = function(r, n) {
      var i = this.option.selectedMap;
      if (!i)
        return !1;
      var a = this.getData(n);
      return (i === "all" || i[Zo(a, r)]) && !a.getItemModel(r).get(["select", "disabled"]);
    }, e.prototype.isUniversalTransitionEnabled = function() {
      if (this[dM])
        return !0;
      var r = this.option.universalTransition;
      return r ? r === !0 ? !0 : r && r.enabled : !1;
    }, e.prototype._innerSelect = function(r, n) {
      var i, a, o = this.option, s = o.selectedMode, u = n.length;
      if (!(!s || !u)) {
        if (s === "series")
          o.selectedMap = "all";
        else if (s === "multiple") {
          q(o.selectedMap) || (o.selectedMap = {});
          for (var l = o.selectedMap, f = 0; f < u; f++) {
            var h = n[f], c = Zo(r, h);
            l[c] = !0, this._selectedDataIndicesMap[c] = r.getRawIndex(h);
          }
        } else if (s === "single" || s === !0) {
          var v = n[u - 1], c = Zo(r, v);
          o.selectedMap = (i = {}, i[c] = !0, i), this._selectedDataIndicesMap = (a = {}, a[c] = r.getRawIndex(v), a);
        }
      }
    }, e.prototype._initSelectedMapFromData = function(r) {
      if (!this.option.selectedMap) {
        var n = [];
        r.hasItemOption && r.each(function(i) {
          var a = r.getRawDataItem(i);
          a && a.selected && n.push(i);
        }), n.length > 0 && this._innerSelect(r, n);
      }
    }, e.registerClass = function(r) {
      return ce.registerClass(r);
    }, e.protoInitialize = function() {
      var r = e.prototype;
      r.type = "series.__base__", r.seriesIndex = 0, r.ignoreStyleOnData = !1, r.hasSymbolVisual = !1, r.defaultSymbol = "circle", r.visualStyleAccessPath = "itemStyle", r.visualDrawType = "fill";
    }(), e;
  }(ce)
);
ir(Wr, VD);
ir(Wr, Kc);
Fy(Wr, ce);
function Bp(t) {
  var e = t.name;
  hc(t) || (t.name = pM(t) || e);
}
function pM(t) {
  var e = t.getRawData(), r = e.mapDimensionsAll("seriesName"), n = [];
  return x(r, function(i) {
    var a = e.getDimensionInfo(i);
    a.displayName && n.push(a.displayName);
  }), n.join(" ");
}
function gM(t) {
  return t.model.getRawData().count();
}
function mM(t) {
  var e = t.model;
  return e.setData(e.getRawData().cloneShallow()), yM;
}
function yM(t, e) {
  e.outputData && t.end > e.outputData.count() && e.model.getRawData().cloneShallow(e.outputData);
}
function Vp(t, e) {
  x(US(t.CHANGABLE_METHODS, t.DOWNSAMPLE_METHODS), function(r) {
    t.wrapMethod(r, Ae(_M, e));
  });
}
function _M(t, e) {
  var r = xh(t);
  return r && r.setOutputEnd((e || this).count()), e;
}
function xh(t) {
  var e = (t.ecModel || {}).scheduler, r = e && e.getPipeline(t.uid);
  if (r) {
    var n = r.currentTask;
    if (n) {
      var i = n.agentStubMap;
      i && (n = i.get(t.uid));
    }
    return n;
  }
}
var Pt = (
  /** @class */
  function() {
    function t() {
      this.group = new Re(), this.uid = Hu("viewComponent");
    }
    return t.prototype.init = function(e, r) {
    }, t.prototype.render = function(e, r, n, i) {
    }, t.prototype.dispose = function(e, r) {
    }, t.prototype.updateView = function(e, r, n, i) {
    }, t.prototype.updateLayout = function(e, r, n, i) {
    }, t.prototype.updateVisual = function(e, r, n, i) {
    }, t.prototype.toggleBlurSeries = function(e, r, n) {
    }, t.prototype.eachRendered = function(e) {
      var r = this.group;
      r && r.traverse(e);
    }, t;
  }()
);
pc(Pt);
Eu(Pt);
function p_() {
  var t = ve();
  return function(e) {
    var r = t(e), n = e.pipelineContext, i = !!r.large, a = !!r.progressiveRender, o = r.large = !!(n && n.large), s = r.progressiveRender = !!(n && n.progressiveRender);
    return (i !== o || a !== s) && "reset";
  };
}
var g_ = ve(), SM = p_(), Jt = (
  /** @class */
  function() {
    function t() {
      this.group = new Re(), this.uid = Hu("viewChart"), this.renderTask = Pa({
        plan: bM,
        reset: wM
      }), this.renderTask.context = {
        view: this
      };
    }
    return t.prototype.init = function(e, r) {
    }, t.prototype.render = function(e, r, n, i) {
      if (process.env.NODE_ENV !== "production")
        throw new Error("render method must been implemented");
    }, t.prototype.highlight = function(e, r, n, i) {
      var a = e.getData(i && i.dataType);
      if (!a) {
        process.env.NODE_ENV !== "production" && he("Unknown dataType " + i.dataType);
        return;
      }
      zp(a, i, "emphasis");
    }, t.prototype.downplay = function(e, r, n, i) {
      var a = e.getData(i && i.dataType);
      if (!a) {
        process.env.NODE_ENV !== "production" && he("Unknown dataType " + i.dataType);
        return;
      }
      zp(a, i, "normal");
    }, t.prototype.remove = function(e, r) {
      this.group.removeAll();
    }, t.prototype.dispose = function(e, r) {
    }, t.prototype.updateView = function(e, r, n, i) {
      this.render(e, r, n, i);
    }, t.prototype.updateVisual = function(e, r, n, i) {
      this.render(e, r, n, i);
    }, t.prototype.eachRendered = function(e) {
      Ic(this.group, e);
    }, t.markUpdateMethod = function(e, r) {
      g_(e).updateMethod = r;
    }, t.protoInitialize = function() {
      var e = t.prototype;
      e.type = "chart";
    }(), t;
  }()
);
function Fp(t, e, r) {
  t && Ai(t) && (e === "emphasis" ? Us : Ws)(t, r);
}
function zp(t, e, r) {
  var n = Pn(t, e), i = e && e.highlightKey != null ? vx(e.highlightKey) : null;
  n != null ? x(Qe(n), function(a) {
    Fp(t.getItemGraphicEl(a), r, i);
  }) : t.eachItemGraphicEl(function(a) {
    Fp(a, r, i);
  });
}
pc(Jt, ["dispose"]);
Eu(Jt);
function bM(t) {
  return SM(t.model);
}
function wM(t) {
  var e = t.model, r = t.ecModel, n = t.api, i = t.payload, a = e.pipelineContext.progressiveRender, o = t.view, s = i && g_(i).updateMethod, u = a ? "incrementalPrepareRender" : s && o[s] ? s : "render";
  return u !== "render" && o[u](e, r, n, i), TM[u];
}
var TM = {
  incrementalPrepareRender: {
    progress: function(t, e) {
      e.view.incrementalRender(t, e.model, e.ecModel, e.api, e.payload);
    }
  },
  render: {
    // Put view.render in `progress` to support appendData. But in this case
    // view.render should not be called in reset, otherwise it will be called
    // twise. Use `forceFirstProgress` to make sure that view.render is called
    // in any cases.
    forceFirstProgress: !0,
    progress: function(t, e) {
      e.view.render(e.model, e.ecModel, e.api, e.payload);
    }
  }
}, Qs = "\0__throttleOriginMethod", Hp = "\0__throttleRate", Gp = "\0__throttleType";
function m_(t, e, r) {
  var n, i = 0, a = 0, o = null, s, u, l, f;
  e = e || 0;
  function h() {
    a = (/* @__PURE__ */ new Date()).getTime(), o = null, t.apply(u, l || []);
  }
  var c = function() {
    for (var v = [], d = 0; d < arguments.length; d++)
      v[d] = arguments[d];
    n = (/* @__PURE__ */ new Date()).getTime(), u = this, l = v;
    var p = f || e, m = f || r;
    f = null, s = n - (m ? i : a) - p, clearTimeout(o), m ? o = setTimeout(h, p) : s >= 0 ? h() : o = setTimeout(h, -s), i = n;
  };
  return c.clear = function() {
    o && (clearTimeout(o), o = null);
  }, c.debounceNextCall = function(v) {
    f = v;
  }, c;
}
function Xu(t, e, r, n) {
  var i = t[e];
  if (i) {
    var a = i[Qs] || i, o = i[Gp], s = i[Hp];
    if (s !== r || o !== n) {
      if (r == null || !n)
        return t[e] = a;
      i = t[e] = m_(a, r, n === "debounce"), i[Qs] = a, i[Gp] = n, i[Hp] = r;
    }
    return i;
  }
}
function js(t, e) {
  var r = t[e];
  r && r[Qs] && (r.clear && r.clear(), t[e] = r[Qs]);
}
var Up = ve(), Wp = {
  itemStyle: Fa(I0, !0),
  lineStyle: Fa(A0, !0)
}, xM = {
  lineStyle: "stroke",
  itemStyle: "fill"
};
function y_(t, e) {
  var r = t.visualStyleMapper || Wp[e];
  return r || (console.warn("Unknown style type '" + e + "'."), Wp.itemStyle);
}
function __(t, e) {
  var r = t.visualDrawType || xM[e];
  return r || (console.warn("Unknown style type '" + e + "'."), "fill");
}
var CM = {
  createOnAllSeries: !0,
  performRawSeries: !0,
  reset: function(t, e) {
    var r = t.getData(), n = t.visualStyleAccessPath || "itemStyle", i = t.getModel(n), a = y_(t, n), o = a(i), s = i.getShallow("decal");
    s && (r.setVisual("decal", s), s.dirty = !0);
    var u = __(t, n), l = o[u], f = Q(l) ? l : null, h = o.fill === "auto" || o.stroke === "auto";
    if (!o[u] || f || h) {
      var c = t.getColorFromPalette(
        // TODO series count changed.
        t.name,
        null,
        e.getSeriesCount()
      );
      o[u] || (o[u] = c, r.setVisual("colorFromPalette", !0)), o.fill = o.fill === "auto" || Q(o.fill) ? c : o.fill, o.stroke = o.stroke === "auto" || Q(o.stroke) ? c : o.stroke;
    }
    if (r.setVisual("style", o), r.setVisual("drawType", u), !e.isSeriesFiltered(t) && f)
      return r.setVisual("colorFromPalette", !1), {
        dataEach: function(v, d) {
          var p = t.getDataParams(d), m = R({}, o);
          m[u] = f(p), v.setItemVisual(d, "style", m);
        }
      };
  }
}, Ji = new xe(), DM = {
  createOnAllSeries: !0,
  reset: function(t, e) {
    if (!t.ignoreStyleOnData) {
      var r = t.getData(), n = t.visualStyleAccessPath || "itemStyle", i = y_(t, n), a = r.getVisual("drawType");
      return {
        dataEach: r.hasItemOption ? function(o, s) {
          var u = o.getRawDataItem(s);
          if (u && u[n]) {
            Ji.option = u[n];
            var l = i(Ji), f = o.ensureUniqueItemVisual(s, "style");
            R(f, l), Ji.option.decal && (o.setItemVisual(s, "decal", Ji.option.decal), Ji.option.decal.dirty = !0), a in l && o.setItemVisual(s, "colorFromPalette", !1);
          }
        } : null
      };
    }
  }
}, MM = {
  performRawSeries: !0,
  overallReset: function(t) {
    var e = Z();
    t.eachSeries(function(r) {
      if (!r.isColorBySeries()) {
        var n = r.type + "-" + r.getColorBy();
        Up(r).scope = e.get(n) || e.set(n, {});
      }
    }), t.eachSeries(function(r) {
      if (!r.isColorBySeries()) {
        var n = r.getRawData(), i = {}, a = r.getData(), o = Up(r).scope, s = r.visualStyleAccessPath || "itemStyle", u = __(r, s);
        a.each(function(l) {
          var f = a.getRawIndex(l);
          i[f] = l;
        }), n.each(function(l) {
          var f = i[l], h = a.getItemVisual(f, "colorFromPalette");
          if (h) {
            var c = a.ensureUniqueItemVisual(f, "style"), v = n.getName(l) || l + "", d = n.count();
            c[u] = r.getColorFromPalette(v, o, d);
          }
        });
      }
    });
  }
}, $o = Math.PI;
function EM(t, e) {
  e = e || {}, ge(e, {
    text: "loading",
    textColor: G.color.primary,
    fontSize: 12,
    fontWeight: "normal",
    fontStyle: "normal",
    fontFamily: "sans-serif",
    maskColor: "rgba(255,255,255,0.8)",
    showSpinner: !0,
    color: G.color.theme[0],
    spinnerRadius: 10,
    lineWidth: 5,
    zlevel: 0
  });
  var r = new Re(), n = new Ce({
    style: {
      fill: e.maskColor
    },
    zlevel: e.zlevel,
    z: 1e4
  });
  r.add(n);
  var i = new Je({
    style: {
      text: e.text,
      fill: e.textColor,
      fontSize: e.fontSize,
      fontWeight: e.fontWeight,
      fontStyle: e.fontStyle,
      fontFamily: e.fontFamily
    },
    zlevel: e.zlevel,
    z: 10001
  }), a = new Ce({
    style: {
      fill: "none"
    },
    textContent: i,
    textConfig: {
      position: "right",
      distance: 10
    },
    zlevel: e.zlevel,
    z: 10001
  });
  r.add(a);
  var o;
  return e.showSpinner && (o = new Vu({
    shape: {
      startAngle: -$o / 2,
      endAngle: -$o / 2 + 0.1,
      r: e.spinnerRadius
    },
    style: {
      stroke: e.color,
      lineCap: "round",
      lineWidth: e.lineWidth
    },
    zlevel: e.zlevel,
    z: 10001
  }), o.animateShape(!0).when(1e3, {
    endAngle: $o * 3 / 2
  }).start("circularInOut"), o.animateShape(!0).when(1e3, {
    startAngle: $o * 3 / 2
  }).delay(300).start("circularInOut"), r.add(o)), r.resize = function() {
    var s = i.getBoundingRect().width, u = e.showSpinner ? e.spinnerRadius : 0, l = (t.getWidth() - u * 2 - (e.showSpinner && s ? 10 : 0) - s) / 2 - (e.showSpinner && s ? 0 : 5 + s / 2) + (e.showSpinner ? 0 : s / 2) + (s ? 0 : u), f = t.getHeight() / 2;
    e.showSpinner && o.setShape({
      cx: l,
      cy: f
    }), a.setShape({
      x: l - u,
      y: f - u,
      width: u * 2,
      height: u * 2
    }), n.setShape({
      x: 0,
      y: 0,
      width: t.getWidth(),
      height: t.getHeight()
    });
  }, r.resize(), r;
}
var S_ = (
  /** @class */
  function() {
    function t(e, r, n, i) {
      this._stageTaskMap = Z(), this.ecInstance = e, this.api = r, n = this._dataProcessorHandlers = n.slice(), i = this._visualHandlers = i.slice(), this._allHandlers = n.concat(i);
    }
    return t.prototype.restoreData = function(e, r) {
      e.restoreData(r), this._stageTaskMap.each(function(n) {
        var i = n.overallTask;
        i && i.dirty();
      });
    }, t.prototype.getPerformArgs = function(e, r) {
      if (e.__pipeline) {
        var n = this._pipelineMap.get(e.__pipeline.id), i = n.context, a = !r && n.progressiveEnabled && (!i || i.progressiveRender) && e.__idxInPipeline > n.blockIndex, o = a ? n.step : null, s = i && i.modDataCount, u = s != null ? Math.ceil(s / o) : null;
        return {
          step: o,
          modBy: u,
          modDataCount: s
        };
      }
    }, t.prototype.getPipeline = function(e) {
      return this._pipelineMap.get(e);
    }, t.prototype.updateStreamModes = function(e, r) {
      var n = this._pipelineMap.get(e.uid), i = e.__preparePipelineContext ? e.__preparePipelineContext(r, n) : $w(e, r, n);
      e.pipelineContext = n.context = i;
    }, t.prototype.restorePipelines = function(e, r) {
      var n = this, i = n._pipelineMap = Z();
      r.eachSeries(function(a) {
        var o = e.painter.type === "canvas" && a.getProgressive(), s = a.uid;
        i.set(s, {
          id: s,
          head: null,
          tail: null,
          threshold: a.getProgressiveThreshold(),
          progressiveEnabled: o && !(a.preventIncremental && a.preventIncremental()),
          blockIndex: -1,
          step: Math.round(o || 700),
          count: 0
        }), n._pipe(a, a.dataTask);
      });
    }, t.prototype.prepareStageTasks = function() {
      var e = this._stageTaskMap, r = this.api.getModel(), n = this.api;
      x(this._allHandlers, function(i) {
        var a = e.get(i.uid) || e.set(i.uid, {}), o = "";
        process.env.NODE_ENV !== "production" && (o = '"reset" and "overallReset" must not be both specified.'), N(!(i.reset && i.overallReset), o), i.reset && this._createSeriesStageTask(i, a, r, n), i.overallReset && this._createOverallStageTask(i, a, r, n);
      }, this);
    }, t.prototype.prepareView = function(e, r, n, i) {
      var a = e.renderTask, o = a.context;
      o.model = r, o.ecModel = n, o.api = i, a.__block = !e.incrementalPrepareRender, this._pipe(r, a);
    }, t.prototype.performDataProcessorTasks = function(e, r) {
      this._performStageTasks(this._dataProcessorHandlers, e, r, {
        block: !0
      });
    }, t.prototype.performVisualTasks = function(e, r, n) {
      this._performStageTasks(this._visualHandlers, e, r, n);
    }, t.prototype._performStageTasks = function(e, r, n, i) {
      i = i || {};
      var a = !1, o = this;
      x(e, function(u, l) {
        if (!(i.visualType && i.visualType !== u.visualType)) {
          var f = o._stageTaskMap.get(u.uid), h = f.seriesTaskMap, c = f.overallTask;
          if (c) {
            var v, d = c.agentStubMap;
            d.each(function(m) {
              s(i, m) && (m.dirty(), v = !0);
            }), v && c.dirty(), o.updatePayload(c, n);
            var p = o.getPerformArgs(c, i.block);
            d.each(function(m) {
              m.perform(p);
            }), c.perform(p) && (a = !0);
          } else h && h.each(function(m, g) {
            s(i, m) && m.dirty();
            var y = o.getPerformArgs(m, i.block);
            y.skip = !u.performRawSeries && r.isSeriesFiltered(m.context.model), o.updatePayload(m, n), m.perform(y) && (a = !0);
          });
        }
      });
      function s(u, l) {
        return u.setDirty && (!u.dirtyMap || u.dirtyMap.get(l.__pipeline.id));
      }
      this.unfinished = a || this.unfinished;
    }, t.prototype.performSeriesTasks = function(e) {
      var r;
      e.eachSeries(function(n) {
        r = n.dataTask.perform() || r;
      }), this.unfinished = r || this.unfinished;
    }, t.prototype.plan = function() {
      this._pipelineMap.each(function(e) {
        var r = e.tail;
        do {
          if (r.__block) {
            e.blockIndex = r.__idxInPipeline;
            break;
          }
          r = r.getUpstream();
        } while (r);
      });
    }, t.prototype.updatePayload = function(e, r) {
      r !== "remain" && (e.context.payload = r);
    }, t.prototype._createSeriesStageTask = function(e, r, n, i) {
      var a = this, o = r.seriesTaskMap, s = r.seriesTaskMap = Z(), u = e.seriesType, l = e.getTargetSeries;
      e.createOnAllSeries ? n.eachRawSeries(f) : u ? n.eachRawSeriesByType(u, f) : l && l(n, i).each(f);
      function f(h) {
        var c = h.uid, v = s.set(c, o && o.get(c) || Pa({
          plan: PM,
          reset: NM,
          count: kM
        }));
        v.context = {
          model: h,
          ecModel: n,
          api: i,
          // PENDING: `useClearVisual` not used?
          useClearVisual: e.isVisual && !e.isLayout,
          plan: e.plan,
          reset: e.reset,
          scheduler: a
        }, a._pipe(h, v);
      }
    }, t.prototype._createOverallStageTask = function(e, r, n, i) {
      var a = this, o = r.overallTask = r.overallTask || Pa({
        reset: AM
      });
      o.context = {
        ecModel: n,
        api: i,
        overallReset: e.overallReset,
        scheduler: a
      };
      var s = o.agentStubMap, u = o.agentStubMap = Z(), l = e.seriesType, f = e.getTargetSeries, h = e.dirtyOnOverallProgress, c = !1, v = "";
      process.env.NODE_ENV !== "production" && (v = '"createOnAllSeries" is not supported for "overallReset", because it will block all streams.'), N(!e.createOnAllSeries, v), l ? n.eachRawSeriesByType(l, d) : f ? f(n, i).each(d) : x(n.getSeries(), d);
      function d(p) {
        var m = p.uid, g = u.set(m, s && s.get(m) || // When the result of `getTargetSeries` changed, the overallTask
        // should be set as dirty and re-performed.
        (c = !0, Pa({
          reset: IM,
          onDirty: LM
        })));
        g.context = {
          model: p,
          dirtyOnOverallProgress: h
          // FIXME:TS never used, so comment it
          // modifyOutputEnd: modifyOutputEnd
        }, g.agent = o, g.__block = h, a._pipe(p, g);
      }
      c && o.dirty();
    }, t.prototype._pipe = function(e, r) {
      var n = e.uid, i = this._pipelineMap.get(n);
      !i.head && (i.head = r), i.tail && i.tail.pipe(r), i.tail = r, r.__idxInPipeline = i.count++, r.__pipeline = i;
    }, t.wrapStageHandler = function(e, r) {
      return Q(e) && (e = {
        overallReset: e,
        seriesType: BM(e)
      }), e.uid = Hu("stageHandler"), r && (e.visualType = r), e;
    }, t;
  }()
);
function AM(t) {
  t.overallReset(t.ecModel, t.api, t.payload);
}
function IM(t) {
  return t.dirtyOnOverallProgress && OM;
}
function OM() {
  this.agent.dirty(), this.getDownstream().dirty();
}
function LM() {
  this.agent && this.agent.dirty();
}
function PM(t) {
  return t.plan ? t.plan(t.model, t.ecModel, t.api, t.payload) : null;
}
function NM(t) {
  t.useClearVisual && t.data.clearAllVisual();
  var e = t.resetDefines = Qe(t.reset(t.model, t.ecModel, t.api, t.payload));
  return e.length > 1 ? X(e, function(r, n) {
    return b_(n);
  }) : RM;
}
var RM = b_(0);
function b_(t) {
  return function(e, r) {
    var n = r.data, i = r.resetDefines[t];
    if (i && i.dataEach)
      for (var a = e.start; a < e.end; a++)
        i.dataEach(n, a);
    else i && i.progress && i.progress(e, n);
  };
}
function kM(t) {
  return t.data.count();
}
function BM(t) {
  Js = null;
  try {
    t(qa, w_);
  } catch {
  }
  return Js;
}
var qa = {}, w_ = {}, Js;
T_(qa, Qc);
T_(w_, Qy);
qa.eachSeriesByType = qa.eachRawSeriesByType = function(t) {
  Js = t;
};
qa.eachComponent = function(t) {
  t.mainType === "series" && t.subType && (Js = t.subType);
};
function T_(t, e) {
  for (var r in e.prototype)
    t[r] = Fe;
}
var k = G.darkColor, Yp = k.background, ea = function() {
  return {
    axisLine: {
      lineStyle: {
        color: k.axisLine
      }
    },
    splitLine: {
      lineStyle: {
        color: k.axisSplitLine
      }
    },
    splitArea: {
      areaStyle: {
        color: [k.backgroundTint, k.backgroundTransparent]
      }
    },
    minorSplitLine: {
      lineStyle: {
        color: k.axisMinorSplitLine
      }
    },
    axisLabel: {
      color: k.axisLabel
    },
    axisName: {}
  };
}, Xp = {
  label: {
    color: k.secondary
  },
  itemStyle: {
    borderColor: k.borderTint
  },
  dividerLineStyle: {
    color: k.border
  }
}, x_ = {
  darkMode: !0,
  color: k.theme,
  backgroundColor: Yp,
  axisPointer: {
    lineStyle: {
      color: k.border
    },
    crossStyle: {
      color: k.borderShade
    },
    label: {
      color: k.tertiary
    }
  },
  legend: {
    textStyle: {
      color: k.secondary
    },
    pageTextStyle: {
      color: k.tertiary
    }
  },
  textStyle: {
    color: k.secondary
  },
  title: {
    textStyle: {
      color: k.primary
    },
    subtextStyle: {
      color: k.quaternary
    }
  },
  toolbox: {
    iconStyle: {
      borderColor: k.accent50
    },
    feature: {
      dataView: {
        backgroundColor: Yp,
        textColor: k.primary,
        textareaColor: k.background,
        textareaBorderColor: k.border,
        buttonColor: k.accent50,
        buttonTextColor: k.neutral00
      }
    }
  },
  tooltip: {
    backgroundColor: k.neutral20,
    defaultBorderColor: k.border,
    textStyle: {
      color: k.tertiary
    }
  },
  dataZoom: {
    borderColor: k.accent10,
    textStyle: {
      color: k.tertiary
    },
    brushStyle: {
      color: k.backgroundTint
    },
    handleStyle: {
      color: k.neutral00,
      borderColor: k.accent20
    },
    moveHandleStyle: {
      color: k.accent40
    },
    emphasis: {
      handleStyle: {
        borderColor: k.accent50
      }
    },
    dataBackground: {
      lineStyle: {
        color: k.accent30
      },
      areaStyle: {
        color: k.accent20
      }
    },
    selectedDataBackground: {
      lineStyle: {
        color: k.accent50
      },
      areaStyle: {
        color: k.accent30
      }
    }
  },
  visualMap: {
    textStyle: {
      color: k.secondary
    },
    handleStyle: {
      borderColor: k.neutral30
    }
  },
  timeline: {
    lineStyle: {
      color: k.accent10
    },
    label: {
      color: k.tertiary
    },
    controlStyle: {
      color: k.accent30,
      borderColor: k.accent30
    }
  },
  calendar: {
    itemStyle: {
      color: k.neutral00,
      borderColor: k.neutral20
    },
    dayLabel: {
      color: k.tertiary
    },
    monthLabel: {
      color: k.secondary
    },
    yearLabel: {
      color: k.secondary
    }
  },
  matrix: {
    x: Xp,
    y: Xp,
    backgroundColor: {
      borderColor: k.axisLine
    },
    body: {
      itemStyle: {
        borderColor: k.borderTint
      }
    }
  },
  timeAxis: ea(),
  logAxis: ea(),
  valueAxis: ea(),
  categoryAxis: ea(),
  line: {
    symbol: "circle"
  },
  graph: {
    color: k.theme
  },
  gauge: {
    title: {
      color: k.secondary
    },
    axisLine: {
      lineStyle: {
        color: [[1, k.neutral05]]
      }
    },
    axisLabel: {
      color: k.axisLabel
    },
    detail: {
      color: k.primary
    }
  },
  candlestick: {
    itemStyle: {
      color: "#f64e56",
      color0: "#54ea92",
      borderColor: "#f64e56",
      borderColor0: "#54ea92"
      // borderColor: '#ca2824',
      // borderColor0: '#09a443'
    }
  },
  funnel: {
    itemStyle: {
      borderColor: k.background
    }
  },
  radar: function() {
    var t = ea();
    return t.axisName = {
      color: k.axisLabel
    }, t.axisLine.lineStyle.color = k.neutral20, t;
  }(),
  treemap: {
    breadcrumb: {
      itemStyle: {
        color: k.neutral20,
        textStyle: {
          color: k.secondary
        }
      },
      emphasis: {
        itemStyle: {
          color: k.neutral30
        }
      }
    }
  },
  sunburst: {
    itemStyle: {
      borderColor: k.background
    }
  },
  map: {
    itemStyle: {
      borderColor: k.border,
      areaColor: k.neutral10
    },
    label: {
      color: k.tertiary
    },
    emphasis: {
      label: {
        color: k.primary
      },
      itemStyle: {
        areaColor: k.highlight
      }
    },
    select: {
      label: {
        color: k.primary
      },
      itemStyle: {
        areaColor: k.highlight
      }
    }
  },
  geo: {
    itemStyle: {
      borderColor: k.border,
      areaColor: k.neutral10
    },
    emphasis: {
      label: {
        color: k.primary
      },
      itemStyle: {
        areaColor: k.highlight
      }
    },
    select: {
      label: {
        color: k.primary
      },
      itemStyle: {
        color: k.highlight
      }
    }
  }
};
x_.categoryAxis.splitLine.show = !1;
var VM = (
  /** @class */
  function() {
    function t() {
    }
    return t.prototype.normalizeQuery = function(e) {
      var r = {}, n = {}, i = {};
      if (z(e)) {
        var a = Xt(e);
        r.mainType = a.main || null, r.subType = a.sub || null;
      } else {
        var o = ["Index", "Name", "Id"], s = {
          name: 1,
          dataIndex: 1,
          dataType: 1
        };
        x(e, function(u, l) {
          for (var f = !1, h = 0; h < o.length; h++) {
            var c = o[h], v = l.lastIndexOf(c);
            if (v > 0 && v === l.length - c.length) {
              var d = l.slice(0, v);
              d !== "data" && (r.mainType = d, r[c.toLowerCase()] = u, f = !0);
            }
          }
          s.hasOwnProperty(l) && (n[l] = u, f = !0), f || (i[l] = u);
        });
      }
      return {
        cptQuery: r,
        dataQuery: n,
        otherQuery: i
      };
    }, t.prototype.filter = function(e, r) {
      var n = this.eventInfo;
      if (!n)
        return !0;
      var i = n.targetEl, a = n.packedEvent, o = n.model, s = n.view;
      if (!o || !s)
        return !0;
      var u = r.cptQuery, l = r.dataQuery;
      return f(u, o, "mainType") && f(u, o, "subType") && f(u, o, "index", "componentIndex") && f(u, o, "name") && f(u, o, "id") && f(l, a, "name") && f(l, a, "dataIndex") && f(l, a, "dataType") && (!s.filterForExposedEvent || s.filterForExposedEvent(e, r.otherQuery, i, a));
      function f(h, c, v, d) {
        return h[v] == null || c[d || v] === h[v];
      }
    }, t.prototype.afterTrigger = function() {
      this.eventInfo = null;
    }, t;
  }()
), Ch = ["symbol", "symbolSize", "symbolRotate", "symbolOffset"], Zp = Ch.concat(["symbolKeepAspect"]), FM = {
  createOnAllSeries: !0,
  // For legend.
  performRawSeries: !0,
  reset: function(t, e) {
    var r = t.getData();
    if (t.legendIcon && r.setVisual("legendIcon", t.legendIcon), !t.hasSymbolVisual)
      return;
    for (var n = {}, i = {}, a = !1, o = 0; o < Ch.length; o++) {
      var s = Ch[o], u = t.get(s);
      Q(u) ? (a = !0, i[s] = u) : n[s] = u;
    }
    if (n.symbol = n.symbol || t.defaultSymbol, r.setVisual(R({
      legendIcon: t.legendIcon || n.symbol,
      symbolKeepAspect: t.get("symbolKeepAspect")
    }, n)), e.isSeriesFiltered(t))
      return;
    var l = le(i);
    function f(h, c) {
      for (var v = t.getRawValue(c), d = t.getDataParams(c), p = 0; p < l.length; p++) {
        var m = l[p];
        h.setItemVisual(c, m, i[m](v, d));
      }
    }
    return {
      dataEach: a ? f : null
    };
  }
}, zM = {
  createOnAllSeries: !0,
  // For legend.
  performRawSeries: !0,
  reset: function(t, e) {
    if (!t.hasSymbolVisual || e.isSeriesFiltered(t))
      return;
    var r = t.getData();
    function n(i, a) {
      for (var o = i.getItemModel(a), s = 0; s < Zp.length; s++) {
        var u = Zp[s], l = o.getShallow(u, !0);
        l != null && i.setItemVisual(a, u, l);
      }
    }
    return {
      dataEach: r.hasItemOption ? n : null
    };
  }
};
function HM(t, e, r) {
  switch (r) {
    case "color":
      var n = t.getItemVisual(e, "style");
      return n[t.getVisual("drawType")];
    case "opacity":
      return t.getItemVisual(e, "style").opacity;
    case "symbol":
    case "symbolSize":
    case "liftZ":
      return t.getItemVisual(e, r);
    default:
      process.env.NODE_ENV !== "production" && console.warn("Unknown visual type " + r);
  }
}
function GM(t, e) {
  switch (e) {
    case "color":
      var r = t.getVisual("style");
      return r[t.getVisual("drawType")];
    case "opacity":
      return t.getVisual("style").opacity;
    case "symbol":
    case "symbolSize":
    case "liftZ":
      return t.getVisual(e);
    default:
      process.env.NODE_ENV !== "production" && console.warn("Unknown visual type " + e);
  }
}
function Qn(t, e, r, n, i) {
  var a = t + e;
  r.isSilent(a) || (process.env.NODE_ENV !== "production" && tr("event " + a + " is deprecated."), n.eachComponent({
    mainType: "series",
    subType: "pie"
  }, function(o) {
    for (var s = o.seriesIndex, u = o.option.selectedMap, l = i.selected, f = 0; f < l.length; f++)
      if (l[f].seriesIndex === s) {
        var h = o.getData(), c = Pn(h, i.fromActionPayload);
        r.trigger(a, {
          type: a,
          seriesId: o.id,
          name: H(c) ? h.getName(c[0]) : h.getName(c),
          selected: z(u) ? u : R({}, u)
        });
      }
  }));
}
function UM(t, e, r) {
  t.on("selectchanged", function(n) {
    var i = r.getModel();
    n.isFromClick ? (Qn("map", "selectchanged", e, i, n), Qn("pie", "selectchanged", e, i, n)) : n.fromAction === "select" ? (Qn("map", "selected", e, i, n), Qn("pie", "selected", e, i, n)) : n.fromAction === "unselect" && (Qn("map", "unselected", e, i, n), Qn("pie", "unselected", e, i, n));
  });
}
function ba(t, e, r) {
  for (var n; t && !(e(t) && (n = t, r)); )
    t = t.__hostTarget || t.parent;
  return n;
}
var dt = new ar(), eu = {};
function WM(t, e) {
  process.env.NODE_ENV !== "production" && eu[t] && he("Already has an implementation of " + t + "."), eu[t] = e;
}
function YM(t) {
  return process.env.NODE_ENV !== "production" && (eu[t] || he("Implementation of " + t + " doesn't exists.")), eu[t];
}
var Zu = ve();
function XM(t) {
  Zu(t).prepare = {};
}
function ZM(t) {
  Zu(t).fullUpdate = {};
}
function $M(t) {
  return Zu(t).prepare;
}
function po(t) {
  return Zu(t).fullUpdate;
}
var qM = Math.round(Math.random() * 9), KM = typeof Object.defineProperty == "function", QM = function() {
  function t() {
    this._id = "__ec_inner_" + qM++;
  }
  return t.prototype.get = function(e) {
    return this._guard(e)[this._id];
  }, t.prototype.set = function(e, r) {
    var n = this._guard(e);
    return KM ? Object.defineProperty(n, this._id, {
      value: r,
      enumerable: !1,
      configurable: !0
    }) : n[this._id] = r, this;
  }, t.prototype.delete = function(e) {
    return this.has(e) ? (delete this._guard(e)[this._id], !0) : !1;
  }, t.prototype.has = function(e) {
    return !!this._guard(e)[this._id];
  }, t.prototype._guard = function(e) {
    if (e !== Object(e))
      throw TypeError("Value of WeakMap is not a non-null object.");
    return e;
  }, t;
}(), jM = be.extend({
  type: "triangle",
  shape: {
    cx: 0,
    cy: 0,
    width: 0,
    height: 0
  },
  buildPath: function(t, e) {
    var r = e.cx, n = e.cy, i = e.width / 2, a = e.height / 2;
    t.moveTo(r, n - a), t.lineTo(r + i, n + a), t.lineTo(r - i, n + a), t.closePath();
  }
}), JM = be.extend({
  type: "diamond",
  shape: {
    cx: 0,
    cy: 0,
    width: 0,
    height: 0
  },
  buildPath: function(t, e) {
    var r = e.cx, n = e.cy, i = e.width / 2, a = e.height / 2;
    t.moveTo(r, n - a), t.lineTo(r + i, n), t.lineTo(r, n + a), t.lineTo(r - i, n), t.closePath();
  }
}), eE = be.extend({
  type: "pin",
  shape: {
    // x, y on the cusp
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: function(t, e) {
    var r = e.x, n = e.y, i = e.width / 5 * 3, a = Math.max(i, e.height), o = i / 2, s = o * o / (a - o), u = n - a + o + s, l = Math.asin(s / o), f = Math.cos(l) * o, h = Math.sin(l), c = Math.cos(l), v = o * 0.6, d = o * 0.7;
    t.moveTo(r - f, u + s), t.arc(r, u, o, Math.PI - l, Math.PI * 2 + l), t.bezierCurveTo(r + f - h * v, u + s + c * v, r, n - d, r, n), t.bezierCurveTo(r, n - d, r - f + h * v, u + s + c * v, r - f, u + s), t.closePath();
  }
}), tE = be.extend({
  type: "arrow",
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: function(t, e) {
    var r = e.height, n = e.width, i = e.x, a = e.y, o = n / 3 * 2;
    t.moveTo(i, a), t.lineTo(i + o, a + r), t.lineTo(i, a + r / 4 * 3), t.lineTo(i - o, a + r), t.lineTo(i, a), t.closePath();
  }
}), rE = {
  line: Hr,
  rect: Ce,
  roundRect: Ce,
  square: Ce,
  circle: Nu,
  diamond: JM,
  pin: eE,
  arrow: tE,
  triangle: jM
}, nE = {
  line: function(t, e, r, n, i) {
    i.x1 = t, i.y1 = e + n / 2, i.x2 = t + r, i.y2 = e + n / 2;
  },
  rect: function(t, e, r, n, i) {
    i.x = t, i.y = e, i.width = r, i.height = n;
  },
  roundRect: function(t, e, r, n, i) {
    i.x = t, i.y = e, i.width = r, i.height = n, i.r = Math.min(r, n) / 4;
  },
  square: function(t, e, r, n, i) {
    var a = Math.min(r, n);
    i.x = t, i.y = e, i.width = a, i.height = a;
  },
  circle: function(t, e, r, n, i) {
    i.cx = t + r / 2, i.cy = e + n / 2, i.r = Math.min(r, n) / 2;
  },
  diamond: function(t, e, r, n, i) {
    i.cx = t + r / 2, i.cy = e + n / 2, i.width = r, i.height = n;
  },
  pin: function(t, e, r, n, i) {
    i.x = t + r / 2, i.y = e + n / 2, i.width = r, i.height = n;
  },
  arrow: function(t, e, r, n, i) {
    i.x = t + r / 2, i.y = e + n / 2, i.width = r, i.height = n;
  },
  triangle: function(t, e, r, n, i) {
    i.cx = t + r / 2, i.cy = e + n / 2, i.width = r, i.height = n;
  }
}, tu = {};
x(rE, function(t, e) {
  tu[e] = new t();
});
var iE = be.extend({
  type: "symbol",
  shape: {
    symbolType: "",
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  calculateTextPosition: function(t, e, r) {
    var n = by(t, e, r), i = this.shape;
    return i && i.symbolType === "pin" && e.position === "inside" && (n.y = r.y + r.height * 0.4), n;
  },
  buildPath: function(t, e, r) {
    var n = e.symbolType;
    if (n !== "none") {
      var i = tu[n];
      i || (n = "rect", i = tu[n]), nE[n](e.x, e.y, e.width, e.height, i.shape), i.buildPath(t, i.shape, r);
    }
  }
});
function aE(t, e) {
  if (this.type !== "image") {
    var r = this.style;
    this.__isEmptyBrush ? (r.stroke = t, r.fill = e || G.color.neutral00, r.lineWidth = 2) : this.shape.symbolType === "line" ? r.stroke = t : r.fill = t, this.markRedraw();
  }
}
function Yr(t, e, r, n, i, a, o) {
  var s = t.indexOf("empty") === 0;
  s && (t = t.substr(5, 1).toLowerCase() + t.substr(6));
  var u;
  return t.indexOf("image://") === 0 ? u = _0(t.slice(8), new ie(e, r, n, i), o ? "center" : "cover") : t.indexOf("path://") === 0 ? u = Ec(t.slice(7), {}, new ie(e, r, n, i), o ? "center" : "cover") : u = new iE({
    shape: {
      symbolType: t,
      x: e,
      y: r,
      width: n,
      height: i
    }
  }), u.__isEmptyBrush = s, u.setColor = aE, a && u.setColor(a), u;
}
function oE(t) {
  return H(t) || (t = [+t, +t]), [t[0] || 0, t[1] || 0];
}
function C_(t, e) {
  if (t != null)
    return H(t) || (t = [t, t]), [_t(t[0], e[0]) || 0, _t(W(t[1], t[0]), e[1]) || 0];
}
function Dn(t) {
  return isFinite(t);
}
function sE(t, e, r) {
  var n = e.x == null ? 0 : e.x, i = e.x2 == null ? 1 : e.x2, a = e.y == null ? 0 : e.y, o = e.y2 == null ? 0 : e.y2;
  e.global || (n = n * r.width + r.x, i = i * r.width + r.x, a = a * r.height + r.y, o = o * r.height + r.y), n = Dn(n) ? n : 0, i = Dn(i) ? i : 1, a = Dn(a) ? a : 0, o = Dn(o) ? o : 0;
  var s = t.createLinearGradient(n, a, i, o);
  return s;
}
function uE(t, e, r) {
  var n = r.width, i = r.height, a = Math.min(n, i), o = e.x == null ? 0.5 : e.x, s = e.y == null ? 0.5 : e.y, u = e.r == null ? 0.5 : e.r;
  e.global || (o = o * n + r.x, s = s * i + r.y, u = u * a), o = Dn(o) ? o : 0.5, s = Dn(s) ? s : 0.5, u = u >= 0 && Dn(u) ? u : 0.5;
  var l = t.createRadialGradient(o, s, 0, o, s, u);
  return l;
}
function $p(t, e, r) {
  for (var n = e.type === "radial" ? uE(t, e, r) : sE(t, e, r), i = e.colorStops, a = 0; a < i.length; a++)
    n.addColorStop(i[a].offset, i[a].color);
  return n;
}
function lE(t, e) {
  if (t === e || !t && !e)
    return !1;
  if (!t || !e || t.length !== e.length)
    return !0;
  for (var r = 0; r < t.length; r++)
    if (t[r] !== e[r])
      return !0;
  return !1;
}
function qo(t) {
  return parseInt(t, 10);
}
function qp(t, e, r) {
  var n = ["width", "height"][e], i = ["clientWidth", "clientHeight"][e], a = ["paddingLeft", "paddingTop"][e], o = ["paddingRight", "paddingBottom"][e];
  if (r[n] != null && r[n] !== "auto")
    return parseFloat(r[n]);
  var s = document.defaultView.getComputedStyle(t);
  return (t[i] || qo(s[n]) || qo(t.style[n])) - (qo(s[a]) || 0) - (qo(s[o]) || 0) || 0;
}
function fE(t, e) {
  return !t || t === "solid" || !(e > 0) ? null : t === "dashed" ? [4 * e, 2 * e] : t === "dotted" ? [e] : Te(t) ? [t] : H(t) ? t : null;
}
function ev(t) {
  var e = t.style, r = e.lineDash && e.lineWidth > 0 && fE(e.lineDash, e.lineWidth), n = e.lineDashOffset;
  if (r) {
    var i = e.strokeNoScale && t.getLineScale ? t.getLineScale() : 1;
    i && i !== 1 && (r = X(r, function(a) {
      return a / i;
    }), n /= i);
  }
  return [r, n];
}
var hE = new zr(!0);
function ru(t) {
  var e = t.stroke;
  return !(e == null || e === "none" || !(t.lineWidth > 0));
}
function Kp(t) {
  return typeof t == "string" && t !== "none";
}
function nu(t) {
  var e = t.fill;
  return e != null && e !== "none";
}
function Qp(t, e) {
  if (e.fillOpacity != null && e.fillOpacity !== 1) {
    var r = t.globalAlpha;
    t.globalAlpha = e.fillOpacity * e.opacity, t.fill(), t.globalAlpha = r;
  } else
    t.fill();
}
function jp(t, e) {
  if (e.strokeOpacity != null && e.strokeOpacity !== 1) {
    var r = t.globalAlpha;
    t.globalAlpha = e.strokeOpacity * e.opacity, t.stroke(), t.globalAlpha = r;
  } else
    t.stroke();
}
function Jp(t, e, r) {
  var n = gc(e.image, e.__image, r);
  if (Au(n)) {
    var i = t.createPattern(n, e.repeat || "repeat");
    if (typeof DOMMatrix == "function" && i && i.setTransform) {
      var a = new DOMMatrix();
      a.translateSelf(e.x || 0, e.y || 0), a.rotateSelf(0, 0, (e.rotation || 0) * us), a.scaleSelf(e.scaleX || 1, e.scaleY || 1), i.setTransform(a);
    }
    return i;
  }
}
function cE(t, e, r, n, i) {
  var a, o = ru(r), s = nu(r), u = r.strokePercent, l = u < 1, f = !e.path;
  (!e.silent || l) && f && e.createPathProxy();
  var h = e.path || hE, c = e.__dirty;
  if (!n) {
    var v = r.fill, d = r.stroke, p = s && !!v.colorStops, m = o && !!d.colorStops, g = s && !!v.image, y = o && !!d.image, _ = void 0, S = void 0, b = void 0, w = void 0, T = void 0;
    (p || m) && (T = e.getBoundingRect()), p && (_ = c ? $p(t, v, T) : e.__canvasFillGradient, e.__canvasFillGradient = _), m && (S = c ? $p(t, d, T) : e.__canvasStrokeGradient, e.__canvasStrokeGradient = S), g && (b = c || !e.__canvasFillPattern ? Jp(t, v, e) : e.__canvasFillPattern, e.__canvasFillPattern = b), y && (w = c || !e.__canvasStrokePattern ? Jp(t, d, e) : e.__canvasStrokePattern, e.__canvasStrokePattern = w), p ? t.fillStyle = _ : g && (b ? t.fillStyle = b : s = !1), m ? t.strokeStyle = S : y && (w ? t.strokeStyle = w : o = !1);
  }
  var M = e.getGlobalScale();
  h.setScale(M[0], M[1], e.segmentIgnoreThreshold);
  var D, C;
  t.setLineDash && r.lineDash && (a = ev(e), D = a[0], C = a[1]);
  var E = !0;
  (f || c & ai) && (h.setDPR(t.dpr), l ? h.setContext(null) : (h.setContext(t), E = !1), h.reset(), e.buildPath(h, e.shape, n), h.toStatic(), e.pathUpdated()), E && h.rebuildPath(t, l ? u : 1), D && (t.setLineDash(D), t.lineDashOffset = C), n ? (i.batchFill = s, i.batchStroke = o) : r.strokeFirst ? (o && jp(t, r), s && Qp(t, r)) : (s && Qp(t, r), o && jp(t, r)), D && t.setLineDash([]);
}
function vE(t, e, r) {
  var n = e.__image = gc(r.image, e.__image, e, e.onload);
  if (!(!n || !Au(n))) {
    var i = r.x || 0, a = r.y || 0, o = e.getWidth(), s = e.getHeight(), u = n.width / n.height;
    if (o == null && s != null ? o = s * u : s == null && o != null ? s = o / u : o == null && s == null && (o = n.width, s = n.height), r.sWidth && r.sHeight) {
      var l = r.sx || 0, f = r.sy || 0;
      t.drawImage(n, l, f, r.sWidth, r.sHeight, i, a, o, s);
    } else if (r.sx && r.sy) {
      var l = r.sx, f = r.sy, h = o - l, c = s - f;
      t.drawImage(n, l, f, h, c, i, a, o, s);
    } else
      t.drawImage(n, i, a, o, s);
  }
}
function dE(t, e, r) {
  var n, i = r.text;
  if (i != null && (i += ""), i) {
    t.font = r.font || gr, t.textAlign = r.textAlign, t.textBaseline = r.textBaseline;
    var a = void 0, o = void 0;
    t.setLineDash && r.lineDash && (n = ev(e), a = n[0], o = n[1]), a && (t.setLineDash(a), t.lineDashOffset = o), r.strokeFirst ? (ru(r) && t.strokeText(i, r.x, r.y), nu(r) && t.fillText(i, r.x, r.y)) : (nu(r) && t.fillText(i, r.x, r.y), ru(r) && t.strokeText(i, r.x, r.y)), a && t.setLineDash([]);
  }
}
var eg = ["shadowBlur", "shadowOffsetX", "shadowOffsetY"], tg = [
  ["lineCap", "butt"],
  ["lineJoin", "miter"],
  ["miterLimit", 10]
];
function D_(t, e, r, n, i) {
  var a = !1;
  if (!n && (r = r || {}, e === r))
    return !1;
  if (n || e.opacity !== r.opacity) {
    Ke(t, i), a = !0;
    var o = Math.max(Math.min(e.opacity, 1), 0);
    t.globalAlpha = isNaN(o) ? An.opacity : o;
  }
  (n || e.blend !== r.blend) && (a || (Ke(t, i), a = !0), t.globalCompositeOperation = e.blend || An.blend);
  for (var s = 0; s < eg.length; s++) {
    var u = eg[s];
    (n || e[u] !== r[u]) && (a || (Ke(t, i), a = !0), t[u] = t.dpr * (e[u] || 0));
  }
  return (n || e.shadowColor !== r.shadowColor) && (a || (Ke(t, i), a = !0), t.shadowColor = e.shadowColor || An.shadowColor), a;
}
function rg(t, e, r, n, i) {
  var a = e.style, o = n ? null : r && r.style || {};
  if (a === o)
    return !1;
  var s = D_(t, a, o, n, i);
  if ((n || a.fill !== o.fill) && (s || (Ke(t, i), s = !0), Kp(a.fill) && (t.fillStyle = a.fill)), (n || a.stroke !== o.stroke) && (s || (Ke(t, i), s = !0), Kp(a.stroke) && (t.strokeStyle = a.stroke)), (n || a.opacity !== o.opacity) && (s || (Ke(t, i), s = !0), t.globalAlpha = a.opacity == null ? 1 : a.opacity), e.hasStroke()) {
    var u = a.lineWidth, l = u / (a.strokeNoScale && e.getLineScale ? e.getLineScale() : 1);
    t.lineWidth !== l && (s || (Ke(t, i), s = !0), t.lineWidth = l);
  }
  for (var f = 0; f < tg.length; f++) {
    var h = tg[f], c = h[0];
    (n || a[c] !== o[c]) && (s || (Ke(t, i), s = !0), t[c] = a[c] || h[1]);
  }
  return s;
}
function pE(t, e, r, n, i) {
  return D_(t, e.style, r && r.style, n, i);
}
function M_(t, e) {
  var r = e.transform, n = t.dpr || 1;
  r ? t.setTransform(n * r[0], n * r[1], n * r[2], n * r[3], n * r[4], n * r[5]) : t.setTransform(n, 0, 0, n, 0, 0);
}
function gE(t, e, r) {
  for (var n = !1, i = 0; i < t.length; i++) {
    var a = t[i];
    n = n || a.isZeroArea(), M_(e, a), e.beginPath(), a.buildPath(e, a.shape), e.clip();
  }
  r.allClipped = n;
}
function mE(t, e) {
  return t && e ? t[0] !== e[0] || t[1] !== e[1] || t[2] !== e[2] || t[3] !== e[3] || t[4] !== e[4] || t[5] !== e[5] : !(!t && !e);
}
var ng = 1, ig = 2, ag = 3, og = 4;
function yE(t) {
  var e = nu(t), r = ru(t);
  return !(t.lineDash || !(+e ^ +r) || e && typeof t.fill != "string" || r && typeof t.stroke != "string" || t.strokePercent < 1 || t.strokeOpacity < 1 || t.fillOpacity < 1);
}
function Ke(t, e) {
  e.batchFill && (e.batchFill = !1, t.fill()), e.batchStroke && (e.batchStroke = !1, t.stroke());
}
function _E(t, e) {
  var r = { inHover: !1, viewWidth: 0, viewHeight: 0, beforeBrushParam: {} };
  Dh(t, e, r), Mh(t, r);
}
function Dh(t, e, r) {
  var n = e.transform;
  if (!e.shouldBePainted(r.viewWidth, r.viewHeight, !1, !1)) {
    e.__dirty &= ~Ot, e.__isRendered = !1;
    return;
  }
  var i = e.__clipPaths, a = r.prevElClipPaths, o = e.style, s = !1, u = !1;
  if ((!a || lE(i, a)) && (a && (Ke(t, r), t.restore(), u = s = !0, r.prevElClipPaths = null, r.allClipped = !1, r.prevEl = null), i && i.length && (Ke(t, r), t.save(), gE(i, t, r), s = !0, r.prevElClipPaths = i)), r.allClipped) {
    e.__dirty &= ~Ot, e.__isRendered = !1;
    return;
  }
  e.beforeBrush && e.beforeBrush(r.beforeBrushParam), e.innerBeforeBrush();
  var l = r.prevEl;
  l || (u = s = !0);
  var f = e instanceof be && e.autoBatch && yE(o);
  s || mE(n, l.transform) ? (Ke(t, r), M_(t, e)) : f || Ke(t, r), e instanceof be ? (r.lastDrawType !== ng && (u = !0, r.lastDrawType = ng), rg(t, e, l, u, r), (!f || !r.batchFill && !r.batchStroke) && t.beginPath(), cE(t, e, o, f, r)) : e instanceof za ? (r.lastDrawType !== ag && (u = !0, r.lastDrawType = ag), rg(t, e, l, u, r), dE(t, e, o)) : e instanceof or ? (r.lastDrawType !== ig && (u = !0, r.lastDrawType = ig), pE(t, e, l, u, r), vE(t, e, o)) : e.getTemporalDisplayables && (r.lastDrawType !== og && (u = !0, r.lastDrawType = og), SE(t, e, r)), e.innerAfterBrush(), e.afterBrush && (f && Ke(t, r), e.afterBrush()), r.prevEl = e, e.__dirty = 0, e.__isRendered = !0;
}
function Mh(t, e) {
  Ke(t, e), e.prevElClipPaths && t.restore();
}
function SE(t, e, r) {
  var n = e.getDisplayables(), i = e.getTemporalDisplayables();
  t.save();
  var a = {
    prevElClipPaths: null,
    prevEl: null,
    allClipped: !1,
    viewWidth: r.viewWidth,
    viewHeight: r.viewHeight,
    inHover: r.inHover,
    beforeBrushParam: {}
  }, o, s;
  for (o = e.getCursor(), s = n.length; o < s; o++) {
    var u = n[o];
    u.beforeBrush && u.beforeBrush(r.beforeBrushParam), u.innerBeforeBrush(), Dh(t, u, a), u.innerAfterBrush(), u.afterBrush && u.afterBrush(), a.prevEl = u;
  }
  Mh(t, a);
  for (var l = 0, f = i.length; l < f; l++) {
    var u = i[l];
    u.beforeBrush && u.beforeBrush(r.beforeBrushParam), u.innerBeforeBrush(), Dh(t, u, a), u.innerAfterBrush(), u.afterBrush && u.afterBrush(), a.prevEl = u;
  }
  Mh(t, a), e.clearTemporalDisplayables(), e.notClear = !0, t.restore();
}
var rf = new QM(), sg = new xi(100), ug = ["symbol", "symbolSize", "symbolKeepAspect", "color", "backgroundColor", "dashArrayX", "dashArrayY", "maxTileWidth", "maxTileHeight"];
function Eh(t, e) {
  if (t === "none")
    return null;
  var r = e.getDevicePixelRatio(), n = e.getZr(), i = n.painter.type === "svg";
  t.dirty && rf.delete(t);
  var a = rf.get(t);
  if (a)
    return a;
  var o = ge(t, {
    symbol: "rect",
    symbolSize: 1,
    symbolKeepAspect: !0,
    color: "rgba(0, 0, 0, 0.2)",
    backgroundColor: null,
    dashArrayX: 5,
    dashArrayY: 5,
    rotation: 0,
    maxTileWidth: 512,
    maxTileHeight: 512
  });
  o.backgroundColor === "none" && (o.backgroundColor = null);
  var s = {
    repeat: "repeat"
  };
  return u(s), s.rotation = o.rotation, s.scaleX = s.scaleY = i ? 1 : 1 / r, rf.set(t, s), t.dirty = !1, s;
  function u(l) {
    for (var f = [r], h = !0, c = 0; c < ug.length; ++c) {
      var v = o[ug[c]];
      if (v != null && !H(v) && !z(v) && !Te(v) && typeof v != "boolean") {
        h = !1;
        break;
      }
      f.push(v);
    }
    var d;
    if (h) {
      d = f.join(",") + (i ? "-svg" : "");
      var p = sg.get(d);
      p && (i ? l.svgElement = p : l.image = p);
    }
    var m = A_(o.dashArrayX), g = bE(o.dashArrayY), y = E_(o.symbol), _ = wE(m), S = I_(g), b = !i && Zt.createCanvas(), w = i && {
      tag: "g",
      attrs: {},
      key: "dcl",
      children: []
    }, T = D(), M;
    b && (b.width = T.width * r, b.height = T.height * r, M = b.getContext("2d")), C(), h && sg.put(d, b || w), l.image = b, l.svgElement = w, l.svgWidth = T.width, l.svgHeight = T.height;
    function D() {
      for (var E = 1, I = 0, A = _.length; I < A; ++I)
        E = cd(E, _[I]);
      for (var O = 1, I = 0, A = y.length; I < A; ++I)
        O = cd(O, y[I].length);
      E *= O;
      var P = S * _.length * y.length;
      if (process.env.NODE_ENV !== "production") {
        var L = function(B) {
          console.warn("Calculated decal size is greater than " + B + " due to decal option settings so " + B + " is used for the decal size. Please consider changing the decal option to make a smaller decal or set " + B + " to be larger to avoid incontinuity.");
        };
        E > o.maxTileWidth && L("maxTileWidth"), P > o.maxTileHeight && L("maxTileHeight");
      }
      return {
        width: Math.max(1, Math.min(E, o.maxTileWidth)),
        height: Math.max(1, Math.min(P, o.maxTileHeight))
      };
    }
    function C() {
      M && (M.clearRect(0, 0, b.width, b.height), o.backgroundColor && (M.fillStyle = o.backgroundColor, M.fillRect(0, 0, b.width, b.height)));
      for (var E = 0, I = 0; I < g.length; ++I)
        E += g[I];
      if (E <= 0)
        return;
      for (var A = -S, O = 0, P = 0, L = 0; A < T.height; ) {
        if (O % 2 === 0) {
          for (var B = P / 2 % y.length, U = 0, Y = 0, j = 0; U < T.width * 2; ) {
            for (var K = 0, I = 0; I < m[L].length; ++I)
              K += m[L][I];
            if (K <= 0)
              break;
            if (Y % 2 === 0) {
              var J = (1 - o.symbolSize) * 0.5, $ = U + m[L][Y] * J, F = A + g[O] * J, ne = m[L][Y] * o.symbolSize, oe = g[O] * o.symbolSize, ze = j / 2 % y[B].length;
              Ue($, F, ne, oe, y[B][ze]);
            }
            U += m[L][Y], ++j, ++Y, Y === m[L].length && (Y = 0);
          }
          ++L, L === m.length && (L = 0);
        }
        A += g[O], ++P, ++O, O === g.length && (O = 0);
      }
      function Ue(de, De, ee, se, Et) {
        var Le = i ? 1 : r, Ui = Yr(Et, de * Le, De * Le, ee * Le, se * Le, o.color, o.symbolKeepAspect);
        if (i) {
          var Zr = n.painter.renderOneToVNode(Ui);
          Zr && w.children.push(Zr);
        } else
          _E(M, Ui);
      }
    }
  }
}
function E_(t) {
  if (!t || t.length === 0)
    return [["rect"]];
  if (z(t))
    return [[t]];
  for (var e = !0, r = 0; r < t.length; ++r)
    if (!z(t[r])) {
      e = !1;
      break;
    }
  if (e)
    return E_([t]);
  for (var n = [], r = 0; r < t.length; ++r)
    z(t[r]) ? n.push([t[r]]) : n.push(t[r]);
  return n;
}
function A_(t) {
  if (!t || t.length === 0)
    return [[0, 0]];
  if (Te(t)) {
    var e = Math.ceil(t);
    return [[e, e]];
  }
  for (var r = !0, n = 0; n < t.length; ++n)
    if (!Te(t[n])) {
      r = !1;
      break;
    }
  if (r)
    return A_([t]);
  for (var i = [], n = 0; n < t.length; ++n)
    if (Te(t[n])) {
      var e = Math.ceil(t[n]);
      i.push([e, e]);
    } else {
      var e = X(t[n], function(s) {
        return Math.ceil(s);
      });
      e.length % 2 === 1 ? i.push(e.concat(e)) : i.push(e);
    }
  return i;
}
function bE(t) {
  if (!t || typeof t == "object" && t.length === 0)
    return [0, 0];
  if (Te(t)) {
    var e = Math.ceil(t);
    return [e, e];
  }
  var r = X(t, function(n) {
    return Math.ceil(n);
  });
  return t.length % 2 ? r.concat(r) : r;
}
function wE(t) {
  return X(t, function(e) {
    return I_(e);
  });
}
function I_(t) {
  for (var e = 0, r = 0; r < t.length; ++r)
    e += t[r];
  return t.length % 2 === 1 ? e * 2 : e;
}
var TE = dc(xE);
function xE(t, e) {
  t.eachRawSeries(function(r) {
    if (!t.isSeriesFiltered(r)) {
      var n = r.getData();
      n.hasItemVisual() && n.each(function(o) {
        var s = n.getItemVisual(o, "decal");
        if (s) {
          var u = n.ensureUniqueItemVisual(o, "style");
          u.decal = Eh(s, e);
        }
      });
      var i = n.getVisual("decal");
      if (i) {
        var a = n.getVisual("style");
        a.decal = Eh(i, e);
      }
    }
  });
}
var CE = 1, DE = 800, ME = 900, EE = 920, AE = 1e3, IE = 2e3, lg = 5e3, O_ = 1e3, OE = 1100, tv = 2e3, L_ = 3e3, LE = 4e3, $u = 4500, PE = 4600, NE = 5e3, RE = 6e3, P_ = 7e3, kE = {
  PROCESSOR: {
    SERIES_FILTER: DE,
    AXIS_STATISTICS: EE,
    FILTER: AE,
    STATISTIC: lg,
    STATISTICS: lg
  },
  VISUAL: {
    LAYOUT: O_,
    PROGRESSIVE_LAYOUT: OE,
    GLOBAL: tv,
    CHART: L_,
    POST_CHART_LAYOUT: PE,
    COMPONENT: LE,
    BRUSH: NE,
    CHART_ITEM: $u,
    ARIA: RE,
    DECAL: P_
  }
}, Ie = "__flagInMainProcess", Ko = "__mainProcessVersion", ke = "__pendingUpdate", nf = "__needsUpdateStatus", fg = /^[a-zA-Z0-9_]+$/, af = "__connectUpdateStatus", hg = 0, BE = 1, VE = 2;
function N_(t) {
  return function() {
    for (var e = [], r = 0; r < arguments.length; r++)
      e[r] = arguments[r];
    if (this.isDisposed()) {
      tt(this.id);
      return;
    }
    return k_(this, t, e);
  };
}
function R_(t) {
  return function() {
    for (var e = [], r = 0; r < arguments.length; r++)
      e[r] = arguments[r];
    return k_(this, t, e);
  };
}
function k_(t, e, r) {
  return r[0] = r[0] && r[0].toLowerCase(), ar.prototype[e].apply(t, r);
}
var B_ = (
  /** @class */
  function(t) {
    V(e, t);
    function e() {
      return t !== null && t.apply(this, arguments) || this;
    }
    return e;
  }(ar)
), V_ = B_.prototype;
V_.on = R_("on");
V_.off = R_("off");
var mn, of, Qo, fr, jo, sf, uf, jn, Jn, cg, vg, lf, dg, Jo, pg, F_, ct, gg, ei, z_ = (
  /** @class */
  function(t) {
    V(e, t);
    function e(r, n, i) {
      var a = t.call(this, new VM()) || this;
      a._chartsViews = [], a._chartsMap = {}, a._componentsViews = [], a._componentsMap = {}, a._pendingActions = [], i = i || {}, a.__v_skip = !0, a._dom = r;
      var o = "canvas", s = "auto", u = !1;
      if (a[Ko] = 1, process.env.NODE_ENV !== "production") {
        var l = (
          /* eslint-disable-next-line */
          re.hasGlobalWindow ? window : global
        );
        l && (o = W(l.__ECHARTS__DEFAULT__RENDERER__, o), s = W(l.__ECHARTS__DEFAULT__COARSE_POINTER, s), u = W(l.__ECHARTS__DEFAULT__USE_DIRTY_RECT__, u));
      }
      i.ssr && gw(function(v) {
        var d = me(v), p = d.dataIndex;
        if (p != null) {
          var m = Z();
          return m.set("series_index", d.seriesIndex), m.set("data_index", p), d.ssrType && m.set("ssr_type", d.ssrType), m;
        }
      });
      var f = a._zr = ld(r, {
        renderer: i.renderer || o,
        devicePixelRatio: i.devicePixelRatio,
        width: i.width,
        height: i.height,
        ssr: i.ssr,
        useDirtyRect: W(i.useDirtyRect, u),
        useCoarsePointer: W(i.useCoarsePointer, s),
        pointerSize: i.pointerSize
      });
      a._ssr = i.ssr, a._throttledZrFlush = m_(te(f.flush, f), 17), a._updateTheme(n), a._locale = MC(i.locale || O0), a._coordSysMgr = new Zc();
      var h = a._api = pg(a);
      function c(v, d) {
        return v.__prio - d.__prio;
      }
      return ls(ou, c), ls(Ih, c), a._scheduler = new S_(a, h, Ih, ou), a._messageCenter = new B_(), a._initEvents(), a.resize = te(a.resize, a), f.animation.on("frame", a._onframe, a), cg(f, a), vg(f, a), Lf(a), a;
    }
    return e.prototype._onframe = function() {
      if (!this._disposed) {
        var r = this._scheduler, n = this._model, i = this._api;
        if (gg(this), this[ke]) {
          var a = this[ke].silent;
          this[Ie] = !0, ei(this);
          try {
            mn(this), fr.update.call(this, null, this[ke].updateParams);
          } catch (u) {
            throw this[Ie] = !1, this[ke] = null, u;
          }
          this._zr.flush(), this[Ie] = !1, this[ke] = null, jn.call(this, a), Jn.call(this, a);
        } else if (r.unfinished) {
          var o = CE;
          do {
            r.unfinished = !1;
            var s = Zt.getTime();
            r.performSeriesTasks(n), r.performDataProcessorTasks(n), sf(this, n), r.performVisualTasks(n), Jo(this, this._model, i, "remain", {}), o -= Zt.getTime() - s;
          } while (o > 0 && r.unfinished);
          r.unfinished || this._zr.flush();
        }
      }
    }, e.prototype.getDom = function() {
      return this._dom;
    }, e.prototype.getId = function() {
      return this.id;
    }, e.prototype.getZr = function() {
      return this._zr;
    }, e.prototype.isSSR = function() {
      return this._ssr;
    }, e.prototype.setOption = function(r, n, i) {
      if (this[Ie]) {
        process.env.NODE_ENV !== "production" && he("`setOption` should not be called during main process.");
        return;
      }
      if (this._disposed) {
        tt(this.id);
        return;
      }
      var a, o, s;
      if (q(n) && (i = n.lazyUpdate, a = n.silent, o = n.replaceMerge, s = n.transition, n = n.notMerge), this[Ie] = !0, ei(this), !this._model || n) {
        var u = new pD(this._api), l = this._theme, f = this._model = new Qc();
        f.scheduler = this._scheduler, f.ssr = this._ssr, f.init(null, null, null, l, this._locale, u);
      }
      this._model.setOption(r, {
        replaceMerge: o
      }, Oh);
      var h = {
        seriesTransition: s,
        optionChanged: !0
      };
      if (i)
        this[ke] = {
          silent: a,
          updateParams: h
        }, this[Ie] = !1, this.getZr().wakeUp();
      else {
        try {
          mn(this), fr.update.call(this, null, h);
        } catch (c) {
          throw this[ke] = null, this[Ie] = !1, c;
        }
        this._ssr || this._zr.flush(), this[ke] = null, this[Ie] = !1, jn.call(this, a), Jn.call(this, a);
      }
    }, e.prototype.setTheme = function(r, n) {
      if (this[Ie]) {
        process.env.NODE_ENV !== "production" && he("`setTheme` should not be called during main process.");
        return;
      }
      if (this._disposed) {
        tt(this.id);
        return;
      }
      var i = this._model;
      if (i) {
        var a = n && n.silent, o = null;
        this[ke] && (a == null && (a = this[ke].silent), o = this[ke].updateParams, this[ke] = null), this[Ie] = !0, ei(this);
        try {
          this._updateTheme(r), i.setTheme(this._theme), mn(this), fr.update.call(this, {
            type: "setTheme"
          }, o);
        } catch (s) {
          throw this[Ie] = !1, s;
        }
        this[Ie] = !1, jn.call(this, a), Jn.call(this, a);
      }
    }, e.prototype._updateTheme = function(r) {
      z(r) && (r = H_[r]), r && (r = ae(r), r && j0(r, !0), this._theme = r);
    }, e.prototype.getModel = function() {
      return this._model;
    }, e.prototype.getOption = function() {
      return this._model && this._model.getOption();
    }, e.prototype.getWidth = function() {
      return this._zr.getWidth();
    }, e.prototype.getHeight = function() {
      return this._zr.getHeight();
    }, e.prototype.getDevicePixelRatio = function() {
      return this._zr.painter.dpr || re.hasGlobalWindow && window.devicePixelRatio || 1;
    }, e.prototype.getRenderedCanvas = function(r) {
      return process.env.NODE_ENV !== "production" && Ve("getRenderedCanvas", "renderToCanvas"), this.renderToCanvas(r);
    }, e.prototype.renderToCanvas = function(r) {
      r = r || {};
      var n = this._zr.painter;
      if (process.env.NODE_ENV !== "production" && n.type !== "canvas")
        throw new Error("renderToCanvas can only be used in the canvas renderer.");
      return n.getRenderedCanvas({
        backgroundColor: r.backgroundColor || this._model.get("backgroundColor"),
        pixelRatio: r.pixelRatio || this.getDevicePixelRatio()
      });
    }, e.prototype.renderToSVGString = function(r) {
      r = r || {};
      var n = this._zr.painter;
      if (process.env.NODE_ENV !== "production" && n.type !== "svg")
        throw new Error("renderToSVGString can only be used in the svg renderer.");
      return n.renderToString({
        useViewBox: r.useViewBox
      });
    }, e.prototype.getSvgDataURL = function() {
      var r = this._zr, n = r.storage.getDisplayList();
      return x(n, function(i) {
        i.stopAnimation(null, !0);
      }), r.painter.toDataURL();
    }, e.prototype.getDataURL = function(r) {
      if (this._disposed) {
        tt(this.id);
        return;
      }
      r = r || {};
      var n = r.excludeComponents, i = this._model, a = [], o = this;
      x(n, function(u) {
        i.eachComponent({
          mainType: u
        }, function(l) {
          var f = o._componentsMap[l.__viewId];
          f.group.ignore || (a.push(f), f.group.ignore = !0);
        });
      });
      var s = this._zr.painter.getType() === "svg" ? this.getSvgDataURL() : this.renderToCanvas(r).toDataURL("image/" + (r && r.type || "png"));
      return x(a, function(u) {
        u.group.ignore = !1;
      }), s;
    }, e.prototype.getConnectedDataURL = function(r) {
      if (this._disposed) {
        tt(this.id);
        return;
      }
      var n = r.type === "svg", i = this.group, a = Math.min, o = Math.max, s = 1 / 0;
      if (mg[i]) {
        var u = s, l = s, f = -s, h = -s, c = [], v = r && r.pixelRatio || this.getDevicePixelRatio();
        x(Na, function(_, S) {
          if (_.group === i) {
            var b = n ? _.getZr().painter.getSvgDom().innerHTML : _.renderToCanvas(ae(r)), w = _.getDom().getBoundingClientRect();
            u = a(w.left, u), l = a(w.top, l), f = o(w.right, f), h = o(w.bottom, h), c.push({
              dom: b,
              left: w.left,
              top: w.top
            });
          }
        }), u *= v, l *= v, f *= v, h *= v;
        var d = f - u, p = h - l, m = Zt.createCanvas(), g = ld(m, {
          renderer: n ? "svg" : "canvas"
        });
        if (g.resize({
          width: d,
          height: p
        }), n) {
          var y = "";
          return x(c, function(_) {
            var S = _.left - u, b = _.top - l;
            y += '<g transform="translate(' + S + "," + b + ')">' + _.dom + "</g>";
          }), g.painter.getSvgRoot().innerHTML = y, r.connectedBackgroundColor && g.painter.setBackgroundColor(r.connectedBackgroundColor), g.refreshImmediately(), g.painter.toDataURL();
        } else
          return r.connectedBackgroundColor && g.add(new Ce({
            shape: {
              x: 0,
              y: 0,
              width: d,
              height: p
            },
            style: {
              fill: r.connectedBackgroundColor
            }
          })), x(c, function(_) {
            var S = new or({
              style: {
                x: _.left * v - u,
                y: _.top * v - l,
                image: _.dom
              }
            });
            g.add(S);
          }), g.refreshImmediately(), m.toDataURL("image/" + (r && r.type || "png"));
      } else
        return this.getDataURL(r);
    }, e.prototype.convertToPixel = function(r, n, i) {
      return jo(this, "convertToPixel", r, n, i);
    }, e.prototype.convertToLayout = function(r, n, i) {
      return jo(this, "convertToLayout", r, n, i);
    }, e.prototype.convertFromPixel = function(r, n, i) {
      return jo(this, "convertFromPixel", r, n, i);
    }, e.prototype.containPixel = function(r, n) {
      if (this._disposed) {
        tt(this.id);
        return;
      }
      var i = this._model, a, o = Ml(i, r);
      return x(o, function(s, u) {
        u.indexOf("Models") >= 0 && x(s, function(l) {
          var f = l.coordinateSystem;
          if (f && f.containPoint)
            a = a || !!f.containPoint(n);
          else if (u === "seriesModels") {
            var h = this._chartsMap[l.__viewId];
            h && h.containPoint ? a = a || h.containPoint(n, l) : process.env.NODE_ENV !== "production" && nt(u + ": " + (h ? "The found component do not support containPoint." : "No view mapping to the found component."));
          } else
            process.env.NODE_ENV !== "production" && nt(u + ": containPoint is not supported");
        }, this);
      }, this), !!a;
    }, e.prototype.getVisual = function(r, n) {
      var i = this._model, a = Ml(i, r, {
        defaultMainType: "series"
      }), o = a.seriesModel;
      process.env.NODE_ENV !== "production" && (o || nt("There is no specified series model"));
      var s = o.getData(), u = a.hasOwnProperty("dataIndexInside") ? a.dataIndexInside : a.hasOwnProperty("dataIndex") ? s.indexOfRawIndex(a.dataIndex) : null;
      return u != null ? HM(s, u, n) : GM(s, n);
    }, e.prototype.getViewOfComponentModel = function(r) {
      return this._componentsMap[r.__viewId];
    }, e.prototype.getViewOfSeriesModel = function(r) {
      return this._chartsMap[r.__viewId];
    }, e.prototype._initEvents = function() {
      var r = this;
      x(FE, function(i) {
        var a = function(o) {
          var s = r.getModel(), u = o.target, l, f = i === "globalout";
          if (f ? l = {} : u && ba(u, function(p) {
            var m = me(p);
            if (m && m.dataIndex != null) {
              var g = m.dataModel || s.getSeriesByIndex(m.seriesIndex);
              return l = g && g.getDataParams(m.dataIndex, m.dataType, u) || {}, !0;
            } else if (m.eventData)
              return l = R({}, m.eventData), !0;
          }, !0), l) {
            var h = l.componentType, c = l.componentIndex;
            (h === "markLine" || h === "markPoint" || h === "markArea") && (h = "series", c = l.seriesIndex);
            var v = h && c != null && s.getComponent(h, c), d = v && r[v.mainType === "series" ? "_chartsMap" : "_componentsMap"][v.__viewId];
            process.env.NODE_ENV !== "production" && !f && !(v && d) && nt("model or view can not be found by params"), l.event = o, l.type = i, r._$eventProcessor.eventInfo = {
              targetEl: u,
              packedEvent: l,
              model: v,
              view: d
            }, r.trigger(i, l);
          }
        };
        a.zrEventfulCallAtLast = !0, r._zr.on(i, a, r);
      });
      var n = this._messageCenter;
      x(Ah, function(i, a) {
        n.on(a, function(o) {
          r.trigger(a, o);
        });
      }), UM(n, this, this._api);
    }, e.prototype.isDisposed = function() {
      return this._disposed;
    }, e.prototype.clear = function() {
      if (this._disposed) {
        tt(this.id);
        return;
      }
      this.setOption({
        series: []
      }, !0);
    }, e.prototype.dispose = function() {
      if (this._disposed) {
        tt(this.id);
        return;
      }
      this._disposed = !0;
      var r = this.getDom();
      r && Ny(this.getDom(), nv, "");
      var n = this, i = n._api, a = n._model;
      x(n._componentsViews, function(o) {
        o.dispose(a, i);
      }), x(n._chartsViews, function(o) {
        o.dispose(a, i);
      }), n._zr.dispose(), n._dom = n._model = n._chartsMap = n._componentsMap = n._chartsViews = n._componentsViews = n._scheduler = n._api = n._zr = n._throttledZrFlush = n._theme = n._coordSysMgr = n._messageCenter = null, delete Na[n.id];
    }, e.prototype.resize = function(r) {
      if (this[Ie]) {
        process.env.NODE_ENV !== "production" && he("`resize` should not be called during main process.");
        return;
      }
      if (this._disposed) {
        tt(this.id);
        return;
      }
      this._zr.resize(r);
      var n = this._model;
      if (this._loadingFX && this._loadingFX.resize(), !!n) {
        var i = n.resetOption("media"), a = r && r.silent;
        this[ke] && (a == null && (a = this[ke].silent), i = !0, this[ke] = null), this[Ie] = !0, ei(this);
        try {
          i && mn(this), fr.update.call(this, {
            type: "resize",
            animation: R({
              // Disable animation
              duration: 0
            }, r && r.animation)
          });
        } catch (o) {
          throw this[Ie] = !1, o;
        }
        this[Ie] = !1, jn.call(this, a), Jn.call(this, a);
      }
    }, e.prototype.showLoading = function(r, n) {
      if (this._disposed) {
        tt(this.id);
        return;
      }
      if (q(r) && (n = r, r = ""), r = r || "default", this.hideLoading(), !Lh[r]) {
        process.env.NODE_ENV !== "production" && nt("Loading effects " + r + " not exists.");
        return;
      }
      var i = Lh[r](this._api, n), a = this._zr;
      this._loadingFX = i, a.add(i);
    }, e.prototype.hideLoading = function() {
      if (this._disposed) {
        tt(this.id);
        return;
      }
      this._loadingFX && this._zr.remove(this._loadingFX), this._loadingFX = null;
    }, e.prototype.makeActionFromEvent = function(r) {
      var n = R({}, r);
      return n.type = au[r.type], n;
    }, e.prototype.dispatchAction = function(r, n) {
      if (this._disposed) {
        tt(this.id);
        return;
      }
      if (q(n) || (n = {
        silent: !!n
      }), !!iu[r.type] && this._model) {
        if (this[Ie]) {
          this._pendingActions.push(r);
          return;
        }
        var i = n.silent;
        uf.call(this, r, i);
        var a = n.flush;
        a ? this._zr.flush() : a !== !1 && re.browser.weChat && this._throttledZrFlush(), jn.call(this, i), Jn.call(this, i);
      }
    }, e.prototype.updateLabelLayout = function() {
      dt.trigger("series:layoutlabels", this._model, this._api, {
        // Not adding series labels.
        // TODO
        updatedSeries: []
      });
    }, e.prototype.appendData = function(r) {
      if (this._disposed) {
        tt(this.id);
        return;
      }
      var n = r.seriesIndex, i = this.getModel(), a = i.getSeriesByIndex(n);
      process.env.NODE_ENV !== "production" && N(r.data && a), a.appendData(r), this._scheduler.unfinished = !0, this.getZr().wakeUp();
    }, e.internalField = function() {
      mn = function(h) {
        XM(h._model);
        var c = h._scheduler;
        c.restorePipelines(h._zr, h._model), c.prepareStageTasks(), of(h, !0), of(h, !1), c.plan();
      }, of = function(h, c) {
        for (var v = h._model, d = h._scheduler, p = c ? h._componentsViews : h._chartsViews, m = c ? h._componentsMap : h._chartsMap, g = h._zr, y = h._api, _ = 0; _ < p.length; _++)
          p[_].__alive = !1;
        c ? v.eachComponent(function(w, T) {
          w !== "series" && S(T);
        }) : v.eachSeries(S);
        function S(w) {
          var T = w.__requireNewView;
          w.__requireNewView = !1;
          var M = "_ec_" + w.id + "_" + w.type, D = !T && m[M];
          if (!D) {
            var C = Xt(w.type), E = c ? Pt.getClass(C.main, C.sub) : (
              // FIXME:TS
              // (ChartView as ChartViewConstructor).getClass('series', classType.sub)
              // For backward compat, still support a chart type declared as only subType
              // like "liquidfill", but recommend "series.liquidfill"
              // But need a base class to make a type series.
              Jt.getClass(C.sub)
            );
            process.env.NODE_ENV !== "production" && N(E, C.sub + " does not exist."), D = new E(), D.init(v, y), m[M] = D, p.push(D), g.add(D.group);
          }
          w.__viewId = D.__id = M, D.__alive = !0, D.__model = w, D.group.__ecComponentInfo = {
            mainType: w.mainType,
            index: w.componentIndex
          }, !c && d.prepareView(D, w, v, y);
        }
        for (var _ = 0; _ < p.length; ) {
          var b = p[_];
          b.__alive ? _++ : (!c && b.renderTask.dispose(), g.remove(b.group), b.dispose(v, y), p.splice(_, 1), m[b.__id] === b && delete m[b.__id], b.__id = b.group.__ecComponentInfo = null);
        }
      }, Qo = function(h, c, v, d, p) {
        var m = h._model;
        if (m.setUpdatePayload(v), !d) {
          x([].concat(h._componentsViews).concat(h._chartsViews), S);
          return;
        }
        var g = Fw(v, d, p), y = v.excludeSeriesId, _;
        y != null && (_ = Z(), x(Qe(y), function(b) {
          var w = Qt(b, null);
          w != null && _.set(w, !0);
        })), m && m.eachComponent(g, function(b) {
          var w = _ && _.get(b.id) != null;
          if (!w)
            if ($d(v))
              if (b instanceof Wr)
                v.type === In && !v.notBlur && !b.get(["emphasis", "disabled"]) && ax(b, v, h._api);
              else {
                var T = wc(b.mainType, b.componentIndex, v.name, h._api), M = T.focusSelf, D = T.dispatchers;
                v.type === In && M && !v.notBlur && ch(b.mainType, b.componentIndex, h._api), D && x(D, function(C) {
                  v.type === In ? Us(C) : Ws(C);
                });
              }
            else dh(v) && b instanceof Wr && (ux(b, v, h._api), Yd(b), ct(h));
        }, h), m && m.eachComponent(g, function(b) {
          var w = _ && _.get(b.id) != null;
          w || S(h[d === "series" ? "_chartsMap" : "_componentsMap"][b.__viewId]);
        }, h);
        function S(b) {
          b && b.__alive && b[c] && b[c](b.__model, m, h._api, v);
        }
      }, fr = {
        prepareAndUpdate: function(h) {
          mn(this), fr.update.call(this, h, h && {
            // Needs to mark option changed if newOption is given.
            // It's from MagicType.
            // TODO If use a separate flag optionChanged in payload?
            optionChanged: h.newOption != null
          });
        },
        update: function(h, c) {
          var v = this._model, d = this._api, p = this._zr, m = this._coordSysMgr, g = this._scheduler;
          if (v) {
            ZM(v), v.setUpdatePayload(h), g.restoreData(v, h), g.performSeriesTasks(v), m.create(v, d), dt.trigger("coordsys:aftercreate", v, d), g.performDataProcessorTasks(v, h), sf(this, v), m.update(v, d), n(v), g.performVisualTasks(v, h);
            var y = v.get("backgroundColor") || "transparent";
            p.setBackgroundColor(y);
            var _ = v.get("darkMode");
            _ != null && _ !== "auto" && p.setDarkMode(_), lf(this, v, d, h, c), dt.trigger("afterupdate", v, d);
          }
        },
        /**
         * PENDING: See INCONSISTENCY_OF_BRUSH_SELECTED_EVENT_IN_UPDATE_TRANSFORM
         */
        updateTransform: function(h) {
          var c = this, v = c._model, d = c._api;
          if (v) {
            v.setUpdatePayload(h);
            var p = [];
            v.eachComponent(function(g, y) {
              if (g !== qy) {
                var _ = c.getViewOfComponentModel(y);
                if (_ && _.__alive)
                  if (_.updateTransform) {
                    var S = _.updateTransform(y, v, d, h);
                    S && S.update && p.push(_);
                  } else
                    p.push(_);
              }
            });
            var m = Z();
            v.eachSeries(function(g) {
              var y = c._chartsMap[g.__viewId], _ = g.pipelineContext;
              if (y.updateTransform && !_.progressiveRender) {
                var S = y.updateTransform(g, v, d, h);
                S && S.update && m.set(g.uid, 1);
              } else
                m.set(g.uid, 1);
            }), c._scheduler.performVisualTasks(v, h, {
              setDirty: !0,
              dirtyMap: m
            }), Jo(c, v, d, h, {}, m), dt.trigger("afterupdate", v, d);
          }
        },
        updateView: function(h) {
          var c = this._model;
          c && (c.setUpdatePayload(h), Jt.markUpdateMethod(h, "updateView"), n(c), this._scheduler.performVisualTasks(c, h, {
            setDirty: !0
          }), lf(this, c, this._api, h, {}), dt.trigger("afterupdate", c, this._api));
        },
        updateVisual: function(h) {
          var c = this, v = this._model;
          v && (v.setUpdatePayload(h), v.eachSeries(function(d) {
            d.getData().clearAllVisual();
          }), Jt.markUpdateMethod(h, "updateVisual"), n(v), this._scheduler.performVisualTasks(v, h, {
            visualType: "visual",
            setDirty: !0
          }), v.eachComponent(function(d, p) {
            if (d !== "series") {
              var m = c.getViewOfComponentModel(p);
              m && m.__alive && m.updateVisual(p, v, c._api, h);
            }
          }), v.eachSeries(function(d) {
            var p = c._chartsMap[d.__viewId];
            p.updateVisual(d, v, c._api, h);
          }), dt.trigger("afterupdate", v, this._api));
        },
        /**
         * @deprecated
         */
        updateLayout: function(h) {
          fr.update.call(this, h);
        }
      };
      function r(h, c, v, d, p) {
        if (h._disposed) {
          tt(h.id);
          return;
        }
        for (var m = h._model, g = h._coordSysMgr.getCoordinateSystems(), y, _ = Ml(m, v), S = 0; S < g.length; S++) {
          var b = g[S];
          if (b[c] && (y = b[c](m, _, d, p)) != null)
            return y;
        }
        process.env.NODE_ENV !== "production" && nt("No coordinate system that supports " + c + " found by the given finder.");
      }
      jo = r, sf = function(h, c) {
        var v = h._chartsMap, d = h._scheduler;
        c.eachSeries(function(p) {
          d.updateStreamModes(p, v[p.__viewId]);
        });
      }, uf = function(h, c) {
        var v = this, d = this.getModel(), p = h.type, m = h.escapeConnect, g = iu[p], y = (g.update || "update").split(":"), _ = y.pop(), S = y[0] != null && Xt(y[0]);
        this[Ie] = !0, ei(this);
        var b = [h], w = !1;
        h.batch && (w = !0, b = X(h.batch, function(L) {
          return L = ge(R({}, L), h), L.batch = null, L;
        }));
        var T = [], M, D = [], C = g.nonRefinedEventType, E = dh(h), I = $d(h);
        if (I && o0(this._api), x(b, function(L) {
          var B = g.action(L, d, v._api);
          if (g.refineEvent ? D.push(B) : M = B, M = M || R({}, L), M.type = C, T.push(M), I) {
            var U = cc(h), Y = U.queryOptionMap, j = U.mainTypeSpecified, K = j ? Y.keys()[0] : "series";
            Qo(v, _, L, K), ct(v);
          } else E ? (Qo(v, _, L, "series"), ct(v)) : S && Qo(v, _, L, S.main, S.sub);
        }), _ !== "none" && !I && !E && !S)
          try {
            this[ke] ? (mn(this), fr.update.call(this, h), this[ke] = null) : fr[_].call(this, h);
          } catch (L) {
            throw this[Ie] = !1, L;
          }
        if (w ? M = {
          type: C,
          escapeConnect: m,
          batch: T
        } : M = T[0], this[Ie] = !1, !c) {
          var A = void 0;
          if (g.refineEvent) {
            var O = g.refineEvent(D, h, d, this._api).eventContent;
            N(q(O)), A = ge({
              type: g.refinedEventType
            }, O), A.fromAction = h.type, A.fromActionPayload = h, A.escapeConnect = !0;
          }
          var P = this._messageCenter;
          P.trigger(M.type, M), A && P.trigger(A.type, A);
        }
      }, jn = function(h) {
        for (var c = this._pendingActions; c.length; ) {
          var v = c.shift();
          uf.call(this, v, h);
        }
      }, Jn = function(h) {
        !h && this.trigger("updated");
      }, cg = function(h, c) {
        h.on("rendered", function(v) {
          c.trigger("rendered", v), // Although zr is dirty if initial animation is not finished
          // and this checking is called on frame, we also check
          // animation finished for robustness.
          h.animation.isFinished() && !c[ke] && !c._scheduler.unfinished && !c._pendingActions.length ? c.trigger("finished") : h.refresh();
        });
      }, vg = function(h, c) {
        h.on("mouseover", function(v) {
          var d = v.target, p = ba(d, Ai);
          p && (ox(p, v, c._api), ct(c));
        }).on("mouseout", function(v) {
          var d = v.target, p = ba(d, Ai);
          p && (sx(p, v, c._api), ct(c));
        }).on("click", function(v) {
          var d = v.target, p = ba(d, function(y) {
            return me(y).dataIndex != null;
          }, !0);
          if (p) {
            var m = p.selected ? "unselect" : "select", g = me(p);
            c._api.dispatchAction({
              type: m,
              dataType: g.dataType,
              dataIndexInside: g.dataIndex,
              seriesIndex: g.seriesIndex,
              isFromClick: !0
            });
          }
        });
      };
      function n(h) {
        h.clearColorPalette(), h.eachSeries(function(c) {
          c.clearColorPalette();
        });
      }
      function i(h) {
        var c = [], v = [], d = !1;
        if (h.eachComponent(function(y, _) {
          var S = _.get("zlevel") || 0, b = _.get("z") || 0, w = _.getZLevelKey();
          d = d || !!w, (y === "series" ? v : c).push({
            zlevel: S,
            z: b,
            idx: _.componentIndex,
            type: y,
            key: w
          });
        }), d) {
          var p = c.concat(v), m, g;
          ls(p, function(y, _) {
            return y.zlevel === _.zlevel ? y.z - _.z : y.zlevel - _.zlevel;
          }), x(p, function(y) {
            var _ = h.getComponent(y.type, y.idx), S = y.zlevel, b = y.key;
            m != null && (S = Math.max(m, S)), b ? (S === m && b !== g && S++, g = b) : g && (S === m && S++, g = ""), m = S, _.setZLevel(S);
          });
        }
      }
      lf = function(h, c, v, d, p) {
        i(c), dg(h, c, v, d, p), x(h._chartsViews, function(m) {
          m.__alive = !1;
        }), Jo(h, c, v, d, p), x(h._chartsViews, function(m) {
          m.__alive || m.remove(c, v);
        });
      }, dg = function(h, c, v, d, p, m) {
        x(m || h._componentsViews, function(g) {
          var y = g.__model;
          l(y, g), g.render(y, c, v, d), u(y, g), f(y, g);
        });
      }, Jo = function(h, c, v, d, p, m) {
        var g = h._scheduler;
        p = R(p || {}, {
          updatedSeries: c.getSeries()
        }), dt.trigger("series:beforeupdate", c, v, p);
        var y = !1;
        c.eachSeries(function(_) {
          var S = h._chartsMap[_.__viewId];
          S.__alive = !0;
          var b = S.renderTask;
          g.updatePayload(b, d), l(_, S), m && m.get(_.uid) && b.dirty(), b.perform(g.getPerformArgs(b)) && (y = !0), S.group.silent = !!_.get("silent"), s(_, S), Yd(_);
        }), g.unfinished = y || g.unfinished, dt.trigger("series:layoutlabels", c, v, p), dt.trigger("series:transition", c, v, p), c.eachSeries(function(_) {
          var S = h._chartsMap[_.__viewId];
          u(_, S), f(_, S);
        }), o(h, c), dt.trigger("series:afterupdate", c, v, p);
      }, ct = function(h) {
        h[nf] = !0, h.getZr().wakeUp();
      }, ei = function(h) {
        h[Ko] = (h[Ko] + 1) % 1e6;
      }, gg = function(h) {
        h[nf] && (h.getZr().storage.traverse(function(c) {
          Aa(c) || a(c);
        }), h[nf] = !1);
      };
      function a(h) {
        for (var c = [], v = h.currentStates, d = 0; d < v.length; d++) {
          var p = v[d];
          p === "emphasis" || p === "blur" || p === "select" || c.push(p);
        }
        h.selected && h.states.select && c.push("select"), h.hoverState === Lu && h.states.emphasis ? c.push("emphasis") : h.hoverState === Ou && h.states.blur && c.push("blur"), h.useStates(c);
      }
      function o(h, c) {
        var v = h._zr;
        if (v.painter.type === "canvas") {
          var d = v.storage, p = 0;
          d.traverse(function(g) {
            g.isGroup || p++;
          });
          var m = p > W(c.get("hoverLayerThreshold"), Z0.hoverLayerThreshold) && !re.node && !re.worker;
          (h._usingTHL || m) && (c.eachSeries(function(g) {
            if (!g.preventUsingHoverLayer) {
              var y = h._chartsMap[g.__viewId];
              y.__alive && y.eachRendered(function(_) {
                var S = _.states.emphasis;
                S && S.hoverLayer !== Mc && (S.hoverLayer = m ? y0 : m0);
              });
            }
          }), h._usingTHL = m);
        }
      }
      function s(h, c) {
        var v = h.get("blendMode") || null;
        c.eachRendered(function(d) {
          d.isGroup || (d.style.blend = v);
        });
      }
      function u(h, c) {
        if (!h.preventAutoZ) {
          var v = Ya(h);
          c.eachRendered(function(d) {
            return D0(d, v.z, v.zlevel), !0;
          });
        }
      }
      function l(h, c) {
        c.eachRendered(function(v) {
          if (!Aa(v)) {
            var d = v.getTextContent(), p = v.getTextGuideLine();
            v.stateTransition && (v.stateTransition = null), d && d.stateTransition && (d.stateTransition = null), p && p.stateTransition && (p.stateTransition = null), v.hasState() ? (v.prevStates = v.currentStates, v.clearStates()) : v.prevStates && (v.prevStates = null);
          }
        });
      }
      function f(h, c) {
        var v = h.getModel("stateAnimation"), d = h.isAnimationEnabled(), p = v.get("duration"), m = p > 0 ? {
          duration: p,
          delay: v.get("delay"),
          easing: v.get("easing")
          // additive: stateAnimationModel.get('additive')
        } : null;
        c.eachRendered(function(g) {
          if (g.states && g.states.emphasis) {
            if (Aa(g))
              return;
            if (g instanceof be && dx(g), g.__dirty) {
              var y = g.prevStates;
              y && g.useStates(y);
            }
            if (d) {
              g.stateTransition = m;
              var _ = g.getTextContent(), S = g.getTextGuideLine();
              _ && (_.stateTransition = m), S && (S.stateTransition = m);
            }
            g.__dirty && a(g);
          }
        });
      }
      pg = function(h) {
        return new /** @class */
        (function(c) {
          V(v, c);
          function v() {
            return c !== null && c.apply(this, arguments) || this;
          }
          return v.prototype.getCoordinateSystems = function() {
            return h._coordSysMgr.getCoordinateSystems();
          }, v.prototype.getComponentByElement = function(d) {
            for (; d; ) {
              var p = d.__ecComponentInfo;
              if (p != null)
                return h._model.getComponent(p.mainType, p.index);
              d = d.parent;
            }
          }, v.prototype.enterEmphasis = function(d, p) {
            Us(d, p), ct(h);
          }, v.prototype.leaveEmphasis = function(d, p) {
            Ws(d, p), ct(h);
          }, v.prototype.enterBlur = function(d) {
            ix(d), ct(h);
          }, v.prototype.leaveBlur = function(d) {
            r0(d), ct(h);
          }, v.prototype.enterSelect = function(d) {
            n0(d), ct(h);
          }, v.prototype.leaveSelect = function(d) {
            i0(d), ct(h);
          }, v.prototype.getModel = function() {
            return h.getModel();
          }, v.prototype.getViewOfComponentModel = function(d) {
            return h.getViewOfComponentModel(d);
          }, v.prototype.getViewOfSeriesModel = function(d) {
            return h.getViewOfSeriesModel(d);
          }, v.prototype.getECUpdateCycleVersion = function() {
            return h[Ko];
          }, v.prototype.usingTHL = function() {
            return h._usingTHL;
          }, v;
        }(Qy))(h);
      }, F_ = function(h) {
        function c(v, d) {
          for (var p = 0; p < v.length; p++) {
            var m = v[p];
            m[af] = d;
          }
        }
        x(au, function(v, d) {
          h._messageCenter.on(d, function(p) {
            if (mg[h.group] && h[af] !== hg) {
              if (p && p.escapeConnect)
                return;
              var m = h.makeActionFromEvent(p), g = [];
              x(Na, function(y) {
                y !== h && y.group === h.group && g.push(y);
              }), c(g, hg), x(g, function(y) {
                y[af] !== BE && y.dispatchAction(m);
              }), c(g, VE);
            }
          });
        });
      };
    }(), e;
  }(ar)
), rv = z_.prototype;
rv.on = N_("on");
rv.off = N_("off");
rv.one = function(t, e, r) {
  var n = this;
  tr("ECharts#one is deprecated.");
  function i() {
    for (var a = [], o = 0; o < arguments.length; o++)
      a[o] = arguments[o];
    e && e.apply && e.apply(this, a), n.off(t, i);
  }
  this.on.call(this, t, i, r);
};
var FE = ["click", "dblclick", "mouseover", "mouseout", "mousemove", "mousedown", "mouseup", "globalout", "contextmenu"];
function tt(t) {
  process.env.NODE_ENV !== "production" && nt("Instance " + t + " has been disposed");
}
var iu = {}, au = {}, Ah = {}, Ih = [], Oh = [], ou = [], H_ = {}, Lh = {}, Na = {}, mg = {}, zE = +/* @__PURE__ */ new Date() - 0, nv = "_echarts_instance_";
function HE(t, e, r) {
  var n = !(r && r.ssr);
  if (n) {
    if (process.env.NODE_ENV !== "production" && !t)
      throw new Error("Initialize failed: invalid dom.");
    var i = GE(t);
    if (i)
      return process.env.NODE_ENV !== "production" && nt("There is a chart instance already initialized on the dom."), i;
    process.env.NODE_ENV !== "production" && Si(t) && t.nodeName.toUpperCase() !== "CANVAS" && (!t.clientWidth && (!r || r.width == null) || !t.clientHeight && (!r || r.height == null)) && nt("Can't get DOM width or height. Please check dom.clientWidth and dom.clientHeight. They should not be 0.For example, you may need to call this in the callback of window.onload.");
  }
  var a = new z_(t, e, r);
  return a.id = "ec_" + zE++, Na[a.id] = a, n && Ny(t, nv, a.id), F_(a), dt.trigger("afterinit", a), a;
}
function GE(t) {
  return Na[zw(t, nv)];
}
function G_(t, e) {
  H_[t] = e;
}
function U_(t) {
  fe(Oh, t) < 0 && Oh.push(t);
}
function W_(t, e) {
  av(Ih, t, e, IE);
}
function UE(t) {
  iv("afterinit", t);
}
function WE(t) {
  iv("afterupdate", t);
}
function iv(t, e) {
  dt.on(t, e);
}
function Fn(t, e, r) {
  var n, i, a, o, s;
  Q(e) && (r = e, e = ""), q(t) ? (n = t.type, i = t.event, o = t.update, s = t.publishNonRefinedEvent, r || (r = t.action), a = t.refineEvent) : (n = t, i = e);
  function u(f) {
    return f.toLowerCase();
  }
  i = u(i || n);
  var l = a ? u(n) : i;
  iu[n] || (N(fg.test(n) && fg.test(i)), a && N(i !== n), iu[n] = {
    actionType: n,
    refinedEventType: i,
    nonRefinedEventType: l,
    update: o,
    action: r,
    refineEvent: a
  }, Ah[i] = 1, a && s && (Ah[l] = 1), process.env.NODE_ENV !== "production" && au[l] && he(l + ' must not be shared; use "refineEvent" if you intend to share an event name.'), au[l] = n);
}
function YE(t, e) {
  Zc.register(t, e);
}
function XE(t, e) {
  av(ou, t, e, O_, "layout", !0);
}
function zn(t, e) {
  av(ou, t, e, L_, "visual", !0);
}
var yg = [];
function av(t, e, r, n, i, a) {
  if ((Q(e) || q(e)) && (r = e, e = n), process.env.NODE_ENV !== "production") {
    if (isNaN(e) || e == null)
      throw new Error("Illegal priority");
    x(t, function(s) {
      N(s.__raw !== r);
    });
  }
  if (!(fe(yg, r) >= 0)) {
    yg.push(r);
    var o = S_.wrapStageHandler(r, i);
    o.__prio = e, o.__raw = r, t.push(o), process.env.NODE_ENV !== "production" && a && N(!o.dirtyOnOverallProgress, "dirtyOnOverallProgress is not allowed in " + i + " stage; otherwise progressive rendering is disabled on all series.");
  }
}
function Y_(t, e) {
  Lh[t] = e;
}
function ZE(t, e, r) {
  var n = YM("registerMap");
  n && n(t, e, r);
}
var $E = qD;
zn(tv, CM);
zn($u, DM);
zn($u, MM);
zn(tv, FM);
zn($u, zM);
zn(P_, TE);
U_(j0);
W_(ME, MD);
Y_("default", EM);
Fn({
  type: In,
  event: In,
  update: In
}, Fe);
Fn({
  type: gs,
  event: gs,
  update: gs
}, Fe);
Fn({
  type: Hs,
  event: Sc,
  update: Hs,
  action: Fe,
  refineEvent: ov,
  publishNonRefinedEvent: !0
});
Fn({
  type: fh,
  event: Sc,
  update: fh,
  action: Fe,
  refineEvent: ov,
  publishNonRefinedEvent: !0
});
Fn({
  type: Gs,
  event: Sc,
  update: Gs,
  action: Fe,
  refineEvent: ov,
  publishNonRefinedEvent: !0
});
function ov(t, e, r, n) {
  return {
    eventContent: {
      selected: lx(r),
      isFromClick: e.isFromClick || !1
    }
  };
}
G_("default", {});
G_("dark", x_);
function ta(t) {
  return t == null ? 0 : t.length || 1;
}
function _g(t) {
  return t;
}
var qE = (
  /** @class */
  function() {
    function t(e, r, n, i, a, o) {
      this._old = e, this._new = r, this._oldKeyGetter = n || _g, this._newKeyGetter = i || _g, this.context = a, this._diffModeMultiple = o === "multiple";
    }
    return t.prototype.add = function(e) {
      return this._add = e, this;
    }, t.prototype.update = function(e) {
      return this._update = e, this;
    }, t.prototype.updateManyToOne = function(e) {
      return this._updateManyToOne = e, this;
    }, t.prototype.updateOneToMany = function(e) {
      return this._updateOneToMany = e, this;
    }, t.prototype.updateManyToMany = function(e) {
      return this._updateManyToMany = e, this;
    }, t.prototype.remove = function(e) {
      return this._remove = e, this;
    }, t.prototype.execute = function() {
      this[this._diffModeMultiple ? "_executeMultiple" : "_executeOneToOne"]();
    }, t.prototype._executeOneToOne = function() {
      var e = this._old, r = this._new, n = {}, i = new Array(e.length), a = new Array(r.length);
      this._initIndexMap(e, null, i, "_oldKeyGetter"), this._initIndexMap(r, n, a, "_newKeyGetter");
      for (var o = 0; o < e.length; o++) {
        var s = i[o], u = n[s], l = ta(u);
        if (l > 1) {
          var f = u.shift();
          u.length === 1 && (n[s] = u[0]), this._update && this._update(f, o);
        } else l === 1 ? (n[s] = null, this._update && this._update(u, o)) : this._remove && this._remove(o);
      }
      this._performRestAdd(a, n);
    }, t.prototype._executeMultiple = function() {
      var e = this._old, r = this._new, n = {}, i = {}, a = [], o = [];
      this._initIndexMap(e, n, a, "_oldKeyGetter"), this._initIndexMap(r, i, o, "_newKeyGetter");
      for (var s = 0; s < a.length; s++) {
        var u = a[s], l = n[u], f = i[u], h = ta(l), c = ta(f);
        if (h > 1 && c === 1)
          this._updateManyToOne && this._updateManyToOne(f, l), i[u] = null;
        else if (h === 1 && c > 1)
          this._updateOneToMany && this._updateOneToMany(f, l), i[u] = null;
        else if (h === 1 && c === 1)
          this._update && this._update(f, l), i[u] = null;
        else if (h > 1 && c > 1)
          this._updateManyToMany && this._updateManyToMany(f, l), i[u] = null;
        else if (h > 1)
          for (var v = 0; v < h; v++)
            this._remove && this._remove(l[v]);
        else
          this._remove && this._remove(l);
      }
      this._performRestAdd(o, i);
    }, t.prototype._performRestAdd = function(e, r) {
      for (var n = 0; n < e.length; n++) {
        var i = e[n], a = r[i], o = ta(a);
        if (o > 1)
          for (var s = 0; s < o; s++)
            this._add && this._add(a[s]);
        else o === 1 && this._add && this._add(a);
        r[i] = null;
      }
    }, t.prototype._initIndexMap = function(e, r, n, i) {
      for (var a = this._diffModeMultiple, o = 0; o < e.length; o++) {
        var s = "_ec_" + this[i](e[o], o);
        if (a || (n[o] = s), !!r) {
          var u = r[s], l = ta(u);
          l === 0 ? (r[s] = o, a && n.push(s)) : l === 1 ? r[s] = [u, o] : u.push(o);
        }
      }
    }, t;
  }()
), KE = (
  /** @class */
  function() {
    function t(e, r) {
      this._encode = e, this._schema = r;
    }
    return t.prototype.get = function() {
      return {
        // Do not generate full dimension name until fist used.
        fullDimensions: this._getFullDimensionNames(),
        encode: this._encode
      };
    }, t.prototype._getFullDimensionNames = function() {
      return this._cachedDimNames || (this._cachedDimNames = this._schema ? this._schema.makeOutputDimensionNames() : []), this._cachedDimNames;
    }, t;
  }()
);
function QE(t, e) {
  var r = {}, n = r.encode = {}, i = Z(), a = [], o = [], s = {};
  x(t.dimensions, function(c) {
    var v = t.getDimensionInfo(c), d = v.coordDim;
    if (d) {
      process.env.NODE_ENV !== "production" && N(lh.get(d) == null);
      var p = v.coordDimIndex;
      ff(n, d)[p] = c, v.isExtraCoord || (i.set(d, 1), JE(v.type) && (a[0] = c), ff(s, d)[p] = t.getDimensionIndex(v.name)), v.defaultTooltip && o.push(c);
    }
    lh.each(function(m, g) {
      var y = ff(n, g), _ = v.otherDims[g];
      _ != null && _ !== !1 && (y[_] = v.name);
    });
  });
  var u = [], l = {};
  i.each(function(c, v) {
    var d = n[v];
    l[v] = d[0], u = u.concat(d);
  }), r.dataDimsOnCoord = u, r.dataDimIndicesOnCoord = X(u, function(c) {
    return t.getDimensionInfo(c).storeDimIndex;
  }), r.encodeFirstDimNotExtra = l;
  var f = n.label;
  f && f.length && (a = f.slice());
  var h = n.tooltip;
  return h && h.length ? o = h.slice() : o.length || (o = a.slice()), n.defaultedLabel = a, n.defaultedTooltip = o, r.userOutput = new KE(s, e), r;
}
function ff(t, e) {
  return t.hasOwnProperty(e) || (t[e] = []), t[e];
}
function jE(t) {
  return t === "category" ? "ordinal" : t === "time" ? "time" : "float";
}
function JE(t) {
  return !(t === "ordinal" || t === "time");
}
var xs = (
  /** @class */
  /* @__PURE__ */ function() {
    function t(e) {
      this.otherDims = {}, e != null && R(this, e);
    }
    return t;
  }()
), eA = ve(), tA = {
  float: "f",
  int: "i",
  ordinal: "o",
  number: "n",
  time: "t"
}, X_ = (
  /** @class */
  function() {
    function t(e) {
      this.dimensions = e.dimensions, this._dimOmitted = e.dimensionOmitted, this.source = e.source, this._fullDimCount = e.fullDimensionCount, this._updateDimOmitted(e.dimensionOmitted);
    }
    return t.prototype.isDimensionOmitted = function() {
      return this._dimOmitted;
    }, t.prototype._updateDimOmitted = function(e) {
      this._dimOmitted = e, e && (this._dimNameMap || (this._dimNameMap = $_(this.source)));
    }, t.prototype.getSourceDimensionIndex = function(e) {
      return W(this._dimNameMap.get(e), -1);
    }, t.prototype.getSourceDimension = function(e) {
      var r = this.source.dimensionsDefine;
      if (r)
        return r[e];
    }, t.prototype.makeStoreSchema = function() {
      for (var e = this._fullDimCount, r = t_(this.source), n = !q_(e), i = "", a = [], o = 0, s = 0; o < e; o++) {
        var u = void 0, l = void 0, f = void 0, h = this.dimensions[s];
        if (h && h.storeDimIndex === o)
          u = r ? h.name : null, l = h.type, f = h.ordinalMeta, s++;
        else {
          var c = this.getSourceDimension(o);
          c && (u = r ? c.name : null, l = c.type);
        }
        a.push({
          property: u,
          type: l,
          ordinalMeta: f
        }), r && u != null && (!h || !h.isCalculationCoord) && (i += n ? u.replace(/\`/g, "`1").replace(/\$/g, "`2") : u), i += "$", i += tA[l] || "f", f && (i += f.uid), i += "$";
      }
      var v = this.source, d = [v.seriesLayoutBy, v.startIndex, i].join("$$");
      return {
        dimensions: a,
        hash: d
      };
    }, t.prototype.makeOutputDimensionNames = function() {
      for (var e = [], r = 0, n = 0; r < this._fullDimCount; r++) {
        var i = void 0, a = this.dimensions[n];
        if (a && a.storeDimIndex === r)
          a.isCalculationCoord || (i = a.name), n++;
        else {
          var o = this.getSourceDimension(r);
          o && (i = o.name);
        }
        e.push(i);
      }
      return e;
    }, t.prototype.appendCalculationDimension = function(e) {
      this.dimensions.push(e), e.isCalculationCoord = !0, this._fullDimCount++, this._updateDimOmitted(!0);
    }, t;
  }()
);
function Z_(t) {
  return t instanceof X_;
}
function sv(t) {
  for (var e = Z(), r = 0; r < (t || []).length; r++) {
    var n = t[r], i = q(n) ? n.name : n;
    i != null && e.get(i) == null && e.set(i, r);
  }
  return e;
}
function $_(t) {
  var e = eA(t);
  return e.dimNameMap || (e.dimNameMap = sv(t.dimensionsDefine));
}
function q_(t) {
  return t > 30;
}
var ra = q, xr = X, rA = typeof Int32Array > "u" ? Array : Int32Array, nA = "e\0\0", Sg = -1, iA = ["hasItemOption", "_nameList", "_idList", "_invertedIndicesMap", "_dimSummary", "userOutput", "_rawData", "_dimValueGetter", "_nameDimIdx", "_idDimIdx", "_nameRepeatCount"], aA = ["_approximateExtent"], bg, es, na, ti, hf, ia, cf, oA = (
  /** @class */
  function() {
    function t(e, r) {
      this.type = "list", this._dimOmitted = !1, this._nameList = [], this._idList = [], this._visual = {}, this._layout = {}, this._itemVisuals = [], this._itemLayouts = [], this._graphicEls = [], this._approximateExtent = {}, this._calculationInfo = {}, this.hasItemOption = !1, this.TRANSFERABLE_METHODS = ["cloneShallow", "downSample", "minmaxDownSample", "lttbDownSample", "map"], this.CHANGABLE_METHODS = ["filterSelf", "selectRange"], this.DOWNSAMPLE_METHODS = ["downSample", "minmaxDownSample", "lttbDownSample"];
      var n, i = !1;
      Z_(e) ? (n = e.dimensions, this._dimOmitted = e.isDimensionOmitted(), this._schema = e) : (i = !0, n = e), n = n || ["x", "y"];
      for (var a = {}, o = [], s = {}, u = !1, l = {}, f = 0; f < n.length; f++) {
        var h = n[f], c = z(h) ? new xs({
          name: h
        }) : h instanceof xs ? h : new xs(h), v = c.name;
        c.type = c.type || "float", c.coordDim || (c.coordDim = v, c.coordDimIndex = 0);
        var d = c.otherDims = c.otherDims || {};
        o.push(v), a[v] = c, l[v] != null && (u = !0), c.createInvertedIndices && (s[v] = []), process.env.NODE_ENV !== "production" && N(i || c.storeDimIndex >= 0), i && (c.storeDimIndex = f), d.itemName === 0 && (this._nameDimIdx = c.storeDimIndex), d.itemId === 0 && (this._idDimIdx = c.storeDimIndex);
      }
      if (this.dimensions = o, this._dimInfos = a, this._initGetDimensionInfo(u), this.hostModel = r, this._invertedIndicesMap = s, this._dimOmitted) {
        var p = this._dimIdxToName = Z();
        x(o, function(m) {
          p.set(a[m].storeDimIndex, m);
        });
      }
    }
    return t.prototype.getDimension = function(e) {
      var r = this._recognizeDimIndex(e);
      if (r == null)
        return e;
      if (r = e, !this._dimOmitted)
        return this.dimensions[r];
      var n = this._dimIdxToName.get(r);
      if (n != null)
        return n;
      var i = this._schema.getSourceDimension(r);
      if (i)
        return i.name;
    }, t.prototype.getDimensionIndex = function(e) {
      var r = this._recognizeDimIndex(e);
      if (r != null)
        return r;
      if (e == null)
        return -1;
      var n = this._getDimInfo(e);
      return n ? n.storeDimIndex : this._dimOmitted ? this._schema.getSourceDimensionIndex(e) : -1;
    }, t.prototype._recognizeDimIndex = function(e) {
      if (Te(e) || e != null && !isNaN(e) && !this._getDimInfo(e) && (!this._dimOmitted || this._schema.getSourceDimensionIndex(e) < 0))
        return +e;
    }, t.prototype._getStoreDimIndex = function(e) {
      var r = this.getDimensionIndex(e);
      if (process.env.NODE_ENV !== "production" && r == null)
        throw new Error("Unknown dimension " + e);
      return r;
    }, t.prototype.getDimensionInfo = function(e) {
      return this._getDimInfo(this.getDimension(e));
    }, t.prototype._initGetDimensionInfo = function(e) {
      var r = this._dimInfos;
      this._getDimInfo = e ? function(n) {
        return r.hasOwnProperty(n) ? r[n] : void 0;
      } : function(n) {
        return r[n];
      };
    }, t.prototype.getDimensionsOnCoord = function() {
      return this._dimSummary.dataDimsOnCoord.slice();
    }, t.prototype.mapDimension = function(e, r) {
      var n = this._dimSummary;
      if (r == null)
        return n.encodeFirstDimNotExtra[e];
      var i = n.encode[e];
      return i ? i[r] : null;
    }, t.prototype.mapDimensionsAll = function(e) {
      var r = this._dimSummary, n = r.encode[e];
      return (n || []).slice();
    }, t.prototype.getStore = function() {
      return this._store;
    }, t.prototype.initData = function(e, r, n) {
      var i = this, a;
      if (e instanceof bh && (a = e), !a) {
        var o = this.dimensions, s = jc(e) || ot(e) ? new r_(e, o.length) : e;
        a = new bh();
        var u = xr(o, function(l) {
          return {
            type: i._dimInfos[l].type,
            property: l
          };
        });
        a.initData(s, u, n);
      }
      this._store = a, this._nameList = (r || []).slice(), this._idList = [], this._nameRepeatCount = {}, this._doInit(0, a.count()), this._dimSummary = QE(this, this._schema), this.userOutput = this._dimSummary.userOutput;
    }, t.prototype.appendData = function(e) {
      var r = this._store.appendData(e);
      this._doInit(r[0], r[1]);
    }, t.prototype.appendValues = function(e, r) {
      var n = this._store.appendValues(e, r && r.length), i = n.start, a = n.end, o = this._shouldMakeIdFromName();
      if (this._updateOrdinalMeta(), r)
        for (var s = i; s < a; s++) {
          var u = s - i;
          this._nameList[s] = r[u], o && cf(this, s);
        }
    }, t.prototype._updateOrdinalMeta = function() {
      for (var e = this._store, r = this.dimensions, n = 0; n < r.length; n++) {
        var i = this._dimInfos[r[n]];
        i.ordinalMeta && e.collectOrdinalMeta(i.storeDimIndex, i.ordinalMeta);
      }
    }, t.prototype._shouldMakeIdFromName = function() {
      var e = this._store.getProvider();
      return this._idDimIdx == null && e.getSource().sourceFormat !== pr && !e.fillStorage;
    }, t.prototype._doInit = function(e, r) {
      if (!(e >= r)) {
        var n = this._store, i = n.getProvider();
        this._updateOrdinalMeta();
        var a = this._nameList, o = this._idList, s = i.getSource().sourceFormat, u = s === ft;
        if (u && !i.pure)
          for (var l = [], f = e; f < r; f++) {
            var h = i.getItem(f, l);
            if (!this.hasItemOption && Mw(h) && (this.hasItemOption = !0), h) {
              var c = h.name;
              a[f] == null && c != null && (a[f] = Qt(c, null));
              var v = h.id;
              o[f] == null && v != null && (o[f] = Qt(v, null));
            }
          }
        if (this._shouldMakeIdFromName())
          for (var f = e; f < r; f++)
            cf(this, f);
        bg(this);
      }
    }, t.prototype.getApproximateExtent = function(e, r) {
      return this._approximateExtent[e] || this._store.getDataExtent(this._getStoreDimIndex(e), r);
    }, t.prototype.setApproximateExtent = function(e, r) {
      r = this.getDimension(r), this._approximateExtent[r] = e.slice();
    }, t.prototype.getCalculationInfo = function(e) {
      return this._calculationInfo[e];
    }, t.prototype.setCalculationInfo = function(e, r) {
      ra(e) ? R(this._calculationInfo, e) : this._calculationInfo[e] = r;
    }, t.prototype.getName = function(e) {
      var r = this.getRawIndex(e), n = this._nameList[r];
      return n == null && this._nameDimIdx != null && (n = na(this, this._nameDimIdx, r)), n == null && (n = ""), n;
    }, t.prototype._getCategory = function(e, r) {
      var n = this._store.get(e, r), i = this._store.getOrdinalMeta(e);
      return i ? i.categories[n] : n;
    }, t.prototype.getId = function(e) {
      return es(this, this.getRawIndex(e));
    }, t.prototype.count = function() {
      return this._store.count();
    }, t.prototype.get = function(e, r) {
      var n = this._store, i = this._dimInfos[e];
      if (i)
        return n.get(i.storeDimIndex, r);
    }, t.prototype.getByRawIndex = function(e, r) {
      var n = this._store, i = this._dimInfos[e];
      if (i)
        return n.getByRawIndex(i.storeDimIndex, r);
    }, t.prototype.getIndices = function() {
      return this._store.getIndices();
    }, t.prototype.getDataExtent = function(e) {
      return this._store.getDataExtent(this._getStoreDimIndex(e), null);
    }, t.prototype.getSum = function(e) {
      return this._store.getSum(this._getStoreDimIndex(e));
    }, t.prototype.getMedian = function(e) {
      return this._store.getMedian(this._getStoreDimIndex(e));
    }, t.prototype.getValues = function(e, r) {
      var n = this, i = this._store;
      return H(e) ? i.getValues(xr(e, function(a) {
        return n._getStoreDimIndex(a);
      }), r) : i.getValues(e);
    }, t.prototype.hasValue = function(e) {
      for (var r = this._dimSummary.dataDimIndicesOnCoord, n = 0, i = r.length; n < i; n++)
        if (isNaN(this._store.get(r[n], e)))
          return !1;
      return !0;
    }, t.prototype.indexOfName = function(e) {
      for (var r = 0, n = this._store.count(); r < n; r++)
        if (this.getName(r) === e)
          return r;
      return -1;
    }, t.prototype.getRawIndex = function(e) {
      return this._store.getRawIndex(e);
    }, t.prototype.indexOfRawIndex = function(e) {
      return this._store.indexOfRawIndex(e);
    }, t.prototype.rawIndexOf = function(e, r) {
      var n = e && this._invertedIndicesMap[e];
      if (process.env.NODE_ENV !== "production" && !n)
        throw new Error("Do not supported yet");
      var i = n && n[r];
      return i == null || isNaN(i) ? Sg : i;
    }, t.prototype.each = function(e, r, n) {
      Q(e) && (n = r, r = e, e = []);
      var i = n || this, a = xr(ti(e), this._getStoreDimIndex, this);
      this._store.each(a, i ? te(r, i) : r);
    }, t.prototype.filterSelf = function(e, r, n) {
      Q(e) && (n = r, r = e, e = []);
      var i = n || this, a = xr(ti(e), this._getStoreDimIndex, this);
      return this._store = this._store.filter(a, i ? te(r, i) : r), this;
    }, t.prototype.selectRange = function(e) {
      var r = this, n = {}, i = le(e);
      return x(i, function(a) {
        var o = r._getStoreDimIndex(a);
        n[o] = e[a];
      }), this._store = this._store.selectRange(n), this;
    }, t.prototype.mapArray = function(e, r, n) {
      Q(e) && (n = r, r = e, e = []), n = n || this;
      var i = [];
      return this.each(e, function() {
        i.push(r && r.apply(this, arguments));
      }, n), i;
    }, t.prototype.map = function(e, r, n, i) {
      var a = n || i || this, o = xr(ti(e), this._getStoreDimIndex, this), s = ia(this);
      return s._store = this._store.map(o, a ? te(r, a) : r), s;
    }, t.prototype.modify = function(e, r, n, i) {
      var a = this, o = n || i || this;
      process.env.NODE_ENV !== "production" && x(ti(e), function(u) {
        var l = a.getDimensionInfo(u);
        l.isCalculationCoord || console.error("Danger: only stack dimension can be modified");
      });
      var s = xr(ti(e), this._getStoreDimIndex, this);
      this._store.modify(s, o ? te(r, o) : r);
    }, t.prototype.downSample = function(e, r, n, i) {
      var a = ia(this);
      return a._store = this._store.downSample(this._getStoreDimIndex(e), r, n, i), a;
    }, t.prototype.minmaxDownSample = function(e, r) {
      var n = ia(this);
      return n._store = this._store.minmaxDownSample(this._getStoreDimIndex(e), r), n;
    }, t.prototype.lttbDownSample = function(e, r) {
      var n = ia(this);
      return n._store = this._store.lttbDownSample(this._getStoreDimIndex(e), r), n;
    }, t.prototype.getRawDataItem = function(e) {
      return this._store.getRawDataItem(e);
    }, t.prototype.getItemModel = function(e) {
      var r = this.hostModel, n = this.getRawDataItem(e);
      return new xe(n, r, r && r.ecModel);
    }, t.prototype.diff = function(e) {
      var r = this;
      return new qE(e ? e.getStore().getIndices() : [], this.getStore().getIndices(), function(n) {
        return es(e, n);
      }, function(n) {
        return es(r, n);
      });
    }, t.prototype.getVisual = function(e) {
      var r = this._visual;
      return r && r[e];
    }, t.prototype.setVisual = function(e, r) {
      this._visual = this._visual || {}, ra(e) ? R(this._visual, e) : this._visual[e] = r;
    }, t.prototype.getItemVisual = function(e, r) {
      var n = this._itemVisuals[e], i = n && n[r];
      return i ?? this.getVisual(r);
    }, t.prototype.hasItemVisual = function() {
      return this._itemVisuals.length > 0;
    }, t.prototype.ensureUniqueItemVisual = function(e, r) {
      var n = this._itemVisuals, i = n[e];
      i || (i = n[e] = {});
      var a = i[r];
      return a == null && (a = this.getVisual(r), H(a) ? a = a.slice() : ra(a) && (a = R({}, a)), i[r] = a), a;
    }, t.prototype.setItemVisual = function(e, r, n) {
      var i = this._itemVisuals[e] || {};
      this._itemVisuals[e] = i, ra(r) ? R(i, r) : i[r] = n;
    }, t.prototype.clearAllVisual = function() {
      this._visual = {}, this._itemVisuals = [];
    }, t.prototype.setLayout = function(e, r) {
      ra(e) ? R(this._layout, e) : this._layout[e] = r;
    }, t.prototype.getLayout = function(e) {
      return this._layout[e];
    }, t.prototype.getItemLayout = function(e) {
      return this._itemLayouts[e];
    }, t.prototype.setItemLayout = function(e, r, n) {
      this._itemLayouts[e] = n ? R(this._itemLayouts[e] || {}, r) : r;
    }, t.prototype.clearItemLayouts = function() {
      this._itemLayouts.length = 0;
    }, t.prototype.setItemGraphicEl = function(e, r) {
      var n = this.hostModel && this.hostModel.seriesIndex;
      XT(n, this.dataType, e, r), this._graphicEls[e] = r;
    }, t.prototype.getItemGraphicEl = function(e) {
      return this._graphicEls[e];
    }, t.prototype.eachItemGraphicEl = function(e, r) {
      x(this._graphicEls, function(n, i) {
        n && e && e.call(r, n, i);
      });
    }, t.prototype.cloneShallow = function(e) {
      return e || (e = new t(this._schema ? this._schema : xr(this.dimensions, this._getDimInfo, this), this.hostModel)), hf(e, this), e._store = this._store, e;
    }, t.prototype.wrapMethod = function(e, r) {
      var n = this[e];
      Q(n) && (this.__wrappedMethods = this.__wrappedMethods || [], this.__wrappedMethods.push(e), this[e] = function() {
        var i = n.apply(this, arguments);
        return r.apply(this, [i].concat(ec(arguments)));
      });
    }, t.internalField = function() {
      bg = function(e) {
        var r = e._invertedIndicesMap;
        x(r, function(n, i) {
          var a = e._dimInfos[i], o = a.ordinalMeta, s = e._store;
          if (o) {
            n = r[i] = new rA(o.categories.length);
            for (var u = 0; u < n.length; u++)
              n[u] = Sg;
            for (var u = 0; u < s.count(); u++)
              n[s.get(a.storeDimIndex, u)] = u;
          }
        });
      }, na = function(e, r, n) {
        return Qt(e._getCategory(r, n), null);
      }, es = function(e, r) {
        var n = e._idList[r];
        return n == null && e._idDimIdx != null && (n = na(e, e._idDimIdx, r)), n == null && (n = nA + r), n;
      }, ti = function(e) {
        return H(e) || (e = e != null ? [e] : []), e;
      }, ia = function(e) {
        var r = new t(e._schema ? e._schema : xr(e.dimensions, e._getDimInfo, e), e.hostModel);
        return hf(r, e), r;
      }, hf = function(e, r) {
        x(iA.concat(r.__wrappedMethods || []), function(n) {
          r.hasOwnProperty(n) && (e[n] = r[n]);
        }), e.__wrappedMethods = r.__wrappedMethods, x(aA, function(n) {
          e[n] = ae(r[n]);
        }), e._calculationInfo = R({}, r._calculationInfo);
      }, cf = function(e, r) {
        var n = e._nameList, i = e._idList, a = e._nameDimIdx, o = e._idDimIdx, s = n[r], u = i[r];
        if (s == null && a != null && (n[r] = s = na(e, a, r)), u == null && o != null && (i[r] = u = na(e, o, r)), u == null && s != null) {
          var l = e._nameRepeatCount, f = l[s] = (l[s] || 0) + 1;
          u = s, f > 1 && (u += "__ec__" + f), i[r] = u;
        }
      };
    }(), t;
  }()
);
function sA(t, e) {
  jc(t) || (t = J0(t)), e = e || {};
  var r = e.coordDimensions || [], n = e.dimensionsDefine || t.dimensionsDefine || [], i = Z(), a = [], o = uA(t, r, n, e.dimensionsCount), s = e.canOmitUnusedDimensions && q_(o), u = n === t.dimensionsDefine, l = u ? $_(t) : sv(n), f = e.encodeDefine;
  !f && e.encodeDefaulter && (f = e.encodeDefaulter(t, o));
  for (var h = Z(f), c = new s_(o), v = 0; v < c.length; v++)
    c[v] = -1;
  function d(D) {
    var C = c[D];
    if (C < 0) {
      var E = n[D], I = q(E) ? E : {
        name: E
      }, A = new xs(), O = I.name;
      O != null && l.get(O) != null && (A.name = A.displayName = O), I.type != null && (A.type = I.type), I.displayName != null && (A.displayName = I.displayName);
      var P = a.length;
      return c[D] = P, A.storeDimIndex = D, a.push(A), A;
    }
    return a[C];
  }
  if (!s)
    for (var v = 0; v < o; v++)
      d(v);
  h.each(function(D, C) {
    var E = Qe(D).slice();
    if (E.length === 1 && !z(E[0]) && E[0] < 0) {
      h.set(C, !1);
      return;
    }
    var I = h.set(C, []);
    x(E, function(A, O) {
      var P = z(A) ? l.get(A) : A;
      P != null && P < o && (I[O] = P, m(d(P), C, O));
    });
  });
  var p = 0;
  x(r, function(D) {
    var C, E, I, A;
    if (z(D))
      C = D, A = {};
    else {
      A = D, C = A.name;
      var O = A.ordinalMeta;
      A.ordinalMeta = null, A = R({}, A), A.ordinalMeta = O, E = A.dimsDef, I = A.otherDims, A.name = A.coordDim = A.coordDimIndex = A.dimsDef = A.otherDims = null;
    }
    var P = h.get(C);
    if (P !== !1) {
      if (P = Qe(P), !P.length)
        for (var L = 0; L < (E && E.length || 1); L++) {
          for (; p < o && d(p).coordDim != null; )
            p++;
          p < o && P.push(p++);
        }
      x(P, function(B, U) {
        var Y = d(B);
        if (u && A.type != null && (Y.type = A.type), m(ge(Y, A), C, U), Y.name == null && E) {
          var j = E[U];
          !q(j) && (j = {
            name: j
          }), Y.name = Y.displayName = j.name, Y.defaultTooltip = j.defaultTooltip;
        }
        I && ge(Y.otherDims, I);
      });
    }
  });
  function m(D, C, E) {
    lh.get(C) != null ? D.otherDims[C] = E : (D.coordDim = C, D.coordDimIndex = E, i.set(C, !0));
  }
  var g = e.generateCoord, y = e.generateCoordCount, _ = y != null;
  y = g ? y || 1 : 0;
  var S = g || "value";
  function b(D) {
    D.name == null && (D.name = D.coordDim);
  }
  if (s)
    x(a, function(D) {
      b(D);
    }), a.sort(function(D, C) {
      return D.storeDimIndex - C.storeDimIndex;
    });
  else
    for (var w = 0; w < o; w++) {
      var T = d(w), M = T.coordDim;
      M == null && (T.coordDim = lA(S, i, _), T.coordDimIndex = 0, (!g || y <= 0) && (T.isExtraCoord = !0), y--), b(T), T.type == null && (K0(t, w) === ut.Must || T.isExtraCoord && (T.otherDims.itemName != null || T.otherDims.seriesName != null)) && (T.type = "ordinal");
    }
  return vc(a, function(D) {
    return D.name;
  }, function(D, C) {
    C > 0 && (D.name = D.name + (C - 1));
  }), new X_({
    source: t,
    dimensions: a,
    fullDimensionCount: o,
    dimensionOmitted: s
  });
}
function uA(t, e, r, n) {
  var i = Math.max(t.dimensionsDetectedCount || 1, e.length, r.length, n || 0);
  return x(e, function(a) {
    var o;
    q(a) && (o = a.dimsDef) && (i = Math.max(i, o.length));
  }), i;
}
function lA(t, e, r) {
  if (r || e.hasKey(t)) {
    for (var n = 0; e.hasKey(t + n); )
      n++;
    t += n;
  }
  return e.set(t, !0), t;
}
var fA = (
  /** @class */
  /* @__PURE__ */ function() {
    function t(e) {
      this.coordSysDims = [], this.axisMap = Z(), this.categoryAxisMap = Z(), this.coordSysName = e;
    }
    return t;
  }()
);
function hA(t) {
  var e = t.get("coordinateSystem"), r = new fA(e), n = cA[e];
  if (n)
    return n(t, r, r.axisMap, r.categoryAxisMap), r;
}
var cA = {
  cartesian2d: function(t, e, r, n) {
    var i = t.getReferringComponents("xAxis", qe).models[0], a = t.getReferringComponents("yAxis", qe).models[0];
    if (process.env.NODE_ENV !== "production") {
      if (!i)
        throw new Error('xAxis "' + wi(t.get("xAxisIndex"), t.get("xAxisId"), 0) + '" not found');
      if (!a)
        throw new Error('yAxis "' + wi(t.get("xAxisIndex"), t.get("yAxisId"), 0) + '" not found');
    }
    e.coordSysDims = ["x", "y"], r.set("x", i), r.set("y", a), ri(i) && (n.set("x", i), e.firstCategoryDimIndex = 0), ri(a) && (n.set("y", a), e.firstCategoryDimIndex == null && (e.firstCategoryDimIndex = 1));
  },
  singleAxis: function(t, e, r, n) {
    var i = t.getReferringComponents("singleAxis", qe).models[0];
    if (process.env.NODE_ENV !== "production" && !i)
      throw new Error("singleAxis should be specified.");
    e.coordSysDims = ["single"], r.set("single", i), ri(i) && (n.set("single", i), e.firstCategoryDimIndex = 0);
  },
  polar: function(t, e, r, n) {
    var i = t.getReferringComponents("polar", qe).models[0], a = i.findAxisModel("radiusAxis"), o = i.findAxisModel("angleAxis");
    if (process.env.NODE_ENV !== "production") {
      if (!o)
        throw new Error("angleAxis option not found");
      if (!a)
        throw new Error("radiusAxis option not found");
    }
    e.coordSysDims = ["radius", "angle"], r.set("radius", a), r.set("angle", o), ri(a) && (n.set("radius", a), e.firstCategoryDimIndex = 0), ri(o) && (n.set("angle", o), e.firstCategoryDimIndex == null && (e.firstCategoryDimIndex = 1));
  },
  geo: function(t, e, r, n) {
    e.coordSysDims = ["lng", "lat"];
  },
  parallel: function(t, e, r, n) {
    var i = t.ecModel, a = i.getComponent("parallel", t.get("parallelIndex")), o = e.coordSysDims = a.dimensions.slice();
    x(a.parallelAxisIndex, function(s, u) {
      var l = i.getComponent("parallelAxis", s), f = o[u];
      r.set(f, l), ri(l) && (n.set(f, l), e.firstCategoryDimIndex == null && (e.firstCategoryDimIndex = u));
    });
  },
  matrix: function(t, e, r, n) {
    var i = t.getReferringComponents("matrix", qe).models[0];
    if (process.env.NODE_ENV !== "production" && !i)
      throw new Error("matrix coordinate system should be specified.");
    e.coordSysDims = ["x", "y"];
    var a = i.getDimensionModel("x"), o = i.getDimensionModel("y");
    r.set("x", a), r.set("y", o), n.set("x", a), n.set("y", o);
  }
};
function ri(t) {
  return t.get("type") === "category";
}
function vA(t, e, r) {
  r = r || {};
  var n = r.byIndex, i = r.stackedCoordDimension, a, o, s;
  dA(e) ? a = e : (o = e.schema, a = o.dimensions, s = e.store);
  var u = !!(t && t.get("stack")), l, f, h, c, v = !0;
  function d(S) {
    return S.type !== "ordinal" && S.type !== "time";
  }
  if (x(a, function(S, b) {
    z(S) && (a[b] = S = {
      name: S
    }), d(S) || (v = !1);
  }), x(a, function(S, b) {
    u && !S.isExtraCoord && (!n && !l && S.ordinalMeta && (l = S), !f && d(S) && (!v || S.coordDim !== "x" && S.coordDim !== "angle") && (!i || i === S.coordDim) && (f = S));
  }), f && !n && !l && (n = !0), f) {
    h = "__\0ecstackresult_" + t.id, c = "__\0ecstackedover_" + t.id, l && (l.createInvertedIndices = !0);
    var p = f.coordDim, m = f.type, g = 0;
    x(a, function(S) {
      S.coordDim === p && g++;
    });
    var y = {
      name: h,
      coordDim: p,
      coordDimIndex: g,
      type: m,
      isExtraCoord: !0,
      isCalculationCoord: !0,
      storeDimIndex: a.length
    }, _ = {
      name: c,
      // This dimension contains stack base (generally, 0), so do not set it as
      // `stackedDimCoordDim` to avoid extent calculation, consider log scale.
      coordDim: c,
      coordDimIndex: g + 1,
      type: m,
      isExtraCoord: !0,
      isCalculationCoord: !0,
      storeDimIndex: a.length + 1
    };
    o ? (s && (y.storeDimIndex = s.ensureCalculationDimension(c, m), _.storeDimIndex = s.ensureCalculationDimension(h, m)), o.appendCalculationDimension(y), o.appendCalculationDimension(_)) : (a.push(y), a.push(_));
  }
  return {
    stackedDimension: f && f.name,
    stackedByDimension: l && l.name,
    isStackedByIndex: n,
    stackedOverDimension: c,
    stackResultDimension: h
  };
}
function dA(t) {
  return !Z_(t.schema);
}
function Ka(t, e) {
  return !!e && e === t.getCalculationInfo("stackedDimension");
}
function pA(t, e) {
  return Ka(t, e) ? t.getCalculationInfo("stackResultDimension") : e;
}
function gA(t, e) {
  var r = t.get("coordinateSystem"), n = Zc.get(r), i;
  return e && e.coordSysDims && (i = X(e.coordSysDims, function(a) {
    var o = {
      name: a
    }, s = e.axisMap.get(a);
    if (s) {
      var u = s.get("type");
      o.type = jE(u);
    }
    return o;
  })), i || (i = n && (n.getDimensionsInfo ? n.getDimensionsInfo() : n.dimensions.slice()) || ["x", "y"]), i;
}
function mA(t, e, r) {
  var n, i;
  return r && x(t, function(a, o) {
    var s = a.coordDim, u = r.categoryAxisMap.get(s);
    u && (n == null && (n = o), a.ordinalMeta = u.getOrdinalMeta(), e && (a.createInvertedIndices = !0)), a.otherDims.itemName != null && (i = !0);
  }), !i && n != null && (t[n].otherDims.itemName = 0), n;
}
function yA(t, e, r) {
  r = r || {};
  var n = e.getSourceManager(), i, a = !1;
  i = n.getSource(), a = i.sourceFormat === ft;
  var o = hA(e), s = gA(e, o), u = r.useEncodeDefaulter, l = Q(u) ? u : u ? Ae(tD, s, e) : null, f = {
    coordDimensions: s,
    generateCoord: r.generateCoord,
    encodeDefine: e.getEncode(),
    encodeDefaulter: l,
    canOmitUnusedDimensions: !a
  }, h = sA(i, f), c = mA(h.dimensions, r.createInvertedIndices, o), v = a ? null : n.getSharedDataStore(h), d = vA(e, {
    schema: h,
    store: v
  }), p = new oA(h, e);
  p.setCalculationInfo(d);
  var m = c != null && _A(i) ? function(g, y, _, S) {
    return S === c ? _ : this.defaultDimValueGetter(g, y, _, S);
  } : null;
  return p.hasItemOption = !1, p.initData(
    // Try to reuse the data store in sourceManager if using dataset.
    a ? i : v,
    null,
    m
  ), p;
}
function _A(t) {
  if (t.sourceFormat === ft) {
    var e = SA(t.data || []);
    return !H(lo(e));
  }
}
function SA(t) {
  for (var e = 0; e < t.length && t[e] == null; )
    e++;
  return t[e];
}
var Bt = (
  /** @class */
  function() {
    function t() {
    }
    return t.prototype.isBlank = function() {
      return this._isBlank;
    }, t.prototype.setBlank = function(e) {
      this._isBlank = e;
    }, t;
  }()
);
Eu(Bt);
var bA = 0, Ph = (
  /** @class */
  function() {
    function t(e) {
      this.categories = e.categories || [], this._needCollect = e.needCollect, this._deduplication = e.deduplication, this.uid = ++bA, this._onCollect = e.onCollect;
    }
    return t.createByAxisModel = function(e) {
      var r = e.option, n = r.data, i = n && X(n, wA);
      return new t({
        categories: i,
        needCollect: !i,
        // deduplication is default in axis.
        deduplication: r.dedplication !== !1
      });
    }, t.prototype.getOrdinal = function(e) {
      return this._getOrCreateMap().get(e);
    }, t.prototype.parseAndCollect = function(e) {
      var r, n = this._needCollect;
      if (!z(e) && !n)
        return e;
      if (n && !this._deduplication)
        return r = this.categories.length, this.categories[r] = e, this._onCollect && this._onCollect(e, r), r;
      var i = this._getOrCreateMap();
      return r = i.get(e), r == null && (n ? (r = this.categories.length, this.categories[r] = e, i.set(e, r), this._onCollect && this._onCollect(e, r)) : r = NaN), r;
    }, t.prototype._getOrCreateMap = function() {
      return this._map || (this._map = Z(this.categories));
    }, t;
  }()
);
function wA(t) {
  return q(t) && t.value != null ? t.value : t + "";
}
var xt = 0, Qa = 1, TA = {
  needTransform: 1,
  normalize: 1,
  scale: 1,
  transformIn: 1,
  transformOut: 1,
  contain: 1,
  getExtent: 1,
  getExtentUnsafe: 1,
  setExtent: 1,
  setExtent2: 1,
  getFilter: 1,
  sanitize: 1,
  getDefaultStartValue: 1,
  freeze: 1
}, xA = le(TA), su = 2, K_ = 3;
function uv(t, e, r) {
  var n;
  return t = t || {}, DA(t, r), {
    brk: n,
    mapper: t
  };
}
function Q_(t, e) {
  x(xA, function(r) {
    t[r] = e[r];
  });
}
function j_(t, e) {
  t.freeze = Fe, process.env.NODE_ENV !== "production" && (t.freeze = function() {
    e.freeze();
  });
}
function ja(t) {
  return t.getExtentUnsafe(xt, su);
}
function uu(t, e) {
  return t.getExtentUnsafe(Qa, e) || t.getExtentUnsafe(xt, e);
}
function CA(t) {
  var e = uu(t, K_);
  return e[1] - e[0];
}
function qu(t) {
  var e = t.getExtentUnsafe(xt, K_);
  return e[1] - e[0];
}
function DA(t, e) {
  var r = t || {}, n = [];
  return r._extents = n, n[xt] = e ? e.slice() : St(), R(r, MA), r;
}
var MA = {
  needTransform: function() {
    return !1;
  },
  normalize: function(t) {
    var e = this._extents[Qa] || this._extents[xt];
    return e[1] === e[0] ? 0.5 : (t - e[0]) / (e[1] - e[0]);
  },
  scale: function(t) {
    var e = this._extents[Qa] || this._extents[xt];
    return t * (e[1] - e[0]) + e[0];
  },
  transformIn: function(t) {
    return t;
  },
  transformOut: function(t) {
    return t;
  },
  contain: function(t) {
    var e = uu(this, null);
    return t >= e[0] && t <= e[1];
  },
  getExtent: function() {
    return this._extents[xt].slice();
  },
  getExtentUnsafe: function(t) {
    return this._extents[t];
  },
  setExtent: function(t, e) {
    process.env.NODE_ENV !== "production" && N(!this._frozen), wg(this._extents, xt, t, e);
  },
  setExtent2: function(t, e, r) {
    process.env.NODE_ENV !== "production" && N(!this._frozen);
    var n = this._extents;
    n[t] || (n[t] = n[xt].slice()), wg(n, t, e, r);
  },
  freeze: function() {
    process.env.NODE_ENV !== "production" && (this._frozen = !0);
  }
};
function wg(t, e, r, n) {
  Ei(r, n) ? (t[e][0] = r, t[e][1] = n) : process.env.NODE_ENV !== "production" && r != null && n != null && r <= n && he("Invalid setExtent call - start: " + r + ", end: " + n);
}
function J_(t) {
  return lu(t) || Li(t);
}
function lu(t) {
  return t.type === "interval";
}
function go(t) {
  return t.type === "time";
}
function Li(t) {
  return t.type === "log";
}
function Mt(t) {
  return t.type === "ordinal";
}
function EA(t) {
  var e = uc(t), r = Fi(10, e), n = mr(t / r);
  return n ? n === 2 ? n = 3 : n === 3 ? n = 5 : n *= 2 : n = 1, ue(n * r, -e);
}
function Bn(t) {
  return vr(t) + 2;
}
function ts(t, e) {
  return Va(t) / Va(e);
}
function vf(t, e, r) {
  var n = r && r.lookup;
  if (n) {
    for (var i = 0; i < n.from.length; i++)
      if (t === n.from[i])
        return n.to[i];
  }
  return Fi(e, t);
}
function e1(t, e, r) {
  var n = t.slice();
  if (n[0] === n[1]) {
    var i = r && r.ctnShp;
    if (n[0] !== 0) {
      var a = Pe(n[0]);
      e[1] || (n[1] += a / 2), n[0] -= a / 2;
    } else
      i && (n[0] = -1), n[1] = 1;
  }
  return (!yr(n[0]) || !yr(n[1])) && (n[0] = 0, n[1] = 1), n[1] < n[0] && n.reverse(), n;
}
function AA(t, e) {
  return [t[0] !== e[0], t[1] !== e[1]];
}
function lv(t, e) {
  return t = t || e, mr(ye(t, 1));
}
function t1(t, e, r) {
  var n = ja(t), i = n[0], a = t.count(), o = Math.max((e || 0) + 1, 1);
  i !== 0 && o > 1 && a / o > 2 && (i = Math.round(Math.ceil(i / o) * o)), i !== n[0] && u(n[0], !0, !0);
  for (var s = i; s <= n[1]; s += o)
    u(s, !1, s === n[0] || s === n[1]);
  s - o !== n[1] && u(n[1], !0, !0);
  function u(l, f, h) {
    r({
      value: l,
      offInterval: f
    }, h);
  }
}
var r1 = (
  /** @class */
  function(t) {
    V(e, t);
    function e(r) {
      var n = t.call(this) || this;
      n.type = "ordinal", n.parse = e.parse, Q_(n, e.decoratedMethods);
      var i = r.ordinalMeta;
      i || (i = new Ph({})), H(i) && (i = new Ph({
        categories: X(i, function(o) {
          return q(o) ? o.value : o;
        })
      })), n._ordinalMeta = i;
      var a = uv(
        null,
        null,
        // Do not support break in OrdinalScale yet.
        r.extent || [0, i.categories.length - 1]
      );
      return n._mapper = a.mapper, j_(n, a.mapper), n;
    }
    return e.parse = function(r) {
      return r == null ? r = NaN : z(r) ? (r = this._ordinalMeta.getOrdinal(r), r == null && (r = NaN)) : r = mr(r), r;
    }, e.prototype.getTicks = function() {
      var r = [];
      return t1(this, 0, function(n) {
        r.push(n);
      }), r;
    }, e.prototype.getMinorTicks = function(r) {
    }, e.prototype.setSortInfo = function(r) {
      if (r == null) {
        this._ordinalNumbersByTick = this._ticksByOrdinalNumber = null;
        return;
      }
      for (var n = r.ordinalNumbers, i = this._ordinalNumbersByTick = [], a = this._ticksByOrdinalNumber = [], o = 0, s = this._ordinalMeta.categories.length, u = st(s, n.length); o < u; ++o) {
        var l = i[o] = n[o];
        a[l] = o;
      }
      for (var f = 0; o < s; ++o) {
        for (; a[f] != null; )
          f++;
        i[o] = f, a[f] = o;
      }
    }, e.prototype._getTickNumber = function(r) {
      var n = this._ticksByOrdinalNumber;
      return n && r >= 0 && r < n.length ? n[r] : r;
    }, e.prototype.getRawOrdinalNumber = function(r) {
      var n = this._ordinalNumbersByTick;
      return n && r >= 0 && r < n.length ? n[r] : r;
    }, e.prototype.getLabel = function(r) {
      if (!this.isBlank()) {
        var n = this.getRawOrdinalNumber(r.value), i = this._ordinalMeta.categories[n];
        return i == null ? "" : i + "";
      }
    }, e.prototype.count = function() {
      var r = ja(this._mapper);
      return r[1] - r[0] + 1;
    }, e.prototype.getOrdinalMeta = function() {
      return this._ordinalMeta;
    }, e.type = "ordinal", e.decoratedMethods = {
      needTransform: function() {
        return this._mapper.needTransform();
      },
      contain: function(r) {
        return this._mapper.contain(this._getTickNumber(r)) && r >= 0 && r < this._ordinalMeta.categories.length;
      },
      normalize: function(r) {
        return this._mapper.normalize(this._getTickNumber(r));
      },
      scale: function(r) {
        return this.getRawOrdinalNumber(mr(this._mapper.scale(r)));
      },
      transformIn: function(r, n) {
        return this._mapper.transformIn(this._getTickNumber(r), n);
      },
      transformOut: function(r, n) {
        return this.getRawOrdinalNumber(this._mapper.transformOut(r, n));
      },
      getExtent: function() {
        return this._mapper.getExtent();
      },
      getExtentUnsafe: function(r, n) {
        return this._mapper.getExtentUnsafe(r, n);
      },
      /**
       * NOTICE: OrdinalScale extent should always originates from
       * `[0, ordinalMeta.categories.length - 1]`, regardless of min/max of `series.data`.
       * But settings like `xxxAxis.min/max` can still modify the extent.
       * It is handled by constructor of `ScaleRawExtentInfo`.
       */
      setExtent: function(r, n) {
        return this._mapper.setExtent(r, n);
      },
      setExtent2: function(r, n, i) {
        return this._mapper.setExtent2(r, n, i);
      }
    }, e;
  }(Bt)
);
Bt.registerClass(r1);
function fv(t, e, r, n) {
  for (var i = t.getTicks({
    expandToNicedExtent: !0
  }), a = [], o = t.getExtent(), s = 1; s < i.length; s++) {
    var u = i[s], l = i[s - 1];
    if (!(l.break || u.break)) {
      for (var f = 0, h = [], c = u.value - l.value, v = c / e, d = Bn(v); f < e - 1; ) {
        var p = ue(l.value + (f + 1) * v, d);
        p > o[0] && p < o[1] && h.push(p), f++;
      }
      var m = Gu();
      m && m.pruneTicksByBreak("auto", h, r, function(g) {
        return g;
      }, n, o), a.push(h);
    }
  }
  return a;
}
var Vr = (
  /** @class */
  function(t) {
    V(e, t);
    function e(r) {
      var n = t.call(this) || this;
      n.type = "interval", n.parse = e.parse, r = r || {};
      var i = P0(n, r), a = uv(n, i, null);
      return n.brk = a.brk, n._cfg = {
        interval: 0,
        intervalPrecision: 2,
        intervalCount: void 0,
        niceExtent: void 0
      }, n;
    }
    return e.parse = function(r) {
      return r == null || r === "" ? NaN : Number(r);
    }, e.prototype.getConfig = function() {
      return ae(this._cfg);
    }, e.prototype.setConfig = function(r) {
      var n = ja(this);
      process.env.NODE_ENV !== "production" && (N(r.interval != null), r.intervalCount != null && N(r.intervalCount >= -1 && r.intervalPrecision != null && !Rn(this)), r.niceExtent != null && (N(isFinite(r.niceExtent[0]) && isFinite(r.niceExtent[1])), N(n[0] <= r.niceExtent[0] && r.niceExtent[1] <= n[1]), N(ue(r.niceExtent[0] - r.niceExtent[1], vr(r.interval)) <= r.interval))), this._cfg = r = ae(r), r.niceExtent == null && (r.niceExtent = n.slice()), r.intervalPrecision == null && (r.intervalPrecision = Bn(r.interval));
    }, e.prototype.getTicks = function(r) {
      r = r || {};
      var n = this._cfg, i = n.interval, a = ja(this), o = n.niceExtent, s = n.intervalPrecision, u = Gu(), l = this.brk, f = u, h = [];
      if (!i)
        return h;
      r.breakTicks, process.env.NODE_ENV !== "production" && N(o != null);
      var c = 3e3;
      a[0] < o[0] && h.push({
        value: r.expandToNicedExtent ? ue(o[0] - i, s) : a[0]
      });
      for (var v = function(_, S) {
        return mr((S - _) / i);
      }, d = n.intervalCount, p = o[0], m = 0; ; m++) {
        if (d == null) {
          if (p > o[1] || !isFinite(p) || !isFinite(o[1]))
            break;
        } else {
          if (m > d)
            break;
          p = st(p, o[1]), m === d && (p = o[1]);
        }
        if (h.push({
          value: p
        }), p = ue(p + i, s), l) {
          var g = l.calcNiceTickMultiple(p, v);
          g >= 0 && (p = ue(p + g * i, s));
        }
        if (h.length > 0 && p === h[h.length - 1].value)
          break;
        if (h.length > c)
          return process.env.NODE_ENV !== "production" && nt('Exceed safe limit in IntervalScale["getTicks"].'), [];
      }
      var y = h.length ? h[h.length - 1].value : o[1];
      return a[1] > y && h.push({
        value: r.expandToNicedExtent ? ue(y + i, s) : a[1]
      }), h;
    }, e.prototype.getMinorTicks = function(r) {
      return fv(this, r, Vc(this), this._cfg.interval);
    }, e.prototype.getLabel = function(r, n) {
      if (r == null)
        return "";
      var i = n && n.precision;
      i == null ? i = vr(r.value) || 0 : i === "auto" && (i = this._cfg.intervalPrecision);
      var a = ue(r.value, i, !0);
      return H0(a);
    }, e.type = "interval", e;
  }(Bt)
);
Bt.registerClass(Vr);
var IA = function(t, e, r, n) {
  for (; r < n; ) {
    var i = r + n >>> 1;
    t[i][1] < e ? r = i + 1 : n = i;
  }
  return r;
}, n1 = (
  /** @class */
  function(t) {
    V(e, t);
    function e(r) {
      var n = t.call(this) || this;
      n.type = "time", n.parse = e.parse, n._locale = r.locale, n._useUTC = r.useUTC, n._interval = 0;
      var i = P0(n, r), a = uv(n, i, null);
      return n.brk = a.brk, n;
    }
    return e.prototype.getLabel = function(r) {
      return Uu(r.value, hp[BC(Oa(this._minLevelUnit))] || hp.second, this._useUTC, this._locale);
    }, e.prototype.getFormattedLabel = function(r, n, i) {
      return VC(r, n, i, this._locale, this._useUTC);
    }, e.prototype.getTicks = function(r) {
      var n = this._interval, i = ja(this), a = this.brk, o = [];
      if (!n)
        return o;
      var s = this._useUTC;
      o = VA(this._minLevelUnit, this._approxInterval, s, i, qu(this), a);
      var u = On.length - 1, l = 0;
      return x(o, function(f) {
        f.time && (u = Math.min(u, fe(On, f.time.upperTimeUnit)), l = Math.max(l, f.time.level));
      }), o;
    }, e.prototype.getMinorTicks = function(r) {
      return fv(this, r, Vc(this), this._interval);
    }, e.prototype.setTimeInterval = function(r) {
      this._interval = r.interval, this._approxInterval = r.approxInterval, this._minLevelUnit = r.minLevelUnit;
    }, e.parse = function(r) {
      return Te(r) ? Math.round(r) : +zi(r);
    }, e.type = "time", e;
  }(Bt)
), rs = [
  // Format                           interval
  ["second", Fc],
  ["minute", zc],
  ["hour", Ia],
  ["quarter-day", Ia * 6],
  ["half-day", Ia * 12],
  ["day", Tt * 1.2],
  ["half-week", Tt * 3.5],
  ["week", Tt * 7],
  ["month", Tt * 31],
  ["quarter", Tt * 95],
  ["half-year", fp / 2],
  ["year", fp]
  // 1Y
];
function OA(t, e, r, n) {
  return yh(new Date(e), t, n).getTime() === yh(new Date(r), t, n).getTime();
}
function LA(t, e) {
  return t /= Tt, t > 16 ? 16 : t > 7.5 ? 7 : t > 3.5 ? 4 : t > 1.5 ? 2 : 1;
}
function PA(t) {
  var e = 30 * Tt;
  return t /= e, t > 6 ? 6 : t > 3 ? 3 : t > 2 ? 2 : 1;
}
function NA(t) {
  return t /= Ia, t > 12 ? 12 : t > 6 ? 6 : t > 3.5 ? 4 : t > 2 ? 2 : 1;
}
function Tg(t, e) {
  return t /= e ? zc : Fc, t > 30 ? 30 : t > 20 ? 20 : t > 15 ? 15 : t > 10 ? 10 : t > 5 ? 5 : t > 2 ? 2 : 1;
}
function RA(t) {
  return ye(lc(t, !0), 1);
}
function kA(t, e, r) {
  var n = Math.max(0, fe(On, e) - 1);
  return yh(new Date(t), On[n], r).getTime();
}
function BA(t, e) {
  var r = /* @__PURE__ */ new Date(0);
  r[t](1);
  var n = r.getTime();
  r[t](1 + e);
  var i = r.getTime() - n;
  return function(a, o) {
    return Math.max(0, Math.round((o - a) / i));
  };
}
function VA(t, e, r, n, i, a) {
  var o = 3e3, s = PC, u = 0;
  function l(L, B, U, Y, j, K, J) {
    for (var $ = BA(j, L), F = B, ne = new Date(F); F < U && F <= n[1]; ) {
      if (J.push({
        value: F
      }), u++ > o) {
        process.env.NODE_ENV !== "production" && nt('Exceed safe limit in TimeScale["getTicks"].');
        break;
      }
      if (ne[j](ne[Y]() + L), F = ne.getTime(), a) {
        var oe = a.calcNiceTickMultiple(F, $);
        oe > 0 && (ne[j](ne[Y]() + oe * L), F = ne.getTime());
      }
    }
    J.push({
      value: F,
      // extent[1] should be added; deduplication will be performed later.
      notAdd: F > n[1]
    });
  }
  function f(L, B, U) {
    var Y = [], j = !B.length;
    if (!OA(Oa(L), n[0], n[1], r)) {
      j && (B = [{
        value: kA(n[0], L, r)
      }, {
        value: n[1]
      }]);
      for (var K = 0; K < B.length - 1; K++) {
        var J = B[K].value, $ = B[K + 1].value;
        if (J !== $) {
          var F = void 0, ne = void 0, oe = void 0, ze = !1;
          switch (L) {
            case "year":
              F = Math.max(1, Math.round(e / Tt / 365)), ne = N0(r), oe = FC(r);
              break;
            case "half-year":
            case "quarter":
            case "month":
              F = PA(e), ne = Hc(r), oe = R0(r);
              break;
            case "week":
            case "half-week":
            case "day":
              F = LA(e), ne = Gc(r), oe = k0(r), ze = !0;
              break;
            case "half-day":
            case "quarter-day":
            case "hour":
              F = NA(e), ne = Uc(r), oe = B0(r);
              break;
            case "minute":
              F = Tg(e, !0), ne = Wc(r), oe = V0(r);
              break;
            case "second":
              F = Tg(e, !1), ne = Yc(r), oe = F0(r);
              break;
            case "millisecond":
              F = RA(e), ne = Xc(r), oe = z0(r);
              break;
          }
          $ >= n[0] && J <= n[1] && l(F, J, $, ne, oe, ze, Y), L === "year" && U.length > 1 && K === 0 && U.unshift({
            value: U[0].value - F
          });
        }
      }
      for (var K = 0; K < Y.length; K++)
        U.push(Y[K]);
    }
  }
  for (var h = [], c = [], v = 0, d = 0, p = 0; p < s.length; ++p) {
    var m = Oa(s[p]);
    if (kC(s[p])) {
      f(s[p], h[h.length - 1] || [], c);
      var g = s[p + 1] ? Oa(s[p + 1]) : null;
      if (m !== g) {
        if (c.length) {
          d = v, c.sort(function(L, B) {
            return L.value - B.value;
          });
          for (var y = [], _ = 0; _ < c.length; ++_) {
            var S = c[_].value;
            (_ === 0 || c[_ - 1].value !== S) && (y.push(c[_]), S >= n[0] && S <= n[1] && v++);
          }
          var b = i / e;
          if (v > b * 1.5 && d > b / 1.5 || (h.push(y), v > b || t === s[p]))
            break;
        }
        c = [];
      }
    }
  }
  for (var w = He(X(h, function(L) {
    return He(L, function(B) {
      return B.value >= n[0] && B.value <= n[1] && !B.notAdd;
    });
  }), function(L) {
    return L.length > 0;
  }), T = w.length - 1, M = [], p = 0; p < w.length; ++p)
    for (var D = w[p], C = 0; C < D.length; ++C) {
      var E = _s(D[C].value, r);
      M.push({
        value: D[C].value,
        time: {
          level: T - p,
          upperTimeUnit: E,
          lowerTimeUnit: E
        }
      });
    }
  vc(M, Xw, null), M.sort(function(L, B) {
    return L.value - B.value;
  });
  var I = M[0], A = M[M.length - 1], O = _s(n[0], r), P = _s(n[1], r);
  return (!I || I.value > n[0]) && M.unshift({
    value: n[0],
    time: {
      level: 0,
      upperTimeUnit: O,
      lowerTimeUnit: O
    },
    notNice: !0
  }), (!A || A.value < n[1]) && M.push({
    value: n[1],
    time: {
      level: 0,
      upperTimeUnit: P,
      lowerTimeUnit: P
    },
    notNice: !0
  }), M;
}
var FA = function(t, e) {
  var r = t.getExtent();
  if (r[0] === r[1] && (r[0] -= Tt, r[1] += Tt), r[1] === -1 / 0 && r[0] === 1 / 0) {
    var n = /* @__PURE__ */ new Date();
    r[1] = +new Date(n.getFullYear(), n.getMonth(), n.getDate()), r[0] = r[1] - Tt;
  }
  t.setExtent(r[0], r[1]);
  var i = lv(e.splitNumber, 10), a = qu(t) / i, o = e.minInterval, s = e.maxInterval;
  o != null && a < o && (a = o), s != null && a > s && (a = s);
  var u = rs.length, l = Math.min(IA(rs, a, 0, u), u - 1), f = rs[l][1], h = rs[Math.max(l - 1, 0)][0];
  t.setTimeInterval({
    approxInterval: a,
    interval: f,
    minLevelUnit: h
  });
};
Bt.registerClass(n1);
var ns = 0, is = 1, fu = (
  /** @class */
  function(t) {
    V(e, t);
    function e(r) {
      var n = t.call(this) || this;
      n.type = "log", n.parse = Vr.parse, n.base = r.logBase || 10;
      var i = [], a = [];
      n._lookup = {
        from: i,
        to: a
      }, i[ns] = i[is] = a[ns] = a[is] = NaN, Q_(n, e.mapperMethods), r.breakOption;
      var o = {};
      return n.powStub = new Vr({
        breakParsed: o.original
      }), n.intervalStub = new Vr({
        breakParsed: o.transformed
      }), j_(n, n.intervalStub), n;
    }
    return e.prototype.getTicks = function(r) {
      var n = this.base, i = this.powStub, a = this.intervalStub, o = a.getExtent(), s = i.getExtent(), u = {
        lookup: {
          from: o,
          to: s
        }
      };
      return X(a.getTicks(r || {}), function(l) {
        var f = l.value, h = vf(f, n, u), c;
        return {
          value: h,
          break: c
        };
      }, this);
    }, e.prototype.getMinorTicks = function(r) {
      return fv(
        this,
        r,
        Vc(this.powStub),
        // NOTE: minor ticks are in the log scale value to visually hint users "logarithm".
        this.intervalStub.getConfig().interval
      );
    }, e.prototype.getLabel = function(r, n) {
      return this.intervalStub.getLabel(r, n);
    }, e.type = "log", e.mapperMethods = {
      needTransform: function() {
        return !0;
      },
      normalize: function(r) {
        return this.intervalStub.normalize(ts(r, this.base));
      },
      scale: function(r) {
        return vf(this.intervalStub.scale(r), this.base, null);
      },
      transformIn: function(r, n) {
        return r = ts(r, this.base), n && n.depth === su ? r : this.intervalStub.transformIn(r, n);
      },
      transformOut: function(r, n) {
        var i = n ? n.depth : null;
        return xg.depth = i, Cg.lookup = this._lookup, vf(i === su ? r : this.intervalStub.transformOut(r, xg), this.base, Cg);
      },
      contain: function(r) {
        return this.powStub.contain(r);
      },
      /**
       * NOTICE: The caller should ensure `start` and `end` are both non-negative.
       */
      setExtent: function(r, n) {
        this.setExtent2(xt, r, n);
      },
      setExtent2: function(r, n, i) {
        if (!(!Ei(n, i) || n <= 0 || i <= 0)) {
          var a = Dg, o = Dg;
          if (r === xt) {
            var s = this._lookup;
            a = s.to, o = s.from;
          }
          this.powStub.setExtent2(r, a[ns] = n, a[is] = i);
          var u = this.base;
          this.intervalStub.setExtent2(r, o[ns] = ts(n, u), o[is] = ts(i, u));
        }
      },
      getFilter: function() {
        return {
          g: 0
        };
      },
      sanitize: function(r, n) {
        return Ei(n[0], n[1]) && er(r) && r <= 0 && (r = n[0]), r;
      },
      getDefaultStartValue: function() {
        return 1;
      },
      getExtent: function() {
        return this.powStub.getExtent();
      },
      getExtentUnsafe: function(r, n) {
        return n === null ? this.powStub.getExtentUnsafe(r, null) : this.intervalStub.getExtentUnsafe(r, n);
      }
    }, e;
  }(Bt)
);
Bt.registerClass(fu);
var xg = {}, Cg = {}, Dg = [], i1 = {
  value: 1,
  category: 1,
  time: 1,
  log: 1
}, a1 = ve();
function zA(t) {
  var e = t.get("type");
  return (
    // In ec option, `xxxAxis.type` may be undefined.
    (e == null || !at(i1, e) && !Bt.getClass(e)) && (e = "value"), e
  );
}
function HA(t, e, r) {
  var n;
  switch (e) {
    case "category":
      return new r1({
        ordinalMeta: t.getOrdinalMeta ? t.getOrdinalMeta() : t.getCategories(),
        extent: St()
      });
    case "time":
      return new n1({
        locale: t.ecModel.getLocaleModel(),
        useUTC: t.ecModel.get("useUTC"),
        breakOption: n
      });
    case "log":
      return new fu({
        logBase: t.get("logBase"),
        breakOption: n
      });
    case "value":
      return new Vr({
        breakOption: n
      });
    default:
      return new (Bt.getClass(e) || Vr)({});
  }
}
function GA(t, e, r) {
  var n = t.getExtentUnsafe(xt, null), i = n[0], a = n[1];
  return Ei(i, a) ? i === e || a === e ? WA : i < e && a > e ? UA : Nh : Nh;
}
var UA = 1, WA = 2, Nh = 3;
function YA(t) {
  a1(t).noOnMyZero = !0;
}
function XA(t) {
  return a1(t).noOnMyZero;
}
function Ku(t) {
  var e = t.getLabelModel().get("formatter");
  if (t.type === "time") {
    var r = NC(e);
    return function(i, a) {
      return t.scale.getFormattedLabel(i, a, r);
    };
  } else {
    if (z(e))
      return function(i) {
        var a = t.scale.getLabel(i), o = e.replace("{value}", a ?? "");
        return o;
      };
    if (Q(e)) {
      if (t.type === "category")
        return function(i, a) {
          return e(
            hu(t, i),
            i.value - t.scale.getExtent()[0],
            null
            // Using `null` just for backward compat.
          );
        };
      var n = Gu();
      return function(i, a) {
        var o = null;
        return n && (o = n.makeAxisLabelFormatterParamBreak(o, i.break)), e(hu(t, i), a, o);
      };
    } else
      return function(i) {
        return t.scale.getLabel(i);
      };
  }
}
function hu(t, e) {
  var r = t.scale;
  return Mt(r) ? r.getLabel(e) : e.value;
}
function hv(t) {
  var e = t.get("interval");
  return e ?? "auto";
}
function ZA(t) {
  return t.type === "category" && hv(t.getLabelModel()) === 0;
}
function $A(t, e) {
  var r = {};
  return x(t.mapDimensionsAll(e), function(n) {
    r[pA(t, n)] = !0;
  }), le(r);
}
function Pi(t) {
  return t === "middle" || t === "center";
}
function Ja(t) {
  return t.getShallow("show");
}
function qA(t, e, r) {
  var n = t.get("breaks", !0);
  if (n != null) {
    process.env.NODE_ENV !== "production" && he('Must `import {AxisBreak} from "echarts/features.js"; use(AxisBreak);` first if using breaks option.');
    return;
  }
}
function o1(t, e, r, n, i, a) {
  var o = Li(t), s = o ? t.intervalStub : t;
  if (s.setExtent(n[0], n[1]), o) {
    var u = t.powStub, l = {
      depth: su
    }, f = t.transformOut(n[0], l), h = t.transformOut(n[1], l), c = AA(r, n);
    e[0] && !c[0] && (f = i[0]), e[1] && !c[1] && (h = i[1]), u.setExtent(f, h);
  }
  s.setConfig(a);
}
function mo(t, e) {
  return Mt(t) ? t.getRawOrdinalNumber(e.value) : e.value;
}
function s1(t, e) {
  return Mt(t) && !!e.get("boundaryGap");
}
var KA = (
  /** @class */
  function() {
    function t() {
    }
    return t.prototype.needIncludeZero = function() {
      return !this.option.scale;
    }, t.prototype.getCoordSysModel = function() {
    }, t;
  }()
);
By();
var Rh = "|&", yo = ve(), QA = -2;
ve();
var Gi;
process.env.NODE_ENV !== "production" && (Gi = function(t) {
  N(t && t.model && t.model.uid && t.model.ecModel);
});
function u1(t, e) {
  var r = t.model, n = yo(po(r.ecModel)).keyed, i = n && n.get(e);
  return i && i.get(r.uid);
}
function jA(t, e) {
  return process.env.NODE_ENV !== "production" && (N(e != null), Gi(t)), l1(u1(t, e));
}
function JA(t, e) {
  process.env.NODE_ENV !== "production" && Gi(t);
  var r = [];
  return eI(t.model.ecModel, function(n) {
    for (var i = 0; i < e.length; i++)
      e[i] && n.serByIdx[e[i].seriesIndex] && r.push(l1(n));
  }), r;
}
function eI(t, e) {
  var r = yo(po(t)).keyed;
  r && r.each(function(n, i) {
    n.each(function(a, o) {
      e(a, i, o);
    });
  });
}
function l1(t) {
  return {
    liPosMinGap: t ? t.liPosMinGap : void 0
  };
}
function tI(t, e) {
  process.env.NODE_ENV !== "production" && Gi(t);
  var r = t.model.ecModel, n = yo(po(r)).axSer;
  n && rI(r, n.get(t.model.uid), e);
}
function rI(t, e, r) {
  if (e)
    for (var n = 0; n < e.length; n++) {
      var i = e[n];
      t.isSeriesFiltered(i) || r(i);
    }
}
function f1(t, e) {
  process.env.NODE_ENV !== "production" && Gi(t);
  var r = t.model, n = yo(po(r.ecModel)).keys;
  n && x(n.get(r.uid), function(i) {
    if (process.env.NODE_ENV !== "production") {
      var a = u1(t, i);
      N(a && a.sers.length > 0);
    }
    e(i);
  });
}
function Mg(t, e, r) {
  if (t) {
    var n = e.ecModel, i = yo(po(n)), a = t.model.uid;
    if (process.env.NODE_ENV !== "production") {
      Gi(t);
      var o = i.axSerPairCheck || (i.axSerPairCheck = Z()), s = "" + a + Rh + e.uid;
      N(!o.get(s)), o.set(s, 1);
    }
    var u = i.axSer || (i.axSer = Z()), l = u.get(a) || u.set(a, []);
    if (process.env.NODE_ENV !== "production") {
      var f = l[l.length - 1];
      f && N(f.seriesIndex < e.seriesIndex);
    }
    l.push(e);
    var h = e.subType, c = e.getBaseAxis() === t, v = Ag.get(Eg(h, c, r)) || Ag.get(Eg(h, c, null));
    if (v) {
      var d = i.keyed || (i.keyed = Z()), p = i.keys || (i.keys = Z()), m = v.key, g = d.get(m) || d.set(m, Z()), y = g.get(a);
      y || (y = g.set(a, {
        axis: t,
        sers: [],
        serByIdx: []
      }), y.metrics = v.getMetrics(t), (p.get(a) || p.set(a, [])).push(m)), y.sers.push(e), y.serByIdx[e.seriesIndex] = e;
    }
  }
}
function Eg(t, e, r) {
  return t + Rh + W(e, !0) + Rh + (r || "");
}
process.env.NODE_ENV !== "production" && Z();
var Ag = Z(), nI = ve(), iI = 1, h1 = 2, aI = 3, c1 = (
  /** @class */
  function() {
    function t(e, r, n, i, a) {
      var o = Mt(e), s = o ? r.getCategories().length : null, u;
      if (o) {
        var l = r.getCategories(!0);
        u = l && !l.length;
      }
      var f = n.slice();
      (lu(e) || Li(e) || go(e)) && (Ry(f, aa(e, r.get("dataMin", !0))), ky(f, aa(e, r.get("dataMax", !0)))), Ww(f) || (f[0] = f[1] = NaN);
      var h = [], c = [!1, !1], v = r.get("min", !0);
      v === "dataMin" ? (h[0] = f[0], c[0] = !0) : (h[0] = aa(e, Q(v) ? v({
        min: f[0],
        max: f[1]
      }) : v), c[0] = h[0] != null);
      var d = r.get("max", !0);
      d === "dataMax" ? (h[1] = f[1], c[1] = !0) : (h[1] = aa(e, Q(d) ? d({
        min: f[0],
        max: f[1]
      }) : d), c[1] = h[1] != null);
      var p = oI(e, r), m = o ? null : f[1] - f[0] || Math.abs(f[0]);
      h[0] == null && (h[0] = o ? u ? f[0] : s ? 0 : NaN : f[0] - p[0] * m), h[1] == null && (h[1] = o ? u ? f[1] : s ? s - 1 : NaN : f[1] + p[1] * m), !yr(h[0]) && (h[0] = NaN), !yr(h[1]) && (h[1] = NaN);
      var g = u || bi(h[0]) || bi(h[1]) || o && !s, y = lu(e), _ = y && r.needIncludeZero && r.needIncludeZero();
      _ && (h[0] > 0 && h[1] > 0 && !c[0] && (h[0] = 0), h[0] < 0 && h[1] < 0 && !c[1] && (h[1] = 0));
      var S = !1;
      h[0] > h[1] && (h.reverse(), S = !0);
      var b = aa(e, r.get("startValue", !0)), w = b != null;
      !er(b) && i && (b = e.getDefaultStartValue ? e.getDefaultStartValue() : 0), er(b) && (w || !y || _) && (b < h[0] && !c[0] ? (h[0] = b, c[0] = !0) : b > h[1] && !c[1] && (h[1] = b, c[1] = !0));
      var T = this._i = {
        scale: e,
        dataMM: f,
        noZoomEffMM: h,
        zoomMM: [],
        fixMM: c,
        zoomFixMM: [!1, !1],
        startValue: b,
        isBlank: g,
        incl0: _,
        tggAxInv: S,
        ctnShp: a
      };
      Ig(T, h);
    }
    return t.prototype.makeNoZoom = function() {
      return this._i.noZoomEffMM.slice();
    }, t.prototype.makeFinal = function() {
      var e = this._i, r = e.zoomMM, n = e.noZoomEffMM, i = e.zoomFixMM, a = e.fixMM, o = {
        fixMM: a,
        zoomFixMM: i,
        isBlank: e.isBlank,
        incl0: e.incl0,
        tggAxInv: e.tggAxInv,
        ctnShp: e.ctnShp,
        effMM: n.slice()
      }, s = o.effMM;
      return r[0] != null && (s[0] = r[0], a[0] = i[0] = !0), r[1] != null && (s[1] = r[1], a[1] = i[1] = !0), Ig(e, s), o;
    }, t.prototype.makeRenderInfo = function() {
      return {
        startValue: this._i.startValue
      };
    }, t.prototype.setZoomMM = function(e, r) {
      this._i.zoomMM[e] = r;
    }, t;
  }()
);
function Ig(t, e) {
  var r = t.scale, n = t.dataMM;
  r.sanitize && (e[0] = r.sanitize(e[0], n), e[1] = r.sanitize(e[1], n), ps(e));
}
function aa(t, e) {
  return e == null ? null : bi(e) ? NaN : t.parse(e);
}
function oI(t, e) {
  var r;
  if (Mt(t))
    r = [0, 0];
  else {
    var n = e.get("boundaryGap");
    typeof n == "boolean" && (process.env.NODE_ENV !== "production" && n === !0 && console.warn('Boolean type for boundaryGap is only allowed for ordinal axis. Please use string in percentage instead, e.g., "20%". Currently, boundaryGap is set to 0.'), n = null), r = H(n) ? n : [n, n];
  }
  return [Og(r[0]), Og(r[1])];
}
function Og(t) {
  return Di(typeof t == "boolean" ? 0 : t, 1) || 0;
}
function v1(t) {
  var e = nI(t.scale);
  return e.extent || (e.extent = St()), e;
}
function sI(t, e) {
  v1(t).dimIdxInCoord = e.get(t.dim);
}
function d1(t, e) {
  var r = t.scale, n = t.model, i = t.dim;
  if (process.env.NODE_ENV !== "production" && N(r && n && i), r.rawExtentInfo) {
    process.env.NODE_ENV !== "production" && N(r.rawExtentInfo.from !== e || e === h1);
    return;
  }
  uI(r, t, i, n, e);
}
function uI(t, e, r, n, i) {
  var a = v1(e), o = a.extent, s = !1;
  tI(e, function(f) {
    if (f.boxCoordinateSystem) {
      var h = W0(f).coord, c = a.dimIdxInCoord;
      if (!(c >= 0))
        process.env.NODE_ENV !== "production" && he('Property "series.coord" is not supported on axis ' + f.boxCoordinateSystem.type + ".");
      else if (H(h)) {
        var v = h[c];
        v != null && !H(v) && ih(o, t.parse(v));
      }
    } else if (f.coordinateSystem) {
      var d = f.getData();
      if (d) {
        var p = t.getFilter ? t.getFilter() : null;
        x($A(d, r), function(m) {
          Uw(o, d.getApproximateExtent(m, p));
        });
      }
      f.__requireStartValue && f.__requireStartValue(e) && (s = !0);
    }
  });
  var u = fI(t, e, n), l = new c1(t, n, o, s, u);
  p1(t, l, i), a.extent = null;
}
function lI(t, e) {
  var r = t.scale;
  process.env.NODE_ENV !== "production" && N(!r.rawExtentInfo), p1(r, new c1(r, t.model, e, !1, !1), aI);
}
function p1(t, e, r) {
  t.rawExtentInfo = e, e.from = r;
}
var g1 = Z();
function m1(t, e, r, n, i) {
  process.env.NODE_ENV !== "production" && N(!0), t.rawExtentInfo || lI({
    scale: t,
    model: e
  }, St());
  var a = t.rawExtentInfo.makeFinal(), o = a.effMM;
  return t.setExtent(o[0], o[1]), t.setBlank(a.isBlank), n && a.tggAxInv && r && !r.get("legacyMinMaxDontInverseAxis") && (n.inverse = !n.inverse), a;
}
function fI(t, e, r) {
  var n = s1(t, r), i = r.get("containShape", !0);
  if (i == null && !n && (i = !0), !i)
    return !1;
  var a = !1;
  return f1(e, function(o) {
    a = !!g1.get(o) || a;
  }), a;
}
function hI(t, e, r, n) {
  if (r.ctnShp) {
    var i;
    if (f1(t, function(s) {
      var u = g1.get(s);
      if (u) {
        var l = u(t, n);
        l && (i = i || [0, 0], Ry(i, l[0]), ky(i, l[1]), YA(t));
      }
    }), !!i) {
      var a = e.getExtent();
      if (Mt(e))
        t.onBand || e.setExtent2(Qa, st(a[0], a[0] + i[0]), ye(a[1], a[1] + i[1]));
      else {
        var o = a.slice();
        r.zoomFixMM[0] || (o[0] = st(o[0], e.transformOut(e.transformIn(o[0], null) + i[0], null))), r.zoomFixMM[1] || (o[1] = ye(o[1], e.transformOut(e.transformIn(o[1], null) + i[1], null))), (o[0] < a[0] || o[1] > a[1]) && e.setExtent2(Qa, o[0], o[1]);
      }
    }
  }
}
function Lg(t, e) {
  var r = Li(t), n = r ? t.intervalStub : t, i = e.fixMinMax || [], a = r ? t.getExtent() : null, o = n.getExtent(), s = e1(o, i, e.rawExtentResult);
  n.setExtent(s[0], s[1]), s = n.getExtent();
  var u = r ? vI(n, e) : cI(n, e), l = u.intervalPrecision, f = u.interval, h = e.userInterval;
  h != null && (u.interval = h, u.intervalPrecision = Bn(h)), i[0] || (s[0] = ue(Ln(s[0] / f) * f, l)), i[1] || (s[1] = ue(Vi(s[1] / f) * f, l)), h != null && (u.niceExtent = s.slice()), o1(t, i, o, s, a, u);
}
function cI(t, e) {
  var r = lv(e.splitNumber, 5), n = qu(t);
  process.env.NODE_ENV !== "production" && N(isFinite(n) && n > 0);
  var i = e.minInterval, a = e.maxInterval, o = lc(n / r, !0);
  i != null && o < i && (o = i), a != null && o > a && (o = a);
  var s = Bn(o), u = t.getExtent(), l = [ue(Vi(u[0] / o) * o, s), ue(Ln(u[1] / o) * o, s)];
  return {
    interval: o,
    intervalPrecision: s,
    niceExtent: l
  };
}
function vI(t, e) {
  var r = lv(e.splitNumber, 10), n = t.getExtent(), i = qu(t);
  process.env.NODE_ENV !== "production" && N(isFinite(i) && i > 0);
  var a = ye(My(i), 1), o = r / i * a;
  o <= 0.5 && (a *= 10);
  var s = Bn(a), u = [ue(Vi(n[0] / a) * a, s), ue(Ln(n[1] / a) * a, s)];
  return {
    intervalPrecision: s,
    interval: a,
    niceExtent: u
  };
}
function Pg(t) {
  var e = t.scale, r = t.model, n = r.axis, i = r.ecModel;
  process.env.NODE_ENV !== "production" && N(n && i), dI(e, r, n, i);
}
function dI(t, e, r, n, i) {
  var a = m1(t, e, n, r), o = lu(t) || go(t);
  pI(t, {
    splitNumber: e.get("splitNumber"),
    fixMinMax: a.fixMM,
    userInterval: e.get("interval"),
    minInterval: o ? e.get("minInterval") : null,
    maxInterval: o ? e.get("maxInterval") : null,
    rawExtentResult: a
  }), r && n && hI(r, t, a, n), process.env.NODE_ENV !== "production" && t.freeze();
}
function pI(t, e) {
  gI[t.type](t, e);
}
var gI = {
  interval: Lg,
  log: Lg,
  time: FA,
  ordinal: Fe
}, Ng = [], mI = {
  registerPreprocessor: U_,
  registerProcessor: W_,
  registerPostInit: UE,
  registerPostUpdate: WE,
  registerUpdateLifecycle: iv,
  registerAction: Fn,
  registerCoordinateSystem: YE,
  registerLayout: XE,
  registerVisual: zn,
  registerTransform: $E,
  registerLoading: Y_,
  registerMap: ZE,
  registerImpl: WM,
  PRIORITY: kE,
  ComponentModel: ce,
  ComponentView: Pt,
  SeriesModel: Wr,
  ChartView: Jt,
  // TODO Use ComponentModel and SeriesModel instead of Constructor
  registerComponentModel: function(t) {
    ce.registerClass(t);
  },
  registerComponentView: function(t) {
    Pt.registerClass(t);
  },
  registerSeriesModel: function(t) {
    Wr.registerClass(t);
  },
  registerChartView: function(t) {
    Jt.registerClass(t);
  },
  registerCustomSeries: function(t, e) {
  },
  registerSubTypeDefaulter: function(t, e) {
    ce.registerSubTypeDefaulter(t, e);
  },
  registerPainter: function(t, e) {
    dw(t, e);
  }
};
function nr(t) {
  if (H(t)) {
    x(t, function(e) {
      nr(e);
    });
    return;
  }
  fe(Ng, t) >= 0 || (Ng.push(t), Q(t) && (t = {
    install: t
  }), t.install(mI));
}
var yI = ve(), Ra = ve(), Nt = {
  estimate: 1,
  determine: 2
};
function cu(t) {
  return {
    out: {
      noPxChangeTryDetermine: []
    },
    kind: t
  };
}
function _I(t, e) {
  var r = t.getLabelModel().get("customValues");
  if (r) {
    var n = t.scale;
    return {
      labels: X(y1(r, n), function(i, a) {
        return {
          formattedLabel: Ku(t)(i, a),
          rawLabel: n.getLabel(i),
          tick: i
        };
      })
    };
  }
  return t.type === "category" ? bI(t, e) : TI(t);
}
function SI(t, e, r) {
  var n = t.scale, i = t.getTickModel().get("customValues");
  return i ? {
    ticks: y1(i, n)
  } : t.type === "category" ? wI(t, e) : {
    ticks: n.getTicks(r)
  };
}
function y1(t, e) {
  var r = e.getExtent(), n = [];
  return x(t, function(i) {
    i = e.parse(i), i >= r[0] && i <= r[1] && n.push(i);
  }), vc(n, Zw, null), Lr(n), X(n, function(i) {
    return {
      value: i
    };
  });
}
function bI(t, e) {
  var r = t.getLabelModel(), n = _1(t, r, e);
  return !r.get("show") || t.scale.isBlank() ? {
    labels: []
  } : n;
}
function _1(t, e, r) {
  var n = CI(t), i = hv(e), a = r.kind === Nt.estimate;
  if (!a) {
    var o = b1(n, i);
    if (o)
      return o;
  }
  var s, u;
  Q(i) ? s = vu(t, i, !1) : (u = i === "auto" ? DI(t, r) : i, s = vu(t, u, !1));
  var l = {
    labels: s,
    labelCategoryInterval: u
  };
  return a ? r.out.noPxChangeTryDetermine.push(function() {
    return kh(n, i, l), !0;
  }) : kh(n, i, l), l;
}
function wI(t, e) {
  var r = xI(t), n = hv(e), i = b1(r, n);
  if (i)
    return i;
  var a, o;
  if ((!e.get("show") || t.scale.isBlank()) && (a = []), Q(n))
    a = vu(t, n, !0);
  else if (n === "auto") {
    var s = _1(t, t.getLabelModel(), cu(Nt.determine));
    o = s.labelCategoryInterval, a = X(s.labels, function(u) {
      return u.tick;
    });
  } else
    o = n, a = vu(t, o, !0);
  return kh(r, n, {
    ticks: a,
    tickCategoryInterval: o
  });
}
function TI(t) {
  var e = t.scale.getTicks(), r = Ku(t);
  return {
    labels: X(e, function(n, i) {
      return {
        formattedLabel: r(n, i),
        rawLabel: t.scale.getLabel(n),
        tick: n
      };
    })
  };
}
var xI = S1("axisTick"), CI = S1("axisLabel");
function S1(t) {
  return function(r) {
    return Ra(r)[t] || (Ra(r)[t] = {
      list: []
    });
  };
}
function b1(t, e) {
  for (var r = 0; r < t.list.length; r++)
    if (t.list[r].key === e)
      return t.list[r].value;
}
function kh(t, e, r) {
  return t.list.push({
    key: e,
    value: r
  }), r;
}
function DI(t, e) {
  if (e.kind === Nt.estimate) {
    var r = t.calculateCategoryInterval(e);
    return e.out.noPxChangeTryDetermine.push(function() {
      return Ra(t).autoInterval = r, !0;
    }), r;
  }
  var n = Ra(t).autoInterval;
  return n ?? (Ra(t).autoInterval = t.calculateCategoryInterval(e));
}
function MI(t, e) {
  var r = e.kind, n = AI(t), i = Ku(t), a = (n.axisRotate - n.labelRotate) / 180 * Math.PI, o = t.scale, s = o.getExtent(), u = o.count();
  if (s[1] - s[0] < 1)
    return 0;
  var l = 1, f = 40;
  u > f && (l = Math.max(1, Math.floor(u / f)));
  for (var h = s[0], c = t.dataToCoord(h + 1) - t.dataToCoord(h), v = Math.abs(c * Math.cos(a)), d = Math.abs(c * Math.sin(a)), p = 0, m = 0; h <= s[1]; h += l) {
    var g = 0, y = 0, _ = Sy(i({
      value: h
    }), n.font, "center", "top");
    g = _.width * 1.3, y = _.height * 1.3, p = Math.max(p, g, 7), m = Math.max(m, y, 7);
  }
  var S = p / v, b = m / d;
  isNaN(S) && (S = 1 / 0), isNaN(b) && (b = 1 / 0);
  var w = Math.max(0, Math.floor(Math.min(S, b)));
  if (r === Nt.estimate)
    return e.out.noPxChangeTryDetermine.push(te(EI, null, t, w, u)), w;
  var T = w1(t, w, u);
  return T ?? w;
}
function EI(t, e, r) {
  return w1(t, e, r) == null;
}
function w1(t, e, r) {
  var n = yI(t.model), i = t.getExtent(), a = n.lastAutoInterval, o = n.lastTickCount;
  if (a != null && o != null && Math.abs(a - e) <= 1 && Math.abs(o - r) <= 1 && a > e && n.axisExtent0 === i[0] && n.axisExtent1 === i[1])
    return a;
  n.lastTickCount = r, n.lastAutoInterval = e, n.axisExtent0 = i[0], n.axisExtent1 = i[1];
}
function AI(t) {
  var e = t.getLabelModel();
  return {
    axisRotate: t.getRotate ? t.getRotate() : t.isHorizontal && !t.isHorizontal() ? 90 : 0,
    labelRotate: e.get("rotate") || 0,
    font: e.getFont()
  };
}
function vu(t, e, r) {
  var n = Ku(t), i = t.scale, a = [], o = Q(e);
  return t1(i, o ? 0 : e, function(s, u) {
    var l = i.getLabel(s);
    if (o) {
      var f = !!e(s.value, l);
      if (s.offInterval = !f, !f && !u)
        return;
    }
    a.push(r ? s : {
      formattedLabel: n(s),
      rawLabel: l,
      tick: s
    });
  }), a;
}
var II = 0.8;
function Qu(t, e) {
  e = e || {};
  var r = {
    w: NaN,
    w2: NaN
  }, n = t.scale, i = e.fromStat, a = e.min, o = CA(n);
  er(o) || (o = NaN);
  var s = t.getExtent(), u = Pe(s[1] - s[0]);
  return Mt(n) ? OI(r, t, o, u) : i ? LI(r, t, o, u, i) : a == null && process.env.NODE_ENV !== "production" && N(!1), a != null && (r.w = er(r.w) ? ye(a, r.w) : a), r;
}
function OI(t, e, r, n) {
  var i = e.onBand, a = r + (i ? 1 : 0);
  a === 0 && (a = 1), t.w = n / a, !i && r && n && (t.w2 = t.w * r / n);
}
function LI(t, e, r, n, i) {
  process.env.NODE_ENV !== "production" && N(i);
  var a = !1, o = -1 / 0;
  x(i.key ? [jA(e, i.key)] : JA(e, i.sers || []), function(s) {
    var u = s.liPosMinGap;
    u != null && (u > 0 ? (u > o && (o = u), a = !1) : u === QA && (a = !0));
  }), er(r) && r > 0 && er(o) ? (t.w = n / r * o, t.w2 = o) : a && (t.w = n * II, t.w2 = t.w * r / n);
}
var Rg = [0, 1], PI = (
  /** @class */
  function() {
    function t(e, r, n) {
      this.onBand = !1, this.inverse = !1, this.dim = e, this.scale = r, this._extent = n || [0, 0];
    }
    return t.prototype.contain = function(e) {
      var r = this._extent, n = Math.min(r[0], r[1]), i = Math.max(r[0], r[1]);
      return e >= n && e <= i;
    }, t.prototype.containData = function(e) {
      return this.scale.contain(this.scale.parse(e));
    }, t.prototype.getExtent = function() {
      return this._extent.slice();
    }, t.prototype.setExtent = function(e, r) {
      var n = this._extent;
      n[0] = e, n[1] = r;
    }, t.prototype.dataToCoord = function(e, r) {
      var n = this.scale;
      return e = n.normalize(n.parse(e)), Oe(e, Rg, kg(this), r);
    }, t.prototype.coordToData = function(e, r) {
      var n = Oe(e, kg(this), Rg, r);
      return this.scale.scale(n);
    }, t.prototype.pointToData = function(e, r) {
    }, t.prototype.getTicksCoords = function(e) {
      e = e || {};
      var r = e.tickModel || this.getTickModel(), n = SI(this, r, {
        breakTicks: e.breakTicks,
        pruneByBreak: e.pruneByBreak
      }), i = X(n.ticks, function(s) {
        return {
          coord: this.dataToCoord(mo(this.scale, s)),
          tick: s
        };
      }, this), a = r.get("alignWithLabel"), o = NI(this, i, a);
      return X(i, function(s) {
        return {
          coord: s.coord,
          tickValue: s.tick.value,
          onBand: o
        };
      });
    }, t.prototype.getMinorTicksCoords = function() {
      if (Mt(this.scale))
        return [];
      var e = this.model.getModel("minorTick"), r = e.get("splitNumber");
      r > 0 && r < 100 || (r = 5);
      var n = this.scale.getMinorTicks(r), i = X(n, function(a) {
        return X(a, function(o) {
          return {
            coord: this.dataToCoord(o),
            tickValue: o
          };
        }, this);
      }, this);
      return i;
    }, t.prototype.getViewLabels = function(e) {
      return e = e || cu(Nt.determine), _I(this, e).labels;
    }, t.prototype.getLabelModel = function() {
      return this.model.getModel("axisLabel");
    }, t.prototype.getTickModel = function() {
      return this.model.getModel("axisTick");
    }, t.prototype.getBandWidth = function() {
      return Qu(this, {
        min: 1
      }).w;
    }, t.prototype.calculateCategoryInterval = function(e) {
      return e = e || cu(Nt.determine), MI(this, e);
    }, t;
  }()
);
function kg(t) {
  var e = t.getExtent();
  if (t.onBand) {
    var r = e[1] - e[0], n = r / t.scale.count() / 2;
    e[0] += n, e[1] -= n;
  }
  return e;
}
function NI(t, e, r) {
  var n = e.length;
  if (!t.onBand || r || !n)
    return !1;
  var i = Qu(t).w;
  if (!i)
    return !1;
  x(e, function(s) {
    s.coord -= i / 2;
  });
  var a = t.scale.getExtent(), o = e[n - 1];
  return o.tick.offInterval && e.pop(), e.push({
    coord: o.coord + i,
    tick: {
      value: a[1] + 1
    }
  }), !0;
}
var Bg = ["label", "labelLine", "layoutOption", "priority", "defaultAttr", "marginForce", "minMarginForce", "marginDefault", "suggestIgnore"], RI = 1, du = 2, T1 = RI | du;
function pu(t, e, r) {
  r = r || T1, e ? t.dirty |= r : t.dirty &= ~r;
}
function x1(t, e) {
  return e = e || T1, t.dirty == null || !!(t.dirty & e);
}
function Xr(t) {
  if (t)
    return x1(t) && kI(t, t.label, t), t;
}
function kI(t, e, r) {
  var n = e.getComputedTransform();
  t.transform = Lc(t.transform, n);
  var i = t.localRect = Wa(t.localRect, e.getBoundingRect()), a = e.style, o = a.margin, s = r && r.marginForce, u = r && r.minMarginForce, l = r && r.marginDefault, f = a.__marginType;
  f == null && l && (o = l, f = vi.textMargin);
  for (var h = 0; h < 4; h++)
    df[h] = f === vi.minMargin && u && u[h] != null ? u[h] : s && s[h] != null ? s[h] : o ? o[h] : 0;
  f === vi.textMargin && Zs(i, df, !1, !1);
  var c = t.rect = Wa(t.rect, i);
  return n && c.applyTransform(n), f === vi.minMargin && Zs(c, df, !1, !1), t.axisAligned = Oc(n), (t.label = t.label || {}).ignore = e.ignore, pu(t, !1), pu(t, !0, du), t;
}
var df = [0, 0, 0, 0];
function BI(t, e, r) {
  return t.transform = Lc(t.transform, r), t.localRect = Wa(t.localRect, e), t.rect = Wa(t.rect, e), r && t.rect.applyTransform(r), t.axisAligned = Oc(r), t.obb = void 0, (t.label = t.label || {}).ignore = !1, t;
}
function VI(t, e) {
  if (t) {
    t.label.x += e.x, t.label.y += e.y, t.label.markRedraw();
    var r = t.transform;
    r && (r[4] += e.x, r[5] += e.y);
    var n = t.rect;
    n && (n.x += e.x, n.y += e.y);
    var i = t.obb;
    i && i.fromBoundingRect(t.localRect, r);
  }
}
function Vg(t, e) {
  for (var r = 0; r < Bg.length; r++) {
    var n = Bg[r];
    t[n] == null && (t[n] = e[n]);
  }
  return Xr(t);
}
function Fg(t) {
  var e = t.obb;
  return (!e || x1(t, du)) && (t.obb = e = e || new g0(), e.fromBoundingRect(t.localRect, t.transform), pu(t, !1, du)), e;
}
function FI(t) {
  var e = [];
  t.sort(function(l, f) {
    return (f.suggestIgnore ? 1 : 0) - (l.suggestIgnore ? 1 : 0) || f.priority - l.priority;
  });
  function r(l) {
    if (!l.ignore) {
      var f = l.ensureState("emphasis");
      f.ignore == null && (f.ignore = !1);
    }
    l.ignore = !0;
  }
  for (var n = 0; n < t.length; n++) {
    var i = Xr(t[n]);
    if (!i.label.ignore) {
      for (var a = i.label, o = i.labelLine, s = !1, u = 0; u < e.length; u++)
        if (cv(i, e[u], null, {
          touchThreshold: 0.05
        })) {
          s = !0;
          break;
        }
      s ? (r(a), o && r(o)) : e.push(i);
    }
  }
}
function cv(t, e, r, n) {
  return !t || !e || t.label && t.label.ignore || e.label && e.label.ignore || !t.rect.intersect(e.rect, r, n) ? !1 : t.axisAligned && e.axisAligned ? !0 : Fg(t).intersect(Fg(e), r, n);
}
var zI = (
  /** @class */
  function(t) {
    V(e, t);
    function e() {
      var r = t !== null && t.apply(this, arguments) || this;
      return r.type = e.type, r.hasSymbolVisual = !0, r;
    }
    return e.prototype.getInitialData = function(r) {
      if (process.env.NODE_ENV !== "production") {
        var n = r.coordinateSystem;
        if (n !== "polar" && n !== "cartesian2d")
          throw new Error("Line not support coordinateSystem besides cartesian and polar");
      }
      return yA(null, this, {
        useEncodeDefaulter: !0
      });
    }, e.prototype.getLegendIcon = function(r) {
      var n = new Re(), i = Yr("line", 0, r.itemHeight / 2, r.itemWidth, 0, r.lineStyle.stroke, !1);
      n.add(i), i.setStyle(r.lineStyle);
      var a = this.getData().getVisual("symbol"), o = this.getData().getVisual("symbolRotate"), s = a === "none" ? "circle" : a, u = r.itemHeight * 0.8, l = Yr(s, (r.itemWidth - u) / 2, (r.itemHeight - u) / 2, u, u, r.itemStyle.fill);
      n.add(l), l.setStyle(r.itemStyle);
      var f = r.iconRotate === "inherit" ? o : r.iconRotate || 0;
      return l.rotation = f * Math.PI / 180, l.setOrigin([r.itemWidth / 2, r.itemHeight / 2]), s.indexOf("empty") > -1 && (l.style.stroke = l.style.fill, l.style.fill = G.color.neutral00, l.style.lineWidth = 2), n;
    }, e.type = "series.line", e.dependencies = ["grid", "polar"], e.defaultOption = {
      // zlevel: 0,
      z: 3,
      coordinateSystem: "cartesian2d",
      legendHoverLink: !0,
      clip: !0,
      label: {
        position: "top"
      },
      // itemStyle: {
      // },
      endLabel: {
        show: !1,
        valueAnimation: !0,
        distance: 8
      },
      lineStyle: {
        width: 2,
        type: "solid"
      },
      emphasis: {
        scale: !0
      },
      // areaStyle: {
      // origin of areaStyle. Valid values:
      // `'auto'/null/undefined`: from axisLine to data
      // `'start'`: from min to data
      // `'end'`: from data to max
      // origin: 'auto'
      // },
      // false, 'start', 'end', 'middle'
      step: !1,
      // Disabled if step is true
      smooth: !1,
      smoothMonotone: null,
      symbol: "emptyCircle",
      symbolSize: 6,
      symbolRotate: null,
      showSymbol: !0,
      // `false`: follow the label interval strategy.
      // `true`: show all symbols.
      // `'auto'`: If possible, show all symbols, otherwise
      //           follow the label interval strategy.
      showAllSymbol: "auto",
      // Whether to connect break point. (non-finite values)
      connectNulls: !1,
      // Sampling for large data. Can be: 'average', 'max', 'min', 'sum', 'lttb'.
      sampling: "none",
      animationEasing: "linear",
      // Disable progressive
      progressive: 0,
      hoverLayerThreshold: 1 / 0,
      universalTransition: {
        divideShape: "clone"
      },
      /**
       * @deprecated
       */
      triggerLineEvent: !1,
      triggerEvent: !1
    }, e;
  }(Wr)
);
function C1(t, e) {
  var r = t.mapDimensionsAll("defaultedLabel"), n = r.length;
  if (n === 1) {
    var i = Oi(t, e, r[0]);
    return i != null ? i + "" : null;
  } else if (n) {
    for (var a = [], o = 0; o < r.length; o++)
      a.push(Oi(t, e, r[o]));
    return a.join(" ");
  }
}
function HI(t, e) {
  var r = t.mapDimensionsAll("defaultedLabel");
  if (!H(e))
    return e + "";
  for (var n = [], i = 0; i < r.length; i++) {
    var a = t.getDimensionIndex(r[i]);
    a >= 0 && n.push(e[a]);
  }
  return n.join(" ");
}
var vv = (
  /** @class */
  function(t) {
    V(e, t);
    function e(r, n, i, a) {
      var o = t.call(this) || this;
      return o.updateData(r, n, i, a), o;
    }
    return e.prototype._createSymbol = function(r, n, i, a, o, s) {
      this.removeAll();
      var u = Yr(r, -1, -1, 2, 2, null, s);
      u.attr({
        z2: W(o, 100),
        culling: !0,
        scaleX: a[0] / 2,
        scaleY: a[1] / 2
      }), u.drift = GI, this._symbolType = r, this.add(u);
    }, e.prototype.stopSymbolAnimation = function(r) {
      this.childAt(0).stopAnimation(null, r);
    }, e.prototype.getSymbolType = function() {
      return this._symbolType;
    }, e.prototype.getSymbolPath = function() {
      return this.childAt(0);
    }, e.prototype.highlight = function() {
      Us(this.childAt(0));
    }, e.prototype.downplay = function() {
      Ws(this.childAt(0));
    }, e.prototype.setZ = function(r, n) {
      var i = this.childAt(0);
      i.zlevel = r, i.z = n;
    }, e.prototype.setDraggable = function(r, n) {
      var i = this.childAt(0);
      i.draggable = r, i.cursor = !n && r ? "move" : i.cursor;
    }, e.prototype.updateData = function(r, n, i, a) {
      this.silent = !1;
      var o = r.getItemVisual(n, "symbol") || "circle", s = r.hostModel, u = e.getSymbolSize(r, n), l = e.getSymbolZ2(r, n), f = o !== this._symbolType, h = a && a.disableAnimation;
      if (f) {
        var c = r.getItemVisual(n, "symbolKeepAspect");
        this._createSymbol(o, r, n, u, l, c);
      } else {
        var v = this.childAt(0);
        v.silent = !1;
        var d = {
          scaleX: u[0] / 2,
          scaleY: u[1] / 2
        };
        h ? v.attr(d) : Gr(v, d, s, n), $x(v);
      }
      if (this._updateCommon(r, n, u, i, a), f) {
        var v = this.childAt(0);
        if (!h) {
          var d = {
            scaleX: this._sizeX,
            scaleY: this._sizeY,
            style: {
              // Always fadeIn. Because it has fadeOut animation when symbol is removed..
              opacity: v.style.opacity
            }
          };
          v.scaleX = v.scaleY = 0, v.style.opacity = 0, vo(v, d, s, n);
        }
      }
      h && this.childAt(0).stopAnimation("leave");
    }, e.prototype._updateCommon = function(r, n, i, a, o) {
      var s = this.childAt(0), u = r.hostModel, l, f, h, c, v, d, p, m, g;
      if (a && (l = a.emphasisItemStyle, f = a.blurItemStyle, h = a.selectItemStyle, c = a.focus, v = a.blurScope, p = a.labelStatesModels, m = a.hoverScale, g = a.cursorStyle, d = a.emphasisDisabled), !a || r.hasItemOption) {
        var y = a && a.itemModel ? a.itemModel : r.getItemModel(n), _ = y.getModel("emphasis");
        l = _.getModel("itemStyle").getItemStyle(), h = y.getModel(["select", "itemStyle"]).getItemStyle(), f = y.getModel(["blur", "itemStyle"]).getItemStyle(), c = _.get("focus"), v = _.get("blurScope"), d = _.get("disabled"), p = Nc(y), m = _.getShallow("scale"), g = y.getShallow("cursor");
      }
      var S = r.getItemVisual(n, "symbolRotate");
      s.attr("rotation", (S || 0) * Math.PI / 180 || 0);
      var b = C_(r.getItemVisual(n, "symbolOffset"), i);
      b && (s.x = b[0], s.y = b[1]), g && s.attr("cursor", g);
      var w = r.getItemVisual(n, "style"), T = w.fill;
      if (s instanceof or) {
        var M = s.style;
        s.useStyle(R({
          // TODO other properties like x, y ?
          image: M.image,
          x: M.x,
          y: M.y,
          width: M.width,
          height: M.height
        }, w));
      } else
        s.__isEmptyBrush ? s.useStyle(R({}, w)) : s.useStyle(w), s.style.decal = null, s.setColor(T, o && o.symbolInnerColor), s.style.strokeNoScale = !0;
      var D = r.getItemVisual(n, "liftZ"), C = this._z2;
      D != null ? C == null && (this._z2 = s.z2, s.z2 += D) : C != null && (s.z2 = C, this._z2 = null);
      var E = o && o.useNameLabel;
      Pc(s, p, {
        labelFetcher: u,
        labelDataIndex: n,
        defaultText: I,
        inheritColor: T,
        defaultOpacity: w.opacity
      });
      function I(P) {
        return E ? r.getName(P) : C1(r, P);
      }
      this._sizeX = i[0] / 2, this._sizeY = i[1] / 2;
      var A = s.ensureState("emphasis");
      A.style = l, s.ensureState("select").style = h, s.ensureState("blur").style = f;
      var O = m == null || m === !0 ? Math.max(1.1, 3 / this._sizeY) : isFinite(m) && m > 0 ? +m : 1;
      A.scaleX = this._sizeX * O, A.scaleY = this._sizeY * O, this.setSymbolScale(1), vh(this, c, v, d);
    }, e.prototype.setSymbolScale = function(r) {
      this.scaleX = this.scaleY = r;
    }, e.prototype.fadeOut = function(r, n, i) {
      var a = this.childAt(0), o = me(this).dataIndex, s = i && i.animation;
      if (this.silent = a.silent = !0, i && i.fadeLabel) {
        var u = a.getTextContent();
        u && Xs(u, {
          style: {
            opacity: 0
          }
        }, n, {
          dataIndex: o,
          removeOpt: s,
          cb: function() {
            a.removeTextContent();
          }
        });
      } else
        a.removeTextContent();
      Xs(a, {
        style: {
          opacity: 0
        },
        scaleX: 0,
        scaleY: 0
      }, n, {
        dataIndex: o,
        cb: r,
        removeOpt: s
      });
    }, e.getSymbolSize = function(r, n) {
      return oE(r.getItemVisual(n, "symbolSize"));
    }, e.getSymbolZ2 = function(r, n) {
      return r.getItemVisual(n, "z2");
    }, e;
  }(Re)
);
function GI(t, e) {
  this.parent.drift(t, e);
}
function as(t, e, r, n) {
  return e && !isNaN(e[0]) && !isNaN(e[1]) && !(n && n.isIgnore && n.isIgnore(r)) && !(n && n.clipShape && !n.clipShape.contain(e[0], e[1])) && t.getItemVisual(r, "symbol") !== "none";
}
function zg(t) {
  return t != null && !q(t) && (t = {
    isIgnore: t
  }), t || {};
}
function Hg(t) {
  var e = t.hostModel, r = e.getModel("emphasis");
  return {
    emphasisItemStyle: r.getModel("itemStyle").getItemStyle(),
    blurItemStyle: e.getModel(["blur", "itemStyle"]).getItemStyle(),
    selectItemStyle: e.getModel(["select", "itemStyle"]).getItemStyle(),
    focus: r.get("focus"),
    blurScope: r.get("blurScope"),
    emphasisDisabled: r.get("disabled"),
    hoverScale: r.get("scale"),
    labelStatesModels: Nc(e),
    cursorStyle: e.get("cursor")
  };
}
function Gg(t, e, r, n, i, a, o) {
  var s = new t(e, r, n, i);
  return s.setPosition(a), e.setItemGraphicEl(r, s), o.add(s), s;
}
var UI = (
  /** @class */
  function() {
    function t(e) {
      this.group = new Re(), this._SymbolCtor = e || vv;
    }
    return t.prototype.updateData = function(e, r) {
      this._progressiveEls = null, r = zg(r);
      var n = this.group, i = e.hostModel, a = this._data, o = this._SymbolCtor, s = r.disableAnimation, u = this._seriesScope = Hg(e), l = {
        disableAnimation: s
      }, f = r.getSymbolPoint || function(h) {
        return e.getItemLayout(h);
      };
      a || n.removeAll(), e.diff(a).add(function(h) {
        var c = f(h);
        as(e, c, h, r) && Gg(o, e, h, u, l, c, n);
      }).update(function(h, c) {
        var v = a.getItemGraphicEl(c), d = f(h);
        if (!as(e, d, h, r)) {
          n.remove(v);
          return;
        }
        var p = e.getItemVisual(h, "symbol") || "circle", m = v && v.getSymbolType && v.getSymbolType();
        if (!v || m && m !== p)
          n.remove(v), v = new o(e, h, u, l), v.setPosition(d);
        else {
          v.updateData(e, h, u, l);
          var g = {
            x: d[0],
            y: d[1]
          };
          s ? v.attr(g) : Gr(v, g, i);
        }
        n.add(v), e.setItemGraphicEl(h, v);
      }).remove(function(h) {
        var c = a.getItemGraphicEl(h);
        c && c.fadeOut(function() {
          n.remove(c);
        }, i);
      }).execute(), this._getSymbolPoint = f, this._data = e;
    }, t.prototype.updateLayout = function(e) {
      var r = this._data;
      if (r)
        for (var n = this, i = r.getStore(), a = 0, o = i.count(); a < o; a++) {
          var s = r.getItemGraphicEl(a), u = n._getSymbolPoint(a);
          as(r, u, a, e) ? (s = s || Gg(n._SymbolCtor, r, a, n._seriesScope, {
            disableAnimation: !0
          }, u, n.group), s.stopAnimation(), s.setPosition(u), s.markRedraw()) : s && (n.group.remove(s), r.setItemGraphicEl(a, null));
        }
    }, t.prototype.incrementalPrepareUpdate = function(e) {
      this._seriesScope = Hg(e), this._data = null, this.group.removeAll();
    }, t.prototype.incrementalUpdate = function(e, r, n, i) {
      this._progressiveEls = [], i = zg(i);
      function a(l) {
        l.isGroup || (l.incremental = n, l.ensureState("emphasis").hoverLayer = Mc);
      }
      for (var o = e.start; o < e.end; o++) {
        var s = r.getItemLayout(o);
        if (as(r, s, o, i)) {
          var u = new this._SymbolCtor(r, o, this._seriesScope);
          u.traverse(a), u.setPosition(s), this.group.add(u), r.setItemGraphicEl(o, u), this._progressiveEls.push(u);
        }
      }
    }, t.prototype.eachRendered = function(e) {
      Ic(this._progressiveEls || this.group, e);
    }, t.prototype.remove = function(e) {
      var r = this.group, n = this._data;
      n && e ? n.eachItemGraphicEl(function(i) {
        i.fadeOut(function() {
          r.remove(i);
        }, n.hostModel);
      }) : r.removeAll();
    }, t;
  }()
);
function D1(t, e, r) {
  var n = t.getBaseAxis(), i = t.getOtherAxis(n), a = WI(i, r), o = n.dim, s = i.dim, u = e.mapDimension(s), l = e.mapDimension(o), f = s === "x" || s === "radius" ? 1 : 0, h = X(t.dimensions, function(d) {
    return e.mapDimension(d);
  }), c = !1, v = e.getCalculationInfo("stackResultDimension");
  return Ka(
    e,
    h[0]
    /* , dims[1] */
  ) && (c = !0, h[0] = v), Ka(
    e,
    h[1]
    /* , dims[0] */
  ) && (c = !0, h[1] = v), {
    dataDimsForPoint: h,
    valueStart: a,
    valueAxisDim: s,
    baseAxisDim: o,
    stacked: !!c,
    valueDim: u,
    baseDim: l,
    baseDataOffset: f,
    stackedOverDimension: e.getCalculationInfo("stackedOverDimension")
  };
}
function WI(t, e) {
  var r = 0, n = t.scale.getExtent();
  return e === "start" ? r = n[0] : e === "end" ? r = n[1] : Te(e) && !isNaN(e) ? r = e : n[0] > 0 ? r = n[0] : n[1] < 0 && (r = n[1]), r;
}
function M1(t, e, r, n) {
  var i = NaN;
  t.stacked && (i = r.get(r.getCalculationInfo("stackedOverDimension"), n)), isNaN(i) && (i = t.valueStart);
  var a = t.baseDataOffset, o = [];
  return o[a] = r.get(t.baseDim, n), o[1 - a] = i, e.dataToPoint(o);
}
function Dt(t, e) {
  return !isFinite(t) || !isFinite(e);
}
var YI = typeof Float32Array !== co ? Float32Array : void 0;
function di(t) {
  return XI({
    ctor: YI
  }, t).arr;
}
function XI(t, e) {
  process.env.NODE_ENV !== "production" && N(e != null && isFinite(e) && e >= 0 && t.hasOwnProperty("ctor"));
  var r = t.arr, n = t.ctor;
  if (e > hd && (e = hd), !r || t.typed && r.length < e) {
    var i = void 0;
    if (n)
      try {
        i = new n(e), t.typed = !0, r && i.set(r);
      } catch (s) {
        process.env.NODE_ENV !== "production" && he(s);
      }
    if (!i && (i = [], t.typed = !1, r))
      for (var a = 0, o = r.length; a < o; a++)
        i[a] = r[a];
    t.arr = i;
  }
  return t;
}
function ZI(t, e) {
  var r = [];
  return e.diff(t).add(function(n) {
    r.push({
      cmd: "+",
      idx: n
    });
  }).update(function(n, i) {
    r.push({
      cmd: "=",
      idx: i,
      idx1: n
    });
  }).remove(function(n) {
    r.push({
      cmd: "-",
      idx: n
    });
  }).execute(), r;
}
function $I(t, e, r, n, i, a, o, s) {
  for (var u = ZI(t, e), l = [], f = [], h = [], c = [], v = [], d = [], p = [], m = D1(i, e, o), g = t.getLayout("points") || [], y = e.getLayout("points") || [], _ = 0; _ < u.length; _++) {
    var S = u[_], b = !0, w = void 0, T = void 0;
    switch (S.cmd) {
      case "=":
        w = S.idx * 2, T = S.idx1 * 2;
        var M = g[w], D = g[w + 1], C = y[T], E = y[T + 1];
        (isNaN(M) || isNaN(D)) && (M = C, D = E), l.push(M, D), f.push(C, E), h.push(r[w], r[w + 1]), c.push(n[T], n[T + 1]), p.push(e.getRawIndex(S.idx1));
        break;
      case "+":
        var I = S.idx, A = m.dataDimsForPoint, O = i.dataToPoint([e.get(A[0], I), e.get(A[1], I)]);
        T = I * 2, l.push(O[0], O[1]), f.push(y[T], y[T + 1]);
        var P = M1(m, i, e, I);
        h.push(P[0], P[1]), c.push(n[T], n[T + 1]), p.push(e.getRawIndex(I));
        break;
      case "-":
        b = !1;
    }
    b && (v.push(S), d.push(d.length));
  }
  d.sort(function(ne, oe) {
    return p[ne] - p[oe];
  });
  for (var L = l.length, B = di(L), U = di(L), Y = di(L), j = di(L), K = [], _ = 0; _ < d.length; _++) {
    var J = d[_], $ = _ * 2, F = J * 2;
    B[$] = l[F], B[$ + 1] = l[F + 1], U[$] = f[F], U[$ + 1] = f[F + 1], Y[$] = h[F], Y[$ + 1] = h[F + 1], j[$] = c[F], j[$ + 1] = c[F + 1], K[_] = v[J];
  }
  return {
    current: B,
    next: U,
    stackedOnCurrent: Y,
    stackedOnNext: j,
    status: K
  };
}
var Cr = Math.min, Dr = Math.max;
function Bh(t, e, r, n, i, a, o, s, u) {
  for (var l, f, h, c, v, d, p = r, m = 0; m < n; m++) {
    var g = e[p * 2], y = e[p * 2 + 1];
    if (p >= i || p < 0)
      break;
    if (Dt(g, y)) {
      if (u) {
        p += a;
        continue;
      }
      break;
    }
    if (p === r)
      t[a > 0 ? "moveTo" : "lineTo"](g, y), h = g, c = y;
    else {
      var _ = g - l, S = y - f;
      if (_ * _ + S * S < 0.5) {
        p += a;
        continue;
      }
      if (o > 0) {
        for (var b = p + a, w = e[b * 2], T = e[b * 2 + 1]; w === g && T === y && m < n; )
          m++, b += a, p += a, w = e[b * 2], T = e[b * 2 + 1], g = e[p * 2], y = e[p * 2 + 1], _ = g - l, S = y - f;
        var M = m + 1;
        if (u)
          for (; Dt(w, T) && M < n; )
            M++, b += a, w = e[b * 2], T = e[b * 2 + 1];
        var D = 0.5, C = 0, E = 0, I = void 0, A = void 0;
        if (M >= n || Dt(w, T))
          v = g, d = y;
        else {
          C = w - l, E = T - f;
          var O = g - l, P = w - g, L = y - f, B = T - y, U = void 0, Y = void 0;
          if (s === "x") {
            U = Math.abs(O), Y = Math.abs(P);
            var j = C > 0 ? 1 : -1;
            v = g - j * U * o, d = y, I = g + j * Y * o, A = y;
          } else if (s === "y") {
            U = Math.abs(L), Y = Math.abs(B);
            var K = E > 0 ? 1 : -1;
            v = g, d = y - K * U * o, I = g, A = y + K * Y * o;
          } else
            U = Math.sqrt(O * O + L * L), Y = Math.sqrt(P * P + B * B), D = Y / (Y + U), v = g - C * o * (1 - D), d = y - E * o * (1 - D), I = g + C * o * D, A = y + E * o * D, I = Cr(I, Dr(w, g)), A = Cr(A, Dr(T, y)), I = Dr(I, Cr(w, g)), A = Dr(A, Cr(T, y)), C = I - g, E = A - y, v = g - C * U / Y, d = y - E * U / Y, v = Cr(v, Dr(l, g)), d = Cr(d, Dr(f, y)), v = Dr(v, Cr(l, g)), d = Dr(d, Cr(f, y)), C = g - v, E = y - d, I = g + C * Y / U, A = y + E * Y / U;
        }
        t.bezierCurveTo(h, c, v, d, g, y), h = I, c = A;
      } else
        t.lineTo(g, y);
    }
    l = g, f = y, p += a;
  }
  return m;
}
var E1 = (
  /** @class */
  /* @__PURE__ */ function() {
    function t() {
      this.smooth = 0, this.smoothConstraint = !0;
    }
    return t;
  }()
), qI = (
  /** @class */
  function(t) {
    V(e, t);
    function e(r) {
      var n = t.call(this, r) || this;
      return n.type = "ec-polyline", n;
    }
    return e.prototype.getDefaultStyle = function() {
      return {
        stroke: G.color.neutral99,
        fill: null
      };
    }, e.prototype.getDefaultShape = function() {
      return new E1();
    }, e.prototype.buildPath = function(r, n) {
      var i = n.points, a = 0, o = i.length / 2;
      if (n.connectNulls) {
        for (; o > 0 && Dt(i[o * 2 - 2], i[o * 2 - 1]); o--)
          ;
        for (; a < o && Dt(i[a * 2], i[a * 2 + 1]); a++)
          ;
      }
      for (; a < o; )
        a += Bh(r, i, a, o, o, 1, n.smooth, n.smoothMonotone, n.connectNulls) + 1;
    }, e.prototype.getPointOn = function(r, n) {
      this.path || (this.createPathProxy(), this.buildPath(this.path, this.shape));
      for (var i = this.path, a = i.data, o = zr.CMD, s, u, l = n === "x", f = [], h = 0; h < a.length; ) {
        var c = a[h++], v = void 0, d = void 0, p = void 0, m = void 0, g = void 0, y = void 0, _ = void 0;
        switch (c) {
          case o.M:
            s = a[h++], u = a[h++];
            break;
          case o.L:
            if (v = a[h++], d = a[h++], _ = l ? (r - s) / (v - s) : (r - u) / (d - u), _ <= 1 && _ >= 0) {
              var S = l ? (d - u) * _ + u : (v - s) * _ + s;
              return l ? [r, S] : [S, r];
            }
            s = v, u = d;
            break;
          case o.C:
            v = a[h++], d = a[h++], p = a[h++], m = a[h++], g = a[h++], y = a[h++];
            var b = l ? Ls(s, v, p, g, r, f) : Ls(u, d, m, y, r, f);
            if (b > 0)
              for (var w = 0; w < b; w++) {
                var T = f[w];
                if (T <= 1 && T >= 0) {
                  var S = l ? Ge(u, d, m, y, T) : Ge(s, v, p, g, T);
                  return l ? [r, S] : [S, r];
                }
              }
            s = g, u = y;
            break;
        }
      }
    }, e;
  }(be)
), KI = (
  /** @class */
  function(t) {
    V(e, t);
    function e() {
      return t !== null && t.apply(this, arguments) || this;
    }
    return e;
  }(E1)
), QI = (
  /** @class */
  function(t) {
    V(e, t);
    function e(r) {
      var n = t.call(this, r) || this;
      return n.type = "ec-polygon", n;
    }
    return e.prototype.getDefaultShape = function() {
      return new KI();
    }, e.prototype.buildPath = function(r, n) {
      var i = n.points, a = n.stackedOnPoints, o = 0, s = i.length / 2, u = n.smoothMonotone;
      if (n.connectNulls) {
        for (; s > 0 && Dt(i[s * 2 - 2], i[s * 2 - 1]); s--)
          ;
        for (; o < s && Dt(i[o * 2], i[o * 2 + 1]); o++)
          ;
      }
      for (; o < s; ) {
        var l = Bh(r, i, o, s, s, 1, n.smooth, u, n.connectNulls);
        Bh(r, a, o + l - 1, l, s, -1, n.stackedOnSmooth, u, n.connectNulls), o += l + 1, r.closePath();
      }
    }, e;
  }(be)
);
function jI(t, e, r, n, i) {
  var a = t.getArea(), o = a.x, s = a.y, u = a.width, l = a.height, f = r.get(["lineStyle", "width"]) || 0;
  o -= f / 2, s -= f / 2, u += f, l += f, u = Math.ceil(u), o !== Math.floor(o) && (o = Math.floor(o), u++);
  var h = new Ce({
    shape: {
      x: o,
      y: s,
      width: u,
      height: l
    }
  });
  if (e) {
    var c = t.getBaseAxis(), v = c.isHorizontal(), d = c.inverse;
    v ? (d && (h.shape.x += u), h.shape.width = 0) : (d || (h.shape.y += l), h.shape.height = 0);
    var p = Q(i) ? function(m) {
      i(m, h);
    } : null;
    vo(h, {
      shape: {
        width: u,
        height: l,
        x: o,
        y: s
      }
    }, r, null, n, p);
  }
  return h;
}
function JI(t, e, r) {
  var n = t.getArea(), i = ue(n.r0, 1), a = ue(n.r, 1), o = new Ru({
    shape: {
      cx: ue(t.cx, 1),
      cy: ue(t.cy, 1),
      r0: i,
      r: a,
      startAngle: n.startAngle,
      endAngle: n.endAngle,
      clockwise: n.clockwise
    }
  });
  if (e) {
    var s = t.getBaseAxis().dim === "angle";
    s ? o.shape.endAngle = n.startAngle : o.shape.r = i, vo(o, {
      shape: {
        endAngle: n.endAngle,
        r: a
      }
    }, r);
  }
  return o;
}
function eO(t, e) {
  return t.type === e;
}
var Ug = {};
function tO(t, e) {
  if (process.env.NODE_ENV !== "production") {
    var r = t + "^_^" + e;
    Ug[r] || (console.warn('[ECharts] DEPRECATED: "' + t + '" has been deprecated. ' + e), Ug[r] = !0);
  }
}
function Wg(t, e) {
  if (t.length === e.length) {
    for (var r = 0; r < t.length; r++)
      if (t[r] !== e[r])
        return;
    return !0;
  }
}
function Yg(t) {
  for (var e = St(), r = St(), n = 0; n < t.length; ) {
    var i = t[n++], a = t[n++];
    Dt(i, a) || (ih(e, i), ih(r, a));
  }
  return [e, r];
}
function Xg(t, e) {
  var r = Yg(t), n = r[0], i = r[1], a = Yg(e), o = a[0], s = a[1];
  return Math.max(Math.abs(n[0] - o[0]), Math.abs(i[0] - s[0]), Math.abs(n[1] - o[1]), Math.abs(i[1] - s[1]));
}
function Zg(t) {
  return Te(t) ? t : t ? 0.5 : 0;
}
function rO(t, e, r) {
  if (r.valueDim == null)
    return [];
  for (var n = e.count(), i = di(n * 2), a = 0; a < n; a++) {
    var o = M1(r, t, e, a);
    i[a * 2] = o[0], i[a * 2 + 1] = o[1];
  }
  return i;
}
function Mr(t, e, r, n, i) {
  var a = r.getBaseAxis(), o = a.dim === "x" || a.dim === "radius" ? 0 : 1, s = [], u = 0, l = [], f = [], h = [], c = [];
  if (i) {
    for (u = 0; u < t.length; u += 2) {
      var v = e || t;
      Dt(v[u], v[u + 1]) || c.push(t[u], t[u + 1]);
    }
    t = c;
  }
  for (u = 0; u < t.length - 2; u += 2)
    switch (h[0] = t[u + 2], h[1] = t[u + 3], f[0] = t[u], f[1] = t[u + 1], s.push(f[0], f[1]), n) {
      case "end":
        l[o] = h[o], l[1 - o] = f[1 - o], s.push(l[0], l[1]);
        break;
      case "middle":
        var d = (f[o] + h[o]) / 2, p = [];
        l[o] = p[o] = d, l[1 - o] = f[1 - o], p[1 - o] = h[1 - o], s.push(l[0], l[1]), s.push(p[0], p[1]);
        break;
      default:
        l[o] = f[o], l[1 - o] = h[1 - o], s.push(l[0], l[1]);
    }
  return s.push(t[u++], t[u++]), s;
}
function nO(t, e) {
  var r = [], n = t.length, i, a;
  function o(f, h, c) {
    var v = f.coord, d = (c - v) / (h.coord - v), p = Rb(d, [f.color, h.color]);
    return {
      coord: c,
      color: p
    };
  }
  for (var s = 0; s < n; s++) {
    var u = t[s], l = u.coord;
    if (l < 0)
      i = u;
    else if (l > e) {
      a ? r.push(o(a, u, e)) : i && r.push(o(i, u, 0), o(i, u, e));
      break;
    } else
      i && (r.push(o(i, u, 0)), i = null), r.push(u), a = u;
  }
  return r;
}
function iO(t, e, r) {
  var n = t.getVisual("visualMeta");
  if (!(!n || !n.length || !t.count())) {
    if (e.type !== "cartesian2d") {
      process.env.NODE_ENV !== "production" && console.warn("Visual map on line style is only supported on cartesian2d.");
      return;
    }
    for (var i, a, o = n.length - 1; o >= 0; o--) {
      var s = t.getDimensionInfo(n[o].dimension);
      if (i = s && s.coordDim, i === "x" || i === "y") {
        a = n[o];
        break;
      }
    }
    if (!a) {
      process.env.NODE_ENV !== "production" && console.warn("Visual map on line style only support x or y dimension.");
      return;
    }
    var u = e.getAxis(i), l = X(a.stops, function(_) {
      return {
        coord: u.toGlobalCoord(u.dataToCoord(_.value)),
        color: _.color
      };
    }), f = l.length, h = a.outerColors.slice();
    f && l[0].coord > l[f - 1].coord && (l.reverse(), h.reverse());
    var c = nO(l, i === "x" ? r.getWidth() : r.getHeight()), v = c.length;
    if (!v && f)
      return l[0].coord < 0 ? h[1] ? h[1] : l[f - 1].color : h[0] ? h[0] : l[0].color;
    var d = 10, p = c[0].coord - d, m = c[v - 1].coord + d, g = m - p;
    if (g < 1e-3)
      return "transparent";
    x(c, function(_) {
      _.offset = (_.coord - p) / g;
    }), c.push({
      // NOTE: inRangeStopLen may still be 0 if stoplen is zero.
      offset: v ? c[v - 1].offset : 0.5,
      color: h[1] || "transparent"
    }), c.unshift({
      offset: v ? c[0].offset : 0.5,
      color: h[0] || "transparent"
    });
    var y = new p0(0, 0, 0, 0, c, !0);
    return y[i] = p, y[i + "2"] = m, y;
  }
}
function aO(t, e, r) {
  var n = t.get("showAllSymbol"), i = n === "auto";
  if (!(n && !i)) {
    var a = r.getAxesByScale("ordinal")[0];
    if (a && !(i && oO(a, e))) {
      var o = e.mapDimension(a.dim), s = {};
      return x(a.getViewLabels(), function(u) {
        u.tick.offInterval || (s[mo(a.scale, u.tick)] = 1);
      }), function(u) {
        return !s.hasOwnProperty(e.get(o, u));
      };
    }
  }
}
function oO(t, e) {
  var r = t.getExtent(), n = Math.abs(r[1] - r[0]) / t.scale.count();
  isNaN(n) && (n = 0);
  for (var i = e.count(), a = Math.max(1, Math.round(i / 5)), o = 0; o < i; o += a)
    if (vv.getSymbolSize(
      e,
      o
      // Only for cartesian, where `isHorizontal` exists.
    )[t.isHorizontal() ? 1 : 0] * 1.5 > n)
      return !1;
  return !0;
}
function sO(t) {
  for (var e = t.length / 2; e > 0 && Dt(t[e * 2 - 2], t[e * 2 - 1]); e--)
    ;
  return e - 1;
}
function $g(t, e) {
  return [t[e * 2], t[e * 2 + 1]];
}
function uO(t, e, r) {
  for (var n = t.length / 2, i = r === "x" ? 0 : 1, a, o, s = 0, u = -1, l = 0; l < n; l++)
    if (o = t[l * 2 + i], !Dt(o, t[l * 2 + 1 - i])) {
      if (l === 0) {
        a = o;
        continue;
      }
      if (a <= e && o >= e || a >= e && o <= e) {
        u = l;
        break;
      }
      s = l, a = o;
    }
  return {
    range: [s, u],
    t: (e - a) / (o - a)
  };
}
function A1(t) {
  if (t.get(["endLabel", "show"]))
    return !0;
  for (var e = 0; e < rr.length; e++)
    if (t.get([rr[e], "endLabel", "show"]))
      return !0;
  return !1;
}
function pf(t, e, r, n) {
  if (eO(e, "cartesian2d")) {
    var i = n.getModel("endLabel"), a = i.get("valueAnimation"), o = n.getData(), s = {
      lastFrameIndex: 0
    }, u = A1(n) ? function(v, d) {
      t._endLabelOnDuring(v, d, o, s, a, i, e);
    } : null, l = e.getBaseAxis().isHorizontal(), f = jI(e, r, n, function() {
      var v = t._endLabel;
      v && r && s.originalX != null && v.attr({
        x: s.originalX,
        y: s.originalY
      });
    }, u);
    if (!n.get("clip", !0)) {
      var h = f.shape, c = Math.max(h.width, h.height);
      l ? (h.y -= c, h.height += c * 2) : (h.x -= c, h.width += c * 2);
    }
    return u && u(1, f), f;
  } else
    return process.env.NODE_ENV !== "production" && n.get(["endLabel", "show"]) && console.warn("endLabel is not supported for lines in polar systems."), JI(e, r, n);
}
function lO(t, e) {
  var r = e.getBaseAxis(), n = r.isHorizontal(), i = r.inverse, a = n ? i ? "right" : "left" : "center", o = n ? "middle" : i ? "top" : "bottom";
  return {
    normal: {
      align: t.get("align") || a,
      verticalAlign: t.get("verticalAlign") || o
    }
  };
}
var fO = (
  /** @class */
  function(t) {
    V(e, t);
    function e() {
      return t !== null && t.apply(this, arguments) || this;
    }
    return e.prototype.init = function() {
      var r = new Re(), n = new UI();
      this.group.add(n.group), this._symbolDraw = n, this._lineGroup = r, this._changePolyState = te(this._changePolyState, this);
    }, e.prototype.render = function(r, n, i) {
      var a = r.coordinateSystem, o = this.group, s = r.getData(), u = r.getModel("lineStyle"), l = r.getModel("areaStyle"), f = s.getLayout("points") || [], h = a.type === "polar", c = this._coordSys, v = this._symbolDraw, d = this._polyline, p = this._polygon, m = this._lineGroup, g = !n.ssr && r.get("animation"), y = !l.isEmpty(), _ = l.get("origin"), S = D1(a, s, _), b = y && rO(a, s, S), w = r.get("showSymbol"), T = r.get("connectNulls"), M = w && !h && aO(r, s, a), D = this._data;
      D && D.eachItemGraphicEl(function(de, De) {
        de.__temp && (o.remove(de), D.setItemGraphicEl(De, null));
      }), w || v.remove(), o.add(m);
      var C = h ? !1 : r.get("step"), E;
      a && a.getArea && r.get("clip", !0) && (E = a.getArea(), E.width != null ? (E.x -= 0.1, E.y -= 0.1, E.width += 0.2, E.height += 0.2) : E.r0 && (E.r0 -= 0.5, E.r += 0.5)), this._clipShapeForSymbol = E;
      var I = iO(s, a, i) || s.getVisual("style")[s.getVisual("drawType")];
      if (!(d && c.type === a.type && C === this._step))
        w && v.updateData(s, {
          isIgnore: M,
          clipShape: E,
          disableAnimation: !0,
          getSymbolPoint: function(de) {
            return [f[de * 2], f[de * 2 + 1]];
          }
        }), g && this._initSymbolLabelAnimation(s, a, E), C && (b && (b = Mr(b, f, a, C, T)), f = Mr(f, null, a, C, T)), d = this._newPolyline(f), y ? p = this._newPolygon(f, b) : p && (m.remove(p), p = this._polygon = null), h || this._initOrUpdateEndLabel(r, a, kn(I)), m.setClipPath(pf(this, a, !0, r));
      else {
        y && !p ? p = this._newPolygon(f, b) : p && !y && (m.remove(p), p = this._polygon = null), h || this._initOrUpdateEndLabel(r, a, kn(I));
        var A = m.getClipPath();
        if (A) {
          var O = pf(this, a, !1, r);
          vo(A, {
            shape: O.shape
          }, r);
        } else
          m.setClipPath(pf(this, a, !0, r));
        w && v.updateData(s, {
          isIgnore: M,
          clipShape: E,
          disableAnimation: !0,
          getSymbolPoint: function(de) {
            return [f[de * 2], f[de * 2 + 1]];
          }
        }), (!Wg(this._stackedOnPoints, b) || !Wg(this._points, f)) && (g ? this._doUpdateAnimation(s, b, a, i, C, _, T) : (C && (b && (b = Mr(b, f, a, C, T)), f = Mr(f, null, a, C, T)), d.setShape({
          points: f
        }), p && p.setShape({
          points: f,
          stackedOnPoints: b
        })));
      }
      var P = r.getModel("emphasis"), L = P.get("focus"), B = P.get("blurScope"), U = P.get("disabled");
      if (d.useStyle(ge(
        // Use color in lineStyle first
        u.getLineStyle(),
        {
          fill: "none",
          stroke: I,
          lineJoin: "bevel"
        }
      )), Zd(d, r, "lineStyle"), d.style.lineWidth > 0 && r.get(["emphasis", "lineStyle", "width"]) === "bolder") {
        var Y = d.getState("emphasis").style;
        Y.lineWidth = +d.style.lineWidth + 1;
      }
      me(d).seriesIndex = r.seriesIndex, vh(d, L, B, U);
      var j = Zg(r.get("smooth")), K = r.get("smoothMonotone");
      if (d.setShape({
        smooth: j,
        smoothMonotone: K,
        connectNulls: T
      }), p) {
        var J = s.getCalculationInfo("stackedOnSeries"), $ = 0;
        p.useStyle(ge(l.getAreaStyle(), {
          fill: I,
          opacity: 0.7,
          lineJoin: "bevel",
          decal: s.getVisual("style").decal
        })), J && ($ = Zg(J.get("smooth"))), p.setShape({
          smooth: j,
          stackedOnSmooth: $,
          smoothMonotone: K,
          connectNulls: T
        }), Zd(p, r, "areaStyle"), me(p).seriesIndex = r.seriesIndex, vh(p, L, B, U);
      }
      var F = this._changePolyState;
      s.eachItemGraphicEl(function(de) {
        de && (de.onHoverStateChange = F);
      }), this._polyline.onHoverStateChange = F, this._data = s, this._coordSys = a, this._stackedOnPoints = b, this._points = f, this._step = C, this._valueOrigin = _;
      var ne = r.get("triggerEvent"), oe = r.get("triggerLineEvent");
      process.env.NODE_ENV !== "production" && oe && tO("triggerLineEvent", "Use the `triggerEvent` option instead.");
      var ze = oe === !0 || ne === !0 || ne === "line", Ue = oe === !0 || ne === !0 || ne === "area";
      this.packEventData(r, d, ze), p && this.packEventData(r, p, Ue);
    }, e.prototype.packEventData = function(r, n, i) {
      me(n).eventData = i ? {
        componentType: "series",
        componentSubType: "line",
        componentIndex: r.componentIndex,
        seriesIndex: r.seriesIndex,
        seriesName: r.name,
        seriesType: "line",
        // for determining this event is triggered by area or line
        selfType: n === this._polygon ? "area" : "line"
      } : null;
    }, e.prototype.highlight = function(r, n, i, a) {
      var o = r.getData(), s = Pn(o, a);
      if (this._changePolyState("emphasis"), !(s instanceof Array) && s != null && s >= 0) {
        var u = o.getLayout("points"), l = o.getItemGraphicEl(s);
        if (!l) {
          var f = u[s * 2], h = u[s * 2 + 1];
          if (Dt(f, h) || this._clipShapeForSymbol && !this._clipShapeForSymbol.contain(f, h))
            return;
          var c = r.get("zlevel") || 0, v = r.get("z") || 0;
          l = new vv(o, s), l.x = f, l.y = h, l.setZ(c, v);
          var d = l.getSymbolPath().getTextContent();
          d && (d.zlevel = c, d.z = v, d.z2 = this._polyline.z2 + 1), l.__temp = !0, o.setItemGraphicEl(s, l), l.stopSymbolAnimation(!0), this.group.add(l);
        }
        l.highlight();
      } else
        Jt.prototype.highlight.call(this, r, n, i, a);
    }, e.prototype.downplay = function(r, n, i, a) {
      var o = r.getData(), s = Pn(o, a);
      if (this._changePolyState("normal"), s != null && s >= 0) {
        var u = o.getItemGraphicEl(s);
        u && (u.__temp ? (o.setItemGraphicEl(s, null), this.group.remove(u)) : u.downplay());
      } else
        Jt.prototype.downplay.call(this, r, n, i, a);
    }, e.prototype._changePolyState = function(r) {
      var n = this._polygon;
      Gd(this._polyline, r), n && Gd(n, r);
    }, e.prototype._newPolyline = function(r) {
      var n = this._polyline;
      return n && this._lineGroup.remove(n), n = new qI({
        shape: {
          points: r
        },
        segmentIgnoreThreshold: 2,
        z2: 10
      }), this._lineGroup.add(n), this._polyline = n, n;
    }, e.prototype._newPolygon = function(r, n) {
      var i = this._polygon;
      return i && this._lineGroup.remove(i), i = new QI({
        shape: {
          points: r,
          stackedOnPoints: n
        },
        segmentIgnoreThreshold: 2
      }), this._lineGroup.add(i), this._polygon = i, i;
    }, e.prototype._initSymbolLabelAnimation = function(r, n, i) {
      var a, o, s = n.getBaseAxis(), u = s.inverse;
      n.type === "cartesian2d" ? (a = s.isHorizontal(), o = !1) : n.type === "polar" && (a = s.dim === "angle", o = !0);
      var l = r.hostModel, f = l.get("animationDuration");
      Q(f) && (f = f(null));
      var h = l.get("animationDelay") || 0, c = Q(h) ? h(null) : h;
      r.eachItemGraphicEl(function(v, d) {
        var p = v;
        if (p) {
          var m = [v.x, v.y], g = void 0, y = void 0, _ = void 0;
          if (i)
            if (o) {
              var S = i, b = n.pointToCoord(m);
              a ? (g = S.startAngle, y = S.endAngle, _ = -b[1] / 180 * Math.PI) : (g = S.r0, y = S.r, _ = b[0]);
            } else {
              var w = i;
              a ? (g = w.x, y = w.x + w.width, _ = v.x) : (g = w.y + w.height, y = w.y, _ = v.y);
            }
          var T = y === g ? 0 : (_ - g) / (y - g);
          u && (T = 1 - T);
          var M = Q(h) ? h(d) : f * T + c, D = p.getSymbolPath(), C = D.getTextContent();
          p.attr({
            scaleX: 0,
            scaleY: 0
          }), p.animateTo({
            scaleX: 1,
            scaleY: 1
          }, {
            duration: 200,
            setToFinal: !0,
            delay: M
          }), C && C.animateFrom({
            style: {
              opacity: 0
            }
          }, {
            duration: 300,
            delay: M
          }), D.disableLabelAnimation = !0;
        }
      });
    }, e.prototype._initOrUpdateEndLabel = function(r, n, i) {
      var a = r.getModel("endLabel");
      if (A1(r)) {
        var o = r.getData(), s = this._polyline, u = o.getLayout("points");
        if (!u) {
          s.removeTextContent(), this._endLabel = null;
          return;
        }
        var l = this._endLabel;
        l || (l = this._endLabel = new Je({
          z2: 200
          // should be higher than item symbol
        }), l.ignoreClip = !0, s.setTextContent(this._endLabel), s.disableLabelAnimation = !0);
        var f = sO(u);
        f >= 0 && (Pc(s, Nc(r, "endLabel"), {
          inheritColor: i,
          labelFetcher: r,
          labelDataIndex: f,
          defaultText: function(h, c, v) {
            return v != null ? HI(o, v) : C1(o, h);
          },
          enableTextSetter: !0
        }, lO(a, n)), s.textConfig.position = null);
      } else this._endLabel && (this._polyline.removeTextContent(), this._endLabel = null);
    }, e.prototype._endLabelOnDuring = function(r, n, i, a, o, s, u) {
      var l = this._endLabel, f = this._polyline;
      if (l) {
        r < 1 && a.originalX == null && (a.originalX = l.x, a.originalY = l.y);
        var h = i.getLayout("points"), c = i.hostModel, v = c.get("connectNulls"), d = s.get("precision"), p = s.get("distance") || 0, m = u.getBaseAxis(), g = m.isHorizontal(), y = m.inverse, _ = n.shape, S = y ? g ? _.x : _.y + _.height : g ? _.x + _.width : _.y, b = (g ? p : 0) * (y ? -1 : 1), w = (g ? 0 : -p) * (y ? -1 : 1), T = g ? "x" : "y", M = uO(h, S, T), D = M.range, C = D[1] - D[0], E = void 0;
        if (C >= 1) {
          if (C > 1 && !v) {
            var I = $g(h, D[0]);
            l.attr({
              x: I[0] + b,
              y: I[1] + w
            }), o && (E = c.getRawValue(D[0]));
          } else {
            var I = f.getPointOn(S, T);
            I && l.attr({
              x: I[0] + b,
              y: I[1] + w
            });
            var A = c.getRawValue(D[0]), O = c.getRawValue(D[1]);
            o && (E = Gw(i, d, A, O, M.t));
          }
          a.lastFrameIndex = D[0];
        } else {
          var P = r === 1 || a.lastFrameIndex > 0 ? D[0] : 0, I = $g(h, P);
          o && (E = c.getRawValue(P)), l.attr({
            x: I[0] + b,
            y: I[1] + w
          });
        }
        if (o) {
          var L = E0(l);
          typeof L.setLabelText == "function" && L.setLabelText(E);
        }
      }
    }, e.prototype._doUpdateAnimation = function(r, n, i, a, o, s, u) {
      var l = this._polyline, f = this._polygon, h = r.hostModel, c = $I(this._data, r, this._stackedOnPoints, n, this._coordSys, i, this._valueOrigin), v = c.current, d = c.stackedOnCurrent, p = c.next, m = c.stackedOnNext;
      if (o && (d = Mr(c.stackedOnCurrent, c.current, i, o, u), v = Mr(c.current, null, i, o, u), m = Mr(c.stackedOnNext, c.next, i, o, u), p = Mr(c.next, null, i, o, u)), Xg(v, p) > 3e3 || f && Xg(d, m) > 3e3) {
        l.stopAnimation(), l.setShape({
          points: p
        }), f && (f.stopAnimation(), f.setShape({
          points: p,
          stackedOnPoints: m
        }));
        return;
      }
      l.shape.__points = c.current, l.shape.points = v;
      var g = {
        shape: {
          points: p
        }
      };
      c.current !== v && (g.shape.__points = c.next), l.stopAnimation(), Gr(l, g, h), f && (f.setShape({
        // Reuse the points with polyline.
        points: v,
        stackedOnPoints: d
      }), f.stopAnimation(), Gr(f, {
        shape: {
          stackedOnPoints: m
        }
      }, h), l.shape.points !== f.shape.points && (f.shape.points = l.shape.points));
      for (var y = [], _ = c.status, S = 0; S < _.length; S++) {
        var b = _[S].cmd;
        if (b === "=") {
          var w = r.getItemGraphicEl(_[S].idx1);
          w && y.push({
            el: w,
            ptIdx: S
            // Index of points
          });
        }
      }
      l.animators && l.animators.length && l.animators[0].during(function() {
        f && f.dirtyShape();
        for (var T = l.shape.__points, M = 0; M < y.length; M++) {
          var D = y[M].el, C = y[M].ptIdx * 2;
          D.x = T[C], D.y = T[C + 1], D.markRedraw();
        }
      });
    }, e.prototype.remove = function(r) {
      var n = this.group, i = this._data;
      this._lineGroup.removeAll(), this._symbolDraw.remove(!0), i && i.eachItemGraphicEl(function(a, o) {
        a.__temp && (n.remove(a), i.setItemGraphicEl(o, null));
      }), this._polyline = this._polygon = this._coordSys = this._points = this._stackedOnPoints = this._endLabel = this._data = null;
    }, e.type = "line", e;
  }(Jt)
);
function hO(t, e) {
  return {
    seriesType: t,
    plan: p_(),
    reset: function(r) {
      var n = r.getData(), i = r.coordinateSystem;
      if (r.pipelineContext, !!i) {
        var a = X(i.dimensions, function(h) {
          return n.mapDimension(h);
        }).slice(0, 2), o = a.length, s = n.getCalculationInfo("stackResultDimension");
        Ka(n, a[0]) && (a[0] = s), Ka(n, a[1]) && (a[1] = s);
        var u = n.getStore(), l = n.getDimensionIndex(a[0]), f = n.getDimensionIndex(a[1]);
        return o && {
          progress: function(h, c) {
            for (var v = h.end - h.start, d = di(v * o), p = [], m = [], g = h.start, y = 0; g < h.end; g++) {
              var _ = void 0;
              if (o === 1) {
                var S = u.get(l, g);
                _ = i.dataToPoint(S, null, m);
              } else
                p[0] = u.get(l, g), p[1] = u.get(f, g), _ = i.dataToPoint(p, null, m);
              d[y++] = _[0], d[y++] = _[1];
            }
            c.setLayout("points", d), c.setLayout("pointsRange", {
              start: h.start,
              end: h.end
            });
          }
        };
      }
    }
  };
}
var cO = {
  average: function(t) {
    for (var e = 0, r = 0, n = 0; n < t.length; n++)
      isNaN(t[n]) || (e += t[n], r++);
    return r === 0 ? NaN : e / r;
  },
  sum: function(t) {
    for (var e = 0, r = 0; r < t.length; r++)
      e += t[r] || 0;
    return e;
  },
  max: function(t) {
    for (var e = -1 / 0, r = 0; r < t.length; r++)
      t[r] > e && (e = t[r]);
    return isFinite(e) ? e : NaN;
  },
  min: function(t) {
    for (var e = 1 / 0, r = 0; r < t.length; r++)
      t[r] < e && (e = t[r]);
    return isFinite(e) ? e : NaN;
  },
  // TODO
  // Median
  nearest: function(t) {
    return t[0];
  }
}, vO = function(t) {
  return Math.round(t.length / 2);
};
function dO(t) {
  return {
    seriesType: t,
    // FIXME:TS never used, so comment it
    // modifyOutputEnd: true,
    reset: function(e, r, n) {
      var i = e.getData(), a = e.get("sampling"), o = e.coordinateSystem, s = i.count();
      if (s > 10 && o.type === "cartesian2d" && a) {
        var u = o.getBaseAxis(), l = o.getOtherAxis(u), f = u.getExtent(), h = n.getDevicePixelRatio(), c = Math.abs(f[1] - f[0]) * (h || 1), v = Math.round(s / c);
        if (isFinite(v) && v > 1) {
          a === "lttb" ? e.setData(i.lttbDownSample(i.mapDimension(l.dim), 1 / v)) : a === "minmax" && e.setData(i.minmaxDownSample(i.mapDimension(l.dim), 1 / v));
          var d = void 0;
          z(a) ? d = cO[a] : Q(a) && (d = a), d && e.setData(i.downSample(i.mapDimension(l.dim), 1 / v, d, vO));
        }
      }
    }
  };
}
function pO(t) {
  t.registerChartView(fO), t.registerSeriesModel(zI), t.registerLayout(hO("line")), t.registerVisual({
    seriesType: "line",
    reset: function(e) {
      var r = e.getData(), n = e.getModel("lineStyle").getLineStyle();
      n && !n.stroke && (n.stroke = r.getVisual("style").fill), r.setVisual("legendLineStyle", n);
    }
  }), t.registerProcessor(t.PRIORITY.PROCESSOR.STATISTIC, dO("line"));
}
var gO = (
  /** @class */
  function(t) {
    V(e, t);
    function e(r, n, i, a, o) {
      var s = t.call(this, r, n, i) || this;
      return s.index = 0, s.type = a || "value", s.position = o || "bottom", s;
    }
    return e.prototype.isHorizontal = function() {
      var r = this.position;
      return r === "top" || r === "bottom";
    }, e.prototype.getGlobalExtent = function(r) {
      var n = this.getExtent();
      return n[0] = this.toGlobalCoord(n[0]), n[1] = this.toGlobalCoord(n[1]), r && n[0] > n[1] && n.reverse(), n;
    }, e.prototype.pointToData = function(r, n) {
      return this.coordToData(this.toLocalCoord(r[this.dim === "x" ? 0 : 1]), n);
    }, e.prototype.setCategorySortInfo = function(r) {
      if (this.type !== "category")
        return !1;
      this.model.option.categorySortInfo = r, this.scale.setSortInfo(r);
    }, e;
  }(PI)
), mO = null;
function yO() {
  return mO;
}
var _O = "expandAxisBreak", Pr = Math.PI, SO = [[1, 2, 1, 2], [5, 3, 5, 3], [8, 3, 8, 3]], bO = [[0, 1, 0, 1], [0, 3, 0, 3], [0, 3, 0, 3]], Ni = ve(), I1 = ve(), O1 = (
  /** @class */
  function() {
    function t(e) {
      this.recordMap = {}, this.resolveAxisNameOverlap = e;
    }
    return t.prototype.ensureRecord = function(e) {
      var r = e.axis.dim, n = e.componentIndex, i = this.recordMap, a = i[r] || (i[r] = []);
      return a[n] || (a[n] = {
        ready: {}
      });
    }, t;
  }()
);
function wO(t, e, r, n) {
  var i = r.axis, a = e.ensureRecord(r), o = [], s, u = dv(t.axisName) && Pi(t.nameLocation);
  x(n, function(d) {
    var p = Xr(d);
    if (!(!p || p.label.ignore)) {
      o.push(p);
      var m = a.transGroup;
      u && (m.transform ? ao(oa, m.transform) : io(oa), p.transform && xa(oa, oa, p.transform), ie.copy(os, p.localRect), os.applyTransform(oa), s ? s.union(os) : ie.copy(s = new ie(0, 0, 0, 0), os));
    }
  });
  var l = Math.abs(a.dirVec.x) > 0.1 ? "x" : "y", f = a.transGroup[l];
  if (o.sort(function(d, p) {
    return Math.abs(d.label[l] - f) - Math.abs(p.label[l] - f);
  }), u && s) {
    var h = i.getExtent(), c = Math.min(h[0], h[1]), v = Math.max(h[0], h[1]) - c;
    s.union(new ie(c, 0, v, 1));
  }
  a.stOccupiedRect = s, a.labelInfoList = o;
}
var oa = $t(), os = new ie(0, 0, 0, 0), L1 = function(t, e, r, n, i, a) {
  if (Pi(t.nameLocation)) {
    var o = a.stOccupiedRect;
    o && P1(BI({}, o, a.transGroup.transform), n, i);
  } else
    N1(a.labelInfoList, a.dirVec, n, i);
};
function P1(t, e, r) {
  var n = new _e();
  cv(t, e, n, {
    direction: Math.atan2(r.y, r.x),
    bidirectional: !1,
    touchThreshold: 0.05
  }) && VI(e, n);
}
function N1(t, e, r, n) {
  for (var i = _e.dot(n, e) >= 0, a = 0, o = t.length; a < o; a++) {
    var s = t[i ? a : o - 1 - a];
    s.label.ignore || P1(s, r, n);
  }
}
var Fr = (
  /** @class */
  function() {
    function t(e, r, n, i) {
      this.group = new Re(), this._axisModel = e, this._api = r, this._local = {}, this._shared = i || new O1(L1), this._resetCfgDetermined(n);
    }
    return t.prototype.updateCfg = function(e) {
      if (process.env.NODE_ENV !== "production") {
        var r = this._shared.ensureRecord(this._axisModel).ready;
        N(!r.axisLine && !r.axisTickLabelDetermine), r.axisName = r.axisTickLabelEstimate = !1;
      }
      var n = this._cfg.raw;
      n.position = e.position, n.labelOffset = e.labelOffset, this._resetCfgDetermined(n);
    }, t.prototype.__getRawCfg = function() {
      return this._cfg.raw;
    }, t.prototype._resetCfgDetermined = function(e) {
      var r = this._axisModel, n = r.getDefaultOption ? r.getDefaultOption() : {}, i = W(e.axisName, r.get("name")), a = r.get("nameMoveOverlap");
      (a == null || a === "auto") && (a = W(e.defaultNameMoveOverlap, !0));
      var o = {
        raw: e,
        position: e.position,
        rotation: e.rotation,
        nameDirection: W(e.nameDirection, 1),
        tickDirection: W(e.tickDirection, 1),
        labelDirection: W(e.labelDirection, 1),
        labelOffset: W(e.labelOffset, 0),
        silent: W(e.silent, !0),
        axisName: i,
        nameLocation: Rr(r.get("nameLocation"), n.nameLocation, "end"),
        shouldNameMoveOverlap: dv(i) && a,
        optionHideOverlap: r.get(["axisLabel", "hideOverlap"]),
        showMinorTicks: r.get(["minorTick", "show"])
      };
      process.env.NODE_ENV !== "production" && (N(o.position != null), N(o.rotation != null)), this._cfg = o;
      var s = new Re({
        x: o.position[0],
        y: o.position[1],
        rotation: o.rotation
      });
      s.updateTransform(), this._transformGroup = s;
      var u = this._shared.ensureRecord(r);
      u.transGroup = this._transformGroup, u.dirVec = new _e(Math.cos(-o.rotation), Math.sin(-o.rotation));
    }, t.prototype.build = function(e, r) {
      var n = this;
      return e || (e = {
        axisLine: !0,
        axisTickLabelEstimate: !1,
        axisTickLabelDetermine: !0,
        axisName: !0
      }), x(TO, function(i) {
        e[i] && xO[i](n._cfg, n._local, n._shared, n._axisModel, n.group, n._transformGroup, n._api, r || {});
      }), this;
    }, t.innerTextLayout = function(e, r, n) {
      var i = Dy(r - e), a, o;
      return Bs(i) ? (o = n > 0 ? "top" : "bottom", a = "center") : Bs(i - Pr) ? (o = n > 0 ? "bottom" : "top", a = "center") : (o = "middle", i > 0 && i < Pr ? a = n > 0 ? "right" : "left" : a = n > 0 ? "left" : "right"), {
        rotation: i,
        textAlign: a,
        textVerticalAlign: o
      };
    }, t.makeAxisEventDataBase = function(e) {
      var r = {
        componentType: e.mainType,
        componentIndex: e.componentIndex
      };
      return r[e.mainType + "Index"] = e.componentIndex, r;
    }, t.isLabelSilent = function(e) {
      var r = e.get("tooltip");
      return e.get("silent") || !(e.get("triggerEvent") || r && r.show);
    }, t;
  }()
), TO = ["axisLine", "axisTickLabelEstimate", "axisTickLabelDetermine", "axisName"], xO = {
  axisLine: function(t, e, r, n, i, a, o) {
    if (process.env.NODE_ENV !== "production") {
      var s = r.ensureRecord(n).ready;
      N(!s.axisLine), s.axisLine = !0;
    }
    var u = n.get(["axisLine", "show"]);
    if (u === "auto" && (u = !0, t.raw.axisLineAutoShow != null && (u = !!t.raw.axisLineAutoShow)), !!u) {
      var l = n.axis.getExtent(), f = a.transform, h = [l[0], 0], c = [l[1], 0], v = h[0] > c[0];
      f && (Ct(h, h, f), Ct(c, c, f));
      var d = R({
        lineCap: "round"
      }, n.getModel(["axisLine", "lineStyle"]).getLineStyle()), p = {
        strokeContainThreshold: t.raw.strokeContainThreshold || 5,
        silent: !0,
        z2: 1,
        style: d
      };
      if (n.get(["axisLine", "breakLine"]) && Rn(n.axis.scale))
        yO().buildAxisBreakLine(n, i, a, p);
      else {
        var m = new Hr(R({
          shape: {
            x1: h[0],
            y1: h[1],
            x2: c[0],
            y2: c[1]
          }
        }, p));
        Ga(m.shape, m.style.lineWidth), m.anid = "line", i.add(m);
      }
      var g = n.get(["axisLine", "symbol"]);
      if (g != null) {
        var y = n.get(["axisLine", "symbolSize"]);
        z(g) && (g = [g, g]), (z(y) || Te(y)) && (y = [y, y]);
        var _ = C_(n.get(["axisLine", "symbolOffset"]) || 0, y), S = y[0], b = y[1];
        x([{
          rotate: t.rotation + Math.PI / 2,
          offset: _[0],
          r: 0
        }, {
          rotate: t.rotation - Math.PI / 2,
          offset: _[1],
          r: Math.sqrt((h[0] - c[0]) * (h[0] - c[0]) + (h[1] - c[1]) * (h[1] - c[1]))
        }], function(w, T) {
          if (g[T] !== "none" && g[T] != null) {
            var M = Yr(g[T], -S / 2, -b / 2, S, b, d.stroke, !0), D = w.r + w.offset, C = v ? c : h;
            M.attr({
              rotation: w.rotate,
              x: C[0] + D * Math.cos(t.rotation),
              y: C[1] - D * Math.sin(t.rotation),
              silent: !0,
              z2: 11
            }), i.add(M);
          }
        });
      }
    }
  },
  /**
   * [CAUTION] This method can be called multiple times, following the change due to `resetCfg` called
   *  in size measurement. Thus this method should be idempotent, and should be performant.
   */
  axisTickLabelEstimate: function(t, e, r, n, i, a, o, s) {
    if (process.env.NODE_ENV !== "production") {
      var u = r.ensureRecord(n).ready;
      N(!u.axisTickLabelDetermine), u.axisTickLabelEstimate = !0;
    }
    var l = Kg(e, i, s);
    l && qg(t, e, r, n, i, a, o, Nt.estimate);
  },
  /**
   * Finish axis tick label build.
   * Can be only called once.
   */
  axisTickLabelDetermine: function(t, e, r, n, i, a, o, s) {
    if (process.env.NODE_ENV !== "production") {
      var u = r.ensureRecord(n).ready;
      u.axisTickLabelDetermine = !0;
    }
    var l = Kg(e, i, s);
    l && qg(t, e, r, n, i, a, o, Nt.determine);
    var f = EO(t, i, a, n);
    MO(t, e.labelLayoutList, f), AO(t, i, a, n, t.tickDirection);
  },
  /**
   * [CAUTION] This method can be called multiple times, following the change due to `resetCfg` called
   *  in size measurement. Thus this method should be idempotent, and should be performant.
   */
  axisName: function(t, e, r, n, i, a, o, s) {
    var u = r.ensureRecord(n);
    if (process.env.NODE_ENV !== "production") {
      var l = u.ready;
      N(l.axisTickLabelEstimate || l.axisTickLabelDetermine), l.axisName = !0;
    }
    e.nameEl && (i.remove(e.nameEl), e.nameEl = u.nameLayout = u.nameLocation = null);
    var f = t.axisName;
    if (dv(f)) {
      var h = t.nameLocation, c = t.nameDirection, v = n.getModel("nameTextStyle"), d = n.get("nameGap") || 0, p = n.axis.getExtent(), m = n.axis.inverse ? -1 : 1, g = new _e(0, 0), y = new _e(0, 0);
      h === "start" ? (g.x = p[0] - m * d, y.x = -m) : h === "end" ? (g.x = p[1] + m * d, y.x = m) : (g.x = (p[0] + p[1]) / 2, g.y = t.labelOffset + c * d, y.y = c);
      var _ = $t();
      y.transform(ic(_, _, t.rotation));
      var S = n.get("nameRotate");
      S != null && (S = S * Pr / 180);
      var b, w;
      Pi(h) ? b = Fr.innerTextLayout(
        t.rotation,
        S ?? t.rotation,
        // Adapt to axis.
        c
      ) : (b = CO(t.rotation, h, S || 0, p), w = t.raw.axisNameAvailableWidth, w != null && (w = Math.abs(w / Math.sin(b.rotation)), !isFinite(w) && (w = null)));
      var T = v.getFont(), M = n.get("nameTruncate", !0) || {}, D = M.ellipsis, C = wi(t.raw.nameTruncateMaxWidth, M.maxWidth, w), E = s.nameMarginLevel || 0, I = new Je({
        x: g.x,
        y: g.y,
        rotation: b.rotation,
        silent: Fr.isLabelSilent(n),
        style: Nn(v, {
          text: f,
          font: T,
          overflow: "truncate",
          width: C,
          ellipsis: D,
          fill: v.getTextColor() || n.get(["axisLine", "lineStyle", "color"]),
          align: v.get("align") || b.textAlign,
          verticalAlign: v.get("verticalAlign") || b.textVerticalAlign
        }),
        z2: 1
      });
      if (Fu({
        el: I,
        componentModel: n,
        itemName: f
      }), I.__fullText = f, I.anid = "name", n.get("triggerEvent")) {
        var A = Fr.makeAxisEventDataBase(n);
        A.targetType = "axisName", A.name = f, me(I).eventData = A;
      }
      a.add(I), I.updateTransform(), e.nameEl = I;
      var O = u.nameLayout = Xr({
        label: I,
        priority: I.z2,
        defaultAttr: {
          ignore: I.ignore
        },
        marginDefault: Pi(h) ? SO[E] : bO[E]
      });
      if (u.nameLocation = h, i.add(I), I.decomposeTransform(), t.shouldNameMoveOverlap && O) {
        var P = r.ensureRecord(n);
        process.env.NODE_ENV !== "production" && N(P.labelInfoList), r.resolveAxisNameOverlap(t, r, n, O, y, P);
      }
    }
  }
};
function qg(t, e, r, n, i, a, o, s) {
  k1(e) || IO(t, e, i, s, n, o);
  var u = e.labelLayoutList;
  OO(t, n, u, a), t.rotation;
  var l = t.optionHideOverlap;
  DO(n, u, l), l && FI(
    // Filter the already ignored labels by the previous overlap resolving methods.
    He(u, function(f) {
      return f && !f.label.ignore;
    })
  ), wO(t, r, n, u);
}
function CO(t, e, r, n) {
  var i = Dy(r - t), a, o, s = n[0] > n[1], u = e === "start" && !s || e !== "start" && s;
  return Bs(i - Pr / 2) ? (o = u ? "bottom" : "top", a = "center") : Bs(i - Pr * 1.5) ? (o = u ? "top" : "bottom", a = "center") : (o = "middle", i < Pr * 1.5 && i > Pr / 2 ? a = u ? "left" : "right" : a = u ? "right" : "left"), {
    rotation: i,
    textAlign: a,
    textVerticalAlign: o
  };
}
function DO(t, e, r) {
  var n = t.axis, i = t.get(["axisLabel", "customValues"]);
  if (ZA(n))
    return;
  function a(l, f, h) {
    var c = Xr(e[f]), v = Xr(e[h]), d = n.scale;
    if (!(!c || !v)) {
      if (l == null) {
        if (!r && i)
          return;
        var p = Ni(c.label).labelInfo.tick;
        if (
          // TimeScale does not expand extent to "nice", so eliminate labels that are not nice.
          go(d) && p.notNice || Mt(d) && p.offInterval
        ) {
          oi(c.label);
          return;
        }
      }
      if (l === !1 || c.suggestIgnore) {
        oi(c.label);
        return;
      }
      if (v.suggestIgnore) {
        oi(v.label);
        return;
      }
      var m = 0.1;
      if (!r) {
        var g = [0, 0, 0, 0];
        c = Vg({
          marginForce: g
        }, c), v = Vg({
          marginForce: g
        }, v);
      }
      cv(c, v, null, {
        touchThreshold: m
      }) && oi(l ? v.label : c.label);
    }
  }
  var o = t.get(["axisLabel", "showMinLabel"]), s = t.get(["axisLabel", "showMaxLabel"]), u = e.length;
  a(o, 0, 1), a(s, u - 1, u - 2);
}
function MO(t, e, r) {
  t.showMinorTicks || x(e, function(n) {
    if (n && n.label.ignore)
      for (var i = 0; i < r.length; i++) {
        var a = r[i], o = I1(a), s = Ni(n.label);
        if (o.tickValue != null && !o.onBand && o.tickValue === s.labelInfo.tick.value) {
          oi(a);
          return;
        }
      }
  });
}
function oi(t) {
  t && (t.ignore = !0);
}
function R1(t, e, r, n, i) {
  for (var a = [], o = [], s = [], u = 0; u < t.length; u++) {
    var l = t[u].coord;
    o[0] = l, o[1] = 0, s[0] = l, s[1] = r, e && (Ct(o, o, e), Ct(s, s, e));
    var f = new Hr({
      shape: {
        x1: o[0],
        y1: o[1],
        x2: s[0],
        y2: s[1]
      },
      style: n,
      z2: 2,
      autoBatch: !0,
      silent: !0
    });
    Ga(f.shape, f.style.lineWidth), f.anid = i + "_" + t[u].tickValue, a.push(f);
    var h = I1(f);
    h.onBand = !!t[u].onBand, h.tickValue = t[u].tickValue;
  }
  return a;
}
function EO(t, e, r, n) {
  var i = n.axis, a = n.getModel("axisTick"), o = a.get("show");
  if (o === "auto" && (o = !0, t.raw.axisTickAutoShow != null && (o = !!t.raw.axisTickAutoShow)), !o || i.scale.isBlank())
    return [];
  for (var s = a.getModel("lineStyle"), u = t.tickDirection * a.get("length"), l = i.getTicksCoords(), f = R1(l, r.transform, u, ge(s.getLineStyle(), {
    stroke: n.get(["axisLine", "lineStyle", "color"])
  }), "ticks"), h = 0; h < f.length; h++)
    e.add(f[h]);
  return f;
}
function AO(t, e, r, n, i) {
  var a = n.axis, o = n.getModel("minorTick");
  if (!(!t.showMinorTicks || a.scale.isBlank())) {
    var s = a.getMinorTicksCoords();
    if (s.length)
      for (var u = o.getModel("lineStyle"), l = i * o.get("length"), f = ge(u.getLineStyle(), ge(n.getModel("axisTick").getLineStyle(), {
        stroke: n.get(["axisLine", "lineStyle", "color"])
      })), h = 0; h < s.length; h++)
        for (var c = R1(s[h], r.transform, l, f, "minorticks_" + h), v = 0; v < c.length; v++)
          e.add(c[v]);
  }
}
function Kg(t, e, r) {
  if (k1(t)) {
    var n = t.axisLabelsCreationContext;
    process.env.NODE_ENV !== "production" && N(t.labelGroup && n);
    var i = n.out.noPxChangeTryDetermine;
    if (r.noPxChange) {
      for (var a = !0, o = 0; o < i.length; o++)
        a = a && i[o]();
      if (a)
        return !1;
    }
    i.length && (e.remove(t.labelGroup), Vh(t, null, null, null));
  }
  return !0;
}
function IO(t, e, r, n, i, a) {
  var o = i.axis, s = wi(t.raw.axisLabelShow, i.get(["axisLabel", "show"])), u = new Re();
  r.add(u);
  var l = cu(n);
  if (!s || o.scale.isBlank()) {
    Vh(e, [], u, l);
    return;
  }
  var f = i.getModel("axisLabel"), h = o.getViewLabels(l), c = (wi(t.raw.labelRotate, f.get("rotate")) || 0) * Pr / 180, v = Fr.innerTextLayout(t.rotation, c, t.labelDirection), d = i.getCategories && i.getCategories(!0), p = [], m = i.get("triggerEvent"), g = 1 / 0, y = -1 / 0;
  x(h, function(S, b) {
    var w, T = S.tick, M = S.formattedLabel, D = S.rawLabel, C = f, E = mo(o.scale, T);
    if (d && d[E]) {
      var I = d[E];
      q(I) && I.textStyle && (C = new xe(I.textStyle, f, i.ecModel));
    }
    var A = C.getTextColor() || i.get(["axisLine", "lineStyle", "color"]), O = C.getShallow("align", !0) || v.textAlign, P = W(C.getShallow("alignMinLabel", !0), O), L = W(C.getShallow("alignMaxLabel", !0), O), B = C.getShallow("verticalAlign", !0) || C.getShallow("baseline", !0) || v.textVerticalAlign, U = W(C.getShallow("verticalAlignMinLabel", !0), B), Y = W(C.getShallow("verticalAlignMaxLabel", !0), B), j = 10 + (((w = T.time) === null || w === void 0 ? void 0 : w.level) || 0);
    g = Math.min(g, j), y = Math.max(y, j);
    var K = new Je({
      // --- transform props start ---
      // All of the transform props MUST not be set here, but should be set in
      // `updateAxisLabelChangableProps`, because they may change in estimation,
      // and need to calculate based on global coord sys by `decomposeTransform`.
      x: 0,
      y: 0,
      rotation: 0,
      // --- transform props end ---
      silent: Fr.isLabelSilent(i),
      z2: j,
      style: Nn(C, {
        text: M,
        align: b === 0 ? P : b === h.length - 1 ? L : O,
        verticalAlign: b === 0 ? U : b === h.length - 1 ? Y : B,
        fill: Q(A) ? A(
          // (1) In category axis with data zoom, tick is not the original
          // index of axis.data. So tick should not be exposed to user
          // in category axis.
          // (2) Compatible with previous version, which always use formatted label as
          // input. But in interval scale the formatted label is like '223,445', which
          // maked user replace ','. So we modify it to return original val but remain
          // it as 'string' to avoid error in replacing.
          o.type === "category" ? D : o.type === "value" ? E + "" : E,
          b
        ) : A
      })
    });
    K.anid = "label_" + E;
    var J = Ni(K);
    if (J.labelInfo = S, J.layoutRotation = v.rotation, Fu({
      el: K,
      componentModel: i,
      itemName: M,
      formatterParamsExtra: {
        isTruncated: function() {
          return K.isTruncated;
        },
        value: D,
        tickIndex: b
      }
    }), m) {
      var $ = Fr.makeAxisEventDataBase(i);
      $.targetType = "axisLabel", $.value = D, $.tickIndex = b;
      var F = S.tick.break;
      if (F) {
        var ne = F.parsedBreak;
        $.break = {
          // type: labelItem.break.type,
          start: ne.vmin,
          end: ne.vmax
        };
      }
      o.type === "category" && ($.dataIndex = E), me(K).eventData = $, F && PO(i, a, K, F);
    }
    p.push(K), u.add(K);
  });
  var _ = X(p, function(S) {
    return {
      label: S,
      priority: Ni(S).labelInfo.tick.break ? S.z2 + (y - g + 1) : S.z2,
      defaultAttr: {
        ignore: S.ignore
      }
    };
  });
  Vh(e, _, u, l);
}
function k1(t) {
  return !!t.labelLayoutList;
}
function Vh(t, e, r, n) {
  t.labelLayoutList = e, t.labelGroup = r, t.axisLabelsCreationContext = n;
}
function OO(t, e, r, n) {
  var i = e.get(["axisLabel", "margin"]);
  x(r, function(a, o) {
    var s = Xr(a);
    if (s) {
      var u = s.label, l = Ni(u);
      s.suggestIgnore = u.ignore, u.ignore = !1, Ba(hr, LO);
      var f = e.axis;
      hr.x = f.dataToCoord(mo(f.scale, l.labelInfo.tick)), hr.y = t.labelOffset + t.labelDirection * i, hr.rotation = l.layoutRotation, n.add(hr), hr.updateTransform(), n.remove(hr), hr.decomposeTransform(), Ba(u, hr), u.markRedraw(), pu(s, !0), Xr(s);
    }
  });
}
var hr = new Ce(), LO = new Ce();
function dv(t) {
  return !!t;
}
function PO(t, e, r, n) {
  r.on("click", function(i) {
    var a = {
      type: _O,
      breaks: [{
        start: n.parsedBreak.breakOption.start,
        end: n.parsedBreak.breakOption.end
      }]
    };
    a[t.axis.dim + "AxisIndex"] = t.componentIndex, e.dispatchAction(a);
  });
}
function gu(t, e, r) {
  r = r || {};
  var n = e.axis, i = {}, a = n.getAxesOnZeroOf()[0], o = n.position, s = a ? "onZero" : o, u = n.dim, l = [t.x, t.x + t.width, t.y, t.y + t.height], f = {
    left: 0,
    right: 1,
    top: 0,
    bottom: 1,
    onZero: 2
  }, h = e.get("offset") || 0, c = u === "x" ? [l[2] - h, l[3] + h] : [l[0] - h, l[1] + h];
  if (a) {
    var v = a.toGlobalCoord(a.dataToCoord(0));
    c[f.onZero] = Math.max(Math.min(v, c[1]), c[0]);
  }
  i.position = [u === "y" ? c[f[s]] : l[0], u === "x" ? c[f[s]] : l[3]], i.rotation = Math.PI / 2 * (u === "x" ? 0 : 1);
  var d = {
    top: -1,
    bottom: 1,
    left: -1,
    right: 1
  };
  i.labelDirection = i.tickDirection = i.nameDirection = d[o], i.labelOffset = a ? c[f[o]] - c[f.onZero] : 0, e.get(["axisTick", "inside"]) && (i.tickDirection = -i.tickDirection), wi(r.labelInside, e.get(["axisLabel", "inside"])) && (i.labelDirection = -i.labelDirection);
  var p = e.get(["axisLabel", "rotate"]);
  return i.labelRotate = s === "top" ? -p : p, i.z2 = 1, i;
}
function NO(t) {
  var e = {
    xAxisModel: null,
    yAxisModel: null
  };
  return x(e, function(r, n) {
    var i = n.replace(/Model$/, ""), a = t.getReferringComponents(i, qe).models[0];
    if (process.env.NODE_ENV !== "production" && !a)
      throw new Error(i + ' "' + Rr(t.get(i + "Index"), t.get(i + "Id"), 0) + '" not found');
    e[n] = a;
  }), e;
}
function RO(t, e, r, n, i, a) {
  for (var o = gu(t, r), s = !1, u = !1, l = 0; l < e.length; l++)
    J_(e[l].getOtherAxis(r.axis).scale) && (s = u = !0, r.axis.type === "category" && r.axis.onBand && (u = !1));
  return o.axisLineAutoShow = s, o.axisTickAutoShow = u, o.defaultNameMoveOverlap = a, new Fr(r, n, o, i);
}
function kO(t, e, r) {
  var n = gu(e, r);
  if (process.env.NODE_ENV !== "production") {
    var i = t.__getRawCfg();
    x(le(n), function(a) {
      a !== "position" && a !== "labelOffset" && N(n[a] === i[a]);
    });
  }
  t.updateCfg(n);
}
var B1 = {
  left: 0,
  right: 0,
  top: 0,
  bottom: 0
}, mu = ["25%", "25%"], Cs = "cartesian2d", BO = (
  /** @class */
  function(t) {
    V(e, t);
    function e() {
      return t !== null && t.apply(this, arguments) || this;
    }
    return e.prototype.mergeDefaultAndTheme = function(r, n) {
      var i = Hi(r.outerBounds);
      t.prototype.mergeDefaultAndTheme.apply(this, arguments), i && r.outerBounds && Ur(r.outerBounds, i);
    }, e.prototype.mergeOption = function(r, n) {
      t.prototype.mergeOption.apply(this, arguments), this.option.outerBounds && r.outerBounds && Ur(this.option.outerBounds, r.outerBounds);
    }, e.type = "grid", e.dependencies = ["xAxis", "yAxis"], e.layoutMode = "box", e.defaultOption = {
      show: !1,
      // zlevel: 0,
      z: 0,
      left: "15%",
      top: 65,
      right: "10%",
      bottom: 80,
      // If grid size contain label
      containLabel: !1,
      outerBoundsMode: "auto",
      outerBounds: B1,
      outerBoundsContain: "all",
      outerBoundsClampWidth: mu[0],
      outerBoundsClampHeight: mu[1],
      // width: {totalWidth} - left - right,
      // height: {totalHeight} - top - bottom,
      backgroundColor: G.color.transparent,
      borderWidth: 1,
      borderColor: G.color.neutral30
    }, e;
  }(ce)
), Fh = (
  /** @class */
  function(t) {
    V(e, t);
    function e() {
      return t !== null && t.apply(this, arguments) || this;
    }
    return e.prototype.getCoordSysModel = function() {
      return this.getReferringComponents("grid", qe).models[0];
    }, e.type = "cartesian2dAxis", e;
  }(ce)
);
ir(Fh, KA);
var V1 = {
  show: !0,
  // zlevel: 0,
  z: 0,
  // Inverse the axis.
  inverse: !1,
  // Axis name displayed.
  name: "",
  // 'start' | 'middle' | 'end'
  nameLocation: "end",
  // By degree. By default auto rotate by nameLocation.
  nameRotate: null,
  nameTruncate: {
    maxWidth: null,
    ellipsis: "...",
    placeholder: "."
  },
  // Use global text style by default.
  nameTextStyle: {
    // textMargin: never, // The default value will be specified based on `nameLocation`.
  },
  // The gap between axisName and axisLine.
  nameGap: 15,
  // Default `false` to support tooltip.
  silent: !1,
  // Default `false` to avoid legacy user event listener fail.
  triggerEvent: !1,
  tooltip: {
    show: !1
  },
  axisPointer: {},
  axisLine: {
    show: !0,
    onZero: "auto",
    onZeroAxisIndex: null,
    lineStyle: {
      color: G.color.axisLine,
      width: 1,
      type: "solid"
    },
    // The arrow at both ends the the axis.
    symbol: ["none", "none"],
    symbolSize: [10, 15],
    breakLine: !0
  },
  axisTick: {
    show: !0,
    // Whether axisTick is inside the grid or outside the grid.
    inside: !1,
    // The length of axisTick.
    length: 5,
    lineStyle: {
      width: 1
    }
  },
  axisLabel: {
    show: !0,
    // Whether axisLabel is inside the grid or outside the grid.
    inside: !1,
    rotate: 0,
    // true | false | null/undefined (auto)
    showMinLabel: null,
    // true | false | null/undefined (auto)
    showMaxLabel: null,
    margin: 8,
    // formatter: null,
    fontSize: 12,
    color: G.color.axisLabel,
    // In scenarios like axis labels, when labels text's progression direction matches the label
    // layout direction (e.g., when all letters are in a single line), extra start/end margin is
    // needed to prevent the text from appearing visually joined. In the other case, when lables
    // are stacked (e.g., having rotation or horizontal labels on yAxis), the layout needs to be
    // compact, so NO extra top/bottom margin should be applied.
    textMargin: [0, 3]
  },
  splitLine: {
    show: !0,
    showMinLine: !0,
    showMaxLine: !0,
    lineStyle: {
      color: G.color.axisSplitLine,
      width: 1,
      type: "solid"
    }
  },
  splitArea: {
    show: !1,
    areaStyle: {
      color: [G.color.backgroundTint, G.color.backgroundTransparent]
    }
  },
  breakArea: {
    show: !0,
    itemStyle: {
      color: G.color.neutral00,
      // Break border color should be darker than the splitLine
      // because it has opacity and should be more prominent
      borderColor: G.color.border,
      borderWidth: 1,
      borderType: [3, 3],
      opacity: 0.6
    },
    zigzagAmplitude: 4,
    zigzagMinSpan: 4,
    zigzagMaxSpan: 20,
    zigzagZ: 100,
    expandOnClick: !0
  },
  breakLabelLayout: {
    moveOverlap: "auto"
  }
}, VO = Se({
  // The gap at both ends of the axis. For categoryAxis, boolean.
  boundaryGap: !0,
  // Set false to faster category collection.
  deduplication: null,
  jitter: 0,
  jitterOverlap: !0,
  jitterMargin: 2,
  // splitArea: {
  // show: false
  // },
  splitLine: {
    show: !1
  },
  axisTick: {
    // If tick is align with label when boundaryGap is true
    alignWithLabel: !1,
    interval: "auto",
    show: "auto"
  },
  axisLabel: {
    interval: "auto"
  }
}, V1), pv = Se({
  boundaryGap: [0, 0],
  axisLine: {
    // Not shown when other axis is categoryAxis in cartesian
    show: "auto"
  },
  axisTick: {
    // Not shown when other axis is categoryAxis in cartesian
    show: "auto"
  },
  // TODO
  // min/max: [30, datamin, 60] or [20, datamin] or [datamin, 60]
  splitNumber: 5,
  minorTick: {
    // Minor tick, not available for cateogry axis.
    show: !1,
    // Split number of minor ticks. The value should be in range of (0, 100)
    splitNumber: 5,
    // Length of minor tick
    length: 3,
    // Line style
    lineStyle: {
      // Default to be same with axisTick
    }
  },
  minorSplitLine: {
    show: !1,
    lineStyle: {
      color: G.color.axisMinorSplitLine,
      width: 1
    }
  }
}, V1), FO = Se({
  splitNumber: 6,
  axisLabel: {
    // The default value of TimeScale is determined in `AxisBuilder`
    // showMinLabel: false,
    // showMaxLabel: false,
    rich: {
      primary: {
        fontWeight: "bold"
      }
    }
  },
  splitLine: {
    show: !1
  }
}, pv), zO = ge({
  logBase: 10
}, pv);
const HO = {
  category: VO,
  value: pv,
  time: FO,
  log: zO
};
function Qg(t, e, r, n) {
  x(i1, function(i, a) {
    var o = Se(Se({}, HO[a], !0), n, !0), s = (
      /** @class */
      function(u) {
        V(l, u);
        function l() {
          var f = u !== null && u.apply(this, arguments) || this;
          return f.type = e + "Axis." + a, f;
        }
        return l.prototype.mergeDefaultAndTheme = function(f, h) {
          var c = Xa(this), v = c ? Hi(f) : {}, d = h.getTheme();
          Se(f, d.get(a + "Axis")), Se(f, this.getDefaultOption()), f.type = jg(f), c && Ur(f, v, c);
        }, l.prototype.optionUpdated = function() {
          var f = this.option;
          f.type === "category" && (this.__ordinalMeta = Ph.createByAxisModel(this));
        }, l.prototype.getCategories = function(f) {
          var h = this.option;
          if (h.type === "category")
            return f ? h.data : this.__ordinalMeta.categories;
        }, l.prototype.getOrdinalMeta = function() {
          return this.__ordinalMeta;
        }, l.prototype.updateAxisBreaks = function(f) {
          return {
            breaks: []
          };
        }, l.type = e + "Axis." + a, l.defaultOption = o, l;
      }(r)
    );
    t.registerComponentModel(s);
  }), t.registerSubTypeDefaulter(e + "Axis", jg);
}
function jg(t) {
  return t.type || (t.data ? "category" : "value");
}
var GO = (
  /** @class */
  function() {
    function t(e) {
      this.type = "cartesian", this._dimList = [], this._axes = {}, this.name = e || "";
    }
    return t.prototype.getAxis = function(e) {
      return this._axes[e];
    }, t.prototype.getAxes = function() {
      return X(this._dimList, function(e) {
        return this._axes[e];
      }, this);
    }, t.prototype.getAxesByScale = function(e) {
      return e = e.toLowerCase(), He(this.getAxes(), function(r) {
        return r.scale.type === e;
      });
    }, t.prototype.addAxis = function(e) {
      var r = e.dim;
      this._axes[r] = e, this._dimList.push(r);
    }, t;
  }()
), Ds = ["x", "y"];
function Jg(t) {
  return (t.type === "interval" || t.type === "time") && !Rn(t);
}
var UO = (
  /** @class */
  function(t) {
    V(e, t);
    function e() {
      var r = t !== null && t.apply(this, arguments) || this;
      return r.type = Cs, r.dimensions = Ds, r;
    }
    return e.prototype.calcAffineTransform = function() {
      this._transform = this._invTransform = null;
      var r = this.getAxis("x").scale, n = this.getAxis("y").scale;
      if (!(!Jg(r) || !Jg(n))) {
        var i = uu(r, null), a = uu(n, null), o = this.dataToPoint([i[0], a[0]]), s = this.dataToPoint([i[1], a[1]]), u = i[1] - i[0], l = a[1] - a[0];
        if (!(!u || !l)) {
          var f = (s[0] - o[0]) / u, h = (s[1] - o[1]) / l, c = o[0] - i[0] * f, v = o[1] - a[0] * h, d = this._transform = [f, 0, 0, h, c, v];
          this._invTransform = ao([], d);
        }
      }
    }, e.prototype.getBaseAxis = function() {
      return this.getAxesByScale("ordinal")[0] || this.getAxesByScale("time")[0] || this.getAxis("x");
    }, e.prototype.containPoint = function(r) {
      var n = this.getAxis("x"), i = this.getAxis("y");
      return n.contain(n.toLocalCoord(r[0])) && i.contain(i.toLocalCoord(r[1]));
    }, e.prototype.containData = function(r) {
      return this.getAxis("x").containData(r[0]) && this.getAxis("y").containData(r[1]);
    }, e.prototype.containZone = function(r, n) {
      var i = this.dataToPoint(r), a = this.dataToPoint(n), o = this.getArea(), s = new ie(i[0], i[1], a[0] - i[0], a[1] - i[1]);
      return o.intersect(s);
    }, e.prototype.dataToPoint = function(r, n, i) {
      i = i || [];
      var a = r[0], o = r[1];
      if (this._transform && a != null && isFinite(a) && o != null && isFinite(o))
        return Ct(i, r, this._transform);
      var s = this.getAxis("x"), u = this.getAxis("y");
      return i[0] = s.toGlobalCoord(s.dataToCoord(a, n)), i[1] = u.toGlobalCoord(u.dataToCoord(o, n)), i;
    }, e.prototype.clampData = function(r, n) {
      var i = this.getAxis("x").scale, a = this.getAxis("y").scale, o = i.getExtent(), s = a.getExtent(), u = i.parse(r[0]), l = a.parse(r[1]);
      return n = n || [], n[0] = Math.min(Math.max(Math.min(o[0], o[1]), u), Math.max(o[0], o[1])), n[1] = Math.min(Math.max(Math.min(s[0], s[1]), l), Math.max(s[0], s[1])), n;
    }, e.prototype.pointToData = function(r, n, i) {
      if (i = i || [], this._invTransform)
        return Ct(i, r, this._invTransform);
      var a = this.getAxis("x"), o = this.getAxis("y");
      return i[0] = a.coordToData(a.toLocalCoord(r[0]), n), i[1] = o.coordToData(o.toLocalCoord(r[1]), n), i;
    }, e.prototype.getOtherAxis = function(r) {
      return this.getAxis(r.dim === "x" ? "y" : "x");
    }, e.prototype.getArea = function(r) {
      r = r || 0;
      var n = this.getAxis("x").getGlobalExtent(), i = this.getAxis("y").getGlobalExtent(), a = Math.min(n[0], n[1]) - r, o = Math.min(i[0], i[1]) - r, s = Math.max(n[0], n[1]) - a + r, u = Math.max(i[0], i[1]) - o + r;
      return new ie(a, o, s, u);
    }, e;
  }(GO)
);
function WO(t, e) {
  var r = t.scale, n = t.model;
  process.env.NODE_ENV !== "production" && N(r && n && (r instanceof Vr || r instanceof fu) && (e instanceof Vr || e instanceof fu));
  var i = m1(r, n, n.ecModel, t), a = Li(r), o = Li(e) ? e.intervalStub : e, s = a ? r.intervalStub : r, u = r.base, l = o.getTicks(), f = o.getTicks({
    expandToNicedExtent: !0
  }), h = l.length - 1;
  process.env.NODE_ENV !== "production" && (N(!Rn(e) && !Rn(r)), N(h > 0), N(f.length === l.length), N(l[0].value <= l[h].value), N(f[0].value <= l[0].value && l[h].value <= f[h].value), h >= 2 && (N(f[1].value === l[1].value), N(f[h - 1].value === l[h - 1].value)));
  var c, v, d;
  if (h === 1)
    c = v = 0, d = 1;
  else if (h === 2) {
    var p = Pe(l[0].value - l[1].value), m = Pe(l[1].value - l[2].value);
    c = v = 0, p === m ? d = 2 : (d = 1, p < m ? c = p / m : v = m / p);
  } else {
    var g = o.getConfig().interval;
    c = (1 - (l[0].value - f[0].value) / g) % 1, v = (1 - (f[h].value - l[h].value) / g) % 1, d = h - (c ? 1 : 0) - (v ? 1 : 0);
  }
  process.env.NODE_ENV !== "production" && N(d >= 1);
  var y = i.zoomFixMM, _ = y[0] || y[1], S = [i.fixMM[0] || _, i.fixMM[1] || _], b = r.getExtent(), w = s.getExtent(), T = e1(w, S), M, D, C, E, I, A;
  function O(J) {
    for (var $ = 50, F = 0; F < $ && !J(); F++)
      C = a ? C * ye(u, 2) : EA(C), E = Bn(C);
    process.env.NODE_ENV !== "production" && F >= $ && nt("incorrect impl in `scaleCalcAlign`.");
  }
  function P() {
    M = ue(A - C * c, E);
  }
  function L() {
    D = ue(I + C * v, E);
  }
  function B() {
    A = c ? ue(M + C * c, E) : M;
  }
  function U() {
    I = v ? ue(D - C * v, E) : D;
  }
  if (S[0] && S[1]) {
    M = T[0], D = T[1], C = (D - M) / (d + c + v);
    var Y = t.getExtent(), j = Pe(Y[1] - Y[0]);
    E = Cy([D, M], j, 0.5 / d), B(), U(), er(E) && (C = ue(C, E));
  } else {
    var K = T[1] - T[0];
    C = a ? ye(My(K), 1) : lc(K / d, Ey), E = Bn(C), S[0] ? (M = T[0], O(function() {
      if (B(), I = ue(A + C * d, E), L(), D >= T[1])
        return !0;
    })) : S[1] ? (D = T[1], O(function() {
      if (U(), A = ue(I - C * d, E), P(), M <= T[0])
        return !0;
    })) : O(function() {
      A = ue(Vi(T[0] / C) * C, E), I = ue(Ln(T[1] / C) * C, E);
      var J = mr((I - A) / C);
      if (J <= d) {
        var $ = d - J, F = void 0, ne = i.incl0 || a;
        if (ne && T[0] === 0)
          F = [0, $];
        else if (ne && T[1] === 0)
          F = [$, 0];
        else {
          var oe = Ln($ / 2);
          F = $ % 2 === 0 ? [oe, oe] : M + D < T[0] + T[1] ? [oe, oe + 1] : [oe + 1, oe];
        }
        if (A = ue(A - C * F[0], E), I = ue(I + C * F[1], E), P(), L(), M <= T[0] && D >= T[1])
          return !0;
      }
    });
  }
  o1(r, S, w, [M, D], b, {
    // NOTE: Even in LogScale, `interval` should not be in log space.
    interval: C,
    // Force ticks count, otherwise cumulative error may cause more unexpected ticks to be generated.
    // Though the overlapping tick labels may be auto-ignored, but probably unexpected, e.g., the min
    // tick label is ignored but the secondary min tick label is shown, which is unexpected when
    // `axis.min` is user-specified or dataZoom-specified.
    intervalCount: d,
    intervalPrecision: E,
    niceExtent: [A, I]
  }), process.env.NODE_ENV !== "production" && r.freeze();
}
var em = [
  [3, 1],
  [0, 2]
  // xyIdx 1 => 'y'
], YO = (
  /** @class */
  function() {
    function t(e, r, n) {
      this.type = "grid", this._coordsMap = {}, this._coordsList = [], this._axesMap = {}, this._axesList = [], this.axisPointerEnabled = !0, this.dimensions = Ds, this._initCartesian(e, r, n), this.model = e;
    }
    return t.prototype.getRect = function() {
      return this._rect;
    }, t.prototype.update = function(e, r) {
      var n = this._axesMap;
      x(this._axesList, function(o) {
        d1(o, iI);
        var s = o.scale;
        Mt(s) && s.setSortInfo(o.model.get("categorySortInfo"));
      });
      function i(o) {
        for (var s = le(o), u = [], l = s.length - 1; l >= 0; l--) {
          var f = o[+s[l]];
          f.__alignTo ? u.push(f) : Pg(f);
        }
        x(u, function(h) {
          ZO(h, h.__alignTo) ? Pg(h) : WO(h, h.__alignTo.scale);
        });
      }
      i(n.x), i(n.y);
      var a = {};
      x(n.x, function(o) {
        tm(n, "y", o, a);
      }), x(n.y, function(o) {
        tm(n, "x", o, a);
      }), this.resize(this.model, r);
    }, t.prototype.resize = function(e, r, n) {
      var i = qc(e, r), a = this._rect = Ii(e.getBoxLayoutParams(), i.refContainer), o = this._axesMap, s = this._coordsList, u = e.get("containLabel");
      if (F1(o, a), !n) {
        var l = qO(a, s, o, u, r), f = void 0;
        if (u)
          process.env.NODE_ENV !== "production" && Oy("Specified `grid.containLabel` but no `use(LegacyGridContainLabel)`;use `grid.outerBounds` instead.", !0), f = am(a.clone(), "axisLabel", null, a, o, l, i);
        else {
          var h = KO(e, a, i), c = h.outerBoundsRect, v = h.parsedOuterBoundsContain, d = h.outerBoundsClamp;
          c && (f = am(c, v, d, a, o, l, i));
        }
        z1(a, o, Nt.determine, null, f, i), x(this._coordsList, function(p) {
          p.calcAffineTransform();
        });
      }
    }, t.prototype.getAxis = function(e, r) {
      var n = this._axesMap[e];
      if (n != null)
        return n[r || 0];
    }, t.prototype.getAxes = function() {
      return this._axesList.slice();
    }, t.prototype.getCartesian = function(e, r) {
      if (e != null && r != null) {
        var n = "x" + e + "y" + r;
        return this._coordsMap[n];
      }
      q(e) && (r = e.yAxisIndex, e = e.xAxisIndex);
      for (var i = 0, a = this._coordsList; i < a.length; i++)
        if (a[i].getAxis("x").index === e || a[i].getAxis("y").index === r)
          return a[i];
    }, t.prototype.getCartesians = function() {
      return this._coordsList.slice();
    }, t.prototype.convertToPixel = function(e, r, n) {
      var i = this._findConvertTarget(r);
      return i.cartesian ? i.cartesian.dataToPoint(n) : i.axis ? i.axis.toGlobalCoord(i.axis.dataToCoord(n)) : null;
    }, t.prototype.convertFromPixel = function(e, r, n) {
      var i = this._findConvertTarget(r);
      return i.cartesian ? i.cartesian.pointToData(n) : i.axis ? i.axis.coordToData(i.axis.toLocalCoord(n)) : null;
    }, t.prototype._findConvertTarget = function(e) {
      var r = e.seriesModel, n = e.xAxisModel || r && r.getReferringComponents("xAxis", qe).models[0], i = e.yAxisModel || r && r.getReferringComponents("yAxis", qe).models[0], a = e.gridModel, o = this._coordsList, s, u;
      if (r)
        s = r.coordinateSystem, fe(o, s) < 0 && (s = null);
      else if (n && i)
        s = this.getCartesian(n.componentIndex, i.componentIndex);
      else if (n)
        u = this.getAxis("x", n.componentIndex);
      else if (i)
        u = this.getAxis("y", i.componentIndex);
      else if (a) {
        var l = a.coordinateSystem;
        l === this && (s = this._coordsList[0]);
      }
      return {
        cartesian: s,
        axis: u
      };
    }, t.prototype.containPoint = function(e) {
      var r = this._coordsList[0];
      if (r)
        return r.containPoint(e);
    }, t.prototype._initCartesian = function(e, r, n) {
      var i = this, a = this, o = {
        left: !1,
        right: !1,
        top: !1,
        bottom: !1
      }, s = {
        x: {},
        y: {}
      }, u = {
        x: 0,
        y: 0
      };
      if (r.eachComponent("xAxis", l("x"), this), r.eachComponent("yAxis", l("y"), this), !u.x || !u.y) {
        this._axesMap = {}, this._axesList = [];
        return;
      }
      this._axesMap = s, x(s.x, function(f, h) {
        x(s.y, function(c, v) {
          var d = "x" + h + "y" + v, p = new UO(d);
          p.master = i, p.model = e, i._coordsMap[d] = p, i._coordsList.push(p), p.addAxis(f), p.addAxis(c);
        });
      }), nm(s.x), nm(s.y);
      function l(f) {
        return function(h, c) {
          if (XO(h, e)) {
            var v = h.get("position");
            f === "x" ? v !== "top" && v !== "bottom" && (v = o.bottom ? "top" : "bottom") : v !== "left" && v !== "right" && (v = o.left ? "right" : "left"), o[v] = !0;
            var d = zA(h), p = new gO(f, HA(h, d), [0, 0], d, v);
            p.onBand = s1(p.scale, h), p.inverse = h.get("inverse"), h.axis = p, p.model = h, p.grid = a, p.index = c, a._axesList.push(p), s[f][c] = p, u[f]++;
          }
        };
      }
    }, t.prototype.getTooltipAxes = function(e) {
      var r = [], n = [];
      return x(this.getCartesians(), function(i) {
        var a = e != null && e !== "auto" ? i.getAxis(e) : i.getBaseAxis(), o = i.getOtherAxis(a);
        fe(r, a) < 0 && r.push(a), fe(n, o) < 0 && n.push(o);
      }), {
        baseAxes: r,
        otherAxes: n
      };
    }, t.create = function(e, r) {
      var n = [];
      return e.eachComponent("grid", function(i, a) {
        var o = new t(i, e, r);
        o.name = "grid_" + a, o.resize(i, r, !0), i.coordinateSystem = o, n.push(o), x(o._axesList, function(s) {
          sI(s, t.dimIdxMap);
        });
      }), e.eachSeries(function(i) {
        var a, o;
        ZC({
          targetModel: i,
          coordSysType: Cs,
          coordSysProvider: s
        });
        function s() {
          var u = NO(i), l = u.xAxisModel, f = u.yAxisModel;
          a = l.axis, o = f.axis;
          var h = l.getCoordSysModel();
          if (process.env.NODE_ENV !== "production") {
            if (!h)
              throw new Error('Grid "' + Rr(l.get("gridIndex"), l.get("gridId"), 0) + '" not found');
            if (l.getCoordSysModel() !== f.getCoordSysModel())
              throw new Error("xAxis and yAxis must use the same grid");
          }
          var c = h.coordinateSystem;
          return c.getCartesian(l.componentIndex, f.componentIndex);
        }
        a && o && (Mg(a, i, Cs), Mg(o, i, Cs));
      }, this), n;
    }, t.dimensions = Ds, t.dimIdxMap = sv(Ds), t;
  }()
);
function XO(t, e) {
  return t.getCoordSysModel() === e;
}
function tm(t, e, r, n) {
  r.getAxesOnZeroOf = function() {
    return a ? [a] : [];
  };
  var i = t[e], a, o = r.model, s = o.get(["axisLine", "onZero"]), u = o.get(["axisLine", "onZeroAxisIndex"]);
  if (!s)
    return;
  if (u != null)
    rm(s, i[u]) && (a = i[u]);
  else
    for (var l in i)
      if (at(i, l) && rm(s, i[l]) && !n[f(i[l])]) {
        a = i[l];
        break;
      }
  a && (n[f(a)] = !0);
  function f(h) {
    return h.dim + "_" + h.index;
  }
}
function rm(t, e) {
  if (!e)
    return !1;
  var r = e.scale, n = GA(r, 0), i = e && e.type !== "category" && e.type !== "time" && n !== Nh;
  return i && t === "auto" && XA(e) && (i = !1), i;
}
function nm(t) {
  for (var e = le(t), r, n = [], i = e.length - 1; i >= 0; i--) {
    var a = t[+e[i]];
    J_(a.scale) && qA(a.model, a.type) == null && (a.model.get("alignTicks") && a.model.get("interval") == null ? n.push(a) : r = a);
  }
  r || (r = n.pop()), r && x(n, function(o) {
    o.__alignTo = r;
  });
}
function ZO(t, e) {
  return Rn(t.scale) || Rn(e.scale) || e.scale.getTicks().length < 2;
}
function $O(t, e) {
  var r = t.getExtent(), n = r[0] + r[1];
  t.toGlobalCoord = t.dim === "x" ? function(i) {
    return i + e;
  } : function(i) {
    return n - i + e;
  }, t.toLocalCoord = t.dim === "x" ? function(i) {
    return i - e;
  } : function(i) {
    return n - i + e;
  };
}
function F1(t, e) {
  x(t.x, function(r) {
    return im(r, e.x, e.width);
  }), x(t.y, function(r) {
    return im(r, e.y, e.height);
  });
}
function im(t, e, r) {
  var n = [0, r], i = t.inverse ? 1 : 0;
  t.setExtent(n[i], n[1 - i]), $O(t, e);
}
function am(t, e, r, n, i, a, o) {
  process.env.NODE_ENV !== "production" && N(e === "all" || e === "axisLabel"), z1(n, i, Nt.estimate, e, !1, o);
  var s = [0, 0, 0, 0];
  l(0), l(1), f(n, 0, NaN), f(n, 1, NaN);
  var u = BS(s, function(c) {
    return c > 0;
  }) == null;
  return Zs(n, s, !0, !0, r), F1(i, n), u;
  function l(c) {
    x(i[bn[c]], function(v) {
      if (Ja(v.model)) {
        var d = a.ensureRecord(v.model), p = d.labelInfoList;
        if (p)
          for (var m = 0; m < p.length; m++) {
            var g = p[m], y = v.scale.normalize(mo(v.scale, Ni(g.label).labelInfo.tick));
            y = c === 1 ? 1 - y : y, f(g.rect, c, y), f(g.rect, 1 - c, NaN);
          }
        var _ = d.nameLayout;
        if (_) {
          var y = Pi(d.nameLocation) ? 0.5 : NaN;
          f(_.rect, c, y), f(_.rect, 1 - c, NaN);
        }
      }
    });
  }
  function f(c, v, d) {
    var p = t[bn[v]] - c[bn[v]], m = c[Ha[v]] + c[bn[v]] - (t[Ha[v]] + t[bn[v]]);
    p = h(p, 1 - d), m = h(m, d);
    var g = em[v][0], y = em[v][1];
    s[g] = ye(s[g], p), s[y] = ye(s[y], m);
  }
  function h(c, v) {
    return c > 0 && !bi(v) && v > 1e-4 && (c /= v), c;
  }
}
function qO(t, e, r, n, i) {
  var a = new O1(QO);
  return x(r, function(o) {
    return x(o, function(s) {
      if (Ja(s.model)) {
        var u = !n;
        s.axisBuilder = RO(t, e, s.model, i, a, u);
      }
    });
  }), a;
}
function z1(t, e, r, n, i, a) {
  var o = r === Nt.determine;
  x(e, function(l) {
    return x(l, function(f) {
      Ja(f.model) && (kO(f.axisBuilder, t, f.model), f.axisBuilder.build(o ? {
        axisTickLabelDetermine: !0
      } : {
        axisTickLabelEstimate: !0
      }, {
        noPxChange: i
      }));
    });
  });
  var s = {
    x: 0,
    y: 0
  };
  u(0), u(1);
  function u(l) {
    s[bn[1 - l]] = t[Ha[l]] <= a.refContainer[Ha[l]] * 0.5 ? 0 : 1 - l === 1 ? 2 : 1;
  }
  x(e, function(l, f) {
    return x(l, function(h) {
      Ja(h.model) && ((n === "all" || o) && h.axisBuilder.build({
        axisName: !0
      }, {
        nameMarginLevel: s[f]
      }), o && h.axisBuilder.build({
        axisLine: !0
      }));
    });
  });
}
function KO(t, e, r) {
  var n, i = t.get("outerBoundsMode", !0);
  i === "same" ? n = e.clone() : i == null || i === "auto" ? n = Ii(t.get("outerBounds", !0) || B1, r.refContainer) : i !== "none" && process.env.NODE_ENV !== "production" && he("Invalid grid[" + t.componentIndex + "].outerBoundsMode.");
  var a = t.get("outerBoundsContain", !0), o;
  a == null || a === "auto" ? o = "all" : fe(["all", "axisLabel"], a) < 0 ? (process.env.NODE_ENV !== "production" && he("Invalid grid[" + t.componentIndex + "].outerBoundsContain."), o = "all") : o = a;
  var s = [nh(W(t.get("outerBoundsClampWidth", !0), mu[0]), e.width), nh(W(t.get("outerBoundsClampHeight", !0), mu[1]), e.height)];
  return {
    outerBoundsRect: n,
    parsedOuterBoundsContain: o,
    outerBoundsClamp: s
  };
}
var QO = function(t, e, r, n, i, a) {
  var o = r.axis.dim === "x" ? "y" : "x";
  L1(t, e, r, n, i, a), Pi(t.nameLocation) || x(e.recordMap[o], function(s) {
    s && s.labelInfoList && s.dirVec && N1(s.labelInfoList, s.dirVec, n, i);
  });
};
function jO(t, e) {
  var r = {
    /**
     * key: makeKey(axis.model)
     * value: {
     *      axis,
     *      coordSys,
     *      axisPointerModel,
     *      triggerTooltip,
     *      triggerEmphasis,
     *      involveSeries,
     *      snap,
     *      seriesModels,
     *      seriesDataCount
     * }
     */
    axesInfo: {},
    seriesInvolved: !1,
    /**
     * key: makeKey(coordSys.model)
     * value: Object: key makeKey(axis.model), value: axisInfo
     */
    coordSysAxesInfo: {},
    coordSysMap: {}
  };
  return JO(r, t, e), r.seriesInvolved && tL(r, t), r;
}
function JO(t, e, r) {
  var n = e.getComponent("tooltip"), i = e.getComponent("axisPointer"), a = i.get("link", !0) || [], o = [];
  x(r.getCoordinateSystems(), function(s) {
    if (!s.axisPointerEnabled)
      return;
    var u = eo(s.model), l = t.coordSysAxesInfo[u] = {};
    t.coordSysMap[u] = s;
    var f = s.model, h = f.getModel("tooltip", n);
    if (x(s.getAxes(), Ae(p, !1, null)), s.getTooltipAxes && n && h.get("show")) {
      var c = h.get("trigger") === "axis", v = h.get(["axisPointer", "type"]) === "cross", d = s.getTooltipAxes(h.get(["axisPointer", "axis"]));
      (c || v) && x(d.baseAxes, Ae(p, v ? "cross" : !0, c)), v && x(d.otherAxes, Ae(p, "cross", !1));
    }
    function p(m, g, y) {
      var _ = y.model.getModel("axisPointer", i), S = _.get("show");
      if (!(!S || S === "auto" && !m && !zh(_))) {
        g == null && (g = _.get("triggerTooltip")), _ = m ? eL(y, h, i, e, m, g) : _;
        var b = _.get("snap"), w = _.get("triggerEmphasis"), T = eo(y.model), M = g || b || y.type === "category", D = t.axesInfo[T] = {
          key: T,
          axis: y,
          coordSys: s,
          axisPointerModel: _,
          triggerTooltip: g,
          triggerEmphasis: w,
          involveSeries: M,
          snap: b,
          useHandle: zh(_),
          seriesModels: [],
          linkGroup: null
        };
        l[T] = D, t.seriesInvolved = t.seriesInvolved || M;
        var C = rL(a, y);
        if (C != null) {
          var E = o[C] || (o[C] = {
            axesInfo: {}
          });
          E.axesInfo[T] = D, E.mapper = a[C].mapper, D.linkGroup = E;
        }
      }
    }
  });
}
function eL(t, e, r, n, i, a) {
  var o = e.getModel("axisPointer"), s = ["type", "snap", "lineStyle", "shadowStyle", "label", "animation", "animationDurationUpdate", "animationEasingUpdate", "z"], u = {};
  x(s, function(c) {
    u[c] = ae(o.get(c));
  }), u.snap = t.type !== "category" && !!a, o.get("type") === "cross" && (u.type = "line");
  var l = u.label || (u.label = {});
  if (l.show == null && (l.show = !1), i === "cross") {
    var f = o.get(["label", "show"]);
    if (l.show = f ?? !0, !a) {
      var h = u.lineStyle = o.get("crossStyle");
      h && ge(l, h.textStyle);
    }
  }
  return t.model.getModel("axisPointer", new xe(u, r, n));
}
function tL(t, e) {
  e.eachSeries(function(r) {
    var n = r.coordinateSystem, i = r.get(["tooltip", "trigger"], !0), a = r.get(["tooltip", "show"], !0);
    !n || !n.model || i === "none" || i === !1 || i === "item" || a === !1 || r.get(["axisPointer", "show"], !0) === !1 || x(t.coordSysAxesInfo[eo(n.model)], function(o) {
      var s = o.axis;
      n.getAxis(s.dim) === s && (o.seriesModels.push(r), o.seriesDataCount == null && (o.seriesDataCount = 0), o.seriesDataCount += r.getData().count());
    });
  });
}
function rL(t, e) {
  for (var r = e.model, n = e.dim, i = 0; i < t.length; i++) {
    var a = t[i] || {};
    if (gf(a[n + "AxisId"], r.id) || gf(a[n + "AxisIndex"], r.componentIndex) || gf(a[n + "AxisName"], r.name))
      return i;
  }
}
function gf(t, e) {
  return t === "all" || H(t) && fe(t, e) >= 0 || t === e;
}
function nL(t) {
  var e = gv(t);
  if (e) {
    var r = e.axisPointerModel, n = e.axis.scale, i = r.option, a = r.get("status"), o = r.get("value");
    o != null && (o = n.parse(o));
    var s = zh(r);
    a == null && (i.status = s ? "show" : "hide");
    var u = n.getExtent();
    // Pick a value on axis when initializing.
    (o == null || o > u[1]) && (o = u[1]), o < u[0] && (o = u[0]), i.value = o, s && (i.status = e.axis.scale.isBlank() ? "hide" : "show");
  }
}
function gv(t) {
  var e = (t.ecModel.getComponent("axisPointer") || {}).coordSysAxesInfo;
  return e && e.axesInfo[eo(t)];
}
function iL(t) {
  var e = gv(t);
  return e && e.axisPointerModel;
}
function zh(t) {
  return !!t.get(["handle", "show"]);
}
function eo(t) {
  return t.type + "||" + t.id;
}
var mf = {}, H1 = (
  /** @class */
  function(t) {
    V(e, t);
    function e() {
      var r = t !== null && t.apply(this, arguments) || this;
      return r.type = e.type, r;
    }
    return e.prototype.render = function(r, n, i, a) {
      this.axisPointerClass && nL(r), t.prototype.render.apply(this, arguments), this._doUpdateAxisPointerClass(r, i, !0);
    }, e.prototype.updateAxisPointer = function(r, n, i, a) {
      this._doUpdateAxisPointerClass(r, i, !1);
    }, e.prototype.remove = function(r, n) {
      var i = this._axisPointer;
      i && i.remove(n);
    }, e.prototype.dispose = function(r, n) {
      this._disposeAxisPointer(n), t.prototype.dispose.apply(this, arguments);
    }, e.prototype._doUpdateAxisPointerClass = function(r, n, i) {
      var a = e.getAxisPointerClass(this.axisPointerClass);
      if (a) {
        var o = iL(r);
        o ? (this._axisPointer || (this._axisPointer = new a())).render(r, o, n, i) : this._disposeAxisPointer(n);
      }
    }, e.prototype._disposeAxisPointer = function(r) {
      this._axisPointer && this._axisPointer.dispose(r), this._axisPointer = null;
    }, e.registerAxisPointerClass = function(r, n) {
      if (process.env.NODE_ENV !== "production" && mf[r])
        throw new Error("axisPointer " + r + " exists");
      mf[r] = n;
    }, e.getAxisPointerClass = function(r) {
      return r && mf[r];
    }, e.type = "axis", e;
  }(Pt)
), Hh = ve();
function aL(t, e, r, n) {
  var i = r.axis;
  if (!i.scale.isBlank()) {
    var a = r.getModel("splitArea"), o = a.getModel("areaStyle"), s = o.get("color"), u = n.coordinateSystem.getRect(), l = i.getTicksCoords({
      tickModel: a,
      breakTicks: "none",
      pruneByBreak: "preserve_extent_bound"
    });
    if (l.length) {
      var f = s.length, h = Hh(t).splitAreaColors, c = Z(), v = 0;
      if (h)
        for (var d = 0; d < l.length; d++) {
          var p = h.get(l[d].tickValue);
          if (p != null) {
            v = (p + (f - 1) * d) % f;
            break;
          }
        }
      var m = i.toGlobalCoord(l[0].coord), g = o.getAreaStyle();
      s = H(s) ? s : [s];
      for (var d = 1; d < l.length; d++) {
        var y = i.toGlobalCoord(l[d].coord), _ = void 0, S = void 0, b = void 0, w = void 0;
        i.isHorizontal() ? (_ = m, S = u.y, b = y - _, w = u.height, m = _ + b) : (_ = u.x, S = m, b = u.width, w = y - S, m = S + w);
        var T = l[d - 1].tickValue;
        T != null && c.set(T, v), e.add(new Ce({
          anid: T != null ? "area_" + T : null,
          shape: {
            x: _,
            y: S,
            width: b,
            height: w
          },
          style: ge({
            fill: s[v]
          }, g),
          autoBatch: !0,
          silent: !0
        })), v = (v + 1) % f;
      }
      Hh(t).splitAreaColors = c;
    }
  }
}
function oL(t) {
  Hh(t).splitAreaColors = null;
}
var sL = ["splitArea", "splitLine", "minorSplitLine", "breakArea"], G1 = (
  /** @class */
  function(t) {
    V(e, t);
    function e() {
      var r = t !== null && t.apply(this, arguments) || this;
      return r.type = e.type, r.axisPointerClass = "CartesianAxisPointer", r;
    }
    return e.prototype.render = function(r, n, i, a) {
      this.group.removeAll();
      var o = this._axisGroup;
      if (this._axisGroup = new Re(), this.group.add(this._axisGroup), !!Ja(r)) {
        this._axisGroup.add(r.axis.axisBuilder.group), x(sL, function(u) {
          r.get([u, "show"]) && uL[u](this, this._axisGroup, r, r.getCoordSysModel(), i);
        }, this);
        var s = a && a.type === "changeAxisOrder" && a.isInitSort;
        s || x0(o, this._axisGroup, r), t.prototype.render.call(this, r, n, i, a);
      }
    }, e.prototype.remove = function() {
      oL(this);
    }, e.type = "cartesianAxis", e;
  }(H1)
), uL = {
  splitLine: function(t, e, r, n, i) {
    var a = r.axis;
    if (!a.scale.isBlank()) {
      var o = r.getModel("splitLine"), s = o.getModel("lineStyle"), u = s.get("color"), l = o.get("showMinLine") !== !1, f = o.get("showMaxLine") !== !1;
      u = H(u) ? u : [u];
      for (var h = n.coordinateSystem.getRect(), c = a.isHorizontal(), v = 0, d = a.getTicksCoords({
        tickModel: o,
        breakTicks: "none",
        pruneByBreak: "preserve_extent_bound"
      }), p = [], m = [], g = s.getLineStyle(), y = 0; y < d.length; y++) {
        var _ = a.toGlobalCoord(d[y].coord);
        if (!(y === 0 && !l || y === d.length - 1 && !f)) {
          var S = d[y].tickValue;
          c ? (p[0] = _, p[1] = h.y, m[0] = _, m[1] = h.y + h.height) : (p[0] = h.x, p[1] = _, m[0] = h.x + h.width, m[1] = _);
          var b = v++ % u.length, w = new Hr({
            anid: S != null ? "line_" + S : null,
            autoBatch: !0,
            shape: {
              x1: p[0],
              y1: p[1],
              x2: m[0],
              y2: m[1]
            },
            style: ge({
              stroke: u[b]
            }, g),
            silent: !0
          });
          Ga(w.shape, g.lineWidth), e.add(w);
        }
      }
    }
  },
  minorSplitLine: function(t, e, r, n, i) {
    var a = r.axis, o = r.getModel("minorSplitLine"), s = o.getModel("lineStyle"), u = n.coordinateSystem.getRect(), l = a.isHorizontal(), f = a.getMinorTicksCoords();
    if (f.length)
      for (var h = [], c = [], v = s.getLineStyle(), d = 0; d < f.length; d++)
        for (var p = 0; p < f[d].length; p++) {
          var m = a.toGlobalCoord(f[d][p].coord);
          l ? (h[0] = m, h[1] = u.y, c[0] = m, c[1] = u.y + u.height) : (h[0] = u.x, h[1] = m, c[0] = u.x + u.width, c[1] = m);
          var g = new Hr({
            anid: "minor_line_" + f[d][p].tickValue,
            autoBatch: !0,
            shape: {
              x1: h[0],
              y1: h[1],
              x2: c[0],
              y2: c[1]
            },
            style: v,
            silent: !0
          });
          Ga(g.shape, v.lineWidth), e.add(g);
        }
  },
  splitArea: function(t, e, r, n, i) {
    aL(t, e, r, n);
  },
  breakArea: function(t, e, r, n, i) {
    r.axis.scale;
  }
}, U1 = (
  /** @class */
  function(t) {
    V(e, t);
    function e() {
      var r = t !== null && t.apply(this, arguments) || this;
      return r.type = e.type, r;
    }
    return e.type = "xAxis", e;
  }(G1)
), lL = (
  /** @class */
  function(t) {
    V(e, t);
    function e() {
      var r = t !== null && t.apply(this, arguments) || this;
      return r.type = U1.type, r;
    }
    return e.type = "yAxis", e;
  }(G1)
), fL = (
  /** @class */
  function(t) {
    V(e, t);
    function e() {
      var r = t !== null && t.apply(this, arguments) || this;
      return r.type = "grid", r;
    }
    return e.prototype.render = function(r, n) {
      this.group.removeAll(), r.get("show") && this.group.add(new Ce({
        shape: r.coordinateSystem.getRect(),
        style: ge({
          fill: r.get("backgroundColor")
        }, r.getItemStyle()),
        silent: !0,
        z2: -1
      }));
    }, e.type = "grid", e;
  }(Pt)
), om = {
  // gridIndex: 0,
  // gridId: '',
  offset: 0
};
function hL(t) {
  t.registerComponentView(fL), t.registerComponentModel(BO), t.registerCoordinateSystem("cartesian2d", YO), Qg(t, "x", Fh, om), Qg(t, "y", Fh, om), t.registerComponentView(U1), t.registerComponentView(lL), t.registerPreprocessor(function(e) {
    e.xAxis && e.yAxis && !e.grid && (e.grid = {});
  });
}
var cL = ve();
function sm(t, e) {
  return !!cL(t)[e];
}
Fn({
  type: "takeGlobalCursor",
  event: "globalCursorTaken",
  update: "update"
}, Fe);
var vL = {
  axisPointer: 1,
  tooltip: 1,
  brush: 1
};
function dL(t, e, r) {
  var n = e.getComponentByElement(t.topTarget);
  if (!n || n === r || vL.hasOwnProperty(n.mainType))
    return !1;
  var i = n.coordinateSystem;
  if (!i || i.model === r)
    return !1;
  var a = Ya(n), o = Ya(r);
  return !((a.zlevel - o.zlevel || a.z - o.z) <= 0);
}
var pL = (
  /** @class */
  function(t) {
    V(e, t);
    function e(r) {
      var n = t.call(this) || this;
      n._zr = r;
      var i = te(n._mousedownHandler, n), a = te(n._mousemoveHandler, n), o = te(n._mouseupHandler, n), s = te(n._mousewheelHandler, n), u = te(n._pinchHandler, n);
      return n.enable = function(l, f) {
        var h = f.zInfo, c = Ya(h.component), v = c.z, d = c.zlevel, p = {
          component: h.component,
          z: v,
          zlevel: d,
          // By default roam controller is the lowest z2 comparing to other elememts in a component.
          z2: W(h.z2, -1 / 0)
        }, m = R({}, f.triggerInfo);
        this._opt = ge(R({}, f), {
          zoomOnMouseWheel: !0,
          moveOnMouseMove: !0,
          // By default, wheel do not trigger move.
          moveOnMouseWheel: !1,
          preventDefaultMouseMove: !0,
          zInfoParsed: p,
          triggerInfo: m,
          cursorGrab: "grab",
          cursorGrabbing: "grabbing"
        }), l == null && (l = !0), (!this._enabled || this._controlType !== l) && (this.disable(), this._enabled = !0, (l === !0 || l === "move" || l === "pan") && (ua(r, "mousedown", i, p), ua(r, "mousemove", a, p), ua(r, "mouseup", o, p)), (l === !0 || l === "scale" || l === "zoom") && (ua(r, "mousewheel", s, p), ua(r, "pinch", u, p)));
      }, n.disable = function() {
        this._enabled && (this._enabled = !1, la(r, "mousedown", i), la(r, "mousemove", a), la(r, "mouseup", o), la(r, "mousewheel", s), la(r, "pinch", u));
      }, n;
    }
    return e.prototype.isDragging = function() {
      return this._dragging;
    }, e.prototype.isPinching = function() {
      return this._pinching;
    }, e.prototype._checkPointer = function(r, n, i) {
      var a = this._opt, o = a.zInfoParsed;
      if (dL(r, a.api, o.component))
        return !1;
      var s = a.triggerInfo, u = s.roamTrigger, l = !1;
      return u === "global" && (l = !0), l || (l = s.isInSelf(r, n, i)), l && s.isInClip && !s.isInClip(r, n, i) && (l = !1), l;
    }, e.prototype._decideCursorStyle = function(r, n, i, a) {
      var o = r.target;
      if (!o && this._checkPointer(r, n, i))
        return this._opt.cursorGrab;
      if (a)
        return o && o.cursor || "default";
    }, e.prototype.dispose = function() {
      this.disable();
    }, e.prototype._mousedownHandler = function(r) {
      if (!(Lv(r) || sa(r))) {
        for (var n = r.target; n; ) {
          if (n.draggable)
            return;
          n = n.__hostTarget || n.parent;
        }
        var i = r.offsetX, a = r.offsetY;
        this._checkPointer(r, i, a) && (this._x = i, this._y = a, this._dragging = !0);
      }
    }, e.prototype._mousemoveHandler = function(r) {
      var n = this._zr;
      if (!(r.gestureEvent === "pinch" || sm(n, "globalPan") || sa(r))) {
        var i = r.offsetX, a = r.offsetY;
        if (!this._dragging || !Ms("moveOnMouseMove", r, this._opt)) {
          var o = this._decideCursorStyle(r, i, a, !1);
          o && n.setCursorStyle(o);
          return;
        }
        n.setCursorStyle(this._opt.cursorGrabbing);
        var s = this._x, u = this._y, l = i - s, f = a - u;
        this._x = i, this._y = a, this._opt.preventDefaultMouseMove && Ti(r.event), r.__ecRoamConsumed = !0, um(this, "pan", "moveOnMouseMove", r, {
          dx: l,
          dy: f,
          oldX: s,
          oldY: u,
          newX: i,
          newY: a,
          isAvailableBehavior: null
        });
      }
    }, e.prototype._mouseupHandler = function(r) {
      if (!sa(r)) {
        var n = this._zr;
        if (!Lv(r)) {
          this._dragging = !1;
          var i = this._decideCursorStyle(r, r.offsetX, r.offsetY, !0);
          i && n.setCursorStyle(i);
        }
      }
    }, e.prototype._mousewheelHandler = function(r) {
      if (!sa(r)) {
        var n = Ms("zoomOnMouseWheel", r, this._opt), i = Ms("moveOnMouseWheel", r, this._opt), a = r.wheelDelta, o = Math.abs(a), s = r.offsetX, u = r.offsetY;
        if (!(a === 0 || !n && !i)) {
          if (n) {
            var l = o > 3 ? 1.4 : o > 1 ? 1.2 : 1.1, f = a > 0 ? l : 1 / l;
            this._checkTriggerMoveZoom(this, "zoom", "zoomOnMouseWheel", r, {
              scale: f,
              originX: s,
              originY: u,
              isAvailableBehavior: null
            });
          }
          if (i) {
            var h = Math.abs(a), c = (a > 0 ? 1 : -1) * (h > 3 ? 0.4 : h > 1 ? 0.15 : 0.05);
            this._checkTriggerMoveZoom(this, "scrollMove", "moveOnMouseWheel", r, {
              scrollDelta: c,
              originX: s,
              originY: u,
              isAvailableBehavior: null
            });
          }
        }
      }
    }, e.prototype._pinchHandler = function(r) {
      if (!(sm(this._zr, "globalPan") || sa(r))) {
        var n = r.pinchScale > 1 ? 1.1 : 1 / 1.1;
        this._checkTriggerMoveZoom(this, "zoom", null, r, {
          scale: n,
          originX: r.pinchX,
          originY: r.pinchY,
          isAvailableBehavior: null
        });
      }
    }, e.prototype._checkTriggerMoveZoom = function(r, n, i, a, o) {
      r._checkPointer(a, o.originX, o.originY) && (Ti(a.event), a.__ecRoamConsumed = !0, um(r, n, i, a, o));
    }, e;
  }(ar)
);
function sa(t) {
  return t.__ecRoamConsumed;
}
var gL = ve();
function ju(t) {
  var e = gL(t);
  return e.roam = e.roam || {}, e.uniform = e.uniform || {}, e;
}
function ua(t, e, r, n) {
  for (var i = ju(t), a = i.roam, o = a[e] = a[e] || [], s = 0; s < o.length; s++) {
    var u = o[s].zInfoParsed;
    if ((u.zlevel - n.zlevel || u.z - n.z || u.z2 - n.z2) <= 0)
      break;
  }
  o.splice(s, 0, {
    listener: r,
    zInfoParsed: n
  }), mL(t, e);
}
function la(t, e, r) {
  for (var n = ju(t), i = n.roam[e] || [], a = 0; a < i.length; a++)
    if (i[a].listener === r) {
      i.splice(a, 1), i.length || yL(t, e);
      return;
    }
}
function mL(t, e) {
  var r = ju(t);
  r.uniform[e] || t.on(e, r.uniform[e] = function(n) {
    var i = r.roam[e];
    if (i)
      for (var a = 0; a < i.length; a++)
        i[a].listener(n);
  });
}
function yL(t, e) {
  var r = ju(t), n = r.uniform;
  n[e] && (t.off(e, n[e]), n[e] = null);
}
function um(t, e, r, n, i) {
  i.isAvailableBehavior = te(Ms, null, r, n), t.trigger(e, i);
}
function Ms(t, e, r) {
  var n = r[t];
  return !t || n && (!z(n) || e.event[n + "Key"]);
}
function to(t, e, r, n, i, a) {
  t = t || 0;
  var o = _n(r[1], -r[0]);
  if (i != null && (i = ni(i, [0, o])), a != null && (a = Math.max(a, i ?? 0)), n === "all") {
    var s = Math.abs(_n(e[1], -e[0]));
    s = ni(s, [0, o]), i = a = ni(s, [i, a]), n = 0;
  }
  e[0] = ni(e[0], r), e[1] = ni(e[1], r);
  var u = yf(e, n);
  e[n] += t;
  var l = i || 0, f = r.slice();
  u.sign < 0 ? f[0] = _n(f[0], l) : f[1] = _n(f[1], -l), e[n] = ni(e[n], f);
  var h;
  return h = yf(e, n), i != null && (h.sign !== u.sign || h.span < i) && (e[1 - n] = _n(e[n], u.sign * i)), h = yf(e, n), a != null && h.span > a && (e[1 - n] = _n(e[n], h.sign * a)), e;
}
function yf(t, e) {
  var r = t[e] - t[1 - e];
  return {
    span: Math.abs(r),
    sign: r > 0 ? -1 : r < 0 ? 1 : e ? -1 : 1
  };
}
function ni(t, e) {
  return Math.min(e[1] != null ? e[1] : 1 / 0, Math.max(e[0] != null ? e[0] : -1 / 0, t));
}
var wn = ve(), lm = ae, _f = te, _L = (
  /** @class */
  function() {
    function t() {
      this._dragging = !1, this.animationThreshold = 15;
    }
    return t.prototype.render = function(e, r, n, i) {
      var a = r.get("value"), o = r.get("status");
      if (this._axisModel = e, this._axisPointerModel = r, this._api = n, !(!i && this._lastValue === a && this._lastStatus === o)) {
        this._lastValue = a, this._lastStatus = o;
        var s = this._group, u = this._handle;
        if (!o || o === "hide") {
          s && s.hide(), u && u.hide();
          return;
        }
        s && s.show(), u && u.show();
        var l = {};
        this.makeElOption(l, a, e, r, n);
        var f = l.graphicKey;
        f !== this._lastGraphicKey && this.clear(n), this._lastGraphicKey = f;
        var h = this._moveAnimation = this.determineAnimation(e, r);
        if (!s)
          s = this._group = new Re(), this.createPointerEl(s, l, e, r), this.createLabelEl(s, l, e, r), n.getZr().add(s);
        else {
          var c = Ae(fm, r, h);
          this.updatePointerEl(s, l, c), this.updateLabelEl(s, l, c, r);
        }
        cm(s, r, !0), this._renderHandle(a);
      }
    }, t.prototype.remove = function(e) {
      this.clear(e);
    }, t.prototype.dispose = function(e) {
      this.clear(e);
    }, t.prototype.determineAnimation = function(e, r) {
      var n = r.get("animation"), i = e.axis, a = i.type === "category", o = r.get("snap");
      if (!o && !a)
        return !1;
      if (n === "auto" || n == null) {
        var s = this.animationThreshold;
        if (a && Qu(i).w > s)
          return !0;
        if (o) {
          var u = gv(e).seriesDataCount, l = i.getExtent();
          return Math.abs(l[0] - l[1]) / u > s;
        }
        return !1;
      }
      return n === !0;
    }, t.prototype.makeElOption = function(e, r, n, i, a) {
    }, t.prototype.createPointerEl = function(e, r, n, i) {
      var a = r.pointer;
      if (a) {
        var o = wn(e).pointerEl = new hC[a.type](lm(r.pointer));
        e.add(o);
      }
    }, t.prototype.createLabelEl = function(e, r, n, i) {
      if (r.label) {
        var a = wn(e).labelEl = new Je(lm(r.label));
        e.add(a), hm(a, i);
      }
    }, t.prototype.updatePointerEl = function(e, r, n) {
      var i = wn(e).pointerEl;
      i && r.pointer && (i.setStyle(r.pointer.style), n(i, {
        shape: r.pointer.shape
      }));
    }, t.prototype.updateLabelEl = function(e, r, n, i) {
      var a = wn(e).labelEl;
      a && (a.setStyle(r.label.style), n(a, {
        // Consider text length change in vertical axis, animation should
        // be used on shape, otherwise the effect will be weird.
        // TODOTODO
        // shape: elOption.label.shape,
        x: r.label.x,
        y: r.label.y
      }), hm(a, i));
    }, t.prototype._renderHandle = function(e) {
      if (!(this._dragging || !this.updateHandleTransform)) {
        var r = this._axisPointerModel, n = this._api.getZr(), i = this._handle, a = r.getModel("handle"), o = r.get("status");
        if (!a.get("show") || !o || o === "hide") {
          i && n.remove(i), this._handle = null;
          return;
        }
        var s;
        this._handle || (s = !0, i = this._handle = Ac(a.get("icon"), {
          cursor: "move",
          draggable: !0,
          onmousemove: function(l) {
            Ti(l.event);
          },
          onmousedown: _f(this._onHandleDragMove, this, 0, 0),
          drift: _f(this._onHandleDragMove, this),
          ondragend: _f(this._onHandleDragEnd, this)
        }), n.add(i)), cm(i, r, !1), i.setStyle(a.getItemStyle(null, ["color", "borderColor", "borderWidth", "opacity", "shadowColor", "shadowBlur", "shadowOffsetX", "shadowOffsetY"]));
        var u = a.get("size");
        H(u) || (u = [u, u]), i.scaleX = u[0] / 2, i.scaleY = u[1] / 2, Xu(this, "_doDispatchAxisPointer", a.get("throttle") || 0, "fixRate"), this._moveHandleToValue(e, s);
      }
    }, t.prototype._moveHandleToValue = function(e, r) {
      fm(this._axisPointerModel, !r && this._moveAnimation, this._handle, Sf(this.getHandleTransform(e, this._axisModel, this._axisPointerModel)));
    }, t.prototype._onHandleDragMove = function(e, r) {
      var n = this._handle;
      if (n) {
        this._dragging = !0;
        var i = this.updateHandleTransform(Sf(n), [e, r], this._axisModel, this._axisPointerModel);
        this._payloadInfo = i, n.stopAnimation(), n.attr(Sf(i)), wn(n).lastProp = null, this._doDispatchAxisPointer();
      }
    }, t.prototype._doDispatchAxisPointer = function() {
      var e = this._handle;
      if (e) {
        var r = this._payloadInfo, n = this._axisModel;
        this._api.dispatchAction({
          type: "updateAxisPointer",
          x: r.cursorPoint[0],
          y: r.cursorPoint[1],
          tooltipOption: r.tooltipOption,
          axesInfo: [{
            axisDim: n.axis.dim,
            axisIndex: n.componentIndex
          }]
        });
      }
    }, t.prototype._onHandleDragEnd = function() {
      this._dragging = !1;
      var e = this._handle;
      if (e) {
        var r = this._axisPointerModel.get("value");
        this._moveHandleToValue(r), this._api.dispatchAction({
          type: "hideTip"
        });
      }
    }, t.prototype.clear = function(e) {
      this._lastValue = null, this._lastStatus = null;
      var r = e.getZr(), n = this._group, i = this._handle;
      r && n && (this._lastGraphicKey = null, n && r.remove(n), i && r.remove(i), this._group = null, this._handle = null, this._payloadInfo = null), js(this, "_doDispatchAxisPointer");
    }, t.prototype.doClear = function() {
    }, t.prototype.buildLabel = function(e, r, n) {
      return n = n || 0, {
        x: e[n],
        y: e[1 - n],
        width: r[n],
        height: r[1 - n]
      };
    }, t;
  }()
);
function fm(t, e, r, n) {
  W1(wn(r).lastProp, n) || (wn(r).lastProp = n, e ? Gr(r, n, t) : (r.stopAnimation(), r.attr(n)));
}
function W1(t, e) {
  if (q(t) && q(e)) {
    var r = !0;
    return x(e, function(n, i) {
      r = r && W1(t[i], n);
    }), !!r;
  } else
    return t === e;
}
function hm(t, e) {
  t[e.get(["label", "show"]) ? "show" : "hide"]();
}
function Sf(t) {
  return {
    x: t.x || 0,
    y: t.y || 0,
    rotation: t.rotation || 0
  };
}
function cm(t, e, r) {
  var n = e.get("z"), i = e.get("zlevel");
  t && t.traverse(function(a) {
    a.type !== "group" && (n != null && (a.z = n), i != null && (a.zlevel = i), a.silent = r);
  });
}
function SL(t) {
  var e = t.get("type"), r = t.getModel(e + "Style"), n;
  return e === "line" ? (n = r.getLineStyle(), n.fill = null) : e === "shadow" && (n = r.getAreaStyle(), n.stroke = null), n;
}
function bL(t, e, r, n, i) {
  var a = r.get("value"), o = Y1(a, e.axis, e.ecModel, r.get("seriesDataIndices"), {
    precision: r.get(["label", "precision"]),
    formatter: r.get(["label", "formatter"])
  }), s = r.getModel("label"), u = Wu(s.get("padding") || 0), l = s.getFont(), f = Sy(o, l), h = i.position, c = f.width + u[1] + u[3], v = f.height + u[0] + u[2], d = i.align;
  d === "right" && (h[0] -= c), d === "center" && (h[0] -= c / 2);
  var p = i.verticalAlign;
  p === "bottom" && (h[1] -= v), p === "middle" && (h[1] -= v / 2), wL(h, c, v, n);
  var m = s.get("backgroundColor");
  (!m || m === "auto") && (m = e.get(["axisLine", "lineStyle", "color"])), t.label = {
    // shape: {x: 0, y: 0, width: width, height: height, r: labelModel.get('borderRadius')},
    x: h[0],
    y: h[1],
    style: Nn(s, {
      text: o,
      font: l,
      fill: s.getTextColor(),
      padding: u,
      backgroundColor: m
    }),
    // Label should be over axisPointer.
    z2: 10
  };
}
function wL(t, e, r, n) {
  var i = n.getWidth(), a = n.getHeight();
  t[0] = Math.min(t[0] + e, i) - e, t[1] = Math.min(t[1] + r, a) - r, t[0] = Math.max(t[0], 0), t[1] = Math.max(t[1], 0);
}
function Y1(t, e, r, n, i) {
  t = e.scale.parse(t);
  var a = e.scale.getLabel({
    value: t
  }, {
    // If `precision` is set, width can be fixed (like '12.00500'), which
    // helps to debounce when when moving label.
    precision: i.precision
  }), o = i.formatter;
  if (o) {
    var s = {
      value: hu(e, {
        value: t
      }),
      axisDimension: e.dim,
      axisIndex: e.index,
      seriesData: []
    };
    x(n, function(u) {
      var l = r.getSeriesByIndex(u.seriesIndex), f = u.dataIndexInside, h = l && l.getDataParams(f);
      h && s.seriesData.push(h);
    }), z(o) ? a = o.replace("{value}", a) : Q(o) && (a = o(s));
  }
  return a;
}
function X1(t, e, r) {
  var n = $t();
  return ic(n, n, r.rotation), Bf(n, n, r.position), Ua([t.dataToCoord(e), (r.labelOffset || 0) + (r.labelDirection || 1) * (r.labelMargin || 0)], n);
}
function TL(t, e, r, n, i, a) {
  var o = Fr.innerTextLayout(r.rotation, 0, r.labelDirection);
  r.labelMargin = i.get(["label", "margin"]), bL(e, n, i, a, {
    position: X1(n.axis, t, r),
    align: o.textAlign,
    verticalAlign: o.textVerticalAlign
  });
}
function xL(t, e, r) {
  return r = r || 0, {
    x1: t[r],
    y1: t[1 - r],
    x2: e[r],
    y2: e[1 - r]
  };
}
function CL(t, e, r) {
  return r = r || 0, {
    x: t[r],
    y: t[1 - r],
    width: e[r],
    height: e[1 - r]
  };
}
function DL(t, e, r) {
  return Qu(t, {
    fromStat: {
      sers: X(e, function(n) {
        return r.getSeriesByIndex(n.seriesIndex);
      })
    },
    min: 1
  }).w;
}
function ML(t, e, r) {
  return [ye(st(e[0], e[1]), t - r / 2), st(t + r / 2, ye(e[0], e[1]))];
}
var EL = (
  /** @class */
  function(t) {
    V(e, t);
    function e() {
      return t !== null && t.apply(this, arguments) || this;
    }
    return e.prototype.makeElOption = function(r, n, i, a, o) {
      var s = i.axis, u = s.grid, l = a.get("type"), f = s.getGlobalExtent(), h = vm(u, s).getOtherAxis(s).getGlobalExtent(), c = s.toGlobalCoord(s.dataToCoord(n, !0));
      if (l && l !== "none") {
        var v = SL(a), d = AL[l](s, c, f, h, a.get("seriesDataIndices"), a.ecModel);
        d.style = v, r.graphicKey = d.type, r.pointer = d;
      }
      var p = gu(u.getRect(), i);
      TL(n, r, p, i, a, o);
    }, e.prototype.getHandleTransform = function(r, n, i) {
      var a = gu(n.axis.grid.getRect(), n, {
        labelInside: !1
      });
      a.labelMargin = i.get(["handle", "margin"]);
      var o = X1(n.axis, r, a);
      return {
        x: o[0],
        y: o[1],
        rotation: a.rotation + (a.labelDirection < 0 ? Math.PI : 0)
      };
    }, e.prototype.updateHandleTransform = function(r, n, i, a) {
      var o = i.axis, s = o.grid, u = o.getGlobalExtent(!0), l = vm(s, o).getOtherAxis(o).getGlobalExtent(), f = o.dim === "x" ? 0 : 1, h = [r.x, r.y];
      h[f] += n[f], h[f] = st(u[1], h[f]), h[f] = ye(u[0], h[f]);
      var c = (l[1] + l[0]) / 2, v = [c, c];
      v[f] = h[f];
      var d = [{
        verticalAlign: "middle"
      }, {
        align: "center"
      }];
      return {
        x: h[0],
        y: h[1],
        rotation: r.rotation,
        cursorPoint: v,
        tooltipOption: d[f]
      };
    }, e;
  }(_L)
);
function vm(t, e) {
  var r = {};
  return r[e.dim + "AxisIndex"] = e.index, t.getCartesian(r);
}
var AL = {
  line: function(t, e, r, n) {
    var i = xL([e, n[0]], [e, n[1]], dm(t));
    return {
      type: "Line",
      subPixelOptimize: !0,
      shape: i
    };
  },
  shadow: function(t, e, r, n, i, a) {
    var o = DL(t, i, a), s = n[1] - n[0], u = ML(e, r, o), l = u[0], f = u[1];
    return {
      type: "Rect",
      shape: CL([l, n[0]], [f - l, s], dm(t))
    };
  }
};
function dm(t) {
  return t.dim === "x" ? 0 : 1;
}
var IL = (
  /** @class */
  function(t) {
    V(e, t);
    function e() {
      var r = t !== null && t.apply(this, arguments) || this;
      return r.type = e.type, r;
    }
    return e.type = "axisPointer", e.defaultOption = {
      // 'auto' means that show when triggered by tooltip or handle.
      show: "auto",
      // zlevel: 0,
      z: 50,
      type: "line",
      // axispointer triggered by tootip determine snap automatically,
      // see `modelHelper`.
      snap: !1,
      triggerTooltip: !0,
      triggerEmphasis: !0,
      value: null,
      status: null,
      link: [],
      // Do not set 'auto' here, otherwise global animation: false
      // will not effect at this axispointer.
      animation: null,
      animationDurationUpdate: 200,
      lineStyle: {
        color: G.color.border,
        width: 1,
        type: "dashed"
      },
      shadowStyle: {
        color: G.color.shadowTint
      },
      label: {
        show: !0,
        formatter: null,
        precision: "auto",
        margin: 3,
        color: G.color.neutral00,
        padding: [5, 7, 5, 7],
        backgroundColor: G.color.accent60,
        borderColor: null,
        borderWidth: 0,
        borderRadius: 3
      },
      handle: {
        show: !1,
        // eslint-disable-next-line
        icon: "M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7v-1.2h6.6z M13.3,22H6.7v-1.2h6.6z M13.3,19.6H6.7v-1.2h6.6z",
        size: 45,
        // handle margin is from symbol center to axis, which is stable when circular move.
        margin: 50,
        // color: '#1b8bbd'
        // color: '#2f4554'
        color: G.color.accent40,
        // For mobile performance
        throttle: 40
      }
    }, e;
  }(ce)
), dr = ve(), OL = x;
function Z1(t, e, r) {
  if (!re.node) {
    var n = e.getZr();
    dr(n).records || (dr(n).records = {}), LL(n, e);
    var i = dr(n).records[t] || (dr(n).records[t] = {});
    i.handler = r;
  }
}
function LL(t, e) {
  if (dr(t).initialized)
    return;
  dr(t).initialized = !0, r("click", Ae(bf, "click")), r("mousemove", Ae(bf, "mousemove")), r("mousewheel", Ae(bf, "mousewheel")), r("globalout", NL);
  function r(n, i) {
    t.on(n, function(a) {
      var o = RL(e);
      OL(dr(t).records, function(s) {
        s && i(s, a, o.dispatchAction);
      }), PL(o.pendings, e);
    });
  }
}
function PL(t, e) {
  var r = t.showTip.length, n = t.hideTip.length, i;
  r ? i = t.showTip[r - 1] : n && (i = t.hideTip[n - 1]), i && (i.dispatchAction = null, e.dispatchAction(i));
}
function NL(t, e, r) {
  t.handler("leave", null, r);
}
function bf(t, e, r, n) {
  e.handler(t, r, n);
}
function RL(t) {
  var e = {
    showTip: [],
    hideTip: []
  }, r = function(n) {
    var i = e[n.type];
    i ? i.push(n) : (n.dispatchAction = r, t.dispatchAction(n));
  };
  return {
    dispatchAction: r,
    pendings: e
  };
}
function Gh(t, e) {
  if (!re.node) {
    var r = e.getZr(), n = (dr(r).records || {})[t];
    n && (dr(r).records[t] = null);
  }
}
var kL = (
  /** @class */
  function(t) {
    V(e, t);
    function e() {
      var r = t !== null && t.apply(this, arguments) || this;
      return r.type = e.type, r;
    }
    return e.prototype.render = function(r, n, i) {
      var a = n.getComponent("tooltip"), o = r.get("triggerOn") || a && a.get("triggerOn") || "mousemove|click|mousewheel";
      Z1("axisPointer", i, function(s, u, l) {
        o !== "none" && (s === "leave" || o.indexOf(s) >= 0) && l({
          type: "updateAxisPointer",
          currTrigger: s,
          x: u && u.offsetX,
          y: u && u.offsetY
        });
      });
    }, e.prototype.remove = function(r, n) {
      Gh("axisPointer", n);
    }, e.prototype.dispose = function(r, n) {
      Gh("axisPointer", n);
    }, e.type = "axisPointer", e;
  }(Pt)
);
function $1(t, e) {
  var r = [], n = t.seriesIndex, i;
  if (n == null || !(i = e.getSeriesByIndex(n)))
    return {
      point: []
    };
  var a = i.getData(), o = Pn(a, t);
  if (o == null || o < 0 || H(o))
    return {
      point: []
    };
  var s = a.getItemGraphicEl(o), u = i.coordinateSystem;
  if (i.getTooltipPosition)
    r = i.getTooltipPosition(o) || [];
  else if (u && u.dataToPoint)
    if (t.isStacked) {
      var l = u.getBaseAxis(), f = u.getOtherAxis(l), h = f.dim, c = l.dim, v = h === "x" || h === "radius" ? 1 : 0, d = a.mapDimension(c), p = [];
      p[v] = a.get(d, o), p[1 - v] = a.get(a.getCalculationInfo("stackResultDimension"), o), r = u.dataToPoint(p) || [];
    } else
      r = u.dataToPoint(a.getValues(X(u.dimensions, function(g) {
        return a.mapDimension(g);
      }), o)) || [];
  else if (s) {
    var m = s.getBoundingRect().clone();
    m.applyTransform(s.transform), r = [m.x + m.width / 2, m.y + m.height / 2];
  }
  return {
    point: r,
    el: s
  };
}
var pm = ve();
function BL(t, e, r) {
  var n = t.currTrigger, i = [t.x, t.y], a = t, o = t.dispatchAction || te(r.dispatchAction, r), s = e.getComponent("axisPointer").coordSysAxesInfo;
  if (s) {
    Es(i) && (i = $1({
      seriesIndex: a.seriesIndex,
      // Do not use dataIndexInside from other ec instance.
      // FIXME: auto detect it?
      dataIndex: a.dataIndex
    }, e).point);
    var u = Es(i), l = a.axesInfo, f = s.axesInfo, h = n === "leave" || Es(i), c = {}, v = {}, d = {
      list: [],
      map: {}
    }, p = {
      showPointer: Ae(FL, v),
      showTooltip: Ae(zL, d)
    };
    x(s.coordSysMap, function(g, y) {
      var _ = u || g.containPoint(i);
      x(s.coordSysAxesInfo[y], function(S, b) {
        var w = S.axis, T = WL(l, S);
        if (!h && _ && (!l || T)) {
          var M = T && T.value;
          M == null && !u && (M = w.pointToData(i)), M != null && gm(S, M, p, !1, c);
        }
      });
    });
    var m = {};
    return x(f, function(g, y) {
      var _ = g.linkGroup;
      _ && !v[y] && x(_.axesInfo, function(S, b) {
        var w = v[b];
        if (S !== g && w) {
          var T = w.value;
          _.mapper && (T = g.axis.scale.parse(_.mapper(T, mm(S), mm(g)))), m[g.key] = T;
        }
      });
    }), x(m, function(g, y) {
      gm(f[y], g, p, !0, c);
    }), HL(v, f, c), GL(d, i, t, o), UL(f, o, r), c;
  }
}
function gm(t, e, r, n, i) {
  var a = t.axis;
  if (!(a.scale.isBlank() || !a.containData(e))) {
    if (!t.involveSeries) {
      r.showPointer(t, e);
      return;
    }
    var o = VL(e, t), s = o.payloadBatch, u = o.snapToValue;
    s[0] && i.seriesIndex == null && R(i, s[0]), !n && t.snap && a.containData(u) && u != null && (e = u), r.showPointer(t, e, s), r.showTooltip(t, o, u);
  }
}
function VL(t, e) {
  var r = e.axis, n = r.dim, i = t, a = [], o = Number.MAX_VALUE, s = -1;
  return x(e.seriesModels, function(u, l) {
    var f = u.getData().mapDimensionsAll(n), h, c;
    if (u.getAxisTooltipData) {
      var v = u.getAxisTooltipData(f, t, r);
      c = v.dataIndices, h = v.nestestValue;
    } else {
      if (c = u.indicesOfNearest(
        n,
        f[0],
        t,
        // Add a threshold to avoid find the wrong dataIndex
        // when data length is not same.
        // false,
        r.type === "category" ? 0.5 : null
      ), !c.length)
        return;
      h = u.getData().get(f[0], c[0]);
    }
    if (er(h)) {
      var d = t - h, p = Math.abs(d);
      p <= o && ((p < o || d >= 0 && s < 0) && (o = p, s = d, i = h, a.length = 0), x(c, function(m) {
        a.push({
          seriesIndex: u.seriesIndex,
          dataIndexInside: m,
          dataIndex: u.getData().getRawIndex(m)
        });
      }));
    }
  }), {
    payloadBatch: a,
    snapToValue: i
  };
}
function FL(t, e, r, n) {
  t[e.key] = {
    value: r,
    payloadBatch: n
  };
}
function zL(t, e, r, n) {
  var i = r.payloadBatch, a = e.axis, o = a.model, s = e.axisPointerModel;
  if (!(!e.triggerTooltip || !i.length)) {
    var u = e.coordSys.model, l = eo(u), f = t.map[l];
    f || (f = t.map[l] = {
      coordSysId: u.id,
      coordSysIndex: u.componentIndex,
      coordSysType: u.type,
      coordSysMainType: u.mainType,
      dataByAxis: []
    }, t.list.push(f)), f.dataByAxis.push({
      axisDim: a.dim,
      axisIndex: o.componentIndex,
      axisType: o.type,
      axisId: o.id,
      value: n,
      // Caution: viewHelper.getValueLabel is actually on "view stage", which
      // depends that all models have been updated. So it should not be performed
      // here. Considering axisPointerModel used here is volatile, which is hard
      // to be retrieve in TooltipView, we prepare parameters here.
      valueLabelOpt: {
        precision: s.get(["label", "precision"]),
        formatter: s.get(["label", "formatter"])
      },
      seriesDataIndices: i.slice()
    });
  }
}
function HL(t, e, r) {
  var n = r.axesInfo = [];
  x(e, function(i, a) {
    var o = i.axisPointerModel.option, s = t[a];
    s ? (!i.useHandle && (o.status = "show"), o.value = s.value, o.seriesDataIndices = (s.payloadBatch || []).slice()) : !i.useHandle && (o.status = "hide"), o.status === "show" && n.push({
      axisDim: i.axis.dim,
      axisIndex: i.axis.model.componentIndex,
      value: o.value
    });
  });
}
function GL(t, e, r, n) {
  if (Es(e) || !t.list.length) {
    n({
      type: "hideTip"
    });
    return;
  }
  var i = ((t.list[0].dataByAxis[0] || {}).seriesDataIndices || [])[0] || {};
  n({
    type: "showTip",
    escapeConnect: !0,
    x: e[0],
    y: e[1],
    tooltipOption: r.tooltipOption,
    position: r.position,
    dataIndexInside: i.dataIndexInside,
    dataIndex: i.dataIndex,
    seriesIndex: i.seriesIndex,
    dataByCoordSys: t.list
  });
}
function UL(t, e, r) {
  var n = r.getZr(), i = "axisPointerLastHighlights", a = pm(n)[i] || {}, o = pm(n)[i] = {};
  x(t, function(f, h) {
    var c = f.axisPointerModel.option;
    c.status === "show" && f.triggerEmphasis && x(c.seriesDataIndices, function(v) {
      o[v.seriesIndex + "|" + v.dataIndex] = v;
    });
  });
  var s = [], u = [];
  function l(f) {
    return {
      seriesIndex: f.seriesIndex,
      dataIndex: f.dataIndex
    };
  }
  x(a, function(f, h) {
    !o[h] && u.push(l(f));
  }), x(o, function(f, h) {
    !a[h] && s.push(l(f));
  }), u.length && r.dispatchAction({
    type: "downplay",
    escapeConnect: !0,
    // Not blur others when highlight in axisPointer.
    notBlur: !0,
    batch: u
  }), s.length && r.dispatchAction({
    type: "highlight",
    escapeConnect: !0,
    // Not blur others when highlight in axisPointer.
    notBlur: !0,
    batch: s
  });
}
function WL(t, e) {
  for (var r = 0; r < (t || []).length; r++) {
    var n = t[r];
    if (e.axis.dim === n.axisDim && e.axis.model.componentIndex === n.axisIndex)
      return n;
  }
}
function mm(t) {
  var e = t.axis.model, r = {}, n = r.axisDim = t.axis.dim;
  return r.axisIndex = r[n + "AxisIndex"] = e.componentIndex, r.axisName = r[n + "AxisName"] = e.name, r.axisId = r[n + "AxisId"] = e.id, r;
}
function Es(t) {
  return !t || t[0] == null || isNaN(t[0]) || t[1] == null || isNaN(t[1]);
}
function q1(t) {
  H1.registerAxisPointerClass("CartesianAxisPointer", EL), t.registerComponentModel(IL), t.registerComponentView(kL), t.registerPreprocessor(function(e) {
    if (e) {
      (!e.axisPointer || e.axisPointer.length === 0) && (e.axisPointer = {});
      var r = e.axisPointer.link;
      r && !H(r) && (e.axisPointer.link = [r]);
    }
  }), t.registerProcessor(t.PRIORITY.PROCESSOR.STATISTIC, {
    overallReset: function(e, r) {
      e.getComponent("axisPointer").coordSysAxesInfo = jO(e, r);
    }
  }), t.registerAction({
    type: "updateAxisPointer",
    event: "updateAxisPointer",
    update: ":updateAxisPointer"
  }, BL);
}
function YL(t) {
  nr(hL), nr(q1);
}
var ym = ["x", "y", "radius", "angle", "single"], XL = ve(), ZL = ["cartesian2d", "polar", "singleAxis"];
function $L(t) {
  var e = t.get("coordinateSystem");
  return fe(ZL, e) >= 0;
}
function Nr(t) {
  return process.env.NODE_ENV !== "production" && N(t), t + "Axis";
}
function qL(t, e) {
  var r = Z(), n = [], i = Z();
  t.eachComponent({
    mainType: "dataZoom",
    query: e
  }, function(f) {
    i.get(f.uid) || s(f);
  });
  var a;
  do
    a = !1, t.eachComponent("dataZoom", o);
  while (a);
  function o(f) {
    !i.get(f.uid) && u(f) && (s(f), a = !0);
  }
  function s(f) {
    i.set(f.uid, !0), n.push(f), l(f);
  }
  function u(f) {
    var h = !1;
    return f.eachTargetAxis(function(c, v) {
      var d = r.get(c);
      d && d[v] && (h = !0);
    }), h;
  }
  function l(f) {
    f.eachTargetAxis(function(h, c) {
      (r.get(h) || r.set(h, []))[c] = !0;
    });
  }
  return n;
}
function K1(t) {
  var e = t.ecModel, r = {
    infoList: [],
    infoMap: Z()
  };
  return t.eachTargetAxis(function(n, i) {
    var a = e.getComponent(Nr(n), i);
    if (a) {
      var o = a.getCoordSysModel();
      if (o) {
        var s = o.uid, u = r.infoMap.get(s);
        u || (u = {
          model: o,
          axisModels: []
        }, r.infoList.push(u), r.infoMap.set(s, u)), u.axisModels.push(a);
      }
    }
  }), r;
}
function Q1(t) {
  var e = XL($M(t));
  return e.axisProxyMap || (e.axisProxyMap = Z());
}
function yu(t) {
  if (t)
    return process.env.NODE_ENV !== "production" && N(t.ecModel), Q1(t.ecModel).get(t.uid);
}
function KL(t, e) {
  process.env.NODE_ENV !== "production" && N(t.ecModel), Q1(t.ecModel).set(t.uid, e);
}
function j1(t, e) {
  var r = e.getAxisModel().axis.__alignTo;
  return r && t.getAxisProxy(r.dim, r.model.componentIndex) ? yu(r.model) : null;
}
var wf = (
  /** @class */
  function() {
    function t() {
      this.indexList = [], this.indexMap = [];
    }
    return t.prototype.add = function(e) {
      this.indexMap[e] || (this.indexList.push(e), this.indexMap[e] = !0);
    }, t;
  }()
), _u = (
  /** @class */
  function(t) {
    V(e, t);
    function e() {
      var r = t !== null && t.apply(this, arguments) || this;
      return r.type = e.type, r._autoThrottle = !0, r._noTarget = !0, r._rangePropMode = ["percent", "percent"], r;
    }
    return e.prototype.init = function(r, n, i) {
      var a = _m(r);
      this.settledOption = a, this.mergeDefaultAndTheme(r, i), this._doInit(a);
    }, e.prototype.mergeOption = function(r) {
      var n = _m(r);
      Se(this.option, r, !0), Se(this.settledOption, n, !0), this._doInit(n);
    }, e.prototype._doInit = function(r) {
      var n = this.option;
      this._setDefaultThrottle(r), this._updateRangeUse(r);
      var i = this.settledOption;
      x([["start", "startValue"], ["end", "endValue"]], function(a, o) {
        this._rangePropMode[o] === "value" && (n[a[0]] = i[a[0]] = null);
      }, this), this._resetTarget();
    }, e.prototype._resetTarget = function() {
      var r = this.get("orient", !0), n = this._targetAxisInfoMap = Z(), i = this._fillSpecifiedTargetAxis(n);
      i ? this._orient = r || this._makeAutoOrientByTargetAxis() : (this._orient = r || "horizontal", this._fillAutoTargetAxisByOrient(n, this._orient)), this._noTarget = !0, n.each(function(a) {
        a.indexList.length && (this._noTarget = !1);
      }, this);
    }, e.prototype._fillSpecifiedTargetAxis = function(r) {
      var n = !1;
      return x(ym, function(i) {
        var a = this.getReferringComponents(Nr(i), Vw);
        if (a.specified) {
          n = !0;
          var o = new wf();
          x(a.models, function(s) {
            o.add(s.componentIndex);
          }), r.set(i, o);
        }
      }, this), n;
    }, e.prototype._fillAutoTargetAxisByOrient = function(r, n) {
      var i = this.ecModel, a = !0;
      if (a) {
        var o = n === "vertical" ? "y" : "x", s = i.findComponents({
          mainType: o + "Axis"
        });
        u(s, o);
      }
      if (a) {
        var s = i.findComponents({
          mainType: "singleAxis",
          filter: function(f) {
            return f.get("orient", !0) === n;
          }
        });
        u(s, "single");
      }
      function u(l, f) {
        var h = l[0];
        if (h) {
          var c = new wf();
          if (c.add(h.componentIndex), r.set(f, c), a = !1, f === "x" || f === "y") {
            var v = h.getReferringComponents("grid", qe).models[0];
            v && x(l, function(d) {
              h.componentIndex !== d.componentIndex && v === d.getReferringComponents("grid", qe).models[0] && c.add(d.componentIndex);
            });
          }
        }
      }
      a && x(ym, function(l) {
        if (a) {
          var f = i.findComponents({
            mainType: Nr(l),
            filter: function(c) {
              return c.get("type", !0) === "category";
            }
          });
          if (f[0]) {
            var h = new wf();
            h.add(f[0].componentIndex), r.set(l, h), a = !1;
          }
        }
      }, this);
    }, e.prototype._makeAutoOrientByTargetAxis = function() {
      var r;
      return this.eachTargetAxis(function(n) {
        !r && (r = n);
      }, this), r === "y" ? "vertical" : "horizontal";
    }, e.prototype._setDefaultThrottle = function(r) {
      if (r.hasOwnProperty("throttle") && (this._autoThrottle = !1), this._autoThrottle) {
        var n = this.ecModel.option;
        this.option.throttle = n.animation && n.animationDurationUpdate > 0 ? 100 : 20;
      }
    }, e.prototype._updateRangeUse = function(r) {
      var n = this._rangePropMode, i = this.get("rangeMode");
      x([["start", "startValue"], ["end", "endValue"]], function(a, o) {
        var s = r[a[0]] != null, u = r[a[1]] != null;
        s && !u ? n[o] = "percent" : !s && u ? n[o] = "value" : i ? n[o] = i[o] : s && (n[o] = "percent");
      });
    }, e.prototype.noTarget = function() {
      return this._noTarget;
    }, e.prototype.getFirstTargetAxisModel = function() {
      var r;
      return this.eachTargetAxis(function(n, i) {
        r == null && (r = this.ecModel.getComponent(Nr(n), i));
      }, this), r;
    }, e.prototype.eachTargetAxis = function(r, n) {
      this._targetAxisInfoMap.each(function(i, a) {
        x(i.indexList, function(o) {
          r.call(n, a, o);
        });
      });
    }, e.prototype.getAxisProxy = function(r, n) {
      return yu(this.getAxisModel(r, n));
    }, e.prototype.getAxisModel = function(r, n) {
      process.env.NODE_ENV !== "production" && N(r && n != null);
      var i = this._targetAxisInfoMap.get(r);
      if (i && i.indexMap[n])
        return this.ecModel.getComponent(Nr(r), n);
    }, e.prototype.setRawRange = function(r) {
      var n = this.option, i = this.settledOption;
      x([["start", "startValue"], ["end", "endValue"]], function(a) {
        (r[a[0]] != null || r[a[1]] != null) && (n[a[0]] = i[a[0]] = r[a[0]], n[a[1]] = i[a[1]] = r[a[1]]);
      }, this), this._updateRangeUse(r);
    }, e.prototype.setCalculatedRange = function(r) {
      var n = this.option;
      x(["start", "startValue", "end", "endValue"], function(i) {
        n[i] = r[i];
      });
    }, e.prototype.getPercentRange = function() {
      var r = this.findRepresentativeAxisProxy();
      if (r)
        return r.getWindow().percent;
    }, e.prototype.getValueRange = function(r, n) {
      if (r == null && n == null) {
        var i = this.findRepresentativeAxisProxy();
        if (i)
          return i.getWindow().value;
      } else
        return this.getAxisProxy(r, n).getWindow().value;
    }, e.prototype.findRepresentativeAxisProxy = function(r) {
      if (r)
        return yu(r);
      for (var n, i = this._targetAxisInfoMap.keys(), a = 0; a < i.length; a++)
        for (var o = i[a], s = this._targetAxisInfoMap.get(o), u = 0; u < s.indexList.length; u++) {
          var l = this.getAxisProxy(o, s.indexList[u]);
          if (l.hostedBy(this))
            return l;
          n || (n = l);
        }
      return n;
    }, e.prototype.getRangePropMode = function() {
      return this._rangePropMode.slice();
    }, e.prototype.getOrient = function() {
      return process.env.NODE_ENV !== "production" && N(this._orient), this._orient;
    }, e.type = "dataZoom", e.dependencies = ["xAxis", "yAxis", "radiusAxis", "angleAxis", "singleAxis", "series", "toolbox"], e.defaultOption = {
      // zlevel: 0,
      z: 4,
      filterMode: "filter",
      start: 0,
      end: 100
    }, e;
  }(ce)
);
function _m(t) {
  var e = {};
  return x(["start", "end", "startValue", "endValue", "throttle"], function(r) {
    t.hasOwnProperty(r) && (e[r] = t[r]);
  }), e;
}
var J1 = (
  /** @class */
  function(t) {
    V(e, t);
    function e() {
      var r = t !== null && t.apply(this, arguments) || this;
      return r.type = e.type, r;
    }
    return e.prototype.render = function(r, n, i, a) {
      this.dataZoomModel = r, this.ecModel = n, this.api = i;
    }, e.type = "dataZoom", e;
  }(Pt)
), QL = (
  /** @class */
  function() {
    function t(e, r, n, i) {
      this._dimName = e, this._axisIndex = r, this.ecModel = i, this._dataZoomModel = n;
    }
    return t.prototype.hostedBy = function(e) {
      return this._dataZoomModel === e;
    }, t.prototype.getWindow = function() {
      return ae(this._window);
    }, t.prototype.getTargetSeriesModels = function() {
      var e = [];
      return this.ecModel.eachSeries(function(r) {
        if ($L(r)) {
          var n = Nr(this._dimName), i = r.getReferringComponents(n, qe).models[0];
          i && this._axisIndex === i.componentIndex && e.push(r);
        }
      }, this), e;
    }, t.prototype.getAxisModel = function() {
      return this.ecModel.getComponent(this._dimName + "Axis", this._axisIndex);
    }, t.prototype.getMinMaxSpan = function() {
      return ae(this._minMaxSpan);
    }, t.prototype.calculateDataWindow = function(e) {
      var r = this._extent, n = this.getAxisModel().axis, i = n.scale, a = this._dataZoomModel, o = a.getRangePropMode(), s = [0, 100], u = [], l = [], f, h = [!1, !1];
      x(["start", "end"], function(_, S) {
        var b = e[_], w = e[_ + "Value"];
        o[S] === "percent" ? (b == null && (b = s[S]), w = Oe(b, s, r), h[S] = !0) : (f = !0, w == null ? w = r[S] : (w = i.parse(w), i.sanitize && (w = i.sanitize(w, r))), b = Oe(w, r, s)), l[S] = w == null || isNaN(w) ? r[S] : w, u[S] = b == null || isNaN(b) ? s[S] : b;
      }), Lr(l), Lr(u);
      var c = this._minMaxSpan;
      f ? v(l, u, r, s, !1) : v(u, l, s, r, !0);
      function v(_, S, b, w, T) {
        var M = T ? "Span" : "ValueSpan";
        to(0, _, b, "all", c["min" + M], c["max" + M]);
        for (var D = 0; D < 2; D++)
          S[D] = Oe(_[D], b, w, !0), T && (S[D] = S[D], h[D] = !0);
        ps(S);
      }
      var d = Mt(i) || go(i), p = n.getExtent(), m = Pe(p[1] - p[0]), g = d ? 0 : Cy(l, m, 0.5);
      x([[0, Vi], [1, Ln]], function(_) {
        var S = _[0], b = _[1];
        !h[S] || !isFinite(g) || (l[S] = ue(l[S], g), l[S] = st(r[1], ye(r[0], l[S])), u[S] === s[S] && (l[S] = r[S], d && (l[S] = b(l[S]))));
      }), ps(l);
      var y = [Oe(l[0], r, s, !0), Oe(l[1], r, s, !0)];
      return ps(y), {
        value: l,
        percent: u,
        percentInverted: y,
        valuePrecision: g
      };
    }, t.prototype.reset = function(e, r) {
      if (this.hostedBy(e)) {
        var n = this.getAxisModel().axis;
        d1(n, h1);
        var i = n.scale.rawExtentInfo;
        this._extent = i.makeNoZoom(), this._updateMinMaxSpan();
        var a = e.settledOption;
        r && (a = ge({
          start: r[0],
          end: r[1]
        }, a));
        var o = this._window = this.calculateDataWindow(a), s = o.percent, u = o.value;
        s[0] !== 0 && i.setZoomMM(0, u[0]), s[1] !== 100 && i.setZoomMM(1, u[1]);
      }
    }, t.prototype.filterData = function(e, r) {
      if (!this.hostedBy(e))
        return;
      var n = this._dimName, i = this.getTargetSeriesModels(), a = e.get("filterMode"), o = this._window.value;
      if (a === "none")
        return;
      x(i, function(u) {
        var l = u.getData(), f = l.mapDimensionsAll(n);
        if (f.length) {
          if (a === "weakFilter") {
            var h = l.getStore(), c = X(f, function(v) {
              return l.getDimensionIndex(v);
            }, l);
            l.filterSelf(function(v) {
              for (var d, p, m, g = 0; g < f.length; g++) {
                var y = h.get(c[g], v), _ = !isNaN(y), S = y < o[0], b = y > o[1];
                if (_ && !S && !b)
                  return !0;
                _ && (m = !0), S && (d = !0), b && (p = !0);
              }
              return m && d && p;
            });
          } else
            x(f, function(v) {
              if (a === "empty")
                u.setData(l = l.map(v, function(p) {
                  return s(p) ? p : NaN;
                }));
              else {
                var d = {};
                d[v] = o, l.selectRange(d);
              }
            });
          x(f, function(v) {
            l.setApproximateExtent(o, v);
          });
        }
      });
      function s(u) {
        return u >= o[0] && u <= o[1];
      }
    }, t.prototype._updateMinMaxSpan = function() {
      var e = this._minMaxSpan = {}, r = this._dataZoomModel, n = this._extent;
      x(["min", "max"], function(i) {
        var a = r.get(i + "Span"), o = r.get(i + "ValueSpan");
        o != null && (o = this.getAxisModel().axis.scale.parse(o)), o != null ? a = Oe(n[0] + o, n, [0, 100], !0) : a != null && (o = Oe(a, [0, 100], n, !0) - n[0]), e[i + "Span"] = a, e[i + "ValueSpan"] = o;
      }, this);
    }, t;
  }()
), jL = {
  dirtyOnOverallProgress: !0,
  // `dataZoomProcessor` will only be performed in needed series. Consider if
  // there is a line series and a pie series, it is better not to update the
  // line series if only pie series is needed to be updated.
  getTargetSeries: function(t) {
    function e(i) {
      t.eachComponent("dataZoom", function(a) {
        a.eachTargetAxis(function(o, s) {
          var u = t.getComponent(Nr(o), s);
          i(o, s, u, a);
        });
      });
    }
    var r = [];
    e(function(i, a, o, s) {
      if (!yu(o)) {
        var u = new QL(i, a, s, t);
        r.push(u), KL(o, u);
      }
    });
    var n = Z();
    return x(r, function(i) {
      x(i.getTargetSeriesModels(), function(a) {
        n.set(a.uid, a);
      });
    }), n;
  },
  // Consider appendData, where filter should be performed. Because data process is
  // in block mode currently, it is not need to worry about that the overallProgress
  // execute every frame.
  overallReset: function(t, e) {
    t.eachComponent("dataZoom", function(r) {
      var n = [];
      r.eachTargetAxis(function(i, a) {
        var o = r.getAxisProxy(i, a), s = j1(r, o);
        s ? n.push([o, s]) : o.reset(r, null);
      }), x(n, function(i) {
        i[0].reset(r, i[1].getWindow().percentInverted);
      }), r.eachTargetAxis(function(i, a) {
        r.getAxisProxy(i, a).filterData(r, e);
      });
    }), t.eachComponent("dataZoom", function(r) {
      var n = r.findRepresentativeAxisProxy();
      if (n) {
        var i = n.getWindow(), a = i.percent, o = i.value;
        r.setCalculatedRange({
          start: a[0],
          end: a[1],
          startValue: o[0],
          endValue: o[1]
        });
      }
    });
  }
};
function JL(t) {
  t.registerAction("dataZoom", function(e, r) {
    var n = qL(r, e);
    x(n, function(i) {
      i.setRawRange({
        start: e.start,
        end: e.end,
        startValue: e.startValue,
        endValue: e.endValue
      });
    });
  });
}
var e2 = By();
function eS(t) {
  e2(t, function() {
    t.registerProcessor(t.PRIORITY.PROCESSOR.FILTER, jL), JL(t), t.registerSubTypeDefaulter("dataZoom", function() {
      return "slider";
    });
  });
}
function t2(t, e) {
  var r = Wu(e.get("padding")), n = e.getItemStyle(["color", "opacity"]);
  n.fill = e.get("backgroundColor");
  var i = new Ce({
    shape: {
      x: t.x - r[3],
      y: t.y - r[0],
      width: t.width + r[1] + r[3],
      height: t.height + r[0] + r[2],
      r: e.get("borderRadius")
    },
    style: n,
    silent: !0,
    z2: -1
  });
  return i;
}
var r2 = (
  /** @class */
  function(t) {
    V(e, t);
    function e() {
      var r = t !== null && t.apply(this, arguments) || this;
      return r.type = e.type, r;
    }
    return e.type = "tooltip", e.dependencies = ["axisPointer"], e.defaultOption = {
      // zlevel: 0,
      z: 60,
      show: !0,
      // tooltip main content
      showContent: !0,
      // 'trigger' only works on coordinate system.
      // 'item' | 'axis' | 'none'
      trigger: "item",
      // 'click' | 'mousemove' | 'none'
      triggerOn: "mousemove|click|mousewheel",
      alwaysShowContent: !1,
      renderMode: "auto",
      // whether restraint content inside viewRect.
      // If renderMode: 'richText', default true.
      // If renderMode: 'html', defaults to `false` (for backward compat).
      confine: null,
      showDelay: 0,
      hideDelay: 100,
      // Animation transition time, unit is second
      transitionDuration: 0.4,
      displayTransition: !0,
      enterable: !1,
      backgroundColor: G.color.neutral00,
      // box shadow
      shadowBlur: 10,
      shadowColor: "rgba(0, 0, 0, .2)",
      shadowOffsetX: 1,
      shadowOffsetY: 2,
      // tooltip border radius, unit is px, default is 4
      borderRadius: 4,
      // tooltip border width, unit is px, default is 0 (no border)
      borderWidth: 1,
      defaultBorderColor: G.color.border,
      // Tooltip inside padding, default is 5 for all direction
      // Array is allowed to set up, right, bottom, left, same with css
      // The default value: See `tooltip/tooltipMarkup.ts#getPaddingFromTooltipModel`.
      padding: null,
      // Extra css text
      extraCssText: "",
      // axis indicator, trigger by axis
      axisPointer: {
        // default is line
        // legal values: 'line' | 'shadow' | 'cross'
        type: "line",
        // Valid when type is line, appoint tooltip line locate on which line. Optional
        // legal values: 'x' | 'y' | 'angle' | 'radius' | 'auto'
        // default is 'auto', chose the axis which type is category.
        // for multiply y axis, cartesian coord chose x axis, polar chose angle axis
        axis: "auto",
        animation: "auto",
        animationDurationUpdate: 200,
        animationEasingUpdate: "exponentialOut",
        crossStyle: {
          color: G.color.borderShade,
          width: 1,
          type: "dashed",
          // TODO formatter
          textStyle: {}
        }
        // lineStyle and shadowStyle should not be specified here,
        // otherwise it will always override those styles on option.axisPointer.
      },
      textStyle: {
        color: G.color.tertiary,
        fontSize: 14
      }
    }, e;
  }(ce)
);
function tS(t) {
  var e = t.get("confine");
  return e != null ? !!e : t.get("renderMode") === "richText";
}
function rS(t) {
  if (re.domSupported) {
    for (var e = document.documentElement.style, r = 0, n = t.length; r < n; r++)
      if (t[r] in e)
        return t[r];
  }
}
var nS = rS(["transform", "webkitTransform", "OTransform", "MozTransform", "msTransform"]), n2 = rS(["webkitTransition", "transition", "OTransition", "MozTransition", "msTransition"]);
function iS(t, e) {
  if (!t)
    return e;
  e = G0(e, !0);
  var r = t.indexOf(e);
  return t = r === -1 ? e : "-" + t.slice(0, r) + "-" + e, t.toLowerCase();
}
function i2(t, e) {
  var r = t.currentStyle || document.defaultView && document.defaultView.getComputedStyle(t);
  return r ? r[e] : null;
}
var a2 = iS(n2, "transition"), mv = iS(nS, "transform"), o2 = "position:absolute;display:block;border-style:solid;white-space:nowrap;z-index:9999999;" + (re.transform3dSupported ? "will-change:transform;" : "");
function s2(t) {
  return t = t === "left" ? "right" : t === "right" ? "left" : t === "top" ? "bottom" : "top", t;
}
function u2(t, e, r) {
  if (!z(r) || r === "inside")
    return "";
  var n = t.get("backgroundColor"), i = t.get("borderWidth");
  e = kn(e);
  var a = s2(r), o = Math.max(Math.round(i) * 1.5, 6), s = "", u = mv + ":", l;
  fe(["left", "right"], a) > -1 ? (s += "top:50%", u += "translateY(-50%) rotate(" + (l = a === "left" ? -225 : -45) + "deg)") : (s += "left:50%", u += "translateX(-50%) rotate(" + (l = a === "top" ? 225 : 45) + "deg)");
  var f = l * Math.PI / 180, h = o + i, c = h * Math.abs(Math.cos(f)) + h * Math.abs(Math.sin(f)), v = Math.round(((c - Math.SQRT2 * i) / 2 + Math.SQRT2 * i - (c - h) / 2) * 100) / 100;
  s += ";" + a + ":-" + v + "px";
  var d = e + " solid " + i + "px;", p = ["position:absolute;width:" + o + "px;height:" + o + "px;z-index:-1;", s + ";" + u + ";", "border-bottom:" + d, "border-right:" + d, "background-color:" + n + ";"];
  return '<div style="' + p.join("") + '"></div>';
}
function l2(t, e, r) {
  var n = "cubic-bezier(0.23,1,0.32,1)", i = "", a = "";
  return r && (i = " " + t / 2 + "s " + n, a = "opacity" + i + ",visibility" + i), e || (i = " " + t + "s " + n, a += (a.length ? "," : "") + (re.transformSupported ? "" + mv + i : ",left" + i + ",top" + i)), a2 + ":" + a;
}
function Sm(t, e, r) {
  var n = t.toFixed(0) + "px", i = e.toFixed(0) + "px";
  if (!re.transformSupported)
    return r ? "top:" + i + ";left:" + n + ";" : [["top", i], ["left", n]];
  var a = re.transform3dSupported, o = "translate" + (a ? "3d" : "") + "(" + n + "," + i + (a ? ",0" : "") + ")";
  return r ? "top:0;left:0;" + mv + ":" + o + ";" : [["top", 0], ["left", 0], [nS, o]];
}
function f2(t) {
  var e = [], r = t.get("fontSize"), n = t.getTextColor();
  n && e.push("color:" + n), e.push("font:" + t.getFont());
  var i = W(t.get("lineHeight"), Math.round(r * 3 / 2));
  r && e.push("line-height:" + i + "px");
  var a = t.get("textShadowColor"), o = t.get("textShadowBlur") || 0, s = t.get("textShadowOffsetX") || 0, u = t.get("textShadowOffsetY") || 0;
  return a && o && e.push("text-shadow:" + s + "px " + u + "px " + o + "px " + a), x(["decoration", "align"], function(l) {
    var f = t.get(l);
    f && e.push("text-" + l + ":" + f);
  }), e.join(";");
}
function h2(t, e, r, n) {
  var i = [], a = t.get("transitionDuration"), o = t.get("backgroundColor"), s = t.get("shadowBlur"), u = t.get("shadowColor"), l = t.get("shadowOffsetX"), f = t.get("shadowOffsetY"), h = t.getModel("textStyle"), c = d_(t, "html"), v = l + "px " + f + "px " + s + "px " + u;
  return i.push("box-shadow:" + v), e && a > 0 && i.push(l2(a, r, n)), o && i.push("background-color:" + o), x(["width", "color", "radius"], function(d) {
    var p = "border-" + d, m = G0(p), g = t.get(m);
    g != null && i.push(p + ":" + g + (d === "color" ? "" : "px"));
  }), i.push(f2(h)), c != null && i.push("padding:" + Wu(c).join("px ") + "px"), i.join(";") + ";";
}
function bm(t, e, r, n, i) {
  var a = e && e.painter;
  if (r) {
    var o = a && a.getViewportRoot();
    o && JS(t, o, r, n, i);
  } else {
    t[0] = n, t[1] = i;
    var s = a && a.getViewportRootOffset();
    s && (t[0] += s.offsetLeft, t[1] += s.offsetTop);
  }
  t[2] = t[0] / e.getWidth(), t[3] = t[1] / e.getHeight();
}
var c2 = (
  /** @class */
  function() {
    function t(e, r) {
      if (this._show = !1, this._styleCoord = [0, 0, 0, 0], this._enterable = !0, this._alwaysShowContent = !1, this._firstShow = !0, this._longHide = !0, re.wxa)
        return null;
      var n = document.createElement("div");
      n.domBelongToZr = !0, this.el = n;
      var i = this._zr = e.getZr(), a = r.appendTo, o = a && (z(a) ? document.querySelector(a) : Si(a) ? a : Q(a) && a(e.getDom()));
      bm(this._styleCoord, i, o, e.getWidth() / 2, e.getHeight() / 2), (o || e.getDom()).appendChild(n), this._api = e, this._container = o;
      var s = this;
      n.onmouseenter = function() {
        s._enterable && (clearTimeout(s._hideTimeout), s._show = !0), s._inContent = !0;
      }, n.onmousemove = function(u) {
        if (u = u || window.event, !s._enterable) {
          var l = i.handler, f = i.painter.getViewportRoot();
          pt(f, u, !0), l.dispatch("mousemove", u);
        }
      }, n.onmouseleave = function() {
        s._inContent = !1, s._enterable && s._show && s.hideLater(s._hideDelay);
      };
    }
    return t.prototype.update = function(e) {
      if (!this._container) {
        var r = this._api.getDom(), n = i2(r, "position"), i = r.style;
        i.position !== "absolute" && n !== "absolute" && (i.position = "relative");
      }
      var a = e.get("alwaysShowContent");
      a && this._moveIfResized(), this._alwaysShowContent = a, this._enableDisplayTransition = e.get("displayTransition") && e.get("transitionDuration") > 0, this.el.className = e.get("className") || "";
    }, t.prototype.show = function(e, r) {
      clearTimeout(this._hideTimeout), clearTimeout(this._longHideTimeout);
      var n = this.el, i = n.style, a = this._styleCoord;
      n.innerHTML ? i.cssText = o2 + h2(e, !this._firstShow, this._longHide, this._enableDisplayTransition) + Sm(a[0], a[1], !0) + ("border-color:" + kn(r) + ";") + (e.get("extraCssText") || "") + (";pointer-events:" + (this._enterable ? "auto" : "none")) : i.display = "none", this._show = !0, this._firstShow = !1, this._longHide = !1;
    }, t.prototype.setContent = function(e, r, n, i, a) {
      var o = this.el;
      if (e == null) {
        o.innerHTML = "";
        return;
      }
      var s = "";
      if (z(a) && n.get("trigger") === "item" && !tS(n) && (s = u2(n, i, a)), z(e))
        o.innerHTML = e + s;
      else if (e) {
        o.innerHTML = "", H(e) || (e = [e]);
        for (var u = 0; u < e.length; u++)
          Si(e[u]) && e[u].parentNode !== o && o.appendChild(e[u]);
        if (s && o.childNodes.length) {
          var l = document.createElement("div");
          l.innerHTML = s, o.appendChild(l);
        }
      }
    }, t.prototype.setEnterable = function(e) {
      this._enterable = e;
    }, t.prototype.getSize = function() {
      var e = this.el;
      return e ? [e.offsetWidth, e.offsetHeight] : [0, 0];
    }, t.prototype.moveTo = function(e, r) {
      if (this.el) {
        var n = this._styleCoord;
        if (bm(n, this._zr, this._container, e, r), n[0] != null && n[1] != null) {
          var i = this.el.style, a = Sm(n[0], n[1]);
          x(a, function(o) {
            i[o[0]] = o[1];
          });
        }
      }
    }, t.prototype._moveIfResized = function() {
      var e = this._styleCoord[2], r = this._styleCoord[3];
      this.moveTo(e * this._zr.getWidth(), r * this._zr.getHeight());
    }, t.prototype.hide = function() {
      var e = this, r = this.el.style;
      this._enableDisplayTransition ? (r.visibility = "hidden", r.opacity = "0") : r.display = "none", re.transform3dSupported && (r.willChange = ""), this._show = !1, this._longHideTimeout = setTimeout(function() {
        return e._longHide = !0;
      }, 500);
    }, t.prototype.hideLater = function(e) {
      this._show && !(this._inContent && this._enterable) && !this._alwaysShowContent && (e ? (this._hideDelay = e, this._show = !1, this._hideTimeout = setTimeout(te(this.hide, this), e)) : this.hide());
    }, t.prototype.isShow = function() {
      return this._show;
    }, t.prototype.dispose = function() {
      clearTimeout(this._hideTimeout), clearTimeout(this._longHideTimeout);
      var e = this._zr;
      eb(e && e.painter && e.painter.getViewportRoot(), this._container);
      var r = this.el;
      if (r) {
        r.onmouseenter = r.onmousemove = r.onmouseleave = null;
        var n = r.parentNode;
        n && n.removeChild(r);
      }
      this.el = this._container = null;
    }, t;
  }()
), v2 = (
  /** @class */
  function() {
    function t(e) {
      this._show = !1, this._styleCoord = [0, 0, 0, 0], this._alwaysShowContent = !1, this._enterable = !0, this._zr = e.getZr(), Tm(this._styleCoord, this._zr, e.getWidth() / 2, e.getHeight() / 2);
    }
    return t.prototype.update = function(e) {
      var r = e.get("alwaysShowContent");
      r && this._moveIfResized(), this._alwaysShowContent = r;
    }, t.prototype.show = function() {
      this._hideTimeout && clearTimeout(this._hideTimeout), this.el.show(), this._show = !0;
    }, t.prototype.setContent = function(e, r, n, i, a) {
      var o = this;
      q(e) && it(process.env.NODE_ENV !== "production" ? "Passing DOM nodes as content is not supported in richText tooltip!" : ""), this.el && this._zr.remove(this.el);
      var s = n.getModel("textStyle");
      this.el = new Je({
        style: {
          rich: r.richTextStyles,
          text: e,
          lineHeight: 22,
          borderWidth: 1,
          borderColor: i,
          textShadowColor: s.get("textShadowColor"),
          fill: n.get(["textStyle", "color"]),
          padding: d_(n, "richText"),
          verticalAlign: "top",
          align: "left"
        },
        z: n.get("z")
      }), x(["backgroundColor", "borderRadius", "shadowColor", "shadowBlur", "shadowOffsetX", "shadowOffsetY"], function(l) {
        o.el.style[l] = n.get(l);
      }), x(["textShadowBlur", "textShadowOffsetX", "textShadowOffsetY"], function(l) {
        o.el.style[l] = s.get(l) || 0;
      }), this._zr.add(this.el);
      var u = this;
      this.el.on("mouseover", function() {
        u._enterable && (clearTimeout(u._hideTimeout), u._show = !0), u._inContent = !0;
      }), this.el.on("mouseout", function() {
        u._enterable && u._show && u.hideLater(u._hideDelay), u._inContent = !1;
      });
    }, t.prototype.setEnterable = function(e) {
      this._enterable = e;
    }, t.prototype.getSize = function() {
      var e = this.el, r = this.el.getBoundingRect(), n = wm(e.style);
      return [r.width + n.left + n.right, r.height + n.top + n.bottom];
    }, t.prototype.moveTo = function(e, r) {
      var n = this.el;
      if (n) {
        var i = this._styleCoord;
        Tm(i, this._zr, e, r), e = i[0], r = i[1];
        var a = n.style, o = Ar(a.borderWidth || 0), s = wm(a);
        n.x = e + o + s.left, n.y = r + o + s.top, n.markRedraw();
      }
    }, t.prototype._moveIfResized = function() {
      var e = this._styleCoord[2], r = this._styleCoord[3];
      this.moveTo(e * this._zr.getWidth(), r * this._zr.getHeight());
    }, t.prototype.hide = function() {
      this.el && this.el.hide(), this._show = !1;
    }, t.prototype.hideLater = function(e) {
      this._show && !(this._inContent && this._enterable) && !this._alwaysShowContent && (e ? (this._hideDelay = e, this._show = !1, this._hideTimeout = setTimeout(te(this.hide, this), e)) : this.hide());
    }, t.prototype.isShow = function() {
      return this._show;
    }, t.prototype.dispose = function() {
      this._zr.remove(this.el);
    }, t;
  }()
);
function Ar(t) {
  return Math.max(0, t);
}
function wm(t) {
  var e = Ar(t.shadowBlur || 0), r = Ar(t.shadowOffsetX || 0), n = Ar(t.shadowOffsetY || 0);
  return {
    left: Ar(e - r),
    right: Ar(e + r),
    top: Ar(e - n),
    bottom: Ar(e + n)
  };
}
function Tm(t, e, r, n) {
  t[0] = r, t[1] = n, t[2] = t[0] / e.getWidth(), t[3] = t[1] / e.getHeight();
}
var d2 = new Ce({
  shape: {
    x: -1,
    y: -1,
    width: 2,
    height: 2
  }
}), p2 = (
  /** @class */
  function(t) {
    V(e, t);
    function e() {
      var r = t !== null && t.apply(this, arguments) || this;
      return r.type = e.type, r;
    }
    return e.prototype.init = function(r, n) {
      if (!(re.node || !n.getDom())) {
        var i = r.getComponent("tooltip"), a = this._renderMode = Hw(i.get("renderMode"));
        this._tooltipContent = a === "richText" ? new v2(n) : new c2(n, {
          appendTo: i.get("appendToBody", !0) ? "body" : i.get("appendTo", !0)
        });
      }
    }, e.prototype.render = function(r, n, i) {
      if (!(re.node || !i.getDom())) {
        this.group.removeAll(), this._tooltipModel = r, this._ecModel = n, this._api = i;
        var a = this._tooltipContent;
        a.update(r), a.setEnterable(r.get("enterable")), this._initGlobalListener(), this._keepShow(), this._renderMode !== "richText" && r.get("transitionDuration") ? Xu(this, "_updatePosition", 50, "fixRate") : js(this, "_updatePosition");
      }
    }, e.prototype._initGlobalListener = function() {
      var r = this._tooltipModel, n = r.get("triggerOn");
      Z1("itemTooltip", this._api, te(function(i, a, o) {
        n !== "none" && (n.indexOf(i) >= 0 ? this._tryShow(a, o) : i === "leave" && this._hide(o));
      }, this));
    }, e.prototype._keepShow = function() {
      var r = this._tooltipModel, n = this._ecModel, i = this._api, a = r.get("triggerOn");
      if (r.get("trigger") !== "axis" && (this._lastDataByCoordSys = null, this._cbParamsList = null), this._lastX != null && this._lastY != null && a !== "none" && a !== "click") {
        var o = this;
        clearTimeout(this._refreshUpdateTimeout), this._refreshUpdateTimeout = setTimeout(function() {
          !i.isDisposed() && o.manuallyShowTip(r, n, i, {
            x: o._lastX,
            y: o._lastY,
            dataByCoordSys: o._lastDataByCoordSys
          });
        });
      }
    }, e.prototype.manuallyShowTip = function(r, n, i, a) {
      if (!(a.from === this.uid || re.node || !i.getDom())) {
        var o = xm(a, i);
        this._ticket = "";
        var s = a.dataByCoordSys, u = _2(a, n, i);
        if (u) {
          var l = u.el.getBoundingRect().clone();
          l.applyTransform(u.el.transform), this._tryShow({
            offsetX: l.x + l.width / 2,
            offsetY: l.y + l.height / 2,
            target: u.el,
            position: a.position,
            // When manully trigger, the mouse is not on the el, so we'd better to
            // position tooltip on the bottom of the el and display arrow is possible.
            positionDefault: "bottom"
          }, o);
        } else if (a.tooltip && a.x != null && a.y != null) {
          var f = d2;
          f.x = a.x, f.y = a.y, f.update(), me(f).tooltipConfig = {
            name: null,
            option: a.tooltip
          }, this._tryShow({
            offsetX: a.x,
            offsetY: a.y,
            target: f
          }, o);
        } else if (s)
          this._tryShow({
            offsetX: a.x,
            offsetY: a.y,
            position: a.position,
            dataByCoordSys: s,
            tooltipOption: a.tooltipOption
          }, o);
        else if (a.seriesIndex != null) {
          if (this._manuallyAxisShowTip(r, n, i, a))
            return;
          var h = $1(a, n), c = h.point[0], v = h.point[1];
          c != null && v != null && this._tryShow({
            offsetX: c,
            offsetY: v,
            target: h.el,
            position: a.position,
            // When manully trigger, the mouse is not on the el, so we'd better to
            // position tooltip on the bottom of the el and display arrow is possible.
            positionDefault: "bottom"
          }, o);
        } else a.x != null && a.y != null && (i.dispatchAction({
          type: "updateAxisPointer",
          x: a.x,
          y: a.y
        }), this._tryShow({
          offsetX: a.x,
          offsetY: a.y,
          position: a.position,
          target: i.getZr().findHover(a.x, a.y).target
        }, o));
      }
    }, e.prototype.manuallyHideTip = function(r, n, i, a) {
      var o = this._tooltipContent;
      this._tooltipModel && o.hideLater(this._tooltipModel.get("hideDelay")), this._lastX = this._lastY = this._lastDataByCoordSys = null, this._cbParamsList = null, a.from !== this.uid && this._hide(xm(a, i));
    }, e.prototype._manuallyAxisShowTip = function(r, n, i, a) {
      var o = a.seriesIndex, s = a.dataIndex, u = n.getComponent("axisPointer").coordSysAxesInfo;
      if (!(o == null || s == null || u == null)) {
        var l = n.getSeriesByIndex(o);
        if (l) {
          var f = l.getData(), h = fa([f.getItemModel(s), l, (l.coordinateSystem || {}).model], this._tooltipModel);
          if (h.get("trigger") === "axis")
            return i.dispatchAction({
              type: "updateAxisPointer",
              seriesIndex: o,
              dataIndex: s,
              position: a.position
            }), !0;
        }
      }
    }, e.prototype._tryShow = function(r, n) {
      var i = r.target, a = this._tooltipModel;
      if (a) {
        this._lastX = r.offsetX, this._lastY = r.offsetY;
        var o = r.dataByCoordSys;
        if (o && o.length)
          this._showAxisTooltip(o, r);
        else if (i) {
          var s = me(i);
          if (s.ssrType === "legend")
            return;
          this._lastDataByCoordSys = null, this._cbParamsList = null;
          var u, l;
          ba(i, function(f) {
            if (f.tooltipDisabled)
              return u = l = null, !0;
            u || l || (me(f).dataIndex != null ? u = f : me(f).tooltipConfig != null && (l = f));
          }, !0), u ? this._showSeriesItemTooltip(r, u, n) : l ? this._showComponentItemTooltip(r, l, n) : this._hide(n);
        } else
          this._lastDataByCoordSys = null, this._cbParamsList = null, this._hide(n);
      }
    }, e.prototype._showOrMove = function(r, n) {
      var i = r.get("showDelay");
      n = te(n, this), clearTimeout(this._showTimout), i > 0 ? this._showTimout = setTimeout(n, i) : n();
    }, e.prototype._showAxisTooltip = function(r, n) {
      var i = this._ecModel, a = this._tooltipModel, o = [n.offsetX, n.offsetY], s = fa([n.tooltipOption], a), u = this._renderMode, l = [], f = $a("section", {
        blocks: [],
        noHeader: !0
      }), h = [], c = new tf();
      x(r, function(y) {
        x(y.dataByAxis, function(_) {
          var S = i.getComponent(_.axisDim + "Axis", _.axisIndex), b = _.value, w = S.axis, T = w.scale.parse(b);
          if (!(!S || b == null)) {
            var M = Y1(b, w, i, _.seriesDataIndices, _.valueLabelOpt), D = $a("section", {
              header: M,
              noHeader: !Yt(M),
              sortBlocks: !0,
              blocks: []
            });
            f.blocks.push(D), x(_.seriesDataIndices, function(C) {
              var E = i.getSeriesByIndex(C.seriesIndex), I = C.dataIndexInside, A = E.getDataParams(I);
              if (!(A.dataIndex < 0)) {
                A.axisDim = _.axisDim, A.axisIndex = _.axisIndex, A.axisType = _.axisType, A.axisId = _.axisId, A.axisValue = hu(S.axis, {
                  value: T
                }), A.axisValueLabel = M, A.marker = c.makeTooltipMarker("item", kn(A.color), u);
                var O = Op(E.formatTooltip(I, !0, null)), P = O.frag;
                if (P) {
                  var L = fa([E], a).get("valueFormatter");
                  D.blocks.push(L ? R({
                    valueFormatter: L
                  }, P) : P);
                }
                O.text && h.push(O.text), l.push(A);
              }
            });
          }
        });
      }), f.blocks.reverse(), h.reverse();
      var v = n.position, d = s.get("order"), p = kp(f, c, u, d, i.get("useUTC"), s.get("textStyle"));
      p && h.unshift(p);
      var m = u === "richText" ? `

` : "<br/>", g = h.join(m);
      this._showOrMove(s, function() {
        this._updateContentNotChangedOnAxis(r, l) ? this._updatePosition(s, v, o[0], o[1], this._tooltipContent, l) : this._showTooltipContent(s, g, l, Math.random() + "", o[0], o[1], v, null, c);
      });
    }, e.prototype._showSeriesItemTooltip = function(r, n, i) {
      var a = this._ecModel, o = me(n), s = o.seriesIndex, u = a.getSeriesByIndex(s), l = o.dataModel || u, f = o.dataIndex, h = o.dataType, c = l.getData(h), v = this._renderMode, d = r.positionDefault, p = fa([c.getItemModel(f), l, u && (u.coordinateSystem || {}).model], this._tooltipModel, d ? {
        position: d
      } : null), m = p.get("trigger");
      if (!(m != null && m !== "item")) {
        var g = l.getDataParams(f, h), y = new tf();
        g.marker = y.makeTooltipMarker("item", kn(g.color), v);
        var _ = Op(l.formatTooltip(f, !1, h)), S = p.get("order"), b = p.get("valueFormatter"), w = _.frag, T = w ? kp(b ? R({
          valueFormatter: b
        }, w) : w, y, v, S, a.get("useUTC"), p.get("textStyle")) : _.text, M = "item_" + l.name + "_" + f;
        this._showOrMove(p, function() {
          this._showTooltipContent(p, T, g, M, r.offsetX, r.offsetY, r.position, r.target, y);
        }), i({
          type: "showTip",
          dataIndexInside: f,
          dataIndex: c.getRawIndex(f),
          seriesIndex: s,
          from: this.uid
        });
      }
    }, e.prototype._showComponentItemTooltip = function(r, n, i) {
      var a = this._renderMode === "html", o = me(n), s = o.tooltipConfig, u = s.option || {}, l = u.encodeHTMLContent;
      if (z(u)) {
        var f = u;
        u = {
          content: f,
          // Fixed formatter
          formatter: f
        }, l = !0;
      }
      l && a && u.content && (u = ae(u), u.content = $e(u.content));
      var h = [u], c = this._ecModel.getComponent(o.componentMainType, o.componentIndex);
      c && h.push(c), h.push({
        formatter: u.content
      });
      var v = r.positionDefault, d = fa(h, this._tooltipModel, v ? {
        position: v
      } : null), p = d.get("content"), m = Math.random() + "", g = new tf();
      this._showOrMove(d, function() {
        var y = ae(d.get("formatterParams") || {});
        this._showTooltipContent(d, p, y, m, r.offsetX, r.offsetY, r.position, n, g);
      }), i({
        type: "showTip",
        from: this.uid
      });
    }, e.prototype._showTooltipContent = function(r, n, i, a, o, s, u, l, f) {
      if (this._ticket = "", !(!r.get("showContent") || !r.get("show"))) {
        var h = this._tooltipContent;
        h.setEnterable(r.get("enterable"));
        var c = r.get("formatter");
        u = u || r.get("position");
        var v = n, d = this._getNearestPoint([o, s], i, r.get("trigger"), r.get("borderColor"), r.get("defaultBorderColor", !0)), p = d.color;
        if (c)
          if (z(c)) {
            var m = r.ecModel.get("useUTC"), g = H(i) ? i[0] : i, y = g && g.axisType && g.axisType.indexOf("time") >= 0;
            v = c, y && (v = Uu(g.axisValue, v, m)), v = U0(v, i, !0);
          } else if (Q(c)) {
            var _ = te(function(S, b) {
              S === this._ticket && (h.setContent(b, f, r, p, u), this._updatePosition(r, u, o, s, h, i, l));
            }, this);
            this._ticket = a, v = c(i, a, _);
          } else
            v = c;
        h.setContent(v, f, r, p, u), h.show(r, p), this._updatePosition(r, u, o, s, h, i, l);
      }
    }, e.prototype._getNearestPoint = function(r, n, i, a, o) {
      if (i === "axis" || H(n))
        return {
          color: a || o
        };
      if (!H(n))
        return {
          color: a || n.color || n.borderColor
        };
    }, e.prototype._updatePosition = function(r, n, i, a, o, s, u) {
      var l = this._api.getWidth(), f = this._api.getHeight();
      n = n || r.get("position");
      var h = o.getSize(), c = r.get("align"), v = r.get("verticalAlign"), d = u && u.getBoundingRect().clone();
      if (u && d.applyTransform(u.transform), Q(n) && (n = n([i, a], s, o.el, d, {
        viewSize: [l, f],
        contentSize: h.slice()
      })), H(n))
        i = _t(n[0], l), a = _t(n[1], f);
      else if (q(n)) {
        var p = n;
        p.width = h[0], p.height = h[1];
        var m = Ii(p, {
          width: l,
          height: f
        });
        i = m.x, a = m.y, c = null, v = null;
      } else if (z(n) && u) {
        var g = y2(n, d, h, r.get("borderWidth"));
        i = g[0], a = g[1];
      } else {
        var g = g2(i, a, o, l, f, c ? null : 20, v ? null : 20);
        i = g[0], a = g[1];
      }
      if (c && (i -= Cm(c) ? h[0] / 2 : c === "right" ? h[0] : 0), v && (a -= Cm(v) ? h[1] / 2 : v === "bottom" ? h[1] : 0), tS(r)) {
        var g = m2(i, a, o, l, f);
        i = g[0], a = g[1];
      }
      o.moveTo(i, a);
    }, e.prototype._updateContentNotChangedOnAxis = function(r, n) {
      var i = this._lastDataByCoordSys, a = this._cbParamsList, o = !!i && i.length === r.length;
      return o && x(i, function(s, u) {
        var l = s.dataByAxis || [], f = r[u] || {}, h = f.dataByAxis || [];
        o = o && l.length === h.length, o && x(l, function(c, v) {
          var d = h[v] || {}, p = c.seriesDataIndices || [], m = d.seriesDataIndices || [];
          o = o && c.value === d.value && c.axisType === d.axisType && c.axisId === d.axisId && p.length === m.length, o && x(p, function(g, y) {
            var _ = m[y];
            o = o && g.seriesIndex === _.seriesIndex && g.dataIndex === _.dataIndex;
          }), a && x(c.seriesDataIndices, function(g) {
            var y = g.seriesIndex, _ = n[y], S = a[y];
            _ && S && S.data !== _.data && (o = !1);
          });
        });
      }), this._lastDataByCoordSys = r, this._cbParamsList = n, !!o;
    }, e.prototype._hide = function(r) {
      this._lastDataByCoordSys = null, this._cbParamsList = null, r({
        type: "hideTip",
        from: this.uid
      });
    }, e.prototype.dispose = function(r, n) {
      re.node || !n.getDom() || (js(this, "_updatePosition"), this._tooltipContent.dispose(), Gh("itemTooltip", n), this._tooltipContent = null, this._tooltipModel = null, this._lastDataByCoordSys = null, this._cbParamsList = null);
    }, e.type = "tooltip", e;
  }(Pt)
);
function fa(t, e, r) {
  var n = e.ecModel, i;
  r ? (i = new xe(r, n, n), i = new xe(e.option, i, n)) : i = e;
  for (var a = t.length - 1; a >= 0; a--) {
    var o = t[a];
    o && (o instanceof xe && (o = o.get("tooltip", !0)), z(o) && (o = {
      formatter: o
    }), o && (i = new xe(o, i, n)));
  }
  return i;
}
function xm(t, e) {
  return t.dispatchAction || te(e.dispatchAction, e);
}
function g2(t, e, r, n, i, a, o) {
  var s = r.getSize(), u = s[0], l = s[1];
  return a != null && (t + u + a + 2 > n ? t -= u + a : t += a), o != null && (e + l + o > i ? e -= l + o : e += o), [t, e];
}
function m2(t, e, r, n, i) {
  var a = r.getSize(), o = a[0], s = a[1];
  return t = Math.min(t + o, n) - o, e = Math.min(e + s, i) - s, t = Math.max(t, 0), e = Math.max(e, 0), [t, e];
}
function y2(t, e, r, n) {
  var i = r[0], a = r[1], o = Math.ceil(Math.SQRT2 * n) + 8, s = 0, u = 0, l = e.width, f = e.height;
  switch (t) {
    case "inside":
      s = e.x + l / 2 - i / 2, u = e.y + f / 2 - a / 2;
      break;
    case "top":
      s = e.x + l / 2 - i / 2, u = e.y - a - o;
      break;
    case "bottom":
      s = e.x + l / 2 - i / 2, u = e.y + f + o;
      break;
    case "left":
      s = e.x - i - o, u = e.y + f / 2 - a / 2;
      break;
    case "right":
      s = e.x + l + o, u = e.y + f / 2 - a / 2;
  }
  return [s, u];
}
function Cm(t) {
  return t === "center" || t === "middle";
}
function _2(t, e, r) {
  var n = cc(t).queryOptionMap, i = n.keys()[0];
  if (!(!i || i === "series")) {
    var a = fo(e, i, n.get(i), {
      useDefault: !1,
      enableAll: !1,
      enableNone: !1
    }), o = a.models[0];
    if (o) {
      var s = r.getViewOfComponentModel(o), u;
      if (s.group.traverse(function(l) {
        var f = me(l).tooltipConfig;
        if (f && f.name === t.name)
          return u = l, !0;
      }), u)
        return {
          componentMainType: i,
          componentIndex: o.componentIndex,
          el: u
        };
    }
  }
}
function S2(t) {
  nr(q1), t.registerComponentModel(r2), t.registerComponentView(p2), t.registerAction({
    type: "showTip",
    event: "showTip",
    update: "tooltip:manuallyShowTip"
  }, Fe), t.registerAction({
    type: "hideTip",
    event: "hideTip",
    update: "tooltip:manuallyHideTip"
  }, Fe);
}
var b2 = function(t, e) {
  if (e === "all")
    return {
      type: "all",
      title: t.getLocaleModel().get(["legend", "selector", "all"])
    };
  if (e === "inverse")
    return {
      type: "inverse",
      title: t.getLocaleModel().get(["legend", "selector", "inverse"])
    };
}, Uh = (
  /** @class */
  function(t) {
    V(e, t);
    function e() {
      var r = t !== null && t.apply(this, arguments) || this;
      return r.type = e.type, r.layoutMode = {
        type: "box",
        // legend.width/height are maxWidth/maxHeight actually,
        // whereas real width/height is calculated by its content.
        // (Setting {left: 10, right: 10} does not make sense).
        // So consider the case:
        // `setOption({legend: {left: 10});`
        // then `setOption({legend: {right: 10});`
        // The previous `left` should be cleared by setting `ignoreSize`.
        ignoreSize: !0
      }, r;
    }
    return e.prototype.init = function(r, n, i) {
      this.mergeDefaultAndTheme(r, i), r.selected = r.selected || {}, this._updateSelector(r);
    }, e.prototype.mergeOption = function(r, n) {
      t.prototype.mergeOption.call(this, r, n), this._updateSelector(r);
    }, e.prototype._updateSelector = function(r) {
      var n = r.selector, i = this.ecModel;
      n === !0 && (n = r.selector = ["all", "inverse"]), H(n) && x(n, function(a, o) {
        z(a) && (a = {
          type: a
        }), n[o] = Se(a, b2(i, a.type));
      });
    }, e.prototype.optionUpdated = function() {
      this._updateData(this.ecModel);
      var r = this._data;
      if (r[0] && this.get("selectedMode") === "single") {
        for (var n = !1, i = 0; i < r.length; i++) {
          var a = r[i].get("name");
          if (this.isSelected(a)) {
            this.select(a), n = !0;
            break;
          }
        }
        !n && this.select(r[0].get("name"));
      }
    }, e.prototype._updateData = function(r) {
      var n = [], i = [];
      r.eachRawSeries(function(u) {
        var l = u.name;
        i.push(l);
        var f;
        if (u.legendVisualProvider) {
          var h = u.legendVisualProvider, c = h.getAllNames();
          r.isSeriesFiltered(u) || (i = i.concat(c)), c.length ? n = n.concat(c) : f = !0;
        } else
          f = !0;
        f && hc(u) && n.push(u.name);
      }), this._availableNames = i;
      var a = this.get("data") || n, o = Z(), s = X(a, function(u) {
        return (z(u) || Te(u)) && (u = {
          name: u
        }), o.get(u.name) ? null : (o.set(u.name, !0), new xe(u, this, this.ecModel));
      }, this);
      this._data = He(s, function(u) {
        return !!u;
      });
    }, e.prototype.getData = function() {
      return this._data;
    }, e.prototype.select = function(r) {
      var n = this.option.selected, i = this.get("selectedMode");
      if (i === "single") {
        var a = this._data;
        x(a, function(o) {
          n[o.get("name")] = !1;
        });
      }
      n[r] = !0;
    }, e.prototype.unSelect = function(r) {
      this.get("selectedMode") !== "single" && (this.option.selected[r] = !1);
    }, e.prototype.toggleSelected = function(r) {
      var n = this.option.selected;
      n.hasOwnProperty(r) || (n[r] = !0), this[n[r] ? "unSelect" : "select"](r);
    }, e.prototype.allSelect = function() {
      var r = this._data, n = this.option.selected;
      x(r, function(i) {
        n[i.get("name", !0)] = !0;
      });
    }, e.prototype.inverseSelect = function() {
      var r = this._data, n = this.option.selected;
      x(r, function(i) {
        var a = i.get("name", !0);
        n.hasOwnProperty(a) || (n[a] = !0), n[a] = !n[a];
      });
    }, e.prototype.isSelected = function(r) {
      var n = this.option.selected;
      return !(n.hasOwnProperty(r) && !n[r]) && fe(this._availableNames, r) >= 0;
    }, e.prototype.getOrient = function() {
      return this.get("orient") === "vertical" ? {
        index: 1,
        name: "vertical"
      } : {
        index: 0,
        name: "horizontal"
      };
    }, e.type = "legend.plain", e.dependencies = ["series"], e.defaultOption = {
      // zlevel: 0,
      z: 4,
      show: !0,
      orient: "horizontal",
      left: "center",
      // right: 'center',
      // top: 0,
      bottom: G.size.m,
      align: "auto",
      backgroundColor: G.color.transparent,
      borderColor: G.color.border,
      borderRadius: 0,
      borderWidth: 0,
      padding: 5,
      itemGap: 8,
      itemWidth: 25,
      itemHeight: 14,
      symbolRotate: "inherit",
      symbolKeepAspect: !0,
      inactiveColor: G.color.disabled,
      inactiveBorderColor: G.color.disabled,
      inactiveBorderWidth: "auto",
      itemStyle: {
        color: "inherit",
        opacity: "inherit",
        borderColor: "inherit",
        borderWidth: "auto",
        borderCap: "inherit",
        borderJoin: "inherit",
        borderDashOffset: "inherit",
        borderMiterLimit: "inherit"
      },
      lineStyle: {
        width: "auto",
        color: "inherit",
        inactiveColor: G.color.disabled,
        inactiveWidth: 2,
        opacity: "inherit",
        type: "inherit",
        cap: "inherit",
        join: "inherit",
        dashOffset: "inherit",
        miterLimit: "inherit"
      },
      textStyle: {
        color: G.color.secondary
      },
      selectedMode: !0,
      selector: !1,
      selectorLabel: {
        show: !0,
        borderRadius: 10,
        padding: [3, 5, 3, 5],
        fontSize: 12,
        fontFamily: "sans-serif",
        color: G.color.tertiary,
        borderWidth: 1,
        borderColor: G.color.border
      },
      emphasis: {
        selectorLabel: {
          show: !0,
          color: G.color.quaternary
        }
      },
      selectorPosition: "auto",
      selectorItemGap: 7,
      selectorButtonGap: 10,
      tooltip: {
        show: !1
      },
      triggerEvent: !1
    }, e;
  }(ce)
), ii = Ae, Wh = x, ss = Re, aS = (
  /** @class */
  function(t) {
    V(e, t);
    function e() {
      var r = t !== null && t.apply(this, arguments) || this;
      return r.type = e.type, r.newlineDisabled = !1, r;
    }
    return e.prototype.init = function() {
      this.group.add(this._contentGroup = new ss()), this.group.add(this._selectorGroup = new ss()), this._isFirstRender = !0;
    }, e.prototype.getContentGroup = function() {
      return this._contentGroup;
    }, e.prototype.getSelectorGroup = function() {
      return this._selectorGroup;
    }, e.prototype.render = function(r, n, i) {
      var a = this._isFirstRender;
      if (this._isFirstRender = !1, this.resetInner(), !!r.get("show", !0)) {
        var o = r.get("align"), s = r.get("orient");
        (!o || o === "auto") && (o = r.get("left") === "right" && s === "vertical" ? "right" : "left");
        var u = r.get("selector", !0), l = r.get("selectorPosition", !0);
        u && (!l || l === "auto") && (l = s === "horizontal" ? "end" : "start"), this.renderInner(o, r, n, i, u, s, l);
        var f = qc(r, i).refContainer, h = r.getBoxLayoutParams(), c = r.get("padding"), v = Ii(h, f, c), d = this.layoutInner(r, o, v, a, u, l), p = Ii(ge({
          width: d.width,
          height: d.height
        }, h), f, c);
        this.group.x = p.x - d.x, this.group.y = p.y - d.y, this.group.markRedraw(), this.group.add(this._backgroundEl = t2(
          d,
          // FXIME: most itemStyle options does not work in background because inherit is not handled yet.
          r
        ));
      }
    }, e.prototype.resetInner = function() {
      this.getContentGroup().removeAll(), this._backgroundEl && this.group.remove(this._backgroundEl), this.getSelectorGroup().removeAll();
    }, e.prototype.renderInner = function(r, n, i, a, o, s, u) {
      var l = this.getContentGroup(), f = Z(), h = n.get("selectedMode"), c = n.get("triggerEvent"), v = [];
      i.eachRawSeries(function(d) {
        !d.get("legendHoverLink") && v.push(d.id);
      }), Wh(n.getData(), function(d, p) {
        var m = this, g = d.get("name");
        if (!this.newlineDisabled && (g === "" || g === `
`)) {
          var y = new ss();
          y.newline = !0, l.add(y);
          return;
        }
        var _ = i.getSeriesByName(g)[0];
        if (!f.get(g)) {
          if (_) {
            var S = _.getData(), b = S.getVisual("legendLineStyle") || {}, w = S.getVisual("legendIcon"), T = S.getVisual("style"), M = this._createItem(_, g, p, d, n, r, b, T, w, h, a);
            M.on("click", ii(Dm, g, null, a, v)).on("mouseover", ii(Yh, _.name, null, a, v)).on("mouseout", ii(Xh, _.name, null, a, v)), i.ssr && M.eachChild(function(D) {
              var C = me(D);
              C.seriesIndex = _.seriesIndex, C.dataIndex = p, C.ssrType = "legend";
            }), c && M.eachChild(function(D) {
              m.packEventData(D, n, _, p, g);
            }), f.set(g, !0);
          } else
            i.eachRawSeries(function(D) {
              var C = this;
              if (!f.get(g) && D.legendVisualProvider) {
                var E = D.legendVisualProvider;
                if (!E.containName(g))
                  return;
                var I = E.indexOfName(g), A = E.getItemVisual(I, "style"), O = E.getItemVisual(I, "legendIcon"), P = Lt(A.fill);
                P && P[3] === 0 && (P[3] = 0.2, A = R(R({}, A), {
                  fill: oo(P, "rgba")
                }));
                var L = this._createItem(D, g, p, d, n, r, {}, A, O, h, a);
                L.on("click", ii(Dm, null, g, a, v)).on("mouseover", ii(Yh, null, g, a, v)).on("mouseout", ii(Xh, null, g, a, v)), i.ssr && L.eachChild(function(B) {
                  var U = me(B);
                  U.seriesIndex = D.seriesIndex, U.dataIndex = p, U.ssrType = "legend";
                }), c && L.eachChild(function(B) {
                  C.packEventData(B, n, D, p, g);
                }), f.set(g, !0);
              }
            }, this);
          process.env.NODE_ENV !== "production" && (f.get(g) || console.warn(g + " series not exists. Legend data should be same with series name or data name."));
        }
      }, this), o && this._createSelector(o, n, a, s, u);
    }, e.prototype.packEventData = function(r, n, i, a, o) {
      var s = {
        componentType: "legend",
        componentIndex: n.componentIndex,
        dataIndex: a,
        value: o,
        seriesIndex: i.seriesIndex
      };
      me(r).eventData = s;
    }, e.prototype._createSelector = function(r, n, i, a, o) {
      var s = this.getSelectorGroup();
      Wh(r, function(l) {
        var f = l.type, h = new Je({
          style: {
            x: 0,
            y: 0,
            align: "center",
            verticalAlign: "middle"
          },
          onclick: function() {
            i.dispatchAction({
              type: f === "all" ? "legendAllSelect" : "legendInverseSelect",
              legendId: n.id
            });
          }
        });
        s.add(h);
        var c = n.getModel("selectorLabel"), v = n.getModel(["emphasis", "selectorLabel"]);
        Pc(h, {
          normal: c,
          emphasis: v
        }, {
          defaultText: l.title
        }), Ys(h);
      });
    }, e.prototype._createItem = function(r, n, i, a, o, s, u, l, f, h, c) {
      var v = r.visualDrawType, d = o.get("itemWidth"), p = o.get("itemHeight"), m = o.isSelected(n), g = a.get("symbolRotate"), y = a.get("symbolKeepAspect"), _ = a.get("icon");
      f = _ || f || "roundRect";
      var S = w2(f, a, u, l, v, m, c), b = new ss(), w = a.getModel("textStyle");
      if (Q(r.getLegendIcon) && (!_ || _ === "inherit"))
        b.add(r.getLegendIcon({
          itemWidth: d,
          itemHeight: p,
          icon: f,
          iconRotate: g,
          itemStyle: S.itemStyle,
          lineStyle: S.lineStyle,
          symbolKeepAspect: y
        }));
      else {
        var T = _ === "inherit" && r.getData().getVisual("symbol") ? g === "inherit" ? r.getData().getVisual("symbolRotate") : g : 0;
        b.add(T2({
          itemWidth: d,
          itemHeight: p,
          icon: f,
          iconRotate: T,
          itemStyle: S.itemStyle,
          symbolKeepAspect: y
        }));
      }
      var M = s === "left" ? d + 5 : -5, D = s, C = o.get("formatter"), E = n;
      z(C) && C ? E = C.replace("{name}", n ?? "") : Q(C) && (E = C(n));
      var I = m ? w.getTextColor() : a.get("inactiveColor");
      b.add(new Je({
        style: Nn(w, {
          text: E,
          x: M,
          y: p / 2,
          fill: I,
          align: D,
          verticalAlign: "middle"
        }, {
          inheritColor: I
        })
      }));
      var A = new Ce({
        shape: b.getBoundingRect(),
        style: {
          // Cannot use 'invisible' because SVG SSR will miss the node
          fill: "transparent"
        }
      }), O = a.getModel("tooltip");
      return O.get("show") && Fu({
        el: A,
        componentModel: o,
        itemName: n,
        itemTooltipOption: O.option
      }), b.add(A), b.eachChild(function(P) {
        P.silent = !0;
      }), A.silent = !h, this.getContentGroup().add(b), Ys(b), b.__legendDataIndex = i, b;
    }, e.prototype.layoutInner = function(r, n, i, a, o, s) {
      var u = this.getContentGroup(), l = this.getSelectorGroup();
      La(r.get("orient"), u, r.get("itemGap"), i.width, i.height);
      var f = u.getBoundingRect(), h = [-f.x, -f.y];
      if (l.markRedraw(), u.markRedraw(), o) {
        La(
          // Buttons in selectorGroup always layout horizontally
          "horizontal",
          l,
          r.get("selectorItemGap", !0)
        );
        var c = l.getBoundingRect(), v = [-c.x, -c.y], d = r.get("selectorButtonGap", !0), p = r.getOrient().index, m = p === 0 ? "width" : "height", g = p === 0 ? "height" : "width", y = p === 0 ? "y" : "x";
        s === "end" ? v[p] += f[m] + d : h[p] += c[m] + d, v[1 - p] += f[g] / 2 - c[g] / 2, l.x = v[0], l.y = v[1], u.x = h[0], u.y = h[1];
        var _ = {
          x: 0,
          y: 0
        };
        return _[m] = f[m] + d + c[m], _[g] = Math.max(f[g], c[g]), _[y] = Math.min(0, c[y] + v[1 - p]), _;
      } else
        return u.x = h[0], u.y = h[1], this.group.getBoundingRect();
    }, e.prototype.remove = function() {
      this.getContentGroup().removeAll(), this._isFirstRender = !0;
    }, e.type = "legend.plain", e;
  }(Pt)
);
function w2(t, e, r, n, i, a, o) {
  function s(m, g) {
    m.lineWidth === "auto" && (m.lineWidth = g.lineWidth > 0 ? 2 : 0), Wh(m, function(y, _) {
      m[_] === "inherit" && (m[_] = g[_]);
    });
  }
  var u = e.getModel("itemStyle"), l = u.getItemStyle(), f = t.lastIndexOf("empty", 0) === 0 ? "fill" : "stroke", h = u.getShallow("decal");
  l.decal = !h || h === "inherit" ? n.decal : Eh(h, o), l.fill === "inherit" && (l.fill = n[i]), l.stroke === "inherit" && (l.stroke = n[f]), l.opacity === "inherit" && (l.opacity = (i === "fill" ? n : r).opacity), s(l, n);
  var c = e.getModel("lineStyle"), v = c.getLineStyle();
  if (s(v, r), l.fill === "auto" && (l.fill = n.fill), l.stroke === "auto" && (l.stroke = n.fill), v.stroke === "auto" && (v.stroke = n.fill), !a) {
    var d = e.get("inactiveBorderWidth"), p = l[f];
    l.lineWidth = d === "auto" ? n.lineWidth > 0 && p ? 2 : 0 : l.lineWidth, l.fill = e.get("inactiveColor"), l.stroke = e.get("inactiveBorderColor"), v.stroke = c.get("inactiveColor"), v.lineWidth = c.get("inactiveWidth");
  }
  return {
    itemStyle: l,
    lineStyle: v
  };
}
function T2(t) {
  var e = t.icon || "roundRect", r = Yr(e, 0, 0, t.itemWidth, t.itemHeight, t.itemStyle.fill, t.symbolKeepAspect);
  return r.setStyle(t.itemStyle), r.rotation = (t.iconRotate || 0) * Math.PI / 180, r.setOrigin([t.itemWidth / 2, t.itemHeight / 2]), e.indexOf("empty") > -1 && (r.style.stroke = r.style.fill, r.style.fill = G.color.neutral00, r.style.lineWidth = 2), r;
}
function Dm(t, e, r, n) {
  Xh(t, e, r, n), r.dispatchAction({
    type: "legendToggleSelect",
    name: t ?? e
  }), Yh(t, e, r, n);
}
function Yh(t, e, r, n) {
  r.usingTHL() || r.dispatchAction({
    type: "highlight",
    seriesName: t,
    name: e,
    excludeSeriesId: n
  });
}
function Xh(t, e, r, n) {
  r.usingTHL() || r.dispatchAction({
    type: "downplay",
    seriesName: t,
    name: e,
    excludeSeriesId: n
  });
}
function ha(t, e, r) {
  var n = t === "allSelect" || t === "inverseSelect", i = {}, a = [];
  r.eachComponent({
    mainType: "legend",
    query: e
  }, function(s) {
    n ? s[t]() : s[t](e.name), Mm(s, i), a.push(s.componentIndex);
  });
  var o = {};
  return r.eachComponent("legend", function(s) {
    x(i, function(u, l) {
      s[u ? "select" : "unSelect"](l);
    }), Mm(s, o);
  }), n ? {
    selected: o,
    // return legendIndex array to tell the developers which legends are allSelect / inverseSelect
    legendIndex: a
  } : {
    name: e.name,
    selected: o
  };
}
function Mm(t, e) {
  var r = e || {};
  return x(t.getData(), function(n) {
    var i = n.get("name");
    if (!(i === `
` || i === "")) {
      var a = t.isSelected(i);
      at(r, i) ? r[i] = r[i] && a : r[i] = a;
    }
  }), r;
}
function x2(t) {
  t.registerAction("legendToggleSelect", "legendselectchanged", Ae(ha, "toggleSelected")), t.registerAction("legendAllSelect", "legendselectall", Ae(ha, "allSelect")), t.registerAction("legendInverseSelect", "legendinverseselect", Ae(ha, "inverseSelect")), t.registerAction("legendSelect", "legendselected", Ae(ha, "select")), t.registerAction("legendUnSelect", "legendunselected", Ae(ha, "unSelect"));
}
var C2 = dc(D2);
function D2(t) {
  var e = t.findComponents({
    mainType: "legend"
  });
  e && e.length && t.filterSeries(function(r) {
    for (var n = 0; n < e.length; n++)
      if (!e[n].isSelected(r.name))
        return !1;
    return !0;
  });
}
function oS(t) {
  t.registerComponentModel(Uh), t.registerComponentView(aS), t.registerProcessor(t.PRIORITY.PROCESSOR.SERIES_FILTER, C2), t.registerSubTypeDefaulter("legend", function() {
    return "plain";
  }), x2(t);
}
var M2 = (
  /** @class */
  function(t) {
    V(e, t);
    function e() {
      var r = t !== null && t.apply(this, arguments) || this;
      return r.type = e.type, r;
    }
    return e.prototype.setScrollDataIndex = function(r) {
      this.option.scrollDataIndex = r;
    }, e.prototype.init = function(r, n, i) {
      var a = Hi(r);
      t.prototype.init.call(this, r, n, i), Em(this, r, a);
    }, e.prototype.mergeOption = function(r, n) {
      t.prototype.mergeOption.call(this, r, n), Em(this, this.option, r);
    }, e.type = "legend.scroll", e.defaultOption = Rc(Uh.defaultOption, {
      scrollDataIndex: 0,
      pageButtonItemGap: 5,
      pageButtonGap: null,
      pageButtonPosition: "end",
      pageFormatter: "{current}/{total}",
      pageIcons: {
        horizontal: ["M0,0L12,-10L12,10z", "M0,0L-12,-10L-12,10z"],
        vertical: ["M0,0L20,0L10,-20z", "M0,0L20,0L10,20z"]
      },
      pageIconColor: G.color.accent50,
      pageIconInactiveColor: G.color.accent10,
      pageIconSize: 15,
      pageTextStyle: {
        color: G.color.tertiary
      },
      animationDurationUpdate: 800
    }), e;
  }(Uh)
);
function Em(t, e, r) {
  var n = t.getOrient(), i = [1, 1];
  i[n.index] = 0, Ur(e, r, {
    type: "box",
    ignoreSize: !!i
  });
}
var Am = Re, Tf = ["width", "height"], xf = ["x", "y"], E2 = (
  /** @class */
  function(t) {
    V(e, t);
    function e() {
      var r = t !== null && t.apply(this, arguments) || this;
      return r.type = e.type, r.newlineDisabled = !0, r._currentIndex = 0, r;
    }
    return e.prototype.init = function() {
      t.prototype.init.call(this), this.group.add(this._containerGroup = new Am()), this._containerGroup.add(this.getContentGroup()), this.group.add(this._controllerGroup = new Am());
    }, e.prototype.resetInner = function() {
      t.prototype.resetInner.call(this), this._controllerGroup.removeAll(), this._containerGroup.removeClipPath(), this._containerGroup.__rectSize = null;
    }, e.prototype.renderInner = function(r, n, i, a, o, s, u) {
      var l = this;
      t.prototype.renderInner.call(this, r, n, i, a, o, s, u);
      var f = this._controllerGroup, h = n.get("pageIconSize", !0), c = H(h) ? h : [h, h];
      d("pagePrev", 0);
      var v = n.getModel("pageTextStyle");
      f.add(new Je({
        name: "pageText",
        style: {
          // Placeholder to calculate a proper layout.
          text: "xx/xx",
          fill: v.getTextColor(),
          font: v.getFont(),
          verticalAlign: "middle",
          align: "center"
        },
        silent: !0
      })), d("pageNext", 1);
      function d(p, m) {
        var g = p + "DataIndex", y = Ac(n.get("pageIcons", !0)[n.getOrient().name][m], {
          // Buttons will be created in each render, so we do not need
          // to worry about avoiding using legendModel kept in scope.
          onclick: te(l._pageGo, l, g, n, a)
        }, {
          x: -c[0] / 2,
          y: -c[1] / 2,
          width: c[0],
          height: c[1]
        });
        y.name = p, f.add(y);
      }
    }, e.prototype.layoutInner = function(r, n, i, a, o, s) {
      var u = this.getSelectorGroup(), l = r.getOrient().index, f = Tf[l], h = xf[l], c = Tf[1 - l], v = xf[1 - l];
      o && La(
        // Buttons in selectorGroup always layout horizontally
        "horizontal",
        u,
        r.get("selectorItemGap", !0)
      );
      var d = r.get("selectorButtonGap", !0), p = u.getBoundingRect(), m = [-p.x, -p.y], g = ae(i);
      o && (g[f] = i[f] - p[f] - d);
      var y = this._layoutContentAndController(r, a, g, l, f, c, v, h);
      if (o) {
        if (s === "end")
          m[l] += y[f] + d;
        else {
          var _ = p[f] + d;
          m[l] -= _, y[h] -= _;
        }
        y[f] += p[f] + d, m[1 - l] += y[v] + y[c] / 2 - p[c] / 2, y[c] = Math.max(y[c], p[c]), y[v] = Math.min(y[v], p[v] + m[1 - l]), u.x = m[0], u.y = m[1], u.markRedraw();
      }
      return y;
    }, e.prototype._layoutContentAndController = function(r, n, i, a, o, s, u, l) {
      var f = this.getContentGroup(), h = this._containerGroup, c = this._controllerGroup;
      La(r.get("orient"), f, r.get("itemGap"), a ? i.width : null, a ? null : i.height), La(
        // Buttons in controller are layout always horizontally.
        "horizontal",
        c,
        r.get("pageButtonItemGap", !0)
      );
      var v = f.getBoundingRect(), d = c.getBoundingRect(), p = this._showController = v[o] > i[o], m = [-v.x, -v.y];
      n || (m[a] = f[l]);
      var g = [0, 0], y = [-d.x, -d.y], _ = W(r.get("pageButtonGap", !0), r.get("itemGap", !0));
      if (p) {
        var S = r.get("pageButtonPosition", !0);
        S === "end" ? y[a] += i[o] - d[o] : g[a] += d[o] + _;
      }
      y[1 - a] += v[s] / 2 - d[s] / 2, f.setPosition(m), h.setPosition(g), c.setPosition(y);
      var b = {
        x: 0,
        y: 0
      };
      if (b[o] = p ? i[o] : v[o], b[s] = Math.max(v[s], d[s]), b[u] = Math.min(0, d[u] + y[1 - a]), h.__rectSize = i[o], p) {
        var w = {
          x: 0,
          y: 0
        };
        w[o] = Math.max(i[o] - d[o] - _, 0), w[s] = b[s], h.setClipPath(new Ce({
          shape: w
        })), h.__rectSize = w[o];
      } else
        c.eachChild(function(M) {
          M.attr({
            invisible: !0,
            silent: !0
          });
        });
      var T = this._getPageInfo(r);
      return T.pageIndex != null && Gr(
        f,
        {
          x: T.contentPosition[0],
          y: T.contentPosition[1]
        },
        // When switch from "show controller" to "not show controller", view should be
        // updated immediately without animation, otherwise causes weird effect.
        p ? r : null
      ), this._updatePageInfoView(r, T), b;
    }, e.prototype._pageGo = function(r, n, i) {
      var a = this._getPageInfo(n)[r];
      a != null && i.dispatchAction({
        type: "legendScroll",
        scrollDataIndex: a,
        legendId: n.id
      });
    }, e.prototype._updatePageInfoView = function(r, n) {
      var i = this._controllerGroup;
      x(["pagePrev", "pageNext"], function(f) {
        var h = f + "DataIndex", c = n[h] != null, v = i.childOfName(f);
        v && (v.setStyle("fill", c ? r.get("pageIconColor", !0) : r.get("pageIconInactiveColor", !0)), v.cursor = c ? "pointer" : "default");
      });
      var a = i.childOfName("pageText"), o = r.get("pageFormatter"), s = n.pageIndex, u = s != null ? s + 1 : 0, l = n.pageCount;
      a && o && a.setStyle("text", z(o) ? o.replace("{current}", u == null ? "" : u + "").replace("{total}", l == null ? "" : l + "") : o({
        current: u,
        total: l
      }));
    }, e.prototype._getPageInfo = function(r) {
      var n = r.get("scrollDataIndex", !0), i = this.getContentGroup(), a = this._containerGroup.__rectSize, o = r.getOrient().index, s = Tf[o], u = xf[o], l = this._findTargetItemIndex(n), f = i.children(), h = f[l], c = f.length, v = c ? 1 : 0, d = {
        contentPosition: [i.x, i.y],
        pageCount: v,
        pageIndex: v - 1,
        pagePrevDataIndex: null,
        pageNextDataIndex: null
      };
      if (!h)
        return d;
      var p = S(h);
      d.contentPosition[o] = -p.s;
      for (var m = l + 1, g = p, y = p, _ = null; m <= c; ++m)
        _ = S(f[m]), // Half of the last item is out of the window.
        (!_ && y.e > g.s + a || _ && !b(_, g.s)) && (y.i > g.i ? g = y : g = _, g && (d.pageNextDataIndex == null && (d.pageNextDataIndex = g.i), ++d.pageCount)), y = _;
      for (var m = l - 1, g = p, y = p, _ = null; m >= -1; --m)
        _ = S(f[m]), // If the the end item does not intersect with the window started
        // from the current item, a page can be settled.
        (!_ || !b(y, _.s)) && g.i < y.i && (y = g, d.pagePrevDataIndex == null && (d.pagePrevDataIndex = g.i), ++d.pageCount, ++d.pageIndex), g = _;
      return d;
      function S(w) {
        if (w) {
          var T = w.getBoundingRect(), M = T[u] + w[u];
          return {
            s: M,
            e: M + T[s],
            i: w.__legendDataIndex
          };
        }
      }
      function b(w, T) {
        return w.e >= T && w.s <= T + a;
      }
    }, e.prototype._findTargetItemIndex = function(r) {
      if (!this._showController)
        return 0;
      var n, i = this.getContentGroup(), a;
      return i.eachChild(function(o, s) {
        var u = o.__legendDataIndex;
        a == null && u != null && (a = s), u === r && (n = s);
      }), n ?? a;
    }, e.type = "legend.scroll", e;
  }(aS)
);
function A2(t) {
  t.registerAction("legendScroll", "legendscroll", function(e, r) {
    var n = e.scrollDataIndex;
    n != null && r.eachComponent({
      mainType: "legend",
      subType: "scroll",
      query: e
    }, function(i) {
      i.setScrollDataIndex(n);
    });
  });
}
function I2(t) {
  nr(oS), t.registerComponentModel(M2), t.registerComponentView(E2), A2(t);
}
function O2(t) {
  nr(oS), nr(I2);
}
var L2 = (
  /** @class */
  function(t) {
    V(e, t);
    function e() {
      var r = t !== null && t.apply(this, arguments) || this;
      return r.type = e.type, r;
    }
    return e.type = "dataZoom.inside", e.defaultOption = Rc(_u.defaultOption, {
      disabled: !1,
      zoomLock: !1,
      zoomOnMouseWheel: !0,
      moveOnMouseMove: !0,
      moveOnMouseWheel: !1,
      preventDefaultMouseMove: !0
    }), e;
  }(_u)
), yv = ve();
function P2(t, e, r) {
  yv(t).coordSysRecordMap.each(function(n) {
    var i = n.dataZoomInfoMap.get(e.uid);
    i && (i.getRange = r);
  });
}
function N2(t, e) {
  for (var r = yv(t).coordSysRecordMap, n = r.keys(), i = 0; i < n.length; i++) {
    var a = n[i], o = r.get(a), s = o.dataZoomInfoMap;
    if (s) {
      var u = e.uid, l = s.get(u);
      l && (s.removeKey(u), s.keys().length || sS(r, o));
    }
  }
}
function sS(t, e) {
  if (e) {
    t.removeKey(e.model.uid);
    var r = e.controller;
    r && r.dispose();
  }
}
function R2(t, e) {
  var r = {
    model: e,
    containsPoint: Ae(B2, e),
    dispatchAction: Ae(k2, t),
    dataZoomInfoMap: null,
    controller: null
  }, n = r.controller = new pL(t.getZr());
  return x(["pan", "zoom", "scrollMove"], function(i) {
    n.on(i, function(a) {
      var o = [];
      r.dataZoomInfoMap.each(function(s) {
        if (a.isAvailableBehavior(s.model.option)) {
          var u = (s.getRange || {})[i], l = u && u(s.dzReferCoordSysInfo, r.model.mainType, r.controller, a);
          !s.model.get("disabled", !0) && l && o.push({
            dataZoomId: s.model.id,
            start: l[0],
            end: l[1]
          });
        }
      }), o.length && r.dispatchAction(o);
    });
  }), r;
}
function k2(t, e) {
  t.isDisposed() || t.dispatchAction({
    type: "dataZoom",
    animation: {
      easing: "cubicOut",
      duration: 100
    },
    batch: e
  });
}
function B2(t, e, r, n) {
  return t.coordinateSystem.containPoint([r, n]);
}
function V2(t, e, r) {
  var n, i = "type_", a = {
    type_true: 2,
    type_move: 1,
    type_false: 0,
    type_undefined: -1
  }, o = !0, s, u;
  return t.each(function(l) {
    var f = l.model, h = f.get("disabled", !0) ? !1 : f.get("zoomLock", !0) ? "move" : !0;
    a[i + h] > a[i + n] && (n = h), o = o && f.get("preventDefaultMouseMove", !0), s = W(f.get("cursorGrab", !0), s), u = W(f.get("cursorGrabbing", !0), u);
  }), {
    controlType: n,
    opt: {
      // RoamController will enable all of these functionalities,
      // and the final behavior is determined by its event listener
      // provided by each inside zoom.
      zoomOnMouseWheel: !0,
      moveOnMouseMove: !0,
      moveOnMouseWheel: !0,
      preventDefaultMouseMove: !!o,
      api: r,
      zInfo: {
        component: e.model
      },
      triggerInfo: {
        roamTrigger: null,
        isInSelf: e.containsPoint
      },
      cursorGrab: s,
      cursorGrabbing: u
    }
  };
}
function F2(t) {
  t.registerUpdateLifecycle("coordsys:aftercreate", function(e, r) {
    var n = yv(r), i = n.coordSysRecordMap || (n.coordSysRecordMap = Z());
    i.each(function(a) {
      a.dataZoomInfoMap = null;
    }), e.eachComponent({
      mainType: "dataZoom",
      subType: "inside"
    }, function(a) {
      var o = K1(a);
      x(o.infoList, function(s) {
        var u = s.model.uid, l = i.get(u) || i.set(u, R2(r, s.model)), f = l.dataZoomInfoMap || (l.dataZoomInfoMap = Z());
        f.set(a.uid, {
          dzReferCoordSysInfo: s,
          model: a,
          getRange: null
        });
      });
    }), i.each(function(a) {
      var o = a.controller, s, u = a.dataZoomInfoMap;
      if (u) {
        var l = u.keys()[0];
        l != null && (s = u.get(l));
      }
      if (!s) {
        sS(i, a);
        return;
      }
      var f = V2(u, a, r);
      o.enable(f.controlType, f.opt), Xu(a, "dispatchAction", s.model.get("throttle", !0), "fixRate");
    });
  });
}
var z2 = (
  /** @class */
  function(t) {
    V(e, t);
    function e() {
      var r = t !== null && t.apply(this, arguments) || this;
      return r.type = "dataZoom.inside", r;
    }
    return e.prototype.render = function(r, n, i) {
      if (t.prototype.render.apply(this, arguments), r.noTarget()) {
        this._clear();
        return;
      }
      this.range = r.getPercentRange(), P2(i, r, {
        pan: te(Cf.pan, this),
        zoom: te(Cf.zoom, this),
        scrollMove: te(Cf.scrollMove, this)
      });
    }, e.prototype.dispose = function() {
      this._clear(), t.prototype.dispose.apply(this, arguments);
    }, e.prototype._clear = function() {
      N2(this.api, this.dataZoomModel), this.range = null;
    }, e.type = "dataZoom.inside", e;
  }(J1)
), Cf = {
  zoom: function(t, e, r, n) {
    var i = this.range, a = i.slice(), o = t.axisModels[0];
    if (o) {
      var s = Df[e](null, [n.originX, n.originY], o, r, t), u = (s.signal > 0 ? s.pixelStart + s.pixelLength - s.pixel : s.pixel - s.pixelStart) / s.pixelLength * (a[1] - a[0]) + a[0], l = Math.max(1 / n.scale, 0);
      a[0] = (a[0] - u) * l + u, a[1] = (a[1] - u) * l + u;
      var f = this.dataZoomModel.findRepresentativeAxisProxy().getMinMaxSpan();
      if (to(0, a, [0, 100], 0, f.minSpan, f.maxSpan), this.range = a, i[0] !== a[0] || i[1] !== a[1])
        return a;
    }
  },
  pan: Im(function(t, e, r, n, i, a) {
    var o = Df[n]([a.oldX, a.oldY], [a.newX, a.newY], e, i, r);
    return o.signal * (t[1] - t[0]) * o.pixel / o.pixelLength;
  }),
  scrollMove: Im(function(t, e, r, n, i, a) {
    var o = Df[n]([0, 0], [a.scrollDelta, a.scrollDelta], e, i, r);
    return o.signal * (t[1] - t[0]) * a.scrollDelta;
  })
};
function Im(t) {
  return function(e, r, n, i) {
    var a = this.range, o = a.slice(), s = e.axisModels[0];
    if (s) {
      var u = t(o, s, e, r, n, i);
      if (to(u, o, [0, 100], "all"), this.range = o, a[0] !== o[0] || a[1] !== o[1])
        return o;
    }
  };
}
var Df = {
  grid: function(t, e, r, n, i) {
    var a = r.axis, o = {}, s = i.model.coordinateSystem.getRect();
    return t = t || [0, 0], a.dim === "x" ? (o.pixel = e[0] - t[0], o.pixelLength = s.width, o.pixelStart = s.x, o.signal = a.inverse ? 1 : -1) : (o.pixel = e[1] - t[1], o.pixelLength = s.height, o.pixelStart = s.y, o.signal = a.inverse ? -1 : 1), o;
  },
  polar: function(t, e, r, n, i) {
    var a = r.axis, o = {}, s = i.model.coordinateSystem, u = s.getRadiusAxis().getExtent(), l = s.getAngleAxis().getExtent();
    return t = t ? s.pointToCoord(t) : [0, 0], e = s.pointToCoord(e), r.mainType === "radiusAxis" ? (o.pixel = e[0] - t[0], o.pixelLength = u[1] - u[0], o.pixelStart = u[0], o.signal = a.inverse ? 1 : -1) : (o.pixel = e[1] - t[1], o.pixelLength = l[1] - l[0], o.pixelStart = l[0], o.signal = a.inverse ? -1 : 1), o;
  },
  singleAxis: function(t, e, r, n, i) {
    var a = r.axis, o = i.model.coordinateSystem.getRect(), s = {};
    return t = t || [0, 0], a.orient === "horizontal" ? (s.pixel = e[0] - t[0], s.pixelLength = o.width, s.pixelStart = o.x, s.signal = a.inverse ? 1 : -1) : (s.pixel = e[1] - t[1], s.pixelLength = o.height, s.pixelStart = o.y, s.signal = a.inverse ? -1 : 1), s;
  }
};
function H2(t) {
  eS(t), t.registerComponentModel(L2), t.registerComponentView(z2), F2(t);
}
var G2 = (
  /** @class */
  function(t) {
    V(e, t);
    function e() {
      var r = t !== null && t.apply(this, arguments) || this;
      return r.type = e.type, r;
    }
    return e.type = "dataZoom.slider", e.layoutMode = "box", e.defaultOption = Rc(_u.defaultOption, {
      show: !0,
      // deault value can only be drived in view stage.
      right: "ph",
      top: "ph",
      width: "ph",
      height: "ph",
      left: null,
      bottom: null,
      borderColor: G.color.accent10,
      borderRadius: 0,
      backgroundColor: G.color.transparent,
      // dataBackgroundColor: '#ddd',
      dataBackground: {
        lineStyle: {
          color: G.color.accent30,
          width: 0.5
        },
        areaStyle: {
          color: G.color.accent20,
          opacity: 0.2
        }
      },
      selectedDataBackground: {
        lineStyle: {
          color: G.color.accent40,
          width: 0.5
        },
        areaStyle: {
          color: G.color.accent20,
          opacity: 0.3
        }
      },
      // Color of selected window.
      fillerColor: "rgba(135,175,274,0.2)",
      handleIcon: "path://M-9.35,34.56V42m0-40V9.5m-2,0h4a2,2,0,0,1,2,2v21a2,2,0,0,1-2,2h-4a2,2,0,0,1-2-2v-21A2,2,0,0,1-11.35,9.5Z",
      // Percent of the slider height
      handleSize: "100%",
      handleStyle: {
        color: G.color.neutral00,
        borderColor: G.color.accent20
      },
      moveHandleSize: 7,
      moveHandleIcon: "path://M-320.9-50L-320.9-50c18.1,0,27.1,9,27.1,27.1V85.7c0,18.1-9,27.1-27.1,27.1l0,0c-18.1,0-27.1-9-27.1-27.1V-22.9C-348-41-339-50-320.9-50z M-212.3-50L-212.3-50c18.1,0,27.1,9,27.1,27.1V85.7c0,18.1-9,27.1-27.1,27.1l0,0c-18.1,0-27.1-9-27.1-27.1V-22.9C-239.4-41-230.4-50-212.3-50z M-103.7-50L-103.7-50c18.1,0,27.1,9,27.1,27.1V85.7c0,18.1-9,27.1-27.1,27.1l0,0c-18.1,0-27.1-9-27.1-27.1V-22.9C-130.9-41-121.8-50-103.7-50z",
      moveHandleStyle: {
        color: G.color.accent40,
        opacity: 0.5
      },
      showDetail: !0,
      showDataShadow: "auto",
      realtime: !0,
      zoomLock: !1,
      textStyle: {
        color: G.color.tertiary
      },
      brushSelect: !0,
      brushStyle: {
        color: G.color.accent30,
        opacity: 0.3
      },
      emphasis: {
        handleLabel: {
          show: !0
        },
        handleStyle: {
          borderColor: G.color.accent40
        },
        moveHandleStyle: {
          opacity: 0.8
        }
      },
      defaultLocationEdgeGap: 15
    }), e;
  }(_u)
), ca = Ce, U2 = 1, Mf = 30, W2 = 7, va = "horizontal", Om = "vertical", Y2 = 5, X2 = ["line", "bar", "candlestick", "scatter"], Z2 = {
  easing: "cubicOut",
  duration: 100,
  delay: 0
}, $2 = (
  /** @class */
  function(t) {
    V(e, t);
    function e() {
      var r = t !== null && t.apply(this, arguments) || this;
      return r.type = e.type, r._displayables = {}, r;
    }
    return e.prototype.init = function(r, n) {
      this.api = n, this._onBrush = te(this._onBrush, this), this._onBrushEnd = te(this._onBrushEnd, this);
    }, e.prototype.render = function(r, n, i, a) {
      if (t.prototype.render.apply(this, arguments), Xu(this, "_dispatchZoomAction", r.get("throttle"), "fixRate"), this._orient = r.getOrient(), r.get("show") === !1) {
        this.group.removeAll();
        return;
      }
      if (r.noTarget()) {
        this._clear(), this.group.removeAll();
        return;
      }
      (!a || a.type !== "dataZoom" || a.from !== this.uid) && this._buildView(), this._updateView();
    }, e.prototype.dispose = function() {
      this._clear(), t.prototype.dispose.apply(this, arguments);
    }, e.prototype._clear = function() {
      js(this, "_dispatchZoomAction");
      var r = this.api.getZr();
      r.off("mousemove", this._onBrush), r.off("mouseup", this._onBrushEnd);
    }, e.prototype._buildView = function() {
      var r = this.group;
      r.removeAll(), this._brushing = !1, this._displayables.brushRect = null, this._resetLocation(), this._resetInterval();
      var n = this._displayables.sliderGroup = new Re();
      this._renderBackground(), this._renderHandle(), this._renderDataShadow(), r.add(n), this._positionGroup();
    }, e.prototype._resetLocation = function() {
      var r = this.dataZoomModel, n = this.api, i = r.get("brushSelect"), a = i ? W2 : 0, o = qc(r, n).refContainer, s = this._findCoordRect(), u = r.get("defaultLocationEdgeGap", !0) || 0, l = this._orient === va ? {
        // Why using 'right', because right should be used in vertical,
        // and it is better to be consistent for dealing with position param merge.
        right: o.width - s.x - s.width,
        top: o.height - Mf - u - a,
        width: s.width,
        height: Mf
      } : {
        right: u,
        top: s.y,
        width: Mf,
        height: s.height
      }, f = Hi(r.option);
      x(["right", "top", "width", "height"], function(c) {
        f[c] === "ph" && (f[c] = l[c]);
      });
      var h = Ii(f, o);
      this._location = {
        x: h.x,
        y: h.y
      }, this._size = [h.width, h.height], this._orient === Om && this._size.reverse();
    }, e.prototype._positionGroup = function() {
      var r = this.group, n = this._location, i = this._orient, a = this.dataZoomModel.getFirstTargetAxisModel(), o = a && a.get("inverse"), s = this._displayables.sliderGroup, u = (this._dataShadowInfo || {}).otherAxisInverse;
      s.attr(i === va && !o ? {
        scaleY: u ? 1 : -1,
        scaleX: 1
      } : i === va && o ? {
        scaleY: u ? 1 : -1,
        scaleX: -1
      } : i === Om && !o ? {
        scaleY: u ? -1 : 1,
        scaleX: 1,
        rotation: Math.PI / 2
      } : {
        scaleY: u ? -1 : 1,
        scaleX: -1,
        rotation: Math.PI / 2
      });
      var l = r.getBoundingRect([s]), f = isNaN(l.x) ? 0 : l.x, h = isNaN(l.y) ? 0 : l.y;
      r.x = n.x - f, r.y = n.y - h, r.markRedraw();
    }, e.prototype._getViewExtent = function() {
      return [0, this._size[0]];
    }, e.prototype._renderBackground = function() {
      var r = this.dataZoomModel, n = this._size, i = this._displayables.sliderGroup, a = r.get("brushSelect");
      i.add(new ca({
        silent: !0,
        shape: {
          x: 0,
          y: 0,
          width: n[0],
          height: n[1]
        },
        style: {
          fill: r.get("backgroundColor")
        },
        z2: -40
      }));
      var o = new ca({
        shape: {
          x: 0,
          y: 0,
          width: n[0],
          height: n[1]
        },
        style: {
          fill: "transparent"
        },
        z2: 0,
        onclick: te(this._onClickPanel, this)
      }), s = this.api.getZr();
      a ? (o.on("mousedown", this._onBrushStart, this), o.cursor = "crosshair", s.on("mousemove", this._onBrush), s.on("mouseup", this._onBrushEnd)) : (s.off("mousemove", this._onBrush), s.off("mouseup", this._onBrushEnd)), i.add(o);
    }, e.prototype._renderDataShadow = function() {
      var r = this._dataShadowInfo = this._prepareDataShadowInfo();
      if (this._displayables.dataShadowSegs = [], !r)
        return;
      var n = this._size, i = this._shadowSize || [], a = r.series, o = a.getRawData(), s = a.getShadowDim && a.getShadowDim(), u = s && o.getDimensionInfo(s) ? a.getShadowDim() : r.otherDim;
      if (u == null)
        return;
      var l = this._shadowPolygonPts, f = this._shadowPolylinePts;
      if (o !== this._shadowData || u !== this._shadowDim || n[0] !== i[0] || n[1] !== i[1]) {
        var h = o.getDataExtent(r.thisDim), c = o.getDataExtent(u), v = (c[1] - c[0]) * 0.3;
        c = [c[0] - v, c[1] + v];
        var d = [0, n[1]], p = [0, n[0]], m = [[n[0], 0], [0, 0]], g = [], y = p[1] / Math.max(1, o.count() - 1), _ = n[0] / (h[1] - h[0]), S = r.thisAxis.type === "time", b = -y, w = Math.round(o.count() / n[0]), T;
        o.each([r.thisDim, u], function(I, A, O) {
          if (w > 0 && O % w) {
            S || (b += y);
            return;
          }
          b = S ? (+I - h[0]) * _ : b + y;
          var P = A == null || isNaN(A) || A === "", L = P ? 0 : Oe(A, c, d, !0);
          P && !T && O ? (m.push([m[m.length - 1][0], 0]), g.push([g[g.length - 1][0], 0])) : !P && T && (m.push([b, 0]), g.push([b, 0])), P || (m.push([b, L]), g.push([b, L])), T = P;
        }), l = this._shadowPolygonPts = m, f = this._shadowPolylinePts = g;
      }
      this._shadowData = o, this._shadowDim = u, this._shadowSize = [n[0], n[1]];
      var M = this.dataZoomModel;
      function D(I) {
        var A = M.getModel(I ? "selectedDataBackground" : "dataBackground"), O = new Re(), P = new ku({
          shape: {
            points: l
          },
          segmentIgnoreThreshold: 1,
          style: A.getModel("areaStyle").getAreaStyle(),
          silent: !0,
          z2: -20
        }), L = new Bu({
          shape: {
            points: f
          },
          segmentIgnoreThreshold: 1,
          style: A.getModel("lineStyle").getLineStyle(),
          silent: !0,
          z2: -19
        });
        return O.add(P), O.add(L), O;
      }
      for (var C = 0; C < 3; C++) {
        var E = D(C === 1);
        this._displayables.sliderGroup.add(E), this._displayables.dataShadowSegs.push(E);
      }
    }, e.prototype._prepareDataShadowInfo = function() {
      var r = this.dataZoomModel, n = r.get("showDataShadow");
      if (n !== !1) {
        var i, a = this.ecModel;
        return r.eachTargetAxis(function(o, s) {
          var u = r.getAxisProxy(o, s).getTargetSeriesModels();
          x(u, function(l) {
            if (!i && !(n !== !0 && fe(X2, l.get("type")) < 0)) {
              var f = a.getComponent(Nr(o), s).axis, h = q2(o), c, v = l.coordinateSystem;
              h != null && v.getOtherAxis && (c = v.getOtherAxis(f).inverse), h = l.getData().mapDimension(h);
              var d = l.getData().mapDimension(o);
              i = {
                thisAxis: f,
                series: l,
                thisDim: d,
                otherDim: h,
                otherAxisInverse: c
              };
            }
          }, this);
        }, this), i;
      }
    }, e.prototype._renderHandle = function() {
      var r = this.group, n = this._displayables, i = n.handles = [null, null], a = n.handleLabels = [null, null], o = this._displayables.sliderGroup, s = this._size, u = this.dataZoomModel, l = this.api, f = u.get("borderRadius") || 0, h = u.get("brushSelect"), c = n.filler = new ca({
        silent: h,
        style: {
          fill: u.get("fillerColor")
        },
        textConfig: {
          position: "inside"
        }
      });
      o.add(c), o.add(new ca({
        silent: !0,
        subPixelOptimize: !0,
        shape: {
          x: 0,
          y: 0,
          width: s[0],
          height: s[1],
          r: f
        },
        style: {
          // deprecated option
          stroke: u.get("dataBackgroundColor") || u.get("borderColor"),
          lineWidth: U2,
          fill: G.color.transparent
        }
      })), x([0, 1], function(_) {
        var S = u.get("handleIcon");
        !tu[S] && S.indexOf("path://") < 0 && S.indexOf("image://") < 0 && (S = "path://" + S, process.env.NODE_ENV !== "production" && tr("handleIcon now needs 'path://' prefix when using a path string"));
        var b = Yr(S, -1, 0, 2, 2, null, !0);
        b.attr({
          cursor: K2(this._orient),
          draggable: !0,
          drift: te(this._onDragMove, this, _),
          ondragend: te(this._onDragEnd, this),
          onmouseover: te(this._onOverDataInfoTriggerArea, this, !0),
          onmouseout: te(this._onOverDataInfoTriggerArea, this, !1),
          z2: 5
        });
        var w = b.getBoundingRect(), T = u.get("handleSize");
        this._handleHeight = _t(T, this._size[1]), this._handleWidth = w.width / w.height * this._handleHeight, b.setStyle(u.getModel("handleStyle").getItemStyle()), b.style.strokeNoScale = !0, b.rectHover = !0, b.ensureState("emphasis").style = u.getModel(["emphasis", "handleStyle"]).getItemStyle(), Ys(b);
        var M = u.get("handleColor");
        M != null && (b.style.fill = M), o.add(i[_] = b);
        var D = u.getModel("textStyle"), C = u.get("handleLabel") || {}, E = C.show || !1;
        r.add(a[_] = new Je({
          silent: !0,
          invisible: !E,
          style: Nn(D, {
            x: 0,
            y: 0,
            text: "",
            verticalAlign: "middle",
            align: "center",
            fill: D.getTextColor(),
            font: D.getFont()
          }),
          z2: 10
        }));
      }, this);
      var v = c;
      if (h) {
        var d = _t(u.get("moveHandleSize"), s[1]), p = n.moveHandle = new Ce({
          style: u.getModel("moveHandleStyle").getItemStyle(),
          silent: !0,
          shape: {
            r: [0, 0, 2, 2],
            y: s[1] - 0.5,
            height: d
          }
        }), m = d * 0.8, g = n.moveHandleIcon = Yr(u.get("moveHandleIcon"), -m / 2, -m / 2, m, m, G.color.neutral00, !0);
        g.silent = !0, g.y = s[1] + d / 2 - 0.5, p.ensureState("emphasis").style = u.getModel(["emphasis", "moveHandleStyle"]).getItemStyle();
        var y = Math.min(s[1] / 2, Math.max(d, 10));
        v = n.moveZone = new Ce({
          invisible: !0,
          shape: {
            y: s[1] - y,
            height: d + y
          }
        }), v.on("mouseover", function() {
          l.enterEmphasis(p);
        }).on("mouseout", function() {
          l.leaveEmphasis(p);
        }), o.add(p), o.add(g), o.add(v);
      }
      v.attr({
        draggable: !0,
        cursor: "grab",
        drift: te(this._onActualMoveZoneDrift, this),
        ondragstart: te(this._onActualMoveZoneDragStart, this),
        ondragend: te(this._onActualMoveZoneDragEnd, this),
        onmouseover: te(this._onOverDataInfoTriggerArea, this, !0),
        onmouseout: te(this._onOverDataInfoTriggerArea, this, !1)
      });
    }, e.prototype._resetInterval = function() {
      var r = this._range = this.dataZoomModel.getPercentRange(), n = this._getViewExtent();
      this._handleEnds = [Oe(r[0], [0, 100], n, !0), Oe(r[1], [0, 100], n, !0)];
    }, e.prototype._updateInterval = function(r, n) {
      var i = this.dataZoomModel, a = this._handleEnds, o = this._getViewExtent(), s = i.findRepresentativeAxisProxy().getMinMaxSpan(), u = [0, 100];
      to(n, a, o, i.get("zoomLock") ? "all" : r, s.minSpan != null ? Oe(s.minSpan, u, o, !0) : null, s.maxSpan != null ? Oe(s.maxSpan, u, o, !0) : null);
      var l = this._range, f = this._range = Lr([Oe(a[0], o, u, !0), Oe(a[1], o, u, !0)]);
      return !l || l[0] !== f[0] || l[1] !== f[1];
    }, e.prototype._updateView = function(r) {
      var n = this._displayables, i = this._handleEnds, a = Lr(i.slice()), o = this._size;
      x([0, 1], function(v) {
        var d = n.handles[v], p = this._handleHeight;
        d.attr({
          scaleX: p / 2,
          scaleY: p / 2,
          // This is a trick, by adding an extra tiny offset to let the default handle's end point align to the drag window.
          // NOTE: It may affect some custom shapes a bit. But we prefer to have better result by default.
          x: i[v] + (v ? -1 : 1),
          y: o[1] / 2 - p / 2
        });
      }, this), n.filler.setShape({
        x: a[0],
        y: 0,
        width: a[1] - a[0],
        height: o[1]
      });
      var s = {
        x: a[0],
        width: a[1] - a[0]
      };
      n.moveHandle && (n.moveHandle.setShape(s), n.moveZone.setShape(s), n.moveZone.getBoundingRect(), n.moveHandleIcon && n.moveHandleIcon.attr("x", s.x + s.width / 2));
      for (var u = n.dataShadowSegs, l = [0, a[0], a[1], o[0]], f = 0; f < u.length; f++) {
        var h = u[f], c = h.getClipPath();
        c || (c = new Ce(), h.setClipPath(c)), c.setShape({
          x: l[f],
          y: 0,
          width: l[f + 1] - l[f],
          height: o[1]
        });
      }
      this._updateDataInfo(r);
    }, e.prototype._updateDataInfo = function(r) {
      var n = this.dataZoomModel, i = this._displayables, a = i.handleLabels, o = this._orient, s = ["", ""];
      if (n.get("showDetail")) {
        var u = n.findRepresentativeAxisProxy(), l = u.getAxisModel().axis.scale;
        if (u) {
          var f = this._range, h;
          if (r) {
            var c = {
              start: f[0],
              end: f[1]
            }, v = j1(n, u);
            if (v) {
              var d = v.calculateDataWindow(c).percentInverted;
              c = {
                start: d[0],
                end: d[1]
              };
            }
            h = u.calculateDataWindow(c);
          } else
            h = u.getWindow();
          s = [Lm(n, 0, h, l), Lm(n, 1, h, l)];
        }
      }
      var p = Lr(this._handleEnds.slice());
      m.call(this, 0), m.call(this, 1);
      function m(g) {
        var y = w0(i.handles[g].parent, this.group), _ = T0(g === 0 ? "right" : "left", y), S = this._handleWidth / 2 + Y2, b = Ua([p[g] + (g === 0 ? -S : S), this._size[1] / 2], y);
        a[g].setStyle({
          x: b[0],
          y: b[1],
          verticalAlign: o === va ? "middle" : _,
          align: o === va ? _ : "center",
          text: s[g]
        });
      }
    }, e.prototype._onOverDataInfoTriggerArea = function(r) {
      this._isOverDataInfoTriggerArea = r, this._showDataInfo(r);
    }, e.prototype._showDataInfo = function(r) {
      var n = this.dataZoomModel.get("handleLabel") || {}, i = n.show || !1, a = this.dataZoomModel.getModel(["emphasis", "handleLabel"]), o = a.get("show") || !1, s = r || this._dragging ? o : i, u = this._displayables, l = u.handleLabels;
      l[0].attr("invisible", !s), l[1].attr("invisible", !s), u.moveHandle && this.api[s ? "enterEmphasis" : "leaveEmphasis"](u.moveHandle, 1);
    }, e.prototype._onActualMoveZoneDrift = function(r, n, i) {
      this.api.getZr().setCursorStyle("grabbing"), this._onDragMove("all", r, n, i);
    }, e.prototype._onActualMoveZoneDragStart = function(r) {
      r.target.attr("cursor", "grabbing"), this._showDataInfo(!0);
    }, e.prototype._onActualMoveZoneDragEnd = function(r) {
      r.target.attr("cursor", "grab"), this._onDragEnd();
    }, e.prototype._onDragMove = function(r, n, i, a) {
      this._dragging = !0, Ti(a.event);
      var o = this._displayables.sliderGroup.getLocalTransform(), s = Ua([n, i], o, !0), u = this._updateInterval(r, s[0]), l = this.dataZoomModel.get("realtime");
      this._updateView(!l), u && l && this._dispatchZoomAction(!0);
    }, e.prototype._onDragEnd = function() {
      this._dragging = !1, this._isOverDataInfoTriggerArea || this._showDataInfo(!1);
      var r = this.dataZoomModel.get("realtime");
      !r && this._dispatchZoomAction(!1);
    }, e.prototype._onClickPanel = function(r) {
      var n = this._size, i = this._displayables.sliderGroup.transformCoordToLocal(r.offsetX, r.offsetY);
      if (!(i[0] < 0 || i[0] > n[0] || i[1] < 0 || i[1] > n[1])) {
        var a = this._handleEnds, o = (a[0] + a[1]) / 2, s = this._updateInterval("all", i[0] - o);
        this._updateView(), s && this._dispatchZoomAction(!1);
      }
    }, e.prototype._onBrushStart = function(r) {
      var n = r.offsetX, i = r.offsetY;
      this._brushStart = new _e(n, i), this._brushing = !0, this._brushStartTime = +/* @__PURE__ */ new Date();
    }, e.prototype._onBrushEnd = function(r) {
      if (this._brushing) {
        var n = this._displayables.brushRect;
        if (this._brushing = !1, !!n) {
          n.attr("ignore", !0);
          var i = n.shape, a = +/* @__PURE__ */ new Date();
          if (!(a - this._brushStartTime < 200 && Math.abs(i.width) < 5)) {
            var o = this._getViewExtent(), s = [0, 100], u = this._handleEnds = [i.x, i.x + i.width], l = this.dataZoomModel.findRepresentativeAxisProxy().getMinMaxSpan();
            to(0, u, o, 0, l.minSpan != null ? Oe(l.minSpan, s, o, !0) : null, l.maxSpan != null ? Oe(l.maxSpan, s, o, !0) : null), this._range = Lr([Oe(u[0], o, s, !0), Oe(u[1], o, s, !0)]), this._updateView(), this._dispatchZoomAction(!1);
          }
        }
      }
    }, e.prototype._onBrush = function(r) {
      this._brushing && (Ti(r.event), this._updateBrushRect(r.offsetX, r.offsetY));
    }, e.prototype._updateBrushRect = function(r, n) {
      var i = this._displayables, a = this.dataZoomModel, o = i.brushRect;
      o || (o = i.brushRect = new ca({
        silent: !0,
        style: a.getModel("brushStyle").getItemStyle()
      }), i.sliderGroup.add(o)), o.attr("ignore", !1);
      var s = this._brushStart, u = this._displayables.sliderGroup, l = u.transformCoordToLocal(r, n), f = u.transformCoordToLocal(s.x, s.y), h = this._size;
      l[0] = Math.max(Math.min(h[0], l[0]), 0), o.setShape({
        x: f[0],
        y: 0,
        width: l[0] - f[0],
        height: h[1]
      });
    }, e.prototype._dispatchZoomAction = function(r) {
      var n = this._range;
      this.api.dispatchAction({
        type: "dataZoom",
        from: this.uid,
        dataZoomId: this.dataZoomModel.id,
        animation: r ? Z2 : null,
        start: n[0],
        end: n[1]
      });
    }, e.prototype._findCoordRect = function() {
      var r, n = K1(this.dataZoomModel).infoList;
      if (!r && n.length) {
        var i = n[0].model.coordinateSystem;
        r = i.getRect && i.getRect();
      }
      if (!r) {
        var a = this.api.getWidth(), o = this.api.getHeight();
        r = {
          x: a * 0.2,
          y: o * 0.2,
          width: a * 0.6,
          height: o * 0.6
        };
      }
      return r;
    }, e.type = "dataZoom.slider", e;
  }(J1)
);
function Lm(t, e, r, n) {
  var i = t.get("labelFormatter"), a = t.get("labelPrecision");
  (a == null || a === "auto") && (a = r.valuePrecision);
  var o = r.value[e], s = o == null || isNaN(o) ? "" : Mt(n) || go(n) ? n.getLabel({
    value: Math.round(o)
  }) : isFinite(a) ? ue(o, a, !0) : o + "";
  return Q(i) ? i(o, s) : z(i) ? i.replace("{value}", s) : s;
}
function q2(t) {
  var e = {
    x: "y",
    y: "x",
    radius: "angle",
    angle: "radius"
  };
  return e[t];
}
function K2(t) {
  return t === "vertical" ? "ns-resize" : "ew-resize";
}
function Q2(t) {
  t.registerComponentModel(G2), t.registerComponentView($2), eS(t);
}
function j2(t) {
  nr(H2), nr(Q2);
}
var Ef = Math.sin, Af = Math.cos, uS = Math.PI, yn = Math.PI * 2, J2 = 180 / uS, lS = function() {
  function t() {
  }
  return t.prototype.reset = function(e) {
    this._start = !0, this._d = [], this._str = "", this._p = Math.pow(10, e || 4);
  }, t.prototype.moveTo = function(e, r) {
    this._add("M", e, r);
  }, t.prototype.lineTo = function(e, r) {
    this._add("L", e, r);
  }, t.prototype.bezierCurveTo = function(e, r, n, i, a, o) {
    this._add("C", e, r, n, i, a, o);
  }, t.prototype.quadraticCurveTo = function(e, r, n, i) {
    this._add("Q", e, r, n, i);
  }, t.prototype.arc = function(e, r, n, i, a, o) {
    this.ellipse(e, r, n, n, 0, i, a, o);
  }, t.prototype.ellipse = function(e, r, n, i, a, o, s, u) {
    var l = s - o, f = !u, h = Math.abs(l), c = Or(h - yn) || (f ? l >= yn : -l >= yn), v = l > 0 ? l % yn : l % yn + yn, d = !1;
    c ? d = !0 : Or(h) ? d = !1 : d = v >= uS == !!f;
    var p = e + n * Af(o), m = r + i * Ef(o);
    this._start && this._add("M", p, m);
    var g = Math.round(a * J2);
    if (c) {
      var y = 1 / this._p, _ = (f ? 1 : -1) * (yn - y);
      this._add("A", n, i, g, 1, +f, e + n * Af(o + _), r + i * Ef(o + _)), y > 0.01 && this._add("A", n, i, g, 0, +f, p, m);
    } else {
      var S = e + n * Af(s), b = r + i * Ef(s);
      this._add("A", n, i, g, +d, +f, S, b);
    }
  }, t.prototype.rect = function(e, r, n, i) {
    this._add("M", e, r), this._add("l", n, 0), this._add("l", 0, i), this._add("l", -n, 0), this._add("Z");
  }, t.prototype.closePath = function() {
    this._d.length > 0 && this._add("Z");
  }, t.prototype._add = function(e, r, n, i, a, o, s, u, l) {
    for (var f = [], h = this._p, c = 1; c < arguments.length; c++) {
      var v = arguments[c];
      if (isNaN(v)) {
        this._invalid = !0;
        return;
      }
      f.push(Math.round(v * h) / h);
    }
    this._d.push(e + f.join(" ")), this._start = e === "Z";
  }, t.prototype.generateStr = function() {
    this._str = this._invalid ? "" : this._d.join(""), this._d = [];
  }, t.prototype.getStr = function() {
    return this._str;
  }, t;
}(), _v = "none", eP = Math.round;
function tP(t) {
  var e = t.fill;
  return e != null && e !== _v;
}
function rP(t) {
  var e = t.stroke;
  return e != null && e !== _v;
}
var Zh = ["lineCap", "miterLimit", "lineJoin"], nP = X(Zh, function(t) {
  return "stroke-" + t.toLowerCase();
});
function iP(t, e, r, n) {
  var i = e.opacity == null ? 1 : e.opacity;
  if (r instanceof or) {
    t("opacity", i);
    return;
  }
  if (tP(e)) {
    var a = ka(e.fill);
    t("fill", a.color);
    var o = e.fillOpacity != null ? e.fillOpacity * a.opacity * i : a.opacity * i;
    o < 1 && t("fill-opacity", o);
  } else
    t("fill", _v);
  if (rP(e)) {
    var s = ka(e.stroke);
    t("stroke", s.color);
    var u = e.strokeNoScale ? r.getLineScale() : 1, l = u ? (e.lineWidth || 0) / u : 0, f = e.strokeOpacity != null ? e.strokeOpacity * s.opacity * i : s.opacity * i, h = e.strokeFirst;
    if (l !== 1 && t("stroke-width", l), h && t("paint-order", h ? "stroke" : "fill"), f < 1 && t("stroke-opacity", f), e.lineDash) {
      var c = ev(r), v = c[0], d = c[1];
      v && (d = eP(d || 0), t("stroke-dasharray", v.join(",")), (d || n) && t("stroke-dashoffset", d));
    }
    for (var p = 0; p < Zh.length; p++) {
      var m = Zh[p];
      if (e[m] !== zs[m]) {
        var g = e[m] || zs[m];
        g && t(nP[p], g);
      }
    }
  }
}
var fS = "http://www.w3.org/2000/svg", hS = "http://www.w3.org/1999/xlink", aP = "http://www.w3.org/2000/xmlns/", oP = "http://www.w3.org/XML/1998/namespace", Pm = "ecmeta_";
function cS(t) {
  return document.createElementNS(fS, t);
}
function Ne(t, e, r, n, i) {
  return {
    tag: t,
    attrs: r || {},
    children: n,
    text: i,
    key: e
  };
}
function sP(t, e) {
  var r = [];
  if (e)
    for (var n in e) {
      var i = e[n], a = n;
      i !== !1 && (i !== !0 && i != null && (a += '="' + i + '"'), r.push(a));
    }
  return "<" + t + " " + r.join(" ") + ">";
}
function uP(t) {
  return "</" + t + ">";
}
function Sv(t, e) {
  e = e || {};
  var r = e.newline ? `
` : "";
  function n(i) {
    var a = i.children, o = i.tag, s = i.attrs, u = i.text;
    return sP(o, s) + (o !== "style" ? $e(u) : u || "") + (a ? "" + r + X(a, function(l) {
      return n(l);
    }).join(r) + r : "") + uP(o);
  }
  return n(t);
}
function lP(t, e, r) {
  r = r || {};
  var n = r.newline ? `
` : "", i = " {" + n, a = n + "}", o = X(le(t), function(u) {
    return u + i + X(le(t[u]), function(l) {
      return l + ":" + t[u][l] + ";";
    }).join(n) + a;
  }).join(n), s = X(le(e), function(u) {
    return "@keyframes " + u + i + X(le(e[u]), function(l) {
      return l + i + X(le(e[u][l]), function(f) {
        var h = e[u][l][f];
        return f === "d" && (h = 'path("' + h + '")'), f + ":" + h + ";";
      }).join(n) + a;
    }).join(n) + a;
  }).join(n);
  return !o && !s ? "" : ["<![CDATA[", o, s, "]]>"].join(n);
}
function $h(t) {
  return {
    zrId: t,
    shadowCache: {},
    patternCache: {},
    gradientCache: {},
    clipPathCache: {},
    defs: {},
    cssNodes: {},
    cssAnims: {},
    cssStyleCache: {},
    cssAnimIdx: 0,
    shadowIdx: 0,
    gradientIdx: 0,
    patternIdx: 0,
    clipPathIdx: 0
  };
}
function Nm(t, e, r, n) {
  return Ne("svg", "root", {
    width: t,
    height: e,
    xmlns: fS,
    "xmlns:xlink": hS,
    version: "1.1",
    baseProfile: "full",
    viewBox: n ? "0 0 " + t + " " + e : !1
  }, r);
}
var fP = 0;
function vS() {
  return fP++;
}
var Rm = {
  cubicIn: "0.32,0,0.67,0",
  cubicOut: "0.33,1,0.68,1",
  cubicInOut: "0.65,0,0.35,1",
  quadraticIn: "0.11,0,0.5,0",
  quadraticOut: "0.5,1,0.89,1",
  quadraticInOut: "0.45,0,0.55,1",
  quarticIn: "0.5,0,0.75,0",
  quarticOut: "0.25,1,0.5,1",
  quarticInOut: "0.76,0,0.24,1",
  quinticIn: "0.64,0,0.78,0",
  quinticOut: "0.22,1,0.36,1",
  quinticInOut: "0.83,0,0.17,1",
  sinusoidalIn: "0.12,0,0.39,0",
  sinusoidalOut: "0.61,1,0.88,1",
  sinusoidalInOut: "0.37,0,0.63,1",
  exponentialIn: "0.7,0,0.84,0",
  exponentialOut: "0.16,1,0.3,1",
  exponentialInOut: "0.87,0,0.13,1",
  circularIn: "0.55,0,1,0.45",
  circularOut: "0,0.55,0.45,1",
  circularInOut: "0.85,0,0.15,1"
}, Sn = "transform-origin";
function hP(t, e, r) {
  var n = R({}, t.shape);
  R(n, e), t.buildPath(r, n);
  var i = new lS();
  return i.reset(dy(t)), r.rebuildPath(i, 1), i.generateStr(), i.getStr();
}
function cP(t, e) {
  var r = e.originX, n = e.originY;
  (r || n) && (t[Sn] = r + "px " + n + "px");
}
var vP = {
  fill: "fill",
  opacity: "opacity",
  lineWidth: "stroke-width",
  lineDashOffset: "stroke-dashoffset"
};
function dS(t, e) {
  var r = e.zrId + "-ani-" + e.cssAnimIdx++;
  return e.cssAnims[r] = t, r;
}
function dP(t, e, r) {
  var n = t.shape.paths, i = {}, a, o;
  if (x(n, function(u) {
    var l = $h(r.zrId);
    l.animation = !0, Ju(u, {}, l, !0);
    var f = l.cssAnims, h = l.cssNodes, c = le(f), v = c.length;
    if (v) {
      o = c[v - 1];
      var d = f[o];
      for (var p in d) {
        var m = d[p];
        i[p] = i[p] || { d: "" }, i[p].d += m.d || "";
      }
      for (var g in h) {
        var y = h[g].animation;
        y.indexOf(o) >= 0 && (a = y);
      }
    }
  }), !!a) {
    e.d = !1;
    var s = dS(i, r);
    return a.replace(o, s);
  }
}
function km(t) {
  return z(t) ? Rm[t] ? "cubic-bezier(" + Rm[t] + ")" : ac(t) ? t : "" : "";
}
function Ju(t, e, r, n) {
  var i = t.animators, a = i.length, o = [];
  if (t instanceof v0) {
    var s = dP(t, e, r);
    if (s)
      o.push(s);
    else if (!a)
      return;
  } else if (!a)
    return;
  for (var u = {}, l = 0; l < a; l++) {
    var f = i[l], h = [f.getMaxTime() / 1e3 + "s"], c = km(f.getClip().easing), v = f.getDelay();
    c ? h.push(c) : h.push("linear"), v && h.push(v / 1e3 + "s"), f.getLoop() && h.push("infinite");
    var d = h.join(" ");
    u[d] = u[d] || [d, []], u[d][1].push(f);
  }
  function p(y) {
    var _ = y[1], S = _.length, b = {}, w = {}, T = {}, M = "animation-timing-function";
    function D(Ue, de, De) {
      for (var ee = Ue.getTracks(), se = Ue.getMaxTime(), Et = 0; Et < ee.length; Et++) {
        var Le = ee[Et];
        if (Le.needsAnimate()) {
          var Ui = Le.keyframes, Zr = Le.propName;
          if (De && (Zr = De(Zr)), Zr)
            for (var el = 0; el < Ui.length; el++) {
              var _o = Ui[el], So = Math.round(_o.time / se * 100) + "%", Cv = km(_o.easing), Dv = _o.rawValue;
              (z(Dv) || Te(Dv)) && (de[So] = de[So] || {}, de[So][Zr] = _o.rawValue, Cv && (de[So][M] = Cv));
            }
        }
      }
    }
    for (var C = 0; C < S; C++) {
      var E = _[C], I = E.targetName;
      I ? I === "shape" && D(E, w) : !n && D(E, b);
    }
    for (var A in b) {
      var O = {};
      Ba(O, t), R(O, b[A]);
      var P = py(O), L = b[A][M];
      T[A] = P ? {
        transform: P
      } : {}, cP(T[A], O), L && (T[A][M] = L);
    }
    var B, U = !0;
    for (var A in w) {
      T[A] = T[A] || {};
      var Y = !B, L = w[A][M];
      Y && (B = new zr());
      var j = B.len();
      B.reset(), T[A].d = hP(t, w[A], B);
      var K = B.len();
      if (!Y && j !== K) {
        U = !1;
        break;
      }
      L && (T[A][M] = L);
    }
    if (!U)
      for (var A in T)
        delete T[A].d;
    if (!n)
      for (var C = 0; C < S; C++) {
        var E = _[C], I = E.targetName;
        I === "style" && D(E, T, function(ee) {
          return vP[ee];
        });
      }
    for (var J = le(T), $ = !0, F, C = 1; C < J.length; C++) {
      var ne = J[C - 1], oe = J[C];
      if (T[ne][Sn] !== T[oe][Sn]) {
        $ = !1;
        break;
      }
      F = T[ne][Sn];
    }
    if ($ && F) {
      for (var A in T)
        T[A][Sn] && delete T[A][Sn];
      e[Sn] = F;
    }
    if (He(J, function(Ue) {
      return le(T[Ue]).length > 0;
    }).length) {
      var ze = dS(T, r);
      return ze + " " + y[0] + " both";
    }
  }
  for (var m in u) {
    var s = p(u[m]);
    s && o.push(s);
  }
  if (o.length) {
    var g = r.zrId + "-cls-" + vS();
    r.cssNodes["." + g] = {
      animation: o.join(",")
    }, e.class = g;
  }
}
function pP(t, e, r) {
  if (!t.ignore)
    if (t.isSilent()) {
      var n = {
        "pointer-events": "none"
      };
      Bm(n, e, r);
    } else {
      var i = t.states.emphasis && t.states.emphasis.style ? t.states.emphasis.style : {}, a = i.fill;
      if (!a) {
        var o = t.style && t.style.fill, s = t.states.select && t.states.select.style && t.states.select.style.fill, u = t.currentStates.indexOf("select") >= 0 && s || o;
        u && (a = Yf(u));
      }
      var l = i.lineWidth;
      if (l) {
        var f = !i.strokeNoScale && t.transform ? t.transform[0] : 1;
        l = l / f;
      }
      var n = {
        cursor: "pointer"
      };
      a && (n.fill = a), i.stroke && (n.stroke = i.stroke), l && (n["stroke-width"] = l), Bm(n, e, r);
    }
}
function Bm(t, e, r, n) {
  var i = JSON.stringify(t), a = r.cssStyleCache[i];
  a || (a = r.zrId + "-cls-" + vS(), r.cssStyleCache[i] = a, r.cssNodes["." + a + ":hover"] = t), e.class = e.class ? e.class + " " + a : a;
}
var ro = Math.round;
function pS(t) {
  return t && z(t.src);
}
function gS(t) {
  return t && Q(t.toDataURL);
}
function bv(t, e, r, n) {
  iP(function(i, a) {
    var o = i === "fill" || i === "stroke";
    o && vy(a) ? yS(e, t, i, n) : o && oc(a) ? _S(r, t, i, n) : t[i] = a, o && n.ssr && a === "none" && (t["pointer-events"] = "visible");
  }, e, r, !1), wP(r, t, n);
}
function wv(t, e) {
  var r = pw(e);
  r && (r.each(function(n, i) {
    n != null && (t[(Pm + i).toLowerCase()] = n + "");
  }), e.isSilent() && (t[Pm + "silent"] = "true"));
}
function Vm(t) {
  return Or(t[0] - 1) && Or(t[1]) && Or(t[2]) && Or(t[3] - 1);
}
function gP(t) {
  return Or(t[4]) && Or(t[5]);
}
function Tv(t, e, r) {
  if (e && !(gP(e) && Vm(e))) {
    var n = 1e4;
    t.transform = Vm(e) ? "translate(" + ro(e[4] * n) / n + " " + ro(e[5] * n) / n + ")" : kb(e);
  }
}
function Fm(t, e, r) {
  for (var n = t.points, i = [], a = 0; a < n.length; a++)
    i.push(ro(n[a][0] * r) / r), i.push(ro(n[a][1] * r) / r);
  e.points = i.join(" ");
}
function zm(t) {
  return !t.smooth;
}
function mP(t) {
  var e = X(t, function(r) {
    return typeof r == "string" ? [r, r] : r;
  });
  return function(r, n, i) {
    for (var a = 0; a < e.length; a++) {
      var o = e[a], s = r[o[0]];
      s != null && (n[o[1]] = ro(s * i) / i);
    }
  };
}
var yP = {
  circle: [mP(["cx", "cy", "r"])],
  polyline: [Fm, zm],
  polygon: [Fm, zm]
};
function _P(t) {
  for (var e = t.animators, r = 0; r < e.length; r++)
    if (e[r].targetName === "shape")
      return !0;
  return !1;
}
function mS(t, e) {
  var r = t.style, n = t.shape, i = yP[t.type], a = {}, o = e.animation, s = "path", u = t.style.strokePercent, l = e.compress && dy(t) || 4;
  if (i && !e.willUpdate && !(i[1] && !i[1](n)) && !(o && _P(t)) && !(u < 1)) {
    s = t.type;
    var f = Math.pow(10, l);
    i[0](n, a, f);
  } else {
    var h = !t.path || t.shapeChanged();
    t.path || t.createPathProxy();
    var c = t.path;
    h && (c.beginPath(), t.buildPath(c, t.shape), t.pathUpdated());
    var v = c.getVersion(), d = t, p = d.__svgPathBuilder;
    (d.__svgPathVersion !== v || !p || u !== d.__svgPathStrokePercent) && (p || (p = d.__svgPathBuilder = new lS()), p.reset(l), c.rebuildPath(p, u), p.generateStr(), d.__svgPathVersion = v, d.__svgPathStrokePercent = u), a.d = p.getStr();
  }
  return Tv(a, t.transform), bv(a, r, t, e), wv(a, t), e.animation && Ju(t, a, e), e.emphasis && pP(t, a, e), Ne(s, t.id + "", a);
}
function SP(t, e) {
  var r = t.style, n = r.image;
  if (n && !z(n) && (pS(n) ? n = n.src : gS(n) && (n = n.toDataURL())), !!n) {
    var i = r.x || 0, a = r.y || 0, o = r.width, s = r.height, u = {
      href: n,
      width: o,
      height: s
    };
    return i && (u.x = i), a && (u.y = a), Tv(u, t.transform), bv(u, r, t, e), wv(u, t), e.animation && Ju(t, u, e), Ne("image", t.id + "", u);
  }
}
function bP(t, e) {
  var r = t.style, n = r.text;
  if (n != null && (n += ""), !(!n || isNaN(r.x) || isNaN(r.y))) {
    var i = r.font || gr, a = r.x || 0, o = Vb(r.y || 0, uo(i), r.textBaseline), s = Bb[r.textAlign] || r.textAlign, u = {
      "dominant-baseline": "central",
      "text-anchor": s
    };
    if ($y(r)) {
      var l = "", f = r.fontStyle, h = Zy(r.fontSize);
      if (!parseFloat(h))
        return;
      var c = r.fontFamily || Xm, v = r.fontWeight;
      l += "font-size:" + h + ";font-family:" + c + ";", f && f !== "normal" && (l += "font-style:" + f + ";"), v && v !== "normal" && (l += "font-weight:" + v + ";"), u.style = l;
    } else
      u.style = "font: " + i;
    return n.match(/\s/) && (u["xml:space"] = "preserve"), a && (u.x = a), o && (u.y = o), Tv(u, t.transform), bv(u, r, t, e), wv(u, t), e.animation && Ju(t, u, e), Ne("text", t.id + "", u, void 0, n);
  }
}
function Hm(t, e) {
  if (t instanceof be)
    return mS(t, e);
  if (t instanceof or)
    return SP(t, e);
  if (t instanceof za)
    return bP(t, e);
}
function wP(t, e, r) {
  var n = t.style;
  if (Fb(n)) {
    var i = zb(t), a = r.shadowCache, o = a[i];
    if (!o) {
      var s = t.getGlobalScale(), u = s[0], l = s[1];
      if (!u || !l)
        return;
      var f = n.shadowOffsetX || 0, h = n.shadowOffsetY || 0, c = n.shadowBlur, v = ka(n.shadowColor), d = v.opacity, p = v.color, m = c / 2 / u, g = c / 2 / l, y = m + " " + g;
      o = r.zrId + "-s" + r.shadowIdx++, r.defs[o] = Ne("filter", o, {
        id: o,
        x: "-100%",
        y: "-100%",
        width: "300%",
        height: "300%"
      }, [
        Ne("feDropShadow", "", {
          dx: f / u,
          dy: h / l,
          stdDeviation: y,
          "flood-color": p,
          "flood-opacity": d
        })
      ]), a[i] = o;
    }
    e.filter = Tu(o);
  }
}
function yS(t, e, r, n) {
  var i = t[r], a, o = {
    gradientUnits: i.global ? "userSpaceOnUse" : "objectBoundingBox"
  };
  if (hy(i))
    a = "linearGradient", o.x1 = i.x, o.y1 = i.y, o.x2 = i.x2, o.y2 = i.y2;
  else if (cy(i))
    a = "radialGradient", o.cx = W(i.x, 0.5), o.cy = W(i.y, 0.5), o.r = W(i.r, 0.5);
  else {
    process.env.NODE_ENV !== "production" && _i("Illegal gradient type.");
    return;
  }
  for (var s = i.colorStops, u = [], l = 0, f = s.length; l < f; ++l) {
    var h = Xf(s[l].offset) * 100 + "%", c = s[l].color, v = ka(c), d = v.color, p = v.opacity, m = {
      offset: h
    };
    m["stop-color"] = d, p < 1 && (m["stop-opacity"] = p), u.push(Ne("stop", l + "", m));
  }
  var g = Ne(a, "", o, u), y = Sv(g), _ = n.gradientCache, S = _[y];
  S || (S = n.zrId + "-g" + n.gradientIdx++, _[y] = S, o.id = S, n.defs[S] = Ne(a, S, o, u)), e[r] = Tu(S);
}
function _S(t, e, r, n) {
  var i = t.style[r], a = t.getBoundingRect(), o = {}, s = i.repeat, u = s === "no-repeat", l = s === "repeat-x", f = s === "repeat-y", h;
  if (fy(i)) {
    var c = i.imageWidth, v = i.imageHeight, d = void 0, p = i.image;
    if (z(p) ? d = p : pS(p) ? d = p.src : gS(p) && (d = p.toDataURL()), typeof Image > "u") {
      var m = "Image width/height must been given explictly in svg-ssr renderer.";
      N(c, m), N(v, m);
    } else if (c == null || v == null) {
      var g = function(C, E) {
        if (C) {
          var I = C.elm, A = c || E.width, O = v || E.height;
          C.tag === "pattern" && (l ? (O = 1, A /= a.width) : f && (A = 1, O /= a.height)), C.attrs.width = A, C.attrs.height = O, I && (I.setAttribute("width", A), I.setAttribute("height", O));
        }
      }, y = gc(d, null, t, function(C) {
        u || g(w, C), g(h, C);
      });
      y && y.width && y.height && (c = c || y.width, v = v || y.height);
    }
    h = Ne("image", "img", {
      href: d,
      width: c,
      height: v
    }), o.width = c, o.height = v;
  } else i.svgElement && (h = ae(i.svgElement), o.width = i.svgWidth, o.height = i.svgHeight);
  if (h) {
    var _, S;
    u ? _ = S = 1 : l ? (S = 1, _ = o.width / a.width) : f ? (_ = 1, S = o.height / a.height) : o.patternUnits = "userSpaceOnUse", _ != null && !isNaN(_) && (o.width = _), S != null && !isNaN(S) && (o.height = S);
    var b = py(i);
    b && (o.patternTransform = b);
    var w = Ne("pattern", "", o, [h]), T = Sv(w), M = n.patternCache, D = M[T];
    D || (D = n.zrId + "-p" + n.patternIdx++, M[T] = D, o.id = D, w = n.defs[D] = Ne("pattern", D, o, [h])), e[r] = Tu(D);
  }
}
function TP(t, e, r) {
  var n = r.clipPathCache, i = r.defs, a = n[t.id];
  if (!a) {
    a = r.zrId + "-c" + r.clipPathIdx++;
    var o = {
      id: a
    };
    n[t.id] = a, i[a] = Ne("clipPath", a, o, [mS(t, r)]);
  }
  e["clip-path"] = Tu(a);
}
function Gm(t) {
  return document.createTextNode(t);
}
function Tn(t, e, r) {
  t.insertBefore(e, r);
}
function Um(t, e) {
  t.removeChild(e);
}
function Wm(t, e) {
  t.appendChild(e);
}
function SS(t) {
  return t.parentNode;
}
function bS(t) {
  return t.nextSibling;
}
function If(t, e) {
  t.textContent = e;
}
var Ym = 58, xP = 120, CP = Ne("", "");
function qh(t) {
  return t === void 0;
}
function Ut(t) {
  return t !== void 0;
}
function DP(t, e, r) {
  for (var n = {}, i = e; i <= r; ++i) {
    var a = t[i].key;
    a !== void 0 && (process.env.NODE_ENV !== "production" && n[a] != null && console.error("Duplicate key " + a), n[a] = i);
  }
  return n;
}
function wa(t, e) {
  var r = t.key === e.key, n = t.tag === e.tag;
  return n && r;
}
function no(t) {
  var e, r = t.children, n = t.tag;
  if (Ut(n)) {
    var i = t.elm = cS(n);
    if (xv(CP, t), H(r))
      for (e = 0; e < r.length; ++e) {
        var a = r[e];
        a != null && Wm(i, no(a));
      }
    else Ut(t.text) && !q(t.text) && Wm(i, Gm(t.text));
  } else
    t.elm = Gm(t.text);
  return t.elm;
}
function wS(t, e, r, n, i) {
  for (; n <= i; ++n) {
    var a = r[n];
    a != null && Tn(t, no(a), e);
  }
}
function Su(t, e, r, n) {
  for (; r <= n; ++r) {
    var i = e[r];
    if (i != null)
      if (Ut(i.tag)) {
        var a = SS(i.elm);
        Um(a, i.elm);
      } else
        Um(t, i.elm);
  }
}
function xv(t, e) {
  var r, n = e.elm, i = t && t.attrs || {}, a = e.attrs || {};
  if (i !== a) {
    for (r in a) {
      var o = a[r], s = i[r];
      s !== o && (o === !0 ? n.setAttribute(r, "") : o === !1 ? n.removeAttribute(r) : r === "style" ? n.style.cssText = o : r.charCodeAt(0) !== xP ? n.setAttribute(r, o) : r === "xmlns:xlink" || r === "xmlns" ? n.setAttributeNS(aP, r, o) : r.charCodeAt(3) === Ym ? n.setAttributeNS(oP, r, o) : r.charCodeAt(5) === Ym ? n.setAttributeNS(hS, r, o) : n.setAttribute(r, o));
    }
    for (r in i)
      r in a || n.removeAttribute(r);
  }
}
function MP(t, e, r) {
  for (var n = 0, i = 0, a = e.length - 1, o = e[0], s = e[a], u = r.length - 1, l = r[0], f = r[u], h, c, v, d; n <= a && i <= u; )
    o == null ? o = e[++n] : s == null ? s = e[--a] : l == null ? l = r[++i] : f == null ? f = r[--u] : wa(o, l) ? (si(o, l), o = e[++n], l = r[++i]) : wa(s, f) ? (si(s, f), s = e[--a], f = r[--u]) : wa(o, f) ? (si(o, f), Tn(t, o.elm, bS(s.elm)), o = e[++n], f = r[--u]) : wa(s, l) ? (si(s, l), Tn(t, s.elm, o.elm), s = e[--a], l = r[++i]) : (qh(h) && (h = DP(e, n, a)), c = h[l.key], qh(c) ? Tn(t, no(l), o.elm) : (v = e[c], v.tag !== l.tag ? Tn(t, no(l), o.elm) : (si(v, l), e[c] = void 0, Tn(t, v.elm, o.elm))), l = r[++i]);
  (n <= a || i <= u) && (n > a ? (d = r[u + 1] == null ? null : r[u + 1].elm, wS(t, d, r, i, u)) : Su(t, e, n, a));
}
function si(t, e) {
  var r = e.elm = t.elm, n = t.children, i = e.children;
  t !== e && (xv(t, e), qh(e.text) ? Ut(n) && Ut(i) ? n !== i && MP(r, n, i) : Ut(i) ? (Ut(t.text) && If(r, ""), wS(r, null, i, 0, i.length - 1)) : Ut(n) ? Su(r, n, 0, n.length - 1) : Ut(t.text) && If(r, "") : t.text !== e.text && (Ut(n) && Su(r, n, 0, n.length - 1), If(r, e.text)));
}
function EP(t, e) {
  if (wa(t, e))
    si(t, e);
  else {
    var r = t.elm, n = SS(r);
    no(e), n !== null && (Tn(n, e.elm, bS(r)), Su(n, [t], 0, 0));
  }
  return e;
}
var AP = 0, IP = function() {
  function t(e, r, n) {
    if (this.type = "svg", this.configLayer = OP("configLayer"), this.storage = r, this._opts = n = R({}, n), this.root = e, this._id = "zr" + AP++, this._oldVNode = Nm(n.width, n.height), e && !n.ssr) {
      var i = this._viewport = document.createElement("div");
      i.style.cssText = "position:relative;overflow:hidden";
      var a = this._svgDom = this._oldVNode.elm = cS("svg");
      xv(null, this._oldVNode), i.appendChild(a), e.appendChild(i);
    }
    this.resize(n.width, n.height);
  }
  return t.prototype.getType = function() {
    return this.type;
  }, t.prototype.getViewportRoot = function() {
    return this._viewport;
  }, t.prototype.getViewportRootOffset = function() {
    var e = this.getViewportRoot();
    if (e)
      return {
        offsetLeft: e.offsetLeft || 0,
        offsetTop: e.offsetTop || 0
      };
  }, t.prototype.getSvgDom = function() {
    return this._svgDom;
  }, t.prototype.refresh = function() {
    if (this.root) {
      var e = this.renderToVNode({
        willUpdate: !0
      });
      e.attrs.style = "position:absolute;left:0;top:0;user-select:none", EP(this._oldVNode, e), this._oldVNode = e;
    }
  }, t.prototype.renderOneToVNode = function(e) {
    return Hm(e, $h(this._id));
  }, t.prototype.renderToVNode = function(e) {
    e = e || {};
    var r = this.storage.getDisplayList(!0), n = this._width, i = this._height, a = $h(this._id);
    a.animation = e.animation, a.willUpdate = e.willUpdate, a.compress = e.compress, a.emphasis = e.emphasis, a.ssr = this._opts.ssr;
    var o = [], s = this._bgVNode = LP(n, i, this._backgroundColor, a);
    s && o.push(s);
    var u = e.compress ? null : this._mainVNode = Ne("g", "main", {}, []);
    this._paintList(r, a, u ? u.children : o), u && o.push(u);
    var l = X(le(a.defs), function(c) {
      return a.defs[c];
    });
    if (l.length && o.push(Ne("defs", "defs", {}, l)), e.animation) {
      var f = lP(a.cssNodes, a.cssAnims, { newline: !0 });
      if (f) {
        var h = Ne("style", "stl", {}, [], f);
        o.push(h);
      }
    }
    return Nm(n, i, o, e.useViewBox);
  }, t.prototype.renderToString = function(e) {
    return e = e || {}, Sv(this.renderToVNode({
      animation: W(e.cssAnimation, !0),
      emphasis: W(e.cssEmphasis, !0),
      willUpdate: !1,
      compress: !0,
      useViewBox: W(e.useViewBox, !0)
    }), { newline: !0 });
  }, t.prototype.setBackgroundColor = function(e) {
    this._backgroundColor = e;
  }, t.prototype.getSvgRoot = function() {
    return this._mainVNode && this._mainVNode.elm;
  }, t.prototype._paintList = function(e, r, n) {
    for (var i = e.length, a = [], o = 0, s, u, l = 0, f = 0; f < i; f++) {
      var h = e[f];
      if (!h.invisible) {
        var c = h.__clipPaths, v = c && c.length || 0, d = u && u.length || 0, p = void 0;
        for (p = Math.max(v - 1, d - 1); p >= 0 && !(c && u && c[p] === u[p]); p--)
          ;
        for (var m = d - 1; m > p; m--)
          o--, s = a[o - 1];
        for (var g = p + 1; g < v; g++) {
          var y = {};
          TP(c[g], y, r);
          var _ = Ne("g", "clip-g-" + l++, y, []);
          (s ? s.children : n).push(_), a[o++] = _, s = _;
        }
        u = c;
        var S = Hm(h, r);
        S && (s ? s.children : n).push(S);
      }
    }
  }, t.prototype.resize = function(e, r) {
    var n = this._opts, i = this.root, a = this._viewport;
    if (e != null && (n.width = e), r != null && (n.height = r), i && a && (a.style.display = "none", e = qp(i, 0, n), r = qp(i, 1, n), a.style.display = ""), this._width !== e || this._height !== r) {
      if (this._width = e, this._height = r, a) {
        var o = a.style;
        o.width = e + "px", o.height = r + "px";
      }
      if (oc(this._backgroundColor))
        this.refresh();
      else {
        var s = this._svgDom;
        s && (s.setAttribute("width", e), s.setAttribute("height", r));
        var u = this._bgVNode && this._bgVNode.elm;
        u && (u.setAttribute("width", e), u.setAttribute("height", r));
      }
    }
  }, t.prototype.getWidth = function() {
    return this._width;
  }, t.prototype.getHeight = function() {
    return this._height;
  }, t.prototype.dispose = function() {
    this.root && (this.root.innerHTML = ""), this._svgDom = this._viewport = this.storage = this._oldVNode = this._bgVNode = this._mainVNode = null;
  }, t.prototype.clear = function() {
    this._svgDom && (this._svgDom.innerHTML = null), this._oldVNode = null;
  }, t.prototype.toDataURL = function(e) {
    var r = this.renderToString(), n = "data:image/svg+xml;";
    return e ? (r = Gb(r), r && n + "base64," + r) : n + "charset=UTF-8," + encodeURIComponent(r);
  }, t;
}();
function OP(t) {
  return function() {
    process.env.NODE_ENV !== "production" && _i('In SVG mode painter not support method "' + t + '"');
  };
}
function LP(t, e, r, n) {
  var i;
  if (r && r !== "none")
    if (i = Ne("rect", "bg", {
      width: t,
      height: e,
      x: "0",
      y: "0"
    }), vy(r))
      yS({ fill: r }, i.attrs, "fill", n);
    else if (oc(r))
      _S({
        style: {
          fill: r
        },
        dirty: Fe,
        getBoundingRect: function() {
          return { width: t, height: e };
        }
      }, i.attrs, "fill", n);
    else {
      var a = ka(r), o = a.color, s = a.opacity;
      i.attrs.fill = o, s < 1 && (i.attrs["fill-opacity"] = s);
    }
  return i;
}
function PP(t) {
  t.registerPainter("svg", IP);
}
nr([
  pO,
  j2,
  YL,
  O2,
  S2,
  PP
]);
function NP(t) {
  const e = HE(t, void 0, {
    renderer: "svg",
    width: t.clientWidth || 480,
    height: t.clientHeight || 280
  });
  return {
    update(r, n) {
      const i = [
        ...new Set(r.map((o) => o.unit || "单位未标注"))
      ], a = [
        ...new Set(
          r.map((o) => o.time_unit || "时间（单位未标注）")
        )
      ].join(" / ");
      e.setOption(
        {
          animation: !1,
          color: [
            "#2563eb",
            "#0d9488",
            "#db2777",
            "#d97706",
            "#7c3aed",
            "#475569"
          ],
          grid: {
            top: n ? 24 : 44,
            left: 58,
            right: i.length > 1 ? 58 : 24,
            bottom: n ? 34 : 68
          },
          tooltip: { trigger: "axis", confine: !0 },
          legend: {
            show: !n,
            type: "scroll",
            top: 4,
            data: r.map((o) => o.label)
          },
          xAxis: {
            type: "value",
            name: a,
            nameLocation: "middle",
            nameGap: 24
          },
          yAxis: i.map((o, s) => ({
            type: "value",
            name: o,
            position: s === 0 ? "left" : "right",
            offset: Math.max(0, s - 1) * 45,
            scale: !0
          })),
          dataZoom: n ? [] : [
            { type: "inside", filterMode: "none" },
            { type: "slider", bottom: 4, height: 18, filterMode: "none" }
          ],
          series: r.map((o) => ({
            id: o.id,
            name: o.label,
            type: "line",
            showSymbol: !1,
            connectNulls: !1,
            yAxisIndex: i.indexOf(o.unit || "单位未标注"),
            data: o.points.map((s) => [s.time, s.value])
          }))
        },
        { replaceMerge: ["series", "yAxis"] }
      );
    },
    resize() {
      e.resize({ width: t.clientWidth || 480 });
    },
    dispose() {
      e.dispose();
    }
  };
}
export {
  NP as mountChart
};
