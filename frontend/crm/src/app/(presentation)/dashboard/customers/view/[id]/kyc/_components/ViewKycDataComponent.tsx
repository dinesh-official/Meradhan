"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { genMediaUrl } from "@/global/utils/url.utils";
import { areNamesMatched } from "@/lib/utils";
import apiGateway, { CustomerByIdPayload } from "@root/apiGateway";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAppCookie from "@/hooks/useAppCookie.hook";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import StickyHeader from "./StickyHeader";
import AadhaarCardInfo from "./cards/AadhaarCardInfo";
import AdharaCard from "./cards/AdharaCard";
import AddressCard from "./cards/AddressCard";
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

/**
 * KRA state / UT numeric codes → display names.
 * Some KRA payloads provide values like "027" instead of "Maharashtra".
 */
const KRA_STATE_LABELS: Record<string, string> = {
  "001": "Jammu & Kashmir",
  "002": "Himachal Pradesh",
  "003": "Punjab",
  "004": "Chandigarh",
  "005": "Uttarakhand",
  "006": "Haryana",
  "007": "Delhi",
  "008": "Rajasthan",
  "009": "Uttar Pradesh",
  "010": "Bihar",
  "011": "Sikkim",
  "012": "Arunachal Pradesh",
  "013": "Assam",
  "014": "Manipur",
  "015": "Mizoram",
  "016": "Tripura",
  "017": "Meghalaya",
  "018": "Nagaland",
  "019": "West Bengal",
  "020": "Jharkhand",
  "021": "Odisha",
  "022": "Chhattisgarh",
  "023": "Madhya Pradesh",
  "024": "Gujarat",
  "025": "Daman and Diu",
  "026": "Dadra and Nagar Haveli",
  "027": "Maharashtra",
  "028": "Andhra Pradesh",
  "029": "Karnataka",
  "030": "Goa",
  "031": "Lakshadweep",
  "032": "Kerala",
  "033": "Tamil Nadu",
  "034": "Puducherry",
  "035": "Andaman and Nicobar Islands",
  "036": "Ladakh",
  "037": "Telangana",
  "099": "Others (please specify)",
};

function formatStateName(value: string | null | undefined): string {
  const v = String(value ?? "").trim();
  if (!v) return "------";
  if (/^\d+$/.test(v)) {
    const key = String(parseInt(v, 10)).padStart(3, "0");
    return KRA_STATE_LABELS[key] ?? v;
  }
  return v;
}
type DefaultAccountConfirm =
  | { type: "bank"; id: number }
  | { type: "demat"; id: number };

function ViewKycDataComponent({ data }: { data: CustomerByIdPayload }) {
  const { cookies } = useAppCookie();
  const queryClient = useQueryClient();
  const [defaultAccountConfirm, setDefaultAccountConfirm] =
    useState<DefaultAccountConfirm | null>(null);
  const isSuperAdmin = cookies.role === "SUPER_ADMIN";
  /** Must match backend `CustomerManageAccountsService.assertKycVerified` (kycStatus, not kraStatus). */
  const canManageDefaultAccounts =
    String(data.kycStatus ?? "").trim().toUpperCase() === "VERIFIED";

  const crmCustomerApi = useMemo(
    () => new apiGateway.crm.customer.CrmCustomerApi(apiClientCaller),
    [],
  );

  const setPrimaryBankMutation = useMutation({
    mutationFn: (bankAccountId: number) =>
      crmCustomerApi.setPrimaryBankAccountAsCrm(data.id, bankAccountId),
    onSuccess: (res) => {
      toast.success(
        (res.data as { message?: string }).message ?? "Primary bank account set.",
      );
      void queryClient.invalidateQueries({ queryKey: ["KycView", data.id] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(
        err?.response?.data?.message ??
        (err instanceof Error ? err.message : "Failed to set primary bank"),
      );
    },
  });

  const setPrimaryDematMutation = useMutation({
    mutationFn: (dematAccountId: number) =>
      crmCustomerApi.setPrimaryDematAccountAsCrm(data.id, dematAccountId),
    onSuccess: (res) => {
      toast.success(
        (res.data as { message?: string }).message ?? "Primary demat account set.",
      );
      void queryClient.invalidateQueries({ queryKey: ["KycView", data.id] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(
        err?.response?.data?.message ??
        (err instanceof Error ? err.message : "Failed to set primary demat"),
      );
    },
  });

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

  const pendingBankRow =
    defaultAccountConfirm?.type === "bank"
      ? data.bankAccounts.find((b) => b.id === defaultAccountConfirm.id)
      : undefined;
  const pendingDematRow =
    defaultAccountConfirm?.type === "demat"
      ? data.dematAccounts.find((d) => d.id === defaultAccountConfirm.id)
      : undefined;

  const confirmDefaultAccount = () => {
    if (!defaultAccountConfirm) return;
    const payload = defaultAccountConfirm;
    setDefaultAccountConfirm(null);
    if (payload.type === "bank") {
      setPrimaryBankMutation.mutate(payload.id);
    } else {
      setPrimaryDematMutation.mutate(payload.id);
    }
  };

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

      {/* KRA path: only standalone Addresses at #aadhaar — no DigiLocker Aadhaar block */}
      {hideAadhaarSection && (
        <div className="scroll-mt-16" id="aadhaar-address">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Addresses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <CardTitle className="text-sm mb-4">Current address</CardTitle>
                {data.currentAddress ? (
                  <AddressCard
                    addressLine1={data.currentAddress.line1 || "------"}
                    addressLine2={data.currentAddress.line2 || undefined}
                    addressLine3={data.currentAddress.line3 || undefined}
                    postOffice={data.currentAddress.postOffice || "-----"}
                    district={data.currentAddress.cityOrDistrict || "------"}
                    stateName={formatStateName(data.currentAddress.state)}
                    pinCode={data.currentAddress.pinCode || "------"}
                    country={data.currentAddress.country || "------"}
                    fullAddress={data.currentAddress.fullAddress || "------"}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No current address available.
                  </p>
                )}
              </div>

              <div>
                <CardTitle className="text-sm mb-4">Permanent address</CardTitle>
                {data.permanentAddress ? (
                  <AddressCard
                    addressLine1={data.permanentAddress.line1 || "------"}
                    addressLine2={data.permanentAddress.line2 || undefined}
                    addressLine3={data.permanentAddress.line3 || undefined}
                    postOffice={data.permanentAddress.postOffice || "-----"}
                    district={data.permanentAddress.cityOrDistrict || "------"}
                    stateName={formatStateName(data.permanentAddress.state)}
                    pinCode={data.permanentAddress.pinCode || "------"}
                    country={data.permanentAddress.country || "------"}
                    fullAddress={data.permanentAddress.fullAddress || "------"}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No permanent address available.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
                  name={`${data.panCard?.firstName || "----"} ${data.panCard?.middleName || ""
                    } ${data.panCard?.lastName || ""}`}
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
                    name={`${data.aadhaarCard?.firstName || "----"} ${data.aadhaarCard?.middleName || ""
                      } ${data.aadhaarCard?.lastName || ""}`}
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
          Name={`${data.panCard?.firstName || "----"} ${data.panCard?.middleName || ""
            } ${data.panCard?.lastName || ""}`}
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
            name={`${data.aadhaarCard?.firstName || "----"} ${data.aadhaarCard?.middleName || ""
              } ${data.aadhaarCard?.lastName || ""}`}
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
                    {isSuperAdmin && canManageDefaultAccounts && !e.isPrimary ? (
                      <div className="flex justify-center mt-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={
                            setPrimaryBankMutation.isPending &&
                            setPrimaryBankMutation.variables === e.id
                          }
                          onClick={() =>
                            setDefaultAccountConfirm({ type: "bank", id: e.id })
                          }
                          className="h-8"
                        >
                          {setPrimaryBankMutation.isPending &&
                            setPrimaryBankMutation.variables === e.id ? (
                            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                          ) : null}
                          Set as default bank
                        </Button>
                      </div>
                    ) : null}
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
            {data.dematAccounts.length === 0 && (
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
                    {isSuperAdmin && canManageDefaultAccounts && !e.isPrimary ? (
                      <div className="flex justify-center mt-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={
                            setPrimaryDematMutation.isPending &&
                            setPrimaryDematMutation.variables === e.id
                          }
                          onClick={() =>
                            setDefaultAccountConfirm({ type: "demat", id: e.id })
                          }
                          className="h-8"
                        >
                          {setPrimaryDematMutation.isPending &&
                            setPrimaryDematMutation.variables === e.id ? (
                            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                          ) : null}
                          Set as default demat
                        </Button>
                      </div>
                    ) : null}
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
                  question={e.qus}
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

      <AlertDialog
        open={defaultAccountConfirm !== null}
        onOpenChange={(open) => {
          if (!open) setDefaultAccountConfirm(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {defaultAccountConfirm?.type === "bank"
                ? "Set default bank account?"
                : "Set default demat account?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {defaultAccountConfirm?.type === "bank" && pendingBankRow ? (
                <>
                  This account will be used as the customer&apos;s primary bank for
                  payouts and orders:{" "}
                  <strong>
                    {pendingBankRow.bankName} · {pendingBankRow.accountNumber}
                  </strong>
                  . Another bank is primary today; it will no longer be default.
                </>
              ) : null}
              {defaultAccountConfirm?.type === "demat" && pendingDematRow ? (
                <>
                  This demat will be the customer&apos;s primary account:{" "}
                  <strong>
                    {pendingDematRow.depositoryName} · DP {pendingDematRow.dpId}{" "}
                    / Client {pendingDematRow.clientId}
                  </strong>
                  . The current primary demat will be unset.
                </>
              ) : null}
              {defaultAccountConfirm &&
                !pendingBankRow &&
                !pendingDematRow ? (
                <>Confirm to set this account as the new default.</>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={(ev) => {
                ev.preventDefault();
                confirmDefaultAccount();
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ViewKycDataComponent;
