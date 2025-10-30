"use client";
import { ApolloProvider } from "@apollo/client/react";
import { queryClient } from "@/core/config/service-clients";
import { gqlClient } from "@/core/connection/apollo-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode } from "react";
import { CookiesProvider } from "react-cookie";
import { Toaster } from "react-hot-toast";

function Client({ children }: { children: ReactNode }) {
  return (
    <CookiesProvider>
      <QueryClientProvider client={queryClient}>
        <ApolloProvider client={gqlClient}>
          {children}
          <Toaster position="top-center" reverseOrder={false} />
          <ReactQueryDevtools
            initialIsOpen={false}
            buttonPosition="bottom-right"
            position="right"
          />
        </ApolloProvider>
      </QueryClientProvider>
    </CookiesProvider>
  );
}

export default Client;
