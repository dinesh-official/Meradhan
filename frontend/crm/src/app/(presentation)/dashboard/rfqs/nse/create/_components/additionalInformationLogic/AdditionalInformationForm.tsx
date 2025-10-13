import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SelectField } from "@/global/elements/inputs/SelectField";
import React from "react";
import {
  AdditionalOptionsFormData,
  ITradingOptionsFormHook,
} from "./additionalFormaData";
import { RATINGS, SECTORS } from "./addtionalFormaData.schema";

const AdditionalInformationForm = ({
  manager,
}: {
  manager: ITradingOptionsFormHook;
}) => {
  return (
    <div className="flex flex-col gap-4 relative">
      <h5 className="font-bold">Additional Information</h5>
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
        <SelectField
          label="Sector"
          placeholder="Select Sector"
          options={SECTORS.map((s) => ({ label: s, value: s }))}
          value={manager.state.sector}
          onChangeAction={(e) =>
            manager.setAdditionalOptionsData(
              "sector",
              e as AdditionalOptionsFormData["sector"]
            )
          }
          error={manager?.errors?.sector?.[0]}
        />

        <SelectField
          label="Ratings"
          placeholder="select Ratings"
          options={RATINGS.map((s) => ({ label: s, value: s }))}
          value={manager.state.rating}
          onChangeAction={(e) =>
            manager.setAdditionalOptionsData(
              "rating",
              e as AdditionalOptionsFormData["rating"]
            )
          }
          error={manager?.errors?.rating?.[0]}
        />
      </div>
      <div className="flex flex-col w-full gap-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Add any additional notes about this lead"
          value={manager.state.notes}
          onChange={(e) =>
            manager.setAdditionalOptionsData("notes", e.target.value)
          }
        ></Textarea>
      </div>
    </div>
  );
};

export default AdditionalInformationForm;
