"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckField,
  SelectField,
  TextField,
} from "./FormPrimitives";
import {
  RISK_PROFILES,
  YES_NO,
  type AdditionalInfo,
  type CorporateKycData,
  type ExistingClientRelationship,
  type SettlementAgency,
  type YesNo,
} from "../_utils/mapToPdfPayload";

type Props = {
  value: CorporateKycData;
  onChange: (next: CorporateKycData) => void;
  disabled?: boolean;
  /** Customer username — NCL participant code for Page 15 row 2. */
  customerUserName?: string | null;
};

export default function AdditionalInfoTab({ value, onChange, disabled, customerUserName }: Props) {
  const ai = value.additionalInfo ?? {};
  const update = (patch: Partial<AdditionalInfo>) =>
    onChange({ ...value, additionalInfo: { ...ai, ...patch } });
  const updateAgency = (patch: Partial<SettlementAgency>) =>
    update({ settlementAgency: { ...(ai.settlementAgency ?? {}), ...patch } });
  const updateRel = (patch: Partial<ExistingClientRelationship>) =>
    update({
      existingRelationship: { ...(ai.existingRelationship ?? {}), ...patch },
    });

  return (
    <div className="space-y-4">
      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm">Applicant (Page 8)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 px-4 py-4 md:grid-cols-2">
          <TextField
            label="Applicant name"
            value={ai.applicantName}
            onChange={(applicantName) => update({ applicantName })}
            disabled={disabled}
          />
          <TextField
            label="Applicant PAN"
            value={ai.applicantPan}
            onChange={(applicantPan) => update({ applicantPan })}
            disabled={disabled}
          />
          <SelectField
            label="Risk profile (Page 8 — Please confirm your risk profile)"
            value={ai.riskProfile}
            onChange={(v) => update({ riskProfile: v })}
            options={RISK_PROFILES}
            placeholder="Select risk profile"
            clearable
            disabled={disabled}
          />
          <TextField
            label="Date"
            value={ai.date}
            onChange={(date) => update({ date })}
            disabled={disabled}
          />
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm">Settlement Agency</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 px-4 py-4 md:grid-cols-2">
          <CheckField
            label="NCL"
            checked={ai.settlementAgency?.nclChecked}
            onChange={(b) => updateAgency({ nclChecked: b })}
            disabled={disabled}
          />
          <TextField
            label="NCL code (Page 8 — settlement agency)"
            value={ai.settlementAgency?.nclCode}
            onChange={(nclCode) => updateAgency({ nclCode })}
            disabled={disabled}
            placeholder={customerUserName ?? undefined}
          />
          <CheckField
            label="ICCL"
            checked={ai.settlementAgency?.icclChecked}
            onChange={(b) => updateAgency({ icclChecked: b })}
            disabled={disabled}
          />
          <TextField
            label="ICCL code"
            value={ai.settlementAgency?.icclCode}
            onChange={(icclCode) => updateAgency({ icclCode })}
            disabled={disabled}
          />
          <CheckField
            label="SGL"
            checked={ai.settlementAgency?.sglChecked}
            onChange={(b) => updateAgency({ sglChecked: b })}
            disabled={disabled}
          />
          <TextField
            label="SGL code"
            value={ai.settlementAgency?.sglCode}
            onChange={(sglCode) => updateAgency({ sglCode })}
            disabled={disabled}
          />
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm">Existing client relationship</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 px-4 py-4 md:grid-cols-2">
          <SelectField
            label="Has existing relationship"
            value={ai.existingRelationship?.hasExistingRelationship}
            onChange={(v) => updateRel({ hasExistingRelationship: v as YesNo })}
            options={YES_NO}
            disabled={disabled}
          />
          <TextField
            label="Related PAN"
            value={ai.existingRelationship?.pan}
            onChange={(pan) => updateRel({ pan })}
            disabled={disabled}
          />
          <TextField
            label="Related entity name"
            value={ai.existingRelationship?.name}
            onChange={(name) => updateRel({ name })}
            className="md:col-span-2"
            disabled={disabled}
          />
          <CheckField
            label="Referrer / Applicant code provided"
            checked={ai.existingRelationship?.referrerCodeProvided}
            onChange={(b) => updateRel({ referrerCodeProvided: b })}
            disabled={disabled}
          />
          <CheckField
            label="Name provided"
            checked={ai.existingRelationship?.nameProvided}
            onChange={(b) => updateRel({ nameProvided: b })}
            disabled={disabled}
          />
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm">Consents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0.5 px-4 py-3">
          <CheckField
            label="Accepted RFQ platform & exchange registration terms"
            checked={ai.acceptedRfqTerms}
            onChange={(b) => update({ acceptedRfqTerms: b })}
            disabled={disabled}
          />
          <CheckField
            label="Accepted penny-drop verification"
            checked={ai.acceptedPennyDrop}
            onChange={(b) => update({ acceptedPennyDrop: b })}
            disabled={disabled}
          />
        </CardContent>
      </Card>
    </div>
  );
}
