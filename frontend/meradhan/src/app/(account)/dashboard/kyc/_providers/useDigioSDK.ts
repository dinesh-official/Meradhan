import { BASES_URLS } from "@/core/config/base.urls";
import { useEffect, useState } from "react";

/* -------------------------------------------------------------
   📘 Digio SDK Type Definitions
------------------------------------------------------------- */

// Response object returned by Digio callback
export interface DigioResponse {
  txn_id?: string;
  digio_doc_id?: string;
  message?: string;
  error_code?: string;
}

// Theme settings
export interface DigioTheme {
  primaryColor?: string;
  secondaryColor?: string;
}

// Event payload structure
export interface DigioEventPayload {
  type: "error" | "info";
  data?: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
  };
}

// Event object received by event_listener
export interface DigioEvent {
  documentId: string;
  txnId: string;
  entity: string;
  identifier: string;
  event: string;
  payload: DigioEventPayload;
}

// Event filter (optional)
export interface DigioEventFilter {
  events: string[]; // e.g. ["sign.initiated", "sign.completed"]
}

// Main Digio SDK options
export interface DigioOptions {
  environment?: "sandbox" | "production";
  logo?: string;
  is_redirection_approach?: boolean;
  redirect_url?: string;
  is_iframe?: boolean;
  theme?: DigioTheme;
  event_listener?: (event: DigioEvent) => void;
  event_filter?: DigioEventFilter;
  callback?: (response: DigioResponse) => void;
  method?: "biometric" | string;
}

// Instance methods returned by the Digio SDK
export interface DigioInstance {
  init: () => void;
  submit: (
    documentId: string | string[],
    identifier: string,
    tokenId?: string
  ) => void;
  cancel: () => void;
}

/* -------------------------------------------------------------
   🌐 Global Declaration for Window.Digio
------------------------------------------------------------- */
declare global {
  interface Window {
    Digio?: new (options: DigioOptions) => DigioInstance;
  }
}

/* -------------------------------------------------------------
   ⚛️ useDigioSDK Hook
------------------------------------------------------------- */

/**
 * useDigioSDK
 * Safely access the Digio SDK loaded via <script> tag.
 * Example script (sandbox):
 * <script type="text/javascript" src="https://ext-gateway.digio.in/sdk/v11/digio.js"></script>
 */
export function useDigioSDK() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (window.Digio) {
      setIsReady(true);
      return;
    }

    const interval = setInterval(() => {
      if (window.Digio) {
        setIsReady(true);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  /**
   * Create a Digio instance when SDK is ready
   * @param options DigioOptions
   * @returns DigioInstance
   */
  const createInstance = (options: DigioOptions): DigioInstance => {
    if (!window.Digio) {
      throw new Error(
        "Digio SDK not loaded. Please add the <script> tag in your HTML."
      );
    }
    return new window.Digio({
      environment: BASES_URLS.DIGIO,
      logo: "https://www.meradhan.co/images/mera-dhan-logo.svg",
      theme: {
        primaryColor: "#002c59",
        secondaryColor: "#000000",
      },
      is_iframe: true,
      ...options,
    });
  };

  return { isReady, createInstance };
}
