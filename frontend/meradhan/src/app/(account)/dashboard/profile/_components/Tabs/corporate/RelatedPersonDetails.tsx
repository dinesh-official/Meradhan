import DataInfoLabel from "@/app/(account)/_components/cards/DataInfoLabel";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import type {
  CorporateKycResponse,
  GetCustomerResponseById,
} from "@root/apiGateway";
import {
  getRelatedPersonFallback,
  parseCorporatePdfRelatedPerson,
} from "../../../_utils/parseCorporatePdfRelatedPerson";
import NeedKyc from "../../NeedKyc";
import { canAccessKycSections } from "../../../_utils/profileKyc";

function displayValue(value?: string | null) {
  return value?.trim() ? value : "--";
}

function formatDate(value?: string | null) {
  if (!value) return "--";
  return dateTimeUtils.formatDateTime(value, "DD MMM YYYY");
}

export default function RelatedPersonDetails({
  corporateKyc,
  kycStatus,
}: {
  corporateKyc: CorporateKycResponse | null | undefined;
  kycStatus: GetCustomerResponseById["responseData"]["kycStatus"];
}) {
  if (!canAccessKycSections(kycStatus)) {
    return (
      <NeedKyc
        title="Related person details not available"
        desc="to complete your corporate KYC!"
      />
    );
  }

  const relatedPerson = parseCorporatePdfRelatedPerson(
    corporateKyc?.lastPdfPayload ?? undefined,
  );
  const fallback =
    !relatedPerson && corporateKyc
      ? getRelatedPersonFallback(corporateKyc)
      : null;

  if (!relatedPerson && !fallback) {
    return (
      <p className="mt-5 text-gray-600 text-sm">
        Related person details will appear here once your corporate KYC is
        processed.
      </p>
    );
  }

  if (!relatedPerson && fallback) {
    return (
      <div className="mt-5">
        <p className="mb-4 text-amber-700 text-sm">
          Full related-person details are pending. Showing basic information
          from your corporate KYC record.
        </p>
        <div className="gap-5 grid md:grid-cols-3">
          <DataInfoLabel title="Name">
            <p className="font-medium text-sm">{displayValue(fallback.name)}</p>
          </DataInfoLabel>
          <DataInfoLabel title="PAN">
            <p className="font-medium text-sm uppercase">
              {displayValue(fallback.pan)}
            </p>
          </DataInfoLabel>
          <DataInfoLabel title="Designation">
            <p className="font-medium text-sm">
              {displayValue(fallback.designation)}
            </p>
          </DataInfoLabel>
          <DataInfoLabel title="Email">
            <p className="font-medium text-sm">{displayValue(fallback.email)}</p>
          </DataInfoLabel>
          <DataInfoLabel title="Mobile">
            <p className="font-medium text-sm">{displayValue(fallback.mobile)}</p>
          </DataInfoLabel>
        </div>
      </div>
    );
  }

  const rp = relatedPerson!;
  const types = [
    ...(rp.relatedPersonTypes ?? []),
    rp.relatedPersonOther ? `Other: ${rp.relatedPersonOther}` : "",
  ].filter(Boolean);
  const addr = rp.correspondenceAddress;

  return (
    <>
      <div className="gap-5 grid md:grid-cols-3 mt-5">
        <DataInfoLabel title="Name">
          <p className="font-medium text-sm uppercase">
            {displayValue(rp.name)}
          </p>
        </DataInfoLabel>
        <DataInfoLabel title="PAN">
          <p className="font-medium text-sm uppercase">
            {displayValue(rp.pan)}
          </p>
        </DataInfoLabel>
        <DataInfoLabel title="Date of Birth">
          <p className="font-medium text-sm">{formatDate(rp.dateOfBirth)}</p>
        </DataInfoLabel>
        <DataInfoLabel title="Gender">
          <p className="font-medium text-sm">{displayValue(rp.gender)}</p>
        </DataInfoLabel>
        <DataInfoLabel title="Marital Status">
          <p className="font-medium text-sm">
            {displayValue(rp.maritalStatus)}
          </p>
        </DataInfoLabel>
        <DataInfoLabel title="Occupation Type">
          <p className="font-medium text-sm">
            {displayValue(rp.occupationType)}
            {rp.occupationOther ? ` (${rp.occupationOther})` : ""}
          </p>
        </DataInfoLabel>
        <DataInfoLabel title="Father/Spouse Name">
          <p className="font-medium text-sm">
            {displayValue(rp.fatherOrSpouseName)}
          </p>
        </DataInfoLabel>
        <DataInfoLabel title="Mother's Name">
          <p className="font-medium text-sm">{displayValue(rp.motherName)}</p>
        </DataInfoLabel>
        <DataInfoLabel title="Maiden Name">
          <p className="font-medium text-sm">{displayValue(rp.maidenName)}</p>
        </DataInfoLabel>
        <DataInfoLabel title="Nationality">
          <p className="font-medium text-sm">{displayValue(rp.nationality)}</p>
        </DataInfoLabel>
        <DataInfoLabel title="Residential Status">
          <p className="font-medium text-sm">
            {displayValue(rp.residentialStatus)}
          </p>
        </DataInfoLabel>
        <DataInfoLabel title="DIN">
          <p className="font-medium text-sm">{displayValue(rp.din)}</p>
        </DataInfoLabel>
        <DataInfoLabel title="Politically Exposed Person">
          <p className="font-medium text-sm">{displayValue(rp.pepStatus)}</p>
        </DataInfoLabel>
        <DataInfoLabel title="Related Person Type" className="md:col-span-3">
          <p className="font-medium text-sm">
            {types.length > 0 ? types.join(", ") : "--"}
          </p>
        </DataInfoLabel>
        <DataInfoLabel title="Email">
          <p className="font-medium text-sm">
            {displayValue(rp.contact?.email)}
          </p>
        </DataInfoLabel>
        <DataInfoLabel title="Mobile">
          <p className="font-medium text-sm">
            {displayValue(rp.contact?.mobile)}
          </p>
        </DataInfoLabel>
      </div>

      <div className="gap-5 grid md:grid-cols-3 mt-6 pt-6 border-gray-200 border-t">
        <div className="md:col-span-3">
          <h4 className="font-medium text-sm">
            Permanent / Correspondence Address
          </h4>
        </div>
        <DataInfoLabel title="Line 1" className="md:col-span-3">
          <p className="font-medium text-sm">{displayValue(addr?.line1)}</p>
        </DataInfoLabel>
        <DataInfoLabel title="Line 2" className="md:col-span-3">
          <p className="font-medium text-sm">{displayValue(addr?.line2)}</p>
        </DataInfoLabel>
        <DataInfoLabel title="Line 3" className="md:col-span-3">
          <p className="font-medium text-sm">{displayValue(addr?.line3)}</p>
        </DataInfoLabel>
        <DataInfoLabel title="City / Town / Village">
          <p className="font-medium text-sm">{displayValue(addr?.city)}</p>
        </DataInfoLabel>
        <DataInfoLabel title="District">
          <p className="font-medium text-sm">{displayValue(addr?.district)}</p>
        </DataInfoLabel>
        <DataInfoLabel title="State">
          <p className="font-medium text-sm">{displayValue(addr?.state)}</p>
        </DataInfoLabel>
        <DataInfoLabel title="Pincode">
          <p className="font-medium text-sm">{displayValue(addr?.pinCode)}</p>
        </DataInfoLabel>
        <DataInfoLabel title="Country">
          <p className="font-medium text-sm">
            {displayValue(addr?.country) !== "--"
              ? displayValue(addr?.country)
              : "India"}
          </p>
        </DataInfoLabel>
      </div>
    </>
  );
}
