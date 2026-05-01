"use client";

import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import apiGateway from "@root/apiGateway";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

function asStr(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return "";
}

function hasContent(v: unknown): boolean {
  return asStr(v).length > 0;
}

/** Must match backend `CbricsManagerDbService.customerBankMatchKey`. */
function customerBankProfileKey(ifsc: unknown, bankAccountNo: unknown): string {
  const i = asStr(ifsc).trim().toUpperCase();
  const a = asStr(bankAccountNo).replace(/\s/g, "").trim();
  return `${i}|${a}`;
}

/** Must match backend `CbricsManagerDbService.customerDematMatchKey`. */
function customerDematProfileKey(dpType: unknown, dpId: unknown, benId: unknown): string {
  const type = asStr(dpType).trim().toUpperCase();
  const dp = asStr(dpId).trim();
  const ben = asStr(benId).replace(/\s/g, "").trim();
  if (type === "CDSL") {
    return `CDSL|${ben}`;
  }
  return `NSDL|${dp}|${ben}`;
}

type ProfileDbState = "loading" | "unlinked" | "error" | "in-db" | "missing";

function ProfileDbBadge({ state }: { state: ProfileDbState }) {
  if (state === "loading") {
    return (
      <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" aria-label="Checking database" />
    );
  }
  if (state === "error") {
    return (
      <Badge variant="destructive" className="whitespace-nowrap font-normal">
        Check failed
      </Badge>
    );
  }
  if (state === "unlinked") {
    return (
      <Badge variant="outline" className="whitespace-nowrap font-normal text-muted-foreground">
        No CRM link
      </Badge>
    );
  }
  if (state === "in-db") {
    return (
      <Badge className="whitespace-nowrap border-0 bg-emerald-600 font-normal text-white hover:bg-emerald-600 dark:bg-emerald-700 dark:hover:bg-emerald-700">
        In CRM
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="whitespace-nowrap font-normal">
      Not in CRM
    </Badge>
  );
}

const WORKFLOW_LABELS: Record<number, string> = {
  100: "Pending with checker",
  16: "Returned by checker",
  15: "Rejected by checker",
  0: "Pending with exchange",
  10: "Pending with exchange",
  1: "Approved",
  5: "Rejected",
  6: "Returned",
};

function WorkflowBadge({ value }: { value: unknown }) {
  const n = typeof value === "number" ? value : Number(value);
  const label = Number.isFinite(n) ? WORKFLOW_LABELS[n] : undefined;
  return (
    <Badge variant="secondary" className="font-mono">
      {Number.isFinite(n) ? `${n}${label ? ` · ${label}` : ""}` : String(value ?? "—")}
    </Badge>
  );
}

function DetailField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-[minmax(0,140px)_1fr] sm:gap-3 py-2 text-sm border-b border-border/40 last:border-b-0">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <div className="min-w-0 wrap-break-word">{children}</div>
    </div>
  );
}

function ListChips({ items }: { items: unknown }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item, i) => (
        <Badge key={i} variant="outline" className="font-normal">
          {asStr(item)}
        </Badge>
      ))}
    </div>
  );
}

export function CbricsParticipantDetailCards({ participant }: { participant: Record<string, unknown> }) {
  const api = useMemo(() => new apiGateway.crm.cbricsManager.CbricsManagerApi(apiClientCaller), []);
  const queryClient = useQueryClient();

  const cbricsParticipantId = useMemo(() => {
    const raw = participant.id;
    const n = typeof raw === "number" ? raw : Number(raw);
    return Number.isFinite(n) && n > 0 ? n : NaN;
  }, [participant.id]);

  const profileMatchQuery = useQuery({
    queryKey: ["cbrics-customer-profile-match-keys", cbricsParticipantId],
    queryFn: async () => {
      const res = await api.getCustomerProfileMatchKeysForParticipant(cbricsParticipantId);
      return res.data.responseData;
    },
    enabled: Number.isFinite(cbricsParticipantId),
  });

  const createMissingFinancialsMutation = useMutation({
    mutationFn: async () => {
      const res = await api.postParticipantCreateMissingProfileFinancials(cbricsParticipantId);
      return res.data.responseData!;
    },
    onSuccess: (d) => {
      const created = `${d.createdBanks} bank row(s), ${d.createdDemats} demat row(s) created`;
      const skippedExisting = [];
      if (d.skippedExistingBankLines || d.skippedExistingDematLines) {
        skippedExisting.push(
          `${d.skippedExistingBankLines} bank / ${d.skippedExistingDematLines} demat skipped (already on profile)`,
        );
      }
      if (d.skippedBankMissingAccountNumber) {
        skippedExisting.push(`${d.skippedBankMissingAccountNumber} CBRICS bank line(s) skipped (no account number)`);
      }
      if (d.skippedDematInvalid) {
        skippedExisting.push(`${d.skippedDematInvalid} DP line(s) skipped (missing ids)`);
      }
      toast.success([created, ...skippedExisting].join(" · "));
      void queryClient.invalidateQueries({
        queryKey: ["cbrics-customer-profile-match-keys", cbricsParticipantId],
      });
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? "Could not sync bank / demat rows");
    },
  });

  const profileBankKeySet = useMemo(() => {
    const list = profileMatchQuery.data?.bankKeys ?? [];
    return new Set(list);
  }, [profileMatchQuery.data?.bankKeys]);

  const profileDematKeySet = useMemo(() => {
    const list = profileMatchQuery.data?.dematKeys ?? [];
    return new Set(list);
  }, [profileMatchQuery.data?.dematKeys]);

  const wf = participant.workflowStatus;
  const actual = participant.actualStatus;
  const banks = Array.isArray(participant.bankAccountList)
    ? (participant.bankAccountList as Record<string, unknown>[])
    : [];
  const dps = Array.isArray(participant.dpAccountList)
    ? (participant.dpAccountList as Record<string, unknown>[])
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        {wf != null && wf !== "" && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Workflow</span>
            <WorkflowBadge value={wf} />
          </div>
        )}
        {actual != null && actual !== "" && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Actual status</span>
            <WorkflowBadge value={actual} />
          </div>
        )}
        {hasContent(participant.panVerStatus) && (
          <Badge variant="outline">
            PAN verify: <span className="font-mono ml-1">{asStr(participant.panVerStatus)}</span>
          </Badge>
        )}
        {participant.type != null && (
          <Badge variant="outline">
            Type <span className="font-mono ml-1">{asStr(participant.type)}</span>
          </Badge>
        )}
      </div>

      {Number.isFinite(cbricsParticipantId) ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={
              createMissingFinancialsMutation.isPending ||
              profileMatchQuery.data?.customerId == null ||
              profileMatchQuery.isLoading
            }
            onClick={() => void createMissingFinancialsMutation.mutate()}
          >
            {createMissingFinancialsMutation.isPending ? (
              <Loader2 className="mr-2 size-4 shrink-0 animate-spin" aria-hidden />
            ) : null}
            Create missing bank &amp; DP on CRM profile
          </Button>
          {profileMatchQuery.isSuccess && profileMatchQuery.data?.customerId == null ? (
            <span className="text-xs text-muted-foreground max-w-xl">
              This CBRICS id must exist in our local participant mirror (with a CRM{" "}
              <span className="font-mono">userId</span>) — otherwise profile rows cannot be created.
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Identity</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <DetailField label="CBRICS id">
              <span className="font-mono">{asStr(participant.id) || "—"}</span>
            </DetailField>
            <DetailField label="Login ID">
              <span className="font-mono">{asStr(participant.loginId) || "—"}</span>
            </DetailField>
            <DetailField label="Name (CBRICS)">{asStr(participant.firstName) || "—"}</DetailField>
            <DetailField label="PAN">{asStr(participant.panNo) || "—"}</DetailField>
            {hasContent(participant.dobDoi) && (
              <DetailField label="DOB / DOI">{asStr(participant.dobDoi)}</DetailField>
            )}
            {hasContent(participant.custodian) && (
              <DetailField label="Custodian">{asStr(participant.custodian)}</DetailField>
            )}
            {hasContent(participant.leiCode) && (
              <DetailField label="LEI">{asStr(participant.leiCode)}</DetailField>
            )}
            {participant.expiryDate != null && hasContent(participant.expiryDate) && (
              <DetailField label="LEI expiry">{asStr(participant.expiryDate)}</DetailField>
            )}
            {hasContent(participant.remarks) && (
              <DetailField label="Remarks">
                <span className="text-amber-800 dark:text-amber-200">{asStr(participant.remarks)}</span>
              </DetailField>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Contact</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <DetailField label="Contact person">{asStr(participant.contactPerson) || "—"}</DetailField>
            <DetailField label="Telephone">
              {hasContent(participant.telephone) ? (
                <span className="font-mono">{asStr(participant.telephone)}</span>
              ) : (
                "—"
              )}
            </DetailField>
            <DetailField label="Mobile">
              <ListChips items={participant.mobileList} />
            </DetailField>
            <DetailField label="Email">
              <ListChips items={participant.emailList} />
            </DetailField>
            {hasContent(participant.fax) && (
              <DetailField label="Fax">{asStr(participant.fax)}</DetailField>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Address</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-1">
          <DetailField label="State code">
            <span className="font-mono">{asStr(participant.stateCode) || "—"}</span>
          </DetailField>
          <DetailField label="Address">{asStr(participant.address) || "—"}</DetailField>
          {hasContent(participant.address2) && (
            <DetailField label="Address line 2">{asStr(participant.address2)}</DetailField>
          )}
          {hasContent(participant.address3) && (
            <DetailField label="Address line 3">{asStr(participant.address3)}</DetailField>
          )}
          <DetailField label="Registered address">{asStr(participant.regAddress) || "—"}</DetailField>
        </CardContent>
      </Card>

      {(hasContent(participant.panVerStatus) || hasContent(participant.panVerRemarks)) && (
        <Card className="border-amber-200/80 bg-amber-50/40 dark:bg-amber-950/20 dark:border-amber-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">PAN verification</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {hasContent(participant.panVerStatus) && (
              <DetailField label="Status">
                <WorkflowBadge value={participant.panVerStatus} />
              </DetailField>
            )}
            {hasContent(participant.panVerRemarks) && (
              <DetailField label="Remarks">
                <span className="text-amber-900 dark:text-amber-100">{asStr(participant.panVerRemarks)}</span>
              </DetailField>
            )}
          </CardContent>
        </Card>
      )}

      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-semibold">Bank accounts</h3>
          <Separator className="flex-1" />
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          Each row shows whether this bank already exists on the customer&apos;s CRM profile (IFSC + account
          number).
        </p>
        {profileMatchQuery.isSuccess && profileMatchQuery.data.customerId == null && (
          <p className="text-xs text-amber-800 dark:text-amber-200 mb-2">
            No CRM participant row for this id — database comparison unavailable (e.g. id typed manually).
          </p>
        )}
        {banks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No bank accounts in this response.</p>
        ) : (
          <Card>
            <CardContent className="pt-4 px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[100px]">Our database</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>IFSC</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Workflow</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banks.map((b, i) => {
                    const key = customerBankProfileKey(b.bankIFSC, b.bankAccountNo);
                    const inDb =
                      profileMatchQuery.data?.customerId != null && profileBankKeySet.has(key);
                    let dbState: ProfileDbState = "missing";
                    if (profileMatchQuery.isLoading) dbState = "loading";
                    else if (profileMatchQuery.isError) dbState = "error";
                    else if (profileMatchQuery.data?.customerId == null) dbState = "unlinked";
                    else if (inDb) dbState = "in-db";
                    return (
                      <TableRow key={i}>
                        <TableCell className="align-middle">
                          <ProfileDbBadge state={dbState} />
                        </TableCell>
                        <TableCell className="max-w-[180px]">{asStr(b.bankName)}</TableCell>
                        <TableCell className="font-mono text-xs">{asStr(b.bankIFSC)}</TableCell>
                        <TableCell className="font-mono text-xs">{asStr(b.bankAccountNo) || "—"}</TableCell>
                        <TableCell>{asStr(b.isDefault) || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{asStr(b.status) || "—"}</Badge>
                        </TableCell>
                        <TableCell>
                          <WorkflowBadge value={b.workflowStatus} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px]">
                          {asStr(b.remarks) || "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-semibold">Demat (DP) accounts</h3>
          <Separator className="flex-1" />
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          Each row shows whether this DP line exists on the customer&apos;s CRM demat records (CDSL: client ID;
          NSDL: DP ID + client ID).
        </p>
        {dps.length === 0 ? (
          <p className="text-sm text-muted-foreground">No demat accounts in this response.</p>
        ) : (
          <Card>
            <CardContent className="pt-4 px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[100px]">Our database</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>DP ID</TableHead>
                    <TableHead>Ben / Client ID</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Workflow</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dps.map((d, i) => {
                    const dKey = customerDematProfileKey(d.dpType, d.dpId, d.benId);
                    const inDb =
                      profileMatchQuery.data?.customerId != null && profileDematKeySet.has(dKey);
                    let dbState: ProfileDbState = "missing";
                    if (profileMatchQuery.isLoading) dbState = "loading";
                    else if (profileMatchQuery.isError) dbState = "error";
                    else if (profileMatchQuery.data?.customerId == null) dbState = "unlinked";
                    else if (inDb) dbState = "in-db";
                    return (
                    <TableRow key={i}>
                      <TableCell className="align-middle">
                        <ProfileDbBadge state={dbState} />
                      </TableCell>
                      <TableCell>{asStr(d.dpType)}</TableCell>
                      <TableCell className="font-mono text-xs">{asStr(d.dpId) || "—"}</TableCell>
                      <TableCell className="font-mono text-xs">{asStr(d.benId)}</TableCell>
                      <TableCell>{asStr(d.isDefault) || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{asStr(d.status) || "—"}</Badge>
                      </TableCell>
                      <TableCell>
                        <WorkflowBadge value={d.workflowStatus} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px]">
                        {asStr(d.remarks) || "—"}
                      </TableCell>
                    </TableRow>
                  );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
