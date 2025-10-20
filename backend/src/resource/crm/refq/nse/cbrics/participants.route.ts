import { Router } from 'express'
import { withAuthMiddleware } from '@lib/middlewares/auth.middleware';
import { CbricsParticipantController } from './participants.controller';
const participantsRouter = Router();

const controller = new CbricsParticipantController();
participantsRouter.get("/api/crm/rfq/nse/participants", withAuthMiddleware, (req, res) => controller.handleGetParticipants(req, res));

export default participantsRouter;