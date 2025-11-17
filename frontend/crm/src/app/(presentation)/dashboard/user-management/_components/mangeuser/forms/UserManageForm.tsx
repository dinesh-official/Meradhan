import { Role } from "@/global/constants/role.constants";
import { InputField } from "@/global/elements/inputs/InputField";
import { PhoneField } from "@/global/elements/inputs/PhoneField";
import {
  SelectField,
  SelectOption,
} from "@/global/elements/inputs/SelectField";
import HideForMe from "@/global/elements/permissions/HideForMe";
import useAppCookie from "@/hooks/useAppCookie.hook";
import { IUserDataFormHook, UserFormData } from "./hooks/userForm";

const UserManageForm = ({ manager }: { manager: IUserDataFormHook }) => {
  const { cookies } = useAppCookie();
  return (
    <div className="relative flex flex-col gap-4">
      <InputField
        id="name"
        label="Name"
        placeholder="Enter first name"
        required
        value={manager.state.name}
        onChangeAction={(e) => {
          manager.setUserData("name", e);
        }}
        error={manager?.errors?.name?.[0]}
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
      <PhoneField
        label="Phone Number"
        placeholder="Enter Phone Number"
        required
        value={manager.state.phoneNo}
        onChangeAction={(e) => {
          manager.setUserData("phoneNo", e);
        }}
        error={manager?.errors?.phoneNo?.[0]}
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
