import { formatDate } from "../helper";

/** Display string for PDF fields — blank space when no value (React-PDF shows empty line). */
export function pdfStr(v: string | number | undefined | null): string {
  if (v === undefined || v === null) return " ";
  const s = String(v).trim();
  return s === "" ? " " : s;
}

/** Checkboxes: checked only when explicitly true; otherwise unchecked. */
export function pdfChk(v: boolean | undefined | null): boolean {
  return v === true;
}

function fmtIso(s: string | undefined | null): string | undefined {
  if (!s) return undefined;
  try {
    return formatDate(s, "DD/MM/YYYY");
  } catch {
    return s;
  }
}

function hasUrl(u: string | undefined | null | unknown): boolean {
  return typeof u === "string" && u.trim().length > 0;
}

/** All fields optional — pass partial data from API or leave empty for blank PDF. */
export type CorporateKycPdfData = {
  customerId?: number;
  applicationType?: "new" | "update";
  applicationNumber?: string;
  kycNumber?: string;
  kycTypeNormal?: boolean;
  kycTypePanExempted?: boolean;
  kycModeOnline?: boolean;
  kycModeOfflineEkyc?: boolean;
  kycModeDigilocker?: boolean;

  pan?: string;
  form60?: boolean;
  entityName?: string;
  dateOfIncorporation?: string;
  placeOfIncorporation?: string;
  dateOfCommencement?: string;
  registrationNumber?: string;

  /** PDF entity-type checkboxes — only checked when explicitly true in mapped data */
  entityType?: Partial<Record<EntityTypeKey, boolean>>;
  /** Proof-of-identity document checkboxes */
  poi?: Partial<Record<PoiKey, boolean>>;
  othersSpecify?: string;

  registered?: Partial<{
    line1: string;
    line2: string;
    line3: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
    country: string;
  }>;

  correspondence?: Partial<{
    line1: string;
    line2: string;
    line3: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
    country: string;
  }>;

  permanentOverseas?: Partial<{
    addressTypeResidentialBusiness: boolean;
    addressTypeResidential: boolean;
    addressTypeBusiness: boolean;
    addressTypeRegisteredOffice: boolean;
    addressTypeUnspecified: boolean;
    line1: string;
    line2: string;
    line3: string;
    city: string;
    district: string;
    state: string;
    country: string;
    pincode: string;
  }>;
  poaPermanent?: Partial<Record<PoiKey, boolean>>;
  poiExpiry?: string;
  otherPoaText?: string;

  contact?: Partial<{
    email: string;
    alternateEmail: string;
    mobile: string;
    alternateMobile: string;
    fax: string;
    telephoneOff: string;
    telephoneRes: string;
  }>;

  annexuresRelatedPersonsCount?: string;
  remarks?: string;

  fatcaIndiaOnly?: boolean;
  fatcaAnnexure?: boolean;

  pepYes?: boolean;
  pepRelated?: boolean;
  pepNo?: boolean;

  declarationPlace?: string;
  declarationDate?: string;

  officeUse?: Partial<{
    kycBy: string;
    kycDate: string;
    empName: string;
    empCode: string;
    empDesignation: string;
    intermediaryDetails: string;
    selfCertifiedCopies: boolean;
    trueCopiesAttested: boolean;
    amcIntermediaryName: string;
  }>;

  settlementNcl?: boolean;
  settlementIccl?: boolean;
  nclDirectCode?: string;
  icclDirectCode?: string;
  riskAggressive?: boolean;
  riskModerate?: boolean;
  riskConservative?: boolean;
  existingRelationshipYes?: boolean;
  existingRelationshipNo?: boolean;
  existingPan?: string;
  existingName?: string;
  existingReferrerCode?: string;
  part3Pan?: string;
  part3SglDirectCode?: string;

  bankAccounts?: Array<
    Partial<{
      isPrimary: boolean;
      ifsc: string;
      nameAsPerBank: string;
      nameAsPerPan: string;
      branch: string;
      accountType: string;
      accountNumber: string;
      bankName: string;
      micr: string;
    }>
  >;

  dematAccounts?: Array<
    Partial<{
      isPrimary: boolean;
      dpName: string;
      dpId: string;
      depositoryCdsl: boolean;
      depositoryNsdl: boolean;
      beneficiaryId: string;
    }>
  >;

  promoterRows?: Array<
    Partial<{
      pan: string;
      name: string;
      din: string;
      aadhar: string;
      address: string;
      relationship: string;
      passportPhotoAttached: boolean;
      panCopyAttached: boolean;
      aadharCopyAttached: boolean;
      pep: boolean;
      rpep: boolean;
      pepNo: boolean;
    }>
  >;

  /** First related person / director snapshot for Part II (page 3) */
  relatedPerson?: Partial<{
    pan: string;
    form60: boolean;
    name: string;
    maidenName: string;
    fatherOrSpouseName: string;
    motherName: string;
    dob: string;
    genderMale: boolean;
    genderFemale: boolean;
    genderTransgender: boolean;
    maritalSingle: boolean;
    maritalMarried: boolean;
    nationalityIndian: boolean;
    nationalityOther: boolean;
    residentialStatus: Partial<Record<string, boolean>>;
    occupationType: Partial<Record<string, boolean>>;
    relatedPersonType: Partial<Record<string, boolean>>;
    poi: Partial<Record<PoiKey, boolean>>;
    poiIdNumber: string;
    poiExpiry: string;
    correspondence: CorporateKycPdfData["correspondence"];
    addressTypeResidential?: boolean;
    addressTypeBusiness?: boolean;
    din?: string;
  }>;

  nameOfApplicantPart3?: string;
};

export type EntityTypeKey =
  | "privateLimitedCo"
  | "publicLimitedCo"
  | "bodyCorporate"
  | "partnership"
  | "trustCharityNgo"
  | "trust"
  | "charity"
  | "ngo"
  | "huf"
  | "fpiCatI"
  | "fpiCatII"
  | "fpiCatIII"
  | "aop"
  | "bank"
  | "governmentBody"
  | "defenceEstablishment"
  | "bodyOfIndividuals"
  | "society"
  | "llp"
  | "nonGovOrg"
  | "othersSpecify";

export type PoiKey =
  | "officiallyValidDocs"
  | "certificateOfIncorporation"
  | "registrationCertificate"
  | "memorandumArticles"
  | "boardResolution"
  | "trustDeed"
  | "partnershipDeed"
  | "activityProof1"
  | "activityProof2"
  | "powerOfAttorney"
  | "otherDocument"
  | "telephoneBill"
  | "electricityBill"
  | "bankStatement"
  | "registeredLease"
  | "anyOtherPoa"
  | "aadhar"
  | "drivingLicense"
  | "voterId"
  | "passport"
  | "nrega"
  | "npr"
  | "otherPoi";

/** Map API corporate KYC response → optional PDF fields (blank / unchecked when missing). */
export function mapCorporateKycResponseToPdfData(kyc: unknown): CorporateKycPdfData {
  if (!kyc || typeof kyc !== "object") return {};

  const k = kyc as Record<string, unknown>;
  const customerId = typeof k.customerId === "number" ? k.customerId : undefined;

  const pan = (k.panNumber as string) ?? undefined;
  const entityName = (k.entityName as string) ?? undefined;
  const registrationNumber = (k.cinOrRegistrationNumber as string) ?? undefined;

  const dateOfIncorporation = fmtIso(k.dateOfIncorporation as string | undefined);
  const dateOfCommencement = fmtIso(k.dateOfCommencementOfBusiness as string | undefined);
  const placeOfIncorporation = (k.placeOfIncorporation as string) ?? undefined;

  const entityType: CorporateKycPdfData["entityType"] = mapEntityConstitution(
    k.entityConstitutionType as string | undefined,
    k.otherConstitutionType as string | undefined
  );

  const poi: CorporateKycPdfData["poi"] = {
    officiallyValidDocs: false,
    certificateOfIncorporation: hasUrl(k.certificateOfIncorporationUrl),
    registrationCertificate: false,
    memorandumArticles:
      hasUrl(k.memorandumCopyUrl) || hasUrl(k.articlesOfAssociationUrl),
    boardResolution: hasUrl(k.boardResolutionCopyUrl),
    trustDeed: false,
    partnershipDeed: false,
    activityProof1: false,
    activityProof2: false,
    powerOfAttorney: hasUrl(k.powerOfAttorneyCopyUrl),
    otherDocument: false,
    telephoneBill: false,
    electricityBill: false,
    bankStatement: false,
    registeredLease: false,
    anyOtherPoa: false,
  };

  const registered: CorporateKycPdfData["registered"] = {
    line1: (k.registeredLine1 as string) ?? undefined,
    line2: (k.registeredLine2 as string) ?? undefined,
    line3: (k.registeredLine3 as string) ?? undefined,
    city: (k.registeredCity as string) ?? undefined,
    district: (k.registeredDistrict as string) ?? undefined,
    state: (k.registeredState as string) ?? undefined,
    pincode: (k.registeredPinCode as string) ?? undefined,
    country: (k.countryOfIncorporation as string) ?? undefined,
  };

  const correspondence: CorporateKycPdfData["correspondence"] = {
    line1: (k.correspondenceLine1 as string) ?? undefined,
    line2: (k.correspondenceLine2 as string) ?? undefined,
    line3: (k.correspondenceLine3 as string) ?? undefined,
    city: (k.correspondenceCity as string) ?? undefined,
    district: (k.correspondenceDistrict as string) ?? undefined,
    state: (k.correspondenceState as string) ?? undefined,
    pincode: (k.correspondencePinCode as string) ?? undefined,
    country: undefined,
  };

  const bankAccounts = mapBankAccounts(k.bankAccounts);
  const dematAccounts = mapDematAccounts(k.dematAccounts);
  const promoterRows = mapPromoterRows(k.directors, k.promoters, k.partners);

  const relatedPerson = mapFirstDirector(k.directors);

  const fatcaApplicable = k.fatcaApplicable === true;
  const taxRes = String(k.taxResidencyOfEntity ?? "").trim();
  const low = taxRes.toLowerCase();
  const fatcaIndiaOnly = fatcaApplicable && low.includes("india");
  const fatcaAnnexure =
    fatcaApplicable && taxRes.length > 0 && !low.includes("india");

  const officeUse: CorporateKycPdfData["officeUse"] = {
    intermediaryDetails: undefined,
    selfCertifiedCopies: false,
    trueCopiesAttested: false,
  };

  return {
    customerId,
    applicationNumber: customerId != null ? String(customerId) : undefined,
    pan,
    form60: false,
    entityName,
    dateOfIncorporation,
    placeOfIncorporation,
    dateOfCommencement,
    registrationNumber,
    entityType,
    poi,
    othersSpecify: (k.otherConstitutionType as string) ?? undefined,
    registered,
    correspondence,
    permanentOverseas: {
      ...correspondence,
      country: correspondence.country,
    },
    poaPermanent: { ...poi },
    contact: {
      email: undefined,
      alternateEmail: undefined,
      mobile: undefined,
      alternateMobile: undefined,
      fax: undefined,
      telephoneOff: undefined,
      telephoneRes: undefined,
    },
    fatcaIndiaOnly,
    fatcaAnnexure,
    bankAccounts,
    dematAccounts,
    promoterRows,
    relatedPerson,
    officeUse,
    nameOfApplicantPart3: entityName,
    part3Pan: pan,
  };
}

function mapEntityConstitution(
  t: string | undefined,
  other: string | undefined
): CorporateKycPdfData["entityType"] {
  const e: NonNullable<CorporateKycPdfData["entityType"]> = {};
  if (!t) return e;
  switch (t) {
    case "PRIVATE_LIMITED":
      e.privateLimitedCo = true;
      break;
    case "PUBLIC_LIMITED":
      e.publicLimitedCo = true;
      break;
    case "LLP":
      e.llp = true;
      break;
    case "PARTNERSHIP":
      e.partnership = true;
      break;
    case "TRUST":
      e.trustCharityNgo = true;
      e.trust = true;
      break;
    case "OPC":
      e.othersSpecify = true;
      break;
    case "OTHER":
      e.othersSpecify = true;
      break;
    default:
      break;
  }
  if (other?.trim()) e.othersSpecify = true;
  return e;
}

function mapBankAccounts(raw: unknown): CorporateKycPdfData["bankAccounts"] {
  if (!Array.isArray(raw)) return undefined;
  return raw.slice(0, 5).map((a) => {
    const x = a as Record<string, unknown>;
    return {
      isPrimary: x.isPrimaryAccount === true,
      ifsc: (x.ifscCode as string) ?? undefined,
      nameAsPerBank: (x.accountHolderName as string) ?? undefined,
      nameAsPerPan: (x.accountHolderName as string) ?? undefined,
      branch: (x.branch as string) ?? undefined,
      accountType: (x.accountType as string) ?? undefined,
      accountNumber: (x.accountNumber as string) ?? undefined,
      bankName: (x.bankName as string) ?? undefined,
      micr: undefined,
    };
  });
}

function mapDematAccounts(raw: unknown): CorporateKycPdfData["dematAccounts"] {
  if (!Array.isArray(raw)) return undefined;
  return raw.slice(0, 5).map((d) => {
    const x = d as Record<string, unknown>;
    const dep = String(x.depository ?? "").toUpperCase();
    return {
      isPrimary: x.isPrimary === true,
      dpName: (x.accountHolderName as string) ?? undefined,
      dpId: (x.dpId as string) ?? undefined,
      depositoryCdsl: dep.includes("CDSL"),
      depositoryNsdl: dep.includes("NSDL"),
      beneficiaryId: (x.clientId as string) ?? undefined,
    };
  });
}

function mapPromoterRows(
  directors: unknown,
  promoters: unknown,
  partners: unknown
): CorporateKycPdfData["promoterRows"] {
  const list =
    Array.isArray(directors) && (directors as unknown[]).length
      ? (directors as unknown[])
      : Array.isArray(promoters) && (promoters as unknown[]).length
        ? (promoters as unknown[])
        : Array.isArray(partners)
          ? (partners as unknown[])
          : [];
  return list.slice(0, 4).map((p) => {
    const x = p as Record<string, unknown>;
    const pep = String(x.pepDeclaration ?? "").toUpperCase();
    return {
      pan: (x.pan as string) ?? undefined,
      name: (x.fullName as string) ?? undefined,
      din: (x.din as string) ?? undefined,
      aadhar: (x.aadharNumber as string) ?? undefined,
      address: (x.address as string) ?? undefined,
      relationship: (x.designation as string) ?? undefined,
      passportPhotoAttached: hasUrl(x.passportPhotoFileUrl),
      panCopyAttached: hasUrl(x.panCopyFileUrl),
      aadharCopyAttached: hasUrl(x.aadharCopyFileUrl),
      pep: pep === "PEP" || pep === "YES",
      rpep: pep.includes("RELATED"),
      pepNo: pep === "NO",
    };
  });
}

function mapFirstDirector(directors: unknown): CorporateKycPdfData["relatedPerson"] {
  if (!Array.isArray(directors) || !(directors as unknown[]).length) return undefined;
  const x = (directors as Record<string, unknown>[])[0]!;
  return {
    pan: (x.pan as string) ?? undefined,
    name: (x.fullName as string) ?? undefined,
    din: (x.din as string) ?? undefined,
    form60: false,
  };
}

