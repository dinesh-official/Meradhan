"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedStack, setCopiedStack] = useState(false);

  // Only render in development mode
  if (process.env.NODE_ENV != "development") {
    return (
      <div className="flex flex-col justify-center items-center gap-3 px-4 min-h-screen">
        {/* Error Image */}
        <Image
          width={100}
          height={100}
          src="/under-maintenance.svg" // replace with your image path
          alt="Error"
          className="mb-6 w-40 h-auto"
        />

        {/* Title */}
        <h1 className="mb-2 font-semibold text-2xl">
          Site is Under Maintenance
        </h1>
        {/* Description */}
        <p className="mb-6 max-w-96 text-gray-600 text-center">
          We&apos;ll be back soon!
        </p>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => reset()}
            className="px-4 py-2 font-semibold cursor-pointer"
          >
            Retry
          </button>
          <Link href="/" className="px-4 py-2">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const copyText = (text: string, setCopied: (val: boolean) => void) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // reset after 2s
    });
  };

  return (
    <div className="flex flex-col justify-center items-center bg-gray-100 px-4 min-h-screen">
      <div className="max-w-xl text-center">
        {/* Error Title */}
        <div className="font-semibold text-gray-800 text-3xl">
          Opp`s. {error.name}
        </div>

        {/* Description */}
        <div className="mt-3 text-gray-600 text-base">
          We’re sorry, but an unexpected error has occurred. Please try again or
          return to the home page.
        </div>

        {/* Error Details */}
        <div className="shadow-gray-800 mt-5 border border-gray-50 text-gray-800 text-xs text-left">
          {/* Error Message Card */}
          <div className="relative bg-white/70 p-2">
            <div className="mb-2 font-semibold text-red-700 text-sm">
              Error Message:
            </div>
            <div className="text-xs">
              {error?.message || "Unknown error occurred."}
            </div>
            <button
              onClick={() =>
                copyText(
                  error?.message || "Unknown error occurred.",
                  setCopiedMessage,
                )
              }
              className="top-1 right-1 absolute bg-gray-100 hover:bg-gray-800 px-2 py-1 text-xs transition"
            >
              {copiedMessage ? "Copied!" : "Copy"}
            </button>
          </div>

          {/* Stack Trace Card */}
          <div className="relative bg-gray-900 p-2 max-h-72 overflow-auto font-mono text-[11px] text-green-300 whitespace-pre-wrap">
            {error.stack}
            <button
              onClick={() => copyText(error.stack || "", setCopiedStack)}
              className="top-1 right-1 absolute bg-gray-700 hover:bg-gray-800 px-2 py-1 text-xs transition"
            >
              {copiedStack ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => reset()}
            className="bg-gray-800 px-5 py-2 text-white cursor-pointer"
          >
            Try Again
          </button>
          <Link href="/" className="bg-gray-600 px-5 py-2 text-white">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
