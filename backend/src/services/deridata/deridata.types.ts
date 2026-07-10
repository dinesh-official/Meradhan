export type DeriDataCalculatorSummary = {
  clean_price: string;
  accrued_int_top: string;
  dirty_price: string;
  principal: string;
  accrued_int_bottom: string;
  total_consideration: string;
  xirr: string;
  stamp_duty?: string;
  settlement_amount?: string;
};

export type DeriDataCashflowRow = {
  cash_flow_dates: string;
  coupon_cash_flow: string | null;
  principal_cash_flow: string | null;
  total_cash_flow: string | null;
};

export type DeriDataCalculatorResponse = {
  summary: DeriDataCalculatorSummary;
  cashflows: DeriDataCashflowRow[];
  cashflow_shut_flag?: boolean;
  shut_period_message?: string | null;
  record_date?: string | null;
};

export type YieldToPriceInput = {
  isin: string;
  valueDate: string;
  faceValue: number;
  quantity: number;
  ytm: number;
  cashflowShutFlag: boolean;
};

export type PriceToYieldInput = {
  isin: string;
  valueDate: string;
  faceValue: number;
  quantity: number;
  cleanPrice: number;
  cashflowShutFlag: boolean;
};

export type DeriDataCalcContext = {
  quantity: number;
  settlementDateYmd: string;
  accruedDays?: number | null;
  periodStatus?: string | null;
  ytm?: number | null;
  /** Manual accrued interest total — overrides DeriData `accrued_int_bottom`. */
  totalAccruedInterest?: number | null;
  /** Per-unit manual accrued interest (saved on bond as `accruedInterest`). */
  accruedInterestPerUnit?: number | null;
  /** When true, never fall back to DeriData `accrued_int_bottom`. */
  manualAccruedInterest?: boolean;
  /** Manual principal — overrides DeriData `principal` when set. */
  principalAmount?: number | null;
  /** Manual total consideration — overrides DeriData `total_consideration` when set. */
  totalConsideration?: number | null;
  /** Manual settlement amount — overrides derived settlement when set. */
  settlementAmount?: number | null;
  /** Stamp duty from DeriData autofill — overrides local calculation when set. */
  stampDuty?: number | null;
};

/** One instrument row from DeriData Merchant `issue-detail`. */
export type DeriDataIssueDetailItem = {
  isin: string;
  did?: string | null;
  coupon?: string | null;
  maturity?: string | null;
  issue_date?: string | null;
  face_value?: number | null;
  coupon_fixed?: string | null;
  coupon_frequency?: string | null;
  /** Business days before coupon for shut / record (not a calendar date). */
  record_date?: number | string | null;
  coupon_date?: string | null;
  issuer_id?: number | null;
  issuer_name?: string | null;
  description?: string | null;
  seniority?: string | null;
  security?: string | null;
  /** Agency names or `{ agency|name|rating_agency: string }` objects. */
  rating_agency?: unknown[] | null;
  /** Rating labels or `{ rating|current_rating|grade: string }` objects. */
  current_rating?: unknown[] | null;
  /** Outlook labels or `{ outlook|rating_outlook: string }` objects. */
  outlook?: unknown[] | null;
  listed?: string | boolean | null;
  tax_free?: string | null;
  allotment_date?: string | null;
  issuer_industry?: string | null;
  instrument_type?: string[] | null;
  total_issue_size_cr?: string | null;
  coupon_type?: string | null;
  coupon_reset?: string | null;
  coupon_reset_condition?: string | null;
  coupon_reset_frequency?: string | null;
  benchmark?: string | null;
  spread_bps?: string | number | null;
  coupon_additional_condition?: string | null;
  redemption_type?: string | null;
  redemption_premium?: string | null;
  put_date?: string | null;
  put_amount?: string | null;
  call_date?: string | null;
  call_amount?: string | null;
  payin?: string | null;
  redemption?: unknown;
  ytc?: boolean | null;
  coupon_floating?: string | null;
  current_coupon?: string | null;
  tags?: string[] | null;
  first_interest_date?: string | null;
  press_release_link?: string[] | null;
};

export type DeriDataIssueDetailResponse = {
  data: DeriDataIssueDetailItem[];
  multiple_call_dates?: unknown[];
  multiple_put_dates?: unknown[];
  multiple_reset_dates?: unknown[];
};
