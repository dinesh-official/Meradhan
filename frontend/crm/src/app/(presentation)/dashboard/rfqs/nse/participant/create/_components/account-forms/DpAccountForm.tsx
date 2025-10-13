import { InputField } from "@/global/elements/inputs/InputField";
import { SelectField } from "@/global/elements/inputs/SelectField";
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

const DpAccountform = ({
  index,
  account,
  error = {},
  onChange,
  onSetDefault,
  onRemove,
}: Props) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Row 1 */}
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
            onChange("isdefaultaccount", val as DPAccount["isdefaultaccount"]);
            if (val === "Yes") onSetDefault();
          }}
          error={error.isdefaultaccount?.[0]}
        />
      </div>
    </div>
  );
};

export default DpAccountform;
