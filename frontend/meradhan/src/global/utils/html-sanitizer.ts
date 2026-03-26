import sanitizeHtml from "sanitize-html";

/**
 * Sanitize HTML content from Strapi CMS to prevent XSS attacks
 * Allows safe HTML tags and attributes commonly used in content management
 */
export function sanitizeStrapiHTML(html: string | null | undefined): string {
  if (!html) {
    return "";
  }

  return sanitizeHtml(html, {
    allowedTags: [
      // Text formatting
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "strike",
      "sub",
      "sup",
      // Headings
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      // Lists
      "ul",
      "ol",
      "li",
      "dl",
      "dt",
      "dd",
      // Links
      "a",
      // Images
      "img",
      // Block elements
      "div",
      "span",
      "blockquote",
      "pre",
      "code",
      // Tables
      "table",
      "thead",
      "tbody",
      "tfoot",
      "tr",
      "th",
      "td",
      // Semantic HTML
      "section",
      "article",
      "header",
      "footer",
      "aside",
      "nav",
      "main",
    ],
    allowedAttributes: {
      // Links
      a: ["href", "title", "target", "rel"],
      // Images
      img: ["src", "alt", "title", "width", "height", "class"],
      // Generic attributes (style removed from "*" to reduce attack surface)
      // Style should only be allowed on specific tags that need it
      "*": ["class", "id"],
      // Table attributes
      table: ["class", "style"],
      th: ["class", "style", "colspan", "rowspan"],
      td: ["class", "style", "colspan", "rowspan"],
    },
    allowedStyles: {
      "*": {
        // Allow common safe CSS properties
        color: [/^#[0-9a-fA-F]{3,6}$/, /^rgb/, /^rgba/],
        "text-align": [/^left$/, /^right$/, /^center$/, /^justify$/],
        "font-size": [/^[0-9]+(px|em|rem|%)$/],
        "font-weight": [/^[0-9]+$/, /^normal$/, /^bold$/],
        "background-color": [/^#[0-9a-fA-F]{3,6}$/, /^rgb/, /^rgba/],
        margin: [/^[0-9]+(px|em|rem|%)$/],
        padding: [/^[0-9]+(px|em|rem|%)$/],
        border: [/^[0-9]+px/],
        "border-radius": [/^[0-9]+(px|em|rem|%)$/],
      },
    },
    // Allow data attributes for specific use cases (can be restricted further if needed)
    allowedSchemes: ["http", "https", "mailto", "tel"],
    // Ensure links open safely
    allowedSchemesByTag: {
      a: ["http", "https", "mailto", "tel"],
      // SECURITY: Restrict img src to http/https only, or validate data: URLs in transformTags
      // data: scheme removed to prevent abuse - if needed, validate in transformTags
      img: ["http", "https"],
    },
    // Add rel="noopener noreferrer" to external links
    // SECURITY: Validate and sanitize image sources
    transformTags: {
      a: function (tagName: string, attribs: sanitizeHtml.Attributes) {
        if (attribs.href && attribs.href.startsWith("http")) {
          attribs.target = attribs.target || "_blank";
          attribs.rel = "noopener noreferrer";
        }
        return {
          tagName: tagName,
          attribs: attribs,
        };
      },
      img: function (tagName: string, attribs: sanitizeHtml.Attributes) {
        // SECURITY: If data: URLs are needed, only allow safe image MIME types
        // For now, we only allow http/https (data: removed from allowedSchemesByTag)
        // If you need data: URLs, uncomment and use this validation:
        /*
        if (attribs.src && attribs.src.startsWith("data:")) {
          // Only allow data:image/ with safe MIME types
          const dataUrlPattern = /^data:image\/(png|jpeg|jpg|gif|webp|svg\+xml);base64,/i;
          if (!dataUrlPattern.test(attribs.src)) {
            // Remove invalid data: URL
            delete attribs.src;
          }
        }
        */
        return {
          tagName: tagName,
          attribs: attribs,
        };
      },
    },
    // Remove empty tags
    exclusiveFilter: function (frame: sanitizeHtml.IFrame) {
      // Remove script and style tags completely
      if (frame.tag === "script" || frame.tag === "style") {
        return true;
      }
      return false;
    },
  });
}
