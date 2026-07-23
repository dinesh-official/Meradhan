"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { queryClient } from "@/core/config/reactQuery";
import { SelectRoleUser } from "@/global/elements/autocomplete/SelectRoleUser";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { hasOneOfPermission } from "@/global/utils/role.utils";
import { encodeId } from "@/global/utils/url.utils";
import useAppCookie from "@/hooks/useAppCookie.hook";
import apiGateway, { type CrmUsersProfile } from "@root/apiGateway";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Building2,
  IdCardIcon,
  NotebookPen,
  Pencil,
  Phone,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { RelationshipManagerUserInfo } from "../../../_components/RelationshipManagerUserInfo";
import { CustomerProfileTopSection } from "./_components/CustomerProfileTopSection";
import {
  CustomerTimelineCard,
  ProfileSectionCard,
} from "./_components/CustomerAccountSummary";
import { ContactChannelList } from "./_components/ContactChannelList";
import { CustomerCrmRiskProfileSection } from "./_components/CustomerCrmRiskProfileSection";
import { VerifyCustomerOtpDialog } from "./_components/VerifyCustomerOtpDialog";

function CustomerProfileView({ profileId }: { profileId: number }) {
  const { cookies } = useAppCookie();
  const canViewAllInfo = hasOneOfPermission(cookies.role, ["view:customerkyc"]);
  const canEditCustomer = hasOneOfPermission(cookies.role, ["edit:customer"]);
  const [verifyChannel, setVerifyChannel] = useState<"mobile" | "email" | null>(
    null,
  );

  const fetchCustomer = async () => {
    const fetchCustomerProfile = new apiGateway.crm.customer.CrmCustomerApi(
      apiClientCaller,
    );
    const response = await fetchCustomerProfile.customerInfoById(profileId);
    return response.data.responseData;
  };

  const { data: customer, isLoading, isError } = useQuery({
    queryKey: ["fetchCustomer", profileId],
    queryFn: fetchCustomer,
    refetchOnWindowFocus: false,
  });

  const customerApi = new apiGateway.crm.customer.CrmCustomerApi(apiClientCaller);
  const rm = customer?.utility.relationshipManager ?? null;

  const assignRmMutation = useMutation({
    mutationFn: async (relationshipManagerId: number) => {
      const res = await customerApi.updateCustomer(
        { relationshipManagerId },
        String(profileId),
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fetchCustomer", profileId] });
      queryClient.invalidateQueries({ queryKey: ["searchCustomersList"] });
      toast.success("Relationship manager assigned");
    },
    onError: () => {
      toast.error("Failed to assign relationship manager");
    },
  });

  const userType = customer?.userType;
  const isNonIndividual =
    !!userType && userType !== "INDIVIDUAL" && userType !== "INDIVIDUAL_NRI_NRO";

  if (isLoading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!customer || isError) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-3 text-center">
        <p className="text-lg font-medium">Customer not found</p>
        <p className="text-sm text-muted-foreground">
          This profile could not be loaded. It may have been removed.
        </p>
        <Button variant="outline" asChild>
          <Link href="/dashboard/customers">Back to customers</Link>
        </Button>
      </div>
    );
  }

  const encodedId = encodeId(profileId);
  const isCorporate = customer.userType === "CORPORATE";

  return (
    <div className="flex flex-col gap-6">
      <PageInfoBar
        showBack
        title="Customer profile"
        description="Account overview, contact details, and relationship manager"
        actions={
          <div className="flex w-full flex-wrap items-center justify-end gap-2 md:w-auto">
            {canEditCustomer && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/customers/view/${encodedId}/update`}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </Link>
              </Button>
            )}
            <AllowOnlyView permissions={["view:customerkyc"]}>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/customers/view/${encodedId}/kyc`}>
                  <IdCardIcon className="h-4 w-4" />
                  KYC
                </Link>
              </Button>
            </AllowOnlyView>
            {isCorporate && (
              <AllowOnlyView permissions={["view:customerkyc"]}>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/customers/view/${encodedId}/corporate-kyc`}>
                    <Building2 className="h-4 w-4" />
                    Corporate KYC
                  </Link>
                </Button>
              </AllowOnlyView>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/rfqs/nse">
                <NotebookPen className="h-4 w-4" />
                RFQs
              </Link>
            </Button>
          </div>
        }
      />

      <CustomerProfileTopSection customer={customer} showKra={canViewAllInfo} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileSectionCard title="Contact channels" icon={Phone}>
          <ContactChannelList
            email={customer.emailAddress}
            phone={customer.phoneNo}
            whatsApp={customer.whatsAppNo}
            emailVerified={customer.utility.isEmailVerified}
            phoneVerified={customer.utility.isPhoneVerified}
            isNonIndividual={isNonIndividual}
            onVerifyEmail={() => setVerifyChannel("email")}
            onVerifyPhone={() => setVerifyChannel("mobile")}
          />
        </ProfileSectionCard>

        <ProfileSectionCard title="Relationship manager" icon={UserRound}>
          {rm ? (
            <RelationshipManagerUserInfo user={rm} />
          ) : (
            <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-8 text-center">
              <UserRound className="mx-auto h-8 w-8 text-muted-foreground/60" />
              <p className="mt-2 text-sm font-medium">No RM assigned</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Assign a relationship manager to own this account.
              </p>
            </div>
          )}
          {canEditCustomer && (
            <div className="mt-4 border-t pt-4">
              <p className="mb-2 text-xs text-muted-foreground">
                {rm ? "Change relationship manager" : "Assign relationship manager"}
              </p>
              <SelectRoleUser
                role="RELATIONSHIP_MANAGER"
                placeholder={rm?.name ?? "Select relationship manager"}
                value={rm ?? undefined}
                onSelect={(user: CrmUsersProfile | null) => {
                  if (!user || user.id === rm?.id) return;
                  assignRmMutation.mutate(user.id);
                }}
              />
            </div>
          )}
        </ProfileSectionCard>

        <CustomerCrmRiskProfileSection
          profileId={profileId}
          crmRiskProfile={customer.crmRiskProfile ?? null}
          canEdit={canEditCustomer}
        />
      </div>

      {canViewAllInfo && <CustomerTimelineCard customer={customer} />}

      {isNonIndividual && verifyChannel !== null && (
        <VerifyCustomerOtpDialog
          key={verifyChannel}
          open
          onOpenChange={(open) => {
            if (!open) setVerifyChannel(null);
          }}
          customerId={profileId}
          channel={verifyChannel}
        />
      )}
    </div>
  );
}

export default CustomerProfileView;
