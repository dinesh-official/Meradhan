export function formatNumberTS(value: number | string): string {
  const n = Number(value);
  if (!isFinite(n)) return String(value);

  // Round to at least 2 decimal places
  const rounded = Math.round(n * 100) / 100;

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rounded);
}

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