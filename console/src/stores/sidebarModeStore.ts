import { create } from "zustand";
import { menuRegistry } from "../plugins/registry/store";

const STORAGE_KEY = "qwenpaw_sidebar_mode";

export type SidebarMode = "simple" | "full";

interface SidebarModeState {
  mode: SidebarMode;
  toggleMode: () => void;
  setMode: (mode: SidebarMode) => void;
}

export const useSidebarModeStore = create<SidebarModeState>((set) => ({
  // Default to "simple" mode (精简模式) on first launch.
  // Only switch to "full" if the user has explicitly stored "full".
  mode: (() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "full") return "full";
      // Persist "simple" on first launch so the plugin's isSimpleMode()
      // (which reads localStorage) is also consistent.
      if (stored !== "simple") {
        localStorage.setItem(STORAGE_KEY, "simple");
      }
      return "simple";
    } catch {
      return "simple";
    }
  })(),

  toggleMode: () =>
    set((state) => {
      const next: SidebarMode = state.mode === "simple" ? "full" : "simple";
      try {
        // Always persist the mode so we can distinguish "user chose full"
        // from "first launch default".
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // storage unavailable
      }
      // Invalidate menu snapshot cache so that visible() callbacks
      // (e.g. plugin menu items gated on sidebar mode) are re-evaluated.
      menuRegistry.refresh();
      return { mode: next };
    }),

  setMode: (mode: SidebarMode) => {
    try {
      // Always persist the mode (both "simple" and "full") so the default
      // can be changed without affecting existing users' preferences.
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // storage unavailable
    }
    menuRegistry.refresh();
    set({ mode });
  },
}));
