"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import {
  AddressFields,
  CheckField,
  ProofFields,
  SectionHeading,
  SelectField,
  TextAreaField,
  TextField,
} from "./FormPrimitives";
import {
  ADDRESS_TYPES,
  APPLICATION_TYPES,
  DEPOSITORIES,
  ENTITY_TYPES,
  FATCA_ENTITY_TYPES,
  GENDERS,
  GIIN_NOT_AVAILABLE_REASONS,
  KRA_ADDRESS_TYPES,
  MARITAL_STATUSES,
  NATIONALITIES,
  OCCUPATION_TYPES,
  PEP_STATUSES,
  PROMOTER_PEP,
  RELATED_PERSON_TYPES,
  RESIDENTIAL_STATUSES,
  RISK_PROFILES,
  YES_NO,
  type Address,
  type Annexure1,
  type Annexure11,
  type Annexure11PartC,
  type Annexure12,
  type ApplicationType,
  type BankAccount,
  type BankAnnexure,
  type CorporateKycData,
  type DematAccount,
  type DematAnnexure,
  type Depository,
  type EntityContact,
  type EntityDetails,
  type EntityIdentityProofs,
  type EntityProofOfAddress,
  type FatcaEntityType,
  type GIINNotAvailableReason,
  type KraAddressType,
  type NclAnnexure,
  type OfficeUseDetails,
  type Promoter,
  type PromoterPep,
  type RelatedPerson,
  type RelatedPersonContact,
  type RelatedPersonType,
  type TaxResidencyRow,
  type UBO,
  type YesNo,
} from "../_utils/mapToPdfPayload";

type SectionProps<T> = {
  value: T;
  onChange: (next: T) => void;
  disabled?: boolean;
};

/* ================================================================== */
/* TAB 1 – Application + Entity + Addresses                           */
/* ================================================================== */

export function ApplicationTab({ value, onChange, disabled }: SectionProps<CorporateKycData>) {
  const update = (patch: Partial<CorporateKycData>) => onChange({ ...value, ...patch });
  const updateEntity = (patch: Partial<EntityDetails>) =>
    update({ entity: { ...(value.entity ?? {}), ...patch } });
  const updateProofs = (patch: Partial<EntityIdentityProofs>) =>
    updateEntity({
      proofOfIdentity: { ...(value.entity?.proofOfIdentity ?? {}), ...patch },
    });

  return (
    <div className="space-y-4">
      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm">Application</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 px-4 py-4 md:grid-cols-2">
          <SelectField
            label="Application type"
            value={value.applicationType}
            onChange={(v) => update({ applicationType: v as ApplicationType })}
            options={APPLICATION_TYPES}
            disabled={disabled}
          />
          <TextField
            label="Application number"
            value={value.applicationNumber}
            onChange={(applicationNumber) => update({ applicationNumber })}
            disabled={disabled}
          />
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm">Entity Details (Page 1)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 py-4">
          <div className="grid gap-3 md:grid-cols-2">
            <TextField
              label="Entity name"
              value={value.entity?.name}
              onChange={(name) => updateEntity({ name })}
              className="md:col-span-2"
              disabled={disabled}
            />
            <TextField
              label="PAN"
              value={value.entity?.pan}
              onChange={(pan) => updateEntity({ pan })}
              disabled={disabled}
            />
            <CheckField
              label="Form 60 submitted"
              checked={value.entity?.form60}
              onChange={(form60) => updateEntity({ form60 })}
              disabled={disabled}
            />
            <TextField
              label="Date of incorporation (DD / MM / YYYY)"
              value={value.entity?.dateOfIncorporation}
              onChange={(dateOfIncorporation) => updateEntity({ dateOfIncorporation })}
              disabled={disabled}
            />
            <TextField
              label="Place of incorporation"
              value={value.entity?.placeOfIncorporation}
              onChange={(placeOfIncorporation) => updateEntity({ placeOfIncorporation })}
              disabled={disabled}
            />
            <TextField
              label="Date of commencement"
              value={value.entity?.dateOfCommencement}
              onChange={(dateOfCommencement) => updateEntity({ dateOfCommencement })}
              disabled={disabled}
            />
            <TextField
              label="Registration number / CIN"
              value={value.entity?.registrationNumber}
              onChange={(registrationNumber) => updateEntity({ registrationNumber })}
              disabled={disabled}
            />
            <SelectField
              label="Entity type"
              value={value.entity?.entityType}
              onChange={(entityType) => updateEntity({ entityType })}
              options={ENTITY_TYPES}
              disabled={disabled}
            />
            <TextField
              label="Entity type — other"
              value={value.entity?.entityTypeOther}
              onChange={(entityTypeOther) => updateEntity({ entityTypeOther })}
              placeholder='Used when entity type is "Others"'
              disabled={disabled}
            />
          </div>

          <SectionHeading title="Proof of identity" />
          <div className="grid gap-0.5 md:grid-cols-2">
            <CheckField
              label="Officially Valid Document"
              checked={value.entity?.proofOfIdentity?.officiallyValidDocument}
              onChange={(b) => updateProofs({ officiallyValidDocument: b })}
              disabled={disabled}
            />
            <CheckField
              label="Certificate of Incorporation"
              checked={value.entity?.proofOfIdentity?.certificateOfIncorporation}
              onChange={(b) => updateProofs({ certificateOfIncorporation: b })}
              disabled={disabled}
            />
            <CheckField
              label="Registration Certificate"
              checked={value.entity?.proofOfIdentity?.registrationCertificate}
              onChange={(b) => updateProofs({ registrationCertificate: b })}
              disabled={disabled}
            />
            <CheckField
              label="Memorandum of Articles"
              checked={value.entity?.proofOfIdentity?.memorandumOfArticles}
              onChange={(b) => updateProofs({ memorandumOfArticles: b })}
              disabled={disabled}
            />
            <CheckField
              label="Board Resolution"
              checked={value.entity?.proofOfIdentity?.boardResolution}
              onChange={(b) => updateProofs({ boardResolution: b })}
              disabled={disabled}
            />
            <CheckField
              label="Trust Deed"
              checked={value.entity?.proofOfIdentity?.trustDeed}
              onChange={(b) => updateProofs({ trustDeed: b })}
              disabled={disabled}
            />
            <CheckField
              label="Partnership Deed"
              checked={value.entity?.proofOfIdentity?.partnershipDeed}
              onChange={(b) => updateProofs({ partnershipDeed: b })}
              disabled={disabled}
            />
            <CheckField
              label="Activity Proof 1"
              checked={value.entity?.proofOfIdentity?.activityProof1}
              onChange={(b) => updateProofs({ activityProof1: b })}
              disabled={disabled}
            />
            <CheckField
              label="Activity Proof 2"
              checked={value.entity?.proofOfIdentity?.activityProof2}
              onChange={(b) => updateProofs({ activityProof2: b })}
              disabled={disabled}
            />
            <CheckField
              label="Power of Attorney"
              checked={value.entity?.proofOfIdentity?.powerOfAttorney}
              onChange={(b) => updateProofs({ powerOfAttorney: b })}
              disabled={disabled}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm">Registered Address (Page 1)</CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-4">
          <AddressFields
            value={value.registeredAddress}
            onChange={(registeredAddress) => update({ registeredAddress })}
            disabled={disabled}
          />
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm">
            Correspondence / Local Address (Page 1)
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Use only when different from the registered address.
          </p>
        </CardHeader>
        <CardContent className="px-4 py-4">
          <AddressFields
            value={value.correspondenceAddress}
            onChange={(correspondenceAddress) => update({ correspondenceAddress })}
            disabled={disabled}
          />
        </CardContent>
      </Card>
    </div>
  );
}

/* ================================================================== */
/* TAB 2 – Page 2 (Proof of Address, Contact, Remarks, Office Use)    */
/* ================================================================== */

export function Page2Tab({ value, onChange, disabled }: SectionProps<CorporateKycData>) {
  const update = (patch: Partial<CorporateKycData>) => onChange({ ...value, ...patch });
  const updatePOA = (patch: Partial<EntityProofOfAddress>) =>
    update({
      entityProofOfAddress: { ...(value.entityProofOfAddress ?? {}), ...patch },
    });
  const updateContact = (patch: Partial<EntityContact>) =>
    update({ entityContact: { ...(value.entityContact ?? {}), ...patch } });
  const updateOffice = (patch: Partial<OfficeUseDetails>) =>
    update({ entityOfficeUse: { ...(value.entityOfficeUse ?? {}), ...patch } });

  return (
    <div className="space-y-4">
      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm">Proof of Address (Page 2)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 py-4">
          <div className="grid gap-0.5 md:grid-cols-2">
            <CheckField
              label="Certificate of Incorporation"
              checked={value.entityProofOfAddress?.certificateOfIncorporation}
              onChange={(b) => updatePOA({ certificateOfIncorporation: b })}
              disabled={disabled}
            />
            <CheckField
              label="Registration Certificate"
              checked={value.entityProofOfAddress?.registrationCertificate}
              onChange={(b) => updatePOA({ registrationCertificate: b })}
              disabled={disabled}
            />
            <CheckField
              label="Latest Telephone Bill"
              checked={value.entityProofOfAddress?.latestTelephoneBill}
              onChange={(b) => updatePOA({ latestTelephoneBill: b })}
              disabled={disabled}
            />
            <CheckField
              label="Latest Electricity Bill"
              checked={value.entityProofOfAddress?.latestElectricityBill}
              onChange={(b) => updatePOA({ latestElectricityBill: b })}
              disabled={disabled}
            />
            <CheckField
              label="Latest Bank Statement"
              checked={value.entityProofOfAddress?.latestBankStatement}
              onChange={(b) => updatePOA({ latestBankStatement: b })}
              disabled={disabled}
            />
            <CheckField
              label="Registered Lease/Sale Agreement"
              checked={value.entityProofOfAddress?.registeredLeaseAgreement}
              onChange={(b) => updatePOA({ registeredLeaseAgreement: b })}
              disabled={disabled}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <TextField
              label="Validity / Expiry date"
              value={value.entityProofOfAddress?.validityExpiryDate}
              onChange={(validityExpiryDate) => updatePOA({ validityExpiryDate })}
              disabled={disabled}
            />
            <CheckField
              label="Other document"
              checked={value.entityProofOfAddress?.otherDocumentChecked}
              onChange={(b) => updatePOA({ otherDocumentChecked: b })}
              disabled={disabled}
            />
            <TextField
              label="Other document text"
              value={value.entityProofOfAddress?.otherDocumentText}
              onChange={(otherDocumentText) => updatePOA({ otherDocumentText })}
              className="md:col-span-2"
              disabled={disabled}
            />
            <CheckField
              label="Any other proof"
              checked={value.entityProofOfAddress?.anyOtherProofChecked}
              onChange={(b) => updatePOA({ anyOtherProofChecked: b })}
              disabled={disabled}
            />
            <TextField
              label="Any other proof text"
              value={value.entityProofOfAddress?.anyOtherProofText}
              onChange={(anyOtherProofText) => updatePOA({ anyOtherProofText })}
              disabled={disabled}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm">Contact Details (Page 2)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 px-4 py-4 md:grid-cols-2">
          <TextField
            label="Email"
            value={value.entityContact?.email}
            onChange={(email) => updateContact({ email })}
            type="email"
            disabled={disabled}
          />
          <TextField
            label="Email (alternate)"
            value={value.entityContact?.emailAlternate}
            onChange={(emailAlternate) => updateContact({ emailAlternate })}
            type="email"
            disabled={disabled}
          />
          <TextField
            label="Mobile"
            value={value.entityContact?.mobile}
            onChange={(mobile) => updateContact({ mobile })}
            type="tel"
            disabled={disabled}
          />
          <TextField
            label="Mobile (alternate)"
            value={value.entityContact?.mobileAlternate}
            onChange={(mobileAlternate) => updateContact({ mobileAlternate })}
            type="tel"
            disabled={disabled}
          />
          <TextField
            label="Telephone (office)"
            value={value.entityContact?.telephoneOffice}
            onChange={(telephoneOffice) => updateContact({ telephoneOffice })}
            disabled={disabled}
          />
          <TextField
            label="Fax"
            value={value.entityContact?.fax}
            onChange={(fax) => updateContact({ fax })}
            disabled={disabled}
          />
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm">Sections 4 / 5 / 6 (Page 2)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 px-4 py-4 md:grid-cols-2">
          <TextField
            label="Number of related persons"
            value={
              value.numberOfRelatedPersons != null
                ? String(value.numberOfRelatedPersons)
                : ""
            }
            onChange={(n) => {
              const num = Number(n);
              update({ numberOfRelatedPersons: Number.isFinite(num) ? num : undefined });
            }}
            type="number"
            disabled={disabled}
          />
          <TextField
            label="Applicant declaration date"
            value={value.applicantDeclarationDate}
            onChange={(applicantDeclarationDate) => update({ applicantDeclarationDate })}
            disabled={disabled}
          />
          <TextField
            label="Applicant declaration place"
            value={value.applicantDeclarationPlace}
            onChange={(applicantDeclarationPlace) => update({ applicantDeclarationPlace })}
            disabled={disabled}
          />
          <TextAreaField
            label="Remarks"
            value={value.remarks}
            onChange={(remarks) => update({ remarks })}
            className="md:col-span-2"
            rows={3}
            disabled={disabled}
          />
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm">Office Use (Page 2)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 px-4 py-4 md:grid-cols-2">
          <TextField
            label="KYC date"
            value={value.entityOfficeUse?.kycDate}
            onChange={(kycDate) => updateOffice({ kycDate })}
            disabled={disabled}
          />
          <TextField
            label="Employee name"
            value={value.entityOfficeUse?.employeeName}
            onChange={(employeeName) => updateOffice({ employeeName })}
            disabled={disabled}
          />
          <TextField
            label="Employee code"
            value={value.entityOfficeUse?.employeeCode}
            onChange={(employeeCode) => updateOffice({ employeeCode })}
            disabled={disabled}
          />
          <TextField
            label="Employee designation"
            value={value.entityOfficeUse?.employeeDesignation}
            onChange={(employeeDesignation) => updateOffice({ employeeDesignation })}
            disabled={disabled}
          />
          <CheckField
            label="Self-certified copies received"
            checked={value.entityOfficeUse?.selfCertifiedReceived}
            onChange={(b) => updateOffice({ selfCertifiedReceived: b })}
            disabled={disabled}
          />
          <CheckField
            label="True copies received"
            checked={value.entityOfficeUse?.trueCopiesReceived}
            onChange={(b) => updateOffice({ trueCopiesReceived: b })}
            disabled={disabled}
          />
          <TextField
            label="AMC / Intermediary code"
            value={value.entityOfficeUse?.amcIntermediaryCode}
            onChange={(amcIntermediaryCode) => updateOffice({ amcIntermediaryCode })}
            className="md:col-span-2"
            disabled={disabled}
          />
        </CardContent>
      </Card>
    </div>
  );
}
