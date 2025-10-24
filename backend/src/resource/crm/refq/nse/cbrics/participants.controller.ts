import { appSchema } from '@root/schema'
import type { Request, Response } from 'express';
import { CbricsParticipantService } from './participants.service';
import { HttpStatus } from '@utils/error/AppError';
export class CbricsParticipantController {

    private participantService = new CbricsParticipantService();

    async handleGetParticipants(req: Request, res: Response) {
        // safeParse gives you non-throwing validation
        const result = appSchema.crm.rfq.nse.getParticipants.GetParticipantsZ.parse(req.query);
        console.log(result);
        
        const data = await this.participantService.getParticipants(result);
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: data
        })

    }
}