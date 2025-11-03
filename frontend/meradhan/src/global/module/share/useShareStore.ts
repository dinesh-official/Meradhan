import { create } from "zustand";

interface SharePopupState {
    isOpen: boolean;
    data: {
        title: string;
        url: string;
    }
    open: ({ title, url }: { title: string; url: string }) => void;
    close: () => void;
}

export const useSharePopupStore = create<SharePopupState>((set) => ({
    isOpen: false,
    data: {
        title: "Share",
        url: "https://meradhan.com",
    },
    open: ({ title, url }) => set({ isOpen: true, data: { title, url } }),
    close: () => set({
        isOpen: false, data: {
            title: "Share",
            url: "https://meradhan.com",
        }
    }),
}));
