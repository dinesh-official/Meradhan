// Centralized base URLs for all environments
export const BASES_URLS = {
  HOST: process.env.NEXT_PUBLIC_HOST_URL,
  API_SERVER: process.env.NEXT_PUBLIC_BACKEND_HOST_URL,
  API_BACKEND_URL_IP: process.env.NEXT_PUBLIC_BACKEND_IP_URL,
  CMS: process.env.NEXT_PUBLIC_STRAPI_HOST_URL,
  ASSETS: process.env.NEXT_PUBLIC_BACKEND_HOST_URL,
  DIGIO: process.env.NEXT_PUBLIC_DIGIO as "production" | "sandbox", // Change to "production" for live environment
  DHANGPT: process.env.NEXT_PUBLIC_DHANGPT_URL || "https://dhangpt.meradhan.co",
};
