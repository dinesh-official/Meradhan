import dotenv from "dotenv";
dotenv.config({ debug: false });

import { config } from "@config/config";
import { ExpressServer } from "@core/bootstrap/server";
import { checkConnectToDatabases, disconnectFromDatabases } from "@core/database/database";
import { PrometheusMonitorProvider, PrometheusResponseTimeMonitor } from "@lib/provider/monitoring/prometheus.provider";
import authRoutes from "./src/resource/auth/auth.route";
import { cacheStorage } from "./src/queues/redis/queues";
import logger from "@utils/logger/logger";

const monitoring = new PrometheusMonitorProvider()
const responseTimeMonitor = new PrometheusResponseTimeMonitor()
// Initialize server
const server = new ExpressServer(config.port, {
    serverMonitor: monitoring,
    responseTimeHandler(data) {
        responseTimeMonitor.recordResponseTime(data.method, data.url, data.duration, data.statusCode);
    },
});
logger.logInfo((await cacheStorage.isConnected()).toString());

// Add router to server
server.addRoutes([authRoutes]);

// Connect to databases and start server
checkConnectToDatabases()
    .then(() => {
        logger.logInfo("All databases connected successfully.");
        server.start();
    }).catch((error) => {
        console.error("Error connecting to databases:", error);
        process.exit(1);
    });

// Function to handle async shutdown
async function handleShutdown(signal?: string) {

    logger.logInfo(`Process ${signal || "exited"}: Server stopping...`);
    try {
        await disconnectFromDatabases();
        await cacheStorage.disconnect();
        logger.logInfo("Databases disconnected successfully.");
    } catch (err) {
        console.error("Error disconnecting databases:", err);
    }
    process.exit(0);
}

// Listen for signals for async cleanup
process.on("SIGINT", () => handleShutdown("SIGINT"));   // Ctrl+C
process.on("SIGTERM", () => handleShutdown("SIGTERM")); // Termination signal
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    handleShutdown("uncaughtException");
});

// Synchronous exit log (async not possible here)
process.on("exit", (code) => {
    logger.logInfo(`Process exited with code ${code}`);
});
