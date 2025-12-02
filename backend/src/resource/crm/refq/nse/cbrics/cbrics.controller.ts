import { appSchema } from "@root/schema";
import { HttpStatus } from "@utils/error/AppError";
import type { Request, Response } from "express";
import { CbricsParticipantService } from "./cbrics.service";
import { NseCBRICS } from "@modules/RFQ/nse/nse_CBRICS";
import { NseRfq } from "@modules/RFQ/nse/nse_RFQ";
export class CbricsParticipantController {
  private participantService = new CbricsParticipantService();
  private nseCbrics = new NseCBRICS();
  private nseRfq = new NseRfq();

  async handleGetParticipants(req: Request, res: Response) {
    // safeParse gives you non-throwing validation
    const result = appSchema.crm.rfq.nse.getParticipants.GetParticipantsZ.parse(
      req.query
    );
    console.log(result);

    const data = await this.participantService.getParticipants(result);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  }

  async handleGetParticipantsCbrics(req: Request, res: Response) {
    // safeParse gives you non-throwing validation
    const result = appSchema.crm.rfq.nse.getParticipants.GetParticipantsZ.parse(
      req.query
    );
    console.log(result);

    const data = await this.nseCbrics.getAllUnregisteredParticipants({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      workflowStatus: result.workflowStatus as any,
      firstName: result.search,
      loginId: result.statusCode,
    });
    console.log(data);

    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  }

  async handleGetParticipantsRfq(req: Request, res: Response) {
    // safeParse gives you non-throwing validation
    const result = appSchema.crm.rfq.nse.getParticipants.GetParticipantsZ.parse(
      req.query
    );
    console.log(result);

    const data = await this.nseRfq.getAllParticipants();
    console.log(data);

    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  }
}
