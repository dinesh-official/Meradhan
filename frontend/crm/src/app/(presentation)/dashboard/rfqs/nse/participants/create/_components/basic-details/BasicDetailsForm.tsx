import { InputField } from "@/global/elements/inputs/InputField";
import React from "react";
import { IBasicDetailsFormHook } from "./basicDetails";

const BasicDetailsForm = ({ manager }: { manager: IBasicDetailsFormHook }) => {
  return (
    <div className="flex flex-col gap-5">
    
      <div className="grid md:grid-cols-2 gap-5">
        <InputField
          id="loginId"
          label="Login Id"
          placeholder="Enter login Id"
          required
          value={manager.state.loginId}
          onChangeAction={(e) => {
            manager.setBasicData("loginId", e);
          }}
          error={manager.errors.loginId?.[0]}
        />
        <InputField
          id="firstName"
          label="First Name"
          placeholder="Enter FirstName"
          required
          value={manager.state.firstName}
          onChangeAction={(e) => manager.setBasicData("firstName", e)}
          error={manager.errors.firstName?.[0]}
        />

        <InputField
          id="panNumber"
          label="PAN Number"
          placeholder="Enter PAN or 'PAN_EXEMPT'"
          required
          value={manager.state.panNumber}
          onChangeAction={(e) =>
            manager.setBasicData("panNumber", e.toUpperCase())
          }
          error={manager.errors.panNumber?.[0]}
        />
        <InputField
          id="custodian"
          label="Custodian"
          placeholder="Enter Custodian"
          value={manager.state.custodian}
          onChangeAction={(e) => manager.setBasicData("custodian", e)}
          error={manager.errors.custodian?.[0]}
        />

        <InputField
          id="contactPerson"
          label="Contact Person"
          placeholder="Enter contact person"
          required
          value={manager.state.contactPerson}
          onChangeAction={(e) => manager.setBasicData("contactPerson", e)}
          error={manager.errors.contactPerson?.[0]}
        />
        <InputField
          id="telephone"
          label="Telephone"
          placeholder="Enter telephone number"
          required
          value={manager.state.telephone}
          onChangeAction={(e) => manager.setBasicData("telephone", e)}
          error={manager.errors.telephone?.[0]}
        />
      </div>

      <InputField
        id="Fax"
        label="Fax"
        placeholder="Enter fax number"
        value={manager.state.fax ?? ""}
        onChangeAction={(e) => manager.setBasicData("fax", e)}
        error={manager.errors.fax?.[0]}
      />
    </div>
  );
};

export default BasicDetailsForm;
