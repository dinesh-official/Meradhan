import type { Request } from "express";

// Helper function to get real client IP address
export function getClientIP(req: Request): string {
  return (
    req.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    req.get("X-Real-IP") ||
    req.get("CF-Connecting-IP") ||
    req.ip ||
    req.connection.remoteAddress ||
    "unknown"
  );
}

// Browser detection utility
export function parseBrowserInfo(userAgent: string) {
  let browserName = "Unknown";
  let deviceType = "desktop";
  let operatingSystem = "Unknown";

  // Detect browser
  if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
    browserName = "Chrome";
  } else if (userAgent.includes("Firefox")) {
    browserName = "Firefox";
  } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    browserName = "Safari";
  } else if (userAgent.includes("Edg")) {
    browserName = "Edge";
  } else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
    browserName = "Opera";
  }

  // Detect device type
  if (
    /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
    )
  ) {
    if (/iPad|Tablet/i.test(userAgent)) {
      deviceType = "tablet";
    } else {
      deviceType = "mobile";
    }
  }

  // Detect operating system
  if (userAgent.includes("Windows")) {
    operatingSystem = "Windows";
  } else if (userAgent.includes("Mac")) {
    operatingSystem = "macOS";
  } else if (userAgent.includes("Linux")) {
    operatingSystem = "Linux";
  } else if (userAgent.includes("Android")) {
    operatingSystem = "Android";
  } else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
    operatingSystem = "iOS";
  }

  return { browserName, deviceType, operatingSystem };
}
