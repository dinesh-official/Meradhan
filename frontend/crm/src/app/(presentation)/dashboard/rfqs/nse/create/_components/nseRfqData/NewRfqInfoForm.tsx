import NseIsinPicker from "@/global/elements/autocomplete/NseIsinPicker";
import { FormCheckbox } from "@/global/elements/inputs/FormCheckbox";
import { InputField } from "@/global/elements/inputs/InputField";
import { SelectField } from "@/global/elements/inputs/SelectField";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { addDays } from "date-fns";
import { INseRFQFormHook } from "./NseFormData";
import { NseRFQFormData, YIELD_TYPES } from "./nseRfqFormData.schema";
import z from "zod";

export const schemaData = z
  .object({

    segment: z.enum(["R", "C"]).default("R"),
    isin: z.string().min(1, "ISIN is required"),
    participantCode: z.string().min(1, "Participant Code is required"),
    dealType: z.enum(["D", "B"]),
    clientCode: z.string().min(1, "Client Code is required"),
    buySell: z.enum(["B", "S", "X"]),
    quoteType: z.enum(["Y", "B"]),
    settlementType: z.enum(["0", "1"]),
    value: z.float32().min(0.01, "Value must be at least 0.01"),
    quantity: z.number().optional(),
    yieldType: z.enum(["YTM", "YTP", "YTC"]),
    yield: z.float32().min(0, "Yield must be at least 0"),
    calcMethod: z.enum(["M", "O"]),
    price: z.float32().optional(),
    valueSell: z.float32().optional(),
    quantitySell: z.number().optional(),
    yieldTypeSell: z.enum(["YTM", "YTP", "YTC"]).optional(),
    yieldSell: z.float32().optional(),
    calcMethodSell: z.enum(["M", "O"]).optional(),
    priceSell: z.float32().optional(),
    gtdFlag: z.enum(["Y"]).nullable(),
    endTime: z.date().nullable(),
    quoteNegotiable: z.enum(["Y"]).nullable(),
    valueNegotiable: z.enum(["Y"]).nullable(),
    minFillValue: z.float32().optional(),
    valueStepSize: z.float32().optional(),
    anonymous: z.enum(["Y"]).nullable(),
    access: z.enum(["1", "2", "3"]),
    groupList: z.array(z.string()).optional(),

    participantList: z.array(z.string()).optional(),
    category: z.string().optional(),
    rating: z.string().optional(),
    remarks: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Valid and mandatory only if buySell =Both
    if (data.quoteType == "B") {
      // price is required
      if (!data.price) {
        ctx.addIssue({
          code: "custom",
          message: "Price is required when quote type is Both",
          path: ["price"],
        });
      }
      // yieldSell is required
    }

    // Valid and mandatory only if buySell = Both
    if (data.buySell == "X") {
      // valueSell is required
      if (!data.valueSell) {
        ctx.addIssue({
          code: "custom",
          message: "Value Sell is required when Buy/Sell is Both",
          path: ["valueSell"],
        });
      }

      if (!data.quantitySell) {
        ctx.addIssue({
          code: "custom",
          message: "Quantity Sell is required when Buy/Sell is Both",
          path: ["quantitySell"],
        });
      }

      if (!data.yieldTypeSell) {
        ctx.addIssue({
          code: "custom",
          message: "Yield Type Sell is required when Buy/Sell is Both",
          path: ["yieldTypeSell"],
        });
      }

      if (!data.yieldSell) {
        ctx.addIssue({
          code: "custom",
          message: "Yield Sell is required when Buy/Sell is Both",
          path: ["yieldSell"],
        });
      }

      if (!data.calcMethodSell) {
        ctx.addIssue({
          code: "custom",
          message: "Calc Method Sell is required when Buy/Sell is Both",
          path: ["calcMethodSell"],
        });
      }

      if (!data.priceSell) {
        ctx.addIssue({
          code: "custom",
          message: "Price Sell is required when Buy/Sell is Both",
          path: ["priceSell"],
        });
      }
    }

    if (data.quoteNegotiable == "Y") {
    }

    if (data.access == "2") {
    }
  });

const NewRfqInfoForm = ({ manager }: { manager: INseRFQFormHook }) => {
  return (
    <div className="relative flex flex-col gap-4">
      <h5 className="font-bold">RFQ Information</h5>
      <div className="gap-4 grid md:grid-cols-2">
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
        <SelectField
          label="Segment"
          placeholder="Select Segment"
          options={[
            {
              label: "Normal RFQ (R)",
              value: "R",
            },
            {
              label: "CDMDF RFQ (C)",
              value: "C",
            },
          ]}
          value={manager.state.segment}
          onChangeAction={(e) =>
            manager.setRFQData("segment", e as NseRFQFormData["segment"])
          }
          error={manager.errors.segment?.[0]}
        />
      </div>
      <div className="gap-4 grid md:grid-cols-2">
        <SelectField
          label="Buy/Sell"
          placeholder="Select Buy/Sell"
          options={[
            {
              label: "Buy (B)",
              value: "B",
            },
            {
              label: "Sell (S)",
              value: "S",
            },
            {
              label: "Both (X)",
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

        <div className="gap-5 grid md:grid-cols-3 md:col-span-2">
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
        </div>

        <div className="gap-5 grid grid-cols-3 md:col-span-2">
          <InputField
            id="rfqsize"
            label="RFQ Size (Value in Crores)"
            placeholder="RFQ Size (Value in Crores)"
            value={manager.state.rfqSize}
            onChangeAction={(e) => manager.setRFQData("rfqSize", e)}
            error={manager.errors.rfqSize?.[0]}
          />

          <SelectField
            label="Settlement  Date"
            placeholder="Settlement  Date"
            options={[
              {
                label: `T+0 (${dateTimeUtils.formatDateTime(
                  new Date(),
                  "DD/MM/YYYY"
                )})`,
                value: "0",
              },
              {
                label: `T+1 (${dateTimeUtils.formatDateTime(
                  addDays(Date.now(), 1),
                  "DD/MM/YYYY"
                )})`,
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
            id="Quantity"
            label="Quantity (Auto Calculated)"
            placeholder="Auto Calculated"
            disabled
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
              manager.setRFQData(
                "calcMethod",
                e as NseRFQFormData["calcMethod"]
              )
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
    </div>
  );
};

export default NewRfqInfoForm;
