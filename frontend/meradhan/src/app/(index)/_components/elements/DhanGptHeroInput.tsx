"use client";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import React from "react";

function DhanGptHeroInput() {
  return (
    <div className="relative w-full">
      <Input
        className="w-full bg-white border-0 text-gray-900 py-6 px-6 pr-16 rounded-3xl text-base placeholder:text-gray-400 shadow-sm min-h-[56px]"
        placeholder="Ask MeraDhan-GPT"
        id="dhanGpt-hero-input"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const input = document.getElementById(
              "dhanGpt-hero-input"
            ) as HTMLInputElement;

            if (input && input.value.trim()) {
              const inputValue = input.value;
              input.value = "";
              document.getElementById("dhanGpt-popup-trigger")?.click();
              setTimeout(() => {
                const popupInput = document.getElementById(
                  "dhanGpt-message-input"
                ) as HTMLInputElement;
                if (popupInput) {
                  popupInput.value = inputValue;
                  popupInput.focus();
                  const sendButton = document.getElementById(
                    "dhanGpt-send-button"
                  );
                  sendButton?.click();
                }
              }, 100);
            }
          }
        }}
      />
      <span
        className="absolute inset-y-0 end-0 flex h-full w-16 items-center justify-center pointer-events-none rounded-e-3xl"
        aria-hidden
      >
        <Image
          src="/logo/dhangpt-border.svg"
          width={28}
          height={28}
          alt=""
          className="w-7 h-7"
        />
      </span>
    </div>
  );
}

export default DhanGptHeroInput;
