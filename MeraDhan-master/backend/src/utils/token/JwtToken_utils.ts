import { env } from "@packages/config/src/env";
import jwt, { type SignOptions } from "jsonwebtoken";
import type { ITokenUtils } from "./token_interface";

class JwtTokenUtils implements ITokenUtils {
  generateToken<D = string | Buffer | object, T = SignOptions["expiresIn"]>(
    data: D,
    expiresIn: T
  ): string {
    const token = jwt.sign(data as string | Buffer | object, env.JWT_SECRET, {
      algorithm: "HS256",
      expiresIn: expiresIn as SignOptions["expiresIn"],
    });
    return token;
  }
  verifyToken<T>(token: string): T {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as T;
      return decoded;
    } catch {
      throw new Error("Your session has expired. Please reattempt again.");
    }
  }
}

export const tokenUtils = new JwtTokenUtils();
