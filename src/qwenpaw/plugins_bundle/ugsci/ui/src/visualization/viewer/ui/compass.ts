/** North arrow and metric scale bar for the 3D viewport. */

export interface CompassHud {
  root: HTMLElement;
  setAzimuth: (radians: number) => void;
  setMetersPerPixel: (value: number) => void;
}

export function createCompassHud(): CompassHud {
  const root = document.createElement("div");
  root.className = "oilgas-compass";
  root.style.cssText = [
    "position:absolute;width:72px;pointer-events:none;z-index:18;",
    "display:flex;flex-direction:column;align-items:center;gap:6px;",
  ].join("");

  const canvas = document.createElement("canvas");
  canvas.width = 72;
  canvas.height = 72;
  canvas.style.cssText = "width:72px;height:72px;";

  const scale = document.createElement("div");
  scale.style.cssText = [
    "color:#c9d1d9;font:600 10px/1.2 ui-monospace,Menlo,monospace;",
    "background:rgba(13,17,23,.78);border:1px solid #30363d;border-radius:4px;",
    "padding:3px 6px;text-align:center;min-width:64px;",
  ].join("");
  scale.textContent = "\u2014";

  root.append(canvas, scale);

  const draw = (radians: number) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cx = 36;
    const cy = 36;
    ctx.clearRect(0, 0, 72, 72);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(radians);
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(13,17,23,.82)";
    ctx.fill();
    ctx.strokeStyle = "#30363d";
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 22);
    ctx.lineTo(7, 6);
    ctx.lineTo(0, 10);
    ctx.lineTo(-7, 6);
    ctx.closePath();
    ctx.fillStyle = "#8b949e";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, -24);
    ctx.lineTo(8, -4);
    ctx.lineTo(0, -8);
    ctx.lineTo(-8, -4);
    ctx.closePath();
    ctx.fillStyle = "#f85149";
    ctx.fill();
    ctx.fillStyle = "#e6edf3";
    ctx.font = "700 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("N", 0, -26);
    ctx.restore();
  };

  const niceLength = (meters: number): { meters: number; label: string } => {
    const mag = Math.pow(10, Math.floor(Math.log10(Math.max(meters, 1e-6))));
    const candidates = [1, 2, 5, 10].map((n) => n * mag);
    const picked = candidates.find((n) => n >= meters) || candidates[candidates.length - 1] * 10;
    const label = picked >= 1000 ? (picked / 1000).toFixed(picked % 1000 === 0 ? 0 : 1) + " km" : Math.round(picked) + " m";
    return { meters: picked, label };
  };

  draw(0);

  return {
    root,
    setAzimuth: (radians) => draw(radians),
    setMetersPerPixel: (value) => {
      const { label } = niceLength(Math.max(value * 48, 1));
      scale.textContent = label;
    },
  };
}
