import { create } from "zustand";

export const useOrderState = create<{
  quantity: number;
  setQuantity: (quantity: number) => void;
  // current step in the order process
  step: number;
  setStep: (step: number) => void;
  // settlement date for the order
  settlementDate: string;
  setSettlementDate: (settlementDate: string) => void;
  /** Set when payment order is created (final MeraDhan Order ID from server). */
  meradhanOrderNumber: string | null;
  setMeradhanOrderNumber: (v: string | null) => void;
}>((set) => ({
  quantity: 1,
  setQuantity: (quantity: number) => {
    // min 1 require
    if (quantity < 1) {
      quantity = 1;
    }
    set({ quantity });
  },
  // current step in the order process
  step: 1,
  setStep: (step: number) => {
    // mai 1
    set({ step });
  },
  // settlement date for the order
  settlementDate: "1",
  setSettlementDate: (settlementDate: string) => set({ settlementDate }),
  meradhanOrderNumber: null,
  setMeradhanOrderNumber: (meradhanOrderNumber: string | null) =>
    set({ meradhanOrderNumber }),
}));
