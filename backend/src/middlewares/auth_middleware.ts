import { db } from "@core/database/database";
import type { CustomerJwtPayload } from "@services/customer/customer_auth_token.helper";
import { tokenUtils } from "@utils/token/JwtToken_utils";
import type { NextFunction, Request, Response } from "express";

type Role = "USER" | "ADMIN" | "SUPER_ADMIN" | "PUBLIC" | "VIEWER" | "SALES" | "SUPPORT" | "RELATIONSHIP_MANAGER" | "CRM";

async function validateCustomerSession(
  data: CustomerJwtPayload,
  res: Response,
): Promise<boolean> {
  const auth = await db.dataBase.customersAuthDataModel.findFirst({
    where: {
      customerProfileDataModel: { id: data.id, isDeleted: false },
    },
    select: { accountStatus: true, tokenVersion: true },
  });

  if (!auth) {
    res.status(401).json({
      status: false,
      code: "ACCESS_DENIED",
      message: "Access Denied! Session is expired or invalid.",
    });
    return false;
  }

  const tokenVersion = data.tv ?? 0;
  if (tokenVersion !== auth.tokenVersion) {
    res.status(401).json({
      status: false,
      code: "ACCESS_DENIED",
      message: "Access Denied! Session is expired or invalid.",
    });
    return false;
  }

  if (auth.accountStatus === "CLOSED") {
    res.status(403).json({
      status: false,
      code: "ACCOUNT_CLOSED",
      message: "Your account has been closed. Please contact us to open new account",
    });
    return false;
  }

  if (auth.accountStatus === "SUSPENDED") {
    res.status(403).json({
      status: false,
      code: "ACCOUNT_SUSPENDED",
      message: "Your account has been suspended",
    });
    return false;
  }

  return true;
}

export const allowAccessMiddleware =
  (...allowedRoles: Role[]) =>
    async (req: Request, res: Response, next: NextFunction) => {
      if (allowedRoles.includes("CRM")) {
        const newAllowedRoles = new Set([
          ...allowedRoles,
          "ADMIN",
          "SUPER_ADMIN",
          "VIEWER",
          "SALES",
          "SUPPORT",
          "RELATIONSHIP_MANAGER",
        ]);
        allowedRoles = Array.from(newAllowedRoles) as Role[];
      }

      const authHeader = req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : undefined;

      const authCookie = req.cookies?.token;
      const token = authHeader || authCookie;

      const isPublic = allowedRoles.includes("PUBLIC");
      const crmRoles = [
        "ADMIN",
        "SUPER_ADMIN",
        "VIEWER",
        "SALES",
        "SUPPORT",
        "RELATIONSHIP_MANAGER",
      ] as const;
      const requiresAuth =
        allowedRoles.includes("USER") ||
        allowedRoles.some((r) => crmRoles.includes(r as (typeof crmRoles)[number]));

      if (!requiresAuth && isPublic) {
        return next();
      }

      if (requiresAuth && !token) {
        return res.status(401).json({
          status: false,
          code: "ACCESS_DENIED",
          message: "Access Denied! Session token does not exist.",
        });
      }

      if (!token && isPublic) {
        return next();
      }

      try {
        const data = tokenUtils.verifyToken<CustomerJwtPayload & { role: Exclude<Role, "PUBLIC"> }>(
          token!,
        );

        if (data.role === "SUPER_ADMIN") {
          req.session = {
            id: data.id,
            email: data.email,
            token: token!,
            role: "SUPER_ADMIN",
          };
          return next();
        }

        if (allowedRoles.length && !allowedRoles.includes(data.role)) {
          return res.status(403).json({
            status: false,
            code: "FORBIDDEN",
            message: "You do not have permission to access this resource.",
          });
        }

        if (crmRoles.includes(data.role as (typeof crmRoles)[number])) {
          req.session = {
            id: data.id,
            email: data.email,
            token: token!,
            role: data.role as (typeof crmRoles)[number],
          };
        } else {
          const ok = await validateCustomerSession(data, res);
          if (!ok) return;
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

/** Verifies JWT and attaches req.customer without account-status checks (for session probe). */
export function verifyCustomerJwtOnly(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : undefined;
  const token = authHeader || req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      status: false,
      code: "ACCESS_DENIED",
      message: "Access Denied! Session token does not exist.",
    });
  }

  try {
    const data = tokenUtils.verifyToken<CustomerJwtPayload & { role: Exclude<Role, "PUBLIC"> }>(
      token,
    );
    if (data.role !== "USER") {
      return res.status(403).json({
        status: false,
        code: "FORBIDDEN",
        message: "You do not have permission to access this resource.",
      });
    }
    req.customer = {
      id: data.id,
      email: data.email,
      token,
      role: "USER",
    };
    return next();
  } catch {
    return res.status(401).json({
      status: false,
      code: "ACCESS_DENIED",
      message: "Access Denied! Session is expired or invalid.",
    });
  }
}

/** Public routes: attach `req.customer` when a valid USER token is present; never block. */
export function optionalCustomerAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : undefined;
  const token = authHeader || req.cookies?.token;
  if (!token) {
    return next();
  }
  try {
    const data = tokenUtils.verifyToken<CustomerJwtPayload & { role: Exclude<Role, "PUBLIC"> }>(
      token,
    );
    if (data.role === "USER") {
      req.customer = {
        id: data.id,
        email: data.email,
        token,
        role: "USER",
      };
    }
  } catch {
    // Expired / CRM / invalid token — still allow public read
  }
  return next();
}
