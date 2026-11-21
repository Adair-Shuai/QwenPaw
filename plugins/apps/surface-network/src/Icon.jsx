const React = window.QwenPaw.host.React;

// Same 20-unit, single-stroke construction as the storage-capacity workbench.
const paths = {
  minus: "M4 10h12",
  plus: "M4 10h12M10 4v12",
  network: "M2 4h4v4H2zM2 12h4v4H2zM14 8h4v4h-4zM6 6h3l3 4h2M6 14h3l3-4",
  field:
    "M2 3.5h4v4H2zM2 12.5h4v4H2zM14 8h4v4h-4zM6 5.5h3l3 4.5h2M6 14.5h3l3-4.5",
  station:
    "M2 16.5h16M3 16V9l5-3v3l5-3v10M15 16l.6-13h2l.5 13M5.5 12h1M10 12h1",
  file: "M5 2.5h7l4 4v11H5zM12 2.5v4h4M7.5 11h6M7.5 14h4",
  folder: "M2.5 5h5l2 2H17.5v9h-15z",
  register:
    "M10 5C8 3.5 5 3.5 2.5 4.5v11c2.7-1 5.3-1 7.5.5 2.2-1.5 4.8-1.5 7.5-.5v-11C15 3.5 12 3.5 10 5zM10 5v11",
  upload: "M10 13V3M6 7l4-4 4 4M3 14v3h14v-3",
  download: "M10 3v9M6 8l4 4 4-4M3 14v3h14v-3",
  table: "M3 3h14v14H3zM3 8h14M8 8v9",
  adjustments: "M3 5h14M3 10h14M3 15h14M7 3v4M13 8v4M8 13v4",
  diagram: "M2.5 3.5h15v13h-15zM5 12l3-4 3 2 4-4",
  cube: "M10 2l7.5 4.3v7.5L10 18l-7.5-4.2V6.3zM2.8 6.5l7.2 4 7.2-4M10 10.5V18",
  expand: "M3 8V3h5M12 3h5v5M17 12v5h-5M8 17H3v-5",
  collapse: "M7 3v4H3M17 7h-4V3M13 17v-4h4M3 13h4v4",
  properties: "M3 3h14v14H3zM11.5 3v14M5.5 7h3M5.5 10h3",
  search: "M13.5 8a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0zM12 12l5 5",
  time: "M17.5 10a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0zM10 5.5V10l3 1.5",
  arrow: "M5 15 15 5M7 5h8v8",
};
export function Icon({ name }) {
  return (
    <svg
      className="sn-icon"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.55"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
