"use client";
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
import { Loader, Search } from "lucide-react";
import { useGlossaryHook } from "./_gql/useGlossaryGQLHook";
import GlossaryPost from "./_components/glossaryPost";
import Image from "next/image";

const GlossaryView = () => {
  const {
    alphabets,
    selectedAlphabet,
    onAlphabetClick,
    search,
    onSearchChange,
    items,
    loading,
    error,
  } = useGlossaryHook();

  console.log(items, loading, error);
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
                value={search}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                }}
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
                  onClick={() => onAlphabetClick(letter)}
                >
                  <h3>{letter.toUpperCase()}</h3>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            {loading && (
              <div className="flex items-center justify-center m-[3rem]">
                <Loader />
              </div>
            )}
            {!loading && !error && items.length === 0 && (
              <div className=" m-auto p-[2rem] flex flex-col justify-center items-center gap-4">
                <Image
                  src={"/assets/sad-emoji.svg"}
                  alt="sad emoji"
                  height={72}
                  width={72}
                />
                <p> No Glossary Found</p>
              </div>
            )}
            {items.map((items) => (
              <div key={items.documentId}>
                <GlossaryPost
                  heading={items.Title}
                  description={items.Explanation}
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
