"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputField } from "@/global/elements/inputs/InputField";
import { SelectField } from "@/global/elements/inputs/SelectField";
import type { SelectOption } from "@/global/elements/inputs/SelectField";
import type { CreateCorporateKycPayload } from "@root/schema";
import type { CorporateKycFormHook } from "../_hooks/useCorporateKycForm";

const ENTITY_CONSTITUTION_OPTIONS: SelectOption[] = [
  { value: "PRIVATE_LIMITED", label: "Private Limited" },
  { value: "PUBLIC_LIMITED", label: "Public Limited" },
  { value: "OPC", label: "OPC" },
  { value: "LLP", label: "LLP" },
  { value: "PARTNERSHIP", label: "Partnership" },
  { value: "TRUST", label: "Trust" },
  { value: "OTHER", label: "Other" },
];

export function EntityDetailsSection({ hook }: { hook: CorporateKycFormHook }) {
  const { form, errors, setField } = hook;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Entity details</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <InputField
          label="Entity name"
          placeholder="Legal entity name"
          required
          value={form.entityName}
          onChangeAction={(v) => setField("entityName", v)}
          error={errors.entityName?.[0]}
        />
        <InputField
          label="Date of commencement of business"
          type="date"
          value={form.dateOfCommencementOfBusiness ?? ""}
          onChangeAction={(v) => setField("dateOfCommencementOfBusiness", v)}
          error={errors.dateOfCommencementOfBusiness?.[0]}
        />
        <InputField
          label="Country of incorporation"
          placeholder="e.g. India"
          value={form.countryOfIncorporation ?? ""}
          onChangeAction={(v) => setField("countryOfIncorporation", v)}
        />
        <SelectField
          label="Entity constitution type"
          placeholder="Select"
          value={form.entityConstitutionType ?? ""}
          onChangeAction={(v) =>
            setField(
              "entityConstitutionType",
              v ? (v as CreateCorporateKycPayload["entityConstitutionType"]) : undefined
            )
          }
          options={ENTITY_CONSTITUTION_OPTIONS}
        />
        {form.entityConstitutionType === "OTHER" && (
          <InputField
            label="Other constitution type"
            value={form.otherConstitutionType ?? ""}
            onChangeAction={(v) => setField("otherConstitutionType", v)}
          />
        )}
        <InputField
          label="Date of incorporation"
          type="date"
          value={form.dateOfIncorporation ?? ""}
          onChangeAction={(v) => setField("dateOfIncorporation", v)}
        />
        <InputField
          label="Place of incorporation"
          value={form.placeOfIncorporation ?? ""}
          onChangeAction={(v) => setField("placeOfIncorporation", v)}
        />
        <InputField
          label="PAN number"
          placeholder="ABCDE1234F"
          value={form.panNumber ?? ""}
          onChangeAction={(v) => setField("panNumber", v)}
          error={errors.panNumber?.[0]}
        />
        <InputField
          label="CIN / Registration number"
          value={form.cinOrRegistrationNumber ?? ""}
          onChangeAction={(v) => setField("cinOrRegistrationNumber", v)}
        />
      </CardContent>
    </Card>
  );
}
