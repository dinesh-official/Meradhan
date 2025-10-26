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
    <div className="h-[100vh]">
      <NavBar />
      <div className="mx-auto mt-[1rem] mb-[4rem] max-w-[70%]">
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
        <div className="flex flex-col justify-center items-center gap-4 text-center"></div>
        <h3 className="font-medium text-gray-900 text-3xl md:text-4xl">
          Regulatory{" "}
          <span className="font-semibold text-[#F25C4C]">Circulars</span>
        </h3>

        <p className="max-w-[700px] text-[16px] text-gray-600 md:text-[17px] leading-relaxed">
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
