"use client";

import { useManualKycFormHook } from "../../_hooks/useManualKycFormHook";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Step9FinalSubmissionProps {
  formHook: ReturnType<typeof useManualKycFormHook>;
}

export function Step9FinalSubmission({ formHook }: Step9FinalSubmissionProps) {
  const { formData, updateStepData, getFieldError } = formHook;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Review Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <strong>Name:</strong> {formData.step1.firstName}{" "}
            {formData.step1.lastName}
          </div>
          <div>
            <strong>Email:</strong> {formData.step1.emailAddress}
          </div>
          <div>
            <strong>Date of Birth:</strong> {formData.step2.dateOfBirth}
          </div>
          <div>
            <strong>Aadhaar:</strong> {formData.step4.aadhaarNumber}
          </div>
          <div>
            <strong>PAN:</strong> {formData.step5.panNumber}
          </div>
          <div>
            <strong>Bank Accounts:</strong> {formData.step6.bankAccounts.length}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="confirmAccuracy"
          checked={formData.step9.confirmAccuracy}
          onCheckedChange={(checked) => {
            const confirmed = checked === true;
            updateStepData("step9", {
              confirmAccuracy: confirmed,
              // Set submission date when accuracy is confirmed
              kycSubmissionDate: confirmed && !formData.step9.kycSubmissionDate
                ? new Date().toISOString()
                : formData.step9.kycSubmissionDate,
            });
          }}
        />
        <Label htmlFor="confirmAccuracy" className="text-sm font-normal">
          I confirm that all provided information is accurate and complete{" "}
          <span className="text-destructive">*</span>
        </Label>
      </div>
      {getFieldError(9, "confirmAccuracy") && (
        <p className="text-destructive text-xs">
          {getFieldError(9, "confirmAccuracy")}
        </p>
      )}

      <div className="p-4 bg-muted rounded-md">
        <p className="text-sm">
          <strong>KYC Status:</strong> The KYC status will be set to{" "}
          <strong>UNDER_REVIEW</strong> upon submission. The submission date
          will be automatically recorded.
        </p>
      </div>
    </div>
  );
}

