import sanitizeHtml from "sanitize-html";

/**
 * Sanitize user-authored issuer-description HTML before persisting.
 * Allowlist MUST match the public renderer (sanitizeStrapiHTML) so nothing
 * that is stored gets silently dropped on the website.
 */
export function sanitizeIssuerHtml(
  html: string | null | undefined,
): string | null {
  if (!html) return null;

  const clean = sanitizeHtml(html, {
    allowedTags: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "br",
      "strong", "b", "em", "i", "u", "s",
      "ul", "ol", "li",
      "a",
      // Tables (authored via the CRM rich-text editor)
      "table", "thead", "tbody", "tfoot", "tr", "th", "td",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a: (tagName, attribs) => {
        if (attribs.href && attribs.href.startsWith("http")) {
          attribs.target = "_blank";
          attribs.rel = "noopener noreferrer";
        }
        return { tagName, attribs };
      },
    },
  }).trim();

  // Treat content that is empty after stripping (e.g. "<p></p>") as null.
  const textOnly = clean.replace(/<[^>]*>/g, "").trim();
  return textOnly.length > 0 ? clean : null;
}
