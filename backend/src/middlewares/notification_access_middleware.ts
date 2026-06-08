import type { NextFunction, Request, Response } from "express";

const NOTIFICATION_ROLES = ["SALES", "ADMIN", "SUPER_ADMIN"] as const;

export function requireNotificationAccess(req: Request, res: Response, next: NextFunction) {
  const role = req.session?.role;
  if (
    !role ||
    !NOTIFICATION_ROLES.includes(role as (typeof NOTIFICATION_ROLES)[number])
  ) {
    return res.status(403).json({
      status: false,
      code: "FORBIDDEN",
      message: "You do not have permission to use notification features.",
    });
  }
  next();
}
