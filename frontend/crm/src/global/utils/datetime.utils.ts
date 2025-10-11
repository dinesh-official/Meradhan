
export type DateInput = Date | string | number;
export type DateFormatToken =
    // Numeric dates
    | "DD MM YY"
    | "DD/MM/YYYY"
    | "YYYY-MM-DD"
    | "MM-DD-YYYY"
    | "DD.MM.YYYY"
    | "YYYY.MM.DD"
    // Text month names
    | "DD MMM YYYY"
    | "DD MMMM YYYY"
    | "MMMM DD, YYYY"
    | "MMM DD, YYYY"
    // Time formats
    | "HH:mm:ss"
    | "HH:mm"
    | "hh:mm AA"
    | "hh:mm:ss AA"
    // Combined date-time formats
    | "DD/MM/YYYY HH:mm:ss"
    | "YYYY-MM-DD HH:mm:ss"
    | "DD MMM YYYY HH:mm"
    | "DD MMMM YYYY hh:mm AA"
    | "MMMM DD, YYYY HH:mm"
    | "YYYY.MM.DD HH:mm:ss"
    | "MM-DD-YYYY hh:mm AA";

/**
 * DateFormatString type allows either a predefined format or any string
 */


export const dateTimeUtils = {
    formatDateTime: (
        dateInput: DateInput,
        format: DateFormatToken,
        locale: string = "en-US"
    ): string => {
        if (!dateInput) return "";

        const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
        if (isNaN(date.getTime())) return "Invalid Date";

        const day = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();
        const hours24 = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const ampm = hours24 >= 12 ? "PM" : "AM";
        const hours12 = hours24 % 12 || 12;

        // Intl for localized month names
        const monthNamesShort = new Intl.DateTimeFormat(locale, { month: "short" }).format;
        const monthNamesLong = new Intl.DateTimeFormat(locale, { month: "long" }).format;

        let formatted = format as string;

        formatted = formatted
            .replace(/DD/g, String(day).padStart(2, "0"))
            .replace(/\bD(?!D)\b/g, String(day))
            .replace(/MMMM/g, monthNamesLong(new Date(2000, month, 1)))
            .replace(/MMM/g, monthNamesShort(new Date(2000, month, 1)))
            .replace(/MM/g, String(month + 1).padStart(2, "0"))
            .replace(/YYYY/g, String(year))
            .replace(/YY/g, String(year).slice(-2))
            .replace(/HH/g, String(hours24).padStart(2, "0"))
            .replace(/hh/g, String(hours12).padStart(2, "0"))
            .replace(/mm/g, String(minutes).padStart(2, "0"))
            .replace(/ss/g, String(seconds).padStart(2, "0"))
            .replace(/AA/g, ampm)
            .replace(/aa/g, ampm.toLowerCase());

        return formatted;
    },
};
