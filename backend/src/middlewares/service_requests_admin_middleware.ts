import type { NextFunction, Request, Response } from "express";

const SERVICE_REQUEST_ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"] as const;

/** Only ADMIN and SUPER_ADMIN can manage service requests in v1. */
export function requireServiceRequestAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const role = req.session?.role;
  if (
    !role ||
    !SERVICE_REQUEST_ADMIN_ROLES.includes(role as (typeof SERVICE_REQUEST_ADMIN_ROLES)[number])
  ) {
    return res.status(403).json({
      status: false,
      code: "FORBIDDEN",
      message: "Only admins can manage service requests.",
    });
  }
  next();
}
