import { generateTempOrderPdf } from "@packages/kyc-providers";
import { formatDate } from "@packages/kyc-providers/pdf/helper";
import { BondService } from "@resource/bonds/bond.service";
import { CustomerProfileRepo } from "@resource/crm/customers/customer.repo";
import { RfqMasterService } from "@resource/crm/refq/nse/rfq_master/rfq_master.service";
import { computeBondOrderPricingData } from "@services/order/order-pricing-helper";
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

    const lastCouponDateStr = bond.lastCouponDate;
    const nextCouponDateStr = bond.nextCouponDate;

    if (!lastCouponDateStr || !nextCouponDateStr) {
      throw new AppError(
        "Bond is missing lastCouponDate or nextCouponDate required for order pricing",
        { statusCode: HttpStatus.BAD_REQUEST }
      );
    }

    const cleanPrice = bond.sellPrice;

    const recordDays =
      typeof bond.recordDays === "number" && !Number.isNaN(bond.recordDays)
        ? bond.recordDays
        : 7;

    const pricing = computeBondOrderPricingData({
      faceValue: bond.faceValue,
      quantity,
      cleanPrice: cleanPrice ?? 0,
      couponRate: Number(bond.couponRate),
      lastCouponDate: (lastCouponDateStr.toISOString()),
      recordDays,
      nextCouponDate: nextCouponDateStr.toISOString(),
    });
    let settlementNumber = "--";

    try {
      const st = await this.rfqMasterService.getSettlementNo(
        pricing.settlementDate
      );
      settlementNumber = st.settlementNo;
    } catch (error) {
      console.log("SETTLEMENT NUMBER ERROR", error);
    }

    const orderData = {
      price: pricing.cleanPrice,
      subTotal: pricing.principalAmount,
      stampDuty: pricing.stampDuty,
      totalAmount: pricing.principalAmount + pricing.accruedInterest,
      createdAt: new Date(pricing.dealDate).toISOString(),
      metadata: {
        lastInterestPaymentDate: formatDate(lastCouponDateStr.toISOString(), "DD-MMM-YYYY"),
        valueDate: pricing.dealDate,
        accruedInterest: pricing.accruedInterest,
        accruedInterestDays: pricing.noOfAccrualDays,
        settlementDate: pricing.settlementDate,
        settlementNumber: settlementNumber,
        orderType: "One to One (OTO) on RFQ Platform of the Exchange",
        // Required by PDF generator typing
        settlementType: 1,
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

    const user = await this.customerRepo.getFullCustomerProfile(userId);

    return generateTempOrderPdf({
      orderId,
      isReleased,
      bond,
      qun: quantity,
      user,
      orderData,
    });
  }
}
