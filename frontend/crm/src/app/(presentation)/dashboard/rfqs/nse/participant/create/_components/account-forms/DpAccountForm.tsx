import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InputField } from "@/global/elements/inputs/InputField";
import { SelectField } from "@/global/elements/inputs/SelectField";
import { X } from "lucide-react";
import {
  BENEFICIARY,
  DEFAULT_ACCOUNT,
  DP_TYPE,
} from "../dpAccount/dpAccount.schema";

type DPAccount = {
  id: string;
  dptype: (typeof DP_TYPE)[number];
  dpid: string;
  beneficiaryid: (typeof BENEFICIARY)[number];
  isdefaultaccount: "Yes" | "No";
};

type Props = {
  index: number;
  account: DPAccount;
  error?: Partial<Record<keyof DPAccount, string[]>>;
  onChange: <K extends keyof DPAccount>(key: K, value: DPAccount[K]) => void;
  onSetDefault: () => void;
  onRemove: () => void;
};

const DpAccountForm = ({
  account,
  error = {},
  onChange,
  onSetDefault,
  index,
  onRemove,
}: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Demat Account #{index + 1}</CardTitle>
        <CardAction>
          {index > 0 && (
            <p
              onClick={(e) => {
                e.stopPropagation(); // prevents accordion toggle when clicking remove
                onRemove?.();
              }}
              className="inline-flex items-center gap-1 text-sm text-red-600 hover:underline cursor-pointer"
            >
              <X className="w-4 h-4" /> Remove
            </p>
          )}
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
          <SelectField
            label="DP Type"
            placeholder="Select DP Type"
            options={DP_TYPE.map((s) => ({ label: s, value: s }))}
            required
            value={account.dptype}
            onChangeAction={(val: string) =>
              onChange("dptype", val as DPAccount["dptype"])
            }
            error={error.dptype?.[0]}
          />

          <InputField
            id={`dpid-${account.id}`}
            label="DP ID"
            placeholder="Enter DP ID"
            required
            value={account.dpid}
            onChangeAction={(val: string) => onChange("dpid", val)}
            error={error.dpid?.[0]}
          />

          <SelectField
            label="Beneficiary ID"
            placeholder="Select Beneficiary"
            options={BENEFICIARY.map((s) => ({ label: s, value: s }))}
            required
            value={account.beneficiaryid}
            onChangeAction={(val: string) =>
              onChange("beneficiaryid", val as DPAccount["beneficiaryid"])
            }
            error={error.beneficiaryid?.[0]}
          />

          <SelectField
            label="Is Default Account"
            placeholder="Select Option"
            options={DEFAULT_ACCOUNT.map((s) => ({ label: s, value: s }))}
            required
            value={account.isdefaultaccount}
            onChangeAction={(val: string) => {
              onChange(
                "isdefaultaccount",
                val as DPAccount["isdefaultaccount"]
              );
              if (val === "Yes") onSetDefault();
            }}
            error={error.isdefaultaccount?.[0]}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DpAccountForm;
