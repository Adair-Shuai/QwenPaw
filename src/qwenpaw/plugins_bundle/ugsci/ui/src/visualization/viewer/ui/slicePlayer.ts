/** Petrel-style I/J/K layer player under the 3D viewport. */

export type SliceAxis = "i" | "j" | "k";

export interface SlicePlayer {
  root: HTMLElement;
  setDims: (dims: number[] | undefined) => void;
  setPlaying: (playing: boolean) => void;
  setIndex: (value: number) => void;
  axis: () => SliceAxis | null;
  index: () => number;
}

export function sliceRangeText(index: number): string {
  const n = Math.max(1, Math.round(index));
  return n + ":" + n;
}

export function createSlicePlayer(options: {
  onAxis: (axis: SliceAxis | null) => void;
  onIndex: (axis: SliceAxis, index: number) => void;
  onPlay: (playing: boolean) => void;
}): SlicePlayer {
  let axis: SliceAxis | null = null;
  let playing = false;
  const dims = { i: 1, j: 1, k: 1 };

  const root = document.createElement("div");
  root.className = "oilgas-slice-player";
  root.style.cssText = [
    "position:absolute;height:32px;display:flex;align-items:center;gap:6px;",
    "padding:0 8px;background:rgba(13,17,23,.82);border:1px solid #30363d;",
    "border-radius:7px;z-index:19;box-sizing:border-box;pointer-events:auto;",
  ].join("");

  const label = document.createElement("span");
  label.textContent = "\u5207\u7247";
  label.style.cssText = "font-size:11px;color:#8b949e;flex:0 0 auto;";

  const axisBar = document.createElement("div");
  axisBar.style.cssText = "display:flex;gap:2px;flex:0 0 auto;";
  const axisButtons = new Map<SliceAxis | "off", HTMLButtonElement>();

  const paintAxis = () => {
    for (const [id, btn] of axisButtons) {
      const on = (id === "off" && axis === null) || id === axis;
      btn.style.background = on ? "#1f6feb" : "#21262d";
      btn.style.color = on ? "#fff" : "#8b949e";
    }
  };

  const addAxis = (id: SliceAxis | "off", text: string) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = text;
    btn.style.cssText = "width:28px;height:22px;padding:0;border:1px solid #30363d;border-radius:4px;cursor:pointer;font:600 11px/22px sans-serif;";
    btn.addEventListener("click", () => {
      axis = id === "off" ? null : id;
      playing = false;
      options.onPlay(false);
      paintAxis();
      paintPlay();
      updateSlider();
      options.onAxis(axis);
    });
    axisBar.appendChild(btn);
    axisButtons.set(id, btn);
  };
  addAxis("i", "I");
  addAxis("j", "J");
  addAxis("k", "K");
  addAxis("off", "\u5168");

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "1";
  slider.max = "1";
  slider.value = "1";
  slider.style.cssText = "flex:1;min-width:80px;margin:0;";
  slider.addEventListener("input", () => {
    if (!axis) return;
    readout.textContent = slider.value;
    options.onIndex(axis, Number(slider.value));
  });

  const readout = document.createElement("span");
  readout.style.cssText = "font:600 11px/1 monospace;color:#c9d1d9;min-width:36px;text-align:right;";
  readout.textContent = "-";

  const playBtn = document.createElement("button");
  playBtn.type = "button";
  playBtn.style.cssText = "width:28px;height:22px;padding:0;border:1px solid #30363d;border-radius:4px;background:#21262d;color:#c9d1d9;cursor:pointer;font-size:11px;";
  const paintPlay = () => {
    playBtn.textContent = playing ? "||" : ">";
    playBtn.title = playing ? "\u505c\u6b62\u64ad\u653e" : "\u6cbf I/J/K \u64ad\u653e";
    playBtn.disabled = !axis;
  };
  playBtn.addEventListener("click", () => {
    if (!axis) return;
    playing = !playing;
    paintPlay();
    options.onPlay(playing);
  });

  const updateSlider = () => {
    const max = axis ? Math.max(1, dims[axis]) : 1;
    slider.max = String(max);
    slider.disabled = !axis;
    if (Number(slider.value) > max) slider.value = "1";
    readout.textContent = axis ? slider.value : "-";
    paintPlay();
  };

  paintAxis();
  paintPlay();
  root.append(label, axisBar, slider, readout, playBtn);

  return {
    root,
    setDims: (next) => {
      dims.i = Math.max(1, Number(next?.[0]) || 1);
      dims.j = Math.max(1, Number(next?.[1]) || 1);
      dims.k = Math.max(1, Number(next?.[2]) || 1);
      updateSlider();
    },
    setPlaying: (value) => {
      playing = value;
      paintPlay();
    },
    setIndex: (value) => {
      const max = axis ? Math.max(1, dims[axis]) : 1;
      const next = Math.min(max, Math.max(1, Math.round(value)));
      slider.value = String(next);
      readout.textContent = axis ? slider.value : "-";
      if (axis) options.onIndex(axis, next);
    },
    axis: () => axis,
    index: () => Number(slider.value) || 1,
  };
}
