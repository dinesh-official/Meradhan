import { calculateAccruedInterest, calculatePrincipalAmount, truncateDecimals } from "@utils/truncateDecimals";

const accruedInterestAmount = calculateAccruedInterest(36.16, 1, 100);
console.log(accruedInterestAmount);

const principalAmount = calculatePrincipalAmount(98.7027, 10000, 100);
console.log(principalAmount);

console.log(36.16 * 100);
