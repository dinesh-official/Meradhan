"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import LabelView from "@/global/elements/wrapper/LabelView";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import StatusBadge from "@/global/elements/wrapper/badges/StatusBadge";
import { hasOneOfPermission } from "@/global/utils/role.utils";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { encodeId } from "@/global/utils/url.utils";
import apiGateway from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import { Building2, IdCardIcon, NotebookPen, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import useAppCookie from "@/hooks/useAppCookie.hook";
import { VerifyCustomerOtpDialog } from "./_components/VerifyCustomerOtpDialog";

function CustomerProfileView({ profileId }: { profileId: number }) {
  const { cookies } = useAppCookie();
  const canViewAllInfo = hasOneOfPermission(cookies.role, ["view:customerkyc"]);
  const [verifyChannel, setVerifyChannel] = useState<"mobile" | "email" | null>(
    null,
  );
  // const [useCustomerFormDataHook, setuseCustomerFormDataHook] = useState<GetCustomerResponseById>()])
  const fetchCustomer = async () => {
    const fetchCustomerProfile = new apiGateway.crm.customer.CrmCustomerApi(
      apiClientCaller
    );
    try {
      const response = await fetchCustomerProfile.customerInfoById(profileId);
      return response.data.responseData;
    } catch {
      // Silently handle error - will show error state in component
    }
  };

  const { data: customer, isLoading } = useQuery({
    queryKey: ["fetchCustomer", profileId],
    queryFn: fetchCustomer,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="w-full h-96 flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col  gap-5">
      <PageInfoBar
        showBack
        title="Customer Profile"
        description="Complete customer information and account details"
        actions={
          <div className="gap-3 flex  justify-center items-center md:w-auto w-full">
            <AllowOnlyView permissions={["view:customerkyc"]}>
              <Button variant="outline" asChild>
                <Link href={`/dashboard/customers/view/${encodeId(profileId)}/kyc`}>
                  <IdCardIcon /> View KYC Data
                </Link>
              </Button>
            </AllowOnlyView>
            {customer?.userType === "CORPORATE" && (
              <AllowOnlyView permissions={["view:customerkyc"]}>
                <Button variant="outline" asChild>
                  <Link
                    href={`/dashboard/customers/view/${encodeId(profileId)}/corporate-kyc`}
                  >
                    <Building2 /> View profile & Corporate KYC
                  </Link>
                </Button>
              </AllowOnlyView>
            )}
            <Button variant="default" asChild>
              <Link href="/dashboard/rfqs/nse">
                <NotebookPen /> View RFQs
              </Link>
            </Button>
          </div>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Customer Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <b className="text-xs block mb-4">Basic Information</b>
          <div className="grid xl:grid-cols-5 md:grid-cols-3 grid-cols-2 gap-5 mb-4">
            <LabelView title="Full Name">
              <p>
                {customer?.firstName} {customer?.middleName}{" "}
                {customer?.lastName}
              </p>
            </LabelView>
            <LabelView title="First Name">
              <p>{customer?.firstName}</p>
            </LabelView>
            <LabelView title="Middle Name">
              <p>{customer?.middleName}</p>
            </LabelView>
            <LabelView title="Last Name">
              <p>{customer?.lastName}</p>
            </LabelView>
            <LabelView title="User Type">
              <p>{customer?.userType}</p>
            </LabelView>
          </div>
          <b className="text-xs block mb-4 mt-7">Contact Information</b>
          <div className="grid xl:grid-cols-5 md:grid-cols-3 grid-cols-2 gap-5 mb-4">
            <LabelView title="Email ID">
              <div className="flex flex-col gap-1">
                <p className="break-all">{customer?.emailAddress || "—"}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge
                    value={
                      customer?.utility.isEmailVerified
                        ? "Verified"
                        : "pending"
                    }
                  />
                  {customer && !customer.utility.isEmailVerified && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 py-0 text-xs"
                      onClick={() => setVerifyChannel("email")}
                    >
                      <ShieldCheck className="size-3" /> Verify
                    </Button>
                  )}
                </div>
              </div>
            </LabelView>
            <LabelView title="Mobile Number">
              <div className="flex flex-col gap-1">
                <p>{customer?.phoneNo || "—"}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge
                    value={
                      customer?.utility.isPhoneVerified
                        ? "Verified"
                        : "pending"
                    }
                  />
                  {customer && !customer.utility.isPhoneVerified && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 py-0 text-xs"
                      onClick={() => setVerifyChannel("mobile")}
                    >
                      <ShieldCheck className="size-3" /> Verify
                    </Button>
                  )}
                </div>
              </div>
            </LabelView>
            <LabelView title="WhatsApp Number">
              <div className="flex flex-row gap-2">
                <p>{customer?.whatsAppNo || "—"}</p>
                <StatusBadge
                  value={
                    customer?.utility.isPhoneVerified ? "Verified" : "pending"
                  }
                />
              </div>
            </LabelView>
          </div>
        </CardContent>
      </Card>

      {customer && verifyChannel !== null && (
        <VerifyCustomerOtpDialog
          // Re-mount the dialog whenever the channel switches so the
          // previous channel's OTP token, cooldown timer and entered
          // digits can never leak into the new channel's verify call.
          key={verifyChannel}
          open
          onOpenChange={(open) => {
            if (!open) setVerifyChannel(null);
          }}
          customerId={profileId}
          channel={verifyChannel}
        />
      )}

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid xl:grid-cols-4 grid-cols-2  gap-5 mb-4">
              <LabelView title="Account Status">
                <StatusBadge
                  value={customer?.utility?.accountStatus ?? "pending"}
                />
              </LabelView>
              <LabelView title="KYC Status">
                <StatusBadge value={customer?.kycStatus ?? "pending"} />
              </LabelView>
              <LabelView title="Terms Accepted">
                <StatusBadge
                  value={
                    customer?.utility.termsAccepted ? "Accepted" : "pending"
                  }
                />
              </LabelView>
              <LabelView title="WhatsApp Notifications">
                <StatusBadge
                  value={
                    customer?.utility.whatsAppNotificationAllow
                      ? "Accepted"
                      : "Pending"
                  }
                />
              </LabelView>
            </div>
          </CardContent>
        </Card>
        {canViewAllInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Account Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-5">
                <LabelView title="Account Created">
                  <p>
                    {customer?.createdAt
                      ? dateTimeUtils.formatDateTime(
                        customer.createdAt,
                        "DD MMMM YYYY hh:mm AA"
                      )
                      : "—"}
                  </p>
                </LabelView>

                <LabelView title="Customer ID">
                  <p>{customer?.userName}</p>
                </LabelView>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default CustomerProfileView;
