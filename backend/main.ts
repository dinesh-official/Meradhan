import dotenv from "dotenv";
dotenv.config({ debug: false });
import { config } from "@config/config";
import { ExpressServer } from "@core/bootstrap/server";
import { checkConnectToDatabases } from "@core/database/database";
import { PrometheusMonitorProvider, PrometheusResponseTimeMonitor } from "@lib/provider/monitoring/prometheus.provider";
import logger from "@utils/logger/logger";
import { cacheStorage } from "./src/queues/redis/queues";
import authRoutes from "./src/resource/auth/auth.route";
import customersRoutes from "./src/resource/crm/customers/customers.routes";
import leadsRoutes from "./src/resource/crm/leads/leads.routes";
import crmUsersRoutes from "./src/resource/crm/users/crmuser.route";
import followUpRouter from "./src/resource/crm/leads/followup/leadsFollowUp.routes";

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
server.addRoutes([authRoutes, crmUsersRoutes, customersRoutes, leadsRoutes, followUpRouter]);

// Connect to databases and start server
checkConnectToDatabases()
    .then(() => {
        logger.logInfo("All databases connected successfully.");
        server.start();
    }).catch((error) => {
        logger.logError("Error connecting to databases:", error);
        process.exit(1);
    });
