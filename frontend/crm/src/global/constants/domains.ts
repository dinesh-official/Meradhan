export const API_LOCAL_URL = process.env.NODE_ENV === "development" ? "http://localhost:3000/api/server" : "http://3.110.126.202:4001/api/server"
export const API_SERVER_URL = process.env.NODE_ENV === "development" ? "http://localhost:4000/api" : "http://3.110.126.202:4000/api"
export const ASSETS_URL = process.env.NODE_ENV === "development" ? "http://localhost:4001/assets/media/" : "http://3.110.126.202:4001/assets/media/"
