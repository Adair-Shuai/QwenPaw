/** Plan-view well map (Easting / Northing) drawn onto a 2D canvas. */

export interface WellMapPoint {
  id: string;
  name: string;
  x: number;
  y: number;
  z?: number;
  path?: Array<[number, number]>;
}

export interface MapBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface WellMapTransform {
  toPixel(x: number, y: number): [number, number];
  fromPixel(px: number, py: number): [number, number];
}

const PAD = 18;

export function unionBounds(
  points: WellMapPoint[],
  extra?: MapBounds | null,
): MapBounds | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const consider = (x: number, y: number) => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  };
  for (const point of points) {
    consider(point.x, point.y);
    for (const [x, y] of point.path || []) consider(x, y);
  }
  if (extra) {
    consider(extra.minX, extra.minY);
    consider(extra.maxX, extra.maxY);
  }
  if (!Number.isFinite(minX)) return null;
  if (maxX - minX < 1) {
    minX -= 250;
    maxX += 250;
  }
  if (maxY - minY < 1) {
    minY -= 250;
    maxY += 250;
  }
  return { minX, minY, maxX, maxY };
}

export function wellMapTransform(
  bounds: MapBounds,
  width: number,
  height: number,
): WellMapTransform {
  const spanX = Math.max(bounds.maxX - bounds.minX, 1);
  const spanY = Math.max(bounds.maxY - bounds.minY, 1);
  const innerW = Math.max(width - PAD * 2, 1);
  const innerH = Math.max(height - PAD * 2, 1);
  const scale = Math.min(innerW / spanX, innerH / spanY);
  const offsetX = PAD + (innerW - spanX * scale) / 2;
  const offsetY = PAD + (innerH - spanY * scale) / 2;
  return {
    toPixel(x, y) {
      return [
        offsetX + (x - bounds.minX) * scale,
        height - (offsetY + (y - bounds.minY) * scale),
      ];
    },
    fromPixel(px, py) {
      return [
        bounds.minX + (px - offsetX) / scale,
        bounds.minY + (height - py - offsetY) / scale,
      ];
    },
  };
}

export function hitTestWellMap(
  points: WellMapPoint[],
  bounds: MapBounds,
  width: number,
  height: number,
  px: number,
  py: number,
  threshold = 14,
): string | null {
  const transform = wellMapTransform(bounds, width, height);
  let bestId: string | null = null;
  let bestDist = threshold * threshold;
  for (const point of points) {
    const [x, y] = transform.toPixel(point.x, point.y);
    const dx = x - px;
    const dy = y - py;
    const dist = dx * dx + dy * dy;
    if (dist <= bestDist) {
      bestDist = dist;
      bestId = point.id;
    }
  }
  return bestId;
}

export function createWellMapPanel(): { root: HTMLElement; canvas: HTMLCanvasElement } {
  const root = document.createElement("div");
  root.className = "oilgas-well-map";
  Object.assign(root.style, {
    position: "absolute",
    width: "228px",
    height: "176px",
    background: "rgba(13,17,23,.92)",
    border: "1px solid #30363d",
    borderRadius: "8px",
    zIndex: "16",
    overflow: "hidden",
    boxSizing: "border-box",
  } as CSSStyleDeclaration);

  const title = document.createElement("div");
  title.textContent = "井位平面图";
  title.style.cssText = "position:absolute;top:6px;left:8px;font:600 11px/1 -apple-system,sans-serif;color:#8b949e;pointer-events:none;";
  root.appendChild(title);

  const canvas = document.createElement("canvas");
  canvas.width = 228;
  canvas.height = 176;
  canvas.style.cssText = "display:block;width:100%;height:100%;cursor:pointer;";
  canvas.title = "点击井位以选中并聚焦";
  root.appendChild(canvas);
  return { root, canvas };
}

export function drawWellMap(
  canvas: HTMLCanvasElement,
  points: WellMapPoint[],
  selectedId: string | null,
  gridBounds?: MapBounds | null,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#0d1117";
  ctx.fillRect(0, 0, width, height);

  const bounds = unionBounds(points, gridBounds);
  if (!bounds) {
    ctx.fillStyle = "#484f58";
    ctx.font = "11px sans-serif";
    ctx.fillText("暂无井位", 16, height / 2);
    return;
  }
  const transform = wellMapTransform(bounds, width, height);

  if (gridBounds) {
    const [x0, y0] = transform.toPixel(gridBounds.minX, gridBounds.minY);
    const [x1, y1] = transform.toPixel(gridBounds.maxX, gridBounds.maxY);
    ctx.strokeStyle = "#30363d";
    ctx.lineWidth = 1;
    ctx.strokeRect(Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0));
  }

  ctx.lineWidth = 1.4;
  for (const point of points) {
    const selected = point.id === selectedId;
    if (point.path && point.path.length > 1) {
      ctx.beginPath();
      point.path.forEach(([x, y], index) => {
        const [px, py] = transform.toPixel(x, y);
        if (index === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.strokeStyle = selected ? "#ffd166" : "#6e7681";
      ctx.stroke();
    }
    const [px, py] = transform.toPixel(point.x, point.y);
    ctx.beginPath();
    ctx.arc(px, py, selected ? 5 : 3.5, 0, Math.PI * 2);
    ctx.fillStyle = selected ? "#ffd166" : "#58a6ff";
    ctx.fill();
    if (selected || points.length <= 12) {
      ctx.fillStyle = selected ? "#e6edf3" : "#8b949e";
      ctx.font = "10px sans-serif";
      ctx.fillText(point.name, px + 7, py + 3);
    }
  }
}
