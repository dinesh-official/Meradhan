/**
 * Convert any recognizable date format to a specified output format.
 * Supported input examples:
 *   "02/11/2001", "2001-11-02", "11-02-2001", "Nov 2, 2001", new Date()
 *
 * Output format options (tokens):
 *   YYYY - full year
 *   MM   - month (01–12)
 *   DD   - day (01–31)
 *
 * Example:
 *   convertDate("02/11/2001", "YYYY-MM-DD") → "2001-11-02"
 *   convertDate("2001-11-02", "DD/MM/YYYY") → "02/11/2001"
 *   convertDate("11-02-2001", "MM-DD-YYYY") → "11-02-2001"
 */
function convertDate(input?: string | Date, targetFormat: string = "YYYY-MM-DD"): string | null {
    if (!input) return null;

    let dateObj: Date | null = null;

    // If input is already a Date object
    if (input instanceof Date) {
        if (isNaN(input.getTime())) return null;
        dateObj = input;
    } else {
        const value = String(input).trim();

        // Try to normalize common formats
        if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(value)) {
            // YYYY-MM-DD or YYYY/MM/DD
            const parts = value.split(/[-/]/);
            const [yyyy, mm, dd] = parts.map(p => parseInt(p, 10));
            dateObj = new Date(yyyy, mm - 1, dd);
        } else if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(value)) {
            // DD/MM/YYYY or MM-DD-YYYY — try to detect by month > 12
            const parts = value.split(/[-/]/);
            let [a, b, c] = parts.map(p => parseInt(p, 10));
            if (a > 12) {
                // Assume DD/MM/YYYY
                dateObj = new Date(c, b - 1, a);
            } else {
                // Assume MM/DD/YYYY
                dateObj = new Date(c, a - 1, b);
            }
        } else {
            // Try to let JS parse it (handles cases like "Nov 2, 2001", "2 Nov 2001")
            const parsed = new Date(value);
            if (!isNaN(parsed.getTime())) {
                dateObj = parsed;
            }
        }
    }

    if (!dateObj || isNaN(dateObj.getTime())) return null;

    // Extract date components
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const dd = String(dateObj.getDate()).padStart(2, "0");

    // Replace tokens in target format
    return targetFormat
        .replace(/YYYY/g, String(yyyy))
        .replace(/MM/g, mm)
        .replace(/DD/g, dd);
}

// ✅ Example usage:
console.log(convertDate("02/11/2001", "YYYY-MM-DD")); // → "2001-11-02"
console.log(convertDate("2001-11-02", "DD/MM/YYYY")); // → "02/11/2001"
console.log(convertDate("11-02-2001", "MM-DD-YYYY")); // → "11-02-2001"
console.log(convertDate("Nov 2, 2001", "YYYY/MM/DD")); // → "2001/11/02"
console.log(convertDate(new Date("2001-11-02"), "DD-MM-YYYY")); // → "02-11-2001"
console.log(convertDate("invalid date", "YYYY-MM-DD")); // → null
