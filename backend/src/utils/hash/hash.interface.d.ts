import dotenv from "dotenv";

dotenv.config();

export interface IHashingUtils {
    hashPassword(password: string): Promise<string>;
    comparePassword(password: string, hash: string): Promise<boolean>;
}
