export const RatingCodeArray: string[] = [
  "AAA",
  "AA+",
  "AA",
  "AA-",
  "A+",
  "A",
  "A-",
  "BBB+",
  "BBB",
  "BBB-",
  "BB+",
  "BB",
  "BB-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "C-",
  "UNRATED",
  "OTHER",
  "SD",
  "D"
];


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

export const SECTORS: SectorCode[] = Object.values(SectorCode);

// ✅ Generate options array for dropdowns, selects, etc.
export const sectorOptions = SECTORS.map((s) => ({
  label: SectorCodeDescription[s],
  value: s,
}));