import { truncateDecimals } from "@utils/truncateDecimals";

const principalAmount = 9858.63;
const accruedInterest = 42.74;
const totalConsideration = (Math.round(Number(truncateDecimals(principalAmount, 2)) * 100) + Math.round(Number(truncateDecimals(accruedInterest, 2)) * 100)) / 100;
