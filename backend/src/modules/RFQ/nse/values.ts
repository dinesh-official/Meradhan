export const stateCodeNo = {
  "01": "Jammu and Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "11": "Sikkim",
  "12": "Arunachal Pradesh",
  "13": "Nagaland",
  "14": "Manipur",
  "15": "Mizoram",
  "16": "Tripura",
  "17": "Meghalaya",
  "18": "Assam",
  "19": "West Bengal",
  "20": "Jharkhand",
  "21": "Odisha",
  "22": "Chhattisgarh",
  "23": "Madhya Pradesh",
  "24": "Gujarat",
  "25": "Daman & Diu",
  "26": "Dadra and Nagar Haveli",
  "27": "Maharashtra",
  "29": "Karnataka",
  "30": "Goa",
  "31": "Lakshadweep",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "34": "Pondicherry",
  "35": "Andaman & Nicobar Islands",
  "36": "Telangana",
  "37": "Andhra Pradesh",
  "38": "Ladakh",
  "98": "IMPORT (Not Registered in India)",
};

export enum StateCode {
  JammuAndKashmir = "01",
  HimachalPradesh = "02",
  Punjab = "03",
  Chandigarh = "04",
  Uttarakhand = "05",
  Haryana = "06",
  Delhi = "07",
  Rajasthan = "08",
  UttarPradesh = "09",
  Bihar = "10",
  Sikkim = "11",
  ArunachalPradesh = "12",
  Nagaland = "13",
  Manipur = "14",
  Mizoram = "15",
  Tripura = "16",
  Meghalaya = "17",
  Assam = "18",
  WestBengal = "19",
  Jharkhand = "20",
  Odisha = "21",
  Chhattisgarh = "22",
  MadhyaPradesh = "23",
  Gujarat = "24",
  DamanAndDiu = "25",
  DadraAndNagarHaveli = "26",
  Maharashtra = "27",
  Karnataka = "29",
  Goa = "30",
  Lakshadweep = "31",
  Kerala = "32",
  TamilNadu = "33",
  Pondicherry = "34",
  AndamanAndNicobarIslands = "35",
  Telangana = "36",
  AndhraPradesh = "37",
  Ladakh = "38",
  ImportNotRegisteredInIndia = "98",
}

export const stateNameToCode = {
  "Jammu and Kashmir": "01",
  "Jammu & Kashmir": "01", // alias
  "Himachal Pradesh": "02",
  Punjab: "03",
  Chandigarh: "04",
  Uttarakhand: "05",
  Uttaranchal: "05", // alias (renamed to Uttarakhand in 2007)
  Haryana: "06",
  Delhi: "07",
  Rajasthan: "08",
  "Uttar Pradesh": "09",
  Bihar: "10",
  Sikkim: "11",
  "Arunachal Pradesh": "12",
  Nagaland: "13",
  Manipur: "14",
  Mizoram: "15",
  Tripura: "16",
  Meghalaya: "17",
  Assam: "18",
  "West Bengal": "19",
  Jharkhand: "20",
  Odisha: "21",
  Orissa: "21", // alias (renamed to Odisha in 2011)
  Chhattisgarh: "22",
  "Madhya Pradesh": "23",
  Gujarat: "24",
  "Daman & Diu": "25",
  "Daman and Diu": "25", // alias
  "Dadra and Nagar Haveli": "26",
  "Dadra & Nagar Haveli": "26", // alias
  Maharashtra: "27",
  Karnataka: "29",
  Goa: "30",
  Lakshadweep: "31",
  Kerala: "32",
  "Tamil Nadu": "33",
  Pondicherry: "34",
  Puducherry: "34", // alias (renamed from Pondicherry in 2006)
  "Andaman & Nicobar Islands": "35",
  "Andaman and Nicobar Islands": "35", // alias
  Telangana: "36",
  "Andhra Pradesh": "37",
  Ladakh: "38",
  "IMPORT (Not Registered in India)": "98",
};

// ---------- Utility Functions ----------

/** Get state name by code */
export const getStateName = (code: string): string | undefined => {
  return stateCodeNo[code as keyof typeof stateCodeNo];
};

/** Get state code by name */
export const getStateCode = (name: string): string | undefined => {
  return stateNameToCode[name as keyof typeof stateNameToCode];
};

/** Check if given code is valid */
export const isValidStateCode = (code: string): boolean => {
  return code in stateCodeNo;
};

/** Check if given name is valid */
export const isValidStateName = (name: string): boolean => {
  return name in stateNameToCode;
};

/** Get all states as array of { code, name } */
export const getAllStates = (): { code: string; name: string }[] => {
  return Object.entries(stateCodeNo).map(([code, name]) => ({ code, name }));
};

/** Find states by partial name (case-insensitive search) */
export const searchStates = (
  query: string,
): { code: string; name: string }[] => {
  const q = query.toLowerCase();
  return getAllStates().filter(({ name }) => name.toLowerCase().includes(q));
};

// Enum for all possible rating codes
export enum RatingCode {
  AAA = "AAA",
  AA_PLUS = "AA+",
  AA = "AA",
  AA_MINUS = "AA-",
  A_PLUS = "A+",
  A = "A",
  A_MINUS = "A-",
  BBB_PLUS = "BBB+",
  BBB = "BBB",
  BBB_MINUS = "BBB-",
  BB_PLUS = "BB+",
  BB = "BB",
  BB_MINUS = "BB-",
  B_PLUS = "B+",
  B = "B",
  B_MINUS = "B-",
  C_PLUS = "C+",
  C = "C",
  C_MINUS = "C-",
  UNRATED = "UNRATED",
  OTHER = "OTHER",
  SOVEREIGN = "SOVEREIGN",
}

// Optional: For user-friendly display names
export const RatingCodeDescription: Record<RatingCode, string> = {
  [RatingCode.AAA]: "AAA",
  [RatingCode.AA_PLUS]: "AA+",
  [RatingCode.AA]: "AA",
  [RatingCode.AA_MINUS]: "AA-",
  [RatingCode.A_PLUS]: "A+",
  [RatingCode.A]: "A",
  [RatingCode.A_MINUS]: "A-",
  [RatingCode.BBB_PLUS]: "BBB+",
  [RatingCode.BBB]: "BBB",
  [RatingCode.BBB_MINUS]: "BBB-",
  [RatingCode.BB_PLUS]: "BB+",
  [RatingCode.BB]: "BB",
  [RatingCode.BB_MINUS]: "BB-",
  [RatingCode.B_PLUS]: "B+",
  [RatingCode.B]: "B",
  [RatingCode.B_MINUS]: "B-",
  [RatingCode.C_PLUS]: "C+",
  [RatingCode.C]: "C",
  [RatingCode.C_MINUS]: "C-",
  [RatingCode.UNRATED]: "Unrated",
  [RatingCode.OTHER]: "Other",
  [RatingCode.SOVEREIGN]: "Sovereign",
};

// ----------------------
// Sector Codes
// ----------------------
export enum SectorCode {
  NBFC = "NBFC",
  HFC = "HFC",
  PSU_BANK = "PSU Bank",
  PRIVATE_BANK = "Private Bank",
  PSU = "PSU",
  MANUFACTURING = "Manufacturing",
  SOVEREIGN = "Sovereign",
  PUBLIC_FINANCIAL_INSTITUTIONS = "Public Financial Institutions",
  OTHERS = "Others",
}

export const SectorCodeDescription: Record<SectorCode, string> = {
  [SectorCode.NBFC]: "Non-Banking Financial Company",
  [SectorCode.HFC]: "Housing Finance Company",
  [SectorCode.PSU_BANK]: "Public Sector Bank",
  [SectorCode.PRIVATE_BANK]: "Private Bank",
  [SectorCode.PSU]: "Public Sector Undertaking",
  [SectorCode.MANUFACTURING]: "Manufacturing",
  [SectorCode.SOVEREIGN]: "Sovereign",
  [SectorCode.PUBLIC_FINANCIAL_INSTITUTIONS]: "Public Financial Institutions",
  [SectorCode.OTHERS]: "Others",
};

// ----------------------
// Modification Reasons
// ----------------------
export enum ModificationReasonCode {
  SETTYP = "SETTYP",
  ACCRINT = "ACCRINT",
  YLDTYP = "YLDTYP",
}

export const ModificationReasonDescription: Record<
  ModificationReasonCode,
  string
> = {
  [ModificationReasonCode.SETTYP]: "Settlement type",
  [ModificationReasonCode.ACCRINT]: "Accrued interest and consideration",
  [ModificationReasonCode.YLDTYP]: "Yield type",
};

// ----------------------
// Cancellation Reasons
// ----------------------
export enum CancellationReasonCode {
  FATFNGR = "FATFNGR",
  CSHFLO = "CSHFLO",
  SHRT = "SHRT",
  ILLIQ = "ILLIQ",
  SHTPRD = "SHTPRD",
}

export const CancellationReasonDescription: Record<
  CancellationReasonCode,
  string
> = {
  [CancellationReasonCode.FATFNGR]: "Fat finger error",
  [CancellationReasonCode.CSHFLO]: "Cash flow mismatch",
  [CancellationReasonCode.SHRT]: "Short sell",
  [CancellationReasonCode.ILLIQ]: "Liquidity constraints",
  [CancellationReasonCode.SHTPRD]: "Shut period",
};
