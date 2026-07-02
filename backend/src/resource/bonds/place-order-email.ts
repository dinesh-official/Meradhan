import { db } from "@core/database/database";
import { appSchema, getEmailSalutationFromSources } from "@root/schema";
import {
    computeBondOrderPricingData,
    getLastNextCouponDateBasedOnSettlementDate,
} from "@services/order/order-pricing-helper";
import type { z } from "zod";

const MONTH_ABBREV = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
] as const;

/** Renders e.g. `2026-04-06` as `06-Apr-2026` (avoids UTC shift from `Date` parsing). */
export function formatDealDateForEmail(dealDate: string | Date | null | undefined): string {
    if (dealDate == null || dealDate === "") {
        return "—";
    }
    if (dealDate instanceof Date) {
        if (Number.isNaN(dealDate.getTime())) {
            return "—";
        }
        const dd = String(dealDate.getDate()).padStart(2, "0");
        return `${dd}-${MONTH_ABBREV[dealDate.getMonth()]}-${dealDate.getFullYear()}`;
    }
    const trimmed = dealDate.trim();
    const ymd = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
    if (ymd) {
        const y = Number(ymd[1]);
        const m = Number(ymd[2]) - 1;
        const day = Number(ymd[3]);
        if (
            Number.isFinite(y) &&
            m >= 0 &&
            m < 12 &&
            Number.isFinite(day) &&
            day >= 1 &&
            day <= 31
        ) {
            const d = new Date(y, m, day);
            if (d.getFullYear() === y && d.getMonth() === m && d.getDate() === day) {
                const dd = String(day).padStart(2, "0");
                return `${dd}-${MONTH_ABBREV[m]}-${y}`;
            }
        }
    }
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
        const dd = String(parsed.getDate()).padStart(2, "0");
        return `${dd}-${MONTH_ABBREV[parsed.getMonth()]}-${parsed.getFullYear()}`;
    }
    return trimmed;
}

function formatPercent2(value: unknown): string {
    const n = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(n)) {
        return String(value ?? "");
    }
    return n.toFixed(2);
}

function formatInrCurrency(value: number | null | undefined): string {
    const n = Number(value);
    if (!Number.isFinite(n)) {
        return "—";
    }
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(n);
}

function formatInrNumber(value: number | null | undefined, digits = 2): string {
    const n = Number(value);
    if (!Number.isFinite(n)) {
        return "—";
    }
    return new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    }).format(n);
}

function amountToWords(amount: number): string {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = [
        "Ten",
        "Eleven",
        "Twelve",
        "Thirteen",
        "Fourteen",
        "Fifteen",
        "Sixteen",
        "Seventeen",
        "Eighteen",
        "Nineteen",
    ];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    function convertHundreds(num: number): string {
        if (num === 0) return "";
        let result = "";
        if (num >= 100) {
            result += `${ones[Math.floor(num / 100)]} Hundred `;
            num %= 100;
        }
        if (num >= 20) {
            result += `${tens[Math.floor(num / 10)]} `;
            num %= 10;
        } else if (num >= 10) {
            return `${result}${teens[num - 10]}`.trim();
        }
        if (num > 0) result += ones[num];
        return result.trim();
    }

    const absAmount = Math.abs(amount);
    if (absAmount === 0) return "Rs. Zero Only";

    let rupees = Math.floor(absAmount);
    const paise = Math.round((absAmount - rupees) * 100);
    const parts: string[] = [];

    if (rupees >= 10000000) {
        const crore = Math.floor(rupees / 10000000);
        const word = convertHundreds(crore);
        if (word) parts.push(`${word} Crore`);
        rupees %= 10000000;
    }
    if (rupees >= 100000) {
        const lakh = Math.floor(rupees / 100000);
        const word = convertHundreds(lakh);
        if (word) parts.push(`${word} Lakh`);
        rupees %= 100000;
    }
    if (rupees >= 1000) {
        const thousand = Math.floor(rupees / 1000);
        const word = convertHundreds(thousand);
        if (word) parts.push(`${word} Thousand`);
        rupees %= 1000;
    }
    if (rupees > 0) {
        const word = convertHundreds(rupees);
        if (word) parts.push(word);
    }

    const rupeesText = parts.join(" ").replace(/\s+/g, " ").trim();
    if (paise > 0) {
        return `Rs. ${rupeesText} And ${convertHundreds(paise)} Paise Only`;
    }
    return `Rs. ${rupeesText} Only`;
}

async function resolveOrderPricing(
    orderData: z.infer<typeof appSchema.bonds.orderPlaceSchema>,
    bond: {
        faceValue: number;
        couponRate: unknown;
        sellPrice: number | null;
        lastCouponDate: Date | null;
        nextCouponDate: Date | null;
        recordDays: number | null;
    },
) {
    let lastCouponDateStr = bond.lastCouponDate?.toISOString() ?? null;
    let nextCouponDateStr = bond.nextCouponDate?.toISOString() ?? null;
    let recordDays =
        typeof bond.recordDays === "number" && !Number.isNaN(bond.recordDays) ? bond.recordDays : 7;

    if (!lastCouponDateStr || !nextCouponDateStr) {
        const couponDates = await getLastNextCouponDateBasedOnSettlementDate(orderData.isin, new Date());
        lastCouponDateStr = couponDates.lastCouponDate;
        nextCouponDateStr = couponDates.nextCouponDate;
        if (couponDates.recordDays != null && Number.isFinite(couponDates.recordDays)) {
            recordDays = couponDates.recordDays;
        }
    }

    if (!lastCouponDateStr || !nextCouponDateStr) {
        return null;
    }

    return await computeBondOrderPricingData(
        {
            isin: orderData.isin,
            faceValue: bond.faceValue,
            quantity: orderData.quantity,
            cleanPrice: bond.sellPrice ?? 0,
            couponRate: Number(bond.couponRate),
            lastCouponDate: lastCouponDateStr,
            recordDays,
            nextCouponDate: nextCouponDateStr,
        },
        { settlementType: orderData.settlementType },
    );
}

export function placeOrderEmailCustomerSubject(
    orderData: z.infer<typeof appSchema.bonds.orderPlaceSchema>,
): string {
    const dealDateLabel = formatDealDateForEmail(orderData.dealDate);
    return `RFQ Order Confirmation Required – ${orderData.isin} Deal Date ${dealDateLabel}`;
}

export const placeOrderEmailCustomer = async (orderData: z.infer<typeof appSchema.bonds.orderPlaceSchema>) => {
    const customer = await db.dataBase.customerProfileDataModel.findUnique({
        where: { id: orderData.customerProfileId },
        include: {
            panCard: { select: { gender: true } },
            aadhaarCard: { select: { gender: true } },
        },
    });
    if (!customer) {
        throw new Error(`Customer with ID ${orderData.customerProfileId} not found`);
    }
    const bond = await db.dataBase.bonds.findUnique({
        where: { isin: orderData.isin },
    });
    if (!bond) {
        throw new Error(`Bond with ISIN ${orderData.isin} not found`);
    }

    const pricing = await resolveOrderPricing(orderData, bond);
    const fullName = `${customer.firstName} ${customer.lastName}`.trim();
    const salutation = getEmailSalutationFromSources(customer);
    const dealDateLabel = formatDealDateForEmail(orderData.dealDate);
    const settlementDateLabel = pricing
        ? formatDealDateForEmail(pricing.settlementDate)
        : formatDealDateForEmail(orderData.dealDate);
    const maturityLabel = formatDealDateForEmail(bond.maturityDate);
    const lastIpLabel = pricing ? formatDealDateForEmail(pricing.lastCouponDate) : "—";

    const faceValue = bond.faceValue ?? orderData.faceValue;
    const quantum = faceValue * orderData.quantity;
    const cleanPrice = pricing?.cleanPrice ?? bond.sellPrice ?? 0;
    const principalAmount = pricing?.principalAmount ?? orderData.faceValue * orderData.quantity;
    const accruedInterest = pricing?.accruedInterest ?? 0;
    const accrualDays = pricing?.noOfAccrualDays ?? 0;
    const stampDuty = pricing?.stampDuty ?? 0;
    const totalConsideration = Number(principalAmount) + Number(accruedInterest);
    const settlementAmount = pricing?.settlementAmount ?? orderData.settlementAmount;
    const ytm = orderData.yield;

    const detailsBlock = [
        ["Security Name", bond.bondName],
        ["ISIN", bond.isin],
        ["Deal Date", dealDateLabel],
        ["Settlement Date", settlementDateLabel],
        ["Maturity", maturityLabel],
        ["Coupon Rate", `${formatPercent2(bond.couponRate ?? orderData.couponRate)}%`],
        ["Face Value", formatInrCurrency(faceValue)],
        ["Quantity", String(orderData.quantity)],
        ["Quantum", formatInrCurrency(quantum)],
        ["Clean Price", `INR ${formatInrNumber(cleanPrice, 4)}`],
        ["YTM Ann", `${formatPercent2(ytm)}%`],
        ["Last IP Date", lastIpLabel],
        ["Principal Amount", formatInrCurrency(Number(principalAmount))],
        [
            "Accrued / Ex Interest",
            `${formatInrCurrency(Number(accruedInterest))} (No. of Days: ${accrualDays})`,
        ],
        ["Total Consideration", formatInrCurrency(totalConsideration)],
        ["Stamp Duty", formatInrNumber(Number(stampDuty), 2)],
        ["Settlement Amount", formatInrCurrency(Number(settlementAmount))],
        ["Amount in Words", amountToWords(Number(settlementAmount))],
    ]
        .map(([label, value]) => `${label}\n${value}`)
        .join("\n\n");

    return `Dear ${salutation} ${fullName},

Thank you for placing your buy order on BondNest Capital India Securities Private Limited (MeraDhan). Your order request has been recorded successfully and is currently pending confirmation.

To proceed with the order placement, kindly reply to this email with the following confirmation text before 4:30pm IST on ${dealDateLabel}:

"I confirm the above order details and authorize BondNest Capital India Securities Private Limited (MeraDhan) to proceed with the order placement on the RFQ Platform."

The transaction details are provided below for your review:

${detailsBlock}

Please note:

This transaction is expected to be settled on a ${orderData.settlementType} basis.
The order will be processed only upon receipt of your confirmation through the registered email address.
The Order Receipt will be generated after successful placement of the order on the RFQ Platform of the Stock Exchange(s).
The Order Receipt merely indicates the intention of the parties to enter into a transaction. It should not be construed as a Deal Confirmation.
The Deal Sheet will be issued only upon successful settlement of the transaction.
Please ensure that the payment is made only from the bank account that you have registered and verified on the MeraDhan platform. Payments made from any other bank account may result in trade settlement failure.
Kindly ensure that the funds are transferred via NEFT/RTGS to the NSCCL Account maintained with HDFC Bank or RBI, as applicable.

For any assistance, please contact us at backoffice@meradhan.co.

Note: Kindly ensure that the Demat Account verified on our platform is active for the receipt of Bonds/Securities. The same account details will be captured in the Order Receipt upon placement of the order.

Best regards,
MeraDhan Team

Disclaimer: Fixed returns do not constitute guaranteed or assured returns. Investments in corporate debt securities, municipal debt securities/securitised debt instruments are subject to credit risks, market risks and default risks including delay and/or default in payment. Read all the offer related documents carefully.

BondNest Capital India Securities Private Limited operates the MeraDhan platform as an Online Bond Platform Provider (OBPP).
SEBI Registration No.: INZ000330234
NSE Member ID: 90480
BSE Member ID: 6963`;
};

export const sendPlaceOrderEmail = async (orderData: z.infer<typeof appSchema.bonds.orderPlaceSchema>) => {
    const customer = await db.dataBase.customerProfileDataModel.findUnique({
        where: { id: orderData.customerProfileId },
    });
    if (!customer) {
        throw new Error(`Customer with ID ${orderData.customerProfileId} not found`);
    }
    const bond = await db.dataBase.bonds.findUnique({
        where: { isin: orderData.isin },
    });
    if (!bond) {
        throw new Error(`Bond with ISIN ${orderData.isin} not found`);
    }
    const fullName = customer.firstName + " " + customer.lastName;
    return `Dear Team,

A new order request has been received on MeraDhan.

Please find attached the draft order receipt for reference. The same has been created as a lead in the CRM. Kindly connect with the customer at the earliest to assist with the next steps.

Order Details
Customer Name: ${fullName}
Registered Email: ${customer.emailAddress}
Registered Mobile: ${customer.phoneNo}
Bond: ${bond.bondName}
ISIN: ${bond.isin}
Quantity: ${orderData.quantity}
Order Value: ₹ ${orderData.faceValue * orderData.quantity}
Request Date & Time: ${orderData.requestDate}

Please ensure timely follow-up and update the status internally once contacted.

Regards,

MeraDhan System`;

};
