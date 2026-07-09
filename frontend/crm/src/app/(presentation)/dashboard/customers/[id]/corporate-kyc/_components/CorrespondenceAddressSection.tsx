"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploadField } from "@/global/elements/inputs/FileUploadField";
import { InputField } from "@/global/elements/inputs/InputField";
import { SelectField } from "@/global/elements/inputs/SelectField";
import type { CorporateKycFormHook } from "../_hooks/useCorporateKycForm";
import { useCorporateKycFileUpload } from "../_hooks/useCorporateKycFileUpload";
import { addressProofOptions } from "../_utils/addressProofOptions";
import { stateOptions } from "../_utils/stateOptions";

export function CorrespondenceAddressSection({
  hook,
}: {
  hook: CorporateKycFormHook;
}) {
  const { form, errors, setField } = hook;
  const { uploadFile } = useCorporateKycFileUpload();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Correspondence address</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
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
          label="Line 3"
          value={form.correspondenceLine3 ?? ""}
          onChangeAction={(v) => setField("correspondenceLine3", v)}
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
        <SelectField
          label="State"
          placeholder="Select state"
          value={form.correspondenceState ?? ""}
          onChangeAction={(v) => setField("correspondenceState", v)}
          options={stateOptions}
        />
        <InputField
          label="PIN code"
          placeholder="6 digits"
          value={form.correspondencePinCode ?? ""}
          onChangeAction={(v) => setField("correspondencePinCode", v)}
          error={errors.correspondencePinCode?.[0]}
        />
        <SelectField
          label="Address proof type"
          placeholder="Select address proof type"
          value={form.correspondenceAddressProofType ?? ""}
          onChangeAction={(v) => setField("correspondenceAddressProofType", v)}
          options={addressProofOptions}
        />
        <FileUploadField
          label="Address proof copy"
          value={form.correspondenceAddressProofCopyUrl ?? ""}
          onChangeAction={(v) => setField("correspondenceAddressProofCopyUrl", v)}
          onUpload={(file) => uploadFile(file, "corporate-kyc/address-proof")}
          accept=".pdf,.jpg,.jpeg,.png"
          placeholder="Select file or paste URL"
          className="md:col-span-2"
        />
      </CardContent>
    </Card>
  );
}
