import { FormCheckbox } from "@/global/elements/inputs/FormCheckbox";
import { InputField } from "@/global/elements/inputs/InputField";
import { SelectField } from "@/global/elements/inputs/SelectField";
import { INseRFQFormHook } from "./NseFormData";
import { NseRFQFormData, YIELD_TYPES } from "./nseRfqFormData.schema";
import NseIsinPicker from "@/global/elements/autocomplete/NseIsinPicker";
import { SelectNseParticipant } from "@/global/elements/autocomplete/SelectNseParticipant";
import { Label } from "@/components/ui/label";

const NewRfqInfoForm = ({ manager }: { manager: INseRFQFormHook }) => {
  return (
    <div className="flex flex-col gap-4 relative">
      <h5 className="font-bold">RFQ Information</h5>
      <div className="grid md:grid-cols-2  gap-4">
        <NseIsinPicker>
          <InputField
            id="isin"
            label="ISIN"
            placeholder="Enter ISIN"
            value={manager.state.isin}
            onChangeAction={(e) => manager.setRFQData("isin", e)}
            error={manager.errors.isin?.[0]}
          />
        </NseIsinPicker>
        <div className="flex flex-col gap-2">
          <Label>Participant</Label>
          <SelectNseParticipant
            onSelect={(e) => {
              if (e) manager.participant.setParticipant(e);
            }}
            placeholder="Select Participant"
            value={manager.participant.participant}
          />
        </div>
      </div>
      <div className="grid md:grid-cols-3  gap-4">
        <SelectField
          label="Segment"
          placeholder="Select Segment"
          options={[
            {
              label: "Normal RFQ",
              value: "R",
            },
            {
              label: "CDMDF RFQ",
              value: "C",
            },
          ]}
          value={manager.state.segment}
          onChangeAction={(e) =>
            manager.setRFQData("segment", e as NseRFQFormData["segment"])
          }
          error={manager.errors.segment?.[0]}
        />
        <SelectField
          label="Buy/Sell"
          placeholder="Select Buy/Sell"
          options={[
            {
              label: "Buy",
              value: "B",
            },
            {
              label: "Sell",
              value: "S",
            },
            {
              label: "Both",
              value: "X",
            },
          ]}
          value={manager.state.buySell}
          onChangeAction={(e) =>
            manager.setRFQData("buySell", e as NseRFQFormData["buySell"])
          }
          error={manager.errors.buySell?.[0]}
        />

        <SelectField
          label="Quote Type"
          placeholder="Select Quote Type"
          options={[
            {
              label: "Only Yield",
              value: "Y",
            },
            {
              label: "Both Price and Yield",
              value: "B",
            },
          ]}
          value={manager.state.quoteType}
          onChangeAction={(e) =>
            manager.setRFQData("quoteType", e as NseRFQFormData["quoteType"])
          }
          error={manager.errors.quoteType?.[0]}
        />

        <SelectField
          label="Deal Type"
          placeholder="Select deal type"
          options={[
            {
              label: "Direct",
              value: "D",
            },
            {
              label: "Brokered",
              value: "B",
            },
          ]}
          value={manager.state.dealType}
          onChangeAction={(e) =>
            manager.setRFQData("dealType", e as NseRFQFormData["dealType"])
          }
          error={manager.errors.dealType?.[0]}
        />

        {manager.state.dealType == "B" && (
          <FormCheckbox
            label="Institutions"
            checked={manager.state.institutions || false}
            onCheckedChange={(e) => manager.setRFQData("institutions", e)}
            error={manager.errors.institutions?.[0]}
          />
        )}
        {manager.state.dealType == "B" && (
          <InputField
            id="clientcode"
            label="Client Code"
            placeholder="Enter Client Code"
            value={manager.state.clientCode}
            onChangeAction={(e) => manager.setRFQData("clientCode", e)}
            error={manager.errors.clientCode?.[0]}
          />
        )}
        <InputField
          id="rfqsize"
          label="RFQ Size (Value in Crores)"
          placeholder="RFQ Size (Value in Crores)"
          value={manager.state.rfqSize}
          onChangeAction={(e) => manager.setRFQData("rfqSize", e)}
          error={manager.errors.rfqSize?.[0]}
        />

        <SelectField
          label="Settlement Type"
          placeholder="Settlement Type"
          options={[
            {
              label: "T+0",
              value: "0",
            },
            {
              label: "T+1",
              value: "1",
            },
          ]}
          value={manager.state.settlementType}
          onChangeAction={(e) =>
            manager.setRFQData(
              "settlementType",
              e as NseRFQFormData["settlementType"]
            )
          }
          error={manager.errors.settlementType?.[0]}
        />
        <InputField
          id="quantity"
          label="Quantity"
          placeholder="Enter Quantity"
          value={manager.state.quantity}
          onChangeAction={(e) => manager.setRFQData("quantity", e)}
          error={manager.errors.quantity?.[0]}
        />
        <SelectField
          label="Yield Type"
          placeholder="Yield to Maturity(YTM)"
          options={YIELD_TYPES.map((s) => ({ label: s, value: s }))}
          value={manager.state.yieldType}
          onChangeAction={(e) =>
            manager.setRFQData("yieldType", e as NseRFQFormData["yieldType"])
          }
          error={manager.errors.yieldType?.[0]}
        />

        <InputField
          id="yield"
          label="Yield"
          placeholder="Enter yield %"
          value={manager.state.yield}
          onChangeAction={(e) => manager.setRFQData("yield", e)}
          error={manager.errors.yield?.[0]}
        />

        <SelectField
          label="Calc Method"
          placeholder="Select Calc Method"
          options={[
            { label: "Money Market", value: "M" },
            { label: "Other", value: "O" },
          ]}
          value={manager.state.calcMethod}
          onChangeAction={(e) =>
            manager.setRFQData("calcMethod", e as NseRFQFormData["calcMethod"])
          }
          error={manager.errors.calcMethod?.[0]}
        />
        <InputField
          id="price"
          label="Price"
          placeholder="Enter Price"
          value={manager.state.price}
          onChangeAction={(e) => manager.setRFQData("price", e)}
          error={manager.errors.price?.[0]}
        />
      </div>
    </div>
  );
};

export default NewRfqInfoForm;
