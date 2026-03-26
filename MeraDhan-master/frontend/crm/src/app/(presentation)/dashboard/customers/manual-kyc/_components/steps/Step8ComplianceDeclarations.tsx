"use client";

import { RadioYesNoField } from "@/global/elements/inputs/RadioYesNoField";
import { useManualKycFormHook } from "../../_hooks/useManualKycFormHook";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface Step8ComplianceDeclarationsProps {
  formHook: ReturnType<typeof useManualKycFormHook>;
}

export function Step8ComplianceDeclarations({
  formHook,
}: Step8ComplianceDeclarationsProps) {
  const { formData, updateStepData, getFieldError } = formHook;

  return (
    <div className="space-y-6">
      <RadioYesNoField
        id="fatcaDeclaration"
        label="FATCA Declaration"
        required
        value={formData.step8.fatcaDeclaration}
        onChangeAction={(e) =>
          updateStepData("step8", { fatcaDeclaration: e as "yes" | "no" })
        }
      />
      {getFieldError(8, "fatcaDeclaration") && (
        <p className="text-destructive text-xs">
          {getFieldError(8, "fatcaDeclaration")}
        </p>
      )}

      <RadioYesNoField
        id="pepDeclaration"
        label="Politically Exposed Person (PEP) Declaration"
        required
        value={formData.step8.pepDeclaration}
        onChangeAction={(e) =>
          updateStepData("step8", { pepDeclaration: e as "yes" | "no" })
        }
      />
      {getFieldError(8, "pepDeclaration") && (
        <p className="text-destructive text-xs">
          {getFieldError(8, "pepDeclaration")}
        </p>
      )}

      <div className="flex items-center space-x-2">
        <Checkbox
          id="sebiTermsAcceptance"
          checked={formData.step8.sebiTermsAcceptance}
          onCheckedChange={(checked) =>
            updateStepData("step8", { sebiTermsAcceptance: checked === true })
          }
        />
        <Label htmlFor="sebiTermsAcceptance" className="text-sm font-normal">
          I accept the SEBI terms and conditions{" "}
          <span className="text-destructive">*</span>
        </Label>
      </div>
      {getFieldError(8, "sebiTermsAcceptance") && (
        <p className="text-destructive text-xs">
          {getFieldError(8, "sebiTermsAcceptance")}
        </p>
      )}
    </div>
  );
}

