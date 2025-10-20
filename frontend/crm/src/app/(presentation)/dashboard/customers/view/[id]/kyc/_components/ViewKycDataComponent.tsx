import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { CustomerByIdPayload } from "@root/apiGateway";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { areNamesMatched } from "@/lib/utils";
import { genMediaUrl } from "@/global/utils/url.utils";

function ViewKycDataComponent({ data }: { data: CustomerByIdPayload }) {
  return (
    <div className="flex flex-col gap-5 relative mt-5">
      <div className="grid xl:grid-cols-2 gap-5">
        <CustomerOverViewCard
          name={`${data.firstName} ${data.middleName} ${data.lastName}`}
          customerSince={
            !data.utility.lastLogin
              ? "--"
              : dateTimeUtils.formatDateTime(
                  data.utility.lastLogin,
                  "DD MMMM YYYY hh:mm AA"
                )
          }
          kycStatus={data.kycStatus}
        />
        <KYCVerificationStatusCard
          kycLevel="Full"
          overallStatus="PENDING"
          verifiedBy="--"
          verifiedDate={
            !data.verifyDate
              ? "--"
              : dateTimeUtils.formatDateTime(
                  data.verifyDate,
                  "DD MMMM YYYY hh:mm AA"
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
      <div className="scroll-mt-16  flex flex-col gap-5" id="identity-docs">
        <Card>
          <CardHeader>
            <CardTitle>Identity Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-8">
              <PanCard
                panNumber={data.panCard?.panCardNo || "--------"}
                name={`${data.panCard?.firstName || "----"} ${
                  data.panCard?.middleName || "--"
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
              <AdharaCard
                name={`${data.aadhaarCard?.firstName || "----"} ${
                  data.aadhaarCard?.middleName || "--"
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
            </div>
          </CardContent>
        </Card>
        <PanCardInfoCard
          panCardNumber={data.panCard?.panCardNo || "--------"}
          Name={`${data.panCard?.firstName || "----"} ${
            data.panCard?.middleName || "--"
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
                  "DD MMMM YYYY hh:mm AA"
                )
          }
        />
        <AadhaarCardInfo
          name={`${data.aadhaarCard?.firstName || "----"} ${
            data.aadhaarCard?.middleName || "--"
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
                  data.aadhaarCard?.dateOfBirth,
                  "DD MMMM YYYY hh:mm AA"
                )
              : "--/--/----"
          }
        />
      </div>

      {/* Demat Accounts */}
      <div className="scroll-mt-16" id="demat-accounts">
        <Card>
          <CardHeader>
            <CardTitle>Demat Accounts Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid lg:grid-cols-3  gap-5">
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
                            "DD MMMM YYYY hh:mm AA"
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
            <CardTitle>Bank Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid lg:grid-cols-3 gap-5">
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
                            "DD MMMM YYYY hh:mm AA"
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
            <CardTitle>Risk Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-sm">Investment Experience</CardTitle>
            <div className="mt-4 flex flex-col gap-5">
              <RiskProfileQuestion question="How many years of investment experience do you have?">
                <RiskProfileAnsOption active>None</RiskProfileAnsOption>
                <RiskProfileAnsOption>Upto 1 Year</RiskProfileAnsOption>
                <RiskProfileAnsOption>1 - 5 Years</RiskProfileAnsOption>
                <RiskProfileAnsOption>Above 5 Years</RiskProfileAnsOption>
              </RiskProfileQuestion>

              <RiskProfileQuestion question="How many years of investment experience do you have?">
                <RiskProfileAnsOption>None</RiskProfileAnsOption>
                <RiskProfileAnsOption>Upto 1 Year</RiskProfileAnsOption>
                <RiskProfileAnsOption active>1 - 5 Years</RiskProfileAnsOption>
                <RiskProfileAnsOption>Above 5 Years</RiskProfileAnsOption>
              </RiskProfileQuestion>

              <RiskProfileQuestion question="How many years of investment experience do you have?">
                <RiskProfileAnsOption>None</RiskProfileAnsOption>
                <RiskProfileAnsOption active>Upto 1 Year</RiskProfileAnsOption>
                <RiskProfileAnsOption>1 - 5 Years</RiskProfileAnsOption>
                <RiskProfileAnsOption>Above 5 Years</RiskProfileAnsOption>
              </RiskProfileQuestion>

              <RiskProfileQuestion question="How many years of investment experience do you have?">
                <RiskProfileAnsOption>None</RiskProfileAnsOption>
                <RiskProfileAnsOption>Upto 1 Year</RiskProfileAnsOption>
                <RiskProfileAnsOption>1 - 5 Years</RiskProfileAnsOption>
                <RiskProfileAnsOption active>
                  Above 5 Years
                </RiskProfileAnsOption>
              </RiskProfileQuestion>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance */}
      <div className="scroll-mt-16" id="compliance">
        <Card>
          <CardHeader>
            <CardTitle>SEBI & Compliance Information</CardTitle>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-sm">Compliance Confirmations</CardTitle>
            <p className="flex justify-start items-center gap-3 mt-3">
              <Checkbox /> I hereby confirm that I am not a Politically Exposed
              Person (PEP) nor related to any PEP
            </p>
            <p className="flex justify-start items-center gap-3 mt-2">
              <Checkbox /> I hereby confirm that I am not a person and/or entity
              debarred from accessing the securities market or dealing in
              securities, as per directions or orders issued by SEBI
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ViewKycDataComponent;
