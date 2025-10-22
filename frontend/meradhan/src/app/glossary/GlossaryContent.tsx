"use client";

import React from "react";
import Breadcrumbs from "@/global/elements/Breadcrumb";
import BannerSubscribe from "@/global/elements/MarketUpdateBanner";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Search as SearchIcon } from "lucide-react";
import { GLOSSARY } from "./_components/constant";
import { useGlossaryHook } from "./_components/useGlossaryHook";

// build alphabet array
const ALPHABETS = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i)
);

export default function GlossaryContent() {
  const{query,activeLetter,setActiveLetter,filtered,setQuery} = useGlossaryHook(GLOSSARY,"A")

  return (
    <>
      {/* BreadCrumbs */}
      <div className="flex flex-col justify-center w-[70%] mx-auto mt-5">
        <div className="flex justify-start items-center p-3">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Glossary", href: "/glossary" },
            ]}
          />
        </div>
      </div>
        <div className="w-full h-px bg-gray-300 my-4" />

      {/* Header + Search + Alphabet */}
      <section className="mx-auto max-w-[70%] mt-8">
        <header className="text-center mb-6">
          <h1 className="text-3xl md:text-5xl">
            Fixed Income{" "}
            <span className="text-[#ef4822] font-semibold">Glossary</span>
          </h1>
          <p className="mt-3 text-sm md:text-base text-muted-foreground">
            Simple explanations of bond and fixed-income terms
          </p>
        </header>

        {/* Search */}
        <div className="relative mb-5">
          <Input
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 pr-12 ring-1 ring-[#ef4822] focus-visible:ring-[#ef4822] focus-visible:ring-2"
          />
          <SearchIcon
            className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#ef4822]"
            aria-hidden="true"
          />
        </div>

        {/* Alphabet filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {ALPHABETS.map((ch) => {
            const active = activeLetter === ch;
            return (
              <button
                key={ch}
                onClick={() => setActiveLetter(ch)}
                className={[
                  "h-8 w-8 rounded-md border text-sm font-medium transition",
                  active
                    ? "bg-[#0a3150] text-white border-[#0a3150] shadow"
                    : "bg-blue-50 text-slate-700 border-blue-100 hover:bg-blue-100",
                ].join(" ")}
                aria-pressed={active}
              >
                {ch}
              </button>
            );
          })}
        </div>

        {/* Results */}
        <div className="space-y-8">
          {filtered.length === 0 ? (
            <p className="text-muted-foreground">
              No terms found. Try a different letter or search query.
            </p>
          ) : (
            filtered.map((item, idx) => (
              <div key={item.term}>
                <h3 className="text-2xl font-semibold">{item.term}</h3>
                <p className="mt-2 text-muted-foreground leading-7">
                  {item.definition}
                </p>
                {/* divider (avoid on last) */}
                {idx !== filtered.length - 1 && (
                  <Separator className="mt-6" />
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Newsletter banner (as in your layout) */}
      <div className="mt-14">
        <BannerSubscribe
          title="Stay up-to-date with market updates!"
          subtitle="Subscribe to our newsletter!"
        />
      </div>
    </>
  );
}
