"use client";
import { InputField } from "@/global/elements/inputs/InputField";
import { PhoneField } from "@/global/elements/inputs/PhoneField";
import { SelectField } from "@/global/elements/inputs/SelectField";
import { IPartnershipDataFormHook } from "./hooks/partnershipForm";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SelectRoleUser } from "@/global/elements/autocomplete/SelectRoleUser";
import { appSchema } from "@root/schema";

const PartnershipFormManagementForm = ({
  manager,
}: {
  manager: IPartnershipDataFormHook;
}) => {
  return (
    <div className="relative flex flex-col gap-4">
      <div className="gap-4 grid md:grid-cols-2">
        <InputField
          id="organizationName"
          label="Organization Name"
          placeholder="Enter organization name"
          required
          value={manager.state.organizationName}
          onChangeAction={(e) => {
            manager.setPartnershipData("organizationName", e);
          }}
          error={manager?.errors?.organizationName?.[0]}
        />

        <InputField
          id="organizationType"
          label="Organization Type"
          placeholder="Enter organization type"
          required
          value={manager.state.organizationType}
          onChangeAction={(e) => {
            manager.setPartnershipData("organizationType", e);
          }}
          error={manager?.errors?.organizationType?.[0]}
        />
      </div>

      <div className="gap-4 grid md:grid-cols-2">
        <InputField
          id="city"
          label="City"
          placeholder="Enter city"
          required
          value={manager.state.city}
          onChangeAction={(e) => {
            manager.setPartnershipData("city", e);
          }}
          error={manager?.errors?.city?.[0]}
        />

        <InputField
          id="state"
          label="State"
          placeholder="Enter state"
          required
          value={manager.state.state}
          onChangeAction={(e) => {
            manager.setPartnershipData("state", e);
          }}
          error={manager?.errors?.state?.[0]}
        />
      </div>

      <div className="gap-4 grid md:grid-cols-2">
        <InputField
          id="website"
          label="Website / Company Profile URL"
          placeholder="https://example.com"
          type="url"
          value={manager.state.website}
          onChangeAction={(e) => {
            manager.setPartnershipData("website", e);
          }}
          error={manager?.errors?.website?.[0]}
        />

        <SelectField
          label="Partnership Model"
          placeholder="Select partnership model"
          options={appSchema.crm.partnership.partnershipModels.map((model) => ({
            label: model
              .replace("-", " / ")
              .replace(/\b\w/g, (l) => l.toUpperCase()),
            value: model,
          }))}
          value={manager.state.partnershipModel}
          onChangeAction={(value) => {
            manager.setPartnershipData(
              "partnershipModel",
              value as (typeof appSchema.crm.partnership.partnershipModels)[number]
            );
          }}
          error={manager?.errors?.partnershipModel?.[0]}
        />
      </div>

      <div className="gap-4 grid md:grid-cols-2">
        <InputField
          id="fullName"
          label="Contact Person - Full Name"
          placeholder="Enter full name"
          required
          value={manager.state.fullName}
          onChangeAction={(e) => {
            manager.setPartnershipData("fullName", e);
          }}
          error={manager?.errors?.fullName?.[0]}
        />

        <InputField
          id="designation"
          label="Designation"
          placeholder="Enter designation"
          required
          value={manager.state.designation}
          onChangeAction={(e) => {
            manager.setPartnershipData("designation", e);
          }}
          error={manager?.errors?.designation?.[0]}
        />
      </div>

      <div className="gap-4 grid md:grid-cols-2">
        <InputField
          id="emailAddress"
          label="Email Address"
          placeholder="Enter email address"
          type="email"
          required
          value={manager.state.emailAddress}
          onChangeAction={(e) => {
            manager.setPartnershipData("emailAddress", e);
          }}
          error={manager?.errors?.emailAddress?.[0]}
        />

        <PhoneField
          label="Mobile Number"
          defaultCountry="IN"
          placeholder="mobile number"
          required
          value={manager.state.mobileNumber}
          onChangeAction={(e) => {
            manager.setPartnershipData("mobileNumber", e);
          }}
          error={manager?.errors?.mobileNumber?.[0]}
        />
      </div>

      <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
        <SelectField
          label="Status"
          placeholder="Select Status"
          options={appSchema.crm.partnership.partnershipStatus.map(
            (status) => ({
              label: status,
              value: status,
            })
          )}
          value={manager.state.status}
          onChangeAction={(value) => {
            manager.setPartnershipData(
              "status",
              value as (typeof appSchema.crm.partnership.partnershipStatus)[number]
            );
          }}
          error={manager?.errors?.status?.[0]}
        />

        <div>
          <Label>Assign To</Label>
          <SelectRoleUser
            value={manager.relationManager.relationManager}
            onSelect={(user) => {
              manager.relationManager.setRelationManager(user ?? undefined);
              manager.setPartnershipData("assignTo", user?.id);
            }}
          />
        </div>
      </div>

      <div>
        <InputField
          id="clientBase"
          label="Client Base / AUM (Optional)"
          placeholder="Enter approximate client base or AUM"
          value={manager.state.clientBase || ""}
          onChangeAction={(e) => {
            manager.setPartnershipData("clientBase", e);
          }}
          error={manager?.errors?.clientBase?.[0]}
        />
      </div>

      <div>
        <Label>Message / Description</Label>
        <Textarea
          placeholder="Tell us about your business and how you'd like to partner with MeraDhan"
          value={manager.state.message || ""}
          onChange={(e) => {
            manager.setPartnershipData("message", e.target.value);
          }}
          className="min-h-[120px]"
        />
        {manager?.errors?.message?.[0] && (
          <p className="text-sm text-destructive mt-1">
            {manager.errors.message[0]}
          </p>
        )}
      </div>
    </div>
  );
};

export default PartnershipFormManagementForm;
