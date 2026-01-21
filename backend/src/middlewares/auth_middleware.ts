import { tokenUtils } from "@utils/token/JwtToken_utils";
import type { NextFunction, Request, Response } from "express";

type Role = "USER" | "ADMIN" | "PUBLIC";

export const allowAccessMiddleware =
  (...allowedRoles: Role[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : undefined;

    const authCookie = req.cookies?.token;
    const token = authHeader || authCookie;

    const isPublic = allowedRoles.includes("PUBLIC");
    const requiresAuth =
      allowedRoles.includes("USER") || allowedRoles.includes("ADMIN");

    // 🔓 Public route with no auth required
    if (!requiresAuth && isPublic) {
      return next();
    }

    // 🔒 Auth required but no token
    if (requiresAuth && !token) {
      return res.status(401).json({
        status: false,
        code: "ACCESS_DENIED",
        message: "Access Denied! Session token does not exist.",
      });
    }

    // 🧪 Optional auth (PUBLIC + USER/ADMIN)
    if (!token && isPublic) {
      return next();
    }

    try {
      const data = tokenUtils.verifyToken<{
        id: number;
        email: string;
        role: Exclude<Role, "PUBLIC">;
      }>(token!);

      // 🛑 Role validation
      if (allowedRoles.length && !allowedRoles.includes(data.role)) {
        return res.status(403).json({
          status: false,
          code: "FORBIDDEN",
          message: "You do not have permission to access this resource.",
        });
      }

      // Attach session based on role
      if (data.role === "ADMIN") {
        req.session = {
          id: data.id,
          email: data.email,
          token: token!,
          role: "ADMIN",
        };
      } else {
        req.customer = {
          id: data.id,
          email: data.email,
          token: token!,
          role: "USER",
        };
      }

      return next();
    } catch (error) {
      if (isPublic) {
        return next();
      }

      return res.status(401).json({
        status: false,
        code: "ACCESS_DENIED",
        message: "Access Denied! Session is expired or invalid.",
        error: (error as Error).message,
      });
    }
  };
