import type { Request, Response } from "express";
import { RfqMasterService } from "./rfq_master.service";
import { appSchema } from "@root/schema";
import { AxiosError } from "axios";
import { NseRfq } from "@modules/RFQ/nse/nse_RFQ";

export class RfqMasterController {
  private rfqMasterService: RfqMasterService;
  private rfqApi = new NseRfq();

  constructor() {
    this.rfqMasterService = new RfqMasterService();
  }

  // this use for create new rfq
  async addIsinToRfq(req: Request, res: Response) {
    try {
      const createdBy = req.session!.id;
      const data = appSchema.rfq.addIsinSchema.parse(req.body);
      const result = await this.rfqMasterService.createNewRfq(data, createdBy);
      res.sendResponse({
        statusCode: 200,
        responseData: result,
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.messages[0]?.msg ||
          error.response?.data?.messages ||
          error.response?.data.toString() ||
          "Internal Server Error";
        res.sendResponse({
          statusCode: error.response?.status || 500,
          responseData: [errorMessage],
        });
      }
      throw error;
    }
  }

  // accept negotation step 2
  async negotiateRfqAccept(req: Request, res: Response) {
    try {
      const userId = req.session!.id;

      const data = appSchema.rfq.acceptNegotiationQuoteSchema.parse(req.body);

      const result = await this.rfqMasterService.negotiateRfqAccept(
        data,
        userId
      );
      res.sendResponse({
        statusCode: 200,
        responseData: result,
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.messages[0]?.msg ||
          error.response?.data?.messages ||
          error.response?.data.toString() ||
          "Internal Server Error";
        res.sendResponse({
          statusCode: error.response?.status || 500,
          responseData: [errorMessage],
        });
      }
      throw error;
    }
  }

  // turminate step 3
  async negotiateRfqTerminate(req: Request, res: Response) {
    const userId = req.session!.id;
    const data = appSchema.rfq.terminateNegotiationQuoteSchema.parse(req.body);
    const result = await this.rfqMasterService.terminateNegotiation(
      data,
      userId
    );
    res.sendResponse({
      statusCode: 200,
      responseData: result,
    });
  }

  // get list for rfq
  async getAllRfq(req: Request, res: Response) {
    const filters = appSchema.rfq.rfqFilterSchema.parse(req.query);
    console.log(filters);

    const result = await this.rfqMasterService.getAllRfqList(filters);
    res.sendResponse({
      statusCode: 200,
      responseData: result,
    });
  }

  // 1 only
  async getRfqById(req: Request, res: Response) {
    const id = req.params.number;
    const result = await this.rfqMasterService.getAllRfqList({
      number: id,
    });
    res.sendResponse({
      statusCode: 200,
      responseData: result?.[0] || null,
    });
  }

  // for deal page list
  async getAllNegotiations(req: Request, res: Response) {
    const filters = appSchema.rfq.rfqNegotiationFilterSchema.parse(req.body);
    const userId = req.session!.id;

    const result = await this.rfqMasterService.getAllNegotiations(
      filters,
      userId
    );
    res.sendResponse({
      statusCode: 200,
      responseData: result,
    });
  }

  // create popsal
  async proposeDeal(req: Request, res: Response) {
    try {
      const userId = req.session!.id;
      const data = appSchema.rfq.proposeDealSchema.parse(req.body);
      const result = await this.rfqMasterService.proposeDeal(data, userId);
      res.sendResponse({
        statusCode: 200,
        responseData: result,
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.messages[0]?.msg ||
          error.response?.data?.messages ||
          error.response?.data.toString() ||
          "Internal Server Error";
        res.sendResponse({
          statusCode: error.response?.status || 500,
          responseData: [errorMessage],
        });
      }
      throw error;
    }
  }

  // accept reject propsal
  async acceptRejectDeal(req: Request, res: Response) {
    try {
      const userId = req.session!.id;
      const data = appSchema.rfq.acceptRejectDealSchema.parse(req.body);
      const result = await this.rfqMasterService.acceptRejectDeal(data, userId);
      res.sendResponse({
        statusCode: 200,
        responseData: result,
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.messages[0]?.msg ||
          error.response?.data?.messages ||
          error.response?.data.toString() ||
          "Internal Server Error";
        res.sendResponse({
          statusCode: error.response?.status || 500,
          responseData: [errorMessage],
        });
      }
      throw error;
    }
  }

  async getAllSettledOrders(req: Request, res: Response) {
    const data = appSchema.rfq.settleOrderFilterSchema.parse(req.body);
    console.log(data);

    const result = await this.rfqMasterService.getAllSettledOrders(data);
    console.log(result);

    res.sendResponse({
      statusCode: 200,
      responseData: result,
    });
  }

  async getAllDealamend(req: Request, res: Response) {
    const data = appSchema.rfq.dealAmendFilterSchema.parse(req.body);
    const result = await this.rfqApi.getAllDealAmendments(data);
    res.sendResponse({
      statusCode: 200,
      responseData: result,
    });
  }
}
