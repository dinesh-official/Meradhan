import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send } from "lucide-react";
import Image from "next/image";
import React from "react";

const DhanGpt = () => {
  return (
    <>
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-[900px] mx-auto px-4 mb-[16rem]">
          <div className="flex flex-col items-center text-center gap-2">
            <h1 className="text-3xl md:text-3xl text-gray-900 tracking-tight">
              Talk to{" "}
              <span className="inline-flex items-center gap-2">
                <span className="text-[#F25C4C]">DhanGPT</span>
                <Image
                  src="/assets/dhangpt-border.svg"
                  alt="DhanGPT"
                  width={28}
                  height={28}
                  className="hidden md:inline-block"
                />
              </span>
            </h1>
            <p className="text-[12px] md:text-base text-gray-600">
              Bonds sound confusing? DhanGPT’s got your back!
            </p>
          </div>

          <div className="mt-8 md:mt-10">
            <div className="relative">
              <Textarea
                placeholder="Ask DhanGPT..."
                className="w-full min-h-40 resize-y rounded-xl border border-gray-200 bg-white shadow-sm pr-12 focus-visible:ring-2 focus-visible:ring-[#02264A]/30"
              />
              <Button
                type="button"
                size="icon"
                className="absolute bottom-2 right-2 rounded-full h-9 w-9 md:h-10 md:w-10 bg-[#02264A] hover:bg-[#02264A]/90"
              >
                <Send className="h-4 w-4 md:h-5 md:w-5" />
                <span className="sr-only">Send</span>
              </Button>
            </div>

            <div className="mt-2 flex items-center justify-between text-[10px] md:text-xs text-gray-500">
              <p>
                This is AI, not a financial advisor. Validate key information
                before making decisions.
              </p>
              <p>Powered by: DhanGPT v1.2</p>
            </div>
          </div>
        </div>

        <button
          aria-label="Open chat"
          className="fixed left-5 bottom-5 rounded-full h-12 w-12 md:h-14 md:w-14 bg-[#08325F] text-white shadow-lg flex items-center justify-center"
        >
          <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
        </button>
      </div>
    </>
  );
};

export default DhanGpt;
