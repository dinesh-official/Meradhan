import { BASES } from "@/core/config/base.urls";

const isDev = process.env.NODE_ENV === "development";

// Pick environment-specific config
const BASE = isDev ? BASES.development : BASES.production;
console.log("Using BASE URLs:", BASE);
// Export URLs consistently
export const HOST_URL = BASE.HOST || "";
export const CMS_URL = BASE.CMS || "";
export const API_LOCAL_URL = `${BASE.HOST || ""}/api/server`;
export const API_SERVER_URL = `${BASE.API_SERVER || ""}/api`;
export const API_SERVER_URL_IP = `${BASE.API_BACKEND_URL_IP || ""}/api`;
export const ASSETS_URL = `${BASE.HOST || ""}/assets/media/`;
