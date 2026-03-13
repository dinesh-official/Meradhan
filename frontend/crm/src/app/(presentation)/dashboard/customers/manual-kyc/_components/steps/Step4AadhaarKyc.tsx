"use client";

import { InputField } from "@/global/elements/inputs/InputField";
import { SelectField } from "@/global/elements/inputs/SelectField";
import { FileUploadField } from "@/global/elements/inputs/FileUploadField";
import { useManualKycFormHook } from "../../_hooks/useManualKycFormHook";
import { useUploadFileToS3 } from "../../_hooks/useUploadFileToS3";
import { gender } from "../../../../../../../../../../packages/schema/lib/enums";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface Step4AadhaarKycProps {
  formHook: ReturnType<typeof useManualKycFormHook>;
}

export function Step4AadhaarKyc({ formHook }: Step4AadhaarKycProps) {
  const { formData, updateStepData, getFieldError } = formHook;
  const { uploadFile } = useUploadFileToS3();

  return (
    <div className="space-y-4">
      <InputField
        id="aadhaarNumber"
        label="Aadhaar Number"
        placeholder="Enter 12-digit Aadhaar number"
        required
        max={12}
        value={formData.step4.aadhaarNumber}
        onChangeAction={(e) =>
          updateStepData("step4", { aadhaarNumber: e.replace(/\D/g, "").slice(0, 12) })
        }
        error={getFieldError(4, "aadhaarNumber")}
      />

      <div className="grid md:grid-cols-2 gap-4">
        <InputField
          id="aadhaarFirstName"
          label="First Name (as per Aadhaar)"
          placeholder="Enter first name as per Aadhaar"
          required
          value={formData.step4.firstName}
          onChangeAction={(e) =>
            updateStepData("step4", { firstName: e })
          }
          error={getFieldError(4, "firstName")}
        />

        <InputField
          id="aadhaarLastName"
          label="Last Name (as per Aadhaar)"
          placeholder="Enter last name as per Aadhaar"
          required
          value={formData.step4.lastName}
          onChangeAction={(e) =>
            updateStepData("step4", { lastName: e })
          }
          error={getFieldError(4, "lastName")}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <InputField
          id="aadhaarDateOfBirth"
          label="Date of Birth (as per Aadhaar)"
          placeholder="Select date of birth"
          type="date"
          required
          value={formData.step4.dateOfBirth}
          onChangeAction={(e) =>
            updateStepData("step4", { dateOfBirth: e })
          }
          error={getFieldError(4, "dateOfBirth")}
        />

        <SelectField
          label="Gender (as per Aadhaar)"
          placeholder="Select gender"
          required
          value={formData.step4.gender}
          onChangeAction={(e) =>
            updateStepData("step4", { gender: e })
          }
          options={gender.map((g) => ({
            label: g.charAt(0).toUpperCase() + g.slice(1),
            value: g,
          }))}
          error={getFieldError(4, "gender")}
        />
      </div>

      <FileUploadField
        id="aadhaarDocumentFileUrl"
        label="Aadhaar Document"
        placeholder="Select Aadhaar document file or enter file URL"
        required
        accept="image/*,.pdf"
        value={formData.step4.documentFileUrl}
        onChangeAction={(e) =>
          updateStepData("step4", { documentFileUrl: e })
        }
        onUpload={(file) => uploadFile(file, "kyc")}
        error={getFieldError(4, "documentFileUrl")}
      />

      <div className="flex items-center space-x-2">
        <Checkbox
          id="aadhaarConsent"
          checked={formData.step4.aadhaarConsent}
          onCheckedChange={(checked) => {
            const consent = checked === true;
            updateStepData("step4", {
              aadhaarConsent: consent,
              // Set timestamp when consent is given
              confirmAadhaarTimestamp: consent && !formData.step4.confirmAadhaarTimestamp
                ? new Date().toISOString()
                : formData.step4.confirmAadhaarTimestamp,
            });
          }}
        />
        <Label htmlFor="aadhaarConsent" className="text-sm font-normal">
          I consent to the use of my Aadhaar information for KYC verification{" "}
          <span className="text-destructive">*</span>
        </Label>
      </div>
      {getFieldError(4, "aadhaarConsent") && (
        <p className="text-destructive text-xs">{getFieldError(4, "aadhaarConsent")}</p>
      )}
    </div>
  );
}

