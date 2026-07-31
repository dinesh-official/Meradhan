import { type Request, type Response } from "express";
import { appSchema, getOrderStatusLabel, getPaymentStatusLabel } from "@root/schema";
import { AppError, HttpStatus } from "@utils/error/AppError";
import { OrderReportsService } from "./order_reports.service";

const MAX_CSV_ROWS = 10_000;

function parseFilters(req: Request) {
  const q = req.query as Record<string, string | undefined>;
  const parsed = appSchema.crm.orderReports.OrderReportsQuerySchema.safeParse({
    from: q.from,
    to: q.to,
    paymentStatus: q.paymentStatus,
    status: q.status,
    isin: q.isin,
    customerId: q.customerId,
    email: q.email,
    userType: q.userType,
    kycStatus: q.kycStatus,
    groupBy: q.groupBy,
    page: q.page,
    limit: q.limit,
  });
  if (!parsed.success) {
    throw new AppError(`Invalid report filters: ${parsed.error.message}`, {
      statusCode: HttpStatus.BAD_REQUEST,
      code: "ORDER_REPORTS_VALIDATION",
    });
  }
  const d = parsed.data;
  return {
    filters: {
      from: d.from,
      to: d.to,
      paymentStatus: d.paymentStatus,
      status: d.status,
      isin: d.isin,
      customerId: d.customerId,
      email: d.email,
      userType: d.userType,
      kycStatus: d.kycStatus,
    },
    groupBy: d.groupBy,
    page: d.page,
    limit: d.limit,
  };
}

export class OrderReportsController {
  private service = new OrderReportsService();

  getSummary = async (req: Request, res: Response) => {
    const { filters, groupBy } = parseFilters(req);
    const data = await this.service.getSummary(filters, groupBy);
    return res.sendResponse({ statusCode: HttpStatus.OK, responseData: data });
  };

  getRegister = async (req: Request, res: Response) => {
    const { filters, page, limit } = parseFilters(req);
    const data = await this.service.getRegister(filters, page, limit);
    return res.sendResponse({ statusCode: HttpStatus.OK, responseData: data });
  };

  getByIsin = async (req: Request, res: Response) => {
    const q = req.query as Record<string, string | undefined>;
    const parsed = appSchema.crm.orderReports.OrderReportsByIsinQuerySchema.safeParse({
      from: q.from,
      to: q.to,
      paymentStatus: q.paymentStatus,
      status: q.status,
      isin: q.isin,
      customerId: q.customerId,
      email: q.email,
      userType: q.userType,
      kycStatus: q.kycStatus,
    });
    if (!parsed.success) {
      throw new AppError("Invalid query", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "ORDER_REPORTS_VALIDATION",
      });
    }
    const d = parsed.data;
    const data = await this.service.getByIsin({
      from: d.from,
      to: d.to,
      paymentStatus: d.paymentStatus,
      status: d.status,
      isin: d.isin,
      customerId: d.customerId,
      email: d.email,
      userType: d.userType,
      kycStatus: d.kycStatus,
    });
    return res.sendResponse({ statusCode: HttpStatus.OK, responseData: data });
  };

  getRevenue = async (req: Request, res: Response) => {
    const q = req.query as Record<string, string | undefined>;
    const parsed = appSchema.crm.orderReports.OrderReportsRevenueQuerySchema.safeParse({
      from: q.from,
      to: q.to,
      paymentStatus: q.paymentStatus,
      status: q.status,
      isin: q.isin,
      customerId: q.customerId,
      email: q.email,
      userType: q.userType,
      kycStatus: q.kycStatus,
    });
    if (!parsed.success) {
      throw new AppError("Invalid query", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "ORDER_REPORTS_VALIDATION",
      });
    }
    const d = parsed.data;
    const data = await this.service.getRevenue({
      from: d.from,
      to: d.to,
      paymentStatus: d.paymentStatus,
      status: d.status,
      isin: d.isin,
      customerId: d.customerId,
      email: d.email,
      userType: d.userType,
      kycStatus: d.kycStatus,
    });
    return res.sendResponse({ statusCode: HttpStatus.OK, responseData: data });
  };

  getFunnel = async (req: Request, res: Response) => {
    const { filters } = parseFilters(req);
    const data = await this.service.getFunnel(filters);
    return res.sendResponse({ statusCode: HttpStatus.OK, responseData: data });
  };

  getByCustomer = async (req: Request, res: Response) => {
    const q = req.query as Record<string, string | undefined>;
    const parsed = appSchema.crm.orderReports.OrderReportsByCustomerQuerySchema.safeParse({
      from: q.from,
      to: q.to,
      paymentStatus: q.paymentStatus,
      status: q.status,
      isin: q.isin,
      customerId: q.customerId,
      email: q.email,
      userType: q.userType,
      kycStatus: q.kycStatus,
      page: q.page,
      limit: q.limit,
    });
    if (!parsed.success) {
      throw new AppError("Invalid query", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "ORDER_REPORTS_VALIDATION",
      });
    }
    const d = parsed.data;
    const data = await this.service.getByCustomer(
      {
        from: d.from,
        to: d.to,
        paymentStatus: d.paymentStatus,
        status: d.status,
        isin: d.isin,
        customerId: d.customerId,
        email: d.email,
        userType: d.userType,
        kycStatus: d.kycStatus,
      },
      d.page,
      d.limit,
    );
    return res.sendResponse({ statusCode: HttpStatus.OK, responseData: data });
  };

  getHoldings = async (req: Request, res: Response) => {
    const { filters } = parseFilters(req);
    const data = await this.service.getHoldings(filters);
    return res.sendResponse({ statusCode: HttpStatus.OK, responseData: data });
  };

  getLogFailures = async (req: Request, res: Response) => {
    const q = req.query as Record<string, string | undefined>;
    const parsed = appSchema.crm.orderReports.OrderReportsLogFailuresQuerySchema.safeParse({
      from: q.from,
      to: q.to,
      page: q.page,
      limit: q.limit,
    });
    if (!parsed.success) {
      throw new AppError("Invalid query", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "ORDER_REPORTS_VALIDATION",
      });
    }
    const d = parsed.data;
    const data = await this.service.getLogFailures(
      { from: d.from, to: d.to },
      d.page,
      d.limit,
    );
    return res.sendResponse({ statusCode: HttpStatus.OK, responseData: data });
  };

  getSettlementAutomation = async (req: Request, res: Response) => {
    const q = req.query as Record<string, string | undefined>;
    const parsed = appSchema.crm.orderReports.OrderReportsSettlementQuerySchema.safeParse({
      from: q.from,
      to: q.to,
      paymentId: q.paymentId,
      batchId: q.batchId,
    });
    if (!parsed.success) {
      throw new AppError("Invalid query", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "ORDER_REPORTS_VALIDATION",
      });
    }
    const data = await this.service.getSettlementAutomation(parsed.data);
    return res.sendResponse({ statusCode: HttpStatus.OK, responseData: data });
  };

  getLifecycle = async (req: Request, res: Response) => {
    const q = req.query as Record<string, string | undefined>;
    const parsed = appSchema.crm.orderReports.OrderReportsLifecycleQuerySchema.safeParse({
      from: q.from,
      to: q.to,
      paymentStatus: q.paymentStatus,
      status: q.status,
      isin: q.isin,
      customerId: q.customerId,
      email: q.email,
      userType: q.userType,
      kycStatus: q.kycStatus,
      page: q.page,
      limit: q.limit,
    });
    if (!parsed.success) {
      throw new AppError("Invalid query", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "ORDER_REPORTS_VALIDATION",
      });
    }
    const d = parsed.data;
    const data = await this.service.getLifecycle(
      {
        from: d.from,
        to: d.to,
        paymentStatus: d.paymentStatus,
        status: d.status,
        isin: d.isin,
        customerId: d.customerId,
        email: d.email,
        userType: d.userType,
        kycStatus: d.kycStatus,
      },
      d.page,
      d.limit,
    );
    return res.sendResponse({ statusCode: HttpStatus.OK, responseData: data });
  };

  getRmPerformance = async (req: Request, res: Response) => {
    const q = req.query as Record<string, string | undefined>;
    const parsed = appSchema.crm.orderReports.OrderReportsRmPerformanceQuerySchema.safeParse({
      from: q.from,
      to: q.to,
      paymentStatus: q.paymentStatus,
      status: q.status,
      isin: q.isin,
      customerId: q.customerId,
      email: q.email,
      userType: q.userType,
      kycStatus: q.kycStatus,
    });
    if (!parsed.success) {
      throw new AppError("Invalid query", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "ORDER_REPORTS_VALIDATION",
      });
    }
    const d = parsed.data;
    const data = await this.service.getRmPerformance({
      from: d.from,
      to: d.to,
      paymentStatus: d.paymentStatus,
      status: d.status,
      isin: d.isin,
      customerId: d.customerId,
      email: d.email,
      userType: d.userType,
      kycStatus: d.kycStatus,
    });
    return res.sendResponse({ statusCode: HttpStatus.OK, responseData: data });
  };

  getRegisterExport = async (req: Request, res: Response) => {
    const { filters } = parseFilters(req);
    const rows = await this.service.getRegisterCsvRows(filters, MAX_CSV_ROWS);
    const headerLabels = [
      "Order Number",
      "Created At",
      "Payment Status",
      "Status",
      "Customer ID",
      "Customer Email",
      "ISIN",
      "Bond Name",
      "Quantity",
      "Total Amount",
    ];
    const esc = (v: string | number) => {
      const s = String(v);
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const lines = [
      headerLabels.join(","),
      ...rows.map((r) =>
        [
          esc(r.orderNumber),
          esc(r.createdAt),
          esc(getPaymentStatusLabel(r.paymentStatus)),
          esc(getOrderStatusLabel(r.status)),
          r.customerId,
          esc(r.customerEmail),
          esc(r.isin),
          esc(r.bondName),
          r.quantity,
          esc(r.totalAmount),
        ].join(","),
      ),
    ];
    const csv = `${lines.join("\n")}\n`;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="order-register-${filters.from}-to-${filters.to}.csv"`,
    );
    return res.status(200).send(csv);
  };
}
