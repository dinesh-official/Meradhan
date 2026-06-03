"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import {
  CheckField,
  SelectField,
  TextField,
} from "./FormPrimitives";
import {
  DEPOSITORIES,
  YES_NO,
  type BankAccount,
  type BankAnnexure,
  type CorporateKycData,
  type DematAccount,
  type DematAnnexure,
  type Depository,
  type YesNo,
} from "../_utils/mapToPdfPayload";

type Props = {
  value: CorporateKycData;
  onChange: (next: CorporateKycData) => void;
  disabled?: boolean;
};

const emptyBank = (): BankAccount => ({
  isPrimary: "No",
  accountType: "Current",
  ifsc: "",
  accountNumber: "",
  nameAsPerBank: "",
  bankName: "",
  nameAsPerPan: "",
  micrCode: "",
  branch: "",
});

const emptyDemat = (): DematAccount => ({
  isPrimary: "No",
  depository: "NSDL",
  dpName: "",
  dpId: "",
  beneficiaryId: "",
});

export function BankTab({ value, onChange, disabled }: Props) {
  const bank = value.bankAnnexure ?? {};
  const accounts = bank.accounts ?? [];
  const update = (patch: Partial<BankAnnexure>) =>
    onChange({ ...value, bankAnnexure: { ...bank, ...patch } });
  const updateAccount = (idx: number, patch: Partial<BankAccount>) => {
    const next = [...accounts];
    next[idx] = { ...next[idx], ...patch };
    update({ accounts: next });
  };
  const addAccount = () => update({ accounts: [...accounts, emptyBank()] });
  const removeAccount = (idx: number) =>
    update({ accounts: accounts.filter((_, i) => i !== idx) });

  return (
    <div className="space-y-4">
      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm">Bank Annexure header (Page 9)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 px-4 py-4 md:grid-cols-2">
          <TextField
            label="PAN"
            value={bank.pan}
            onChange={(pan) => update({ pan })}
            disabled={disabled}
          />
          <TextField
            label="Applicant name"
            value={bank.applicantName}
            onChange={(applicantName) => update({ applicantName })}
            disabled={disabled}
          />
          <TextField
            label="Place"
            value={bank.place}
            onChange={(place) => update({ place })}
            disabled={disabled}
          />
          <TextField
            label="Date"
            value={bank.date}
            onChange={(date) => update({ date })}
            disabled={disabled}
          />
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
          <CardTitle className="text-sm">
            Bank accounts ({accounts.length}/5)
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addAccount}
            disabled={disabled || accounts.length >= 5}
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 px-4 py-4">
          {accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No bank accounts yet — click <span className="font-medium">Add</span>.
            </p>
          ) : null}
          {accounts.map((acc, idx) => (
            <div key={idx} className="rounded-md border p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Account #{idx + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => removeAccount(idx)}
                  disabled={disabled}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <SelectField
                  label="Primary"
                  value={acc.isPrimary}
                  onChange={(v) => updateAccount(idx, { isPrimary: v as YesNo })}
                  options={YES_NO}
                  disabled={disabled}
                />
                <TextField
                  label="Account type"
                  value={acc.accountType}
                  onChange={(accountType) => updateAccount(idx, { accountType })}
                  placeholder="Current / Savings / Escrow / OD"
                  disabled={disabled}
                />
                <TextField
                  label="IFSC"
                  value={acc.ifsc}
                  onChange={(ifsc) => updateAccount(idx, { ifsc })}
                  disabled={disabled}
                />
                <TextField
                  label="Account number"
                  value={acc.accountNumber}
                  onChange={(accountNumber) => updateAccount(idx, { accountNumber })}
                  disabled={disabled}
                />
                <TextField
                  label="Bank name"
                  value={acc.bankName}
                  onChange={(bankName) => updateAccount(idx, { bankName })}
                  disabled={disabled}
                />
                <TextField
                  label="Branch"
                  value={acc.branch}
                  onChange={(branch) => updateAccount(idx, { branch })}
                  disabled={disabled}
                />
                <TextField
                  label="Name as per bank"
                  value={acc.nameAsPerBank}
                  onChange={(nameAsPerBank) => updateAccount(idx, { nameAsPerBank })}
                  disabled={disabled}
                />
                <TextField
                  label="Name as per PAN"
                  value={acc.nameAsPerPan}
                  onChange={(nameAsPerPan) => updateAccount(idx, { nameAsPerPan })}
                  disabled={disabled}
                />
                <TextField
                  label="MICR code"
                  value={acc.micrCode}
                  onChange={(micrCode) => updateAccount(idx, { micrCode })}
                  disabled={disabled}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function DematTab({ value, onChange, disabled }: Props) {
  const demat = value.dematAnnexure ?? {};
  const accounts = demat.accounts ?? [];
  const update = (patch: Partial<DematAnnexure>) =>
    onChange({ ...value, dematAnnexure: { ...demat, ...patch } });
  const updateAccount = (idx: number, patch: Partial<DematAccount>) => {
    const next = [...accounts];
    next[idx] = { ...next[idx], ...patch };
    update({ accounts: next });
  };
  const addAccount = () => update({ accounts: [...accounts, emptyDemat()] });
  const removeAccount = (idx: number) =>
    update({ accounts: accounts.filter((_, i) => i !== idx) });

  return (
    <div className="space-y-4">
      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm">Demat Annexure header (Page 10)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 px-4 py-4 md:grid-cols-2">
          <TextField
            label="PAN"
            value={demat.pan}
            onChange={(pan) => update({ pan })}
            disabled={disabled}
          />
          <TextField
            label="Applicant name"
            value={demat.applicantName}
            onChange={(applicantName) => update({ applicantName })}
            disabled={disabled}
          />
          <TextField
            label="Place"
            value={demat.place}
            onChange={(place) => update({ place })}
            disabled={disabled}
          />
          <TextField
            label="Date"
            value={demat.date}
            onChange={(date) => update({ date })}
            disabled={disabled}
          />
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
          <CardTitle className="text-sm">
            Demat accounts ({accounts.length}/5)
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addAccount}
            disabled={disabled || accounts.length >= 5}
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 px-4 py-4">
          {accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No demat accounts yet.</p>
          ) : null}
          {accounts.map((acc, idx) => (
            <div key={idx} className="rounded-md border p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Account #{idx + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => removeAccount(idx)}
                  disabled={disabled}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <SelectField
                  label="Primary"
                  value={acc.isPrimary}
                  onChange={(v) => updateAccount(idx, { isPrimary: v as YesNo })}
                  options={YES_NO}
                  disabled={disabled}
                />
                <SelectField
                  label="Depository"
                  value={acc.depository}
                  onChange={(v) =>
                    updateAccount(idx, { depository: v as Depository })
                  }
                  options={DEPOSITORIES}
                  disabled={disabled}
                />
                <TextField
                  label="DP name"
                  value={acc.dpName}
                  onChange={(dpName) => updateAccount(idx, { dpName })}
                  disabled={disabled}
                />
                <TextField
                  label="DP ID"
                  value={acc.dpId}
                  onChange={(dpId) => updateAccount(idx, { dpId })}
                  disabled={disabled}
                />
                <TextField
                  label="Beneficiary / Client ID"
                  value={acc.beneficiaryId}
                  onChange={(beneficiaryId) => updateAccount(idx, { beneficiaryId })}
                  className="md:col-span-2"
                  disabled={disabled}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
