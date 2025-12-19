import type { CookieOptions } from "express";

const COOKIE_EXPIRY_TIME = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);

export const cookieOptions: CookieOptions = {
  expires: COOKIE_EXPIRY_TIME,
  httpOnly: true, // Prevent XSS attacks
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: "lax", // CSRF protection
  path: "/", // Cookie available site-wide
  // Removed domain attribute - use host-only cookies for better security
  // Cookies set by api.meradhan.co will only be accessible to api.meradhan.co
  // Frontend apps can still send these cookies via CORS with credentials: true
};
