import { create } from "zustand";

export interface IUserVerifyFlowStore {
  openOtpPopup: boolean;
  currentStep: "email" | "mobile" | "support";
  showCaptcha: boolean;
  otp: string;
  email: {
    try: number;
    max: number;
    errorMessage: string;
    successMessage: string;
  };
  mobile: {
    try: number;
    max: number;
    errorMessage: string;
    successMessage: string;
  };
  setOtp: (otp: string) => void;
  incrementTry: (step: "email" | "mobile") => void;
  setErrorMessage: (step: "email" | "mobile", message: string) => void;
  setSuccessMessage: (step: "email" | "mobile", message: string) => void;
  setVerified: (step: "email" | "mobile") => void;
  setStep: (step: "email" | "mobile" | "support") => void;
  setShowCaptcha: (show: boolean) => void;
  setOpenOtpPopup: (open: boolean) => void;
  reset: () => void;
}

export const useTrackUserVerifyFlowStore = create<IUserVerifyFlowStore>(
  (set) => ({
    currentStep: "email",
    openOtpPopup: false,
    email: {
      try: 0,
      max: 3,
      errorMessage: "",
      successMessage: "",
    },
    mobile: {
      try: 0,
      max: 3,
      errorMessage: "",
      successMessage: "",
    },
    otp: "",
    showCaptcha: false,

    setShowCaptcha: (show: boolean) => {
      set({
        showCaptcha: show,
      });
    },

    setOtp: (otp: string) => {
      set({
        otp,
      });
    },

    setOpenOtpPopup: (open: boolean) => {
      set({
        openOtpPopup: open,
      });
    },

    reset: () => {
      set({
        currentStep: "email",
        email: {
          try: 0,
          max: 3,
          errorMessage: "",
          successMessage: "",
        },
        mobile: {
          try: 0,
          max: 3,
          errorMessage: "",
          successMessage: "",
        },
        otp: "",
        showCaptcha: false,
        openOtpPopup: false,
      });
    },

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
        [step]: {
          ...state[step],
          errorMessage: message,
        },
      }));
    },

    setSuccessMessage(step, message) {
      set((state) => ({
        [step]: {
          ...state[step],
          successMessage: message,
        },
      }));
    },

    setVerified(step) {
      set((state) => ({
        [step]: {
          ...state[step],
          isVerified: true,
        },
      }));
    },

    setStep(step) {
      set({
        currentStep: step,
      });
    },
  })
);
