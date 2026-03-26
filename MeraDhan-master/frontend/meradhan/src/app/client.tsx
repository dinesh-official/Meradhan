"use client";
import { PrimeReactProvider } from "primereact/api";
import { PageTrackingProvider } from "@/analytics/LogsTracking";
import { queryClient } from "@/core/config/service-clients";
import { gqlClient } from "@/core/connection/apollo-client";
import { ApolloProvider } from "@apollo/client/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode } from "react";
import { CookiesProvider } from "react-cookie";
import { Toaster } from "react-hot-toast";
import DhanGptPopup from "./(tools)/dhangpt/_components/DhanGptPopup";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

function Client({ children }: { children: ReactNode }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <PrimeReactProvider>
        <CookiesProvider>
          <PageTrackingProvider>
            <QueryClientProvider client={queryClient}>
              <ApolloProvider client={gqlClient}>
                {children}
                <DhanGptPopup />
                <Toaster position="top-center" reverseOrder={false} />
                <ReactQueryDevtools
                  initialIsOpen={false}
                  buttonPosition="bottom-right"
                  position="right"
                />
              </ApolloProvider>
            </QueryClientProvider>
          </PageTrackingProvider>
        </CookiesProvider>
      </PrimeReactProvider>
    </LocalizationProvider>
  );
}

export default Client;
