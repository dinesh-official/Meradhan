"use client";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import React from "react";

function DhanGptHeroInput() {
  return (
    <div className="relative ">
      <Input
        className=" bg-white border-0 text-gray-950 py-5.5 px-5"
        placeholder="Ask DhanGPT"
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
      <button
        className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 transition-[color,box-shadow] outline-none hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Subscribe"
      >
        <Image
          src={`/logo/dhangpt-border.svg`}
          width={300}
          height={300}
          alt="dhangpt"
          className="w-6 h-6 mr-2"
        />
      </button>
    </div>
  );
}

export default DhanGptHeroInput;
