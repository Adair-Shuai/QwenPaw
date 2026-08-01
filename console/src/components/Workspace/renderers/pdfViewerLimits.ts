const MAX_CANVAS_PIXELS = 8_000_000;
const MAX_DEVICE_PIXEL_RATIO = 2;

export interface CanvasScale {
  cssWidth: number;
  cssHeight: number;
  outputScale: number;
}

/** Bound one canvas to roughly 32 MB of RGBA memory. */
export function constrainCanvasScale(
  cssWidth: number,
  cssHeight: number,
  devicePixelRatio: number,
): CanvasScale {
  let outputScale = Math.min(
    Math.max(devicePixelRatio || 1, 1),
    MAX_DEVICE_PIXEL_RATIO,
  );
  const pixels = cssWidth * cssHeight * outputScale * outputScale;
  if (pixels > MAX_CANVAS_PIXELS) {
    outputScale *= Math.sqrt(MAX_CANVAS_PIXELS / pixels);
  }
  return { cssWidth, cssHeight, outputScale };
}
