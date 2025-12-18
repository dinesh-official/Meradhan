"use client";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { queryClient } from "@/core/config/reactQuery";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode } from "react";
import { CookiesProvider } from "react-cookie";
import { Toaster } from "react-hot-toast";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { PageTrackingProvider } from "@/analytics/LogTracking";
function Client({ children }: { children: ReactNode }) {
  return (
    <CookiesProvider>
      {/* <UserTrackingProvider> */}
      <PageTrackingProvider>
        <QueryClientProvider client={queryClient}>
          <NuqsAdapter>{children}</NuqsAdapter>
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
      </PageTrackingProvider>
      {/* </UserTrackingProvider> */}
    </CookiesProvider>
  );
}

export default Client;
