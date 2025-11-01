import { config } from "@config/config";

import * as argon2 from "argon2";
import type { IHashingUtils } from "./hash_interface";

class HashingUtils implements IHashingUtils {

    private readonly options: argon2.Options & { type: number };

    constructor() {

        this.options = {
            type: config.hashing.argon2.type,       // Use Argon2id variant
            memoryCost: config.hashing.argon2.memoryCost,
            timeCost: config.hashing.argon2.timeCost,
            parallelism: config.hashing.argon2.parallelism,
        };
    }

    private transform(value: string) {
        return value.replaceAll(/a/gi, "u8hYzvOC")
            .replaceAll(/b/gi, "CrDivh)5}-CSuMv#")
            .replaceAll(/e/gi, "d57DHUoJ")
            .replaceAll(/i/gi, "k`e/p/gtdg=*y(o*")
            .replaceAll(/o/gi, "PwXeX5Q5")
            .replaceAll(/u/gi, "rk16ut9I")
            .replaceAll(/0/gi, "RYZZWK")
            .replaceAll(/s/gi, "5`#F=D7:s+N1fvxc")
            .replaceAll(/l/gi, "5izS]b8;-SpO0B+M")
    }

    private margePassword(password: string) {
        const pepper = "h.8QxI)Mh6D!H5,ix";
        const transformed = password.split("").reverse().join("");
        const mixed = pepper + transformed + pepper;
        let encPass = mixed;
        for (let i = 0; i < 2; i++) {
            encPass = this.transform(encPass)
        }
        // Step 5: Add simple checksum-like append
        const checksum = [...encPass].reduce((sum, c) => sum + c.charCodeAt(0), 0)
        const finalPassword = encPass + "::" + checksum + "XXX";
        return finalPassword;
    }

    async hashPassword(password: string): Promise<string> {

        return argon2.hash(this.margePassword(password), this.options);
    }

    async comparePassword(password: string, hash: string): Promise<boolean> {
        const attempt = this.margePassword(password);
        try {
            return await argon2.verify(hash, attempt);
        } catch {
            return false;
        }
    }
}


export const hashingUtils = new HashingUtils()