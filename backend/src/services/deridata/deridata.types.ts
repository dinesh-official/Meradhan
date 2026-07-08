export type DeriDataCalculatorSummary = {
  clean_price: string;
  accrued_int_top: string;
  dirty_price: string;
  principal: string;
  accrued_int_bottom: string;
  total_consideration: string;
  xirr: string;
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
};
