export function generateUsername(
    prefix = "MD",
    suffix = "N",
    randomLength = 6
): string {
    const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const charLen = CHARS.length;

    let randomValues: number[] = [];

    // Use Web Crypto API if available (browser or Node >=18)
    if (typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.getRandomValues === "function") {
        const arr = new Uint32Array(randomLength);
        globalThis.crypto.getRandomValues(arr);
        randomValues = Array.from(arr);
    } else {
        // Fallback: Math.random (non-crypto)
        randomValues = Array.from({ length: randomLength }, () =>
            Math.floor(Math.random() * charLen)
        );
    }

    const middle = randomValues.map((v) => CHARS[v % charLen]).join("");
    return `${prefix}${middle}${suffix}`;
}

export const makeFullname = ({firstName, middleName, lastName}: {firstName: string, middleName?: string, lastName?: string}) => {
    let fullName = firstName;
    if (middleName) {
        fullName += ` ${middleName}`;
    }
    if (lastName) {
        fullName += ` ${lastName}`;
    }
    return fullName;
}