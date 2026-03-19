/**
 * KRA numeric state / UT codes → display names (SEBI KRA API Download file format May 2025).
 * Used for PDF and any place KRA returns codes like "027" instead of names.
 */
const KRA_STATE_LABELS: Record<string, string> = {
  "01": "Andhra Pradesh",
  "02": "Arunachal Pradesh",
  "03": "Assam",
  "04": "Bihar",
  "05": "Chhattisgarh",
  "06": "Goa",
  "07": "Gujarat",
  "08": "Haryana",
  "09": "Himachal Pradesh",
  "10": "Jammu and Kashmir",
  "11": "Jharkhand",
  "12": "Karnataka",
  "13": "Kerala",
  "14": "Madhya Pradesh",
  "15": "Maharashtra",
  "16": "Manipur",
  "17": "Meghalaya",
  "18": "Mizoram",
  "19": "Nagaland",
  "20": "Odisha",
  "21": "Punjab",
  "22": "Rajasthan",
  "23": "Sikkim",
  "24": "Tamil Nadu",
  "25": "Telangana",
  "26": "Tripura",
  "27": "Uttar Pradesh",
  "28": "Uttarakhand",
  "29": "West Bengal",
  "30": "Andaman and Nicobar Islands",
  "31": "Chandigarh",
  "32": "Dadra and Nagar Haveli and Daman and Diu",
  "33": "Delhi",
  "34": "Lakshadweep",
  "35": "Puducherry",
  "36": "Ladakh",
  "37": "Other",
  "99": "Others",
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
    const key = String(parseInt(c, 10)).padStart(2, "0");
    return KRA_STATE_LABELS[key] ?? c;
  }
  return c;
}
