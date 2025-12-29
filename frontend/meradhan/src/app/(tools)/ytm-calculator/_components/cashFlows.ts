type CashFlow = {
  paymentDate: string;
  amount: number;
  days: number;
  mc: boolean;
  type: string;
  extra: boolean;
  interest: number;
}[];

export const cashFlows: CashFlow = [
  {
    paymentDate: "01 Jul 2025",
    amount: -1006459,
    days: 0,
    mc: false,
    type: "Investment",
    extra: false,
    interest: 0,
  },
  {
    paymentDate: "29 Aug 2025",
    amount: 207.95,
    days: 59,
    mc: false,
    type: "Coupon",
    extra: false,
    interest: 207.95,
  },
  {
    paymentDate: "29 Nov 2025",
    amount: 207.95,
    days: 151,
    mc: false,
    type: "Coupon",
    extra: false,
    interest: 207.95,
  },
  {
    paymentDate: "28 Feb 2026",
    amount: 205.68,
    days: 242,
    mc: false,
    type: "Coupon",
    extra: false,
    interest: 205.68,
  },
  {
    paymentDate: "29 May 2026",
    amount: 203.42,
    days: 332,
    mc: false,
    type: "Coupon",
    extra: false,
    interest: 203.42,
  },
  {
    paymentDate: "29 Aug 2026",
    amount: 207.95,
    days: 424,
    mc: false,
    type: "Coupon",
    extra: false,
    interest: 207.95,
  },
  {
    paymentDate: "29 Nov 2026",
    amount: 207.95,
    days: 516,
    mc: false,
    type: "Coupon",
    extra: false,
    interest: 207.95,
  },
  {
    paymentDate: "28 Feb 2027",
    amount: 205.68,
    days: 607,
    mc: false,
    type: "Coupon",
    extra: false,
    interest: 205.68,
  },
  {
    paymentDate: "29 May 2027",
    amount: 203.42,
    days: 697,
    mc: false,
    type: "Coupon",
    extra: false,
    interest: 203.42,
  },
  {
    paymentDate: "29 May 2027",
    amount: 10000,
    days: 697,
    mc: false,
    type: "Principal",
    extra: false,
    interest: 0,
  },
];
