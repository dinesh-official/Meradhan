import { db } from "@core/database/database";
import { env } from "@packages/config/env";
import { cacheStorage } from "@store/redis_store";
import { isAxiosError, type AxiosError } from "axios";
import { ParticipantManager } from "@services/refq/nse/cbrics_manager.service";
import type {
    KraNonIndAppReqRoot,
    T_APP_PAN_INQ,
    T_NON_INDIVIDUAL_PAN_DOWNLOAD,
} from "kyc-providers";
import { KraSDK } from "kyc-providers";
import { addKraWorkerJob, type KraWorkerJobData } from "./kraWroker.helper";
import {
    checkKraProcessCheckStatus,
} from "./CheckKraStatus";
import {
    buildCorporateKraPayload,
    type CorporateKycInputForKra,
} from "./corporateKraPayload";

const cbricsManager = new ParticipantManager();

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const TTL_72_HOURS_SEC = 72 * 60 * 60;
const RESCHEDULE_4H_MS = 4 * 60 * 60 * 1000;
const AVAILABLE_WAIT_MS = 5_000;
const MAX_RETRIES = 50;

function nowIso() {
    return new Date().toISOString();
}

function formatDDMMYYYY(date: Date): string {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}${mm}${yyyy}`;
}

/**
 * Corporate (Non-Individual) KRA worker flow.
 *
 * Implements the flowchart the user provided:
 * Enquiry -> WAITING/REGISTER/AVAILABLE/FAIL -> (download+compare+modify) -> CBRICS.
 *
 * Important: This file is intentionally isolated from `KraWorker.service.ts`
 * to avoid changing existing individual flow.
 */
export class CorporateKraWorkerService {
    private kra = new KraSDK({
        okraCdOrMiId: env.KRA_OKRA_CD_MI_ID,
        passKey: env.KRA_PASS_KEY,
        password: env.KRA_PASSWORD,
        userName: env.KRA_USERNAME,
        env: env.KRA_ENV,
    });

    private counter = 0;
    private generateReqNo() {
        const base = Date.now() % 10_000_000;
        this.counter = (this.counter + 1) % 1000;
        return `${base}${this.counter.toString().padStart(3, "0")}`.replaceAll(
            "-",
            "",
        );
    }

    private runnerKey(customerId: number, kycDataStoreId: number) {
        return `KRA_CORP:${customerId}-${kycDataStoreId}-RUNNER`;
    }

    private retryKey(customerId: number, kycDataStoreId: number) {
        return `KRA_CORP:${customerId}-${kycDataStoreId}-RETRY`;
    }

    /**
     * Stores the operator-selected hint ("MODIFY" | "REGISTER") so the next
     * enquiry result in `checkKraProcessCheckStatus` is biased the same way
     * as the individual KRA flow (see `KraWorker.service.ts`).
     */
    private lastTaskKey(customerId: number, kycDataStoreId: number) {
        return `KRA_CORP:${customerId}-${kycDataStoreId}`;
    }

    private async incrementRetry(customerId: number, kycDataStoreId: number) {
        const key = this.retryKey(customerId, kycDataStoreId);
        const current = Number((await cacheStorage.get<string>(key)) ?? "0");
        const next = current + 1;
        await cacheStorage.set(key, String(next), TTL_72_HOURS_SEC);
        return next;
    }

    private async clearRetry(customerId: number, kycDataStoreId: number) {
        await cacheStorage.delete(this.retryKey(customerId, kycDataStoreId));
    }

    private async failAndStop(args: {
        customerId: number;
        kycDataStoreId: number;
        stage: string;
        requestData: unknown;
        responseData: unknown;
        reason: string;
    }) {
        await db.dataBase.kraDataLogs.create({
            data: {
                userId: args.customerId,
                kycId: args.kycDataStoreId,
                stage: args.stage,
                requestData: args.requestData as object,
                responseData: args.responseData as object,
                reqTime: nowIso(),
                resTime: nowIso(),
            },
        });
        await cacheStorage.delete(this.runnerKey(args.customerId, args.kycDataStoreId));
        await cacheStorage.delete(this.lastTaskKey(args.customerId, args.kycDataStoreId));
        await this.clearRetry(args.customerId, args.kycDataStoreId);

        // Don't downgrade a terminal status that was set deliberately
        // (CRM "Finish KRA process" sets MANUAL_FINISHED; CBRICS success sets VERIFIED).
        // A late-firing stale job must not overwrite either of those.
        const current = await db.dataBase.customerProfileDataModel.findUnique({
            where: { id: args.customerId },
            select: { kraStatus: true },
        });
        const cur = String(current?.kraStatus ?? "").trim().toUpperCase();
        if (cur === "VERIFIED" || cur === "MANUAL_FINISHED") return;

        await db.dataBase.customerProfileDataModel.update({
            where: { id: args.customerId },
            data: { kraStatus: args.reason },
        });
    }

    /**
     * Main entry used by the queue processor.
     * `data.data?.kraPayload` can be used to pass an explicit `KraNonIndAppReqRoot`
     * for Register/Modify, if your corporate mapping is not finalized yet.
     */
    async processCorporateKra(data: KraWorkerJobData<{ kraPayload?: KraNonIndAppReqRoot }>) {
        const { customerId, kycDataStoreId } = data;

        // A[Start] -> B[Check Runner Validity]
        const runner = await cacheStorage.get<string>(this.runnerKey(customerId, kycDataStoreId));
        if (!runner) {
            // Expired (72h)
            await this.failAndStop({
                customerId,
                kycDataStoreId,
                stage: "TIMEOUT_CORPORATE_KRA_PROCESS",
                requestData: { customerId, kycDataStoreId },
                responseData: { message: "Timeout - corporate KRA process exceeded 72h" },
                reason: "FAILED_TIMEOUT",
            });
            return;
        }

        // Retry control (global safety)
        const retry = await this.incrementRetry(customerId, kycDataStoreId);
        if (retry > MAX_RETRIES) {
            await this.failAndStop({
                customerId,
                kycDataStoreId,
                stage: "FAILED_MAX_RETRY_EXCEEDED",
                requestData: { customerId, kycDataStoreId, retry },
                responseData: { message: "Max retries exceeded" },
                reason: "FAILED_MAX_RETRY_EXCEEDED",
            });
            return;
        }

        try {
            // C[Fetch Customer + KYC Data]
            const customer = await db.dataBase.customerProfileDataModel.findUnique({
                where: { id: customerId },
            });
            if (!customer) {
                await this.failAndStop({
                    customerId,
                    kycDataStoreId,
                    stage: "FAILED_CUSTOMER_NOT_FOUND",
                    requestData: { customerId, kycDataStoreId },
                    responseData: { error: "Customer not found" },
                    reason: "FAILED_CUSTOMER_NOT_FOUND",
                });
                return;
            }

            const corporateKyc = await db.dataBase.corporateKycModel.findUnique({
                where: { customerProfileDataModelId: customerId },
                include: {
                    bankAccounts: true,
                    dematAccounts: true,
                    directors: true,
                    promoters: true,
                    authorisedSignatories: true,
                },
            });
            if (!corporateKyc) {
                await this.failAndStop({
                    customerId,
                    kycDataStoreId,
                    stage: "FAILED_CORPORATE_KYC_NOT_FOUND",
                    requestData: { customerId, kycDataStoreId },
                    responseData: { error: "Corporate KYC not found" },
                    reason: "FAILED_CORPORATE_KYC_NOT_FOUND",
                });
                return;
            }

            // CBRICS-only short-circuit: skip CVL KRA enquiry/register/modify
            // and only run the CBRICS registration leg. Mirrors the individual
            // worker's `cbricsOnly` path in `KraWorker.service.ts`.
            if (data.cbricsOnly) {
                await db.dataBase.kraDataLogs.create({
                    data: {
                        userId: customerId,
                        kycId: kycDataStoreId,
                        stage: "CORPORATE_CBRICS_ONLY_TRIGGERED",
                        requestData: { customerId, kycDataStoreId } as object,
                        responseData: { message: "Skipping CVL KRA; CBRICS-only path" } as object,
                        reqTime: nowIso(),
                        resTime: nowIso(),
                    },
                });
                await this.ensureCorporateCbrics(customerId, kycDataStoreId);
                await cacheStorage.delete(this.lastTaskKey(customerId, kycDataStoreId));
                return;
            }

            // D[Enquiry API Call]
            await this.kra.init();
            const pan = (corporateKyc.panNumber ?? "").trim();
            if (!pan) {
                await this.failAndStop({
                    customerId,
                    kycDataStoreId,
                    stage: "FAILED_MISSING_ENTITY_PAN",
                    requestData: { customerId, kycDataStoreId },
                    responseData: { error: "Missing corporateKyc.panNumber" },
                    reason: "FAILED_MISSING_ENTITY_PAN",
                });
                return;
            }

            const lastTask = await cacheStorage.get<string>(
                this.lastTaskKey(customerId, kycDataStoreId),
            );

            const enquiryReq = {
                pan,
                mobile: env.KRA_MOB_NO,
                reqNo: this.generateReqNo(),
            };
            const enquiryRes = (await this.kra.nonIndividualPanInquiryTwo(enquiryReq)) as T_APP_PAN_INQ;

            const status = checkKraProcessCheckStatus(enquiryRes, lastTask);

            // E[Evaluate Status]
            if (status === "REJECTED") {
                await this.failAndStop({
                    customerId,
                    kycDataStoreId,
                    stage: "FAILED_REJECTED",
                    requestData: enquiryReq,
                    responseData: enquiryRes,
                    reason: "FAILED_REJECTED",
                });
                return;
            }

            if (status === "ERROR") {
                await this.failAndStop({
                    customerId,
                    kycDataStoreId,
                    stage: "FAILED_ERROR",
                    requestData: enquiryReq,
                    responseData: enquiryRes,
                    reason: "FAILED_ERROR",
                });
                return;
            }

            if (status === "WAITING") {
                // W1[Reschedule (4h)]
                await db.dataBase.kraDataLogs.create({
                    data: {
                        userId: customerId,
                        kycId: kycDataStoreId,
                        stage: "WAITING_RESCHEDULE_4H",
                        requestData: enquiryReq as object,
                        responseData: enquiryRes as object,
                        reqTime: nowIso(),
                        resTime: nowIso(),
                    },
                });
                await addKraWorkerJob(data, RESCHEDULE_4H_MS);
                return;
            }

            if (status === "REGISTER") {
                // R1[Trigger Register API] then reschedule
                const kraPayload = this.buildNonIndividualKraPayloadFromCorporateKyc(
                    corporateKyc,
                    pan,
                );

                const regRes = await this.kra.nonIndividualRegisterUploadKraXML(kraPayload);
                await db.dataBase.kraDataLogs.create({
                    data: {
                        userId: customerId,
                        kycId: kycDataStoreId,
                        stage: "CORPORATE_REGISTER_TRIGGERED",
                        requestData: kraPayload as object,
                        responseData: regRes as object,
                        reqTime: nowIso(),
                        resTime: nowIso(),
                    },
                });
                await cacheStorage.set(
                    this.lastTaskKey(customerId, kycDataStoreId),
                    "REGISTER",
                    TTL_72_HOURS_SEC,
                );
                await addKraWorkerJob(data, RESCHEDULE_4H_MS);
                return;
            }

            if (status === "AVAILABLE") {
                // AVAILABLE -> download -> compare -> (match -> CBRICS) else (modify -> reschedule)
                await delay(AVAILABLE_WAIT_MS);

                let downloadRes: T_NON_INDIVIDUAL_PAN_DOWNLOAD;
                try {
                    const doi =
                        corporateKyc.dateOfIncorporation ??
                        corporateKyc.dateOfCommencementOfBusiness;
                    if (!doi) {
                        await this.failAndStop({
                            customerId,
                            kycDataStoreId,
                            stage: "FAILED_MISSING_DOI_FOR_DOWNLOAD",
                            requestData: { pan },
                            responseData: {
                                error:
                                    "Missing corporate dateOfIncorporation/dateOfCommencementOfBusiness for KRA download",
                            },
                            reason: "FAILED_MISSING_DOI_FOR_DOWNLOAD",
                        });
                        return;
                    }

                    downloadRes = await this.kra.nonIndividualPanDownloadDetailsComplete({
                        pan,
                        dob: formatDDMMYYYY(new Date(doi)),
                        mobile: env.KRA_MOB_NO,
                    });
                } catch (e) {
                    await this.failAndStop({
                        customerId,
                        kycDataStoreId,
                        stage: "FAILED_DOWNLOAD_ERROR",
                        requestData: { pan },
                        responseData: { error: (e as Error)?.message ?? String(e) },
                        reason: "FAILED_DOWNLOAD_ERROR",
                    });
                    return;
                }

                // Compare with corporate data (real check based on corporate KYC)
                const matched = this.isCorporateKraDownloadMatched(
                    corporateKyc,
                    downloadRes,
                    pan,
                );

                if (matched) {
                    // Proceed to CBricks Check
                    await this.ensureCorporateCbrics(customerId, kycDataStoreId);
                    return;
                }

                // MISMATCH -> MODIFY
                const kraPayload = this.buildNonIndividualKraPayloadFromCorporateKyc(
                    corporateKyc,
                    pan,
                    { isModify: true },
                );

                const modRes = await this.kra.nonIndividualModifyKraXML(kraPayload);
                await db.dataBase.kraDataLogs.create({
                    data: {
                        userId: customerId,
                        kycId: kycDataStoreId,
                        stage: "CORPORATE_MODIFY_TRIGGERED",
                        requestData: kraPayload as object,
                        responseData: modRes as object,
                        reqTime: nowIso(),
                        resTime: nowIso(),
                    },
                });
                await cacheStorage.set(
                    this.lastTaskKey(customerId, kycDataStoreId),
                    "MODIFY",
                    TTL_72_HOURS_SEC,
                );
                await addKraWorkerJob(data, RESCHEDULE_4H_MS);
                return;
            }

            // Unknown status -> reschedule as waiting (safe)
            await db.dataBase.kraDataLogs.create({
                data: {
                    userId: customerId,
                    kycId: kycDataStoreId,
                    stage: "UNKNOWN_STATUS_RESCHEDULE",
                    requestData: enquiryReq as object,
                    responseData: { enquiryRes, status } as object,
                    reqTime: nowIso(),
                    resTime: nowIso(),
                },
            });
            await addKraWorkerJob(data, RESCHEDULE_4H_MS);
        } catch (err) {
            const e = err as AxiosError;
            if (isAxiosError(e)) {
                console.log(e.response?.data);
            } else {
                console.log(e);
            }
            await db.dataBase.kraDataLogs.create({
                data: {
                    userId: customerId,
                    kycId: kycDataStoreId,
                    stage: "CORPORATE_KRA_UNHANDLED_ERROR_RESCHEDULE",
                    requestData: { customerId, kycDataStoreId } as object,
                    responseData: {
                        message: e.message,
                        status: e.response?.status,
                        data: e.response?.data,
                    } as object,
                    reqTime: nowIso(),
                    resTime: nowIso(),
                },
            });
            await addKraWorkerJob(data, RESCHEDULE_4H_MS);
            throw err;
        }
    }

    private buildNonIndividualKraPayloadFromCorporateKyc(
        corporateKyc: CorporateKycInputForKra,
        pan: string,
        opts?: { isModify?: boolean },
    ): KraNonIndAppReqRoot {
        // Delegate to the shared, pure builder so the CRM "KRA preview" page
        // and the wire payload stay in lockstep. `pan` is kept on the signature
        // for backward compatibility but the builder reads it from `corporateKyc.panNumber`.
        void pan;
        return buildCorporateKraPayload(corporateKyc, { isModify: opts?.isModify }).payload;
    }

    private isCorporateKraDownloadMatched(
        corporateKyc: CorporateKycInputForKra,
        download: T_NON_INDIVIDUAL_PAN_DOWNLOAD,
        pan: string,
    ): boolean {
        const inq = download?.APP_RES_ROOT?.APP_PAN_INQ;
        if (!inq) return false;

        const norm = (s: string) => s.replace(/\s+/g, "").trim().toUpperCase();
        const panOk = norm(inq.APP_PAN_NO ?? "") === norm(pan);
        const nameOk = norm(inq.APP_NAME ?? "") === norm(corporateKyc.entityName ?? "");
        const pinOk =
            String(inq.APP_COR_PINCD ?? "").trim() ===
            String(
                corporateKyc.registeredPinCode ?? corporateKyc.correspondencePinCode ?? "",
            ).trim();
        return panOk && nameOk && pinOk;
    }

    private async ensureCorporateCbrics(customerId: number, kycDataStoreId: number) {
        try {
            // CBricks Exists?
            const user = await db.dataBase.customerProfileDataModel.findUnique({
                where: { id: customerId },
                select: {
                    nseDataSet: {
                        select: {
                            participant: { select: { loginId: true, userId: true } },
                        },
                    },
                },
            });

            if (
                user?.nseDataSet?.participant.loginId &&
                user?.nseDataSet?.participant.userId === customerId
            ) {
                // Update Status: VERIFIED
                await db.dataBase.customerProfileDataModel.update({
                    where: { id: customerId },
                    data: {

                        kraStatus: "VERIFIED",
                        verifyDate: new Date(),
                    },
                });
                await cacheStorage.delete(this.runnerKey(customerId, kycDataStoreId));
                await cacheStorage.delete(this.lastTaskKey(customerId, kycDataStoreId));
                await this.clearRetry(customerId, kycDataStoreId);
                await db.dataBase.kraDataLogs.create({
                    data: {
                        userId: customerId,
                        kycId: kycDataStoreId,
                        stage: "CBRICS_ALREADY_EXISTS_VERIFIED",
                        requestData: { customerId, kycDataStoreId } as object,
                        responseData: { message: "CBRICS already exists" } as object,
                        reqTime: nowIso(),
                        resTime: nowIso(),
                    },
                });
                return;
            }

            // Trigger CBrics Registration using Corporate KYC table
            const cbRes =
                await cbricsManager.registerCorporateParticipantFromCorporateKyc(customerId);

            await db.dataBase.customerProfileDataModel.update({
                where: { id: customerId },
                data: {
                    kraStatus: "VERIFIED",
                    verifyDate: new Date(),
                },
            });
            await cacheStorage.delete(this.runnerKey(customerId, kycDataStoreId));
            await cacheStorage.delete(this.lastTaskKey(customerId, kycDataStoreId));
            await this.clearRetry(customerId, kycDataStoreId);
            await db.dataBase.kraDataLogs.create({
                data: {
                    userId: customerId,
                    kycId: kycDataStoreId,
                    stage: "CBRICS_REGISTER_SUCCESS_VERIFIED",
                    requestData: { customerId, kycDataStoreId } as object,
                    responseData: cbRes as object,
                    reqTime: nowIso(),
                    resTime: nowIso(),
                },
            });
        } catch (error) {
            // Mark Partial: CBrics Pending (and reschedule outer loop)
            const err = error as AxiosError;
            await db.dataBase.customerProfileDataModel.update({
                where: { id: customerId },
                data: { kraStatus: "CBRICS PENDING" },
            });
            await db.dataBase.kraDataLogs.create({
                data: {
                    userId: customerId,
                    kycId: kycDataStoreId,
                    stage: "PARTIAL_CBRICS_PENDING",
                    requestData: { customerId, kycDataStoreId } as object,
                    responseData: (err.response?.data || err.message) as object,
                    reqTime: nowIso(),
                    resTime: nowIso(),
                },
            });
        }
    }
}

