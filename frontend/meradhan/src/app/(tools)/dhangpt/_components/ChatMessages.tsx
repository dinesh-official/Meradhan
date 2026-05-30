"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { sanitizeStrapiHTML } from "@/global/utils/html-sanitizer";
import type { ChatMessage } from "../_hook/useDhanGPT";

interface ChatMessagesProps {
  chat: ChatMessage[];
  loading?: boolean;
  bottomRef?: React.RefObject<HTMLDivElement>;
}

export default function ChatMessages({
  chat,
  loading = false,
}: ChatMessagesProps) {
  return (
    <div className="">
      {chat.map((message, idx) => (
        <div
          key={idx}
          className={`flex mb-3 ${
            message.person === "USER"
              ? "justify-end text-right"
              : "justify-start"
          }`}
        >
          <div className="">
            <p
              className={`mb-1 text-main font-medium ${
                message.person === "USER" ? "pr-0" : "pl-0"
              }`}
            >
              {message.person === "BOT" && (
                <Image
                  src="/static/dhangpt-border.svg"
                  alt="Chat Bot"
                  width={23}
                  height={23}
                  className="inline-block mr-1 align-middle"
                />
              )}
              {message.person === "USER" ? "You" : "MeraDhan-GPT"}
            </p>

            {message.response.trim().length !== 0 &&
              (message.person === "USER" ? (
                <div
                  className={cn(
                    "p-3 rounded-2xl bg-muted text-gray-800 text-sm ml-auto whitespace-pre-wrap break-words",
                  )}
                >
                  {message.response}
                </div>
              ) : (
                <div
                  className={cn(
                    "p-3 rounded-2xl bg-gray-100 text-gray-900 article",
                  )}
                  dangerouslySetInnerHTML={{
                    __html: sanitizeStrapiHTML(message.response),
                  }}
                />
              ))}
          </div>
        </div>
      ))}

      {loading && (
        <p className="mt-2">
          <Image
            src="/static/typing-texting.gif"
            width={50}
            height={50}
            alt="Typing..."
            className="inline-block"
          />
        </p>
      )}
    </div>
  );
}
