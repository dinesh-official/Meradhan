// Centralized base URLs for all environments
export const BASES = {
    development: {
        HOST: "http://localhost:3000",
        API_SERVER: "http://localhost:4000",
        CMS: "https://spydertest.meradhan.co",
        ASSETS: "https://jfhfryiyfqrytbtzsdtj.supabase.co/storage/v1/object/public",
    },
    production: {
        HOST: "https://crmtest.meradhan.co",
        API_SERVER: "https://testapi.meradhan.co",
        CMS: "https://spydertest.meradhan.co",
        ASSETS: "https://jfhfryiyfqrytbtzsdtj.supabase.co/storage/v1/object/public",
    },
};