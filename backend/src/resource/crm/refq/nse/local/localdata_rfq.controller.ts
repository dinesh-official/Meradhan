import type { Request, Response } from "express";
import { LocaldataRfqService } from "./localdata_rfq.service";
import { HttpStatus } from "@utils/error/AppError";

export class LocaldataRfqController {
  private localdataRfqService = new LocaldataRfqService();

  async getLocaldataRfq(req: Request, res: Response) {
    // safeParse gives you non-throwing validation
    const data = await this.localdataRfqService.getLocaldataRfqIsin(req.query);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  }
}
