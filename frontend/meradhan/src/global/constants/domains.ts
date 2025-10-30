// src/config/constants.js

const isDev = process.env.NODE_ENV === "development"

// ✅ Define base URLs in one place
const BASES = {
  development: {
    HOST: "http://localhost:3000",
    SERVER: "http://localhost:4000",
  },
  production: {
    HOST: "http://3.110.126.202:4002",
    SERVER: "http://3.110.126.202:4000",
  },
}

// ✅ Pick environment-specific config
const BASE = isDev ? BASES.development : BASES.production

// ✅ Export URLs consistently
export const HOST_URL = BASE.HOST
export const API_LOCAL_URL = `${BASE.HOST}/api/server`
export const API_SERVER_URL = `${BASE.SERVER}/api`
export const ASSETS_URL = `${BASE.HOST}/assets/media/`
