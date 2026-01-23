import { db } from "@core/database/database";
import { KraProcess } from "@jobs/kra_worker/KraWorker.service";
import { env } from "@packages/config/src/env";
import { KraXMLBuilder, type PanModifyKraPayload } from "@packages/kyc-providers";
import type { Root } from "@packages/kyc-providers/pdf/dataMapper";
import { removeCountryCode } from "@utils/filters/convert";


const kra = new KraProcess();


const customer = await db.dataBase.customerProfileDataModel.findUnique({
    where: { id: 49 },
});
if (!customer) throw new Error("Customer not found");

const c = await db.dataBase.kYC_FLOW.findFirst({
    where: { id: 237, userID: 49 },
});

if (!c) throw new Error("KYC payload not found or does not belong to user");

const kyc = c.data as Root;

const data = new KraProcess().buildRegisterPayload(kyc, customer);


const payload = kra.buildRegisterPayload(kyc, customer, true);

// console.log(KraXMLBuilder.buildRegisterUploadXML(payload));


const p = payload.APP_PAN_INQ;

const dataKraPayload: PanModifyKraPayload = {
    panInquiry: {
        APP_COR_ADD1: p.APP_COR_ADD1,
        APP_COR_ADD2: p.APP_COR_ADD2,
        APP_COR_ADD3: p.APP_COR_ADD3,
        APP_COR_ADD_PROOF: p.APP_COR_ADD_PROOF,
        APP_COR_ADD_REF: p.APP_COR_ADD_REF,
        APP_COR_CITY: p.APP_COR_CITY,
        APP_COR_CTRY: p.APP_COR_CTRY,
        APP_COR_PINCD: p.APP_COR_PINCD,
        APP_COR_STATE: p.APP_COR_STATE,
        APP_DATE: p.APP_DATE,
        APP_DOB_DT: p.APP_DOB_DT,
        APP_DOC_PROOF: p.APP_DOC_PROOF,
        APP_EMAIL: p.APP_EMAIL,
        APP_EXMT: p.APP_EXMT,
        APP_EXMT_CAT: p.APP_EXMT_CAT,
        APP_EXMT_ID_PROOF: p.APP_EXMT_ID_PROOF,
        APP_F_NAME: p.APP_F_NAME,
        APP_FATCA_APPLICABLE_FLAG: p.APP_FATCA_APPLICABLE_FLAG as "Y" | "N",
        APP_FATCA_BIRTH_COUNTRY: p.APP_FATCA_BIRTH_COUNTRY,
        APP_FATCA_BIRTH_PLACE: p.APP_FATCA_BIRTH_PLACE,
        APP_FATCA_COUNTRY_CITYZENSHIP: p.APP_FATCA_COUNTRY_CITYZENSHIP,
        APP_FATCA_DATE_DECLARATION: p.APP_FATCA_DATE_DECLARATION,
        APP_GEN: p.APP_GEN,
        APP_INCOME: p.APP_INCOME,
        APP_IOP_FLG: p.APP_IOP_FLG,
        APP_IPV_DATE: p.APP_IPV_DATE,
        APP_IPV_FLAG: "E",
        APP_KYC_MODE: p.APP_KYC_MODE,
        APP_REGNO: p.APP_REGNO,
        APP_DOI_DT: p.APP_DOI_DT,
        APP_COMMENCE_DT: p.APP_COMMENCE_DT,
        APP_OTH_NATIONALITY: p.APP_OTH_NATIONALITY,

        APP_MOBILE_NO: env.KRA_MOB_NO,
        APP_MOB_NO: removeCountryCode(customer?.phoneNo || ""),

        APP_NAME: p.APP_NAME,
        APP_NATIONALITY: p.APP_NATIONALITY,
        APP_NO: p.APP_NO,
        APP_OCC: p.APP_OCC,
        APP_OTH_OCC: p.APP_OTH_OCC,

        APP_PAN_COPY: p.APP_PAN_COPY,
        APP_PAN_NO: p.APP_PAN_NO,
        APP_COR_ADD_DT: p.APP_COR_ADD_DT,
        APP_PANEX_NO: p.APP_PANEX_NO,
        APP_PER_ADD1: p.APP_PER_ADD1,
        APP_PER_ADD2: p.APP_PER_ADD2,
        APP_PER_ADD3: p.APP_PER_ADD3,
        APP_PER_CITY: p.APP_PER_CITY,
        APP_PER_CTRY: p.APP_PER_CTRY,
        APP_PER_PINCD: p.APP_PER_PINCD,
        APP_PER_STATE: p.APP_PER_STATE,
        APP_POL_CONN: p.APP_POL_CONN,
        APP_POS_CODE: p.APP_POS_CODE,
        APP_RES_STATUS: p.APP_RES_STATUS,
        APP_TYPE: p.APP_TYPE,
        APP_UID_NO: p.APP_UID_NO,
        APP_PER_ADD_PROOF: p.APP_PER_ADD_PROOF,
        APP_PER_ADD_DT: p.APP_PER_ADD_DT,
        APP_PER_ADD_REF: p.APP_PER_ADD_REF,
        APP_MAR_STATUS: p.APP_MAR_STATUS,
        APP_BRANCH_CODE: p.APP_BRANCH_CODE,
        APP_NETWRTH: p.APP_NETWRTH,
        APP_NETWORTH_DT: p.APP_NETWORTH_DT,
        APP_INCORP_PLC: p.APP_INCORP_PLC,
        APP_OTHERINFO: p.APP_OTHERINFO,
        APP_FILLER1: p.APP_FILLER1,
        APP_FILLER2: p.APP_FILLER2,
        APP_FILLER3: p.APP_FILLER3,
        APP_COMP_STATUS: p.APP_COMP_STATUS,
        APP_DNLDDT: "",
        APP_DUMP_TYPE: p.APP_DUMP_TYPE,
        APP_KRA_INFO: p.APP_KRA_INFO,
        APP_SIGNATURE: p.APP_SIGNATURE,
        APP_FATCA_COUNTRY_RES: p.APP_FATCA_COUNTRY_RES,
        APP_FAX_NO: p.APP_FAX_NO,
        APP_INTERNAL_REF: p.APP_INTERNAL_REF,
        APP_OTH_COMP_STATUS: p.APP_OTH_COMP_STATUS,
        APP_RES_STATUS_PROOF: p.APP_RES_STATUS_PROOF,
        APP_OFF_NO: p.APP_OFF_NO,
        APP_RES_NO: p.APP_RES_NO,
    },

    fatcaAdditionalDetails: payload.FATCA_ADDL_DTLS,
};

console.log(dataKraPayload);

const xml = KraXMLBuilder.buildPanModifyKraXML({
    payload: dataKraPayload,
    encryptedPassword: "",
    passKey: "",
    userName: "",
});

console.log(xml);