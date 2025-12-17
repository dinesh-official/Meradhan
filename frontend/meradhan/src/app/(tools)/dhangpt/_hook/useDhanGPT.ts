/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { BASES_URLS } from "@/core/config/base.urls";

export const useDhanGPT = () => {
  const [chat, setChat] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Save chat to localStorage
  useEffect(() => {
    if (chat.length) localStorage.setItem("dhanGPT", JSON.stringify(chat));
  }, [chat]);

  // Load chat from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("dhanGPT");
    if (stored) setChat(JSON.parse(stored));
  }, []);

  // Clear chat
  const clearChat = () => {
    setChat([]);
    localStorage.removeItem("dhanGPT");
  };

  // --- FIXED STREAM HANDLER ---
  const loadChatLLM = async (
    message: string,
    sessionId?: string,
    botIndex?: number
  ) => {
    setLoading(true);
    try {
      const dhangptUrl = BASES_URLS.DHANGPT || "https://dhangpt.meradhan.co";
      const res = await fetch(`${dhangptUrl}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: message, sessionId }),
      });

      if (!res.body) throw new Error("No response body.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = ""; // ← buffer handles partial UTF-8 characters
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        if (value) {
          // Decode current chunk safely
          buffer += decoder.decode(value, { stream: true });

          // Update chat progressively
          setChat((prev) => {
            const updated = [...prev];
            if (botIndex !== undefined && updated[botIndex]) {
              updated[botIndex].response = buffer;
            }
            return updated;
          });
        }
      }

      // Flush any remaining text after streaming finishes
      buffer += decoder.decode();
      setChat((prev) => {
        const updated = [...prev];
        if (botIndex !== undefined && updated[botIndex]) {
          updated[botIndex].response = buffer;
        }
        return updated;
      });
    } catch {
      setChat((prev) => {
        const updated = [...prev];
        if (botIndex !== undefined && updated[botIndex]) {
          updated[botIndex].response += "\nSorry, something went wrong.";
        }
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  // Send a message
  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    setChat((prev) => {
      const newChat = [
        ...prev,
        {
          person: "USER",
          response: text,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Kolkata",
          }),
        },
      ];

      const botMessage = {
        person: "BOT",
        response: "",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      const updatedChat = [...newChat, botMessage];

      // Start streaming
      const sessionId =
        localStorage.getItem("GPT-Session-ID") || "Demo-Session";
      loadChatLLM(text, sessionId, updatedChat.length - 1);

      return updatedChat;
    });
  };

  return { chat, loading, sendMessage, clearChat };
};
