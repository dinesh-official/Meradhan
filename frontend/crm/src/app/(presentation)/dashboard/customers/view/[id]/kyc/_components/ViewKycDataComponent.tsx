"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { genMediaUrl } from "@/global/utils/url.utils";
import { areNamesMatched } from "@/lib/utils";
import apiGateway, { CustomerByIdPayload } from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import useAppCookie from "@/hooks/useAppCookie.hook";
import StickyHeader from "./StickyHeader";
import AadhaarCardInfo from "./cards/AadhaarCardInfo";
import AdharaCard from "./cards/AdharaCard";
import { BankCard } from "./cards/BankCard";
import CheckedCompances, { Root } from "./cards/CheckedCompances";
import CustomerOverViewCard from "./cards/CustomerOverViewCard";
import { DematCard } from "./cards/DematCard";
import KYCVerificationStatusCard from "./cards/KYCVerificationStatusCard";
import PanCard from "./cards/PanCard";
import PanCardInfoCard from "./cards/PanCardInfoCard";
import PersonalInformationCard from "./cards/PersonalInformationCard";
import RiskProfileQuestion, {
  RiskProfileAnsOption,
} from "./cards/riskprofile/RiskProfileQuestion";
import { riskProfileData } from "@/global/constants/riskProfileData";
import KraLogsView from "./KraLogsView";
function ViewKycDataComponent({ data }: { data: CustomerByIdPayload }) {
  const { cookies } = useAppCookie();
  const isSuperAdmin = cookies.role === "SUPER_ADMIN";

  const api = new apiGateway.meradhan.customerKycApi.CustomerKycApi(
    apiClientCaller,
  );

  const getLevelQuery = useQuery({
    queryKey: ["KycLevel", data.id],
    queryFn: async () => {
      const leveldata = await api.getKycLevel(data.id);
      return leveldata.responseData;
    },
  });

  const apiGt = new apiGateway.meradhan.customerKycApi.CustomerKycApi(
    apiClientCaller,
  );
  const kycStore = useQuery({
    queryKey: ["KycProgressStoreChecks", data.id],
    queryFn: async () => {
      const resp = await apiGt.getKycProgressStoreCrm(data.id);
      return resp.responseData?.data as Root /*  */;
    },
  });

  /** KRA path: no DigiLocker Aadhaar — hide placeholder Aadhaar cards */
  const hideAadhaarSection =
    kycStore.isSuccess && Boolean(kycStore.data?.step_1?.usedExistingKra);

  return (
    <div className="relative flex flex-col gap-5 mt-5">
      <div className="gap-5  flex flex-col ">
        <CustomerOverViewCard
          userId={data.id}
          kraStatus={data.kraStatus}
          name={`${data.firstName} ${data.middleName} ${data.lastName}`}
          customerSince={dateTimeUtils.formatDateTime(
            data.createdAt,
            "DD MMM YYYY hh:mm:ss AA",
          )}
          kycStatus={data.kycStatus}
          usedExistingKra={Boolean(kycStore.data?.step_1?.usedExistingKra)}
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
                  "DD MMM YYYY hh:mm:ss AA",
                )
          }
        />
      </div>

      {isSuperAdmin && (
        <>
      <StickyHeader hideAadhaarSection={hideAadhaarSection} />

      {/* Personal Information */}
      <div className="scroll-mt-16" id="personal-info">
        <PersonalInformationCard
          photoUrl={genMediaUrl(data.avatar)}
          signatureUrl={genMediaUrl(data.personalInformation?.SignatureUrl)}
          fullName={`${data.firstName} ${data.middleName} ${data.lastName}`}
          faceTimeStamp={kycStore.data?.step_1?.face?.timestamp}
          signTimeStamp={kycStore.data?.step_1?.sign?.timestamp}
          dateOfBirth={
            !data.personalInformation?.dateOfBirth
              ? "--"
              : dateTimeUtils.formatDateTime(
                  data.personalInformation?.dateOfBirth,
                  "DD/MM/YYYY",
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
      <div className="flex flex-col gap-5 scroll-mt-16">
        <Card id="identity-docs">
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
                          "DD/MM/YYYY",
                        )
                      : "--/--/----"
                  }
                  isVerified={data.panCard?.isVerified || false}
                />

                {/* <p className="mt-5 text-xs text-center">

                  Fetched At:{" "}
                  {data.panCard?.verifyDate ? dateTimeUtils.formatDateTime(
                    data.panCard?.verifyDate,
                    "DD MMM YYYY hh:mm:ss AA"
                  ) : "-------"}
                </p>
                <p className=" text-xs text-center">
                  {" "}
                  Confirmed At:{" "}
                  {data.panCard?.confirmTimeStamp ? dateTimeUtils.formatDateTime(
                    data.panCard?.confirmTimeStamp,
                    "DD MMM YYYY hh:mm:ss AA"
                  ) : "-------"}
                </p> */}
              </div>
              {!hideAadhaarSection && (
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
                            "DD/MM/YYYY",
                          )
                        : "--/--/----"
                    }
                    isVerified={data.aadhaarCard?.isVerified || false}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {/* <ShowResponseJson data={kycStore.data} /> */}
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
                  "DD/MM/YYYY",
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
            },
          )}
          verificationTimeStamp={
            !kycStore.data?.step_1?.pan?.fetchedTimestamp
              ? "-------"
              : dateTimeUtils.formatDateTime(
                  kycStore.data?.step_1?.pan?.fetchedTimestamp,
                  "DD MMM YYYY hh:mm:ss AA",
                )
          }
          confirmTimeStamp={
            !kycStore.data?.step_1?.pan?.confirmPanTimestamp
              ? "--/--/----"
              : dateTimeUtils.formatDateTime(
                  kycStore.data?.step_1?.pan?.confirmPanTimestamp,
                  "DD MMM YYYY hh:mm:ss AA",
                )
          }
        />

        {!hideAadhaarSection && (
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
                    "DD/MM/YYYY",
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
              },
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
              kycStore.data?.step_1?.pan?.fetchedTimestamp
                ? dateTimeUtils.formatDateTime(
                    kycStore.data?.step_1?.pan?.fetchedTimestamp,
                    "DD MMM YYYY hh:mm:ss AA",
                  )
                : "--/--/----"
            }
            confirmTimeStamp={
              kycStore.data?.step_1?.pan?.confirmPanTimestamp
                ? dateTimeUtils.formatDateTime(
                    kycStore.data?.step_1?.pan?.confirmPanTimestamp,
                    "DD MMM YYYY hh:mm:ss AA",
                  )
                : "--/--/----"
            }
          />
        )}
      </div>

      {/* Bank Accounts */}
      <div className="scroll-mt-16" id="bank-accounts">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Bank Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            {data.bankAccounts.length === 0 && (
              <p className="text-left text-sm">No bank account added yet.</p>
            )}
            <div className="gap-5 grid lg:grid-cols-3">
              {data.bankAccounts.map((e) => {
                return (
                  <div key={e.id}>
                    <BankCard
                      bankName={e.bankName}
                      accountNumber={e.accountNumber}
                      ifscCode={e.ifscCode}
                      branch={e.branch}
                      holderName={e.accountHolderName}
                      verifiedOn={
                        e.verifyDate
                          ? dateTimeUtils.formatDateTime(
                              e.verifyDate,
                              "DD MMM YYYY hh:mm:ss AA",
                            )
                          : "--/--/----"
                      }
                      isDefault={e.isPrimary}
                      verified={e.isVerified}
                      isNameVerified={
                        e.accountHolderName.toLowerCase() ==
                        `${data.firstName} ${data.middleName ? data.middleName + " " : ""}${data.lastName}`.toLowerCase()
                      }
                    />
                    {e.confirmTimeStamp && (
                      <p className="text-center text-xs mt-4">
                        Confirmed At:{" "}
                        {dateTimeUtils.formatDateTime(
                          e.confirmTimeStamp,
                          "DD MMM YYYY hh:mm:ss AA",
                        )}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demat Accounts */}
      <div className="scroll-mt-16" id="demat-accounts">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Demat Accounts Details</CardTitle>
          </CardHeader>
          <CardContent>
            {data.bankAccounts.length === 0 && (
              <p className="text-left text-sm">No demat account added yet.</p>
            )}
            <div className="gap-5 grid lg:grid-cols-3">
              {data.dematAccounts.map((e) => {
                return (
                  <div key={e.dpId + e.id}>
                    <DematCard
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
                              "DD MMM YYYY hh:mm:ss AA",
                            )
                          : "--/--/----"
                      }
                    />
                    {e.confirmTimeStamp && (
                      <p className="text-center text-xs mt-4">
                        Confirmed At:{" "}
                        {dateTimeUtils.formatDateTime(
                          e.confirmTimeStamp,
                          "DD MMM YYYY hh:mm:ss AA",
                        )}
                      </p>
                    )}
                  </div>
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
              {(data?.riskProfile?.data || riskProfileData.data)?.map((e) => (
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
      <CheckedCompances data={kycStore.data} />
      <KraLogsView id={data.id} />
        </>
      )}
    </div>
  );
}

export default ViewKycDataComponent;
