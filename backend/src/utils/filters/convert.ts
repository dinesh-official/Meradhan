export function removeCountryCode(
  phoneNumber?: string | null | undefined
): string {
  if (!phoneNumber) return "";
  // Remove all non-digit characters
  let digits: string = phoneNumber?.replace(/\D/g, "");

  // Common country codes (extend list as needed)
  const countryCodes: string[] = [
    "1",
    "44",
    "91",
    "61",
    "81",
    "86",
    "49",
    "33",
    "39",
    "7",
  ];

  // Try removing known country code if found
  for (const code of countryCodes) {
    if (digits.startsWith(code) && digits.length > 10) {
      digits = digits.slice(code.length);
      break;
    }
  }

  // If still longer than 10 digits, keep the last 10 digits
  if (digits.length > 10) {
    digits = digits.slice(-10);
  }

  return digits;
}
export function isISIN(isin: string): boolean {
  if (!/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(isin)) {
    return false;
  }

  // Convert letters to numbers (A=10 ... Z=35)
  const digits = isin
    .split("")
    .map((c) => (c >= "A" && c <= "Z" ? (c.charCodeAt(0) - 55).toString() : c))
    .join("");

  let sum = 0;
  let shouldDouble = false; // <-- FIX (start with false)

  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);

    if (shouldDouble) {
      n *= 2;
      if (n > 9) n -= 9;
    }

    sum += n;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}
