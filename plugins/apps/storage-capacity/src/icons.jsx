const React = window.QwenPaw.host.React;
const paths = {
  chart: "M3 3v14h14M6 12l3-4 4 2 4-6",
  fields: "M3 5h14M3 10h14M3 15h14M7 3v4M13 8v4M8 13v4",
  open: "M11 3h6v6M17 3l-8 8M8 3H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4",
  table: "M3 3h14v14H3zM3 8h14M8 8v9",
  download: "M10 3v9M6 8l4 4 4-4M3 14v3h14v-3",
  image: "M3 3h14v14H3zM3 13l4-4 3 3 3-5 4 6M6 6h.01",
  grid: "M3 3h6v6H3zM12 3h5v6h-5zM3 12h6v5H3zM12 12h5v5h-5z",
  layers: "M3 3h10v10H3zM7 15v2h10V7h-2",
  expand: "M3 8V3h5M12 3h5v5M17 12v5h-5M8 17H3v-5",
  collapse: "M7 3v4H3M17 7h-4V3M13 17v-4h4M3 13h4v4",
  close: "M5 5l10 10M15 5L5 15",
  minus: "M4 10h12",
  panel: "M3 3h14v14H3zM12 3v14",
  plus: "M10 4v12M4 10h12",
};
export function Icon({ name, size = 16 }) {
  return (
    <svg
      className="sc-icon"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.chart} />
    </svg>
  );
}
