import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InputField } from "@/global/elements/inputs/InputField";
import React from "react";
import { IAddressInformationFormHook } from "./addressFormData";

const AddressInformatoin = ({
  manager,
}: {
  manager: IAddressInformationFormHook;
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid md:grid-cols-2 gap-4">
        <InputField
          id="addressLine1"
          label="Address Line 1"
          placeholder="Enter Address Line 1"
          required
          value={manager.state.addressLine1}
          onChangeAction={(e) => manager.setAddressData("addressLine1", e)}
          error={manager.errors.addressLine1?.[0]}
        />

        <InputField
          id="addressLine2"
          label="Address Line 2"
          placeholder="Enter Address Line 2"
          value={manager.state.addressLine2}
          onChangeAction={(e) => manager.setAddressData("addressLine2", e)}
          error={manager.errors.addressLine2?.[0]}
        />

        <InputField
          id="addressLine3"
          label="Address Line 3"
          placeholder="Enter Address Line 3"
          value={manager.state.addressLine3}
          onChangeAction={(e) => manager.setAddressData("addressLine3", e)}
          error={manager.errors.addressLine3?.[0]}
        />
        <InputField
          id="stateCode"
          label="State Code"
          placeholder="Enter State Code"
          required
          value={manager.state.stateCode}
          onChangeAction={(e) =>
            manager.setAddressData("stateCode", e.toUpperCase())
          }
          error={manager.errors.stateCode?.[0]}
        />
      </div>
      <div className="flex flex-col gap-4">
        <Label>registered Address</Label>
        <Textarea
          id="notes"
          placeholder="Enter registered address"
          value={manager.state.registeredAddress}
          onChange={(e) =>
            manager.setAddressData("registeredAddress", e.target.value)
          }
        ></Textarea>
      </div>
    </div>
  );
};

export default AddressInformatoin;
