"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ViewPort from "@/global/components/wrapper/ViewPort";
 import { cn } from "@/lib/utils";
import ListFilter from "./_components/ListFilter";
import ListNseData from "./_components/ListNseData";

const nseData = [
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
    <ViewPort>
      <div className="container">
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

        <div className="py-16">
          <h1
            className={cn(
              "font-medium text-4xl text-center",
              "quicksand-medium"
            )}
          >
            Regulatory
            <span className="font-semibold text-secondary"> Circulars</span>
          </h1>
          <p className="mt-2 text-center">
            Stay updated with the latest SEBI, NSE and BSE circulars impacting
            the bond and fixed income markets—all in one place.
          </p>
        </div>

        <ListFilter />

        <ListNseData nseData={nseData} />
      </div>
    </ViewPort>
  );
};

export default page;
