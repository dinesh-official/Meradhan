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
import {
    mapAddressProofToNdml,
    mapAnnualIncomeToNdml,
    mapCompStatusToNdml,
} from "./kraCodes";
import { getKraCountry, getKraState } from "./constent";

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
        console.log(data);


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
                    partners: true,
                    trustees: true,
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

            console.log(data);


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
                // R1[Trigger Register API] then reschedule.
                // APP_EMAIL / APP_MOB_NO must come from the customer's signup
                // profile (same as CBRICS), not the authorised signatory.
                const kraPayload = this.buildNonIndividualKraPayloadFromCorporateKyc(
                    {
                        ...corporateKyc,
                        primaryEmail: customer.emailAddress,
                        primaryMobile: customer.phoneNo,
                    },
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
                    // add audit log
                    await db.dataBase.kraDataLogs.create({
                        data: {
                            userId: customerId,
                            kycId: kycDataStoreId,
                            stage: "CORPORATE_KRA_DOWNLOAD_TRIGGERED",
                            requestData: { pan },
                        },
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

                // Compare with corporate data (real check based on corporate KYC).
                // Pass customer signup contact so APP_EMAIL / APP_MOB_NO drift
                // is detected against the same source the builder used.
                const diff = this.diffCorporateKraDownload(
                    {
                        ...corporateKyc,
                        primaryEmail: customer.emailAddress,
                        primaryMobile: customer.phoneNo,
                    },
                    downloadRes,
                    pan,
                );

                if (diff.matched) {
                    await db.dataBase.kraDataLogs.create({
                        data: {
                            userId: customerId,
                            kycId: kycDataStoreId,
                            stage: "CORPORATE_KRA_DOWNLOAD_MATCHED",
                            requestData: { pan },
                            responseData: { message: "KRA download matched", matched: true },
                        },
                    });
                    // Proceed to CBricks Check
                    await this.ensureCorporateCbrics(customerId, kycDataStoreId);
                    return;
                }

                // MISMATCH -> MODIFY. Same customer-profile contact source.
                const kraPayload = this.buildNonIndividualKraPayloadFromCorporateKyc(
                    {
                        ...corporateKyc,
                        primaryEmail: customer.emailAddress,
                        primaryMobile: customer.phoneNo,
                    },
                    pan,
                    { isModify: true },
                );

                const modRes = await this.kra.nonIndividualModifyKraXML(kraPayload);
                await db.dataBase.kraDataLogs.create({
                    data: {
                        userId: customerId,
                        kycId: kycDataStoreId,
                        stage: "CORPORATE_MODIFY_TRIGGERED",
                        requestData: {
                            kraPayload,
                            mismatches: diff.mismatches,
                        } as object,
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

    /**
     * Compares the NDML download payload against the CRM corporate KYC row and
     * returns a structured diff. A field is considered a mismatch only when the
     * CRM side has a value AND it disagrees with the NDML side — empty CRM
     * fields are ignored (nothing to push), and empty NDML-side values for
     * fields the CRM has data for are flagged so the next MODIFY actually
     * carries that data upstream.
     *
     * Code-driven fields (state, address-proof, income, comp-status, country)
     * are compared at the NDML-code level so cosmetic label differences don't
     * cause spurious MODIFY round-trips.
     */
    private diffCorporateKraDownload(
        corporateKyc: CorporateKycInputForKra,
        download: T_NON_INDIVIDUAL_PAN_DOWNLOAD,
        pan: string,
    ): { matched: boolean; mismatches: Array<{ field: string; ndml: string; crm: string }> } {
        const mismatches: Array<{ field: string; ndml: string; crm: string }> = [];
        const inq = download?.APP_RES_ROOT?.APP_PAN_INQ;
        if (!inq) {
            return {
                matched: false,
                mismatches: [{ field: "APP_PAN_INQ", ndml: "<missing>", crm: "<download-empty>" }],
            };
        }

        // ── Normalisers ────────────────────────────────────────────────────
        const trim = (s: unknown) => String(s ?? "").trim();
        const upper = (s: unknown) => trim(s).toUpperCase();
        const alnumUpper = (s: unknown) => upper(s).replace(/[^A-Z0-9]/g, "");
        const onlyDigits = (s: unknown) => String(s ?? "").replace(/\D/g, "");
        const lastN = (s: string, n: number) => (s.length > n ? s.slice(-n) : s);
        const lower = (s: unknown) => trim(s).toLowerCase();

        const parseDate = (v: unknown): string => {
            // Returns YYYY-MM-DD, or "" if we can't parse it. Accepts Date, ISO,
            // or NDML's DD-MM-YYYY / DD/MM/YYYY.
            if (!v) return "";
            if (v instanceof Date && !Number.isNaN(v.getTime())) {
                return v.toISOString().slice(0, 10);
            }
            const raw = String(v).trim();
            if (!raw) return "";
            const dmy = raw.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
            if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
            const iso = new Date(raw);
            return Number.isNaN(iso.getTime()) ? "" : iso.toISOString().slice(0, 10);
        };

        // Compares `ndmlRaw` against `crmRaw` after passing both through `norm`.
        // - If CRM is empty after normalisation, the field is skipped (we have
        //   nothing authoritative to push).
        // - Otherwise both must equal; an empty NDML value is a mismatch (the
        //   field is missing upstream and MODIFY should fill it in).
        const compare = (
            field: string,
            ndmlRaw: unknown,
            crmRaw: unknown,
            norm: (s: unknown) => string = trim,
        ) => {
            const crm = norm(crmRaw);
            if (!crm) return;
            const ndml = norm(ndmlRaw);
            if (ndml !== crm) {
                mismatches.push({
                    field,
                    ndml: String(ndmlRaw ?? ""),
                    crm: String(crmRaw ?? ""),
                });
            }
        };

        // ── Identity ───────────────────────────────────────────────────────
        compare("APP_PAN_NO", inq.APP_PAN_NO, pan, alnumUpper);
        compare("APP_NAME", inq.APP_NAME, corporateKyc.entityName, alnumUpper);
        compare("APP_REGNO", inq.APP_REGNO, corporateKyc.cinOrRegistrationNumber, alnumUpper);

        // ── Dates ──────────────────────────────────────────────────────────
        compare("APP_DOI_DT", inq.APP_DOI_DT, corporateKyc.dateOfIncorporation, parseDate);
        compare(
            "APP_COMMENCE_DT",
            inq.APP_COMMENCE_DT,
            corporateKyc.dateOfCommencementOfBusiness,
            parseDate,
        );

        // ── Entity-constitution / company status ───────────────────────────
        const crmCompStatus = mapCompStatusToNdml(corporateKyc.entityConstitutionType)?.code;
        if (crmCompStatus) {
            compare("APP_COMP_STATUS", inq.APP_COMP_STATUS, crmCompStatus, upper);
        }

        // ── Place / country of incorporation ───────────────────────────────
        compare("APP_INCORP_PLC", inq.APP_INCORP_PLC, corporateKyc.placeOfIncorporation, alnumUpper);

        // ── Income bracket (NDML code-level) ───────────────────────────────
        const crmIncome = mapAnnualIncomeToNdml(corporateKyc.annualIncome)?.code;
        if (crmIncome) {
            compare("APP_INCOME", inq.APP_INCOME, crmIncome, upper);
        }

        // ── Contact (email + last-10 of phone) ─────────────────────────────
        // The wire payload sources APP_EMAIL / APP_MOB_NO from the customer's
        // signup profile (`primaryEmail` / `primaryMobile`), so diff against
        // those. We also accept the authorised signatory as a fallback for
        // legacy rows where the worker didn't pass signup data through.
        const sig0 = (corporateKyc.authorisedSignatories ?? [])[0];
        const expectedEmail = (corporateKyc.primaryEmail ?? sig0?.email ?? "").trim();
        const expectedMobile = (corporateKyc.primaryMobile ?? sig0?.mobile ?? "").trim();
        compare("APP_EMAIL", inq.APP_EMAIL, expectedEmail, lower);
        compare(
            "APP_MOB_NO",
            lastN(onlyDigits(inq.APP_MOB_NO), 10),
            lastN(onlyDigits(expectedMobile), 10),
            trim,
        );

        // ── Correspondence address ────────────────────────────────────────
        compare("APP_COR_ADD1", inq.APP_COR_ADD1, corporateKyc.correspondenceLine1, alnumUpper);
        compare("APP_COR_ADD2", inq.APP_COR_ADD2, corporateKyc.correspondenceLine2, alnumUpper);
        compare("APP_COR_ADD3", inq.APP_COR_ADD3, corporateKyc.correspondenceLine3, alnumUpper);
        compare("APP_COR_CITY", inq.APP_COR_CITY, corporateKyc.correspondenceCity, alnumUpper);
        compare(
            "APP_COR_PINCD",
            lastN(onlyDigits(inq.APP_COR_PINCD), 6),
            lastN(onlyDigits(corporateKyc.correspondencePinCode ?? corporateKyc.registeredPinCode), 6),
            trim,
        );
        const crmCorStateCode = corporateKyc.correspondenceState
            ? getKraState(corporateKyc.correspondenceState).code
            : "";
        if (crmCorStateCode) {
            compare("APP_COR_STATE", inq.APP_COR_STATE, crmCorStateCode, upper);
        }
        const crmCorAddProofCode = mapAddressProofToNdml(
            corporateKyc.correspondenceAddressProofType ?? corporateKyc.registeredAddressProofType,
        )?.code;
        if (crmCorAddProofCode) {
            compare("APP_COR_ADD_PROOF", inq.APP_COR_ADD_PROOF, crmCorAddProofCode, upper);
        }

        // ── Registered ("permanent") address ──────────────────────────────
        compare("APP_PER_ADD1", inq.APP_PER_ADD1, corporateKyc.registeredLine1, alnumUpper);
        compare("APP_PER_ADD2", inq.APP_PER_ADD2, corporateKyc.registeredLine2, alnumUpper);
        compare("APP_PER_ADD3", inq.APP_PER_ADD3, corporateKyc.registeredLine3, alnumUpper);
        compare("APP_PER_CITY", inq.APP_PER_CITY, corporateKyc.registeredCity, alnumUpper);
        compare(
            "APP_PER_PINCD",
            lastN(onlyDigits(inq.APP_PER_PINCD), 6),
            lastN(onlyDigits(corporateKyc.registeredPinCode ?? corporateKyc.correspondencePinCode), 6),
            trim,
        );
        const crmPerStateCode = corporateKyc.registeredState
            ? getKraState(corporateKyc.registeredState).code
            : "";
        if (crmPerStateCode) {
            compare("APP_PER_STATE", inq.APP_PER_STATE, crmPerStateCode, upper);
        }
        const crmPerAddProofCode = mapAddressProofToNdml(
            corporateKyc.registeredAddressProofType ?? corporateKyc.correspondenceAddressProofType,
        )?.code;
        if (crmPerAddProofCode) {
            compare("APP_PER_ADD_PROOF", inq.APP_PER_ADD_PROOF, crmPerAddProofCode, upper);
        }

        // ── Country (correspondence + permanent share the same CRM source) ─
        const crmCountryCode = corporateKyc.countryOfIncorporation
            ? getKraCountry(corporateKyc.countryOfIncorporation)?.code
            : undefined;
        if (crmCountryCode) {
            compare("APP_COR_CTRY", inq.APP_COR_CTRY, crmCountryCode, upper);
            compare("APP_PER_CTRY", inq.APP_PER_CTRY, crmCountryCode, upper);
        }

        return { matched: mismatches.length === 0, mismatches };
    }

    private isCorporateKraDownloadMatched(
        corporateKyc: CorporateKycInputForKra,
        download: T_NON_INDIVIDUAL_PAN_DOWNLOAD,
        pan: string,
    ): boolean {
        return this.diffCorporateKraDownload(corporateKyc, download, pan).matched;
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

