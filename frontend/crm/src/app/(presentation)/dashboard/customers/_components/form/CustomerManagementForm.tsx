"use client";
import { InputField } from "@/global/elements/inputs/InputField";
import { PhoneField } from "@/global/elements/inputs/PhoneField";
import { RadioYesNoField } from "@/global/elements/inputs/RadioYesNoField";
import { SelectField } from "@/global/elements/inputs/SelectField";
import { CustomerFormData, ICustomerDataFormHook } from "./customerForm";

function CustomerManagementForm({
  manager,
}: {
  manager: ICustomerDataFormHook;
}) {
  return (
    <div className="flex flex-col  gap-4 relative">
      {/* First / Middle / Last Name */}
      <div className="grid lg:grid-cols-3 gap-3">
        <InputField
          id="firstName"
          label="First Name"
          placeholder="Enter first name"
          required
          value={manager.state.firstName}
          onChange={(e) => manager.setCustomerData("firstName", e)}
          error={manager?.errors?.firstName?.[0]}
        />

        <InputField
          id="middleName"
          label="Middle Name"
          placeholder="Enter middle name"
          value={manager.state.middleName}
          onChange={(e) => manager.setCustomerData("middleName", e)}
          error={manager?.errors?.middleName?.[0]}
        />

        <InputField
          id="lastName"
          label="Last Name"
          placeholder="Enter last name"
          required
          value={manager.state.lastName}
          onChange={(e) => manager.setCustomerData("lastName", e)}
          error={manager?.errors?.lastName?.[0]}
        />
      </div>

      {/* Full Name + Email */}

      <InputField
        id="fullName"
        label="Full Name (Auto-generated)"
        placeholder="Auto-generated from name fields"
        disabled
        required
        value={`${manager.state.firstName || ""} ${
          manager.state.middleName || ""
        } ${manager.state.lastName || ""}`}
      />

      <div className="grid md:grid-cols-2 gap-4">
        <InputField
          id="email"
          label="Email Address"
          placeholder="Enter email address"
          type="email"
          required
          value={manager.state.emailId}
          onChange={(e) => manager.setCustomerData("emailId", e)}
          error={manager?.errors?.emailId?.[0]}
        />

        <PhoneField
          label="Mobile Number"
          defaultCountry="IN"
          placeholder="mobile number"
          required
          value={manager.state.mobileNo}
          onChange={(e) => manager.setCustomerData("mobileNo", e)}
          error={manager?.errors?.mobileNo?.[0]}
        />
      </div>

      <PhoneField
        label="WhatsApp Phone Number"
        defaultCountry="IN"
        placeholder="WhatsApp number"
        required
        value={manager.state.whatsAppNumber?.toString()}
        onChange={(e) => manager.setCustomerData("whatsAppNumber", e)}
        error={manager?.errors?.whatsAppNumber?.[0]}
      />

      <div className="grid md:grid-cols-2 gap-4">
        <SelectField
          label="User Type"
          placeholder="Individual"
          defaultValue="individual"
          options={[
            { label: "Individual", value: "individual" },
            { label: "Corporate", value: "corporate" },
          ]}
          required
          value={manager.state.userType}
          onChange={(e) => manager.setCustomerData("userType", e)}
          error={manager?.errors?.userType?.[0]}
        />
        <InputField
          id="username"
          label="Username"
          placeholder="Enter username"
          required
          value={manager.state.userName}
          onChange={(e) => manager.setCustomerData("userName", e)}
          error={manager?.errors?.userName?.[0]}
        />
      </div>

      <div className="flex lg:flex-row gap-5 flex-col justify-between ">
        <RadioYesNoField
          id="terms"
          label="Terms Accepted"
          required
          defaultValue="no"
          value={manager.state.termsAccept ? "yes" : "no"}
          onChange={(e) => manager.setCustomerData("termsAccept", e == "yes")}
        />
        <RadioYesNoField
          id="wa"
          label="WhatsApp Notification Accepted"
          defaultValue="no"
          value={manager.state.whatsAppNotificationAccept ? "yes" : "no"}
          onChange={(e) =>
            manager.setCustomerData("whatsAppNotificationAccept", e == "yes")
          }
        />
        <RadioYesNoField
          id="emailConfirmed"
          label="Email Confirmed"
          defaultValue="no"
          value={manager.state.emailConfirmed ? "yes" : "no"}
          onChange={(e) =>
            manager.setCustomerData("emailConfirmed", e == "yes")
          }
        />
        <RadioYesNoField
          id="mobileConfirmed"
          label="Mobile Confirmed"
          defaultValue="no"
          value={manager.state.mobileConfirm ? "yes" : "no"}
          onChange={(e) => manager.setCustomerData("mobileConfirm", e == "yes")}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <SelectField
          label="KYC Status"
          placeholder="Pending"
          defaultValue={manager.state.kycStatus}
          options={[
            { label: "Pending", value: "PENDING" },
            { label: "Approved", value: "APPROVED", disabled: true },
            { label: "Rejected", value: "REJECTED" },
          ]}
          required
          value={manager.state.kycStatus}
          onChange={(e) =>
            manager.setCustomerData(
              "kycStatus",
              e as CustomerFormData["kycStatus"]
            )
          }
          error={manager?.errors?.kycStatus?.[0]}
        />

        <SelectField
          label="Status"
          defaultValue={manager.state.status}
          options={[
            { label: "Active", value: "ACTIVE" },
            { label: "Inactive", value: "SUSPENDED" },
          ]}
          value={manager.state.status}
          onChange={(e) =>
            manager.setCustomerData("status", e as CustomerFormData["status"])
          }
          required
          error={manager?.errors?.status?.[0]}
        />
      </div>

      {/* Relationship Manager + Total Investment */}

      <SelectField
        label="Relationship Manager"
        placeholder="Select relationship manager"
        defaultValue={manager.state.relationshipManagerId?.toString()}
        options={[
          { label: "Manager 1", value: "1" },
          { label: "Manager 2", value: "2" },
        ]}
        value={manager.state.relationshipManagerId?.toString()}
        onChange={(e) =>
          manager.setCustomerData("relationshipManagerId", Number(e))
        }
        error={manager?.errors?.relationshipManagerId?.[0]}
      />

      <InputField
        id="investment"
        label="Total Investment"
        placeholder="Enter total investment amount"
        value={manager.state.totalInvestment?.toString()}
        onChange={(e) => manager.setCustomerData("totalInvestment", Number(e))}
        error={manager?.errors?.totalInvestment?.[0]}
      />

      {/* Password */}

      <InputField
        id="password"
        label="Password"
        placeholder="Enter Password"
        type="password"
        value={manager.state.password}
        onChange={(e) => manager.setCustomerData("password", e)}
        error={manager?.errors?.password?.[0]}
      />
    </div>
  );
}

export default CustomerManagementForm;
