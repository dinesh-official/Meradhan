import { create } from "zustand";
import { persist } from "zustand/middleware";

type ViewMode = "list" | "grid";

interface ViewModeState {
  viewMode: ViewMode;
  toggleViewMode: () => void;
  setViewMode: (mode: ViewMode) => void;
}

export const useViewModeStore = create<ViewModeState>()(
  persist(
    (set, get) => ({
      viewMode: "list",
      toggleViewMode: () => {
        const next = get().viewMode === "list" ? "grid" : "list";
        set({ viewMode: next });
      },
      setViewMode: (mode) => set({ viewMode: mode }),
    }),
    {
      name: "view-mode",

      // 🔥 Write initial default into localStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          // If nothing in localStorage, write the default
          const stored = localStorage.getItem("view-mode");
          if (!stored) {
            localStorage.setItem("view-mode", JSON.stringify({ state }));
          }
        }
      },
    }
  )
);
