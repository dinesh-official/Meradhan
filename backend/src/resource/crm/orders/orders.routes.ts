import { Router } from "express";
import { CrmOrdersController } from "./orders.controller";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";

const router = Router();
const crmOrdersController = new CrmOrdersController();

router.get(
  "/api/crm/orders/all",
  allowAccessMiddleware("CRM"),
  crmOrdersController.getAllOrders
);

router.get(
  "/api/crm/orders/:id",
  allowAccessMiddleware("CRM"),
  crmOrdersController.getOrderById
);

router.patch(
  "/api/crm/orders/:id/status",
  allowAccessMiddleware("CRM"),
  crmOrdersController.updateOrderStatus
);

router.get(
  "/api/crm/orders/rfq/:orderNumber",
  allowAccessMiddleware("CRM"),
  crmOrdersController.getRfqByOrderNumber
);

router.post(
  "/api/crm/orders/create-from-rfq",
  allowAccessMiddleware("CRM"),
  crmOrdersController.createOrderFromRfq
);

router.get(
  "/api/crm/orders/customer/:orderNumber",
  allowAccessMiddleware("CRM"),
  crmOrdersController.getCustomerFullOrder
);

router.get(
  "/api/crm/orders/receipt-pdf/:orderNumber",
  allowAccessMiddleware("CRM"),
  crmOrdersController.getOrderReceiptPdf
);

router.get(
  "/api/crm/orders/deal-pdf/:orderNumber",
  allowAccessMiddleware("CRM"),
  crmOrdersController.getDealSheetPdf
);

router.post(
  "/api/crm/orders/send-pdf-email/:orderNumber",
  allowAccessMiddleware("CRM"),
  crmOrdersController.sendPdfEmailToClient
);

export default router;
