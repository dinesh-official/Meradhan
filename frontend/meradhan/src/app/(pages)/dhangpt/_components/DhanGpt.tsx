import { ArrowRight } from "lucide-react";
import React from "react";

const DhanGpt = () => {
  return (
    <>
      <main className="flex-1 w-full">
        <section className="w-full py-12 md:py-20">
          <div className="mx-auto max-w-[1200px] px-4">
            <div className="flex flex-col items-center justify-center text-center mt-10 md:mt-20">
              <h1 className="text-3xl md:text-5xl font-semibold text-[#02264A]">
                Talk to Dhan<span className="text-[#F25C4C]">GPT</span>
                <span className="inline-block align-middle ml-2 text-3xl">
                  🤖
                </span>
              </h1>

              <p className="mt-4 text-sm md:text-base text-slate-600 max-w-2xl">
                Bonds sound confusing? DhanGPT’s got your back!
              </p>
            </div>

            <div className="mt-10 md:mt-14 flex justify-center">
              <div className="w-full max-w-5xl">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ask DhanGPT..."
                    className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-5 pr-16 text-[15px] md:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-[#02264A]/20"
                  />
                  <button
                    aria-label="Send"
                    className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-10 w-10 rounded-full bg-[#02264A] hover:opacity-90 active:scale-95 transition"
                  >
                    <ArrowRight className="h-5 w-5 text-white" />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between text-[12px] md:text-[13px] text-slate-500 px-1">
                  <p>
                    This is AI, not a financial advisor. Validate key
                    information before making decisions.
                  </p>
                  <p className="whitespace-nowrap">Powered by: DhanGPT v1.2</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <button
        aria-label="Help"
        className="fixed bottom-5 left-5 h-12 w-12 rounded-full bg-[#0A3A68] shadow-lg grid place-items-center text-white"
        title="Chat support"
      >
        ?
      </button>
    </>
  );
};

export default DhanGpt;
