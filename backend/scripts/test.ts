import { calculateBondPricing } from "@services/order/bond-pricing";

const result = calculateBondPricing({
  faceValue: 10000,
  cleanPrice: 97.2937,
  accruedInterest: 3419.20 / 80,
  quantity: 80,
});

console.log(result);