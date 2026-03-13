"use client";
import { Input } from "@/components/ui/input";
import { SendHorizonal, User } from "lucide-react";
import { marked } from "marked";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useDhanGPT } from "../_hook/useDhanGPT";
import { cn } from "@/lib/utils";
import { sanitizeStrapiHTML } from "@/global/utils/html-sanitizer";

function DhanGptPopup() {
  const [open, setOpen] = useState(false);
  const { chat, loading, sendMessage } = useDhanGPT();
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const renderUserView = (role: string, time: string) => {
    if (role == "BOT") {
      return (
        <div className="flex justify-start items-center gap-3">
          <Image
            src="/logo/dhangpt-border.svg"
            alt="MeraDhan-GPT Illustration"
            width={100}
            height={100}
            className="w-8"
          />
          <p className="text-primary font-semibold">MeraDhan-GPT</p>
          <p className="text-xs text-primary">{time}</p>
        </div>
      );
    }
    return (
      <div className="flex justify-end items-center gap-3">
        <div className="flex justify-start items-center gap-3">
          <User className="text-primary" />
          <p className="text-primary font-semibold">You</p>
          <p className="text-xs text-primary">{time}</p>
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        className={cn(
          "w-full h-screen bg-black/50 z-50 top-0 right-0 fixed flex justify-center items-center ",
          !open && "hidden"
        )}
      >
        <div className="bg-white md:w-[80%] w-full max-w-[1400px] md:h-[85%] h-screen md:rounded-lg overflow-hidden flex flex-col shadow-lg ">
          <div className="bg-primary p-3 text-white font-bold text-lg md:px-8 px-8 flex justify-between items-center ">
            <p>Chat with MeraDhan-GPT</p>
            <button
              className="text-2xl font-bold leading-none bg-red-500 w-9 h-9 rounded-full flex justify-center items-center cursor-pointer"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>

          {chat.length === 0 && (
            <div className="w-full h-full flex justify-center items-center flex-col gap-2">
              <Image
                src="/logo/dhangpt-border.svg"
                alt="MeraDhan-GPT Illustration"
                width={300}
                height={300}
                className="w-28"
              />
              <p className="quicksand-medium text-2xl text-center text-gray-800">
                Hi there! I’m DhanGPT, your bond investing assistant.
              </p>
            </div>
          )}
          {chat.length > 0 && (
            <div className="flex-1 overflow-y-auto px-4 h-full  overflow-auto ">
              {chat.map((message, index) => (
                <div
                  key={index}
                  className={`my-4 p-4 rounded-lg max-full flex flex-col gap-3 ${
                    message.person === "USER"
                      ? "  self-end  justify-end text-right"
                      : "  self-start"
                  }`}
                >
                  {renderUserView(message.person, message.time)}
                  {loading &&
                  0 === message.response.length &&
                  message.person === "BOT" ? (
                    <div className="animate-pulse text-lg ">Thinking...</div>
                  ) : null}
                  <div
                    className="article text-lg"
                    dangerouslySetInnerHTML={{
                      __html:
                        message.person === "BOT"
                          ? (() => {
                              const markdown = message.response || "";
                              const html = marked.parse(markdown);
                              // Ensure html is a string (not a Promise)
                              const htmlString =
                                typeof html === "string" ? html : "";
                              return sanitizeStrapiHTML(htmlString);
                            })()
                          : sanitizeStrapiHTML(message.response),
                    }}
                  />
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}

          <div className="p-4">
            <div className="flex rounded-md shadow-none">
              <Input
                className="-me-px flex-1 rounded-e-none shadow-none focus-visible:z-10 p-5 pl-4"
                placeholder="Write your message here..."
                aria-label="Write your message here"
                disabled={loading}
                autoFocus
                id="dhanGpt-message-input"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage(e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
              />
              <button
                className="inline-flex w-12 bg-primary items-center cursor-pointer justify-center rounded-e-md border border-input  text-sm text-muted-foreground/80 transition-[color,box-shadow] outline-none  focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Subscribe"
                disabled={loading}
                id="dhanGpt-send-button"
                onClick={() => {
                  const input = document.getElementById(
                    "dhanGpt-message-input"
                  ) as HTMLInputElement;
                  if (input && input.value.trim()) {
                    sendMessage(input.value);
                    input.value = "";
                  }
                }}
              >
                <SendHorizonal
                  size={16}
                  aria-hidden="true"
                  className="text-white"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <Image
        onClick={() => setOpen(true)}
        src="/logo/dhangpt-border.svg"
        alt="MeraDhan-GPT Illustration"
        width={100}
        height={100}
        id="dhanGpt-popup-trigger"
        className="w-20 fixed md:bottom-8 bottom-4 md:right-8 right-3 cursor-pointer z-40 "
      />
    </>
  );
}

export default DhanGptPopup;
