import { tokenUtils } from "@utils/token/JwtToken_utils";
import type { NextFunction, Request, Response } from "express";

type Role = "USER" | "ADMIN" | "SUPER_ADMIN" | "PUBLIC" | "VIEWER" | "SALES" | "SUPPORT" | "RELATIONSHIP_MANAGER" | "CRM";

export const allowAccessMiddleware =
  (...allowedRoles: Role[]) =>
    (req: Request, res: Response, next: NextFunction) => {

      if (allowedRoles.includes("CRM")) {
        const newAllowedRoles = new Set([...allowedRoles, "ADMIN", "SUPER_ADMIN", "VIEWER", "SALES", "SUPPORT", "RELATIONSHIP_MANAGER"]);
        allowedRoles = Array.from(newAllowedRoles) as Role[];
      }

      const authHeader = req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : undefined;

      const authCookie = req.cookies?.token;
      const token = authHeader || authCookie;

      const isPublic = allowedRoles.includes("PUBLIC");
      const crmRoles = ["ADMIN", "SUPER_ADMIN", "VIEWER", "SALES", "SUPPORT", "RELATIONSHIP_MANAGER"] as const;
      const requiresAuth =
        allowedRoles.includes("USER") ||
        allowedRoles.some((r) => crmRoles.includes(r as (typeof crmRoles)[number]));

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

        // SUPER_ADMIN: allow all actions (bypass role check)
        if (data.role === "SUPER_ADMIN") {
          req.session = {
            id: data.id,
            email: data.email,
            token: token!,
            role: "SUPER_ADMIN",
          };
          return next();
        }

        // 🛑 Role validation
        if (allowedRoles.length && !allowedRoles.includes(data.role)) {
          return res.status(403).json({
            status: false,
            code: "FORBIDDEN",
            message: "You do not have permission to access this resource.",
          });
        }

        // Attach session: all CRM roles use req.session; USER uses req.customer
        if (crmRoles.includes(data.role as (typeof crmRoles)[number])) {
          req.session = {
            id: data.id,
            email: data.email,
            token: token!,
            role: data.role as (typeof crmRoles)[number],
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
