"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React, { ReactNode } from "react";
import { CookiesProvider } from "react-cookie";
import { Toaster } from "react-hot-toast";
const queryClient = new QueryClient();

function Client({ children }: { children: ReactNode }) {
  return (
    <CookiesProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-center" reverseOrder={false} />
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
          position="right"
        />
      </QueryClientProvider>
    </CookiesProvider>
  );
}

export default Client;
