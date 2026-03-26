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
import { Plus, Trash2 } from "lucide-react";

const DEPOSITORY_OPTIONS: SelectOption[] = [
  { value: "NSDL", label: "NSDL" },
  { value: "CDSL", label: "CDSL" },
];

export function DematAccountsSection({ hook }: { hook: CorporateKycFormHook }) {
  const { form, errors, setDematAccount, addDematAccount, removeDematAccount } = hook;
  const { uploadFile } = useCorporateKycFileUpload();
  const list = form.dematAccounts ?? [];
  const rowErrors = (i: number): Record<string, string[]> =>
    (errors.dematAccounts?.[i] ?? {}) as Record<string, string[]>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Demat accounts</CardTitle>
        <Button type="button" variant="outline" size="sm" onClick={addDematAccount}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {list.length === 0 && (
          <p className="text-muted-foreground text-sm">No demat accounts added.</p>
        )}
        {list.map((acc: CorporateKycDematAccountPayload, index: number) => (
          <div
            key={index}
            className="rounded-lg border p-4 grid gap-3 md:grid-cols-2"
          >
            <div className="md:col-span-2 flex justify-between items-center">
              <span className="text-sm font-medium">Demat account {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeDematAccount(index)}
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
            />
            <InputField
              label="Account holder name"
              required
              value={acc.accountHolderName}
              onChangeAction={(v) =>
                setDematAccount(index, { accountHolderName: v })
              }
              error={rowErrors(index).accountHolderName?.[0]}
            />
            <InputField
              label="DP ID"
              required
              value={acc.dpId}
              onChangeAction={(v) => setDematAccount(index, { dpId: v })}
              error={rowErrors(index).dpId?.[0]}
            />
            <InputField
              label="Client ID"
              required
              value={acc.clientId}
              onChangeAction={(v) => setDematAccount(index, { clientId: v })}
              error={rowErrors(index).clientId?.[0]}
            />
            <InputField
              label="Account type"
              value={acc.accountType ?? ""}
              onChangeAction={(v) => setDematAccount(index, { accountType: v })}
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
              />
              <Label>Primary</Label>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
