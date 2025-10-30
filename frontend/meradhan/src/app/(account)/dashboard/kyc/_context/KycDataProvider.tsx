"use client";

import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { useMutation } from "@tanstack/react-query";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useKycDataStorage } from "../_store/useKycDataStorage";
import { useKycStepStore } from "../_store/useKycStepStore";
import { BiLoaderCircle } from "react-icons/bi";
import { useRouter } from "nextjs-toploader/app";

type TCallBack = {
  exit?: boolean;
  onSuccess?: () => void;
  onError?: () => void;
};

interface KycContextType {
  pushUserKycState: (e?: TCallBack) => void;
  pullUserKycState: () => void;
  isLoading: boolean;
}

const KycDataContext = createContext<KycContextType | undefined>(undefined);

function KycDataProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const kycDataStorage = useKycDataStorage();
  const kycStep = useKycStepStore();

  const api = new apiGateway.meradhan.customerKycApi.CustomerKycApi(
    apiClientCaller
  );

  // --- PULL USER KYC DATA (backend → local state)
  const pullUserKycProgressMutation = useMutation({
    mutationKey: ["pullUserKycProgress"],
    mutationFn: async () => await api.getKycProgress(),
    onMutate: () => setIsLoading(true),
    onSettled: () => setIsLoading(false),
    onSuccess: (data) => {
      if (data.responseData?.data) {
        kycDataStorage.setState(data.responseData.data);
        kycStep.setStep(data.responseData.step);
      }
    },
    onError: (error) => {
      console.error("Failed to pull KYC progress:", error);
    },
  });

  // --- PUSH USER KYC DATA (local → backend)
  const pushUserKycProgressMutation = useMutation({
    mutationKey: ["pushUserKycProgress"],
    mutationFn: async (e?: {
      exit?: boolean;
      onSuccess?: () => void;
      onError?: () => void;
    }) => {
      await api.storeKycProgress({
        data: kycDataStorage.state,
        step: kycStep.step,
      });

      if (e?.exit) {
        console.log("Exit");
      }
    },
    onMutate: () => setIsLoading(true),
    onSettled: () => setIsLoading(false),
    onSuccess: (data, variables) => {
      if (variables?.exit == true) {
        router.replace("/dashboard");
      }
      variables?.onSuccess?.();
    },
    onError: (error, variables) => {
      variables?.onError?.();
      console.error("Failed to push KYC progress:", error);
    },
  });

  const pushUserKycState = (e?: TCallBack) =>
    pushUserKycProgressMutation.mutate(e);
  const pullUserKycState = () => pullUserKycProgressMutation.mutate();

  // Auto-fetch user KYC progress on mount
  useEffect(() => {
    pullUserKycState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <KycDataContext.Provider
      value={{
        pushUserKycState,
        pullUserKycState,
        isLoading,
      }}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="top-0 right-0 z-[999] fixed flex justify-center items-center bg-black/10 w-full h-full">
          <BiLoaderCircle className="text-primary animate-spin" size={40} />
        </div>
      )}

      {children}
    </KycDataContext.Provider>
  );
}

// --- Custom Hook for safer access
export function useKycDataProvider() {
  const context = useContext(KycDataContext);
  if (!context) {
    throw new Error("useKycDataProvider must be used within a KycDataProvider");
  }
  return context;
}

export default KycDataProvider;
