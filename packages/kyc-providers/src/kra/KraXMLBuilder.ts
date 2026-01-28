import xml2js from "xml2js";
import { parseStringPromise } from "xml2js";
import type {
  PanModifyKraPayload,
  T_APP_PAN_REGISTER_REQUEST_PAYLOAD,
} from "./kra.types";
export class KraXMLBuilder {
  /** Build SOAP XML for getPassword */
  public static buildPasswordRequest(
    password: string,
    passKey: string
  ): string {
    return `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:com="http://common.nsdl.com">
   <soapenv:Header/>
   <soapenv:Body>
      <com:getPassword>
         <password>${password}</password>
         <key>${passKey}</key>
      </com:getPassword>
   </soapenv:Body>
</soapenv:Envelope>`;
  }

  // Pan Inquiry Two XML Builders
  public static buildPanInquiryXML({
    dob,
    encryptedPassword,
    mobile,
    pan,
    reqNo,
    passKey,
    userName,
  }: {
    pan: string;
    dob: string;
    mobile: string;
    reqNo: string;
    encryptedPassword: string;
    passKey: string;
    userName: string;
  }): string {
    const innerXML = this.buildPanInnerRequest(pan, dob, mobile, reqNo);

    return `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://service.webservice.pan.kra.ndml.com/">
   <soapenv:Header/>
   <soapenv:Body>
      <ser:panInquiryDetails>
          <arg0><![CDATA[${innerXML}]]></arg0>
          <arg1>${userName}</arg1>
          <arg2>${encryptedPassword}</arg2>
          <arg3>${passKey}</arg3>
      </ser:panInquiryDetails>
   </soapenv:Body>
</soapenv:Envelope>`;
  }

  /** Build full SOAP XML for PAN Inquiry */
  public static buildPanInquiryTwoXML({
    dob,
    encryptedPassword,
    mobile,
    pan,
    reqNo,
    passKey,
    userName,
  }: {
    pan: string;
    dob: string;
    mobile: string;
    reqNo: string;
    encryptedPassword: string;
    passKey: string;
    userName: string;
  }): string {
    const innerXML = this.buildPanInnerRequest(pan, dob, mobile, reqNo);

    return `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://service.webservice.pan.kra.ndml.com/">
   <soapenv:Header/>
   <soapenv:Body>
      <ser:panInquiryDetailsTwo>
          <arg0><![CDATA[${innerXML}]]></arg0>
          <arg1>${userName}</arg1>
          <arg2>${encryptedPassword}</arg2>
          <arg3>${passKey}</arg3>
      </ser:panInquiryDetailsTwo>
   </soapenv:Body>
</soapenv:Envelope>`;
  }
  /** Build XML body for PAN inquiry (inner CDATA) */
  private static buildPanInnerRequest(
    pan: string,
    dob: string,
    mobile: string,
    reqNo: string
  ): string {
    return `
<APP_REQ_ROOT>
    <APP_PAN_INQ>
        <APP_PAN_NO>${pan}</APP_PAN_NO>
        <APP_PAN_DOB>${new Date(dob).toISOString().split("T")[0]}</APP_PAN_DOB>
        <APP_MOBILE_NO>${mobile}</APP_MOBILE_NO>
        <APP_REQ_NO>${reqNo}</APP_REQ_NO>
    </APP_PAN_INQ>
</APP_REQ_ROOT>`;
  }

  /** Build XML body for PAN Download (inner CDATA) */
  private static buildPanDownloadInnerXML(
    pan: string,
    dob: string,
    mobile: string
  ) {
    return `
<APP_REQ_ROOT>
    <APP_PAN_DOWN>
        <APP_PAN_NO>${pan}</APP_PAN_NO>
        <APP_PAN_DOB>${dob}</APP_PAN_DOB>
        <APP_MOBILE_NO>${mobile}</APP_MOBILE_NO>
    </APP_PAN_DOWN>
</APP_REQ_ROOT>`;
  }

  /** Build complete SOAP Envelope for panDownloadDetailsComplete */
  public static buildPanDownloadXML({
    dob,
    encryptedPassword,
    mobile,
    pan,
    passKey,
    userName,
  }: {
    pan: string;
    dob: string;
    mobile: string;
    encryptedPassword: string;
    passKey: string;
    userName: string;
  }) {
    const innerXML = this.buildPanDownloadInnerXML(pan, dob, mobile);
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://service.webservice.pan.kra.ndml.com/">
   <soapenv:Header/>
   <soapenv:Body>
      <ser:panDownloadDetailsComplete>
          <arg0><![CDATA[${innerXML}]]></arg0>
          <arg1>${userName}</arg1>
          <arg2>${encryptedPassword}</arg2>
          <arg3>${passKey}</arg3>
      </ser:panDownloadDetailsComplete>
   </soapenv:Body>
</soapenv:Envelope>`;
  }

  // Build PAN Registration / KRA XML Upload Inner XML
  static buildRegisterUploadXML({
    APP_PAN_INQ,
    APP_SUMM_REC,
    FATCA_ADDL_DTLS,
    encryptedPassword,
    passKey,
    userName,
    okraCdOrMiId,
  }: {
    APP_PAN_INQ: T_APP_PAN_REGISTER_REQUEST_PAYLOAD["APP_REQ_ROOT"]["APP_PAN_INQ"];
    FATCA_ADDL_DTLS: T_APP_PAN_REGISTER_REQUEST_PAYLOAD["APP_REQ_ROOT"]["FATCA_ADDL_DTLS"];
    APP_SUMM_REC: T_APP_PAN_REGISTER_REQUEST_PAYLOAD["APP_REQ_ROOT"]["APP_SUMM_REC"];
    encryptedPassword: string;
    passKey: string;
    userName: string;
    okraCdOrMiId: string;
  }) {

    const innerXML = this.buildRegisterInnerXML({
      APP_PAN_INQ,
      FATCA_ADDL_DTLS,
      APP_SUMM_REC,
    });

    console.log(innerXML);

    // convert inner xml to buffer
    const buffer = Buffer.from(
      this.buildRegisterInnerXML({
        APP_PAN_INQ,
        FATCA_ADDL_DTLS,
        APP_SUMM_REC,
      }),
      "utf8"
    );

    // convert buffer → array of numbers
    const byteArray = Array.from(buffer);

    // Implementation to build inner XML for PAN Registration
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:com="http://common.nsdl.com">
   <soapenv:Header/>
   <soapenv:Body>
      <com:registration>
        ${byteArray.map((r) => `<input>${r}</input>`).join("")}
        <userId>${userName}</userId>
        <userPassword>${encryptedPassword}</userPassword>
        <passKey>${passKey}</passKey>
        <okraCdOrMiId>${okraCdOrMiId}</okraCdOrMiId>
      </com:registration>
   </soapenv:Body>
</soapenv:Envelope>`; // Placeholder
  }

  // Build PAN Registration / KRA XML Upload Inner XML
  private static buildRegisterInnerXML(data: {
    APP_PAN_INQ: T_APP_PAN_REGISTER_REQUEST_PAYLOAD["APP_REQ_ROOT"]["APP_PAN_INQ"];
    FATCA_ADDL_DTLS?: T_APP_PAN_REGISTER_REQUEST_PAYLOAD["APP_REQ_ROOT"]["FATCA_ADDL_DTLS"];
    APP_SUMM_REC: T_APP_PAN_REGISTER_REQUEST_PAYLOAD["APP_REQ_ROOT"]["APP_SUMM_REC"];
  }) {
    const inq = data.APP_PAN_INQ;
    const fatcaList = data.FATCA_ADDL_DTLS;
    const summ = data.APP_SUMM_REC;

    const fatcaXml = fatcaList
      ?.map(
        (f) => `<FATCA_ADDL_DTLS>
    <APP_FATCA_ENTITY_PAN>${f.APP_FATCA_ENTITY_PAN}</APP_FATCA_ENTITY_PAN>
    <APP_FATCA_COUNTRY_RESIDENCY>${f.APP_FATCA_COUNTRY_RESIDENCY}</APP_FATCA_COUNTRY_RESIDENCY>
    <APP_FATCA_TAX_IDENTIFICATION_NO>${f.APP_FATCA_TAX_IDENTIFICATION_NO}</APP_FATCA_TAX_IDENTIFICATION_NO>
    <APP_FATCA_TAX_EXEMPT_FLAG>${f.APP_FATCA_TAX_EXEMPT_FLAG}</APP_FATCA_TAX_EXEMPT_FLAG>
    <APP_FATCA_TAX_EXEMPT_REASON>${f.APP_FATCA_TAX_EXEMPT_REASON}</APP_FATCA_TAX_EXEMPT_REASON>
  </FATCA_ADDL_DTLS>`
      )
      .join("");

    return `<APP_REQ_ROOT>
  <APP_PAN_INQ>
    <APP_IOP_FLG>${inq.APP_IOP_FLG}</APP_IOP_FLG>
    <APP_POS_CODE>${inq.APP_POS_CODE}</APP_POS_CODE>
    <APP_TYPE>${inq.APP_TYPE}</APP_TYPE>
    <APP_NO>${inq.APP_NO}</APP_NO>
    <APP_DATE>${inq.APP_DATE}</APP_DATE>
    <APP_PAN_NO>${inq.APP_PAN_NO}</APP_PAN_NO>
    <APP_PANEX_NO>${inq.APP_PANEX_NO}</APP_PANEX_NO>
    <APP_PAN_COPY>${inq.APP_PAN_COPY}</APP_PAN_COPY>
    <APP_EXMT>${inq.APP_EXMT}</APP_EXMT>
    <APP_EXMT_CAT>${inq.APP_EXMT_CAT}</APP_EXMT_CAT>
    <APP_KYC_MODE>${inq.APP_KYC_MODE}</APP_KYC_MODE>
    <APP_EXMT_ID_PROOF>${inq.APP_EXMT_ID_PROOF}</APP_EXMT_ID_PROOF>
    <APP_IPV_FLAG>${inq.APP_IPV_FLAG}</APP_IPV_FLAG>
    <APP_IPV_DATE>${inq.APP_IPV_DATE}</APP_IPV_DATE>
    <APP_GEN>${inq.APP_GEN}</APP_GEN>
    <APP_NAME>${inq.APP_NAME}</APP_NAME>
    <APP_F_NAME>${inq.APP_F_NAME}</APP_F_NAME>
    <APP_REGNO>${inq.APP_REGNO}</APP_REGNO>
    <APP_DOB_DT>${inq.APP_DOB_DT}</APP_DOB_DT>
    <APP_DOI_DT>${inq.APP_DOI_DT}</APP_DOI_DT>
    <APP_COMMENCE_DT>${inq.APP_COMMENCE_DT}</APP_COMMENCE_DT>
    <APP_NATIONALITY>${inq.APP_NATIONALITY}</APP_NATIONALITY>
    <APP_OTH_NATIONALITY>${inq.APP_OTH_NATIONALITY}</APP_OTH_NATIONALITY>
    <APP_COMP_STATUS>${inq.APP_COMP_STATUS}</APP_COMP_STATUS>
    <APP_OTH_COMP_STATUS>${inq.APP_OTH_COMP_STATUS}</APP_OTH_COMP_STATUS>
    <APP_RES_STATUS>${inq.APP_RES_STATUS}</APP_RES_STATUS>
    <APP_RES_STATUS_PROOF>${inq.APP_RES_STATUS_PROOF}</APP_RES_STATUS_PROOF>
    <APP_UID_NO>${inq.APP_UID_NO}</APP_UID_NO>
    <APP_COR_ADD1>${inq.APP_COR_ADD1}</APP_COR_ADD1>
    <APP_COR_ADD2>${inq.APP_COR_ADD2}</APP_COR_ADD2>
    <APP_COR_ADD3>${inq.APP_COR_ADD3}</APP_COR_ADD3>
    <APP_COR_CITY>${inq.APP_COR_CITY}</APP_COR_CITY>
    <APP_COR_PINCD>${inq.APP_COR_PINCD}</APP_COR_PINCD>
    <APP_COR_STATE>${inq.APP_COR_STATE}</APP_COR_STATE>
    <APP_OTH_COR_STATE>${inq.APP_OTH_COR_STATE}</APP_OTH_COR_STATE>
    <APP_COR_CTRY>${inq.APP_COR_CTRY}</APP_COR_CTRY>
    <APP_OFF_NO>${inq.APP_OFF_NO}</APP_OFF_NO>
    <APP_RES_NO>${inq.APP_RES_NO}</APP_RES_NO>
    <APP_MOB_NO>${inq.APP_MOB_NO}</APP_MOB_NO>
    <APP_FAX_NO>${inq.APP_FAX_NO}</APP_FAX_NO>
    <APP_EMAIL>${inq.APP_EMAIL}</APP_EMAIL>
    <APP_COR_ADD_PROOF>${inq.APP_COR_ADD_PROOF}</APP_COR_ADD_PROOF>
    <APP_COR_ADD_REF>${inq.APP_COR_ADD_REF}</APP_COR_ADD_REF>
    <APP_COR_ADD_DT>${inq.APP_COR_ADD_DT}</APP_COR_ADD_DT>
    <APP_PER_ADD1>${inq.APP_PER_ADD1}</APP_PER_ADD1>
    <APP_PER_ADD2>${inq.APP_PER_ADD2}</APP_PER_ADD2>
    <APP_PER_ADD3>${inq.APP_PER_ADD3}</APP_PER_ADD3>
    <APP_PER_CITY>${inq.APP_PER_CITY}</APP_PER_CITY>
    <APP_PER_PINCD>${inq.APP_PER_PINCD}</APP_PER_PINCD>
    <APP_PER_STATE>${inq.APP_PER_STATE}</APP_PER_STATE>
    <APP_OTH_PER_STATE>${inq.APP_OTH_PER_STATE}</APP_OTH_PER_STATE>
    <APP_PER_CTRY>${inq.APP_PER_CTRY}</APP_PER_CTRY>
    <APP_PER_ADD_PROOF>${inq.APP_PER_ADD_PROOF}</APP_PER_ADD_PROOF>
    <APP_PER_ADD_REF>${inq.APP_PER_ADD_REF}</APP_PER_ADD_REF>
    <APP_PER_ADD_DT>${inq.APP_PER_ADD_DT}</APP_PER_ADD_DT>
    <APP_INCOME>${inq.APP_INCOME}</APP_INCOME>
    <APP_OCC>${inq.APP_OCC}</APP_OCC>
    <APP_OTH_OCC>${inq.APP_OTH_OCC}</APP_OTH_OCC>
    <APP_POL_CONN>${inq.APP_POL_CONN}</APP_POL_CONN>
    <APP_DOC_PROOF>${inq.APP_DOC_PROOF}</APP_DOC_PROOF>
    <APP_INTERNAL_REF>${inq.APP_INTERNAL_REF}</APP_INTERNAL_REF>
    <APP_BRANCH_CODE>${inq.APP_BRANCH_CODE}</APP_BRANCH_CODE>
    <APP_MAR_STATUS>${inq.APP_MAR_STATUS}</APP_MAR_STATUS>
    <APP_NETWRTH>${inq.APP_NETWRTH}</APP_NETWRTH>
    <APP_NETWORTH_DT>${inq.APP_NETWORTH_DT}</APP_NETWORTH_DT>
    <APP_INCORP_PLC>${inq.APP_INCORP_PLC}</APP_INCORP_PLC>
    <APP_OTHERINFO>${inq.APP_OTHERINFO}</APP_OTHERINFO>
    <APP_FILLER1>${inq.APP_FILLER1}</APP_FILLER1>
    <APP_FILLER2>${inq.APP_FILLER2}</APP_FILLER2>
    <APP_FILLER3>${inq.APP_FILLER3}</APP_FILLER3>
    <APP_DUMP_TYPE>${inq.APP_DUMP_TYPE}</APP_DUMP_TYPE>
    <APP_KRA_INFO>${inq.APP_KRA_INFO}</APP_KRA_INFO>
    <APP_SIGNATURE>${inq.APP_SIGNATURE}</APP_SIGNATURE>
    <APP_FATCA_APPLICABLE_FLAG>${inq.APP_FATCA_APPLICABLE_FLAG}</APP_FATCA_APPLICABLE_FLAG>
    <APP_FATCA_BIRTH_PLACE>${inq.APP_FATCA_BIRTH_PLACE}</APP_FATCA_BIRTH_PLACE>
    <APP_FATCA_BIRTH_COUNTRY>${inq.APP_FATCA_BIRTH_COUNTRY}</APP_FATCA_BIRTH_COUNTRY>
    <APP_FATCA_COUNTRY_RES>${inq.APP_FATCA_COUNTRY_RES}</APP_FATCA_COUNTRY_RES>
    <APP_FATCA_COUNTRY_CITYZENSHIP>${inq.APP_FATCA_COUNTRY_CITYZENSHIP}</APP_FATCA_COUNTRY_CITYZENSHIP>
    <APP_FATCA_DATE_DECLARATION>${inq.APP_FATCA_DATE_DECLARATION}</APP_FATCA_DATE_DECLARATION>
  </APP_PAN_INQ>
  ${fatcaXml || ""}
  <APP_SUMM_REC>
    <APP_REQ_DATE>${summ.APP_REQ_DATE}</APP_REQ_DATE>
    <APP_OTHKRA_BATCH>${summ.APP_OTHKRA_BATCH}</APP_OTHKRA_BATCH>
    <APP_OTHKRA_CODE>${summ.APP_OTHKRA_CODE}</APP_OTHKRA_CODE>
    <APP_TOTAL_REC>${summ.APP_TOTAL_REC}</APP_TOTAL_REC>
    <NO_OF_FATCA_ADDL_DTLS_RECORDS>${summ.NO_OF_FATCA_ADDL_DTLS_RECORDS}</NO_OF_FATCA_ADDL_DTLS_RECORDS>
  </APP_SUMM_REC>
</APP_REQ_ROOT>`;
  }

  // Build PAN Modify KRA XML
  private static buildInnerPanModifyKraXML(data: PanModifyKraPayload) {
    const { panInquiry, fatcaAdditionalDetails } = data;

    // Build FATCA ADDL DETAILS only when flag = Y
    function buildFatcaAddl() {
      if (panInquiry.APP_FATCA_APPLICABLE_FLAG !== "Y") return "";

      return fatcaAdditionalDetails
        ?.map((item) => {
          return `
  <FATCA_ADDL_DTLS>
    <APP_FATCA_ENTITY_PAN>${item.APP_FATCA_ENTITY_PAN || ""}</APP_FATCA_ENTITY_PAN>
    <APP_FATCA_COUNTRY_RESIDENCY>${item.APP_FATCA_COUNTRY_RESIDENCY || ""}</APP_FATCA_COUNTRY_RESIDENCY>
    <APP_FATCA_TAX_IDENTIFICATION_NO>${item.APP_FATCA_TAX_IDENTIFICATION_NO || ""}</APP_FATCA_TAX_IDENTIFICATION_NO>
    <APP_FATCA_TAX_EXEMPT_FLAG>${item.APP_FATCA_TAX_EXEMPT_FLAG || ""}</APP_FATCA_TAX_EXEMPT_FLAG>
    <APP_FATCA_TAX_EXEMPT_REASON>${item.APP_FATCA_TAX_EXEMPT_REASON || ""}</APP_FATCA_TAX_EXEMPT_REASON>
  </FATCA_ADDL_DTLS>`;
        })
        .join("\n");
    }

    // const fatcaCount = panInquiry.APP_FATCA_APPLICABLE_FLAG === "Y" ? fatcaAdditionalDetails?.length : 0;

    // Main PAN_INQ section
    const panInqXML = `
<APP_PAN_INQ>
  <APP_IOP_FLG>${panInquiry.APP_IOP_FLG || ""}</APP_IOP_FLG>
  <APP_POS_CODE>${panInquiry.APP_POS_CODE || ""}</APP_POS_CODE>
  <APP_MOBILE_NO>${panInquiry.APP_MOBILE_NO || ""}</APP_MOBILE_NO>
  <APP_TYPE>${panInquiry.APP_TYPE || ""}</APP_TYPE>
  <APP_NO>${panInquiry.APP_NO || ""}</APP_NO>
  <APP_DATE>${panInquiry.APP_DATE || ""}</APP_DATE>
  <APP_PAN_NO>${panInquiry.APP_PAN_NO || ""}</APP_PAN_NO>
  <APP_PANEX_NO>${panInquiry.APP_PANEX_NO || ""}</APP_PANEX_NO>
  <APP_PAN_COPY>${panInquiry.APP_PAN_COPY || ""}</APP_PAN_COPY>
  <APP_EXMT>${panInquiry.APP_EXMT || ""}</APP_EXMT>
  <APP_EXMT_CAT>${panInquiry.APP_EXMT_CAT || ""}</APP_EXMT_CAT>
  <APP_KYC_MODE>${panInquiry.APP_KYC_MODE || ""}</APP_KYC_MODE>
  <APP_EXMT_ID_PROOF>${panInquiry.APP_EXMT_ID_PROOF || ""}</APP_EXMT_ID_PROOF>
  <APP_IPV_FLAG>${panInquiry.APP_IPV_FLAG || ""}</APP_IPV_FLAG>
  <APP_IPV_DATE>${panInquiry.APP_IPV_DATE || ""}</APP_IPV_DATE>
  <APP_GEN>${panInquiry.APP_GEN || ""}</APP_GEN>
  <APP_NAME>${panInquiry.APP_NAME || ""}</APP_NAME>
  <APP_F_NAME>${panInquiry.APP_F_NAME || ""}</APP_F_NAME>
  <APP_REGNO>${panInquiry.APP_REGNO || ""}</APP_REGNO>
  <APP_DOB_DT>${panInquiry.APP_DOB_DT || ""}</APP_DOB_DT>
  <APP_DOI_DT>${panInquiry.APP_DOI_DT || ""}</APP_DOI_DT>
  <APP_COMMENCE_DT>${panInquiry.APP_COMMENCE_DT || ""}</APP_COMMENCE_DT>
  <APP_NATIONALITY>${panInquiry.APP_NATIONALITY || ""}</APP_NATIONALITY>
  <APP_OTH_NATIONALITY>${panInquiry.APP_OTH_NATIONALITY || ""}</APP_OTH_NATIONALITY>
  <APP_COMP_STATUS>${panInquiry.APP_COMP_STATUS || ""}</APP_COMP_STATUS>
  <APP_OTH_COMP_STATUS>${panInquiry.APP_OTH_COMP_STATUS || ""}</APP_OTH_COMP_STATUS>
  <APP_RES_STATUS>${panInquiry.APP_RES_STATUS || ""}</APP_RES_STATUS>
  <APP_RES_STATUS_PROOF>${panInquiry.APP_RES_STATUS_PROOF || ""}</APP_RES_STATUS_PROOF>
  <APP_UID_NO>${panInquiry.APP_UID_NO || ""}</APP_UID_NO>

  <APP_COR_ADD1>${panInquiry.APP_COR_ADD1 || ""}</APP_COR_ADD1>
  <APP_COR_ADD2>${panInquiry.APP_COR_ADD2 || ""}</APP_COR_ADD2>
  <APP_COR_ADD3>${panInquiry.APP_COR_ADD3 || ""}</APP_COR_ADD3>
  <APP_COR_CITY>${panInquiry.APP_COR_CITY || ""}</APP_COR_CITY>
  <APP_COR_PINCD>${panInquiry.APP_COR_PINCD || ""}</APP_COR_PINCD>
  <APP_COR_STATE>${panInquiry.APP_COR_STATE || ""}</APP_COR_STATE>
  <APP_COR_CTRY>${panInquiry.APP_COR_CTRY || ""}</APP_COR_CTRY>

  <APP_OFF_NO>${panInquiry.APP_OFF_NO || ""}</APP_OFF_NO>
  <APP_RES_NO>${panInquiry.APP_RES_NO || ""}</APP_RES_NO>
  <APP_MOB_NO>${panInquiry.APP_MOB_NO || ""}</APP_MOB_NO>
  <APP_FAX_NO>${panInquiry.APP_FAX_NO || ""}</APP_FAX_NO>

  <APP_EMAIL>${panInquiry.APP_EMAIL || ""}</APP_EMAIL>
  <APP_COR_ADD_PROOF>${panInquiry.APP_COR_ADD_PROOF || ""}</APP_COR_ADD_PROOF>
  <APP_COR_ADD_REF>${panInquiry.APP_COR_ADD_REF || ""}</APP_COR_ADD_REF>
  <APP_COR_ADD_DT>${panInquiry.APP_COR_ADD_DT || ""}</APP_COR_ADD_DT>

  <APP_PER_ADD1>${panInquiry.APP_PER_ADD1 || ""}</APP_PER_ADD1>
  <APP_PER_ADD2>${panInquiry.APP_PER_ADD2 || ""}</APP_PER_ADD2>
  <APP_PER_ADD3>${panInquiry.APP_PER_ADD3 || ""}</APP_PER_ADD3>
  <APP_PER_CITY>${panInquiry.APP_PER_CITY || ""}</APP_PER_CITY>
  <APP_PER_PINCD>${panInquiry.APP_PER_PINCD || ""}</APP_PER_PINCD>
  <APP_PER_STATE>${panInquiry.APP_PER_STATE || ""}</APP_PER_STATE>
  <APP_PER_CTRY>${panInquiry.APP_PER_CTRY || ""}</APP_PER_CTRY>
  <APP_PER_ADD_PROOF>${panInquiry.APP_PER_ADD_PROOF || ""}</APP_PER_ADD_PROOF>
  <APP_PER_ADD_REF>${panInquiry.APP_PER_ADD_REF || ""}</APP_PER_ADD_REF>
  <APP_PER_ADD_DT>${panInquiry.APP_PER_ADD_DT || ""}</APP_PER_ADD_DT>

  <APP_INCOME>${panInquiry.APP_INCOME || ""}</APP_INCOME>
  <APP_OCC>${panInquiry.APP_OCC || ""}</APP_OCC>
  <APP_OTH_OCC>${panInquiry.APP_OTH_OCC || ""}</APP_OTH_OCC>
  <APP_POL_CONN>${panInquiry.APP_POL_CONN || ""}</APP_POL_CONN>
  <APP_DOC_PROOF>${panInquiry.APP_DOC_PROOF || ""}</APP_DOC_PROOF>
  <APP_INTERNAL_REF>${panInquiry.APP_INTERNAL_REF || ""}</APP_INTERNAL_REF>
  <APP_BRANCH_CODE>${panInquiry.APP_BRANCH_CODE || ""}</APP_BRANCH_CODE>
  <APP_MAR_STATUS>${panInquiry.APP_MAR_STATUS || ""}</APP_MAR_STATUS>

   <APP_NETWRTH>${panInquiry.APP_NETWRTH || ""}</APP_NETWRTH>
   <APP_NETWORTH_DT>${panInquiry.APP_NETWORTH_DT || ""}</APP_NETWORTH_DT>
   <APP_INCORP_PLC>${panInquiry.APP_INCORP_PLC || ""}</APP_INCORP_PLC>
   <APP_OTHERINFO>${panInquiry.APP_OTHERINFO || ""}</APP_OTHERINFO>
   <APP_FILLER1>${panInquiry.APP_FILLER1 || ""}</APP_FILLER1>
   <APP_FILLER2>${panInquiry.APP_FILLER2 || ""}</APP_FILLER2>
   <APP_FILLER3>${panInquiry.APP_FILLER3 || ""}</APP_FILLER3>

  <APP_STATUS></APP_STATUS>
  <APP_STATUSDT></APP_STATUSDT>
  <APP_ERROR_DESC></APP_ERROR_DESC>

  <APP_DUMP_TYPE>${panInquiry.APP_DUMP_TYPE || ""}</APP_DUMP_TYPE>
  <APP_DNLDDT>${panInquiry.APP_DNLDDT || ""}</APP_DNLDDT>
  <APP_KRA_INFO>${panInquiry.APP_KRA_INFO || ""}</APP_KRA_INFO>
  <APP_SIGNATURE>${panInquiry.APP_SIGNATURE || ""}</APP_SIGNATURE>

  <APP_FATCA_APPLICABLE_FLAG>${panInquiry.APP_FATCA_APPLICABLE_FLAG || ""}</APP_FATCA_APPLICABLE_FLAG>
  <APP_FATCA_BIRTH_PLACE>${panInquiry.APP_FATCA_BIRTH_PLACE || ""}</APP_FATCA_BIRTH_PLACE>
  <APP_FATCA_BIRTH_COUNTRY>${panInquiry.APP_FATCA_BIRTH_COUNTRY || ""}</APP_FATCA_BIRTH_COUNTRY>
  <APP_FATCA_COUNTRY_RES>${panInquiry.APP_FATCA_COUNTRY_RES || ""}</APP_FATCA_COUNTRY_RES>
  <APP_FATCA_COUNTRY_CITYZENSHIP>${panInquiry.APP_FATCA_COUNTRY_CITYZENSHIP || ""}</APP_FATCA_COUNTRY_CITYZENSHIP>
  <APP_FATCA_DATE_DECLARATION>${panInquiry.APP_FATCA_DATE_DECLARATION || ""}</APP_FATCA_DATE_DECLARATION>
</APP_PAN_INQ>`;

    // Summary block
    const summaryXML = `
<APP_SUMM_REC>
  <APP_REQ_DATE>${panInquiry.APP_DATE || ""}</APP_REQ_DATE>
  <APP_OTHKRA_BATCH></APP_OTHKRA_BATCH>
  <APP_OTHKRA_CODE>${panInquiry.APP_POS_CODE || ""}</APP_OTHKRA_CODE>
  <APP_RESPONSE_DATE></APP_RESPONSE_DATE>
  <APP_TOTAL_REC>1</APP_TOTAL_REC>
  <NO_OF_FATCA_ADDL_DTLS_RECORDS>${fatcaAdditionalDetails?.length.toString() || "0"}</NO_OF_FATCA_ADDL_DTLS_RECORDS>
</APP_SUMM_REC>`;

    // Final XML wrapper
    return `
<APP_REQ_ROOT>
${panInqXML}
${buildFatcaAddl()}
${summaryXML}
</APP_REQ_ROOT>`;
  }

  // Build complete SOAP XML for PAN Modify KRA
  public static buildPanModifyKraXML({
    payload,
    encryptedPassword,
    passKey,
    userName,
  }: {
    payload: PanModifyKraPayload;
    encryptedPassword: string;
    passKey: string;
    userName: string;
  }) {
    const innerXML = this.buildInnerPanModifyKraXML(payload);
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://service.webservice.pan.kra.ndml.com/">
  <soapenv:Header/>
  <soapenv:Body>
      <ser:processModification>
          <arg0><![CDATA[${innerXML.trim()}]]></arg0>
          <arg1>${userName}</arg1>
          <arg2>${encryptedPassword}</arg2>
          <arg3>${passKey}</arg3>
      </ser:processModification>
  </soapenv:Body>
</soapenv:Envelope>`;
  }

  // Parse SOAP XML response and extract inner return XML as JSON
  static async parseSoapReturn(xmlString: string) {
    // Parse SOAP XML
    const parser = new xml2js.Parser({ explicitArray: false });
    const soapJson = await parser.parseStringPromise(xmlString);

    const body = soapJson?.["soapenv:Envelope"]?.["soapenv:Body"];
    if (!body) return null;

    // 🔍 Find ANY key containing a <return> field (universal logic)
    const responseKey = Object.keys(body).find(
      (key) =>
        body[key] && typeof body[key] === "object" && "return" in body[key]
    );

    if (!responseKey) return null;

    const responseNode = body[responseKey];
    const innerXML = responseNode["return"];

    if (!innerXML || typeof innerXML !== "string") return null;

    // Parse inner XML into JSON
    const innerParser = new xml2js.Parser({ explicitArray: false });
    const innerJson = await innerParser.parseStringPromise(innerXML);

    return innerJson; // Return ONLY parsed inner XML JSON
  }

  static async decodeByteSoapResponse(soapXml: string): Promise<string> {
    // 1. Extract all <byte> elements
    const bytes = Array.from(soapXml.matchAll(/<byte>(\d+)<\/byte>/g)).map(
      (match) => Number(match[1])
    );

    if (bytes.length === 0) {
      throw new Error("No <byte> elements found in SOAP response.");
    }

    // 2. Convert into Buffer
    const buffer = Buffer.from(bytes);

    // 3. Decode buffer → text XML
    const decodedXml = buffer.toString("utf8");

    // 4. Convert XML → JSON object
    const json = await parseStringPromise(decodedXml, {
      explicitArray: false,
      trim: true,
    });

    return json; // final JSON result
  }
}

export class KraXMLParser {
  static async parseRegistrationResponse(xmlStr: string): Promise<object> {
    function extractBytesFromXML(xml: string): number[] {
      const regex = /<registrationReturn>(\d+)<\/registrationReturn>/g;
      const bytes: number[] = [];
      let match: RegExpExecArray | null;

      while ((match = regex.exec(xml)) !== null) {
        bytes.push(Number(match[1]));
      }
      return bytes;
    }

    function bytesToString(byteArray: number[]): string {
      return byteArray.map((n: number) => String.fromCharCode(n)).join("");
    }

    const byteArray: number[] = extractBytesFromXML(xmlStr);
    const decodedText: string = bytesToString(byteArray);
    return await this.xmlToJson(decodedText);
  }

  static async parseModifyPdfResponse(xmlStr: string) {
    // Step 1: Parse SOAP envelope
    const soapJson = await parseStringPromise(xmlStr, {
      explicitArray: false,
      trim: true,
      mergeAttrs: true,
    });

    // Navigate to inner escaped XML
    const innerEscaped =
      soapJson["soapenv:Envelope"]["soapenv:Body"][
      "ns2:processModificationResponse"
      ]["return"];

    // Step 2: Unescape the inner XML string
    const innerXml = innerEscaped
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&");

    // Step 3: Parse the inner XML
    const innerJson = await parseStringPromise(innerXml, {
      explicitArray: false,
      trim: true,
      mergeAttrs: true,
    });

    return innerJson;
  }

  static async xmlToJson<T>(xmlStr: string): Promise<T> {
    const result = await parseStringPromise(xmlStr, {
      explicitArray: false, // Do not wrap single nodes in arrays
      explicitCharkey: false, // Clean text nodes
      trim: true, // Trim whitespace
      mergeAttrs: true, // Merge attributes into same object
    });

    return result;
  }
}
