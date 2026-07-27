import NextTopLoader from "nextjs-toploader";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import Client from "./client";

import { SharePopupViewProvider } from "@/global/module/share/SharePopupView";
import ScrollToTop from "@/global/components/ScrollToTop";
import { headers } from "next/headers";
import Script from "next/script";
import type { Metadata, Viewport } from "next";

import "./styles/datepicker.css";
import "./styles/globals.css";

import "./styles/override.css";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "MeraDhan - India's Trusted Bond Investment Platform",
  description: "Invest in bonds securely with MeraDhan. Access 26000+ bonds with fixed returns of 8-12%.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const header = await headers();
  const pathname = header.get("x-pathname");

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="google-tag-manager"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PDZ7WFGD');`,
          }}
        />
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
      </head>
      <body className={`antialiased`} suppressHydrationWarning>
        {/* Apply saved accessibility prefs before first paint (no flash of normal mode on navigation/redirect) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem('a11y-high-contrast')==='1'){document.documentElement.classList.add('dark');document.body.classList.add('high-contrast');}var f=localStorage.getItem('a11y-font-scale');if(f){document.documentElement.style.setProperty('--a11y-font-scale',f);}}catch(e){}})();`,
          }}
        />
        <a href="#main-content" className="skip-to-content">Skip to main content</a>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PDZ7WFGD"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <NextTopLoader color="#002c59" />
        <NuqsAdapter>
          <Client>
            <main id="main-content">{children}</main>
            <SharePopupViewProvider />
            <ScrollToTop />
          </Client>
        </NuqsAdapter>
        <Script
          type="text/javascript"
          src="https://app.digio.in/sdk/v11/digio.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
