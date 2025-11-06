import { Router } from 'express'
import { CbricsParticipantController } from './cbrics.controller';
import { withCrmAuthMiddleware } from '@middlewares/crm_middleware';
const participantsRouter = Router();

const controller = new CbricsParticipantController();
participantsRouter.get("/api/crm/rfq/nse/cbrics/participants", withCrmAuthMiddleware, (req, res) => controller.handleGetParticipants(req, res));

export default participantsRouter;