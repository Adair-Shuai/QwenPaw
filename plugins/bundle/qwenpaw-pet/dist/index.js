const $ = "language", _ = "qwenpaw-pet-language-change";
function Q() {
  try {
    return localStorage.getItem($) || "";
  } catch {
    return "";
  }
}
function ue() {
  const t = "__qwenpawPetLanguageHook", r = Storage.prototype;
  if (r[t]) return;
  const c = r.setItem;
  r.setItem = function(l, s) {
    c.call(this, l, s), l === $ && window.dispatchEvent(new CustomEvent(_, { detail: s }));
  }, r[t] = !0;
}
function me(t) {
  ue();
  let r = Q();
  const c = (d) => {
    d !== r && (r = d, t(d));
  }, l = (d) => {
    c(String(d.detail ?? ""));
  }, s = (d) => {
    d.key === $ && c(d.newValue ?? "");
  };
  window.addEventListener(_, l), window.addEventListener("storage", s);
  const a = window.setInterval(() => {
    c(Q());
  }, 500);
  return () => {
    window.removeEventListener(_, l), window.removeEventListener("storage", s), window.clearInterval(a);
  };
}
const X = {
  en: {
    routeLabel: "Pet",
    title: "QwenPaw Pet",
    intro: "Installed pets live under your QwenPaw working directory. Start the desktop bridge, then switch the floating pet without restarting QwenPaw.",
    startDesktop: "Start desktop pet",
    importPet: "Import pet",
    refresh: "Refresh",
    petsDirectory: "Pets directory:",
    desktopHealth: "Desktop health:",
    desktopUnknown: "unknown (refresh)",
    colPreview: "Preview",
    colName: "Name",
    colFolder: "Folder",
    colManifestId: "pet.json id",
    colAction: "Action",
    switch: "Switch",
    tableEmpty: "No pets found. Run: qwenpaw-pet install-pet …",
    desktopAlreadyRunning: "Desktop pet is already running.",
    desktopStartFailed: "Could not start the desktop pet.",
    desktopReady: "Desktop pet is ready.",
    desktopStarting: "Desktop may still be starting; check pet-desktop.log if needed.",
    dropFolderOrZip: "Drop a folder or a .zip file.",
    importChooseFirst: "Drop a folder or choose a .zip file first.",
    importSuccess: 'Imported "{name}" → {path}',
    switchSuccess: 'Switched to "{name}" ({petId})',
    switchFailed: "switch failed",
    modalImportTitle: "Import pet",
    modalImportOk: "Import",
    dropzoneTitle: "Drop a folder or .zip file here",
    dropzoneHint: "or click to choose a .zip",
    importFormatHint: "Folder or unzipped archive must contain pet.json and spritesheet.webp (1536×1872).",
    selectedOne: "Selected: {path}",
    selectedMany: "Selected: {count} files (root: {root})",
    importReplace: "Replace if a pet with the same id already exists"
  },
  zh: {
    routeLabel: "宠物",
    title: "QwenPaw 桌面宠物",
    intro: "已安装的宠物位于 QwenPaw 工作目录下。启动桌面桥接后，可在不重启 QwenPaw 的情况下切换悬浮宠物。",
    startDesktop: "启动桌面宠物",
    importPet: "导入宠物",
    refresh: "刷新",
    petsDirectory: "宠物目录：",
    desktopHealth: "桌面服务状态：",
    desktopUnknown: "未知（请刷新）",
    colPreview: "预览",
    colName: "名称",
    colFolder: "文件夹",
    colManifestId: "pet.json id",
    colAction: "操作",
    switch: "切换",
    tableEmpty: "未找到宠物。请运行：qwenpaw-pet install-pet …",
    desktopAlreadyRunning: "桌面宠物已在运行。",
    desktopStartFailed: "无法启动桌面宠物。",
    desktopReady: "桌面宠物已就绪。",
    desktopStarting: "桌面可能仍在启动中；如有问题请查看 pet-desktop.log。",
    dropFolderOrZip: "请拖入文件夹或 .zip 文件。",
    importChooseFirst: "请先拖入文件夹或选择 .zip 文件。",
    importSuccess: "已导入「{name}」→ {path}",
    switchSuccess: "已切换至「{name}」（{petId}）",
    switchFailed: "切换失败",
    modalImportTitle: "导入宠物",
    modalImportOk: "导入",
    dropzoneTitle: "将文件夹或 .zip 拖放到此处",
    dropzoneHint: "或点击选择 .zip 文件",
    importFormatHint: "文件夹或解压后的目录需包含 pet.json 与 spritesheet.webp（1536×1872）。",
    selectedOne: "已选择：{path}",
    selectedMany: "已选择：{count} 个文件（根目录：{root}）",
    importReplace: "若已存在相同 id 的宠物则覆盖"
  }
};
function fe(t) {
  return String(t || "").trim().split("-")[0].toLowerCase() === "zh" ? "zh" : "en";
}
function U(t) {
  return fe(t ?? Q());
}
function te(t, r, c) {
  let l = X[t][r] ?? X.en[r];
  if (c)
    for (const [s, a] of Object.entries(c))
      l = l.split(`{${s}}`).join(String(a));
  return l;
}
function we(t) {
  const [r, c] = t.useState(
    () => U()
  );
  t.useEffect(() => {
    const s = (a) => {
      c((d) => {
        const b = U(a);
        return d === b ? d : b;
      });
    };
    return me((a) => s(a));
  }, []);
  const l = t.useCallback(
    (s, a) => te(r, s, a),
    [r]
  );
  return { locale: r, tr: l };
}
const R = window.QwenPaw.host, n = R.React;
function he() {
  return n.createElement(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.6,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": !0,
      focusable: "false",
      width: "1em",
      height: "1em"
    },
    n.createElement("path", {
      d: "M7 12.9c-1.65 1.25-3.1 3.2-2.55 5.1.6 2 2.55 2.6 4.45 1.9 2.25-.8 3.95-.8 6.2 0 1.95.7 3.85.1 4.45-1.9.55-1.9-.9-3.85-2.55-5.1-1.55-1.05-2.35-3.05-5-3.05s-3.45 2-5 3.05Z"
    }),
    n.createElement("ellipse", {
      cx: "4.9",
      cy: "8.45",
      rx: "1.55",
      ry: "2.0",
      transform: "rotate(-25 4.9 8.45)"
    }),
    n.createElement("ellipse", {
      cx: "10.1",
      cy: "5.1",
      rx: "1.6",
      ry: "2.1"
    }),
    n.createElement("ellipse", {
      cx: "15.8",
      cy: "5.7",
      rx: "1.55",
      ry: "2.0",
      transform: "rotate(17 15.8 5.7)"
    }),
    n.createElement("path", {
      d: "M20 8.1q1.35-1.45 1.75.3.25 1.3-.85 2.1"
    })
  );
}
const ge = R.antd, O = R.getApiUrl, M = R.getApiToken, { Button: z, Card: ye, Space: j, Table: ke, Typography: Ee, message: u, Modal: Se, Checkbox: be } = ge, { Title: ve, Text: h, Paragraph: Ie } = Ee;
function Pe() {
  var t, r, c;
  try {
    const l = ((t = window.sessionStorage) == null ? void 0 : t.getItem("qwenpaw-agent-storage")) ?? ((r = window.localStorage) == null ? void 0 : r.getItem("qwenpaw-agent-storage"));
    if (!l) return null;
    const s = JSON.parse(l), a = (c = s == null ? void 0 : s.state) == null ? void 0 : c.selectedAgent;
    return typeof a == "string" && a ? a : null;
  } catch {
    return null;
  }
}
function A() {
  const t = {}, r = M == null ? void 0 : M();
  r && (t.Authorization = `Bearer ${r}`);
  const c = Pe();
  return c && (t["X-Agent-Id"] = c), t;
}
async function Y(t) {
  const r = await fetch(O(t), { headers: A() });
  if (!r.ok)
    throw new Error(`${r.status} ${await r.text()}`);
  return r.json();
}
async function ee(t, r) {
  const c = await fetch(O(t), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...A() },
    body: JSON.stringify(r)
  }), l = await c.text();
  let s = null;
  try {
    s = l ? JSON.parse(l) : null;
  } catch {
    s = { raw: l };
  }
  if (!c.ok)
    throw new Error(typeof (s == null ? void 0 : s.detail) == "string" ? s.detail : l);
  return s;
}
const xe = 192, De = 208;
function Ce({ folder: t }) {
  const r = n.useRef(null), [c, l] = n.useState(!1);
  return n.useEffect(() => {
    let s = !1;
    l(!1);
    const a = r.current;
    if (!a) return;
    const d = a.getContext("2d");
    if (d)
      return (async () => {
        try {
          const b = O(
            `/qwenpaw-pet/pets/${encodeURIComponent(t)}/spritesheet`
          ), I = await fetch(b, { headers: A() });
          if (!I.ok || s) throw new Error(String(I.status));
          const T = await I.blob(), v = await createImageBitmap(T);
          if (s) {
            v.close();
            return;
          }
          const P = 96, x = 104;
          a.width = P, a.height = x, d.imageSmoothingEnabled = !1, d.clearRect(0, 0, P, x), d.drawImage(v, 0, 0, xe, De, 0, 0, P, x), v.close();
        } catch {
          s || l(!0);
        }
      })(), () => {
        s = !0;
      };
  }, [t]), c ? n.createElement(h, { type: "secondary" }, "—") : n.createElement("canvas", {
    ref: r,
    width: 96,
    height: 104,
    style: {
      display: "block",
      borderRadius: 8,
      border: "1px solid rgba(0,0,0,0.08)",
      background: "rgba(0,0,0,0.02)",
      imageRendering: "pixelated"
    }
  });
}
function Le() {
  const { tr: t } = we(n), [r, c] = n.useState([]), [l, s] = n.useState(""), [a, d] = n.useState(null), [b, I] = n.useState(!1), [T, v] = n.useState(!1), [P, x] = n.useState(!0), [g, G] = n.useState(!1), [y, C] = n.useState([]), [N, L] = n.useState(!1), [J, q] = n.useState(!1), W = n.useRef(null), [H, ne] = n.useState(
    () => document.documentElement.classList.contains("dark-mode")
  );
  n.useEffect(() => {
    const e = new MutationObserver(() => {
      ne(document.documentElement.classList.contains("dark-mode"));
    });
    return e.observe(document.documentElement, {
      attributes: !0,
      attributeFilter: ["class"]
    }), () => e.disconnect();
  }, []);
  const k = n.useCallback(async () => {
    I(!0);
    try {
      const [e, o] = await Promise.all([
        Y("/qwenpaw-pet/pets"),
        Y("/qwenpaw-pet/status")
      ]);
      c(e.pets || []), s(e.petsDir || ""), d(o.desktop ?? null);
    } catch (e) {
      u.error((e == null ? void 0 : e.message) || String(e));
    } finally {
      I(!1);
    }
  }, []);
  n.useEffect(() => {
    k();
  }, [k]);
  const D = (a == null ? void 0 : a.ok) === !0, F = J || (a == null ? void 0 : a.starting) === !0 || (a == null ? void 0 : a.running) === !0 && !D;
  n.useEffect(() => {
    if (!F || D) return;
    const e = window.setInterval(() => {
      k();
    }, 1500);
    return () => window.clearInterval(e);
  }, [F, D, k]), n.useEffect(() => {
    D && q(!1);
  }, [D]);
  const oe = async () => {
    if (!F) {
      q(!0);
      try {
        const e = await ee("/qwenpaw-pet/desktop/start", {}), o = e == null ? void 0 : e.desktop, i = [e == null ? void 0 : e.message, e == null ? void 0 : e.hint].filter(Boolean).join(" ");
        e != null && e.alreadyRunning && (o != null && o.ok) ? u.success(i || t("desktopAlreadyRunning")) : (e == null ? void 0 : e.launchAttempted) === !1 && !(o != null && o.ok) ? typeof (e == null ? void 0 : e.message) == "string" && e.message.toLowerCase().includes("starting") ? u.warning(i || t("desktopStarting")) : u.error(i || t("desktopStartFailed")) : o != null && o.ok ? u.success(i || t("desktopReady")) : u.warning(i || t("desktopStarting")), await k();
      } catch (e) {
        u.error((e == null ? void 0 : e.message) || String(e));
      } finally {
        q(!1);
      }
    }
  }, re = () => {
    C([]), x(!0), L(!1), v(!0);
  }, Z = async (e, o, i) => {
    const p = o ? `${o}/${e.name}` : e.name;
    if (e.isFile) {
      const m = await new Promise(
        (E, f) => e.file(E, f)
      );
      i.push({ file: m, path: p });
      return;
    }
    if (!e.isDirectory) return;
    const w = e.createReader();
    for (; ; ) {
      const m = await new Promise(
        (E, f) => w.readEntries(E, f)
      );
      if (m.length === 0) break;
      for (const E of m)
        await Z(E, p, i);
    }
  }, ae = async (e) => {
    var w, m, E;
    if (e.preventDefault(), L(!1), g) return;
    const o = (w = e.dataTransfer) == null ? void 0 : w.items, i = (m = e.dataTransfer) == null ? void 0 : m.files, p = [];
    if (o && o.length > 0)
      for (let f = 0; f < o.length; f++) {
        const S = o[f];
        if (S.kind !== "file") continue;
        const V = (E = S.webkitGetAsEntry) == null ? void 0 : E.call(S);
        if (V)
          await Z(V, "", p);
        else {
          const B = S.getAsFile();
          B && p.push({ file: B, path: B.name });
        }
      }
    else if (i)
      for (let f = 0; f < i.length; f++) {
        const S = i[f];
        p.push({ file: S, path: S.name });
      }
    if (p.length === 0) {
      u.warning(t("dropFolderOrZip"));
      return;
    }
    C(p);
  }, se = (e) => {
    e.preventDefault(), g || L(!0);
  }, ie = (e) => {
    e.preventDefault(), L(!1);
  }, K = () => {
    var e;
    g || (e = W.current) == null || e.click();
  }, le = (e) => {
    var p;
    const o = (p = e.target) == null ? void 0 : p.files;
    if (!o || o.length === 0) return;
    const i = [];
    for (let w = 0; w < o.length; w++) {
      const m = o[w];
      i.push({ file: m, path: m.name });
    }
    C(i), e.target.value = "";
  }, ce = async () => {
    if (y.length === 0) {
      u.warning(t("importChooseFirst"));
      return;
    }
    G(!0);
    try {
      const e = new FormData();
      for (const { file: w, path: m } of y)
        e.append("files", w, m);
      e.append("replace", P ? "true" : "false");
      const o = await fetch(O("/qwenpaw-pet/import-pet-upload"), {
        method: "POST",
        headers: A(),
        body: e
      }), i = await o.text();
      let p = null;
      try {
        p = i ? JSON.parse(i) : null;
      } catch {
        p = { raw: i };
      }
      if (!o.ok)
        throw new Error(typeof (p == null ? void 0 : p.detail) == "string" ? p.detail : i);
      u.success(
        t("importSuccess", {
          name: p.displayName || p.petId,
          path: p.path
        })
      ), v(!1), C([]), await k();
    } catch (e) {
      u.error((e == null ? void 0 : e.message) || String(e));
    } finally {
      G(!1);
    }
  }, pe = async (e) => {
    const o = e.folder;
    try {
      const i = await ee("/qwenpaw-pet/switch-pet", { pet_id: o });
      if (i && i.ok === !1)
        throw new Error(i.error || i.detail || t("switchFailed"));
      u.success(
        t("switchSuccess", { name: e.displayName, petId: o })
      ), await k();
    } catch (i) {
      u.error((i == null ? void 0 : i.message) || String(i));
    }
  }, de = n.useMemo(
    () => [
      {
        title: t("colPreview"),
        key: "preview",
        width: 112,
        render: (e, o) => n.createElement(Ce, {
          key: o.folder,
          folder: o.folder
        })
      },
      { title: t("colName"), dataIndex: "displayName", key: "displayName" },
      { title: t("colFolder"), dataIndex: "folder", key: "folder" },
      {
        title: t("colManifestId"),
        key: "manifestId",
        render: (e, o) => o.manifestId ? String(o.manifestId) : n.createElement(h, { type: "secondary" }, "—")
      },
      {
        title: t("colAction"),
        key: "act",
        render: (e, o) => n.createElement(
          z,
          {
            type: "primary",
            size: "small",
            onClick: () => void pe(o)
          },
          t("switch")
        )
      }
    ],
    [t]
  );
  return n.createElement(
    ye,
    { style: { maxWidth: 880, margin: "24px auto" } },
    n.createElement(
      j,
      { direction: "vertical", size: "large", style: { width: "100%" } },
      [
        n.createElement(
          "div",
          { key: "h" },
          n.createElement(
            ve,
            { level: 3, style: { marginBottom: 4 } },
            t("title")
          ),
          n.createElement(
            Ie,
            { type: "secondary", style: { marginBottom: 0 } },
            t("intro")
          )
        ),
        n.createElement(
          j,
          { key: "actions", wrap: !0 },
          n.createElement(
            z,
            {
              type: "primary",
              onClick: oe,
              loading: J,
              disabled: F
            },
            t("startDesktop")
          ),
          n.createElement(z, { onClick: re }, t("importPet")),
          n.createElement(
            z,
            { onClick: () => void k(), loading: b },
            t("refresh")
          )
        ),
        n.createElement(
          "div",
          { key: "meta" },
          n.createElement(
            h,
            { type: "secondary" },
            t("petsDirectory") + " "
          ),
          n.createElement(h, { code: !0 }, l || "—")
        ),
        n.createElement(
          "div",
          { key: "dh" },
          n.createElement(
            h,
            { strong: !0 },
            t("desktopHealth") + " "
          ),
          n.createElement(
            h,
            { type: a != null && a.ok ? "success" : "warning" },
            a ? JSON.stringify(a) : t("desktopUnknown")
          )
        ),
        n.createElement(ke, {
          key: "tbl",
          rowKey: "folder",
          loading: b,
          dataSource: r,
          columns: de,
          pagination: !1,
          locale: {
            emptyText: t("tableEmpty")
          }
        }),
        n.createElement(
          Se,
          {
            key: "import-modal",
            title: t("modalImportTitle"),
            open: T,
            onOk: () => void ce(),
            okText: t("modalImportOk"),
            okButtonProps: { loading: g },
            cancelButtonProps: { disabled: g },
            onCancel: () => {
              g || v(!1);
            },
            destroyOnHidden: !0
          },
          n.createElement(
            j,
            { direction: "vertical", style: { width: "100%" } },
            n.createElement(
              "div",
              {
                role: "button",
                tabIndex: 0,
                onClick: K,
                onDrop: ae,
                onDragOver: se,
                onDragLeave: ie,
                onKeyDown: (e) => {
                  (e.key === "Enter" || e.key === " ") && (e.preventDefault(), K());
                },
                style: {
                  border: `2px dashed ${N ? "#1677ff" : H ? "rgba(255,255,255,0.15)" : "#d9d9d9"}`,
                  borderRadius: 8,
                  padding: "32px 16px",
                  textAlign: "center",
                  cursor: g ? "not-allowed" : "pointer",
                  background: N ? "rgba(22, 119, 255, 0.06)" : H ? "rgba(255,255,255,0.04)" : "#fafafa",
                  transition: "border-color .15s ease, background .15s ease",
                  userSelect: "none",
                  color: N ? "#1677ff" : H ? "rgba(255,255,255,0.85)" : void 0
                }
              },
              // Line-art cube icon (matches the dropzone reference)
              n.createElement(
                "svg",
                {
                  width: 48,
                  height: 48,
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: 1.5,
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  style: {
                    display: "block",
                    margin: "0 auto 12px",
                    opacity: 0.7
                  }
                },
                n.createElement("path", {
                  d: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                }),
                n.createElement("polyline", {
                  points: "3.27 6.96 12 12.01 20.73 6.96"
                }),
                n.createElement("line", {
                  x1: "12",
                  y1: "22.08",
                  x2: "12",
                  y2: "12"
                })
              ),
              n.createElement(
                "div",
                {
                  style: {
                    fontSize: 16,
                    fontWeight: 600,
                    marginBottom: 4
                  }
                },
                t("dropzoneTitle")
              ),
              n.createElement(
                h,
                { type: "secondary" },
                t("dropzoneHint")
              )
            ),
            n.createElement("input", {
              ref: W,
              type: "file",
              accept: ".zip,application/zip",
              style: { display: "none" },
              onChange: le
            }),
            y.length === 0 ? n.createElement(
              h,
              { type: "secondary", style: { fontSize: 12 } },
              t("importFormatHint")
            ) : n.createElement(
              h,
              null,
              y.length === 1 ? t("selectedOne", { path: y[0].path }) : t("selectedMany", {
                count: y.length,
                root: y[0].path.split("/")[0] || y[0].path
              })
            ),
            n.createElement(
              be,
              {
                checked: P,
                onChange: (e) => x(!!e.target.checked),
                disabled: g
              },
              t("importReplace")
            )
          )
        )
      ]
    )
  );
}
class Fe {
  constructor() {
    this.id = "qwenpaw-pet";
  }
  setup() {
    var c, l;
    const r = U();
    (l = (c = window.QwenPaw).registerRoutes) == null || l.call(c, this.id, [
      {
        path: "/plugin/qwenpaw-pet/pets",
        component: Le,
        label: te(r, "routeLabel"),
        icon: /* @__PURE__ */ n.createElement(he, null),
        priority: 42
      }
    ]);
  }
}
new Fe().setup();
