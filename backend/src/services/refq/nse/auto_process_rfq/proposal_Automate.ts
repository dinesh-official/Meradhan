import { db } from "@core/database/database";
import type { Prisma } from "@databases/generated/prisma/postgres";
import {
    generateOrderId,
    generateDealId,
} from "@resource/customer/order/order.utils";
import type { RfqAutoDataPayLoad } from "./rfq_auto_process";
import { AutoRfqBuyFlow } from "./rfq_auto_process";
import { sendOrderReceiptPdfByOrderId } from "@services/notifications/send_deal_sheet_nyOrderId";
import crypto from "crypto";
import type { AxiosError } from "axios";

export type OrderBondPricing = {
    dealDay: string
    dealDate: string
    quantity: number
    dealOrder: string
    faceValue: number
    stampDuty: number
    allowTrade: boolean
    cleanPrice: number
    couponRate: number
    recordDate: string
    recordDays: number
    settlementDay: string
    lastCouponDate: string
    nextCouponDate: string
    settlementDate: string
    accruedInterest: number
    allowSettlement: string[]
    noOfAccrualDays: number
    principalAmount: number
    settlementOrder: string
    settlementAmount: number
    isUnderShutPeriod: boolean
}

export type OrderBondDetails = {
    id: number
    isin: string
    yield: number
    endDate: string | null
    endDateIst: string | null
    remarks: string
    bondName: string
    bondType: string | null
    buyPrice: number | null
    buyYield: number | null
    isListed: string
    sortedAt: number
    createdAt: string
    faceValue: number
    sellPrice: number
    seniority: string | null
    startDate: string | null
    startDateIst: string | null
    taxStatus: string
    updatedAt: string
    categories: string[]
    couponRate: number
    couponType: string
    issuePrice: number
    ratingDate: string | null
    ratingDateIst: string | null
    recordDate: string
    recordDateIst: string | null
    recordDays: number
    sectorName: string
    description: string
    isPerpetual: boolean | null
    creditRating: string
    maturityDate: string
    maturityDateIst: string | null
    maturityDateOnly: string | null
    providerName: string | null
    dayConvention: string
    isOngoingDeal: boolean
    providerPrice: number | null
    allCouponDates: string[]
    allCouponDatesIst: string[]
    imDocumentLink: string | null
    instrumentName: string
    lastCouponDate: string
    lastCouponDateIst: string | null
    lastTradePrice: number | null
    lastTradeYield: number | null
    modeOfIssuance: string
    nextCouponDate: string
    nextCouponDateIst: string | null
    redemptionDate: string
    redemptionDateIst: string | null
    redemptionType: string | null
    totalIssueSize: number
    dateOfAllotment: string
    dateOfAllotmentIst: string | null
    isConvertedDeal: boolean | null
    allowForPurchase: boolean
    creditRatingInfo: string
    debentureTrustee: string
    exchangeListedOn: string | null
    ignoreAutoUpdate: boolean
    providerQuantity: number | null
    ratingAgencyName: string
    registrarDetails: string
    certificateNumbers: string
    natureOfInstrument: string | null
    interestPaymentMode: string
    stampDutyPercentage: number
    providerInterestDate: string | null
    providerInterestDateIst: string | null
    putCallOptionDetails: string
    defaultedInRedemption: string
    physicalSecurityAddress: string
    interestPaymentFrequency: string
    pricing: OrderBondPricing
}

export type OrderRazorpayMetadata = {
    id: string
    fee: number
    tax: number
    vpa: string | null
    bank: string | null
    email: string
    notes: {
        CC_Name?: string
        Client_ID?: string
        Member_ID?: string
        Client_IFSC?: string
        Client_Name?: string
        Client_Account?: string
        Transaction_Type?: string
        [key: string]: string | undefined
    }
    amount: number
    dealId: string
    entity: string
    method: string
    reward: string | null
    status: string
    wallet: string | null
    card_id: string | null
    contact: string
    captured: boolean
    currency: string
    order_id: string
    created_at: number
    error_code: string | null
    error_step: string | null
    invoice_id: string | null
    base_amount: number
    description: string
    error_reason: string | null
    error_source: string | null
    acquirer_data: Record<string, string>
    international: boolean
    refund_status: string | null
    amount_refunded: number
    error_description: string | null
    proposalId?: string
    side?: string
    settlementType?: string
    manualYieldEnabled?: boolean
    manualYield?: string
}

type PRPOSALDATA = {
    id: string
    isin: string
    side: string
    notes: string
    fetched: {
        bond: {
            id: number
            isin: string
            yield: number
            endDate: any
            remarks: string
            bondName: string
            bondType: any
            buyPrice: any
            buyYield: any
            isListed: string
            sortedAt: number
            createdAt: string
            faceValue: number
            sellPrice: number
            seniority: any
            startDate: any
            taxStatus: string
            updatedAt: string
            categories: Array<string>
            couponRate: number
            couponType: string
            issuePrice: number
            ratingDate: any
            recordDate: string
            recordDays: number
            sectorName: string
            description: string
            isPerpetual: any
            creditRating: string
            maturityDate: string
            providerName: any
            dayConvention: string
            isOngoingDeal: boolean
            providerPrice: any
            allCouponDates: Array<any>
            imDocumentLink: any
            instrumentName: string
            lastCouponDate: string
            lastTradePrice: any
            lastTradeYield: any
            modeOfIssuance: string
            nextCouponDate: string
            redemptionDate: string
            redemptionType: any
            totalIssueSize: number
            dateOfAllotment: string
            isConvertedDeal: any
            allowForPurchase: boolean
            creditRatingInfo: string
            debentureTrustee: string
            exchangeListedOn: any
            ignoreAutoUpdate: boolean
            providerQuantity: any
            ratingAgencyName: string
            registrarDetails: string
            certificateNumbers: string
            natureOfInstrument: any
            interestPaymentMode: string
            stampDutyPercentage: number
            providerInterestDate: any
            putCallOptionDetails: string
            defaultedInRedemption: string
            physicalSecurityAddress: string
            interestPaymentFrequency: string
        }
        pricing: {
            dealDay: string
            dealDate: string
            quantity: number
            dealOrder: string
            faceValue: number
            stampDuty: number
            allowTrade: boolean
            cleanPrice: number
            couponRate: number
            recordDate: string
            recordDays: number
            settlementDay: string
            lastCouponDate: string
            nextCouponDate: string
            settlementDate: string
            accruedInterest: number
            allowSettlement: Array<string>
            noOfAccrualDays: number
            principalAmount: number
            settlementOrder: string
            settlementAmount: number
            isUnderShutPeriod: boolean
        }
        dealAutofill: {
            isin: string
            margin: {
                isin: string
                type: string
                yield: number
                margin: number
                rating: string
                faceValue: number
                couponRate: number
                sectorName: string
                currentYield: number
                maturityRange: string
            }
            pricing: {
                calc: {
                    cf_rows: Array<{
                        num: number
                        date: string
                        days: number
                        total: string
                        interest: string
                        principal: string
                        total_raw: number
                    }>
                    cf_count: number
                    quantity: string
                    total_ai: string
                    settle_dt: string
                    stamp_duty: string
                    final_price: string
                    final_yield: string
                    accrued_days: number
                    period_status: string
                    running_total: string
                    final_yield_raw: number
                    principal_amount: string
                    settlement_amount: string
                    total_consideration: string
                }
                finalPrice: number
                finalYieldRaw: number
                principalAmount: number
                settlementAmount: number
                totalConsideration: number
                totalAccruedInterest: number
            }
            sources: {
                yieldSource: string
                usedCouponSchedule: boolean
                usedReferenceMetadata: boolean
            }
            quantity: number
            suggested: {
                yield: number
                dueDate: string
                buyYield: number
                faceValue: number
                sellPrice: number
                couponRate: number
                recordDate: string
                recordDays: number
                maturityDate: string
                dayConvention: string
                lastCouponDate: string
                nextCouponDate: string
                dateOfAllotment: string
                interestPaymentMode: string
                interestPaymentFrequency: string
            }
        }
        pricingError: any
    }
    customer: {
        id: number
        panCard: any
        phoneNo: string
        utility: {
            lastLogin: string
            accountStatus: string
        }
        lastName: string
        userName: string
        userType: string
        createdAt: string
        createdBy: any
        firstName: string
        kraStatus: string
        kycStatus: string
        updatedAt: string
        VerifiedBy: any
        middleName: string
        verifyDate: any
        emailAddress: string
        currentKycStepName: string
    } | null
    rfqParticipant?: {
        code: string
        emailList?: string[]
        nameOverride?: string | null
    } | null
    quantity: number
    createdAt: string
    manualYield: string
    settlementType: string
    manualYieldEnabled: boolean
}

const resolveClientUccCode = async (data: PRPOSALDATA) => {
    const rfqCode = data.rfqParticipant?.code?.trim();
    if (rfqCode) {
        const info = await db.dataBase.nseRfqParticipantInfoModel.findUnique({
            where: { code: rfqCode },
        });
        if (!info) {
            throw new Error(
                `RFQ participant info not found for code "${rfqCode}"`,
            );
        }
        return {
            clientUCCCode: rfqCode,
            customerProfileId: null as number | null,
            linkedRfqParticipantCode: rfqCode,
        };
    }

    if (!data.customer?.id) {
        throw new Error("Proposal has no linked customer or RFQ participant");
    }

    const nseDataSet = await db.dataBase.nseDataSet.findUnique({
        where: { customerProfileDataModelId: data.customer.id },
        include: { participant: true },
    });
    if (!nseDataSet?.participant?.loginId) {
        throw new Error(
            `Customer ${data.customer.id} has no NSE participant (UCC) registered`,
        );
    }

    return {
        clientUCCCode: nseDataSet.participant.loginId,
        customerProfileId: data.customer.id,
        linkedRfqParticipantCode: null as string | null,
    };
};

const createOrderFromProposal = async (data: PRPOSALDATA): Promise<{
    order: Awaited<ReturnType<typeof db.dataBase.order.update>>;
    rfqPayload: RfqAutoDataPayLoad;
}> => {
    const pricing = data.fetched.pricing;
    const bond = data.fetched.bond;
    const action = data.side.toUpperCase() === "SELL" ? "SELL" : "BUY";
    const bondName = bond.bondName || bond.instrumentName;

    const { clientUCCCode, customerProfileId, linkedRfqParticipantCode } =
        await resolveClientUccCode(data);

    const settlementType: 0 | 1 = data.settlementType === "T+0" ? 0 : 1;
    const yieldValue = data.manualYieldEnabled ? parseFloat(data.manualYield) : bond.yield;

    const tempOrderNumber = `MD-ASSIST-TEMP-${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;

    const order = await db.dataBase.order.create({
        data: {
            customerProfileId,
            linkedRfqParticipantCode,
            orderNumber: tempOrderNumber,
            subTotal: pricing.principalAmount,
            stampDuty: pricing.stampDuty,
            totalAmount: pricing.settlementAmount,
            paymentStatus: "COMPLETED",
            status: "IN_PROGRESS",
            paymentProvider: "CUSTOM",
            isin: data.isin,
            bondName,
            faceValue: bond.faceValue,
            quantity: data.quantity,
            unitPrice: pricing.cleanPrice,
            bondDetails: {
                ...bond,
                pricing,
            } as unknown as OrderBondDetails as Prisma.InputJsonValue,
            metadata: {
                proposalId: data.id,
                side: data.side,
                settlementType: data.settlementType,
                manualYieldEnabled: data.manualYieldEnabled,
                manualYield: data.manualYield,
            } as unknown as OrderRazorpayMetadata as Prisma.InputJsonValue,
        },
    });

    const dealDate = new Date();
    const orderNumber = generateOrderId({
        channel: "ASSIST",
        action: action as "BUY" | "SELL",
        date: dealDate,
        orderSequence: order.id,
    });
    const dealId = generateDealId({
        issuerName: bondName,
        channel: "ASSIST",
        action: action as "BUY" | "SELL",
        date: dealDate,
        orderSequence: order.id,
    });

    const updatedOrder = await db.dataBase.order.update({
        where: { id: order.id },
        data: {
            orderNumber,
            metadata: {
                dealId,
                proposalId: data.id,
                side: data.side,
                settlementType: data.settlementType,
                manualYieldEnabled: data.manualYieldEnabled,
                manualYield: data.manualYield,
            } as unknown as OrderRazorpayMetadata as Prisma.InputJsonValue,
        },
    });

    const rfqPayload: RfqAutoDataPayLoad = {
        isin: data.isin,
        buySell: "B",
        settlementType,
        valueInCr: (pricing.faceValue * data.quantity) / 1e7,
        quantity: data.quantity,
        yield: yieldValue,
        remarks: data.notes || undefined,
        clientUCCCode,
        cleanPrice: pricing.cleanPrice,
        accruedInterestAmount: pricing.accruedInterest,
        considerationAmount: pricing.settlementAmount,
    };

    return { order: updatedOrder, rfqPayload };
};



export const proposalProcessing = async (id: number) => {
    const proposal = await db.dataBase.crmSavedProposal.findUnique({
        where: { id },
    });

    if (!proposal) {
        throw new Error(`Proposal ${id} not found`);
    }

    if (proposal.status === "CONVERTED") {
        throw new Error(`Proposal ${id} is already converted to an order`);
    }

    const proposalData = proposal.data as PRPOSALDATA;
    if (!proposalData.rfqParticipant && proposal.linkedRfqParticipantCode) {
        proposalData.rfqParticipant = { code: proposal.linkedRfqParticipantCode };
    }
    const { order, rfqPayload } = await createOrderFromProposal(proposalData);

    try {
        const rfqFlow = new AutoRfqBuyFlow(rfqPayload);
        const rfq = await rfqFlow.createAIsinRequest();
        const negotiation = await rfqFlow.acceptNegotiationRequest(rfq!.number);
        const deal = await rfqFlow.proposeDealRequest({
            ngId: negotiation.id,
            ngRfqNumber: negotiation.rfqNumber,
        });
        await rfqFlow.acceptDealRequest({
            ngId: negotiation.id,
            rfqNumber: deal.rfqNumber,
        });

        await db.dataBase.$transaction([
            db.dataBase.crmSavedProposal.update({
                where: { id },
                data: { status: "CONVERTED" },
            }),
            db.dataBase.order.update({
                where: { id: order.id },
                data: {
                    status: "IN_PROGRESS",
                    reqOrderNumber: deal.rfqNumber,
                    metadata: {
                        ...(order.metadata as object),
                        rfqNumber: deal.rfqNumber,
                        negotiationId: negotiation.id,
                    },
                },
            }),
        ]);

        const receiptEmail =
            proposalData.customer?.emailAddress?.trim() ||
            proposalData.rfqParticipant?.emailList?.find((e) => e?.trim())?.trim() ||
            null;

        if (receiptEmail) {
            await sendOrderReceiptPdfByOrderId({
                orderId: order.id,
                toEmail: receiptEmail,
            }).catch((err: unknown) => {
                console.error(
                    `Order receipt email failed for order ${order.id}:`,
                    err,
                );
            });
        }

        return {
            orderId: order.id,
            orderNumber: order.orderNumber,
            rfqNumber: deal.rfqNumber,
            negotiationId: negotiation.id,
        };
    } catch (error) {
        await db.dataBase.crmSavedProposal.update({
            where: { id },
            data: { status: "FAILED", failedNote: ((error as AxiosError)?.response?.data)?.toString() || "Failed to Proceeds Rfq Automation" },
        });
        console.log((error as AxiosError)?.response?.data || error);
    }
};