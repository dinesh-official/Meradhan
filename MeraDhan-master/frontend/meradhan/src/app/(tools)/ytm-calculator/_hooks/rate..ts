// rate.ts
export function rate(
  nper: number,
  pmt: number,
  pv: number,
  fv: number = 0,
  type: 0 | 1 = 0,
  guess: number = 0.1
): number {
  try {
    if (!isFinite(nper) || !isFinite(pmt) || !isFinite(pv) || !isFinite(fv)) {
      return 0;
    }
    if (nper === 0) return 0;

    const MAX_ITER = 100;
    const TOL = 1e-12;

    const f = (r: number) => {
      if (Math.abs(r) < 1e-14) {
        return pv + pmt * nper + fv;
      } else {
        const pvFactor = Math.pow(1 + r, nper);
        const pmtFactor = ((1 + r * type) * (1 - pvFactor)) / r;
        return pv * pvFactor + pmt * pmtFactor + fv;
      }
    };

    const df = (r: number) => {
      if (Math.abs(r) < 1e-14) {
        const h = 1e-6;
        return (f(h) - f(-h)) / (2 * h);
      } else {
        const h = 1e-6;
        return (f(r + h) - f(r - h)) / (2 * h);
      }
    };

    // Newton–Raphson
    let rate = guess;
    for (let i = 0; i < MAX_ITER; i++) {
      const y = f(rate);
      if (Math.abs(y) < TOL) return rate;

      const yprime = df(rate);
      if (!isFinite(yprime) || Math.abs(yprime) < 1e-14) break;

      const newRate = rate - y / yprime;
      if (newRate <= -1) break;
      if (!isFinite(newRate) || Math.abs(newRate) > 1e10) break;

      rate = newRate;
    }

    // Bisection
    let lo = -0.999999999999;
    let hi = 1.0;
    let fLo = f(lo);
    let fHi = f(hi);

    let expandIter = 0;
    while (fLo * fHi > 0 && expandIter < 200) {
      hi *= 2;
      fHi = f(hi);
      expandIter++;
      if (hi > 1e10) break;
    }

    expandIter = 0;
    while (fLo * fHi > 0 && expandIter < 200) {
      lo = lo / 2;
      if (lo <= -0.999999999999) lo = -0.999999999999;
      fLo = f(lo);
      expandIter++;
    }

    if (fLo * fHi > 0) {
      const nearZero = f(0);
      if (Math.abs(nearZero) < 1e-10) return 0;
      return 0; // no solution → return 0
    }

    let mid = 0;
    for (let i = 0; i < 200; i++) {
      mid = (lo + hi) / 2;
      const fMid = f(mid);

      if (Math.abs(fMid) < TOL) return mid;

      if (fLo * fMid <= 0) {
        hi = mid;
        fHi = fMid;
      } else {
        lo = mid;
        fLo = fMid;
      }

      if (Math.abs(hi - lo) < TOL) return (hi + lo) / 2;
    }

    return mid;
  } catch {
    return 0;
  }
}

export default rate;

// yearfrac.ts
export function yearfrac(
  startDate: Date | string,
  endDate: Date | string,
  basis: 0 | 1 | 2 | 3 | 4 = 0
): number {
  try {
    const d1 = new Date(startDate);
    const d2 = new Date(endDate);

    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
    if (d2 < d1) return 0;

    const y1 = d1.getFullYear(),
      m1 = d1.getMonth() + 1,
      day1 = d1.getDate();
    const y2 = d2.getFullYear(),
      m2 = d2.getMonth() + 1,
      day2 = d2.getDate();

    const isLeap = (y: number) => new Date(y, 1, 29).getMonth() === 1;

    const daysBetween = (date1: Date, date2: Date) =>
      (date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24);

    // --- Basis 0: US 30/360 ---
    if (basis === 0) {
      const d1adj = day1 === 31 ? 30 : day1;
      const d2adj = day2 === 31 && day1 === 30 ? 30 : day2;

      const days = 360 * (y2 - y1) + 30 * (m2 - m1) + (d2adj - d1adj);

      return days / 360;
    }

    // --- Basis 1: Actual/Actual ---
    if (basis === 1) {
      const days = daysBetween(d1, d2);
      const yearDays = isLeap(d1.getFullYear()) ? 366 : 365;
      return days / yearDays;
    }

    // --- Basis 2: Actual/360 ---
    if (basis === 2) {
      const days = daysBetween(d1, d2);
      return days / 360;
    }

    // --- Basis 3: Actual/365 ---
    if (basis === 3) {
      const days = daysBetween(d1, d2);
      return days / 365;
    }

    // --- Basis 4: European 30/360 ---
    if (basis === 4) {
      const d1adj = day1 === 31 ? 30 : day1;
      const d2adj = day2 === 31 ? 30 : day2;

      const days = 360 * (y2 - y1) + 30 * (m2 - m1) + (d2adj - d1adj);

      return days / 360;
    }

    return 0;
  } catch {
    return 0;
  }
}

/*
------------------------------------------
 Example:
------------------------------------------
import { yearfrac } from "./yearfrac";

console.log(yearfrac("2024-01-01", "2024-07-01", 1)); // basis 1 (Actual/Actual)
------------------------------------------
*/
