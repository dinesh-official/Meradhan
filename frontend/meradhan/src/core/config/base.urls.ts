// Centralized base URLs for all environments
export const BASES = {
  development: {
    HOST: "http://localhost:3000",
    API_SERVER: "http://localhost:4000",
    API_BACKEND_URL_IP: "http://localhost:4000",
    CMS: process.env.STRAPI_HOST_URL,
    ASSETS: "https://jfhfryiyfqrytbtzsdtj.supabase.co/storage/v1/object/public",
  },
  production: {
    HOST: process.env.HOST_URL,
    API_SERVER: process.env.BACKEND_HOST_URL,
    API_BACKEND_URL_IP: process.env.BACKEND_IP_URL,
    CMS: process.env.STRAPI_HOST_URL,
    ASSETS: "https://jfhfryiyfqrytbtzsdtj.supabase.co/storage/v1/object/public",
  },
};
