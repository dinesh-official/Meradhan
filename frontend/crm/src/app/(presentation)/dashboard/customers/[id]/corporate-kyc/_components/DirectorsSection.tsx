"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploadField } from "@/global/elements/inputs/FileUploadField";
import { InputField } from "@/global/elements/inputs/InputField";
import { SelectField } from "@/global/elements/inputs/SelectField";
import type { CorporateKycDirectorPayload } from "@root/schema";
import type { CorporateKycFormHook } from "../_hooks/useCorporateKycForm";
import { Plus, Trash2 } from "lucide-react";
import { useCorporateKycFileUpload } from "../_hooks/useCorporateKycFileUpload";

type GovernanceVariant = "directors" | "kartas";

const VARIANT_CONFIG: Record<
  GovernanceVariant,
  { title: string; rowLabel: string; empty: string; uploadDir: string }
> = {
  directors: {
    title: "Directors",
    rowLabel: "Director",
    empty: "No directors added.",
    uploadDir: "corporate-kyc/directors",
  },
  kartas: {
    title: "Kartas",
    rowLabel: "Karta",
    empty: "No kartas added.",
    uploadDir: "corporate-kyc/kartas",
  },
};

export function DirectorsSection({
  hook,
  variant = "directors",
}: {
  hook: CorporateKycFormHook;
  variant?: GovernanceVariant;
}) {
  const { form, errors, setDirector, addDirector, removeDirector } = hook;
  const { uploadFile } = useCorporateKycFileUpload();
  const config = VARIANT_CONFIG[variant];
  const list = form.directors ?? [];
  const rowErrors = (i: number): Record<string, string[]> =>
    (errors.directors?.[i] ?? {}) as Record<string, string[]>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">{config.title}</CardTitle>
        <Button type="button" variant="outline" size="sm" onClick={addDirector}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {list.length === 0 && (
          <p className="text-muted-foreground text-xs">{config.empty}</p>
        )}
        {list.map((dir: CorporateKycDirectorPayload, index: number) => (
          <div
            key={index}
            className="rounded-lg border p-4 grid gap-3 md:grid-cols-2"
          >
            <div className="md:col-span-2 flex justify-between items-center">
              <span className="text-xs font-medium">
                {config.rowLabel} {index + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeDirector(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <InputField
              label="Full name"
              required
              value={dir.fullName}
              onChangeAction={(v) => setDirector(index, { fullName: v })}
              error={rowErrors(index).fullName?.[0]}
            />
            <InputField
              label="PAN"
              value={dir.pan ?? ""}
              onChangeAction={(v) => setDirector(index, { pan: v })}
            />
            <FileUploadField
              label="Passport size photo (optional)"
              className="md:col-span-2"
              value={dir.passportPhotoFileUrl ?? ""}
              onChangeAction={(v) => setDirector(index, { passportPhotoFileUrl: v })}
              onUpload={(file) => uploadFile(file, config.uploadDir)}
              accept=".jpg,.jpeg,.png,.pdf"
              placeholder="Select file or paste URL"
            />
            <FileUploadField
              label="Aadhaar copy (optional)"
              className="md:col-span-2"
              value={dir.aadharCopyFileUrl ?? ""}
              onChangeAction={(v) => setDirector(index, { aadharCopyFileUrl: v })}
              onUpload={(file) => uploadFile(file, config.uploadDir)}
              accept=".jpg,.jpeg,.png,.pdf"
              placeholder="Select file or paste URL"
            />
            <FileUploadField
              label="PAN copy (optional)"
              className="md:col-span-2"
              value={dir.panCopyFileUrl ?? ""}
              onChangeAction={(v) => setDirector(index, { panCopyFileUrl: v })}
              onUpload={(file) => uploadFile(file, config.uploadDir)}
              accept=".jpg,.jpeg,.png,.pdf"
              placeholder="Select file or paste URL"
            />
            <InputField
              label="Designation"
              value={dir.designation ?? ""}
              onChangeAction={(v) => setDirector(index, { designation: v })}
            />
            <InputField
              label="DIN"
              value={dir.din ?? ""}
              onChangeAction={(v) => setDirector(index, { din: v })}
            />
            <InputField
              label="Email"
              type="email"
              value={dir.email ?? ""}
              onChangeAction={(v) => setDirector(index, { email: v })}
              error={rowErrors(index).email?.[0]}
            />
            <InputField
              label="Mobile"
              value={dir.mobile ?? ""}
              onChangeAction={(v) => setDirector(index, { mobile: v })}
            />
            <SelectField
              label="Whether Politically Exposed?"
              className="md:col-span-2"
              value={(dir.pepDeclaration as unknown as string | undefined) ?? "NA"}
              onChangeAction={(v) =>
                setDirector(index, {
                  pepDeclaration: v as unknown as CorporateKycDirectorPayload["pepDeclaration"],
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
