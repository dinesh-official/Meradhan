"use client";
import { Label } from "@/components/ui/label";
import { SelectRoleUser } from "@/global/elements/autocomplete/SelectRoleUser";
import { InputField } from "@/global/elements/inputs/InputField";
import { RadioYesNoField } from "@/global/elements/inputs/RadioYesNoField";
import { SelectField } from "@/global/elements/inputs/SelectField";
import { UserAccountType } from "../../../../../../../../../../packages/schema/lib/customers/customers.schema";
import { gender } from "../../../../../../../../../../packages/schema/lib/enums";
import { CustomerFormData, ICustomerDataFormHook } from "./customerForm";

const LEGAL_ENTITY_LABEL_BY_USER_TYPE: Partial<
  Record<CustomerFormData["userType"], { label: string; placeholder: string }>
> = {
  CORPORATE: { label: "Company Name", placeholder: "Enter company name" },
  TRUST: { label: "Trust Name", placeholder: "Enter trust name" },
  HUF: { label: "HUF Name", placeholder: "Enter HUF name" },
  LLP: { label: "LLP Name", placeholder: "Enter LLP name" },
  PARTNERSHIP_FIRM: {
    label: "Partnership Firm Name",
    placeholder: "Enter partnership firm name",
  },
};

function getLegalEntityLabel(userType: CustomerFormData["userType"]) {
  return (
    LEGAL_ENTITY_LABEL_BY_USER_TYPE[userType] ?? {
      label: "Legal entity name",
      placeholder: "Enter legal entity name",
    }
  );
}

function CustomerManagementForm({
  manager,
  updateMode,
}: {
  manager: ICustomerDataFormHook;
  updateMode?: boolean;
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
          onChangeAction={(e) => manager.setCustomerData("firstName", e)}
          error={manager?.errors?.firstName?.[0]}
        />

        <InputField
          id="middleName"
          label="Middle Name"
          placeholder="Enter middle name"
          value={manager.state.middleName ?? undefined}
          onChangeAction={(e) => manager.setCustomerData("middleName", e)}
          error={manager?.errors?.middleName?.[0]}
        />

        <InputField
          id="lastName"
          label="Last Name"
          placeholder="Enter last name"
          required
          value={manager.state.lastName}
          onChangeAction={(e) => manager.setCustomerData("lastName", e)}
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
        value={`${manager.state.firstName || ""} ${manager.state.middleName || ""
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
          onChangeAction={(e) => manager.setCustomerData("emailId", e)}
          error={manager?.errors?.emailId?.[0]}
        />

        <InputField
          label="Mobile Number"
          placeholder="mobile number"
          required
          value={manager.state.phoneNo}
          onChangeAction={(e) => manager.setCustomerData("phoneNo", e)}
          error={manager?.errors?.phoneNo?.[0]}
        />
      </div>

      <InputField
        label="WhatsApp Phone Number"

        placeholder="WhatsApp number"
        required
        value={manager.state.whatsAppNo?.toString()}
        onChangeAction={(e) => manager.setCustomerData("whatsAppNo", e)}
        error={manager?.errors?.whatsAppNo?.[0]}
      />

      <div className="grid md:grid-cols-2 gap-4">
        <SelectField
          label="User Type"
          placeholder="Individual"
          defaultValue="individual"
          options={UserAccountType.map((g) => ({
            label: g.charAt(0).toUpperCase() + g.slice(1),
            value: g,
          }))}
          required
          value={manager.state.userType}
          onChangeAction={(e) =>
            manager.setCustomerData(
              "userType",
              e as CustomerFormData["userType"]
            )
          }
          error={manager?.errors?.userType?.[0]}
        />

        {["INDIVIDUAL", "INDIVIDUAL_NRI_NRO"].includes(
          manager.state.userType
        ) ? (
          <SelectField
            label="Gender"
            placeholder="Select Gender"
            options={gender.map((g) => ({
              label: g.charAt(0).toUpperCase() + g.slice(1),
              value: g,
            }))}
            required
            value={manager.state.gender ?? ""}
            onChangeAction={(e) =>
              manager.setCustomerData("gender", e as CustomerFormData["gender"])
            }
            error={manager?.errors?.gender?.[0]}
          />
        ) : (
          null
        )}

        {["TRUST", "CORPORATE", "HUF", "LLP", "PARTNERSHIP_FIRM"].includes(
          manager.state.userType
        ) ? (
          <InputField
            id="legalEntityName"
            {...getLegalEntityLabel(manager.state.userType)}
            required
            value={manager.state.legalEntityName ?? ""}
            onChangeAction={(e) =>
              manager.setCustomerData("legalEntityName", e)
            }
            error={manager?.errors?.legalEntityName?.[0]}
          />
        ) : (
          <div />
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <InputField
          id="userName"
          label="Username"
          placeholder={updateMode ? "" : "Auto-generated after create"}
          disabled
          value={manager.state.userName ?? ""}
        />
        <div />
      </div>

      <div className="flex lg:flex-row gap-5 flex-col justify-between ">
        <RadioYesNoField
          id="terms"
          label="Terms Accepted"
          required
          defaultValue="no"
          value={manager.state.termsAccepted ? "yes" : "no"}
          onChangeAction={(e) =>
            manager.setCustomerData("termsAccepted", e == "yes")
          }
        // error = {manager?.errors?.termsAccepted?.[0]}
        />
        <RadioYesNoField
          id="wa"
          label="WhatsApp Notification Accepted"
          defaultValue="no"
          value={manager.state.whatsAppNotificationAllow ? "yes" : "no"}
          onChangeAction={(e) =>
            manager.setCustomerData("whatsAppNotificationAllow", e == "yes")
          }
        />
        <RadioYesNoField
          id="emailConfirmed"
          label="Email Confirmed"
          defaultValue="no"
          value={manager.state.isEmailVerified ? "yes" : "no"}
          onChangeAction={(e) =>
            manager.setCustomerData("isEmailVerified", e == "yes")
          }
        />
        <RadioYesNoField
          id="mobileConfirmed"
          label="Mobile Confirmed"
          defaultValue="no"
          value={manager.state.isPhoneVerified ? "yes" : "no"}
          onChangeAction={(e) =>
            manager.setCustomerData("isPhoneVerified", e == "yes")
          }
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
          onChangeAction={(e) =>
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
            { label: "Suspended", value: "SUSPENDED" },
          ]}
          value={manager.state.status}
          onChangeAction={(e) =>
            manager.setCustomerData("status", e as CustomerFormData["status"])
          }
          required
          error={manager?.errors?.status?.[0]}
        />
      </div>

      {/* Relationship Manager + Total Investment */}

      <div className="flex flex-col gap-2">
        <Label>Relationship Manager</Label>
        <SelectRoleUser
          role="RELATIONSHIP_MANAGER"
          placeholder="Select relationship manager"
          value={manager.relationManager.relationManager ?? undefined} // shows selected name
          onSelect={(user) => {
            if (user) {
              manager.relationManager.setRelationManager(user);
              manager.setCustomerData(
                "relationshipManagerId",
                user ? user.id : undefined
              );
            }
          }}
        />
      </div>

      {/* Password */}

      {!updateMode && (
        <InputField
          id="password"
          label="Password"
          placeholder="Enter Password"
          type="password"
          value={manager.state.password}
          onChangeAction={(e) => manager.setCustomerData("password", e)}
          error={manager?.errors?.password?.[0]}
        />
      )}
    </div>
  );
}

export default CustomerManagementForm;
