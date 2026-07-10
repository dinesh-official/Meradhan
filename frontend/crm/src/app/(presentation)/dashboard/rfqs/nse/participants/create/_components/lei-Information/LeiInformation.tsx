import { InputField } from "@/global/elements/inputs/InputField";
import React from "react";
import { ILEIInformationFormHook } from "./leiInformationForm";

const LEIInformation = ({ manager }: { manager: ILEIInformationFormHook }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid md:grid-cols-2 gap-4">
        <InputField
          id="leicode"
          label="LEI Code"
          placeholder="Enter LEI Code"
          type="text"
          value={manager.state.leicode ?? ""}
          onChangeAction={(val) => manager.setLEIData("leicode", val)}
          error={manager.errors.leicode?.[0]}
        />
        <InputField
          id="enterdata"
          label="Enter Date (DD/MM/YYYY)"
          placeholder="Enter expiry Date"
          type="text"
          value={manager.state.expirydate ?? ""}
          onChangeAction={(val) => manager.setLEIData("expirydate", val)}
          error={manager.errors.expirydate?.[0]}
        />
      </div>
    </div>
  );
};

export default LEIInformation;
