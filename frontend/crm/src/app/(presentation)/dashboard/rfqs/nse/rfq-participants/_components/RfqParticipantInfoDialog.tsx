"use client";

/**
 * Edit / view dialog for CRM-private NSE-RFQ participant enrichment.
 *
 * Posts the entire payload to `PUT /crm/rfq/nse/rfq/participants/:code/info`
 * on save — the backend replaces bank / demat lists wholesale, so the dialog
 * doesn't need to track granular diffs. Closes itself on success and asks
 * the parent to refetch the saved-codes list.
 */

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { cn } from "@/lib/utils";
import type {
  NseRfqParticipantBankAccountData,
  NseRfqParticipantDpAccountData,
  NseRfqParticipantInfoData,
} from "@root/apiGateway";
import apiGateway from "@root/apiGateway";
import type { NseRfqParticipantInfoUpsertBody } from "@root/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Save, Trash2, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string;
  nseName: string;
}

type BankRow = {
  uid: string;
  bankName: string;
  bankIFSC: string;
  bankAccountNo: string;
  isDefault: boolean;
};

type DematRow = {
  uid: string;
  dpType: "NSDL" | "CDSL";
  dpId: string;
  benId: string;
  isDefault: boolean;
};

type FormState = {
  nameOverride: string;

  contactPerson: string;
  /// Multi-entry; the chip input handles add/remove. Stored as arrays so
  /// the form state is the single source of truth and we never have to
  /// re-parse a textarea.
  emails: string[];
  mobiles: string[];
  telephone: string;
  address: string;
  address2: string;
  address3: string;
  stateCode: string;

  panNo: string;
  leiCode: string;
  custodian: string;
  dobDoi: string;

  notes: string;

  bankAccounts: BankRow[];
  dematAccounts: DematRow[];
};

const newUid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `tmp-${Math.random().toString(36).slice(2)}`;

const blankBank = (): BankRow => ({
  uid: newUid(),
  bankName: "",
  bankIFSC: "",
  bankAccountNo: "",
  isDefault: false,
});

const blankDemat = (): DematRow => ({
  uid: newUid(),
  dpType: "NSDL",
  dpId: "",
  benId: "",
  isDefault: false,
});

function bankFromServer(b: NseRfqParticipantBankAccountData): BankRow {
  return {
    uid: `db-${b.id}`,
    bankName: b.bankName,
    bankIFSC: b.bankIFSC,
    bankAccountNo: b.bankAccountNo,
    isDefault: b.isDefault,
  };
}

function dematFromServer(d: NseRfqParticipantDpAccountData): DematRow {
  return {
    uid: `db-${d.id}`,
    dpType: d.dpType,
    dpId: d.dpId ?? "",
    benId: d.benId,
    isDefault: d.isDefault,
  };
}

function buildEmptyState(): FormState {
  return {
    nameOverride: "",
    contactPerson: "",
    emails: [],
    mobiles: [],
    telephone: "",
    address: "",
    address2: "",
    address3: "",
    stateCode: "",
    panNo: "",
    leiCode: "",
    custodian: "",
    dobDoi: "",
    notes: "",
    bankAccounts: [],
    dematAccounts: [],
  };
}

function buildStateFromServer(data: NseRfqParticipantInfoData): FormState {
  return {
    nameOverride: data.nameOverride ?? "",
    contactPerson: data.contactPerson ?? "",
    emails: [...data.emailList],
    mobiles: [...data.mobileList],
    telephone: data.telephone ?? "",
    address: data.address ?? "",
    address2: data.address2 ?? "",
    address3: data.address3 ?? "",
    stateCode: data.stateCode ?? "",
    panNo: data.panNo ?? "",
    leiCode: data.leiCode ?? "",
    custodian: data.custodian ?? "",
    dobDoi: data.dobDoi ?? "",
    notes: data.notes ?? "",
    bankAccounts: data.bankAccounts.map(bankFromServer),
    dematAccounts: data.dematAccounts.map(dematFromServer),
  };
}

export function RfqParticipantInfoDialog({
  open,
  onOpenChange,
  code,
  nseName,
}: Props) {
  const queryClient = useQueryClient();

  const api = React.useMemo(
    () =>
      new apiGateway.crm.rfq.participants.RfqParticipantsApi(apiClientCaller),
    [],
  );

  const infoQuery = useQuery({
    queryKey: ["NseRfqParticipants:info", code],
    queryFn: async () => {
      const res = await api.getRfqParticipantInfo(code);
      return res.data.responseData ?? null;
    },
    enabled: open && code.length > 0,
    staleTime: 60 * 1000,
  });

  const [form, setForm] = React.useState<FormState>(() => buildEmptyState());

  // Reset the form whenever a fresh read lands or the dialog reopens.
  React.useEffect(() => {
    if (!open) return;
    if (infoQuery.data) {
      setForm(buildStateFromServer(infoQuery.data));
    } else if (infoQuery.isFetched && !infoQuery.data) {
      setForm(buildEmptyState());
    }
  }, [open, infoQuery.data, infoQuery.isFetched]);

  const upsertMutation = useMutation({
    mutationFn: async (body: NseRfqParticipantInfoUpsertBody) => {
      const res = await api.upsertRfqParticipantInfo(code, body);
      return res.data.responseData;
    },
    onSuccess: () => {
      toast.success("Participant info saved.");
      void queryClient.invalidateQueries({
        queryKey: ["NseRfqParticipants:info", code],
      });
      void queryClient.invalidateQueries({
        queryKey: ["NseRfqParticipants:savedCodes"],
      });
      onOpenChange(false);
    },
    onError: (err: unknown) => {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to save participant info.";
      toast.error(message);
    },
  });

  // Convert client form state into the upsert payload the backend expects.
  const buildPayload = (): NseRfqParticipantInfoUpsertBody => ({
    nameOverride: form.nameOverride.trim() || null,
    contactPerson: form.contactPerson.trim() || null,
    emailList: form.emails.map((s) => s.trim()).filter(Boolean),
    mobileList: form.mobiles.map((s) => s.trim()).filter(Boolean),
    telephone: form.telephone.trim() || null,
    address: form.address.trim() || null,
    address2: form.address2.trim() || null,
    address3: form.address3.trim() || null,
    stateCode: form.stateCode.trim() || null,
    panNo: form.panNo.trim().toUpperCase() || null,
    leiCode: form.leiCode.trim() || null,
    custodian: form.custodian.trim() || null,
    dobDoi: form.dobDoi.trim() || null,
    notes: form.notes.trim() || null,
    bankAccounts: form.bankAccounts
      .filter((b) => b.bankName.trim() || b.bankIFSC.trim() || b.bankAccountNo.trim())
      .map((b) => ({
        bankName: b.bankName.trim(),
        bankIFSC: b.bankIFSC.trim().toUpperCase(),
        bankAccountNo: b.bankAccountNo.trim(),
        isDefault: b.isDefault,
      })),
    dematAccounts: form.dematAccounts
      .filter((d) => d.benId.trim() || d.dpId.trim())
      .map((d) => ({
        dpType: d.dpType,
        dpId: d.dpId.trim() || null,
        benId: d.benId.trim(),
        isDefault: d.isDefault,
      })),
  });

  const handleSave = () => {
    upsertMutation.mutate(buildPayload());
  };

  const setBank = (uid: string, patch: Partial<BankRow>) => {
    setForm((s) => ({
      ...s,
      bankAccounts: s.bankAccounts.map((b) =>
        b.uid === uid ? { ...b, ...patch } : b,
      ),
    }));
  };
  const setDemat = (uid: string, patch: Partial<DematRow>) => {
    setForm((s) => ({
      ...s,
      dematAccounts: s.dematAccounts.map((d) =>
        d.uid === uid ? { ...d, ...patch } : d,
      ),
    }));
  };

  const setBankDefault = (uid: string) => {
    setForm((s) => ({
      ...s,
      bankAccounts: s.bankAccounts.map((b) => ({
        ...b,
        isDefault: b.uid === uid,
      })),
    }));
  };
  const setDematDefault = (uid: string) => {
    setForm((s) => ({
      ...s,
      dematAccounts: s.dematAccounts.map((d) => ({
        ...d,
        isDefault: d.uid === uid,
      })),
    }));
  };

  const isLoading = infoQuery.isLoading;
  const isSaving = upsertMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-baseline gap-3">
            <span>Participant info</span>
            <span className="font-mono text-sm text-muted-foreground">
              {code}
            </span>
          </DialogTitle>
          <DialogDescription>
            NSE name: <span className="font-medium text-foreground">{nseName}</span>
            . Saved locally only — never pushed to NSE or CBRICS.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Identity */}
            <section className="space-y-3">
              <SectionTitle>Identity</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Name override (optional)" htmlFor="nameOverride">
                  <Input
                    id="nameOverride"
                    value={form.nameOverride}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, nameOverride: e.target.value }))
                    }
                    placeholder={nseName}
                  />
                </Field>
                <Field label="Contact person" htmlFor="contactPerson">
                  <Input
                    id="contactPerson"
                    value={form.contactPerson}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, contactPerson: e.target.value }))
                    }
                  />
                </Field>
              </div>
            </section>

            {/* Contact */}
            <section className="space-y-3">
              <SectionTitle>Contact</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Emails" htmlFor="emails">
                  <ChipsInput
                    id="emails"
                    values={form.emails}
                    onChange={(next) =>
                      setForm((s) => ({ ...s, emails: next }))
                    }
                    placeholder="ops@partner.in, settle@partner.in"
                  />
                </Field>
                <Field label="Mobiles" htmlFor="mobiles">
                  <ChipsInput
                    id="mobiles"
                    values={form.mobiles}
                    onChange={(next) =>
                      setForm((s) => ({ ...s, mobiles: next }))
                    }
                    placeholder="+91 98xxxxxxxx"
                  />
                </Field>
                <Field label="Telephone" htmlFor="telephone">
                  <Input
                    id="telephone"
                    value={form.telephone}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, telephone: e.target.value }))
                    }
                  />
                </Field>
                <Field label="State code" htmlFor="stateCode">
                  <Input
                    id="stateCode"
                    value={form.stateCode}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, stateCode: e.target.value }))
                    }
                    placeholder="e.g. MH, KA"
                  />
                </Field>
                <Field label="Address line 1" htmlFor="address">
                  <Input
                    id="address"
                    value={form.address}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, address: e.target.value }))
                    }
                  />
                </Field>
                <Field label="Address line 2" htmlFor="address2">
                  <Input
                    id="address2"
                    value={form.address2}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, address2: e.target.value }))
                    }
                  />
                </Field>
                <Field label="Address line 3" htmlFor="address3">
                  <Input
                    id="address3"
                    value={form.address3}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, address3: e.target.value }))
                    }
                  />
                </Field>
              </div>
            </section>

            {/* KYC */}
            <section className="space-y-3">
              <SectionTitle>KYC</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="PAN" htmlFor="panNo">
                  <Input
                    id="panNo"
                    value={form.panNo}
                    onChange={(e) =>
                      setForm((s) => ({
                        ...s,
                        panNo: e.target.value.toUpperCase(),
                      }))
                    }
                    maxLength={10}
                    placeholder="AAAAA9999A"
                    className="uppercase"
                  />
                </Field>
                <Field label="LEI code" htmlFor="leiCode">
                  <Input
                    id="leiCode"
                    value={form.leiCode}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, leiCode: e.target.value }))
                    }
                  />
                </Field>
                <Field label="Custodian" htmlFor="custodian">
                  <Input
                    id="custodian"
                    value={form.custodian}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, custodian: e.target.value }))
                    }
                  />
                </Field>
                <Field label="DOB / DOI" htmlFor="dobDoi">
                  <Input
                    id="dobDoi"
                    value={form.dobDoi}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, dobDoi: e.target.value }))
                    }
                    placeholder="dd-mm-yyyy"
                  />
                </Field>
              </div>
            </section>

            {/* Bank accounts */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <SectionTitle>Bank accounts</SectionTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setForm((s) => ({
                      ...s,
                      bankAccounts: [...s.bankAccounts, blankBank()],
                    }))
                  }
                >
                  <Plus className="h-4 w-4" />
                  Add bank
                </Button>
              </div>
              {form.bankAccounts.length === 0 ? (
                <EmptyHint>No bank accounts saved. Click “Add bank” to add one.</EmptyHint>
              ) : (
                <div className="space-y-3">
                  {form.bankAccounts.map((b) => (
                    <div
                      key={b.uid}
                      className="rounded-md border p-3 space-y-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Field label="Bank name">
                          <Input
                            value={b.bankName}
                            onChange={(e) =>
                              setBank(b.uid, { bankName: e.target.value })
                            }
                          />
                        </Field>
                        <Field label="IFSC">
                          <Input
                            value={b.bankIFSC}
                            onChange={(e) =>
                              setBank(b.uid, {
                                bankIFSC: e.target.value.toUpperCase(),
                              })
                            }
                            className="uppercase"
                            maxLength={11}
                          />
                        </Field>
                        <Field label="Account no.">
                          <Input
                            value={b.bankAccountNo}
                            onChange={(e) =>
                              setBank(b.uid, { bankAccountNo: e.target.value })
                            }
                          />
                        </Field>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={b.isDefault}
                            onCheckedChange={(v) => {
                              if (v === true) setBankDefault(b.uid);
                              else setBank(b.uid, { isDefault: false });
                            }}
                          />
                          Default for settlement
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() =>
                            setForm((s) => ({
                              ...s,
                              bankAccounts: s.bankAccounts.filter(
                                (x) => x.uid !== b.uid,
                              ),
                            }))
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Demat accounts */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <SectionTitle>Demat accounts</SectionTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setForm((s) => ({
                      ...s,
                      dematAccounts: [...s.dematAccounts, blankDemat()],
                    }))
                  }
                >
                  <Plus className="h-4 w-4" />
                  Add demat
                </Button>
              </div>
              {form.dematAccounts.length === 0 ? (
                <EmptyHint>No demat accounts saved. Click “Add demat” to add one.</EmptyHint>
              ) : (
                <div className="space-y-3">
                  {form.dematAccounts.map((d) => (
                    <div
                      key={d.uid}
                      className="rounded-md border p-3 space-y-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Field label="DP type">
                          <Select
                            value={d.dpType}
                            onValueChange={(v) =>
                              setDemat(d.uid, {
                                dpType: v as "NSDL" | "CDSL",
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="NSDL">NSDL</SelectItem>
                              <SelectItem value="CDSL">CDSL</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field
                          label={
                            d.dpType === "NSDL"
                              ? "DP ID (NSDL)"
                              : "DP ID (optional for CDSL)"
                          }
                        >
                          <Input
                            value={d.dpId}
                            onChange={(e) =>
                              setDemat(d.uid, { dpId: e.target.value })
                            }
                            placeholder={d.dpType === "NSDL" ? "IN300XYZ" : ""}
                          />
                        </Field>
                        <Field label="BEN ID">
                          <Input
                            value={d.benId}
                            onChange={(e) =>
                              setDemat(d.uid, { benId: e.target.value })
                            }
                          />
                        </Field>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={d.isDefault}
                            onCheckedChange={(v) => {
                              if (v === true) setDematDefault(d.uid);
                              else setDemat(d.uid, { isDefault: false });
                            }}
                          />
                          Default for settlement
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() =>
                            setForm((s) => ({
                              ...s,
                              dematAccounts: s.dematAccounts.filter(
                                (x) => x.uid !== d.uid,
                              ),
                            }))
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Notes */}
            <section className="space-y-3">
              <SectionTitle>Notes</SectionTitle>
              <Textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((s) => ({ ...s, notes: e.target.value }))
                }
                rows={3}
                placeholder="Ops notes — e.g. preferred contact window, exceptions, etc."
              />
            </section>
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isSaving}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save info
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </h3>
  );
}

function Field({
  label,
  htmlFor,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor} className="text-xs text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-dashed bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
      {children}
    </div>
  );
}

/**
 * Tag-style multi-input. Each entry becomes a removable chip — Enter,
 * comma, Tab, blur, or paste containing a separator commits the draft
 * into the list; Backspace on an empty draft removes the last chip.
 *
 * Replaces the earlier "textarea + split on newline/comma" approach,
 * which was visually ambiguous about how many entries would actually be
 * persisted.
 */
function ChipsInput({
  values,
  onChange,
  placeholder,
  id,
  max = 20,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  id?: string;
  max?: number;
}) {
  const [draft, setDraft] = React.useState("");

  const commit = (raw: string) => {
    const cleaned = raw
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (cleaned.length === 0) {
      setDraft("");
      return;
    }
    const merged = [...values];
    for (const item of cleaned) {
      if (merged.length >= max) break;
      if (!merged.includes(item)) merged.push(item);
    }
    onChange(merged);
    setDraft("");
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-md border bg-transparent px-2 py-1.5 focus-within:ring-1 focus-within:ring-ring min-h-10">
      {values.map((v, i) => (
        <span
          key={`${v}-${i}`}
          className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs"
        >
          <span className="break-all">{v}</span>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => onChange(values.filter((_, idx) => idx !== i))}
            aria-label={`Remove ${v}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
            if (draft.trim()) {
              e.preventDefault();
              commit(draft);
            }
          } else if (
            e.key === "Backspace" &&
            draft === "" &&
            values.length > 0
          ) {
            e.preventDefault();
            onChange(values.slice(0, -1));
          }
        }}
        onPaste={(e) => {
          const text = e.clipboardData.getData("text");
          if (/[\n,]/.test(text)) {
            e.preventDefault();
            commit(draft + (draft ? "," : "") + text);
          }
        }}
        onBlur={() => {
          if (draft.trim()) commit(draft);
        }}
        placeholder={values.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground py-0.5"
      />
    </div>
  );
}
