"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import useAppCookie from "@/hooks/useAppCookie.hook";
import { canAccessNotifications } from "@/global/utils/role.utils";
import apiGateway from "@root/apiGateway";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

type Row = Record<string, unknown>;

const KYC_STEP_LABELS: Record<number, string> = {
  0: "Not Started",
  1: "Identity Validation",
  2: "Personal Details",
  3: "Bank Account",
  4: "Demat Account",
  5: "Risk Profiling",
  6: "e-Signature",
  7: "Completed",
};

export default function CustomerListNotificationsView() {
  const { cookies } = useAppCookie();
  const [mounted, setMounted] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [queried, setQueried] = useState(false);
  const [sqlEcho, setSqlEcho] = useState<string | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [listName, setListName] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const api = new apiGateway.crm.notifications.CrmNotificationsApi(apiClientCaller);

  // Wait for client hydration so cookies.role is available
  if (!mounted) return null;

  if (!canAccessNotifications(cookies.role)) {
    return (
      <p className="p-2 text-muted-foreground">
        You do not have access to notifications.
      </p>
    );
  }

  const runQuery = async () => {
    setLoading(true);
    setSqlEcho(null);
    setQueried(false);
    try {
      const res = await api.queryCustomers({ prompt });
      const data = res.data as {
        responseData?: { rows?: Row[]; sql?: string };
      };
      const payload = data.responseData;
      setRows(payload?.rows ?? []);
      setQueried(true);
      if (payload?.sql) {
        setSqlEcho(payload.sql);
      }
    } catch (e: unknown) {
      const msg =
        e &&
        typeof e === "object" &&
        "response" in e &&
        (e as { response?: { data?: { message?: string } } }).response?.data
          ?.message;
      await Swal.fire(
        "Query failed",
        typeof msg === "string" ? msg : "Could not run customer query.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const customerIds = rows
    .map((r) => r.id)
    .filter((id): id is number => typeof id === "number");

  const saveList = async () => {
    if (!listName.trim()) {
      await Swal.fire("Name required", "Enter a name for this list.", "warning");
      return;
    }
    if (customerIds.length === 0) {
      await Swal.fire(
        "No customers",
        "Run a query that returns at least one row with an id column.",
        "warning"
      );
      return;
    }
    setSaveLoading(true);
    try {
      await api.createSavedList({
        name: listName.trim(),
        customerProfileIds: customerIds,
        sourcePrompt: prompt || undefined,
      });
      setSaveOpen(false);
      setListName("");
      await Swal.fire("Saved", "Customer list saved successfully.", "success");
    } catch (e: unknown) {
      const msg =
        e &&
        typeof e === "object" &&
        "response" in e &&
        (e as { response?: { data?: { message?: string } } }).response?.data
          ?.message;
      await Swal.fire(
        "Save failed",
        typeof msg === "string" ? msg : "Could not save list.",
        "error"
      );
    } finally {
      setSaveLoading(false);
    }
  };

  const columns =
    rows.length > 0
      ? Array.from(
          rows.reduce((acc, row) => {
            Object.keys(row).forEach((k) => acc.add(k));
            return acc;
          }, new Set<string>())
        )
      : [];

  return (
    <div className="space-y-4">
      <PageInfoBar title="Customer List (notifications)" />
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Natural language query</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='e.g. "Customers whose first name starts with A and are not deleted"'
            rows={4}
            className="font-mono text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={runQuery} disabled={loading || !prompt.trim()}>
              {loading ? "Running…" : "Run query"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setSaveOpen(true)}
              disabled={rows.length === 0}
            >
              Save list
            </Button>
          </div>
          {sqlEcho ? (
            <p className="text-xs text-muted-foreground font-mono break-all">
              SQL (non-production): {sqlEcho}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {queried && rows.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-base font-semibold text-muted-foreground">No customer data found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your query ran successfully but matched no customers. Try a different search.
            </p>
          </CardContent>
        </Card>
      )}

      {rows.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Results ({rows.length} rows, {customerIds.length} with numeric id)
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm border-collapse border border-border">
              <thead>
                <tr className="bg-muted">
                  {columns.map((c) => (
                    <th key={c} className="border p-2 text-left font-medium">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="odd:bg-background even:bg-muted/40">
                    {columns.map((c) => (
                      <td key={c} className="border p-2 align-top max-w-[240px] truncate">
                        {formatCell(c, row[c])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save customer list</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="List name"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSaveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveList} disabled={saveLoading}>
              {saveLoading ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatCell(column: string, v: unknown): string {
  if (v === null || v === undefined) return "";

  if (column === "step") {
    const n = typeof v === "number" ? v : Number(v);
    if (!isNaN(n) && n in KYC_STEP_LABELS) {
      return KYC_STEP_LABELS[n]!;
    }
  }

  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
