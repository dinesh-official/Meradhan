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
import ReturnsCalculator from "./_components/ReturnCalculator";
import FdCalculatorDoc from "./_components/FdCalculatorDoc";

const page = () => {
  return (
    <>
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
        <div className="flex flex-col justify-center gap-4 p-4">
          <h3 className="text-3xl md:text-4xl font-medium text-gray-900 ">
            FD <span className="text-[#F25C4C] font-semibold">Calculator</span>
          </h3>
          <h5>Extended Internal Rate of Return Calculator</h5>
          <p className="text-gray-600 text-[16px] md:text-[17px] leading-relaxed max-w-[700px]">
            The XIRR Calculator helps you calculate the Extended Internal Rate
            of Return (XIRR) for your investments, especially when you make
            multiple investments at different intervals. It provides an accurate
            measure of your investment&apos;s performance over time.
          </p>
        </div>
      </div>
      <ReturnsCalculator />

     <FdCalculatorDoc/>
      <NewsLetter />
      <Footer />
    </>
  );
};

export default page;
