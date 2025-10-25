"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Footer from "@/global/components/footer/Footer";
import NewsLetter from "@/global/components/footer/NewsLetter";
import NavBar from "@/global/components/navbar/NavBar";
import React from "react";
import ListNseData from "./_components/ListNseData";
import ListFilter from "./_components/ListFilter";

export const nseData = [
  {
    date: "21 Jul 2025",
    exchange: "NSE",
    title: "Listing of Government Securities on capital market segment",
  },
  {
    date: "21 Jul 2025",
    exchange: "NSE",
    title: "Listing of privately placed securities on capital market segment",
  },
  {
    date: "21 Jul 2025",
    exchange: "NSE",
    title:
      "Listing of privately placed securities on the debt market segment of the Exchange",
  },
  {
    date: "21 Jul 2025",
    exchange: "NSE",
    title:
      "List of securities further admitted to dealings on Debt Segment issued by Adani Enterprises Limited",
  },
  {
    date: "18 Jul 2025",
    exchange: "NSE",
    title:
      "Listing of privately placed securities on the debt market segment of the Exchange",
  },
  {
    date: "17 Jul 2025",
    exchange: "NSE",
    title:
      "Listing of privately placed securities on the debt market segment of the Exchange",
  },
  {
    date: "17 Jul 2025",
    exchange: "NSE",
    title:
      "Listing of privately placed securities on the debt market segment of the Exchange on the debt market segment of the Exchange",
  },
  {
    date: "16 Jul 2025",
    exchange: "NSE",
    title:
      "Listing of privately placed securities on the debt market segment of the Exchange",
  },
  {
    date: "15 Jul 2025",
    exchange: "NSE",
    title:
      "Listing of privately placed securities on the debt market segment of the Exchange",
  },
];

const page = () => {
  return (
    <div className="h-[100vh]">
      <NavBar />
      <div className="max-w-[70%] mx-auto mt-[1rem] mb-[4rem] ">
        <div className="mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/regulatory-circulars">
                  Regulatory Circulars
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex flex-col items-center justify-center text-center gap-4"></div>
        <h3 className="text-3xl md:text-4xl font-medium text-gray-900">
          Regulatory{" "}
          <span className="text-[#F25C4C] font-semibold">Circulars</span>
        </h3>

        <p className="text-gray-600 text-[16px] md:text-[17px] leading-relaxed max-w-[700px]">
          Stay updated with the latest SEBI, NSE and BSE circulars impacting the
          bond and fixed income markets—all in one place.
        </p>
      </div>

      <ListFilter />

      <ListNseData nseData={nseData} />
      <NewsLetter />
      <Footer />
    </div>
  );
};

export default page;
