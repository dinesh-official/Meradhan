import { db } from "@core/database/database";

class RbacService {
  private cache: Map<string, Set<string>> | null = null;
  private superAdminRoles: Set<string> | null = null;

  async loadCache(): Promise<void> {
    const superRoles = await db.dataBase.rbacRole.findMany({
      where: { isSuperAdmin: true, isActive: true },
      select: { key: true },
    });
    this.superAdminRoles = new Set(superRoles.map((r) => r.key));

    const policies = await db.dataBase.rbacRolePolicy.findMany({
      where: {
        granted: true,
        action: { isActive: true },
        role: { isActive: true },
      },
      select: {
        role: { select: { key: true } },
        action: { select: { key: true } },
      },
    });

    const map = new Map<string, Set<string>>();
    for (const p of policies) {
      if (!map.has(p.role.key)) map.set(p.role.key, new Set());
      map.get(p.role.key)!.add(p.action.key);
    }
    this.cache = map;
  }

  invalidateCache(): void {
    this.cache = null;
    this.superAdminRoles = null;
  }

  async can(roleKey: string, actionKey: string): Promise<boolean> {
    if (!this.superAdminRoles) await this.loadCache();
    if (this.superAdminRoles!.has(roleKey)) return true;
    if (!this.cache) await this.loadCache();
    return this.cache!.get(roleKey)?.has(actionKey) ?? false;
  }

  async getPermissionsForRole(roleKey: string): Promise<string[]> {
    if (!this.superAdminRoles) await this.loadCache();
    if (this.superAdminRoles!.has(roleKey)) {
      const all = await db.dataBase.rbacAction.findMany({
        where: { isActive: true },
        select: { key: true },
      });
      return all.map((a) => a.key);
    }
    if (!this.cache) await this.loadCache();
    return [...(this.cache!.get(roleKey) ?? [])];
  }

  async listRoles() {
    return db.dataBase.rbacRole.findMany({
      where: { isActive: true },
      orderBy: { id: "asc" },
      select: {
        id: true,
        key: true,
        label: true,
        description: true,
        isSuperAdmin: true,
        isSystem: true,
        isActive: true,
      },
    });
  }

  async listModules() {
    const modules = await db.dataBase.rbacModule.findMany({
      where: { isActive: true },
      orderBy: { id: "asc" },
      include: {
        _count: { select: { actions: true } },
      },
    });
    return modules.map((m) => ({
      id: m.id,
      key: m.key,
      label: m.label,
      description: m.description,
      isActive: m.isActive,
      actionCount: m._count.actions,
    }));
  }

  async listActions(moduleId: number) {
    const [actions, roles] = await Promise.all([
      db.dataBase.rbacAction.findMany({
        where: { moduleId, isActive: true },
        orderBy: { key: "asc" },
        include: {
          policies: {
            include: { role: { select: { key: true } } },
          },
        },
      }),
      db.dataBase.rbacRole.findMany({
        where: { isActive: true },
        orderBy: { id: "asc" },
        select: { key: true, isSuperAdmin: true },
      }),
    ]);

    return actions.map((action) => {
      const grants: Record<string, boolean> = {};
      for (const role of roles) {
        grants[role.key] = role.isSuperAdmin
          ? true
          : (action.policies.find((p) => p.role.key === role.key)?.granted ??
            false);
      }
      return {
        id: action.id,
        key: action.key,
        label: action.label,
        description: action.description,
        isGlobal: action.isGlobal,
        isActive: action.isActive,
        moduleId: action.moduleId,
        grants,
      };
    });
  }

  async createRole(
    payload: { key: string; label: string; description?: string },
    updatedById: number
  ) {
    const key = payload.key.trim().toUpperCase();
    const existing = await db.dataBase.rbacRole.findUnique({ where: { key } });
    if (existing) {
      throw new Error(`Role key "${key}" already exists`);
    }

    const role = await db.dataBase.rbacRole.create({
      data: {
        key,
        label: payload.label.trim(),
        description: payload.description?.trim(),
        isSuperAdmin: false,
        isSystem: false,
        isActive: true,
      },
    });

    const actions = await db.dataBase.rbacAction.findMany({
      where: { isActive: true },
      select: { id: true },
    });
    if (actions.length) {
      await db.dataBase.rbacRolePolicy.createMany({
        data: actions.map((a) => ({
          actionId: a.id,
          roleId: role.id,
          granted: false,
          updatedById,
        })),
      });
    }

    this.invalidateCache();
    return role;
  }

  async updateRole(
    roleId: number,
    payload: { label?: string; description?: string }
  ) {
    const role = await db.dataBase.rbacRole.findUnique({ where: { id: roleId } });
    if (!role || !role.isActive) throw new Error("Role not found");
    if (role.isSuperAdmin) throw new Error("Super Admin role cannot be edited");

    return db.dataBase.rbacRole.update({
      where: { id: roleId },
      data: {
        ...(payload.label !== undefined ? { label: payload.label.trim() } : {}),
        ...(payload.description !== undefined
          ? { description: payload.description.trim() || null }
          : {}),
      },
    });
  }

  async deactivateRole(roleId: number) {
    const role = await db.dataBase.rbacRole.findUnique({ where: { id: roleId } });
    if (!role || !role.isActive) throw new Error("Role not found");
    if (role.isSystem) throw new Error("System roles cannot be deactivated");
    if (role.isSuperAdmin) throw new Error("Super Admin role cannot be deactivated");

    const usersWithRole = await db.dataBase.cRMUserDataModel.count({
      where: { role: role.key as never },
    });
    if (usersWithRole > 0) {
      throw new Error(
        `Cannot deactivate role "${role.key}" — ${usersWithRole} user(s) still assigned`
      );
    }

    const updated = await db.dataBase.rbacRole.update({
      where: { id: roleId },
      data: { isActive: false },
    });
    this.invalidateCache();
    return updated;
  }

  async createAction(
    payload: {
      moduleId: number;
      key: string;
      label: string;
      description?: string;
      isGlobal?: boolean;
    },
    updatedById: number
  ) {
    const mod = await db.dataBase.rbacModule.findUnique({
      where: { id: payload.moduleId },
    });
    if (!mod || !mod.isActive) throw new Error("Module not found");

    const key = payload.key.trim();
    const existing = await db.dataBase.rbacAction.findUnique({ where: { key } });
    if (existing) throw new Error(`Action key "${key}" already exists`);

    const action = await db.dataBase.rbacAction.create({
      data: {
        key,
        label: payload.label.trim(),
        description: payload.description?.trim(),
        isGlobal: payload.isGlobal ?? false,
        isActive: true,
        moduleId: payload.moduleId,
      },
    });

    const roles = await db.dataBase.rbacRole.findMany({
      where: { isActive: true },
      select: { id: true },
    });
    if (roles.length) {
      await db.dataBase.rbacRolePolicy.createMany({
        data: roles.map((r) => ({
          actionId: action.id,
          roleId: r.id,
          granted: false,
          updatedById,
        })),
      });
    }

    this.invalidateCache();
    return action;
  }

  async updateAction(
    actionId: number,
    payload: { label?: string; description?: string }
  ) {
    const action = await db.dataBase.rbacAction.findUnique({
      where: { id: actionId },
    });
    if (!action || !action.isActive) throw new Error("Action not found");

    return db.dataBase.rbacAction.update({
      where: { id: actionId },
      data: {
        ...(payload.label !== undefined ? { label: payload.label.trim() } : {}),
        ...(payload.description !== undefined
          ? { description: payload.description.trim() || null }
          : {}),
      },
    });
  }

  async saveActionPolicies(
    actionId: number,
    grants: Record<string, boolean>,
    updatedById: number
  ) {
    const action = await db.dataBase.rbacAction.findUnique({
      where: { id: actionId },
      include: { policies: { include: { role: true } } },
    });
    if (!action || !action.isActive) throw new Error("Action not found");

    const roles = await db.dataBase.rbacRole.findMany({
      where: { isActive: true },
    });

    for (const role of roles) {
      if (role.isSuperAdmin) continue;
      const granted = grants[role.key] ?? false;
      await db.dataBase.rbacRolePolicy.upsert({
        where: {
          actionId_roleId: { actionId, roleId: role.id },
        },
        create: { actionId, roleId: role.id, granted, updatedById },
        update: { granted, updatedById },
      });
    }

    this.invalidateCache();
    return this.listActions(action.moduleId);
  }
}

export const rbacService = new RbacService();
