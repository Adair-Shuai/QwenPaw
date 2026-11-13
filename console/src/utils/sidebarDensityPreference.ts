export type SidebarDensity = "comfortable" | "medium" | "compact";

const STORAGE_KEY = "ugsci_sidebar_density";
const CHANGE_EVENT = "ugsci:sidebar-density-change";
let memoryPreference: SidebarDensity | undefined;

function normalizeDensity(value: unknown): SidebarDensity {
  return value === "comfortable" || value === "compact" ? value : "medium";
}

/** Shared by the mounted navigation and the UGSci settings plugin. */
export const sidebarDensityPreference = {
  get(): SidebarDensity {
    if (memoryPreference) return memoryPreference;
    try {
      return normalizeDensity(localStorage.getItem(STORAGE_KEY));
    } catch {
      return "medium";
    }
  },
  set(value: SidebarDensity): void {
    const next = normalizeDensity(value);
    memoryPreference = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
      memoryPreference = undefined;
    } catch {
      // Keep this window responsive when persistence is unavailable.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  },
  subscribe(onChange: () => void): () => void {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) {
        memoryPreference = undefined;
        onChange();
      }
    };
    window.addEventListener(CHANGE_EVENT, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(CHANGE_EVENT, onChange);
      window.removeEventListener("storage", onStorage);
    };
  },
};
