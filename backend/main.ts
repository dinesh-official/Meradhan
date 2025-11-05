import { config } from "@config/config";
import { ExpressServer } from "@core/bootstrap/server";
import { checkConnectToDatabases } from "@core/database/database";
import { PrometheusMonitorProvider, PrometheusResponseTimeMonitor } from "@modules/monitoring/prometheus";
import bondRoute from "@resource/bonds/bond.routes";
import auditLogsRouter from "@resource/crm/audit_logs/audit_logs_route";
import crmAuthRoutes from "@resource/crm/auth/auth.route";
import crmCustomersRoutes from "@resource/crm/customers/customers.routes";
import followUpRouter from "@resource/crm/leads/followup/leads_follow_up.routes";
import leadsRoutes from "@resource/crm/leads/leads.routes";
import participantsRouter from "@resource/crm/refq/nse/cbrics/participants.routes";
import nseIsinRoute from "@resource/crm/refq/nse/isin/nseisin.routes";
import rfqMasterRouter from "@resource/crm/refq/nse/rfq_master/rfq_master.routes";
import crmUsersRoutes from "@resource/crm/users/crmuser.route";
import customerAuthRoutes from "@resource/customer/auth/customer.auth.route";
import kycRoutes from "@resource/customer/kyc/kyc.routes";
import { cacheStorage } from "@store/redis_store";
import logger from "@utils/logger/logger";
import dotenv from "dotenv";



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
    // crm routes
    crmAuthRoutes,
    crmUsersRoutes,
    crmCustomersRoutes,
    leadsRoutes,
    followUpRouter,
    auditLogsRouter,
    participantsRouter,

    // rfq routes 
    nseIsinRoute,
    rfqMasterRouter,

    // customer routes
    customerAuthRoutes,
    kycRoutes,

    // bond routes
    bondRoute
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

