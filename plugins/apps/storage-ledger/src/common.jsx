const React = window.QwenPaw.host.React;
export function useLoad(api, path, revision) {
  const [state, set] = React.useState({});
  React.useEffect(() => {
    if (!path) return;
    let live = true;
    api(path)
      .then((r) => r.json())
      .then((data) => {
        if (live) set({ path, revision, data });
      })
      .catch((e) => {
        if (live)
          set((previous) => ({
            path,
            revision,
            error: e.message,
            data: previous.path === path ? previous.data : undefined,
          }));
      });
    return () => {
      live = false;
    };
  }, [api, path, revision]);
  return state.path === path
    ? { ...state, updating: state.revision !== revision }
    : {};
}
export const names = {
  map: "库区井位图",
  surface: "地面管网",
  balance: "生产对账",
  quality: "质控复核",
  data: "数据管理",
  files: "资料库",
  well: "单井",
  pipe: "管线",
  station: "站场",
  record: "记录",
  project: "项目",
};
const drawings = {
  map: "M3 5l6-2 6 2 6-2v16l-6 2-6-2-6 2z M9 3v16m6-14v16",
  well: "M6 21h12M12 3l-5 17m5-17 5 17M9 13h6M8 17h8M8 6h8",
  surface: "M3 3h5v5H3z M16 16h5v5h-5z M5.5 8v10.5H16m-6-13h8.5V14",
  pipe: "M3 8h8V4h9v6h-4v4H3z M4 6v10m14-14v10",
  station: "M3 21V9l6 3V7l6 4V3h4v18z M6 16h2m3 0h2m3 0h1",
  balance: "M3 20V4m0 16h18M6 14l4-5 4 3 6-7",
  quality: "M12 2l8 3v6c0 5-4 8-8 11-4-3-8-6-8-11V5z M8 11l3 3 5-6",
  data: "M3 4h18v16H3z M3 9h18M3 14h18M9 9v11",
  files: "M3 6h6l2 2h10v12H3z",
  project: "M3 6h6l2 2h10v12H3z",
  import: "M12 3v12m-5-5 5 5 5-5 M3 16v5h18v-5",
  panel: "M3 4h18v16H3z M9 4v16",
  inspector: "M3 4h18v16H3z M15 4v16",
  focus: "M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5",
  source: "M5 2h9l5 5v15H5z M13 2v6h6M8 12h8m-8 4h6",
  search: "M16 16l5 5 M18 10a8 8 0 1 1-16 0 8 8 0 1 1 16 0",
  target: "M12 2v5m0 10v5M2 12h5m10 0h5 M19 12a7 7 0 1 1-14 0 7 7 0 1 1 14 0",
  home: "M3 12l9-9 9 9M6 10v11h12V10",
};
export function Icon({ name }) {
  return (
    <svg
      className="se-icon"
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.55"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={drawings[name] || drawings.source} />
    </svg>
  );
}
export const fmt = (n) =>
  n == null
    ? "—"
    : typeof n === "number"
    ? n.toLocaleString("zh-CN", { maximumFractionDigits: 4 })
    : n;
export function Table({ cols, rows, empty = "暂无记录" }) {
  return (
    <div className="sl-table">
      <table>
        <thead>
          <tr>
            {cols.map(([name]) => (
              <th key={name}>{name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {cols.map(([name, read]) => (
                <td key={name}>
                  {typeof read === "function" ? read(row) : fmt(row[read])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && <p>{empty}</p>}
    </div>
  );
}
