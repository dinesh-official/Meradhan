export function removeCountryCode(phoneNumber?: string | null|undefined): string {
  if (!phoneNumber) return "";
  // Remove all non-digit characters
  let digits: string = phoneNumber?.replace(/\D/g, '');

  // Common country codes (extend list as needed)
  const countryCodes: string[] = ['1', '44', '91', '61', '81', '86', '49', '33', '39', '7'];

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