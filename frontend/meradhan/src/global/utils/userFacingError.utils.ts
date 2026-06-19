import { ApiError } from "@root/apiGateway";

function isUserUnderstandableMessage(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed || trimmed.length > 500) return false;
  if (/^request failed with status code \d+$/i.test(trimmed)) return false;
  if (/^Calc service failed/i.test(trimmed)) return false;
  if (/^\{[\s\S]*\}$/.test(trimmed)) return false;
  if (/\b\d{3}\s+(bad request|unauthorized|forbidden|not found|internal server error)\b/i.test(trimmed)) {
    return false;
  }
  return true;
}

function extractFromJsonPayload(text: string): string | undefined {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return undefined;

  try {
    const parsed = JSON.parse(jsonMatch[0]) as {
      error?: string;
      message?: string;
      detail?: string;
    };
    const nested =
      (typeof parsed.error === "string" && parsed.error.trim()) ||
      (typeof parsed.message === "string" && parsed.message.trim()) ||
      (typeof parsed.detail === "string" && parsed.detail.trim());
    if (nested && isUserUnderstandableMessage(nested)) return nested;
  } catch {
    // ignore invalid JSON
  }

  return undefined;
}

function sanitizeRawErrorMessage(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  const fromJson = extractFromJsonPayload(trimmed);
  if (fromJson) return fromJson;

  const withoutCalcPrefix = trimmed
    .replace(/^Calc service failed\s*\([^)]*\)\s*:?\s*/i, "")
    .trim();
  if (withoutCalcPrefix !== trimmed) {
    const nested = sanitizeRawErrorMessage(withoutCalcPrefix);
    if (nested) return nested;
  }

  if (isUserUnderstandableMessage(trimmed)) return trimmed;
  return undefined;
}

export function toUserFacingErrorMessage(error: unknown): string | undefined {
  if (error instanceof ApiError) {
    if (error.code === "ERR_NETWORK") {
      return "We couldn't reach the server. Check your internet connection.";
    }

    const apiMessage =
      typeof error.response?.data?.message === "string"
        ? error.response.data.message
        : undefined;
    const sanitized = sanitizeRawErrorMessage(apiMessage ?? error.message ?? "");
    if (sanitized) return sanitized;
    return undefined;
  }

  if (error instanceof Error) {
    return sanitizeRawErrorMessage(error.message);
  }

  if (typeof error === "string") {
    return sanitizeRawErrorMessage(error);
  }

  return undefined;
}
