import { createCrmActivityLog } from "@resource/crm/auditlogs/auditlog.repo";
import { rbacService } from "@resource/crm/rbac/rbac.service";
import { AppError, HttpStatus } from "@utils/error/AppError";
import { tokenUtils } from "@utils/token/JwtToken_utils";
import type { Request } from "express";
import { AuthRepo } from "./auth.repo";

type CrmJwtPayload = {
  id: number;
  email: string;
  role: string;
  impersonatedBy?: number;
};

export class ImpersonationService {
  private authRepo = new AuthRepo();

  async impersonate(adminId: number, targetUserId: number, req: Request) {
    if (adminId === targetUserId) {
      throw new AppError("You cannot impersonate yourself.", {
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const target = await this.authRepo.getAuthSession(targetUserId);

    if (target.accountStatus !== "ACTIVE") {
      throw new AppError("Only active users can be impersonated.", {
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const admin = await this.authRepo.getAuthSession(adminId);
    const permissions = await rbacService.getPermissionsForRole(
      String(target.role),
    );

    const token = tokenUtils.generateToken(
      {
        id: target.id,
        email: target.email,
        role: target.role,
        impersonatedBy: admin.id,
      },
      "4h",
    );

    await createCrmActivityLog(req, {
      userId: admin.id,
      action: "IMPERSONATE_START",
      entityType: "USERS",
      entityId: target.id,
      details: {
        reason: "Super Admin started impersonation",
        targetUserId: target.id,
        targetEmail: target.email,
        targetRole: target.role,
        adminUserId: admin.id,
        adminEmail: admin.email,
      },
    });

    return {
      token,
      id: target.id,
      role: target.role,
      avatar: target.avatar,
      name: target.name,
      email: target.email,
      phoneNo: target.phoneNo,
      permissions,
      impersonatedBy: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    };
  }

  async exitImpersonation(req: Request) {
    const currentToken =
      req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : req.cookies?.token;

    const impersonatorToken = req.cookies?.impersonatorToken;

    if (!currentToken || !impersonatorToken) {
      throw new AppError("No active impersonation session.", {
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const currentPayload = tokenUtils.verifyToken<CrmJwtPayload>(currentToken);
    const adminPayload =
      tokenUtils.verifyToken<CrmJwtPayload>(impersonatorToken);

    if (!currentPayload.impersonatedBy) {
      throw new AppError("You are not impersonating another user.", {
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    if (adminPayload.id !== currentPayload.impersonatedBy) {
      throw new AppError("Invalid impersonation session.", {
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    const canImpersonate = await rbacService.can(
      String(adminPayload.role),
      "system.impersonate",
    );
    if (!canImpersonate) {
      throw new AppError("You do not have permission to exit impersonation.", {
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    const admin = await this.authRepo.getAuthSession(adminPayload.id);
    const permissions = await rbacService.getPermissionsForRole(
      String(admin.role),
    );

    await createCrmActivityLog(req, {
      userId: admin.id,
      action: "IMPERSONATE_END",
      entityType: "USERS",
      entityId: currentPayload.id,
      details: {
        reason: "Super Admin ended impersonation",
        targetUserId: currentPayload.id,
        targetEmail: currentPayload.email,
        targetRole: currentPayload.role,
        adminUserId: admin.id,
        adminEmail: admin.email,
      },
    });

    return {
      token: impersonatorToken,
      id: admin.id,
      role: admin.role,
      avatar: admin.avatar,
      name: admin.name,
      email: admin.email,
      phoneNo: admin.phoneNo,
      permissions,
      impersonatedBy: null,
    };
  }

  async getImpersonatorSummary(impersonatedById: number) {
    const admin = await this.authRepo.getAuthSession(impersonatedById);
    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
    };
  }
}
