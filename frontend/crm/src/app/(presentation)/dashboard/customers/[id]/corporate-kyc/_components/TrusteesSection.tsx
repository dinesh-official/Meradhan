"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploadField } from "@/global/elements/inputs/FileUploadField";
import { InputField } from "@/global/elements/inputs/InputField";
import { SelectField } from "@/global/elements/inputs/SelectField";
import type { CorporateKycTrusteePayload } from "@root/schema";
import type { CorporateKycFormHook } from "../_hooks/useCorporateKycForm";
import { Plus, Trash2 } from "lucide-react";
import { useCorporateKycFileUpload } from "../_hooks/useCorporateKycFileUpload";

export function TrusteesSection({ hook }: { hook: CorporateKycFormHook }) {
  const { form, errors, setTrustee, addTrustee, removeTrustee } = hook;
  const { uploadFile } = useCorporateKycFileUpload();
  const list = form.trustees ?? [];
  const rowErrors = (i: number): Record<string, string[]> =>
    (errors.trustees?.[i] ?? {}) as Record<string, string[]>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Trustees</CardTitle>
        <Button type="button" variant="outline" size="sm" onClick={addTrustee}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {list.length === 0 && (
          <p className="text-muted-foreground text-xs">No trustees added.</p>
        )}
        {list.map((t: CorporateKycTrusteePayload, index: number) => (
          <div
            key={index}
            className="rounded-lg border p-4 grid gap-3 md:grid-cols-2"
          >
            <div className="md:col-span-2 flex justify-between items-center">
              <span className="text-xs font-medium">Trustee {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeTrustee(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <InputField
              label="Full name"
              required
              value={t.fullName}
              onChangeAction={(v) => setTrustee(index, { fullName: v })}
              error={rowErrors(index).fullName?.[0]}
            />
            <InputField
              label="PAN"
              value={t.pan ?? ""}
              onChangeAction={(v) => setTrustee(index, { pan: v })}
            />
            <FileUploadField
              label="Passport size photo (optional)"
              className="md:col-span-2"
              value={t.passportPhotoFileUrl ?? ""}
              onChangeAction={(v) =>
                setTrustee(index, { passportPhotoFileUrl: v })
              }
              onUpload={(file) => uploadFile(file, "corporate-kyc/trustees")}
              accept=".jpg,.jpeg,.png,.pdf"
              placeholder="Select file or paste URL"
            />
            <FileUploadField
              label="Aadhaar copy (optional)"
              className="md:col-span-2"
              value={t.aadharCopyFileUrl ?? ""}
              onChangeAction={(v) =>
                setTrustee(index, { aadharCopyFileUrl: v })
              }
              onUpload={(file) => uploadFile(file, "corporate-kyc/trustees")}
              accept=".jpg,.jpeg,.png,.pdf"
              placeholder="Select file or paste URL"
            />
            <FileUploadField
              label="PAN copy (optional)"
              className="md:col-span-2"
              value={t.panCopyFileUrl ?? ""}
              onChangeAction={(v) => setTrustee(index, { panCopyFileUrl: v })}
              onUpload={(file) => uploadFile(file, "corporate-kyc/trustees")}
              accept=".jpg,.jpeg,.png,.pdf"
              placeholder="Select file or paste URL"
            />
            <InputField
              label="Designation"
              value={t.designation ?? ""}
              onChangeAction={(v) => setTrustee(index, { designation: v })}
              placeholder="e.g. Managing Trustee, Settlor"
            />
            <InputField
              label="DIN / Identification No."
              value={t.din ?? ""}
              onChangeAction={(v) => setTrustee(index, { din: v })}
            />
            <InputField
              label="Email"
              type="email"
              value={t.email ?? ""}
              onChangeAction={(v) => setTrustee(index, { email: v })}
              error={rowErrors(index).email?.[0]}
            />
            <InputField
              label="Mobile"
              value={t.mobile ?? ""}
              onChangeAction={(v) => setTrustee(index, { mobile: v })}
            />
            <SelectField
              label="Whether Politically Exposed?"
              className="md:col-span-2"
              value={(t.pepDeclaration as unknown as string | undefined) ?? "NA"}
              onChangeAction={(v) =>
                setTrustee(index, {
                  pepDeclaration:
                    v as unknown as CorporateKycTrusteePayload["pepDeclaration"],
                })
              }
              options={[
                { label: "NA", value: "NA" },
                { label: "PEP", value: "PEP" },
                { label: "RPEP", value: "RPEP" },
              ]}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
