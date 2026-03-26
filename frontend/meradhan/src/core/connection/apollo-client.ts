// lib/apolloClient.js
import { CMS_URL, HOST_URL } from "@/global/constants/domains";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import axios from "axios";
export const strApi = HOST_URL;
export const strAssets = HOST_URL + "/assets/cms/media";

/**
 * SECURITY FIX: GraphQL token is now handled server-side only.
 *
 * For client-side requests (browser), we route through /api/cms/graphql
 * which is a Next.js API route handler that adds the token server-side.
 *
 * For server-side requests (SSR), we use the token directly since it's
 * already in a secure server environment.
 */
const isBrowser = typeof window !== "undefined";

// Server-side only: Load the API key for SSR requests
// This should use GRAPHQL_KEY (without NEXT_PUBLIC_) for server-only access
const getServerApiKey = () => {
  if (isBrowser) {
    // Never expose token to browser
    return "";
  }

  // Server-side: use server-only env var first, fallback for migration
  const serverKey = process.env.GRAPHQL_KEY;

  if (!serverKey && process.env.NODE_ENV === "production") {
    throw new Error(
      "GRAPHQL_KEY environment variable is required in production (server-side only)"
    );
  }

  return serverKey || "";
};

export const strapiUrl = () => {
  // Client-side: route through Next.js API proxy (token added server-side)
  if (isBrowser) {
    return strApi + "/api/cms/graphql";
  }

  // Server-side: connect directly to CMS (token added here)
  return CMS_URL + "/graphql";
};

// Create an HTTP link to your GraphQL endpoint
const httpLink = new HttpLink({
  uri: strapiUrl(),
});

const authLink = new SetContextLink((prevContext) => {
  const headers: Record<string, string> = {
    ...prevContext.headers,
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  // SECURITY: Only add Authorization header on server-side
  // Client-side requests go through /api/cms/graphql which adds the token server-side
  if (!isBrowser) {
    const serverKey = getServerApiKey();
    if (serverKey) {
      headers.Authorization = `Bearer ${serverKey}`;
    }
  }
  // Client-side: Do NOT add Authorization header - let the API route handle it

  return {
    credentials: "include",
    next: { revalidate: 0 },
    headers,
  };
});

// Combine authLink and httpLink
export const gqlClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "no-cache",
      errorPolicy: "all",
    },
    query: {
      fetchPolicy: "no-cache",
      errorPolicy: "all",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
});

/**
 * Axios client for Strapi REST API calls
 *
 * SECURITY: For client-side requests, this should route through a server-side
 * proxy that adds the Authorization header. For now, we remove the token
 * from client-side requests to prevent exposure.
 *
 * TODO: Consider creating a similar proxy route for REST API calls if needed.
 */
export const strApiClient = axios.create({
  baseURL: strApi,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    Expires: "0",
    cache: "no-store",
  },
});

// Add Authorization header only for server-side requests
if (!isBrowser) {
  const serverKey = getServerApiKey();
  if (serverKey) {
    strApiClient.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${serverKey}`;
  }
}
// Client-side: Do NOT add Authorization header to prevent token exposure
