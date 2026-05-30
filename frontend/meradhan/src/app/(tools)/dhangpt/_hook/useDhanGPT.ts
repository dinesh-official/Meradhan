import { useEffect, useState } from "react";

export type ChatRole = "USER" | "BOT";

export interface ChatMessage {
  person: ChatRole;
  response: string;
  time: string;
  metadata?: Array<Record<string, unknown>>;
}

interface AskResponse {
  ai?: {
    response?: string;
    history?: string;
    input?: string;
  };
  response?: string;
  metadata?: Array<Record<string, unknown>>;
}

const SESSION_KEY = "GPT-Session-ID";
const CHAT_KEY = "dhanGPT";

const ensureSessionId = (): string => {
  if (typeof window === "undefined") return "Demo-Session";
  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const fresh =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `sess-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  localStorage.setItem(SESSION_KEY, fresh);
  return fresh;
};

export const useDhanGPT = () => {
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (chat.length) localStorage.setItem(CHAT_KEY, JSON.stringify(chat));
  }, [chat]);

  useEffect(() => {
    const stored = localStorage.getItem(CHAT_KEY);
    if (!stored) return;
    try {
      setChat(JSON.parse(stored));
    } catch {
      localStorage.removeItem(CHAT_KEY);
    }
  }, []);

  const clearChat = () => {
    setChat([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(CHAT_KEY);
      localStorage.removeItem(SESSION_KEY);
    }
  };

  const askBackend = async (
    text: string,
    sessionId: string,
    botIndex: number,
  ) => {
    setLoading(true);
    try {
      const sid = encodeURIComponent(sessionId || "Demo-Session");
      const res = await fetch(`/api/dhangpt/ask/${sid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      // dhanGpt returns 404 with a friendly payload when `text` is empty —
      // accept that body too, but bail on real failures.
      if (!res.ok && res.status !== 404) {
        throw new Error(`dhanGpt ${res.status}`);
      }

      const data = (await res.json().catch(() => ({}))) as AskResponse;

      const responseHtml =
        (typeof data?.ai?.response === "string" && data.ai.response) ||
        (typeof data?.response === "string" && data.response) ||
        "";
      const metadata = Array.isArray(data?.metadata) ? data.metadata : [];

      setChat((prev) => {
        const next = [...prev];
        const target = next[botIndex];
        if (target) {
          next[botIndex] = { ...target, response: responseHtml, metadata };
        }
        return next;
      });
    } catch (err) {
      console.error("dhanGpt ask failed:", err);
      setChat((prev) => {
        const next = [...prev];
        const target = next[botIndex];
        if (target) {
          next[botIndex] = {
            ...target,
            response:
              (target.response || "") +
              (target.response ? "\n" : "") +
              "Sorry, something went wrong.",
          };
        }
        return next;
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const sessionId = ensureSessionId();
    const now = new Date();
    const timeIst = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
    });

    setChat((prev) => {
      const next: ChatMessage[] = [
        ...prev,
        { person: "USER", response: trimmed, time: timeIst },
        { person: "BOT", response: "", time: timeIst },
      ];
      void askBackend(trimmed, sessionId, next.length - 1);
      return next;
    });
  };

  return { chat, loading, sendMessage, clearChat };
};

export default useDhanGPT;
