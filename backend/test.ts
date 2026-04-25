import { buildKraNonIndividualAppReqRootXml, type KraNonIndAppReqRoot } from "kyc-providers";
import { db, disconnectFromDatabases } from "@core/database/database";
import { env } from "@packages/config/env";

/**
 * Generate Corporate (Non-Individual) KRA XML from DB corporate KYC.
 *
 * Run:
 * - `bun run test.ts <customerId>`
 *
 * Example:
 * - `bun run test.ts 25`
 */

function formatKraDateTime(date: Date): string {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    const HH = String(date.getHours()).padStart(2, "0");
    const MM = String(date.getMinutes()).padStart(2, "0");
    const SS = String(date.getSeconds()).padStart(2, "0");
    return `${dd}-${mm}-${yyyy} ${HH}:${MM}:${SS}`;
}

function buildNonIndividualKraPayloadFromCorporateKyc(
    corporateKyc: any,
    pan: string,
    opts?: { isModify?: boolean },
): KraNonIndAppReqRoot {
    const signatory = corporateKyc.authorisedSignatories?.[0];
    const now = new Date();
    const registeredState = String(corporateKyc.registeredState ?? "").trim();
    const corrState = String(corporateKyc.correspondenceState ?? "").trim();
    const state = registeredState || corrState || "";

    const panInq: KraNonIndAppReqRoot["APP_PAN_INQ"] = {
        APP_INT_CODE: env.KRA_OKRA_CD_MI_ID,
        APP_POS_CODE: env.KRA_OKRA_CD_MI_ID,
        APP_TYPE: "N",
        APP_NO: "", // as requested
        APP_DATE: formatKraDateTime(now),
        APP_EXMT: "N",
        APP_EXMT_CAT: "",
        APP_EXMT_ID_PROOF: "01",
        APP_IPV_FLAG: "Y",
        APP_IPV_DATE: formatKraDateTime(now),
        APP_GEN: "",
        APP_NAME: String(corporateKyc.entityName ?? "").trim().toUpperCase(),
        APP_F_NAME: "",
        APP_DOB_DT: "",
        APP_DOI_DT: corporateKyc.dateOfIncorporation
            ? formatKraDateTime(new Date(corporateKyc.dateOfIncorporation))
            : "",
        APP_REGNO: corporateKyc.cinOrRegistrationNumber ?? "",
        APP_COMMENCE_DT: corporateKyc.dateOfCommencementOfBusiness
            ? formatKraDateTime(new Date(corporateKyc.dateOfCommencementOfBusiness))
            : "",
        APP_NATIONALITY: "",
        APP_OTH_NATIONALITY: "",
        APP_COMP_STATUS: corporateKyc.entityConstitutionType ?? "",
        APP_OTH_COMP_STATUS: "",
        APP_RES_STATUS: "",
        APP_RES_STATUS_PROOF: "01",
        APP_PAN_NO: pan,
        APP_PANEX_NO: "",
        APP_PAN_COPY: "Y",
        APP_UID_NO: "",

        APP_COR_ADD1: corporateKyc.registeredLine1 ?? corporateKyc.correspondenceLine1 ?? "",
        APP_COR_ADD2: corporateKyc.registeredLine2 ?? corporateKyc.correspondenceLine2 ?? "",
        APP_COR_ADD3: corporateKyc.registeredLine3 ?? corporateKyc.correspondenceLine3 ?? "",
        APP_COR_CITY: corporateKyc.registeredCity ?? corporateKyc.correspondenceCity ?? "",
        APP_COR_PINCD: corporateKyc.registeredPinCode ?? corporateKyc.correspondencePinCode ?? "",
        APP_COR_STATE: state,
        APP_COR_CTRY: "101",
        APP_OFF_NO: "",
        APP_RES_NO: "",
        APP_MOB_NO: String(signatory?.mobile ?? ""),
        APP_FAX_NO: "",
        APP_EMAIL: String(signatory?.email ?? "").trim().toUpperCase(),
      APP_COR_ADD_PROOF: String(corporateKyc.correspondenceAddressProofType ?? "20"),
        APP_COR_ADD_REF: "",
        APP_COR_ADD_DT: formatKraDateTime(now),

        APP_PER_ADD1: corporateKyc.registeredLine1 ?? corporateKyc.correspondenceLine1 ?? "",
        APP_PER_ADD2: corporateKyc.registeredLine2 ?? corporateKyc.correspondenceLine2 ?? "",
        APP_PER_ADD3: corporateKyc.registeredLine3 ?? corporateKyc.correspondenceLine3 ?? "",
        APP_PER_CITY: corporateKyc.registeredCity ?? corporateKyc.correspondenceCity ?? "",
        APP_PER_PINCD: corporateKyc.registeredPinCode ?? corporateKyc.correspondencePinCode ?? "",
        APP_PER_STATE: state,
        APP_PER_CTRY: "101",
      APP_PER_ADD_PROOF: String(corporateKyc.registeredAddressProofType ?? "20"),
        APP_PER_ADD_REF: "",
        APP_PER_ADD_DT: formatKraDateTime(now),

        APP_INCOME: String(corporateKyc.annualIncome ?? ""),
        APP_OCC: "",
        APP_OTH_OCC: "",
        APP_POL_CONN: "",
        APP_DOC_PROOF: "S",
        APP_INTERNAL_REF: "CORPORATE_KYC",
        APP_BRANCH_CODE: "",
        APP_MAR_STATUS: "",
        APP_NETWRTH: "",
        APP_NETWORTH_DT: "",
        APP_INCORP_PLC: String(corporateKyc.placeOfIncorporation ?? "").trim().toUpperCase(),
        APP_OTHERINFO: "",

        APP_ACC_OPENDT: "",
        APP_ACC_ACTIVEDT: "",
        APP_ACC_UPDTDT: "",
        APP_FILLER1: "",
        APP_FILLER2: "",
        APP_FILLER3: "",
        APP_STATUS: "",
        APP_STATUSDT: "",
        APP_ERROR_DESC: "",
        APP_DUMP_TYPE: "",
        APP_DNLDDT: "",
        APP_IOP_FLG: "IS",
        APP_KRA_INFO: "CORPORATE",
        APP_SIGNATURE: "",
        APP_KYC_MODE: "",

        APP_FATCA_APPLICABLE_FLAG: corporateKyc.fatcaApplicable ? "Y" : "N",
        APP_FATCA_OTHER_SERVICES: "",
        APP_FATCA_BIRTH_PLACE: "",
        APP_FATCA_BIRTH_COUNTRY: "",
        APP_FATCA_COUNTRY_RES: "",
        APP_FATCA_DATE_DECLARATION: corporateKyc.fatcaApplicable ? formatKraDateTime(now) : "",
    };

    const addl = (corporateKyc.authorisedSignatories ?? []).map((s: any) => ({
        APP_ADDLDATA_UPDTFLG: "01",
        APP_ENTITY_PAN: pan,
        APP_ADDLDATA_PAN: s.pan ?? "",
        APP_ADDLDATA_NAME: String(s.fullName ?? "").trim().toUpperCase(),
        APP_ADDLDATA_DIN_UID: "",
        APP_ADDLDATA_DIN: s.din ?? "",
        APP_ADDLDATA_RELATIONSHIP: "06",
        APP_ADDLDATA_POLCONN: "NA",
        APP_ADDLDATA_RESADD1: corporateKyc.registeredLine1 ?? "",
        APP_ADDLDATA_RESADD2: corporateKyc.registeredLine2 ?? "",
        APP_ADDLDATA_RESADD3: corporateKyc.registeredLine3 ?? "",
        APP_ADDLDATA_RESCITY: corporateKyc.registeredCity ?? "",
        APP_ADDLDATA_RESPINCD: corporateKyc.registeredPinCode ?? "",
        APP_ADDLDATA_RESSTATE: state,
        APP_ADDLDATA_RESCOUNTRY: "101",
        APP_ADDLDATA_FILLER1: "",
        APP_ADDLDATA_FILLER2: "",
        APP_ADDLDATA_FILLER3: "",
    }));

    const fatca = corporateKyc.fatcaApplicable
        ? [
            {
                APP_FATCA_ENTITY_PAN: pan,
                APP_FATCA_COUNTRY_RESIDENCY: "",
                APP_FATCA_TAX_IDENTIFICATION_TYPE: "TIN",
                APP_FATCA_TAX_IDENTIFICATION_NO: "",
                APP_FATCA_TAX_EXEMPT_FLAG: "N",
                APP_FATCA_TAX_EXEMPT_REASON: "",
            },
        ]
        : [];

    const summ: KraNonIndAppReqRoot["APP_SUMM_REC"] = {
        APP_OTHKRA_CODE: env.KRA_OKRA_CD_MI_ID,
        APP_OTHKRA_BATCH: "K",
        APP_REQ_DATE: formatKraDateTime(now),
        APP_ADDLDATA_RECORDS: String(addl.length),
        APP_TOTAL_REC: "1",
        NO_OF_FATCA_ADDL_DTLS_RECORDS: String(fatca.length),
    };

    const out: KraNonIndAppReqRoot = {
        APP_PAN_INQ: panInq,
        APP_ADDL_DATA: addl,
        FATCA_ADDL_DTLS: fatca,
        APP_SUMM_REC: summ,
    };

    if (opts?.isModify) {
        out.APP_PAN_INQ.APP_IOP_FLG = "IS";
    }

    return out;
}

const customerId = Number(process.argv[2] ?? "");
if (!customerId || Number.isNaN(customerId)) {
    console.error("Usage: bun run test.ts <customerId>");
    process.exit(1);
}

const corporateKyc = await db.dataBase.corporateKycModel.findFirst({
    where: { customerProfileDataModelId: customerId },
    include: {
        authorisedSignatories: true,
    },
});

if (!corporateKyc) {
    console.error(`No corporate KYC found for customerId=${customerId}`);
    await disconnectFromDatabases();
    process.exit(1);
}

const pan = String(corporateKyc.panNumber ?? "").trim();
if (!pan) {
    console.error("Corporate KYC PAN (panNumber) is missing");
    await disconnectFromDatabases();
    process.exit(1);
}

const registerPayload = buildNonIndividualKraPayloadFromCorporateKyc(corporateKyc, pan, {
    isModify: false,
});
const modifyPayload = buildNonIndividualKraPayloadFromCorporateKyc(corporateKyc, pan, {
    isModify: true,
});

console.log("\n==================== CORPORATE KRA - REGISTER XML (DB) ====================\n");
console.log(buildKraNonIndividualAppReqRootXml(registerPayload));
console.log("\n===================== CORPORATE KRA - MODIFY XML (DB) =====================\n");
console.log(buildKraNonIndividualAppReqRootXml(modifyPayload));

await disconnectFromDatabases();
