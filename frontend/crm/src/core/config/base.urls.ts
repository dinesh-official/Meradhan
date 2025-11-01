

// Centralized base URLs for all environments
export const BASES = {
    development: {
        HOST: "http://localhost:3000",
        API_SERVER: "http://localhost:4000",
        CMS: "http://3.110.126.202:1337",
        ASSETS: "https://jfhfryiyfqrytbtzsdtj.supabase.co/storage/v1/object/public",
    },
    production: {
        HOST: "http://3.110.126.202:4001",
        API_SERVER: "http://3.110.126.202:4000",
        CMS: "http://3.110.126.202:1337",
        ASSETS: "https://jfhfryiyfqrytbtzsdtj.supabase.co/storage/v1/object/public",
    },
};