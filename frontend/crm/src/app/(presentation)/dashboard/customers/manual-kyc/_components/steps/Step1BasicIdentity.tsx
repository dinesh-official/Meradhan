"use client";

import { InputField } from "@/global/elements/inputs/InputField";
import { SelectField } from "@/global/elements/inputs/SelectField";
import { gender } from "../../../../../../../../../../packages/schema/lib/enums";
import { useManualKycFormHook } from "../../_hooks/useManualKycFormHook";

interface Step1BasicIdentityProps {
  formHook: ReturnType<typeof useManualKycFormHook>;
}

export function Step1BasicIdentity({ formHook }: Step1BasicIdentityProps) {
  const { formData, updateStepData, getFieldError } = formHook;

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <InputField
          id="firstName"
          label="First Name"
          placeholder="Enter first name"
          required
          value={formData.step1.firstName}
          onChangeAction={(e) =>
            updateStepData("step1", { firstName: e })
          }
          error={getFieldError(1, "firstName")}
        />

        <InputField
          id="lastName"
          label="Last Name"
          placeholder="Enter last name"
          required
          value={formData.step1.lastName}
          onChangeAction={(e) =>
            updateStepData("step1", { lastName: e })
          }
          error={getFieldError(1, "lastName")}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <SelectField
          label="Gender"
          placeholder="Select gender"
          required
          value={formData.step1.gender}
          onChangeAction={(e) =>
            updateStepData("step1", { gender: e })
          }
          options={gender.map((g) => ({
            label: g.charAt(0).toUpperCase() + g.slice(1),
            value: g,
          }))}
          error={getFieldError(1, "gender")}
        />

        <InputField
          id="emailAddress"
          label="Email Address"
          placeholder="Enter email address"
          type="email"
          required
          value={formData.step1.emailAddress}
          onChangeAction={(e) =>
            updateStepData("step1", { emailAddress: e })
          }
          error={getFieldError(1, "emailAddress")}
        />
      </div>

      <InputField
        id="username"
        label="Username"
        placeholder="Enter username"
        required
        value={formData.step1.username}
        onChangeAction={(e) =>
          updateStepData("step1", { username: e })
        }
        error={getFieldError(1, "username")}
      />
    </div>
  );
}

