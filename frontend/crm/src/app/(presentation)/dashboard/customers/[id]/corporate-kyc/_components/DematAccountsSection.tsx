"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputField } from "@/global/elements/inputs/InputField";
import { FileUploadField } from "@/global/elements/inputs/FileUploadField";
import { SelectField } from "@/global/elements/inputs/SelectField";
import type { SelectOption } from "@/global/elements/inputs/SelectField";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCorporateKycFileUpload } from "../_hooks/useCorporateKycFileUpload";
import type { CorporateKycDematAccountPayload } from "@root/schema";
import type { CorporateKycFormHook } from "../_hooks/useCorporateKycForm";
import { Lock, Plus, Trash2 } from "lucide-react";

const DEPOSITORY_OPTIONS: SelectOption[] = [
  { value: "NSDL", label: "NSDL" },
  { value: "CDSL", label: "CDSL" },
];

export function DematAccountsSection({
  hook,
  locked = false,
}: {
  hook: CorporateKycFormHook;
  /**
   * When `true`, the customer is KYC/KRA verified: account fields are
   * read-only, but demat proof upload remains editable for CBRICS.
   */
  locked?: boolean;
}) {
  const { form, errors, setDematAccount, addDematAccount, removeDematAccount } = hook;
  const { uploadFile } = useCorporateKycFileUpload();
  const list = form.dematAccounts ?? [];
  const rowErrors = (i: number): Record<string, string[]> =>
    (errors.dematAccounts?.[i] ?? {}) as Record<string, string[]>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Demat accounts</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addDematAccount}
          disabled={locked}
          title={
            locked
              ? "Demat accounts are locked because this customer is KYC/KRA verified."
              : undefined
          }
        >
          <Plus className="h-4 w-4" /> Add
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {locked && (
          <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <Lock className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <p>
              This customer is KYC/KRA verified. Demat account details cannot
              be added, edited, or deleted here. You may still update the{" "}
              <strong>demat proof file</strong> for CBRICS. Use the dedicated
              demat-account modify flow for other changes.
            </p>
          </div>
        )}
        {list.length === 0 && (
          <p className="text-muted-foreground text-xs">No demat accounts added.</p>
        )}
        {list.map((acc: CorporateKycDematAccountPayload, index: number) => (
          <div
            key={index}
            className="rounded-lg border p-4 grid gap-3 md:grid-cols-2"
          >
            <div className="md:col-span-2 flex justify-between items-center">
              <span className="text-xs font-medium">Demat account {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeDematAccount(index)}
                disabled={locked}
                title={locked ? "Locked: customer is KYC/KRA verified." : undefined}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <SelectField
              label="Depository"
              required
              value={acc.depository}
              onChangeAction={(v) =>
                setDematAccount(index, {
                  depository: v as "NSDL" | "CDSL",
                })
              }
              options={DEPOSITORY_OPTIONS}
              error={rowErrors(index).depository?.[0]}
              disabled={locked}
            />
            <InputField
              label="Account holder name"
              required
              value={acc.accountHolderName}
              onChangeAction={(v) =>
                setDematAccount(index, { accountHolderName: v })
              }
              error={rowErrors(index).accountHolderName?.[0]}
              disabled={locked}
            />
            <InputField
              label="DP ID"
              required
              value={acc.dpId}
              onChangeAction={(v) => setDematAccount(index, { dpId: v })}
              error={rowErrors(index).dpId?.[0]}
              disabled={locked}
            />
            <InputField
              label="Client ID"
              required
              value={acc.clientId}
              onChangeAction={(v) => setDematAccount(index, { clientId: v })}
              error={rowErrors(index).clientId?.[0]}
              disabled={locked}
            />
            <InputField
              label="Account type"
              value={acc.accountType ?? ""}
              onChangeAction={(v) => setDematAccount(index, { accountType: v })}
              disabled={locked}
            />
            <FileUploadField
              label="Demat proof file"
              value={acc.dematProofFileUrl ?? ""}
              onChangeAction={(v) =>
                setDematAccount(index, { dematProofFileUrl: v })
              }
              onUpload={(file) => uploadFile(file, "corporate-kyc")}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              placeholder="Select file or paste URL"
            />
            <div className="flex items-center gap-2">
              <Switch
                checked={acc.isPrimary}
                onCheckedChange={(v) =>
                  setDematAccount(index, { isPrimary: v })
                }
                disabled={locked}
              />
              <Label>Primary</Label>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
