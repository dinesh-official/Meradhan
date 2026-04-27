export type KraNonIndAppAddlData = {
  APP_ADDLDATA_UPDTFLG: string;
  APP_ENTITY_PAN: string;
  APP_ADDLDATA_PAN: string;
  APP_ADDLDATA_NAME: string;
  APP_ADDLDATA_DIN_UID?: string;
  APP_ADDLDATA_DIN?: string;
  // Newer NDML spec includes UID as separate tag (in addition to DIN/UID combined field in some samples)
  APP_ADDLDATA_UID?: string;
  APP_ADDLDATA_RELATIONSHIP: string;
  APP_ADDLDATA_POLCONN?: string;
  APP_ADDLDATA_RESADD1?: string;
  APP_ADDLDATA_RESADD2?: string;
  APP_ADDLDATA_RESADD3?: string;
  APP_ADDLDATA_RESCITY?: string;
  APP_ADDLDATA_RESPINCD?: string;
  APP_ADDLDATA_RESSTATE?: string;
  APP_ADDLDATA_RESCOUNTRY?: string;
  APP_ADDLDATA_FILLER1?: string;
  APP_ADDLDATA_FILLER2?: string;
  APP_ADDLDATA_FILLER3?: string;
  APP_ADDLDATA_STATUS?: string;
  APP_ADDLDATA_STATUSDT?: string;
  APP_ADDLDATA_ERROR_DESC?: string;
};

export type KraNonIndFatcaAddlDtls = {
  APP_FATCA_ENTITY_PAN: string;
  APP_FATCA_COUNTRY_RESIDENCY: string;
  APP_FATCA_TAX_IDENTIFICATION_TYPE?: string;
  APP_FATCA_TAX_IDENTIFICATION_NO?: string;
  APP_FATCA_TAX_EXEMPT_FLAG?: string;
  APP_FATCA_TAX_EXEMPT_REASON?: string;
};

export type KraNonIndPanInq = {
  APP_INT_CODE: string;
  APP_POS_CODE: string;
  APP_TYPE: string;
  APP_NO: string;
  APP_DATE: string;

  APP_EXMT?: string;
  APP_EXMT_CAT?: string;
  APP_EXMT_ID_PROOF?: string;
  APP_IPV_FLAG?: string;
  APP_IPV_DATE?: string;

  APP_GEN?: string;
  APP_NAME: string;
  APP_F_NAME?: string;
  APP_DOB_DT?: string;
  APP_DOI_DT?: string;
  APP_REGNO?: string;
  APP_COMMENCE_DT?: string;

  APP_NATIONALITY?: string;
  APP_OTH_NATIONALITY?: string;
  APP_COMP_STATUS?: string;
  APP_OTH_COMP_STATUS?: string;
  APP_RES_STATUS?: string;
  APP_RES_STATUS_PROOF?: string;

  APP_PAN_NO: string;
  APP_PANEX_NO?: string;
  APP_PAN_COPY?: string;
  APP_UID_NO?: string;

  APP_COR_ADD1?: string;
  APP_COR_ADD2?: string;
  APP_COR_ADD3?: string;
  APP_COR_CITY?: string;
  APP_COR_PINCD?: string;
  APP_COR_STATE?: string;
  APP_COR_CTRY?: string;
  APP_OFF_NO?: string;
  APP_RES_NO?: string;
  APP_MOB_NO?: string;
  APP_FAX_NO?: string;
  APP_EMAIL?: string;
  APP_COR_ADD_PROOF?: string;
  APP_COR_ADD_REF?: string;
  APP_COR_ADD_DT?: string;

  APP_PER_ADD1?: string;
  APP_PER_ADD2?: string;
  APP_PER_ADD3?: string;
  APP_PER_CITY?: string;
  APP_PER_PINCD?: string;
  APP_PER_STATE?: string;
  APP_PER_CTRY?: string;
  APP_PER_ADD_PROOF?: string;
  APP_PER_ADD_REF?: string;
  APP_PER_ADD_DT?: string;

  APP_INCOME?: string;
  APP_OCC?: string;
  APP_OTH_OCC?: string;
  APP_POL_CONN?: string;
  APP_DOC_PROOF?: string;
  APP_INTERNAL_REF?: string;
  APP_BRANCH_CODE?: string;
  APP_MAR_STATUS?: string;
  APP_NETWRTH?: string;
  APP_NETWORTH_DT?: string;
  APP_INCORP_PLC?: string;
  APP_OTHERINFO?: string;

  APP_ACC_OPENDT?: string;
  APP_ACC_ACTIVEDT?: string;
  APP_ACC_UPDTDT?: string;

  APP_FILLER1?: string;
  APP_FILLER2?: string;
  APP_FILLER3?: string;

  APP_STATUS?: string;
  APP_STATUSDT?: string;
  APP_ERROR_DESC?: string;

  APP_DUMP_TYPE?: string;
  APP_DNLDDT?: string;
  APP_IOP_FLG?: string;
  APP_KRA_INFO?: string;
  APP_SIGNATURE?: string;
  APP_KYC_MODE?: string;

  // FATCA flags live inside APP_PAN_INQ in your sample
  APP_FATCA_APPLICABLE_FLAG?: string;
  APP_FATCA_OTHER_SERVICES?: string;
  APP_FATCA_BIRTH_PLACE?: string;
  APP_FATCA_BIRTH_COUNTRY?: string;
  APP_FATCA_COUNTRY_RES?: string;
  APP_FATCA_DATE_DECLARATION?: string;
};

export type KraNonIndSummRec = {
  APP_OTHKRA_CODE: string;
  APP_OTHKRA_BATCH: string;
  APP_REQ_DATE: string;
  APP_ADDLDATA_RECORDS: string;
  APP_TOTAL_REC: string;
  NO_OF_FATCA_ADDL_DTLS_RECORDS: string;
};

export type KraNonIndAppReqRoot = {
  APP_PAN_INQ: KraNonIndPanInq;
  APP_ADDL_DATA?: KraNonIndAppAddlData[];
  FATCA_ADDL_DTLS?: KraNonIndFatcaAddlDtls[];
  APP_SUMM_REC: KraNonIndSummRec;
};

function esc(v: unknown): string {
  if (v == null) return "";
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function tag(name: string, value: unknown): string {
  return `<${name}>${esc(value)}</${name}>`;
}

function emitFromRecord(rec: Record<string, unknown>, order?: string[]): string {
  const keys = order ?? Object.keys(rec);
  return keys.map((k) => tag(k, rec[k])).join("");
}

/**
 * Builds Non-Individual `<APP_REQ_ROOT>` inner XML (for Registration/Modify flows),
 * matching the sample structure you pasted:
 * - one `<APP_PAN_INQ>`
 * - 0..N `<APP_ADDL_DATA>` blocks
 * - 0..N `<FATCA_ADDL_DTLS>` blocks
 * - one `<APP_SUMM_REC>`
 */
export function buildKraNonIndividualAppReqRootXml(payload: KraNonIndAppReqRoot): string {
  const panInq = payload.APP_PAN_INQ as Record<string, unknown>;
  const addl = payload.APP_ADDL_DATA ?? [];
  const fatca = payload.FATCA_ADDL_DTLS ?? [];
  const summ = payload.APP_SUMM_REC as Record<string, unknown>;

  const panInqOrder: string[] = [
    "APP_INT_CODE",
    "APP_POS_CODE",
    "APP_TYPE",
    "APP_NO",
    "APP_DATE",
    "APP_EXMT",
    "APP_EXMT_CAT",
    "APP_EXMT_ID_PROOF",
    "APP_IPV_FLAG",
    "APP_IPV_DATE",
    "APP_GEN",
    "APP_NAME",
    "APP_F_NAME",
    "APP_DOB_DT",
    "APP_DOI_DT",
    "APP_REGNO",
    "APP_COMMENCE_DT",
    "APP_NATIONALITY",
    "APP_OTH_NATIONALITY",
    "APP_COMP_STATUS",
    "APP_OTH_COMP_STATUS",
    "APP_RES_STATUS",
    "APP_RES_STATUS_PROOF",
    "APP_PAN_NO",
    "APP_PANEX_NO",
    "APP_PAN_COPY",
    "APP_UID_NO",
    "APP_COR_ADD1",
    "APP_COR_ADD2",
    "APP_COR_ADD3",
    "APP_COR_CITY",
    "APP_COR_PINCD",
    "APP_COR_STATE",
    "APP_COR_CTRY",
    "APP_OFF_NO",
    "APP_RES_NO",
    "APP_MOB_NO",
    "APP_FAX_NO",
    "APP_EMAIL",
    "APP_COR_ADD_PROOF",
    "APP_COR_ADD_REF",
    "APP_COR_ADD_DT",
    "APP_PER_ADD1",
    "APP_PER_ADD2",
    "APP_PER_ADD3",
    "APP_PER_CITY",
    "APP_PER_PINCD",
    "APP_PER_STATE",
    "APP_PER_CTRY",
    "APP_PER_ADD_PROOF",
    "APP_PER_ADD_REF",
    "APP_PER_ADD_DT",
    "APP_INCOME",
    "APP_OCC",
    "APP_OTH_OCC",
    "APP_POL_CONN",
    "APP_DOC_PROOF",
    "APP_INTERNAL_REF",
    "APP_BRANCH_CODE",
    "APP_MAR_STATUS",
    "APP_NETWRTH",
    "APP_NETWORTH_DT",
    "APP_INCORP_PLC",
    "APP_OTHERINFO",
    "APP_ACC_OPENDT",
    "APP_ACC_ACTIVEDT",
    "APP_ACC_UPDTDT",
    "APP_FILLER1",
    "APP_FILLER2",
    "APP_FILLER3",
    "APP_STATUS",
    "APP_STATUSDT",
    "APP_ERROR_DESC",
    "APP_DUMP_TYPE",
    "APP_DNLDDT",
    "APP_IOP_FLG",
    "APP_KRA_INFO",
    "APP_SIGNATURE",
    "APP_KYC_MODE",
    "APP_FATCA_APPLICABLE_FLAG",
    "APP_FATCA_OTHER_SERVICES",
    "APP_FATCA_BIRTH_PLACE",
    "APP_FATCA_BIRTH_COUNTRY",
    "APP_FATCA_COUNTRY_RES",
    "APP_FATCA_DATE_DECLARATION"
  ];

  const addlOrder: string[] = [
    "APP_ADDLDATA_UPDTFLG",
    "APP_ENTITY_PAN",
    "APP_ADDLDATA_PAN",
    "APP_ADDLDATA_NAME",
    "APP_ADDLDATA_DIN_UID",
    "APP_ADDLDATA_DIN",
    "APP_ADDLDATA_UID",
    "APP_ADDLDATA_RELATIONSHIP",
    "APP_ADDLDATA_POLCONN",
    "APP_ADDLDATA_RESADD1",
    "APP_ADDLDATA_RESADD2",
    "APP_ADDLDATA_RESADD3",
    "APP_ADDLDATA_RESCITY",
    "APP_ADDLDATA_RESPINCD",
    "APP_ADDLDATA_RESSTATE",
    "APP_ADDLDATA_RESCOUNTRY",
    "APP_ADDLDATA_FILLER1",
    "APP_ADDLDATA_FILLER2",
    "APP_ADDLDATA_FILLER3",
    "APP_ADDLDATA_STATUS",
    "APP_ADDLDATA_STATUSDT",
    "APP_ADDLDATA_ERROR_DESC"
  ];

  const fatcaOrder: string[] = [
    "APP_FATCA_ENTITY_PAN",
    "APP_FATCA_COUNTRY_RESIDENCY",
    "APP_FATCA_TAX_IDENTIFICATION_TYPE",
    "APP_FATCA_TAX_IDENTIFICATION_NO",
    "APP_FATCA_TAX_EXEMPT_FLAG",
    "APP_FATCA_TAX_EXEMPT_REASON"
  ];

  const summOrder: string[] = [
    "APP_OTHKRA_CODE",
    "APP_OTHKRA_BATCH",
    "APP_REQ_DATE",
    "APP_ADDLDATA_RECORDS",
    "APP_TOTAL_REC",
    "NO_OF_FATCA_ADDL_DTLS_RECORDS"
  ];

  const appPanInqXml = `<APP_PAN_INQ>${emitFromRecord(panInq, panInqOrder)}</APP_PAN_INQ>`;
  const addlXml = addl
    .map((r) => `<APP_ADDL_DATA>${emitFromRecord(r as unknown as Record<string, unknown>, addlOrder)}</APP_ADDL_DATA>`)
    .join("");
  const fatcaXml = fatca
    .map((r) => `<FATCA_ADDL_DTLS>${emitFromRecord(r as unknown as Record<string, unknown>, fatcaOrder)}</FATCA_ADDL_DTLS>`)
    .join("");
  const summXml = `<APP_SUMM_REC>${emitFromRecord(summ, summOrder)}</APP_SUMM_REC>`;

  return `<APP_REQ_ROOT>${appPanInqXml}${addlXml}${fatcaXml}${summXml}</APP_REQ_ROOT>`;
}

