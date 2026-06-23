"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import {
  CheckField,
  SelectField,
  TextAreaField,
  TextField,
} from "./FormPrimitives";
import {
  FATCA_ENTITY_TYPES,
  GIIN_NOT_AVAILABLE_REASONS,
  KRA_ADDRESS_TYPES,
  PROMOTER_PEP,
  YES_NO,
  type Annexure1,
  type Annexure11,
  type Annexure11PartC,
  type Annexure12,
  type CorporateKycData,
  type FatcaEntityType,
  type GIINNotAvailableReason,
  type KraAddressType,
  type Promoter,
  type PromoterPep,
  type TaxResidencyRow,
  type UBO,
  type YesNo,
} from "../_utils/mapToPdfPayload";

type Props = {
  value: CorporateKycData;
  onChange: (next: CorporateKycData) => void;
  disabled?: boolean;
};

const emptyPromoter = (): Promoter => ({
  pan: "",
  name: "",
  dinOrAadhaar: "",
  address: "",
  relationship: "",
  politicallyExposed: "No",
});

const emptyResidency = (): TaxResidencyRow => ({
  country: "",
  tin: "",
  identificationType: "",
});

const emptyUBO = (): UBO => ({
  name: "",
  fatherName: "",
  gender: "",
  address: "",
  dateOfBirth: "",
  countryOfBirth: "India",
  nationality: "Indian",
  isUSPerson: "N",
  countryOfTaxResidence: "India",
  tin: "",
  shareholdingPercent: "",
  idProofSubmitted: "PAN",
  relationshipWithEntity: "",
});

/* ------------------- Annexure 1 — Promoters ------------------- */

export function PromotersTab({ value, onChange, disabled }: Props) {
  const a1 = value.annexure1 ?? {};
  const promoters = a1.promoters ?? [];
  const update = (patch: Partial<Annexure1>) =>
    onChange({ ...value, annexure1: { ...a1, ...patch } });
  const updatePromoter = (idx: number, patch: Partial<Promoter>) => {
    const next = [...promoters];
    next[idx] = { ...next[idx], ...patch };
    update({ promoters: next });
  };
  const add = () => update({ promoters: [...promoters, emptyPromoter()] });
  const remove = (idx: number) =>
    update({ promoters: promoters.filter((_, i) => i !== idx) });

  return (
    <div className="space-y-4">
      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm">Annexure 1 header (Page 11)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 px-4 py-4 md:grid-cols-2">
          <TextField
            label="Applicant name"
            value={a1.applicantName}
            onChange={(applicantName) => update({ applicantName })}
            disabled={disabled}
          />
          <TextField
            label="Applicant PAN"
            value={a1.applicantPan}
            onChange={(applicantPan) => update({ applicantPan })}
            disabled={disabled}
          />
          <TextField
            label="Min rows"
            value={a1.minRows != null ? String(a1.minRows) : ""}
            onChange={(n) => {
              const num = Number(n);
              update({ minRows: Number.isFinite(num) ? num : undefined });
            }}
            type="number"
            disabled={disabled}
          />
          <TextField
            label="Date"
            value={a1.date}
            onChange={(date) => update({ date })}
            disabled={disabled}
          />
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
          <CardTitle className="text-sm">
            Promoters / Directors / Partners ({promoters.length})
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={add}
            disabled={disabled}
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 px-4 py-4">
          {promoters.length === 0 ? (
            <p className="text-sm text-muted-foreground">No promoters yet.</p>
          ) : null}
          {promoters.map((p, idx) => (
            <div key={idx} className="rounded-md border p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Row #{idx + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => remove(idx)}
                  disabled={disabled}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <TextField
                  label="PAN"
                  value={p.pan}
                  onChange={(pan) => updatePromoter(idx, { pan })}
                  disabled={disabled}
                />
                <TextField
                  label="Name"
                  value={p.name}
                  onChange={(name) => updatePromoter(idx, { name })}
                  disabled={disabled}
                />
                <TextField
                  label="DIN / Aadhaar"
                  value={p.dinOrAadhaar}
                  onChange={(dinOrAadhaar) => updatePromoter(idx, { dinOrAadhaar })}
                  disabled={disabled}
                />
                <TextField
                  label="Relationship"
                  value={p.relationship}
                  onChange={(relationship) => updatePromoter(idx, { relationship })}
                  disabled={disabled}
                />
                <TextAreaField
                  label="Address"
                  value={p.address}
                  onChange={(address) => updatePromoter(idx, { address })}
                  className="md:col-span-2"
                  rows={2}
                  disabled={disabled}
                />
                <SelectField
                  label="Politically exposed"
                  value={p.politicallyExposed}
                  onChange={(v) =>
                    updatePromoter(idx, { politicallyExposed: v as PromoterPep })
                  }
                  options={PROMOTER_PEP}
                  disabled={disabled}
                />
                <TextField
                  label="Photo URL"
                  value={p.photoUrl}
                  onChange={(photoUrl) => updatePromoter(idx, { photoUrl })}
                  disabled={disabled}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------- Annexure 11 — FATCA / CRS ------------------- */

export function FatcaTab({ value, onChange, disabled }: Props) {
  const a = value.annexure11 ?? {};
  const residencies = a.taxResidencies ?? [];
  const update = (patch: Partial<Annexure11>) =>
    onChange({ ...value, annexure11: { ...a, ...patch } });
  const updateRow = (idx: number, patch: Partial<TaxResidencyRow>) => {
    const next = [...residencies];
    next[idx] = { ...next[idx], ...patch };
    update({ taxResidencies: next });
  };
  const add = () =>
    update({ taxResidencies: [...residencies, emptyResidency()] });
  const remove = (idx: number) =>
    update({ taxResidencies: residencies.filter((_, i) => i !== idx) });

  return (
    <div className="space-y-4">
      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm">FATCA / CRS — Part A & B (Page 12)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 px-4 py-4 md:grid-cols-2">
          <TextField
            label="Entity name"
            value={a.entityName}
            onChange={(entityName) => update({ entityName })}
            disabled={disabled}
          />
          <TextField
            label="PAN"
            value={a.pan}
            onChange={(pan) => update({ pan })}
            disabled={disabled}
          />
          <TextField
            label="Date of incorporation"
            value={a.dateOfIncorporation}
            onChange={(dateOfIncorporation) => update({ dateOfIncorporation })}
            disabled={disabled}
          />
          <TextField
            label="Place of incorporation"
            value={a.placeOfIncorporation}
            onChange={(placeOfIncorporation) => update({ placeOfIncorporation })}
            disabled={disabled}
          />
          <TextField
            label="Country of incorporation"
            value={a.countryOfIncorporation}
            onChange={(countryOfIncorporation) => update({ countryOfIncorporation })}
            disabled={disabled}
          />
          <SelectField
            label="Address type at KRA"
            value={a.addressTypeAtKRA}
            onChange={(v) => update({ addressTypeAtKRA: v as KraAddressType })}
            options={KRA_ADDRESS_TYPES}
            disabled={disabled}
          />
          <TextField
            label="Entity constitution type"
            value={a.entityConstitutionType}
            onChange={(entityConstitutionType) => update({ entityConstitutionType })}
            disabled={disabled}
          />
          <SelectField
            label="Tax resident elsewhere?"
            value={a.isTaxResidentElsewhere}
            onChange={(v) => update({ isTaxResidentElsewhere: v as YesNo })}
            options={YES_NO}
            disabled={disabled}
          />
          <TextField
            label="US exemption code"
            value={a.usExemptionCode}
            onChange={(usExemptionCode) => update({ usExemptionCode })}
            disabled={disabled}
          />
          <SelectField
            label="Entity type (FATCA)"
            value={a.entityType}
            onChange={(v) => update({ entityType: v as FatcaEntityType })}
            options={FATCA_ENTITY_TYPES}
            disabled={disabled}
          />
          <TextField
            label="GIIN"
            value={a.giin}
            onChange={(giin) => update({ giin })}
            disabled={disabled}
          />
          <TextField
            label="Sponsoring entity name"
            value={a.sponsoringEntityName}
            onChange={(sponsoringEntityName) => update({ sponsoringEntityName })}
            disabled={disabled}
          />
          <SelectField
            label="GIIN not available — reason"
            value={a.giinNotAvailableReason}
            onChange={(v) =>
              update({ giinNotAvailableReason: v as GIINNotAvailableReason })
            }
            options={GIIN_NOT_AVAILABLE_REASONS}
            disabled={disabled}
          />
          <TextField
            label="Min tax-residency rows"
            value={a.minTaxResidencyRows != null ? String(a.minTaxResidencyRows) : ""}
            onChange={(n) => {
              const num = Number(n);
              update({ minTaxResidencyRows: Number.isFinite(num) ? num : undefined });
            }}
            type="number"
            disabled={disabled}
          />
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
          <CardTitle className="text-sm">Tax residencies ({residencies.length})</CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={add}
            disabled={disabled}
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 px-4 py-4">
          {residencies.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tax residencies yet.</p>
          ) : null}
          {residencies.map((r, idx) => (
            <div key={idx} className="rounded-md border p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Row #{idx + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => remove(idx)}
                  disabled={disabled}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <TextField
                  label="Country"
                  value={r.country}
                  onChange={(country) => updateRow(idx, { country })}
                  disabled={disabled}
                />
                <TextField
                  label="TIN"
                  value={r.tin}
                  onChange={(tin) => updateRow(idx, { tin })}
                  disabled={disabled}
                />
                <TextField
                  label="Identification type"
                  value={r.identificationType}
                  onChange={(identificationType) =>
                    updateRow(idx, { identificationType })
                  }
                  disabled={disabled}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------- Annexure 11 Part C — NFE ------------------- */

export function NfeTab({ value, onChange, disabled }: Props) {
  const a = value.annexure11PartC ?? {};
  const update = (patch: Partial<Annexure11PartC>) =>
    onChange({ ...value, annexure11PartC: { ...a, ...patch } });

  return (
    <div className="space-y-4">
      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm">NFE Classification (Page 13)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 py-4">
          <div className="grid gap-3 md:grid-cols-2">
            <CheckField
              label="Is listed company"
              checked={a.isListedCompany}
              onChange={(b) => update({ isListedCompany: b })}
              disabled={disabled}
            />
            <TextField
              label="Stock exchanges (comma-separated)"
              value={(a.stockExchanges ?? []).join(", ")}
              onChange={(v) =>
                update({
                  stockExchanges: v
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              disabled={disabled}
            />
            <CheckField
              label="Is related to a listed company"
              checked={a.isRelatedToListed}
              onChange={(b) => update({ isRelatedToListed: b })}
              disabled={disabled}
            />
            <TextField
              label="Listed company name"
              value={a.listedCompanyName}
              onChange={(listedCompanyName) => update({ listedCompanyName })}
              disabled={disabled}
            />
            <TextField
              label="Listed company stock exchange"
              value={a.listedCompanyStockExchange}
              onChange={(listedCompanyStockExchange) =>
                update({ listedCompanyStockExchange })
              }
              disabled={disabled}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <CheckField
              label="Active NFE"
              checked={a.isActiveNFE}
              onChange={(b) => update({ isActiveNFE: b })}
              disabled={disabled}
            />
            <TextField
              label="Active NFE — nature of business"
              value={a.activeNFENature}
              onChange={(activeNFENature) => update({ activeNFENature })}
              disabled={disabled}
            />
            <TextField
              label="Active NFE — sub-category"
              value={a.activeNFESubCategory}
              onChange={(activeNFESubCategory) => update({ activeNFESubCategory })}
              className="md:col-span-2"
              disabled={disabled}
            />
            <CheckField
              label="Passive NFE"
              checked={a.isPassiveNFE}
              onChange={(b) => update({ isPassiveNFE: b })}
              disabled={disabled}
            />
            <TextField
              label="Passive NFE — nature of business"
              value={a.passiveNFENature}
              onChange={(passiveNFENature) => update({ passiveNFENature })}
              disabled={disabled}
            />
            <CheckField
              label="UBO form submitted"
              checked={a.uboFormSubmitted}
              onChange={(b) => update({ uboFormSubmitted: b })}
              disabled={disabled}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <TextField
              label="For (entity name)"
              value={a.forName}
              onChange={(forName) => update({ forName })}
              disabled={disabled}
            />
            <TextField
              label="Authorized signatory name"
              value={a.name}
              onChange={(name) => update({ name })}
              disabled={disabled}
            />
            <TextField
              label="Designation"
              value={a.designation}
              onChange={(designation) => update({ designation })}
              disabled={disabled}
            />
            <TextField
              label="DIN / PAN"
              value={a.dinPan}
              onChange={(dinPan) => update({ dinPan })}
              disabled={disabled}
            />
            <TextField
              label="Date"
              value={a.date}
              onChange={(date) => update({ date })}
              disabled={disabled}
            />
            <TextField
              label="Place"
              value={a.place}
              onChange={(place) => update({ place })}
              disabled={disabled}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------- Annexure 12 — UBO ------------------- */

export function UboTab({ value, onChange, disabled }: Props) {
  const a = value.annexure12 ?? {};
  const ubos = a.ubos ?? [];
  const update = (patch: Partial<Annexure12>) =>
    onChange({ ...value, annexure12: { ...a, ...patch } });
  const updateUbo = (idx: number, patch: Partial<UBO>) => {
    const next = [...ubos];
    next[idx] = { ...next[idx], ...patch };
    update({ ubos: next });
  };
  const add = () => update({ ubos: [...ubos, emptyUBO()] });
  const remove = (idx: number) => update({ ubos: ubos.filter((_, i) => i !== idx) });

  return (
    <div className="space-y-4">
      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm">UBO Declaration (Page 14)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 py-4">
          <div className="grid gap-0.5 md:grid-cols-2">
            <CheckField
              label="Declare with UBOs (UBOs listed below)"
              checked={a.declareWithUBOs}
              onChange={(b) => update({ declareWithUBOs: b })}
              disabled={disabled}
            />
            <CheckField
              label="Declare no UBOs (no individual ≥ 10%)"
              checked={a.declareNoUBOs}
              onChange={(b) => update({ declareNoUBOs: b })}
              disabled={disabled}
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <TextField
              label="For (entity name)"
              value={a.forName}
              onChange={(forName) => update({ forName })}
              disabled={disabled}
            />
            <TextField
              label="Authorized signatory name"
              value={a.name}
              onChange={(name) => update({ name })}
              disabled={disabled}
            />
            <TextField
              label="Designation"
              value={a.designation}
              onChange={(designation) => update({ designation })}
              disabled={disabled}
            />
            <TextField
              label="DIN / PAN"
              value={a.dinPan}
              onChange={(dinPan) => update({ dinPan })}
              disabled={disabled}
            />
            <TextField
              label="Date"
              value={a.date}
              onChange={(date) => update({ date })}
              disabled={disabled}
            />
            <TextField
              label="Place"
              value={a.place}
              onChange={(place) => update({ place })}
              disabled={disabled}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
          <CardTitle className="text-sm">UBOs ({ubos.length})</CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={add}
            disabled={disabled}
          >
            <Plus className="h-4 w-4" />
            Add UBO
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 px-4 py-4">
          {ubos.length === 0 ? (
            <p className="text-sm text-muted-foreground">No UBOs declared.</p>
          ) : null}
          {ubos.map((u, idx) => (
            <div key={idx} className="rounded-md border p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">UBO #{idx + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => remove(idx)}
                  disabled={disabled}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <TextField
                  label="Name"
                  value={u.name}
                  onChange={(name) => updateUbo(idx, { name })}
                  disabled={disabled}
                />
                <TextField
                  label="Father name"
                  value={u.fatherName}
                  onChange={(fatherName) => updateUbo(idx, { fatherName })}
                  disabled={disabled}
                />
                <TextField
                  label="Gender (M / F / T)"
                  value={u.gender}
                  onChange={(gender) => updateUbo(idx, { gender })}
                  disabled={disabled}
                />
                <TextField
                  label="Date of birth"
                  value={u.dateOfBirth}
                  onChange={(dateOfBirth) => updateUbo(idx, { dateOfBirth })}
                  disabled={disabled}
                />
                <TextField
                  label="Country of birth"
                  value={u.countryOfBirth}
                  onChange={(countryOfBirth) => updateUbo(idx, { countryOfBirth })}
                  disabled={disabled}
                />
                <TextField
                  label="Nationality"
                  value={u.nationality}
                  onChange={(nationality) => updateUbo(idx, { nationality })}
                  disabled={disabled}
                />
                <SelectField
                  label="Is US person"
                  value={u.isUSPerson}
                  onChange={(v) => updateUbo(idx, { isUSPerson: v as "Y" | "N" })}
                  options={["Y", "N"] as const}
                  disabled={disabled}
                />
                <TextField
                  label="Country of tax residence"
                  value={u.countryOfTaxResidence}
                  onChange={(countryOfTaxResidence) =>
                    updateUbo(idx, { countryOfTaxResidence })
                  }
                  disabled={disabled}
                />
                <TextField
                  label="TIN"
                  value={u.tin}
                  onChange={(tin) => updateUbo(idx, { tin })}
                  disabled={disabled}
                />
                <TextField
                  label="Shareholding %"
                  value={u.shareholdingPercent}
                  onChange={(shareholdingPercent) =>
                    updateUbo(idx, { shareholdingPercent })
                  }
                  disabled={disabled}
                />
                <TextField
                  label="ID proof submitted"
                  value={u.idProofSubmitted}
                  onChange={(idProofSubmitted) =>
                    updateUbo(idx, { idProofSubmitted })
                  }
                  disabled={disabled}
                />
                <TextField
                  label="Relationship with entity"
                  value={u.relationshipWithEntity}
                  onChange={(relationshipWithEntity) =>
                    updateUbo(idx, { relationshipWithEntity })
                  }
                  disabled={disabled}
                />
                <TextAreaField
                  label="Address"
                  value={u.address}
                  onChange={(address) => updateUbo(idx, { address })}
                  className="md:col-span-2"
                  rows={2}
                  disabled={disabled}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------- NCL Annexure ------------------- */

export function NclTab({ value, onChange, disabled }: Props) {
  const a = value.nclAnnexure ?? {};
  const v = a.values ?? {};
  const update = (patch: Partial<typeof a>) =>
    onChange({ ...value, nclAnnexure: { ...a, ...patch } });
  const updateValues = (patch: Partial<typeof v>) =>
    update({ values: { ...v, ...patch } });

  return (
    <div className="space-y-4">
      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm">NCL Annexure (Page 15)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 px-4 py-4 md:grid-cols-2">
          <TextField
            label="Date"
            value={a.date}
            onChange={(date) => update({ date })}
            disabled={disabled}
          />
          <TextField
            label="Authorised signatory — name"
            value={a.authorisedSignatoryName}
            onChange={(authorisedSignatoryName) =>
              update({ authorisedSignatoryName })
            }
            disabled={disabled}
          />
          <TextField
            label="Authorised signatory — designation"
            value={a.authorisedSignatoryDesignation}
            onChange={(authorisedSignatoryDesignation) =>
              update({ authorisedSignatoryDesignation })
            }
            className="md:col-span-2"
            disabled={disabled}
          />
        </CardContent>
      </Card>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm">NCL form values (rows 1–19)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 px-4 py-4 md:grid-cols-2">
          <TextField label="1. Participant name" value={v.participantName} onChange={(participantName) => updateValues({ participantName })} disabled={disabled} />
          <TextField label="2. Participant code" value={v.participantCode} onChange={(participantCode) => updateValues({ participantCode })} disabled={disabled} />
          <TextField label="3. Contact person" value={v.contactPerson} onChange={(contactPerson) => updateValues({ contactPerson })} disabled={disabled} />
          <TextField label="4. Contact email" value={v.contactEmail} onChange={(contactEmail) => updateValues({ contactEmail })} type="email" disabled={disabled} />
          <TextAreaField label="5. Communication address (incl. PIN)" value={v.communicationAddress} onChange={(communicationAddress) => updateValues({ communicationAddress })} className="md:col-span-2" rows={2} disabled={disabled} />
          <TextField label="6. Contact phone (incl. STD)" value={v.contactPhone} onChange={(contactPhone) => updateValues({ contactPhone })} type="tel" disabled={disabled} />
          <TextField label="7. Fax number" value={v.faxNumber} onChange={(faxNumber) => updateValues({ faxNumber })} disabled={disabled} />
          <TextField label="8. Bank name" value={v.bankName} onChange={(bankName) => updateValues({ bankName })} disabled={disabled} />
          <TextField label="9. Bank branch" value={v.bankBranch} onChange={(bankBranch) => updateValues({ bankBranch })} disabled={disabled} />
          <TextField label="10. RTGS IFSC" value={v.bankIfsc} onChange={(bankIfsc) => updateValues({ bankIfsc })} disabled={disabled} />
          <TextField label="11. Bank account number" value={v.bankAccountNumber} onChange={(bankAccountNumber) => updateValues({ bankAccountNumber })} disabled={disabled} />
          <SelectField label="12. Depository" value={v.depository} onChange={(d) => updateValues({ depository: d as "CDSL" | "NSDL" })} options={["CDSL", "NSDL"] as const} disabled={disabled} />
          <TextField label="13. DP name" value={v.dpName} onChange={(dpName) => updateValues({ dpName })} disabled={disabled} />
          <TextField label="14. DP ID" value={v.dpId} onChange={(dpId) => updateValues({ dpId })} disabled={disabled} />
          <TextField label="15. Client ID" value={v.clientId} onChange={(clientId) => updateValues({ clientId })} disabled={disabled} />
          <TextField label="16. PAN" value={v.pan} onChange={(pan) => updateValues({ pan })} disabled={disabled} />
          <TextAreaField label="17. Registered office address (for GST)" value={v.registeredOfficeAddress} onChange={(registeredOfficeAddress) => updateValues({ registeredOfficeAddress })} className="md:col-span-2" rows={2} disabled={disabled} />
          <TextField label="18. GSTIN (15-digit)" value={v.gstNumber} onChange={(gstNumber) => updateValues({ gstNumber })} disabled={disabled} />
          <TextField label="19. Registered office state" value={v.registeredOfficeState} onChange={(registeredOfficeState) => updateValues({ registeredOfficeState })} disabled={disabled} />
        </CardContent>
      </Card>
    </div>
  );
}
