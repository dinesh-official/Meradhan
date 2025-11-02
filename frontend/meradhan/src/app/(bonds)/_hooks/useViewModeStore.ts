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
            viewMode: "list", // default view
            toggleViewMode: () => {
                const next = get().viewMode === "list" ? "grid" : "list";
                set({ viewMode: next });
            },
            setViewMode: (mode) => set({ viewMode: mode }),
        }),
        {
            name: "view-mode", // key in localStorage
        }
    )
);
