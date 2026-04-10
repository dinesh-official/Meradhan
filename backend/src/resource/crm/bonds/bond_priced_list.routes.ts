import { Router } from "express";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";
import { FileUploadProvider } from "@modules/file_upload/multer_express_file_upload";
import path from "path";
import { BondPricedListController } from "./bond_priced_list.controller";

const router = Router();
const controller = new BondPricedListController();

const uploadProvider = new FileUploadProvider(
  path.join(process.cwd(), "uploads"),
  [".csv"]
);

router.post(
  "/api/crm/bonds/priced-list/upload",
  allowAccessMiddleware("CRM"),
  uploadProvider.uploadL.single("file"),
  (req, res) => controller.uploadConsolidated(req, res)
);

router.post(
  "/api/crm/bonds/priced-list/upsert-row",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.upsertConsolidatedRow(req, res)
);

router.get(
  "/api/crm/bonds/priced-list",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.listConsolidated(req, res)
);

export default router;

