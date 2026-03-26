"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LabelView from "@/global/elements/wrapper/LabelView";
import type { CorporateKycResponse } from "@root/apiGateway";

function formatOptional(value: string | undefined | null): string {
  return value != null && value !== "" ? String(value) : "—";
}

/** Short display name from URL, e.g. "filename........pdf" */
function shortFileName(url: string, maxLen = 24): string {
  try {
    const name = url.split("/").filter(Boolean).pop() ?? url;
    const lastDot = name.lastIndexOf(".");
    const ext = lastDot > 0 ? name.slice(lastDot) : "";
    const base = lastDot > 0 ? name.slice(0, lastDot) : name;
    if (base.length + ext.length <= maxLen) return name;
    const keep = Math.max(4, maxLen - ext.length - 8);
    return base.slice(0, keep) + "........" + ext;
  } catch {
    return url.length > maxLen ? url.slice(0, maxLen - 4) + "...." : url;
  }
}

export function EntitySection({ data }: { data: CorporateKycResponse }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Entity details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <LabelView title="Entity name">
            <p>{formatOptional(data.entityName)}</p>
          </LabelView>
          <LabelView title="Date of commencement of business">
            <p>{formatOptional(data.dateOfCommencementOfBusiness)}</p>
          </LabelView>
          <LabelView title="Country of incorporation">
            <p>{formatOptional(data.countryOfIncorporation)}</p>
          </LabelView>
          <LabelView title="Entity constitution type">
            <p>{formatOptional(data.entityConstitutionType)}</p>
          </LabelView>
          {data.entityConstitutionType === "OTHER" && (
            <LabelView title="Other constitution type">
              <p>{formatOptional(data.otherConstitutionType)}</p>
            </LabelView>
          )}
          <LabelView title="Date of incorporation">
            <p>{formatOptional(data.dateOfIncorporation)}</p>
          </LabelView>
          <LabelView title="Place of incorporation">
            <p>{formatOptional(data.placeOfIncorporation)}</p>
          </LabelView>
          <LabelView title="PAN number">
            <p>{formatOptional(data.panNumber)}</p>
          </LabelView>
          <LabelView title="CIN / Registration number">
            <p>{formatOptional(data.cinOrRegistrationNumber)}</p>
          </LabelView>
        </div>
      </CardContent>
    </Card>
  );
}

export function AddressSection({ data }: { data: CorporateKycResponse }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Correspondence address</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <LabelView title="Full address" className="md:col-span-2">
            <p>{formatOptional(data.correspondenceFullAddress)}</p>
          </LabelView>
          <LabelView title="Line 1">
            <p>{formatOptional(data.correspondenceLine1)}</p>
          </LabelView>
          <LabelView title="Line 2">
            <p>{formatOptional(data.correspondenceLine2)}</p>
          </LabelView>
          <LabelView title="City">
            <p>{formatOptional(data.correspondenceCity)}</p>
          </LabelView>
          <LabelView title="District">
            <p>{formatOptional(data.correspondenceDistrict)}</p>
          </LabelView>
          <LabelView title="State">
            <p>{formatOptional(data.correspondenceState)}</p>
          </LabelView>
          <LabelView title="PIN code">
            <p>{formatOptional(data.correspondencePinCode)}</p>
          </LabelView>
        </div>
      </CardContent>
    </Card>
  );
}

export function FatcaSection({ data }: { data: CorporateKycResponse }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>FATCA</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <LabelView title="FATCA applicable">
            <p>{data.fatcaApplicable ? "Yes" : "No"}</p>
          </LabelView>
          {data.fatcaApplicable && (
            <>
              <LabelView title="FATCA entity name">
                <p>{formatOptional(data.fatcaEntityName)}</p>
              </LabelView>
              <LabelView title="FATCA country of incorporation">
                <p>{formatOptional(data.fatcaCountryOfIncorporation)}</p>
              </LabelView>
              <LabelView title="FATCA entity type">
                <p>{formatOptional(data.fatcaEntityType)}</p>
              </LabelView>
              <LabelView title="GIIN">
                <p>{formatOptional(data.giin)}</p>
              </LabelView>
              <LabelView title="Tax residency of entity">
                <p>{formatOptional(data.taxResidencyOfEntity)}</p>
              </LabelView>
              <LabelView title="Declaration by authorised signatory">
                <p>{data.declarationByAuthorisedSignatory ? "Yes" : "No"}</p>
              </LabelView>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function BankAccountsSection({ data }: { data: CorporateKycResponse }) {
  const list = data.bankAccounts ?? [];
  if (list.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank accounts</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {list.map((acc, index) => (
          <div
            key={acc.id ?? index}
            className="rounded-lg border p-4 grid gap-3 md:grid-cols-2"
          >
            <LabelView title="Account holder name">
              <p>{formatOptional(acc.accountHolderName)}</p>
            </LabelView>
            <LabelView title="Account number">
              <p>{formatOptional(acc.accountNumber)}</p>
            </LabelView>
            <LabelView title="Bank name">
              <p>{formatOptional(acc.bankName)}</p>
            </LabelView>
            <LabelView title="IFSC code">
              <p>{formatOptional(acc.ifscCode)}</p>
            </LabelView>
            <LabelView title="Branch">
              <p>{formatOptional(acc.branch)}</p>
            </LabelView>
            <LabelView title="Primary account">
              <p>{acc.isPrimaryAccount ? "Yes" : "No"}</p>
            </LabelView>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function DematAccountsSection({ data }: { data: CorporateKycResponse }) {
  const list = data.dematAccounts ?? [];
  if (list.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Demat accounts</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {list.map((acc, index) => (
          <div
            key={acc.id ?? index}
            className="rounded-lg border p-4 grid gap-3 md:grid-cols-2"
          >
            <LabelView title="Depository">
              <p>{formatOptional(acc.depository)}</p>
            </LabelView>
            <LabelView title="Account holder name">
              <p>{formatOptional(acc.accountHolderName)}</p>
            </LabelView>
            <LabelView title="DP ID">
              <p>{formatOptional(acc.dpId)}</p>
            </LabelView>
            <LabelView title="Client ID">
              <p>{formatOptional(acc.clientId)}</p>
            </LabelView>
            <LabelView title="Account type">
              <p>{formatOptional(acc.accountType)}</p>
            </LabelView>
            <LabelView title="Primary">
              <p>{acc.isPrimary ? "Yes" : "No"}</p>
            </LabelView>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function DirectorsSection({ data }: { data: CorporateKycResponse }) {
  const list = data.directors ?? [];
  if (list.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Directors</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {list.map((dir, index) => (
          <div
            key={dir.id ?? index}
            className="rounded-lg border p-4 grid gap-3 md:grid-cols-2"
          >
            <LabelView title="Full name">
              <p>{formatOptional(dir.fullName)}</p>
            </LabelView>
            <LabelView title="PAN">
              <p>{formatOptional(dir.pan)}</p>
            </LabelView>
            <LabelView title="Designation">
              <p>{formatOptional(dir.designation)}</p>
            </LabelView>
            <LabelView title="DIN">
              <p>{formatOptional(dir.din)}</p>
            </LabelView>
            <LabelView title="Email">
              <p>{formatOptional(dir.email)}</p>
            </LabelView>
            <LabelView title="Mobile">
              <p>{formatOptional(dir.mobile)}</p>
            </LabelView>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function PromotersSection({ data }: { data: CorporateKycResponse }) {
  const list = data.promoters ?? [];
  if (list.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Promoters</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {list.map((p, index) => (
          <div
            key={p.id ?? index}
            className="rounded-lg border p-4 grid gap-3 md:grid-cols-2"
          >
            <LabelView title="Full name">
              <p>{formatOptional(p.fullName)}</p>
            </LabelView>
            <LabelView title="PAN">
              <p>{formatOptional(p.pan)}</p>
            </LabelView>
            <LabelView title="Designation">
              <p>{formatOptional(p.designation)}</p>
            </LabelView>
            <LabelView title="Email">
              <p>{formatOptional(p.email)}</p>
            </LabelView>
            <LabelView title="Mobile">
              <p>{formatOptional(p.mobile)}</p>
            </LabelView>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function AuthorisedSignatoriesSection({
  data,
}: {
  data: CorporateKycResponse;
}) {
  const list = data.authorisedSignatories ?? [];
  if (list.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Authorised signatories</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {list.map((s, index) => (
          <div
            key={s.id ?? index}
            className="rounded-lg border p-4 grid gap-3 md:grid-cols-2"
          >
            <LabelView title="Full name">
              <p>{formatOptional(s.fullName)}</p>
            </LabelView>
            <LabelView title="PAN">
              <p>{formatOptional(s.pan)}</p>
            </LabelView>
            <LabelView title="Designation">
              <p>{formatOptional(s.designation)}</p>
            </LabelView>
            <LabelView title="Email">
              <p>{formatOptional(s.email)}</p>
            </LabelView>
            <LabelView title="Mobile">
              <p>{formatOptional(s.mobile)}</p>
            </LabelView>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

const DOC_FIELDS = [
  { key: "panCopyFileUrl", label: "PAN copy" },
  { key: "balanceSheetCopyUrl", label: "Balance sheet copy" },
  {
    key: "certificateOfIncorporationUrl",
    label: "Certificate of incorporation",
  },
  { key: "memorandumCopyUrl", label: "Memorandum copy" },
  { key: "boardResolutionCopyUrl", label: "Board resolution copy" },
  { key: "gstCopyUrl", label: "GST copy" },
  { key: "directorsListCopyUrl", label: "Directors list copy" },
  { key: "powerOfAttorneyCopyUrl", label: "Power of attorney copy" },
] as const;

export function DocumentUrlsSection({
  data,
}: {
  data: CorporateKycResponse;
}) {
  const hasAny = DOC_FIELDS.some(
    (f) =>
      (data[f.key] as string | undefined) != null &&
      (data[f.key] as string) !== ""
  );
  if (!hasAny && !data.gstNumber && !data.annualIncome) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {DOC_FIELDS.map(({ key, label }) => {
            const url = data[key] as string | undefined;
            if (url == null || url === "") return null;
            return (
              <LabelView key={key} title={label}>
                <a
                  href={"/assets/media/files" + url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                  title={url}
                >
                  {shortFileName(url)}
                </a>
              </LabelView>
            );
          })}
          <LabelView title="GST number">
            <p>{formatOptional(data.gstNumber)}</p>
          </LabelView>
          <LabelView title="Annual income">
            <p>{formatOptional(data.annualIncome)}</p>
          </LabelView>
        </div>
      </CardContent>
    </Card>
  );
}
