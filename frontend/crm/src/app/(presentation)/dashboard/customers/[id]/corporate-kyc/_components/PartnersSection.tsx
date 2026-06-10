"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploadField } from "@/global/elements/inputs/FileUploadField";
import { InputField } from "@/global/elements/inputs/InputField";
import { SelectField } from "@/global/elements/inputs/SelectField";
import type { CorporateKycPartnerPayload } from "@root/schema";
import type { CorporateKycFormHook } from "../_hooks/useCorporateKycForm";
import { Plus, Trash2 } from "lucide-react";
import { useCorporateKycFileUpload } from "../_hooks/useCorporateKycFileUpload";

export function PartnersSection({ hook }: { hook: CorporateKycFormHook }) {
  const { form, errors, setPartner, addPartner, removePartner } = hook;
  const { uploadFile } = useCorporateKycFileUpload();
  const list = form.partners ?? [];
  const rowErrors = (i: number): Record<string, string[]> =>
    (errors.partners?.[i] ?? {}) as Record<string, string[]>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Partners</CardTitle>
        <Button type="button" variant="outline" size="sm" onClick={addPartner}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {list.length === 0 && (
          <p className="text-muted-foreground text-xs">No partners added.</p>
        )}
        {list.map((p: CorporateKycPartnerPayload, index: number) => (
          <div
            key={index}
            className="rounded-lg border p-4 grid gap-3 md:grid-cols-2"
          >
            <div className="md:col-span-2 flex justify-between items-center">
              <span className="text-xs font-medium">Partner {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removePartner(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <InputField
              label="Full name"
              required
              value={p.fullName}
              onChangeAction={(v) => setPartner(index, { fullName: v })}
              error={rowErrors(index).fullName?.[0]}
            />
            <InputField
              label="PAN"
              value={p.pan ?? ""}
              onChangeAction={(v) => setPartner(index, { pan: v })}
            />
            <FileUploadField
              label="Passport size photo (optional)"
              className="md:col-span-2"
              value={p.passportPhotoFileUrl ?? ""}
              onChangeAction={(v) =>
                setPartner(index, { passportPhotoFileUrl: v })
              }
              onUpload={(file) => uploadFile(file, "corporate-kyc/partners")}
              accept=".jpg,.jpeg,.png,.pdf"
              placeholder="Select file or paste URL"
            />
            <FileUploadField
              label="Aadhaar copy (optional)"
              className="md:col-span-2"
              value={p.aadharCopyFileUrl ?? ""}
              onChangeAction={(v) =>
                setPartner(index, { aadharCopyFileUrl: v })
              }
              onUpload={(file) => uploadFile(file, "corporate-kyc/partners")}
              accept=".jpg,.jpeg,.png,.pdf"
              placeholder="Select file or paste URL"
            />
            <FileUploadField
              label="PAN copy (optional)"
              className="md:col-span-2"
              value={p.panCopyFileUrl ?? ""}
              onChangeAction={(v) => setPartner(index, { panCopyFileUrl: v })}
              onUpload={(file) => uploadFile(file, "corporate-kyc/partners")}
              accept=".jpg,.jpeg,.png,.pdf"
              placeholder="Select file or paste URL"
            />
            <InputField
              label="Designation"
              value={p.designation ?? ""}
              onChangeAction={(v) => setPartner(index, { designation: v })}
              placeholder="e.g. Designated Partner"
            />
            <InputField
              label="DIN / DPIN"
              value={p.din ?? ""}
              onChangeAction={(v) => setPartner(index, { din: v })}
            />
            <InputField
              label="Email"
              type="email"
              value={p.email ?? ""}
              onChangeAction={(v) => setPartner(index, { email: v })}
              error={rowErrors(index).email?.[0]}
            />
            <InputField
              label="Mobile"
              value={p.mobile ?? ""}
              onChangeAction={(v) => setPartner(index, { mobile: v })}
            />
            <SelectField
              label="Whether Politically Exposed?"
              className="md:col-span-2"
              value={(p.pepDeclaration as unknown as string | undefined) ?? "NA"}
              onChangeAction={(v) =>
                setPartner(index, {
                  pepDeclaration:
                    v as unknown as CorporateKycPartnerPayload["pepDeclaration"],
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
