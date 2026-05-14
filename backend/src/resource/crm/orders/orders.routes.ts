import { Router } from "express";
import multer from "multer";
import { CrmOrdersController } from "./orders.controller";
import { CrmInventoryStockController } from "./inventory_stock.controller";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";

const router = Router();
const crmOrdersController = new CrmOrdersController();
const inventoryStockController = new CrmInventoryStockController();

const inventoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const name = (file.originalname || "").toLowerCase();
    const ok =
      name.endsWith(".csv") ||
      name.endsWith(".xlsx") ||
      name.endsWith(".xls") ||
      file.mimetype === "text/csv" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    if (ok) cb(null, true);
    else cb(new Error("Only .csv, .xls, or .xlsx files are allowed"));
  },
});

router.get(
  "/api/crm/orders/all",
  allowAccessMiddleware("CRM"),
  crmOrdersController.getAllOrders
);

router.get(
  "/api/crm/orders/draft-orders",
  allowAccessMiddleware("CRM"),
  crmOrdersController.getDraftOrders
);

router.post(
  "/api/crm/orders/draft-orders/:draftId/proceed",
  allowAccessMiddleware("CRM"),
  crmOrdersController.proceedDraftOrder
);

router.patch(
  "/api/crm/orders/draft-orders/:draftId/cancel",
  allowAccessMiddleware("CRM"),
  crmOrdersController.cancelDraftOrder
);

router.get(
  "/api/crm/orders/payment-process-logs",
  allowAccessMiddleware("CRM"),
  crmOrdersController.getPaymentProcessLogs
);

router.get(
  "/api/crm/orders/payment-gateway-settings",
  allowAccessMiddleware("CRM"),
  crmOrdersController.getPaymentGatewaySettings
);

router.patch(
  "/api/crm/orders/payment-gateway-settings",
  allowAccessMiddleware("CRM"),
  crmOrdersController.updatePaymentGatewaySettings
);

/** ISIN inventory stock (daily file uploads) — must stay above `/:id` */
router.post(
  "/api/crm/orders/inventory-stock/upload",
  allowAccessMiddleware("CRM"),
  (req, res, next) => {
    inventoryUpload.single("file")(req, res, (err: unknown) => {
      if (err) {
        const message = err instanceof Error ? err.message : "Upload rejected";
        return res.status(400).json({
          status: false,
          code: "BAD_REQUEST",
          message,
        });
      }
      next();
    });
  },
  inventoryStockController.upload
);

router.get(
  "/api/crm/orders/inventory-stock/days",
  allowAccessMiddleware("CRM"),
  inventoryStockController.listDays
);

router.get(
  "/api/crm/orders/inventory-stock/batches",
  allowAccessMiddleware("CRM"),
  inventoryStockController.listBatches
);

router.get(
  "/api/crm/orders/inventory-stock/latest",
  allowAccessMiddleware("CRM"),
  inventoryStockController.latestSummary
);

router.get(
  "/api/crm/orders/inventory-stock/batch/:batchId/lines",
  allowAccessMiddleware("CRM"),
  inventoryStockController.batchLines
);

router.delete(
  "/api/crm/orders/inventory-stock/batch/:batchId",
  allowAccessMiddleware("CRM"),
  inventoryStockController.deleteBatch
);

router.patch(
  "/api/crm/orders/inventory-stock/line/:lineId",
  allowAccessMiddleware("CRM"),
  inventoryStockController.updateLineQuantity
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
  "/api/crm/orders/receipt-pdf-options/:orderNumber",
  allowAccessMiddleware("CRM"),
  crmOrdersController.getReceiptPdfOptions
);

router.put(
  "/api/crm/orders/receipt-pdf-options/:orderNumber",
  allowAccessMiddleware("CRM"),
  crmOrdersController.upsertReceiptPdfOptions
);

router.post(
  "/api/crm/orders/receipt-pdf-options/:orderNumber/autofill",
  allowAccessMiddleware("CRM"),
  crmOrdersController.autofillReceiptPdfOptions
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

router.post(
  "/api/crm/orders/send-proposal-email",
  allowAccessMiddleware("CRM"),
  crmOrdersController.sendProposalEmailToClient
);

export default router;
