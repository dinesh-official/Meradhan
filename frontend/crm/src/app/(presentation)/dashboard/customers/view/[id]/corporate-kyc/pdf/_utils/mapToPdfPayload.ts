import type { CorporateKycResponse, CustomerProfile } from "@root/apiGateway";

/* ------------------------------------------------------------------ */
/* Enums                                                               */
/* ------------------------------------------------------------------ */

export const APPLICATION_TYPES = ["New", "Update"] as const;
export type ApplicationType = (typeof APPLICATION_TYPES)[number];

export const YES_NO = ["Yes", "No"] as const;
export type YesNo = (typeof YES_NO)[number];

export const GENDERS = ["Male", "Female", "Transgender"] as const;
export type Gender = (typeof GENDERS)[number];

export const MARITAL_STATUSES = ["Single", "Married"] as const;
export type MaritalStatus = (typeof MARITAL_STATUSES)[number];

export const NATIONALITIES = ["IN - Indian", "Other"] as const;
export type Nationality = (typeof NATIONALITIES)[number];

export const RESIDENTIAL_STATUSES = [
  "Resident Individual",
  "Non Resident Indian",
  "Foreign National",
  "Person of Indian Origin",
] as const;
export type ResidentialStatus = (typeof RESIDENTIAL_STATUSES)[number];

export const PEP_STATUSES = [
  "Yes - PEP",
  "Yes - Related to PEP",
  "No - PEP / Related to PEP",
] as const;
export type PEPStatus = (typeof PEP_STATUSES)[number];

export const ADDRESS_TYPES = [
  "Residential/Business",
  "Residential",
  "Business",
  "Registered Office",
  "Unspecified",
] as const;
export type AddressType = (typeof ADDRESS_TYPES)[number];

export const ENTITY_TYPES = [
  "Private Limited Co.",
  "Public Limited Co.",
  "Body Corporate",
  "Partnership",
  "Trust/Charity/NGO",
  "HUF",
  "FPI Category I",
  "FPI Category II",
  "AOP",
  "Bank",
  "Government Body",
  "Defence Establishment",
  "Body of Individuals",
  "Society",
  "LLP",
  "Non-Government Organization",
  "Others",
] as const;
export type EntityType = (typeof ENTITY_TYPES)[number];

export const OCCUPATION_TYPES = [
  "Private Sector",
  "Public Sector",
  "Business",
  "Government Sector",
  "Professional",
  "Agriculturist",
  "Retired",
  "Housewife",
  "Student",
  "Forex Dealer",
  "Others",
] as const;
export type OccupationType = (typeof OCCUPATION_TYPES)[number];

export const RELATED_PERSON_TYPES = [
  "Director",
  "Promoter",
  "Karta",
  "Trustee",
  "Partner",
  "Beneficiary",
  "Power of Attorney Holder",
  "Authorized Signatory",
  "Beneficial Owner",
  "Court Appointed Official Proprietor",
  "Others",
] as const;
export type RelatedPersonType = (typeof RELATED_PERSON_TYPES)[number];

export const RISK_PROFILES = ["Aggressive", "Moderate", "Conservative"] as const;
export type RiskProfile = (typeof RISK_PROFILES)[number];

export const DEPOSITORIES = ["CDSL", "NSDL"] as const;
export type Depository = (typeof DEPOSITORIES)[number];

export const KRA_ADDRESS_TYPES = [
  "Residential or Business",
  "Residential",
  "Business",
  "Registered Office",
] as const;
export type KraAddressType = (typeof KRA_ADDRESS_TYPES)[number];

export const FATCA_ENTITY_TYPES = [
  "Financial Institution/ FFI",
  "Direct Reporting NFFE",
] as const;
export type FatcaEntityType = (typeof FATCA_ENTITY_TYPES)[number];

export const GIIN_NOT_AVAILABLE_REASONS = [
  "applied",
  "not-required",
  "not-obtained",
] as const;
export type GIINNotAvailableReason = (typeof GIIN_NOT_AVAILABLE_REASONS)[number];

export const PROMOTER_PEP = ["PEP", "RPEP", "No"] as const;
export type PromoterPep = (typeof PROMOTER_PEP)[number];

/* ------------------------------------------------------------------ */
/* Local mirror of CorporateKycData (the service contract)            */
/* ------------------------------------------------------------------ */

export interface Address {
  addressType?: AddressType;
  line1?: string;
  line2?: string;
  line3?: string;
  city?: string;
  district?: string;
  pincode?: string;
  state?: string;
  country?: string;
}

export interface ProofDocument {
  aadhaarChecked?: boolean;
  aadhaarLastDigits?: string;
  expiryDate1?: string;
  drivingLicenseChecked?: boolean;
  drivingLicenseNumber?: string;
  voterIdChecked?: boolean;
  voterIdNumber?: string;
  passportChecked?: boolean;
  passportNumber?: string;
  expiryDate2?: string;
  nregaChecked?: boolean;
  nregaNumber?: string;
  nprChecked?: boolean;
  nprNumber?: string;
  otherChecked?: boolean;
  otherNumber?: string;
  identificationNumber?: string;
}

export interface OfficeUseDetails {
  kycDate?: string;
  employeeName?: string;
  employeeCode?: string;
  employeeDesignation?: string;
  selfCertifiedReceived?: boolean;
  trueCopiesReceived?: boolean;
  amcIntermediaryCode?: string;
}

export interface EntityIdentityProofs {
  officiallyValidDocument?: boolean;
  certificateOfIncorporation?: boolean;
  registrationCertificate?: boolean;
  memorandumOfArticles?: boolean;
  boardResolution?: boolean;
  trustDeed?: boolean;
  partnershipDeed?: boolean;
  activityProof1?: boolean;
  activityProof2?: boolean;
  powerOfAttorney?: boolean;
}

export interface EntityDetails {
  pan?: string;
  form60?: boolean;
  name?: string;
  dateOfIncorporation?: string;
  placeOfIncorporation?: string;
  dateOfCommencement?: string;
  registrationNumber?: string;
  entityType?: EntityType;
  entityTypeOther?: string;
  proofOfIdentity?: EntityIdentityProofs;
}

export interface EntityProofOfAddress {
  certificateOfIncorporation?: boolean;
  registrationCertificate?: boolean;
  otherDocumentChecked?: boolean;
  otherDocumentText?: string;
  latestTelephoneBill?: boolean;
  latestElectricityBill?: boolean;
  latestBankStatement?: boolean;
  registeredLeaseAgreement?: boolean;
  validityExpiryDate?: string;
  anyOtherProofChecked?: boolean;
  anyOtherProofText?: string;
}

export interface EntityContact {
  email?: string;
  emailAlternate?: string;
  mobile?: string;
  mobileAlternate?: string;
  telephoneOffice?: string;
  fax?: string;
}

export interface RelatedPersonContact {
  email?: string;
  mobile?: string;
  mobileAlternate?: string;
  telephoneOffice?: string;
  telephoneResidence?: string;
}

export interface FATCASelfDeclaration {
  taxResidentIndiaOnly?: boolean;
  taxResidentOther?: boolean;
}

export interface RelatedPerson {
  pan?: string;
  form60?: boolean;
  name?: string;
  maidenName?: string;
  fatherOrSpouseName?: string;
  motherName?: string;
  dateOfBirth?: string;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  nationality?: Nationality;
  residentialStatus?: ResidentialStatus;
  occupationType?: OccupationType;
  occupationOther?: string;
  relatedPersonTypes?: RelatedPersonType[];
  relatedPersonOther?: string;
  din?: string;
  photoUrl?: string;
  proofOfIdentity?: ProofDocument;
  correspondenceAddress?: Address;
  overseasAddress?: Address;
  proofOfAddress?: ProofDocument;
  contact?: RelatedPersonContact;
  fatca?: FATCASelfDeclaration;
  pepStatus?: PEPStatus;
  declarationDate?: string;
  declarationPlace?: string;
  officeUse?: OfficeUseDetails;
}

export interface SettlementAgency {
  nclChecked?: boolean;
  nclCode?: string;
  icclChecked?: boolean;
  icclCode?: string;
  sglChecked?: boolean;
  sglCode?: string;
}

export interface ExistingClientRelationship {
  hasExistingRelationship?: YesNo;
  pan?: string;
  name?: string;
  referrerCodeProvided?: boolean;
  nameProvided?: boolean;
}

export interface AdditionalInfo {
  applicantName?: string;
  applicantPan?: string;
  settlementAgency?: SettlementAgency;
  riskProfile?: RiskProfile;
  existingRelationship?: ExistingClientRelationship;
  acceptedRfqTerms?: boolean;
  acceptedPennyDrop?: boolean;
  date?: string;
}

export interface BankAccount {
  isPrimary?: YesNo;
  accountType?: string;
  ifsc?: string;
  accountNumber?: string;
  nameAsPerBank?: string;
  bankName?: string;
  nameAsPerPan?: string;
  micrCode?: string;
  branch?: string;
}

export interface DematAccount {
  isPrimary?: YesNo;
  depository?: Depository;
  dpName?: string;
  dpId?: string;
  beneficiaryId?: string;
}

export interface BankAnnexure {
  pan?: string;
  applicantName?: string;
  accounts?: BankAccount[];
  place?: string;
  date?: string;
}

export interface DematAnnexure {
  pan?: string;
  applicantName?: string;
  accounts?: DematAccount[];
  place?: string;
  date?: string;
}

export interface Promoter {
  pan?: string;
  name?: string;
  dinOrAadhaar?: string;
  address?: string;
  relationship?: string;
  politicallyExposed?: PromoterPep;
  photoUrl?: string;
}

export interface Annexure1 {
  applicantName?: string;
  applicantPan?: string;
  promoters?: Promoter[];
  minRows?: number;
  date?: string;
}

export interface TaxResidencyRow {
  country?: string;
  tin?: string;
  identificationType?: string;
}

export interface Annexure11 {
  entityName?: string;
  pan?: string;
  dateOfIncorporation?: string;
  placeOfIncorporation?: string;
  countryOfIncorporation?: string;
  addressTypeAtKRA?: KraAddressType;
  entityConstitutionType?: string;
  isTaxResidentElsewhere?: YesNo;
  taxResidencies?: TaxResidencyRow[];
  minTaxResidencyRows?: number;
  usExemptionCode?: string;
  entityType?: FatcaEntityType;
  giin?: string;
  sponsoringEntityName?: string;
  giinNotAvailableReason?: GIINNotAvailableReason;
}

export interface Annexure11PartC {
  isListedCompany?: boolean;
  stockExchanges?: string[];
  isRelatedToListed?: boolean;
  listedCompanyName?: string;
  listedCompanyStockExchange?: string;
  isActiveNFE?: boolean;
  activeNFENature?: string;
  activeNFESubCategory?: string;
  isPassiveNFE?: boolean;
  passiveNFENature?: string;
  uboFormSubmitted?: boolean;
  forName?: string;
  name?: string;
  designation?: string;
  dinPan?: string;
  date?: string;
  place?: string;
}

export interface UBO {
  name?: string;
  fatherName?: string;
  gender?: string;
  address?: string;
  dateOfBirth?: string;
  countryOfBirth?: string;
  nationality?: string;
  isUSPerson?: "Y" | "N";
  countryOfTaxResidence?: string;
  tin?: string;
  shareholdingPercent?: string;
  idProofSubmitted?: string;
  relationshipWithEntity?: string;
}

export interface Annexure12 {
  declareWithUBOs?: boolean;
  declareNoUBOs?: boolean;
  ubos?: UBO[];
  forName?: string;
  name?: string;
  designation?: string;
  dinPan?: string;
  date?: string;
  place?: string;
}

export interface NclAnnexureValues {
  participantName?: string;
  participantCode?: string;
  contactPerson?: string;
  contactEmail?: string;
  communicationAddress?: string;
  contactPhone?: string;
  faxNumber?: string;
  bankName?: string;
  bankBranch?: string;
  bankIfsc?: string;
  bankAccountNumber?: string;
  depository?: Depository;
  dpName?: string;
  dpId?: string;
  clientId?: string;
  pan?: string;
  registeredOfficeAddress?: string;
  gstNumber?: string;
  registeredOfficeState?: string;
}

export interface NclAnnexure {
  date?: string;
  values?: NclAnnexureValues;
  authorisedSignatoryName?: string;
  authorisedSignatoryDesignation?: string;
}

export interface CorporateKycData {
  applicationType?: ApplicationType;
  applicationNumber?: string;
  entity?: EntityDetails;
  registeredAddress?: Address;
  /** Local / correspondence address in India (only used when different from registered). */
  correspondenceAddress?: Address;
  entityProofOfAddress?: EntityProofOfAddress;
  entityContact?: EntityContact;
  numberOfRelatedPersons?: number;
  remarks?: string;
  applicantDeclarationDate?: string;
  applicantDeclarationPlace?: string;
  entityOfficeUse?: OfficeUseDetails;
  relatedPerson?: RelatedPerson;
  additionalInfo?: AdditionalInfo;
  bankAnnexure?: BankAnnexure;
  dematAnnexure?: DematAnnexure;
  annexure1?: Annexure1;
  annexure11?: Annexure11;
  annexure11PartC?: Annexure11PartC;
  annexure12?: Annexure12;
  nclAnnexure?: NclAnnexure;
  pdfDocumentsUrls?: string[];
}

/* ------------------------------------------------------------------ */
/* Mapper                                                              */
/* ------------------------------------------------------------------ */

const ENTITY_TYPE_MAP: Record<string, EntityType> = {
  PRIVATE_LIMITED: "Private Limited Co.",
  PUBLIC_LIMITED: "Public Limited Co.",
  BODY_CORPORATE: "Body Corporate",
  PARTNERSHIP: "Partnership",
  TRUST: "Trust/Charity/NGO",
  HUF: "HUF",
  AOP: "AOP",
  BANK: "Bank",
  GOVERNMENT_BODY: "Government Body",
  SOCIETY: "Society",
  LLP: "LLP",
  NGO: "Non-Government Organization",
  OTHER: "Others",
};

function mapEntityType(raw: string | undefined): EntityType | undefined {
  if (!raw) return undefined;
  const upper = raw.toUpperCase();
  if (ENTITY_TYPE_MAP[upper]) return ENTITY_TYPE_MAP[upper];
  if ((ENTITY_TYPES as readonly string[]).includes(raw)) return raw as EntityType;
  return undefined;
}

function toFormDate(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  const s = String(value).trim();
  if (!s) return undefined;
  const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return `${d} / ${m} / ${y}`;
  }
  const dmyMatch = s.match(/^(\d{2})[/-](\d{2})[/-](\d{4})/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return `${d} / ${m} / ${y}`;
  }
  return s;
}

function todayFormDate(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")} / ${String(d.getMonth() + 1).padStart(2, "0")} / ${d.getFullYear()}`;
}

function mapPep(value: string | undefined): PromoterPep {
  const v = (value ?? "").toUpperCase();
  if (v === "PEP") return "PEP";
  if (v === "RPEP") return "RPEP";
  return "No";
}

function mapPepStatus(value: string | undefined): PEPStatus {
  const v = mapPep(value);
  if (v === "PEP") return "Yes - PEP";
  if (v === "RPEP") return "Yes - Related to PEP";
  return "No - PEP / Related to PEP";
}

function mapDepository(value: string | undefined): Depository | undefined {
  if (!value) return undefined;
  const v = value.toUpperCase();
  if (v === "CDSL") return "CDSL";
  if (v === "NSDL") return "NSDL";
  return undefined;
}

function fullAddressLine(parts: Array<string | undefined | null>): string {
  return parts.filter(Boolean).join(", ");
}

/**
 * Build a `CorporateKycData` payload (the contract consumed by the external
 * Corporate-KYC PDF service) from the CRM's `CorporateKycResponse` plus the
 * customer profile.
 *
 * Missing fields are simply left out — the PDF renders blanks per service contract.
 */
export function mapCorporateKycToPdfPayload(
  data: CorporateKycResponse,
  customer?: CustomerProfile | null,
): CorporateKycData {
  const today = todayFormDate();
  const primarySignatory = data.authorisedSignatories?.[0];
  const directors = data.directors ?? [];
  const promotersList = data.promoters ?? [];
  const partnersList = data.partners ?? [];
  const trusteesList = data.trustees ?? [];

  const customerEmail = customer?.emailAddress;
  const customerPhone = customer?.phoneNo;

  const registeredAddress: Address = {
    addressType: "Registered Office",
    line1: data.registeredLine1 ?? data.correspondenceLine1 ?? "",
    line2: data.registeredLine2 ?? data.correspondenceLine2 ?? "",
    line3: data.registeredLine3 ?? "",
    city: data.registeredCity ?? data.correspondenceCity ?? "",
    district: data.registeredDistrict ?? data.correspondenceDistrict ?? "",
    pincode: data.registeredPinCode ?? data.correspondencePinCode ?? "",
    state: data.registeredState ?? data.correspondenceState ?? "",
    country: data.countryOfIncorporation ?? "India",
  };

  const correspondenceAddressTopLevel: Address = {
    addressType: "Business",
    line1: data.correspondenceLine1 ?? "",
    line2: data.correspondenceLine2 ?? "",
    line3: data.correspondenceLine3 ?? "",
    city: data.correspondenceCity ?? "",
    district: data.correspondenceDistrict ?? "",
    pincode: data.correspondencePinCode ?? "",
    state: data.correspondenceState ?? "",
    country: data.countryOfIncorporation ?? "India",
  };

  const relatedPersonAddress: Address = {
    addressType: "Residential",
    line1: data.correspondenceLine1 ?? "",
    line2: data.correspondenceLine2 ?? "",
    line3: data.correspondenceLine3 ?? "",
    city: data.correspondenceCity ?? "",
    district: data.correspondenceDistrict ?? "",
    pincode: data.correspondencePinCode ?? "",
    state: data.correspondenceState ?? "",
    country: data.countryOfIncorporation ?? "India",
  };

  const entityName = data.entityName ?? "";
  const pan = data.panNumber ?? "";
  const place = data.placeOfIncorporation ?? data.correspondenceCity ?? "";

  const bankAccounts: BankAccount[] = (data.bankAccounts ?? []).map((acc) => ({
    isPrimary: acc.isPrimaryAccount ? "Yes" : "No",
    accountType: "Current",
    ifsc: acc.ifscCode ?? "",
    accountNumber: acc.accountNumber ?? "",
    nameAsPerBank: acc.accountHolderName ?? entityName,
    bankName: acc.bankName ?? "",
    nameAsPerPan: entityName,
    micrCode: "",
    branch: acc.branch ?? "",
  }));

  const dematAccounts: DematAccount[] = (data.dematAccounts ?? []).map((acc) => ({
    isPrimary: acc.isPrimary ? "Yes" : "No",
    depository: mapDepository(acc.depository) ?? "NSDL",
    dpName: acc.accountHolderName ?? "",
    dpId: acc.dpId ?? "",
    beneficiaryId: acc.clientId ?? "",
  }));

  // Annexure-1 lists promoters/directors/partners/trustees together; dedupe by
  // id so the same person isn't duplicated if they appear in multiple buckets.
  const promoterRows: Promoter[] = [
    ...directors,
    ...promotersList,
    ...partnersList,
    ...trusteesList,
  ]
    .filter((p, idx, arr) => idx === arr.findIndex((x) => x.id === p.id))
    .map((p) => ({
      pan: p.pan ?? "",
      name: p.fullName ?? "",
      dinOrAadhaar: p.din ?? "",
      address: fullAddressLine([
        data.registeredLine1,
        data.registeredCity,
        data.registeredState,
        data.registeredPinCode,
      ]),
      relationship: p.designation ?? "Director",
      politicallyExposed: mapPep(p.pepDeclaration),
      photoUrl: p.passportPhotoFileUrl,
    }));

  const primaryBank = bankAccounts[0];
  const primaryDemat = dematAccounts[0];

  const relatedPersonTypes: RelatedPersonType[] = ["Authorized Signatory"];
  if (primarySignatory?.designation?.toUpperCase().includes("DIRECTOR")) {
    relatedPersonTypes.push("Director");
  }

  return {
    applicationType: "New",
    applicationNumber: `APP-${data.id ?? data.customerId}`,

    entity: {
      pan,
      form60: false,
      name: entityName,
      dateOfIncorporation: toFormDate(data.dateOfIncorporation),
      placeOfIncorporation: place,
      dateOfCommencement: toFormDate(data.dateOfCommencementOfBusiness),
      registrationNumber: data.cinOrRegistrationNumber ?? "",
      entityType: mapEntityType(data.entityConstitutionType),
      entityTypeOther: data.otherConstitutionType ?? "",
      proofOfIdentity: {
        officiallyValidDocument: true,
        certificateOfIncorporation: !!data.certificateOfIncorporationUrl,
        registrationCertificate: !!data.cinOrRegistrationNumber,
        memorandumOfArticles: !!data.memorandumCopyUrl,
        boardResolution: !!data.boardResolutionCopyUrl,
        trustDeed: false,
        partnershipDeed: false,
        activityProof1: false,
        activityProof2: false,
        powerOfAttorney: !!data.powerOfAttorneyCopyUrl,
      },
    },

    registeredAddress,
    correspondenceAddress: correspondenceAddressTopLevel,

    entityProofOfAddress: {
      certificateOfIncorporation: !!data.certificateOfIncorporationUrl,
      registrationCertificate: !!data.cinOrRegistrationNumber,
      otherDocumentChecked: !!data.registeredAddressProofCopyUrl,
      otherDocumentText: data.registeredAddressProofType ?? "",
      latestTelephoneBill: false,
      latestElectricityBill: false,
      latestBankStatement: !!data.balanceSheetCopyUrl,
      registeredLeaseAgreement: false,
      validityExpiryDate: "",
      anyOtherProofChecked: false,
      anyOtherProofText: "",
    },

    entityContact: {
      email: primarySignatory?.email ?? customerEmail ?? "",
      emailAlternate: "",
      mobile: primarySignatory?.mobile ?? customerPhone ?? "",
      mobileAlternate: "",
      telephoneOffice: "",
      fax: "",
    },

    numberOfRelatedPersons: Math.max(
      1,
      (data.authorisedSignatories?.length ?? 0) +
        (data.directors?.length ?? 0) +
        (data.partners?.length ?? 0) +
        (data.trustees?.length ?? 0),
    ),
    remarks: "",
    applicantDeclarationDate: today,
    applicantDeclarationPlace: place,

    entityOfficeUse: {
      kycDate: today,
      employeeName: "",
      employeeCode: "",
      employeeDesignation: "",
      selfCertifiedReceived: true,
      trueCopiesReceived: false,
      amcIntermediaryCode: "",
    },

    relatedPerson: {
      pan: primarySignatory?.pan ?? "",
      form60: false,
      name: primarySignatory?.fullName ?? "",
      maidenName: "",
      fatherOrSpouseName: "",
      motherName: "",
      dateOfBirth: "",
      gender: "Male",
      maritalStatus: "Married",
      nationality: "IN - Indian",
      residentialStatus: "Resident Individual",
      occupationType: "Private Sector",
      occupationOther: "",
      relatedPersonTypes,
      relatedPersonOther: "",
      din: primarySignatory?.din ?? "",
      photoUrl: primarySignatory?.passportPhotoFileUrl,
      proofOfIdentity: {
        aadhaarChecked: !!primarySignatory?.aadharCopyFileUrl,
        aadhaarLastDigits: "",
        expiryDate1: "",
        drivingLicenseChecked: false,
        drivingLicenseNumber: "",
        voterIdChecked: false,
        voterIdNumber: "",
        passportChecked: false,
        passportNumber: "",
        expiryDate2: "",
        nregaChecked: false,
        nregaNumber: "",
        nprChecked: false,
        nprNumber: "",
        otherChecked: false,
        otherNumber: "",
        identificationNumber: primarySignatory?.pan ?? "",
      },
      correspondenceAddress: relatedPersonAddress,
      overseasAddress: {
        addressType: "Unspecified",
        line1: "",
        line2: "",
        line3: "",
        city: "",
        district: "",
        pincode: "",
        state: "",
        country: "",
      },
      proofOfAddress: {
        aadhaarChecked: !!primarySignatory?.aadharCopyFileUrl,
        aadhaarLastDigits: "",
        expiryDate1: "",
        drivingLicenseChecked: false,
        drivingLicenseNumber: "",
        voterIdChecked: false,
        voterIdNumber: "",
        passportChecked: false,
        passportNumber: "",
        expiryDate2: "",
        nregaChecked: false,
        nregaNumber: "",
        nprChecked: false,
        nprNumber: "",
        otherChecked: false,
        otherNumber: "",
        identificationNumber: "",
      },
      contact: {
        email: primarySignatory?.email ?? customerEmail ?? "",
        mobile: primarySignatory?.mobile ?? customerPhone ?? "",
        mobileAlternate: "",
        telephoneOffice: "",
        telephoneResidence: "",
      },
      fatca: {
        taxResidentIndiaOnly: !data.fatcaApplicable,
        taxResidentOther: data.fatcaApplicable === true,
      },
      pepStatus: mapPepStatus(primarySignatory?.pepDeclaration),
      declarationDate: today,
      declarationPlace: place,
      officeUse: {
        kycDate: today,
        employeeName: "",
        employeeCode: "",
        employeeDesignation: "",
        selfCertifiedReceived: true,
        trueCopiesReceived: false,
        amcIntermediaryCode: "",
      },
    },

    additionalInfo: {
      applicantName: entityName,
      applicantPan: pan,
      settlementAgency: {
        nclChecked: false,
        nclCode: "",
        icclChecked: false,
        icclCode: "",
        sglChecked: false,
        sglCode: "",
      },
      riskProfile: "Moderate",
      existingRelationship: {
        hasExistingRelationship: "No",
        pan: "",
        name: "",
        referrerCodeProvided: false,
        nameProvided: false,
      },
      acceptedRfqTerms: true,
      acceptedPennyDrop: true,
      date: today,
    },

    bankAnnexure: {
      pan,
      applicantName: entityName,
      accounts: bankAccounts,
      place,
      date: today,
    },

    dematAnnexure: {
      pan,
      applicantName: entityName,
      accounts: dematAccounts,
      place,
      date: today,
    },

    annexure1: {
      applicantName: entityName,
      applicantPan: pan,
      promoters: promoterRows,
      minRows: 4,
      date: today,
    },

    annexure11: {
      entityName,
      pan,
      dateOfIncorporation: toFormDate(data.dateOfIncorporation),
      placeOfIncorporation: place,
      countryOfIncorporation: data.countryOfIncorporation ?? "India",
      addressTypeAtKRA: "Registered Office",
      entityConstitutionType: data.entityConstitutionType ?? "",
      isTaxResidentElsewhere: data.fatcaApplicable ? "Yes" : "No",
      taxResidencies: [
        { country: "India", tin: pan, identificationType: "TIN (PAN)" },
      ],
      minTaxResidencyRows: 3,
      usExemptionCode: "",
      entityType: "Financial Institution/ FFI",
      giin: data.giin ?? "",
      sponsoringEntityName: "",
      giinNotAvailableReason: data.giin ? undefined : "not-required",
    },

    annexure11PartC: {
      isListedCompany: false,
      stockExchanges: [],
      isRelatedToListed: false,
      listedCompanyName: "",
      listedCompanyStockExchange: "",
      isActiveNFE: true,
      activeNFENature: "",
      activeNFESubCategory: "",
      isPassiveNFE: false,
      passiveNFENature: "",
      uboFormSubmitted: true,
      forName: entityName,
      name: primarySignatory?.fullName ?? "",
      designation: primarySignatory?.designation ?? "Director",
      dinPan: primarySignatory
        ? `${primarySignatory.din ?? ""} / ${primarySignatory.pan ?? ""}`.trim()
        : "",
      date: today,
      place,
    },

    annexure12: {
      declareWithUBOs: promoterRows.length > 0,
      declareNoUBOs: promoterRows.length === 0,
      ubos: promoterRows.slice(0, 2).map((p) => ({
        name: p.name ?? "",
        fatherName: "",
        gender: "M",
        address: p.address ?? "",
        dateOfBirth: "",
        countryOfBirth: "India",
        nationality: "Indian",
        isUSPerson: "N",
        countryOfTaxResidence: "India",
        tin: p.pan ?? "",
        shareholdingPercent: "",
        idProofSubmitted: "PAN",
        relationshipWithEntity: p.relationship ?? "",
      })),
      forName: entityName,
      name: primarySignatory?.fullName ?? "",
      designation: primarySignatory?.designation ?? "Director",
      dinPan: primarySignatory
        ? `${primarySignatory.din ?? ""} / ${primarySignatory.pan ?? ""}`.trim()
        : "",
      date: today,
      place,
    },

    pdfDocumentsUrls: [
      data.panCopyFileUrl,
      data.certificateOfIncorporationUrl,
      data.memorandumCopyUrl,
      data.boardResolutionCopyUrl,
      data.articlesOfAssociationUrl,
      data.registeredAddressProofCopyUrl,
      data.correspondenceAddressProofCopyUrl,
      data.balanceSheetCopyUrl,
      data.shareHoldingPatternCopyUrl,
      data.directorsListCopyUrl,
      data.powerOfAttorneyCopyUrl,
      data.clientMasterHoldingCopyUrl,
      data.certificateOfCommencementOfBizUrl,
      data.gstCopyUrl,
    ].filter((u): u is string => !!u),

    nclAnnexure: {
      date: today,
      values: {
        participantName: entityName,
        participantCode: "",
        contactPerson: primarySignatory?.fullName ?? "",
        contactEmail: primarySignatory?.email ?? customerEmail ?? "",
        communicationAddress: fullAddressLine([
          data.registeredLine1,
          data.registeredLine2,
          data.registeredCity,
          data.registeredState,
          data.registeredPinCode,
        ]),
        contactPhone: primarySignatory?.mobile ?? customerPhone ?? "",
        faxNumber: "",
        bankName: primaryBank?.bankName ?? "",
        bankBranch: primaryBank?.branch ?? "",
        bankIfsc: primaryBank?.ifsc ?? "",
        bankAccountNumber: primaryBank?.accountNumber ?? "",
        depository: primaryDemat?.depository ?? "NSDL",
        dpName: primaryDemat?.dpName ?? "",
        dpId: primaryDemat?.dpId ?? "",
        clientId: primaryDemat?.beneficiaryId ?? "",
        pan,
        registeredOfficeAddress: fullAddressLine([
          data.registeredLine1,
          data.registeredLine2,
          data.registeredCity,
          data.registeredState,
          data.registeredPinCode,
        ]),
        gstNumber: data.gstNumber ?? "",
        registeredOfficeState: data.registeredState ?? "",
      },
      authorisedSignatoryName: primarySignatory?.fullName ?? "",
      authorisedSignatoryDesignation: primarySignatory?.designation ?? "Director",
    },
  };
}
