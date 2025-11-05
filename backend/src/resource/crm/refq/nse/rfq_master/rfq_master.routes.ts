import { Router } from 'express'
import { RfqMasterController } from './rfq_master.controller';
import { withCrmAuthMiddleware } from '@middlewares/crm_middleware';
const rfqMasterRouter = Router();

const controller = new RfqMasterController();
rfqMasterRouter.post("/api/crm/rfq/add-isin", withCrmAuthMiddleware, (req, res) => controller.addIsinToRfq(req, res));

export default rfqMasterRouter;