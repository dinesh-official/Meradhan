"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { useNotificationAccess } from "@/global/elements/permissions/AllowOnlyView";
import apiGateway from "@root/apiGateway";
import { format } from "date-fns";
import { Copy, FileText, MessageSquare, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";

/* ─── types ─────────────────────────────────────────────────── */

type Medium = "SMS" | "WHATSAPP" | "RCS";

type Template = {
  id: number;
  name: string;
  templateId: string;
  medium: Medium;
  message: string | null;
  rcsProjectId?: string | null;
  rcsNamespace?: string | null;
  rcsVariables?: string[] | null;
  createdAt: string;
  createdBy: { id: number; name: string };
};

type ApiResponse<T> = { responseData?: T };

const MEDIUMS: { value: Medium; label: string; color: string }[] = [
  { value: "SMS", label: "SMS", color: "bg-blue-100 text-blue-800 border-blue-300" },
  { value: "WHATSAPP", label: "WhatsApp", color: "bg-green-100 text-green-800 border-green-300" },
  { value: "RCS", label: "RCS", color: "bg-purple-100 text-purple-800 border-purple-300" },
];

function mediumMeta(m: Medium) {
  return MEDIUMS.find((x) => x.value === m) ?? MEDIUMS[0];
}

function extractMsg(e: unknown): string {
  if (
    e &&
    typeof e === "object" &&
    "response" in e &&
    (e as { response?: { data?: { message?: string } } }).response?.data?.message
  ) {
    return (e as { response: { data: { message: string } } }).response.data.message;
  }
  return "An unexpected error occurred.";
}

/** Extract ##variable## tokens from a message string */
function extractVariables(message: string): string[] {
  const matches = [...message.matchAll(/##(\w+)##/g)];
  return [...new Set(matches.map((m) => m[1]))];
}

const BLANK_FORM = {
  name: "",
  templateId: "",
  medium: "SMS" as Medium,
  message: "",
  rcsProjectId: "",
  rcsNamespace: "",
  rcsVariablesInput: "", // comma-separated string in the UI
};

/* ─── sub-component: message preview with highlights ───────── */

function MessagePreview({ message }: { message: string | null }) {
  if (!message) return null;
  const parts = message.split(/(##\w+##)/g);
  return (
    <p className="text-sm text-muted-foreground leading-relaxed break-words">
      {parts.map((part, i) =>
        /^##\w+##$/.test(part) ? (
          <span
            key={i}
            className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-xs font-semibold"
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
}

/* ─── component ─────────────────────────────────────────────── */

export default function NotificationTemplatesView() {
  const notify = useNotificationAccess();
  const [mounted, setMounted] = useState(false);

  const [activeMedium, setActiveMedium] = useState<Medium | "ALL">("ALL");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [saving, setSaving] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [dialogSuccess, setDialogSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const api = new apiGateway.crm.notifications.CrmNotificationsApi(apiClientCaller);
  const canManageTemplates = notify.canManageTemplates();

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.listTemplates(
        activeMedium !== "ALL" ? { medium: activeMedium } : undefined
      );
      const data = res.data as ApiResponse<Template[]>;
      setTemplates(data.responseData ?? []);
    } catch {
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [activeMedium]);

  useEffect(() => {
    if (mounted) loadTemplates();
  }, [mounted, loadTemplates]);

  const rcsVariablesArray = (input: string) =>
    input.split(",").map((v) => v.trim()).filter(Boolean);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...BLANK_FORM, medium: activeMedium !== "ALL" ? activeMedium : "SMS" });
    setDialogError(null);
    setDialogSuccess(null);
    setDialogOpen(true);
  };

  const openEdit = (t: Template) => {
    setEditing(t);
    setForm({
      name: t.name,
      templateId: t.templateId,
      medium: t.medium,
      message: t.message,
      rcsProjectId: t.rcsProjectId ?? "",
      rcsNamespace: t.rcsNamespace ?? "",
      rcsVariablesInput: (t.rcsVariables ?? []).join(", "),
    });
    setDialogError(null);
    setDialogSuccess(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setDialogError(null);
    setDialogSuccess(null);

    const messageRequired = form.medium !== "RCS";
    if (!form.name.trim() || !form.templateId.trim() || (messageRequired && !form.message.trim())) {
      setDialogError(
        messageRequired
          ? "Name, Template ID, and Message are all required."
          : "Name and Template ID are required."
      );
      return;
    }
    if (form.medium === "RCS" && !form.rcsProjectId.trim()) {
      setDialogError("Project ID is required for RCS templates.");
      return;
    }

    setSaving(true);
    try {
      const rcsPayload =
        form.medium === "RCS"
          ? {
              rcsProjectId: form.rcsProjectId.trim() || undefined,
              rcsNamespace: form.rcsNamespace.trim() || undefined,
              rcsVariables: rcsVariablesArray(form.rcsVariablesInput),
            }
          : { rcsProjectId: null, rcsNamespace: null, rcsVariables: null };

      const messageVal = form.message.trim() || null;

      if (editing) {
        const res = await api.updateTemplate(editing.id, {
          name: form.name,
          templateId: form.templateId,
          medium: form.medium,
          message: messageVal,
          ...rcsPayload,
        });
        const data = res.data as ApiResponse<Template>;
        const updated = data.responseData!;
        setTemplates((prev) =>
          prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t))
        );
        setDialogSuccess("Template updated successfully.");
        setTimeout(() => setDialogOpen(false), 800);
      } else {
        const res = await api.createTemplate({
          name: form.name,
          templateId: form.templateId,
          medium: form.medium,
          message: messageVal,
          ...rcsPayload,
        });
        const data = res.data as ApiResponse<Template>;
        const created = data.responseData!;
        if (activeMedium === "ALL" || created.medium === activeMedium) {
          setTemplates((prev) => [...prev, created]);
        }
        setDialogSuccess("Template created successfully.");
        setTimeout(() => setDialogOpen(false), 800);
      }
    } catch (e) {
      setDialogError(extractMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (t: Template) => {
    const confirmed = await Swal.fire({
      title: "Delete template?",
      html: `<strong>${t.name}</strong> will be removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete",
    });
    if (!confirmed.isConfirmed) return;

    setDeletingId(t.id);
    try {
      await api.deleteTemplate(t.id);
      setTemplates((prev) => prev.filter((x) => x.id !== t.id));
    } catch (e) {
      await Swal.fire("Failed", extractMsg(e), "error");
    } finally {
      setDeletingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!mounted) return null;
  if (!notify.canViewTemplates()) {
    return (
      <div className="p-8 text-center text-destructive">
        You do not have access to notifications.
      </div>
    );
  }

  const vars = form.message ? extractVariables(form.message) : [];

  return (
    <div className="p-4 space-y-4">
      <PageInfoBar
        title="Notification Templates"
        description="Manage templates per medium (SMS, WhatsApp, RCS). All roles can view; only admins can create or modify."
      />

      {/* Medium filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={activeMedium === "ALL" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveMedium("ALL")}
        >
          All
        </Button>
        {MEDIUMS.map((m) => (
          <Button
            key={m.value}
            variant={activeMedium === m.value ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveMedium(m.value)}
          >
            {m.label}
          </Button>
        ))}

        <div className="ml-auto">
          {canManageTemplates && (
            <Button onClick={openCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              Add template
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="border rounded-xl p-16 text-center">
          <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">
            {canManageTemplates
              ? 'No templates yet. Click "Add template" to create one.'
              : "No templates have been created by an admin yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => {
            const tVars = extractVariables(t.message ?? "");
            const meta = mediumMeta(t.medium);
            return (
              <div
                key={t.id}
                className="border rounded-xl p-4 bg-card shadow-sm hover:shadow-md transition-shadow space-y-2"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{t.name}</span>
                      {/* Medium badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${meta.color}`}
                      >
                        <MessageSquare className="w-3 h-3" />
                        {meta.label}
                      </span>
                      {tVars.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {tVars.length} var{tVars.length !== 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                      <span className="truncate">ID: {t.templateId}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 hover:text-foreground"
                        onClick={() => copyToClipboard(t.templateId)}
                        title="Copy template ID"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {canManageTemplates && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => openEdit(t)}
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={deletingId === t.id}
                        onClick={() => handleDelete(t)}
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Message preview */}
                {t.message ? (
                  <div className="bg-muted/40 rounded-lg px-3 py-2">
                    <MessagePreview message={t.message} />
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic px-1">
                    No message — content managed in MSG91 dashboard.
                  </p>
                )}

                {/* Variables pill list */}
                {tVars.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tVars.map((v) => (
                      <Badge key={v} variant="secondary" className="font-mono text-xs px-2">
                        {v}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* RCS metadata */}
                {t.medium === "RCS" && (
                  <div className="text-xs text-muted-foreground space-y-0.5 font-mono">
                    {t.rcsProjectId && <div>Project: {t.rcsProjectId}</div>}
                    {t.rcsNamespace && <div>Namespace: {t.rcsNamespace}</div>}
                    {(t.rcsVariables ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(t.rcsVariables ?? []).map((v, i) => (
                          <Badge key={i} variant="outline" className="font-mono text-xs px-2">
                            [{i + 1}] {v}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Created {format(new Date(t.createdAt), "dd MMM yyyy")}
                  {t.createdBy?.name ? ` by ${t.createdBy.name}` : ""}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit template" : "Add template"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="tpl-name">Template name</Label>
                <Input
                  id="tpl-name"
                  placeholder="e.g. OTP Verification"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tpl-medium">Medium</Label>
                <Select
                  value={form.medium}
                  onValueChange={(v) => setForm((f) => ({ ...f, medium: v as Medium }))}
                >
                  <SelectTrigger id="tpl-medium" className="w-full">
                    <SelectValue placeholder="Select medium" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SMS">SMS</SelectItem>
                    <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                    <SelectItem value="RCS">RCS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tpl-id">
                {form.medium === "SMS" ? "DLT Template ID" : "Template Name (API key)"}
              </Label>
              <Input
                id="tpl-id"
                placeholder={
                  form.medium === "SMS"
                    ? "e.g. 1707xxxxxxxxx"
                    : "e.g. meradhan_template1"
                }
                value={form.templateId}
                onChange={(e) => setForm((f) => ({ ...f, templateId: e.target.value }))}
              />
            </div>

            {/* RCS-specific fields */}
            {form.medium === "RCS" && (
              <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-4 space-y-3">
                <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                  RCS Configuration
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="tpl-rcs-project">Project ID <span className="text-destructive">*</span></Label>
                    <Input
                      id="tpl-rcs-project"
                      placeholder="e.g. 69e72d0380cbf5061400022d"
                      value={form.rcsProjectId}
                      onChange={(e) => setForm((f) => ({ ...f, rcsProjectId: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="tpl-rcs-ns">Namespace</Label>
                    <Input
                      id="tpl-rcs-ns"
                      placeholder="e.g. meradhan_template1"
                      value={form.rcsNamespace}
                      onChange={(e) => setForm((f) => ({ ...f, rcsNamespace: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">Leave blank to use template name.</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tpl-rcs-vars">
                    Variable names{" "}
                    <span className="text-muted-foreground font-normal text-xs">
                      (comma-separated, in order — e.g. customer_name, amount)
                    </span>
                  </Label>
                  <Input
                    id="tpl-rcs-vars"
                    placeholder="e.g. customer_name, amount, date"
                    value={form.rcsVariablesInput}
                    onChange={(e) => setForm((f) => ({ ...f, rcsVariablesInput: e.target.value }))}
                  />
                  {form.rcsVariablesInput.trim() && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {rcsVariablesArray(form.rcsVariablesInput).map((v, i) => (
                        <Badge key={i} variant="outline" className="font-mono text-xs border-purple-400 text-purple-800">
                          [{i + 1}] {v}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="tpl-msg">
                Message template{" "}
                <span className="text-muted-foreground font-normal text-xs">
                  {form.medium === "RCS"
                    ? "(optional — content is managed in MSG91 dashboard)"
                    : "(use ##variable## for placeholders)"}
                </span>
              </Label>
              <Textarea
                id="tpl-msg"
                rows={5}
                placeholder="e.g. Dear ##name##, use ##otp## to verify. – MeraDhan"
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
                className="font-mono text-sm resize-none"
              />
              <p className="text-xs text-right text-muted-foreground">
                {form.message.length} chars
              </p>
            </div>

            {/* Live variable preview */}
            {vars.length > 0 && (
              <div className="rounded-lg border bg-amber-50 border-amber-200 px-3 py-2 space-y-1">
                <p className="text-xs font-semibold text-amber-700">
                  Detected variables ({vars.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {vars.map((v) => (
                    <Badge
                      key={v}
                      variant="outline"
                      className="font-mono text-xs border-amber-400 text-amber-800"
                    >
                      {v}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-amber-600 mt-1">
                  On the Send page, variables will be pre-filled in the JSON editor.
                </p>
              </div>
            )}

            {/* Live message preview */}
            {form.message && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Preview
                </p>
                <div className="rounded-lg border bg-muted/30 px-3 py-2">
                  <MessagePreview message={form.message} />
                </div>
              </div>
            )}
          </div>

          {/* Inline validation / error / success — no Swal inside a Dialog */}
          {dialogError && (
            <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
              {dialogError}
            </p>
          )}
          {dialogSuccess && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
              {dialogSuccess}
            </p>
          )}

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
