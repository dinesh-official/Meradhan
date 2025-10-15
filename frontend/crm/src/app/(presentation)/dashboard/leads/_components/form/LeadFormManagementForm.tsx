"use client";
import { InputField } from "@/global/elements/inputs/InputField";
import { PhoneField } from "@/global/elements/inputs/PhoneField";
import { SelectField } from "@/global/elements/inputs/SelectField";
import { BOND_TYPES, LEAD_SOURCES, STATUS } from "./leadfFormData.schema";
import { ILeadDataFormHook, LeadFormData } from "./leadForm";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const LeadFormManagementForm = ({
  manager,
}: {
  manager: ILeadDataFormHook;
}) => {
  return (
    <div className="flex flex-col gap-4 relative">
      <div className="grid md:grid-cols-2 gap-4">
        <InputField
          id="FullName"
          label="Full Name"
          placeholder="Enter full name"
          required
          value={manager.state.fullName}
          onChangeAction={(e) => {
            manager.setLeadData("fullName", e);
          }}
          error={manager?.errors?.fullName?.[0]}
        />

        <InputField
          id="email"
          label="Email Address"
          placeholder="Enter email address"
          type="email"
          required
          value={manager.state.emailId}
          onChangeAction={(e) => {
            manager.setLeadData("emailId", e);
          }}
          error={manager?.errors?.emailId?.[0]}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <PhoneField
          label="Mobile Number"
          defaultCountry="IN"
          placeholder="mobile number"
          required
          value={manager.state.phoneNumber}
          onChangeAction={(e) => {
            manager.setLeadData("phoneNumber", e);
          }}
          error={manager?.errors?.phoneNumber?.[0]}
        />

        <InputField
          id="companyName"
          label="company Name"
          placeholder="Enter Full name"
          required
          value={manager.state.company}
          onChangeAction={(e) => {
            manager.setLeadData("company", e);
          }}
          error={manager?.errors?.company?.[0]}
        />
      </div>
      <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
        <SelectField
          label="Lead Source"
          placeholder="Select Source"
          options={LEAD_SOURCES.map((src) => ({ label: src, value: src }))}
          required
          value={manager.state.leadSource}
          onChangeAction={(e) =>
            manager.setLeadData("leadSource", e as LeadFormData["leadSource"])
          }
          error={manager?.errors?.leadSource?.[0]}
        />

        <SelectField
          label="Status"
          placeholder="Select Status"
          options={STATUS.map((status) => ({ label: status, value: status }))}
          required
          value={manager.state.status}
          onChangeAction={(e) =>
            manager.setLeadData("status", e as LeadFormData["status"])
          }
          error={manager?.errors?.status?.[0]}
        />
      </div>

      <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
        <SelectField
          label="Assign To"
          placeholder="Select team member"
          options={[
            { label: "Individual", value: "1" },
            { label: "Corporate", value: "2" },
          ]}
          value={manager.state.assignTo?.toString()}
          onChangeAction={(e) => manager.setLeadData("assignTo", Number(e))}
          error={manager?.errors?.assignTo?.[0]}
        />

        <SelectField
          label="Bond Type Interest"
          placeholder="Select Bond Type"
          options={BOND_TYPES.map((bond) => ({ label: bond, value: bond }))}
          value={manager.state.bondTypeInterest}
          onChangeAction={(e) =>
            manager.setLeadData(
              "bondTypeInterest",
              e as LeadFormData["bondTypeInterest"]
            )
          }
          error={manager?.errors?.bondTypeInterest?.[0]}
        />
      </div>

      <InputField
        id="expectedInvestmentAmount"
        label="Expected Investment Amount"
        placeholder="Enter amount in INR"
        type="number"
        value={manager.state.expectedInvestmentAmount?.toString() || ""}
        onChangeAction={(e) => {
          if (e) {
            const num = Number(e);
            manager.setLeadData("expectedInvestmentAmount", num);
          }
        }}
        error={manager?.errors?.expectedInvestmentAmount?.[0]}
      />

      <div className="flex flex-col w-full">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Add any additional notes about this lead"
          value={manager.state.notes}
          className="mt-1"
          onChange={(e) => manager.setLeadData("notes", e.target.value)}
        ></Textarea>
      </div>
    </div>
  );
};

export default LeadFormManagementForm;
