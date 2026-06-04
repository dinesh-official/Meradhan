"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AddressFields,
  CheckField,
  ProofFields,
  SectionHeading,
  SelectField,
  TextField,
} from "./FormPrimitives";
import {
  GENDERS,
  MARITAL_STATUSES,
  NATIONALITIES,
  OCCUPATION_TYPES,
  PEP_STATUSES,
  RELATED_PERSON_TYPES,
  RESIDENTIAL_STATUSES,
  type CorporateKycData,
  type FATCASelfDeclaration,
  type Gender,
  type MaritalStatus,
  type Nationality,
  type OccupationType,
  type OfficeUseDetails,
  type PEPStatus,
  type ProofDocument,
  type RelatedPerson,
  type RelatedPersonContact,
  type RelatedPersonType,
  type ResidentialStatus,
} from "../_utils/mapToPdfPayload";

type Props = {
  value: CorporateKycData;
  onChange: (next: CorporateKycData) => void;
  disabled?: boolean;
};

export default function RelatedPersonTab({ value, onChange, disabled }: Props) {
  const rp = value.relatedPerson ?? {};
  const update = (patch: Partial<RelatedPerson>) =>
    onChange({ ...value, relatedPerson: { ...rp, ...patch } });
  const updateContact = (patch: Partial<RelatedPersonContact>) =>
    update({ contact: { ...(rp.contact ?? {}), ...patch } });
  const updateFatca = (patch: Partial<FATCASelfDeclaration>) =>
    update({ fatca: { ...(rp.fatca ?? {}), ...patch } });
  const updateOffice = (patch: Partial<OfficeUseDetails>) =>
    update({ officeUse: { ...(rp.officeUse ?? {}), ...patch } });
  const setProofId = (proofOfIdentity: ProofDocument) => update({ proofOfIdentity });
  const setProofAddr = (proofOfAddress: ProofDocument) => update({ proofOfAddress });

  const toggleType = (t: RelatedPersonType) => {
    const cur = rp.relatedPersonTypes ?? [];
    const next = cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t];
    update({ relatedPersonTypes: next });
  };

  return (
    <div className="space-y-4">
      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm">Related Person — Identity (Page 6)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 py-4">
          <div className="grid gap-3 md:grid-cols-2">
            <TextField
              label="PAN"
              value={rp.pan}
              onChange={(pan) => update({ pan })}
              disabled={disabled}
            />
            <CheckField
              label="Form 60 submitted"
              checked={rp.form60}
              onChange={(form60) => update({ form60 })}
              disabled={disabled}
            />
            <TextField
              label="Full name"
              value={rp.name}
              onChange={(name) => update({ name })}
              className="md:col-span-2"
              disabled={disabled}
            />
            <TextField
              label="Maiden name"
              value={rp.maidenName}
              onChange={(maidenName) => update({ maidenName })}
              disabled={disabled}
            />
            <TextField
              label="Father / spouse name"
              value={rp.fatherOrSpouseName}
              onChange={(fatherOrSpouseName) => update({ fatherOrSpouseName })}
              disabled={disabled}
            />
            <TextField
              label="Mother name"
              value={rp.motherName}
              onChange={(motherName) => update({ motherName })}
              disabled={disabled}
            />
            <TextField
              label="Date of birth (DD / MM / YYYY)"
              value={rp.dateOfBirth}
              onChange={(dateOfBirth) => update({ dateOfBirth })}
              disabled={disabled}
            />
            <SelectField
              label="Gender"
              value={rp.gender}
              onChange={(v) => update({ gender: v as Gender })}
              options={GENDERS}
              disabled={disabled}
            />
            <SelectField
              label="Marital status"
              value={rp.maritalStatus}
              onChange={(v) => update({ maritalStatus: v as MaritalStatus })}
              options={MARITAL_STATUSES}
              disabled={disabled}
            />
            <SelectField
              label="Nationality"
              value={rp.nationality}
              onChange={(v) => update({ nationality: v as Nationality })}
              options={NATIONALITIES}
              disabled={disabled}
            />
            <SelectField
              label="Residential status"
              value={rp.residentialStatus}
              onChange={(v) => update({ residentialStatus: v as ResidentialStatus })}
              options={RESIDENTIAL_STATUSES}
              disabled={disabled}
            />
            <SelectField
              label="Occupation type"
              value={rp.occupationType}
              onChange={(v) => update({ occupationType: v as OccupationType })}
              options={OCCUPATION_TYPES}
              disabled={disabled}
            />
            <TextField
              label="Occupation — other"
              value={rp.occupationOther}
              onChange={(occupationOther) => update({ occupationOther })}
              disabled={disabled}
            />
            <TextField
              label="DIN"
              value={rp.din}
              onChange={(din) => update({ din })}
              disabled={disabled}
            />
            <TextField
              label="Photo URL (HTTPS)"
              value={rp.photoUrl}
              onChange={(photoUrl) => update({ photoUrl })}
              className="md:col-span-2"
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <SectionHeading title="Related person types (multi-select)" />
            <div className="grid gap-0.5 md:grid-cols-3">
              {RELATED_PERSON_TYPES.map((t) => (
                <CheckField
                  key={t}
                  label={t}
                  checked={(rp.relatedPersonTypes ?? []).includes(t)}
                  onChange={() => toggleType(t)}
                  disabled={disabled}
                />
              ))}
            </div>
            <TextField
              label='Other (used when "Others" selected)'
              value={rp.relatedPersonOther}
              onChange={(relatedPersonOther) => update({ relatedPersonOther })}
              disabled={disabled}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm">Proof of Identity</CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-4">
          <ProofFields
            value={rp.proofOfIdentity}
            onChange={setProofId}
            disabled={disabled}
          />
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm">Correspondence Address</CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-4">
          <AddressFields
            value={rp.correspondenceAddress}
            onChange={(correspondenceAddress) => update({ correspondenceAddress })}
            disabled={disabled}
          />
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm">
            Overseas Address (mandatory for NRIs)
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-4">
          <AddressFields
            value={rp.overseasAddress}
            onChange={(overseasAddress) => update({ overseasAddress })}
            disabled={disabled}
          />
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm">Proof of Address</CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-4">
          <ProofFields
            value={rp.proofOfAddress}
            onChange={setProofAddr}
            disabled={disabled}
          />
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm">Contact</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 px-4 py-4 md:grid-cols-2">
          <TextField
            label="Email"
            value={rp.contact?.email}
            onChange={(email) => updateContact({ email })}
            type="email"
            disabled={disabled}
          />
          <TextField
            label="Mobile"
            value={rp.contact?.mobile}
            onChange={(mobile) => updateContact({ mobile })}
            type="tel"
            disabled={disabled}
          />
          <TextField
            label="Mobile (alternate)"
            value={rp.contact?.mobileAlternate}
            onChange={(mobileAlternate) => updateContact({ mobileAlternate })}
            type="tel"
            disabled={disabled}
          />
          <TextField
            label="Telephone (office)"
            value={rp.contact?.telephoneOffice}
            onChange={(telephoneOffice) => updateContact({ telephoneOffice })}
            disabled={disabled}
          />
          <TextField
            label="Telephone (residence)"
            value={rp.contact?.telephoneResidence}
            onChange={(telephoneResidence) => updateContact({ telephoneResidence })}
            disabled={disabled}
          />
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm">FATCA / PEP / Declaration (Page 7)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 py-4">
          <div className="space-y-0.5">
            <CheckField
              label="I am a tax resident of India and not resident of any other country"
              checked={rp.fatca?.taxResidentIndiaOnly}
              onChange={(b) => updateFatca({ taxResidentIndiaOnly: b })}
              disabled={disabled}
            />
            <CheckField
              label="I am a tax resident of country/ies as per details in ANNEXURE 1.1"
              checked={rp.fatca?.taxResidentOther}
              onChange={(b) => updateFatca({ taxResidentOther: b })}
              disabled={disabled}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <SelectField
              label="PEP status"
              value={rp.pepStatus}
              onChange={(v) => update({ pepStatus: v as PEPStatus })}
              options={PEP_STATUSES}
              disabled={disabled}
            />
            <TextField
              label="Declaration date"
              value={rp.declarationDate}
              onChange={(declarationDate) => update({ declarationDate })}
              disabled={disabled}
            />
            <TextField
              label="Declaration place"
              value={rp.declarationPlace}
              onChange={(declarationPlace) => update({ declarationPlace })}
              disabled={disabled}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm">Office Use (Page 7)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 px-4 py-4 md:grid-cols-2">
          <TextField
            label="KYC date"
            value={rp.officeUse?.kycDate}
            onChange={(kycDate) => updateOffice({ kycDate })}
            disabled={disabled}
          />
          <TextField
            label="Employee name"
            value={rp.officeUse?.employeeName}
            onChange={(employeeName) => updateOffice({ employeeName })}
            disabled={disabled}
          />
          <TextField
            label="Employee code"
            value={rp.officeUse?.employeeCode}
            onChange={(employeeCode) => updateOffice({ employeeCode })}
            disabled={disabled}
          />
          <TextField
            label="Employee designation"
            value={rp.officeUse?.employeeDesignation}
            onChange={(employeeDesignation) => updateOffice({ employeeDesignation })}
            disabled={disabled}
          />
          <CheckField
            label="Self-certified copies received"
            checked={rp.officeUse?.selfCertifiedReceived}
            onChange={(b) => updateOffice({ selfCertifiedReceived: b })}
            disabled={disabled}
          />
          <CheckField
            label="True copies received"
            checked={rp.officeUse?.trueCopiesReceived}
            onChange={(b) => updateOffice({ trueCopiesReceived: b })}
            disabled={disabled}
          />
          <TextField
            label="AMC / Intermediary code"
            value={rp.officeUse?.amcIntermediaryCode}
            onChange={(amcIntermediaryCode) => updateOffice({ amcIntermediaryCode })}
            className="md:col-span-2"
            disabled={disabled}
          />
        </CardContent>
      </Card>
    </div>
  );
}
