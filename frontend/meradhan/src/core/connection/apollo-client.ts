// lib/apolloClient.js
import { CMS_URL, HOST_URL } from "@/global/constants/domains";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import axios from "axios";
export const strApi = HOST_URL;
export const strAssets = HOST_URL + "/assets/cms/media";
// Load the API key from environment variables
export const API_KEY =
  process.env.GRAPHQL_KEY ||
  "9538e12d9a8ae051b257511fae5af06aad2a7b91e9d6bfac4d70eee547fafcfe91d5d9575b07e51c7d1b8c4227869a3bcc78e12cb1116441aa3bdd06d5fcd4ef3457dbc4ee6ea2a5f78eaaeb7663b42ff2ac334fa704abd3987bdab8ace815c2d3d37f64f83705838d7882e7c015421d08b779967ced6da398ef933aa6885c6d"; // Make sure to define this in .env.local

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
