"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import apiGateway from "@root/apiGateway";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import Swal from "sweetalert2";

type ApiPayload<T> = { responseData?: T };

type RbacRole = {
  id: number;
  key: string;
  label: string;
  description: string | null;
  isSuperAdmin: boolean;
  isSystem: boolean;
  isActive: boolean;
};

type RbacModule = {
  id: number;
  key: string;
  label: string;
  description: string | null;
  isActive: boolean;
  actionCount: number;
};

type RbacAction = {
  id: number;
  key: string;
  label: string;
  description: string | null;
  isGlobal: boolean;
  isActive: boolean;
  moduleId: number;
  grants: Record<string, boolean>;
};

const rbacApi = new apiGateway.crm.rbac.CrmRbacApi(apiClientCaller);

function extractMsg(e: unknown): string {
  if (
    e &&
    typeof e === "object" &&
    "response" in e &&
    (e as { response?: { data?: { message?: string } } }).response?.data?.message
  ) {
    return (e as { response: { data: { message: string } } }).response.data
      .message;
  }
  return "An unexpected error occurred.";
}

function grantedRoleLabels(action: RbacAction, roles: RbacRole[]): string[] {
  return roles
    .filter((r) => r.isSuperAdmin || action.grants[r.key])
    .map((r) => r.label);
}

function ActionPolicyEditor({
  action,
  roles,
  onSaved,
}: {
  action: RbacAction;
  roles: RbacRole[];
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, boolean>>(action.grants);
  const [saving, setSaving] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (next) setDraft({ ...action.grants });
    setOpen(next);
  };

  const save = async () => {
    setSaving(true);
    try {
      await rbacApi.saveActionPolicies(action.id, { grants: draft });
      await Swal.fire({
        icon: "success",
        title: "Permissions updated",
        text: "Affected users must re-login for changes to take effect.",
        timer: 2500,
        showConfirmButton: false,
      });
      setOpen(false);
      onSaved();
    } catch (e) {
      await Swal.fire("Failed", extractMsg(e), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => handleOpenChange(true)}
        aria-label={`Edit permissions for ${action.label}`}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{action.label}</DialogTitle>
          </DialogHeader>
          <p className="font-mono text-xs text-muted-foreground">{action.key}</p>
          <div className="space-y-2 max-h-64 overflow-y-auto py-1">
            {roles.map((role) => (
              <label
                key={role.key}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <Checkbox
                  checked={role.isSuperAdmin ? true : draft[role.key] ?? false}
                  disabled={role.isSuperAdmin}
                  onCheckedChange={(checked) => {
                    if (role.isSuperAdmin) return;
                    setDraft((prev) => ({
                      ...prev,
                      [role.key]: checked === true,
                    }));
                  }}
                />
                <span className={role.isSuperAdmin ? "text-muted-foreground" : ""}>
                  {role.label}
                  {role.isSuperAdmin ? " (always on)" : ""}
                </span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PermissionsPanel() {
  const queryClient = useQueryClient();
  const [moduleId, setModuleId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const modulesQuery = useQuery({
    queryKey: ["rbac-modules"],
    queryFn: async () => {
      const res = await rbacApi.listModules();
      const data = res.data as ApiPayload<RbacModule[]>;
      return data.responseData ?? [];
    },
  });

  const rolesQuery = useQuery({
    queryKey: ["rbac-roles"],
    queryFn: async () => {
      const res = await rbacApi.listRoles();
      const data = res.data as ApiPayload<RbacRole[]>;
      return data.responseData ?? [];
    },
  });

  const activeModuleId = moduleId ?? modulesQuery.data?.[0]?.id ?? null;

  const actionsQuery = useQuery({
    queryKey: ["rbac-actions", activeModuleId],
    enabled: activeModuleId != null,
    queryFn: async () => {
      const res = await rbacApi.listActions(activeModuleId!);
      const data = res.data as ApiPayload<RbacAction[]>;
      return data.responseData ?? [];
    },
  });

  const roles = rolesQuery.data ?? [];
  const filteredActions = useMemo(() => {
    const actions = actionsQuery.data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter(
      (a) =>
        a.key.toLowerCase().includes(q) || a.label.toLowerCase().includes(q)
    );
  }, [actionsQuery.data, search]);

  const invalidateActions = () => {
    queryClient.invalidateQueries({ queryKey: ["rbac-actions", activeModuleId] });
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search actions…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      <div className="flex flex-wrap gap-2">
        {(modulesQuery.data ?? []).map((mod) => (
          <Button
            key={mod.id}
            variant={activeModuleId === mod.id ? "default" : "outline"}
            size="sm"
            onClick={() => setModuleId(mod.id)}
          >
            {mod.label}
          </Button>
        ))}
      </div>

      {actionsQuery.isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Action key</th>
                <th className="text-left p-3 font-medium">Label</th>
                <th className="text-left p-3 font-medium">Granted to</th>
                <th className="p-3 w-12" />
              </tr>
            </thead>
            <tbody>
              {filteredActions.map((action) => {
                const labels = grantedRoleLabels(action, roles);
                return (
                  <tr key={action.id} className="border-t">
                    <td className="p-3 font-mono text-xs">{action.key}</td>
                    <td className="p-3">{action.label}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {labels.length ? (
                          labels.map((l) => (
                            <Badge key={l} variant="secondary">
                              {l}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <ActionPolicyEditor
                        action={action}
                        roles={roles}
                        onSaved={invalidateActions}
                      />
                    </td>
                  </tr>
                );
              })}
              {!filteredActions.length && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    No actions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RolesPanel() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editRole, setEditRole] = useState<RbacRole | null>(null);
  const [form, setForm] = useState({ key: "", label: "", description: "" });

  const rolesQuery = useQuery({
    queryKey: ["rbac-roles"],
    queryFn: async () => {
      const res = await rbacApi.listRoles();
      const data = res.data as ApiPayload<RbacRole[]>;
      return data.responseData ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: () =>
      rbacApi.createRole({
        key: form.key,
        label: form.label,
        description: form.description || undefined,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["rbac-roles"] });
      setCreateOpen(false);
      setForm({ key: "", label: "", description: "" });
      await Swal.fire("Created", "Role created with all actions denied.", "success");
    },
    onError: (e) => Swal.fire("Failed", extractMsg(e), "error"),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      rbacApi.updateRole(editRole!.id, {
        label: form.label,
        description: form.description || undefined,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["rbac-roles"] });
      setEditRole(null);
      await Swal.fire("Updated", "Role updated.", "success");
    },
    onError: (e) => Swal.fire("Failed", extractMsg(e), "error"),
  });

  const deactivateMutation = useMutation({
    mutationFn: (roleId: number) => rbacApi.deactivateRole(roleId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["rbac-roles"] });
      await Swal.fire("Deactivated", "Role deactivated.", "success");
    },
    onError: (e) => Swal.fire("Failed", extractMsg(e), "error"),
  });

  const openEdit = (role: RbacRole) => {
    setEditRole(role);
    setForm({
      key: role.key,
      label: role.label,
      description: role.description ?? "",
    });
  };

  const handleDeactivate = async (role: RbacRole) => {
    const confirmed = await Swal.fire({
      title: `Deactivate ${role.label}?`,
      text: "Users must be reassigned before deactivation.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Deactivate",
    });
    if (!confirmed.isConfirmed) return;
    deactivateMutation.mutate(role.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add role
        </Button>
      </div>

      {rolesQuery.isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Key</th>
                <th className="text-left p-3 font-medium">Label</th>
                <th className="text-left p-3 font-medium">Type</th>
                <th className="p-3 w-24" />
              </tr>
            </thead>
            <tbody>
              {(rolesQuery.data ?? []).map((role) => (
                <tr key={role.id} className="border-t">
                  <td className="p-3 font-mono text-xs">{role.key}</td>
                  <td className="p-3">{role.label}</td>
                  <td className="p-3">
                    {role.isSuperAdmin
                      ? "Super Admin"
                      : role.isSystem
                        ? "System"
                        : "Custom"}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1 justify-end">
                      {!role.isSuperAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(role)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {!role.isSystem && !role.isSuperAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeactivate(role)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add role</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Key</Label>
              <Input
                placeholder="BOND_MANAGER"
                value={form.key}
                onChange={(e) =>
                  setForm((f) => ({ ...f, key: e.target.value.toUpperCase() }))
                }
              />
            </div>
            <div>
              <Label>Label</Label>
              <Input
                value={form.label}
                onChange={(e) =>
                  setForm((f) => ({ ...f, label: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !form.key || !form.label}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editRole} onOpenChange={(o) => !o && setEditRole(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit role — {editRole?.key}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Label</Label>
              <Input
                value={form.label}
                onChange={(e) =>
                  setForm((f) => ({ ...f, label: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditRole(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending || !form.label}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function RbacAdminView() {
  return (
    <div className="flex flex-col gap-5">
      <PageInfoBar
        title="Role Permissions"
        description="Manage CRM roles and fine-grained action permissions."
      />
      <Tabs defaultValue="permissions">
        <TabsList>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>
        <TabsContent value="permissions" className="mt-4">
          <PermissionsPanel />
        </TabsContent>
        <TabsContent value="roles" className="mt-4">
          <RolesPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
