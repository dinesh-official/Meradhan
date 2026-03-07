"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputField } from "@/global/elements/inputs/InputField";
import type { CorporateKycFormHook } from "../_hooks/useCorporateKycForm";

export function CorrespondenceAddressSection({
  hook,
}: {
  hook: CorporateKycFormHook;
}) {
  const { form, errors, setField } = hook;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Correspondence address</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <InputField
          label="Full address"
          placeholder="Complete address"
          value={form.correspondenceFullAddress ?? ""}
          onChangeAction={(v) => setField("correspondenceFullAddress", v)}
          className="md:col-span-2"
        />
        <InputField
          label="Line 1"
          value={form.correspondenceLine1 ?? ""}
          onChangeAction={(v) => setField("correspondenceLine1", v)}
        />
        <InputField
          label="Line 2"
          value={form.correspondenceLine2 ?? ""}
          onChangeAction={(v) => setField("correspondenceLine2", v)}
        />
        <InputField
          label="City"
          value={form.correspondenceCity ?? ""}
          onChangeAction={(v) => setField("correspondenceCity", v)}
        />
        <InputField
          label="District"
          value={form.correspondenceDistrict ?? ""}
          onChangeAction={(v) => setField("correspondenceDistrict", v)}
        />
        <InputField
          label="State"
          value={form.correspondenceState ?? ""}
          onChangeAction={(v) => setField("correspondenceState", v)}
        />
        <InputField
          label="PIN code"
          placeholder="6 digits"
          value={form.correspondencePinCode ?? ""}
          onChangeAction={(v) => setField("correspondencePinCode", v)}
          error={errors.correspondencePinCode?.[0]}
        />
      </CardContent>
    </Card>
  );
}
