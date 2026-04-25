"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploadField } from "@/global/elements/inputs/FileUploadField";
import { InputField } from "@/global/elements/inputs/InputField";
import { SelectField } from "@/global/elements/inputs/SelectField";
import type { CorporateKycAuthorisedSignatoryPayload } from "@root/schema";
import type { CorporateKycFormHook } from "../_hooks/useCorporateKycForm";
import { Plus, Trash2 } from "lucide-react";
import { useCorporateKycFileUpload } from "../_hooks/useCorporateKycFileUpload";

export function AuthorisedSignatoriesSection({
  hook,
}: {
  hook: CorporateKycFormHook;
}) {
  const {
    form,
    errors,
    setAuthorisedSignatory,
    addAuthorisedSignatory,
    removeAuthorisedSignatory,
  } = hook;
  const { uploadFile } = useCorporateKycFileUpload();
  const list = form.authorisedSignatories ?? [];
  const rowErrors = (i: number): Record<string, string[]> =>
    (errors.authorisedSignatories?.[i] ?? {}) as Record<string, string[]>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Authorised signatories</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addAuthorisedSignatory}
        >
          <Plus className="h-4 w-4" /> Add
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {list.length === 0 && (
          <p className="text-muted-foreground text-xs">
            No authorised signatories added.
          </p>
        )}
        {list.map((s: CorporateKycAuthorisedSignatoryPayload, index: number) => (
          <div
            key={index}
            className="rounded-lg border p-4 grid gap-3 md:grid-cols-2"
          >
            <div className="md:col-span-2 flex justify-between items-center">
              <span className="text-xs font-medium">Signatory {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeAuthorisedSignatory(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <InputField
              label="Full name"
              required
              value={s.fullName}
              onChangeAction={(v) =>
                setAuthorisedSignatory(index, { fullName: v })
              }
              error={rowErrors(index).fullName?.[0]}
            />
            <InputField
              label="PAN"
              required
              value={s.pan}
              onChangeAction={(v) => setAuthorisedSignatory(index, { pan: v })}
              error={rowErrors(index).pan?.[0]}
            />
            <FileUploadField
              label="Signature (optional)"
              className="md:col-span-2"
              value={(s as unknown as { signatureFileUrl?: string }).signatureFileUrl ?? ""}
              onChangeAction={(v) =>
                setAuthorisedSignatory(index, {
                  signatureFileUrl: v,
                } as unknown as Partial<CorporateKycAuthorisedSignatoryPayload>)
              }
              onUpload={(file) =>
                uploadFile(file, "corporate-kyc/authorised-signatories")
              }
              accept=".jpg,.jpeg,.png,.pdf"
              placeholder="Select file or paste URL"
            />
            <FileUploadField
              label="Passport size photo (optional)"
              className="md:col-span-2"
              value={s.passportPhotoFileUrl ?? ""}
              onChangeAction={(v) =>
                setAuthorisedSignatory(index, { passportPhotoFileUrl: v })
              }
              onUpload={(file) =>
                uploadFile(file, "corporate-kyc/authorised-signatories")
              }
              accept=".jpg,.jpeg,.png,.pdf"
              placeholder="Select file or paste URL"
            />
            <FileUploadField
              label="Aadhaar copy (optional)"
              className="md:col-span-2"
              value={s.aadharCopyFileUrl ?? ""}
              onChangeAction={(v) =>
                setAuthorisedSignatory(index, { aadharCopyFileUrl: v })
              }
              onUpload={(file) =>
                uploadFile(file, "corporate-kyc/authorised-signatories")
              }
              accept=".jpg,.jpeg,.png,.pdf"
              placeholder="Select file or paste URL"
            />
            <FileUploadField
              label="PAN copy (optional)"
              className="md:col-span-2"
              value={s.panCopyFileUrl ?? ""}
              onChangeAction={(v) =>
                setAuthorisedSignatory(index, { panCopyFileUrl: v })
              }
              onUpload={(file) =>
                uploadFile(file, "corporate-kyc/authorised-signatories")
              }
              accept=".jpg,.jpeg,.png,.pdf"
              placeholder="Select file or paste URL"
            />
            <InputField
              label="Designation"
              value={s.designation ?? ""}
              onChangeAction={(v) =>
                setAuthorisedSignatory(index, { designation: v })
              }
            />
            <InputField
              label="DIN"
              value={s.din ?? ""}
              onChangeAction={(v) =>
                setAuthorisedSignatory(index, { din: v })
              }
            />
            <InputField
              label="Email"
              type="email"
              required
              value={s.email}
              onChangeAction={(v) =>
                setAuthorisedSignatory(index, { email: v })
              }
              error={rowErrors(index).email?.[0]}
            />
            <InputField
              label="Mobile"
              value={s.mobile ?? ""}
              onChangeAction={(v) =>
                setAuthorisedSignatory(index, { mobile: v })
              }
            />
            <SelectField
              label="Whether Politically Exposed?"
              className="md:col-span-2"
              value={(s.pepDeclaration as unknown as string | undefined) ?? "NA"}
              onChangeAction={(v) =>
                setAuthorisedSignatory(index, {
                  pepDeclaration:
                    v as unknown as CorporateKycAuthorisedSignatoryPayload["pepDeclaration"],
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
