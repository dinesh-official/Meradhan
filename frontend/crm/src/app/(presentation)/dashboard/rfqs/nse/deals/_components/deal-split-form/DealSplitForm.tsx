import { Textarea } from "@/components/ui/textarea";
import { FormCheckbox } from "@/global/elements/inputs/FormCheckbox";
import { InputField } from "@/global/elements/inputs/InputField";
import { SelectField } from "@/global/elements/inputs/SelectField";
import { DealSplitFormData, IDealSplitFormHook } from "./dealSplitFormData";
import {
  calculationMethods,
  dealTypes,
  goodTillDays,
  settlementOptions,
} from "./dealSplitFormData.schema";

const DealSplitForm = ({ manager }: { manager: IDealSplitFormHook }) => {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-5">
        <InputField
          id="value"
          label="Value"
          placeholder="Enter value"
          type="text"
          value={manager.state.value}
          onChangeAction={(e) => {
            manager.setDealSplitData("value", e);
          }}
          error={manager?.errors?.value?.[0]}
        />
        <InputField
          id="yield"
          label="Yield"
          placeholder="Enter Yield"
          type="text"
          value={manager.state.yield}
          onChangeAction={(e) => {
            manager.setDealSplitData("yield", e);
          }}
          error={manager?.errors?.yield?.[0]}
        />
        <SelectField
          label="Calculation Method"
          placeholder="Calculation Method"
          options={calculationMethods.map((option) => ({
            label: option,
            value: option,
          }))}
          value={manager.state.calculationMethod}
          onChangeAction={(e) => {
            manager.setDealSplitData(
              "calculationMethod",
              e as DealSplitFormData["calculationMethod"]
            );
          }}
          error={manager?.errors?.calculationMethod?.[0]}
        />
        <InputField
          id="priceTriggeredDate"
          label="Price Triggered Date"
          placeholder="Enter Yield"
          type="date"
          value={manager.state.priceTriggeredDate}
          onChangeAction={(e) => {
            manager.setDealSplitData("priceTriggeredDate", e);
          }}
          error={manager?.errors?.priceTriggeredDate?.[0]}
        />
        <InputField
          id="price"
          label="Price"
          placeholder="Enter Price"
          type="text"
          value={manager.state.price}
          onChangeAction={(e) => manager.setDealSplitData("price", e)}
          error={manager?.errors?.price?.[0]}
        />
        <InputField
          id="totalAccruedInterest"
          label="Total Accrued Interest"
          placeholder="Enter Total Accrued Interest"
          type="text"
          value={manager.state.totalAccruedInterest}
          onChangeAction={(e) =>
            manager.setDealSplitData("totalAccruedInterest", e)
          }
          error={manager?.errors?.totalAccruedInterest?.[0]}
        />

        <SelectField
          label="Settlement Date"
          placeholder="Settlement Date"
          options={settlementOptions.map((option) => ({
            label: option,
            value: option,
          }))}
          value={manager.state.settlementDate}
          onChangeAction={(e) => {
            manager.setDealSplitData(
              "settlementDate",
              e as DealSplitFormData["settlementDate"]
            );
          }}
          error={manager?.errors?.settlementDate?.[0]}
        />

        <InputField
          id="quantity"
          label="Quantity"
          placeholder="Enter Quantity"
          type="text"
          value={manager.state.quantity}
          onChangeAction={(e) => manager.setDealSplitData("quantity", e)}
          error={manager?.errors?.quantity?.[0]}
        />
        <SelectField
          label="Good Till Day"
          placeholder="Good Till Day"
          options={goodTillDays.map((option) => ({
            label: option,
            value: option,
          }))}
          value={manager.state.goodTillDay}
          onChangeAction={(e) =>
            manager.setDealSplitData(
              "goodTillDay",
              e as DealSplitFormData["goodTillDay"]
            )
          }
          error={manager?.errors?.goodTillDay?.[0]}
        />

        <InputField
          id="endTime"
          label="End Time"
          placeholder="--:--"
          type="date"
          value={manager.state.endTime}
          onChangeAction={(e) => manager.setDealSplitData("endTime", e)}
          error={manager?.errors?.endTime?.[0]}
        />
        <InputField
          id="stampDuty"
          label="Cons. w/o Stamp Duty"
          placeholder="Enter Stamp Duty"
          type="text"
          value={manager.state.stampDuty}
          onChangeAction={(e) => manager.setDealSplitData("stampDuty", e)}
          error={manager?.errors?.stampDuty?.[0]}
        />
        <SelectField
          label="Deal Type"
          placeholder="Deal Type"
          options={dealTypes.map((option) => ({
            label: option,
            value: option,
          }))}
          value={manager.state.dealType}
          onChangeAction={(e) =>
            manager.setDealSplitData(
              "dealType",
              e as DealSplitFormData["dealType"]
            )
          }
        />
        <InputField
          id="clientCode"
          label="Client Code "
          placeholder="Enter Client Code"
          type="text"
          value={manager.state.clientCode}
          onChangeAction={(e) => manager.setDealSplitData("clientCode", e)}
          error={manager?.errors?.clientCode?.[0]}
        />
        <div className="flex gap-2">
          <FormCheckbox
            label="Institution"
            checked={manager.state.institution}
            onCheckedChange={(checked) =>
              manager.setDealSplitData("institution", checked)
            }
          />
        </div>
      </div>

      <Textarea
        id="notes"
        placeholder="Add any notes..."
        value={manager.state.notes}
        onChange={(e) => manager.setDealSplitData("notes", e.target.value)}
      />
    </div>
  );
};

export default DealSplitForm;
