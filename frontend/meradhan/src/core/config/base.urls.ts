// Centralized base URLs for all environments
export const BASES = {
  development: {
    HOST: "http://localhost:3000",
    API_SERVER: "http://localhost:4000",
    API_BACKEND_URL_IP: "http://localhost:4000",
    CMS: "https://spyder.meradhan.co",
    ASSETS: "http://localhost:4000",
  },

  production: {
    HOST: "http://localhost:4002",
    API_SERVER: "http://localhost:4000",
    API_BACKEND_URL_IP: "http://localhost:4000",
    CMS: "https://spyder.meradhan.co",
    ASSETS: "http://localhost:4000",
  },
  DIGIO: "sandbox" as "sandbox" | "production", // Change to "production" for live environment
};

// production: {
//   HOST: "https://meradhan.co",
//   API_SERVER: "https://api.meradhan.co",
//   API_BACKEND_URL_IP: "http://34.131.27.101:4000",
//   CMS: "https://spyder.meradhan.co",
//   ASSETS: "https://jfhfryiyfqrytbtzsdtj.supabase.co/storage/v1/object/public",
// },
