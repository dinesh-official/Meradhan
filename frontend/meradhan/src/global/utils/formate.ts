export function formatNumberTS(value: number | string): string {
  const n = Number(value);
  if (!isFinite(n)) return String(value);
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

export const makeFullname = ({firstName, middleName, lastName}: {firstName: string, middleName?: string | null, lastName?: string | null}) => {
    let fullName = firstName;
    if (middleName) {
        fullName += ` ${middleName}`;
    }
    if (lastName) {
        fullName += ` ${lastName}`;
    }
    return fullName;
}