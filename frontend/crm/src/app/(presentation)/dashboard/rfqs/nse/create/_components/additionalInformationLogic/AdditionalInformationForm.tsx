import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RatingCodeArray, sectorOptions } from "@/global/constants/nseData";
import { SelectField } from "@/global/elements/inputs/SelectField";
import {
  AdditionalOptionsFormData,
  ITradingOptionsFormHook,
} from "./additionalFormaData";

const AdditionalInformationForm = ({
  manager,
}: {
  manager: ITradingOptionsFormHook;
}) => {
  return (
    <div className="relative flex flex-col gap-4">
      <h5 className="font-bold">Additional Information</h5>
      <div className="items-center gap-4 grid grid-cols-1 md:grid-cols-2">
        <SelectField
          label="Sector"
          placeholder="Select Sector"
          options={sectorOptions}
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
          options={RatingCodeArray.map((s) => ({ label: s, value: s }))}
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
      <div className="flex flex-col gap-2 w-full">
        <Label htmlFor="Remarks">Remarks</Label>
        <Textarea
          id="Remarks"
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
