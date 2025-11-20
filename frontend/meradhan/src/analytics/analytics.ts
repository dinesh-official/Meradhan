import { ActivityDetails, ActivityType } from "./types";
export const ActivityTypes = [
  "login",
  "logout",
  "page_view",
  "auto_logout",
  "click",
  "scroll_depth",
  "otp_request",
  "page_duration",
  "create_entry",
  "delete_entry",
  "update_entry",
  "refresh",
  "activity",
  "otp_verify",
  "session",
] as const;

export interface AnalyticsEvent {
  id: string;
  sessionId: string;
  type: ActivityType;
  props?: ActivityDetails;
  trackId: string;
  ts: string;
  ua: string;
}

// -------------------- Configuration --------------------
const ENDPOINT = "/api/server/web/tracking";

// -------------------- Utility Functions --------------------
function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getSessionId(): string {
  try {
    let id = localStorage.getItem("analytics_session");
    if (!id) {
      id = generateId();
      localStorage.setItem("analytics_session", id);
    }
    return id;
  } catch {
    // Fallback if localStorage is unavailable
    return generateId();
  }
}

// -------------------- Analytics Queue --------------------
const sessionId = getSessionId();
let queue: AnalyticsEvent[] = [];
let isSending = false;

// -------------------- Event Tracking --------------------
/**
 * Track a user event
 * @param type ActivityType
 * @param props ActivityDetails
 */
export function track(type: ActivityType, props: ActivityDetails = {}): void {
  const event: AnalyticsEvent = {
    id: generateId(),
    sessionId,
    type,
    props,
    ts: new Date().toISOString(),
    ua: navigator.userAgent ?? "unknown",
    trackId: localStorage.getItem("analytics_session") || "",
  };

  queue.push(event);
  flush();
}

// -------------------- Event Flushing --------------------
/**
 * Send queued events to server
 */
export async function flush(): Promise<void> {
  console.log("send1");

  if (isSending || queue.length === 0) return;
  console.log("send2");

  isSending = true;
  const payload = [...queue];
  queue = [];

  try {
    console.log(payload);
    console.log("send3");

    await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    })
      .then(() => {
        const isNeedAutoLogout = payload.find(
          (data) => data.type == "auto_logout"
        );
        if (isNeedAutoLogout) {
          localStorage.clear();
          window.location.replace("/logout");
        }
      })
      .catch((error) => {
        console.error("Analytics send error:", error);
      });
    console.log("Analytics events sent:", payload.length);
  } catch (error) {
    console.error("Analytics flush failed:", error);
    // Retry next time by putting events back in queue
    queue.unshift(...payload);
  } finally {
    isSending = false;
  }
}
