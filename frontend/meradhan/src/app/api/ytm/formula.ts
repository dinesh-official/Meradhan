import {
  EDATE,
  IF,
  IFERROR,
  RATE,
  ROUND,
  ROUNDUP,

} from "@formulajs/formulajs";
import { AND, ISNUMBER, TODAY } from "@formulajs/formulajs";
import { YEARFRAC } from "./YEARFRAC";

/**
 * @param C12 Base date
 * @param C16 Months (can be decimal)
 * @param C10 Comparison date
 */
export function calculateDate(C12: Date, C16: number, C10: Date): Date {
  const months = ROUND(C16, 0);

  return IF(
    EDATE(C12, months) <= C10,
    EDATE(C12, months * 2),
    EDATE(C12, months)
  );
}

/**
 * @param issueDate Bond issue date
 * @param termYears Maturity in years (can be decimal)
 */
export function generateMaturityDate(issueDate: Date, termYears: number): Date {
  const months = ROUND(termYears * 12, 0);
  return EDATE(issueDate, months);
}

/**
 * @param C10 Start date
 * @param C11 End date
 * @param C17 Day count basis
 */
export function calculateYearFraction(
  C10: Date,
  C11: Date,
  C17: number
): number {
  const res = YEARFRAC(C10, C11, C17);
  return Number(res);
}

/**
 * @param C18 Start date
 * @param C11 End date
 * @param C17 Day-count basis
 * @param C15 Multiplier
 */
export function calculateValueNPER(
  C18: Date,
  C11: Date,
  C17: number,
  C15: number
): number {
  const yer = calculateYearFraction(C18, C11, C17);
  return ROUNDUP(yer * C15, 0);
}

/**
 * @param C12 Base / start date
 * @param C10 Comparison date
 * @param C18 End / maturity date
 * @param C17 Day-count basis
 */
export function calculateFraction(
  C12: Date,
  C10: Date,
  C18: Date,
  C17: number
): number {

  return IFERROR(
    IF(
      C10 >= C18,
      0,
      calculateYearFraction(C12, C10, C17) /
      calculateYearFraction(C12, C18, C17)
    ),
    0
  );
}

export function validateInputs(params: {
  C4: number;
  C5: number;
  C6: number;
  C9: Date;
  C10: Date;
  C11: Date;
  C12: Date;
  C15: number;
  C16: number;
  C17: unknown;
  C18: Date;
}): "OK" | "CHECK INPUTS" {
  const { C4, C5, C6, C9, C10, C11, C12, C15, C16, C17, C18 } = params;
  // console.log(params);

  const today = new Date(TODAY()); // returns Date

  return IF(
    AND(
      C4 > 0,
      C5 > 0,
      C6 >= 0,

      C10.getTime() >= C9.getTime(),
      C10.getTime() >= today.getTime(),
      C10.getTime() <= new Date(today.getTime() + 3 * 86400000).getTime(),

      C11.getTime() > C10.getTime(),
      C11.getTime() > C9.getTime(),

      C12.getTime() >= C9.getTime(),
      C12.getTime() <= C10.getTime(),
      C12.getTime() >= EDATE(C10, -ROUND(C16, 0)).getTime(),

      C18.getTime() > C10.getTime(),
      ISNUMBER(C17),
      C15 > 0
    ),
    "OK",
    "CHECK INPUTS"
  );
}

export function calculateRate(params: {
  C26: string; // Validation flag ("OK")
  C20: number; // nper
  C21: number; // pmt
  C25: number; // pv
  C4: number; // fv
}): number {
  const { C26, C20, C21, C25, C4 } = params;

  return IF(C26 !== "OK", NaN, RATE(C20, C21, -C25, C4));
}

export function calculateCompoundReturn(params: {
  C26: string; // Validation flag
  I9: number; // Periodic rate
  C15: number; // Number of periods
}) {
  const { C26, I9, C15 } = params;

  return IF(C26 !== "OK", "ERROR", Math.pow(1 + I9, C15) - 1);
}
