import { create } from "zustand";

export const useIssuerViewType = create<{
  gridMode: boolean;
  setGridMode: (mode: boolean) => void;
}>((set) => ({
  gridMode: true,
  setGridMode: (mode: boolean) => set(() => ({ gridMode: mode })),
}));
