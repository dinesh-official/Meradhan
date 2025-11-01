import { tokenUtils } from "@utils/token/JwtToken_utils";
import type { NextFunction, Request, Response } from "express";

export const withCrmAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {

    const authHeader = req.headers.authorization?.split("Bearer ")[1]
    const authCookie = req.cookies.token;
    const token = authHeader || authCookie;
 
    if (!token) {
        res.status(401).json({
            status: false,
            code: "ACCESS_DENIED",
            message: "Access Denied! Session token does not exist."
        })
        return;
    }

    try {
        const data = tokenUtils.verifyToken<{ id: number; email: string }>(token);
        req.session = {
            id: data.id, email: data.email, token
        };
        next();
    } catch (error) {

        res.status(401).json({
            status: false,
            code: "ACCESS_DENIED",
            message: "Access Denied! Session is expired.",
            error: (error as Error)?.message || "Unknown Error!"
        })
        return;
    }
}