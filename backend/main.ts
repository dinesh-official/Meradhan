import { config } from "@config/config";
import { ExpressServer } from "@core/bootstrap/server";
import { checkConnectToDatabases } from "@core/database/database";
import { PrometheusMonitorProvider, PrometheusResponseTimeMonitor } from "@lib/provider/monitoring/prometheus.provider";
import logger from "@utils/logger/logger";
import dotenv from "dotenv";
import { cacheStorage } from "./src/queues/redis/queues";
import auditlogsRouter from "./src/resource/auditlogs/auditlogs.route";
import authRoutes from "./src/resource/auth/auth.route";
import customerAuthRoutes from "./src/resource/auth/customers/customerauth.route";
import customerResetPasswordAuthRoutes from "./src/resource/auth/customers/password/forgetpassword.route";
import customersRoutes from "./src/resource/crm/customers/customers.routes";
import followUpRouter from "./src/resource/crm/leads/followup/leadsFollowUp.routes";
import leadsRoutes from "./src/resource/crm/leads/leads.routes";
import participantsRouter from "./src/resource/crm/refq/nse/cbrics/participants.route";
import nseIsinRoute from "./src/resource/crm/refq/nse/isin/nseisin.routes";
import crmUsersRoutes from "./src/resource/crm/users/crmuser.route";
dotenv.config({ debug: false });
const monitoring = new PrometheusMonitorProvider()
const response_time_monitor = new PrometheusResponseTimeMonitor()


// Initialize server
const server = new ExpressServer(config.port, {
    serverMonitor: monitoring,
    responseTimeHandler(data) {
        response_time_monitor.recordResponseTime(data.method, data.url, data.duration, data.statusCode);
    },
});
logger.logInfo((await cacheStorage.isConnected()).toString());

// Add router to server
server.addRoutes([
    authRoutes,
    crmUsersRoutes,
    customersRoutes,
    leadsRoutes,
    followUpRouter,
    nseIsinRoute,
    auditlogsRouter,
    participantsRouter,
    customerAuthRoutes,
    customerResetPasswordAuthRoutes
]);


// Connect to databases and start server
checkConnectToDatabases()
    .then(() => {
        logger.logInfo("All databases connected successfully.");
        server.start();
    }).catch((error) => {
        logger.logError("Error connecting to databases:", error);
        process.exit(1);
    });


