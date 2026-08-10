/**
 * Global viewer state store.
 *
 * Implements a lightweight pub/sub pattern (no external dependency).
 * All engines and panels interact only through store actions,
 * never directly calling each other's methods.
 */

import type {
  ViewerState,
  DatasetInfo,
  ViewType,
  DomainSelection,
  PropertySelection,
  DomainFilter,
  ColorMapConfig,
  LoadingState,
  RendererMetrics,
} from "../contracts/types";

type Listener = (state: ViewerState) => void;

const DEFAULT_METRICS: RendererMetrics = {
  fps: 0,
  frameTime: 0,
  drawCalls: 0,
  triangles: 0,
  jsHeapMB: 0,
};

const DEFAULT_COLORMAP: ColorMapConfig = {
  name: "viridis",
  inverted: false,
  range: [0, 1],
};

const DEFAULT_LOADING: LoadingState = {
  stage: "",
  progress: 0,
  error: null,
};

class ViewerStore {
  private state: ViewerState = {
    dataset: null,
    activeView: "reservoir",
    selected: null,
    visibleObjectIds: new Set(),
    property: null,
    timeStep: 0,
    filters: [],
    colorMap: { ...DEFAULT_COLORMAP },
    loading: { ...DEFAULT_LOADING },
    metrics: { ...DEFAULT_METRICS },
  };

  private listeners: Set<Listener> = new Set();

  getState(): ViewerState {
    return this.state;
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private setState(partial: Partial<ViewerState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((fn) => fn(this.state));
  }

  // ─── Actions ──────────────────────────────────────────────────────

  setDataset(dataset: DatasetInfo | null) {
    this.setState({ dataset });
  }

  setActiveView(view: ViewType) {
    this.setState({ activeView: view });
  }

  setSelection(selection: DomainSelection | null) {
    this.setState({ selected: selection });
  }

  setProperty(property: PropertySelection | null) {
    this.setState({ property });
  }

  setTimeStep(step: number) {
    this.setState({ timeStep: step });
  }

  addFilter(filter: DomainFilter) {
    this.setState({ filters: [...this.state.filters, filter] });
  }

  setFilters(filters: DomainFilter[]) {
    this.setState({ filters: [...filters] });
  }

  removeFilter(index: number) {
    const filters = [...this.state.filters];
    filters.splice(index, 1);
    this.setState({ filters });
  }

  setColorMap(config: Partial<ColorMapConfig>) {
    this.setState({
      colorMap: { ...this.state.colorMap, ...config },
    });
  }

  setLoading(loading: Partial<LoadingState>) {
    this.setState({ loading: { ...this.state.loading, ...loading } });
  }

  setMetrics(metrics: Partial<RendererMetrics>) {
    this.setState({ metrics: { ...this.state.metrics, ...metrics } });
  }

  toggleObjectVisibility(id: string) {
    const visible = new Set(this.state.visibleObjectIds);
    if (visible.has(id)) {
      visible.delete(id);
    } else {
      visible.add(id);
    }
    this.setState({ visibleObjectIds: visible });
  }

  reset() {
    this.setState({
      dataset: null,
      selected: null,
      visibleObjectIds: new Set(),
      property: null,
      timeStep: 0,
      filters: [],
      loading: { ...DEFAULT_LOADING },
    });
  }
}

// Singleton store
export const viewerStore = new ViewerStore();
