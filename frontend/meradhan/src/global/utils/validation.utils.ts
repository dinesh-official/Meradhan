import { ZodError } from "zod";

/**
 * Converts a ZodError into a typed error map for any form type
 */
export const zodErrorToErrorMap = <T>(
  err: unknown
): Partial<Record<keyof T, string[]>> => {
  const map: Partial<Record<keyof T, string[]>> = {};

  (err as ZodError<T>)?.issues?.forEach((e) => {
    const key = e.path[0] as keyof T;
    if (key) {
      if (!map[key]) map[key] = [];
      if (e.message) map[key]!.push(e.message);
    }
  });

  return map;
};


export const isEmail = (email: string) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}


/**
 * Deeply compares two values (objects, arrays, primitives)
 * Returns true if *any difference* exists.
 */
export function hasObjectChanged(a: unknown, b: unknown): boolean {
  // Fast check for strict equality or same reference
  if (Object.is(a, b)) return false;

  // Handle null / undefined
  if (a == null || b == null) return a !== b;

  // Compare Dates
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() !== b.getTime();
  }

  // Compare Arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return true;
    for (let i = 0; i < a.length; i++) {
      if (hasObjectChanged(a[i], b[i])) return true;
    }
    return false;
  }

  // Compare plain Objects
  if (isPlainObject(a) && isPlainObject(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of keys) {
      if (hasObjectChanged(a[key], b[key])) return true;
    }
    return false;
  }

  // Everything else (string, number, boolean, etc.)
  return a !== b;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}
