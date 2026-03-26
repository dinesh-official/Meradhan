"use client";

import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useDhanGPT } from "../_hook/useDhanGPT";
import ChatInput from "./chatInput";
import ChatMessages from "./ChatMessages";
import TitleSection from "./TitleSection";

function DhanGpt() {
  const { chat, sendMessage, loading } = useDhanGPT(); // streaming version
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("GPT-Session-ID", uuidv4());
    localStorage.removeItem("dhanGPT");
  }, []);

  // Scroll to bottom whenever chat updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(text); // call streaming API
    setText("");
  };

  return (
    <div className="container">
      <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)] lg:h-[calc(100vh-72px)]">
        <div className="w-full min-h-[calc(100vh-320px)] overflow-auto scrollbar-hide">
          <div className="mt-[8%]" />
          <div
            className={
              chat.length === 0 ? "flex justify-center items-center" : ""
            }
          >
            <TitleSection />
          </div>
          <ChatMessages chat={chat} loading={loading} />
          <div ref={bottomRef} />
        </div>
        <ChatInput
          loading={loading}
          onChange={(e) => setText(e)}
          value={text}
          onSend={() => {
            handleSend();
          }}
        />
      </div>
    </div>
  );
}

export default DhanGpt;
