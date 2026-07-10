/**
 * Razorpay public IFSC resolver (https://ifsc.razorpay.com/).
 */
export type RazorpayIfscDetails = {
  bankName: string | null;
  branch: string | null;
};

/** Basic IFSC shape: 4 letters + 0 + 6 alnum (e.g. HDFC0001234). */
export function isLikelyValidIfsc(code: string): boolean {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(String(code).trim().toUpperCase());
}

/**
 * Resolve bank (+ branch label) from IFSC via Razorpay.
 */
export async function fetchRazorpayIfscDetails(ifsc: string): Promise<RazorpayIfscDetails> {
  if (!ifsc || !String(ifsc).trim()) {
    return { bankName: null, branch: null };
  }
  const code = String(ifsc).trim().toUpperCase();
  try {
    const res = await fetch(`https://ifsc.razorpay.com/${code}`);
    if (!res.ok) return { bankName: null, branch: null };
    const data = (await res.json()) as { BANK?: string; BRANCH?: string };
    const bankName = data.BANK?.trim() || null;
    const branch = data.BRANCH?.trim() || null;
    return { bankName, branch };
  } catch {
    return { bankName: null, branch: null };
  }
}

/**
 * Fetch bank name from Razorpay IFSC API (https://ifsc.razorpay.com/).
 * Returns BANK field or null on failure.
 */
export async function fetchBankNameFromIfsc(ifsc: string): Promise<string | null> {
  const { bankName } = await fetchRazorpayIfscDetails(ifsc);
  return bankName;
}
