"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { genMediaUrl } from "@/global/utils/url.utils";
import { areNamesMatched } from "@/lib/utils";
import apiGateway, { CustomerByIdPayload } from "@root/apiGateway";
import StickyHeader from "./StickyHeader";
import AadhaarCardInfo from "./cards/AadhaarCardInfo";
import AdharaCard from "./cards/AdharaCard";
import { BankCard } from "./cards/BankCard";
import CustomerOverViewCard from "./cards/CustomerOverViewCard";
import { DematCard } from "./cards/DematCard";
import KYCVerificationStatusCard from "./cards/KYCVerificationStatusCard";
import PanCard from "./cards/PanCard";
import PanCardInfoCard from "./cards/PanCardInfoCard";
import PersonalInformationCard from "./cards/PersonalInformationCard";
import RiskProfileQuestion, {
  RiskProfileAnsOption,
} from "./cards/riskprofile/RiskProfileQuestion";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { useQuery } from "@tanstack/react-query";

function ViewKycDataComponent({ data }: { data: CustomerByIdPayload }) {
  const api = new apiGateway.meradhan.customerKycApi.CustomerKycApi(
    apiClientCaller
  );

  const getLevelQuery = useQuery({
    queryKey: ["KycLevel", data.id],
    queryFn: async () => {
      const leveldata = await api.getKycLevel(data.id);
      return leveldata.responseData;
    },
  });

  return (
    <div className="relative flex flex-col gap-5 mt-5">
      <div className="gap-5 grid xl:grid-cols-2">
        <CustomerOverViewCard
          name={`${data.firstName} ${data.middleName} ${data.lastName}`}
          customerSince={dateTimeUtils.formatDateTime(
            data.createdAt,
            "DD MMM YYYY hh:mm AA"
          )}
          kycStatus={data.kycStatus}
        />
        <KYCVerificationStatusCard
          kycLevel={getLevelQuery.data || "-----"}
          overallStatus={data.kycStatus}
          verifiedBy="--"
          verifiedDate={
            !data.verifyDate
              ? "--"
              : dateTimeUtils.formatDateTime(
                  data.verifyDate,
                  "DD MMM YYYY hh:mm AA"
                )
          }
        />
      </div>

      <StickyHeader />

      {/* Personal Information */}
      <div className="scroll-mt-16" id="personal-info">
        <PersonalInformationCard
          photoUrl={genMediaUrl(data.avatar)}
          signatureUrl={genMediaUrl(data.personalInformation?.SignatureUrl)}
          fullName={`${data.firstName} ${data.middleName} ${data.lastName}`}
          dateOfBirth={
            !data.personalInformation?.dateOfBirth
              ? "--"
              : dateTimeUtils.formatDateTime(
                  data.personalInformation?.dateOfBirth,
                  "DD/MM/YYYY"
                )
          }
          gender={data.gender}
          maritalStatus={data.personalInformation?.maritalStatus || "--"}
          fatherOrSpouseName={
            data.personalInformation?.fatherOrSpouseName || "--"
          }
          relationshipWithPerson={
            data.personalInformation?.relationshipWithPerson || "--"
          }
          motherName={data.personalInformation?.mothersName || "--"}
          qualification={data.personalInformation?.qualification || "--"}
          occupationType={data.personalInformation?.occupationType || "--"}
          annualGrossIncome={
            data.personalInformation?.annualGrossIncome?.replaceAll("_", " ") ||
            "--"
          }
          nationality={data.personalInformation?.nationality || "--"}
          residentialStatus={
            data.personalInformation?.residentialStatus?.replaceAll("_", " ") ||
            "--"
          }
        />
      </div>

      {/* Identity Documents */}
      <div className="flex flex-col gap-5 scroll-mt-16" id="identity-docs">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Identity Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-8">
              <div>
                <PanCard
                  panNumber={data.panCard?.panCardNo || "--------"}
                  name={`${data.panCard?.firstName || "----"} ${
                    data.panCard?.middleName || ""
                  } ${data.panCard?.lastName || "---"}`}
                  gender={data.panCard?.gender || "----"}
                  dateOfBirth={
                    data.panCard?.dateOfBirth
                      ? dateTimeUtils.formatDateTime(
                          data.panCard?.dateOfBirth,
                          "DD/MM/YYYY"
                        )
                      : "--/--/----"
                  }
                  isVerified={data.panCard?.isVerified || false}
                />
                {data.panCard?.confirmTimeStamp && (
                  <p className="mt-5 text-xs text-center">
                    {" "}
                    Confirm Date:{" "}
                    {dateTimeUtils.formatDateTime(
                      data.panCard?.confirmTimeStamp,
                      "DD MMM YYYY hh:mm AA"
                    )}
                  </p>
                )}
              </div>
              <div>
                <AdharaCard
                  name={`${data.aadhaarCard?.firstName || "----"} ${
                    data.aadhaarCard?.middleName || ""
                  } ${data.aadhaarCard?.lastName || "---"}`}
                  gender={data.aadhaarCard?.gender || "----"}
                  aadhaarNumberMasked={
                    data.aadhaarCard?.aadhaarNo || "----------------"
                  }
                  dateOfBirth={
                    data.aadhaarCard?.dateOfBirth
                      ? dateTimeUtils.formatDateTime(
                          data.aadhaarCard?.dateOfBirth,
                          "DD/MM/YYYY"
                        )
                      : "--/--/----"
                  }
                  isVerified={data.aadhaarCard?.isVerified || false}
                />
                {data.aadhaarCard?.confirmTimeStamp && (
                  <p className="mt-5 text-xs text-center">
                    Confirm Date:{" "}
                    {dateTimeUtils.formatDateTime(
                      data.aadhaarCard?.confirmTimeStamp,
                      "DD MMM YYYY hh:mm AA"
                    )}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <PanCardInfoCard
          panCardNumber={data.panCard?.panCardNo || "--------"}
          Name={`${data.panCard?.firstName || "----"} ${
            data.panCard?.middleName || ""
          } ${data.panCard?.lastName || "---"}`}
          gender={data.panCard?.gender || "----"}
          DateOFBirth={
            data.panCard?.dateOfBirth
              ? dateTimeUtils.formatDateTime(
                  data.panCard?.dateOfBirth,
                  "DD/MM/YYYY"
                )
              : "--/--/----"
          }
          panVerificationStatus={data.panCard?.isVerified || false}
          nameVerificationStatus={areNamesMatched(
            {
              firstName: data.firstName,
              lastName: data.lastName,
              middleName: data.middleName || undefined,
            },
            {
              firstName: data.panCard?.firstName || "",
              lastName: data.panCard?.lastName || "",
              middleName: data.panCard?.middleName || undefined,
            }
          )}
          verificationTimeStamp={
            !data.panCard?.verifyDate
              ? "-------"
              : dateTimeUtils.formatDateTime(
                  data.panCard?.verifyDate,
                  "DD MMM YYYY hh:mm AA"
                )
          }
          confirmTimeStamp={
            !data.panCard?.confirmTimeStamp
              ? "--/--/----"
              : dateTimeUtils.formatDateTime(
                  data.panCard?.confirmTimeStamp,
                  "DD MMM YYYY hh:mm AA"
                )
          }
        />
        <AadhaarCardInfo
          name={`${data.aadhaarCard?.firstName || "----"} ${
            data.aadhaarCard?.middleName || ""
          } ${data.aadhaarCard?.lastName || "---"}`}
          gender={data.aadhaarCard?.gender || "----"}
          aadhaarNumber={data.aadhaarCard?.aadhaarNo || "----------------"}
          dateOfBirth={
            data.aadhaarCard?.dateOfBirth
              ? dateTimeUtils.formatDateTime(
                  data.aadhaarCard?.dateOfBirth,
                  "DD/MM/YYYY"
                )
              : "--/--/----"
          }
          nameVerificationStatus={areNamesMatched(
            {
              firstName: data.firstName,
              lastName: data.lastName,
              middleName: data.middleName || undefined,
            },
            {
              firstName: data.aadhaarCard?.firstName || "",
              lastName: data.aadhaarCard?.lastName || "",
              middleName: data.aadhaarCard?.middleName || undefined,
            }
          )}
          permanentAddress={{
            addressLine1: data.permanentAddress?.line1 || "------",
            addressLine2: data.permanentAddress?.line2 || undefined,
            addressLine3: data.permanentAddress?.line3 || undefined,
            postOffice: data.permanentAddress?.postOffice || "-----",
            district: data.permanentAddress?.cityOrDistrict || "------",
            stateName: data.permanentAddress?.state || "------",
            pinCode: data.permanentAddress?.pinCode || "------",
            country: data.permanentAddress?.country || "------",
            fullAddress: data.permanentAddress?.fullAddress || "------",
          }}
          currentAddress={{
            addressLine1: data.currentAddress?.line1 || "------",
            addressLine2: data.currentAddress?.line2 || undefined,
            addressLine3: data.currentAddress?.line3 || undefined,
            postOffice: data.currentAddress?.postOffice || "-----",
            district: data.currentAddress?.cityOrDistrict || "------",
            stateName: data.currentAddress?.state || "------",
            pinCode: data.currentAddress?.pinCode || "------",
            country: data.currentAddress?.country || "------",
            fullAddress: data.currentAddress?.fullAddress || "------",
          }}
          verificationTimeStamp={
            data.aadhaarCard?.verifyDate
              ? dateTimeUtils.formatDateTime(
                  data.aadhaarCard?.verifyDate,
                  "DD MMM YYYY hh:mm AA"
                )
              : "--/--/----"
          }
          confirmTimeStamp={
            data.aadhaarCard?.confirmTimeStamp
              ? dateTimeUtils.formatDateTime(
                  data.aadhaarCard?.confirmTimeStamp,
                  "DD MMM YYYY hh:mm AA"
                )
              : "--/--/----"
          }
        />
      </div>

      {/* Demat Accounts */}
      <div className="scroll-mt-16" id="demat-accounts">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Demat Accounts Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="gap-5 grid lg:grid-cols-2">
              {data.dematAccounts.map((e) => {
                return (
                  <DematCard
                    key={e.dpId + e.id}
                    dpId={e.dpId}
                    clientId={e.clientId}
                    depository={e.depositoryName}
                    accountType={e.accountType}
                    pan1={{ value: e.primaryPanNumber, verified: false }}
                    pan2={
                      e.sndPanNumber ? { value: e.sndPanNumber } : undefined
                    }
                    pan3={
                      e.trdPanNumber ? { value: e.trdPanNumber } : undefined
                    }
                    depositoryParticipantName={e.depositoryParticipantName}
                    isDefault={e.isPrimary}
                    isVerified={e.isVerified}
                    verifiedOn={
                      e.verifyDate
                        ? dateTimeUtils.formatDateTime(
                            e.verifyDate,
                            "DD MMM YYYY hh:mm AA"
                          )
                        : "--/--/----"
                    }
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bank Accounts */}
      <div className="scroll-mt-16" id="bank-accounts">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Bank Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="gap-5 grid lg:grid-cols-2">
              {data.bankAccounts.map((e) => {
                return (
                  <BankCard
                    key={e.id}
                    bankName={e.bankName}
                    accountNumber={e.accountNumber}
                    ifscCode={e.ifscCode}
                    branch={e.branch}
                    holderName={e.accountHolderName}
                    verifiedOn={
                      e.verifyDate
                        ? dateTimeUtils.formatDateTime(
                            e.verifyDate,
                            "DD MMM YYYY hh:mm AA"
                          )
                        : "--/--/----"
                    }
                    isDefault={e.isPrimary}
                    verified={e.isVerified}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Profile */}
      <div className="scroll-mt-16" id="risk-profile">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Risk Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-sm">Investment Experience</CardTitle>
            <div className="flex flex-col gap-5 mt-4">
              {data?.riskProfile?.data?.map((e) => (
                <RiskProfileQuestion
                  question="How many years of investment experience do you have?"
                  key={e.index}
                >
                  {e.opt.map((option, idx) => (
                    <RiskProfileAnsOption key={idx} active={e.ans === option}>
                      {option}
                    </RiskProfileAnsOption>
                  ))}
                </RiskProfileQuestion>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Compliance */}
      <div className="scroll-mt-16" id="compliance">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              SEBI & Compliance Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-sm">Compliance Confirmations</CardTitle>
            <p className="flex justify-start items-center gap-3 mt-3">
              <Checkbox checked={data.isAPep} /> I hereby confirm that I am not
              a Politically Exposed Person (PEP) nor related to any PEP
            </p>
            <p className="flex justify-start items-center gap-3 mt-2">
              <Checkbox checked={data.allowSEBITerms} /> I hereby confirm that I
              am not a person and/or entity debarred from accessing the
              securities market or dealing in securities, as per directions or
              orders issued by SEBI
            </p>
            <p className="flex justify-start items-center gap-3 mt-2">
              <Checkbox checked={data.isAFatcaCustomer} /> I confirm that I am
              an Indian citizen and solely a tax resident of India, not of any
              other country (FATCA)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ViewKycDataComponent;
