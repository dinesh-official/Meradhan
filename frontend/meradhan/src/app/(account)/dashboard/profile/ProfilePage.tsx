"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import apiGateway, { GetCustomerResponseById } from "@root/apiGateway";
import ProfileViewCard from "./_components/ProfileViewCard";
import { useQuery } from "@tanstack/react-query";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import IndividualProfileTabs from "./IndividualProfileTabs";
import CorporateProfileTabs from "./CorporateProfileTabs";

function ProfilePage({
  profileData,
}: {
  profileData: GetCustomerResponseById["responseData"];
}) {
  const customerApi = new apiGateway.crm.customer.CrmCustomerApi(
    apiClientCaller,
  );
  const { data: profile } = useQuery({
    queryKey: ["profile-page", profileData.id],
    initialData: profileData,
    queryFn: async () => {
      const userData = await customerApi.customerInfoById(
        Number(profileData.id),
      );
      return userData.data.responseData;
    },
  });

  const isCorporate = profile.userType === "CORPORATE";

  const { data: corporateKyc } = useQuery({
    queryKey: ["corporate-kyc-profile", profile.id],
    queryFn: async () => {
      const res = await customerApi.getCorporateKyc(profile.id);
      return res.data.responseData;
    },
    enabled: isCorporate,
  });

  return (
    <Card accountMode className="relative gap-0">
      <CardHeader accountMode>
        <ProfileViewCard profile={profile} corporateKyc={corporateKyc} />
      </CardHeader>
      <CardContent accountMode>
        {isCorporate ? (
          <CorporateProfileTabs profile={profile} />
        ) : (
          <IndividualProfileTabs profile={profile} />
        )}
      </CardContent>
    </Card>
  );
}

export default ProfilePage;
