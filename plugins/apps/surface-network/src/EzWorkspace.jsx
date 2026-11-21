import { Icon } from "./Icon.jsx";
import { EzObjectDetail, ExtentInfo } from "./EzObjectDetail.jsx";
import { EzOverview } from "./EzOverview.jsx";
import { RelationsTable } from "./EzRelations.jsx";
import overviewStyle from "./ezOverview.css";
const Q = window.QwenPaw,
  React = Q.host.React;
function WellMap({ points, onSelect }) {
  const xs = points.map((p) => p[3]),
    ys = points.map((p) => p[4]),
    loX = Math.min(...xs),
    hiX = Math.max(...xs),
    loY = Math.min(...ys),
    hiY = Math.max(...ys);
  const scale = Math.min(
    660 / Math.max(hiX - loX, 1),
    260 / Math.max(hiY - loY, 1),
  );
  return (
    <details>
      <summary>井位坐标图（{points.length} 个对象）</summary>
      <svg
        className="sn-ez-wells"
        viewBox="0 0 720 304"
        aria-label="原始大地坐标平面图"
      >
        <text x="10" y="18">
          纵轴 Y · 横轴 X
        </text>
        {points.map(([tree, node, label, x, y]) => (
          <g
            key={tree + ":" + node}
            role="button"
            tabIndex="0"
            aria-label={label + " " + tree + ":" + node}
            onClick={() => onSelect([tree, node])}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect([tree, node]);
              }
            }}
          >
            <title>
              {label} · X {x} · Y {y}
            </title>
            <circle
              cx={30 + (x - loX) * scale}
              cy={284 - (y - loY) * scale}
              r="5"
              className="sn-well-point"
            />
          </g>
        ))}
      </svg>
    </details>
  );
}
export function EzWorkspace({
  files,
  onFiles,
  agentId,
  model,
  apply,
  page: controlledPage,
  onPageChange,
  onProjectChange,
  initialInfo,
  visible = true,
  plotActions,
}) {
  const [localPage, setLocalPage] = React.useState("overview"),
    [info, setInfo] = React.useState(initialInfo);
  const [notice, setNotice] = React.useState(""),
    [summaryError, setSummaryError] = React.useState(""),
    [loadAttempt, retrySummary] = React.useReducer((n) => n + 1, 0);
  const [busy, loading] = React.useState(false),
    [q, search] = React.useState(""),
    [kind, filter] = React.useState(""),
    [page, setPage] = React.useState(0);
  const [result, setResult] = React.useState(null),
    [key, setKey] = React.useState(null),
    [item, setItem] = React.useState(null);
  const [pair, setPair] = React.useState(null),
    [focusRequest, focusOnMap] = React.useReducer((n) => n + 1, 0),
    [relationScope, setRelationScope] = React.useState("project");
  const file = React.useRef(null),
    gen = React.useRef(0),
    published = React.useRef(0),
    chosen = React.useRef(null),
    tableRef = React.useRef(null),
    conflict = React.useRef(false);
  const onProject = React.useRef(onProjectChange);
  const shown = React.useRef(visible);
  shown.current = visible;
  onProject.current = onProjectChange;
  const activePage = controlledPage ?? localPage,
    overview = activePage === "overview";
  const navigate = (p) => {
    setLocalPage(p);
    onPageChange?.(p);
  };
  const select = React.useCallback((k) => {
    if (k?.join(":") !== chosen.current?.join(":")) setItem(null);
    chosen.current = k;
    setKey(k);
    setPair(null);
    if (!k) setRelationScope("project");
  }, []);
  const api = React.useCallback(
    async (path, init, binary = false) => {
      if (!Q.host.fetch) throw Error("请在 UGSci 软件内打开 eZWalker 工区");
      const url =
        "/surface-network/ezwalker" +
        path +
        (path.includes("?") ? "&" : "?") +
        "agent_id=" +
        encodeURIComponent(agentId);
      const r = await Q.host.fetch(url, init);
      if (!r.ok) {
        const msg = await r.json().catch(() => ({}));
        if (r.status === 409 && !init?.signal?.aborted && !conflict.current) {
          conflict.current = true;
          setInfo(undefined);
          select(null);
          setItem(null);
          setResult(null);
          retrySummary();
        }
        throw Error(
          r.status === 409
            ? "工区版本已更新，正在读取当前工区。请核对文件后再导入。"
            : typeof msg.detail === "string"
            ? msg.detail
            : "工区服务错误 " + r.status,
        );
      }
      return binary ? r.arrayBuffer() : r.json();
    },
    [agentId, select],
  );
  React.useEffect(
    () => () => {
      gen.current++;
    },
    [agentId],
  );
  const initialRevision = initialInfo?.revision;
  const initialProvided = initialInfo !== undefined;
  React.useEffect(() => {
    if (loadAttempt === 0 && initialInfo !== undefined) {
      setInfo(initialInfo);
      return;
    }
    let alive = true;
    const publication = published.current;
    const ac = new AbortController();
    setSummaryError("");
    api("", { signal: ac.signal })
      .then((v) => {
        if (alive && publication === published.current) {
          setInfo(v);
          onProject.current?.(v);
          conflict.current = false;
        }
      })
      .catch((e) => {
        if (alive && publication === published.current)
          setSummaryError(e.message);
      });
    return () => {
      alive = false;
      ac.abort();
    };
  }, [api, loadAttempt, initialRevision, initialProvided]);
  React.useEffect(() => {
    if (!info || overview || !visible) return;
    let alive = true;
    const ac = new AbortController();
    setResult(null);
    const timer = setTimeout(
      () =>
        api(
          "/objects?" +
            new URLSearchParams({ q, kind, page, revision: info.revision }),
          { signal: ac.signal },
        )
          .then((v) => {
            if (alive) {
              setResult(v);
              if (!chosen.current) select(v.rows[0]?.slice(0, 2) ?? null);
            }
          })
          .catch((e) => {
            if (alive) setNotice(e.message);
          }),
      q ? 120 : 0,
    );
    return () => {
      alive = false;
      ac.abort();
      clearTimeout(timer);
    };
  }, [info, q, kind, page, overview, visible, api, select]);
  React.useEffect(() => {
    let alive = true;
    const ac = new AbortController();
    setItem(null);
    if (key && info)
      api(
        "/object/" +
          key.join("/") +
          "?revision=" +
          encodeURIComponent(info.revision),
        { signal: ac.signal },
      )
        .then((v) => {
          if (alive) setItem(v);
        })
        .catch((e) => {
          if (alive) setNotice(e.message);
        });
    return () => {
      alive = false;
      ac.abort();
    };
  }, [key, info, api]);
  function showPair(row) {
    if (!row.owner || !row.target) return;
    const k = [row.owner.tree, row.owner.node];
    chosen.current = k;
    setKey(k);
    setPair(row);
    navigate("overview");
    focusOnMap();
    scrollToDrawing();
  }
  function scrollToDrawing() {
    requestAnimationFrame(() => {
      const el = file.current?.closest(".sn-content");
      if (el) el.scrollTop = 0;
    });
  }
  function showLocation() {
    navigate("overview");
    focusOnMap();
    scrollToDrawing();
  }
  function showAllRelated() {
    setRelationScope("object");
    requestAnimationFrame(() =>
      tableRef.current?.scrollIntoView({ block: "start" }),
    );
  }
  async function load() {
    const n = ++gen.current;
    loading(true);
    setNotice("");
    try {
      const body = new FormData();
      files.forEach((f) => body.append("files", f));
      const query = info?.revision
        ? "?expected_revision=" + encodeURIComponent(info.revision)
        : "";
      const v = await api(query, { method: "POST", body });
      if (n !== gen.current) return;
      if (v.projectOnly) {
        setNotice(
          "WLP 引用 " +
            (v.references.join("、") || "（无模型）") +
            "。请选择对应 WLKX。",
        );
        return;
      }
      published.current++;
      setInfo(v);
      onProject.current?.(v);
      if (shown.current) navigate("overview");
      search("");
      filter("");
      setPage(0);
      select(null);
      setNotice("已保存到本机工区");
      onFiles([]);
    } catch (e) {
      if (n === gen.current) setNotice(e.message);
    } finally {
      if (n === gen.current) loading(false);
    }
  }
  const detail = {
    info,
    item,
    selected: key,
    model,
    apply,
    onShowObject: () => navigate("objects"),
    onShowLocation: showLocation,
    onShowAll: showAllRelated,
    onPick: select,
    onPair: showPair,
  };
  return (
    <section className="sn-ez" aria-label="eZWalker 工区" hidden={!visible}>
      <style>{overviewStyle}</style>
      <header className="sn-page-head">
        <div>
          <div className="sn-context">
            <Icon name="folder" />
            {overview && info ? "工程图纸" : "工程资料"}
          </div>
          <h2>{overview && info ? "工区总图" : "eZWalker 工区"}</h2>
        </div>
        <div className="sn-actions">
          {info && (
            <button onClick={() => navigate(overview ? "objects" : "overview")}>
              <Icon name={overview ? "table" : "diagram"} />
              {overview ? "打开对象目录" : "返回工区总图"}
            </button>
          )}
          <input
            type="file"
            hidden
            multiple
            aria-label="eZWalker 文件"
            ref={file}
            accept=".wlkx,.wlp,.db,.package"
            onChange={(e) => {
              onFiles(Array.from(e.target.files));
              e.target.value = "";
            }}
          />
          <button disabled={busy} onClick={() => file.current.click()}>
            <Icon name="folder" />
            选择工区文件
          </button>
          {files.length > 0 && (
            <button
              className="sn-primary"
              disabled={
                busy ||
                (info === undefined &&
                  !files.every((f) => /\.wlp$/i.test(f.name)))
              }
              onClick={load}
            >
              <Icon name="upload" />
              {busy ? "正在读取模型…" : info ? "替换当前工区" : "导入工区"}
            </button>
          )}
        </div>
      </header>
      {files.length > 0 && (
        <div className="sn-staged">
          <span>待导入　{files.map((f) => f.name).join("、")}</span>
          <button disabled={busy} onClick={() => onFiles([])}>
            取消选择
          </button>
        </div>
      )}
      {notice && (
        <p className="sn-notice" role="status">
          {notice}
        </p>
      )}
      {summaryError && !info && (
        <div className="sn-staged" role="alert">
          <span>{summaryError}</span>
          {Q.host.fetch && (
            <button disabled={busy} onClick={retrySummary}>
              重新读取工区
            </button>
          )}
        </div>
      )}
      {info ? (
        <>
          <section className="sn-project-strip" aria-label="工区概况">
            <div className="sn-project-id">
              <Icon name="folder" />
              <div>
                <small>当前工区</small>
                <h3>{info.name}</h3>
              </div>
            </div>
            <dl>
              {[
                ["工程对象", info.objects],
                ["属性字段", info.fields],
                ["可查局部预览", info.geometryObjects],
              ].map(([label, n]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{n?.toLocaleString() ?? "—"}</dd>
                </div>
              ))}
            </dl>
          </section>
          <div className="sn-project-views" hidden={overview}>
            {info.views?.length > 0 && (
              <span>工程视点　{info.views.join("、")}</span>
            )}
            {info.wells?.length > 0 && (
              <WellMap points={info.wells} onSelect={select} />
            )}
          </div>
          <div className="sn-overview-grid" hidden={!overview}>
            <EzOverview
              key={info.revision}
              active={visible && overview}
              {...{
                api,
                info,
                selected: key,
                selectedName: item?.attributes?.find(
                  ([k]) => k === "位号",
                )?.[1],
                pair,
                onPick: select,
                onInspect: () => navigate("objects"),
                focusRequest,
                plotActions,
              }}
            />
            {overview &&
              (key ? (
                <EzObjectDetail {...detail} compact />
              ) : (
                <ExtentInfo info={info} />
              ))}
          </div>
          <div className="sn-ez-columns" hidden={overview}>
            <section className="sn-panel sn-object-list" aria-label="工程对象">
              <header className="sn-pane-head">
                <h3>
                  <Icon name="table" />
                  工程对象
                </h3>
                {result && <small>{result.count.toLocaleString()} 项</small>}
              </header>
              <div className="sn-ez-controls">
                <label className="sn-search">
                  <Icon name="search" />
                  <input
                    type="search"
                    aria-label="查找工程对象"
                    placeholder="查位号、名称或安装地点"
                    value={q}
                    onChange={(e) => {
                      select(null);
                      search(e.target.value);
                      setPage(0);
                    }}
                  />
                </label>
                <select
                  aria-label="对象类型"
                  value={kind}
                  onChange={(e) => {
                    select(null);
                    filter(e.target.value);
                    setPage(0);
                  }}
                >
                  <option value="">全部类型</option>
                  {(info.types || [])
                    .filter(([t]) => t)
                    .map(([t, n]) => (
                      <option key={t} value={t}>
                        {t}（{n}）
                      </option>
                    ))}
                </select>
              </div>
              <div className="sn-ez-scroll">
                <table aria-label="工程对象目录">
                  <thead>
                    <tr>
                      <th scope="col">源位号</th>
                      <th scope="col">名称</th>
                      <th scope="col">类型</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result?.rows.map(([t, n, tag, name, type]) => (
                      <tr
                        key={t + ":" + n}
                        className={
                          key?.[0] === t && key?.[1] === n ? "sel" : ""
                        }
                        onClick={() => select([t, n])}
                      >
                        <td>
                          <button className="sn-table-link">
                            {tag || t + ":" + n}
                          </button>
                        </td>
                        <td>{name}</td>
                        <td>{type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!result?.rows.length && (
                  <p className="sn-empty" role="status">
                    {result ? "没有匹配的工程对象" : "正在读取对象目录…"}
                  </p>
                )}
              </div>
              <div className="sn-pager">
                <span>
                  {result?.count
                    ? "第 " +
                      (page + 1) +
                      " / " +
                      Math.ceil(result.count / 50) +
                      " 页"
                    : "—"}
                </span>
                <div className="sn-actions">
                  <button
                    disabled={!result || !page}
                    onClick={() => {
                      select(null);
                      setPage(page - 1);
                    }}
                  >
                    上一页
                  </button>
                  <button
                    disabled={!result || (page + 1) * 50 >= result.count}
                    onClick={() => {
                      select(null);
                      setPage(page + 1);
                    }}
                  >
                    下一页
                  </button>
                </div>
              </div>
            </section>
            {!overview && <EzObjectDetail {...detail} compact={false} />}
          </div>
          <RelationsTable
            active={visible}
            key={"relations-" + info.revision}
            {...{
              api,
              info,
              selected: key,
              onPick: (k) => {
                select(k);
                if (overview) focusOnMap();
                scrollToDrawing();
              },
              onPair: showPair,
              scope: relationScope,
              setScope: setRelationScope,
              tableRef,
            }}
          />
        </>
      ) : (
        <section className="sn-panel sn-ez-empty">
          <Icon name="folder" />
          <h3>
            {info === undefined && !summaryError
              ? "正在读取本机工区…"
              : "工区文件"}
          </h3>
          <p>
            选择 WLKX 模型及对应的 WLP 工程文件，也可同时选择解包后的 data.db 与
            model.package。
          </p>
        </section>
      )}
    </section>
  );
}
