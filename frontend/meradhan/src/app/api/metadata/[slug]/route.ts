import { NextResponse } from "next/server";

export const GET = async () => {
  return NextResponse.json({
    title: "MeraDhan - India's Premier Bond Investment Platform",
    description:
      "Discover a wide range of government and corporate bonds on MeraDhan. Invest wisely with our expert insights, real-time data, and user-friendly platform.",
    keywords:
      "MeraDhan, Bonds, Government Bonds, Corporate Bonds, Bond Investment, Fixed Income, Investment Platform, Financial Growth, Secure Investments, Bond Market India",
  });
};
