"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploadField } from "@/global/elements/inputs/FileUploadField";
import { InputField } from "@/global/elements/inputs/InputField";
import { SelectField } from "@/global/elements/inputs/SelectField";
import type { CorporateKycPromoterPayload } from "@root/schema";
import type { CorporateKycFormHook } from "../_hooks/useCorporateKycForm";
import { Plus, Trash2 } from "lucide-react";
import { useCorporateKycFileUpload } from "../_hooks/useCorporateKycFileUpload";

export function PromotersSection({ hook }: { hook: CorporateKycFormHook }) {
  const { form, errors, setPromoter, addPromoter, removePromoter } = hook;
  const { uploadFile } = useCorporateKycFileUpload();
  const list = form.promoters ?? [];
  const rowErrors = (i: number): Record<string, string[]> =>
    (errors.promoters?.[i] ?? {}) as Record<string, string[]>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Promoters</CardTitle>
        <Button type="button" variant="outline" size="sm" onClick={addPromoter}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {list.length === 0 && (
          <p className="text-muted-foreground text-xs">No promoters added.</p>
        )}
        {list.map((p: CorporateKycPromoterPayload, index: number) => (
          <div
            key={index}
            className="rounded-lg border p-4 grid gap-3 md:grid-cols-2"
          >
            <div className="md:col-span-2 flex justify-between items-center">
              <span className="text-xs font-medium">Promoter {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removePromoter(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <InputField
              label="Full name"
              required
              value={p.fullName}
              onChangeAction={(v) => setPromoter(index, { fullName: v })}
              error={rowErrors(index).fullName?.[0]}
            />
            <InputField
              label="PAN"
              value={p.pan ?? ""}
              onChangeAction={(v) => setPromoter(index, { pan: v })}
            />
            <FileUploadField
              label="Passport size photo (optional)"
              className="md:col-span-2"
              value={p.passportPhotoFileUrl ?? ""}
              onChangeAction={(v) =>
                setPromoter(index, { passportPhotoFileUrl: v })
              }
              onUpload={(file) => uploadFile(file, "corporate-kyc/promoters")}
              accept=".jpg,.jpeg,.png,.pdf"
              placeholder="Select file or paste URL"
            />
            <FileUploadField
              label="Aadhaar copy (optional)"
              className="md:col-span-2"
              value={p.aadharCopyFileUrl ?? ""}
              onChangeAction={(v) => setPromoter(index, { aadharCopyFileUrl: v })}
              onUpload={(file) => uploadFile(file, "corporate-kyc/promoters")}
              accept=".jpg,.jpeg,.png,.pdf"
              placeholder="Select file or paste URL"
            />
            <FileUploadField
              label="PAN copy (optional)"
              className="md:col-span-2"
              value={p.panCopyFileUrl ?? ""}
              onChangeAction={(v) => setPromoter(index, { panCopyFileUrl: v })}
              onUpload={(file) => uploadFile(file, "corporate-kyc/promoters")}
              accept=".jpg,.jpeg,.png,.pdf"
              placeholder="Select file or paste URL"
            />
            <InputField
              label="Designation"
              value={p.designation ?? ""}
              onChangeAction={(v) => setPromoter(index, { designation: v })}
            />
            <InputField
              label="DIN"
              value={p.din ?? ""}
              onChangeAction={(v) => setPromoter(index, { din: v })}
            />
            <InputField
              label="Email"
              type="email"
              value={p.email ?? ""}
              onChangeAction={(v) => setPromoter(index, { email: v })}
              error={rowErrors(index).email?.[0]}
            />
            <InputField
              label="Mobile"
              value={p.mobile ?? ""}
              onChangeAction={(v) => setPromoter(index, { mobile: v })}
            />
            <SelectField
              label="Whether Politically Exposed?"
              className="md:col-span-2"
              value={(p.pepDeclaration as unknown as string | undefined) ?? "NA"}
              onChangeAction={(v) =>
                setPromoter(index, {
                  pepDeclaration: v as unknown as CorporateKycPromoterPayload["pepDeclaration"],
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
