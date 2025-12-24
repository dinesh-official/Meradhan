function bondYtmExcelEquivalent({
  price, // clean price (e.g. 95)
  faceValue, // usually 100
  couponRate, // annual coupon rate (e.g. 0.06)
  yearsToMaturity,
  frequency, // 1, 2, or 4
}: {
  price: number;
  faceValue: number;
  couponRate: number;
  yearsToMaturity: number;
  frequency: number;
}): number {
  const nper = yearsToMaturity * frequency;
  const coupon = (faceValue * couponRate) / frequency;

  // Initial guess (Excel uses an internal guess; this is stable)
  let rate = 0.05 / frequency;

  const MAX_ITER = 100;
  const TOL = 1e-10;

  for (let i = 0; i < MAX_ITER; i++) {
    let f = -price;
    let df = 0;

    for (let t = 1; t <= nper; t++) {
      const discount = Math.pow(1 + rate, t);

      // Bond pricing function
      f += coupon / discount;

      // Derivative of pricing function
      df -= (t * coupon) / (discount * (1 + rate));
    }

    // Principal repayment
    const principalDiscount = Math.pow(1 + rate, nper);
    f += faceValue / principalDiscount;
    df -= (nper * faceValue) / (principalDiscount * (1 + rate));

    // Newton–Raphson update
    const newRate = rate - f / df;

    if (Math.abs(newRate - rate) < TOL) {
      rate = newRate;
      break;
    }

    rate = newRate;
  }

  // Annualise (same as Excel)
  return rate * frequency;
}

const result = bondYtmExcelEquivalent({
  price: 95,
  faceValue: 100,
  couponRate: 0.06,
  yearsToMaturity: 5,
  frequency: 2,
});

console.log((result * 100).toFixed(4) + "%");
