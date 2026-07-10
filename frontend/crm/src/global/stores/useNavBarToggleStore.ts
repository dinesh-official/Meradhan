import { create } from "zustand";

interface UseNavOpenProp {
  isOpen: boolean;
  setNavOpen: (isOpen: boolean) => void;
}

export const useNavBarToggleStore = create<UseNavOpenProp>()((set) => ({
  isOpen: false,
  setNavOpen(isOpen) {
    set(() => ({ isOpen }));
  },
}));
