import { create } from "zustand";
import type { BondDetailsResponse } from "@root/apiGateway"; // adjust path if needed
import toast from "react-hot-toast";

interface CompareSelectState {
  selectedItems: BondDetailsResponse[];
  addItem: (item: BondDetailsResponse) => void;
  removeItem: (id: number) => void;
  clearItems: () => void;
}

export const useCompareSelectStore = create<CompareSelectState>((set, get) => ({
  selectedItems: [],

  addItem: (item) => {
    const { selectedItems } = get();

    if (selectedItems.length >= 3) {
      toast.error("You can only compare up to 3 bonds.");
      return;
    }

    const exists = selectedItems.some((bond) => bond.id === item.id);
    if (!exists) {
      set({ selectedItems: [...selectedItems, item] });
    }
  },

  removeItem: (id) =>
    set((state) => ({
      selectedItems: state.selectedItems.filter((bond) => bond.id !== id),
    })),

  clearItems: () => set({ selectedItems: [] }),
}));
