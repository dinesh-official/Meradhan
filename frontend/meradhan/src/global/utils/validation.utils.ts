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
