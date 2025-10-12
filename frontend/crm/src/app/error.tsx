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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 text-gray-700">
        {/* Error Image */}
        <Image
          src="/icons/warning.png" // replace with your image path
          alt="Error"
          className="w-24 h-24 mb-4"
        />

        {/* Title */}
        <h1 className="text-2xl font-semibold mb-2">
          Oops! Something went wrong.
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-6 text-center max-w-96">
          An unexpected error occurred. You can try again or go back home.
        </p>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => reset()}
            className="font-semibold px-4 py-2 cursor-pointer"
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 text-gray-700 px-4">
      <div className="text-center max-w-xl">
        {/* Error Title */}
        <div className="text-3xl font-semibold text-gray-800">
          Opp`s. {error.name}
        </div>

        {/* Description */}
        <div className="mt-3 text-base text-gray-600">
          We’re sorry, but an unexpected error has occurred. Please try again or
          return to the home page.
        </div>

        {/* Error Details */}
        <div className="mt-5 text-gray-800 text-xs text-left border border-gray-50 shadow-gray-800">
          {/* Error Message Card */}
          <div className="relative bg-white/70 p-2">
            <div className="font-semibold text-red-700 mb-2 text-sm">
              Error Message:
            </div>
            <div className="text-gray-700 text-xs">
              {error?.message || "Unknown error occurred."}
            </div>
            <button
              onClick={() =>
                copyText(
                  error?.message || "Unknown error occurred.",
                  setCopiedMessage
                )
              }
              className="absolute top-1 right-1 bg-gray-100 text-xs px-2 py-1 hover:bg-gray-800 transition"
            >
              {copiedMessage ? "Copied!" : "Copy"}
            </button>
          </div>

          {/* Stack Trace Card */}
          <div className="relative bg-gray-900 text-green-300 font-mono text-[11px] whitespace-pre-wrap overflow-auto max-h-72 p-2">
            {error.stack}
            <button
              onClick={() => copyText(error.stack || "", setCopiedStack)}
              className="absolute top-1 right-1 bg-gray-700 text-xs px-2 py-1 hover:bg-gray-800 transition"
            >
              {copiedStack ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex gap-2 justify-center">
          <button
            onClick={() => reset()}
            className="bg-gray-800 text-white px-5 py-2 cursor-pointer"
          >
            Try Again
          </button>
          <Link href="/" className="bg-gray-600 text-white px-5 py-2">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
