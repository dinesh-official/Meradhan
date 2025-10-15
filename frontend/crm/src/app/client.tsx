"use client";
import { UserTrackingProvider } from "@/analytics";
import { queryClient } from "@/core/config/reactQuery";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode } from "react";
import { CookiesProvider } from "react-cookie";
import { Toaster } from "react-hot-toast";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

function Client({ children }: { children: ReactNode }) {
  return (
    <CookiesProvider>
      <UserTrackingProvider>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster
            position="top-right"
            reverseOrder={false}
            containerStyle={{
              marginTop: "60px",
            }}
            toastOptions={{
              duration: 4000,
              style: {
                marginTop: "180px",
              },
            }}
          />
          <SonnerToaster position="top-center" richColors />
          <ReactQueryDevtools
            initialIsOpen={false}
            buttonPosition="bottom-right"
            position="right"
          />
        </QueryClientProvider>
      </UserTrackingProvider>
    </CookiesProvider>
  );
}

export default Client;
