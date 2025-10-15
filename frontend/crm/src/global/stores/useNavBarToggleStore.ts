import { create } from "zustand";

interface UseNavOpenProp {
  isOpen: boolean;
  setNavOpen: (isOpen: boolean) => void;
}

export const useNavBarToggleStore = create<UseNavOpenProp>()((set) => ({
  isOpen: true,
  setNavOpen(isOpen) {
    set(() => ({ isOpen }));
  },
}));
