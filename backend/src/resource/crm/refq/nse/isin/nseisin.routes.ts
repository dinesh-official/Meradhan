import { Router } from 'express'
import { NSEIsinController } from './nseisin.controller';
import { withCrmAuthMiddleware } from '@middlewares/crm_middleware';
const nseIsinRoute = Router();

const controller = new NSEIsinController()

nseIsinRoute.get("/api/crm/rfq/nse/isin", withCrmAuthMiddleware, (req, res) => controller.searchIsin(req, res));

export default nseIsinRoute;