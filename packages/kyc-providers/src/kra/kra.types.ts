export type T_APP_PAN_INQ = {
  APP_RES_ROOT: {
    APP_PAN_INQ: {
      APP_HOLD_DEACTIVE_RMKS: string;
      APP_IPV_FLAG: string;
      APP_KYC_MODE: string;
      APP_NAME: string;
      APP_PAN_NO: string;
      APP_REQ_NO: string;
      APP_RES_NO: string;
      APP_STATUS: string;
      APP_STATUSDT: string;
      APP_UPDT_RMKS: string;
      APP_UPDT_STATUS?: string;
      ERROR?: string;
    };
  };
};

export type T_APP_PAN_INQ_DOWNLOAD = {
  APP_RES_ROOT: {
    APP_PAN_INQ: {
      APP_IOP_FLG: string;
      APP_POS_CODE: string;
      APP_TYPE: string;
      APP_KYC_MODE: string;
      APP_NO: string;
      APP_DATE: string;
      APP_PAN_NO: string;
      APP_PANEX_NO: string;
      APP_PAN_COPY: string;
      APP_EXMT: string;
      APP_EXMT_CAT: string;
      APP_EXMT_ID_PROOF: string;
      APP_IPV_FLAG: string;
      APP_IPV_DATE: string;
      APP_GEN: string;
      APP_NAME: string;
      APP_F_NAME: string;
      APP_REGNO: string;
      APP_DOB_DT: string;
      APP_DOI_DT: string;
      APP_COMMENCE_DT: string;
      APP_NATIONALITY: string;
      APP_OTH_NATIONALITY: string;
      APP_COMP_STATUS: string;
      APP_OTH_COMP_STATUS: string;
      APP_RES_STATUS: string;
      APP_RES_STATUS_PROOF: string;
      APP_UID_NO: string;
      APP_COR_ADD1: string;
      APP_COR_ADD2: string;
      APP_COR_ADD3: string;
      APP_COR_CITY: string;
      APP_COR_PINCD: string;
      APP_COR_STATE: string;
      APP_COR_CTRY: string;
      APP_OFF_NO: string;
      APP_RES_NO: string;
      APP_MOB_NO: string;
      APP_FAX_NO: string;
      APP_EMAIL: string;
      APP_COR_ADD_PROOF: string;
      APP_COR_ADD_REF: string;
      APP_COR_ADD_DT: string;
      APP_PER_ADD1: string;
      APP_PER_ADD2: string;
      APP_PER_ADD3: string;
      APP_PER_CITY: string;
      APP_PER_PINCD: string;
      APP_PER_STATE: string;
      APP_PER_CTRY: string;
      APP_PER_ADD_PROOF: string;
      APP_PER_ADD_REF: string;
      APP_PER_ADD_DT: string;
      APP_INCOME: string;
      APP_OCC: string;
      APP_OTH_OCC: string;
      APP_POL_CONN: string;
      APP_DOC_PROOF: string;
      APP_INTERNAL_REF: string;
      APP_BRANCH_CODE: string;
      APP_MAR_STATUS: string;
      APP_NETWRTH: string;
      APP_NETWORTH_DT: string;
      APP_INCORP_PLC: string;
      APP_OTHERINFO: string;
      APP_FILLER1: string;
      APP_FILLER2: string;
      APP_FILLER3: string;
      APP_REMARKS: string;
      APP_STATUS: string;
      APP_STATUSDT: string;
      APP_ERROR_DESC: string;
      ERROR?: string;
      APP_DUMP_TYPE: string;
      APP_DNLDDT: string;
      APP_KRA_INFO: string;
      APP_SIGNATURE: string;
      APP_FATCA_APPLICABLE_FLAG: string;
      APP_FATCA_BIRTH_PLACE: string;
      APP_FATCA_BIRTH_COUNTRY: string;
      APP_FATCA_COUNTRY_RES: string;
      APP_FATCA_COUNTRY_CITYZENSHIP: string;
      APP_FATCA_DATE_DECLARATION: string;
      APP_STATUS_DESC: string;
    };
    FATCA_ADDL_DTLS?: Array<{
      APP_FATCA_ENTITY_PAN: string;
      APP_FATCA_COUNTRY_RESIDENCY: string;
      APP_FATCA_TAX_IDENTIFICATION_NO: string;
      APP_FATCA_TAX_EXEMPT_FLAG: string;
      APP_FATCA_TAX_EXEMPT_REASON: string;
    }>;
    APP_SUMM_REC: {
      APP_REQ_DATE: string;
      APP_OTHKRA_BATCH: string;
      APP_OTHKRA_CODE: string;
      APP_RESPONSE_DATE: string;
      APP_TOTAL_REC: string;
      NO_OF_FATCA_ADDL_DTLS_RECORDS: string;
    };
  };
};

export type T_APP_PAN_REGISTER_REQUEST_PAYLOAD = {
  APP_REQ_ROOT: {
    APP_PAN_INQ: {
      APP_IOP_FLG: string;
      APP_POS_CODE: string;
      APP_TYPE: string;
      APP_NO: string;
      APP_DATE: string;
      APP_PAN_NO: string;
      APP_PANEX_NO: string;
      APP_PAN_COPY: string;
      APP_EXMT: string;
      APP_EXMT_CAT: string;
      APP_KYC_MODE: string;
      APP_EXMT_ID_PROOF: string;
      APP_IPV_FLAG: string;
      APP_IPV_DATE: string;
      APP_GEN: string;
      APP_NAME: string;
      APP_F_NAME: string;
      APP_REGNO: string;
      APP_DOB_DT: string;
      APP_DOI_DT: string;
      APP_COMMENCE_DT: string;
      APP_NATIONALITY: string;
      APP_OTH_NATIONALITY: string;
      APP_COMP_STATUS: string;
      APP_OTH_COMP_STATUS: string;
      APP_RES_STATUS: string;
      APP_RES_STATUS_PROOF: string;
      APP_UID_NO: string;
      APP_COR_ADD1: string;
      APP_COR_ADD2: string;
      APP_COR_ADD3: string;
      APP_COR_CITY: string;
      APP_COR_PINCD: string;
      APP_COR_STATE: string;
      APP_OTH_COR_STATE: string;
      APP_COR_CTRY: string;
      APP_OFF_NO: string;
      APP_RES_NO: string;
      APP_MOB_NO: string;
      APP_FAX_NO: string;
      APP_EMAIL: string;
      APP_COR_ADD_PROOF: string;
      APP_COR_ADD_REF: string;
      APP_COR_ADD_DT: string;
      APP_PER_ADD1: string;
      APP_PER_ADD2: string;
      APP_PER_ADD3: string;
      APP_PER_CITY: string;
      APP_PER_PINCD: string;
      APP_PER_STATE: string;
      APP_OTH_PER_STATE: string;
      APP_PER_CTRY: string;
      APP_PER_ADD_PROOF: string;
      APP_PER_ADD_REF: string;
      APP_PER_ADD_DT: string;
      APP_INCOME: string;
      APP_OCC: string;
      APP_OTH_OCC: string;
      APP_POL_CONN: string;
      APP_DOC_PROOF: string;
      APP_INTERNAL_REF: string;
      APP_BRANCH_CODE: string;
      APP_MAR_STATUS: string;
      APP_NETWRTH: string;
      APP_NETWORTH_DT: string;
      APP_INCORP_PLC: string;
      APP_OTHERINFO: string;
      APP_FILLER1: string;
      APP_FILLER2: string;
      APP_FILLER3: string;
      APP_DUMP_TYPE: string;
      APP_KRA_INFO: string;
      APP_SIGNATURE: string;
      APP_FATCA_APPLICABLE_FLAG: string;
      APP_FATCA_BIRTH_PLACE: string;
      APP_FATCA_BIRTH_COUNTRY: string;
      APP_FATCA_COUNTRY_RES: string;
      APP_FATCA_COUNTRY_CITYZENSHIP: string;
      APP_FATCA_DATE_DECLARATION: string;
    };
    FATCA_ADDL_DTLS: Array<{
      APP_FATCA_ENTITY_PAN: string;
      APP_FATCA_COUNTRY_RESIDENCY: string;
      APP_FATCA_TAX_IDENTIFICATION_NO: string;
      APP_FATCA_TAX_EXEMPT_FLAG: string;
      APP_FATCA_TAX_EXEMPT_REASON: string;
    }>;
    APP_SUMM_REC: {
      APP_REQ_DATE: string;
      APP_OTHKRA_BATCH: string;
      APP_OTHKRA_CODE: string;
      APP_TOTAL_REC: string;
      NO_OF_FATCA_ADDL_DTLS_RECORDS: string;
    };
  };
};

export interface PanModifyKraPayload {
  panInquiry: PanInquiry;
  fatcaAdditionalDetails?: FatcaAdditionalDetail[]; // empty array when FATCA flag = N
}

interface PanInquiry {
  APP_IOP_FLG: string;
  APP_POS_CODE: string;
  APP_MOBILE_NO: string;
  APP_TYPE: string;
  APP_NO: string;
  APP_DATE: string;

  APP_PAN_NO: string;
  APP_PANEX_NO: string;
  APP_PAN_COPY: string;
  APP_EXMT: string;
  APP_EXMT_CAT: string;

  APP_KYC_MODE: string;
  APP_EXMT_ID_PROOF: string;
  APP_IPV_FLAG: string;
  APP_IPV_DATE: string;

  APP_GEN: string;
  APP_NAME: string;
  APP_F_NAME: string;
  APP_REGNO: string;

  APP_DOB_DT: string;
  APP_DOI_DT: string;
  APP_COMMENCE_DT: string;

  APP_NATIONALITY: string;
  APP_OTH_NATIONALITY: string;
  APP_COMP_STATUS: string;
  APP_OTH_COMP_STATUS: string;

  APP_RES_STATUS: string;
  APP_RES_STATUS_PROOF: string;
  APP_UID_NO: string;

  APP_COR_ADD1: string;
  APP_COR_ADD2: string;
  APP_COR_ADD3: string;
  APP_COR_CITY: string;
  APP_COR_PINCD: string;
  APP_COR_STATE: string;
  APP_COR_CTRY: string;

  APP_OFF_NO: string;
  APP_RES_NO: string;
  APP_MOB_NO: string;
  APP_FAX_NO: string;
  APP_EMAIL: string;

  APP_COR_ADD_PROOF: string;
  APP_COR_ADD_REF: string;
  APP_COR_ADD_DT: string;

  APP_PER_ADD1: string;
  APP_PER_ADD2: string;
  APP_PER_ADD3: string;
  APP_PER_CITY: string;
  APP_PER_PINCD: string;
  APP_PER_STATE: string;
  APP_PER_CTRY: string;
  APP_PER_ADD_PROOF: string;
  APP_PER_ADD_REF: string;
  APP_PER_ADD_DT: string;

  APP_INCOME: string;
  APP_OCC: string;
  APP_OTH_OCC: string;
  APP_POL_CONN: string;
  APP_DOC_PROOF: string;

  APP_INTERNAL_REF: string;
  APP_BRANCH_CODE: string;
  APP_MAR_STATUS: string;

  APP_NETWRTH: string;
  APP_NETWORTH_DT: string;
  APP_INCORP_PLC: string;

  APP_OTHERINFO: string;
  APP_FILLER1: string;
  APP_FILLER2: string;
  APP_FILLER3: string;




  APP_DUMP_TYPE: string;
  APP_DNLDDT: string;
  APP_KRA_INFO: string;
  APP_SIGNATURE: string;

  APP_FATCA_APPLICABLE_FLAG: string;
  APP_FATCA_BIRTH_PLACE: string;
  APP_FATCA_BIRTH_COUNTRY: string;
  APP_FATCA_COUNTRY_RES: string;
  APP_FATCA_COUNTRY_CITYZENSHIP: string;
  APP_FATCA_DATE_DECLARATION: string;
}


interface FatcaAdditionalDetail {
  APP_FATCA_ENTITY_PAN: string;
  APP_FATCA_COUNTRY_RESIDENCY: string;
  APP_FATCA_TAX_IDENTIFICATION_NO: string;
  APP_FATCA_TAX_EXEMPT_FLAG: string;
  APP_FATCA_TAX_EXEMPT_REASON: string;
}

export type T_PAN_MODIFY_RESPONSE = {
  APP_RES_ROOT: {
    APP_PAN_INQ: {
      APP_PAN_NO: string;
      APP_PAN_DOB: string;
      APP_IOP_FLG: string;
      APP_NAME: string;
      APP_STATUS: string;
      APP_STATUS_DESC?: { ERROR?: string } | string;
      APP_MODF_ACK: string;
      APP_STATUSDT: string;
      APP_ENTRYDT: string;
      APP_MODDT: string;
      APP_POS_CODE: string;
      ERROR?: string;
    };
    APP_SUMM_REC: {
      APP_REQ_DATE: string;
      APP_OTHKRA_BATCH: string;
      APP_OTHKRA_CODE: string;
      APP_RESPONSE_DATE: string;
      APP_TOTAL_REC: string;
    };
  };
};

export interface T_PAN_REGISTER_RESPONSE {
  APP_RES_ROOT: {
    APP_PAN_INQ: {
      APP_ENTRYDT: string;
      APP_IOP_FLG: string;
      APP_PAN_DOB: string;
      APP_PAN_NO: string;
      APP_POS_CODE: string;
      APP_REG_ACK: string;
      APP_STATUS: string;
      APP_STATUSDT: string;
      APP_STATUS_DESC: string;
      ERROR?: string;
    };
    APP_SUMM_REC: {
      APP_OTHKRA_BATCH: string;
      APP_OTHKRA_CODE: string;
      APP_REQ_DATE: string;
      APP_TOTAL_REC: string;
      NO_OF_FATCA_ADDL_DTLS_RECORDS: string;
    };
  };
}
