export const maturityOptions = [
    { value: "0-2", title: "0 - 2 years" },
    { value: "2-5", title: "2 - 5 years" },
    { value: "5-10", title: "5 - 10 years" },
    { value: "10-20", title: "10 - 20 years" },
    { value: "20+", title: "20 years+" },
] as const;

export const ratingOptions = [
    { value: "AAA(CE)", title: "AAA (CE)" },
    { value: "AA+(CE)", title: "AA+ (CE)" },
    { value: "AA(CE)", title: "AA (CE)" },
    { value: "A+(CE)", title: "A+ (CE)" },
    { value: "AAA", title: "AAA" },
    { value: "AA+", title: "AA+" },
    { value: "AA", title: "AA" },
    { value: "A+", title: "A+" },
    { value: "AA-", title: "AA-" },
    { value: "AA-(CE)", title: "AA- (CE)" },
    { value: "A", title: "A" },
    { value: "A-", title: "A-" },
    { value: "BBB+", title: "BBB+ and below" },
    { value: "Unrated", title: "Unrated" },
] as const;

export const couponOptions = [
    { value: "4-7", title: "4 - 7%" },
    { value: "8-10", title: "8 - 10%" },
    { value: "10+", title: ">10%" },
] as const;

export const taxationOptions = [
    { value: "TAX_FREE", title: "Tax Free" },
    { value: "TAXABLE", title: "Taxable" },
    // { value: "TAX_SAVING", title: "Tax Saving" },
    // { value: "TAX_EXEMPTION", title: "Tax Exemption" },
    // { value: "UNKNOWN", title: "Unknown" },
] as const;



export const interestPaymentOptions = [
    { value: "MONTHLY", title: "Monthly" },
    { value: "QUARTERLY", title: "Quarterly" },
    { value: "HALF_YEARLY", title: "Half Yearly" },
    { value: "YEARLY", title: "Yearly" },
    { value: "ON_MATURITY", title: "On Maturity" },
] as const;