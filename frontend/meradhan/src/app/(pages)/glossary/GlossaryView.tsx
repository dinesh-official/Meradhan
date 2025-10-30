"use client"
import React from "react";
import ViewPort from "@/global/components/wrapper/ViewPort";

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
import GlossaryPost from "./_components/glossaryPost";
import { useGlossaryHook } from "./_components/useGlossaryHook";
import { GLOSSARY_DATA } from "./_components/constant";
const GlossaryView = () => {
    const {alphabets,filteredGlossary, onAlphabetClick} = useGlossaryHook(GLOSSARY_DATA)
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
                  onClick={()=>{
                    console.log(letter)
                    onAlphabetClick(letter)
                  }}
                >
                  <h3>{letter.toUpperCase()}</h3>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            {filteredGlossary.map((items) => (
              <div key={items.title}>
                <GlossaryPost
                  heading={items.title}
                  description={items.description}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </ViewPort>
  );
};

export default GlossaryView;
