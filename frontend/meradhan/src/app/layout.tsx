import NextTopLoader from "nextjs-toploader";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import Client from "./client";

import { SharePopupViewProvider } from "@/global/module/share/SharePopupView";
import { headers } from "next/headers";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import Script from "next/script";

import "./styles/globals.css";
import "./styles/datepicker.css";

import "./styles/override.css";

export const revalidate = 0;
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const header = await headers();
  const pathname = header.get("x-pathname");

  return (
    <html lang="en">
      <head>
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <link
          rel="apple-touch-icon"
          sizes="57x57"
          href="/favicon/apple-icon-57x57.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="60x60"
          href="/favicon/apple-icon-60x60.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="72x72"
          href="/favicon/apple-icon-72x72.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href="/favicon/apple-icon-76x76.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="114x114"
          href="/favicon/apple-icon-114x114.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="/favicon/apple-icon-120x120.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href="/favicon/apple-icon-144x144.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/favicon/apple-icon-152x152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-icon-180x180.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/favicon/android-icon-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/favicon/favicon-96x96.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        {/* canonical={pathname} */}
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_HOST_URL}${pathname}`}
        />

        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta
          name="msapplication-TileImage"
          content="/favicon/ms-icon-144x144.png"
        />
        <meta name="theme-color" content="#ffffff" />

        <script></script>
      </head>
      <body className={`antialiased`}>
        <NextTopLoader color="#002c59" />
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <NuqsAdapter>
            <Client>
              {children}
              <SharePopupViewProvider />
            </Client>
          </NuqsAdapter>
        </AppRouterCacheProvider>
        <Script
          type="text/javascript"
          src="https://app.digio.in/sdk/v11/digio.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
