import { InputField } from "@/global/elements/inputs/InputField";
import { SelectField } from "@/global/elements/inputs/SelectField";

import { FormCheckbox } from "@/global/elements/inputs/FormCheckbox";
import {
  ITradingOptionsFormHook,
  TradingOptionsFormData,
} from "./tradingOptionsFormData";
import { ACCESS_TYPES } from "./tradingOptionsFormData.schema";

const TradingOptionsForm = ({
  manager,
}: {
  manager: ITradingOptionsFormHook;
}) => {
  const { state, errors, setTradingOptionsData } = manager;

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Section Title */}
      <h5 className="font-bold text-lg">Trading Options</h5>

      {/* ===== RFQ Options Section ===== */}
      <div className="grid md:grid-cols-3 items-center gap-4">
        {/* RFQ Valid Till Market Close */}

        <FormCheckbox
          label="RFQ Valid Till Market Close"
          checked={state.rfqValidTillMarketClose}
          onCheckedChange={(checked) =>
            setTradingOptionsData("rfqValidTillMarketClose", checked === true)
          }
        />

        <FormCheckbox
          label="Value Negotiable"
          checked={state.valueNegotiable}
          onCheckedChange={(checked) =>
            setTradingOptionsData("valueNegotiable", checked === true)
          }
        />
        <FormCheckbox
          label="Quote Negotiable"
          checked={state.quoteNegotiable}
          onCheckedChange={(checked) =>
            setTradingOptionsData("quoteNegotiable", checked === true)
          }
        />
        {/* RFQ Expiry Time */}
      </div>

      {/* ===== Value Negotiation Section ===== */}
      <div className="grid md:grid-cols-3  gap-4">
        {/* Value Negotiable */}
        <InputField
          id="rfqexpirytime"
          label="RFQ Expiry Time"
          placeholder="--:--"
          type="time"
          value={state.rfqExpiryTime}
          onChangeAction={(val) => setTradingOptionsData("rfqExpiryTime", val)}
          error={errors.rfqExpiryTime?.[0]}
        />

        {/* Minimum Value */}
        <InputField
          id="minimumvalue"
          label="Minimum Value (Crores)"
          placeholder="Enter min value"
          type="text"
          value={state.minimumValue}
          onChangeAction={(val) => setTradingOptionsData("minimumValue", val)}
          error={errors.minimumValue?.[0]}
        />

        {/* Value Step Size */}
        <InputField
          id="valuestepsize"
          label="Value Step Size"
          placeholder="Enter step size"
          type="text"
          value={state.valueStepSize}
          onChangeAction={(val) => setTradingOptionsData("valueStepSize", val)}
          error={errors.valueStepSize?.[0]}
        />
      </div>

      {/* ===== Access Type & Anonymity Section ===== */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Access Type */}
        <SelectField
          label="Access Type"
          placeholder="Select Access Type"
          options={ACCESS_TYPES.map((type) => ({
            label: type,
            value: type,
          }))}
          value={state.accessType}
          onChangeAction={(val) =>
            setTradingOptionsData(
              "accessType",
              val as TradingOptionsFormData["accessType"]
            )
          }
          error={errors.accessType?.[0]}
        />

        {/* Anonymous */}

        <FormCheckbox
          label="Anonymous"
          checked={state.anonymous}
          onCheckedChange={(checked) =>
            setTradingOptionsData("anonymous", checked === true)
          }
        />
      </div>
    </div>
  );
};

export default TradingOptionsForm;
