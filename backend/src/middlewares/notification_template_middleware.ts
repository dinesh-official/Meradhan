import type { NextFunction, Request, Response } from "express";

const TEMPLATE_ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"] as const;

/** Only ADMIN and SUPER_ADMIN can mutate notification templates. */
export function requireTemplateAdmin(req: Request, res: Response, next: NextFunction) {
  const role = req.session?.role;
  if (
    !role ||
    !TEMPLATE_ADMIN_ROLES.includes(role as (typeof TEMPLATE_ADMIN_ROLES)[number])
  ) {
    return res.status(403).json({
      status: false,
      code: "FORBIDDEN",
      message: "Only admins can manage notification templates.",
    });
  }
  next();
}
