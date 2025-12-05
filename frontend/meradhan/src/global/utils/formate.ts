export function formatNumberTS(value: number | string): string {
  const n = Number(value);
  if (!isFinite(n)) return String(value);
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export const makeFullname = ({
  firstName,
  middleName,
  lastName,
}: {
  firstName: string;
  middleName?: string | null;
  lastName?: string | null;
}) => {
  let fullName = firstName;
  if (middleName) {
    fullName += ` ${middleName}`;
  }
  if (lastName) {
    fullName += ` ${lastName}`;
  }
  return fullName;
};

export function formatAmount(num: number | string) {
  const fixedNum = Number(num).toFixed(2);
  const parts = fixedNum.split(".");

  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Check if the decimal part is 00, and if so, return only the integer part
  if (parts[1] === "00") {
    if (parts[0].includes(".")) {
      return parts[0];
    } else {
      return parts[0] + ".00";
    }
  }

  return parts.join(".");
}

export function maskEmail(email: string) {
  const [username, domain] = email.split("@");

  if (!username || !domain) return email; // fallback

  // Show first 4 chars, rest masked as xxxx
  const visible = username.slice(0, 4);
  const masked = "xxxx";

  return `${visible}${masked}@${domain}`;
}
