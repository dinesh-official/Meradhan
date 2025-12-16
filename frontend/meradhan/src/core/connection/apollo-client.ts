// lib/apolloClient.js
import { CMS_URL, HOST_URL } from "@/global/constants/domains";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import axios from "axios";
export const strApi = HOST_URL;
export const strAssets = HOST_URL + "/assets/cms/media";
// Load the API key from environment variables
// SECURITY: Never hardcode API keys. Must be set in environment variables.
// If not set, throw error in production, use empty string in development
export const API_KEY =
  process.env.NEXT_PUBLIC_GRAPHQL_KEY ||
  (() => {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "NEXT_PUBLIC_GRAPHQL_KEY environment variable is required in production"
      );
    }
    console.warn("NEXT_PUBLIC_GRAPHQL_KEY not set. GraphQL requests may fail.");
    return "";
  })();

export const strapiUrl = () => {
  // Determine the correct URL based on the environment
  try {
    // browser environment
    if (window.document) {
      return strApi + "/api/cms/graphql";
    } else {
      // server environment
      return CMS_URL + "/graphql";
    }
  } catch {
    return CMS_URL + "/graphql";
  }
};

// Create an HTTP link to your GraphQL endpoint
const httpLink = new HttpLink({
  uri: strapiUrl(), // Replace with your GraphQL endpoint
});

const authLink = new SetContextLink((prevContext) => {
  return {
    credentials: "include",
    next: { revalidate: 0 },
    headers: {
      ...prevContext.headers,
      Authorization: `Bearer ${API_KEY}`, // Or 'x-api-key' depending on the API requirement
      fetchPolicy: "no-cache",
      Accept: "application/json",
      "Content-Type": "application/json",
    },
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

export const strApiClient = axios.create({
  baseURL: strApi,
  headers: {
    Authorization: `Bearer ${API_KEY}`, // Or 'x-api-key' depending on the API requirement
    Accept: "application/json",
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    Expires: "0",
    cache: "no-store",
  },
});
