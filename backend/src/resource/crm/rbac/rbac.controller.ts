import { appSchema } from "@root/schema";
import { AppError, HttpStatus } from "@utils/error/AppError";
import type { Request, Response } from "express";
import { rbacService } from "./rbac.service";

export class RbacController {
  listRoles = async (_req: Request, res: Response) => {
    const data = await rbacService.listRoles();
    res.sendResponse({ statusCode: HttpStatus.OK, responseData: data });
  };

  createRole = async (req: Request, res: Response) => {
    const body = appSchema.crm.rbac.createRoleSchema.parse(req.body);
    try {
      const data = await rbacService.createRole(body, req.session!.id);
      res.sendResponse({
        statusCode: HttpStatus.CREATED,
        message: "Role created",
        responseData: data,
      });
    } catch (err) {
      throw new AppError((err as Error).message, {
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
  };

  updateRole = async (req: Request, res: Response) => {
    const roleId = Number(req.params.id);
    const body = appSchema.crm.rbac.updateRoleSchema.parse(req.body);
    try {
      const data = await rbacService.updateRole(roleId, body);
      res.sendResponse({
        statusCode: HttpStatus.OK,
        message: "Role updated",
        responseData: data,
      });
    } catch (err) {
      throw new AppError((err as Error).message, {
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
  };

  deactivateRole = async (req: Request, res: Response) => {
    const roleId = Number(req.params.id);
    try {
      const data = await rbacService.deactivateRole(roleId);
      res.sendResponse({
        statusCode: HttpStatus.OK,
        message: "Role deactivated",
        responseData: data,
      });
    } catch (err) {
      throw new AppError((err as Error).message, {
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
  };

  listModules = async (_req: Request, res: Response) => {
    const data = await rbacService.listModules();
    res.sendResponse({ statusCode: HttpStatus.OK, responseData: data });
  };

  listActions = async (req: Request, res: Response) => {
    const moduleId = Number(req.params.moduleId);
    const data = await rbacService.listActions(moduleId);
    res.sendResponse({ statusCode: HttpStatus.OK, responseData: data });
  };

  createAction = async (req: Request, res: Response) => {
    const body = appSchema.crm.rbac.createActionSchema.parse(req.body);
    try {
      const data = await rbacService.createAction(body, req.session!.id);
      res.sendResponse({
        statusCode: HttpStatus.CREATED,
        message: "Action created",
        responseData: data,
      });
    } catch (err) {
      throw new AppError((err as Error).message, {
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
  };

  updateAction = async (req: Request, res: Response) => {
    const actionId = Number(req.params.id);
    const body = appSchema.crm.rbac.updateActionSchema.parse(req.body);
    try {
      const data = await rbacService.updateAction(actionId, body);
      res.sendResponse({
        statusCode: HttpStatus.OK,
        message: "Action updated",
        responseData: data,
      });
    } catch (err) {
      throw new AppError((err as Error).message, {
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
  };

  saveActionPolicies = async (req: Request, res: Response) => {
    const actionId = Number(req.params.id);
    const body = appSchema.crm.rbac.saveActionPoliciesSchema.parse(req.body);
    try {
      const data = await rbacService.saveActionPolicies(
        actionId,
        body.grants,
        req.session!.id
      );
      res.sendResponse({
        statusCode: HttpStatus.OK,
        message: "Permissions updated",
        responseData: data,
      });
    } catch (err) {
      throw new AppError((err as Error).message, {
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
  };
}
