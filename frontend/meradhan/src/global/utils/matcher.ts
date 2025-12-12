export interface PersonName {
  firstName: string;
  middleName?: string;
  lastName: string;
}

export const dataMatcherUtils = {
  /** 🔹 Clean and normalize string (remove spaces, lowercase) */
  clean(value: string = ""): string {
    return value.replace(/\s+/g, "").toLowerCase();
  },

  splitFullName(fullName?: string): PersonName {
    if (!fullName || !fullName.trim()) {
      return { firstName: "", lastName: "" };
    }

    const parts = fullName
      .trim()
      .replace(/\s+/g, " ") // normalize multiple spaces
      .split(" ");

    const count = parts.length;

    if (count === 1) {
      return { firstName: parts[0], lastName: "" };
    }

    if (count === 2) {
      return { firstName: parts[0], lastName: parts[1] };
    }

    // More than 2 parts → first, middle, last
    const firstName = parts[0];
    const lastName = parts[count - 1];
    const middleName = parts.slice(1, count - 1).join(" ");

    return { firstName, middleName, lastName };
  },

  /** ✅ Compare two PersonName objects (ignores case & spaces) */
  areNamesMatched(a: PersonName, b: PersonName): boolean {
    const fullA =
      this.clean(a.firstName) +
      this.clean(a.middleName ?? "") +
      this.clean(a.lastName);
    const fullB =
      this.clean(b.firstName) +
      this.clean(b.middleName ?? "") +
      this.clean(b.lastName);
    return fullA === fullB;
  },

  /** ✅ Compare two strings (case- and space-insensitive) */
  areValuesMatched(a?: string, b?: string): boolean {
    return this.clean(a) === this.clean(b);
  },

  /** ✅ Compare two dates (match only date, ignore time) */

  areDatesMatched(a?: Date | string, b?: Date | string): boolean {
    function normalizeDate(input?: Date | string): string | null {
      if (!input) return null;

      const d = input instanceof Date ? input : new Date(input);

      if (isNaN(d.getTime())) {
        // Try to handle dd/mm/yyyy or d/m/yyyy
        const parts = String(input).split("/");
        if (parts.length === 3) {
          const [day, month, year] = parts.map((p) => p.trim());
          if (
            !/^\d{1,2}$/.test(day) ||
            !/^\d{1,2}$/.test(month) ||
            !/^\d{4}$/.test(year)
          ) {
            return null;
          }
          return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        }
        return null;
      }

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");

      return `${yyyy}-${mm}-${dd}`;
    }

    const A = normalizeDate(a);
    const B = normalizeDate(b);

    if (!A || !B) return false;

    return A === B;
  },
};
