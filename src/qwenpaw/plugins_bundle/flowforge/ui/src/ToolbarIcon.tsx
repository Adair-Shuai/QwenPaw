import React from "react";

const paths: Record<string, string> = {
  plus: "M12 5v14 M5 12h14",
  send: "M12 19V5 M5 12l7-7 7 7",
  quote: "M4 5h6v7H4z M4 12v3c0 3 2 4 5 4 M14 5h6v7h-6z M14 12v3c0 3 2 4 5 4",
  blocks: "M3 7h7v7H3z M3 14h7v7H3z M10 14h7v7h-7z M14 3h7v7h-7z",
  back: "M19 12H5 M11 6l-6 6 6 6",
  save: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12l4 4v12a2 2 0 0 1-2 2 M7 3v6h10V3 M7 21v-8h10v8",
  play: "M7 3l14 9-14 9z",
  check: "M9 12l2 2 4-4 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  undo: "M3 10h11a6 6 0 0 1 0 12 M3 10l5-5 M3 10l5 5",
  redo: "M21 10H10a6 6 0 0 0 0 12 M21 10l-5-5 M21 10l-5 5",
  chevron: "M6 9l6 6 6-6",
  search: "M21 21l-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  debug: "M3 3h18v18H3z M3 15h18",
  history: "M3 11a9 9 0 1 1 2 7 M3 4v7h7 M12 7v5l4 2",
  more: "M4 12h.01 M12 12h.01 M20 12h.01",
  copy: "M8 8h13v13H8z M16 8V3H3v13h5",
  group: "M3 9V3h6 M15 3h6v6 M21 15v6h-6 M9 21H3v-6 M8 8h8v8H8z",
  power: "M12 2v10 M6 5a9 9 0 1 0 12 0",
  close: "M6 6l12 12 M6 18L18 6",
  ai: "M12 3l3 6 6 3-6 3-3 6-3-6-6-3 6-3z M20 2v4 M18 4h4",
  note: "M3 3h18v12l-6 6H3z M15 21v-6h6",
  pointer: "M3 3l7 18 3-8 8-3z",
  hand: "M8 13V5a2 2 0 0 1 4 0v7 M12 9a2 2 0 0 1 4 0v3 M16 10a2 2 0 0 1 4 0v6c0 4-3 6-7 6-3 0-5-2-7-5l-3-5a2 2 0 0 1 3-2l2 3",
  fit: "M8 3H3v5 M16 3h5v5 M21 16v5h-5 M8 21H3v-5 M8 8h8v8H8z",
};
export function ToolbarIcon({ name }: { name: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={name === "more" ? 3 : 1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[name] || paths.blocks} />
    </svg>
  );
}
