import { Icon } from "./Icon.jsx";
import { decodeScene, validBounds } from "./ezSceneData.js";
import { createSceneView } from "./ezSceneView.js";
import { createPlanCanvas } from "./ezPlanCanvas.js";
const React = window.QwenPaw.host.React;
const labelOf = (o) => o?.tag || o?.name || (o ? o.tree + ":" + o.node : "");
const keyOf = (o) => o && [o.tree, o.node];

function union(a, b) {
  if (!a || !b) return a || b;
  return [
    a[0].map((v, i) => Math.min(v, b[0][i])),
    a[1].map((v, i) => Math.max(v, b[1][i])),
  ];
}
function selectionFor(data, meta, key) {
  const direct = data?.idFor(key);
  if (direct) return { ids: [direct], bounds: data.owners[direct].bounds };
  const parent =
    data &&
    key &&
    meta?.assetChildren?.find((o) => o.tree === key[0] && o.node === key[1]);
  if (parent) {
    const ids = parent.children
      .map((node) => data.idFor([parent.tree, node]))
      .filter(Boolean);
    if (ids.length)
      return {
        ids,
        bounds: validBounds(parent.bounds)
          ? parent.bounds
          : ids.reduce((b, id) => union(b, data.owners[id].bounds), null),
        children: true,
      };
  }
  return { ids: [], bounds: null };
}
function selectionNote(data, s) {
  if (!data) return "";
  if (s.children) return "（按 " + s.ids.length + " 个装配子件定位）";
  return s.bounds ? "" : "（无装配几何）";
}
function readoutScale(node, step, unit) {
  if (!node || !Number.isFinite(step) || step <= 0) return;
  const power = 10 ** Math.floor(Math.log10(96 * step)),
    size = ([5, 2, 1].find((v) => v * power <= 96 * step) ?? 1) * power;
  node.style.width = size / step + "px";
  node.textContent =
    Number(size.toPrecision(4)).toLocaleString(undefined, {
      maximumSignificantDigits: 4,
    }) + (unit ? " " + unit : "");
}
function regionsOf(meta) {
  const named = (meta?.groups || []).filter(
    (g) => g.name && validBounds(g.bounds),
  );
  if (named.length) return named;
  return (meta?.trees || []).filter((g) => g.name && validBounds(g.bounds));
}
function drawingLabel(name) {
  const title = name
    .replace(/\.(?:rvm|wlkx)$/i, "")
    .replace(/^\d+[-_]/, "")
    .replace(/^(NG\d+)-(?=\d+号)/i, "")
    .replace(/-逆向建模$/, "");
  return title.replace(/^注采单井|^注采平台井/, "");
}
function positionLabels(layers, project, w, h, scale) {
  const placed = [];
  for (const [node, group] of layers) {
    if (!node) continue;
    const [lo, hi] = group.bounds,
      center = lo.map((v, i) => (v + hi[i]) / 2),
      [x, y, z] = project(center);
    const width = Math.min(
        136,
        Math.max(54, drawingLabel(group.name).length * 11 + 10),
      ),
      left = x + 4,
      top = y - 20;
    const box = [left, top, left + width, top + 19];
    if (
      z < -1 ||
      z > 1 ||
      left < 3 ||
      top < 3 ||
      box[2] > w - 4 ||
      box[3] > h - 32 ||
      placed.length >= 9 ||
      Math.max(hi[0] - lo[0], hi[1] - lo[1]) / scale > Math.max(w, h) * 1.35 ||
      placed.some(
        (b) =>
          box[0] < b[2] + 6 &&
          box[2] > b[0] - 6 &&
          box[1] < b[3] + 4 &&
          box[3] > b[1] - 4,
      )
    ) {
      node.hidden = true;
      continue;
    }
    node.hidden = false;
    node.style.left = left + "px";
    node.style.top = top + "px";
    placed.push(box);
  }
}
export function EzOverview({
  active,
  api,
  info,
  selected,
  selectedName,
  pair,
  onPick,
  onInspect,
  plotActions,
  focusRequest = 0,
}) {
  const [data, setData] = React.useState(null),
    [mode, setMode] = React.useState("plan");
  const [loadError, setLoadError] = React.useState(""),
    [renderError, setRenderError] = React.useState(""),
    [fallback, setFallback] = React.useState(false);
  const [frameName, setFrameName] = React.useState("all"),
    [labels, setLabels] = React.useState(true);
  const [retry, setRetry] = React.useState(0),
    [everOpened, open] = React.useState(active),
    [context, setContext] = React.useState(true);
  const mount = React.useRef(null),
    scaleBar = React.useRef(null),
    labelNodes = React.useRef([]),
    viewer = React.useRef(null),
    appliedFocus = React.useRef(0);
  const meta = info.scene,
    regions = React.useMemo(() => regionsOf(meta), [meta]);
  const main = React.useMemo(
    () => selectionFor(data, meta, pair ? keyOf(pair.owner) : selected),
    [data, meta, pair, selected],
  );
  const partner = React.useMemo(
    () => selectionFor(data, meta, keyOf(pair?.target)),
    [data, meta, pair],
  );
  const candidates = React.useMemo(() => {
    const parents = new Set(regions.map((g) => g.parent).filter(Boolean));
    const span = (b) => Math.max(b[1][0] - b[0][0], b[1][1] - b[0][1]);
    const enclosingSpan = validBounds(meta?.bounds) ? span(meta.bounds) : 0;
    return regions
      .map((g, i) => ({ g, i }))
      .filter(
        ({ g }) =>
          !parents.has(g.id) ||
          (/集注站\.wlkx$/i.test(g.name) && span(g.bounds) < enclosingSpan / 3),
      )
      .sort((a, b) => (b.g.segments ?? 0) - (a.g.segments ?? 0))
      .slice(0, 120);
  }, [regions, meta]);
  const latest = React.useRef({});
  latest.current = {
    onPick,
    main,
    partner,
    mode,
    labels,
    context,
    candidates,
    regions,
    frameName,
  };
  const hasSource =
    meta &&
    meta.available !== false &&
    (meta.segments || 0) + (meta.triangles || 0) + (meta.arcs || 0) > 0;
  React.useEffect(() => {
    if (active) open(true);
  }, [active]);
  React.useEffect(() => {
    if (!everOpened || !hasSource) return;
    const abort = new AbortController();
    let alive = true;
    setData(null);
    setLoadError("");
    api(
      "/scene?revision=" + encodeURIComponent(info.revision),
      { signal: abort.signal },
      true,
    )
      .then((buffer) => {
        if (alive) setData(decodeScene(buffer));
      })
      .catch((e) => {
        if (alive) setLoadError(e.message);
      });
    return () => {
      alive = false;
      abort.abort();
    };
  }, [api, info.revision, everOpened, hasSource, retry]);
  function fitAll() {
    setFrameName("all");
    if (data) viewer.current?.fit(data.bounds);
  }
  function fitRegion(i) {
    if (i === "all") {
      fitAll();
      return;
    }
    const g = regions[Number(i)];
    if (!g) return;
    viewer.current?.fit(g.bounds);
    setFrameName(String(i));
  }
  function fitSelected() {
    const bounds = union(main.bounds, partner.bounds);
    if (bounds) {
      viewer.current?.fit(bounds);
      setFrameName("picked");
    }
  }
  React.useEffect(
    () => () => {
      viewer.current?.dispose();
      viewer.current = null;
    },
    [data, info.unit],
  );
  React.useEffect(() => {
    if (!active || !data || !mount.current) return;
    if (viewer.current) {
      viewer.current.refresh();
      return;
    }
    setRenderError("");
    const events = {
      onPick: (key) => latest.current.onPick(key),
      onFit: () => {
        viewer.current?.fit(data.bounds);
        setFrameName("all");
      },
      onLost: () => setRenderError("图形上下文已中断，请重新载入图面。"),
      onDraw: (step, project, w, h) => {
        readoutScale(scaleBar.current, step, info.unit);
        if (latest.current.labels)
          positionLabels(
            latest.current.candidates.map(({ g }, i) => [
              labelNodes.current[i],
              g,
            ]),
            project,
            w,
            h,
            step,
          );
      },
    };
    let v,
      simple = false;
    try {
      v = createSceneView(mount.current, data, events);
    } catch {
      try {
        v = createPlanCanvas(mount.current, data, events);
        simple = true;
      } catch {
        setRenderError(
          "当前环境无法绘制工区场景，可在对象目录中查阅连接记录。",
        );
        return;
      }
    }
    viewer.current = v;
    setFallback(simple);
    const state = latest.current;
    const section = simple ? "plan" : state.mode;
    if (simple) setMode("plan");
    v.setMode(section);
    v.hideContext(!state.context);
    v.select(state.main.ids, state.partner.ids);
    const frame =
      state.frameName === "picked"
        ? union(state.main.bounds, state.partner.bounds)
        : state.regions[Number(state.frameName)]?.bounds;
    if (frame) v.fit(frame);
  }, [data, active, info.unit]);
  React.useEffect(() => {
    viewer.current?.setMode(mode);
  }, [mode]);
  React.useEffect(() => {
    viewer.current?.select(main.ids, partner.ids);
  }, [main, partner]);
  React.useEffect(() => {
    viewer.current?.hideContext(!context);
  }, [context]);
  React.useEffect(() => {
    if (
      !active ||
      !viewer.current ||
      !data ||
      !focusRequest ||
      appliedFocus.current === focusRequest
    )
      return;
    appliedFocus.current = focusRequest;
    fitSelected();
  }, [active, data, focusRequest, main, partner]);
  React.useEffect(() => {
    if (!labels)
      for (const n of labelNodes.current) {
        if (n) n.hidden = true;
      }
    else viewer.current?.refresh();
  }, [labels]);
  return (
    <section
      className="sn-panel sn-assembly"
      aria-label="工区总图"
      hidden={!active}
    >
      <header className="sn-assembly-head">
        <div className="sn-tabs" role="group" aria-label="工区视图">
          <button
            aria-pressed={mode === "plan"}
            onClick={() => setMode("plan")}
          >
            <Icon name="diagram" />
            二维总平
          </button>
          <button
            aria-pressed={mode === "spatial"}
            disabled={fallback}
            title={fallback ? "当前设备未启用 WebGL 2" : undefined}
            onClick={() => setMode("spatial")}
          >
            <Icon name="cube" />
            三维全貌
          </button>
        </div>
        {hasSource && (
          <div className="sn-assembly-tools">
            {!!regions.length && (
              <label>
                定位范围
                <select
                  aria-label="工区定位范围"
                  value={frameName}
                  onChange={(e) => fitRegion(e.target.value)}
                >
                  <option value="all">全工区</option>
                  {frameName === "picked" && (
                    <option value="picked">
                      {pair ? "关系两端" : "选中对象"}
                    </option>
                  )}
                  {regions.map((g, i) => (
                    <option key={i} value={i}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <button disabled={!data} onClick={fitAll}>
              <Icon name="expand" />
              适合全图
            </button>
            {plotActions}
          </div>
        )}
      </header>
      {hasSource ? (
        <>
          <div className="sn-assembly-stage">
            <div className="sn-assembly-canvas" ref={mount} />
            <div
              className="sn-assembly-labels"
              hidden={!labels || !!loadError || !!renderError}
            >
              {candidates.map(({ g, i }, j) => (
                <button
                  key={i}
                  ref={(n) => {
                    labelNodes.current[j] = n;
                  }}
                  hidden
                  title={g.name}
                  aria-label={"定位分区 " + g.name}
                  onClick={() => fitRegion(i)}
                >
                  {drawingLabel(g.name)}
                </button>
              ))}
            </div>
            {loadError || renderError ? (
              <div className="sn-assembly-state" role="alert">
                <p>{loadError || renderError}</p>
                <button
                  onClick={() => {
                    setRenderError("");
                    setRetry((v) => v + 1);
                  }}
                >
                  重新载入图面
                </button>
              </div>
            ) : !data ? (
              <div className="sn-assembly-state" role="status">
                正在读取全站装配…
              </div>
            ) : (
              <>
                <div
                  className="sn-assembly-scale"
                  ref={scaleBar}
                  aria-label="比例尺"
                />
                <div className="sn-zoom" role="group" aria-label="工区缩放">
                  <button
                    aria-label="缩小工区图"
                    onClick={() => viewer.current?.zoom(1 / 1.6)}
                  >
                    <Icon name="minus" />
                  </button>
                  <button
                    aria-label="放大工区图"
                    onClick={() => viewer.current?.zoom(1.6)}
                  >
                    <Icon name="plus" />
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="sn-assembly-strip">
            <div className="sn-assembly-tools">
              <label>
                <input
                  type="checkbox"
                  checked={context}
                  onChange={(e) => setContext(e.target.checked)}
                />
                背景构件
              </label>
              {!!regions.length && (
                <label>
                  <input
                    type="checkbox"
                    checked={labels}
                    onChange={(e) => setLabels(e.target.checked)}
                  />
                  分区标注
                </label>
              )}
            </div>
            <span>
              {fallback
                ? "二维线框 · "
                : mode === "plan"
                ? "XY 平面 · "
                : "Z 向上 · "}
              {mode === "plan" ? "拖动平移" : "拖动旋转，右键平移"} · 滚轮缩放
            </span>
          </div>
          {pair ? (
            <div className="sn-pair-legend" aria-label="图上对照">
              <strong>
                {pair.label} ·{" "}
                {pair.status === "candidate" ? "待核对" : "图上对照"}
              </strong>
              <span className="sn-owner-a">
                {labelOf(pair.owner)}
                {selectionNote(data, main)}
              </span>
              <span className="sn-owner-b">
                {labelOf(pair.target)}
                {selectionNote(data, partner)}
              </span>
              <button
                disabled={!main.bounds && !partner.bounds}
                onClick={fitSelected}
              >
                定位两端
              </button>
            </div>
          ) : (
            selected && (
              <div className="sn-pair-legend">
                <span className="sn-owner-a">
                  已选对象　{selectedName || selected.join(" / ")}
                  {selectionNote(data, main)}
                </span>
                <button disabled={!main.bounds} onClick={fitSelected}>
                  定位选中对象
                </button>
                <button onClick={onInspect}>查看对象资料</button>
              </div>
            )
          )}
        </>
      ) : (
        <div className="sn-assembly-state sn-assembly-missing">
          <h3>工区缺少装配几何</h3>
          <p>
            {meta?.requiresSource
              ? "此工区由旧版导入。重新选择原 WLKX 或同组 data.db、model.package 并导入，即可生成总图。"
              : "可选择带装配几何的 WLKX，或同时选择同一工区的 data.db 与 model.package。"}
          </p>
        </div>
      )}
    </section>
  );
}
