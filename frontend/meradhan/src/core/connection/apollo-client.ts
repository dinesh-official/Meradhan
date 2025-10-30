// lib/apolloClient.js
import { HOST_URL } from "@/global/constants/domains";
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import axios from "axios";
export const strApi = HOST_URL;
export const strAssets = HOST_URL + "/assets/cms/media";
// Load the API key from environment variables
const API_KEY = process.env.GRAPHQL_KEY || "3bf77f973f4d6cc84c4a421dce7abc570452ba8514f93cd1dccc73271761b0996d9a63cc66e18363d4e667da302b16bb4842b6de13878aeba500800776e0a8e89dc90a5a43c1b77157d446a36db21a2d1bdb6087a2fd83606b70fc5027844151c774ef5431c611c09ca08e1fd1883615ebee381e389fe8dc2120ff0143ce3bac"; // Make sure to define this in .env.local

// Create an HTTP link to your GraphQL endpoint
const httpLink = new HttpLink({
    uri: strApi + "/api/cms/graphql", // Replace with your GraphQL endpoint
});

// Add the API key to the request headers using setContext
const authLink = setContext((_, { headers }) => {
    return {
        next: { revalidate: 0 },
        headers: {
            ...headers,
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
    },
});

export const strApiClient = axios.create({
    baseURL: strApi,
    headers: {
        Authorization: `Bearer ${API_KEY}`, // Or 'x-api-key' depending on the API requirement
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});
