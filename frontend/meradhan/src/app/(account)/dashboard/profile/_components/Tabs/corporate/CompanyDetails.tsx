import DataInfoLabel from "@/app/(account)/_components/cards/DataInfoLabel";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { genMediaUrl } from "@/global/utils/url.utils";
import type {
  CorporateKycResponse,
  GetCustomerResponseById,
} from "@root/apiGateway";
import Link from "next/link";
import { FaCheckSquare } from "react-icons/fa";
import ProfileContactFields from "../../ProfileContactFields";
import AccountClosureSection from "../../AccountClosureSection";
import NeedKyc from "../../NeedKyc";
import { canAccessKycSections } from "../../../_utils/profileKyc";
import { formatEntityConstitutionType } from "../../../_utils/formatEntityType";

function displayValue(value?: string | null) {
  return value?.trim() ? value : "--";
}

function formatDate(value?: string | null) {
  if (!value) return "--";
  return dateTimeUtils.formatDateTime(value, "DD MMM YYYY");
}

function AddressBlock({
  title,
  line1,
  line2,
  line3,
  city,
  district,
  state,
  pinCode,
  showVerified,
}: {
  title: string;
  line1?: string | null;
  line2?: string | null;
  line3?: string | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;
  pinCode?: string | null;
  showVerified?: boolean;
}) {
  return (
    <div className="gap-5 grid md:grid-cols-3 mt-6 pt-6 border-gray-200 border-t">
      <div className="md:col-span-3">
        <h4 className="flex items-center gap-2">
          {title}{" "}
          {showVerified && <FaCheckSquare className="text-green-600" />}
        </h4>
      </div>
      <DataInfoLabel title="Line 1" className="md:col-span-3">
        <p className="font-medium text-sm">{displayValue(line1)}</p>
      </DataInfoLabel>
      <DataInfoLabel title="Line 2" className="md:col-span-3">
        <p className="font-medium text-sm">{displayValue(line2)}</p>
      </DataInfoLabel>
      <DataInfoLabel title="Line 3" className="md:col-span-3">
        <p className="font-medium text-sm">{displayValue(line3)}</p>
      </DataInfoLabel>
      <DataInfoLabel title="City / Town / Village">
        <p className="font-medium text-sm">{displayValue(city)}</p>
      </DataInfoLabel>
      <DataInfoLabel title="District">
        <p className="font-medium text-sm">{displayValue(district)}</p>
      </DataInfoLabel>
      <DataInfoLabel title="State">
        <p className="font-medium text-sm">{displayValue(state)}</p>
      </DataInfoLabel>
      <DataInfoLabel title="Pincode">
        <p className="font-medium text-sm">{displayValue(pinCode)}</p>
      </DataInfoLabel>
      <DataInfoLabel title="Country">
        <p className="font-medium text-sm">India</p>
      </DataInfoLabel>
    </div>
  );
}

export default function CompanyDetails({
  profile,
  corporateKyc,
}: {
  profile: GetCustomerResponseById["responseData"];
  corporateKyc: CorporateKycResponse | null | undefined;
}) {
  const kycAccessible = canAccessKycSections(profile.kycStatus);
  const showEntityValues =
    profile.kycStatus === "VERIFIED" || profile.kycStatus === "RE_KYC";

  if (!corporateKyc && !kycAccessible) {
    return (
      <NeedKyc
        title="Company details not available"
        desc="to complete your corporate KYC!"
      />
    );
  }

  const entity = corporateKyc;
  const getEntityField = (value?: string | null) =>
    showEntityValues ? displayValue(value) : "--";

  return (
    <>
      <div className="gap-5 grid md:grid-cols-3 mt-5">
        <DataInfoLabel title="Company / Entity Name as per PAN">
          <p className="font-medium text-sm uppercase">
            {getEntityField(entity?.entityName ?? profile.legalEntityName)}
          </p>
        </DataInfoLabel>
        <DataInfoLabel title="PAN">
          <p className="font-medium text-sm uppercase">
            {getEntityField(entity?.panNumber)}
          </p>
        </DataInfoLabel>
        <DataInfoLabel title="Registration Number">
          <p className="font-medium text-sm">
            {getEntityField(entity?.cinOrRegistrationNumber)}
          </p>
        </DataInfoLabel>
        <DataInfoLabel title="Date of Incorporation">
          <p className="font-medium text-sm">
            {showEntityValues
              ? formatDate(entity?.dateOfIncorporation)
              : "--"}
          </p>
        </DataInfoLabel>
        <DataInfoLabel title="Place of Incorporation">
          <p className="font-medium text-sm">
            {getEntityField(entity?.placeOfIncorporation)}
          </p>
        </DataInfoLabel>
        <DataInfoLabel title="Date of Commencement">
          <p className="font-medium text-sm">
            {showEntityValues
              ? formatDate(entity?.dateOfCommencementOfBusiness)
              : "--"}
          </p>
        </DataInfoLabel>
        <DataInfoLabel title="Entity Type">
          <p className="font-medium text-sm">
            {showEntityValues
              ? formatEntityConstitutionType(
                entity?.entityConstitutionType,
                entity?.otherConstitutionType,
              )
              : "--"}
          </p>
        </DataInfoLabel>
        <DataInfoLabel title="Proof of Identity">
          {showEntityValues && entity?.panCopyFileUrl ? (
            <Link
              href={genMediaUrl(entity.panCopyFileUrl)}
              target="_blank"
              className="font-medium text-secondary text-sm underline"
            >
              View PAN copy
            </Link>
          ) : (
            <p className="font-medium text-sm">--</p>
          )}
        </DataInfoLabel>
        <ProfileContactFields profile={profile} variant="corporate" />
      </div>


      {kycAccessible && (
        <>
          <AddressBlock
            title="Communication Address"
            line1={entity?.correspondenceLine1}
            line2={entity?.correspondenceLine2}
            line3={entity?.correspondenceLine3}
            city={entity?.correspondenceCity}
            district={entity?.correspondenceDistrict}
            state={entity?.correspondenceState}
            pinCode={entity?.correspondencePinCode}
            showVerified={showEntityValues}
          />
          <AddressBlock
            title="Registered Address"
            line1={entity?.registeredLine1}
            line2={entity?.registeredLine2}
            line3={entity?.registeredLine3}
            city={entity?.registeredCity}
            district={entity?.registeredDistrict}
            state={entity?.registeredState}
            pinCode={entity?.registeredPinCode}
            showVerified={showEntityValues}
          />
        </>
      )}
      {/* <AccountClosureSection /> */}
    </>
  );
}
