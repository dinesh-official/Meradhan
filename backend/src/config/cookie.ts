import type { CookieOptions } from "express";

export const cookieOptions: CookieOptions = {
  httpOnly: true, // Prevent XSS attacks
  secure: true, // HTTPS only in production ✅
  sameSite: "none", // CSRF protection
  // SECURITY: Using "lax" instead of "strict" to allow cookies on same-site subdomains
  // (e.g., api.meradhan.co and app.meradhan.co). This is acceptable for cross-subdomain flows.
  // If all authentication flows are same-origin (no cross-subdomain), consider changing to
  // "strict" for stronger CSRF protection. Current "lax" setting is appropriate for:
  // - API subdomain (api.meradhan.co) setting cookies
  // - Frontend subdomains (app.meradhan.co, crm.meradhan.co) sending cookies via CORS
  path: "/", // Cookie available site-wide
  // Removed domain attribute - use host-only cookies for better security
  // Cookies set by api.meradhan.co will only be accessible to api.meradhan.co
  // Frontend apps can still send these cookies via CORS with credentials: true
  domain: process.env.NODE_ENV === "production" ? ".meradhan.co" : undefined,
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  maxAge: 24 * 60 * 60 * 1000,
};
