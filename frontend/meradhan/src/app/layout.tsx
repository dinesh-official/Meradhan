import { poppins, quicksand } from "@/global/font/font";
import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import Client from "./client";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "MeraDhan One: Buy Bonds Online from Fixed Income Investment Platform",
  description:
    "Explore fixed income investments with MeraDhan. Learn, buy, and sell bonds seamlessly. Empower your financial journey with expert insights and reliable tools.",
  icons: {
    icon: [
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      {
        url: "/favicon/android-icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    apple: [
      { url: "/favicon/apple-icon-57x57.png", sizes: "57x57" },
      { url: "/favicon/apple-icon-60x60.png", sizes: "60x60" },
      { url: "/favicon/apple-icon-72x72.png", sizes: "72x72" },
      { url: "/favicon/apple-icon-76x76.png", sizes: "76x76" },
      { url: "/favicon/apple-icon-114x114.png", sizes: "114x114" },
      { url: "/favicon/apple-icon-120x120.png", sizes: "120x120" },
      { url: "/favicon/apple-icon-144x144.png", sizes: "144x144" },
      { url: "/favicon/apple-icon-152x152.png", sizes: "152x152" },
      { url: "/favicon/apple-icon-180x180.png", sizes: "180x180" },
    ],
    other: [{ rel: "manifest", url: "/manifest.json" }],
  },

  other: {
    viewport:
      "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=0",
    "X-UA-Compatible": "IE=edge",
    "msapplication-TileColor": "#ffffff",
    "msapplication-TileImage": "/favicon/ms-icon-144x144.png",
  },
};

export const revalidate = 0;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.className} ${quicksand.variable} antialiased`}
      >
        <NextTopLoader color="#002c59" />
        <Client>{children}</Client>
        <Script
          type="text/javascript"
          src="https://ext-gateway.digio.in/sdk/v11/digio.js"
        />
      </body>
    </html>
  );
}
