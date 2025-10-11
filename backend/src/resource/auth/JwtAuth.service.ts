import type z from "zod";
import type { IAuthRepoInterface, IAuthServiceInterface } from "./auth.interface";
import type { UserDataModel } from "@core/database/database";
import { hashingUtils } from "@utils/hash/hashing.utils";
import { tokenUtils } from "@utils/token/JwtToken.utils";
import type { appSchema } from "@root/schema";
import { AppError, HttpStatus } from "@utils/error/AppError";
import type { ITokenUtils } from "@utils/token/token.interface";
import type { IHashingUtils } from "@utils/hash/hash.interface";

export class JwtAuthService implements IAuthServiceInterface {
    private tokenUtils: ITokenUtils;
    private autRepo: IAuthRepoInterface;
    private hash: IHashingUtils;

    constructor(authRepo: IAuthRepoInterface) {
        this.autRepo = authRepo;
        this.tokenUtils = tokenUtils;
        this.hash = hashingUtils;
    }

    async login(email: string, password: string): Promise<string> {
        const user = await this.autRepo.login(email);
        const isValidPassword = await this.hash.comparePassword(password, user.password);
        if (!isValidPassword) {
            throw new AppError("Invalid credentials", { statusCode: HttpStatus.UNAUTHORIZED, code: "INVALID_CREDENTIALS" });
        }
        const token = this.tokenUtils.generateToken({ id: user.id, email: user.email }, '1h');
        return token;
    }

    async signUp(d: z.infer<typeof appSchema.auth.registerZodSchema>): Promise<string> {
        const hashedPassword = await this.hash.hashPassword(d.password);
        const user = await this.autRepo.signUp({
            countryCode: d.countryCode,
            email: d.email,
            name: d.name,
            password: hashedPassword,
            phoneNo: d.phoneNo,
        });
        const token = this.tokenUtils.generateToken({ id: user.id, email: user.email }, '1h');
        return token;
    }

    async session(id: number | string): Promise<UserDataModel> {
        const user = await this.autRepo.getUser(id);
        delete (user as Record<string, unknown>).password;
        return user;
    }
}