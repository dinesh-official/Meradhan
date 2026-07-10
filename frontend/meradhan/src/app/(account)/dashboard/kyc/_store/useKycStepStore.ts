import { create } from "zustand";

export interface KycStepStore {
    step: number;
    isComplete: boolean;
    setStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    setIsComplete: (isComplete: boolean) => void
}

// max 6 min 1
export const useKycStepStore = create<KycStepStore>((set) => ({
    step: 0,
    isComplete: false,
    setStep: (step: number) => {
        if (step >= 1 && step <= 6) {
            set({ step });
        }
    },
    nextStep: () => set((state) => ({ step: state.step < 6 ? state.step + 1 : state.step })),
    prevStep: () => set((state) => ({ step: state.step > 1 ? state.step - 1 : state.step })),
    setIsComplete: (isComplete: boolean) => set({ isComplete }),
}))