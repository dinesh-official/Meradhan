/**
 * KRA numeric state / UT codes → display names (SEBI KRA API Download file format May 2025).
 * Used for PDF and any place KRA returns codes like "027" instead of names.
 */
const KRA_STATE_LABELS: Record<string, string> = {
  // Keys are 3-digit numbers from KRA Download file format (as per your sheet)
  "001": "Jammu & Kashmir",
  "002": "Himachal Pradesh",
  "003": "Punjab",
  "004": "Chandigarh",
  "005": "Uttarakhand",
  "006": "Haryana",
  "007": "Delhi",
  "008": "Rajasthan",
  "009": "Uttar Pradesh",
  "010": "Bihar",
  "011": "Sikkim",
  "012": "Arunachal Pradesh",
  "013": "Assam",
  "014": "Manipur",
  "015": "Mizoram",
  "016": "Tripura",
  "017": "Meghalaya",
  "018": "Nagaland",
  "019": "West Bengal",
  "020": "Jharkhand",
  "021": "Odisha",
  "022": "Chhattisgarh",
  "023": "Madhya Pradesh",
  "024": "Gujarat",
  "025": "Daman and Diu",
  "026": "Dadra and Nagar Haveli",
  "027": "Maharashtra",
  "028": "Andhra Pradesh",
  "029": "Karnataka",
  "030": "Goa",
  "031": "Lakshadweep",
  "032": "Kerala",
  "033": "Tamil Nadu",
  "034": "Puducherry",
  "035": "Andaman and Nicobar Islands",
  "036": "Ladakh",
  "037": "Telangana",
  "099": "Others (please specify)",
};

/**
 * Maps KRA state field to a human-readable state/UT name.
 * Numeric strings (with optional leading zeros) use the KRA table; otherwise returns trimmed input.
 */
export function kraStateCodeToName(code: string | null | undefined): string {
  if (code == null) return "";
  const c = String(code).trim();
  if (!c) return "";
  if (/^\d+$/.test(c)) {
    const key = String(parseInt(c, 10)).padStart(3, "0");
    return KRA_STATE_LABELS[key] ?? c;
  }
  return c;
}
