export function truncateDecimals(value: number | string, decimals = 2, formatted = false): number | string {
  const str = (typeof value === 'string' ? value : String(value)).trim();
  const negative = str.startsWith('-');
  const raw = negative ? str.slice(1) : str;

  const dot = raw.indexOf('.');
  const intPart = dot === -1 ? raw : raw.slice(0, dot);
  const decPart = dot === -1 ? '' : raw.slice(dot + 1, dot + 1 + decimals);
  const sign = negative ? '-' : '';

  if (formatted) {
    const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${sign}${withCommas}.${decPart.padEnd(decimals, '0')}`;
  }

  if (!decPart || /^0+$/.test(decPart)) {
    return Number(`${sign}${intPart}`);
  }

  const trimmed = decPart.replace(/0+$/, '');
  const result = trimmed ? `${sign}${intPart}.${trimmed}` : `${sign}${intPart}`;
  return Number(result);
}

export function calculateTotalConsideration(principalAmount: number, accruedInterest: number): number {
  const principalAmountTruncated = Math.round(Number(truncateDecimals(principalAmount, 2)) * 100);
  const accruedInterestTruncated = Math.round(Number(truncateDecimals(accruedInterest, 2)) * 100);
  return (principalAmountTruncated + accruedInterestTruncated) / 100;
}
