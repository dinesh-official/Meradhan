export interface CashflowEvent {
  type: "INTEREST" | "MATURITY";
  bondName: string;
  maturityDate: string;
  amount: number;
}

export interface CashflowDate {
  date: string;
  totalPayout: number;
  side: "left" | "right";
  events: CashflowEvent[];
}

export interface CashflowYear {
  year: number;
  totalPayout: number;
  dates: CashflowDate[];
}

export interface CashflowResponse {
  years: CashflowYear[];
}