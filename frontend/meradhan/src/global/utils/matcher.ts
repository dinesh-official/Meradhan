import { dateTimeUtils } from "./datetime.utils";

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



        if (!a || !b) {
            return false;
        }
        const a1 = dateTimeUtils.parseDate(a);
        const b1 = dateTimeUtils.parseDate(b);

        if (!a1 || !b1) {
            return false;
        }

        const dateA = new Date(a1);
        const dateB = new Date(b1);
        console.log(dateA, dateB);

        console.log(dateA.getFullYear() === dateB.getFullYear(),
            dateA.getMonth() === dateB.getMonth(),
            dateA.getDate() === dateB.getDate());

        return (
            dateA.getFullYear() === dateB.getFullYear() &&
            dateA.getMonth() === dateB.getMonth() &&
            dateA.getDate() === dateB.getDate()
        );
    },


};
