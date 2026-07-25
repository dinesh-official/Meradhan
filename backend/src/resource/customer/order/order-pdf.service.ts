import { generateTempOrderPdf } from "@root/kyc-providers/pdf";
import { BondService } from "@resource/bonds/bond.service";
import { CustomerProfileRepo } from "@resource/crm/customers/customer.repo";
import { RfqMasterService } from "@resource/crm/refq/nse/rfq_master/rfq_master.service";
import { computeStoredBondOrderPricing } from "@services/order/order-pricing-helper";
import { loadInvestorCouponScheduleForPdf } from "@services/order/investor-coupon-entitlement";
import { AppError, HttpStatus } from "@utils/error/AppError";

export type GenerateOrderPdfParams = {
  userId: number;
  isin: string;
  /** Quantity (units). Invalid or non-positive values fall back to 1. */
  qun: number;
  /** Display order id on the PDF; defaults to placeholder when omitted. */
  orderId?: string;
  isReleased?: boolean;
  requestDate?: string;
  orderData?: {
    price?: number;
    subTotal?: number;
    stampDuty?: number;
    totalAmount?: number;
    createdAt?: string;
    metadata?: { dealId?: string; rfqNumber?: string;[key: string]: unknown };
  };
};

/**
 * Builds the same bond order slip PDF as the customer `/order/pdf` route,
 * returning a temp file path suitable for `res.sendFile`.
 *
 * Pricing uses CRM-saved bond values only (scaled by quantity).
 * DeriData is not called here — that runs only in CRM autofill.
 */
export class OrderPdfService {
  private bondService = new BondService();
  private customerRepo = new CustomerProfileRepo();
  private rfqMasterService = new RfqMasterService();

  async generateTempOrderPdfFile(
    params: GenerateOrderPdfParams
  ): Promise<string> {
    const {
      userId,
      isin,
      qun: rawQun,
      orderId = "XXXXXXXX",
      isReleased = false,
      requestDate,
    } = params;

    const quantity =
      Number.isFinite(rawQun) && rawQun > 0 ? rawQun : 1;

    const bond = await this.bondService.getBondDetails(isin);
    if (!bond) {
      throw new AppError("Bond not found", {
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    let pricing: Awaited<ReturnType<typeof computeStoredBondOrderPricing>>;
    try {
      pricing = await computeStoredBondOrderPricing({
        isin: bond.isin,
        quantity,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to price order from saved bond data";
      throw new AppError(message, {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "STORED_BOND_PRICING_FAILED",
      });
    }

    let settlementNumber = "--";

    try {
      const st = await this.rfqMasterService.getSettlementNo(
        pricing.settlementDate
      );
      settlementNumber = st.settlementNo;
    } catch (error) {
      const [yyyy, mm, dd] = pricing.settlementDate.trim().split("-");
      if (yyyy && mm && dd) {
        const yy = yyyy.slice(-2);
        settlementNumber = `${yy}${mm.padStart(2, "0")}0${dd.padStart(2, "0")}`;
      }
      console.log("SETTLEMENT NUMBER ERROR", error);
    }

    const settlementForCoupons = new Date(pricing.settlementDate ?? "");
    const investorCoupons = await loadInvestorCouponScheduleForPdf(
      bond.isin,
      settlementForCoupons,
    );

    const orderData = {
      price: pricing.cleanPrice,
      subTotal: pricing.principalAmount,
      stampDuty: pricing.stampDuty,
      totalAmount: pricing.settlementAmount,
      createdAt: new Date(pricing.dealDate).toISOString(),
      bondDetails: {
        pricing,
      },
      metadata: {
        lastInterestPaymentDate: investorCoupons.lastInterestPaymentDate,
        valueDate: pricing.dealDate,
        accruedInterest: pricing.accruedInterest,
        accruedInterestDays: pricing.noOfAccrualDays,
        settlementDate: pricing.settlementDate,
        settlementNumber: settlementNumber,
        orderType: "One to One (OTO) on RFQ Platform of the Exchange",
        settlementType: 1,
        interestPaymentDates: investorCoupons.interestPaymentDates,
        settlementDateTime: new Date(requestDate || new Date()).toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Kolkata",
        }),
      },
    };

    console.log(orderData);


    const user = await this.customerRepo.getFullCustomerProfile(userId);

    return generateTempOrderPdf({
      orderId,
      isReleased,
      bond,
      qun: quantity,
      user,
      orderData: {
        ...orderData,
        subTotal: Number(orderData?.subTotal ?? 0),
        stampDuty: Number(orderData?.stampDuty ?? 0),
        totalAmount: Number(orderData?.totalAmount ?? 0),
      },
    });
  }
}
