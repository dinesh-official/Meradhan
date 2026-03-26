"use client";

import { InputField } from "@/global/elements/inputs/InputField";
import { SelectField } from "@/global/elements/inputs/SelectField";
import { RadioYesNoField } from "@/global/elements/inputs/RadioYesNoField";
import { useManualKycFormHook } from "../../_hooks/useManualKycFormHook";

interface Step2PersonalInfoProps {
  formHook: ReturnType<typeof useManualKycFormHook>;
}

const maritalStatusOptions = [
  { label: "Single", value: "SINGLE" },
  { label: "Married", value: "MARRIED" },
  { label: "Divorced", value: "DIVORCED" },
  { label: "Widowed", value: "WIDOWED" },
];

const nationalityOptions = [
  { label: "Indian", value: "INDIAN" },
  { label: "Other", value: "OTHER" },
];

const residentialStatusOptions = [
  { label: "Resident", value: "RESIDENT" },
  { label: "Non-Resident", value: "NON_RESIDENT" },
  { label: "Resident but Not Ordinarily Resident", value: "RNOR" },
];

const occupationTypeOptions = [
  { label: "Salaried", value: "SALARIED" },
  { label: "Self Employed", value: "SELF_EMPLOYED" },
  { label: "Business", value: "BUSINESS" },
  { label: "Professional", value: "PROFESSIONAL" },
  { label: "Retired", value: "RETIRED" },
  { label: "Student", value: "STUDENT" },
  { label: "Housewife", value: "HOUSEWIFE" },
  { label: "Other", value: "OTHER" },
];

const annualIncomeOptions = [
  { label: "Below 2.5 Lakhs", value: "BELOW_2_5_LAKHS" },
  { label: "2.5 - 5 Lakhs", value: "2_5_TO_5_LAKHS" },
  { label: "5 - 10 Lakhs", value: "5_TO_10_LAKHS" },
  { label: "10 - 25 Lakhs", value: "10_TO_25_LAKHS" },
  { label: "25 - 50 Lakhs", value: "25_TO_50_LAKHS" },
  { label: "Above 50 Lakhs", value: "ABOVE_50_LAKHS" },
];

export function Step2PersonalInfo({ formHook }: Step2PersonalInfoProps) {
  const { formData, updateStepData, getFieldError } = formHook;

  return (
    <div className="space-y-4">
      <InputField
        id="dateOfBirth"
        label="Date of Birth"
        placeholder="Select date of birth"
        type="date"
        required
        value={formData.step2.dateOfBirth}
        onChangeAction={(e) =>
          updateStepData("step2", { dateOfBirth: e })
        }
        error={getFieldError(2, "dateOfBirth")}
      />

      <div className="grid md:grid-cols-2 gap-4">
        <InputField
          id="fatherOrSpouseName"
          label="Father or Spouse Name"
          placeholder="Enter father or spouse name"
          required
          value={formData.step2.fatherOrSpouseName}
          onChangeAction={(e) =>
            updateStepData("step2", { fatherOrSpouseName: e })
          }
          error={getFieldError(2, "fatherOrSpouseName")}
        />

        <InputField
          id="mothersName"
          label="Mother's Name"
          placeholder="Enter mother's name"
          required
          value={formData.step2.mothersName}
          onChangeAction={(e) =>
            updateStepData("step2", { mothersName: e })
          }
          error={getFieldError(2, "mothersName")}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <SelectField
          label="Marital Status"
          placeholder="Select marital status"
          required
          value={formData.step2.maritalStatus}
          onChangeAction={(e) =>
            updateStepData("step2", { maritalStatus: e })
          }
          options={maritalStatusOptions}
          error={getFieldError(2, "maritalStatus")}
        />

        <SelectField
          label="Nationality"
          placeholder="Select nationality"
          required
          value={formData.step2.nationality}
          onChangeAction={(e) =>
            updateStepData("step2", { nationality: e })
          }
          options={nationalityOptions}
          error={getFieldError(2, "nationality")}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <SelectField
          label="Residential Status"
          placeholder="Select residential status"
          required
          value={formData.step2.residentialStatus}
          onChangeAction={(e) =>
            updateStepData("step2", { residentialStatus: e })
          }
          options={residentialStatusOptions}
          error={getFieldError(2, "residentialStatus")}
        />

        <SelectField
          label="Occupation Type"
          placeholder="Select occupation type"
          required
          value={formData.step2.occupationType}
          onChangeAction={(e) =>
            updateStepData("step2", { occupationType: e })
          }
          options={occupationTypeOptions}
          error={getFieldError(2, "occupationType")}
        />
      </div>

      <SelectField
        label="Annual Gross Income"
        placeholder="Select annual gross income"
        required
        value={formData.step2.annualGrossIncome}
        onChangeAction={(e) =>
          updateStepData("step2", { annualGrossIncome: e })
        }
        options={annualIncomeOptions}
        error={getFieldError(2, "annualGrossIncome")}
      />

      <RadioYesNoField
        id="politicallyExposedPerson"
        label="Politically Exposed Person (PEP)"
        required
        value={formData.step2.politicallyExposedPerson}
        onChangeAction={(e) =>
          updateStepData("step2", {
            politicallyExposedPerson: e as "yes" | "no",
          })
        }
      />
    </div>
  );
}

