import { InputField } from "@/global/elements/inputs/InputField";
import { SelectField } from "@/global/elements/inputs/SelectField";

import { FormCheckbox } from "@/global/elements/inputs/FormCheckbox";
import {
  ITradingOptionsFormHook,
  TradingOptionsFormData,
} from "./tradingOptionsFormData";

const TradingOptionsForm = ({
  manager,
}: {
  manager: ITradingOptionsFormHook;
}) => {
  const { state, errors, setTradingOptionsData } = manager;

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Section Title */}
      <h5 className="font-bold">Trading Options</h5>

      {/* ===== RFQ Options Section ===== */}
      <div className="grid md:grid-cols-4  gap-4">
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

        {/* Anonymous */}
        <FormCheckbox
          label="Anonymous"
          checked={state.anonymous}
          onCheckedChange={(checked) =>
            setTradingOptionsData("anonymous", checked === true)
          }
        />

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

        {/* Access Type */}
        <SelectField
          label="Access Type"
          placeholder="Select Access Type"
          options={[
            {
              label: "OTM (One to many)",
              value: "1",
            },
            {
              label: "OTO (One to One)",
              value: "2",
            },
            {
              label: "IST (Inter scheme transfer)",
              value: "3",
            },
          ]}
          value={state.accessType}
          onChangeAction={(val) =>
            setTradingOptionsData(
              "accessType",
              val as TradingOptionsFormData["accessType"]
            )
          }
          error={errors.accessType?.[0]}
        />
      </div>
    </div>
  );
};

export default TradingOptionsForm;
