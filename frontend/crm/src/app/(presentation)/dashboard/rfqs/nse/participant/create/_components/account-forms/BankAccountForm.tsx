import React from "react";
import { X } from "lucide-react";
import { InputField } from "@/global/elements/inputs/InputField";
import { SelectField } from "@/global/elements/inputs/SelectField";
import { Default_Account } from "../bank-account/backAccount.schema";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IBankAccountFormHook } from "../bank-account/backAccount";

type BankAccount = {
  id: string;
  bankname: string;
  ifsccode: string;
  accountnumber: string;
  isdefaultaccount: "Yes" | "No";
};

type Props = {
  index: number;
  account: BankAccount;
  error?: IBankAccountFormHook["errors"][number];
  onChange: <K extends keyof BankAccount>(
    key: K,
    value: BankAccount[K]
  ) => void;
  onSetDefault: () => void;
  onRemove: () => void;
};

const BankAccountForm = ({
  index,
  account,
  error,
  onChange,
  onSetDefault,
  onRemove,
}: Props) => {

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank Account #{index + 1}</CardTitle>
        <CardAction>
          {index > 0 && (
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex items-center gap-1 text-sm text-red-600 hover:underline"
            >
              <X className="w-4 h-4" /> Remove
            </button>
          )}
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
          <InputField
            id={`bankname-${account.id}`}
            label="Bank Name"
            placeholder="Enter bank name"
            required
            value={account.bankname}
            onChangeAction={(val: string) => onChange("bankname", val)}
            error={error?.bankname?.[0]}
          />

          <InputField
            id={`ifsccode-${account.id}`}
            label="IFSC Code"
            placeholder="Enter IFSC code"
            required
            value={account.ifsccode}
            onChangeAction={(val: string) => onChange("ifsccode", val)}
            error={error?.ifsccode?.[0]}
          />

          <InputField
            id={`accountnumber-${account.id}`}
            label="Account Number"
            placeholder="Enter Account Number"
            required
            value={account.accountnumber}
            onChangeAction={(val: string) => onChange("accountnumber", val)}
            error={error?.accountnumber?.[0]}
          />

          <SelectField
            label="Is Default Account"
            placeholder="Select Option"
            options={Default_Account.map((s) => ({ label: s, value: s }))}
            required
            value={account.isdefaultaccount}
            onChangeAction={() => onSetDefault()}
            error={error?.isdefaultaccount?.[0]}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BankAccountForm;
