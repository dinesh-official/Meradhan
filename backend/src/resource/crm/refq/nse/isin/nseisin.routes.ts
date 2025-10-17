import { Router } from 'express'
import { NSEIsinController } from './nseisin.controller';
import { withAuthMiddleware } from '@lib/middlewares/auth.middleware';
const nseIsinRoute = Router();

const controller = new NSEIsinController()

nseIsinRoute.get("/api/crm/rfq/nse/isin", withAuthMiddleware, (req, res) => controller.searchIsin(req, res));

export default nseIsinRoute;