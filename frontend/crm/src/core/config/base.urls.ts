// Centralized base URLs for all environments
export const BASES = {
  development: {
    HOST: "http://localhost:3000",
    API_SERVER: "http://localhost:4000",
    CMS: process.env.STRAPI_HOST_URL || "",
    API_BACKEND_URL_IP: "http://localhost:4000",
    ASSETS: "https://jfhfryiyfqrytbtzsdtj.supabase.co/storage/v1/object/public",
  },
  production: {
    HOST: "https://test.meradhan.co",
    API_SERVER: "https://testapi.meradhan.co",
    API_BACKEND_URL_IP: "http://34.131.27.101:4000",
    CMS: "https://spydertest.meradhan.co",
    ASSETS: "https://jfhfryiyfqrytbtzsdtj.supabase.co/storage/v1/object/public",
  },
};
