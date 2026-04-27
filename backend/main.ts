import { ExpressServer } from "@core/bootstrap/server";
import { checkConnectToDatabases } from "@core/database/database";
import nseWebhookRoutes from "@modules/RFQ/nse/webhook_notification.routes";
import {
  PrometheusMonitorProvider,
  PrometheusResponseTimeMonitor,
} from "@modules/monitoring/prometheus";
import { env } from "@packages/config/env";
import bondRoute from "@resource/bonds/bond.routes";
import commonApiRoutes from "@resource/common/routes";
import crmAuditlogsRoutes from "@resource/crm/auditlogs/auditlogs.routes";
import crmAuthRoutes from "@resource/crm/auth/auth.routes";
import crmCustomersRoutes from "@resource/crm/customers/customers.routes";
import dashboardRoutes from "@resource/crm/dashboard/dashboard.routes";
import crmBondPricedListRoutes from "./src/resource/crm/bonds/bond_priced_list.routes";
import crmBondReferenceDataRoutes from "@resource/crm/bonds/bond_reference_data.routes";
import crmBondMarginRoutes from "@resource/crm/bonds/bond_margin.routes";
import followUpRouter from "@resource/crm/leads/followup/leads_follow_up.routes";
import leadsRoutes from "@resource/crm/leads/leads.routes";
import crmOrdersRoutes from "@resource/crm/orders/orders.routes";
import partnershipFollowUpRouter from "@resource/crm/partnership/followup/partnership_follow_up.routes";
import partnershipRoutes from "@resource/crm/partnership/partnership.routes";
import participantsRouter from "@resource/crm/refq/nse/cbrics/cbrics.routes";
import nseNotificationsRoutes from "@resource/crm/refq/nse/notifications/nse_notifications.routes";
import nseIsinRoute from "@resource/crm/refq/nse/isin/nseisin.routes";
import localDataRfqRoutes from "@resource/crm/refq/nse/local/localdata_rfq.routes";
import rfqMasterRouter from "@resource/crm/refq/nse/rfq_master/rfq_master.routes";
import trashRoutes from "@resource/crm/trash/trash.routes";
import crmUsersRoutes from "@resource/crm/users/crmusers.routes";
import notificationRoutes from "@resource/crm/notifications/notification.routes";
import razorpayRouteAccountsRoutes from "@resource/crm/razorpay-route-accounts/razorpay_route_accounts.routes";
import razorpayRouteStakeholdersRoutes from "@resource/crm/razorpay-route-stakeholders/razorpay_route_stakeholders.routes";
import razorpayRouteSettlementAccountsRoutes from "@resource/crm/razorpay-route-settlement-accounts/razorpay_route_settlement_accounts.routes";
import auditlogsRoutes from "@resource/customer/auditlogs/auditlogs.routes";
import customerAuthRoutes from "@resource/customer/auth/customer.auth.routes";
import customerBondsRoutes from "@resource/customer/bonds/customer_bonds.routes";
import kraRoutes from "@resource/kra/kra.routes";
import kycRoutes from "@resource/customer/kyc/kyc.routes";
import orderRoutes from "@resource/customer/order/order.routes";
import paymentRoutes from "@resource/customer/payment/payment.routes";
import customerProfileRoutes from "@resource/customer/profile/customer.profile.routes";
import watchListRoutes from "@resource/customer/watchlist/watchlist.routes";
import portfolioRoutes from "@resource/customer/portfolio/portfolio.routes";
import logger from "@utils/logger/logger";
import { calculateBondMargin } from "@resource/bonds/bond_clac";
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

// Add router to server
server.addRoutes([
  // crm routes
  crmAuthRoutes,
  crmUsersRoutes,
  crmCustomersRoutes,
  crmBondPricedListRoutes,
  crmBondReferenceDataRoutes,
  crmBondMarginRoutes,
  leadsRoutes,
  followUpRouter,
  partnershipRoutes,
  partnershipFollowUpRouter,
  crmAuditlogsRoutes,
  crmOrdersRoutes,
  notificationRoutes,
  razorpayRouteAccountsRoutes,
  razorpayRouteStakeholdersRoutes,
  razorpayRouteSettlementAccountsRoutes,
  participantsRouter,
  nseNotificationsRoutes,
  commonApiRoutes,
  dashboardRoutes,
  kraRoutes,
  // rfq routes
  nseIsinRoute,
  rfqMasterRouter,
  localDataRfqRoutes,
  // nse webhook routes
  nseWebhookRoutes,

  // customer routes
  customerAuthRoutes,
  customerProfileRoutes,
  kycRoutes,
  orderRoutes,
  customerBondsRoutes,
  paymentRoutes,
  portfolioRoutes,

  // bond routes
  bondRoute,

  trashRoutes,
  auditlogsRoutes,
  // WatchList Routes
  watchListRoutes,
]);

// Connect to databases and start server
checkConnectToDatabases()
  .then(async () => {
    logger.logInfo("All databases connected successfully.");
    server.start();
  })
  .catch((error) => {
    console.log(error);
    logger.logError("Error connecting to databases:", error);
    process.exit(1);
  });
