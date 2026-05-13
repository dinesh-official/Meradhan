import { db } from "@core/database/database"
import { ApiError } from "@packages/apiGateway";
import { env } from "@packages/config/src/env";
import axios from "axios";

type RazorpayStakeholderResponse = {
    id: string; // sth_...
    entity?: string;
    relationship?: unknown;
    phone?: unknown;
    notes?: unknown;
    kyc?: { pan?: string } | unknown;
    name?: string;
    email?: string;
    percentage_ownership?: number;
    addresses?: unknown;
};

const getDefaultRpAccount = async () => {
    const record = await db.dataBase.razorpayRouteAccount.findFirst({
        where: {
            isDefault: true
        }
    });
    if (!record) {
        throw new ApiError("default razorpay route account not defined")
    }
    return record;
}

const getExistingStockholder = async (userid: number, accountId: string) => {
    const record = await db.dataBase.razorpayRouteStakeholder.findFirst({
        where: {
            userId: userid,
            razorpayAccountId: accountId
        }
    });

    return record;
}

const payloadStackHolderRazorpay = async (userId: number) => {
    const user = await db.dataBase.customerProfileDataModel.findUnique({
        where: {
            id: userId
        },
        include: {
            currentAddress: true,
            permanentAddress: true,
            aadhaarCard: true,
            dematAccounts: true,
            bankAccounts: true,
            panCard: true,
            utility: true,
        }
    })
    const name = [
        user?.firstName,
        user?.middleName,
        user?.lastName
    ]
        .filter(Boolean)        // removes undefined, null, "", false
        .join(" ");
    const payload = {
        "name": name,
        "email": user?.emailAddress,
        "addresses": {
            "residential": {
                "street": user?.currentAddress?.line1,
                "city": user?.currentAddress?.postOffice,
                "state": user?.currentAddress?.state,
                "postal_code": user?.currentAddress?.pinCode,
                "country": "IN"
            }
        },
        "kyc": {
            "pan": user?.panCard?.panCardNo
        },
        "notes": {
            "id": user?.id,
        }
    }
    return payload;
}

const initializeStackHolder = async (accountId: string, userId: number) => {
    const existing = await getExistingStockholder(userId, accountId);
    const payload = await payloadStackHolderRazorpay(userId);

    if (!existing) {
        return await createStackHolder(accountId, payload)
    }
    return await updateStackHolder(accountId, existing.razorpayStakeholderId, payload)
}

const syncStakeholderToDb = async (input: {
    razorpayAccountId: string;
    razorpay: RazorpayStakeholderResponse;
    userId?: number;
}) => {
    const created = input.razorpay;

    const userIdFromNotes =
        created &&
            typeof created === "object" &&
            created.notes &&
            typeof created.notes === "object" &&
            "id" in (created.notes as Record<string, unknown>) &&
            typeof (created.notes as Record<string, unknown>).id === "number"
            ? ((created.notes as Record<string, unknown>).id as number)
            : undefined;

    const kycPan =
        created &&
            typeof created === "object" &&
            "kyc" in created &&
            created.kyc &&
            typeof created.kyc === "object" &&
            "pan" in (created.kyc as Record<string, unknown>) &&
            typeof (created.kyc as Record<string, unknown>).pan === "string"
            ? ((created.kyc as Record<string, unknown>).pan as string)
            : undefined;

    const userId = typeof input.userId === "number" ? input.userId : userIdFromNotes;

    const record = await db.dataBase.razorpayRouteStakeholder.upsert({
        where: { razorpayStakeholderId: created.id },
        update: {
            razorpayAccountId: input.razorpayAccountId,
            ...(typeof userId === "number" ? { userId } : {}),
            entity: created.entity ?? "stakeholder",
            name: created.name ?? "",
            email: created.email ?? null,
            kycPan,
            percentageOwnership:
                typeof created.percentage_ownership === "number"
                    ? Math.trunc(created.percentage_ownership)
                    : null,
            relationship: (created.relationship ?? null) as unknown as object,
            phone: (created.phone ?? null) as unknown as object,
            notes: (created.notes ?? null) as unknown as object,
            kyc: (created.kyc ?? null) as unknown as object,
            addresses: (created.addresses ?? null) as unknown as object,
            data: created as unknown as object,
        },
        create: {
            razorpayStakeholderId: created.id,
            razorpayAccountId: input.razorpayAccountId,
            userId: typeof userId === "number" ? userId : null,
            entity: created.entity ?? "stakeholder",
            name: created.name ?? "",
            email: created.email ?? null,
            kycPan,
            percentageOwnership:
                typeof created.percentage_ownership === "number"
                    ? Math.trunc(created.percentage_ownership)
                    : null,
            relationship: (created.relationship ?? null) as unknown as object,
            phone: (created.phone ?? null) as unknown as object,
            notes: (created.notes ?? null) as unknown as object,
            kyc: (created.kyc ?? null) as unknown as object,
            addresses: (created.addresses ?? null) as unknown as object,
            data: created as unknown as object,
        },
    });

    return record;
};

const createStackHolder = async (accountId: string, payload: any, userId?: number) => {

    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
        throw new ApiError("Razorpay credentials not configured");
    }

    const authHeader = Buffer.from(
        `${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`
    ).toString("base64");
    console.log("Creating New Merchant");
    const { data } = await axios.post<RazorpayStakeholderResponse>(
        `https://api.razorpay.com/v2/accounts/${accountId}/stakeholders`,
        payload,
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${authHeader}`,
            },
            timeout: 60_000,
        }
    );

    const record = await syncStakeholderToDb({
        razorpayAccountId: accountId,
        razorpay: data,
        userId,
    });

    return { razorpay: data, record };
}


const updateStackHolder = async (
    accountId: string,
    stockholderId: string,
    payload: any,
    userId?: number
) => {
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
        throw new ApiError("Razorpay credentials not configured");
    }

    const authHeader = Buffer.from(
        `${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`
    ).toString("base64");

    const { data } = await axios.patch<RazorpayStakeholderResponse>(
        `https://api.razorpay.com/v2/accounts/${(accountId)}/stakeholders/${stockholderId}`,
        payload,
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${authHeader}`,
            },
            timeout: 60_000,
        }
    );

    const record = await syncStakeholderToDb({
        razorpayAccountId: accountId,
        razorpay: data,
        userId,
    });

    return { razorpay: data, record };
}

const initProductConfig = async (razorpayAccountId: string) => {
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
        throw new ApiError("Razorpay credentials not configured");
    }

    const authHeader = Buffer.from(
        `${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`
    ).toString("base64");


    const { data } = await axios.post<RazorpayRouteProductConfigResponse>(
        `https://api.razorpay.com/v2/accounts/${(razorpayAccountId)}/products`,
        {
            product_name: "route",
            tnc_accepted: true,
        },
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${authHeader}`,
            },
            timeout: 60_000,
        }
    );

    return data;
}

type RazorpayRouteProductUpdatePayload = {
    settlements: {
        account_number: string;
        ifsc_code: string;
        beneficiary_name: string;
    };
    tnc_accepted: true;
};

export type RazorpayRouteProductConfigResponse = {
    requested_configuration?: unknown[];
    active_configuration?: {
        settlements?: {
            account_number?: string;
            ifsc_code?: string;
            beneficiary_name?: string;
        };
    };
    requirements?: Array<{
        field_reference: string;
        resolution_url?: string;
        reason_code?: string;
        status?: "required" | "optional" | string;
    }>;
    tnc?: {
        id: string;
        accepted: boolean;
        accepted_at?: number;
    };
    id: string; // acc_prd_...
    account_id: string; // acc_...
    product_name: "route" | string;
    activation_status?: string;
    requested_at?: number;
};

const updateProductConfig = async (accountId: string, input: {
    /** Razorpay product id, e.g. `acc_prd_...` */
    productId: string;
    settlements: RazorpayRouteProductUpdatePayload["settlements"];
}) => {
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
        throw new ApiError("Razorpay credentials not configured");
    }

    const authHeader = Buffer.from(
        `${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`
    ).toString("base64");


    const payload: RazorpayRouteProductUpdatePayload = {
        settlements: input.settlements,
        tnc_accepted: true,
    };
    console.log(payload);

    const { data } = await axios.patch<RazorpayRouteProductConfigResponse>(
        `https://api.razorpay.com/v2/accounts/${encodeURIComponent(accountId)}/products/${encodeURIComponent(input.productId)}`,
        payload,
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${authHeader}`,
            },
            timeout: 60_000,
        }
    );

    return data;
}

export type RazorpayTransferInput = {
    account: string;
    amount: number;
    currency: "INR" | string;
    notes?: Record<string, string>;
    linked_account_notes?: string[];
    on_hold?: boolean;
    on_hold_until?: number;
};

export const createTransfer = async (input: {
    /** Razorpay payment id, e.g. `pay_...` */
    paymentId: string;
    transfers: RazorpayTransferInput[];
}) => {
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
        throw new ApiError("Razorpay credentials not configured");
    }

    const authHeader = Buffer.from(
        `${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`
    ).toString("base64");

    try {
        const { data } = await axios.post(
            `https://api.razorpay.com/v1/payments/${encodeURIComponent(input.paymentId)}/transfers`,
            { transfers: input.transfers },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${authHeader}`,
                },
                timeout: 60_000,
            }
        );
        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

const getSettlementBackAccount = async () => {
    const account = await db.dataBase.razorpayRouteSettlementAccount.findFirst({
        where: {
            isDefault: true
        }
    })
    if (!account) {
        throw new ApiError("razorpayRouteSettlementAccount not configured")
    }
    return account;
}

export const makeRazorpayRouteTransition = async ({ payId, userId, amount, notes }: { payId: string, userId: number, amount: number, notes?: Record<string, any> }) => {
    const transfer = await createTransfer({
        paymentId: payId,
        transfers: [
            {
                account: env.RAZORPAY_ROUTE_ACCOUNT_ID,
                amount: Math.round(amount * 100),
                currency: "INR",
                notes: {
                    ...notes,
                    "USER_ID": userId.toString(),
                },
                "on_hold": false
            }
        ]
    })
    console.log("transfers task completed | Count - ", transfer?.count)
    try {
        await db.dataBase.order.updateMany({
            where: {
                paymentId: payId
            },
            data: {
                transferId: transfer?.items?.[0]?.id
            }
        })
    } catch (error) {
        console.log(error);
    }
    return transfer;
}