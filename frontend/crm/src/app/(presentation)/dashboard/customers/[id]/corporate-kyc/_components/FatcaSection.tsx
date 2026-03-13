"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputField } from "@/global/elements/inputs/InputField";
import { SelectField } from "@/global/elements/inputs/SelectField";
import type { SelectOption } from "@/global/elements/inputs/SelectField";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { CreateCorporateKycPayload } from "@root/schema";
import type { CorporateKycFormHook } from "../_hooks/useCorporateKycForm";

const FATCA_ENTITY_OPTIONS: SelectOption[] = [
  { value: "ACTIVE_NFE", label: "Active NFE" },
  { value: "PASSIVE_NFE", label: "Passive NFE" },
  { value: "FINANCIAL_INSTITUTION", label: "Financial Institution" },
];

export function FatcaSection({ hook }: { hook: CorporateKycFormHook }) {
  const { form, setField } = hook;
  return (
    <Card>
      <CardHeader>
        <CardTitle>FATCA</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="flex items-center gap-2 md:col-span-2">
          <Switch
            checked={form.fatcaApplicable}
            onCheckedChange={(v) => setField("fatcaApplicable", v)}
          />
          <Label>FATCA applicable</Label>
        </div>
        {form.fatcaApplicable && (
          <>
            <InputField
              label="FATCA entity name"
              value={form.fatcaEntityName ?? ""}
              onChangeAction={(v) => setField("fatcaEntityName", v)}
            />
            <InputField
              label="FATCA country of incorporation"
              value={form.fatcaCountryOfIncorporation ?? ""}
              onChangeAction={(v) =>
                setField("fatcaCountryOfIncorporation", v)
              }
            />
            <SelectField
              label="FATCA entity type"
              placeholder="Select"
              value={
                (form.fatcaEntityType as CreateCorporateKycPayload["fatcaEntityType"]) ?? ""
              }
              onChangeAction={(v) =>
                setField(
                  "fatcaEntityType",
                  v
                    ? (v as CreateCorporateKycPayload["fatcaEntityType"])
                    : undefined
                )
              }
              options={FATCA_ENTITY_OPTIONS}
            />
            <InputField
              label="FATCA classification"
              value={form.fatcaClassification ?? ""}
              onChangeAction={(v) => setField("fatcaClassification", v)}
            />
            <InputField
              label="GIIN"
              value={form.giin ?? ""}
              onChangeAction={(v) => setField("giin", v)}
            />
            <InputField
              label="Tax residency of entity"
              value={form.taxResidencyOfEntity ?? ""}
              onChangeAction={(v) => setField("taxResidencyOfEntity", v)}
            />
            <div className="flex items-center gap-2 md:col-span-2">
              <Switch
                checked={form.declarationByAuthorisedSignatory}
                onCheckedChange={(v) =>
                  setField("declarationByAuthorisedSignatory", v)
                }
              />
              <Label>Declaration by authorised signatory</Label>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
