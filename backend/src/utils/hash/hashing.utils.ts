import { config } from "@config/config";

import * as argon2 from "argon2";
import type { IHashingUtils } from "./hash.interface";

 class HashingUtils implements IHashingUtils {
    private readonly pepper: string;
    private readonly options: argon2.Options & { type: number };

     constructor() {
        this.pepper = "_#_APP_NAME_PASSPHRASE_##_";

        this.options = {
            type: config.hashing.argon2.type,       // Use Argon2id variant
            memoryCost: config.hashing.argon2.memoryCost,
            timeCost: config.hashing.argon2.timeCost,
            parallelism: config.hashing.argon2.parallelism,
        };
    }

    async hashPassword(password: string): Promise<string> {
        const pwdPlusPepper = password + this.pepper;
        return argon2.hash(pwdPlusPepper, this.options);
    }

    async comparePassword(password: string, hash: string): Promise<boolean> {
        const attempt = password + this.pepper;
        try {
            return await argon2.verify(hash, attempt);
        } catch {
            return false;
        }
    }
}


export const hashingUtils = new HashingUtils()