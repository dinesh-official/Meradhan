import { create } from "zustand";

type ChannelState = {
  try: number;
  max: number;
  errorMessage: string;
  successMessage: string;
  showCaptcha: boolean;
};

export interface IUserVerifyFlowStore {
  openOtpPopup: boolean;
  mode: "verify" | "support";
  emailOtp: string;
  mobileOtp: string;
  emailToken: string;
  mobileToken: string;
  email: ChannelState;
  mobile: ChannelState;
  setEmailOtp: (otp: string) => void;
  setMobileOtp: (otp: string) => void;
  setEmailToken: (token: string) => void;
  setMobileToken: (token: string) => void;
  incrementTry: (step: "email" | "mobile") => void;
  setErrorMessage: (step: "email" | "mobile", message: string) => void;
  setSuccessMessage: (step: "email" | "mobile", message: string) => void;
  setChannelCaptcha: (step: "email" | "mobile", show: boolean) => void;
  setMode: (mode: "verify" | "support") => void;
  setOpenOtpPopup: (open: boolean) => void;
  reset: () => void;
}

const initialChannel = (): ChannelState => ({
  try: 0,
  max: 3,
  errorMessage: "",
  successMessage: "",
  showCaptcha: false,
});

export const useTrackUserVerifyFlowStore = create<IUserVerifyFlowStore>(
  (set) => ({
    mode: "verify",
    openOtpPopup: false,
    emailOtp: "",
    mobileOtp: "",
    emailToken: "",
    mobileToken: "",
    email: initialChannel(),
    mobile: initialChannel(),

    setEmailOtp: (emailOtp) => set({ emailOtp }),
    setMobileOtp: (mobileOtp) => set({ mobileOtp }),
    setEmailToken: (emailToken) => set({ emailToken }),
    setMobileToken: (mobileToken) => set({ mobileToken }),

    setOpenOtpPopup: (open) => set({ openOtpPopup: open }),

    reset: () =>
      set({
        mode: "verify",
        emailOtp: "",
        mobileOtp: "",
        emailToken: "",
        mobileToken: "",
        email: initialChannel(),
        mobile: initialChannel(),
        openOtpPopup: false,
      }),

    incrementTry(step) {
      set((state) => ({
        [step]: {
          ...state[step],
          try: state[step].try + 1,
        },
      }));
    },

    setErrorMessage(step, message) {
      set((state) => ({
        [step]: { ...state[step], errorMessage: message },
      }));
    },

    setSuccessMessage(step, message) {
      set((state) => ({
        [step]: { ...state[step], successMessage: message },
      }));
    },

    setChannelCaptcha(step, show) {
      set((state) => ({
        [step]: { ...state[step], showCaptcha: show },
      }));
    },

    setMode(mode) {
      set({ mode });
    },
  }),
);
