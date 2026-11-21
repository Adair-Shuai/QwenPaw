import { Icon } from "./Icon.jsx";
const React = window.QwenPaw.host.React;
const states = {
  resolved: "已定位",
  ambiguous: "同名待核对",
  unresolved: "待匹配",
  candidate: "端面吻合 · 待核对",
};
const keyOf = (o) => [o.tree, o.node];
const nameOf = (o) => o?.tag || o?.name || (o ? o.tree + ":" + o.node : "");
function AssetLink({ asset, onPick }) {
  return asset ? (
    <button
      className="sn-table-link"
      onClick={() => onPick(keyOf(asset))}
      title={asset.name || undefined}
    >
      {nameOf(asset)}
    </button>
  ) : null;
}
function stateOf(r) {
  return states[r.status] || r.status;
}
export function RelatedObjects({
  record,
  selected,
  onPick,
  onPair,
  onShowAll,
}) {
  if (!record?.available) return null;
  return (
    <section className="sn-related" aria-label="选中对象关联">
      <header>
        <h4>
          关联记录 <small>{record.count.toLocaleString()}</small>
        </h4>
        {record.count > 0 && <button onClick={onShowAll}>查看全部</button>}
      </header>
      {record.count > 0 ? (
        <ul>
          {record.rows.slice(0, 4).map((row) => {
            const fromHere =
                row.owner.tree === selected[0] &&
                row.owner.node === selected[1],
              peer = fromHere ? row.target : row.owner;
            return (
              <li key={row.id}>
                <span className="sn-related-role">
                  {row.label} · {row.role}
                </span>
                <div>
                  <span>
                    {peer ? (
                      <AssetLink asset={peer} onPick={onPick} />
                    ) : (
                      row.text
                    )}
                  </span>
                  {row.target && (
                    <button onClick={() => onPair(row)}>图上对照</button>
                  )}
                </div>
                <small>{stateOf(row)}</small>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>未检索到该对象的端点或源引用记录。</p>
      )}
    </section>
  );
}
export function RelationsTable({
  api,
  active = true,
  info,
  selected,
  onPick,
  onPair,
  scope,
  setScope,
  tableRef,
}) {
  const [q, setQ] = React.useState(""),
    [kind, setKind] = React.useState(""),
    [p, setP] = React.useState(0);
  const [result, setResult] = React.useState(null),
    [error, setError] = React.useState(""),
    [attempt, retry] = React.useReducer((n) => n + 1, 0);
  const [types, setTypes] = React.useState(info.topology?.types || []);
  const asset = scope === "object" ? selected : null,
    tree = asset?.[0],
    node = asset?.[1];
  // An old page number belongs to the previous object or filter; never request it
  // under the new scope while the first page is being loaded.
  const filterKey = JSON.stringify([tree, node, q, kind, scope]),
    previous = React.useRef(filterKey);
  const page = previous.current === filterKey ? p : 0;
  React.useEffect(() => {
    if (previous.current !== filterKey) {
      previous.current = filterKey;
      setP(0);
    }
  }, [filterKey]);
  React.useEffect(() => {
    if (!active) return;
    let alive = true;
    const ac = new AbortController();
    setResult(null);
    setError("");
    const param = new URLSearchParams({
      q,
      kind,
      page,
      revision: info.revision,
    });
    if (tree !== undefined) {
      param.set("tree", tree);
      param.set("node", node);
    }
    const timer = setTimeout(
      () =>
        api("/topology?" + param, { signal: ac.signal })
          .then((v) => {
            if (alive) {
              setResult(v);
              if (v.types) setTypes(v.types);
            }
          })
          .catch((e) => {
            if (alive) setError(e.message);
          }),
      q ? 140 : 0,
    );
    return () => {
      alive = false;
      ac.abort();
      clearTimeout(timer);
    };
  }, [active, api, info.revision, q, kind, page, tree, node, attempt]);
  return (
    <section
      className="sn-panel sn-relations"
      ref={tableRef}
      aria-label="工区连接记录"
    >
      <header className="sn-pane-head">
        <h3>
          <Icon name="network" />
          连接记录
        </h3>
        <small>
          {result?.available ? result.count.toLocaleString() + " 条" : ""}
        </small>
      </header>
      {info.topology?.types?.some((t) => t.id === "process" && t.count === 0) &&
        !info.topology.centerlineRows && (
          <p className="sn-relation-note">
            源工区未列出工艺起终点。端面吻合记录可定位到两侧对象，供核对工艺连接。
          </p>
        )}
      <div className="sn-ez-controls">
        <label className="sn-search">
          <Icon name="search" />
          <input
            type="search"
            aria-label="查找连接记录"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="查位号、端点或源记录"
          />
        </label>
        <select
          aria-label="连接记录类型"
          value={kind}
          onChange={(e) => setKind(e.target.value)}
        >
          <option value="">全部关系类型</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          aria-label="连接记录范围"
          value={scope}
          onChange={(e) => setScope(e.target.value)}
        >
          <option value="project">整个工区</option>
          <option value="object" disabled={!selected}>
            仅当前对象
          </option>
        </select>
      </div>
      {error ? (
        <p className="sn-empty" role="alert">
          {error} <button onClick={retry}>重试</button>
        </p>
      ) : !result ? (
        <p className="sn-empty" role="status">
          正在读取关系记录…
        </p>
      ) : !result.available ? (
        <p className="sn-empty">当前工区尚未建立关系索引。</p>
      ) : !result.count ? (
        <p className="sn-empty">当前范围内没有匹配的关系记录。</p>
      ) : (
        <>
          <div className="sn-relation-scroll">
            <table aria-label="源文件连接记录">
              <thead>
                <tr>
                  {[
                    "源对象",
                    "关系 / 端点",
                    "对应对象或源文",
                    "匹配情况",
                    "来源",
                    "",
                  ].map((v, i) => (
                    <th key={i} scope="col">
                      {v}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <AssetLink asset={row.owner} onPick={onPick} />
                    </td>
                    <td>
                      {row.label}
                      <small>{row.role}</small>
                    </td>
                    <td>
                      {row.target ? (
                        <AssetLink asset={row.target} onPick={onPick} />
                      ) : (
                        row.text
                      )}
                    </td>
                    <td>
                      {stateOf(row)}
                      {row.status === "ambiguous" && row.matches > 1 && (
                        <small>{row.matches} 个同名对象</small>
                      )}
                    </td>
                    <td>
                      <details>
                        <summary>{row.field || "源记录"}</summary>
                        <span>{row.evidence || row.text}</span>
                      </details>
                    </td>
                    <td>
                      {row.target && (
                        <button
                          title={nameOf(row.owner) + " / " + nameOf(row.target)}
                          onClick={() => onPair(row)}
                        >
                          图上对照
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="sn-pager">
            <span>
              第 {page + 1} / {Math.ceil(result.count / result.pageSize)} 页
            </span>
            <div className="sn-actions">
              <button
                disabled={!page}
                onClick={() => setP((v) => v - 1)}
                aria-label="连接记录上一页"
              >
                上一页
              </button>
              <button
                disabled={(page + 1) * result.pageSize >= result.count}
                onClick={() => setP((v) => v + 1)}
                aria-label="连接记录下一页"
              >
                下一页
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
