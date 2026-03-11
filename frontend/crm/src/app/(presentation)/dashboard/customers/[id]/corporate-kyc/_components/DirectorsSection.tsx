"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputField } from "@/global/elements/inputs/InputField";
import type { CorporateKycDirectorPayload } from "@root/schema";
import type { CorporateKycFormHook } from "../_hooks/useCorporateKycForm";
import { Plus, Trash2 } from "lucide-react";

export function DirectorsSection({ hook }: { hook: CorporateKycFormHook }) {
  const { form, errors, setDirector, addDirector, removeDirector } = hook;
  const list = form.directors ?? [];
  const rowErrors = (i: number): Record<string, string[]> =>
    (errors.directors?.[i] ?? {}) as Record<string, string[]>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Directors</CardTitle>
        <Button type="button" variant="outline" size="sm" onClick={addDirector}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {list.length === 0 && (
          <p className="text-muted-foreground text-sm">No directors added.</p>
        )}
        {list.map((dir: CorporateKycDirectorPayload, index: number) => (
          <div
            key={index}
            className="rounded-lg border p-4 grid gap-3 md:grid-cols-2"
          >
            <div className="md:col-span-2 flex justify-between items-center">
              <span className="text-sm font-medium">Director {index + 1}</span>
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
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
