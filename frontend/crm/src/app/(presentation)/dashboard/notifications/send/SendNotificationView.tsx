"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import useAppCookie from "@/hooks/useAppCookie.hook";
import { canAccessNotifications } from "@/global/utils/role.utils";
import apiGateway from "@root/apiGateway";
import { Eye, ExternalLink } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import SavedListMembersDialog from "../_components/SavedListMembersDialog";

/* ─── types ─────────────────────────────────────────────────── */

type Medium = "SMS" | "WHATSAPP" | "RCS";

type SavedList = {
  id: number;
  name: string;
  _count?: { members: number };
};

type DltTemplate = {
  id: number;
  name: string;
  templateId: string;
  medium: Medium;
  message: string;
  rcsProjectId?: string | null;
  rcsNamespace?: string | null;
  rcsVariables?: string[] | null;
};

type ApiResponse<T> = { responseData?: T };

/* ─── medium config ──────────────────────────────────────────── */

const MEDIUMS: { value: Medium; label: string; comingSoon?: boolean }[] = [
  { value: "SMS", label: "SMS" },
  { value: "WHATSAPP", label: "WhatsApp", comingSoon: true },
  { value: "RCS", label: "RCS" },
];

/* ─── helpers ────────────────────────────────────────────────── */

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

/** Extract ##variable## tokens and build a pre-filled JSON string */
function buildVarsJson(message: string): string {
  const matches = [...message.matchAll(/##(\w+)##/g)];
  const unique = [...new Set(matches.map((m) => m[1]))];
  if (unique.length === 0) return "{}";
  const obj = Object.fromEntries(unique.map((v) => [v, ""]));
  return JSON.stringify(obj, null, 2);
}

/** Highlight ##var## tokens in the message for readonly preview */
function MessagePreview({ message }: { message: string }) {
  const parts = message.split(/(##\w+##)/g);
  return (
    <>
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
    </>
  );
}

/* ─── main view ──────────────────────────────────────────────── */

export default function SendNotificationView() {
  const { cookies } = useAppCookie();
  const [mounted, setMounted] = useState(false);

  const [lists, setLists] = useState<SavedList[]>([]);
  const [listsLoading, setListsLoading] = useState(true);
  const [savedListId, setSavedListId] = useState<string>("");
  const [viewListOpen, setViewListOpen] = useState(false);

  const [medium, setMedium] = useState<Medium>("SMS");
  const [allTemplates, setAllTemplates] = useState<DltTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [varsJson, setVarsJson] = useState("{}");
  // RCS: ordered variable values keyed by variable name
  const [rcsVarValues, setRcsVarValues] = useState<Record<string, string>>({});
  const [sendLoading, setSendLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const api = new apiGateway.crm.notifications.CrmNotificationsApi(apiClientCaller);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load saved lists once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.listSavedLists();
        const data = res.data as ApiResponse<SavedList[]>;
        if (!cancelled) setLists(data.responseData ?? []);
      } catch {
        if (!cancelled) setLists([]);
      } finally {
        if (!cancelled) setListsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Load ALL templates once (we filter client-side by medium)
  const loadTemplates = useCallback(async () => {
    setTemplatesLoading(true);
    try {
      const res = await api.listTemplates();
      const data = res.data as ApiResponse<DltTemplate[]>;
      setAllTemplates(data.responseData ?? []);
    } catch {
      setAllTemplates([]);
    } finally {
      setTemplatesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted) loadTemplates();
  }, [mounted, loadTemplates]);

  // Templates filtered to selected medium
  const dltTemplates = allTemplates.filter((t) => t.medium === medium);

  if (!mounted) return null;
  if (!canAccessNotifications(cookies.role)) {
    return (
      <p className="p-2 text-muted-foreground">
        You do not have access to notifications.
      </p>
    );
  }

  const selectedList = lists.find((l) => String(l.id) === savedListId) ?? null;
  const selectedTemplate = dltTemplates.find((t) => String(t.id) === selectedTemplateId) ?? null;

  const handleMediumChange = (val: Medium) => {
    setMedium(val);
    setSelectedTemplateId("");
    setVarsJson("{}");
    setRcsVarValues({});
    setSent(false);
  };

  const handleTemplateChange = (value: string) => {
    setSelectedTemplateId(value);
    setSent(false);
    const tpl = dltTemplates.find((t) => String(t.id) === value);
    if (tpl) {
      setVarsJson(buildVarsJson(tpl.message));
      // Pre-fill RCS variable inputs
      const names = tpl.rcsVariables ?? [];
      setRcsVarValues(Object.fromEntries(names.map((n) => [n, ""])));
    } else {
      setVarsJson("{}");
      setRcsVarValues({});
    }
  };

  const handleMemberCountChange = (listId: number, newCount: number) => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId ? { ...l, _count: { members: newCount } } : l
      )
    );
  };

  const isComingSoon = MEDIUMS.find((m) => m.value === medium)?.comingSoon ?? false;

  const send = async () => {
    if (!savedListId) {
      await Swal.fire("List required", "Choose a saved customer list.", "warning");
      return;
    }
    if (!selectedTemplate) {
      await Swal.fire("Template required", "Select a template.", "warning");
      return;
    }

    let templateVariables: Record<string, string>;
    if (medium === "RCS") {
      // For RCS use the ordered input values
      templateVariables = { ...rcsVarValues };
    } else {
      try {
        const parsed = JSON.parse(varsJson) as unknown;
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
        templateVariables = Object.fromEntries(
          Object.entries(parsed as Record<string, unknown>).map(([k, v]) => [k, String(v ?? "")])
        );
      } catch {
        await Swal.fire("Invalid variables", 'Use JSON object format, e.g. {"otp":"1234"}', "error");
        return;
      }
    }

    const count = selectedList?._count?.members ?? "—";
    const confirm = await Swal.fire({
      title: `Send ${medium}?`,
      html: `Template: <b>${selectedTemplate.name}</b><br/>Sending to <b>${count}</b> member(s) in <b>${selectedList?.name}</b>.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, send",
      cancelButtonText: "Cancel",
    });
    if (!confirm.isConfirmed) return;

    setSendLoading(true);
    try {
      await api.send({
        savedListId: Number(savedListId),
        medium,
        dltTemplateId: selectedTemplate.templateId,
        templateVariables,
      });
      setSent(true);
      await Swal.fire("Sent", "Notification batch has been processed.", "success");
    } catch (e) {
      await Swal.fire("Send failed", extractMsg(e), "error");
    } finally {
      setSendLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageInfoBar title="Send notification" />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Send notification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 max-w-3xl">

          {/* ── Medium selector ── */}
          <div className="space-y-2">
            <Label>Medium</Label>
            <div className="flex gap-2 flex-wrap">
              {MEDIUMS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => handleMediumChange(m.value)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    medium === m.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {m.label}
                  {m.comingSoon && (
                    <span className="ml-1.5 text-xs opacity-70">(soon)</span>
                  )}
                </button>
              ))}
            </div>
            {isComingSoon && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-1.5">
                {medium === "WHATSAPP" ? "WhatsApp" : "RCS"} sending is coming soon. You can create and browse templates, but sending is not yet enabled.
              </p>
            )}
          </div>

          {/* ── Saved list ── */}
          <div className="space-y-2">
            <Label>Saved list</Label>
            <div className="flex items-center gap-2">
              <Select
                value={savedListId}
                onValueChange={(v) => { setSavedListId(v); setViewListOpen(false); setSent(false); }}
                disabled={listsLoading}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={listsLoading ? "Loading…" : "Select list"} />
                </SelectTrigger>
                <SelectContent>
                  {lists.length === 0 && !listsLoading ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No saved lists. Create one from Customer List.
                    </div>
                  ) : (
                    lists.map((l) => (
                      <SelectItem key={l.id} value={String(l.id)}>
                        {l.name}
                        {typeof l._count?.members === "number"
                          ? ` (${l._count.members})`
                          : ""}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              {selectedList && (
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5"
                  onClick={() => setViewListOpen(true)}
                >
                  <Eye className="w-4 h-4" />
                  View list
                  {typeof selectedList._count?.members === "number" && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {selectedList._count.members}
                    </Badge>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* ── Template dropdown (filtered by medium) ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Select Template</Label>
              <a
                href="/dashboard/notifications/templates"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                Manage templates <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <Select
              value={selectedTemplateId}
              onValueChange={handleTemplateChange}
              disabled={templatesLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    templatesLoading
                      ? "Loading templates…"
                      : dltTemplates.length === 0
                      ? `No ${medium} templates — add one first`
                      : "Select template"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {dltTemplates.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No {medium} templates found. Admins can add them from Notification Templates.
                  </div>
                ) : (
                  dltTemplates.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      <span className="font-medium">{t.name}</span>
                      <span className="ml-2 font-mono text-xs text-muted-foreground">
                        {t.templateId}
                      </span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {/* Readonly message preview */}
            {selectedTemplate && (
              <div className="rounded-lg border bg-muted/30 px-3 py-3 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Message preview
                </p>
                <p className="text-sm leading-relaxed">
                  <MessagePreview message={selectedTemplate.message} />
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  Template ID: {selectedTemplate.templateId}
                </p>
              </div>
            )}
          </div>

          {/* ── Template variables ── */}
          {medium === "RCS" && selectedTemplate ? (
            <div className="space-y-2">
              <Label>Template variables</Label>
              {(selectedTemplate.rcsVariables ?? []).length === 0 ? (
                <p className="text-xs text-muted-foreground">This RCS template has no variables.</p>
              ) : (
                <div className="space-y-2">
                  {(selectedTemplate.rcsVariables ?? []).map((varName, idx) => (
                    <div key={varName} className="flex items-center gap-3">
                      <span className="text-xs font-mono text-muted-foreground w-6 text-right shrink-0">
                        [{idx + 1}]
                      </span>
                      <Label className="w-32 shrink-0 text-sm">{varName}</Label>
                      <input
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        placeholder={`Value for ${varName}`}
                        value={rcsVarValues[varName] ?? ""}
                        onChange={(e) =>
                          setRcsVarValues((prev) => ({ ...prev, [varName]: e.target.value }))
                        }
                      />
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">
                    Variables are sent as an ordered array to MSG91 RCS API.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="vars">Template variables</Label>
              <Textarea
                id="vars"
                value={varsJson}
                onChange={(e) => setVarsJson(e.target.value)}
                rows={5}
                className="font-mono text-sm"
                placeholder='{"VAR1": "value1"}'
              />
              <p className="text-xs text-muted-foreground">
                Variables are auto-extracted from the selected template. Fill in the values before sending.
              </p>
            </div>
          )}

          <Button
            onClick={send}
            disabled={sendLoading || sent || !savedListId || !selectedTemplateId || isComingSoon}
          >
            {sendLoading ? "Sending…" : sent ? "Message sent" : "Send message"}
          </Button>
        </CardContent>
      </Card>

      {selectedList && (
        <SavedListMembersDialog
          list={selectedList}
          open={viewListOpen}
          onOpenChange={setViewListOpen}
          onCountChange={handleMemberCountChange}
        />
      )}
    </div>
  );
}
