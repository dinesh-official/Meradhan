import type { Express } from "express";
import proxy from "express-http-proxy";
export const proxyConfig = [
    {
        source: "/proxy/uat/kra",
        destination: "https://pilot.kra.ndml.in",
    },
    {
        source: "/proxy/uat/cdsl",
        destination: "https://mockapigt.cdsl.co.in",
    },
    {
        source: "/proxy/uat/nsdl",
        destination: "https://eservices-test.nsdl.com",
    },
]

export const proxyRoutes = (app: Express) => {
    proxyConfig.forEach(({ source, destination }) => {
        app.use(source, proxy(destination));
    });
}