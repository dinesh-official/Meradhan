import { db } from "@core/database/database";
import { appSchema } from "@root/schema";
import type { z } from "zod";

export const placeOrderEmailCustomer = async (orderData: z.infer<typeof appSchema.bonds.orderPlaceSchema>) => {
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
    const email = `
Dear  ${customer.gender === "MALE" ? "Mr." : "Ms."} ${fullName}

Thank you for submitting your order request on MeraDhan. Your request has been successfully recorded.

Request Details

Bond Name: ${bond.bondName}
ISIN: ${bond.isin}
Coupon Rate: ${bond.couponRate} % p.a.
Indicative Yield: ${bond.yield} % p.a.
Quantity: ${orderData.quantity}
Investment Amount: ₹ ${orderData.settlementAmount}
Expected Deal Date: ${orderData.dealDate} (subject to confirmation)
Settlement Cycle: ${orderData.settlementType} (from deal date)
Request Date and Time: ${orderData.requestDate}

Our team will contact you shortly to assist you with the next steps, including payment and settlement.

Please note that the final order number will be generated upon successful completion of your payment.

If you have any questions in the meantime, please feel free to contact us.

Warm regards,

Team MeraDhan

Disclaimer: The above details are indicative and subject to confirmation at the time of deal execution. Fixed returns do not constitute guaranteed or assured returns. Investments in corporate debt securities, municipal debt securities/securitised debt instruments are subject to credit risks, market risks and default risks including delay and/or default in payment. Read all the offer related documents carefully.
  `;
    return email;
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
Order Value: ${orderData.settlementAmount}
Request Date & Time: ${orderData.requestDate}

Please ensure timely follow-up and update the status internally once contacted.

Regards,

MeraDhan System`;

};