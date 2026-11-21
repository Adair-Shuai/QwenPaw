import { fmt, Icon, Table } from "./common.jsx";
const React = window.QwenPaw.host.React;
export function related(pipes, node) {
  return pipes.filter((p) =>
    [p.start_node, p.end_node].some(
      (n) => n?.type === node.type && n.name === node.name,
    ),
  );
}
export const pipeKey = (p) => ({
  type: "pipe",
  src: p.src,
  row_no: p.row_no,
  name: p.code || p.name || "管线 " + p.row_no,
});
export function Surface({ doc, objects, open, inspect }) {
  const [query, filter] = React.useState("");
  const line =
    doc.type === "pipe" &&
    objects.pipes.find((p) => p.src === doc.src && p.row_no === doc.row_no);
  const links =
    doc.type === "station"
      ? related(objects.pipes, doc)
      : doc.type === "pipe"
      ? line
        ? [line]
        : []
      : objects.pipes;
  const connected = (node) =>
    node?.name && node.type !== "endpoint" ? (
      <button className="sl-link" onClick={() => open(node)}>
        {node.name}
      </button>
    ) : (
      node?.name || "未记录"
    );
  const trace = (p) =>
    inspect({ type: "record", area: "pipe", src: p.src, row_no: p.row_no });
  const title =
    doc.type === "station"
      ? doc.name
      : doc.type === "pipe"
      ? doc.name
      : "地面管网";
  const visible = links.filter((p) =>
    [p.code, p.name, p.start, p.end]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase().trim()),
  );
  return (
    <div className="se-paper">
      <header className="se-doc-head">
        <div>
          <small>
            {doc.type === "pipe"
              ? "地面管线档案"
              : doc.type === "station"
              ? "站场连接关系"
              : "地面集输系统"}
          </small>
          <h2>{title}</h2>
        </div>
        <span className="se-meta">{links.length} 条管线</span>
      </header>
      {line && (
        <>
          <div className="se-pipeline">
            <div>
              <Icon name={line.start_node.type} />
              <small>管线起点</small>
              {connected(line.start_node)}
            </div>
            <div className="se-pipe-span">
              <span>{fmt(line.length)} km</span>
              <hr />
              <span>外径 {fmt(line.diameter)} mm</span>
            </div>
            <div>
              <Icon name={line.end_node.type} />
              <small>管线终点</small>
              {connected(line.end_node)}
            </div>
          </div>
          <div className="se-tools">
            <b>{line.name}</b>
            <span>设计压力 {fmt(line.pressure)} MPa</span>
            <button onClick={() => trace(line)}>查看管线来源行</button>
          </div>
        </>
      )}
      {doc.type === "surface" && (
        <>
          <h3>站场连接索引</h3>
          <div className="se-stations">
            {objects.stations.map((name) => {
              const n = { type: "station", name },
                lp = related(objects.pipes, n);
              return (
                <button key={name} onClick={() => open(n)}>
                  <Icon name="station" />
                  <span>
                    <strong>{name}</strong>
                    <small>{lp.length} 条关联管线</small>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
      {doc.type === "station" && (
        <>
          <h3>相邻对象</h3>
          <div className="se-stations">
            {[
              ...new Map(
                links
                  .flatMap((p) => [p.start_node, p.end_node])
                  .filter(
                    (n) =>
                      n.name && !(n.type === doc.type && n.name === doc.name),
                  )
                  .map((n) => [n.type + n.name, n]),
              ).values(),
            ].map((n) => (
              <button
                key={n.type + n.name}
                disabled={n.type === "endpoint"}
                onClick={() => open(n)}
              >
                <Icon name={n.type} />
                {n.name}
              </button>
            ))}
          </div>
        </>
      )}
      <div className="se-section-head">
        <h3>管线明细</h3>
        <input
          type="search"
          aria-label="筛选管线"
          placeholder="管线、编号或站名"
          value={query}
          onChange={(e) => filter(e.target.value)}
        />
      </div>
      <Table
        rows={visible}
        cols={[
          [
            "管道编号",
            (p) => (
              <button className="sl-link" onClick={() => open(pipeKey(p))}>
                {p.code || "管线 " + p.row_no}
              </button>
            ),
          ],
          ["管道名称", "name"],
          ["起点", (p) => connected(p.start_node)],
          ["终点", (p) => connected(p.end_node)],
          ["长度 / km", "length"],
          ["外径 / mm", "diameter"],
          ["设计压力 / MPa", "pressure"],
          [
            "来源行",
            (p) => (
              <button className="sl-link" onClick={() => trace(p)}>
                {p.row_no}
              </button>
            ),
          ],
        ]}
        empty="没有匹配的管线记录"
      />
    </div>
  );
}
