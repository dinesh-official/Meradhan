import type { Request, Response } from "express";
import { appSchema } from "@root/schema";
import { HttpStatus } from "@utils/error/AppError";
import type { IAuthControllerInterface, IAuthServiceInterface } from "./auth.interface";


export class AuthController implements IAuthControllerInterface {

    private authService: IAuthServiceInterface;
    constructor(authService: IAuthServiceInterface) {
        this.authService = authService;
    }

    async login(req: Request, res: Response): Promise<void> {

        const { email, password } = appSchema.auth.loginZodSchema.parse(req.body);
        const token = await this.authService.login(email, password);
        res.cookie("token", token, {
            httpOnly: true, secure: true, sameSite: 'strict', maxAge: 3600000 // 1 hour
        });
        res.sendResponse({
            statusCode: HttpStatus.OK,
            message: "Login successful",
            data: {
                token,
            }
        })
    }

    async register(req: Request, res: Response): Promise<void> {
        const data = appSchema.auth.registerZodSchema.parse(req.body);
        const token = await this.authService.signUp(data);
        res.cookie("token", token, {
            httpOnly: true, secure: true, sameSite: 'strict', maxAge: 3600000 // 1 hour
        });
        res.json({ token });
    }

    async session(req: Request, res: Response): Promise<void> {
        const id = req.session?.id;
        const session = await this.authService.session(id!);
        res.sendResponse({
            statusCode: HttpStatus.OK,
            data: session
        })
    }

    async logout(req: Request, res: Response): Promise<void> {
        res.clearCookie("token");
        res.sendResponse({ statusCode: HttpStatus.OK, data: { message: "Logged out successfully" } });
    }
}

