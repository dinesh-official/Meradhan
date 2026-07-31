const MAX_PLAIN_ERROR_LEN = 280;

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractBetweenTags(
  html: string,
  openTag: string,
  closeTag: string,
): string | null {
  const start = html.indexOf(openTag);
  if (start < 0) return null;
  const from = start + openTag.length;
  const end = html.indexOf(closeTag, from);
  if (end < 0) return null;
  const raw = html.slice(from, end).replace(/<[^>]+>/g, " ");
  const cleaned = decodeHtmlEntities(raw);
  return cleaned || null;
}

/** Pull Exception Type / Value from Django DEBUG HTML pages. */
function parseDjangoDebugHtml(html: string): string | null {
  const typeCell = extractBetweenTags(html, "<th>Exception Type:</th>", "</tr>");
  const valueCell = extractBetweenTags(
    html,
    "<th>Exception Value:</th>",
    "</tr>",
  );

  const type =
    typeCell
      ?.replace(/^Exception Type:\s*/i, "")
      .replace(/^[\s:]+/, "")
      .trim() || null;
  const value =
    valueCell
      ?.replace(/^Exception Value:\s*/i, "")
      .replace(/^[\s:]+/, "")
      .trim() || null;

  // Common Django title: "OSError at /api/..."
  const titleMatch = html.match(/<title>\s*([^<]+?)\s*<\/title>/i);
  const title = titleMatch?.[1] ? decodeHtmlEntities(titleMatch[1]) : null;

  if (type && value) return `${type}: ${value}`;
  if (title && /at\s+\//.test(title)) return title;
  if (type) return type;
  if (value) return value;
  return null;
}

function looksLikeHtml(text: string): boolean {
  const sample = text.slice(0, 500).toLowerCase();
  return (
    sample.includes("<!doctype html") ||
    sample.includes("<html") ||
    sample.includes("<title>") ||
    sample.includes("exception type:") ||
    sample.includes("traceback (most recent call last)")
  );
}

/**
 * Turns DeriData error bodies (JSON or Django DEBUG HTML) into a short message
 * safe to return to CRM / API clients.
 */
export function parseDeriDataErrorBody(
  text: string,
  fallback = "DeriData request failed",
): string {
  const trimmed = text.trim();
  if (!trimmed) return fallback;

  try {
    const parsed = JSON.parse(trimmed) as {
      error?: string;
      message?: string;
      detail?: string;
    };
    const fromJson =
      (typeof parsed.message === "string" && parsed.message.trim()) ||
      (typeof parsed.error === "string" && parsed.error.trim()) ||
      (typeof parsed.detail === "string" && parsed.detail.trim()) ||
      "";
    if (fromJson) {
      return fromJson.length > MAX_PLAIN_ERROR_LEN
        ? `${fromJson.slice(0, MAX_PLAIN_ERROR_LEN)}…`
        : fromJson;
    }
  } catch {
    // not JSON — continue
  }

  if (looksLikeHtml(trimmed)) {
    const django = parseDjangoDebugHtml(trimmed);
    if (django) return django;
    return "DeriData returned an internal server error page";
  }

  if (trimmed.length > MAX_PLAIN_ERROR_LEN) {
    return `${trimmed.slice(0, MAX_PLAIN_ERROR_LEN)}…`;
  }
  return trimmed;
}
