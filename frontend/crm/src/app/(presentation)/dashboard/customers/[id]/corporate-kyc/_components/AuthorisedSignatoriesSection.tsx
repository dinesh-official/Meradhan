"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputField } from "@/global/elements/inputs/InputField";
import type { CorporateKycAuthorisedSignatoryPayload } from "@root/schema";
import type { CorporateKycFormHook } from "../_hooks/useCorporateKycForm";
import { Plus, Trash2 } from "lucide-react";

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
  const list = form.authorisedSignatories ?? [];
  const rowErrors = (i: number): Record<string, string[]> =>
    (errors.authorisedSignatories?.[i] ?? {}) as Record<string, string[]>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Authorised signatories</CardTitle>
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
          <p className="text-muted-foreground text-sm">
            No authorised signatories added.
          </p>
        )}
        {list.map((s: CorporateKycAuthorisedSignatoryPayload, index: number) => (
          <div
            key={index}
            className="rounded-lg border p-4 grid gap-3 md:grid-cols-2"
          >
            <div className="md:col-span-2 flex justify-between items-center">
              <span className="text-sm font-medium">Signatory {index + 1}</span>
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
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
