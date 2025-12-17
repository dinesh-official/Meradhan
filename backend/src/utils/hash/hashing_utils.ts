import * as argon2 from "argon2";
import { env } from "@packages/config/src/env";
import type { IHashingUtils } from "./hash_interface";

class HashingUtils implements IHashingUtils {
  private readonly options: argon2.Options & { type: number };
  private readonly pepper: string | undefined;

  constructor() {
    this.options = {
      type: argon2.argon2id, // Use Argon2id variant (resistant to both GPU and side-channel attacks)
      memoryCost: 65536, // 64 MiB
      timeCost: 3, // iterations
      parallelism: 1,
    };

    // Get pepper from environment (optional but recommended)
    this.pepper = env.PASSWORD_PEPPER;
  }

  /**
   * Prepare password for hashing by optionally adding a pepper
   * Argon2id alone is secure, but a pepper adds defense-in-depth
   */
  private preparePassword(password: string): string {
    if (this.pepper) {
      return `${password}${this.pepper}`;
    }
    return password;
  }

  /**
   * Hash a password using Argon2id
   * @param password - Plain text password
   * @returns Hashed password string
   */
  async hashPassword(password: string): Promise<string> {
    const preparedPassword = this.preparePassword(password);
    return argon2.hash(preparedPassword, this.options);
  }

  /**
   * Compare a plain text password with a hash
   * @param password - Plain text password to verify
   * @param hash - Stored password hash
   * @returns true if password matches, false otherwise
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    const preparedPassword = this.preparePassword(password);
    try {
      return await argon2.verify(hash, preparedPassword);
    } catch {
      return false;
    }
  }
}

export const hashingUtils = new HashingUtils();
