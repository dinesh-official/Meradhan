"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputField } from "@/global/elements/inputs/InputField";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { CorporateKycBankAccountPayload } from "@root/schema";
import type { CorporateKycFormHook } from "../_hooks/useCorporateKycForm";
import { Plus, Trash2 } from "lucide-react";

export function BankAccountsSection({ hook }: { hook: CorporateKycFormHook }) {
  const {
    form,
    setBankAccount,
    addBankAccount,
    removeBankAccount,
  } = hook;
  const list = form.bankAccounts ?? [];

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
            />
            <InputField
              label="Account number"
              required
              value={acc.accountNumber}
              onChangeAction={(v) => setBankAccount(index, { accountNumber: v })}
            />
            <InputField
              label="Bank name"
              required
              value={acc.bankName}
              onChangeAction={(v) => setBankAccount(index, { bankName: v })}
            />
            <InputField
              label="IFSC code"
              required
              placeholder="e.g. SBIN0001234"
              value={acc.ifscCode}
              onChangeAction={(v) => setBankAccount(index, { ifscCode: v })}
            />
            <InputField
              label="Branch"
              value={acc.branch ?? ""}
              onChangeAction={(v) => setBankAccount(index, { branch: v })}
            />
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
