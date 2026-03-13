/**
 * Fetch bank name from Razorpay IFSC API (https://ifsc.razorpay.com/).
 * Returns BANK field or null on failure.
 */
export async function fetchBankNameFromIfsc(ifsc: string): Promise<string | null> {
  if (!ifsc || !String(ifsc).trim()) return null;
  const code = String(ifsc).trim().toUpperCase();
  try {
    const res = await fetch(`https://ifsc.razorpay.com/${code}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { BANK?: string };
    return data.BANK ?? null;
  } catch {
    return null;
  }
}
