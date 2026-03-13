"use client";

import { InputField } from "@/global/elements/inputs/InputField";
import { SelectField } from "@/global/elements/inputs/SelectField";
import { useManualKycFormHook } from "../../_hooks/useManualKycFormHook";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface Step6BankAccountProps {
  formHook: ReturnType<typeof useManualKycFormHook>;
}

const accountTypeOptions = [
  { label: "Savings", value: "SAVINGS" },
  { label: "Current", value: "CURRENT" },
  { label: "Fixed Deposit", value: "FIXED_DEPOSIT" },
  { label: "Recurring Deposit", value: "RECURRING_DEPOSIT" },
];

export function Step6BankAccount({ formHook }: Step6BankAccountProps) {
  const { formData, updateStepData, getFieldError } = formHook;

  const bankAccounts = formData.step6.bankAccounts;

  const addBankAccount = () => {
    updateStepData("step6", {
      bankAccounts: [
        ...bankAccounts,
        {
          accountHolderName: "",
          bankName: "",
          accountNumber: "",
          ifscCode: "",
          accountType: "",
          isPrimary: false,
          bankAccountConsent: false,
          confirmBankTimestamp: "",
        },
      ],
    });
  };

  const removeBankAccount = (index: number) => {
    if (bankAccounts.length > 1) {
      const updated = bankAccounts.filter((_, i) => i !== index);
      // Ensure at least one is primary
      if (!updated.some((acc) => acc.isPrimary) && updated.length > 0) {
        updated[0].isPrimary = true;
      }
      updateStepData("step6", { bankAccounts: updated });
    }
  };

  const updateBankAccount = (index: number, field: string, value: string | boolean) => {
    const updated = [...bankAccounts];
    updated[index] = { ...updated[index], [field]: value };
    // If setting as primary, unset others
    if (field === "isPrimary" && value === true) {
      updated.forEach((acc, i) => {
        if (i !== index) acc.isPrimary = false;
      });
    }
    updateStepData("step6", { bankAccounts: updated });
  };

  return (
    <div className="space-y-4">
      {bankAccounts.map((account, index) => (
        <Card key={index}>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold">Bank Account {index + 1}</h4>
              {bankAccounts.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBankAccount(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <InputField
              id={`accountHolderName-${index}`}
              label="Account Holder Name"
              placeholder="Enter account holder name"
              required
              value={account.accountHolderName}
              onChangeAction={(e) =>
                updateBankAccount(index, "accountHolderName", e)
              }
              error={getFieldError(6, `bankAccounts.${index}.accountHolderName`)}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <InputField
                id={`bankName-${index}`}
                label="Bank Name"
                placeholder="Enter bank name"
                required
                value={account.bankName}
                onChangeAction={(e) => updateBankAccount(index, "bankName", e)}
                error={getFieldError(6, `bankAccounts.${index}.bankName`)}
              />

              <InputField
                id={`accountNumber-${index}`}
                label="Account Number"
                placeholder="Enter account number"
                required
                value={account.accountNumber}
                onChangeAction={(e) =>
                  updateBankAccount(index, "accountNumber", e)
                }
                error={getFieldError(6, `bankAccounts.${index}.accountNumber`)}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <InputField
                id={`ifscCode-${index}`}
                label="IFSC Code"
                placeholder="Enter IFSC code (e.g., HDFC0001234)"
                required
                value={account.ifscCode}
                onChangeAction={(e) =>
                  updateBankAccount(index, "ifscCode", e.toUpperCase())
                }
                error={getFieldError(6, `bankAccounts.${index}.ifscCode`)}
              />

              <SelectField
                label="Account Type"
                placeholder="Select account type"
                required
                value={account.accountType}
                onChangeAction={(e) =>
                  updateBankAccount(index, "accountType", e)
                }
                options={accountTypeOptions}
                error={getFieldError(6, `bankAccounts.${index}.accountType`)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`isPrimary-${index}`}
                checked={account.isPrimary}
                onCheckedChange={(checked) =>
                  updateBankAccount(index, "isPrimary", checked === true)
                }
              />
              <Label htmlFor={`isPrimary-${index}`} className="text-sm font-normal">
                Primary Account
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`bankAccountConsent-${index}`}
                checked={account.bankAccountConsent}
                onCheckedChange={(checked) => {
                  const consent = checked === true;
                  updateBankAccount(index, "bankAccountConsent", consent);
                  // Set timestamp when consent is given
                  if (consent && !account.confirmBankTimestamp) {
                    updateBankAccount(index, "confirmBankTimestamp", new Date().toISOString());
                  }
                }}
              />
              <Label
                htmlFor={`bankAccountConsent-${index}`}
                className="text-sm font-normal"
              >
                I consent to the use of my bank account information for KYC
                verification <span className="text-destructive">*</span>
              </Label>
            </div>
            {getFieldError(6, `bankAccounts.${index}.bankAccountConsent`) && (
              <p className="text-destructive text-xs">
                {getFieldError(6, `bankAccounts.${index}.bankAccountConsent`)}
              </p>
            )}
          </CardContent>
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={addBankAccount}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Another Bank Account
      </Button>
    </div>
  );
}

