type TZInput = Date | string | number;

export class TZDate {
  private readonly date: Date;
  private readonly timeZone: string;

  constructor(input: TZInput = new Date(), timeZone: string = "UTC") {
    this.date = input instanceof Date ? input : new Date(input);
    this.timeZone = timeZone;
  }

  /**
   * Create TZDate from UTC date
   */
  static fromUTC(input: TZInput, timeZone: string) {
    return new TZDate(input, timeZone);
  }

  /**
   * Current time in a timezone
   */
  static now(timeZone: string = "UTC") {
    return new TZDate(new Date(), timeZone);
  }

  toIST(): TZDate {
    return new TZDate(this.date, "Asia/Kolkata");
  }

  /**
   * Internal formatter
   */
  private formatParts() {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: this.timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(this.date);
  }

  private get(type: string) {
    return this.formatParts().find((p) => p.type === type)?.value;
  }

  /**
   * ISO-like string (YYYY-MM-DDTHH:mm:ss)
   */
  toISOString() {
    return `${this.get("year")}-${this.get("month")}-${this.get(
      "day",
    )}T${this.get("hour")}:${this.get("minute")}:${this.get("second")}`;
  }

  /**
   * Date only (YYYY-MM-DD)
   */
  toDateString() {
    return `${this.get("year")}-${this.get("month")}-${this.get("day")}`;
  }

  /**
   * Time only (HH:mm:ss)
   */
  toTimeString() {
    return `${this.get("hour")}:${this.get("minute")}:${this.get("second")}`;
  }

  /**
   * Native Date (UTC-based)
   */
  toUTCDate(): Date {
    return new Date(this.date.toISOString());
  }

  /**
   * Change timezone (same instant)
   */
  withTimeZone(timeZone: string) {
    return new TZDate(this.date, timeZone);
  }

  /**
   * Add time safely
   */
  add({
    days = 0,
    hours = 0,
    minutes = 0,
    seconds = 0,
  }: {
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
  }) {
    const d = new Date(this.date);
    d.setUTCSeconds(
      d.getUTCSeconds() + seconds + minutes * 60 + hours * 3600 + days * 86400,
    );
    return new TZDate(d, this.timeZone);
  }

  /**
   * Unix timestamp (seconds)
   */
  unix(): number {
    return Math.floor(this.date.getTime() / 1000);
  }

  /**
   * Milliseconds timestamp
   */
  valueOf(): number {
    return this.date.getTime();
  }
}

const today = new Date("2026-01-04");
const now = new TZDate(today);
console.log(now.toISOString());
console.log(now.toIST().toISOString());
console.log(now.toUTCDate());
