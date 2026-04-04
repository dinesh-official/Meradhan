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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import useAppCookie from "@/hooks/useAppCookie.hook";
import { canAccessNotifications } from "@/global/utils/role.utils";
import apiGateway from "@root/apiGateway";
import { format } from "date-fns";
import { Copy, FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

/* ─── types ─────────────────────────────────────────────────── */

type Template = {
  id: number;
  name: string;
  templateId: string;
  message: string;
  createdAt: string;
  createdBy: { id: number; name: string };
};

type ApiResponse<T> = { responseData?: T };

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

const BLANK_FORM = { name: "", templateId: "", message: "" };

/* ─── sub-component: message preview with highlights ───────── */

function MessagePreview({ message }: { message: string }) {
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
  const { cookies } = useAppCookie();
  const [mounted, setMounted] = useState(false);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const api = new apiGateway.crm.notifications.CrmNotificationsApi(apiClientCaller);
  const isAdmin = cookies.role === "ADMIN" || cookies.role === "SUPER_ADMIN";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.listTemplates();
        const data = res.data as ApiResponse<Template[]>;
        if (!cancelled) setTemplates(data.responseData ?? []);
      } catch {
        if (!cancelled) setTemplates([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(BLANK_FORM);
    setDialogOpen(true);
  };

  const openEdit = (t: Template) => {
    setEditing(t);
    setForm({ name: t.name, templateId: t.templateId, message: t.message });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.templateId.trim() || !form.message.trim()) {
      await Swal.fire("Validation", "All fields are required.", "warning");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const res = await api.updateTemplate(editing.id, form);
        const data = res.data as ApiResponse<Template>;
        const updated = data.responseData!;
        setTemplates((prev) =>
          prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t))
        );
        await Swal.fire({ icon: "success", title: "Template updated", timer: 1200, showConfirmButton: false });
      } else {
        const res = await api.createTemplate(form);
        const data = res.data as ApiResponse<Template>;
        setTemplates((prev) => [...prev, data.responseData!]);
        await Swal.fire({ icon: "success", title: "Template created", timer: 1200, showConfirmButton: false });
      }
      setDialogOpen(false);
    } catch (e) {
      await Swal.fire("Failed", extractMsg(e), "error");
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
  if (!canAccessNotifications(cookies.role)) {
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
        description="Manage DLT-registered SMS templates. All roles can view; only admins can create or modify."
      />

      <div className="flex justify-end">
        {isAdmin && (
          <Button onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            Add template
          </Button>
        )}
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
            {isAdmin
              ? 'No templates yet. Click "Add template" to create one.'
              : "No templates have been created by an admin yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => {
            const vars = extractVariables(t.message);
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
                      {vars.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {vars.length} var{vars.length !== 1 ? "s" : ""}
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

                  {isAdmin && (
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
                <div className="bg-muted/40 rounded-lg px-3 py-2">
                  <MessagePreview message={t.message} />
                </div>

                {/* Variables pill list */}
                {vars.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {vars.map((v) => (
                      <Badge
                        key={v}
                        variant="secondary"
                        className="font-mono text-xs px-2"
                      >
                        {v}
                      </Badge>
                    ))}
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
                <Label htmlFor="tpl-id">DLT Template ID</Label>
                <Input
                  id="tpl-id"
                  placeholder="e.g. 1707xxxxxxxxx"
                  value={form.templateId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, templateId: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tpl-msg">
                Message template{" "}
                <span className="text-muted-foreground font-normal text-xs">
                  (use ##variable## for placeholders)
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
