/**
 * Calculate time remaining until maturity date
 * Returns an object with years, months, and days
 */
export function calculateTimeUntilMaturity(maturityDate: string | Date): {
  years: number;
  months: number;
  days: number;
  formatted: string;
} {
  const maturity = new Date(maturityDate);
  const now = new Date();
  
  // Reset time to start of day for accurate day calculation
  maturity.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  
  if (maturity < now) {
    return {
      years: 0,
      months: 0,
      days: 0,
      formatted: "Matured",
    };
  }
  
  let years = maturity.getFullYear() - now.getFullYear();
  let months = maturity.getMonth() - now.getMonth();
  let days = maturity.getDate() - now.getDate();
  
  // Adjust for negative days
  if (days < 0) {
    months--;
    const lastMonth = new Date(maturity.getFullYear(), maturity.getMonth(), 0);
    days += lastMonth.getDate();
  }
  
  // Adjust for negative months
  if (months < 0) {
    years--;
    months += 12;
  }
  
  // Format the result
  const parts: string[] = [];
  if (years > 0) {
    parts.push(`${years} ${years === 1 ? "year" : "years"}`);
  }
  if (months > 0) {
    parts.push(`${months} ${months === 1 ? "month" : "months"}`);
  }
  if (days > 0 || parts.length === 0) {
    parts.push(`${days} ${days === 1 ? "day" : "days"}`);
  }
  
  return {
    years,
    months,
    days,
    formatted: parts.join(" "),
  };
}

