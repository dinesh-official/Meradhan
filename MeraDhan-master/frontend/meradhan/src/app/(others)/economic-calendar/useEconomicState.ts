import { Range } from "react-date-range";
import { create } from "zustand";
const getRangeWeek = () => {
  const now = new Date();
  const day = now.getDay(); // 0 (Sun) - 6 (Sat)
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() + diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return {
    startDate: startOfWeek,
    endDate: endOfWeek,
  };
};

export const useEconomicState = create<{
  dateTab: string;
  showFilter: boolean;
  country: string[];
  category: string[];
  importance: string[];
  dateRange: Range[];
  setShowFilter: (showFilter: boolean) => void;
  setDateTab: (dateTab: string) => void;
  setCountry: (country: string) => void;
  setCategory: (category: string) => void;
  setImportance: (importance: string) => void;
  setDateRange: (dateRange: Range[]) => void;
  resetFilter: () => void;
}>((set, get) => ({
  dateTab: "THIS_WEEK",
  showFilter: false,
  country: [],
  category: [],
  importance: [],
  dateRange: [
    {
      startDate: getRangeWeek().startDate,
      endDate: getRangeWeek().endDate,
      key: "selection",
    },
  ],
  setShowFilter: (showFilter) => set({ showFilter }),
  setDateTab: (dateTab) => set({ dateTab }),
  // make add or auto remove function

  setCountry: (newCountry) => {
    const { country } = get();
    if (country.includes(newCountry)) {
      set({ country: country.filter((c) => c !== newCountry) });
    } else {
      set({ country: [...country, newCountry] });
    }
  },
  setCategory: (newCategory) => {
    const { category } = get();
    if (category.includes(newCategory)) {
      set({ category: category.filter((c) => c !== newCategory) });
    } else {
      set({ category: [...category, newCategory] });
    }
  },
  setImportance: (newImportance) => {
    const { importance } = get();
    if (importance.includes(newImportance)) {
      set({ importance: importance.filter((i) => i !== newImportance) });
    } else {
      set({ importance: [...importance, newImportance] });
    }
  },
  setDateRange: (dateRange) => set({ dateRange }),

  resetFilter: () => {
    set({
      country: [],
      category: [],
      importance: [],
    });
  },
}));
