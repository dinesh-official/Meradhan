"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageTitleDesc from "@/global/components/basic/page/PageTitleDesc";
import { cn } from "@/lib/utils";
import { Loader2, Search, X } from "lucide-react";
import Image from "next/image";
import GlossaryPost from "./_components/glossaryPost";
import { useGlossaryHook } from "./_gql/useGlossaryGQLHook";
import { DynamicPageData } from "@/graphql/getDynamicPageDataGql";

const GlossaryView = ({ pageData }: { pageData: DynamicPageData }) => {
  const {
    alphabets,
    onAlphabetClick,
    search,
    onSearchChange,
    items,
    loading,
    error,
    selectedAlphabet,
    resetSearch, // Make sure your hook exports this or we handle it inline
  } = useGlossaryHook();

  const handleReset = () => {
    resetSearch();
  };

  return (
    <div className="container">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Glossary</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Glossary Section */}
      <div className="py-14">
        <div className="flex flex-col gap-3">
          <PageTitleDesc
            title={pageData?.Title || "Glossary"}
            description={pageData?.Content.Introduction || ""}
          />

          {/* Search Input */}
          <div className="relative mt-5 w-full">
            <Input
              className="peer px-5 py-4.5 border border-gray-200 w-full placeholder:text-gray-500 e-14"
              placeholder="Search..."
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {search ? (
              <button
                type="button"
                onClick={handleReset}
                className="absolute cursor-pointer inset-y-0 flex justify-center items-center pe-4 text-muted-foreground text-xs end-0"
                aria-label="Clear search"
              >
                <X className="text-secondary" size={20} />
              </button>
            ) : (
              <div
                className="absolute inset-y-0 flex justify-center items-center pe-4 text-muted-foreground text-xs pointer-events-none end-0"
                aria-live="polite"
                role="status"
              >
                <Search className="text-secondary" size={20} />
              </div>
            )}
          </div>

          {/* Alphabet Filter */}
          <div className="flex justify-between items-center gap-3 lg:gap-1 mt-1 overflow-x-auto">
            {alphabets.map((letter) => (
              <div
                key={letter}
                className={cn(
                  "flex justify-center items-center bg-muted rounded min-w-9 min-h-9 font-medium text-sm transition-colors cursor-pointer select-none",
                  letter.toLowerCase() === selectedAlphabet.toLowerCase()
                    ? "bg-primary text-white"
                    : "hover:bg-primary/10"
                )}
                onClick={() => onAlphabetClick(letter)}
              >
                <p>{letter.toUpperCase()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Glossary Results */}
        <div className="mt-6 min-h-96">
          {loading && (
            <div className="flex justify-center items-center w-full h-96 text-muted-foreground text-sm">
              <Loader2 className="animate-spin" size={30} />
            </div>
          )}

          {!loading && error && (
            <div className="flex justify-center items-center w-full h-96 text-red-500 text-sm">
              <p>Error loading glossary. Please try again later.</p>
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <GlossaryViewNotFound onReset={handleReset} />
          )}

          {!loading &&
            !error &&
            items.length > 0 &&
            items.map((item) => (
              <GlossaryPost
                heading={item.Title}
                description={item.Explanation}
                key={item.documentId}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default GlossaryView;

function GlossaryViewNotFound({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col justify-center items-center gap-5 min-h-96 text-center">
      <Image
        src="/static/sad-emoji.svg"
        alt="No Data"
        width={100}
        height={100}
        className="w-18 h-18"
      />
      <p className="font-medium">No Glossary Found</p>
      <Button variant="outline" onClick={onReset}>
        Reset Search
      </Button>
    </div>
  );
}
