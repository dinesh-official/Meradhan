import { InputField } from "@/global/elements/inputs/InputField";
import {
  SelectField,
  SelectOption,
} from "@/global/elements/inputs/SelectField";
import React from "react";
import { IUserDataFormHook, UserFormData } from "./userForm";
import { Role } from "@/global/constants/role.constants";

const UserManageForm = ({ manager }: { manager: IUserDataFormHook }) => {
  return (
    <div className="flex flex-col gap-4 relative">
      <InputField
        id="firstName"
        label="First Name"
        placeholder="Enter first name"
        required
        value={manager.state.fullname}
        onChangeAction={(e) => {
          manager.setUserData("fullname", e);
        }}
        error={manager?.errors?.fullname?.[0]}
      />

      <InputField
        id="email"
        label="Email Address"
        placeholder="Enter email address"
        type="email"
        required
        value={manager.state.email}
        onChangeAction={(e) => {
          manager.setUserData("email", e);
        }}
        error={manager?.errors?.email?.[0]}
      />
      <InputField
        id="password"
        label="Enter Password"
        placeholder="Password"
        type="password"
        required
        value={manager.state.password}
        onChangeAction={(e) => {
          manager.setUserData("password", e);
        }}
        error={manager?.errors?.password?.[0]}
      />

      <SelectField
        label="Select Role"
        placeholder="Select Role"
        options={
          [
            { label: "Viewer", value: "VIEWER" },
            { label: "Sales", value: "SALES" },
            { label: "Relationship manager", value: "RELATIONSHIP_MANAGER" },
            { label: "Admin", value: "ADMIN" },
            { label: "Support", value: "SUPPORT" },
          ] as (SelectOption & { value: Role })[]
        }
        value={manager.state.role}
        onChangeAction={(e) => {
          manager.setUserData("role", e as UserFormData["role"]);
        }}
        error={manager?.errors?.role?.[0]}
      />
    </div>
  );
};

export default UserManageForm;
