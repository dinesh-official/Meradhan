import { Router } from "express";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";
import { requirePermission } from "@middlewares/require_permission_middleware";
import { RbacController } from "./rbac.controller";

const router = Router();
const controller = new RbacController();

const gate = [
  allowAccessMiddleware("CRM"),
  requirePermission("system.rbac.manage"),
];

router.get("/api/crm/rbac/roles", ...gate, (req, res) =>
  controller.listRoles(req, res)
);
router.post("/api/crm/rbac/roles", ...gate, (req, res) =>
  controller.createRole(req, res)
);
router.patch("/api/crm/rbac/roles/:id", ...gate, (req, res) =>
  controller.updateRole(req, res)
);
router.delete("/api/crm/rbac/roles/:id", ...gate, (req, res) =>
  controller.deactivateRole(req, res)
);

router.get("/api/crm/rbac/modules", ...gate, (req, res) =>
  controller.listModules(req, res)
);
router.get("/api/crm/rbac/modules/:moduleId/actions", ...gate, (req, res) =>
  controller.listActions(req, res)
);
router.post("/api/crm/rbac/actions", ...gate, (req, res) =>
  controller.createAction(req, res)
);
router.patch("/api/crm/rbac/actions/:id", ...gate, (req, res) =>
  controller.updateAction(req, res)
);
router.put("/api/crm/rbac/actions/:id/policies", ...gate, (req, res) =>
  controller.saveActionPolicies(req, res)
);

export default router;
