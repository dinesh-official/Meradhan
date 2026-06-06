import { rbacService } from "@resource/crm/rbac/rbac.service";
import type { NextFunction, Request, Response } from "express";

function forbidden(res: Response) {
  return res.status(403).json({
    status: false,
    code: "FORBIDDEN",
    message: "You do not have permission to access this resource.",
  });
}

export function requirePermission(actionKey: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const roleKey = req.session?.role;
    if (!roleKey) {
      return res.status(401).json({
        status: false,
        code: "ACCESS_DENIED",
        message: "Unauthorized",
      });
    }

    const allowed = await rbacService.can(String(roleKey), actionKey);
    if (!allowed) return forbidden(res);
    return next();
  };
}

export function requireAnyPermission(...actionKeys: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const roleKey = req.session?.role;
    if (!roleKey) {
      return res.status(401).json({
        status: false,
        code: "ACCESS_DENIED",
        message: "Unauthorized",
      });
    }

    const checks = await Promise.all(
      actionKeys.map((key) => rbacService.can(String(roleKey), key))
    );
    if (!checks.some(Boolean)) return forbidden(res);
    return next();
  };
}
