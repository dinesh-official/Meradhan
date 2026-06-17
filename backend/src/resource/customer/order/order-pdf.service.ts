import { generateTempOrderPdf } from "@packages/kyc-providers";
import { formatDate } from "@packages/kyc-providers/pdf/helper";
import { BondService } from "@resource/bonds/bond.service";
import { CustomerProfileRepo } from "@resource/crm/customers/customer.repo";
import { RfqMasterService } from "@resource/crm/refq/nse/rfq_master/rfq_master.service";
import {
  computeBondOrderPricingData,
  getLastCouponDate,
  getLastNextCouponDateBasedOnSettlementDate,
  getPayoutDates,
} from "@services/order/order-pricing-helper";
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

    let lastCouponDateStr = bond.lastCouponDateIst?.toISOString() ?? null;
    let nextCouponDateStr = bond.nextCouponDateIst?.toISOString() ?? null;
    let recordDays =
      typeof bond.recordDays === "number" && !Number.isNaN(bond.recordDays)
        ? bond.recordDays
        : 7;

    if (!lastCouponDateStr || !nextCouponDateStr) {
      const couponDates = await getLastNextCouponDateBasedOnSettlementDate(
        isin,
        new Date(),
      );
      lastCouponDateStr = couponDates.lastCouponDate;
      nextCouponDateStr = couponDates.nextCouponDate;
      if (couponDates.recordDays != null && Number.isFinite(couponDates.recordDays)) {
        recordDays = couponDates.recordDays;
      }
    }

    if (!lastCouponDateStr || !nextCouponDateStr) {
      throw new AppError(
        "Bond is missing lastCouponDate or nextCouponDate required for order pricing",
        { statusCode: HttpStatus.BAD_REQUEST }
      );
    }

    const cleanPrice = bond.sellPrice ?? 0;

    const pricing = await computeBondOrderPricingData({
      isin: bond.isin,
      faceValue: bond.faceValue,
      quantity,
      cleanPrice: cleanPrice ?? 0,
      couponRate: Number(bond.couponRate),
      lastCouponDate: lastCouponDateStr,
      recordDays,
      nextCouponDate: nextCouponDateStr,
    });
    let settlementNumber = "--";

    try {
      const st = await this.rfqMasterService.getSettlementNo(
        pricing.settlementDate
      );
      settlementNumber = st.settlementNo;
    } catch (error) {
      //2026-05-06 -> 2605006 create this formrated 
      const [yyyy, mm, dd] = pricing.settlementDate.trim().split("-");
      if (!yyyy || !mm || !dd) return "";
      const yy = yyyy.slice(-2);
      settlementNumber = `${yy}${mm.padStart(2, "0")}0${dd.padStart(2, "0")}`;
      console.log("SETTLEMENT NUMBER ERROR", error);
    }
    console.log(pricing.settlementDate);

    const interestPaymentDates = await getPayoutDates(bond.isin, new Date(pricing.settlementDate ?? ""));
    const lastPaymentDate = await getLastCouponDate(bond.isin, new Date());

    const orderData = {
      price: pricing.cleanPrice,
      subTotal: pricing.principalAmount,
      stampDuty: pricing.stampDuty,
      totalAmount: pricing.principalAmount + pricing.accruedInterest,
      createdAt: new Date(pricing.dealDate).toISOString(),
      metadata: {
        lastInterestPaymentDate: lastPaymentDate,
        valueDate: pricing.dealDate,
        accruedInterest: pricing.accruedInterest,
        accruedInterestDays: pricing.noOfAccrualDays,
        settlementDate: pricing.settlementDate,
        settlementNumber: settlementNumber,
        orderType: "One to One (OTO) on RFQ Platform of the Exchange",
        // Required by PDF generator typing
        settlementType: 1,
        interestPaymentDates: interestPaymentDates,
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
      orderData: {
        ...orderData,
        subTotal: Number(orderData?.subTotal ?? 0),
        stampDuty: Number(orderData?.stampDuty ?? 0),
        totalAmount: Number(orderData?.totalAmount ?? 0),
      },
    });
  }
}
