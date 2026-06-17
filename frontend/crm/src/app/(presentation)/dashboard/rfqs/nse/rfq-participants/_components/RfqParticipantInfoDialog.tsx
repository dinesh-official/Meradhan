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
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
import { Loader2, Plus, Save, Trash2, X, Building2, Landmark, Wallet, UserRound, MapPin, FileText } from "lucide-react";
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

function formatUpdatedAt(value: string | undefined) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function countFilledSections(form: FormState, hasSaved: boolean) {
  const checks = [
    Boolean(form.nameOverride.trim() || form.contactPerson.trim()),
    Boolean(form.emails.length || form.mobiles.length || form.telephone.trim()),
    Boolean(form.address.trim() || form.address2.trim() || form.stateCode.trim()),
    Boolean(form.panNo.trim() || form.leiCode.trim() || form.custodian.trim()),
    form.bankAccounts.some((b) => b.bankName.trim() && b.bankIFSC.trim()),
    form.dematAccounts.some((d) => d.benId.trim()),
    Boolean(form.notes.trim()),
  ];
  return { filled: checks.filter(Boolean).length, total: checks.length, hasSaved };
}

type ParticipantTabId =
  | "profile"
  | "contact"
  | "address"
  | "banks"
  | "demat"
  | "notes";

function sectionHasData(tab: ParticipantTabId, form: FormState): boolean {
  switch (tab) {
    case "profile":
      return Boolean(form.nameOverride.trim() || form.contactPerson.trim());
    case "contact":
      return Boolean(
        form.emails.length || form.mobiles.length || form.telephone.trim(),
      );
    case "address":
      return Boolean(
        form.address.trim() ||
          form.address2.trim() ||
          form.address3.trim() ||
          form.stateCode.trim() ||
          form.panNo.trim() ||
          form.leiCode.trim() ||
          form.custodian.trim() ||
          form.dobDoi.trim(),
      );
    case "banks":
      return form.bankAccounts.some(
        (b) => b.bankName.trim() && b.bankIFSC.trim(),
      );
    case "demat":
      return form.dematAccounts.some((d) => d.benId.trim());
    case "notes":
      return Boolean(form.notes.trim());
    default:
      return false;
  }
}

const PARTICIPANT_TABS: {
  id: ParticipantTabId;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: (form: FormState) => number;
}[] = [
  { id: "profile", label: "Profile", shortLabel: "Profile", icon: UserRound },
  { id: "contact", label: "Contact", shortLabel: "Contact", icon: Building2 },
  {
    id: "address",
    label: "Address & KYC",
    shortLabel: "Address",
    icon: MapPin,
  },
  {
    id: "banks",
    label: "Bank accounts",
    shortLabel: "Banks",
    icon: Landmark,
    count: (f) => f.bankAccounts.length,
  },
  {
    id: "demat",
    label: "Demat accounts",
    shortLabel: "Demat",
    icon: Wallet,
    count: (f) => f.dematAccounts.length,
  },
  { id: "notes", label: "Notes", shortLabel: "Notes", icon: FileText },
];

const participantTabTriggerClass =
  "group h-9 shrink-0 flex-none justify-start gap-2.5 rounded-md border border-transparent px-3 text-sm font-medium text-muted-foreground shadow-none transition-colors hover:bg-muted/70 hover:text-foreground data-[state=active]:border-primary/20 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm md:h-10 md:w-full";

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
      void queryClient.invalidateQueries({
        queryKey: ["NseRfqParticipants:infoSummary"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["rfq-participant-info-summaries"],
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
  const hasSaved = Boolean(infoQuery.data);
  const updatedLabel = formatUpdatedAt(infoQuery.data?.updatedAt);
  const completion = countFilledSections(form, hasSaved);
  const displayName = form.nameOverride.trim() || nseName;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-[min(98vw,72rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[72rem]">
        {/* Header */}
        <div className="shrink-0 border-b bg-slate-50/80 px-6 py-5">
          <DialogHeader className="space-y-3 text-left">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <DialogTitle className="text-lg font-semibold leading-tight">
                  {displayName}
                </DialogTitle>
                <DialogDescription className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-mono text-xs text-foreground">{code}</span>
                  {nseName !== displayName ? (
                    <>
                      <span className="text-muted-foreground">·</span>
                      <span>NSE: {nseName}</span>
                    </>
                  ) : null}
                </DialogDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {hasSaved ? (
                  <Badge variant="secondary" className="gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Saved locally
                  </Badge>
                ) : (
                  <Badge variant="outline">Not saved yet</Badge>
                )}
                {updatedLabel ? (
                  <span className="text-xs text-muted-foreground">
                    Updated {updatedLabel}
                  </span>
                ) : null}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              CRM-only enrichment for proposals, settlement PDFs, and order assign.
              Never synced to NSE or CBRICS.
            </p>
            {!isLoading ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  {completion.filled}/{completion.total}
                </span>
                <span>sections with data</span>
                <div className="h-1.5 flex-1 max-w-[140px] overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-all"
                    style={{
                      width: `${Math.round((completion.filled / completion.total) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ) : null}
          </DialogHeader>
        </div>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="profile" className="flex min-h-0 flex-1 flex-col md:flex-row">
            <nav
              aria-label="Participant form sections"
              className="shrink-0 border-b bg-muted/30 px-3 py-2 md:w-56 md:border-b-0 md:border-r md:bg-muted/20 md:px-2 md:py-4"
            >
              <TabsList
                className={cn(
                  "h-auto w-full gap-1 bg-transparent p-0",
                  "flex flex-row flex-nowrap justify-start overflow-x-auto scrollbar-none",
                  "md:flex-col md:gap-0.5 md:overflow-visible",
                )}
              >
                {PARTICIPANT_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const count = tab.count?.(form) ?? 0;
                  const filled = sectionHasData(tab.id, form);
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className={cn(
                        participantTabTriggerClass,
                        "min-w-max md:min-w-0",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 md:h-4 md:w-4" />
                      <span className="truncate text-left md:flex-1">
                        <span className="md:hidden">{tab.shortLabel}</span>
                        <span className="hidden md:inline">{tab.label}</span>
                      </span>
                      <span className="ml-auto flex shrink-0 items-center gap-1.5">
                        {count > 0 ? (
                          <span className="rounded-full bg-foreground/10 px-1.5 text-[10px] font-semibold tabular-nums group-data-[state=active]:bg-primary-foreground/20">
                            {count}
                          </span>
                        ) : null}
                        <span
                          className={cn(
                            "hidden h-1.5 w-1.5 rounded-full md:inline-block",
                            filled
                              ? "bg-emerald-500 group-data-[state=active]:bg-emerald-300"
                              : "bg-border group-data-[state=active]:bg-primary-foreground/35",
                          )}
                          aria-hidden
                        />
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </nav>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <TabsContent value="profile" className="mt-0 space-y-4">
                <SectionIntro
                  title="Identity"
                  description="Override the NSE display name or add a primary contact person."
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Display name override" htmlFor="nameOverride">
                    <Input
                      id="nameOverride"
                      value={form.nameOverride}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, nameOverride: e.target.value }))
                      }
                      placeholder={nseName}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Leave blank to use the NSE name in emails and PDFs.
                    </p>
                  </Field>
                  <Field label="Contact person" htmlFor="contactPerson">
                    <Input
                      id="contactPerson"
                      value={form.contactPerson}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, contactPerson: e.target.value }))
                      }
                      placeholder="Relationship manager / ops contact"
                    />
                  </Field>
                </div>
              </TabsContent>

              <TabsContent value="contact" className="mt-0 space-y-4">
                <SectionIntro
                  title="Contact details"
                  description="Used for proposal emails and settlement correspondence."
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Email addresses" htmlFor="emails" className="sm:col-span-2">
                    <ChipsInput
                      id="emails"
                      values={form.emails}
                      onChange={(next) => setForm((s) => ({ ...s, emails: next }))}
                      placeholder="Type email and press Enter — ops@partner.in"
                    />
                  </Field>
                  <Field label="Mobile numbers" htmlFor="mobiles">
                    <ChipsInput
                      id="mobiles"
                      values={form.mobiles}
                      onChange={(next) => setForm((s) => ({ ...s, mobiles: next }))}
                      placeholder="+91 98xxxxxxxx"
                    />
                  </Field>
                  <Field label="Landline" htmlFor="telephone">
                    <Input
                      id="telephone"
                      value={form.telephone}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, telephone: e.target.value }))
                      }
                      placeholder="022-xxxxxxxx"
                    />
                  </Field>
                </div>
              </TabsContent>

              <TabsContent value="address" className="mt-0 space-y-6">
                <div className="space-y-4">
                  <SectionIntro
                    title="Registered address"
                    description="Optional — appears on settlement documents when configured."
                  />
                  <div className="grid grid-cols-1 gap-4">
                    <Field label="Address line 1" htmlFor="address">
                      <Input
                        id="address"
                        value={form.address}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, address: e.target.value }))
                        }
                      />
                    </Field>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                    <Field label="State code" htmlFor="stateCode" className="max-w-xs">
                      <Input
                        id="stateCode"
                        value={form.stateCode}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, stateCode: e.target.value }))
                        }
                        placeholder="MH, KA, DL…"
                        className="uppercase"
                        maxLength={2}
                      />
                    </Field>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <SectionIntro
                    title="KYC identifiers"
                    description="PAN, LEI and custodian details for compliance checks."
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                        className="uppercase font-mono"
                      />
                    </Field>
                    <Field label="LEI code" htmlFor="leiCode">
                      <Input
                        id="leiCode"
                        value={form.leiCode}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, leiCode: e.target.value }))
                        }
                        className="font-mono"
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
                </div>
              </TabsContent>

              <TabsContent value="banks" className="mt-0 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <SectionIntro
                    title="Bank accounts"
                    description="Settlement pay-in accounts. Mark one as default."
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
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
                  <EmptyHint>
                    No bank accounts yet. Add at least one for settlement PDFs.
                  </EmptyHint>
                ) : (
                  <div className="space-y-3">
                    {form.bankAccounts.map((b, index) => (
                      <AccountCard
                        key={b.uid}
                        title={`Bank account ${index + 1}`}
                        icon={<Landmark className="h-4 w-4 text-muted-foreground" />}
                        isDefault={b.isDefault}
                        onRemove={() =>
                          setForm((s) => ({
                            ...s,
                            bankAccounts: s.bankAccounts.filter((x) => x.uid !== b.uid),
                          }))
                        }
                      >
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
                              className="uppercase font-mono"
                              maxLength={11}
                            />
                          </Field>
                          <Field label="Account number">
                            <Input
                              value={b.bankAccountNo}
                              onChange={(e) =>
                                setBank(b.uid, { bankAccountNo: e.target.value })
                              }
                              className="font-mono"
                            />
                          </Field>
                        </div>
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
                      </AccountCard>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="demat" className="mt-0 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <SectionIntro
                    title="Demat accounts"
                    description="NSDL or CDSL beneficiary details for security transfer."
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
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
                  <EmptyHint>
                    No demat accounts yet. Add NSDL/CDSL details for settlement.
                  </EmptyHint>
                ) : (
                  <div className="space-y-3">
                    {form.dematAccounts.map((d, index) => (
                      <AccountCard
                        key={d.uid}
                        title={`Demat ${index + 1} · ${d.dpType}`}
                        icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
                        isDefault={d.isDefault}
                        onRemove={() =>
                          setForm((s) => ({
                            ...s,
                            dematAccounts: s.dematAccounts.filter((x) => x.uid !== d.uid),
                          }))
                        }
                      >
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <Field label="Depository">
                            <Select
                              value={d.dpType}
                              onValueChange={(v) =>
                                setDemat(d.uid, { dpType: v as "NSDL" | "CDSL" })
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
                                ? "DP ID (required)"
                                : "DP ID (optional)"
                            }
                          >
                            <Input
                              value={d.dpId}
                              onChange={(e) =>
                                setDemat(d.uid, { dpId: e.target.value })
                              }
                              placeholder={d.dpType === "NSDL" ? "IN300…" : ""}
                              className="font-mono"
                            />
                          </Field>
                          <Field label="Beneficiary ID">
                            <Input
                              value={d.benId}
                              onChange={(e) =>
                                setDemat(d.uid, { benId: e.target.value })
                              }
                              className="font-mono"
                            />
                          </Field>
                        </div>
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
                      </AccountCard>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="notes" className="mt-0 space-y-4">
                <SectionIntro
                  title="Internal notes"
                  description="Ops-only context — preferred contact window, exceptions, etc."
                />
                <Textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, notes: e.target.value }))
                  }
                  rows={6}
                  placeholder="e.g. Confirm trades before 3 PM. CC settle@partner.in on all deal sheets."
                  className="resize-none"
                />
              </TabsContent>
            </div>
          </Tabs>
        )}

        {/* Sticky footer */}
        <DialogFooter className="shrink-0 border-t bg-background px-6 py-4 sm:justify-between">
          <p className="hidden text-xs text-muted-foreground sm:block">
            Participant code <span className="font-mono">{code}</span>
          </p>
          <div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSaving}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="min-w-[120px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save info
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SectionIntro({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-0.5">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function AccountCard({
  title,
  icon,
  isDefault,
  onRemove,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  isDefault: boolean;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {icon}
          <span className="text-sm font-medium truncate">{title}</span>
          {isDefault ? (
            <Badge variant="secondary" className="text-[10px]">
              Default
            </Badge>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 text-destructive hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Remove</span>
        </Button>
      </div>
      {children}
    </div>
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
      <Label htmlFor={htmlFor} className="text-xs font-medium text-foreground">
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
