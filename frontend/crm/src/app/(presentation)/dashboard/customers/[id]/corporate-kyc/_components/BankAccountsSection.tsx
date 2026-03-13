"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputField } from "@/global/elements/inputs/InputField";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCorporateKycFileUpload } from "../_hooks/useCorporateKycFileUpload";
import type { CorporateKycBankAccountPayload } from "@root/schema";
import type { CorporateKycFormHook } from "../_hooks/useCorporateKycForm";
import { Plus, Trash2, Upload, ExternalLink } from "lucide-react";
import { useRef } from "react";

export function BankAccountsSection({ hook }: { hook: CorporateKycFormHook }) {
  const { form, errors, setBankAccount, addBankAccount, removeBankAccount } = hook;
  const { uploadFile, uploading } = useCorporateKycFileUpload();
  const list = form.bankAccounts ?? [];
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const rowErrors = (i: number): Record<string, string[]> =>
    (errors.bankAccounts?.[i] ?? {}) as Record<string, string[]>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Bank accounts</CardTitle>
        <Button type="button" variant="outline" size="sm" onClick={addBankAccount}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {list.length === 0 && (
          <p className="text-muted-foreground text-sm">No bank accounts added.</p>
        )}
        {list.map((acc: CorporateKycBankAccountPayload, index: number) => (
          <div
            key={index}
            className="rounded-lg border p-4 grid gap-3 md:grid-cols-2"
          >
            <div className="md:col-span-2 flex justify-between items-center">
              <span className="text-sm font-medium">Account {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeBankAccount(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <InputField
              label="Account holder name"
              required
              value={acc.accountHolderName}
              onChangeAction={(v) => setBankAccount(index, { accountHolderName: v })}
              error={rowErrors(index).accountHolderName?.[0]}
            />
            <InputField
              label="Account number"
              required
              value={acc.accountNumber}
              onChangeAction={(v) => setBankAccount(index, { accountNumber: v })}
              error={rowErrors(index).accountNumber?.[0]}
            />
            <InputField
              label="Bank name"
              required
              value={acc.bankName}
              onChangeAction={(v) => setBankAccount(index, { bankName: v })}
              error={rowErrors(index).bankName?.[0]}
            />
            <InputField
              label="IFSC code"
              required
              placeholder="e.g. SBIN0001234"
              value={acc.ifscCode}
              onChangeAction={(v) => setBankAccount(index, { ifscCode: v })}
              error={rowErrors(index).ifscCode?.[0]}
            />
            <InputField
              label="Branch"
              value={acc.branch ?? ""}
              onChangeAction={(v) => setBankAccount(index, { branch: v })}
            />
            <div className="md:col-span-2 space-y-2">
              <Label className="text-sm">Bank proof files</Label>
              <input
                ref={(el) => {
                  fileInputRefs.current[index] = el;
                }}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = await uploadFile(file, "corporate-kyc");
                  if (url) {
                    const current = acc.bankProofFileUrls ?? [];
                    setBankAccount(index, {
                      bankProofFileUrls: [...current, url],
                    });
                  }
                  e.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRefs.current[index]?.click()}
              >
                <Upload className="h-4 w-4" /> Select file to upload
              </Button>
              {(acc.bankProofFileUrls?.length ?? 0) > 0 && (
                <ul className="mt-2 space-y-1">
                  {(acc.bankProofFileUrls ?? []).map((url, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-2 py-1.5 px-2 rounded bg-muted/60 text-sm"
                    >
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-primary hover:underline flex items-center gap-1 min-w-0"
                      >
                        <span className="truncate">
                          {url.length > 50 ? url.slice(0, 47) + "…" : url}
                        </span>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      </a>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => {
                          const next = (acc.bankProofFileUrls ?? []).filter(
                            (_, j) => j !== i
                          );
                          setBankAccount(index, { bankProofFileUrls: next });
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={acc.isPrimaryAccount}
                onCheckedChange={(v) =>
                  setBankAccount(index, { isPrimaryAccount: v })
                }
              />
              <Label>Primary account</Label>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
