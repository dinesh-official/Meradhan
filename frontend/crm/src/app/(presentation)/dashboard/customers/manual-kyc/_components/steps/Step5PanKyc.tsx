"use client";

import { InputField } from "@/global/elements/inputs/InputField";
import { SelectField } from "@/global/elements/inputs/SelectField";
import { useManualKycFormHook } from "../../_hooks/useManualKycFormHook";
import { gender } from "../../../../../../../../../../packages/schema/lib/enums";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface Step5PanKycProps {
  formHook: ReturnType<typeof useManualKycFormHook>;
}

export function Step5PanKyc({ formHook }: Step5PanKycProps) {
  const { formData, updateStepData, getFieldError } = formHook;

  const formatPan = (value: string) => {
    // Remove all non-alphanumeric characters and convert to uppercase
    let cleaned = value.replace(/[^A-Z0-9]/gi, "").toUpperCase();
    
    // Limit to 10 characters
    cleaned = cleaned.slice(0, 10);
    
    // Build formatted PAN: 5 letters + 4 digits + 1 letter
    let formatted = "";
    let letterCount = 0;
    let digitCount = 0;
    
    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i];
      
      if (letterCount < 5) {
        // First 5 positions: only letters
        if (/[A-Z]/.test(char)) {
          formatted += char;
          letterCount++;
        }
      } else if (digitCount < 4) {
        // Next 4 positions: only digits
        if (/[0-9]/.test(char)) {
          formatted += char;
          digitCount++;
        }
      } else if (formatted.length < 10) {
        // Last position: only letter
        if (/[A-Z]/.test(char)) {
          formatted += char;
        }
      }
    }
    
    return formatted;
  };

  return (
    <div className="space-y-4">
      <InputField
        id="panNumber"
        label="PAN Number"
        placeholder="Enter PAN number (e.g., ABCDE1234F)"
        required
        value={formData.step5.panNumber}
        onChangeAction={(e) => {
          const formatted = formatPan(e);
          updateStepData("step5", { panNumber: formatted });
        }}
        error={getFieldError(5, "panNumber")}
      />
      {formData.step5.panNumber && formData.step5.panNumber.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)
          {formData.step5.panNumber.length < 10 && (
            <span className="text-destructive ml-2">
              {10 - formData.step5.panNumber.length} characters remaining
            </span>
          )}
        </p>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <InputField
          id="panFirstName"
          label="First Name (as per PAN)"
          placeholder="Enter first name as per PAN"
          required
          value={formData.step5.firstName}
          onChangeAction={(e) =>
            updateStepData("step5", { firstName: e })
          }
          error={getFieldError(5, "firstName")}
        />

        <InputField
          id="panLastName"
          label="Last Name (as per PAN)"
          placeholder="Enter last name as per PAN"
          required
          value={formData.step5.lastName}
          onChangeAction={(e) =>
            updateStepData("step5", { lastName: e })
          }
          error={getFieldError(5, "lastName")}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <InputField
          id="panDateOfBirth"
          label="Date of Birth (as per PAN)"
          placeholder="Select date of birth"
          type="date"
          required
          value={formData.step5.dateOfBirth}
          onChangeAction={(e) =>
            updateStepData("step5", { dateOfBirth: e })
          }
          error={getFieldError(5, "dateOfBirth")}
        />

        <SelectField
          label="Gender (as per PAN)"
          placeholder="Select gender"
          required
          value={formData.step5.gender}
          onChangeAction={(e) =>
            updateStepData("step5", { gender: e })
          }
          options={gender.map((g) => ({
            label: g.charAt(0).toUpperCase() + g.slice(1),
            value: g,
          }))}
          error={getFieldError(5, "gender")}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="panConsent"
          checked={formData.step5.panConsent}
          onCheckedChange={(checked) => {
            const consent = checked === true;
            updateStepData("step5", {
              panConsent: consent,
              // Set timestamp when consent is given
              confirmPanTimestamp: consent && !formData.step5.confirmPanTimestamp
                ? new Date().toISOString()
                : formData.step5.confirmPanTimestamp,
            });
          }}
        />
        <Label htmlFor="panConsent" className="text-sm font-normal">
          I consent to the use of my PAN information for KYC verification{" "}
          <span className="text-destructive">*</span>
        </Label>
      </div>
      {getFieldError(5, "panConsent") && (
        <p className="text-destructive text-xs">{getFieldError(5, "panConsent")}</p>
      )}
    </div>
  );
}

