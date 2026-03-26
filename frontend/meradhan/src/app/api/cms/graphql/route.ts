import { BASES_URLS } from "@/core/config/base.urls";
import { NextRequest, NextResponse } from "next/server";

/**
 * GraphQL Proxy Route Handler
 *
 * This route handler proxies GraphQL requests to Strapi CMS server-side,
 * adding the Authorization token securely on the server. This prevents
 * the token from being exposed to the browser.
 *
 * SECURITY: The GRAPHQL_KEY (without NEXT_PUBLIC_ prefix) should only
 * be set in server-side environment variables and never exposed to the client.
 */
export async function POST(request: NextRequest) {
  try {
    // Get the GraphQL token from server-side environment variable
    // This should NOT have NEXT_PUBLIC_ prefix to keep it server-only
    const graphqlKey = process.env.GRAPHQL_KEY;

    if (!graphqlKey) {
      console.error("GRAPHQL_KEY environment variable is not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Get the request body
    const body = await request.json();

    // Get the CMS URL from config
    // Try internal CMS URL first (for server-to-server access), fallback to public URL
    const internalCmsUrl =
      process.env.STRAPI_INTERNAL_URL || process.env.CMS_INTERNAL_URL;
    const cmsUrl = internalCmsUrl || BASES_URLS.CMS;

    if (!cmsUrl) {
      console.error("CMS URL is not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Forward the request to Strapi GraphQL endpoint with server-side token
    // Strapi GraphQL endpoint is typically at /graphql
    // If direct CMS access fails (e.g., 502 from Cloudflare), try alternative path
    const graphqlEndpoint = `${cmsUrl}/graphql`;

    // Try direct CMS access first
    let response = await fetch(graphqlEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${graphqlKey}`,
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    // If we get a 502 Bad Gateway (Cloudflare can't reach origin), try using Next.js internal routing
    // This uses the same rewrite mechanism that browser requests use
    if (response.status === 502) {
      console.warn(
        "Direct CMS access failed with 502, trying through Next.js internal routing"
      );

      // Get the host URL for internal routing
      const hostUrl = BASES_URLS.HOST || request.headers.get("host") || "";
      if (hostUrl) {
        // Use the internal Next.js URL which will go through the rewrite rule
        // This requires the token to be added, so we'll add it here
        const internalUrl = hostUrl.startsWith("http")
          ? `${hostUrl}/api/cms/graphql`
          : `https://${hostUrl}/api/cms/graphql`;

        // But wait - this would create a loop since we ARE the /api/cms/graphql route
        // Instead, let's try the CMS URL with /api/graphql path (some Strapi setups use this)
        const alternativeEndpoint = `${cmsUrl}/api/graphql`;
        console.log("Trying alternative endpoint:", alternativeEndpoint);

        response = await fetch(alternativeEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${graphqlKey}`,
            Accept: "application/json",
          },
          body: JSON.stringify(body),
        });
      }
    }

    // Check response status and content type
    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    if (!isJson) {
      // Get the response text to see what we received
      const text = await response.text();
      console.error("GraphQL proxy received non-JSON response:", {
        status: response.status,
        statusText: response.statusText,
        contentType,
        url: graphqlEndpoint,
        cmsUrl,
        preview: text.substring(0, 500),
      });

      return NextResponse.json(
        {
          error: "Invalid response from CMS",
          message: `Expected JSON but received ${
            contentType || "unknown"
          }. Status: ${response.status}`,
          status: response.status,
          // Only include details in development
          ...(process.env.NODE_ENV === "development" && {
            details: text.substring(0, 1000),
            url: graphqlEndpoint,
          }),
        },
        { status: response.status || 500 }
      );
    }

    // Parse JSON response
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error("Failed to parse JSON response:", {
        error: parseError,
        status: response.status,
        statusText: response.statusText,
        contentType,
        url: graphqlEndpoint,
      });
      return NextResponse.json(
        {
          error: "Failed to parse CMS response",
          message:
            parseError instanceof Error
              ? parseError.message
              : "Unknown parse error",
        },
        { status: 500 }
      );
    }

    // Return the response with appropriate status
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("GraphQL proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle GET requests (some GraphQL clients use GET for queries)
export async function GET(request: NextRequest) {
  try {
    const graphqlKey = process.env.GRAPHQL_KEY;

    if (!graphqlKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Try internal CMS URL first (for server-to-server access), fallback to public URL
    const internalCmsUrl =
      process.env.STRAPI_INTERNAL_URL || process.env.CMS_INTERNAL_URL;
    const cmsUrl = internalCmsUrl || BASES_URLS.CMS;

    if (!cmsUrl) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");
    const variables = searchParams.get("variables");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    // Build the GraphQL request
    const body: { query: string; variables?: unknown } = { query };
    if (variables) {
      try {
        body.variables = JSON.parse(variables);
      } catch {
        return NextResponse.json(
          { error: "Invalid variables parameter" },
          { status: 400 }
        );
      }
    }

    const graphqlEndpoint = `${cmsUrl}/graphql`;

    const response = await fetch(graphqlEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${graphqlKey}`,
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    // Check response status and content type
    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    if (!isJson) {
      const text = await response.text();
      console.error("GraphQL proxy GET received non-JSON response:", {
        status: response.status,
        statusText: response.statusText,
        contentType,
        url: graphqlEndpoint,
        cmsUrl,
        preview: text.substring(0, 500),
      });

      return NextResponse.json(
        {
          error: "Invalid response from CMS",
          message: `Expected JSON but received ${
            contentType || "unknown"
          }. Status: ${response.status}`,
          status: response.status,
          ...(process.env.NODE_ENV === "development" && {
            details: text.substring(0, 1000),
            url: graphqlEndpoint,
          }),
        },
        { status: response.status || 500 }
      );
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error("Failed to parse JSON response:", {
        error: parseError,
        status: response.status,
        statusText: response.statusText,
        contentType,
        url: graphqlEndpoint,
      });
      return NextResponse.json(
        {
          error: "Failed to parse CMS response",
          message:
            parseError instanceof Error
              ? parseError.message
              : "Unknown parse error",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("GraphQL proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
