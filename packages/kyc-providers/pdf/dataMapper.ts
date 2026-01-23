/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import {
  getFileDataUri,
  getFileUrl,
  getFileUrlToBuffer,
  pdfUrlToBase64,
} from "./helper";
import { getStateSortCode } from "./states/getStateSortCode";
import {
  removeLastCommaChunks,
  splitAddressInto3BalancedLines,
} from "../src/utils/address";

export type Root = {
  step_1: {
    pan: {
      isFatca: boolean;
      lastName: string;
      response: {
        id: string;
        type: string;
        status: string;
        details: {
          pan: {
            dob: string;
            name: string;
            gender: string;
            file_url: string;
            id_number: string;
            document_type: string;
            id_proof_type: string;
          };
          aadhaar: {
            dob: string;
            name: string;
            image: string;
            gender: string;
            file_url: string;
            id_number: string;
            father_name: string;
            document_type: string;
            id_proof_type: string;
            current_address: string;
            last_refresh_date: string;
            permanent_address: string;
            current_address_details: {
              state: string;
              address: string;
              pincode: string;
              district_or_city: string;
              locality_or_post_office: string;
            };
            permanent_address_details: {
              state: string;
              address: string;
              pincode: string;
              district_or_city: string;
              locality_or_post_office: string;
            };
          };
        };
        rules_data: {
          approval_rule: Array<any>;
        };
        retry_count: number;
        completed_at: string;
        processing_done: boolean;
        face_match_status: string;
        validation_result: {};
        face_match_obj_type: string;
        obj_analysis_status: string;
        execution_request_id: string;
      };
      firstName: string;
      panCardNo: string;
      middleName: string;
      checkTerms1: boolean;
      checkTerms2: boolean;
      dateOfBirth: string;
      confirmPanTimestamp: string;
      confirmAadhaarTimestamp: string;
    };
    face: {
      url: string;
      response: any;
      timestamp: string;
    };
    sign: {
      url: string;
      response: any;
      timestamp: string;
    };
  };
  step_2: {
    fatSpuName: string;
    motherName: string;
    nationality: string;
    maritalStatus: string;
    qualification: string;
    occupationType: string;
    reelWithPerson: string;
    annualGrossIncome: string;
    residentialStatus: string;
    otherOccupationName?: string;
    confirmPersonalInfoTimestamp: string;
  };
  step_3: Array<{
    bankName: string;
    ifscCode: string;
    response: any;
    isDefault: boolean;
    branchName: string;
    checkTerms: boolean;
    isVerified: boolean;
    accountNumber: string;
    bankAccountType: string;
    verifyTimestamp: string;
    beneficiary_name: string;
    confirmBankTimestamp: string;
  }>;
  step_4: Array<{
    dpId: string;
    response: any;
    isDefault: boolean;
    panNumber: Array<string>;
    checkTerms: boolean;
    isVerified: boolean;
    accountType: string;
    depositoryName: string;
    verifyTimestamp: string;
    accountHolderName: string;
    beneficiaryClientId: string;
    confirmDematTimestamp: string;
    depositoryParticipantName: string;
  }>;
  step_5: Array<{
    ans: string;
    opt: Array<string>;
    qus: string;
    index: number;
  }>;
  step_6: {
    terms: boolean;
  };
  stepIndex: number;
  user: {
    emailAddress: string;
    firstName: string;
    lastName: string;
    id: number;
    kycStatus: string;
    userName: string;
    phoneNo: string;
  };
};

// ============================================
// PAGE PROP TYPES
// ============================================

export type Page1Props = {
  applicationType: "NEW" | "UPDATE";
  kycType: "NORMAL" | "PAN_EXEMPTED";
  kycMode: "ONLINE" | "OFFLINE" | "DIGILOCKER";
  panNo: string;
  name: string;
  maidanName?: string;
  fatherSpouseName?: string;
  motherName?: string;
  dateOfBirth: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  maritalStatus?: "SINGLE" | "MARRIED" | "OTHERS";
  nationality?: "INDIAN" | "OTHERS";
  residentialStatus?: string;
  occupationType?: string;
  verifyWith?:
  | "AADHAAR"
  | "DL"
  | "VID"
  | "PASSPORT"
  | "NREGA"
  | "NPR"
  | "OTHERS";
  profilePic?: string;
  signature?: string;
  kycNo: string;
  aadhaarNo: string;
};

export type AddressType = {
  addressType: "RESIDENTIAL" | "BUSINESS" | "REG_OFFICE" | "UNSPECIFIED";
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  city: string;
  state: string;
  district: string;
  pincode: string;
  country: string;
  postOffice: string;
  stateUTCode: string;
};

export type Page2Props = {
  permanentAddress: AddressType;
  currentAddress: {
    sameAsPermanentAddress: boolean;
    data: AddressType;
  };
  proofWith?:
  | "AADHAAR"
  | "DL"
  | "VID"
  | "PASSPORT"
  | "NREGA"
  | "NPR"
  | "OTHERS";
  aadharNo: string;
};

export type Page3Props = {
  FATCAdeclaration: boolean;
  email: string;
  isAPep: "YES" | "NO";
  mobile: string;
};

export type Page4Props = {
  date: string;
  name: string;
  signatureUrl: string;
  place: string;
};

export type Page5Props = {
  documentsReceived:
  | "Certified"
  | "Original"
  | "Self-Attested"
  | "e-document"
  | "DigitalKYC"
  | "UIDAI"
  | "VideoKyc";
  empSignature: string;
};

export type Page6Props = {
  eAaDhar: string;
};

export type Page7Props = {
  ePan: string;
};

export type Page8Props = {
  face: string;
};

export type Page9Props = {
  sign: string;
};

export type Page10Props = {};

export type Page11Props = {
  primaryBank: {
    accountNumber: string;
    bankName: string;
    ifscCode: string;
    branch: string;
    micrCode: string;
    isPrimary: boolean;
    nameAsPerBank: string;
    accountType: string;
  };
  primaryDemat: {
    beneficiaryId: string;
    depository: string;
    dpId: string;
    dpName: string;
    isPrimary: boolean;
    nameAsPerPAN: string;
  };
  signatureUrl: string;
};

export type Page12Props = {
  annualGrossIncome: string;
  nameOfStockBroker: string;
  subBroker: string;
  clientCode: string;
  exchanges: string;
  website: string;
  detailsOfDisputes: string;
  investmentExperience: string;
};

export type Page13Props = {
  introducerName: string;
  introducerStatus: string;
  introducerAddress: string;
  introducerPhone: string;
  email: string;
  firstName: string;
  lastName: string;
  city: string;
  state: string;
  signatureUrl: string;
};

export type Page14Props = {
  firstName: string;
  middleName: string;
  lastName: string;
  participantCode: string;
  email: string;
  address: string;
  mobile: string;
};

export type Page15Props = {
  bankName: string;
  bankBranch: string;
  ifscCode: string;
  accountNumber: string;
  isDefaultBank: boolean;
  depository: string;
  dpName: string;
  dpId: string;
  clientId: string;
  pan: string;
  firstName: string;
  middleName: string;
  lastName: string;
  signatureUrl: string;
};

export type Page16Props = {
  banks: Array<{
    accountType: string;
    ifscCode: string;
    accountNumber: string;
    accountHolderName: string;
    micrCode: string;
    bankName: string;
    branch: string;
    defaultAccount: boolean;
  }>;
};

export type Page17Props = {
  demates: Array<{
    defaultAccount: boolean;
    depository: string;
    depositoryParticipantName: string;
    accountHolderName: string;
    dpId: string;
    clientId: string;
    accountType: string;
    id: string;
    pan: string;
    response: any;
  }>;
};

export type Page38Props = {
  nominees: Array<any>;
  defaultAddress: string;
};

export type Page39Props = {
  firstName: string;
  lastName: string;
  nomineeName: string;
  hasNominee: boolean;
  signatureUrl: string;
};

export type Page42Props = {
  firstName: string;
  lastName: string;
  uccId: string;
  signatureUrl: string;
};

export type Page47Props = {
  name: string;
  place: string;
  date: string;
  signatureUrl: string;
};

export type Page48Props = {
  name: string;
  place: string;
  date: string;
  signatureUrl: string;
};

// Static content pages (no props required)
export type Page18Props = {};
export type Page19Props = {};
export type Page20Props = {};
export type Page21Props = {};
export type Page22Props = {};
export type Page23Props = {};
export type Page24Props = {};
export type Page25Props = {};
export type Page26Props = {};
export type Page27Props = {};
export type Page28Props = {};
export type Page29Props = {};
export type Page30Props = {};
export type Page31Props = {};
export type Page32Props = {};
export type Page33Props = {};
export type Page34Props = {};
export type Page35Props = {};
export type Page36Props = {};
export type Page36_1Props = {};
export type Page36_2Props = {};
export type Page36_3Props = {};
export type Page37Props = {};
export type Page40Props = {};
export type Page41Props = {};
export type Page43Props = {};
export type Page44Props = { email: string };
export type Page45Props = {};
export type Page46Props = {};

// ============================================
// UTILITY FUNCTIONS
// ============================================

const getFullName = (data: Root): string => {
  return `${data.step_1?.pan?.firstName || ""} ${data.step_1?.pan?.middleName || ""
    } ${data.step_1?.pan?.lastName || ""}`.trim();
};

const getFirstLastName = (data: Root) => ({
  firstName: data.step_1?.pan?.firstName || "",
  lastName: data.step_1?.pan?.lastName || "",
});

const getAddress = (data: Root) => {
  const address =
    data.step_1?.pan?.response?.details?.aadhaar?.current_address_details;
  return {
    full: data.step_1?.pan?.response?.details?.aadhaar?.current_address || "",
    city: address?.district_or_city || "",
    state: address?.state || "",
    pincode: address?.pincode || "",
    combined: `${address?.district_or_city || ""} ${address?.state || ""} ${address?.pincode || ""
      }`.trim(),
  };
};

const getSignatureUrl = async (data: Root) =>
  await getFileDataUri(data.step_1?.sign?.url || "");

const getInvestmentExperience = (data: Root): string => {
  const experienceQuestion = data.step_5?.find((q) =>
    q.qus
      .toLowerCase()
      .includes(
        "How many years of investment experience do you have?".toLocaleLowerCase(),
      ),
  );
  return experienceQuestion?.ans.toLowerCase() || "";
};

const getPrimaryBank = (data: Root) => {
  const bank = data.step_3?.find((b) => b.isDefault) || data.step_3?.[0];
  return {
    bankName: bank?.bankName || "",
    bankBranch: bank?.branchName || "",
    ifscCode: bank?.ifscCode || "",
    accountNumber: bank?.accountNumber || "",
    isDefaultBank: bank?.isDefault || false,
  };
};

const getPrimaryDemat = (data: Root) => {
  const demat = data.step_4?.find((d) => d.isDefault) || data.step_4?.[0];
  return {
    depository: demat?.depositoryName || "",
    dpName: demat?.depositoryParticipantName || "",
    dpId:
      (demat?.accountType == "CDSL"
        ? splitInto8(demat.beneficiaryClientId)?.[0] || ""
        : demat?.dpId) || "",
    clientId:
      (demat?.accountType == "CDSL"
        ? splitInto8(demat.beneficiaryClientId)?.[1] || ""
        : demat?.beneficiaryClientId) || "",
  };
};

// ============================================
// PAGE MAPPERS
// ============================================

export const mapDataForPage1 = async (data: Root): Promise<Page1Props> => ({
  applicationType: "NEW",
  kycType: "NORMAL",
  kycMode: "ONLINE",
  panNo: data.step_1?.pan?.panCardNo || "",
  name: getFullName(data),
  maidanName: data.step_1?.pan?.middleName || "",
  fatherSpouseName: data.step_2?.fatSpuName || "",
  motherName: data.step_2?.motherName || "",
  dateOfBirth: data.step_1?.pan?.dateOfBirth || "",
  gender:
    data.step_1?.pan?.response?.details?.aadhaar.gender === "M"
      ? "MALE"
      : data.step_1?.pan?.response?.details?.aadhaar.gender === "F"
        ? "FEMALE"
        : "OTHER",
  maritalStatus:
    (data.step_2?.maritalStatus as "SINGLE" | "MARRIED" | "OTHERS") || "SINGLE",
  nationality: "INDIAN",
  residentialStatus: data.step_2?.residentialStatus || "",
  occupationType: data.step_2?.occupationType || "",
  verifyWith: "AADHAAR",
  profilePic: await getFileDataUri(data.step_1?.face?.url || ""),
  signature: await getFileDataUri(data.step_1?.sign?.url || ""),
  kycNo: "MD" + (100 + (data?.user?.id || 0)),
  aadhaarNo: data.step_1.pan.response.details.aadhaar.id_number,
});

export const mapDataForPage2 = (data: Root): Page2Props => {
  const current_address =
    data.step_1?.pan?.response?.details?.aadhaar?.current_address_details;

  const permanent_address =
    data.step_1?.pan?.response?.details?.aadhaar?.permanent_address_details;

  const perAddress = splitAddressInto3BalancedLines(
    removeLastCommaChunks(permanent_address.address, 3),
  );

  const perAddresBrake = permanent_address.address?.split(",") || [];
  const perCityName = perAddresBrake?.[perAddresBrake.length - 5];

  const isSameAddresss = current_address.address == permanent_address.address;

  const permanentAddress: AddressType = {
    addressType: "RESIDENTIAL",
    addressLine1: perAddress.line1 || "",
    addressLine2: perAddress.line2 || "",
    addressLine3: perAddress.line3 || "",
    city: perCityName || "",
    state: permanent_address?.state || "",
    district: permanent_address?.district_or_city || "",
    pincode: permanent_address?.pincode || "",
    country: "India",
    postOffice: permanent_address?.locality_or_post_office || "",
    stateUTCode: getStateSortCode(permanent_address.state) || "N/A",
  };

  const curAddress = splitAddressInto3BalancedLines(
    removeLastCommaChunks(current_address.address, 3),
  );
  const curAddresBrake = current_address.address?.split(",") || [];
  const curCityName = curAddresBrake?.[curAddresBrake.length - 5];
  const currentAddress: AddressType = {
    addressType: "RESIDENTIAL",
    addressLine1: curAddress.line1 || "",
    addressLine2: curAddress.line2 || "",
    addressLine3: curAddress.line3 || "",
    city: curCityName || "",
    state: current_address?.state || "",
    district: current_address?.district_or_city || "",
    pincode: current_address?.pincode || "",
    country: "India",
    postOffice: current_address?.locality_or_post_office || "",
    stateUTCode: getStateSortCode(current_address.state) || "N/A",
  };

  return {
    permanentAddress,
    currentAddress: {
      sameAsPermanentAddress: isSameAddresss,
      data: isSameAddresss ? permanentAddress : currentAddress,
    },
    proofWith: "AADHAAR",
    aadharNo: data.step_1.pan.response.details.aadhaar.id_number,
  };
};

export const mapDataForPage3 = (data: Root): Page3Props => ({
  FATCAdeclaration: data.step_1?.pan?.isFatca || false,
  email: data.user.emailAddress,
  isAPep: !data.step_1.pan.checkTerms1 ? "YES" : "NO",
  mobile: data.user.phoneNo,
});

export const mapDataForPage4 = async (data: Root): Promise<Page4Props> => {
  const address = getAddress(data);
  return {
    date: new Date().toLocaleDateString("en-GB"),
    name: getFullName(data),
    signatureUrl: await getFileDataUri(data.step_1?.sign?.url || ""),
    place: address.city,
  };
};

export const mapDataForPage5 = (data: Root): Page5Props => ({
  documentsReceived: "e-document",
  empSignature: "",
});

export const mapDataForPage6 = async (data: Root): Promise<Page6Props> => ({
  eAaDhar: data.step_1?.pan?.response?.details?.aadhaar?.file_url
    ? await pdfUrlToBase64(
      getFileUrl(
        data.step_1?.pan?.response?.details?.aadhaar?.file_url || "",
      ),
    )
    : "",
});

export const mapDataForPage7 = async (data: Root): Promise<Page7Props> => ({
  ePan: data.step_1?.pan?.response?.details?.pan?.file_url
    ? await pdfUrlToBase64(
      getFileUrl(data.step_1?.pan?.response?.details?.pan?.file_url || ""),
    )
    : "",
});

export const mapDataForPage8 = async (data: Root): Promise<Page8Props> => ({
  face: await getFileDataUri(data.step_1?.face?.url || ""),
});

export const mapDataForPage9 = async (data: Root): Promise<Page9Props> => ({
  sign: await getFileDataUri(data.step_1?.sign?.url || ""),
});

export const mapDataForPage10 = (data: Root): Page10Props => ({});

export const mapDataForPage11 = async (data: Root): Promise<Page11Props> => {
  const bank = getPrimaryBank(data);
  const demat = getPrimaryDemat(data);
  const primaryBankAccount =
    data.step_3?.find((b) => b.isDefault) || data.step_3?.[0];

  return {
    primaryBank: {
      accountNumber: bank.accountNumber || " ",
      bankName: bank.bankName || " ",
      ifscCode: bank.ifscCode || " ",
      branch: bank.bankBranch || " ",
      micrCode: " ",
      isPrimary: true,
      nameAsPerBank: primaryBankAccount?.beneficiary_name || " ",
      accountType: primaryBankAccount?.bankAccountType || " ",
    },
    primaryDemat: {
      beneficiaryId: demat.clientId,
      depository: demat.depository,
      dpId: demat.dpId,
      dpName: demat.dpName,
      isPrimary: true,
      nameAsPerPAN: getFullName(data),
    },
    signatureUrl: await getFileDataUri(data.step_1?.sign?.url || ""),
  };
};

export const mapDataForPage12 = async (data: Root): Promise<Page12Props> => ({
  annualGrossIncome: data.step_2?.annualGrossIncome || " ",
  nameOfStockBroker: " ",
  subBroker: " ",
  clientCode: " ",
  exchanges: " ",
  website: " ",
  detailsOfDisputes: "NIL",
  investmentExperience: getInvestmentExperience(data),
});

export const mapDataForPage13 = async (data: Root): Promise<Page13Props> => {
  const address = getAddress(data);

  return {
    introducerName: " ",
    introducerStatus: " ",
    introducerAddress: " ",
    introducerPhone: " ",
    email: data.user.emailAddress,
    firstName: data.step_1?.pan?.firstName || " ",
    lastName: data.step_1?.pan?.lastName || " ",
    city: address.city,
    state: address.state,
    signatureUrl: await getFileDataUri(data.step_1?.sign?.url || ""),
  };
};

export const mapDataForPage14 = async (data: Root): Promise<Page14Props> => {
  const address = getAddress(data);
  return {
    firstName: data.step_1?.pan?.firstName || " ",
    middleName: data.step_1?.pan?.middleName || "",
    lastName: data.step_1?.pan?.lastName || " ",
    participantCode: data.user.userName,
    email: data.user.emailAddress,
    address: address.full,
    mobile: data.user.phoneNo || " ",
  };
};

export function splitInto8(str: string): string[] {
  const result: string[] = [];
  for (let i = 0; i < str.length; i += 8) {
    result.push(str.slice(i, i + 8));
  }
  return result;
}

export const mapDataForPage15 = async (data: Root): Promise<Page15Props> => {
  const bank = getPrimaryBank(data);
  const demat = getPrimaryDemat(data);

  return {
    ...bank,
    ...demat,
    pan: data.step_1?.pan?.panCardNo || "",
    firstName: data.step_1?.pan?.firstName || "",
    middleName: data.step_1?.pan?.middleName || "",
    lastName: data.step_1?.pan?.lastName || "",
    signatureUrl: await getFileDataUri(data.step_1?.sign?.url || ""),
  };
};

export const mapDataForPage16 = async (data: Root): Promise<Page16Props> => ({
  banks:
    data.step_3
      ?.filter((b) => !b.isDefault)
      .map((bank) => ({
        accountType: bank.bankAccountType || " ",
        ifscCode: bank.ifscCode || " ",
        accountNumber: bank.accountNumber || " ",
        accountHolderName: bank.beneficiary_name || " ",
        micrCode: " ",
        bankName: bank.bankName || " ",
        branch: bank.branchName || " ",
        defaultAccount: bank.isDefault,
      })) || [],
});

export const mapDataForPage17 = async (data: Root): Promise<Page17Props> => ({
  demates:
    data.step_4
      ?.filter((d) => !d.isDefault)
      .map((demat) => ({
        defaultAccount: demat.isDefault,
        depository: demat.depositoryName || " ",
        depositoryParticipantName: demat.depositoryParticipantName || " ",
        accountHolderName: demat.accountHolderName || " ",
        dpId:
          (demat?.depositoryName == "CDSL"
            ? splitInto8(demat.beneficiaryClientId)?.[0] || ""
            : demat?.dpId) || "",
        clientId:
          (demat?.depositoryName == "CDSL"
            ? splitInto8(demat.beneficiaryClientId)?.[1] || ""
            : demat?.beneficiaryClientId) || "",
        accountType: demat.accountType,
        id: "",
        pan: demat.panNumber?.[0] || "",
        response: demat.response,
      })) || [],
});

export const mapDataForPage38 = (data: Root): Page38Props => {
  const address = getAddress(data);
  return {
    nominees: [],
    defaultAddress: address.combined,
  };
};

export const mapDataForPage39 = async (data: Root): Promise<Page39Props> => ({
  firstName: data.step_1?.pan?.firstName || "",
  lastName: data.step_1?.pan?.lastName || "",
  nomineeName: "",
  hasNominee: false,
  signatureUrl: await getSignatureUrl(data),
});

export const mapDataForPage42 = async (data: Root): Promise<Page42Props> => ({
  firstName: data.step_1?.pan?.firstName || "",
  lastName: data.step_1?.pan?.lastName || "",
  uccId: "",
  signatureUrl: await getSignatureUrl(data),
});

export const mapDataForPage47 = async (data: Root): Promise<Page47Props> => {
  const address = getAddress(data);
  return {
    name: getFullName(data),
    place: address.city,
    date: new Date().toLocaleDateString("en-GB"),
    signatureUrl: await getSignatureUrl(data),
  };
};

export const mapDataForPage48 = async (data: Root): Promise<Page48Props> => {
  const address = getAddress(data);
  return {
    name: getFullName(data),
    place: address.city,
    date: new Date().toLocaleDateString("en-GB"),
    signatureUrl: await getSignatureUrl(data),
  };
};

// Static pages mappers (no data transformation needed)
export const mapDataForPage18 = (data: Root): Page18Props => ({});
export const mapDataForPage19 = (data: Root): Page19Props => ({});
export const mapDataForPage20 = (data: Root): Page20Props => ({});
export const mapDataForPage21 = (data: Root): Page21Props => ({});
export const mapDataForPage22 = (data: Root): Page22Props => ({});
export const mapDataForPage23 = (data: Root): Page23Props => ({});
export const mapDataForPage24 = (data: Root): Page24Props => ({});
export const mapDataForPage25 = (data: Root): Page25Props => ({});
export const mapDataForPage26 = (data: Root): Page26Props => ({});
export const mapDataForPage27 = (data: Root): Page27Props => ({});
export const mapDataForPage28 = (data: Root): Page28Props => ({});
export const mapDataForPage29 = (data: Root): Page29Props => ({});
export const mapDataForPage30 = (data: Root): Page30Props => ({});
export const mapDataForPage31 = (data: Root): Page31Props => ({});
export const mapDataForPage32 = (data: Root): Page32Props => ({});
export const mapDataForPage33 = (data: Root): Page33Props => ({});
export const mapDataForPage34 = (data: Root): Page34Props => ({});
export const mapDataForPage35 = (data: Root): Page35Props => ({});
export const mapDataForPage36 = (data: Root): Page36Props => ({});
export const mapDataForPage36_1 = (data: Root): Page36_1Props => ({});
export const mapDataForPage36_2 = (data: Root): Page36_2Props => ({});
export const mapDataForPage36_3 = (data: Root): Page36_3Props => ({});
export const mapDataForPage37 = (data: Root): Page37Props => ({});
export const mapDataForPage40 = (data: Root): Page40Props => ({});
export const mapDataForPage41 = (data: Root): Page41Props => ({});
export const mapDataForPage43 = (data: Root): Page43Props => ({});
export const mapDataForPage44 = (data: Root): Page44Props => ({
  email: data?.user?.emailAddress,
});
export const mapDataForPage45 = (data: Root): Page45Props => ({});
export const mapDataForPage46 = (data: Root): Page46Props => ({});

// ============================================
// CENTRALIZED MAPPER - Maps all pages at once
// ============================================

export type AllPagesData = {
  page1: Page1Props;
  page2: Page2Props;
  page3: Page3Props;
  page4: Page4Props;
  page5: Page5Props;
  page6: Page6Props;
  page7: Page7Props;
  page8: Page8Props;
  page9: Page9Props;
  page10: Page10Props;
  page11: Page11Props;
  page12: Page12Props;
  page13: Page13Props;
  page14: Page14Props;
  page15: Page15Props;
  page16: Page16Props;
  page17: Page17Props;
  page18: Page18Props;
  page19: Page19Props;
  page20: Page20Props;
  page21: Page21Props;
  page22: Page22Props;
  page23: Page23Props;
  page24: Page24Props;
  page25: Page25Props;
  page26: Page26Props;
  page27: Page27Props;
  page28: Page28Props;
  page29: Page29Props;
  page30: Page30Props;
  page31: Page31Props;
  page32: Page32Props;
  page33: Page33Props;
  page34: Page34Props;
  page35: Page35Props;
  page36: Page36Props;
  page36_1: Page36_1Props;
  page36_2: Page36_2Props;
  page36_3: Page36_3Props;
  page37: Page37Props;
  page38: Page38Props;
  page39: Page39Props;
  page40: Page40Props;
  page41: Page41Props;
  page42: Page42Props;
  page43: Page43Props;
  page44: Page44Props;
  page45: Page45Props;
  page46: Page46Props;
  page47: Page47Props;
  page48: Page48Props;
};

export const mapAllPages = async (data: Root): Promise<AllPagesData> => ({
  page1: await mapDataForPage1(data),
  page2: mapDataForPage2(data),
  page3: mapDataForPage3(data),
  page4: await mapDataForPage4(data),
  page5: mapDataForPage5(data),
  page6: await mapDataForPage6(data),
  page7: await mapDataForPage7(data),
  page8: await mapDataForPage8(data),
  page9: await mapDataForPage9(data),
  page10: mapDataForPage10(data),
  page11: await mapDataForPage11(data),
  page12: await mapDataForPage12(data),
  page13: await mapDataForPage13(data),
  page14: await mapDataForPage14(data),
  page15: await mapDataForPage15(data),
  page16: await mapDataForPage16(data),
  page17: await mapDataForPage17(data),
  page18: mapDataForPage18(data),
  page19: mapDataForPage19(data),
  page20: mapDataForPage20(data),
  page21: mapDataForPage21(data),
  page22: mapDataForPage22(data),
  page23: mapDataForPage23(data),
  page24: mapDataForPage24(data),
  page25: mapDataForPage25(data),
  page26: mapDataForPage26(data),
  page27: mapDataForPage27(data),
  page28: mapDataForPage28(data),
  page29: mapDataForPage29(data),
  page30: mapDataForPage30(data),
  page31: mapDataForPage31(data),
  page32: mapDataForPage32(data),
  page33: mapDataForPage33(data),
  page34: mapDataForPage34(data),
  page35: mapDataForPage35(data),
  page36: mapDataForPage36(data),
  page36_1: mapDataForPage36_1(data),
  page36_2: mapDataForPage36_2(data),
  page36_3: mapDataForPage36_3(data),
  page37: mapDataForPage37(data),
  page38: mapDataForPage38(data),
  page39: await mapDataForPage39(data),
  page40: mapDataForPage40(data),
  page41: mapDataForPage41(data),
  page42: await mapDataForPage42(data),
  page43: mapDataForPage43(data),
  page44: mapDataForPage44(data),
  page45: mapDataForPage45(data),
  page46: mapDataForPage46(data),
  page47: await mapDataForPage47(data),
  page48: await mapDataForPage48(data),
});
