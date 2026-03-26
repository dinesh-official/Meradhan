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
  settlementDate: "0",
  setSettlementDate: (settlementDate: string) => set({ settlementDate }),
}));
