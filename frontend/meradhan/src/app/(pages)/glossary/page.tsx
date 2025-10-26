import ViewPort from "@/global/components/wrapper/ViewPort";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import { quicksand } from "@/global/font/font";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
const alphabets = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(97 + i)
);

function page() {
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
              <BreadcrumbPage>Issuer Notes</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="py-14">
          <div className="flex flex-col gap-5">
            <h1
              className={cn(
                "text-4xl text-center font-medium",
                quicksand.className
              )}
            >
              Fixed Income
              <span className="font-semibold text-secondary"> Glossary</span>
            </h1>
            <p className="text-center">
              Simple explanations of bond and fixed-income terms
            </p>

            <div className="relative w-full">
              <Input
                className="peer pe-14 border border-gray-200 w-full py-5.5 px-5 placeholder:text-gray-500 "
                placeholder="Search..."
                type="text"
              />
              <div
                className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-4 text-xs text-muted-foreground tabular-nums peer-disabled:opacity-50"
                aria-live="polite"
                role="status"
              >
                <Search className="text-secondary" />
              </div>
            </div>

            <div className="flex justify-between items-center mt-1 overflow-x-auto lg:gap-1 gap-3 ">
              {alphabets.map((letter) => (
                <div
                  key={letter}
                  className="bg-muted min-w-10 min-h-10 flex justify-center items-center rounded-md select-none cursor-pointer"
                >
                  <h3>{letter.toUpperCase()}</h3>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6" >
            {alphabets.map((letter) => (
              <div
                key={letter}
                className="flex flex-col gap-2 py-5 border-b border-gray-200"
              >
                <h4 className="text-2xl">Accretion of Bonds</h4>
                <p>
                  Accretion of bonds means the increase in the value of a bond
                  over time. This happens when a bond is bought at a lower price
                  than its full value (face value). As time passes, the bond’s
                  value slowly rises until it reaches its full value. This is
                  common in zero-coupon bonds, which do not pay interest
                  regularly but grow in value over time.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ViewPort>
  );
}

export default page;
