import { BASES_URLS } from "@/core/config/base.urls";

// Export URLs consistently
export const HOST_URL = BASES_URLS.HOST || "";
export const API_LOCAL_URL = `${BASES_URLS.HOST || ""}/api/server`;
export const API_SERVER_URL = `${BASES_URLS.API_SERVER || ""}/api`;
export const API_BACKEND_URL_IP = `${BASES_URLS.API_BACKEND_URL_IP || ""}/api`;
export const ASSETS_URL = `${BASES_URLS.HOST || ""}/assets/media`;
