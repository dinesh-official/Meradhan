import { ExpressServer } from "@core/bootstrap/server";
import { checkConnectToDatabases } from "@core/database/database";
import {
  PrometheusMonitorProvider,
  PrometheusResponseTimeMonitor,
} from "@modules/monitoring/prometheus";
import { env } from "@packages/config/env";
import bondRoute from "@resource/bonds/bond.routes";
import commonApiRoutes from "@resource/common/routes";
import auditLogsRouter from "@resource/crm/audit_logs/audit_logs_route";
import crmAuthRoutes from "@resource/crm/auth/auth.route";
import crmCustomersRoutes from "@resource/crm/customers/customers.routes";
import followUpRouter from "@resource/crm/leads/followup/leads_follow_up.routes";
import leadsRoutes from "@resource/crm/leads/leads.routes";
import participantsRouter from "@resource/crm/refq/nse/cbrics/cbrics.routes";
import nseIsinRoute from "@resource/crm/refq/nse/isin/nseisin.routes";
import local_data_rfq_routes from "@resource/crm/refq/nse/local/localdata_rfq.routes";
import rfqMasterRouter from "@resource/crm/refq/nse/rfq_master/rfq_master.routes";
import crmUsersRoutes from "@resource/crm/users/crmuser.route";
import crmOrdersRoutes from "@resource/crm/orders/orders.routes";
import webAuditLogsRouter from "@resource/crm/web_audit_logs/audit_logs_route";
import orderRoutes from "@resource/customer/order/order.routes";
import customerBondsRoutes from "@resource/customer/bonds/customer_bonds.routes";
import paymentRoutes from "@resource/customer/payment/payment.routes";
import customerAuthRoutes from "@resource/customer/auth/customer.auth.route";
import kycRoutes from "@resource/customer/kyc/kyc.routes";
import customerProfileRoutes from "@resource/customer/profile/c_profile.routes";
import trashRoutes from "@resource/trash/trash.routes";
import auditlogsRoutes from "@services/auditlogs/auditlog.routes";
import { cacheStorage } from "@store/redis_store";
import logger from "@utils/logger/logger";
const monitoring = new PrometheusMonitorProvider();
const response_time_monitor = new PrometheusResponseTimeMonitor();

// Initialize server
const server = new ExpressServer(Number(env.PORT), {
  serverMonitor: monitoring,
  responseTimeHandler(data) {
    response_time_monitor.recordResponseTime(
      data.method,
      data.url,
      data.duration,
      data.statusCode
    );
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
  crmOrdersRoutes,
  participantsRouter,
  commonApiRoutes,
  // rfq routes
  nseIsinRoute,
  rfqMasterRouter,
  local_data_rfq_routes,

  // customer routes
  customerAuthRoutes,
  customerProfileRoutes,
  kycRoutes,
  orderRoutes,
  customerBondsRoutes,
  paymentRoutes,

  // bond routes
  bondRoute,

  trashRoutes,
  webAuditLogsRouter,
  auditlogsRoutes,
]);

// Connect to databases and start server
checkConnectToDatabases()
  .then(() => {
    logger.logInfo("All databases connected successfully.");
    server.start();
  })
  .catch((error) => {
    logger.logError("Error connecting to databases:", error);
    process.exit(1);
  });
