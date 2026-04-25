"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FileUploadField } from "@/global/elements/inputs/FileUploadField";
import { InputField } from "@/global/elements/inputs/InputField";
import { useCorporateKycFileUpload } from "../_hooks/useCorporateKycFileUpload";
import type { CorporateKycFormHook } from "../_hooks/useCorporateKycForm";
import { useState } from "react";

function copyCorrespondenceToRegistered(hook: CorporateKycFormHook) {
  const { form, setField } = hook;
  setField("registeredFullAddress", form.correspondenceFullAddress ?? "");
  setField("registeredLine1", form.correspondenceLine1 ?? "");
  setField("registeredLine2", form.correspondenceLine2 ?? "");
  setField("registeredLine3", form.correspondenceLine3 ?? "");
  setField("registeredCity", form.correspondenceCity ?? "");
  setField("registeredDistrict", form.correspondenceDistrict ?? "");
  setField("registeredState", form.correspondenceState ?? "");
  setField("registeredPinCode", form.correspondencePinCode ?? "");
  setField(
    "registeredAddressProofCopyUrl",
    form.correspondenceAddressProofCopyUrl ?? "",
  );
}

export function RegisteredAddressSection({ hook }: { hook: CorporateKycFormHook }) {
  const { form, errors, setField } = hook;
  const { uploadFile } = useCorporateKycFileUpload();
  const [sameAsCorrespondence, setSameAsCorrespondence] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="text-sm">Registered address</CardTitle>
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground select-none">
          <Checkbox
            checked={sameAsCorrespondence}
            onCheckedChange={(checked) => {
              const on = checked === true || checked === "indeterminate";
              setSameAsCorrespondence(on);
              if (on) copyCorrespondenceToRegistered(hook);
            }}
          />
          Same as correspondence address
        </label>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        <InputField
          label="Full address"
          placeholder="Complete address"
          value={form.registeredFullAddress ?? ""}
          onChangeAction={(v) => setField("registeredFullAddress", v)}
          className="md:col-span-2"
        />
        <InputField
          label="Line 1"
          value={form.registeredLine1 ?? ""}
          onChangeAction={(v) => setField("registeredLine1", v)}
        />
        <InputField
          label="Line 2"
          value={form.registeredLine2 ?? ""}
          onChangeAction={(v) => setField("registeredLine2", v)}
        />
        <InputField
          label="Line 3"
          value={form.registeredLine3 ?? ""}
          onChangeAction={(v) => setField("registeredLine3", v)}
        />
        <InputField
          label="City"
          value={form.registeredCity ?? ""}
          onChangeAction={(v) => setField("registeredCity", v)}
        />
        <InputField
          label="District"
          value={form.registeredDistrict ?? ""}
          onChangeAction={(v) => setField("registeredDistrict", v)}
        />
        <InputField
          label="State"
          value={form.registeredState ?? ""}
          onChangeAction={(v) => setField("registeredState", v)}
        />
        <InputField
          label="PIN code"
          placeholder="6 digits"
          value={form.registeredPinCode ?? ""}
          onChangeAction={(v) => setField("registeredPinCode", v)}
          error={(errors as { registeredPinCode?: string[] }).registeredPinCode?.[0]}
        />
        <FileUploadField
          label="Address proof copy"
          value={form.registeredAddressProofCopyUrl ?? ""}
          onChangeAction={(v) => setField("registeredAddressProofCopyUrl", v)}
          onUpload={(file) => uploadFile(file, "corporate-kyc/address-proof")}
          accept=".pdf,.jpg,.jpeg,.png"
          placeholder="Select file or paste URL"
          className="md:col-span-2"
        />
      </CardContent>
    </Card>
  );
}

