"use client";

import DataInfoLabel from "@/app/(account)/_components/cards/DataInfoLabel";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { GetCustomerResponseById } from "@root/apiGateway";
import { FaCheckSquare } from "react-icons/fa";
import ProfileContactFields from "../ProfileContactFields";

function PersonalDetails({
  profile,
}: {
  profile: GetCustomerResponseById["responseData"];
}) {
  const showAddressSection =
    profile.kycStatus == "VERIFIED" ||
    profile.kycStatus == "RE_KYC" ||
    profile.kycStatus == "UNDER_REVIEW";
  const showAddressValues =
    profile.kycStatus == "VERIFIED" || profile.kycStatus == "RE_KYC";
  const communicationAddressLabel = profile.useKraKyc
    ? "Communication Address (as per KRA)"
    : "Communication Address (as per Aadhar)";
  const getAddressNotes = (value?: string | null) => {
    if (!showAddressValues) return "--";
    return value || "--";
  };
  const countryDisplay = showAddressValues ? "India" : "--";

  return (
    <>
      <div className="gap-5 grid md:grid-cols-3 mt-5">
        <DataInfoLabel title="First Name">
          <p className="font-medium text-sm uppercase">{profile.firstName}</p>
        </DataInfoLabel>
        <DataInfoLabel title="Middle Name">
          <p className="font-medium text-sm uppercase">
            {profile.middleName || "--"}
          </p>
        </DataInfoLabel>
        <DataInfoLabel title="Last Name">
          <p className="font-medium text-sm uppercase">
            {profile.lastName || "--"}
          </p>
        </DataInfoLabel>
        <ProfileContactFields profile={profile} />
        <FullKycInfo profile={profile} />
      </div>
      <div className="gap-5 grid md:grid-cols-3 mt-6 pt-6 border-gray-200 border-t">
        {showAddressSection && (
          <div className="md:col-span-3">
            <h4 className="flex items-center gap-2">
              {communicationAddressLabel}{" "}
              {showAddressValues && (
                <FaCheckSquare className="text-green-600" />
              )}
            </h4>
          </div>
        )}

        <DataInfoLabel title="Line 1" className="md:col-span-3">
          <p className="font-medium text-sm">
            {getAddressNotes(profile.permanentAddress?.line1)}
          </p>
        </DataInfoLabel>
        <DataInfoLabel title="Line 2" className="md:col-span-3">
          <p className="font-medium text-sm">
            {getAddressNotes(profile.permanentAddress?.line2)}
          </p>
        </DataInfoLabel>
        <DataInfoLabel title="Line 3" className="md:col-span-3">
          <p className="font-medium text-sm">
            {getAddressNotes(profile.permanentAddress?.line3)}
          </p>
        </DataInfoLabel>
        <DataInfoLabel title="City / Town / Village">
          <p className="font-medium text-sm">
            {getAddressNotes(profile.permanentAddress?.cityOrDistrict)}
          </p>
        </DataInfoLabel>

        <DataInfoLabel title="District">
          <p className="font-medium text-sm">
            {getAddressNotes(profile.permanentAddress?.cityOrDistrict)}
          </p>
        </DataInfoLabel>
        <DataInfoLabel title="State">
          <p className="font-medium text-sm">
            {getAddressNotes(profile.permanentAddress?.state)}
          </p>
        </DataInfoLabel>
        <DataInfoLabel title="Pincode ">
          <p className="font-medium text-sm">
            {getAddressNotes(profile.permanentAddress?.pinCode)}
          </p>
        </DataInfoLabel>
        <DataInfoLabel title="Country ">
          <p className="font-medium text-sm">{countryDisplay}</p>
        </DataInfoLabel>
      </div>
    </>
  );
}

export default PersonalDetails;

function FullKycInfo({
  profile,
}: {
  profile: GetCustomerResponseById["responseData"];
}) {
  if (profile.kycStatus != "VERIFIED") {
    return null;
  }
  return (
    <>
      <DataInfoLabel title="PAN">
        <p className="font-medium text-sm">
          {profile.panCard?.panCardNo || "--"}
        </p>
      </DataInfoLabel>
      <DataInfoLabel title="Aadhaar">
        <p className="font-medium text-sm">
          {profile.aadhaarCard?.aadhaarNo || "--"}
        </p>
      </DataInfoLabel>
      <DataInfoLabel title="Date of Birth">
        <p className="font-medium text-sm">
          {profile.personalInformation?.dateOfBirth
            ? dateTimeUtils.formatDateTime(
              profile.personalInformation?.dateOfBirth,
              "DD MMM YYYY",
            )
            : "--"}
        </p>
      </DataInfoLabel>
      <DataInfoLabel title="Gender">
        <p className="font-medium text-sm">{profile.gender || "--"}</p>
      </DataInfoLabel>
      <DataInfoLabel title="Marital Status">
        <p className="font-medium text-sm">
          {profile.personalInformation?.maritalStatus || "--"}
        </p>
      </DataInfoLabel>
      <DataInfoLabel title="Occupation Type">
        <p className="font-medium text-sm">
          {profile.personalInformation?.occupationType || "--"}
        </p>
      </DataInfoLabel>
      <DataInfoLabel title="Father/Spouse Name">
        <p className="font-medium text-sm">
          {profile.personalInformation?.fatherOrSpouseName || "--"}
        </p>
      </DataInfoLabel>
      <DataInfoLabel title="Mother’s Name">
        <p className="font-medium text-sm">
          {profile.personalInformation?.mothersName || "--"}
        </p>
      </DataInfoLabel>
      <DataInfoLabel title="Maiden Name">
        <p className="font-medium text-sm">
          {profile.personalInformation?.maidenName || "--"}
        </p>
      </DataInfoLabel>
      <DataInfoLabel title="Qualification">
        <p className="font-medium text-sm">
          {profile.personalInformation?.qualification || "--"}
        </p>
      </DataInfoLabel>
      <DataInfoLabel title="Residential Status">
        <p className="font-medium text-sm">
          {profile.personalInformation?.residentialStatus || "--"}
        </p>
      </DataInfoLabel>
      <DataInfoLabel title="Nationality">
        <p className="font-medium text-sm">
          {profile.personalInformation?.nationality || "--"}
        </p>
      </DataInfoLabel>
      <DataInfoLabel title="Income Range">
        <p className="font-medium text-sm">
          {profile.personalInformation?.annualGrossIncome || "--"}
        </p>
      </DataInfoLabel>
      <DataInfoLabel title="Politically Exposed Person">
        <p className="font-medium text-sm">
          {profile.personalInformation?.politicallyExposedPerson || "--"}
        </p>
      </DataInfoLabel>
    </>
  );
}
