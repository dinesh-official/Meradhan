import { config } from "@config/config";
import jwt, { type SignOptions } from 'jsonwebtoken';
import type { ITokenUtils } from "./token.interface";

class JwtTokenUtils implements ITokenUtils {
    generateToken<D = string | Buffer | object, T = SignOptions['expiresIn']>(data: D, expiresIn: T): string {
        const token = jwt.sign((data as string | Buffer | object), config.jwtSecret, { algorithm: "HS256", expiresIn: expiresIn as SignOptions['expiresIn'] });
        return token;
    }
    verifyToken<T>(token: string): T {
       try {
         const decoded = jwt.verify(token, config.jwtSecret) as T;
        return decoded;
       } catch  {
        throw new Error("Your session has expired. Please reattempt again.");
       }
    }
}

export const tokenUtils = new JwtTokenUtils()
