/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import xml2js from "xml2js";
import https from "https";

import type {
  PanModifyKraPayload,
  T_APP_PAN_INQ,
  T_APP_PAN_INQ_DOWNLOAD,
  T_NON_INDIVIDUAL_PAN_DOWNLOAD,
  T_APP_PAN_REGISTER_REQUEST_PAYLOAD,
  T_PAN_MODIFY_RESPONSE,
  T_PAN_REGISTER_RESPONSE,
} from "./kra.types";
import { KraXMLBuilder, KraXMLParser } from "./KraXMLBuilder";
import {
  buildKraNonIndividualAppReqRootXml,
  type KraNonIndAppReqRoot,
} from "./kraNonIndBuilder";
export type KraEnvironment = "UAT" | "PROD";

export interface KraConfig {
  userName: string;
  password: string;
  passKey: string;
  okraCdOrMiId: string;
  env?: KraEnvironment;
}
const insecureAgent = new https.Agent({
  rejectUnauthorized: false, // TEMP FIX
});

export class KraSDK {
  private userName: string;
  private password: string;
  private passKey: string;
  private env: KraEnvironment;
  private encryptedPassword: string | null = null;
  private okraCdOrMiId: string;

  private readonly okraServiceUrl: string;
  private readonly panServiceUrl: string;

  constructor(config: KraConfig) {
    this.password = config.password;
    this.passKey = config.passKey;
    this.env = (config.env || "UAT").toUpperCase() as KraEnvironment;
    this.userName = config.userName;
    this.okraCdOrMiId = config.okraCdOrMiId;

    this.okraServiceUrl =
      this.env === "PROD"
        ? "https://kra.ndml.in/okra-iop/services/OkraServiceImpl"
        : "https://awsapi.meradhan.co/proxy/uat/kra/okra-iop/services/OkraServiceImpl";

    this.panServiceUrl = this.env === "PROD" ? "https://kra.ndml.in/sms-ws/PANServiceImplService" : "https://awsapi.meradhan.co/proxy/uat/kra/sms-ws/PANServiceImplService";
  }

  public async init() {
    await this.ensureEncryptedPassword();
    return this;
  }

  // Password Encryption
  private async fetchEncryptedPassword(): Promise<string | null> {
    const xml = KraXMLBuilder.buildPasswordRequest(this.password, this.passKey);

    const response = await axios.post(this.okraServiceUrl, xml, {
      httpsAgent: insecureAgent,
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: "getPassword",
      },
    });

    const parser = new xml2js.Parser({ explicitArray: false });
    const parsed = await parser.parseStringPromise(response.data);

    return this.extractPassword(parsed);
  }

  public async ensureEncryptedPassword(): Promise<string> {
    if (this.encryptedPassword) return this.encryptedPassword;

    const encrypted = await this.fetchEncryptedPassword();
    if (!encrypted) throw new Error("Failed to generate encrypted password");

    this.encryptedPassword = encrypted;
    return encrypted;
  }

  private extractPassword(soapJson: any): string | null {
    try {
      const body = soapJson["soapenv:Envelope"]["soapenv:Body"];
      const response = body["p359:getPasswordResponse"];
      return response["getPasswordReturn"];
    } catch (err) {
      console.error("Error extracting password:", err);
      return null;
    }
  }

  // 1. PAN Inquiry
  public async panInquiry({
    dob,
    mobile,
    pan,
    reqNo,
  }: {
    pan: string;
    dob: string;
    mobile: string;
    reqNo: string;
  }) {
    const encrypted = await this.ensureEncryptedPassword();

    const xml = KraXMLBuilder.buildPanInquiryXML({
      pan,
      dob,
      mobile,
      reqNo,
      encryptedPassword: encrypted,
      passKey: this.passKey,
      userName: this.userName,
    });

    const response = await axios.post(this.panServiceUrl, xml, {
      httpsAgent: insecureAgent,

      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: "panInquiryDetails",
        Password: encrypted,
      },
    });

    return (await KraXMLBuilder.parseSoapReturn(
      response.data,
    )) as T_APP_PAN_INQ;
  }

  /**
   * Non-Individual inquiry (no DOB in request body).
   * Matches the `_docs` sample inquiry payload shape.
   */
  public async nonIndividualPanInquiry({
    pan,
    mobile,
    reqNo,
  }: {
    pan: string;
    mobile: string;
    reqNo: string;
  }) {
    const encrypted = await this.ensureEncryptedPassword();

    const innerXML = `<APP_REQ_ROOT><APP_PAN_INQ><APP_PAN_NO>${pan}</APP_PAN_NO><APP_MOBILE_NO>${mobile}</APP_MOBILE_NO><APP_REQ_NO>${reqNo}</APP_REQ_NO></APP_PAN_INQ></APP_REQ_ROOT>`;
    const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://service.webservice.pan.kra.ndml.com/">
  <soapenv:Header/>
  <soapenv:Body>
    <ser:panInquiryDetails>
      <arg0><![CDATA[${innerXML}]]></arg0>
      <arg1>${this.userName}</arg1>
      <arg2>${encrypted}</arg2>
      <arg3>${this.passKey}</arg3>
    </ser:panInquiryDetails>
  </soapenv:Body>
</soapenv:Envelope>`;

    const response = await axios.post(this.panServiceUrl, xml, {
      httpsAgent: insecureAgent,
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: "panInquiryDetails",
        Password: encrypted,
      },
    });

    return (await KraXMLBuilder.parseSoapReturn(response.data)) as T_APP_PAN_INQ;
  }

  /**
   * Non-Individual inquiryTwo (no DOB in request body).
   */
  public async nonIndividualPanInquiryTwo({
    pan,
    mobile,
    reqNo,
  }: {
    pan: string;
    mobile: string;
    reqNo: string;
  }) {
    const encrypted = await this.ensureEncryptedPassword();

    const innerXML = `<APP_REQ_ROOT><APP_PAN_INQ><APP_PAN_NO>${pan}</APP_PAN_NO><APP_MOBILE_NO>${mobile}</APP_MOBILE_NO><APP_REQ_NO>${reqNo}</APP_REQ_NO></APP_PAN_INQ></APP_REQ_ROOT>`;
    const xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://service.webservice.pan.kra.ndml.com/">
  <soapenv:Header/>
  <soapenv:Body>
    <ser:panInquiryDetailsTwo>
      <arg0><![CDATA[${innerXML}]]></arg0>
      <arg1>${this.userName}</arg1>
      <arg2>${encrypted}</arg2>
      <arg3>${this.passKey}</arg3>
    </ser:panInquiryDetailsTwo>
  </soapenv:Body>
</soapenv:Envelope>`;

    const response = await axios.post(this.panServiceUrl, xml, {
      httpsAgent: insecureAgent,
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: "panInquiryDetailsTwo",
        Password: encrypted,
      },
    });

    return (await KraXMLBuilder.parseSoapReturn(response.data)) as T_APP_PAN_INQ;
  }

  // 1.1. PAN Inquiry Two
  public async panInquiryTwo({
    dob,
    mobile,
    pan,
    reqNo,
  }: {
    pan: string;
    dob: string;
    mobile: string;
    reqNo: string;
  }) {
    const encrypted = await this.ensureEncryptedPassword();

    const xml = KraXMLBuilder.buildPanInquiryTwoXML({
      pan,
      dob,
      mobile,
      reqNo,
      encryptedPassword: encrypted,
      passKey: this.passKey,
      userName: this.userName,
    });

    const response = await axios.post(this.panServiceUrl, xml, {
      httpsAgent: insecureAgent,

      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: "panInquiryDetailsTwo",
        Password: encrypted,
      },
    });

    return (await KraXMLBuilder.parseSoapReturn(
      response.data,
    )) as T_APP_PAN_INQ;
  }

  // 2. download Kra XML
  public async panDownloadDetailsComplete({
    dob,
    mobile,
    pan,
  }: {
    pan: string;
    dob: string;
    mobile: string;
  }) {
    const encrypted = await this.ensureEncryptedPassword();

    const xml = KraXMLBuilder.buildPanDownloadXML({
      pan,
      dob,
      mobile,
      encryptedPassword: encrypted,
      passKey: this.passKey,
      userName: this.userName,
    });

    const response = await axios.post(this.panServiceUrl, xml, {
      httpsAgent: insecureAgent,

      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: "panDownloadDetailsComplete",
        Password: encrypted,
      },
    });

    return (await KraXMLBuilder.parseSoapReturn(
      response.data,
    )) as T_APP_PAN_INQ_DOWNLOAD;
  }

  /**
   * Non-Individual download response is richer (APP_ADDL_DATA embedded, FATCA blocks, etc).
   * Request is same SOAP method; only return type differs.
   */
  public async nonIndividualPanDownloadDetailsComplete({
    dob,
    mobile,
    pan,
  }: {
    pan: string;
    dob: string;
    mobile: string;
  }) {
    const encrypted = await this.ensureEncryptedPassword();

    const xml = KraXMLBuilder.buildPanDownloadXML({
      pan,
      dob,
      mobile,
      encryptedPassword: encrypted,
      passKey: this.passKey,
      userName: this.userName,
    });

    const response = await axios.post(this.panServiceUrl, xml, {
      httpsAgent: insecureAgent,
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: "panDownloadDetailsComplete",
        Password: encrypted,
      },
    });

    return (await KraXMLBuilder.parseSoapReturn(
      response.data
    )) as T_NON_INDIVIDUAL_PAN_DOWNLOAD;
  }

  // 3. Register PAN / Upload KRA XML
  public async panRegisterUploadKraXML({
    APP_PAN_INQ,
    APP_SUMM_REC,
    FATCA_ADDL_DTLS,
  }: {
    APP_PAN_INQ: T_APP_PAN_REGISTER_REQUEST_PAYLOAD["APP_REQ_ROOT"]["APP_PAN_INQ"];
    FATCA_ADDL_DTLS?: T_APP_PAN_REGISTER_REQUEST_PAYLOAD["APP_REQ_ROOT"]["FATCA_ADDL_DTLS"];
    APP_SUMM_REC: T_APP_PAN_REGISTER_REQUEST_PAYLOAD["APP_REQ_ROOT"]["APP_SUMM_REC"];
  }) {
    const encrypted = await this.ensureEncryptedPassword();
    const resultXmlPayload = KraXMLBuilder.buildRegisterUploadXML({
      APP_PAN_INQ,
      APP_SUMM_REC,
      FATCA_ADDL_DTLS: FATCA_ADDL_DTLS || [],
      encryptedPassword: encrypted,
      okraCdOrMiId: this.okraCdOrMiId,
      passKey: this.passKey,
      userName: this.userName,
    });
    const response = await axios.post(this.okraServiceUrl, resultXmlPayload, {
      httpsAgent: insecureAgent,

      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: "registration",
        Password: encrypted,
      },
    });

    // return (await KraXMLBuilder.parseSoapReturn(response.data)) as any;
    return (await KraXMLParser.parseRegistrationResponse(
      response.data,
    )) as T_PAN_REGISTER_RESPONSE;
  }

  /**
   * Non-Individual Registration (upload KRA XML).
   *
   * Uses the same SOAP `registration` method but builds the inner `<APP_REQ_ROOT>` using
   * `buildKraNonIndividualAppReqRootXml`.
   */
  public async nonIndividualRegisterUploadKraXML(payload: KraNonIndAppReqRoot) {
    const encrypted = await this.ensureEncryptedPassword();
    const innerXml = buildKraNonIndividualAppReqRootXml(payload);

    const buffer = Buffer.from(innerXml, "utf8");
    const byteArray = Array.from(buffer);

    const soap = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:com="http://common.nsdl.com">
  <soapenv:Header/>
  <soapenv:Body>
    <com:registration>
      ${byteArray.map((r) => `<input>${r}</input>`).join("")}
      <userId>${this.userName}</userId>
      <userPassword>${encrypted}</userPassword>
      <passKey>${this.passKey}</passKey>
      <okraCdOrMiId>${this.okraCdOrMiId}</okraCdOrMiId>
    </com:registration>
  </soapenv:Body>
</soapenv:Envelope>`;

    const response = await axios.post(this.okraServiceUrl, soap, {
      httpsAgent: insecureAgent,
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: "registration",
        Password: encrypted,
      },
    });

    return (await KraXMLParser.parseRegistrationResponse(
      response.data
    )) as T_PAN_REGISTER_RESPONSE;
  }

  // 4. Modify PAN Details (KRA XML Upload)
  public async panModifyKraXML(payload: PanModifyKraPayload) {
    const encrypted = await this.ensureEncryptedPassword();
    const xml = KraXMLBuilder.buildPanModifyKraXML({
      encryptedPassword: encrypted,
      passKey: this.passKey,
      userName: this.userName,
      payload,
    });

    const response = await axios.post(this.panServiceUrl, xml, {
      httpsAgent: insecureAgent,

      headers: {
        "Content-Type": "text/xml; charset=utf-8",
      },
    });

    return (await KraXMLParser.parseModifyPdfResponse(
      response.data,
    )) as T_PAN_MODIFY_RESPONSE;
  }

  /**
   * Non-Individual Modify (processModification) using Non-Individual `<APP_REQ_ROOT>`.
   */
  public async nonIndividualModifyKraXML(payload: KraNonIndAppReqRoot) {
    const encrypted = await this.ensureEncryptedPassword();
    const innerXml = buildKraNonIndividualAppReqRootXml(payload).trim();

    const soap = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://service.webservice.pan.kra.ndml.com/">
  <soapenv:Header/>
  <soapenv:Body>
    <ser:processModification>
      <arg0><![CDATA[${innerXml}]]></arg0>
      <arg1>${this.userName}</arg1>
      <arg2>${encrypted}</arg2>
      <arg3>${this.passKey}</arg3>
    </ser:processModification>
  </soapenv:Body>
</soapenv:Envelope>`;

    const response = await axios.post(this.panServiceUrl, soap, {
      httpsAgent: insecureAgent,
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: "processModification",
        Password: encrypted,
      },
    });

    return (await KraXMLParser.parseModifyPdfResponse(
      response.data
    )) as T_PAN_MODIFY_RESPONSE;
  }
}

// const kra = new KraSDK({
//   userName: "MERADHAN",
//   password: "Ndml@123",
//   passKey: "A1b2C3d4@XyZ!",
//   okraCdOrMiId: "A1249",
//   env: "UAT",
// });

// const provider = await kra.init();

// const encrypted = await provider.ensureEncryptedPassword();
// console.log("Encrypted Password:", encrypted);

// const result1 = await provider.panInquiry({
//   pan: "AQBPE7765H",
//   dob: "101011900",
//   mobile: "9299999999",
//   reqNo: "1234567890",
// });

// console.log(result1);

// const result2 = await provider.panDownloadDetailsComplete({
//   pan: result1.APP_RES_ROOT.APP_PAN_INQ.APP_PAN_NO,
//   dob: "01011900",
//   mobile: "9299999999",
// });

// console.log(result2);

// const result3 = await provider.panModifyKraXML({
//   panInquiry: {
//     APP_IOP_FLG: "IE",
//     APP_POS_CODE: "A1249",
//     APP_TYPE: "I",
//     APP_NO: "",
//     APP_DATE: "28-02-2023 00:00:00",
//     APP_PAN_NO: "OWWPF2222C",
//     APP_PANEX_NO: "",
//     APP_PAN_COPY: "Y",
//     APP_EXMT: "N",
//     APP_EXMT_CAT: "",
//     APP_KYC_MODE: "5",
//     APP_EXMT_ID_PROOF: "02",
//     APP_IPV_FLAG: "E",
//     APP_IPV_DATE: "28-02-2023",
//     APP_GEN: "F",
//     APP_NAME: "CHETAN DHLIP GHARMALKAR",
//     APP_F_NAME: "DILIP GHARMALKAR",
//     APP_DOB_DT: "19-03-1999",
//     APP_NATIONALITY: "01",
//     APP_RES_STATUS: "N",
//     APP_UID_NO: "631632583501",
//     APP_COR_ADD1: "S/O Sanser Pal,A-326, Kusum Pur Pahari,Kusum Pur",
//     APP_COR_ADD2: "South West Delhi,Delhi,110057 ",
//     APP_COR_ADD3: "",
//     APP_COR_CITY: "South West Delhi",
//     APP_COR_PINCD: "110057",
//     APP_COR_STATE: "099",
//     APP_COR_CTRY: "103",
//     APP_EMAIL: "SAMTEK109@GMAIL.COM",
//     APP_COR_ADD_PROOF: "31",
//     APP_COR_ADD_REF: "4322",
//     APP_PER_ADD1: " S/O Sanser Pal,A-326, Kusum Pur Pahari,Kusum Pur",
//     APP_PER_ADD2: "South West Delhi,Delhi,110057 ",
//     APP_PER_ADD3: "",
//     APP_PER_CITY: "South West Delhi",
//     APP_PER_PINCD: "110057",
//     APP_PER_STATE: "099",
//     APP_PER_CTRY: "102",
//     APP_INCOME: "",
//     APP_OCC: "",
//     APP_POL_CONN: "NA",
//     APP_DOC_PROOF: "E",
//     APP_FATCA_APPLICABLE_FLAG: "N",
//     APP_FATCA_BIRTH_PLACE: "THANE",
//     APP_FATCA_BIRTH_COUNTRY: "DE",
//     APP_FATCA_COUNTRY_CITYZENSHIP: "IO",
//     APP_FATCA_DATE_DECLARATION: "01-01-2024",
//     APP_MOBILE_NO: "9299999999",
//   },
//   // FATCA_ADDL_DTLS: [
//   //   {
//   //     APP_FATCA_ENTITY_PAN: "OWWPF2222C",
//   //     APP_FATCA_COUNTRY_RESIDENCY: "DE",
//   //     APP_FATCA_TAX_IDENTIFICATION_NO: "8900984738893393",
//   //     APP_FATCA_TAX_EXEMPT_FLAG: "N",
//   //     APP_FATCA_TAX_EXEMPT_REASON: "",
//   //   },
//   // ],

//   fatcaAdditionalDetails: [
//     {
//       APP_FATCA_COUNTRY_RESIDENCY: "DE",
//       APP_FATCA_ENTITY_PAN: "OWWPF2222C",
//       APP_FATCA_TAX_EXEMPT_FLAG: "N",
//       APP_FATCA_TAX_EXEMPT_REASON: "",
//       APP_FATCA_TAX_IDENTIFICATION_NO: "8900984738893393",
//     },
//   ],
// });

// console.log({ result3 });

// const result4 = await provider.panRegisterUploadKraXML({
//   APP_PAN_INQ: {
//     APP_IOP_FLG: "IE",
//     APP_POS_CODE: "A1249",
//     APP_TYPE: "I",
//     APP_NO: "",
//     APP_DATE: "28-02-2023 00:00:00",
//     APP_PAN_NO: "OWWPF2222C",
//     APP_PANEX_NO: "",
//     APP_PAN_COPY: "Y",
//     APP_EXMT: "N",
//     APP_EXMT_CAT: "",
//     APP_KYC_MODE: "5",
//     APP_EXMT_ID_PROOF: "02",
//     APP_IPV_FLAG: "E",
//     APP_IPV_DATE: "28-02-2023",
//     APP_GEN: "F",
//     APP_NAME: "CHETAN DHLIP GHARMALKAR",
//     APP_F_NAME: "DILIP GHARMALKAR",
//     APP_REGNO: "",
//     APP_DOB_DT: "19-03-1999",
//     APP_DOI_DT: "09-03-2002",
//     APP_COMMENCE_DT: "",
//     APP_NATIONALITY: "01",
//     APP_OTH_NATIONALITY: "",
//     APP_COMP_STATUS: "",
//     APP_OTH_COMP_STATUS: "",
//     APP_RES_STATUS: "N",
//     APP_RES_STATUS_PROOF: "",
//     APP_UID_NO: "631632583501",
//     APP_COR_ADD1: "S/O Sanser Pal,A-326, Kusum Pur Pahari,Kusum Pur",
//     APP_COR_ADD2: "South West Delhi,Delhi,110057 ",
//     APP_COR_ADD3: "",
//     APP_COR_CITY: "South West Delhi",
//     APP_COR_PINCD: "110057",
//     APP_COR_STATE: "099",
//     APP_OTH_COR_STATE: "CALFOR",
//     APP_COR_CTRY: "103",
//     APP_OFF_NO: "",
//     APP_RES_NO: "",
//     APP_MOB_NO: "78990099",
//     APP_FAX_NO: "",
//     APP_EMAIL: "SAMTEK109@GMAIL.COM",
//     APP_COR_ADD_PROOF: "31",
//     APP_COR_ADD_REF: "4322",
//     APP_COR_ADD_DT: "",
//     APP_PER_ADD1: "S/O Sanser Pal,A-326, Kusum Pur Pahari,Kusum Pur",
//     APP_PER_ADD2: "South West Delhi,Delhi,110057 ",
//     APP_PER_ADD3: "",
//     APP_PER_CITY: "South West Delhi",
//     APP_PER_PINCD: "110057",
//     APP_PER_STATE: "099",
//     APP_OTH_PER_STATE: "SINGAPUR",
//     APP_PER_CTRY: "102",
//     APP_PER_ADD_PROOF: "01",
//     APP_PER_ADD_REF: "4322",
//     APP_PER_ADD_DT: "01-01-2025",
//     APP_INCOME: "",
//     APP_OCC: "",
//     APP_OTH_OCC: "",
//     APP_POL_CONN: "NA",
//     APP_DOC_PROOF: "E",
//     APP_INTERNAL_REF: "",
//     APP_BRANCH_CODE: "",
//     APP_MAR_STATUS: "01",
//     APP_NETWRTH: "",
//     APP_NETWORTH_DT: "",
//     APP_INCORP_PLC: "",
//     APP_OTHERINFO: "",
//     APP_FILLER1: "",
//     APP_FILLER2: "",
//     APP_FILLER3: "",
//     APP_DUMP_TYPE: "",
//     APP_KRA_INFO: "",
//     APP_SIGNATURE: "",
//     APP_FATCA_APPLICABLE_FLAG: "N",
//     APP_FATCA_BIRTH_PLACE: "",
//     APP_FATCA_BIRTH_COUNTRY: "",
//     APP_FATCA_COUNTRY_RES: "",
//     APP_FATCA_COUNTRY_CITYZENSHIP: "",
//     APP_FATCA_DATE_DECLARATION: "01-01-2024",
//   },
//   APP_SUMM_REC: {
//     APP_REQ_DATE: "19-11-2025",
//     APP_OTHKRA_BATCH: "ACC0671559052174",
//     APP_OTHKRA_CODE: "A1249",
//     APP_TOTAL_REC: "1",
//     NO_OF_FATCA_ADDL_DTLS_RECORDS: "0",
//   },
// });

// // write ina  file

// console.log(result4);
