"use client";
import { InputField } from "@/global/elements/inputs/InputField";
import { PhoneField } from "@/global/elements/inputs/PhoneField";
import { SelectField } from "@/global/elements/inputs/SelectField";
import { ILeadDataFormHook, LeadFormData } from "./leadForm";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { bonds, source, status } from "../../../../../../../../../../packages/schema/lib/crm/leads.schema";

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
          value={manager.state.emailAddress}
          onChangeAction={(e) => {
            manager.setLeadData("emailAddress", e);
          }}
          error={manager?.errors?.emailAddress?.[0]}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <PhoneField
          label="Mobile Number"
          defaultCountry="IN"
          placeholder="mobile number"
          required
          value={manager.state.phoneNo}
          onChangeAction={(e) => {
            manager.setLeadData("phoneNo", e);
          }}
          error={manager?.errors?.phoneNo?.[0]}
        />

        <InputField
          id="companyName"
          label="company Name"
          placeholder="Enter Full name"
          required
          value={manager.state.companyName}
          onChangeAction={(e) => {
            manager.setLeadData("companyName", e);
          }}
          error={manager?.errors?.companyName?.[0]}
        />
      </div>
      <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
        <SelectField
          label="Lead Source"
          placeholder="Select Source"
          options={source.map((src) => ({ label: src, value: src }))}
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
          options={status.map((status) => ({ label: status, value: status }))}
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
          options={bonds.map((bond) => ({ label: bond, value: bond }))}
          value={manager.state.bondType}
          onChangeAction={(e) =>
            manager.setLeadData(
              "bondType",
              e as LeadFormData["bondType"]
            )
          }
          error={manager?.errors?.bondType?.[0]}
        />
      </div>

      <InputField
        id="expectedInvestmentAmount"
        label="Expected Investment Amount"
        placeholder="Enter amount in INR"
        type="number"
        value={manager.state.exInvestmentAmount?.toString() || ""}
        onChangeAction={(e) => {
          if (e) {
            const num = Number(e);
            manager.setLeadData("exInvestmentAmount", num);
          }
        }}
        error={manager?.errors?.exInvestmentAmount?.[0]}
      />

      <div className="flex flex-col w-full">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Add any additional notes about this lead"
          value={manager.state.note}
          className="mt-1"
          onChange={(e) => manager.setLeadData("note", e.target.value)}
        ></Textarea>
      </div>
    </div>
  );
};

export default LeadFormManagementForm;
